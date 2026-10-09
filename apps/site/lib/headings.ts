/** 与正文使用同一次管线，不再用行正则猜测 Markdown 标题。 */
import { buildMarkdownDocument } from "@oasismind/markdown";

export interface ArticleHeading {
  depth: 2 | 3;
  text: string;
  id: string;
}

export function extractArticleHeadings(content: string): ArticleHeading[] {
  return buildMarkdownDocument({ content }).headings
    .filter((heading) => heading.level === 2 || heading.level === 3)
    .map((heading) => ({ depth: heading.level as 2 | 3, text: heading.text, id: heading.id }));
}
