/**
 * OneBot v11 通用 IM Adapter（适用于 NapCatQQ / LLOneBot / Go-CQHttp 等成熟 QQ 框架）。
 * 协议规范：https://github.com/botuniverse/onebot-11
 *
 * 功能：
 * - 接收 HTTP 反向 Webhook 入站消息 (/api/webhooks/onebot)
 * - 支持私聊 (private) 与群聊 (group @Bot)
 * - 剥离 CQ 码与 @ 占位，自动清洗文本
 * - 通过 OneBot HTTP API (/send_msg, /send_private_msg, /send_group_msg) 回发 Agent 响应
 * - 安全：可绑定指定 QQ 账号（self_id 校验）、用户白名单、群聊白名单、消息类型过滤、@ 才响应
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  ChannelAdapter,
  ChannelReplyChunk,
  UnifiedMessage,
} from "../messageGateway.js";
import { handleIncomingMessage } from "../messageGateway.js";
import { fetch as undiciFetch, Agent } from "undici";
import { isLoopbackUrl } from "../proxyDispatcher.js";

/** OneBot 本机 API 专用直连 Agent（禁止塞进 Node 全局 fetch 的 dispatcher——会 UND_ERR_INVALID_ARG） */
const oneBotDirectAgent = new Agent({ connect: { timeout: 10_000 } });

/** 会对用户可见、易触发风控的出站接口：强制串行 + 最小间隔 */
const OUTBOUND_PACE_ENDPOINTS = new Set([
  "/send_private_msg",
  "/send_group_msg",
  "/send_msg",
  "/upload_private_file",
  "/upload_group_file",
]);

let outboundLastAt = 0;
let outboundChain: Promise<unknown> = Promise.resolve();

/** 两条出站消息最小间隔（默认 5000ms；ONEBOT_SEND_MIN_INTERVAL_MS 可覆盖，0=关闭） */
export function outboundMinIntervalMs(): number {
  const n = Number(process.env.ONEBOT_SEND_MIN_INTERVAL_MS ?? "5000");
  if (!Number.isFinite(n) || n < 0) return 5000;
  return Math.floor(n);
}

