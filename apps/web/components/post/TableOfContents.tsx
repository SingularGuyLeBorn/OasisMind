"use client";

import { useMemo, useState, useEffect, useCallback, useRef, useId, useSyncExternalStore, type RefObject } from "react";
import { ChevronRight, ListTree, PanelRightClose, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ReadingOutlineLink } from "@oasismind/markdown/ReadingOutlineLink";

const TOC_VISIBLE_KEY = "om-post-toc-visible";
const tocListeners = new Set<() => void>();

export interface TocItem {
  id: string;
  text: string;
  level: number;
  index: number;
}

interface TocGroup {
  heading: TocItem;
  children: TocItem[];
}

function parseHeadings(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const text = match[2]
        .trim()
        .replace(/<[^>]+>/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      items.push({ id: `om-h-${items.length}`, text, level: match[1].length, index: items.length });
    }
  }
  return items;
}

/**
 * 为每个标题生成唯一 id，与正文 Heading 组件使用的 id 保持一致。
 * 使用 `om-h-${index}` 作为 id，彻底避免「math/特殊字符导致正文与目录 id 不一致」
 * 以及「重复标题 id 冲突」两类跳转失效。index 按文档顺序从 0 开始。
 */
export function buildTocItems(content: string): TocItem[] {
  return parseHeadings(content);
}

function buildGroups(items: TocItem[]): TocGroup[] {
  const groups: TocGroup[] = [];
  let current: TocGroup | null = null;
  for (const item of items) {
    if (item.level <= 2) {
      current = { heading: item, children: [] };
      groups.push(current);
    } else if (current) {
      current.children.push(item);
    } else {
      groups.push({ heading: item, children: [] });
    }
  }
  return groups;
}

/**
 * 滚动到指定标题。保活场景下页面同时存在多个文章 DOM（隐藏容器），
 * 标题 id（om-h-N）跨文章重复，故容器内查找优先于全局 getElementById。
 */
function scrollToId(id: string, container: HTMLElement | null, focusTarget = false, attempt = 0) {
  const el = container
    ? container.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
    : document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "auto", block: "start" });
    history.replaceState(null, "", `#${id}`);
    if (focusTarget) {
      el.tabIndex = -1;
      el.focus({ preventScroll: true });
    }
    return;
  }
  if (attempt < 1) {
    window.setTimeout(() => scrollToId(id, container, focusTarget, attempt + 1), 50);
    return;
  }
  // 兜底：按索引直接取第 N 个标题；必须覆盖 h1-h6，与 buildTocItems 的编号范围一致。
  const idxMatch = /^om-h-(\d+)$/.exec(id);
  if (!idxMatch) return;
  const targetIndex = Number(idxMatch[1]);
  const headings = container
    ? Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"))
    : (() => {
        const main = document.querySelector(".om-post-content");
        return main
          ? Array.from(main.querySelectorAll("h1, h2, h3, h4, h5, h6"))
          : Array.from(
              document.querySelectorAll(
                "article.om-post-swap h1, article.om-post-swap h2, article.om-post-swap h3, article.om-post-swap h4, article.om-post-swap h5, article.om-post-swap h6",
              ),
            );
      })();
  const target = headings[targetIndex];
  if (target) {
    target.scrollIntoView({ behavior: "auto", block: "start" });
    history.replaceState(null, "", `#${id}`);
    if (focusTarget && target instanceof HTMLElement) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
}

function useInitialHash(
  items: TocItem[],
  setActiveId: (id: string) => void,
  containerRef: RefObject<HTMLElement | null> | undefined,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    if (items.some((item) => item.id === hash)) {
      setActiveId(hash);
      scrollToId(hash, containerRef?.current ?? null);
    }
  }, [items, setActiveId, containerRef, active]);
}

function readTocVisible(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(TOC_VISIBLE_KEY) !== "0";
  } catch {
    return true;
  }
}

function subscribeTocVisible(onStoreChange: () => void) {
  tocListeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === TOC_VISIBLE_KEY || e.key === null) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    tocListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setTocVisiblePersist(next: boolean) {
  try {
    localStorage.setItem(TOC_VISIBLE_KEY, next ? "1" : "0");
  } catch {
    // ignore
  }
  for (const listener of tocListeners) listener();
}

/** 本页目录显隐偏好（与 TableOfContents 同源，供正文留白同步） */
export function usePostTocVisible(): boolean {
  return useSyncExternalStore(subscribeTocVisible, readTocVisible, () => true);
}

