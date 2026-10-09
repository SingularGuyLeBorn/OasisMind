/** 见微 3D 办公室 · 量化级 AI 工位内容 */

export type OfficeHotspotId =
  | "monitor"
  | "binder"
  | "board"
  | "map"
  | "plant"
  | "dog"
  | "phone"
  | "calendar"
  | "lamp"
  | "server"
  | "bookshelf"
  | "chalkboard"
  | "papers";

export type OverlayKind =
  | "projects"
  | "about"
  | "knowledge"
  | "journey"
  | "garden"
  | "agents"
  | "fun"
  | "mood"
  | "server"
  | "bookshelf"
  | "architecture"
  | "formulas";

export interface OfficeProject {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  meta: string;
  href: string;
  cta: string;
}

/** 多屏墙各屏标题（量化终端感） */
export const MONITOR_WALL = [
  { id: "chat", label: "CHAT SSE", color: "#22D3EE", href: "/chat" },
  { id: "swarm", label: "SWARM", color: "#34D399", href: "/agents" },
  { id: "garden", label: "GARDEN", color: "#FBBF24", href: "/gardens" },
  { id: "fts", label: "FTS5", color: "#60A5FA", href: "/search" },
  { id: "runs", label: "RUNS", color: "#A78BFA", href: "/runs" },
  { id: "hitl", label: "HITL", color: "#F472B6", href: "/approvals" },
  { id: "mem", label: "MEMORY", color: "#38BDF8", href: "/memories" },
  { id: "cron", label: "CRON", color: "#FB923C", href: "/cron" },
] as const;

export const MONITOR_APPS = [
  { id: "chat", label: "Chat", color: "#EF4444", href: "/chat" },
  { id: "gardens", label: "Garden", color: "#F59E0B", href: "/gardens" },
  { id: "agents", label: "Swarm", color: "#10B981", href: "/agents" },
  { id: "skills", label: "Skills", color: "#14B8A6", href: "/skills" },
  { id: "memories", label: "Memory", color: "#0087EB", href: "/memories" },
  { id: "approvals", label: "HITL", color: "#8B5CF6", href: "/approvals" },
  { id: "search", label: "FTS", color: "#0EA5E9", href: "/search" },
  { id: "runs", label: "Runs", color: "#64748B", href: "/runs" },
] as const;

/** 整齐知识库板：花园条目 */
export const KNOWLEDGE_BOARD = [
  { id: "posts", title: "博客花园", meta: "公开长文 · 主展厅" },
  { id: "RecursiveSelfImprovement", title: "递归自我改进", meta: "模型 · 脚手架 · 改进器" },
  { id: "resources", title: "资源库", meta: "素材索引 · 清单" },
  { id: "LargeLanguageModelGuide", title: "LLM 指南", meta: "体系化入门" },
  { id: "LargeLanguageModelInterview", title: "大模型面试", meta: "原理与实践问题" },
  { id: "daily-fragments", title: "每日碎片", meta: "随记沉淀" },
] as const;

export type OfficeFormulaCard = {
  id: string;
  title: string;
  tint: string;
  /** Markdown：$$ 块级公式 + 列表说明 + 可选配图 */
  markdown: string;
};

