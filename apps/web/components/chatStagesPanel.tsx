"use client";

/**
 * Chat 阶段工件侧栏（W6）：展示当前 Agent Workspace 的 stage 文件元信息。
 * PUSH：workspace_stages_updated（SSE/BC）→ invalidate；PULL：workspace.listStages + refetchInterval。
 */

import { useEffect } from "react";
import { GitFork, PanelRightClose, FileCode } from "lucide-react";
import { catchUnlessCancelled, trpc } from "@/lib/trpc";
import { subscribeUiState } from "@/lib/uiStateChannel";

type StageItem = {
  stage: string;
  fileName: string;
  relPath: string;
  title: string;
  updatedAt: string;
  bytes: number;
};

export function ChatStagesPanel({
  workspaceId,
  open,
  onClose,
}: {
  workspaceId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const stagesQ = trpc.workspace.listStages.useQuery(
    { workspaceId: workspaceId ?? undefined },
    { enabled: !!workspaceId, refetchInterval: 60_000, refetchOnWindowFocus: true },
  );

  useEffect(() => {
    return subscribeUiState((msg) => {
      if (msg.type !== "workspace_stages_updated") return;
      utils.workspace.listStages.invalidate().catch(catchUnlessCancelled("components/chatStagesPanel.tsx"));
    });
  }, [utils]);

  if (!open) return null;

  const items = (stagesQ.data?.items ?? []) as StageItem[];

  return (
    <aside
      className="flex w-[300px] shrink-0 flex-col border-l border-[var(--om-divider)] bg-[var(--om-bg)]"
      data-testid="chat-stages-panel"
    >
      <div className="flex items-center gap-2 border-b border-[var(--om-divider)] px-3 py-2">
        <GitFork className="h-4 w-4 text-[var(--om-text-2)]" />
        <span className="flex-1 text-sm font-semibold text-[var(--om-text-1)]">阶段工件</span>
        <span className="text-xs text-[var(--om-text-3)]">{items.length}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-[var(--om-text-2)] transition-colors hover:bg-[var(--om-bg-alt)] hover:text-[var(--om-text-1)]"
          aria-label="关闭面板"
          title="关闭面板"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {items.length === 0 ? (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-[var(--om-text-3)]"
          data-testid="chat-stages-empty"
        >
          <FileCode className="h-8 w-8 opacity-40" />
          <p>尚无阶段工件</p>
          <p className="text-xs">派子深挖时写 research.md</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {items.map((s) => (
            <div
              key={s.fileName}
              data-testid="chat-stage-item"
              data-stage={s.stage}
              className="flex items-center gap-3 border-b border-[var(--om-divider)] px-3 py-2.5"
            >
              <FileCode className="h-4 w-4 shrink-0 text-orange-600" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-[var(--om-text-1)]">{s.title || s.stage}</span>
                <span className="text-xs text-[var(--om-text-3)]">{s.relPath}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
