/**
 * Memories 长期记忆管理页面 (L2 智能工作台)
 */

"use client";

import React, { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Brain, Plus, Tag } from "lucide-react";
import Link from "next/link";
import type { Memory } from "@knowpilot/shared";
import { MEMORY_TYPE_LABELS } from "@knowpilot/shared";
import { useMemory } from "@/lib/hooks";
import { useCardDensity } from "@/lib/useCardDensity";
import { AdminPage, EmptyState, KpSelect, LoadingState, ConfirmDialog, PageHeader } from "@/components/shared";
import { formatToolDisplayName, toPascalCaseId } from "@/lib/toolDisplayName";
import { listItemExit, SPRING_LAYOUT } from "@/lib/motion";
import { trpc } from "@/lib/trpc";

function formatScope(scope?: string) {
  if (!scope || scope === "global") return "Global";
  if (scope.startsWith("workspace:")) return `空间 ${scope.slice(10, 18)}…`;
  if (scope.startsWith("agent:")) return `Agent ${scope.slice(6, 14)}…`;
  return toPascalCaseId(scope);
}

/**
 * 记忆晶体：强度 → 晶体能量液面 + 发光；低强度（衰减中）整体变淡。
 * hover 随卡片 group 微放大点亮，替代原 Zap 图标的纯文字表达。
 */
function MemoryCrystal({ strength }: { strength: number }) {
  const uid = useId();
  const s = Math.min(1, Math.max(0, strength));
  const fading = s < 0.35;
  const fillTop = 42 - 40 * s;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110",
        fading && "opacity-45",
      )}
      style={{
        filter:
          s > 0.55
            ? `drop-shadow(0 0 ${3 + s * 4}px rgba(var(--kp-brand-rgb), ${0.2 + s * 0.3}))`
            : undefined,
      }}
      title={`强度 ${(s * 100).toFixed(0)}%${fading ? " · 衰减中" : ""}`}
    >
      <svg viewBox="0 0 32 44" className="h-7 w-[22px]" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--kp-brand-deep)" />
            <stop offset="60%" stopColor="var(--kp-brand)" />
            <stop offset="100%" stopColor="var(--kp-accent)" />
          </linearGradient>
          <clipPath id={`${uid}-clip`}>
            <path d="M16 2 L28 12 L25 32 L16 42 L7 32 L4 12 Z" />
          </clipPath>
        </defs>
        <rect
          x="0"
          y={fillTop}
          width="32"
          height={42 - fillTop}
          fill={`url(#${uid}-fill)`}
          clipPath={`url(#${uid}-clip)`}
        />
        <path
          d="M16 2 L28 12 L25 32 L16 42 L7 32 L4 12 Z"
          fill="none"
          stroke="var(--kp-brand)"
          strokeOpacity={fading ? 0.4 : 0.65}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M4 12 L28 12 M7 32 L25 32 M16 2 L16 42"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.45"
          strokeWidth="0.8"
        />
      </svg>
    </span>
  );
}

