import { prisma } from "../../../../db.js";
import { coerceExperimentMetrics } from "../../../experimentLedger.js";
import {
  buildGoalKickoffMessage,
  clearSessionGoal,
  pauseSessionGoal,
  readGoalStateRaw,
  reportAutonomousGate,
  resumeSessionGoal,
  setSessionGoal,
} from "../../../goalLoop.js";
import { getStreamHub } from "../../../sessionStreamHub.js";
import { createTrpcInvoker } from "../../../trpcInvoker.js";
import { coerceToolBoolean, type NativeToolContext, type NativeToolHandler } from "../types.js";

async function taskRunTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const id = args.id ? String(args.id) : undefined;
  const name = args.name ? String(args.name) : undefined;
  if (!id && !name) {
    throw new Error(
      "参数不足：有任务 id 时只传 id；没有 id 时再传精确 name 匹配。" +
        "当前 id 与 name 都未提供。请先 todo_read / 任务列表核对后再调用。",
    );
  }

  let taskId = id;
  if (!taskId && name) {
    const result = await ctx.services.task.list({ page: 1, pageSize: 50 });
    const matched = result.items.find((t) => t.name === name);
    if (!matched) throw new Error(`未找到名称为 "${name}" 的 Task`);
    taskId = matched.id;
  }

  const runResult = await ctx.services.task.run(taskId!);
  if (!runResult.success) throw new Error(runResult.error?.message || "Task 执行失败");
  return { taskId, output: runResult.data };
}

export type SessionTodoStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface SessionTodoItem {
  id: string;
  content: string;
  status: SessionTodoStatus;
}

export interface SessionTodoState {
  todos: SessionTodoItem[];
  updatedAt: string;
}

const TODO_STATUSES = new Set<SessionTodoStatus>(["pending", "in_progress", "completed", "cancelled"]);

function parseTodoState(raw: unknown): SessionTodoState {
  if (!raw || typeof raw !== "object") return { todos: [], updatedAt: new Date(0).toISOString() };
  const obj = raw as { todos?: unknown; updatedAt?: unknown };
  const todos = Array.isArray(obj.todos) ? obj.todos : [];
  return {
    todos: todos
      .filter((t): t is Record<string, unknown> => !!t && typeof t === "object")
      .map((t) => ({
        id: String(t.id ?? ""),
        content: String(t.content ?? ""),
        status: (TODO_STATUSES.has(t.status as SessionTodoStatus)
          ? t.status
          : "pending") as SessionTodoStatus,
      }))
      .filter((t) => t.id && t.content),
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : new Date(0).toISOString(),
  };
}

/** 整表替换会话待办；至多一条 in_progress */
export function normalizeTodoWriteInput(rawTodos: unknown): SessionTodoItem[] {
  if (!Array.isArray(rawTodos)) throw new Error("todos 必须是数组");
  if (rawTodos.length > 40) throw new Error("todos 最多 40 项");
  const todos: SessionTodoItem[] = [];
  let inProgress = 0;
  for (const raw of rawTodos) {
    if (!raw || typeof raw !== "object") throw new Error("todos 每项必须是对象");
    const t = raw as Record<string, unknown>;
    const id = String(t.id ?? "").trim();
    const content = String(t.content ?? "").trim();
    const status = String(t.status ?? "pending").trim() as SessionTodoStatus;
    if (!id) throw new Error("todos[].id 不能为空");
    if (!content) throw new Error("todos[].content 不能为空");
    if (!TODO_STATUSES.has(status)) {
      throw new Error(`todos[].status 无效：${status}（允许 pending|in_progress|completed|cancelled）`);
    }
    if (status === "in_progress") inProgress++;
    todos.push({ id, content, status });
  }
  if (inProgress > 1) throw new Error("todos 至多允许一条 status=in_progress");
  return todos;
}

