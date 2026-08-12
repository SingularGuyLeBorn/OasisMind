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
import { cosyVoiceSynthZodFields } from "./integration/voice.js";

/** 非参数类错误（通道/能力）；参数类请用 agentParamError 附带正确示例 */
function agentErr(error: string, extra?: Record<string, unknown>) {
  return agentToolError(error, extra);
}

const EX = TOOL_CORRECT_EXAMPLES;

const TARGET_RULES = "绑定会话省略目标；私聊/群填 openid（非 QQ 号）。";
const RATE_LIMIT_HINT = "勿连打（平台限速）。";

const targetFields = {
  userId: z.string().describe("可选，私聊 openid；绑定会话省略").optional(),
  groupId: z.string().describe("可选，群 openid；绑定会话省略").optional(),
  quote: z
    .boolean()
    .describe("可选，true=引用最近入站消息（出现引用条）。与 at 独立；进度勿开。")
    .optional(),
  at: z
    .boolean()
    .describe(
      "可选，true=群聊 @ 当前对话对端（刚说话的人）。默认 false。" +
        "要艾特群里其他人用 atOpenIds（填对方 openid，见消息里的 openid=）。" +
        "不重要消息少艾特。进度强制不艾特。私聊忽略。",
    )
    .optional(),
  atOpenIds: z
    .array(z.string())
    .describe(
      "可选，群聊要艾特的成员 openid 列表（可多人）。与 at 可并用。" +
        "openid 来自【群成员 … | openid=…】或群近况；勿填 QQ 号/昵称。进度忽略。",
    )
    .optional(),
  kind: z
    .enum(["progress", "answer"])
    .describe(
      "progress=过程进度（不抑制系统终稿兜底）；answer=正式回复（发成功后系统不再自动回发）。" +
        "默认 answer。长任务进度必须显式 progress。",
    )
    .optional(),
};

function outboundKind(args: Record<string, unknown>): "progress" | "answer" {
  return args.kind === "progress" ? "progress" : "answer";
}

function looksLikeOpenIdForAt(id: string): boolean {
  // 官方 openid 多为长十六进制；绑定占位 "group" 不能艾特
  return id.length >= 8 && id !== "group" && !/^QQ:\d+/i.test(id);
}

/** 进度强制空；at→对端；atOpenIds→指定成员（可多人） */
function resolveMentionOpenIds(
  args: Record<string, unknown>,
  peerOpenid: string,
): string[] {
  if (outboundKind(args) === "progress") return [];
  const ids: string[] = [];
  const push = (raw?: string) => {
    const id = raw?.trim();
    if (!id || !looksLikeOpenIdForAt(id) || ids.includes(id)) return;
    ids.push(id);
  };
  if (args.at === true) push(peerOpenid);
  const list = args.atOpenIds;
  if (Array.isArray(list)) {
    for (const x of list) push(String(x));
  }
  return ids;
}

/** 进度强制不引用；answer 仅当显式 quote===true（且被动窗仍新鲜才真正带 msg_id） */
function effectiveQuote(args: Record<string, unknown>): boolean {
  if (outboundKind(args) === "progress") return false;
  return args.quote === true;
}

/** at=false 时去掉模型误写进正文的 <@!openid>，避免「参数没开却仍艾特」 */
export function stripQqAtTags(text: string): string {
  return text.replace(/(?:<@![A-Za-z0-9_-]+>\s*)+/g, "").trim();
}

async function noteQqOutbound(
  ctx: NativeToolContext,
  args: Record<string, unknown>,
  textForMatch?: string,
): Promise<void> {
  const { markChannelOutbound } = await import("../../channelOutboundLedger.js");
  markChannelOutbound(ctx.sessionId, "qq", outboundKind(args), textForMatch);
}

/**
 * 群聊显式艾特：正文前缀一个或多个 `<@!openid>`。
 * - 旧用法：`at: true` + `openid`（艾特对端）
 * - 新用法：`openids: [...]`（艾特指定成员，可多人）
 */
export function withQqAtMention(
  text: string,
  opts: {
    at?: boolean;
    openid?: string;
    openids?: string[];
    groupOpenid?: string;
  },
): string {
  if (!opts.groupOpenid) return text;
  const ids: string[] = [];
  const push = (raw?: string) => {
    const id = raw?.trim();
    if (!id || !looksLikeOpenIdForAt(id) || ids.includes(id)) return;
    ids.push(id);
  };
  if (opts.at === true) push(opts.openid);
  for (const id of opts.openids ?? []) push(id);
  if (!ids.length) return text;
  const missing = ids.filter((id) => !text.includes(`<@!${id}>`));
  if (!missing.length) return text;
  const prefix = missing.map((id) => `<@!${id}>`).join(" ");
  const body = text.trim();
  return body ? `${prefix} ${body}` : prefix;
}

