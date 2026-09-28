/**
 * 编辑器「生成配图」：上下文（或现成 prompt）→ 生图 → 落盘 uploads。
 * 落盘与 native:generate_illustration 共用编号规则。
 */

import fs from "fs";
import path from "path";
import { TRPCError } from "@trpc/server";
import { DEFAULT_LLM_MODEL } from "@oasismind/shared";
import type { ServiceContainer } from "./serviceContainer.js";
import { getAppConfig } from "./config.js";
import { resilientChatCompletion } from "./resilientLlmClient.js";
import { generateImageBytes } from "./imageGen.js";
import { buildUploadDirSegments as resolveIllustrationSegments } from "./uploadDir.js";

const PROMPT_TIMEOUT_MS = 60_000;
const CTX_SLICE = 2500;

export type EditorIllustrationArgs = {
  before?: string;
  after?: string;
  paragraph?: string;
  selected?: string;
  instruction?: string;
  title?: string;
  garden?: string;
  slug?: string;
  postId?: string;
  draftKey?: string;
  imageModel?: string;
  promptModel?: string;
};

export type EditorIllustrationResult = {
  url: string;
  alt: string;
  prompt: string;
  model: string;
};

export type IllustrationPromptPick = {
  prompt: string | null;
  source: "selected" | "fence" | "llm";
};

export function pickIllustrationPromptSource(input: {
  before?: string;
  after?: string;
  selected?: string;
  instruction?: string;
}): IllustrationPromptPick {
  if (input.instruction?.trim()) return { prompt: null, source: "llm" };
  const selected = input.selected?.trim() ?? "";
  if (selected.length >= 40) return { prompt: selected, source: "selected" };
  const nearby = `${input.before ?? ""}\n${input.after ?? ""}`;
  const fence = nearby.match(/```(?:text|prompt)?\s*\n([\s\S]*?)```/i);
  const body = fence?.[1]?.trim() ?? "";
  if (body.length >= 40) return { prompt: body, source: "fence" };
  return { prompt: null, source: "llm" };
}

function sliceCtx(s: string, fromEnd: boolean): string {
  const t = s ?? "";
  if (t.length <= CTX_SLICE) return t;
  return fromEnd ? t.slice(-CTX_SLICE) : t.slice(0, CTX_SLICE);
}

const PROMPT_SYSTEM = `你是技术文章配图导演。根据上下文写一条给文生图模型的英文 prompt。
【铁律】
- 只输出 prompt 本身，不要解释、不要代码围栏、不要中文寒暄
- 风格：white background, research-paper figure, blue/orange/teal highlights, clean labels, precise arrows, no decorative elements, no watermark
- 内容必须贴合当前小节（公式/架构/对比图），不要泛泛风景
- 若上下文已有可直接给生图模型的英文说明，提炼后输出
- 若用户给了补充说明，优先满足`;

function buildPromptUserMessage(input: EditorIllustrationArgs): string {
  const parts: string[] = [];
  if (input.title || input.garden || input.slug) {
    parts.push(
      `文章：${[input.title && `标题=${input.title}`, input.garden && `花园=${input.garden}`, input.slug && `slug=${input.slug}`]
        .filter(Boolean)
        .join(" · ")}`,
    );
  }
  parts.push("【光标前】");
  parts.push(sliceCtx(input.before ?? "", true) || "（文首）");
  if (input.paragraph?.trim()) {
    parts.push("【当前段】");
    parts.push(input.paragraph.trim());
  }
  if (input.selected?.trim()) {
    parts.push("【选区】");
    parts.push(input.selected.trim());
  }
  parts.push("【光标后】");
  parts.push(sliceCtx(input.after ?? "", false) || "（文末）");
  if (input.instruction?.trim()) {
    parts.push("【用户补充】");
    parts.push(input.instruction.trim());
  }
  parts.push("请只输出英文生图 prompt。");
  return parts.join("\n");
}

export function __buildIllustrationPromptUserForTests(input: EditorIllustrationArgs): string {
  return buildPromptUserMessage(input);
}

function mimeToExt(mime: string): string {
  if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("gif")) return ".gif";
  return ".png";
}

