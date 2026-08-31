---
title: "DeepSeek-Coder"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "面向代码生成、补全与仓库级代码语料研究的首代专用系列。"
---

# DeepSeek-Coder

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2024-01-25（论文 v1） |
| 定位 | 面向代码生成、补全与仓库级代码语料研究的首代专用系列。 |
| 参数 | 1.3B–33B，多尺寸 Dense 模型 |
| 上下文 | 16K |
| 模态 | 文本/代码 |
| 许可 | 代码仓库 MIT；权重受 DeepSeek Model License 约束，模型卡声明支持商用 |

## 已披露事实

- 从头在 2T token 上训练，论文列出 1.3B 到 33B 多个尺寸。
- 训练组合包含项目级代码语料与 fill-in-the-blank 目标；论文披露 16K 窗口。
- 不要把单一 33B Instruct 检查点的行为外推到所有尺寸、Base 或 Instruct 变体。

## 证据边界

- 论文基准是当时的报告结果，不等于 2026 年生产代码代理能力。
- 首代 Coder 的权重许可不是 MIT；MIT 只覆盖代码仓库。

## 部署与选型

- 小尺寸适合教学与资源受限实验；33B 仍需按实际精度测显存。
- 代码补全要核对 FIM 模板、终止符与仓库上下文切分。

## 一手来源

- [论文（arXiv:2401.14196）](https://arxiv.org/abs/2401.14196)
- [官方模型卡（33B Instruct）](https://huggingface.co/deepseek-ai/deepseek-coder-33b-instruct)
- [官方仓库](https://github.com/deepseek-ai/deepseek-coder)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
