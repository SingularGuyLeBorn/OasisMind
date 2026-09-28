/**
 * 文件面板读当前路径 MessageStore，换叶后不得还显示旁路 write_file。
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ChatFilesPanel } from "@/components/chatFilesPanel";
import {
  __resetSessionMessageStoreForTests,
  sessionMessagesStore,
} from "@/lib/useSessionMessages";
import type { ChatMessage } from "@oasismind/shared";

function msg(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: "m1",
    sessionId: "s1",
    role: "assistant",
    content: "已写",
    parentId: null,
    label: null,
    kind: null,
    attachments: [],
    toolCalls: null,
    toolResults: null,
    tokenUsage: null,
    finishReason: "stop",
    source: "user",
    createdAt: new Date("2026-08-29T00:00:00Z"),
    ...overrides,
  };
}

describe("ChatFilesPanel 当前路径", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    __resetSessionMessageStoreForTests();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    __resetSessionMessageStoreForTests();
  });

  it("当前路径有 write_file 才列出；换成无文件路径则空", async () => {
    sessionMessagesStore.hydrateSessionMessages(
      "s1",
      [
        msg({
          id: "a-write",
          toolCalls: [
            {
              id: "c1",
              name: "write_file",
              args: { path: "mock-branch-draft.md", content: "greeting-branch-draft" },
            },
          ],
        }),
      ],
      "active_path",
    );

    await act(async () => {
      root.render(<ChatFilesPanel sessionId="s1" open onClose={() => {}} />);
    });
    expect(container.querySelector('[data-file-name="mock-branch-draft.md"]')?.textContent).toContain(
      "mock-branch-draft.md",
    );

    await act(async () => {
      sessionMessagesStore.hydrateSessionMessages(
        "s1",
        [msg({ id: "a-search", content: "OasisMind 是一个本地优先", toolCalls: [] })],
        "active_path",
      );
    });
    expect(container.querySelector('[data-testid="chat-files-empty"]')).toBeTruthy();
    expect(container.querySelector('[data-file-name="mock-branch-draft.md"]')).toBeNull();
  });
});