/** 出站串行链：等满间隔 → 发完才放行下一条（防风控并发穿透） */
function enqueueOutbound<T>(endpoint: string, run: () => Promise<T>): Promise<T> {
  if (!OUTBOUND_PACE_ENDPOINTS.has(endpoint) || outboundMinIntervalMs() <= 0) {
    return run();
  }
  const minGap = outboundMinIntervalMs();
  const task = outboundChain.then(async () => {
    const wait = Math.max(0, outboundLastAt + minGap - Date.now());
    if (wait > 0) {
      console.log(`[onebot] 发送限速：距上次出站不足 ${minGap}ms，等待 ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
    try {
      return await run();
    } finally {
      outboundLastAt = Date.now();
    }
  }) as Promise<T>;
  outboundChain = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

export function __resetOneBotOutboundPaceForTests(): void {
  outboundLastAt = 0;
  outboundChain = Promise.resolve();
}

export type OneBotOutboundRecord = {
  messageId: string;
  at: number;
  endpoint: string;
  userId?: string;
  groupId?: string;
};

const recentOutboundMsgs: OneBotOutboundRecord[] = [];
const MAX_RECENT_OUTBOUND = 64;

function rememberOutboundMessage(
  endpoint: string,
  payload: Record<string, unknown>,
  json: { data?: { message_id?: string | number } },
): void {
  const mid = json?.data?.message_id;
  if (mid == null || mid === "") return;
  recentOutboundMsgs.unshift({
    messageId: String(mid),
    at: Date.now(),
    endpoint,
    userId: payload.user_id != null ? String(payload.user_id) : undefined,
    groupId: payload.group_id != null ? String(payload.group_id) : undefined,
  });
  if (recentOutboundMsgs.length > MAX_RECENT_OUTBOUND) {
    recentOutboundMsgs.length = MAX_RECENT_OUTBOUND;
  }
}

export function listRecentOutboundMessages(limit = 20): OneBotOutboundRecord[] {
  return recentOutboundMsgs.slice(0, Math.max(1, limit));
}

async function saveOneBotImageLocally(url: string): Promise<string | null> {
  if (!url || !url.startsWith("http")) {
    console.log(`[onebot] 跳过非 HTTP 图片 URL: ${url}`);
    return null;
  }
  try {
    console.log(`[onebot] 正在下载图片: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[onebot] 下载图片失败 HTTP ${res.status}: ${url}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd().includes("apps") ? path.join(process.cwd(), "../..") : process.cwd());
    const uploadsDir = path.resolve(projectRoot, "content/uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `qq-img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ [onebot] 图片已转存至本地: /uploads/${filename}`);

    return `/uploads/${filename}`;
  } catch (err) {
    console.warn(`[onebot] 图片下载保存异常 (${url}):`, err instanceof Error ? err.message : err);
    return null;
  }
}

function resolveProjectRoot(): string {
  return (
    process.env.PROJECT_ROOT ||
    path.resolve(process.cwd().includes("apps") ? path.join(process.cwd(), "../..") : process.cwd())
  );
}

/** 把项目内相对路径（如 /uploads/xxx.png）转成绝对路径，供 OneBot 本地文件发送 */
export function resolveOneBotFilePath(input: string): string {
  if (!input || typeof input !== "string") return "";
  if (/^https?:\/\//i.test(input)) return input;
  if (path.isAbsolute(input)) return input.replace(/\\/g, "/");
  let rel = input;
  if (rel.startsWith("/")) rel = rel.slice(1);
  // /uploads/... → content/uploads/...
  if (rel.startsWith("uploads/")) rel = `content/${rel}`;
  return path.resolve(resolveProjectRoot(), rel).replace(/\\/g, "/");
}

/** 从 Markdown/文本中提取要发送的图片 URL/路径 */
export function extractImageUrlsFromMarkdown(text: string): string[] {
  const urls: string[] = [];
  const regex = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) urls.push(match[1].trim());
  }
  return urls;
}

/** 从文本中移除 Markdown 图片语法，保留 alt 文本作为纯文本提示 */
export function stripMarkdownImages(text: string): string {
  return text.replace(/!\[([^\]]*)\]\([^)]+\)/g, (__, alt) => (alt ? `[图片：${alt}]` : ""));
}

/** QQ 不渲染 Markdown：清洗为纯文本 */
export function mdToPlain(s: string): string {
  return (
    s
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/(\*\*|__)(.+?)\1/g, "$2")
      .replace(/(\*|_)(.+?)\1/g, "$2")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "")
      .replace(/^\s*>\s+/gm, "")
      .replace(/^\s*-{3,}\s*$/gm, "---")
  );
}

/** 思考过程超过此字数 → 发 txt 文件（可用 ONEBOT_THINKING_TXT_CHARS 覆盖） */
export function thinkingTxtThreshold(): number {
  const n = Number(process.env.ONEBOT_THINKING_TXT_CHARS || "1200");
  return Number.isFinite(n) && n >= 20 ? Math.floor(n) : 1200;
}

export function answerMaxChars(): number {
  const n = Number(process.env.ONEBOT_ANSWER_MAX_CHARS || "4500");
  return Number.isFinite(n) && n >= 200 ? Math.floor(n) : 4500;
}

export type OneBotReplyPlan =
  | { kind: "thinking_text"; text: string }
  | { kind: "thinking_file"; fileName: string; content: string }
  | { kind: "answer"; text: string; imageUrls: string[] };

/**
 * 规划 QQ 回发：最多两条——① 思考过程（短文本 / 长则 txt 文件）② 正式回复。
 * 无思考时仅一条正式回复。
 */
