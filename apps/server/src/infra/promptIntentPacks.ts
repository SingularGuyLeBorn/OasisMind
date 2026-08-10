/**
 * Prompt 意图包（运行时瘦注入）
 *
 * 与 packages/shared packs（部署级可选依赖）正交：这里只决定本轮 system 塞哪些 TOOL_GUIDE。
 * 叶子模块：无 prisma / 无环。
 */

export type PromptIntentPack =
  | "web"
  | "garden"
  | "swarm"
  | "qq"
  | "math"
  | "session"
  | "skills"
  | "goal"
  | "soft_delete"
  | "algo_viz"
  | "pinme"
  | "tool_offload";

const WEB_RE =
  /搜索|搜一下|网页|链接|http|知乎|微信|小红书|抖音|bilibili|b站|收藏夹|arxiv|huggingface|爬虫|抓取|读文章|截图|登录|cookie|浏览器/i;
/** 写库/蒸馏意图；勿用裸「文章」（「搜一篇文章」会误灌花园+数学范文） */
const GARDEN_RE =
  /写文章|写篇|知识库|花园|wiki\s*链|\[\[|落库|成文|面经|蒸馏|笔记写成|post_create|post_update|邻居文章|数字花园/i;
const SWARM_RE =
  /子\s*agent|派生子|spawn|并行|编排|workspace|工作区|委托|分派|多代理|swarm/i;
const QQ_RE = /qq|QQ|群聊|私聊|openid|发消息给/i;
const MATH_RE =
  /公式|推导|katex|latex|注意力|softmax|梯度|矩阵|证明|数学|√|\\frac|\$\$/i;
const SESSION_RE = /压缩|compact|历史消息|召回|上下文太长|session_search/i;
const SKILLS_RE = /skill|技能|工作流复用|程序记忆/i;
const GOAL_RE = /\/goal|standing\s*goal|跨轮|长期目标|持续推进/i;
const SOFT_DEL_RE = /删除|回收站|软删|trash|粉碎/i;
const ALGO_RE = /算法动画|algo.?viz|remotion|可视化动画/i;
const PINME_RE = /pinme|公网链接|部署.*html|可分享/i;

function toolBase(name: string): string {
  return name.replace(/^native:/, "");
}

function hasTool(tools: string[], ...names: string[]): boolean {
  const set = new Set(tools.map(toolBase));
  return names.some((n) => set.has(n));
}

/**
 * 从用户话 + 近期工具名推断意图包，再与 Agent 授权工具取交。
 * tool_offload：只要有任意 native 工具就注入（短铁律）。
 */
export function detectPromptIntentPacks(opts: {
  userText: string;
  tools: string[];
  recentToolNames?: string[];
}): Set<PromptIntentPack> {
  const text = opts.userText || "";
  const recent = (opts.recentToolNames ?? []).map(toolBase).join(" ");
  const blob = `${text}\n${recent}`;
  const packs = new Set<PromptIntentPack>();

  if (opts.tools.length > 0) packs.add("tool_offload");

  const want = (re: RegExp) => re.test(blob);

  if (
    want(WEB_RE) &&
    hasTool(
      opts.tools,
      "web_search",
      "read_article",
      "scrape_web_page",
      "browser_screenshot",
      "read_image",
      "search_arxiv",
      "search_huggingface",
      "download_file",
      "save_webpage",
      "platform_login",
    )
  ) {
    packs.add("web");
  }
  if (
    want(GARDEN_RE) &&
    hasTool(opts.tools, "post_create", "post_update", "post_list", "post_neighbors", "garden_list", "garden_create")
  ) {
    packs.add("garden");
  }
  if (
    want(SWARM_RE) &&
    hasTool(
      opts.tools,
      "spawn_subagent",
      "agent_create",
      "agent_inspect",
      "agent_send_message",
      "workspace_create",
    )
  ) {
    packs.add("swarm");
  }
  if (
    want(QQ_RE) &&
    hasTool(opts.tools, "send_qq_text", "send_qq_image", "send_qq_file", "send_qq_voice")
  ) {
    packs.add("qq");
  }
  // 数学范文很肥：仅显式公式意图，或已判定 garden（写库）时附带
  if (want(MATH_RE) || packs.has("garden")) {
    packs.add("math");
  }
  if (want(SESSION_RE) && hasTool(opts.tools, "session_search", "session_message_get", "session_compact")) {
    packs.add("session");
  }
  if (want(SKILLS_RE) && hasTool(opts.tools, "skills_list", "skill_view", "skill_manage")) {
    packs.add("skills");
  }
  if (want(GOAL_RE) && hasTool(opts.tools, "session_goal_set", "session_goal_status", "session_goal_clear")) {
    packs.add("goal");
  }
  if (
    want(SOFT_DEL_RE) &&
    hasTool(opts.tools, "file_delete", "directory_delete", "trash_list", "post_delete", "garden_delete")
  ) {
    packs.add("soft_delete");
  }
  if (want(ALGO_RE) && hasTool(opts.tools, "algo_viz_create", "algo_viz_list")) {
    packs.add("algo_viz");
  }
  if (want(PINME_RE) && hasTool(opts.tools, "pinme_upload")) {
    packs.add("pinme");
  }

  // 短问兜底：无任何领域包时，按授权补一个最可能用到的（避免模型完全无指南）
  const domain = ["web", "garden", "swarm", "qq", "session", "skills", "goal", "algo_viz", "pinme"] as const;
  if (![...domain].some((p) => packs.has(p))) {
    if (hasTool(opts.tools, "web_search", "read_article")) packs.add("web");
    else if (hasTool(opts.tools, "post_list", "post_create")) packs.add("garden");
    else if (hasTool(opts.tools, "spawn_subagent")) packs.add("swarm");
  }

  return packs;
}

/** 花园包短指引（替代把整站 web 指南塞进写文任务） */
export const GARDEN_TOOL_GUIDE = `## 数字花园工具
- post_list / post_neighbors：先列元信息与 wiki 邻居，再决定读哪篇；邻居优先 [[wiki]] 出链。
- post_create / post_update：写文章走 Service（content/{garden}/{slug}.md）；禁止 write_file 直写 content/posts。
- garden_*：建/列/改/软删花园；删除可恢复。
- 记忆：稳定事实用 memory_create（填 source / 矛盾时 conflictsWith）；本会话细节用 session_search。
- 公式必须 $…$ / $$…$$（见数学铁律，若已注入）。`;

export const SWARM_TOOL_GUIDE = `## Swarm 编排要点
- spawn_subagent：派生子任务；waitForResult=false 时结果经异步队列投递，勿轮询全文。
- agent_inspect：只看状态/会话元信息，**不返回**子会话消息内容。
- agent_send_message / agent_report_back：过程通知 vs 最终交付，勿混用。
- 父会话看不到子全文；进度看系统推送的 phase/工具名。`;
