/**
 * 知乎 CLI 的纯参数契约。
 *
 * 这里不加载配置、数据库或浏览器，因此帮助文本和非法组合可在离线测试中直接验证。
 * 参数错误统一抛 ZhihuCliUsageError，由入口映射为退出码 2。
 */
import type {
  ZhihuContentType,
  ZhihuFollowFilter,
  ZhihuSortField,
} from "../infra/zhihuQuery.js";

export type ZhihuCliCommand =
  | "help"
  | "status"
  | "search"
  | "hot"
  | "read"
  | "answers"
  | "comments"
  | "follow-check"
  | "save";

export type ZhihuCliRequest = {
  command: ZhihuCliCommand;
  positional: string[];
  json: boolean;
  help: boolean;
  limit?: number;
  offset?: number;
  cursor?: string;
  page?: number;
  timeoutMs: number;
  sort?: ZhihuSortField;
  follow: ZhihuFollowFilter;
  tags: string[];
  requiredTags: string[];
  tagMode: "all" | "any";
  author?: string;
  question?: string;
  query?: string;
  contentTypes: ZhihuContentType[];
  from?: string;
  to?: string;
  minVotes?: number;
  pinnedOnly: boolean;
  maxFollowees: number;
  maxComments?: number;
  commentOrder?: "score" | "reverse" | "ascending";
  maxChars?: number;
  metaOnly: boolean;
  noComments: boolean;
};

export class ZhihuCliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZhihuCliUsageError";
  }
}

const COMMAND_ALIASES: Record<string, ZhihuCliCommand> = {
  help: "help",
  status: "status",
  search: "search",
  hot: "hot",
  top: "hot",
  trending: "hot",
  read: "read",
  answers: "answers",
  comments: "comments",
  "follow-check": "follow-check",
  follow_check: "follow-check",
  followcheck: "follow-check",
  save: "save",
};

const VALUE_FLAGS = new Set([
  "--limit",
  "--count",
  "--offset",
  "--cursor",
  "--page",
  "--timeout",
  "--timeout-ms",
  "--sort",
  "--follow",
  "--tag",
  "--topic",
  "--require-tag",
  "--tag-mode",
  "--author",
  "--question",
  "--query",
  "--type",
  "--from",
  "--to",
  "--min-votes",
  "--max-followees",
  "--max",
  "--max-comments",
  "--order",
  "--max-chars",
  "--maxChars",
]);

function numberFlag(flag: string, raw: string, opts?: { integer?: boolean; min?: number; max?: number }): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || (opts?.integer !== false && !Number.isInteger(value))) {
    throw new ZhihuCliUsageError(`${flag} 需要${opts?.integer === false ? "数字" : "整数"}，收到：${raw}`);
  }
  if (opts?.min !== undefined && value < opts.min) {
    throw new ZhihuCliUsageError(`${flag} 不能小于 ${opts.min}`);
  }
  if (opts?.max !== undefined && value > opts.max) {
    throw new ZhihuCliUsageError(`${flag} 不能大于 ${opts.max}`);
  }
  return value;
}

function values(raw: string): string[] {
  return raw.split(/[,，]/).map((value) => value.trim()).filter(Boolean);
}

function parseType(raw: string): ZhihuContentType[] {
  const types = values(raw).map((value) => value.toLowerCase());
  if (types.includes("all")) return [];
  const allowed = new Set<ZhihuContentType>(["article", "answer", "question", "pin", "unknown"]);
  for (const type of types) {
    if (!allowed.has(type as ZhihuContentType)) {
      throw new ZhihuCliUsageError(`--type 只支持 article、answer、question、pin、all：${type}`);
    }
  }
  return [...new Set(types as ZhihuContentType[])];
}

function splitFlag(token: string): { flag: string; inline?: string } {
  const separator = token.indexOf("=");
  if (separator <= 0) return { flag: token };
  return { flag: token.slice(0, separator), inline: token.slice(separator + 1) };
}

