---
title: Tufa Labs《Self Rewarding Self Improving》：无参考答案的自奖励自改进闭环
category: 论文
published: false
excerpt: >-
  Tufa Labs（arXiv:2505.08827）利用 generator-verifier
  gap：模型无需参考答案，仅靠自我评判（self-judging）提供奖励信号即可 RL 自改进；配合合成问题生成形成完整闭环——Qwen2.5-7B
  在积分任务上提升 8% 并超过 GPT-4o。是 self-rewarding 路线与 RSI 的关键拼图。
tags:
  - RSI
  - self-rewarding
  - self-improving
  - Tufa Labs
  - generator-verifier gap
  - 论文
---
# Tufa Labs《Self Rewarding Self Improving》：无参考答案的自奖励自改进闭环

> 来源：arXiv:2505.08827（Tufa Labs，Kevin Lopez / Akira Yoshiyama / Dominique Garmier，2025-05-12）
> 链接：https://arxiv.org/html/2505.08827v1

## 一句话核心

LLM 可以不依赖参考答案，仅靠**自我评判（self-judging）**提供奖励信号完成强化学习自改进——利用的是「生成 vs 验证」的不对称性（generator-verifier gap：验证一个解是否正确，远比生成它简单）。

## 关键机制

- **Self-judging 替代 ground truth**：模型直接评估自己生成的解的正确性，产出奖励信号，从而把 RL 扩展到「无法轻易构造程序化奖励」的领域（如工程零件设计、开放科学任务）。
- **完整自改进闭环**：模型自己生成练习题 → 自己求解 → 自我评估 → RL 更新。三步全部自动化，无需人类标注。
- **合成问题生成**：闭环的关键一环，解决「训练数据不足」的痛点。

## 实验结果

- 任务：Countdown 谜题 + MIT Integration Bee（积分竞赛题）。
- 模型：Qwen 2.5 7B。
- 效果：相对基线提升 **8%**；在积分任务上**超过 GPT-4o**。
- 验证对齐：self-judging 信号与形式化验证保持对齐，说明模型评判是可靠的奖励来源。

## 与 RSI 的关系

- 这是 **self-rewarding（自奖励）** 路线的代表工作：模型既是解题者又是裁判，为「机器自己改进自己」提供了可训练的奖励通道——而奖励通道正是 RSI 里最缺的一环。
- 与 Self-Rewarding Language Models（Meta）一脉相承，但把「自奖励」从 SFT 数据层面推进到了 RL 训练层面。
- 作者点出范式含义：AI 通过自我导向学习持续改进，而非依赖人类引导训练；在数据稀缺、评估复杂的领域可能加速进展。

## 备注

- 论文规模偏小（7B、两个任务），但把「无 ground truth 的 RL」这条路走通了，是 RSI 技术栈里「模型层自我学习」的代表证据。
- 与库内「周星星三层框架」中的 **Model 层（无黄金答案的学习）** 直接对应，可与《Self Rewarding Language Models》、OpenAI RSI-Index 互参。
