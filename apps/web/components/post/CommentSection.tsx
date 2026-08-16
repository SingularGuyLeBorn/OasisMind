"use client";

/**
 * 访客轻留言：昵称 + 正文，即时可见；业主可隐藏。
 * 推拉：提交后 invalidate + BroadcastChannel；挂载时短轮询兜底。
 */

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { trpc, catchUnlessCancelled } from "@/lib/trpc";
import { postUiState, UI_STATE_CHANNEL } from "@/lib/uiStateChannel";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared";

const NAME_KEY = "om-blog-comment-name";

export function CommentSection({
  postId,
  className,
}: {
  postId: string;
  className?: string;
}) {
  const utils = trpc.useUtils();
  const { data: authStatus } = trpc.auth.status.useQuery(undefined, { retry: false });
  const canModerate = !authStatus?.enabled || !!authStatus?.authenticated;
  const [authorName, setAuthorName] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isFetching } = trpc.comment.listForPost.useQuery(
    { postId, page: 1, pageSize: 50 },
    {
      enabled: !!postId,
      staleTime: 10_000,
      refetchInterval: 20_000,
    },
  );

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    let bc: BroadcastChannel;
    try {
      bc = new BroadcastChannel(UI_STATE_CHANNEL);
    } catch {
      return;
    }
    const onMsg = (ev: MessageEvent) => {
      const msg = ev.data;
      if (!msg || msg.type !== "comment_updated") return;
      if (msg.postId && msg.postId !== postId) return;
      utils.comment.listForPost
        .invalidate({ postId })
        .catch(catchUnlessCancelled("CommentSection"));
    };
    bc.addEventListener("message", onMsg);
    return () => {
      bc.removeEventListener("message", onMsg);
      bc.close();
    };
  }, [postId, utils]);

  const createMut = trpc.comment.create.useMutation({
    onSuccess: (res) => {
      if (!res.success) {
        setError(res.error?.message || "留言失败");
        return;
      }
      setContent("");
      setError(null);
      try {
        localStorage.setItem(NAME_KEY, authorName.trim());
      } catch {
        /* ignore */
      }
      postUiState({ type: "comment_updated", postId });
      utils.comment.listForPost
        .invalidate({ postId })
        .catch(catchUnlessCancelled("CommentSection"));
    },
    onError: (err) => {
      setError(err.message || "留言失败");
    },
  });

  const hideMut = trpc.comment.hide.useMutation({
    onSuccess: (res) => {
      if (!res.success) return;
      postUiState({ type: "comment_updated", postId });
      utils.comment.listForPost
        .invalidate({ postId })
        .catch(catchUnlessCancelled("CommentSection"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = authorName.trim();
    const body = content.trim();
    if (!name || !body) {
      setError("请填写昵称和留言内容");
      return;
    }
    createMut.mutate({ postId, authorName: name, content: body });
  };

  const items = data?.items ?? [];

  return (
    <section
      className={cn("mt-12 border-t border-[var(--om-divider)] pt-8", className)}
      data-testid="comment-section"
    >
      <div className="mb-5 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-[var(--om-brand)]" />
        <h2 className="text-base font-semibold text-[var(--om-text-1)]">留言</h2>
        <span className="text-xs text-[var(--om-text-3)]">
          {data?.total ?? 0} 条
          {isFetching && !isLoading ? " · 刷新中" : ""}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <Input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="昵称"
          maxLength={40}
          className="max-w-xs"
          disabled={createMut.isPending}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说点什么…（纯文本，最多 2000 字）"
          maxLength={2000}
          rows={3}
          disabled={createMut.isPending}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={createMut.isPending}
            className={cn(buttonVariants({ size: "sm" }), "inline-flex items-center gap-1.5")}
          >
            {createMut.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            发表留言
          </button>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </form>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--om-text-3)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          加载留言…
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="还没有留言" description="来做第一条吧" />
      ) : (
        <ul className="space-y-4">
          {items.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-[var(--om-divider)] bg-[var(--om-bg-soft)]/40 px-4 py-3"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-[var(--om-text-1)]">
                    {c.authorName}
                  </span>
                  <time className="shrink-0 text-xs text-[var(--om-text-3)]">
                    {new Date(c.createdAt).toLocaleString("zh-CN")}
                  </time>
                </div>
                {canModerate ? (
                  <button
                    type="button"
                    title="隐藏留言"
                    disabled={hideMut.isPending}
                    onClick={() => hideMut.mutate({ id: c.id })}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--om-text-3)] transition hover:bg-[var(--om-bg-mute)] hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--om-text-2)]">
                {c.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
