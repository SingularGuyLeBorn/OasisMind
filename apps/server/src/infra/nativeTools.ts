/**
 * 原生工具注册表 — Agent 可直接调用的内置能力
 *
 * PR-4 全部落地：所有 handler/schema 已按域迁至 infra/tools/native/*
 * （fs / web / shell / swarm / session / memory / integration）。
 * 本文件只保留：域注册入口 + Swarm 权限闸门 + Mock 拦截 + registry 分发。
 * 新增 native 工具 = 在对应域文件加 schema + handler（开闭原则，勿改本文件分发逻辑）。
 */

import { DEFAULT_AGENT_NATIVE } from "@knowpilot/shared";
import { getTool, listTools } from "./tools/registry.js";
import type { NativeToolContext, NativeToolDefinition } from "./tools/native/types.js";
import { injectExpectPropsIntoParameters } from "./keyInfoExtractor.js";
import { getAppConfig } from "./config.js";
import { runNativePipeline } from "./tools/toolPipeline.js";

// 域副作用注册（fs/web/shell/swarm/session/memory/integration）；按 packs 过滤
import { registerNativeDomains } from "./tools/native/index.js";

export type { NativeToolContext, NativeToolDefinition } from "./tools/native/types.js";
export {
  syncSearchEnvFromConfig,
  isUnreadableArticlePage,
  readArticleContentWarning,
} from "./tools/native/web.js";

/** 域工具灌入统一注册表（唯一注册路径：registerNativeDomains） */
let nativeToolsRegistered = false;
function ensureNativeToolsRegistered(): void {
  // 测试清空 registry 后需能重新灌入；只探测 core 域（swarm 可能被 pack 关掉）
  if (nativeToolsRegistered && getTool("read_file")) return;
  registerNativeDomains(getAppConfig().packs);
  nativeToolsRegistered = true;
}
ensureNativeToolsRegistered();

/** 测试用：允许按新 packs 重新注册（先清 registry） */
export function __resetNativeToolsRegistrationForTests(): void {
  nativeToolsRegistered = false;
}

export function listNativeTools(): NativeToolDefinition[] {
  ensureNativeToolsRegistered();
  return listTools("native").map((t) => {
    const s = t.schema();
    return { name: t.name, description: s.description, parameters: s.parameters };
  });
}

export async function executeNativeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: NativeToolContext,
): Promise<unknown> {
  ensureNativeToolsRegistered();
  const started = Date.now();
  const exec = await runNativePipeline(name, args, ctx);
  if (!exec.ok) {
    if (exec.error.code === "HANDLER") {
      throw new Error(exec.error.message);
    }
    return {
      ...(exec.error.details ?? {}),
      error: exec.error.message,
      code: (exec.error.details?.code as string | undefined) ?? exec.error.code,
    };
  }
  const raw = exec.envelope.value;
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.elapsedMs !== "number") {
      return { ...obj, elapsedMs: exec.elapsedMs || Date.now() - started };
    }
  }
  return raw;
}

export function resolveAllowedNativeTools(agentTools: string[]): string[] | "all" {
  const native = agentTools.filter((t) => t.startsWith("native:")).map((t) => t.replace(/^native:/, ""));
  // P0-01 对齐：空数组返回默认只读集（不再 "all"），与 parseAgentTools 语义一致
  if (agentTools.length === 0) return [...DEFAULT_AGENT_NATIVE];
  if (native.length === 0) return [...DEFAULT_AGENT_NATIVE];
  return native;
}

export function buildNativeToolSchemas(allowed: string[] | "all") {
  ensureNativeToolsRegistered();
  const cmds =
    allowed === "all"
      ? // P1-03：native:"all" 时跳过 defaultHidden=true 的危险工具（run_shell/git_push/file_delete 等），
        // Agent 想用必须显式 `native:<name>` 声明。显式列表不受此限（已声明即授权）。
        listTools("native").filter((t) => !t.defaultHidden)
      : listTools("native").filter((t) => allowed.includes(t.name));
  return cmds.map((t) => {
    const s = t.schema();
    return {
      type: "function" as const,
      function: {
        name: t.name,
        description: s.description,
        parameters: injectExpectPropsIntoParameters(
          (s.parameters ?? { type: "object", properties: {} }) as Record<string, unknown>,
          t.name,
        ),
      },
    };
  });
}