export function planOneBotReply(opts: {
  reasoning?: string;
  answer: string;
  thinkingTxtThreshold?: number;
  answerMaxChars?: number;
}): OneBotReplyPlan[] {
  const plans: OneBotReplyPlan[] = [];
  const plainReasoning = opts.reasoning?.trim() ? mdToPlain(opts.reasoning.trim()) : "";
  const imageUrls = extractImageUrlsFromMarkdown(opts.answer || "");
  const plainAnswer = mdToPlain(stripMarkdownImages(opts.answer || "")) || "（空回复）";
  const threshold = opts.thinkingTxtThreshold ?? thinkingTxtThreshold();
  const maxAnswer = opts.answerMaxChars ?? answerMaxChars();

  if (plainReasoning) {
    if (plainReasoning.length > threshold) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      plans.push({
        kind: "thinking_file",
        fileName: `thinking-${stamp}.txt`,
        content: plainReasoning,
      });
    } else {
      plans.push({
        kind: "thinking_text",
        text: `【思考过程】\n${plainReasoning}`,
      });
    }
  }

  const answerText =
    plainAnswer.length > maxAnswer
      ? `${plainAnswer.slice(0, maxAnswer)}\n…（正文过长已截断）`
      : plainAnswer;
  plans.push({ kind: "answer", text: answerText, imageUrls });
  return plans;
}

/** 将长思考写入 content/uploads/qq-text/，返回绝对路径 */
export function writeThinkingTxtFile(fileName: string, content: string): string {
  const dir = path.resolve(resolveProjectRoot(), "content/uploads/qq-text");
  fs.mkdirSync(dir, { recursive: true });
  const safe = fileName.replace(/[^\w.\-]+/g, "_");
  const abs = path.join(dir, safe);
  fs.writeFileSync(abs, content, "utf8");
  return abs.replace(/\\/g, "/");
}

export type OneBotMediaType = "image" | "video" | "file" | "record";

export type OneBotMediaPayload = {
  userId?: string | number;
  groupId?: string | number;
  file: string;
  /** 文件发送时的显示名（可选） */
  name?: string;
  caption?: string;
  type: OneBotMediaType;
};

export type OneBotMessageType = "text" | "image" | "at" | "reply" | "file" | "other";

export type OneBotConfig = {
  httpUrl: string;
  accessToken: string;
  secret: string;
  enabled: boolean;
  allowedUsers: string[];
  /** 指定本 Bot 的 QQ 账号；收到 self_id 不匹配的消息会忽略 */
  qqAccount?: string;
  /** 群聊白名单；空=拒绝所有群；*=允许所有群 */
  allowedGroups: string[];
  /** 群内允许的消息类型；默认 text */
  groupMessageTypes: OneBotMessageType[];
  /** 群内是否需要 @ 本 Bot 才响应；默认 true */
  groupRequireAt: boolean;
};

/** 从 message / raw_message 中提取文本、图片、以及用于过滤的元信息 */
function parseOneBotMessage(body: Record<string, unknown>): {
  textParts: string[];
  imageUrls: string[];
  types: Set<OneBotMessageType>;
  atSelf: boolean;
} {
  const textParts: string[] = [];
  const imageUrls: string[] = [];
  const types = new Set<OneBotMessageType>();
  let atSelf = false;
  const selfId = String(body.self_id ?? "");

  if (Array.isArray(body.message)) {
    for (const seg of body.message as any[]) {
      const type = String(seg.type ?? "");
      if (type === "text") {
        types.add("text");
        if (seg.data?.text) textParts.push(seg.data.text);
      } else if (type === "image") {
        types.add("image");
        const imgUrl = seg.data?.url || (seg.data?.file?.startsWith("http") ? seg.data.file : "");
        if (imgUrl) imageUrls.push(imgUrl);
      } else if (type === "at") {
        types.add("at");
        if (selfId && String(seg.data?.qq ?? "") === selfId) atSelf = true;
      } else if (type === "reply") {
        types.add("reply");
      } else if (type === "file") {
        types.add("file");
      } else {
        types.add("other");
      }
    }
  } else if (typeof body.raw_message === "string" && body.raw_message) {
    let raw = body.raw_message;

    // 提取 CQ:image 中的 url
    const cqImgRegex = /\[CQ:image,[^\]]*url=([^,\]]+)/g;
    let match: RegExpExecArray | null;
    while ((match = cqImgRegex.exec(raw)) !== null) {
      if (match[1]) imageUrls.push(match[1]);
    }

    // 检测 @ 本 Bot
    if (selfId) {
      const atRegex = new RegExp(`\\[CQ:at,qq=${selfId}\\]`);
      if (atRegex.test(raw)) atSelf = true;
    }

    // 检测消息类型
    if (/\[CQ:image,/.test(raw)) types.add("image");
    if (/\[CQ:at,/.test(raw)) types.add("at");
    if (/\[CQ:reply,/.test(raw)) types.add("reply");
    if (/\[CQ:file,/.test(raw)) types.add("file");
    if (/\[CQ:[^\]]+\]/.test(raw)) types.add("other");
    if (raw.replace(/\[CQ:[^\]]+\]/g, "").trim()) types.add("text");

    // 清洗 CQ 码
    raw = raw.replace(/\[CQ:at,qq=[^\]]+\]/g, "").trim();
    raw = raw.replace(/\[CQ:[^\]]+\]/g, "").trim();
    if (raw) textParts.push(raw);
  } else if (typeof body.message === "string" && body.message) {
    // 兜底：message 是字符串
    textParts.push(body.message);
    types.add("text");
  }

  return { textParts, imageUrls, types, atSelf };
}

