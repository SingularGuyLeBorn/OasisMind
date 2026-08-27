import { checkWorkspaceAgentAccess } from "../../../swarmPermissionGuard.js";
import { createMemoryRepository } from "../../../memoryRepository.js";
import { MEMORY_SCOPE_GLOBAL, memoryAgentScope, CHILD_OWN_TOOLS } from "@oasismind/shared";
import { deriveVisibleSet } from "../../visibleSet.js";
import { getAppConfig } from "../../../config.js";
import type { NativeToolContext } from "../types.js";

/**
 * Swarm 作战简报：manager/super 一览作用域内 Agent 健康，便于先消费再派活。
 */
export async function swarmBriefTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const tier = ctx.agentSnapshot?.tier ?? "sub";
  if (tier !== "super" && tier !== "manager") {
    return { error: "[TIER_DENIED] swarm_brief 仅超级 / 管理 Agent 可用。" };
  }
  if (!ctx.prisma) return { error: "当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。", code: "NEED_CHAT_CONTEXT" };

  let workspaceId: string | null | undefined =
    typeof args.workspaceId === "string" && args.workspaceId.trim()
      ? args.workspaceId.trim()
      : undefined;
  if (tier === "manager") {
    workspaceId = ctx.agentSnapshot?.workspaceId ?? null;
    if (!workspaceId) {
      return { error: "管理 Agent 无 workspaceId，无法生成作用域简报。" };
    }
  } else if (workspaceId === undefined) {
    // super 默认全局；可显式传 workspaceId 收窄
    workspaceId = null;
  }

  const limit = typeof args.limit === "number" ? args.limit : 12;
  const { buildSwarmBrief } = await import("../../../swarmHealth.js");
  const brief = await buildSwarmBrief(ctx.prisma, {
    workspaceId: workspaceId === null ? null : workspaceId,
    limit,
    config: ctx.config,
  });
  return {
    markdown: brief.markdown,
    agentCount: brief.agents.length,
    attentionCount: brief.agents.filter((a) => a.needsAttention).length,
    notifyChannels: brief.notifyChannels,
    generatedAt: brief.generatedAt,
    hint: "先处理「需关注」项（inbox / ask_user / paused / 熔断），再派新任务。markdown 可直接给用户看。",
  };
}

export async function agentInspectTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const targetId = String(args.id || "");
  // 默认不附带全局 Memory：experience 会污染父 Agent 上下文，导致把「旧任务经验」当成当前结果
  const includeMemory = args.includeMemory === true;
  const includeSwarm = args.includeSwarm === true;
  const agent = await ctx.services.agent.getById(targetId);
  if (!agent) return { error: "Agent 不存在" };
  const scopeErr = checkWorkspaceAgentAccess(
    { tier: ctx.agentSnapshot?.tier ?? "sub", workspaceId: ctx.agentSnapshot?.workspaceId },
    { tier: agent.tier, workspaceId: agent.workspaceId, id: targetId },
    "agent_inspect",
  );
  // 管理 Agent 可 inspect 本空间；对超级仅允许看公开元信息（id/name/tier），禁止读会话/记忆
  if (scopeErr && !(scopeErr.code === "TIER_PROTECTED" && ctx.agentSnapshot?.tier === "manager" && agent.tier === "super")) {
    return { error: `[${scopeErr.code}] ${scopeErr.reason}` };
  }
  if (scopeErr?.code === "TIER_PROTECTED" && agent.tier === "super") {
    return {
      id: agent.id,
      name: agent.name,
      tier: agent.tier,
      status: agent.status,
      note: "超级 Agent 仅返回公开元信息；详情请通过消息/报告通道沟通。",
    };
  }
  // 架构铁律：父 Agent 只能看子 Agent 的状态，不能看子 Agent 的消息内容。
  // 子 Agent 的结果只能经 agent_report_back → autoConsume 注入父会话异步结果队列这一条通道交付。
  // 因此 agent_inspect 不返回任何 recentMessages——只返 session 元信息（id/title/messageCount）作为状态。
  // 取 messages 仅用于 count，不取 content；避免任何形式的对话内容泄露。
  const sessions = await ctx.prisma?.chatSession.findMany({
    where: { agentId: targetId },
    select: { id: true, title: true, isMainSession: true, status: true, updatedAt: true, _count: { select: { messages: true } } },
    take: 5,
    orderBy: { updatedAt: "desc" },
  });
  let memories: unknown[] = [];
  if (includeMemory) {
    // W5：走 MemoryRepository 按 type 字段查（删除 startsWith("{") 猜 JSON 启发式），
    // scopes = global + 目标 Agent，experience 等其他 Agent 私有记忆天然隔离
    const repo = createMemoryRepository(ctx.services);
    const rows = await repo.read({
      types: ["preference", "semantic", "episodic"],
      scopes: [MEMORY_SCOPE_GLOBAL, memoryAgentScope(targetId)],
      limit: 5,
    });
    // 隔离铁律延伸：includeMemory 也只返元信息，不返 content（避免半内容泄露）
    memories = rows.map((m) => ({
      id: m.id,
      type: m.type,
      scope: m.scope,
      contentChars: m.content.length,
    }));
  }
  let swarm: unknown;
  if (includeSwarm && ctx.prisma) {
    const { getSwarmHealthSnapshot } = await import("../../../swarmHealth.js");
    swarm = await getSwarmHealthSnapshot(ctx.prisma, targetId);
  }
  // 最近 Run 进度元信息（phase/rounds/lastToolName），不含任何消息正文
  let progress: unknown = null;
  const mainSessionId = sessions?.find((s: { isMainSession?: boolean }) => s.isMainSession)?.id
    ?? sessions?.[0]?.id;
  if (mainSessionId && ctx.prisma) {
    const latestRun = await ctx.prisma.run.findFirst({
      where: { sessionId: mainSessionId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, status: true, output: true, updatedAt: true, toolCallCount: true },
    });
    if (latestRun) {
      let out: Record<string, unknown> = {};
      try {
        out =
          typeof latestRun.output === "string"
            ? (JSON.parse(latestRun.output) as Record<string, unknown>)
            : ((latestRun.output as Record<string, unknown>) ?? {});
      } catch {
        out = {};
      }
      progress = {
        runId: latestRun.id,
        status: latestRun.status,
        phase: out.phase,
        roundsUsed: out.roundsUsed,
        executedToolsCount: out.executedToolsCount ?? latestRun.toolCallCount,
        lastToolName: out.lastToolName,
        updatedAt: latestRun.updatedAt,
      };
    }
  }
  return {
    agent: {
      id: agent.id,
      name: agent.name,
      tier: agent.tier,
      status: agent.status,
      model: agent.model,
      // 不返 systemPrompt 正文——配置/身份属半内容，状态面只暴露是否有自定义 prompt
      hasCustomSystemPrompt: Boolean(agent.systemPrompt?.trim()),
      systemPromptChars: agent.systemPrompt?.length ?? 0,
    },
    sessions:
      sessions?.map((s: any) => ({
        id: s.id,
        title: s.title,
        isMainSession: s.isMainSession,
        status: s.status,
        updatedAt: s.updatedAt,
        messageCount: s._count?.messages ?? 0,
      })) ?? [],
    progress,
    memories,
    swarm,
    hint: [
      includeMemory ? null : "默认不返回 Memory；需要时传 includeMemory=true（仅元信息，无正文）。",
      includeSwarm ? null : "需要 inbox/队列/ask_user 积压时传 includeSwarm=true。",
      "agent_inspect 只返回 Agent 状态、会话元信息与 Run 进度（phase/rounds/lastToolName），不返回 systemPrompt/记忆正文/任何消息内容。子 Agent 的结果只能通过 agent_report_back 投递到你的会话异步结果队列。",
      "请以 agent.id（cuid）为准，勿编造 ID。",
    ]
      .filter(Boolean)
      .join(" "),
    ...inspectVisibleTools(agent),
  };
}

