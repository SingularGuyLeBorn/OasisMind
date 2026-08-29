"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, FileText, Layers, Plus, Trash2 } from "lucide-react";
import { catchUnlessCancelled, trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { ConfirmDialog, EmptyState, LoadingState } from "@/components/shared";
import { ContinueReadingCard } from "@/components/post/ContinueReading";
import { HomeAmbientBackground } from "@/components/home/HomeAmbientBackground";
import { CurlyMark } from "@/components/home/accentMark";
import { SEED_GARDENS } from "@oasismind/shared";
import { formatGardenId } from "@/lib/gardenDisplay";
import { postDetailHref } from "@/lib/postHref";
import { CONTENT_LIST_REFETCH_MS } from "@/lib/adminPullIntervals";
import { subscribeUiState } from "@/lib/uiStateChannel";

const spring = { type: "spring" as const, stiffness: 260, damping: 26 };
const easeOut = [0.22, 1, 0.36, 1] as const;

export default function GardensPage() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.garden.list.useQuery(
    { page: 1, pageSize: 100 },
    { refetchInterval: CONTENT_LIST_REFETCH_MS },
  );
  useEffect(() => {
    return subscribeUiState((msg) => {
      if (msg.type !== "post_list_changed") return;
      utils.garden.list.invalidate().catch(catchUnlessCancelled("app/gardens/page.tsx"));
      utils.post.list.invalidate().catch(catchUnlessCancelled("app/gardens/page.tsx"));
    });
  }, [utils]);
  const create = trpc.garden.create.useMutation({
    onSuccess: () => {
      utils.garden.list.invalidate().catch(catchUnlessCancelled("garden.list.invalidate"));
      setOpen(false);
      setId("");
      setTitle("");
      setDescription("");
      setHomeContent("");
      setError(null);
    },
    onError: (e) => setError(e.message),
  });
  const remove = trpc.garden.delete.useMutation({
    onSuccess: () => {
      utils.garden.list.invalidate().catch(catchUnlessCancelled("garden.list.invalidate"));
      setDeleteId(null);
    },
  });

  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [homeContent, setHomeContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!id.trim() || !title.trim()) {
      setError("请填写 id 与标题");
      return;
    }
    create.mutate({
      id: id.trim(),
      title: title.trim(),
      description: description.trim() || null,
      homeContent: homeContent.trim() || `# ${title.trim()}\n\n欢迎来到本知识库。\n`,
    });
  };

  const items = data?.items ?? [];
  const totalPosts = items.reduce((sum, g) => sum + (g.postCount ?? 0), 0);

  return (
    <div className="om-force-light om-home-surface relative w-full overflow-x-hidden">
      <HomeAmbientBackground density="lite" />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-10 pb-16 lg:px-12 lg:py-14">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="mb-12 text-center sm:mb-14"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--om-brand)]">
            Digital Garden
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.05 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3.5 py-1.5 text-xs font-medium text-[var(--om-text-2)] shadow-sm backdrop-blur-md"
          >
            <Layers className="h-3.5 w-3.5 text-[var(--om-brand)]" />
            数字花园
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--om-text-1)] md:text-5xl">
            知识库 <CurlyMark>Gardens</CurlyMark>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-[var(--om-text-2)] md:text-lg">
            一座库，一个首页，一棵文章树。先选库，再读写。
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.12 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3.5 py-1.5 text-xs text-[var(--om-text-2)] shadow-sm backdrop-blur-md"
            >
              <span className="om-stat-number text-sm font-semibold text-[var(--om-text-1)]">
                {items.length}
              </span>
              座库
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.18 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3.5 py-1.5 text-xs text-[var(--om-text-2)] shadow-sm backdrop-blur-md"
            >
              <FileText className="h-3.5 w-3.5 text-[var(--om-brand)]" />
              <span className="om-stat-number text-sm font-semibold text-[var(--om-text-1)]">
                {totalPosts}
              </span>
              篇文章
            </motion.div>
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.24 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--om-brand)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_-8px_rgba(0,135,235,0.5)] transition hover:-translate-y-0.5 hover:bg-[var(--om-brand-dark)]"
            >
              <Plus className="h-4 w-4" />
              新建知识库
            </motion.button>
          </div>
        </motion.header>

        <ContinueReadingCard className="mx-auto mb-10 max-w-xl" />

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="mb-10 overflow-hidden"
            >
              <div className="om-card-topline om-card-sheen rounded-[1.75rem] border border-white/55 bg-white/60 p-5 shadow-[0_16px_48px_-20px_rgba(0,80,160,0.2)] backdrop-blur-xl sm:p-6">
                <h2 className="mb-4 text-sm font-semibold text-[var(--om-text-1)]">新建知识库</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={id}
                    onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="短标识（如 research-notes）"
                    className="font-mono text-sm"
                  />
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="显示标题"
                    className="text-sm"
                  />
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="一句话说明（可选）"
                    className="sm:col-span-2 text-sm"
                  />
                  <textarea
                    value={homeContent}
                    onChange={(e) => setHomeContent(e.target.value)}
                    placeholder="首页 Markdown（可选，默认生成欢迎文）"
                    rows={4}
                    className="sm:col-span-2 rounded-xl border border-[var(--om-divider)] bg-[var(--om-bg)] px-3 py-2 text-sm text-[var(--om-text-1)] outline-none focus:border-[var(--om-brand)]/40"
                  />
                </div>
                {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={create.isPending}
                    className="inline-flex items-center rounded-full bg-[var(--om-brand)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_-8px_rgba(0,135,235,0.5)] transition hover:bg-[var(--om-brand-dark)] disabled:opacity-60"
                  >
                    {create.isPending ? "创建中…" : "创建"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setError(null);
                    }}
                    className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--om-text-2)] backdrop-blur-md transition hover:border-[var(--om-brand)]/35 hover:text-[var(--om-brand)]"
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <LoadingState />
        ) : !items.length ? (
          <div data-testid="gardens-empty">
            <EmptyState title="还没有知识库" description="点击「新建知识库」创建第一座花园" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((g, index) => {
              const isSeed = (SEED_GARDENS as readonly string[]).includes(g.id);
              const count = g.postCount ?? 0;
              const recent = g.recentPosts ?? [];
              const homeHref = `/gardens/${encodeURIComponent(g.id)}`;
              return (
                <motion.article
                  key={g.id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 + index * 0.08, ease: easeOut }}
                  whileHover={{ y: -8 }}
                  className="om-card-topline om-card-sheen group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-white/55 bg-white/55 p-6 shadow-[0_16px_48px_-20px_rgba(0,80,160,0.22)] backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-500 hover:border-[var(--om-brand)]/35 hover:bg-white/75 hover:shadow-[0_22px_56px_-18px_rgba(0,135,235,0.32)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--om-glow-peach)]/0 blur-3xl transition-all duration-500 group-hover:bg-[var(--om-glow-peach)]/45"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-[var(--om-glow-blue)]/0 blur-3xl transition-all duration-500 group-hover:bg-[var(--om-glow-blue)]/50"
                  />

                  <div className="relative mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[var(--om-brand)] shadow-sm">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-white/60 bg-white/50 px-2.5 py-0.5 font-mono text-[10px] text-[var(--om-text-3)]">
                          {formatGardenId(g.id)}
                        </span>
                      </div>
                      <Link
                        href={homeHref}
                        className="block truncate text-xl font-semibold tracking-tight text-[var(--om-text-1)] transition-colors group-hover:text-[var(--om-brand)]"
                      >
                        {g.title}
                      </Link>
                    </div>
                    {!isSeed && (
                      <button
                        type="button"
                        title="删除空库"
                        onClick={() => setDeleteId(g.id)}
                        className="rounded-xl border border-transparent p-1.5 text-[var(--om-text-3)] opacity-0 transition group-hover:opacity-100 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="relative mb-4 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-[var(--om-text-2)]">
                    {g.description || "暂无说明"}
                  </p>

                  {recent.length > 0 && (
                    <ul className="relative mb-5 space-y-1.5 rounded-2xl border border-white/50 bg-white/40 p-3">
                      {recent.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={postDetailHref(p.slug, g.id)}
                            className="group/item flex items-center gap-2 text-sm text-[var(--om-text-2)] transition-colors hover:text-[var(--om-brand)]"
                          >
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--om-brand-light)] transition-transform group-hover/item:translate-x-0.5" />
                            <span className="truncate">{p.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="relative mt-auto flex items-center justify-between gap-3 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs text-[var(--om-text-3)]">
                      <FileText className="h-3 w-3 text-[var(--om-brand)]" />
                      <span className="font-semibold tabular-nums text-[var(--om-text-1)]">
                        {count}
                      </span>
                      篇文章
                    </span>
                    <Link
                      href={homeHref}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--om-brand)] px-4 text-xs font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,135,235,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--om-brand-dark)]"
                    >
                      打开首页
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/posts"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--om-brand-deep)] transition-colors hover:text-[var(--om-text-1)]"
          >
            查看全部文章
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="删除知识库"
        description={`确定删除空库「${deleteId}」？目录将移入回收站。若仍有文章会失败。`}
        confirmLabel="删除"
        isDestructive
        onConfirm={() => deleteId && remove.mutate({ id: deleteId })}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
