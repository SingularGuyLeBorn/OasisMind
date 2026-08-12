/**
 * CosyVoice 语音克隆 / 合成 / 参考音切片。
 * 叶子：cosyvoiceClient + ttsProvider；QQ 发声见 send_qq_voice。
 */
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { z } from "zod";
import {
  createClonedVoice,
  deleteClonedVoice,
  listClonedVoices,
  modelSupportsClonedVoiceInstruction,
  normalizeLanguageHint,
  resolveCosyVoiceModel,
  uploadLocalFileToDashScopeOss,
} from "../../../cosyvoiceClient.js";
import { resolveSafePath } from "../../../safePath.js";
import { pickTtsArgsFromTool, synthesizeToUploads } from "../../../ttsProvider.js";
import { resolveAgentFsPath } from "../fs.js";
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "../types.js";
import { zodParams } from "../zodParams.js";

const execFileAsync = promisify(execFile);

/** CosyVoice 合成可选参数（与官方 HTTP input 对齐；voice_synthesize / send_qq_voice 共用） */
export const cosyVoiceSynthZodFields = {
  language: z.string().describe("可选，zh|en|ja 等短码").optional(),
  rate: z.number().describe("可选，语速 0.5–2").optional(),
  pitch: z.number().describe("可选，音调 0.5–2").optional(),
  volume: z.number().describe("可选，音量 0–100").optional(),
  seed: z.number().describe("可选，随机种子").optional(),
  tone: z.string().describe("可选，angry|gentle|calm|happy 等").optional(),
  dialect: z.string().describe("可选，henan|sichuan|cantonese 等").optional(),
  instruction: z.string().describe("可选，自然语言语气指令").optional(),
  format: z.string().describe("可选，mp3|wav|pcm|opus").optional(),
  sample_rate: z.number().describe("可选，采样率 Hz").optional(),
  bit_rate: z.number().describe("可选，opus 码率").optional(),
  enable_ssml: z.boolean().describe("可选，SSML 时 true").optional(),
  hot_words: z.any().describe("可选，热词对象").optional(),
  enable_markdown_filter: z.boolean().describe("可选，滤 Markdown").optional(),
  enable_aigc_tag: z.boolean().describe("可选，AIGC 标识").optional(),
  aigc_propagator: z.string().describe("可选").optional(),
  aigc_propagate_id: z.string().describe("可选").optional(),
  model: z.string().describe("可选，合成模型").optional(),
};

/** 参考音频：content/ / data/ / voice-clones/ 相对项目根；禁止 .. */
async function resolveLocalAudioAbs(
  ctx: NativeToolContext,
  fileArg: string,
): Promise<{ abs: string; rel: string }> {
  const rel = fileArg.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (!rel) throw new Error("file 不能为空");
  if (rel.includes("..")) throw new Error("路径不允许包含 ..");
  if (/^https?:\/\//i.test(rel)) {
    throw new Error("file 须为本机路径；网络 URL 请用 url 参数");
  }

  if (
    rel.startsWith("content/") ||
    rel.startsWith("data/") ||
    rel.startsWith("workspaces/") ||
    rel.startsWith("config/memories/")
  ) {
    const { abs, relForReturn } = await resolveAgentFsPath(ctx, rel, "read");
    return { abs, rel: relForReturn };
  }

  // voice-clones/ 等项目根目录（历史参考音落点）
  const abs = resolveSafePath(ctx.config, rel);
  if (!fs.existsSync(abs)) {
    throw new Error(`音频文件不存在：${rel}`);
  }
  return { abs, rel };
}

