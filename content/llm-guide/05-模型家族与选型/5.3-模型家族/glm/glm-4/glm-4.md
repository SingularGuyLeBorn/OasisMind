---
title: "GLM-4"
category: "模型家族与选型"
tags: ["glm-4", "glm-4-9b", "glm-4v", "工具调用"]
published: true
as_of: "2026-09-01"
excerpt: "区分 GLM-4 商业旗舰、GLM-4-9B 开放检查点与 GLM-4 All Tools。"
---

# GLM-4

## 一个名称，两类公开形态

智谱在 2024 年 1 月发布 GLM-4 商业旗舰与服务；2024 年 6 月 5 日又开放 GLM-4-9B 系列。二者同属一代，但参数、权重可得性和接口并不相同。不能用 9B 模型卡替代闭源旗舰规格，也不能从 API 产品名推测底层参数。

## 开放检查点矩阵

| 型号 | 类型 | 官方序列长度口径 | 模态 |
|---|---|---:|---|
| GLM-4-9B | Base | 8K | 文本 |
| GLM-4-9B-Chat | Chat | 128K | 文本 |
| GLM-4-9B-Chat-1M | Chat 长上下文变体 | 1M | 文本 |
| GLM-4V-9B | Chat | 8K | 图像 + 文本输入，文本输出 |

这些是独立 checkpoint；`1M` 后缀不能省略。后续 2025 年 4 月的 32B-0414 系列也属于 GLM-4 大家族，但训练数据、原生窗口、推理模型和模板已更新，参见 [GLM-Z1](../glm-z1/glm-z1.md)。

## 技术主线

官方家族报告称 GLM-4 预训练使用约 10T token，并扩展多语言、对齐、长上下文、多模态与 All Tools。GLM-4 All Tools 研究重点是让模型决定何时调用浏览器、Python、图像生成和自定义函数；论文中的端到端工具评测依赖工具环境，不等于裸模型离线即可完成同样任务。

## 许可

开放 9B 权重采用 GLM-4 自定义模型许可，代码仓库采用 Apache-2.0。旧稿把整个 GLM-4 系列写成 MIT 是错误的。商业服务另受平台条款约束。

## 一手来源

- [ChatGLM/GLM-4 家族技术报告](https://arxiv.org/abs/2406.12793)
- [zai-org/GLM-4 官方仓库](https://github.com/zai-org/GLM-4)
- [GLM-4-9B-Chat 模型卡](https://huggingface.co/zai-org/glm-4-9b-chat)
- [GLM-4 模型许可](https://huggingface.co/zai-org/glm-4-9b-chat/blob/main/LICENSE)

[← 返回 GLM 模型家族](../glm.md)
