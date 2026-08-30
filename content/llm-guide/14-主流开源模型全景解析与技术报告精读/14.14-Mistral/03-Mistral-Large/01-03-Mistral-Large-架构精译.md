---
title: "01 · Mistral Large: 剑指 GPT-4 的旗舰闭源模型 架构精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [Mistral-Large, 公开材料精读, function-calling, MoE]
---

# Mistral Large: 剑指 GPT-4 的旗舰闭源模型

>  **[返回 14.14-Mistral 家族总览](../../14.14-Mistral.md)** · 已有长 D5：[企业级 MoE 与长上下文](./05-Mistral-Large-企业级MoE架构与多语言长上下文优化.md)（勿平行第三份）· 开源前代：[Mixtral D2](../02-Mixtral-8x7B/01-02-Mixtral-8x7B-架构精译.md) · [7.4 Function Calling](../../../7-LLM应用开发/7.4-FunctionCalling/7.4-FunctionCalling.md) · [9.4 PD 分离](../../../9-AI工程化与基础设施/9.4-推理服务框架/9.4-推理服务框架.md)

> 该家族依靠其独特的算力优势与数据护城河，在 LLM 红海中占据了核心生态位。

**材料类型（2026-08）**：**公开材料精读**。本目录空壳标题写「架构精译」，但 **Mistral Large 24.02 没有公开成 Mixtral 那种 Table 1 技术报告**。禁止假装有全文翻译。下面只写官方博文 / 文档里能核对的面；积木公式仍链 Mixtral / 第 2 章。上面两行 2025 占位原文保留。

官方轴：

