/**
 * Native Web 域 — read_image / vision_describe
 */
import fs from "fs";
import path from "path";
import type { AppConfig } from "../../../config.js";
import { downloadImageToTemp, ocrRemoteImage } from "../../../metablog/ocrBridge.js";
import { performOcrFromFile } from "../../../ocrService.js";
import { resilientChatCompletion } from "../../../resilientLlmClient.js";
import { resolveSafePath } from "../../../safePath.js";
import {
  AGENT_TOOL_RESULT_MAX_CHARS,
  LLM_MODEL_IDS,
  resolveModelSupportsVision,
} from "@oasismind/shared";
import type { NativeToolContext } from "../types.js";

function mimeFromExt(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "image/png";
}

function resolveLocalImagePath(config: AppConfig, rawPath: string): string {
  const trimmed = rawPath.trim().replace(/\\/g, "/");
  // /uploads/... → content/uploads/...
  if (trimmed.startsWith("/uploads/")) {
    return resolveSafePath(config, `content/uploads/${trimmed.slice("/uploads/".length)}`);
  }
  return resolveSafePath(config, trimmed);
}

/**
 * 用 vision 模型描述本地图片文件（纯函数，W3 抽出供 persist 侧静默识图复用）。
 * 不依赖 NativeToolContext，只需 config + 绝对路径。
 */
export async function describeImageWithVision(
  config: AppConfig,
  absPath: string,
  mimeType: string,
  prompt: string,
  model: string,
  signal?: AbortSignal,
): Promise<{ text: string; model: string }> {
  const b64 = fs.readFileSync(absPath).toString("base64");
  const dataUrl = `data:${mimeType};base64,${b64}`;
  const result = await resilientChatCompletion({
    config,
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl, detail: "auto" } },
        ],
      },
    ],
    maxTokens: 2048,
    temperature: 0.2,
    signal,
  });
  const text = (result.content ?? "").trim();
  if (!text) throw new Error("Vision 模型未返回可读描述");
  return { text, model };
}

async function readImageWithVision(
  ctx: NativeToolContext,
  absPath: string,
  mimeType: string,
  prompt: string,
  model: string,
): Promise<{ text: string; model: string }> {
  return describeImageWithVision(ctx.config, absPath, mimeType, prompt, model);
}

/** 读图：OCR 或 Vision。输入 path（项目内相对路径）或 http(s)/uploads URL。 */
export async function readImageTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const started = Date.now();
  const pathArg = args.path != null ? String(args.path).trim() : "";
  const urlArg = args.url != null ? String(args.url).trim() : "";
  if (!pathArg && !urlArg) {
    throw new Error("path 与 url 至少提供一个（优先用 browser_screenshot 返回的 path）");
  }

  const language = args.language != null ? String(args.language) : "auto";
  const prompt =
    args.prompt != null && String(args.prompt).trim()
      ? String(args.prompt).trim()
      : "请完整描述这张图片中的可见文字、布局与关键信息。若是截图，优先提取页面标题、正文要点与 UI 状态。";

  let mode = String(args.mode || "auto").toLowerCase() as "ocr" | "vision" | "auto";
  if (mode !== "ocr" && mode !== "vision" && mode !== "auto") mode = "auto";

  const agentModel = ctx.agentSnapshot?.model || "";
  const explicitModel = args.model != null ? String(args.model).trim() : "";
  const visionModel =
    explicitModel ||
    (resolveModelSupportsVision(agentModel) ? agentModel : LLM_MODEL_IDS.DEEPSEEK_VL2);

  if (mode === "auto") {
    mode = resolveModelSupportsVision(explicitModel || agentModel || visionModel) ? "vision" : "ocr";
  }

  // 远程 http(s) URL：vision 先下载临时文件；OCR 走 ocrRemoteImage
  if (urlArg && /^https?:\/\//i.test(urlArg) && !pathArg) {
    if (mode === "vision") {
      const tempPath = await downloadImageToTemp(urlArg);
      try {
        const mimeType = mimeFromExt(tempPath);
        const { text, model } = await readImageWithVision(ctx, tempPath, mimeType, prompt, visionModel);
        return {
          text: text.slice(0, AGENT_TOOL_RESULT_MAX_CHARS),
          textChars: text.length,
          textTruncated: text.length > AGENT_TOOL_RESULT_MAX_CHARS,
          source: "vision" as const,
          mode: "vision",
          model,
          url: urlArg,
          elapsedMs: Date.now() - started,
        };
      } finally {
        fs.unlink(tempPath, () => undefined);
      }
    }
    const ocr = await ocrRemoteImage(urlArg, language);
    if (!ocr.success || !ocr.text) {
      throw new Error(ocr.error || "远程图片 OCR 失败");
    }
    return {
      text: ocr.text.slice(0, AGENT_TOOL_RESULT_MAX_CHARS),
      textChars: ocr.text.length,
      textTruncated: ocr.text.length > AGENT_TOOL_RESULT_MAX_CHARS,
      source: "ocr" as const,
      mode: "ocr",
      engine: ocr.engine,
      url: urlArg,
      elapsedMs: Date.now() - started,
    };
  }

  const absPath = resolveLocalImagePath(ctx.config, pathArg || urlArg);
  if (!fs.existsSync(absPath)) {
    throw new Error(`图片文件不存在: ${pathArg || urlArg}`);
  }
  const mimeType = mimeFromExt(absPath);

  if (mode === "vision") {
    const { text, model } = await readImageWithVision(ctx, absPath, mimeType, prompt, visionModel);
    return {
      text: text.slice(0, AGENT_TOOL_RESULT_MAX_CHARS),
      textChars: text.length,
      textTruncated: text.length > AGENT_TOOL_RESULT_MAX_CHARS,
      source: "vision" as const,
      mode: "vision",
      model,
      path: pathArg || urlArg,
      elapsedMs: Date.now() - started,
    };
  }

  const ocr = await performOcrFromFile(ctx.config, absPath, language);
  if (!ocr.success || !ocr.text) {
    throw new Error(ocr.error || "OCR 失败");
  }
  return {
    text: ocr.text.slice(0, AGENT_TOOL_RESULT_MAX_CHARS),
    textChars: ocr.text.length,
    textTruncated: ocr.text.length > AGENT_TOOL_RESULT_MAX_CHARS,
    source: "ocr" as const,
    mode: "ocr",
    engine: ocr.engine,
    path: pathArg || urlArg,
    elapsedMs: Date.now() - started,
  };
}

