---
title: "MiniMax 模型家族"
category: "模型家族与选型"
tags: ["minimax", "模型家族", "长上下文", "agent", "多模态"]
published: true
as_of: "2026-09-01"
excerpt: "从 abab、MiniMax-01、M1、M2 系列到 M3：版本身份、架构变化、模态、上下文、权重与许可边界。"
---

# MiniMax 模型家族

> 核验日期：2026-09-01。这里把模型、托管 API 和产品分开记录；“开放权重”、API 可用、某个产品采用该模型，是三个不同事实。

## 定位与谱系

MiniMax 的文本模型经历了三条明显路线：早期 `abab` 是专有服务身份；MiniMax-01/M1 以 Lightning Attention 和长上下文为主；M2 系列改用全注意力的稀疏 MoE，集中优化代码、工具和长程 Agent；M3 再以 MiniMax Sparse Attention（MSA）扩展到原生多模态与 1M 上下文。

| 身份 | 官方日期 | 公开形态 | 关键边界 | 页面 |
|---|---|---|---|---|
| abab 6.5 / 6.5s | 2024-04-17 | 专有模型/API | 官方发布披露 200K；没有公开权重或完整架构表 | [abab](./abab/abab.md) |
| MiniMax-Text-01 / VL-01 | 2025-01-15 | 开放权重 | Text 为 456B/45.9B 激活；训练 1M、推理外推至 4M | [MiniMax-01](./minimax-01/minimax-01.md) |
| MiniMax-M1 | 2025-06-16 | 开放权重 | 沿用 456B/45.9B 混合注意力骨干；1M 上下文，40K/80K 推理输出变体 | [MiniMax-M1](./minimax-m1/minimax-m1.md) |
| MiniMax-M2 | 2025-10-27 | 开放权重与 API | 229.9B/9.8B 激活；全注意力 MoE；192K 原生训练窗口 | [MiniMax-M2](./minimax-m2/minimax-m2.md) |
| MiniMax-M2.1 | 2025-12-22/23 | 开放权重与 API | M2 的后训练迭代；官方未另列一套骨干参数表 | [MiniMax-M2.1](./minimax-m2-1/minimax-m2-1.md) |
| MiniMax-M2.5 | 2026-02-12 | 开放权重与 API | Agent 数据与 Forge RL 扩展；`highspeed` 是服务档，不是新注意力架构 | [MiniMax-M2.5](./minimax-m2-5/minimax-m2-5.md) |
| MiniMax-M2.7 | 2026-03-18 | 开放权重与 API | “自我进化”指调试训练、修改 scaffold/harness，不是自主改写权重 | [MiniMax-M2.7](./minimax-m2-7/minimax-m2-7.md) |
| MiniMax-M3 | 2026-06-01 | 开放权重与 API | 约 428B/23B 激活；文本、图像、视频输入，文本/代码/工具输出；1M | [MiniMax-M3](./minimax-m3/minimax-m3.md) |

日期差一天时，以官方发布页和 API 发布日志的各自口径原样保留。例如 M2.1 API 日志列 2025-12-22，英文发布页列 2025-12-23；这不是两个模型。

## 产品与模态边界

- **M 系列**是本页的语言/Agent 主线；M3 可以理解图像与视频，但这不表示它直接生成 Hailuo 视频。
- **Hailuo / H3**是视频生成产品与模型线。H3 接收文本、图像、视频和音频上下文并生成带音频的视频，属于视频生成章节，而不是 M3 的版本号。
- **Speech、Music、Image** 是另外的生成模型线。API 中共享同一厂商入口，不代表共享架构、权重或许可。
- **MiniMax Agent、MiniMax Code、Talkie** 是产品或 harness。产品行为不能反推底层 checkpoint 的未披露结构。

## 许可边界

| 权重身份 | 官方许可口径 | 使用前必须注意 |
|---|---|---|
| MiniMax-01 | 代码为 MIT；权重为 MiniMax Model License | 模型权重有署名、再分发和禁止用途条款，不能套用代码许可证 |
| MiniMax-M1 | Apache-2.0 | 仍需遵守模型卡中的使用说明和依赖许可 |
| MiniMax-M2 | MIT 文本附大规模商业产品展示要求 | 不是未经修改的标准 MIT 文本 |
| MiniMax-M2.1 / M2.5 | Modified-MIT | 逐 checkpoint 阅读随附 `LICENSE`；不要只看模型卡标签 |
| MiniMax-M2.7 | 非商业许可 | 商业使用需要 MiniMax 事先书面授权 |
| MiniMax-M3 | MiniMax Community License | 商业使用有展示/通知要求；年收入超过 2000 万美元时需事先书面授权 |

本页不是法律意见。部署前应把模型仓库的具体提交、`LICENSE`、模型卡和服务条款一起存档。

## 选型顺序

1. 需要本地研究长推理且接受大体量混合注意力骨干：看 M1；需要成熟的文本 Agent 与代码生态：比较 M2.5/M2.7。
2. 需要图像/视频理解、1M 托管上下文或最新代码/办公能力：看 M3；不要据此假定视频生成输出。
3. API 使用应以精确模型 ID 为准。截至核验日，官方 API 为 M2、M2.1、M2.5、M2.7 标注的 204,800 是输入与输出合计上限；它不等于 M2 论文中的 192K 训练窗口。
4. 自部署先核对完整权重容量、推理框架版本、量化来源、上下文内存和许可。激活参数少不等于只需装载激活参数。
5. 厂商 benchmark 只能按其披露的 harness、采样、上下文管理和日期解释；上线前仍需自有任务回归和安全评估。

## 一手入口

- [MiniMax 官方发布日志](https://platform.minimax.io/docs/release-notes/models)
- [MiniMax API 模型与上下文表](https://platform.minimax.io/docs/api-reference/api-overview)
- [MiniMax 官方 GitHub](https://github.com/MiniMax-AI)
- [MiniMax 官方 Hugging Face](https://huggingface.co/MiniMaxAI)
- [MiniMax-01 技术报告](https://arxiv.org/abs/2501.08313)
- [MiniMax-M1 技术报告](https://arxiv.org/abs/2506.13585)
- [MiniMax-M2 系列技术报告 v2](https://arxiv.org/abs/2605.26494v2)
- [MiniMax Sparse Attention](https://arxiv.org/abs/2606.13392)

[← 返回模型家族索引](../5.3-模型家族.md)
