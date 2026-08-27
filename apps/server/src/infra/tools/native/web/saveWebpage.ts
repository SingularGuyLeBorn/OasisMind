/**
 * Native Web 域 — save_webpage / download_file
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parsePlatformUrl, isArticleFetchFatalError } from "../../../metablog/index.js";
import { getRefererForUrl } from "../../../metablog/ocrBridge.js";
import { resolveAgentFsPath, assertWriteAllowed } from "../../../writePolicy.js";
import { assertPublicHttpUrl } from "../../../safeHttpUrl.js";
import type { NativeToolContext } from "../types.js";
import { formatReadArticleFatalError } from "./article.js";

const DOWNLOAD_MAX_BYTES = 50 * 1024 * 1024; // 50MB
const DOWNLOAD_DEFAULT_TIMEOUT_MS = 60_000;

function sanitizeDownloadFilename(name: string): string {
  const cleaned = name
    .replace(/[<>:"|?*\x00-\x1f]/g, "_")
    .replace(/[/\\]/g, "_")
    .trim();
  return (cleaned || "download.bin").slice(0, 180);
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  // filename*=UTF-8''... 或 filename="..."
  const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header);
  if (star?.[1]) {
    try {
      return sanitizeDownloadFilename(decodeURIComponent(star[1].trim().replace(/^"|"$/g, "")));
    } catch {
      /* ignore */
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  if (plain?.[1]) return sanitizeDownloadFilename(plain[1].trim());
  return null;
}

/**
 * download_file：按 URL 下载任意文件到 Agent Workspace（或 content/uploads/）。
 * 与 save_webpage 区别：本工具保存原始二进制/附件；save_webpage 存网页正文 HTML/Markdown。
 */
