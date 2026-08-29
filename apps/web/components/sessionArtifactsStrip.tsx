"use client";

/**
 * 会话级产物条：SSE artifact_created 的即时提示。
 * 默认一行摘要，禁止把每条落盘路径铺成输入框上方的卡片墙。
 */

import { useEffect, useState } from "react";
import { ChevronRight, FileText, X } from "lucide-react";
import { formatToolDisplayName } from "@/lib/toolDisplayName";
import { cn } from "@/lib/utils";

export type SessionArtifact = {
  artifactKind: string;
  title?: string;
  path: string;
  mime?: string;
  toolCallId: string;
  toolName: string;
  at: number;
};

function artifactLabel(a: SessionArtifact): string {
  if (a.title?.trim()) return a.title.trim();
  return formatToolDisplayName(a.toolName) || "产物";
}

/** 超长工具输出落盘是防撑爆上下文，不是给人看的产物；时间线 pill 已覆盖。 */
function isInfraOffload(a: SessionArtifact): boolean {
  if (a.artifactKind === "tool_result") return true;
  return a.path.replace(/\\/g, "/").includes("/tool-results/");
}

export function SessionArtifactsStrip({ sessionId }: { sessionId: string | null }) {
  const [items, setItems] = useState<SessionArtifact[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [prevSessionId, setPrevSessionId] = useState<string | null>(sessionId);

  // 切换会话时清空产物与展开态：用 React 官方「render 期比对上一帧 prop」模式重置，
  // 不在 effect 里 setState，避免级联渲染（react-hooks/set-state-in-effect）。
  if (sessionId !== prevSessionId) {
    setPrevSessionId(sessionId);
    setItems([]);
    setExpanded(false);
  }

  useEffect(() => {
    if (!sessionId) return;
    const onArt = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as SessionArtifact & { sessionId?: string };
      if (detail.sessionId && detail.sessionId !== sessionId) return;
      if (isInfraOffload(detail)) return;
      setItems((prev) => {
        if (prev.some((p) => p.path === detail.path && p.toolCallId === detail.toolCallId)) {
          return prev;
        }
        return [{ ...detail, at: Date.now() }, ...prev].slice(0, 8);
      });
    };
    window.addEventListener("kp:artifact-created", onArt);
    return () => window.removeEventListener("kp:artifact-created", onArt);
  }, [sessionId]);

  const visible = items.filter((a) => !isInfraOffload(a));
  if (!sessionId || visible.length === 0) return null;

  return (
    <div className="mb-2" data-testid="session-artifacts-strip">
      <div className="flex items-center gap-0.5 rounded-lg border border-[var(--om-divider)] bg-[var(--om-bg-alt)]/90">
        <button
          type="button"
          data-testid="session-artifacts-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 px-3 py-1.5 text-left text-[11px] text-[var(--om-text-2)] hover:bg-[var(--om-bg-mute)]"
        >
          <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--om-brand)]" />
          <span className="min-w-0 flex-1 truncate font-medium">{visible.length} 个产物</span>
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-[var(--om-text-3)] transition-transform",
              expanded && "rotate-90",
            )}
          />
        </button>
        <button
          type="button"
          data-testid="session-artifacts-dismiss"
          aria-label="关闭产物条"
          className="rounded p-1.5 text-[var(--om-text-3)] hover:bg-[var(--om-bg-mute)]"
          onClick={() => {
            setItems([]);
            setExpanded(false);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {expanded && (
        <ul className="mt-1 space-y-1" data-testid="session-artifacts-list">
          {visible.map((a) => (
            <li
              key={`${a.toolCallId}-${a.path}`}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-[11px]"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-[var(--om-text-2)]">{artifactLabel(a)}</div>
                <div className="truncate font-mono text-[10px] text-[var(--om-text-3)]" title={a.path}>
                  {a.path}
                </div>
              </div>
              <button
                type="button"
                className="rounded p-1 text-[var(--om-text-3)] hover:bg-[var(--om-bg-mute)]"
                aria-label={`移除 ${artifactLabel(a)}`}
                onClick={() =>
                  setItems((prev) => prev.filter((p) => p.toolCallId !== a.toolCallId || p.path !== a.path))
                }
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
