/**
 * 文生图：免费默认 Pollinations FLUX；有 OpenRouter key 时可换付费模型。
 * 不走 LLM chat/completions（那是写 prompt 的事）。
 */

import type { AppConfig } from "./config.js";

export type ImageGenProvider = "pollinations" | "openrouter";

export type ImageGenModelInfo = {
  id: string;
  name: string;
  provider: ImageGenProvider;
  free: boolean;
  quality: number;
  description: string;
  available: boolean;
};

export type GeneratedImage = {
  bytes: Buffer;
  mimeType: string;
  modelId: string;
};

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

/** 1×1 PNG，MOCK_LLM / 单测用 */
export const MOCK_PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const POLLINATIONS_MODELS: Omit<ImageGenModelInfo, "available">[] = [
  {
    id: "pollinations/flux",
    name: "FLUX",
    provider: "pollinations",
    free: true,
    quality: 90,
    description: "免费 · 默认最强（Pollinations FLUX）",
  },
  {
    id: "pollinations/flux-realism",
    name: "FLUX Realism",
    provider: "pollinations",
    free: true,
    quality: 82,
    description: "免费 · 更写实",
  },
  {
    id: "pollinations/turbo",
    name: "Turbo",
    provider: "pollinations",
    free: true,
    quality: 55,
    description: "免费 · 更快更糙",
  },
];

/** OpenRouter 目录波动大，这里只放常用付费档；列表接口还会再拉一次 */
const OPENROUTER_CURATED: Omit<ImageGenModelInfo, "available">[] = [
  {
    id: "sourceful/riverflow-v2-fast",
    name: "Riverflow v2 Fast",
    provider: "openrouter",
    free: false,
    quality: 78,
    description: "OpenRouter · 便宜速度快",
  },
  {
    id: "black-forest-labs/flux.2-pro",
    name: "FLUX.2 Pro",
    provider: "openrouter",
    free: false,
    quality: 96,
    description: "OpenRouter · 高质量",
  },
  {
    id: "google/gemini-2.5-flash-image",
    name: "Gemini Flash Image",
    provider: "openrouter",
    free: false,
    quality: 88,
    description: "OpenRouter · 示意图强",
  },
];

export function hasOpenRouterImageKey(config: AppConfig): boolean {
  return !!config.llm?.providers?.openrouter?.apiKey?.trim();
}

export function listBuiltinImageGenModels(config: AppConfig): ImageGenModelInfo[] {
  const or = hasOpenRouterImageKey(config);
  return [
    ...POLLINATIONS_MODELS.map((m) => ({ ...m, available: true })),
    ...OPENROUTER_CURATED.map((m) => ({ ...m, available: or })),
  ];
}

export function resolveDefaultImageGenModel(models: ImageGenModelInfo[]): string {
  const free = models
    .filter((m) => m.free && m.available)
    .sort((a, b) => b.quality - a.quality);
  return free[0]?.id ?? "pollinations/flux";
}

export function resolveImageGenModel(
  config: AppConfig,
  requested?: string,
): ImageGenModelInfo {
  const models = listBuiltinImageGenModels(config);
  const id = requested?.trim();
  if (!id) {
    const def = resolveDefaultImageGenModel(models);
    return models.find((m) => m.id === def) ?? { ...POLLINATIONS_MODELS[0]!, available: true };
  }
  const hit = models.find((m) => m.id === id || m.id === `pollinations/${id}` || m.id === stripOpenRouterPrefix(id));
  if (hit) {
    if (!hit.available) {
      throw new Error(`生图模型「${hit.name}」当前不可用（需要 OpenRouter API Key）`);
    }
    return hit;
  }
  if (id.startsWith("pollinations/")) {
    return {
      id,
      name: id.slice("pollinations/".length),
      provider: "pollinations",
      free: true,
      quality: 70,
      description: "Pollinations",
      available: true,
    };
  }
  if (hasOpenRouterImageKey(config)) {
    return {
      id: stripOpenRouterPrefix(id),
      name: stripOpenRouterPrefix(id),
      provider: "openrouter",
      free: false,
      quality: 70,
      description: "OpenRouter",
      available: true,
    };
  }
  throw new Error(`未知生图模型：${id}`);
}

function stripOpenRouterPrefix(id: string): string {
  return id.startsWith("openrouter/") ? id.slice("openrouter/".length) : id;
}

export function buildPollinationsUrl(prompt: string, pollinationsModel: string): string {
  const clipped = prompt.trim().slice(0, 1500);
  const q = new URLSearchParams({
    model: pollinationsModel,
    width: "1280",
    height: "720",
    nologo: "true",
  });
  return `${POLLINATIONS_BASE}/${encodeURIComponent(clipped)}?${q.toString()}`;
}

