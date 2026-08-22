/**
 * AgentMail（https://www.agentmail.to / api.agentmail.to）
 *
 * 双向邮件：ask_user 发问 + webhook 收回复；也可经 emailNotifier（EMAIL_PROVIDER=agentmail）发通知。
 * 国内直连常被 CloudFront 拦/超时；所有 API 调用统一走 OM_HTTPS_PROXY（与发信同源）。
 */

import { ProxyAgent, fetch as undiciFetch, type Dispatcher } from "undici";
import { safeEqualSecret } from "./auth.js";
import { bootDetail } from "./bootLog.js";

const AGENTMAIL_API_BASE = "https://api.agentmail.to/v0";

export type AgentMailSendResult =
  | { ok: true; messageId: string; threadId?: string; inboxId: string }
  | { ok: false; error: string };

function apiKey(): string | undefined {
  return process.env.AGENTMAIL_API_KEY?.trim() || undefined;
}

function authHeaders(): Record<string, string> {
  const key = apiKey();
  if (!key) throw new Error("AGENTMAIL_API_KEY 未配置");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "OasisMind/1.0 (emailNotifier)",
  };
}

export function isAgentMailConfigured(): boolean {
  return Boolean(apiKey());
}

let mailDispatcher: Dispatcher | null | undefined;

function resolveProxyUrl(): string {
  return (
    process.env.OM_HTTPS_PROXY?.trim() ||
    process.env.HTTPS_PROXY?.trim() ||
    process.env.HTTP_PROXY?.trim() ||
    process.env.OM_HTTP_PROXY?.trim() ||
    ""
  );
}

function getMailDispatcher(): Dispatcher | undefined {
  if (mailDispatcher !== undefined) return mailDispatcher ?? undefined;
  const proxyUrl = resolveProxyUrl();
  if (!proxyUrl) {
    mailDispatcher = null;
    return undefined;
  }
  try {
    mailDispatcher = new ProxyAgent(proxyUrl);
    return mailDispatcher;
  } catch {
    mailDispatcher = null;
    return undefined;
  }
}

/** AgentMail API 专用 fetch：显式挂代理（不依赖 Node 全局 fetch 是否吃到 undici dispatcher） */
async function agentMailFetch(
  url: string,
  init: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeoutMs?: number;
  } = {},
): Promise<Response> {
  const timeoutMs = init.timeoutMs ?? 30_000;
  const dispatcher = getMailDispatcher();
  const signal = AbortSignal.timeout(timeoutMs);
  if (dispatcher) {
    return undiciFetch(url, {
      method: init.method,
      headers: init.headers,
      body: init.body,
      dispatcher,
      signal,
    }) as unknown as Response;
  }
  return fetch(url, {
    method: init.method,
    headers: init.headers,
    body: init.body,
    signal,
  });
}

function formatAgentMailNetError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/aborted|timeout|TimeoutError|UND_ERR_CONNECT/i.test(msg)) {
    const proxy = resolveProxyUrl();
    return proxy
      ? `${msg}（经代理 ${proxy} 超时；发信成功≠巡检同速，确认 Clash 仍开着即可，非 rate limit）`
      : `${msg}（国内直连 api.agentmail.to 常超时/403；设 OM_HTTPS_PROXY=http://127.0.0.1:7890。非 rate limit）`;
  }
  return msg;
}

/**
 * 注册 webhook 到 AgentMail 平台，让邮件回复能回调到本机 /api/webhooks/agentmail。
 *
 * webhook URL 来源（优先级）：
 *   1. env AGENTMAIL_WEBHOOK_URL（直接指定完整 URL，最高优先级）
 *   2. PUBLIC_URL + /api/webhooks/agentmail（Cloudflare Tunnel 公网域名派生）
 *
 * 未配置任何公网 URL 时跳过注册并 warn——本地 localhost 不可公网访问，AgentMail 无法回调，
 * 邮件回复接收需要公网隧道（Cloudflare Tunnel / ngrok）。
 *
 * 用 client_id="oasismind-webhook-v1" 幂等：AgentMail 同 client_id 重复注册返回已创建的 webhook，不重复。
 */
