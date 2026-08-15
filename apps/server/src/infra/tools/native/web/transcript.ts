/**
 * Native Web 域 — video_transcript
 */
import {
  fetchBilibiliPagelistCid,
  fetchBilibiliSubtitleExcerpt,
  fetchBilibiliAiConclusion,
} from "../../../metablog/platform/fetcher.js";
import { YouTubeTranscriptApi } from "youtube-transcript-api-js";
import type { NativeToolContext } from "../types.js";

/** 从 bilibili URL 或纯 bvid 字符串提取 BV 号 */
function extractBvid(input: string): string | null {
  const s = String(input).trim();
  // 纯 BV 号
  const direct = s.match(/^(BV[0-9A-Za-z]{8,})$/);
  if (direct) return direct[1];
  // URL 中提取
  const inUrl = s.match(/\/(BV[0-9A-Za-z]{8,})(?:\/|\?|#|$)/);
  if (inUrl) return inUrl[1];
  // 末尾 BV 号
  const tail = s.match(/(BV[0-9A-Za-z]{8,})$/);
  if (tail) return tail[1];
  return null;
}

/** 从 YouTube URL（watch/youtu.be/shorts/embed/live）或纯 11 位 videoId 提取 ID */
function extractYouTubeId(input: string): string | null {
  const s = String(input).trim();
  // 纯 11 位 videoId
  const direct = s.match(/^([A-Za-z0-9_-]{11})$/);
  if (direct) return direct[1];
  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  // youtu.be/<id>
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    // watch?v=<id>
    const v = url.searchParams.get("v");
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    // /shorts/<id>、/embed/<id>、/live/<id>、/v/<id>
    const m = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
}

/** YouTube 字幕抓取：纯 HTTP 调 YouTube 内部 timedtext 端点，零 API key、零浏览器，本地轻量 */
async function fetchYouTubeTranscript(
  videoId: string,
  maxChars: number,
): Promise<{ transcript: string; title: string; author: string; language: string; note?: string }> {
  const api = new YouTubeTranscriptApi();
  // 优先中英，回退任意可用
  const languages = ["zh-Hans", "zh", "zh-CN", "zh-TW", "en"];
  let fetched;
  try {
    fetched = await api.fetch(videoId, languages, false);
  } catch (err) {
    // 无指定语言字幕时尝试拿任意可用字幕
    try {
      const list = await api.list(videoId);
      const anyTranscript = list.getAllTranscripts()[0];
      if (!anyTranscript) {
        return { transcript: "", title: "", author: "", language: "", note: "该视频没有可用字幕（CC）。可能是无字幕视频、纯音乐、或字幕需登录。可建议用户提供音频文件走 whisper 转写。" };
      }
      fetched = await anyTranscript.fetch(false);
    } catch (err2) {
      const msg = err2 instanceof Error ? err2.message : String(err2);
      return { transcript: "", title: "", author: "", language: "", note: `YouTube 字幕抓取失败：${msg}` };
    }
  }
  const snippets = fetched.snippets || [];
  const fullText = snippets.map((sn) => sn.text).join(" ").replace(/\s+/g, " ").trim();
  const truncated = fullText.length > maxChars;
  const transcript = truncated ? fullText.slice(0, maxChars) : fullText;
  const meta = fetched.metadata;
  return {
    transcript,
    title: meta?.title || "",
    author: meta?.author || "",
    language: fetched.language || fetched.languageCode || "",
    note: truncated ? `字幕已截断到 ${maxChars} 字符（全文 ${fullText.length} 字符）` : undefined,
  };
}

/**
 * video_transcript：给一个 bilibili 或 YouTube 视频链接，抓取字幕逐字稿 + AI 总结。
 * bilibili 复用 metablog 字幕抓取；YouTube 用 youtube-transcript-api-js（纯 HTTP、零 API key、零浏览器，本地轻量）。
 * 用于「视频转文字、生成草稿、逐字稿、内容整理」场景。
 */
export async function videoTranscriptTool(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const urlArg = String(args.url ?? "").trim();
  if (!urlArg) throw new Error("需要 url 参数（bilibili 或 YouTube 视频链接/ID）");
  const maxChars = typeof args.maxChars === "number" && args.maxChars > 0 ? Math.min(args.maxChars, 50000) : 20000;
  const includeSummary = args.includeSummary !== false;
  const started = Date.now();

  // YouTube 分支
  const ytId = extractYouTubeId(urlArg);
  if (ytId) {
    const yt = await fetchYouTubeTranscript(ytId, maxChars);
    return {
      platform: "youtube",
      videoId: ytId,
      transcript: yt.transcript,
      title: yt.title,
      author: yt.author,
      language: yt.language,
      summary: "",
      transcriptChars: yt.transcript.length,
      truncated: yt.transcript.length >= maxChars,
      note: yt.note,
      elapsedMs: Date.now() - started,
    };
  }

  // bilibili 分支（学 BiliNote：有登录态时注入 SESSDATA，字幕更稳）
  const bvid = extractBvid(urlArg);
  if (!bvid) throw new Error(`无法从输入解析 bilibili BV 号或 YouTube 视频 ID：${urlArg}`);
  const { loadCookies, cookiesToHeader } = await import("../../../cookieJar.js");
  const biliCookies = loadCookies("bilibili");
  const biliCookieHeader =
    biliCookies.some((c) => c.name === "SESSDATA" && c.value) ? cookiesToHeader(biliCookies) : null;
  const cid = await fetchBilibiliPagelistCid(bvid, 10000, biliCookieHeader);
  if (!cid) {
    return {
      platform: "bilibili",
      bvid,
      transcript: "",
      summary: "",
      note: "无法获取视频 cid（可能视频不存在或已被删除），未取到字幕。",
      elapsedMs: Date.now() - started,
    };
  }

  const [transcript, summary] = await Promise.all([
    fetchBilibiliSubtitleExcerpt(bvid, cid, 10000, maxChars, biliCookieHeader),
    includeSummary ? fetchBilibiliAiConclusion(bvid, 10000, 4000, biliCookieHeader) : Promise.resolve(""),
  ]);

  if (!transcript && !summary) {
    return {
      platform: "bilibili",
      bvid,
      cid,
      transcript: "",
      summary: "",
      note: "该视频没有可用字幕（CC）或 AI 总结。可能是无字幕视频、纯音乐、或字幕需登录获取。可建议用户提供音频/视频文件走 whisper 转写。",
      elapsedMs: Date.now() - started,
    };
  }

  return {
    platform: "bilibili",
    bvid,
    cid,
    transcript: transcript || "",
    summary: summary || "",
    transcriptChars: transcript.length,
    truncated: transcript.length >= maxChars,
    elapsedMs: Date.now() - started,
  };
}
