---
title: "01 · Claude 3.7 Sonnet：2025-02-24 混合推理，思考预算到 128K 输出"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-3.7-Sonnet, hybrid-reasoning, 公开材料精读]
---

# Claude 3.7 Sonnet: 混合推理(Hybrid Reasoning)的混合巨兽 - 架构还原与精译

>  **[返回 14.13-Claude 家族总览](../../14.13-Claude.md)** · 前代：[3.5 Sonnet](../07-Claude-3.5-Sonnet/01-07-Claude-3.5-Sonnet-架构精译.md) · 已有长 D5：[混合推理](./05-10-Claude-3.7-Sonnet-混合推理架构与可控思考预算.md)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**材料类型（2026-08）**：**官方博文**。上面「解析」保留。没有层配置。本会话打开了 [Claude 3.7 Sonnet and Claude Code](https://www.anthropic.com/news/claude-3-7-sonnet)（2025-02-24）。System card 博文有链，**本轮未打开 PDF**，安全数字只用不必要拒绝 **−45%** 这一句。

## 1. 产品主张

自称当时最强 Claude，也是市场上 **第一个 hybrid reasoning model**：近即时回答，或可见的逐步思考。API 可控制思考时长。标准模式 = 升级版 3.5 Sonnet；extended thinking = 先自省再答，数学/物理/指令遵循/代码等更好。两种模式 prompt 习惯「大体相同」。

渠道：Free / Pro / Team / Enterprise、Developer Platform、Bedrock、Vertex。**Extended thinking 除免费档外都有**。价格与前代 Sonnet 相同：**$3 / $15** per million in/out，**含 thinking tokens**。

API 思考预算：最多思考 **N** token，N 可到输出上限 **128K**。用速度/费用换答案质量。

哲学：不要做成「另一个纯推理模型」，一个脑既快答也深想。相对竞品，少优化竞赛数学/CS，多优化企业真实任务。

## 2. 评测（只抄正文+附录，不估图柱）

博文图称 SWE-bench Verified 与 TAU-bench SOTA，**正文没有写出图上的百分数**。附录可核验：

**SWE-bench Verified**（自建最小脚手架：bash + 字符串替换文件工具 + planning tool；内部有 11/500 题跑不动，vanilla pass@1 **把这 11 题当失败** 以对齐官方榜）：

- 无 extended thinking 的 vanilla pass@1：同一 489 子集上 **63.7%**
- high compute（并行采样、丢掉破坏可见回归测试的 patch、打分模型选一条）：n=489 上 **70.3%**

不要把长 D5 的 **62.3%** 当成附录数字。Agentless / Aide / MCTS 等更重脚手架是别人的做法，Anthropic 说自己主结果更简单。

**TAU-bench**：Airline Agent Policy 上加 planning tool 附文；最大步数 30→100（多数轨迹 <30，一条 >50）。3.5 Sonnet（new）因数据集小改动与发布时分数不同，他们在更新集上重跑才对比。**附录没写 3.7 的 TAU 百分数**——本篇不填。

客户评语（Cursor / Cognition / Vercel / Replit / Canva）是引用，不是基准表。

## 3. Claude Code

有限 research preview 的终端 agentic coding：搜/读代码、改文件、写跑测试、commit/push GitHub。早期测试：单次完成「通常 45+ 分钟手工」的任务。GitHub 集成扩到所有 Claude 计划。不要把 Code 写成新模型权重。

## 4. 失效条件

- 把图表 SWE-bench 估成第三个数。
- 把 128K 思考预算写成上下文窗（博文写的是 **output limit**）。
- 把免费档写成也有 extended thinking。

## 本篇来源

- https://www.anthropic.com/news/claude-3-7-sonnet （读完正文与 SWE/TAU 附录；未读 system card PDF）
