<!-- page 1 of 20 -->

KIMI

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

[Try Kimi online](https://www. kimi. ai/)

< [Research](https://www. kimi. ai/blog/)

# Kimi K2.6: Advancing Open-Source Coding # Kimi K2.6: 推进开源编程能力

[**Try Kimi K2.6**](https://www. kimi. ai/)



[**试用 Kimi K2.6**](https://www. kimi. ai/)

![Image block](images/p01-we-are-open-sourcing-our-latest-model-kimi-k2-6.png)

We are open sourcing our latest model, Kimi K2.6, featuring state-of-the-art coding, long-horizon execution, and agent swarm capabilities. Kimi K2.6 is now available via [Kimi. ai](https://www. kimi. ai/), the Kimi App, the [API](https://platform. kimi. ai/), and [Kimi Code](https://www. kimi. ai/code).



我们开源最新模型 Kimi K2.6, 主打顶尖编程, 长程执行, 以及 agent swarm 能力. Kimi K2.6 现已可通过 [Kimi. ai](https://www. kimi. ai/), Kimi App, [API](https://platform. kimi. ai/) 与 [Kimi Code](https://www. kimi. ai/code) 使用.

(「long-horizon execution」: 长程执行, 指跨很多工具调用, 很多小时仍能把工程任务做完的能力, 而不是单轮补全.)

(「agent swarm」: 智能体集群, 把任务拆给多个异构子智能体并行跑; 后文写到可扩到 300 个子智能体, 4000 协调步.)

Benchmark

Kimi K3

Kimi K2.6

GPT-5.4

Reasoning

https://www. kimi. ai/blog/kimi-k2-6

1/20

<!-- page 2 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

| Benchmark | Kimi K3 | Kimi K2.6 | GPT-5.4 |
| --- | --- | --- | --- |
| Humanity's Last Exam | 58.7 | 54.0 | 52.1 |
| GPQA Diamond | 91.2 | 88.4 | 89.6 |
| AIME 2026 | 96.7 | 93.3 | 95.0 |
| Coding |  |  |  |
| SWE-Bench Pro | 63.4 | 58.6 | 57.7 |
| Terminal-Bench 2.0 | 71.8 | 66.7 | 65.4 |



| 基准 | Kimi K3 | Kimi K2.6 | GPT-5.4 |
| --- | --- | --- | --- |
| Humanity's Last Exam | 58.7 | 54.0 | 52.1 |
| GPQA Diamond | 91.2 | 88.4 | 89.6 |
| AIME 2026 | 96.7 | 93.3 | 95.0 |
| Coding |  |  |  |
| SWE-Bench Pro | 63.4 | 58.6 | 57.7 |
| Terminal-Bench 2.0 | 71.8 | 66.7 | 65.4 |

K3 shows measurable gains in instruction following, reasoning, and multi-step task stability, outperforming K2.6 in all enterprise-grade benchmarks .



K3 在指令遵循, 推理与多步任务稳定性上有可度量提升, 并在全部企业级基准上超过 K2.6.

General Agents



通用智能体

![Chart block](images/p02-chart.png)

![Chart block](images/p02-https-www-kimi-ai-blog-kimi-k2-6.png)

https://www. kimi. ai/blog/kimi-k2-6

2/20

<!-- page 3 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

![Chart block](images/p03-chart.png)

![Chart block](images/p03-https-www-kimi-ai-blog-kimi-k2-6.png)

https://www. kimi. ai/blog/kimi-k2-6

3/20

<!-- page 4 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

![Chart block](images/p04-chart.png)

![Chart block](images/p04-long-horizon-coding.png)

## Long-Horizon Coding ## 长程编程

Kimi K2.6 shows strong improvements in long-horizon coding tasks, with reliable generalization across programming languages (e. g., Rust, Go, and Python) and tasks (e. g., front-end, devops, and performance optimization)



Kimi K2.6 在长程编程任务上有明显改进, 并能在多种语言(例如 Rust, Go, Python)与多种任务(例如前端, 运维, 性能优化)上稳定泛化.

https://www. kimi. ai/blog/kimi-k2-6

4/20

<!-- page 5 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

On Kimi Code Bench, our internal coding benchmark covering diverse complicated end-to-end tasks, Kimi K2.6 demonstrates significant improvements over Kimi K2.5.



在覆盖多样复杂端到端任务的内部编程基准 Kimi Code Bench 上, Kimi K2.6 相对 Kimi K2.5 有显著提升.

![Image block](images/p05-kimi-k2-6-demonstrates-strong-long-horizon-coding-in.png)

Kimi K2.6 demonstrates strong long-horizon coding in complex engineering tasks:

Kimi K2.6 successfully downloaded and deployed the Qwen3.5-0.8B model locally on a Mac. By implementing and optimizing model inference in Zig-a highly niche programming language-it demonstrated exceptional out-of-distribution generalization. Across 4, 000+ tool calls, over 12 hours of continuous execution, and 14 iterations, Kimi K2.6 dramatically improved throughput from \~15 to \~193 tokens/sec, ultimately achieving speeds \~20% faster than LM Studio.



Kimi K2.6 在复杂工程任务中表现出强的长程编程能力:

Kimi K2.6 成功在 Mac 本地下载并部署了 Qwen3.5-0.8B 模型. 它用 Zig(一门很冷门的语言)实现并优化模型推理, 展示出很强的分布外泛化. 全程超过 4, 000 次工具调用, 连续执行超过 12 小时, 迭代 14 轮, 吞吐从约 15 提到约 193 tokens/sec, 最终比 LM Studio 还快约 20%.

(「out-of-distribution generalization」: 分布外泛化, 指训练或常见任务里少见的语言/场景仍能做对; 这里用 Zig 推推理当例子.)

https://www. kimi. ai/blog/kimi-k2-6

5/20

<!-- page 6 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

LLM Inference on M3 Max - Performance Evolution



M3 Max 上的 LLM 推理: 性能演进

![Chart block](images/p06-kimi-k2-6-autonomously-overhauled-exchange-core-an-8.png)

Kimi K2.6 autonomously overhauled exchange-core, an 8-year-old open source financial matching engine. Over a 13-hour execution, the model iterated through 12 optimization strategies, initiating over 1, 000 tool calls to precisely modify more than 4, 000 lines of code. Acting as an expert systems architect, Kimi K2.6 analyzed CPU and allocation flame graphs to pinpoint hidden bottlenecks and boldly reconfigured the core thread topology (from 4ME+2RE to 2ME+1RE). Despite the engine already operating near its performance limits, Kimi K2.6 extracted a 185% medium throughput leap (from 0.43 to 1.24 MT/s) and a 133% performance throughput gain (soaring from 1.23 to 2.86 MT/s).



Kimi K2.6 自主大改了 exchange-core, 一个有 8 年历史的开源金融撮合引擎. 13 小时执行里, 模型迭代了 12 种优化策略, 发起超过 1, 000 次工具调用, 精确改动超过 4, 000 行代码. 它像系统架构专家一样, 分析 CPU 与分配火焰图, 定位隐藏瓶颈, 并大胆重配核心线程拓扑(从 4ME+2RE 改为 2ME+1RE). 尽管引擎已接近性能上限, Kimi K2.6 仍挖出 medium 吞吐 185% 的跃升(从 0.43 到 1.24 MT/s), 以及 performance 吞吐 133% 的增益(从 1.23 冲到 2.86 MT/s).

(「flame graphs」: 火焰图, 把 CPU 或内存分配按调用栈堆成「火焰」形状, 用来找热点函数.)

(「4ME+2RE / 2ME+1RE」: 撮合引擎里 Matching Engine 与 Risk Engine 一类角色的线程拓扑配置; 博客用缩写, 未展开每个字母全称.)

https://www. kimi. ai/blog/kimi-k2-6

6/20

<!-- page 7 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

Multi-Objective Performance Optimization



多目标性能优化

![Chart block](images/p07-in-beta-tests-k2-6-performs-well-on-long-horizon-coding.png)

In beta tests, K2.6 performs well on long-horizon coding tasks in enterprise evaluations (randomly ordered):



内测里, K2.6 在企业评测的长程编程任务上表现不错(顺序随机排列):

### Qoder



### Qoder

Kimi K2.6 delivered a strong performance in Qoder's internal evaluations, showing significant progress over K2.5. Specifically, there has been a notable increase in the frequency of tool calling and model invocations, reflecting a substantial boost in the model's proactivity and intelligence during task execution. This heightened initiative in tool calling enables the model to more actively grasp developer intent and automatically complete context, thereby minimizing user interruptions and wait times.



Kimi K2.6 在 Qoder 内部评测中表现强劲, 相对 K2.5 进步明显. 尤其是工具调用与模型调用频率显著上升, 说明任务执行时主动性与智能程度大幅增强. 更高的工具调用主动性, 让模型更能主动抓住开发者意图, 自动补全上下文, 从而减少用户打断与等待.

https://www. kimi. ai/blog/kimi-k2-6

7/20

<!-- page 8 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

Chen Xin

01 / 13

Senior Technical Expert



陈鑫

01 / 13

高级技术专家

![Image block](images/p08-coding-driven-design.png)

## Coding-Driven Design ## 编程驱动的设计

Based on the strong coding capabilities, Kimi K2.6 can turn simple prompts into complete front-end interfaces, generating structured layouts with deliberate design choices such as aesthetic hero sections, as well as interactive elements and rich animations, including scroll-triggered effects. With strong proficiency in leveraging image and video generation tools, Kimi K2.6 supports the generation of visually coherent assets and contributes to higher-quality, more salient hero sections.



依托强编程能力, Kimi K2.6 能把简单提示变成完整前端界面, 生成带刻意设计选择的结构化布局(例如美观的 hero 区), 以及交互元素与丰富动画, 包括滚动触发效果. 它还擅长调用图像与视频生成工具, 支持产出视觉一致的素材, 并帮助做出更高质量, 更醒目的 hero 区.

(「hero sections」: 落地页顶部主视觉区块, 通常放大标题, 主图与主行动按钮.)

Moreover, Kimi K2.6 expands beyond static frontend development to simple full-stack workflows-spanning authentication to user interaction to database operations for lightweight use cases like transaction logging or session management.



此外, Kimi K2.6 从静态前端扩展到简单全栈工作流, 覆盖鉴权, 用户交互到数据库操作, 适合交易日志或会话管理一类轻量场景.

We established an internal Kimi Design Bench, organized into four categories: Visual Input Tasks, Landing Page Construction, Full-Stack Application Development, and General Creative Programming. In comparison with Google AI Studio, Kimi K2.6 shows promising results and performs well across these categories.



我们建立了内部 Kimi Design Bench, 分四类: 视觉输入任务, 落地页构建, 全栈应用开发, 通用创意编程. 与 Google AI Studio 相比, Kimi K2.6 结果可观, 并在这些类别上表现良好.

https://www. kimi. ai/blog/kimi-k2-6

8/20

<!-- page 9 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

Kimi K2.6 Agent via kimi. com's harnesses vs. Gemini 3.1 Pro via Google AI Studio



经 kimi. com harness 的 Kimi K2.6 Agent, 对比经 Google AI Studio 的 Gemini 3.1 Pro

![Image block](images/p09-kimi-better.png)

Kimi better

TieGoogle better



Kimi 更好 / 平局 / Google 更好

Below are examples generated by [K2.6 Agent](https://www. kimi. ai/build) from a single prompt, with preconfigured harnesses and tools:



以下是 [K2.6 Agent](https://www. kimi. ai/build) 在预配置 harness 与工具下, 由单条提示生成的示例:

(「harness」: 这里指把模型, 工具与运行脚手架捆在一起的评测/交付套件, 不只是裸模型调用.)

https://www. kimi. ai/blog/kimi-k2-6

9/20

<!-- page 10 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

## Agent Swarms, Elevated ## Agent Swarm 再升级

Scaling out, not just up. An Agent Swarm dynamically decomposes tasks into heterogeneous subtasks executed concurrently by self-created domainspecialized agents.



横向扩展, 而不只是纵向变强. Agent Swarm 会把任务动态拆成异构子任务, 再由自创建的领域特化智能体并发执行.

Based on the K2.5 Agent Swarm research preview, [Kimi K2.6 Agent Swarm](https://www. kimi. ai/agent-swarm) demonstrates a qualitative leap in the agent swarm experience. It seamlessly



基于 K2.5 Agent Swarm 研究预览, [Kimi K2.6 Agent Swarm](https://www. kimi. ai/agent-swarm) 在集群体验上有质的飞跃. 它能无缝

https://www. kimi. ai/blog/kimi-k2-6

10/20

<!-- page 11 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

coordinates heterogeneous agents to combine complementary skills: broad search layered with deep research, large-scale document analysis fused with long-form writing, and multi-format content generation executed in parallel. This compositional intelligence enables the swarm to deliver end-to-end outputs-spanning documents, websites, slides, and spreadsheets-within a single autonomous run.



协调异构智能体, 把互补技能组合起来: 广搜叠加深研, 大规模文档分析融进长文写作, 以及多格式内容并行生成. 这种组合式智能让集群能在一次自主运行里交付端到端产物, 覆盖文档, 网站, 幻灯片与表格.

The architecture scales horizontally to 300 sub-agents executing across 4, 000 coordinated steps simultaneously, a substantial expansion from K2.5's 100 sub-agents and 1, 500 steps. This massive parallelization fundamentally reduces end-to-end latency while significantly enhancing output quality and expanding the operational boundaries of Agents swarms.



架构可横向扩到 300 个子智能体, 在 4, 000 个协调步上同时执行, 相对 K2.5 的 100 个子智能体与 1, 500 步有大幅扩展. 这种大规模并行从根本上降低端到端延迟, 同时显著抬高输出质量, 并拓宽 Agent Swarm 的作业边界.

It can also turn any high-quality files such as PDFs, spreadsheets, slides, and Word documents into Skills. Kimi K2.6 captures and maintains the documents' structural and stylistic DNA, enabling you to reproduce the same quality and format in future tasks.



它还能把高质量文件(例如 PDF, 表格, 幻灯片与 Word)变成 Skills. Kimi K2.6 捕捉并维持文档的结构与风格 DNA, 便于在后续任务里复现同样质量与版式.

(「Skills」: 可复用的能力包; 这里指把某份高质量文件的结构/风格固化下来, 供以后任务调用.)

Here are some examples:



示例如下:

https://www. kimi. ai/blog/kimi-k2-6

11/20

<!-- page 12 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

## Proactive Agents ## 主动式智能体

K2.6 demonstrates strong performance in autonomous, proactive agents such as [OpenClaw](https://openclaw. ai/) and [Hermes](https://hermes-agent. nousresearch. com/), which operate across multiple applications with continuous, 24/7 execution.



K2.6 在 [OpenClaw](https://openclaw. ai/) 与 [Hermes](https://hermes-agent. nousresearch. com/) 一类自主, 主动式智能体上表现强劲; 这些智能体跨多个应用运行, 并可持续 7×24 执行.

Unlike simple chat-based interactions, these workflows require AI to proactively manage schedules, execute code, and orchestrate cross-platform operations as a persistent background agent.



与简单聊天不同, 这类工作流要求 AI 像常驻后台智能体一样, 主动管日程, 执行代码, 并编排跨平台操作.

Our RL infra team used a K2.6-backed agent that operated autonomously for 5 days, managing monitoring, incident response, and system operations, demonstrating persistent context, multi-threaded task handling, and fullcycle execution from alert to resolution. Here is K2.6's worklog (anonymized to remove sensitive information):



我们的 RL 基础设施团队用过一个由 K2.6 驱动的智能体, 自主运行了 5 天, 负责监控, 事故响应与系统运维, 展示了持久上下文, 多线程任务处理, 以及从告警到解决的全周期执行. 以下是 K2.6 的工作日志(已脱敏):

Kimi K2.6 delivers measurable improvements in real-world reliability: more precise API interpretation, stabler long-running performance, and enhanced safety awareness during extended research tasks.



Kimi K2.6 在真实可靠性上有可度量改进: API 解释更准, 长跑更稳, 以及在长时研究任务中更强的安全意识.

https://www. kimi. ai/blog/kimi-k2-6

12/20

<!-- page 13 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

Performance gains are quantified by our internal Claw Bench, the evaluation suite spanning five domains: Coding Tasks, IM Ecosystem Integration, Information Research & Analysis, Scheduled Task Management, and Memory Utilization. Across all metrics, Kimi K2.6 significantly outperforms Kimi K2.5 in task completion rates and tool invocation accuracy-particularly in workflows requiring sustained autonomous operation without human oversight.



性能增益由内部 Claw Bench 量化; 该评测套件覆盖五个域: 编程任务, 即时通讯生态集成, 信息研究与分析, 定时任务管理, 记忆利用. 在全部指标上, Kimi K2.6 在任务完成率与工具调用准确率上显著超过 Kimi K2.5, 尤其是在需要无人值守, 持续自主运行的工作流里.

![Image block](images/p13-bring-your-own-agents.png)

## Bring Your Own Agents ## 自带智能体

Building upon Kimi K2.6's robust orchestration capabilities, Kimi K2.6 extends your proactive agents to Claw Groups as a research preview-a new instantiation of the Agent Swarm architecture.



在 Kimi K2.6 稳健编排能力之上, 它把你的主动式智能体扩展到 Claw Groups(研究预览). 这是 Agent Swarm 架构的一种新实例化.

Claw Groups embrace an open, heterogeneous ecosystem: Multiple agents and humans operate as true collaborators. Users can onboard agents from any device, running any model, each carrying their own specialized toolkits, skills and persistent memory contexts. Whether deployed on local laptops,



Claw Groups 拥抱开放, 异构生态: 多个智能体与人作为真正协作者共事. 用户可从任意设备接入智能体, 跑任意模型, 各自带着专用工具包, skills 与持久记忆上下文. 无论部署在本地笔记本,

https://www. kimi. ai/blog/kimi-k2-6

13/20

<!-- page 14 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

mobile devices, or cloud instances, these diverse agents integrate seamlessly into a shared operational space.



移动设备还是云实例, 这些多样智能体都能无缝并入共享作业空间.

At the center of this swarm, Kimi K2.6 serves as an adaptive coordinator. It dynamically matches tasks to agents based on their specific skill profiles and available tools, optimizing for capability fit. When an agent encounters failure or stalls, the coordinator detects the interruption, automatically reassigns the task or regenerates subtasks, and actively manages the full lifecycle of deliverables-from initiation through validation to completion.



在这个集群中心, Kimi K2.6 充当自适应协调器. 它按各智能体的技能画像与可用工具动态匹配任务, 优化能力契合度. 某智能体失败或卡住时, 协调器会察觉中断, 自动改派任务或重生子任务, 并主动管理交付物全生命周期, 从启动, 校验到完成.

We also want to thank the K2.6-powered agents in Claw Groups-we've been dogfooding our own agent marketing team by refining human–agent workflows in practice. Using Claw Groups, we run end-to-end content production and launch campaigns, with specialized agents like Demo Makers, Benchmark Makers, Social Media Agents, and Video Makers working together. K2.6 coordinates the process, enabling agents to share intermediate results and turn ideas into consistent, fully packaged deliverables.



我们也要感谢 Claw Groups 里由 K2.6 驱动的智能体. 我们一直在自用自己的智能体营销团队, 在实践中打磨人机工作流. 借助 Claw Groups, 我们跑端到端内容生产与上线活动, Demo Makers, Benchmark Makers, Social Media Agents, Video Makers 等特化智能体一起协作. K2.6 协调流程, 让智能体共享中间结果, 把想法变成风格一致, 打包完整的交付物.

(「dogfooding」: 自用自家产品, 用真实业务压力验工作流.)

https://www. kimi. ai/blog/kimi-k2-6

14/20

<!-- page 15 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

We are moving beyond simply asking AI a question or assigning AI a task, and entering a phase where human and AI collaborate as genuine partners- combining strengths to solve problems collectively. Claw Groups marks our latest efforts toward a future where the boundaries between "my agent," "your agent," and "our team" dissolve seamlessly into a collaborative system.



我们正走出「只问 AI 一句」或「只派 AI 一项任务」的阶段, 进入人与 AI 作为真正伙伴协作, 合力解题的阶段. Claw Groups 是我们朝向这一未来的最新努力: 让「我的智能体」「你的智能体」与「我们的团队」之间的边界, 平滑融进同一套协作系统.

## Benchmark Table ## 基准表

To reproduce official Kimi-K2.6 benchmark results, we recommend using the official API. For third-party providers, refer to Kimi Vendor Verifier (KVV) to choose high-accuracy services. Details: [https://www. kimi. ai/blog/kimi-vendor-verifier](https://www. kimi. ai/blog/kimi-vendor-verifier)



要复现官方 Kimi-K2.6 基准结果, 建议用官方 API. 第三方服务请参考 Kimi Vendor Verifier(KVV)挑选高准确度服务. 细节: [https://www. kimi. ai/blog/kimi-vendor-verifier](https://www. kimi. ai/blog/kimi-vendor-verifier)

## Footnotes ## 脚注

https://www. kimi. ai/blog/kimi-k2-6

15/20

<!-- page 16 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

### 1. General Testing Details ### 1. 一般测试细节

We report results for Kimi K2.6 and Kimi K2.5 with thinking mode enabled, Claude Opus 4.6 with max effort, GPT-5.4 with xhigh reasoning effort, and Gemini 3.1 Pro with a high thinking level.



我们报告的是: Kimi K2.6 与 Kimi K2.5 开启 thinking 模式; Claude Opus 4.6 用 max effort; GPT-5.4 用 xhigh reasoning effort; Gemini 3.1 Pro 用 high thinking level.

Unless otherwise specified, all Kimi K2.6 experiments were conducted with temperature = 1.0, top-p = 1.0, and a context length of 262, 144 tokens.



除非另有说明, 所有 Kimi K2.6 实验均用 temperature = 1.0, top-p = 1.0, 上下文长度 262, 144 tokens.

Benchmarks without publicly available scores were re-evaluated under the same conditions used for Kimi K2.6 and are marked with an asterisk (\*). Except where noted with an asterisk, all other results are cited from official reports.



没有公开分数的基准, 会在与 Kimi K2.6 相同条件下重评, 并标星号(\*). 除标星号者外, 其余结果引自官方报告.

### 2. Reasoning Benchmarks ### 2. 推理基准

IMO-AnswerBench scores for GPT-5.4 and Claude 4.6 were obtained from [https://z. ai/blog/glm-5.1](https://z. ai/blog/glm-5.1).



GPT-5.4 与 Claude 4.6 的 IMO-AnswerBench 分数来自 [https://z. ai/blog/glm-5.1](https://z. ai/blog/glm-5.1).

Humanity's Last Exam (HLE) and other reasoning tasks were evaluated with a maximum generation length of 98, 304 tokens. By default, we report results on the HLE full set. For the text-only subset, Kimi K2.6 achieves 36.4% accuracy without tools and 55.5% with tools.



Humanity's Last Exam(HLE)及其他推理任务的最大生成长度为 98, 304 tokens. 默认报告 HLE 全集结果. 纯文本子集上, Kimi K2.6 无工具准确率 36.4%, 有工具 55.5%.

### 3. Tool-Augmented / Agentic Tasks ### 3. 工具增强 / 智能体任务

Kimi K2.6 was equipped with search, code-interpreter, and webbrowsing tools for HLE with tools, BrowseComp, DeepSearchQA, and WideSearch.



在 HLE with tools, BrowseComp, DeepSearchQA 与 WideSearch 上, Kimi K2.6 配备了搜索, 代码解释器与网页浏览工具.

For HLE-Full with tools, the maximum generation length is 262, 144 tokens with a per-step limit of 49, 152 tokens. We employ a simple context management strategy: once the context window exceeds the



对 HLE-Full with tools, 最大生成长度为 262, 144 tokens, 每步上限 49, 152 tokens. 我们采用简单的上下文管理策略: 一旦上下文窗口超过

https://www. kimi. ai/blog/kimi-k2-6

16/20

<!-- page 17 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

threshold, only the most recent round of tool-related messages is retained.



阈值, 就只保留最近一轮与工具相关的消息.

For BrowseComp, we report scores obtained with context management using the same discard-all strategy as Kimi K2.5 and DeepSeek-V3.2.



对 BrowseComp, 我们报告在启用上下文管理, 并采用与 Kimi K2.5 及 DeepSeek-V3.2 相同的 discard-all 策略时得到的分数.

(「discard-all」: 超阈值后整段丢弃更早工具/交互历史的一种截断策略, 相对「只藏工具结果」等变体更狠.)

For DeepSearchQA, no context management was applied to Kimi K2.6 tests, and tasks exceeding the supported context length were directly counted as failed. Scores for Claude Opus 4.6, GPT-5.4, and Gemini 3.1 Pro on DeepSearchQA are cited from the [Claude Opus 4.7 System Card](https://cdn. sanity. io/files/4zrzovbb/website/037f06850df7fbe871e206dad004c3db5fd50340. pdf).



对 DeepSearchQA, Kimi K2.6 测试未做上下文管理; 超出支持上下文长度的任务直接记失败. Claude Opus 4.6, GPT-5.4 与 Gemini 3.1 Pro 在 DeepSearchQA 上的分数引自 [Claude Opus 4.7 System Card](https://cdn. sanity. io/files/4zrzovbb/website/037f06850df7fbe871e206dad004c3db5fd50340. pdf).

For WideSearch, we report results under the "hide tool result" context management setting. Once the context window exceeds the threshold, only the most recent round of tool-related messages is retained.



对 WideSearch, 我们报告「hide tool result」上下文管理设定下的结果. 一旦上下文超过阈值, 只保留最近一轮工具相关消息.

(「hide tool result」: 藏起更早的工具返回正文, 只留最近一轮, 用来省上下文.)

The test system prompts are identical to those used in the [Kimi K2.5 technical report](https://arxiv. org/pdf/2602.02276).



测试用系统提示与 [Kimi K2.5 技术报告](https://arxiv. org/pdf/2602.02276) 相同.

Claw Eval was conducted using version 1.1 with max-tokens-per-step = 16384.



Claw Eval 使用 1.1 版, max-tokens-per-step = 16384.

For APEX-Agents, we evaluate 452 tasks from the public 480-task release, as done by [Artificial Analysis](https://artificialanalysis. ai/evaluations/apex-agents-aa) (excluding Investment Banking Worlds 244 and 246, which have external runtime dependencies).



对 APEX-Agents, 我们评 480 任务公开集中的 452 个, 做法与 [Artificial Analysis](https://artificialanalysis. ai/evaluations/apex-agents-aa) 相同(排除有外部运行时依赖的 Investment Banking Worlds 244 与 246).

### 4. Coding Tasks ### 4. 编程任务

Terminal-Bench 2.0 scores were obtained with the default agent framework (Terminus-2) and the provided JSON parser, operating in preserve thinking mode.



Terminal-Bench 2.0 分数用默认智能体框架(Terminus-2)与所提供的 JSON 解析器, 在 preserve thinking 模式下得到.

(「preserve thinking」: 多轮里保留前序思维内容, 避免工具调用链中丢掉中间结论.)

For the SWE-Bench series of evaluations (including Verified, Multilingual, and Pro), we used an in-house evaluation framework adapted from SWE-agent. This framework includes a minimal set of tools-bash tool, createfile tool, insert tool, view tool, strreplace tool, and submit tool.



对 SWE-Bench 系列(含 Verified, Multilingual, Pro), 我们用基于 SWE-agent 改造的内部评测框架. 工具集尽量小: bash, createfile, insert, view, strreplace, submit.

https://www. kimi. ai/blog/kimi-k2-6

17/20

<!-- page 18 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

All reported scores for coding tasks are averaged over 10 independent runs.



编程任务报告分数均为 10 次独立运行的平均.

### 5. Vision Benchmarks ### 5. 视觉基准

Max-tokens = 98, 304, averaged over three runs (avg@3).



Max-tokens = 98, 304, 三次运行平均(avg@3).

Settings with Python tool use max-tokens-per-step = 65, 536 and maxsteps = 50 for multi-step reasoning.



带 Python 工具的设定: max-tokens-per-step = 65, 536, 多步推理 maxsteps = 50.

MMMU-Pro follows the official protocol, preserving input order and prepending images.



MMMU-Pro 遵循官方协议, 保留输入顺序并把图像前置.

**Products**

**Features**

**Use Cases**

[Kimi](https://www. kimi. ai/)

[Build](https://www. kimi. ai/features/websites)

[Build MVP sites](https://www. kimi. ai/use-cases/mvp-builder)

[Kimi Work](https://www. kimi. ai/products/kimi-work)

[Slides](https://www. kimi. ai/features/slides)

[Create portfolio sites](https://www. kimi. ai/use-cases/portfolio-site-builder)

[Kimi Code](https://www. kimi. ai/code)

[Docs](https://www. kimi. ai/features/docs)

[Build blog sites](https://www. kimi. ai/use-cases/blog-site-creator)

[Kimi Browser Extension](https://www. kimi. ai/products/kimi-browser-extension)

[Sheets](https://www. kimi. ai/features/sheets)

[Conduct academic research](https://www. kimi. ai/use-cases/ai-for-academic-research)

[Kimi Platform](https://platform. kimi. ai/? from=footer_nav)

[Deep Research](https://www. kimi. ai/features/deep-research)

[Create brochures](https://www. kimi. ai/use-cases/brochure-creator)

[Downloads](https://www. kimi. ai/products/download)

[All features](https://www. kimi. ai/features/)

[Showcases](https://www. kimi. ai/showcases/)

[All products](https://www. kimi. ai/products/)

https://www. kimi. ai/blog/kimi-k2-6

18/20

<!-- page 19 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

## Research ## 研究

[All use cases](https://www. kimi. ai/use-cases/)

[Individual](https://www. kimi. ai/membership/pricing? from=footer_nav)

[Kimi K3 tech blog](https://www. kimi. ai/blog/kimi-k3)

**Academy**

[Business](https://www. kimi. ai/membership/pricing? from=footer_nav&tab=business)

[Kimi K2.6 tech blog](https://www. kimi. ai/blog/kimi-k2-6)

[Kimi Work 101](https://www. kimi. ai/academy/kimi-work-getting-started)

[API](https://www. kimi. ai/membership/pricing? from=footer_nav&tab=api)

[Kimi K2.5 tech blog](https://www. kimi. ai/blog/kimi-k2-5)

[Kimi Code 101](https://www. kimi. ai/academy/kimi-code-cheat-sheet)

[PerceptionBench](https://www. kimi. ai/blog/perception-bench)

**Business**

[All tutorials](https://www. kimi. ai/academy/)

[Agent Swarm](https://www. kimi. ai/blog/agent-swarm)

[Kimi Business](https://www. kimi. ai/business)

[Contact sales](https://www. kimi. ai/membership/pricing? from=footer_nav&tab=business&open=contact-sales)

[WorldVQA](https://www. kimi. ai/blog/worldvqa)

[All research](https://www. kimi. ai/blog/)

**Featured tools**

**Models**

[AI landing page generator](https://www. kimi. ai/capabilities/ai-landing-page-generator)

[Kimi K3](https://www. kimi. ai/ai-models/kimi-k3)

[Kimi K2.7 Code](https://www. kimi. ai/resources/kimi-k2-7-code)

[Image to website](https://www. kimi. ai/capabilities/image-to-website)

[Kimi K2.6](https://www. kimi. ai/ai-models/kimi-k2-6)

[AI document generator](https://www. kimi. ai/capabilities/ai-document-generator)

[Kimi K2.5](https://www. kimi. ai/ai-models/kimi-k2-5)

[PDF to PPT converter](https://www. kimi. ai/capabilities/pdf-to-ppt)

[All models](https://www. kimi. ai/ai-models/)

[PDF translator](https://www. kimi. ai/capabilities/translate-pdf)

[AI Python code generator](https://www. kimi. ai/capabilities/ai-python-code-generator)

**Company**

[AI C++ code generator](https://www. kimi. ai/capabilities/ai-cplusplus-code-generator)

[About us](https://www. moonshot. ai/about)

[All capabilities](https://www. kimi. ai/capabilities/)

[Moonshot AI](https://www. moonshot. ai/)

[Brand guidelines](https://www. kimi. ai/resources/kimi-brand)

**Resources**

[Careers](https://careers. kimi. ai/)

[Help center](https://www. kimi. ai/help)

[Terms of Service](https://www. kimi. ai/user/agreement/modelUse? version=v2)

[AI agents explained](https://www. kimi. ai/resources/ai-agent)

[Privacy Policy](https://www. kimi. ai/user/agreement/userPrivacy? version=v2)

[Multi-agent systems](https://www. kimi. ai/resources/multi-agent)

[What is vibe coding](https://www. kimi. ai/resources/what-is-vibe-coding)

[Build a landing page](https://www. kimi. ai/resources/how-to-build-landing-pages)

[Create a poster](https://www. kimi. ai/resources/create-your-poster)

[All articles](https://www. kimi. ai/resources/)

https://www. kimi. ai/blog/kimi-k2-6

19/20

<!-- page 20 of 20 -->

2026/9/25 08: 47

Kimi K2.6 Tech Blog: Advancing Open-Source Coding

![Image block](images/p20-https-www-kimi-ai-blog-kimi-k2-6.png)

https://www. kimi. ai/blog/kimi-k2-6

20/20
