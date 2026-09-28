/**
 * Native Swarm 域 — agent_* / workspace_* / skill 进化 / 免费 API Key / 免费模型目录
 *
 * 按工具拆到 inspect / sendMessage / createSub / reportBack / superiorDrain；
 * 本文件聚合 SWARM_DEFS + 注册，并收容 skill / 免费 key / 进化类 handler。
 */
import { optimizeAgentPrompt, generateSkillFromExperience } from "../../../agentEvolution.js";
import { parseSkillUsageStats } from "../../../skillRunner.js";
import { getSkillUsage, latestActivityAt } from "../../../skillUsage.js";
import { parseSkillKind } from "../../../skillPackage.js";
import {
  filterOpenRouterFreeModels,
  getFreellmGatewayRuntime,
  getOpenRouterFreeModelCatalog,
  getOpenRouterFreeSyncedAt,
  loadOpenRouterFreeCatalogFromDisk,
} from "../../../freeLlmRuntime.js";
import { listFreellmChannels } from "../../../freeKeysSync.js";
import { LLM_PROVIDER_DEEPSEEK } from "@oasismind/shared";
import { z } from "zod";
import { zodParams } from "../zodParams.js";
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "../types.js";
import { registerNativeDomain } from "../registerDomain.js";
import { getAppConfig } from "../../../config.js";
import {
  agentCreateTool,
  agentUpdateTool,
  agentDeleteTool,
  agentCreateSubTool,
  workspaceCreateTool,
  workspaceArchiveTool,
} from "./createSub.js";
import {
  agentInspectTool,
  swarmBriefTool,
  swarmExportTraceTool,
  swarmStageWriteTool,
  swarmStageListTool,
  swarmStageReadTool,
} from "./inspect.js";
import { agentSendMessageTool } from "./sendMessage.js";
import { agentReportBackTool } from "./reportBack.js";

// ─── 免费 API Key 工具 ───

async function freeApiKeysListTool(_args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) return { error: "当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。", code: "NEED_CHAT_CONTEXT" };
  const creds = await ctx.prisma.credential.findMany({
    where: { scope: { contains: "llm" } },
    select: { id: true, name: true, type: true, scope: true, lastUsedAt: true, metadata: true },
  });
  // 过滤出免费 key（metadata.source === "free"）
  const freeKeys = creds.filter((c) => {
    try {
      const meta = JSON.parse(c.metadata || "{}");
      return meta.source === "free";
    } catch {
      return false;
    }
  });
  return {
    count: freeKeys.length,
    keys: freeKeys.map((c) => ({
      id: c.id,
      name: c.name,
      lastUsedAt: c.lastUsedAt,
      // 不返回 value（安全）
    })),
  };
}

