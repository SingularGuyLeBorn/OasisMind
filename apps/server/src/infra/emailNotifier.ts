/**
 * 通知通道 — send_email / 心跳告警 / ask_user 提醒
 *
 * 可并行启用多通道（任一成功即算成功）：
 * - EMAIL_PROVIDER=agentmail → AgentMail（agentmail.to）
 * - EMAIL_PROVIDER=smtp → SMTP（QQ 邮箱等）
 * - NTFY_TOPIC 非空 → ntfy.sh（免注册推送，可与上面叠加）
 *
 * 每通道独立 CircuitBreaker：连续失败开闸，冷却后半开探测；开闸期间跳过该通道。
 * EMAIL_PROVIDER=none 且未配 NTFY_TOPIC 时不发。
 */

import type { AppConfig } from "./config.js";
import type { ServiceContainer } from "./serviceContainer.js";
import { sendAgentMailMessage } from "./agentMailClient.js";
import { CircuitBreaker } from "./circuitBreaker.js";

export interface EmailSendInput {
  subject: string;
  body: string;
  /** 收件人；缺省读 EMAIL_TO（ntfy 不需要） */
  to?: string;
  /** 审计 metadata 用（发起方 Agent id） */
  agentId?: string;
}

export type EmailSendResult =
  | { success: true; message: string; messageId?: string; threadId?: string }
  | { error: string };

/** 通知通道熔断：3 次连续失败开闸，5 分钟冷却 */
const NOTIFY_FAILURE_THRESHOLD = 3;
const NOTIFY_OPEN_DURATION_MS = 5 * 60_000;

const notifyBreakers = new Map<string, CircuitBreaker>();

function getNotifyBreaker(channel: string): CircuitBreaker {
  let b = notifyBreakers.get(channel);
  if (!b) {
    b = new CircuitBreaker({
      failureThreshold: NOTIFY_FAILURE_THRESHOLD,
      openDurationMs: NOTIFY_OPEN_DURATION_MS,
    });
    notifyBreakers.set(channel, b);
  }
  return b;
}

/** 测试用：清空通道熔断器 */
export function __resetNotifyBreakersForTests(): void {
  notifyBreakers.clear();
}

export type NotifyChannelStatus = {
  channel: string;
  state: "closed" | "open" | "half-open";
  failures: number;
};

/** 已触碰过的通知通道熔断状态（供 swarmAlerts 展示） */
export function listNotifyBreakerStatuses(): NotifyChannelStatus[] {
  return [...notifyBreakers.entries()].map(([channel, b]) => ({
    channel,
    state: b.getState(),
    failures: b.getFailureCount(),
  }));
}

