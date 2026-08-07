/**
 * QQ 官方 Bot 原生工具 — Agent 主动发文本/图片/视频/文件/语音。
 * NapCat/OneBot 已退役；目标一律为官方 openid（非 QQ 号）。
 *
 * Agent 文案铁律（本文件强制）：
 * - error 必须是完整中文原因 + 下一步，禁止纯错误码、禁止「A 或 B」含糊二选一。
 * - description / Zod.describe 必须写清：必填/可选、格式、示例、优先级、禁止事项。
 */

import { z } from "zod";
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "./types.js";
import { zodParams } from "./zodParams.js";
import { registerNativeDomain } from "./registerDomain.js";
import {
  agentParamError,
  agentToolError,
  TOOL_CORRECT_EXAMPLES,
} from "./agentToolError.js";

/** 非参数类错误（通道/能力）；参数类请用 agentParamError 附带正确示例 */
function agentErr(error: string, extra?: Record<string, unknown>) {
  return agentToolError(error, extra);
}

const EX = TOOL_CORRECT_EXAMPLES;

const TARGET_RULES =
  "【目标怎么填】" +
  "① 当前会话已绑定官方 QQ（channel=qq）：userId/groupId 都不要传，系统自动填目标。" +
  "② 私聊：userId 填用户 openid（长十六进制），不是 QQ 号。" +
  "③ 群聊：groupId 填群 openid；平台若标注「暂不支持群聊」则不要发群。" +
  "④ 禁止把一个用户的 peerId 填进另一个用户的会话。NapCat/OneBot 已退役，不要填数字 QQ 号。";

const RATE_LIMIT_HINT = "官方 Bot 受平台被动回复次数/主动消息频控限制；勿连打。";

const targetFields = {
  userId: z
    .string()
    .describe(
      "【可选】私聊目标：用户 openid（长十六进制）。已绑定 QQ 会话请省略。与 groupId 同时传入时本字段被忽略。",
    )
    .optional(),
  groupId: z
    .string()
    .describe(
      "【可选】群聊目标：群 openid。已绑定 QQ 会话请省略。与 userId 同时传入时只用本字段。",
    )
    .optional(),
};

