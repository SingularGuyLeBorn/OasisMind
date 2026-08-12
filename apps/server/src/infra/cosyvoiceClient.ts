/**
 * 阿里云百炼 CosyVoice（DashScope）HTTP 客户端。
 * 覆盖：临时 OSS 上传、声音复刻 CRUD、非实时合成。
 *
 * 凭据：TTS_API_KEY / COSYVOICE_API_KEY / DASHSCOPE_API_KEY / VITE_QWEN_API_KEY
 * 模型默认：TTS_COSYVOICE_MODEL（cosyvoice-v3-flash；复刻音色支持 instruction 语气）
 *
 * 语气铁律（官方）：
 * - cosyvoice-v3-plus 复刻音色：不支持 instruction
 * - cosyvoice-v3-flash / v3.5-* 复刻音色：支持任意自然语言 instruction（≤100 字符计费长度）
 */
import fs from "fs";
import path from "path";

const DEFAULT_BASE = "https://dashscope.aliyuncs.com/api/v1";
const ENROLLMENT_MODEL = "voice-enrollment";
/** 默认 flash：复刻音色才能「愤怒/温柔」；v3-plus 复刻不支持 instruction */
const DEFAULT_MODEL = "cosyvoice-v3-flash";

/**
 * 快捷语气 → instruction（仅糖衣；官方 instruction 可写任意自然语言）。
 * 复刻音色（flash/v3.5）任意指令；系统音色部分需固定格式见音色列表。
 */
export const TTS_TONE_PRESETS = {
  angry: "用愤怒激动的语气说。",
  gentle: "用温柔轻柔的语气说。",
  calm: "用平静沉着的语气说。",
  happy: "用开心愉悦的语气说。",
  sad: "用悲伤低沉的语气说。",
  excited: "用兴奋高昂的语气说。",
  fearful: "用恐惧害怕的语气说。",
  surprised: "用惊讶意外的语气说。",
  disgusted: "用厌恶不屑的语气说。",
  serious: "用严肃认真的语气说。",
  playful: "用俏皮活泼的语气说。",
  whisper: "用轻声耳语的语气说。",
  narrate: "用旁白讲述的语气说。",
} as const;

/** 方言快捷 → instruction（官方示例：请用河南话表达。） */
export const TTS_DIALECT_PRESETS = {
  henan: "请用河南话表达。",
  sichuan: "请用四川话表达。",
  cantonese: "请用广东话表达。",
  dongbei: "请用东北话表达。",
  shanghai: "请用上海话表达。",
  shaanxi: "请用陕西话表达。",
  shandong: "请用山东话表达。",
  tianjin: "请用天津话表达。",
  hunan: "请用湖南话表达。",
  minnan: "请用闽南话表达。",
} as const;

export type TtsTone = keyof typeof TTS_TONE_PRESETS;
export type TtsDialect = keyof typeof TTS_DIALECT_PRESETS;

const SAMPLE_RATES = new Set([8000, 16000, 22050, 24000, 44100, 48000]);

export type CosyVoiceHotWords = {
  /** [{ "天气": "tian1 qi4" }, ...] */
  pronunciation?: Array<Record<string, string>>;
  /** [{ "今天": "金天" }, ...] */
  replace?: Array<Record<string, string>>;
};

export type CosyVoiceSynthOpts = {
  text: string;
  voice: string;
  model?: string;
  /** 语言代码：ja/zh/en/fr/…；会剥离 ja-JP → ja */
  language?: string;
  /** 语速 [0.5, 2.0]，默认 TTS_SPEED 或 1 */
  rate?: number;
  /** 音调 [0.5, 2.0]，默认 1 */
  pitch?: number;
  /** 音量 [0, 100]，默认 50 */
  volume?: number;
  /** 随机种子 [0, 65535]；相同 seed 可复现 */
  seed?: number;
  /** 自然语言指令（方言/情感/角色等，≤100 计费字符）；优先于 tone/dialect */
  instruction?: string;
  /** 快捷语气预设 */
  tone?: string;
  /** 快捷方言预设（与 tone 可叠加，合成一条 instruction） */
  dialect?: string;
  format?: "mp3" | "wav" | "pcm" | "opus";
  sampleRate?: number;
  /** 仅 format=opus 时有效，kbps [6, 510]，默认 32 */
  bitRate?: number;
  /** text 含 SSML 时须 true */
  enableSsml?: boolean;
  /** 热词：纠音 pronunciation / 替换 replace（cosyvoice-v2 不支持） */
  hotWords?: CosyVoiceHotWords;
  /** 过滤 Markdown 标记再合成；官方仅 cosyvoice-v3-flash 复刻音色 */
  enableMarkdownFilter?: boolean;
  /** 嵌入 AIGC 隐性标识（wav/mp3/opus） */
  enableAigcTag?: boolean;
  aigcPropagator?: string;
  aigcPropagateId?: string;
};

