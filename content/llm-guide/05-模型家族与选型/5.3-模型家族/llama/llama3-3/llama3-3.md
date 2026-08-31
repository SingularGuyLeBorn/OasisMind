---
title: "Llama 3.3"
category: "模型家族与选型"
tags: ["llama3.3", "70b", "指令模型", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "2024 年末的 70B 多语言文本模型，重点是以更低服务成本接近 3.1 405B 的部分能力。"
---

# Llama 3.3

> 核验日期：2026-09-01。官方 README 的日期表、许可证生效日和发布传播日期存在 12 月 4 日/6 日差异，本页保留到月份，不制造单一精确日。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布 | 2024-12 |
| 参数 | 70B；官方 `llama-models` SKU 清单列出 `Llama3.3-70B-Instruct` |
| 上下文 | 128K |
| 模态 | 多语言文本输入 → 文本/代码输出；无官方图像输入 |
| 架构 | decoder-only 稠密 Transformer、GQA；建立在 Llama 3 系列设计上 |
| 官方支持语言 | 英、德、法、意、葡、印地、西、泰 |
| 许可 | Llama 3.3 Community License + Acceptable Use Policy |

## 定位

Meta 将 Llama 3.3 70B 定位为以明显低于 3.1 405B 的服务成本，在若干官方评测上提供相近表现的文本模型。这里的“相近”是指定评测与提示协议下的厂商结论，不代表所有知识、代码、工具调用、安全和长上下文任务等价。

公开仓库的实际 SKU 清单只枚举 70B Instruct，因此部署文档不应凭模型卡中“pretrained and instruction tuned generative model”的概括，进一步虚构一个可下载的官方 `Llama-3.3-70B` Base ID；选择模型时以当前官方清单和实际仓库 ID 为准。

## 与 3.1 的边界

- 3.3 不是 405B 的新量化版，而是独立 70B 权重身份。
- 两者都是文本输入/文本与代码输出、128K，并采用同代 tokenizer/聊天协议体系；具体模板仍应随 tokenizer 版本锁定。
- 3.3 的知识截止、后训练数据和评测表以它自己的模型卡为准，不能直接继承 3.1 405B 的所有条目。

## 许可与部署

Llama 3.3 使用自定义社区许可，不是 Apache/MIT 或 OSI 开源许可。许可包含再分发、归属、衍生模型命名、7 亿月活门槛和可接受使用政策等条件。生产侧还需验证 128K 有效召回、量化损失、并发 KV 成本和工具调用模板，不能用单个排行榜分数替代。

## 一手来源

- [Meta Llama 3.3 模型卡](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)
- [Llama 3.3 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/LICENSE)
- [Meta 年末回顾中的 Llama 3.3 定位](https://ai.meta.com/blog/future-of-ai-built-with-llama/)
- [Meta 官方 SKU 清单](https://github.com/meta-llama/llama-models/blob/main/models/sku_list.py)

[← 返回 Llama 家族](../llama.md) · [模型家族索引](../../5.3-模型家族.md)
