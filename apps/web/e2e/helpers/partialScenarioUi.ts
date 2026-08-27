/**
 * 场景 11–E：选择器兼容已构建产物 + 源码；写入知识库必须先 hover（按钮默认 pointer-events-none）。
 */
import { expect, type Page } from "@playwright/test";
import { trpcQuery } from "./trpcE2e";

export function articleBody(page: Page) {
  return page.getByTestId("post-article-body").or(page.locator("article.om-post-content, .om-post-content"));
}

export function sourceModeButton(page: Page) {
  return page.getByTestId("editor-mode-source").or(page.getByRole("button", { name: "源码" }));
}

export function sourceTextarea(page: Page) {
  return page.getByTestId("editor-source-textarea");
}

export async function selectQuoteInArticle(page: Page, needle: string): Promise<void> {
  await expect(page.getByText(needle).first()).toBeVisible({ timeout: 20_000 });
  const found = await page.evaluate((text) => {
    const root =
      document.querySelector("[data-testid='post-article-body']") ??
      document.querySelector("article.om-post-content") ??
      document.querySelector(".om-post-content");
    if (!root) return "no-root";
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const value = node.textContent ?? "";
      const idx = value.indexOf(text);
      if (idx < 0) continue;
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + text.length);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      const el = node.parentElement;
      el?.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      return "ok";
    }
    return "no-text";
  }, needle);
  if (found !== "ok") {
    const loc = page.getByText(needle).first();
    const box = await loc.boundingBox();
    if (!box) throw new Error(`划选失败：${found}（${needle}）`);
    await page.mouse.move(box.x + 4, box.y + Math.max(box.height / 2, 2));
    await page.mouse.down();
    await page.mouse.move(box.x + Math.max(box.width - 4, 12), box.y + Math.max(box.height / 2, 2));
    await page.mouse.up();
  }
}

export async function saveLastAssistantAsPost(page: Page, title: string): Promise<string> {
  await page.keyboard.press("Escape").catch(() => {});
  const pane = page.locator('[data-testid="chat-session-pane"]').first();
  const bubble = pane.getByTestId("assistant-message-bubble").last();
  await expect(bubble).toBeVisible({ timeout: 15_000 });
  await bubble.scrollIntoViewIfNeeded();
  await bubble.hover();
  const saveBtn = bubble.getByRole("button", { name: "写入知识库" });
  await expect(saveBtn).toBeVisible({ timeout: 8_000 });
  await saveBtn.click();
  await expect(page.getByTestId("save-message-as-post-dialog")).toBeVisible({ timeout: 10_000 });
  await page
    .getByTestId("save-message-as-post-title")
    .or(page.getByPlaceholder("不填则取正文首行"))
    .fill(title);
  await page
    .getByTestId("save-message-as-post-submit")
    .or(page.getByRole("button", { name: "确认写入" }))
    .click();
  await expect(page.getByTestId("save-message-as-post-success")).toBeVisible({ timeout: 15_000 });
  const openLink = page.getByTestId("save-message-as-post-open").or(page.getByRole("link", { name: "打开文章" }));
  const href = await openLink.getAttribute("href");
  if (!href) throw new Error("落库成功但没有打开文章链接");
  return href;
}

export function chatSessionId(page: Page): string {
  const id = new URL(page.url()).searchParams.get("sessionId");
  if (!id) throw new Error("当前 URL 没有 sessionId");
  return id;
}

export async function waitForStandingGoal(page: Page, textRe: RegExp): Promise<void> {
  const sessionId = chatSessionId(page);
  let sawBar = false;
  await expect
    .poll(
      async () => {
        if ((await page.getByTestId("chat-goal-bar").count()) > 0) sawBar = true;
        const dumped = await trpcQuery<{ goal: { text?: string; status?: string } | null }>(
          "session.getGoal",
          { sessionId },
        );
        return dumped.goal?.text ?? "";
      },
      { timeout: 20_000 },
    )
    .toMatch(textRe);

  const dumped = await trpcQuery<{ goal: { text?: string; status?: string } | null }>(
    "session.getGoal",
    { sessionId },
  );
  const status = dumped.goal?.status ?? "";
  if (sawBar || status === "active" || status === "paused") {
    await expect(page.getByTestId("chat-goal-bar")).toBeVisible({ timeout: 8_000 });
    await expect(page.getByTestId("chat-goal-bar")).toContainText(textRe);
  }
}

export function postUrl(slug: string, garden = "posts"): string {
  const encoded = encodeURIComponent(slug);
  if (!garden || garden === "posts") return `/posts/${encoded}`;
  return `/posts/${encoded}?garden=${encodeURIComponent(garden)}`;
}

export function shortenSelectionButton(page: Page) {
  return page.getByTestId("editor-selection-shorten").or(page.getByRole("button", { name: "精简" }));
}

export function editorAcceptButton(page: Page) {
  return page.getByTestId("editor-agent-accept").or(page.getByRole("button", { name: "接受" }));
}

export function editorRejectButton(page: Page) {
  return page.getByTestId("editor-agent-reject").or(page.getByRole("button", { name: "拒绝" }));
}

export async function runEditorShorten(page: Page): Promise<void> {
  await expect(shortenSelectionButton(page)).toBeVisible({ timeout: 8_000 });
  await shortenSelectionButton(page).click();
  const runBtn = page.getByTestId("editor-agent-run");
  await expect(runBtn).toBeVisible({ timeout: 8_000 });
  await runBtn.click();
  await expect(page.getByTestId("editor-agent-preview")).toBeVisible({ timeout: 20_000 });
}
