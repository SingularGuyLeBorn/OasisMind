"use client";

/**
 * Chat 输入框草稿预填（工具结果「引用这段」等）
 * 同页用 CustomEvent；跨标签走 BroadcastChannel oasismind-ui-state。
 */

export const COMPOSE_PREFILL_EVENT = "oasismind-compose-prefill";

export type ComposePrefillDetail = {
  text: string;
  nonce: number;
};

export function requestComposePrefill(text: string): void {
  const detail: ComposePrefillDetail = { text, nonce: Date.now() };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COMPOSE_PREFILL_EVENT, { detail }));
    try {
      const bc = new BroadcastChannel("oasismind-ui-state");
      bc.postMessage({ type: "compose_prefill", ...detail });
      bc.close();
    } catch {
      /* ignore */
    }
  }
}

export const SAVE_TOOL_RESULT_EVENT = "oasismind-save-tool-result";

export type SaveToolResultDetail = {
  sessionId: string;
  path: string;
  previewTitle?: string;
  previewExcerpt?: string;
};

export function requestSaveToolResult(detail: SaveToolResultDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SAVE_TOOL_RESULT_EVENT, { detail }));
}

export function formatToolArtifactCite(opts: {
  path: string;
  content: string;
  toolName?: string;
}): string {
  const body = opts.content.trim().slice(0, 6000);
  const name = opts.toolName ? opts.toolName.replace(/^native:/, "") : "tool";
  return (
    `请基于以下工具结果（${name}）继续，勿假装已读未给出的部分：\n` +
    `路径: ${opts.path}\n` +
    "```\n" +
    body +
    (opts.content.trim().length > 6000 ? "\n…（已截断，可用 read_file 继续）" : "") +
    "\n```\n"
  );
}
