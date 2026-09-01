---
title: "Operator 与 Computer Use：产品和 API 模型边界"
category: "模型家族与选型"
tags: ["openai", "operator", "computer-use", "agent"]
published: true
as_of: "2026-09-01"
excerpt: "区分 Operator 研究预览产品、Computer-Using Agent 研究概念和 computer-use-preview API 模型。"
---

# Operator 与 Computer Use：产品和 API 模型边界

## 三层身份

| 层 | 含义 | 不应混同 |
|---|---|---|
| CUA 研究概念 | 结合视觉理解与动作输出操作图形界面的 computer-using agent | 不是一个公开权重名称，也没有公开完整训练配方 |
| Operator | 2025 年在 ChatGPT 侧发布的研究预览产品 | 产品包含浏览器环境、策略、确认流程和安全限制；不等于单一 API 模型 |
| `computer-use-preview` | 面向 Responses API 的专用预览模型 | 官方目录现已标为弃用；模型 ID 不能替代环境隔离与人类确认 |

## 安全边界

计算机操作会把模型错误放大为真实动作。生产系统至少需要：限定站点/动作、隔离凭据与文件、对付款和外发等高影响动作二次确认、把网页内容视作不可信输入、记录动作与工具结果、设置停止与回滚路径。

公开材料不足以支持 Operator/CUA 的浏览器自动化实现细节或精确内部训练阶段。系统卡确实报告了 OSWorld、WebArena、WebVoyager 等基准，但这些分数只在对应版本、日期和评测协议内成立，不能反推出未披露训练实现，也不能直接代表真实生产安全性。

## 一手来源

- [Operator 系统卡](https://openai.com/index/operator-system-card/)
- [`computer-use-preview` API 模型页](https://developers.openai.com/api/docs/models/computer-use-preview)
- [全部模型与弃用状态](https://developers.openai.com/api/docs/models/all)

[← 返回 OpenAI 家族](../openai.md)
