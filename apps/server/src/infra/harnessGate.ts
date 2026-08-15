/**
 * Harness Gate 服务端核验（必要学：禁止 Agent 自报 lintOk/testOk）
 *
 * - 只跑 config 预置命令（allowlist），不接受 LLM 自由命令串
 * - 返回 metrics.verified=true；keep / autonomous done 必须带此标记
 */

import { spawn } from "child_process";
import type { AppConfig } from "./config.js";
import type { ExperimentMetrics } from "./experimentLedger.js";

export type HarnessGateRunResult = ExperimentMetrics & {
  verified: true;
  gatePreset: string;
  gateCommand: string;
  gateCommandExitCode: number;
  gatePassed: boolean;
  durationMs: number;
  stdoutTail?: string;
  stderrTail?: string;
};

export type HarnessGateExecFn = (args: {
  command: string;
  cwd: string;
  timeoutMs: number;
  signal?: AbortSignal;
}) => Promise<{ exitCode: number; stdout: string; stderr: string; durationMs: number }>;

let execOverride: HarnessGateExecFn | null = null;

/** 单测注入；生产勿用 */
export function __setHarnessGateExecForTests(fn: HarnessGateExecFn | null): void {
  execOverride = fn;
}

const DEFAULT_PRESETS: Record<string, string> = {
  server_lint: "pnpm --filter @knowpilot/server lint",
  server_test: "pnpm --filter @knowpilot/server exec vitest run",
  shared_lint: "pnpm --filter @knowpilot/shared lint",
};

export function listHarnessGatePresets(config: AppConfig): Record<string, string> {
  const fromCfg = config.harness?.gate?.presets ?? {};
  return { ...DEFAULT_PRESETS, ...fromCfg };
}

export function resolveHarnessGateCommand(config: AppConfig, preset: string): string {
  const name = String(preset || "").trim();
  if (!name) throw new Error("gate preset 不能为空");
  const map = listHarnessGatePresets(config);
  const cmd = map[name];
  if (!cmd || !String(cmd).trim()) {
    throw new Error(
      `未知 gate preset「${name}」。可用：${Object.keys(map).sort().join(", ")}`,
    );
  }
  return String(cmd).trim();
}

async function defaultExec(args: {
  command: string;
  cwd: string;
  timeoutMs: number;
  signal?: AbortSignal;
}): Promise<{ exitCode: number; stdout: string; stderr: string; durationMs: number }> {
  const start = Date.now();
  const isWin = process.platform === "win32";
  const file = isWin ? "cmd.exe" : "bash";
  const fileArgs = isWin ? ["/d", "/s", "/c", args.command] : ["-lc", args.command];

  return new Promise((resolve, reject) => {
    if (args.signal?.aborted) {
      reject(new Error("工具已取消"));
      return;
    }
    const child = spawn(file, fileArgs, {
      cwd: args.cwd,
      env: { ...process.env, CI: "1", NO_COLOR: "1" },
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const onAbort = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill("SIGTERM");
      reject(new Error("工具已取消"));
    };
    args.signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      args.signal?.removeEventListener("abort", onAbort);
      child.kill("SIGTERM");
      reject(new Error(`harness_gate 超时（${args.timeoutMs}ms）：${args.command}`));
    }, args.timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > 80_000) stdout = stdout.slice(-60_000);
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > 80_000) stderr = stderr.slice(-60_000);
    });
    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      args.signal?.removeEventListener("abort", onAbort);
      reject(err);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      args.signal?.removeEventListener("abort", onAbort);
      resolve({
        exitCode: typeof code === "number" ? code : 1,
        stdout,
        stderr,
        durationMs: Date.now() - start,
      });
    });
  });
}

function inferMetricFlags(
  preset: string,
  exitCode: number,
): Pick<ExperimentMetrics, "lintOk" | "testOk" | "gatePassed"> {
  const passed = exitCode === 0;
  const p = preset.toLowerCase();
  if (p.includes("lint")) return { lintOk: passed, gatePassed: passed };
  if (p.includes("test")) return { testOk: passed, gatePassed: passed };
  return { gatePassed: passed };
}

/** keep / autonomous done：必须服务端核验 */
export function assertVerifiedForKeep(metrics: ExperimentMetrics): void {
  if (metrics.verified !== true) {
    throw new Error(
      "keep/完成 被拒绝：metrics.verified≠true。请先调用 harness_gate_run(preset=…) 拿服务端核验指标，禁止自报 lintOk/testOk。",
    );
  }
}

export async function runHarnessGatePreset(
  config: AppConfig,
  preset: string,
  signal?: AbortSignal,
): Promise<HarnessGateRunResult> {
  if (signal?.aborted) throw new Error("工具已取消");
  const command = resolveHarnessGateCommand(config, preset);
  const timeoutMs = Math.max(
    5_000,
    Math.min(600_000, config.harness?.gate?.timeoutMs ?? 180_000),
  );
  const exec = execOverride ?? defaultExec;
  const ran = await exec({
    command,
    cwd: config.projectRoot,
    timeoutMs,
    signal,
  });
  const flags = inferMetricFlags(preset, ran.exitCode);
  return {
    verified: true,
    gatePreset: String(preset).trim(),
    gateCommand: command,
    gateCommandExitCode: ran.exitCode,
    gatePassed: ran.exitCode === 0,
    ...flags,
    durationMs: ran.durationMs,
    stdoutTail: ran.stdout.slice(-2000) || undefined,
    stderrTail: ran.stderr.slice(-2000) || undefined,
  };
}
