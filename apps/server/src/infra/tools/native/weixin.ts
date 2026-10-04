/**
 * 微信 ClawBot 主动发送工具。
 *
 * 这里不接触 iLink token，也不自行上传：文件先经 Workspace/hostAccess 权限检查和
 * ChannelAttachment 校验，再交统一传输台账与微信适配器。失败会留下可查询状态，
 * 同一用户消息内重复调用不会重复发送。
 */

import { z } from "zod";
import type { ChannelAttachment } from "@oasismind/shared";
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "./types.js";
import { zodParams } from "./zodParams.js";
import { registerNativeDomain } from "./registerDomain.js";
import { agentParamError, agentToolError } from "./agentToolError.js";
import { resolveAgentFsPath } from "../../writePolicy.js";
import { findChannelBindingBySessionId } from "../../channelBinding.js";
import {
  createTextChannelAttachment,
  materializeLocalChannelAttachment,
  materializeRemoteChannelAttachment,
} from "../../channels/channelAttachment.js";
import {
  deriveChannelIdempotencyKey,
  retryChannelTransfer,
  sendChannelAttachment,
} from "../../channels/channelTransfer.js";
import {
  getChannelTransfer,
  listChannelTransfers,
} from "../../channels/channelTransferLedger.js";

const targetFields = {
  userId: z.string().min(1).describe("可选，微信用户 id；微信绑定会话中可省略").optional(),
  idempotencyKey: z
    .string()
    .min(8)
    .max(200)
    .describe("可选，跨调用重试时复用的幂等键；普通对话自动按当前用户消息生成")
    .optional(),
};

const mediaFields = {
  file: z.string().min(1).describe("必填，本机受控路径；图片/视频也可传完整 http(s) URL"),
  caption: z.string().describe("可选，媒体发送成功后附带的说明文字").optional(),
  name: z.string().describe("可选，文件展示名").optional(),
  ...targetFields,
};

export const weixinDefs: NativeToolDefinition[] = [
  {
    name: "send_weixin_text",
    description: "向当前微信绑定用户发送纯文本；支持显式 userId，发送经过幂等台账。",
    parameters: zodParams(z.object({ text: z.string().min(1).describe("必填，发送正文"), ...targetFields })),
    concurrencyClass: "B",
    destructive: false,
  },
  ...(["image", "video", "file", "voice"] as const).map((kind) => ({
    name: `send_weixin_${kind}`,
    description: `向当前微信绑定用户发送${kind === "image" ? "图片" : kind === "video" ? "视频" : kind === "voice" ? "语音" : "文件"}；本机文件受 Workspace/hostAccess 约束。`,
    parameters: zodParams(z.object(mediaFields)),
    concurrencyClass: "B" as const,
    destructive: false,
  })),
  {
    name: "channel_transfer_status",
    description: "查询 QQ/微信出站台账。传 id 查单条；省略时返回最近记录。不会读取或打印平台凭证。",
    parameters: zodParams(
      z.object({
        id: z.string().uuid().describe("可选，传输 id").optional(),
        limit: z.number().int().min(1).max(50).describe("可选，列表条数，默认 10").optional(),
      }),
    ),
    concurrencyClass: "A",
    destructive: false,
  },
  {
    name: "channel_transfer_retry",
    description: "重试一条 retrySafe=true 的 failed 传输；sent/uncertain 会被拒绝，避免重复发送。",
    parameters: zodParams(z.object({ id: z.string().uuid().describe("必填，channel_transfer_status 返回的传输 id") })),
    concurrencyClass: "B",
    destructive: false,
  },
];

async function resolveWeixinUserId(
  args: Record<string, unknown>,
  ctx: NativeToolContext,
): Promise<string | { error: string; [key: string]: unknown }> {
  const explicit = String(args.userId ?? "").trim();
  if (explicit) return explicit;
  if (ctx.prisma && ctx.sessionId) {
    const binding = await findChannelBindingBySessionId(ctx.prisma, ctx.sessionId);
    if (binding?.channel === "weixin" && binding.peerId) return binding.peerId;
  }
  return agentParamError({
    reason: "无法确定微信发送目标：当前会话没有微信绑定，且未传 userId。",
    code: "MISSING_TARGET",
    correctExample: { text: "任务完成", userId: "微信入站消息中的用户 id" },
  });
}

