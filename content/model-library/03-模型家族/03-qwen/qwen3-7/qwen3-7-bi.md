---
title: "Qwen3.7-Max · 对照译稿"
category: "模型库"
tags: ["Qwen", "对照译稿"]
published: true
excerpt: "Qwen3.7-Max 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 4 -->

Official model card source: https://raw.githubusercontent.com/AlibabaCloud-Official/Qwen3.7-max-readme/main/README.md

官方模型卡源: https://raw.githubusercontent.com/AlibabaCloud-Official/Qwen3.7-max-readme/main/README.md

Related official blog: https://qwen.ai/blog?id=qwen3.7

相关官方博客: https://qwen.ai/blog?id=qwen3.7

# Qwen3.7: The Agent Frontier

Qwen3.7-Max is built to be a versatile agent foundation — equally capable of writing and debugging code, automating office workflows, and sustaining autonomous execution across hundreds or thousands of steps.

Qwen3.7-Max 被写成通用 agent 底座 — 在写改代码, 办公工作流自动化, 以及跨数百到数千步的持续自主执行上, 官方用 equally capable 并提.

What sets Qwen3.7-Max apart is the breadth and depth of its agent capabilities. It excels as a coding agent, from frontend prototyping to complex multi-file engineering. It serves as a reliable office and productivity assistant through MCP integrations and multi-agent orchestration. It sustains coherent reasoning across extremely long horizons — as demonstrated by a 35-hour, full autonomous kernel optimization run comprising over 1,000 tool calls. It generalizes across agent scaffolds, performing consistently whether deployed through Claude Code, OpenClaw, Qwen Code, or other frameworks.

拉开差距的, 官方写的是 agent 能力的广度与深度. 编码 agent 从前端原型做到复杂多文件工程; 办公与生产力助手靠 MCP 集成与多智能体编排; 极长程上保持连贯推理 — 例证是约 35 小时, 全程自主的内核优化跑, 工具调用超过 1,000 次; 并在多种 agent scaffold 上泛化, 写明 Claude Code, OpenClaw, Qwen Code 或其他框架下表现一致.

> **想:** 开篇 「equally capable」 把写改代码, 办公自动化, 长程自主执行写成同等能力, 同页后文与对照表是否真把三块抬到同一量级?
> 正文把三块并列, 但表是分栏的. Coding Agent 块里 Terminal Bench 2.0-Terminus 上 Qwen3.7-Max 为 69.7, 同表最高; 办公向如 SpreadSheetBench-v1 为 87.0, 低于 Opus-4.6Max 的 89.3; 长程叙事主要落在后文 35 小时内核跑与 YC-Bench, 不在 Coding Agent 表头下给单一总分. 「equally」 是宣传句, 不是表上已对齐的三块总分.

