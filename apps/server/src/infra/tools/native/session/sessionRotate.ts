import fs from "fs";
import path from "path";
import {
  buildLlmContextSinceCompact,
  estimateChars,
  resolveCompactThresholdForModel,
  runSessionCompact,
} from "../../../autoCompact.js";
import { getStreamHub } from "../../../sessionStreamHub.js";
import { listToolResultIndex, readToolResultMeta } from "../../../toolResultOffload.js";
import type { NativeToolContext, NativeToolHandler } from "../types.js";

async function sessionClearTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (args.confirm !== true) {
    throw new Error("缺少确认：请将 confirm 设为 true 以删除全部 Chat 会话");
  }
  if (!ctx.services?.session?.deleteMany) {
    throw new Error("当前上下文未提供 SessionService，无法执行 session_clear");
  }
  const result = await ctx.services.session.deleteMany();
  return { deletedSessions: result.count };
}

async function sessionCompactTool(_args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.sessionId) throw new Error("session_compact 需要在 Chat 会话中调用（缺少 sessionId）");
  if (!ctx.services?.session || !ctx.services?.message) {
    throw new Error("当前上下文未提供 Session/Message Service，无法执行 session_compact");
  }

  const session = await ctx.services.session.getByIdLite(ctx.sessionId);
  if (!session) throw new Error("当前会话不存在");
  if (session.status === "archived") {
    return { success: false, error: "当前会话已归档，无法压缩。" };
  }

  const result = await runSessionCompact({
    config: ctx.config,
    services: ctx.services,
    sessionId: ctx.sessionId,
    model: session.model || ctx.agentSnapshot?.model || ctx.config.llm.defaultModel,
    systemPrompt: session.systemPrompt || ctx.agentSnapshot?.systemPrompt || "你是 OasisMind 助手。",
    existingSummary: (session as { contextSummary?: string | null }).contextSummary ?? null,
    trigger: "agent",
  });

  if (!result.compacted) {
    return { success: false, message: result.message };
  }

  return {
    success: true,
    message: result.message,
    boundaryMessageId: result.boundaryMessageId,
    messagesSummarized: result.messagesSummarized,
    memoriesFlushed: result.memoriesFlushed,
    generation: result.generation,
  };
}

/**
 * 查看当前会话上下文占用：消息数、估算字符、压缩阈值、占比、是否已压缩。
 * 供 agent 自主判断是否需要 session_compact；只读，无副作用。
 */
async function sessionContextUsageTool(_args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.sessionId) throw new Error("session_context_usage 需要在 Chat 会话中调用（缺少 sessionId）");
  if (!ctx.services?.session || !ctx.services?.message) {
    throw new Error("当前上下文未提供 Session/Message Service，无法查询上下文占用");
  }

  const session = await ctx.services.session.getByIdLite(ctx.sessionId);
  if (!session) throw new Error("当前会话不存在");

  const model = session.model || ctx.agentSnapshot?.model || ctx.config.llm.defaultModel;
  const systemPrompt = session.systemPrompt || ctx.agentSnapshot?.systemPrompt || "你是 OasisMind 助手。";
  const existingSummary = (session as { contextSummary?: string | null }).contextSummary ?? null;
  const existingGeneration = (session as { compactGeneration?: number | null }).compactGeneration ?? 0;
  const compactedAt = (session as { contextCompactedAt?: Date | string | null }).contextCompactedAt ?? null;

  const historyItems = await ctx.services.message.listForLlmContext({
    sessionId: ctx.sessionId,
    since: compactedAt,
    limit: 200,
  });
  const messages = buildLlmContextSinceCompact(systemPrompt, historyItems, {
    modelId: model,
    contextSummary: existingSummary,
    compactGeneration: existingGeneration,
  });

  const charThreshold = resolveCompactThresholdForModel(ctx.config, model);
  const estimatedChars = estimateChars(messages);
  // 粗估 token：中文约 1.5 字符/token，英文约 4 字符/token，取 2.5 折中
  const estimatedTokens = Math.round(estimatedChars / 2.5);
  const ratio = charThreshold > 0 ? Math.min(1, estimatedChars / charThreshold) : 0;
  const thresholdTokens = charThreshold > 0 ? Math.round(charThreshold / 2.5) : 0;

  // 统计原文消息数（不含 system / 注入摘要 pair）
  const originalMessageCount = historyItems.length;

  return {
    sessionId: ctx.sessionId,
    model,
    messageCount: originalMessageCount,
    estimatedChars,
    estimatedTokens,
    charThreshold,
    thresholdTokens,
    ratio: Math.round(ratio * 100) / 100,
    ratioPercent: Math.round(ratio * 100),
    hasSummary: !!existingSummary,
    compactGeneration: existingGeneration,
    hint:
      ratio >= 0.8
        ? "上下文已占用 " + Math.round(ratio * 100) + "%，建议调用 session_compact 压缩，或 session_rotate 换干净会话。"
        : ratio >= 0.6
          ? "上下文占用 " + Math.round(ratio * 100) + "%，暂无需压缩；继续观察。"
          : "上下文占用 " + Math.round(ratio * 100) + "%，充裕。",
  };
}

