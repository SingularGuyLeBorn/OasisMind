---
title: "GLM-5V-Turbo"
category: "模型家族与选型"
tags: ["glm-5v-turbo", "多模态 agent", "vision coding", "api model"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-5V-Turbo 的原生多模态 Agent 定位、输入输出、200K API 窗口和公开边界。"
---

# GLM-5V-Turbo

## 身份

GLM-5V-Turbo 于 2026 年 4 月 1 日作为托管模型发布；技术报告于 4 月 29 日提交。它面向视觉编码和多模态 Agent，把感知放进规划、工具调用和执行链，而不是仅在文本模型前外挂一次图像描述。

| 字段 | 官方服务口径 |
|---|---|
| 模型代码 | `glm-5v-turbo` |
| 输入 | 视频、图像、文本、文件 |
| 输出 | 文本 |
| 上下文 | 200K |
| 最大输出 | 128K |
| 公开形态 | API；截止核验日无对应公开权重模型卡 |
| 参数与权重许可 | 未公开 |

## 技术主线

官方报告与服务页把改进分为原生多模态融合、CogViT 视觉编码、适合推理的 MTP、30 多类任务联合强化学习、Agent 数据构造和多模态工具链。报告并未给出可下载检查点的参数规格；“以更小参数规模取得领先结果”是相对比较，不能据此填写具体参数量。

目标任务包括设计稿到前端、截图调试、GUI 探索、文档/图表理解和视频目标跟踪。动作执行由 Claude Code、OpenClaw 或其他工具框架完成。模型输出文本并不等于它原生输出网页、鼠标事件或视频。

## 评估边界

多模态 Agent 需同时评测感知、坐标/元素定位、计划、工具协议、执行后视觉复核和错误恢复。200K token 还会被图像、视频帧和工具结果共同占用。处理上传文件时应核对平台的数据保留、地区、敏感信息和成本条款。

## 一手来源

- [GLM-5V-Turbo 官方服务文档](https://docs.z.ai/guides/vlm/glm-5v-turbo)
- [GLM-5V-Turbo 技术报告](https://arxiv.org/abs/2604.26752)
- [Z.ai 模型发布记录](https://docs.z.ai/release-notes/new-released)
- [Z.ai 模型参数说明](https://docs.z.ai/guides/overview/concept-param)

[← 返回 GLM 模型家族](../glm.md)
