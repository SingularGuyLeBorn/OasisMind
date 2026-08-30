---
title: "01 · Claude 4：2025-05-22 Opus 4 + Sonnet 4，混合推理"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-4, Opus-4, Sonnet-4, 公开材料精读]
---

# Claude 4: Anthropic 新一代安全与智能边界探索 - 架构还原与精译

>  **[返回 14.13-Claude 家族总览](../../14.13-Claude.md)** · 前代：[3.7 Sonnet](../10-Claude-3.7-Sonnet/01-10-Claude-3.7-Sonnet-架构精译.md) · 已有长 D5：[长程 Agent](./05-11-Claude-4-长程Agent能力与记忆机制的工程突破.md)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**材料类型（2026-08）**：**官方博文**。上面「解析」保留。没有层配置。本文件夹是 **Claude 4 一代两档**（Opus 4 + Sonnet 4），**不为其中一档 mkdir**。

事实源：[Introducing Claude 4](https://www.anthropic.com/news/claude-4)（2025-05-22）。

## 1. 产品

混合模型：近即时，或 extended thinking。Pro / Max / Team / Enterprise 两档都有 + 可 thinking；**免费档有 Sonnet 4**。API、Bedrock、Vertex。价格沿用前代：**Opus 4 $15/$75**，**Sonnet 4 $3/$15** per million in/out。

同发（产品，不是新权重）：thinking 中途用工具（beta，如 web search）；**并行**调工具；给本地文件时记忆更好；**Claude Code GA**（GitHub Actions 后台、VS Code / JetBrains 内联编辑）；API：code execution、MCP connector、Files API、prompt cache 最长 **1 hour**。

安全：文末写实施更高 ASL（点名 **ASL-3** 这类措施）。System card 本轮 **未打开 PDF**。

## 2. 评测（正文 + 附录，图柱不估）

博文主数字：

| | SWE-bench | Terminal-bench |
|--|-----------|----------------|
| **Opus 4** | **72.5%** | **43.2%** |
| **Sonnet 4** | **72.7%** | （正文未写） |

附录：**SWE-bench 与 Terminal-bench 都不开 extended thinking**。脚手架：bash + 字符串替换文件工具；**不再**用 3.7 的 planning tool。Claude 4 按 **满 500 题**报；OpenAI 对照是 477 题子集。

**High compute**（并行采样、丢掉破坏可见回归测试的 patch、内部打分模型选一条）：Opus 4 **79.4%**，Sonnet 4 **80.2%**。长 D5 把 80.2% 写成 Sonnet 主分数——那是 high compute，不是 72.7%。

Extended thinking **最多 64K token** 时附录另报（括号为 **不开** thinking）：

- GPQA Diamond：开 thinking 的主表在图里；不开时 Opus **74.9%** / Sonnet **70.0%**
- MMMLU 不开：Opus **87.4%** / Sonnet **85.4%**
- MMMU 不开：Opus **73.7%** / Sonnet **72.6%**
- AIME 不开：Opus **33.9%** / Sonnet **33.1%**
- TAU-bench：只用了 thinking+工具的设置，**没有**报不开 thinking 的分

Agent 捷径/漏洞：两档都比 3.7 **少 65%**（易走捷径的 agent 任务）。Thinking summaries：小模型压缩长思考；约 **5%** 的轨迹需要；多数思考够短可全文显示。要原始 CoT 走销售 **Developer Mode**。

客户引用（Cursor、Rakuten「独立重构 7 小时」等）**不是**基准表。不要把 7 小时写成官方评测。

## 3. 失效条件

- 把 80.2% 和 72.7% 收成同一个 SWE。
- 为 Opus 4 / Sonnet 4 再开空目录。
- 把 3.7 的 planning tool 脚手架当成 4 的主设置。

## 本篇来源

- https://www.anthropic.com/news/claude-4 （读完正文与 SWE/TAU/thinking 附录；未读 system card PDF）
