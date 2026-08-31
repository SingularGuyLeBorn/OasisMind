---
title: "Claude 模型家族"
category: "模型家族与选型"
tags: ["claude", "anthropic", "模型家族", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 从早期对话模型、混合推理与 Computer Use 到第五代模型的版本树、选型与证据边界。"
---

# Claude 模型家族

> 核验日期：2026-09-01。Claude 是 Anthropic 通过 Claude.ai、Claude API 及云平台提供的闭源服务，不是开放权重模型。本文把官方规格、官方自测、客户陈述和外部推断严格分开。

## 先读结论

- **当前推荐主线**：Fable 5、Opus 5、Sonnet 5 与 Haiku 4.5。Fable 5 代表最高能力层，Opus 5 面向复杂代理与高难任务，Sonnet 5 强调能力、速度和成本平衡，Haiku 4.5 面向低延迟与高吞吐。
- **当前特殊入口**：Mythos 5 是 Project Glasswing 下的限量模型，并非普通 API 用户可自由选择的公开通用档位。
- **能力形态**：当前模型接受文本与图像输入、生成文本，并可通过 API 工具定义执行工具调用；“Computer Use”是工具协议与代理能力，不是一个独立基础模型架构。
- **推理形态**：Claude 3.7 首次把标准回答与扩展思考统一在同一模型；后续模型逐步加入工具交错思考、自适应思考和 effort 控制。不同版本的参数组合并不通用。
- **架构边界**：Anthropic 没有公开 Claude 产品模型的参数量、层数、注意力实现、训练语料明细或完整训练配方。任何“MoE、稀疏注意力、RoPE 变体、GQA、Meta-Memory”等具体说法，若没有一手材料，只能视为猜测。

## 当前选型

| 模型 | Claude API ID | 官方定位 | 上下文 / 最大输出 | API 基准价（输入 / 输出，每百万 token） | 适合什么 | 关键边界 |
|---|---|---|---:|---:|---|---|
| Fable 5 | `claude-fable-5` | 最高能力层 | 1M / 128K | $10 / $50 | 最高难度研究、编码与代理任务 | 可能拒绝；30 天保留且不支持 ZDR |
| Opus 5 | `claude-opus-5` | 高端通用与代理模型 | 1M / 128K | $5 / $25 | 长任务、复杂代码、工具代理 | 成本高于 Sonnet；批处理能力以文档为准 |
| Sonnet 5 | `claude-sonnet-5` | 平衡型默认主力 | 1M / 128K | $2 / $10 | 大多数生产代理、代码与长文档任务 | 某些旧采样参数或手动 thinking 配置不再兼容 |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | 速度与吞吐 | 200K / 64K | $1 / $5 | 分类、抽取、实时助手、子代理 | 日期 ID 是固定快照；短名是便利别名 |
| Mythos 5 | `claude-mythos-5` | 限量高能力研究线 | 1M / 128K | $10 / $50 | 获准参与 Glasswing 的高风险研究 | 邀请制；30 天保留且不支持 ZDR |

价格、可用区、速率限制、缓存和批处理折扣会变化，采购时应回到[官方定价页](https://platform.claude.com/docs/en/about-claude/pricing)与模型页核对。这里的上下文是“输入与输出合计的上下文窗口”，不等于可全部用于输入。

“推荐主线”不是当前全部可调用型号清单。截至核验日，官方弃用表仍把 Opus 4.5/4.6/4.7/4.8、Sonnet 4.5/4.6 列为 Active；与此同时，Claude 4/4.1 与 3.x 多数快照已经退役。维护存量系统时应以[模型弃用与退役表](https://platform.claude.com/docs/en/about-claude/model-deprecations)为准，不以“已有后继”推断“已经停服”。

从 4.6 代开始，`claude-opus-4-6`、`claude-sonnet-4-6`、`claude-opus-4-7`、`claude-opus-4-8` 以及第五代的无日期 ID 都是固定模型版本，不是会滚动换权重的 evergreen alias。4.6 以前则常同时存在日期快照和便利别名，例如 Opus 4.5 的固定 ID 是 `claude-opus-4-5-20251101`。复现实验与生产变更记录应保存解析后的固定 ID，并对照[模型 ID 与版本规则](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)。

## 版本树

### 早期文本模型

| 发布节点 | 身份变化 | 页面 |
|---|---|---|
| 2023-03-14 | Claude 与 Claude Instant 面向合作伙伴发布 | [Claude 1](./claude-1/claude-1.md) |
| 2023-07-11 | Claude 2 改进编码、推理与安全，100K 上下文 | [Claude 2](./claude-2/claude-2.md) |
| 2023-08-09 | 早期低成本支线升级 | [Claude Instant 1.2](./claude-instant-1-2/claude-instant-1-2.md) |
| 2023-11-21 | Claude 2.1 提升到 200K，并加入工具使用测试能力 | [Claude 2.1](./claude-2-1/claude-2-1.md) |

### Claude 3 与 3.5

| 发布节点 | 身份变化 | 页面 |
|---|---|---|
| 2024-03-04 | 首个同时包含 Haiku、Sonnet、Opus 的多模态家族 | [Claude 3 家族](./claude-3/claude-3.md) |
| 2024-03 | 速度优先档 | [Claude 3 Haiku](./claude-3-haiku/claude-3-haiku.md) |
| 2024-03 | 平衡档 | [Claude 3 Sonnet](./claude-3-sonnet/claude-3-sonnet.md) |
| 2024-03 | 能力优先档 | [Claude 3 Opus](./claude-3-opus/claude-3-opus.md) |
| 2024-06-20、2024-10-22 | Sonnet 首发并在十月更新 | [Claude 3.5 Sonnet](./claude-3-5-sonnet/claude-3-5-sonnet.md) |
| 2024-10-22 | 小模型继任者 | [Claude 3.5 Haiku](./claude-3-5-haiku/claude-3-5-haiku.md) |
| 2024-10-22 | 截图、鼠标、键盘式代理工具公开测试 | [Claude Computer Use](./claude-computer-use/claude-computer-use.md) |

### 混合推理与第四代

| 发布节点 | 身份变化 | 页面 |
|---|---|---|
| 2025-02-24 | 首个“标准 + 扩展思考”混合推理模型 | [Claude 3.7 Sonnet](./claude-3-7-sonnet/claude-3-7-sonnet.md) |
| 2025-05-22 | Opus 4 与 Sonnet 4；工具交错思考、并行工具调用 | [Claude 4 家族](./claude-4/claude-4.md) |
| 2025-05-22 | 第四代能力优先档 | [Claude Opus 4](./claude-opus-4/claude-opus-4.md) |
| 2025-05-22 | 第四代平衡档 | [Claude Sonnet 4](./claude-sonnet-4/claude-sonnet-4.md) |
| 2025-08-05 | Opus 4 的增量升级 | [Claude Opus 4.1](./claude-opus-4-1/claude-opus-4-1.md) |
| 2025-09-29 | 编码与代理升级 | [Claude Sonnet 4.5](./claude-sonnet-4-5/claude-sonnet-4-5.md) |
| 2025-10-15 | 低延迟第四代模型 | [Claude Haiku 4.5](./claude-haiku-4-5/claude-haiku-4-5.md) |
| 2025-11-24 | effort、compaction 与高级工具能力 | [Claude Opus 4.5](./claude-opus-4-5/claude-opus-4-5.md) |
| 2026-02-05 | 1M 上下文测试、自适应思考 | [Claude Opus 4.6](./claude-opus-4-6/claude-opus-4-6.md) |
| 2026-02-17 | 平衡档的 1M 上下文与代理升级 | [Claude Sonnet 4.6](./claude-sonnet-4-6/claude-sonnet-4-6.md) |
| 2026-04-07 | Project Glasswing 的受控高能力研究预览 | [Claude Mythos Preview](./claude-mythos-preview/claude-mythos-preview.md) |
| 2026-04-16 | 编码、长任务与高分辨率视觉升级 | [Claude Opus 4.7](./claude-opus-4-7/claude-opus-4-7.md) |
| 2026-05-28 | fast mode 与真实性改进 | [Claude Opus 4.8](./claude-opus-4-8/claude-opus-4-8.md) |

### 第五代

| 发布节点 | 身份变化 | 页面 |
|---|---|---|
| 2026-06-09 | 最高能力公开档；后经历短暂停用与重新部署 | [Claude Fable 5](./claude-fable-5/claude-fable-5.md) |
| 2026-06-09 | Project Glasswing 限量研究模型 | [Claude Mythos 5](./claude-mythos-5/claude-mythos-5.md) |
| 2026-06-30 | 新一代平衡主力，$2 / $10 成为永久价 | [Claude Sonnet 5](./claude-sonnet-5/claude-sonnet-5.md) |
| 2026-07-24 | 新一代高端通用模型 | [Claude Opus 5](./claude-opus-5/claude-opus-5.md) |

## 如何理解能力演进

### 长上下文不是“能塞多少就等于能用多少”

上下文窗口是协议上限。真实质量还受信息位置、文档结构、检索方式、输出预算、缓存策略和工具结果体积影响。比较时应在自己的文档分布上测量召回率、引用正确率、长任务中断率和总成本，而不是只看 200K 或 1M。

### 扩展思考不是完整推理证据日志

Claude 3.7 起，模型可以在回答前使用更多推理 token；后续版本又发展为自适应思考。可见思考或摘要有助于调试，但不应被当作完备、忠实、可审计的内部因果记录。生产系统仍需用外部日志、工具回执、引用和结果验证建立审计链。

### 工具调用不是模型真的“执行了函数”

模型生成结构化工具请求，真正的权限控制、执行、超时、重试和结果回传由应用负责。Computer Use 同样如此：截图和动作接口扩大了攻击面，必须做环境隔离、最小权限、敏感操作确认、提示注入防护与操作留痕。

## 训练与安全：能说到哪里

Anthropic 公开过 Constitutional AI：让模型依据一组原则进行自我批评与修订，并使用 AI 反馈参与训练。2026 年 Anthropic 发布新版 Claude Constitution，并以 CC0 发布**宪法文本本身**。这不意味着 Claude 模型权重以 CC0 或任何开放许可证发布。

公开材料还会给出模型卡、Responsible Scaling Policy 级别和特定安全评测，但不能据此推出未披露的网络结构、参数量、数据来源或完整对齐配方。模型卡中的内部测试也不是对所有语言、行业、代理环境的普遍保证。

## 评测阅读规则

1. 记录模型快照、提示、工具、思考预算、采样参数和日期；同名产品会更新。
2. 把单次回答、pass@1、多次采样、多数投票和代理脚手架结果分开。
3. 把官方自测、第三方复现和客户证言分开。客户“连续运行数小时”是案例，不等于统一 benchmark。
4. Computer Use 需同时测成功率、错误动作率、注入攻击成功率、人工接管率与任务成本。
5. 价格比较应计入输入、输出、缓存、思考 token、工具返回、失败重试和批处理折扣。

## 服务与许可边界

- Claude 模型权重未公开；不存在可自行下载、再训练或离线部署的官方 Claude 权重许可证。
- 使用权来自 Claude 产品条款、Commercial Terms、Usage Policy、API 文档及相应云平台条款；不同入口的地区、数据处理和保留策略可能不同。
- “Claude Constitution 采用 CC0”“某篇研究论文公开”不能推导为“Claude 模型开源”。
- 对监管、隐私、医疗、金融和高风险自动化场景，应单独核查合同、数据地域、人工监督和行业要求。

## 官方证据入口

- [当前模型概览](https://platform.claude.com/docs/en/models/overview)
- [当前 API 定价](https://platform.claude.com/docs/en/about-claude/pricing)
- [模型弃用与退役记录](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- [Introducing Claude](https://www.anthropic.com/news/introducing-claude)
- [Claude 3 family](https://www.anthropic.com/news/claude-3-family)
- [Claude 4](https://www.anthropic.com/news/claude-4)
- [Claude Fable 5 and Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)
- [Claude Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5)
- [Claude Opus 5](https://www.anthropic.com/news/claude-opus-5)
- [Constitutional AI](https://www.anthropic.com/news/constitutional-ai-harmlessness-from-ai-feedback)
- [Claude's new constitution](https://www.anthropic.com/research/claude-new-constitution)

## 迁移说明

旧知识库中的全部 Markdown、PDF、HTML 与图片均按字节和 SHA-256 建账。可靠的一手快照进入隐藏来源区；推测性旧稿、失效网页快照、占位页与重复资产进入隐藏归档区。公开页不再保留“先写推测、末尾再追加纠错”的双重叙事。