/** 同目录已有 fig-001.png / fig-12.webp → 下一号 */
export function nextFigSerial(existingNames: string[]): number {
  let max = 0;
  for (const n of existingNames) {
    const m = /^fig-(\d+)/i.exec(n);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

export function formatFigFileName(serial: number, ext: string): string {
  const e = ext.startsWith(".") ? ext : `.${ext}`;
  return `fig-${String(serial).padStart(3, "0")}${e}`;
}

export { resolveIllustrationSegments };

export function altFromPrompt(prompt: string, title?: string): string {
  const first = prompt.split(/[.!\n]/)[0]?.trim() ?? "";
  const clipped = (first || title || "illustration").slice(0, 80);
  return clipped.replace(/[\[\]]/g, "");
}

export async function saveGeneratedIllustration(
  services: ServiceContainer,
  input: {
    bytes: Buffer;
    mimeType: string;
    garden?: string;
    postId?: string;
    draftKey?: string;
    agentId?: string;
    uploadDir?: string;
  },
): Promise<{ ok: true; url: string; name: string } | { ok: false; error: string }> {
  const ext = mimeToExt(input.mimeType);
  const uploadDir = input.uploadDir ?? getAppConfig().uploadDir;
  const segments = resolveIllustrationSegments(input);
  let existing: string[] = [];
  if (uploadDir) {
    const destDir = segments.length
      ? path.resolve(uploadDir, ...segments)
      : path.resolve(uploadDir);
    try {
      if (fs.existsSync(destDir)) {
        existing = fs.readdirSync(destDir).filter((n) => /^fig-\d+/i.test(n));
      }
    } catch {
      existing = [];
    }
  }
  const name = formatFigFileName(nextFigSerial(existing), ext);
  const uploaded = await services.file.upload({
    name,
    mimeType: input.mimeType,
    size: input.bytes.length,
    data: input.bytes.toString("base64"),
    garden: input.garden,
    postId: input.postId,
    draftKey: input.postId ? undefined : input.draftKey,
    agentId: input.postId || input.draftKey ? undefined : input.agentId,
    unique: false,
  });
  if (!uploaded.success || !uploaded.data?.url) {
    return { ok: false, error: uploaded.error?.message ?? "配图落盘失败" };
  }
  return { ok: true, url: uploaded.data.url as string, name };
}

export async function generateEditorIllustration(
  services: ServiceContainer,
  input: EditorIllustrationArgs,
): Promise<EditorIllustrationResult> {
  const config = getAppConfig();
  const picked = pickIllustrationPromptSource(input);
  let prompt = picked.prompt?.trim() ?? "";

  if (!prompt) {
    const model = (input.promptModel?.trim() || DEFAULT_LLM_MODEL).trim();
    try {
      const { content } = await resilientChatCompletion({
        config,
        model,
        messages: [
          { role: "system", content: PROMPT_SYSTEM },
          { role: "user", content: buildPromptUserMessage(input) },
        ],
        maxTokens: 400,
        temperature: 0.4,
        enableReasoning: false,
        signal: AbortSignal.timeout(PROMPT_TIMEOUT_MS),
      });
      prompt = (content ?? "").trim().replace(/^```(?:text|prompt)?\s*\n?/, "").replace(/\n?```$/, "").trim();
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `写配图 prompt 失败：${msg}` });
    }
  }

  if (!prompt) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "无法从上下文得到生图 prompt，请先选中说明或写一句补充" });
  }

  let image: Awaited<ReturnType<typeof generateImageBytes>>;
  try {
    image = await generateImageBytes(config, prompt, input.imageModel);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `生图失败：${msg}` });
  }

  const saved = await saveGeneratedIllustration(services, {
    bytes: image.bytes,
    mimeType: image.mimeType,
    garden: input.garden,
    postId: input.postId,
    draftKey: input.postId ? undefined : input.draftKey,
  });
  if (!saved.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: saved.error,
    });
  }

  return {
    url: saved.url,
    alt: altFromPrompt(prompt, input.title),
    prompt,
    model: image.modelId,
  };
}
