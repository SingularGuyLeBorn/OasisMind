# 交接: DeepSeek 专库 + rsi 补 PEAR + 图片修复

交接时间 2026-10-04 17:00. 所有子代理与后台进程 (MinerU 批处理, GitHub 图片恢复) 已停. 最近一次提交 `9a1bb650`, 全部提交只在本地, **不要 push**.

## 1. 规矩 (先读)

- 流程: `.cursor/skills/paper-pipeline/SKILL.md` (论文 → bi + analysis 的 SOP). 写法: `docs/writing-spec.md`. 子代理派活模板: agent store `ds/brief.md` (论文), `ds/brief-repo.md` (仓库), store 路径 `C:\Users\Administrator\AppData\Local\Cursor\AgentStores\cursor_agent_stores\f5a593ad-e684-40a4-b0e7-0928d776b502\files`.
- **全机同时最多两个 MinerU 进程**. 下载转换只由主代理串行跑 `scripts/paper-ingest.py` (批处理样例 store `ds/batch_ingest2.py`); 子代理不跑 MinerU. 一个 MinerU 任务在进程表里是 `mineru-kit.exe` + 3 个 python 子进程, 算一个.
- 写法硬规则: 英文标点且 `,` `.` 后加空格, 引语「」, 行内 `$...$`, 写 TestingTime, 不写比喻 / 元评论 /「纯猜」「(推断)」「(估算)」「TODO」「待补」. 3-6 个 `##`, 每个 `##` 至少两个 `###`, 每个 `###` 至少两段, 列表最多 5 项. 正文 5000-15000 汉字, 首页 >= 2000 字.
- 图片放文章目录下的 `images/`, 不建平级 `xxx-images/`.
- **D 盘写入会插 NUL 空洞**: 每个新写或改过的文件提交前跑 `python -c "import sys;print(open(sys.argv[1],'rb').read().count(0))" <file>`, 必须为 0. 空洞是插入的零块, 删掉 NUL 后核对接缝处即可.
- `scan-untranslated.py` 默认会覆盖 `docs/development/untranslated-scan.txt`, 子代理跑完后要 `git checkout -- docs/development/untranslated-scan.txt`.
- Git: 按路径 `git add`, 禁 `git add -A` / `--no-verify` / 改 config / force-push / amend; 不碰仓库根 `blobs/`. 提交格式 `content(<scope>): <中文摘要>` + why 正文, 做完一片提交一片.
- 检查脚本: store 里 `structure_check.py <analysis>`, `scan.py <bi> <analysis>`, `check_math.py <analysis>`; 仓库里 `node scripts/content-check.mjs`, `python scripts/caption-check.py <dir>`.

## 2. DeepSeek 专库 `content/deepseek/` (最高优先)

用户要求: 库名「源神启动! DeepSeek」, 收 DeepSeek 全部模型报告 (从 model-library **复制**, model-library 保持完整, 重复是有意的) 加非模型类论文 (mHC, Engram, NSA, DSec 等) 加开源仓库解析. 每篇做 bi (逐段对照译稿) + analysis (技术解析), 社区资料 (知乎必含, >= 5 份) 存 `data/sources/<slug>/community/`, 只用来找问题, 不引用不抄.

### 2.1 01-模型技术报告

