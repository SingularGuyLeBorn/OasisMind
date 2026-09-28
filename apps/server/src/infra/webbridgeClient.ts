/**
 * Kimi WebBridge：本机 daemon（默认 127.0.0.1:10086）+ Chrome/Edge 扩展。
 * 用真实浏览器会话 navigate/click/fill/snapshot；Node 发 UTF-8 JSON（避开 Windows shell 中文乱码）。
 */

import { execFile, type ExecFileOptions } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

function execFilePromise(
  bin: string,
  args: string[],
  opts: ExecFileOptions,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(bin, args, { encoding: "utf8", ...opts }, (err, stdout, stderr) => {
      if (err) {
        const enriched = err as Error & { stdout?: string; stderr?: string };
        enriched.stdout = String(stdout ?? "");
        enriched.stderr = String(stderr ?? "");
        reject(enriched);
        return;
      }
      resolve({ stdout: String(stdout ?? ""), stderr: String(stderr ?? "") });
    });
  });
}

export const WEBBRIDGE_INSTALL_HINT =
  "本机安装：1) 打开 https://www.kimi.com/zh-cn/features/webbridge 装 Chrome/Edge 扩展 2) 扩展会拉起 ~/.kimi-webbridge/bin/kimi-webbridge 3) 点扩展图标确认 Connected。daemon 未起可调 webbridge_start。只读网页可改用 dokobot_read / read_article。";

export type WebbridgeErrorCode =
  | "WEBBRIDGE_NOT_INSTALLED"
  | "WEBBRIDGE_DAEMON_DOWN"
  | "WEBBRIDGE_NOT_CONNECTED"
  | "WEBBRIDGE_TIMEOUT"
  | "WEBBRIDGE_FAILED"
  | "WEBBRIDGE_BAD_ARGS";

export interface WebbridgeError {
  ok: false;
  code: WebbridgeErrorCode;
  message: string;
  installHint: string;
  statusCode?: number;
  body?: unknown;
}

export interface WebbridgeDaemonStatus {
  ok: true;
  running: boolean;
  extensionConnected: boolean;
  port: number;
  version?: string;
  extensionId?: string;
  extensionVersion?: string;
  uptimeSeconds?: number;
  updateAvailable?: unknown;
  raw: unknown;
  bin: string;
  baseUrl: string;
}

function defaultBinPath(): string {
  const base = path.join(homedir(), ".kimi-webbridge", "bin");
  return process.platform === "win32"
    ? path.join(base, "kimi-webbridge.exe")
    : path.join(base, "kimi-webbridge");
}

export function resolveWebbridgeBin(explicit?: string): string {
  const fromEnv = process.env.WEBBRIDGE_BIN?.trim();
  if (explicit?.trim()) return explicit.trim();
  if (fromEnv) return fromEnv;
  const homeBin = defaultBinPath();
  if (existsSync(homeBin)) return homeBin;
  return process.platform === "win32" ? "kimi-webbridge.exe" : "kimi-webbridge";
}

export function resolveWebbridgeBaseUrl(explicit?: string): string {
  const raw =
    explicit?.trim() ||
    process.env.WEBBRIDGE_URL?.trim() ||
    "http://127.0.0.1:10086";
  return raw.replace(/\/+$/, "");
}

function parseJsonLoose(text: string): unknown {
  const t = text.trim();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    // status 偶发在 JSON 前带升级提示行
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(t.slice(start, end + 1));
      } catch {
        return { text: t.slice(0, 4000) };
      }
    }
    return { text: t.slice(0, 4000) };
  }
}

function classifyHttpFailure(
  status: number,
  body: unknown,
  message: string,
): WebbridgeError {
  const text = `${message} ${typeof body === "string" ? body : JSON.stringify(body ?? "")}`.toLowerCase();
  if (status === 502 || /extension|not connected|no client|bad gateway/i.test(text)) {
    return {
      ok: false,
      code: "WEBBRIDGE_NOT_CONNECTED",
      message: "WebBridge daemon 在跑，但浏览器扩展未 Connected。请打开 Chrome/Edge 并点扩展图标确认连接。",
      installHint: WEBBRIDGE_INSTALL_HINT,
      statusCode: status,
      body,
    };
  }
  return {
    ok: false,
    code: "WEBBRIDGE_FAILED",
    message: message.slice(0, 500) || `WebBridge HTTP ${status}`,
    installHint: WEBBRIDGE_INSTALL_HINT,
    statusCode: status,
    body,
  };
}

