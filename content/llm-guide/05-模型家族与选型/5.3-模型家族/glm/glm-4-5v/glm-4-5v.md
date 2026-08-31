---
title: "GLM-4.5V"
category: "模型家族与选型"
tags: ["glm-4.5v", "视觉语言模型", "gui agent"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-4.5V 的 106B/A12B 身份、视觉推理、GUI 能力和上下文边界。"
---

# GLM-4.5V

## 身份

GLM-4.5V 于 2025 年 8 月 11 日发布，是建立在 GLM-4.5-Air-Base 上的视觉语言模型。官方技术报告覆盖 GLM-4.1V-Thinking 与 GLM-4.5V；不要因此把两者当成同一 checkpoint。

| 字段 | 官方口径 |
|---|---|
| 语言骨干 | GLM-4.5-Air，106B 总参数 / 12B 激活参数 |
| 输入 | 文本、图像、视频、文档/界面等视觉内容 |
| 输出 | 文本 |
| 服务上下文 | 官方 API 矩阵标 64K |
| 公开形态 | 开放权重与托管 API |
| 权重许可 | MIT |

## 能力组织

GLM-4.5V 把视觉感知、长上下文理解、推理和工具使用放在统一后训练体系中。官方展示的任务包括图像/视频理解、视觉定位、文档解析、图表问答和 GUI Agent。GUI benchmark 通常依赖截图、动作空间、执行环境和轨迹预算；模型分数不是对任意网站的自动化成功保证。

模型可以采用思考模式处理复杂视觉任务，但输出仍是文本。若产品能“点击”界面，实际动作由外部 Agent 框架执行；若产品能生成或编辑图像，也可能调用了其他生成模型，不能归为 GLM-4.5V 的原生输出模态。

## 部署与验证

106B 是架构口径，Hugging Face 界面可能显示约 108B 的序列化参数计数。私有部署需同时评估全权重存储、MoE 路由、视觉 encoder、图片/video token 膨胀和 KV cache。文档任务应建立 OCR、表格、跨页引用和拒答测试，而不只看公开综合榜单。

## 一手来源

- [GLM-V 技术报告](https://arxiv.org/abs/2507.01006)
- [GLM-4.5V 官方模型卡](https://huggingface.co/zai-org/GLM-4.5V)
- [GLM-V 官方仓库](https://github.com/zai-org/GLM-V)
- [Z.ai 发布记录](https://docs.z.ai/release-notes/new-released)

[← 返回 GLM 模型家族](../glm.md)
