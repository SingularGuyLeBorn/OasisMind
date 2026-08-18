/**
 * AgentEvolution — Agent 进化高级版（Hermes 式自我改进）
 *
 * 能力：
 * 1. 经验自动积累：每次 Run 完成后，自动总结经验写入 Memory（kind="experience"）
 * 2. System Prompt 自动优化：管理 Agent 定期审查子 Agent 的经验，优化其 prompt
 * 3. Skill 自动生成：从重复的操作模式中提炼 Skill
 *
 * 触发方式：
 * - 经验积累：agentStream 的 onDone 回调中自动调用
 * - Prompt 优化：管理 Agent 心跳时通过 optimize_sub_agent_prompt 工具触发
 * - Skill 生成：管理 Agent 通过 generate_skill_from_experience 工具触发
 */

import type { PrismaClient } from "@prisma/client";
import type { ServiceContainer } from "./serviceContainer.js";
import type { StoredToolCall } from "./chatHistory.js";
import type { AppConfig } from "./config.js";
import { createMemoryRepository } from "./memoryRepository.js";
import { deriveDecisionScope } from "./approvalScope.js";
import { resolveAuxiliaryModel } from "./auxiliaryModel.js";
import { resilientChatCompletion } from "./resilientLlmClient.js";
import { MEMORY_ARCHIVE_THRESHOLD, MEMORY_TYPES, memoryAgentScope, memoryWorkspaceScope } from "@oasismind/shared";
import type {
  ReportEvidenceItem,
  ReportEvidenceStatus,
  ReportOutcome,
} from "./swarmReportContract.js";

/**
 * IVE 失败归因（EvoScientist）：
 * - implementation：实现失败——工具报错/参数错/执行崩（改工具使用纪律可修）
 * - direction：方向失败——任务理解/思路错（需改 prompt 层引导）
 * - unknown：规则无法判定（中断/内容空但无工具错误签名）
 */
export type ExperienceFailureKind = "implementation" | "direction" | "unknown";

export interface ExperienceSummary {
  taskDescription: string;
  toolsUsed: string[];
  success: boolean;
  durationMs: number;
  tokenUsage: { prompt: number; completion: number; total: number } | null;
  keyLearnings: string;
  failureKind?: ExperienceFailureKind;
  failureReason?: string;
  /** 子 Agent report_back 出处合同；缺省=历史经验，视为可蒸馏 */
  evidenceStatus?: ReportEvidenceStatus;
  evidence?: ReportEvidenceItem[];
}

/** 从工具结果对象提取错误签名（error 字段 / success===false） */
function extractToolError(result: unknown): string | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) return null;
  const obj = result as Record<string, unknown>;
  if (typeof obj.error === "string" && obj.error.trim()) return obj.error.slice(0, 200);
  if (obj.success === false) {
    return typeof obj.message === "string" ? obj.message.slice(0, 200) : "success=false";
  }
  return null;
}

/**
 * 规则归因（零成本）：
 * 1. 任一工具调用有错误签名 → implementation（改工具使用纪律可修）
 * 2. 无工具错误但整个 run 未产出有效内容（producedOutput=false）→ direction（任务理解/思路偏差，改 prompt 层引导）
 * 3. 否则 → unknown（规则无法判定，留待人工/上游 LLM 复核）
 */
function bareToolName(name: string): string {
  return name.startsWith("native:") ? name.slice("native:".length) : name;
}

/** 从本轮工具结果抽出最近一次 report_back 出处合同（无则 null） */
export function extractReportBackContract(toolCalls: StoredToolCall[]): {
  evidenceStatus?: ReportEvidenceStatus;
  evidence?: ReportEvidenceItem[];
  outcome?: ReportOutcome;
} | null {
  for (let i = toolCalls.length - 1; i >= 0; i--) {
    const t = toolCalls[i];
    if (t.kind !== "tool") continue;
    if (bareToolName(t.name) !== "agent_report_back") continue;
    const r = t.result;
    if (!r || typeof r !== "object" || Array.isArray(r)) {
      return { evidenceStatus: "none" };
    }
    const obj = r as Record<string, unknown>;
    const status = obj.evidenceStatus;
    return {
      evidenceStatus:
        status === "cited" || status === "none" || status === "excused" ? status : "none",
      evidence: Array.isArray(obj.evidence) ? (obj.evidence as ReportEvidenceItem[]) : undefined,
      outcome:
        obj.outcome === "failed" || obj.outcome === "blocked" || obj.outcome === "success"
          ? obj.outcome
          : undefined,
    };
  }
  return null;
}

