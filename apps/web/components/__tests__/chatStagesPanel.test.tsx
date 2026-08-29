/**
 * W6 ChatStagesPanel 浅测：空态 + 一项。
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatStagesPanel } from "@/components/chatStagesPanel";

const fixtures = vi.hoisted(() => ({
  items: [] as Array<{
    stage: string;
    fileName: string;
    relPath: string;
    title: string;
    updatedAt: string;
    bytes: number;
  }>,
  invalidate: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      workspace: { listStages: { invalidate: () => fixtures.invalidate() } },
    }),
    workspace: {
      listStages: {
        useQuery: () => ({ data: { items: fixtures.items, total: fixtures.items.length } }),
      },
    },
  },
  catchUnlessCancelled: () => () => {},
}));

vi.mock("@/lib/uiStateChannel", () => ({
  subscribeUiState: () => () => {},
}));

describe("ChatStagesPanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    fixtures.items = [];
    fixtures.invalidate.mockClear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("open=false 不渲染", async () => {
    await act(async () => {
      root.render(<ChatStagesPanel workspaceId="ws1" open={false} onClose={() => {}} />);
    });
    expect(container.querySelector('[data-testid="chat-stages-panel"]')).toBeNull();
  });

  it("空态显示 chat-stages-empty", async () => {
    await act(async () => {
      root.render(<ChatStagesPanel workspaceId="ws1" open={true} onClose={() => {}} />);
    });
    expect(container.querySelector('[data-testid="chat-stages-empty"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="chat-stage-item"]')).toBeNull();
  });

  it("一项渲染 chat-stage-item", async () => {
    fixtures.items = [
      { stage: "research", fileName: "research.md", relPath: "workspaces/x/.oasismind/stages/research.md", title: "调研摘要", updatedAt: "2026-08-29T00:00:00.000Z", bytes: 120 },
    ];
    await act(async () => {
      root.render(<ChatStagesPanel workspaceId="ws1" open={true} onClose={() => {}} />);
    });
    const item = container.querySelector('[data-testid="chat-stage-item"]');
    expect(item).not.toBeNull();
    expect(item?.getAttribute("data-stage")).toBe("research");
    expect(item?.textContent).toContain("调研摘要");
  });
});
