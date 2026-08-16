/**
 * 会话树脸 + 本轮检查器 + 瘦卡另存：按钮与只读面板可见。
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MessageActions } from "@/components/chatMessageBits";
import { ChatTurnInspect } from "@/components/chatTurnInspect";
import { ThinkingTimeline } from "@/components/chatTimelineSteps";
import { requestSaveToolResult } from "@/lib/composePrefill";

vi.mock("@/lib/composePrefill", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/composePrefill")>();
  return {
    ...actual,
    requestSaveToolResult: vi.fn(),
  };
});

vi.mock("@/lib/trpc", () => ({
  trpc: {
    session: {
      inspectTurn: {
        useQuery: () => ({
          data: {
            sessionId: "s1",
            activeLeafId: "m2",
            visibleNative: ["read_file"],
            hidden: [{ name: "run_shell", reason: "hidden" }],
            pathMessageCount: 2,
            lastUserPreview: "现行任务",
            hasRuntimeContext: false,
            contextSummaryPreview: null,
          },
        }),
      },
      readToolResult: {
        useQuery: () => ({ data: null }),
      },
    },
  },
  catchUnlessCancelled: () => () => {},
}));

describe("Chat 树 / 检查器 / 瘦卡另存", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.mocked(requestSaveToolResult).mockClear();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("MessageActions 显示「从这里另写」", async () => {
    const onFork = vi.fn();
    await act(async () => {
      root.render(
        <div className="group/msg">
          <MessageActions
            onCopy={() => {}}
            showForkFrom
            onForkFrom={onFork}
            showSpeak={false}
            showShare={false}
          />
        </div>,
      );
    });
    const btn = container.querySelector('[data-testid="message-fork-from-btn"]') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.getAttribute("aria-label")).toBe("从这里另写");
    await act(async () => {
      btn.click();
    });
    expect(onFork).toHaveBeenCalledTimes(1);
  });

  it("ChatTurnInspect 展示可见 / 隐藏工具与路径条数", async () => {
    await act(async () => {
      root.render(<ChatTurnInspect sessionId="s1" />);
    });
    expect(container.querySelector('[data-testid="chat-turn-inspect"]')).not.toBeNull();
    const toggle = container.querySelector(
      '[data-testid="chat-turn-inspect-toggle"]',
    ) as HTMLButtonElement;
    expect(toggle.textContent).toContain("本轮可见 1 个工具");
    expect(toggle.textContent).toContain("路径 2 条");
    await act(async () => {
      toggle.click();
    });
    expect(container.querySelector('[data-testid="chat-turn-inspect-visible"]')?.textContent).toContain(
      "read_file",
    );
    expect(container.querySelector('[data-testid="chat-turn-inspect-hidden"]')?.textContent).toContain(
      "run_shell",
    );
  });

  it("瘦卡「另存为文章」走 requestSaveToolResult", async () => {
    await act(async () => {
      root.render(
        <ThinkingTimeline
          sessionId="s1"
          steps={[
            {
              type: "tool",
              toolCallId: "c1",
              name: "native:read_article",
              args: {},
              result: {
                offloaded: true,
                path: "data/tool-results/s1/c1.json",
                originalChars: 8000,
              },
              round: 1,
              status: "done",
            },
          ]}
        />,
      );
    });
    const save = container.querySelector(
      '[data-testid="tool-offload-save-post"]',
    ) as HTMLButtonElement;
    expect(save).not.toBeNull();
    await act(async () => {
      save.click();
    });
    expect(requestSaveToolResult).toHaveBeenCalledWith({
      sessionId: "s1",
      path: "data/tool-results/s1/c1.json",
      previewTitle: "read_article",
      previewExcerpt: "落盘 8000 字",
    });
  });
});
