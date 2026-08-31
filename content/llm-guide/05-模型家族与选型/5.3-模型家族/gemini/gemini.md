---
title: "Gemini 家族：研究代际、服务型号与开放性边界"
published: true
as_of: 2026-09-01
tags: [Gemini, Google-DeepMind, 多模态, 模型选型]
---

# Gemini 家族

Gemini 是 Google DeepMind 的闭源、多模态基础模型家族。它既指研究代际，也出现在 Gemini App、Gemini API、Google AI Studio、Vertex AI 等产品与服务中。读文档时必须先分清三层：**研究模型**、**API 型号**、**面向用户的产品名称**。三者可能同名，但生命周期和能力开关并不相同。

> 本页状态截止 **2026-09-01**。API 型号、价格、配额和停用日期会变；部署前应重新检查 Google AI 与 Vertex AI 的当前文档。

## 先给结论

- Gemini **不是开放权重模型**，也不能因开发者可通过 API 调用就称为“开源”。权重、完整训练数据、绝大多数代际的参数量和完整架构没有公开。
- Gemini 1.0 报告公开了 Ultra、Pro、Nano 三档，但只有 Nano-1（1.8B）和 Nano-2（3.25B）给出参数量；Ultra/Pro 的网络规模未知。
- Gemini 1.5 的论文确认 Pro 使用稀疏 MoE，并研究了最长千万 token 的上下文；这不等于所有商用端点都提供 10M 窗口。
- Gemini 2.0 把工具调用、实时音视频和多模态输出推向产品化，但不同能力曾分处实验、预览和 GA 服务，不能收成一个“全能 2.0 权重”。
- Gemini 2.5 把 thinking 变成家族主轴；稳定的 2.5 Pro/Flash 服务仍可见于 2026-09-01 的 Gemini API 生命周期表。
- Gemini 3 是一个持续迭代的服务族。3 Pro、3.1 Pro、3.5/3.6/3.7 Flash 等不是同一天、同状态或同一端点；选型必须写出完整模型 ID 和核对日期。
- Project Astra 是研究原型与产品能力路线，不是可下载权重，也不是一个独立 API 模型 ID。

## 家族边界

| 名称 | 正确身份 | 与 Gemini 的关系 |
|---|---|---|
| Bard | 面向用户的对话产品，2024 年更名为 Gemini | 先后使用 LaMDA、PaLM 2、Gemini；不是模型版本 |
| PaLM / PaLM 2 | Google 的前代语言模型家族 | 技术与产品前史，不应改名为 Gemini 0.x |
| Gemini | 闭源多模态基础模型及其服务型号 | 本知识库的主体 |
| Gemma | 单独的开放权重模型家族 | 与 Gemini 有技术渊源，但不是“小号 Gemini”，许可和部署方式不同 |
| Project Astra | 通用助手研究原型 | 使用 Gemini 能力，不能当作权重或 API SKU |

## 代际地图

| 代际 | 首次公开节点 | 官方确认的主线变化 | 2026-09-01 的服务视角 |
|---|---:|---|---|
| [Gemini 1.0](./gemini-1/gemini-1.md) | 2023-12-06 | 原生多模态；Ultra/Pro/Nano；32K；TPUv4/v5e | 历史代际，不应新接入 |
| [Gemini 1.5](./gemini-1-5/gemini-1-5.md) | 2024-02-15 | Pro 使用稀疏 MoE；百万级产品窗；千万级研究实验；Flash/Flash-8B | Gemini API 的 1.5 端点已于 2025-09-29 关闭 |
| [Gemini 2.0](./gemini-2/gemini-2.md) | 2024-12-11 | Flash 实验档；原生工具调用、Live API、多模态输出预览 | 2.0 Flash/Flash-Lite GA 端点已于 2026-06-01 关闭 |
| [Gemini 2.5](./gemini-2-5/gemini-2-5.md) | 2025-03-25 | thinking 成为默认能力主线；Pro、Flash、Flash-Lite | 2.5 Pro/Flash/Flash-Lite 稳定端点仍列在生命周期表中 |
| [Gemini 3](./gemini-3/gemini-3.md) | 2025-11-18 | thinking level、thought signature、代理式编码与工具工作流 | 3.7 Flash 为 GA；3.1 Pro 仍是 preview；另有多条 Flash/Lite/媒体端点 |
| [Project Astra](./project-astra/project-astra.md) | 2024-05-14 | 实时视觉、语音、记忆与工具的助手原型 | 仍应按研究原型/产品能力理解 |

## 怎样理解“上下文窗口”

上下文数字至少有三种口径：

1. **研究实验上限**：论文为证明算法能力而测试的长度，例如 Gemini 1.5 的 10M 级实验。
2. **产品输入上限**：某个具体 API 型号允许提交的最大 token 数。
3. **有效任务长度**：在特定任务、模态、工具和延迟预算下仍保持可靠性的长度。

因此，“论文跑过 10M”不能改写成“所有 1.5 API 都有 10M”，“2.5 曾预告 2M”也不能覆盖当前型号页的 1,048,576 输入上限。选型表必须同时记录 **model ID、平台、发布日期/版本、输入上限、输出上限、核对日期**。

## 开放性与可复现性

| 项目 | Gemini | Gemma |
|---|---|---|
| 权重下载 | 否 | 是，按各版本条款提供 |
| API/托管服务 | 是 | 部分平台也提供 |
| 完整参数量 | 多数未披露 | 通常在模型卡中披露 |
| 完整训练配方 | 否 | 仍非完全公开，但报告信息更多 |
| “开源”表述 | 不应使用 | 更准确写“开放权重”，并逐版核对许可 |

Gemini 的网页文档通常采用站点内容许可，但那不等于模型权重或服务本身采用同一许可。模型调用受产品条款、API 条款和使用政策约束。

## 选型框架

- **需要最高效的当前通用/代理工作流**：从 Gemini 3 的 GA Flash/Lite 型号开始比较，核对工具支持和区域可用性。
- **需要高难推理且可接受 preview 风险**：评估 3.1 Pro preview，同时准备端点变化与回归测试。
- **维护既有 2.5 工作流**：固定精确 ID，监控生命周期；不要用 `latest` 别名替代变更管理。
- **需要自托管、离线或可审计权重**：Gemini 不满足，应转向 Gemma 或其他开放权重家族。
- **需要实时音视频**：选择 Live/Audio 专用端点，不要从通用文本型号名称推断其支持双向音频。

## 事实核对顺序

1. Google DeepMind 模型卡或技术报告：模型身份、输入输出、评测与限制。
2. Gemini API / Vertex AI 型号页：精确 ID、上下文、工具、区域、生命周期。
3. Google 官方发布公告：发布日期、产品阶段与迁移说明。
4. 第三方榜单与聚合站：只能作为补充，不能反推未公开架构、参数量或动态 API 状态。

## 官方入口

- [Google DeepMind Gemini 模型页](https://deepmind.google/models/gemini/)
- [Google DeepMind 模型卡索引](https://deepmind.google/models/model-cards/)
- [Gemini API 模型列表](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API 生命周期与停用表](https://ai.google.dev/gemini-api/docs/deprecations)
- [Gemini API 发布记录](https://ai.google.dev/gemini-api/docs/changelog)