export function parseZhihuCliArgs(argv: string[]): ZhihuCliRequest {
  // pnpm 在不同版本下可能把分隔符 `--` 原样转发；它没有业务含义，统一忽略。
  const args = argv.filter((token) => token !== "--");
  const first = args.shift() ?? "help";
  const commandToken = (first === "-h" || first === "--help" ? "help" : first).toLowerCase();
  const command = COMMAND_ALIASES[commandToken];
  if (!command) throw new ZhihuCliUsageError(`未知命令：${commandToken}`);

  const request: ZhihuCliRequest = {
    command,
    positional: [],
    json: false,
    help: false,
    timeoutMs: 30_000,
    follow: "any",
    tags: [],
    requiredTags: [],
    tagMode: "all",
    contentTypes: [],
    pinnedOnly: false,
    maxFollowees: 5_000,
    metaOnly: false,
    noComments: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index]!;
    if (token === "-h" || token === "--help") {
      request.help = true;
      continue;
    }
    if (token === "-j" || token === "--json") {
      request.json = true;
      continue;
    }
    if (token === "--meta-only" || token === "--metaOnly") {
      request.metaOnly = true;
      continue;
    }
    if (token === "--no-comments") {
      request.noComments = true;
      continue;
    }
    if (token === "--pinned" || token === "--pinned-only") {
      request.pinnedOnly = true;
      continue;
    }
    if (!token.startsWith("-")) {
      request.positional.push(token);
      continue;
    }

    const { flag, inline } = splitFlag(token);
    if (!VALUE_FLAGS.has(flag)) throw new ZhihuCliUsageError(`未知参数：${flag}`);
    const raw = inline ?? args[++index];
    if (raw === undefined || raw.startsWith("--")) {
      throw new ZhihuCliUsageError(`${flag} 缺少值`);
    }
    if (flag === "--limit" || flag === "--count") request.limit = numberFlag(flag, raw, { min: 1 });
    else if (flag === "--offset") request.offset = numberFlag(flag, raw, { min: 0 });
    else if (flag === "--cursor") request.cursor = raw.trim();
    else if (flag === "--page") request.page = numberFlag(flag, raw, { min: 1 });
    else if (flag === "--timeout" || flag === "--timeout-ms") {
      request.timeoutMs = numberFlag(flag, raw, { min: 1_000, max: 120_000 });
    } else if (flag === "--sort") {
      if (!(["relevance", "votes", "comments", "time"] as string[]).includes(raw)) {
        throw new ZhihuCliUsageError(`--sort 只支持 relevance、votes、comments、time：${raw}`);
      }
      request.sort = raw as ZhihuSortField;
    } else if (flag === "--follow") {
      if (!(["any", "only", "exclude"] as string[]).includes(raw)) {
        throw new ZhihuCliUsageError(`--follow 只支持 any、only、exclude：${raw}`);
      }
      request.follow = raw as ZhihuFollowFilter;
    } else if (flag === "--tag" || flag === "--topic") request.tags.push(...values(raw));
    else if (flag === "--require-tag") request.requiredTags.push(...values(raw));
    else if (flag === "--tag-mode") {
      if (raw !== "all" && raw !== "any") throw new ZhihuCliUsageError("--tag-mode 只支持 all 或 any");
      request.tagMode = raw;
    } else if (flag === "--author") request.author = raw.trim();
    else if (flag === "--question") request.question = raw.trim();
    else if (flag === "--query") request.query = raw.trim();
    else if (flag === "--type") request.contentTypes.push(...parseType(raw));
    else if (flag === "--from") request.from = raw.trim();
    else if (flag === "--to") request.to = raw.trim();
    else if (flag === "--min-votes") request.minVotes = numberFlag(flag, raw, { min: 0 });
    else if (flag === "--max-followees") request.maxFollowees = numberFlag(flag, raw, { min: 1, max: 20_000 });
    else if (flag === "--max" || flag === "--max-comments") request.maxComments = numberFlag(flag, raw, { min: 1, max: 1_000 });
    else if (flag === "--order") {
      if (!(["score", "reverse", "ascending"] as string[]).includes(raw)) {
        throw new ZhihuCliUsageError(`--order 只支持 score、reverse、ascending：${raw}`);
      }
      request.commentOrder = raw as "score" | "reverse" | "ascending";
    } else if (flag === "--max-chars" || flag === "--maxChars") {
      request.maxChars = numberFlag(flag, raw, { min: 200, max: 200_000 });
    }
  }

  request.tags = [...new Set(request.tags)];
  request.requiredTags = [...new Set(request.requiredTags)];
  request.contentTypes = [...new Set(request.contentTypes)];
  return validateZhihuCliRequest(request);
}

function rejectPagination(request: ZhihuCliRequest, command: string): void {
  if ((request.page ?? 1) > 1 || request.offset !== undefined || request.cursor !== undefined) {
    throw new ZhihuCliUsageError(
      `${command} 对应的官方接口不提供翻页；只支持第一页。问题回答请用 answers --page/--cursor。`,
    );
  }
}

