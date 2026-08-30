---
title: "01 · Gemini 3.7 Flash：2026-08-13；算法改进不是更大架构；DeepSWE 65.3%；intro $0.75/$3.75"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-3.7-Flash, 公开材料精读]
---

# Gemini 3.7 Flash: 算法迭代不是更大骨架 - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 同族更早 Flash：[3 Flash（12，2025-12-17）](../12-Gemini-3.0-Flash/01-12-Gemini-3.0-Flash-技术报告精译.md) · 同族 Pro：[3.1 Pro](../13-Gemini-3.1-Pro/01-13-Gemini-3.1-Pro-技术报告精译.md)

> **核心定位**：闭源工作马。官方把这次发版写成 **对 Gemini 3.6 Flash 的算法改进**，不是更大骨架、也不是把 1M 窗再拉长。没有公开权重，也就没有可核对的 `config.json`。

> **[OM-FREEPLAY] 材料不够 4000 汉字。** 公开材料是 model card、产品博文、Cloud 型号页和 FSF PDF，**没有**层数、MoE、训练 token、配方。主表与方法页是英文数字。本篇按一手抄完规格、`thinking_level`、价、harness 分叉和安全表；不注水凑满。

**材料类型（2026-08-30）**：**model card + 产品博文 + Cloud 型号页**。产品名 **Gemini 3.7 Flash**，发布 **2026-08-13**（博文当天；Cloud 型号页 `Release date: August 13, 2026`，Launch stage **GA**）。前任是 **Gemini 3.6 Flash**（card 写 Published 2026-07-21）——本库不为 3.6 Flash 单开夹，架构细节只在本文当对照。云上 **Flash-Lite = B**，不 mkdir。

事实源：