async function freeApiKeysFetchTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) return { error: "当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。", code: "NEED_CHAT_CONTEXT" };
  const provider = args.provider as string | undefined;
  const where: any = { scope: { contains: "llm" } };
  // 按 lastUsedAt 升序排列，取最久未使用的
  const creds = await ctx.prisma.credential.findMany({
    where,
    orderBy: { lastUsedAt: "asc" },
    take: 20,
  });
  // 过滤免费 key + 可选 provider 匹配
  const freeKeys = creds.filter((c) => {
    try {
      const meta = JSON.parse(c.metadata || "{}");
      if (meta.source !== "free") return false;
      if (provider && meta.provider !== provider) return false;
      return true;
    } catch {
      return false;
    }
  });
  if (freeKeys.length === 0) {
    return { error: "无可用免费 API Key。请先运行 sync-free-keys 同步，或配置 LLM_API_KEY 环境变量。" };
  }
  const picked = freeKeys[0];
  // 标记 lastUsedAt
  await ctx.prisma.credential.update({
    where: { id: picked.id },
    data: { lastUsedAt: new Date() },
  }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  let meta: Record<string, unknown> = {};
  try {
    meta = JSON.parse(picked.metadata || "{}") as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  const metaProvider = typeof meta.provider === "string" ? meta.provider : undefined;
  const metaBaseUrl = typeof meta.baseUrl === "string" ? meta.baseUrl : undefined;
  const metaModel = typeof meta.model === "string" ? meta.model : undefined;

  // P1-05：明文 key 不再返回给 LLM 上下文（防 prompt injection 外泄 + 进 provider 训练候选）。
  // 改为服务端直接注入到运行时 config.llm.providers[provider]，后续 LLM 调用自动使用——
  // Agent 无需拿到明文 key 即可完成调用。
  const targetProvider = metaProvider ?? provider ?? "";
  if (targetProvider) {
    try {
      const cfg = getAppConfig();
      if (cfg.llm.providers[targetProvider]) {
        cfg.llm.providers[targetProvider].apiKey = picked.value;
        if (metaBaseUrl) cfg.llm.providers[targetProvider].baseUrl = metaBaseUrl;
        if (metaModel && !cfg.llm.providers[targetProvider].model) {
          cfg.llm.providers[targetProvider].model = metaModel;
        }
      }
    } catch (cfgErr) {
      console.warn("[free_api_keys_fetch] 注入 config 失败:", cfgErr instanceof Error ? cfgErr.message : cfgErr);
    }
  }

  // 掩码：保留前4后4，中间 ...（仅用于 LLM 确认拿到了哪个 key，不含明文）
  const raw = picked.value ?? "";
  const masked = raw.length > 8 ? `${raw.slice(0, 4)}...${raw.slice(-4)}` : "***";

  return {
    apiKeyMasked: masked,
    credentialId: picked.id,
    name: picked.name,
    baseUrl: metaBaseUrl,
    model: metaModel,
    provider: metaProvider,
    injectedToProvider: targetProvider || null,
    hint: "Key 已由服务端注入到运行时 config，后续 LLM 调用将自动使用；明文不返回给上下文。",
  };
}


async function freeModelsListTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!getOpenRouterFreeModelCatalog()) {
    loadOpenRouterFreeCatalogFromDisk(ctx.config.projectRoot);
  }

  const q = typeof args.q === "string" ? args.q.trim() : undefined;
  const modalityRaw = typeof args.modality === "string" ? args.modality : "all";
  const modality =
    modalityRaw === "text" || modalityRaw === "multimodal" || modalityRaw === "all"
      ? modalityRaw
      : "all";
  const sortRaw = typeof args.sort === "string" ? args.sort : "context_desc";
  const sort =
    sortRaw === "context_asc" || sortRaw === "name" || sortRaw === "context_desc"
      ? sortRaw
      : "context_desc";
  const limit = Math.min(100, Math.max(1, Math.floor(Number(args.limit) || 30)));
  const includeFreellm = args.includeFreellm !== false;

  const all = filterOpenRouterFreeModels({ q: q || undefined, modality, sort });
  const sliced = all.slice(0, limit);
  const items = sliced.map((m) => ({
    id: m.id,
    name: m.name,
    contextLength: m.contextLength,
    modality: m.modality,
    // 截断说明，避免一次把整份目录塞进上下文
    description: m.description ? m.description.slice(0, 240) : undefined,
  }));

  const result: Record<string, unknown> = {
    openRouter: {
      syncedAt: getOpenRouterFreeSyncedAt(),
      hasApiKey: !!ctx.config.llm.providers.openrouter?.apiKey?.trim(),
      totalMatched: all.length,
      returned: items.length,
      truncated: all.length > items.length,
      items,
      hint: "复制模型 id 到 Chat / spawn_subagent.model / compact.summaryModel 即可使用（:free 需 OPENROUTER_API_KEY）",
    },
  };

  if (includeFreellm && ctx.prisma) {
    const channels = await listFreellmChannels(ctx.prisma);
    const runtime = getFreellmGatewayRuntime();
    result.freellm = {
      runtimeModel: runtime?.model ?? null,
      total: channels.length,
      channels: channels.slice(0, limit).map((c) => ({
        model: c.model,
        name: c.name,
        provider: c.provider,
        validated: c.validated,
        isRuntime: c.isRuntime,
        status: c.status,
      })),
    };
  }

  return result;
}

