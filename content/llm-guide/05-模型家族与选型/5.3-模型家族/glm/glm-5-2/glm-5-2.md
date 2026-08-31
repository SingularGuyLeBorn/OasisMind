---
title: "GLM-5.2"
category: "模型家族与选型"
tags: ["glm-5.2", "1m context", "indexshare", "长时 agent"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-5.2 的 1M 上下文、IndexShare、MTP 改进、开放权重和评测边界。"
---

# GLM-5.2

## 身份

GLM-5.2 于 2026 年 6 月 16 日发布，重点把 GLM-5 系列的文本上下文从 200K 扩展到 1M，并改进长时编码与 Agent 工作。官方提供开放权重和托管 API，权重采用 MIT 许可。

## 1M 上下文的架构改动

GLM-5.2 在 DSA 上加入 IndexShare：每四个稀疏注意力层共享一个轻量索引器，由第一层计算 top-k 索引，再供四层复用。官方模型卡称在 1M 上下文下把每 token 的相关索引计算 FLOPs 降低约 2.9 倍；这不是整个模型端到端吞吐提升 2.9 倍。

多 token prediction（MTP）也复用索引与 KV，并用拒绝采样和端到端 TV loss 改进投机解码。官方消融在指定编码场景中将平均接受长度从 4.56 提升至 5.47，约 20%；收益依赖解码器实现、草稿步数和任务分布。

| 字段 | 官方口径 |
|---|---|
| 输入/输出 | 文本 → 文本 |
| 最大上下文 | 1M |
| 架构关系 | GLM-5/5.1 路线上的 DSA + IndexShare 更新 |
| 公开形态 | 开放权重与 API |
| 权重许可 | MIT |

## “1M”不等于无损记忆

官方使用“solid/lossless 1M”描述自家长上下文结果；工程上仍应分别测试 needle retrieval、多跳依赖、跨文件修改、目标保持和输出预算。1M 预填充会显著增加 KV cache、CPU 调度与延迟，API 还可能通过单独的 `[1m]` 路由或套餐开放。

## 一手来源

- [GLM-5.2 官方发布页](https://z.ai/blog/glm-5.2)
- [GLM-5.2 官方模型卡](https://huggingface.co/zai-org/GLM-5.2)
- [GLM-5 官方仓库](https://github.com/zai-org/GLM-5)
- [Z.ai 模型发布记录](https://docs.z.ai/release-notes/new-released)

[← 返回 GLM 模型家族](../glm.md)