| 目录 | 状态 | 剩余 |
|---|---|---|
| 16 个复制目录 (deepseek, coder, coder-v2, janus, janus-pro, math, prover, prover-v1-5, r1, v2, v3, v3-1, v3-1-terminus, v3-2, v4, v4-1-flash) | 已提交 912eb669 | `deepseek-v3-1-terminus/` 里多一个英文源文 `deepseek-v3-1-terminus.md`, 确认后删 |
| deepseek-moe (2401.06066) | MinerU 源文 + 9 份社区笔记 + 官方仓库 + HF 16B config 已备 | bi, analysis 全写. 已知: 按配置推 145B 激活约 13.6B, 论文写 12.2B; 16B 参数量差约 2% |
| deepseek-vl (2403.05525) | 源文 + 7 份社区笔记 + 官方仓库 + HF config | bi, analysis 全写. 已知: 1.3B 只用 SigLIP; SAM 支路有论文没写的跨层 alpha 项; Figure 4 题注 70:30 与正文不一致. community 里 `01-zhihu-deepseek-vl-vl2-ocr-evolution.md`, `05-github-issues-41-59-6.md` 是重复派活留下的, 去重 |
| deepseek-janusflow (2411.07975) | 源文 + 官方仓库 `Janus/` + HF config, 社区笔记未存 | 存 >= 5 份笔记 (已找到: 智源社区, papernotes, Jaehun 博客, GitHub issue #165, HF Space app.py, 知乎 8896192185); bi 补回 MinerU 漏掉的 Table 1/6 题注, 删重复的 p24 小图; analysis. 已知: Table 6 FID 用 MJHQ-10k, CFG 7.5, 附录 Figure 2 纵轴标 FID-30k 口径不一致 |
| deepseek-vl2 (2412.10302) | 源文 + 官方仓库 + 三档 HF config, 社区笔记 0 | 全做. 已知: 代码选分辨率是最大化有效像素, 论文写最小化填充; 三档参数量 0.57B/2.4B/4.1B 与配置吻合 |
| deepseek-prover-v2 (2504.21801), deepseek-ocr (2510.18234), deepseek-math-v2 (2511.22570), deepseek-ocr-2 (2601.20552) | 未下载 | 跑 `ds/batch_ingest2.py` (PEAR 那行已完成, 删掉再跑), 然后派活 |

### 2.2 02-架构与算法

- 已完成 (bi + analysis, 检查过, 未提交): mhc, nsa, engram, aux-loss-free, dspark, esft, codeio.
- deepseek-grm (2504.02495): bi 完成 (44 页标记, 8 疑惑块); analysis 未写; 删源文 `deepseek-grm.md` 和 store `grm-tr1.txt`, `grm-tr2.txt`, `grm_build.py`. 知乎没有专讲 GRM 的文章.
- 已知论文问题, 写首页或复核时用: NSA 式 (9) 下标有误; Engram 摘要说 MMLU +3.4, 表里是 +3.0.

### 2.3 03-基础设施

| 目录 | bi | analysis | 剩余 |
|---|---|---|---|
| deepseek-v3-insights (2505.09343) | 完成 (15 页, 17 疑惑块) | 写到 §2 末, 2563 汉字 | §3 FP8/LogFMT, §4 节点限制路由与 scale-up/out 融合, §5 MPFT 成本, RoCE, 内存语义与网内计算, 参考文献; 删源文与 store `v3i-bi-2.md`~`v3i-bi-4.md` |
| fire-flyer (2408.14158) | 完成 (18 页, 4 疑惑块) | §1-§2 完成 | §3 HFReduce, §4 HaiScale/3FS/HAI/checkpoint, §5 稳定性统计与下一代架构, §6 数字复核; 删源文与 store `ff/` |
| dualpath (2602.21548) | 完成 (17 页, 5 疑惑块) | §1-§4 在正文, §5-§6 + 参考文献在 store `ds/dp-part3.md` | 追加 `dp-part3.md`, 跑检查, 删源文与 `dualpath-tail.md`, `dp-part2.md`, `dp-part3.md` |
| dsec (2609.22978) | 完成 (31 页, 8 疑惑块) | §1-§2 完成 | §3 环境分层与 3FS 按需加载, §4 内存与 CPU 高密度机制, §5 与 RL 框架协同和防护, §6 跨报告对照与存疑 claim; 删源文与 store `ds/dsec-c2.md`~`dsec-c4.md` |
| harness-composability (2608.25512, PKU + DeepSeek-AI, 92 页) | 未转换 | PDF 在 `D:\tmp\papers\st\st.pdf`, 已在 `batch_ingest2.py`; 关联 deepseek-harness 仓库 |

### 2.4 04-开源仓库

- 已完成 (未提交): flashmla, deepep, deepgemm, 3fs, smallpond. deepgemm-bi 与 flashmla-analysis 的 NUL 已修.
- 要修的链接: `3fs/3fs-analysis.md` 链到 `dualpath.md`, 改成 `../../03-基础设施/dualpath/dualpath-analysis.md`.
- 未开始: DualPipe + profile-data, EPLB + LPLB, DeepSpec, TileKernels, DeepSelect, deepseek-harness. 按 `ds/brief-repo.md` 派活.

### 2.5 首页与提交

- `_garden.md` 已写未提交. 它链接的四个章首页 `01-模型技术报告/01-模型技术报告.md`, `02-架构与算法/02-架构与算法.md`, `03-基础设施/03-基础设施.md`, `04-开源仓库/04-开源仓库.md` 还不存在, 各 >= 2000 字; 另链了一个不存在的 `deepseek-moe-analysis.md`, 写完 moe 后核对路径.
- 提交顺序建议: 先把 2.2 已完成 7 篇, 2.4 已完成 5 个仓库逐片 NUL 检查 + 检查脚本后提交; 其余写完一片提交一片; 最后首页 + `_garden.md`.

## 3. rsi 补 PEAR

- 论文: PEAR: Progressive Evidence-Based AutoResearch for Industrial Search Systems, ByteDance Global E-Commerce Agentic Search Team, arXiv 2609.35031. 社区参考: 知乎青稞AI <https://zhuanlan.zhihu.com/p/2089434175224992093> (只调研, 不抄).
- 已完成: MinerU 转换, `data/sources/pear/paper/pear.md` (20 页) + `images/` (2 张). 其余没动.
- 要做: 在 `content/rsi/6-自动研究与实验室/` 下新增 `6.4-<短名>/6.4-<短名>.md` (命名对齐 6.1-6.3), 5000-15000 汉字, 图复制到该节 `images/`. 内容: 问题设定, 证据逐级加强与离线到在线 A/B 的门控, 系统结构, 实验数字, 局限; 与 1.1/1.3 证据规则, 3.2 Harness, 4.x 评判标准, 5.1 失效模式对照并互链. 再更新第 6 章首页与 `content/rsi/_garden.md`, 在 1-5 章 1-3 个相关小节加一段并链到新节. 社区笔记 >= 5 份存 `data/sources/pear/community/`.

## 4. 图片修复 (次优先)

- 背景: 部分图片在提交时已是全零字节 (LFS 指针里的 sha256 是零文件的), 只能从用户 GitHub 仓库按 (文件名, 大小) 找原图. 脚本 store `img_gh.py`, 待修清单 `img_bad.txt` (453 条, 路径相对 `content/`).
- 现状: 已恢复 119 张 (cs336 下, 工作区显示 `M`, 未提交); 脚本已停, 没跑完. 续跑 `img_gh.py` (有 `gh_trees.json` 缓存), 跑完看 `img_gh_fail.txt`, 找不到原图的按原文重画或删引用. 提交前抽查恢复图能打开且非全零.

## 5. 暂停 / 旧待办

- 图注补齐: 用户叫停, 先不做. 规则已写进 writing-spec §3.7.1 第 11 条, 工具 `scripts/caption-check.py`.
- model-library `claude-sonnet-4-bi.md` (25 个 NUL), `gpt-4-series-bi.md` (2 个 NUL) 是早年提交时就带的, 有空清掉.
- 旧待办 (llm-guide 结构整改系列): 阶段 D S1-S6 / W1-W8 收尾; spec-all.json + spec-gardens.json 迁移; 重排后旧节号与旧路径; 缺失首页; 遗漏分节整改 (2.1.2, 2.1.5, 4.4.0, GRPO 家族, SLiC/IPO/PRO, ReMax, OPD 01-04, Song-Zheng); 疑似重复稿 (DSpark, LLM-JEPA, 高效注意力综述, 隐式思维链); 旧稿元评论清理.