async function todoWriteTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.sessionId) {
    throw new Error("todo_write 需要在 Chat 会话中调用（缺少 sessionId）");
  }
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const todos = normalizeTodoWriteInput(args.todos);
  const state: SessionTodoState = { todos, updatedAt: new Date().toISOString() };
  await ctx.prisma.chatSession.update({
    where: { id: ctx.sessionId },
    data: { todoState: state as any },
  });
  const pending = todos.filter((t) => t.status === "pending").length;
  const inProgress = todos.filter((t) => t.status === "in_progress").length;
  const completed = todos.filter((t) => t.status === "completed").length;
  const cancelled = todos.filter((t) => t.status === "cancelled").length;
  return {
    ok: true,
    total: todos.length,
    pending,
    in_progress: inProgress,
    completed,
    cancelled,
    todos,
    updatedAt: state.updatedAt,
    summary: `待办 ${todos.length}项 · ${inProgress}进行中 · ${completed}完成` +
      (pending ? ` · ${pending}待办` : "") +
      (cancelled ? ` · ${cancelled}取消` : ""),
  };
}

async function todoReadTool(_args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.sessionId) {
    throw new Error("todo_read 需要在 Chat 会话中调用（缺少 sessionId）");
  }
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const row = await ctx.prisma.chatSession.findUnique({
    where: { id: ctx.sessionId },
    select: { todoState: true },
  });
  const state = parseTodoState(row?.todoState);
  const inProgress = state.todos.filter((t) => t.status === "in_progress").length;
  const completed = state.todos.filter((t) => t.status === "completed").length;
  return {
    total: state.todos.length,
    in_progress: inProgress,
    completed,
    todos: state.todos,
    updatedAt: state.updatedAt,
    summary:
      state.todos.length === 0
        ? "待办清单为空"
        : `待办 ${state.todos.length}项 · ${inProgress}进行中 · ${completed}完成`,
  };
}

function requireChatSessionId(ctx: NativeToolContext, tool: string): string {
  if (!ctx.sessionId) {
    throw new Error(`${tool} 需要在 Chat 会话中调用（缺少 sessionId）`);
  }
  return ctx.sessionId;
}

function summarizeGoal(goal: {
  mode: string;
  status: string;
  text: string;
  turnsUsed: number;
  maxTurns: number;
} | null) {
  if (!goal) return { ok: true, goal: null, summary: "当前无 standing goal" };
  return {
    ok: true,
    goal,
    summary: `Goal[${goal.mode}/${goal.status}] ${goal.turnsUsed}/${goal.maxTurns} · ${goal.text.slice(0, 120)}`,
  };
}

/**
 * Agent 自主设立会话外环 Goal（用户不必输入 /goal）。
 * 不立刻另起流：当前 run 内继续推进；本轮结束后由 goalLoop 裁判决定是否续跑。
 */
async function sessionGoalSetTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const sessionId = requireChatSessionId(ctx, "session_goal_set");
  const text = String(args.text ?? "").trim();
  if (!text) throw new Error("session_goal_set 需要 text（目标描述）");
  const mode =
    args.mode === "deep_research"
      ? "deep_research"
      : args.mode === "autonomous"
        ? "autonomous"
        : "goal";
  const maxTurns =
    typeof args.maxTurns === "number" && Number.isFinite(args.maxTurns)
      ? Math.max(1, Math.min(200, Math.floor(args.maxTurns)))
      : undefined;
  const judgeModel =
    typeof args.judgeModel === "string" && args.judgeModel.trim()
      ? args.judgeModel.trim()
      : undefined;

  const goal = await setSessionGoal({
    services: ctx.services,
    config: ctx.config,
    sessionId,
    text,
    mode,
    maxTurns,
    judgeModel,
  });
  return {
    ...summarizeGoal(goal),
    hint:
      mode === "autonomous"
        ? "autonomous 已设立：触顶≠成功；完成前须 autonomous_gate 上报外部指标。"
        : "Standing goal 已设立。本轮请继续推进该目标；结束后系统会自动裁判是否续跑。用户无需再输入 /goal。" +
          " 短问短答勿滥用；与 todo_write 分工：todo=本轮步骤清单，goal=跨轮外环目标。",
  };
}