export default function MemoriesPage() {
  const { useList, useCreate, useDelete } = useMemory();
  const { density } = useCardDensity();
  const [page] = useState(1);
  const [scopeFilter, setScopeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "superseded" | "">("active");
  const { data, isLoading } = useList({
    page,
    pageSize: 12,
    scope: scopeFilter || undefined,
    status: statusFilter || undefined,
  });
  const createMutation = useCreate();
  const deleteMutation = useDelete();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const conflictsQuery = trpc.memory.listConflicts.useQuery(undefined, {
    refetchInterval: 15_000,
  });
  const resolveConflictMut = trpc.memory.resolveConflict.useMutation({
    onSuccess: () => {
      conflictsQuery.refetch().catch(() => {});
      utils.memory.list.invalidate().catch(() => {});
    },
  });
  const clearConflictMut = trpc.memory.clearConflict.useMutation({
    onSuccess: () => {
      conflictsQuery.refetch().catch(() => {});
      utils.memory.list.invalidate().catch(() => {});
    },
  });

  const handleCreateDemo = () => {
    createMutation.mutate({
      content: `用户偏好使用中文编写技术文档，且非常注重代码的设计美感与莫兰迪色系。`,
      type: "preference",
      strength: 0.95,
      keywords: ["preference", "design", "language"],
      scope: "global",
      attribution: "user",
    });
  };

  function MemoryContentView({ content }: { content: string }) {
  const parsed = useMemo(() => {
    try {
      const data = JSON.parse(content);
      if (data && typeof data === "object" && !Array.isArray(data)) return data as Record<string, unknown>;
    } catch {
      // 不是 JSON，按纯文本展示
    }
    return null;
  }, [content]);

  if (!parsed) {
    return (
      <p className="text-xs text-[var(--kp-text-2)] leading-relaxed">
        <span className="text-[var(--kp-text-3)]">&ldquo;</span>
        {content}
        <span className="text-[var(--kp-text-3)]">&rdquo;</span>
      </p>
    );
  }

  const taskDescription =
    typeof parsed.taskDescription === "string" ? parsed.taskDescription : undefined;
  const keyLearnings =
    typeof parsed.keyLearnings === "string" ? parsed.keyLearnings : undefined;
  const toolsUsed = Array.isArray(parsed.toolsUsed)
    ? (parsed.toolsUsed as unknown[]).filter((t): t is string => typeof t === "string")
    : [];
  const success = typeof parsed.success === "boolean" ? parsed.success : undefined;
  const durationMs = typeof parsed.durationMs === "number" ? parsed.durationMs : undefined;
  const tokenUsage =
    parsed.tokenUsage && typeof parsed.tokenUsage === "object" && !Array.isArray(parsed.tokenUsage)
      ? (parsed.tokenUsage as Record<string, unknown>)
      : null;

  return (
    <div className="space-y-2.5">
      {taskDescription && (
        <p className="text-xs font-medium text-[var(--kp-text-1)] leading-relaxed">
          <span className="text-[var(--kp-text-3)]">&ldquo;</span>
          {taskDescription}
          <span className="text-[var(--kp-text-3)]">&rdquo;</span>
        </p>
      )}
      {keyLearnings && (
        <div className="rounded-lg border border-[var(--kp-divider-light)] bg-[var(--kp-bg)] px-2.5 py-2 text-[10px] leading-relaxed text-[var(--kp-text-2)]">
          {keyLearnings}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {toolsUsed.length > 0 ? (
          toolsUsed.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-0.5 rounded-full bg-[var(--kp-brand-soft)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--kp-brand-deep)]"
            >
              <Tag className="h-2 w-2" />
              {formatToolDisplayName(t)}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-[var(--kp-bg-mute)] px-1.5 py-0.5 text-[9px] text-[var(--kp-text-3)]">
            无工具调用
          </span>
        )}
        {success !== undefined && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[9px] font-medium",
              success ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600",
            )}
          >
            {success ? "成功" : "失败"}
          </span>
        )}
        {durationMs !== undefined && (
          <span className="rounded-full bg-[var(--kp-bg-mute)] px-1.5 py-0.5 text-[9px] text-[var(--kp-text-3)]">
            {(durationMs / 1000).toFixed(1)}s
          </span>
        )}
      </div>
      {tokenUsage && (
        <div className="flex flex-wrap items-center gap-x-2 text-[9px] text-[var(--kp-text-3)]">
          <span>prompt {(tokenUsage.prompt as number) ?? "-"}</span>
          <span>completion {(tokenUsage.completion as number) ?? "-"}</span>
          <span className="font-medium text-[var(--kp-text-2)]">total {(tokenUsage.total as number) ?? "-"}</span>
        </div>
      )}
    </div>
  );
}