function clipExcerpt(text: string, maxChars: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars)}…`;
}

/**
 * 本会话消息检索：压缩后模型视野外的原文仍在 ChatMessage，用本工具按需召回。
 * 优先 FTS（entity=message）再按 sessionId 过滤；无命中回退 LIKE。
 */
async function sessionSearchTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.sessionId) throw new Error("session_search 需要在 Chat 会话中调用（缺少 sessionId）");
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const keyword = String(args.keyword ?? "").trim();
  if (!keyword) {
    throw new Error(
      "参数 keyword 无效：必填且去掉空白后不能为空。请传入要在本会话消息里搜索的关键词（中英文均可）。",
    );
  }
  const limit = Math.min(Math.max(Number(args.limit ?? 8) || 8, 1), 30);
  const maxChars = Math.min(Math.max(Number(args.maxChars ?? 600) || 600, 120), 4000);
  const onlyOutsidePrompt = args.onlyOutsidePrompt === true || args.onlyOutsidePrompt === "true";

  const session = await ctx.prisma.chatSession.findUnique({
    where: { id: ctx.sessionId },
    select: {
      contextCompactedAt: true,
      contextSummary: true,
      compactGeneration: true,
    },
  });
  const compactedAt = session?.contextCompactedAt ? new Date(session.contextCompactedAt) : null;

  let orderedIds: string[] = [];
  try {
    const { searchFtsByEntity } = await import("../../../ftsIndex.js");
    const hits = await searchFtsByEntity(ctx.prisma, "message", keyword, 300);
    orderedIds = hits.map((h) => h.entityId).filter(Boolean);
  } catch {
    /* FTS 不可用则走 LIKE */
  }

  type Row = {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  };
  let rows: Row[] = [];

  if (orderedIds.length > 0) {
    const found = await ctx.prisma.chatMessage.findMany({
      where: {
        sessionId: ctx.sessionId,
        id: { in: orderedIds },
        role: { in: ["user", "assistant"] },
      },
      select: { id: true, role: true, content: true, createdAt: true },
    });
    const byId = new Map(found.map((r) => [r.id, r]));
    rows = orderedIds.map((id) => byId.get(id)).filter((r): r is Row => Boolean(r));
  }

  if (rows.length === 0) {
    rows = await ctx.prisma.chatMessage.findMany({
      where: {
        sessionId: ctx.sessionId,
        role: { in: ["user", "assistant"] },
        content: { contains: keyword },
      },
      orderBy: { createdAt: "desc" },
      take: limit * 3,
      select: { id: true, role: true, content: true, createdAt: true },
    });
  }

  const mapped = rows.map((r) => {
    const inLlmContext = !compactedAt || r.createdAt >= compactedAt;
    return {
      id: r.id,
      role: r.role,
      createdAt: r.createdAt.toISOString(),
      inLlmContext,
      excerpt: clipExcerpt(r.content, maxChars),
    };
  });

  const filtered = onlyOutsidePrompt ? mapped.filter((m) => !m.inLlmContext) : mapped;
  const items = filtered.slice(0, limit);

  return {
    sessionId: ctx.sessionId,
    keyword,
    totalMatched: filtered.length,
    hasCompactSummary: Boolean(session?.contextSummary),
    compactGeneration: session?.compactGeneration ?? 0,
    items,
    hint:
      items.some((i) => !i.inLlmContext)
        ? "含 inLlmContext=false 的命中：已被压缩挤出模型视野，但原文仍在库；需要全文用 session_message_get(messageId)。"
        : items.length
          ? "命中均仍在当前模型视野内（或尚未压缩）。"
          : "无命中。可换关键词，或 session_message_get(beforeCompact=true) 浏览压缩前片段。",
  };
}

/** 按 id 取单条，或拉取压缩边界前/后的若干条原文（按需召回，不整段塞回 prompt）。 */
async function sessionMessageGetTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.sessionId) throw new Error("session_message_get 需要在 Chat 会话中调用（缺少 sessionId）");
  if (!ctx.prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");

  const messageId = typeof args.messageId === "string" ? args.messageId.trim() : "";
  const beforeCompact = args.beforeCompact === true || args.beforeCompact === "true";
  const limit = Math.min(Math.max(Number(args.limit ?? 5) || 5, 1), 20);
  const maxChars = Math.min(Math.max(Number(args.maxChars ?? 4000) || 4000, 200), 16000);

  const session = await ctx.prisma.chatSession.findUnique({
    where: { id: ctx.sessionId },
    select: { contextCompactedAt: true },
  });
  const compactedAt = session?.contextCompactedAt ? new Date(session.contextCompactedAt) : null;

  if (messageId) {
    const row = await ctx.prisma.chatMessage.findFirst({
      where: { id: messageId, sessionId: ctx.sessionId },
      select: { id: true, role: true, content: true, createdAt: true, toolCalls: true, toolResults: true },
    });
    if (!row) throw new Error(`消息不存在或不属于本会话: ${messageId}`);
    const inLlmContext = !compactedAt || row.createdAt >= compactedAt;
    return {
      sessionId: ctx.sessionId,
      item: {
        id: row.id,
        role: row.role,
        createdAt: row.createdAt.toISOString(),
        inLlmContext,
        content: clipExcerpt(row.content, maxChars),
        contentChars: row.content.length,
        truncated: row.content.length > maxChars,
        hasToolCalls: Boolean(row.toolCalls),
      },
      hint: inLlmContext
        ? "该消息仍在模型视野内；一般无需再 get。"
        : "该消息在压缩边界之外；此处按需召回片段，勿整段复读进回复。",
    };
  }

  if (beforeCompact) {
    if (!compactedAt) {
      return {
        sessionId: ctx.sessionId,
        items: [],
        hint: "当前会话尚未压缩，无「压缩前」分区；请用 session_search 或省略 beforeCompact。",
      };
    }
    const rows = await ctx.prisma.chatMessage.findMany({
      where: {
        sessionId: ctx.sessionId,
        role: { in: ["user", "assistant"] },
        createdAt: { lt: compactedAt },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, role: true, content: true, createdAt: true },
    });
    return {
      sessionId: ctx.sessionId,
      compactedAt: compactedAt.toISOString(),
      items: rows.map((r) => ({
        id: r.id,
        role: r.role,
        createdAt: r.createdAt.toISOString(),
        inLlmContext: false,
        content: clipExcerpt(r.content, maxChars),
        contentChars: r.content.length,
        truncated: r.content.length > maxChars,
      })),
      hint: "以上为压缩边界之前的最近若干条（新→旧）。需要某条全文再 session_message_get(messageId)。",
    };
  }

  throw new Error(
    "参数不足：查单条消息时传 messageId（会话内消息 id）；" +
      "浏览压缩前最近消息时不要传 messageId，改为 beforeCompact=true。" +
      "两者用途不同，请按你的意图只选一种调用方式。",
  );
}

/** 列出本会话落盘工具结果瘦索引（不含正文）。 */
async function toolResultsListTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.sessionId) throw new Error("tool_results_list 需要在 Chat 会话中调用（缺少 sessionId）");

  const keyword = typeof args.keyword === "string" ? args.keyword.trim().toLowerCase() : "";
  const toolName = typeof args.toolName === "string" ? args.toolName.trim() : "";
  const limit = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 50);

  let items = listToolResultIndex(ctx.config, ctx.sessionId);
  if (toolName) items = items.filter((i) => i.toolName === toolName);
  if (keyword) {
    items = items.filter((i) => {
      const hay = [
        i.toolName,
        i.title ?? "",
        i.contentType,
        ...i.keywords,
        ...i.topics,
        ...i.entities,
      ]
        .join("\n")
        .toLowerCase();
      return hay.includes(keyword);
    });
  }
  const total = items.length;
  // 新→旧
  const page = items.slice().reverse().slice(0, limit);
  return {
    sessionId: ctx.sessionId,
    total,
    returned: page.length,
    items: page,
    hint:
      page.length === 0
        ? "本会话尚无落盘工具结果，或过滤条件过严。工具执行后会自动写入 data/tool-results/{session}/。"
        : "以上为索引卡（无正文）。深挖用 tool_result_meta(metaPath) 或 read_file(path, offset, maxChars)。",
  };
}

/** 读取某次工具结果的厚 metadata（不含正文）。 */
async function toolResultMetaTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  let metaPath = typeof args.metaPath === "string" ? args.metaPath.trim().replace(/\\/g, "/") : "";
  const resultPath = typeof args.path === "string" ? args.path.trim().replace(/\\/g, "/") : "";
  if (!metaPath && resultPath) {
    metaPath = /\.meta\.json$/i.test(resultPath)
      ? resultPath
      : resultPath.replace(/\.json$/i, ".meta.json");
  }
  if (!metaPath) {
    throw new Error(
      "参数不足：优先传 metaPath（工具结果的 .meta.json 路径）。" +
        "若只有正文 path，请传 path=.../xxx.json，服务端会改写成对应的 .meta.json。" +
        "当前 metaPath 与 path 都未提供。",
    );
  }

  const metadata = readToolResultMeta(ctx.config, metaPath);
  if (!metadata) throw new Error(`meta 不存在或无法解析: ${metaPath}`);
  return {
    metaPath,
    metadata,
    hint: "不含正文。按 metadata.recommendedRead / hitOffsets 用 read_file 分段取原文。",
  };
}

/**
 * 归档当前会话并开启同 Agent 新会话；总结写入 data/sessions/ 与新会话首条消息。
 * 双向血缘：旧.rotatedToSessionId ↔ 新.rotatedFromSessionId。
 * 聚焦仅为请求：SSE focusNewSession=true 时，前端仅当用户正看旧会话才自动跳转。
 */
async function sessionRotateTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const summary = String(args.summary ?? "").trim();
  if (!summary) throw new Error("session_rotate 需要非空的 summary");
  if (!ctx.sessionId) throw new Error("session_rotate 需要在 Chat 会话中调用（缺少 sessionId）");
  if (!ctx.services?.session || !ctx.services?.message) {
    throw new Error("当前上下文未提供 Session/Message Service，无法执行 session_rotate");
  }

  const oldSession = await ctx.services.session.getByIdLite(ctx.sessionId);
  if (!oldSession) throw new Error("当前会话不存在");
  if (oldSession.status === "archived") {
    return {
      success: false,
      error: "当前会话已归档，请勿重复调用 session_rotate。",
      oldSessionId: oldSession.id,
      newSessionId: oldSession.rotatedToSessionId ?? undefined,
    };
  }
  if (oldSession.kind === "subagent") {
    throw new Error("子 Agent 任务会话不支持 session_rotate；请在主对话会话中轮换。");
  }

  const agentId = oldSession.agentId ?? ctx.agentSnapshot?.id ?? null;
  if (!agentId) throw new Error("无法确定 Agent，无法创建新会话");

  const reason = args.reason ? String(args.reason).trim() : undefined;
  const carryMemoryIds = Array.isArray(args.carryMemoryIds)
    ? (args.carryMemoryIds as unknown[]).map((id) => String(id)).filter(Boolean)
    : [];

  const oldTitle = String(oldSession.title || "对话").slice(0, 40);
  const newTitle =
    (args.title ? String(args.title).trim() : "") ||
    `${oldTitle} · 续`.slice(0, 60);

  // 先把摘要写入本地文件，作为未来恢复与审计的事实源（运行时产物，落 data/sessions/）
  const sessionsDir = ctx.config.dataPaths.sessions;
  fs.mkdirSync(sessionsDir, { recursive: true });
  const summaryFileName = `${oldSession.id}-summary.md`;
  const summaryPath = path.join(sessionsDir, summaryFileName);
  const summaryDoc = [
    "---",
    `title: "${newTitle} 会话摘要"`,
    `oldSessionId: "${oldSession.id}"`,
    `agentId: "${agentId}"`,
    `reason: "${(reason ?? "session_rotate").replace(/"/g, "'")}"`,
    `rotatedAt: "${new Date().toISOString()}"`,
    "---",
    "",
    summary,
    "",
  ].join("\n");
  fs.writeFileSync(summaryPath, summaryDoc, "utf8");
  const relativeSummaryPath = path
    .relative(ctx.config.projectRoot, summaryPath)
    .split(path.sep)
    .join("/");

  const firstMessageOverride = args.firstMessage ? String(args.firstMessage).trim() : "";
  const focusNewSession = args.focusNewSession === true;
  const rotateMode = firstMessageOverride ? "firstMessage" : "summary";

  // 创建新会话并写入反向血缘（rotatedFrom ↔ 随后旧会话的 rotatedTo）
  const created = await ctx.services.session.create({
    title: newTitle,
    model: oldSession.model || ctx.config.llm.defaultModel,
    systemPrompt: oldSession.systemPrompt ?? undefined,
    agentId,
    kind: "chat" as const,
    status: "active" as const,
    rotatedFromSessionId: oldSession.id,
  } as any);
  if (!created.success || !created.data) {
    throw new Error(created.error?.message ?? "创建新会话失败");
  }
  const newSession = created.data as { id: string; title: string };

  // 首条消息：firstMessage 优先（右侧 user）；否则 summary 作 system 注入
  if (firstMessageOverride) {
    await ctx.services.message.create({
      sessionId: newSession.id,
      role: "user",
      content: firstMessageOverride,
      source: "user",
    } as any);
  } else {
    let firstMessage = `【上一会话摘要】\n\n${summary}`;
    if (carryMemoryIds.length > 0) {
      firstMessage += `\n\n【需继续参考的 Memory】\n${carryMemoryIds.map((id) => `- ${id}`).join("\n")}`;
    }
    if (reason) {
      firstMessage += `\n\n（轮换原因：${reason}）`;
    }
    await ctx.services.message.create({
      sessionId: newSession.id,
      role: "user",
      content: firstMessage,
      source: "system",
    } as any);
  }

  // 归档旧会话并写 rotatedTo（正向血缘）
  await ctx.services.session.update({
    id: oldSession.id,
    status: "archived",
    contextSummary: summary.slice(0, 20000),
    contextCompactedAt: new Date(),
    rotatedToSessionId: newSession.id,
  } as any);

  try {
    const hub = getStreamHub();
    hub?.pushExternalEvent(oldSession.id, {
      type: "session_rotated",
      oldSessionId: oldSession.id,
      newSessionId: newSession.id,
      newTitle: newSession.title || newTitle,
      reason,
      focusNewSession,
      agentId,
      mode: rotateMode,
    });
  } catch (err) {
    console.warn("[session_rotate] SSE 推送失败:", err);
  }

  await ctx.services.log?.create?.({
    level: "info",
    component: "session",
    event: "session_rotated",
    message: `会话 ${oldSession.id} → ${newSession.id}`,
    metadata: {
      oldSessionId: oldSession.id,
      newSessionId: newSession.id,
      reason,
      summaryPath: relativeSummaryPath,
      agentId,
      mode: rotateMode,
      focusNewSession,
    },
  }).catch((err: unknown) => {
    console.warn("[session] session_rotate 审计日志失败:", err instanceof Error ? err.message : err);
  });

  return {
    success: true,
    oldSessionId: oldSession.id,
    newSessionId: newSession.id,
    newTitle: newSession.title || newTitle,
    summaryPath: relativeSummaryPath,
    focusNewSession,
    focusRequested: focusNewSession,
    mode: rotateMode,
    firstMessageUsed: !!firstMessageOverride,
    message: focusNewSession
      ? "已归档并创建新会话，已请求前端聚焦（仅当用户正查看本会话时才会自动跳转；否则仅提示手动跳转）。"
      : "已归档当前会话并创建新会话。请告知用户可点击提示跳转；不要假设页面已自动切换。",
  };
}

export const sessionRotateHandlers: Record<string, NativeToolHandler> = {
  session_clear: sessionClearTool,
  session_rotate: sessionRotateTool,
  session_compact: sessionCompactTool,
  session_context_usage: sessionContextUsageTool,
  session_search: sessionSearchTool,
  session_message_get: sessionMessageGetTool,
  tool_results_list: toolResultsListTool,
  tool_result_meta: toolResultMetaTool,
};
