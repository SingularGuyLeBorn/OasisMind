"use client";

import { useState, useCallback, useRef, useLayoutEffect, useSyncExternalStore, useId, type CSSProperties, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRailIntent } from "./useRailIntent";

const desktopSnapshot = () => window.matchMedia("(min-width: 768px)").matches;
const serverSnapshot = () => false;
const subscribeViewport = (notify: () => void) => {
  const media = window.matchMedia("(min-width: 768px)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

/** 固定展开由宿主保存；预览只在当前交互内有效，导航不会改变固定偏好。 */
export function CollapsibleRail({ side, label, pinned, onPinnedChange, children, className }: {
  side: "left" | "right";
  label: string;
  pinned: boolean;
  onPinnedChange: (open: boolean) => void;
  children: (state: { visible: boolean; onNavigate: () => void }) => ReactNode;
  className?: string;
}) {
  const [preview, setPreview] = useState(false);
  const intent = useRailIntent(() => setPreview(true), () => setPreview(false), !pinned);
  const onNavigate = intent.dismiss;
  const desktop = useSyncExternalStore(subscribeViewport, desktopSnapshot, serverSnapshot);
  const bodyRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bodyId = useId();
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const measure = () => setWidth(body.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, []);
  const close = useCallback(() => {
    onNavigate(); onPinnedChange(false);
    triggerRef.current?.focus({ preventScroll: true });
    // 归还焦点后同步取消 focus 事件产生的预览意图。
    onNavigate();
  }, [onNavigate, onPinnedChange]);
  const visible = pinned || preview;
  const Icon = side === "left" ? (pinned ? PanelLeftClose : PanelLeftOpen) : (pinned ? PanelRightClose : PanelRightOpen);
  return <div data-collapsible-rail={side} data-preview={!pinned && preview} data-expanded={visible}
    style={{ "--rail-width": `${Math.max(44, width)}px` } as CSSProperties}
    className={cn("om-collapsible-rail flex min-h-0 shrink-0 flex-col border-[var(--om-divider)] bg-[var(--om-bg-alt)]", className)}
    onMouseEnter={intent.cancel} onMouseLeave={intent.leave} onBlur={intent.blur}
    onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
    <button ref={triggerRef} type="button" className={cn("m-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--om-text-2)] hover:bg-[var(--om-bg-mute)]", side === "left" ? "self-start" : "self-end")}
      aria-label={`${pinned ? "收起" : "固定展开"}${label}`} aria-expanded={visible} aria-controls={bodyId}
      onMouseEnter={intent.enter} onMouseLeave={intent.cancelOpening} onFocus={intent.focus}
      onClick={() => { onNavigate(); onPinnedChange(!pinned); }}><Icon size={18} /></button>
    <div ref={bodyRef} id={bodyId} inert={!visible} className="om-rail-body flex min-h-0 flex-1"
      onClick={(event) => { if ((event.target as HTMLElement).closest("a[href]")) onNavigate(); }}>
      {children({ visible: desktop || visible, onNavigate })}
    </div>
  </div>;
}
