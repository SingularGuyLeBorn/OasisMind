interface DisplayContent {
  content: string;
  collapsedLeadHeading: boolean;
}

function titleParts(value: string): { chapter: string | null; body: string } {
  const plain = value.trim().replace(/\s+#+\s*$/, "");
  const numbered = /^(\d+(?:\.\d+)*)(?:\s*[·．.、:：\-—]\s*|\s+)(.+)$/.exec(plain);
  return {
    chapter: numbered?.[1] ?? null,
    body: (numbered?.[2] ?? plain).replace(/\s+/g, " ").trim().toLocaleLowerCase("zh-CN"),
  };
}

/**
 * 阅读态页头已经显示 frontmatter 标题。仅当正文最前面的 H1 与它确实同题时，
 * 把 H1 并入页头；编辑态始终保留原始 Markdown。
 */
export function collapseMatchingLeadHeading(content: string, title: string): DisplayContent {
  const lead = /^(\uFEFF?(?:[ \t]*\r?\n)*[ \t]*)#(?!#)[ \t]+([^\r\n]+)(?:\r?\n|$)/.exec(content);
  if (!lead) return { content, collapsedLeadHeading: false };

  const page = titleParts(title);
  const heading = titleParts(lead[2]);
  if (!page.body || page.body !== heading.body) {
    return { content, collapsedLeadHeading: false };
  }
  if (page.chapter && heading.chapter && page.chapter !== heading.chapter) {
    return { content, collapsedLeadHeading: false };
  }

  // [OM-FREEPLAY] 原文仍由编辑器保存；只整理阅读态展示，避免手机上连续出现两个大标题。
  return {
    content: content.slice(lead[0].length).replace(/^\r?\n/, ""),
    collapsedLeadHeading: true,
  };
}