| 代 | 官方名 / API | 日期 | 一手 |
|----|--------------|------|------|
| Large 1 | `mistral-large-2402` | 2024-02-26 | [Au Large](https://mistral.ai/news/mistral-large/) |
| Large 2 | `mistral-large-2407`，123B | 2024-07-24 | [Large Enough](https://mistral.ai/news/mistral-large-2407/) |
| Large 3 | `mistral-large-2512`，41B 活跃 / 675B 总 | 2025-12-02 | [Introducing Mistral 3](https://mistral.ai/news/mistral-3/)；文档 [256k](https://docs.mistral.ai/models/mistral-large-3-25-12) |

B 档：同日发布的 Mistral Small（`mistral-small-2402`）是延迟/成本 SKU，**不新开空目录**。

## 1. Large 1（24.02）：产品面，不是层配置

2024-02-26 博文把 Mistral Large 定位成「当时 API 上能买到的第二档」（他们自己相对 GPT-4 的说法）。公开能力只有这些：

- **32k** 上下文，从长文档里召回。
- 英语、法语、西语、德语、意大利语「原生流利」。
- **Function calling** + 平台上的 **constrained / JSON 输出**（只开在 small 与 large 端点）。
- 指令跟随用来做 le Chat 的系统级审核策略。
- 渠道：la Plateforme（欧洲托管）、Azure 首发分销、可谈权重自部署。

**没公开：** 参数量、是不是 MoE、优化器、数据配比、训练框架、稳定性事故。旧 D5 把初代写成「Dense、参数未公开」——Dense 这一格 **官方博文没有这句话**。2026-08 标 `[OM-FREEPLAY]`：初代架构形态未找到一手来源，不要用「后来 Large 2 是 123B Dense」反推 24.02。

基准全在博文图里。本篇 **不把图上的柱高估成数字**，也不把那些图存进本库（官网素材）。对照请打开原博文 Figure 1–4。

Function calling 的协议本体在 [7.4](../../../7-LLM应用开发/7.4-FunctionCalling/7.4-FunctionCalling.md)。这次发布的贡献是：**把工具调用做成旗舰 API 的一等能力**，不是新发明一种门控。

## 2. Large 2（24.07）：终于有一个参数数字

2024-07-24 博文第一次写出体量：**123 billion parameters**，为 **单节点** 高吞吐、长上下文设计。上下文 **128k**。许可证：Mistral Research License（研究/非商用可改）；商用自部署要 Commercial License。Instruct 权重点名上 Hugging Face。API 名 `mistral-large-2407`。

能核对的训练/能力句子（仍不是 Table 1）：

- 预训练 MMLU **84.0%**（博文明文，不是从图里估的）。
- 「很大比例」代码数据（接 Codestral 经验）；强调少编造、承认不会时说不会。GSM8K / MATH 仍是图，不抄柱高。
- 多语言名单扩到葡、荷、俄、中、日、韩、阿、印地等。
- 工具：并行 **和** 顺序 function call。
- 对齐基准：MT-Bench / WildBench / Arena Hard——同样只在图里。他们额外强调 **短回复**：商业场景里长输出会刷分、也会刷推理账单。

和 Mixtral 的差：Mixtral 用 Top-2 换活跃参数；Large 2 公开选择 **整模 123B 单节点**。博文把这写成 serving 形态，没有再给 MoE 路由公式。旧 D5 §2.1 用「企业 SLA / P99」解释为什么 Dense——那是 2025 推断，不是 24.07 博文原句。读产品决策可以留着，不要标成官方架构表。

## 3. Large 3（25.12）：又回到 MoE，而且开源了

2025-12-02 *Introducing Mistral 3*：Large 3 是 **Mixtral 系列之后 Mistral 的第一个 MoE 旗舰**。官方数字：

| 项 | 官方值 |
|----|--------|
| 活跃 / 总参数 | **41B / 675B** |
| 许可 | Apache 2.0（base + instruct） |
| 预训练硬件 | **3000× H200**（博文） |
| 上下文 | 文档写 **256k** |
| 形态 | 多模态（图像理解） |

旧 D5 表写成「2026.01、总参数未公开」——**日期和参数都错了**。2026-08 按官方页改正；256k 来自 [docs](https://docs.mistral.ai/models/mistral-large-3-25-12)，不是 24.02 博文。

Infra 面博文写的是合作栈，不是自研论文：NVFP4 检查点 + vLLM，可在 Blackwell NVL72 或单机 8×A100 / 8×H100 上跑；NVIDIA 侧提到 **Blackwell 注意力/MoE kernel、prefill/decode 分离、投机解码**，目标 GB200 NVL72。PD 分离的体系解释见 [9.4](../../../9-AI工程化与基础设施/9.4-推理服务框架/9.4-推理服务框架.md)，不要在本目录再推一遍调度公式。SGLang / TRT-LLM 被点名为 Mistral 3 全家的推理后端之一。

**没有**公开 8 专家还是更多、Top-K、是否 mHC。不要把 Mixtral 的 $n=8,K=2$ 抄到 675B 上。P2 若要按 0.4 拆 Large 3 的新 trick，需要等他们真正放出的技术文档；本 Goal **不为 Large 3 另建空文件夹**（本目录已经是 Large 家族落点）。

Ministral 3（3B/8B/14B dense，含 reasoning）是边缘 SKU 家族，**B 档**，只在总览记一行。

## 4. 0.4 拆面：公开材料填得满的和填不满的

| 面 | 能写到哪 | 空白 |
|----|----------|------|
| 积木 | Large 3 = 稀疏 MoE + 多模态；细节公式没有 | 专家数、门控、视觉塔 |
| 架构 | Large 2 = 123B 单节点；Large 3 = 41B/675B | 层数、头数 |
| 数据 | 「多语言比例高」「代码比例高」定性句 | 配比、token 数 |
| 优化器 | 未写 | — |
| Infra | Azure/Vertex/Bedrock；Large 3：vLLM、NVFP4、PD 分离、NVL72 | 训练并行配置 |
| 稳定性 | 未写训练事故 | — |
| 训推 | Large 3 点名 PD 分离与投机解码 | 他们如何对齐 |

## 5. 失效条件

- 把 24.02 博文图上的 MMLU 柱高写进笔记当精确值。
- 用 Mixtral Table 1 冒充 Large 的层配置。
- 把旧 D5 的「专家级多租户配额」当成官方。那是工程想像，报告里没有。
- 为 Ministral / Small 新建第 14 章空目录。

## 本篇来源

- https://mistral.ai/news/mistral-large/（2024-02-26，本会话读完正文；基准只在图里，未转录柱高）
- https://mistral.ai/news/mistral-large-2407/（123B、128k、MMLU 84.0%）
- https://mistral.ai/news/mistral-3/（41B/675B、3000×H200、Apache 2.0、PD 分离）
- https://docs.mistral.ai/models/mistral-large-3-25-12（256k）
- 本库已有 D5：`05-Mistral-Large-企业级MoE架构与多语言长上下文优化.md`（日期/参数勘误，不造第三份）
