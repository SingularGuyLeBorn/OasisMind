/**
 * Memory 写入侧语义判定（Mem0 四元判定）
 *
 * 在写入记忆前用轻量 LLM 判定：ADD / UPDATE / NOOP / CONFLICT。
 * 解析失败会重试一次；仍失败 / 超时 / 异常一律回退 ADD，永不抛异常。
 *
 * 叶子纪律：不 import loop/reactLoop/agentTools/nativeTools/memoryRepository。
 */

import { z } from "zod";
import type { AppConfig } from "./config.js";
import { resolveAuxiliaryModel } from "./auxiliaryModel.js";
import { resilientChatCompletion } from "./resilientLlmClient.js";

export type MemoryWriteVerdict = {
  action: "ADD" | "UPDATE" | "NOOP" | "CONFLICT";
  targetId?: string;
  reason?: string;
};

interface JudgeInput {
  content: string;
  type: string;
  neighbors: { id: string; content: string }[];
}

const VerdictSchema = z.object({
  action: z.enum(["ADD", "UPDATE", "NOOP", "CONFLICT"]),
  target: z.coerce.number().int().optional(),
  reason: z.string().optional(),
});

const PARSE_ATTEMPTS = 2;

const SYSTEM_PROMPT = `你是记忆写入判官。给定一条【新事实】和若干条【已有记忆】（编号 1..N），判断新事实应如何处理，只输出一行 JSON，不要任何解释：{"action":"ADD|UPDATE|NOOP|CONFLICT","target":编号或0,"reason":"一句话"}。

判定标准：
- NOOP=已有记忆已表达同一事实（语义重复）；
- UPDATE=新事实是某条已有记忆的更新/修正（同一主题、说法变了）；
- CONFLICT=新事实与某条已有记忆矛盾但可能各有时效（需并存对照）；
- ADD=全新事实。
- target 为 0 表示无关联记忆（仅 ADD 用）。`;

function extractJsonBlock(raw: string): string | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return raw.slice(start, end + 1);
}

function normalizeNeighborContent(content: string): string {
  return content.replace(/\r?\n/g, " ").trim().slice(0, 200);
}

async function judgeOnce(
  config: AppConfig,
  model: string,
  userMessage: string,
  timeoutMs: number,
  neighbors: { id: string; content: string }[],
): Promise<MemoryWriteVerdict> {
  const result = await Promise.race([
    resilientChatCompletion({
      config,
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      maxTokens: 150,
      temperature: 0.3,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("记忆写入判定超时")), timeoutMs),
    ),
  ]);

  const raw = typeof result.content === "string" ? result.content : "";
  const block = extractJsonBlock(raw);
  if (!block) {
    throw new Error("未解析到 JSON");
  }
  const rawObj = JSON.parse(block) as Record<string, unknown>;
  const parsed = VerdictSchema.parse({
    ...rawObj,
    action: String(rawObj.action ?? "ADD").toUpperCase(),
  });
  if (parsed.action === "ADD") {
    return { action: "ADD", reason: parsed.reason };
  }
  const targetIndex = parsed.target ?? 0;
  if (targetIndex < 1 || targetIndex > neighbors.length) {
    throw new Error(`${parsed.action} 但 target 越界/缺失`);
  }
  return {
    action: parsed.action,
    targetId: neighbors[targetIndex - 1].id,
    reason: parsed.reason,
  };
}

export async function judgeMemoryWrite(
  config: AppConfig,
  input: JudgeInput,
): Promise<MemoryWriteVerdict> {
  const cfg = config.memory?.writeDedup;
  if (!cfg || cfg.enabled === false) {
    return { action: "ADD" };
  }
  if (input.neighbors.length === 0) {
    return { action: "ADD" };
  }

  const model = resolveAuxiliaryModel(config, {
    configured: cfg.model ?? "auto",
    mainModel: config.llm.defaultModel,
    preference: "lite_free",
  });

  const userMessage = [
    `【新事实】${input.type}: ${input.content.slice(0, 500)}`,
    "【已有记忆】",
    ...input.neighbors.map((n, idx) => `${idx + 1}. id=${n.id} ${normalizeNeighborContent(n.content)}`),
  ].join("\n");

  const timeoutMs = cfg.timeoutMs ?? 4000;
  let lastMessage = "";
  for (let attempt = 1; attempt <= PARSE_ATTEMPTS; attempt++) {
    try {
      return await judgeOnce(config, model, userMessage, timeoutMs, input.neighbors);
    } catch (err) {
      lastMessage = err instanceof Error ? err.message : String(err);
      console.warn(
        `[memoryWriteGate] 判定第 ${attempt}/${PARSE_ATTEMPTS} 次失败：${lastMessage}`,
      );
    }
  }
  console.warn(`[memoryWriteGate] 判定失败，回退 ADD：${lastMessage}`);
  return { action: "ADD" };
}
