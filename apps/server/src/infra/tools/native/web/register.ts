/**
 * Native Web 域 — WEB_DEFS + WEB_HANDLERS + registerWebTools
 */
import { AGENT_TOOL_RESULT_MAX_CHARS } from "@oasismind/shared";
import type { NativeToolDefinition } from "../types.js";
import { registerNativeDomain } from "../registerDomain.js";
import { defaultProjectContent } from "../../toolEnvelope.js";
import { LOGIN_WALL_PROMPT_SECTION } from "../../../promptRuntimeContext.js";
import { academicDefs, academicHandlers } from "./academic.js";
import { webSearch, rssFetchTool, rssDraftPostsTool, articleImportTool } from "./search.js";
import { readArticleTool } from "./article.js";
import { scrapeWebPageTool } from "./scrape.js";
import { browserScreenshotTool, scrollScreenshotTool } from "./screenshot.js";
import { saveWebpageTool, downloadFileTool } from "./saveWebpage.js";
import { readImageTool, visionDescribeTool } from "./readImage.js";
import { videoTranscriptTool } from "./transcript.js";

export { syncSearchEnvFromConfig } from "./search.js";
export { isUnreadableArticlePage, readArticleContentWarning } from "./article.js";

const WEB_DEFS: NativeToolDefinition[] = [
  {
    name: "web_search",
    concurrencyClass: "B",
    // 纯搜索只读（syncSearchEnvFromConfig 只写进程内 env 且幂等）
    description:
      "搜索互联网（MetaBlog smartSearch 多引擎；/sources 信息源启用后 Tavily/SerpAPI 优先 scoped 到信息源域名）。",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索关键词" },
        maxResults: { type: "number", description: "最大结果数，默认 5" },
        engine: {
          type: "string",
          description: "优先引擎：baidu_qianfan|metaso|bocha|tavily|bing_crawler|duckduckgo|searxng|serpapi 等",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "rss_fetch",
    description:
      "抓取指定 RSS/Atom 信息源的最新条目，自动去重。支持 sourceId 或 sourceName。可设置 autoDraft=true 自动生成 Post 草稿。",
    parameters: {
      type: "object",
      properties: {
        sourceId: { type: "string", description: "信息源 ID" },
        sourceName: { type: "string", description: "信息源名称（sourceId 的替代）" },
        maxItems: { type: "number", description: "最大抓取条数，默认 20，最大 50" },
        autoDraft: { type: "boolean", description: "是否自动把新条目生成 Post 草稿" },
        defaultCategory: { type: "string", description: "自动生成草稿时的分类，默认\"信息源\"" },
      },
      required: [],
    },
  },
  {
    name: "rss_draft_posts",
    description: "把已抓取的 RSS 条目转成 Post 草稿。",
    parameters: {
      type: "object",
      properties: {
        sourceId: { type: "string", description: "信息源 ID" },
        itemIds: { type: "array", items: { type: "string" }, description: "InfoSourceItem 的 id 列表" },
        defaultCategory: { type: "string", description: "草稿分类，默认 \"信息源\"" },
      },
      required: ["sourceId", "itemIds"],
    },
  },
  {
    name: "article_import",
    concurrencyClass: "A",
    // 创建文章 + 下载图片：有本地写副作用，但属于可控导入
    description:
      "导入外部文章到本地知识库：给定 URL，抓取正文并把文章里所有图片下载到 content/uploads/imports/，Markdown 图片 URL 改写成本地 /uploads/... 路径，然后创建一篇 Post（默认未发布草稿）。解决 read_article 抓取后原图防盗链/过期变成占位符的问题。长文或图片多时可用 async_task_run 后台执行。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "文章 URL" },
        title: { type: "string", description: "文章标题（默认抓取原标题）" },
        garden: { type: "string", description: "目标花园 id（默认 posts）" },
        slug: { type: "string", description: "文章路径（默认由标题生成）" },
        category: { type: "string", description: "分类（默认 转载）" },
        tags: { type: "array", items: { type: "string" }, description: "标签（默认 [转载]）" },
        published: { type: "boolean", description: "是否直接发布，默认 false（草稿）" },
        method: { type: "string", enum: ["playwright", "direct"], description: "抓取方式：playwright（默认，可渲染 JS/登录墙）或直接 HTTP" },
        timeout: { type: "number", description: "抓取超时毫秒，默认 30000" },
      },
      required: ["url"],
    },
  },
  {
    name: "read_article",
    concurrencyClass: "A",
    // 只读抓取网页正文，无本地写副作用
    description:
      "读取网页文章为 Markdown（MetaBlog readArticle）。支持知乎/微信/小红书/B站/掘金/CSDN/InfoQ/SegmentFault/开源中国/博客园/简书等；小红书会从 SSR imageList 返回 images URL。默认 embedOcr=true：前几张图临时下载 OCR 后嵌进正文（不永久落盘）。OCR 不理想时，对 images[] URL 再用 read_image / vision_describe；多模态模型可直接 vision 读图。长文分段：offset + nextOffset 翻页。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "文章 URL" },
        timeout: { type: "number", description: "超时毫秒，默认 30000" },
        platform: { type: "string", description: "可选平台：zhihu、wechat、xiaohongshu、bilibili 等" },
        method: { type: "string", enum: ["playwright"], description: "强制 Playwright 渲染" },
        embedOcr: { type: "boolean", description: "是否 OCR 嵌入图片文字，默认 true" },
        maxChars: { type: "number", description: `返回正文最大字符数，默认 ${AGENT_TOOL_RESULT_MAX_CHARS}` },
        offset: { type: "number", description: "正文起始字符偏移（用于分段读取长文，默认 0 从头开始）。配合 maxChars 翻页：第一次 offset=0，第二次 offset=上次返回的 offset+contentChars" },
        minChars: { type: "number", description: "可读正文下限，低于且标题像 404 则报错，默认 80" },
      },
      required: ["url"],
    },
    render: (value) => defaultProjectContent(value),
    promptSection: { order: 120, text: LOGIN_WALL_PROMPT_SECTION },
  },
  {
    name: "scrape_web_page",
    concurrencyClass: "B",
    // 只读 Playwright 采集，无本地写副作用
    description: "Playwright 采集网页正文、链接与元数据（MetaBlog scrapeWebPage）。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "目标 URL" },
        timeout: { type: "number", description: "超时毫秒，默认 30000" },
        waitFor: { type: "string", description: "可选 CSS 选择器" },
        extractArticle: { type: "boolean", description: "启发式提取正文，默认 true" },
      },
      required: ["url"],
    },
  },
  {
    name: "browser_screenshot",
    concurrencyClass: "B",
    // 截图落盘到 uploads/screenshots，文件名含时间戳，重跑不覆盖旧图
    description:
      "用 Playwright **无头浏览器**（headless，不弹可见窗口）打开页面并截图（PNG），保存到 content/uploads/screenshots/。返回 path/publicUrl（不含图片字节）；Chat 展开工具结果可直接预览图。视觉确认页面 / 登录墙 / 图表时用；随后用 read_image 读图。需要用户扫码登录时用 platform_login（会弹可见窗口），不要用本工具。纯文字页优先 read_article。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "目标页面 URL（http/https）" },
        timeout: { type: "number", description: "超时毫秒，默认 30000" },
        waitFor: { type: "string", description: "可选 CSS 选择器，出现后再截" },
        fullPage: { type: "boolean", description: "是否整页长截图，默认 false（视口）" },
        width: { type: "number", description: "视口宽度，默认 1280" },
        height: { type: "number", description: "视口高度，默认 800" },
      },
      required: ["url"],
    },
  },
  {
    name: "scroll_screenshot",
    concurrencyClass: "B",
    // 滚动截图落盘到 uploads/screenshots，无本地写副作用（除截图文件）
    description:
      "分段滚动截图（解决 SPA 懒加载/长页 fullPage 截图空白）。每次滚动一个视口高度，等待加载后截一张视口图，返回多张截图路径（按滚动顺序）。适合无限滚动、懒加载长页、需看清整页布局的场景。随后用 read_image 逐张识图或 vision_describe 语义理解。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "目标页面 URL（http/https）" },
        timeout: { type: "number", description: "超时毫秒，默认 30000" },
        scrollSteps: { type: "number", description: "滚动截图次数（1~20，默认 5），每次滚动一个视口高度" },
        scrollDelay: { type: "number", description: "每次滚动后等待加载毫秒（200~5000，默认 800），懒加载页可调大" },
        width: { type: "number", description: "视口宽度，默认 1280" },
        height: { type: "number", description: "视口高度（也是滚动步长），默认 800" },
      },
      required: ["url"],
    },
  },
  {
    name: "save_webpage",
    concurrencyClass: "A",
    // 抓取网页正文存本地，便于反复读/离线读
    description:
      "把网页完整正文保存到本地（data/webpages/ 目录，HTML 和/或 Markdown），再用 read_file 读取。解决 read_article 截断、长文分段麻烦的问题——存本地后可反复读、离线读、用 read_file offset 分段读长文。复用 read_article 的抓取链路（含登录态复用）。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "文章 URL" },
        format: { type: "string", enum: ["html", "markdown", "both"], description: "保存格式，默认 both（同时存 HTML + Markdown）" },
        timeout: { type: "number", description: "超时毫秒，默认 30000" },
        method: { type: "string", enum: ["playwright"], description: "强制 Playwright 渲染（SPA 页用）" },
      },
      required: ["url"],
    },
    render: (value) => defaultProjectContent(value),
  },
  {
    name: "download_file",
    concurrencyClass: "A",
    description:
      "按 URL 下载任意文件到本地（PDF/zip/图片/二进制等）。默认落到当前 Agent Workspace 的 downloads/<文件名>；也可指定 path（相对 Workspace，或 content/uploads/…）。微信/知乎/小红书等 CDN 会自动带 Referer（也可手动传 referer）。文章成片批量落图优先用 article_material_pack。上限 50MB。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "文件 URL（http/https）" },
        path: {
          type: "string",
          description:
            "保存路径。默认 downloads/<从 URL 或 Content-Disposition 推断的文件名>。可传文件路径（如 downloads/report.pdf）或目录（以 / 结尾，如 content/uploads/）。content/ 仅允许 uploads/",
        },
        referer: {
          type: "string",
          description: "可选 Referer；不传时对 mmbiz/zhimg 等 CDN 自动填充，避免防盗链 403",
        },
        overwrite: { type: "boolean", description: "目标已存在时是否覆盖，默认 false" },
        timeoutMs: { type: "number", description: "超时毫秒，默认 60000，上限 300000" },
      },
      required: ["url"],
    },
  },
  {
    name: "read_image",
    concurrencyClass: "B",
    // OCR/vision 只读，无本地写副作用
    description:
      "读取图片中的文字或视觉内容。path 用 browser_screenshot 返回的相对路径；也可传 http(s) 图片 URL。mode=ocr|vision|auto（默认 auto：当前模型支持 vision 则识图，否则 OCR）。结果只回文本。",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "项目内相对路径，如 content/uploads/screenshots/xxx.png；也可用 /uploads/...",
        },
        url: { type: "string", description: "http(s) 图片 URL，或 /uploads/...（与 path 二选一）" },
        mode: {
          type: "string",
          enum: ["ocr", "vision", "auto"],
          description: "ocr=本地/云 OCR；vision=多模态识图；auto=按模型能力选择",
        },
        language: { type: "string", description: "OCR 语言：auto|chs|en 等，默认 auto" },
        prompt: { type: "string", description: "vision 模式下的识图提示（可选）" },
        model: { type: "string", description: "vision 模型 id（可选；默认 Agent 模型或 deepseek-vl2）" },
      },
      required: [],
    },
  },
  {
    name: "vision_describe",
    concurrencyClass: "B",
    // 只读：调多模态模型识图，无本地写副作用
    description:
      "外挂视觉理解器：把图片交给多模态模型做语义理解，返回文字描述。专为纯文本模型设计——当前 Agent 不支持 vision 时，用免费多模态模型（Gemini/OpenRouter 免费层）代为看图，结果作为参考文本回灌给当前模型。与 read_image 区别：read_image 偏 OCR 文字提取（auto 优先 OCR）；vision_describe 强制 vision 语义理解/描述/问答，默认免费模型不消耗付费额度。用法：browser_screenshot 后想理解页面/图表/UI，或本地/URL 图片需语义描述时调用。",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "项目内相对路径，如 content/uploads/screenshots/xxx.png；也可用 /uploads/...",
        },
        url: { type: "string", description: "http(s) 图片 URL，或 /uploads/...（与 path 二选一，path 优先）" },
        question: {
          type: "string",
          description: "想让视觉模型回答的问题/聚焦点。默认整体描述；可指定如「提取图中所有文字」「这张图表的趋势是什么」「描述 UI 当前状态」",
        },
        model: {
          type: "string",
          description: "视觉模型 id（可选；默认按 Gemini→OpenRouter 免费多模态→deepseek-vl2 顺序选择，可用 env VISION_DESCRIBE_MODEL 覆盖）",
        },
      },
      required: [],
    },
  },
  {
    name: "video_transcript",
    concurrencyClass: "B",
    description:
      "视频字幕逐字稿：bilibili / YouTube 抓官方 CC（+ bilibili AI 总结）。有字幕时优先用本工具。无字幕/空 transcript 时改走本地 STT：video_notes（或 media_download → audio_transcribe，需本机 faster-whisper + yt-dlp）。长视频用 async_task_run。结果可 post_create 成文。",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "视频链接或 ID：bilibili（如 https://www.bilibili.com/video/BV1xx... 或 BV1xx...）、YouTube（如 https://www.youtube.com/watch?v=xxxx 或 https://youtu.be/xxxx 或纯 11 位 videoId）",
        },
        maxChars: {
          type: "number",
          description: "字幕逐字稿最大字符数，默认 20000，上限 50000",
        },
        includeSummary: {
          type: "boolean",
          description: "是否包含 bilibili AI 总结（仅 bilibili 有效），默认 true",
        },
      },
      required: ["url"],
    },
    render: (value) => defaultProjectContent(value),
  },
  ...academicDefs,
];

const WEB_HANDLERS = {
  web_search: webSearch,
  rss_fetch: rssFetchTool,
  rss_draft_posts: rssDraftPostsTool,
  read_article: readArticleTool,
  article_import: articleImportTool,
  scrape_web_page: scrapeWebPageTool,
  browser_screenshot: browserScreenshotTool,
  scroll_screenshot: scrollScreenshotTool,
  save_webpage: saveWebpageTool,
  download_file: downloadFileTool,
  read_image: readImageTool,
  vision_describe: visionDescribeTool,
  video_transcript: videoTranscriptTool,
  ...academicHandlers,
};

export function registerWebTools(): void {
  registerNativeDomain(WEB_DEFS, WEB_HANDLERS);
}
