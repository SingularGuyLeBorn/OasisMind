import { CHILD_OWN_TOOLS } from "@oasismind/shared";
import { markUnverifiedAssistantDump } from "../../../swarmReportContract.js";
import { resolveAgent as defaultResolveAgent } from "../../../agentResolver.js";
import { getAsyncJobOrchestrator } from "../../../asyncJobOrchestrator.js";
import { getAppConfig } from "../../../config.js";
import { DEFAULT_SUBAGENT_TOOLS } from "../../../loop/setup.js";
import { getStreamHub } from "../../../sessionStreamHub.js";
import { getSwarmOrchestrator, type SwarmTaskOutcome } from "../../../swarmOrchestrator.js";
import { fuseSignals } from "../../cooperativeAbort.js";
import { listTools } from "../../registry.js";
import { deriveVisibleSet, visibleSetToAgentTools } from "../../visibleSet.js";
import { coerceToolBoolean, type NativeToolContext, type NativeToolHandler } from "../types.js";
import { agentCreateSubTool } from "../swarm/createSub.js";
import { agentSendMessageTool } from "../swarm/sendMessage.js";

/**
 * spawn waitForResult 轮询的空闲判定（S2）。仅「无流」不够，必须四条件同时满足：
 * - streaming=false：无活跃流；
 * - runStarting=false：无「即将起流」标记（drain 已认领队列项、prepare 段尚未 hub.start——
 *   此间隙队列已空、流未起，缺该条件会被误判空闲，抓到前轮旧 assistant 当本轮派活结果）；
 * - nestedActive=0：子会话内无 running/queued Task；
 * - queuedItems=0：无待处理队列项（前轮结束到 drain 认领之间的窗口由该条件覆盖）。
 */
export function isSubagentSessionSettled(opts: {
  streaming: boolean;
  runStarting: boolean;
  nestedActive: number;
  queuedItems: number;
}): boolean {
  return !opts.streaming && !opts.runStarting && opts.nestedActive === 0 && opts.queuedItems === 0;
}

/** spawn Phase A 产物：子 Agent / 主会话 / 跟踪 Task 的 ids */
interface SpawnPrepared {
  subagentId: string;
  subagentName: string;
  subagentSessionId?: string;
  jobId?: string;
}

/** 未显式传 name 时的占位名：取任务前几个字，避免「子 Agent + 时间戳碎片」像 uuid */
function defaultSubagentPlaceholderName(task: string): string {
  const snippet = task.replace(/\s+/g, " ").trim().slice(0, 10);
  return snippet || "子 Agent 任务";
}

/** v8 TP-1/Q4：LLM 主动派生子 Agent。
 *
 * 不变量：
 * - waitForResult=false（默认）：异步投递，入全局任务池（Q1 容量权威）。pool slot 从起流持有到
 *   hub.waitFor(子会话) 解析；queued 期间跟踪 Task / 子会话状态落 queued（右栏可见「agent 未启动」）。
 * - waitForResult=true：同步等待，走槽位血缘继承（Q4）inline 不占新槽——claimOccupancy 把子会话
 *   hub 流从「hub 交互 running」中剔除（父槽位让渡）。父流挂起轮询，子会话空闲后抓最后一条 assistant。
 *   【正式例外 · P2-07】异步路径结果唯一通道仍是 agent_report_back→autoConsume；
 *   仅 waitForResult=true 允许把子会话末条 assistant 截断摘要（content≤500）经 tool return 交给父。
 *   attach.content 可含全文供编排层，父 Agent 不得另开 agent_inspect 窥消息。
 * - 底层实现仍是 agent_create_sub + agent_send_message({ autoRun: true })，但执行入口统一收口到
 *   SwarmOrchestrator.dispatch，禁止各调用方私自起流。
 *
 * 执行体 spawnSubagent* 保留原语义（同步等待/report_back/跟踪 Task 均不动）。 */
function peelToolName(name: string): string {
  return name.startsWith("native:") ? name.slice("native:".length) : name;
}

type InheritMask = { allow?: string[]; deny?: string[] };

