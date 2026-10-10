---
title: "Kimi K2.5 · 对照译稿"
category: "模型库"
tags: ["Kimi", "对照译稿"]
published: true
excerpt: "Kimi K2.5 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 31 -->

arXiv: 2602.02276v2 [cs. CL] 7 Aug 2026

# KIMI K2.5: VISUAL AGENTIC INTELLIGENCE

TECHNICAL REPORT OF KIMI K2.5

**Kimi Team**



# KIMI K2.5: 视觉智能体智能 Kimi K2.5 技术报告

**Kimi Team**

## ABSTRACT

We introduce Kimi K2.5, an open-source multimodal agentic model designed to advance general agentic intelligence. K2.5 emphasizes the joint optimization of text and vision so that two modalities enhance each other. This includes a series of techniques such as joint text-vision pre-training, zero-vision SFT, and joint text-vision reinforcement learning. Building on this multimodal foundation, K2.5 introduces Agent Swarm, a self-directed parallel agent orchestration framework that dynamically decomposes complex tasks into heterogeneous sub-problems and executes them concurrently. Extensive evaluations show that Kimi K2.5 achieves state-of-the-art results across various domains including coding, vision, reasoning, and agentic tasks. Agent Swarm also reduces latency by up to 4.5× over single-agent baselines. We release the post-trained Kimi K2.5 model checkpoint to facilitate future research and real-world applications of agentic intelligence.



我们介绍 Kimi K2.5: 面向推进通用智能体智能的开源多模态智能体模型. K2.5 强调文本与视觉的联合优化, 使两种模态彼此增强, 技术包括联合文本–视觉预训练, 零视觉 SFT, 以及联合文本–视觉强化学习. 在此多模态底座上, K2.5 提出 Agent Swarm: 一种自导向的并行智能体编排框架, 能把复杂任务动态拆成异构子问题并并发执行. 大量评测显示 Kimi K2.5 在编码, 视觉, 推理与智能体任务等多域达到领先结果; Agent Swarm 相对单智能体基线最高可把延迟降到约 4.5×. 我们开源后训练的 Kimi K2.5 权重, 方便后续研究与落地.

(「zero-vision SFT」: 后训练阶段只用纯文本监督微调来「激活」视觉推理与工具使用, 不在此阶段喂人工设计的视觉轨迹; 见源文 §2.2.)

(「Agent Swarm」: 可训练编排器动态创建冻结子智能体, 并行调度子任务的框架; 见源文 §3.)

Gemini 3 Pro

![Chart block](images/p01-figure-1-kimi-k2-5-main-results.png)

Figure 1: Kimi K2.5 main results.



图 1: Kimi K2.5 主要结果.

## 1 Introduction

Large Language Models (LLMs) are rapidly evolving toward agentic intelligence. Recent advances, such as GPT-5.2 [41], Claude Opus 4.5 [6], Gemini 3 Pro [20], and Kimi K2-Thinking [1], demonstrate substantial progress in agentic capabilities, particularly in tool calling and reasoning. These models increasingly exhibit the ability to decompose complex problems into multi-step plans and to execute long sequences of interleaved reasoning and actions.



