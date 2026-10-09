/** 注入的 HTML 只来自构建端共享 sanitize 管线，不接受原始文章或浏览器输入。 */
import fs from "node:fs";
import path from "node:path";
import type { MarkdownHeading } from "@oasismind/markdown";
import { ReadingEnhancements } from "@/components/ReadingEnhancements";
import { StaticWidget } from "@/components/StaticWidget";
import type { AboutProfile } from "@oasismind/shared";

export function getReadingDocument(kind: "posts" | "gardens" | "pages", id: string): {
  html: string; headings: MarkdownHeading[];
  excerptHtml: string;
  profile?: Pick<AboutProfile, "name" | "title" | "tagline" | "oneLiner" | "github" | "roles" | "focus" | "projects">;
} {
  const root = path.resolve(process.cwd(), ".reading", kind);
  const file = path.resolve(root, `${id}.json`);
  if (!file.startsWith(`${root}${path.sep}`)) throw new Error("阅读文档路径越界");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function PublicMarkdown({ html }: { html: string }) {
  return <div data-reading-content>
    <div dangerouslySetInnerHTML={{ __html: html }} />
    <StaticWidget kind="reader"><ReadingEnhancements /></StaticWidget>
  </div>;
}