/**
 * 外挂视觉理解器默认模型选择顺序（国内优先、免费优先）：
 * 1. env VISION_DESCRIBE_MODEL（显式覆盖）
 * 2. 当前 Agent 模型若支持 vision → 复用（不额外计费切换）
 * 3. 智谱 zhipu provider 配了 key → glm-4.1v-thinking-flash（免费、国内直连、无需代理）★ 国内首选
 * 4. Kimi provider 配了 key → kimi-k2.5（注册送免费额度、国内直连、多模态）
 * 5. Gemini provider 配了 key → gemini-2.0-flash（国外，国内需代理）
 * 6. OpenRouter provider 配了 key → google/gemma-4-26b-a4b-it:free（国外，需代理）
 * 7. deepseek-vl2 兜底（付费）
 */
function resolveDefaultVisionModel(ctx: NativeToolContext): string {
  const explicit = process.env.VISION_DESCRIBE_MODEL?.trim();
  if (explicit) return explicit;
  const agentModel = ctx.agentSnapshot?.model || "";
  if (agentModel && resolveModelSupportsVision(agentModel)) return agentModel;
  const providers = ctx.config.llm.providers;
  if (providers.zhipu?.apiKey?.trim()) return "glm-4.1v-thinking-flash";
  if (providers.kimi?.apiKey?.trim()) return "kimi-k2.5";
  if (providers.gemini?.apiKey?.trim()) return providers.gemini.model || "gemini-2.0-flash";
  if (providers.openrouter?.apiKey?.trim()) return "google/gemma-4-26b-a4b-it:free";
  return LLM_MODEL_IDS.DEEPSEEK_VL2;
}

/**
 * vision_describe — 外挂视觉理解器。
 * 让纯文本模型把图片交给免费多模态模型理解，返回文字描述作为参考。
 * 与 read_image 区别：read_image 偏 OCR/文字提取（auto 优先 OCR）；
 * vision_describe 强制 vision 语义理解/描述/问答，默认用免费多模态模型，不消耗付费额度。
 */
export async function visionDescribeTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const started = Date.now();
  const pathArg = args.path != null ? String(args.path).trim() : "";
  const urlArg = args.url != null ? String(args.url).trim() : "";
  if (!pathArg && !urlArg) {
    throw new Error("path 与 url 至少提供一个（path 优先；url 为 http(s) 或 /uploads/...）");
  }

  const question =
    args.question != null && String(args.question).trim()
      ? String(args.question).trim()
      : "请详细描述这张图片的内容：包含主体对象、场景、布局、可见文字、颜色与关键视觉信息。若是图表/截图，提取关键数据与 UI 状态。";
  const model = args.model != null && String(args.model).trim() ? String(args.model).trim() : resolveDefaultVisionModel(ctx);

  // 远程 http(s) URL：下载到临时文件再走 vision
  if (urlArg && /^https?:\/\//i.test(urlArg) && !pathArg) {
    const tempPath = await downloadImageToTemp(urlArg);
    try {
      const mimeType = mimeFromExt(tempPath);
      const { text, model: usedModel } = await readImageWithVision(ctx, tempPath, mimeType, question, model);
      return {
        description: text.slice(0, AGENT_TOOL_RESULT_MAX_CHARS),
        chars: text.length,
        truncated: text.length > AGENT_TOOL_RESULT_MAX_CHARS,
        model: usedModel,
        url: urlArg,
        elapsedMs: Date.now() - started,
      };
    } finally {
      fs.unlink(tempPath, () => undefined);
    }
  }

  const absPath = resolveLocalImagePath(ctx.config, pathArg || urlArg);
  if (!fs.existsSync(absPath)) {
    throw new Error(`图片文件不存在: ${pathArg || urlArg}`);
  }
  const mimeType = mimeFromExt(absPath);
  const { text, model: usedModel } = await readImageWithVision(ctx, absPath, mimeType, question, model);
  return {
    description: text.slice(0, AGENT_TOOL_RESULT_MAX_CHARS),
    chars: text.length,
    truncated: text.length > AGENT_TOOL_RESULT_MAX_CHARS,
    model: usedModel,
    path: pathArg || urlArg,
    elapsedMs: Date.now() - started,
  };
}
