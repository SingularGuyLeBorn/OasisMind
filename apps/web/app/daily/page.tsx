/**
 * 每日看板 — 学 TriFlow：待办 → 进行中 → 已完成；按日流动
 * 权威在服务端；PUSH=daily_flow_updated SSE/BC；PULL=进页水合 + 短 refetchInterval
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Kanban,
  Loader2,
  Plus,
  StickyNote,
  Trash2,
} from "lucide-react";
import type { DailyFlowItem } from "@oasismind/shared";
import { AdminPage, LoadingState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { catchUnlessCancelled, trpc } from "@/lib/trpc";
import { postUiState, UI_STATE_CHANNEL } from "@/lib/uiStateChannel";

type FlowStatus = "todo" | "doing" | "done";

const COLUMNS: Array<{ status: FlowStatus; title: string; hint: string }> = [
  { status: "todo", title: "待办", hint: "今天打算做" },
  { status: "doing", title: "进行中", hint: "正在推进" },
  { status: "done", title: "已完成", hint: "今天收掉的" },
];

function localDayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftDayKey(dayKey: string, delta: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return localDayKey(dt);
}

function nextStatus(s: FlowStatus): FlowStatus | null {
  if (s === "todo") return "doing";
  if (s === "doing") return "done";
  return null;
}

function prevStatus(s: FlowStatus): FlowStatus | null {
  if (s === "done") return "doing";
  if (s === "doing") return "todo";
  return null;
}

export default function DailyFlowPage() {
  const utils = trpc.useUtils();
  const [dayKey, setDayKey] = useState(() => localDayKey());
  const [draft, setDraft] = useState("");
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const listQuery = trpc.dailyFlow.listByDay.useQuery(
    { dayKey },
    { refetchInterval: 15_000 },
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
      const data = ev.data as { type?: string; dayKey?: string } | null;
      if (data?.type !== "daily_flow_updated") return;
      if (data.dayKey && data.dayKey !== dayKey) return;
      utils.dailyFlow.listByDay.invalidate({ dayKey }).catch(catchUnlessCancelled("app/daily/page.tsx"));
      utils.dailyFlow.dayReport.invalidate({ dayKey }).catch(catchUnlessCancelled("app/daily/page.tsx"));
    };
    bc.addEventListener("message", onMsg);
    return () => {
      bc.removeEventListener("message", onMsg);
      bc.close();
    };
  }, [dayKey, utils]);

  const bump = (changedDay?: string) => {
    const k = changedDay ?? dayKey;
    postUiState({ type: "daily_flow_updated", dayKey: k });
    utils.dailyFlow.listByDay.invalidate({ dayKey: k }).catch(catchUnlessCancelled("app/daily/page.tsx"));
    utils.dailyFlow.dayReport.invalidate({ dayKey: k }).catch(catchUnlessCancelled("app/daily/page.tsx"));
  };

  const createMut = trpc.dailyFlow.create.useMutation({
    onSuccess: () => {
      setDraft("");
      bump();
    },
  });
  const moveMut = trpc.dailyFlow.move.useMutation({
    onSuccess: (item) => bump(item.dayKey),
  });
  const updateMut = trpc.dailyFlow.update.useMutation({
    onSuccess: (item) => {
      setExpandedNoteId(null);
      bump(item.dayKey);
    },
  });
  const deleteMut = trpc.dailyFlow.delete.useMutation({
    onSuccess: (r) => bump(r.dayKey),
  });
  const reportQuery = trpc.dailyFlow.dayReport.useQuery(
    { dayKey },
    { enabled: false },
  );

  const stats = listQuery.data?.stats ?? {
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
    completionRate: 0,
  };

  const byStatus = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    const map: Record<FlowStatus, DailyFlowItem[]> = { todo: [], doing: [], done: [] };
    for (const item of items) {
      const s = item.status as FlowStatus;
      if (s in map) map[s].push(item);
    }
    return map;
  }, [listQuery.data?.items]);

  const isToday = dayKey === localDayKey();

  const onAdd = () => {
    const title = draft.trim();
    if (!title || createMut.isPending) return;
    createMut.mutate({ dayKey, title, note: "" });
  };

  const onCopyReport = async () => {
    try {
      const report = await reportQuery.refetch();
      const text = report.data?.text ?? "";
      if (!text) return;
      await navigator.clipboard.writeText(text);
      setCopyHint("已复制日报告");
      window.setTimeout(() => setCopyHint(null), 2000);
    } catch {
      setCopyHint("复制失败");
      window.setTimeout(() => setCopyHint(null), 2000);
    }
  };

  return (
    <AdminPage>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--om-brand-deep)]">
              <Kanban className="h-5 w-5" />
              <h1 className="text-xl font-semibold tracking-tight">每日看板</h1>
            </div>
            <p className="mt-1 text-sm text-[var(--om-text-3)]">
              待办流向完成 · 一天一板 · 不加优先级标签
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDayKey((k) => shiftDayKey(k, -1))}
              aria-label="前一天"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="date"
              value={dayKey}
              onChange={(e) => {
                if (e.target.value) setDayKey(e.target.value);
              }}
              className="h-9 w-[10.5rem]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDayKey((k) => shiftDayKey(k, 1))}
              aria-label="后一天"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {!isToday && (
              <Button type="button" variant="secondary" size="sm" onClick={() => setDayKey(localDayKey())}>
                今天
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => void onCopyReport()}>
              <ClipboardCopy className="h-4 w-4" />
              复制日报告
            </Button>
            {copyHint && <span className="text-xs text-[var(--om-text-3)]">{copyHint}</span>}
          </div>
        </header>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--om-text-2)]">
          <span>
            合计 <strong className="text-[var(--om-text-1)]">{stats.total}</strong>
          </span>
          <span>
            待办 <strong>{stats.todo}</strong>
          </span>
          <span>
            进行中 <strong>{stats.doing}</strong>
          </span>
          <span>
            已完成 <strong>{stats.done}</strong>
          </span>
          <span>
            完成率 <strong>{stats.completionRate}%</strong>
          </span>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onAdd();
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="加一条今天的待办…"
            maxLength={200}
            className="h-10 flex-1"
          />
          <Button type="submit" disabled={!draft.trim() || createMut.isPending}>
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            添加
          </Button>
        </form>

        {listQuery.isLoading ? (
          <LoadingState />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const list = byStatus[col.status];
              return (
                <section
                  key={col.status}
                  className="rounded-2xl border border-[var(--om-border)] bg-[var(--om-surface)]/60 p-3"
                >
                  <div className="mb-3 flex items-baseline justify-between px-1">
                    <h2 className="text-sm font-medium text-[var(--om-text-1)]">{col.title}</h2>
                    <span className="text-xs text-[var(--om-text-3)]">
                      {list.length} · {col.hint}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {list.length === 0 ? (
                      <p className="px-1 py-8 text-center text-xs text-[var(--om-text-3)]">暂无条目</p>
                    ) : (
                      list.map((item) => {
                        const forward = nextStatus(item.status as FlowStatus);
                        const back = prevStatus(item.status as FlowStatus);
                        const noteOpen = expandedNoteId === item.id;
                        return (
                          <motion.article
                            key={item.id}
                            layout
                            className="rounded-xl border border-[var(--om-border)] bg-[var(--om-bg)] p-3"
                          >
                            <p className="text-sm font-medium text-[var(--om-text-1)]">{item.title}</p>
                            {item.note.trim() && !noteOpen && (
                              <p className="mt-1 line-clamp-2 text-xs text-[var(--om-text-3)]">{item.note}</p>
                            )}
                            {noteOpen && (
                              <textarea
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                rows={3}
                                className="mt-2 w-full rounded-lg border border-[var(--om-border)] bg-transparent p-2 text-xs"
                                placeholder="备注（可选）"
                              />
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-1">
                              {back && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  disabled={moveMut.isPending}
                                  onClick={() => moveMut.mutate({ id: item.id, status: back })}
                                  title="移回上一栏"
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {forward && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  disabled={moveMut.isPending}
                                  onClick={() => moveMut.mutate({ id: item.id, status: forward })}
                                  title="移到下一栏"
                                >
                                  {forward === "done" ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => {
                                  if (noteOpen) {
                                    updateMut.mutate({ id: item.id, note: noteDraft });
                                  } else {
                                    setExpandedNoteId(item.id);
                                    setNoteDraft(item.note ?? "");
                                  }
                                }}
                                title={noteOpen ? "保存备注" : "备注"}
                              >
                                <StickyNote className={cn("h-3.5 w-3.5", noteOpen && "text-[var(--om-brand)]")} />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="ml-auto h-7 px-2 text-red-600 hover:text-red-700"
                                disabled={deleteMut.isPending}
                                onClick={() => deleteMut.mutate({ id: item.id })}
                                title="删除"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </motion.article>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AdminPage>
  );
}
