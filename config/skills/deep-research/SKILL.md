---
name: "deep-research"
description: "deep-research"
icon: "Wand2"
trigger: "/deep-research"
enabled: true
kind: procedural
tags: []
version: "1.0.0"
---
# Deep Research（OasisMind 精简版）

陪伴创作的调研流程：先想清楚问什么，再搜网页与文献，交叉验证后落盘成 Markdown。

## 何时加载

用户提到：深度调研 / 文献综述 / 技术调研 / 竞品分析 / 写报告前先查资料 / deep research。

用 `skill_view deep-research` 加载本说明；需要细节时再 `skill_view` 读 `references/`（若有）。

## 工具映射

| 步骤 | 工具 |
|------|------|
| 网页广搜 | `web_search`；登录墙/强反爬可改 `dokobot_search`（本机真实 Chrome，需扩展+CLI） |
| 指定 URL 抓取 | `scrape_web_page`（单页/列表页精准抓取，非搜索） |
| arXiv 检索 | `search_arxiv` |
| 学术检索 | `literature_search`（openalex / arxiv / semantic_scholar / all） |
| arXiv 全文获取 | `fetch_arxiv`（arXiv ID）→ `download_file` 下载 PDF |
| 单篇详情 | `literature_get`（DOI / arXiv id） |
| 精读网页/长文 | 公开页优先 `read_article`（长文 offset 翻页，见 RLM 纪律）；登录墙 / 已在 Chrome 打开的页用 `dokobot_read`；未装 Dokobot 或失败再 `platform_login` + `read_article` |
| 本地处理/转换 | `run_shell`（tsx/Node/Python/ffmpeg 等本地脚本） |
| 读取本地产物 | `read_file`（Workspace/产物路径，配合 offset 分段） |
| 需点击/填表 | `skill_view browser-drive` + `webbridge_command`（不要为读正文开 WebBridge） |
| PDF/Word 入库 | `document_to_markdown` |
| 过程记录/碎片捕获 | `memory_daily_append`（关键发现、金句、待办即时落盘） |
| 报告落盘 | `write_file`（Workspace）或 `post_create`（数字花园） |

**禁止**调用 `future` CLI 或不存在的 `search_paper` / `parse_doc`。Dokobot / WebBridge 都是场景手段，不单独为一工具开 Skill。

## 策略（先问用户选一档）

| | A 快扫 | B 广搜 | C 深挖 |
|--|--------|--------|--------|
| 时间感 | ~数分钟 | 一轮会话 | 多轮 |
| 网页 | 3–5 词 | 6–10 词 | 10+ 词 + 精读 |
| 文献 | 可选 | `literature_search` 摘要 | 检索 + `literature_get` + PDF |
| 验证 | 基本 | 多源对照 | 引用/DOI 核对 |

默认：中文输出；学术主题优先英文学术源，再补中文网页。

## 五步流程

1. **收束问题** — 确认主题、时间范围、A/B/C、输出语言；用户若给了 PDF/链接先 `document_to_markdown` / `read_article`（登录墙链接可直接 `dokobot_read`）。
2. **广搜** — `web_search` 多组关键词；撞登录墙再用 `dokobot_search`；`literature_search`（source=all 或 arxiv）收集候选。
3. **精读** — 对 Top 来源按上表选 `read_article` / `dokobot_read` / `literature_get`；记下主张、证据、出处（URL 或 DOI）。
4. **交叉验证** — 至少 2 个独立来源支撑关键结论；冲突处显式写出；无来源不写死。
5. **成稿** — Markdown 报告结构：
   - 问题与范围
   - 主要发现（分点）
   - 文献/链接表（title · year · DOI/URL）
   - 不确定性与下一步
   - 落盘：`write_file` 到 Workspace，或用户要求入库时 `post_create`

## 输出纪律

- 每条关键论断带出处（链接或 DOI）。
- 区分「已核实」与「单源传闻」。
- 长文勿整页塞进对话：先落盘再 `read_file` 分段。
- 创作向：结尾给 3–5 条可写进文章的「素材钩子」（论点/金句/数据）。

## 分段读纪律（RLM —— Read Long Material）

- 超长材料（>8k 字）一律 **path + offset 变量化分段读**，勿整文件灌窗。
- `read_article` / `read_file` 返回 `nextOffset` / `truncated` 时，直接翻页直到 `truncated=false`。
- 看到 `[TRUNCATED]` 标记时，**禁止**基于残缺内容下结论；必须继续读取后续段落。
- 关键词定位：可带 `expect_keywords`（3–8 个）让工具在 metadata 记录命中偏移，后续 `read_file` 直接跳转。

## 过程记录习惯

- 关键发现、金句、待办、跨源验证点，即时用 `memory_daily_append` 落盘（按日期自动分文件，便于过夜复盘）。
- 会话结束前可 `tool_results_list` 回顾本轮所有工具产物路径，防漏捡。
