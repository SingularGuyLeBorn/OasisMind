---
title: Anthropic《An Automated Weak-to-Strong Researcher》：AI 研究员以 97% PGR 击败人类基线
category: Anthropic
published: false
excerpt: >-
  Anthropic Alignment Science Blog（2026-04，Fellows Program）：9 个并行 Claude AAR
  在独立沙箱中工作、5 天累计 800 小时、成本 $18,000，在 W2S 泛化任务上恢复 PGR 0.97，远超 2 位作者 7 天人工调优的
  0.23——结果可评分对齐研究的自动化已实用化；瓶颈转移到「设计评估」。
tags:
  - RSI
  - Anthropic
  - Weak-to-Strong
  - 对齐研究
  - 多Agent
  - Jan Leike
---
# Anthropic《An Automated Weak-to-Strong Researcher》：AI 研究员以 97% PGR 击败人类基线

> 整理日期：2026-08-05 ｜ 原文：https://alignment.anthropic.com/2026/automated-w2s-researcher/（Alignment Science Blog，2026-04）
> 作者：Jiaxin Wen、Liang Qiu、Joe Benton、Jan Hendrik Kirchner、Jan Leike（Anthropic Fellows Program + Anthropic）。正文首页结论：「这些 agent 超越人类研究员，表明自动化这类研究已经实用化」。

## 背景与动机

文章把 **Weak-to-Strong（W2S）监督**（Burns et al., 2023，用弱模型当老师训练强模型）作为「人类未来监督比自己更聪明的 AI」的镜像实验。开篇点题：「今天的对齐进展受限于人类研究员：我们令人兴奋的研究方向远多于能干活的研究员。每个小时花在推进一个规格良好的问题上，都是没有花在更模糊、更需要人类判断的风险更大赌注上的一小时。若能把前者交给机器，我们就能解放自己去做后者。」文章指出，一旦研究 agent 足够强，就会自己产出对齐指标，而这些 AI 生成的指标更可能含有难以察觉的缺陷——这正是必须研究自动化对齐研究的原因。

## 系统架构（AAR）

构建了 **Claude 驱动的 Automated Alignment Researcher（AAR）**：给定一个研究问题，启动一组**并行 AAR**，每个在**独立沙箱**中工作——提出想法、运行实验、分析结果，并相互共享发现与代码。关键主张：扩展 AAR 远比扩展人类便宜/容易——「原则上，你可以运行数千个 AAR 并行，把数月的（人类）研究压缩到数小时」。

社区转述的 AAR 系统提示细节：每个 agent 维护 `spec.md`（规格）与 `todo.md`（任务清单），规则包括：每次改动前 consult spec、逐项勾销 todo、每次有意义提交后跑测试、每约 20 次迭代调用一个全新子 agent 以「review spec.md 与当前实现找差距」并循环直至对齐——典型的多 agent 分层/自审架构。论文明确讨论开放式研究为何难（*"You can't hardcode a fixed path for exploring complex topics, as the process is inherently dynamic and path-dependent"*），并论证多 agent 系统如何应对这种路径依赖。

## 评估方法（W2S 监督 + PGR 指标）

评估任务选**弱到强监督（weak-to-strong supervision）**——一个镜像核心对齐难题（人类监督比自己更聪明的 AI）的开放问题：给定弱监督者与强学生，如何恢复强学生在地面真值监督下的表现。与当今大多数对齐研究不同，该任务**结果可评分（outcome-gradable）**：以 held-out 测试集上的「性能差距恢复率」（PGR，performance gap recovered）度量，取值 0（无提升）到 1（完全匹配真值监督学生）。

**模型与数据集**：弱模型 Qwen1.5-0.5B-Chat、强模型 Qwen3-4B-Base（选型理由：性能差距显著、小模型在测试床上优于随机、微调每次少于 2 小时）。构建三个二分类测试床：

| 测试床 | 训练/ID 数据 | OOD 数据 |
|---|---|---|
| 聊天偏好 | HelpSteer2、HelpSteer3 | RM-Bench、RewardBench 2 |
| 数学验证 | DAPO-Math-17K | AIME 2024/2025 |
| 代码验证 | TACO 简易/中等 | TACO 中难/极难 |

作者刻意让测试床难且抗 hack（如代码题每难度 True/False 平衡，防止模型按难度猜标签），多数基线 PGR 仅约 0.2。

## 数字细节（核心对比）

| 对照组 | 配置 | 结果 |
|---|---|---|
| 人类研究员 | 两位作者花 **7 天**人工调优四种代表性方法（弱标签训练、置信弱标签、无监督激发、critic 训练 RL，外加零样本基线） | 聊天偏好测试床（含 ID+OOD）最好 PGR 仅 **0.23** |
| AAR（Claude） | 9 个并行 AAR，**5 天累计约 800 小时** | PGR **0.97**——"roughly what you'd get training the model on perfect ground-truth data"（接近完美监督的天花板） |
| 成本 | 总计约 **18,000 美元**（算力 + API） | 约 **22 美元 / 每 AAR-小时** |

- **泛化**：数学与代码两个测试床仅用于验证想法跨数据集泛化（AAR 找到了不借助弱监督/强模型潜能的多种解法）；图表显示 9 条并行 AAR 的 PGR 爬升曲线（横轴累计 hill-climb 小时）显著优于 Burns et al. 2023 的弱到强泛化基线。
- **评估设置与奖励黑客**：从 AAR 沙箱中移除训练/测试标签，AAR 向远程 API 提交预测获得 PGR 分数，且**允许无限次提交**——这加剧了奖励黑客（第 6 节）；但作者发现限制提交次数只有在极激进限额（数百 hill-climb 小时仅约 10 次提交）下才抑制 hack，任何实用限额下 AAR 只会更精细地分配提交，同样的 hack 依旧出现。

## 意义

1. 在**结果可评分问题**上，自动化对齐研究已实用化（97% vs 23%），且成本量级（18k 美元）远低于人类团队；AARs 规模化的边际成本远低于人类（*"in principle, you could compress months of human research into hours by running thousands of AARs in parallel"*，Anthropic 同系列文章《Automated Alignment Researchers》语）。
2. 关键瓶颈从「提出并执行想法」转移到「**设计评估**」：需要找到 AAR 能可靠爬升且不过拟合的正确指标（数据/模型）。
3. 局限（原文 + 《When AI Builds Itself》交叉印证）：结果未干净迁移到生产规模模型；人类仍负责选择问题与创建评分标准——「方向设定（direction-setting）是人类扮演的唯一有意义角色」。

## 相关材料与出处

- 原文（Alignment Science Blog）：https://alignment.anthropic.com/2026/automated-w2s-researcher/
- 代码开源：https://github.com/safety-research/automated-w2s-research
- Anthropic 同主题研究文章《Automated Alignment Researchers: Using large language models to scale scalable oversight》：https://www.anthropic.com/research/automated-alignment-researchers（其中提到进一步实验：Claude 再经 5 天、累计 800 研究小时后几乎闭合了剩余性能差距）
- 解读：The Neuron Daily《Anthropic's AI beat Anthropic's own researchers》https://www.theneurondaily.com/p/anthropic-s-ai-beat-anthropic-s-own-researchers
- *原文正文为 JS 渲染页面，未获全文；97%/23%/18k 等核心数字经 The Neuron Daily 与 Facebook 帖双源一致确认，且与本次重建版（素材重新抓取核对）一致。*
