import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import { runAgentLoop } from "../agentRuntime.js";
import { runAgentLoopStream, type AgentStreamEvent } from "../agentStream/index.js";
import {
  parseAgentTools,
  buildAgentToolSchemas,
  executeToolCallsBatch,
  createAgentToolContext,
  type ToolRegistryEntry,
} from "../agentTools.js";
import type { LlmToolCall } from "../llmClient.js";
import { getStreamHub } from "../sessionStreamHub.js";
import type { StoredToolCall } from "../chatHistory.js";
import { waitMs } from "../shellRunner.js";
import { createTrpcInvoker } from "../trpcInvoker.js";
import { prisma } from "../../db.js";
import { getAsyncJobOrchestrator } from "../asyncJobOrchestrator.js";
import { getSwarmOrchestrator } from "../swarmOrchestrator.js";
import { assertLlmBudget } from "../llmBudget.js";
import { resolveToolsForAgentTier } from "../loop/setup.js";
import {
  isAbortLikeError,
  messageFromAbortSignal,
  resolveAbortReasonCode,
} from "../abortReason.js";
import {
  ASYNC_KIND,
  catchUnlessAbort,
  parseAsyncInput,
  parseAsyncOutput,
  type AsyncTaskInput,
  type AsyncTaskLogEntry,
  type AsyncTaskOutput,
  type AsyncTaskSourceType,
} from "./parse.js";
import { notifyAsyncDelivery, notifySubagentSessionUpdate } from "./delivery.js";
import { pushAsyncJobInterrupted } from "./query.js";
import { commitAsyncTaskIfCurrentExecution, failAsyncTaskIfStillActive } from "./commitTerminal.js";