function validateSpawnInheritMask(
  raw: unknown,
):
  | { ok: true; mask?: InheritMask }
  | { ok: false; error: string; code: string; unknown?: string[] } {
  if (raw == null) return { ok: true };
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "inheritMask 必须是 { allow } 或 { deny } 对象", code: "INHERIT_MASK_CONFLICT" };
  }
  const obj = raw as { allow?: unknown; deny?: unknown };
  const allow = Array.isArray(obj.allow) ? obj.allow.map(String) : undefined;
  const deny = Array.isArray(obj.deny) ? obj.deny.map(String) : undefined;
  if ((allow?.length ?? 0) > 0 && (deny?.length ?? 0) > 0) {
    return {
      ok: false,
      error: "inheritMask.allow 与 deny 互斥，只传一个",
      code: "INHERIT_MASK_CONFLICT",
    };
  }
  const named = [...(allow ?? []), ...(deny ?? [])].map(peelToolName);
  const registered = new Set(listTools("native").map((t) => t.name));
  const unknown = named.filter((n) => !registered.has(n));
  if (unknown.length) {
    return {
      ok: false,
      error: `inheritMask 含未注册工具: ${unknown.join(", ")}`,
      code: "INHERIT_MASK_UNKNOWN_TOOL",
      unknown,
    };
  }
  const ownSet = new Set<string>(CHILD_OWN_TOOLS);
  let cleanedDeny = deny?.map(peelToolName);
  if (cleanedDeny?.length) {
    const ownHit = cleanedDeny.filter((n) => ownSet.has(n));
    if (ownHit.length) {
      console.warn(`[visibleSet] inheritMask.deny 忽略 own 工具: ${ownHit.join(", ")}`);
      cleanedDeny = cleanedDeny.filter((n) => !ownSet.has(n));
    }
  }
  const mask: InheritMask = {
    ...(allow?.length ? { allow: allow.map(peelToolName) } : {}),
    ...(cleanedDeny?.length ? { deny: cleanedDeny } : {}),
  };
  return { ok: true, mask: Object.keys(mask).length ? mask : undefined };
}

function spawnChildVisibleTools(agentTools: string[], inheritMask?: InheritMask): string[] {
  return visibleSetToAgentTools(
    deriveVisibleSet({
      agentId: "",
      tier: "sub",
      agentTools,
      packs: getAppConfig().packs,
      childOwn: [...CHILD_OWN_TOOLS],
      inheritMask,
    }),
  );
}

