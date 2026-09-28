/**
 * 会话树条：线性不渲染；两叉显示并可换叶；摘要不算一叉；当前枝误点不切；失败可见。
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatSessionTreeBar } from "@/components/chatSessionTreeBar";

type TreeNode = {
  id: string;
  parentId: string | null;
  role: string;
  label: string | null;
  kind: string | null;
  contentPreview: string;
  createdAt: string;
};

type SessionTree = {
  sessionId: string;
  activeLeafId: string | null;
  nodes: TreeNode[];
  children: Record<string, string[]>;
};

const fixtures = vi.hoisted(() => ({
  tree: null as SessionTree | null,
  mutate: vi.fn(),
  isPending: false,
  mutationMode: "success" as "success" | "error",
  invalidateTree: vi.fn((_input?: { sessionId: string }) => Promise.resolve()),
  invalidateInspect: vi.fn((_input?: { sessionId: string }) => Promise.resolve()),
  invalidateList: vi.fn((_input?: { sessionId: string }) => Promise.resolve()),
  fetchList: vi.fn(
    (_input?: { sessionId: string; limit: number }, _opts?: { staleTime?: number }) =>
      Promise.resolve({ items: [{ id: "m1", content: "hi" }] }),
  ),
  cancelList: vi.fn((_input?: { sessionId: string }) => Promise.resolve()),
  hydrate: vi.fn(),
  running: { items: [] as Array<{ sessionId: string }> },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      session: {
        tree: { invalidate: (input: { sessionId: string }) => fixtures.invalidateTree(input) },
        inspectTurn: { invalidate: (input: { sessionId: string }) => fixtures.invalidateInspect(input) },
      },
      message: {
        listForChat: {
          fetch: (
            input: { sessionId: string; limit: number },
            opts?: { staleTime?: number },
          ) => fixtures.fetchList(input, opts),
          invalidate: (input: { sessionId: string }) => fixtures.invalidateList(input),
          cancel: (input: { sessionId: string }) => fixtures.cancelList(input),
        },
      },
    }),
    session: {
      tree: {
        useQuery: () => ({ data: fixtures.tree }),
      },
      listRunning: {
        useQuery: () => ({ data: fixtures.running }),
      },
      switchBranch: {
        useMutation: (opts?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => ({
          mutate: (input: unknown) => {
            fixtures.mutate(input);
            if (fixtures.mutationMode === "success") opts?.onSuccess?.();
            else opts?.onError?.(new Error("fail"));
          },
          isPending: fixtures.isPending,
        }),
      },
    },
  },
  catchUnlessCancelled: () => () => {},
}));

vi.mock("@/lib/useSessionMessages", () => ({
  sessionMessagesStore: {
    hydrateSessionMessages: (
      sessionId: string,
      messages: unknown[],
      source: string,
    ) => fixtures.hydrate(sessionId, messages, source),
  },
}));

function node(
  id: string,
  parentId: string | null,
  role: string,
  preview: string,
  kind: string | null = null,
  label: string | null = null,
): TreeNode {
  return {
    id,
    parentId,
    role,
    label,
    kind,
    contentPreview: preview,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("ChatSessionTreeBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    fixtures.tree = null;
    fixtures.mutate.mockClear();
    fixtures.isPending = false;
    fixtures.mutationMode = "success";
    fixtures.invalidateTree.mockClear();
    fixtures.invalidateInspect.mockClear();
    fixtures.invalidateList.mockClear();
    fixtures.fetchList.mockClear();
    fixtures.cancelList.mockClear();
    fixtures.hydrate.mockClear();
    fixtures.running = { items: [] };
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

  it("无 session / 无树数据 → 不渲染", async () => {
    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId={null} />);
    });
    expect(container.querySelector('[data-testid="chat-session-tree-bar"]')).toBeNull();

    fixtures.tree = {
      sessionId: "s1",
      activeLeafId: "a1",
      nodes: [],
      children: {},
    };
    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId="s1" />);
    });
    expect(container.querySelector('[data-testid="chat-session-tree-bar"]')).toBeNull();
  });

  it("线性链不渲染树条", async () => {
    fixtures.tree = {
      sessionId: "s1",
      activeLeafId: "a1",
      nodes: [node("u1", null, "user", "问"), node("a1", "u1", "assistant", "答")],
      children: { "": ["u1"], u1: ["a1"] },
    };
    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId="s1" />);
    });
    expect(container.querySelector('[data-testid="chat-session-tree-bar"]')).toBeNull();
  });

  it("两叉显示按钮；摘要不算一叉；点旁路换叶并水合", async () => {
    fixtures.tree = {
      sessionId: "s1",
      activeLeafId: "u2",
      nodes: [
        node("u1", null, "user", "原问"),
        node("a1", "u1", "assistant", "原答"),
        node("u2", "a1", "user", "追问"),
        node("a2", "u1", "assistant", "旁路答"),
        node("sum", "u1", "system", "摘要", "branch_summary"),
      ],
      children: { "": ["u1"], u1: ["a1", "a2", "sum"], a1: ["u2"] },
    };

    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId="s1" />);
    });

    const bar = container.querySelector('[data-testid="chat-session-tree-bar"]');
    expect(bar).not.toBeNull();
    const buttons = [
      ...container.querySelectorAll('[data-testid="chat-tree-branch-btn"]'),
    ] as HTMLButtonElement[];
    expect(buttons).toHaveLength(2);
    expect(buttons.map((b) => b.textContent)).toEqual(["原答", "旁路答"]);
    expect(buttons[0]!.getAttribute("data-active")).toBe("true");
    expect(buttons[1]!.getAttribute("data-active")).toBe("false");
    expect(buttons[0]!.disabled).toBe(true);
    expect(buttons[1]!.disabled).toBe(false);

    await act(async () => {
      buttons[0]!.click();
    });
    expect(fixtures.mutate).not.toHaveBeenCalled();

    await act(async () => {
      buttons[1]!.click();
    });
    expect(fixtures.mutate).toHaveBeenCalledTimes(1);
    expect(fixtures.mutate).toHaveBeenCalledWith({ sessionId: "s1", messageId: "a2" });
    expect(fixtures.invalidateTree).toHaveBeenCalledWith({ sessionId: "s1" });
    expect(fixtures.invalidateInspect).toHaveBeenCalledWith({ sessionId: "s1" });
    expect(fixtures.invalidateList).toHaveBeenCalledWith({ sessionId: "s1" });
    await vi.waitFor(() => {
      expect(fixtures.cancelList).toHaveBeenCalledWith({ sessionId: "s1" });
      expect(fixtures.fetchList).toHaveBeenCalledWith(
        { sessionId: "s1", limit: 50 },
        { staleTime: 0 },
      );
    });
    expect(fixtures.cancelList.mock.invocationCallOrder[0]).toBeLessThan(
      fixtures.fetchList.mock.invocationCallOrder[0]!,
    );
  });

  it("流式中全部按钮禁用", async () => {
    fixtures.tree = {
      sessionId: "s1",
      activeLeafId: "a1",
      nodes: [
        node("u1", null, "user", "问"),
        node("a1", "u1", "assistant", "A"),
        node("a2", "u1", "assistant", "B"),
      ],
      children: { "": ["u1"], u1: ["a1", "a2"] },
    };
    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId="s1" disabled />);
    });
    const buttons = [
      ...container.querySelectorAll('[data-testid="chat-tree-branch-btn"]'),
    ] as HTMLButtonElement[];
    expect(buttons.length).toBe(2);
    expect(buttons.every((b) => b.disabled)).toBe(true);
  });

  it("hub 占线时旁路钮禁用（不靠本页 disabled）", async () => {
    fixtures.running = { items: [{ sessionId: "s1" }] };
    fixtures.tree = {
      sessionId: "s1",
      activeLeafId: "a1",
      nodes: [
        node("u1", null, "user", "问"),
        node("a1", "u1", "assistant", "A"),
        node("a2", "u1", "assistant", "B"),
      ],
      children: { "": ["u1"], u1: ["a1", "a2"] },
    };
    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId="s1" />);
    });
    const buttons = [
      ...container.querySelectorAll('[data-testid="chat-tree-branch-btn"]'),
    ] as HTMLButtonElement[];
    expect(buttons.length).toBe(2);
    expect(buttons.every((b) => b.disabled)).toBe(true);
  });

  it("换叶失败显示「换叶失败」", async () => {
    fixtures.mutationMode = "error";
    fixtures.tree = {
      sessionId: "s1",
      activeLeafId: "a1",
      nodes: [
        node("u1", null, "user", "问"),
        node("a1", "u1", "assistant", "A"),
        node("a2", "u1", "assistant", "B"),
      ],
      children: { "": ["u1"], u1: ["a1", "a2"] },
    };
    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId="s1" />);
    });
    const buttons = [
      ...container.querySelectorAll('[data-testid="chat-tree-branch-btn"]'),
    ] as HTMLButtonElement[];
    const inactive = buttons.find((b) => b.getAttribute("data-active") === "false");
    expect(inactive).toBeTruthy();
    await act(async () => {
      inactive!.click();
    });
    const err = container.querySelector('[data-testid="chat-tree-switch-error"]');
    expect(err?.textContent).toBe("换叶失败");
  });

  it("点分叉上的用户气泡切到该枝叶（含助手回复）", async () => {
    fixtures.tree = {
      sessionId: "s1",
      activeLeafId: "a1",
      nodes: [
        node("u1", null, "user", "原问"),
        node("a1", "u1", "assistant", "原答"),
        node("u2", "u1", "user", "另写"),
        node("a2", "u2", "assistant", "另写答"),
      ],
      children: { "": ["u1"], u1: ["a1", "u2"], u2: ["a2"] },
    };
    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId="s1" />);
    });
    const buttons = [
      ...container.querySelectorAll('[data-testid="chat-tree-branch-btn"]'),
    ] as HTMLButtonElement[];
    const inactive = buttons.find((b) => b.getAttribute("data-active") === "false");
    expect(inactive?.textContent).toBe("另写");
    await act(async () => {
      inactive!.click();
    });
    expect(fixtures.mutate).toHaveBeenCalledWith({ sessionId: "s1", messageId: "a2" });
  });

  it("书签芯片：label 非空节点渲染芯片；点旁路书签切到该子树叶", async () => {
    fixtures.tree = {
      sessionId: "s1",
      activeLeafId: "a2",
      nodes: [
        node("u1", null, "user", "原问"),
        node("a1", "u1", "assistant", "原答", null, "书签"),
        node("u2", "u1", "user", "另写"),
        node("a2", "u2", "assistant", "另写答"),
      ],
      children: { "": ["u1"], u1: ["a1", "u2"], u2: ["a2"] },
    };
    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId="s1" />);
    });
    const chips = [
      ...container.querySelectorAll('[data-testid="chat-bookmark-chip"]'),
    ] as HTMLButtonElement[];
    expect(chips).toHaveLength(1);
    expect(chips[0]!.getAttribute("data-message-id")).toBe("a1");
    expect(chips[0]!.textContent).toBe("书签");
    // a1 是叶子，tip=a1；当前 activeLeafId=a2 ≠ a1 → 可点
    expect(chips[0]!.disabled).toBe(false);
    await act(async () => {
      chips[0]!.click();
    });
    expect(fixtures.mutate).toHaveBeenCalledWith({ sessionId: "s1", messageId: "a1" });
  });

  it("书签芯片在当前叶上 disabled（已在该叶不切）", async () => {
    fixtures.tree = {
      sessionId: "s1",
      activeLeafId: "a1",
      nodes: [
        node("u1", null, "user", "原问"),
        node("a1", "u1", "assistant", "原答", null, "书签"),
        node("a2", "u1", "assistant", "旁路答"),
      ],
      children: { "": ["u1"], u1: ["a1", "a2"] },
    };
    await act(async () => {
      root.render(<ChatSessionTreeBar sessionId="s1" />);
    });
    const chips = [
      ...container.querySelectorAll('[data-testid="chat-bookmark-chip"]'),
    ] as HTMLButtonElement[];
    expect(chips).toHaveLength(1);
    // a1 是当前叶，tip=a1=activeLeafId → disabled
    expect(chips[0]!.disabled).toBe(true);
  });
});