function validateZhihuCliRequest(request: ZhihuCliRequest): ZhihuCliRequest {
  if (request.help || request.command === "help") return request;
  const pagers = [request.offset !== undefined, request.cursor !== undefined, request.page !== undefined]
    .filter(Boolean).length;
  if (pagers > 1) throw new ZhihuCliUsageError("--offset、--cursor、--page 只能选一个");

  if (request.command === "search") {
    const query = request.positional.join(" ").trim();
    if (query.length < 2) throw new ZhihuCliUsageError("search 需要至少 2 个字符的关键词");
    if ((request.limit ?? 10) > 10) throw new ZhihuCliUsageError("知乎站内搜索 --limit 最大为 10");
    rejectPagination(request, "search");
  } else if (request.command === "hot") {
    if (request.positional.length) throw new ZhihuCliUsageError("hot 不接受位置参数");
    if ((request.limit ?? 30) > 30) throw new ZhihuCliUsageError("知乎热榜 --limit 最大为 30");
    if (request.tags.length) throw new ZhihuCliUsageError("hot 没有搜索词，--tag 只适用于 search；精确过滤请用 --require-tag");
    rejectPagination(request, "hot");
  } else if (request.command === "answers") {
    if (!request.positional[0]) throw new ZhihuCliUsageError("answers 需要问题 id 或 URL");
    if ((request.limit ?? 20) > 50) throw new ZhihuCliUsageError("问题回答 --limit 最大为 50");
    if (request.tags.length) throw new ZhihuCliUsageError("answers 不执行搜索，--tag 只适用于 search；精确过滤请用 --require-tag");
    if (request.sort === "relevance") {
      throw new ZhihuCliUsageError("answers 没有相关度字段；请选择 votes、comments 或 time");
    }
  } else if (request.command === "read") {
    if (!request.positional[0]) throw new ZhihuCliUsageError("read 需要文章或回答 URL");
  } else if (request.command === "comments") {
    if (!request.positional[0]) throw new ZhihuCliUsageError("comments 需要文章或回答 URL");
  } else if (request.command === "follow-check") {
    if (!request.positional.length) throw new ZhihuCliUsageError("follow-check 需要作者名或 url_token");
  } else if (request.command === "save") {
    if (!request.positional[0]) throw new ZhihuCliUsageError("save 需要文章或回答 URL");
  }

  const listCommands: ZhihuCliCommand[] = ["search", "hot", "answers"];
  if (!listCommands.includes(request.command)) {
    const listOnly =
      request.sort !== undefined || request.follow !== "any" || request.tags.length > 0 ||
      request.requiredTags.length > 0 || request.author !== undefined || request.question !== undefined ||
      request.query !== undefined || request.contentTypes.length > 0 || request.from !== undefined ||
      request.to !== undefined || request.minVotes !== undefined || request.pinnedOnly;
    if (listOnly) throw new ZhihuCliUsageError(`${request.command} 不支持列表筛选参数`);
  }
  return request;
}

export function zhihuCliUsage(command?: ZhihuCliCommand): string {
  const detail: Partial<Record<ZhihuCliCommand, string>> = {
    search: `search <关键词> [--type article,answer] [--sort relevance|votes|comments|time]
  [--follow any|only|exclude] [--tag 话题] [--require-tag 话题] [--author 作者]
  [--question id|URL] [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--min-votes N]
  [--limit 1..10] [--json]`,
    hot: `hot [--limit 1..30] [--sort relevance|votes|comments|time] [列表筛选参数] [--json]`,
    answers: `answers <问题id|URL> [--limit 1..50] [--page N|--offset N|--cursor VALUE]
  [--query 关键词] [--sort votes|comments|time] [列表筛选参数] [--json]`,
    read: "read <文章/回答URL> [--offset N] [--max-chars N] [--meta-only] [--json]",
    comments: "comments <文章/回答URL> [--order score|reverse|ascending] [--max-comments N] [--json]",
    "follow-check": "follow-check <作者名|url_token ...> [--max-followees N] [--json]",
    save: "save <文章/回答URL> [--no-comments] [--max-comments N] [--max-chars N] [--json]",
    status: "status [--json]",
  };
  if (command && command !== "help" && detail[command]) {
    return `知乎 CLI · ${command}\n\n${detail[command]}\n\n通用参数：--timeout 1000..120000（毫秒）、--json/-j、--help/-h`;
  }
  return `见微 · 知乎只读 CLI

用法：pnpm zhihu -- <命令> [参数]

命令：
  status         检查开放平台凭据与本地登录态，不打印秘密
  search         站内搜索；支持类型、排序、关注、话题、作者、问题、时间组合
  hot / top      当前热榜（top 是别名）
  answers        按问题 id 或 URL 取回答，支持真实 offset/cursor/page
  read           读取文章或回答正文
  comments       读取评论
  follow-check   检查作者是否在我的关注列表
  save           正文、评论和元信息保存到本地 Inbox

示例：
  pnpm zhihu -- search "AI Agent" --type article --sort votes --min-votes 100
  pnpm zhihu -- search "大模型" --tag 机器学习 --follow only --json
  pnpm zhihu -- answers 123456 --page 2 --limit 20 --sort comments
  pnpm zhihu -- hot --limit 10
  pnpm zhihu -- read "https://zhuanlan.zhihu.com/p/123" --meta-only

列表通用参数：
  --type article,answer,question,pin,all
  --sort relevance|votes|comments|time
  --follow any|only|exclude
  --tag/--topic <话题>       把话题加入官方搜索词，可重复
  --require-tag <话题>      对返回的标签元数据做精确过滤，可重复
  --tag-mode all|any
  --author <作者>  --question <id|URL>  --query <页内关键词>
  --from YYYY-MM-DD  --to YYYY-MM-DD  --min-votes N

通用参数：
  --limit N  --timeout 1000..120000（毫秒）  --json/-j  --help/-h

退出码：0 成功；2 参数错误；3 缺凭据/登录态；4 网络或超时；5 平台拒绝；6 本地运行失败。
所有命令支持 --json；Cookie、Access Secret 与完整本地路径不会进入输出。`;
}
