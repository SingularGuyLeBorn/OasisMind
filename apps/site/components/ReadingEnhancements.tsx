"use client";

import { useEffect } from "react";

/** 正文已经排版；这里只增强目录活动项与手写标记，不重新处理全文。 */
export function ReadingEnhancements() {
  useEffect(() => {
    const content = document.querySelector<HTMLElement>("[data-reading-content]");
    if (!content) return;
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".article-toc a"));
    const byId = new Map(links.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
    // [OM-FREEPLAY] 目录活动项以固定页头下方的可见标题为准，预留底部阅读区域。
    const observer = new IntersectionObserver((entries) => {
      const first = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!first) return;
      links.forEach((link) => link.removeAttribute("aria-current"));
      byId.get(first.target.id)?.setAttribute("aria-current", "location");
    }, { rootMargin: "-90px 0px -60% 0px", threshold: 0 });
    content.querySelectorAll("h1[id],h2[id],h3[id]").forEach((heading) => observer.observe(heading));
    const marks = Array.from(content.querySelectorAll<HTMLElement>("mark.rough-mark"));
    let active = true;
    const disposals: Array<() => void> = [];
    if (marks.length) import("rough-notation").then(({ annotate }) => {
      if (!active) return;
      const valid = ["underline", "circle", "highlight", "box", "bracket", "crossed-off", "strike-through"] as const;
      for (const element of marks) {
        const type = valid.find((value) => value === element.dataset.annotation) ?? "highlight";
        const drawing = annotate(element, { type, color: element.dataset.color ?? (type === "highlight" ? "#fde68a" : "#f97316"), multiline: true, padding: 2, iterations: 2 });
        drawing.show();
        const resize = new ResizeObserver(() => { drawing.hide(); drawing.show(); });
        resize.observe(element);
        disposals.push(() => { resize.disconnect(); drawing.remove(); });
      }
    }).catch(() => { /* 原生 mark 保留，绘制失败不阻塞正文。 */ });
    return () => { active = false; observer.disconnect(); disposals.forEach((dispose) => dispose()); };
  }, []);
  return null;
}