大语言模型正快速走向智能体智能. 近期如 GPT-5.2 [41], Claude Opus 4.5 [6], Gemini 3 Pro [20] 与 Kimi K2-Thinking [1] 等, 在工具调用与推理等智能体能力上进展明显: 更常把复杂问题拆成多步计划, 并执行长串交错的推理与动作.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>1</sup>[https://huggingface. co/moonshotai/Kimi-K2.5](https://huggingface. co/moonshotai/Kimi-K2.5)</span></small>

<!-- page 2 of 31 -->

Kimi K2.5

TECHNICAL REPORT

In this report, we introduce the training methods and evaluation results of Kimi K2.5. Concretely, we improve the training of K2.5 over previous models in the following two key aspects.



本报告介绍 Kimi K2.5 的训练方法与评测结果. 相对此前模型, 训练改进集中在以下两方面.

**Joint Optimization of Text and Vision.** A key insight from the practice of K2.5 is that joint optimization of text and vision enhances both modalities and avoids the conflict. Specifically, we devise a set of techniques for this purpose. During pre-training, in contrast to conventional approaches that add visual tokens to a text backbone at a late stage [8, 21], we find early vision fusion with lower ratios tends to yield better results given the fixed total vision-text tokens. Therefore, K2.5 mixes text and vision tokens with a constant ratio throughout the entire training process.



**文本与视觉的联合优化.** K2.5 实践中的关键洞察是: 联合优化会同时增强两种模态并避免冲突. 预训练上, 常规做法往往在后期才把视觉 token 接到文本骨干 [8, 21]; 在固定总视觉–文本 token 预算下, 他们发现「早期融合 + 较低视觉比例」往往更好. 因此 K2.5 在全程训练中按恒定比例混合文本与视觉 token.

Architecturally, Kimi K2.5 employs MoonViT-3D, a native-resolution vision encoder incorporating the NaViT packing strategy [15], enabling variable-resolution image inputs. For video understanding, we introduce a lightweight 3D ViT compression mechanism: consecutive frames are grouped in fours, processed through the shared MoonViT encoder, and temporally averaged at the patch level. This design allows Kimi K2.5 to process videos up to 4 × longer within the same context window while maintaining complete weight sharing between image and video encoders.



架构上, Kimi K2.5 使用 MoonViT-3D: 原生分辨率视觉编码器, 并采用 NaViT packing [15], 支持可变分辨率图像输入. 视频理解引入轻量 3D ViT 压缩: 连续帧每 4 帧一组, 经共享 MoonViT 编码, 再在 patch 级做时间平均. 同一上下文窗口内视频最长可处理约 4×, 且图像与视频编码器完全权重共享.

(「NaViT packing」: 把不同分辨率图像切成 patch, 展平后拼成 1D 序列一起训, 见 Dehghani 等 Patch n’ Pack.)

During post-training, we introduce zero-vision SFT-text-only SFT alone activates visual reasoning and tool use. We find that adding human-designed visual trajectories at this stage hurts generalization. In contrast, text-only SFT performs better-likely because joint pretraining already establishes strong vision-text alignment, enabling capabilities to generalize naturally across modalities. We then apply joint RL on both text and vision tasks. Crucially, we find visual RL enhances textual performance rather than degrading it, with improvements on MMLU-Pro and GPQA-Diamond. This bidirectional enhancement-text bootstraps vision, vision refines text-represents superior cross-modal alignment in joint training.



后训练引入零视觉 SFT: 仅靠纯文本 SFT 就能激活视觉推理与工具使用. 此阶段加入人工设计的视觉轨迹反而伤泛化; 纯文本 SFT 更好-- 很可能因为联合预训练已建立强视觉–文本对齐, 能力可跨模态自然迁移. 随后在文本与视觉任务上做联合 RL. 关键发现是: 视觉 RL 会抬升而非压低文本表现, 例如 MMLU-Pro 与 GPQA-Diamond 有提升. 这种「文本启动视觉, 视觉反哺文本」的双向增强, 体现联合训练下更强的跨模态对齐.

**Agent Swarm: Parallel Agent Orchestration.** Most existing agentic models rely on sequential execution of tool calls. Even systems capable of hundreds of reasoning steps, such as Kimi K2-Thinking [1], suffer from linear scaling of inference time, leading to unacceptable latency and limiting task complexity. As agentic workloads grow in scope and heterogeneity-e. g., building a complex project that involves massive-scale research, design, and development-the sequential paradigm becomes increasingly inefficient.



**Agent Swarm: 并行智能体编排.** 多数既有智能体模型仍串行执行工具调用. 即便能做上百步推理(如 Kimi K2-Thinking [1]), 推理时间仍近似线性膨胀, 延迟难接受, 任务复杂度也受限. 当工作负载更广, 更异构-- 例如大型项目里海量调研, 设计与开发-- 串行范式愈发低效.

To overcome the latency and scalability limits of sequential agent execution, Kimi K2.5 introduces Agent Swarm, a dynamic framework for parallel agent orchestration. We propose a Parallel-Agent Reinforcement Learning (PARL) paradigm that departs from traditional agentic RL [2]. In addition to optimizing tool execution via verifiable rewards, the model is equipped with interfaces for sub-agent creation and task delegation. During training, sub-agents are frozen and their execution trajectories are excluded from the optimization objective; only the orchestrator is updated via reinforcement learning. This decoupling circumvents two challenges of end-to-end co-optimization: credit assignment ambiguity and training instability. Agent Swarm enables complex tasks to be decomposed into heterogeneous subproblems executed concurrently by domain-specialized agents, transforming task complexity from linear scaling to parallel processing. In wide-search scenarios, Agent Swarm reduces inference latency by up to 4.5× while improving item-level F1 from 72.8% to 79.0% compared to single-agent baselines.



为突破串行执行的延迟与扩展瓶颈, Kimi K2.5 提出 Agent Swarm 这一动态并行编排框架, 并给出 Parallel-Agent Reinforcement Learning(PARL), 与传统智能体 RL [2] 不同: 除用可验证奖励优化工具执行外, 模型还具备创建子智能体与委派任务的接口. 训练时子智能体冻结, 其执行轨迹不进优化目标, 只对编排器用强化学习更新. 这种解耦绕开端到端共优化的两大难点: 信用分配含糊, 训练不稳定. Agent Swarm 把复杂任务拆成异构子问题, 由领域特化智能体并发执行, 把复杂度从线性串行转为并行处理. 在 wide-search 场景, 相对单智能体基线, 延迟最高降约 4.5×, item-level F1 从 72.8% 提到 79.0%.

(「PARL」: Parallel-Agent Reinforcement Learning; 编排器可训, 子智能体冻结, 奖励含并行实例化, 子任务完成率与任务级结果, 见源文 §3.)

Kimi K2.5 represents a unified architecture for general-purpose agentic intelligence, integrating vision and language, thinking and instant modes, chats and agents. It achieves strong performance across a broad range of agentic and frontier benchmarks, including state-of-the-art results in visual-to-code generation (image/video-to-code) and realworld software engineering in our internal evaluations, while scaling both the diversity of specialized agents and the degree of parallelism. To accelerate community progress toward General Agentic Intelligence, we open-source our post-trained checkpoints of Kimi K2.5, enabling researchers and developers to explore, refine, and deploy scalable agentic intelligence.



Kimi K2.5 是一套面向通用智能体智能的统一架构, 整合视觉与语言, thinking 与 instant 模式, 聊天与智能体. 它在广泛的智能体与前沿基准上表现强, 内部评测中在视觉到代码(图/视频到代码)与真实软件工程上达到领先, 同时扩展特化智能体多样性与并行度. 为加速社区走向 General Agentic Intelligence, 开源后训练 checkpoint.

## 2 Joint Optimization of Text and Vision ## 2 文本与视觉的联合优化

Kimi K2.5 is a native multimodal model built upon Kimi K2 through large-scale joint pre-training on approximately 15 trillion mixed visual and text tokens. Unlike vision-adapted models that compromise either linguistic or visual capabilities, our joint pre-training paradigm enhances both modalities simultaneously. This section describes the multimodal joint optimization methodology that extends Kimi K2 to Kimi K2.5.



Kimi K2.5 是原生多模态模型: 在 Kimi K2 之上, 用约 15 万亿混合视觉与文本 token 做大规模联合预训练. 与常牺牲语言或视觉一端的「视觉适配」路线不同, 联合预训练同时增强两种模态. 本节描述把 Kimi K2 扩展到 K2.5 的多模态联合优化方法.

### 2.1 Native Multimodal Pre-Training ### 2.1 原生多模态预训练

A key design question for multimodal pre-training is: Given a fixed vision-text token budget, what is the optimal vision-text joint-training strategy. Conventional wisdom [8, 21] suggests introducing vision tokens predominantly in the later stages of LLM training at high ratios (e. g., 50% or higher) should accelerate multimodal capability acquisition, treating multimodal capability as a post-hoc add-on to linguistic competence.



多模态预训练的关键设计问题是: 在固定视觉–文本 token 预算下, 最优联合训练策略是什么. 常规看法 [8, 21] 认为在 LLM 训练后期以高比例(如 50% 或更高)引入视觉 token, 能更快获得多模态能力, 把多模态当成语言能力的事后加成.

<!-- page 3 of 31 -->

Kimi K2.5

TECHNICAL REPORT

Table 1: Performance comparison across different vision-text joint-training strategies. Early fusion with a lower vision ratio yields better results given a fixed total vision-text token budget.



表 1: 不同视觉–文本联合训练策略的表现对比. 在固定总视觉–文本 token 预算下, 早期融合且视觉比例较低者更好.

|  | Vision Injectio Timing | n Vision-Text Ratio | Vision Knowledge | Vision Reasoning | OCR | Text Knowledge | Text Reasoning | Code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Early | 0% | 10%: 90% | 25.8 | 43.8 | 65.7 | 45.5 | 58.5 | 24.8 |
| Mid | 50% | 20%: 80% | 25.0 | 40.7 | 64.1 | 43.9 | 58.6 | 24.0 |
| Late | 80% | 50%: 50% | 24.2 | 39.0 | 61.5 | 43.1 | 57.8 | 24.0 |

However, our experiments (as shown in Table 1 Figure 9) reveal a different story. We conducted ablation studies varying the vision ratio and vision injection timing while keeping the total vision and text token budgets fixed. To strictly meet the targets for different ratios, we pre-trained the model with text-only tokens for a specifically calculated number of tokens before introducing vision data. Surprisingly, we found that the vision ratio has minimal impact on final multimodal performance. In fact, **early fusion with a lower vision ratio yields better results given a fixed total vision-text token budget**. This motivates our native multimodal pre-training strategy: rather than aggressive vision-heavy training concentrated at the end, we adopt a moderate vision ratio integrated early in the training process, allowing the model to naturally develop balanced multimodal representations while benefiting from extended co-optimization of both modalities.



但实验(表 1, 图 9)呈现另一幅图景. 他们在固定总视觉与文本 token 预算下, 消融视觉比例与注入时机; 为严格达到不同比例, 会先用纯文本预训练算出的 token 数, 再引入视觉数据. 出乎意料: 视觉比例对最终多模态表现影响很小; 事实上, **在固定总预算下, 早期融合 + 较低视觉比例更好**. 这推动「原生多模态预训练」: 不在尾段猛堆高比例视觉, 而是早期就以适中视觉比例共训, 让模型自然长出平衡的多模态表示, 并享受更长的双模态共优化.

### 2.2 Zero-Vision SFT ### 2.2 零视觉 SFT

Pretrained VLMs do not naturally perform vision-based tool-calling, which poses a cold-start problem for multimodal RL. Conventional approaches address this issue through manually annotated or prompt-engineered chain-of-thought (CoT) data [8], but such methods are limited in diversity, often restricting visual reasoning to simple diagrams and primitive tool manipulations (crop, rotate, flip).



预训练 VLM 不会自然做基于视觉的工具调用, 给多模态 RL 带来冷启动问题. 常规做法用人工标注或提示工程的 CoT 数据 [8], 但多样性有限, 视觉推理常被限在简单图示与裁剪/旋转/翻转等初级工具操作.

An observation is that high-quality text SFT data are relatively abundant and diverse. We propose a novel approach, zero-vision SFT, that uses only text SFT data to activate the visual, agentic capabilities during post-training. In this approach, all image manipulations are proxied through programmatic operations in IPython, effectively serving as a generalization of traditional vision tool-use. This "zero-vision" activation enables diverse reasoning behaviors, including pixel-level operations such as object size estimation via binarization and counting, and generalizes to visually grounded tasks such as object localization, counting, and OCR.



观察是: 高质量文本 SFT 数据相对充裕且多样. 他们提出零视觉 SFT: 后训练只用文本 SFT 数据来激活视觉与智能体能力. 图像操作一律经 IPython 程序化操作代理, 相当于对传统视觉工具使用的泛化. 这种「零视觉」激活能引出多样推理行为, 包括二值化估大小与计数等像素级操作, 并泛化到定位, 计数, OCR 等视觉落地任务.

Figure 2 illustrates the RL training curves, where the starting points are obtained from zero-vision SFT. The results show that zero-vision SFT is sufficient for activating vision capabilities while ensuring generalization across modalities. This phenomenon is likely due to the joint pretraining of text and vision data as described in Section 2.1. Compared to zero-vision SFT, our preliminary experiments show that text-vision SFT yields much worse performance on visual, agentic tasks, possibly because of the lack of high-quality vision data.



图 2 给出 RL 训练曲线, 起点来自零视觉 SFT. 结果表明零视觉 SFT 足以激活视觉能力并保证跨模态泛化; 现象很可能源于 §2.1 的联合预训练. 相对零视觉 SFT, 初步实验显示文本–视觉 SFT 在视觉智能体任务上差得多, 可能因高质量视觉数据不足.

### 2.3 Joint Multimodal Reinforcement Learning (RL) ### 2.3 联合多模态强化学习(RL)

In this section, we describe the methodology implemented in K2.5 that enables effective multimodal RL, from outcome-based visual RL to emergent cross-modal transfer that enhances textual performance.



本节描述 K2.5 中有效多模态 RL 的做法: 从基于结果的视觉 RL, 到能抬升文本表现的涌现式跨模态迁移.

**Outcome-Based Visual RL** Following the zero-vision SFT, the model requires further refinement to reliably incorporate visual inputs into reasoning. Text-initiated activation alone exhibits notable failure modes: visual inputs are sometimes ignored, and images may not be attended to when necessary. We employ outcome-based RL on tasks that explicitly require visual comprehension for correct solutions. We categorize these tasks into three domains:



**基于结果的视觉 RL** 零视觉 SFT 之后, 仍需 refining, 才能可靠把视觉输入纳入推理. 仅靠文本启动会有明显失败模式: 有时忽略视觉输入, 或该看图时不看图. 他们在「正确答案明确依赖视觉理解」的任务上做 outcome-based RL, 并分成三类:

• **Visual grounding and counting:** Accurate localization and enumeration of objects within images;



• **视觉 grounding 与计数:** 图像内目标准确定位与计数;

• **Chart and document understanding:** Interpretation of structured visual information and text extraction;



• **图表与文档理解:** 结构化视觉信息解读与文本抽取;

• **Vision-critical STEM problems:** Mathematical and scientific questions filtered to require visual inputs.



• **视觉关键 STEM 题:** 筛过, 必须依赖视觉输入的数学与科学题.

Outcome-based RL on these tasks improves both basic visual capabilities and more complex agentic behaviors. Extracting these trajectories for rejection-sampling fine-tuning (RFT) enables a self-improving data pipeline, allowing subsequent joint RL stages to leverage richer multimodal reasoning traces.



在这些任务上做 outcome-based RL, 能同时抬升基础视觉能力与更复杂智能体行为. 抽出轨迹做拒采样微调(RFT), 形成可自改进的数据流水, 让后续联合 RL 用上更丰富的多模态推理轨迹.

<!-- page 4 of 31 -->

Kimi K2.5

TECHNICAL REPORT

![Chart block](images/p04-chart.png)

![Chart block](images/p04-chart-2.png)

![Chart block](images/p04-chart-3.png)

![Chart block](images/p04-figure-2-vision-rl-training-curves-on-vision-benchmarks.png)

Figure 2: Vision RL training curves on vision benchmarks starting from minimal zero-vision SFT. By scaling vision RL FLOPs, the performance continues to improve, demonstrating that zero-vision activation paired with long-running RL is sufficient for acquiring robust visual capabilities.



图 2: 从最小零视觉 SFT 出发的视觉 RL 训练曲线(视觉基准). 扩大视觉 RL FLOPs, 表现持续提升, 说明零视觉激活再配长时间 RL, 足以获得稳健视觉能力.

Table 2: Cross-Modal Transfer: Vision RL Improves Textual Knowledge



表 2: 跨模态迁移: 视觉 RL 抬升文本知识

| Benchmark | Before Vision-RL | After Vision-RL | Improvement |
| --- | --- | --- | --- |
| MMLU-Pro | 84.7 | 86.4 | +1.7 |
| GPQA-Diamond | 84.3 | 86.4 | +2.1 |
| LongBench v2 | 56.7 | 58.9 | +2.2 |

**Visual RL Improves Text Performance** To investigate potential trade-offs between visual and textual performance, we evaluated text-only benchmarks before and after visual RL. Surprisingly, outcome-based visual RL produced measurable improvements in textual tasks, including MMLU-Pro (84.7% → 86.4%), GPQA-Diamond (84.3% → 86.4%), and LongBench v2 (56.7% → 58.9%) (Table 2). Analysis suggests that visual RL enhances calibration in areas requiring structured information extraction, reducing uncertainty on queries that resemble visually grounded reasoning (e. g., counting, OCR). These findings indicate that visual RL can contribute to cross-modal generalization, improving textual reasoning without observable degradation of language capabilities.



**视觉 RL 抬升文本表现** 为检查视觉与文本是否此消彼长, 他们在视觉 RL 前后评测纯文本基准. 出乎意料, outcome-based 视觉 RL 在文本任务上也有可测提升: MMLU-Pro(84.7% → 86.4%), GPQA-Diamond(84.3% → 86.4%), LongBench v2(56.7% → 58.9%)(表 2). 分析暗示: 视觉 RL 改善了结构化信息抽取相关校准, 降低了类似视觉落地推理(如计数, OCR)查询上的不确定性. 说明视觉 RL 可贡献跨模态泛化, 抬升文本推理且未见语言能力明显退化.

**Joint Multimodal RL** Motivated by the finding that robust visual capabilities can emerge from zero-vision SFT paired with vision RL-which further enhances general text abilities-we adopt a joint multimodal RL paradigm during Kimi K2.5’s post-training. Departing from conventional modality-specific expert divisions, we organize RL domains not by input modality but by abilities-knowledge, reasoning, coding, agentic, etc. These domain experts jointly learn from both pure-text and multimodal queries, while the Generative Reward Model (GRM) similarly optimizes across heterogeneous traces without modality barriers. This pardaigm ensures that capability improvements acquired through either textual or visual inputs inherently generalize to enhance related abilities across the alternate modality, thereby maximizing cross-modal capability transfer.



**联合多模态 RL** 基于「零视觉 SFT + 视觉 RL 可涌现稳健视觉能力, 并进一步抬升通用文本能力」, Kimi K2.5 后训练采用联合多模态 RL. 不再按输入模态分专家, 而按能力组织 RL 域-- 知识, 推理, 编码, 智能体等. 这些域专家同时学纯文本与多模态查询; 生成式奖励模型(GRM)也跨异构轨迹, 无模态壁垒优化. 该范式让经文本或视觉获得的能力提升, 能自然泛化到另一模态的相关能力, 从而最大化跨模态迁移.

(「GRM」: Generative Reward Model, 生成式奖励模型; 用语言模型细粒度打分, 而非纯规则验分, 见源文 §4.4.2.)

## 3 Agent Swarm



## 3 Agent Swarm

The primary challenge of existing agent-based systems lies in their reliance on sequential execution of reasoning and tool-calling steps. While this structure may be effective for simpler, short-horizon tasks, it becomes inadequate as the complexity of the task increases and the accumulated context grows. As tasks evolve to contain broad information gathering and intricate, multi-branch reasoning, sequential systems often encounter significant bottlenecks [5, 6, 7].



既有基于智能体的系统的主要挑战, 是依赖串行执行推理与工具调用. 对简单, 短时程任务或许够用; 任务变复杂, 上下文堆积后就不敷用. 当任务包含广覆盖信息搜集与多分支复杂推理时, 串行系统常撞上明显瓶颈 [5, 6, 7].

<!-- page 5 of 31 -->

Kimi K2.5

TECHNICAL REPORT

![Image block](images/p05-figure-3-an-agent-swarm-has-a-trainable-orchestrator.png)

Figure 3: An agent swarm has a trainable orchestrator that dynamically creates specialized frozen subagents and decomposes complex tasks into parallelizable subtasks for efficient distributed execution.



图 3: Agent Swarm 含可训练编排器: 动态创建特化的冻结子智能体, 把复杂任务拆成可并行子任务, 做高效分布式执行.

The limited capacity of a single agent working through each step one by one can lead to the exhaustion of practical reasoning depth and tool-call budgets, ultimately hindering the system’s ability to handle more complex scenarios.



单智能体逐步走, 容易耗尽可用的推理深度与工具调用预算, 最终妨碍处理更复杂场景.

To address this, we introduce **Agent Swarm** and **Parallel Agent Reinforcement Learning (PARL)**. Instead of executing a task as a reasoning chain or relying on pre-specified parallelization heuristics, K2.5 initiates an Agent Swarm through dynamic task decomposition, subagent instantiation, and parallel subtask scheduling. Importantly, parallelism is not presumed to be inherently advantageous; decisions regarding whether, when, and how to parallelize are explicitly learned through environmental feedback and RL-driven exploration. As shown in Figure 4, the progression of performance demonstrates this adaptive capability, with the cumulative reward increasing smoothly as the orchestrator optimizes its parallelization strategy throughout training.



为此引入 **Agent Swarm** 与 **Parallel Agent Reinforcement Learning (PARL)**. 不是把任务当一条推理链, 也不靠预先指定的并行启发式; K2.5 通过动态任务分解, 子智能体实例化与并行子任务调度启动 Swarm. 重要的是: 并不预设「并行一定更好」; 是否, 何时, 如何并行, 由环境反馈与 RL 探索显式学得. 如图 4, 表现随训练平滑上升, 累积奖励随编排器优化并行策略而增长.

**Architecture and Learning Setup** The PARL framework adopts a decoupled architecture comprising a trainable orchestrator and frozen subagents instantiated from fixed intermediate policy checkpoints. This design deliberately avoids end-to-end co-optimization to circumvent two fundamental challenges: credit assignment ambiguity and training instability. In this multi-agent setting, outcome-based rewards are inherently sparse and noisy; a correct final answer does not guarantee flawless subagent execution, just as a failure does not imply universal subagent error. By freezing the subagents and treating their outputs as environmental observations rather than differentiable decision points, we disentangle high-level coordination logic from low-level execution proficiency, leading to more robust convergence. To improve efficiency, we first train the orchestrator using small-size subagents before transitioning to larger models. Our RL framework also supports dynamically adjusting the inference instance ratios between subagents and the orchestrator, thereby maximizing the resource usage across the cluster.



**架构与学习设定** PARL 采用解耦架构: 可训练编排器 + 由固定中间策略 checkpoint 实例化的冻结子智能体. 刻意不做端到端共优化, 以绕开信用分配含糊与训练不稳定. 多智能体设定下, 基于结果的奖励天生稀疏且噪: 最终答对不保证子智能体全程无瑕, 失败也不等于每个子智能体都错. 冻结子智能体, 把其输出当环境观测而非可微决策点, 就把高层协调与底层执行熟练度拆开, 收敛更稳. 为提效, 先用小尺寸子智能体训编排器, 再过渡到更大模型; RL 框架还支持动态调整子智能体与编排器的推理实例比例, 以提高集群资源利用率.

**PARL Reward** Training a reliable parallel orchestrator is challenging due to the delayed, sparse, and non-stationary feedback inherent in independent subagent execution. To address this, we define the PARL reward as:



**PARL 奖励** 因子智能体独立执行带来的延迟, 稀疏, 非平稳反馈, 训可靠并行编排器很难. PARL 奖励定义为:

$$
r _ {\text {PARL}} (x, y) = \lambda_ {1} \cdot \underbrace {r _ {\text {parallel}}} _ {\text {instantiation reward}} + \lambda_ {2} \cdot \underbrace {r _ {\text {finish}}} _ {\text {sub - agent finish rate}} + \underbrace {r _ {\text {perf}} (x , y)} _ {\text {task - level outcome}}.
$$

The performance reward $r _ { \mathrm { p e r f } }$ evaluates the overall success and quality of the solution y for a given task x. This is augmented by two auxiliary rewards, each addressing a distinct challenge in learning parallel orchestration. The reward $r _ { \mathrm { p a r a l l e l } }$ is introduced to mitigate serial collapse-a local optimum where the orchestrator defaults to singleagent execution. By incentivizing subagent instantiation, this term encourages the exploration of concurrent scheduling spaces. The $r _ { \mathrm { f i n i s h } }$ reward focuses on the successful completion of assigned subtasks. It is used to prevent spurious parallelism, a reward-hacking behavior in which the orchestrator increases parallel metrics dramatically by spawning



性能奖励 $r_{\mathrm{perf}}$ 评估给定任务 x 上解 y 的整体成功与质量. 另有两项辅助奖励, 各对一项并行编排学习难点. $r_{\mathrm{parallel}}$ 用来缓解「串行塌缩」-- 编排器默认单智能体执行的局部最优; 通过激励实例化子智能体, 鼓励探索并发调度空间. $r_{\mathrm{finish}}$ 关注已分配子任务是否成功完成, 用来防止虚假并行: 一种 reward hacking, 编排器靠狂生子智能体把并行指标抬很高却

<!-- page 6 of 31 -->

Kimi K2.5

TECHNICAL REPORT

![Chart block](images/p06-chart.png)

![Chart block](images/p06-figure-4-in-our-parallel-agent-reinforcement-learning.png)

Figure 4: In our parallel-agent reinforcement learning environment, the training accuracy increases smoothly as training progresses. At the same time, the level of parallelism during training also gradually increases.



图 4: 在并行智能体强化学习环境中, 训练准确率随训练平滑上升; 同时训练期并行度也逐渐提高.

many subagents without meaningful task decomposition. By rewarding completed subtasks, $r _ { \mathrm { f i n i s h } }$ enforces feasibility and guides the policy toward valid and effective decompositions.



没有有意义的任务分解. 奖励已完成子任务, $r_{\mathrm{finish}}$ 强制可行性, 引导策略走向有效分解.

To ensure the final policy optimizes for the primary objective, the hyperparameters $\lambda _ { 1 }$ and $\lambda _ { 2 }$ are annealed to zero over the course of training.



为保证最终策略优化主目标, 超参 $\lambda_1$ 与 $\lambda_2$ 在训练过程中退火到零.

**Critical Steps as Resource Constraint** To measure computational time cost in a parallel-agent setting, we define critical steps by analogy to the critical path in a computation graph. We model an episode as a sequence of execution stages indexed by $t   =   1 , \ldots , T$ . In each stage, the main agent executes an action, which corresponds to either direct tool invocation or the instantiation of a group of subagents running in parallel. Let $S _ { \mathrm { m a i n } } ^ { ( t ) }$ denote the number of steps taken by the main agent in stage t (typically $S _ { \mathrm { m a i n } } ^ { ( t ) } = 1 )$ , and $S _ { \mathrm { s u b } , i } ^ { ( t ) }$ <sup>denote</sup> the number of steps taken by the i-th subagent in that parallel group. The duration of stage t is governed by the longest-running subagent within that cohort. Consequently, the total critical steps for an episode are defined as



**以关键步数作资源约束** 为在并行设定下度量计算时间成本, 他们类比计算图关键路径定义 critical steps. 把一条 episode 建模为阶段序列 $t=1, \ldots, T$. 每阶段主智能体执行一个动作: 直接调工具, 或实例化一组并行子智能体. 设 $S_{\mathrm{main}}^{(t)}$ 为主智能体在阶段 t 的步数(通常为 1), $S_{\mathrm{sub}, i}^{(t)}$ 为该并行组中第 i 个子智能体的步数. 阶段 t 时长由组内跑得最久的子智能体决定. 于是整条 episode 的总关键步数为

$$
\text {CriticalSteps} = \sum_ {t = 1} ^ {T} \left(S _ {\text {main}} ^ {(t)} + \max _ {i} S _ {\text {sub}, i} ^ {(t)}\right).
$$

By constraining training and evaluation using critical steps rather than total steps, the framework explicitly incentivizes effective parallelization. Excessive subtask creation that does not reduce the maximum execution time of parallel groups yields little benefit under this metric, while well-balanced task decomposition that shortens the longest parallel branch directly reduces critical steps. As a result, the orchestrator is encouraged to allocate work across subagents in a way that minimizes end-to-end latency, rather than merely maximizing concurrency or total work performed.



训练与评测用关键步数而非总步数约束, 框架就显式激励有效并行: 多生子任务却不缩短并行组最长执行时间, 在此指标下几乎无益; 均衡分解, 缩短最长并行分支, 则直接降低关键步数. 于是编排器被鼓励按最小化端到端延迟来分活, 而不是单纯最大化并发或总工作量.

**Prompt Construction for Parallel-agent Capability Induction** To incentivize the orchestrator to leverage the advantages of parallelization, we construct a suite of synthetic prompts designed to stress the limits of sequential agentic execution. These prompts emphasize either wide search, requiring simultaneous exploration of many independent information sources, or deep search, requiring multiple reasoning branches with delayed aggregation. We additionally include tasks inspired by real-world workloads, such as long-context document analysis and large-scale file downloading. When executed sequentially, these tasks are difficult to complete within fixed reasoning-step and tool-call budgets. By construction, they encourage the orchestrator to allocate subtasks in parallel, enabling completion within fewer critical steps than would be feasible for a single sequential agent. Importantly, the prompts do not explicitly instruct the model to parallelize. Instead, they shape the task distribution such that parallel decomposition and scheduling strategies are naturally favored.



**并行智能体能力诱导的提示构造** 为激励编排器利用并行优势, 他们构造一套合成提示, 专门压测串行智能体执行的极限: 或强调 wide search(需同时探索许多独立信息源), 或强调 deep search(多推理分支, 延迟聚合). 另含贴近真实负载的任务, 如长上下文文档分析, 大规模文件下载. 串行执行时, 这些任务很难在固定推理步与工具调用预算内完成; 构造上鼓励编排器并行分配子任务, 从而用更少关键步数完成-- 单串行智能体往往做不到. 重要的是: 提示并不显式命令「去并行」; 而是塑造任务分布, 使并行分解与调度策略自然更受青睐.

## 4 Method Overview ## 4 方法总览

### 4.1 Foundation: Kimi K2 Base Model ### 4.1 底座: Kimi K2 基座模型

The foundation of Kimi K2.5 is Kimi K2 [53], a trillion-parameter mixture-of-experts (MoE) transformer [59] model pre-trained on 15 trillion high-quality text tokens. Kimi K2 employs the token-efficient MuonClip optimizer [30, 34] with QK-Clip for training stability. The model comprises 1.04 trillion total parameters with 32 billion activated



Kimi K2.5 的底座是 Kimi K2 [53]: 万亿参 MoE Transformer [59], 在 15 万亿高质量文本 token 上预训练. Kimi K2 使用 token 高效的 MuonClip 优化器 [30, 34], 并配 QK-Clip 保训练稳定. 总参 1.04 万亿, 每 token 激活 320 亿

<!-- page 7 of 31 -->

Kimi K2.5

TECHNICAL REPORT

Table 3: Overview of training stages: data composition, token volumes, sequence lengths, and trainable components.



表 3: 训练阶段总览: 数据构成, token 量, 序列长度与可训组件.

| Stages | ViT Training | Joint Pre-training | Joint Long-context Mid-training |
| --- | --- | --- | --- |
| Data | Alt text Synthesis Caption Grounding, OCR, Video | +Text, Knowledge Interleaving Video, OS Screenshot | +High-quality Text &amp; Multimodal Long Text, Long Video Reasoning, Long-CoT |
| Sequence length | 4096 | 4096 | 32768→262144 |
| Tokens | 1T | 15T | 500B→200B |
| Training | ViT | ViT &amp; LLM | ViT &amp; LLM |

parameters, utilizing 384 experts with 8 activated per token (sparsity of 48). For detailed descriptions of MuonClip, architecture design, and training infrastructure, we refer to the Kimi K2 technical report [53].



参数, 384 个专家, 每 token 激活 8 个(稀疏度 48). MuonClip, 架构与训练基础设施细节见 Kimi K2 技术报告 [53].

(「稀疏度 48」: 源文写 sparsity of 48, 对应 384/8; MoE 总参与激活参的关系见 llm-guide MoE 单独成篇.)

### 4.2 Model Architecture ### 4.2 模型架构

The multimodal architecture of Kimi K2.5 consists of three components: a three-dimensional native-resolution vision encoder (MoonViT-3D), an MLP projector, and the Kimi K2 MoE language model, following the design principles established in Kimi-VL [54].



Kimi K2.5 多模态架构三件套: 三维原生分辨率视觉编码器 MoonViT-3D, MLP 投影器, 以及 Kimi K2 MoE 语言模型, 设计原则沿 Kimi-VL [54].

**MoonViT-3D: Shared Embedding Space for Images and Videos** In Kimi-VL, we employ MoonViT to natively process images at their original resolutions, eliminating the need for complex sub-image splitting and splicing operations. Initialized from SigLIP-SO-400M [77], MoonViT incorporates the patch packing strategy from NaViT [15], where single images are divided into patches, flattened, and sequentially concatenated into 1D sequences, thereby enabling efficient simultaneous training on images at varying resolutions.



**MoonViT-3D: 图像与视频共享嵌入空间** 在 Kimi-VL 中, MoonViT 按原分辨率处理图像, 无需复杂切图拼接. 从 SigLIP-SO-400M [77] 初始化, 并采用 NaViT [15] 的 patch packing: 单图切 patch, 展平, 顺次拼成 1D 序列, 从而高效同时训不同分辨率图像.

To maximize the transfer of image understanding capabilities to video, we introduce **MoonViT-3D** with a unified architecture, fully shared parameters, and a consistent embedding space. By generalizing the “patch n’ pack“ philosophy to the temporal dimension, up to four consecutive frames are treated as a spatiotemporal volume: 2D patches from these frames are jointly flattened and packed into a single 1D sequence, allowing the identical attention mechanism to operate seamlessly across both space and time. While the extra temporal attention improves understanding on high-speed motions and visual effects, the sharing maximizes knowledge generalization from static images to dynamic videos, achieving strong video understanding performance (see in Tab. 4) without requiring specialized video modules or architectural bifurcation. Prior to the MLP projector, lightweight temporal pooling aggregates patches within each temporal chunk, yielding 4× temporal compression to significantly extend feasible video length. The result is a unified pipeline where knowledge and ability obtained from image pretraining transfers holistically to videos through one shared parameter space and feature representation.



为把图像理解尽量迁移到视频, 引入 **MoonViT-3D**: 统一架构, 参数全共享, 嵌入空间一致. 把「patch n’ pack」推到时间维: 最多连续 4 帧当作时空体, 各帧 2D patch 一起展平打包装进同一 1D 序列, 同一套注意力跨时空无缝运作. 额外时间注意力有助于高速运动与视觉特效理解; 共享则最大化静态图到动态视频的知识泛化, 无需专用视频模块或架构分叉即可在视频理解上拿到强结果(见表 4). 进 MLP 投影器前, 用轻量时间池化聚合每个时间块内的 patch, 得到 4× 时间压缩, 显著拉长可处理视频. 整条流水统一: 图像预训练学到的知识与能力, 经同一参数空间与特征表示整体迁到视频.

### 4.3 Pre-training Pipeline ### 4.3 预训练流水

As illustrated in Table 3, Kimi K2.5’s pre-training builds upon the Kimi K2 language model checkpoint and processes approximately 15T tokens across three stages: first, standalone ViT training to establish a robust native-resolution visual encoder; second, joint pre-training to simultaneously enhance language and multimodal capabilities; and third, mid-training on high-quality data and long-context activation to refine capabilities and extend context windows.



如表 3, Kimi K2.5 预训练从 Kimi K2 语言模型 checkpoint 出发, 约 15T token 分三阶段: 先单独训 ViT, 立稳原生分辨率视觉编码器; 再联合预训练, 同时增强语言与多模态; 第三阶段用高质量数据做 mid-training 并激活长上下文, 精炼能力并扩展窗口.

**ViT Training Stage** The MoonViT-3D is continual pre-trained from SigLIP [77] on image-text and video-text pairs, where the text components consist of a variety of targets: image alt texts, synthetic captions of images and videos, grounding bboxes, and OCR texts. Unlike the implementation in Kimi-VL [54], this continual pre-training does not include a contrastive loss, but incorporates solely cross-entropy loss $L _ { c a p t i o n }$ for caption generation conditioned on input images and videos. We adopt a two-stage alignment strategy. In the first stage, we update the MoonViT-3D to align it with Moonlight-16B-A3B [34] via the caption loss, consuming about 1T tokens with very few training FLOPs. This stage allows MoonViT-3D to primarily understand high-resolution images and videos. A very short second stage follows, updating only the MLP projector to bridge the ViT with the 1T LLM for smoother joint pre-training.



**ViT 训练阶段** MoonViT-3D 从 SigLIP [77] 在图文, 视频–文本对上持续预训练; 文本目标多样: 图 alt text, 图/视频合成字幕, grounding bbox, OCR 文本. 与 Kimi-VL [54] 不同, 此阶段不含对比损失, 只用条件于输入图/视频的字幕生成交叉熵 $L_{caption}$. 采用两阶段对齐: 第一阶段用字幕损失把 MoonViT-3D 对齐到 Moonlight-16B-A3B [34], 约 1T token, 训练 FLOPs 很少, 主要让其理解高分辨率图与视频; 极短第二阶段只更新 MLP 投影器, 把 ViT 接到 1T LLM, 便于更平滑进入联合预训练.

<!-- page 8 of 31 -->

Kimi K2.5

TECHNICAL REPORT

**Joint Training Stages** The joint pre-training stage continues from a near-end Kimi K2 checkpoint over additional 15T vision-text tokens at 4K sequence length. The data recipe extends Kimi K2’s pre-training distribution by introducing unique tokens, adjusting data proportions with increased weight on coding-related content, and controlling maximum epochs per data source. The third stage performs long-context activation with integrated higher-quality midtraining data, sequentially extending context length via YaRN [44] interpolation. This yields significant generalization improvements in long-context text understanding and long video comprehension.



**联合训练阶段** 联合预训练从接近收尾的 Kimi K2 checkpoint 继续, 再吃约 15T 视觉–文本 token, 序列长 4K. 数据配方在 Kimi K2 预训练分布上扩展: 引入独特 token, 调整比例并加重编码相关, 控制各数据源最大 epoch. 第三阶段用更高质量 mid-training 数据做长上下文激活, 经 YaRN [44] 插值顺序扩展上下文长度, 显著改善长文本理解与长视频理解.

(「YaRN」: 一种 RoPE 频率扩展的长上下文外推方法; 机制见 llm-guide YaRN 相关笔记.)

### 4.4 Post-Training ### 4.4 后训练

#### 4.4.1 Supervised Fine-Tuning #### 4.4.1 监督微调

Following the SFT pipeline established by Kimi K2 [53], we developed K2.5 by synthesizing high-quality candidate responses from K2, K2 Thinking and a suite of proprietary in-house expert models. Our data generation strategy employs specialized pipelines tailored to specific domains, integrating human annotation with advanced prompt engineering and multi-stage verification. This methodology produced a large-scale instruction-tuning dataset featuring diverse prompts and intricate reasoning trajectories, ultimately training the model to prioritize interactive reasoning and precise tool-calling for complex, real-world applications.



沿 Kimi K2 [53] 的 SFT 流水, K2.5 从 K2, K2 Thinking 与一套内部专家模型合成高质量候选回答. 数据生成按域定制流水, 结合人工标注, 高级提示工程与多阶段校验, 得到大规模指令微调集: 提示多样, 推理轨迹复杂, 最终把模型训向复杂真实应用中的交互式推理与精确工具调用.

#### 4.4.2 Reinforcement Learning #### 4.4.2 强化学习

Reinforcement learning constitutes a crucial phase of our post-training. To facilitate joint optimization across text and vision modalities, as well as to enable PARL for agent swarm, we develop a Unified Agentic Reinforcement Learning Environment (Appendix D) and optimize the RL algorithms. Both text-vision joint RL and PARL are built upon the algorithms described in this section.



强化学习是后训练关键阶段. 为支撑文本–视觉联合优化与 Agent Swarm 的 PARL, 他们开发统一智能体强化学习环境(附录 D)并优化 RL 算法. 文本–视觉联合 RL 与 PARL 都建立在本节算法之上.

**Policy Optimization** For each problem x sampled from a dataset D, K responses $\{ y _ { 1 } , \ldots , y _ { K } \}$ are generated using the previous policy $\pi _ { \mathrm { o l d } }$ . We optimize the model π<sub>θ</sub> with respect to the following objective:



**策略优化** 对从数据集 D 采样的每个问题 x, 用旧策略 $\pi_{\mathrm{old}}$ 生成 K 条回答 $\{y_1, \ldots, y_K\}$. 对模型 $\pi_\theta$ 优化如下目标:

$$
L _ {\mathrm{RL}} (\boldsymbol {\theta}) = \mathbb {E} _ {x \sim \mathscr {D}} \left[ \frac {1}{N} \sum_ {j = 1} ^ {K} \sum_ {i = 1} ^ {| y _ {j} |} \operatorname{Clip} \left(\frac {\pi_ {\boldsymbol {\theta}} \left(y _ {j} ^ {i} \mid x , y _ {j} ^ {0 : i}\right)}{\pi_ {\text {old}} \left(y _ {j} ^ {i} \mid x , y _ {j} ^ {0 : i}\right)}, \alpha , \beta\right) (r (x, y _ {j}) - \bar {r} (x)) - \tau \left(\log \frac {\pi_ {\boldsymbol {\theta}} \left(y _ {j} ^ {i} \mid x , y _ {j} ^ {0 : i}\right)}{\pi_ {\text {old}} \left(y _ {j} ^ {i} \mid x , y _ {j} ^ {0 : i}\right)}\right) ^ {2} \right]. \tag{1}
$$

Here $\alpha , \beta , \tau > 0$ are hyperparameters, $y _ { 0 : i } ^ { j }$ is the prefix up to the i-th token of the j-th response, $\begin{array} { r } { N = \sum _ { i = 1 } ^ { K } \left| y _ { i } \right| } \end{array}$ is the total number of generated tokens in a batch, $\begin{array} { r } { \bar { r } ( x ) = \frac { 1 } { K } { \sum _ { j = 1 } ^ { K } r ( x , y _ { j } ) } } \end{array}$ is the mean reward of all generated responses.



其中 $\alpha, \beta, \tau>0$ 为超参, $y_j^{0: i}$ 为第 j 条回答到第 i 个 token 的前缀, $N=\sum_i |y_i|$ 为 batch 内生成 token 总数, $\bar{r}(x)=\frac{1}{K}\sum_j r(x, y_j)$ 为各回答奖励均值.

This loss function departs from the policy optimization algorithm used in K1.5 [31] by introducing a token-level clipping mechanism designed to mitigate the off-policy divergence amplified by discrepancies between training and inference frameworks. The mechanism functions as a simple gradient masking scheme: policy gradients are computed normally for tokens with log-ratios within the interval [α, β ], while gradients for tokens falling outside this range are zeroed out. Notably, a key distinction from standard PPO clipping [50] is that our method relies strictly on the log-ratio to explicitly bound off-policy drift, regardless of the sign of the advantages. This approach aligns with recent strategies proposed to stabilize large-scale RL training [74, 78]. Empirically, we find this mechanism essential for maintaining training stability in complex domains requiring long-horizon, multi-step tool-use reasoning. We employ the MuonClip optimizer [30, 34] to minimize this objective.



相对 K1.5 [31] 的策略优化, 该损失引入 token 级裁剪, 缓解训练与推理框架差异放大的 off-policy 偏离. 机制像简单梯度掩码: log-ratio 落在 [α, β] 内的 token 正常算策略梯度, 落在区间外的梯度置零. 与标准 PPO 裁剪 [50] 的关键区别: 严格按 log-ratio 显式限制 off-policy 漂移, 与优势符号无关. 这与近期稳定大规模 RL 训练的策略一致 [74, 78]. 经验上, 对需长时程, 多步工具推理的复杂域, 该机制对训练稳定至关重要. 用 MuonClip [30, 34] 最小化该目标.

(「PPO clipping」: PPO 中按重要性比率裁剪更新; 此处裁剪只看 log-ratio 是否出界, 与优势正负无关. PPO 细节见 llm-guide PPO 单独成篇.)

**Reward Function** We apply a rule-based outcome reward for tasks with verifiable solutions, such as reasoning and agentic tasks. To optimize resource consumption, we also incorporate a budget-control reward aimed at enhancing token efficiency. For general-purpose tasks, we employ Generative Reward Models (GRMs) that provide granular evaluations aligned with Kimi’s internal value criteria. In addition, for visual tasks, we design task-specific reward functions to provide fine-grained supervision. For visual grounding and point localization tasks, we employ an F1- based reward with soft matching: grounding tasks derive soft matches from Intersection over Union (IoU) and point tasks derive soft matches from Gaussian-weighted distances under optimal matching. For polygon segmentation tasks, we rasterize the predicted polygon into a binary mask and compute the segmentation IoU against the ground-truth mask to assign the reward. For OCR tasks, we adopt normalized edit distance to quantify character-level alignment between predictions and ground-truth. For counting tasks, rewards are assigned based on the absolute difference between predictions and ground-truth. Furthermore, we synthesize complex visual puzzle problems and utilize an LLM verifier (Kimi K2) to provide feedback.



**奖励函数** 对可验证解的任务(推理, 智能体等)用基于规则的结果奖励; 为控资源消耗, 另加面向 token 效率的预算控制奖励. 通用任务用 GRM, 按 Kimi 内部价值准则给细粒度评价. 视觉任务另设计任务特定奖励: grounding 与点定位用基于 F1 的软匹配奖励--grounding 由 IoU 得软匹配, 点任务在最优匹配下由高斯加权距离得软匹配; 多边形分割把预测多边形栅格成二值掩码, 与真值掩码算分割 IoU; OCR 用归一化编辑距离; 计数按预测与真值绝对差给奖励. 还合成复杂视觉谜题, 用 LLM 校验器(Kimi K2)给反馈.

**Generative Reward Models** Kimi K2 leverages a self-critique rubric reward for open-ended generation [53], and K2.5 extends this line of work by systematically deploying Generative Reward Models (GRMs) across a broad range



**生成式奖励模型** Kimi K2 对开放生成用自批判量规奖励 [53]; K2.5 把这条线扩展, 在更广范围系统部署 GRM

<!-- page 9 of 31 -->

Kimi K2.5

TECHNICAL REPORT

of agentic behaviors and multimodal trajectories. Rather than limiting reward modeling to conversational outputs, we apply GRMs on top of verified reward signals in diverse environments, including chat assistants, coding agents, search agents, and artifact-generating agents. Notably, GRMs function not as binary adjudicators, but as fine-grained evaluators aligned with Kimi’s values that are critical to user experiences, such as helpfulness, response readiness, contextual relevance, appropriate level of detail, aesthetic quality of generated artifacts, and strict instruction following. This design allows the reward signal to capture nuanced preference gradients that are difficult to encode with purely rule-based or task-specific verifiers. To mitigate reward hacking and overfitting to a single preference signal, we employ multiple alternative GRM rubrics tailored to different task contexts.



-- 覆盖多样智能体行为与多模态轨迹. 奖励建模不限于对话输出: 在已验证奖励信号之上, 把 GRM 用到聊天助手, 编码智能体, 搜索智能体, 产物生成智能体等环境. GRM 不是二元裁判, 而是按对用户体验关键的 Kimi 价值做细粒度评价: 有用性, 响应就绪度, 上下文相关, 细节是否适量, 生成产物美学, 严格跟指令等. 这样奖励能抓住纯规则或任务验分器难编码的偏好梯度. 为缓解 reward hacking 与对单一偏好过拟合, 按任务上下文使用多套备选 GRM 量规.

**Token Efficient Reinforcement Learning** Token efficiency is central to LLMs with test-time scaling. While testtime scaling inherently trades computation for reasoning quality, practical gains require algorithmic innovations that actively navigate this trade-off. Our previous findings indicate that imposing a problem-dependent budget effectively constrains inference-time compute, incentivizing the model to generate more concise chain of thought reasoning patterns without unnecessary token expansion [31, 53]. However, we also observe a length-overfitting phenomenon: models trained under rigid budget constraints often fail to generalize to higher compute scales. Consequently, they cannot effectively leverage additional inference-time tokens to solve complex problems, instead defaulting to truncated reasoning patterns.



**Token 高效强化学习** 对带 test-time scaling 的 LLM, token 效率是核心. test-time scaling 本质是用算力换推理质量, 但要落地收益, 需算法主动驾驭这一权衡. 此前发现: 加问题相关预算能有效约束推理期算力, 激励模型写更紧凑的 CoT, 少无谓扩 token [31, 53]. 但也观察到长度过拟合: 在僵硬预算下训出的模型, 常难以泛化到更高算力尺度, 不能有效用额外推理 token 解难题, 反而默认截断式推理模式.

To this end, we propose Toggle, a training heuristic that alternates between inference-time scaling and budgetconstrained optimization: for learning iteration t, the reward function is defined by



为此提出 Toggle: 在「推理期 scaling」与「预算约束优化」之间交替的训练启发式. 学习迭代 t 的奖励定义为

$$
\tilde {r} (x, y) = \left\{ \begin{array}{l l} r (x, y) \cdot \mathbb {I} \left\{\frac {1}{K} \sum_ {i = 1} ^ {K} r (x, y _ {i}) <   \lambda \text {or} | y _ {i} | \leq \text {budget} (\mathrm{x}) \right\} & \text {if} \lfloor t / m \rfloor \pmod {2} = 0 (\text {Phase0}) \\ r (x, y) & \text {if} \lfloor t / m \rfloor \pmod {2} = 1 (\text {Phase1}) \end{array} . \right.
$$

where $\lambda$ and m are hyper-parameters of the algorithm and K is the number of rollouts per problem. Specifically, the algorithm alternates between two optimization phases every m iterations:



其中 $\lambda$ 与 m 为算法超参, K 为每题 rollout 数. 具体地, 每 m 轮在两优化相位间交替:

• Phase0 (budget limited phase): The model is trained to solve the problem within a task-dependent token budget. To prevent a premature sacrifice of quality for efficiency, this constraint is conditionally applied: it is only enforced when the model’s mean accuracy for a given problem exceeds the threshold λ.



• Phase0(预算受限相位): 训模型在任务相关 token 预算内解题. 为防过早牺牲质量换效率, 约束有条件施加: 仅当该题平均准确率超过阈值 λ 时才强制.

• Phase1 (standard scaling phase): The model generates responses up to the maximum token limit, encouraging the model to leverage computation for better inference-time scaling.



• Phase1(标准 scaling 相位): 生成可到最大 token 上限, 鼓励用算力做更好的推理期 scaling.

The problem-dependent budget is estimated from the $\rho _ { 1 }$ -th percentile of token lengths among the subset of correct responses:



问题相关预算由正确回答子集上 token 长度的第 $\rho_1$ 百分位估计:

$$
\text {budget} (x) = \text {Percentile} \left(\left\{\left| y _ {j} \right| \mid r (x, y _ {i}) = 1, i = 1, \dots , K \right\}, \rho\right). \tag{2}
$$

This budget is estimated once at the beginning of training and remains fixed thereafter. Notably, Toggle functions as a stochastic alternating optimization for a bi-objective problem. It is specifically designed to reconcile reasoning capabilities with computational efficiency.



该预算在训练开始估计一次后固定. Toggle 本质是双目标问题的随机交替优化, 专门用来调和推理能力与计算效率.

We evaluate the effectiveness of Toggle on K2 Thinking [1]. As shown in Figure 5, we observe a consistent reduction in output length across nearly all benchmarks. On average, Toggle decreases output tokens by 25∼30% with a negligible impact on performance. We also observe that redundant patterns in the chain-of-thought, such as repeated verifications and mechanical calculations, decrease substantially. Furthermore, Toggle shows strong domain generalization. For example, when trained exclusively on mathematics and programming tasks, the model still achieves consistent token reductions on GPQA and MMLU-Pro with only marginal degradation in performance (Figure 5).



在 K2 Thinking [1] 上评估 Toggle. 如图 5, 几乎所有基准上输出长度一致下降; 平均减 25∼30% 输出 token, 对表现影响可忽略. CoT 中重复核验, 机械计算等冗余模式也明显减少. Toggle 域泛化也强: 例如只在数学与编程上训, 仍能在 GPQA 与 MMLU-Pro 上持续减 token, 表现仅轻微下降(图 5).

### 4.5 Training Infrastructure ### 4.5 训练基础设施

Kimi K2.5 inherits the training infrastructure from Kimi K2 [53] with minimal modifications. For multimodal training, we propose Decoupled Encoder Process, where the vision encoder is incorporated into the existing pipeline with negligible additional overhead.



Kimi K2.5 基本继承 Kimi K2 [53] 训练基础设施, 改动很少. 多模态训练提出 Decoupled Encoder Process(DEP), 把视觉编码器接入既有流水且额外开销可忽略.

#### 4.5.1 Decoupled Encoder Process (DEP) #### 4.5.1 解耦编码器进程(DEP)

In a typical multimodal training paradigm utilizing Pipeline Parallelism (PP), the vision encoder and text embedding are co-located in the first stage of the pipeline (Stage-0). However, due to the inherent variations of multimodal input size (e. g., image counts and resolutions), Stage-0 suffers from drastic fluctuations in both computational load and memory usage. This forces existing solutions to adopt custom PP configurations for vision-language models for instance, [54] manually adjusts the number of text decoder layers in Stage-0 to reserve memory. While this



典型多模态 + 流水线并行(PP)设定下, 视觉编码器与文本嵌入同处流水第一段(Stage-0). 但多模态输入尺寸天生波动(图数量, 分辨率等), Stage-0 的算力负载与显存剧烈抖动. 既有方案不得不为 VLM 定制 PP-- 例如 [54] 手动调 Stage-0 文本解码层数以留显存. 这虽

<!-- page 10 of 31 -->

Kimi K2.5

TECHNICAL REPORT

![Image block](images/p10-figure-5-comparison-of-model-performance-and-token.png)

Figure 5: Comparison of model performance and token usage for Kimi K2 Thinking following token-efficient RL.



图 5: Kimi K2 Thinking 经 token 高效 RL 后的模型表现与 token 用量对比.

compromise alleviates memory pressure, it does not fundamentally resolve the load imbalance caused by multimodal input sizes. More critically, it precludes the direct reuse of parallel strategies that have been highly optimized for text-only training.



缓解显存压力, 却未从根本上解决多模态输入尺寸带来的负载不均; 更关键的是, 无法直接复用已为纯文本训练高度优化的并行策略.

Leveraging the unique topological position of the visual encoder within the computation graph - specifically, its role as the start of the forward pass and the end of the backward pass - our training uses **Decoupled Encoder Process (DEP)**, which is composed of three stages in each training step:



利用视觉编码器在计算图中的独特拓扑位置-- 前向起点, 反向终点-- 训练采用 **Decoupled Encoder Process (DEP)**, 每训练步分三阶段:

• **Balanced Vision Forward:** We first execute the forward pass for all visual data in the global batch. Because the vision encoder is small, we replicate it on all GPUs regardless of other parallelism strategies. During this phase, the forward computational workload is evenly distributed across all GPUs based on load metrics (e. g., image or patch counts). This eliminates load-imbalance caused by PP and visual token counts. To minimize peak memory usage, we discard all intermediate activations, retaining only the final output activations. The results are gathered back to PP Stage-0;



• **均衡视觉前向:** 先对全局 batch 全部视觉数据做前向. 视觉编码器较小, 故不论其他并行策略如何, 都在所有 GPU 上复制一份. 此阶段按负载指标(如图或 patch 数)把前向算力均摊到各 GPU, 消除 PP 与视觉 token 数导致的负载不均. 为压峰值显存, 丢掉中间激活, 只留最终输出激活, 再 gather 回 PP Stage-0;

• **Backbone Training:** This phase performs the forward and backward passes for the main transformer backbone. By discarding intermediate activations in the preceding phase, we can now fully leverage any efficient parallel strategies validated in pure text training. After this phase, gradients are accumulated at the visual encoder output;



• **骨干训练:** 对主 Transformer 骨干做前向与反向. 因上一阶段已丢中间激活, 可充分复用纯文本训练验证过的高效并行策略. 此阶段后, 梯度在视觉编码器输出处累积;

• **Vision Recomputation & Backward:** We re-compute the vision encoder forward pass, followed by a backward pass to compute gradients for parameters in the vision encoder;



• **视觉重算与反向:** 重算视觉编码器前向, 再反向求视觉编码器参数梯度;

DEP not only achieves load-balance, but also decouples the optimization strategy of the vision encoder and the main backbone. K2.5 seamlessly inherits the parallel strategy of K2, achieving a multimodal training efficiency of 90% relative to text-only training. We note a concurrent work, LongCat-Flash-Omni [55], shares a similar design philosophy.



DEP 既做负载均衡, 也把视觉编码器与主骨干的优化策略解耦. K2.5 无缝继承 K2 并行策略, 多模态训练效率相对纯文本达到 90%. 同期工作 LongCat-Flash-Omni [55] 有类似设计哲学.

## 5 Evaluations ## 5 评测

### 5.1 Main Results ### 5.1 主要结果

#### 5.1.1 Evaluation Settings #### 5.1.1 评测设定

**Benchmarks** We evaluate Kimi K2.5 on a comprehensive benchmark suite spanning text-based reasoning, competitive and agentic coding, multimodal understanding (image and video), autonomous agentic execution, and computer use. Our benchmark taxonomy is organized along the following capability axes:



**基准** 在涵盖文本推理, 竞赛与智能体编码, 多模态理解(图与视频), 自主智能体执行与计算机使用的综合基准套件上评测 Kimi K2.5. 能力轴如下:

• **Reasoning & General**: Humanity’s Last Exam (HLE) [46], AIME 2025 [4], HMMT 2025 (Feb) [58], IMO-AnswerBench [37], GPQA-Diamond [47], MMLU-Pro [64], SimpleQA Verified [22], AdvancedIF [23], and LongBench v2 [9].



• **推理与通用**: HLE [46], AIME 2025 [4], HMMT 2025 (Feb) [58], IMO-AnswerBench [37], GPQA-Diamond [47], MMLU-Pro [64], SimpleQA Verified [22], AdvancedIF [23], LongBench v2 [9].

<!-- page 11 of 31 -->

Kimi K2.5

TECHNICAL REPORT

• **Coding**: SWE-Bench Verified [29], SWE-Bench Pro (public) [16], SWE-Bench Multilingual [29], Terminal Bench 2.0 [39], PaperBench (CodeDev) [52], CyberGym [66], SciCode [56], OJBench (cpp) [65], and Live-CodeBench (v6) [28].



• **编码**: SWE-Bench Verified [29], SWE-Bench Pro (public) [16], SWE-Bench Multilingual [29], Terminal Bench 2.0 [39], PaperBench (CodeDev) [52], CyberGym [66], SciCode [56], OJBench (cpp) [65], LiveCodeBench (v6) [28].

• **Agentic Capabilities**: BrowseComp [68], WideSearch [69], DeepSearchQA [60], FinSearchComp (T2&T3) [26], Seal-0 [45], GDPVal [43].



• **智能体能力**: BrowseComp [68], WideSearch [69], DeepSearchQA [60], FinSearchComp (T2&T3) [26], Seal-0 [45], GDPVal [43].

• **Image Understanding**: (math & reasoning) MMMU-Pro [75], MMMU (val) [76], CharXiv (RQ) [67], Math-Vision [61] and MathVista (mini) [36]; (vision knowledge) SimpleVQA [13] and WorldVQA <sup>2</sup>; (perception) ZeroBench (w/ and w/o tools) [48], BabyVision [12], BLINK [18] and MMVP [57]; (OCR & document) OCR-Bench [35], OmniDocBench 1.5 [42] and InfoVQA [38].



• **图像理解**: (数学与推理)MMMU-Pro [75], MMMU (val) [76], CharXiv (RQ) [67], MathVision [61], MathVista (mini) [36]; (视觉知识)SimpleVQA [13], WorldVQA<sup>2</sup>; (感知)ZeroBench(有/无工具)[48], BabyVision [12], BLINK [18], MMVP [57]; (OCR 与文档)OCRBench [35], OmniDocBench 1.5 [42], InfoVQA [38].

• **Video Understanding**: VideoMMMU [25], MMVU [79], MotionBench [24], Video-MME [17] (with subtitles), LongVideoBench [70], and LVBench [62].



• **视频理解**: VideoMMMU [25], MMVU [79], MotionBench [24], Video-MME [17](含字幕), LongVideoBench [70], LVBench [62].

• **Computer Use**: OSWorld-Verified [72, 73], and WebArena [80].



• **计算机使用**: OSWorld-Verified [72, 73], WebArena [80].

**Baselines** We benchmark against state-of-the-art proprietary and open-source models. For proprietary models, we compare against Claude Opus 4.5 (with extended thinking) [6], GPT-5.2 (with xhigh reasoning effort) [41], and Gemini 3 Pro (with high reasoning-level) [20]. For open-source models, we include DeepSeek-V3.2 (with thinking mode enabled) [14] for text benchmarks, while vision benchmarks report Qwen3-VL-235B-A22B-Thinking [8] instead.



**基线** 对照领先闭源与开源模型. 闭源: Claude Opus 4.5(extended thinking)[6], GPT-5.2(xhigh reasoning effort)[41], Gemini 3 Pro(high reasoning-level)[20]. 开源: 文本基准用 DeepSeek-V3.2(thinking 开启)[14]; 视觉基准改报 Qwen3-VL-235B-A22B-Thinking [8].

**Evaluation Configurations** Unless otherwise specified, all Kimi K2.5 evaluations use temperature = 1.0, top-p = 0.95, and a context length of 256k tokens. Benchmarks without publicly available scores were re-evaluated under identical conditions and marked with an asterisk (\*). The full evaluation settings can be found in appendix E.



**评测配置** 除非另说明, Kimi K2.5 一律 temperature = 1.0, top-p = 0.95, 上下文 256k tokens. 无公开分数的基准在相同条件下重评, 标星号(\*). 完整设定见附录 E.

#### 5.1.2 Evaluation Results #### 5.1.2 评测结果

Comprehensive results comparing Kimi K2.5 against proprietary and open-source baselines are presented in Table 4. We highlight key observations across core capability domains:



表 4 给出 Kimi K2.5 相对闭源与开源基线的综合结果. 分核心能力域摘要如下:

**Reasoning and General** Kimi K2.5 achieves competitive performance with top-tier proprietary models on rigorous STEM benchmarks. On Math tasks, AIME 2025, K2.5 scores 96.1%, approaching GPT-5.2’s perfect score while outperforming Claude Opus 4.5 (92.8%) and Gemini 3 Pro (95.0%). This high-level performance extends to the HMMT 2025 (95.4%) and IMO-AnswerBench (81.8%), demonstrating K2.5’s superior reasoning depth. Kimi K2.5 also exhibits remarkable knowledge and scientific reasoning capabilities, scoring 36.9% on SimpleQA Verified, 87.1% on MMLU-Pro and 87.6% on GPQA. Notably, on HLE without the use of tools, K2.5 achieves an HLE-Full score of 30.1%, with component-wise scores of 31.5% on text subset and 21.3% on image subset. When tool-use is enabled, K2.5’s HLE-Full score rises to 50.2%, with 51.8% (text) and 39.8% (image), significantly outperforming Gemini 3 Pro (45.8%) and GPT-5.2 (45.5%). In addition to reasoning and knowledge, K2.5 shows strong instruction-following performance (75.6% on AdvancedIF) and competitive long-context abilities, achieving 61.0% on LongBench v2 compared to both proprietary and open-source models.



**推理与通用** 在严格 STEM 基准上, Kimi K2.5 与顶级闭源可竞争. 数学侧 AIME 2025 得 96.1%, 逼近 GPT-5.2 满分, 高于 Claude Opus 4.5(92.8%)与 Gemini 3 Pro(95.0%). 这一高水平延续到 HMMT 2025(95.4%)与 IMO-AnswerBench(81.8%), 体现推理深度. 知识与科学推理上: SimpleQA Verified 36.9%, MMLU-Pro 87.1%, GPQA 87.6%. 无工具时 HLE-Full 30.1%(文本子集 31.5%, 图像子集 21.3%); 开工具后 HLE-Full 升至 50.2%(文本 51.8%, 图像 39.8%), 明显高于 Gemini 3 Pro(45.8%)与 GPT-5.2(45.5%). 指令跟随 AdvancedIF 75.6%; 长上下文 LongBench v2 61.0%, 相对闭源与开源均可竞争.

**Complex Coding and Software Engineering** Kimi K2.5 exhibits strong software engineering capabilities, especially on realistic coding and maintenance tasks. It achieves 76.8% on SWE-Bench Verified and 73.0% on SWE-Bench Multilingual, outperforming Gemini 3 Pro while remaining competitive with Claude Opus 4.5 and GPT-5.2. On LiveCodeBench v6, Kimi K2.5 reaches 85.0%, surpassing DeepSeek-V3.2 (83.3%) and Claude Opus 4.5 (82.2%), highlighting its robustness on live, continuously updated coding challenges. On TerminalBench 2.0, PaperBench, and SciCode, it scores 50.8%, 63.5%, and 48.7% respectively, demonstrating stable competition-level performance in automated software engineering and problem solving across diverse domains. In addition, K2.5 attains a score of 41.3 on CyberGym, on the task of finding previously discovered vulnerabilities in real open-source software projects given only a high-level description of the weakness, further underscoring its effectiveness in security-oriented software analysis.



**复杂编码与软件工程** 在真实编码与维护任务上能力强: SWE-Bench Verified 76.8%, SWE-Bench Multilingual 73.0%, 超过 Gemini 3 Pro, 并与 Claude Opus 4.5, GPT-5.2 可竞争. LiveCodeBench v6 85.0%, 高于 DeepSeek-V3.2(83.3%)与 Claude Opus 4.5(82.2%), 体现对持续更新编码挑战的稳健性. TerminalBench 2.0, PaperBench, SciCode 分别为 50.8%, 63.5%, 48.7%, 跨域自动化软件工程与解题表现稳定. CyberGym 41.3: 仅给弱点高层描述, 在真实开源项目中找已发现漏洞, 进一步说明安全向软件分析有效.

**Agentic Capabilities** Kimi K2.5 establishes new state-of-the-art performance on complex agentic search and browsing tasks. On BrowseComp, K2.5 achieves 60.6% without context management techniques, 74.9% with Discard-all context management [14] - substantially outperforming GPT-5.2’s reported 65.8%, Claude Opus 4.5 (37.0%) and Gemini 3 Pro (37.8%). Similarly, WideSearch reaches 72.7% on item-f1. On DeepSearchQA (77.1%), FinSearch-CompT2&T3 (67.8%) and Seal-0 (57.4%), K2.5 leads all evaluated models, demonstrating superior capacity for agentic deep research, information synthesis, and multi-step tool orchestration.



**智能体能力** 在复杂智能体搜索与浏览上建立新领先. BrowseComp: 无上下文管理 60.6%, Discard-all [14] 后 74.9%-- 明显高于 GPT-5.2 报告的 65.8%, Claude Opus 4.5(37.0%), Gemini 3 Pro(37.8%). WideSearch item-f1 72.7%. DeepSearchQA 77.1%, FinSearchCompT2&T3 67.8%, Seal-0 57.4% 均为评测模型中最高, 体现深度调研, 信息综合与多步工具编排能力.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>2</sup>https://github. com/MoonshotAI/WorldVQA</span></small>

<!-- page 12 of 31 -->

Kimi K2.5

TECHNICAL REPORT

Table 4: Performance comparison of Kimi K2.5 against open-source and proprietary models. Bold denotes the global SOTA; Data points marked with \* are taken from our internal evaluations. †refers to their scores of text-only subset.



表 4: Kimi K2.5 相对开源与闭源模型的表现对比. 粗体为全局 SOTA; \* 为内部评测; † 为纯文本子集分数.

|  |  |  | Proprietary |  | Open | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Benchmark | Kimi K2.5 | Claude Opus4.5 | GPT-5.2(xhigh) | Gemini 3 Pro | DeepSeek-V3.2 | Qwen3-VL-235B-A22B |
| Reasoning &amp; General |  |  |  |  |  |  |
| HLE-Full | 30.1 | 30.8 | 34.5 | 37.5 | 25.1† | - |
| HLE-Full w/ tools | 50.2 | 43.2 | 45.5 | 45.8 | 40.8† | - |
| AIME 2025 | 96.1 | 92.8 | 100 | 95.0 | 93.1 | - |
| HMMT 2025 (Feb) | 95.4 | 92.9* | 99.4 | 97.3* | 92.5 | - |
| IMO-AnswerBench | 81.8 | 78.5* | 86.3 | 83.1* | 78.3 | - |
| GPQA-Diamond | 87.6 | 87.0 | 92.4 | 91.9 | 82.4 | - |
| MMLU-Pro | 87.1 | 89.3* | 86.7* | 90.1 | 85.0 | - |
| SimpleQA Verified | 36.9 | 44.1 | 38.9 | 72.1 | 27.5 | - |
| AdvancedIF | 75.6 | 63.1 | 81.1 | 74.7 | 58.8 | - |
| LongBench v2 | 61.0 | 64.4* | 54.5* | 68.2* | 59.8* | - |
| Coding |  |  |  |  |  |  |
| SWE-Bench Verified | 76.8 | 80.9 | 80.0 | 76.2 | 73.1 | - |
| SWE-Bench Pro (public) | 50.7 | 55.4* | 55.6 | - | - | - |
| SWE-Bench Multilingual | 73.0 | 77.5 | 72.0 | 65.0 | 70.2 | - |
| Terminal Bench 2.0 | 50.8 | 59.3 | 54.0 | 54.2 | 46.4 | - |
| PaperBench (CodeDev) | 63.5 | 72.9* | 63.7* | - | 47.1 | - |
| CyberGym | 41.3 | 50.6 | - | 39.9* | 17.3* | - |
| SciCode | 48.7 | 49.5 | 52.1 | 56.1 | 38.9 | - |
| OJBench (cpp) | 57.4 | 54.6* | - | 68.5* | 54.7* | - |
| LiveCodeBench (v6) | 85.0 | 82.2* | - | 87.4* | 83.3 | - |
| Agentic |  |  |  |  |  |  |
| BrowseComp | 60.6 | 37.0 | 65.8 | 37.8 | 51.4 | - |
| BrowseComp (w/ ctx manage) | 74.9 | 57.8 |  | 59.2 | 67.6 | - |
| BrowseComp (Agent Swarm) | 78.4 | - | - | - | - | - |
| WideSearch | 72.7 | 76.2* | - | 57.0 | 32.5* | - |
| WideSearch (Agent Swarm) | 79.0 | - | - | - | - | - |
| DeepSearchQA | 77.1 | 76.1* | 71.3* | 63.2* | 60.9* | - |
| FinSearchCompT2&amp; T3 | 67.8 | 66.2* | - | 49.9 | 59.1* | - |
| Seal-0 | 57.4 | 47.7* | 45.0 | 45.5* | 49.5* | - |
| GDPVal-AA | 41.0 | 45.0 | 48.0 | 35.0 | 34.0 | - |
| Image |  |  |  |  |  |  |
| MMMU-Pro | 78.5 | 74.0 | 79.5* | 81.0 | - | 69.3 |
| MMMU (val) | 84.3 | 80.7 | 86.7* | 87.5* | - | 80.6 |
| CharXiv (RQ) | 77.5 | 67.2* | 82.1 | 81.4 | - | 66.1 |
| MathVision | 84.2 | 77.1* | 83.0 | 86.1* | - | 74.6 |
| MathVista (mini) | 90.1 | 80.2* | 82.8* | 89.8* | - | 85.8 |
| SimpleVQA | 71.2 | 69.7* | 55.8* | 69.7* | - | 56.8* |
| WorldVQA | 46.3 | 36.8 | 28.0 | 47.4 | - | 23.5 |
| ZeroBench | 9 | 3* | 9* | 8* | - | 4* |
| ZeroBench w/ tools | 11 | 9* | 7* | 12* | - | 3* |
| BabyVision | 36.5 | 14.2 | 34.4 | 49.7 | - | 22.2 |
| BLINK | 78.9 | 68.8* | - | 78.7* | - | 68.9 |
| MMVP | 87.0 | 80.0* | 83.0* | 90.0* | - | 84.3 |
| OmniDocBench 1.5 | 88.8 | 87.7* | 85.7 | 88.5 | - | 82.0* |
| OCRBench | 92.3 | 86.5* | 80.7* | 90.3* | - | 87.5 |
| InfoVQA (test) | 92.6 | 76.9* | 84* | 57.2* | - | 89.5 |
| Video |  |  |  |  |  |  |
| VideoMMMU | 86.6 | 84.4* | 85.9 | 87.6 | - | 80.0 |
| MMVU | 80.4 | 77.3* | 80.8* | 77.5* | - | 71.1 |
| MotionBench | 70.4 | 60.3* | 64.8* | 70.3 | - | - |
| Video-MME | 87.4 | 77.6* | 86.0* | 88.4* | - | 79.0 |
| LongVideoBench | 79.8 | 67.2* | 76.5* | 77.7* | - | 65.6* |
| LVBench | 75.9 | 57.3 | - | 73.5* | - | 63.6 |
| Computer Use |  |  |  |  |  |  |
| OSWorld-Verified | 63.3 | 66.3 | 8.6* | 20.7* | - | 38.1 |
| WebArena | 58.9 | 63.4* | - | - | - | 26.4* |

<!-- page 13 of 31 -->

Kimi K2.5

TECHNICAL REPORT

Table 5: Performance and token efficiency of some reasoning models. Average output token counts (in thousands) are shown in parentheses.



表 5: 部分推理模型的表现与 token 效率. 括号内为平均输出 token 数(千).

<table><tbody><tr><td rowspan="2">Benchmark</td><td rowspan="2">Kimi K2.5</td><td rowspan="2">Kimi K2 Thinking</td><td rowspan="2">Gemini-3.0Pro</td><td rowspan="2">DeepSeek-V3.2Thinking</td></tr><tr></tr><tr><td>AIME 2025</td><td>96.1 (25k)</td><td>94.5 (30k)</td><td>95.0 (15k)</td><td>93.1 (16k)</td></tr><tr><td>HMMT Feb 2025</td><td>95.4 (27k)</td><td>89.4 (35k)</td><td>97.3 (16k)</td><td>92.5 (19k)</td></tr><tr><td>HMMT Nov 2025</td><td>91.1 (24k)</td><td>89.2 (32k)</td><td>94.5 (15k)</td><td>90.2 (18k)</td></tr><tr><td>IMO-AnswerBench</td><td>81.8 (36k)</td><td>78.6 (37k)</td><td>83.1 (18k)</td><td>78.3 (27k)</td></tr><tr><td>LiveCodeBench</td><td>85.0 (18k)</td><td>82.6 (25k)</td><td>87.4 (13k)</td><td>83.3 (16k)</td></tr><tr><td>GPQA Diamond</td><td>87.6 (14k)</td><td>84.5 (13k)</td><td>91.9 (8k)</td><td>82.4 (7k)</td></tr><tr><td>HLE-Text</td><td>31.5 (24k)</td><td>23.9 (29k)</td><td>38.4 (13k)</td><td>25.1 (21k)</td></tr></tbody></table>

**Vision Reasoning, Knowledge and Perception** Kimi K2.5 demonstrates strong visual reasoning and world knowledge capabilities. It scores 78.5% on MMMU-Pro, spanning multi-disciplinary multimodal tasks. For world knowledge question answering, K2.5 achieves 71.2% on SimpleVQA and 46.3% on WorldVQA. For visual reasoning, it achieves 84.2% on MathVision, 90.1% on MathVista (mini), and 36.5% on BabyVision. For OCR and document understanding, K2.5 delivers outstanding results with 77.5% on CharXiv (RQ), 92.3% on OCRBench, 88.8% on OmniDocBench 1.5, and 92.6% on InfoVQA (test). On the challenging ZeroBench, Kimi K2.5 achieves 9% and 11% with tool augmentation, substantially ahead of competing models. On basic visual perception benchmarks BLINK (78.9%) and MMVP (87.0%), we also observe competitive performance of Kimi K2.5, demonstrating its robust real-world visual perceptions.



**视觉推理, 知识与感知** Kimi K2.5 在视觉推理与世界知识上表现强: MMMU-Pro 78.5%; 世界知识问答 SimpleVQA 71.2%, WorldVQA 46.3%; 视觉推理 MathVision 84.2%, MathVista (mini) 90.1%, BabyVision 36.5%. OCR 与文档: CharXiv (RQ) 77.5%, OCRBench 92.3%, OmniDocBench 1.5 88.8%, InfoVQA (test) 92.6%. 困难的 ZeroBench 上无工具 9%, 有工具 11%, 明显高于多数对照. 基础感知 BLINK 78.9%, MMVP 87.0%, 亦具竞争力, 说明真实世界视觉感知稳健.

**Video Understanding** Kimi K2.5 achieves state-of-the-art performance across diverse video understanding tasks. It attains 86.6% on VideoMMMU and 80.4% on MMVU, rivaling frontier leaderships. With the context-compression and dense temporal understanding abilities of MoonViT-3D, Kimi K2.5 also establishes new global SOTA records in long-video comprehension with 75.9% on LVBench and 79.8% on LongVideoBench by feeding over 2, 000 frames, while demonstrating robust dense-motion understanding at 70.4% on the highly-dimensional MotionBench.



**视频理解** 跨多样视频任务达到领先: VideoMMMU 86.6%, MMVU 80.4%, 可与前沿比肩. 凭 MoonViT-3D 的上下文压缩与稠密时间理解, 长视频上再创全局 SOTA: LVBench 75.9%, LongVideoBench 79.8%(喂入超过 2, 000 帧); 高维 MotionBench 70.4%, 稠密运动理解稳健.

**Computer-Use Capability** Kimi K2.5 demonstrates state-of-the-art computer-use capability on real-world tasks. On the computer-use benchmark OSWorld-Verified [72, 73], it achieves a 63.3% success rate relying solely on GUI actions without external tools. This substantially outperforms open-source models such as Qwen3-VL-235B-A22B (38.1%) and OpenAI’s computer-use agent framework Operator (o3-based) (42.9%), while remaining competitive with the current leading CUA model, Claude Opus 4.5 (66.3%). On WebArena [80], an established benchmark for GUI-based web browsing, Kimi K2.5 achieves a 58.9% success rate, surpassing OpenAI’s Operator (58.1%) and approaching the performance of Claude Opus 4.5 (63.4%).



**计算机使用能力** 在真实任务上表现领先. OSWorld-Verified [72, 73] 仅靠 GUI 动作, 无外部工具, 成功率 63.3%, 明显高于开源如 Qwen3-VL-235B-A22B(38.1%)与 OpenAI Operator(o3 基, 42.9%), 并接近领先 CUA Claude Opus 4.5(66.3%). WebArena [80] 成功率 58.9%, 超过 Operator(58.1%), 接近 Claude Opus 4.5(63.4%).

### 5.2 Agent Swarm Results ### 5.2 Agent Swarm 结果

**Benchmarks** To rigorously evaluate the effectiveness of the agent swarm framework, we select three representative benchmarks that collectively cover deep reasoning, large-scale retrieval, and real-world complexity:



**基准** 为严格评估 Agent Swarm, 选三项代表性基准, 分别覆盖深度推理, 大规模检索与真实复杂度:

• **BrowseComp**: A challenging deep-research benchmark that requires multi-step reasoning and complex information synthesis.



• **BrowseComp**: 困难的深度调研基准, 需多步推理与复杂信息综合.

• **WideSearch**: A benchmark designed to evaluate the ability to perform broad, multi-step information seeking and reasoning across diverse sources.



• **WideSearch**: 评估跨多样来源做广覆盖, 多步信息寻求与推理的能力.

• **In-house Swarm Bench**: An internally developed Swarm benchmark, designed to evaluate the agent swarm performance under real-world, high-complexity conditions. It covers four domains: WildSearch (unconstrained, realworld information retrieval over the open web), Batch Download (large-scale acquisition of diverse resources), WideRead (large-scale document comprehension involving more than 100 input documents), and Long-Form Writing (coherent generation of extensive content exceeding 100k words). This benchmark incorporates extreme-scale scenarios that stress-test the orchestration, scalability, and coordination capabilities of agent-based systems.



• **内部 Swarm Bench**: 内部开发的 Swarm 基准, 评真实高复杂度条件下的 Swarm 表现. 含四域: WildSearch(开放网无约束检索), Batch Download(大规模多样资源获取), WideRead(超过 100 份输入文档的大规模文档理解), Long-Form Writing(超过 10 万词连贯长文生成). 纳入极端规模场景, 压测编排, 扩展与协调能力.

**Performance** Table 6 presents the performance of Kimi K2.5 Agent Swarm against single-agent configurations and proprietary baselines. The results demonstrate substantial performance improvements from multi-agent orchestration. On BrowseComp, Agent Swarm achieves 78.4%, representing a 17.8% absolute gain over the single-agent K2.5



表 6 给出 Kimi K2.5 Agent Swarm 相对单智能体与闭源基线的表现. 多智能体编排带来实质提升. BrowseComp 上 Agent Swarm 达 78.4%, 相对单智能体 K2.5 绝对提升 17.8%

<!-- page 14 of 31 -->

Kimi K2.5

TECHNICAL REPORT

Table 6: Performance comparison of Kimi K2.5 Agent Swarm against single-agent and proprietary baselines on agentic search benchmarks. Bold denotes the best result per benchmark.



表 6: Kimi K2.5 Agent Swarm 相对单智能体与闭源基线在智能体搜索基准上的对比. 粗体为各基准最优.

| Benchmark | K2.5 Agent Swarm | Kimi K2.5 | Claude Opus 4.5 | GPT-5.2 | GPT-5.2 Pro |
| --- | --- | --- | --- | --- | --- |
| BrowseComp | 78.4 | 60.6 | 37.0 | 65.8 | 77.9 |
| WideSearch | 79.0 | 72.7 | 76.2 | - | - |
| In-house Swarm Bench | 58.3 | 41.6 | 45.8 | - | - |

![Image block](images/p14-figure-6-the-word-cloud-visualizes-heterogeneous-k2-5.png)

Figure 6: The word cloud visualizes heterogeneous K2.5-based sub-agents dynamically instantiated by the Orchestrator across tests.



图 6: 词云可视化编排器在各测试中动态实例化的异构 K2.5 子智能体.

![Chart block](images/p14-figure-7-comparison-of-kimi-k2-5-performance-under.png)

Figure 7: Comparison of Kimi K2.5 performance under Agent Swarm and Discard-all context management in BrowseComp.



图 7: BrowseComp 上 Agent Swarm 与 Discard-all 上下文管理下 Kimi K2.5 表现对比.

(60.6%) and surpassing even GPT-5.2 Pro (77.9%). Similarly, WideSearch sees a 6.3% improvement (72.7% → 79.0%) on Item-F1, enabling K2.5 Agent Swarm to outperform Claude Opus 4.5 (76.2%) and establish a new stateof-the-art. The gains are most pronounced on In-house Swarm bench (16.7%), where tasks are explicitly designed to reward parallel decomposition. These consistent improvements across benchmarks validate that Agent Swarm effectively converts computational parallelism into qualitative capability gains, particularly for problems requiring broad exploration, multi-source verification, or simultaneous handling of independent sub-tasks.



(相对 60.6%), 甚至超过 GPT-5.2 Pro(77.9%). WideSearch Item-F1 提升 6.3%(72.7% → 79.0%), 使 K2.5 Agent Swarm 超过 Claude Opus 4.5(76.2%)并建立新领先. 内部 Swarm bench 增益最明显(16.7%), 任务明确奖励并行分解. 跨基准一致提升说明 Agent Swarm 能把计算并行有效转成能力增益, 尤其适合广探索, 多源核验或同时处理独立子任务的问题.

**Execution Time Savings via Parallelism** Beyond improved task performance, Agent Swarm achieves substantial wall-clock time reductions through parallel subagent execution. On the WideSearch benchmark, it reduces the execution time required to reach target performance by 3× ∼ 4.5× compared to a single-agent baseline. As shown in Figure 8, this efficiency gain scales with task complexity: as the target Item-F1 increases from 30% to 70%, the single agent’s execution time grows from approximately 1.8× to over 7.0× the baseline, whereas Agent Swarm maintains near-constant low latency in the range of 0.6× ∼ 1.6×. These results indicate that Agent Swarm effectively transforms sequential tool invocations into parallel operations, preventing the linear growth in completion time typically observed as task difficulty increases.



**并行带来的执行时间节省** 除任务表现外, Agent Swarm 经并行子智能体显著缩短墙钟时间. WideSearch 上, 达到目标表现所需执行时间相对单智能体基线降 3× ∼ 4.5×. 如图 8, 效率增益随任务复杂度放大: 目标 Item-F1 从 30% 升到 70% 时, 单智能体执行时间从约 1.8× 基线涨到超过 7.0×, 而 Agent Swarm 保持近常数低延迟 0.6× ∼ 1.6×. 说明它把串行工具调用转成并行操作, 避免难度上升时完成时间线性膨胀.

**Dynamic Subagent Creation and Scheduling** Within an agent swarm, subagents are dynamically instantiated rather than pre-defined. Through PARL, the orchestrator learns adaptive policies to create and schedule self-hosted subagents in response to evolving task structures and problem states. Unlike static decomposition approaches, this learned policy enables the Orchestrator to reason about the requisite number, timing, and specialization of subagents based on query. Consequently, a heterogeneous agent group emerges organically from this adaptive allocation strategy (Figure 6).



**动态子智能体创建与调度** Swarm 内子智能体是动态实例化而非预定义. 经 PARL, 编排器学会按演化中的任务结构与问题状态创建, 调度自托管子智能体. 与静态分解不同, 所学策略让编排器按查询推理所需子智能体数量, 时机与特化. 于是异构智能体组从自适应分配中有机涌现(图 6).

**Agent Swarm as Proactive Context Management** Beyond better performance and runtime acceleration, an agent swarm is a kind of proactive and intelligent context management enabled by multi-agent architecture [5]. This approach differs from test-time context truncation strategies such as Hide-Tool-Result [2], Summary [71], or Discard-all [14], which react to context overflow by compressing or discarding accumulated histories. While effective at reducing token usage, these methods are inherently reactive and often sacrifice structural information or intermediate reasoning.



**Agent Swarm 作为主动上下文管理** 除更好表现与运行加速外, Swarm 还是多智能体架构带来的一种主动, 智能的上下文管理 [5]. 它不同于 Hide-Tool-Result [2], Summary [71], Discard-all [14] 等推理期截断策略-- 后者在上下文溢出时压缩或丢弃历史. 虽能减 token, 但本质被动, 常牺牲结构信息或中间推理.

In contrast, Agent Swarm enables proactive context control through explicit orchestration. Long-horizon tasks are decomposed into parallel, semantically isolated subtasks, each executed by a specialized subagent with a bounded local context. Crucially, these subagents maintain independent working memories and perform local reasoning without directly mutating or contaminating the global context of the central orchestrator. Only task-relevant outputs-rather than full interaction traces-are selectively routed back to the orchestrator. This design induces context sharding



相对地, Agent Swarm 经显式编排做主动上下文控制: 长时程任务拆成并行, 语义隔离的子任务, 各由特化子智能体在有界局部上下文中执行. 关键是: 子智能体保持独立工作记忆, 局部推理, 不直接改写或污染中心编排器的全局上下文; 只有任务相关输出-- 而非完整交互轨迹-- 被选择性回传. 该设计诱导「上下文分片」

<!-- page 15 of 31 -->

Kimi K2.5

TECHNICAL REPORT

![Chart block](images/p15-figure-8-agent-swarm-achieves-3-4-5-faster-execution.png)

Figure 8: Agent Swarm achieves 3×–4.5× faster execution time compared to single-agent baselines as target Item-F1 increases from 30% to 70% in WideSearch testing.



图 8: WideSearch 测试中, 目标 Item-F1 从 30% 升到 70% 时, Agent Swarm 相对单智能体基线执行时间快 3×–4.5×.

rather than context truncation, allowing the system to scale effective context length along an additional architectural dimension while preserving modularity, information locality, and reasoning integrity.



而非上下文截断, 使系统沿额外架构维度扩展有效上下文长度, 同时保持模块化, 信息局部性与推理完整性.

As shown in Figure 7, this proactive strategy outperforms Discard-all in both efficiency and accuracy on BrowseComp. By preserving task-level coherence at the orchestrator level while keeping subagent contexts tightly bounded, Agent Swarm enables parallel execution with selective context persistence, retaining only high-level coordination signals or essential intermediate results. Consequently, Agent Swarm operates as an active, structured context manager, achieving higher accuracy with substantially fewer critical steps than uniform context truncation.



如图 7, 该主动策略在 BrowseComp 上效率与准确率都优于 Discard-all. 编排器层保住任务级连贯, 子智能体上下文收紧, 从而实现带选择性上下文持久化的并行执行, 只留高层协调信号或必要中间结果. 于是 Agent Swarm 充当主动, 结构化的上下文管理器, 相对均匀截断, 以明显更少的关键步数拿到更高准确率.

## 6 Conclusions

Kimi K2.5 shows that scalable and general agentic intelligence can be achieved through joint optimization of text and vision together with parallel agent execution. By unifying language and vision across pre-training and reinforcement learning, the model achieves strong cross-modal alignment and visual–text reasoning. Agent Swarm enables concurrent execution of heterogeneous sub-tasks, reducing inference latency while improving performance on complex agentic workloads. Grounded in vision–text intelligence and agent swarms, Kimi K2.5 demonstrates strong performance on benchmarks and real-world tasks. By open-sourcing the post-trained checkpoints, we aim to support the open-source community in building scalable and general-purpose agentic systems and to accelerate progress toward General Agentic Intelligence.



Kimi K2.5 表明: 通过文本与视觉联合优化, 再加并行智能体执行, 可以做出可扩展, 通用的智能体智能. 预训练与强化学习全程统一语言与视觉, 模型获得强跨模态对齐与视觉–文本推理. Agent Swarm 支持异构子任务并发, 降低推理延迟并抬升复杂智能体负载上的表现. 立足视觉–文本智能与智能体群, Kimi K2.5 在基准与真实任务上表现强. 开源后训练 checkpoint, 意在支持社区构建可扩展通用智能体系统, 并加速走向 General Agentic Intelligence.

<!-- page 16 of 31 -->

Kimi K2.5

TECHNICAL REPORT

## References

[1] Moonshot AI. Introducing Kimi K2 Thinking. 2025. URL: https://moonshotai. github. io/Kimi[K2/thinking. html](https://moonshotai. github. io/Kimi-K2/thinking. html).

[2] Moonshot AI. Kimi-Researcher End-to-End RL Training for Emerging Agentic Capabilities. 2025. URL: [https://moonshotai. github. io/Kimi-Researcher/](https://moonshotai. github. io/Kimi-Researcher/).

[3] Amazon Web Services. Amazon Simple Storage Service (Amazon S3). Web. Available at: [https://aws. amazon. com/s3/](https://aws. amazon. com/s3/). 2023. URL: [https://aws. amazon. com/s3/](https://aws. amazon. com/s3/) (visited on 12/15/2023).

[4] Mathematical Association of America. 2025 American Invitational Mathematics Examination I. Held on February 6, 2025.2025. URL: [https://artofproblemsolving. com/wiki/index. php/2025\_AIME\_I](https://artofproblemsolving. com/wiki/index. php/2025_AIME_I).

[5] Anthropic. Building multi-agent systems: when and how to use them. 2026. URL: [https://claude. com/blog/building-multi-agent-systems-when-and-how-to-use-them](https://claude. com/blog/building-multi-agent-systems-when-and-how-to-use-them).

[6] Anthropic. Claude Opus 4.5 System Card. 2025. URL: [https : / / www - cdn . anthropic . com / bf10f64990cfda0ba858290be7b8cc6317685f47. pdf](https://www-cdn. anthropic. com/bf10f64990cfda0ba858290be7b8cc6317685f47. pdf).

[7] Anthropic. How we built our multi-agent research system. 2025. URL: [https://www. anthropic. com/engineering/multi-agent-research-system](https://www. anthropic. com/engineering/multi-agent-research-system).

[8] Shuai Bai et al. Qwen3-VL Technical Report. 2025. arXiv: [2511 . 21631 
$$
cs. CV
$$
](https://arxiv. org/abs/2511.21631). URL: [https : / / arxiv. org/abs/2511.21631](https://arxiv. org/abs/2511.21631).

[9] Yushi Bai et al. LongBench v2: Towards Deeper Understanding and Reasoning on Realistic Long-context Multitasks. 2025. arXiv: [2412.15204 
$$
cs. CL
$$
](https://arxiv. org/abs/2412.15204). URL: [https://arxiv. org/abs/2412.15204](https://arxiv. org/abs/2412.15204).

[10] Greg Brockman et al. OpenAI Gym. 2016. arXiv: [1606.01540 
$$
cs. LG
$$
](https://arxiv. org/abs/1606.01540). URL: [https://arxiv. org/abs/1606.01540](https://arxiv. org/abs/1606.01540).

[11] Tom B. Brown et al. Language Models are Few-Shot Learners. 2020. arXiv: [2005.14165 
$$
cs. CL
$$
](https://arxiv. org/abs/2005.14165). URL: [https://arxiv. org/abs/2005.14165](https://arxiv. org/abs/2005.14165).

[12] Liang Chen et al. BabyVision: Visual Reasoning Beyond Language. 2026. arXiv: [2601.06521 
$$
cs. CV
$$
](https://arxiv. org/abs/2601.06521). URL: [https://arxiv. org/abs/2601.06521](https://arxiv. org/abs/2601.06521).

[13] Xianfu Cheng et al. SimpleVQA: Multimodal Factuality Evaluation for Multimodal Large Language Models. 2025. arXiv: [2502.13059 
$$
cs. CL
$$
](https://arxiv. org/abs/2502.13059). URL: [https://arxiv. org/abs/2502.13059](https://arxiv. org/abs/2502.13059).

[14] DeepSeek-AI et al. DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models. 2025. arXiv: [2512.02556 
$$
cs. CL
$$
](https://arxiv. org/abs/2512.02556). URL: [https://arxiv. org/abs/2512.02556](https://arxiv. org/abs/2512.02556).

[15] Mostafa Dehghani et al. Patch n’ Pack: NaViT, a Vision Transformer for any Aspect Ratio and Resolution. 2023. arXiv: [2307.06304 
$$
cs. CV
$$
](https://arxiv. org/abs/2307.06304). URL: [https://arxiv. org/abs/2307.06304](https://arxiv. org/abs/2307.06304).

[16] Xiang Deng et al. “SWE-Bench Pro: Can AI Agents Solve Long-Horizon Software Engineering Tasks? ” In: arXiv preprint arXiv: 2509.16941 (2025).

[17] Chaoyou Fu et al. Video-MME: The First-Ever Comprehensive Evaluation Benchmark of Multi-modal LLMs in Video Analysis. 2025. arXiv: [2405.21075 
$$
cs. CV
$$
](https://arxiv. org/abs/2405.21075). URL: [https://arxiv. org/abs/2405.21075](https://arxiv. org/abs/2405.21075).

[18] Xingyu Fu et al. BLINK: Multimodal Large Language Models Can See but Not Perceive. 2024. arXiv: [2404.12390 
$$
cs. CV
$$
](https://arxiv. org/abs/2404.12390). URL: [https://arxiv. org/abs/2404.12390](https://arxiv. org/abs/2404.12390).

[19] Samir Yitzhak Gadre et al. “Datacomp: In search of the next generation of multimodal datasets”. In: Advances in Neural Information Processing Systems 36 (2024).

[20] Google. Gemini 3 Pro. 2025. URL: [https://deepmind. google/models/gemini/pro/](https://deepmind. google/models/gemini/pro/).

[21] Dong Guo et al. Seed1.5-VL Technical Report. 2025. arXiv: [2505 . 07062 
$$
cs. CV
$$
](https://arxiv. org/abs/2505.07062). URL: [https : / / arxiv. org/abs/2505.07062](https://arxiv. org/abs/2505.07062).

[22] Lukas Haas et al. SimpleQA Verified: A Reliable Factuality Benchmark to Measure Parametric Knowledge. 2025. arXiv: [2509.07968 
$$
cs. CL
$$
](https://arxiv. org/abs/2509.07968). URL: [https://arxiv. org/abs/2509.07968](https://arxiv. org/abs/2509.07968).

[23] Yun He et al. AdvancedIF: Rubric-Based Benchmarking and Reinforcement Learning for Advancing LLM Instruction Following. 2025. arXiv: [2511.10507 
$$
cs. CL
$$
](https://arxiv. org/abs/2511.10507). URL: [https://arxiv. org/abs/2511.10507](https://arxiv. org/abs/2511.10507).

[24] Wenyi Hong et al. MotionBench: Benchmarking and Improving Fine-grained Video Motion Understanding for Vision Language Models. 2025. arXiv: [2501 . 02955 
$$
cs. CV
$$
](https://arxiv. org/abs/2501.02955). URL: [https : / / arxiv . org / abs / 2501.02955](https://arxiv. org/abs/2501.02955).

[25] Kairui Hu et al. Video-MMMU: Evaluating Knowledge Acquisition from Multi-Discipline Professional Videos. 2025. arXiv: [2501.13826 
$$
cs. CV
$$
](https://arxiv. org/abs/2501.13826). URL: [https://arxiv. org/abs/2501.13826](https://arxiv. org/abs/2501.13826).

<!-- page 17 of 31 -->

Kimi K2.5

TECHNICAL REPORT

[26] Liang Hu et al. FinSearchComp: Towards a Realistic, Expert-Level Evaluation of Financial Search and Reasoning. 2025. arXiv: [2509.13160 
$$
cs. CL
$$
](https://arxiv. org/abs/2509.13160). URL: [https://arxiv. org/abs/2509.13160](https://arxiv. org/abs/2509.13160).

[27] Yanping Huang et al. GPipe: Efficient Training of Giant Neural Networks using Pipeline Parallelism. 2019. arXiv: [1811.06965 
$$
cs. CV
$$
](https://arxiv. org/abs/1811.06965). URL: [https://arxiv. org/abs/1811.06965](https://arxiv. org/abs/1811.06965).

[28] Naman Jain et al. “Livecodebench: Holistic and contamination free evaluation of large language models for code”. In: arXiv preprint arXiv: 2403.07974 (2024).

[29] Carlos E Jimenez et al. “Swe-bench: Can language models resolve real-world github issues? ” In: arXiv preprint arXiv: 2310.06770 (2023).

[30] Keller Jordan et al. Muon: An optimizer for hidden layers in neural networks. 2024. URL: [https : / / kellerjordan. github. io/posts/muon/](https://kellerjordan. github. io/posts/muon/).

[31] Kimi Team. “Kimi k1.5: Scaling reinforcement learning with llms”. In: arXiv preprint arXiv: 2501.12599 (2025).

[32] Hugo Laurençon et al. “Obelics: An open web-scale filtered dataset of interleaved image-text documents”. In: Advances in Neural Information Processing Systems 36 (2024).

[33] Dmitry Lepikhin et al. “Gshard: Scaling giant models with conditional computation and automatic sharding”. In: arXiv preprint arXiv: 2006.16668 (2020).

[34] Jingyuan Liu et al. “Muon is Scalable for LLM Training”. In: arXiv preprint arXiv: 2502.16982 (2025).

[35] Yuliang Liu et al. “OCRBench: on the hidden mystery of OCR in large multimodal models”. In: Science China Information Sciences 67.12 (Dec. 2024). ISSN: 1869-1919. DOI: [10.1007/s11432-024-4235-6](https://doi. org/10.1007/s11432-024-4235-6). URL: [http://dx. doi. org/10.1007/s11432-024-4235-6](http://dx. doi. org/10.1007/s11432-024-4235-6).

[36] Pan Lu et al. MathVista: Evaluating Mathematical Reasoning of Foundation Models in Visual Contexts. 2024. arXiv: [2310.02255 
$$
cs. CV
$$
](https://arxiv. org/abs/2310.02255). URL: [https://arxiv. org/abs/2310.02255](https://arxiv. org/abs/2310.02255).

[37] Thang Luong et al. “Towards Robust Mathematical Reasoning”. In: Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing. Ed. by Christos Christodoulopoulos et al. Suzhou, China: Association for Computational Linguistics, Nov. 2025, pp. 35418–35442. ISBN: 979-8-89176-332-6. DOI: [10.18653/v1/2025. emnlp- main. 1794](https://doi. org/10.18653/v1/2025. emnlp-main. 1794). URL: [https://aclanthology. org/2025. emnlp-main. 1794/](https://aclanthology. org/2025. emnlp-main. 1794/).

[38] Minesh Mathew et al. InfographicVQA. 2021. arXiv: [2104.12756 
$$
cs. CV
$$
](https://arxiv. org/abs/2104.12756). URL: [https://arxiv. org/abs/2104.12756](https://arxiv. org/abs/2104.12756).

[39] Mike A Merrill et al. “Terminal-Bench: Benchmarking Agents on Hard, Realistic Tasks in Command Line Interfaces”. In: arXiv preprint arXiv: 2601.11868 (2026).

[40] Deepak Narayanan et al. Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM. 2021. arXiv: [2104.04473 
$$
cs. CL
$$
](https://arxiv. org/abs/2104.04473). URL: [https://arxiv. org/abs/2104.04473](https://arxiv. org/abs/2104.04473).

[41] OpenAI. Introducing GPT 5.2.2025. URL: [https://openai. com/index/introducing-gpt-5-2/](https://openai. com/index/introducing-gpt-5-2/).

[42] Linke Ouyang et al. OmniDocBench: Benchmarking Diverse PDF Document Parsing with Comprehensive Annotations. 2025. arXiv: [2412.07626 
$$
cs. CV
$$
](https://arxiv. org/abs/2412.07626). URL: [https://arxiv. org/abs/2412.07626](https://arxiv. org/abs/2412.07626).

[43] Tejal Patwardhan et al. GDPval: Evaluating AI Model Performance on Real-World Economically Valuable Tasks. 2025. arXiv: [2510.04374 
$$
cs. LG
$$
](https://arxiv. org/abs/2510.04374). URL: [https://arxiv. org/abs/2510.04374](https://arxiv. org/abs/2510.04374).

[44] Bowen Peng et al. “Yarn: Efficient context window extension of large language models”. In: arXiv preprint arXiv: 2309.00071 (2023).

[45] Thinh Pham et al. SealQA: Raising the Bar for Reasoning in Search-Augmented Language Models. Seal-0 is the main subset of this benchmark. 2025. arXiv: [2506.01062 
$$
cs. CL
$$
](https://arxiv. org/abs/2506.01062). URL: [https://arxiv. org/abs/2506.01062](https://arxiv. org/abs/2506.01062).

[46] Long Phan et al. Humanity’s Last Exam. 2025. arXiv: [2501.14249 
$$
cs. LG
$$
](https://arxiv. org/abs/2501.14249). URL: [https://arxiv. org/abs/2501.14249](https://arxiv. org/abs/2501.14249).

[47] David Rein et al. “Gpqa: A graduate-level google-proof q&a benchmark”. In: First Conference on Language Modeling. 2024.

[48] Jonathan Roberts et al. ZeroBench: An Impossible Visual Benchmark for Contemporary Large Multimodal Models. 2025. arXiv: [2502.09696 
$$
cs. CV
$$
](https://arxiv. org/abs/2502.09696). URL: [https://arxiv. org/abs/2502.09696](https://arxiv. org/abs/2502.09696).

[49] Christoph Schuhmann et al. “Laion-5b: An open large-scale dataset for training next generation image-text models”. In: Advances in Neural Information Processing Systems 35 (2022), pp. 25278–25294.

[50] John Schulman et al. “Proximal Policy Optimization Algorithms”. In: arXiv preprint arXiv: 1707.06347 (2017). URL: [https://arxiv. org/abs/1707.06347](https://arxiv. org/abs/1707.06347).

<!-- page 18 of 31 -->

Kimi K2.5

TECHNICAL REPORT

[51] Tianhui Song et al. Towards Pixel-Level VLM Perception via Simple Points Prediction. 2026. arXiv: [2601.19228 
$$
cs. CV
$$
](https://arxiv. org/abs/2601.19228). URL: [https://arxiv. org/abs/2601.19228](https://arxiv. org/abs/2601.19228).

[52] Giulio Starace et al. “PaperBench: Evaluating AI’s Ability to Replicate AI Research”. In: arXiv preprint arXiv: 2504.01848 (2025).

[53] Kimi Team et al. “Kimi k2: Open agentic intelligence”. In: arXiv preprint arXiv: 2507.20534 (2025).

[54] Kimi Team et al. “Kimi-vl technical report”. In: arXiv preprint arXiv: 2504.07491 (2025).

[55] Meituan LongCat Team et al. “Longcat-flash-omni technical report”. In: arXiv preprint arXiv: 2511.00279 (2025).

[56] Minyang Tian et al. “Scicode: A research coding benchmark curated by scientists”. In: Advances in Neural Information Processing Systems 37 (2024), pp. 30624–30650.

[57] Shengbang Tong et al. Eyes Wide Shut? Exploring the Visual Shortcomings of Multimodal LLMs. 2024. arXiv: [2401.06209 
$$
cs. CV
$$
](https://arxiv. org/abs/2401.06209). URL: [https://arxiv. org/abs/2401.06209](https://arxiv. org/abs/2401.06209).

[58] Harvard-MIT Mathematics Tournament. Harvard-MIT Mathematics Tournament, February 2025. Held on February 15, 2025.2025. URL: [https://www. hmmt. org/www/archive/282](https://www. hmmt. org/www/archive/282).

[59] Ashish Vaswani et al. “Attention is All you Need”. In: Advances in Neural Information Processing Systems. Ed. by I. Guyon et al. Vol. 30. Curran Associates, Inc., 2017. URL: [https://proceedings. neurips. cc/paper\_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper. pdf](https://proceedings. neurips. cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper. pdf).

[60] Nikhita Vedula et al. DeepSearchQA: Bridging the Comprehensiveness Gap for Deep Research Agents. 2025. URL: [https : / / storage . googleapis . com / deepmind - media / DeepSearchQA / DeepSearchQA\_benchmark\_paper. pdf](https://storage. googleapis. com/deepmind-media/DeepSearchQA/DeepSearchQA_benchmark_paper. pdf).

[61] Ke Wang et al. Measuring Multimodal Mathematical Reasoning with MATH-Vision Dataset. 2024. arXiv: [2402.14804 
$$
cs. CV
$$
](https://arxiv. org/abs/2402.14804). URL: [https://arxiv. org/abs/2402.14804](https://arxiv. org/abs/2402.14804).

[62] Weihan Wang et al. LVBench: An Extreme Long Video Understanding Benchmark. 2025. arXiv: [2406.08035 
$$
cs. CV
$$
](https://arxiv. org/abs/2406.08035). URL: [https://arxiv. org/abs/2406.08035](https://arxiv. org/abs/2406.08035).

[63] Xinyuan Wang et al. OpenCUA: Open Foundations for Computer-Use Agents. 2025. arXiv: [2508.09123 
$$
cs. AI
$$
](https://arxiv. org/abs/2508.09123). URL: [https://arxiv. org/abs/2508.09123](https://arxiv. org/abs/2508.09123).

[64] Yubo Wang et al. MMLU-Pro: A More Robust and Challenging Multi-Task Language Understanding Benchmark. 2024. arXiv: [2406.01574 
$$
cs. CL
$$
](https://arxiv. org/abs/2406.01574). URL: [https://arxiv. org/abs/2406.01574](https://arxiv. org/abs/2406.01574).

[65] Zhexu Wang et al. “OJBench: A Competition Level Code Benchmark For Large Language Models”. In: arXiv preprint arXiv: 2506.16395 (2025).

[66] Zhun Wang et al. “CyberGym: Evaluating AI Agents’ Cybersecurity Capabilities with Real-World Vulnerabilities at Scale”. In: arXiv preprint arXiv: 2506.02548 (2025).

[67] Zirui Wang et al. CharXiv: Charting Gaps in Realistic Chart Understanding in Multimodal LLMs. 2024. arXiv: [2406.18521 
$$
cs. CL
$$
](https://arxiv. org/abs/2406.18521). URL: [https://arxiv. org/abs/2406.18521](https://arxiv. org/abs/2406.18521).

[68] Jason Wei et al. BrowseComp: A Simple Yet Challenging Benchmark for Browsing Agents. 2025. arXiv: [2504.12516 
$$
cs. CL
$$
](https://arxiv. org/abs/2504.12516). URL: [https://arxiv. org/abs/2504.12516](https://arxiv. org/abs/2504.12516).

[69] Ryan Wong et al. WideSearch: Benchmarking Agentic Broad Info-Seeking. 2025. arXiv: [2508 . 07999 
$$
cs. CL
$$
](https://arxiv. org/abs/2508.07999). URL: [https://arxiv. org/abs/2508.07999](https://arxiv. org/abs/2508.07999).

[70] Haoning Wu et al. LongVideoBench: A Benchmark for Long-context Interleaved Video-Language Understanding. 2024. arXiv: [2407.15754 
$$
cs. CV
$$
](https://arxiv. org/abs/2407.15754). URL: [https://arxiv. org/abs/2407.15754](https://arxiv. org/abs/2407.15754).

[71] Xixi Wu et al. ReSum: Unlocking Long-Horizon Search Intelligence via Context Summarization. 2025. arXiv: [2509.13313 
$$
cs. CL
$$
](https://arxiv. org/abs/2509.13313). URL: [https://arxiv. org/abs/2509.13313](https://arxiv. org/abs/2509.13313).

[72] Tianbao Xie et al. “Introducing OSWorld-Verified”. In: xlang. ai (July 2025). URL: [https://xlang. ai/blog/osworld-verified](https://xlang. ai/blog/osworld-verified).

[73] Tianbao Xie et al. OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments. 2024. arXiv: [2404.07972 
$$
cs. AI
$$
](https://arxiv. org/abs/2404.07972).

[74] Feng Yao et al. Your Efficient RL Framework Secretly Brings You Off-Policy RL Training. Aug. 2025. URL: [https://fengyao. notion. site/off-policy-rl](https://fengyao. notion. site/off-policy-rl).

[75] Xiang Yue et al. MMMU-Pro: A More Robust Multi-discipline Multimodal Understanding Benchmark. 2025. arXiv: [2409.02813 
$$
cs. CL
$$
](https://arxiv. org/abs/2409.02813). URL: [https://arxiv. org/abs/2409.02813](https://arxiv. org/abs/2409.02813).

[76] Xiang Yue et al. “MMMU: A Massive Multi-discipline Multimodal Understanding and Reasoning Benchmark for Expert AGI”. In: Proceedings of CVPR. 2024.

[77] Xiaohua Zhai et al. Sigmoid Loss for Language Image Pre-Training. 2023. arXiv: [2303.15343 
$$
cs. CV
$$
](https://arxiv. org/abs/2303.15343). URL: [https://arxiv. org/abs/2303.15343](https://arxiv. org/abs/2303.15343).

<!-- page 19 of 31 -->

Kimi K2.5

TECHNICAL REPORT

[78] Xin Zhao et al. Small Leak Can Sink a Great Ship–Boost RL Training on MoE with IcePop! Sept. 2025. URL: [https://ringtech. notion. site/icepop](https://ringtech. notion. site/icepop).

[79] Yilun Zhao et al. MMVU: Measuring Expert-Level Multi-Discipline Video Understanding. 2025. arXiv: [2501.12380 
$$
cs. CV
$$
](https://arxiv. org/abs/2501.12380). URL: [https://arxiv. org/abs/2501.12380](https://arxiv. org/abs/2501.12380).

[80] Shuyan Zhou et al. “WebArena: A Realistic Web Environment for Building Autonomous Agents”. In: arXiv preprint arXiv: 2307.13854 (2023). URL: [https://webarena. dev](https://webarena. dev).

[81] Wanrong Zhu et al. “Multimodal c4: An open, billion-scale corpus of images interleaved with text”. In: Advances in Neural Information Processing Systems 36 (2024).

(参考文献条目保留英文原文与链接, 数字与 arXiv 号不改.)

<!-- page 20 of 31 -->

Kimi K2.5

TECHNICAL REPORT

## A Contributors ## A 贡献者

The listing of authors is in alphabetical order based on their last names.



作者按姓氏字母顺序排列.

| Tongtong Bai | Xiaochen Gong | Jiawei Lin | Xiaoxi Song |
| --- | --- | --- | --- |
| Yifan Bai | Zhuoma Gongque | Xiaohan Lin | Hongjin Su |
| Yiping Bao | Qizheng Gu | Yibo Lin | Jianlin Su |
| S. H. Cai | Xinran Gu | Zhishan Lin | Zhaochen Su |
| Yuan Cao | Yicheng Gu | Zichao Lin | Lin Sui |
| Ziwei Chai | Longyu Guan | Cheng Liu | Jinsong Sun |
| Y. Charles | Shuhao Guan | Chenyu Liu | Junyao Sun |
| H. S. Che | Yuanying Guo | Hongzhang Liu | Tongyu Sun |
| Cheng Chen | Xiaoru Hao | Liang Liu | Flood Sung |
| Guanduo Chen | Dailan He | Shaowei Liu | Yunpeng Tai |
| Huarong Chen | Tianhong He | Shudong Liu | Chuning Tang |
| Jia Chen | Weiran He | Shuran Liu | Heyi Tang |
| Jianlong Chen | Wenyang He | Tianwei Liu | Xiaojuan Tang |
| Jun Chen | Yibo He | Tianyu Liu | Zhengyang Tang |
| Kefan Chen | Yunjia He | Weizhou Liu | Jiawen Tao |
| Liang Chen | Chao Hong | Xiangyan Liu | Shiyuan Teng |
| Ruijue Chen | Hao Hu | Yangyang Liu | Chaoran Tian |
| Xinhao Chen | Jiaxi Hu | Yanming Liu | Pengfei Tian |
| Yanru Chen | Yangyang Hu | Yibo Liu | Bowen Wang |
| Yanxu Chen | Zhenxing Hu | Yuanxin Liu | Chensi Wang |
| Yicun Chen | Ke Huang | Zhengying Liu | Chuang Wang |
| Yimin Chen | Ruiyuan Huang | Zhongnuo Liu | Congcong Wang |
| Yingjiang Chen | Weixiao Huang | Enzhe Lu | Dingkun Wang |
| Yuankun Chen | Zhiqi Huang | Haoyu Lu | Dinglu Wang |
| Yujie Chen | Chaobo Jia | Zhiyuan Lu | Dongliang Wang |
| Yutian Chen | Tao Jiang | G. Luo | Feng Wang |
| Zhirong Chen | Zhejun Jiang | Junyu Luo | Hailong Wang |
| Ziwei Chen | Xinyi Jin | Tongxu Luo | Haiming Wang |
| Dazhi Cheng | Yu Jing | Yashuo Luo | Hao Wang |
| Yean Cheng | Guokun Lai | Long Ma | Hengzhi Wang |
| Minghan Chu | Aidi Li | Shaoguang Mao | Huaqing Wang |
| Jialei Cui | C. Li | Yuan Mei | Hui Wang |
| Jiaqi Deng | Cheng Li | Xin Men | Jiahao Wang |
| Muxi Diao | Fang Li | Fanqing Meng | Jinhong Wang |
| Hao Ding | Guanghe Li | Zhiyong Meng | Jiuzheng Wang |
| Mengfan Dong | Guanyu Li | Yibo Miao | Kaixin Wang |
| Mengnan Dong | Haitao Li | Minqing Ni | Linian Wang |
| Yuxin Dong | Haoyang Li | Kun Ouyang | Qibin Wang |
| Yuhao Dong | Jia Li | Siyuan Pan | Shengjie Wang |
| Ang'ang Du | Jingwei Li | Bo Pang | Shuyi Wang |
| Chenzhuang Du | Junxiong Li | Yuchao Qian | Si Wang |
| Dikang Du | Lincan Li | Ruoyu Qin | Wei Wang |
| Lingxiao Du | Mo Li | Zeyu Qin | Xiaochen Wang |
| Yulun Du | Weihong Li | Jiezhong Qiu | Xinyuan Wang |
| Yu Fan | Wentao Li | Bowen Qu | Yao Wang |
| Shengjun Fang | Xinhang Li | Zeyu Shang | Yejie Wang |
| Qiulin Feng | Xinhao Li | Youbo Shao | Yipu Wang |
| Yichen Feng | Yang Li | Tianxiao Shen | Yiqin Wang |
| Garimugai Fu | Yanhao Li | Zhennan Shen | Yucheng Wang |
| Kelin Fu | Yiwei Li | Juanfeng Shi | Yuzhi Wang |
| Hongcheng Gao | Yuxiao Li | Lidong Shi | Zhaoji Wang |
| Tong Gao | Zhaowei Li | Shengyuan Shi | Zhaowei Wang |
| Yuyao Ge | Zhaoxi Li | Feifan Song | Zhengtao Wang |
| Shangyi Geng | Zheming Li | Pengwei Song | Zhexu Wang |
| Chengyang Gong | Weilong Liao | Tianhui Song | Zifan Wang |

<!-- page 21 of 31 -->

Kimi K2.5

TECHNICAL REPORT

Zihan Wang Zizhe Wang Chu Wei Ming Wei Chuan Wen Zichen Wen Chengjie Wu Haoning Wu Junyan Wu Rucong Wu Wenhao Wu Yuefeng Wu Yuhao Wu Yuxin Wu Zijian Wu Chenjun Xiao Jin Xie Xiaotong Xie Yuchong Xie Bowei Xing Boyu Xu Jianfan Xu Jing Xu Jinjing Xu L. H. Xu Lin Xu Suting Xu Weixin Xu Xinbo Xu Xinran Xu

Yangchuan Xu Yichang Xu Yuemeng Xu Zelai Xu Ziyao Xu Junjie Yan Yuzi Yan Guangyao Yang Hao Yang Junwei Yang Kai Yang Ningyuan Yang Xiaofei Yang Xinlong Yang Xinyu Yang Ying Yang Yi (弋) Yang Yi (翌) Yang Zhen Yang Zhilin Yang Zonghan Yang Haotian Yao Dan Ye Haoran Ye Wenjie Ye Zhuorui Ye Peng Yebo Bohong Yin Chengzhen Yu Longhui Yu

Tao Yu† Tianxiang Yu Enming Yuan Mengjie Yuan Xiaokun Yuan Yang Yue Weihao Zeng Dunyuan Zha Haobing Zhan Dehao Zhang Hao Zhang Jin Zhang Puqi Zhang Qiao Zhang Rui Zhang Xiaobin Zhang Xiaoyun Zhang Y. Zhang Yadong Zhang Yangkun Zhang Yichi Zhang Yizhi Zhang Yongting Zhang Yu Zhang Yushun Zhang Yutao Zhang Yutong Zhang Zheng Zhang Chenguang Zhao Feifan Zhao

Jinxiang Zhao Shuai Zhao Xiangyu Zhao Xuanle Zhao Yikai Zhao Zijia Zhao Huabin Zheng Ruihan Zheng Shaojie Zheng Tengyang Zheng Junfeng Zhong Longguang Zhong Weiming Zhong M. Zhou Runjie Zhou Xinyu Zhou Zaida Zhou Jinguo Zhu Liya Zhu Xinhao Zhu Yuxuan Zhu Zhen Zhu Jingze Zhuang Weiyu Zhuang Ying Zou Xinxing Zu Kimi K2 Kimi K2.5

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280">†The University of Hong Kong</span></small>



(贡献者名单保留英文原名与排序; † 标注香港大学.)

<!-- page 22 of 31 -->

Kimi K2.5

TECHNICAL REPORT

![Chart block](images/p22-figure-9-learning-curves-comparing-vision-to-text.png)

Figure 9: Learning curves comparing vision-to-text ratios (10: 90, 20: 80, 50: 50) under fixed vision-text token budget across vision and language tasks. Early fusion with lower vision ratios tend to yield better results.



图 9: 固定视觉–文本 token 预算下, 不同视觉: 文本比例(10: 90, 20: 80, 50: 50)在视觉与语言任务上的学习曲线. 早期融合且视觉比例较低者往往更好.

## B Pre-training ## B 预训练

### B. 1 Joint-Training ### B. 1 联合训练

We further provide the full training curves for all configurations in Figure 9. Notably, we observe a "dip-and-recover" pattern in text performance during mid-fusion and late-fusion stages: when vision data is first introduced, text capability initially degrades before gradually recovering. We attribute this to the modality domain shift-the sudden introduction of vision tokens disrupts the established linguistic representation space, forcing the model to temporarily sacrifice text-specific competence for cross-modal alignment.



图 9 给出各配置完整训练曲线. 中期融合与晚期融合阶段, 文本表现出现「先降后回」: 视觉数据刚引入时文本能力先掉再渐回. 归因于模态域偏移-- 突然加入视觉 token 扰动已建立的语言表示空间, 模型暂时牺牲文本专长来做跨模态对齐.

In contrast, early fusion maintains a healthier and more stable text performance curve throughout training. By co-optimizing vision and language from the outset, the model naturally evolves unified multimodal representations without the shock of late-stage domain migration. This suggests that early exposure not only prevents the representation collapse observed in late fusion but also facilitates smoother gradient landscapes for both modalities. Collectively, these findings reinforce our proposal of native multimodal pre-training: moderate vision ratios combined with early fusion yield superior convergence properties and more robust bi-modal competence under fixed token budgets.



相对地, 早期融合全程文本曲线更健康, 更稳: 从一开始共优化视觉与语言, 自然长出统一多模态表示, 没有晚期域迁移冲击. 说明早期暴露不仅避免晚期融合常见的表示塌缩, 也让两模态梯度景观更平滑. 合起来支持原生多模态预训练主张: 固定 token 预算下, 适中视觉比例 + 早期融合收敛更好, 双模态能力更稳.

### B. 2 Text data ### B. 2 文本数据

The Kimi K2.5 pre-training text corpus comprises curated, high-quality data spanning four primary domains: Web Text, Code, Mathematics, and Knowledge. Most data processing pipelines follow the methodologies outlined in Kimi K2 [53]. For each domain, we performed rigorous correctness and quality validation and designed targeted data experiments to ensure the curated dataset achieved both high diversity and effectiveness.



Kimi K2.5 预训练文本语料经策展, 高质量, 覆盖四主域: Web Text, Code, Mathematics, Knowledge. 多数处理流水沿 Kimi K2 [53]. 各域做严格正确性与质量校验, 并设计定向数据实验, 保证策展集兼具多样性与有效性.

**Enhanced Code Intelligence** We upweighted code-centric data, significantly expanding (1) repository-level code supporting cross-file reasoning and architectural understanding, (2) issues, code reviews and commit histories from the internet capturing real-world development patterns, and (3) code-related documents retrieved from PDF and webtext corpora. These efforts strengthen repository-level comprehension for complex coding tasks, improve performance on agentic coding subtasks such as patch generation and unit test writing, and enhance code-related knowledge capabilities.



**增强代码智能** 上调代码向数据权重, 显著扩展: (1) 支持跨文件推理与架构理解的仓库级代码; (2) 互联网上的 issues, code review 与 commit 历史, 捕捉真实开发模式; (3) 从 PDF 与网页文本检索的代码相关文档. 这些加强复杂编码的仓库级理解, 抬升补丁生成, 单测编写等智能体编码子任务, 并增强代码相关知识能力.

<!-- page 23 of 31 -->

Kimi K2.5

TECHNICAL REPORT

### B. 3 Vision data ### B. 3 视觉数据

Our multimodal pre-training corpus includes seven categories: caption, interleaving, OCR, knowledge, perception, video, and agent data. Caption data [49, 19] provides fundamental modality alignment, with strict limits on synthetic captions to mitigate hallucination. Image-text interleaving data from books, web pages, and tutorials [81, 32] enables multi-image comprehension and longer context learning. OCR data spans multilingual text, dense layouts, and multi-page documents. Knowledge data incorporates academic materials processed via layout parsers to develop visual reasoning capabilities.



多模态预训练语料含七类: caption, interleaving, OCR, knowledge, perception, video, agent. Caption 数据 [49, 19] 提供基础模态对齐, 并对合成字幕严格限量以缓解幻觉. 来自书, 网页, 教程的图文交错 [81, 32] 支撑多图理解与更长上下文学习. OCR 覆盖多语文本, 稠密版式与多页文档. Knowledge 纳入经版面解析器处理的学术材料, 以发展视觉推理.

Furthermore, we curate a specialized multimodal problem-solving corpus to bolster reasoning within Science, Technology, Engineering, and Mathematics domains. This data is aggregated through targeted retrieval and web crawling; for informational content lacking explicit query formats, we employ in-context learning [11] to automatically reformulate raw materials into structured academic problems spanning K-12 to university levels. To bridge the modality gap between visual layouts and code data, we incorporate extensive image-code paired data. This includes a diverse array of code formats-such as HTML, React, and SVG, among others-paired with their corresponding rendered screenshots, enabling the model to align abstract structural logic with concrete visual geometry.



另策展专门的多模态解题语料, 加强 STEM 域推理. 经定向检索与爬取汇总; 对缺少显式查询格式的信息内容, 用 in-context learning [11] 自动改写成结构化学术题, 覆盖 K-12 到大学. 为弥合视觉版式与代码数据的模态鸿沟, 纳入大量图–代码对: HTML, React, SVG 等多样格式配对应渲染截图, 让模型对齐抽象结构逻辑与具体视觉几何.

For agentic and temporal understanding, we collect GUI screenshots and action trajectories across desktop, mobile, and web environments, including human-annotated demonstrations. Video data from diverse sources enables both hourlong video comprehension and fine-grained spatio-temporal perception. Additionally, we incorporate grounding data to enhance fine-grained visual localization, including perception annotations (bounding boxes), point-based references. We also introduce a new contour-level segmentation task [51] for pixel-level perception learning. All data undergoes rigorous filtering, deduplication, and quality control to ensure high diversity and effectiveness.



智能体与时序理解方面, 采集桌面, 移动, Web 环境的 GUI 截图与动作轨迹, 含人工标注演示. 多样来源视频支撑小时级视频理解与细粒度时空感知. 另纳入 grounding 数据加强细粒度定位, 含感知标注(bbox)与基于点的引用; 并引入轮廓级分割新任务 [51] 做像素级感知学习. 全部数据经严格过滤, 去重与质控, 保证高多样性与有效性.

## C Infra ## C 基础设施

Kimi K2.5 is trained on NVIDIA H800 GPU clusters with 8×400 Gbps RoCE interconnects across nodes. We employ a flexible parallelism strategy combining 16-way Pipeline Parallelism (PP) with virtual stages [27, 40], 16-way Expert Parallelism (EP) [33], and ZeRO-1 Data Parallelism, enabling training on any number of nodes that is a multiple of 32. EP all-to-all communication is overlapped with computation under interleaved 1F1B scheduling. To fit activations within GPU memory constraints, we apply selective recomputation for LayerNorm, SwiGLU, and MLA up-projections, compress insensitive activations to FP8-E4M3, and offload remaining activations to CPU with overlapped streaming.



Kimi K2.5 在 NVIDIA H800 GPU 集群上训练, 节点间 8×400 Gbps RoCE. 并行策略灵活: 16-way PP 配 virtual stages [27, 40], 16-way EP [33], ZeRO-1 DP, 可在节点数为 32 倍数的任意规模上训. 交错 1F1B 调度下 EP all-to-all 与计算重叠. 为把激活塞进 GPU 显存: 对 LayerNorm, SwiGLU, MLA 上投影做选择性重算; 不敏感激活压到 FP8-E4M3; 其余激活卸载到 CPU 并重叠流式搬运.

### C. 1 Data Storage and Loading ### C. 1 数据存储与加载

We employ S3 [3] compatible object storage solutions from cloud providers to house our VLM datasets. To bridge the gap between data preparation and model training, we retain visual data in its native format and have engineered a highly efficient and adaptable data loading infrastructure. This infrastructure offers several critical advantages:



用云厂商 S3 [3] 兼容对象存储存放 VLM 数据集. 为衔接数据准备与模型训练, 视觉数据保留原生格式, 并工程化高效, 可适配的数据加载基础设施, 关键优势包括:

• **Flexibility:** Facilitates dynamic data shuffling, blending, tokenization, loss masking, and sequence packing throughout the training process, enabling adjustable data ratios as requirements evolve;



• **灵活性:** 训练全程支持动态 shuffle, 混合, 分词, loss masking, 序列 packing, 可随需求调整数据比例;

• **Augmentation:** Allows for stochastic augmentation of both visual and textual modalities, while maintaining the integrity of 2D spatial coordinates and orientation metadata during geometric transformations;



• **增强:** 支持视觉与文本模态随机增强, 几何变换时保持 2D 空间坐标与朝向元数据完整;

• **Determinism:** Guarantees fully deterministic training through meticulous management of random seeds and worker states, ensuring that any training interruption can be resumed seamlessly - the data sequence after resumption remains identical to an uninterrupted run;



• **确定性:** 精细管理随机种子与 worker 状态, 保证完全确定训练; 中断后可无缝续训-- 续训后数据序列与未中断跑完全一致;

• **Scalability:** Achieves superior data loading throughput via tiered caching mechanisms, robustly scaling to large distributed clusters while regulating request frequency to object storage within acceptable bounds.



• **可扩展性:** 分层缓存提高加载吞吐, 稳健扩到大型分布式集群, 同时把对象存储请求频率控在可接受范围.

Furthermore, to uphold uniform dataset quality standards, we have built a unified platform overseeing data registration, visualization, statistical analysis, cross-cloud synchronization, and lifecycle governance.



另建统一平台管数据注册, 可视化, 统计分析, 跨云同步与生命周期治理, 以维持统一数据质量标准.

## D Unified Agentic Reinforcement Learning Environment ## D 统一智能体强化学习环境

**Environment** To support unified Agentic RL, our RL framework features a standardized Gym-like [10] interface to streamline the implementation of diverse environments. Such design empowers users to implement and customize



**环境** 为支撑统一 Agentic RL, RL 框架提供标准化 Gym 风格 [10] 接口, 简化多样环境实现. 该设计让用户实现与定制

<!-- page 24 of 31 -->

Kimi K2.5

TECHNICAL REPORT

![Image block](images/p24-figure-10-overview-of-our-agentic-rl-framework.png)

Figure 10: Overview of our agentic RL framework.



图 10: 智能体 RL 框架总览.

environments with minimal overhead. Our design prioritizes compositional modularity by integrating a suite of plug gable components, such as a Toolset module for supporting various tools with sandboxes, a Judge module for multi-faceted reward signals, and specialized modules for prompt diversification and instruction-following enhancement. These components can be dynamically composed with core agent loops, offering high flexibility and enhancing model generalization.



环境, 开销最小. 设计强调组合模块化: 可插拔组件包括带沙箱的 Toolset, 多面奖励信号的 Judge, 以及提示多样化与指令跟随增强等专用模块. 这些组件可与核心智能体环动态组合, 灵活性高并增强泛化.

At the execution level, our RL framework treats every agent task as an independent asynchronous coroutine. Each task can recursively trigger sub-task rollouts, simplifying the implementation of complex multi-agent paradigms such as Parallel-Agent RL and Agent-as-Judge. As shown in the figure 10, a dedicated Rollout Manager orchestrates up to 100, 000 concurrent agent tasks during the RL process, providing fine-grained control to enable features like partial rollout [31]. Upon activation, each task acquires an environment instance from a managed pool, equipped with a sandbox and specialized tools.



执行层把每个智能体任务当独立异步协程; 任务可递归触发子任务 rollout, 简化 Parallel-Agent RL, Agent-as-Judge 等复杂多智能体范式. 如图 10, 专用 Rollout Manager 在 RL 过程中编排多达 100, 000 个并发智能体任务, 精细控制以支持 partial rollout [31] 等. 激活后, 各任务从托管池取环境实例, 配沙箱与专用工具.

**Inference Engine Co-design** Our framework strictly follows a Token-in-Token-out paradigm. We also record log probabilities for all inference engine outputs to perform train-inference mismatch correction, ensuring stable RL training. A co-design of inference engine for RL requirements has allowed us to support these features by custom inference APIs for RL.



**推理引擎协同设计** 框架严格遵循 Token-in-Token-out. 对推理引擎全部输出记录 log 概率, 做 train–inference mismatch 校正, 保证 RL 训练稳定. 面向 RL 需求的推理引擎协同设计, 经定制推理 API 支撑这些能力.

Besides a comprehensive suite of built-in white-box environments, there are also black-box environments that can only run under standard LLM API protocol, missing the opportunity to use advanced features offered by our custom API protocol. To facilitate model optimization under black-box environments, we developed LLM Gateway, which is a proxy service that keeps detailed records of rollout requests and responses under our custom protocol.



除完整内建白盒环境外, 还有只能跑标准 LLM API 协议的黑盒环境, 用不上定制 API 的高级特性. 为在黑盒环境下优化模型, 开发 LLM Gateway: 代理服务, 按定制协议详细记录 rollout 请求与响应.

**Monitoring and debugging** It is a challenging task to optimize performance of a highly-parallel asynchronous execution system, while ensuring correctness. We develop a series of tools for performance monitoring, profiling, data visualization and data verification. We found these to be instrumental in debugging and ensuring both the efficiency and correctness of our Agentic RL.



**监控与调试** 在保证正确性的同时优化高度并行异步执行系统的性能很难. 他们开发性能监控, profiling, 数据可视化与数据校验等工具, 对调试并保证 Agentic RL 的效率与正确性很关键.

## E Evaluation Settings ## E 评测设定

This section provides comprehensive configuration details and testing protocols for all benchmarks reported in Table 4.



本节给出表 4 全部基准的完整配置与测试协议.

### E. 1 General Evaluation Protocol ### E. 1 通用评测协议

Unless explicitly stated otherwise, all experiments for Kimi-K2.5 adhere to the following hyperparameter configuration:



除非明确另说, Kimi-K2.5 全部实验遵循以下超参:

• **Temperature:** 1.0



• **Temperature:** 1.0

• **Top-p:** 0.95



• **Top-p:** 0.95

• **Context Length:** 256k tokens



• **上下文长度:** 256k tokens

<!-- page 25 of 31 -->

Kimi K2.5

TECHNICAL REPORT

### E. 2 Baselines ### E. 2 基线

For baseline models, we report results under their respective high-performance reasoning configurations:



基线模型按其各自高性能推理配置报分:

• **Claude Opus 4.5:** Extended thinking mode



• **Claude Opus 4.5:** Extended thinking 模式

• **GPT-5.2:** Maximum reasoning effort (xhigh)



• **GPT-5.2:** 最大推理力度(xhigh)

• **Gemini 3 Pro:** High thinking level



• **Gemini 3 Pro:** High thinking level

• **DeepSeek-V3.2:** Thinking mode enabled (for text-only benchmarks)



• **DeepSeek-V3.2:** 开启 thinking(仅文本基准)

• **Qwen3-VL-235B-A22B:** Thinking mode (for vision benchmarks only)



• **Qwen3-VL-235B-A22B:** Thinking 模式(仅视觉基准)

For vision and multimodal benchmarks, GPT-5.2-xhigh exhibited an approximate 10% failure rate (i. e., no output generated despite three retry attempts) during vision evaluations. These failures were treated as incorrect predictions, meaning that the reported scores may be conservative lower bounds of the model’s true capability.



视觉与多模态基准上, GPT-5.2-xhigh 在视觉评测中约有 10% 失败率(三次重试仍无输出). 失败记作错误预测, 故报告分数可能是真实能力的保守下界.

In addition, because we were unable to consistently access a stable GPT-5.2 API, we skipped some benchmarks with high evaluation costs, such as WideSearch.



另因无法稳定访问 GPT-5.2 API, 跳过部分高评测成本基准, 如 WideSearch.

### E. 3 Text Benchmarks ### E. 3 文本基准

**Reasoning Benchmarks.** For high-complexity reasoning benchmarks, including HLE-Full, AIME 2025, HMMT 2025, GPQA-Diamond, and IMO-AnswerBench, we enforce a maximum completion budget of 96k tokens to ensure sufficient reasoning depth. To reduce variance arising from stochastic reasoning paths, results on AIME 2025 and HMMT 2025 (Feb) are averaged over 64 independent runs (Avg@64), while GPQA-Diamond is averaged over 8 runs (Avg@8).



**推理基准.** 对高复杂度推理基准(HLE-Full, AIME 2025, HMMT 2025, GPQA-Diamond, IMO-AnswerBench), 最大补全预算 96k tokens, 保证推理深度. 为降低随机推理路径方差, AIME 2025 与 HMMT 2025 (Feb) 取 64 次独立运行平均(Avg@64), GPQA-Diamond 取 8 次(Avg@8).

**LongBench v2.** For a fair comparison, we standardize all input contexts to approximately 128k tokens using the same truncation strategy as in [9]. We observe that GPT5.2-xhigh frequently produces free-form question–answer style responses rather than the required multiple-choice format. Therefore, we report results using GPT5.2-high, which consistently adheres to the expected output format.



**LongBench v2.** 为公平, 用与 [9] 相同截断策略, 把全部输入上下文标准化到约 128k tokens. 观察到 GPT5.2-xhigh 常出自由问答而非要求的选择题格式, 故改报 GPT5.2-high, 其更稳定遵循预期输出格式.

### E. 4 Image and Video Benchmarks ### E. 4 图像与视频基准

All image and video understanding evaluations utilize the following configuration:



全部图像与视频理解评测用如下配置:

• **Maximum Tokens:** 64k



• **最大 Tokens:** 64k

• **Sampling:** Averaged over 3 independent runs (Avg@3)



• **采样:** 3 次独立运行平均(Avg@3)

**ZeroBench (w/ tools).** Multi-step reasoning evaluations use constrained step-wise generation:



**ZeroBench(有工具).** 多步推理评测用约束逐步生成:

• **Max Tokens per Step:** 24k



• **每步最大 Tokens:** 24k

• **Maximum Steps:** 30



• **最大步数:** 30

**MMMU-Pro.** We adhere strictly to the official evaluation protocol: input order is preserved for all modalities, with images prepended to text sequences as specified in the benchmark guidelines.



**MMMU-Pro.** 严格按官方协议: 各模态输入顺序保留, 按基准指南把图像前置到文本序列.

**Sampling Strategies for Video Benchmarks.** For short video benchmarks (VideoMMMU, MMVU & Motion-Bench), we sample 128 uniform input frames with a maximum spatial resolution at 896; 2048 uniform frames are sampled for long video benchmarks (Video-MME, LongVideoBench & LVBench) with 448 spatial resolution.



**视频基准采样策略.** 短视频基准(VideoMMMU, MMVU, MotionBench)均匀采 128 帧, 空间分辨率上限 896; 长视频基准(Video-MME, LongVideoBench, LVBench)均匀采 2048 帧, 空间分辨率 448.

**Specialized Metrics.**



**专用指标.**

• **OmniDocBench 1.5:** Scores are computed as (1 − normalized Levenshtein distance) × 100, where higher values indicate superior OCR and document understanding accuracy.



• **OmniDocBench 1.5:** 分数 = (1 − 归一化 Levenshtein 距离) × 100, 越高表示 OCR 与文档理解越好.

• **WorldVQA:** Access available at [https://github. com/MoonshotAI/WorldVQA](https://github. com/MoonshotAI/WorldVQA). This benchmark evaluates atomic, vision-centric world knowledge requiring fine-grained visual recognition and geographic understanding.



• **WorldVQA:** 见 [https://github. com/MoonshotAI/WorldVQA](https://github. com/MoonshotAI/WorldVQA). 评原子级, 视觉中心的世界知识, 需细粒度视觉识别与地理理解.

<!-- page 26 of 31 -->

Kimi K2.5

TECHNICAL REPORT

### E. 5 Coding and Software Engineering ### E. 5 编码与软件工程

**Terminal Bench 2.0.** All scores are obtained using the default Terminus-2 agent framework with the provided JSON parser. Notably, we evaluate under **non-thinking mode** because our current context management implementation for thinking mode is technically incompatible with Terminus-2’s conversation state handling.



**Terminal Bench 2.0.** 全部分数用默认 Terminus-2 智能体框架与所提供 JSON 解析器. 注意在 **non-thinking 模式** 下评测, 因当前 thinking 模式的上下文管理实现与 Terminus-2 对话状态处理技术不兼容.

**SWE-Bench Series.** We employ an internally developed evaluation framework featuring a minimal tool set: bash, create\_file, insert, view, str\_replace, and submit. System prompts are specifically tailored for repository-level code manipulation. Peak performance is achieved under **non-thinking mode** across all SWE-Bench variants (Verified, Multilingual, and Pro).



**SWE-Bench 系列.** 用内部评测框架, 工具集最小: bash, create_file, insert, view, str_replace, submit. 系统提示专为仓库级代码操作定制. 各 SWE-Bench 变体(Verified, Multilingual, Pro)峰值均在 **non-thinking 模式**.

**CyberGym.** Claude Opus 4.5 results for this benchmark are reported under non-thinking settings as specified in their technical documentation. We report scores in the difficulty level 1 (the primary setting).



**CyberGym.** Claude Opus 4.5 按技术文档在 non-thinking 设定下报分. 我们报难度 1(主设定)分数.

**PaperBench.** We report the scores under the CodeDev setting.



**PaperBench.** 报 CodeDev 设定下分数.

**Sampling.** All coding task results are averaged over 5 independent runs (Avg@5) to ensure stability across environment initialization and non-deterministic test case ordering.



**采样.** 全部编码任务结果取 5 次独立运行平均(Avg@5), 以稳定环境初始化与非确定测试用例顺序带来的波动.

### E. 6 Agentic Evaluation ### E. 6 智能体评测

**Tool Setting.** Kimi-K2.5 is equipped with web search tool, code interpreter (Python execution environment), and web browsing tools for all agentic evaluations, including HLE with tools and agentic search benchmarks (BrowseComp, WideSearch, DeepSearchQA, FinSearchComp T2&T3 and Seal-0).



**工具设定.** 全部智能体评测(含带工具 HLE 与智能体搜索基准 BrowseComp, WideSearch, DeepSearchQA, FinSearchComp T2&T3, Seal-0)为 Kimi-K2.5 配备网页搜索, 代码解释器(Python 执行环境)与网页浏览工具.

**Context Management Strategies.** To handle the extended trajectory lengths inherent in complex agentic tasks, we implement domain-specific context management protocols. Unless otherwise specified below, **no context management** is applied to agentic evaluations; tasks exceeding the model’s supported context window are directly counted as failures rather than truncated.



**上下文管理策略.** 复杂智能体任务轨迹很长, 故实现域特定上下文管理协议. 除非下文另说, 智能体评测 **不做上下文管理**; 超出模型支持窗口的任务直接计失败, 而非截断.

• **Humanity’s Last Exam (HLE).** For the HLE tool-augmented setting, we employ a Hide-Tool-Result Context Management strategy: when the context length exceeds predefined thresholds, only the most recent round of tool messages (observations and return values) is retained, while the reasoning chain and thinking processes from all previous steps are preserved in full.



• **Humanity’s Last Exam (HLE).** 带工具设定用 Hide-Tool-Result: 上下文超阈值时, 只保留最近一轮工具消息(观测与返回值), 此前各步推理链与 thinking 过程完整保留.

• **BrowseComp.** For BrowseComp evaluations, our evaluation contains both with and without context management settings. Under the context management setting, we adopt the same discard-all strategy proposed by DeepSeek, where all history is truncated once token thresholds are exceeded.



• **BrowseComp.** 含有/无上下文管理两设定. 有管理时采用 DeepSeek 提出的 discard-all: 一旦超 token 阈值, 截断全部历史.

**System Prompt.** All agentic search and HLE evaluations utilize the following unified system prompt, where DATE is dynamically set to the current timestamp:



**系统提示.** 全部智能体搜索与 HLE 评测用如下统一系统提示, DATE 动态设为当前时间戳:

```txt
You are Kimi, today's date: DATE.
Your task is to help the user with their questions by using various tools, thinking deeply, and ultimately answering the user's questions.

Please follow the following principles strictly during the deep research:
1. Always focus on the user's original question during the research process, avoiding deviating from the topic.
2. When facing uncertain information, use search tools to confirm.
3. When searching, filter high-trust sources (such as authoritative websites, academic databases, and professional media) and maintain a critical mindset towards low-trust sources.
4. When performing numerical calculations, prioritize using programming tools to ensure accuracy.
5. Please use the format [^index^] to cite any information you use.
6. This is a **Very Difficult** problem--do not underestimate it. You must use tools to help your reasoning and then solve the problem.
7. Before you finally give your answer, please recall what the question is asking for.
```



(系统提示原文保留英文; 意译要点: 以工具做深度研究, 聚焦原问, 不确定则搜索, 优先高信任源, 数值优先编程工具, 用 `[^index^]` 引用, 题很难必须用工具, 答前回顾题意.)

<!-- page 27 of 31 -->

Kimi K2.5

TECHNICAL REPORT

**Sampling Protocol.** To account for the inherent stochasticity in search engine result rankings and dynamic web content availability, results for Seal-0 and WideSearch are averaged over 4 independent runs (Avg@4). All other agentic benchmarks are evaluated under single-run protocols unless explicitly stated otherwise.



**采样协议.** 搜索引擎排序与网页内容可用性天生随机, 故 Seal-0 与 WideSearch 取 4 次独立运行平均(Avg@4). 其余智能体基准除非另说, 单次运行.

### E. 7 Computer-Use Evaluation ### E. 7 计算机使用评测

**Hyperparameter Settings.** We set max\_steps\_per\_episode = 100 for all experiments, with temperature = 0 for OSWorld-Verified and temperature = 0.1 for WebArena. Due to resource constraints, all models are evaluated in a one-shot setting. Adhering to the OpenCUA configuration [63], the agent context includes the last 3 history images, the complete thought history, and the task instruction. For WebArena, we manually corrected errors in the evaluation scripts and employed GPT-4o as the judge model for the fuzzy\_match function. To ensure fair comparison, Claude Opus 4.5 is evaluated solely with computer-use tools (excluding browser tools), a departure from the System Card configuration [6].



**超参设定.** 全部实验 max_steps_per_episode = 100; OSWorld-Verified temperature = 0, WebArena temperature = 0.1. 资源所限, 全部模型 one-shot. 按 OpenCUA 配置 [63], 智能体上下文含最近 3 张历史图, 完整 thought 历史与任务指令. WebArena 手工修正评测脚本错误, fuzzy_match 用 GPT-4o 当裁判. 为公平, Claude Opus 4.5 仅用计算机使用工具(不含浏览器工具), 与 System Card 配置 [6] 不同.

**System Prompt** We utilize a unified system prompt for all computer use tasks:



**系统提示** 全部计算机使用任务用统一系统提示:

```jsonl
You are a GUI agent. You are given an instruction, a screenshot of the screen and your previous interactions with the computer. You need to perform a series of actions to complete the task. The password of the computer is {password}.

For each step, provide your response in this format:
{thought}
## Action:
{action}
## Code:
{code}

In the code section, the code should be either pyautogui code or one of the following functions wrapped in the code block:
- {"name": "computer. wait", "description": "Make the computer wait for 20 seconds for installation, running code, etc.", "parameters": {"type": "object", "properties": {}, "required": []}}
- {"name": "computer. terminate", "description": "Terminate the current task and report its completion status", "parameters": {"type": "object", "properties": {"status": {"type": "string", "enum": ["success", "failure"], "description": "The status of the task"}, "answer": {"type": "string", "description": "The answer of the task"}}, "required": ["status"]}}
```



(GUI 智能体系统提示保留英文; 每步输出 thought / Action / Code; Code 为 pyautogui 或 `computer. wait` / `computer. terminate`.)

### E. 8 Agent Swarm Configuration ### E. 8 Agent Swarm 配置

**Tool Setting.** In addition to the core toolset described in Appendix E. 6 (web search, code interpreter, and web browsing), the orchestrator is equipped with two specialized tools for sub-agent creation and scheduling:



**工具设定.** 除附录 E. 6 核心工具集(网页搜索, 代码解释器, 网页浏览)外, 编排器另有两个专用工具创建与调度子智能体:

• create\_subagent: Instantiates a specialized sub-agent with a custom system prompt and identifier for reuse across tasks.



• create_subagent: 用定制系统提示与标识实例化特化子智能体, 可跨任务复用.

• assign\_task: Dispatches assignments to created sub-agents.



• assign_task: 向已创建子智能体分派任务.

The tool schemas are provided below:



工具 schema 如下:

```json
{
  "name": "create_subagent",
  "description": "Create a custom subagent with specific system prompt and name for reuse.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Unique name for this agent configuration"
      },
      "system_prompt": {
        "type": "string",
```

<!-- page 28 of 31 -->

Kimi K2.5

TECHNICAL REPORT

```jsonl
"description": "System prompt defining the agent's role,
                capabilities, and boundaries"
        }
    },
    "required": ["name", "system_prompt"]
}
}
{
  "name": "assign_task",
  "description": "Launch a new agent. \nUsage notes: \n
    1. You can launch multiple agents concurrently whenever possible,
           to maximize performance; \n
    2. When the agent is done, it will return a single message back to you.",
  "parameters": {
    "type": "object",
    "properties": {
      "agent": {
        "type": "string",
        "description": "Specify which created agent to use."
      },
      "prompt": {
        "type": "string",
        "description": "The task for the agent to perform"
      }
    },
    "required": ["agent", "prompt"]
  }
}
```



(`create_subagent` / `assign_task` schema 保留英文; 要点: 可并发启动多个子智能体; 完成后回传单条消息.)

**Step Limits.** When operating in Agent Swarm mode, we set computational budgets for the orchestrator and subagents. Step limits apply to the aggregate count of tool invocations and environment interactions.



**步数限制.** Agent Swarm 模式下为编排器与子智能体设计算预算. 步数限制作用于工具调用与环境交互的合计次数.

• **BrowseComp:** The orchestrator is constrained to a maximum of 15 steps. Each spawned sub-agent operates under a limit of 100 steps (i. e., up to 100 tool calls per sub-agent).



• **BrowseComp:** 编排器最多 15 步; 每个子智能体最多 100 步(即每子智能体最多 100 次工具调用).

• **WideSearch:** Both the orchestrator and each sub-agent are allocated a maximum budget of 100 steps.



• **WideSearch:** 编排器与每个子智能体各最多 100 步.

• **In-house Bench:** The orchestrator is constrained to a maximum of 100 steps. Each spawned sub-agent operates under a limit of 50 steps .



• **内部 Bench:** 编排器最多 100 步; 每个子智能体最多 50 步.

#### System Prompt.



#### 系统提示.

```txt
You are Kimi, a professional and meticulous expert in information collection and organization.
You fully understand user needs, skillfully use various tools, and complete tasks with the highest efficiency.
# Task Description
After receiving users' questions, you need to fully understand their needs and think about and plan how to complete the tasks efficiently and quickly.
# Available Tools
To help you complete tasks better and faster, I have provided you with the following tools:
1. Search tool: You can use the search engine to retrieve information, supporting multiple queries in parallel.
2. Browser tools: You can visit web links (web pages, PDFs, etc.), get page content, and perform interactions such as clicking, inputting, finding, and scrolling.
3. Sub Agent tools:
- 'create_subagent': Create a new sub-agent with a unique name and clear, specific system prompt.
- 'assign_task': Delegate tasks to created sub-agents. Sub-agents can also use search and browser tools.
4. Other tools: Including code execution (IPython, Shell).
```



(编排器系统提示保留英文; 意译: 信息搜集与整理专家; 工具含搜索, 浏览器, create_subagent / assign_task, IPython/Shell 代码执行.)

### E. 9 GDPVal



### E. 9 GDPVal

We cite the GDPVal-AA evaluation by Artificial Analysis, and the scores reported in Table 4 reflect the official leaderboard metrics as of January 28, 2026.



引用 Artificial Analysis 的 GDPVal-AA 评测; 表 4 分数为截至 2026 年 1 月 28 日官方排行榜指标.

<!-- page 29 of 31 -->

Kimi K2.5

TECHNICAL REPORT

![Image block](images/p29-figure-11-qualitative-example-of-kimi-k2-5-analyzing-a.png)

Figure 11: Qualitative example of Kimi K2.5 analyzing a complete playthrough of Black Myth: Wukong (24 hours of continuous gameplay across 32 videos at 1080p) using parallel visual agents. See [generated webpage](https://statics. moonshot. cn/k25-vibe-cases/blackmyth-wukong/index. html) and [source videos](https://www. bilibili. com/video/BV1dbyaBZE8n/) (all rights reserved by source authors).



图 11: 定性例子--Kimi K2.5 用并行视觉智能体分析「黑神话: 悟空」完整通关录像(32 段 1080p 视频, 连续游戏约 24 小时). 见 [生成网页](https://statics. moonshot. cn/k25-vibe-cases/blackmyth-wukong/index. html) 与 [源视频](https://www. bilibili. com/video/BV1dbyaBZE8n/)(版权归源作者).

<!-- page 30 of 31 -->

Kimi K2.5

TECHNICAL REPORT

![Image block](images/p30-figure-12-qualitative-examples-of-kimi-k2-5-solving.png)

Figure 12: Qualitative examples of Kimi K2.5 solving visual reasoning tasks via tool use.



图 12: Kimi K2.5 经工具使用解视觉推理任务的定性例子.

<!-- page 31 of 31 -->

Kimi K2.5

TECHNICAL REPORT

## F Visualization ## F 可视化

Figure 11 demonstrates our Agent Swarm tackling a challenging long-form video understanding task: analyzing a complete playthrough of Black Myth: Wukong (24 hours of continuous gameplay across 32 videos, totaling 40GB). The system employs a hierarchical multi-agent architecture where a Main Agent orchestrates parallel Sub Agents to process individual video segments independently. Each sub agent performs frame extraction, temporal event analysis, and key moment identification (e. g., boss fights, level-ups). The Main Agent subsequently aggregates these distributed analyses to synthesize a comprehensive HTML showcase featuring chronological timelines, embedded video clips, and interactive visualizations. This example demonstrates the system’s ability to handle massive-scale multimodal content through parallelization while maintaining coherent long-context understanding.



图 11 展示 Agent Swarm 处理困难长视频理解: 分析「黑神话: 悟空」完整通关(32 段视频, 连续游戏约 24 小时, 共约 40GB). 系统用层级多智能体: Main Agent 编排并行 Sub Agent, 各自独立处理视频片段; 子智能体做抽帧, 时序事件分析与关键时刻识别(如 boss 战, 升级). Main Agent 再聚合分布式分析, 合成含时间线, 嵌入片段与交互可视化的 HTML 展示. 例子说明: 经并行化可处理海量多模态内容, 同时保持连贯长上下文理解.

Figure 12 presents qualitative examples of Kimi K2.5 solving diverse visual reasoning tasks via tool-augmented reasoning. The model demonstrates: (1) Maze Solving-processing binary image segmentation and implementing pathfinding algorithms (BFS) to navigate complex mazes; (2) Pie Chart Analysis-performing pixel-level color segmentation and geometric calculations to determine precise area proportions; and (3) Spot-the-Difference-employing computer vision techniques to detect pixel-level discrepancies between image pairs. These examples highlight the model’s capability to decompose complex visual problems into executable code, iteratively refine strategies based on intermediate results, and synthesize precise answers through quantitative visual analysis.



图 12 给出经工具增强推理解多样视觉推理任务的定性例子. 模型展示:(1) 迷宫-- 二值分割 + 寻路(BFS)穿复杂迷宫; (2) 饼图-- 像素级颜色分割与几何计算精确面积比例; (3) 找不同-- 计算机视觉检图像对像素级差异. 这些例子突出: 把复杂视觉题拆成可执行代码, 按中间结果迭代 refining 策略, 经定量视觉分析综合出精确答案.

31