**Qwen3.7-Max** — now available via [Alibaba Cloud Model Studio](https://click.alibabacloud.com/m/20000000960/):

**Qwen3.7-Max** — 现可通过 [Alibaba Cloud Model Studio](https://click.alibabacloud.com/m/20000000960/) 使用:

\- frontier coding agent: from frontend prototyping to complex software engineering

\- 前沿编码 agent: 从前端原型到复杂软件工程

\- office productivity and workflow automation via MCP and multi-agent orchestration

\- 办公生产力与工作流自动化, 经 MCP 与多智能体编排

\- sustained autonomous execution across long-horizon tasks

\- 跨长程任务的持续自主执行

\- cross-scaffold generalization across diverse agent frameworks

\- 跨多种 agent 框架的 scaffold 泛化

Call via API on [Alibaba Cloud Model Studio](https://click.alibabacloud.com/m/20000000960/).

在 [Alibaba Cloud Model Studio](https://click.alibabacloud.com/m/20000000960/) 上经 API 调用.

## 📊 Benchmark Performance

| Benchmark | Opus-4.6Max | K2.6Thinking | GLM-5.1Thinking | DS-V4-ProMax | Qwen3.6-Plus | Qwen3.7-Max |
| --- | --- | --- | --- | --- | --- | --- |
| Coding Agent |  |  |  |  |  |  |
| Terminal Bench 2.0- Terminus | 65.4 | 66.7 | 63.5 | 67.9 | 61.6 | 69.7 |
| SWE-Verified | 80.8 | 80.2 | -- | 80.6 | 78.8 | 80.4 |
| SWE-Pro | 57.3 | 59.5 | 58.8 | 59.0 | 56.6 | 60.6 |
| SWE-Multilingual | 77.5 | 76.7 | -- | 76.2 | 73.8 | 78.3 |
| NL2repo | 47.6 | 42.8 | 41.0 | 35.5 | 34.4 | 47.2 |
| SciCode | 51.9 | 52.2 | 45.1 | -- | 41.4 | 53.5 |
| QwenWebDev | 1617 | -- | 1564 | 1570 | 1500 | 1568 |
| QwenSVG | 1541 | 1325 | 1605 | 1506 | 1432 | 1608 |

(表结构与源文一致; 数字一字不改. Coding Agent 分组行跨列占位. `--` 为源文空缺.)

> **看表:** Terminal Bench 2.0-Terminus 上 Qwen3.7-Max 69.7 列内最高, 同块 SWE-Verified 80.4 却低于 Opus-4.6Max 的 80.8 与 DS-V4-ProMax 的 80.6, 开篇 「frontier coding agent」 应以哪一格为准?
> 源文没有声明哪一项是主指标. 它只并列给出 Terminal Bench, SWE-Verified, SWE-Pro, SWE-Multilingual, NL2repo, SciCode, QwenWebDev, QwenSVG. 读表应分行引用: Terminal / SWE-Pro / SWE-Multilingual / SciCode 等格上 Max 领先或并列前列, SWE-Verified 与 QwenWebDev 并非列内第一. 不能把单格最高扩成整块 Coding Agent 全胜.

<!-- page 2 of 4 -->

| Benchmark | Opus-4.6Max | K2.6Thinking | GLM-5.1Thinking | DS-V4-ProMax | Qwen3.6-Plus | Qwen3.7-Max |
| --- | --- | --- | --- | --- | --- | --- |
| General Agent |  |  |  |  |  |  |
| Qwencllaw | 65.5 | 54.7 | 58.7 | 59.2 | 57.2 | 64.3 |
| CoWorkBench | 68.2 | 58.2 | 66.0 | 66.3 | 64.5 | 67.2 |
| ClawEval | 70.4 | 61.5 | 62.7 | 58.4 | 57.1 | 65.2 |
| SkillsBench | -- | 56.2 | 53.1 | 52.3 | 45.7 | 59.2 |
| BFCL-v4 | 76.7 | 71.3 | 70.9 | 70.6 | 68.9 | 75.0 |
| MCP-Mark | 56.7 | 55.9 | 57.5 | 57.1 | 48.2 | 60.8 |
| MCP-Atlas | 75.8 | 66.6 | 71.8 | 73.6 | 74.1 | 76.4 |
| Vitabench | -- | 39.1 | 45.1 | 51.9 | 42.8 | 47.9 |
| SpreadSheetBench-v1 | 89.3 | 84.5 | 85.2 | 84.9 | 80.2 | 87.0 |
| Kernel Bench L3 | 2.63/98% | 1.41/80% | 2.00/78% | 1.07/54% | 1.03/48% | 1.98/96% |
| HLE w/ tools | 53.0 | 54.0 | 52.3 | 48.2 | 50.2 | 53.5 |
| QwenWorldBench | 56.1 | 50.9 | 50.2 | 52.3 | 47.6 | 57.3 |
| STEM &amp; Reasoning |  |  |  |  |  |  |
| GPQA Diamond | 91.3 | 90.5 | 86.2 | 90.1 | 90.4 | 92.4 |
| HLE | 40.0 | 36.4 | 34.7 | 37.7 | 28.8 | 41.4 |
| LiveCodeBench | 88.8 | 89.6 | -- | 93.5 | 87.1 | 91.6 |
| HMMT 2026 Feb | 96.2 | 92.7 | 89.4 | 95.2 | 87.8 | 97.1 |
| IMOAnswerBench | 75.3 | 86.0 | 83.8 | 89.6 | 83.8 | 90.0 |
| CritPT | 12.6 | 8.0 | 4.6 | 12.9 | 2.9 | 11.4 |
| Apex | 34.5 | 24.0 | 11.5 | 38.3 | 8.8 | 44.5 |
| General Capability |  |  |  |  |  |  |
| MMLU-Pro | 89.7 | 87.1 | 86.3 | 87.5 | 68.5 | 89.6 |
| MMLU-Redux | 95.2 | 95.3 | 94.3 | 94.8 | 94.5 | 95.0 |
| SuperGPQA | 72.5 | 71.3 | 68.0 | 69.9 | 71.6 | 73.6 |
| IFEval | 91.9 | 94.5 | 94.5 | 91.9 | 94.3 | 94.3 |
| IFBench | 62.5 | 76.0 | 76.0 | 77.0 | 74.2 | 79.1 |
| MRCR-v2 128k | 84.0 | 63.1 | 62.0 | 74.4 | 85.9 | 90.4 |
| Multilingualism |  |  |  |  |  |  |
| WMT24++ | 82.7 | 81.6 | 81.8 | 82.2 | 84.3 | 85.8 |
| MAXIFE | 81.3 | 87.7 | 87.7 | 88.9 | 88.2 | 89.2 |
| MMMLU | 90.6 | 87.5 | 87.2 | 87.9 | 89.5 | 90.3 |
| MMLU-ProX | 86.1 | 83.7 | 83.9 | 83.9 | 84.7 | 87.0 |
| NOVA-63 | 59.1 | 56.7 | 54.6 | 52.8 | 57.9 | 59.0 |
| INCLUDE | 87.4 | 84.2 | 84.3 | 86.1 | 85.1 | 86.2 |
| Global PIQA | 91.2 | 89.2 | 89.5 | 90.5 | 89.8 | 91.4 |

> **核对:** 表名 「Qwencllaw」 与正文 「OpenClaw」 是否同一套评测名?
> 源文正文写 deployed through Claude Code, OpenClaw, Qwen Code; General Agent 表有一行 Qwencllaw(65.5 / 54.7 / 58.7 / 59.2 / 57.2 / 64.3). 材料没有写 Qwencllaw 是否即 OpenClaw 的拼写变体, 也没有给协议链接. 引用时应保留表上原拼写 Qwencllaw, 不要自行改成 OpenClaw 分数.

> **拆开:** Kernel Bench L3 写成 「1.98/96%」, Opus 是 「2.63/98%」, 斜杠前后各指什么?
> 源文只给这种复合串, 没有脚注解释分子, 分母或单位. 同节后文 Self-Evolving 另报 10.0x geometric mean speedup, 也不说明是否与 Kernel Bench L3 的 1.98/96% 同一协议. 表上只能逐格抄写复合值, 不能把 1.98 读成加速比或把 96% 读成通关率而不加限定.

> **问:** LiveCodeBench 上 DS-V4-ProMax 93.5 高于 Qwen3.7-Max 的 91.6, 同页 STEM 叙事是否仍把 Max 写成全面领先?
> 源文没有用 「全面领先」 四字; STEM & Reasoning 块是分项表. Max 在 GPQA Diamond 92.4, HLE 41.4, HMMT 2026 Feb 97.1, Apex 44.5 等格列内最高或接近最高, LiveCodeBench 与 CritPT(11.4, 低于 DS 12.9 与 Opus 12.6)并非列内第一. 选型应分行读, 不要用块标题盖住回落格.

<!-- page 3 of 4 -->

| Benchmark | Opus-4.6Max | K2.6Thinking | GLM-5.1Thinking | DS-V4-ProMax | Qwen3.6-Plus | Qwen3.7-Max |
| --- | --- | --- | --- | --- | --- | --- |
| PolyMATH | 80.2 | 82.7 | 67.6 | 72.0 | 77.4 | 86.5 |

## Cowork Productivity Assistant

Qwen3.7-Max serves as your advanced coworker for real-world productivity. Its powerful agent capabilities fundamentally streamline professional workflows — synthesizing complex information, performing in-depth data analysis and modeling, and generating publication-ready documents and visualizations — to reliably handle high-complexity enterprise workloads.

Qwen3.7-Max 被写成真实生产力场景里的高级同事. 官方称其 agent 能力从根上理顺专业工作流 — 综合复杂信息, 做深入数据分析与建模, 生成可发表级文档与可视化 — 以稳定承接高复杂度企业负载.

Qwen3.7-Max features native compatibility with mainstream agent harnesses. For long-horizon tasks, it supports autonomous planning and continuous execution across multi-hour sessions.

它写明与主流 agent harness 原生兼容. 对长程任务, 支持跨数小时会话的自主规划与连续执行.

## Agent Scaling

Building on the environment scaling approach introduced in Qwen3.5, we have continued to aggressively expand both the quality and diversity of agentic training environments in Qwen3.7. Just as language models generalize from diverse pretraining text, we find that agentic capabilities generalize from diverse training environments.

在 Qwen3.5 引入的 environment scaling 做法上, 官方称 Qwen3.7 继续大幅扩展 agentic 训练环境的质量与多样性. 类比语言模型从多样预训练文本泛化, 文中写 agentic 能力从多样训练环境泛化.

> **确认:** 这里的 Agent Scaling / environment scaling 是部署前训练环境扩张, 还是 TestingTime 加算力?
> 原文写 expand ... agentic training environments, 并与 pretraining text 类比, 落点是训练环境, 属于部署前. 全篇没有写 TestingTime 预算, 采样次数或额外搜索. 不要把本节 Scaling 读成推理时加算力.

## Cross-Harness Generalization

Our Rollout environment infrastructure decouples each training instance into three orthogonal components — Task, Harness, and Verifier — that can be freely recombined. This decoupled design enables combinatorial scaling, forcing the model to learn generalizable problem-solving strategies rather than harness-specific shortcuts.

官方 Rollout 环境基础设施把每个训练实例拆成三个正交部件 — Task, Harness, Verifier — 可自由重组. 解耦设计用于组合式扩张, 文中称由此迫使模型学可泛化解题策略, 而不是 harness 特有捷径.

> **停一下:** 拆成 Task / Harness / Verifier 之后, 文中如何证明学到的不是 Verifier 捷径, 而是 「generalizable problem-solving strategies」?
> 源文只给设计动机句 forcing the model to..., 没有消融, 没有 「换 Verifier 后分数是否掉」 的实验, 也没有捷径率指标. Cross-scaffold 表现一致是产品主张, 表上 Qwencllaw / ClawEval 等行是对照分数, 二者都不是对本句机制的证明. 能核对的只有三分法与 freely recombined 这一设计陈述.

## Self-Evolving in the Wild

We tasked Qwen3.7-Max with optimizing the **Extend Attention** kernel on hardware it had never encountered during training. Over the course of \~35 hours of continuous autonomous execution, the model performed 432 kernel evaluations across 1,158 tool calls.

官方给 Qwen3.7-Max 的任务是优化 **Extend Attention** 内核, 且硬件是训练时从未见过的. 约 35 小时连续自主执行中, 模型做了 432 次内核评测, 工具调用 1,158 次.

The final result: **10.0x geometric mean speedup** over the Triton reference. This demonstrates that long-horizon autonomous optimization is not just feasible but highly productive.

最终结果: 相对 Triton 参考实现 **10.0x geometric mean speedup**. 文中据此称长程自主优化不仅可行, 而且产出很高.

> **回看:** 第 1 页 「over 1,000 tool calls」 与此处 「1,158 tool calls」 是否同一场 35 小时跑?
> 两处都写 ~35 小时 / 35-hour, 内核优化, 全程自主. 第 1 页用 over 1,000 的约数, 本节给出 1,158 与 432 kernel evaluations. 材料没有写另有一场独立长跑. 合理读法是同一案例: 前文约数, 后文精确计数. 若当作两次实验, 源文并未拆开描述.

> **再看:** 「10.0x geometric mean speedup」 的几何平均是对哪些 shape / 配置取的?
> 源文只给相对 Triton reference 的 10.0x geometric mean, 不列参与平均的 kernel 变体, batch, 序列长或硬件型号明细(只说 hardware it had never encountered during training). 引用时应保留 geometric mean 字样, 不要改写成单一配置上的 10× 墙钟加速.

## Reward Hacking Monitoring for Long-Horizon Training

<!-- page 4 of 4 -->

We integrated Qwen3.7-Max into the Reinforcement Learning (RL) monitoring for Software Engineering (SWE) tasks. During experiments exceeding 80 hours, the model:

官方把 Qwen3.7-Max 接入 Software Engineering (SWE) 任务的 Reinforcement Learning (RL) 监控. 在超过 80 小时的实验中, 该模型:

Autonomously retrieved and replayed training trajectories.

自主检索并回放训练轨迹.

Executed over 10,000 calls.

执行超过 10,000 次调用.

Added 13 new heuristic rules.

新增 13 条启发式规则.

Accurately flagged 1,618 hacking cases.

准确标出 1,618 个 hacking 案例.

> **对一下:** 这里的 Qwen3.7-Max 是被训练的 policy, 还是盯 reward hacking 的监控器?
> 原文写 integrated Qwen3.7-Max into the RL monitoring for SWE tasks, 随后动作是 retrieved and replayed training trajectories, Added ... heuristic rules, flagged ... hacking cases. 角色表述是监控侧, 不是 「Max 自己在吃 SWE 奖励被训」. 材料没有写 Max 是否同时充当 learner, 也没有给 hacking 的判定协议. 只能按 monitoring / flagged 来读.

## Long-Horizon Planning and Execution in Startup Management

In YC-Bench — a benchmark simulating the full year-long lifecycle of a startup — Qwen3.7-Max achieved a total revenue of 2.08M USD, successfully completing 237 tasks. It demonstrated a profound capacity for strategic evolution across context windows, actively exploring clients, identifying traps, and recovering from mid-term crises.

在 YC-Bench — 模拟创业公司全年生命周期的基准 — 上, Qwen3.7-Max 取得总营收 2.08M USD, 成功完成 237 项任务. 文中称其展现跨 context window 的战略演进能力, 主动开拓客户, 识别陷阱, 并从中期危机中恢复.

> **想:** YC-Bench 的主分数是 2.08M USD 营收, 还是 237 tasks, 对照模型分数在哪?
> 源文只报 Max 的 2.08M USD 与 237 tasks, 前面大表没有 YC-Bench 行, 也没有 Opus / K2 / GLM / DS / Qwen3.6-Plus 的同协议营收. 「profound capacity for strategic evolution」 是定性句. 引用营收数字时须标明仅 Max 单点披露, 不是表内六列对照.
