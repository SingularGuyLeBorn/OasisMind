/**
 * 公开文章目录的纯 Markdown 标题提取器。输入仅是已公开正文，无文件或网络权限；
 * 不可识别的行会被忽略，重复标题通过稳定后缀消歧而不会覆盖前项。
 */
export interface ArticleHeading {
  depth: 2 | 3;
  text: string;
  id: string;
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** 与 rehype-slug 的常见标题规则对齐，并处理同名标题。 */
export function extractArticleHeadings(content: string): ArticleHeading[] {
  const seen = new Map<string, number>();
  const headings: ArticleHeading[] = [];
  for (const line of content.split(/\r?\n/)) {
    const match = /^(##|###)\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`[\]]/g, "").trim();
    const base = slugify(text) || "section";
    const duplicateIndex = seen.get(base) ?? 0;
    seen.set(base, duplicateIndex + 1);
    headings.push({
      depth: match[1].length as 2 | 3,
      text,
      id: duplicateIndex === 0 ? base : `${base}-${duplicateIndex}`,
    });
  }
  return headings;
}
