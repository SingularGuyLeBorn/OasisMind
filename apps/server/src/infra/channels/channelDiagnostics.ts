/**
 * QQ / 微信通道体检。
 *
 * 默认只检查本地配置，不读取附件、不消费入站消息、不发送任何内容。`live=true` 才访问
 * 平台：QQ 获取 token 并读取 gateway；微信无会话时只申请未绑定二维码，有会话时只申请
 * 一个 1 字节测试上传槽，不上传也不发消息。报告不包含 secret、botToken、contextToken、
 * openid 或上传地址，可安全显示在本地管理页和 CLI。
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { ChannelCapability } from "../messageGateway.js";
import {
  loadQqBotConfigFromEnv,
  type QqBotConfig,
} from "./qqBotConfig.js";
import {
  QQ_OFFICIAL_API_BASE,
  ensureQqOfficialAccessToken,
} from "./qqOfficialMedia.js";
import {
  loadWeixinClawBotConfigFromEnv,
  readWeixinClawBotSession,
  type WeixinClawBotConfig,
} from "./weixinSession.js";
import {
  WEIXIN_UPLOAD_MEDIA,
  fetchWeixinQr,
  getWeixinUploadUrl,
} from "./weixinIlink.js";
import { createMultimodalChannelCapabilities } from "./channelCapabilities.js";

export type ChannelProbeName = "qq" | "weixin";
export type ChannelProbeCheckStatus = "passed" | "warning" | "failed" | "skipped";

export type ChannelProbeCheck = {
  name: string;
  status: ChannelProbeCheckStatus;
  detail: string;
  latencyMs?: number;
};

export type ChannelProbeReport = {
  channel: ChannelProbeName;
  name: string;
  live: boolean;
  ok: boolean;
  configured: boolean;
  authenticated: boolean | null;
  capabilities: ChannelCapability;
  checks: ChannelProbeCheck[];
  nextAction: string | null;
  checkedAt: string;
};

type ProbeOptions = {
  live?: boolean;
  fetchImpl?: typeof fetch;
  dataDir?: string;
  qqConfig?: QqBotConfig;
  weixinConfig?: WeixinClawBotConfig;
};

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  // 平台错误偶尔会把 Authorization 或 query 参数带回；体检层只保留前一行并遮住常见密钥形态。
  return message
    .split(/\r?\n/, 1)[0]!
    .replace(/(Bearer|QQBot)\s+[A-Za-z0-9._~+/-]+/gi, "$1 ***")
    .replace(/(token|secret|access_token|bot_token)=?[^\s,;]+/gi, "$1=***")
    .slice(0, 300);
}

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; latencyMs: number }> {
  const started = Date.now();
  const value = await fn();
  return { value, latencyMs: Date.now() - started };
}

async function probeQq(opts: ProbeOptions): Promise<ChannelProbeReport> {
  const cfg = opts.qqConfig ?? loadQqBotConfigFromEnv();
  const live = opts.live === true;
  const checks: ChannelProbeCheck[] = [];
  const configured = Boolean(cfg.appId && cfg.secret);
  checks.push({
    name: "credentials",
    status: configured ? "passed" : "failed",
    detail: configured ? "QQ App ID 与 Secret 已配置" : "缺少 QQ_BOT_APP_ID 或 QQ_BOT_SECRET",
  });
  checks.push({
    name: "inbound_allowlist",
    status: cfg.allowedOpenIds.length > 0 ? "passed" : "warning",
    detail:
      cfg.allowedOpenIds.length > 0
        ? `已配置 ${cfg.allowedOpenIds.includes("*") ? "全量" : cfg.allowedOpenIds.length} 个用户范围`
        : "用户白名单为空：即使连接成功也会拒绝所有入站用户",
  });
  if (!cfg.enabled) {
    checks.push({ name: "enabled", status: "failed", detail: "QQ 通道未启用或凭据不完整" });
  }

  let authenticated: boolean | null = null;
  if (!live) {
    checks.push({ name: "platform", status: "skipped", detail: "未传 --live，未访问 QQ 开放平台" });
  } else if (configured && cfg.enabled) {
    try {
      const fetchImpl = opts.fetchImpl ?? fetch;
      const tokenResult = await timed(() =>
        ensureQqOfficialAccessToken({
          appId: cfg.appId,
          secret: cfg.secret,
          fetchImpl,
          timeoutMs: 15_000,
        }),
      );
      authenticated = true;
      checks.push({
        name: "token",
        status: "passed",
        detail: "QQ token 获取成功（凭据未写入报告）",
        latencyMs: tokenResult.latencyMs,
      });
      const gatewayResult = await timed(async () => {
        const response = await fetchImpl(`${QQ_OFFICIAL_API_BASE}/gateway`, {
          headers: { Authorization: `QQBot ${tokenResult.value}` },
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error(`QQ gateway HTTP ${response.status}`);
        const body = (await response.json()) as { url?: unknown };
        const gatewayUrl = String(body.url ?? "");
        if (!/^wss?:\/\//i.test(gatewayUrl)) throw new Error("QQ gateway 未返回 ws/wss 地址");
      });
      checks.push({
        name: "gateway",
        status: "passed",
        detail: "QQ gateway 可达并返回 WebSocket 地址",
        latencyMs: gatewayResult.latencyMs,
      });
    } catch (error) {
      authenticated = false;
      checks.push({ name: "platform", status: "failed", detail: safeError(error) });
    }
  }

  const ok = configured && cfg.enabled && (!live || authenticated === true) &&
    !checks.some((check) => check.status === "failed");
  return {
    channel: "qq",
    name: "QQ 官方机器人",
    live,
    ok,
    configured,
    authenticated,
    capabilities: createMultimodalChannelCapabilities({ supportsQuote: true }),
    checks,
    nextAction: ok
      ? null
      : !configured
        ? "在本地 .env 配置 QQ_BOT_APP_ID、QQ_BOT_SECRET 和 QQ_BOT_ALLOWED_OPENIDS。"
        : "检查 QQ 开放平台凭据、机器人权限和网络，再运行 pnpm channel:probe -- --channel qq --live。",
    checkedAt: new Date().toISOString(),
  };
}

async function probeWeixin(opts: ProbeOptions): Promise<ChannelProbeReport> {
  const cfg = opts.weixinConfig ?? loadWeixinClawBotConfigFromEnv(opts.dataDir);
  const live = opts.live === true;
  const checks: ChannelProbeCheck[] = [];
  const session = readWeixinClawBotSession(cfg.sessionDir);
  const configured = Boolean(session?.botToken);
  checks.push({
    name: "session",
    status: configured ? "passed" : "warning",
    detail: configured ? "本地微信会话存在（token 未写入报告）" : "尚未扫码绑定微信 ClawBot",
  });
  checks.push({
    name: "inbound_allowlist",
    status: cfg.allowedUserIds.length > 0 || Boolean(session?.boundUserId) ? "passed" : "warning",
    detail:
      cfg.allowedUserIds.length > 0
        ? `已配置 ${cfg.allowedUserIds.includes("*") ? "全量" : cfg.allowedUserIds.length} 个用户范围`
        : session?.boundUserId
          ? "使用首次绑定用户作为入站边界"
          : "尚无绑定用户；首次扫码后由首位私聊用户完成绑定",
  });
  if (!cfg.enabled) checks.push({ name: "enabled", status: "failed", detail: "WEIXIN_CLAWBOT_ENABLED=false" });

  let authenticated: boolean | null = null;
  if (!live) {
    checks.push({ name: "platform", status: "skipped", detail: "未传 --live，未访问微信 iLink" });
  } else if (cfg.enabled) {
    const fetchImpl = opts.fetchImpl ?? fetch;
    try {
      if (!session) {
        const endpoint = await timed(() => fetchWeixinQr({ baseUrl: cfg.baseUrl, fetchImpl }));
        checks.push({
          name: "endpoint",
          status: "passed",
          detail: "微信 iLink 二维码端点可达；仍需在 /channels 扫码绑定",
          latencyMs: endpoint.latencyMs,
        });
        authenticated = false;
      } else if (!session.boundUserId) {
        checks.push({
          name: "binding",
          status: "failed",
          detail: "微信会话缺少 boundUserId；请让主人先向 ClawBot 发一条私聊消息",
        });
        authenticated = null;
      } else {
        // [OM-FREEPLAY] iLink 没有公开 health/auth 接口；申请 1 字节上传槽可同时验证
        // botToken、接收人和上传 API，但不会上传文件，也不会产生微信消息。
        const byte = Buffer.from("a");
        const slot = await timed(() =>
          getWeixinUploadUrl({
            session,
            toUserId: session.boundUserId,
            mediaType: WEIXIN_UPLOAD_MEDIA.file,
            filekey: randomUUID(),
            rawsize: byte.length,
            rawfilemd5: createHash("md5").update(byte).digest("hex"),
            filesize: 16,
            aeskeyHex: randomBytes(16).toString("hex"),
            fetchImpl,
          }),
        );
        authenticated = true;
        checks.push({
          name: "upload_slot",
          status: "passed",
          detail: "微信 token、绑定用户和上传接口有效；未上传文件、未发送消息",
          latencyMs: slot.latencyMs,
        });
      }
    } catch (error) {
      authenticated = false;
      checks.push({ name: "platform", status: "failed", detail: safeError(error) });
    }
  }

  const ok = cfg.enabled && configured && authenticated !== false &&
    !checks.some((check) => check.status === "failed") && (!live || authenticated === true);
  return {
    channel: "weixin",
    name: "微信 ClawBot",
    live,
    ok,
    configured,
    authenticated,
    capabilities: createMultimodalChannelCapabilities({ supportsQuote: false }),
    checks,
    nextAction: ok
      ? null
      : !configured
        ? "打开本地 /channels 扫码绑定微信 ClawBot，然后由主人先发一条私聊消息。"
        : "检查本地会话、绑定用户和 iLink 网络，再运行 pnpm channel:probe -- --channel weixin --live。",
    checkedAt: new Date().toISOString(),
  };
}

export async function probeChannel(
  channel: ChannelProbeName,
  opts: ProbeOptions = {},
): Promise<ChannelProbeReport> {
  return channel === "qq" ? probeQq(opts) : probeWeixin(opts);
}

export async function probeAllChannels(opts: ProbeOptions = {}): Promise<ChannelProbeReport[]> {
  return Promise.all([probeQq(opts), probeWeixin(opts)]);
}
