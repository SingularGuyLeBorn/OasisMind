import { checkAgentSendMessagePermission } from "../../../swarmPermissionGuard.js";
import { getStreamHub } from "../../../sessionStreamHub.js";
import { getSwarmBus } from "../../../swarmBus.js";
import { getAgentRunLock } from "../../../agentRunLock.js";
import { isSessionRunningClaimed } from "../../../sessionRunningSignal.js";
import { resolveToolsForAgentTier } from "../../../loop/setup.js";
import { buildSystemPromptSkeleton } from "../../../promptBuilder.js";
import { resolveAgent as defaultResolveAgent } from "../../../agentResolver.js";
import { createTrpcInvoker } from "../../../trpcInvoker.js";
import type { LlmMessage } from "../../../llmClient.js";
import type { NativeToolContext } from "../types.js";

type PrepareAgentRunResult =
  /** 已起流（或 dedup 命中已有答案）：completion 解析为本轮最终 assistant 文本 */
  | { kind: "started"; subagentSessionId: string; completion: Promise<string> }
  /** 子会话忙（或队列有残留）：消息已入服务端持久队列；drainPromise 为 per-session 串行 drain 链 promise
   * （随队列排空解析——FIFO 保证本 item 先于链尾被处理，await 它即等到「本 item 处理完成」，可能多等后排入队项） */
  | { kind: "queued"; subagentSessionId: string; drainPromise: Promise<void> }
  /** 入队被守卫拒绝（QUEUE_FULL / DELEGATION_DEPTH_EXCEEDED 等） */
  | { kind: "failed"; subagentSessionId: string; error: string };

/**
 * 派活准备段：解析 Agent → 主会话 find-or-create → busy 判定 → 入队 或（dedup/写消息/起流）。
 *
 * W-E busy 分支（写 ChatMessage 之前判定）：
 * - hub.isRunning(主会话) → 消息进服务端持久队列（bus.send 写 AgentMessage 走 depth/queue-size
 *   守卫 + sessionQueueItem.create superior 镜像，幂等），注册服务端 drain，子等闲自动处理；
 *   不写 ChatMessage（本轮结束前消息不进子历史）。旧实现是等本轮结束直接返回旧 assistant，
 *   新消息躺在历史里无人处理。
 * - idle 但队列有残留（服务端重启链丢失场景）：新消息同样入队尾，drain 立即触发，FIFO 保序。
 *   已知限制：pending 项跨重启留存，靠下次发送或前端打开会话 drain 兜底
 *   （与 AGENTS.md「运行中任务随重启丢失」一致）。
 * - opts.fromDrain（drain 重入）跳过残留检查：残留项由 drain 循环自身按序处理，
 *   否则「认领队首 → 见残留再入队尾」会活锁。
 */