/** Transformer / LLM 架构板 */
export const ARCHITECTURE_BOARD = {
  title: "Transformer Architecture",
  subtitle: "Attention Is All You Need → LLM Stack",
  /** 黑板右侧 / 弹层正文（Markdown + KaTeX） */
  markdown: `
### Decoder-only 的计算顺序

这里采用加性位置编码、Pre-Norm 与 GELU FFN 的示例结构. 注意力只读取当前及此前的位置.

1. **Embed**：$x_0 = E[\\mathrm{token}] + P_{\\mathrm{pos}}$
2. **Attn**：由归一化后的输入投影得到 $Q,K,V$, $A = \\mathrm{softmax}(QK^{\\top}/\\sqrt{d_k}+M),\\; H = AV$. 因果掩码 $M$ 在未来位置为 $-\\infty$, 其余为 $0$.
3. **Resid**：$x' = x + \\mathrm{MultiHead}(\\mathrm{LN}(x))$
4. **FFN**：$z = \\mathrm{GELU}(\\mathrm{LN}(x')W_1)W_2,\\; y = x' + z$
5. **Head**：最终归一化后, $p_t = \\mathrm{softmax}(\\mathrm{LN}(y_{L,t}) W_{\\mathrm{out}}),\\; \\mathcal{L}=-\\sum_t \\log p_t[\\mathrm{token}_{t+1}]$. $p_t$ 是位置 $t$ 对下一个 token 的类别概率.

$$
\\mathrm{Attn}(Q,K,V)=\\mathrm{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}+M\\right)V
$$
`.trim(),
  blocks: [
    { label: "Token Embed + Pos", detail: "$x = Ew + P$" },
    { label: "Multi-Head Attn", detail: "$\\mathrm{softmax}(QK^{\\top}/\\sqrt{d})V$" },
    { label: "FFN", detail: "$\\mathrm{GELU}(\\mathrm{LN}(x')W_1)W_2$" },
    { label: "LayerNorm + Residual", detail: "$x + \\mathrm{Sublayer}(\\mathrm{LN}(x))$" },
    { label: "LM Head", detail: "$\\mathrm{softmax}(h W_{\\mathrm{out}})$" },
  ],
  stack: ["Embedding", "N × Decoder Block", "LayerNorm", "Vocab Projection"],
};

/**
 * 多屏墙内容（带鱼屏）——产品 / 花园 / 系统 / 公式混排，禁止整墙同一主题。
 * 桌面便签另见 DESK_STICKY_NOTES，二者不得同源复制。
 */
export const MONITOR_FORMULA_CARDS: OfficeFormulaCard[] = [
  {
    id: "ops",
    title: "见微 · 工作入口",
    tint: "#0087EB",
    markdown: `
### 工作入口

| 通道 | 用途 |
|---|---|
| Chat | 与 Agent 对话 |
| Swarm | 管理 Agent 协作 |
| Cron | 查看定时任务 |
| HITL | 处理审批 |

- 推拉结合 · 刷新不丢
- 本地 Markdown 为真相源
`.trim(),
  },
  {
    id: "garden",
    title: "花园 · 知识组织",
    tint: "#059669",
    markdown: `
### Gardens

1. **博客** — 公开长文主展厅
2. **知识库** — 蒸馏笔记可检索
3. **资源库** — 素材与清单
4. **LLM 指南** — 体系化入门

文章保存后同步本地 Markdown 与搜索索引.
`.trim(),
  },
  {
    id: "attn",
    title: "Attention · 推导板",
    tint: "#7C3AED",
    markdown: `
$$
\\mathrm{Attn}(Q,K,V)=\\mathrm{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V
$$

- Multi-Head 并行子空间
- Pre-Norm + Residual
`.trim(),
  },
  {
    id: "swarm",
    title: "Swarm · 三层编排",
    tint: "#D97706",
    markdown: `
### Tier

- **super** — 总园丁 · 跨 Workspace
- **manager** — 园丁长 · 本域编排
- **sub** — 执行 · 只经 report_back

\`spawn_subagent\` → 异步队列 → 父会话消费
`.trim(),
  },
  {
    id: "hitl",
    title: "审批 · HITL",
    tint: "#DB2777",
    markdown: `
### Gate

\`\`\`
decision-scope
  memory:delete:*
  post:delete:slug
\`\`\`

- 等待中不空转
- 邮件回复 APPROVE / REJECT
`.trim(),
  },
];

/** 桌面便签：手写备忘 / 待办 / 金句——与屏幕内容刻意不同源 */
export type DeskStickyNote = {
  id: string;
  color: string;
  ink: string;
  title: string;
  body: string;
  rotate: number;
};