async function applyQuoteOpts(
  args: Record<string, unknown>,
  target: { openid: string; groupOpenid?: string },
): Promise<{
  msgId?: string;
  messageReference?: { messageId: string };
  useLastInboundAsPassive?: boolean;
}> {
  // quote 只负责引用条；过期被动窗则放弃引用，改主动消息（长任务仍可发，无需重启）
  if (!effectiveQuote(args)) return {};
  const { peekQqOfficialFreshPassiveMsgId } = await import("../../channels/qqOfficialMedia.js");
  const msgId = peekQqOfficialFreshPassiveMsgId({
    openid: target.openid,
    groupOpenid: target.groupOpenid,
  });
  if (!msgId) {
    // 窗口已过：不带 msg_id，普通气泡照发
    return {};
  }
  return {
    msgId,
    messageReference: { messageId: msgId },
  };
}

export const qqDefs: NativeToolDefinition[] = [
  {
    name: "send_qq_text",
    description:
      "往 QQ 推纯文本。正式答案与进度都用本工具。" +
      "at/quote 默认 false。艾特对端用 at:true；艾特群里其他人用 atOpenIds:[openid,…]。" +
      "不重要消息少艾特；要引用条再用 quote:true（群约5分钟内）。" +
      "进度 kind=progress 强制不艾特，1～3 条极短、勿刷屏。" +
      "正式回复 kind=answer（默认）；发成功后系统不再自动回发。" +
      "若整轮结束你没发过 answer，系统会用终稿兜底（无艾特）。" +
      TARGET_RULES +
      RATE_LIMIT_HINT +
      "纯文本，无 Markdown。",
    parameters: zodParams(
      z.object({
        text: z.string().describe("必填，纯文本；进度宜短（一两句）"),
        ...targetFields,
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "send_qq_image",
    description:
      "主动推送 QQ 图片。正式回复配图优先 Markdown ![ ](content/uploads/…)。建议 <1.5MB。" +
      TARGET_RULES +
      RATE_LIMIT_HINT,
    parameters: zodParams(
      z.object({
        file: z.string().describe("必填，本机路径或 http(s) URL"),
        caption: z.string().describe("可选，另发一条说明").optional(),
        ...targetFields,
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "send_qq_video",
    description: "主动推送 QQ 视频。过大易超时，先压缩。" + TARGET_RULES + RATE_LIMIT_HINT,
    parameters: zodParams(
      z.object({
        file: z.string().describe("必填，本机路径或 http(s) URL"),
        caption: z.string().describe("可选说明").optional(),
        ...targetFields,
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "send_qq_file",
    description: "主动推送 QQ 文件（仅本机路径，勿 http）。" + TARGET_RULES + RATE_LIMIT_HINT,
    parameters: zodParams(
      z.object({
        file: z.string().describe("必填，本机路径"),
        name: z.string().describe("可选展示名").optional(),
        ...targetFields,
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "send_qq_voice",
    description:
      "主动推送 QQ 语音：传 file，或 provider=cosyvoice + text（+ voice）合成。日文 language=ja。" +
      TARGET_RULES +
      RATE_LIMIT_HINT,
    parameters: zodParams(
      z.object({
        file: z.string().describe("可选，本机音频路径").optional(),
        text: z.string().describe("合成必填，朗读文本").optional(),
        provider: z.string().describe("合成时 cosyvoice").optional(),
        voice: z.string().describe("可选 voice_id").optional(),
        ...cosyVoiceSynthZodFields,
        ...targetFields,
      }),
    ),
    concurrencyClass: "A",
    destructive: false,
  },
  {
    name: "delete_qq_message",
    description: "撤回本 Bot 已发消息。messageId 来自 send_qq_* 返回；勿猜、勿死循环重试。",
    parameters: zodParams(
      z.object({
        messageId: z.union([z.string(), z.number()]).describe("必填，send_qq_* 返回的 message_id"),
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
    const quoteOpts = await applyQuoteOpts(args, target);
    const mentionIds = resolveMentionOpenIds(args, target.openid);
    const body = mentionIds.length ? text : stripQqAtTags(text);
    const outboundText = withQqAtMention(body, {
      openids: mentionIds,
      groupOpenid: target.groupOpenid,
    });
    const result = await sendQqOfficialText({
      openid: target.openid,
      groupOpenid: target.groupOpenid,
      text: outboundText,
      ...quoteOpts,
    });
    await noteQqOutbound(ctx, args, outboundText);
    return {
      ok: true,
      type: "text",
      quote: effectiveQuote(args) && Boolean(quoteOpts.msgId),
      at: mentionIds.length > 0,
      atOpenIds: mentionIds,
      kind: outboundKind(args),
      ...target,
      result,
    };
  } catch (err) {
    return wrapOutboundFailure("发送 QQ 官方文本", err, { ...target });
  }
};

async function resolveVoiceFile(
  args: Record<string, unknown>,
  ctx: NativeToolContext,
): Promise<{ file: string } | { error: string; [k: string]: unknown }> {
  const existing = args.file != null ? String(args.file).trim() : "";
  if (existing) return { file: existing };

  const text = args.text != null ? String(args.text).trim() : "";
  const provider = args.provider != null ? String(args.provider).trim() : "";
  const wantsSynth = Boolean(text || provider || args.voice);
  if (!wantsSynth) {
    return agentParamError({
      reason:
        "发送语音须二选一：① 传 file（本机音频路径）；② 传 provider=cosyvoice + voice + text 现场合成。",
      got: { file: args.file, text: args.text, provider: args.provider, voice: args.voice },
      correctExample: { ...EX.send_qq_voice },
      code: "INVALID_FILE",
    });
  }
  if (!text) {
    return agentParamError({
      reason: "合成模式缺少 text：请传要朗读的文本，或改为传已有音频的 file。",
      correctExample: { ...EX.send_qq_voice_synth },
      code: "INVALID_TEXT",
    });
  }
  try {
    const { pickTtsArgsFromTool, synthesizeToUploads } = await import("../../ttsProvider.js");
    const synth = await synthesizeToUploads(ctx.config, {
      text,
      ...pickTtsArgsFromTool(args),
      provider: provider || "cosyvoice",
    });
    return { file: synth.path };
  } catch (err) {
    return agentErr(`CosyVoice 合成失败：${err instanceof Error ? err.message : String(err)}`, {
      code: "TTS_FAILED",
    });
  }
}

async function sendMedia(
  args: Record<string, unknown>,
  ctx: NativeToolContext,
  type: "image" | "video" | "file" | "record",
): Promise<unknown> {
  let file = String(args.file ?? "").trim();
  const mediaTool =
    type === "image"
      ? "send_qq_image"
      : type === "video"
        ? "send_qq_video"
        : type === "file"
          ? "send_qq_file"
          : "send_qq_voice";
  const mediaExample = { ...EX[mediaTool] };

  if (type === "record" && !file) {
    const resolved = await resolveVoiceFile(args, ctx);
    if ("error" in resolved) return resolved;
    file = resolved.file;
  }

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
    const quoteOpts = await applyQuoteOpts(args, target);
    const result = await sendQqOfficialMedia({
      openid: target.openid,
      groupOpenid: target.groupOpenid,
      kind,
      file,
      fileName: args.name ? String(args.name) : undefined,
      ...quoteOpts,
    });
    // 富媒体 content 常被忽略：at 只作用在 image/video 的 caption 文本上
    const captionRaw = args.caption ? String(args.caption).trim() : "";
    const mentionIds = target.groupOpenid
      ? resolveMentionOpenIds(args, target.openid)
      : [];
    const captionBody = mentionIds.length ? captionRaw : stripQqAtTags(captionRaw);
    let captionSent = "";
    if ((type === "image" || type === "video") && (captionBody || mentionIds.length)) {
      const caption = withQqAtMention(captionBody || "（见图）", {
        openids: mentionIds,
        groupOpenid: target.groupOpenid,
      });
      try {
        await sendQqOfficialText({
          openid: target.openid,
          groupOpenid: target.groupOpenid,
          text: caption,
          // 说明文字跟在媒体后，不再重复引用
        });
        captionSent = caption;
      } catch (capErr) {
        await noteQqOutbound(ctx, args, captionBody || file);
        return {
          ok: true,
          type,
          file,
          at: mentionIds.length > 0,
          atOpenIds: mentionIds,
          kind: outboundKind(args),
          ...target,
          result,
          captionWarning:
            `媒体已发出，说明文字失败：${capErr instanceof Error ? capErr.message : String(capErr)}。` +
            "不要重发媒体；补说明请再调 send_qq_text。",
        };
      }
    }
    // 有 caption 用 caption 比对终稿；纯媒体用路径（难匹配文本终稿 → 仍会系统兜底文字，符合预期）
    await noteQqOutbound(ctx, args, captionSent || captionBody || file);
    return {
      ok: true,
      type,
      file,
      at: mentionIds.length > 0,
      atOpenIds: mentionIds,
      quote: effectiveQuote(args) && Boolean(quoteOpts.msgId),
      kind: outboundKind(args),
      ...target,
      result,
    };
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
