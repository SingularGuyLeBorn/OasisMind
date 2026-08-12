/**
 * Prompt 构建 — 从 agentRuntime 抽出的叶子模块。
 *
 * 职责：纯字符串 / 记忆片段构建（buildMemoryContext、buildTierIdentityHint、buildAgentToolGuide、
 * buildSystemPromptSkeleton）。注入编排（何时拼进 system prompt）已迁至 contextHooks 内建钩子。
 * 不依赖 loop/reactLoop/agentTools/nativeTools。
 */

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { ServiceContainer } from "./serviceContainer.js";
import type { AppConfig } from "./config.js";
import {
  MEMORY_INJECTABLE_TYPES,
  MEMORY_TYPES,
  memoryAgentScope,
  memoryWorkspaceScope,
  MEMORY_SCOPE_GLOBAL,
  PERSONA_HINT_MAX_CHARS,
} from "@knowpilot/shared";
import { createMemoryRepository } from "./memoryRepository.js";
import {
  recordMemoryRetrieveOutcome,
  shouldSkipMemoryRetrieve,
} from "./memoryRetrieveGate.js";
import { rewriteMemoryQuery } from "./memoryQueryRewrite.js";
import { ensurePinnedMemoryHint } from "./pinnedMemory.js";
import { buildGardenNeighborHint } from "./gardenNeighbors.js";
import {
  GARDEN_TOOL_GUIDE,
  SWARM_TOOL_GUIDE,
  type PromptIntentPack,
} from "./promptIntentPacks.js";

/** 从 config/prompts 加载面经 Markdown 范文（公式写法 few-shot） */
function loadMathMarkdownExample(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "../../../config/prompts/math-markdown-example.md"),
    path.resolve(process.cwd(), "config/prompts/math-markdown-example.md"),
    path.resolve(process.cwd(), "../../config/prompts/math-markdown-example.md"),
  ];
  for (const p of candidates) {
    try {
      const body = readFileSync(p, "utf-8").trim();
      if (body) return body;
    } catch {
      // try next
    }
  }
  return "";
}

const MATH_MARKDOWN_EXAMPLE = loadMathMarkdownExample();

/**
 * 构建注入 system prompt 的长期记忆片段。
 * W5：统一走 MemoryRepository（FTS 优先 / LIKE 回退；BM25×(1+strength)×recency 排序）；
 * W5-followup：三层 scope 读路径——global + workspace:{wid}（Agent 有 Workspace 时）+ agent:{aid}；
 * 门控：连续无命中后跳过若干轮检索（综述① retrieve-or-not）。
 */