export const DESK_STICKY_NOTES: DeskStickyNote[] = [
  {
    id: "todo",
    color: "#FEF08A",
    ink: "#713F12",
    title: "今日",
    body: "① 花园首页改版\n② 审批邮件联调\n③ 别再写「刷新一下」",
    rotate: -0.08,
  },
  {
    id: "quote",
    color: "#FBCFE8",
    ink: "#831843",
    title: "原则",
    body: "状态在服务端\n前端只订阅渲染\n推拉缺一不可",
    rotate: 0.06,
  },
  {
    id: "buy",
    color: "#BBF7D0",
    ink: "#14532D",
    title: "采购",
    body: "咖啡豆 · 滤纸\n键盘轴润滑\n绿植换盆土",
    rotate: -0.04,
  },
  {
    id: "idea",
    color: "#BFDBFE",
    ink: "#1E3A8A",
    title: "灵感",
    body: "办公室带鱼屏\n便签≠屏幕克隆\n杂物要有生活感",
    rotate: 0.1,
  },
  {
    id: "call",
    color: "#FED7AA",
    ink: "#7C2D12",
    title: "提醒",
    body: "周五备份 dev.db\n检查 cookie 登录态\n给超级 Agent 补工具",
    rotate: -0.12,
  },
  {
    id: "mood",
    color: "#E9D5FF",
    ink: "#581C87",
    title: "心情",
    body: "见微知著\n粗鄙偏颇\n但还有点梦想",
    rotate: 0.05,
  },
];

export const BOOKSHELF_TITLES = [
  "Deep Learning · Goodfellow",
  "Attention Is All You Need",
  "Pattern Recognition & ML",
  "Neural Networks · Bishop",
  "Transformers for NLP",
  "Reinforcement Learning",
  "Speech & Language Proc.",
  "The LLM Engineer Path",
  "Scaling Laws Notes",
  "CUDA for Deep Learning",
  "Probabilistic ML",
  "Agent Systems Design",
] as const;

export const BOARD_STICKIES = [
  { label: "Markdown 真相源", color: "#FDE68A" },
  { label: "推拉结合", color: "#A7F3D0" },
  { label: "禁止打补丁", color: "#FBCFE8" },
  { label: "SSE 实时", color: "#BFDBFE" },
  { label: "Swarm 心跳", color: "#FED7AA" },
  { label: "本地优先", color: "#DDD6FE" },
] as const;

export const BOARD_POSTER = {
  title: "Local-first Agent Architecture for a Personal Knowledge Garden",
  subtitle: "OasisMind · Markdown as Source of Truth · Push/Pull UI State",
  sections: [
    {
      heading: "Abstract",
      body: "见微以本地 Markdown 为唯一事实源，用 Agent ReAct + SSE 驱动数字花园的收集、蒸馏与编排。状态权威在服务端，前端只订阅与渲染。",
    },
    {
      heading: "Method",
      body: "三层 Swarm（super / manager / sub）+ 心跳决策；工具闭集、子 Agent 结果仅经 report_back。",
    },
    {
      heading: "Invariant",
      body: "不变量收进 reducer；编排层禁止 setTimeout / await hydrate 赌时序。",
    },
  ],
  keywords: ["Local-first", "Markdown", "SSE", "Swarm", "HITL", "Transformer"],
};

export const OFFICE_BRAND = {
  name: "见微",
  en: "OasisMind",
  doorLabel: "见微",
  tagline: "Local-first Knowledge Garden",
  officeTitle: "见微的办公室",
};

export const PROJECTS: OfficeProject[] = [
  {
    id: "chat",
    tag: "对话",
    tagColor: "#0087EB",
    title: "Agent SSE Chat",
    meta: "三层 store · 推拉结合 · 刷新不丢",
    href: "/chat",
    cta: "开始对话",
  },
  {
    id: "gardens",
    tag: "知识库",
    tagColor: "#10B981",
    title: "Markdown 数字花园",
    meta: "content/ 为唯一事实源 · SQLite 缓存",
    href: "/gardens",
    cta: "进入花园",
  },
  {
    id: "agents",
    tag: "Swarm",
    tagColor: "#0284C7",
    title: "三层 Agent 层级",
    meta: "super / manager / sub · 心跳自主",
    href: "/agents",
    cta: "打开工作台",
  },
  {
    id: "skills",
    tag: "Skill",
    tagColor: "#F59E0B",
    title: "Skill 沙箱",
    meta: "config/skills · 可发现可晋升",
    href: "/skills",
    cta: "浏览技能",
  },
  {
    id: "memories",
    tag: "记忆",
    tagColor: "#EC4899",
    title: "三层 Memory",
    meta: "global · workspace · agent",
    href: "/memories",
    cta: "查看记忆",
  },
  {
    id: "approvals",
    tag: "HITL",
    tagColor: "#EF4444",
    title: "审批闸门",
    meta: "decision-scope · 可邮件回复",
    href: "/approvals",
    cta: "待审批",
  },
];

