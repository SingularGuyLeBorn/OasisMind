/**
 * ChannelBinding — (channel, peerId[, chatId]) ↔ ChatSession 映射。
 * 本地优先：绑定存 SQLite；kind=channel 会话（不占主会话）。
 *
 * 键规则：
 * - 私聊：peerId=用户 openid，chatId="" → 一人一 session
 * - 群聊：peerId=CHANNEL_GROUP_PEER，chatId=群 openid → **全群共享一个 session**
 *   （说话人身份写进消息正文，见 messageGateway；回发仍用入站 envelope 的真实 peerId/chatId）
 */

/** 群聊绑定用的占位 peerId（真实说话人 openid 不进绑定键） */
export const CHANNEL_GROUP_PEER = "__group__";

/**
 * 将入站 envelope 归一成 ChannelBinding 唯一键。
 * 群聊强制共享 peerId，避免「同群不同人各开一 session」。
 */
export function resolveChannelBindingKeys(input: {
  peerId: string;
  chatId?: string | null;
}): { peerId: string; chatId: string; speakerPeerId: string; isGroup: boolean } {
  const speakerPeerId = input.peerId.trim();
  const groupId = input.chatId?.trim() || "";
  if (groupId) {
    return {
      peerId: CHANNEL_GROUP_PEER,
      chatId: groupId,
      speakerPeerId,
      isGroup: true,
    };
  }
  return { peerId: speakerPeerId, chatId: "", speakerPeerId, isGroup: false };
}

import type { PrismaClient } from "@prisma/client";
import type { AppConfig } from "./config.js";
import type { ServiceContainer } from "./serviceContainer.js";
import type { ImChannel } from "./messageGateway.js";
import { DEFAULT_LLM_MODEL, TIER_DEFAULT_TOOLS } from "@knowpilot/shared";
import { notifyAgentUi } from "./uiStateNotify.js";

const DAILY_FRAGMENTS_SOURCE = "onebot-daily-fragments";
const DAILY_FRAGMENTS_AGENT_NAME = "每日碎片整理员";
const DAILY_FRAGMENTS_WS_NAME = "每日碎片";
const DAILY_FRAGMENTS_WS_PATH = "workspaces/daily-fragments";

let dailyFragmentsAgentCache: { id: string; model: string } | null = null;

