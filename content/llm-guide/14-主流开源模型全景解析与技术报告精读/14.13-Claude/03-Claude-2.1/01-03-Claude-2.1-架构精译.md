---
title: "01 · Claude 2.1: 幻觉抑制与 200K 窗口扩展 - 技术报告反向工程"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-2.1, 长上下文, tool-use, 公开材料精读]
---

# Claude 2.1: 幻觉抑制与 200K 窗口扩展 - 架构还原与精译

>  **[返回 14.13-Claude 家族总览](../../14.13-Claude.md)** · 前代：[Claude 2 D2](../02-Claude-2/01-02-Claude-2-架构精译.md) · 已有长 D5：[05-03 核心技术专题](./05-03-Claude-2.1-核心技术专题.md)（勿平行第三份）· 工具调用本体：[7.4 Function Calling](../../../7-LLM应用开发/7.4-FunctionCalling/7.4-FunctionCalling.md)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**材料类型（2026-08）**：**公开材料精读**。没有架构 PDF。上面「解析」原文保留。轴心：[Introducing Claude 2.1](https://www.anthropic.com/news/claude-2-1)（2023-11-21）。

## 1. 相对 Claude 2.0 改了什么

博文列了四件企业向能力，外加调价（调价数字博文没写具体 $/M，本篇不编）：

1. **200K** token 上下文（他们写 industry-leading；约 150,000 words / 500+ pages）。claude.ai 上 **200K 窗口留给 Claude Pro**；API / Console 与 chat 都上了 2.1。
2. 相对 Claude **2.0**，虚假陈述 **降低 2x**（2x decrease in false statements）。
3. **System prompts**：给人格、角色、稳定输出结构。
4. **Tool use beta**：开发者定义工具，模型选工具并执行（计算器、把自然语言变成 API 调用、检索私有库、连产品数据）。当时写 early development。

200K 处理「可能要几分钟」，他们预期延迟会降。这是 **训推/serving** 面的一句产品诚实声明，没有 kernel 或 PD 分离细节。

## 2. 诚实性评测怎么做的（博文口径，不是第三方基准）

他们自建一套「复杂事实问题」，用一条 rubric 区分：

- 错误断言（例句：玻利维亚第五大城市是 Montero）
- 承认不确定（例句：我不确定第五大城市是哪）

2.1 更常 **demur** 而不是编一个答案。长文档理解/摘要：错误答案 **减少 30%**；「误以为文档支持某主张」的比率 **低 3–4 倍**。这些都是 Anthropic 内部评测，**没有**公开题目集或与 MMLU 对齐的表。不要把 30% / 3–4x 写成开源榜。

## 3. 0.4 拆面

| 面 | 能写到哪 | 空白 |
|----|----------|------|
| 积木 | 无新注意力 | — |
| 架构 | 无 | 参数量 |
| 数据 | 未写 | — |
| 优化器 | 未写 | — |
| Infra | 200K 延迟以分钟计（产品句） | 怎么切序列、怎么 cache |
| 稳定性 | 幻觉内部评测 | 训练 loss |
| 训推 | tool use 是推理时调外部 API，和训练时是否用工具 **未对齐说明** | 工具 schema |
| 后训练 | system prompt 是 serving/API 面；是否改 CAI 未写 | — |

工具调用的协议与 JSON 约束见 [7.4](../../../7-LLM应用开发/7.4-FunctionCalling/7.4-FunctionCalling.md)。2.1 的贡献是 **把 tool use 做成 Claude API 的 beta**，不是新发明一种门控。

## 4. 失效条件

- 把 200K 写成「词」而不是 token（博文写 tokens ≈ 150k words）。
- 把内部 2x / 30% / 3–4x 抄进第 3 章评测总表当公开榜。
- 为 Pro 档 200K 另建空目录。

## 本篇来源

- https://www.anthropic.com/news/claude-2-1（2023-11-21，本会话读完正文）
- 前代：https://www.anthropic.com/news/claude-2
- 同目录已有 D5：`05-03-Claude-2.1-核心技术专题.md`
- `7.4-FunctionCalling.md`