export type CosyVoiceListItem = {
  voice_id: string;
  gmt_create?: string;
  gmt_modified?: string;
  status?: string;
};

function looksLikePlaceholderKey(key: string): boolean {
  const k = key.trim().toLowerCase();
  return (
    !k ||
    k.includes("your-") ||
    k.includes("xxx") ||
    k.includes("changeme") ||
    k.includes("placeholder")
  );
}

/**
 * Key 优先级：CosyVoice/DashScope 专用 > 通用 TTS。
 * 跳过明显占位符；TTS_API_KEY 可能是别家格式（如 sk_），勿盖过有效的 COSYVOICE_API_KEY。
 */
export function resolveCosyVoiceApiKey(): string {
  const candidates = [
    process.env.COSYVOICE_API_KEY,
    process.env.DASHSCOPE_API_KEY,
    process.env.TTS_API_KEY,
    process.env.VITE_QWEN_API_KEY,
  ];
  for (const raw of candidates) {
    const key = raw?.trim() || "";
    if (!key || looksLikePlaceholderKey(key)) continue;
    return key;
  }
  throw new Error(
    "未配置 CosyVoice API Key：请在 .env 设置 COSYVOICE_API_KEY 或 DASHSCOPE_API_KEY（TTS_API_KEY 也可，但须为百炼 sk- 密钥）。",
  );
}

export function resolveCosyVoiceModel(override?: string): string {
  return (
    override?.trim() ||
    process.env.TTS_COSYVOICE_MODEL?.trim() ||
    DEFAULT_MODEL
  );
}

/** 复刻音色是否支持 instruction（官方：v3-plus 复刻不支持） */
export function modelSupportsClonedVoiceInstruction(model: string): boolean {
  const m = model.trim().toLowerCase();
  if (!m) return false;
  if (m === "cosyvoice-v3-plus") return false;
  if (m.startsWith("cosyvoice-v3.5-")) return true;
  if (m === "cosyvoice-v3-flash") return true;
  // 未知新模型：放行参数，由 API 裁决
  return true;
}

/**
 * 官方计费长度：汉字/日文汉字/韩文汉字按 2，其它按 1；上限 100。
 * 超长截断并尽量保留句末。
 */
export function truncateInstruction(text: string, maxUnits = 100): string {
  const s = text.trim();
  if (!s) return "";
  let units = 0;
  let out = "";
  for (const ch of s) {
    const u = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(ch) ? 2 : 1;
    if (units + u > maxUnits) break;
    units += u;
    out += ch;
  }
  return out;
}

/** instruction 优先；否则 dialect + tone 拼成一条（截断至官方上限） */
export function resolveTtsInstruction(opts: {
  instruction?: string | null;
  tone?: string | null;
  dialect?: string | null;
}): {
  instruction?: string;
  tone?: TtsTone;
  dialect?: TtsDialect;
  note?: string;
} {
  const notes: string[] = [];
  const rawInst = opts.instruction?.trim() || "";
  if (rawInst) {
    const instruction = truncateInstruction(rawInst);
    if (instruction.length < rawInst.length) {
      notes.push("instruction 超长已截断至官方 100 字符计费上限");
    }
    return { instruction, note: notes[0] };
  }

  const parts: string[] = [];
  let dialect: TtsDialect | undefined;
  let tone: TtsTone | undefined;

  const dialectKey = (opts.dialect?.trim().toLowerCase() || "") as TtsDialect;
  if (dialectKey) {
    const d = TTS_DIALECT_PRESETS[dialectKey];
    if (!d) {
      notes.push(`未知 dialect=${opts.dialect}；可选：${Object.keys(TTS_DIALECT_PRESETS).join("|")}`);
    } else {
      dialect = dialectKey;
      parts.push(d);
    }
  }

  const toneKey = (opts.tone?.trim().toLowerCase() || "") as TtsTone;
  if (toneKey) {
    const t = TTS_TONE_PRESETS[toneKey];
    if (!t) {
      notes.push(`未知 tone=${opts.tone}；可选：${Object.keys(TTS_TONE_PRESETS).join("|")}`);
    } else {
      tone = toneKey;
      parts.push(t);
    }
  }

  if (!parts.length) {
    return notes.length ? { note: notes.join(" ") } : {};
  }
  const merged = truncateInstruction(parts.join(""));
  return {
    instruction: merged,
    tone,
    dialect,
    note: notes.length ? notes.join(" ") : undefined,
  };
}

