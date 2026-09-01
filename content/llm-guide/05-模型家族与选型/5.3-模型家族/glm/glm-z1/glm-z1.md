---
title: "GLM-Z1"
category: "模型家族与选型"
tags: ["glm-z1", "推理模型", "glm-4-0414"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-Z1-0414 推理与沉思检查点的训练关系、上下文和工具边界。"
---

# GLM-Z1

## 身份与型号

2025 年 4 月 14 日发布的 GLM-4-0414 系列同时包含普通对话和 Z1 推理检查点。GLM-Z1 不是 GLM-5 的前身编号，也不是一个参数量固定的单模型。

| 精确型号 | 规模 | 定位 | 上下文口径 |
|---|---:|---|---|
| GLM-Z1-9B-0414 | 9B | 轻量推理 | 原生 32K，可配置 YaRN 到 128K |
| GLM-Z1-32B-0414 | 32B | 数学、代码、逻辑推理 | 原生 32K，可配置 YaRN 到 128K |
| GLM-Z1-Rumination-32B-0414 | 32B | 带检索工具的开放式“沉思”任务 | 128K |

官方仓库称 32B Z1 从 GLM-4-32B-0414 经冷启动、扩展强化学习以及数学/代码/逻辑训练得到，并加入基于成对排序反馈的通用强化学习。Rumination 版本用可验证答案或 rubric 评分，并在推理过程中使用固定搜索工具。

## 上下文不是一个数字

多数 0414 检查点原生训练窗口为 32K。官方建议超出时启用 YaRN；Z1 在输入超过 8,192 token 时尤其应考虑该配置。配置可接受 128K 不代表 128K 下的召回、推理和延迟与 32K 相同，必须单独评测。

## 工具与提示词限制

普通 GLM-Z1 可通过对话模板传入工具。Rumination 版本不支持任意 system prompt 或自定义工具；模板绑定 `search`、`click`、`open`、`finish` 四类工具，并需要外部搜索/检索 API，因此不能将其描述为“模型内置联网”。

## 许可

GLM-Z1-0414 的官方 Hugging Face 模型卡标注 MIT；GLM-4 仓库代码为 Apache-2.0。它与 2024 年 GLM-4-9B 的自定义权重许可并不相同，这正是许可必须按精确 checkpoint 核对的例子。部署前还要读取对应模型仓库的 `LICENSE`、YaRN 配置和模板限制。

## 一手来源

- [GLM-4-0414 官方仓库与型号表](https://github.com/zai-org/GLM-4)
- [GLM-Z1-32B-0414 模型卡](https://huggingface.co/zai-org/GLM-Z1-32B-0414)
- [GLM-Z1-Rumination-32B-0414 模型卡](https://huggingface.co/zai-org/GLM-Z1-Rumination-32B-0414)

[← 返回 GLM 模型家族](../glm.md)