export const ABOUT_FACTS = [
  { label: "定位", value: "以 Markdown 为原子、AI 为引擎的数字花园" },
  { label: "工位", value: "环抱式工作台 · 模型架构屏 · 研究档案" },
  { label: "栈", value: "Next.js 16 · Express · tRPC · Prisma · R3F" },
  { label: "阶段", value: "L1–L5 已落地 · Swarm 心跳就绪" },
  { label: "入口", value: "对话 / 知识库 / Agent 工作台" },
];

export const KNOWLEDGE_NOTES = [
  {
    title: "本地 Markdown 是真相源",
    body: "文章、Agent、Skill、Memory 均写回磁盘；SQLite 只做查询与缓存，可随时重建。",
    keywords: ["Markdown", "FileSync", "db:sync"],
  },
  {
    title: "状态在内存 · 推拉结合",
    body: "写点后同栈推 SSE；进页/刷新从权威源水合。开着的面板必须秒级自己动。",
    keywords: ["SSE", "uiStateNotify", "hydrate"],
  },
  {
    title: "禁止打补丁",
    body: "不变量收进 store reducer；编排层用 setTimeout 赌时序一律打回。",
    keywords: ["store", "commitStream", "架构铁律"],
  },
];

export const JOURNEY_STOPS = [
  { year: "L1", place: "博客与编辑器", note: "花园文章 · 自动保存", region: "花园起点" },
  { year: "L2", place: "Agent 运行时", note: "ReAct + SSE · Skill / MCP", region: "引擎层" },
  { year: "L3", place: "任务与工作区", note: "Task · Workspace · 沙箱", region: "执行层" },
  { year: "L4", place: "自动化与审批", note: "Trigger · Approval · HITL", region: "治理层" },
  { year: "L5", place: "搜索与部署", note: "FTS5 · Docker · 鉴权", region: "交付层" },
  { year: "Now", place: "数字主力", note: "心跳 · Swarm · 量化工位", region: "常驻" },
];

export const HOTSPOT_META: Record<
  OfficeHotspotId,
  { label: string; overlay: OverlayKind; hint: string }
> = {
  monitor: { label: "研究工作台", overlay: "projects", hint: "应用入口 · 花园 · 模型 · 协作" },
  binder: { label: "速查夹", overlay: "about", hint: "Quick Facts · 关于见微" },
  board: { label: "知识库看板", overlay: "knowledge", hint: "整齐花园目录" },
  map: { label: "旅程地图", overlay: "journey", hint: "L1→Now 演进钉点" },
  plant: { label: "绿植", overlay: "garden", hint: "数字花园入口" },
  dog: { label: "小伙伴", overlay: "fun", hint: "本地优先吉祥物" },
  phone: { label: "手机支架", overlay: "agents", hint: "随时呼叫 Agent" },
  calendar: { label: "台历", overlay: "fun", hint: "今日待办 · 心跳节奏" },
  lamp: { label: "落地灯", overlay: "mood", hint: "切换书房氛围" },
  server: { label: "算力机架", overlay: "server", hint: "本地推理与系统资源" },
  bookshelf: { label: "AI 书架", overlay: "bookshelf", hint: "深度学习与大模型藏书" },
  chalkboard: { label: "模型架构屏", overlay: "architecture", hint: "Transformer 的计算顺序" },
  papers: { label: "桌面便签", overlay: "formulas", hint: "手写备忘 · 与屏幕不同源" },
};