/** 读 daemon/扩展状态：优先 CLI status JSON，失败再探 HTTP */
export async function getWebbridgeStatus(opts?: {
  bin?: string;
  baseUrl?: string;
  timeoutMs?: number;
}): Promise<WebbridgeDaemonStatus | WebbridgeError> {
  const bin = resolveWebbridgeBin(opts?.bin);
  const baseUrl = resolveWebbridgeBaseUrl(opts?.baseUrl);
  const timeoutMs = Math.min(30_000, Math.max(2_000, Number(opts?.timeoutMs) || 8_000));

  if (!existsSync(bin) && !bin.includes(path.sep) && !bin.includes("/")) {
    // PATH 名稍后由 exec 判定
  } else if (!existsSync(bin) && (bin.includes(path.sep) || bin.includes("/"))) {
    return {
      ok: false,
      code: "WEBBRIDGE_NOT_INSTALLED",
      message: `未找到 WebBridge daemon：${bin}`,
      installHint: WEBBRIDGE_INSTALL_HINT,
    };
  }

  try {
    const { stdout, stderr } = await execFilePromise(bin, ["status"], {
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024,
    });
    const raw = parseJsonLoose(stdout || stderr);
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const o = raw as Record<string, unknown>;
      return {
        ok: true,
        running: Boolean(o.running),
        extensionConnected: Boolean(o.extension_connected ?? o.extensionConnected),
        port: Number(o.port) || 10086,
        version: typeof o.version === "string" ? o.version : undefined,
        extensionId:
          typeof o.extension_id === "string"
            ? o.extension_id
            : typeof o.extensionId === "string"
              ? o.extensionId
              : undefined,
        extensionVersion:
          typeof o.extension_version === "string"
            ? o.extension_version
            : typeof o.extensionVersion === "string"
              ? o.extensionVersion
              : undefined,
        uptimeSeconds:
          typeof o.uptime_seconds === "number"
            ? o.uptime_seconds
            : typeof o.uptimeSeconds === "number"
              ? o.uptimeSeconds
              : undefined,
        updateAvailable: o.update_available ?? o.updateAvailable,
        raw,
        bin,
        baseUrl,
      };
    }
  } catch (err) {
    const anyErr = err as { code?: string; message?: string };
    if (anyErr?.code === "ENOENT" || /not recognized|command not found|enoent/i.test(String(anyErr?.message))) {
      return {
        ok: false,
        code: "WEBBRIDGE_NOT_INSTALLED",
        message: "未找到 kimi-webbridge 可执行文件（未安装或不在 PATH）。",
        installHint: WEBBRIDGE_INSTALL_HINT,
      };
    }
    // CLI 失败时继续 HTTP 探测
  }

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    const res = await fetch(`${baseUrl}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ action: "list_tabs", args: {}, session: "oasismind-status" }),
      signal: ac.signal,
    });
    clearTimeout(timer);
    if (res.ok || res.status === 502) {
      return {
        ok: true,
        running: true,
        extensionConnected: res.ok,
        port: Number(new URL(baseUrl).port) || 10086,
        raw: { httpProbe: res.status },
        bin,
        baseUrl,
      };
    }
  } catch {
    /* daemon down */
  }

  return {
    ok: true,
    running: false,
    extensionConnected: false,
    port: Number(new URL(baseUrl).port) || 10086,
    raw: { note: "daemon 未响应" },
    bin,
    baseUrl,
  };
}

/** 启动本机 daemon（已在跑则通常 no-op） */
export async function startWebbridgeDaemon(opts?: {
  bin?: string;
  timeoutMs?: number;
}): Promise<{ ok: true; message: string; bin: string; stdout: string } | WebbridgeError> {
  const bin = resolveWebbridgeBin(opts?.bin);
  const timeoutMs = Math.min(60_000, Math.max(3_000, Number(opts?.timeoutMs) || 15_000));

  try {
    const { stdout, stderr } = await execFilePromise(bin, ["start"], {
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024,
    });
    const text = `${stdout}\n${stderr}`.trim();
    return {
      ok: true,
      message: text || "kimi-webbridge start 已执行",
      bin,
      stdout: text,
    };
  } catch (err) {
    const anyErr = err as {
      code?: string;
      message?: string;
      stdout?: string;
      stderr?: string;
    };
    const combined = `${anyErr?.message || ""}\n${anyErr?.stdout || ""}\n${anyErr?.stderr || ""}`;
    if (anyErr?.code === "ENOENT" || /not recognized|command not found|enoent/i.test(combined)) {
      return {
        ok: false,
        code: "WEBBRIDGE_NOT_INSTALLED",
        message: "未找到 kimi-webbridge，无法 start。",
        installHint: WEBBRIDGE_INSTALL_HINT,
      };
    }
    if (/already|running|pid/i.test(combined) && !/refused|error:/i.test(combined)) {
      return {
        ok: true,
        message: combined.trim().slice(0, 500) || "daemon 可能已在运行",
        bin,
        stdout: combined.trim(),
      };
    }
    return {
      ok: false,
      code: "WEBBRIDGE_FAILED",
      message: (anyErr?.message || "start 失败").slice(0, 500),
      installHint: WEBBRIDGE_INSTALL_HINT,
      body: { stdout: anyErr?.stdout, stderr: anyErr?.stderr },
    };
  }
}

export interface WebbridgeCommandOptions {
  action: string;
  args?: Record<string, unknown>;
  /** 任务级 session（顶层字段，不是 args） */
  session: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface WebbridgeCommandResult {
  ok: true;
  action: string;
  session: string;
  statusCode: number;
  data: unknown;
}

/** POST /command；UTF-8 JSON body，不经 shell */
export async function runWebbridgeCommand(
  opts: WebbridgeCommandOptions,
): Promise<WebbridgeCommandResult | WebbridgeError> {
  const action = String(opts.action || "").trim();
  const session = String(opts.session || "").trim();
  if (!action) {
    return {
      ok: false,
      code: "WEBBRIDGE_BAD_ARGS",
      message: "需要 action（如 navigate / snapshot / click / fill）",
      installHint: WEBBRIDGE_INSTALL_HINT,
    };
  }
  if (!session) {
    return {
      ok: false,
      code: "WEBBRIDGE_BAD_ARGS",
      message: "需要顶层 session（同一任务固定一个名字，如 camping-research）",
      installHint: WEBBRIDGE_INSTALL_HINT,
    };
  }

  const baseUrl = resolveWebbridgeBaseUrl(opts.baseUrl);
  const timeoutMs = Math.min(
    300_000,
    Math.max(5_000, Number(opts.timeoutMs) || 120_000),
  );
  const body = {
    action,
    args: opts.args && typeof opts.args === "object" ? opts.args : {},
    session,
  };

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(`${baseUrl}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
        signal: ac.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    const text = await res.text();
    const data = parseJsonLoose(text);

    if (!res.ok) {
      return classifyHttpFailure(
        res.status,
        data ?? text.slice(0, 2000),
        `WebBridge HTTP ${res.status}`,
      );
    }

    return {
      ok: true,
      action,
      session,
      statusCode: res.status,
      data,
    };
  } catch (err) {
    const anyErr = err as { name?: string; message?: string; cause?: unknown };
    const msg = String(anyErr?.message || err || "");
    if (anyErr?.name === "AbortError" || /aborted|timed? ?out/i.test(msg)) {
      return {
        ok: false,
        code: "WEBBRIDGE_TIMEOUT",
        message: "WebBridge /command 超时。可加大 timeout，或确认扩展 Connected。",
        installHint: WEBBRIDGE_INSTALL_HINT,
      };
    }
    if (/ECONNREFUSED|fetch failed|network|ENOTFOUND/i.test(msg)) {
      return {
        ok: false,
        code: "WEBBRIDGE_DAEMON_DOWN",
        message: "无法连接 WebBridge daemon（通常需先 webbridge_start）。",
        installHint: WEBBRIDGE_INSTALL_HINT,
      };
    }
    return {
      ok: false,
      code: "WEBBRIDGE_FAILED",
      message: msg.slice(0, 500),
      installHint: WEBBRIDGE_INSTALL_HINT,
    };
  }
}
