/**
 * 受限 Shell 执行 — 主机模式，项目根目录内、超时与输出上限、危险命令拦截
 *
 * 沙箱方案：host_restricted（用户选定，2026-06-28）
 * - Skill 代码沙箱仍使用 node:vm（见 skillRunner.ts），与此模块无关
 */

import { execFile } from "child_process";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import type { AppConfig } from "./config.js";
import { isAbsInside } from "./hostAccess.js";

const execFileAsync = promisify(execFile);

export type ShellMode = "disabled" | "host_restricted" | "host_full" | "docker";

/** 传给子进程时需剔除的敏感环境变量键模式（防恶意命令读取 API Key/Token 泄漏）。
 * 宽松策略：变量名只要含敏感子串即剔除——旧的前/后缀精确匹配漏掉
 * EMAIL_SMTP_PASS / ZHIHU_COOKIE / YUQUE_CTOKEN 等真实泄漏案例。 */
const SENSITIVE_ENV_RE = /API_KEY|TOKEN|SECRET|PASSWORD|PASSWD|COOKIE|CREDENTIAL|CTOKEN|_PASS/i;

/** 从 process.env 派生一份剔除敏感键的子进程环境（P2 安全加固） */
export function buildSandboxEnv(): Record<string, string | undefined> {
  const safe: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (SENSITIVE_ENV_RE.test(k)) continue;
    safe[k] = v;
  }
  return safe;
}

/** 软删除铁律：一切「删文件/目录」的 shell 一律拒绝，逼回 native:*_delete（进 .trash） */
const SHELL_DELETE_BLOCKED =
  "禁止用 shell 删除文件/目录（硬删不可恢复）。请用 native:file_delete / directory_delete / post_delete / garden_delete（软删进回收站）；恢复用 native:trash_restore。";

/** 写/移文件铁律：shell 直写绕过 Workspace 隔离与回收站，逼回 native 文件工具 */
const SHELL_WRITE_BLOCKED =
  "禁止用 shell 写入/移动文件。请用 native:write_file / append_to_file（落 Workspace，可审计）；移动可用 write_file + file_delete 组合。";

