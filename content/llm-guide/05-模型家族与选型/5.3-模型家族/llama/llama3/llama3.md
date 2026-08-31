---
title: "Llama 3"
category: "模型家族与选型"
tags: ["llama3", "基础模型", "gqa", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "2024 年 4 月发布的 8B/70B 文本模型：8K 上下文、128K 词表、全尺寸 GQA。"
---

# Llama 3

> 核验日期：2026-09-01。本页只指 2024-04-18 的 8B/70B 首发，不把 7 月发布的 3.1/405B/128K 或论文中的实验多模态能力倒灌进来。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布 | 2024-04-18 |
| 参数 | 8B、70B；Pretrained 与 Instruct |
| 上下文 | 8,192 token |
| 模态 | 文本输入 → 文本/代码输出；官方模型卡的预期使用语言为英语 |
| 架构 | decoder-only 稠密 Transformer；两个尺寸均使用 GQA；128K token 词表 |
| 训练量 | 15T+ token，来自官方所称公开可得来源；代码数据相对 Llama 2 增加 |
| 许可 | Meta Llama 3 Community License + Acceptable Use Policy |

## 关键变化

- tokenizer 词表扩至约 128K；官方报告其相对 Llama 2 可减少部分文本的 token 数，但节省比例依赖语言和语料。
- GQA 扩展到 8B 与 70B，而不再只用于最大尺寸。
- 数据规模从 Llama 2 的 2T 提高到 15T+；官方未公开可重建同等模型的完整训练数据清单。
- Instruct 检查点经过 SFT 与偏好对齐；工具调用和聊天格式必须使用对应模型卡/参考实现。

## 最易混淆的身份

- **Llama 3 首发**：8B/70B、8K、文本。
- **Llama 3.1**：8B/70B/405B、128K、多语言文本，于 2024-07-23 发布。
- **《Llama 3 Herd of Models》**：与 3.1 同期公开，覆盖 405B、后训练、基础设施和未作为 Llama 3 首发权重发布的视觉/语音实验。旧资料把整篇报告简称为“Llama 3 技术报告”可以作为论文题名沿用，但规格表必须落到具体发布版本。

## 许可与部署

社区许可允许广泛研究与商业使用，但含归属、可接受使用政策、衍生模型命名、超大规模用户门槛和对利用材料/输出训练其他 LLM 的限制。它不是 OSI 许可。部署时还应锁定 `Llama-3-8B[-Instruct]` 或 `Llama-3-70B[-Instruct]` 的精确 ID、聊天模板和 tokenizer；不能用 3.1 的 128K 配置直接覆盖 3.0 权重。

## 一手来源

- [Meta Llama 3 官方公告](https://ai.meta.com/blog/meta-llama-3/)
- [Meta Llama 3 模型卡](https://github.com/meta-llama/llama-models/blob/main/models/llama3/MODEL_CARD.md)
- [Meta Llama 3 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama3/LICENSE)

[← 返回 Llama 家族](../llama.md) · [模型家族索引](../../5.3-模型家族.md)
