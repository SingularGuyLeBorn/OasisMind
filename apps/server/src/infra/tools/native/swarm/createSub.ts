import {
  getAllowedToolsForTier,
  checkWorkspaceAgentAccess,
} from "../../../swarmPermissionGuard.js";
import { provisionWorkspace } from "../../../workspaceProvision.js";
import { resolveToolsForAgentTier } from "../../../loop/setup.js";
import { CHILD_OWN_TOOLS } from "@knowpilot/shared";
import type { NativeToolContext } from "../types.js";

export async function agentCreateTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const tier = (args.tier as "super" | "manager" | "sub" | undefined) ?? "sub";
  let workspaceId = args.workspaceId as string | undefined;
  // 超级 Agent 创建 Agent 未指定 workspaceId 时，默认挂到系统 Workspace
  if (!workspaceId && ctx.agentSnapshot?.tier === "super") {
    const systemWs = await ctx.services.prisma.workspace.findFirst({
      where: { isSystem: true, systemType: "super", status: { not: "deleted" } },
    });
    if (systemWs) workspaceId = systemWs.id;
  }
  // manager 必须归属 Workspace；未指定时自动创建
  if (tier === "manager" && !workspaceId) {
    const wsResult = await ctx.services.workspace.create({
      name: String(args.name || "Manager Workspace"),
      path: `workspaces/auto-manager-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      description: "为 manager Agent 自动创建",
      autoCreateManager: false,
    } as any);
    if (wsResult.success && wsResult.data) {
      workspaceId = (wsResult.data as { id: string }).id;
    }
  }
  // P1-04：敏感字段（heartbeat / heartbeatModel）仅 super tier 可设。
  // manager/sub 传了也忽略 + 写审计 warn，防止越权部署常驻心跳 Agent 持续消耗预算。
  const operatorTier = ctx.agentSnapshot?.tier ?? "sub";
  const isSuper = operatorTier === "super";
  const sensitiveFieldsAttempted: string[] = [];
  if (args.heartbeat !== undefined) sensitiveFieldsAttempted.push("heartbeat");
  if (args.heartbeatModel !== undefined) sensitiveFieldsAttempted.push("heartbeatModel");
  if (sensitiveFieldsAttempted.length > 0 && !isSuper) {
    await ctx.services.log?.create?.({
      level: "warn",
      component: "swarm",
      event: "agent_create_sensitive_field_denied",
      message: `非 super Agent 试图创建 Agent 时设置敏感字段 [${sensitiveFieldsAttempted.join(", ")}]，已忽略`,
      metadata: { operatorAgentId: ctx.agentSnapshot?.id, operatorTier, attemptedFields: sensitiveFieldsAttempted },
    }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  }
  const created = await ctx.services.agent.create({
    name: String(args.name || ""),
    description: args.description ? String(args.description) : undefined,
    model: args.model ? String(args.model) : ctx.config.llm.defaultModel,
    systemPrompt: args.systemPrompt ? String(args.systemPrompt) : "",
    tools: Array.isArray(args.tools) ? (args.tools as string[]) : [],
    tier,
    workspaceId,
    parentId: args.parentId as string | undefined,
    source: "native_tool:agent_create",
    heartbeatModel: isSuper ? (args.heartbeatModel as string | undefined) : undefined,
    heartbeat: isSuper ? (args.heartbeat as any) : undefined,
  });
  if (!created.success || !created.data) {
    return { error: created.error?.message ?? "创建 Agent 失败" };
  }
  // 主会话由 AgentService.afterCreate → ensureMainSession 统一创建（幂等）
  // 审计日志
  await ctx.services.log?.create?.({
    level: "info",
    component: "swarm",
    event: "agent_created",
    message: `Agent ${created.data.name} 被创建（tier: ${tier}）`,
    metadata: { agentId: created.data.id, operatorAgentId: ctx.agentSnapshot?.id, tier },
  }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  return { success: true, agentId: created.data.id, name: created.data.name };
}

export async function agentUpdateTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const { id, ...updateData } = args;
  const targetId = String(id || "");
  const existing = await ctx.services.agent.getById(targetId);
  if (!existing) return { error: "Agent 不存在" };
  const scopeErr = checkWorkspaceAgentAccess(
    { tier: ctx.agentSnapshot?.tier ?? "sub", workspaceId: ctx.agentSnapshot?.workspaceId },
    { tier: existing.tier, workspaceId: existing.workspaceId, id: targetId },
    "agent_update",
  );
  if (scopeErr) return { error: `[${scopeErr.code}] ${scopeErr.reason}` };
  // 管理 Agent 禁止改 tier / 迁出 Workspace
  if (ctx.agentSnapshot?.tier === "manager") {
    if (updateData.tier !== undefined && String(updateData.tier) !== existing.tier) {
      return { error: "[TIER_PROTECTED] 管理 Agent 不能修改目标 Agent 的 tier。" };
    }
    if (updateData.workspaceId !== undefined && String(updateData.workspaceId) !== (existing.workspaceId ?? "")) {
      return { error: "[CROSS_WORKSPACE_FORBIDDEN] 管理 Agent 不能把 Agent 迁出本 Workspace。" };
    }
  }
  // P1-04：敏感字段（heartbeat / heartbeatModel）仅 super tier 可改。
  // manager/sub 传了也忽略 + 写审计 warn，防止越权劫持目标 Agent 的 LLM 计费/日志归因
  // 或篡改心跳配置。
  const operatorTierForSensitive = ctx.agentSnapshot?.tier ?? "sub";
  const isSuperForSensitive = operatorTierForSensitive === "super";
  const sensitiveUpdateAttempted: string[] = [];
  if (updateData.heartbeat !== undefined) sensitiveUpdateAttempted.push("heartbeat");
  if (updateData.heartbeatModel !== undefined) sensitiveUpdateAttempted.push("heartbeatModel");
  if (sensitiveUpdateAttempted.length > 0 && !isSuperForSensitive) {
    await ctx.services.log?.create?.({
      level: "warn",
      component: "swarm",
      event: "agent_update_sensitive_field_denied",
      message: `非 super Agent 试图更新 Agent ${targetId} 的敏感字段 [${sensitiveUpdateAttempted.join(", ")}]，已忽略`,
      metadata: { targetAgentId: targetId, operatorAgentId: ctx.agentSnapshot?.id, operatorTier: operatorTierForSensitive, attemptedFields: sensitiveUpdateAttempted },
    }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  }
  const result = await ctx.services.agent.update({
    id: targetId,
    name: updateData.name ? String(updateData.name) : undefined,
    description: updateData.description ? String(updateData.description) : undefined,
    model: updateData.model ? String(updateData.model) : undefined,
    systemPrompt: updateData.systemPrompt ? String(updateData.systemPrompt) : undefined,
    tools: Array.isArray(updateData.tools) ? (updateData.tools as string[]) : undefined,
    heartbeatModel: isSuperForSensitive && updateData.heartbeatModel ? String(updateData.heartbeatModel) : undefined,
    heartbeat: isSuperForSensitive ? (updateData.heartbeat as any) : undefined,
    status: updateData.status as any,
    tier: ctx.agentSnapshot?.tier === "super" && updateData.tier !== undefined
      ? (updateData.tier as any)
      : undefined,
  } as any);
  if (!result.success) return { error: result.error?.message ?? "更新 Agent 失败" };
  await ctx.services.log?.create?.({
    level: "info", component: "swarm", event: "agent_updated",
    message: `Agent ${id} 被更新`,
    metadata: { agentId: String(id), operatorAgentId: ctx.agentSnapshot?.id },
  }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  return { success: true };
}

export async function agentDeleteTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const targetId = String(args.id || "");
  // tombstone 删除：保留 DB 行作审计（出 FTS + 删配置文件由 AgentService.tombstone 统一处理）
  const existing = await ctx.services.agent.getById(targetId);
  if (!existing) return { error: "Agent 不存在" };
  // Q1：任何超级 Agent 不可删（含自己；权限层亦拦 SELF_DELETE）
  if (existing.tier === "super") {
    return { error: "[SUPER_AGENT_NOT_DELETABLE] 超级 Agent 不可删除。" };
  }
  const scopeErr = checkWorkspaceAgentAccess(
    { tier: ctx.agentSnapshot?.tier ?? "sub", workspaceId: ctx.agentSnapshot?.workspaceId },
    { tier: existing.tier, workspaceId: existing.workspaceId, id: targetId },
    "agent_delete",
  );
  if (scopeErr) return { error: `[${scopeErr.code}] ${scopeErr.reason}` };
  // tombstone 删除：出 FTS + 删配置文件 + 清 sourceSlug，DB 行保留作审计（与 tRPC 硬删最终效果一致）
  const tomb = await ctx.services.agent.tombstone(targetId, { deletedBy: ctx.agentSnapshot?.id });
  if (!tomb.success) return { error: tomb.error?.message ?? "删除 Agent 失败" };
  // 审计日志
  await ctx.services.log?.create?.({
    level: "warn", component: "swarm", event: "agent_deleted",
    message: `Agent ${existing.name} 被删除（tombstone）`,
    metadata: { agentId: targetId, agentName: existing.name, operatorAgentId: ctx.agentSnapshot?.id, deletedAt: new Date().toISOString() },
  }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  return { success: true, message: `Agent ${existing.name} 已标记为 deleted（tombstone 保留）。session/message/memory 将级联清理。` };
}

export async function agentCreateSubTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  // 默认落在当前父 Agent 所在 Workspace；仅超级 Agent 可通过 workspaceId 跨 Workspace 创建
  const callerTier = ctx.agentSnapshot?.tier ?? "sub";
  let workspaceId = ctx.agentSnapshot?.workspaceId ?? undefined;
  if (callerTier === "super" && args.workspaceId) {
    workspaceId = String(args.workspaceId);
  }
  if (!workspaceId && ctx.prisma) {
    const systemWs = await ctx.prisma.workspace.findFirst({
      where: { isSystem: true, status: { not: "deleted" } },
      select: { id: true },
    });
    workspaceId = systemWs?.id;
  }
  const rawTools = Array.isArray(args.tools) ? (args.tools as string[]) : [];
  const tools = getAllowedToolsForTier("sub", resolveToolsForAgentTier("sub", rawTools));
  const created = await ctx.services.agent.create({
    name: String(args.name || ""),
    description: args.description ? String(args.description) : undefined,
    model: args.model ? String(args.model) : ctx.config.llm.defaultModel,
    systemPrompt: args.systemPrompt ? String(args.systemPrompt) : "",
    tools,
    tier: "sub",
    workspaceId,
    parentId: ctx.agentSnapshot?.id,
    source: "native_tool:agent_create_sub",
    toolInheritMask: args.toolInheritMask
      ? (args.toolInheritMask as { allow?: string[]; deny?: string[] })
      : undefined,
    toolOwn: Array.isArray(args.toolOwn) ? (args.toolOwn as string[]) : [...CHILD_OWN_TOOLS],
  });
  if (!created.success || !created.data) return { error: created.error?.message ?? "创建子 Agent 失败" };
  // 审计日志
  await ctx.services.log?.create?.({
    level: "info", component: "swarm", event: "sub_agent_created",
    message: `子 Agent ${created.data.name} 被创建`,
    metadata: { agentId: created.data.id, parentAgentId: ctx.agentSnapshot?.id, workspaceId: ctx.agentSnapshot?.workspaceId },
  }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  return { success: true, agentId: created.data.id, name: created.data.name };
}

export async function workspaceCreateTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const name = String(args.name || "");
  const path = String(args.path || "");
  if (!name || !path) return { error: "workspace_create 需要 name 和 path" };
  const withManager =
    args.withManager === undefined && args.autoCreateManager === undefined
      ? undefined
      : args.withManager !== false && args.autoCreateManager !== false;
  const result = await provisionWorkspace(ctx.config, ctx.services, {
    name,
    path,
    description: args.description as string | undefined,
    managerModel: args.managerModel as string | undefined,
    managerSystemPrompt: args.managerSystemPrompt as string | undefined,
    managerName: args.managerName as string | undefined,
    withManager,
    autoCreateManager: withManager,
    initialTask: args.initialTask as string | undefined,
    asyncSlotQuota:
      args.asyncSlotQuota !== undefined ? Number(args.asyncSlotQuota) : undefined,
    operatorAgentId: ctx.agentSnapshot?.id,
    managerParentId: ctx.agentSnapshot?.id,
  });
  if (!result.success) return { error: result.error };
  return {
    success: true,
    workspaceId: result.workspaceId,
    managerAgentId: result.managerAgentId,
    managerSessionId: result.managerSessionId,
    initialTaskStatus: result.initialTaskStatus,
    message: result.managerAgentId
      ? `Workspace ${name} 已创建，管理 Agent 已就绪。`
      : `Workspace ${name} 已创建（未创建管理 Agent）。`,
  };
}

export async function workspaceArchiveTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const wsId = String(args.id || "");
  const ws = await ctx.services.workspace.getById(wsId).catch((err) => { console.warn("[swarm.ts] best-effort failed:", err instanceof Error ? err.message : err); return null; });
  if (!ws) return { error: "Workspace 不存在" };
  if ((ws as { isSystem?: boolean }).isSystem) {
    return { error: "[SYSTEM_WORKSPACE_IMMUTABLE] Root / 系统 Workspace 不可归档。" };
  }
  // 归档：Workspace status=archived + 所有 Agent status=dormant
  const updated = await ctx.services.workspace.update({ id: wsId, status: "archived" } as any);
  if (!updated.success) return { error: updated.error?.message ?? "归档失败" };
  const agents = await ctx.prisma?.agent.findMany({ where: { workspaceId: wsId, status: { not: "deleted" } } }) ?? [];
  for (const a of agents) {
    await ctx.services.agent.update({ id: a.id, status: "dormant" } as any).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  }
  await ctx.services.log?.create?.({
    level: "info", component: "swarm", event: "workspace_archived",
    message: `Workspace ${wsId} 已归档（${agents.length} 个 Agent 设为 dormant）`,
    metadata: { workspaceId: wsId, agentCount: agents.length, operatorAgentId: ctx.agentSnapshot?.id },
  }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  return { success: true, message: `Workspace 已归档，${agents.length} 个 Agent 设为 dormant。可随时恢复。` };
}