export async function prepareAgentRun(
  targetAgentId: string,
  input: string,
  ctx: NativeToolContext,
  opts?: { messageType?: "command" | "query" | "report" | "forward"; fromDrain?: boolean },
): Promise<PrepareAgentRunResult> {
  // 锁仅覆盖 prepare 段（会话 find-or-create / busy / dedup / 写消息 / 起流），不盖整轮 run。
  // SWARM_MODE=redis 时走 Redis SET NX，多实例互斥；local 走进程内链。
  return getAgentRunLock().withLock(targetAgentId, async () => {
    let sessionIdForCleanup: string | undefined;
    try {
      // W4：优先用 ctx 注入的 resolveAgent（见 createAgentToolContext），缺省回退到 agentResolver 叶子模块
      const resolveAgent = ctx.resolveAgent ?? defaultResolveAgent;
      const { agent } = await resolveAgent(ctx.services, targetAgentId);
      if (!agent || agent.status === "deleted") throw new Error("目标 Agent 不存在或已删除");

      let mainSession = await ctx.prisma?.chatSession.findFirst({
        where: { agentId: targetAgentId, isMainSession: true, status: { notIn: ["deleted", "archived"] } },
        // 存量若曾双主会话，取最近更新的一条（SessionService 已阻止新建双主）
        orderBy: { updatedAt: "desc" },
      });
      if (!mainSession) {
        const created = await ctx.services.session.create({
          title: `${agent.name} 主会话`,
          model: agent.model,
          systemPrompt: agent.systemPrompt,
          agentId: targetAgentId,
          isMainSession: true,
          kind: "subagent",
          parentSessionId: ctx.sessionId ?? undefined,
          status: "running",
          taskDescription: input.slice(0, 200),
        });
        if (created.success && created.data) {
          mainSession = await ctx.prisma?.chatSession.findUnique({ where: { id: (created.data as { id: string }).id } }) ?? null;
        }
      } else if (mainSession.status === "paused") {
        // SW-L5：用户手动暂停不得翻成 running；只补血缘，消息走入队、不起流
        const patch: Record<string, unknown> = {};
        if (mainSession.kind !== "subagent") patch.kind = "subagent";
        if (ctx.sessionId && mainSession.parentSessionId !== ctx.sessionId) {
          patch.parentSessionId = ctx.sessionId;
        }
        if (Object.keys(patch).length > 0) {
          try {
            await ctx.services.session.update({ id: mainSession.id, ...patch } as any);
            mainSession = { ...mainSession, ...patch } as typeof mainSession;
          } catch {
            /* 补齐失败不阻塞运行 */
          }
        }
      } else {
        // 已有主会话（含 P11 空壳主会话）：刷新血缘 + running，保证 report_back / 队列查询可定位
        const patch: Record<string, unknown> = { status: "running" };
        if (mainSession.kind !== "subagent") patch.kind = "subagent";
        if (ctx.sessionId && mainSession.parentSessionId !== ctx.sessionId) {
          patch.parentSessionId = ctx.sessionId;
        }
        if (Object.keys(patch).length > 0) {
          try {
            await ctx.services.session.update({ id: mainSession.id, ...patch } as any);
            mainSession = { ...mainSession, ...patch } as typeof mainSession;
          } catch {
            /* 补齐失败不阻塞运行 */
          }
        }
      }
      if (!mainSession) throw new Error("无法创建或找到目标 Agent 的主会话");
      sessionIdForCleanup = mainSession.id;

      // 父派子：消息以 `/goal …` 开头则在子会话设立 standing goal，首条改为 kickoff
      let runInput = input;
      {
        const { parseLeadingGoalDirective, setSessionGoal, buildGoalKickoffMessage } =
          await import("../../../goalLoop.js");
        const parsed = parseLeadingGoalDirective(input);
        if (parsed.goalText) {
          try {
            const goal = await setSessionGoal({
              services: ctx.services,
              config: ctx.config,
              sessionId: mainSession.id,
              text: parsed.goalText,
              mode: "goal",
            });
            runInput = buildGoalKickoffMessage(goal);
          } catch (err) {
            console.warn(
              "[prepareAgentRun] /goal 设立失败，按普通任务投递:",
              err instanceof Error ? err.message : err,
            );
            runInput = parsed.message;
          }
        }
      }

      // W-E busy 判定（写 ChatMessage 之前）。hub 缺失时跳过判定，idle 路径在起流前再报错（原语义）
      // SWARM_MODE=redis 时再看跨实例 running 宣称（本进程 hub 看不到他机内存 runs）
      const hub = getStreamHub();
      const sessionPaused = mainSession.status === "paused";
      let shouldQueue = sessionPaused;
      if (!shouldQueue && hub) {
        shouldQueue = hub.isRunning(mainSession.id);
        if (!shouldQueue) {
          shouldQueue = await isSessionRunningClaimed(mainSession.id);
        }
        if (!shouldQueue && !opts?.fromDrain) {
          const residual = (await ctx.services.sessionQueueItem?.listBySession(mainSession.id)) ?? [];
          shouldQueue = residual.length > 0;
        }
      }

      if (shouldQueue && (hub || sessionPaused)) {
        if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
        const bus = getSwarmBus(ctx.prisma, ctx.services);
        // 走 bus.send（depth/queue-size/向上时机守卫）——旧 autoRun 路绕过守卫，此路径顺带补上
        const sent = await bus.send(
          {
            fromAgentId: ctx.agentSnapshot?.id ?? "",
            toAgentId: targetAgentId,
            content: input, // 队列保留原文（含 /goal），drain 时再设立 goal
            messageType: opts?.messageType,
            source: ctx.agentSnapshot?.tier as any,
          },
          ctx.agentSnapshot?.tier ?? "sub",
          ctx.agentSnapshot?.workspaceId ?? null,
          ctx.inToolRound ?? false,
        );
        if (!sent.success || !sent.messageId) {
          return {
            kind: "failed",
            subagentSessionId: mainSession.id,
            error: `[${sent.error?.code ?? "SEND_FAILED"}] ${sent.error?.reason ?? "消息入队失败"}`,
          };
        }
        // 发送方名称（队列项展示用），解析失败不阻塞
        let sourceName: string | undefined;
        if (ctx.agentSnapshot?.id) {
          try {
            const fromAgent = await ctx.services.agent.getById(ctx.agentSnapshot.id);
            sourceName = (fromAgent as { name?: string } | null)?.name;
          } catch { /* ignore */ }
        }
        // superior 镜像入队：同 agentMessageId 幂等不重复；shouldSkipSuperiorMirror 对账逻辑不动
        await ctx.services.sessionQueueItem.create({
          sessionId: mainSession.id,
          kind: "superior",
          content: input,
          source: ctx.agentSnapshot?.id ?? "unknown",
          sourceName,
          agentMessageId: sent.messageId,
        });
        // 服务端 drain：子等闲时按 FIFO 自动处理（复用 per-session 串行链）。
        // 动态 import：asyncJobManager 经 agentRuntime/agentStream/agentTools 处于 ReAct 环内
        if (sessionPaused) {
          return { kind: "queued", subagentSessionId: mainSession.id, drainPromise: Promise.resolve() };
        }
        if (!hub) {
          return { kind: "failed", subagentSessionId: mainSession.id, error: "会话已暂停或缺少流式枢纽，无法自动起流" };
        }
        const { enqueueSuperiorQueueDrain } = await import("../../../asyncJobs/index.js");
        const drainPromise = enqueueSuperiorQueueDrain({
          sessionId: mainSession.id,
          config: ctx.config,
          services: ctx.services,
          runItem: async (item) => {
            const next = await prepareAgentRun(targetAgentId, item.content, ctx, { fromDrain: true });
            if (next.kind === "started") {
              await next.completion;
            } else if (next.kind === "failed") {
              // 守卫拒绝（QUEUE_FULL 等）：不重试，记日志（item 已认领，消息终结于此）
              console.warn(`[agent_send_message] drain 重入被守卫拒绝 target=${targetAgentId}: ${next.error}`);
            }
            // kind=queued：claim 后、start 前会话又被占的极端竞态——内容已重新入队尾，交给链后续迭代
          },
        });
        return { kind: "queued", subagentSessionId: mainSession.id, drainPromise };
      }

      const messageSource = (ctx.agentSnapshot?.tier ?? "super") as "super" | "manager" | "sub" | "user" | "system";
      // SW-L2：只去重数秒内的重复提交，禁止全历史 content 命中（昨天「继续」不能秒回今天）
      const DEDUP_WINDOW_MS = 8_000;
      const dupUser = await ctx.prisma?.chatMessage.findFirst({
        where: {
          sessionId: mainSession.id,
          role: "user",
          content: runInput,
          createdAt: { gte: new Date(Date.now() - DEDUP_WINDOW_MS) },
        },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });
      if (dupUser) {
        const lastAssistant = await ctx.prisma?.chatMessage.findFirst({
          where: {
            sessionId: mainSession.id,
            role: "assistant",
            createdAt: { gte: dupUser.createdAt },
          },
          select: { content: true },
          orderBy: { createdAt: "desc" },
        });
        if (lastAssistant) {
          try {
            await ctx.services.session.update({ id: mainSession.id, status: "completed" } as any);
          } catch { /* ignore */ }
          return {
            kind: "started",
            subagentSessionId: mainSession.id,
            completion: Promise.resolve(lastAssistant.content || "(无文本输出)"),
          };
        }
      } else {
        await ctx.services.message.create({
          sessionId: mainSession.id,
          role: "user",
          content: runInput,
          source: messageSource,
        });
      }

      // 动态 import：agentStream 经 agentRuntime/loop 处于 ReAct 环内，静态导入会重建循环依赖
      const { runAgentLoopStream } = await import("../../../agentStream/index.js");
      if (!hub) {
        throw new Error("流式对话服务未初始化，无法启动子 Agent 流式运行。请重启 OasisMind server 后再派生子 Agent。");
      }

      const tierTools = resolveToolsForAgentTier(agent.tier, agent.tools);
      // 记忆 / tier / 工具引导由 reactLoop 内 contextHooks 在 LLM 调用前注入
      const systemPrompt = buildSystemPromptSkeleton(agent.systemPrompt);
      // 会话 model 优先：spawn_subagent 复用 agentId 时可通过 session.model 覆盖本轮模型
      const runModel = (mainSession.model && String(mainSession.model).trim()) || agent.model;
      const messages: LlmMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: runInput },
      ];
      const invokeTrpc = createTrpcInvoker({ services: ctx.services });
      const agentMeta = {
        id: agent.id,
        name: agent.name,
        model: runModel,
        systemPrompt,
        tools: tierTools,
        tier: agent.tier,
        parentId: agent.parentId,
        workspaceId: agent.workspaceId,
        toolInheritMask: agent.toolInheritMask ?? undefined,
        toolOwn: agent.toolOwn ?? undefined,
      };

      let assistantContent = "(无文本输出)";

      await hub.start(mainSession.id, {
        sessionId: mainSession.id,
        agentId: agent.id,
        message: input,
      }, async (emit, hubSignal) => {
        try {
          const loop = await runAgentLoopStream({
            config: ctx.config,
            services: ctx.services,
            agent: { model: runModel, systemPrompt, tools: tierTools },
            messages,
            llmOptions: {},
            invokeTrpc,
            emit,
            sessionId: mainSession!.id,
            agentMeta,
            signal: hubSignal,
            runOrigin: "parent",
          });

          assistantContent =
            (loop.content && loop.content.trim()) ||
            loop.toolCalls
              .filter((t) => t.kind === "content")
              .map((t) => String(t.result ?? ""))
              .join("\n")
              .trim() ||
            "(无文本输出)";

          // 运行成功：把最终文本落库为 assistant 消息，供 report_back / 同步等待抓取
          await ctx.services.message.create({
            sessionId: mainSession!.id,
            role: "assistant",
            content: assistantContent,
            toolCalls: loop.toolCalls as any,
            tokenUsage: loop.tokenUsage,
            source: "sub",
          });

          // 终态归位只经 Hub.settleSessionDbStatus（done→completed）；禁止此处直写 completed
          emit({
            type: "done",
            sessionId: mainSession!.id,
            agentId: agent.id,
            content: assistantContent,
            toolCalls: loop.toolCalls,
            model: loop.model,
            provider: loop.provider,
            roundsUsed: loop.roundsUsed,
            tokenUsage: loop.tokenUsage,
          });
        } catch (err: unknown) {
          const errorText = err instanceof Error ? err.message : String(err);
          try {
            await ctx.services.message.create({
              sessionId: mainSession!.id,
              role: "assistant",
              content: `任务未能完成：${errorText}`,
              source: "sub",
            });
          } catch { /* ignore */ }
          // 禁止 session.update(failed/completed)：用户软暂停时 Hub 已标 paused，再写 failed 会让 resume 永久不可用；
          // 终态一律交 Hub.settleSessionDbStatus（done→completed / error→paused）
          emit({ type: "error", message: errorText, sessionId: mainSession!.id });
          throw err;
        }
      });

      // 通知前端立刻挂接子会话流（避免切到子页后空白、刷新才出现）
      hub.pushExternalEvent(mainSession.id, {
        type: "session_run_started",
        sessionId: mainSession.id,
        reason: "subagent_start",
      });
      if (ctx.sessionId && ctx.sessionId !== mainSession.id) {
        hub.pushExternalEvent(ctx.sessionId, {
          type: "session_run_started",
          sessionId: mainSession.id,
          reason: "subagent_start",
        });
      }

      // completion 独立成 promise：调用方决定等（waitForRun / drain runItem）或后台跑
      const completion = (async () => {
        await hub.waitFor(mainSession.id);
        return assistantContent;
      })();
      return { kind: "started", subagentSessionId: mainSession.id, completion };
    } catch (err) {
      // S1：运行中的会话状态归 runner 所有——prepare 段失败（busy 分支 DB 异常，或起流
      // TOCTOU 被「已有运行中的 Agent 流」拒绝）不得把健康 running 会话误标 failed；
      // 仅当无活跃流（失败真实发生在起流前）才由 prepare 段兜底标 failed
      if (sessionIdForCleanup) {
        let hasLiveRun = false;
        try {
          hasLiveRun = getStreamHub()?.isRunning(sessionIdForCleanup) ?? false;
        } catch { /* ignore */ }
        if (!hasLiveRun) {
          try {
            await ctx.services.session.update({ id: sessionIdForCleanup, status: "failed" } as any);
          } catch { /* ignore */ }
        }
      }
      throw err;
    }
  });
}

