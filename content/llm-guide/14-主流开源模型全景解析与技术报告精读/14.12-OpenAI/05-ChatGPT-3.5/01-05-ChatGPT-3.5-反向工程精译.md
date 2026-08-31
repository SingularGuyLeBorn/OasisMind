---
title: "01 · ChatGPT：GPT-3.5 上的对话 RLHF，InstructGPT 的同胞"
date: 2026-08-30
as_of: 2026-08-30
tags: [ChatGPT, GPT-3.5, RLHF, 公开材料精读]
---

# ChatGPT (GPT-3.5): 引爆全球 AI 浪潮的对话引擎 - 技术探测与反向工程

>  **[返回 14.12-OpenAI 家族总览](../../14.12-OpenAI.md)** · 前代：[InstructGPT](../04-InstructGPT/01-04-InstructGPT-反向工程精译.md) · 后继：[GPT-4](../06-GPT-4/01-06-GPT-4-反向工程精译.md) · 已有长 D5：[对话产品化](./05-05-ChatGPT-3.5-对话优化的产品化工程与RLHF规模化.md)

> **背景**：该模型并未完全开源其底层代码与权重，本精译基于其官方发布的技术报告(Technical Report)、系统卡片(System Card)以及顶级研究团队的逆向探测论文重构。

**产品博文**，不是架构论文。上面「背景」保留。占位段的「拒绝采样 / 几十项代码数学 Benchmark」**不是**这篇：2022-11-30 博文没有 HumanEval 表，也没有参数量。

事实源：Wayback 捕获的 [ChatGPT: Optimizing Language Models for Dialogue](https://web.archive.org/web/20221130211011/https://openai.com/blog/chatgpt/)（与 openai.com/blog/chatgpt 同文；openai.com/index/chatgpt 本轮超时）。

## 1. 产品主张

对话格式：能跟进问题、承认错误、挑战错误前提、拒绝不合适请求。自称 InstructGPT 的 **sibling**（InstructGPT 跟指令、给详细回答；ChatGPT 走对话）。研究预览期 **免费**。入口当时是 chat.openai.com。

## 2. Methods（博文唯一训练段）

与 InstructGPT **同一套 RLHF**，数据收集略有不同：

1. **SFT**：标注员自己演用户和助手两边写对话。给他们看模型写的建议，帮助组回复。
2. **RM**：拿标注员与 chatbot 的对话，随机抽一条模型回复，再采样若干替代 completion，让标注员排序。
3. **PPO** 用该 RM 微调。这个过程做了 **若干轮**。

ChatGPT 从 **GPT-3.5 series** 微调而来，该系列 **2022 年初**训完。ChatGPT 与 GPT-3.5 都在 **Azure AI** 超算上训。博文链到「3.5 series」另文，**本篇未打开那页**，不写 text-davinci-003 的层数。

没有：总参数、层数、上下文整数、MMLU。

## 3. 限制（原文列表）

- 听起来对、其实错或无意义。原因：(1) RL 没有 truth source；(2) 更谨慎会拒本来会的题；(3) 监督训练按演示者知识、不按模型知识。
- 对措辞敏感；换一种问法可能从不懂变成会。
- 过长、爱重复「我是 OpenAI 训练的语言模型」。标注员偏好看起来更全面的长答 + 过优化。
- 含糊问题时通常猜意图，而不是先澄清。
- 仍会跟有害指令或带偏见。用 **Moderation API** 警告/拦截，有假阳假阴。

对照表：同一套刁钻 prompt 上，ChatGPT vs **InstructGPT: text-davinci-002**（哥伦布 2015 来美国、血腥故事、如何霸凌）。只说明对话对齐差异，**不是**基准分。

Iterative deployment：从 GPT-3 / Codex 部署学到的安全措施；RLHF 减少有害与不实输出。鼓励 UI 反馈；ChatGPT Feedback Contest 最高 **$500** API 额度。

## 4. 失效条件

- 把占位段的「数据飞轮 / 拒绝采样」写成 ChatGPT 主路径。
- 把 Fermat 示例对话里的错公式当成数论事实。
- 把后来的 gpt-3.5-turbo 上下文窗写进 2022-11-30 博文。

## 参考文献

- https://web.archive.org/web/20221130211011/https://openai.com/blog/chatgpt/ （读完 Methods / Limitations / Iterative deployment / 对照表）