function inspectVisibleTools(agent: {
  id: string;
  tier?: string;
  tools?: string[];
  toolInheritMask?: { allow?: string[]; deny?: string[] } | null;
  toolOwn?: string[] | null;
}): { visibleToolCount: number; visibleToolsPreview: string[] } {
  const tier = agent.tier ?? "sub";
  const visible = deriveVisibleSet({
    agentId: agent.id,
    tier,
    agentTools: agent.tools ?? [],
    packs: getAppConfig().packs,
    inheritMask: agent.toolInheritMask ?? undefined,
    childOwn: agent.toolOwn ?? (tier === "sub" ? [...CHILD_OWN_TOOLS] : []),
  });
  return {
    visibleToolCount: visible.native.length,
    visibleToolsPreview: visible.native.slice(0, 30),
  };
}

export async function swarmExportTraceTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const sessionId =
    (typeof args.sessionId === "string" && args.sessionId.trim()) ||
    ctx.sessionId ||
    "";
  if (!sessionId) throw new Error("sessionId 必填（或在会话内调用）");
  const includeContent = args.includeContent === true;
  const tier = ctx.agentSnapshot?.tier ?? "sub";
  if (includeContent && tier !== "super" && sessionId !== ctx.sessionId) {
    throw new Error(
      "includeContent 仅超级 Agent 可导出其它会话正文；子 Agent 结果请走 agent_report_back。",
    );
  }
  const { exportSwarmTraceJsonl } = await import("../../../swarmTrace.js");
  const result = await exportSwarmTraceJsonl(ctx.prisma, ctx.config, {
    sessionId,
    includeContent,
    outRelPath: typeof args.outRelPath === "string" ? args.outRelPath : undefined,
  });
  return {
    ...result,
    hint: "默认不含消息正文。评估协作效能时用此 JSONL；需要正文才传 includeContent=true（非 super 仅限当前会话）。",
  };
}

export async function swarmStageWriteTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const { writeSwarmStage } = await import("../../../swarmStages.js");
  return writeSwarmStage(ctx.prisma, ctx.config, {
    workspaceId:
      (typeof args.workspaceId === "string" && args.workspaceId) ||
      ctx.agentSnapshot?.workspaceId ||
      undefined,
    stage: String(args.stage || ""),
    title: typeof args.title === "string" ? args.title : undefined,
    body: String(args.body || ""),
    taskRef: typeof args.taskRef === "string" ? args.taskRef : undefined,
    authorAgentId: ctx.agentSnapshot?.id,
  });
}

export async function swarmStageListTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const { listSwarmStages } = await import("../../../swarmStages.js");
  const items = await listSwarmStages(ctx.prisma, ctx.config, {
    workspaceId:
      (typeof args.workspaceId === "string" && args.workspaceId) ||
      ctx.agentSnapshot?.workspaceId ||
      undefined,
  });
  return { items, total: items.length };
}

export async function swarmStageReadTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const { readSwarmStage } = await import("../../../swarmStages.js");
  return readSwarmStage(ctx.prisma, ctx.config, {
    workspaceId:
      (typeof args.workspaceId === "string" && args.workspaceId) ||
      ctx.agentSnapshot?.workspaceId ||
      undefined,
    stage: String(args.stage || ""),
  });
}
