/** 和构建端同一批 React 控件，只水合搜索/分页等小区域，全文不重新挂载。 */
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { KnowledgeBrowser } from "../components/KnowledgeBrowser";
import { PostList } from "../components/PostList";
import { ReadingEnhancements } from "../components/ReadingEnhancements";

for (const container of document.querySelectorAll<HTMLElement>("[data-public-widget]")) {
  const root = container.querySelector<HTMLElement>("[data-widget-root]");
  const data = container.querySelector<HTMLScriptElement>("[data-widget-props]");
  if (!root || !data) continue;
  const props = JSON.parse(data.textContent ?? "{}");
  const kind = container.dataset.publicWidget;
  hydrateRoot(root, kind === "posts" ? <PostList {...props} /> : kind === "search" ? <KnowledgeBrowser {...props} /> : <ReadingEnhancements />);
}
