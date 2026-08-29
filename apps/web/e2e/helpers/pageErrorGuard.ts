import type { Page } from "@playwright/test";

export function installPageErrorGuard(page: Page): () => void {
  page.addInitScript(() => {
    window.addEventListener("unhandledrejection", (e) => {
      (window as unknown as { __omUnhandled?: string[] }).__omUnhandled ??= [];
      (window as unknown as { __omUnhandled?: string[] }).__omUnhandled!.push(String(e.reason));
    });
  });

  const pageErrors: Error[] = [];
  const onPageError = (err: Error) => {
    pageErrors.push(err);
  };
  page.on("pageerror", onPageError);

  return () => {
    page.off("pageerror", onPageError);
    if (pageErrors.length > 0) {
      throw pageErrors[0];
    }
  };
}
