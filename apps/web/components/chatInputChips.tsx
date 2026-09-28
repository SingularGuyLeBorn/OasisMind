"use client";

/**
 * Kimi 风格能力 pill 行：输入框下方、悬停驱动动态 SVG 图标。
 * 只挂真实能力，不做装饰假入口。
 * 减负分层：高频（Skill / 引用 / 图片 / 队列）常驻 pill；
 * 会话级低频（深度研究 / 目标 / 集群）收进「+」菜单，深度研究激活时 + 号带状态点。
 */

import { useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_GENTLE } from "@/lib/motion";
import {
  IconDeepResearch,
  IconDocRef,
  IconGoalFlag,
  IconImageFrame,
  IconQueueBars,
  IconSkillWand,
  IconSwarmCluster,
  type ChipIconState,
} from "@/components/animatedChipIcons";

export interface ChatInputChipsProps {
  disabled?: boolean;
  isSubagentSession?: boolean;
  deepResearchEnabled: boolean;
  canStartDeepResearch: boolean;
  onToggleDeepResearch: () => void;
  selectedSkillName?: string | null;
  onOpenSkillPicker: () => void;
  onInsertGoal: () => void;
  onOpenMention: () => void;
  onAttachImage: () => void;
  /** 打开侧栏 Agent / 派生态（集群） */
  onFocusSwarm?: () => void;
  queueLength: number;
  onFocusQueue?: () => void;
}

type ChipIcon = ComponentType<{ state?: ChipIconState; className?: string }>;

function ChipButton({
  label,
  title,
  testId,
  pressed,
  disabled,
  onClick,
  Icon,
}: {
  label: string;
  title: string;
  testId: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  Icon: ChipIcon;
}) {
  const [hovered, setHovered] = useState(false);
  const state: ChipIconState = pressed ? "active" : hovered ? "hover" : "idle";

  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      aria-pressed={pressed}
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
        "border-[var(--om-divider)] bg-[var(--om-bg)] text-[var(--om-text-2)]",
        "hover:border-[color-mix(in_srgb,var(--om-brand)_35%,var(--om-divider))]",
        "hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]",
        pressed &&
          "border-[var(--om-brand-light)] bg-[var(--om-brand-soft)]/55 text-[var(--om-brand-deep)]",
        disabled && "cursor-not-allowed opacity-40 hover:bg-[var(--om-bg)]",
      )}
    >
      <Icon state={state} className="h-[15px] w-[15px]" />
      <span>{label}</span>
    </button>
  );
}

/** 「+」菜单内的会话级能力项：与 ChipButton 同一套图标态机 */
function MoreMenuItem({
  label,
  title,
  testId,
  pressed,
  disabled,
  onClick,
  Icon,
}: {
  label: string;
  title: string;
  testId: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  Icon: ChipIcon;
}) {
  const [hovered, setHovered] = useState(false);
  const state: ChipIconState = pressed ? "active" : hovered ? "hover" : "idle";

  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      aria-pressed={pressed}
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors",
        "text-[var(--om-text-2)] hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]",
        pressed && "bg-[var(--om-brand-soft)]/55 text-[var(--om-brand-deep)]",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
    >
      <Icon state={state} className="h-[15px] w-[15px] shrink-0" />
      <span className="flex-1">{label}</span>
      {pressed && <Check className="h-3.5 w-3.5 text-[var(--om-brand-deep)]" />}
    </button>
  );
}

