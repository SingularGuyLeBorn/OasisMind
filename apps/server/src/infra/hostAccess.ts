/**
 * 主机访问授权 — 与 Workspace 隔离正交。
 *
 * Workspace 仍是花园沙箱（默认 write_file / run_shell cwd）。
 * native:host_access 才允许碰 config.yaml hostAccess.roots 内的本机目录。
 * 群聊 ChannelBinding（peerId=__group__）一律拒绝，防他人 @ 机器人操控电脑。
 */
import fs from "fs";
import os from "os";
import path from "path";
import type { PrismaClient } from "@prisma/client";
import type { AppConfig } from "./config.js";
import { resolveRealWriteTarget } from "./safePath.js";

export const HOST_ACCESS_TOOL = "host_access";

/** 必须与 channelBinding.CHANNEL_GROUP_PEER 一致；本文件不引 channelBinding 以免拖进 MCP 环。 */
const IM_GROUP_PEER = "__group__";

const HOST_ALIASES: Record<string, string> = {
  desktop: "%USERPROFILE%/Desktop",
  documents: "%USERPROFILE%/Documents",
  downloads: "%USERPROFILE%/Downloads",
};

const SENSITIVE_HOST_RE = [
  /(?:^|\/)\.ssh(?:\/|$)/i,
  /(?:^|\/)\.gnupg(?:\/|$)/i,
  /\/windows\/system32(?:\/|$)/i,
  /ntuser\.dat/i,
  /\/appdata\/(?:local|roaming)\/microsoft\/credentials(?:\/|$)/i,
];

export function agentHasHostAccess(tools?: string[] | null): boolean {
  return (tools ?? []).some((t) => t === `native:${HOST_ACCESS_TOOL}` || t === HOST_ACCESS_TOOL);
}

export function looksLikeHostPath(raw: string): boolean {
  const p = String(raw ?? "").trim().replace(/\\/g, "/");
  if (!p) return false;
  if (p.toLowerCase().startsWith("host:")) return true;
  if (/^[a-zA-Z]:[\\/]/.test(p)) return true;
  if (p.startsWith("//") || p.startsWith("\\\\")) return true;
  if (p.startsWith("/")) return true;
  return false;
}

export function isAbsInside(dir: string, abs: string): boolean {
  const root = resolveRealWriteTarget(path.resolve(dir));
  const normalized = resolveRealWriteTarget(path.resolve(abs));
  const cmpRoot = process.platform === "win32" ? root.toLowerCase() : root;
  const cmpAbs = process.platform === "win32" ? normalized.toLowerCase() : normalized;
  const prefix = cmpRoot.endsWith(path.sep) ? cmpRoot : cmpRoot + path.sep;
  return cmpAbs === cmpRoot || cmpAbs.startsWith(prefix);
}

export function expandHostToken(raw: string): string {
  let s = String(raw ?? "").trim();
  if (!s) throw new Error("hostAccess 路径为空");
  if (s.startsWith("~")) {
    s = path.join(os.homedir(), s.slice(1).replace(/^[\\/]+/, ""));
  }
  s = s.replace(/%([^%]+)%/g, (_, key: string) => {
    const envVal = process.env[key] ?? process.env[key.toUpperCase()] ?? process.env[key.toLowerCase()];
    if (envVal) return envVal;
    if (/^(USERPROFILE|HOME)$/i.test(key)) return os.homedir();
    throw new Error(`无法展开环境变量 %${key}%`);
  });
  return path.resolve(s);
}

export function listExpandedHostRoots(config: AppConfig): string[] {
  const roots = config.hostAccess?.roots ?? [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of roots) {
    try {
      const abs = expandHostToken(raw);
      const key = process.platform === "win32" ? abs.toLowerCase() : abs;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(abs);
    } catch (err) {
      console.warn("[hostAccess] skip root:", raw, err instanceof Error ? err.message : err);
    }
  }
  return out;
}

export function findContainingHostRoot(abs: string, roots: string[]): string | null {
  const resolved = path.resolve(abs);
  let best: string | null = null;
  for (const root of roots) {
    if (!isAbsInside(root, resolved)) continue;
    if (!best || root.length > best.length) best = root;
  }
  return best;
}

export function toHostDisplayPath(abs: string): string {
  return `host:${path.resolve(abs).replace(/\\/g, "/")}`;
}

export function isSensitiveHostPath(abs: string): boolean {
  const n = path.resolve(abs).replace(/\\/g, "/");
  return SENSITIVE_HOST_RE.some((re) => re.test(n));
}

export function isDesktopMcpServer(serverName: string, config: AppConfig): boolean {
  const names = config.hostAccess?.desktopMcpServers ?? ["windows-mcp"];
  return names.includes(serverName);
}

export function isHostAccessEnabled(config: AppConfig): boolean {
  return config.hostAccess?.enabled === true;
}

/** UI Automation 白名单：截屏/点按/打字/滚轮/开应用。不含 PowerShell/注册表/文件系统/杀进程/剪贴板。 */
export const DEFAULT_DESKTOP_MCP_ALLOWED_TOOLS = [
  "Screenshot",
  "Click",
  "Type",
  "Scroll",
  "Move",
  "Wait",
  "WaitFor",
  "DisplayInventory",
  "Snapshot",
  "App",
] as const;

