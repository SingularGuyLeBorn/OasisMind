---
title: "Qwen3.6 · 对照译稿"
category: "模型库"
tags: ["Qwen", "对照译稿"]
published: true
excerpt: "Qwen3.6 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 28 -->



( Alibaba Cloud

[  Cart](https://cart.alibabacloud.com/) [Log In](https://account-intl.aliyun.com/login/login.htm?oauth_callback=https%3A%2F%2Fwww.alibabacloud.com%2Fblog%2Fqwen3-6-35b-a3b-agentic-coding-power-now-open-to-all_603043)

Community

社区

[Community](https://community.alibabacloud.com/)  [Blog](https://www.alibabacloud.com/blog/)  Qwen3.6-35B-A3B: Agentic Coding Power, Now Open to All

[Community](https://community.alibabacloud.com/)  [Blog](https://www.alibabacloud.com/blog/)  Qwen3.6-35B-A3B: Agentic Coding Power, Now Open to All

# Qwen3.6-35B-A3B: Agentic Coding Power, Now Open to All

[Alibaba Cloud Community](https://community.alibabacloud.com/users/5337701737861729)

April 17, 2026

2026 年 4 月 17 日

![Image block](images/p01-54-816.png)

54,816

Alibaba open-sources Qwen3.6-35B-A3B, an efficient 35B/3B MoE model delivering toptier agentic coding and multimodal performance.

阿里开源 Qwen3.6-35B-A3B，这是一款高效的 35B 总参 / 3B 激活 MoE 模型，主打顶尖级 agentic coding 与多模态表现。

## Qwen3.6-35B-A3B

Open-Source Release

开源发布

Agentic Coding

Ultimate Inference Efficiency

极致推理效率

![Image block](images/p01-improved-multimodality-capabilities.png)

Improved Multimodality Capabilities

多模态能力提升

Reliable for Developers

对开发者可靠

Following the launch of [Qwen3.6-Plus](https://qwen.ai/blog?id=qwen3.6), we are excited to open-source **Qwen3.6-35B-A3B** — a sparse yet remarkably capable mixture-of-experts (MoE) model with 35 billion total parameters and only 3 billion active parameters. Despite its efficiency, Qwen3.6-35B-A3B delivers outstanding agentic coding performance, surpassing its predecessor Qwen3.5-35B-A3B by a wide margin and rivaling much larger dense models such as Qwen3.5-27B and Gemma4-31B. Still supporting both multimodal thinking and non-thinking modes, Qwen3.6-35B-A3B works as one of the most versatile open-source models available today. Now, Qwen3.6-35B-A3B is live on Qwen Studio, available through our API, and released as open weights for the community.

继 [Qwen3.6-Plus](https://qwen.ai/blog?id=qwen3.6) 发布之后，我们开源 **Qwen3.6-35B-A3B** — 稀疏却能力突出的 MoE 模型，总参 35B，激活仅 3B. 尽管很省，它的 agentic coding 表现突出，大幅超过前代 Qwen3.5-35B-A3B，并能与更大的稠密模型如 Qwen3.5-27B 与 Gemma4-31B 抗衡。仍同时支持多模态 thinking 与 non-thinking 模式，是目前最通用的开源模型之一。现已上线 Qwen Studio，可通过 API 调用，并向社区放出开放权重。

![Image block](images/p01-image.png)

> **想：** 文首 「surpassing its predecessor Qwen3.5-35B-A3B by a wide margin」 与同页后文 Language 表里 SWE-bench Verified 的 73.4 vs 前代 70.0，以及相对稠密 Qwen3.5-27B 的 75.0，是否同一口径的 「大幅超过」？
> 不是。文首 slogan 把 「wide margin」 绑在 predecessor Qwen3.5-35B-A3B；Language 表 SWE-bench Verified 一格是 73.4 对前代 70.0 (+3.4)，但对齐稠密 27B 的 75.0 仍低 1.6。「大幅」 更应落到 Terminal-Bench2.0 的 51.5 vs 40.5，SkillsBench Avg5 的 28.7 vs 4.4，QwenWebBench 的 1397 vs 978 等 agentic 格，而不是把 Verified 单格读成全面碾压 27B。

<!-- page 2 of 28 -->

![Image block](images/p02-qwen3-6-35b-a3b-is-a-fully-open-source-moe-model-35b.png)

**Qwen3.6-35B-A3B** is a fully open-source MoE model (35B total / 3B active), featuring:

**Qwen3.6-35B-A3B** 是完全开源的 MoE 模型（35B 总参 / 3B 激活），特点包括：

exceptional agentic coding capability competitive with much larger models

agentic coding 能力突出，可与更大许多的模型竞争

strong multimodal perception and reasoning ability

多模态感知与推理能力强

You can chat interactively on [Qwen Studio](https://chat.qwen.ai/), call via API as Qwen3.6-Flash on [Alibaba Cloud Model Studio API](https://modelstudio.alibabacloud.com/) (coming soon), or download weights from [Hugging Face](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) and [ModelScope](https://modelscope.cn/models/Qwen/Qwen3.6-35B-A3B).

可在 [Qwen Studio](https://chat.qwen.ai/) 交互聊天，以 Qwen3.6-Flash 之名调用 [Alibaba Cloud Model Studio API](https://modelstudio.alibabacloud.com/)（即将上线），或从 [Hugging Face](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) 与 [ModelScope](https://modelscope.cn/models/Qwen/Qwen3.6-35B-A3B) 下载权重。

![Chart block](images/p02-chart.png)

![Chart block](images/p02-chart-2.png)

![Chart block](images/p02-chart-3.png)

![Chart block](images/p02-chart-4.png)

![Chart block](images/p02-chart-5.png)

![Chart block](images/p02-chart-6.png)

![Chart block](images/p02-chart-7.png)

![Chart block](images/p02-chart-8.png)

![Chart block](images/p02-chart-9.png)

![Chart block](images/p02-chart-10.png)

![Chart block](images/p02-chart-11.png)

![Chart block](images/p02-performance.png)

## Performance 表现

Below we present comprehensive evaluations of Qwen3.6-35B-A3B against peer-scale models across a wide range of tasks and modalities.

下面给出 Qwen3.6-35B-A3B 相对同规模对照模型，覆盖多任务与多模态的综合评测。

### Language 语言

With only 3B active parameters, Qwen3.6-35B-A3B outperforms the dense 27Bparameter Qwen3.5-27B on several key coding benchmarks and dramatically surpasses its direct predecessor Qwen3.5-35B-A3B, especially on agentic coding and reasoning tasks.

仅 3B 激活参数时，Qwen3.6-35B-A3B 在若干关键 coding 基准上超过稠密 27B 的 Qwen3.5-27B，并大幅超过直接前代 Qwen3.5-35B-A3B，尤其在 agentic coding 与推理任务上。

|  | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
| --- | --- | --- | --- | --- | --- |
| Coding Agent |  |  |  |  |  |
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |

> **看表：** Language 段声称 「outperforms the dense 27B ... on several key coding benchmarks」，表里第一格 SWE-bench Verified 73.4 是否已经超过 27B 的 75.0?
> 没有。本页表断在 Verified 一行：Qwen3.6-35B-A3B 73.4 < Qwen3.5-27B 75.0。「several key」 要翻到 page 3 的 Terminal-Bench2.0 (51.5 > 41.6), SkillsBench Avg5 (28.7 > 27.2), NL2Repo (29.4 > 27.3), QwenWebBench (1397 > 1068) 等格；不能把 Verified 当成已赢 27B 的证据。

<!-- page 3 of 28 -->

|  | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
| --- | --- | --- | --- | --- | --- |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench2.0 | 41.6 | 42.9 | 40.5 | 34.2 | 51.5 |
| Claw-Eval <sub>Avg</sub> | 64.3 | 48.5 | 65.4 | 58.8 | 68.7 |
| Claw-Eval <sub>Pass</sub>^<sub>3</sub> | 46.2 | 25.0 | 51.0 | 28.0 | 50.0 |
| SkillsBench <sub>Avg5</sub> | 27.2 | 23.6 | 4.4 | 12.3 | 28.7 |
| QwenClawBench | 52.2 | 41.7 | 47.7 | 38.7 | 52.6 |
| NL2Repo | 27.3 | 15.5 | 20.5 | 11.6 | 29.4 |
| QwenWebBench | 1068 | 1197 | 978 | 1178 | 1397 |
| General Agent |  |  |  |  |  |
| TAU3-Bench | 68.4 | 67.5 | 68.9 | 59.0 | 67.2 |
| VITA-Bench | 41.8 | 43.0 | 29.1 | 36.9 | 35.6 |
| DeepPlanning | 22.6 | 24.0 | 22.8 | 16.2 | 25.9 |
| Tool Decathlon | 31.5 | 21.2 | 28.7 | 12.0 | 26.9 |
| MCPMark | 36.3 | 18.1 | 27.0 | 14.2 | 37.0 |
| MCP-Atlas | 68.4 | 57.2 | 62.4 | 50.0 | 62.8 |
| WideSearch | 66.4 | 35.2 | 59.1 | 38.3 | 60.1 |
| Knowledge |  |  |  |  |  |
| MMLU-Pro | 86.1 | 85.2 | 85.3 | 82.6 | 85.2 |
| MMLU-Redux | 93.2 | 93.7 | 93.3 | 92.7 | 93.3 |
| SuperGPQA | 65.6 | 65.7 | 63.4 | 61.4 | 64.7 |
| C-Eval | 90.5 | 82.6 | 90.2 | 82.5 | 90.0 |
| STEM &amp; Reasoning |  |  |  |  |  |
| GPQA | 85.5 | 84.3 | 84.2 | 82.3 | 86.0 |
| HLE | 24.3 | 19.5 | 22.4 | 8.7 | 21.4 |

> **核对：** Claw-Eval Pass^3 相对前代是升还是降？和 Avg 方向是否一致？
> Pass^3 从 Qwen3.5-35B-A3B 的 51.0 降到 50.0，而 Avg 从 65.4 升到 68.7。同基准两列不同步：平均分抬了，三次全过的更严口径反而掉 1.0。选型时不能只背 Avg。

> **问：** General Agent 组里，「大幅超过前代」 是否覆盖 TAU3-Bench / Tool Decathlon?
> 不覆盖。TAU3-Bench 67.2 < 前代 68.9；Tool Decathlon 26.9 < 前代 28.7. WideSearch 60.1 > 59.1 仅微升。前代优势叙事主要落在 Coding Agent 与部分 MCP/DeepPlanning，不是 General Agent 全绿。

<!-- page 4 of 28 -->

\* QwenWebBench: An internal front-end code generation benchmark; bilingual (EN/CN) 7 categories (Web Design, Web Apps, Games, SVG, Data Visualization, Animation, and 3D); auto-render + multimodal judge (code/visual correctness); BT/Elo rating system. \* TAU3-Bench: We use the official user model (gpt-5.2, low reasoning effort) + default BM25 retrieval.

\* QwenWebBench：内部前端代码生成基准；中英双语，7 类（Web Design, Web Apps, Games, SVG, Data Visualization, Animation, 3D）；自动渲染 + 多模态裁判（代码/视觉正确性）；BT/Elo 评分。\* TAU3-Bench：使用官方用户模型（gpt-5.2, low reasoning effort）+ 默认 BM25 检索。

|  | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
| --- | --- | --- | --- | --- | --- |
| LiveCodeBenchv6 | 80.7 | 80.0 | 74.6 | 77.1 | 80.4 |
| HMMT Feb 25 | 92.0 | 88.7 | 89.0 | 91.7 | 90.7 |
| HMMT Nov 25 | 89.8 | 87.5 | 89.2 | 87.5 | 89.1 |
| HMMT Feb 26 | 84.3 | 77.2 | 78.7 | 79.0 | 83.6 |
| IMOAnswerBench | 79.9 | 74.5 | 76.8 | 74.3 | 78.9 |
| AIME26 | 92.6 | 89.2 | 91.0 | 88.3 | 92.7 |

\* SWE-Bench Series: Internal agent scaffold (bash + file-edit tools); temp=1.0, top\_p=0.95, 200K context window. We correct some problematic tasks in the public set of SWE-bench Pro and evaluate all baselines on the refined benchmark.

\* Terminal-Bench 2.0: Harbor/Terminus-2 harness; 3h timeout, 32 CPU/48 GB RAM; temp=1.0, top\_p=0.95, top\_k=20, max\_tokens=80K, 256K ctx; avg of 5 runs.

\* SkillsBench: Evaluated via OpenCode on 78 tasks (self-contained subset, excluding API-dependent tasks); avg of 5 runs.

\* NL2Repo: Others are evaluated via Claude Code (temp=1.0, top\_p=0.95, max\_turns=900).

\* QwenClawBench: An internal real-user-distribution Claw agent benchmark (open-sourcing soon); temp=0.6, 256K ctx.

\* VITA-Bench: Avg subdomain scores; using claude-4-sonnet as judger, as the official judger (claude-3.7-sonnet) is no longer available.

\* MCPMark: GitHub MCP v0.30.3; Playwright responses truncated at 32K tokens.

\* MCP-Atlas: Public set score; gemini-2.5-pro judger.

\* AIME 26: We use the full AIME 2026 (I & II), where the scores may differ from Qwen 3.5 notes.

\* SWE-Bench 系列：内部 agent scaffold（bash + 文件编辑工具）；temp=1.0，top_p=0.95, 200K 上下文。对公开 SWE-bench Pro 中部分有问题的任务做了修正，并在 refined 基准上评全部基线。

\* Terminal-Bench 2.0: Harbor/Terminus-2 harness；超时 3h，32 CPU/48 GB RAM；temp=1.0，top_p=0.95，top_k=20，max_tokens=80K，256K ctx；5 次平均。

\* SkillsBench：经 OpenCode 评 78 题（自包含子集，排除依赖 API 的题）；5 次平均。

\* NL2Repo：其余模型经 Claude Code 评测（temp=1.0, top_p=0.95, max_turns=900）。

\* QwenClawBench：内部真实用户分布的 Claw agent 基准（即将开源）；temp=0.6, 256K ctx.

\* VITA-Bench：子域平均分；裁判用 claude-4-sonnet，因官方裁判（claude-3.7-sonnet）已不可用。

\* MCPMark: GitHub MCP v0.30.3；Playwright 响应截断到 32K tokens。

\* MCP-Atlas：公开集分数；裁判为 gemini-2.5-pro。

\* AIME 26：使用完整 AIME 2026 (I & II)，分数可能与 Qwen 3.5 笔记不同。

Vision Language

视觉语言

Qwen3.6 is natively multimodal, and Qwen3.6-35B-A3B showcases perception and multimodal reasoning capabilities that far exceed what its size would suggest, with only around 3 billion activated parameters. Across most vision-language benchmarks, its performance matches Claude Sonnet 4.5, and even surpasses it on several tasks. Its strengths are particularly evident in spatial intelligence, where it achieves 92.0 on RefCOCO and 50.8 on ODInW13.

Qwen3.6 原生多模态；Qwen3.6-35B-A3B 在约 3B 激活参数下，感知与多模态推理远超体量直觉。多数视觉语言基准上表现对齐 Claude Sonnet 4.5，若干任务还更高。空间智能尤其突出：RefCOCO 92.0, ODInW13 50.8。

> **拆开：** NL2Repo 脚注只写 「Others are evaluated via Claude Code」，本模型自己的 harness 是否与对照列同构？
> 脚注不声明 Qwen3.6-35B-A3B 自身也走 Claude Code，只钉 「Others」。同表 NL2Repo 的 29.4 与对照列的可比性，取决于未写明的本侧 scaffold；不能默认整列共享 max_turns=900 的 Claude Code 设定。

> **确认：** AIME26 的 92.7 能否直接和 Qwen 3.5 notes 里的 AIME 数字横比？
> 不能直接横比。脚注写明使用 full AIME 2026 (I & II)，「scores may differ from Qwen 3.5 notes」。同表内各列是同一套 AIME26 口径；跨笔记到 3.5 旧数需要另核题集是否同为 I&II 全量。

<!-- page 5 of 28 -->

|  | Qwen3.5-27B | Claude-Sonnet-4.5 | Gemma4-31B | Gemma4-26BA4B | Qwen3.5-35B-A3B | Qwen3.6-35B-A3B |
| --- | --- | --- | --- | --- | --- | --- |
| STEM and Puzzle |  |  |  |  |  |  |
| MMMU | 82.3 | 79.6 | 80.4 | 78.4 | 81.4 | 81.7 |
| MMMU-Pro | 75.0 | 68.4 | 76.9* | 73.8* | 75.1 | 75.3 |
| Mathvista(mini) | 87.8 | 79.8 | 79.3 | 79.4 | 86.2 | 86.4 |
| ZEROBench_sub | 36.2 | 26.3 | 26.0 | 26.3 | 34.1 | 34.4 |
| General VQA |  |  |  |  |  |  |
| RealWorldQA | 83.7 | 70.3 | 72.3 | 72.2 | 84.1 | 85.3 |
| MMBench<sub>EN-DEV</sub>-v1.1 | 92.6 | 88.3 | 90.9 | 89.0 | 91.5 | 92.8 |
| SimpleVQA | 56.0 | 57.6 | 52.9 | 52.2 | 58.3 | 58.9 |
| HallusionBench | 70.0 | 59.9 | 67.4 | 66.1 | 67.9 | 69.8 |
| Text Recognition and Document Understanding |  |  |  |  |  |  |
| OmniDocBench1.5 | 88.9 | 85.8 | 80.1 | 74.4 | 89.3 | 89.9 |
| CharXiv(RQ) | 79.5 | 67.2 | 67.9 | 69.0 | 77.5 | 78.0 |
| CC-OCR | 81.0 | 68.1 | 75.7 | 74.5 | 80.7 | 81.9 |
| AI2D_TEST | 92.9 | 87.0 | 89.0 | 88.3 | 92.6 | 92.7 |
| Spatial Intelligence |  |  |  |  |  |  |
| RefCOCO(avg) | 90.9 | -- | -- | -- | 89.2 | 92.0 |
| ODInW13 | 41.1 | -- | -- | -- | 42.6 | 50.8 |
| EmbSpatialBench | 84.5 | 71.8 | -- | -- | 83.1 | 84.3 |
| RefSpatialBench | 67.7 | -- | -- | -- | 63.5 | 64.3 |
| Video Understanding |  |  |  |  |  |  |
| VideoMME(w sub.) | 87.0 | 81.1 | -- | -- | 86.6 | 86.6 |
| VideoMME(w/o sub.) | 82.8 | 75.3 | -- | -- | 82.5 | 82.5 |

> **回看：** 空间智能叙事点名 RefCOCO 92.0 与 ODInW13 50.8，Claude Sonnet 4.5 列为 「--」 时，「matches / surpasses Claude Sonnet 4.5」 能否落在这两格？
> 不能落在这两格。page 4 文案说多数 VL 基准对齐 Claude，若干任务超过；但 Spatial 组里 Claude 与 Gemma 对 RefCOCO/ODInW13 是空单元格。page 6 脚注：Empty cells (--) indicate scores not available or not applicable。用 92.0 / 50.8 声称超过 Claude，缺少同表对照分。

> **对一下：** VideoMME 有字幕 / 无字幕两行相对 Qwen3.5-35B-A3B 是否有增益？
> 无增益。两行都是 86.6 / 82.5，与前代完全相同；相对稠密 27B 的 87.0 / 82.8 还略低或持平。多模态 「far exceed what its size would suggest」 不能靠 VideoMME 这两格支撑代际跃迁。

<!-- page 6 of 28 -->

|  | Qwen3.5-27B | Claude-Sonnet-4.5 | Gemma4-31B | Gemma4-26BA4B | Qwen3.5-35B-A3B | Qwen3.6-35B-A3B |
| --- | --- | --- | --- | --- | --- | --- |
| VideoMMMU | 82.3 | 77.6 | 81.6 | 76.0 | 80.4 | 83.7 |
| MLVU | 85.9 | 72.8 | -- | -- | 85.6 | 86.2 |
| MVBench | 74.6 | -- | -- | -- | 74.8 | 74.6 |
| LVBench | 73.6 | -- | -- | -- | 71.4 | 71.4 |

\* Empty cells (--) indicate scores not available or not applicable.

\* 空单元格（--）表示分数不可用或不适用。

## Build with Qwen3.6-35B-A3B 使用 Qwen3.6-35B-A3B

Qwen3.6-35B-A3B is coming soon to Alibaba Cloud Model Studio. Please stand by until we are fully ready.

Qwen3.6-35B-A3B 即将登陆 Alibaba Cloud Model Studio。请等待我们完全就绪。

Qwen3.6-35B-A3B is available as open weights on [Hugging Face](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) and [ModelScope](https://modelscope.cn/models/Qwen/Qwen3.6-35B-A3B) for self-hosting, and through the [Alibaba Cloud Model Studio](https://modelstudio.alibabacloud.com/) API as qwen3.6-flash . You can also try it instantly on [Qwen Studio](https://chat.qwen.ai/).

开放权重可在 [Hugging Face](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) 与 [ModelScope](https://modelscope.cn/models/Qwen/Qwen3.6-35B-A3B) 自托管，并通过 [Alibaba Cloud Model Studio](https://modelstudio.alibabacloud.com/) API 以 qwen3.6-flash 调用。也可在 [Qwen Studio](https://chat.qwen.ai/) 立即试用。

The model can be seamlessly integrated with popular third-party coding assistants, including OpenClaw, Claude Code, and Qwen Code, to streamline development workflows and enable efficient, context-aware coding experiences.

可与 OpenClaw，Claude Code，Qwen Code 等第三方 coding 助手无缝集成，简化开发流程并提供高效，上下文感知的 coding 体验。

### API Usage API 用法

This release supports the preserve\_thinking feature: preserving thinking content from all preceding turns in messages, which is **recommended for agentic tasks**.

本发布支持 preserve_thinking：在 messages 中保留此前各轮的 thinking 内容，**建议用于 agentic 任务**。

#### Alibaba Cloud Model Studio

Alibaba Cloud Model Studio supports industry-standard protocols, including chat completions and responses APIs compatible with OpenAI’s specification, as well as an API interface compatible with Anthropic.

Alibaba Cloud Model Studio 支持业界标准协议，包括兼容 OpenAI 规范的 chat completions 与 responses API，以及兼容 Anthropic 的 API 接口。

Example code for chat completions API is provided below:

下面给出 chat completions API 示例代码：

```python
"""
Environment variables (per official docs):
  DASHSCOPE_API_KEY: Your API Key from https://modelstudio.console.alibabacloud.co
  DASHSCOPE_BASE_URL: (optional) Base URL for compatible-mode API.
    - Beijing: https://dashscope.aliyuncs.com/compatible-mode/v1
    - Singapore: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
    - US (Virginia): https://dashscope-us.aliyuncs.com/compatible-mode/v1
  DASHSCOPE_MODEL: (optional) Model name; override for different models.
```

> **停一下：** 权重名是 Qwen3.6-35B-A3B，API 默认模型字符串却是 qwen3.6-flash，二者是否同一交付物？
> 按 page 2 / page 6 文案，API 侧以 Qwen3.6-Flash / `qwen3.6-flash` 暴露本权重；Hugging Face / ModelScope 下载名仍是 `Qwen/Qwen3.6-35B-A3B`。选型时要按通道区分显示名与仓库名，不要把 Flash 误当成另一套更小激活参 SKU。

<!-- page 7 of 28 -->

```python
from openai import OpenAI
import os

api_key = os.environ.get("DASHSCOPE_API_KEY")
if not api_key:
    raise ValueError(
        "DASHSCOPE_API_KEY is required."
        "Set it via: export DASHSCOPE_API_KEY='your-api-key'"
    )

client = OpenAI(
    api_key=api_key,
    base_url=os.environ.get(
        "DASHSCOPE_BASE_URL",
        "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    ),
    )

messages = [{"role": "user", "content": "Introduce vibe coding."}

model = os.environ.get(
    "DASHSCOPE_MODEL",
    "qwen3.6-flash",
)
completion = client.chat.completions.create(
    model=model,
    messages=messages,
    extra_body={
        "enable_thinking": True,
        # "preserve_thinking": True,
    },
    stream=True
)

reasoning_content = ""  # Full reasoning trace
answer_content = ""  # Full response
is_answering = False  # Whether we have entered the answer phase
print("\n" + "=" * 20 + "Reasoning" + "=" * 20 + "\n")

for chunk in completion:
    if not chunk.choices:
        print("\nUsage:")
        print(chunk.usage)
        continue

    delta = chunk.choices[0].delta

    # Collect reasoning content only
    if hasattr(delta, "reasoning_content") and delta.reasoning_content is not None
        if not is_answering:
            print(delta.reasoning_content, end="", flush=True)
        reasoning_content += delta.reasoning_content
```

> **再看：** API Usage 正文推荐 agentic 打开 preserve_thinking，示例 extra_body 却把 preserve_thinking 注释掉，只开 enable_thinking=True，哪句是部署默认？
> 正文（page 6）写 preserve_thinking **recommended for agentic tasks**；示例把 `"preserve_thinking": True` 注释掉，仅 `enable_thinking: True`。可运行样例不等于 agentic 推荐配置；多轮 agent 应按正文打开 preserve，而不是照抄注释状态。

<!-- page 8 of 28 -->

```python
# Received content, start answer phase
if hasattr(delta, "content") and delta.content:
    if not is_answering:
        print("\n" + "=" * 20 + "Answer" + "=" * 20 + "\n")
        is_answering = True
    print(delta.content, end="", flush=True)
    answer_content += delta.content
```

For more information, please visit the [API doc](https://modelstudio.console.alibabacloud.com/?tab=doc#/doc/?type=model&url=2840915).

更多信息见 [API doc](https://modelstudio.console.alibabacloud.com/?tab=doc#/doc/?type=model&url=2840915)。

### Coding & Agents Coding 与 Agents

Qwen3.6-35B-A3B features excellent agentic coding capabilities and can be seamlessly integrated into popular third-party coding assistants, including OpenClaw, Claude Code, and Qwen Code.

Qwen3.6-35B-A3B 具备出色的 agentic coding 能力，可无缝接入 OpenClaw，Claude Code，Qwen Code 等第三方 coding 助手。

#### OpenClaw

Qwen3.6-35B-A3B is compatible with [OpenClaw](https://openclaw.ai/) (formerly Moltbot / Clawdbot), a self hosted open-source AI coding agent. Connect it to [Model Studio](https://www.alibabacloud.com/help/en/model-studio/openclaw) to get a full agentic coding experience in the terminal. Get started with the following script:

Qwen3.6-35B-A3B 兼容 [OpenClaw](https://openclaw.ai/)（前身 Moltbot / Clawdbot），自托管开源 AI coding agent。接到 [Model Studio](https://www.alibabacloud.com/help/en/model-studio/openclaw) 即可在终端获得完整 agentic coding 体验。启动脚本如下：

```shell
# Node.js 22+
curl -fsSL https://molt.bot/install.sh | bash    # macOS / Linux

# Set your API key
export DASHSCOPE_API_KEY=<your_api_key>

# Launch OpenClaw
openclaw dashboard # web browser
# openclaw tui # Open a new terminal and start the TUI
```

On first use, edit \~/.openclaw/openclaw.json to point OpenClaw at Model Studio. Find or create the following fields and merge them — **do not overwrite the entire file** to preserve your existing settings:

首次使用请编辑 ~/.openclaw/openclaw.json，指向 Model Studio。查找或创建下列字段并合并 — **不要整文件覆盖**，以免丢掉已有设置：

```txt
{
  "models": {
    "mode": "merge",
    "providers": {
      "modelstudio": {
        "baseUrl": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
        "apiKey": "DASHSCOPE_API_KEY",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen3.6-flash",
            "name": "qwen3.6-flash",
```

<!-- page 9 of 28 -->

```json
"reasoning": true,
        "input": ["text", "image"],
        "contextWindow": 131072,
        "maxTokens": 16384
    }
]
}
},
"agents": {
"defaults": {
"model": {
"primary": "modelstudio/qwen3.6-flash"
},
"models": {
"modelstudio/qwen3.6-flash": {}
}
}
}
}
```

> **想：** OpenClaw 配置里 contextWindow=131072，而 SWE-Bench 脚注用 200K context window，评测与推荐集成配置是否同一上下文上限？
> 不是同一上限。page 4 SWE-Bench Series 脚注写 200K context window；OpenClaw 示例 `contextWindow`: 131072 (~128K)。榜分不是在 OpenClaw 默认 131072 配置下测出的；复现 SWE 数字要按脚注 scaffold + 200K，不能拿 OpenClaw JSON 当评测复现单。

#### Qwen Code

Qwen3.6-35B-A3B is compatible with [Qwen Code](https://qwen.ai/qwencode), an open-source AI agent designed for the terminal and deeply optimized for the Qwen Series. Get started with the following script:

Qwen3.6-35B-A3B 兼容 [Qwen Code](https://qwen.ai/qwencode)，面向终端，为 Qwen 系列深度优化的开源 AI agent。启动脚本如下：

```txt
# Node.js 20+
npm install -g @qwen-code/qwen-code@latest

# Start Qwen Code (interactive)
qwen

# Then, in the session:
/help
/auth
```

On first use, you’ll be prompted to sign in. You can run /auth anytime to switch authentication methods.

首次使用会提示登录。可随时运行 /auth 切换鉴权方式。

#### Claude Code

Qwen APIs also support the Anthropic API protocol, meaning you can use it with tools like **Claude Code** for elevated coding experience:

Qwen API 也支持 Anthropic API 协议，因此可用 **Claude Code** 等工具获得更高阶 coding 体验：

```shell
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Configure environment
```

<!-- page 10 of 28 -->

```shell
export ANTHROPIC_MODEL="qwen3.6-flash"
export ANTHROPIC_SMALL_FAST_MODEL="qwen3.6-flash"
export ANTHROPIC_BASE_URL=https://dashscope-intl.aliyuncs.com/apps/anthropic
export ANTHROPIC_AUTH_TOKEN=<your_api_key>

# Launch the CLI
claude
```

## Summary 总结

Qwen3.6-35B-A3B demonstrates that sparse MoE models can achieve remarkable agentic coding and reasoning capability. With only 3B active parameters, it delivers performance that rivals dense models several times its active size, while also excelling across multimodal benchmarks. As a fully open-source checkpoint, it sets a new standard for what’s possible at its scale.

Qwen3.6-35B-A3B 证明稀疏 MoE 模型也能具备出色的 Agentic coding 与推理能力：仅 3B 激活参数，性能可对标激活量大几倍的 dense 模型，多模态基准同样出色。作为完全开源的 checkpoint，它为这一规模树立了新标杆。

Looking ahead, we will continue to expand the Qwen3.6 open-source family and push the boundaries of what efficient, open models can accomplish. We are grateful for the community’s feedback and look forward to seeing what you build with Qwen3.6-35B-A3B. Also, Qwen3.6 open-source family keeps expanding, stay tuned for our future releases!

未来我们将继续扩充 Qwen3.6 开源家族，拓展高效开源模型的能力边界。感谢社区的反馈，期待看到大家用 Qwen3.6-35B-A3B 构建的作品；开源家族仍在持续扩充，请继续关注后续发布。

## Citation 引用

Feel free to cite the following article if you find Qwen3.6-35B-A3B helpful:

```bib
@misc{qwen36_35b_a3b,
    title = {{Qwen3.6-35B-A3B}: Agentic Coding Power, Now Open to All},
    url = {https://qwen.ai/blog?id=qwen3.6-35b-a3b},
    author = {{Qwen Team}},
    month = {April},
    year = {2026}
}
```

[Artificial Intelligence](https://community.alibabacloud.com/tags/type_blog-tagid_16441/)

[Developers](https://community.alibabacloud.com/tags/type_blog-tagid_16445/)

[Generative AI](https://community.alibabacloud.com/tags/type_blog-tagid_36033/)

[Alibaba Cloud Model Studio](https://community.alibabacloud.com/tags/type_blog-tagid_37001/)

[Model Studio](https://community.alibabacloud.com/tags/type_blog-tagid_37002/)

[Agentic AI](https://community.alibabacloud.com/tags/type_blog-tagid_39148/)

[Coding agents](https://community.alibabacloud.com/tags/type_blog-tagid_39790/)

[Qwen3.6-35B-A3B](https://community.alibabacloud.com/tags/type_blog-tagid_39833/)

[Qwen Studio](https://community.alibabacloud.com/tags/type_blog-tagid_39834/)

Share on



<!-- page 11 of 28 -->

## Read previous post：上一篇

[Alibaba Open-sources Qwen3.6-35B-A3B; Wan2.7 Tops Design Arena](https://www.alibabacloud.com/blog/alibaba-open-sources-qwen3-6-35b-a3b-wan2-7-tops-design-arena_603042)

## You may also like 你可能还喜欢

[Alibaba Open-sources Qwen3.6-35B-A3B; Wan2.7 Tops Design Arena](https://www.alibabacloud.com/blog/alibaba-open-sources-qwen3-6-35b-a3b-wan2-7-tops-design-arena_603042) Alibaba Cloud Community - April 17, 2026

[What We Learned from Evaluating 4,050 Agent Runs](https://www.alibabacloud.com/blog/what-we-learned-from-evaluating-4050-agent-runs_603332) Alibaba Cloud Community - July 6, 2026

[Qwen-AgentWorld: Language World Models for General Agents](https://www.alibabacloud.com/blog/qwen-agentworld-language-world-models-for-general-agents_603304) Alibaba Cloud Community - June 25, 2026

## Comments 评论

Write your comment...

写下你的评论...

[Alibaba Launches HappyOyster, a World Model Product for Real-Time Immersive Creation and Interaction](https://www.alibabacloud.com/blog/alibaba-launches-happyoyster-a-world-model-product-for-real-time-immersive-creation-and-interaction_603048)

## Read next post：下一篇

[Qwen3.6-27B: Flagship-Level Coding in a 27B Dense Model](https://www.alibabacloud.com/blog/qwen3-6-27b-flagship-level-coding-in-a-27b-dense-model_603063)

Alibaba Cloud Community - April 24, 2026

[Qwen3 Undertakes Chatbot Arena Top 3; Compact Qwen3-30B Series Launches for Efficient AI Development](https://www.alibabacloud.com/blog/qwen3-undertakes-chatbot-arena-top-3-compact-qwen3-30b-series-launches-for-efficient-ai-development_602444)

Alibaba Cloud Community - August 8, 2025

[Speculative Decoding: Turning LLM Inference from One-Token-at-a-Time into a Systems Optimization Problem](https://www.alibabacloud.com/blog/speculative-decoding-turning-llm-inference-from-one-token-at-a-time-into-a-systems-optimization-problem_603538)

Farruh - September 9, 2026

Post

发布

![Image block](images/p11-image.png)

<!-- page 12 of 28 -->

![Image block](images/p12-image.png)

![Image block](images/p12-see-all-https-community-alibabacloud-com-users.png)

[See All](https://community.alibabacloud.com/users/5337701737861729/article)

一

[Alibaba Cloud Community](https://community.alibabacloud.com/users/5337701737861729) 1,543 posts | 517 followers

Follow

关注

Related Products

相关产品

## [Alibaba Cloud Model Studio](https://community.alibabacloud.com/go/1/473)

A one-stop generative AI platform to build intelligent applications that understand your business, based on Qwen model series such as Qwen-Max and other popular models

一站式生成式 AI 平台，基于 Qwen-Max 等 Qwen 系列与其他流行模型，构建理解你业务的智能应用

[Learn More](https://community.alibabacloud.com/go/1/473)

了解更多

## 心 [QwenWork](https://community.alibabacloud.com/go/1/481)

QwenWork is dedicated to helping employees strengthen their professional competitiveness in the AI era and to enabling enterprises to improve organizational effectiveness.

QwenWork 致力于帮助员工在 AI 时代提升职业竞争力，并助力企业提高组织效能。

[Learn More](https://community.alibabacloud.com/go/1/481)

了解更多

## [Token Plan](https://community.alibabacloud.com/go/1/480)

Build more, spend less. One plan, every modality.

少花钱多做事。一个计划，覆盖各模态。

[Learn More](https://community.alibabacloud.com/go/1/480)

了解更多

## [Qwen](https://community.alibabacloud.com/go/1/472)

![Image block](images/p12-full-range-open-source-multimodal-and-multi-functional.png)

Full-range, open-source, multimodal, and multi-functional

全系列，开源，多模态，多功能

[Learn More](https://community.alibabacloud.com/go/1/472)

了解更多

More Posts by Alibaba …

更多阿里文章 …

<!-- page 13 of 28 -->

[AliViews: Eddie Wu Shares Alibaba's Strategic Full-Stack AI Roadmap at the 2026 Apsara Conference](https://www.alibabacloud.com/blog/aliviews-eddie-wu-shares-alibabas-strategic-full-stack-ai-roadmap-at-the-2026-apsara-conference_603595)

[Alibaba Cloud Expands Global Infrastructure and AI Portfolio to Accelerate Enterprise AI Adoption](https://www.alibabacloud.com/blog/alibaba-cloud-expands-global-infrastructure-and-ai-portfolio-to-accelerate-enterprise-ai-adoption_603594)

[Alibaba Unveils Roadmap on Full-Stack AI Strategy from Chips, Cloud Infrastructure, Models to Agents](https://www.alibabacloud.com/blog/alibaba-unveils-roadmap-on-full-stack-ai-strategy-from-chips-cloud-infrastructure-models-to-agents_603589)

[Qwen-Image-2.1: Compact, Efficient, and Unified Image Creation](https://www.alibabacloud.com/blog/qwen-image-2-1-compact-efficient-and-unified-image-creation_603586)

[Qwen3.8-LiveTranslate: Names the Speaker. Carries the Meaning.](https://www.alibabacloud.com/blog/qwen3-8-livetranslate-names-the-speaker--carries-the-meaning-_603581)

[Qwen3.8-Omni-Flash: Omni Senses. Agentic Delivery.](https://www.alibabacloud.com/blog/qwen3-8-omni-flash-omni-senses--agentic-delivery-_603580)

[Alibaba Cloud Named a Leader in Gartner® Magic Quadrant™ for Generative AI Model Providers](https://www.alibabacloud.com/blog/alibaba-cloud-named-a-leader-in-gartner%C2%AE-magic-quadrant%E2%84%A2-for-generative-ai-model-providers_603574)

[Choosing the Right Model for Your Work: A Guide to the Qwen Series](https://www.alibabacloud.com/blog/choosing-the-right-model-for-your-work-a-guide-to-the-qwen-series_603566)

[為你的工作選對模型：以 Qwen 系列為例](https://www.alibabacloud.com/blog/%E7%82%BA%E4%BD%A0%E7%9A%84%E5%B7%A5%E4%BD%9C%E9%81%B8%E5%B0%8D%E6%A8%A1%E5%9E%8B%EF%BC%9A%E4%BB%A5-qwen-%E7%B3%BB%E5%88%97%E7%82%BA%E4%BE%8B_603565)

[Still Running Your Own Hive Metastore? Point Spark Straight at OSS Tables and Iceberg Just Works 
$$
OSS Tables Deep Dive
$$
](https://www.alibabacloud.com/blog/still-running-your-own-hive-metastore-point-spark-straight-at-oss-tables-and-iceberg-just-works-oss-tables-deep-dive_603557)

## A Free Trial That Lets You Build Big! 让你大胆构建的免费试用！

Start building with 80+ products and up to 12 months usage for Elastic Compute Service

从 80+ 产品起步，Elastic Compute Service 最长可用约 12 个月

[Get Started for Free](https://www.alibabacloud.com/campaign/free-trial/enterprise)

免费开始

<!-- page 14 of 28 -->

![Image block](images/p14-alibaba-cloud.png)

\- Alibaba Cloud

[  Cart](https://cart.alibabacloud.com/) [Log In](https://account-intl.aliyun.com/login/login.htm?oauth_callback=https%3A%2F%2Fwww.alibabacloud.com%2Fblog%2F603063)

Community

社区

[Community](https://community.alibabacloud.com/)  [Blog](https://www.alibabacloud.com/blog/)  Qwen3.6-27B: Flagship-Level Coding in a 27B Dense Model

# Qwen3.6-27B: Flagship-Level Coding in a 27B Dense Model

[Alibaba Cloud Community](https://community.alibabacloud.com/users/5337701737861729)

April 24, 2026

2026 年 4 月 24 日

40,846

Following the launch of Qwen3.6-Plus and Qwen3.6-35B-A3B, we are excited to open-source Qwen3.6-27B.

继 Qwen3.6-Plus 与 Qwen3.6-35B-A3B 发布后，我们开源 Qwen3.6-27B。

## Qwen3.6-27B Open Source Release Qwen3.6-27B 开源发布

Agentic Coding

![Image block](images/p14-lower-vram-usage.png)

Lower VRAM usage

更低显存占用

Improved Multimodality Capabilities

多模态能力提升

Following the launch of [Qwen3.6-Plus](https://qwen.ai/blog?id=qwen3.6) and [Qwen3.6-35B-A3B](https://qwen.ai/blog?id=qwen3.6-35b-a3b), we are excited to open-source **Qwen3.6-27B** — a dense 27-billion-parameter multimodal model at the scale the community has been asking for most. Still supporting both multimodal thinking and non-thinking modes, Qwen3.6-27B delivers flagship level agentic coding performance, **surpassing the previous-generation open-source flagship Qwen3.5-397B-A17B** (397B total / 17B active MoE) across all major coding benchmarks. As a dense architecture, it is straightforward to

继 [Qwen3.6-Plus](https://qwen.ai/blog?id=qwen3.6) 与 [Qwen3.6-35B-A3B](https://qwen.ai/blog?id=qwen3.6-35b-a3b) 之后，我们开源 **Qwen3.6-27B** — 社区最常要的 27B 稠密多模态规模。仍同时支持多模态 thinking 与 non-thinking 模式，并给出旗舰级 agentic coding 表现，**在全部主要 coding 基准上超过上一代开源旗舰 Qwen3.5-397B-A17B**（397B 总参 / 17B 激活 MoE）。作为稠密架构，它便于

> **核对：** 「across all major coding benchmarks」 压过 397B-A17B，是否包含 Knowledge / STEM 全表？
> 口号钉的是 major **coding** benchmarks. page 16 表里 SWE-bench Verified 77.2 > 76.2, Pro 53.5 > 50.9, Multilingual 71.3 > 69.3，Terminal-Bench 2.0 59.3 > 52.5，SkillsBench 48.2 > 30.0 等 coding 格成立；但 Knowledge 的 SuperGPQA 66.0 < 70.4，STEM 的 HLE 24.0 < 28.7。不要把 「all major coding」 扩读成整张 Language 表全赢。

<!-- page 15 of 28 -->

![Chart block](images/p15-chart.png)

![Chart block](images/p15-qwenwebbench-elo-rating.png)

QwenWebBench (Elo Rating)

Claw-Eval (pass^3)

SWE-bench Pro

![Chart block](images/p15-chart-2.png)

![Chart block](images/p15-chart-3.png)

![Chart block](images/p15-deploy-without-moe-routing-complexity-making-it-an.png)

deploy without MoE routing complexity, making it an ideal choice for developers who need top-tier coding capabilities at a practical, widelydeployable scale. Qwen3.6-27B is now live on Qwen Studio, available through our API, and released as open weights for the community.

部署，无需 MoE 路由复杂度，适合要在可广泛部署的规模上拿到顶尖 coding 能力的开发者。Qwen3.6-27B 现已上线 Qwen Studio，可通过 API 调用，并向社区放出开放权重。

**Qwen3.6-27B** is a fully open-source dense model (27B parameters), featuring:

**Qwen3.6-27B** 是完全开源的稠密模型（27B 参数），特点包括：

flagship-level agentic coding that surpasses Qwen3.5-397B-A17B

旗舰级 agentic coding，超过 Qwen3.5-397B-A17B

strong text and multimodal reasoning ability

强文本与多模态推理能力

You can chat interactively on [Qwen Studio](https://chat.qwen.ai/), call via API on [Alibaba Cloud Model Studio API](https://int.alibabacloud.com/m/1000411739/) (coming soon), or download weights from [Hugging Face](https://huggingface.co/Qwen/Qwen3.6-27B) and [ModelScope](https://modelscope.cn/models/Qwen/Qwen3.6-27B).

可在 [Qwen Studio](https://chat.qwen.ai/) 交互聊天，经 [Alibaba Cloud Model Studio API](https://int.alibabacloud.com/m/1000411739/) 调用（即将上线），或从 [Hugging Face](https://huggingface.co/Qwen/Qwen3.6-27B) 与 [ModelScope](https://modelscope.cn/models/Qwen/Qwen3.6-27B) 下载权重。

![Chart block](images/p15-swe-bench-verified.png)

SWE-bench Verified

SWE-bench Multilingual Multilingual Agentic Coding

![Chart block](images/p15-chart-4.png)

![Chart block](images/p15-chart-5.png)

![Chart block](images/p15-chart-6.png)

![Chart block](images/p15-chart-7.png)

![Chart block](images/p15-chart-8.png)

![Chart block](images/p15-performance.png)

## Performance 表现

Below we present comprehensive evaluations of Qwen3.6-27B against both dense and MoE baselines, including our previous-generation open-source flagship Qwen3.5-397B-A17B. Qwen3.6-27B delivers remarkable improvements across agentic coding benchmarks, surpassing models with up to 15x its total parameter count.

下面给出 Qwen3.6-27B 相对稠密与 MoE 基线（含上一代开源旗舰 Qwen3.5-397B-A17B）的综合评测。在 agentic coding 基准上提升显著，超过总参可达其约 15 倍的模型。

Language

语言

Qwen3.6-27B achieves a breakthrough in agentic coding for dense models. With only 27B parameters, it outperforms the Qwen3.5-397B-A17B (397B total

Qwen3.6-27B 在稠密模型的 agentic coding 上取得突破。仅 27B 参数，就超过 Qwen3.5-397B-A17B (397B 总参

G

> **看表：** 「up to 15x its total parameter count」 的对照对象是谁？
> 指向 Qwen3.5-397B-A17B: 397 / 27 ≈ 14.7，文案取 「up to 15x」。比较的是总参倍数，不是激活参；397B-A17B 激活是 17B，相对 27B 稠密其实更小。读 「15x」 时要钉总参口径，否则会把激活账算反。

<!-- page 16 of 28 -->

/ 17B active) on every major coding benchmark — including SWE-bench Verified (77.2 vs. 76.2), SWE-bench Pro (53.5 vs. 50.9), Terminal-Bench 2.0 (59.3 vs. 52.5), and SkillsBench (48.2 vs. 30.0). It also surpasses all peer-scale dense models by a wide margin. On reasoning tasks, Qwen3.6-27B achieves 87.8 on GPQA Diamond, competitive with models several times its size.

/ 17B 激活) 的每一个主要 coding 基准 — 包括 SWE-bench Verified (77.2 vs. 76.2), SWE-bench Pro (53.5 vs. 50.9), Terminal-Bench 2.0 (59.3 vs. 52.5)，以及 SkillsBench (48.2 vs. 30.0)。也大幅超过同规模稠密对照。推理上 GPQA Diamond 达到 87.8，可与数倍体量的模型竞争。

<table><tr><td></td><td>Qwen3.5-27B</td><td>Qwen3.5-397B-A17B</td><td>Gemma4-31B</td><td>Claude 4.5 Opus</td><td>Qwen3.6-35B-A3B</td><td>Qwen3.6-27B</td></tr><tr><td colspan="7">Coding Agent</td></tr><tr><td>SWE-bench Verified</td><td>75.0</td><td>76.2</td><td>52.0</td><td>80.9</td><td>73.4</td><td>77.2</td></tr><tr><td>SWE-bench Pro</td><td>51.2</td><td>50.9</td><td>35.7</td><td>57.1</td><td>49.5</td><td>53.5</td></tr><tr><td>SWE-bench Multilingual</td><td>69.3</td><td>69.3</td><td>51.7</td><td>77.5</td><td>67.2</td><td>71.3</td></tr><tr><td>Terminal-Bench 2.0</td><td>41.6</td><td>52.5</td><td>42.9</td><td>59.3</td><td>51.5</td><td>59.3</td></tr><tr><td>SkillsBench $_{Avg5}$ </td><td>27.2</td><td>30.0</td><td>23.6</td><td>45.3</td><td>28.7</td><td>48.2</td></tr><tr><td>QwenWebBench</td><td>1068</td><td>1186</td><td>1197</td><td>1536</td><td>1397</td><td>1487</td></tr><tr><td>NL2Repo</td><td>27.3</td><td>32.2</td><td>15.5</td><td>43.2</td><td>29.4</td><td>36.2</td></tr><tr><td>Claw-Eval $_{Avg}$ </td><td>64.3</td><td>70.7</td><td>48.5</td><td>76.6</td><td>68.7</td><td>72.4</td></tr><tr><td>Claw-Eval $_{Pass^3}$ </td><td>46.2</td><td>48.1</td><td>25.0</td><td>59.6</td><td>50.0</td><td>60.6</td></tr><tr><td>QwenClawBench</td><td>52.2</td><td>51.8</td><td>41.7</td><td>52.3</td><td>52.6</td><td>53.4</td></tr><tr><td colspan="7">Knowledge</td></tr><tr><td>MMLU-Pro</td><td>86.1</td><td>87.8</td><td>85.2</td><td>89.5</td><td>85.2</td><td>86.2</td></tr><tr><td>MMLU-Redux</td><td>93.2</td><td>94.9</td><td>93.7</td><td>95.6</td><td>93.3</td><td>93.5</td></tr><tr><td>SuperGPQA</td><td>65.6</td><td>70.4</td><td>65.7</td><td>70.6</td><td>64.7</td><td>66.0</td></tr><tr><td>C-Eval</td><td>90.5</td><td>93.0</td><td>82.6</td><td>92.2</td><td>90.0</td><td>91.4</td></tr><tr><td colspan="7">STEM &amp; Reasoning</td></tr><tr><td>GPQA Diamond</td><td>85.5</td><td>88.4</td><td>84.3</td><td>87.0</td><td>86.0</td><td>87.8</td></tr><tr><td>HLE</td><td>24.3</td><td>28.7</td><td>19.5</td><td>30.8</td><td>21.4</td><td>24.0</td></tr><tr><td>LiveCodeBench v6</td><td>80.7</td><td>83.6</td><td>80.0</td><td>84.8</td><td>80.4</td><td>83.9</td></tr><tr><td>HMMT Feb 25</td><td>92.0</td><td>94.8</td><td>88.7</td><td>92.9</td><td>90.7</td><td>93.8</td></tr><tr><td>HMMT Nov 25</td><td>89.8</td><td>92.7</td><td>87.5</td><td>93.3</td><td>89.1</td><td>90.7</td></tr><tr><td>HMMT Feb 26</td><td>84.3</td><td>87.9</td><td>77.2</td><td>85.3</td><td>83.6</td><td>84.3</td></tr><tr><td>IMOAnswerBench</td><td>79.9</td><td>80.9</td><td>74.5</td><td>84.0</td><td>78.9</td><td>80.8</td></tr><tr><td>AIME26</td><td>92.6</td><td>93.3</td><td>89.2</td><td>95.1</td><td>92.7</td><td>94.1</td></tr></table>

\* SWE-Bench Series: Internal agent scaffold (bash + file-edit tools); temp=1.0, top\_p=0.95, 200K context window. We correct some problematic tasks in the public set of SWE-bench Pro and evaluate all baselines on the refined benchmark.

\* Terminal-Bench 2.0: Harbor/Terminus-2 harness; 3h timeout, 32 CPU/48 GB RAM; temp=1.0, top\_p=0.95, top\_k=20, max\_tokens=80K, 256K ctx; avg of 5 runs.

\* SWE-Bench 系列：内部 agent scaffold（bash + 文件编辑工具）；temp=1.0，top_p=0.95, 200K 上下文。对公开 SWE-bench Pro 中部分有问题的任务做了修正，并在 refined 基准上评全部基线。

\* Terminal-Bench 2.0: Harbor/Terminus-2 harness；超时 3h，32 CPU/48 GB RAM；temp=1.0，top_p=0.95，top_k=20，max_tokens=80K，256K ctx；5 次平均。

G

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">\* SkillsBench: Evaluated via OpenCode on 78 tasks (self-contained subset,</span></small>

> **问：** Terminal-Bench 2.0 上 Qwen3.6-27B 的 59.3 与 Claude 4.5 Opus 的关系是什么？
> 同表两格都是 59.3，并列。page 16 正文列出 59.3 vs 397B-A17B 的 52.5，没有声称超过 Claude；相对 Claude 是打平，不是领先。

> **拆开：** SkillsBench 从 397B-A17B 的 30.0 跳到 27B 的 48.2，是否与 Claude 的 45.3 同 harness?
> 脚注（跨 page 16–17）写经 OpenCode 评 78 题自包含子集，排除 API 依赖，5 次平均；表内各列共享该脚注口径。48.2 > Claude 45.3 > 397B 30.0。跃迁幅度远大于 Verified 的 +1.0，是 「压过上代旗舰」 叙事里差值最大的 coding 格之一。

<!-- page 17 of 28 -->

excluding API-dependent tasks); avg of 5 runs.

\* NL2Repo: Others are evaluated via Claude Code (temp=1.0, top\_p=0.95, max\_turns=900).

\* QwenClawBench: A real-user-distribution Claw agent benchmark; temp=0.6, 256K ctx.

\* QwenWebBench: An internal front-end code generation benchmark; bilingual (EN/CN), 7 categories (Web Design, Web Apps, Games, SVG, Data Visualization, Animation, and 3D); auto-render + multimodal judge (code/visual correctness); BT/Elo rating system.

\* AIME 26: We use the full AIME 2026 (I & II), where the scores may differ from Qwen 3.5 notes.

排除依赖 API 的题)；5 次平均。

\* NL2Repo：其余模型经 Claude Code 评测（temp=1.0, top_p=0.95, max_turns=900）。

\* QwenClawBench：真实用户分布的 Claw agent 基准；temp=0.6, 256K ctx。

\* QwenWebBench：内部前端代码生成基准；中英双语，7 类（Web Design, Web Apps, Games, SVG, Data Visualization, Animation, 3D）；自动渲染 + 多模态裁判（代码/视觉正确性）；BT/Elo 评分。

\* AIME 26：使用完整 AIME 2026 (I & II)，分数可能与 Qwen 3.5 笔记不同。

### Vision Language 视觉语言

Qwen3.6-27B is natively multimodal, supporting both vision-language thinking and non-thinking modes in a single unified checkpoint — the same as Qwen3.6-35B-A3B. It handles images and video alongside text, enabling multimodal reasoning, document understanding, and visual question answering.

Qwen3.6-27B 原生多模态，单一统一 checkpoint 同时支持视觉语言 thinking 与 non-thinking 模式 — 与 Qwen3.6-35B-A3B 相同。可处理图像与视频并配合文本，支持多模态推理，文档理解与视觉问答。

<!-- page 18 of 28 -->

<table><tr><td></td><td>Qwen3.5-27B</td><td>Qwen3.5-397B-A17B</td><td>Gemma4-31B</td><td>Claude 4.5 Opus</td><td>Qwen3.6-35B-A3B</td><td>Qwen3.6-27B</td></tr><tr><td colspan="7">STEM &amp; Puzzle</td></tr><tr><td>MMMU</td><td>82.3</td><td>85.0</td><td>80.4</td><td>80.7</td><td>81.7</td><td>82.9</td></tr><tr><td>MMMU-Pro</td><td>75.0</td><td>79.0</td><td>76.9</td><td>70.6</td><td>75.3</td><td>75.8</td></tr><tr><td>MathVista mini</td><td>87.8</td><td>--</td><td>79.3</td><td>--</td><td>86.4</td><td>87.4</td></tr><tr><td>DynaMath</td><td>87.7</td><td>86.3</td><td>79.5</td><td>79.7</td><td>82.8</td><td>85.6</td></tr><tr><td>VlmsAreBlind</td><td>96.9</td><td>--</td><td>87.2</td><td>--</td><td>96.6</td><td>97.0</td></tr><tr><td colspan="7">General VQA</td></tr><tr><td>RealWorldQA</td><td>83.7</td><td>83.9</td><td>72.3</td><td>77.0</td><td>85.3</td><td>84.1</td></tr><tr><td>MMStar</td><td>81.0</td><td>83.8</td><td>77.3</td><td>73.2</td><td>80.7</td><td>81.4</td></tr><tr><td>MMBenchEN-DEV-v1.1</td><td>92.6</td><td>--</td><td>90.9</td><td>--</td><td>92.8</td><td>92.3</td></tr><tr><td>SimpleVQA</td><td>56.0</td><td>67.1</td><td>52.9</td><td>65.7</td><td>58.9</td><td>56.1</td></tr><tr><td colspan="7">Document Understanding</td></tr><tr><td>CharXiv RQ</td><td>79.5</td><td>80.8</td><td>67.9</td><td>68.5</td><td>78.0</td><td>78.4</td></tr><tr><td>CC-OCR</td><td>81.0</td><td>82.0</td><td>75.7</td><td>76.9</td><td>81.9</td><td>81.2</td></tr><tr><td>OCRBench</td><td>89.4</td><td>--</td><td>86.1</td><td>--</td><td>90.0</td><td>89.4</td></tr><tr><td colspan="7">Spatial Intelligence</td></tr><tr><td>ERQA</td><td>60.5</td><td>67.5</td><td>57.5</td><td>46.8</td><td>61.8</td><td>62.5</td></tr><tr><td>CountBench</td><td>97.8</td><td>97.2</td><td>96.1</td><td>90.6</td><td>96.1</td><td>97.8</td></tr><tr><td>RefCOCO avg</td><td>90.9</td><td>92.3</td><td>--</td><td>--</td><td>92.0</td><td>92.5</td></tr><tr><td>EmbSpatialBench</td><td>84.5</td><td>--</td><td>--</td><td>--</td><td>84.3</td><td>84.6</td></tr><tr><td>RefSpatialBench</td><td>67.7</td><td>--</td><td>4.7</td><td>--</td><td>64.3</td><td>70.0</td></tr><tr><td colspan="7">Video Understanding</td></tr><tr><td> $VideoMME_{(w sub.)}$ </td><td>87.0</td><td>87.5</td><td>--</td><td>77.7</td><td>86.6</td><td>87.7</td></tr><tr><td>VideoMMMU</td><td>82.3</td><td>84.7</td><td>81.6</td><td>84.4</td><td>83.7</td><td>84.4</td></tr><tr><td>MLVU</td><td>85.9</td><td>86.7</td><td>--</td><td>81.7</td><td>86.2</td><td>86.6</td></tr><tr><td>MVBench</td><td>74.6</td><td>77.6</td><td>--</td><td>67.2</td><td>74.6</td><td>75.5</td></tr><tr><td colspan="7">Visual Agent</td></tr><tr><td>V*</td><td>93.7</td><td>95.8</td><td>--</td><td>67.0</td><td>90.1</td><td>94.7</td></tr><tr><td>AndroidWorld</td><td>64.2</td><td>--</td><td>--</td><td>--</td><td>--</td><td>70.3</td></tr></table>

\* Empty cells (--) indicate scores not yet available or not applicable.

\* 空单元格（--）表示分数尚不可用或不适用。

Build with Qwen3.6-27B

使用 Qwen3.6-27B

Qwen3.6-27B is coming soon to Alibaba Cloud Mode Studio. Please stand by until we are fully ready.

Qwen3.6-27B 即将登陆 Alibaba Cloud Mode Studio。请等待我们完全就绪。

Qwen3.6-27B is available as open weights on [Hugging Face](https://huggingface.co/Qwen/Qwen3.6-27B) and [ModelScope](https://modelscope.cn/models/Qwen/Qwen3.6-27B) for self-hosting, and through the [Alibaba Cloud Model Studio](https://int.alibabacloud.com/m/1000411739/) API. You can also

开放权重可在 [Hugging Face](https://huggingface.co/Qwen/Qwen3.6-27B) 与 [ModelScope](https://modelscope.cn/models/Qwen/Qwen3.6-27B) 自托管，并通过 [Alibaba Cloud Model Studio](https://int.alibabacloud.com/m/1000411739/) API 调用。也可

> **确认：** RealWorldQA / SimpleVQA 上，稠密 27B 是否全面压过同代 MoE 35B-A3B?
> 没有。RealWorldQA: 27B 84.1 < 35B-A3B 85.3；SimpleVQA: 27B 56.1 < 35B-A3B 58.9，也远低于 397B-A17B 的 67.1. coding 旗舰叙事不能平移到 General VQA。

> **回看：** AndroidWorld 只有 27B 给出 70.3, 35B-A3B 与 397B 为 「--」，能否据此说 27B 的 Visual Agent 全面领先同系列 MoE?
> 不能。脚注将 「--」 定义为 not yet available or not applicable；缺分不是 0 分。唯一可对的是相对上代稠密 Qwen3.5-27B 的 64.2→70.3。

<!-- page 19 of 28 -->

try it instantly on [Qwen Studio](https://chat.qwen.ai/).

在 [Qwen Studio](https://chat.qwen.ai/) 立即试用。

The model can be seamlessly integrated with popular third-party coding assistants, including OpenClaw, Claude Code, and Qwen Code, to streamline development workflows and enable efficient, context-aware coding experiences.

可与 OpenClaw，Claude Code，Qwen Code 等第三方 coding 助手无缝集成，简化开发流程并提供高效，上下文感知的 coding 体验。

## API Usage API 用法

This release supports the preserve\_thinking feature: preserving thinking content from all preceding turns in messages, which is **recommended for agentic tasks**.

本发布支持 preserve_thinking：在 messages 中保留此前各轮的 thinking 内容，**建议用于 agentic 任务**。

### Alibaba Cloud Model Studio

Alibaba Cloud Model Studio supports industry-standard protocols, including chat completions and responses APIs compatible with OpenAI’s specification, as well as an API interface compatible with Anthropic.

Alibaba Cloud Model Studio 支持业界标准协议，包括兼容 OpenAI 规范的 chat completions 与 responses API，以及兼容 Anthropic 的 API 接口。

Example code for chat completions API is provided below:

下面给出 chat completions API 示例代码：

```python
"""
Environment variables (per official docs):
    DASHSCOPE_API_KEY: Your API Key from https://modelstudio.console.alibaba
    DASHSCOPE_BASE_URL: (optional) Base URL for compatible-mode API.
        - Beijing: https://dashscope.aliyuncs.com/compatible-mode/v1
        - Singapore: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
        - US (Virginia): https://dashscope-us.aliyuncs.com/compatible-mode/v1
    DASHSCOPE_MODEL: (optional) Model name; override for different models.
"""
from openai import OpenAI
import os

api_key = os.environ.get("DASHSCOPE_API_KEY")
if not api_key:
    raise ValueError(
        "DASHSCOPE_API_KEY is required. "
        "Set it via: export DASHSCOPE_API_KEY='your-api-key'"
    )

client = OpenAI(
    api_key=api_key,
    base_url=os.environ.get(
        "DASHSCOPE_BASE_URL",
        "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    ),
```

<!-- page 20 of 28 -->

```python
)

messages = [{"role": "user", "content": "Introduce vibe coding."}]

model = os.environ.get(
    "DASHSCOPE_MODEL",
    "qwen3.6-27b",
)
completion = client.chat.completions.create(
    model=model,
    messages=messages,
    extra_body={
        "enable_thinking": True,
        # "preserve_thinking": True,
    },
    stream=True
)

reasoning_content = ""  # Full reasoning trace
answer_content = ""  # Full response
is_answering = False  # Whether we have entered the answer phase
print("\n" + "=" * 20 + "Reasoning" + "=" * 20 + "\n")

for chunk in completion:
    if not chunk.choices:
        print("\nUsage:")
        print(chunk.usage)
        continue

    delta = chunk.choices[0].delta

    # Collect reasoning content only
    if hasattr(delta, "reasoning_content") and delta.reasoning_content is
        if not is_answering:
            print(delta.reasoning_content, end="", flush=True)
        reasoning_content += delta.reasoning_content

    # Received content, start answer phase
    if hasattr(delta, "content") and delta.content:
        if not is_answering:
            print("\n" + "=" * 20 + "Answer" + "=" * 20 + "\n")
            is_answering = True
    print(delta.content, end="", flush=True)
    answer_content += delta.content
```

For more information, please visit the [API doc](https://int.alibabacloud.com/m/1000412307/).

更多信息见 [API doc](https://int.alibabacloud.com/m/1000412307/)。

> **停一下：** 35B-A3B 默认 DASHSCOPE_MODEL 是 qwen3.6-flash，27B 默认是 qwen3.6-27b，两篇博客的 「coming soon」 Model Studio 文案是否同一就绪状态？
> 文案平行但模型字符串不同。35B 篇（page 6）写 API as qwen3.6-flash 且 「coming soon to Model Studio」；27B 篇（page 18）写 「coming soon to Alibaba Cloud Mode Studio」（原文 Mode 拼写），示例默认 `qwen3.6-27b`。两套 SKU 的控制台上线状态与调用名要分开核，不能共用 Flash 字符串。

<!-- page 21 of 28 -->

## Coding & Agents Coding 与 Agents

Qwen3.6-27B features excellent agentic coding capabilities and can be seamlessly integrated into popular third-party coding assistants, including OpenClaw, Claude Code, and Qwen Code.

Qwen3.6-27B 具备出色的 agentic coding 能力，可无缝接入 OpenClaw，Claude Code，Qwen Code 等第三方 coding 助手。

### OpenClaw

Qwen3.6-27B is compatible with [OpenClaw](https://openclaw.ai/) (formerly Moltbot / Clawdbot), a self-hosted open-source AI coding agent. Connect it to [Model Studio](https://int.alibabacloud.com/m/1000411741/) to get a full agentic coding experience in the terminal. Get started with the following script:

Qwen3.6-27B 兼容 [OpenClaw](https://openclaw.ai/)（前身 Moltbot / Clawdbot），自托管开源 AI coding agent。接到 [Model Studio](https://int.alibabacloud.com/m/1000411741/) 即可在终端获得完整 agentic coding 体验。启动脚本如下：

```shell
# Node.js 22+
curl -fsSL https://molt.bot/install.sh | bash    # macOS / Linux

# Set your API key
export DASHSCOPE_API_KEY=<your_api_key>

# Launch OpenClaw
openclaw dashboard # web browser
# openclaw tui # Open a new terminal and start the TUI
```

On first use, edit \~/.openclaw/openclaw.json to point OpenClaw at Model Studio. Find or create the following fields and merge them — **do not overwrite the entire file** to preserve your existing settings:

首次使用请编辑 ~/.openclaw/openclaw.json，指向 Model Studio。查找或创建下列字段并合并 — **不要整文件覆盖**，以免丢掉已有设置：

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "modelstudio": {
        "baseUrl": "https://dashscope-intl.aliyuncs.com/compatible-mode/v"
        "apiKey": "DASHSCOPE_API_KEY",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen3.6-27b",
            "name": "qwen3.6-27b",
            "reasoning": true,
            "input": ["text", "image"],
            "contextWindow": 131072,
            "maxTokens": 16384
          }
        ]
    ]
  }
}
```

<!-- page 22 of 28 -->

```json
}
    }
},
"agents": {
  "defaults": {
    "model": {
      "primary": "modelstudio/qwen3.6-27b"
    },
    "models": {
      "modelstudio/qwen3.6-27b": {}
    }
  }
}
}
```

### Qwen Code

Qwen3.6-27B is compatible with [Qwen Code](https://qwen.ai/qwencode), an open-source AI agent designed for the terminal and deeply optimized for the Qwen Series. Get started with the following script:

Qwen3.6-27B 兼容 [Qwen Code](https://qwen.ai/qwencode)，面向终端，为 Qwen 系列深度优化的开源 AI agent。启动脚本如下：

```txt
# Node.js 20+
npm install -g @qwen-code/qwen-code@latest

# Start Qwen Code (interactive)
qwen

# Then, in the session:
/help
/auth
```

On first use, you’ll be prompted to sign in. You can run /auth anytime to switch authentication methods.

首次使用会提示登录。可随时运行 /auth 切换鉴权方式。

### Claude Code

Qwen APIs also support the Anthropic API protocol, meaning you can use it with tools like **Claude Code** for elevated coding experience:

Qwen API 也支持 Anthropic API 协议，因此可用 **Claude Code** 等工具获得更高阶 coding 体验：

```shell
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Configure environment
export ANTHROPIC_MODEL="qwen3.6-27b"
```

<!-- page 23 of 28 -->

```shell
export ANTHROPIC_SMALL_FAST_MODEL="qwen3.6-27b"
export ANTHROPIC_BASE_URL=https://dashscope-int1.aliyuncs.com/apps/anthro
export ANTHROPIC_AUTH_TOKEN=<your_api_key>

# Launch the CLI
claude
```

## Summary 总结

Qwen3.6-27B demonstrates that a well-trained dense model can surpass much  larger predecessors on the tasks that matter most for developers. At 27 billion parameters — the most widely deployed open-source scale — it outperforms the 397B-parameter Qwen3.5-397B-A17B on every major agentic coding benchmark, while remaining straightforward to deploy and serve. With Qwen3.6-27B joining the roster, the Qwen3.6 open-source family now offers a comprehensive range of models, underscoring a generation where agentic coding achieved breakthroughs across every scale — from the 3B-active Qwen3.6-35B-A3B to the API-accessible Qwen3.6-Plus and Qwen3.6-Max-Preview. We are grateful for the community’s feedback and look forward to seeing what you build with these models. Stay tuned for more from the Qwen team!

Qwen3.6-27B 证明，训练到位的 dense 模型能在开发者最看重的任务上超越规模大得多的前代。27B 是开源部署最广的体量：它在所有主要 Agentic coding 基准上都超过 397B 参数的 Qwen3.5-397B-A17B，部署与服务却照旧简单。随着 Qwen3.6-27B 加入，Qwen3.6 开源家族已覆盖从 3B 激活的 Qwen3.6-35B-A3B 到 API 形式的 Qwen3.6-Plus 与 Qwen3.6-Max-Preview 的完整谱系，标志着 Agentic coding 在各个体量全面突破的一代。感谢社区的反馈，期待看到大家的作品，更多进展请继续关注 Qwen team!

## Citation 引用

Feel free to cite the following article if you find Qwen3.6-27B helpful:

```bib
@misc{qwen36_27b,
    title = {{Qwen3.6-27B}: Flagship-Level Coding in a 27B Dense Model},
    url = {https://qwen.ai/blog?id=qwen3.6-27b},
    author = {{Qwen Team}},
    month = {April},
    year = {2026}
}
```

```txt
Source
```

> **再看：** Summary 把 3B-active 35B-A3B 与 27B dense 写成 「breakthroughs across every scale」，同抓取文件里两套榜对同题 SWE-bench Verified 谁更高？
> page 16 同表：27B 77.2 > 35B-A3B 73.4。「every scale 都有突破」 是系列叙事，不是说激活 3B 的 MoE 在 Verified 上已经追上 27B 稠密。两 SKU 的定位差在部署形态（路由复杂度 vs 激活账单），不是同一格分数互换。

> **对一下：** page 18 「Alibaba Cloud Mode Studio」 与 page 6/12 的 Model Studio 是否同一产品名笔误？
> 抓取原文在 27B 篇写的是 **Mode** Studio；35B 篇与相关产品栏写 **Model** Studio。对照译稿保留源文字面；链到控制台时仍按 Model Studio 产品理解，但引用本页句子要承认 Mode 拼写。

<!-- page 24 of 28 -->

[AI](https://community.alibabacloud.com/tags/type_blog-tagid_3219/)

[Artificial Intelligence](https://community.alibabacloud.com/tags/type_blog-tagid_16441/)

[Generative AI](https://community.alibabacloud.com/tags/type_blog-tagid_36033/)

[GenAI](https://community.alibabacloud.com/tags/type_blog-tagid_36358/)

[Qwen](https://community.alibabacloud.com/tags/type_blog-tagid_36919/)

[Alibaba Cloud Model Studio](https://community.alibabacloud.com/tags/type_blog-tagid_37001/)

[Model Studio](https://community.alibabacloud.com/tags/type_blog-tagid_37002/)

[Qwen Studio](https://community.alibabacloud.com/tags/type_blog-tagid_39834/)

[Qwen3.6-27B](https://community.alibabacloud.com/tags/type_blog-tagid_39860/)

![Image block](images/p24-read-previous-post.png)

Read previous post:

上一篇：

[Qwen App Expands Seamless End-to-End Agentic Experience with First External Partnership](https://www.alibabacloud.com/blog/qwen-app-expands-seamless-end-to-end-agentic-experience-with-first-external-partnership_603062)

Share on

分享到

![Image block](images/p24-read-next-post.png)

Read next post:

下一篇：

[China Art Museum Explores AI-Guided Viewing with Alibaba's Qwen AI Glasses](https://www.alibabacloud.com/blog/china-art-museum-explores-ai-guided-viewing-with-alibabas-qwen-ai-glasses_603064)

## You may also like 你可能还喜欢

[What It Actually Takes to Run Qwen3.8-27B Locally](https://www.alibabacloud.com/blog/what-it-actually-takes-to-run-qwen3-8-27b-locally_603428)

Alibaba Cloud Community - August 5, 2026

[JavaScript Bytecode – v8 Ignition Instructions](https://www.alibabacloud.com/blog/javascript-bytecode-v8-ignition-instructions_599188)

Alibaba F(x) Team - July 28, 2022

[DNN training for LibSVM-formatted data - From Keras to Estimator](https://www.alibabacloud.com/blog/dnn-training-for-libsvm-formatted-data---from-keras-to-estimator_595415)

Alibaba Clouder - September 30, 2019

## Comments 评论

[Alibaba Releases Qwen3.8-Flash with Innovative Model Architecture Delivering Optimal Price-Performance](https://www.alibabacloud.com/blog/alibaba-releases-qwen3-8-flash-with-innovative-model-architecture-delivering-optimal-price-performance_603503)

Alibaba Cloud Community - August 27, 2026

[Qwen3.6-35B-A3B: Agentic Coding Power, Now Open to All](https://www.alibabacloud.com/blog/qwen3-6-35b-a3b-agentic-coding-power-now-open-to-all_603043)

Alibaba Cloud Community - April 17, 2026

[Alibaba Introduces Qwen3, Setting New Benchmark in Open-Source AI with Hybrid Reasoning](https://www.alibabacloud.com/blog/alibaba-introduces-qwen3-setting-new-benchmark-in-open-source-ai-with-hybrid-reasoning_602192)

![Image block](images/p24-alibaba-cloud-community-april-29-2025.png)

Alibaba Cloud Community - April 29, 2025

<!-- page 25 of 28 -->

Write your comment...

写下你的评论...

Post

发布

<!-- page 26 of 28 -->

[Alibaba Cloud Community](https://community.alibabacloud.com/users/5337701737861729) 1,543 posts | 517 followers

Follow

关注

Related Products

相关产品

![Image block](images/p26-alibaba-cloud-model-studio-https-community-alibabacloud.png)

## [Alibaba Cloud Model Studio](https://community.alibabacloud.com/go/1/473)

A one-stop generative AI platform to build intelligent applications that understand your business, based on Qwen model series such as Qwen-Max and other popular models

一站式生成式 AI 平台，基于 Qwen-Max 等 Qwen 系列与其他流行模型，构建理解你业务的智能应用

[Learn More](https://community.alibabacloud.com/go/1/473)

了解更多

![Image block](images/p26-qwen-https-community-alibabacloud-com-go-1-472.png)

## 六 [Qwen](https://community.alibabacloud.com/go/1/472)

Full-range, open-source, multimodal, and multi-functional

全系列，开源，多模态，多功能

[Learn More](https://community.alibabacloud.com/go/1/472)

了解更多

![Image block](images/p26-token-plan-https-community-alibabacloud-com-go-1-480.png)

## [Token Plan](https://community.alibabacloud.com/go/1/480)

Build more, spend less. One plan, every modality.

少花钱多做事。一个计划，覆盖各模态。

[Learn More](https://community.alibabacloud.com/go/1/480)

了解更多

![Image block](images/p26-image.png)

![Image block](images/p26-image-2.png)

![Image block](images/p26-qwenwork-https-community-alibabacloud-com-go-1-481.png)

## [QwenWork](https://community.alibabacloud.com/go/1/481)

QwenWork is dedicated to helping employees strengthen their professional competitiveness in the AI era and to enabling enterprises to improve organizational effectiveness.

QwenWork 致力于帮助员工在 AI 时代提升职业竞争力，并助力企业提高组织效能。

[Learn More](https://community.alibabacloud.com/go/1/481)

了解更多

<!-- page 27 of 28 -->

More Posts by Alibaba …

更多阿里文章 …

[See All](https://community.alibabacloud.com/users/5337701737861729/article)

[AliViews: Eddie Wu Shares Alibaba's Strategic Full-Stack AI Roadmap at the 2026 Apsara Conference](https://www.alibabacloud.com/blog/aliviews-eddie-wu-shares-alibabas-strategic-full-stack-ai-roadmap-at-the-2026-apsara-conference_603595)

[Alibaba Cloud Expands Global Infrastructure and AI Portfolio to Accelerate Enterprise AI Adoption](https://www.alibabacloud.com/blog/alibaba-cloud-expands-global-infrastructure-and-ai-portfolio-to-accelerate-enterprise-ai-adoption_603594)

[Alibaba Unveils Roadmap on Full-Stack AI Strategy from Chips, Cloud Infrastructure, Models to Agents](https://www.alibabacloud.com/blog/alibaba-unveils-roadmap-on-full-stack-ai-strategy-from-chips-cloud-infrastructure-models-to-agents_603589)

[Qwen-Image-2.1: Compact, Efficient, and Unified Image Creation](https://www.alibabacloud.com/blog/qwen-image-2-1-compact-efficient-and-unified-image-creation_603586)

[Qwen3.8-LiveTranslate: Names the Speaker. Carries the Meaning.](https://www.alibabacloud.com/blog/qwen3-8-livetranslate-names-the-speaker--carries-the-meaning-_603581)

[Qwen3.8-Omni-Flash: Omni Senses. Agentic Delivery.](https://www.alibabacloud.com/blog/qwen3-8-omni-flash-omni-senses--agentic-delivery-_603580)

[Alibaba Cloud Named a Leader in Gartner® Magic Quadrant™ for Generative AI Model Providers](https://www.alibabacloud.com/blog/alibaba-cloud-named-a-leader-in-gartner%C2%AE-magic-quadrant%E2%84%A2-for-generative-ai-model-providers_603574)

[Choosing the Right Model for Your Work: A Guide to the Qwen Series](https://www.alibabacloud.com/blog/choosing-the-right-model-for-your-work-a-guide-to-the-qwen-series_603566)

[為你的工作選對模型：以 Qwen 系列為例](https://www.alibabacloud.com/blog/%E7%82%BA%E4%BD%A0%E7%9A%84%E5%B7%A5%E4%BD%9C%E9%81%B8%E5%B0%8D%E6%A8%A1%E5%9E%8B%EF%BC%9A%E4%BB%A5-qwen-%E7%B3%BB%E5%88%97%E7%82%BA%E4%BE%8B_603565)

[Still Running Your Own Hive Metastore? Point Spark Straight at OSS Tables and Iceberg Just Works 
$$
OSS Tables Deep Dive
$$
](https://www.alibabacloud.com/blog/still-running-your-own-hive-metastore-point-spark-straight-at-oss-tables-and-iceberg-just-works-oss-tables-deep-dive_603557)

## A Free Trial That Lets You Build Big! 让你大胆构建的免费试用！

![Image block](images/p27-start-building-with-80-products-and-up-to-12-months.png)

Start building with 80+ products and up to 12 months usage for Elastic Compute Service

从 80+ 产品起步，Elastic Compute Service 最长可用约 12 个月

[Get Started for Free](https://www.alibabacloud.com/campaign/free-trial/enterprise)

免费开始

<!-- page 28 of 28 -->

![Image block](images/p28-image.png)

> **想：** VITA-Bench 脚注换用 claude-4-sonnet 裁判后，35B-A3B 的 35.6 能否与仍用官方 claude-3.7-sonnet 的外部论文分数横比？
> 不能。page 4 脚注写明官方裁判（claude-3.7-sonnet）已不可用，改用 claude-4-sonnet；表内各列共享新裁判，但跨文献到仍用 3.7 的分数会混裁判代际。只宜在本表五列内比。

> **问：** MCPMark 的 Playwright 响应截断在 32K tokens，与 SWE-Bench 的 200K / Terminal-Bench 的 256K ctx 是否同一上下文预算？
> 不是。MCPMark 脚钉的是 Playwright responses truncated at 32K tokens；SWE-Bench 是 200K context window；Terminal-Bench 是 256K ctx + max_tokens=80K. 三套 agent 榜的上下文与截断上限彼此独立，不能共用一个 「长上下文 agent」 数字解释所有格。
