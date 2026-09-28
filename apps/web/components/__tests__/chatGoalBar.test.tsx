/**
 * W7 ChatGoalBar 已核实步骤列表：展开列 claim、空数组不展开、PULL 由 getGoal query 提供。
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatGoalBar } from "@/components/chatGoalBar";
import type { SessionGoalState } from "@oasismind/shared";

const fixtures = vi.hoisted(() => ({
  goal: null as SessionGoalState | null,
  invalidate: vi.fn(() => Promise.resolve()),
  pauseMut: vi.fn(),
  resumeMut: vi.fn(),
  clearMut: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      session: { getGoal: { invalidate: () => fixtures.invalidate() } },
    }),
    session: {
      getGoal: {
        useQuery: () => ({ data: { goal: fixtures.goal, tokens: undefined } }),
      },
      pauseGoal: { useMutation: () => ({ mutate: fixtures.pauseMut }) },
      resumeGoal: { useMutation: () => ({ mutate: fixtures.resumeMut }) },
      clearGoal: { useMutation: () => ({ mutate: fixtures.clearMut }) },
    },
  },
  catchUnlessCancelled: () => () => {},
}));

vi.mock("@/lib/uiStateChannel", () => ({
  subscribeUiState: () => () => {},
}));

function makeGoal(verified: SessionGoalState["verifiedProgress"]): SessionGoalState {
  return {
    mode: "goal",
    text: "过夜目标：把 W7 做完",
    status: "active",
    turnsUsed: 2,
    maxTurns: 10,
    judgeModel: "auto",
    verifiedProgress: verified,
  } as SessionGoalState;
}

describe("ChatGoalBar 已核实步骤", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    fixtures.goal = null;
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

  it("无 goal 不渲染", async () => {
    await act(async () => {
      root.render(<ChatGoalBar sessionId="s1" />);
    });
    expect(container.querySelector('[data-testid="chat-goal-bar"]')).toBeNull();
  });

  it("verifiedProgress 空时不显示展开钮与列表", async () => {
    fixtures.goal = makeGoal([]);
    await act(async () => {
      root.render(<ChatGoalBar sessionId="s1" />);
    });
    expect(container.querySelector('[data-testid="chat-goal-verified"]')).toBeNull();
    expect(container.querySelector('[data-testid="chat-goal-verified-item"]')).toBeNull();
    expect(container.querySelector('[data-testid="chat-goal-verified-count"]')?.textContent).toContain("已核实 0 步");
  });

  it("verifiedProgress 非空：展开列 claim，每条 chat-goal-verified-item", async () => {
    fixtures.goal = makeGoal([
      { id: "v1", claim: "已核实：W1 实验表冻结", evidenceRefs: ["e1"], auditedAt: "2026-08-29T00:00:00.000Z", auditor: "system" },
      { id: "v2", claim: "已核实：W2 书签接到脸", evidenceRefs: ["e2"], auditedAt: "2026-08-29T00:00:00.000Z", auditor: "critic" },
    ]);
    await act(async () => {
      root.render(<ChatGoalBar sessionId="s1" />);
    });
    expect(container.querySelector('[data-testid="chat-goal-verified-count"]')?.textContent).toContain("已核实 2 步");
    const toggle = container.querySelector('[data-testid="chat-goal-verified"]');
    expect(toggle).not.toBeNull();
    // 初始未展开
    expect(container.querySelector('[data-testid="chat-goal-verified-item"]')).toBeNull();
    await act(async () => {
      toggle!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const items = container.querySelectorAll('[data-testid="chat-goal-verified-item"]');
    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toContain("W1 实验表冻结");
    expect(items[1]?.textContent).toContain("W2 书签接到脸");
  });
});
