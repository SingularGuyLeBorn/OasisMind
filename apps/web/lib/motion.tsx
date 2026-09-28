/**
 * 全站动效基座（单文件收拢）：spring 预设 + 列表/卡片 variants。
 * 项目偏好曲线见 AGENTS.md（spring 260/26）；新增动效一律从这里取，禁止散落魔法数。
 */
import type { Variants, Transition } from "framer-motion";

/** 项目标准弹簧（Chat 等）：stiffness 260 / damping 26 */
export const SPRING_GENTLE: Transition = { type: "spring", stiffness: 260, damping: 26 };

/** 卡片入场弹簧：略软，适合网格批量入场 */
export const SPRING_CARD: Transition = { type: "spring", stiffness: 220, damping: 22 };

/** 布局重排弹簧（layout / popLayout 共用）：快而稳，避免筛选时拖泥带水 */
export const SPRING_LAYOUT: Transition = { type: "spring", stiffness: 320, damping: 30 };

/** 列表父容器：子项交错入场 */
export const listStaggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

/** 列表子项：上浮 + 微缩放入场 */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_CARD },
};

/** 列表子项退场（配合 AnimatePresence popLayout） */
export const listItemExit = {
  opacity: 0,
  scale: 0.96,
  transition: { duration: 0.18 },
} as const;

/** 卡片 hover：浮起（阴影走 CSS transition，与 om-lift 对齐） */
export const cardHoverLift = { whileHover: { y: -4 }, transition: SPRING_GENTLE } as const;