export async function downloadFileTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const url = String(args.url || "").trim();
  if (!url) throw new Error("url 不能为空");
  const parsed = assertPublicHttpUrl(url);

  const started = Date.now();
  const timeoutMs = Math.min(
    Math.max(Number(args.timeoutMs) || DOWNLOAD_DEFAULT_TIMEOUT_MS, 1_000),
    300_000,
  );
  const overwrite = args.overwrite === true;

  let destRel = String(args.path || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  const urlLeaf = path.basename(parsed.pathname) || "download.bin";
  let filename = sanitizeDownloadFilename(decodeURIComponent(urlLeaf));

  if (!destRel) {
    destRel = `downloads/${filename}`;
  } else if (destRel.endsWith("/")) {
    destRel = `${destRel}${filename}`;
  }

  const refererArg = String(args.referer || "").trim();
  const referer = refererArg || getRefererForUrl(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCtx = () => controller.abort();
  if (ctx.signal.aborted) controller.abort();
  else ctx.signal.addEventListener("abort", abortFromCtx, { once: true });
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        ...(referer ? { Referer: referer } : {}),
      },
    });
    if (!res.ok) {
      throw new Error(`下载失败 HTTP ${res.status} ${res.statusText || ""}`.trim());
    }

    const cdName = filenameFromContentDisposition(res.headers.get("content-disposition"));
    // 未指定具体文件名（默认 downloads/ 或目录）时，优先用 Content-Disposition
    if (cdName && (!args.path || String(args.path).trim().endsWith("/"))) {
      filename = cdName;
      if (!args.path || !String(args.path).trim()) {
        destRel = `downloads/${filename}`;
      } else {
        destRel = `${String(args.path).trim().replace(/\\/g, "/").replace(/\/?$/, "/")}${filename}`;
      }
    }

    const contentLength = res.headers.get("content-length");
    if (contentLength && Number(contentLength) > DOWNLOAD_MAX_BYTES) {
      throw new Error(
        `文件过大（Content-Length ${contentLength} 字节），上限 ${DOWNLOAD_MAX_BYTES} 字节（50MB）`,
      );
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > DOWNLOAD_MAX_BYTES) {
      throw new Error(`文件过大（${buf.length} 字节），上限 ${DOWNLOAD_MAX_BYTES} 字节（50MB）`);
    }
    if (buf.length === 0) {
      throw new Error("下载内容为空（0 字节）");
    }

    const { abs, relForReturn } = await resolveAgentFsPath(ctx, destRel, "write");
    if (fs.existsSync(abs) && !overwrite) {
      throw new Error(`目标已存在：${relForReturn}（传 overwrite=true 可覆盖）`);
    }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, buf);

    const contentType = res.headers.get("content-type");
    const isTextish =
      !!contentType &&
      (/^text\//i.test(contentType) ||
        /json|xml|javascript|csv|markdown|yaml/i.test(contentType));

    return {
      ok: true,
      url,
      path: relForReturn,
      bytes: buf.length,
      contentType: contentType || null,
      elapsedMs: Date.now() - started,
      suggestedTool: isTextish ? "read_file" : undefined,
      note: isTextish
        ? "文件已下载；可用 read_file 阅读（长文配合 offset）"
        : "文件已下载到本地（二进制）。默认落在当前 Agent Workspace 的 downloads/；也可指定 content/uploads/…",
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`下载超时（${timeoutMs}ms）：${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    ctx.signal.removeEventListener("abort", abortFromCtx);
  }
}

/**
 * save_webpage：把网页完整保存到本地（HTML + Markdown），再 read_file 读。
 * 解决 read_article 截断、长文分段麻烦的问题——存本地后可反复读、离线读。
 */
export async function saveWebpageTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const url = String(args.url || "").trim();
  if (!url) throw new Error("url 不能为空");
  assertPublicHttpUrl(url);

  const started = Date.now();
  const format = String(args.format || "both") as "html" | "markdown" | "both";
  const timeout = args.timeout !== undefined ? Number(args.timeout) : 30000;

  // 抓取正文（复用 read_article 的抓取链路，含登录态复用）
  const result = await parsePlatformUrl({
    url,
    timeout,
    method: args.method === "playwright" ? "playwright" : undefined,
    embedOcr: false,
    fetchImageFiles: false,
  }).catch((err: unknown) => {
    if (isArticleFetchFatalError(err)) throw formatReadArticleFatalError(url, err);
    throw err;
  });

  const title = (result.title || "untitled").replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 8);
  const dirAbs = path.join(ctx.config.dataDir, "webpages");
  assertWriteAllowed("data/webpages");
  fs.mkdirSync(dirAbs, { recursive: true });

  const saved: { htmlPath?: string; markdownPath?: string } = {};
  const content = result.content ?? "";

  if (format === "html" || format === "both") {
    // 包一层基础 HTML 壳
    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title></head><body><article><pre>${content.replace(/</g, "&lt;")}</pre></article></body></html>`;
    const htmlName = `${hash}-${title}.html`;
    const htmlAbs = path.join(dirAbs, htmlName);
    fs.writeFileSync(htmlAbs, html, "utf-8");
    saved.htmlPath = path.relative(ctx.config.projectRoot, htmlAbs).replace(/\\/g, "/");
  }
  if (format === "markdown" || format === "both") {
    const mdName = `${hash}-${title}.md`;
    const mdAbs = path.join(dirAbs, mdName);
    const md = `# ${title}\n\n> 来源: ${url}\n> 平台: ${result.platform ?? "unknown"}\n\n---\n\n${content}`;
    fs.writeFileSync(mdAbs, md, "utf-8");
    saved.markdownPath = path.relative(ctx.config.projectRoot, mdAbs).replace(/\\/g, "/");
  }

  return {
    url,
    title: result.title,
    author: result.author,
    platform: result.platform,
    method: result.method,
    ...saved,
    contentChars: content.length,
    elapsedMs: Date.now() - started,
    suggestedTool: "read_file",
    suggestedArgs: saved.markdownPath ? { path: saved.markdownPath } : { path: saved.htmlPath },
    note: "网页已保存到本地，用 read_file 读取完整正文（支持 offset 分段读长文）；data/webpages/ 目录下",
  };
}
