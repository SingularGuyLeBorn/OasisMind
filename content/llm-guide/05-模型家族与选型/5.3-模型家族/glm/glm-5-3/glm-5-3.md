---
title: "GLM-5.3"
category: "模型家族与选型"
tags: ["glm-5.3", "post-training", "cybersecurity", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-5.3 的服务与权重发布日期、同基座后训练、1M 上下文和自定义许可。"
---

# GLM-5.3

## 两个发布日期

Z.ai 当前发布记录把 GLM-5.3 服务发布列为 2026 年 8 月 18 日；Hugging Face 模型仓库元数据记录权重于 2026 年 8 月 28 日公开。旧稿把预告、API 上线和权重发布压成一个日期会造成“当日已可本地部署”的错误印象。

## 模型关系

官方模型卡明确：GLM-5.3 与 GLM-5.2 使用同一个 base model，能力提升来自后训练。这意味着可以沿用 GLM-5.2 的基础架构/1M 上下文背景，但不能声称又完成一轮新的 28.5T 或 30T 预训练。

| 字段 | 官方口径 |
|---|---|
| 输入/输出 | 文本 → 文本 |
| 基座 | 与 GLM-5.2 相同 |
| 上下文 | 模型卡以 1M 窗口评测；部署仍以精确配置为准 |
| 思考控制 | `reasoning_effort`: low / high / max，默认 max；不提供完全关闭思考的同等模式 |
| 公开形态 | API 与开放权重 |
| 权重许可 | 自定义 GLM-5.3 License，不是 MIT |

## 许可不是小字

GLM-5.3 License 允许使用、修改、分发和商业应用，但对“模型即服务”另设条件：若被许可方及关联方在连续 12 个月总收入超过 100 亿美元，商业使用前需通过 Z.ai 安全审查。它因此不能被写作 MIT/Apache；法务判断应直接阅读仓库 LICENSE。

## 网络安全能力与安全边界

官方强调漏洞发现和利用链 benchmark 的提升，并披露具体 Agent 框架、任务数、时间预算与采样设置。这些是项目方评测，不是对真实系统授权。合法使用必须限定在自有或明确授权环境，建立作用域、速率、凭证隔离、审计日志和人工批准；不要把“能力更强”改写成无条件攻击教程。

## 一手来源

- [GLM-5.3 官方发布页](https://z.ai/blog/glm-5.3)
- [GLM-5.3 官方模型卡](https://huggingface.co/zai-org/GLM-5.3)
- [GLM-5.3 License](https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE)
- [Z.ai 模型发布记录](https://docs.z.ai/release-notes/new-released)
- [GLM-5 技术报告](https://arxiv.org/abs/2602.15763)

[← 返回 GLM 模型家族](../glm.md)
