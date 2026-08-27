/**
 * 编辑器补全上下文：以「当前段落」为默认焦点，再截取前后窗口。
 */

export const EDITOR_CTX_CHARS = 1200;

export type EditorCompleteContext = {
  /** 光标所在段落（含空行分隔的块） */
  paragraph: string;
  /** 光标前窗口（含段落之前） */
  before: string;
  /** 光标后窗口 */
  after: string;
  /** 有划选时的选区文本 */
  selected?: string;
  /** 源码坐标：光标/选区（用于 Accept 写回） */
  start: number;
  end: number;
};

/** 找包含 cursor 的段落边界（按空行分段） */
export function findParagraphBounds(
  content: string,
  cursor: number,
): { start: number; end: number } {
  const c = Math.max(0, Math.min(cursor, content.length));
  let start = c;
  while (start > 0) {
    if (content[start - 1] === "\n" && content[start - 2] === "\n") break;
    start -= 1;
  }
  let end = c;
  while (end < content.length) {
    if (content[end] === "\n" && content[end + 1] === "\n") break;
    end += 1;
  }
  return { start, end };
}

/**
 * 从 Markdown 源码 + 光标/选区提取补全上下文。
 * 默认带上当前段落；before/after 再向两侧扩 EDITOR_CTX_CHARS。
 */
export function extractEditorCompleteContext(
  content: string,
  start: number,
  end: number = start,
): EditorCompleteContext {
  const s = Math.max(0, Math.min(start, content.length));
  const e = Math.max(s, Math.min(end, content.length));
  const selected = s !== e ? content.slice(s, e) : undefined;
  const focus = selected?.trim() ? Math.floor((s + e) / 2) : s;
  const para = findParagraphBounds(content, focus);
  const paragraph = content.slice(para.start, para.end).trim();

  const beforeStart = Math.max(0, Math.min(s, para.start) - EDITOR_CTX_CHARS);
  const afterEnd = Math.min(content.length, Math.max(e, para.end) + EDITOR_CTX_CHARS);

  return {
    paragraph,
    before: content.slice(beforeStart, s),
    after: content.slice(e, afterEnd),
    selected: selected?.trim() ? selected : undefined,
    start: s,
    end: e,
  };
}

const AT_AGENT_TAIL =
  /[@＠](agent)([\w\u4e00-\u9fff-]*)[\s\u200b\u200c\u200d\ufeff]*$/i;
const AT_AGENT_TOKEN = /[@＠]agent[\w\u4e00-\u9fff-]*/i;

/** 正文键入 @agent… 时识别（大小写不敏感；兼容全角 ＠、零宽字符、光标落在词内） */
export function detectEditorAgentAtTrigger(
  text: string,
  cursor: number,
): { query: string; token: string; tokenStart: number } | null {
  const c = Math.max(0, Math.min(cursor, text.length));
  const before = text.slice(0, c);
  const tail = before.match(AT_AGENT_TAIL);
  if (tail) {
    return {
      token: tail[0]!,
      query: (tail[2] ?? "").replace(/^[-_]+/, ""),
      tokenStart: c - tail[0]!.length,
    };
  }
  const hit = AT_AGENT_TOKEN.exec(text);
  if (!hit || hit.index == null) return null;
  const start = hit.index;
  const end = start + hit[0]!.length;
  if (c < start || c > end) return null;
  const q = hit[0]!.replace(/^[@＠]agent/i, "").replace(/^[-_]+/, "");
  return { token: hit[0]!, query: q, tokenStart: start };
}

export type MarkdownImageRef = { alt: string; url: string };

/** 从 Markdown 片段抽出 `![alt](url)`，供预览与插入 */
export function extractMarkdownImages(markdown: string): MarkdownImageRef[] {
  const out: MarkdownImageRef[] = [];
  const re = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    const url = m[2]?.trim();
    if (url) out.push({ alt: m[1] ?? "", url });
  }
  return out;
}

export function stripMarkdownImages(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 协写指令是「生图/配图」时走配图管线，不写正文 */
export function isIllustrationInstruction(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return /生图|配图|画一张|画一[张幅]|插图|示意图|配一张|generate\s+(an?\s+)?image|illustration/i.test(
    t,
  );
}

/**
 * Accept 才写回源码。Reject / 预览阶段不得调用本函数。
 * replaceDocument 整篇替换；否则按 [insertStart, insertEnd) 切开插入。
 */
export function applyEditorCompleteToSource(
  doc: string,
  payload: {
    insertStart: number;
    insertEnd: number;
    content: string;
    replaceDocument?: boolean;
  },
): string {
  if (payload.replaceDocument) return payload.content;
  const start = Math.max(0, Math.min(payload.insertStart, doc.length));
  const end = Math.max(start, Math.min(payload.insertEnd, doc.length));
  return doc.slice(0, start) + payload.content + doc.slice(end);
}
