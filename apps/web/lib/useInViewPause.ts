"use client";

import { useEffect, useState, type RefObject } from "react";

/** 元素进入视口才返回 true；离屏可停 RAF / WebGL frameloop */
export function useInViewPause(
  ref: RefObject<HTMLElement | null>,
  threshold = 0.08,
): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);

  return visible;
}
