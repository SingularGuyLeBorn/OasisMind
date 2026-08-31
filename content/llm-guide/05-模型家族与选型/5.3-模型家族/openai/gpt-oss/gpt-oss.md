---
title: "gpt-oss：OpenAI 开放权重模型"
category: "模型家族与选型"
tags: ["openai", "gpt-oss", "open-weight", "apache-2.0", "moe"]
published: true
as_of: "2026-09-01"
excerpt: "把 gpt-oss 开放权重线与闭源 GPT/o 系列分开，记录模型规模、上下文和许可。"
---

# gpt-oss：OpenAI 开放权重模型

## 定位

`gpt-oss-120b` 与 `gpt-oss-20b` 是可下载的开放权重模型，采用 Apache 2.0 许可。它们不是 GPT-5 API 的本地版，也不能据此推断闭源 GPT/o 系列的结构。

## 官方模型页披露

| 模型 | 总参数 / 每 token 激活 | 上下文 / 最大输出 | 知识截止 | 推理档位 | 典型定位 |
|---|---:|---:|---|---|---|
| `gpt-oss-120b` | 117B / 5.1B | 131,072 / 131,072 | 2024-06-01 | low、medium、high | 单张 80 GB H100 级别部署的较强版本 |
| `gpt-oss-20b` | 约 21B / 3.6B | 131,072 / 131,072 | 2024-06-01 | low、medium、high | 较低延迟与更小资源占用 |

参数量和“可放入某类 GPU”来自官方模型页，但实际显存还取决于精度、KV cache、批量、上下文和运行时实现。131,072 context 也不等于每个长上下文任务都能保持同等质量。

## 托管边界与安全分支

官方帮助中心明确说明，基础 `gpt-oss` 权重不由 OpenAI API 或 ChatGPT 托管；开发者下载权重后在自己的基础设施或第三方服务运行。开发者文档中的模型页用于记录规格与下载入口，不能据此假定账号获得了 OpenAI 托管调用额度。

`gpt-oss-safeguard-120b` 与 `gpt-oss-safeguard-20b` 是从基础模型后训练得到的安全分类分支：输入自定义策略并对内容作推理分类。它们与通用 `gpt-oss` 共享尺寸命名，但任务身份、评测和部署责任不同。

## 开放与安全边界

- Apache 2.0 允许广泛使用和修改；部署者仍需核对依赖许可、适用法律和自己的内容/安全责任。
- 权重可见不等于训练数据完全公开。官方模型卡提醒，可见 CoT 可能包含幻觉、有害内容或不符合标准安全策略的语言；它可以作为调试和监测信号，但不应直接当作无误的事实记录展示给用户。
- 本地部署应固定 checkpoint 哈希、推理模板、量化方法与采样配置，并在自己的工具权限和威胁模型下复测。

## 一手来源

- [`gpt-oss-120b` 模型页](https://developers.openai.com/api/docs/models/gpt-oss-120b)
- [`gpt-oss-20b` 模型页](https://developers.openai.com/api/docs/models/gpt-oss-20b)
- [gpt-oss 模型卡](https://openai.com/index/gpt-oss-model-card/)
- [gpt-oss-safeguard 技术报告](https://openai.com/index/gpt-oss-safeguard-technical-report/)
- [OpenAI 开放权重模型帮助说明](https://help.openai.com/en/articles/11870455-openai-open-weight-models)
- [全部模型目录](https://developers.openai.com/api/docs/models/all)

[← 返回 OpenAI 家族](../openai.md)
