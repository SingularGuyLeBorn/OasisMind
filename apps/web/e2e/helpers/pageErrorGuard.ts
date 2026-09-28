import type { Page } from "@playwright/test";

/**
 * Chat mock E2E：pageerror + unhandledrejection 非空则红。
 * addInitScript 必须 await，故本函数为 async。
 * [OM-FREEPLAY] 默认过滤列表为空；不按文件开白名单。
 */
export async function installPageErrorGuard(page: Page): Promise<() => Promise<void>> {
  const pageErrors: string[] = [];
  const onPageError = (err: Error) => {
    pageErrors.push(String(err));
  };
  page.on("pageerror", onPageError);
  await page.addInitScript(() => {
    window.addEventListener("unhandledrejection", (e) => {
      const w = window as unknown as { __omUnhandled?: string[] };
      w.__omUnhandled ??= [];
      w.__omUnhandled.push(String(e.reason));
    });
  });
  return async () => {
    page.off("pageerror", onPageError);
    const unhandled = await page.evaluate(() => {
      const w = window as unknown as { __omUnhandled?: string[] };
      return w.__omUnhandled ?? [];
    });
    if (pageErrors.length > 0 || unhandled.length > 0) {
      const msg = [...pageErrors, ...unhandled].join("\n");
      throw new Error(`Chat E2E 页错误：${msg}`);
    }
  };
}
