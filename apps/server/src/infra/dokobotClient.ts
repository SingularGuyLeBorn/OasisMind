/**
 * Dokobot CLI 封装：用本机真实 Chrome（扩展 + bridge）读网页 / 搜索。
 * 本地模式免费无限；缺 CLI/扩展时返回可操作的安装提示，由调用方回退 read_article。
 */

import { execFile, type ExecFileOptions } from "node:child_process";

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

export type DokobotMode = "local" | "remote";

export interface DokobotRunOptions {
  /** 子命令：read | search */
  command: "read" | "search";
  /** read 的 URL，或 search 的查询词 */
  target: string;
  /** 默认 local（免费） */
  mode?: DokobotMode;
  /** 多屏滚动阅读（read） */
  screens?: number;
  /** 会话续读 */
  sessionId?: string;
  timeoutMs?: number;
  /** CLI 可执行文件；默认 DOKOBOT_BIN 或 dokobot */
  bin?: string;
}

export interface DokobotRunResult {
  ok: true;
  stdout: string;
  stderr: string;
  mode: DokobotMode;
  command: string;
  args: string[];
}

export interface DokobotRunError {
  ok: false;
  code:
    | "DOKOBOT_NOT_INSTALLED"
    | "DOKOBOT_NOT_CONNECTED"
    | "DOKOBOT_TIMEOUT"
    | "DOKOBOT_FAILED"
    | "DOKOBOT_BAD_ARGS";
  message: string;
  installHint: string;
  fallbackTool: "read_article" | "web_search";
  stderr?: string;
  stdout?: string;
}

const INSTALL_HINT =
  "本机安装：1) Chrome 装 Dokobot 扩展 https://dokobot.ai/install  2) npm i -g @dokobot/cli  3) dokobot install-bridge  4) 保持 Chrome 打开。装好后重试；或改用 native:read_article / web_search。";

function resolveBin(explicit?: string): string {
  const fromEnv = process.env.DOKOBOT_BIN?.trim();
  return explicit?.trim() || fromEnv || "dokobot";
}

function buildArgs(opts: DokobotRunOptions): string[] {
  const mode: DokobotMode = opts.mode === "remote" ? "remote" : "local";
  const args: string[] = [opts.command, opts.target];
  if (mode === "local") args.push("--local");
  if (opts.command === "read") {
    if (opts.screens != null && Number.isFinite(opts.screens) && opts.screens > 0) {
      args.push("--screens", String(Math.min(50, Math.floor(opts.screens))));
    }
    if (opts.sessionId?.trim()) {
      args.push("--session-id", opts.sessionId.trim());
    }
  }
  return args;
}

function classifyError(
  err: unknown,
  fallbackTool: "read_article" | "web_search",
): DokobotRunError {
  const anyErr = err as {
    code?: string;
    message?: string;
    stderr?: string;
    stdout?: string;
    killed?: boolean;
    signal?: string;
  };
  const msg = String(anyErr?.message || err || "");
  const stderr = typeof anyErr?.stderr === "string" ? anyErr.stderr : "";
  const stdout = typeof anyErr?.stdout === "string" ? anyErr.stdout : "";
  const combined = `${msg}\n${stderr}\n${stdout}`.toLowerCase();

  if (anyErr?.code === "ENOENT" || /not recognized|command not found|enoent/i.test(msg)) {
    return {
      ok: false,
      code: "DOKOBOT_NOT_INSTALLED",
      message: "未找到 dokobot CLI（本机未安装或不在 PATH）。",
      installHint: INSTALL_HINT,
      fallbackTool,
      stderr,
      stdout,
    };
  }
  if (
    anyErr?.killed ||
    anyErr?.signal === "SIGTERM" ||
    /timed? ?out|etimedout|504/i.test(combined)
  ) {
    return {
      ok: false,
      code: "DOKOBOT_TIMEOUT",
      message: "Dokobot 调用超时。可加大 timeout，或确认 Chrome 扩展已连接。",
      installHint: INSTALL_HINT,
      fallbackTool,
      stderr,
      stdout,
    };
  }
  if (/503|no extension|not connected|bridge|install-bridge/i.test(combined)) {
    return {
      ok: false,
      code: "DOKOBOT_NOT_CONNECTED",
      message: "Dokobot 扩展/桥接未连接（Chrome 未开或未 install-bridge）。",
      installHint: INSTALL_HINT,
      fallbackTool,
      stderr,
      stdout,
    };
  }
  return {
    ok: false,
    code: "DOKOBOT_FAILED",
    message: msg.slice(0, 500) || "Dokobot 调用失败",
    installHint: INSTALL_HINT,
    fallbackTool,
    stderr: stderr.slice(0, 2000),
    stdout: stdout.slice(0, 2000),
  };
}

/** 执行 dokobot CLI；成功返回 stdout 文本，失败返回结构化错误（不抛） */
export async function runDokobotCli(
  opts: DokobotRunOptions,
): Promise<DokobotRunResult | DokobotRunError> {
  const target = String(opts.target || "").trim();
  if (!target) {
    return {
      ok: false,
      code: "DOKOBOT_BAD_ARGS",
      message: opts.command === "search" ? "需要 query" : "需要 url",
      installHint: INSTALL_HINT,
      fallbackTool: opts.command === "search" ? "web_search" : "read_article",
    };
  }

  const mode: DokobotMode = opts.mode === "remote" ? "remote" : "local";
  const bin = resolveBin(opts.bin);
  const args = buildArgs({ ...opts, mode, target });
  const timeoutMs = Math.min(
    300_000,
    Math.max(5_000, Number(opts.timeoutMs) || 120_000),
  );
  const fallbackTool = opts.command === "search" ? "web_search" : "read_article";

  try {
    const { stdout, stderr } = await execFilePromise(bin, args, {
      timeout: timeoutMs,
      maxBuffer: 8 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env },
    });
    const text = String(stdout || "").trim();
    if (!text) {
      return {
        ok: false,
        code: "DOKOBOT_FAILED",
        message: "Dokobot 返回空内容（页面可能空白，或扩展未抓到正文）。",
        installHint: INSTALL_HINT,
        fallbackTool,
        stderr: String(stderr || "").slice(0, 2000),
      };
    }
    return {
      ok: true,
      stdout: text,
      stderr: String(stderr || "").trim(),
      mode,
      command: bin,
      args,
    };
  } catch (err) {
    return classifyError(err, fallbackTool);
  }
}

/** 探测 CLI 是否在 PATH（不做网页读取） */
export async function probeDokobotInstalled(bin?: string): Promise<boolean> {
  const resolved = resolveBin(bin);
  try {
    await execFilePromise(resolved, ["--version"], {
      timeout: 8_000,
      windowsHide: true,
    });
    return true;
  } catch {
    return false;
  }
}
