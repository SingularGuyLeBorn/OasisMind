---
title: "MiniMax-M2.1"
category: "模型家族与选型"
tags: ["minimax-m2.1", "agent", "多语言编程", "interleaved-thinking"]
published: true
as_of: "2026-09-01"
excerpt: "MiniMax-M2.1 的后训练定位、交错思考、权重/API 与未披露架构边界。"
---

# MiniMax-M2.1

## 定位

MiniMax-M2.1 的 API 发布日志日期为 2025-12-22，英文发布页日期为 2025-12-23。它是 M2 的后训练迭代，重点提高 Rust、Java、Go、C++、Kotlin、Objective-C、TypeScript/JavaScript 等多语言软件工程、移动端开发、工具使用和办公任务。

官方后训练说明称 M2.1 约 230B 总参数、约 10B 激活，并推荐在 Agent 中使用 **Interleaved Thinking**：思考、工具行动与环境观察交替发生。它描述的是生成/交互机制，不是旧稿所称的“动态任务专家路由”新架构。

## 已知与未知

- M2 系列报告公开的是 M2 基座的完整预训练架构，没有给 M2.1 另列层数、专家表或新路由公式。因此本页不声称存在代码专家群、语言专用专家、任务级缓存路由等内部实现。
- 官方没有证据支持“单卡 A10 23GB 部署完整 M2.1”“PagedAttention 降低 60% 显存”或“100 TPS 来自动态专家路由”。
- 官方 API 当前标注 204,800 输入+输出总窗口；这是服务口径，不是新骨干训练长度。
- 官方 benchmark 应连同 harness 一起阅读。跨 scaffold 分数不能被改写成框架无关的可靠性保证。

## 获取与许可

M2.1 有官方权重、API 和 MiniMax Agent 产品入口。仓库称许可为 **Modified-MIT**；其文本要求商业产品或服务在界面展示 “MiniMax M2.1”。部署时应保存具体 `LICENSE` 版本。

## 一手来源

- [MiniMax-M2.1 官方发布](https://www.minimax.io/news/minimax-m21)
- [M2.1 多语言与多任务编程说明](https://www.minimax.io/news/m21-multilingual-and-multi-task-coding-with-strong-general)
- [M2.1 Agent 后训练说明](https://www.minimax.io/news/post-training-experience-and-insights-for-agent-models)
- [MiniMax-M2.1 官方仓库](https://github.com/MiniMax-AI/MiniMax-M2.1)
- [MiniMax-M2 系列技术报告 v2](https://arxiv.org/abs/2605.26494v2)

[← 返回 MiniMax 家族](../minimax.md)