// ─── Hermes 进化：Skill 发现与推广（#45）───

async function skillDiscoverTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) return { error: "当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。", code: "NEED_CHAT_CONTEXT" };
  const minSuccessRate = (args.minSuccessRate as number) ?? 80;
  const minUsageCount = Math.max(1, (args.minUsageCount as number) ?? 1);
  const limit = (args.limit as number) ?? 10;
  const skillsRoot = ctx.config.configPaths.skills;
  const skills = await ctx.prisma.skill.findMany({
    where: { enabled: true },
    select: { id: true, name: true, description: true, icon: true, metaJson: true },
  });
  // 真实用量：.usage.json（view/patch）+ executable metaJson.stats；无统计不进榜
  const candidates = skills
    .map((s) => {
      const kind = parseSkillKind(s.metaJson, "executable");
      if (kind === "reference") return null;
      const side = getSkillUsage(s.name, skillsRoot);
      const execStats = parseSkillUsageStats(s.metaJson);
      const usageCount = Math.max(side?.viewCount ?? 0, side?.patchCount ?? 0, execStats?.usageCount ?? 0);
      if (usageCount < minUsageCount) return null;
      const successRate = execStats?.successRate ?? (usageCount > 0 ? 100 : 0);
      if (successRate < minSuccessRate) return null;
      return {
        ...s,
        kind,
        usageCount,
        successRate,
        lastUsedAt: latestActivityAt(side ?? { state: "active", viewCount: 0, patchCount: 0, createCount: 0 }) || execStats?.lastUsedAt,
      };
    })
    .filter((s): s is NonNullable<typeof s> => !!s)
    .sort((a, b) => b.usageCount - a.usageCount || b.successRate - a.successRate)
    .slice(0, limit);

  return {
    count: candidates.length,
    skills: candidates.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      kind: s.kind,
      usageCount: s.usageCount,
      successRate: s.successRate,
      lastUsedAt: s.lastUsedAt || undefined,
    })),
    hint: "仅含有真实调用/查看统计的已启用 Skill。skill_promote 需审批；主路径是 skill_manage 维护 procedural 包。",
  };
}

async function skillEnableTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const skillId = String(args.skillId || "");
  if (!skillId) return { error: "skill_enable 需要 skillId" };
  const skill = await ctx.services.skill.getById(skillId);
  if (!skill) return { error: `Skill ${skillId} 不存在` };
  if (skill.enabled) {
    return { success: true, alreadyEnabled: true, skillId, name: skill.name, message: `Skill ${skill.name} 已启用。` };
  }
  let meta: Record<string, unknown> = {};
  try {
    meta = JSON.parse(skill.metaJson || "{}") as Record<string, unknown>;
  } catch {
    meta = {};
  }
  meta.draft = false;
  meta.enabledAt = new Date().toISOString();
  meta.enabledByAgentId = ctx.agentSnapshot?.id ?? null;
  const updated = await ctx.services.skill.update({
    id: skillId,
    enabled: true,
    metaJson: JSON.stringify(meta),
  } as never);
  if (!updated.success) {
    return { error: updated.error?.message ?? "启用失败" };
  }
  await ctx.services.log?.create?.({
    level: "info",
    component: "swarm",
    event: "skill_enabled",
    message: `Skill ${skill.name} 已启用（经审批）`,
    metadata: { skillId, skillName: skill.name, operatorAgentId: ctx.agentSnapshot?.id },
  }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  return {
    success: true,
    skillId,
    name: skill.name,
    message: `Skill ${skill.name} 已启用，可被 Agent 调度；跨 Workspace 推广请用 skill_promote（亦需审批）。`,
  };
}

