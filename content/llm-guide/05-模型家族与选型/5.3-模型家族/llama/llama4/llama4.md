---
title: "Llama 4"
category: "模型家族与选型"
tags: ["llama4", "moe", "原生多模态", "长上下文"]
published: true
as_of: "2026-09-01"
excerpt: "Scout 与 Maverick 原生多模态 MoE：激活/总参数、10M/1M 上下文和未发布 Behemoth 的证据边界。"
---

# Llama 4

> 核验日期：2026-09-01。Meta 没有发布名为“Llama 4 技术报告”的独立论文；本页只采用官方公告、模型卡、参考实现和许可证，不把旧二次稿当正式报告。

## 结论卡

| 字段 | Llama 4 Scout | Llama 4 Maverick |
|---|---:|---:|
| 发布 | 2025-04-05 | 2025-04-05 |
| 参数 | 17B 激活、109B 总参数、16 experts | 17B 激活、400B 总参数、128 experts |
| 上下文 | 模型卡 10M；预训练/后训练 256K 后做长度泛化 | 1M |
| 输入 → 输出 | 多语言文本+图像 → 多语言文本/代码 | 多语言文本+图像 → 多语言文本/代码 |
| 预训练 token | 约 40T | 约 22T |
| 架构 | MoE、原生多模态 early fusion | MoE、原生多模态 early fusion |
| 权重 | Base/Instruct | Base/Instruct，另有官方 FP8 Instruct 变体 |

## 架构主线

- **MoE**：每个 token 只激活部分参数，因此 17B 激活不能写成模型只有 17B 总参数；权重存储与计算口径必须分开。
- **原生多模态**：文本与视觉 token 在统一主干早融合。视觉编码器以 MetaCLIP 为基础，先配合冻结的 Llama 训练，再参与多模态管线；这与 Llama 3.2 的跨注意力适配器不同。
- **位置与长上下文**：官方披露交替使用带 RoPE 与不带位置编码的注意力层（iRoPE），并通过 mid-training 扩展上下文。模型卡上限仍需业务任务实测。
- **训练**：官方公告披露 30T+ 的全系列数据混合、FP8 训练、MetaP 超参数迁移与教师共蒸馏；并未开放完整训练数据和生产训练栈。

## Behemoth 不是已发布权重

Meta 公告把 Behemoth 描述为约 288B 激活、近 2T 总参数、16 experts 的教师模型，并明确写着“仍在训练”“尚未发布”。截至 2026-09-01，官方 `llama-models` 可下载清单仍只有 Scout 与 Maverick。因此：

- 不创建 Behemoth 公开身份页；
- 不把预览 benchmark 当成可复现实测；
- 不根据教师描述反推 Scout/Maverick 未披露的路由或训练细节。

## 多模态与上下文边界

- 模型卡说明图像理解测试到 5 张输入图；发布博文又报告预训练最多 48 张、后训练测试最多 8 张。两者口径不同，生产应以所用运行时和模型卡保守边界为准。
- Scout 的 10M 是支持窗口；官方同时说明训练到 256K 后依靠长度泛化。不能把 10M 接收能力写成 10M 位置上的稳定推理能力。
- 两个公开模型输出是文本/代码，不是图像、音频或视频生成模型。

## 许可与部署

Llama 4 使用自定义 Community License，包含归属、衍生模型命名、7 亿月活门槛，并在 §1.b.iv 把 Acceptable Use Policy 纳入协议。许可证主文本身没有展开地域条款；但截至本页 `as_of: 2026-09-01`，被该条款纳入的官方 Llama 4 使用政策明确规定：欧盟居民或主要营业地在欧盟的公司不获授多模态模型的 §1(a) 权利，集成产品终端用户除外。这个结论来自 Llama 4 自己的当版政策，不是把 Llama 3.2 条款跨版本套用；政策更新时须重新核对。它是开放权重而非 OSI 开源。部署还需确认总权重显存、expert 并行、量化格式、视觉预处理和上下文预算；“Scout 可装单张 H100”来自官方 Int4 配置条件，不能泛化到 BF16 或任意框架。

## 一手来源

- [Meta Llama 4 官方公告](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
- [Meta Llama 4 模型卡](https://github.com/meta-llama/llama-models/blob/main/models/llama4/MODEL_CARD.md)
- [Llama 4 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama4/LICENSE)
- [Llama 4 Acceptable Use Policy](https://github.com/meta-llama/llama-models/blob/main/models/llama4/USE_POLICY.md)
- [Meta 官方 SKU 清单](https://github.com/meta-llama/llama-models/blob/main/models/sku_list.py)

[← 返回 Llama 家族](../llama.md) · [模型家族索引](../../5.3-模型家族.md)
