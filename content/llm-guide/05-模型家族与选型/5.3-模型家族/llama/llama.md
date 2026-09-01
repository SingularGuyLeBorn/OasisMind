---
title: "Llama 模型家族"
category: "模型家族与选型"
tags: ["llama", "模型家族", "开放权重", "选型"]
published: true
as_of: "2026-09-01"
excerpt: "从研究许可的 LLaMA 到原生多模态 MoE Llama 4：版本身份、参数口径、上下文、模态和许可边界。"
---

# Llama 模型家族

> 核验日期：2026-09-01。这里按 Meta 的正式发布身份组织；参数区分稠密总参数与 MoE 激活/总参数，上下文区分模型卡上限与实际任务有效长度，许可逐代核对。

## 定位

Llama 是 Meta 的基础模型家族。2023 年的初代 **LLaMA** 是面向研究者、非商业且受控访问的文本基座；Llama 2 起转为允许多数商业用途的自定义社区许可；Llama 3 系列扩展了词表、训练规模、上下文、多语言和视觉；Llama 4 则改为原生多模态 MoE。版本名相近不代表权重、提示格式、上下文或许可可以互换。

截至核验日，Meta 官方 `llama-models` 清单仍列到 Llama 4。Muse Spark 虽同属 Meta 的模型产品，但不是一个 Llama 版本，因此不并入本谱系。

## 谱系

| 身份 | 首次发布 | 官方权重身份 | 输入 → 输出 | 标称上下文 | 页面 |
|---|---|---|---|---:|---|
| LLaMA（初代） | 2023-02-24 | 7B、13B、33B、65B；受控研究访问 | 文本 → 文本 | 2K | [LLaMA](./llama/llama.md) |
| Llama 2 | 2023-07-18 | 7B、13B、70B；Base/Chat | 文本 → 文本 | 4K | [Llama 2](./llama2/llama2.md) |
| Llama 3 | 2024-04-18 | 8B、70B；Base/Instruct | 文本 → 文本/代码 | 8K | [Llama 3](./llama3/llama3.md) |
| Llama 3.1 | 2024-07-23 | 8B、70B、405B；Base/Instruct | 多语言文本 → 文本/代码 | 128K | [Llama 3.1](./llama3-1/llama3-1.md) |
| Llama 3.2 | 2024-09-25 | 文本 1B/3B；Vision 11B/90B | 文本或文本+图像 → 文本 | 128K；官方量化文本版 8K | [Llama 3.2](./llama3-2/llama3-2.md) |
| Llama 3.3 | 2024-12 | 70B Instruct 为官方仓库列出的可用 SKU | 多语言文本 → 文本/代码 | 128K | [Llama 3.3](./llama3-3/llama3-3.md) |
| Llama 4 | 2025-04-05 | Scout 17B-A/109B、Maverick 17B-A/400B | 多语言文本+图像 → 文本/代码 | Scout 10M；Maverick 1M | [Llama 4](./llama4/llama4.md) |

`B-A` 表示激活参数，不是总参数。表中的上下文是官方模型卡口径，不保证同样长度下的检索、推理质量、吞吐或显存可接受。

## 跨代技术主线

1. **架构**：LLaMA 到 Llama 3.3 以 decoder-only 稠密 Transformer 为主，持续使用 RMSNorm、SwiGLU 与 RoPE；GQA 从 Llama 2 的 70B 扩到 Llama 3 的全部规模。Llama 4 首次在该家族采用 MoE，并通过早融合联合处理文本与视觉 token。
2. **上下文**：2K → 4K → 8K → 128K；Llama 4 Scout 的模型卡上限到 10M，但官方同时说明它的预训练和后训练上下文为 256K，10M 依赖长度泛化，不能把“可接收”写成“任意 10M 任务可靠”。
3. **模态**：Llama 3.2 Vision 用独立视觉编码器和跨注意力适配器接到 Llama 3.1 文本模型；Llama 4 才是官方所称的原生多模态早融合。两者不可混写。
4. **后训练**：Base/Pretrained 与 Chat/Instruct 是不同检查点。模型卡中的工具调用、对话和安全结论通常针对 Instruct，不自动适用于 Base。

## “开放”的准确说法

| 代际 | 权重可得性 | 许可边界 |
|---|---|---|
| LLaMA | 受控申请 | 非商业研究许可，不可用后代许可覆盖 |
| Llama 2 | 可申请/下载 | Llama 2 Community License；含可接受使用政策、超大规模用户门槛及特定再利用限制 |
| Llama 3 | 可申请/下载 | Meta Llama 3 Community License；自定义条款，不是 Apache/MIT |
| Llama 3.1 | 可申请/下载 | Llama 3.1 Community License；包含归属、命名、被纳入的使用政策和 7 亿月活门槛等条件 |
| Llama 3.2 | 可申请/下载 | Llama 3.2 Community License 主文纳入 Acceptable Use Policy；当前政策对 11B/90B 多模态模型另有欧盟主体权利限制，不适用于 1B/3B 纯文本权重 |
| Llama 3.3 | 可申请/下载 | Llama 3.3 Community License；包含归属、命名、被纳入的使用政策和 7 亿月活门槛等条件 |
| Llama 4 | 可申请/下载 | Llama 4 Community License 主文纳入 Acceptable Use Policy；当前政策对多模态模型另有欧盟主体权利限制 |

因此本库统一使用“开放权重”或“可下载权重”，不把它们标成 OSI 开源。OSI 的 Open Source AI Definition 还要求能自由使用、研究、修改、分享以及足够的数据信息和训练代码；Llama 的自定义许可和未完整公开训练材料不满足这一完整口径。这里不是法律意见，生产采用前应由法务核对对应检查点随附的 `LICENSE` 与使用政策。

## 选型顺序

1. 先确定模态：纯文本、3.2 Vision 的图像理解，还是 Llama 4 的原生文本+图像。
2. 再确定部署边界：本地硬件、并发、KV 缓存、量化支持和推理框架版本；不要只按参数名估算显存。
3. 对长上下文分别压测有效召回、位置偏置、首 token 延迟、生成吞吐和成本。
4. 锁定精确模型 ID、聊天模板、量化格式、许可版本和模型卡日期；托管 API 的同名路由不能反推为某个公开检查点。
5. 最后做业务域评测与安全评测；官方 benchmark 仅代表其披露协议下的结果。

## 一手来源

- [Meta 官方 Llama 模型清单与模型卡入口](https://github.com/meta-llama/llama-models)
- [Meta Llama 开发者入口](https://ai.meta.com/llama/get-started/)
- [Llama 3 Herd of Models 技术报告](https://arxiv.org/abs/2407.21783)
- [Llama 4 官方发布](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
- [OSI Open Source AI Definition 1.0](https://opensource.org/ai/open-source-ai-definition)
- [OSI 对 Llama 许可边界的说明](https://opensource.org/blog/metas-llama-2-license-is-not-open-source)

[← 返回模型家族索引](../5.3-模型家族.md)