export function createOneBotAdapter(cfg: OneBotConfig): ChannelAdapter {
  let state = "disconnected";
  let lastError: string | undefined;
  const openMode = cfg.allowedUsers.includes("*");
  if (openMode) {
    console.log("[onebot] 白名单模式：允许所有用户（ONEBOT_ALLOWED_USERS=*）");
  } else if (cfg.allowedUsers.length > 0) {
    console.log(`[onebot] 白名单模式：仅允许 ${cfg.allowedUsers.length} 个 QQ 号（${cfg.allowedUsers.join(",")}）`);
  } else {
    console.log("[onebot] 白名单模式：未配置白名单，拒绝所有用户");
  }
  if (cfg.qqAccount) {
    console.log(`[onebot] 强制绑定 QQ 账号：${cfg.qqAccount}（self_id 不匹配则忽略）`);
  }
  if (cfg.allowedGroups.includes("*")) {
    console.log("[onebot] 群聊模式：允许所有群聊");
  } else if (cfg.allowedGroups.length > 0) {
    console.log(`[onebot] 群聊模式：仅允许 ${cfg.allowedGroups.length} 个群（${cfg.allowedGroups.join(",")}）`);
  } else {
    console.log("[onebot] 群聊模式：未配置群聊白名单，拒绝所有群聊");
  }
  console.log(`[onebot] 群聊消息类型：${cfg.groupMessageTypes.join(",") || "none"}；需@：${cfg.groupRequireAt}`);

  const replyCtx = new Map<
    string,
    { userId: string; groupId?: string; isGroup: boolean; msgId: string }
  >();

  const ingestText = (opts: {
    userId: string;
    text: string;
    msgId: string;
    groupId?: string;
  }) => {
    const openMode = cfg.allowedUsers.includes("*");
    const allowed = openMode || cfg.allowedUsers.includes(opts.userId);
    if (!allowed) {
      return;
    }
    const text = opts.text.trim();
    if (!text) return;

    // peerId = 发送者 QQ 号（绝不设为群号）：ChannelBinding 唯一键 (channel, peerId, chatId)
    // → 不同 QQ 号必然落到不同 ChatSession，群内同群异人也不混会话。
    const msg: UnifiedMessage = {
      envelope: {
        channel: "onebot",
        peerId: opts.userId,
        chatId: opts.groupId,
        timestamp: new Date().toISOString(),
      },
      payload: { text },
      meta: { eventId: opts.msgId, replyTo: opts.msgId },
    };

    replyCtx.set(opts.msgId, {
      userId: opts.userId,
      groupId: opts.groupId,
      isGroup: Boolean(opts.groupId),
      msgId: opts.msgId,
    });

    handleIncomingMessage(msg)
      .then((r) => {
        if (!r.ok) console.warn(`[onebot] 入站失败: ${r.error}`);
      })
      .catch((err) => {
        console.warn(`[onebot] 入站异常:`, err instanceof Error ? err.message : err);
      });
  };

  /** 校验 X-Signature (SHA1 HMAC) Signature */
  const verifySignature = (rawBody: Buffer | string, signatureHeader: string): boolean => {
    if (!cfg.secret) return true;
    if (!signatureHeader) return false;
    const expectedSig = "sha1=" + crypto.createHmac("sha1", cfg.secret).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSig));
  };

  /** 供 Express webhook 调用 */
  const ingestWebhookPayload = (body: unknown, rawBody?: Buffer | string, signatureHeader?: string) => {
    if (cfg.secret && rawBody && signatureHeader) {
      if (!verifySignature(rawBody, signatureHeader)) {
        return { ok: false as const, error: "OneBot 签名校验失败 (X-Signature)" };
      }
    }

    const b = body as Record<string, unknown>;
    const postType = String(b.post_type ?? "");
    if (postType !== "message") {
      // 忽略 notice, meta_event (如 heartbeat)
      return { ok: true as const, ignored: true };
    }

    const selfId = String(b.self_id ?? "").trim();
    if (cfg.qqAccount && selfId !== cfg.qqAccount) {
      return {
        ok: false as const,
        error: `self_id 不匹配：收到 ${selfId || "(empty)"}，配置要求 ${cfg.qqAccount}`,
      };
    }

    const messageType = String(b.message_type ?? "");
    const userId = String(b.user_id ?? "").trim();
    const groupId = b.group_id ? String(b.group_id).trim() : undefined;
    const msgId = String(b.message_id ?? crypto.randomUUID());

    const isGroup = messageType === "group";

    if (isGroup && groupId) {
      // 群聊白名单
      const groupOpenMode = cfg.allowedGroups.includes("*");
      const groupAllowed = groupOpenMode || cfg.allowedGroups.includes(groupId);
      if (!groupAllowed) {
        // 非白名单群消息极多：静默忽略，禁止刷控制台
        return { ok: true as const, ignored: true };
      }
    }

    // 异步解析消息中的文本、图片 (CQ 码 / Segment 数组)
    (async () => {
      const parsed = parseOneBotMessage(b);
      const { textParts, imageUrls: imageUrlsToDownload, types, atSelf } = parsed;

      // 群聊消息类型过滤 + @ 要求
      if (isGroup && groupId) {
        if (cfg.groupMessageTypes.length > 0) {
          const allowedSet = new Set(cfg.groupMessageTypes);
          // 若消息只包含 text，且 text 未在白名单，忽略；但 text 通常与 at 共存，需同时允许
          const relevantTypes = new Set([...types]);
          relevantTypes.delete("other"); // other 不纳入过滤，避免误判纯文本里夹带未知段
          const hasAllowed = [...relevantTypes].some((t) => allowedSet.has(t));
          if (!hasAllowed) {
            return;
          }
        }
        if (cfg.groupRequireAt && !atSelf) {
          return;
        }
      }

      // 下载并保存本地图片
      const localImageMarkdownList: string[] = [];
      for (const imgUrl of imageUrlsToDownload) {
        const localPath = await saveOneBotImageLocally(imgUrl);
        if (localPath) {
          localImageMarkdownList.push(`![QQ图片](${localPath})`);
        }
      }

      let combinedText = textParts.join("\n").trim();
      if (localImageMarkdownList.length > 0) {
        combinedText = combinedText
          ? `${combinedText}\n\n${localImageMarkdownList.join("\n")}`
          : localImageMarkdownList.join("\n");
      }

      if (!userId || !combinedText) {
        console.warn("[onebot] 缺少 user_id 或有效内容/图片，跳过处理");
        return;
      }

      ingestText({
        userId,
        text: combinedText,
        msgId,
        groupId: isGroup ? groupId : undefined,
      });
    })().catch((err) => {
      console.error("[onebot] 异步解析 Webhook 消息失败:", err);
    });

    return { ok: true as const };
  };

  const adapter: ChannelAdapter & {
    ingestWebhookPayload: typeof ingestWebhookPayload;
    sendOneBotApi: (endpoint: string, payload: Record<string, unknown>) => Promise<unknown>;
    /** 撤回本 Bot 已发出的消息（NapCat delete_msg；通常仅能撤自己的） */
    deleteMessage: (messageId: string | number) => Promise<unknown>;
    sendImage: (payload: Omit<OneBotMediaPayload, "type">) => Promise<unknown>;
    sendVideo: (payload: Omit<OneBotMediaPayload, "type">) => Promise<unknown>;
    sendFile: (payload: Omit<OneBotMediaPayload, "type">) => Promise<unknown>;
    sendRecord: (payload: Omit<OneBotMediaPayload, "type">) => Promise<unknown>;
    sendOneBotMedia: (payload: OneBotMediaPayload) => Promise<unknown>;
  } = {
    channel: "onebot",
    name: "OneBot v11 (NapCatQQ / LLOneBot)",
    enabled: cfg.enabled,
    getStatus: () => ({
      state: cfg.enabled ? state : "disconnected",
      detail: cfg.enabled ? `url=${cfg.httpUrl}${cfg.qqAccount ? ` account=${cfg.qqAccount}` : ""}` : "未配置",
      lastError,
    }),
    start: async () => {
      if (!cfg.enabled) return;
      state = "connected";
      lastError = undefined;
      if (cfg.qqAccount) {
        // NapCat 冷启动常见 502：短重试，避免误报「登录校验失败」
        let lastMsg = "";
        for (let attempt = 1; attempt <= 5; attempt++) {
          try {
            const info = (await adapter.sendOneBotApi("/get_login_info", {})) as {
              data?: { user_id?: string | number; self_id?: string | number };
            };
            const selfId = String(info.data?.user_id ?? info.data?.self_id ?? "");
            if (selfId && selfId !== cfg.qqAccount) {
              throw new Error(`当前登录账号 ${selfId} 与配置 ${cfg.qqAccount} 不匹配`);
            }
            if (selfId) {
              console.log(`[onebot] 登录账号校验通过：${selfId}`);
            }
            lastMsg = "";
            break;
          } catch (err) {
            lastMsg = err instanceof Error ? err.message : String(err);
            const retryable = /HTTP 502|ECONNREFUSED|fetch failed|socket/i.test(lastMsg);
            if (!retryable || attempt === 5) break;
            await new Promise((r) => setTimeout(r, 800 * attempt));
          }
        }
        if (lastMsg) {
          console.warn(`[onebot] 登录账号校验失败: ${lastMsg}`);
          lastError = lastMsg;
        }
      }
    },
    stop: async () => {
      state = "disconnected";
    },
    sendOneBotApi: async (endpoint: string, payload: Record<string, unknown>) => {
      if (!cfg.httpUrl) throw new Error("OneBot HTTP URL 未配置");
      const baseUrl = cfg.httpUrl.endsWith("/") ? cfg.httpUrl.slice(0, -1) : cfg.httpUrl;
      const url = `${baseUrl}${endpoint}`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (cfg.accessToken) {
        headers["Authorization"] = `Bearer ${cfg.accessToken}`;
      }

      const doFetch = async () => {
        // 必须用 undici.fetch + 本机 Agent 直连：
        // 1) 旧全局 ProxyAgent 会把 127.0.0.1 拐进 Clash → HTTP 502
        // 2) 给 Node 全局 fetch 塞 dispatcher:Agent → UND_ERR_INVALID_ARG / fetch failed
        const res = isLoopbackUrl(url)
          ? await undiciFetch(url, {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
              dispatcher: oneBotDirectAgent,
            })
          : await undiciFetch(url, {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
            });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`OneBot API ${endpoint} HTTP ${res.status}: ${text.slice(0, 200)}`);
        }

        const json = (await res.json().catch(() => ({}))) as {
          retcode?: number;
          status?: string;
          message?: string;
          wording?: string;
          data?: { message_id?: string | number };
        };
        if (typeof json.retcode === "number" && json.retcode !== 0) {
          throw new Error(
            `OneBot API ${endpoint} retcode=${json.retcode}: ${json.message || json.wording || json.status || ""}`,
          );
        }
        rememberOutboundMessage(endpoint, payload, json);
        return json;
      };

      return enqueueOutbound(endpoint, doFetch);
    },
    deleteMessage: async function (messageId: string | number) {
      // 撤回不计入发信风控间隔（不入 OUTBOUND_PACE_ENDPOINTS）
      return this.sendOneBotApi("/delete_msg", {
        message_id: Number(messageId) || messageId,
      });
    },
    sendOneBotMedia: async function (payload: OneBotMediaPayload) {
      if (!cfg.enabled) {
        throw new Error(
          "OneBot 适配器未启用：请确认 .env 中 ONEBOT_ENABLED 不为 false，并整栈重启 server。",
        );
      }
      const target = payload.groupId ?? payload.userId;
      if (!target) {
        throw new Error(
          "发送媒体缺少目标：群聊必须有 groupId，私聊必须有 userId（数字 QQ/群号）。当前两者都空。",
        );
      }
      const filePath = resolveOneBotFilePath(payload.file);
      if (!filePath) {
        throw new Error(
          "file 无效：解析后为空。请传本机相对项目根路径（例 content/uploads/a.png）或完整 http(s) URL。",
        );
      }

      // 私聊/群文件：优先走 upload_*_file（NapCat 稳）；失败再降级 segment
      if (payload.type === "file") {
        const name = payload.name || path.basename(filePath);
        try {
          if (payload.groupId) {
            return await this.sendOneBotApi("/upload_group_file", {
              group_id: Number(payload.groupId) || payload.groupId,
              file: filePath,
              name,
            });
          }
          return await this.sendOneBotApi("/upload_private_file", {
            user_id: Number(payload.userId) || payload.userId,
            file: filePath,
            name,
          });
        } catch (err) {
          console.warn(
            `[onebot] upload_*_file 失败，降级 file segment:`,
            err instanceof Error ? err.message : err,
          );
        }
      }

      const data: Record<string, string> = { file: filePath };
      if (payload.type === "file" && payload.name) data.name = payload.name;
      const segment = { type: payload.type, data };
      if (payload.groupId) {
        return this.sendOneBotApi("/send_group_msg", {
          group_id: Number(payload.groupId) || payload.groupId,
          message: [segment],
        });
      }
      return this.sendOneBotApi("/send_private_msg", {
        user_id: Number(payload.userId) || payload.userId,
        message: [segment],
      });
    },
    sendImage: async function (payload: Omit<OneBotMediaPayload, "type">) {
      return this.sendOneBotMedia({ ...payload, type: "image" });
    },
    sendVideo: async function (payload: Omit<OneBotMediaPayload, "type">) {
      return this.sendOneBotMedia({ ...payload, type: "video" });
    },
    sendFile: async function (payload: Omit<OneBotMediaPayload, "type">) {
      return this.sendOneBotMedia({ ...payload, type: "file" });
    },
    sendRecord: async function (payload: Omit<OneBotMediaPayload, "type">) {
      return this.sendOneBotMedia({ ...payload, type: "record" });
    },
    reply: async function (msg: UnifiedMessage, chunk: ChannelReplyChunk) {
      // 只发送最终完整回复；QQ 不适合流式分片刷屏，中间 chunk 全部忽略。
      if (!chunk.finish) return;

      const ctx = replyCtx.get(msg.meta.eventId) ?? {
        userId: msg.envelope.peerId,
        groupId: msg.envelope.chatId,
        isGroup: Boolean(msg.envelope.chatId),
        msgId: msg.meta.eventId,
      };

      const plans = planOneBotReply({
        reasoning: chunk.reasoning,
        answer: chunk.text || "",
      });

      const sendTextOrSegments = async (message: unknown) => {
        if (ctx.isGroup && ctx.groupId) {
          await this.sendOneBotApi("/send_group_msg", {
            group_id: Number(ctx.groupId) || ctx.groupId,
            message,
          });
        } else {
          await this.sendOneBotApi("/send_private_msg", {
            user_id: Number(ctx.userId) || ctx.userId,
            message,
          });
        }
      };

      // 严格按计划发送：有思考则先思考后正文，合计最多 2 条（长思考用文件顶替思考文本条）
      for (const plan of plans) {
        if (plan.kind === "thinking_text") {
          await sendTextOrSegments(plan.text);
        } else if (plan.kind === "thinking_file") {
          const abs = writeThinkingTxtFile(plan.fileName, plan.content);
          await this.sendOneBotMedia({
            type: "file",
            file: abs,
            name: plan.fileName,
            userId: ctx.isGroup ? undefined : ctx.userId,
            groupId: ctx.isGroup ? ctx.groupId : undefined,
          });
        } else {
          const imageSegments = plan.imageUrls
            .map((url) => ({
              type: "image" as const,
              data: { file: resolveOneBotFilePath(url) },
            }))
            .filter((s) => s.data.file);
          const textSeg = { type: "text" as const, data: { text: plan.text } };
          let message: unknown = plan.text;
          if (imageSegments.length > 0) {
            message =
              ctx.isGroup && ctx.groupId
                ? [{ type: "reply", data: { id: ctx.msgId } }, textSeg, ...imageSegments]
                : [textSeg, ...imageSegments];
          } else if (ctx.isGroup && ctx.groupId) {
            message = [
              { type: "reply", data: { id: ctx.msgId } },
              textSeg,
            ];
          }
          try {
            await sendTextOrSegments(message);
          } catch (err) {
            // 群 reply 段失败时降级纯文本
            if (ctx.isGroup && ctx.groupId) {
              await sendTextOrSegments(plan.text);
            } else {
              throw err;
            }
          }
        }
      }

      replyCtx.delete(msg.meta.eventId);
    },
    ingestWebhookPayload,
  };

  return adapter;
}

