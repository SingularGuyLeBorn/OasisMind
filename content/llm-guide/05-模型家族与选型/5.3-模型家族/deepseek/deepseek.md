---
title: "DeepSeek 模型家族"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "moe", "推理模型"]
published: true
as_of: "2026-09-01"
excerpt: "DeepSeek-Coder、Math、V2/V3/R1、V3.1/V3.2 与 V4 的身份、许可、能力和部署边界。"
---

# DeepSeek 模型家族

> 核验日期：2026-09-01。旧目录中的“DeepSeek-V3.2-Terminus”不是官方身份；正式名称为 **DeepSeek-V3.1-Terminus**，发布日期为 2025-09-22。

## 定位与谱系

DeepSeek 的公开路线不只是“通用模型逐代升级”：Coder/Math 是领域线，V2/V3 是通用 MoE 基座线，R1 是推理后训练线，V3.1/V3.2 强化混合推理与 Agent，V4 再把长上下文、稀疏注意力和更大/更小 MoE 两档合并为产品系列。

| 身份 | 官方日期 | 参数口径 | 版本页 |
|---|---|---|---|
| DeepSeek-Coder | 2024-01-25（论文 v1） | 1.3B–33B，多尺寸 Dense 模型 | [DeepSeek-Coder](./deepseek-coder/deepseek-coder.md) |
| DeepSeekMath | 2024-02-05（论文 v1） | 7B | [DeepSeekMath](./deepseek-math/deepseek-math.md) |
| DeepSeek-V2 | 2024-05-07（论文 v1） | 236B 总参数 / 21B 每 token 激活 | [DeepSeek-V2](./deepseek-v2/deepseek-v2.md) |
| DeepSeek-Coder-V2 | 2024-06-17（论文 v1） | Lite 16B/2.4B 激活；完整 236B/21B 激活 | [DeepSeek-Coder-V2](./deepseek-coder-v2/deepseek-coder-v2.md) |
| DeepSeek-V3 | 2024-12-26（官方发布）；论文 v1 为 2024-12-27 | 671B 主模型 / 37B 每 token 激活；HF 文件另含 14B MTP 模块，界面常显示 685B | [DeepSeek-V3](./deepseek-v3/deepseek-v3.md) |
| DeepSeek-R1 | 2025-01-20（官方 API/权重发布）；论文 v1 为 2025-01-22 | R1/R1-Zero：671B 总参数 / 37B 激活；蒸馏模型为 1.5B–70B 多个独立基座 | [DeepSeek-R1](./deepseek-r1/deepseek-r1.md) |
| DeepSeek-V3.1 | 2025-08-21 | 671B 总参数 / 37B 激活（官方下载表）；HF 文件合计界面可能显示 685B | [DeepSeek-V3.1](./deepseek-v3-1/deepseek-v3-1.md) |
| DeepSeek-V3.1-Terminus | 2025-09-22 | 发布说明未单独复表；官方模型卡指向 V3.1-Base 并称结构与 V3 相同 | [DeepSeek-V3.1-Terminus](./deepseek-v3-1-terminus/deepseek-v3-1-terminus.md) |
| DeepSeek-V3.2 | 2025-12-01（官方发布）；论文 v1 为 2025-12-02 | 671B 总参数 / 37B 激活（V4 官方对照表）；HF 文件集界面显示 685B | [DeepSeek-V3.2](./deepseek-v3-2/deepseek-v3-2.md) |
| DeepSeek-V4 | 2026-04-24（Preview）；Flash 2026-07-31 更新，Pro 2026-08-13 GA | Pro 1.6T/49B 激活；Flash 284B/13B 激活（技术报告） | [DeepSeek-V4](./deepseek-v4/deepseek-v4.md) |

## 许可边界

- DeepSeek-Coder、DeepSeekMath、DeepSeek-V2 与 DeepSeek-Coder-V2：代码仓库通常为 MIT，但模型权重受当代 **DeepSeek Model License** 约束；“支持商用”不等于权重也是 MIT。
- DeepSeek-V3、R1、V3.1、V3.1-Terminus、V3.2 与 V4 的官方模型卡将仓库和权重标为 MIT。
- R1 蒸馏检查点还继承 Qwen 或 Llama 基座的许可条件；选择时必须读取具体模型卡，而不是只看“R1”。

## 能力与证据边界

- 参数、上下文、模板和模态必须落到具体 checkpoint/API 版本；HF 文件总量、主模型参数量和每 token 激活参数是不同口径。
- V3.1-Terminus 是 V3.1 更新；V3.2-Speciale 是 V3.2 高计算预算变体；V4-Flash-Vision-Exp 是单独实验多模态 API。三者都不能被名称相似性合并。
- 厂商基准只说明其公开评测设置。生产选型仍需固定模型、模板、采样、工具集、日期和自有回归集。
- MLA、MoE、MTP、GRPO、DSA、mHC 与训练系统的原理正本属于架构/后训练/系统章节，本页只保存模型身份和选型边界。

## 部署与选型

- 资源有限的代码或数学研究：优先看 Coder/Math 的小尺寸，或 Coder-V2-Lite/R1 蒸馏模型。
- 通用自部署：V2 以后完整 MoE 都是多卡系统工程问题；先验证量化来源、并行支持、模板和 KV 内存。
- 推理任务：区分 R1 主模型、蒸馏模型与 V3.1/V3.2/V4 的 thinking mode，不要把 API 名称当固定权重。
- 长上下文与当前 Agent API：截至核验日重点比较 V3.2 与 V4；V4 Pro/Flash、GA/Preview、文本/视觉实验身份必须分别验收。

## 一手入口

- [DeepSeek 官方模型组织](https://huggingface.co/deepseek-ai)
- [DeepSeek 官方 GitHub](https://github.com/deepseek-ai)
- [DeepSeek API 更新日志](https://api-docs.deepseek.com/updates/)
- [DeepSeek-V4 官方集合](https://huggingface.co/collections/deepseek-ai/deepseek-v4)

[← 返回模型家族索引](../5.3-模型家族.md)
