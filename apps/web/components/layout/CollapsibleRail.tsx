"use client";

import { useState, useCallback, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const onNavigate = useCallback(() => setPreview(false), []);
  const visible = pinned || preview;
  const Icon = side === "left" ? (pinned ? PanelLeftClose : PanelLeftOpen) : (pinned ? PanelRightClose : PanelRightOpen);
  return <div data-collapsible-rail={side} data-preview={!pinned && preview} data-expanded={visible}
    className={cn("flex min-h-0 shrink-0 flex-col border-[var(--om-divider)] bg-[var(--om-bg-alt)]", className)}
    onMouseLeave={() => setPreview(false)}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPreview(false); }}
    onKeyDown={(event) => { if (event.key === "Escape") { setPreview(false); onPinnedChange(false); } }}>
    <button type="button" className={cn("m-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--om-text-2)] hover:bg-[var(--om-bg-mute)]", side === "left" ? "self-start" : "self-end")}
      aria-label={`${pinned ? "收起" : "固定展开"}${label}`} aria-expanded={visible}
      onMouseEnter={() => { if (!pinned) setPreview(true); }}
      onFocus={() => { if (!pinned) setPreview(true); }}
      onClick={() => { setPreview(false); onPinnedChange(!pinned); }}><Icon size={18} /></button>
    <div className={cn("flex min-h-0 flex-1", !visible && "hidden")}
      onClick={(event) => { if ((event.target as HTMLElement).closest("a[href]")) setPreview(false); }}>
      {children({ visible, onNavigate })}
    </div>
  </div>;
}