export function listDesktopMcpAllowedTools(config: AppConfig): string[] {
  const extra = (config.hostAccess?.desktopMcpAllowedTools ?? []).map((t) => t.trim()).filter(Boolean);
  return extra.length > 0 ? extra : [...DEFAULT_DESKTOP_MCP_ALLOWED_TOOLS];
}

export function isDesktopMcpToolAllowed(toolName: string, config: AppConfig): boolean {
  const n = String(toolName ?? "").trim().toLowerCase();
  if (!n) return false;
  return listDesktopMcpAllowedTools(config).some((t) => t.toLowerCase() === n);
}

/**
 * 把 host:Desktop/foo 或绝对路径解析到授权根内。
 * 不在 roots 内返回 null（调用方决定抛错文案）。
 */
export function resolveHostAbsolutePath(config: AppConfig, raw: string): string | null {
  const roots = listExpandedHostRoots(config);
  if (roots.length === 0) return null;
  const p = String(raw ?? "").trim().replace(/\\/g, "/");
  let candidate: string;
  if (p.toLowerCase().startsWith("host:")) {
    const rest = p.slice(5).replace(/^\/+/, "");
    if (!rest) {
      throw new Error("host: 后面需要别名或绝对路径，例如 host:Desktop 或 host:D:/notes");
    }
    const aliasMatch = rest.match(/^(Desktop|Documents|Downloads)(?:\/(.*))?$/i);
    if (aliasMatch) {
      const aliasKey = aliasMatch[1].toLowerCase();
      const base = expandHostToken(HOST_ALIASES[aliasKey] ?? aliasMatch[1]);
      candidate = aliasMatch[2] ? path.resolve(base, aliasMatch[2]) : path.resolve(base);
    } else if (/^[a-zA-Z]:[\\/]/.test(rest) || rest.startsWith("/") || rest.startsWith("//")) {
      candidate = path.resolve(expandHostToken(rest));
    } else {
      throw new Error(
        `host: 路径请用 Desktop/Documents/Downloads 别名或绝对路径，收到「${rest}」。下一步：先调 host_access 看 roots。`,
      );
    }
  } else {
    candidate = path.resolve(expandHostToken(p));
  }
  if (candidate.includes("..") || path.normalize(candidate).split(path.sep).includes("..")) {
    throw new Error("主机路径不允许包含 ..");
  }
  return findContainingHostRoot(candidate, roots) ? candidate : null;
}

export function assertHostReadPathSafe(config: AppConfig, abs: string): void {
  const roots = listExpandedHostRoots(config);
  const lexical = path.resolve(abs);
  if (!findContainingHostRoot(lexical, roots)) {
    throw new Error(`路径不在 hostAccess.roots 内：${lexical}`);
  }
  if (isSensitiveHostPath(lexical)) {
    throw new Error(`拒绝访问敏感主机路径：${lexical}`);
  }
  if (!fs.existsSync(lexical)) return;
  const real = fs.realpathSync(lexical);
  if (!findContainingHostRoot(real, roots)) {
    throw new Error(`真实路径逃出授权目录（junction/symlink）：${real}`);
  }
  if (isSensitiveHostPath(real)) {
    throw new Error(`拒绝访问敏感主机路径：${real}`);
  }
}

export function assertHostWritePathSafe(config: AppConfig, abs: string): void {
  const roots = listExpandedHostRoots(config);
  const lexical = path.resolve(abs);
  if (!findContainingHostRoot(lexical, roots)) {
    throw new Error(`禁止写入未授权主机路径：${lexical}`);
  }
  if (isSensitiveHostPath(lexical)) {
    throw new Error(`拒绝写入敏感主机路径：${lexical}`);
  }
  const real = resolveRealWriteTarget(lexical);
  if (!findContainingHostRoot(real, roots)) {
    throw new Error(`写目标真实路径逃出授权目录（junction/symlink）：${real}`);
  }
  if (isSensitiveHostPath(real)) {
    throw new Error(`拒绝写入敏感主机路径：${real}`);
  }
}

export async function assertHostSessionAllowed(opts: {
  config: AppConfig;
  prisma?: PrismaClient;
  sessionId?: string;
  tools?: string[] | null;
  /** FS 需要 native:host_access；桌面 MCP 已在 Agent tools 里挂了 mcp:windows-mcp 时可 false */
  requireCapability?: boolean;
}): Promise<void> {
  if (!isHostAccessEnabled(opts.config)) {
    throw new Error(
      "hostAccess.enabled=false：主机/桌面能力已关闭。在 config.yaml 把 hostAccess.enabled 设为 true。",
    );
  }
  if (opts.requireCapability !== false && !agentHasHostAccess(opts.tools)) {
    throw new Error(
      "当前 Agent 未授予 native:host_access，不能读写 Workspace 外的主机目录。请把该工具加进 Agent tools。",
    );
  }
  if (!opts.sessionId || !opts.prisma) return;
  const binding = await opts.prisma.channelBinding.findFirst({
    where: { sessionId: opts.sessionId },
    select: { peerId: true },
    orderBy: { lastMessageAt: "desc" },
  });
  if (binding?.peerId === IM_GROUP_PEER) {
    throw new Error("群聊禁止主机/桌面操控（防他人 @ 机器人操作你的电脑）。请私聊远程助手。");
  }
}
