/**
 * 微信 ClawBot 的本地配置与会话存储。
 *
 * 事实源是 data 下的本机会话文件；这里只读写受控路径，不启动轮询器、不依赖消息网关或数据库。
 * 会话不得进入 Git/日志；文件损坏或凭据缺失时返回未登录/明确错误，不猜测恢复平台状态。
 */
import fs from "node:fs";
import path from "node:path";
import {
  WEIXIN_ILINK_DEFAULT_BASE,
  type WeixinIlinkSession,
} from "./weixinIlink.js";

export type WeixinClawBotConfig = {
  enabled: boolean;
  allowedUserIds: string[];
  baseUrl: string;
  sessionDir: string;
};

export function loadWeixinClawBotConfigFromEnv(dataDir?: string): WeixinClawBotConfig {
  const allowedUserIds = (process.env.WEIXIN_CLAWBOT_ALLOWED_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const baseUrl = (process.env.WEIXIN_CLAWBOT_API_BASE || WEIXIN_ILINK_DEFAULT_BASE).trim();
  const root = dataDir || process.env.OM_DATA_DIR || path.join(process.cwd(), "data");
  return {
    enabled: process.env.WEIXIN_CLAWBOT_ENABLED !== "false",
    allowedUserIds,
    baseUrl,
    sessionDir: path.join(root, "weixin-clawbot"),
  };
}

function sessionFile(dir: string): string {
  return path.join(dir, "session.json");
}

/**
 * 读取微信会话。调用方不得记录 botToken，也不得把返回值传给前端。
 */
export function readWeixinClawBotSession(dir: string): WeixinIlinkSession | null {
  try {
    const raw = fs.readFileSync(sessionFile(dir), "utf8");
    const parsed = JSON.parse(raw) as Partial<WeixinIlinkSession>;
    if (!parsed.botToken) return null;
    return {
      botToken: String(parsed.botToken),
      baseUrl: String(parsed.baseUrl || WEIXIN_ILINK_DEFAULT_BASE),
      getUpdatesBuf: String(parsed.getUpdatesBuf || ""),
      boundUserId: String(parsed.boundUserId || ""),
      accountId: String(parsed.accountId || ""),
      lastContextToken: String(parsed.lastContextToken || ""),
    };
  } catch {
    return null;
  }
}

export function writeWeixinClawBotSession(dir: string, session: WeixinIlinkSession): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(sessionFile(dir), JSON.stringify(session), { encoding: "utf8", mode: 0o600 });
}

export function deleteWeixinClawBotSession(dir: string): void {
  try {
    fs.unlinkSync(sessionFile(dir));
  } catch {
    // 会话不存在时，登出已达到目标，不需要把它当成失败。
  }
}
