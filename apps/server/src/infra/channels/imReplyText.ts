/**
 * IM 回发纯文本规划（QQ 官方 Bot）：Markdown 清洗、思考/正文拆条、本地媒体路径解析。
 */

import fs from "node:fs";
import path from "node:path";

function resolveProjectRoot(): string {
  return (
    process.env.PROJECT_ROOT ||
    path.resolve(process.cwd().includes("apps") ? path.join(process.cwd(), "../..") : process.cwd())
  );
}

/** 把项目内相对路径（如 /uploads/xxx.png）转成绝对路径 */
export function resolveProjectMediaPath(input: string): string {
  if (!input || typeof input !== "string") return "";
  if (/^https?:\/\//i.test(input)) return input;
  if (path.isAbsolute(input)) return input.replace(/\\/g, "/");
  let rel = input;
  if (rel.startsWith("/")) rel = rel.slice(1);
  if (rel.startsWith("uploads/")) rel = `content/${rel}`;
  return path.resolve(resolveProjectRoot(), rel).replace(/\\/g, "/");
}

export function extractImageUrlsFromMarkdown(text: string): string[] {
  const urls: string[] = [];
  const regex = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) urls.push(match[1].trim());
  }
  return urls;
}

export function stripMarkdownImages(text: string): string {
  return text.replace(/!\[([^\]]*)\]\([^)]+\)/g, (__, alt) => (alt ? `[图片：${alt}]` : ""));
}

export function mdToPlain(s: string): string {
  return s
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/^\s*>\s+/gm, "")
    .replace(/^\s*-{3,}\s*$/gm, "---");
}

/**
 * 思考超过此字数才改发 .txt；短思考走「【思考过程】」文本条。
 * 官方文本单条上限约 4000（sendQqOfficialText），默认 3500 留前缀余量。
 */
export function thinkingTxtThreshold(): number {
  const n = Number(process.env.QQ_BOT_THINKING_TXT_CHARS || "3500");
  return Number.isFinite(n) && n >= 20 ? Math.floor(n) : 3500;
}

export function answerMaxChars(): number {
  const n = Number(process.env.QQ_BOT_ANSWER_MAX_CHARS || "4500");
  return Number.isFinite(n) && n >= 200 ? Math.floor(n) : 4500;
}

export type ImReplyPlan =
  | { kind: "thinking_text"; text: string }
  | { kind: "thinking_file"; fileName: string; content: string }
  | { kind: "answer"; text: string; imageUrls: string[] };

/**
 * 规划 IM 回发：最多两条——① 思考过程（短文本 / 长则 txt）② 正式回复。
 */
export function planImReply(opts: {
  reasoning?: string;
  answer: string;
  thinkingTxtThreshold?: number;
  answerMaxChars?: number;
}): ImReplyPlan[] {
  const plans: ImReplyPlan[] = [];
  const plainReasoning = opts.reasoning?.trim() ? mdToPlain(opts.reasoning.trim()) : "";
  const imageUrls = extractImageUrlsFromMarkdown(opts.answer || "");
  const plainAnswer = mdToPlain(stripMarkdownImages(opts.answer || "")) || "（空回复）";
  const threshold = opts.thinkingTxtThreshold ?? thinkingTxtThreshold();
  const maxAnswer = opts.answerMaxChars ?? answerMaxChars();

  if (plainReasoning) {
    if (plainReasoning.length > threshold) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      plans.push({
        kind: "thinking_file",
        fileName: `thinking-${stamp}.txt`,
        content: plainReasoning,
      });
    } else {
      plans.push({
        kind: "thinking_text",
        text: `【思考过程】\n${plainReasoning}`,
      });
    }
  }

  const answerText =
    plainAnswer.length > maxAnswer
      ? `${plainAnswer.slice(0, maxAnswer)}\n…（正文过长已截断）`
      : plainAnswer;
  plans.push({ kind: "answer", text: answerText, imageUrls });
  return plans;
}

export function writeThinkingTxtFile(fileName: string, content: string): string {
  const dir = path.resolve(resolveProjectRoot(), "content/uploads/qq-text");
  fs.mkdirSync(dir, { recursive: true });
  const safe = fileName.replace(/[^\w.\-]+/g, "_");
  const abs = path.join(dir, safe);
  fs.writeFileSync(abs, content, "utf8");
  return abs.replace(/\\/g, "/");
}