- [Gemini 3.7 Flash model card](https://deepmind.google/models/model-cards/gemini-3-7-flash/)（Published 13 August 2026）
- [Introducing Gemini 3.7 Flash](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/)（Aug 13, 2026）
- [Gemini 3.7 Flash · Cloud 型号页](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-7-flash)
- [Developer's guide to Gemini 3.7 Flash](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/guides/gemini-3-7-flash)
- [evals-methodology · gemini-3-7-flash](https://deepmind.google/models/evals-methodology/gemini-3-7-flash)
- [Frontier Safety Framework Report（PDF）](https://storage.googleapis.com/deepmind-media/gemini/gemini_3-7_flash_fsf_report.pdf)
- 前任只读：[Gemini 3.6 Flash model card](https://deepmind.google/models/model-cards/gemini-3-6-flash/)（Published 21 July 2026）

## 1. 一句话：算法改核心推理，窗和骨架官方都说没动

Card 的 Description 原句：Gemini 3.7 Flash 是 Gemini 3 家族的 **next iteration**，**featuring algorithmic improvements to its core reasoning foundation**；并支持可调 thinking，用来权衡质量、成本和延迟。

**Model dependencies / Architecture** 两节同一句话：**based on Gemini 3.6 Flash**。训练数据、数据处理、硬件、软件全部指回 3.6 card。3.6 card 自己再指回 **Gemini 3.5 Flash**。这条链里 **没有** 层数、头数、MoE 专家数、激活比。本篇不编。

博文补产品时间线：距 3.6 Flash **三周**；自称「developer feedback and algorithmic innovations」；定位 **most intelligent workhorse yet for coding and agents**。渠道：Antigravity / Gemini API / AI Studio / Android Studio；企业走 Gemini Enterprise Agent Platform 与 Gemini Enterprise app；个人侧是 Gemini app 里的 **Spark**（Google AI Pro / Ultra，自称 160+ 国）。

**不是**：不是把上下文从 1M 扩到 2M；不是公开更大骨架；不是 3.0 Flash（2025-12-17）的同日补丁；不是 Flash-Lite。

## 2. 相对 3.6：同一扇窗，换的是推理算法

3.6 card 已经写过：输入最多 **1M**、输出 **64K**。3.7 card 重复同一对数字。Cloud 型号页把整数写死：上下文 **1,048,576**、最大输出 **65,536**。产品口径「1M / 64K」与 API 整数是同一规格的两种写法，不要合成第三个数。

![相对 3.6 Flash：同一 1M/64K 窗，官方只写算法改进](./images/fig-algo-iter-not-window.png)

> 图 1：3.7 Flash 相对 3.6 Flash 的官方「不是」——算法改核心推理，不是扩窗、不是更大骨架。（据 3.7 / 3.6 model card）

**图 1 解析**

- 左右两块贴的是同一对窗：**1M 输入、64K 输出**。官方没有宣布这次把窗拉开。
- 中间实箭头只写 card 原词：**algorithmic improvements to core reasoning**。
- 两条虚线禁止路径：**(A) NOT a larger context window**、**(B) NOT a larger architecture**。本库不为 3.6 另开夹，所以这张图就是 3.7 文里的前任对照。
- 3.7 右块多一行 **based on 3.6 Flash**。再往下追，3.6 又 **based on 3.5 Flash**。公开材料停在这一级依赖，没有 `config.json`。
- 底栏是读图结论：**same window, same disclosed skeleton**。迭代落在训练与算法，不落在「更大模型」叙事。

## 3. 规格：card 的 1M/64K，Cloud 的整数与能力开关

| 项 | Card | Cloud 型号页 `gemini-3.7-flash` |
|----|------|----------------------------------|
| 输入 | 文本、图像、音频、视频；窗 **up to 1M** | Text 出入；Image / Audio / Video **仅输入** |
| 输出 | 文本，**64K** | Text；最大输出 **65,536** |
| 上下文整数 | 未写精确 token | **1,048,576** |
| 发布 | August 2026；页头 13 August 2026 | GA；**August 13, 2026** |
| Live API | （本 card 未列） | **Not supported** |
| Computer use | （本 card 未列） | **Preview** |
| Tuning | （本 card 未列） | **Not supported** |
| 缓存 | （本 card 未列） | 隐式 + 显式 context caching |
| 知识截止 | **March 2026**；部分域可能停在 **January 2025**（Gemini 3 家族口径） | 型号页未写截止日 |

Cloud 还给出媒体上限（只抄型号页，不估）：图像每 prompt 最多 3,000 张；带音频视频约 45 分钟、无音频约 1 小时、每 prompt 最多 10 段视频；音频每 prompt 约 8.4 小时或最多 1M token、最多 1 个音频文件。支持区域：`global` / `us` / `eu`。消费：Provisioned Throughput、Batch、PayGo（Standard / Flex / Priority）；Fixed quota **Not supported**。

型号页列出的采样默认值是 Temperature **1.0**、topP **0.95**、topK **64**。同日开发者指南却写：`temperature` / `top_k` / `top_p` **被后端忽略**；`frequency_penalty` / `presence_penalty` / `candidate_count` 会 **直接报错**。两页不要合成「官方推荐温度 1.0」。控制推理深度走下一节的 `thinking_level`。

## 4. `thinking_level` 三档，替代 `thinking_budget`

Gemini 3 起，官方把 2.5 系的整数 **`thinking_budget`** 收成离散枚举 **`thinking_level`**。Cloud [Thinking](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/thinking) 型号表对 **Gemini 3.7 Flash** 写的是：支持 **`LOW` / `MEDIUM` / `HIGH`**，默认 **`MEDIUM`**。同一张表里，**3.6 Flash 仍支持 `MINIMAL`**。Firebase 文档脚注：给 `gemini-3.7-flash` 设 `MINIMAL` 会 **400**。开发者指南：同请求里同时传 `thinking_level` 和 `thinking_budget` 也会错。

家族总述有一句「Gemini 3 默认动态 thinking、`thinking_level.HIGH`」。那是总述。**3.7 Flash 的型号表与开发者指南都写默认 MEDIUM**——以型号表为准。

Cloud 开发者指南给三档的推荐场景偏视频（HIGH：稠密视觉 QA / 60+ 分钟视频多步推理；MEDIUM：一般视频问答与讲义摘要；LOW：快转录检索与元数据）。这是 **Cloud 指南的推荐映射**，不是 card 里的基准设置。评测方法页对 DeepSWE / Terminal-Bench 写的是 **high thinking**，不要把「默认 MEDIUM」读成「表里的分也是 MEDIUM」。

评测方法页把 DeepSWE、Terminal-Bench 一类 agent / 编码主表钉在 **high thinking**。card 主表因此不能拿默认 MEDIUM 去读。方法页还声明安全评测集相对更早 Gemini card 改过，所以 §9 的百分点只相对 3.6，不能和 2.5 / 3.0 的安全表并排。公开材料仍然没有层数、MoE、训练 token——缺的是架构表，不是「这篇可以写短」。

型号 ID 是 **`gemini-3.7-flash`**（Cloud / API）。不要写成 3.6 的 ID，也不要给 Flash-Lite 另起目录。

![thinking_level 三档：LOW / MEDIUM 默认 / HIGH；3.7 不支持 MINIMAL](./images/fig-thinking-level-three-tiers.png)

> 图 2：`thinking_level` 三档（LOW / MEDIUM / HIGH）替代 2.5 的整数 `thinking_budget`；3.7 Flash 不支持 `MINIMAL`。（据 Cloud Thinking 表与 3.7 开发者指南）

**图 2 解析**

- 左侧划掉的是 **Gemini 2.5 的整数 token 帽**（`thinking_budget`）。3.x 不要再把「想多久」理解成滑条上的一个整数。
- 三张实卡片才是 3.7 合法值：**LOW**（延迟与成本优先）、**MEDIUM**（默认、均衡）、**HIGH**（更深推理、更重工具链）。
- 底下一张虚线 **MINIMAL**：3.6 还有，3.7 **没有**。设了就 400。不要把 3.6 的四档表贴到 3.7。
- 底轴只表示「思考 token 更少 ↔ 更多」的 **质量 / 成本 / 延迟** 权衡。图上 **没有** 假坐标、没有把 card 里的百分数画成柱。
- 同请求禁止混用两个参数。需要确定性时，Cloud 指南指向 `thinking_level` + `response_schema` / `json_schema`，而不是调温度。

## 5. 官方基准：只抄 3.7 card 表（2026-08）

Card：**Results as of August 2026**。对照列是 Gemini 3.6 Flash、Claude Sonnet 5、GPT-5.6 Terra、Muse Spark 1.2。价行带星号，下一节单独拆，不和分混读。

Gemini 分数除方法页另注外为 **pass@1**、**single attempt**（无多数投票、无并行测试时计算）。模型 ID **`gemini-3.7-flash`**，默认采样，除非下面方法页另说。

| Benchmark | Notes | Gemini 3.7 Flash | Gemini 3.6 Flash | Claude Sonnet 5 | GPT-5.6 Terra | Muse Spark 1.2 |
|-----------|-------|-----------------|------------------|------------------|--------------|----------------|
| Artificial Analysis Intelligence Index | Composite | 56 | 52 | 55 | 57 | 57 |
| FrontierCode 1.1 Main | Production code quality | **43.6%** | 34.4% | 42.7% | 41.3% | — |
| DeepSWE v1.1 | Long-horizon SWE | **65.3%** | 48.6% | 53.8% | 69.6% | 54.9% |
| Code Arena | Web development Elo | **1588** | 1538 | 1541 | 1523 | 1535 |
| Terminal-bench 2.1 | Agentic terminal coding | **85.8%** | 78.0% | 80.4% | 87.4% | 82.9% |
| Terminal-bench 3.0 | General agent capabilities | **14.9%** | 5.4% | 14.6% | 20.8% | — |
| AutomationBench | Enterprise workflow；**Private set** | **30.4%** | 17.0% | 10.7% | 23.6% | — |
| GDPVal-AA v2 | Knowledge work Elo | **1525** | 1422 | 1598 | 1578 | 1628 |
| Harvey LAB-AA | Complex legal workflows | **90.7%** | 85.1% | 90.1% | 85.2% | — |
| GDP.pdf | Expert PDF | **34.0%** | 22.0% | 28.0% | 24.7% | 16.0% |
| CharXiv Reasoning | No tools | 84.5% | **85.2%** | 77.0% | 85.9% | — |
| CharXiv Reasoning | With tools | 88.7% | **89.4%** | 88.3% | — | — |
| LVBench | Long video | **85.4%** | 84.2% | 68.5% | 78.9% | — |
| GDM-MRCR v2 (8-needle) | 128k (average) | **97.0%** | 91.8% | 81.5% | 93.5% | — |
| OSWorld-2.0 | Agentic computer use | **47.9%** | 33.8% | — | 50.2% | — |
| Agent's Last Exam | Multimodal desktop/OS；Pass rate | **26.3%** | 24.2% | 33.3% | 28.0% | — |
| HLE-Verified | Multidisciplinary | **53.6%** | 51.2% | 31.0% | 51.1% | — |
| BioMysteryBench | Human solvable | 87.1% | 80.6% | **87.5%** | 83.8% | — |
| BioMysteryBench | Human difficult | 43.5% | 41.2% | 34.1% | **49.4%** | — |
| LABBench2 | Biology research tasks | **82.1%** | 76.1% | 80.1% | 81.2% | — |

读表时先看「相对 3.6」：编码与工作流（FrontierCode、DeepSWE、Code Arena、Terminal-bench、AutomationBench、GDP.pdf、OSWorld-2.0）是 card 自己高亮的跃迁。**CharXiv 两行 3.7 都略低于 3.6**（84.5 / 88.7 vs 85.2 / 89.4）——官方表就这样写，不要改成「全面超过」。GDPVal-AA Elo 1525 仍低于表里的 Sonnet / Terra / Muse。DeepSWE 上 Terra **69.6%** 仍高于 3.7 的 65.3%。

博文与 card **对齐**的句子：FrontierCode 1.1 Main **43.6% vs 34.4%**；WebDev Arena Elo **1588 vs 1538**；GDP.pdf **34.0% vs 22.0%**；AutomationBench **30.4% vs 17.0%**。博文 DeepSWE 写成 **65.3% vs 49.0%**，card 对照列是 **48.6%**——**主表用 card 的 48.6%**，49.0% 只当博文口径，不合成 48.8%。3.6 自己那张 7 月 card 把 DeepSWE 写成 **49%**，同样不要倒灌进 3.7 主表。

**不要并进主表**（Cloud 开发者指南「What's new」与 card 对不上，按死命令丢掉）：Terminal-bench 2.1 **85.1% / 73.0%**（card 是 85.8% / 78.0%）；DeepSWE **63.7% / 49.0%**（card 65.3% / 48.6%）；HLE **45.7% / 37.4%**（card 是 **HLE-Verified** 53.6% / 51.2%，题集不同）；LMArena WebDev **1592 / 1532**（card Code Arena **1588 / 1538**）。

也不要把 3.6 card 的 **OSWorld-Verified 83.0%** 和 3.7 表的 **OSWorld-2.0 47.9%** 收成同一列——名字就不是同一个基准。

## 6. 评测方法页：同一张表背后的 harness 分叉

[evals-methodology](https://deepmind.google/models/evals-methodology/gemini-3-7-flash) 把「怎么跑」写清楚了。非 Gemini 分默认来自厂商自报；对 GPT-5.6 Terra、Sonnet 5、Muse Spark 1.2 优先用 **最大 thinking/reasoning**，没有再退到「当时能拿到的最好推理分」。

要点（只记影响怎么读第 5 节的那些）：

- **DeepSWE v1.1**：Gemini 分来自 [deepswe.datacurve.ai](https://deepswe.datacurve.ai) 公开榜。3.6 用榜上最高 thinking（方法页写 **high thinking**）。**3.7 是自测**：mini SWE agent + LiteLLM **1.96** + **high thinking**。不是「两列同一 harness 自动刷出来」。
- **FrontierCode 1.1**、**Code Arena**：官方公开榜。
- **Terminal-Bench 2.1**：Gemini 自测；别人来自公开榜与 Artificial Analysis；只报默认 harness **Terminus 2**。
- **Terminal-Bench 3**：公开榜取各模型最高 thinking；Gemini 仍是 mini SWE + LiteLLM 1.96。方法页承认对 `cli-2ph-simplex`、`vpp-loss-divergence` 做了容器兼容小改。
- **AutomationBench**：private set + 官方公开榜。
- **GDPVal-AA v2 / Harvey LAB-AA**：Artificial Analysis 公开榜。
- **GDP.PDF**：Terra / Muse 来自公开榜；Gemini 与 Sonnet **自测**。
- **CharXiv with tools**：Gemini 用 search + code execution。
- **LVBench**：Gemini 与 Terra **1024 帧**；Sonnet **300 帧**（API 限制）。无工具。
- **GDM-MRCR v2**：128k 报 **cumulative**，为了能和别家比。
- **OSWorld 2.0**：Gemini 与 Sonnet 自测；3 次 run 取 max、每次 single attempt；报 **partial score**；1080p、最多 500 step；截图观测 + pyautogui；跑在官方 **08.08 patch 之前**，以便对齐竞品自报。Terra 来自其官方博文。
- **HLE-Verified**：自测；全套 **1,811** 题（[arXiv:2602.13964](https://arxiv.org/pdf/2602.13964)）：原 HLE 里 668 条 verified + 1143 条修订；丢掉 689 条 uncertain。方法页注明 Sonnet 5 有大量题被内容策略挡住。
- **BioMysteryBench / LABBench2**：Linux 终端 + 预装生物信息工具、Python、R；联网限作者白名单域名。

## 7. 价格：introductory 一行，2027-01-01 另起一行

不要合成「现价约等于」这种中间数。card 脚注与博文脚注 1 是同一对日期。

| 口径 | 生效 | Input $/1M | Output $/1M | 出处 |
|------|------|------------|-------------|------|
| Introductory | 至 **2026-12-31** | **0.75** | **3.75** | 3.7 card 脚注；博文正文与脚注 1 |
| 涨价后 | 自 **2027-01-01** | **1.50** | **7.50** | 同上 |

3.7 card 对照表把 **3.6 Flash 也标成 $0.75\* / $3.75\***（同一星号）。博文另说：introductory 是 **original 3.6 Flash 价的一半**。3.6 自己 7 月那张 card 的价行是 **$1.50 / $7.50**（无缓存输入 / 输出）——那就是「original」那一档，和 2027-01-01 将要恢复的数字相同。三句话并存：**现在 intro 是 0.75/3.75；3.6 七月标过 1.50/7.50；明年元旦回到 1.50/7.50。** 不要平均。

Cloud 开发者指南写 3.7 **maintaining the exact same price tier as Gemini 3.6 Flash**——指的是 **当前 intro 同档**，不是「永远 0.75」。

## 8. 开发者规则（Cloud 指南，不是架构）

指南要求从 3.5 / 3.6 迁过来时：模型 ID 改成 **`gemini-3.7-flash`**；整数 `thinking_budget` 换成 `thinking_level`；删掉被忽略或会报错的采样字段；对话历史 **不能以 `model` 角色结尾**、不要预填 model turn。函数调用：**`FunctionResponse` 必须与前一轮 `FunctionCall` 的 id / name / 执行次数对齐**。工具前的工作笔记不要裸 XML，指南给了一个 `update()` 函数示例。

博文对体验的定性（没有对照表）：更会处理卡点、更会澄清意图、指令跟随更好；多步规划与工具调用更「勤」；更少人工盯梢和重试。这些是产品叙述，**没有**成功率列。

Spark：I/O 发布的 24/7 个人 agent；博文写从当天起用 3.7 Flash，强调 Workspace 工具与多技能工作流。演示（prompt→可玩 3D、落地页编排、机器人训练图、PDF→交互数据故事）**没有**评测表，不当基准。

## 9. 安全：内部自动评 + FSF v3.1（2026-04）

Card：整体相对 3.6 **safety 与 tone 相近**，无理拒绝低。开发期自动评是 **相对 3.6 的百分点**，且方法页声明评测集改过，**不能和更早 Gemini card 的安全表直接比**。

| Evaluation | 相对 3.6 Flash | 方向（card 原注） |
|-----------|----------------|-------------------|
| Text to Text Safety | **+1.17pp** | Lower is better |
| Multilingual Safety | **−0.48pp** | Lower is better |
| Image to Text Safety | No change | Lower is better |
| Tone | **−0.47pp** | Higher is better |
| Unjustified-refusals | **+0.84pp** | Lower is better |

人工红队：儿童安全达发布阈值；内容安全相对 3.6 相近或更好；范围还对过 3.1 Pro，card 写 **no egregious concerns**。已知限制：幻觉、越狱仍在加强、偶发慢或超时；知识截止见 §3。

**Frontier Safety。** Card 写按 **Frontier Safety Framework（April-2026）** 评，**未达到任何 tracked / critical capability level**。FSF 报告 PDF 打得开：框架版本 **v3.1（2026-04-17）**；因 3.7 相对 3 Pro / 3.1 Pro 能力强，这次对 Flash 做了 **轻量风险评定**（不是 Pro 级全套证据包）。四域结论与 card 表一致：

| Domain | T/CCL | 是否达到 |
|--------|-------|----------|
| CBRN | Uplift TCL；Uplift Level 1 CCL | **均未达到**（CCL 到了 alert，未过 CCL） |
| Cybersecurity | Uplift Level 1 CCL | **未达到**（到了 alert） |
| Harmful Manipulation | Level 1 CCL | **未达到**（未到 alert） |
| ML R&D / Misalignment | Stealth & Situational Awareness TCL；Acceleration / Automation Level 1 CCL | **均未达到** |

发布时带上更新的 **CBRN 与 cyber offense** 防护。报告细节（红队流程、代理评测脚手架）以 PDF 为准；本篇不把危害路径评分抄进花园正文。

3.6 card 的 FSF 写法不同：当时说「以当时最强的 3.1 Pro 为缓冲，3.6 相对 3.1 Pro 没有meaningful new capabilities」。3.7 **自己跑了一遍 T/CCL 表**。不要把 3.6 那句「跟 3.1 Pro 走」写成 3.7 的评估方式。

## 10. 失效条件

- 把 3.7 写成「更大 MoE / 更多层 / 开源权重」。公开材料没有。
- 把窗写成 2M，或把 Cloud 的 1,048,576 / 65,536 与 card 的 1M / 64K 合成第三个数。
- 给 3.7 画四档 thinking（塞进 `MINIMAL`），或继续传 `thinking_budget`。
- 用 Cloud 开发者指南那张对不上的「What's new」表覆盖 card。
- 用博文 DeepSWE 对照 **49.0%** 覆盖 card 的 **48.6%**。
- 把 3.6 card 的 OSWorld-Verified 83.0% 和 3.7 的 OSWorld-2.0 47.9% 放同一格。
- 为 3.6 Flash / 云上 Flash-Lite mkdir。
- 把 intro 价和 2027-01-01 价平均成一行。
- 把知识截止写成「训练到发版日」。card 写 **March 2026**，部分域可能停在 **January 2025**。
- 把 card 主表当成默认 **MEDIUM**。编码 / agent 主表在方法页钉 **high thinking**。
- 把 CharXiv 两行改成「全面超过 3.6」。card 上 3.7 略低（84.5 / 88.7 vs 85.2 / 89.4）。

## 本篇来源

1. Google DeepMind. (2026-08-13). [Gemini 3.7 Flash model card](https://deepmind.google/models/model-cards/gemini-3-7-flash/).
2. Doshi, T., Gemini team. (2026-08-13). [Introducing Gemini 3.7 Flash](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/). Google.
3. Google Cloud. [Gemini 3.7 Flash](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-7-flash). Gemini Enterprise Agent Platform.
4. Google Cloud. [Developer's guide to Gemini 3.7 Flash](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/guides/gemini-3-7-flash).
5. Google Cloud. [Thinking](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/thinking).
6. Google DeepMind. [Gemini 3.7 Flash evals methodology](https://deepmind.google/models/evals-methodology/gemini-3-7-flash).
7. Google DeepMind. (2026-08). [Gemini 3.7 Flash Frontier Safety Framework Report](https://storage.googleapis.com/deepmind-media/gemini/gemini_3-7_flash_fsf_report.pdf).
8. Google DeepMind. (2026-07-21). [Gemini 3.6 Flash model card](https://deepmind.google/models/model-cards/gemini-3-6-flash/). 只读前任，不建夹。
9. Google DeepMind. [Frontier safety](https://deepmind.google/frontier-safety/). FSF 版本入口（v3.1 = 17 Apr 2026）。
