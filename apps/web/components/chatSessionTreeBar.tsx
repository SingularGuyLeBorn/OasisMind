"use client";

/**
 * 会话树：分支数 + 从当前分叉点切叶。
 * 推：session_tree_updated；拉：session.tree。
 */

import { useState } from "react";
import { GitFork } from "lucide-react";
import { trpc, catchUnlessCancelled } from "@/lib/trpc";
import { countBranches, isAncestorOfLeaf, listBranchChildren, subtreeTipId } from "@/lib/chatTreeUi";
import { hydrateAfterSessionTreeChange } from "@/lib/sessionTreeHydrate";

export function ChatSessionTreeBar({
  sessionId,
  disabled,
}: {
  sessionId: string | null;
  disabled?: boolean;
}) {
  const utils = trpc.useUtils();
  const [switchError, setSwitchError] = useState<string | null>(null);
  const treeQ = trpc.session.tree.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId, staleTime: 5_000, refetchOnWindowFocus: true },
  );
  const runningQ = trpc.session.listRunning.useQuery(undefined, {
    enabled: !!sessionId,
    refetchOnWindowFocus: true,
  });
  const hubOccupied =
    !!sessionId && (runningQ.data?.items ?? []).some((item) => item.sessionId === sessionId);
  const switchMut = trpc.session.switchBranch.useMutation({
    onSuccess: () => {
      if (!sessionId) return;
      setSwitchError(null);
      hydrateAfterSessionTreeChange(utils, sessionId, catchUnlessCancelled("tree.switch"));
    },
    onError: () => {
      setSwitchError("换叶失败");
    },
  });

  const tree = treeQ.data;
  if (!sessionId || !tree) return null;

  const forkIds = Object.keys(tree.children).filter((pid) => {
    const n = countBranches(tree.children, pid, Object.fromEntries(tree.nodes.map((n) => [n.id, n.kind])));
    return n >= 2;
  });
  if (forkIds.length === 0) return null;

  const nodeList = tree.nodes.map((n) => ({
    id: n.id,
    kind: n.kind,
    contentPreview: n.contentPreview,
    role: n.role,
  }));
  // 书签芯片：label 非空且非 branch_summary 的节点；点击跳到该节点子树叶（与分叉按钮同一套换叶）。
  const bookmarkNodes = tree.nodes.filter((n) => !!n.label && n.kind !== "branch_summary");

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 border-b border-[var(--om-divider)] px-3 py-1 text-[10px] text-[var(--om-text-2)]"
      data-testid="chat-session-tree-bar"
    >
      <GitFork className="h-3 w-3 shrink-0 text-[var(--om-text-3)]" />
      <span>会话树</span>
      {forkIds.map((pid) => {
        const kids = listBranchChildren(tree.children, pid, nodeList);
        const parent = tree.nodes.find((n) => n.id === pid);
        return (
          <span key={pid} className="inline-flex items-center gap-1">
            <span className="text-[var(--om-text-3)]">{parent?.contentPreview?.slice(0, 16) || "分叉"}</span>
            {kids.map((k) => {
              const active = tree.activeLeafId === k.id || isAncestorOfLeaf(tree, k.id);
              return (
                <button
                  key={k.id}
                  type="button"
                  disabled={disabled || hubOccupied || switchMut.isPending || active}
                  aria-pressed={active}
                  data-testid="chat-tree-branch-btn"
                  data-active={active ? "true" : "false"}
                  title={k.preview}
                  onClick={() => {
                    if (active) return;
                    setSwitchError(null);
                    const tip = subtreeTipId(tree.children, k.id, tree.nodes);
                    switchMut.mutate({ sessionId, messageId: tip });
                  }}
                  className={
                    active
                      ? "rounded-md bg-[var(--om-brand-soft)] px-1.5 py-0.5 text-[9px] text-[var(--om-brand-deep)]"
                      : "rounded-md px-1.5 py-0.5 text-[9px] hover:bg-[var(--om-bg-mute)]"
                  }
                >
                  {k.preview.slice(0, 18) || k.role}
                </button>
              );
            })}
          </span>
        );
      })}
      {bookmarkNodes.length > 0 ? (
        <span className="mx-1 inline-flex flex-wrap items-center gap-1" data-testid="chat-bookmark-chips">
          {bookmarkNodes.map((n) => {
            const label = n.label ?? "";
            const tip = subtreeTipId(tree.children, n.id, tree.nodes);
            const onPath = tip === tree.activeLeafId;
            return (
              <button
                key={`bm-${n.id}`}
                type="button"
                data-testid="chat-bookmark-chip"
                data-message-id={n.id}
                disabled={disabled || hubOccupied || switchMut.isPending || onPath}
                title={n.contentPreview}
                onClick={() => {
                  if (onPath) return;
                  setSwitchError(null);
                  switchMut.mutate({ sessionId, messageId: tip });
                }}
                className={
                  onPath
                    ? "rounded-md bg-[var(--om-brand-soft)] px-1.5 py-0.5 text-[9px] text-[var(--om-brand-deep)]"
                    : "rounded-md px-1.5 py-0.5 text-[9px] hover:bg-[var(--om-bg-mute)]"
                }
              >
                {label === "书签" ? "书签" : label.slice(0, 12)}
              </button>
            );
          })}
        </span>
      ) : null}
      {switchError ? (
        <span data-testid="chat-tree-switch-error" className="text-red-600">
          {switchError}
        </span>
      ) : null}
    </div>
  );
}