function pollinationsModelName(id: string): string {
  return id.startsWith("pollinations/") ? id.slice("pollinations/".length) : id;
}

export async function generateImageBytes(
  config: AppConfig,
  prompt: string,
  requestedModel?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeneratedImage> {
  const text = prompt.trim();
  if (!text) throw new Error("生图 prompt 为空");
  if (process.env.MOCK_LLM === "true") {
    const model = resolveImageGenModel(config, requestedModel);
    return { bytes: MOCK_PNG_1X1, mimeType: "image/png", modelId: model.id };
  }
  const model = resolveImageGenModel(config, requestedModel);
  const run = () =>
    model.provider === "pollinations"
      ? generateViaPollinations(text, pollinationsModelName(model.id), model.id, fetchImpl)
      : generateViaOpenRouter(config, text, model.id, fetchImpl);
  try {
    return await run();
  } catch (first) {
    try {
      return await run();
    } catch (second) {
      throw second instanceof Error ? second : first;
    }
  }
}

async function generateViaPollinations(
  prompt: string,
  pollinationsModel: string,
  modelId: string,
  fetchImpl: typeof fetch,
): Promise<GeneratedImage> {
  const url = buildPollinationsUrl(prompt, pollinationsModel);
  const res = await fetchImpl(url, {
    method: "GET",
    headers: { Accept: "image/*" },
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Pollinations 生图失败 HTTP ${res.status}${body ? `：${body.slice(0, 200)}` : ""}`);
  }
  const mime = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0]!.trim();
  if (!mime.startsWith("image/")) {
    throw new Error(`Pollinations 未返回图片（content-type=${mime}）`);
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length < 32) throw new Error("Pollinations 返回的图片过小");
  return { bytes, mimeType: mime, modelId };
}

function extractOpenRouterImage(json: unknown): { b64?: string; url?: string } {
  const root = json as {
    data?: Array<{ b64_json?: string; url?: string }>;
    choices?: Array<{
      message?: {
        images?: Array<{ image_url?: { url?: string } | string; imageUrl?: { url?: string } }>;
        content?: unknown;
      };
    }>;
  };
  const first = root.data?.[0];
  if (first?.b64_json) return { b64: first.b64_json };
  if (first?.url) return { url: first.url };
  const imgs = root.choices?.[0]?.message?.images ?? [];
  for (const img of imgs) {
    const raw = typeof img.image_url === "string" ? img.image_url : img.image_url?.url ?? img.imageUrl?.url;
    if (!raw) continue;
    if (raw.startsWith("data:")) {
      const b64 = raw.split(",")[1];
      if (b64) return { b64 };
    }
    return { url: raw };
  }
  const content = root.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    const data = content.match(/data:image\/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=]+)/);
    if (data?.[1]) return { b64: data[1] };
    const http = content.match(/https?:\/\/\S+\.(?:png|jpe?g|webp)/i);
    if (http?.[0]) return { url: http[0] };
  }
  return {};
}

async function generateViaOpenRouter(
  config: AppConfig,
  prompt: string,
  modelId: string,
  fetchImpl: typeof fetch,
): Promise<GeneratedImage> {
  const key = config.llm.providers.openrouter?.apiKey?.trim();
  if (!key) throw new Error("未配置 OpenRouter API Key，无法使用该生图模型");
  const base = (config.llm.providers.openrouter?.baseUrl || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const headers = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const genRes = await fetchImpl(`${base}/images/generations`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: modelId,
      prompt,
      size: "1280x720",
    }),
    signal: AbortSignal.timeout(90_000),
  });
  let parsed: unknown = null;
  if (genRes.ok) {
    parsed = await genRes.json();
  } else {
    const chatRes = await fetchImpl(`${base}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!chatRes.ok) {
      const body = await chatRes.text().catch(() => "");
      throw new Error(`OpenRouter 生图失败 HTTP ${chatRes.status}${body ? `：${body.slice(0, 240)}` : ""}`);
    }
    parsed = await chatRes.json();
  }
  const extracted = extractOpenRouterImage(parsed);
  if (extracted.b64) {
    const bytes = Buffer.from(extracted.b64, "base64");
    return { bytes, mimeType: "image/png", modelId };
  }
  if (extracted.url) {
    const imgRes = await fetchImpl(extracted.url, { signal: AbortSignal.timeout(60_000) });
    if (!imgRes.ok) throw new Error(`下载 OpenRouter 图片失败 HTTP ${imgRes.status}`);
    const mime = (imgRes.headers.get("content-type") ?? "image/png").split(";")[0]!.trim();
    return { bytes: Buffer.from(await imgRes.arrayBuffer()), mimeType: mime, modelId };
  }
  throw new Error("OpenRouter 未返回图片数据");
}
