---
title: "3.3.7 · DeepSeek-V3.1: 一套权重,两种模式,Agent 先行"
category: "主流模型"
published: true
excerpt: "V3.1 把 V3 的非思考模式和 R1 的思考模式合进同一套 671B/37B 权重,只靠 chat template 切换.V3.1-Base 在原 V3 底座上追加 840B token 长上下文训练(32K 阶段 630B,128K 阶段 209B),并改用 UE8M0 FP8 scale.没有技术报告;模型卡自报 SWE Verified 从 V3-0324 的 45.4 到 66.0,Terminal-bench 从 13.3 到 31.3."
tags: ["deepseek", "V3.1", "混合思考", "Agent", "长上下文", "UE8M0 FP8", "开放权重"]
---
# 3.3.7 · DeepSeek-V3.1: 一套权重,两种模式,Agent 先行

> 核验日期:2026-09-23.V3.1 于 2025-08-21 发布,没有独立技术报告,材料来自官方发布说明,Hugging Face 模型卡和 API 更新日志.

## 定位

V3.1 做了两件事.第一,把 V3 的非思考模式和 R1 的思考模式合并进同一套权重,API 的 `deepseek-chat` 和 `deepseek-reasoner` 从此指向同一个模型的两种模板.第二,后训练重心从刷推理题转向工具调用和 Agent 任务.

官方给它的口号是「迈向 Agent 时代的第一步」.架构一行没动,结构与 [V3](../deepseek-v3/deepseek-v3.md) 相同.

## 身份卡

| 字段 | 官方口径 |
|---|---|
| 发布 | 2025-08-21 |
| 技术报告 | 无;引用仍指向 V3 报告(arXiv:2412.19437) |
| 总参数 / 激活参数 | 671B / 37B(模型卡下载表);HF 文件合计显示 685B,含 MTP 模块 |
| 层数与结构 | 与 V3 相同:61 层,MLA,256 路由专家 + 1 共享,每 token 选 8 |
| 上下文 | 128K(Base 与 Instruct 同) |
| 模态 | 文本 |
| 继续训练 | 840B token:32K 阶段 630B,128K 阶段 209B |
| 数值格式 | 权重与激活均用 UE8M0 FP8 scale |
| checkpoint | DeepSeek-V3.1-Base,DeepSeek-V3.1 |
| 许可 | 仓库与权重 MIT |

## 长上下文:把 V3 的两段扩展加厚

V3.1-Base 从**原始 V3 底座**出发,不是从 V3-0324 或 R1 出发.扩展方法沿用 V3 报告的两阶段做法:先到 32K,再到 128K.

模型卡给的改动是数据量:收集了更多长文档,32K 阶段扩大 10 倍到 630B token,128K 阶段扩大 3.3 倍到 209B token.按这个倍数反推,V3 原来的两段各约 63B token.

合计 839B,官方口径写作 840B.

这个量不小.V3 预训练是 14.8T,840B 约占 5.7%,全部花在长文本上.同一版本的主打是思考模式和多步 Agent,两者的轨迹都很长;但官方没有说明加训与这两项能力的关系,也没有给消融.

## UE8M0 FP8:为微缩格式对齐 scale

V3 的 FP8 训练用细粒度量化,每个 128×128 权重块和 1×128 激活块各带一个 scale.V3 报告里只有少数激活(注意力后 Linear 的输入,MoE dispatch 前的激活)强制用 2 的整数次幂做 scale.V3.1 把权重和激活的 scale 统一改成 UE8M0.

UE8M0 是无符号,8 位指数,0 位尾数.它只能表示 2 的整数次幂:

$$
x\approx s\cdot q,\qquad s=2^{e},\ e\in\mathbb{Z}
$$

$q$ 是 FP8(E4M3)编码的值,$s$ 是块级 scale.scale 取 2 的幂,乘 scale 就退化为指数加减,不需要真正的乘法.

模型卡的说法是「确保与微缩(microscaling)数据格式兼容」,细节指向 DeepGEMM.MX 系列格式的共享 scale 本身就是 E8M0,V3.1 在训练时就用这种 scale,推理端就能直接对接支持 MX 格式的硬件,不用再做一次 scale 转换.

部署时的硬要求:FP8 权重与激活必须按 UE8M0 scale 格式化;`mlp.gate.e_score_correction_bias` 必须用 FP32 加载和计算.后者是 V3 无辅助损失负载均衡的偏置项,精度不够会改变路由.

FP8 训练本身的机制见 [FP8 混合精度训练](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.2-混合精度训练/02-FP8混合精度训练详解.md).

## 混合思考:模式切换只在模板里

两种模式共用权重,区别只在生成前缀.

| 模式 | 首轮前缀结尾 | API 名(发布时) |
|---|---|---|
| 非思考 | `<｜Assistant｜></think>` | `deepseek-chat` |
| 思考 | `<｜Assistant｜><think>` | `deepseek-reasoner` |

非思考模式比 V3 多了一个 `</think>` token:模型被直接告知思考已经结束.多轮对话时,历史轮次的思考内容被丢弃,只保留 `</think>` 和最终回答,思考与非思考的多轮模板因此一致.

工具的支持不对称:

- **工具调用只在非思考模式下支持**,用 `<｜tool▁calls▁begin｜>` 一类特殊 token 包裹函数名和 JSON 参数;
- **搜索 Agent 是个例外**,官方为思考模式单独设计了搜索工具调用格式,支持多轮搜索.