/** 未核验回报不进 procedural 蒸馏；缺字段的历史经验视为可蒸馏 */
export function isCitedExperience(summary: ExperienceSummary): boolean {
  return summary.evidenceStatus !== "none";
}

export function attributeFailure(
  toolCalls: StoredToolCall[],
  opts?: { producedOutput?: boolean },
): {
  failureKind: ExperienceFailureKind;
  failureReason?: string;
} {
  for (const t of toolCalls) {
    if (t.kind !== "tool") continue;
    const err = extractToolError(t.result);
    if (err) {
      return { failureKind: "implementation", failureReason: `工具 ${t.name} 报错：${err}` };
    }
  }
  const report = extractReportBackContract(toolCalls);
  if (report?.outcome === "failed" || report?.outcome === "blocked") {
    return {
      failureKind: "direction",
      failureReason: `子 Agent 以 outcome=${report.outcome} 回报，任务方向或目标未达成`,
    };
  }
  if (opts?.producedOutput === false) {
    return {
      failureKind: "direction",
      failureReason: "工具调用无报错但未产出有效内容，疑似任务方向/理解偏差",
    };
  }
  return { failureKind: "unknown" };
}

/** 有工具调用才值得沉淀经验；纯闲聊跳过，避免经验库噪声 */
export function shouldAccumulateExperience(result: {
  toolCalls?: StoredToolCall[] | null;
}): boolean {
  return (result.toolCalls ?? []).some((t) => t.kind === "tool");
}

/**
 * 从一次 Run 中提取经验并写入 Memory
 * 挂载：agentStream onDone + agentRuntime chatAgent（有工具调用时）
 */
export async function accumulateExperience(
  prisma: PrismaClient,
  services: ServiceContainer,
  agentId: string,
  sessionId: string,
  result: {
    content: string;
    toolCalls: StoredToolCall[];
    tokenUsage: { prompt: number; completion: number; total: number } | null;
    roundsUsed: number;
  },
  input: { message: string; trigger?: string; workspaceId?: string | null },
  durationMs: number,
): Promise<{ written: boolean }> {
  try {
    if (!shouldAccumulateExperience(result)) {
      return { written: false };
    }

    const tools = result.toolCalls.filter((t) => t.kind === "tool");
    const toolNames = tools.map((t) => t.name);
    const report = extractReportBackContract(result.toolCalls);
    const outcomeFailed = report?.outcome === "failed" || report?.outcome === "blocked";
    const success = !!result.content.trim() && !outcomeFailed;
    const attribution = success ? null : attributeFailure(result.toolCalls, { producedOutput: success });
    const unverified = report?.evidenceStatus === "none";

    // 简化经验总结：工具使用 + 成功/失败 + 耗时 + IVE 失败归因 + report_back 出处
    const experience: ExperienceSummary = {
      taskDescription: input.message.slice(0, 200),
      toolsUsed: [...new Set(toolNames)],
      success,
      durationMs,
      tokenUsage: result.tokenUsage,
      keyLearnings: success
        ? `任务成功完成。使用了 ${toolNames.length} 次工具调用（${[...new Set(toolNames)].join(", ")}），耗时 ${Math.round(durationMs / 1000)}s。${unverified ? "回报未经出处核验。" : ""}`
        : `任务可能失败。内容为空或被中断。使用了 ${toolNames.length} 次工具调用。`,
      ...(attribution
        ? { failureKind: attribution.failureKind, failureReason: attribution.failureReason }
        : {}),
      ...(report?.evidenceStatus ? { evidenceStatus: report.evidenceStatus } : {}),
      ...(report?.evidence?.length ? { evidence: report.evidence } : {}),
    };

    // 写入 Memory（type="experience"，scope=agent:{id} 写时隔离——W5：不再直查 Prisma，
    // 统一走 MemoryRepository，保证文件回写 + FTS 增量同步，且其他 Agent 上下文不可见）
    const repo = createMemoryRepository(services);
    const memoryBase = {
      content: JSON.stringify(experience),
      type: MEMORY_TYPES.EXPERIENCE,
      strength: success ? (unverified ? 0.7 : 1.0) : 0.5,
      keywords: [
        ...new Set(toolNames),
        input.trigger ?? "chat",
        success ? "success" : "failed",
        ...(attribution ? [`failure:${attribution.failureKind}`] : []),
        ...(unverified ? ["evidence:none"] : report?.evidenceStatus === "cited" ? ["evidence:cited"] : []),
      ],
      attribution: "experience" as const,
    };
    await repo.write({ ...memoryBase, scope: memoryAgentScope(agentId) });

    // W5-followup 三层落地：Agent 属于 Workspace 时，经验同步沉淀到 workspace 层——
    // 管理/超级 Agent 一次 memory_search 即可看到全 Workspace 的经验（sub 无 memory 工具权限，
    // 见 swarmPermissionGuard）；agent 层私有副本保留，供按 Agent 审查
    // （optimize_sub_agent_prompt / generate_skill_from_experience）。
    if (input.workspaceId) {
      await repo.write({ ...memoryBase, scope: memoryWorkspaceScope(input.workspaceId) });
    }

    // 更新 Agent 状态（活跃度）
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: "active" },
    }).catch((err) => { console.warn("[agentEvolution.ts] best-effort failed:", err instanceof Error ? err.message : err); });
    return { written: true };
  } catch (err) {
    console.warn(`[AgentEvolution] 经验积累失败 for ${agentId}:`, err);
    return { written: false };
  }
}

