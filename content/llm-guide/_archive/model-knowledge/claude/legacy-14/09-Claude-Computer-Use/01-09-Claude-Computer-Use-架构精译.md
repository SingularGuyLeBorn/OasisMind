---
title: "01 · Claude Computer Use：截图进、键鼠出，公测不是新注意力"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude, Computer-Use, 公开材料精读, OSWorld]
---

# Claude Computer Use：截图进、键鼠出

>  **[返回 14.13-Claude 家族总览](../14.13-Claude.md)** · 能力挂在：[3.5 Sonnet 升级版](../07-Claude-3.5-Sonnet/01-07-Claude-3.5-Sonnet-架构精译.md) · 已有长 D5：[05-09 GUI Agent](./05-09-Claude-Computer-Use-视觉感知驱动的GUI自动化Agent.md)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**公开材料精读**。上面「解析」原文保留。Computer Use 是 **API 能力**，不是新一层注意力。2024-10-22 随升级版 Claude 3.5 Sonnet 公测；官方自己写：实验性、有时笨、容易错。

| 源 | 钉死什么 |
|----|----------|
| [3.5 models and computer use](https://www.anthropic.com/news/3-5-models-and-computer-use) | 看屏幕、移光标、点按钮、打字；OSWorld 截图-only **14.9%**，加步数 **22.0%**；次席 7.8% |
| [October Addendum](https://www-cdn.anthropic.com/c7822cdc35ad788ec87e14b3a9d45010f1f86c38.pdf) §2.1 Table 1 | 15 step **14.9%**（95% CI 11.3–18.5）；50 step **22%**（17.8–26.2）；人类 72.36%；只喂截图 |
| 同博文 | 滚动、拖拽、缩放现在仍难；鼓励先拿低风险任务试；新分类器识别「正在用 computer use」以及是否造成伤害 |

## 1. 它实际暴露给开发者的是什么

不是「越狱出沙盒去控真机」的架构论文。官方路径：开发者接一条 API，把指令（例如「用电脑上的数据和网上的信息填这张表」）翻成键鼠命令（开浏览器、挪光标、填表）。点名已在试的客户：Asana、Canva、Cognition、DoorDash、Replit、The Browser Company。Replit 用来在 Agent 产品里评估正在构建的应用。

可用面：Anthropic API、Amazon Bedrock、Google Cloud Vertex AI。挂在 **升级版 3.5 Sonnet** 上，不是 3.5 Haiku。

## 2. OSWorld 数字（只抄表，不估图）

评测设定：只给截图，不用 accessibility tree 文本。标准 15 步 overall **14.9%**；把允许步数加到 50 得到 **22%**。人类 72.36%。分域（Table 1）：OS 54.2%、Office 7.7%、Daily 16.7%、Professional 24.5%、Workflow 7.9%（均为 15 步点估计）。加步数后 Office / Daily / Professional 上升，OS 域点估计从 54.2% 降到 41.7%——addendum 原表如此，不要圆成「全面变好」。

安全：Computer Use 能力本身按 **ASL-2** 分类。另有一篇「developing computer use」研究博文（全家博文链过去）；本篇以 10-22 页和 addendum 为准，没把那篇研究博文当第三份架构源。

## 3. 失效条件

- 写成新注意力 / 新 MoE。
- 把 14.9% 和 22.0% 合成一个 OSWorld 分数。
- 说 Haiku 也能 Computer Use。
- 把客户名单当成基准表。

## 参考文献

- https://www.anthropic.com/news/3-5-models-and-computer-use
- https://www-cdn.anthropic.com/c7822cdc35ad788ec87e14b3a9d45010f1f86c38.pdf §2.1
- 同目录长 D5（工程叙事，不当事第一手表）
