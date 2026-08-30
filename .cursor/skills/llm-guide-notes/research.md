# 一手阅读流水线

吸收自本仓库 `config/skills/deep-research`、`arxiv-fetch-process`、knowledge-garden 的 RLM，以及 Cursor Goal「以磁盘为准、完成须举证」。

## 优先级（能找到就读）

| 优先级 | 读什么 |
|--------|--------|
| 1 | 原论文 / 技术报告（arXiv HTML 或本库 `pdfs/`，不要为凑数再 OCR 进 git） |
| 2 | Model card / 官方 GitHub README |
| 3 | 官方 blog / system card |
| 4 | 顶会版（ICLR / ICML / NeurIPS / EMNLP / ACL / TMLR）与 arXiv 初稿的差异 |
| 5 | 二次文献：科学空间、Lilian Weng、Raschka、SemiAnalysis、可核对原文的中文精读。冲突以 1–3 为准 |

## Cursor 工具（本机 Goal）

1. `WebSearch` 中英文关键词，找到官方名 + arXiv ID。
2. `WebFetch` arXiv abs / HTML（如 `https://arxiv.org/html/2305.19370`）或官方页。
3. 超长材料分段 Read：看到截断就继续，禁止凭残页下结论。
4. 表格数字以 **Table 同行** 为准；摘要与表冲突时弃摘要（BPT 摘要 32× vs Table 2 同行 8×）。
5. 每个打开的 URL 追加到 `notes/live/PROCESS.md` 来源表（日期、题目、URL、写进哪篇、一句话摘录）。

## OasisMind 工具（若在见微 Agent 里写）

顺序：`search_arxiv` / `literature_search` → `fetch_arxiv` → `download_file` → `document_to_markdown` → `read_article` 翻页。登录墙用 `dokobot_read`。落盘用 `post_create` / `post_update`，不要 `write_file` 直写 `content/`（uploads 除外）。

## 交叉验证

- 关键论断至少 2 个独立来源，或 1 个一手 + 显式「单源」。
- 口述缩写（Muon、mHC、XHC…）搜不到：PROCESS 留条 + `[OM-FREEPLAY]`，禁止从主题树删掉，禁止编公式。
- 2026 型号 / 带宽 / 框架能力：写之前必须搜过官方页。

## 配图 vs 调研

搜索是为了找到要读的原文，**不是为了盗图**。图走 GenerateImage 或 mermaid。
