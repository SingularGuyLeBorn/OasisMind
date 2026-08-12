/**
 * TTS 提供方薄封装。当前仅 CosyVoice（env TTS_PROVIDER=cosyvoice）。
 * 合成落盘到 content/uploads/tts/，供 send_qq_voice / 本地预览复用。
 *
 * 官方参数面见：https://help.aliyun.com/zh/model-studio/cosyvoice-tts-http-api
 */
import fs from "fs";
import path from "path";
import type { AppConfig } from "./config.js";
import {
  normalizeHotWords,
  normalizeLanguageHint,
  resolveCosyVoiceModel,
  synthesizeSpeech,
  type CosyVoiceHotWords,
  type CosyVoiceSynthOpts,
  type TtsDialect,
  type TtsTone,
} from "./cosyvoiceClient.js";

export type TtsSynthesizeInput = {
  text: string;
  voice?: string;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  seed?: number;
  instruction?: string;
  tone?: string;
  dialect?: string;
  format?: "mp3" | "wav" | "pcm" | "opus";
  sampleRate?: number;
  bitRate?: number;
  enableSsml?: boolean;
  hotWords?: CosyVoiceHotWords;
  enableMarkdownFilter?: boolean;
  enableAigcTag?: boolean;
  aigcPropagator?: string;
  aigcPropagateId?: string;
  model?: string;
  provider?: string;
  /** 相对 projectRoot 的输出路径；默认 content/uploads/tts/<ts>.mp3 */
  outPath?: string;
};

export type TtsSynthesizeResult = {
  ok: true;
  provider: "cosyvoice";
  path: string;
  absPath: string;
  bytes: number;
  model: string;
  voice: string;
  language?: string;
  instruction?: string;
  tone?: TtsTone;
  dialect?: TtsDialect;
  format: string;
  warning?: string;
};

export function resolveTtsProvider(explicit?: string): "cosyvoice" {
  const p = (explicit || process.env.TTS_PROVIDER || "cosyvoice").trim().toLowerCase();
  if (p !== "cosyvoice") {
    throw new Error(`不支持的 TTS_PROVIDER=${p}；当前仅实现 cosyvoice`);
  }
  return "cosyvoice";
}

export function resolveDefaultTtsVoice(override?: string): string {
  return override?.trim() || process.env.TTS_VOICE?.trim() || "";
}

export function resolveDefaultTtsLanguage(override?: string): string | undefined {
  return normalizeLanguageHint(override || process.env.TTS_LANGUAGE || undefined);
}

/** 从工具 args 抽 CosyVoice 合成字段（voice_synthesize / send_qq_voice 共用） */
export function pickTtsArgsFromTool(args: Record<string, unknown>): Omit<TtsSynthesizeInput, "text"> {
  const formatRaw = args.format != null ? String(args.format).trim().toLowerCase() : "";
  const format =
    formatRaw === "mp3" || formatRaw === "wav" || formatRaw === "pcm" || formatRaw === "opus"
      ? formatRaw
      : undefined;

  let hotWords: CosyVoiceHotWords | undefined;
  if (args.hot_words != null && typeof args.hot_words === "object") {
    hotWords = normalizeHotWords(args.hot_words as CosyVoiceHotWords);
  }

  return {
    voice: args.voice != null ? String(args.voice) : undefined,
    language: args.language != null ? String(args.language) : undefined,
    rate: args.rate != null ? Number(args.rate) : undefined,
    pitch: args.pitch != null ? Number(args.pitch) : undefined,
    volume: args.volume != null ? Number(args.volume) : undefined,
    seed: args.seed != null ? Number(args.seed) : undefined,
    tone: args.tone != null ? String(args.tone) : undefined,
    dialect: args.dialect != null ? String(args.dialect) : undefined,
    instruction: args.instruction != null ? String(args.instruction) : undefined,
    format,
    sampleRate: args.sample_rate != null ? Number(args.sample_rate) : undefined,
    bitRate: args.bit_rate != null ? Number(args.bit_rate) : undefined,
    enableSsml: args.enable_ssml === true || args.enable_ssml === "true",
    hotWords,
    enableMarkdownFilter:
      args.enable_markdown_filter === true || args.enable_markdown_filter === "true",
    enableAigcTag: args.enable_aigc_tag === true || args.enable_aigc_tag === "true",
    aigcPropagator: args.aigc_propagator != null ? String(args.aigc_propagator) : undefined,
    aigcPropagateId: args.aigc_propagate_id != null ? String(args.aigc_propagate_id) : undefined,
    model: args.model != null ? String(args.model) : undefined,
    provider: args.provider != null ? String(args.provider) : undefined,
    outPath: args.outPath != null ? String(args.outPath) : undefined,
  };
}

export async function synthesizeToUploads(
  config: AppConfig,
  input: TtsSynthesizeInput,
): Promise<TtsSynthesizeResult> {
  resolveTtsProvider(input.provider);
  const voice = resolveDefaultTtsVoice(input.voice);
  if (!voice) {
    throw new Error(
      "缺少音色 voice：请传 voice_id（voice_list / voice_clone 返回），或在 .env 设 TTS_VOICE。",
    );
  }
  const language = resolveDefaultTtsLanguage(input.language);
  const format = input.format || "mp3";
  const synthOpts: CosyVoiceSynthOpts = {
    text: input.text,
    voice,
    language,
    rate: input.rate,
    pitch: input.pitch,
    volume: input.volume,
    seed: input.seed,
    instruction: input.instruction,
    tone: input.tone,
    dialect: input.dialect,
    format,
    sampleRate: input.sampleRate,
    bitRate: input.bitRate,
    enableSsml: input.enableSsml,
    hotWords: input.hotWords,
    enableMarkdownFilter: input.enableMarkdownFilter,
    enableAigcTag: input.enableAigcTag,
    aigcPropagator: input.aigcPropagator,
    aigcPropagateId: input.aigcPropagateId,
    model: input.model || resolveCosyVoiceModel(),
  };
  const { bytes, model, instruction, tone, dialect, warning } = await synthesizeSpeech(synthOpts);

  const uploadsTts = path.join(config.uploadDir, "tts");
  fs.mkdirSync(uploadsTts, { recursive: true });

  let rel = (input.outPath || "").trim().replace(/\\/g, "/");
  if (!rel) {
    const tag = tone || dialect || "tts";
    rel = `content/uploads/tts/${tag}-${Date.now().toString(36)}.${format === "pcm" ? "pcm" : format}`;
  }
  if (!rel.startsWith("content/uploads/")) {
    throw new Error(`outPath 须落在 content/uploads/ 下，收到：${rel}`);
  }
  if (rel.includes("..")) throw new Error("outPath 不允许包含 ..");

  const abs = path.join(config.projectRoot, ...rel.split("/"));
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, bytes);

  return {
    ok: true,
    provider: "cosyvoice",
    path: rel,
    absPath: abs,
    bytes: bytes.length,
    model,
    voice,
    language,
    instruction,
    tone,
    dialect,
    format,
    warning,
  };
}
