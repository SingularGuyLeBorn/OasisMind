/**
 * 本轮 VisibleSet + 模型实际上下文的只读检查（不改行为）。
 * 派生与 reactLoop 同一套 deriveVisibleSet；路径与 listForLlmContext 同一活跃叶。
 */

import { TRPCError } from "@trpc/server";
import { CHILD_OWN_TOOLS } from "@oasismind/shared";
import type { PrismaClient } from "@prisma/client";
import type { AppConfig } from "./config.js";
import { deriveVisibleSet, type VisibleReason } from "./tools/visibleSet.js";

export type TurnInspectHidden = { name: string; reason: VisibleReason };

export type SessionTurnInspect = {
  sessionId: string;
  activeLeafId: string | null;
  visibleNative: string[];
  hidden: TurnInspectHidden[];
  pathMessageCount: number;
  lastUserPreview: string | null;
  hasRuntimeContext: boolean;
  contextSummaryPreview: string | null;
};

function bare(name: string): string {
  return name.startsWith("native:") ? name.slice("native:".length) : name;
}

export async function inspectSessionTurn(
  prisma: PrismaClient,
  config: AppConfig,
  sessionId: string,
): Promise<SessionTurnInspect> {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, agentId: true, activeLeafId: true, contextSummary: true },
  });
  if (!session) {
    throw new TRPCError({ code: "NOT_FOUND", message: `会话不存在：${sessionId}` });
  }

  const agent = session.agentId
    ? await prisma.agent.findUnique({
        where: { id: session.agentId },
        select: { id: true, tools: true, tier: true, toolInheritMask: true, toolOwn: true },
      })
    : null;

  const visible = agent
    ? deriveVisibleSet({
        agentId: agent.id,
        tier: agent.tier ?? "sub",
        agentTools: Array.isArray(agent.tools) ? (agent.tools as string[]) : [],
        packs: config.packs,
        inheritMask: (agent.toolInheritMask as { allow?: string[]; deny?: string[] } | null) ?? undefined,
        childOwn: Array.isArray(agent.toolOwn)
          ? (agent.toolOwn as string[])
          : agent.tier === "sub"
            ? [...CHILD_OWN_TOOLS]
            : [],
      })
    : {
        native: [] as string[],
        skills: [] as string[],
        mcpServers: [] as string[],
        skillWildcard: false,
        nativeAll: false,
        reasonByName: {} as Record<string, VisibleReason>,
      };

  const visibleBare = new Set(visible.native.map(bare));
  const hidden: TurnInspectHidden[] = [];
  for (const [name, reason] of Object.entries(visible.reasonByName)) {
    if (reason === "own") continue;
    if (visibleBare.has(bare(name))) continue;
    hidden.push({ name: bare(name), reason });
  }
  hidden.sort((a, b) => a.name.localeCompare(b.name));

  const { resolveActivePath, BRANCH_SUMMARY_KIND } = await import("./chatTree.js");
  const all = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    select: { id: true, parentId: true, role: true, content: true, kind: true, createdAt: true },
  });
  const path = resolveActivePath(all, session.activeLeafId).filter((m) => m.kind !== BRANCH_SUMMARY_KIND);
  const lastUser = [...path].reverse().find((m) => m.role === "user");
  const joined = path.map((m) => m.content ?? "").join("\n");

  return {
    sessionId,
    activeLeafId: session.activeLeafId ?? null,
    visibleNative: [...visible.native].sort(),
    hidden,
    pathMessageCount: path.length,
    lastUserPreview: lastUser?.content.replace(/\s+/g, " ").trim().slice(0, 120) || null,
    hasRuntimeContext: joined.includes("om-runtime-context"),
    contextSummaryPreview: session.contextSummary?.replace(/\s+/g, " ").trim().slice(0, 200) || null,
  };
}