export async function ensureAgentMailWebhook(opts?: {
  /** 覆盖 webhook URL（优先级最高，用于临时隧道解析到 URL 后动态注入） */
  urlOverride?: string;
}): Promise<{ ok: true; webhookId?: string; url: string } | { ok: false; error: string; skipped?: boolean }> {
  if (!apiKey()) return { ok: false, error: "AGENTMAIL_API_KEY 未配置", skipped: true };

  const explicit = opts?.urlOverride?.trim() || process.env.AGENTMAIL_WEBHOOK_URL?.trim();
  const publicUrl = process.env.PUBLIC_URL?.trim();
  const webhookUrl = explicit || (publicUrl ? `${publicUrl.replace(/\/$/, "")}/api/webhooks/agentmail` : "");

  if (!webhookUrl) {
    console.warn(
      "[AgentMail] 未配置 PUBLIC_URL / AGENTMAIL_WEBHOOK_URL，跳过 webhook 注册。邮件回复接收需要公网隧道（Cloudflare Tunnel / ngrok），回调 URL = https://<公网域名>/api/webhooks/agentmail",
    );
    return { ok: false, error: "未配置公网 URL，跳过 webhook 注册", skipped: true };
  }

  try {
    const res = await agentMailFetch(`${AGENTMAIL_API_BASE}/webhooks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        url: webhookUrl,
        event_types: ["message.received"],
        client_id: "oasismind-webhook-v1",
      }),
      timeoutMs: 30_000,
    });
    const body = (await res.json().catch(() => ({}))) as {
      webhook_id?: string;
      webhookId?: string;
      id?: string;
      url?: string;
      error?: string;
      message?: string;
    };
    // 幂等：同 client_id 已存在时 AgentMail 可能返回 200/409，都视为已注册
    if (!res.ok && res.status !== 409) {
      return {
        ok: false,
        error: `AgentMail 注册 webhook 失败: HTTP ${res.status} ${body.error || body.message || ""}`.trim(),
      };
    }
    const webhookId = body.webhook_id || body.webhookId || body.id;
    bootDetail(`[AgentMail] webhook 已注册: ${webhookUrl} (id=${webhookId ?? "n/a"})`);
    return { ok: true, webhookId, url: webhookUrl };
  } catch (err) {
    return {
      ok: false,
      error: `AgentMail 注册 webhook 异常: ${formatAgentMailNetError(err)}`,
    };
  }
}

/** 确保有可用 inbox：优先 AGENTMAIL_INBOX_ID，否则用 client_id=oasismind 幂等创建 */
export async function ensureAgentMailInbox(): Promise<
  { ok: true; inboxId: string } | { ok: false; error: string }
> {
  if (!apiKey()) return { ok: false, error: "AGENTMAIL_API_KEY 未配置（AgentMail / agentmail.to）" };

  const configured = process.env.AGENTMAIL_INBOX_ID?.trim();
  if (configured) return { ok: true, inboxId: configured };

  try {
    const res = await agentMailFetch(`${AGENTMAIL_API_BASE}/inboxes`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        client_id: "oasismind",
        display_name: "OasisMind",
      }),
      timeoutMs: 30_000,
    });
    const body = (await res.json().catch(() => ({}))) as {
      inbox_id?: string;
      inboxId?: string;
      email?: string;
      error?: string;
      message?: string;
    };
    if (!res.ok) {
      return {
        ok: false,
        error: `AgentMail 创建 inbox 失败: HTTP ${res.status} ${body.error || body.message || ""}`.trim(),
      };
    }
    const inboxId = body.inbox_id || body.inboxId || body.email;
    if (!inboxId) return { ok: false, error: "AgentMail 创建 inbox 成功但未返回 inbox_id" };
    console.info(`[AgentMail] inbox ready: ${inboxId}`);
    return { ok: true, inboxId };
  } catch (err) {
    return { ok: false, error: `AgentMail 创建 inbox 异常: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function sendAgentMailMessage(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<AgentMailSendResult> {
  const inbox = await ensureAgentMailInbox();
  if (!inbox.ok) return { ok: false, error: inbox.error };

  try {
    const res = await agentMailFetch(
      `${AGENTMAIL_API_BASE}/inboxes/${encodeURIComponent(inbox.inboxId)}/messages/send`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          to: [input.to],
          subject: input.subject,
          text: input.text,
          html: input.html || `<pre>${escapeHtml(input.text)}</pre>`,
        }),
        timeoutMs: 60_000,
      },
    );
    const body = (await res.json().catch(() => ({}))) as {
      message_id?: string;
      messageId?: string;
      thread_id?: string;
      threadId?: string;
      error?: string;
      message?: string;
    };
    if (!res.ok) {
      const raw = typeof body === "object" ? JSON.stringify(body) : String(body);
      const blocked =
        res.status === 403 &&
        (/Request blocked|cloudfront|The request could not be satisfied/i.test(raw) ||
          !body.error);
      return {
        ok: false,
        error: blocked
          ? `AgentMail 发信失败: HTTP 403（本机访问 api.agentmail.to 被拦）。请改用 SMTP：设置 EMAIL_PROVIDER=smtp + EMAIL_SMTP_USER/PASS（QQ 邮箱授权码），收件人 EMAIL_TO=主人邮箱。`
          : `AgentMail 发信失败: HTTP ${res.status} ${body.error || body.message || ""}`.trim(),
      };
    }
    const messageId = body.message_id || body.messageId;
    if (!messageId) return { ok: false, error: "AgentMail 发信成功但未返回 message_id" };
    return {
      ok: true,
      messageId,
      threadId: body.thread_id || body.threadId,
      inboxId: inbox.inboxId,
    };
  } catch (err) {
    return { ok: false, error: `AgentMail 发信异常: ${formatAgentMailNetError(err)}` };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 隧道连通性自检：从公网 ping webhook URL，确认隧道真的通。
 * 任何 HTTP 响应（含 404/405）都说明公网能到达 next.js → 隧道通；
 * 超时/网络错误说明隧道断或 PUBLIC_URL 错。
 */
export async function selfCheckTunnel(webhookUrl: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(webhookUrl, { method: "GET", signal: AbortSignal.timeout(10000) });
    // 任何响应（含 404/405）都说明公网能到达；只有 5xx 或网络错误才算不通
    return { ok: res.status < 500, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** 列出 AgentMail 已注册的 webhook（健康巡检用） */
export async function listAgentMailWebhooks(): Promise<
  { ok: true; webhooks: Array<{ webhookId?: string; url?: string; clientId?: string; eventTypes?: string[] }> }
  | { ok: false; error: string }
> {
  if (!apiKey()) return { ok: false, error: "AGENTMAIL_API_KEY 未配置" };
  try {
    const res = await agentMailFetch(`${AGENTMAIL_API_BASE}/webhooks`, {
      method: "GET",
      headers: authHeaders(),
      timeoutMs: 30_000,
    });
    const body = (await res.json().catch(() => ({}))) as {
      webhooks?: Array<{
        webhook_id?: string;
        webhookId?: string;
        id?: string;
        url?: string;
        client_id?: string;
        clientId?: string;
        event_types?: string[];
        eventTypes?: string[];
      }>;
      data?: Array<Record<string, unknown>>;
      error?: string;
      message?: string;
    };
    if (!res.ok) {
      // 429 才是限流；超时/403 是网络/CloudFront
      const hint =
        res.status === 429
          ? "（AgentMail API rate limit，稍后再巡检）"
          : res.status === 403
            ? "（CloudFront 拦了；确认 OM_HTTPS_PROXY）"
            : "";
      return {
        ok: false,
        error: `AgentMail list webhooks 失败: HTTP ${res.status} ${body.error || body.message || ""}${hint}`.trim(),
      };
    }
    const raw = body.webhooks ?? (Array.isArray(body.data) ? (body.data as Array<Record<string, unknown>>) : []);
    const webhooks = raw.map((w) => {
      const obj = w as Record<string, unknown>;
      return {
        webhookId: (obj.webhook_id ?? obj.webhookId ?? obj.id) as string | undefined,
        url: obj.url as string | undefined,
        clientId: (obj.client_id ?? obj.clientId) as string | undefined,
        eventTypes: (obj.event_types ?? obj.eventTypes) as string[] | undefined,
      };
    });
    return { ok: true, webhooks };
  } catch (err) {
    return { ok: false, error: `AgentMail list webhooks 异常: ${formatAgentMailNetError(err)}` };
  }
}

/**
 * webhook 健康巡检：周期检查 client_id=oasismind-webhook-v1 的 webhook 是否存在且 URL 匹配当前 PUBLIC_URL。
 * 丢失 / URL 不匹配（如 ngrok 换了域名但 server 没重启）→ 自动重注册。
 */
export function startAgentMailWebhookHealthCheck(opts?: {
  intervalMs?: number;
}): { stop: () => void } {
  const intervalMs = opts?.intervalMs ?? 5 * 60_000;
  let timer: NodeJS.Timeout | null = null;
  let stopped = false;
  let inFlight = false;
  /** 失败日志节流：同一类失败 30min 内最多打一次，避免刷控制台 */
  let lastFailLogAt = 0;
  const FAIL_LOG_COOLDOWN_MS = 30 * 60_000;

  function warnThrottled(msg: string) {
    const now = Date.now();
    if (now - lastFailLogAt < FAIL_LOG_COOLDOWN_MS) return;
    lastFailLogAt = now;
    console.warn(msg);
  }

  async function check() {
    if (stopped || inFlight) return;
    inFlight = true;
    try {
      const expectedUrl =
        process.env.AGENTMAIL_WEBHOOK_URL?.trim() ||
        (process.env.PUBLIC_URL?.trim()
          ? `${process.env.PUBLIC_URL.trim().replace(/\/$/, "")}/api/webhooks/agentmail`
          : "");
      if (!expectedUrl) return; // 无公网 URL，跳过（启动时已 warn）

      const list = await listAgentMailWebhooks();
      if (!list.ok) {
        warnThrottled(`[AgentMail HealthCheck] list webhooks 失败: ${list.error}`);
        return;
      }
      lastFailLogAt = 0; // 成功后允许下次失败立刻提示一次
      const ours = list.webhooks.find((w) => w.clientId === "oasismind-webhook-v1");
      if (!ours) {
        console.warn("[AgentMail HealthCheck] webhook 丢失（AgentMail 侧无 client_id=oasismind-webhook-v1），重新注册…");
        const r = await ensureAgentMailWebhook();
        if (r.ok) console.log("[AgentMail HealthCheck] webhook 已重新注册:", r.url);
        else if (!r.skipped) warnThrottled(`[AgentMail HealthCheck] 重新注册失败: ${r.error}`);
        return;
      }
      if (ours.url && ours.url !== expectedUrl) {
        console.warn(
          `[AgentMail HealthCheck] webhook URL 不匹配：AgentMail 侧=${ours.url}，期望=${expectedUrl}，重新注册…`,
        );
        const r = await ensureAgentMailWebhook();
        if (r.ok) console.log("[AgentMail HealthCheck] webhook URL 已更新:", r.url);
        else if (!r.skipped) warnThrottled(`[AgentMail HealthCheck] URL 更新失败: ${r.error}`);
        return;
      }
      // 一切正常，静默
    } catch (err) {
      warnThrottled(`[AgentMail HealthCheck] 异常: ${formatAgentMailNetError(err)}`);
    } finally {
      inFlight = false;
    }
  }

  function scheduleNext(ms: number) {
    if (stopped) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      check().finally(() => scheduleNext(intervalMs));
    }, ms);
  }

  // 首次延迟 2min（给启动注册留时间，避免与启动注册竞争）
  scheduleNext(120_000);

  return {
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}

function isPubliclyReachable(): boolean {
  return Boolean(
    process.env.PUBLIC_URL?.trim() ||
      process.env.CLOUDFLARE_TUNNEL_TOKEN?.trim() ||
      process.env.NODE_ENV === "production",
  );
}

/** 校验 webhook：支持 header x-agentmail-secret / Authorization Bearer 与 env AGENTMAIL_WEBHOOK_SECRET */
export function verifyAgentMailWebhook(req: {
  headers: Record<string, string | string[] | undefined>;
}): boolean {
  const secret = process.env.AGENTMAIL_WEBHOOK_SECRET?.trim();
  if (!secret) {
    if (isPubliclyReachable()) {
      console.error("[AgentMail] AGENTMAIL_WEBHOOK_SECRET 未配置，公网/生产拒绝 webhook（fail-closed）");
      return false;
    }
    console.warn("[AgentMail] AGENTMAIL_WEBHOOK_SECRET 未配置，仅本地开发放行");
    return true;
  }
  const h = req.headers;
  const pick = (name: string) => {
    const v = h[name] ?? h[name.toLowerCase()];
    return Array.isArray(v) ? v[0] : v;
  };
  const provided =
    pick("x-agentmail-secret") ||
    pick("x-webhook-secret") ||
    (pick("authorization")?.startsWith("Bearer ")
      ? pick("authorization")!.slice("Bearer ".length)
      : undefined);
  if (!provided) return false;
  return safeEqualSecret(provided, secret);
}

export type AgentMailWebhookPayload = {
  event_type?: string;
  event_id?: string;
  message?: {
    message_id?: string;
    thread_id?: string;
    in_reply_to?: string;
    extracted_text?: string;
    text?: string;
    preview?: string;
    subject?: string;
    from_?: string[];
  };
};

export function extractReplyTextFromWebhook(payload: AgentMailWebhookPayload): string {
  const m = payload.message;
  if (!m) return "";
  return (m.extracted_text || m.text || m.preview || "").trim();
}