/**
 * 自动优化子 Agent 的 system prompt（ESE 提案制：人工 review 闸）
 * 管理 Agent 通过工具调用触发。
 *
 * 铁律：本函数**不直接改 prompt**——蒸馏结果先创建 pending Approval
 * （toolName=agent.update），用户在 /approvals 批准后由审批执行链路重放生效。
 * 防止 LLM 蒸馏出的劣质/漂移 prompt 静默污染 Agent 身份。
 */
export async function optimizeAgentPrompt(
  prisma: PrismaClient,
  services: ServiceContainer,
  targetAgentId: string,
  operatorAgentId: string,
): Promise<{
  success: boolean;
  pendingApproval?: boolean;
  approvalId?: string;
  proposal?: string;
  reason?: string;
}> {
  try {
    const agent = await prisma.agent.findUnique({ where: { id: targetAgentId } });
    if (!agent || agent.status === "deleted") {
      return { success: false, reason: "目标 Agent 不存在或已删除" };
    }
    if (agent.tier === "super") {
      return { success: false, reason: "不能优化超级 Agent 的 prompt" };
    }

    // 查该 Agent 最近 20 条经验（global 共享经验 + 本 Agent scope）
    const repo = createMemoryRepository(services);
    const experiences = await repo.read({
      types: [MEMORY_TYPES.EXPERIENCE],
      scopes: [memoryAgentScope(targetAgentId), "global"],
      limit: 20,
    });

    if (experiences.length < 5) {
      return { success: false, reason: "经验不足 5 条，暂不优化" };
    }

    // 分析经验模式（含 IVE 失败归因分布）
    const parsed: ExperienceSummary[] = [];
    for (const e of experiences) {
      try {
        parsed.push(JSON.parse(e.content) as ExperienceSummary);
      } catch {
        /* 跳过坏行 */
      }
    }
    const successCount = parsed.filter((e) => e.success).length;
    const successRate = (successCount / experiences.length) * 100;

    const failureStats = { implementation: 0, direction: 0, unknown: 0 };
    const failureReasons: string[] = [];
    for (const e of parsed) {
      if (e.success) continue;
      const kind = e.failureKind ?? "unknown";
      failureStats[kind] += 1;
      if (e.failureReason && failureReasons.length < 3) {
        failureReasons.push(e.failureReason);
      }
    }

    const toolFrequency = new Map<string, number>();
    for (const t of parsed.flatMap((e) => e.toolsUsed)) {
      toolFrequency.set(t, (toolFrequency.get(t) ?? 0) + 1);
    }
    const topTools = [...toolFrequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    // 构建优化提案（追加到现有 prompt，不覆盖）；按失败归因分层给建议
    const failTotal = failureStats.implementation + failureStats.direction + failureStats.unknown;
    const attributionLines: string[] = [];
    if (failTotal > 0) {
      attributionLines.push(
        `- 失败归因：实现失败 ${failureStats.implementation} / 方向失败 ${failureStats.direction} / 未判定 ${failureStats.unknown}`,
      );
      if (failureStats.implementation > 0) {
        attributionLines.push(
          `- 建议（实现层）：工具调用前先核对参数 schema；报错后读错误信息换参数重试，不要原样重发。典型错误：${failureReasons[0] ?? "见经验库"}`,
        );
      }
      if (failureStats.direction > 0) {
        attributionLines.push(
          `- 建议（方向层）：动手前先复述任务目标与验收标准；方向不确定时用 ask_user 澄清，不要直接试错。`,
        );
      }
    }

    const optimizationNote = `\n\n## 自动优化提案（${new Date().toISOString().slice(0, 10)}，经人工 review 生效）
- 近期成功率：${successRate.toFixed(0)}%
- 高频工具：${topTools.map(([name, count]) => `${name}(${count})`).join(", ")}
${attributionLines.join("\n")}
${successRate < 60 ? "- 建议：成功率偏低，检查任务描述是否清晰，工具是否合适。\n" : ""}${topTools.length > 3 ? "- 建议：使用工具较多，考虑封装为 Skill 减少调用次数。\n" : ""}`;

    const optimized = agent.systemPrompt + optimizationNote;

    // ESE 人工 review 闸：创建 pending Approval，批准后经审批执行链路重放 agent.update
    const approvalArgs = { id: targetAgentId, systemPrompt: optimized };
    const created = await services.approval.create({
      toolName: "agent.update",
      args: approvalArgs,
      status: "pending",
      decisionScope: deriveDecisionScope("agent.update", approvalArgs),
    } as Parameters<typeof services.approval.create>[0]);
    if (!created.success || !created.data) {
      return { success: false, reason: "创建优化提案审批失败" };
    }
    const approvalId = (created.data as { id: string }).id;

    // 审计日志
    await prisma.log.create({
      data: {
        level: "info",
        component: "swarm",
        event: "agent_prompt_optimize_proposed",
        message: `Agent ${agent.name} 的 prompt 优化提案已提交人工 review（成功率 ${successRate.toFixed(0)}%，approvalId=${approvalId}）`,
        metadata: {
          agentId: targetAgentId,
          operatorAgentId,
          successRate,
          experienceCount: experiences.length,
          failureStats,
          approvalId,
        },
      },
    }).catch((err) => { console.warn("[agentEvolution.ts] best-effort failed:", err instanceof Error ? err.message : err); });

    return { success: true, pendingApproval: true, approvalId, proposal: optimizationNote };
  } catch (err) {
    return { success: false, reason: `优化失败: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/** 生成可进沙箱的 draft Skill 代码（须定义 run；返回建议工具序，不擅自调副作用工具） */
export function buildDraftSkillCode(opts: {
  skillName: string;
  tools: string[];
  experienceCount: number;
  frequency: number;
}): string {
  const toolsJson = JSON.stringify(opts.tools, null, 2);
  return `// 自动生成 draft Skill：${opts.skillName}
// 基于 ${opts.experienceCount} 条经验，高频工具组合出现 ${opts.frequency} 次
// enabled=false，需人工启用后才会进默认调度
async function run(input, context) {
  const suggestedTools = ${toolsJson};
  return {
    status: "draft_skill",
    skill: ${JSON.stringify(opts.skillName)},
    message: "按 suggestedTools 顺序完成任务；参数请根据 input/context 填写后再改为真实调用。",
    suggestedTools,
    input,
    context: context ?? null,
  };
}
`;
}

/**
 * 从经验模式中自动生成 Skill **draft**（enabled=false）
 * 管理 Agent 通过工具调用触发；上线需审批/人工启用（见 skill_enable）
 */
export async function generateSkillFromExperience(
  prisma: PrismaClient,
  services: ServiceContainer,
  agentId: string,
  skillName: string,
  skillDescription: string,
): Promise<{ success: boolean; skillId?: string; draft?: boolean; reason?: string }> {
  try {
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent || agent.status === "deleted") {
      return { success: false, reason: "目标 Agent 不存在或已删除" };
    }

    const scopes = [memoryAgentScope(agentId), "global"];
    if (agent.workspaceId) {
      scopes.push(memoryWorkspaceScope(agent.workspaceId));
    }

    const repo = createMemoryRepository(services);
    const experiences = await repo.read({
      types: [MEMORY_TYPES.EXPERIENCE],
      scopes,
      limit: 30,
    });

    if (experiences.length < 3) {
      return { success: false, reason: "经验不足 3 条，无法生成 Skill" };
    }

    // 提取高频工具组合
    const toolCombos = new Map<string, number>();
    for (const exp of experiences) {
      try {
        const data = JSON.parse(exp.content) as ExperienceSummary;
        if (data.toolsUsed.length > 0) {
          const combo = [...data.toolsUsed].sort().join(",");
          toolCombos.set(combo, (toolCombos.get(combo) ?? 0) + 1);
        }
      } catch { /* ignore */ }
    }

    const topCombo = [...toolCombos.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!topCombo || topCombo[1] < 2) {
      return { success: false, reason: "无高频工具组合，无法提炼 Skill" };
    }

    const tools = topCombo[0].split(",").filter(Boolean);
    const skillCode = buildDraftSkillCode({
      skillName,
      tools,
      experienceCount: experiences.length,
      frequency: topCombo[1],
    });

    const created = await services.skill.create({
      name: skillName,
      description: skillDescription,
      code: skillCode,
      icon: "Sparkles",
      enabled: false,
      metaJson: JSON.stringify({
        autoGenerated: true,
        draft: true,
        generatedFrom: "experience",
        experienceCount: experiences.length,
        toolCombo: tools,
        frequency: topCombo[1],
        generatedAt: new Date().toISOString(),
        sourceAgentId: agentId,
      }),
    } as any);

    if (!created.success || !created.data) {
      return { success: false, reason: created.error?.message ?? "Skill 创建失败" };
    }

    await prisma.log.create({
      data: {
        level: "info",
        component: "swarm",
        event: "skill_auto_generated",
        message: `Skill draft ${skillName} 从经验中生成（enabled=false，工具组合：${tools.join(",")}）`,
        metadata: {
          skillId: created.data.id,
          agentId,
          toolCombo: tools,
          frequency: topCombo[1],
          draft: true,
        },
      },
    }).catch((err) => { console.warn("[agentEvolution.ts] best-effort failed:", err instanceof Error ? err.message : err); });

    return { success: true, skillId: created.data.id, draft: true };
  } catch (err) {
    return { success: false, reason: `Skill 生成失败: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * 从 type=experience 运行经验中蒸馏出 type=procedural 可复用规则。
 *
 * 触发：heartbeat 维护通道每日在 decay/consolidate 之后调用。
 * 机制：
 * - 按 scope 分批处理，只取 active experience。
 * - 同一 scope 经验数 ≥ minCount 才蒸馏。
 * - 按 strength × recency 取前 maxPerScope 条。
 * - LLM 提炼 ≤5 条规则；输出非空则写 procedural 记忆。
 * - 源经验通过「 strength 降到归档阈值以下 + repo.forget 」走既有归档路径。
 */
export async function distillExperienceToProcedural(
  services: ServiceContainer,
  config: AppConfig,
): Promise<{ scopesProcessed: number; distilled: number }> {
  const cfg = config.memory?.experienceDistill;
  if (!cfg || cfg.enabled === false) {
    return { scopesProcessed: 0, distilled: 0 };
  }

  const prisma = services.prisma;
  const repo = createMemoryRepository(services);
  const now = Date.now();

  // 1) 找出所有有 active experience 的 scope
  const rows = await prisma.memory.findMany({
    where: { status: "active", type: MEMORY_TYPES.EXPERIENCE },
    select: { scope: true },
    distinct: ["scope"],
  });
  const scopes = rows.map((r) => r.scope);

  let scopesProcessed = 0;
  let distilled = 0;

  for (const scope of scopes) {
    try {
      // 2) 读该 scope 的 active experience
      const experiences = await repo.read({
        types: [MEMORY_TYPES.EXPERIENCE],
        scopes: [scope],
        limit: cfg.maxPerScope,
      });

      // 未核验回报（evidenceStatus=none）不进蒸馏，避免把无出处幻觉写成 procedural
      const usable = experiences.filter((e) => {
        try {
          return isCitedExperience(JSON.parse(e.content) as ExperienceSummary);
        } catch {
          return false;
        }
      });

      if (usable.length < cfg.minCount) continue;

      // 3) 按 strength × recency 排序（recencyScore 已在 repo.read 中作为排序因子，这里再精排一次）
      const sorted = [...usable].sort((a, b) => {
        const scoreA = a.strength * recencyScore(a.updatedAt, now);
        const scoreB = b.strength * recencyScore(b.updatedAt, now);
        return scoreB - scoreA;
      });

      const top = sorted.slice(0, cfg.maxPerScope);

      // 4) 构建紧凑清单
      const summaries: ExperienceSummary[] = [];
      for (const e of top) {
        try {
          summaries.push(JSON.parse(e.content) as ExperienceSummary);
        } catch {
          /* 跳过坏 JSON */
        }
      }
      if (summaries.length === 0) continue;

      const toolFreq = new Map<string, number>();
      const lines: string[] = [];
      for (const s of summaries) {
        for (const t of s.toolsUsed ?? []) {
          toolFreq.set(t, (toolFreq.get(t) ?? 0) + 1);
        }
        lines.push(
          `- 任务：${(s.taskDescription ?? "").slice(0, 80)} | 工具：${(s.toolsUsed ?? []).join(",") || "无"} | 成功：${s.success} | 原因：${(s.failureReason ?? s.keyLearnings ?? "").slice(0, 120)}`,
        );
      }

      const prompt = `把这些运行经验提炼成不超过 5 条「这类任务该怎么做」的可复用规则，每条一句话，只输出规则，每行一条。只提炼出现 ≥2 次的模式，单次偶然不提炼。\n\n${lines.join("\n")}`;

      const model = resolveAuxiliaryModel(config, {
        configured: cfg.model,
        mainModel: config.llm.defaultModel,
        preference: "lite_free",
      });

      const result = await resilientChatCompletion({
        config,
        model,
        messages: [
          { role: "system", content: "你是经验蒸馏器。把运行经验列表提炼成可复用的操作规则。" },
          { role: "user", content: prompt },
        ],
        maxTokens: 300,
        temperature: 0.3,
      });

      const raw = typeof result.content === "string" ? result.content : "";
      const rules = raw
        .split("\n")
        .map((l) => l.replace(/^[-\d\.\*]+\s*/, "").trim())
        .filter((l) => l.length > 0)
        .slice(0, 5);

      if (rules.length === 0) {
        console.warn(`[agentEvolution] scope=${scope} 蒸馏结果为空，跳过`);
        continue;
      }

      // 5) 写 procedural 记忆
      const keywords = [...toolFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

      await repo.write({
        content: rules.map((r) => `- ${r}`).join("\n"),
        type: MEMORY_TYPES.PROCEDURAL,
        scope,
        strength: 0.85,
        keywords,
        attribution: "agent",
        source: "experience-distill",
      });
      distilled++;
      scopesProcessed++;

      // 6) 归档源经验：走既有「strength 降到归档阈值以下 → repo.forget」路径
      const sourceIds = top.map((e) => e.id);
      await prisma.memory.updateMany({
        where: { id: { in: sourceIds } },
        data: { strength: 0.05 },
      });
      await repo.forget({ scope, beforeStrength: MEMORY_ARCHIVE_THRESHOLD });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[agentEvolution] scope=${scope} 经验蒸馏失败: ${reason}`);
      // 单个 scope 失败不影响其他 scope；不归档源经验
    }
  }

  return { scopesProcessed, distilled };
}

// 复用 memoryRepository 内部的 recencyScore 逻辑
function recencyScore(updatedAt: Date, nowMs: number): number {
  const ageDays = Math.max(0, (nowMs - updatedAt.getTime()) / 86_400_000);
  return 1 / (1 + ageDays);
}
