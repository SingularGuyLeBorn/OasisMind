---
title: "Kimi K2.7 Code · 对照译稿"
category: "模型库"
tags: ["Kimi", "对照译稿"]
published: true
excerpt: "Kimi K2.7 Code 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 7 -->

2026/9/25 08: 48



2026/9/25 08: 48

Kimi K2.7 Code: Open-Source Agentic Coding Model



Kimi K2.7 Code：开源智能体式编程模型

KIMI



KIMI

三 山 [Try Kimi online](https://www. kimi. ai/)



三 山 [在线试用 Kimi](https://www. kimi. ai/)

[Home](https://www. kimi. ai/) / [Resources](https://www. kimi. ai/resources/) / Kimi K2.7 Code



[首页](https://www. kimi. ai/) / [资源](https://www. kimi. ai/resources/) / Kimi K2.7 Code

# Kimi K2.7 Code



# Kimi K2.7 Code

An open-source, coding-focused agentic model built for long-horizon software engineering.



开源，以编程为主的智能体模型，面向长程软件工程。

（「long-horizon」：任务跨很多步，很多文件，很长会话，模型要一路跟指令做到收尾，而不是单轮答完。）

[**Try in Kimi Code**](https://www. kimi. ai/code)



[**在 Kimi Code 中试用**](https://www. kimi. ai/code)

8 min read / Updated: 2026-09-14



阅读约 8 分钟 / 更新：2026-09-14

![Image block](images/p01-kkkkkkk-k-uuuuuuuuuuuukk-k-ku-dooooooooo0oo000ooo.png)

KKKKKKK#K##UUUUUUUUUUUUKK#####K######KU DOOOOOOOOO0OO000OOO#KKKKKOKOOOOOOOOOKOKKKKKKKKKOOOOOKKO



（页面主视觉 OCR 噪声，保留源文原文；图见上。）

## What is Kimi K2.7 Code?



## 什么是 Kimi K2.7 Code?

Kimi K2.7 Code is an open-source, coding-focused agentic model developed by Moonshot AI. It delivers stronger coding and agent performance, with substantial improvements in real-world long-horizon coding tasks. These gains translate into higher end-to-end task success rates across complex software engineering workflows. K2.7 Code also improves reasoning efficiency, reducing thinking-token usage by approximately 30% compared with K2.6.



Kimi K2.7 Code 是 Moonshot AI 开发的开源，以编程为主的智能体模型。它在编程与智能体表现上更强，真实世界的长程编程任务有明显提升；这些提升会体现为复杂软件工程流程里更高的端到端任务成功率。相对 K2.6，K2.7 Code 也改善了推理效率，thinking token 用量大约少 30%。

（「thinking-token」：开启思考模式时，模型在可见最终回答之外先生成的内部推演 token，会计入用量与成本。）

## Benchmark performance ## 基准表现

Kimi K2.7 Code was evaluated against K2.6 on a combination of internal and external benchmarks covering two dimensions: coding capability and agentic task execution.



相对 K2.6，Kimi K2.7 Code 在一组内部与外部基准上评测，覆盖两个维度：编程能力，以及智能体任务执行。

https://www. kimi. ai/resources/kimi-k2-7-code

1/7

<!-- page 2 of 7 -->

2026/9/25 08: 48



2026/9/25 08: 48

Kimi K2.7 Code: Open-Source Agentic Coding Model



Kimi K2.7 Code：开源智能体式编程模型

![Image block](images/p02-on-coding-benchmarks-k2-7-code-shows-substantial-gains.png)

On coding benchmarks, K2.7 Code shows substantial gains over K2.6:+21.8% on Kimi Code Bench v2 (62.0 vs 50.9), +11.0% on Program Bench (53.6 vs 48.3), and +31.5% on MLS Bench Lite (35.1 vs 26.7).



编程基准上，K2.7 Code 相对 K2.6 有明显抬升：Kimi Code Bench v2 +21.8%（62.0 对 50.9），Program Bench +11.0%（53.6 对 48.3），MLS Bench Lite +31.5%（35.1 对 26.7）。

Stronger coding capability also translates into stronger agentic performance. On Kimi Claw 24/7 Bench, MCP Atlas, and MCP Mark Verified - benchmarks that measure autonomous agent task execution - K2.7 Code improves by roughly 10% over K2.6.



更强的编程能力也会落到更强的智能体表现。在衡量自主智能体任务执行的 Kimi Claw 24/7 Bench，MCP Atlas，MCP Mark Verified 上，K2.7 Code 相对 K2.6 大约提升 10%。

（「MCP」：Model Context Protocol，模型与外部工具/资源对话的协议；文中 MCP Atlas，MCP Mark Verified 是围绕该生态的评测。）

### Coding: ### 编程：

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
| --- | --- | --- | --- | --- |
| Kimi Code Bench v2 | 50.9 | 62.0 | 69.0 | 67.4 |
| Program Bench | 48.3 | 53.6 | 69.1 | 63.8 |
| MLS Bench Lite | 26.7 | 35.1 | 35.5 | 42.8 |

### Agentic: ### 智能体：

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
| --- | --- | --- | --- | --- |
| Kimi Claw 24/7 Bench | 42.9 | 46.9 | 52.8 | 50.4 |
| MCP Atlas | 69.4 | 76.0 | 79.4 | 81.3 |
| MCP Mark Verified | 72.8 | 81.1 | 92.9 | 76.4 |

Kimi Code Bench v2 is an in-house benchmark developed by Moonshot AI, and Kimi Claw 24/7 Bench is an inhouse benchmark for agentic evaluation. Kimi K2.7 Code and K2.6 were tested via Kimi Code CLI with thinking enabled (temperature 1.0, top-p 0.95, 262, 144-token context), while GPT-5.5 was evaluated in Codex (xhigh) and Opus 4.8 in Claude Code (xhigh). Per-benchmark exceptions and full methodology are detailed in the [Hugging Face model card](https://huggingface. co/moonshotai/Kimi-K2.7-Code).



Kimi Code Bench v2 是 Moonshot AI 的内部基准；Kimi Claw 24/7 Bench 是面向智能体评测的内部基准。Kimi K2.7 Code 与 K2.6 经 Kimi Code CLI 测试，开启 thinking（temperature 1.0，top-p 0.95, 262, 144 token 上下文）；GPT-5.5 在 Codex(xhigh)评测，Opus 4.8 在 Claude Code(xhigh)评测。各基准例外与完整方法见 [Hugging Face model card](https://huggingface. co/moonshotai/Kimi-K2.7-Code).

https://www. kimi. ai/resources/kimi-k2-7-code

2/7

<!-- page 3 of 7 -->

2026/9/25 08: 48



2026/9/25 08: 48

Kimi K2.7 Code: Open-Source Agentic Coding Model



Kimi K2.7 Code：开源智能体式编程模型

## Built for long-horizon coding ## 为长程编程而建

Real-world software engineering rarely ends in a single step. Tasks like refactoring a codebase, implementing a feature across multiple files, or debugging over long agent sessions require a model to follow instructions reliably across extended contexts, and to carry a task through to completion.



真实软件工程很少一步结束。重构代码库，跨多文件实现功能，或在很长的智能体会话里调试，都要求模型在扩展上下文里稳定跟指令，并把任务做到完成。

Kimi K2.7 Code is optimized for these long-horizon scenarios. Compared with K2.6, it follows instructions more reliably in long contexts and achieves higher end-to-end task success rates, making it better suited for complex software engineering workflows.



Kimi K2.7 Code 针对这类长程场景做了优化。相对 K2.6，它在长上下文里更稳地跟指令，端到端任务成功率更高，更适合复杂软件工程流程。

[Try in Kimi Code](https://www. kimi. ai/code) [在 Kimi Code 中试用](https://www. kimi. ai/code)

## Optimized reasoning efficiency ## 优化推理效率

Reasoning models tend to overthink, spending thousands of tokens deliberating on problems that don't need it. Kimi K2.7 Code significantly reduces this tendency: it cuts thinking-token usage by approximately 30% on average compared with K2.6.



推理模型容易想过头，在不需要的问题上烧掉成千上万 token. Kimi K2.7 Code 明显压低这种倾向：相对 K2.6，平均大约少用 30% 的 thinking token。

Across Kimi Code Bench v2, Program Bench, and MLS Bench Lite, Kimi K2.7 Code achieves higher scores than K2.6 while consuming fewer tokens on each benchmark.



在 Kimi Code Bench v2，Program Bench，MLS Bench Lite 上，Kimi K2.7 Code 分数高于 K2.6，且每个基准消耗的 token 更少。

Kimi-K2.7 Code vs Kimi-K2.6 : Performance vs Tokens



Kimi-K2.7 Code 对 Kimi-K2.6：表现对 token

![Chart block](images/p03-for-developers-this-efficiency-compounds-across-every.png)

For developers, this efficiency compounds across every task: faster responses in interactive coding sessions, lower API costs in production, and agent workflows that complete more work within the same context budget.



对开发者而言，这种效率会在每个任务上叠起来：交互式编程会话响应更快，生产里 API 成本更低，同一上下文预算下智能体工作流能完成更多事。

[Try in Kimi Code](https://www. kimi. ai/code) [在 Kimi Code 中试用](https://www. kimi. ai/code)

## Model architecture ## 模型架构

https://www. kimi. ai/resources/kimi-k2-7-code

3/7

<!-- page 4 of 7 -->

2026/9/25 08: 48



2026/9/25 08: 48

Kimi K2.7 Code: Open-Source Agentic Coding Model



Kimi K2.7 Code：开源智能体式编程模型

Kimi K2.7 Code is built on a Mixture-of-Experts (MoE) architecture with 1 trillion total parameters and 32 billion activated parameters per token. The model supports a 256K context length and uses Multi-head Latent Attention (MLA). It also includes MoonViT, a 400M-parameter vision encoder.



Kimi K2.7 Code 基于 MoE 架构：总参数 1 万亿，每 token 激活参数 320 亿。模型支持 256K 上下文，使用 MLA，并带有 MoonViT--400M 参数的视觉编码器。

（「MoE」：多数参数是专家库，每次只激活少数专家；服务期算力更接近激活参，存储与通信仍按总参规模。）

（「MLA」：Multi-head Latent Attention，用低秩潜变量压缩 KV，降低长上下文注意力显存与带宽。）

| Parameter | Value |
| --- | --- |
| Architecture | Mixture-of-Experts (MoE) |
| Total Parameters | 1T |
| Activated Parameters | 32B |
| Number of Layers (Dense layer included) | 61 |
| Number of Dense Layers | 1 |
| Attention Hidden Dimension | 7168 |
| MoE Hidden Dimension (per Expert) | 2048 |
| Number of Attention Heads | 64 |
| Number of Experts | 384 |
| Selected Experts per Token | 8 |
| Number of Shared Experts | 1 |
| Vocabulary Size | 160K |
| Context Length | 256K |
| Attention Mechanism | MLA |
| Activation Function | SwiGLU |
| Vision Encoder | MoonViT |
| Parameters of Vision Encoder | 400M |

The full model weights are open-sourced and available on Hugging Face.



完整模型权重已开源，可在 Hugging Face 获取。

## Choosing between Kimi K2.7 Code and K2.6 ## 如何在 Kimi K2.7 Code 与 K2.6 之间选择

Kimi K2.7 Code is purpose-built for coding tasks. For general-purpose work such as writing, analysis, and conversation, we recommend K2.6, which offers more well-rounded capabilities.



Kimi K2.7 Code 专为编程任务打造。写作，分析，对话等通用工作，建议用能力更全面的 K2.6。

## How to access Kimi K2.7 Code ## 如何获取 Kimi K2.7 Code

### Where to use it ### 在哪里用

Kimi K2.7 Code is available through:



Kimi K2.7 Code 可通过以下渠道使用：

**Kimi Code** ([https://www. kimi. ai/code](https://www. kimi. ai/code)). Kimi K2.7 Code is now the default model, with thinking mode enabled by default. To get started, follow the setup instructions on the page.



**Kimi Code**([https://www. kimi. ai/code](https://www. kimi. ai/code)). Kimi K2.7 Code 现为默认模型，默认开启 thinking 模式。起步请按该页安装说明操作。

https://www. kimi. ai/resources/kimi-k2-7-code

4/7

<!-- page 5 of 7 -->

2026/9/25 08: 48



2026/9/25 08: 48

Kimi K2.7 Code: Open-Source Agentic Coding Model



Kimi K2.7 Code：开源智能体式编程模型

Send /help for help information.

Directory: /Users/moonshot/k2.7Code

Session: session\_1c982946-56b0-4cc6-ab4c-2d72e5052491

Model: K2.7 Code

Version: 0.14.1

K2.7 Code is ready higher end-to-end coding task success rates /model select K2.7 Code with thinking on

Use /dance on to keep the rainbow on.



Send /help for help information.

Directory: /Users/moonshot/k2.7Code

Session: session\_1c982946-56b0-4cc6-ab4c-2d72e5052491

Model: K2.7 Code

Version: 0.14.1

K2.7 Code is ready higher end-to-end coding task success rates /model select K2.7 Code with thinking on

Use /dance on to keep the rainbow on.

（以上为页面截图 OCR 文本，保留源文字面；终端界面见图。）

![Image block](images/p05-i.png)

> I

yolo K2.7 Code thinking \~/k2.7Code



> I

yolo K2.7 Code thinking \~/k2.7Code

**Kimi API** on the open platform ([https://platform. kimi. ai/](https://platform. kimi. ai/)). Developers can call Kimi K2.7 Code via the Kimi API and integrate it into their own coding workflows, agents, and developer tools.



开放平台上的 **Kimi API**([https://platform. kimi. ai/](https://platform. kimi. ai/))。开发者可通过 Kimi API 调用 Kimi K2.7 Code，接入自有编程工作流，智能体与开发者工具。

### Thinking mode requirement ### Thinking 模式要求

Kimi K2.7 Code does not support non-thinking mode. It always runs with thinking enabled, on both the Kimi API and Kimi Code. In Kimi Code, requests made with thinking disabled are automatically served by K2.6 instead.



Kimi K2.7 Code 不支持非 thinking 模式。在 Kimi API 与 Kimi Code 上始终开启 thinking。在 Kimi Code 里，若请求关掉 thinking，会自动改由 K2.6 承接。

## Kimi K2.7 Code pricing ## Kimi K2.7 Code 定价

### Kimi Code Plans ### Kimi Code 套餐

For users who want to experience Kimi K2.7 Code directly through Kimi Code, including terminal and IDE plugins, you can choose our Code plans. Prices shown below are monthly prices under **annual billing**:



若希望直接通过 Kimi Code（含终端与 IDE 插件）体验 Kimi K2.7 Code，可选 Code 套餐。下表为 **年付** 下的月价：

| Plan | Price | Best for |
| --- | --- | --- |
| Moderato | $15 / month | Users who need weekly refreshed usage quotas and multi-device access for regular coding workflows |
| Allegretto | $31 / month | Advanced users who need larger weekly limits and increased concurrency caps |
| Allegro | $79 / month | Users working on intensive development tasks, complex projects, and larger workloads |
| Vivace | $159 / month | Users who need the highest weekly plan quotas for complex projects and large codebases |

| 套餐 | 价格 | 适合 |
| --- | --- | --- |
| Moderato | $15 / month | 需要按周刷新用量配额，多设备访问，做常规编程工作流 |
| Allegretto | $31 / month | 进阶用户，需要更大周限额与更高并发上限 |
| Allegro | $79 / month | 高强度开发，复杂项目与更大负载 |
| Vivace | $159 / month | 需要最高周配额，应对复杂项目与大型代码库 |

Each plan includes weekly refreshed usage limits. Higher-tier plans provide larger weekly limits and higher concurrency caps, making them suitable for more complex projects. For the latest plan details, see the [official membership page](https://www. kimi. ai/membership/pricing).



每个套餐都含按周刷新的用量上限。更高档提供更大周限额与更高并发上限，适合更复杂项目。最新套餐细节见 [官方会员页](https://www. kimi. ai/membership/pricing).

https://www. kimi. ai/resources/kimi-k2-7-code

5/7

<!-- page 6 of 7 -->

![Image block](images/p06-2026-9-25-08-48.png)

2026/9/25 08: 48



2026/9/25 08: 48

Kimi K2.7 Code: Open-Source Agentic Coding Model



Kimi K2.7 Code：开源智能体式编程模型

### Kimi API pricing ### Kimi API 定价

Kimi K2.7 Code is available through the Kimi API with usage-based, per-token billing:



Kimi K2.7 Code 经 Kimi API 提供，按用量，按 token 计费：

| Model | Unit | Input Price (Cache Hit) | Input Price (Cache Miss) | Output Price | Context Window |
| --- | --- | --- | --- | --- | --- |
| kimi-k2.7-code | 1M tokens | $0.19 | $0.95 | $4.00 | 262, 144 tokens |

The API supports automatic context caching, which lowers the input cost for reused context (cache hit \$0.19 vs cache miss \$0.95 per million tokens). Prices exclude applicable taxes. See the [official pricing documentation](https://platform. kimi. ai/docs/pricing/chat) for the latest rates.



API 支持自动上下文缓存，复用上下文时降低输入成本（缓存命中每百万 token \$0.19，未命中 \$0.95）。价格不含适用税费。最新费率见 [官方定价文档](https://platform. kimi. ai/docs/pricing/chat).

（「context caching」：把已处理过的长前缀缓存起来，后续请求命中缓存时按更低单价计输入 token.）

## FAQ ## 常见问题

### Is Kimi K2.7 Code open-source?



### Kimi K2.7 Code 是否开源？

Yes. The model weights are open-sourced and available for download on Hugging Face, where you can also find deployment guides and full documentation.



是。模型权重已开源，可在 Hugging Face 下载，该处还有部署指南与完整文档。

### What is the context window of Kimi K2.7 Code?



### Kimi K2.7 Code 的上下文窗口是多少？

Kimi K2.7 Code supports a 256K context window (262, 144 tokens), making it well-suited for repository-scale codebases and long, multi-turn coding sessions.



Kimi K2.7 Code 支持 256K 上下文窗口（262, 144 tokens），适合仓库级代码库与长多轮编程会话。

### Does Kimi K2.7 Code support image and video input?



### Kimi K2.7 Code 是否支持图像与视频输入？

Yes. Kimi K2.7 Code uses a natively multimodal architecture that supports text, image, and video input, in addition to its coding and agentic capabilities.



是。Kimi K2.7 Code 采用原生多模态架构，除编程与智能体能力外，还支持文本，图像与视频输入。

### Is thinking mode required to use Kimi K2.7 Code?



### 使用 Kimi K2.7 Code 是否必须开启 thinking 模式？

Yes. Kimi K2.7 Code does not support non-thinking mode and always runs with thinking enabled. In Kimi Code, requests made with thinking disabled are automatically served by K2.6 instead.



是。Kimi K2.7 Code 不支持非 thinking 模式，始终开启 thinking。在 Kimi Code 里，关掉 thinking 的请求会自动改由 K2.6 承接。

## You Might Also Like ## 你可能还喜欢

https://www. kimi. ai/resources/kimi-k2-7-code

6/7

<!-- page 7 of 7 -->

![Image block](images/p07-2026-9-25-08-48.png)

2026/9/25 08: 48



2026/9/25 08: 48

[**10 No-Code AI Agents to Automate Workflows in.**](https://www. kimi. ai/resources/no-code-ai-agent)



[**10 个无代码 AI 智能体，用于自动化工作流。**](https://www. kimi. ai/resources/no-code-ai-agent)

[**How to Integrate an External LLM API with.**](https://www. kimi. ai/resources/codex-api)



[**如何集成外部 LLM API.**](https://www. kimi. ai/resources/codex-api)

Kimi K2.7 Code: Open-Source Agentic Coding Model



Kimi K2.7 Code：开源智能体式编程模型

[**How to Use Claude Code: Step-by-Step for Beginners**](https://www. kimi. ai/resources/how-to-use-claude-code)



[**如何使用 Claude Code：初学者分步指南**](https://www. kimi. ai/resources/how-to-use-claude-code)

[**How to** on Win](https://www. kimi. ai/resources/how-to-install-openclaw-on-windows)



[**How to** on Win](https://www. kimi. ai/resources/how-to-install-openclaw-on-windows)

KIMI



KIMI

![Image block](images/p07-system.png)

System

English



System

English

**Products**

**Features**

**Use Cases**

**Featured tools**

**Models**



**产品**

**功能**

**用例**

**精选工具**

**模型**

[Kimi](https://www. kimi. ai/)

[Build](https://www. kimi. ai/features/websites)

[Build MVP sites](https://www. kimi. ai/use-cases/mvp-builder)

[Kimi K3](https://www. kimi. ai/ai-models/kimi-k3)

[AI landing page generator](https://www. kimi. ai/capabilities/ai-landing-page-generator)

[Kimi Work](https://www. kimi. ai/products/kimi-work)

[Slides](https://www. kimi. ai/features/slides)

[Create portfolio sites](https://www. kimi. ai/use-cases/portfolio-site-builder)

[Kimi K2.7 Code](https://www. kimi. ai/resources/kimi-k2-7-code)

[Image to website](https://www. kimi. ai/capabilities/image-to-website)

[Kimi Code](https://www. kimi. ai/code)

[Docs](https://www. kimi. ai/features/docs)

[Build blog sites](https://www. kimi. ai/use-cases/blog-site-creator)

[Kimi K2.6](https://www. kimi. ai/ai-models/kimi-k2-6)

[AI document generator](https://www. kimi. ai/capabilities/ai-document-generator)

[Kimi Browser Extension](https://www. kimi. ai/products/kimi-browser-extension)

[Sheets](https://www. kimi. ai/features/sheets)

[Conduct academic research](https://www. kimi. ai/use-cases/ai-for-academic-research)

[Kimi K2.5](https://www. kimi. ai/ai-models/kimi-k2-5)

[PDF to PPT converter](https://www. kimi. ai/capabilities/pdf-to-ppt)

[Kimi Platform](https://platform. kimi. ai/? from=footer_nav)

[Deep Research](https://www. kimi. ai/features/deep-research)

[Create brochures](https://www. kimi. ai/use-cases/brochure-creator)

[All models](https://www. kimi. ai/ai-models/)

[PDF translator](https://www. kimi. ai/capabilities/translate-pdf)

[Downloads](https://www. kimi. ai/products/download)

[All features](https://www. kimi. ai/features/)

[Showcases](https://www. kimi. ai/showcases/)

[AI Python code generator](https://www. kimi. ai/capabilities/ai-python-code-generator)

**Company**

[All products](https://www. kimi. ai/products/)

**Research**

[All use cases](https://www. kimi. ai/use-cases/)

[About us](https://www. moonshot. ai/about)

[AI C++ code generator](https://www. kimi. ai/capabilities/ai-cplusplus-code-generator)

**Pricing**

[Kimi K3 tech blog](https://www. kimi. ai/blog/kimi-k3)

[Moonshot AI](https://www. moonshot. ai/)

**Academy**

[Individual](https://www. kimi. ai/membership/pricing? from=footer_nav)

[All capabilities](https://www. kimi. ai/capabilities/)

[Kimi K2.6 tech blog](https://www. kimi. ai/blog/kimi-k2-6)

[Brand guidelines](https://www. kimi. ai/resources/kimi-brand)

[Kimi Work 101](https://www. kimi. ai/academy/kimi-work-getting-started)

[Business](https://www. kimi. ai/membership/pricing? from=footer_nav&tab=business)

[Kimi K2.5 tech blog](https://www. kimi. ai/blog/kimi-k2-5)

**Resources**

[Careers](https://careers. kimi. ai/)

[Kimi Code 101](https://www. kimi. ai/academy/kimi-code-cheat-sheet)

[API](https://www. kimi. ai/membership/pricing? from=footer_nav&tab=api)

[PerceptionBench](https://www. kimi. ai/blog/perception-bench)

[All tutorials](https://www. kimi. ai/academy/)

[Help center](https://www. kimi. ai/help)

[Terms of Service](https://www. kimi. ai/user/agreement/modelUse? version=v2)

[Agent Swarm](https://www. kimi. ai/blog/agent-swarm)

[AI agents explained](https://www. kimi. ai/resources/ai-agent)

**Business**

[Privacy Policy](https://www. kimi. ai/user/agreement/userPrivacy? version=v2)

[WorldVQA](https://www. kimi. ai/blog/worldvqa)

[Kimi Business](https://www. kimi. ai/business)

[Multi-agent systems](https://www. kimi. ai/resources/multi-agent)

[All research](https://www. kimi. ai/blog/)

[Contact sales](https://www. kimi. ai/membership/pricing? from=footer_nav&tab=business&open=contact-sales)

[What is vibe coding](https://www. kimi. ai/resources/what-is-vibe-coding)

[Build a landing page](https://www. kimi. ai/resources/how-to-build-landing-pages)

[Create a poster](https://www. kimi. ai/resources/create-your-poster)

[All articles](https://www. kimi. ai/resources/)



（页脚导航链接保留源文英文原文与目标 URL；栏目名意译见上列粗体组。链接条目本身不另造中文路径文案，以免偏离源站 slug.）

https://www. kimi. ai/resources/kimi-k2-7-code

7/7
