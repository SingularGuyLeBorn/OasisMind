---
title: "01 · Claude Opus 5：半价接近 Fable 的日常旗舰"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-Opus-5, 公开材料精读]
---

# Claude Opus 5：公开材料精读

>  **[返回 14.13-Claude 家族总览](../../14.13-Claude.md)** · 公开最强档：[Fable 5](../19-Claude-Fable-5/01-Claude-Fable-5-公开材料精读.md)

**档（2026-08）**：**A**。相对 Opus 4.8 / Fable 5 的产品增量。**没有**「全局树状状态机」或层表。Fast mode 是速度档，不 mkdir。

https://www.anthropic.com/research/claude-opus-5 （**2026-07-24**）；总览表同 Fable 篇。System card 本轮未打开 PDF。

![第五代：Fable / Mythos / Opus](../19-Claude-Fable-5/images/fig-claude-gen5-fable-opus-mythos.png)

## 1. 产品

「接近 Fable 5 的智力，**一半价格**」。Claude Max 新默认；Pro 上最强档。API `claude-opus-5`。价与 Opus 4.8 相同：**$5 / $25** per MTok。Fast mode 约 **2.5×** 默认速度，Claude 平台与 Claude Code 额度上 **2×** 基价。一般访问**没有** Fable 那种 30 天强制留存要求（博文：consistent with prior Opus）。

总览：1M 上下文 / 128K 同步输出；Thinking **Adaptive**（不是 Fable 的 always-on 那一行——总览把 Fable 标 Adaptive always on，Opus 5 只标 Adaptive）；默认 effort **`high`**。知识截止 **2026-05**（比 Fable 的 Jan 2026 新）。退役不早于 **2027-07-24**。

同发 beta：对话中途改工具列表且不使 prompt cache 失效；API **automatic fallbacks**（分类器拦 Fable/Opus 5 时改道，而不是直接拒）。

## 2. 相对前代（博文能写死的）

- 定价不变，曲线随 **effort** 变。Frontier-Bench / CursorBench / AA Coding 等是**图**，本篇**不估柱高**。
- 定性：Frontier-Bench v0.1 超过其余模型，且同任务成本下相对 4.8「more than doubles」——这是博文原句，没有给可抄的两个百分数。
- CursorBench 3.2：max effort 距 Fable 峰值 **0.5%** 内，半价。
- ARC-AGI 3：正文「三倍于次优」——仍是相对句，主表无绝对值（OpenAI 5.6 表给了 Opus 4.8 的 1.5%，**不是** Opus 5）。
- 生命科学：相对 4.8，内部有机化学光谱 **+10.2** 百分点；蛋白序列变异功能 **+7.7** 百分点。
- 对齐：自动化行为审计 overall misaligned **2.3**，自称近期最低。
- 安全：双用途**不推进前沿**；生物学与进攻性网络落后 Mythos 5。OSS-Fuzz：找洞接近 Mythos 5，**写 exploit 明显落后**。故意**没**在网络任务上训 Opus 5，能力随通用变强而涨。

## 3. 护栏（相对 Fable）

网络分类器比 Fable **松**：允许源码里找洞，拦基于二进制的扫描、渗透测试、生成 exploit。预期干预次数比 Fable 少约 **85%**。claude.ai / Claude Code / Cowork 默认回退 **Opus 4.8**。**Cyber Verification Program** 给合格方更少限制的 Opus 5。生物学：Fable 拦下的生命科学请求改走 **Opus 5**（不再走 4.8）。Mythos 5 仍是这类工作更强的限量模型。

## 4. 失效条件

- 把图表「翻倍」写成具体 SWE%。
- 把 Fast mode / Sonnet 5 开成空目录。
- 把 Opus 5 写成 Fable 的量化版权重（官方没说是同一 checkpoint）。

## 参考文献

- https://www.anthropic.com/research/claude-opus-5
- https://platform.claude.com/docs/en/about-claude/models/overview
