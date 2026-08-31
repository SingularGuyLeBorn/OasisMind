---
title: "OpenAI 模型家族"
category: "模型家族与选型"
tags: ["openai", "gpt", "o-series", "api", "open-weight"]
published: true
as_of: "2026-09-01"
excerpt: "区分 OpenAI 研究论文、ChatGPT 产品、API 模型身份和开放权重，并给出可复核的版本边界。"
---

# OpenAI 模型家族

> 核验日期：2026-09-01。这里把论文中的研究模型、ChatGPT 产品、API 别名/快照和可下载权重分开记录；四者不能互相替代。

## 四种身份

| 身份 | 例子 | 能确认什么 | 不能反推什么 |
|---|---|---|---|
| 研究论文 | GPT-1、GPT-2、GPT-3、InstructGPT | 论文披露的实验模型、数据和训练方法 | 当前 API 是否仍提供同名模型 |
| ChatGPT 产品 | 2022 年的 ChatGPT、Operator | 产品发布时间和交互能力 | 精确 checkpoint、参数量或 API 型号 |
| 托管 API | `gpt-4.1`、`o3`、`gpt-5.6-sol` | 模型 ID、上下文、模态、端点和生命周期 | 未公开的网络结构、参数量和训练数据 |
| 开放权重 | GPT-2、`gpt-oss-120b` | 可下载 checkpoint 与随附许可 | 与闭源 GPT/API 主线共享架构或训练配方 |

## 阅读地图

| 主线 | 重点 | 页面 |
|---|---|---|
| 生成式预训练奠基 | GPT-1、GPT-2、GPT-3 的论文事实与开放边界 | [GPT-1](./gpt-1/gpt-1.md) · [GPT-2](./gpt-2/gpt-2.md) · [GPT-3](./gpt-3/gpt-3.md) |
| 指令与产品化 | InstructGPT 的 RLHF 实验；ChatGPT 与 GPT-3.5 API 的身份差异 | [InstructGPT](./instructgpt/instructgpt.md) · [ChatGPT 与 GPT-3.5](./chatgpt-gpt-3-5/chatgpt-gpt-3-5.md) |
| GPT-4 代服务 | GPT-4、Vision、Turbo、4o、4o mini、4.1、4.5 的版本与披露边界 | [GPT-4 系列](./gpt-4-series/gpt-4-series.md) |
| 推理模型 | o1 到 o3/o4-mini；测试时推理与系统卡边界 | [o 系列](./o-series/o-series.md) |
| 计算机操作 | Operator 产品与 `computer-use-preview` API 身份 | [Operator 与 Computer Use](./operator-computer-use/operator-computer-use.md) |
| GPT-5 代服务 | 5、5.1、5.2、5.3-Codex、5.4、5.5 的 API 生命周期 | [GPT-5 系列](./gpt-5-series/gpt-5-series.md) |
| 当前旗舰 | Sol、Terra、Luna 与 `gpt-5.6` 别名 | [GPT-5.6](./gpt-5-6/gpt-5-6.md) |
| 开放权重 | `gpt-oss-120b` 与 `gpt-oss-20b` | [gpt-oss](./gpt-oss/gpt-oss.md) |

API 目录还包含 Realtime/语音、图像与视频、嵌入、审核和网络安全等专用模型。它们属于独立模态或任务线，不因为带有 OpenAI 品牌就并入 GPT 语言模型代际；应在对应多模态、安全和工程章节按模型 ID 继续维护。

## 选型纪律

1. 生产与评测至少记录具体模型 ID、核验日期、请求参数和官方模型页；若官方提供日期化快照，再固定该快照。不要假定每个别名都有可固定的日期化版本。
2. ChatGPT 中出现的产品名不能直接写进 API 配置。反过来，API 模型也不等于 ChatGPT 当前使用的内部路由。
3. 闭源模型若未披露参数量、MoE 路由、训练语料或 RL 配方，就写“未公开”；不把逆向猜测提升为事实。
4. 价格、限额、弃用状态和工具支持会变化。本章只记录核验日快照，部署前重新检查官方目录。
5. `gpt-oss` 是开放权重例外，不代表 GPT-4、o 系列或 GPT-5 的权重开放。

## 官方入口

- [OpenAI API 模型目录](https://developers.openai.com/api/docs/models)
- [全部模型与弃用状态](https://developers.openai.com/api/docs/models/all)
- [最新模型迁移与提示指南](https://developers.openai.com/api/docs/guides/latest-model)

[← 返回模型家族索引](../5.3-模型家族.md)