export async function buildMemoryContext(
  services: ServiceContainer,
  userText: string,
  options?: { agentId?: string | null; config?: AppConfig; retrievedIds?: string[] },
): Promise<string> {
  let keyword = userText.slice(0, 80).trim();
  if (!keyword) return "";
  const gateKey = options?.agentId ?? "__global__";
  if (shouldSkipMemoryRetrieve(gateKey)) {
    return "";
  }
  // 门控放行后才做 LLM 改写；config 未传或改写失败时保持 keyword 原值（回退语义）
  if (options?.config) {
    keyword = await rewriteMemoryQuery(options.config, userText);
  }
  const scopes = [MEMORY_SCOPE_GLOBAL];
  if (options?.agentId) {
    const agent = await services.prisma.agent.findUnique({
      where: { id: options.agentId },
      select: { workspaceId: true },
    });
    if (agent?.workspaceId) scopes.push(memoryWorkspaceScope(agent.workspaceId));
    scopes.push(memoryAgentScope(options.agentId));
  }
  const repo = createMemoryRepository(services);
  const memories = await repo.read({
    keyword,
    // persona 由 buildPersonaHint 独立注入（buildAllMemoryHints 顶部），动态检索排除避免重复
    types: MEMORY_INJECTABLE_TYPES.filter((t) => t !== MEMORY_TYPES.PERSONA),
    scopes,
    limit: 5,
  });
  recordMemoryRetrieveOutcome(gateKey, memories.length > 0);
  if (!memories.length) return "";

  // S6 轻量：同 content 去重（保留强度更高/更新的一条已在 repo 排序）
  const seen = new Set<string>();
  const unique = memories.filter((m) => {
    const key = m.content.trim().toLowerCase().slice(0, 120);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const now = Date.now();
  const retrievedIds = new Set(unique.map((m) => m.id));
  if (options?.retrievedIds) {
    for (const id of retrievedIds) options.retrievedIds.push(id);
  }
  const conflictPeers = unique.flatMap((m) =>
    (m.conflictsWith ?? []).filter((id) => id && !retrievedIds.has(id)),
  );
  // 冲突对端若未进 Top-K，补拉一行摘要用于警告（不计入主列表预算外扩太多）
  let peerById = new Map<string, { content: string }>();
  if (conflictPeers.length > 0) {
    const peers = await repo.read({
      ids: [...new Set(conflictPeers)].slice(0, 5),
      scopes,
      types: [...MEMORY_INJECTABLE_TYPES],
      limit: 5,
    });
    peerById = new Map(peers.map((p) => [p.id, { content: p.content }]));
  }

  const lines = unique.map((m) => {
    const attr = m.attribution && m.attribution !== "agent" ? `/${m.attribution}` : "";
    const src = m.source ? ` source=${m.source}` : "";
    const ageMs = m.updatedAt ? now - new Date(m.updatedAt).getTime() : 0;
    const stale =
      Number.isFinite(ageMs) && ageMs > 24 * 60 * 60 * 1000
        ? "（可能过时，需验证）"
        : "";
    const conflictIds = m.conflictsWith ?? [];
    const conflictHit = conflictIds.filter((id) => retrievedIds.has(id));
    const conflictWarn =
      conflictIds.length > 0
        ? ` ⚠冲突[${conflictIds
            .slice(0, 3)
            .map((id) => {
              if (conflictHit.includes(id)) return id.slice(0, 8);
              const peer = peerById.get(id);
              return peer ? `${id.slice(0, 8)}:${peer.content.slice(0, 40)}` : id.slice(0, 8);
            })
            .join("; ")}]`
        : "";
    return `- [${m.type}${attr}${src}] ${m.content.slice(0, 300)}${stale}${conflictWarn}`;
  });
  return `\n\n## 相关长期记忆\n${lines.join("\n")}`;
}

/**
 * L1 常驻层（冻结）+ 动态 FTS 记忆（按轮检索）。
 * sessionId 有值时 USER/AGENT 快照会话内不变；动态层仍按 userText 检索。
 */
/**
 * L3 画像注入块（TencentDB 分层记忆：L2/L3 快速启动上下文，需要细节再下钻 L1/L0）。
 * 读 global scope 的 active persona 记忆（蒸馏管线产出），无画像时返回空串。
 */
export async function buildPersonaHint(services: ServiceContainer): Promise<string> {
  try {
    const repo = createMemoryRepository(services);
    const rows = await repo.read({
      types: [MEMORY_TYPES.PERSONA],
      scopes: [MEMORY_SCOPE_GLOBAL],
      limit: 1,
    });
    const persona = rows[0];
    if (!persona) return "";
    const content =
      persona.content.length > PERSONA_HINT_MAX_CHARS
        ? `${persona.content.slice(0, PERSONA_HINT_MAX_CHARS)}…`
        : persona.content;
    return `\n\n## 用户画像（长期）\n${content}`;
  } catch {
    return "";
  }
}

export async function buildAllMemoryHints(
  services: ServiceContainer,
  userText: string,
  options?: { agentId?: string | null; sessionId?: string | null; config?: AppConfig; retrievedIds?: string[] },
): Promise<string> {
  const persona = await buildPersonaHint(services);
  const pinned = await ensurePinnedMemoryHint(services, options?.sessionId);
  const dynamic = await buildMemoryContext(services, userText, {
    agentId: options?.agentId,
    config: options?.config,
    retrievedIds: options?.retrievedIds,
  });
  const neighbors = await buildGardenNeighborHint(services.prisma, userText).catch(() => "");
  return persona + pinned + dynamic + neighbors;
}

const WEB_TOOL_GUIDE = `## 网络工具用法
- 搜：\`web_search\`；学术 \`search_arxiv\`/\`fetch_arxiv\`；HF \`search_huggingface\` 等。勿硬爬 arxiv.org。
- 读公开页：\`read_article\`（长文 offset 翻页）；失败/SPA → \`scrape_web_page\`；落盘反复读 → \`save_webpage\`；下文件 → \`download_file\`。
- 登录墙 / 已在 Chrome 打开的页：优先 \`dokobot_read\`/\`dokobot_search\`（本机扩展）；否则 \`browser_login_status\`/\`platform_doctor\` → \`platform_login\` → \`read_article\`。禁止截图查登录态、禁止让用户 F12 抄 cookie。
- 真实浏览器操作（点选/填表/多标签）：\`webbridge_status\` → 未起则 \`webbridge_start\` → \`webbridge_command\`（同任务固定 session；navigate → snapshot 取 @e → click/fill）。只需读正文用 dokobot，勿为阅读开 WebBridge。
- 图：\`browser_screenshot\` → \`read_image\`；语义理解用 \`vision_describe\`。正文够用勿对每张图 vision。
- 流程：search → read → 必要时 scrape/dokobot/webbridge/读图。`;

const PINME_TOOL_GUIDE = `## 公网部署（PinMe）
用户要「写个小工具/HTML 小游戏并给公网链接」时：
1. 用 write_file 写到当前 Workspace（如 \`demo/index.html\`），或对话里直接 \`\`\`html\`\`\` 预览（仅预览不部署）。
2. 需要可分享链接时调用 **pinme_upload**（path 指向含 index.html 的目录；省略则自动找 dist/build/out/public）。
3. 把返回的 url 发给用户。不要用 run_shell 调 pinme（密钥会被 shell 沙箱剥掉）。需配置 PINME_APPKEY。`;

const QQ_TOOL_GUIDE = `## QQ 官方 Bot
- **正式回复由你发**：\`send_qq_text\` / \`send_qq_image\`，\`kind=answer\`（默认）。系统兜底不艾特。
- **艾特要克制**：\`at\`/\`quote\` 默认 false。\`at:true\` 艾特对端；艾特别人用 \`atOpenIds\`（填消息里的 openid）。进度/寒暄少艾特；要引用条才 \`quote:true\`（群约5分钟内）。
- **兜底**：整轮结束若你还没把终稿正文用工具发出去，系统会抓取终稿自动回发（无艾特）。中间只发过进度 → 仍兜底。
- **群被动窗≈5分钟**：长任务必须先 \`send_qq_text({ kind:"progress", text:"…" })\` 丢 1～3 条极短进度（勿刷屏）；能拆就拆短、先交一小步请主人再 @，避免闷头超时导致终稿发不回群。
- 绑定会话省略目标；目标=openid。QQ 不渲染 Markdown；大图 <1.5MB。`;

const SESSION_HISTORY_GUIDE = `## 会话压缩与历史召回
- session_compact 只缩小**模型视野**（摘要 + 边界后消息），**不删除** ChatMessage；UI 历史仍在。
- 压缩后摘要丢细节 ≠ 数据丢失。用 **session_search(keyword)** 在本会话原文检索；命中 inLlmContext=false 再用 **session_message_get(messageId)** 拉片段。
- session_message_get(beforeCompact=true) 可浏览压缩前最近若干条。禁止用 run_shell/grep 扫会话库。
- 跨会话长期事实用 memory_*；本会话细节用 session_search。`;

const TOOL_RESULT_ATTENTION_GUIDE = `## 工具结果落盘（铁律）
结果写入 \`data/tool-results/{session}/{callId}.*\`。超阈值时上下文只有 metadata+path，用 \`recommendedRead\`/\`hitOffsets\` 再 \`read_file\` 取原文。
长文工具可带 \`expect_keywords\`（3–8）。历史用 \`tool_results_list\` / \`tool_result_meta\`。禁止未读 path 假装已知全文。
**分段读纪律（RLM）**：超长材料一律 path+offset 变量化分段读，勿整文件灌窗——\`read_file\`/\`read_article\` 返回 \`nextOffset\` 时直接翻页直到 \`truncated=false\`；看到 [TRUNCATED] 标记时禁止基于残缺内容下结论。`;

/** Hermes SKILLS_GUIDANCE：程序记忆 vs Memory（陈述事实） */
export const SKILLS_GUIDANCE = `## Skill 程序记忆（Hermes + DeerFlow 渐进加载）
After completing a complex task (约 5+ tool calls)、攻克棘手错误、或发现可复用工作流，用 skill_manage 保存为 Skill，下次复用。
使用 Skill 时若发现过时/缺步/错误，立刻 skill_manage(action='patch')，不要等被要求。
**渐进加载（铁律）**：默认只 skills_list 看短描述；需要时再 skill_view 读全文/references——禁止一上来把多个 Skill 全文灌进上下文。
procedural Skill 不会出现在 skill__* 工具列表里。create/write_file 会跑 SkillScan（拦私钥/child_process/eval 等）。
Memory 记「用户是谁/偏好」；Skill 记「这类任务怎么做」。禁止把一次性任务名（PR 号、今日 debug）当成 skill name。`;

/** Harness：Prime 回滚 ID · autoresearch keep/discard · DGM 归档分支 */
export const EXPERIMENT_LEDGER_GUIDE = `## Harness 实验账本（铁律）
改 Skill / Memory / prompt note：\`experiment_begin\` / \`harness_refine\`（须证据）→ \`harness_gate_run\` → \`experiment_decide\`。
**禁止自报 lintOk**；keep 须 \`verified:true\`。keep 前系统会自动跑 harness-bench（mock 模式），退化即拒 keep。
已 keep 可 \`experiment_rollback(id)\`；discard/keep 后归档可 \`experiment_branch(parentId, from=candidate|baseline)\` 再探索。
**禁止**改 \`apps/server\` runtime（DGM 只学归档分支，不学裸自改代码）。
\`mode=autonomous\`：触顶=exhausted≠成功；完成前 \`autonomous_gate(gatePreset)\`。`;

const GOAL_TOOL_GUIDE = `## Standing Goal（跨轮外环）
用户**不必**输入 /goal。当你判断任务需要多轮推进（修测试、完成交付物、深度调研、明确可验收目标）时，主动调用 \`session_goal_set\`。
- 短问短答、一次性查询：**不要**设 goal。
- \`todo_write\` = 本轮步骤清单；\`session_goal_set\` = 跨轮外环（回合结束后系统裁判续跑）。
- 查进度用 \`session_goal_status\`；完成/放弃用 \`session_goal_clear\`；暂停/恢复用 pause/resume。
- 设立后本轮直接推进目标，勿再要求用户手动 /goal。
- 父派子：可用 \`spawn_subagent({ goal: true, … })\` 或 \`agent_send_message\` 内容以 \`/goal …\` 开头，子会话会自动设立 goal 外环（\`deep_research\` 仍仅限独立 chat）。`;

const ALGO_VIZ_TOOL_GUIDE = `## 算法动画（algo-viz）铁律
- 创建/更新动画**唯一**工具：\`algo_viz_create\`（直接写入 apps/algo-viz 并自动注册）。\`algo_viz_list\` 查已有 id。
- **禁止** \`write_file\` 写 \`apps/algo-viz/**\` 或把 \`.tsx\` 丢进 \`content/uploads/viz/\`。
- **禁止**让用户跑 \`cp\` / \`deploy-*.sh\` / \`bash\` 部署脚本；**禁止**声称「sandbox 写不了 apps/algo-viz」。
- 交片后用 \`post_update\` 插入 \`\`\`viz composition: {Id}\`\`\`；缺工具时如实报告，不要发明旁路。`;

const SOFT_DELETE_GUIDE = `## 删除铁律（系统强制软删）
- **你可以删除**：文章用 \`post_delete\`，花园用 \`garden_delete\`，工作区文件/目录用 \`file_delete\` / \`directory_delete\`。
- **一律软删进回收站**（可恢复）：返回 \`trashPath\` / 花园 .trash；用 \`trash_list\` / \`trash_restore\` 恢复；文章另有回收站 UI。
- **禁止**用 \`run_shell\` 的 rm/del/Remove-Item 等硬删（系统会拒绝）。
- **禁止**声称「没有删除工具」——缺的是硬删，不是软删。`;

const MATH_MARKDOWN_GUIDE = `## 数学公式铁律（只认 $…$ / $$…$$）
公式必须 LaTeX 定界；禁止 Unicode 伪公式（\`√d_k\`、\`dₖ\`、\`Q·Kᵀ\`、\`Σ\`）。反斜杠写单个 \`\\\`（如 \`\\sqrt\`）。
- 行内：\`$\\sqrt{d_k}$\` \`$d_k$\` \`$K^{T}$\` \`$\\frac{a}{b}$\` \`$\\sum_i x_i$\`
- 块级：单独成行的 \`$$…$$\`
落盘前若文中用 \`√/ₖ/ᵀ/·/Σ/≈/∈\` 当公式 → 改成 $ 定界。范文见下节。`;

/** 根据 Agent 已授权工具追加使用指引；packs 省略/"all"=旧行为全量（测试/兼容） */
export function buildAgentToolGuide(
  tools: string[],
  packs: Iterable<PromptIntentPack> | "all" = "all",
): string {
  const has = (name: string) => tools.some((t) => t === `native:${name}` || t === name);
  const allow =
    packs === "all"
      ? null
      : new Set<PromptIntentPack>(packs);
  const want = (p: PromptIntentPack) => allow === null || allow.has(p);
  /** 新包仅意图模式注入，避免 "all" 破坏等价性 fixture */
  const intentOnly = (p: PromptIntentPack) => allow !== null && allow.has(p);

  const parts: string[] = [];
  // "all" 必须保持历史顺序：math → 落盘铁律 → 范文 → web…（等价性 fixture）
  if (allow === null) {
    parts.push(MATH_MARKDOWN_GUIDE);
    parts.push(TOOL_RESULT_ATTENTION_GUIDE);
    if (MATH_MARKDOWN_EXAMPLE) {
      parts.push(`## 完整 Markdown 范文（照抄格式）\n${MATH_MARKDOWN_EXAMPLE}`);
    }
  } else {
    if (want("tool_offload")) parts.push(TOOL_RESULT_ATTENTION_GUIDE);
    if (want("math")) {
      parts.push(MATH_MARKDOWN_GUIDE);
      if (MATH_MARKDOWN_EXAMPLE) {
        parts.push(`## 完整 Markdown 范文（照抄格式）\n${MATH_MARKDOWN_EXAMPLE}`);
      }
    }
  }
  if (
    want("web") &&
    (has("web_search") ||
      has("read_article") ||
      has("dokobot_read") ||
      has("dokobot_search") ||
      has("webbridge_command") ||
      has("webbridge_status") ||
      has("scrape_web_page") ||
      has("download_file") ||
      has("save_webpage") ||
      has("browser_screenshot") ||
      has("read_image") ||
      has("search_arxiv") ||
      has("search_huggingface") ||
      has("fetch_huggingface_trending"))
  ) {
    parts.push(WEB_TOOL_GUIDE);
  }
  if (
    intentOnly("garden") &&
    (has("post_list") ||
      has("post_neighbors") ||
      has("post_create") ||
      has("post_update") ||
      has("garden_list") ||
      has("garden_create"))
  ) {
    parts.push(GARDEN_TOOL_GUIDE);
  }
  if (
    intentOnly("swarm") &&
    (has("spawn_subagent") || has("agent_inspect") || has("agent_send_message") || has("agent_create"))
  ) {
    parts.push(SWARM_TOOL_GUIDE);
  }
  if (want("algo_viz") && (has("algo_viz_create") || has("algo_viz_list"))) {
    parts.push(ALGO_VIZ_TOOL_GUIDE);
  }
  if (want("pinme") && has("pinme_upload")) {
    parts.push(PINME_TOOL_GUIDE);
  }
  if (
    want("qq") &&
    (has("send_qq_text") ||
      has("send_qq_image") ||
      has("send_qq_video") ||
      has("send_qq_file") ||
      has("send_qq_voice") ||
      has("delete_qq_message"))
  ) {
    parts.push(QQ_TOOL_GUIDE);
  }
  if (
    want("session") &&
    (has("session_search") || has("session_message_get") || has("session_compact"))
  ) {
    parts.push(SESSION_HISTORY_GUIDE);
  }
  if (want("skills") && (has("skills_list") || has("skill_view") || has("skill_manage"))) {
    parts.push(SKILLS_GUIDANCE);
  }
  if (
    want("skills") &&
    (has("experiment_begin") ||
      has("experiment_decide") ||
      has("experiment_list") ||
      has("harness_refine") ||
      has("harness_gate_run") ||
      has("autonomous_gate"))
  ) {
    parts.push(EXPERIMENT_LEDGER_GUIDE);
  }
  if (
    want("goal") &&
    (has("session_goal_set") || has("session_goal_status") || has("session_goal_clear"))
  ) {
    parts.push(GOAL_TOOL_GUIDE);
  }
  if (
    want("soft_delete") &&
    (has("file_delete") ||
      has("directory_delete") ||
      has("trash_list") ||
      has("trash_restore") ||
      has("post_delete") ||
      has("garden_delete"))
  ) {
    parts.push(SOFT_DELETE_GUIDE);
  }
  return parts.join("\n\n");
}

/** 按层级注入身份约束，防止子 Agent 误认自己是超级/管理 Agent；强化子 Agent 隔离铁律 */
export function buildTierIdentityHint(tier?: string | null, name?: string | null): string {
  if (tier === "sub") {
    const who = name ? `「${name}」` : "";
    return `\n\n## 你的身份（硬约束）
你是子 Agent${who}，**不是**超级 Agent，也**不是**管理 Agent。OasisMind 是「以 Markdown 为原子、AI 为引擎的数字花园」，你是被派去完成某项具体工作的园丁：接到任务独立执行，完成后把结果交回去。
- 只执行上级下发的当前任务；**完成后必须调用 agent_report_back** 向上级交付正式结果（进父会话异步结果队列，父 Agent 据此继续）。
- **agent_report_back vs agent_notify_parent（勿混用）**：
  - \`agent_report_back\` = 任务最终结果（完成/失败），正式交付，父 Agent 据此继续。
  - \`agent_notify_parent\` = 过程通知（进度、卡点、催问），进父会话待发消息队列，**不是**任务结果。
  - 禁止用 notify_parent 代替 report_back 交最终结果；过程中可先 notify，结束时仍要 report_back。
- 异步任务（如 sleep async）到期后续跑时，仍应继续完成任务并 agent_report_back，不要把续跑当成「用户闲聊」。
- 用户在本会话直接发消息时，也可酌情 report_back（补充汇报），但请在内容中说明这是补充。
- **子 Agent 隔离铁律**：你的结果唯一交付通道 = agent_report_back。你**看不到**父 Agent / 同级 Agent 的会话内容，也**不要**试图读取——父 Agent 只能看你的状态，你的结果只能经 report_back 投递。
- 禁止创建/派生子 Agent 或管理其他 Agent（不得使用 spawn_subagent、agent_create、agent_create_sub 等）。
- 禁止创建或归档 Workspace；不要自称超级 Agent / 管理 Agent。
- 可用 sleep / 读写 / 搜索等执行类工具完成任务本身。`;
  }
  if (tier === "manager") {
    const who = name ? `「${name}」` : "";
    return `\n\n## 你的身份
你是管理 Agent${who}，本 Workspace 的负责人（园丁长）。OasisMind 是「以 Markdown 为原子、AI 为引擎的数字花园」，你负责本空间内子 Agent 的编排、向上汇报、维护本空间长期秩序。
- 可在本 Workspace 创建/派生子 Agent；不可跨 Workspace，也不可创建 Workspace。
- **子 Agent 隔离铁律**：你只能看子 Agent 的**状态**（agent_inspect 返回 id/tier/status/会话元信息），**看不到子 Agent 的消息内容**——子 Agent 的结果只能经 agent_report_back 投递到你的会话异步结果队列，不要试图读取子会话消息。
- 编排优先：能派子 Agent 做的，不要自己一头扎进去。
- 向上级（超级 Agent）汇报用 agent_report_back；过程通知用 agent_notify_parent。
- 不要自称超级 Agent。`;
  }
  if (tier === "super") {
    const who = name ? `「${name}」` : "";
    return `\n\n## 你的身份
你是超级 Agent${who}，Root Workspace 的总园丁。OasisMind 是「以 Markdown 为原子、AI 为引擎的数字花园」，你统筹全局、协调各 Workspace、维护长期秩序，但不替每个子 Agent 干活。
- 可跨 Workspace 管理；创建子 Agent 时应指定目标 Workspace（默认落在当前上下文 Workspace）。
- **子 Agent 隔离铁律**：你只能看子 Agent / 管理 Agent 的**状态**（agent_inspect 返回 id/tier/status/会话元信息），**看不到他们的消息内容**——结果只能经 agent_report_back 投递，不要试图读取子会话消息。
- 编排优先，亲自执行其次：能派子 Agent / 管理 Agent 做的，不要自己一头扎进去。`;
  }
  return "";
}

/**
 * System prompt 骨架（纯字符串）：缺省回退文案。
 * 记忆 / tier 身份 / 工具引导 / extras 由 contextHooks 内建钩子在 LLM 调用前注入。
 */
export function buildSystemPromptSkeleton(basePrompt: string): string {
  return basePrompt || "你是 OasisMind 助手。";
}
