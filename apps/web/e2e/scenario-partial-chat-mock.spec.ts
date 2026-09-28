/**
 * 场景 14–20 / A–D / E Chat：落库、派工条、本地模型、Inbox、视频、登录读文、Goal、简报、专题、压图、成片工具卡。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL, trpcQuery, trpcMutate } from "./helpers/trpcE2e";
import {
  openFreshChat,
  sendChatMessage,
  waitForSessionIdle,
  waitForStreamingComplete,
} from "./helpers/mockChatFixture";
import {
  cleanupInboxItem,
  createE2eInboxItem,
  forceCleanupPost,
} from "./helpers/e2eContent";
import {
  articleBody,
  editorAcceptButton,
  postUrl,
  saveLastAssistantAsPost,
  shortenSelectionButton,
  sourceModeButton,
  sourceTextarea,
  waitForStandingGoal,
  runEditorShorten,
} from "./helpers/partialScenarioUi";

test.describe("场景 14–E Chat Mock", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("14 Chat 写入知识库：对话框成文可打开；工具路径禁止 write_file", async ({ page }) => {
    const stamp = Date.now();
    await openFreshChat(page);
    await sendChatMessage(page, "请简短回复，给一段可落库的 DDPM 采样总结。");
    await waitForStreamingComplete(page);

    const href = await saveLastAssistantAsPost(page, `E2E 落库 ${stamp}`);
    await page.getByTestId("save-message-as-post-open").or(page.getByRole("link", { name: "打开文章" })).click();
    await expect(page.getByPlaceholder("标题")).toHaveValue(`E2E 落库 ${stamp}`, { timeout: 15_000 });
    const opened = new URL(href, "http://local");
    const slug = decodeURIComponent(opened.pathname.replace(/^\/posts\//, ""));
    const garden = opened.searchParams.get("garden") ?? "posts";
    const saved = await trpcQuery<{ id: string }>("post.getBySlug", { slug, garden });
    await forceCleanupPost(saved.id);

    await openFreshChat(page);
    await sendChatMessage(page, "把这段保存成知识库文章：DDPM 采样总结。");
    await expect(page.locator('[data-testid="tool-pill"][data-tool="post_create"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="write_file"]')).toHaveCount(0);
    await expect(page.getByText("已写入知识库").first()).toBeVisible({ timeout: 15_000 });
  });

  test("15 同时派两个资料员：派工条出现且可打开运行栏", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(page, "同时派两个资料员：一个查论文，一个查博客，都非阻塞。");
    await expect(page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]').first()).toBeVisible({
      timeout: 20_000,
    });
    await expect
      .poll(async () => page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]').count(), {
        timeout: 20_000,
      })
      .toBeGreaterThanOrEqual(2);
    await expect(page.getByTestId("chat-dispatch-strip")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("chat-dispatch-strip").click();
    await expect(page.getByTestId("left-runtime-panel")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("已派两个资料员").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);
  });

  test("16 本地模型菜单可见；切模型后同会话历史还在；先别上网不搜", async ({ page }) => {
    await openFreshChat(page);
    await page.getByTestId("chat-model-menu-trigger").first().click();
    await expect(page.getByTestId("chat-model-menu")).toBeVisible();
    await page.getByTestId("chat-model-menu-local").hover();
    await expect(page.getByTestId("chat-model-menu-local-panel")).toBeVisible();
    await expect(page.getByTestId("chat-model-menu-local-panel")).toContainText(
      /未发现本地模型|未连接|探测失败|ollama/i,
    );
    await page.getByTestId("chat-model-option-deepseek-v4-pro").click();
    await sendChatMessage(page, "把下面乱笔记整理成大纲，先别上网。私密笔记：采样步数不要外传。");
    await waitForStreamingComplete(page);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="web_search"]')).toHaveCount(0);
    await expect(page.getByText("本地整理大纲").first()).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("chat-model-menu-trigger").first().click();
    await page.getByTestId("chat-model-option-deepseek-v4-flash").click();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "先别上网" })).toBeVisible();
    await expect(page.getByText("本地整理大纲").first()).toBeVisible();
  });

  test("17 Inbox 未处理条目蒸馏成文，草稿可打开且保留来源链接", async ({ page }) => {
    const stamp = Date.now();
    const keyword = `e2e-inbox-${stamp}`;
    const ids: string[] = [];
    const postIds: string[] = [];
    try {
      for (let i = 1; i <= 3; i++) {
        const item = await createE2eInboxItem({
          title: `${keyword} 链接${i}`,
          url: `https://example.com/${keyword}-${i}`,
          externalId: `${keyword}-${i}`,
          content: `正文 ${keyword} ${i} 来源 https://example.com/${keyword}-${i}`,
        });
        ids.push(item.id);
      }

      await page.goto("/inbox");
      await expect(page.getByRole("heading", { name: "知识收件箱" })).toBeVisible({ timeout: 20_000 });
      await page.getByPlaceholder("搜索标题/摘要/链接/标签…").fill(keyword);
      await page.getByPlaceholder("搜索标题/摘要/链接/标签…").press("Enter");
      await expect(page.getByText(keyword).first()).toBeVisible({ timeout: 15_000 });

      await openFreshChat(page);
      await sendChatMessage(
        page,
        `把 Inbox 里未处理的 ${keyword} 三条链接抓正文，蒸馏成一篇「本周阅读」草稿进 knowledge，标签加 周刊。`,
      );
      await expect(page.locator('[data-testid="tool-pill"][data-tool="inbox_list"]')).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.locator('[data-testid="tool-pill"][data-tool="inbox_distill"]')).toBeVisible({
        timeout: 25_000,
      });
      await waitForSessionIdle(page);

      for (const id of ids) {
        const item = await trpcQuery<{ distilledPostId?: string | null; url?: string | null }>(
          "inbox.getById",
          { id },
        );
        if (item.distilledPostId) postIds.push(item.distilledPostId);
      }
      expect(postIds.length).toBeGreaterThan(0);
      const post = await trpcQuery<{ slug: string; garden: string; content: string; title: string }>(
        "post.getById",
        { id: postIds[0] },
      );
      expect(post.content).toMatch(new RegExp(`example.com/${keyword}`));
      await page.goto(postUrl(post.slug, post.garden));
      await expect(page.getByPlaceholder("标题")).toHaveValue(post.title, { timeout: 15_000 });
      await expect(articleBody(page).first()).toContainText(`example.com/${keyword}`);
    } finally {
      for (const id of postIds) await forceCleanupPost(id);
      for (const id of ids) await cleanupInboxItem(id);
    }
  });

  test("18 视频学习笔记：走 video_transcript，有逐字稿", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(
      page,
      "把这个视频做成学习笔记，能写进 knowledge：https://www.bilibili.com/video/BVe2emock 有字幕用字幕；没有就下载音频本地转写，不要编台词。",
    );
    await expect(page.locator('[data-testid="tool-pill"][data-tool="video_transcript"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);
    await expect(page.getByText(/逐字稿|字幕/).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="browser_screenshot"]')).toHaveCount(0);
  });

  test("19 知乎登录后读文：login_status → read_article，不用截图代替", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(
      page,
      "我要读知乎收藏夹里这篇专栏 https://zhuanlan.zhihu.com/p/e2e-mock 。若未登录请弹浏览器登录，登录后读全文分段总结。",
    );
    await expect(page.locator('[data-testid="tool-pill"][data-tool="browser_login_status"]')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="read_article"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="browser_screenshot"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="vision_describe"]')).toHaveCount(0);
    await expect(page.getByText(/正文|摘要/).first()).toBeVisible({ timeout: 15_000 });
  });

  test("20 深度调研 Goal：goal 条出现，并说明重启不自动续跑", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(
      page,
      "设 Goal：两天内搭好「扩散模型采样」主题花园初版，含目录 + 至少 3 篇达标长文；今晚先跑，我明天早上看。",
    );
    await waitForStandingGoal(page, /扩散|采样|花园/);
    await expect(page.getByText(/重启不自动续跑/).first()).toBeVisible({ timeout: 20_000 });
  });

  test("A 晨间简报：Inbox 要点后可写入知识库", async ({ page }) => {
    const stamp = Date.now();
    await openFreshChat(page);
    await sendChatMessage(
      page,
      "把昨夜 Inbox / 订阅源新增汇总成 5 条要点；挑 1～2 条值得沉淀的写成 knowledge 草稿，标签 日报。",
    );
    await expect(page.locator('[data-testid="tool-pill"][data-tool="inbox_list"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);
    await expect(page.getByText("5 条要点").first()).toBeVisible({ timeout: 15_000 });
    const href = await saveLastAssistantAsPost(page, `E2E 日报 ${stamp}`);
    await page.goto(href);
    await expect(page.getByPlaceholder("标题")).toHaveValue(`E2E 日报 ${stamp}`, { timeout: 15_000 });
    const opened = new URL(href, "http://local");
    const slug = decodeURIComponent(opened.pathname.replace(/^\/posts\//, ""));
    const garden = opened.searchParams.get("garden") ?? "posts";
    const saved = await trpcQuery<{ id: string }>("post.getBySlug", { slug, garden });
    await forceCleanupPost(saved.id);
  });

  test("B 专题深挖：阻塞调研完成后可成文", async ({ page }) => {
    const stamp = Date.now();
    await openFreshChat(page);
    await sendChatMessage(
      page,
      "调研 DDPM 采样技巧，对比我花园里已有的 diffusion 笔记，写一篇可发布草稿；资料员同步等结果。",
    );
    await expect(page.locator('[data-testid="tool-pill"][data-tool="post_list"]')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]')).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByText("阻塞调研完成").first()).toBeVisible({ timeout: 40_000 });
    await waitForSessionIdle(page);
    const href = await saveLastAssistantAsPost(page, `E2E DDPM ${stamp}`);
    await page.goto(href);
    await expect(page.getByPlaceholder("标题")).toHaveValue(`E2E DDPM ${stamp}`, { timeout: 15_000 });
    const opened = new URL(href, "http://local");
    const slug = decodeURIComponent(opened.pathname.replace(/^\/posts\//, ""));
    const garden = opened.searchParams.get("garden") ?? "posts";
    const saved = await trpcQuery<{ id: string }>("post.getBySlug", { slug, garden });
    await forceCleanupPost(saved.id);
  });

  test("C 先别上网整理 + 切云模型 + 选区精简同一篇", async ({ page }) => {
    const stamp = Date.now();
    const src = "E2E_REWRITE_SRC 这一段又长又啰嗦需要精简。";
    await openFreshChat(page);
    await sendChatMessage(page, "整理成学习笔记，先别上网。私密粘贴：扩散采样步数。");
    await waitForStreamingComplete(page);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="web_search"]')).toHaveCount(0);

    await page.getByTestId("chat-model-menu-trigger").first().click();
    await page.getByTestId("chat-model-option-deepseek-v4-pro").click();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "先别上网" })).toBeVisible();

    const href = await saveLastAssistantAsPost(page, `E2E 闭环 ${stamp}`);
    await page.goto(href);
    const opened = new URL(href, "http://local");
    const slug = decodeURIComponent(opened.pathname.replace(/^\/posts\//, ""));
    const garden = opened.searchParams.get("garden") ?? "posts";
    const current = await trpcQuery<{ id: string }>("post.getBySlug", { slug, garden });
    await trpcMutate("post.update", {
      id: current.id,
      content: `## 第二节\n\n${src}\n\n## 第三节\n\n保留。`,
    });
    await page.reload();
    await sourceModeButton(page).click();
    const ta = sourceTextarea(page);
    await expect(ta).toHaveValue(/又长又啰嗦/, { timeout: 10_000 });
    await ta.evaluate((el, text) => {
      const node = el as HTMLTextAreaElement;
      const start = node.value.indexOf(text);
      node.focus();
      node.setSelectionRange(start, start + text.length);
      node.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    }, src);
    await expect(shortenSelectionButton(page)).toBeVisible({ timeout: 8_000 });
    await runEditorShorten(page);
    await editorAcceptButton(page).click();
    await expect(ta).toHaveValue(/E2E_REWRITTEN/);
    await forceCleanupPost(current.id);
  });

  test("D PicLite：skill_view + list_directory，禁止第三方压图", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(
      page,
      "这几张相机原图在 workspaces/__assistant__/raw-photos/，要进 knowledge 文章当配图。单张压到约 1MB 内、最长边 ≤1600，不要上传任何在线压图网站。压完告诉我路径。",
    );
    await expect(page.locator('[data-testid="tool-pill"][data-tool="skill_view"]')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="list_directory"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);
    await expect(page.getByText(/未走 TinyPNG|未上传任何在线压图/).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/raw-photos|compressed/).first()).toBeVisible();
  });

  test("E Chat 微信成片：material_pack → compose，禁止 write_file 写 algo-viz", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(
      page,
      "把这篇微信做成 1 分钟讲解短片，画面跟旁白走：https://mp.weixin.qq.com/s/e2e-mock 先出可在花园里播的 Remotion。",
    );
    await expect(page.locator('[data-testid="tool-pill"][data-tool="article_material_pack"]')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="article_video_compose"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="write_file"]')).toHaveCount(0);
    await expect(page.getByText(/viz|PpoClip|材料包/).first()).toBeVisible({ timeout: 10_000 });
  });
});
