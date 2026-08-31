---
title: Anthropic《When AI Builds Itself》：AI 正在加速 AI 自身的开发
category: Anthropic
published: false
excerpt: >-
  Anthropic Institute 首篇公开报告（Favaro & Clark）：Claude 写了 Anthropic 80%+
  生产代码、Mythos 实验 52 倍训练加速、自主任务时长约 4 个月翻倍；剩余瓶颈是「目标选择与判断力」而非执行；Jack Clark 预测 2028
  年底前 RSI 概率 60%。
tags:
  - RSI
  - Anthropic
  - Jack Clark
  - When AI Builds Itself
  - Mythos
  - 自举
---
# Anthropic《When AI Builds Itself》：AI 正在加速 AI 自身的开发

> 由原始调研笔记重建（2026-08-12）。原文：https://www.anthropic.com/institute/recursive-self-improvement（Anthropic Institute 首篇公开报告，2026-06-04，Marina Favaro 与 Jack Clark 合著）。

## 核心论点

**AI 正在加速 AI 自身的开发，RSI 可能比大多数机构预期的更早到来。** 原文：「We are not there yet, and recursive self-improvement is not inevitable. But it could come sooner than most institutions are prepared for.」

## 论证结构（四段式）

1. **定义与立场**：RSI = AI 系统能够完全自主地设计并开发自己的继任者。
2. **外部证据**：可观测的模型能力加速度（任务时长、SWE-bench、CORE-Bench、METR）。
3. **内部证据**：Anthropic 首次披露内部数据，展示 AI 已在多大程度上加速前沿模型的工程与研究。
4. **缺口分析 + 预测**：人类与全自动 RSI 之间只剩「目标选择与判断力」这一差距，执行层已接近/超越人类。

## 披露的关键数据

**外部证据（任务时长）**：AI 能可靠自主完成的任务时长「大约每 4 个月翻一番」（此前是每 7 个月）。时间线：2024-03 Claude Opus 3 约 4 分钟 → 2025-03 Claude Sonnet 3.7 约 1.5 小时 → 2026-03 Claude Opus 4.6 约 12 小时。

**公开基准饱和**：SWE-bench 两年内从低个位数得分到饱和；CORE-Bench（复现已发表论文）2024 年约 20% 成功率，15 个月后饱和；METR 长时任务基准发现 Claude Mythos Preview 可连续工作至 12-16 小时，「处于 METR 不新增任务就无法测量的上限」。

**代码产出（内部）**：截至 2026-05，Anthropic 合入代码库的代码 **约 80% 由 Claude 撰写**（Claude Code 2025-02 研究预览前仅为低个位数）。每工程师日均合入代码量 2026 Q2 约为 2024 年的 **8 倍**（原文自注：行数是数量而非质量的粗糙指标，8x 几乎肯定高估真实生产力增益）。2026-03 对 130 名研究员工问卷：中位数自估用 Mythos Preview 产出约为无 AI 时的 **4 倍**。案例：Claude 一次性交付 800+ 修复，把某个 API 错误率降低 1000 倍，监督工程师估计人类完成需 4 年。

**开放式任务与代码质量**：最开放式任务中 Claude 成功率 2026-05 达 **76%**，4 个月提升 50 个百分点。案例：例行升级致数万训练任务崩溃，工程师仅给 Claude 少量文本与集群访问权限，用 2 小时定位并复现 obscure 调试标志（人类通常需 2-3 天）。员工共识：2025 年底 Claude 写的代码仍略差于人类，今天大致持平，一年内将严格优于人类。

**训练加速（Mythos 52x，核心数字）**：标准测试——给 Claude 一段训练小模型的代码，要求通过相同正确性检查前提下尽可能加速。2025-05 Claude Opus 4 约 3x；2026-04 Claude Mythos Preview 达约 **52x**。校准：**熟练人类研究员需 4-8 小时才能达到 4x**。原文评价：「Claude 在不到一年里从超级有用变成了超人。」

## 判断力缺口（本文核心论点）

Claude 在执行「规格良好的实验」上已能匹配/超越熟练人类，但在「选择目标」（决定做什么、什么值得做）上仍有大差距——这正是 AI 与「能自主设计继任者」之间的最后瓶颈。关键引文：「如果人类把大部分时间花在方向设定这一小部分上，其余执行交给 Claude，每个工程师/研究员正在驾驭的工作量就会远超从前」——即复合加速的机制。

## RSI 预测

- Jack Clark 明确预测：**2028 年底前「更可能而非不然」出现能自主「做一个更好的自己」的 AI 系统**。媒体概括为「60% 概率 2028 年前实现 RSI」。
- 文章不回避风险：承认对齐技术可能在 RSI 下失效，强调公开数据、外部审阅与社会协同治理；宣布将组织政策、研究者、民间社会与 AI 公司的多方对话。

## 备注

- 数据来自搜索引用的原文长摘要多源交叉验证（VentureBeat、Kingy AI、MindStudio、claudeapi.com 等）；原文页面需 JS 渲染未完整抓取。
- 关联：库内《Anthropic Automated W2S Researcher》《RSI 行业动态速览》互为参照；Jack Clark 预测与 OpenAI 时间表（2028-03 全自动研究员）互相印证，「2026-2028 是窗口期」。
