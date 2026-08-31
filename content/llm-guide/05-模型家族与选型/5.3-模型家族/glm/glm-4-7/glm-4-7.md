---
title: "GLM-4.7"
category: "模型家族与选型"
tags: ["glm-4.7", "glm-4.7-flash", "coding", "agentic"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-4.7 与 30B/A3B Flash 的思考控制、200K 上下文和部署选择。"
---

# GLM-4.7

## 身份

GLM-4.7 于 2025 年 12 月 22 日发布，是面向编码、推理与智能体任务的文本模型。GLM-4.7-Flash 于 2026 年 1 月 19 日另行发布；二者不是同一个权重的速度档。

| 型号 | 规模 | 上下文 | 许可 | 定位 |
|---|---:|---:|---|---|
| GLM-4.7 | 官方模型卡所属 GLM-4.5 大型 MoE 家族 | 200K | MIT | 高能力编码、推理、Agent |
| GLM-4.7-Flash | 30B 总参数 / 3B 激活 | 200K | MIT | 低延迟、高吞吐与本地部署 |

## 思考与工具轨迹

GLM-4.7 改进交错思考（在工具调用前继续推理）和保留思考（跨轮保留历史 reasoning）的支持。是否发送、保存或清除思考内容取决于模板和 API；保留完整思考会快速消耗上下文，也可能暴露敏感中间信息，生产系统应明确日志策略。

`200K` 是窗口口径，不是检索质量承诺。对于长代码库，应把定位正确率、补丁可执行率、工具调用成功率、上下文压缩和成本分开测。官方前端/文档生成示例也需要浏览器、构建器和渲染检查等外部工具。

## 为什么单列 Flash

Flash 的 30B/A3B MoE 规模显著降低每 token 激活计算，但仍需加载全部专家权重。它适合高频文本任务或资源受限的私有部署；复杂长时 Agent 不应仅凭同名家族假设它复现主模型能力。

## 一手来源

- [GLM-4.7 官方发布页](https://z.ai/blog/glm-4.7)
- [GLM-4.7 官方模型卡](https://huggingface.co/zai-org/GLM-4.7)
- [GLM-4.7-Flash 官方模型卡](https://huggingface.co/zai-org/GLM-4.7-Flash)
- [Z.ai 发布记录](https://docs.z.ai/release-notes/new-released)

[← 返回 GLM 模型家族](../glm.md)