function waitWithSignal<T>(p: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    return Promise.reject(new Error("agent_send_message 等待已取消"));
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new Error("agent_send_message 等待已取消"));
    signal.addEventListener("abort", onAbort, { once: true });
    p.then(
      (v) => {
        signal.removeEventListener("abort", onAbort);
        resolve(v);
      },
      (e) => {
        signal.removeEventListener("abort", onAbort);
        reject(e);
      },
    );
  });
}

export async function agentSendMessageTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const bus = getSwarmBus(ctx.prisma, ctx.services);
  const content = String(args.content || "");
  const autoRun = args.autoRun !== false;
  const waitForRun = args.waitForRun === true;
  const toAgentId = String(args.toAgentId || "");

  // 层级/范围权限硬拦截（#49）
  const toAgent = await ctx.prisma.agent.findUnique({ where: { id: toAgentId } });
  if (!toAgent || toAgent.status === "deleted") {
    return {
      success: false,
      error: `目标 Agent ${toAgentId} 不存在或已删除。`,
      permissionDenied: true,
    };
  }
  const permissionError = await checkAgentSendMessagePermission(ctx.prisma, {
    fromAgentId: ctx.agentSnapshot?.id ?? "",
    fromTier: ctx.agentSnapshot?.tier ?? "sub",
    fromWorkspaceId: ctx.agentSnapshot?.workspaceId,
  }, toAgent);
  if (permissionError) {
    return {
      success: false,
      error: `[${permissionError.code}] ${permissionError.reason}`,
      permissionDenied: true,
    };
  }

  // autoRun：走 prepareAgentRun（busy 判定 → 入队 或 写 ChatMessage + 起流），绝不先写 pending AgentMessage
  // 再直接起流。否则前端 pullAgentMessages → SessionQueueItem → consumeQueue → runStream
  // 会与起流路径各写一条同内容 user 气泡，并可能二次跑 Agent。
  if (autoRun && content.trim()) {
    let prepared: PrepareAgentRunResult;
    try {
      prepared = await prepareAgentRun(toAgentId, content, ctx, { messageType: args.messageType as any });
    } catch (err: unknown) {
      // 准备段失败（会话/StreamHub 不可用、起流竞态等）：runner 已把会话标 failed + 错误气泡，
      // 非阻塞派活语义保持「已派活」返回（spawn_subagent 的 fire-and-forget 依赖此契约）
      console.warn(`[agent_send_message] 自动触发目标 Agent ${toAgentId} 运行失败:`, err);
      if (waitForRun) {
        // S4：同步等待语义必须如实报错——success:true + 空 content 会让 LLM 误以为等待成功、拿到空结果
        return { success: false, error: `派活准备失败：${err instanceof Error ? err.message : String(err)}` };
      }
      return { success: true, message: "已派活并自动运行（子会话可实时查看流式输出）。" };
    }

    // 入队被 depth/queue-size 等守卫拒绝：如实回传，调用方（LLM）需感知并换策略
    if (prepared.kind === "failed") {
      return { success: false, error: prepared.error };
    }

    if (prepared.kind === "queued") {
      if (!waitForRun) {
        return {
          success: true,
          queued: true,
          message: "子 Agent 正在运行，消息已入队，其空闲时自动处理。",
        };
      }
      // waitForRun=true + busy：等该 item 的 drain 完成（链 promise），再读子会话最后 assistant
      await waitWithSignal(prepared.drainPromise, ctx.signal);
      const lastAssistant = await ctx.prisma.chatMessage.findFirst({
        where: { sessionId: prepared.subagentSessionId, role: "assistant" },
        select: { content: true },
        orderBy: { createdAt: "desc" },
      });
      return {
        success: true,
        queued: true,
        message: "子 Agent 正在运行，消息已入队并已在空闲时处理。",
        content: lastAssistant?.content || "(无文本输出)",
        subagentSessionId: prepared.subagentSessionId,
      };
    }

    if (waitForRun) {
      const content = await waitWithSignal(prepared.completion, ctx.signal);
      return {
        success: true,
        message: "已派活并自动运行。",
        content,
        subagentSessionId: prepared.subagentSessionId,
      };
    }
    // 非阻塞：后台跑 StreamHub；失败时 runner 内部会写 failed + 错误气泡
    prepared.completion.catch((err: unknown) => {
      console.warn(`[agent_send_message] 目标 Agent ${toAgentId} 后台运行失败:`, err);
    });
    return { success: true, message: "已派活并自动运行（子会话可实时查看流式输出）。" };
  }

  // 非 autoRun：写入收件箱，由子会话 UI 队列消费后再 runStream
  // taskRef 是对账键，只允许服务端内部赋值（W16a-3），不接受 LLM 入参
  const result = await bus.send(
    {
      fromAgentId: ctx.agentSnapshot?.id ?? "",
      toAgentId,
      content,
      messageType: args.messageType as any,
      source: ctx.agentSnapshot?.tier as any,
    },
    ctx.agentSnapshot?.tier ?? "sub",
    ctx.agentSnapshot?.workspaceId ?? null,
    ctx.inToolRound ?? false,
  );

  return result.success ? { success: true, message: result.message } : { error: `[${result.error?.code}] ${result.error?.reason}` };
}