async function skillPromoteTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const evidence = String(args.evidence ?? args.source ?? "").trim();
  if (!evidence) {
    throw new Error("skill_promote 需要 evidence（禁止无证据推广 Skill）");
  }
  const skillId = String(args.skillId || "");
  const targetAgentIds = Array.isArray(args.targetAgentIds) ? (args.targetAgentIds as string[]) : [];
  if (!skillId || targetAgentIds.length === 0) {
    return { error: "skill_promote 需要 skillId 和 targetAgentIds" };
  }
  const skill = await ctx.services.skill.getById(skillId);
  if (!skill) return { error: `Skill ${skillId} 不存在` };
  if (!skill.enabled) {
    return { error: `Skill ${skill.name} 仍是 draft（未启用）。请先 skill_enable 经审批启用后再推广。` };
  }
  const skillToolName = `skill:${skill.name}`;
  let promoted = 0;
  const errors: string[] = [];
  for (const agentId of targetAgentIds) {
    try {
      const agent = await ctx.services.agent.getById(agentId);
      if (!agent) { errors.push(`Agent ${agentId} 不存在`); continue; }
      const currentTools = agent.tools || [];
      if (currentTools.includes(skillToolName)) {
        errors.push(`Agent ${agent.name} 已有 Skill ${skill.name}`);
        continue;
      }
      await ctx.services.agent.update({
        id: agentId,
        tools: [...currentTools, skillToolName],
      } as any);
      promoted++;
    } catch (err) {
      errors.push(`Agent ${agentId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  await ctx.services.log?.create?.({
    level: "info", component: "swarm", event: "skill_promoted",
    message: `Skill ${skill.name} 推广到 ${promoted} 个 Agent`,
    metadata: { skillId, skillName: skill.name, targetAgentIds, promoted, errors, operatorAgentId: ctx.agentSnapshot?.id },
  }).catch((err: unknown) => {
      console.warn("[swarm] best-effort failed:", err instanceof Error ? err.message : err);
    });
  return { success: true, promoted, errors: errors.length > 0 ? errors : undefined, message: `Skill ${skill.name} 已推广到 ${promoted} 个 Agent。` };
}

// ─── Agent 进化高级版 ───

async function optimizeAgentPromptTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) return { error: "当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。", code: "NEED_CHAT_CONTEXT" };
  const result = await optimizeAgentPrompt(
    ctx.prisma,
    ctx.services,
    String(args.agentId || ""),
    ctx.agentSnapshot?.id ?? "",
  );
  return result.success
    ? {
        success: true,
        pendingApproval: true,
        approvalId: result.approvalId,
        proposal: result.proposal,
        message:
          `优化提案已提交人工 review（approvalId=${result.approvalId}）。` +
          `用户在 /approvals 批准后自动生效，不要重复提交；可向用户简述提案要点。`,
      }
    : { error: result.reason ?? "优化失败" };
}

async function generateSkillFromExperienceTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) return { error: "当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。", code: "NEED_CHAT_CONTEXT" };
  const result = await generateSkillFromExperience(
    ctx.prisma,
    ctx.services,
    String(args.agentId || ""),
    String(args.skillName || ""),
    String(args.skillDescription || ""),
  );
  return result.success
    ? {
        success: true,
        skillId: result.skillId,
        draft: true,
        message:
          `已生成 executable draft（enabled=false）。注意：这不是 Hermes 主路径；` +
          `程序记忆请用 skill_manage 写 procedural SKILL.md 包，并经 skills_list/skill_view 加载。`,
      }
    : { error: result.reason ?? "生成失败" };
}

const SWARM_DEFS: NativeToolDefinition[] = [
  {
    name: "agent_create",
    description: "创建一个新 Agent（需超级权限）。可指定 tier/workspaceId/parentId。创建管理 Agent 时会自动生成主 session。",
    parameters: zodParams(
      z.object({
        name: z.string().describe("Agent 名称（可重复，id 全局唯一）"),
        description: z.string().optional(),
        model: z.string().describe("模型 ID").optional(),
        systemPrompt: z.string().optional(),
        tools: z.array(z.string()).describe("工具列表").optional(),
        tier: z.enum(["super", "manager", "sub"]).describe("层级").optional(),
        workspaceId: z.string().describe("所属 Workspace id（super 不需要）").optional(),
        parentId: z.string().describe("上级 Agent id").optional(),
        heartbeatModel: z.string().describe("心跳用便宜模型").optional(),
        heartbeat: z.record(z.unknown()).describe("心跳配置 { enabled, cron, goal }").optional(),
      }),
    ),
  },
  {
    name: "agent_update",
    description: "更新 Agent 配置（超级=全局；管理 Agent=仅本 Workspace 内，不能改 tier/迁出空间）。超级 Agent 不可被降级。",
    parameters: zodParams(
      z.object({
        id: z.string().describe("目标 Agent id"),
        name: z.string().optional(),
        description: z.string().optional(),
        model: z.string().optional(),
        systemPrompt: z.string().optional(),
        tools: z.array(z.string()).optional(),
        heartbeatModel: z.string().optional(),
        heartbeat: z.record(z.unknown()).describe("心跳配置").optional(),
        status: z.enum(["active", "idle", "dormant"]).describe("Agent 状态").optional(),
      }),
    ),
  },
  {
    name: "agent_delete",
    destructive: true,
    description: "删除 Agent（超级=全局；管理 Agent=仅本 Workspace）。超级 Agent 不可删除。tombstone 保留。",
    parameters: zodParams(
      z.object({
        id: z.string().describe("目标 Agent id"),
      }),
    ),
  },
  {
    name: "agent_update_sub",
    description: "更新本 Workspace 内子 Agent（管理 Agent 工具别名，等同 agent_update + 出域硬拦）。",
    parameters: zodParams(z.object({
      id: z.string().describe("目标 Agent id"),
      name: z.string().optional(),
      description: z.string().optional(),
      model: z.string().optional(),
      systemPrompt: z.string().optional(),
      tools: z.array(z.string()).optional(),
      status: z.enum(["active", "idle", "dormant"]).optional(),
    })),
  },
  {
    name: "agent_delete_sub",
    destructive: true,
    description: "删除本 Workspace 内子 Agent（管理 Agent 工具别名，等同 agent_delete + 出域硬拦）。",
    parameters: zodParams(z.object({ id: z.string().describe("目标 Agent id") })),
  },
  {
    name: "agent_inspect",
    description:
      "查看 Agent 状态（超级=全局；管理 Agent=本 Workspace；对超级仅返回公开元信息）。" +
      "只返回 Agent 元信息（含 hasCustomSystemPrompt/systemPromptChars，无 prompt 正文）、" +
      "最近会话列表（id/title/status/messageCount）与可选 memory 元信息（id/type/scope/contentChars，无正文）/swarm 快照；" +
      "不返回 systemPrompt/记忆正文/任何会话消息内容——子 Agent 的结果只能通过 agent_report_back 投递。" +
      "includeSwarm=true 时附带 inbox 积压、会话运行态、ask_user pending、心跳熔断、superior 队列。",
    parameters: zodParams(
      z.object({
        id: z.string().describe("目标 Agent id"),
        includeMemory: z
          .boolean()
          .describe("是否包含 memory 元信息（默认 false；仅 id/type/scope/长度，无正文）")
          .optional(),
        includeSwarm: z
          .boolean()
          .describe("是否包含 Swarm 健康快照（inbox/队列/ask_user/心跳，默认 false）")
          .optional(),
      }),
    ),
  },
  {
    name: "swarm_brief",
    description:
      "生成 Swarm 作战简报（markdown）：作用域内各 Agent 的 inbox/ask_user/paused/心跳/superior 队列与通知通道熔断。" +
      "超级默认全局，可传 workspaceId；管理 Agent 仅本 Workspace。派活前建议先调用，优先处理积压。",
    parameters: zodParams(
      z.object({
        workspaceId: z
          .string()
          .describe("收窄到某 Workspace（仅超级；管理 Agent 忽略并强制本空间）")
          .optional(),
        limit: z.number().describe("最多扫描多少个 Agent（默认 12，上限 30）").optional(),
      }),
    ),
  },
  {
    name: "agent_send_message",
    description: "向另一个 Agent 发送消息。向下发（super→manager、manager→sub）可在工具调用中发；向上发（sub→manager、manager→super）只能在正式回复中发。跨 Workspace 只有超级能发。目标正在运行时消息进入其服务端持久队列（返回 queued=true），其空闲时自动处理。",
    parameters: zodParams(
      z.object({
        toAgentId: z.string().describe("目标 Agent id"),
        content: z.string().describe("消息内容（纯文本或含文件路径引用）"),
        messageType: z.enum(["command", "query", "report", "forward"]).describe("消息类型").optional(),
      }),
    ),
  },
  {
    name: "agent_report_back",
    description:
      "【正式任务结果】把本轮任务的最终结果回报给上级，进入父会话「异步任务结果队列」（右栏待消费），父 Agent 会据此继续工作。" +
      "与 agent_notify_parent 的区别：report_back=任务完成/失败的正式交付；notify_parent=过程中的进度/催问/闲聊通知，走发送队列，不是任务结果。" +
      "成功回报须带 evidence（path/url/memoryId/toolResult）；缺出处会标 [未经出处核验]。" +
      "messageType=query 只向上求援，不结案跟踪任务。" +
      "非阻塞派活（waitForResult=false）完成后必须调用本工具；不要用 notify_parent 代替本工具交结果。",
    parameters: zodParams(
      z.object({
        content: z.string().describe("回报内容（任务最终结果全文）"),
        messageType: z.enum(["report", "query"]).describe("report=结案交付；query=求援不结案").optional(),
        outcome: z.enum(["success", "failed", "blocked"]).describe("任务结局，默认 success").optional(),
        evidence: z
          .array(
            z.union([
              z.string().describe("出处指针（路径/URL/记忆 id）"),
              z.object({
                kind: z.enum(["path", "url", "memoryId", "toolResult", "note"]).optional(),
                ref: z.string().describe("路径、URL、memoryId 或工具结果指针"),
              }),
            ]),
          )
          .describe("出处列表。成功结案应至少一条；父 Agent 只看见指针，看不见子会话。")
          .optional(),
        noEvidenceReason: z
          .string()
          .describe("确实搜不到出处时说明原因（搜过但无结果/任务本身无需材料）。有此字段不再打未核验标记。")
          .optional(),
      }),
    ),
  },
  {
    name: "agent_create_sub",
    description:
      "创建子 Agent。默认落在当前父 Agent 所在 Workspace；超级 Agent 可传 workspaceId 跨 Workspace 创建。",
    parameters: zodParams(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        model: z.string().optional(),
        systemPrompt: z.string().optional(),
        tools: z.array(z.string()).optional(),
        workspaceId: z
          .string()
          .describe("目标 Workspace（仅超级 Agent 可跨 Workspace；默认=父 Agent 所在 Workspace）")
          .optional(),
      }),
    ),
  },
  {
    name: "workspace_create",
    description:
      "创建业务 Workspace（需超级权限）。默认自动创建管理 Agent + 主 session + .oasismind/；可设 withManager、initialTask、asyncSlotQuota（本空间后台 LLM 槽上限，默认 2，0=不限仍受全局硬顶）。",
    parameters: zodParams(
      z.object({
        name: z.string().describe("Workspace 名称"),
        description: z.string().optional(),
        path: z.string().describe("磁盘目录路径"),
        withManager: z.boolean().describe("是否创建管理 Agent（默认 true）").optional(),
        autoCreateManager: z.boolean().describe("同 withManager").optional(),
        managerName: z.string().describe("管理 Agent 名称").optional(),
        managerModel: z.string().describe("管理 Agent 的模型").optional(),
        managerSystemPrompt: z.string().describe("管理 Agent 的 system prompt（不填用默认模板）").optional(),
        initialTask: z.string().describe("发给管理 Agent 主会话的初始任务").optional(),
        asyncSlotQuota: z.number().describe("本 Workspace 后台 LLM 异步槽上限；0=不限；默认 2").optional(),
      }),
    ),
  },
  {
    name: "workspace_archive",
    description: "归档 Workspace（需超级权限）。归档 = 所有 Agent 设为 dormant，不跑心跳，不接收消息。可恢复。",
    parameters: zodParams(
      z.object({
        id: z.string().describe("Workspace id"),
      }),
    ),
  },
  {
    name: "free_api_keys_list",
    description: "列出可用的免费 API Key 元数据（不返回明文；Credential 中 source=free）。仅管理 Agent（manager）及以上可调用。",
    parameters: zodParams(z.object({})),
  },
  {
    name: "free_api_keys_fetch",
    description: "获取一个可用的免费 API Key（轮询分配，标记 lastUsedAt）。P1-05：明文 key 不再返回给上下文，由服务端直接注入到运行时 config.llm.providers[provider]，后续 LLM 调用自动使用；返回掩码 + 注入确认。仅管理 Agent（manager）及以上可调用；子 Agent 禁止。",
    parameters: zodParams(
      z.object({
        provider: z.string().describe(`偏好提供商（如 ${LLM_PROVIDER_DEEPSEEK}/openai），不填则随机分配`).optional(),
      }),
    ),
  },
  {
    name: "free_models_list",
    description:
      "列出可用免费模型：OpenRouter :free 目录（id/上下文/模态/说明）+ 可选 freellm 网关通道元数据（无明文 key）。仅管理 Agent（manager）及以上可调用。可用 q/modality/sort/limit 缩小结果，避免撑爆上下文。",
    parameters: zodParams(
      z.object({
        q: z.string().describe("搜索模型 id / 名称 / 描述关键词").optional(),
        modality: z
          .enum(["all", "text", "multimodal"])
          .describe("模态筛选：all | text | multimodal，默认 all")
          .optional(),
        sort: z
          .enum(["context_desc", "context_asc", "name"])
          .describe("排序：context_desc（默认）| context_asc | name")
          .optional(),
        limit: z.number().describe("返回条数上限，默认 30，最大 100").optional(),
        includeFreellm: z
          .boolean()
          .describe("是否附带 freellm 网关通道列表（默认 true；不含明文 key）")
          .optional(),
      }),
    ),
  },
  {
    name: "skill_discover",
    description:
      "发现值得推广的 Skill（超级 Agent，Hermes）。仅返回已启用且有真实调用统计（executeSkill 回写）的候选，按 usageCount/successRate 排序。",
    parameters: zodParams(
      z.object({
        minSuccessRate: z.number().describe("最低成功率阈值（0-100），默认 80").optional(),
        minUsageCount: z.number().describe("最低调用次数，默认 1（无统计不进榜）").optional(),
        limit: z.number().describe("返回数量上限，默认 10").optional(),
      }),
    ),
  },
  {
    name: "skill_enable",
    description:
      "启用 Skill draft（enabled=false→true，管理 Agent+，Hermes）。默认需人工审批；启用后才会进入 Agent 调度与 skill_discover。",
    parameters: zodParams(
      z.object({
        skillId: z.string().describe("要启用的 Skill id"),
      }),
    ),
  },
  {
    name: "skill_promote",
    description:
      "将已启用的优秀 Skill 加入目标 Agent 工具列表（超级 Agent，Hermes）。默认需人工审批；未启用的 draft 不可推广。必须提供 evidence（调用统计/成功案例），禁止无证据推广。",
    parameters: zodParams(
      z.object({
        skillId: z.string().describe("要推广的 Skill id"),
        targetAgentIds: z.array(z.string()).describe("目标 Agent id 列表（将 Skill 加入其工具列表）"),
        evidence: z.string().describe("推广证据：真实调用统计、成功案例或评测结果，禁止空口推广"),
      }),
    ),
  },
  {
    name: "optimize_agent_prompt",
    description:
      "生成子 Agent system prompt 的优化提案（管理 Agent 专用，Agent 进化高级版）。基于近期运行经验分析成功率、工具使用模式与失败归因（实现失败 vs 方向失败）。提案制：不直接改 prompt，创建 pending 审批提交人工 review，用户在 /approvals 批准后生效。",
    parameters: zodParams(
      z.object({
        agentId: z.string().describe("目标子 Agent id"),
      }),
    ),
  },
  {
    name: "generate_skill_from_experience",
    description:
      "从 Agent 运行经验中生成 Skill **draft**（管理 Agent+，Hermes）。分析高频工具组合；新建 Skill 默认 enabled=false，需 skill_enable 审批启用后再推广。",
    parameters: zodParams(
      z.object({
        agentId: z.string().describe("分析哪个 Agent 的经验"),
        skillName: z.string().describe("新 Skill 的名称"),
        skillDescription: z.string().describe("新 Skill 的描述"),
      }),
    ),
  },
  {
    name: "swarm_export_trace",
    description:
      "导出会话协作轨迹为 JSONL（session/run/queue/child/task/agentMessage）。默认不含消息正文，用于评估「派子是否更值」。",
    concurrencyClass: "B",
    parameters: zodParams(
      z.object({
        sessionId: z.string().describe("可选；默认当前会话").optional(),
        includeContent: z.boolean().describe("是否含消息正文，默认 false").optional(),
        outRelPath: z.string().describe("可选输出相对路径").optional(),
      }),
    ),
  },
  {
    name: "swarm_stage_write",
    description:
      "写入 Workspace 阶段工件（.oasismind/stages/{stage}.md）。轻量 SOP 接力：子 Agent 交工件，父/manager 读工件，不读子会话正文。",
    concurrencyClass: "C",
    parameters: zodParams(
      z.object({
        stage: z.string().describe("阶段名，如 research / draft / review"),
        body: z.string().describe("Markdown 正文"),
        title: z.string().optional(),
        workspaceId: z.string().optional(),
        taskRef: z.string().optional(),
      }),
    ),
  },
  {
    name: "swarm_stage_list",
    description: "列出当前 Workspace 的阶段工件元信息（不含全文时可先 list 再 read）。",
    concurrencyClass: "B",
    parameters: zodParams(
      z.object({
        workspaceId: z.string().optional(),
      }),
    ),
  },
  {
    name: "swarm_stage_read",
    description: "读取指定阶段工件全文（SOP 接力的正式产物通道）。",
    concurrencyClass: "B",
    parameters: zodParams(
      z.object({
        stage: z.string(),
        workspaceId: z.string().optional(),
      }),
    ),
  },
];

const SWARM_HANDLERS: Record<string, NativeToolHandler> = {
  agent_create: agentCreateTool,
  agent_update: agentUpdateTool,
  agent_delete: agentDeleteTool,
  // *_sub：管理 Agent 工具清单别名，与 update/delete 同实现（出域硬拦在 handler 内）
  agent_update_sub: agentUpdateTool,
  agent_delete_sub: agentDeleteTool,
  agent_inspect: agentInspectTool,
  swarm_brief: swarmBriefTool,
  agent_send_message: agentSendMessageTool,
  agent_report_back: agentReportBackTool,
  agent_create_sub: agentCreateSubTool,
  workspace_create: workspaceCreateTool,
  workspace_archive: workspaceArchiveTool,
  free_api_keys_list: freeApiKeysListTool,
  free_api_keys_fetch: freeApiKeysFetchTool,
  free_models_list: freeModelsListTool,
  skill_discover: skillDiscoverTool,
  skill_enable: skillEnableTool,
  skill_promote: skillPromoteTool,
  optimize_agent_prompt: optimizeAgentPromptTool,
  generate_skill_from_experience: generateSkillFromExperienceTool,
  swarm_export_trace: swarmExportTraceTool,
  swarm_stage_write: swarmStageWriteTool,
  swarm_stage_list: swarmStageListTool,
  swarm_stage_read: swarmStageReadTool,
};

export function registerSwarmTools(): void {
  registerNativeDomain(SWARM_DEFS, SWARM_HANDLERS);
}

export { agentCreateSubTool } from "./createSub.js";
export { agentSendMessageTool } from "./sendMessage.js";
export { enqueueSuperiorDrainForSession, requeueOrphanedSuperiorDrains } from "./superiorDrain.js";
