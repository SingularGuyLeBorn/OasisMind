import { getStreamHub } from "../../../sessionStreamHub.js";
import { createTrpcInvoker } from "../../../trpcInvoker.js";
import type { AppConfig } from "../../../config.js";
import type { ServiceContainer } from "../../../serviceContainer.js";
import type { NativeToolContext } from "../types.js";
import { prepareAgentRun } from "./sendMessage.js";

/**
 * 为单个会话挂 superior FIFO drain（与 busy 入队 / R-2 重注册同源）。
 * 幂等：重复注册只是链上多一次空转；consume 原子认领保证同一项只被处理一次。
 */
export async function enqueueSuperiorDrainForSession(options: {
  sessionId: string;
  targetAgentId: string;
  config: AppConfig;
  services: ServiceContainer;
}): Promise<void> {
  const { sessionId, targetAgentId, config, services } = options;
  const { enqueueSuperiorQueueDrain } = await import("../../../asyncJobs/index.js");
  return enqueueSuperiorQueueDrain({
    sessionId,
    config,
    services,
    runItem: async (item) => {
      // 重建最小 NativeToolContext：sessionId 留空——不刷新 parentSessionId，
      // 保留原 spawn 的 report_back 路由；发送方 tier 实时解析（仅决定注入消息 source 标识）
      let tier: string | undefined;
      if (item.source) {
        try {
          const fromAgent = await services.agent.getById(item.source);
          tier = (fromAgent as { tier?: string } | null)?.tier;
        } catch {
          /* 解析失败按缺省处理 */
        }
      }
      const drainCtx: NativeToolContext = {
        config,
        services,
        prisma: services.prisma,
        invokeTrpc: createTrpcInvoker({ services }),
        agentSnapshot: { id: item.source ?? "unknown", model: "", systemPrompt: "", tools: [], tier },
        inToolRound: false,
        signal: new AbortController().signal,
      };
      const next = await prepareAgentRun(targetAgentId, item.content, drainCtx, { fromDrain: true });
      if (next.kind === "started") {
        await next.completion;
      } else if (next.kind === "failed") {
        console.warn(
          `[enqueueSuperiorDrainForSession] drain 重入被守卫拒绝 session=${sessionId}: ${next.error}`,
        );
      }
    },
  });
}

/**
 * R-2 启动恢复动作 3：superior 孤儿队列项重注册服务端 drain。
 *
 * 进程内 drain 链随重启丢失，pending 队列项跨重启留存于 SQLite（W-E 已知限制）。
 * 重启首扫为每个有待处理 superior 项的活跃会话重新注册 drain，会话空闲后按 FIFO consume。
 * 跳过 status="paused" 的会话：用户手停的 pending 项原样保留，等用户点 resume 时
 * sessionService.resume 已负责「队首 superior 挂 drain」接管；避免本函数与 prepareAgentRun
 * 在 paused 状态循环入队-consume-重建空转。
 * 返回重注册 drain 的会话数。
 */
export async function requeueOrphanedSuperiorDrains(
  config: AppConfig,
  services: ServiceContainer,
): Promise<number> {
  const hub = getStreamHub();
  if (!hub) return 0;
  // 仅未软认领项：claimedAt 非空交给 releaseStaleClaims 重置后再入本扫描
  const items = await services.prisma.sessionQueueItem.findMany({
    where: { kind: "superior", claimedAt: null },
    select: { sessionId: true },
  });
  const sessionIds = [...new Set(items.map((i) => i.sessionId))];
  if (sessionIds.length === 0) return 0;
  const liveSessions = await services.prisma.chatSession.findMany({
    // paused 跳过：用户手停会话的 pending superior 项由 resume 时 sessionService.resume 挂 drain 接管
    where: { id: { in: sessionIds }, status: { notIn: ["deleted", "archived", "paused"] }, agentId: { not: null } },
    select: { id: true, agentId: true },
  });
  let registered = 0;
  for (const session of liveSessions) {
    enqueueSuperiorDrainForSession({
      sessionId: session.id,
      targetAgentId: session.agentId as string,
      config,
      services,
    }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
    registered++;
  }
  return registered;
}
