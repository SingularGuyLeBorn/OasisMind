import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TableOfContents } from "@/components/post/TableOfContents";

// jsdom 没有 ScrollArea 测量/动画 API；这里只验目录交互，滚动容器用普通 div。
vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

class StaticIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
}

describe("TableOfContents 阅读导航", () => {
  let container: HTMLDivElement;
  let root: Root;
  let article: HTMLElement | null;
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    article = null;
    vi.stubGlobal("IntersectionObserver", StaticIntersectionObserver);
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    vi.stubGlobal("CSS", { escape: (value: string) => value });
    HTMLElement.prototype.scrollIntoView = vi.fn();
    localStorage.removeItem("om-post-toc-visible");
    history.replaceState(null, "", "/");
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    article?.remove();
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    vi.unstubAllGlobals();
  });

  it("入口只打开侧栏，选择章节后才滚动并把焦点交给标题", async () => {
    article = document.createElement("article");
    article.innerHTML = '<h1 id="om-h-0">标题</h1><h2 id="om-h-1">第一节</h2>';
    document.body.appendChild(article);
    const articleRef = { current: article };

    await act(async () => root.render(<TableOfContents content={"# 标题\n\n## 第一节"} containerRef={articleRef} />));
    const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="打开本页目录"]');
    expect(trigger).not.toBeNull();
    await act(async () => trigger!.click());
    expect(container.querySelector('[role="dialog"][aria-modal="true"]')).not.toBeNull();
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();

    const firstLink = container.querySelector<HTMLAnchorElement>('[role="dialog"] a[href="#om-h-0"]');
    expect(firstLink).not.toBeNull();
    await act(async () => firstLink!.click());
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(article.querySelector("#om-h-0"));
    expect(location.hash).toBe("#om-h-0");
  });

  it("非活动保活文档不暴露移动端入口", async () => {
    await act(async () => root.render(<TableOfContents content="# 标题" active={false} />));
    expect(container.querySelector('button[aria-label="打开本页目录"]')).toBeNull();
  });
  it("桌面隐藏目录悬停可预览，选择章节后继续隐藏", async () => {
    article = document.createElement("article");
    article.innerHTML = '<h1 id="om-h-0">标题</h1><h2 id="om-h-1">第一节</h2>';
    document.body.appendChild(article);
    await act(async () => root.render(<TableOfContents content={"# 标题\n\n## 第一节"} containerRef={{ current: article }} />));
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="隐藏本页目录"]')!.click());
    const trigger = container.querySelector<HTMLButtonElement>('[aria-label="显示本页目录"]')!;
    await act(async () => trigger.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })));
    expect(container.querySelector('[data-toc-preview="true"]')).not.toBeNull();
    await act(async () => container.querySelector<HTMLAnchorElement>('[data-toc-preview] a')!.click());
    expect(container.querySelector('[data-toc-preview]')).toBeNull();
    expect(localStorage.getItem("om-post-toc-visible")).toBe("0");
    expect(location.hash).toBe("#om-h-0");
  });
});