export function normalizeHotWords(raw?: CosyVoiceHotWords | null): CosyVoiceHotWords | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const pronunciation = Array.isArray(raw.pronunciation)
    ? raw.pronunciation.filter((x) => x && typeof x === "object")
    : undefined;
  const replace = Array.isArray(raw.replace)
    ? raw.replace.filter((x) => x && typeof x === "object")
    : undefined;
  if (!pronunciation?.length && !replace?.length) return undefined;
  return {
    ...(pronunciation?.length ? { pronunciation } : {}),
    ...(replace?.length ? { replace } : {}),
  };
}

export function resolveCosyVoiceBaseUrl(): string {
  const raw =
    process.env.DASHSCOPE_BASE_URL?.trim() ||
    process.env.COSYVOICE_BASE_URL?.trim() ||
    DEFAULT_BASE;
  return raw.replace(/\/+$/, "");
}

/** CosyVoice language_hints 只认 ja/zh/en；ja-JP 会导致回退中文腔 */
export function normalizeLanguageHint(lang?: string | null): string | undefined {
  if (lang == null) return undefined;
  const s = String(lang).trim().toLowerCase();
  if (!s) return undefined;
  const base = s.split(/[-_]/)[0]?.trim();
  return base || undefined;
}

function authHeaders(apiKey: string, extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function parseDashScopeError(res: Response, action: string): Promise<never> {
  const text = await res.text().catch(() => "");
  let detail = text.slice(0, 800);
  try {
    const j = JSON.parse(text) as { message?: string; code?: string; request_id?: string };
    detail = [j.code, j.message, j.request_id].filter(Boolean).join(" · ") || detail;
  } catch {
    /* keep text */
  }
  throw new Error(`${action} 失败（HTTP ${res.status}）：${detail || res.statusText}`);
}

/**
 * 本地文件 → DashScope 临时 OSS（oss://…，约 48h 有效）。
 * create_voice 时须带 X-DashScope-OssResourceResolve: enable。
 */
export async function uploadLocalFileToDashScopeOss(
  absPath: string,
  opts?: { apiKey?: string; model?: string },
): Promise<string> {
  const apiKey = opts?.apiKey || resolveCosyVoiceApiKey();
  const model = opts?.model || ENROLLMENT_MODEL;
  if (!fs.existsSync(absPath)) throw new Error(`音频文件不存在：${absPath}`);

  const base = resolveCosyVoiceBaseUrl();
  const policyUrl = `${base}/uploads?action=getPolicy&model=${encodeURIComponent(model)}`;
  const policyRes = await fetch(policyUrl, {
    method: "GET",
    headers: authHeaders(apiKey),
  });
  if (!policyRes.ok) await parseDashScopeError(policyRes, "获取 DashScope 上传凭证");
  const policyJson = (await policyRes.json()) as {
    data?: {
      policy?: string;
      signature?: string;
      upload_dir?: string;
      upload_host?: string;
      oss_access_key_id?: string;
      x_oss_object_acl?: string;
      x_oss_forbid_overwrite?: string;
    };
  };
  const data = policyJson.data;
  if (!data?.policy || !data.signature || !data.upload_dir || !data.upload_host || !data.oss_access_key_id) {
    throw new Error(`获取上传凭证响应缺字段：${JSON.stringify(policyJson).slice(0, 400)}`);
  }

  const basename = path.basename(absPath).replace(/[^\w.\-]+/g, "_") || "ref.wav";
  const key = `${data.upload_dir}/${Date.now().toString(36)}_${basename}`;
  const buf = fs.readFileSync(absPath);
  const form = new FormData();
  form.append("OSSAccessKeyId", data.oss_access_key_id);
  form.append("Signature", data.signature);
  form.append("policy", data.policy);
  form.append("key", key);
  if (data.x_oss_object_acl) form.append("x-oss-object-acl", data.x_oss_object_acl);
  if (data.x_oss_forbid_overwrite) {
    form.append("x-oss-forbid-overwrite", data.x_oss_forbid_overwrite);
  }
  form.append("success_action_status", "200");
  form.append("file", new Blob([new Uint8Array(buf)]), basename);

  const upRes = await fetch(data.upload_host, { method: "POST", body: form });
  if (!upRes.ok) {
    const t = await upRes.text().catch(() => "");
    throw new Error(`上传参考音频到 DashScope OSS 失败（HTTP ${upRes.status}）：${t.slice(0, 400)}`);
  }
  return `oss://${key}`;
}

async function enrollmentRequest(
  input: Record<string, unknown>,
  opts?: { apiKey?: string; resolveOss?: boolean },
): Promise<Record<string, unknown>> {
  const apiKey = opts?.apiKey || resolveCosyVoiceApiKey();
  const base = resolveCosyVoiceBaseUrl();
  const headers = authHeaders(
    apiKey,
    opts?.resolveOss ? { "X-DashScope-OssResourceResolve": "enable" } : undefined,
  );
  const res = await fetch(`${base}/services/audio/tts/customization`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: ENROLLMENT_MODEL, input }),
  });
  if (!res.ok) await parseDashScopeError(res, `voice-enrollment:${String(input.action)}`);
  const json = (await res.json()) as {
    output?: Record<string, unknown>;
    code?: string;
    message?: string;
  };
  if (json.code && String(json.code).toUpperCase() !== "SUCCESS") {
    throw new Error(`voice-enrollment 业务错误：${json.code} · ${json.message || ""}`);
  }
  return (json.output || {}) as Record<string, unknown>;
}

