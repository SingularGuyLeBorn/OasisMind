/**
 * L3 Persona 蒸馏管线（TencentDB Agent Memory 分层记忆思想落地）。
 *
 * 记忆语义金字塔在见微的映射：
 * - L0 原始对话 = ChatMessage（已有）
 * - L1 原子事实 = Memory（preference/semantic/episodic/note/procedural，已有）
 * - L2 场景知识块 = Skill + 知识库 Post（已有对应物）
 * - L3 长期画像 = 本模块产出的 type=persona 记忆（本次新增）
 *
 * 设计要点：
 * - 蒸馏产物是**人类可读 Markdown**，白盒可调试（/memories 页可见可删改）；
 * - 整体重写而非增量补丁：已有画像经 supersedeUpdate 走软版本链，可回溯；
 * - 防抖：距上次蒸馏不足 PERSONA_DISTILL_MIN_INTERVAL_MS 且期间无新增记忆 → 跳过；
 * - LLM 失败/产物为空 = 跳过本次，绝不动现有画像；
 * - 本模块是叶子：不 import loop/reactLoop；LLM 经 createSyncTransport（弹性客户端）。
 */

import {
  MEMORY_TYPES,
  MEMORY_SCOPE_GLOBAL,
  PERSONA_DISTILL_MIN_INTERVAL_MS,
} from "@oasismind/shared";
import type { AppConfig } from "./config.js";
import type { ServiceContainer } from "./serviceContainer.js";
import { createMemoryRepository, type MemoryItem } from "./memoryRepository.js";
import { createSyncTransport } from "./loop/transports.js";
import type { LlmTransport } from "./loop/types.js";

export type PersonaDistillStatus = "distilled" | "skipped" | "no_material";

export interface PersonaDistillResult {
  status: PersonaDistillStatus;
  reason?: string;
  /** 新画像记忆 id（distilled 时给出） */
  personaId?: string;
  /** 被取代的旧画像 id（走 supersede 软版本链） */
  previousId?: string;
  /** 画像正文字符数 */
  chars?: number;
}

/** 参与蒸馏的素材类型（L1 原子事实层；experience 是运行台账不入画像） */
const PERSONA_SOURCE_TYPES = [
  MEMORY_TYPES.PREFERENCE,
  MEMORY_TYPES.SEMANTIC,
  MEMORY_TYPES.EPISODIC,
  MEMORY_TYPES.NOTE,
  MEMORY_TYPES.PROCEDURAL,
] as const;

/** 素材条数下限：太少说明还没积累，蒸馏无意义 */
const MIN_SOURCE_COUNT = 3;
/** 素材上限（strength 降序截取） */
const MAX_SOURCE_COUNT = 40;
/** 单条素材截断 */
const SOURCE_ITEM_MAX_CHARS = 200;
/** 画像正文硬上限（注入预算见 PERSONA_HINT_MAX_CHARS，此处留全文余量） */
const PERSONA_CONTENT_MAX_CHARS = 3_000;

const DISTILL_SYSTEM_PROMPT = `你是用户画像蒸馏器。输入是 AI 助手长期积累的用户记忆条目（偏好/事实/经历/笔记/流程）以及上一版画像（可能为空）。
请蒸馏出一份**长期用户画像**，要求：
1. Markdown 格式，小节固定为：## 偏好与习惯 / ## 长期目标与项目 / ## 工作模式 / ## 禁忌与边界（无内容的小节省略）；
2. 每条是一句可执行的认知（如「回复用简体中文，代码标识符用英文」），禁止抄录原始事件流水；
3. 冲突时以更新的记忆为准；已被取代的旧认知直接丢弃；
4. 总长度控制在 1200 字以内；只输出画像正文，不要任何解释。`;

/** 蒸馏素材（只取所需字段，Prisma 行直接适配，不经 toItem） */
type PersonaSource = Pick<MemoryItem, "id" | "content" | "type" | "strength" | "updatedAt">;

function buildDistillUserPrompt(existing: MemoryItem | null, sources: PersonaSource[]): string {
  const lines = sources.map((m, i) => {
    const content = m.content.length > SOURCE_ITEM_MAX_CHARS
      ? `${m.content.slice(0, SOURCE_ITEM_MAX_CHARS)}…`
      : m.content;
    return `${i + 1}. [${m.type}|强度${m.strength.toFixed(2)}|${m.updatedAt.toISOString().slice(0, 10)}] ${content}`;
  });
  return [
    existing ? `【上一版画像】\n${existing.content}` : "【上一版画像】（空，首次蒸馏）",
    "",
    `【记忆素材 ${sources.length} 条】`,
    ...lines,
  ].join("\n");
}

