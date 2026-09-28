"use client";

import { createContext, useContext, ReactNode, RefObject } from "react";

const MainScrollContext = createContext<RefObject<HTMLElement | null> | null>(null);

export function MainScrollProvider({
  rootRef,
  children,
}: {
  rootRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  return <MainScrollContext value={rootRef}>{children}</MainScrollContext>;
}

/**
 * 返回滚动容器 ref（而非解引用元素）——framer-motion useInView 的 root 参数
 * 要的是 RefObject（内部自读 current）；提前解引用会让 root 静默失效且类型不匹配。
 * HTMLElement → Element 收窄安全（消费方只读 current）。
 */
export function useMainScrollRoot(): RefObject<Element | null> | undefined {
  const ctx = useContext(MainScrollContext);
  return (ctx as RefObject<Element | null> | null) ?? undefined;
}
