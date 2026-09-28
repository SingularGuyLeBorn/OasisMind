/**
 * Memory 检索查询改写（P0-01）
 *
 * 把用户消息改写成 3~6 个 FTS 关键词/短句，提升长期记忆召回质量。
 * 失败/超时时自动回退到旧行为（原文 80 字符截断），永不再抛异常。
 *
 * 纪律：叶子模块；不依赖 loop/reactLoop/agentTools/nativeTools。
 */

import type { AppConfig } from "./config.js";
import { resolveAuxiliaryModel } from "./auxiliaryModel.js";
import { resilientChatCompletion } from "./resilientLlmClient.js";

const REWRITE_LRU_LIMIT = 200;

const rewriteCache = new Map<string, { value: string; at: number }>();

function normalizeRewritten(raw: string): string {
  return raw
    .replace(/\r?\n+/g, " ")
    .replace(/[""']/g, "")
    .trim();
}

function pruneOldestIfNeeded(): void {
  if (rewriteCache.size < REWRITE_LRU_LIMIT) return;
  let oldestKey: string | undefined;
  let oldestAt = Number.POSITIVE_INFINITY;
  for (const [key, entry] of rewriteCache.entries()) {
    if (entry.at < oldestAt) {
      oldestAt = entry.at;
      oldestKey = key;
    }
  }
  if (oldestKey !== undefined) rewriteCache.delete(oldestKey);
}

function fallbackKeyword(userText: string): string {
  return userText.slice(0, 80).trim();
}

const SYSTEM_PROMPT = `你是检索查询改写器。把用户消息改写成 3~6 个用于全文检索的关键词或短句，用空格分隔，只输出这些词，不要输出任何解释、编号、标点列表。优先保留：专有名词、报错信息、工具名、文件名、技术术语；去掉：语气词、客套话、指代词。`;

/**
 * 改写用户消息为 FTS 检索关键词。
 *
 * - 若配置禁用或输入为空，回退原文 80 字符截断。
 * - LRU 缓存：同一 userText 原文只触发一次 LLM 调用。
 * - 任何异常/超时/空输出/超长输出都回退并 console.warn，不抛错。
 */
export async function rewriteMemoryQuery(config: AppConfig, userText: string): Promise<string> {
  const cfg = config.memory?.queryRewrite;
  if (!cfg || cfg.enabled === false) {
    return fallbackKeyword(userText);
  }
  const trimmed = userText.trim();
  if (!trimmed) return fallbackKeyword(userText);

  const cached = rewriteCache.get(trimmed);
  if (cached) {
    cached.at = Date.now();
    return cached.value;
  }

  const model = resolveAuxiliaryModel(config, {
    configured: cfg.model ?? "auto",
    mainModel: config.llm.defaultModel,
    preference: "lite_free",
  });

  const timeoutMs = cfg.timeoutMs ?? 3000;

  try {
    const result = await Promise.race([
      resilientChatCompletion({
        config,
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: trimmed.slice(0, 500) },
        ],
        maxTokens: 100,
        temperature: 0.3,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("查询改写超时")), timeoutMs),
      ),
    ]);

    const raw = typeof result.content === "string" ? result.content : "";
    const rewritten = normalizeRewritten(raw);
    if (!rewritten) {
      console.warn("[memoryQueryRewrite] LLM 返回空改写，回退原文截断");
      return fallbackKeyword(userText);
    }
    if (rewritten.length > 200) {
      console.warn("[memoryQueryRewrite] 改写结果过长，回退原文截断");
      return fallbackKeyword(userText);
    }

    pruneOldestIfNeeded();
    rewriteCache.set(trimmed, { value: rewritten, at: Date.now() });
    return rewritten;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[memoryQueryRewrite] 改写失败，回退原文截断：${reason}`);
    return fallbackKeyword(userText);
  }
}

/** 单测用：清空改写缓存 */
export function __resetMemoryQueryRewriteCache(): void {
  rewriteCache.clear();
}