/** 读当前 active 画像（global scope 唯一一条；多条取最新） */
async function readActivePersona(services: ServiceContainer): Promise<MemoryItem | null> {
  const repo = createMemoryRepository(services);
  const rows = await repo.read({
    types: [MEMORY_TYPES.PERSONA],
    scopes: [MEMORY_SCOPE_GLOBAL],
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function distillPersona(deps: {
  services: ServiceContainer;
  config: AppConfig;
  /** 蒸馏模型；缺省 = reflection.criticModel → llm.defaultModel */
  model?: string;
  /** 跳过防抖（手动触发） */
  force?: boolean;
  /** 测试注入 transport */
  transport?: LlmTransport;
}): Promise<PersonaDistillResult> {
  const { services, config } = deps;
  const repo = createMemoryRepository(services);
  const prisma = services.prisma;

  const existing = await readActivePersona(services);

  // 防抖：间隔内且素材无新增 → 跳过
  if (!deps.force && existing) {
    const elapsed = Date.now() - existing.updatedAt.getTime();
    if (elapsed < PERSONA_DISTILL_MIN_INTERVAL_MS) {
      const freshCount = await prisma.memory.count({
        where: {
          status: "active",
          scope: MEMORY_SCOPE_GLOBAL,
          type: { in: [...PERSONA_SOURCE_TYPES] },
          updatedAt: { gt: existing.updatedAt },
        },
      });
      if (freshCount === 0) {
        return { status: "skipped", reason: "距上次蒸馏不足最小间隔且记忆无新增" };
      }
    }
  }

  // 收集素材：global scope、active、strength 降序
  const sourceRows = await prisma.memory.findMany({
    where: {
      status: "active",
      scope: MEMORY_SCOPE_GLOBAL,
      type: { in: [...PERSONA_SOURCE_TYPES] },
      OR: [{ validTo: null }, { validTo: { gt: new Date() } }],
    },
    orderBy: [{ strength: "desc" }, { updatedAt: "desc" }],
    take: MAX_SOURCE_COUNT,
  });
  if (sourceRows.length < MIN_SOURCE_COUNT) {
    return { status: "no_material", reason: `有效记忆素材 ${sourceRows.length} 条（<${MIN_SOURCE_COUNT}），积累不足` };
  }
  const sources: PersonaSource[] = sourceRows.map((r) => ({
    id: r.id,
    content: r.content,
    type: r.type,
    strength: r.strength,
    updatedAt: r.updatedAt,
  }));

  const model =
    deps.model?.trim() || config.reflection.criticModel.trim() || config.llm.defaultModel;
  const transport = deps.transport ?? createSyncTransport(config, model);

  let content: string;
  try {
    const result = await transport.complete({
      messages: [
        { role: "system", content: DISTILL_SYSTEM_PROMPT },
        { role: "user", content: buildDistillUserPrompt(existing, sources) },
      ],
      tools: [],
      withTools: false,
    });
    content = (result.content ?? "").trim();
  } catch (err) {
    return {
      status: "skipped",
      reason: `蒸馏 LLM 调用失败：${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!content) {
    return { status: "skipped", reason: "蒸馏产物为空，保留现有画像" };
  }
  if (content.length > PERSONA_CONTENT_MAX_CHARS) {
    content = `${content.slice(0, PERSONA_CONTENT_MAX_CHARS)}…`;
  }

  // 写入：已有画像走 supersede 软版本链；首次直接 write
  const writeBase = {
    content,
    type: MEMORY_TYPES.PERSONA,
    scope: MEMORY_SCOPE_GLOBAL,
    strength: 1.0,
    keywords: ["persona", "l3", "画像"],
    tags: ["persona"],
    attribution: "system",
  };
  let personaId: string;
  let previousId: string | undefined;
  if (existing) {
    const updated = await repo.supersedeUpdate({
      id: existing.id,
      ...writeBase,
      actor: { tier: "super" }, // 系统管线按 super 身份写 global
    });
    personaId = updated.memory.id;
    previousId = updated.previousId;
  } else {
    const created = await repo.write(writeBase);
    personaId = created.id;
  }

  return { status: "distilled", personaId, previousId, chars: content.length };
}
