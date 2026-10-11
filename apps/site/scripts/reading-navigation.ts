/** 导航独立于 React 控件启动，手机开侧栏不必等搜索、分页运行时解析。 */
import { enhanceReadingNavigation } from "../lib/readingNavigation";
import { enhanceSpatialNavigation } from "@oasismind/brand/spatial-interactions";

const content = document.querySelector<HTMLElement>("[data-reading-content]");
if (content) {
  enhanceReadingNavigation(content);

  const annotationArticle = document.querySelector<HTMLElement>("[data-local-annotation-article]");
  if (annotationArticle) import("./local-annotations").then(({ enhanceLocalAnnotations }) => {
    enhanceLocalAnnotations(annotationArticle);
  }).catch(() => {
    const notice = document.createElement("p");
    notice.className = "local-notes-load-error";
    notice.setAttribute("role", "alert");
    notice.textContent = "本地笔记暂时无法加载；正文仍可阅读。请检查连接后重新打开此页。";
    annotationArticle.prepend(notice);
  });

  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".article-toc a"));
  const byId = new Map(links.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  // [OM-FREEPLAY] 页内目录高亮仍以固定页头下方的可见标题为准，不为此启动 React。
  const observer = new IntersectionObserver((entries) => {
    const first = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!first) return;
    links.forEach((link) => link.removeAttribute("aria-current"));
    byId.get(first.target.id)?.setAttribute("aria-current", "location");
  }, { rootMargin: "-90px 0px -60% 0px", threshold: 0 });
  content.querySelectorAll("h1[id],h2[id],h3[id]").forEach((heading) => observer.observe(heading));

  const marks = Array.from(content.querySelectorAll<HTMLElement>("mark.rough-mark"));
  if (marks.length) import("rough-notation").then(({ annotate }) => {
    const valid = ["underline", "circle", "highlight", "box", "bracket", "crossed-off", "strike-through"] as const;
    for (const element of marks) {
      const type = valid.find((value) => value === element.dataset.annotation) ?? "highlight";
      const drawing = annotate(element, { type, color: element.dataset.color ?? (type === "highlight" ? "#fde68a" : "#f97316"), multiline: true, padding: 2, iterations: 2 });
      drawing.show();
      const resize = new ResizeObserver(() => { drawing.hide(); drawing.show(); });
      resize.observe(element);
    }
  }).catch(() => { /* 原生 mark 保留，绘制失败不阻塞正文。 */ });
}
enhanceSpatialNavigation();