export async function createClonedVoice(opts: {
  url: string;
  prefix: string;
  targetModel?: string;
  language?: string;
  apiKey?: string;
}): Promise<{ voiceId: string; targetModel: string; requestUrl: string }> {
  const prefix = opts.prefix.trim();
  if (!/^[a-zA-Z0-9]{1,10}$/.test(prefix)) {
    throw new Error("prefix 须为 1–10 位字母或数字（CosyVoice 限制）");
  }
  const targetModel = resolveCosyVoiceModel(opts.targetModel);
  const lang = normalizeLanguageHint(opts.language);
  const resolveOss = opts.url.startsWith("oss://");
  const output = await enrollmentRequest(
    {
      action: "create_voice",
      target_model: targetModel,
      prefix,
      url: opts.url,
      ...(lang ? { language_hints: [lang] } : {}),
    },
    { apiKey: opts.apiKey, resolveOss },
  );
  const voiceId = String(output.voice_id || "").trim();
  if (!voiceId) throw new Error(`create_voice 未返回 voice_id：${JSON.stringify(output).slice(0, 400)}`);
  return { voiceId, targetModel, requestUrl: opts.url };
}

export async function listClonedVoices(opts?: {
  prefix?: string;
  pageIndex?: number;
  pageSize?: number;
  apiKey?: string;
}): Promise<CosyVoiceListItem[]> {
  const output = await enrollmentRequest(
    {
      action: "list_voice",
      ...(opts?.prefix ? { prefix: opts.prefix.trim() } : {}),
      page_index: opts?.pageIndex ?? 0,
      page_size: Math.min(100, Math.max(1, opts?.pageSize ?? 20)),
    },
    { apiKey: opts?.apiKey },
  );
  const list = output.voice_list;
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const row = item as CosyVoiceListItem;
    return {
      voice_id: String(row.voice_id || ""),
      gmt_create: row.gmt_create,
      gmt_modified: row.gmt_modified,
      status: row.status,
    };
  });
}

export async function deleteClonedVoice(voiceId: string, opts?: { apiKey?: string }): Promise<void> {
  const id = voiceId.trim();
  if (!id) throw new Error("voice_id 不能为空");
  await enrollmentRequest({ action: "delete_voice", voice_id: id }, { apiKey: opts?.apiKey });
}

