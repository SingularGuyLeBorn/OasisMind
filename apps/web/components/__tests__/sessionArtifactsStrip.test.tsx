/**
 * 产物条默认一行摘要，禁止把落盘路径铺成输入框上方卡片墙。
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SessionArtifactsStrip } from "@/components/sessionArtifactsStrip";

function fireArtifact(partial: {
  sessionId: string;
  toolCallId: string;
  path: string;
  toolName: string;
  artifactKind?: string;
}) {
  window.dispatchEvent(
    new CustomEvent("kp:artifact-created", {
      detail: {
        artifactKind: partial.artifactKind ?? "tool_result",
        path: partial.path,
        toolCallId: partial.toolCallId,
        toolName: partial.toolName,
        sessionId: partial.sessionId,
      },
    }),
  );
}

describe("SessionArtifactsStrip", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  it("工具落盘 JSON 不进输入框上方（时间线 pill 已覆盖）", async () => {
    await act(async () => {
      root.render(<SessionArtifactsStrip sessionId="s1" />);
    });
    await act(async () => {
      fireArtifact({
        sessionId: "s1",
        toolCallId: "c1",
        path: "data/tool-results/s1/call_a.json",
        toolName: "read_file",
      });
      fireArtifact({
        sessionId: "s1",
        toolCallId: "c2",
        path: "data/tool-results/s1/call_b.json",
        toolName: "post_list",
      });
      fireArtifact({
        sessionId: "s1",
        toolCallId: "c3",
        path: "data/tool-results/s1/call_c.json",
        toolName: "garden_get",
      });
    });

    expect(container.querySelector('[data-testid="session-artifacts-strip"]')).toBeNull();
    expect(container.textContent).not.toContain("ToolResult");
    expect(container.textContent).not.toContain("data/tool-results");
  });

  it("真正产物默认一行摘要；点开才见路径；切会话清空", async () => {
    await act(async () => {
      root.render(<SessionArtifactsStrip sessionId="s1" />);
    });
    await act(async () => {
      fireArtifact({
        sessionId: "s1",
        toolCallId: "c1",
        path: "workspaces/__assistant__/out.png",
        toolName: "write_file",
        artifactKind: "file",
      });
      fireArtifact({
        sessionId: "s1",
        toolCallId: "c2",
        path: "workspaces/__assistant__/chart.svg",
        toolName: "write_file",
        artifactKind: "file",
      });
    });

    expect(container.querySelector('[data-testid="session-artifacts-toggle"]')?.textContent).toContain(
      "2 个产物",
    );
    expect(container.querySelector('[data-testid="session-artifacts-list"]')).toBeNull();
    expect(container.textContent).not.toContain("workspaces/__assistant__/out.png");
    expect(container.textContent).not.toContain("ToolResult");

    const toggle = container.querySelector(
      '[data-testid="session-artifacts-toggle"]',
    ) as HTMLButtonElement;
    await act(async () => {
      toggle.click();
    });
    expect(container.querySelector('[data-testid="session-artifacts-list"]')).toBeTruthy();
    expect(container.textContent).toContain("workspaces/__assistant__/out.png");
    expect(container.textContent).toContain("WriteFile");

    await act(async () => {
      root.render(<SessionArtifactsStrip sessionId="s2" />);
    });
    expect(container.querySelector('[data-testid="session-artifacts-strip"]')).toBeNull();
  });
});