async function autonomousGateTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const sessionId = requireChatSessionId(ctx, "autonomous_gate");
  const gatePreset = args.gatePreset ? String(args.gatePreset).trim() : "";
  let metrics = coerceExperimentMetrics(args.metrics);
  if (gatePreset) {
    const { runHarnessGatePreset } = await import("../../../harnessGate.js");
    const verified = await runHarnessGatePreset(ctx.config, gatePreset);
    metrics = { ...(metrics ?? {}), ...verified };
  }
  if (!metrics) {
    throw new Error(
      "autonomous_gate 需要 gatePreset（推荐）或 harness_gate_run 的 verified metrics；禁止自报 lintOk",
    );
  }
  const goal = await reportAutonomousGate({ sessionId, metrics });
  return {
    ...summarizeGoal(goal),
    gatePassed: goal.externalGate?.passed === true,
    metrics,
    hint:
      goal.externalGate?.passed === true
        ? "服务端核验 gate 已通过；裁判可将任务标完成。"
        : "gate 未通过或未核验通过；不可标成功，请修复后重跑 harness_gate_run / gatePreset。",
  };
}

async function sessionGoalStatusTool(_args: Record<string, unknown>, ctx: NativeToolContext) {
  const sessionId = requireChatSessionId(ctx, "session_goal_status");
  const goal = await readGoalStateRaw(sessionId);
  return summarizeGoal(goal);
}

async function sessionGoalClearTool(_args: Record<string, unknown>, ctx: NativeToolContext) {
  const sessionId = requireChatSessionId(ctx, "session_goal_clear");
  await clearSessionGoal(ctx.services, sessionId);
  return { ok: true, cleared: true, summary: "已清除 standing goal" };
}

async function sessionGoalPauseTool(_args: Record<string, unknown>, ctx: NativeToolContext) {
  const sessionId = requireChatSessionId(ctx, "session_goal_pause");
  const goal = await pauseSessionGoal(ctx.services, sessionId);
  if (!goal) return { ok: false, summary: "当前无 goal，无法暂停" };
  return summarizeGoal(goal);
}

async function sessionGoalResumeTool(_args: Record<string, unknown>, ctx: NativeToolContext) {
  const sessionId = requireChatSessionId(ctx, "session_goal_resume");
  const goal = await resumeSessionGoal(ctx.services, sessionId);
  if (!goal) return { ok: false, summary: "当前无 goal，无法恢复" };
  return {
    ...summarizeGoal(goal),
    hint: "Goal 已恢复为 active；本轮结束后若未完成会自动续跑。",
  };
}

/**
 * Briefing → 新独立 chat 会话 + standing goal + 可选立刻起流。
 * 供 cron briefing / 编排层：本会话只搜集上下文写 prompt，执行放到新会话。
 * 禁止 parentSessionId（否则 setSessionGoal 拒绝）。
 */
