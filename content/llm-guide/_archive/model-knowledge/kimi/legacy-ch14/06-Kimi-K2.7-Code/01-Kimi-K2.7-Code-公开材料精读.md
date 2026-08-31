---
title: "01 · Kimi K2.7 Code：K2.6 同骨架的编码 SKU"
date: 2026-08-30
as_of: 2026-08-30
tags: [Kimi-K2.7-Code, MoE, MLA, MoonViT, 公开材料精读]
---

# Kimi K2.7 Code：编码向、同骨架增量

>  **[返回 14.5-Kimi 家族总览](../../14.5-Kimi.md)** · 前代骨架：[K2.6](../04-Kimi-K2.6/01-Kimi-K2.6技术报告精译.md) · 换代预训练：[K3](../05-Kimi-K3/01-Kimi-K3-架构精译.md)

**档（2026-08）**：**A**。官方写明 **built upon Kimi K2.6**，部署「与 K2.5/K2.6 相同架构」。没有新注意力/MoE 论文。不要把它写成 K3。

产品页 + Hugging Face 卡。不是独立架构 PDF。

![K2.6 与 K2.7 Code 同骨架](./images/fig-k27-code-same-moe-coding-sku.png)

## 1. 官方名与日期

- 官方产品页：[Kimi K2.7 Code](https://www.kimi.ai/resources/kimi-k2-7-code)，页上日期 **2026-08-12**。
- 权重卡：https://huggingface.co/moonshotai/Kimi-K2.7-Code （Modified MIT）。卡上**没有**独立日历。
- API：`kimi-k2.7-code`；Kimi Code 默认模型，thinking 默认开。
- 通用对话官方仍推荐 **K2.6**。关掉 thinking 的 Kimi Code 请求会落到 K2.6，不是本权重的「非思考模式」。

## 2. 骨架（与 K2.5/K2.6 同一张表）

HF README 规格表：

| 项 | 值 |
|----|-----|
| 总 / 激活 | **1T / 32B** |
| 层 | **61**（含 **1** 稠密层） |
| 注意力隐维 / 头 | **7168** / **64** |
| 专家 | **384**，每 token **8** + **1** 共享 |
| 每专家隐维 | **2048** |
| 词表 / 上下文 | **160K** / **256K**（API 价表写 **262,144**） |
| 注意力 / 激活 | **MLA** / **SwiGLU** |
| 视觉 | **MoonViT 400M** |
| 量化 | 与 Kimi-K2-Thinking 同一套 **native INT4** |
| 推理引擎 | vLLM / SGLang / KTransformers；`transformers >=4.57.1,<5.0.0` |

MLA / SwiGLU / MoE 路由公式住体系章，本篇不抄。K3 的 KDA + LatentMoE **不要**倒灌进来。

产品页 FAQ：原生多模态，支持图、视频输入。HF 注明视频聊天目前只在官方 API 实验。

## 3. 相对 K2.6 改了什么（这才是 A 档正文）

1. **任务面**：长程软件工程 / Agent 工作流，不是再发一张通用旗舰。
2. **思考协议**：强制 thinking；官方 API **force thinking 与 preserve_thinking**。多轮保留完整 reasoning，供编码 Agent。交错思考与多步工具调用「与 K2 Thinking 同一设计」。
3. **思考 token**：官方约 **少 30%** thinking token，同时三份内部编码基准分数高于 K2.6。
4. **价格（产品页）**：cache hit **$0.19** / miss **$0.95** / output **$4.00** per 1M；上下文 262,144。另有 Kimi Code 订阅档（Moderato $15 … Vivace $159，年付月价），那是套餐不是权重。

## 4. 评测（官方表，厂商自跑）

测试脚注（HF）：K2.7 Code 与 K2.6 走 Kimi Code CLI，thinking 开，temperature **1.0**，top-p **0.95**，上下文 262,144。GPT-5.5 走 Codex **xhigh**；Opus 4.8 走 Claude Code **xhigh**。条件不同，不要当成同一 harness。

**编码**

| 基准 | K2.6 | K2.7 Code | GPT-5.5 | Opus 4.8 |
|------|------|-----------|---------|----------|
| Kimi Code Bench v2（内部） | 50.9 | **62.0** | 69.0 | 67.4 |
| Program Bench | 48.3 | **53.6** | 69.1 | 63.8 |
| MLS Bench Lite | 26.7 | **35.1** | 35.5 | 42.8 |

**Agent**

| 基准 | K2.6 | K2.7 Code | GPT-5.5 | Opus 4.8 |
|------|------|-----------|---------|----------|
| Kimi Claw 24/7 Bench（内部） | 42.9 | **46.9** | 52.8 | 50.4 |
| MCP Atlas | 69.4 | **76.0** | 79.4 | 81.3 |
| MCP Mark Verified | 72.8 | **81.1** | 92.9 | 76.4 |

相对 K2.6 的百分提升是产品页自己算的（Code Bench v2 **+21.8%** 等）。内部基准不要直接当公开榜。本轮**没有**打开独立 SWE-bench Verified 官方数字。

## 5. 失效条件

- 写成新 MoE / 新 MLA。
- 写成 K3。
- 把内部 Code Bench 当成 SWE-bench。
- 为「非 thinking」再建空目录。
- 把第三方「2026-06-12 上架」收成官方日（权重卡没写；产品页是 08-12）。

## 参考文献

- https://www.kimi.ai/resources/kimi-k2-7-code （读完正文、规格表、价表、FAQ）
- https://huggingface.co/moonshotai/Kimi-K2.7-Code/raw/main/README.md （规格、评测脚注、INT4、preserve_thinking）