const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
      setDeleteId(null);
    }
  };

  return (
    <AdminPage>
      <PageHeader
        icon={Brain}
        title="Memories 记忆晶体"
        description="长期记忆实体：手动写入、Agent MemoryCreate，或对话结束后自动沉淀 Experience。文件回写 config/memories/；检索进 system prompt。"
        action={{ label: "写入记忆晶体", onClick: handleCreateDemo, icon: Plus }}
        showDensityToggle
      />

      <div className="flex flex-wrap gap-2">
        <KpSelect
          value={scopeFilter || "__all__"}
          onChange={(v) => setScopeFilter(v === "__all__" ? "" : v)}
          options={[
            { value: "__all__", label: "全部 Scope" },
            { value: "global", label: "Global" },
          ]}
          className="w-40"
          aria-label="Scope 筛选"
        />
        <KpSelect
          value={statusFilter || "__all__"}
          onChange={(v) =>
            setStatusFilter(v === "__all__" ? "" : (v as "active" | "superseded"))
          }
          options={[
            { value: "__all__", label: "默认（不含 Superseded）" },
            { value: "active", label: "Active" },
            { value: "superseded", label: "Superseded" },
          ]}
          className="w-40"
          aria-label="状态筛选"
        />
      </div>

      {(conflictsQuery.data?.items?.length ?? 0) > 0 && (
        <section
          className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"
          data-testid="memory-conflicts-panel"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
            <AlertTriangle className="h-4 w-4" />
            冲突记忆待裁决
            <span className="text-xs font-normal text-amber-800/80 dark:text-amber-200/80">
              {conflictsQuery.data!.total} 对 · 不静默覆盖
            </span>
          </div>
          <ul className="space-y-3">
            {conflictsQuery.data!.items.map((pair) => (
              <li
                key={`${pair.a.id}:${pair.b?.id ?? "?"}`}
                className="grid gap-3 rounded-xl border border-[var(--kp-divider-light)] bg-[var(--kp-bg-alt)] p-3 md:grid-cols-2"
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-[var(--kp-bg-mute)] px-2 py-0.5 text-[9px]">
                      A · {pair.a.type}
                    </span>
                    {pair.a.source && (
                      <span className="truncate text-[9px] text-[var(--kp-text-3)]" title={pair.a.source}>
                        {pair.a.source}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed text-[var(--kp-text-2)]">{pair.a.content}</p>
                  <button
                    type="button"
                    disabled={resolveConflictMut.isPending}
                    className="text-[10px] font-semibold text-[var(--kp-text-1)] underline-offset-2 hover:underline"
                    onClick={() =>
                      pair.b &&
                      resolveConflictMut.mutate({ keepId: pair.a.id, discardId: pair.b.id })
                    }
                  >
                    以 A 为准
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  {pair.b ? (
                    <>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-[var(--kp-bg-mute)] px-2 py-0.5 text-[9px]">
                          B · {pair.b.type}
                        </span>
                        {pair.b.source && (
                          <span
                            className="truncate text-[9px] text-[var(--kp-text-3)]"
                            title={pair.b.source}
                          >
                            {pair.b.source}
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed text-[var(--kp-text-2)]">{pair.b.content}</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={resolveConflictMut.isPending}
                          className="text-[10px] font-semibold text-[var(--kp-text-1)] underline-offset-2 hover:underline"
                          onClick={() =>
                            resolveConflictMut.mutate({ keepId: pair.b!.id, discardId: pair.a.id })
                          }
                        >
                          以 B 为准
                        </button>
                        <button
                          type="button"
                          disabled={clearConflictMut.isPending}
                          className="text-[10px] text-[var(--kp-text-3)] underline-offset-2 hover:underline"
                          onClick={() =>
                            clearConflictMut.mutate({ idA: pair.a.id, idB: pair.b!.id })
                          }
                        >
                          仅清除冲突边
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-[var(--kp-text-3)]">对端已不存在</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isLoading ? (
        <LoadingState count={3} />
      ) : !data?.items || data.items.length === 0 ? (
        <EmptyState
          title="记忆脑海空无一物"
          description="空很正常。生成路径：① Agent 调用 MemoryCreate；② 有工具调用的对话结束后自动写 Experience（Agent/Workspace 双写）；③ 本页手动创建。心跳会按日衰减低分记忆。"
          actionLabel="植入偏好记忆"
          onAction={handleCreateDemo}
        />
      ) : (
        <div className={cn("grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] ", density === "compact" ? "gap-4" : "gap-6")}>
          <AnimatePresence mode="popLayout" initial={false}>
          {data.items.map((memory: Memory) => (
            <motion.div
              key={memory.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={listItemExit}
              transition={SPRING_LAYOUT}
              whileHover={{ y: -4 }}
              className={cn("group relative overflow-hidden rounded-2xl border border-[var(--kp-divider-light)] bg-[var(--kp-bg-alt)] hover:bg-white dark:hover:bg-[var(--kp-bg-soft)] hover:border-[var(--kp-divider)] hover:shadow-xl transition-[background-color,border-color,box-shadow] duration-300 flex flex-col justify-between", density === "compact" ? "p-3" : "p-5")}
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--kp-brand-soft)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--kp-brand-deep)]">
                      {MEMORY_TYPE_LABELS[memory.type as keyof typeof MEMORY_TYPE_LABELS] ?? memory.type}
                    </span>
                    <span className="rounded-full bg-[var(--kp-bg-mute)] px-2 py-0.5 text-[9px] text-[var(--kp-text-2)]">
                      {formatScope(memory.scope)}
                    </span>
                    {memory.status && memory.status !== "active" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-800">
                        {toPascalCaseId(memory.status)}
                      </span>
                    )}
                    {memory.attribution && (
                      <span className="rounded-full bg-[var(--kp-bg-mute)] px-2 py-0.5 text-[9px] text-[var(--kp-text-2)]">
                        {toPascalCaseId(memory.attribution)}
                      </span>
                    )}
                    {memory.source && (
                      <span
                        className="max-w-[10rem] truncate rounded-full bg-[var(--kp-bg-mute)] px-2 py-0.5 text-[9px] text-[var(--kp-text-3)]"
                        title={memory.source}
                      >
                        {memory.source}
                      </span>
                    )}
                    {(memory.conflictsWith?.length ?? 0) > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-800">
                        冲突 ×{memory.conflictsWith!.length}
                      </span>
                    )}
                  </div>

                  <div className="flex translate-y-1 items-center gap-1 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
                    <Link
                      href={`/memories/edit/${memory.id}`}
                      className="text-xs text-[var(--kp-brand-deep)] hover:text-[var(--kp-brand-deep)] px-2 py-0.5 rounded hover:bg-[var(--kp-brand-soft)]"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => setDeleteId(memory.id)}
                      className="text-xs text-red-500 hover:text-red-600 px-2 py-0.5 rounded hover:bg-red-500/10"
                    >
                      粉碎
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <MemoryContentView content={memory.content} />
                </div>
              </div>

              <div className="space-y-2 border-t border-[var(--kp-divider-light)] pt-3">
                <div className="flex items-center justify-between text-[10px] text-[var(--kp-text-3)]">
                  <span className="flex items-center gap-1.5">
                    <MemoryCrystal strength={memory.strength} />
                    <span className="leading-none">
                      强度 {(memory.strength * 100).toFixed(0)}%
                      {memory.strength < 0.35 && (
                        <span className="ml-1 text-amber-600">· 衰减中</span>
                      )}
                    </span>
                  </span>
                  {memory.validTo && (
                    <span title={String(memory.validTo)}>
                      有效至 {new Date(memory.validTo).toLocaleDateString("zh-CN")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {memory.keywords?.map((k: string) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-0.5 rounded bg-[var(--kp-bg-soft)] px-1.5 py-0.5 text-[8px] text-[var(--kp-text-3)] font-medium"
                    >
                      <Tag className="w-2 h-2" />
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="粉碎记忆碎片"
        description="确定要粉碎（删除）该条长期记忆吗？这会导致 Agent 忘记此信息，回复个性化程度可能受到影响。"
        isDestructive={true}
        confirmLabel="确认粉碎"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </AdminPage>
  );
}
