import { getSwarmBus } from "../../../swarmBus.js";
import type { NativeToolContext } from "../types.js";

export async function agentReportBackTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  // 软限制：有上级即可回报。异步续跑 / 用户在子会话补充后也应能 report_back。
  // 投递目标由 parentSessionId（spawn 绑定）决定，见下方桥接逻辑。
  if (!ctx.agentSnapshot?.parentId) {
    return { error: "当前 Agent 无上级（parentId 为空），无法 report_back。" };
  }
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const content = String(args.content || "");
  const bus = getSwarmBus(ctx.prisma, ctx.services);
  // report_back 本身就是正式向上回报通道，即使在工具轮次中也必须放行。
  // taskRef 不接受 LLM 入参（W16a-3）：桥接找到跟踪 Task 后由服务端强制写 jobId（下方）
  const result = await bus.send(
    {
      fromAgentId: ctx.agentSnapshot.id,
      toAgentId: ctx.agentSnapshot.parentId,
      content,
      messageType: (args.messageType as any) ?? "report",
      source: ctx.agentSnapshot.tier as any,
    },
    ctx.agentSnapshot?.tier ?? "sub",
    ctx.agentSnapshot?.workspaceId ?? null,
    false,
  );
  if (!result.success) {
    return { error: `[${result.error?.code}] ${result.error?.reason}` };
  }

  // 桥接：完成父会话跟踪 Task（spawn 时创建）或新建投递，供 pullAsyncQueue / 异步列表消费
  try {
    let parentSessionId: string | undefined;
    if (ctx.sessionId) {
      const subSession = await ctx.prisma.chatSession.findUnique({
        where: { id: ctx.sessionId },
        select: { parentSessionId: true },
      });
      parentSessionId = subSession?.parentSessionId ?? undefined;
    }

    // 子会话未绑 parentSessionId 时：按「跟踪 Task」反查 spawn 时的父 session（多父会话场景）
    if (!parentSessionId && ctx.prisma) {
      const trackers = await ctx.prisma.task.findMany({
        where: {
          OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }],
          status: { in: ["running", "queued", "success"] },
        },
        orderBy: { createdAt: "desc" },
        take: 40,
      });
      const bySubSession = trackers.find((row) => {
        const input = row.input as { subagentSessionId?: string } | null;
        return !!ctx.sessionId && input?.subagentSessionId === ctx.sessionId;
      });
      if (bySubSession?.sessionId) {
        parentSessionId = bySubSession.sessionId;
      } else {
        const byAgent = trackers.find((row) => {
          const input = row.input as { agentSnapshot?: { id?: string } } | null;
          return input?.agentSnapshot?.id === ctx.agentSnapshot?.id;
        });
        if (byAgent?.sessionId) parentSessionId = byAgent.sessionId;
      }
    }

    // 仍找不到则跳过队列桥接（SwarmBus 消息已发出）；不再回退到父 Agent isMainSession，避免投错会话
    if (!parentSessionId) {
      console.warn(
        `[agent_report_back] 无法解析父 session（子会话 ${ctx.sessionId ?? "?"} 无 parentSessionId 且无跟踪 Task），跳过异步队列投递`,
      );
    }

    if (parentSessionId) {
      const snapshot = ctx.agentSnapshot!;
      let fromName: string | undefined;
      try {
        const me = await ctx.services.agent.getById(snapshot.id);
        fromName = (me as { name?: string })?.name;
      } catch { /* ignore */ }
      const taskLabel = fromName
        ? `子 Agent 回报 · ${fromName}`
        : `子 Agent 回报 · ${snapshot.id.slice(0, 6)}`;

      // 优先完成 spawn 时挂在父会话上的 running 跟踪 Task。
      // 关联键是 subagentSessionId（spawn Phase A 写入 input）——必须按血缘键精确匹配，
      // 不能用「最新 N 条活跃任务」时间窗：高并发 spawn（活跃跟踪任务超过窗口）会把
      // 早完成子 Agent 的跟踪 Task 挤出窗口 → 失配后僵尸 running + 重复投递行（TP-4 压测暴露）。
      let jobId: string | undefined;
      let matched: { id: string; input: unknown } | null = null;
      if (ctx.sessionId) {
        matched = await ctx.prisma.task.findFirst({
          where: {
            sessionId: parentSessionId,
            status: { in: ["running", "queued"] },
            OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }],
            input: { path: "$.subagentSessionId", equals: ctx.sessionId },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, input: true },
        });
      }
      // 零兼容纪律：精确匹配是唯一匹配方式，miss 时**不做**任何模糊兜底（旧「take:20 时间窗 +
      // agentSnapshot.id」语义已删除）——同 Agent 并发任务的跟踪 Task 会被误完成。matched=null
      // 走下方 create 新 success Task 投递结果：不丢、不误投。

      if (matched) {
        await ctx.services.task.update({
          id: matched.id,
          status: "success",
          finishedAt: new Date(),
          output: { asyncResult: content },
        } as any);
        jobId = matched.id;
      } else {
        const created = await ctx.services.task.create({
          name: `[async] ${taskLabel}`,
          type: "async_agent",
          status: "success",
          sessionId: parentSessionId,
          finishedAt: new Date(),
          delivered: false,
          input: {
            kind: "async_agent",
            sessionId: parentSessionId,
            task: content.slice(0, 200),
            taskLabel,
            agentSnapshot: {
              id: snapshot.id,
              model: snapshot.model,
              systemPrompt: "",
              tools: [],
              tier: snapshot.tier,
              parentId: snapshot.parentId,
              workspaceId: snapshot.workspaceId,
              name: fromName,
            },
            subagentSessionId: ctx.sessionId,
            sourceType: "subagent",
          },
          output: { asyncResult: content },
        } as any);
        if (created.success && created.data) {
          jobId = (created.data as { id: string }).id;
        }
      }

      if (jobId) {
        // W14：AgentMessage ↔ 跟踪 Task 关联（taskRef=jobId）。report_back 的消费发生在 Task 管道，
        // 投递记账（delivered/consumed 回写）全靠这个关联按 taskRef 对账；关联失败不阻塞投递。
        if (result.messageId) {
          try {
            await ctx.prisma.agentMessage.update({
              where: { id: result.messageId },
              data: { taskRef: jobId },
            });
          } catch (ledgerErr) {
            console.warn("[agent_report_back] AgentMessage taskRef 关联失败（不阻塞投递）:", ledgerErr);
          }
        }
        const matchedInput = (matched?.input ?? null) as { deliverToQueue?: boolean } | null;
        if (matchedInput?.deliverToQueue === false) {
          // waitForResult（W16a-2）：结果已由 spawn 工具同步返回（tool return 即交付，此刻发生），
          // 消息链路就此终结——直接把旁路邮箱记账 consumed，deliveredAt 如实记为 report_back 时刻。
          // 不终结的话：Task 永不 CLAIM → 回写永不触发 → AgentMessage 永远 pending，
          // 修复脚本 content 匹配永远 MISS 告警不消解，且 pending 计入 SWARM_MAX_QUEUE_SIZE 会堵到 QUEUE_FULL。
          if (result.messageId) {
            try {
              await ctx.prisma.agentMessage.update({
                where: { id: result.messageId },
                data: { status: "consumed", deliveredAt: new Date() },
              });
            } catch (ledgerErr) {
              console.warn("[agent_report_back] waitForResult 消息终结记账失败（不阻塞回报）:", ledgerErr);
            }
          }
        } else {
          // 动态 import：asyncJobManager 经 agentRuntime/agentStream/agentTools 处于 ReAct 环内，静态导入会重建循环依赖
          const { notifyAndAutoConsumeAsyncDelivery } = await import("../../../asyncJobs/index.js");
          await notifyAndAutoConsumeAsyncDelivery({
            sessionId: parentSessionId,
            jobId,
            status: "done",
            taskLabel,
            services: ctx.services,
            config: ctx.config,
          });
        }
      }
    }
  } catch (err) {
    console.warn("[agent_report_back] 桥接父会话异步投递失败:", err);
  }

  return { success: true, message: "已向上级回报。" };
}