export function buildAsyncExecute(
  config: AppConfig,
  services: ServiceContainer,
  jobId: string,
  task: string,
  agentSnapshot: AsyncTaskInput["agentSnapshot"],
  // 重跑来源（仅系统提示文案）：null=首发；"manual"=手动 retry；"resume"=中断恢复
  retryKind: "manual" | "resume" | null,
  subagentSessionId?: string,
  mode: "llm" | "tool" = "llm",
  toolCall?: { tool: string; args: Record<string, unknown> },
  shareToSessionIds?: string[],
  parentSessionId?: string,
): (signal: AbortSignal) => Promise<void> {
  const invokeTrpc = createTrpcInvoker({ services });
  const retryHint =
    retryKind === "manual" ? "（手动重试）" : retryKind === "resume" ? "（恢复中断任务）" : "";
  /** 本轮执行世代；resume 换新后旧轮 finalize* 见不一致即退出 */
  let executionId = "";
  const syncSubStatus = async (status: "completed" | "failed" | "paused" | "running") => {
    if (!subagentSessionId) return;
    try {
      await services.session.update({ id: subagentSessionId, status });
      if (parentSessionId) {
        await notifySubagentSessionUpdate({
          parentSessionId,
          subagentSessionId,
          status,
        });
      }
    } catch (err) {
      console.warn(`[asyncJobManager] syncSubStatus(${status}) 失败 for ${subagentSessionId}:`, err);
    }
  };
  const broadcastShare = async (status: "success" | "failed", output: AsyncTaskOutput) => {
    if (!shareToSessionIds?.length) return;
    const input = parseAsyncInput((await services.task.getById(jobId))?.input);
    if (!input) return;
    for (const targetSessionId of shareToSessionIds) {
      if (targetSessionId === input.sessionId) continue;
      try {
        await services.task.create({
          name: `[async-share] ${input.taskLabel}`,
          type: "oneshot",
          status,
          sessionId: targetSessionId,
          input: { ...input, sessionId: targetSessionId, shareToSessionIds: undefined },
        } as any);
      } catch (err) {
        console.warn(`[asyncJobManager] broadcastShare 到 ${targetSessionId} 失败:`, err);
      }
    }
  };
  const subagentOnly = agentSnapshot.tier === "sub";
  const workerTools = resolveToolsForAgentTier(agentSnapshot.tier, agentSnapshot.tools);

  const subagentHint = subagentOnly
    ? "\n\n注意：你是被派来直接执行该任务的子 Agent。你可以调用 async_task_run（toolCall 指定要执行的工具）把耗时步骤放入后台执行，但禁止调用 spawn_subagent、agent_create*、agent_send_message、agent_report_back 等再次派生或管理 Agent 的工具。请直接使用其他可用工具完成任务，不要继续追问用户。"
    : "";
  const agentSystemPrompt = `${agentSnapshot.systemPrompt}\n\n你正在执行后台异步任务${retryHint}。完成后用简洁中文汇总结果，不要继续追问用户。${subagentHint}`;
  const agentForLoop = { model: agentSnapshot.model, systemPrompt: agentSystemPrompt, tools: workerTools };
  const runLoopOptions = {
    config,
    services,
    agent: agentForLoop,
    messages: [{ role: "user", content: task } as const],
    invokeTrpc,
    sessionId: subagentSessionId,
    agentMeta: agentSnapshot,
    runOrigin: "parent" as const,
  };

  const finalizeSuccess = async (
    loop: {
      content: string;
      toolCalls: StoredToolCall[];
      tokenUsage: { prompt: number; completion: number; total: number };
      model: string;
      provider: string;
      roundsUsed: number;
    },
    emit?: (event: AgentStreamEvent) => void,
  ) => {
    try {
      const latestBefore = await services.task.getById(jobId);
      if (parseAsyncOutput(latestBefore?.output).executionId !== executionId) {
        return;
      }
      const resultText = loop.content || "(无文本输出)";
      const tokenUsage = loop.tokenUsage;
      await appendAsyncJobLog(jobId, { level: "info", message: `任务完成，共 ${loop.roundsUsed} 轮` }, services);
      // 为什么结果要落一条 assistant 消息：子会话消息链是 ReAct 上下文的事实源
      //（agentRuntime/agentStream 均按 sessionId 从消息表扁平重建多轮上下文），只写 Task.output 会断链；同时供子会话页可视化。
      if (subagentSessionId) {
        try {
          await services.message.create({
            sessionId: subagentSessionId,
            role: "assistant",
            content: resultText,
            toolCalls: loop.toolCalls as any,
            tokenUsage: tokenUsage ?? undefined,
            source: "sub",
          });
        } catch (msgErr) {
          console.warn(`[asyncJobManager] 保存子 Agent 结果消息失败:`, msgErr);
        }
      }
      const existingOutput = parseAsyncOutput((await services.task.getById(jobId))?.output);
      const committed = await commitAsyncTaskIfCurrentExecution(prisma, {
        jobId,
        executionId,
        status: "success",
        output: {
          asyncResult: resultText,
          tokenUsage,
          logs: existingOutput.logs,
          executionId,
        } satisfies AsyncTaskOutput,
      });
      if (committed === 0) return;
      await syncSubStatus("completed");
      if (agentSnapshot.tier === "sub" && agentSnapshot.parentId) {
        await services.agent.update({ id: agentSnapshot.id, status: "dormant" } as any).catch((err) => {
          console.warn(`[asyncJobManager] 标记子 Agent dormant 失败 agent=${agentSnapshot.id}:`, err instanceof Error ? err.message : err);
        });
      }
      await broadcastShare("success", { asyncResult: resultText, tokenUsage });
      const parentInput = parseAsyncInput((await services.task.getById(jobId))?.input);
      // v7 唯一投递闸：deliverToQueue=false（同步等待）时结果唯一通道是 tool return，禁止 notify 进队列二次投喂
      if (parentInput?.sessionId && parentInput.deliverToQueue !== false) {
        await notifyAsyncDelivery(parentInput.sessionId, jobId, "done", parentInput.taskLabel, services, config);
      }
      emit?.({
        type: "done",
        sessionId: subagentSessionId!,
        agentId: agentSnapshot.id,
        content: resultText,
        toolCalls: loop.toolCalls,
        model: loop.model,
        provider: loop.provider,
        roundsUsed: loop.roundsUsed,
        tokenUsage,
      });
    } catch (err) {
      // 成功收尾任何步骤失败都不得上抛；已 success 禁止回翻 failed（N-6）
      console.warn(`[asyncJobManager] finalizeSuccess 失败 job=${jobId}:`, err);
      try {
        await failAsyncTaskIfStillActive(
          prisma,
          jobId,
          `收尾失败: ${err instanceof Error ? err.message : String(err)}`,
        );
      } catch (lastErr) {
        console.error(`[asyncJobManager] finalizeSuccess 最终兜底也失败 job=${jobId}:`, lastErr);
      }
    }
  };

  const finalizeFailure = async (err: unknown, emit?: (event: AgentStreamEvent) => void) => {
    try {
      // resume 已开新执行：旧轮收尾不得把新状态打回 interrupted/failed
      const latestBefore = await services.task.getById(jobId);
      if (parseAsyncOutput(latestBefore?.output).executionId !== executionId) {
        return;
      }
      const isAbort = isAbortLikeError(err);
      const abortCode = resolveAbortReasonCode(undefined, err);
      const isTimeout = abortCode === "timeout" || (err instanceof Error && err.message.includes("超时"));
      // 主动取消/停会话 → interrupted；超时与其它错误 → failed（与取消语义区分）
      const isInterrupt =
        isAbort && (abortCode === "cancel" || abortCode === "session_stop" || abortCode === "user");
      const terminalStatus = isInterrupt ? "interrupted" : "failed";
      const errorText = isAbort
        ? messageFromAbortSignal(undefined, err)
        : isTimeout
          ? "异步任务执行超时"
          : err instanceof Error
            ? err.message
            : String(err);
      await appendAsyncJobLog(jobId, { level: "error", message: errorText }, services);
      const existingOutputFailed = parseAsyncOutput((await services.task.getById(jobId))?.output);
      // 若 cancelAsyncJob 已先写 interrupted，禁止再覆写为 failed；旧轮 executionId 不一致也不写
      const writtenCount = await commitAsyncTaskIfCurrentExecution(prisma, {
        jobId,
        executionId,
        status: terminalStatus,
        output: {
          error: errorText,
          logs: existingOutputFailed.logs,
          executionId,
          ...(isInterrupt ? { deliveryExempt: true } : {}),
        } satisfies AsyncTaskOutput,
        delivered: isInterrupt,
      });
      if (writtenCount === 0 && isInterrupt) {
        // 已是 interrupted：仍推一次，保证开着的 UI 对齐
        const row = await services.task.getById(jobId);
        if (row?.sessionId) await pushAsyncJobInterrupted(row.sessionId, jobId, config);
      } else if (writtenCount > 0 && isInterrupt) {
        const row = await services.task.getById(jobId);
        if (row?.sessionId) await pushAsyncJobInterrupted(row.sessionId, jobId, config);
      }
      await syncSubStatus(isInterrupt || (isAbort && !isTimeout) ? "paused" : "failed");
      if (subagentSessionId) {
        try {
          await services.message.create({
            sessionId: subagentSessionId,
            role: "assistant",
            content: isInterrupt ? `任务已中断：${errorText}` : `任务未能完成：${errorText}`,
            source: "sub",
          });
        } catch (msgErr) {
          console.warn(`[asyncJobManager] 保存子 Agent 失败消息失败:`, msgErr);
        }
      }
      await broadcastShare("failed", { error: errorText });
      const parentInputFailed = parseAsyncInput((await services.task.getById(jobId))?.input);
      // 中断/sleep/纯工具失败：不进对话气泡（右栏 Task 仍可见）
      const skipFailedBubble =
        isInterrupt ||
        parentInputFailed?.sourceType === "sleep" ||
        parentInputFailed?.sourceType === "async_task_tool";
      if (
        parentInputFailed?.sessionId &&
        parentInputFailed.deliverToQueue !== false &&
        !skipFailedBubble
      ) {
        await notifyAsyncDelivery(parentInputFailed.sessionId, jobId, "failed", parentInputFailed.taskLabel, services, config);
      }
      emit?.({ type: "error", message: errorText, sessionId: subagentSessionId });
    } catch (outerErr) {
      // 失败收尾本身绝不允许上抛——否则 Task 终态落不了库，前端右栏永久 running
      console.error(`[asyncJobManager] finalizeFailure 失败 job=${jobId}:`, outerErr);
      try {
        await services.task.update({
          id: jobId,
          status: "failed",
          finishedAt: new Date(),
          output: { error: `收尾失败: ${outerErr instanceof Error ? outerErr.message : String(outerErr)}` } satisfies AsyncTaskOutput,
        } as any);
      } catch (lastErr) {
        console.error(`[asyncJobManager] finalizeFailure 最终兜底也失败 job=${jobId}:`, lastErr);
      }
    }
  };

  const runToolOnly = async (signal: AbortSignal) => {
    if (!toolCall) throw new Error("mode=tool 但未提供 toolCall");
    try {
      const parsed = parseAgentTools(workerTools);
      const registry = new Map<string, ToolRegistryEntry>();
      await buildAgentToolSchemas(services, parsed, registry);
      const toolCtx = createAgentToolContext(config, services, invokeTrpc, parsed, undefined, {
        // 纯工具异步复用父会话上下文；缺 sessionId 会导致 sleep(async=true) 等工具直接抛错
        sessionId: subagentSessionId ?? parentSessionId,
        agentSnapshot,
        runOrigin: "parent",
        signal,
      });
      const call: LlmToolCall = {
        id: `tool-${jobId.slice(0, 8)}`,
        type: "function",
        function: { name: toolCall.tool, arguments: JSON.stringify(toolCall.args ?? {}) },
      };
      const results = await executeToolCallsBatch([call], toolCtx, registry, parsed, signal);
      const result = results[0]?.result;
      const latestTool = await services.task.getById(jobId);
      if (parseAsyncOutput(latestTool?.output).executionId !== executionId) {
        return;
      }
      // 禁止裸 JSON.stringify：投递契约收在 asyncToolDeliveryFormat（LLM 可行动 + UI structured）
      const { formatAsyncToolDelivery } = await import("../asyncToolDeliveryFormat.js");
      const parentInputForLabel = parseAsyncInput(latestTool?.input);
      const formatted = formatAsyncToolDelivery(toolCall.tool, result, {
        taskLabel: parentInputForLabel?.taskLabel ?? task,
      });
      const resultText = formatted.textForLlm;
      if (subagentSessionId) {
        await services.message.create({
          sessionId: subagentSessionId,
          role: "assistant",
          content: resultText,
          source: "sub",
        }).catch((err: unknown) => {
          console.warn(
            "[asyncJob] 纯工具结果写入子会话失败:",
            err instanceof Error ? err.message : err,
          );
        });
      }
      const toolCommitted = await commitAsyncTaskIfCurrentExecution(prisma, {
        jobId,
        executionId,
        status: "success",
        output: {
          asyncResult: resultText,
          structured: formatted.structured,
          executionId,
        } satisfies AsyncTaskOutput,
      });
      if (toolCommitted === 0) return;
      await syncSubStatus("completed");
      await broadcastShare("success", { asyncResult: resultText, structured: formatted.structured });
      const parentInputTool = parseAsyncInput((await services.task.getById(jobId))?.input);
      // 同 finalizeSuccess 的 v7 投递闸（纯工具路径）
      if (parentInputTool?.sessionId && parentInputTool.deliverToQueue !== false) {
        await notifyAsyncDelivery(parentInputTool.sessionId, jobId, "done", parentInputTool.taskLabel, services, config);
      }
    } catch (err) {
      // 纯工具路径任何步骤失败都必须走到 finalizeFailure，禁止未处理 rejection 或永久 running
      await finalizeFailure(err);
    }
  };

  return async (signal) => {
    executionId = `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
    // 任务原文落 user 消息：与 finalizeSuccess 的 assistant 结果消息配对，构成子会话 ReAct 上下文事实链（同上）
    if (subagentSessionId) {
      try {
        await services.message.create({
          sessionId: subagentSessionId,
          role: "user",
          content: task,
          source: "super",
        });
      } catch (msgErr) {
        console.warn(`[asyncJobManager] 保存子 Agent 任务消息失败:`, msgErr);
      }
    }

    try {
      if (signal.aborted) {
        throw new Error("异步任务已被取消");
      }
      await syncSubStatus("running");
      try {
        const prev = parseAsyncOutput((await services.task.getById(jobId))?.output);
        await services.task.update({
          id: jobId,
          status: "running",
          startedAt: new Date(),
          output: { logs: prev.logs, executionId } satisfies AsyncTaskOutput,
        } as any);
      } catch (err) {
        console.warn(`[asyncJobManager] 标记任务 running 失败 job=${jobId}:`, err instanceof Error ? err.message : err);
      }
      await appendAsyncJobLog(jobId, { level: "info", message: "任务开始执行" }, services);

      if (mode === "tool") {
        await runToolOnly(signal);
        return;
      }

      if (subagentSessionId) {
        const hub = getStreamHub();
        if (hub) {
          // Q2 不双算：池内任务起流的子会话在起流前 claim 占用（池槽位已计 runningGlobal，
          // 不 claim 则同一执行体被 hub 交互 running 再计一次）。claim → startIfNotRunning 之间
          // 无 await 交错点；release 在 waitFor 解析之后（completed=true 已不计交互 running），无窗口。
          // 本闭包是所有 isSubagent 池任务（session.spawn / rerun / retry）唯一执行体工厂，
          // 不变量收在此处，不靠各入口自觉。
          const releaseClaim = getAsyncJobOrchestrator(config).claimOccupancy(subagentSessionId);
          try {
            const hubInput = {
              sessionId: subagentSessionId,
              agentId: agentSnapshot.id,
              message: task,
            };
            const started = await hub.startIfNotRunning(subagentSessionId, hubInput, async (emit, hubSignal) => {
              try {
                const loop = await runAgentLoopStream({
                  ...runLoopOptions,
                  llmOptions: {},
                  emit,
                  signal: hubSignal,
                });
                await finalizeSuccess(loop, emit);
              } catch (runErr) {
                await finalizeFailure(runErr, emit);
              }
            });
            if (started === "started") {
              // 池 abort（超时/取消）必须传导到 hub 真正停子会话流，否则 LLM 在后台继续空转烧钱
              signal.addEventListener("abort", () => hub.stop(subagentSessionId), { once: true });
              // 通知前端挂接子会话流（切到子页时不必等刷新）
              hub.pushExternalEvent(subagentSessionId, {
                type: "session_run_started",
                sessionId: subagentSessionId,
                reason: "subagent_start",
                jobId,
              });
              if (parentSessionId) {
                hub.pushExternalEvent(parentSessionId, {
                  type: "session_run_started",
                  sessionId: subagentSessionId,
                  reason: "subagent_start",
                  jobId,
                });
              }
            }
            await hub.waitFor(subagentSessionId, signal);
            return;
          } finally {
            releaseClaim();
          }
        }
      }

      const loop = await runAgentLoop({
        ...runLoopOptions,
        signal,
        onProgress: (message) => appendAsyncJobLog(jobId, { level: "progress", message }, services),
      });
      await finalizeSuccess(loop);
    } catch (err: unknown) {
      await finalizeFailure(err);
    }
  };
}

export async function startAsyncAgentTask(options: {
  sessionId: string;
  task: string;
  label?: string;
  timeoutMs?: number;
  config: AppConfig;
  services: ServiceContainer;
  agent: { id: string; model: string; systemPrompt: string; tools: string[] };
  /** 调用来源，用于 Agent.source 与审计区分 async_task_run / spawn_subagent */
  source?: string;
  /** 是否属于 spawn_subagent 派生的子 Agent（UI 显示“与之对话”） */
  isSubagent?: boolean;
  /** 异步任务模式：llm=后台 LLM 推理；tool=纯工具执行（不调用 LLM） */
  mode?: "llm" | "tool";
  /** mode=tool 时直接指定要执行的一次性工具调用 */
  toolCall?: { tool: string; args: Record<string, unknown> };
  /** swarm 协作：结果额外广播到这些会话 */
  shareToSessionIds?: string[];
  /**
   * v7 通道收敛锚点：true = 结果进异步队列，经原子 CLAIM 后注入会话；
   * false = 结果走 tool return 直返父 Agent（如 waitForResult=true）。两条通道互斥，禁止同时开闸。
   * 默认 true。
   */
  deliverToQueue?: boolean;
}): Promise<{ jobId: string; status: "queued" | "running"; message: string; subagentSessionId?: string }> {
  const task = options.task.trim();
  if (!task) throw new Error("task 不能为空");
  if (!options.sessionId) throw new Error("async_task_run 需要有效 sessionId");

  const mode = options.mode ?? "llm";
  const isSubagent = options.isSubagent === true;

  if (mode === "tool" && options.toolCall && !options.toolCall.tool) {
    throw new Error("mode=tool 时必须提供有效的 toolCall.tool");
  }

  // 预算检查：只有 LLM 模式才需要检查 LLM 预算
  if (mode === "llm") {
    assertLlmBudget(options.config);
  }

  const taskLabel = options.label?.trim() || task.slice(0, 80);

  let sourceType: AsyncTaskSourceType;
  if (isSubagent) sourceType = "subagent";
  else if (mode === "tool") sourceType = "async_task_tool";
  else sourceType = "async_task_llm";

  const orchestrator = getAsyncJobOrchestrator(options.config);
  const stats = orchestrator.getStats();
  // 纯工具不占 LLM 全局槽，不会因 maxConcurrent 排队；LLM/子 Agent 仍走 Q2 准入口径
  const willQueue =
    mode === "tool"
      ? false
      : stats.runningGlobal + stats.hubInteractiveRunning >= stats.limits.maxGlobal;
  const initialStatus = willQueue ? "queued" : "running";

  const parentAgent = await prisma.agent
    .findUnique({ where: { id: options.agent.id } })
    .catch((err) => {
      console.warn(
        "[asyncJobManager] 读 parent Agent 失败:",
        err instanceof Error ? err.message : err,
      );
      return null;
    });
  // 行级 Workspace 槽配额（Q4）；Root 常用 0=不限，业务空间默认 2
  let workspaceSlotQuota: number | undefined;
  const parentWorkspaceId = parentAgent?.workspaceId ?? null;
  if (parentWorkspaceId) {
    const ws = await prisma.workspace
      .findUnique({ where: { id: parentWorkspaceId } })
      .catch((err) => {
        console.warn(
          "[asyncJobManager] 读 Workspace 配额失败:",
          err instanceof Error ? err.message : err,
        );
        return null;
      });
    const quota = (ws as { asyncSlotQuota?: number } | null)?.asyncSlotQuota;
    if (typeof quota === "number") workspaceSlotQuota = quota;
  }

  // async_task_run：不创建新的 Agent/会话，直接复用父 Agent 身份跑后台任务。
  // spawn_subagent：才创建独立的 tier=sub 子 Agent 和 subagent ChatSession。
  let subAgentId: string | undefined;
  let subagentSessionId: string | undefined;
  let agentSnapshot: AsyncTaskInput["agentSnapshot"];

  if (isSubagent) {
    // 数量上限：防止同一父会话失控开太多 subagent
    const activeCount = await prisma.chatSession.count({
      where: {
        parentSessionId: options.sessionId,
        kind: "subagent",
        status: { in: ["running", "queued"] },
      },
    });
    const limit = options.config.asyncJobs.maxSubagentsPerSession;
    if (activeCount >= limit) {
      throw new Error(`已达到每会话子 Agent 上限（${limit}），请先停止或等待已有任务完成后再启动新任务。`);
    }

    // 子 Agent 只保留执行类工具，禁止继承 spawn/async_task_run/async_task_cancel 等编排工具
    const subagentTools = resolveToolsForAgentTier("sub", options.agent.tools);

    try {
      const subAgentResult = await options.services.agent.create({
        name: `${taskLabel.slice(0, 40)} 子 Agent`,
        description: `由 ${parentAgent?.name ?? options.agent.id} 派生的子 Agent（任务：${taskLabel.slice(0, 60)}）`,
        source: options.source ?? "native_tool:spawn_subagent",
        model: options.agent.model,
        systemPrompt: options.agent.systemPrompt,
        tools: subagentTools,
        tier: "sub",
        parentId: options.agent.id,
        workspaceId: parentAgent?.workspaceId ?? undefined,
      });
      if (subAgentResult.success && subAgentResult.data) {
        subAgentId = (subAgentResult.data as { id: string }).id;
      }
    } catch (err) {
      console.warn(`[asyncJobManager] 创建独立子 Agent 失败，降级复用父 Agent:`, err);
    }

    const actualSubAgentId = subAgentId ?? options.agent.id;
    const subagentName = `${taskLabel.slice(0, 40)} 子 Agent`;

    try {
      const sub = await options.services.session.create({
        title: taskLabel.slice(0, 60),
        model: options.agent.model,
        systemPrompt: options.agent.systemPrompt,
        agentId: actualSubAgentId,
        parentSessionId: options.sessionId,
        kind: "subagent",
        taskDescription: task,
        status: initialStatus,
      } as any);
      if (sub.success && sub.data) subagentSessionId = (sub.data as { id: string }).id;
      if (subagentSessionId) {
        notifySubagentSessionUpdate({
          parentSessionId: options.sessionId,
          subagentSessionId,
          status: initialStatus,
          title: taskLabel.slice(0, 60),
          agentId: actualSubAgentId,
        }).catch(catchUnlessAbort("[asyncJobManager] notifySubagentSessionUpdate (spawn)"));
      }
    } catch (err) {
      console.warn(`[asyncJobManager] 创建 subagent session 失败，降级为无可视化载体继续执行:`, err);
    }

    agentSnapshot = {
      id: actualSubAgentId,
      model: options.agent.model,
      systemPrompt: options.agent.systemPrompt,
      tools: options.agent.tools,
      tier: "sub",
      parentId: options.agent.id,
      workspaceId: parentAgent?.workspaceId ?? null,
      name: subagentName,
    };
  } else {
    agentSnapshot = {
      id: options.agent.id,
      model: options.agent.model,
      systemPrompt: options.agent.systemPrompt,
      tools: options.agent.tools,
      tier: parentAgent?.tier ?? "sub",
      parentId: parentAgent?.parentId ?? null,
      workspaceId: parentAgent?.workspaceId ?? null,
      name: parentAgent?.name ?? options.agent.id,
    };
  }

  const created = await options.services.task.create({
    name: `[async] ${taskLabel}`,
    type: "async_agent",
    status: willQueue ? "queued" : "running",
    sessionId: options.sessionId,
    queuedAt: willQueue ? new Date() : null,
    startedAt: willQueue ? null : new Date(),
    input: {
      kind: ASYNC_KIND,
      sessionId: options.sessionId,
      task,
      taskLabel,
      agentSnapshot,
      timeoutMs: options.timeoutMs,
      subagentSessionId,
      sourceType,
      toolCall: mode === "tool" ? options.toolCall : undefined,
      shareToSessionIds: options.shareToSessionIds?.length ? options.shareToSessionIds : undefined,
      deliverToQueue: options.deliverToQueue !== false,
    } satisfies AsyncTaskInput,
  } as any);

  if (!created.success || !created.data) {
    throw new Error(created.error?.message ?? "创建异步任务失败");
  }

  const jobId = (created.data as { id: string }).id;

  // W10：统一走 SwarmOrchestrator 中介者（并发池/结果聚合/Log 审计公共骨架）；
  // 执行体仍是 buildAsyncExecute（轮询/推送/落库/子会话状态同步语义不动）。
  const swarm = getSwarmOrchestrator(options.config, options.services);
  try {
    await swarm.dispatch({
      origin: isSubagent ? "spawn_subagent" : "async_task_run",
      schedule: "pool",
      sessionId: options.sessionId,
      workspaceId: agentSnapshot.workspaceId ?? parentWorkspaceId ?? null,
      workspaceSlotQuota: mode === "tool" ? undefined : workspaceSlotQuota,
      jobId,
      taskLabel,
      timeoutMs: options.timeoutMs,
      // sleep/纯工具：lightweight 不占全局 LLM 槽
      slotClass: mode === "tool" ? "lightweight" : "llm",
      metadata: subagentSessionId ? { subagentSessionId } : undefined,
      // W3：按工具集声明 requiredScopes，与 pending approval scope 相交则 gate 排队
      tools: Array.isArray(agentSnapshot.tools) ? agentSnapshot.tools : [],
      execute: async (signal) => {
        await buildAsyncExecute(
          options.config,
          options.services,
          jobId,
          task,
          agentSnapshot,
          null,
          subagentSessionId,
          mode,
          options.toolCall,
          options.shareToSessionIds,
          options.sessionId,
        )(signal);
        // 结果聚合：buildAsyncExecute 内部已落库/投递，读回终态供中介者审计
        try {
          const row = await options.services.task.getById(jobId);
          return row?.status === "failed"
            ? { status: "failed" as const, error: parseAsyncOutput(row?.output).error }
            : { status: "success" as const };
        } catch {
          // 任务行已被清理（测试/手动删除）：不阻塞聚合收口
          return { status: "success" as const };
        }
      },
    });
  } catch (err) {
    // 入池拒绝（maxQueued 满）：回收 Task 行，错误上抛（LLM 工具返回「队列已满，请稍后再派」）
    await options.services.task
      .update({
        id: jobId,
        status: "failed",
        finishedAt: new Date(),
        output: { error: err instanceof Error ? err.message : String(err) } satisfies AsyncTaskOutput,
      } as any)
      .catch(catchUnlessAbort("[asyncJobManager] task cleanup update (pool reject)"));
    throw err;
  }

  return {
    jobId,
    status: willQueue ? "queued" : "running",
    subagentSessionId,
    message: (() => {
      const typeLabel = isSubagent ? "子 Agent" : mode === "tool" ? "纯工具异步" : "后台 LLM";
      return willQueue
        ? `已排队${typeLabel}任务「${taskLabel}」（并发槽位已满）。`
        : `已启动${typeLabel}任务「${taskLabel}」。${isSubagent ? "可进入任务会话查看进度。" : "你可以继续对话；完成后结果会进入发送队列最前。"}`;
    })(),
  };
}

/** 轻量异步睡眠：不跑 LLM；到时间后结果强制走 notifyAsyncDelivery 唯一投递闸（v7 通道收敛）。 */
export async function startAsyncSleepTask(options: {
  sessionId: string;
  seconds: number;
  config: AppConfig;
  services: ServiceContainer;
  agentSnapshot: AsyncTaskInput["agentSnapshot"];
}): Promise<{ jobId: string; status: "queued" | "running"; message: string }> {
  const seconds = Math.max(0, Math.min(options.seconds, 300));
  const ms = seconds * 1000;
  const taskLabel = `sleep ${seconds}s`;
  const input: AsyncTaskInput = {
    kind: ASYNC_KIND,
    sessionId: options.sessionId,
    task: `等待 ${seconds} 秒后返回`,
    taskLabel,
    agentSnapshot: options.agentSnapshot,
    sourceType: "sleep",
  };

  const created = await options.services.task.create({
    name: `[async] ${taskLabel}`,
    type: "async_agent",
    status: "queued",
    sessionId: options.sessionId,
    queuedAt: new Date(),
    input,
  } as any);
  if (!created.success || !created.data) {
    throw new Error(created.error?.message ?? "创建异步定时器任务失败");
  }
  const jobId = (created.data as { id: string }).id;
  const orchestrator = getAsyncJobOrchestrator(options.config);
  try {
    orchestrator.enqueue({
      jobId,
      sessionId: options.sessionId,
      timeoutMs: ms + 10_000,
      // sleep 不占全局 LLM 槽：避免「等 10 秒」堵住 spawn_subagent / 后台推理
      slotClass: "lightweight",
      execute: async (signal) => {
        try {
          await options.services.task.update({ id: jobId, status: "running", startedAt: new Date() } as any);
        } catch (err) {
          console.warn(`[asyncJob] sleep 任务标 running 失败 jobId=${jobId}`, err);
        }
        const { aborted } = await waitMs(ms, signal);
        if (aborted || signal.aborted) {
          const abortMsg = messageFromAbortSignal(signal);
          await options.services.task.update({
            id: jobId,
            status: "failed",
            finishedAt: new Date(),
            output: {
              error: abortMsg.includes("用户中断") ? "定时器已取消" : abortMsg,
            } satisfies AsyncTaskOutput,
          } as any).catch(catchUnlessAbort("[asyncJobManager] timer abort task update"));
          // 失败不 notify：右栏可见，对话区不灌错误气泡
          return;
        }
        await options.services.task.update({
          id: jobId,
          status: "success",
          finishedAt: new Date(),
          output: { asyncResult: `定时时间${seconds}s到了，请继续完成任务` } satisfies AsyncTaskOutput,
        } as any);
        await notifyAsyncDelivery(options.sessionId, jobId, "done", taskLabel, options.services, options.config);
      },
    });
  } catch (err) {
    // 入池拒绝（maxQueued 满）：回收 Task 行，错误上抛
    await options.services.task
      .update({
        id: jobId,
        status: "failed",
        finishedAt: new Date(),
        output: { error: err instanceof Error ? err.message : String(err) } satisfies AsyncTaskOutput,
      } as any)
      .catch(catchUnlessAbort("[asyncJobManager] task cleanup update (pool reject)"));
    throw err;
  }
  return {
    jobId,
    status: "running",
    message: `定时器已启动，${seconds} 秒后结果会进入发送队列最前（不占用 LLM 并发槽）。`,
  };
}

/** 向运行中/排队中的异步任务追加一条日志。任务执行过程中工具/Agent 可调用此函数写入进度。 */
export async function appendAsyncJobLog(
  jobId: string,
  entry: Omit<AsyncTaskLogEntry, "timestamp">,
  services: ServiceContainer,
): Promise<void> {
  let task: Awaited<ReturnType<ServiceContainer["task"]["getById"]>> | null = null;
  try {
    task = await services.task.getById(jobId);
  } catch {
    // 任务行已删除（测试清理/手动删除）：进度日志是尽力而为，不得向上抛
    // （getById 对缺失行抛 NOT_FOUND；reactLoop 的 onProgress 不 await，抛了就是 unhandled rejection）
    return;
  }
  if (!task) return;
  const output = parseAsyncOutput(task.output);
  const logs: AsyncTaskLogEntry[] = output.logs ?? [];
  logs.push({ ...entry, timestamp: Date.now() });
  // 保留最近 50 条，避免 output JSON 过大
  const trimmed = logs.length > 50 ? logs.slice(logs.length - 50) : logs;
  await services.task.update({
    id: jobId,
    output: { ...output, logs: trimmed },
  } as any).catch(catchUnlessAbort("[asyncJobManager] appendAsyncJobLog update"));
}
