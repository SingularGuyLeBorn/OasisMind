/**
 * 知乎列表查询的纯数据层。
 *
 * 事实源仍是知乎开放平台返回值；本模块只做宽容字段归一化、本地筛选、稳定排序和展示，
 * 不读取 Cookie、不访问网络、不写数据库。CLI、Agent 工具和离线 fixture 因而能共享同一套
 * 语义。未知字段不会被猜成“已关注”或“标签命中”，避免把缺数据误当成否定结果。
 */

export type ZhihuContentType = "article" | "answer" | "question" | "pin" | "unknown";
export type ZhihuSortField = "relevance" | "votes" | "comments" | "time";
export type ZhihuFollowFilter = "any" | "only" | "exclude";

export type ZhihuListItem = {
  rank: number;
  contentType: ZhihuContentType;
  id: string;
  title: string;
  summary: string;
  author: {
    name: string;
    urlToken: string | null;
  };
  question: {
    id: string | null;
    title: string | null;
  };
  voteCount: number;
  commentCount: number;
  publishedAt: string | null;
  publishedTimestamp: number | null;
  followed: boolean | null;
  tags: string[];
  url: string;
  rankingScore: number | null;
  authorityLevel: string | null;
  pinned: boolean | null;
};

export type ZhihuListFilter = {
  contentTypes?: ZhihuContentType[];
  author?: string;
  tags?: string[];
  tagMode?: "all" | "any";
  from?: number;
  to?: number;
  minVotes?: number;
  follow?: ZhihuFollowFilter;
  pinnedOnly?: boolean;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function firstValue(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function number(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function boolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

function normalizeTimestamp(value: unknown): number | null {
  const numeric = number(value);
  if (numeric !== null) {
    const milliseconds = numeric < 10_000_000_000 ? numeric * 1000 : numeric;
    return Number.isFinite(milliseconds) && milliseconds > 0 ? milliseconds : null;
  }
  const raw = text(value);
  if (!raw) return null;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeContentType(value: unknown, url: string): ZhihuContentType {
  const raw = text(value).toLowerCase();
  if (raw.includes("article") || raw.includes("文章") || /\/p\/\d+/.test(url)) return "article";
  if (raw.includes("answer") || raw.includes("回答") || /\/answer\/\d+/.test(url)) return "answer";
  if (raw.includes("question") || raw.includes("问题") || /\/question\/\d+/.test(url)) return "question";
  if (raw.includes("pin") || raw.includes("想法")) return "pin";
  return "unknown";
}

function normalizeUrl(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "source") url.searchParams.delete(key);
    }
    return url.toString().replace(/\?$/, "");
  } catch {
    return raw;
  }
}

function idFromUrl(url: string, contentType: ZhihuContentType): string {
  if (!url) return "";
  const patterns =
    contentType === "article"
      ? [/\/p\/(\d+)/]
      : contentType === "answer"
        ? [/\/answer\/(\d+)/]
        : contentType === "question"
          ? [/\/question\/(\d+)/]
          : [/\/(?:p|answer|question)\/(\d+)/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

function normalizeTag(value: unknown): string {
  if (typeof value === "string") return value.trim();
  const item = record(value);
  return text(firstValue(item, ["Name", "name", "Title", "title"]));
}

function normalizeTags(source: Record<string, unknown>, question: Record<string, unknown>): string[] {
  const values = [
    firstValue(source, ["Tags", "tags", "Topics", "topics"]),
    firstValue(question, ["Tags", "tags", "Topics", "topics"]),
  ];
  const tags = new Set<string>();
  for (const value of values) {
    const rows = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,，]/) : [];
    for (const row of rows) {
      const tag = normalizeTag(row);
      if (tag) tags.add(tag);
    }
  }
  return [...tags];
}

/** 把开放平台搜索、热榜和问题回答的不同字段归一为稳定 CLI 行。 */
export function normalizeZhihuListItem(raw: unknown, rank: number): ZhihuListItem {
  const source = record(raw);
  const question = record(firstValue(source, ["Question", "question"]));
  const author = record(firstValue(source, ["Author", "author"]));
  const url = normalizeUrl(firstValue(source, ["Url", "URL", "url", "ContentUrl", "content_url"]));
  const contentType = normalizeContentType(
    firstValue(source, ["ContentType", "contentType", "type", "Type"]),
    url,
  );
  const timestamp = normalizeTimestamp(
    firstValue(source, [
      "CreatedTime",
      "CreateTime",
      "PublishedTime",
      "PublishTime",
      "EditTime",
      "UpdatedTime",
      "created_time",
      "updated_time",
      "FavTime",
    ]),
  );
  const id = text(firstValue(source, ["ContentID", "ContentId", "Id", "id", "AnswerId"])) ||
    idFromUrl(url, contentType);
  const questionId =
    text(firstValue(source, ["QuestionId", "QuestionID", "questionId"])) ||
    text(firstValue(question, ["Id", "id"])) ||
    (contentType === "question" ? id : text(url.match(/\/question\/(\d+)/)?.[1]));
  return {
    rank,
    contentType,
    id,
    title: text(firstValue(source, ["Title", "title", "QuestionTitle"])) ||
      text(firstValue(question, ["Title", "title"])),
    summary: text(firstValue(source, ["ContentText", "Summary", "Excerpt", "summary", "excerpt"])),
    author: {
      name: text(firstValue(source, ["AuthorName", "authorName"])) ||
        text(firstValue(author, ["Name", "name", "Fullname", "fullname"])),
      urlToken:
        text(firstValue(source, ["AuthorUrlToken", "authorUrlToken"])) ||
        text(firstValue(author, ["UrlToken", "urlToken", "url_token"])) ||
        null,
    },
    question: {
      id: questionId || null,
      title:
        text(firstValue(source, ["QuestionTitle", "questionTitle"])) ||
        text(firstValue(question, ["Title", "title"])) ||
        (contentType === "question" ? text(firstValue(source, ["Title", "title"])) : "") ||
        null,
    },
    voteCount: number(firstValue(source, ["VoteUpCount", "LikeCount", "voteup_count", "voteCount"])) ?? 0,
    commentCount: number(firstValue(source, ["CommentCount", "comment_count", "commentCount"])) ?? 0,
    publishedAt: timestamp === null ? null : new Date(timestamp).toISOString(),
    publishedTimestamp: timestamp,
    followed: boolean(firstValue(source, ["IsFollowed", "isFollowed", "followed"])),
    tags: normalizeTags(source, question),
    url,
    rankingScore: number(firstValue(source, ["RankingScore", "rankingScore", "score"])),
    authorityLevel: text(firstValue(source, ["AuthorityLevel", "authorityLevel"])) || null,
    pinned: boolean(firstValue(source, ["IsTop", "IsPinned", "IsSticky", "pinned"])),
  };
}

export function normalizeZhihuList(items: unknown[]): ZhihuListItem[] {
  return items.map((item, index) => normalizeZhihuListItem(item, index + 1));
}

/** 关注列表只能证明命中；只有完整扫描结束后，未命中才能安全标成 false。 */
export function annotateZhihuFollowing(
  items: ZhihuListItem[],
  followedNames: ReadonlySet<string>,
  followedTokens: ReadonlySet<string>,
  complete: boolean,
): ZhihuListItem[] {
  return items.map((item) => {
    const hit =
      (item.author.name ? followedNames.has(item.author.name) : false) ||
      (item.author.urlToken ? followedTokens.has(item.author.urlToken) : false);
    return { ...item, followed: hit ? true : complete ? false : null };
  });
}

function includesFolded(haystack: string, needle: string): boolean {
  return haystack.toLocaleLowerCase("zh-CN").includes(needle.toLocaleLowerCase("zh-CN"));
}

export function filterZhihuList(items: ZhihuListItem[], filter: ZhihuListFilter): ZhihuListItem[] {
  const author = filter.author?.trim() ?? "";
  const tags = [...new Set((filter.tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
  return items.filter((item) => {
    if (filter.contentTypes?.length && !filter.contentTypes.includes(item.contentType)) return false;
    if (author && !includesFolded(item.author.name, author) && !includesFolded(item.author.urlToken ?? "", author)) {
      return false;
    }
    if (filter.from !== undefined && (item.publishedTimestamp === null || item.publishedTimestamp < filter.from)) {
      return false;
    }
    if (filter.to !== undefined && (item.publishedTimestamp === null || item.publishedTimestamp > filter.to)) {
      return false;
    }
    if (filter.minVotes !== undefined && item.voteCount < filter.minVotes) return false;
    if (filter.follow === "only" && item.followed !== true) return false;
    if (filter.follow === "exclude" && item.followed !== false) return false;
    if (filter.pinnedOnly && item.pinned !== true) return false;
    if (tags.length) {
      const itemTags = item.tags.map((tag) => tag.toLocaleLowerCase("zh-CN"));
      const matches = tags.map((tag) => itemTags.includes(tag.toLocaleLowerCase("zh-CN")));
      if ((filter.tagMode ?? "all") === "all" ? matches.some((match) => !match) : matches.every((match) => !match)) {
        return false;
      }
    }
    return true;
  });
}

/** Array.sort 已稳定，但仍显式用原始 rank 兜底，确保不同 Node 版本的输出可复现。 */
export function sortZhihuList(items: ZhihuListItem[], sort: ZhihuSortField): ZhihuListItem[] {
  const value = (item: ZhihuListItem): number => {
    if (sort === "votes") return item.voteCount;
    if (sort === "comments") return item.commentCount;
    if (sort === "time") return item.publishedTimestamp ?? Number.NEGATIVE_INFINITY;
    return item.rankingScore ?? -item.rank;
  };
  return [...items].sort((left, right) => value(right) - value(left) || left.rank - right.rank);
}

export function parseZhihuDate(raw: string, endOfDay = false): number {
  const value = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`日期必须使用 YYYY-MM-DD：${raw}`);
  }
  const timestamp = Date.parse(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+08:00`);
  if (!Number.isFinite(timestamp)) throw new Error(`无效日期：${raw}`);
  return timestamp;
}

export function buildZhihuTopicQuery(query: string, tags: string[]): string {
  const terms = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
  return [query.trim(), ...terms].filter(Boolean).join(" ");
}

function displayWidth(value: string): number {
  return [...value].reduce((total, char) => total + (/[^\x00-\xff]/.test(char) ? 2 : 1), 0);
}

function truncate(value: string, width: number): string {
  if (displayWidth(value) <= width) return value;
  let output = "";
  for (const char of value) {
    if (displayWidth(`${output}${char}…`) > width) break;
    output += char;
  }
  return `${output}…`;
}

function pad(value: string, width: number): string {
  const clipped = truncate(value, width);
  return clipped + " ".repeat(Math.max(0, width - displayWidth(clipped)));
}

/** 无第三方依赖的人类可读表格；JSON 模式始终返回完整字段，不受列宽截断。 */
export function renderZhihuTable(items: ZhihuListItem[]): string {
  if (!items.length) return "没有符合条件的知乎内容。";
  const columns = [
    { title: "#", width: 3, read: (item: ZhihuListItem) => String(item.rank) },
    { title: "类型", width: 6, read: (item: ZhihuListItem) => item.contentType },
    { title: "标题", width: 32, read: (item: ZhihuListItem) => item.title || item.summary },
    { title: "作者", width: 14, read: (item: ZhihuListItem) => item.author.name || "未知" },
    { title: "赞同", width: 8, read: (item: ZhihuListItem) => String(item.voteCount) },
    { title: "评论", width: 7, read: (item: ZhihuListItem) => String(item.commentCount) },
    { title: "时间", width: 10, read: (item: ZhihuListItem) => item.publishedAt?.slice(0, 10) ?? "-" },
    { title: "关注", width: 6, read: (item: ZhihuListItem) => item.followed === true ? "是" : item.followed === false ? "否" : "未知" },
  ];
  const header = columns.map((column) => pad(column.title, column.width)).join(" | ");
  const divider = columns.map((column) => "-".repeat(column.width)).join("-+-");
  const rows = items.map((item) => columns.map((column) => pad(column.read(item), column.width)).join(" | "));
  const links = items.map((item) => `${item.rank}. ${item.url || "（无 URL）"}${item.tags.length ? `  [${item.tags.join("、")}]` : ""}`);
  return [header, divider, ...rows, "", ...links].join("\n");
}
