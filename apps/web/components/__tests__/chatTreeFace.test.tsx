/**
 * 会话树脸 + 瘦卡另存：按钮与只读面板可见。
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MessageActions, CompactBoundaryCard, MessageMarkdownSourceEditor } from "@/components/chatMessageBits";
import { ThinkingTimeline } from "@/components/chatTimelineSteps";
import { SessionListItem } from "@/components/chatSessionListItem";
import { requestSaveToolResult } from "@/lib/composePrefill";
import type { ChatSession } from "@oasismind/shared";

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
      readToolResult: {
        useQuery: () => ({ data: null }),
      },
    },
    approval: {
      approveAndExecute: {
        useMutation: () => ({ mutate: vi.fn(), isPending: false }),
      },
      update: {
        useMutation: () => ({ mutate: vi.fn(), isPending: false }),
      },
    },
  },
  catchUnlessCancelled: () => () => {},
}));

describe("Chat 树 / 瘦卡另存", () => {
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

  it("Markdown 源码编辑器有稳定 testid", async () => {
    await act(async () => {
      root.render(
        <MessageMarkdownSourceEditor
          value="你好"
          onChange={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
        />,
      );
    });
    expect(container.querySelector('[data-testid="message-markdown-source"]')).not.toBeNull();
  });

  it("重试 / 重新生成按钮有稳定 testid", async () => {
    await act(async () => {
      root.render(
        <div className="group/msg">
          <MessageActions
            onCopy={() => {}}
            showRetry
            onRetry={() => {}}
            showRegenerate
            onRegenerate={() => {}}
            showSpeak={false}
            showShare={false}
          />
        </div>,
      );
    });
    expect(container.querySelector('[data-testid="message-retry-btn"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="message-regenerate-btn"]')).not.toBeNull();
  });

  it("流式中「从这里另写」禁用", async () => {
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
            disabled
          />
        </div>,
      );
    });
    const btn = container.querySelector('[data-testid="message-fork-from-btn"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    await act(async () => {
      btn.click();
    });
    expect(onFork).not.toHaveBeenCalled();
  });

  it("旁路摘要卡展示 Mock 正文", async () => {
    await act(async () => {
      root.render(
        <CompactBoundaryCard
          message={{
            id: "sum",
            sessionId: "s1",
            role: "system",
            content: "[om-branch-summary]\n【Mock 旁路摘要】已压缩被放弃分支的目标、决策与未完成项。",
            kind: "branch_summary",
            createdAt: new Date().toISOString(),
            toolCalls: null,
            toolResults: null,
            tokenUsage: null,
          } as never}
        />,
      );
    });
    const card = container.querySelector('[data-testid="branch-summary-card"]');
    expect(card).not.toBeNull();
    expect(container.querySelector('[data-testid="branch-summary-preview"]')?.textContent).toContain(
      "【Mock 旁路摘要】",
    );
    const toggle = container.querySelector('[data-testid="branch-summary-toggle"]') as HTMLButtonElement;
    expect(toggle).not.toBeNull();
    await act(async () => {
      toggle.click();
    });
    expect(container.querySelector('[data-testid="branch-summary-body"]')?.textContent).toContain(
      "【Mock 旁路摘要】",
    );
    expect(container.querySelector('[data-testid="branch-summary-preview"]')).toBeNull();
    await act(async () => {
      toggle.click();
    });
    expect(container.querySelector('[data-testid="branch-summary-preview"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="message-fork-from-btn"]')).toBeNull();
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

  it("工具瘦卡摘要锁单行，展开区不靠 hover 撑高", async () => {
    await act(async () => {
      root.render(
        <ThinkingTimeline
          sessionId="s1"
          steps={[
            {
              type: "tool",
              toolCallId: "c1",
              name: "native:read_file",
              args: { path: "a.md" },
              result: {
                offloaded: true,
                path: "data/tool-results/s1/c1.json",
                originalChars: 8000,
                metadata: {
                  hasError: true,
                  shortFields: { error: "文件不存在: content/llm-guide/very/long/path.md" },
                  fieldSizes: {},
                },
              },
              round: 1,
              status: "done",
            },
          ]}
        />,
      );
    });
    const summary = container.querySelector(
      '[data-testid="tool-pill"] summary',
    ) as HTMLElement;
    expect(summary.className).toContain("h-9");
    expect(summary.className).toContain("overflow-hidden");
    const hint = container.querySelector('[data-testid="tool-timing-hint"]') as HTMLElement;
    expect(hint.className).toContain("truncate");
    expect(hint.textContent).toContain("失败");
    expect(hint.textContent).not.toContain("全文已存");
    expect(hint.className).toContain("text-red-600");
    const details = container.querySelector('[data-testid="tool-pill"] details') as HTMLDetailsElement;
    await act(async () => {
      details.open = true;
      details.dispatchEvent(new Event("toggle", { bubbles: true }));
    });
    const toggles = container.querySelectorAll('[data-testid="tool-json-view-toggle"]');
    expect(toggles.length).toBeGreaterThan(0);
    for (const btn of toggles) {
      expect(btn.className).toContain("om-tool-json-toggle");
    }
  });

  it("未压缩写盘不出现落盘条和另存", async () => {
    await act(async () => {
      root.render(
        <ThinkingTimeline
          sessionId="s1"
          steps={[
            {
              type: "tool",
              toolCallId: "c1",
              name: "native:post_list",
              args: { garden: "llm-guide" },
              result: {
                _om_persisted: true,
                _om_result_path: "data/tool-results/s1/c1.json",
                _om_original_chars: 1904,
                total: 61,
                page: 1,
                items: [{ id: "p1", title: "线性注意力" }],
              },
              round: 1,
              status: "done",
            },
          ]}
        />,
      );
    });
    expect(container.querySelector('[data-testid="tool-offload-save-post"]')).toBeNull();
    expect(container.querySelector('[data-testid="tool-offload-panel"]')).toBeNull();
    const hint = container.querySelector('[data-testid="tool-timing-hint"]');
    expect(hint?.textContent).toBe("61 条");
  });

  it("压缩列表卡 pill 显示条数，不是「5 条」", async () => {
    await act(async () => {
      root.render(
        <ThinkingTimeline
          sessionId="s1"
          steps={[
            {
              type: "tool",
              toolCallId: "c2",
              name: "native:post_list",
              args: {},
              result: {
                offloaded: true,
                path: "data/tool-results/s1/c2.json",
                originalChars: 9000,
                hitCount: 0,
                metadata: {
                  shortFields: { total: "61" },
                  fieldSizes: { items: 5 },
                },
              },
              round: 1,
              status: "done",
            },
          ]}
        />,
      );
    });
    const hint = container.querySelector('[data-testid="tool-timing-hint"]');
    expect(hint?.textContent).toContain("61 条");
    expect(hint?.textContent).not.toContain("5 条");
    expect(hint?.textContent).toContain("全文已存");
    expect(hint?.className).not.toContain("text-red-600");
  });

  it("肥卡展开 JSON 剥掉导航堆，pill 仍显示全文已存和条数", async () => {
    await act(async () => {
      root.render(
        <ThinkingTimeline
          sessionId="s1"
          steps={[
            {
              type: "tool",
              toolCallId: "c-fat",
              name: "native:read_article",
              args: { url: "https://example.com/doc" },
              result: {
                offloaded: true,
                path: "data/tool-results/s1/c-fat.json",
                originalChars: 12000,
                hint: "结论：61 条。正文在 path。",
                metadata: {
                  title: "线性注意力",
                  hasError: false,
                  shortFields: { total: "61" },
                  sampleOffsets: [0, 1000, 2000, 3000],
                  hitOffsets: [{ keyword: "torch", start: 42, end: 47 }],
                  recommendedRead: [{ offset: 42, reason: "keyword:torch", maxChars: 4000 }],
                  urls: [
                    "https://nav-dump.example/p1",
                    "https://nav-dump.example/p2",
                    "https://nav-dump.example/p3",
                    "https://nav-dump.example/p4",
                  ],
                },
              },
              round: 1,
              status: "done",
            },
          ]}
        />,
      );
    });
    const pill = container.querySelector('[data-testid="tool-pill"]') as HTMLElement;
    expect(pill).not.toBeNull();
    const hint = container.querySelector('[data-testid="tool-timing-hint"]');
    expect(hint?.textContent).toContain("全文已存");
    expect(hint?.textContent).toContain("61 条");
    expect(hint?.className).not.toContain("text-red-600");
    expect(container.querySelector('[data-testid="tool-offload-save-post"]')).not.toBeNull();

    const details = pill.querySelector("details") as HTMLDetailsElement;
    await act(async () => {
      details.open = true;
      details.dispatchEvent(new Event("toggle", { bubbles: true }));
    });

    expect(container.querySelector('[data-testid="tool-pill"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="tool-offload-panel"]')).not.toBeNull();
    const json = container.querySelector('[data-testid="tool-json-response"] pre')?.textContent ?? "";
    expect(json).toContain("originalChars");
    expect(json).toContain("shortFields");
    expect(json).toContain("线性注意力");
    expect(json).not.toContain("sampleOffsets");
    expect(json).not.toContain("keyword:torch");
    expect(json).not.toContain("nav-dump.example");
    expect(json).not.toContain("hitOffsets");
    expect(json).not.toContain("recommendedRead");
  });

  it("肥卡失败：pill 红字失败，展开 JSON 仍无 sampleOffsets，仍可另存", async () => {
    await act(async () => {
      root.render(
        <ThinkingTimeline
          sessionId="s1"
          steps={[
            {
              type: "tool",
              toolCallId: "c-fat-err",
              name: "native:read_file",
              args: { path: "missing.md" },
              result: {
                offloaded: true,
                path: "data/tool-results/s1/c-fat-err.json",
                originalChars: 4000,
                metadata: {
                  hasError: true,
                  shortFields: { error: "文件不存在: foo.md" },
                  sampleOffsets: [0, 1000, 2000],
                  hitOffsets: [{ keyword: "torch", start: 1, end: 6 }],
                  recommendedRead: [{ offset: 0, reason: "keyword:torch", maxChars: 800 }],
                  urls: ["https://nav-dump.example/err"],
                },
              },
              round: 1,
              status: "done",
            },
          ]}
        />,
      );
    });
    const hint = container.querySelector('[data-testid="tool-timing-hint"]') as HTMLElement;
    expect(hint.textContent).toContain("失败");
    expect(hint.textContent).not.toContain("全文已存");
    expect(hint.className).toContain("text-red-600");
    expect(container.querySelector('[data-testid="tool-offload-save-post"]')).not.toBeNull();

    const details = container.querySelector(
      '[data-testid="tool-pill"] details',
    ) as HTMLDetailsElement;
    await act(async () => {
      details.open = true;
      details.dispatchEvent(new Event("toggle", { bubbles: true }));
    });

    const json = container.querySelector('[data-testid="tool-json-response"] pre')?.textContent ?? "";
    expect(json).not.toContain("sampleOffsets");
    expect(json).not.toContain("keyword:torch");
    expect(json).toContain("hasError");
    expect(json).toContain("shortFields");
    expect(container.querySelector('[data-testid="tool-pill"]')).not.toBeNull();
  });

  it("未压缩结果不剥 sampleOffsets（只对 offloaded 肥卡脱敏）", async () => {
    await act(async () => {
      root.render(
        <ThinkingTimeline
          sessionId="s1"
          steps={[
            {
              type: "tool",
              toolCallId: "c-raw",
              name: "native:post_list",
              args: {},
              result: {
                total: 61,
                items: [{ id: "p1" }],
                sampleOffsets: [0, 1000],
                metadata: {
                  recommendedRead: [{ offset: 0, reason: "keyword:torch" }],
                },
              },
              round: 1,
              status: "done",
            },
          ]}
        />,
      );
    });
    expect(container.querySelector('[data-testid="tool-offload-panel"]')).toBeNull();
    expect(container.querySelector('[data-testid="tool-offload-save-post"]')).toBeNull();
    const hint = container.querySelector('[data-testid="tool-timing-hint"]');
    expect(hint?.textContent).toBe("61 条");

    const details = container.querySelector(
      '[data-testid="tool-pill"] details',
    ) as HTMLDetailsElement;
    await act(async () => {
      details.open = true;
      details.dispatchEvent(new Event("toggle", { bubbles: true }));
    });
    const json = container.querySelector('[data-testid="tool-json-response"] pre')?.textContent ?? "";
    expect(json).toContain("sampleOffsets");
    expect(json).toContain("keyword:torch");
  });

  it("会话列表项带 data-session-id，供切回会话 PULL", async () => {
    const session = {
      id: "sess-branch-1",
      title: "测会话",
      model: "deepseek-v4-flash",
      systemPrompt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ChatSession;
    await act(async () => {
      root.render(
        <SessionListItem
          session={session}
          active={false}
          editing={false}
          renameDraft=""
          onSelect={() => {}}
          onStartRename={() => {}}
          onRenameDraftChange={() => {}}
          onConfirmRename={() => {}}
          onCancelRename={() => {}}
          onDelete={() => {}}
        />,
      );
    });
    const item = container.querySelector('[data-testid="session-list-item"]') as HTMLElement;
    expect(item).not.toBeNull();
    expect(item.getAttribute("data-session-id")).toBe("sess-branch-1");
  });
});
