---
title: 周星星《自进化（Self-evolving／RSI），一篇就够了》精读笔记
category: 长文笔记
published: false
excerpt: >-
  周星星长文精读：机构全景（OpenAI RSI-Index、Anthropic 80% 代码、腾讯 Hyra、MiniMax
  M2.7、Recursive/Sakana/Apodex/Weco）+ 自进化三层框架（Artifacts/Harness/Model）+ Karpathy
  autoresearch、AlphaEvolve 生产案例 + Harness 层是近期主战场（推理成本省 60%、中间档模型获益最大）。
tags:
  - RSI
  - 自进化
  - 周星星
  - 三层框架
  - Harness
  - AlphaEvolve
---
# 周星星《自进化（Self-evolving／RSI），一篇就够了》笔记

> 整理日期：2026-08-05 ｜ 原文：知乎 https://zhuanlan.zhihu.com/p/2065227313973825752（2026-07-30；镜像 qingkeai.online/archives/Self-evolving 标注发布于 2026-07-28，约 15090 字、50 分钟阅读）。作者：周星星。
> 写作动机：self-evolving / self-improving / RSI 成为热词但理解不一；文章先看前沿机构实际在做什么，再给自进化分类框架，最后给判断。

## 一、机构动态（「机构的自进化」全景）

- **OpenAI**：随 GPT-5.6 发布新指标 **RSI Index**，专门衡量模型自己搞研究的能力；最强档 Sol 比 GPT-5.5 高 **16.2 分**；官方案例是它自己选训练配置、自己跑完 post-training，直接训出了更小的 Luna。
- **Anthropic**：《When AI builds itself》按时间线拆五个阶段，机制包括代码生成、代码审查、实验设计；Claude 现在写了公司 **80%+ 的合入代码**，能独立搞定的任务时长大约**每 4 个月翻一倍**。
- **国内**：腾讯混元 7 月 21 日发 Hyra-1.0，能自己跑「探索→提方案→读反馈→修订」循环；MiniMax 4 月开源的 M2.7 自称「第一个深度参与自我进化的模型」，在内部 harness 自主跑 100 多轮「分析失败→改代码→跑评测」，性能提升 **30%**。
- **创业公司**：Recursive Superintelligence（6.5 亿美元/46.5 亿估值，latent token 取代语言 token）；Sakana AI（David Ha + Llion Jones）6 月开专门的 **RSI Lab**，走演化算法；**Apodex**（陈天桥创立）靠上百个子 agent 分工协同 + 独立验证团队互纠，官方称「discoverative intelligence」；**Weco AI**（口号"We build recursively self-improving AI"）的 AIDE² 用双层优化让 agent 改进做研究的 agent，8 天 100 步迭代在三个外部基准上显著超基线。

## 二、定义与三层框架

采用《A Taxonomy of Self-Evolving Agents》（lsl.zone/blog/2026/a-taxonomy-of-self-evolving-agents/，2026-07-08）的定义。按「**自我进化的目标优化对象**」分三层（三者都算 RSI）：

- **Artifacts 层**：用强大 LLM 反复「发现问题→生成产出→评估结果」，优化具体复杂问题产物（代码/论文/算法）。改的是产出物，不涉及模型权重，也不涉及 agent 自身脚手架逻辑。
- **Harness 层**：不动模型权重，改部署后 agent 的**脚手架**（prompt、memory、tool、skill、多 agent 路由等）。与 Artifacts 的区别：Harness 优化的是「下次执行任何任务都用到的那套脚手架」，改一次全部任务受益（如踩坑后把错误总结成新 skill/memory）。
- **Model 层**：改模型参数本身。广义：不需要人工标注、模型自己给自己当老师（self-training、TTRL；把内部信号转成可验证奖励再用 RL——DeepSeek-R1；自对弈 SPIN、Absolute Zero；测试时训练）。狭义：模型能自己产出下一代训练优化方向，一代代往上迭代（自己训练完→自己测试→自己找问题→自己提优化方向→再训练）。
- 三层都是 train-free 与训练并存，**边界正在模糊、相互反哺**：Harness 经验变成训练数据与基建脚手架→基模学会更好自进化→产出更好 artifacts→成为 harness 新工具，最终闭环。

## 三、Artifacts 层的代表工作