function OutlineList({
  groups,
  expanded,
  activeId,
  onToggleGroup,
  onSelect,
  className,
}: {
  groups: TocGroup[];
  expanded: Set<string>;
  activeId: string | null;
  onToggleGroup: (id: string) => void;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <ScrollArea className={className}>
      <nav aria-label="文章章节" className="flex flex-col px-2 py-2">
        {groups.map((group) => {
          const isOpen = expanded.has(group.heading.id);
          const hasChildren = group.children.length > 0;
          const isActiveGroup = activeId === group.heading.id;

          return (
            <Collapsible key={group.heading.id} open={isOpen} onOpenChange={() => onToggleGroup(group.heading.id)}>
              <div className="flex items-center">
                {hasChildren ? (
                  <CollapsibleTrigger
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--om-text-3)] transition-colors hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]"
                    aria-label={`${isOpen ? "折叠" : "展开"}「${group.heading.text}」`}
                  >
                    <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")} />
                  </CollapsibleTrigger>
                ) : (
                  <span className="h-7 w-7 shrink-0" />
                )}
                <ReadingOutlineLink
                  id={group.heading.id}
                  active={isActiveGroup}
                  onClick={(event) => {
                    event.preventDefault();
                    onSelect(group.heading.id);
                  }}
                  className={cn(
                    "group flex min-h-9 flex-1 items-start rounded-lg px-2.5 py-2 text-left text-sm leading-snug transition-colors",
                    isActiveGroup
                      ? "bg-[var(--om-brand-soft)] font-semibold text-[var(--om-brand-deep)]"
                      : "text-[var(--om-text-1)] hover:bg-[var(--om-bg-mute)]",
                  )}
                >
                  <span className="line-clamp-2">{group.heading.text}</span>
                </ReadingOutlineLink>
              </div>

              {hasChildren && (
                <CollapsibleContent>
                  <div className="ml-3.5 border-l border-[var(--om-divider)] pl-2">
                    {group.children.map((child) => {
                      const isActive = activeId === child.id;
                      return (
                        <ReadingOutlineLink
                          key={child.id}
                          id={child.id}
                          active={isActive}
                          onClick={(event) => {
                            event.preventDefault();
                            onSelect(child.id);
                          }}
                          className={cn(
                            "group flex min-h-9 w-full items-start rounded-lg px-2.5 py-2 text-left text-sm leading-snug transition-colors",
                            child.level === 3 && "pl-3",
                            child.level >= 4 && "pl-5",
                            isActive
                              ? "bg-[var(--om-brand-soft)] font-semibold text-[var(--om-brand-deep)]"
                              : "text-[var(--om-text-2)] hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]",
                          )}
                        >
                          <span className="line-clamp-2">{child.text}</span>
                        </ReadingOutlineLink>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              )}
            </Collapsible>
          );
        })}
      </nav>
    </ScrollArea>
  );
}

export function TableOfContents({
  content,
  className,
  containerRef,
  active = true,
}: {
  content: string;
  className?: string;
  /** 文章容器：保活多实例时把标题查找/观察收进本容器，避免命中隐藏文章的重复 id */
  containerRef?: RefObject<HTMLElement | null>;
  /** 保活实例隐藏时置 false：不做可见性观察 */
  active?: boolean;
}) {
  const visible = usePostTocVisible();
  const [preview, setPreview] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [manuallyExpanded, setManuallyExpanded] = useState<Set<string>>(new Set());
  const [mobileState, setMobileState] = useState({ active, open: false });
  if (mobileState.active !== active) {
    setMobileState({ active, open: false });
  }
  const mobileOpen = mobileState.active === active && mobileState.open;
  const setMobileOpen = useCallback((open: boolean) => setMobileState({ active, open }), [active]);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLElement>(null);
  const mobileDrawerId = useId();

  const items = useMemo(() => buildTocItems(content), [content]);
  const groups = useMemo(() => buildGroups(items), [items]);

  const expanded = useMemo(() => {
    const next = new Set(manuallyExpanded);
    if (activeId) {
      for (const group of groups) {
        if (group.heading.id === activeId || group.children.some((c) => c.id === activeId)) {
          next.add(group.heading.id);
          break;
        }
      }
    }
    return next;
  }, [manuallyExpanded, activeId, groups]);

  useInitialHash(items, setActiveId, containerRef, active);

  useEffect(() => {
    if (!active || items.length === 0) return;
    const scope = containerRef?.current ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        let topVisible: string | null = null;
        let topY = Infinity;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.boundingClientRect.top < topY) {
            topY = entry.boundingClientRect.top;
            topVisible = entry.target.id;
          }
        }
        if (topVisible) setActiveId(topVisible);
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const item of items) {
      const el = scope
        ? scope.querySelector<HTMLElement>(`#${CSS.escape(item.id)}`)
        : document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items, active, containerRef]);

  const toggleGroup = useCallback((id: string) => {
    setManuallyExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectHeading = useCallback((id: string, fromMobile: boolean) => {
    setActiveId(id);
    setPreview(false);
    if (fromMobile) setMobileOpen(false);
    scrollToId(id, containerRef?.current ?? null, fromMobile);
  }, [containerRef, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen || !active) return;
    mobileCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        mobileTriggerRef.current?.focus();
      } else if (event.key === "Tab") {
        const focusable = Array.from(
          mobilePanelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
        ).filter((element) => element.getClientRects().length > 0);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!mobilePanelRef.current?.contains(document.activeElement)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, active, setMobileOpen]);

  if (items.length === 0) return null;

  return (
    <>
      {/* [OM-FREEPLAY] 阅读页顶部已有返回与编辑操作；入口放在手机底栏上方，避免盖住这些按钮。 */}
      {active && (
        <button
          ref={mobileTriggerRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          className={cn(
            "fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] right-3 z-30 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--om-divider)] bg-[var(--om-bg-alt)]/95 px-3.5 text-xs font-semibold text-[var(--om-brand-deep)] shadow-[0_8px_28px_-12px_rgba(0,60,120,0.35)] backdrop-blur-md transition hover:border-[var(--om-brand)]/55 hover:shadow-[0_12px_30px_-12px_rgba(0,60,120,0.45)] md:bottom-5 xl:hidden",
            className,
          )}
          aria-label="打开本页目录"
          aria-expanded={mobileOpen}
          aria-controls={mobileDrawerId}
        >
          <ListTree className="h-4 w-4" />
          本页目录
          <span className="rounded-full bg-[var(--om-brand-soft)] px-1.5 py-0.5 text-[10px] tabular-nums">
            {items.length}
          </span>
        </button>
      )}

      {mobileOpen && active && (
        <div
          id={mobileDrawerId}
          className="fixed inset-0 z-[80] xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${mobileDrawerId}-title`}
        >
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              mobileTriggerRef.current?.focus();
            }}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
            aria-hidden="true"
            tabIndex={-1}
          />
          <aside ref={mobilePanelRef} className="absolute inset-y-0 right-0 flex w-[min(22rem,90vw)] flex-col border-l border-[var(--om-divider)] bg-[var(--om-bg-alt)] pt-[env(safe-area-inset-top,0px)] text-[var(--om-text-1)] shadow-2xl">
            <div className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--om-divider)] px-4">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-[0.12em] text-[var(--om-text-3)]">阅读导航</p>
                <h2 id={`${mobileDrawerId}-title`} className="text-base font-semibold">本页目录</h2>
              </div>
              <button
                ref={mobileCloseRef}
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  mobileTriggerRef.current?.focus();
                }}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--om-text-2)] transition hover:bg-[var(--om-bg-mute)]"
                aria-label="关闭本页目录"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="shrink-0 border-b border-[var(--om-divider)] px-4 py-2 text-xs text-[var(--om-text-3)]">
              {items.length} 个标题 · 点击章节跳转
            </div>
            <OutlineList
              groups={groups}
              expanded={expanded}
              activeId={activeId}
              onToggleGroup={toggleGroup}
              onSelect={(id) => selectHeading(id, true)}
              className="min-h-0 flex-1"
            />
          </aside>
        </div>
      )}

      {active && <div className="fixed top-[5.5rem] right-4 z-30 hidden flex-col items-end xl:flex"
        onMouseLeave={() => setPreview(false)}>
      {!visible && (
        <button
          type="button"
          onMouseEnter={() => setPreview(true)}
          onFocus={() => setPreview(true)}
          onClick={() => { setPreview(false); setTocVisiblePersist(true); }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border border-[var(--om-divider)] bg-[var(--om-bg-alt)] px-3 py-2 text-xs font-medium text-[var(--om-text-2)] shadow-sm transition hover:border-[var(--om-brand)] hover:text-[var(--om-brand-deep)]",
            className,
          )}
          aria-label="显示本页目录"
          title="显示目录"
        >
          <ListTree className="h-4 w-4" />
          目录
        </button>
      )}
      {(visible || preview) && (
        <aside
          data-toc-preview={!visible && preview}
          className={cn(
            "flex w-72 flex-col overflow-hidden rounded-2xl border border-[var(--om-divider)] bg-[var(--om-bg-alt)] text-[var(--om-text-1)] shadow-[0_20px_50px_-30px_rgba(0,60,120,0.28)]",
            className,
          )}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3.5">
            <div>
              <p className="text-[10px] font-medium tracking-[0.12em] text-[var(--om-text-3)]">阅读导航</p>
              <h3 className="text-sm font-semibold text-[var(--om-text-1)]">本页目录</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-[var(--om-bg-mute)] px-2 py-0.5 text-xs font-medium text-[var(--om-text-3)]">
                {items.length}
              </span>
              <button
                type="button"
                onClick={() => { setPreview(false); setTocVisiblePersist(false); }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--om-text-3)] transition hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]"
                aria-label="隐藏本页目录"
                title="隐藏目录"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>
          </div>
          <Separator />
          <OutlineList
            groups={groups}
            expanded={expanded}
            activeId={activeId}
            onToggleGroup={toggleGroup}
            onSelect={(id) => selectHeading(id, false)}
            className="max-h-[calc(100vh-9rem)]"
          />
        </aside>
      )}
      </div>}
    </>
  );
}
