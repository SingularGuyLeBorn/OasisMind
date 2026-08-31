---
title: "DeepSeek-V3.1-Terminus"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "V3.1 的稳定性/Agent 后训练更新，不是 DeepSeek-V3.2，也不存在官方“V3.2-Terminus”身份。"
---

# DeepSeek-V3.1-Terminus

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2025-09-22 |
| 定位 | V3.1 的稳定性/Agent 后训练更新，不是 DeepSeek-V3.2，也不存在官方“V3.2-Terminus”身份。 |
| 参数 | 发布说明未单独复表；官方模型卡指向 V3.1-Base 并称结构与 V3 相同 |
| 上下文 | HF checkpoint config 的 max_position_embeddings 为 163,840；发布说明未单独复表 API 标称窗口 |
| 模态 | 文本 |
| 许可 | 代码与官方权重 MIT |

## 已披露事实

- 官方更新聚焦中英混杂和异常字符减少，以及 Code Agent/Search Agent 能力优化。
- 旧目录把它命名为 V3.2-Terminus 并给出 2025-06 日期，均与官方 2025-09-22 发布身份冲突，已纠正。
- 模型卡披露当前 checkpoint 的 self_attn.o_proj 存在 UE8M0 FP8 scale 已知问题。

## 证据边界

- Terminus 没有独立技术论文；V3 论文只能解释继承架构，不能证明该次后训练细节。
- 厂商表内分数只在其模板、工具集和版本下可比。

## 部署与选型

- 使用精确模型 ID DeepSeek-V3.1-Terminus，并阅读模型卡的 FP8 已知问题。
- 不要让 API 别名替代固定版本回归；生产应锁定模型和模板。

## 一手来源

- [官方发布说明](https://api-docs.deepseek.com/news/news250922/)
- [官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Terminus)
- [官方更新日志](https://api-docs.deepseek.com/updates/)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