API 同步加了 Anthropic 接口格式,以及 Beta 版 strict function calling.

**「思考时不能调工具」是 V3.1 最大的产品限制**.它意味着复杂 Agent 任务只能在「想清楚但不能动手」和「能动手但不深想」之间二选一.这个问题要到 [V3.2](../deepseek-v3-2/deepseek-v3-2.md) 的 thinking in tool-use 才解决.

## 关键评测(厂商自报)

| 基准 | V3.1 非思考 | V3-0324 | V3.1 思考 | R1-0528 |
|---|---|---|---|---|
| MMLU-Redux | 91.8 | 90.5 | 93.7 | 93.4 |
| MMLU-Pro | 83.7 | 81.2 | 84.8 | 85.0 |
| GPQA-Diamond | 74.9 | 68.4 | 80.1 | 81.0 |
| HLE(纯文本) | - | - | 15.9 | 17.7 |
| LiveCodeBench (2408-2505) | 56.4 | 43.0 | 74.8 | 73.3 |
| Codeforces-Div1 (Rating) | - | - | 2091 | 1930 |
| Aider-Polyglot | 68.4 | 55.1 | 76.3 | 71.6 |
| AIME 2024 | 66.3 | 59.4 | 93.1 | 91.4 |
| AIME 2025 | 49.8 | 51.3 | 88.4 | 87.5 |
| HMMT 2025 | 33.5 | 29.2 | 84.2 | 79.4 |
| BrowseComp | - | - | 30.0 | 8.9 |
| BrowseComp_zh | - | - | 49.2 | 35.7 |
| HLE(Python + 搜索) | - | - | 29.8 | 24.8 |
| SimpleQA | - | - | 93.4 | 92.3 |
| SWE Verified(Agent 模式) | 66.0 | 45.4 | - | 44.6 |
| SWE-bench Multilingual | 54.5 | 29.3 | - | 30.5 |
| Terminal-bench(Terminus 1) | 31.3 | 13.3 | - | 5.7 |

评测口径:搜索 Agent 用内部框架(商业搜索 API + 网页过滤 + 128K 上下文),R1-0528 的搜索分数用预定义工作流测;SWE-bench 用内部代码 Agent 框架.公告图 2 另有三行模型卡表里没有的搜索分数,都是 V3.1 对 R1-0528:xbench-DeepSearch 71.2 / 55.0,Frames 83.7 / 82.0,Seal0 42.6 / 29.7.公告图 3 给出思考模式的输出 token:AIME 2025 上 V3.1-Think 为 15,889(88.4%),R1-0528 为 22,615(87.5%);GPQA Diamond 为 4,122(80.1%)对 7,678(81.0%);LiveCodeBench 为 13,977(74.8%)对 19,352(73.3%).

两条读法.第一,思考模式在纯推理上与 R1-0528 基本打平,HLE 和 GPQA 还略低;官方宣传的「思考效率更高」指的是更快给出答案,没有公布 token 数.第二,**真正的增量在 Agent 行**:SWE Verified 从 45.4 到 66.0,Terminal-bench 从 13.3 到 31.3,都是非思考模式跑的.

## 与 V3-0324 / R1-0528 的断点

| 维度 | V3-0324 + R1-0528 | V3.1 |
|---|---|---|
| 权重 | 两套 | 一套 |
| 模式切换 | 换模型 | 换 chat template |
| 长上下文训练 | 32K / 128K 各约 63B token | 630B / 209B token |
| FP8 scale | 块级 scale,仅部分激活取 2 的幂 | 权重与激活统一 UE8M0 |
| 思考中调工具 | 不支持 | 仅搜索 Agent 格式 |
| SWE Verified | 45.4(V3-0324) | 66.0 |
| 架构 | V3 | V3(不变) |

## 已知披露缺口

- 没有技术报告,后训练数据,RL 配方与混合思考的训练方式都未公开;
- 840B 继续训练只给了分阶段总量,没有数据构成和学习率;
- 「思考效率更高」没有 token 数或延迟数据;
- 没有非思考与思考模式在同一基准上的完整对照;
- 没有说明改用 UE8M0 对精度的影响.

## 部署与选型

1. 必须使用 V3.1 自己的 tokenizer 与 chat template,V3 模板少了 `</think>` 前缀,会让模型行为错位.
2. 本地推理确认框架支持 UE8M0 scale,并按要求把 `e_score_correction_bias` 放在 FP32.
3. Agent 场景用非思考模式调工具;需要深度搜索时按官方搜索模板走思考模式.两者不要混用模板.
4. V3.1 已被 [V3.1-Terminus](../deepseek-v3-1-terminus/deepseek-v3-1-terminus.md) 取代,Terminus 修了语言混杂.新项目没有理由锁在 V3.1 原版.

V3.1 是 DeepSeek 从「一个任务一个模型」转向「一个模型多种预算」的第一版.它省掉了一套权重的运维,代价是思考和工具被模板硬生生隔开.

## 一手来源

- [官方发布说明(2025-08-21)](https://api-docs.deepseek.com/news/news250821)
- [官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V3.1)
- [V3.1-Base 模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Base)
- [官方 API 更新日志](https://api-docs.deepseek.com/updates/)
- [DeepSeek-V3 技术报告(结构与长上下文方法出处)](https://arxiv.org/abs/2412.19437)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../03-模型家族.md)
