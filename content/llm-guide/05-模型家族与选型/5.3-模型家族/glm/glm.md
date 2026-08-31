---
title: "GLM 模型家族"
category: "模型家族与选型"
tags: ["glm", "chatglm", "zhipu", "z.ai", "模型家族"]
published: true
as_of: "2026-09-01"
excerpt: "从 GLM 预训练范式到 GLM-5.3，区分论文模型、开放权重检查点、API 型号与智谱清言产品。"
---

# GLM 模型家族

> 核验日期：2026-09-01。页面中的“发布”“开放权重”“上下文”和“许可”都指向具体型号；不能把同一家族相邻版本的参数、训练配方或许可证互相继承。

## 先分清四类名字

GLM 最初是清华大学知识工程实验室提出的通用预训练方法；GLM-130B、ChatGLM、GLM-4.x 与 GLM-5.x 是不同代际的模型身份。Zhipu AI、Z.ai 是机构或品牌，智谱清言是面向用户的产品。产品页面中的“GLM”不自动等于存在同名可下载权重；API 路由也不能用来反推参数量。

| 层级 | 例子 | 应核对的证据 |
|---|---|---|
| 预训练方法 | GLM | 论文与研究仓库 |
| 开放检查点 | GLM-130B、GLM-4-9B、GLM-5.2 | 精确模型卡、权重仓库和许可证 |
| 托管/API 型号 | GLM-5-Turbo、GLM-5V-Turbo | 服务文档、模型代码、上下文与输入输出模态 |
| 产品 | 智谱清言、chat.z.ai | 产品条款与当期可选模型，不能替代模型卡 |

## 谱系

| 身份 | 首次公开证据 | 公开形态 | 页面 |
|---|---:|---|---|
| GLM | 2021-03 | 论文与研究代码 | [GLM](./glm/glm.md) |
| GLM-130B | 2022-10 | 130B 双语开放权重，自定义模型许可 | [GLM-130B](./glm-130b/glm-130b.md) |
| ChatGLM | 2023-03 起 | 三代 6B 级开放检查点，自定义许可 | [ChatGLM](./chatglm/chatglm.md) |
| GLM-4 | 2024-01；开放 9B 于 2024-06 | 商业旗舰/API 与开放 9B 两条线 | [GLM-4](./glm-4/glm-4.md) |
| GLM-4-Voice | 2024-10-25 | 开放语音模型组件 | [GLM-4-Voice](./glm-4-voice/glm-4-voice.md) |
| GLM-Z1 | 2025-04-14 | 9B/32B 推理与 32B 沉思检查点，MIT | [GLM-Z1](./glm-z1/glm-z1.md) |
| GLM-4.5 | 2025-07-28 | 355B/A32B 与 106B/A12B，MIT | [GLM-4.5](./glm-4-5/glm-4-5.md) |
| GLM-4.5V | 2025-08-11 | 106B/A12B 多模态，MIT | [GLM-4.5V](./glm-4-5v/glm-4-5v.md) |
| GLM-4.6 | 2025-09-30 | 文本开放权重与 API，MIT | [GLM-4.6](./glm-4-6/glm-4-6.md) |
| GLM-4.6V | 2025-12-08 | 106B 与 9B Flash 多模态，MIT | [GLM-4.6V](./glm-4-6v/glm-4-6v.md) |
| GLM-4.7 | 2025-12-22 | 文本开放权重；另有 30B/A3B Flash | [GLM-4.7](./glm-4-7/glm-4-7.md) |
| GLM-5 | 2026-02-12 | 744B/A40B 开放权重，MIT | [GLM-5](./glm-5/glm-5.md) |
| GLM-5-Turbo | 2026-03-15 | 文本 API 型号；参数与权重未公开 | [GLM-5-Turbo](./glm-5-turbo/glm-5-turbo.md) |
| GLM-5V-Turbo | 2026-04-01 | 多模态 API 型号；参数与权重未公开 | [GLM-5V-Turbo](./glm-5v-turbo/glm-5v-turbo.md) |
| GLM-5.1 | 2026-04-07 | 文本开放权重与 API，MIT | [GLM-5.1](./glm-5-1/glm-5-1.md) |
| GLM-5.2 | 2026-06-16 | 1M 文本开放权重与 API，MIT | [GLM-5.2](./glm-5-2/glm-5-2.md) |
| GLM-5.3 | API 2026-08-18；权重 2026-08-28 | 文本开放权重，自定义 GLM-5.3 License | [GLM-5.3](./glm-5-3/glm-5-3.md) |
| GLM-5.3-Flash | 服务 2026-08-26 | 320B/A18B 原生多模态开放权重，MIT | [GLM-5.3-Flash](./glm-5-3-flash/glm-5-3-flash.md) |

## 选型原则

1. 私有化部署先按精确模型仓库核对许可、权重大小、推理框架和显存；“开源家族”不是统一许可。
2. 文本编码/智能体与视觉 GUI/文档任务分开选。`V` 或原生多模态型号可以接收视觉输入，纯文本型号不能因产品端支持上传文件就被写成 VLM。
3. 上下文表述区分原生训练窗口、YaRN 等扩展配置、API 上限和最大输出；四者不是同一指标。
4. 官方 benchmark 是指定框架、工具、采样和预算下的自报结果。选型时重跑自己的任务集，并记录失败率、延迟、成本与许可证约束。

## 一手入口

- [GLM 研究仓库](https://github.com/THUDM/GLM)
- [Z.ai 官方 GitHub 组织](https://github.com/zai-org)
- [Z.ai 官方 Hugging Face 组织](https://huggingface.co/zai-org)
- [Z.ai 模型发布记录](https://docs.z.ai/release-notes/new-released)
- [ChatGLM 家族技术报告](https://arxiv.org/abs/2406.12793)
- [GLM-4.5 技术报告](https://arxiv.org/abs/2508.06471)
- [GLM-5 技术报告](https://arxiv.org/abs/2602.15763)

[← 返回模型家族索引](../5.3-模型家族.md)