export function ChatInputChips({
  disabled,
  isSubagentSession,
  deepResearchEnabled,
  canStartDeepResearch,
  onToggleDeepResearch,
  selectedSkillName,
  onOpenSkillPicker,
  onInsertGoal,
  onOpenMention,
  onAttachImage,
  onFocusSwarm,
  queueLength,
  onFocusQueue,
}: ChatInputChipsProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const deepResearchActive = deepResearchEnabled && canStartDeepResearch;

  // 外部点击 / Esc 关闭「+」菜单
  useEffect(() => {
    if (!moreOpen) return;
    const onMouseDown = () => setMoreOpen(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  return (
    <div
      className="mt-2.5 flex flex-wrap items-center justify-center gap-2"
      data-testid="chat-input-chips"
    >
      <ChipButton
        testId="chat-chip-skill"
        label={selectedSkillName ? `Skill · ${selectedSkillName.slice(0, 10)}` : "Skill"}
        pressed={!!selectedSkillName}
        disabled={disabled}
        onClick={onOpenSkillPicker}
        Icon={IconSkillWand}
        title={
          selectedSkillName
            ? `已选 ${selectedSkillName}（点击更换）`
            : isSubagentSession
              ? "选择已启用 Skill，或输入 /"
              : "选择命令 / Skill，或输入 /goal、/research"
        }
      />
      <ChipButton
        testId="chat-mention-post"
        label="引用"
        disabled={disabled}
        onClick={onOpenMention}
        Icon={IconDocRef}
        title="引用文章（输入 @ 也可）"
      />
      <ChipButton
        testId="chat-attach-image"
        label="图片"
        disabled={disabled}
        onClick={onAttachImage}
        Icon={IconImageFrame}
        title="添加图片"
      />
      {queueLength > 0 && (
        <ChipButton
          testId="chat-chip-queue"
          label={`队列 ${queueLength}`}
          disabled={disabled}
          onClick={() => onFocusQueue?.()}
          Icon={IconQueueBars}
          title="查看发送队列"
        />
      )}
      {!isSubagentSession && (
        <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            data-testid="chat-chip-more"
            disabled={disabled}
            aria-expanded={moreOpen}
            title="更多能力（深度研究 / 目标 / 集群）"
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "relative inline-flex items-center justify-center rounded-full border p-1.5 transition-colors",
              "border-[var(--om-divider)] bg-[var(--om-bg)] text-[var(--om-text-2)]",
              "hover:border-[color-mix(in_srgb,var(--om-brand)_35%,var(--om-divider))]",
              "hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]",
              moreOpen && "border-[var(--om-brand-light)] bg-[var(--om-brand-soft)]/55",
              disabled && "cursor-not-allowed opacity-40 hover:bg-[var(--om-bg)]",
            )}
          >
            <Plus
              className={cn(
                "h-[15px] w-[15px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                moreOpen && "rotate-45",
              )}
            />
            {deepResearchActive && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--om-brand)] ring-2 ring-[var(--om-bg)]" />
            )}
          </button>
          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={SPRING_GENTLE}
                className="absolute bottom-full left-1/2 z-30 mb-2 w-44 -translate-x-1/2 rounded-xl border border-[var(--om-divider)] bg-[var(--om-bg-alt)] p-1 shadow-[0_8px_28px_-10px_rgba(0,135,235,0.25)]"
                data-testid="chat-chip-more-menu"
              >
                <MoreMenuItem
                  testId="chat-deep-research-toggle"
                  label="深度研究"
                  pressed={deepResearchActive}
                  disabled={disabled || !canStartDeepResearch}
                  onClick={() => {
                    onToggleDeepResearch();
                    setMoreOpen(false);
                  }}
                  Icon={IconDeepResearch}
                  title={
                    canStartDeepResearch
                      ? deepResearchEnabled
                        ? "关闭深度研究（发送不再自动加 /research）"
                        : "开启深度研究：发送时自动加 /research"
                      : "深度研究仅新会话首条消息前可选"
                  }
                />
                <MoreMenuItem
                  testId="chat-chip-goal"
                  label="目标"
                  disabled={disabled}
                  onClick={() => {
                    onInsertGoal();
                    setMoreOpen(false);
                  }}
                  Icon={IconGoalFlag}
                  title="插入 /goal ，设立 standing goal"
                />
                {onFocusSwarm && (
                  <MoreMenuItem
                    testId="chat-chip-swarm"
                    label="集群"
                    disabled={disabled}
                    onClick={() => {
                      onFocusSwarm();
                      setMoreOpen(false);
                    }}
                    Icon={IconSwarmCluster}
                    title="查看 Agent 集群 / 侧栏"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
