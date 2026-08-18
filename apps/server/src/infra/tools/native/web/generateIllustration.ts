/**
 * native:generate_illustration — Agent 文生图，落盘 uploads，返回 Markdown。
 */

import type { LlmToolDefinition } from "../../../llmClient.js";
import { generateImageBytes } from "../../../imageGen.js";
import { altFromPrompt, saveGeneratedIllustration } from "../../../editorIllustration.js";
import type { NativeToolContext } from "../types.js";

export const GENERATE_ILLUSTRATION_TOOL_NAME = "generate_illustration";

export const GENERATE_ILLUSTRATION_LLM_TOOL: LlmToolDefinition = {
  type: "function",
  function: {
    name: GENERATE_ILLUSTRATION_TOOL_NAME,
    description:
      "根据英文 prompt 生成技术文章配图并落盘。返回 url 与可插入的 Markdown。用户要插图/示意图/配图时必须调用本工具，不要用 SVG 凑合，不要编造图片 URL。不传 imageModel 则用最强免费档 pollinations/flux。",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description:
            "给文生图模型的英文 prompt。风格建议：white background, research-paper figure, clean labels, no watermark",
        },
        imageModel: {
          type: "string",
          description:
            "可选。默认 pollinations/flux。免费：pollinations/flux、pollinations/flux-realism、pollinations/turbo。有 OpenRouter key 时可点名付费模型。",
        },
        alt: { type: "string", description: "图片 alt / 图注短句（中文可）" },
        garden: { type: "string", description: "文章所属花园 id（编辑器协写时从上下文带入）" },
        postId: { type: "string", description: "已落盘文章 id" },
        draftKey: { type: "string", description: "未落盘草稿键" },
      },
      required: ["prompt"],
    },
  },
};

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export async function generateIllustrationTool(
  args: Record<string, unknown>,
  ctx: NativeToolContext,
): Promise<unknown> {
  const prompt = str(args.prompt);
  if (!prompt) {
    return { error: "prompt 不能为空", code: "BAD_REQUEST" };
  }

  let image: Awaited<ReturnType<typeof generateImageBytes>>;
  try {
    image = await generateImageBytes(ctx.config, prompt, str(args.imageModel));
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : String(err),
      code: "IMAGE_GEN_FAILED",
      hint: "可换 imageModel=pollinations/turbo 重试，或改写 prompt 后再调一次。",
    };
  }

  const saved = await saveGeneratedIllustration(ctx.services, {
    bytes: image.bytes,
    mimeType: image.mimeType,
    garden: str(args.garden),
    postId: str(args.postId),
    draftKey: str(args.draftKey),
    agentId: ctx.agentSnapshot?.id,
    uploadDir: ctx.config.uploadDir,
  });
  if (!saved.ok) {
    return { error: saved.error, code: "UPLOAD_FAILED" };
  }

  const alt = str(args.alt) || altFromPrompt(prompt, str(args.title));
  return {
    url: saved.url,
    name: saved.name,
    alt,
    prompt,
    model: image.modelId,
    markdown: `![${alt}](${saved.url})`,
    hint: "把 markdown 原样插入文稿，不要改 URL、不要再编造路径。",
  };
}
