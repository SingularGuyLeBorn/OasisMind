---
title: "GLM-4.5V 与 GLM-4.1V-Thinking · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-4.5V 与 GLM-4.1V-Thinking 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 42 -->

arXiv:2507.01006v6 [cs.CV] 1 Jan 2026

arXiv 编号 2507.01006, 第 6 版, 分类 cs.CV, 日期 2026 年 1 月 1 日.

# GLM-4.5V and GLM-4.1V-Thinking: Towards Versatile Multimodal Reasoning with Scalable Reinforcement Learning

GLM-4.5V 与 GLM-4.1V-Thinking: 借助可扩展的强化学习走向通用多模态推理

**GLM-V Team**

GLM-V 团队

Zhipu AI & Tsinghua University

智谱 AI 与清华大学

(For the complete list of authors, please refer to the Contribution section)

(完整作者名单见 Contribution 一节.)

## Abstract

We present GLM-4.1V-Thinking, GLM-4.5V, and GLM-4.6V, a family of visionlanguage models (VLMs) designed to advance general-purpose multimodal understanding and reasoning. In this report, we share our key findings in the development of the reasoning-centric training framework. We first develop a capable vision foundation model with significant potential through large-scale pre-training, which arguably sets the upper bound for the final performance. We then propose Reinforcement Learning with Curriculum Sampling (**RLCS**) to unlock the full potential of the model, leading to comprehensive capability enhancement across a diverse range of tasks, including STEM problem solving, video understanding, content recognition, coding, grounding, GUI-based agents, and long document interpretation. In a comprehensive evaluation across 42 public benchmarks, GLM-4.5V achieves state-of-the-art performance on nearly all tasks among open-source models of similar size, and demonstrates competitive or even superior results compared to closed-source models such as Gemini-2.5-Flash on challenging tasks including Coding and GUI Agents. Meanwhile, the smaller GLM-4.1V-9B-Thinking remains highly competitive—achieving superior results to the much larger Qwen2.5-VL-72B on 29 benchmarks. We open-source both GLM 4.1V-9B-Thinking and GLM-4.5V. We further introduce the GLM-4.6V series, open-source multimodal models with native tool use and a 128K context window. A brief overview is available at [https://z.ai/blog/glm-4.6v](https://z.ai/blog/glm-4.6v). Code, models and more information are released at [https://github.com/zai-org/GLM-V.](https://github.com/zai-org/GLM-V)

我们推出 GLM-4.1V-Thinking, GLM-4.5V 和 GLM-4.6V, 这是一个视觉语言模型 (VLM) 系列, 目标是推进通用的多模态理解与推理. 本报告分享我们在开发这套以推理为中心的训练框架时得到的主要发现. 我们先通过大规模预训练得到一个能力强, 潜力大的视觉基座模型, 可以说它决定了最终性能的上限. 随后我们提出训练方法 「课程采样强化学习」 (Reinforcement Learning with Curriculum Sampling, **RLCS**), 把模型的潜力充分释放出来, 在多种任务上全面提升能力, 包括 STEM 解题, 视频理解, 内容识别, 编程, 视觉定位, 基于 GUI 的智能体和长文档解读. 在 42 个公开基准的综合评测中, GLM-4.5V 在同等规模的开源模型里几乎所有任务都达到最佳水平 (SOTA), 在编程和 GUI 智能体这类有挑战的任务上, 与 Gemini-2.5-Flash 等闭源模型相比也有竞争力, 有时更好. 与此同时, 更小的 GLM-4.1V-9B-Thinking 依然很有竞争力: 在 29 个基准上超过大得多的 Qwen2.5-VL-72B. 我们开源了 GLM-4.1V-9B-Thinking 和 GLM-4.5V. 我们还推出 GLM-4.6V 系列, 这是一组开源多模态模型, 原生支持工具调用, 上下文窗口长度为 128K. 简要介绍见 [https://z.ai/blog/glm-4.6v](https://z.ai/blog/glm-4.6v). 代码, 模型和更多信息发布在 [https://github.com/zai-org/GLM-V](https://github.com/zai-org/GLM-V).

> **问:** 标题只点了 GLM-4.5V 和 GLM-4.1V-Thinking, 摘要却同时介绍 GLM-4.6V, 这份 v6 是哪个时间点的版本?
> 第 1 页页眉写的是 「arXiv:2507.01006v6 [cs.CV] 1 Jan 2026」: 第 6 版, 2026 年 1 月 1 日. 编号前四位 2507 是 arXiv 按年月发号的规则, 说明第一版在 2025 年 7 月提交. 正文把 4.6V 当作后加的内容来写: 第 2 页说 GLM-4.6V-Flash (9B) 和 GLM-4.6V (106B-A12B) 是 「their updated versions」, 第 16 页第 6 节开头说 「For completeness, we also report the results of the updated model, GLM-4.6V, in table 2」, 第 41 页附录 B 的三节评测协议只点了 4.1V 和 4.5V 的名字. 标题没有跟着改. 4.6V 在本文里是一个视觉语言模型, 和同家族里纯文本的 GLM-4.6 不是一回事, 本文也没有引用那篇文本模型的材料.

![Chart block](images/p01-a-comparison-with-baselines.png)

(图: 雷达图, 八个轴依次是 STEM, Spatial Reasoning, GUI Agents, OCR & Document, Coding, Video Understanding, Visual Grounding, General VQA. 四条线: GLM-4.5V 红色实线, GLM-4.1V-9B-Thinking 橙色实线, Qwen2.5-VL-72B 浅蓝虚线, Gemini-2.5-Flash 深蓝虚线. 最外圈能看清的刻度有 STEM 70.7, Spatial Reasoning 61.0, GUI Agents 61.9, Coding 81.1. 红线在 GUI Agents, OCR & Document, Coding 三个方向最靠外; Qwen2.5-VL-72B 的虚线在 GUI Agents 和 Coding 方向明显往里缩. 图上没有标每条线在每个轴上的分数.)

(A) Comparison with baselines.

(A) 与基线的对比.

![Chart block](images/p01-b-reinforcement-learning-gains.png)

(图: 柱状图, 纵轴 Accuracy (%), 范围 50 到 90. 每根柱子下半截实色是 SFT, 上半截斜线是 SFT+RL 多出来的部分. 从左到右: Spatial Reasoning +2.8%, OCR & Document +5.8%, GUI Agents +4.8%, Video Understanding +5.5%, General VQA +3.2%, STEM +5.3%, Visual Grounding +6.7%, Coding +10.6%. Coding 这根柱子 SFT 部分到 72 左右, 加上 RL 后到 82.5 左右.)

(B) Reinforcement learning gains.

(B) 强化学习带来的提升.

Figure 1: (A) GLM-4.5V achieves efficient scaling based on its compact predecessor, GLM-4.1V-9B-Thinking, and compares favorably with Gemini-2.5-Flash, according to benchmark assessments. Table 2 presents full performance comparison. (B) Reinforcement learning substantially boosts the model’s performance, with gains of up to +10.6% when experimented with GLM-4.5V.

图 1: (A) GLM-4.5V 在小尺寸的前代 GLM-4.1V-9B-Thinking 基础上高效地扩大了规模; 按基准评测结果, 它与 Gemini-2.5-Flash 对比时占优. 完整的性能对比见表 2. (B) 强化学习大幅提升了模型性能, 在 GLM-4.5V 上做实验时, 提升最高达 +10.6%.

> **看表:** 图 1B 的 「+10.6%」 是相对 SFT 分数涨了 10.6%, 还是涨了 10.6 个百分点?
> 看图 1B 的坐标: 纵轴是 「Accuracy (%)」, Coding 一栏 SFT 部分顶在 72 附近, SFT+RL 顶在 82.5 附近, 差值约 10.5. 如果是相对提升, 72 乘 1.106 约为 79.6, 和柱顶对不上. 所以这 8 个 「+x%」 应当读成百分点. 图题只说 「when experimented with GLM-4.5V」, 没说每一栏由哪些基准平均而来, 这几栏的分数也不在表 2 里.

<!-- page 2 of 42 -->

## 1 Introduction

1 引言

Vision-language models (VLMs) have become a crucial cornerstone of modern intelligent systems, enabling the perception and understanding of visual information beyond text. Over the past decade, as the intelligence level of models has advanced dramatically [36; 47; 20; 4], the complexity of corresponding multimodal intelligence tasks has increased accordingly. From solving scientific problems [67; 32; 34] to developing autonomous agents [21; 62; 43], the demands on VLMs have far surpassed simple visual content perception [31], with an increasing emphasis on advanced reasoning abilities. Recently, numerous studies have shown that long-form reasoning [60] and scalable reinforcement learning [42] can significantly enhance the ability of large language models (LLMs) to solve complex problems [23; 17]. Several previous works have attempted to enhance the reasoning capabilities of VLMs using similar paradigms [46; 33], but they mainly focus on specific domains. The open-source community currently also lacks a multimodal reasoning model that consistently outperforms traditional non-thinking models of comparable parameter scale across a broad range of scenarios and tasks.

视觉语言模型 (VLM) 已经成为现代智能系统的重要基石, 让系统能在文本之外感知和理解视觉信息. 过去十年里, 模型的智能水平大幅提升 [36; 47; 20; 4], 相应的多模态智能任务也越来越复杂. 从解决科学问题 [67; 32; 34] 到开发自主智能体 [21; 62; 43], 人们对 VLM 的要求早已超出简单的视觉内容感知 [31], 越来越看重高级推理能力. 近来大量研究表明, 长篇推理 [60] 和可扩展的强化学习 [42] 能显著增强大语言模型 (LLM) 解决复杂问题的能力 [23; 17]. 此前有几项工作尝试用类似的范式增强 VLM 的推理能力 [46; 33], 但主要集中在特定领域. 开源社区目前也还缺少这样一个多模态推理模型: 在广泛的场景和任务上, 稳定地超过参数规模相当的传统非思考模型.

In this report, we share our key findings in the development of GLM-4.1V-Thinking, GLM-4.5V and GLM-4.6V, a family of VLMs designed to advance general-purpose multimodal reasoning. Our training framework is structured around a unified objective: to comprehensively enhance the model’s reasoning capabilities through scalable reinforcement learning. For pre-training, we curate a broad and diverse corpus of knowledge-intensive multimodal data to equip the model with strong foundational capabilities, including (a) massive image-text pairs with accurate factual knowledge; (b) a self-curated academic corpus with interleaved image and text; (c) annotated documents and diagrams, instructional videos, and grounding data spanning both natural and synthetic images. This foundation model serves as a high-potential multimodal reasoning base for subsequent reinforcement learning. In the supervised fine-tuning phase, we construct carefully designed, domain-specific datasets that teach the model to perform effective reasoning with a standardized format across a wide range of tasks. Finally, we introduce Reinforcement Learning with Curriculum Sampling (**RLCS**) to drive large-scale, cross-domain reasoning capabilities. RLCS is a multi-domain reinforcement learning framework that combines curriculum learning with difficulty-aware sampling to improve training efficiency by selecting tasks and samples suited to the model’s current competence. Our reinforcement learning process enhances training effectiveness and stability, and systematically improves the model’s reasoning abilities through interaction and feedback across diverse domains.

在本报告中, 我们分享开发 GLM-4.1V-Thinking, GLM-4.5V 和 GLM-4.6V 时得到的主要发现, 这是一个旨在推进通用多模态推理的 VLM 系列. 我们的训练框架围绕一个统一目标搭建: 通过可扩展的强化学习全面增强模型的推理能力. 预训练阶段, 我们整理了一个广泛多样, 知识密集的多模态语料, 让模型具备扎实的基础能力, 包括: (a) 海量带有准确事实知识的图文对; (b) 自行整理的图文交错学术语料; (c) 带标注的文档和图表, 教学视频, 以及覆盖自然图像和合成图像的视觉定位数据. 这个基座模型为后续强化学习提供了潜力很高的多模态推理底座. 监督微调阶段, 我们构建了精心设计的领域数据集, 教模型在多种任务上用统一格式进行有效推理. 最后, 我们引入课程采样强化学习 (**RLCS**), 推动大规模, 跨领域的推理能力. RLCS 是一个多领域强化学习框架, 把课程学习和难度感知采样结合起来, 挑选与模型当前能力相匹配的任务和样本, 以提高训练效率. 我们的强化学习过程提升了训练的效果和稳定性, 并通过在多个领域的交互和反馈, 系统地提升了模型的推理能力.

To advance research in this field, we open-source GLM-4.1V-9B-Thinking (9 billion parameters) GLM-4.5V (106B-A12B: 106 billion total parameters, 12 billion activated parameters), as well as their updated versions, GLM-4.6V-Flash (9B) and GLM-4.6V (106B-A12B), both of which achieve state-of-the-art performance among models of comparable size. In a comprehensive evaluation across 42 public benchmarks, GLM-4.5V achieves state-of-the-art performance on nearly all tasks, consistently outperforming strong open-source models such as Step-3 (321B-A38B) and Qwen-2.5-VL-72B, and achieves comparable or even superior performance on 22 benchmarks relative to the closedsource Gemini-2.5-Flash. Notably, GLM-4.5V advances the state-of-the-art for open-source VLMs of comparable size by roughly 10% or more across a wide range of tasks, including general VQA (MMStar, GeoBench), STEM (MMMU Pro, MathVerse, WeMath), chart understanding (ChartQAPro, ChartMuseum), long document understanding (MMLongBench-Doc), visual grounding (TreeBench, Ref-L4-test), spatial reasoning (ERQA), GUI agents (OSWorld, AndroidWorld, WebVoyagerSom, WebQuest), VLM coding (Design2Code, Flame-React-Eval), and video understanding (VideoM-MMU, LVBench, MotionBench). GLM-4.1V-9B-Thinking also demonstrates competitive or superior performance compared to much larger models such as Qwen2.5-VL-72B on 29 benchmarks. We further open-source the pre-trained base model, GLM-4.1V-9B-Base, to provide a strong foundation for all researchers to develop and extend their own models.

为推动这一领域的研究, 我们开源了 GLM-4.1V-9B-Thinking (90 亿参数), GLM-4.5V (106B-A12B: 总参数 1060 亿, 激活参数 120 亿), 以及它们的更新版 GLM-4.6V-Flash (9B) 和 GLM-4.6V (106B-A12B); 两者都在规模相当的模型中达到最佳水平. 在 42 个公开基准的综合评测中, GLM-4.5V 几乎在所有任务上都达到最佳水平, 稳定超过 Step-3 (321B-A38B) 和 Qwen-2.5-VL-72B 等强大的开源模型, 并在 22 个基准上与闭源的 Gemini-2.5-Flash 相当甚至更好. 值得一提的是, 在一系列任务上, GLM-4.5V 把同等规模开源 VLM 的最佳水平推高了大约 10% 或更多, 这些任务包括通用 VQA (MMStar, GeoBench), STEM (MMMU Pro, MathVerse, WeMath), 图表理解 (ChartQAPro, ChartMuseum), 长文档理解 (MMLongBench-Doc), 视觉定位 (TreeBench, Ref-L4-test), 空间推理 (ERQA), GUI 智能体 (OSWorld, AndroidWorld, WebVoyagerSom, WebQuest), VLM 编程 (Design2Code, Flame-React-Eval) 和视频理解 (VideoM-MMU, LVBench, MotionBench). GLM-4.1V-9B-Thinking 在 29 个基准上也与 Qwen2.5-VL-72B 这类大得多的模型相比有竞争力, 或者更好. 我们还开源了预训练基座模型 GLM-4.1V-9B-Base, 为所有研究者开发和扩展自己的模型提供一个坚实的基础.

> **核对:** 「在 22 个基准上与 Gemini-2.5-Flash 相当甚至更好」, 这 22 个是在哪张表里数出来的?
> 本文找不到. 第 15 页表 2 的对比列是 GLM-4.1V, GLM-4.5V, GLM-4.6V, Step-3, Qwen2.5-VL, Kimi-VL-2506, Gemma-3, 没有 Gemini-2.5-Flash; 第 42 页表 3 的闭源参照是 GPT-4o 2024-11-20, 也没有它. 全文唯一画了 Gemini-2.5-Flash 的是第 1 页图 1A 那张雷达图, 只有八个类别轴, 没有逐项分数. 所以 22 这个数在本文里无法复核, 摘要里 「competitive or even superior results compared to closed-source models such as Gemini-2.5-Flash」 也一样.

> **拆开:** 「roughly 10% or more」 是相对提升还是百分点? 跟谁比?
> 原文两样都没交代. 拿第 15 页表 2 算: 把 GLM-4.5V 和表里最强的非 GLM 开源模型比, 按相对提升算, MMStar 是 75.3 对 70.8 (Qwen2.5-VL), 约 6.4%; GeoBench 79.7 对 74.3, 约 7.3%; MMLongBench-Doc 44.7 对 42.1 (Kimi-VL), 约 6.2%, 这三项都不到 10%. 按百分点算, 差距更小, MMStar 4.5, GeoBench 5.4, MMLongBench-Doc 2.6, ERQA 5.2. 这句话里点名的其余基准大多能过 10%, 尤其 GUI 和编程几项差距很大, 例如 OSWorld 35.8 对 8.8, Design2Code 82.2 对 41.9. 「comparable size」 指谁也没说: 表里的对手是 72B 稠密模型, 321B-A38B 的 Step-3, 16B-A3B 的 Kimi-VL 和 27B 的 Gemma-3, 规模都和 106B-A12B 不一样.

We summarize our key findings from the development process below and provide more detailed explanations in the following sections.

下面总结我们在开发过程中的主要发现, 后续章节会给出更详细的解释.

• **Multi-domain reinforcement learning demonstrates robust cross-domain generalization and mutual facilitation.** Training on one domain boosts performance in others, and joint training across domains yields even greater improvements in each. (See Section 6.3)

**多领域强化学习表现出稳健的跨领域泛化和相互促进.** 在一个领域上训练会提升其他领域的表现, 多个领域联合训练则让每个领域的提升更大. (见 6.3 节)

• **Dynamically selecting the most informative rollout problems is essential for both efficiency and performance.** Therefore, we propose strategies including Reinforcement Learning with Curriculum

**动态挑选信息量最大的 rollout 问题, 对效率和性能都至关重要.** 因此, 我们提出了若干策略, 包括课程采样强化学习 (句子接下页)

<!-- page 3 of 42 -->

Sampling (RLCS) and dynamic sampling expansion via ratio-based Exponential Moving Average (EMA). (See Section 5.3)

(接上页) (RLCS), 以及基于比率指数移动平均 (EMA) 的动态采样扩充. (见 5.3 节)

• **A robust and precise reward system is critical for multi-domain RL.** When training a unified VLM across diverse skills, even a slight weakness in the reward signal for one capability can collapse the entire process. (See Section 5.2)

**对多领域 RL 来说, 稳健而精确的奖励系统至关重要.** 在多种技能上训练统一的 VLM 时, 哪怕某一项能力的奖励信号只有一点点缺陷, 也可能让整个训练过程崩溃. (见 5.2 节)

In summary, our contributions are as follows:

总的来说, 我们的贡献如下:

• We present GLM-4.1V-Thinking, GLM-4.5V and GLM-4.6V, a family of VLMs developed to advance general-purpose multimodal reasoning. Notably, GLM-4.5V and GLM-4.6V natively supports both “thinking” and “non-thinking” modes, enabling flexible trade-offs between performance and efficiency. We introduce the model design and the reasoning-centric training framework, along with key insights and challenges encountered during the development process.

我们推出 GLM-4.1V-Thinking, GLM-4.5V 和 GLM-4.6V, 这是一个为推进通用多模态推理而开发的 VLM 系列. 值得一提的是, GLM-4.5V 和 GLM-4.6V 原生支持 「思考」 和 「非思考」 两种模式, 可以在性能和效率之间灵活取舍. 我们介绍了模型设计和以推理为中心的训练框架, 以及开发过程中得到的关键认识和遇到的挑战.

• We open-source GLM-4.1V-9B-Thinking, GLM-4.1V-9B-Base, GLM-4.5V, GLM-4.6V and other useful components such as domain-specific reward systems, to facilitate further research in this area. Code, models and more information are released at [https://github.com/zai-org/GLM-V.](https://github.com/zai-org/GLM-V)

我们开源了 GLM-4.1V-9B-Thinking, GLM-4.1V-9B-Base, GLM-4.5V, GLM-4.6V, 以及领域奖励系统等其他有用组件, 以便这一方向的后续研究. 代码, 模型和更多信息发布在 [https://github.com/zai-org/GLM-V](https://github.com/zai-org/GLM-V).

• Comprehensive experiments demonstrate the superiority of the proposed models: GLM-4.5V and GLM-4.1V-9B-Thinking achieve state-of-the-art performance among models of comparable size, with GLM-4.1V-9B-Thinking even surpassing much larger models on several benchmarks. Furthermore, GLM-4.5V matches or outperforms Gemini-2.5-Flash across multiple tasks.

全面的实验证明了所提模型的优势: GLM-4.5V 和 GLM-4.1V-9B-Thinking 在规模相当的模型中达到最佳水平, GLM-4.1V-9B-Thinking 甚至在若干基准上超过大得多的模型. 此外, GLM-4.5V 在多项任务上追平或超过 Gemini-2.5-Flash.

## 2 Overview and Architecture

2 概览与架构

Figure 2 shows the shared architecture of GLM-V series (GLM-4.1V-Thinking, GLM-4.5V, and GLM-4.6V), composed of three core components: a vision encoder, an MLP adapter, and a large language model (LLM) as the decoder. We employ AIMv2-Huge [9] as the initialization of the vision encoder. For the LLM component, we use GLM-4-9B-0414 [13] for the GLM-4.1V-Thinking and GLM-4.6V-Flash model, and GLM-4.5-Air [13] for the GLM-4.5V and GLM-4.6V model. Within the vision encoder, we adopt a strategy similar to Qwen2-VL [57], replacing the original 2D convolutions with 3D convolutions. This enables temporal downsampling by a factor of two for video inputs, thereby improving model efficiency. For single-image inputs, the image is duplicated to maintain consistency.

图 2 展示了 GLM-V 系列 (GLM-4.1V-Thinking, GLM-4.5V 和 GLM-4.6V) 共用的架构, 它由三个核心组件构成: 视觉编码器, MLP 适配器, 以及作为解码器的大语言模型 (LLM). 视觉编码器用 AIMv2-Huge [9] 初始化. LLM 部分, GLM-4.1V-Thinking 和 GLM-4.6V-Flash 用 GLM-4-9B-0414 [13], GLM-4.5V 和 GLM-4.6V 用 GLM-4.5-Air [13]. 在视觉编码器里, 我们采用与 Qwen2-VL [57] 类似的做法, 把原来的 2D 卷积换成 3D 卷积. 这样视频输入在时间维度上可以做 2 倍下采样, 从而提高模型效率. 对单张图像输入, 把图像复制一份, 以保持处理方式一致.

> **停一下:** 「For single-image inputs, the image is duplicated」, 为什么单张图要复制一份?
> 回到同一段的前一句: 3D 卷积在时间维上做 2 倍下采样, 等于每两帧合成一组. 单张图只有一帧, 凑不成一组, 复制一份就变成两帧, 能走同一个卷积核. 第 4 页图 2 的 ViT 框里写的是 「Native resolution w. 2x temporal compression」, 与这句一致. 复制之后算力是否翻倍, 这两帧在进入 LLM 前是否已经合并成一份 token, 原文没有展开.

To enable our underlying Vision Transformer (ViT) to support arbitrary image resolutions and aspect ratios, we introduce two adaptations. First, we integrate 2D-RoPE [44] into the ViT’s self-attention layers, enabling the model to effectively process images with extreme aspect ratios (over 200:1) or high resolutions (beyond 4K). Second, to preserve the foundational capabilities of the pre-trained ViT, we retain its original learnable absolute position embeddings. During training, these embeddings are dynamically adapted to variable-resolution inputs via bicubic interpolation. Specifically, for an input image divided into a grid of $H _ { p } \times W _ { p }$ patches, the integer coordinates $\mathbf { g } = ( w , h )$ of each patch are first normalized to a continuous grid g<sub>norm</sub> spanning [−1, 1]:

为了让底层的 Vision Transformer (ViT) 支持任意分辨率和宽高比, 我们做了两处改动. 第一, 在 ViT 的自注意力层中加入 2D-RoPE [44], 让模型能有效处理宽高比极端 (超过 200:1) 或分辨率很高 (超过 4K) 的图像. 第二, 为保留预训练 ViT 的基础能力, 我们保留了它原有的可学习绝对位置嵌入. 训练时, 这些嵌入通过双三次插值动态适配到可变分辨率的输入上. 具体来说, 对一张被切成 $H _ { p } \times W _ { p }$ 个 patch 网格的输入图像, 先把每个 patch 的整数坐标 $\mathbf { g } = ( w , h )$ 归一化到一个取值范围为 [−1, 1] 的连续网格 g<sub>norm</sub> 上:

$$
\mathbf {g} _ {\text {norm}} = (w _ {\text {norm}}, h _ {\text {norm}}) = 2 \cdot \left(\frac {w + 0 . 5}{W _ {p}}, \frac {h + 0 . 5}{H _ {p}}\right) - 1\tag{1}
$$

(式 1: 横坐标取 (w + 0.5) / W_p, 纵坐标取 (h + 0.5) / H_p, 再乘 2 减 1. 加 0.5 取的是 patch 中心, 乘 2 减 1 把 [0, 1] 映射到 [−1, 1].)

These normalized coordinates are then used to sample from the original position embedding table $P _ { \mathrm { o r i g } }$ using a bicubic interpolation function $\mathcal { I } _ { \mathrm { b i c u b i c } }$ to generate the final adapted embedding $\bar { P } _ { \bar { c } }$ <sub>d</sub>apted for that patch:

然后用这些归一化坐标, 通过双三次插值函数 $\mathcal { I } _ { \mathrm { b i c u b i c } }$ 从原始位置嵌入表 $P _ { \mathrm { o r i g } }$ 中采样, 得到该 patch 最终适配后的嵌入 P_adapted (md 这里把下标识别成了乱码, 式 2 里写的是 P_adapted):

$$
P _ {\text {adapted}} (\mathbf {g}) = \mathcal {I} _ {\text {bicubic}} \left(P _ {\text {orig}}, \mathbf {g} _ {\text {norm}}\right)\tag{2}
$$

(式 2: 适配后的嵌入等于在原始嵌入表上, 按归一化坐标做双三次插值取值.)

To further enhance spatial awareness on the language side, we extend RoPE to 3D-RoPE in the LLM. This extension provides superior spatial understanding for multimodal contexts, while preserving the original model’s text-related capabilities.

为了进一步增强语言侧的空间感知, 我们在 LLM 中把 RoPE 扩展为 3D-RoPE. 这一扩展为多模态上下文提供了更好的空间理解, 同时保留了原模型的文本能力.

After addressing spatial adaptation, we turn to temporal modeling in video inputs. For videos, we insert a time index token after each frame token, where the time index is implemented by encoding each frame’s timestamp as a string. Unlike multi-image inputs, video frames form a temporally coherent sequence. This design explicitly informs the model of the real-world timestamps and temporal distances between frames, thereby boosting its temporal understanding and grounding capabilities.

处理完空间适配, 我们转向视频输入的时间建模. 对视频, 我们在每一帧的 token 后面插入一个时间索引 token, 时间索引的实现方式是把每一帧的时间戳编码成字符串. 与多图输入不同, 视频帧构成一个时间上连贯的序列. 这种设计明确告诉模型真实的时间戳和帧与帧之间的时间间隔, 从而增强它的时间理解和时间定位能力.

<!-- page 4 of 42 -->

![Image block](images/p04-figure-2-the-shared-architecture-of-glm-4-1v-thinking.png)

(图: 架构示意. 底部三个输入: Image 1 宽 952 高 1274 (街景照片), Image 2 宽 2548 高 1596 (淘宝订单页面截图), Video 1 宽 980 高 546, 时长 20s (蝴蝶视频的若干帧). 往上依次是 「ViT Encoder (Native resolution w. 2x temporal compression)」 和 「MLP Projector」. 再往上是输入 token 序列: Image 1 对应 1574 tokens, Image 2 对应 5187 tokens, Video 1 对应 13650 tokens, 视频段中间插着标了 0, 2, 4, 6 的灰色方块, 图例说明这是 「Time index token」; 序列末尾是文本 「Could you tell me...?」. 最上方 「Language Decoder」 输出虚线框的 「Predicted token」, 开头是 「<|think|>From the given image, ...」. 右侧有 GLM-V 的标志.)

Figure 2: The shared architecture of GLM-4.1V-Thinking, GLM-4.5V and GLM-4.6V. The proposed model consists of three components: (1) a ViT Encoder to process and encode images and videos, (2) an MLP Projector to align visual features to textual tokens, (3) a Large Language Model as a Language Decoder to process multimodal tokens and yield token completions. Our model can perceive images and videos as their native resolutions and aspect ratios. For video inputs, additional time index tokens are inserted behind each frame to enhance the model’s temporal understanding capability.

图 2: GLM-4.1V-Thinking, GLM-4.5V 和 GLM-4.6V 共用的架构. 模型由三个组件构成: (1) ViT 编码器, 处理并编码图像和视频; (2) MLP 投影器, 把视觉特征对齐到文本 token; (3) 作为语言解码器的大语言模型, 处理多模态 token 并生成补全的 token. 我们的模型能按图像和视频的原生分辨率和宽高比来感知它们. 对视频输入, 每一帧后面额外插入时间索引 token, 以增强模型的时间理解能力.

![Chart block](images/p04-figure-3-comparison-of-pass-k-performance-on-a-subset.png)

(图: 折线图, 横轴 Number of Samples k, 取 1, 2, 4, 8, 16, 32, 64; 纵轴 Pass@k. 蓝线 GLM-4.1V-9B-Base 从 k=1 的约 0.615 升到 k=64 的约 0.935; 绿线 InternVL3-9B-Pretrain 从约 0.54 升到约 0.848. 每个 k 上蓝线都高于绿线, k=4 处差距约 0.09.)

Figure 3: Comparison of pass@k performance on a subset of MathVista consisting of non-multiplechoice questions.

图 3: 在 MathVista 非选择题子集上的 pass@k 表现对比.

## 3 Pre-training

3 预训练

To develop a more powerful visual language foundation model, we incorporate a diverse range of datasets, including extensive academic corpora and knowledge-rich, interleaved image-text data, while also training the model on pure text data to preserve its language capabilities. To assess the effectiveness of our pre-training, we plot the pass@k metric on the non-multiple choice subset of MathVista. As shown in Figure 3, GLM-4.1V-9B-Base achieves significantly better results on the pass@k metric compared with the state-of-the-art pre-trained base model of similar scale. This superior base performance arguably sets the upper bound for the final results after reinforcement learning (RL). In the following sections, we first describe the construction of pre-training data and then detail the training procedure.

为了得到更强的视觉语言基座模型, 我们纳入了多种数据集, 包括大量学术语料和知识丰富的图文交错数据, 同时也用纯文本数据训练模型, 以保持它的语言能力. 为评估预训练的效果, 我们在 MathVista 的非选择题子集上画出 pass@k 指标. 如图 3 所示, GLM-4.1V-9B-Base 的 pass@k 明显好于同规模的最佳预训练基座模型. 可以说, 这种更强的基座表现决定了强化学习 (RL) 之后最终结果的上限. 下面几节先介绍预训练数据的构建, 再详细说明训练流程.

<!-- page 5 of 42 -->

![Image block](images/p05-figure-4-examples-of-recaption-model-results-the.png)

(图: 两个 recaption 例子. (a) 一只红色北美红雀停在枯枝上, 背景是蓝天. 原始标题 「A Northern Cardinal Singing.」, 经 Recaption 后变成 「A Northern Cardinal perched on a tree branch, set against a clear blue sky.」, 新增的 「perched on a tree branch」 和 「blue sky」 加粗. (b) 雪山脚下的山村风景. 原始标题 「2019.07.30 梅斯蒂亚 乌树故里,雪山脚下的绝美山村」, 经 Recaption 后变成 「梅斯蒂亚山间村庄, 绿意环绕的乡村风光」. 两例开头的地名或物种名都标成红色, 表示被保留下来的事实.)

Figure 4: Examples of recaption model results. The recaptioning process eliminates noise and hallucinated content from the original data, while fully retaining factual knowledge.

图 4: recaption 模型结果示例. 重写标题的过程去掉了原始数据中的噪声和幻觉内容, 同时完整保留了事实知识.

## 3.1 Pre-training Data

3.1 预训练数据

**Image caption data.** High-quality image-text captions are crucial for imbuing visual-language models with world knowledge and enhancing their generalization capabilities. To this end, we construct a large-scale, high-quality caption dataset through a meticulous curation pipeline. The process begins with the aggregation of an initial pool of over 10 billion image-text pairs from diverse sources, including public datasets like LAION[40], DataComp [12], DFN[8], and Wukong [14], supplemented by data from web search engines. To ensure data integrity, we implement a multi-stage refinement process:

**图像标题数据.** 高质量的图文标题对于给视觉语言模型注入世界知识, 增强泛化能力至关重要. 为此, 我们通过一条细致的整理流水线, 构建了一个大规模, 高质量的标题数据集. 流程从汇集超过 100 亿个图文对的初始池开始, 来源多样, 包括 LAION [40], DataComp [12], DFN [8], Wukong [14] 等公开数据集, 并用网络搜索引擎得到的数据补充. 为确保数据质量, 我们实施了多阶段的精炼流程:

1. **Heuristic-based filtering**: We first apply a series of rule-based filters to discard overtly lowquality samples. These rules include minimum image resolution, solid color detection, caption length constraints, and image-level deduplication.

1. **基于启发式规则的过滤:** 先用一系列规则过滤器剔除明显低质量的样本. 这些规则包括最低图像分辨率, 纯色检测, 标题长度约束和图像级去重.

2. **Relevance filtering**: To enforce semantic consistency between modalities, we employ a pre-trained CLIP model to calculate image-text similarity, retaining only pairs with a CLIP-Score above a threshold of 0.3.

2. **相关性过滤:** 为保证两种模态之间的语义一致, 我们用预训练的 CLIP 模型计算图文相似度, 只保留 CLIP-Score 高于阈值 0.3 的图文对.

3. **Concept-balanced resampling**: To mitigate the inherent long-tail distribution of concepts in web-scale data, we adopt a resampling strategy inspired by MetaCLIP [63]. Using a comprehensive vocabulary rich in visual concepts and proper nouns, we re-weight the filtered data to enhance conceptual coverage and balance.

3. **概念均衡重采样:** 为缓解网络规模数据中概念固有的长尾分布, 我们采用受 MetaCLIP [63] 启发的重采样策略. 借助一个富含视觉概念和专有名词的完整词表, 我们对过滤后的数据重新加权, 以提高概念覆盖度和均衡度.

4. **Factual-centered recaptioning**: Furthermore, to improve the descriptive quality and information density of the captions, we iteratively train a factual-centered recaptioning model. As shown in Figure 4, this model is designed to denoise and enrich the original captions, generating new, more precise, and detailed descriptions while preserving the factual accuracy of the source text.

4. **以事实为中心的重写标题:** 此外, 为提高标题的描述质量和信息密度, 我们迭代训练了一个以事实为中心的 recaption 模型. 如图 4 所示, 这个模型用于给原始标题去噪和补充内容, 在保持原文事实准确的前提下生成更精确, 更详细的新描述.

Finally, we merge the curated original data with the recaptioned data at a predetermined ratio, yielding a final dataset that balances broad world knowledge with rich descriptive depth.

最后, 我们把整理后的原始数据和重写后的数据按预先设定的比例合并, 得到最终数据集, 在广泛的世界知识和丰富的描述深度之间取得平衡.

**Interleaved image-text data.** Rich interleaved image-text vision-language data can be found in corpora such as web pages and books. On the one hand, its volume is immense, far exceeding that of existing image-caption datasets which rely primarily on alt-text. On the other hand, it encodes rich information beyond simple image descriptions, including complex logical relationships between text and images, and covering a broad spectrum of domain knowledge. However, such data is often extremely noisy: many samples lack genuine image-text alignment, and the distribution of information density is highly skewed (a large fraction of the corpus is uninformative). As a result, prior work seldom leverages these resources at scale to boost vision-language capabilities, typically only using small amounts to help models adapt to multi-image, interleaved-text layouts. To address this issue, we design and implement specialized processing pipelines tailored to each data source, successfully extracting a large volume of high-quality interleaved image-text data and substantially enhancing the model’s foundational image-text understanding and reasoning abilities. The specific pipelines are as follows:

**图文交错数据.** 网页和书籍等语料中有丰富的图文交错视觉语言数据. 一方面, 它的体量巨大, 远超主要依赖 alt-text 的现有图像标题数据集. 另一方面, 它编码的信息远不止简单的图像描述, 还包括文本和图像之间复杂的逻辑关系, 覆盖广泛的领域知识. 然而这类数据往往噪声极大: 很多样本缺乏真正的图文对应, 信息密度的分布也严重偏斜 (语料中很大一部分没什么信息量). 因此, 以往的工作很少大规模利用这些资源来提升视觉语言能力, 通常只用少量数据帮助模型适应多图, 图文交错的版式. 为解决这个问题, 我们针对每个数据源设计并实现了专门的处理流水线, 成功提取出大量高质量的图文交错数据, 显著增强了模型基础的图文理解和推理能力. 具体流水线如下:

1. **Web data processing pipeline**: Our pipeline for web data begins with the aggregation of raw content from large-scale open-source datasets, including MINT [3], MMC4 [73], and OmniCorpus [29]. This initial pool undergoes a multi-stage cleaning and filtering process. First, we discard images that are semantically irrelevant to the surrounding article context using a CLIP-Score threshold. We then remove common noise elements like advertisements and QR codes, which are typically located at the end of articles, using a combination of heuristic rules

1. **网页数据处理流水线:** 我们的网页数据流水线从汇集大规模开源数据集的原始内容开始, 包括 MINT [3], MMC4 [73] 和 OmniCorpus [29]. 这个初始池要经过多阶段的清洗和过滤. 首先, 用 CLIP-Score 阈值剔除与所在文章上下文语义无关的图像. 然后去掉广告, 二维码等常见噪声元素, 这些元素通常位于文章末尾, 我们结合启发式规则 (句子接下页)

<!-- page 6 of 42 -->

and a purpose-built image classifier for enhanced precision. Furthermore, we exclude samples characterized by a high density of images but sparse textual content, such as online photo albums. To actively enrich the dataset with high-information-value content, we iteratively train a “highknowledge-density” image classifier. This model is engineered to identify and prioritize images of significant informational value, such as academic charts, scientific illustrations, engineering schematics, instructional diagrams, and maps.

(接上页) 和一个专门训练的图像分类器来提高精度. 此外, 我们排除了图片密度高, 文字稀少的样本, 例如网络相册. 为了主动给数据集补充高信息价值的内容, 我们迭代训练了一个 「高知识密度」 图像分类器. 这个模型用来识别并优先选取信息价值高的图像, 例如学术图表, 科学插图, 工程示意图, 教学图解和地图.

2. **Academic book processing pipeline**: As another core data source, we collect over 100 million digitized books. To ensure content relevance and quality, we first filter this collection to select books pertaining to key domains, including science, technology, engineering, and mathematics (STEM). Subsequently, we employ a PDF parsing tool to perform a deep parsing of these PDF documents, enabling the extraction of high-quality interleaved image-and-text content.

2. **学术书籍处理流水线:** 作为另一个核心数据源, 我们收集了超过 1 亿本数字化书籍. 为保证内容的相关性和质量, 我们先从中筛选出属于关键领域的书籍, 包括科学, 技术, 工程和数学 (STEM). 随后用 PDF 解析工具对这些 PDF 文档做深度解析, 提取出高质量的图文交错内容.

**OCR data.** To bolster the model’s OCR capabilities, we construct a large-scale pre-training dataset comprising 220 million images. This dataset is meticulously composed of three distinct components, each designed to address a specific aspect of text recognition:

**OCR 数据.** 为增强模型的 OCR 能力, 我们构建了一个包含 2.2 亿张图像的大规模预训练数据集. 它由三个不同部分精心组成, 每一部分针对文字识别的一个特定方面:

1. **Synthetic document images**: We render text from language pre-training corpora using varied fonts, sizes, colors, and orientations. These rendered texts are then composited onto diverse image backgrounds sourced from the LAION dataset, producing synthetic images that cover a broad spectrum of practical application scenarios.

1. **合成文档图像:** 我们把语言预训练语料中的文本用不同的字体, 字号, 颜色和方向渲染出来, 再把渲染好的文字合成到取自 LAION 数据集的各种图像背景上, 得到覆盖广泛实际应用场景的合成图像.

2. **Natural scene text images**: We utilize the Paddle-OCR toolkit to process a vast collection of natural images, automatically extracting textual content and their corresponding bounding boxes. The resulting data is subsequently filtered to retain only images containing at least one valid OCR detection, thereby enriching the dataset with authentic, real-world text instances.

2. **自然场景文字图像:** 我们用 Paddle-OCR 工具包处理大量自然图像, 自动提取其中的文字内容及对应的边界框. 得到的数据再经过过滤, 只保留至少含有一处有效 OCR 检测结果的图像, 从而用真实世界的文字实例充实数据集.

3. **Academic documents**: We adopt a processing methodology inspired by Nougat [5]. A large corpus of papers is sourced from arXiv, where the LaTeX source code is first normalized and converted to HTML format using the LaTeXML tool. The HTML is then parsed and transformed into a lightweight markup language. Finally, this content is segmented according to the original PDF page breaks and rasterized, creating a high-quality dataset of paired PDF page renderings and their corresponding structured source markup.

3. **学术文档:** 我们采用受 Nougat [5] 启发的处理方法. 从 arXiv 获取大量论文, 先对 LaTeX 源码做规范化, 再用 LaTeXML 工具转成 HTML 格式. 然后解析 HTML, 转换成一种轻量标记语言. 最后按原 PDF 的分页切分内容并栅格化, 得到一个由 PDF 页面渲染图和对应结构化源标记配对组成的高质量数据集.

**Grounding data.** To endow the model with precise visual localization capabilities, we construct a hybrid grounding dataset spanning two primary domains: natural images and graphical user interfaces (GUIs).

**视觉定位数据.** 为了让模型具备精确的视觉定位能力, 我们构建了一个混合定位数据集, 覆盖两个主要领域: 自然图像和图形用户界面 (GUI).

1. **Natural image grounding**: In the domain of natural images, we utilize LAION-115M [27] as a foundational dataset. Leveraging the GLIPv2 [69] model, we parse the caption of each image and automatically predict the corresponding bounding boxes for every noun phrase. To ensure the quality and richness of the grounding data, we apply a filter to retain only those samples containing at least two valid bounding boxes. This pipeline results in a final dataset of 40 million high-quality grounding annotations for natural images.

1. **自然图像定位:** 在自然图像领域, 我们以 LAION-115M [27] 为基础数据集. 借助 GLIPv2 [69] 模型, 我们解析每张图像的标题, 并自动为每个名词短语预测对应的边界框. 为保证定位数据的质量和丰富度, 我们只保留至少含有两个有效边界框的样本. 这条流水线最终得到 4000 万条高质量的自然图像定位标注.

2. **GUI grounding**: For the GUI domain, we construct a novel, large-scale dataset from scratch. We begin by extracting URLs from a recent CommonCrawl snapshot and capturing corresponding webpage screenshots via automated tools. Going beyond static captures, we employ the Playwright framework to deeply interact with webpages. This enables us to compile and parse all visible DOM elements along with their precisely rendered bounding boxes on the page. In general, to enhance the model’s interactive and comprehension abilities within GUI environments, we generate over 140 million question-answer pairs for Referring Expression Generation and Comprehension tasks specific to GUIs.

2. **GUI 定位:** 在 GUI 领域, 我们从零构建了一个新的大规模数据集. 先从最近一次 CommonCrawl 快照中提取 URL, 用自动化工具截取对应的网页截图. 在静态截图之外, 我们还用 Playwright 框架与网页做深度交互. 这样可以汇总并解析所有可见的 DOM 元素, 以及它们在页面上精确渲染出来的边界框. 总的来说, 为了增强模型在 GUI 环境中的交互和理解能力, 我们为 GUI 专属的指代表达生成与理解任务生成了超过 1.4 亿个问答对.

**Video data.** To support advanced video understanding, we construct a large-scale, high-quality video-text dataset. We curate a diverse corpus from academic, web, and proprietary sources. To address the hallucinations and omissions common in standard captions, we develop a pipeline with fine-grained human annotation to accurately capture complex actions and in-scene text. Furthermore, to encode deeper visual narratives, we annotate key cinematic elements such as camera motion and shot composition using a human-in-the-loop workflow.

**视频数据.** 为支持高级的视频理解, 我们构建了一个大规模, 高质量的视频文本数据集. 我们从学术, 网络和自有来源整理出多样的语料. 为解决普通标题中常见的幻觉和遗漏, 我们开发了一条带细粒度人工标注的流水线, 准确捕捉复杂的动作和画面中的文字. 此外, 为了编码更深层的视觉叙事, 我们用人在回路的工作流程标注了运镜和镜头构图等关键电影元素.

To ensure data purity, we implement a rigorous filtering protocol. We begin with integrity checks to remove corrupted or invalid files. Subsequently, we employ a multimodal, embedding-based

为保证数据纯净, 我们执行了严格的过滤规程. 先做完整性检查, 去掉损坏或无效的文件. 随后采用一种基于多模态嵌入的 (句子接下页)

<!-- page 7 of 42 -->

deduplication strategy, discarding pairs where both video and text embeddings show high similarity to another entry. This process effectively eliminates semantic redundancy, resulting in a clean and efficient training corpus.

(接上页) 去重策略: 如果某一对样本的视频嵌入和文本嵌入都与另一条高度相似, 就把它丢掉. 这一过程有效消除了语义冗余, 得到干净高效的训练语料.

**Instruction tuning data.** To enhance model versatility and generalization, we diversify high-quality instruction tuning data. Three targeted strategies are implemented:

**指令微调数据.** 为增强模型的通用性和泛化能力, 我们让高质量的指令微调数据更加多样. 具体实施了三项有针对性的策略:

1. **Task coverage and taxonomy**: We design a fine-grained taxonomy to optimize data sampling for expanded world knowledge coverage. This taxonomy allows us to organize prompts according to their semantic structure and task objective, enabling category-specific preprocessing and balanced sampling strategies.

1. **任务覆盖与分类体系:** 我们设计了一个细粒度的分类体系来优化数据采样, 扩大世界知识的覆盖面. 这个分类体系让我们能按语义结构和任务目标组织 prompt, 从而按类别做预处理, 并采用均衡的采样策略.

2. **Complex scenario augmentation**: To address gaps in existing open-source datasets (e.g., GUI interactions, long-document comprehension), we integrate synthetically generated data with rigorous structural constraints. These methods help us expand the dataset in diverse areas and improve its overall complexity.

2. **复杂场景增强:** 为了弥补现有开源数据集的空白 (例如 GUI 交互, 长文档理解), 我们纳入了带有严格结构约束的合成数据. 这些方法帮助我们在多个领域扩充数据集, 并提高整体复杂度.

3. **Data contamination check**: To prevent data leakage from public evaluation benchmarks, we conduct both manual and automated reviews of all open-source datasets.

3. **数据污染检查:** 为防止公开评测基准的数据泄露, 我们对所有开源数据集做了人工和自动两种审查.

The resulting 50 million samples include general visual perception and understanding, multimodal reasoning (e.g., STEM problem-solving), document-intensive contexts, GUI agent operations, and UI coding. It provides comprehensive coverage for the full-scenario reinforcement learning pipeline.

最终得到的 5000 万条样本涵盖通用视觉感知与理解, 多模态推理 (例如 STEM 解题), 文档密集型场景, GUI 智能体操作和 UI 编程. 它为全场景强化学习流水线提供了全面的覆盖.

## 3.2 Training Recipe

3.2 训练配方

Our model’s training is conducted in two sequential stages: multimodal pre-training and long-context continual training.

模型训练分两个先后阶段进行: 多模态预训练和长上下文继续训练.

**Multimodal pre-training.** The initial stage aims to build a strong foundation of general multimodal capabilities. We design specific parallelism strategies for different models. For GLM-4.1V-Thinking and GLM-4.6V-Flash, we set the tensor parallel size to 2. For GLM-4.5V and GLM-4.6V, we set the expert parallel size to 8 and the pipeline parallel size to 4. To ensure balanced expert utilization, we employ a loss-free routing scheme, setting the router bias update rate to 1e-3 and applying an auxiliary sequence-level balance loss with a coefficient of 1e-4. The training utilizes a sequence length of 8,192 and a global batch size of 1,536 for a total of 120,000 steps. The dataset for this stage consists of a carefully curated mixture of all data modalities described in Section 3.1, with the exception of video. To maximize computational efficiency, we employ a data packing strategy where multiple variable-length samples are concatenated into single sequences approaching the maximum length.

**多模态预训练.** 第一阶段的目标是打下扎实的通用多模态能力基础. 我们为不同模型设计了具体的并行策略. GLM-4.1V-Thinking 和 GLM-4.6V-Flash 的张量并行度设为 2. GLM-4.5V 和 GLM-4.6V 的专家并行度设为 8, 流水线并行度设为 4. 为保证专家负载均衡, 我们采用无损失的路由方案, 路由偏置的更新率设为 1e-3, 并加一个系数为 1e-4 的辅助序列级均衡损失. 训练使用 8,192 的序列长度和 1,536 的全局批大小, 共 120,000 步. 这一阶段的数据由 3.1 节描述的所有数据模态精心混合而成, 视频除外. 为最大化计算效率, 我们采用数据打包策略, 把多条长度不一的样本拼接成接近最大长度的单条序列.

**Long-context continual training.** Following pre-training, we perform a continual training stage to extend the model’s capabilities to high-resolution imagery, video, and extended contexts. We augment the training data with video inputs and long-sequence interleaved data exceeding 8k tokens. To accommodate these longer inputs, we increase the sequence length to 32,768 and enhance our parallelism strategy by setting the context parallel size to 4 in addition to the base parallel configuration. This stage is run for an additional 10,000 steps, while maintaining the global batch size of 1,536. Furthermore, we extend the context window of GLM-4.6V to 131,072 tokens. This stage is conducted for an additional 2,000 steps with a global batch size of 128, ensuring robust performance across longer sequence lengths.

**长上下文继续训练.** 预训练之后, 我们做一个继续训练阶段, 把模型的能力扩展到高分辨率图像, 视频和更长的上下文. 我们在训练数据中加入视频输入和超过 8k token 的长序列图文交错数据. 为适应这些更长的输入, 我们把序列长度提高到 32,768, 并在基础并行配置之外把上下文并行度设为 4, 强化并行策略. 这一阶段再训练 10,000 步, 全局批大小保持 1,536. 此外, 我们把 GLM-4.6V 的上下文窗口扩展到 131,072 个 token. 这一阶段再训练 2,000 步, 全局批大小 128, 确保在更长的序列上表现稳健.

> **确认:** 摘要说 GLM-4.6V 的上下文窗口是 128K, 这里写 131,072, 是同一个数吗?
> 是同一个数. 131,072 等于 128 乘 1024, 按二进制习惯就是 128K; 第 1 页摘要的 「128K context window」 说的是窗口长度. 这一段还说明了顺序: 4.1V, 4.5V 和 4.6V 都先在 32,768 上训练 10,000 步, 只有 4.6V 再多一段 2,000 步, 批大小降到 128, 把窗口拉到 131,072. 第 8 页 4.2 节的 SFT 也同样只给 4.6V 用 131,072, 其余模型是 32,768. 第 16 页评测设置里单条回答最长 8,192 token, 视频输入上限 48,000 token, 都在这个窗口以内.

## 4 Supervised Fine-Tuning

4 监督微调

The supervised fine-tuning (SFT) stage functions as a bridge that connects pre-training to reinforcement learning, transforming a base vision-language model (VLM) into one capable of long chain-of-thought (CoT) inference. Our long-CoT corpus is carefully curated to enhance reasoning style and human alignment, spanning both verifiable domains (e.g., STEM problems) and non-verifiable tasks (e.g., instruction following, open-ended writing). Unlike prior workflows [59; 20; 16] that apply SFT to short CoT data, we deliberately omit this step: rather than injecting new knowledge, we view SFT’s role as aligning the model’s existing vision-language understanding with a more effective thinking and response style. This alignment primes the model for a stronger cold start, enabling more efficient and stable reinforcement learning in the next phase.

监督微调 (SFT) 阶段起到衔接预训练和强化学习的桥梁作用, 把一个基础视觉语言模型 (VLM) 变成能做长思维链 (CoT) 推理的模型. 我们精心整理了长 CoT 语料, 用来改善推理风格和人类对齐, 它既覆盖可验证领域 (例如 STEM 题目), 也覆盖不可验证任务 (例如指令遵循, 开放式写作). 以往的工作流程 [59; 20; 16] 会先用短 CoT 数据做 SFT, 我们有意省掉了这一步: 我们认为 SFT 的作用不是注入新知识, 而是把模型已有的视觉语言理解, 对齐到一种更有效的思考和回答风格上. 这种对齐让模型有一个更强的冷启动, 下一阶段的强化学习因此更高效, 更稳定.

> **拆开:** 「we deliberately omit this step」 省掉的到底是哪一步? 是整个 SFT 吗?
> 不是整个 SFT. 这句话的主语是 「prior workflows ... that apply SFT to short CoT data」, 省掉的是 「先用短 CoT 数据做 SFT」 这一步. 长 CoT 的 SFT 照做, 第 8 页 4.1 节整节都在讲这批长 CoT 冷启动数据, 4.2 节给了它的训练配方: 全参数微调, 序列长度 32,768 (4.6V 为 131,072), 全局批大小 32. 省掉短 CoT 的理由也在这一段: 作者把 SFT 看成对齐风格, 不是注入知识.

<!-- page 8 of 42 -->

## 4.1 Supervised Fine-Tuning Data

4.1 监督微调数据

To facilitate subsequent reinforcement learning, we curate a high-quality dataset of long CoT reasoning examples. This dataset is designed to train models to produce coherent, multi-step solutions in a standardized format, thereby underpinning stable and scalable RL training.

为了方便后续强化学习, 我们整理了一个高质量的长 CoT 推理样例数据集. 这个数据集用来训练模型以统一格式给出连贯的多步解答, 从而为稳定, 可扩展的 RL 训练打下基础.

**Data composition.** Our reasoning dataset spans a wide spectrum of domains, with a primary focus on verifiable tasks whose outcomes can be rigorously assessed and refined via reinforcement learning. We also include non-verifiable tasks, such as open-ended visual question answering, to broaden and strengthen the model’s general reasoning capabilities across diverse contexts. The dataset is primarily composed of data in Chinese and English, with a small proportion in other languages. We employ our pre-trained model to filter out instances that are either too easy or excessively hard, maintaining a moderate overall difficulty level suitable for training.

**数据构成.** 我们的推理数据集覆盖很广的领域, 主要侧重可验证任务, 这类任务的结果可以严格评估, 并能通过强化学习改进. 我们也纳入了不可验证任务, 例如开放式视觉问答, 以拓宽并加强模型在各种语境下的通用推理能力. 数据集主要是中文和英文, 另有一小部分其他语言. 我们用预训练模型过滤掉太容易或太难的样本, 让整体难度保持在适合训练的中等水平.

**Response formatting.** Each response follows a standardized structure:

**回答格式.** 每条回答都遵循统一的结构:

&lt;think&gt; {think\_content} &lt;/think&gt; &lt;answer&gt; {answer\_content} &lt;/answer&gt;

(格式: 先是 think 标签包住的思考内容, 再是 answer 标签包住的答案内容.)

The &lt;think&gt; part captures the model’s reasoning process, including strategies such as reflection, backtracking, retrying, and verification. The &lt;answer&gt; part presents a concise, complete and logically sound solution. For verifiable tasks with a specific final answer, the final result in the &lt;answer&gt; part is required to be wrapped with <|begin\_of\_box|> and <|end\_of\_box|>, and only one boxed span is acceptable. This annotation facilitates more accurate answer extraction during the RL phase. Note that we include &lt;think&gt;, &lt;/think&gt;, &lt;answer&gt;, &lt;/answer&gt;, <|begin\_of\_box|>, <|end\_of\_box|> to the tokenizer’s vocabulary as special tokens to facilitate easier and accurate online parsing. Note that in the responses of GLM-4.5V the special tokens &lt;answer&gt; and &lt;/answer&gt; are eliminated.

&lt;think&gt; 部分记录模型的推理过程, 包括反思, 回溯, 重试和验证等策略. &lt;answer&gt; 部分给出简洁, 完整, 逻辑严密的解答. 对于有明确最终答案的可验证任务, &lt;answer&gt; 部分中的最终结果必须用 <|begin\_of\_box|> 和 <|end\_of\_box|> 包起来, 并且只能有一个框选片段. 这种标注便于在 RL 阶段更准确地提取答案. 注意, 我们把 &lt;think&gt;, &lt;/think&gt;, &lt;answer&gt;, &lt;/answer&gt;, <|begin\_of\_box|>, <|end\_of\_box|> 作为特殊 token 加入了 tokenizer 的词表, 以便更容易, 更准确地在线解析. 还要注意, GLM-4.5V 的回答中去掉了 &lt;answer&gt; 和 &lt;/answer&gt; 这两个特殊 token.

**Tool use formatting.** To facilitate reliable function calling and external API interaction, GLM-4.6V adheres to a rigorous structured output protocol for tool invocation:

**工具调用格式.** 为了可靠地进行函数调用和外部 API 交互, GLM-4.6V 在调用工具时遵循一套严格的结构化输出协议:

&lt;tool_call&gt; {function\_name} &lt;arg_key&gt; {arg-key1} &lt;/arg_key&gt; &lt;arg_value&gt; {arg-value-1} &lt;/arg_value&gt; ... &lt;/tool_call&gt;

(格式: tool_call 标签里先写函数名, 然后每个参数拆成一对 arg_key 和 arg_value 标签, 可以有多对.)

The tool definitions and tool calling protocols are explicitly defined within the system prompt, which provides the exhaustive function signatures that define the model’s operational capabilities. Unlike the internal control tokens used for response formatting, the tool-using protocol utilizes an explicit XML schema to structure its external actions. During the inference phase, the model generates a &lt;tool_call&gt; block where each parameter is decomposed into discrete &lt;arg_key&gt; and &lt;arg_value&gt; pairs. This tag-based serialization provides clear semantic boundaries for the parser, effectively mitigating structural hallucinations and ensuring that complex arguments remain contextually grounded. This standardized formatting allows the system to deterministically map natural language intents to executable API calls without requiring specialized tokenizer modifications for every parameter key.

工具定义和工具调用协议在 system prompt 中明确给出, 其中提供了完整的函数签名, 规定模型能执行哪些操作. 与回答格式中使用的内部控制 token 不同, 工具调用协议用显式的 XML 结构来组织对外的动作. 推理阶段, 模型生成一个 &lt;tool_call&gt; 块, 其中每个参数都被拆成独立的 &lt;arg_key&gt; 和 &lt;arg_value&gt; 对. 这种基于标签的序列化给解析器提供了清晰的语义边界, 有效减少结构上的幻觉, 并确保复杂参数始终贴合上下文. 这种统一格式让系统能把自然语言意图确定地映射为可执行的 API 调用, 不需要为每个参数名专门修改 tokenizer.

**Response curation.** The quality of the cold-start dataset is critical to the stability of RL training. In practice, we find that poorly constructed data can lead to training instability or even collapse. To mitigate this, we implement a rigorous data cleaning pipeline. This process enforces strict adherence to formatting conventions (e.g., correct usage of &lt;think&gt; and &lt;answer&gt; tags) and removes examples with inconsistent or noisy reasoning styles. Also, we filter out responses containing mixed-language phrasing or redundant thought patterns.

**回答整理.** 冷启动数据集的质量对 RL 训练的稳定性至关重要. 实践中我们发现, 构建得不好的数据会导致训练不稳定, 甚至崩溃. 为缓解这一问题, 我们实施了严格的数据清洗流水线. 这一流程强制严格遵守格式约定 (例如正确使用 &lt;think&gt; 和 &lt;answer&gt; 标签), 并去掉推理风格不一致或有噪声的样例. 我们还会过滤掉中英混杂的措辞或思路冗余重复的回答.

**Iterative data enhancement.** To improve the quality and challenge level of the cold-start dataset, we incorporate high-quality and informative examples sampled from RL checkpoints back into the cold-start dataset. This iterative enhancement helps expose the model to more useful reasoning patterns discovered during RL, which in turn provide a stronger foundation for subsequent rounds of RL training.

**迭代式数据增强.** 为提高冷启动数据集的质量和难度, 我们把从 RL 检查点中采样到的高质量, 信息量大的样例重新加入冷启动数据集. 这种迭代增强让模型接触到 RL 过程中发现的更有用的推理模式, 进而为后续几轮 RL 训练提供更坚实的基础.

## 4.2 Training Recipe

4.2 训练配方

We perform full-parameter fine-tuning with a sequence length of 32,768 tokens (131,072 tokens for GLM-4.6V) and a global batch size of 32. The training corpus includes the long-form reasoning data described in §4.1, spanning multiple domains. In addition to multimodal data, we also incorporate

我们做全参数微调, 序列长度 32,768 个 token (GLM-4.6V 为 131,072 个 token), 全局批大小 32. 训练语料包括 4.1 节描述的长篇推理数据, 覆盖多个领域. 除多模态数据外, 我们还纳入了 (句子接下页)

<!-- page 9 of 42 -->

high-quality text-only long-form examples covering math problem solving, multi-turn conversation, agent planning, and instruction following. These examples help preserve the model’s core language understanding and general reasoning abilities throughout multimodal fine-tuning.

(接上页) 高质量的纯文本长篇样例, 覆盖数学解题, 多轮对话, 智能体规划和指令遵循. 这些样例有助于在多模态微调的全过程中保住模型核心的语言理解和通用推理能力.

Interestingly, we observe that even when cold-start training uses noisy reasoning data, which contain formatting inconsistencies or repetitive patterns, subsequent RL remains effective. This suggests that imperfect reasoning traces can still provide useful guidance. Nonetheless, models initialized with clean and consistent data show more stable RL convergence and achieve higher overall performance.

有意思的是, 我们观察到, 即使冷启动训练用的是有噪声的推理数据, 里面有格式不一致或重复的模式, 后续的 RL 依然有效. 这说明不完美的推理迹仍然能提供有用的引导. 不过, 用干净, 一致的数据初始化的模型, RL 收敛更稳定, 整体性能也更高.

Different from GLM-4.1V-Thinking, which is a pure thinking model, GLM-4.5V and GLM-4.6V support both the thinking and non-thinking modes, and one can flexibly switch between these two modes according to specific scenarios and requirements. In the SFT stage, we train GLM-4.5V and GLM-4.6V by mixing the thinking and non-thinking data (normal CoT). Concretely, to enable non-thinking mode, we explicitly append a special token /nothink to the user prompt, and train the model to generate empty thinking content when this token is present. We found that directly using the content from the &lt;answer&gt; part in the thinking examples yields better results than constructing a separately curated subset for the non-thinking mode.

GLM-4.1V-Thinking 是纯思考模型, GLM-4.5V 和 GLM-4.6V 与它不同, 同时支持思考和非思考两种模式, 可以根据具体场景和需求在两种模式之间灵活切换. 在 SFT 阶段, 我们把思考数据和非思考数据 (普通 CoT) 混合起来训练 GLM-4.5V 和 GLM-4.6V. 具体来说, 为启用非思考模式, 我们在用户 prompt 末尾显式追加一个特殊 token /nothink, 并训练模型在出现这个 token 时生成空的思考内容. 我们发现, 直接使用思考样例中 &lt;answer&gt; 部分的内容, 效果好于为非思考模式单独整理一个子集.

## 5 Reinforcement Learning: What Is Challenging and What Works

5 强化学习: 难在哪里, 什么有效

After the supervised fine-tuning phase, we primarily rely on reinforcement learning (RL) to enhance the model’s performance. We employ a combination of Reinforcement Learning with Verifiable Rewards (RLVR) and Reinforcement Learning with Human Feedback (RLHF) to conduct large-scale RL across all multimodal domains and capabilities, including STEM problem solving (such as mathematics, physics, chemistry), grounding, optical character recognition (OCR), video understanding, GUI agents, chart and document understanding, logical reasoning, and instruction following.

监督微调阶段之后, 我们主要依靠强化学习 (RL) 提升模型性能. 我们把可验证奖励强化学习 (RLVR) 和人类反馈强化学习 (RLHF) 结合起来, 在所有多模态领域和能力上做大规模 RL, 包括 STEM 解题 (如数学, 物理, 化学), 视觉定位, 光学字符识别 (OCR), 视频理解, GUI 智能体, 图表和文档理解, 逻辑推理和指令遵循.

Our RL framework comprises the following components:

我们的 RL 框架包括以下组件:

• **Data preparation**: Define sub-tasks in each multimodal domain that are suitable for verifiable rewards (for RLVR) or model-based rewards (for RLHF) as supervision signals, and curate large volumes of high-quality data with appropriate difficulty levels and broad coverage.

**数据准备:** 在每个多模态领域中定义适合用可验证奖励 (用于 RLVR) 或基于模型的奖励 (用于 RLHF) 作为监督信号的子任务, 并整理大量难度合适, 覆盖面广的高质量数据.

**Reward system**: Precise rewards are the key to RLVR’s effectiveness. When scaling RL across all multimodal domains, it becomes challenging yet critical to assign accurate rewards to as many tasks as possible within each subdomain. We design a multi-domain, unified reward system that shares common evaluation logic while enabling targeted optimization of robust verifiers for each subdomain.

**奖励系统:** 精确的奖励是 RLVR 生效的关键. 把 RL 推广到所有多模态领域时, 在每个子领域里给尽可能多的任务分配准确的奖励, 既有挑战又很关键. 我们设计了一个多领域的统一奖励系统, 它共享通用的评估逻辑, 同时允许针对每个子领域有针对性地优化稳健的验证器.

• **Training**: Building on our solid foundation of data and reward system, we meticulously refine our RL training recipes toward improved effectiveness, efficiency and stability. We propose and incorporate improvements including Reinforcement Learning with Curriculum Sampling (RLCS), dynamic sampling expansion with ratio EMA, larger batch size, discarding KL and entropy loss, etc.

**训练:** 在扎实的数据和奖励系统基础上, 我们细致地打磨 RL 训练配方, 以提高效果, 效率和稳定性. 我们提出并纳入的改进包括课程采样强化学习 (RLCS), 基于比率 EMA 的动态采样扩充, 更大的批大小, 去掉 KL 损失和熵损失等.

• **Infrastructure**: To efficiently utilize compute resources for large-scale RL training, we develop an in-house high-performance, stable RL infrastructure. It flexibly supports diverse training configurations across multimodal domains (e.g., custom verifiers, data sampling ratios) and incorporates comprehensive optimizations in sampling, training, and beyond.

**基础设施:** 为了在大规模 RL 训练中高效利用算力, 我们自研了一套高性能, 稳定的 RL 基础设施. 它灵活支持跨多模态领域的各种训练配置 (例如自定义验证器, 数据采样比例), 并在采样, 训练等环节做了全面优化.

We find that challenges arise at every layer—from data preparation and reward system to training and infrastructure. Failure in any single dimension can lead to a severe degradation in the efficiency of the RL stage or even its collapse. In this section, we first outline the core workflow of each component, and then share the challenges we encounter during our exploration as well as the best practices we discover.

我们发现, 从数据准备, 奖励系统到训练和基础设施, 每一层都有挑战. 任何一个维度出问题, 都可能让 RL 阶段的效率严重下降, 甚至崩溃. 本节先概述每个组件的核心流程, 再分享我们探索过程中遇到的挑战和找到的最佳实践.

## 5.1 Data Preparation

5.1 数据准备

The objective of data preparation is to select or synthesize as much verifiable data as possible in each subdomain that can be efficiently improved through RL. To this end, we carry out the following stages in sequence.

数据准备的目标是在每个子领域中挑选或合成尽可能多的, 能通过 RL 有效提升的可验证数据. 为此, 我们依次进行以下几个阶段.

<!-- page 10 of 42 -->

**Task identification.** We first define a set of candidate tasks for verification in each multimodal subdomain. For example, while video captioning is open-ended and difficult to evaluate strictly, temporal grounding lends itself to clear correctness judgments.

**任务识别.** 我们先在每个多模态子领域中定义一组可供验证的候选任务. 例如, 视频描述是开放式的, 很难严格评估, 而时间定位则便于做清楚的对错判断.

**Data curation.** We then filter or generate question-answer pairs from these tasks that a verifier can assess with high precision. This process includes converting multiple-choice questions with unique answers into the fill-in-the-blank format to eliminate noise from random guessing during RL.

**数据整理.** 然后从这些任务中过滤或生成验证器能高精度评估的问答对. 这一过程包括把只有唯一答案的选择题改成填空题, 以消除 RL 中随机猜测带来的噪声.

**Quality validation and offline difficulty grading.** Next, we carry out thorough correctness checks and run passk evaluations using multiple existing or prior RL models, combining these results with human difficulty labels to achieve fine-grained difficulty grading.

**质量验证与离线难度分级.** 接下来, 我们做彻底的正确性检查, 并用多个现有模型或之前的 RL 模型跑 passk 评估, 再结合人工难度标签, 实现细粒度的难度分级.

**Pilot RL experiments.** Finally, we perform preliminary RL experiments in each subdomain to confirm the data’s quality and the model’s potential for performance gains.

**RL 试点实验.** 最后, 我们在每个子领域做初步的 RL 实验, 确认数据质量和模型的提升潜力.

## 5.2 Reward System

5.2 奖励系统

We establish a reward system compatible with both RLVR, and RLHF and tailor it for every multi-modal domain. For RLVR tasks, the system first extracts the segment containing the final answer from the rollout outputs, then compares this key answer against the reference answer to determine correctness, and finally returns a reward value in binary (0/1) or continuous form. For RLHF tasks, it directly takes the answer segment of the output and scores it using the reward model.

我们建立了一个同时兼容 RLVR 和 RLHF 的奖励系统, 并为每个多模态领域做了定制. 对 RLVR 任务, 系统先从 rollout 输出中提取包含最终答案的片段, 再把这个关键答案与参考答案比较判断对错, 最后返回二值 (0/1) 或连续形式的奖励值. 对 RLHF 任务, 系统直接取输出中的答案片段, 用奖励模型打分.

As its core, reinforcement learning is an optimization process driven by the feedback from the reward system. Therefore, it’s critical to enhance the accuracy and robustness of the reward system. The possibility of assigning precise rewards is also one of the key reasons why RLVR is currently delivering outstanding results. To achieve multimodal reinforcement learning across all domains, we employ a meticulously crafted reward system to supervise every facet of the model’s abilities—visual perception (OCR, grounding), comprehension (document, chart and video understanding), reasoning (academic and logical problem solving), and agent behavior—thereby necessitating the development of a comprehensive, precise, and robust reward system.

从本质上说, 强化学习是一个由奖励系统反馈驱动的优化过程. 因此, 提升奖励系统的准确性和稳健性至关重要. 能够分配精确的奖励, 也是 RLVR 目前效果突出的关键原因之一. 为了在所有领域实现多模态强化学习, 我们用一套精心打造的奖励系统来监督模型能力的每个方面: 视觉感知 (OCR, 视觉定位), 理解 (文档, 图表和视频理解), 推理 (学术和逻辑解题) 以及智能体行为. 这就要求开发一个全面, 精确, 稳健的奖励系统.

Although some studies report that even random or imperfect feedback can sometimes yield benefits by steering models toward effective output patterns [41], we discover that when training a unified VLM across diverse skills, any weakness in the reward signal for a single capability can derail the entire training. As Figure 5 illustrates, even if the STEM subdomain is provided with high-quality reward, a flaw in the reward for the multi-image QA task led to model collapse across all domains. This highlights that stable, effective RL demands finely tuned, hack-resistant verifiers in every domain—any weak verifier can destabilize and collapse the entire training.

虽然有研究报告说, 即使是随机或不完美的反馈, 有时也能把模型引向有效的输出模式, 从而带来好处 [41], 但我们发现, 在多种技能上训练统一的 VLM 时, 任何一项能力的奖励信号有缺陷, 都可能让整个训练脱轨. 如图 5 所示, 即使 STEM 子领域有高质量的奖励, 多图问答任务的奖励有一个缺陷, 也导致模型在所有领域上崩溃. 这说明稳定有效的 RL 需要每个领域都有精细调校, 抗投机的验证器: 任何一个薄弱的验证器都可能让整个训练失稳乃至崩溃.

We highlight several challenges and difficulties we identified in reward model design during our experiments below, and present our corresponding optimizations and solutions.

下面我们列出实验中在奖励模型设计上发现的几项挑战和难点, 并给出对应的优化和解决方案.

**The extraction of the final answer in RLVR.** For RLVR, we first extract the final answer from the model’s response and then conduct a correctness comparison. There are generally two extraction methods: rule-based extraction according to box markers and extraction via LLMs. The latter is more flexible, which doesn’t force the model to emit explicit box markers around the key answer, avoiding cumbersome format tuning and preserving the original user-friendly response format. We find that for simple academic questions (where the answer is usually a single number) or single-category tasks (where the answer follows a fixed-range format), it’s straightforward to design prompts that enable an LLM to extract the answer precisely. However, in our multimodal, open-domain RL setting, the diversity of questions and answers increases dramatically, making extraction significantly more complex with numerous corner cases. LLM-based extraction is often proved to be inaccurate, causing errors in the subsequent correctness judgment. Moreover, in some cases, the “answer” segment would loop or become excessively long, which is difficult or out-of-distribution for LLMs to extract the final answer, further undermining model-based extraction accuracy. To address these issues, we require the model during RLVR to explicitly mark the final answer with box tokens, and compare only the boxed content against the reference answer.

**RLVR 中最终答案的提取.** 对 RLVR, 我们先从模型回答中提取最终答案, 再做正确性比较. 提取方法一般有两种: 按框标记做基于规则的提取, 以及用 LLM 提取. 后者更灵活, 不强迫模型在关键答案周围输出显式的框标记, 省去了繁琐的格式调整, 也保留了原本对用户友好的回答格式. 我们发现, 对简单的学术题 (答案通常是一个数) 或单一类别的任务 (答案遵循固定范围的格式), 设计能让 LLM 精确提取答案的 prompt 并不难. 但在我们多模态, 开放领域的 RL 设置中, 问题和答案的多样性大幅增加, 提取变得复杂得多, 边界情况很多. 基于 LLM 的提取常常被证明不准确, 导致后续的正确性判断出错. 此外, 有时 「答案」 片段会陷入循环或变得过长, LLM 难以从中提取最终答案, 或者这种输入超出了它的分布, 进一步降低了基于模型的提取准确率. 为解决这些问题, 我们要求模型在 RLVR 中用框 token 显式标出最终答案, 并且只拿框内内容与参考答案比较.

It is worth noting that many prior works use the \boxed{} label to denote final answers. However, when reference answers become complex (for example, the results of GUI agent tasks are expressed as complex function calls), \boxed{} can be ambiguous and difficult to parse automati-

值得注意的是, 很多以往工作用 \boxed{} 标签表示最终答案. 但当参考答案变复杂时 (例如 GUI 智能体任务的结果表示为复杂的函数调用), \boxed{} 可能有歧义, 难以自动 (句子接下页)

<!-- page 11 of 42 -->

Evolution of Rewards under a low-quality reward system:

低质量奖励系统下的奖励变化:

![Chart block](images/p11-chart.png)

(图: 折线图 「mean_reward/STEM」, 横轴 Step 0 到 260. 奖励从约 0.63 爬到约 0.75, 步数 180 之后被红框圈出, 标注 「Constrained model improvements (followed by collapse)」, 框内曲线在 0.72 到 0.78 之间来回, 不再上升.)

![Chart block](images/p11-chart-2.png)

(图: 折线图 「mean_reward / other-single-image」, 奖励从约 0.65 一路升到约 0.91, 标注 「Low quality verifier with reward noise」.)

![Chart block](images/p11-evolution-of-benchmark-score-under-a-low-quality-reward.png)

(图: 折线图 「mean_reward/other-multi-image」. 这张图的文件名写的是 「evolution of benchmark score」, 但画的是第三条奖励曲线. 奖励在前 210 步从约 0.57 缓慢升到约 0.72, 之后被红框圈出, 标注 「Reward hacking」, 很快冲到约 0.92.)

Evolution of benchmark score under a low-quality reward system:

低质量奖励系统下的基准分数变化:

![Chart block](images/p11-chart-3.png)

(图: 折线图 「eval/MMStar」, 从约 65 升到步数 150 附近的约 69, 之后下滑, 步数 250 处跌到约 60.)

![Chart block](images/p11-chart-4.png)

(图: 折线图 「eval/MathVista」, 从约 68.5 升到步数 125 附近的约 75.3, 之后一路下降, 最后跌到约 63.5.)

![Chart block](images/p11-chart-5.png)

(图: 折线图 「eval/AI2D」, 从约 80.3 升到约 83.3 并持平到步数 200 左右, 之后跌到约 76.)

![Chart block](images/p11-figure-5-training-reward-curves-top-and-evaluation.png)

(图: 折线图 「eval/MMMU_Val」. 这张图的文件名写的是 「figure 5 training reward curves」, 实际是第四张评测曲线. 分数在 57 附近起伏, 步数 180 左右到最高约 63, 之后跌到约 54.5.)

Figure 5: Training reward curves (top) and evaluation metrics (bottom) when low-quality verifiers exist in some multimodal sub-domains. The STEM verifier is finely tuned, but the other-single-image and other-multi-image verifiers are not, causing: (a) Reward noise@other-single-image: The model tweaks outputs to drive rewards up without improving actual accuracy. (b) Reward hacking@othermulti-image: The model learns shortcuts that repeatedly fool the verifier, inflating rewards. After step 150, STEM reward growth stalls, the overall multimodal benchmark declines, and STEM-related benchmarks (MMMU, MathVista, AI2D) drop sharply.

图 5: 部分多模态子领域存在低质量验证器时, 训练奖励曲线 (上) 和评测指标 (下). STEM 验证器经过精细调校, other-single-image 和 other-multi-image 的验证器没有, 导致: (a) other-single-image 上的奖励噪声: 模型调整输出把奖励推高, 实际准确率却没有提升. (b) other-multi-image 上的奖励投机: 模型学到能反复骗过验证器的捷径, 奖励虚高. 步数 150 之后, STEM 奖励停止增长, 整体多模态基准下降, 与 STEM 相关的基准 (MMMU, MathVista, AI2D) 急剧下跌.

> **回看:** 第 11 页 7 张图, 文件名和画的内容对得上吗?
> 对不上两处. 回看每张图的标题栏: 上排三张是奖励曲线, 依次为 `p11-chart.png` (STEM), `p11-chart-2.png` (other-single-image), `p11-evolution-of-benchmark-score-under-a-low-quality-reward.png` (other-multi-image); 下排四张是评测曲线, 依次为 `p11-chart-3.png` (MMStar), `p11-chart-4.png` (MathVista), `p11-chart-5.png` (AI2D), `p11-figure-5-training-reward-curves-top-and-evaluation.png` (MMMU_Val). 第三张和第七张是 MinerU 拿相邻的文字给图起的名, 名字说的内容和图不符. 图题说 「After step 150」, 而 STEM 奖励的红框从 180 步左右才开始, other-multi-image 的奖励投机从 210 步左右开始; 评测曲线里 MathVista 在 125 步就见顶了. 150 是一个大致的分界, 不是某条曲线上的精确拐点.

cally. Therefore, we introduced special tokens into the vocabulary and instead mark answer spans as: <|begin\_of\_box|>{FINAL\_ANSWER}<|end\_of\_box|>.

(接上页) 解析. 因此, 我们在词表中引入特殊 token, 把答案片段标成: <|begin\_of\_box|>{FINAL\_ANSWER}<|end\_of\_box|>.

**Avoid reward hacking.** A coarse or incomplete reward design can lead the model to discover shortcuts for boosting its reward rather than truly improving its task performance. For example, in pilot experiments, we find that after more than 500 training iterations, an imprudently designed verifier could be hacked as follows: for a counting problem, the model would answer “a correct number between 0 and 10”, and for a relativity question about speed, it would answer “a velocity very close to the speed of light” – responses that successfully fool some LLM-based reward models and get high reward.

**避免奖励投机.** 粗糙或不完整的奖励设计, 会让模型找到抬高奖励的捷径, 而不是真正提升任务表现. 例如在试点实验中我们发现, 训练超过 500 次迭代后, 一个设计欠妥的验证器会被这样钻空子: 对一道计数题, 模型回答 「0 到 10 之间的一个正确数字」; 对一道关于速度的相对论问题, 模型回答 「一个非常接近光速的速度」. 这些回答成功骗过了一些基于 LLM 的奖励模型, 拿到了高奖励.

**Domain-specific reward system.** The optimal verifier varies between multimodal subdomains and is tightly coupled to the task—for instance, “43” and “43.0” are equivalent in a math problem but not in an OCR context. To deliver more accurate rewards across all domains, we develop a domain-specific reward system with the following features:

**领域专属奖励系统.** 最优的验证器因多模态子领域而异, 并与任务紧密绑定. 例如, 「43」 和 「43.0」 在数学题里等价, 在 OCR 场景里却不等价. 为了在所有领域给出更准确的奖励, 我们开发了一个领域专属的奖励系统, 它有以下特点:

• Shared verification functions: Common checks—such as format validation, boxed content extraction, and exact matching—are implemented as reusable functions to streamline development.

共享的验证函数: 格式校验, 框内容提取, 精确匹配等通用检查实现为可复用的函数, 以简化开发.

• Domain-specific modules: Each domain has its own submodule supporting complex verification logic, including branching workflows, functional evaluations, and model-based judgments driven by custom judge prompts and hyperparameters.

领域专属模块: 每个领域有自己的子模块, 支持复杂的验证逻辑, 包括分支流程, 函数式评估, 以及由自定义评判 prompt 和超参数驱动的模型评判.

• Unit testing: To validate the reward system in each domain, we recommend defining unit tests that target that domain’s output distribution and iteratively refining the reward logic based on test results.

单元测试: 为验证每个领域的奖励系统, 我们建议针对该领域的输出分布定义单元测试, 并根据测试结果迭代改进奖励逻辑.

For example, in chart QA, numeric answers are verified against a relative tolerance threshold; for textual answers, we first check for an exact match and, if none is found, fall back to an LLM-based semantic equivalence assessment. We summarize some of our domain-specific verifiers below, and open-source this reward system in our GitHub repository to support further academic research.

例如在图表问答中, 数值答案按相对容差阈值来验证; 文本答案先检查是否精确匹配, 如果不匹配, 就退回到基于 LLM 的语义等价判断. 下面汇总了我们的部分领域验证器, 并在 GitHub 仓库中开源了这个奖励系统, 以支持后续的学术研究.

Beyond the domain-specific content checking above, we also build a format-and-style-checking reward system using both rule-based and model-based judgments. In **format checking**, any response to non-verifiable data whose &lt;answer&gt; content contains the special markers

除了上面针对各领域内容的检查, 我们还用规则和模型两种判断, 构建了一个检查格式和风格的奖励系统. 在**格式检查**中, 对不可验证数据的任何回答, 如果其 &lt;answer&gt; 内容包含特殊标记 (句子接下页)

<!-- page 12 of 42 -->

Table 1: Domain-specific reward design in the reward system of GLM-V.

表 1: GLM-V 奖励系统中的领域专属奖励设计.

| Category | Domain | Rule | Model | Binary | Reward design details |
| --- | --- | --- | --- | --- | --- |
| STEM | Math Physics Chemistry | ✓✓✓ | ✓✓✓ | ✓✓✓ | Numeric: numeric matching via Sympy with tolerance; Others: exact matching or LLM judge. If physical units present, use LLM judgment; otherwise, similar to Math. If chemical units present, use LLM judgment; otherwise, similar to Math. |
| Long Document | Long Document Chart | ✓ | ✓✓ | ✓✓ | Semantic matching via LLM. Numeric: similar to Math (except Year); Textual: exact match or LLM judge. |
| Chart &amp; OCR | OCR | ✓ |  |  | Using edit distance, reward = 1 - d<sup>edit</sup>(ans, gt) . max(\|ans\|, \|gt\|) |
| General VQA | VQA GeoGuess | ✓✓ | ✓✓ | ✓ | Try exact matching with Sympy first. If that fails, then fall back to model judgment. Semantic matching via LLM. |
| Visual Grounding | Grounding | ✓ |  |  | Reward = #boxes with IoU > τ divided by total boxes. |
| Spatial Rec &amp; Reasoning | Spatial |  | ✓ | ✓ | Try exact matching with Sympy first. If that fails, then fall back to model judgment. |
| GUI Agents | GUI Agent | ✓ | ✓ |  | Action prediction: action+IoU; Grounding: IoU; QA: exact or semantic matching. |
| Video | Video | ✓ | ✓ | ✓ | Exact matching, or semantic matching via LLM judge. |

| 类别 | 领域 | 规则 | 模型 | 二值 | 奖励设计细节 |
| --- | --- | --- | --- | --- | --- |
| STEM | 数学 | ✓ | ✓ | ✓ | 数值: 用 Sympy 按容差做数值匹配; 其他: 精确匹配或 LLM 评判. |
| STEM | 物理 | ✓ | ✓ | ✓ | 如果带物理单位, 用 LLM 评判; 否则同数学. |
| STEM | 化学 | ✓ | ✓ | ✓ | 如果带化学单位, 用 LLM 评判; 否则同数学. |
| 长文档 | 长文档 |  | ✓ | ✓ | 用 LLM 做语义匹配. |
| 图表与 OCR | 图表 | ✓ | ✓ | ✓ | 数值: 同数学 (年份除外); 文本: 精确匹配或 LLM 评判. |
| 图表与 OCR | OCR | ✓ |  |  | 用编辑距离, 奖励 = 1 − d_edit(ans, gt) / max(\|ans\|, \|gt\|). |
| 通用 VQA | VQA | ✓ | ✓ | ✓ | 先试用 Sympy 精确匹配, 不行再退回模型评判. |
| 通用 VQA | GeoGuess | ✓ | ✓ |  | 用 LLM 做语义匹配. |
| 视觉定位 | 定位 | ✓ |  |  | 奖励 = IoU 大于 τ 的框数 / 框的总数. |
| 空间识别与推理 | 空间 |  | ✓ | ✓ | 先试用 Sympy 精确匹配, 不行再退回模型评判. |
| GUI 智能体 | GUI 智能体 | ✓ | ✓ |  | 动作预测: 动作 + IoU; 定位: IoU; 问答: 精确匹配或语义匹配. |
| 视频 | 视频 | ✓ | ✓ | ✓ | 精确匹配, 或用 LLM 评判做语义匹配. |

(中文表按 PDF 第 12 页拆成一个领域一行, 勾号的列位置按 PDF 里勾号的横坐标对齐. md 把同一类别下的几行合并成一格, 勾号挤在一起, 例如 「✓✓✓」, 看不出每个勾属于哪一行; 类别一栏 md 也错了位, PDF 里 「Long Document」 只管长文档一行, 图表和 OCR 同属 「Chart & OCR」.)

> **核对:** 表 1 里 OCR 的奖励公式, md 写成 「1 - d<sup>edit</sup>(ans, gt) . max(|ans|, |gt|)」, 是乘还是除?
> 是除. 对照 PDF 第 12 页, 公式是 1 减去一个分式, 分子是 d_edit(ans, gt), 分母是 max(|ans|, |gt|), 末尾那个点是句号. MinerU 把分数线丢了, 分母被挤到同一行. 按除法读, 这是归一化编辑距离: 完全一致得 1, 编辑距离等于较长串的长度时得 0. 如果按乘法读, 奖励会随长度变成很大的负数, 和 「reward」 的取值范围对不上.

<|begin\_of\_box|> <|end\_of\_box|> is penalized with a minimal reward. For **style checking**, we similarly assign a low reward if the &lt;think&gt; content or &lt;answer&gt; content includes extensive mixed Chinese and English segments or large blocks of repetitive text. In addition, a text-based reward model evaluates the &lt;answer&gt; content for instruction compliance and fluency, encouraging outputs that adhere closely to the prompt while remaining coherent and logically rigorous.

(接上页) <|begin\_of\_box|> <|end\_of\_box|>, 就只给最低奖励. 在**风格检查**中, 如果 &lt;think&gt; 或 &lt;answer&gt; 内容里有大段中英混杂, 或者大块重复文字, 我们同样给低奖励. 此外, 一个基于文本的奖励模型会评估 &lt;answer&gt; 内容是否遵循指令, 是否流畅, 鼓励紧扣 prompt, 同时连贯, 逻辑严密的输出.

## 5.3 Reinforcement Learning with Curriculum Sampling (RLCS)

5.3 课程采样强化学习 (RLCS)

During RL training, we blend data from each multimodal domain in predetermined proportions, verify every domain using the reward system described in section 5.2, and optimize with GRPO [42] objective. To ensure that GLM-V models reach their full potential for each multimodal subdomain, we first run pilot experiments on each subdomain to evaluate its training difficulty, performanceimprovement potential and the required training tokens in the corresponding dataset. These insights guide the allocation of training data proportions in the RL process.

RL 训练中, 我们按预定比例混合各多模态领域的数据, 用 5.2 节描述的奖励系统验证每个领域, 并用 GRPO [42] 目标做优化. 为了让 GLM-V 模型在每个多模态子领域都发挥出全部潜力, 我们先在每个子领域上跑试点实验, 评估它的训练难度, 性能提升潜力, 以及对应数据集需要的训练 token 数. 这些认识指导 RL 过程中训练数据比例的分配.

One challenge is that, as RL training progresses, the model’s effective learning efficiency inevitably declines as its capabilities improve: many examples become too trivial to drive further learning. For instance, in GRPO, a rollout batch in which all samples are answered correctly yields no useful gradient. In our pilot experiment, over half of all prompts achieve accuracy over 90% after just 200 training steps. Meanwhile, rollout efficiency remains the primary bottleneck: the bulk of training time is consumed by rollouts. Consequently, it is essential to select the most informative, appropriately challenging problems for rollout.

一个挑战是, 随着 RL 训练推进, 模型能力提升, 有效学习效率不可避免地下降: 很多样例变得太简单, 无法再推动学习. 例如在 GRPO 中, 如果一个 rollout 批次里所有样本都答对了, 就得不到有用的梯度. 在我们的试点实验中, 仅训练 200 步后, 就有一半以上的 prompt 准确率超过 90%. 与此同时, rollout 效率仍是主要瓶颈: 大部分训练时间都花在 rollout 上. 因此, 挑选信息量最大, 难度合适的问题做 rollout 至关重要.

To maximize learning efficiency, we propose Reinforcement Learning with Curriculum Sampling (**RLCS**), which applies the insight of curriculum learning to online sampling. We employ an adaptive curriculum that continuously adjusts the difficulty of training samples to match the model’s evolving capabilities, ensuring each update is maximally informative. To achieve this, we evaluate sample difficulty both offline and online. Before training, we assess the inherent difficulty of every sample by running pass@k evaluations across the full dataset with several established vision-language models (or earlier RL checkpoints) and merging those quantitative scores with expert human difficulty annotations. This process yields a set of fine-grained difficulty labels that partition our data into multiple tiers, from very easy through very hard. During training, we perform online difficulty grading. For each generated rollout, we record the pass@k outcome, map it to its corresponding difficulty tier, and merge these results with our offline labels. This online difficulty distribution also offers valuable insights into the model’s current performance.

为了最大化学习效率, 我们提出课程采样强化学习 (**RLCS**), 把课程学习的思路用到在线采样上. 我们采用自适应课程, 不断调整训练样本的难度, 使之匹配模型不断变化的能力, 确保每次更新都有最大信息量. 为此, 我们在离线和在线两方面评估样本难度. 训练前, 我们用几个成熟的视觉语言模型 (或更早的 RL 检查点) 在整个数据集上跑 pass@k 评估, 衡量每个样本固有的难度, 并把这些量化分数与专家人工难度标注合并. 这一过程得到一组细粒度的难度标签, 把数据分成从非常容易到非常难的多个档位. 训练中, 我们做在线难度分级. 对每次生成的 rollout, 记录 pass@k 结果, 映射到对应的难度档, 再与离线标签合并. 这种在线难度分布也能很好地反映模型当前的表现.

By leveraging these difficulty labels alongside the model’s subcategory performance, we continuously re-weight the sampling ratios of different difficulty categories at the granularity of training iterations. The core idea is to down-sample examples that are too trivial, as well as those that currently prove too challenging, and boost exposure to the mid-range difficulties where the model gains the most. Empirically, we observe that RLCS significantly accelerates model improvement and consistently leads to performance gains.

借助这些难度标签以及模型在各子类上的表现, 我们以训练迭代为粒度, 不断重新调整不同难度类别的采样比例. 核心思路是对太简单和当前太难的样例都降采样, 增加模型收获最大的中等难度样例的出现机会. 经验上, 我们观察到 RLCS 显著加快了模型的提升, 并稳定带来性能收益.

<!-- page 13 of 42 -->

Besides, we make particular efforts to improve the effectiveness, efficiency, and stability of RLCS. Here, we share as comprehensively as possible the lessons learned, insights gained, and methods developed in optimizing the training process.

此外, 我们特别努力地提升 RLCS 的效果, 效率和稳定性. 这里我们尽量完整地分享在优化训练过程中学到的经验, 得到的认识和开发的方法.

## 5.3.1 Improving Effectiveness

5.3.1 提升效果

To improve the performance upper bound of multimodal reinforcement learning, we propose and incorporate the following enhancements:

为提高多模态强化学习的性能上限, 我们提出并纳入了以下改进:

• **Larger batch size.** When mixing multi-domain multimodal data during training, a relatively large batch size is recommended to achieve a higher performance ceiling in the long run.

**更大的批大小.** 训练中混合多领域多模态数据时, 建议使用相对较大的批大小, 长期来看能达到更高的性能上限.

• **Dynamic sampling expansion via ratio EMA.** In GRPO, when both entropy and KL losses are removed, a rollout batch composed entirely of correct or entirely of incorrect samples provides no useful gradient. In other words, the all-correct/incorrect prompts reduce the usable batch size. As the proportion of these all-correct or all-incorrect batches grows or fluctuates, the effective batch size can vary wildly, degrading training stability. To address this, we perform rollouts with an intentional oversampling factor expansion\_ratio, and then select the subset of samples whose difficulty is most balanced (i.e., with the numbers of correct and incorrect responses as close as possible). Concretely, for each rollout, we compute the expansion ratio as expansion\_ratio = 1/(1 − not\_valid\_sample\_rate), where not\_valid\_sample\_rate denotes the fraction of samples that are all-correct or all-incorrect in the last iteration. We then maintain an exponential moving average, expansion\_ratio\_ema, of this ratio and use it as the oversampling coefficient in the next iteration. Compared to [66], this method predetermines the total number of rollout samples, facilitating parallel sampling and balanced rollout allocation, which aligns more closely with the underlying large-scale RL infrastructure for greater efficiency.

**基于比率 EMA 的动态采样扩充.** 在 GRPO 中, 去掉熵损失和 KL 损失之后, 一个全部答对或全部答错的 rollout 批次提供不了有用的梯度. 换句话说, 全对或全错的 prompt 会减少可用的批大小. 当这类全对或全错批次的比例增加或波动时, 有效批大小可能剧烈变化, 损害训练稳定性. 为解决这一问题, 我们以一个有意的过采样系数 expansion\_ratio 做 rollout, 然后选出难度最均衡的样本子集 (即答对和答错的回答数尽量接近). 具体来说, 每次 rollout 时按 expansion\_ratio = 1/(1 − not\_valid\_sample\_rate) 计算扩充比例, 其中 not\_valid\_sample\_rate 是上一次迭代中全对或全错样本所占的比例. 然后我们维护这个比例的指数移动平均 expansion\_ratio\_ema, 用作下一次迭代的过采样系数. 与 [66] 相比, 这种方法预先确定 rollout 样本总数, 便于并行采样和均衡分配 rollout, 与底层的大规模 RL 基础设施更契合, 效率更高.

> **停一下:** expansion\_ratio = 1/(1 − not\_valid\_sample\_rate) 代一个数进去是多少?
> 假设上一轮有一半样本全对或全错, not\_valid\_sample\_rate 为 0.5, 扩充比例就是 1/(1 − 0.5) = 2, 下一轮按 2 倍过采样, 扣掉无效的那一半, 剩下的有效样本大约回到原来的批大小. 比例是 0.2 时扩充 1.25 倍, 0.8 时扩充 5 倍. 实际用的是这个比例的 EMA, 不是单轮的值, 所以一轮的波动不会让采样量忽大忽小. 第 14 页 5.4 节把这一项又列进基础设施, 理由是样本数能事先算好, 并行 rollout 更好排. 原文没有给 EMA 的衰减系数.

• **Force answering.** When the thinking process becomes excessively long, it may be truncated by the rollout length limit. Because the model then fails to produce an answer, it is typically assigned a reward of zero. However, such lengthy reasoning isn’t necessarily incorrect — for difficult questions, the generated part of an overlong thinking path can be perfectly valid. Truncating in this way not only wastes rollout budget but also injects noise into training. To address this, we enforce a forced truncation by inserting a &lt;/think&gt; token , which prompts the model to emit a final answer and allows us to award a fair reward for its reasoning [64]. We found that this method encourages the model to learn how to provide an appropriate answer after any amount of thinking, facilitating dynamic control of the thinking budget at test time.

**强制作答.** 思考过程过长时, 可能被 rollout 长度上限截断. 模型因此给不出答案, 通常会得到零奖励. 然而这么长的推理不一定是错的: 对难题来说, 一条过长思考路径中已经生成的部分可能完全正确. 这样截断不仅浪费 rollout 预算, 还会给训练引入噪声. 为解决这个问题, 我们插入一个 &lt;/think&gt; token 做强制截断, 促使模型给出最终答案, 从而能为它的推理给出公平的奖励 [64]. 我们发现这种方法促使模型学会在任意长度的思考之后给出恰当的答案, 便于在 TestingTime 动态控制思考预算.

• **Discard KL loss.** Compared to text-only models, vision-language models usually experience a faster increase in KL divergence during reinforcement learning. However, when we apply a KL loss to explicitly suppress this increase, the model’s capabilities are noticeably constrained. Therefore, we remove the KL loss.

**去掉 KL 损失.** 与纯文本模型相比, 视觉语言模型在强化学习中 KL 散度通常上升得更快. 然而, 当我们加 KL 损失显式压制这种上升时, 模型能力明显受限. 因此我们去掉了 KL 损失.

• **Clip-higher.** In multimodal RL, similar to [66], increasing the upper clipping bound of the importance sampling ratio also proved useful for improving both off-policy performance and preventing excessive entropy collapse.

**Clip-higher.** 在多模态 RL 中, 与 [66] 类似, 提高重要性采样比率的裁剪上界, 同样被证明有助于提升 off-policy 表现, 并防止熵过度坍缩.

We also share our observations and insights gained from large-scale cross-domain reinforcement learning. We believe that these insights can help improve the RL effectiveness in the future.

我们还分享在大规模跨领域强化学习中得到的观察和认识. 我们相信这些认识有助于今后提升 RL 的效果.

• **The peak performance in the RL phase does not perfectly correlate with a cold-start SFT model’s performance.** For instance, in one of our experiments, increasing cold-start training from 1,000 to 2,000 steps boosts the post-cold-start performance by about two points on average. However, after RL, both checkpoints converge to nearly the same performance. In other words, a higher score after cold-start does not guarantee greater RL potential; with proper training, RL can elevate base models of equal inherent potential to the same peak.

**RL 阶段的峰值性能与冷启动 SFT 模型的性能并不完全相关.** 例如在我们的一项实验中, 冷启动训练从 1,000 步增加到 2,000 步, 冷启动后的平均性能提高了约两个点. 但经过 RL 之后, 两个检查点收敛到几乎相同的性能. 换句话说, 冷启动后分数更高并不保证 RL 潜力更大; 只要训练得当, RL 能把固有潜力相同的基座模型提到同样的峰值.

• **Domain interference in RL is less pronounced than in SFT.** Performance on under- or untrained domains that are orthogonal to the RL training domain can be preserved quite well. Moreover, cross-domain generalization, where improvements in one domain transfer to others, is frequently observed.

**RL 中的领域干扰没有 SFT 中明显.** 与 RL 训练领域正交, 训练不足或未训练的领域, 性能能保持得相当好. 此外, 经常能观察到跨领域泛化, 即一个领域的提升迁移到其他领域.

<!-- page 14 of 42 -->

## 5.3.2 Improving Stability

5.3.2 提升稳定性

To enhance training robustness and prevent collapse during RL, we identified several key factors that significantly impact stability throughout the training pipeline:

为增强训练的稳健性, 防止 RL 中的崩溃, 我们找到了几个在整个训练流水线中对稳定性影响显著的关键因素:

• The quality of cold-start SFT data has a critical impact on training stability. Therefore, it is strongly recommended to maintain the cold-start data quality above a certain threshold. For example, if the cold-start data contains a large amount of meaningless thinking paths, the resulting model exhibits severe instability during RL training or even leads to training collapse.

冷启动 SFT 数据的质量对训练稳定性有关键影响. 因此强烈建议让冷启动数据质量保持在一定门槛之上. 例如, 如果冷启动数据含有大量无意义的思考路径, 得到的模型在 RL 训练中会严重不稳定, 甚至导致训练崩溃.

• We found that incorporating an entropy loss to promote diversity could cause the model to produce garbled output, which eventually leads to training collapse, so we removed the entropy loss.

我们发现, 加入熵损失来促进多样性, 可能让模型输出乱码, 最终导致训练崩溃, 所以我们去掉了熵损失.

• During rollouts, using top-p = 1 instead of a smaller value produces more stable RL training. Although some prior works advocate lowering top-p (e.g. to 0.9) to reduce variance and stabilize rollouts, we observe that this actually increases the risk of garbling over time. In contrast, setting top-p to 1 eliminates the garbled outputs that tend to appear in later iterations. We hypothesize that top-p = 1 ensures full vocabulary coverage, preventing the under-learning of rare tokens and thus maintaining clean output. While this choice does introduce more randomness during sampling, it ultimately enhances both stability and performance in the RL phase.

rollout 时用 top-p = 1, 而不是更小的值, RL 训练更稳定. 虽然有些以往工作主张降低 top-p (例如到 0.9) 以减小方差, 稳定 rollout, 但我们观察到, 这样做反而会随时间增加出现乱码的风险. 相反, 把 top-p 设为 1 消除了后期迭代中容易出现的乱码输出. 我们推测 top-p = 1 保证了对整个词表的覆盖, 避免罕见 token 学习不足, 从而保持输出干净. 这个选择确实给采样带来更多随机性, 但最终提升了 RL 阶段的稳定性和性能.

• We compared per-sample (averaging tokens’ loss within each sample, then averaging across samples) and per-token (averaging all tokens’ loss within a batch, then averaging across batches) loss computation methods and observed no significant difference in mean reward, but per-sample loss computation yielded more stable training.

我们比较了按样本 (先在每个样本内平均各 token 的损失, 再在样本间平均) 和按 token (先在一个批次内平均所有 token 的损失, 再在批次间平均) 两种损失计算方法, 发现平均奖励没有显著差别, 但按样本计算损失训练更稳定.

• Although format-based rewards during RL can help nudge outputs toward the correct structure, we strongly recommend that the model fully learn the required output format during the cold-start phase rather than depending on RL. In our experience, if the format errors frequently occur, the mixture of format and correctness reward may destabilize training.

虽然 RL 中基于格式的奖励能帮助把输出推向正确的结构, 但我们强烈建议让模型在冷启动阶段就完全学会所需的输出格式, 而不是依赖 RL. 按我们的经验, 如果格式错误频繁出现, 格式奖励和正确性奖励混在一起, 可能让训练失稳.

## 5.4 Infrastructure

5.4 基础设施

To maximize RL training efficiency and performance, we extensively optimize our RL infrastructure, focusing on the following components:

为最大化 RL 训练的效率和性能, 我们对 RL 基础设施做了大量优化, 重点是以下几个组件:

• **Load balancing of sequence lengths across DP ranks.** Since the rollout length of each sample is unknown beforehand, some ranks may be assigned many extremely long sequences (e.g., video or long-document prompts, or difficult problems with long responses). Without balancing total sequence length across DP (Data Parallel) ranks, the slowest rank dictates the overall training speed. To address this, after rollout and before assigning training samples to each DP rank, we balance both sequence length and compute load across ranks so that forward-backward passes per rank remain within a tight range, thereby maximizing throughput.

**DP rank 之间的序列长度负载均衡.** 每个样本的 rollout 长度事先不知道, 所以有些 rank 可能分到很多极长的序列 (例如视频或长文档 prompt, 或回答很长的难题). 如果不在 DP (数据并行) rank 之间均衡总序列长度, 最慢的 rank 就决定了整体训练速度. 为解决这个问题, 我们在 rollout 之后, 把训练样本分给各 DP rank 之前, 对序列长度和计算负载都做均衡, 让每个 rank 的前向和反向计算量落在一个很窄的范围内, 从而最大化吞吐.

• **Intra-rank training with sequence packing and gradient accumulation.** Because sample lengths vary unpredictably in RL, we cannot know in advance how many forward passes each DP rank will perform. We solve this by combining sequence packing with gradient accumulation: each optimization step comprises multiple micro-steps of forward and backward passes, where each micro-step packs several samples into a fixed-length sequence of length context\_length = 32K, padding unused positions. During training, we weight and average micro-step gradients by sample count, which is mathematically equivalent to computing gradients over the entire rollout batch at once.

**rank 内部用序列打包加梯度累积训练.** RL 中样本长度变化难以预测, 我们无法事先知道每个 DP rank 要做多少次前向. 我们把序列打包和梯度累积结合起来解决这个问题: 每个优化步包含多个前向加反向的微步, 每个微步把若干样本打包成一条固定长度的序列, 长度 context\_length = 32K, 没用上的位置补齐. 训练时, 我们按样本数对各微步的梯度加权平均, 这在数学上等价于一次性在整个 rollout 批次上计算梯度.

• **Sample packing and reorganization within DP ranks.** Building on the previous strategy, training is decoupled from the number of samples per forward-backward pass. We therefore apply an efficient sample re-packing heuristic to complete all samples in as few micro-steps as possible. In practice, this optimization halves our forward-backward time.

**DP rank 内部的样本打包与重组.** 在上一项策略的基础上, 训练与每次前向反向处理多少样本解耦. 因此我们用一个高效的样本重新打包启发式算法, 用尽可能少的微步处理完所有样本. 实践中, 这项优化让我们的前向反向时间减半.

• **Dynamic sampling expansion via ratio EMA.** To oversample and then select moderately difficult examples, we propose and implement dynamic sampling expansion via ratio EMA algorithm, which is detailed in section 5.3.1. Our approach precomputes the required sample count for parallel rollout, greatly improving efficiency.

**基于比率 EMA 的动态采样扩充.** 为了先过采样再挑出中等难度的样例, 我们提出并实现了基于比率 EMA 的动态采样扩充算法, 细节见 5.3.1 节. 我们的方法预先算好并行 rollout 所需的样本数, 大大提高了效率.

<!-- page 15 of 42 -->

<table><tr><td>Task</td><td>Benchmark</td><td>GLM-4.1V</td><td>GLM-4.5V</td><td>GLM-4.6V</td><td>Step-3</td><td>Qwen2.5-VL</td><td>Kimi-VL-2506</td><td>Gemma-3</td></tr><tr><td>Size Mode</td><td></td><td>9B thinking</td><td>106B (A12B) thinking</td><td>106B (A12B) thinking</td><td>321B (A38B) thinking</td><td>72B non-thinking</td><td>16B (A3B) thinking</td><td>27B non-thinking</td></tr><tr><td rowspan="8">General VQA</td><td>MMBench V1.1</td><td>85.8</td><td>88.2</td><td>88.8</td><td>81.1*</td><td>88.0</td><td>84.4</td><td>80.1*</td></tr><tr><td>MMBench V1.1 (CN)</td><td>84.7</td><td>88.3</td><td>88.2</td><td>81.5*</td><td>86.7*</td><td>80.7*</td><td>84.8*</td></tr><tr><td>MMStar</td><td>72.9</td><td>75.3</td><td>75.9</td><td>69.0*</td><td>70.8</td><td>70.4</td><td>60.0*</td></tr><tr><td>BLINK (Val)</td><td>65.1</td><td>65.3</td><td>65.5</td><td>62.7*</td><td>58.0*</td><td>53.5*</td><td>52.9*</td></tr><tr><td>MUIRBENCH</td><td>74.7</td><td>75.3</td><td>77.1</td><td>75.0*</td><td>62.9*</td><td>63.8*</td><td>50.3*</td></tr><tr><td>HallusionBench</td><td>63.2</td><td>65.4</td><td>62.3</td><td>64.2</td><td>56.8*</td><td>59.8*</td><td>45.8*</td></tr><tr><td>ZeroBench (sub)</td><td>19.2</td><td>23.4</td><td>25.8</td><td>23.0</td><td>19.5*</td><td>16.2*</td><td>17.7*</td></tr><tr><td> $GeoBench^1$ </td><td>76.0</td><td>79.7</td><td>-</td><td>72.9*</td><td>74.3*</td><td>48.0*</td><td>57.5*</td></tr><tr><td rowspan="9">STEM</td><td>MMMU (Val)</td><td>68.0</td><td>75.4</td><td>76.0</td><td>74.2</td><td>70.2</td><td>64.0</td><td>62.0*</td></tr><tr><td>MMMU Pro</td><td>57.1</td><td>65.2</td><td>66.0</td><td>58.6</td><td>51.1</td><td>46.3</td><td>37.4*</td></tr><tr><td>MathVista</td><td>80.7</td><td>84.6</td><td>85.2</td><td>79.2*</td><td>74.8</td><td>80.1</td><td>64.3*</td></tr><tr><td>MathVision</td><td>54.4</td><td>65.6</td><td>63.5</td><td>64.8</td><td>38.1</td><td>54.4*</td><td>39.8*</td></tr><tr><td>MathVerse</td><td>68.4</td><td>72.1</td><td>75.4</td><td>62.7*</td><td>47.8*</td><td>54.6*</td><td>34.0*</td></tr><tr><td>DynaMath</td><td>42.5</td><td>53.9</td><td>54.5</td><td>50.1</td><td>36.1*</td><td>28.1*</td><td>28.5*</td></tr><tr><td>LogicVista</td><td>60.4</td><td>62.4</td><td>62.1</td><td>60.2*</td><td>56.2*</td><td>51.4*</td><td>47.3*</td></tr><tr><td>AI2D</td><td>87.9</td><td>88.1</td><td>88.8</td><td>83.7*</td><td>87.6*</td><td>81.9*</td><td>80.2*</td></tr><tr><td>WeMath</td><td>63.8</td><td>68.8</td><td>65.9</td><td>59.8</td><td>46.0*</td><td>42.0*</td><td>37.9*</td></tr><tr><td rowspan="4">Long Document,OCR &amp; Chart</td><td>MMLongBench-Doc</td><td>42.4</td><td>44.7</td><td>54.9</td><td>31.8*</td><td>35.2*</td><td>42.1</td><td>28.4*</td></tr><tr><td>OCRBench</td><td>84.2</td><td>86.5</td><td>86.5</td><td>83.7*</td><td>85.1*</td><td>86.9</td><td>75.9*</td></tr><tr><td>ChartQAPro</td><td>59.5</td><td>64.0</td><td>65.5</td><td>56.4*</td><td>46.7*</td><td>23.7*</td><td>37.6*</td></tr><tr><td>ChartMuseum</td><td>48.8</td><td>55.3</td><td>58.4</td><td>40.0*</td><td>39.6*</td><td>33.6*</td><td>23.9*</td></tr><tr><td rowspan="3">Visual Grounding</td><td>RefCOCO-avg (val)</td><td>85.3</td><td>91.3</td><td>88.6</td><td>20.2*</td><td>90.3</td><td>33.6*</td><td>2.4*</td></tr><tr><td>TreeBench</td><td>37.5</td><td>50.1</td><td>51.4</td><td>41.3*</td><td>42.3</td><td>41.5*</td><td>33.8*</td></tr><tr><td>Ref-L4-test</td><td>86.8</td><td>89.5</td><td>88.9</td><td>12.2*</td><td>80.8*</td><td>51.3*</td><td>2.5*</td></tr><tr><td rowspan="4">Spatial Reco &amp; Reasoning</td><td>OmniSpatial</td><td>47.7</td><td>51.0</td><td>52.0</td><td>47.0*</td><td>47.9</td><td>37.3*</td><td>40.8*</td></tr><tr><td>CV-Bench</td><td>85.0</td><td>87.3</td><td>87.6</td><td>80.9*</td><td>82.0*</td><td>79.1*</td><td>74.6*</td></tr><tr><td>ERQA</td><td>45.8</td><td>50.0</td><td>47.8</td><td>44.5*</td><td>44.8*</td><td>36.0*</td><td>37.5*</td></tr><tr><td>All-Angles Bench</td><td>52.7</td><td>56.9</td><td>56.2</td><td>52.4*</td><td>54.4*</td><td>48.9*</td><td>48.2*</td></tr><tr><td rowspan="5">GUI Agents</td><td> $OSWorld^2$ </td><td>14.9</td><td>35.8</td><td>37.2</td><td>-</td><td>8.8</td><td>8.2</td><td>6.2*</td></tr><tr><td>AndroidWorld</td><td>41.7</td><td>57.0</td><td>57.0</td><td>-</td><td>35.0</td><td>-</td><td>4.4*</td></tr><tr><td> $WebVoyager^2$ </td><td>69.0</td><td>84.4</td><td>81.0</td><td>-</td><td>40.4*</td><td>-</td><td>34.8*</td></tr><tr><td>Webquest-SingleQA</td><td>72.1</td><td>76.9</td><td>79.5</td><td>58.7*</td><td>60.5*</td><td>35.6*</td><td>31.2*</td></tr><tr><td>Webquest-MultiQA</td><td>54.7</td><td>60.6</td><td>59.0</td><td>52.8*</td><td>52.1*</td><td>11.1*</td><td>36.5*</td></tr><tr><td rowspan="2">Coding</td><td>Design2Code</td><td>64.7</td><td>82.2</td><td>88.6</td><td>34.1*</td><td>41.9*</td><td>38.8*</td><td>16.1*</td></tr><tr><td>Flame-React-Eval</td><td>72.5</td><td>82.5</td><td>86.3</td><td>63.8*</td><td>46.3*</td><td>36.3*</td><td>27.5*</td></tr><tr><td rowspan="7">Video Understanding</td><td>VideoMME (w/o sub)</td><td>68.2</td><td>74.6</td><td>74.8</td><td>-</td><td>73.3</td><td>67.8</td><td>58.9*</td></tr><tr><td>VideoMME (w/sub)</td><td>73.6</td><td>80.7</td><td>81.8</td><td>-</td><td>79.1</td><td>71.9</td><td>68.4*</td></tr><tr><td>MMVU</td><td>59.4</td><td>68.7</td><td>68.4</td><td>-</td><td>62.9</td><td>57.5</td><td>57.7*</td></tr><tr><td>VideoMMMU</td><td>61.0</td><td>72.4</td><td>74.7</td><td>-</td><td>60.2</td><td>65.2</td><td>54.5*</td></tr><tr><td>LVBench</td><td>44.0</td><td>53.8</td><td>59.5</td><td>-</td><td>47.3</td><td>47.6*</td><td>45.9*</td></tr><tr><td>MotionBench</td><td>59.0</td><td>62.4</td><td>63.6</td><td>-</td><td>56.1*</td><td>54.3*</td><td>47.8*</td></tr><tr><td>MVBench</td><td>68.4</td><td>73.0</td><td>74.9</td><td>-</td><td>70.4</td><td>59.7*</td><td>43.5*</td></tr></table>

(表 2 的中文说明: 列依次为任务, 基准, GLM-4.1V, GLM-4.5V, GLM-4.6V, Step-3, Qwen2.5-VL, Kimi-VL-2506, Gemma-3. 第二行是规模和模式: GLM-4.1V 为 9B, 思考; GLM-4.5V 为 106B (A12B), 思考; GLM-4.6V 为 106B (A12B), 思考; Step-3 为 321B (A38B), 思考; Qwen2.5-VL 为 72B, 非思考; Kimi-VL-2506 为 16B (A3B), 思考; Gemma-3 为 27B, 非思考. 任务分八类: 通用 VQA 8 行, STEM 9 行, 长文档 OCR 与图表 4 行, 视觉定位 3 行, 空间识别与推理 4 行, GUI 智能体 5 行, 编程 2 行, 视频理解 7 行, 共 42 行. GeoBench 一行 GLM-4.6V 为 「-」. 原表的加粗在 md 里没有保留.)

Table 2: Benchmark evaluation of GLM-4.6V, GLM-4.5V, GLM-4.1V-Thinking and other open-sourced VLMs on diverse visual-language benchmarks. Results marked with “\*” correspond to our reproduced results, “-” indicates the corresponding models are not competent for such tasks or datasets, while those labeled with “†” are reported by third-party sources. The best results among open-source models are bolded. Refer to Table 3 for the detailed comparison of GLM-4.1V-9B-Thinking with baselines under 10B parameters.

表 2: GLM-4.6V, GLM-4.5V, GLM-4.1V-Thinking 与其他开源 VLM 在多种视觉语言基准上的评测. 标 「\*」 的是我们复现的结果, 「-」 表示对应模型不能胜任该任务或数据集, 标 「†」 的由第三方来源报告. 开源模型中的最佳结果加粗. GLM-4.1V-9B-Thinking 与 10B 以下基线的详细对比见表 3.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup> We adopted the evaluation method of GeoBench and normalized the scores into a percentage-based scale. 2 Tested with a 100-step budget.</span></small>

脚注: <sup>1</sup> 我们采用 GeoBench 的评测方法, 并把分数归一化为百分制. <sup>2</sup> 在 100 步预算下测得.

> **看表:** GLM-4.5V, GLM-4.1V-9B 和 GLM-4.6V 是不是在同一张表里比的?
> 是, 就是这张表 2. 三个 GLM 并排在前三列, 用同一套 42 行基准, 标的都是 thinking 模式; 4.6V 这一列是 106B (A12B) 版本, 第 2 页提到的 GLM-4.6V-Flash (9B) 在全文任何一张表里都没有分数. 4.6V 在 GeoBench 上是 「-」, 其余 41 行与 4.5V 比, 27 行更高, 2 行持平 (OCRBench 86.5, AndroidWorld 57.0), 12 行更低, 例如 RefCOCO-avg 88.6 对 91.3, HallusionBench 62.3 对 65.4. 第 42 页表 3 只放 GLM-4.1V-9B-Thinking 和 10B 以下模型, 而且 4.1V 在两张表里有两行数字不一样: RefCOCO-avg (val) 表 2 是 85.3, 表 3 是 87.4; LVBench 表 2 是 44.0, 表 3 是 45.1. 原文没解释这两处差异. 引用 4.1V 分数时要注明出自哪张表.

<!-- page 16 of 42 -->

## 6 Evaluation

6 评测

In this section, we present the evaluation details and results of GLM-4.5V (including both thinking and non-thinking modes) and GLM-4.1V-Thinking (Appendix C). For completeness, we also report the results of the updated model, GLM-4.6V, in table 2. In §6.1, we show the comprehensive evaluation setting and the full quantitative comparison results are listed in §6.2.

本节介绍 GLM-4.5V (包括思考和非思考两种模式) 和 GLM-4.1V-Thinking (附录 C) 的评测细节与结果. 为完整起见, 我们也在表 2 中报告了更新后的模型 GLM-4.6V 的结果. 6.1 节给出完整的评测设置, 6.2 节列出完整的定量对比结果.

## 6.1 Evaluation Setting

6.1 评测设置

**Benchmarks.** To comprehensively assess the capabilities of our models, we conduct evaluations across 42 public benchmarks, covering eight distinct categories: **General VQA**, **STEM**, **OCR & Document**, **Visual Grounding**, **Spatial Reasoning**, **GUI Agents**, **Coding**, and **Video Understanding**. The following benchmarks are used for evaluation:

**基准.** 为全面评估模型能力, 我们在 42 个公开基准上做评测, 覆盖八个不同类别: **通用 VQA**, **STEM**, **OCR 与文档**, **视觉定位**, **空间推理**, **GUI 智能体**, **编程**和**视频理解**. 评测使用以下基准:

• **General VQA**: MMBench-V1.1 [30], MMStar [7], BLINK(val) [11], MUIRBENCH [53], ZeroBench(val) [39], HallusionBench [15], GeoBench [2];

**通用 VQA:** MMBench-V1.1 [30], MMStar [7], BLINK(val) [11], MUIRBENCH [53], ZeroBench(val) [39], HallusionBench [15], GeoBench [2];

• **STEM**: MMMU(val) [67], MMMU Pro [68], MathVista [32], MathVision [55], MathVerse [70], DynaMath [74], LogicVista [61], WeMath [37], AI2D [26];

**STEM:** MMMU(val) [67], MMMU Pro [68], MathVista [32], MathVision [55], MathVerse [70], DynaMath [74], LogicVista [61], WeMath [37], AI2D [26];

• **OCR, Chart & Document**: OCRBench [31], ChartQAPro [35], ChartMuseum [45], MMLongBench-Doc [34];

**OCR, 图表与文档:** OCRBench [31], ChartQAPro [35], ChartMuseum [45], MMLongBench-Doc [34];

• **Visual Grounding**: RefCOCO-avg (val) [25], TreeBench [54], Ref-L4 [6];

**视觉定位:** RefCOCO-avg (val) [25], TreeBench [54], Ref-L4 [6];

• **GUI Agents**: OSWorld [62], Android World [38], WebVoyager Some [18], Webquest-QA [56];

**GUI 智能体:** OSWorld [62], Android World [38], WebVoyager Some [18], Webquest-QA [56];

• **Coding**: Design2Code [43], Flame-React-Eval [1];

**编程:** Design2Code [43], Flame-React-Eval [1];

• **Spatial Reco & Reasoning**: OminiSpatial [24], CV-Bench [51], ERQA [49], All-Angles Bench [65];

**空间识别与推理:** OminiSpatial [24], CV-Bench [51], ERQA [49], All-Angles Bench [65];

• **Video Understanding**: VideoMME [10], MMVU [71], VideoMMMU [22], LVBench [58], MotionBench [19], MVBench [28];

**视频理解:** VideoMME [10], MMVU [71], VideoMMMU [22], LVBench [58], MotionBench [19], MVBench [28];

> **对一下:** 「42 public benchmarks」 是怎么数出来的? 上面的清单一共几个名字?
> 把清单和表 2 对一下. 清单上的名字: 通用 VQA 7 个, STEM 9 个, OCR 图表文档 4 个, 视觉定位 3 个, GUI 智能体 4 个, 编程 2 个, 空间 4 个, 视频 6 个, 共 39 个. 第 15 页表 2 是 42 行, 多出来的 3 行来自拆分: MMBench V1.1 拆成英文和 (CN) 两行, Webquest-QA 拆成 SingleQA 和 MultiQA 两行, VideoMME 拆成 w/o sub 和 w/sub 两行. 所以 「42」 数的是表 2 的行, 不是不同基准的个数. 清单和表的写法也有出入: 清单写 ZeroBench(val), 表里写 ZeroBench (sub); 清单写 「WebVoyager Some」 和 「OminiSpatial」, 表 2 写 WebVoyager 和 OmniSpatial, 表 3 写 WebVoyageSom, 第 2 页写 WebVoyagerSom.

**Setting.** We mostly use vLLM 1as the backend for model inference. For faster and more stable inference, we use SGLang <sup>2</sup>for video inference. The maximum output length for each model response is set to 8,192 tokens. For visual input configuration, we set the maximum expected length for image inputs to 6,144 tokens, and 48,000 tokens for video benchmarks. The predicted answer is extracted as the string enclosed within special boxed tokens (<|begin\_of\_box|>...<|end\_of\_box|>), which we define as the model’s final output. For benchmarks that require answer extraction or scoring by a language model, we consistently use GPT-4o (2024-11-20) [36] for this purpose. To ensure fairness, all models—including GLM-4.1V-9B-Thinking and its open-source counterparts—are evaluated using the same toolchain, policies, and prompt templates. For each model, we enforce a minimum successful request rate of 95% on every benchmark. Samples that fail due to generation errors or API issues are excluded from scoring, ensuring that final metrics reflect only valid outputs.

**设置.** 模型推理大多用 vLLM <sup>1</sup> 作为后端. 视频推理为了更快更稳, 用 SGLang <sup>2</sup>. 每条模型回答的最大输出长度设为 8,192 个 token. 视觉输入方面, 图像输入的最大预期长度设为 6,144 个 token, 视频基准为 48,000 个 token. 预测答案取特殊框 token (<|begin\_of\_box|>...<|end\_of\_box|>) 包住的字符串, 我们把它定义为模型的最终输出. 需要由语言模型提取答案或打分的基准, 我们一律用 GPT-4o (2024-11-20) [36]. 为保证公平, 所有模型, 包括 GLM-4.1V-9B-Thinking 及其开源对手, 都用同一套工具链, 策略和 prompt 模板评测. 对每个模型, 我们要求在每个基准上的请求成功率不低于 95%. 因生成错误或 API 问题失败的样本不计分, 确保最终指标只反映有效输出.

**Evaluation protocol and instructions.** We detail the evaluation protocols for VLM coding, GUI agents, and grounding in Section B, as these tasks may involve domain-specific formats, instructions, and evaluation protocols.

**评测协议与指令.** VLM 编程, GUI 智能体和视觉定位的评测协议详见附录 B, 因为这些任务可能涉及领域专属的格式, 指令和评测协议.

## 6.2 Comparison to Other Advanced MLLMs

6.2 与其他先进 MLLM 的比较

We compare GLM-4.5V and GLM-4.1V-9B-Thinking against a wide range of open-source state-of-the-art MLLMs, including Step-3 [52], Qwen-VL series [4], Kimi-VL [50] and Gemma-3 [48]. As shown in Table 2, GLM-4.5V establishes a new state-of-the-art among open-source models across all benchmarks, demonstrating consistent superiority in performance across a wide spectrum of multimodal tasks.

我们把 GLM-4.5V 和 GLM-4.1V-9B-Thinking 与一批开源的最佳 MLLM 做比较, 包括 Step-3 [52], Qwen-VL 系列 [4], Kimi-VL [50] 和 Gemma-3 [48]. 如表 2 所示, GLM-4.5V 在所有基准上刷新了开源模型的最佳水平, 在各类多模态任务上表现出一致的优势.

In the domain of **General VQA**, GLM-4.5V-Thinking surpasses all competing open-source models of comparable size on diverse benchmarks, covering both single-image and multi-image settings. This underscores the model’s strong general-purpose visual reasoning capabilities and its adeptness in both factual and inferential question answering across varying visual contexts.

在**通用 VQA** 领域, GLM-4.5V-Thinking 在单图和多图设置的多个基准上, 超过所有规模相当的开源对手. 这说明模型有很强的通用视觉推理能力, 能在不同视觉语境下熟练地回答事实类和推断类问题.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>https://github.com/vllm-project/vllm</span></small>

脚注 1: vLLM 的代码仓库地址.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>https://github.com/sgl-project/sglang</span></small>

脚注 2: SGLang 的代码仓库地址.

<!-- page 17 of 42 -->

Within the **STEM** category, our model achieves the highest performance on challenging science and engineering benchmarks such as MMMU (Val), MMMU Pro, and AI2D. These results indicate a particularly strong capacity for structured and domain-specific reasoning. On mathematics-centric tasks such as MathVista and WeMath, GLM-4.5V-Thinking also outperforms other baselines, demonstrating advanced capability in symbolic and arithmetic reasoning.

在 **STEM** 类别中, 我们的模型在 MMMU (Val), MMMU Pro, AI2D 等有挑战的科学和工程基准上取得最高分. 这说明它在结构化推理和领域推理上能力特别强. 在 MathVista, WeMath 这类以数学为中心的任务上, GLM-4.5V-Thinking 也超过其他基线, 表现出较强的符号推理和算术推理能力.

In the domain of **OCR & Document**, GLM-4.5V-Thinking sets new state-of-the-art scores on both ChartQAPro and ChartMuseum, demonstrating strong capabilities in structured data extraction from plots and charts. On OCRBench, it performs competitively, slightly behind our **non-thinking** version and Kimi-VL, indicating solid but improvable text recognition in natural images. Moreover, GLM-4.5V-Thinking outperforms all other models on MMLongBench-Doc, revealing a strong capacity for reasoning over extended sequences, maintaining cross-page coherence, and handling complex document layouts.

在 **OCR 与文档**领域, GLM-4.5V-Thinking 在 ChartQAPro 和 ChartMuseum 上都刷新了最佳成绩, 表现出从图和表中提取结构化数据的强大能力. 在 OCRBench 上它有竞争力, 略低于我们的**非思考**版本和 Kimi-VL, 说明它在自然图像中的文字识别扎实, 但还有提升空间. 此外, GLM-4.5V-Thinking 在 MMLongBench-Doc 上超过所有其他模型, 说明它能在长序列上推理, 保持跨页连贯, 并处理复杂的文档版式.

GLM-4.5V-Thinking also establishes new state-of-the-art results in emerging tasks involving **GUI Agents** and multimodal **Coding**. Its significant margin over competitors in these areas highlights its strong cross-modal reasoning ability and semantic alignment between visual interfaces and code representations.

GLM-4.5V-Thinking 在 **GUI 智能体**和多模态**编程**这些新兴任务上也刷新了最佳成绩. 它在这些领域大幅领先对手, 突出体现了很强的跨模态推理能力, 以及视觉界面与代码表示之间的语义对齐.

In the area of **Video Understanding** and **Spatial Reasoning**, GLM-4.5V-Thinking demonstrates robust performance, leading on benchmarks such as VideoMME, MMVU, and OminiSpatial. These results emphasize its advanced spatio-temporal reasoning abilities, crucial for interpreting dynamic and multi-frame visual content. Meanwhile, for **Visual Grounding**, the model delivers solid results on RefCOCO, outperforming other competitors.

在**视频理解**和**空间推理**方面, GLM-4.5V-Thinking 表现稳健, 在 VideoMME, MMVU, OminiSpatial 等基准上领先. 这些结果说明它有较强的时空推理能力, 这对解读动态的多帧视觉内容至关重要. 同时, 在**视觉定位**上, 模型在 RefCOCO 上结果扎实, 超过其他对手.

Remarkably, despite the relatively compact size, GLM-4.1V-9B-Thinking demonstrates superior performance to the much larger Qwen2.5-VL-72B model on 29 out of 42 benchmarks, including particularly challenging tasks such as MMStar, MUIRBENCH, MMMU Pro, and ChartMuseum. This illustrates the superior efficiency and capability of our model, making it a compelling choice for real-world deployment where computational resources are constrained. These findings emphasize that our model offers an excellent trade-off between performance and efficiency, making it a practical and powerful solution for real-world deployment under resource constraints.

值得一提的是, 尽管规模相对小, GLM-4.1V-9B-Thinking 在 42 个基准中的 29 个上超过大得多的 Qwen2.5-VL-72B, 其中包括 MMStar, MUIRBENCH, MMMU Pro, ChartMuseum 等特别有挑战的任务. 这说明我们的模型效率高, 能力强, 在计算资源受限的实际部署中是很有吸引力的选择. 这些发现表明, 我们的模型在性能和效率之间取得了很好的平衡, 是资源受限条件下实际部署的实用而强大的方案.

> **核对:** 「29 out of 42」 的分母和分子分别是什么? 能从表 2 数出 29 吗?
> 分母 42 就是第 15 页表 2 的 42 行. 分子按表 2 的 GLM-4.1V 列和 Qwen2.5-VL (72B) 列逐行比, 我数出来 4.1V 更高的有 28 行, 更低的 14 行, 没有持平: 更低的是 MMBench V1.1, MMBench V1.1 (CN), ZeroBench (sub) 19.2 对 19.5, MMMU (Val), OCRBench, RefCOCO-avg, TreeBench, OmniSpatial 47.7 对 47.9, All-Angles Bench, VideoMME 两行, MMVU, LVBench, MVBench. 换成第 42 页表 3 也凑不出 29: 那张表只有 28 行, 4.1V 对 Qwen2.5-VL 72B 赢 18 行, 输 9 行, MotionBench 一行 72B 没有分数. 摘要说 「superior results ... on 29 benchmarks」, 第 2 页引言说 「competitive or superior ... on 29 benchmarks」, 这里说 「superior performance ... on 29 out of 42」. 按 v6 的表 2 严格比大小是 28, 差的一行本文没有交代. 很可能是某一行的数字在改版时变了, 但本文给不出证据.

> **想:** 这一节说 GLM-4.5V 「在所有基准上」 刷新开源最佳, 摘要只说 「nearly all tasks」; 第 16 页又说要报告思考和非思考两种模式, 非思考的分数在哪?
> 两处都能在本文里找到答案. 第一处: 按第 15 页表 2, 只把 GLM-4.5V 和非 GLM 的开源模型比, 它在 42 行里只有 OCRBench 不是第一, 86.5 低于 Kimi-VL 的 86.9; 这一页的 OCR 段落自己也承认 「slightly behind our non-thinking version and Kimi-VL」. 所以 「across all benchmarks」 说过头了, 摘要的 「nearly all」 更准确. 要是把 GLM-4.6V 也算进开源模型, 4.5V 在 27 行上都被 4.6V 超过. 第二处: 第 16 页第 6 节开头说要给出 4.5V 「including both thinking and non-thinking modes」 的结果, 但表 2 的 4.5V 列只标 thinking, 全文没有非思考模式的分数列. OCRBench 段落里那个 「non-thinking version」 比 86.5 高多少, 本文查不到.

## 6.3 Investigating Cross-Domain Generalization in Reinforcement Learning

6.3 考察强化学习中的跨领域泛化

While multi-domain RL successfully improves the overall performance, there is one remaining question: In the course of RL, is it possible for the various multimodal domains to generalize to and reinforce one another, or will they instead antagonize and interfere with each other? To explore this question, we conduct experiments on GLM-4.1V-9B-Thinking. We selected four representative domains: STEM, OCR & Chart, Grounding, and GUI agents. While each domain relies on a common toolkit of visual perception, reasoning, they stress different abilities. For example, Grounding demands fine-grained pixel-level perception; OCR & Chart emphasizes text recognition and the interpretation of abstract figures; STEM tasks center on complex visual reasoning; and GUI agents require a blend of UI understanding, real-world knowledge, and dynamic decision-making.

多领域 RL 成功提升了整体性能, 但还剩一个问题: 在 RL 过程中, 不同的多模态领域能否相互泛化, 相互强化, 还是会相互对抗, 相互干扰? 为探究这个问题, 我们在 GLM-4.1V-9B-Thinking 上做实验. 我们选了四个有代表性的领域: STEM, OCR 与图表, 视觉定位, GUI 智能体. 这些领域都依赖一套共同的视觉感知和推理能力, 但侧重的能力不同. 例如, 视觉定位要求细粒度的像素级感知; OCR 与图表侧重文字识别和抽象图形的解读; STEM 任务以复杂视觉推理为中心; GUI 智能体则需要把 UI 理解, 现实世界知识和动态决策结合起来.

All experiments are conducted based on the SFT-stage checkpoint of GLM-4.1V-9B-Thinking. We compare 5 groups of RL training data: (1) STEM, (2) OCR & Chart, (3) Grounding, (4) GUI Agent, and (5) Mix-all which mixes all four data groups above with the RL training ratio of GLM-4.1V-9B-Thinking. We adopt the mix-all setup as our reference for training data volume: for each standalone RL experiment on a given sub-domain, the number of samples processed is exactly the same as the number that sub-domain sees in the mix-all experiment. After training, we evaluate models on 5 categories of benchmarks, each category contains multiple benchmarks: (1) STEM, (2) OCR & Chart, (3) Grounding, (4) GUI Agent, and (5) General image VQA that does not have a corresponding training set. The results are shown in Figure 6, where the numbers represent the improvement of the average group score compared to the initial SFT checkpoint. The results demonstrate robust cross-domain generalization and mutual facilitation in most domains:

所有实验都基于 GLM-4.1V-9B-Thinking 的 SFT 阶段检查点. 我们比较 5 组 RL 训练数据: (1) STEM, (2) OCR 与图表, (3) 视觉定位, (4) GUI 智能体, (5) Mix-all, 即按 GLM-4.1V-9B-Thinking 的 RL 训练比例把上面四组数据混合起来. 我们以 mix-all 设置作为训练数据量的参照: 对某个子领域单独做 RL 实验时, 处理的样本数与该子领域在 mix-all 实验中见到的样本数完全相同. 训练后, 我们在 5 类基准上评估模型, 每类包含多个基准: (1) STEM, (2) OCR 与图表, (3) 视觉定位, (4) GUI 智能体, (5) 没有对应训练集的通用图像 VQA. 结果见图 6, 其中的数字表示各组平均分相对初始 SFT 检查点的提升. 结果表明, 在大多数领域存在稳健的跨领域泛化和相互促进:

• **Training on one domain boosts performance in others.** For example, reinforcement learning on STEM data not only improves STEM-specific skills but also enhances performance on visual grounding, GUI-agent interaction, and general VQA tasks. Similarly, training on OCR & Chart data yields gains in STEM, GUI-agent, and general VQA benchmarks. This cross-domain effect reveals that shared underlying capabilities such as visual understanding, text

**在一个领域上训练会提升其他领域的表现.** 例如, 在 STEM 数据上做强化学习, 不仅提升 STEM 专项技能, 也提升视觉定位, GUI 智能体交互和通用 VQA 任务的表现. 类似地, 在 OCR 与图表数据上训练, 在 STEM, GUI 智能体和通用 VQA 基准上都有收益. 这种跨领域效应说明, 视觉理解, 文字 (句子接下页)

<!-- page 18 of 42 -->

![Chart block](images/p18-figure-6-cross-domain-generalization-in-reinforcement.png)

(图: 热力图, 纵轴 Training Data Domain, 从上到下 Mix All, GUI Agent, Grounding, OCR & Chart, STEM; 横轴 Evaluation Domain, 从左到右 STEM, OCR & Chart, Grounding, GUI Agent, Image General. 数值按行读: Mix All 为 +6.6, +5.2, +30.1, +6.0, +3.4; GUI Agent 为 +2.4, +1.5, +9.0, +9.2, +1.6; Grounding 为 −0.5, −4.6, +30.4, +8.1, −0.4; OCR & Chart 为 +3.0, +1.2, −14.5, +5.8, +1.3; STEM 为 +3.0, −0.2, +10.5, +3.5, +1.1. 色条从 −0.75 到 1.00, 红色越深越高, 蓝色为负.)

Figure 6: Cross-domain generalization in reinforcement learning. We evaluate the SFT-stage models across five RL data settings: STEM, OCR & Chart, grounding, GUI agent, and a combined “Mix-all”. Each model is tested on five benchmark suites corresponding to these domains. The values in the grid show the average performance improvement per domain (negative values indicate a decline), and the cell colors are normalized within each domain.

图 6: 强化学习中的跨领域泛化. 我们在五种 RL 数据设置下评估 SFT 阶段的模型: STEM, OCR 与图表, 视觉定位, GUI 智能体, 以及合并的 「Mix-all」. 每个模型都在与这些领域对应的五组基准上测试. 网格中的数值是各领域的平均性能提升 (负值表示下降), 单元格颜色在每个领域内部归一化.

> **再看:** 图 6 里 OCR & Chart 训练让 Grounding 掉了 14.5, 正文为什么只说收益?
> 再看第 17 页的正文和图 6 的数字. 正文说 OCR 与图表训练 「yields gains in STEM, GUI-agent, and general VQA benchmarks」, 这三格确实是 +3.0, +5.8, +1.3, 但同一行的 Grounding 是 −14.5, 是整张图最大的负值, 正文没提. 负值还有几格: Grounding 训练对 OCR & Chart 是 −4.6, 对 STEM −0.5, 对 Image General −0.4; STEM 训练对 OCR & Chart −0.2. 所以 「Training on one domain boosts performance in others」 只在部分组合上成立, 第 17 页那句 「in most domains」 的限定要当真. Mix-all 的两处弱项正文承认了: Grounding +30.1 略低于单训 Grounding 的 +30.4, GUI Agent +6.0 低于单训 GUI 的 +9.2. 图题说颜色 「normalized within each domain」, 所以不同列之间不能按颜色深浅比大小, 要看数字.

recognition, and reasoning can be co-activated and refined through a single-domain RL signal. Intriguingly, RL applied exclusively to GUI-agent tasks produces improvements across all evaluated domains, indicating that GUI-agent challenges intrinsically require a comprehensive mix of text recognition, visual grounding, and logical reasoning that transfers broadly.

(接上页) 识别和推理等共享的底层能力, 可以通过单一领域的 RL 信号被共同激活和打磨. 耐人寻味的是, 只在 GUI 智能体任务上做 RL, 所有被评估的领域都有提升, 说明 GUI 智能体任务本身就需要文字识别, 视觉定位和逻辑推理的全面组合, 而这种组合能广泛迁移.

• **Joint training across domains yields even greater improvements in each.** This synergy likely underpins GLM-4.1V-9B-Thinking’s extraordinary performance. Among all configurations, the “mix-all” setting where the model is trained simultaneously on every domain delivers clear gains over any single-domain RL in three out of five areas (STEM, OCR & Chart, and general VQA). Notably, however, mixed-domain training does not improve grounding or GUI-agent performance, suggesting that these domains may require more targeted or specialized multi-domain strategies and warrant further exploration.

**跨领域联合训练让每个领域的提升更大.** 这种协同很可能是 GLM-4.1V-9B-Thinking 表现出色的基础. 在所有配置中, 同时在每个领域上训练的 「mix-all」 设置, 在五个方面中的三个 (STEM, OCR 与图表, 通用 VQA) 明显超过任何单领域 RL. 但值得注意的是, 混合领域训练没有提升视觉定位或 GUI 智能体的表现, 这说明这些领域可能需要更有针对性或更专门的多领域策略, 值得进一步探索.

Interestingly, the cross-domain RL results also reveal how closely related these tasks are. For example, training on GUI-agent data markedly improves grounding performance and vice versa, highlighting their shared reliance on visual grounding capabilities. Likewise, OCR & Chart and GUI-agent tasks boost each other’s performance, reflecting their common demand for accurate text recognition.

有意思的是, 跨领域 RL 的结果也揭示了这些任务之间的关系有多紧密. 例如, 在 GUI 智能体数据上训练明显提升视觉定位表现, 反过来也一样, 说明两者都依赖视觉定位能力. 同样, OCR 与图表和 GUI 智能体任务相互促进, 反映出它们对准确文字识别的共同需求.

## 7 Discussion: Limitations and Future Work

7 讨论: 局限与未来工作

GLM-4.1V-Thinking, GLM-4.5V, and GLM-4.6V represent our firm steps in pursuit of generalpurpose multimodal reasoning. Developed under a reasoning-centric training framework that unifies pre-training, supervised fine-tuning, and reinforcement learning around a shared objective, the models successfully learn to reason across visual, textual, mathematical, scientific, and agentic domains. The resulting 9B-parameter dense model and 106B-A12B-parameter MoE model achieve strong performance across diverse benchmarks, achieving SOTA performance among models of comparable size. We open-source GLM-4.1V-Thinking, GLM-4.5V and GLM-4.6V to facilitate further research in the direction of multimodal reasoning.

GLM-4.1V-Thinking, GLM-4.5V 和 GLM-4.6V 是我们追求通用多模态推理的坚实一步. 它们在一个以推理为中心的训练框架下开发, 这个框架把预训练, 监督微调和强化学习统一到一个共同目标上; 模型因此成功学会了在视觉, 文本, 数学, 科学和智能体等领域进行推理. 最终得到的 9B 参数稠密模型和 106B-A12B 参数的 MoE 模型在多种基准上表现强劲, 在规模相当的模型中达到最佳水平. 我们开源 GLM-4.1V-Thinking, GLM-4.5V 和 GLM-4.6V, 以促进多模态推理方向的进一步研究.

Despite notable progresses have been made, several limitations remain. First, although RL enhances task completion rates, it does not consistently improve reasoning quality. In certain instances, the model produces correct answers but relies on incorrect reasoning steps. This issue arises because current reward models typically evaluate final outcomes without verifying intermediate reasoning steps. Consequently, flawed or even hallucinated reasoning chains may inadvertently be reinforced if they lead to correct answers. This emphasizes the importance of designing reward mechanisms that can effectively evaluate the reasoning process, not just the outcome.

尽管取得了明显进展, 仍有几项局限. 第一, RL 虽然提高了任务完成率, 却不能始终提升推理质量. 在某些情况下, 模型给出正确答案, 却依赖错误的推理步骤. 这个问题的原因是, 当前的奖励模型通常只评估最终结果, 不验证中间推理步骤. 因此, 有缺陷甚至带幻觉的推理链, 只要通向正确答案, 就可能被无意中强化. 这说明设计能有效评估推理过程, 而不只评估结果的奖励机制非常重要.

<!-- page 19 of 42 -->

Second, RL training can exhibit instability. Early experiments demonstrated that minor changes in the setup could lead to substantial variations in reasoning depth or output style. Although advancements in later versions, such as improved reward design and enhanced cold-start data, have led to more stable training, the remaining sensitivity indicates deeper challenges in large-scale RL optimization. Further modifications in RL are needed to improve consistency and robustness.

第二, RL 训练可能不稳定. 早期实验表明, 设置上的微小改动就可能让推理深度或输出风格产生很大变化. 虽然后续版本的改进, 例如更好的奖励设计和更好的冷启动数据, 让训练更稳定了, 但剩下的敏感性说明大规模 RL 优化中还有更深层的挑战. RL 还需要进一步改进, 以提高一致性和稳健性.

Third, despite the strong performance the models across diverse tasks, they might still struggle in complex scenarios. For example, images involving clutters, occluded objects, or ambiguous visual details could cause perceptual errors that undermine the reasoning capability of the models. Under these conditions, the models may resort to guesswork or generic assumptions rather than engaging in grounded inference. This suggests that improvements in perception and reasoning must progress simultaneously, as these components are intricately interconnected.

第三, 尽管模型在多种任务上表现强劲, 在复杂场景中仍可能吃力. 例如, 画面杂乱, 物体被遮挡或视觉细节含糊的图像, 可能引起感知错误, 进而削弱模型的推理能力. 在这些情况下, 模型可能诉诸猜测或泛泛的假设, 而不是做有依据的推断. 这说明感知和推理的改进必须同步推进, 因为两者紧密相连.

Looking ahead, a key direction is to improve how we supervise and evaluate model reasoning. Future reward models should assess not only final answers but also intermediate reasoning steps, actively detecting hallucinations and flagging logical inconsistencies. Additionally, for tasks with subjective evaluations, it is crucial to explore strategies to prevent reward hacking, a necessary step toward achieving general-purpose intelligence.

展望未来, 一个关键方向是改进我们监督和评估模型推理的方式. 未来的奖励模型不仅要评估最终答案, 还要评估中间推理步骤, 主动发现幻觉, 标出逻辑不一致. 此外, 对于评价带主观性的任务, 探索防止奖励投机的策略至关重要, 这是迈向通用智能的必要一步.

We are also interested in the potential benefits of multimodal training for text-only reasoning tasks. For instance, understanding whether visual reasoning tasks, such as interpreting code in images, can enhance the performance of text-only coding tasks is a promising research direction. Exploring how vision and language modalities mutually reinforce each other may lead to significant advances in general reasoning capabilities.

我们也关注多模态训练对纯文本推理任务可能带来的好处. 例如, 弄清视觉推理任务 (如解读图片里的代码) 能否提升纯文本编程任务的表现, 是一个有前景的研究方向. 探索视觉和语言两种模态如何相互增强, 可能带来通用推理能力的重大进展.

Finally, as model capabilities improve, evaluation frameworks must evolve correspondingly. Many current benchmarks are reaching saturation or fail to effectively identify critical errors, such as hallucination in reasoning chains. Future benchmarks should be both more challenging and diagnostic, designed to explicitly detect more failure modes such as shortcut reasoning or hallucination. We hope GLM-4.1V-Thinking, GLM-4.5V and and GLM-4.6V can inspire new standards and approaches for evaluating and improving general-purpose multimodal reasoning.

最后, 随着模型能力提升, 评测框架也必须相应演进. 当前很多基准正趋于饱和, 或者无法有效识别关键错误, 例如推理链中的幻觉. 未来的基准应该更难, 更有诊断性, 专门设计来发现更多失败模式, 例如走捷径的推理或幻觉. 我们希望 GLM-4.1V-Thinking, GLM-4.5V 和 GLM-4.6V 能为评估和改进通用多模态推理带来新的标准和方法.

## 8 Contribution

8 贡献者

The contributors’ names are sorted in alphabetical order of the first name.

贡献者姓名按名字 (first name) 的字母顺序排列.

## Core Contributors

核心贡献者

Guo Wang, Guobing Gan, Haomiao Tang, Jiale Cheng, Ji Qi, Junhui Ji, Lihang Pan, Shuaiqi Duan, Weihan Wang, Yan Wang, Yean Cheng, Zehai He, Zhe Su, Zhen Yang, Ziyang Pan

## Contributors

贡献者

Aohan Zeng, Baoxu Wang, Bin Chen, Boyan Shi, Changyu Pang, Chenhui Zhang, Da Yin, Fan Yang, Guoqing Chen, Haochen Li, Jiale Zhu, Jiali Chen, Jiaxing Xu, Jiazheng Xu, Jing Chen, Jinghao Lin, Jinhao Chen, Jinjiang Wang, Junjie Chen, Leqi Lei, Letian Gong, Leyi Pan, Mingdao Liu, Mingde Xu, Mingzhi Zhang, Qinkai Zheng, Ruiliang Lyu, Shangqin Tu, Sheng Yang, Shengbiao Meng, Shi Zhong, Shiyu Huang, Shuyuan Zhao, Siyan Xue, Tianshu Zhang, Tianwei Luo, Tianxiang Hao, Tianyu Tong, Wei Jia, Wenkai Li, Xiao Liu, Xiaohan Zhang, Xin Lyu, Xinyu Zhang, Xinyue Fan, Xuancheng Huang, Yadong Xue, Yanfeng Wang, Yanling Wang, Yanzi Wang, Yifan An, Yifan Du, Yiheng Huang, Yilin Niu, Yiming Shi, Yu Wang, Yuan Wang, Yuanchang Yue, Yuchen Li, Yusen Liu, Yutao Zhang, Yuting Wang, Yuxuan Zhang, Zhao Xue, Zhengxiao Du, Zhenyu Hou, Zihan Wang

## Tech Leads

技术负责人

Wenyi Hong, Wenmeng Yu, Xiaotao Gu

## Academic Advisors

学术顾问

Peng Zhang, Debing Liu, Bin Xu, Juanzi Li, Minlie Huang, Yuxiao Dong, Jie Tang

<!-- page 20 of 42 -->

## References

参考文献 (条目保留英文原文, 不译.)

[1] Flame-code-vlm. [https://github.com/Flame-Code-VLM/Flame-Code-VLM.](https://github.com/Flame-Code-VLM/Flame-Code-VLM)

[2] Geobench. [https://github.com/ccmdi/geobench.](https://github.com/ccmdi/geobench)

[3] A. Awadalla, L. Xue, O. Lo, M. Shu, H. Lee, E. Guha, S. Shen, M. Awadalla, S. Savarese, C. Xiong, et al. Mint-1t: Scaling open-source multimodal data by 10x: A multimodal dataset with one trillion tokens. Advances in Neural Information Processing Systems, 37:36805–36828, 2024.

[4] S. Bai, K. Chen, X. Liu, J. Wang, W. Ge, S. Song, K. Dang, P. Wang, S. Wang, J. Tang, et al. Qwen2. 5-vl technical report. arXiv preprint arXiv:2502.13923, 2025.

[5] L. Blecher, G. Cucurull, T. Scialom, and R. Stojnic. Nougat: Neural optical understanding for academic documents. arXiv preprint arXiv:2308.13418, 2023.

[6] J. Chen, F. Wei, J. Zhao, S. Song, B. Wu, Z. Peng, S.-H. G. Chan, and H. Zhang. Revisiting referring expression comprehension evaluation in the era of large multimodal models. In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 513–524, 2025.

[7] L. Chen, J. Li, X. Dong, P. Zhang, Y. Zang, Z. Chen, H. Duan, J. Wang, Y. Qiao, D. Lin, et al. Are we on the right way for evaluating large vision-language models? arXiv preprint arXiv:2403.20330, 2024.

[8] A. Fang, A. M. Jose, A. Jain, L. Schmidt, A. Toshev, and V. Shankar. Data filtering networks. arXiv preprint arXiv:2309.17425, 2023.

[9] E. Fini, M. Shukor, X. Li, P. Dufter, M. Klein, D. Haldimann, S. Aitharaju, V. G. T. da Costa, L. Béthune, Z. Gan, et al. Multimodal autoregressive pre-training of large vision encoders. In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 9641–9654, 2025.

[10] C. Fu, Y. Dai, Y. Luo, L. Li, S. Ren, R. Zhang, Z. Wang, C. Zhou, Y. Shen, M. Zhang, et al. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis. arXiv:2405.21075, 2024.

[11] X. Fu, Y. Hu, B. Li, Y. Feng, H. Wang, X. Lin, D. Roth, N. A. Smith, W.-C. Ma, and R. Krishna. Blink: Multimodal large language models can see but not perceive. arXiv preprint arXiv:2404.12390, 2024.

[12] S. Y. Gadre, G. Ilharco, A. Fang, J. Hayase, G. Smyrnis, T. Nguyen, R. Marten, M. Wortsman, D. Ghosh, J. Zhang, et al. Datacomp: In search of the next generation of multimodal datasets. Advances in Neural Information Processing Systems, 36:27092–27112, 2023.

[13] T. GLM, A. Zeng, B. Xu, B. Wang, C. Zhang, D. Yin, D. Rojas, G. Feng, H. Zhao, H. Lai, et al. Chatglm: A family of large language models from glm-130b to glm-4 all tools. arXiv preprint arXiv:2406.12793, 2024.

[14] J. Gu, X. Meng, G. Lu, L. Hou, N. Minzhe, X. Liang, L. Yao, R. Huang, W. Zhang, X. Jiang, et al. Wukong: A 100 million large-scale chinese cross-modal pre-training benchmark. Advances in Neural Information Processing Systems, 35:26418–26431, 2022.

[15] T. Guan, F. Liu, X. Wu, R. Xian, Z. Li, X. Liu, X. Wang, L. Chen, F. Huang, Y. Yacoob, et al. Hallusionbench: an advanced diagnostic suite for entangled language hallucination and visual illusion in large vision-language models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 14375–14385, 2024.

[16] D. Guo, F. Wu, F. Zhu, F. Leng, G. Shi, H. Chen, H. Fan, J. Wang, J. Jiang, J. Wang, et al. Seed1. 5-vl technical report. arXiv preprint arXiv:2505.07062, 2025.

[17] D. Guo, D. Yang, H. Zhang, J. Song, R. Zhang, R. Xu, Q. Zhu, S. Ma, P. Wang, X. Bi, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025.

<!-- page 21 of 42 -->

[18] H. He, W. Yao, K. Ma, W. Yu, Y. Dai, H. Zhang, Z. Lan, and D. Yu. Webvoyager: Building an end-to-end web agent with large multimodal models. arXiv preprint arXiv:2401.13919, 2024.

[19] W. Hong\*, Y. Cheng\*, Z. Yang\*, W. Wang, L. Wang, X. Gu, S. Huang, Y. Dong, and J. Tang. Motionbench: Benchmarking and improving fine-grained video motion understanding for vision language models, 2024.

[20] W. Hong, W. Wang, M. Ding, W. Yu, Q. Lv, Y. Wang, Y. Cheng, S. Huang, J. Ji, Z. Xue, et al. Cogvlm2: Visual language models for image and video understanding. arXiv preprint arXiv:2408.16500, 2024.

[21] W. Hong, W. Wang, Q. Lv, J. Xu, W. Yu, J. Ji, Y. Wang, Z. Wang, Y. Dong, M. Ding, et al. Cogagent: A visual language model for gui agents. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 14281–14290, 2024.

[22] K. Hu, P. Wu, F. Pu, W. Xiao, Y. Zhang, X. Yue, B. Li, and Z. Liu. Video-mmmu: Evaluating knowledge acquisition from multi-discipline professional videos. 2025.

[23] A. Jaech, A. Kalai, A. Lerer, A. Richardson, A. El-Kishky, A. Low, A. Helyar, A. Madry, A. Beutel, A. Carney, et al. Openai o1 system card. arXiv preprint arXiv:2412.16720, 2024.

[24] M. Jia, Z. Qi, S. Zhang, W. Zhang, X. Yu, J. He, H. Wang, and L. Yi. Omnispatial: Towards comprehensive spatial reasoning benchmark for vision language models. arXiv preprint arXiv:2506.03135, 2025.

[25] S. Kazemzadeh, V. Ordonez, M. Matten, and T. Berg. Referitgame: Referring to objects in photographs of natural scenes. In Proceedings of the 2014 conference on empirical methods in natural language processing (EMNLP), pages 787–798, 2014.

[26] A. Kembhavi, M. Salvato, E. Kolve, M. Seo, H. Hajishirzi, and A. Farhadi. A diagram is worth a dozen images. In Computer Vision–ECCV 2016: 14th European Conference, Amsterdam, The Netherlands, October 11–14, 2016, Proceedings, Part IV 14, pages 235–251. Springer, 2016.

[27] J. Li, D. Li, S. Savarese, and S. Hoi. Blip-2: Bootstrapping language-image pre-training with frozen image encoders and large language models. In International conference on machine learning, pages 19730–19742. PMLR, 2023.

[28] K. Li, Y. Wang, Y. He, Y. Li, Y. Wang, Y. Liu, Z. Wang, J. Xu, G. Chen, P. Luo, L. Wang, and Y. Qiao. MVBench: A comprehensive multi-modal video understanding benchmark, 2023.

[29] Q. Li, Z. Chen, W. Wang, W. Wang, S. Ye, Z. Jin, G. Chen, Y. He, Z. Gao, E. Cui, et al. Omnicorpus: A unified multimodal corpus of 10 billion-level images interleaved with text. arXiv preprint arXiv:2406.08418, 2024.

[30] Y. Liu, H. Duan, Y. Zhang, B. Li, S. Zhang, W. Zhao, Y. Yuan, J. Wang, C. He, Z. Liu, K. Chen, and D. Lin. Mmbench: Is your multi-modal model an all-around player? arXiv:2307.06281, 2023.

[31] Y. Liu, Z. Li, M. Huang, B. Yang, W. Yu, C. Li, X.-C. Yin, C.-L. Liu, L. Jin, and X. Bai. Ocrbench: on the hidden mystery of ocr in large multimodal models. Science China Information Sciences, 67(12), Dec. 2024.

[32] P. Lu, H. Bansal, T. Xia, J. Liu, C. Li, H. Hajishirzi, H. Cheng, K.-W. Chang, M. Galley, and J. Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

[33] Y. Ma, L. Du, X. Shen, S. Chen, P. Li, Q. Ren, L. Ma, Y. Dai, P. Liu, and J. Yan. One rl to see them all: Visual triple unified reinforcement learning, 2025.

[34] Y. Ma, Y. Zang, L. Chen, M. Chen, Y. Jiao, X. Li, X. Lu, Z. Liu, Y. Ma, X. Dong, P. Zhang, L. Pan, Y.-G. Jiang, J. Wang, Y. Cao, and A. Sun. Mmlongbench-doc: Benchmarking longcontext document understanding with visualizations, 2024.

<!-- page 22 of 42 -->

[35] A. Masry, M. S. Islam, M. Ahmed, A. Bajaj, F. Kabir, A. Kartha, M. T. R. Laskar, M. Rahman, S. Rahman, M. Shahmohammadi, M. Thakkar, M. R. Parvez, E. Hoque, and S. Joty. Chartqapro: A more diverse and challenging benchmark for chart question answering, 2025.

[36] OpenAI. Gpt-4o. 2024.

[37] R. Qiao, Q. Tan, G. Dong, M. Wu, C. Sun, X. Song, Z. GongQue, S. Lei, Z. Wei, M. Zhang, et al. We-math: Does your large multimodal model achieve human-like mathematical reasoning? arXiv preprint arXiv:2407.01284, 2024.

[38] C. Rawles, S. Clinckemaillie, Y. Chang, J. Waltz, G. Lau, M. Fair, A. Li, W. Bishop, W. Li, F. Campbell-Ajala, et al. Androidworld: A dynamic benchmarking environment for autonomous agents. arXiv:2405.14573, 2024.

[39] J. Roberts, M. R. Taesiri, A. Sharma, A. Gupta, S. Roberts, I. Croitoru, S.-V. Bogolin, J. Tang, F. Langer, V. Raina, et al. Zerobench: An impossible visual benchmark for contemporary large multimodal models. arXiv preprint arXiv:2502.09696, 2025.

[40] C. Schuhmann, R. Beaumont, R. Vencu, C. Gordon, R. Wightman, M. Cherti, T. Coombes, A. Katta, C. Mullis, M. Wortsman, et al. Laion-5b: An open large-scale dataset for training next generation image-text models. Advances in neural information processing systems, 35:25278–25294, 2022.

[41] R. Shao, S. S. Li, R. Xin, S. Geng, Y. Wang, S. Oh, S. S. Du, N. Lambert, S. Min, R. Krishna, et al. Spurious rewards: Rethinking training signals in rlvr. arXiv preprint arXiv:2506.10947, 2025.

[42] Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, X. Bi, H. Zhang, M. Zhang, Y. Li, Y. Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

[43] C. Si, Y. Zhang, Z. Yang, R. Liu, and D. Yang. Design2code: How far are we from automating front-end engineering?, 2024. URL https://arxiv. org/abs/2403, 3163, 2024.

[44] J. Su, Y. Lu, S. Pan, A. Murtadha, B. Wen, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. arXiv preprint arXiv:2104.09864, 2021.

[45] L. Tang, G. Kim, X. Zhao, T. Lake, W. Ding, F. Yin, P. Singhal, M. Wadhwa, Z. L. Liu, Z. Sprague, et al. Chartmuseum: Testing visual reasoning capabilities of large vision-language models. arXiv preprint arXiv:2505.13444, 2025.

[46] C. Team, Z. Yue, Z. Lin, Y. Song, W. Wang, S. Ren, S. Gu, S. Li, P. Li, L. Zhao, L. Li, K. Bao, H. Tian, H. Zhang, G. Wang, D. Zhu, Cici, C. He, B. Ye, B. Shen, Z. Zhang, Z. Jiang, Z. Zheng, Z. Song, Z. Luo, Y. Yu, Y. Wang, Y. Tian, Y. Tu, Y. Yan, Y. Huang, X. Wang, X. Xu, X. Song, X. Zhang, X. Yong, X. Zhang, X. Deng, W. Yang, W. Ma, W. Lv, W. Zhuang, W. Liu, S. Deng, S. Liu, S. Chen, S. Yu, S. Liu, S. Wang, R. Ma, Q. Wang, P. Wang, N. Chen, M. Zhu, K. Zhou, K. Zhou, K. Fang, J. Shi, J. Dong, J. Xiao, J. Xu, H. Liu, H. Xu, H. Qu, H. Zhao, H. Lv, G. Wang, D. Zhang, D. Zhang, D. Zhang, C. Ma, C. Liu, C. Cai, and B. Xia. Mimo-vl technical report, 2025.

[47] G. Team, R. Anil, S. Borgeaud, Y. Wu, J.-B. Alayrac, J. Yu, R. Soricut, J. Schalkwyk, A. M. Dai, A. Hauth, K. Millican, D. Silver, S. Petrov, M. Johnson, I. Antonoglou, J. Schrittwieser, A. Glaese, J. Chen, E. Pitler, T. Lillicrap, A. Lazaridou, O. Firat, J. Molloy, M. Isard, P. R. Barham, T. Hennigan, B. Lee, F. Viola, M. Reynolds, Y. Xu, R. Doherty, E. Collins, C. Meyer, E. Rutherford, E. Moreira, K. Ayoub, M. Goel, G. Tucker, E. Piqueras, M. Krikun, I. Barr, N. Savinov, I. Danihelka, B. Roelofs, A. White, A. Andreassen, T. von Glehn, L. Yagati, M. Kazemi, L. Gonzalez, M. Khalman, J. Sygnowski, A. Frechette, C. Smith, L. Culp, L. Proleev, Y. Luan, X. Chen, J. Lottes, N. Schucher, F. Lebron, A. Rrustemi, N. Clay, P. Crone, T. Kocisky, J. Zhao, B. Perz, D. Yu, H. Howard, A. Bloniarz, J. W. Rae, H. Lu, L. Sifre, M. Maggioni, F. Alcober, D. Garrette, M. Barnes, S. Thakoor, J. Austin, G. Barth-Maron, W. Wong, R. Joshi, R. Chaabouni, D. Fatiha, A. Ahuja, R. Liu, Y. Li, S. Cogan, J. Chen, C. Jia, C. Gu, Q. Zhang, J. Grimstad, A. J. Hartman, M. Chadwick, G. S. Tomar, X. Garcia, E. Senter, E. Taropa, T. S. Pillai, J. Devlin, M. Laskin, D. de Las Casas, D. Valter, C. Tao, L. Blanco, A. P.

<!-- page 23 of 42 -->

Badia, D. Reitter, M. Chen, J. Brennan, C. Rivera, S. Brin, S. Iqbal, G. Surita, J. Labanowski, A. Rao, S. Winkler, E. Parisotto, Y. Gu, K. Olszewska, Y. Zhang, R. Addanki, A. Miech, A. Louis, L. E. Shafey, D. Teplyashin, G. Brown, E. Catt, N. Attaluri, J. Balaguer, J. Xiang, P. Wang, Z. Ashwood, A. Briukhov, A. Webson, S. Ganapathy, S. Sanghavi, A. Kannan, M.-W. Chang, A. Stjerngren, J. Djolonga, Y. Sun, A. Bapna, M. Aitchison, P. Pejman, H. Michalewski, T. Yu, C. Wang, J. Love, J. Ahn, D. Bloxwich, K. Han, P. Humphreys, T. Sellam, J. Bradbury, V. Godbole, S. Samangooei, B. Damoc, A. Kaskasoli, S. M. R. Arnold, V. Vasudevan, S. Agrawal, J. Riesa, D. Lepikhin, R. Tanburn, S. Srinivasan, H. Lim, S. Hodkinson, P. Shyam, J. Ferret, S. Hand, A. Garg, T. L. Paine, J. Li, Y. Li, M. Giang, A. Neitz, Z. Abbas, S. York, M. Reid, E. Cole, A. Chowdhery, D. Das, D. Rogozinska, V. Nikolaev, P. Sprechmann, Z. Nado, L. Zilka, ´ F. Prost, L. He, M. Monteiro, G. Mishra, C. Welty, J. Newlan, D. Jia, M. Allamanis, C. H. Hu, R. de Liedekerke, J. Gilmer, C. Saroufim, S. Rijhwani, S. Hou, D. Shrivastava, A. Baddepudi, A. Goldin, A. Ozturel, A. Cassirer, Y. Xu, D. Sohn, D. Sachan, R. K. Amplayo, C. Swanson, D. Petrova, S. Narayan, A. Guez, S. Brahma, J. Landon, M. Patel, R. Zhao, K. Villela, L. Wang, W. Jia, M. Rahtz, M. Giménez, L. Yeung, H. Lin, J. Keeling, P. Georgiev, D. Mincu, B. Wu, S. Haykal, R. Saputro, K. Vodrahalli, J. Qin, Z. Cankara, A. Sharma, N. Fernando, W. Hawkins, B. Neyshabur, S. Kim, A. Hutter, P. Agrawal, A. Castro-Ros, G. van den Driessche, T. Wang, F. Yang, S. yiin Chang, P. Komarek, R. McIlroy, M. Luciˇ c, G. Zhang, W. Farhan, ´ M. Sharman, P. Natsev, P. Michel, Y. Cheng, Y. Bansal, S. Qiao, K. Cao, S. Shakeri, C. Butterfield, J. Chung, P. K. Rubenstein, S. Agrawal, A. Mensch, K. Soparkar, K. Lenc, T. Chung, A. Pope, L. Maggiore, J. Kay, P. Jhakra, S. Wang, J. Maynez, M. Phuong, T. Tobin, A. Tacchetti, M. Trebacz, K. Robinson, Y. Katariya, S. Riedel, P. Bailey, K. Xiao, N. Ghelani, L. Aroyo, A. Slone, N. Houlsby, X. Xiong, Z. Yang, E. Gribovskaya, J. Adler, M. Wirth, L. Lee, M. Li, T. Kagohara, J. Pavagadhi, S. Bridgers, A. Bortsova, S. Ghemawat, Z. Ahmed, T. Liu, R. Powell, V. Bolina, M. Iinuma, P. Zablotskaia, J. Besley, D.-W. Chung, T. Dozat, R. Comanescu, X. Si, J. Greer, G. Su, M. Polacek, R. L. Kaufman, S. Tokumine, H. Hu, E. Buchatskaya, Y. Miao, M. Elhawaty, A. Siddhant, N. Tomasev, J. Xing, C. Greer, H. Miller, S. Ashraf, A. Roy, Z. Zhang, A. Ma, A. Filos, M. Besta, R. Blevins, T. Klimenko, C.-K. Yeh, S. Changpinyo, J. Mu, O. Chang, M. Pajarskas, C. Muir, V. Cohen, C. L. Lan, K. Haridasan, A. Marathe, S. Hansen, S. Douglas, R. Samuel, M. Wang, S. Austin, C. Lan, J. Jiang, J. Chiu, J. A. Lorenzo, L. L. Sjösund, S. Cevey, Z. Gleicher, T. Avrahami, A. Boral, H. Srinivasan, V. Selo, R. May, K. Aisopos, L. Hussenot, L. B. Soares, K. Baumli, M. B. Chang, A. Recasens, B. Caine, A. Pritzel, F. Pavetic, F. Pardo, A. Gergely, J. Frye, V. Ramasesh, D. Horgan, K. Badola, N. Kassner, S. Roy, E. Dyer, V. Campos, A. Tomala, Y. Tang, D. E. Badawy, E. White, B. Mustafa, O. Lang, A. Jindal, S. Vikram, Z. Gong, S. Caelles, R. Hemsley, G. Thornton, F. Feng, W. Stokowiec, C. Zheng, P. Thacker, Çaglar Ünlü, Z. Zhang, M. Saleh, J. Svensson, M. Bileschi, P. Patil, ˘ A. Anand, R. Ring, K. Tsihlas, A. Vezer, M. Selvi, T. Shevlane, M. Rodriguez, T. Kwiatkowski, S. Daruki, K. Rong, A. Dafoe, N. FitzGerald, K. Gu-Lemberg, M. Khan, L. A. Hendricks, M. Pellat, V. Feinberg, J. Cobon-Kerr, T. Sainath, M. Rauh, S. H. Hashemi, R. Ives, Y. Hasson, Y. Li, E. Noland, Y. Cao, N. Byrd, L. Hou, Q. Wang, T. Sottiaux, M. Paganini, J.-B. Lespiau, A. Moufarek, S. Hassan, K. Shivakumar, J. van Amersfoort, A. Mandhane, P. Joshi, A. Goyal, M. Tung, A. Brock, H. Sheahan, V. Misra, C. Li, N. Rakicevi ´ c, M. Dehghani, F. Liu, S. Mittal, ´ J. Oh, S. Noury, E. Sezener, F. Huot, M. Lamm, N. D. Cao, C. Chen, G. Elsayed, E. Chi, M. Mahdieh, I. Tenney, N. Hua, I. Petrychenko, P. Kane, D. Scandinaro, R. Jain, J. Uesato, R. Datta, A. Sadovsky, O. Bunyan, D. Rabiej, S. Wu, J. Zhang, G. Vasudevan, E. Leurent, M. Alnahlawi, I. Georgescu, N. Wei, I. Zheng, B. Chan, P. G. Rabinovitch, P. Stanczyk, Y. Zhang, D. Steiner, S. Naskar, M. Azzam, M. Johnson, A. Paszke, C.-C. Chiu, J. S. Elias, A. Mohiuddin, F. Muhammad, J. Miao, A. Lee, N. Vieillard, S. Potluri, J. Park, E. Davoodi, J. Zhang, J. Stanway, D. Garmon, A. Karmarkar, Z. Dong, J. Lee, A. Kumar, L. Zhou, J. Evens, W. Isaac, Z. Chen, J. Jia, A. Levskaya, Z. Zhu, C. Gorgolewski, P. Grabowski, Y. Mao, A. Magni, K. Yao, J. Snaider, N. Casagrande, P. Suganthan, E. Palmer, G. Irving, E. Loper, M. Faruqui, I. Arkatkar, N. Chen, I. Shafran, M. Fink, A. Castaño, I. Giannoumis, W. Kim, M. Rybinski, A. Sreevatsa, ´ J. Prendki, D. Soergel, A. Goedeckemeyer, W. Gierke, M. Jafari, M. Gaba, J. Wiesner, D. G. Wright, Y. Wei, H. Vashisht, Y. Kulizhskaya, J. Hoover, M. Le, L. Li, C. Iwuanyanwu, L. Liu, K. Ramirez, A. Khorlin, A. Cui, T. LIN, M. Georgiev, M. Wu, R. Aguilar, K. Pallo, A. Chakladar, A. Repina, X. Wu, T. van der Weide, P. Ponnapalli, C. Kaplan, J. Simsa, S. Li, O. Dousse, F. Yang, J. Piper, N. Ie, M. Lui, R. Pasumarthi, N. Lintz, A. Vijayakumar, L. N. Thiet, D. Andor, P. Valenzuela, C. Paduraru, D. Peng, K. Lee, S. Zhang, S. Greene, D. D. Nguyen, P. Kurylowicz, S. Velury, S. Krause, C. Hardin, L. Dixon, L. Janzer, K. Choo, Z. Feng, B. Zhang, A. Singhal,

<!-- page 24 of 42 -->

T. Latkar, M. Zhang, Q. Le, E. A. Abellan, D. Du, D. McKinnon, N. Antropova, T. Bolukbasi, O. Keller, D. Reid, D. Finchelstein, M. A. Raad, R. Crocker, P. Hawkins, R. Dadashi, C. Gaffney, S. Lall, K. Franko, E. Filonov, A. Bulanova, R. Leblond, V. Yadav, S. Chung, H. Askham, L. C. Cobo, K. Xu, F. Fischer, J. Xu, C. Sorokin, C. Alberti, C.-C. Lin, C. Evans, H. Zhou, A. Dimitriev, H. Forbes, D. Banarse, Z. Tung, J. Liu, M. Omernick, C. Bishop, C. Kumar, R. Sterneck, R. Foley, R. Jain, S. Mishra, J. Xia, T. Bos, G. Cideron, E. Amid, F. Piccinno, X. Wang, P. Banzal, P. Gurita, H. Noga, P. Shah, D. J. Mankowitz, A. Polozov, N. Kushman, V. Krakovna, S. Brown, M. Bateni, D. Duan, V. Firoiu, M. Thotakuri, T. Natan, A. Mohananey, M. Geist, S. Mudgal, S. Girgin, H. Li, J. Ye, O. Roval, R. Tojo, M. Kwong, J. Lee-Thorp, C. Yew, Q. Yuan, S. Bagri, D. Sinopalnikov, S. Ramos, J. Mellor, A. Sharma, A. Severyn, J. Lai, K. Wu, H.-T. Cheng, D. Miller, N. Sonnerat, D. Vnukov, R. Greig, J. Beattie, E. Caveness, L. Bai, J. Eisenschlos, A. Korchemniy, T. Tsai, M. Jasarevic, W. Kong, P. Dao, Z. Zheng, F. Liu, F. Yang, R. Zhu, M. Geller, T. H. Teh, J. Sanmiya, E. Gladchenko, N. Trdin, A. Sozanschi, D. Toyama, E. Rosen, S. Tavakkol, L. Xue, C. Elkind, O. Woodman, J. Carpenter, G. Papamakarios, R. Kemp, S. Kafle, T. Grunina, R. Sinha, A. Talbert, A. Goyal, D. Wu, D. Owusu-Afriyie, C. Du, C. Thornton, J. Pont-Tuset, P. Narayana, J. Li, S. Fatehi, J. Wieting, O. Ajmeri, B. Uria, T. Zhu, Y. Ko, L. Knight, A. Héliou, N. Niu, S. Gu, C. Pang, D. Tran, Y. Li, N. Levine, A. Stolovich, N. Kalb, R. Santamaria-Fernandez, S. Goenka, W. Yustalim, R. Strudel, A. Elqursh, B. Lakshminarayanan, C. Deck, S. Upadhyay, H. Lee, M. Dusenberry, Z. Li, X. Wang, K. Levin, R. Hoffmann, D. Holtmann-Rice, O. Bachem, S. Yue, S. Arora, E. Malmi, D. Mirylenka, Q. Tan, C. Koh, S. H. Yeganeh, S. Põder, S. Zheng, F. Pongetti, M. Tariq, Y. Sun, L. Ionita, M. Seyedhosseini, P. Tafti, R. Kotikalapudi, Z. Liu, A. Gulati, J. Liu, X. Ye, B. Chrzaszcz, L. Wang, N. Sethi, T. Li, B. Brown, S. Singh, W. Fan, A. Parisi, J. Stanton, C. Kuang, V. Koverkathu, C. A. Choquette-Choo, Y. Li, T. Lu, A. Ittycheriah, P. Shroff, P. Sun, M. Varadarajan, S. Bahargam, R. Willoughby, D. Gaddy, I. Dasgupta, G. Desjardins, M. Cornero, B. Robenek, B. Mittal, B. Albrecht, A. Shenoy, F. Moiseev, H. Jacobsson, A. Ghaffarkhah, M. Rivière, A. Walton, C. Crepy, A. Parrish, Y. Liu, Z. Zhou, C. Farabet, C. Radebaugh, P. Srinivasan, C. van der Salm, A. Fidjeland, S. Scellato, E. Latorre-Chimoto, H. Klimczak-Plucinska, ´ D. Bridson, D. de Cesare, T. Hudson, P. Mendolicchio, L. Walker, A. Morris, I. Penchev, M. Mauger, A. Guseynov, A. Reid, S. Odoom, L. Loher, V. Cotruta, M. Yenugula, D. Grewe, A. Petrushkina, T. Duerig, A. Sanchez, S. Yadlowsky, A. Shen, A. Globerson, A. Kurzrok, L. Webb, S. Dua, D. Li, P. Lahoti, S. Bhupatiraju, D. Hurt, H. Qureshi, A. Agarwal, T. Shani, M. Eyal, A. Khare, S. R. Belle, L. Wang, C. Tekur, M. S. Kale, J. Wei, R. Sang, B. Saeta, T. Liechty, Y. Sun, Y. Zhao, S. Lee, P. Nayak, D. Fritz, M. R. Vuyyuru, J. Aslanides, N. Vyas, M. Wicke, X. Ma, T. Bilal, E. Eltyshev, D. Balle, N. Martin, H. Cate, J. Manyika, K. Amiri, Y. Kim, X. Xiong, K. Kang, F. Luisier, N. Tripuraneni, D. Madras, M. Guo, A. Waters, O. Wang, J. Ainslie, J. Baldridge, H. Zhang, G. Pruthi, J. Bauer, F. Yang, R. Mansour, J. Gelman, Y. Xu, G. Polovets, J. Liu, H. Cai, W. Chen, X. Sheng, E. Xue, S. Ozair, A. Yu, C. Angermueller, X. Li, W. Wang, J. Wiesinger, E. Koukoumidis, Y. Tian, A. Iyer, M. Gurumurthy, M. Goldenson, P. Shah, M. Blake, H. Yu, A. Urbanowicz, J. Palomaki, C. Fernando, K. Brooks, K. Durden, H. Mehta, N. Momchev, E. Rahimtoroghi, M. Georgaki, A. Raul, S. Ruder, M. Redshaw, J. Lee, K. Jalan, D. Li, G. Perng, B. Hechtman, P. Schuh, M. Nasr, M. Chen, K. Milan, V. Mikulik, T. Strohman, J. Franco, T. Green, D. Hassabis, K. Kavukcuoglu, J. Dean, and O. Vinyals. Gemini: A family of highly capable multimodal models, 2023.

[48] G. Team, A. Kamath, J. Ferret, S. Pathak, N. Vieillard, R. Merhej, S. Perrin, T. Matejovicova, A. Ramé, M. Rivière, et al. Gemma 3 technical report. arXiv preprint arXiv:2503.19786, 2025.

[49] G. R. Team, S. Abeyruwan, J. Ainslie, J.-B. Alayrac, M. G. Arenas, T. Armstrong, A. Balakrishna, R. Baruch, M. Bauza, M. Blokzijl, et al. Gemini robotics: Bringing ai into the physical world. arXiv preprint arXiv:2503.20020, 2025.

[50] K. Team, A. Du, B. Yin, B. Xing, B. Qu, B. Wang, C. Chen, C. Zhang, C. Du, C. Wei, C. Wang, D. Zhang, D. Du, D. Wang, E. Yuan, E. Lu, F. Li, F. Sung, G. Wei, G. Lai, H. Zhu, H. Ding, H. Hu, H. Yang, H. Zhang, H. Wu, H. Yao, H. Lu, H. Wang, H. Gao, H. Zheng, J. Li, J. Su, J. Wang, J. Deng, J. Qiu, J. Xie, J. Wang, J. Liu, J. Yan, K. Ouyang, L. Chen, L. Sui, L. Yu, M. Dong, M. Dong, N. Xu, P. Cheng, Q. Gu, R. Zhou, S. Liu, S. Cao, T. Yu, T. Song, T. Bai, W. Song, W. He, W. Huang, W. Xu, X. Yuan, X. Yao, X. Wu, X. Li, X. Zu, X. Zhou, X. Wang, Y. Charles, Y. Zhong, Y. Li, Y. Hu, Y. Chen, Y. Wang, Y. Liu, Y. Miao, Y. Qin, Y. Chen, Y. Bao, Y. Wang, Y. Kang, Y. Liu, Y. Dong, Y. Du, Y. Wu, Y. Wang, Y. Yan, Z. Zhou, Z. Li, Z. Jiang,

<!-- page 25 of 42 -->

Z. Zhang, Z. Yang, Z. Huang, Z. Huang, Z. Zhao, Z. Chen, and Z. Lin. Kimi-vl technical report, 2025.

[51] S. Tong, E. Brown, P. Wu, S. Woo, M. Middepogu, S. C. Akula, J. Yang, S. Yang, A. Iyer, X. Pan, A. Wang, R. Fergus, Y. LeCun, and S. Xie. Cambrian-1: A fully open, vision-centric exploration of multimodal llms, 2024.

[52] B. Wang, B. Wang, C. Wan, G. Huang, H. Hu, H. Jia, H. Nie, M. Li, N. Chen, S. Chen, et al. Step-3 is large yet affordable: Model-system co-design for cost-effective decoding. arXiv preprint arXiv:2507.19427, 2025.

[53] F. Wang, X. Fu, J. Y. Huang, Z. Li, Q. Liu, X. Liu, M. D. Ma, N. Xu, W. Zhou, K. Zhang, et al. Muirbench: A comprehensive benchmark for robust multi-image understanding. arXiv preprint arXiv:2406.09411, 2024.

[54] H. Wang, X. Li, Z. Huang, A. Wang, J. Wang, T. Zhang, J. Zheng, S. Bai, Z. Kang, J. Feng, et al. Traceable evidence enhanced visual grounded reasoning: Evaluation and methodology. arXiv preprint arXiv:2507.07999, 2025.

[55] K. Wang, J. Pan, W. Shi, Z. Lu, M. Zhan, and H. Li. Measuring multimodal mathematical reasoning with math-vision dataset. arXiv:2402.14804, 2024.

[56] M. Wang, S. Sunkara, G. Baechler, J. Lin, Y. Zhu, F. Zubach, L. Shu, and J. Chen. Webquest: A benchmark for multimodal qa on web page sequences, 2024.

[57] P. Wang, S. Bai, S. Tan, S. Wang, Z. Fan, J. Bai, K. Chen, X. Liu, J. Wang, W. Ge, et al. Qwen2-vl: Enhancing vision-language model’s perception of the world at any resolution. arXiv preprint arXiv:2409.12191, 2024.

[58] W. Wang, Z. He, W. Hong, Y. Cheng, X. Zhang, J. Qi, S. Huang, B. Xu, Y. Dong, M. Ding, et al. Lvbench: An extreme long video understanding benchmark. arXiv preprint arXiv:2406.08035, 2024.

[59] W. Wang, Q. Lv, W. Yu, W. Hong, J. Qi, Y. Wang, J. Ji, Z. Yang, L. Zhao, X. Song, et al. Cogvlm: Visual expert for pretrained language models. arXiv preprint arXiv:2311.03079, 2023.

[60] J. Wei, X. Wang, D. Schuurmans, M. Bosma, B. Ichter, F. Xia, E. H. Chi, Q. V. Le, and D. Zhou. Chain-of-thought prompting elicits reasoning in large language models. In S. Koyejo, S. Mohamed, A. Agarwal, D. Belgrave, K. Cho, and A. Oh, editors, Proc. of Neural Information Processing Systems, 2022.

[61] Y. Xiao, E. Sun, T. Liu, and W. Wang. Logicvista: Multimodal llm logical reasoning benchmark in visual contexts, 2024.

[62] T. Xie, D. Zhang, J. Chen, X. Li, S. Zhao, R. Cao, J. H. Toh, Z. Cheng, D. Shin, F. Lei, et al. Osworld: Benchmarking multimodal agents for open-ended tasks in real computer environments. Advances in Neural Information Processing Systems, 37:52040–52094, 2025.

[63] H. Xu, S. Xie, X. E. Tan, P.-Y. Huang, R. Howes, V. Sharma, S.-W. Li, G. Ghosh, L. Zettlemoyer, and C. Feichtenhofer. Demystifying clip data. arXiv preprint arXiv:2309.16671, 2023.

[64] Y. Xu, H. Dong, L. Wang, D. Sahoo, J. Li, and C. Xiong. Scalable chain of thoughts via elastic reasoning. arXiv preprint arXiv:2505.05315, 2025.

[65] C.-H. Yeh, C. Wang, S. Tong, T.-Y. Cheng, R. Wang, T. Chu, Y. Zhai, Y. Chen, S. Gao, and Y. Ma. Seeing from another perspective: Evaluating multi-view understanding in mllms. arXiv preprint arXiv:2504.15280, 2025.

[66] Q. Yu, Z. Zhang, R. Zhu, Y. Yuan, X. Zuo, Y. Yue, W. Dai, T. Fan, G. Liu, L. Liu, et al. Dapo: An open-source llm reinforcement learning system at scale. arXiv preprint arXiv:2503.14476, 2025.

<!-- page 26 of 42 -->

[67] X. Yue, Y. Ni, K. Zhang, T. Zheng, R. Liu, G. Zhang, S. Stevens, D. Jiang, W. Ren, Y. Sun, C. Wei, B. Yu, R. Yuan, R. Sun, M. Yin, B. Zheng, Z. Yang, Y. Liu, W. Huang, H. Sun, Y. Su, and W. Chen. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proc. of Computer Vision and Pattern Recognition, 2024.

[68] X. Yue, T. Zheng, Y. Ni, Y. Wang, K. Zhang, S. Tong, Y. Sun, B. Yu, G. Zhang, H. Sun, Y. Su, W. Chen, and G. Neubig. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. arXiv preprint arXiv:2409.02813, 2024.

[69] H. Zhang, P. Zhang, X. Hu, Y.-C. Chen, L. Li, X. Dai, L. Wang, L. Yuan, J.-N. Hwang, and J. Gao. Glipv2: Unifying localization and vision-language understanding. Proc. of Neural Information Processing Systems, 35:36067–36080, 2022.

[70] R. Zhang, D. Jiang, Y. Zhang, H. Lin, Z. Guo, P. Qiu, A. Zhou, P. Lu, K.-W. Chang, Y. Qiao, et al. Mathverse: Does your multi-modal llm truly see the diagrams in visual math problems? In European Conference on Computer Vision, pages 169–186. Springer, 2024.

[71] Y. Zhao, L. Xie, H. Zhang, G. Gan, Y. Long, Z. Hu, T. Hu, W. Chen, C. Li, J. Song, Z. Xu, C. Wang, W. Pan, Z. Shangguan, X. Tang, Z. Liang, Y. Liu, C. Zhao, and A. Cohan. Mmvu: Measuring expert-level multi-discipline video understanding, 2025.

[72] J. Zhu, W. Wang, Z. Chen, Z. Liu, S. Ye, L. Gu, H. Tian, Y. Duan, W. Su, J. Shao, et al. Internvl3: Exploring advanced training and test-time recipes for open-source multimodal models. arXiv preprint arXiv:2504.10479, 2025.

[73] W. Zhu, J. Hessel, A. Awadalla, S. Y. Gadre, J. Dodge, A. Fang, Y. Yu, L. Schmidt, W. Y. Wang, and Y. Choi. Multimodal c4: An open, billion-scale corpus of images interleaved with text. Advances in Neural Information Processing Systems, 36:8958–8974, 2023.

[74] C. Zou, X. Guo, R. Yang, J. Zhang, B. Hu, and H. Zhang. Dynamath: A dynamic visual benchmark for evaluating mathematical reasoning robustness of vision language models. arXiv preprint arXiv:2411.00836, 2024.

<!-- page 27 of 42 -->

## A Qualitative Examples

A 定性示例

In this section, we demonstrate the capabilities and advantages of our model through various qualitative examples.

本节通过各种定性示例展示我们模型的能力和优势.

## A.1 UI Code Generation

A.1 UI 代码生成

![Image block](images/p27-prompt-please-develop-a-similar-looking-ui-and-provide.png)

(图: 上方标题 「Original UI (left) and Rendered UI (right)」. 左边是原始界面截图, 标题栏写 「任务管理仪表盘」; 右边是模型生成的代码渲染出来的界面, 标题栏写 「任务建议表盘」. 两边布局一致: 左栏 「仪表盘摘要」, 有整体进度条, 「4 总任务数」, 「0 已完成」, 三个颜色圆点, 一个蓝色按钮; 左下 「任务地图」; 右栏 「任务列表」, 右上有 「所有」, 「高优先级」, 「进行中」 三个切换按钮, 下面四张任务卡片: 完成项目提案, 客户会议准备, 更新网站内容, 设计新LOGO, 各带进度条, 日期和负责人.)

Prompt: Please develop a similar-looking UI and provide the complete React component code. Model Response:

Prompt: 请做一个外观相似的 UI, 并给出完整的 React 组件代码. 模型回答:

![Image block](images/p27-figure-7-a-case-showing-the-ability-of-generating-the.png)

(图: 模型回答的代码截图. 一整段用 「\\n」 连接的 HTML 字符串: head 里设 UTF-8 和 viewport, title 为 「任务建议表盘」, 从 jsdelivr 引入 react@18.0.0, react-dom 和 babel standalone, 引入 tailwindcss, font-awesome 5.15.3 和 Noto Sans SC 字体; body 里用 text/babel 脚本定义 Header 组件 (蓝底白字标题 「任务建议表盘」 和一个月亮图标按钮) 和 DashboardSummary 组件 (「仪表盘摘要」, 「整体进度」 51%, 「总任务数」 4, 「已完成」 0). 代码截到一半用 「...」 省略, 以 「</answer>」 结尾.)

Figure 7: A case showing the ability of generating the front-end code from a UI snapshot.

图 7: 从 UI 截图生成前端代码的案例.

> **对一下:** 图 7 的原始界面和渲染界面, 标题文字一样吗?
> 不一样. 把第 27 页上方的对比图和下方的代码对一下: 原始界面标题栏是 「任务管理仪表盘」, 渲染界面和代码里的 title, h1 都是 「任务建议表盘」, 「管理仪」 三个字变成了 「建议」. 其余可读的文字, 如 「仪表盘摘要」, 「总任务数」, 「已完成」, 四张任务卡的标题, 两边一致. 论文没有点评这个差别. 按第 41 页附录 B.1 的口径, UI 复现是否合格看 GPT-o4-mini 给的相似度是否不低于 80, 人工评审也只看整体布局, 颜色和元素, 标题里错几个字不一定会让这个案例判为不合格.

<!-- page 28 of 42 -->

## A.2 Video Description

A.2 视频描述

![Image block](images/p28-figure-8-a-case-showing-the-ability-of-giving-detailed.png)

(图: 上方三帧视频截图, 白色窗帘前, 一位穿深蓝条纹上衣的人坐着缝东西, 另一位穿青绿色毛衣的人站在身后, 手搭在她肩上. 下方 Prompt: 「Please describe this video in detail.」 模型回答先在 think 里逐项分析场景, 两个人物的衣着和动作, 随时间的互动变化, 桌上的格子布包等物品, 光线和整体氛围; answer 分四个小标题: Setting & Atmosphere, Characters & Actions, Interaction & Mood, Object Details. 结论是: 视频呈现两人在温馨居家环境中一起做手工的亲密时刻.)

Figure 8: A case showing the ability of giving detailed and precise description for a video.

图 8: 对一段视频给出详细准确描述的案例.

<!-- page 29 of 42 -->

## A.3 Video Description (in Chinese)

A.3 视频描述 (中文)

![Image block](images/p29-figure-9-a-case-showing-the-ability-of-giving-detailed.png)

(图: 与图 8 是同一段视频的三帧. Prompt 是 「请详细描述这个视频.」 模型用中文回答: think 部分先拆场景, 再看动态变化和细节, 然后组织语言; answer 分 「场景与环境」, 「人物与互动」, 「氛围与情感」 三段, 描述透光的白色纱帘, 木质桌上的手工物品, 坐着的女性专注缝纫, 站着的人从扶肩到轻抚头部, 整体氛围温馨亲密.)

Figure 9: A case showing the ability of giving detailed and precise description for a video.

图 9: 对一段视频给出详细准确描述的案例.

<!-- page 30 of 42 -->

A.4 Video QA

A.4 视频问答

![Image block](images/p30-figure-10-a-case-showing-the-ability-of-answering-a.png)

(图: 三帧实验视频: 左右两个玻璃杯分别装红色和蓝色液体, 中间是空杯, 纸巾把三个杯子连起来; 字幕依次为 「放入纸巾」, 「送水开始」. Prompt: 「这个现象发生的原因是什么? 为什么中间水杯会有水?」 模型在 think 中一度犹豫 「由于液体在纸巾中的毛细作用, 会从低浓度 (或低液位? 不对...)」, 随后自我纠正, 把原因归到毛细现象; answer 说明纸巾纤维间的缝隙类似毛细管, 把左右两杯的液体输送到中间的空杯.)

Figure 10: A case showing the ability of answering a question related to a video using perception, knowledge and reasoning.

图 10: 结合感知, 知识和推理回答与视频相关问题的案例.

<!-- page 31 of 42 -->

A.5 GUI Agent

A.5 GUI 智能体

![Image block](images/p31-figure-11-a-case-showing-the-ability-of-gui-recognition.png)

(图: 一张手机截图, Simple Calendar Pro 的十月月视图, 15 日被蓝圈标出, 8 日, 9 日, 11 日, 14 日, 21 日, 23 日, 25 日, 27 日, 30 日, 31 日下面有事件条, 右下角有一个加号浮动按钮. Prompt: 在 Simple Calendar Pro 里, 在两周后的今天 3 点建一个日历事件, 标题 「Meeting with Dr. Smith」, 描述 「We will discuss marketing strategies.」, 时长 15 分钟. 模型在 think 里判断今天是 10 月 15 日, 两周后是 10 月 29 日, 回顾之前的操作 (已打开应用, 点过加号, 上一步点的位置不确定), 决定直接点 29 日. answer 输出动作 {「action_type」: 「click」, 「box_2d」: [27,840,122,885]}.)

Figure 11: A case showing the ability of GUI recognition and operation.

图 11: 识别和操作 GUI 的案例.

<!-- page 32 of 42 -->

A.6 Chart QA

A.6 图表问答

![Image block](images/p32-figure-12-a-case-showing-the-ability-of-chart.png)

(图: Visual Capitalist 的信息图 「How Profitable Are Major Media Companies?」, 列出六家公司的净利润率, 年收入和年利润: Netflix 16.0%, $33.7B, $5.4B; FOX 10.7%, $14.0B, $1.5B; Sony 7.5%, $83.2B, $6.3B, 旁注 「Media is Sony's second-largest segment after game consoles」; Disney 5.4%, $91.4B, $5.0B, 旁注 「The parks business contributed 60% of profits」; Paramount −2.1%, $29.7B, −$608M; WB −7.6%, $41.3B, −$3.1B. Prompt: 「What is the largest segment of the company with the highest annual profit?」 模型先列出六家的年利润, 找出最高的是 Sony 的 $6.3B, 再根据旁注推出 Sony 最大的业务是游戏主机, 答案 「game consoles」.)

Figure 12: A case showing the ability of chart understanding and question answering.

图 12: 理解图表并回答问题的案例.

<!-- page 33 of 42 -->

A.7 Geolocation

A.7 地理定位

![Image block](images/p33-figure-13-a-case-showing-the-ability-of-inferring-the.png)

(图: 一张照片, 石砌城墙和多座尖顶圆塔, 墙外是绿草坡和一条小路. Prompt: 「这里可能是哪里?」 模型在 think 里分析中世纪防御城堡的特征, 拿卡尔卡松城堡的内外两道城墙和尖顶塔楼去比对, 也排除了德国的霍亨索伦城堡, 意大利和西班牙的城堡; answer 的结论是 「这里可能是法国的卡尔卡松城堡」.)

Figure 13: A case showing the ability of inferring the geographic position from a picture.

图 13: 从一张图片推断地理位置的案例.

<!-- page 34 of 42 -->

A.8 OCR + Coding

A.8 OCR + 编程

![Image block](images/p34-figure-14-a-case-showing-the-integrated-ability-of-code.png)

(图: 一段代码截图, 第 377 到 397 行, 函数 is_palindrome(s: str) -> bool, 用左右双指针跳过非字母数字字符, 比较小写后的字符; 第 379 行初始化为 left, right = 1, len(s). Prompt: 「Can you spot the bugs and return the correct code?」 模型指出错误在指针初始化: left 应从 0 开始, right 应为 len(s) - 1; 给出改正后的 20 行代码, 并附一段 Explanation.)

Figure 14: A case showing the integrated ability of code recognition, debugging and correction.

图 14: 综合代码识别, 调试和改错能力的案例.

<!-- page 35 of 42 -->

## A.9 Chemistry Problem Solving

A.9 化学解题

(化学案例 Chemistry Problem Solving, 图 15. 该案例没有分数, 也没有阈值.)

Figure 15: A case showing the ability of solving Chemistry problem.

图 15: 解化学题的案例.

<!-- page 36 of 42 -->

![Image block](images/p36-figure-16-a-case-showing-the-ability-of-solving-complex.png)

(图: 一道立体几何题的截图, 17 题 (15 分): 四棱锥 P-ABCD 中, PA 垂直平面 ABCD, BC 平行 AD, AB 垂直 AD. (1) 证明平面 PAB 垂直平面 PAD; (2) 若 PA = AB = √2, AD = √3 + 1, BC = 2, P, B, C, D 在同一个球面上, 球心为 O, (i) 证明 O 在平面 ABCD 上, (ii) 求直线 AC 与直线 PO 所成角的余弦值. 旁边有四棱锥示意图. Prompt: 「解题, 给出详细过程和答案」. 模型的 answer: (1) 由 PA 垂直平面 ABCD 得 PA 垂直 AD, 又 AB 垂直 AD, 故 AD 垂直平面 PAB, 再由面面垂直判定定理得证; (2)(i) 以 A 为原点建系, A(0,0,0), B(0,√2,0), P(0,0,√2), D(√3+1,0,0), C(2,√2,0), 设 O(x,y,z) 并令 OP = OB = OC = OD, 解得 O(1,0,0), 所以 O 在平面 ABCD 上; (ii) AC 向量 (2,√2,0), PO 向量 (1,0,−√2), 余弦值为 2/(√6 乘 √3) = √2/3.)

Figure 16: A case showing the ability of solving complex Math problem.

图 16: 解复杂数学题的案例.

> **回看:** 第 35 到 40 页, md 有没有漏掉东西?
> 回看 PDF, 漏了四处. 第 36 页 PDF 开头有小节标题 「A.10 Math Problem Solving」, md 没抓到, 所以 md 的附录编号从 A.9 直接跳到 A.11. 第 35 页 PDF 在化学作答上方标了 「Image」, 那道化学题本身是一张图, md 里没有这张图, 图 15 是全文唯一没有图片文件的 Figure, 图集合里因此只有 27 张. 第 38 页 PDF 在图 18 下面有完整的 Prompt 和作答: 问把绿点标注的杯子移到键盘左边后, 杯子在鼠标的什么方向, 模型答在鼠标左边; md 只留下照片和图题. 第 40 页 PDF 有 system prompt (定义一个 crop 工具, 坐标按千分比, 取值 0 到 999), 用户问 「金牌虾-虾仁玉米水饺的价格是多少?」, 模型两次调用 crop, 先裁 [630, 280, 999, 999], 再裁 [720, 300, 990, 580], 最后答 「40.50元」; md 同样只剩图片和图题. 我顺手核过图 16 的数学作答: 球心 O(1,0,0) 满足四个等距方程, 余弦值 √2/3 也算得对.

<!-- page 37 of 42 -->

A.11 Long Document Understanding

A.11 长文档理解

![Image block](images/p37-figure-17-a-case-showing-the-ability-of-deeply.png)

(图: 上方是一份 42 页研报的缩略图网格. Prompt: 「总结这篇研报的主要观点, 并翻译成英文.」 后面附英文翻译. 模型先用中文分四个维度总结: 模型维度 (预训练 Scaling Law 有望开启新阶段, 新架构如 Mamba 混合架构, Google Gemini Diffusion, 大规模算力集群如 OpenAI 的 「星际之门」), 算力维度 (训练端与推理端协同推动算力需求增长, Agent 兴起让 token 消耗量级提升, 国产算力如华为 CloudMatrix 384 超节点服务器), 应用维度 (MCP 协议统一工具调用生态, 25Q1 国内 AI 企业利润率先改善, 商业模式从 「交付工具」 转向 「交付结果」), 落地场景 (2C 场景如广告, 电商先落地, 2B 场景中数据复杂度低的领域更易规模化). 然后给出英文翻译, 四段对应 Model Dimension, Computing Power Dimension, Application Dimension, Landing Scenarios.)

Figure 17: A case showing the ability of deeply interpreting a long document.

图 17: 深度解读长文档的案例.

> **再看:** 图 17 的英文翻译和中文总结逐句对得上吗?
> 再看图里的两段文字, 有两处对不上. 中文写 OpenAI 「星际之门」, 英文译成了 「Starlink」, 星际之门对应的英文名是 Stargate, Starlink 是另一家公司的卫星网络. 中文写 「华为腾CloudMatrix 384」, 少了一个 「昇」 字, 英文却写成 「Huawei Ascend CloudMatrix 384」, 英文这边反而是对的. 这是模型输出里的错误, 论文把这个案例当作能力展示, 没有点评. 另外, 中文里的 「Scaling Law」 在英文里原样保留.

<!-- page 38 of 42 -->

## A.12 Spatial Reasoning

A.12 空间推理

![Image block](images/p38-figure-18-a-case-showing-the-ability-of-complex-spatial.png)

(图: 一张办公桌照片: 戴尔显示器底座前是一把深灰色键盘, 键盘上有一个黄点; 键盘右边是一只鼠标, 上面有一个红点; 鼠标后面有一瓶饮料和一个黄色杯子, 杯子上有一个绿点; 杯子右前方有一个小白色物件, 上面有一个蓝点. 图里没有文字问答, Prompt 和模型作答在 PDF 第 38 页图片下方, md 没有抓到.)

Figure 18: A case showing the ability of complex spatial reasoning.

图 18: 复杂空间推理的案例.

<!-- page 39 of 42 -->

A.13 Visual Grounding

A.13 视觉定位

![Image block](images/p39-lt-think-gt-the-image-contains-multiple-people-we-need.png)

(图: 上方标题 「Original Image (left) and Visualized Grounding (right)」. 左图是海边沙滩上的一群人, 右图是同一张图, 在一对情侣身上画出了定位框. 图下 PDF 有 Prompt: "Tell me the position of the couple in the picture. The short-haired guy is wearing a pink top and blue shorts, and the girl is in a cyan dress. Answer in [x1,y1,x2,y2] format." 这句 Prompt 在 md 里没有, md 只抓到了图片和下面的作答.)

&lt;think&gt; The image contains multiple people. We need to find the specific couple where the short - haired guy is wearing a pink top and blue shorts, and the girl is in a cyan dress. First, we scan through all the individuals in the image to identify the person matching the description of the short-haired guy with a pink top and blue shorts. Once we locate him, we then look for the girl in a cyan dress near him. After identifying both of them precisely within the image, we determine their bounding box coordinates in the [x1,y1,x2,y2] format by measuring the left - most (x1), top - most (y1), right - most (x2), and bottom - most (y2) points of their combined area or individual areas if they are separate but clearly associated as a couple.&lt;/think&gt;&lt;answer&gt; The position of the couple in the picture, where the short-haired guy is wearing a pink top and blue shorts, and the girl is in a cyan dress, is [835,626,931,883]. &lt;/answer&gt;

(模型回答) <think> 图中有多个人. 我们要找的是特定的一对情侣: 短发男生穿粉色上衣和蓝色短裤, 女生穿青色连衣裙. 首先, 扫一遍图中所有人, 找出符合 「短发, 粉色上衣, 蓝色短裤」 这一描述的男生. 找到他之后, 再在他附近找穿青色连衣裙的女生. 在图中准确认出两人后, 按 [x1,y1,x2,y2] 格式确定他们的边界框坐标: 量出两人合并区域的最左 (x1), 最上 (y1), 最右 (x2), 最下 (y2) 各点; 如果两人分开但明显是一对, 就分别量. </think><answer> 图中这对情侣, 即穿粉色上衣和蓝色短裤的短发男生和穿青色连衣裙的女生, 位置是 [835,626,931,883]. </answer>

Figure 19: A case showing the ability of visual grounding.

图 19: 视觉定位的案例.

<!-- page 40 of 42 -->

A.14 Tool Using

A.14 工具调用

![Image block](images/p40-figure-20-a-case-showing-the-ability-of-tool-using-and.png)

(图: 上方标题 「Original Image (left), Observation Image 1 (mid) and Observation Image 2 (right)」. 左图是超市冷冻柜区域, 中图是裁剪出的右侧冷冻柜, 右图是再次裁剪出的商品和价格标签特写. 图下的 system prompt, Prompt 「金牌虾-虾仁玉米水饺的价格是多少?」, 两次 crop 调用和最终答案 「40.50元」 在 PDF 第 40 页, md 没有抓到.)

Figure 20: A case showing the ability of tool using and visual reasoning.

图 20: 工具调用和视觉推理的案例.

<!-- page 41 of 42 -->

## B Evaluation Protocols and Instructions

B 评测协议与指令

## B.1 Evaluation Protocol of VLM Coding

B.1 VLM 编程的评测协议

To assess the HTML code generation capabilities of GLM-4.1V-Thinking and GLM-4.5V, we follow the “direct” evaluation setting described in Design2Code [43], omitting both text augmentation and self-revision steps. In contrast to [43], we employ GPT-o4-mini as the visual judge to compare each rendered HTML output against the corresponding UI reference screenshot. This choice is motivated by our empirical observation that GPT-o4-mini consistently produces similarity judgments that are more accurate and more closely aligned with human preferences than those obtained from CLIP, particularly in the presence of complex UI layouts. The scoring prompt provided to GPT-o4-mini is as follows:

为评估 GLM-4.1V-Thinking 和 GLM-4.5V 生成 HTML 代码的能力, 我们沿用 Design2Code [43] 中的 「direct」 评测设置, 省去文本增强和自我修订两步. 与 [43] 不同, 我们用 GPT-o4-mini 作为视觉评判, 把每个渲染出来的 HTML 输出与对应的 UI 参考截图做比较. 这样选择是因为我们在经验上观察到, 与 CLIP 相比, GPT-o4-mini 给出的相似度判断更准确, 也更贴近人类偏好, 在 UI 版式复杂时尤其如此. 提供给 GPT-o4-mini 的打分 prompt 如下:

I will give you two images. The first is the reference, and the second is generated from the first via code rendering. Please rate their similarity from 0–100, where 0 means completely different and 100 means identical. Provide the score inside a LaTeX \boxed{} and briefly explain your reasoning.

我会给你两张图. 第一张是参考图, 第二张是由第一张通过代码渲染生成的. 请给它们的相似度打 0 到 100 分, 0 表示完全不同, 100 表示完全相同. 把分数写在 LaTeX 的 \boxed{} 里, 并简要说明理由.

We take 80 as the score threshold for a faithful UI2Code reproduction and report accuracy as the proportion of test cases meeting this criterion (score ≥ 80). This choice is based on our observation that rendering differences in resolution, fonts, and other factors make a perfect score of 100 impractical — almost all results would be judged “inconsistent,” distorting the evaluation. Human raters focus on overall layout, colors, and elements rather than pixel-level differences, and in our manual evaluation, cases with VLM-assigned scores ≥ 80 were generally considered visually and functionally consistent with the reference.

我们把 80 分作为 UI2Code 忠实复现的分数阈值, 报告的准确率是达到这一标准 (分数 ≥ 80) 的测试用例所占比例. 这样选择是因为我们观察到, 分辨率, 字体等因素带来的渲染差异让满分 100 不现实: 几乎所有结果都会被判为 「不一致」, 评测因此失真. 人工评审关注的是整体布局, 颜色和元素, 而不是像素级差异; 在我们的人工评估中, VLM 给分 ≥ 80 的用例通常被认为在视觉和功能上与参考图一致.

> **问:** 表 2 里 Design2Code 一栏 GLM-4.5V 的 82.2, 是平均相似度, 还是别的什么?
> 按这一段的定义, 它是准确率: 所有测试用例里, GPT-o4-mini 给出的相似度不低于 80 的用例所占的百分比. 所以 82.2 的意思是约 82.2% 的用例过了 80 分这条线, 不是平均得了 82.2 分. 表 2 里其他模型的 Design2Code 分数大多带 「\*」, 是作者用同一协议复现的. 这一段只写了 Design2Code, Flame-React-Eval 的 72.5, 82.5, 86.3 是否也按同一阈值折算, 本文没有说明.

## B.2 GUI Agent Instructions

B.2 GUI 智能体指令

To achieve optimal performance and reproduce the results presented in the paper when utilizing GLM-4.1V-Thinking or GLM-4.5V as a GUI Agent on mobile phones and computers, it is essential to follow the specific prompts and settings outlined in [https://github.com/zai-org/GLM-V/blob/main/examples/gui-agent/glm-41v/agent.md](https://github.com/zai-org/GLM-V/blob/main/examples/gui-agent/glm-41v/agent.md) (for GLM-4.1V-Thinking) or [https://github.com/zai-org/GLM-V/blob/main/examples/gui-agent/glm-45v/agent.md](https://github.com/zai-org/GLM-V/blob/main/examples/gui-agent/glm-45v/agent.md) (for GLM-4.5V).

在手机和电脑上把 GLM-4.1V-Thinking 或 GLM-4.5V 用作 GUI 智能体时, 为获得最佳性能并复现论文中的结果, 必须遵循 [https://github.com/zai-org/GLM-V/blob/main/examples/gui-agent/glm-41v/agent.md](https://github.com/zai-org/GLM-V/blob/main/examples/gui-agent/glm-41v/agent.md) (GLM-4.1V-Thinking) 或 [https://github.com/zai-org/GLM-V/blob/main/examples/gui-agent/glm-45v/agent.md](https://github.com/zai-org/GLM-V/blob/main/examples/gui-agent/glm-45v/agent.md) (GLM-4.5V) 中列出的具体 prompt 和设置.

## B.3 Visual Grounding Instructions

B.3 视觉定位指令

To reliably trigger the grounding behavior of GLM-4.5V or GLM-4.1V-Thinking and reproduce the evolution results reported in the paper, we suggest using prompts similar to the format shown below.:

为了可靠地触发 GLM-4.5V 或 GLM-4.1V-Thinking 的定位行为, 并复现论文报告的评测结果 (原文写作 「evolution results」, 按上下文应为 evaluation), 我们建议使用与下面格式类似的 prompt:

• Help me to locate &lt;expr&gt; in the image and give me its bounding boxes.

帮我在图中找到 &lt;expr&gt;, 并给出它的边界框.

• Please pinpoint the bounding box $[ [ \mathrm { x } 1 , \mathrm { y } 1 , \mathrm { x } 2 , \mathrm { y } 2 ] , \ldots ]$ in the image as per the given description. &lt;expr&gt;

请按给定描述, 在图中精确标出边界框 [[x1, y1, x2, y2], ...]. &lt;expr&gt;

In the prompts, &lt;expr&gt; is the description of the target object, and the bracket style may vary $( [ ] , ( ) , \Leftrightarrow$ {}, etc.). Each output bounding box will be a quadruple $[ x _ { 1 } , y _ { 1 } , x _ { 2 } , y _ { 2 } ]$ composed of the coordinates of the top-left and bottom-right corners, where each value is normalized by the image width (for x) or height (for y) and scaled by 1000.

在这些 prompt 里, &lt;expr&gt; 是对目标物体的描述, 括号样式可以变化 (如 [ ], ( ), <>, { } 等; md 把尖括号识别成了 「⇔」). 每个输出的边界框是一个四元组 [x1, y1, x2, y2], 由左上角和右下角的坐标组成, 其中每个值按图像宽度 (x) 或高度 (y) 归一化, 再乘以 1000.

## C Experimental Results of GLM-4.1V-9B-Thinking

C GLM-4.1V-9B-Thinking 的实验结果

The comparison of GLM-4.1V-9B-Thinking with baselines under 10B parameters is provided in Table 3. GLM-4.1V-9B-Thinking sets a new state-of-the-art across 23 out of 28 benchmarks among models under 10B parameters, including MiMo-VL [46], Kimi-VL [50], InternVL3 [72], and Qwen-VL series [4].

GLM-4.1V-9B-Thinking 与 10B 参数以下基线的对比见表 3. 在 10B 参数以下的模型中, 包括 MiMo-VL [46], Kimi-VL [50], InternVL3 [72] 和 Qwen-VL 系列 [4], GLM-4.1V-9B-Thinking 在 28 个基准中的 23 个上刷新了最佳水平.

> **确认:** 「23 out of 28」 能从表 3 数出来吗?
> 能. 第 42 页表 3 正好 28 行. 只和 10B 以下的四列 (Qwen2.5-VL 7B, InternVL3 9B, Kimi-VL A3B-Thinking, MiMo-VL 7B-RL) 比, GLM-4.1V-9B-Thinking 不是第一的有 5 行: MathVista 80.7 低于 MiMo-VL 的 81.5; WeMath 63.8 低于 MiMo-VL 的 66.3; OCRBench 84.2 低于 InternVL3 的 87.7, MiMo-VL 的 86.6 和 Qwen2.5-VL 7B 的 84.5; RefCOCO-avg 87.4 低于 MiMo-VL 的 89.6 和 InternVL3 的 88.7; LVBench 45.1 低于 Qwen2.5-VL 7B 的 45.3. 28 减 5 等于 23, 和正文一致. 这个数能复核, 第 17 页的 29/42 却复核不出来, 两处的口径不一样.

<!-- page 42 of 42 -->

<table><tr><td>Task</td><td>Benchmark</td><td>GLM-4.1V -9B-Thinking</td><td colspan="2">Qwen2.5-VL InternVL3 7B 9B</td><td>Kimi-VL A3B-Thinking</td><td>MiMo-VL 7B-RL</td><td>Qwen2.5-VL 72B</td><td>GPT-4o 2024-11-20</td></tr><tr><td rowspan="5">General VQA</td><td>MMBench-V1.1-EN</td><td>85.8</td><td>82.7</td><td>81.7</td><td>71.6*</td><td>79.4*</td><td>88.0</td><td>84.4*</td></tr><tr><td>MMBench-V1.1-CN</td><td>84.7</td><td>80.1*</td><td>80.9*</td><td>70.2*</td><td>80.3*</td><td>86.7*</td><td>83.2*</td></tr><tr><td>MMStar</td><td>72.9</td><td>63.9</td><td>66.3</td><td>62.3*</td><td>69.3*</td><td>70.8</td><td>66.2*</td></tr><tr><td>BLINK</td><td>65.1</td><td>45.7*</td><td>58.6</td><td>53.5*</td><td>62.4</td><td>58.0*</td><td>66.4*</td></tr><tr><td>MUIRBENCH</td><td>74.7</td><td>53.2*</td><td>51.4</td><td>56.8*</td><td>64.8*</td><td>62.9*</td><td>69.7*</td></tr><tr><td rowspan="6">STEM</td><td>MMMU</td><td>68.0</td><td>58.6</td><td>57.7</td><td>61.7</td><td>66.7</td><td>70.2</td><td>69.1*</td></tr><tr><td>MMMU-Pro</td><td>57.1</td><td>38.3</td><td>42.1*</td><td>45.5*</td><td>53.1*</td><td>51.1</td><td>54.6*</td></tr><tr><td>VideoMMMU</td><td>61.0</td><td>47.4</td><td>-</td><td>-</td><td>43.3</td><td>60.2</td><td>61.2*</td></tr><tr><td>AI2D</td><td>87.9</td><td>83.8*</td><td>84.6</td><td>78.1*</td><td>83.5</td><td>87.6*</td><td>84.8*</td></tr><tr><td>MathVista</td><td>80.7</td><td>68.2</td><td>71.5</td><td>71.3</td><td>81.5</td><td>74.8</td><td>64.0*</td></tr><tr><td>WeMath</td><td>63.8</td><td>31.0*</td><td>33.8</td><td>36.0*</td><td>66.3</td><td>46.0*</td><td>44.4*</td></tr><tr><td rowspan="3">OCR &amp; Chart</td><td>ChartQAPro</td><td>59.5</td><td>38.0*</td><td>36.1*</td><td>44.1*</td><td>53.6*</td><td>46.7*</td><td>49.4*</td></tr><tr><td>ChartMuseum</td><td>48.8</td><td>27.2*</td><td>21.5*</td><td>29.3*</td><td>44.4*</td><td>39.6*</td><td>42.7*</td></tr><tr><td>OCRBench</td><td>84.2</td><td>84.5*</td><td>87.7</td><td>78.7*</td><td>86.6</td><td>85.1*</td><td>81.1*</td></tr><tr><td>Long Document</td><td>MMLongBench-Doc</td><td>42.4</td><td>25.1*</td><td>20.4*</td><td>35.1</td><td>24.9*</td><td>35.2*</td><td>41.0*</td></tr><tr><td>Visual Grounding</td><td>RefCOCO-avg (val)</td><td>87.4</td><td> $87.1^†$ </td><td>88.7</td><td>-</td><td>89.6</td><td> $90.2^†$ </td><td>-</td></tr><tr><td rowspan="5">GUI Agents</td><td>OSWorld</td><td>14.9</td><td>1.9*</td><td>1.4*</td><td>8.2</td><td>1.9*</td><td>8.8</td><td> $5.0^†$ </td></tr><tr><td>AndroidWorld</td><td>41.7</td><td> $27.6^{†1}$ </td><td>1.9*</td><td>-</td><td>10.8*</td><td>35.0</td><td> $34.5^{†2}$ </td></tr><tr><td>WebVoyageSom</td><td>69.0</td><td>14.1*</td><td>19.5*</td><td>1.8*</td><td>34.0*</td><td>40.4*</td><td>59.4*</td></tr><tr><td>Webquest-SingleQA</td><td>72.1</td><td>53.5*</td><td>39.3*</td><td>56.8*</td><td>64.0*</td><td>60.5*</td><td>57.0*</td></tr><tr><td>Webquest-MultiQA</td><td>54.7</td><td>39.4*</td><td>26.4*</td><td>42.0*</td><td>47.5*</td><td>52.1*</td><td>52.8</td></tr><tr><td rowspan="2">Coding</td><td>Design2Code</td><td>64.7</td><td>29.1*</td><td>15.3*</td><td>38.8*</td><td>28.7*</td><td>41.9*</td><td>35.3*</td></tr><tr><td>Flame-React-Eval</td><td>72.5</td><td>25.0*</td><td>11.3*</td><td>36.3*</td><td>8.8*</td><td>46.3*</td><td>75.0*</td></tr><tr><td rowspan="5">Video Understanding</td><td>VideoMME (w/o)</td><td>68.2</td><td>65.1</td><td>66.7</td><td>67.8</td><td>67.4</td><td>73.3</td><td>71.9</td></tr><tr><td>VideoMME (w/)</td><td>73.6</td><td>71.6</td><td>68.9</td><td>72.6</td><td>72.8*</td><td>79.1</td><td>77.2</td></tr><tr><td>MMVU</td><td>59.4</td><td>50.1</td><td>-</td><td>-</td><td>52.4*</td><td>62.9</td><td>61.4*</td></tr><tr><td>LVBench</td><td>45.1</td><td>45.3</td><td>-</td><td>-</td><td>37.1*</td><td>47.3</td><td>48.9</td></tr><tr><td>MotionBench</td><td>59.0</td><td>-</td><td>-</td><td>-</td><td>48.4*</td><td>-</td><td>58.0*</td></tr></table>

(表 3 的中文说明: 列依次为任务, 基准, GLM-4.1V-9B-Thinking, Qwen2.5-VL 7B, InternVL3 9B, Kimi-VL A3B-Thinking, MiMo-VL 7B-RL, Qwen2.5-VL 72B, GPT-4o 2024-11-20. md 的表头把 Qwen2.5-VL 7B 和 InternVL3 9B 合成了一个跨两列的格子, 数据行仍是九格. 任务分八类: 通用 VQA 5 行, STEM 6 行 (含 VideoMMMU), OCR 与图表 3 行, 长文档 1 行, 视觉定位 1 行, GUI 智能体 5 行, 编程 2 行, 视频理解 5 行, 共 28 行.)

Table 3: Comparison of GLM-4.1V-9B-Thinking with other models on diverse visual-language benchmarks. Results marked with \* correspond to our reproduced results, while those marked with † are reported by third-party sources. The best results among open-source models under 10B parameters are bolded.

表 3: GLM-4.1V-9B-Thinking 与其他模型在多种视觉语言基准上的对比. 标 \* 的是我们复现的结果, 标 † 的由第三方来源报告. 10B 参数以下开源模型中的最佳结果加粗.

1 Tested with a predefined set of marks (SoM).

1 在预定义的标记集 (SoM) 下测得.

2 Tested with the input of screenshot and accessibility tree.

2 以截图和无障碍树 (accessibility tree) 为输入测得.