/** 明显危险的命令片段（大小写不敏感） */
const BLOCKED_PATTERNS: Array<{ re: RegExp; message?: string }> = [
  // 软删铁律：任意 rm / del / Remove-Item / rmdir 等（含 git rm、docker rm 一并拦，防旁路硬删）
  { re: /(^|[\s;&|])(rm|rmdir|rd)\b/i, message: SHELL_DELETE_BLOCKED },
  { re: /(^|[\s;&|])(del|erase)\b/i, message: SHELL_DELETE_BLOCKED },
  { re: /\bRemove-Item\b/i, message: SHELL_DELETE_BLOCKED },
  { re: /\bClear-Item\b/i, message: SHELL_DELETE_BLOCKED },
  // PowerShell .NET 直删/直写 API（绕过 Remove-Item 关键字）
  { re: /\[\s*(?:System\.)?IO\.(?:File|Directory)\s*\]::\s*Delete/i, message: SHELL_DELETE_BLOCKED },
  { re: /\[\s*(?:System\.)?IO\.File\s*\]::\s*(WriteAll|AppendAll)/i, message: SHELL_WRITE_BLOCKED },
  { re: /\brimraf\b/i, message: SHELL_DELETE_BLOCKED },
  { re: /\bunlink\b/i, message: SHELL_DELETE_BLOCKED },
  { re: /\bgit\s+rm\b/i, message: SHELL_DELETE_BLOCKED },
  // PowerShell 移动/写文件（应走 native 文件工具，便于回收站与 Workspace 隔离）
  { re: /\bMove-Item\b/i, message: SHELL_WRITE_BLOCKED },
  { re: /\bSet-Content\b/i, message: SHELL_WRITE_BLOCKED },
  { re: /\bOut-File\b/i, message: SHELL_WRITE_BLOCKED },
  { re: /\bAdd-Content\b/i, message: SHELL_WRITE_BLOCKED },
  { re: /\bTee-Object\b/i, message: SHELL_WRITE_BLOCKED },
  { re: /(^|[\s;|&])>>\s*\S/, message: SHELL_WRITE_BLOCKED },
  // 下载执行（iex (iwr ...) / Invoke-Expression 动态执行远程脚本）
  { re: /\b(iex|Invoke-Expression)\b/i, message: "禁止动态执行（iex/Invoke-Expression），下载执行远程脚本属高危操作。" },
  { re: /\bformat\s+[a-z]:/i },
  { re: /\b(shutdown|reboot|poweroff|halt)\b/i },
  { re: /\bmkfs\b/i },
  { re: /\bdd\s+if=/i },
  { re: />\s*\/dev\/[a-z]/i },
  { re: /\bchmod\s+(-[^\s]*\s+)*777\s+\//i },
  { re: /\breg\s+delete\b/i },
  { re: /:\(\)\s*\{\s*:\|:&\s*\};:/ },
  { re: /\bcurl[^\n|]*\|\s*(ba)?sh\b/i },
  { re: /\bwget[^\n|]*\|\s*(ba)?sh\b/i },
];

export function assertShellEnabled(config: AppConfig): void {
  if (config.shell.mode === "disabled" || !config.shell.enabled) {
    throw new Error(
      "Shell 工具未启用。请在 .env 设置 SHELL_ENABLED=true 且 SHELL_MODE=host_restricted|docker",
    );
  }
  if (config.shell.mode === "host_full") {
    throw new Error("SHELL_MODE=host_full 尚未开放，请使用 host_restricted 或 docker");
  }
}

export function validateShellCommand(command: string): void {
  const trimmed = command.trim();
  if (!trimmed) throw new Error("command 不能为空");
  if (trimmed.length > 8000) throw new Error("command 过长（上限 8000 字符）");
  for (const { re, message } of BLOCKED_PATTERNS) {
    if (re.test(trimmed)) {
      throw new Error(
        message ?? `命令被安全策略拒绝：匹配危险模式 ${re.source.slice(0, 40)}…`,
      );
    }
  }
}

/** 扫描命令文本中的绝对路径 token（Windows 盘符 / UNC / POSIX 绝对），排除 URL。 */
function findCommandAbsolutePaths(command: string): string[] {
  const paths: string[] = [];
  // 先把 URL 挖掉，避免 https://example.com 被误当 POSIX 绝对路径
  const withoutUrls = command.replace(/[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s"'|;]+/g, "");
  // Windows 盘符路径，如 C:\Windows\win.ini 或 C:/tmp/a.txt
  const winRe = /([a-zA-Z]:[\\/][^\s"'|;]*)/g;
  let m: RegExpExecArray | null;
  while ((m = winRe.exec(withoutUrls)) !== null) paths.push(m[1]!);
  // UNC，如 \\server\share
  const uncRe = /(\\\\[^\s"'|;]*)/g;
  while ((m = uncRe.exec(withoutUrls)) !== null) paths.push(m[1]!);
  // POSIX 绝对路径，如 /etc/passwd；通过捕获组拿到路径本身
  const posixRe = /(^|[\s"'|;])(\/[^\s"'|;]*)/g;
  while ((m = posixRe.exec(withoutUrls)) !== null) paths.push(m[2]!);
  return paths;
}

/** host_restricted 模式下，拒绝命令里出现沙箱外的绝对路径。 */
function assertShellCommandPathsInsideSandbox(
  command: string,
  sandboxRoot: string,
  cwd: string,
): void {
  const roots = [path.resolve(sandboxRoot), path.resolve(cwd)];
  for (const token of findCommandAbsolutePaths(command)) {
    const resolved = path.resolve(token);
    if (!roots.some((r) => isAbsInside(r, resolved))) {
      throw new Error(
        `命令含沙箱外绝对路径 ${token}；host_restricted 不允许。读本机授权目录请走 native:host_access。`,
      );
    }
  }
}

/**
 * 解析 shell cwd。
 * @param rootDir 沙箱根（默认 projectRoot；run_shell 可收窄为 Agent Workspace，或放宽为 hostAccess root）
 */
export function resolveShellCwd(config: AppConfig, cwdArg?: string, rootDir?: string): string {
  const rel = (cwdArg || ".").replace(/\\/g, "/").replace(/^\/+/, "");
  if (rel.includes("..")) throw new Error("cwd 不允许包含 ..");
  const sandbox = path.resolve(rootDir || config.projectRoot);
  const abs =
    cwdArg && path.isAbsolute(cwdArg) && isAbsInside(sandbox, cwdArg)
      ? path.resolve(cwdArg)
      : path.resolve(sandbox, rel === "." ? "." : rel);
  const sandboxPrefix = sandbox.endsWith(path.sep) ? sandbox : sandbox + path.sep;
  if (abs !== sandbox && !abs.startsWith(sandboxPrefix) && !isAbsInside(sandbox, abs)) {
    throw new Error("cwd 超出沙箱根目录范围");
  }
  const projectRoot = path.resolve(config.projectRoot);
  if (isAbsInside(projectRoot, sandbox) && !isAbsInside(projectRoot, abs)) {
    throw new Error("cwd 超出项目根目录范围");
  }
  return abs;
}

/** Windows 上 PATH 的 bash.exe 经常是未装发行版的 WSL 存根，跑出来是 UTF-16 商店广告。 */
function isWindowsWslBashStub(absPath: string): boolean {
  const n = absPath.replace(/\\/g, "/").toLowerCase();
  return (
    n.endsWith("/system32/bash.exe") ||
    n.endsWith("/syswow64/bash.exe") ||
    n.includes("/windowsapps/")
  );
}

/** [OM-FREEPLAY] Git for Windows 的常见安装位；未指定其它探测顺序。 */
function resolveWindowsGitBash(): string | null {
  const candidates = [
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Git", "bin", "bash.exe"),
    process.env["ProgramFiles(x86)"] && path.join(process.env["ProgramFiles(x86)"], "Git", "bin", "bash.exe"),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Programs", "Git", "bin", "bash.exe"),
  ].filter((p): p is string => Boolean(p));
  for (const c of candidates) {
    if (fs.existsSync(c) && !isWindowsWslBashStub(c)) return c;
  }
  return null;
}

function resolveShellExecutable(config: AppConfig, shell?: string): { file: string; argsPrefix: string[] } {
  const prefer = shell || config.shell.shell || "auto";
  const isWin = process.platform === "win32";

  if (prefer === "bash") {
    if (isWin) {
      const gitBash = resolveWindowsGitBash();
      if (!gitBash) {
        throw new Error(
          "未找到可用的 bash。Windows 上 PATH 里的 bash.exe 通常是未安装发行版的 WSL 存根；请安装 Git for Windows，或把 shell 设为 powershell。",
        );
      }
      return { file: gitBash, argsPrefix: ["-lc"] };
    }
    return { file: "bash", argsPrefix: ["-lc"] };
  }
  if (prefer === "cmd") {
    return isWin
      ? { file: "cmd.exe", argsPrefix: ["/d", "/s", "/c"] }
      : { file: "sh", argsPrefix: ["-c"] };
  }
  if (prefer === "powershell") {
    return isWin
      ? { file: "powershell.exe", argsPrefix: ["-NoProfile", "-NonInteractive", "-Command"] }
      : { file: "sh", argsPrefix: ["-c"] };
  }

  if (isWin) {
    return { file: "powershell.exe", argsPrefix: ["-NoProfile", "-NonInteractive", "-Command"] };
  }
  return { file: "bash", argsPrefix: ["-lc"] };
}

export interface ShellRunResult {
  command: string;
  cwd: string;
  shell: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  truncated: boolean;
  durationMs: number;
}

export async function runShellRestricted(
  config: AppConfig,
  command: string,
  opts?: { cwd?: string; shell?: string; timeoutMs?: number; rootDir?: string; signal?: AbortSignal },
): Promise<ShellRunResult> {
  assertShellEnabled(config);
  validateShellCommand(command);

  const cwd = resolveShellCwd(config, opts?.cwd, opts?.rootDir);
  const maxBuffer = config.shell.maxOutputChars * 4;
  const timeoutMs = Math.max(1000, Math.min(300_000, opts?.timeoutMs ?? config.shell.timeoutMs));
  const start = Date.now();

  // DeerFlow 启发：docker 模式 = 项目根挂载到容器 /workspace，命令在隔离环境执行
  if (config.shell.mode === "docker") {
    const image = process.env.SHELL_DOCKER_IMAGE?.trim() || "node:22-bookworm-slim";
    const root = path.resolve(config.projectRoot);
    const relCwd = path.relative(root, cwd).replace(/\\/g, "/") || ".";
    const dockerArgs = [
      "run",
      "--rm",
      "-v",
      `${root}:/workspace:rw`,
      "-w",
      `/workspace/${relCwd}`.replace(/\/+$/, "") || "/workspace",
      "-e",
      "CI=1",
      "-e",
      "NO_COLOR=1",
      image,
      "bash",
      "-lc",
      command,
    ];
    try {
      const { stdout, stderr } = await execFileAsync("docker", dockerArgs, {
        timeout: timeoutMs,
        maxBuffer,
        windowsHide: true,
        signal: opts?.signal,
        env: buildSandboxEnv() as unknown as NodeJS.ProcessEnv,
      });
      const out = (stdout || "").slice(0, config.shell.maxOutputChars);
      const err = (stderr || "").slice(0, config.shell.maxOutputChars);
      const combinedLen = (stdout || "").length + (stderr || "").length;
      return {
        command,
        cwd,
        shell: `docker:${image}`,
        exitCode: 0,
        stdout: out,
        stderr: err,
        truncated: combinedLen > config.shell.maxOutputChars,
        durationMs: Date.now() - start,
      };
    } catch (e: unknown) {
      const err = e as { code?: number | string; stdout?: string; stderr?: string; killed?: boolean; message?: string };
      if (err.killed || String(err.message || "").includes("TIMEOUT")) {
        throw new Error(`命令执行超时（${timeoutMs}ms）`);
      }
      const stdout = (err.stdout || "").slice(0, config.shell.maxOutputChars);
      const stderr = (err.stderr || "").slice(0, config.shell.maxOutputChars);
      const exitCode = typeof err.code === "number" ? err.code : 1;
      return {
        command,
        cwd,
        shell: `docker:${image}`,
        exitCode,
        stdout,
        stderr: stderr || (e instanceof Error ? e.message : String(e)),
        truncated: false,
        durationMs: Date.now() - start,
      };
    }
  }

  // host_restricted 额外防线：命令文本里出现沙箱外绝对路径即拒绝（docker 模式容器路径语义不同，不加这层）。
  assertShellCommandPathsInsideSandbox(command, path.resolve(opts?.rootDir || config.projectRoot), cwd);

  const { file, argsPrefix } = resolveShellExecutable(config, opts?.shell);
  const args = [...argsPrefix, command];

  try {
    const { stdout, stderr } = await execFileAsync(file, args, {
      cwd,
      timeout: timeoutMs,
      maxBuffer,
      windowsHide: true,
      signal: opts?.signal,
      env: {
        ...buildSandboxEnv(),
        CI: "1",
        NO_COLOR: "1",
      } as unknown as NodeJS.ProcessEnv,
    });
    const out = (stdout || "").slice(0, config.shell.maxOutputChars);
    const err = (stderr || "").slice(0, config.shell.maxOutputChars);
    const combinedLen = (stdout || "").length + (stderr || "").length;
    return {
      command,
      cwd,
      shell: file,
      exitCode: 0,
      stdout: out,
      stderr: err,
      truncated: combinedLen > config.shell.maxOutputChars,
      durationMs: Date.now() - start,
    };
  } catch (e: unknown) {
    const err = e as { code?: number | string; stdout?: string; stderr?: string; killed?: boolean; signal?: string };
    if (err.killed || err.signal === "SIGTERM") {
      throw new Error(`命令执行超时（${timeoutMs}ms）`);
    }
    const stdout = (err.stdout || "").slice(0, config.shell.maxOutputChars);
    const stderr = (err.stderr || "").slice(0, config.shell.maxOutputChars);
    const exitCode = typeof err.code === "number" ? err.code : 1;
    return {
      command,
      cwd,
      shell: file,
      exitCode,
      stdout,
      stderr: stderr || (e instanceof Error ? e.message : String(e)),
      truncated: false,
      durationMs: Date.now() - start,
    };
  }
}

export async function waitMs(ms: number, signal?: AbortSignal): Promise<{ waitedMs: number; aborted: boolean }> {
  const clamped = Math.max(0, Math.min(ms, 300_000));
  if (signal?.aborted) return { waitedMs: 0, aborted: true };
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve({ waitedMs: clamped, aborted: false });
    }, clamped);
    const onAbort = () => {
      clearTimeout(timer);
      resolve({ waitedMs: clamped, aborted: true });
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