async function sourceTurnId(
  args: Record<string, unknown>,
  ctx: NativeToolContext,
  attachment: ChannelAttachment,
): Promise<string> {
  const explicit = String(args.idempotencyKey ?? "").trim();
  if (explicit) return `explicit:${explicit}`;
  if (ctx.prisma && ctx.sessionId) {
    const message = await ctx.prisma.chatMessage.findFirst({
      where: { sessionId: ctx.sessionId, role: "user" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (message?.id) return `message:${message.id}`;
  }
  // [OM-FREEPLAY] 无会话时不能判断两次调用是否属于同一用户消息；附件 id 让不同发送互不误伤。
  return `manual:${attachment.id}`;
}

async function dispatch(
  args: Record<string, unknown>,
  ctx: NativeToolContext,
  attachment: ChannelAttachment,
): Promise<unknown> {
  const userId = await resolveWeixinUserId(args, ctx);
  if (typeof userId !== "string") return userId;
  if (attachment.status !== "ready") {
    return agentToolError(`微信附件校验失败：${attachment.error || "未知原因"}`, { attachment });
  }
  const target = { peerId: userId };
  const transfer = await sendChannelAttachment({
    dataDir: ctx.config.dataDir,
    channel: "weixin",
    target,
    attachment,
    idempotencyKey: deriveChannelIdempotencyKey({
      channel: "weixin",
      target,
      sourceTurnId: await sourceTurnId(args, ctx, attachment),
      attachment,
    }),
  });
  if (transfer.record.status !== "sent") {
    return agentToolError(`微信发送失败：${transfer.record.error || transfer.record.status}`, {
      transfer: transfer.record,
    });
  }
  return {
    ok: true,
    attachment: transfer.record.attachment,
    transfer: transfer.record,
    duplicate: transfer.duplicate,
  };
}

const sendWeixinText: NativeToolHandler = async (args, ctx) => {
  const text = String(args.text ?? "").trim();
  if (!text) {
    return agentParamError({
      reason: "参数 text 必填且不能为空。",
      code: "INVALID_TEXT",
      correctExample: { text: "任务完成" },
    });
  }
  return dispatch(args, ctx, createTextChannelAttachment({ text }));
};

function mediaHandler(kind: Exclude<ChannelAttachment["kind"], "text" | "audio"> | "audio"): NativeToolHandler {
  return async (args, ctx) => {
    const file = String(args.file ?? "").trim();
    if (!file) {
      return agentParamError({
        reason: "参数 file 必填且不能为空。",
        code: "INVALID_FILE",
        correctExample: { file: "content/uploads/example.bin" },
      });
    }
    const caption = String(args.caption ?? "").trim() || undefined;
    let attachment: ChannelAttachment;
    try {
      if (/^https?:\/\//i.test(file)) {
        if (kind === "file" || kind === "audio") {
          return agentParamError({
            reason: "微信文件和语音必须先下载到受控本机路径，再发送。",
            code: "FILE_MUST_BE_LOCAL",
            correctExample: { file: "content/uploads/example.bin" },
          });
        }
        attachment = await materializeRemoteChannelAttachment({
          source: "remote",
          remoteUrl: file,
          fileName: String(args.name ?? "").trim() || undefined,
          hintedKind: kind,
          caption,
        });
      } else {
        const resolved = await resolveAgentFsPath(ctx, file, "read");
        attachment = materializeLocalChannelAttachment({
          absPath: resolved.abs,
          source: "agent",
          fileName: String(args.name ?? "").trim() || undefined,
          hintedKind: kind,
          caption,
        });
      }
    } catch (error) {
      return agentToolError(`读取微信待发送附件失败：${error instanceof Error ? error.message : String(error)}`);
    }
    return dispatch(args, ctx, attachment);
  };
}

export const weixinHandlers: Record<string, NativeToolHandler> = {
  send_weixin_text: sendWeixinText,
  send_weixin_image: mediaHandler("image"),
  send_weixin_video: mediaHandler("video"),
  send_weixin_file: mediaHandler("file"),
  send_weixin_voice: mediaHandler("audio"),
  channel_transfer_status: async (args, ctx) => {
    const id = String(args.id ?? "").trim();
    if (id) return { item: getChannelTransfer(ctx.config.dataDir, id) };
    const limit = Number(args.limit ?? 10);
    return { items: listChannelTransfers(ctx.config.dataDir, limit) };
  },
  channel_transfer_retry: async (args, ctx) => {
    const id = String(args.id ?? "").trim();
    if (!id) {
      return agentParamError({
        reason: "参数 id 必填；先调用 channel_transfer_status 获取传输 id。",
        code: "MISSING_TRANSFER_ID",
        correctExample: { id: "00000000-0000-4000-8000-000000000000" },
      });
    }
    try {
      return await retryChannelTransfer({ dataDir: ctx.config.dataDir, transferId: id });
    } catch (error) {
      return agentToolError(`重试传输失败：${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

export function registerWeixinTools(): void {
  registerNativeDomain(weixinDefs, weixinHandlers);
}
