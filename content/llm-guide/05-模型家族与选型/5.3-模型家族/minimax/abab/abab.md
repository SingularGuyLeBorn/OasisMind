---
title: "abab 模型线"
category: "模型家族与选型"
tags: ["minimax", "abab", "专有模型", "api"]
published: true
as_of: "2026-09-01"
excerpt: "MiniMax 早期 abab 专有模型线的可核验身份与披露边界。"
---

# abab 模型线

## 身份

`abab` 是 MiniMax 早期对外使用的专有模型/API 品牌，不是一个有完整公开权重和技术报告的开放家族。官方在 2024-04-17 发布 **abab 6.5** 与 **abab 6.5s**：前者宣称 1T 参数，两者均标注 200K 上下文；6.5s 被定位为更高效率版本。

2024-08-31 的官方合作伙伴日材料还把 `abab-video-1`、`abab-music-1`、`abab-speech-1` 用作视频、音乐和语音模型名称，并预告 `abab 7`。这些模态名称不能与文本模型的结构或权重混为一谈。

## 披露边界

- 官方没有为 abab 文本线发布可下载 checkpoint、可复验配置文件或一份对应旧稿内容的独立技术报告。
- “1T”来自厂商发布口径；未同时披露激活参数、层数、专家数和训练数据，因此不能据此重建 MoE 表格。
- 官方曾在公司级材料中提到 MoE 与 Linear Attention 研发，但这不足以证明旧稿为 ABAB 编造的 Top-K、专家数、DPO/PPO、tokenizer 和多模态融合细节。
- 许可、API 可用性与现行服务状态均需查看当时/当前服务条款；这里不把历史 API 当成今天仍可调用的 SKU。

## 一手来源

- [abab 6.5 系列官方发布（2024-04-17）](https://www.minimax.io/news/abab65-series)
- [MiniMax 合作伙伴日与 abab 多模态命名（2024-08-31）](https://www.minimax.io/news/3-billion-interactions)
- [MiniMax 当前模型发布日志](https://platform.minimax.io/docs/release-notes/models)

[← 返回 MiniMax 家族](../minimax.md)