- **Karpathy 的 autoresearch（整夜自动改 train.py 迭代超参）**：给 agent 配一个小型但真实的 LLM 训练设置，让它整夜自己做实验——agent 只能改一个文件 train.py（架构、超参、优化器、batch size 随便调），每次固定跑 5 分钟训练，用 val_bpb（验证集 bits-per-byte，越低越好）这个客观指标打分，改好了就留、没改好就扔，自动循环。按这个节奏一小时能跑 12 个实验，一夜下来能跑上百个。Karpathy 在推特贴过约 2 天、depth=12 模型的结果：agent 自主尝试约 **700 次改动，其中约 20 次真正带来提升被保留**，把训练到 GPT-2 水平所需时间从 **2.02 小时压到 1.80 小时（快约 11%）**。这里的 Artifacts 就是那个被不断改进的 train.py / 模型配置本身。
- **Google DeepMind 的 AlphaEvolve（进化算法筛代码，成果反哺自身训练）**：用 Gemini 生成候选代码，配合自动评估器打分，再用进化算法保留最优的那批，循环产出更好的算法。它已在生产环境跑了一年多：帮 Gemini 自己的**矩阵乘法核心提速 23%、FlashAttention 提速 32.5%**，甚至提出过硬件层面的 Verilog 修改；这些改进又被用回 Gemini 训练，形成「AI 优化驱动自己的模型」的闭环。目前每轮迭代大概能省 **1%** 左右的计算；业内讨论认为这个数字冲到 5%–10% 后，「自我改进」的时间表会从几十年缩到几年。AlphaEvolve 因此常被当成 RSI 已在生产环境悄悄发生的例证。

## 四、Harness 层：近期主战场（判断：万花齐放）

作者引用《Harness Engineering for Self-Improvement》判断：**RSI 近期不太可能从「模型直接改写自己权重」开始，更现实的路是先在 Harness 层爆发**。理由两条：

1. **改 Harness 本身就能省钱**：几轮 Harness 迭代就能把推理成本最多打下来 **60%**——靠的是把上下文管理得更好、agent 之间配合更顺，不是靠模型多想（拉长推理链条）。
2. **提建议不挑模型，真正获益的是大规模部署的中间档模型**：Lin et al. (2026) 把「harness-updating」（提出有用改动的能力）和「harness-benefit」（用好新 harness 的能力）两条轴拆开测，结果是从 Qwen3-32B 到 Opus 4.6 一整排模型，**harness-updating 能力几乎是一条平线**；但 harness-benefit 是非单调的，像 GPT-OSS-120B、Qwen3-235B 这类中间档模型获益最大——弱模型容易卡在「harness 都没加载进去」或「加载了但执行错」两种失败模式，强模型则很快撞到自己能力天花板。合起来说明：提改动建议不挑模型（不用烧最贵的旗舰模型去设计 harness），而生产环境里大部分公司用的恰恰是中间档模型，吃红利的正是它们。

**Harness 层代表案例**：

- **Hermes（Nous Research，2026 年 2 月开源、MIT 协议）**：只要一个任务用到 5 次以上工具调用，它就会自动把这次经验写成一份新的 SKILL.md 技能文件，全程无需人工编写；官方还配了个叫 **Curator** 的后台维护机制，追踪每个技能被用了多少次、有没有被修改过，长期不用的技能会经历「活跃 → 陈旧 → 归档」的状态流转，还会定期叫一个小模型做审理。
- **MiniMax M2.7**：官方内部搭了一个能自我进化的 agent harness 帮研究团队跑活——自己收集反馈、给内部任务建评测集，再据此持续迭代自己的架构、技能/MCP 实现和记忆机制。具体案例：在内部 scaffold 上优化编程表现，全自主跑「分析失败轨迹 → 规划改动 → 修改 scaffold 代码 → 跑评测 → 对比结果 → 决定保留或回退」，跑了 100 多轮，把内部评估集性能提升 30%；在 RL 团队实验工作流里能接管 30%–50% 的端到端工作流，人类研究员只在关键决策时介入。
- **Apodex（陈天桥）**：Discoverative Intelligence 方向，1.0 版本是专门做 Deep Research 的 Agent Team——一个 orchestrator 在单个任务里协调最多 **150 个并行子 agent** 去检索证据，累计跑到 1.5 万步；子 agent 结果汇入共享 report pool，orchestrator 异步读取状态、不会被最慢的任务卡住；遇到两份报告互相矛盾、具体主张需要找证据支撑、草稿写完要做最后一轮检查这三种情况，就单独派发给「验证子团队」（conflict reviewer / fact checker / draft reviewer）去核实，最后由 global verifier 通读全部证据给出答案。核心思路不是让单个 agent 拉长上下文死磕，而是把「验证」结构性从「继续推理」里剥离出来，让 agent 之间真的产生分歧、互相纠错。作者点评：这有点 Agent Team 的感觉了（Kimi 年初版本强调上百个 Agent 干活、Claude 7 的 workflow 也差不多）。
