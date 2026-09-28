# 一手阅读流水线

吸收自本仓库 `config/skills/deep-research`、`arxiv-fetch-process`、knowledge-garden 的 RLM，以及 Cursor Goal「以磁盘为准、完成须举证」。

覆盖面体检与讲法参考（**禁止搬正文/目录/图**）：`content/llm-guide/notes/trusted-sources.md`。课程不是最新真相；与 2026 报告冲突时弃课程。

## 优先级（能找到就读）

| 优先级 | 读什么 |
|--------|--------|
| 1 | 原论文 / 技术报告（arXiv HTML 或本库 `pdfs/`，不要为凑数再 OCR 进 git） |
| 2 | Model card / 官方 GitHub README |
| 3 | 官方 blog / system card |
| 4 | 顶会版（ICLR / ICML / NeurIPS / EMNLP / ACL / TMLR）与 arXiv 初稿的差异 |
| 5 | 二次文献：科学空间、Lilian Weng、Raschka、SemiAnalysis、**知乎高质量专栏/回答**（只学讲法与争议，禁止搬正文/图）。冲突以 1–3 为准 |

## Cursor 工具（本机 Goal）

1. `WebSearch` 中英文关键词，找到官方名 + arXiv ID。
2. `WebFetch` arXiv abs / HTML（如 `https://arxiv.org/html/2305.19370`）或官方页。
3. 超长材料分段 Read：看到截断就继续，禁止凭残页下结论。
4. 表格数字以 **Table 同行** 为准；摘要与表冲突时弃摘要（BPT 摘要 32× vs Table 2 同行 8×）。
5. 每个打开的 URL 追加到 `notes/live/PROCESS.md` 来源表（日期、题目、URL、写进哪篇、一句话摘录）。
6. **论文读完后再搜知乎**（可选，讲法/工程口碑，不当事实源）。本机已有 CLI，不要用 Cursor `WebFetch` 硬扛知乎（登录墙/500）：
   - `pnpm --filter @oasismind/server zhihu -- search "<概念> <论文名或 arXiv>" --count 5`
   - 挑 1–3 条高赞专栏/回答：`pnpm --filter @oasismind/server zhihu -- read "<url>" --meta-only` 先看 `totalChars`；再去掉 `--meta-only` 取正文。若 `contentTruncated`/`nextOffset` 有值，用 `--offset` 翻页直到没有。
   - 开放平台搜索返回的是 **摘要**（约 1k 字），不是全文。全文只走 `read`。
   - 数字、公式、日期仍以论文/官方报告为准。知乎只用来发现「别人怎么拆问题、踩过什么坑」。禁止把专栏改写成专文，禁止下图。

## OasisMind 工具（若在见微 Agent 里写）

顺序：`search_arxiv` / `literature_search` → `fetch_arxiv` → `download_file` → `document_to_markdown` → `read_article` 翻页。知乎：`zhihu_openapi_search`（摘要）→ `read_article`（全文，同源 CLI）。登录墙用 `platform_login(zhihu)` 或 `dokobot_read`。落盘用 `post_create` / `post_update`，不要 `write_file` 直写 `content/`（uploads 除外）。

## 交叉验证

- 关键论断至少 2 个独立来源，或 1 个一手 + 显式「单源」。
- 口述缩写（Muon、mHC、XHC…）搜不到：PROCESS 留条 + `[OM-FREEPLAY]`，禁止从主题树删掉，禁止编公式。
- 2026 型号 / 带宽 / 框架能力：写之前必须搜过官方页。

## 配图 vs 调研

搜索是为了找到要读的原文，**不是为了盗图**。图走 GenerateImage 或 mermaid。GenerateImage **必须浅色主题**（白底深字），禁止深色底。接线规则见 `.cursor/skills/academic-diagrams/SKILL.md`。