async function sessionSpawnGoalTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const operatorTier = ctx.agentSnapshot?.tier ?? "sub";
  const operatorId = ctx.agentSnapshot?.id ?? null;
  if (operatorTier === "sub") {
    return { error: "[TIER_INSUFFICIENT] 子 Agent 不允许调用 session_spawn_goal。" };
  }
  if (!operatorId) {
    return { error: "缺少调用方 Agent 身份，无法 session_spawn_goal。" };
  }

  const prompt = String(args.prompt ?? "").trim();
  const model = String(args.model ?? "").trim();
  if (prompt.length < 16) {
    return { error: "prompt 过短：请写入完整可执行任务说明（含验收标准）" };
  }
  if (!model) {
    return { error: "model 必填：指定新会话执行模型 id" };
  }

  const requestedAgentId =
    args.agentId === undefined || args.agentId === null || args.agentId === ""
      ? null
      : String(args.agentId);
  const targetAgentId = requestedAgentId ?? operatorId;
  if (operatorTier !== "super" && targetAgentId !== operatorId) {
    return {
      error: "[SELF_ONLY] 管理 Agent 只能为自己 spawn goal 会话；跨 Agent 仅超级 Agent 可操作。",
    };
  }

  const target = await ctx.services.prisma.agent.findUnique({
    where: { id: targetAgentId },
    select: { id: true, name: true, tier: true, status: true, model: true },
  });
  if (!target || target.status === "deleted") {
    return { error: "目标 Agent 不存在" };
  }
  if (target.tier === "sub") {
    return { error: "不能给子 Agent 开 goal 执行会话" };
  }

  const mode =
    args.mode === "deep_research"
      ? "deep_research"
      : args.mode === "autonomous"
        ? "autonomous"
        : "goal";
  const maxTurns =
    typeof args.maxTurns === "number" && Number.isFinite(args.maxTurns)
      ? Math.max(1, Math.min(200, Math.floor(args.maxTurns)))
      : undefined;
  const judgeModel =
    typeof args.judgeModel === "string" && args.judgeModel.trim()
      ? args.judgeModel.trim()
      : undefined;
  const startImmediately =
    args.startImmediately === undefined ? true : coerceToolBoolean(args.startImmediately);
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const title =
    typeof args.title === "string" && args.title.trim()
      ? args.title.trim().slice(0, 200)
      : `[goal] ${target.name} · ${stamp}`;

  const created = await ctx.services.session.create({
    title,
    model,
    agentId: target.id,
    kind: "chat",
    isMainSession: false,
    taskDescription: prompt.slice(0, 500),
    status: "active",
  });
  if (!created.success || !created.data) {
    return {
      error: created.error?.message ?? "创建执行会话失败",
    };
  }
  const newSessionId = (created.data as { id: string }).id;
  // SessionService.afterCreate 已推 session_list_changed；再推当前会话确保 briefing 标签即时侧栏刷新
  try {
    const { pushUiStateToSession } = await import("../../../uiStateNotify.js");
    if (ctx.sessionId) {
      pushUiStateToSession(ctx.sessionId, {
        type: "session_list_changed",
        agentId: target.id,
        sessionId: newSessionId,
        reason: "session_spawn_goal",
      });
    }
  } catch {
    /* ignore */
  }

  let goal;
  try {
    goal = await setSessionGoal({
      services: ctx.services,
      config: ctx.config,
      sessionId: newSessionId,
      text: prompt,
      mode,
      maxTurns,
      judgeModel,
      execModel: model,
    });
  } catch (err) {
    await ctx.services.session
      .update({ id: newSessionId, status: "failed" } as never)
      .catch((updateErr: unknown) => {
        console.warn(
          "[session] setSessionGoal 失败后回滚 status 失败:",
          updateErr instanceof Error ? updateErr.message : updateErr,
        );
      });
    return {
      error: err instanceof Error ? err.message : String(err),
      newSessionId,
    };
  }

  let streamStarted = false;
  let startError: string | undefined;
  if (startImmediately) {
    const hub = getStreamHub();
    if (!hub) {
      startError = "流式对话服务未就绪，goal 已写入但未起流（请重启 server 后手动 resume）";
    } else {
      const message = buildGoalKickoffMessage(goal);
      const body = {
        sessionId: newSessionId,
        message,
        model: goal.execModel || model,
        source: "system" as const,
        agentId: target.id,
      };
      try {
        const invoke = createTrpcInvoker({
          services: ctx.services,
          config: ctx.config,
          prisma: ctx.services.prisma ?? prisma,
        });
        streamStarted =
          (await hub.startIfNotRunning(newSessionId, body, (emit, signal) =>
            import("../../../agentStream.js").then(({ chatAgentStream }) =>
              chatAgentStream(ctx.services, ctx.config, body, invoke, emit, signal),
            ),
          )) === "started";
        if (!streamStarted) {
          startError = "会话已有进行中的流，goal 已设立但本次未起流";
        }
      } catch (err) {
        startError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  return {
    success: true,
    newSessionId,
    goal: summarizeGoal(goal),
    streamStarted,
    startError,
    hint:
      "已开独立执行会话并设立 standing goal。" +
      (streamStarted
        ? "执行会话已起流，本 briefing 会话可收尾汇报 newSessionId。"
        : "执行会话已创建；若未起流请重启 server 后稍后手动打开该会话。") +
      " 勿在本会话重复做完整交付。",
  };
}

export const sessionToolsHandlers: Record<string, NativeToolHandler> = {
  task_run: taskRunTool,
  todo_write: todoWriteTool,
  todo_read: todoReadTool,
  session_spawn_goal: sessionSpawnGoalTool,
  session_goal_set: sessionGoalSetTool,
  session_goal_status: sessionGoalStatusTool,
  session_goal_clear: sessionGoalClearTool,
  session_goal_pause: sessionGoalPauseTool,
  session_goal_resume: sessionGoalResumeTool,
  autonomous_gate: autonomousGateTool,
};