export function loadOneBotConfigFromEnv(): OneBotConfig {
  const httpUrl = (process.env.ONEBOT_HTTP_URL || "").trim();
  const accessToken = (process.env.ONEBOT_ACCESS_TOKEN || "").trim();
  const secret = (process.env.ONEBOT_SECRET || "").trim();
  const allowed = (process.env.ONEBOT_ALLOWED_USERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const enabled = process.env.ONEBOT_ENABLED !== "false";
  const qqAccount = (process.env.ONEBOT_QQ_ACCOUNT || "").trim();
  const allowedGroups = (process.env.ONEBOT_ALLOWED_GROUPS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const groupMessageTypes = (process.env.ONEBOT_GROUP_MESSAGE_TYPES || "text")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as OneBotMessageType[];
  const groupRequireAt = (process.env.ONEBOT_GROUP_REQUIRE_AT || "true").trim().toLowerCase() !== "false";

  return {
    httpUrl: httpUrl || "http://127.0.0.1:3001",
    accessToken,
    secret,
    enabled,
    allowedUsers: allowed,
    qqAccount: qqAccount || undefined,
    allowedGroups,
    groupMessageTypes: groupMessageTypes.length > 0 ? groupMessageTypes : ["text"],
    groupRequireAt,
  };
}

export function getOneBotAdapterIngest(
  adapter: ChannelAdapter,
): ((body: unknown, rawBody?: Buffer | string, signature?: string) => { ok: boolean; error?: string }) | null {
  const a = adapter as ChannelAdapter & {
    ingestWebhookPayload?: (
      body: unknown,
      rawBody?: Buffer | string,
      signature?: string,
    ) => { ok: boolean; error?: string };
  };
  return a.ingestWebhookPayload ?? null;
}