async function spawnSubagentTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const maskCheck = validateSpawnInheritMask(args.inheritMask);
  if (!maskCheck.ok) {
    return { error: maskCheck.error, code: maskCheck.code, unknown: maskCheck.unknown };
  }
  const inheritMask = maskCheck.mask;
  if (!ctx.sessionId || !ctx.agentSnapshot) {
    throw new Error("spawn_subagent 需要在 Chat 会话中调用（缺少 sessionId 或 Agent 上下文）");
  }
  const task = String(args.task || "");
  if (!task.trim()) throw new Error("spawn_subagent 需要 task（子 Agent 任务描述）");
  const waitForResult = coerceToolBoolean(args.waitForResult);
  // 父派子 goal：显式 goal/goalText，或 task 已带 /goal 前缀 → 经 prepareAgentRun 设立外环
  const goalTextArg =
    typeof args.goalText === "string" && args.goalText.trim() ? args.goalText.trim() : "";
  const wantGoal = coerceToolBoolean(args.goal) || Boolean(goalTextArg);
  const dispatchTask = wantGoal
    ? task.trim().toLowerCase().startsWith("/goal")
      ? task
      : `/goal ${goalTextArg || task.trim()}`
    : task;
  const parentSnapshot = ctx.agentSnapshot;

  // TP-1：maxSubagentsPerSession 数量检查（manual path 此前无检查——
  // 与 startAsyncAgentTask isSubagent 分支同口径：running/queued 的子会话计数）
  if (ctx.prisma) {
    const limit = ctx.config.asyncJobs.maxSubagentsPerSession;
    const activeCount = await ctx.prisma.chatSession.count({
      where: { parentSessionId: ctx.sessionId, kind: "subagent", status: { in: ["running", "queued"] } },
    });
    if (activeCount >= limit) {
      throw new Error(`已达到每会话子 Agent 上限（${limit}），请先停止或等待已有子 Agent 完成后再派生。`);
    }
  }

  const orchestrator = getSwarmOrchestrator(ctx.config, ctx.services);
  // 中介者权限校验层（与 executeNativeTool 工具层同源输入，纵深防御；tier 缺省时与工具层一致跳过）
  const guard = parentSnapshot.tier
    ? {
        toolName: "spawn_subagent",
        args,
        ctx: {
          agentTier: parentSnapshot.tier,
          agentId: parentSnapshot.id,
          agentWorkspaceId: parentSnapshot.workspaceId,
          inToolRound: ctx.inToolRound ?? false,
        },
      }
    : undefined;

  // 经闭包写入：用 getter 防 TS 控制流把 prepared 窄化为 null
  let preparedSlot: SpawnPrepared | null = null;
  const getPrepared = () => preparedSlot;
  const setPrepared = (p: SpawnPrepared) => {
    preparedSlot = p;
    return p;
  };
  const buildAttach = (p: SpawnPrepared) => ({
    success: true,
    agentId: p.subagentId,
    subagentName: p.subagentName,
    subagentSessionId: p.subagentSessionId,
    jobId: p.jobId,
  });
  const dedupedPayload = (handle: { jobId: string; outcome?: SwarmTaskOutcome }) => {
    const payload = { ...(handle.outcome?.attach ?? {}) };
    return {
      ...payload,
      deduped: true,
      message: `60 秒去重窗口内检测到同 Agent 同任务的重复派生，已返回已有子 Agent 任务（jobId=${(payload.jobId as string | undefined) ?? handle.jobId}），未重复创建。`,
    };
  };

  if (!waitForResult) {
    // ── 异步投递：入池。准备段落 queued 载体；执行体获槽后起流，槽位持有到子会话本轮流结束 ──
    let handle;
    try {
      handle = await orchestrator.dispatch({
        origin: "spawn_subagent",
        schedule: "pool",
        sessionId: ctx.sessionId,
        workspaceId: parentSnapshot.workspaceId ?? null,
        taskLabel: task.slice(0, 80),
        timeoutMs: typeof args.timeoutMs === "number" ? args.timeoutMs : undefined,
        // W3：子 Agent 默认工具集 → requiredScopes（粗粒度）；WP1 列举，禁止 native:all
        tools: spawnChildVisibleTools([...DEFAULT_SUBAGENT_TOOLS], inheritMask),
        guard,
        dedup: {
          agentId: parentSnapshot.id,
          taskText: dispatchTask,
          // 早结 attach：dedup 命中方拿 ids 即返回，不等池任务收口（fire-and-forget）
          earlyOutcome: () => ({ status: "success", attach: buildAttach(getPrepared()!) }),
        },
        prepare: async () => {
          const p = setPrepared(await spawnSubagentPrepare(args, ctx, task, false, inheritMask));
          // 池任务 id = 跟踪 Task id：session.stop / async_task_cancel 同源可取消
          return {
            jobId: p.jobId,
            metadata: p.subagentSessionId ? { subagentSessionId: p.subagentSessionId } : undefined,
          };
        },
        execute: (signal) => {
          const fused = fuseSignals(signal, ctx.signal);
          return spawnSubagentPooledRun(ctx, dispatchTask, getPrepared()!, fused.signal).finally(() =>
            fused.dispose(),
          );
        },
      });
    } catch (err) {
      // 入池拒绝（maxQueued 满）/准备失败：回收 Phase A 产物，避免永远挂在 queued
      const msg = err instanceof Error ? err.message : String(err);
      const prepared = getPrepared();
      if (prepared?.jobId) {
        await ctx.services.task
          .update({ id: prepared.jobId, status: "failed", finishedAt: new Date(), output: { error: msg } } as any)
          .catch((err) => { console.warn("[session.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
      }
      if (prepared?.subagentSessionId) {
        await ctx.services.session.update({ id: prepared.subagentSessionId, status: "failed" } as any).catch((err) => { console.warn("[session.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
      }
      throw err;
    }

    if (handle.deduped) return dedupedPayload(handle);
    const p = getPrepared()!;
    const queued = handle.status === "queued";
    return {
      ...buildAttach(p),
      jobId: p.jobId ?? handle.jobId,
      status: handle.status,
      message: queued
        ? `子 Agent「${p.subagentName}」(agentId=${p.subagentId}) 已派生并入池排队（全局任务池槽位紧张，获槽后自动启动）；完成后结果会投递回父会话。请牢记返回的 agentId / jobId，勿编造 ID。`
        : `子 Agent「${p.subagentName}」(agentId=${p.subagentId}) 已派生并启动，任务完成后结果会投递回父会话。请牢记返回的 agentId / jobId，勿编造 ID。`,
    };
  }

  // ── 同步等待：槽位血缘继承（Q4）。inline 不占新槽；claim 子会话占用（父槽位让渡），
  // 子会话 hub 流不计入全局占用（Q2 口径），同一血缘同时只有一个执行体占槽 ──
  const pool = getAsyncJobOrchestrator(ctx.config);
  let releaseClaim: () => void = () => {};
  let handle;
  try {
    handle = await orchestrator.dispatch({
      origin: "spawn_subagent",
      schedule: "inline",
      sessionId: ctx.sessionId,
      taskLabel: task.slice(0, 80),
      guard,
      dedup: { agentId: parentSnapshot.id, taskText: dispatchTask },
      prepare: async () => {
        const p = setPrepared(await spawnSubagentPrepare(args, ctx, task, true, inheritMask));
        if (p.subagentSessionId) releaseClaim = pool.claimOccupancy(p.subagentSessionId);
        return { jobId: p.jobId };
      },
      execute: () => spawnSubagentSyncWait(ctx, dispatchTask, getPrepared()!),
    });
  } finally {
    // 为什么 finally 还槽：claim 期间子会话 hub 流退出「交互 running」口径（Q4 父槽位让渡），
    // dedup 早返 / prepare 或 execute 抛错任何路径漏还，都会让该会话后续交互流永久不计入全局占用（口径失真）。
    releaseClaim();
  }

  if (handle.deduped) return dedupedPayload(handle);
  return { ...(handle.outcome?.attach ?? {}) };
}

/** spawn Phase A（dispatch 准备段）：创建/解析子 Agent + find-or-create 主会话 + 跟踪 Task。
 *  dedup 命中时不运行（不重复创建）；pool 路径载体落 queued（右栏可见「agent 未启动」）。 */
async function spawnSubagentPrepare(
  args: Record<string, unknown>,
  ctx: NativeToolContext,
  task: string,
  waitForResult: boolean,
  inheritMask?: InheritMask,
): Promise<SpawnPrepared> {
  const parentSnapshot = ctx.agentSnapshot;
  if (!parentSnapshot) throw new Error("spawn_subagent 需要 Agent 上下文");

  // 1. 创建子 Agent（或复用指定 Agent）
  const modelOverride = args.model ? String(args.model).trim() : "";
  let resolvedSubModel = modelOverride || parentSnapshot.model;

  let subagentId: string;
  let subagentName: string;
  if (args.agentId && typeof args.agentId === "string") {
    const resolved = await ctx.services.agent.getById(String(args.agentId));
    if (!resolved) throw new Error("spawn_subagent 指定的 Agent 不存在");
    subagentId = resolved.id;
    subagentName = resolved.name;
    if (!modelOverride && resolved.model) resolvedSubModel = String(resolved.model);
  } else {
    const defaultPrompt = waitForResult
      ? `你是上级 Agent 派出的子 Agent。请完成下发的任务，必要时调用工具，并给出最终答复。上级正在同步等待你的回复，无需调用 agent_report_back；写完最终答复即可。\n\n任务：${task}`
      : `你是上级 Agent 派出的子 Agent。请完成下发的任务，必要时调用工具，最终使用 agent_report_back 向上级汇报结果。\n\n任务：${task}`;
    const createResult = await agentCreateSubTool(
      {
        name: args.name ? String(args.name) : defaultSubagentPlaceholderName(task),
        description: args.description ? String(args.description) : undefined,
        systemPrompt: args.systemPrompt ? String(args.systemPrompt) : defaultPrompt,
        // WP1：VisibleSet 列举，禁止 native:all；own 层强制 CHILD_OWN_TOOLS
        tools: spawnChildVisibleTools(
          Array.isArray(args.tools) && (args.tools as string[]).length > 0
            ? (args.tools as string[])
            : [...DEFAULT_SUBAGENT_TOOLS],
          inheritMask,
        ),
        model: modelOverride || parentSnapshot.model,
        workspaceId: args.workspaceId,
        toolInheritMask: inheritMask ?? null,
        toolOwn: [...CHILD_OWN_TOOLS],
      },
      ctx,
    );
    if ("error" in createResult) throw new Error(createResult.error as string);
    subagentId = (createResult as { agentId: string }).agentId;
    subagentName = (createResult as { name: string }).name;
    // 默认名时 fire-and-forget 调 LLM 起个正常名字；cuid 不变，父 Agent 仍能靠 agentId 找到
    // （动态 import：后台锦上添花路径，主链路无需加载 sessionAutoName 及其 LLM 依赖）
    if (!args.name && /^子\s*Agent\s+[a-z0-9]+$/i.test(subagentName)) {
      import("../../../sessionAutoName.js")
        .then(({ autoNameAgent }) => autoNameAgent(subagentId, task))
        .catch((err) => { console.warn("[session.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
    }
  }

  // 子 Agent 主会话（UI 跳转 + 跟踪 Task 绑定 + 同步等待的完成判定锚点）。
  // 必须在此 find-or-create：prepareAgentRun（agent_send_message autoRun 内）在后台异步建会话，
  // 若这里只 findFirst，首次 spawn 时拿到 undefined → 同步等待循环失去完成判定锚点（只能等 10 分钟超时）。
  // prepareAgentRun 侧 findFirst 会复用此会话（isMainSession 唯一），不会重复创建。
  // pool 路径落 queued（右栏可见「agent 未启动」），获槽后 prepareAgentRun 置 running；
  // inline 路径维持 running（同步等待语义不变）。
  const initialStatus = waitForResult ? "running" : "queued";
  let mainSession = await ctx.prisma?.chatSession.findFirst({
    where: { agentId: subagentId, isMainSession: true, status: { not: "deleted" } },
    orderBy: { updatedAt: "desc" },
  });
  if (!mainSession) {
    // W4：与下文一致，优先 ctx 注入的 resolveAgent，缺省回退 agentResolver 叶子模块
    const { agent: subAgent } = await (ctx.resolveAgent ?? defaultResolveAgent)(ctx.services, subagentId);
    const created = await ctx.services.session.create({
      title: `${subAgent?.name ?? subagentName} 主会话`,
      model: resolvedSubModel || subAgent?.model || parentSnapshot.model,
      systemPrompt: subAgent?.systemPrompt ?? "",
      agentId: subagentId,
      isMainSession: true,
      kind: "subagent",
      parentSessionId: ctx.sessionId ?? undefined,
      status: initialStatus,
      taskDescription: task.slice(0, 200),
    });
    if (created.success && created.data) {
      mainSession =
        (await ctx.prisma?.chatSession.findUnique({
          where: { id: (created.data as { id: string }).id },
        })) ?? null;
    }
  } else {
    // 复用已有主会话（P11 ensureMainSession 空壳）：pool 路径标 queued / inline 标 running；
    // 补齐 subagent 血缘字段，否则右栏/测试按 parentSessionId+kind 查不到本次派生子会话。
    const patch: Record<string, unknown> = {};
    if (!waitForResult) patch.status = "queued";
    else if (mainSession.status !== "running") patch.status = "running";
    if (modelOverride && mainSession.model !== modelOverride) patch.model = modelOverride;
    if (mainSession.kind !== "subagent") patch.kind = "subagent";
    if (ctx.sessionId && mainSession.parentSessionId !== ctx.sessionId) {
      patch.parentSessionId = ctx.sessionId;
    }
    if (Object.keys(patch).length > 0) {
      try {
        await ctx.services.session.update({ id: mainSession.id, ...patch } as any);
        mainSession = { ...mainSession, ...patch } as typeof mainSession;
      } catch {
        /* 状态/模型补齐失败不阻塞派生 */
      }
    }
  }
  const subagentSessionId = mainSession?.id;

  // 2. 跟踪 Task：pool 路径 queued + queuedAt；inline 路径 running + startedAt（原语义）。
  // 同步等待时 deliverToQueue=false（结果走 tool return，不进异步队列）。
  let jobId: string | undefined;
  if (ctx.sessionId && typeof ctx.services.task?.create === "function") {
    try {
      const taskLabel = subagentName || `子 Agent ${subagentId.slice(0, 6)}`;
      const created = await ctx.services.task.create({
        name: `[async] ${taskLabel}`,
        type: "async_agent",
        status: initialStatus,
        sessionId: ctx.sessionId,
        queuedAt: waitForResult ? null : new Date(),
        startedAt: waitForResult ? new Date() : null,
        input: {
          kind: "async_agent",
          sessionId: ctx.sessionId,
          task: task.slice(0, 500),
          taskLabel,
          agentSnapshot: {
            id: subagentId,
            model: resolvedSubModel,
            systemPrompt: "",
            tools: [],
            tier: "sub",
            parentId: parentSnapshot.id,
            workspaceId: parentSnapshot.workspaceId,
            name: subagentName,
          },
          subagentSessionId,
          sourceType: "subagent",
          // v7 通道收敛：waitForResult=true 时 deliverToQueue=false，结果唯一通道 = tool return
          deliverToQueue: !waitForResult,
        },
      } as any);
      if (created.success && created.data) {
        jobId = (created.data as { id: string }).id;
      }
    } catch (err) {
      console.warn("[spawn_subagent] 创建父会话跟踪 Task 失败:", err);
    }
  }

  return { subagentId, subagentName, subagentSessionId, jobId };
}

/** spawn 池内执行体（waitForResult=false）：获槽后起流，槽位持有到 hub.waitFor(子会话) 解析。
 *  跟踪 Task 的终态仍由 report_back 桥接回写（语义不动）；本闭包只覆盖「本轮流」的槽位占用，
 *  子空闲后的 drain 续跑由消费通道各自占槽。 */
async function spawnSubagentPooledRun(
  ctx: NativeToolContext,
  task: string,
  prepared: SpawnPrepared,
  signal: AbortSignal,
): Promise<SwarmTaskOutcome> {
  const { subagentId, subagentName, subagentSessionId, jobId } = prepared;
  const failOutcome = async (error: string): Promise<SwarmTaskOutcome> => {
    if (jobId) {
      await ctx.services.task
        .update({ id: jobId, status: "failed", finishedAt: new Date(), output: { error } } as any)
        .catch((err) => { console.warn("[session.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
    }
    return { status: "failed", error, attach: { success: false, agentId: subagentId, subagentName, subagentSessionId, jobId, error } };
  };

  // 获槽起流：跟踪 Task queued → running（右栏从「agent 未启动」转「执行中」）
  if (jobId) {
    await ctx.services.task.update({ id: jobId, status: "running", startedAt: new Date() } as any).catch((err) => { console.warn("[session.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
  }

  // Q2 不双算：子会话起流期间 claim 占用（池槽位已计）；release 前 waitFor 已解析，无窗口
  const releaseClaim = subagentSessionId
    ? getAsyncJobOrchestrator(ctx.config).claimOccupancy(subagentSessionId)
    : () => {};
  try {
    if (signal.aborted) return failOutcome("异步任务已取消（未启动）");

    const sendResult = await agentSendMessageTool(
      {
        toAgentId: subagentId,
        content: task,
        messageType: "command",
        autoRun: true,
        // 始终非阻塞首轮；槽位占用在下方 waitFor 闭环
        waitForRun: false,
      },
      ctx,
    );
    if ("error" in sendResult || !sendResult.success) {
      return failOutcome((sendResult as { error?: string }).error ?? "派活失败");
    }

    // 中断/超时（session.stop / async_task_cancel / 池超时）：abort 真正停子会话流
    if (subagentSessionId) {
      const stop = () => getStreamHub()?.stop(subagentSessionId);
      if (signal.aborted) stop();
      else signal.addEventListener("abort", stop, { once: true });
    }

    // 槽位持有到子会话本轮流结束（TP-1）
    const hub = getStreamHub();
    if (hub && subagentSessionId) {
      await hub.waitFor(subagentSessionId);
    }
    if (signal.aborted) return failOutcome("异步任务已取消");
    return { status: "success", attach: { success: true, agentId: subagentId, subagentName, subagentSessionId, jobId } };
  } catch (err) {
    return failOutcome(err instanceof Error ? err.message : String(err));
  } finally {
    releaseClaim();
  }
}

/** spawn 同步等待执行体（waitForResult=true，inline 血缘让渡）：父流挂起。完成条件：
 *  1) 子 Agent 主动 report_back → 跟踪 Task success/failed（提前结束，不进异步队列）
 *  2) 否则：子会话曾运行过（或暖机后）且判定空闲（isSubagentSessionSettled：无流、无「即将起流」
 *     标记、无子会话内 running/queued Task、无待处理队列项）→ 抓取最后一条 assistant */
async function spawnSubagentSyncWait(
  ctx: NativeToolContext,
  task: string,
  prepared: SpawnPrepared,
): Promise<SwarmTaskOutcome> {
  const { subagentId, subagentName, subagentSessionId, jobId } = prepared;

  const sendResult = await agentSendMessageTool(
    {
      toAgentId: subagentId,
      content: task,
      messageType: "command",
      autoRun: true,
      // 始终非阻塞首轮；同步等待在下方轮询子会话空闲 / report_back
      waitForRun: false,
    },
    ctx,
  );

  if ("error" in sendResult || !sendResult.success) {
    if (jobId) {
      await ctx.services.task
        .update({
          id: jobId,
          status: "failed",
          finishedAt: new Date(),
          output: { error: (sendResult as { error?: string }).error ?? "派活失败" },
        } as any)
        .catch((err) => { console.warn("[session.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
    }
    return { status: "failed", attach: { error: (sendResult as { error?: string }).error ?? "派活失败" } };
  }

  const waitDeadline = Date.now() + 10 * 60 * 1000;
  const waitStartedAt = Date.now();
  let finalContent = "";
  let finalStatus: "success" | "failed" | "timeout" = "timeout";
  let sawSubStream = false;

  // 为什么轮询而非订阅事件：完成判定有两条路径（report_back 写 Task 终态 / 子会话空闲抓 assistant），
  // 分属 DB 与 StreamHub 两个模块、无统一事件源；400ms 轮询 + 10 分钟硬上限（防父流永久挂起，
  // 与 waitForAsyncJob 同量级）是同时覆盖两条路径的最简判定。
  while (Date.now() < waitDeadline) {
    if (ctx.signal.aborted) {
      return { status: "failed", attach: { error: "spawn_subagent 等待已取消" } };
    }
    if (jobId) {
      const row = await ctx.services.task.getById(jobId);
      if (row && (row.status === "success" || row.status === "failed")) {
        finalStatus = row.status as "success" | "failed";
        const out = (row.output ?? {}) as { asyncResult?: string; error?: string };
        finalContent =
          row.status === "success"
            ? out.asyncResult || ""
            : `任务失败：${out.error || "未知错误"}`;
        // v7 通道收敛：deliverToQueue=false 的结果唯一通道是 tool return，永不走队列 CLAIM
        // （autoConsume / pull / reconciler 均以 deliverToQueue≠false 排除）。直接落 delivered=true
        // 闭环交付语义（与 async_task_run 同步路径同口径）；cleanup 只回收 delivered=true 的行。
        await ctx.services.task
          .update({ id: jobId, delivered: true, deliveredAt: new Date() } as any)
          .catch((err) => { console.warn("[session.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
        break;
      }
    }

    let streaming = false;
    let runStarting = false;
    if (subagentSessionId) {
      try {
        const hub = getStreamHub();
        streaming = !!hub?.isRunning(subagentSessionId);
        runStarting = !!hub?.isRunStarting(subagentSessionId);
      } catch {
        streaming = false;
      }
    }
    if (streaming) sawSubStream = true;

    let nestedActive = 0;
    if (subagentSessionId && ctx.prisma) {
      nestedActive = await ctx.prisma.task.count({
        where: {
          sessionId: subagentSessionId,
          status: { in: ["running", "queued"] },
        },
      });
    }

    // S2：待处理队列项也算忙——前轮结束到 drain 认领之间队列非空，此时判空闲会抓前轮旧 assistant
    let queuedItems = 0;
    if (subagentSessionId) {
      try {
        queuedItems = ((await ctx.services.sessionQueueItem?.listBySession(subagentSessionId)) ?? []).length;
      } catch {
        queuedItems = 0;
      }
    }

    // 暖机：避免 autoRun 尚未起流时被误判为空闲
    const warmedUp = sawSubStream || Date.now() - waitStartedAt >= 2000;
    if (
      warmedUp &&
      subagentSessionId &&
      ctx.prisma &&
      isSubagentSessionSettled({ streaming, runStarting, nestedActive, queuedItems })
    ) {
      const last = await ctx.prisma.chatMessage.findFirst({
        where: { sessionId: subagentSessionId, role: "assistant" },
        orderBy: { createdAt: "desc" },
        select: { content: true },
      });
      const text = (last?.content ?? "").trim();
      if (text) {
        finalContent = markUnverifiedAssistantDump(text);
        finalStatus = "success";
        // 落终态 + delivered=true：同上的 v7 sync 通道交付闭环；asyncResult 供右栏「同步任务」区
        // 与审计追溯，父 Agent 拿到的全文经下方 attach.content 返回。
        if (jobId) {
          await ctx.services.task
            .update({
              id: jobId,
              status: "success",
              finishedAt: new Date(),
              delivered: true,
              deliveredAt: new Date(),
              output: {
                asyncResult: finalContent,
                evidenceStatus: "none",
                evidence: [],
                outcome: "success",
              },
            } as any)
            .catch((err) => { console.warn("[session.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
        }
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  // 兜底：跟踪 Task 缺失或轮询超时时仍抓最后一条 assistant，避免空返回让父 Agent 误判子 Agent 无输出
  if (!finalContent && subagentSessionId && ctx.prisma) {
    const last = await ctx.prisma.chatMessage.findFirst({
      where: { sessionId: subagentSessionId, role: "assistant" },
      orderBy: { createdAt: "desc" },
      select: { content: true },
    });
    if (last?.content?.trim()) {
      finalContent = markUnverifiedAssistantDump(last.content);
      finalStatus = "success";
    }
  }

  if (!finalContent) {
    return {
      status: finalStatus === "success" ? "success" : "failed",
      attach: {
        success: finalStatus === "success",
        agentId: subagentId,
        subagentName,
        subagentSessionId,
        jobId,
        status: finalStatus,
        hint:
          finalStatus === "timeout"
            ? `子 Agent「${subagentName}」(agentId=${subagentId}) 在时限内未完成。可用 agent_inspect(id=该 agentId) 查看进度（勿编造 ID）。`
            : `子 Agent「${subagentName}」未返回有效内容。`,
      },
    };
  }

  return {
    status: finalStatus !== "failed" ? "success" : "failed",
    content: finalContent.slice(0, 500),
    attach: {
      success: finalStatus !== "failed",
      agentId: subagentId,
      subagentName,
      subagentSessionId,
      jobId,
      status: finalStatus,
      content: finalContent,
      hint: `子 Agent「${subagentName}」(agentId=${subagentId}) 已完成。请基于 content 字段生成最终回复；标识请用返回的 agentId/jobId，不要编造 memory key 或虚构 ID。`,
    },
  };
}

export const spawnSubagentHandlers: Record<string, NativeToolHandler> = {
  spawn_subagent: spawnSubagentTool,
};
