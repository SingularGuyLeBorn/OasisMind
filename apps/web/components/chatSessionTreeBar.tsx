"use client";

/**
 * 会话树：分支数 + 从当前分叉点切叶。
 * 推：session_tree_updated；拉：session.tree。
 */

import { GitFork } from "lucide-react";
import { trpc, catchUnlessCancelled } from "@/lib/trpc";
import { countBranches, listBranchChildren } from "@/lib/chatTreeUi";
import { sessionMessagesStore } from "@/lib/useSessionMessages";

export function ChatSessionTreeBar({
  sessionId,
  disabled,
}: {
  sessionId: string | null;
  disabled?: boolean;
}) {
  const utils = trpc.useUtils();
  const treeQ = trpc.session.tree.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId, staleTime: 5_000, refetchOnWindowFocus: true },
  );
  const switchMut = trpc.session.switchBranch.useMutation({
    onSuccess: () => {
      if (!sessionId) return;
      const log = catchUnlessCancelled("tree.switch");
      utils.session.tree.invalidate({ sessionId }).catch(log);
      utils.session.inspectTurn.invalidate({ sessionId }).catch(log);
      utils.message.listForChat
        .fetch({ sessionId, limit: 50 })
        .then((page) => {
          sessionMessagesStore.hydrateSessionMessages(
            sessionId,
            (page.items ?? []) as import("@oasismind/shared").ChatMessage[],
            "view",
          );
        })
        .catch(log);
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
                  disabled={disabled || switchMut.isPending}
                  data-testid="chat-tree-branch-btn"
                  data-active={active ? "true" : "false"}
                  title={k.preview}
                  onClick={() => {
                    switchMut.mutate({ sessionId, messageId: k.id });
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
    </div>
  );
}

function isAncestorOfLeaf(
  tree: { activeLeafId: string | null; nodes: Array<{ id: string; parentId: string | null }> },
  nodeId: string,
): boolean {
  if (!tree.activeLeafId) return false;
  const byId = new Map(tree.nodes.map((n) => [n.id, n]));
  let cur: string | null = tree.activeLeafId;
  const seen = new Set<string>();
  while (cur && !seen.has(cur)) {
    if (cur === nodeId) return true;
    seen.add(cur);
    cur = byId.get(cur)?.parentId ?? null;
  }
  return false;
}
