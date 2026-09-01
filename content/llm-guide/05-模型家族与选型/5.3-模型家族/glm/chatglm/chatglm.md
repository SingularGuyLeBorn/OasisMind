---
title: "ChatGLM"
category: "模型家族与选型"
tags: ["chatglm", "chatglm2", "chatglm3", "对话模型"]
published: true
as_of: "2026-09-01"
excerpt: "ChatGLM6B、ChatGLM2-6B 与 ChatGLM3-6B 的代际、上下文和许可边界。"
---

# ChatGLM

## 家族范围

这里的 ChatGLM 指 2023 年起开放的 6B 级对话检查点，不把智谱清言产品、闭源大参数 ChatGLM 服务或 2024 年后的 GLM-4 混为同一个模型。官方家族报告是跨代总结；部署时仍应读取具体仓库的模型卡和许可。

| 代际 | 公开时间 | 关键官方口径 | 上下文口径 |
|---|---:|---|---|
| ChatGLM-6B | 2023-03 | 6.2B，中英双语；约 1T token | 2K |
| ChatGLM2-6B | 2023-06-25 | 6B；约 1.4T 中英 token；MQA | 基础 32K；对话对齐主要按 8K |
| ChatGLM3-6B | 2023-10 | Base、Chat、32K/128K 等检查点；强化工具调用与代码执行示例 | 必须按精确 checkpoint 区分 8K、32K、128K |

`128K` 型号是明确的长上下文变体，不代表所有 ChatGLM3-6B 都有相同窗口。产品端的搜索、代码解释器或工具能力也可能由外部系统提供，不能全部归因于基础权重。

## 架构演进

ChatGLM 使用 GLM 系列的双向上下文与自回归生成思想。ChatGLM2 引入 MQA、旋转位置编码等更新并改进推理效率；ChatGLM3 的重点包括更丰富的对话角色、函数/工具调用格式和 Agent 示例。官方报告给出的家族性总结不能替代每个检查点配置文件。

## 许可与部署

三代权重均使用项目自定义模型许可，仓库代码多为 Apache-2.0。早期许可对商业用途有条件或登记要求，不能概括成 MIT/Apache 权重。部署还需注意 `trust_remote_code`、Transformers 版本、量化精度以及对话模板差异。

## 选型建议

ChatGLM 适合研究中国开放对话模型的早期演进或维护既有部署。新项目若重视现代推理框架、长上下文和许可证清晰度，应与 GLM-4 以后或其他同期开放模型在同一评测协议下实测比较，不能沿用缺少版本与协议的历史榜单结论。

## 一手来源

- [ChatGLM 家族技术报告](https://arxiv.org/abs/2406.12793)
- [ChatGLM-6B 官方仓库](https://github.com/zai-org/ChatGLM-6B)
- [ChatGLM2-6B 官方仓库](https://github.com/zai-org/ChatGLM2-6B)
- [ChatGLM3 官方仓库](https://github.com/zai-org/ChatGLM3)
- [ChatGLM3-6B 模型卡](https://huggingface.co/zai-org/chatglm3-6b)

[← 返回 GLM 模型家族](../glm.md)
