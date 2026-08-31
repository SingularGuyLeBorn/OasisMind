---
title: "01 · MiniMax ABAB-初代 技术报告精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [ABAB, MiniMax, hub]
---

# MiniMax ABAB 技术报告精译

>  **[返回 14.8-MiniMax 家族总览](../../14.8-MiniMax.md)** · 已写博文分析：[01-ABAB初代技术博文分析](./01-ABAB初代技术博文分析.md) · 长 D5：[国内首个 MoE](./05-ABAB-国内首个MoE大模型的架构探索与工程验证.md)

> **模型定位**：稀宇科技 (MiniMax) 最早期的基座模型，验证了全链路大语言模型闭环的工程可行性，奠定了其后续以 Agent-native 为核心的演进路线。本报告精炼自早期的架构说明与技术访谈。

同目录 `04-ABAB-mineru-zh.md` 已标 **status: pending**——**没有独立 PDF**。本 01 原先是空壳。数字与产品线写在博文分析里：abab 6（2024-01）国内较早公开的 MoE 通用模型叙事；abab 6.5（2024-04）。**不要**把 DeepSeek 细粒度公式假装成 ABAB 论文 Table 1。mineru 重构稿里的「极有可能采用共享专家」保持猜测，不升级成官方。

MiniMax-01 / M1 / M2 是后文开源线，不倒灌进本空壳。