async function resolveDailyFragmentsAgent(
  prisma: PrismaClient,
  services: ServiceContainer,
  config: AppConfig,
): Promise<{ id: string; model: string } | null> {
  if (dailyFragmentsAgentCache) return dailyFragmentsAgentCache;

  const existing = await prisma.agent.findFirst({
    where: {
      status: { not: "deleted" },
      OR: [
        { source: DAILY_FRAGMENTS_SOURCE },
        { name: DAILY_FRAGMENTS_AGENT_NAME },
      ],
    },
    select: { id: true, model: true, workspaceId: true },
  });
  if (existing) {
    dailyFragmentsAgentCache = { id: existing.id, model: existing.model || DEFAULT_LLM_MODEL };
    return dailyFragmentsAgentCache;
  }

  try {
    const wsResult = await services.workspace.create({
      name: DAILY_FRAGMENTS_WS_NAME,
      description: "整理每日碎片思考、灵感、待办与随心笔记",
      path: DAILY_FRAGMENTS_WS_PATH,
      autoCreateManager: false,
    });
    if (!wsResult.success || !wsResult.data) {
      console.warn(`[channelBinding] 创建 ${DAILY_FRAGMENTS_WS_NAME} Workspace 失败:`, wsResult.error?.message ?? "未知");
      return null;
    }
    const wsId = (wsResult.data as { id: string }).id;

    const agentResult = await services.agent.create({
      name: DAILY_FRAGMENTS_AGENT_NAME,
      description: `${DAILY_FRAGMENTS_WS_NAME} Workspace 的管理 Agent，负责整理用户的每日碎片思考`,
      model: config.llm.defaultModel ?? DEFAULT_LLM_MODEL,
      systemPrompt: `你是「${DAILY_FRAGMENTS_WS_NAME}」Workspace 的管理 Agent，专注整理用户的每日碎片思考、灵感、待办与随心笔记。

OasisMind 是「以 Markdown 为原子、AI 为引擎的数字花园」。你是这座花园里「每日碎片」区块的园丁长：负责把用户通过 QQ 随手丢进来的想法分类、提炼、归档，并适时生成可回顾的笔记或任务。

你的职责：
- 倾听用户的碎片化表达（一句话、一个灵感、一段情绪、一个待办）
- 用 memory_create 把值得保留的点记录到本 Workspace 记忆
- 用 memory_search 检索相关历史碎片，帮助用户发现关联
- 必要时用 skill_* 或 post_create 生成整理后的文章/笔记
- 如需本地脚本/批量处理/调用本地命令，使用 \`run_shell\`
- 对模糊的内容，用 ask_user 在 QQ 回问确认（channel=onebot）
- 向上级（超级 Agent）汇报本空间整体状态

行为准则：
- 不越界：不创建/归档 Workspace，不创建子 Agent（除非被用户明确请求）
- 本地优先：整理后的内容优先落库/落文件，不依赖外部 SaaS
- 隐私敏感：本空间内容仅供用户本人回顾，不主动外传
- 子 Agent 隔离铁律：结果经 report_back，不看子会话消息内容`,
      tools: [...TIER_DEFAULT_TOOLS.manager, "native:run_shell"],
      tier: "manager",
      workspaceId: wsId,
      source: DAILY_FRAGMENTS_SOURCE,
    });
    if (!agentResult.success || !agentResult.data) {
      console.warn(`[channelBinding] 创建 ${DAILY_FRAGMENTS_AGENT_NAME} 失败:`, agentResult.error?.message ?? "未知");
      return null;
    }
    const agentId = (agentResult.data as { id: string }).id;
    dailyFragmentsAgentCache = { id: agentId, model: (agentResult.data as { model?: string }).model || DEFAULT_LLM_MODEL };
    console.log(`[channelBinding] 已创建 ${DAILY_FRAGMENTS_WS_NAME} Workspace + ${DAILY_FRAGMENTS_AGENT_NAME} (${agentId})`);
    return dailyFragmentsAgentCache;
  } catch (err) {
    console.warn(`[channelBinding] 创建每日碎片专属 Agent 失败:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** 测试隔离：清空每日碎片 Agent 缓存 */
export function __resetDailyFragmentsAgentCache(): void {
  dailyFragmentsAgentCache = null;
}

export type ChannelBindingRow = {
  id: string;
  channel: string;
  peerId: string;
  chatId: string | null;
  sessionId: string;
  agentId: string;
  /** listBindings 联表；创建路径可不填 */
  agentName?: string | null;
  agentSourceSlug?: string | null;
  workspaceId?: string | null;
  workspaceName?: string | null;
  /** ChatSession.autoName 优先，否则 title / 绑定 title */
  sessionTitle?: string | null;
  sessionKind?: string | null;
  sessionStatus?: string | null;
  title: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

async function resolveDefaultAgentId(prisma: PrismaClient): Promise<{ id: string; model: string }> {
  const qqBot = await prisma.agent.findFirst({
    where: {
      status: { not: "deleted" },
      OR: [{ sourceSlug: "qq-bot" }, { name: { contains: "QQ" } }],
    },
    select: { id: true, model: true },
  });
  if (qqBot) return { id: qqBot.id, model: qqBot.model || DEFAULT_LLM_MODEL };

  const assistant = await prisma.agent.findFirst({
    where: {
      status: { not: "deleted" },
      OR: [{ sourceSlug: "assistant" }, { name: "assistant" }],
    },
    select: { id: true, model: true },
  });
  if (assistant) return { id: assistant.id, model: assistant.model || DEFAULT_LLM_MODEL };
  const any = await prisma.agent.findFirst({
    where: { status: { not: "deleted" }, tier: { in: ["manager", "super"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, model: true },
  });
  if (!any) throw new Error("无可用 Agent：请先创建 assistant 或超级 Agent");
  return { id: any.id, model: any.model || DEFAULT_LLM_MODEL };
}

export async function resolveOrCreateChannelBinding(
  prisma: PrismaClient,
  _services: ServiceContainer,
  config: AppConfig,
  input: {
    channel: ImChannel;
    /** 说话人 openid；群聊时仅作 speaker 身份，绑定键见 resolveChannelBindingKeys */
    peerId: string;
    chatId?: string | null;
    agentId?: string;
    /** 若传入，强制用此 chatId 作绑定 key（即创建新 Session），忽略现有绑定 */
    forceChatId?: string;
  },
): Promise<ChannelBindingRow> {
  if (!input.peerId.trim()) {
    throw new Error("channelBinding: peerId 不能为空（私聊按用户隔离；群聊按群共享）");
  }
  // 分组键只看入站 chatId（群 openid），绝不能把 /new 的 forceChatId 当成群号
  const keys = resolveChannelBindingKeys({
    peerId: input.peerId,
    chatId: input.chatId,
  });
  const peerId = keys.peerId;
  // /new：新建绑定行；随后 setDefaultChannelSession 把「默认键」指到新 session
  const chatId = input.forceChatId?.trim()
    ? keys.isGroup
      ? `${keys.chatId}::${input.forceChatId.trim()}`
      : input.forceChatId.trim()
    : keys.chatId;

  const existing = !input.forceChatId
    ? await prisma.channelBinding.findUnique({
        where: {
          channel_peerId_chatId: {
            channel: input.channel,
            peerId,
            chatId,
          },
        },
      })
    : null; // forceChatId 时跳过查找，直接创建新 Session

  if (existing) {
    await prisma.channelBinding.update({
      where: { id: existing.id },
      data: { lastMessageAt: new Date() },
    });
    return { ...existing, chatId: existing.chatId || null } as ChannelBindingRow;
  }

  // 群聊升级：旧实现按「人×群」各开 session；并入最近活跃的那条，保留历史
  if (keys.isGroup && !input.forceChatId) {
    const legacy = await prisma.channelBinding.findFirst({
      where: { channel: input.channel, chatId: keys.chatId },
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    });
    if (legacy) {
      await prisma.channelBinding.deleteMany({
        where: {
          channel: input.channel,
          chatId: keys.chatId,
          id: { not: legacy.id },
        },
      });
      const migrated = await prisma.channelBinding.update({
        where: { id: legacy.id },
        data: {
          peerId: CHANNEL_GROUP_PEER,
          lastMessageAt: new Date(),
          title: `IM · ${input.channel} · 群:${keys.chatId}`,
        },
      });
      return { ...migrated, chatId: migrated.chatId || null } as ChannelBindingRow;
    }
  }

  let resolved: { id: string; model: string };
  if (input.agentId) {
    const a = await prisma.agent.findUnique({
      where: { id: input.agentId },
      select: { id: true, model: true },
    });
    if (!a) throw new Error(`Agent 不存在: ${input.agentId}`);
    resolved = { id: a.id, model: a.model || DEFAULT_LLM_MODEL };
  } else if (input.channel === "onebot") {
    const dedicated = await resolveDailyFragmentsAgent(prisma, _services, config);
    resolved = dedicated ?? (await resolveDefaultAgentId(prisma));
  } else {
    resolved = await resolveDefaultAgentId(prisma);
  }

  // 侧栏标题：私聊标用户 openid；群聊标群（共享 session，不掺单个说话人）
  const title = keys.isGroup
    ? `IM · ${input.channel} · 群:${keys.chatId}${input.forceChatId ? " · 新话题" : ""}`
    : `IM · ${input.channel} · ${keys.speakerPeerId}`;
  const model = resolved.model || config.llm.defaultModel || DEFAULT_LLM_MODEL;

  // 为 IM 渠道追加纯文本格式约束：QQ 等 IM 不渲染 Markdown，用户可见才透明。
  const agentRow = await prisma.agent.findUnique({
    where: { id: resolved.id },
    select: { systemPrompt: true },
  });
  const basePrompt = agentRow?.systemPrompt?.trim() || "你是 OasisMind 助手。";
  const channelLabel =
    input.channel === "onebot" || input.channel === "qq" ? "QQ" : input.channel;
  const imFormatRule =
    `\n\n## 当前渠道格式约束\n` +
    `当前通过 ${channelLabel} / IM 渠道回复用户。请使用纯文本，不要使用 Markdown 语法（如 ** 加粗、- 列表、## 标题、[文本](链接) 链接标记、\`代码\` 等）。公式也尽量用普通文字描述，保持简洁自然。`;
  const sessionSystemPrompt = `${basePrompt}${imFormatRule}`;

  // 不预填 autoName：留给 agentStream 首条消息触发 autoNameSession（LLM 起题）。
  // 若写成 IM · qq · openid，幂等守卫会永久跳过自动命名。
  const dedicated = await prisma.chatSession.create({
    data: {
      title,
      model,
      systemPrompt: sessionSystemPrompt,
      agentId: resolved.id,
      isMainSession: false,
      status: "active",
      kind: "channel",
    },
  });

  const created = await prisma.channelBinding.create({
    data: {
      channel: input.channel,
      peerId,
      chatId,
      sessionId: dedicated.id,
      agentId: resolved.id,
      title,
      lastMessageAt: new Date(),
    },
  });
  // 新 IM session 首次创建，推侧栏刷新让 web 实时可见
  await notifyAgentUi(prisma, resolved.id, { type: "session_list_changed" });
  return { ...created, chatId: created.chatId || null } as ChannelBindingRow;
}

export async function listChannelBindings(
  prisma: PrismaClient,
  opts?: { channel?: ImChannel; limit?: number },
): Promise<ChannelBindingRow[]> {
  const rows = await prisma.channelBinding.findMany({
    where: opts?.channel ? { channel: opts.channel } : undefined,
    orderBy: { lastMessageAt: "desc" },
    take: opts?.limit ?? 100,
  });
  const agentIds = [...new Set(rows.map((r) => r.agentId).filter(Boolean))];
  const sessionIds = [...new Set(rows.map((r) => r.sessionId).filter(Boolean))];
  const agents =
    agentIds.length === 0
      ? []
      : await prisma.agent.findMany({
          where: { id: { in: agentIds } },
          select: { id: true, name: true, sourceSlug: true, workspaceId: true },
        });
  const sessions =
    sessionIds.length === 0
      ? []
      : await prisma.chatSession.findMany({
          where: { id: { in: sessionIds } },
          select: { id: true, title: true, autoName: true, kind: true, status: true },
        });
  const workspaceIds = [
    ...new Set(agents.map((a) => a.workspaceId).filter((id): id is string => Boolean(id))),
  ];
  const workspaces =
    workspaceIds.length === 0
      ? []
      : await prisma.workspace.findMany({
          where: { id: { in: workspaceIds } },
          select: { id: true, name: true },
        });
  const byId = new Map(agents.map((a) => [a.id, a]));
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const wsById = new Map(workspaces.map((w) => [w.id, w]));
  return rows.map((r) => {
    const agent = byId.get(r.agentId);
    const session = sessionById.get(r.sessionId);
    const workspace = agent?.workspaceId ? wsById.get(agent.workspaceId) : undefined;
    return {
      ...r,
      chatId: r.chatId || null,
      agentName: agent?.name ?? null,
      agentSourceSlug: agent?.sourceSlug ?? null,
      workspaceId: agent?.workspaceId ?? null,
      workspaceName: workspace?.name ?? null,
      sessionTitle: session?.autoName || session?.title || r.title || null,
      sessionKind: session?.kind ?? null,
      sessionStatus: session?.status ?? null,
    } as ChannelBindingRow;
  });
}

export async function setDefaultChannelSession(
  prisma: PrismaClient,
  channel: ImChannel,
  peerId: string,
  chatId: string | null,
  sessionId: string,
  agentId: string,
): Promise<void> {
  const keys = resolveChannelBindingKeys({ peerId, chatId });
  await prisma.channelBinding.upsert({
    where: {
      channel_peerId_chatId: {
        channel,
        peerId: keys.peerId,
        chatId: keys.chatId,
      },
    },
    update: { sessionId, agentId, lastMessageAt: new Date() },
    create: {
      channel,
      peerId: keys.peerId,
      chatId: keys.chatId,
      sessionId,
      agentId,
      title: keys.isGroup
        ? `IM · ${channel} · 群:${keys.chatId}`
        : `IM · ${channel} · ${keys.speakerPeerId}`,
      lastMessageAt: new Date(),
    },
  });
}

export async function findChannelBindingBySessionId(
  prisma: PrismaClient,
  sessionId: string,
): Promise<ChannelBindingRow | null> {
  const row = await prisma.channelBinding.findFirst({
    where: { sessionId },
    orderBy: { lastMessageAt: "desc" },
  });
  return row ? ({ ...row, chatId: row.chatId || null } as ChannelBindingRow) : null;
}

export async function deleteChannelBinding(prisma: PrismaClient, id: string): Promise<boolean> {
  const n = await prisma.channelBinding.deleteMany({ where: { id } });
  return n.count > 0;
}
