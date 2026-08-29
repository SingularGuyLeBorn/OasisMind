/**
 * Mock Native 叶子 —— 只换外网/副作用工具的 canned 结果。
 * 校验、权限、回滚、cooperative 超时仍走 toolPipeline 真路径。
 *
 *   MOCK_NATIVE_TOOLS=true
 *
 * spawn_subagent / async_task_run / browser_screenshot 不 mock——
 * 必须真实建子 / 真投递 / 真截图超时（DSH-E2E-4 禁止造假 TIMEOUT）。
 * 未覆盖的工具走真实实现。
 */

import type { NativeToolContext } from "./nativeTools.js";

type MockHandler = (
  args: Record<string, unknown>,
  ctx: NativeToolContext,
) => unknown | Promise<unknown>;

const MOCK_HANDLERS: Record<string, MockHandler> = {
  web_search: (args) => {
    const query = String(args.query ?? "");
    // [OM-FREEPLAY] chat-mock 既有「全文已存」断言要求 JSON.stringify(value) > thresholdChars(4000) 才 compacted。
    // 400 次垫长只有 3945 字，差 55；不放宽断言，只对含 OasisMind 的查询垫到稳超阈值。
    const pad = /oasismind/i.test(query) ? `\n${"本地优先数字花园。".repeat(500)}` : "";
    return {
      query,
      engine: "mock",
      results: [
        {
          title: "OasisMind - 本地优先的智能知识管理平台",
          url: "https://example.com/oasismind",
          snippet: `Mock 搜索结果：${query}。OasisMind 是一个以 Markdown 为原子、AI 为引擎的数字花园。${pad}`,
        },
        {
          title: "Mock Secondary Result",
          url: "https://example.com/mock-secondary",
          snippet: "Mock 次要结果，仅用于 E2E 测试。",
        },
      ],
      elapsedMs: 5,
    };
  },

  read_article: (args) => {
    const url = String(args.url ?? "");
    // 模拟失败场景：URL 含 broken / 404 时返回 error 字段
    if (/broken|404|fail/i.test(url)) {
      return {
        url,
        title: "",
        content: "",
        chars: 0,
        error: "Mock 读取失败：404 Not Found",
        elapsedMs: 5,
      };
    }
    if (/dsh-e2e-3|long-article|读取长文/i.test(url)) {
      const content = `${"DSH-E2E-3 长文段落。".repeat(2000)}`;
      return {
        url,
        title: "DSH-E2E-3 长文标题",
        content,
        chars: content.length,
        nextOffset: content.length,
        totalChars: content.length,
        elapsedMs: 8,
      };
    }
    return {
      url,
      title: "Mock 文章标题",
      content: "Mock 文章正文内容。这是一段用于 E2E 测试的占位文本，不依赖真实网络。",
      chars: 64,
      elapsedMs: 5,
    };
  },

  scrape_web_page: (args) => ({
    url: String(args.url ?? ""),
    title: "Mock Page",
    content: "Mock scrape content.",
    links: [{ text: "Mock Link", href: "https://example.com" }],
    elapsedMs: 5,
  }),

  read_image: (args) => ({
    text: "Mock OCR/vision text from screenshot.",
    textChars: 36,
    textTruncated: false,
    source: String(args.mode || "auto") === "vision" ? "vision" : "ocr",
    mode: String(args.mode || "ocr"),
    engine: "mock",
    path: args.path != null ? String(args.path) : undefined,
    url: args.url != null ? String(args.url) : undefined,
    elapsedMs: 3,
  }),

  read_file: (args) => ({
    path: String(args.path ?? ""),
    content: "Mock file content for E2E testing.",
    chars: 32,
    elapsedMs: 1,
  }),

  write_file: (args) => ({
    path: String(args.path ?? ""),
    bytes: String(args.content ?? "").length,
    elapsedMs: 1,
  }),

  post_list: (args) => ({
    items: [
      { id: "mock-post-1", title: "Mock 文章 A", slug: "mock-a", updatedAt: new Date().toISOString() },
      { id: "mock-post-2", title: "Mock 文章 B", slug: "mock-b", updatedAt: new Date().toISOString() },
    ],
    total: 2,
    page: Number(args.page ?? 1),
    pageSize: Number(args.pageSize ?? 10),
    elapsedMs: 2,
  }),

  post_create: (args) => ({
    id: "mock-created-post",
    title: String(args.title ?? "untitled"),
    slug: "mock-created",
    garden: String(args.garden ?? "posts"),
    elapsedMs: 3,
  }),

  file_delete: (args) => ({
    path: String(args.path ?? ""),
    deleted: true,
    soft: true,
    elapsedMs: 1,
  }),

  session_compact: () => ({
    compacted: true,
    summaryChars: 128,
    elapsedMs: 2,
  }),

  run_shell: (args) => ({
    command: String(args.command ?? ""),
    stdout: "mock-shell-ok",
    stderr: "",
    exitCode: 0,
    elapsedMs: 2,
  }),

  video_transcript: (args) => ({
    url: String(args.url ?? ""),
    title: "Mock 视频标题",
    hasCaptions: true,
    transcript: "Mock 字幕逐字稿：扩散采样从噪声逐步变成样本，不要编台词。",
    summary: "有字幕，已转写。",
    elapsedMs: 8,
  }),

  browser_login_status: (args) => ({
    platform: String(args.platform ?? "zhihu"),
    loggedIn: true,
    via: "mock-storageState",
    message: "Mock：zhihu 已登录（loggedIn=true），可直接 read_article。",
    elapsedMs: 2,
  }),

  list_directory: (args) => ({
    path: String(args.path ?? ""),
    entries: [
      { name: "shot-raw.jpg", type: "file", bytes: 4_200_000 },
      { name: "demo.gif", type: "file", bytes: 6_100_000 },
    ],
    elapsedMs: 1,
  }),

  article_material_pack: (args) => ({
    url: String(args.url ?? ""),
    packDir: "article-packs/e2e-wechat",
    articleMd: "article.md",
    imagesJson: "images.json",
    beatsJson: "beats.json",
    imageCount: 2,
    elapsedMs: 6,
  }),

  article_video_compose: (args) => ({
    packDir: String(args.packDir ?? ""),
    compositionId: String(args.compositionId ?? "PpoClip"),
    registered: true,
    vizFence: "```viz\ncomposition: PpoClip\ntitle: E2E 短片\n```",
    elapsedMs: 8,
  }),
};

/**
 * 检查某个 native 工具是否在 Mock 模式下被覆盖。
 */
export function hasMockNativeTool(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(MOCK_HANDLERS, name);
}

/**
 * 执行 Mock native 工具。调用前应先 hasMockNativeTool 校验。
 */
export async function executeMockNativeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: NativeToolContext,
): Promise<unknown> {
  const handler = MOCK_HANDLERS[name];
  if (!handler) {
    throw new Error(`Mock native 工具 "${name}" 未注册`);
  }
  const started = Date.now();
  const raw = await Promise.resolve(handler(args, ctx));
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.elapsedMs !== "number") {
      return { ...obj, elapsedMs: Date.now() - started };
    }
  }
  return raw;
}
