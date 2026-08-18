/**
 * @agent 协写面板定位：挂在编辑器根上用 absolute，随页面滚，禁止 fixed 钉视口。
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __placePanelInHostForTests } from "@/components/editor/EditorAgentComplete";

function mockHost(opts: {
  left: number;
  top: number;
  width: number;
  height?: number;
  scrollLeft?: number;
  scrollTop?: number;
}): HTMLDivElement {
  const el = document.createElement("div");
  el.getBoundingClientRect = () =>
    new DOMRect(opts.left, opts.top, opts.width, opts.height ?? 800);
  Object.defineProperty(el, "clientWidth", { configurable: true, value: opts.width });
  Object.defineProperty(el, "scrollLeft", {
    configurable: true,
    writable: true,
    value: opts.scrollLeft ?? 0,
  });
  Object.defineProperty(el, "scrollTop", {
    configurable: true,
    writable: true,
    value: opts.scrollTop ?? 0,
  });
  return el;
}

describe("placePanelInHost（相对编辑器，不钉视口）", () => {
  it("光标坐标换成相对宿主的 left/top", () => {
    const host = mockHost({ left: 80, top: 100, width: 800 });
    expect(__placePanelInHostForTests(host, { left: 200, bottom: 410 })).toEqual({
      left: 120,
      top: 318,
    });
  });

  it("宿主自己滚动时把 scrollLeft/scrollTop 算进文档偏移", () => {
    const host = mockHost({
      left: 80,
      top: 100,
      width: 800,
      scrollLeft: 20,
      scrollTop: 50,
    });
    expect(__placePanelInHostForTests(host, { left: 200, bottom: 410 })).toEqual({
      left: 140,
      top: 368,
    });
  });

  it("页面滚动后宿主与光标同位移，相对偏移不变（跟着滚）", () => {
    const before = __placePanelInHostForTests(mockHost({ left: 80, top: 300, width: 800 }), {
      left: 180,
      bottom: 500,
    });
    const after = __placePanelInHostForTests(mockHost({ left: 80, top: 100, width: 800 }), {
      left: 180,
      bottom: 300,
    });
    expect(after).toEqual(before);
    expect(before).toEqual({ left: 100, top: 208 });
  });

  it("视口 fixed 坐标会随滚动变，本函数不得走出那条路", () => {
    const cursorBefore = { left: 180, bottom: 500 };
    const cursorAfter = { left: 180, bottom: 300 };
    expect(cursorAfter.bottom).not.toBe(cursorBefore.bottom);

    const hostBefore = mockHost({ left: 80, top: 300, width: 800 });
    const hostAfter = mockHost({ left: 80, top: 100, width: 800 });
    expect(__placePanelInHostForTests(hostAfter, cursorAfter)).toEqual(
      __placePanelInHostForTests(hostBefore, cursorBefore),
    );
  });

  it("贴右缘时夹紧，避免面板伸出编辑器", () => {
    const host = mockHost({ left: 0, top: 0, width: 400 });
    const pos = __placePanelInHostForTests(host, { left: 380, bottom: 40 });
    expect(pos.left).toBe(32);
    expect(pos.top).toBe(48);
  });

  it("贴左缘至少留 8px", () => {
    const host = mockHost({ left: 40, top: 20, width: 800 });
    expect(__placePanelInHostForTests(host, { left: 40, bottom: 20 }).left).toBe(8);
  });

  it("无光标时落在宿主左上附近", () => {
    const host = mockHost({ left: 40, top: 60, width: 800 });
    expect(__placePanelInHostForTests(host, null)).toEqual({ left: 8, top: 8 });
  });

  it("无宿主时回退视口 + window.scroll（不用于 @agent 主路径）", () => {
    const prevX = window.scrollX;
    const prevY = window.scrollY;
    Object.defineProperty(window, "scrollX", { configurable: true, value: 10 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 20 });
    try {
      expect(__placePanelInHostForTests(null, { left: 50, bottom: 90 })).toEqual({
        left: 60,
        top: 118,
      });
    } finally {
      Object.defineProperty(window, "scrollX", { configurable: true, value: prevX });
      Object.defineProperty(window, "scrollY", { configurable: true, value: prevY });
    }
  });
});

const cursorRect = new DOMRect(200, 390, 0, 20);

vi.mock("@/components/editor/milkdownSelectionApi", () => ({
  getMilkdownCursorScreenRect: () => cursorRect,
  getMilkdownParagraphContext: () => ({
    paragraph: "当前段",
    before: "前文",
    after: "后文",
    selected: undefined,
  }),
  saveMilkdownBlockRange: () => true,
  saveMilkdownSelectionRange: () => null,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    agent: {
      list: {
        useQuery: () => ({
          data: { items: [{ id: "a1", name: "助手", description: "", tier: "sub" }] },
          isLoading: false,
          refetch: vi.fn().mockResolvedValue(undefined),
        }),
      },
      editorComplete: {
        useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
      },
      create: {
        useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
      },
    },
  },
  catchUnlessCancelled: () => () => {},
}));

import { EditorAgentComplete } from "@/components/editor/EditorAgentComplete";

describe("EditorAgentComplete 面板挂载", () => {
  let container: HTMLDivElement;
  let host: HTMLDivElement;
  let root: Root;
  const sourceRef = { current: null as HTMLTextAreaElement | null };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    host = mockHost({ left: 80, top: 100, width: 800 });
    host.setAttribute("data-testid", "editor-panel-host");
    document.body.appendChild(host);
    root = createRoot(container);
    sourceRef.current = document.createElement("textarea");
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    host.remove();
  });

  async function renderPanel(atTrigger: { token: number; query: string; mode?: "wysiwyg" | "source" } | null) {
    await act(async () => {
      root.render(
        <EditorAgentComplete
          content="正文"
          sourceTextareaRef={sourceRef}
          panelHost={host}
          atTrigger={atTrigger}
          onApply={() => {}}
        />,
      );
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    if (atTrigger?.mode === "source") {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
    }
  }

  it("@agent 弹出后面板 portal 进编辑器根，absolute 不 fixed", async () => {
    await renderPanel({ token: 1, query: "" });

    const inHost = host.querySelector('[data-testid="editor-agent-complete-panel"]');
    const inToolbar = container.querySelector('[data-testid="editor-agent-complete-panel"]');
    expect(inHost).not.toBeNull();
    expect(inToolbar).toBeNull();
    expect(inHost!.className).toContain("absolute");
    expect(inHost!.className).not.toContain("fixed");
    expect((inHost as HTMLElement).style.left).toBe("120px");
    expect((inHost as HTMLElement).style.top).toBe("318px");
  });

  it("源码模式 @agent 不按光标 portal（面板留在工具栏下）", async () => {
    await renderPanel({ token: 1, query: "", mode: "source" });

    expect(host.querySelector('[data-testid="editor-agent-complete-panel"]')).toBeNull();
    const inToolbar = container.querySelector('[data-testid="editor-agent-complete-panel"]');
    expect(inToolbar).not.toBeNull();
    expect(inToolbar!.className).toContain("absolute");
    expect(inToolbar!.className).not.toContain("fixed");
    expect((inToolbar as HTMLElement).style.left).toBe("");
  });

  it("工具栏「自定义 @agent」不 portal，仍挂在润稿按钮下", async () => {
    await renderPanel(null);
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="editor-polish-open"]')?.click();
    });
    const custom = [...container.querySelectorAll("button")].find((b) =>
      (b.textContent ?? "").includes("自定义"),
    );
    expect(custom).toBeTruthy();
    await act(async () => {
      custom!.click();
    });

    expect(host.querySelector('[data-testid="editor-agent-complete-panel"]')).toBeNull();
    const inToolbar = container.querySelector('[data-testid="editor-agent-complete-panel"]');
    expect(inToolbar).not.toBeNull();
    expect(inToolbar!.className).not.toContain("fixed");
  });
});
