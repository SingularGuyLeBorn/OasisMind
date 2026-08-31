---
title: "Claude 3 家族"
category: "模型家族与选型"
tags: ["claude", "anthropic", "多模态", "模型家族"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 3 Haiku、Sonnet、Opus 的共同能力、定位和评测边界。"
---

# Claude 3 家族

> 核验日期：2026-09-01。Claude 3 是首次以 Haiku、Sonnet、Opus 三档同时组织的 Claude 家族，也是 Claude 正式进入图像理解的重要节点。

## 家族矩阵

| 型号 | 发布定位 | 上下文 | 首发 API 价格（输入 / 输出，每百万 token） | 页面 |
|---|---|---:|---:|---|
| Claude 3 Haiku | 速度、低成本 | 200K | $0.25 / $1.25 | [详解](../claude-3-haiku/claude-3-haiku.md) |
| Claude 3 Sonnet | 能力与速度平衡 | 200K | $3 / $15 | [详解](../claude-3-sonnet/claude-3-sonnet.md) |
| Claude 3 Opus | 最高能力档 | 200K | $15 / $75 | [详解](../claude-3-opus/claude-3-opus.md) |

Opus 与 Sonnet 于 2024-03-04 随家族公告提供；Haiku 随后于 3 月提供。它们目前均属历史型号。

## 共同变化

### 图像输入

三档模型可理解照片、图表、技术图示和文档页面，输出仍是文本。视觉输入不等于稳定 OCR：小字、低对比度、旋转、复杂表格和空间关系应单独测量。高风险文档还需保存原图与人工复核。

### 更少无谓拒答

Anthropic 报告 Claude 3 对“接近拒答边界但实际无害”的请求更能区分语境。该结论来自官方评测，不意味着安全策略消失，也不保证不同产品入口、系统提示或时间点的行为完全一致。

### 长上下文与召回

家族公开提供 200K 上下文。发布材料还展示了长上下文定位测试，但单一“针尖”测试不能代表多文档综合、矛盾证据处理与引用质量。

## 评测怎么读

Claude 3 发布表包含 MMLU、GPQA、GSM8K、HumanEval、视觉问答等多项官方结果。应以模型卡中的脚注核对 few-shot、CoT、pass@k、工具与人工评分条件；不能只截取粗体最高分。模型卡更适合说明当时的测试协议，而不是给今天的生产选型排序。

## 未公开内容

Anthropic 未公开三档的参数规模，也没有证实它们分别采用 Dense 或 MoE、多少层、何种位置编码或注意力实现。Haiku/Sonnet/Opus 是产品档位名称，不是可据此反推的架构类别。

## 官方来源

- [Introducing the next generation of Claude](https://www.anthropic.com/news/claude-3-family)
- [Claude 3 model card](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf)

[返回 Claude 家族](../claude.md)