async function runWithNotifyBreaker(
  channel: string,
  run: () => Promise<EmailSendResult>,
): Promise<EmailSendResult> {
  const breaker = getNotifyBreaker(channel);
  const permit = breaker.tryAcquire();
  if (!permit.allowed) {
    const secs = Math.ceil(permit.retryAfterMs / 1000);
    return {
      error: `${channel} 通道熔断中（约 ${secs}s 后半开探测），本次跳过`,
    };
  }
  try {
    const result = await run();
    if ("success" in result && result.success) {
      breaker.recordSuccess();
    } else {
      breaker.recordFailure();
    }
    return result;
  } catch (err) {
    breaker.recordFailure();
    return { error: `${channel} 异常: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function sendViaSmtp(to: string, subject: string, body: string): Promise<EmailSendResult> {
  // @ts-ignore — nodemailer 可选依赖
  const nodemailer: any = await import("nodemailer").catch((err) => {
    console.warn(
      "[emailNotifier] nodemailer 动态 import 失败:",
      err instanceof Error ? err.message : err,
    );
    return null;
  });
  const createTransport = nodemailer?.default?.createTransport || nodemailer?.createTransport;
  if (!createTransport) {
    return { error: "nodemailer 未安装，请在 apps/server 执行 pnpm add nodemailer" };
  }

  const host = process.env.EMAIL_SMTP_HOST || "smtp.qq.com";
  const port = Number(process.env.EMAIL_SMTP_PORT || "465");
  const secure =
    process.env.EMAIL_SMTP_SECURE !== undefined
      ? process.env.EMAIL_SMTP_SECURE === "true"
      : port === 465;
  const user = process.env.EMAIL_SMTP_USER || "";
  const pass = process.env.EMAIL_SMTP_PASS || "";
  if (!user || !pass) {
    return { error: "SMTP 未配置：请设置 EMAIL_SMTP_USER / EMAIL_SMTP_PASS（QQ 邮箱用授权码）" };
  }

  const transporter = createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_SMTP_FROM || user,
    to,
    subject,
    text: body,
  });
  return { success: true, message: `SMTP 已发送到 ${to}` };
}

async function sendViaAgentMail(to: string, subject: string, body: string): Promise<EmailSendResult> {
  const sent = await sendAgentMailMessage({ to, subject, text: body });
  if (!sent.ok) return { error: sent.error };
  return {
    success: true,
    message: `AgentMail 已发送到 ${to}`,
    messageId: sent.messageId,
    threadId: sent.threadId,
  };
}

/** ntfy.sh：免注册，topic 当密码；见 https://ntfy.sh */
async function sendViaNtfy(subject: string, body: string): Promise<EmailSendResult> {
  const topic = process.env.NTFY_TOPIC?.trim();
  if (!topic) return { error: "NTFY_TOPIC 未配置" };

  const base = (process.env.NTFY_SERVER || "https://ntfy.sh").replace(/\/$/, "");
  const url = `${base}/${encodeURIComponent(topic)}`;
  const headers: Record<string, string> = {
    Title: subject.slice(0, 250),
    Priority: process.env.NTFY_PRIORITY?.trim() || "default",
  };
  const token = process.env.NTFY_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { error: `ntfy 发送失败: HTTP ${res.status} ${text.slice(0, 200)}`.trim() };
  }
  return { success: true, message: `ntfy 已推送到 ${topic}` };
}

/** 解析实际主通道：env 优先；缺省时有 AgentMail key 则走 agentmail（避免 EMAIL_PROVIDER 漏配导致全沉默） */
export function resolveEmailProvider(config?: AppConfig): string {
  const raw = (config?.emailProvider || process.env.EMAIL_PROVIDER || "").trim().toLowerCase();
  if (raw && raw !== "none") return raw;
  if (process.env.AGENTMAIL_API_KEY?.trim()) return "agentmail";
  if (process.env.EMAIL_SMTP_USER?.trim() && process.env.EMAIL_SMTP_PASS?.trim()) return "smtp";
  if (process.env.NTFY_TOPIC?.trim()) return "ntfy";
  return "none";
}

export type NotifyStatus = {
  provider: string;
  to: string;
  askTo: string;
  channels: {
    name: string;
    configured: boolean;
    detail: string;
  }[];
  ready: boolean;
  hint: string;
};

/** 只读通知配置（供 /settings 与 CLI；不返回密钥） */
export function getNotifyStatus(config?: AppConfig): NotifyStatus {
  const provider = resolveEmailProvider(config);
  const to = process.env.EMAIL_TO?.trim() || "";
  const askTo = process.env.AGENTMAIL_ASK_TO?.trim() || to;
  const smtpUser = process.env.EMAIL_SMTP_USER?.trim() || "";
  const smtpPass = Boolean(process.env.EMAIL_SMTP_PASS?.trim());
  const agentKey = Boolean(process.env.AGENTMAIL_API_KEY?.trim());
  const inbox = process.env.AGENTMAIL_INBOX_ID?.trim() || "";
  const ntfy = process.env.NTFY_TOPIC?.trim() || "";

  const channels = [
    {
      name: "agentmail",
      configured: agentKey && Boolean(inbox),
      detail: agentKey
        ? `inbox=${inbox || "未设"} · askTo=${askTo || "未设"}`
        : "未配置 AGENTMAIL_API_KEY",
    },
    {
      name: "smtp",
      configured: Boolean(smtpUser && smtpPass),
      detail: smtpUser
        ? `user=${smtpUser} · pass=${smtpPass ? "已设" : "未设"} · host=${process.env.EMAIL_SMTP_HOST || "smtp.qq.com"}`
        : "未配置 EMAIL_SMTP_USER",
    },
    {
      name: "ntfy",
      configured: Boolean(ntfy),
      detail: ntfy ? `topic=${ntfy}` : "未配置 NTFY_TOPIC",
    },
  ];

  const ready =
    (provider === "agentmail" && channels[0].configured && Boolean(to || askTo)) ||
    (provider === "smtp" && channels[1].configured && Boolean(to)) ||
    (provider === "ntfy" && channels[2].configured) ||
    (Boolean(ntfy) && provider !== "none");

  let hint = "";
  if (!ready) {
    hint =
      "请设置 EMAIL_TO（主人邮箱，如 2635495642@qq.com），并至少配置 AgentMail / SMTP / NTFY 之一。";
  } else if (!to && provider !== "ntfy") {
    hint = "EMAIL_TO 为空：通知可能发不出去。";
  } else if (to.includes("2871732121")) {
    hint = "EMAIL_TO 仍是 Bot 号邮箱，应改为主人邮箱（如 2635495642@qq.com）。";
  } else if (
    channels[0].configured &&
    !channels[1].configured &&
    !(
      process.env.KP_HTTPS_PROXY?.trim() ||
      process.env.HTTPS_PROXY?.trim() ||
      process.env.HTTP_PROXY?.trim()
    )
  ) {
    hint =
      "仅 AgentMail 且未配代理：国内直连常 403。可设 KP_HTTPS_PROXY=http://127.0.0.1:7890，或另配 SMTP 作备用。";
  }

  return { provider, to, askTo, channels, ready, hint };
}

/** 发一封测试通知（走与生产相同的 sendEmailNotification） */
export async function sendTestNotification(
  config: AppConfig,
  log: ServiceContainer["log"] | undefined,
  opts?: { to?: string },
): Promise<EmailSendResult & { status: NotifyStatus }> {
  const status = getNotifyStatus(config);
  const to = opts?.to?.trim() || status.to || status.askTo;
  const result = await sendEmailNotification(config, log, {
    to,
    subject: "[OasisMind 邮件测试] 通知通道探测",
    body: [
      "这是一封见微 / OasisMind 通知通道测试邮件。",
      `时间: ${new Date().toISOString()}`,
      `主通道: ${status.provider}`,
      `收件人: ${to}`,
      "",
      "若你收到此邮件，说明掉线扫码通知 / 审批提醒等可走同一通道。",
    ].join("\n"),
    agentId: "notify-test",
  });
  return { ...result, status: { ...status, to } };
}

export async function sendEmailNotification(
  config: AppConfig,
  log: ServiceContainer["log"] | undefined,
  input: EmailSendInput,
): Promise<EmailSendResult> {
  const { subject, body } = input;
  if (!subject || !body) return { error: "send_email 需要 subject 和 body" };

  const provider = resolveEmailProvider(config);
  const ntfyTopic = process.env.NTFY_TOPIC?.trim();
  const to = input.to || process.env.EMAIL_TO || process.env.AGENTMAIL_ASK_TO || "";
  const smtpReady = Boolean(
    process.env.EMAIL_SMTP_USER?.trim() && process.env.EMAIL_SMTP_PASS?.trim(),
  );
  const agentmailReady = Boolean(
    process.env.AGENTMAIL_API_KEY?.trim() && process.env.AGENTMAIL_INBOX_ID?.trim(),
  );

  // 所有已配置通道并行尝试（任一成功即成功）。主通道优先列入，便于日志阅读。
  // 背景：国内访问 api.agentmail.to 常被 CloudFront 403，SMTP 作回退必不可少。
  const jobs: Array<{ name: string; run: () => Promise<EmailSendResult> }> = [];
  const pushUnique = (name: string, run: () => Promise<EmailSendResult>) => {
    if (jobs.some((j) => j.name === name)) return;
    jobs.push({ name, run });
  };

  const order =
    provider === "smtp"
      ? (["smtp", "agentmail", "ntfy"] as const)
      : provider === "ntfy"
        ? (["ntfy", "smtp", "agentmail"] as const)
        : (["agentmail", "smtp", "ntfy"] as const);

  for (const name of order) {
    if (name === "agentmail" && agentmailReady) {
      if (!to) continue;
      pushUnique(name, () => sendViaAgentMail(to, subject, body));
    } else if (name === "smtp" && smtpReady) {
      if (!to) continue;
      pushUnique(name, () => sendViaSmtp(to, subject, body));
    } else if (name === "ntfy" && ntfyTopic) {
      pushUnique(name, () => sendViaNtfy(subject, body));
    }
  }

  if (jobs.length === 0) {
    if (!to && (agentmailReady || smtpReady)) {
      return { error: "未配置收件人（EMAIL_TO / AGENTMAIL_ASK_TO 或 to 参数）" };
    }
    return {
      error:
        "通知未配置：请设置 EMAIL_PROVIDER=agentmail|smtp|ntfy，配置 EMAIL_TO，并至少启用一种通道（AgentMail / SMTP / NTFY_TOPIC）。国内若 AgentMail 403，请改配 QQ SMTP 授权码。",
    };
  }

  const results = await Promise.all(
    jobs.map(async (j) => ({
      name: j.name,
      result: await runWithNotifyBreaker(j.name, j.run),
    })),
  );
  const ok = results.filter((r) => "success" in r.result && r.result.success);
  const failed = results.filter((r) => "error" in r.result);

  if (ok.length > 0) {
    const message = ok.map((r) => (r.result as { message: string }).message).join("；");
    const agentMailResult = ok.find((r) => r.name === "agentmail")?.result as
      | { success: true; messageId?: string; threadId?: string }
      | undefined;
    await log
      ?.create?.({
        level: "info",
        component: "swarm",
        event: "email_sent",
        message: `通知已发送: ${subject}（${message}）`,
        metadata: {
          subject,
          to: to || undefined,
          provider,
          channels: ok.map((r) => r.name),
          agentId: input.agentId,
          errors: failed.map((r) => `${r.name}: ${(r.result as { error: string }).error}`),
        },
      })
      .catch((err) => { console.warn("[emailNotifier.ts] best-effort failed:", err instanceof Error ? err.message : err); });
    return {
      success: true,
      message,
      messageId: agentMailResult?.messageId,
      threadId: agentMailResult?.threadId,
    };
  }

  return {
    error: failed.map((r) => `${r.name}: ${(r.result as { error: string }).error}`).join("；"),
  };
}
