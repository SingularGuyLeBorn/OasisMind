---
title: "DeepSeek-V3.1"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "在 V3 架构上增加长上下文继续训练、混合思考模式和工具/Agent 后训练的版本。"
---

# DeepSeek-V3.1

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2025-08-21 |
| 定位 | 在 V3 架构上增加长上下文继续训练、混合思考模式和工具/Agent 后训练的版本。 |
| 参数 | 671B 总参数 / 37B 激活（官方下载表）；HF 文件合计界面可能显示 685B |
| 上下文 | 128K |
| 模态 | 文本 |
| 许可 | 代码与官方权重 MIT |

## 已披露事实

- 同一检查点通过不同 chat template 支持 thinking 与 non-thinking。
- 官方模型卡披露 32K 延伸阶段 630B token、128K 延伸阶段 209B token。
- 官方 API 发布时 deepseek-chat 与 deepseek-reasoner 分别映射同一版本的非思考/思考模式。

## 证据边界

- V3.1 没有独立新架构论文；模型卡仍引用 V3 技术报告。
- 工具调用格式随模板与 API 变化，不能只复制旧字符串到当前服务。

## 部署与选型

- 必须使用 V3.1 tokenizer/chat template，并按官方要求处理 UE8M0 FP8 与特定 bias 精度。
- 模型标称 128K 不等于任意硬件都能以可接受延迟跑满。

## 一手来源

- [官方发布说明](https://api-docs.deepseek.com/news/news250821/)
- [官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V3.1)
- [官方更新日志](https://api-docs.deepseek.com/updates/)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