/** 非实时合成 → 下载音频字节 */
export async function synthesizeSpeech(
  opts: CosyVoiceSynthOpts & { apiKey?: string },
): Promise<{
  bytes: Buffer;
  format: string;
  model: string;
  voice: string;
  instruction?: string;
  tone?: TtsTone;
  dialect?: TtsDialect;
  warning?: string;
}> {
  const text = opts.text.trim();
  if (!text) throw new Error("合成文本不能为空");
  const voice = opts.voice.trim();
  if (!voice) throw new Error("voice（音色 id）不能为空");

  const apiKey = opts.apiKey || resolveCosyVoiceApiKey();
  const model = resolveCosyVoiceModel(opts.model);
  const format = (opts.format || "mp3").toLowerCase() as CosyVoiceSynthOpts["format"];
  if (!format || !["mp3", "wav", "pcm", "opus"].includes(format)) {
    throw new Error(`format 须为 mp3|wav|pcm|opus，收到：${opts.format}`);
  }
  const lang = normalizeLanguageHint(opts.language);
  const rate =
    opts.rate != null && Number.isFinite(opts.rate)
      ? Math.min(2, Math.max(0.5, Number(opts.rate)))
      : Number(process.env.TTS_SPEED) || 1.0;
  const pitch =
    opts.pitch != null && Number.isFinite(opts.pitch)
      ? Math.min(2, Math.max(0.5, Number(opts.pitch)))
      : 1.0;
  const volume =
    opts.volume != null && Number.isFinite(opts.volume)
      ? Math.min(100, Math.max(0, Math.round(Number(opts.volume))))
      : 50;
  const sampleRate =
    opts.sampleRate != null && SAMPLE_RATES.has(Number(opts.sampleRate))
      ? Number(opts.sampleRate)
      : 22050;
  if (opts.sampleRate != null && !SAMPLE_RATES.has(Number(opts.sampleRate))) {
    throw new Error(
      `sample_rate 须为 ${[...SAMPLE_RATES].join("|")}，收到：${opts.sampleRate}`,
    );
  }

  const resolved = resolveTtsInstruction({
    instruction: opts.instruction,
    tone: opts.tone,
    dialect: opts.dialect,
  });
  const warnings: string[] = [];
  if (resolved.note) warnings.push(resolved.note);

  let instruction = resolved.instruction;
  if (instruction && !modelSupportsClonedVoiceInstruction(model)) {
    warnings.push(
      `模型 ${model} 的复刻音色不支持语气（instruction/tone/dialect）。请改 TTS_COSYVOICE_MODEL=cosyvoice-v3-flash（或 cosyvoice-v3.5-flash）并用同模型重新 voice_clone。本次已忽略语气参数。`,
    );
    instruction = undefined;
  }

  const input: Record<string, unknown> = {
    text,
    voice,
    format,
    sample_rate: sampleRate,
    volume,
    rate,
    pitch,
  };

  if (opts.seed != null && Number.isFinite(opts.seed)) {
    input.seed = Math.min(65535, Math.max(0, Math.round(Number(opts.seed))));
  }
  if (format === "opus") {
    const br =
      opts.bitRate != null && Number.isFinite(opts.bitRate)
        ? Math.min(510, Math.max(6, Math.round(Number(opts.bitRate))))
        : 32;
    input.bit_rate = br;
  } else if (opts.bitRate != null) {
    warnings.push("bit_rate 仅在 format=opus 时生效，已忽略");
  }
  if (opts.enableSsml) input.enable_ssml = true;
  if (opts.enableMarkdownFilter) input.enable_markdown_filter = true;
  if (opts.enableAigcTag) {
    input.enable_aigc_tag = true;
    if (opts.aigcPropagator?.trim()) input.aigc_propagator = opts.aigcPropagator.trim();
    if (opts.aigcPropagateId?.trim()) input.aigc_propagate_id = opts.aigcPropagateId.trim();
  }
  const hotWords = normalizeHotWords(opts.hotWords);
  if (hotWords) input.hot_words = hotWords;

  // 官方实测：language_hints 与 instruction 同传时，复刻音色语气被吞（音频哈希相同）。
  if (instruction) {
    input.instruction = instruction;
    if (lang) {
      warnings.push(
        `已启用语气/方言，未传 language_hints=${lang}（与 instruction 同传会导致语气失效）`,
      );
    }
  } else if (lang) {
    input.language_hints = [lang];
  }

  const base = resolveCosyVoiceBaseUrl();
  const res = await fetch(`${base}/services/audio/tts/SpeechSynthesizer`, {
    method: "POST",
    headers: authHeaders(apiKey),
    body: JSON.stringify({ model, input }),
  });
  if (!res.ok) await parseDashScopeError(res, "SpeechSynthesizer");

  const meta = {
    format,
    model,
    voice,
    instruction,
    tone: resolved.tone,
    dialect: resolved.dialect,
    warning: warnings.length ? warnings.join(" ") : undefined,
  };

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json") || contentType.includes("text/")) {
    const json = (await res.json()) as {
      output?: { audio?: { url?: string } | string; url?: string };
      code?: string;
      message?: string;
    };
    if (json.code && String(json.code).toUpperCase() !== "SUCCESS") {
      throw new Error(`合成业务错误：${json.code} · ${json.message || ""}`);
    }
    const audioField = json.output?.audio;
    const url =
      (typeof audioField === "string" ? audioField : audioField?.url) ||
      json.output?.url ||
      "";
    if (!url) {
      throw new Error(`合成响应无音频 URL：${JSON.stringify(json).slice(0, 500)}`);
    }
    const audioRes = await fetch(url);
    if (!audioRes.ok) {
      throw new Error(`下载合成音频失败（HTTP ${audioRes.status}）`);
    }
    const ab = await audioRes.arrayBuffer();
    return { bytes: Buffer.from(ab), ...meta };
  }

  const ab = await res.arrayBuffer();
  return { bytes: Buffer.from(ab), ...meta };
}