export const voiceDefs: NativeToolDefinition[] = [
  {
    name: "voice_list",
    description:
      "列出阿里云 CosyVoice 已克隆音色（voice_id）。发语音前先查是否已有目标音色，避免重复克隆。" +
      "【可选】prefix 按前缀筛选；pageSize/pageIndex 分页。",
    parameters: zodParams(
      z.object({
        prefix: z
          .string()
          .describe("【可选】音色前缀筛选（创建时的 prefix）。")
          .optional(),
        pageSize: z.number().describe("【可选】每页条数，默认 20，最大 100。").optional(),
        pageIndex: z.number().describe("【可选】页码，从 0 起。").optional(),
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
  {
    name: "voice_clone",
    description:
      "CosyVoice 克隆音色，返回 voice_id。必填 prefix + file|url。之后 send_qq_voice(provider=cosyvoice, voice=…)。语气需 flash/v3.5 模型。",
    parameters: zodParams(
      z.object({
        prefix: z
          .string()
          .describe("【必填】音色名前缀，仅字母数字，最长 10。例 hikari / ishigawa。"),
        file: z
          .string()
          .describe(
            "【与 url 二选一】本机参考音频路径。例 voice-clones/.../ref.wav 或 content/uploads/xxx.wav。",
          )
          .optional(),
        url: z
          .string()
          .describe("【与 file 二选一】公网可访问的音频 URL（http/https）。")
          .optional(),
        language: z
          .string()
          .describe("【可选】样本语种提示：ja/zh/en（不要传 ja-JP）。")
          .optional(),
        target_model: z
          .string()
          .describe(
            "【可选】驱动模型，默认 TTS_COSYVOICE_MODEL / cosyvoice-v3-flash。要语气控制勿用 cosyvoice-v3-plus。",
          )
          .optional(),
      }),
    ),
    concurrencyClass: "A",
    destructive: false,
  },
  {
    name: "voice_delete",
    description: "删除阿里云 CosyVoice 已克隆音色。【必填】voice_id（来自 voice_list / voice_clone）。",
    parameters: zodParams(
      z.object({
        voice_id: z.string().describe("【必填】要删除的 voice_id。"),
      }),
    ),
    concurrencyClass: "A",
    destructive: true,
  },
  {
    name: "voice_synthesize",
    description:
      "CosyVoice 合成音频到 content/uploads/tts/（不发 QQ）。必填 text；发 QQ 用 send_qq_voice。",
    parameters: zodParams(
      z.object({
        text: z.string().describe("【必填】待合成文本；可含 SSML（须 enable_ssml=true）或 LaTeX。"),
        voice: z
          .string()
          .describe("【可选】voice_id；省略则用 TTS_VOICE。")
          .optional(),
        provider: z.string().describe("【可选】固定 cosyvoice。").optional(),
        outPath: z
          .string()
          .describe("【可选】输出相对路径，须在 content/uploads/ 下。")
          .optional(),
        ...cosyVoiceSynthZodFields,
      }),
    ),
    concurrencyClass: "A",
    destructive: false,
  },
  {
    name: "audio_slice",
    description:
      "用本机 ffmpeg 剪切参考音频片段（克隆前取 10–20s 干净段）。" +
      "【必填】file +（endSec 或 durationSec）。输出默认 content/uploads/tts/slice-*.wav。",
    parameters: zodParams(
      z.object({
        file: z.string().describe("【必填】本机音频路径。"),
        startSec: z.number().describe("【可选】起始秒，默认 0。").optional(),
        endSec: z.number().describe("【与 durationSec 二选一】结束秒（绝对时间）。").optional(),
        durationSec: z.number().describe("【与 endSec 二选一】从 startSec 起的时长。").optional(),
        outPath: z
          .string()
          .describe("【可选】输出相对路径，须在 content/uploads/ 下。")
          .optional(),
      }),
    ),
    concurrencyClass: "B",
    destructive: false,
  },
];

const voiceList: NativeToolHandler = async (args) => {
  const items = await listClonedVoices({
    prefix: args.prefix != null ? String(args.prefix) : undefined,
    pageSize: args.pageSize != null ? Number(args.pageSize) : undefined,
    pageIndex: args.pageIndex != null ? Number(args.pageIndex) : undefined,
  });
  return {
    ok: true,
    provider: "cosyvoice",
    model: resolveCosyVoiceModel(),
    count: items.length,
    voices: items,
    note:
      "发语音：send_qq_voice({ provider:\"cosyvoice\", voice: voice_id, text, language:\"ja\", tone:\"gentle\" })",
  };
};

const voiceClone: NativeToolHandler = async (args, ctx) => {
  const prefix = String(args.prefix || "").trim();
  const file = args.file != null ? String(args.file).trim() : "";
  const urlArg = args.url != null ? String(args.url).trim() : "";
  if (!prefix) throw new Error("prefix 必填");
  if (!file && !urlArg) throw new Error("file 与 url 须二选一");
  if (file && urlArg) throw new Error("file 与 url 不要同时传");

  let url = urlArg;
  let localRel: string | undefined;
  if (file) {
    const { abs, rel } = await resolveLocalAudioAbs(ctx, file);
    localRel = rel;
    url = await uploadLocalFileToDashScopeOss(abs);
  } else if (!/^https?:\/\//i.test(url) && !url.startsWith("oss://")) {
    throw new Error("url 须为 http(s) 或 oss://");
  }

  const result = await createClonedVoice({
    url,
    prefix,
    targetModel: args.target_model != null ? String(args.target_model) : undefined,
    language: args.language != null ? String(args.language) : undefined,
  });
  return {
    ok: true,
    provider: "cosyvoice",
    voice_id: result.voiceId,
    target_model: result.targetModel,
    language: normalizeLanguageHint(
      args.language != null ? String(args.language) : undefined,
    ),
    source: localRel || urlArg,
    next:
      "send_qq_voice({ provider:\"cosyvoice\", voice: voice_id, text: \"…\", language: \"ja\", tone: \"gentle\" })",
    toneHint: modelSupportsClonedVoiceInstruction(result.targetModel)
      ? "可用 tone=angry|gentle|calm|happy|sad|excited 或 instruction 控语气。"
      : "当前 target_model 复刻音色无法控愤怒/温柔。请改用 cosyvoice-v3-flash（或 v3.5-*）重新克隆。",
  };
};

const voiceDelete: NativeToolHandler = async (args) => {
  const voiceId = String(args.voice_id || "").trim();
  if (!voiceId) throw new Error("voice_id 必填");
  await deleteClonedVoice(voiceId);
  return { ok: true, deleted: voiceId };
};

const voiceSynthesize: NativeToolHandler = async (args, ctx) => {
  const text = String(args.text || "").trim();
  if (!text) throw new Error("text 必填");
  const result = await synthesizeToUploads(ctx.config, {
    text,
    ...pickTtsArgsFromTool(args),
  });
  return {
    ...result,
    suggestedTool: "send_qq_voice",
    note: "已落盘。发 QQ：send_qq_voice({ file: path }) 或直接带 provider/voice/text/tone 合成发送。",
  };
};

const audioSlice: NativeToolHandler = async (args, ctx) => {
  const file = String(args.file || "").trim();
  if (!file) throw new Error("file 必填");
  const { abs, rel } = await resolveLocalAudioAbs(ctx, file);
  const startSec = args.startSec != null ? Number(args.startSec) : 0;
  if (!Number.isFinite(startSec) || startSec < 0) throw new Error("startSec 须为 >=0 的数字");

  let duration: number | undefined;
  if (args.durationSec != null) {
    duration = Number(args.durationSec);
  } else if (args.endSec != null) {
    const end = Number(args.endSec);
    if (!(end > startSec)) throw new Error("endSec 须大于 startSec");
    duration = end - startSec;
  }
  if (duration == null || !Number.isFinite(duration) || duration <= 0) {
    throw new Error("须提供 endSec 或 durationSec（正数）");
  }

  let outRel = (args.outPath != null ? String(args.outPath) : "").trim().replace(/\\/g, "/");
  if (!outRel) {
    outRel = `content/uploads/tts/slice-${Date.now().toString(36)}.wav`;
  }
  if (!outRel.startsWith("content/uploads/") || outRel.includes("..")) {
    throw new Error("outPath 须落在 content/uploads/ 下");
  }
  const outAbs = path.join(ctx.config.projectRoot, ...outRel.split("/"));
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });

  try {
    await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-ss",
        String(startSec),
        "-i",
        abs,
        "-t",
        String(duration),
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        outAbs,
      ],
      { timeout: 120_000, windowsHide: true, maxBuffer: 2 * 1024 * 1024 },
    );
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; stderr?: string };
    if (e.code === "ENOENT") {
      throw new Error("未找到 ffmpeg：请安装并加入 PATH 后再用 audio_slice。");
    }
    throw new Error(
      `ffmpeg 切片失败：${e.stderr || e.message || String(err)}`.slice(0, 600),
    );
  }

  const st = fs.statSync(outAbs);
  return {
    ok: true,
    source: rel,
    path: outRel,
    bytes: st.size,
    startSec,
    durationSec: duration,
    nextTool: "voice_clone",
    note: `下一步 voice_clone({ prefix: \"…\", file: \"${outRel}\", language: \"ja\" })`,
  };
};

export const voiceHandlers: Record<string, NativeToolHandler> = {
  voice_list: voiceList,
  voice_clone: voiceClone,
  voice_delete: voiceDelete,
  voice_synthesize: voiceSynthesize,
  audio_slice: audioSlice,
};