export const qqDefs: NativeToolDefinition[] = [
  {
    name: "send_qq_text",
    description:
      "主动往 QQ 再推一条纯文本气泡（不经过「最终 assistant 回复」自动回发管道）。" +
      "【什么时候用】进度提醒、与正式答案分开的短通知、从 Web 会话推一条给主人 QQ。" +
      "【什么时候不要用】用户正从 QQ 跟你对话、你准备给出的正式答案——系统会自动回发（思考最多 1 条 + 正文 1 条）。" +
      "禁止把同一段正式答案再用本工具发一遍（会重复气泡并占满 5 秒限速）。" +
      "【必填】text。" +
      TARGET_RULES +
      RATE_LIMIT_HINT +
      "QQ 不渲染 Markdown：不要传 **加粗** / 代码块，用纯文本与换行。",
    parameters: zodParams(
      z.object({
        text: z
          .string()
          .describe(
            "【必填】要发送的纯文本。去首尾空白后不能为空。" +
              "不要传 Markdown。不要把即将自动回发的正式答案再填一遍。",
          ),
        ...targetFields,
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "send_qq_image",
    description:
      "主动往 QQ 发送一张图片。" +
      "【优先做法】若图片属于「最终正式回复」的一部分：在最终 Markdown 写 ![说明](content/uploads/xxx.png)，" +
      "由系统随正文一条发出——更省限速次数、更稳。本工具只用于：额外主动推图、或本轮尚未结束就要先推一张。" +
      "【必填】file。" +
      "【可选】caption：图片发出后会再发一条说明文字（额外占一次 5 秒间隔）；能写进最终正文就不要用 caption。" +
      "【体积】建议压到约 1.5MB 以下；过大常 Timeout。" +
      TARGET_RULES +
      RATE_LIMIT_HINT,
    parameters: zodParams(
      z.object({
        file: z
          .string()
          .describe(
            "【必填】图片来源，二选一规则（按优先级）：" +
              "1) 文件已在本机：相对项目根的路径，例 \"content/uploads/screenshots/a.jpg\"（正斜杠 /，大小写按真实路径）；" +
              "2) 仅当本机没有该文件：完整 http:// 或 https:// URL。" +
              "不要传空字符串。不要只传文件名不含目录。",
          ),
        caption: z
          .string()
          .describe(
            "【可选】图片后的说明纯文本。会另发一条消息并占用限速间隔。" +
              "省略=只发图。不要用 Markdown。",
          )
          .optional(),
        ...targetFields,
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "send_qq_video",
    description:
      "主动往 QQ 发送一段视频。" +
      "【必填】file。建议短视频并先压缩；体积过大易 Timeout，失败后先压缩再调一次，禁止无改动连打。" +
      "【可选】caption：视频后另发说明文字（占限速）。" +
      TARGET_RULES +
      RATE_LIMIT_HINT,
    parameters: zodParams(
      z.object({
        file: z
          .string()
          .describe(
            "【必填】视频来源，优先级：" +
              "1) 本机相对项目根路径，例 \"content/uploads/demo.mp4\"；" +
              "2) 仅当本机无文件时用完整 http(s) URL。" +
              "不要传空串。",
          ),
        caption: z
          .string()
          .describe("【可选】视频后的说明纯文本；省略=只发视频。")
          .optional(),
        ...targetFields,
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "send_qq_file",
    description:
      "主动往 QQ 发送文件（私聊走 upload_private_file，群聊走 upload_group_file）。" +
      "适用：报告 PDF、txt、zip、长文导出。长思考系统可能已自动发过 thinking-*.txt，勿重复发同一文件。" +
      "【必填】file（必须是本机路径，不接受 http URL）。" +
      "【可选】name：用户看到的文件名，例 \"调研报告.txt\"；省略则用路径 basename。" +
      TARGET_RULES +
      RATE_LIMIT_HINT,
    parameters: zodParams(
      z.object({
        file: z
          .string()
          .describe(
            "【必填】本机文件路径。优先相对项目根，例 \"content/uploads/qq-text/report.txt\"。" +
              "调试可用绝对路径。不要传 http/https URL（请先 download_file 落到本地再发）。",
          ),
        name: z
          .string()
          .describe(
            "【可选】展示文件名，含扩展名，例 \"report.txt\"。省略=取 file 的 basename。" +
              "不要含路径分隔符。",
          )
          .optional(),
        ...targetFields,
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "send_qq_voice",
    description:
      "主动往 QQ 发送一条语音（OneBot record；NapCat 会转 silk）。" +
      "【必填】file：本机音频路径（wav/mp3 等），推荐先落到 \"content/uploads/tts/xxx.mp3\" 再传该相对路径。" +
      "适合短确认/摘要；不要把万字长文整段当语音。" +
      TARGET_RULES +
      RATE_LIMIT_HINT,
    parameters: zodParams(
      z.object({
        file: z
          .string()
          .describe(
            "【必填】本机音频路径。优先 \"content/uploads/tts/xxx.mp3\"（相对项目根，正斜杠）。" +
              "不要传 http URL。不要传空串。",
          ),
        ...targetFields,
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "delete_qq_message",
    description:
      "撤回本 Bot 已经发出的一条 QQ 消息（OneBot delete_msg）。" +
      "【必填】messageId：必须来自上一次 send_qq_text / send_qq_image / send_qq_video / send_qq_file / send_qq_voice " +
      "成功返回里的 result.data.message_id（数字或数字字符串均可）。" +
      "没有 message_id 就不要猜、不要编造。" +
      "只能撤本 Bot 自己发的消息，且受 QQ 撤回时限约束；超时/非自己的消息会失败——向用户说明即可，禁止死循环重试。" +
      "撤回不占用发送限速间隔。",
    parameters: zodParams(
      z.object({
        messageId: z
          .union([z.string(), z.number()])
          .describe(
            "【必填】要撤回的 message_id。类型：number 或数字字符串，例 1234567890 或 \"1234567890\"。" +
              "来源：最近一次 send_qq_* 返回的 result.data.message_id。",
          ),
      }),
    ),
    concurrencyClass: "B",
    destructive: true,
  },
];

type OfficialTarget = {
  transport: "official";
  openid: string;
  groupOpenid?: string;
};

function looksLikeOfficialOpenId(id: string): boolean {
  return /^[0-9A-Fa-f]{16,}$/.test(id);
}

async function resolveBindingTarget(
  ctx: NativeToolContext,
): Promise<OfficialTarget | null> {
  if (!ctx.prisma || !ctx.sessionId) return null;
  const { findChannelBindingBySessionId } = await import("../../channelBinding.js");
  const binding = await findChannelBindingBySessionId(ctx.prisma, ctx.sessionId);
  if (!binding || binding.channel !== "qq") return null;
  return {
    transport: "official",
    openid: binding.peerId,
    groupOpenid: binding.chatId || undefined,
  };
}

async function resolveTarget(
  args: Record<string, unknown>,
  ctx: NativeToolContext,
): Promise<OfficialTarget | { error: string }> {
  const userId =
    args.userId != null && String(args.userId).trim() !== ""
      ? String(args.userId).trim()
      : undefined;
  const groupId =
    args.groupId != null && String(args.groupId).trim() !== ""
      ? String(args.groupId).trim()
      : undefined;

  if (!userId && !groupId) {
    const fromBinding = await resolveBindingTarget(ctx);
    if (fromBinding) return fromBinding;
    return agentParamError({
      reason:
        "无法确定发送目标：当前会话没有 QQ 官方绑定，且参数里既没有 userId 也没有 groupId。",
      correctExample: { ...EX.send_qq_text },
      code: "MISSING_TARGET",
      nextStep: "在 QQ 绑定会话里省略目标；或从 Web 主动推时填用户 openid（长十六进制）。",
    });
  }

  if (groupId) {
    if (!looksLikeOfficialOpenId(groupId)) {
      return agentParamError({
        reason:
          "groupId 格式无效：须为官方群 openid（长十六进制）。NapCat/数字群号已退役。",
        got: groupId,
        correctExample: {
          text: "群通知：任务已完成。",
          groupId: "A1B2C3D4E5F6789012345678ABCDEF01",
        },
        code: "INVALID_GROUP_ID",
      });
    }
    return {
      transport: "official",
      openid: userId && looksLikeOfficialOpenId(userId) ? userId : "group",
      groupOpenid: groupId,
    };
  }

  if (!userId || !looksLikeOfficialOpenId(userId)) {
    return agentParamError({
      reason:
        "userId 格式无效：须为官方用户 openid（长十六进制）。不要填 QQ 号；NapCat/OneBot 已退役。",
      got: userId,
      correctExample: { ...EX.send_qq_text },
      code: "INVALID_USER_ID",
    });
  }
  return { transport: "official", openid: userId };
}

const MEDIA_TYPE_CN: Record<"image" | "video" | "file" | "record", string> = {
  image: "图片",
  video: "视频",
  file: "文件",
  record: "语音",
};

function wrapOutboundFailure(
  action: string,
  err: unknown,
  extra?: Record<string, unknown>,
) {
  const detail = err instanceof Error ? err.message : String(err);
  let hint =
    "请根据 detail 判断：文件过大则先压缩；openid/群权限不对则改目标；QQ_BOT_* 未配置则请用户检查 .env 并重启 server。";
  if (/timeout|Timeout|超时/i.test(detail)) {
    hint = "判定为超时：请把媒体压到更小（图片建议 <1.5MB）后只重试一次；禁止无改动连打。";
  } else if (/401|token|access_token|凭证/i.test(detail)) {
    hint = "判定为官方 Bot 凭证问题：请用户核对 QQ_BOT_APP_ID / QQ_BOT_SECRET 后重启；你停止重试。";
  } else if (/403|频控|rate|quota/i.test(detail)) {
    hint = "判定为平台频控：稍后再发，不要连打本工具。";
  }
  return agentErr(`${action}失败：${hint}`, { detail, ...extra });
}

const sendQqText: NativeToolHandler = async (args, ctx) => {
  const text = String(args.text ?? "").trim();
  if (!text) {
    return agentParamError({
      reason: "参数 text 无效：必填，去掉首尾空白后不能为空。请传纯文本（不要 Markdown）。",
      got: args.text,
      correctExample: { ...EX.send_qq_text },
      code: "INVALID_TEXT",
    });
  }
  const target = await resolveTarget(args, ctx);
  if ("error" in target) return target;

  try {
    const { sendQqOfficialText } = await import("../../channels/qqOfficialMedia.js");
    const result = await sendQqOfficialText({
      openid: target.openid,
      groupOpenid: target.groupOpenid,
      text,
    });
    return { ok: true, type: "text", ...target, result };
  } catch (err) {
    return wrapOutboundFailure("发送 QQ 官方文本", err, { ...target });
  }
};

async function sendMedia(
  args: Record<string, unknown>,
  ctx: NativeToolContext,
  type: "image" | "video" | "file" | "record",
): Promise<unknown> {
  const file = String(args.file ?? "").trim();
  const mediaTool =
    type === "image"
      ? "send_qq_image"
      : type === "video"
        ? "send_qq_video"
        : type === "file"
          ? "send_qq_file"
          : "send_qq_voice";
  const mediaExample = { ...EX[mediaTool] };

  if (!file) {
    return agentParamError({
      reason:
        `参数 file 无效：发送${MEDIA_TYPE_CN[type]}时 file 必填且不能为空。` +
        (type === "image" || type === "video"
          ? "本机文件用相对项目根路径；仅当本机没有该文件时才用完整 http(s) URL。"
          : "只接受本机相对项目根路径，不要传空串。"),
      got: args.file,
      correctExample: mediaExample,
      code: "INVALID_FILE",
    });
  }
  if ((type === "file" || type === "record") && /^https?:\/\//i.test(file)) {
    return agentParamError({
      reason:
        `参数 file 不接受网络 URL：${mediaTool} 只接受本机路径。` +
        "请先 download_file 落到 content/uploads/，再传返回的本地相对路径。",
      got: file,
      correctExample: mediaExample,
      code: "FILE_MUST_BE_LOCAL",
    });
  }

  const target = await resolveTarget(args, ctx);
  if ("error" in target) return target;

  const kind =
    type === "image" ? "image" : type === "video" ? "video" : type === "file" ? "file" : "voice";
  try {
    const { sendQqOfficialMedia, sendQqOfficialText } = await import(
      "../../channels/qqOfficialMedia.js"
    );
    const result = await sendQqOfficialMedia({
      openid: target.openid,
      groupOpenid: target.groupOpenid,
      kind,
      file,
      fileName: args.name ? String(args.name) : undefined,
    });
    const caption = args.caption ? String(args.caption).trim() : "";
    if (caption && (type === "image" || type === "video")) {
      try {
        await sendQqOfficialText({
          openid: target.openid,
          groupOpenid: target.groupOpenid,
          text: caption,
        });
      } catch (capErr) {
        return {
          ok: true,
          type,
          file,
          ...target,
          result,
          captionWarning:
            `媒体已发出，说明文字失败：${capErr instanceof Error ? capErr.message : String(capErr)}。` +
            "不要重发媒体；补说明请再调 send_qq_text。",
        };
      }
    }
    return { ok: true, type, file, ...target, result };
  } catch (err) {
    return wrapOutboundFailure(`发送 QQ 官方${MEDIA_TYPE_CN[type]}`, err, {
      type,
      file,
      ...target,
    });
  }
}

const deleteQqMessage: NativeToolHandler = async (args) => {
  const messageId = args.messageId;
  if (messageId == null || messageId === "") {
    return agentParamError({
      reason:
        "参数 messageId 无效：必填。须来自最近一次 send_qq_* 成功返回的 result.data.message_id。" +
        "没有该字段就不要调用撤回。",
      got: messageId,
      correctExample: { ...EX.delete_qq_message },
      code: "INVALID_MESSAGE_ID",
    });
  }
  const idStr = String(messageId).trim();
  if (!/^\d+$/.test(idStr)) {
    return agentParamError({
      reason:
        "参数 messageId 格式无效：必须是数字或数字字符串。请从 send_qq_* 返回的 result.data.message_id 原样填入，不要编造。",
      got: idStr,
      correctExample: { ...EX.delete_qq_message },
      code: "INVALID_MESSAGE_ID",
    });
  }

  return agentErr(
    "QQ 官方 Bot 暂不支持撤回消息（NapCat/OneBot 已退役）。" +
      "请向用户说明无法撤回，并停止调用 delete_qq_message。",
    { messageId },
  );
};

export const qqHandlers: Record<string, NativeToolHandler> = {
  send_qq_text: sendQqText,
  send_qq_image: (args, ctx) => sendMedia(args, ctx, "image"),
  send_qq_video: (args, ctx) => sendMedia(args, ctx, "video"),
  send_qq_file: (args, ctx) => sendMedia(args, ctx, "file"),
  send_qq_voice: (args, ctx) => sendMedia(args, ctx, "record"),
  delete_qq_message: deleteQqMessage,
};

export function registerQqTools(): void {
  registerNativeDomain(qqDefs, qqHandlers);
}
