---
title: "Step3-VL-10B · 对照译稿"
category: "模型库"
tags: ["StepFun", "对照译稿"]
published: true
excerpt: "Step3-VL-10B 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 50 -->

arXiv:2601.09668v2 [cs.CV] 15 Jan 2026

StepFun

# STEP3-VL-10B Technical Report

**Multimodal Intelligence Team, StepFun**

**Homepage:** [**https://stepfun-ai.github.io/Step3-VL-10B**](https://stepfun-ai.github.io/Step3-VL-10B)

**ModelScope:** [**https://modelscope.cn/collections/stepfun-ai/Step3-VL-10B**](https://modelscope.cn/collections/stepfun-ai/Step3-VL-10B)**Huggingface:** [**https://huggingface.co/collections/stepfun-ai/step3-vl-10b**](https://huggingface.co/collections/stepfun-ai/step3-vl-10b)
作者: StepFun Multimodal Intelligence Team; 主页 / ModelScope / Hugging Face 集合见上列 URL.

## Abstract

We present **ST EP3-VL-10B**, a lightweight open-source foundation model designed to redefine the trade-off between compact efficiency and frontier-level multimodal intelligence. ST EP3- VL-10B is realized through two strategic shifts: first, a **unified, fully unfrozen pre-training strategy** on 1.2T multimodal tokens that integrates a language-aligned Perception Encoder with a Qwen3-8B decoder to establish intrinsic vision-language synergy; and second, a scaled post-training pipeline featuring **over 1k iterations of reinforcement learning**. Crucially, we implement Parallel Coordinated Reasoning (PaCoRe) to scale test-time compute, allocating resources to scalable perceptual reasoning that explores and synthesizes diverse visual hypotheses. Consequently, despite its compact 10B footprint, ST EP3-VL-10B rivals or surpasses models 10×–20× larger (e.g., GLM-4.6V-106B, Qwen3-VL-235B) and top-tier proprietary flagships like Gemini 2.5 Pro and Seed-1.5-VL. Delivering best-in-class performance, it records 92.2% on MM-Bench and 80.11% on MMMU, while excelling in complex reasoning with 94.43% on AIME2025 and 75.95% on MathVision. We release the full model suite to provide the community with a powerful, efficient baseline.

![Chart block](images/p01-figure-1-performance-comparison-of-st-ep3-vl-10b.png)

Figure 1 | Performance comparison of ST EP3-VL-10B against state-of-the-art multimodal foundation models. With PaCoRe (Parallel Coordinated Reasoning (Hu et al., 2026), STEP3-VL-10B scales test-time compute to bridge the perception and reasoning performance gap with 100B+ parameter models.
图 1 | STEP3-VL-10B 与当代多模态基础模型的表现对照. 借助 PaCoRe (Parallel Coordinated Reasoning; Hu et al., 2026), STEP3-VL-10B 加大 TestingTime, 以缩小与 100B+ 参数模型在感知与推理上的差距.

> **想:** 摘要写 MM-Bench 92.2%, 而表 1 的 MMBench EN/CN 是 92.05/91.55, 表 3 PaCoRe 又写 CN&EN 平均约 92.17%. 文首 92.2% 应对哪一列?
> 摘要未标明 SeRe/PaCoRe 或 EN/CN. 表 1 同档 SeRe 未出现精确 92.2; 表 3 正文写 PaCoRe 下 MMBench 「92.17% (average on CN & EN)」. 引用时应标模式与语种, 不要把文首 92.2 与表 1 的 92.05 当成同一格的两次测量.

<!-- page 2 of 50 -->

## Contents

- 1 Introduction 3
- 2 Pre-train 4
  - 2.1 Architecture 4
  - 2.2 Data Construction 4
  - 2.3 Training Recipe 6
- 3 Post-Train 7
  - 3.1 Supervised Finetuning 7
  - 3.2 Reinforcement Learning 7
    - 3.2.1 Optimization Algorithm 7
    - 3.2.2 Reward System 8
    - 3.2.3 Scaling Sequential Reasoning 9
    - 3.2.4 Further Scaling Parallel Coordinated Reasoning 10
- 4 Evaluations 10
  - 4.1 Evaluation Setup 10
  - 4.2 Multimodal Evaluation Results 12
  - 4.3 Text-Centric Evaluation Results 14
  - 4.4 Comparison with Larger Models 14
- 5 Discussion 16
  - 5.1 Ablations and Design Insights 16
  - 5.2 RL Dynamics, Performance, and Emergence 17
- 6 Conclusion and Future Work 19
- 7 Author List 33
- A More Results 34
- B Serialization Details for Synthesis in PaCoRe 38
- C Evaluation Details 38
  - C.1 Evaluation Details for Multimodal Benchmarks 38
  - C.2 Evaluation Details for Text-Centric Benchmarks 50
  - C.3 Evaluation Details for Ablations 50

<!-- page 3 of 50 -->

## 1. Introduction

The development of Multimodal Large Language Models (MLLMs) has largely been driven by a relentless pursuit of scale. While proprietary frontier models like Gemini-3-Pro (Team, 2025b) and GPT-5.2 (OpenAI, 2025a) have pushed the boundaries of **multimodal intelligence** through massive scaling, their heavy computational demands pose barriers to practical deployment in the real world. Conversely, lightweight models (under 10B parameters) have traditionally been characterized as “efficient but limited”, which struggle to advance sophisticated reasoning and perceptual capabilities within restricted parameter budgets.

多模态大语言模型 (MLLM) 的发展 largely 被对规模的无尽追逐驱动. Gemini-3-Pro, GPT-5.2 等专有前沿模型靠大规模缩放拓宽了多模态智能的边界, 但沉重的算力需求阻碍了真实世界部署. 反过来, 轻量模型 (10B 以下) 一直被贴上"高效但有限"的标签, 在资源受限下难以推进复杂推理与感知能力.

In this work, we introduce **STEP3-VL-10B**, a foundation model that redefine the trade-off between compact efficiency and frontier-level multimodal intelligence. Despite its modest 10B parameter footprint, ST EP3-VL-10B excels in **visual perception**, **complex reasoning**, and **human-centric alignment**. It consistently outperforms models under the 10B scale and rivals or even surpasses significantly larger open-weights models (10×–20× **its size**), such as GLM-4.6V (106B-A12B)(Team et al., 2025d) and Qwen3-VL-Thinking (235B-A22B)(Bai et al., 2025), as well as **established proprietary flagships** like Gemini-2.5-Pro(Team, 2025a) and Seed-1.5-VL (Guo et al., 2025a). Across representative benchmarks, STEP3-VL-10B achieves 75.95% on MathVision, 80.11% on MMMU, and a staggering 94.43% on AIME2025 (Fig. 1).

本文提出 **STEP3-VL-10B**, 一个在紧凑效率与前沿级多模态智能之间重新定义权衡的基座模型. 10B 参数量不大, 却在**视觉感知**, **复杂推理**与**以人为本的对齐**上表现出色: 稳定胜过同规模 10B 以下模型, 并追平甚至超过体量大 10 到 20 倍的开放权重模型, 如 GLM-4.6V (106B-A12B) 与 Qwen3-VL-Thinking (235B-A22B), 以及成熟的专有旗舰.

The success of STEP3-VL-10B is driven by two key strategic design in how we build efficient and powerful multimodal models:

STEP3-VL-10B 的成功来自构建高效多模态模型的两项关键战略设计:

• **Unified Pre-training on High-Quality Multimodal Corpus:** We implement a **singlestage, fully unfrozen training strategy** on a 1.2T token multimodal corpus, focusing on two foundational capabilities: **reasoning** (e.g., general knowledge and education-centric tasks) and **perception** (e.g., grounding, counting, Optical Character Recognition, and Graphical User Interface interactions). By jointly optimizing the Perception Encoder (Bolya et al., 2025) and the Qwen3-8B (Yang et al., 2025a) decoder, ST EP3-VL-10B establishes a **intrinsic vision-language synergy**.

• **高质量多模态语料的统一预训练:** 在 1.2T token 多模态语料上做单阶段全解冻训练, 聚焦两项基础能力: **推理** (如通识与教学类任务) 和**感知** (如 grounding, 计数, OCR, GUI 交互). 感知编码器与 Qwen3-8B 解码器联合优化, 建立内在视觉-语言协同.

• **Scaled Multimodal Reinforcement Learning (RL) and Parallel Reasoning:** We unlock frontier capabilities through a rigorous post-training pipeline, comprising two-stage supervised finetuning (SFT) and **over 1k iterations of RL** with both verifiable rewards (RLVR) and human feedback (RLHF). Beyond sequential reasoning, we adopt Parallel Coordinated Reasoning (PaCoRe) (Hu et al., 2026), which allocates test-time compute to **aggregate evidence from parallel visual exploration**. These designs enable the 10B model to solve complex perceptual and reasoning tasks that typically require substantially larger systems.

• **规模化多模态 RL 与并行推理:** 后训练流水线含两阶段 SFT 与超 1k 次迭代 RL (RLVR + RLHF 并用), 由此解锁前沿能力. 除顺序推理外, 采用 Parallel Coordinated Reasoning (PaCoRe), 把 TestingTime 算力用于聚合并行视觉探索的证据. 这些设计让 10B 模型解出通常要大得多的模型才能处理的复杂感知与推理任务.

To understand the drivers of this efficiency, we provide a in-depth analysis of the model’s internal mechanisms in Sec.5, with an emphasis on the learning dynamics unlocked by RL scaling. In particular, to counteract the length diminishment characteristic of perception tasks, we leverage PaCoRe to facilitate a form of multi-agent synthesis: parallel proposers generate diverse hypotheses, which are subsequently distilled through sequential cross-checking. This emergent synthesis effectively externalizes implicit visual processes, offering a promising direction for **scaling perceptual reasoning**.

为理解这种效率的驱动因素, 第 5 节深入分析模型内部机制, 重点看 RL scaling 解锁的学习动态. 特别地, 为抵消感知任务特有的长度缩减, 我们借 PaCoRe 实现一种多智能体合成: 并行提出者生成多样假设, 再经顺序交叉核查蒸馏. 这种涌现合成把隐式视觉过程外化, 为**放大感知推理**指明方向.

This trajectory not only sheds light on how models can progressively bridge intelligence and interaction with the physical world (Sec.6), but also motivates our commitment to closing critical technical gaps in the open ecosystem. By releasing the final model weights and detailed training documentation, ST EP3-VL-10B demonstrates that with a right perception- and reasoningcentric design, the gap between “compact” and “frontier” is no longer intractable.

这条路线不只阐明模型如何逐步桥接智能与物理世界交互 (第 6 节), 也促使我们致力于补齐开放生态的关键技术缺口. 开源最终权重与详细训练文档, STEP3-VL-10B 证明: 感知与推理中心的设计得当, "紧凑"与"前沿"之间的鸿沟并非不可逾越.

3

﻿<!-- page 4 of 50 -->

## 2. Pre-train

Our pre-training framework is designed to construct a capable vision foundation model that sets a high upper bound for subsequent post-training stages, prioritizing data quality and architectural synergy over unnecessary complexity.
预训练框架要先造出能力上界足够高的视觉基础模型, 供后训练接力; 优先级是数据质量与架构协同, 而不是无谓复杂度.

### 2.1. Architecture

STEP3-VL-10B integrates the 1.8B language-optimized Perception Encoder (Bolya et al., 2025), selected over the spatial-optimized variant for its pre-aligned linguistic features that ensure superior convergence. This visual backbone is coupled with Qwen3-8B (Yang et al., 2025a), utilized as the decoder for its robust text generation foundation and proven plasticity for multimodal adaptation. Similar to Step-3 (Team, 2025d) and DeepSeek-OCR (Wei et al., 2025a), these components are bridged by a projector performing 16× spatial downsampling via two consecutive stride-2 layers, effectively compressing visual tokens while retaining essential information. To capture fine-grained details efficiently, we adopt a multi-crop strategy (Caron et al., 2021) that decomposes images into a 728 × 728 global view and multiple 504 × 504 local crops. This design leverages batch-dimension parallelism to sidestep the complexity of variable length packing (Shah et al., 2024). Finally, we encode spatial structure by appending newline tokens to patch rows and utilize standard 1D RoPE (Su et al., 2024) for positional modeling, as advanced variants yielded no significant gains in our setup.
STEP3-VL-10B 接入 1.8B 的 language-optimized Perception Encoder (Bolya et al., 2025); 相对 spatial-optimized 变体, 看重其已与语言预对齐的特征, 收敛更好. 视觉骨干再接到 Qwen3-8B (Yang et al., 2025a) 作解码器, 取其文本生成底座与多模态适应可塑性. 与 Step-3, DeepSeek-OCR 类似, 中间用 projector 桥接: 连续两层 stride-2, 做 16× 空间下采样, 压缩视觉 token 并保留要点. 细粒度细节靠 multi-crop: 一张 728×728 全局视图加多块 504×504 局部裁剪, 用 batch 维并行避开变长 packing. 空间结构上, 在 patch 行末追加 newline token, 位置建模用标准 1D RoPE; 正文写高级位置变体在本设定下无显著收益.

> **问:** §2.1 的 Perception Encoder 写 1.8B, 表 4 消融又写 PE-lang 300M. 二者是同一检查点, 还是同族不同规模?
> 正文发布架构写 1.8B language-optimized PE; 表 4 标题与括号写明消融选用 300M 「specifically selected for ablation」, 与 DINOv3 300M 对齐参数量. 不能把表 4 的 300M 分数直接当成发布用 1.8B 编码器的绝对水平.

> **对一下:** §2.1 先写 projector 两层 stride-2 做 16× 空间下采样, 紧接着写 multi-crop (728×728 全局 + 多块 504×504 局部) 「leverages batch-dimension parallelism to sidestep ... variable length packing」. 全局/局部是拼成一条变长序列, 还是靠 batch 维并行进模型?
> 原句只写后者: 用 batch 维并行避开变长 packing 的复杂度. 没有写把多 crop 拼进同一序列维, 也没有给出 16× 之后每个 crop 的 token 数.16× 与 multi-crop 是同段并列的压缩与切图设计, 不能把二者口算成 「token 变成几分之一」.

> **想:** §2.1 末句 「appending newline tokens to patch rows and utilize standard 1D RoPE」, 又写 「advanced variants yielded no significant gains」. 行末 newline 是替换 1D RoPE, 还是与 1D RoPE 并用?
> 原文是并列: 用 newline 编码空间结构, **并且** 用标准 1D RoPE 做位置建模; 高级位置变体在本设定无显著收益. 不是 「只用 newline, 不用 RoPE」, 也不是在这里重写 RoPE 公式.

### 2.2. Data Construction

To equip STEP3-VL-10B with both fine-grained perception and complex reasoning capabilities, we incorporate a large-scale text corpus (Bakouch et al., 2025) and construct a comprehensive multimodal pre-training dataset spanning the following key domains.
为同时具备细粒度感知与复杂推理, 引入大规模文本语料, 并构建覆盖下列关键域的多模态预训练集.

**Knowledge.** We curate visual data with high knowledge density from multiple complementary channels, covering both structured interleaved data and diverse image–text pairs.
**Knowledge.** 从多条互补通道整理高知识密度视觉数据, 含结构化交错数据与多样图文对.

• **Interleaved Data.** We collect interleaved image–text data from **Common Crawl** (CommonCrawl) and our in-house crawler **StepCrawl**, which targets the domestic internet, and further augment this corpus with keyword-based search results. To suppress noise inherent in web-scale data, we discard webpages with excessive image download failures (> 90%), QR-code content, and images with extreme aspect ratios.
• **Interleaved Data.** 交错图文来自 Common Crawl 与面向国内网络的自研爬虫 StepCrawl, 再加关键词检索. 去噪规则: 丢弃图片下载失败率 > 90% 的网页, 二维码内容, 以及极端宽高比图片.

• **Image–Text Pairs.** We organize image–text pairs into four complementary categories: (1) **Open-source datasets**, including LAION (Schuhmann et al., 2022), COYO (Byeon et al., 2022), BLIP-CCS (Li et al., 2022), and Zero (Xie et al., 2023). To mitigate long-tail concept imbalance, we apply concept-balanced resampling via CLIP (Radford et al., 2021)- based clustering. (2) **Keyword-based retrieval**, where keywords mined from high-quality knowledge websites are used to query commercial search engines (e.g., Baidu and Bing), to gather targeted domain-specific data. (3) **Pairs extracted from interleaved data**, where for each image we extract candidate descriptions from surrounding text (above, below, and alt-text). Then we select the most suitable one using CLIP-based similarity to assess alignment and aesthetic scores to evaluate image quality. (4) **Mosaic augmentation**, in which four images are concatenated into a single input. This effectively extends the input resolution, increases visual content density within each sample, and encourages the model to learn spatial and positional reasoning across multiple regions.
• **Image–Text Pairs.** 四类: (1) 开源 LAION / COYO / BLIP-CCS / Zero, 用 CLIP 聚类做概念平衡重采样; (2) 从高质量知识站挖关键词, 查百度 / Bing 等补域内数据; (3) 从交错页抽候选描述 (上文 / 下文 / alt-text), 再按 CLIP 相似度与美学分择优; (4) Mosaic: 四图拼成单输入, 抬有效分辨率与单样本视觉密度, 并迫使跨区域空间 / 位置推理.

<!-- page 5 of 50 -->

**Education.** We curate a dataset of approximately 15M samples spanning K-12 education, higher education, and adult learning. The K-12 subset covers mathematics, physics, chemistry, and humanities, and includes specialized data such as chemical formulas and structure diagrams sourced from open datasets and synthetically generated using CoSyn (Yang et al., 2025c), as well as geometry (including analytic geometry) problems constructed from a mixture of synthetic data and real exam images with annotated captions. Beyond this, the dataset extends to **universitylevel** domains including STEM, medicine, arts, and finance, as well as **adult education** scenarios such as driving license exams, CPA, and legal examinations. Exam questions are collected from a combination of licensed exam materials and open-source problem sets (Ben Abacha et al., 2019; He et al., 2020; Sujet AI, 2024), while supporting knowledge content is sourced from textbooks, workbooks, and high-quality educational websites.
**Education.** 约 15M 样本, 覆盖 K-12, 高等教育与成人教育. K-12 含数理化与人文; 化学式 / 结构图来自开源与 CoSyn 合成; 几何 (含解析几何) 混用合成与真实试卷图加标注说明. 大学侧含 STEM, 医学, 艺术, 金融; 成人侧含驾照, CPA, 法考. 试题来自授权材料与开源题集; 配套知识来自教材, 练习册与高质量教育网站.

**Optical Character Recognition (OCR).** We curate a comprehensive OCR corpus spanning image-level and document-level text recognition, and visual-to-code reconstruction.
**OCR.** 覆盖图像级 / 文档级识别, 以及视觉到代码重建.

• **Image to Text.** We curate a dataset comprising 10M real-world images and 30M synthetic samples covering diverse fonts, layouts, and text orientations. Real-world data are collected from open-source datasets (Shi et al., 2017; Yao et al., 2012) and annotated using PaddleOCR (Cui et al., 2025a), while synthetic samples are generated using SynthDog (Kim et al., 2022).
• **Image to Text.** 10M 真实图 + 30M 合成样本; 真实数据开源收集并用 PaddleOCR 标注, 合成用 SynthDog.

• **Image to Code.** We organize this dataset by target code form, spanning markup-based and programmatic graphics. (1) **Markup-based Code.** For Markdown, LATEX, and Matplotlib, we combine over 10M samples from open-source datasets (Chen et al., 2024a; Masry et al., 2023; Xia et al., 2023) with an automated data generation pipeline that produces more than 15M synthetic infographics. Instead of fully delegating generation to LLMs (Yang et al., 2025c), we enforce fine-grained rendering rules across multiple render tools. (2) **Programmatic Graphics Code.** For languages such as TikZ and Graphviz, we curate approximately 5M reconstruction tasks that require translating visual inputs into executable code, spanning diverse visual inputs including natural images, human-created tables, and geometries.
• **Image to Code.** (1) Markup: Markdown / LaTeX / Matplotlib, 开源 10M+ 加自动管线合成 infographic 15M+; 不以 LLM 全权生成, 而在多渲染工具上施加细粒度渲染规则. (2) 程序化图形: TikZ / Graphviz 等约 5M 重建任务, 输入含自然图, 人工表与几何.

• **Document to Text.** This dataset comprises approximately 80M full-page documents. Concretely, we apply PaddleOCR or MinerU 2.0 (Wang et al., 2024a) to annotate collected pages from books and academic papers.
• **Document to Text.** 约 80M 整页文档; 用 PaddleOCR 或 MinerU 2.0 标注书籍与论文页.

• **Document to Code.** We curate data spanning three primary markup languages including HTML, Markdown and latex.**HTML** data focus on table-centric content and are sourced from rendered web page code, Markdown conversions.**Markdown** data cover tables and lightweight documents, collected from rendered GitHub README files, HTML conversions.**Latex** data are extracted at scale from arXiv corpora, comprising approximately 4M tables and 100M formulas. During rendering, we explicitly handle elements such as references and hyperlinks to prevent mismatches between visual and textual content. In addition, we incorporate open-source datasets (Chai et al., 2025; Laurençon et al., 2024; Liu et al., 2024a; Yuan et al., 2022) to further enrich this subset.
• **Document to Code.** HTML / Markdown / LaTeX 三主路径. HTML 偏表格, 来自渲染网页与 Markdown 转换; Markdown 覆盖表与轻文档, 来自 GitHub README 渲染与 HTML 转换; LaTeX 大规模抽自 arXiv, 约 4M 表与 100M 公式. 渲染时显式处理引用与超链接, 避免视文错位; 并并入若干开源文档集.

**Grounding & Counting.** We collect approximately 400M samples to support fine-grained perceptual understanding.**Grounding data** include both bounding-box-based and point-based annotations sourced from open detection datasets such as OpenImages (Kuznetsova et al., 2020), COCO (Lin et al., 2015), Merlin (Yu et al., 2024, 2025a), and PixMo (Deitke et al., 2024), as well as in-house text paragraph detection tasks.**Counting data** are drawn from open-source counting (Kaggle; SakiRinn) and are further constructed by converting high-quality object detection annotations into counting formulations.
**Grounding & Counting.** 约 400M. Grounding 含框与点, 来自 OpenImages / COCO / Merlin / PixMo 及内部段落检测; Counting 来自开源计数集, 并把高质量检测标注改写成计数题.

<!-- page 6 of 50 -->

**Visual Question Answering (VQA).** This subset comprises approximately 10M samples targeting holistic image content understanding. It includes curated open-source VQA datasets (Liu et al., 2025b; Zellers et al., 2019), as well as high-quality question–answer pairs automatically generated from image caption data. In addition, we construct a OCR VQA subset with around 20M samples, combining open-source data (aallail; Poznanski et al., 2025; Wei et al., 2024) with QA pairs generated from other OCR-related task.
**VQA.** 约 10M, 面向整图理解; 含开源 VQA 与由 caption 自动生成的问答. 另建 OCR VQA 约 20M, 混合开源与由其他 OCR 任务生成的 QA.

**Graphical User Interface (GUI).** We construct a large-scale GUI dataset as in Step-GUI (Yan et al., 2025) comprising approximately 23M samples to endow the model with practical and executable UI understanding and interaction capabilities. The dataset covers both mobile platforms, including Android and iOS, and desktop environments spanning Windows, Linux, and macOS, with data collected from over 200 applications. Notably, accurate grounding annotations are generated jointly with trajectory data, ensuring consistent supervision between action execution and perception.
**GUI.** 按 Step-GUI 路线约 23M, 覆盖 Android / iOS 与 Windows / Linux / macOS, 来自 200+ 应用. Grounding 标注与轨迹数据联合生成, 保证动作执行与感知监督一致.

• **Caption.** This subset provides 700K detailed captions for UI interfaces, conveying explicit knowledge about page layouts and functional regions to support structural understanding of interfaces.
• **Caption.** 700K 界面详注, 交代版式与功能区.

• **Knowledge VQA.** We include over 1M question–answer pairs that reinforce precise localization and functional understanding of UI elements.
• **Knowledge VQA.** 1M+ 问答, 强化定位与控件功能理解.

• **Trajectory Modeling.** To model realistic sequential human–computer interactions, we curate more than 2M trajectory samples defined over a granular action space comprising 12 atomic actions, such as CLICK, SLIDE, and TYPE. These trajectories strengthen action output formatting, state summarization, and decision-making capabilities, and cover a wide range of tasks including operation execution, information retrieval, and information summarization.
• **Trajectory Modeling.** 2M+ 轨迹, 动作空间含 12 个原子动作 (如 CLICK, SLIDE, TYPE), 覆盖执行, 检索与摘要.

• **Grounding.** The dataset further includes over 19M grounding samples with both pointbased and bounding-box-based grounding across diverse interface layouts and resolutions.
• **Grounding.** 19M+ 点 / 框 grounding, 覆盖多样版式与分辨率.

• **OCR.** For web-based interfaces targeting Browser-use-GUI, we crawl approximately 30M web pages and extract textual content together with precise element coordinates, supporting fine-grained layout-aware understanding.
• **OCR.** 面向 Browser-use-GUI 爬约 30M 网页, 抽文本与元素坐标.

### 2.3. Training Recipe

We adopt a single-stage, fully unfrozen training strategy optimized with AdamW (Loshchilov and Hutter, 2017) $( \beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5 ,   \varepsilon = 1 0 ^ { - 8 } )$ , and weight decay = 0.01), training the model on a total of 1.2T tokens over 370K iterations with a global batch size of 8,192 and a sequence length of 4,096.
单阶段, 全解冻; AdamW (`β1=0.9`, `β2=0.95`, `ε=1e-8`, weight decay 0.01); 共 1.2T token, 370K 迭代, 全局 batch 8,192, 序列长 4,096.

To balance training scale and data quality, we employ a two-phase learning rate schedule. During the first phase, covering the initial 900B tokens, the learning rate is decayed from $5   \times   1 0 ^ { - 5 }$ to $1 \times 1 0 ^ { - 5 }$ to emphasize broad representation learning. In the second phase, spanning the remaining 300B tokens, we transition to a higher-quality data mixture and further anneal the learning rate from $1 \times 1 0 ^ { - 5 } \; \mathrm { t o } \; 6 \times 1 0 ^ { - 6 }$ , acting as a cool-down phase to consolidate fine-grained perceptual (e.g., OCR and grounding) and reasoning capabilities .
两阶段学习率: 前 900B token 从 `5e-5` 降到 `1e-5`, 偏广表征; 后 300B 换更高质混合, 再从 `1e-5` 退火到 `6e-6`, 作降温期以巩固 OCR / grounding 与推理.

> **核对:** 「单阶段, 全解冻」 与后文 RL 「updating only the decoder while keeping the encoder frozen」 是否矛盾?
> 不矛盾. §2.3 的全解冻仅约束预训练; §3.2.1 写明整个 RL 阶段只更新 decoder, 冻 encoder. 两段课表的可训练模块集合不同, 不能合成一句 「发布模型全程全解冻」.

> **拆开:** §2.3 两阶段学习率: 前 900B token 从 `5e-5` 降到 `1e-5`, 后 300B 从 `1e-5` 退火到 `6e-6` 并称 cool-down. 后段只降学习率, 还是连数据混合一起换?
> 原句写第二阶段 「transition to a higher-quality data mixture and further anneal the learning rate」, 降温期同时换更高质混合并巩固 OCR / grounding / 推理. 不是只改 LR, 数据配比不变.

<!-- page 7 of 50 -->

## 3. Post-Train

In the post-training stage, we adopt a two-stage Supervised Finetuning (SFT) strategy followed by Reinforcement Learning (RL). For the RL phase, we employ Proximal Policy Optimization (PPO) (Schulman et al., 2017) with Generalized Advantage Estimation (GAE) (Schulman et al., 2015) as the core optimization algorithm, coupled with a meticulously designed reward system. Crucially, we scale inference compute by progressing from sequential reasoning to parallel coordinated reasoning, aiming to fully unlock $\mathrm{STEP}\bar{3}-\mathrm{VL}-10\bar{\mathrm{B}}'\mathrm{s}$ perception and reasoning capabilities.
后训练: 两阶段 SFT, 再接 RL. RL 核心是 PPO + GAE, 配精心设计的奖励系统. 关键是把推理算力从串行推理推进到并行协调推理, 以尽量释放 STEP3-VL-10B 的感知与推理能力.

### 3.1. Supervised Finetuning

**Data Construction.** Our SFT strategy focuses on multi-modal, high-quality, reasoning-oriented data. We initially collected millions of prompts from the open-source community (Guha et al., 2025; LI et al., 2024), spanning diverse domains such as mathematics, coding, science, and logical reasoning. We also incorporated open-source datasets (An et al., 2025; Tong et al., 2024a; Wiedmann et al., 2025) for visual perception and recognition, including grounding, OCR, and complex document/chart understanding, to ensure the model can precisely perceive and reason over visual elements. Leveraging these prompts, we distilled high-quality responses from internal frontier model. This foundational dataset underwent a rigorous “two-pipe” filtration process: first, applying predefined rules to eliminate degenerate patterns (e.g., infinite repetitions); and second, performing comprehensive benchmark decontamination via exact matching and 𝑁-gram matching $( N = 6 4 )$
**Data Construction.** SFT 聚焦高质量, 推理导向多模态数据. 先从开源社区收集数百万 prompt (数学, 代码, 科学, 逻辑等), 再并入 grounding / OCR / 复杂文档图表等感知集. 响应用内部前沿模型蒸馏. 两管过滤: 规则去退化模式 (如无限重复); exact + **N=64** gram 去污染.

**Two-Stage SFT Strategy.** We implemented a phased training approach to progressively align the model’s reasoning capabilities across modalities. The training was conducted with a global batch size of 32 and an extended sequence length of 128k to support long-context understanding.
**Two-Stage SFT Strategy.** 分阶段对齐跨模态推理. 全局 batch 32, 序列长 128k.

• **Stage 1: Text-Dominant Reasoning.** The data mixture was set at a 9 : 1 ratio of text to multimodal samples, establishing a strong logical and linguistic foundation.
• **Stage 1: Text-Dominant Reasoning.** 文本:多模态 = 9:1, 先建立逻辑与语言底座.

• **Stage 2: Multimodal Integration.** We shifted the composition to a 1 : 1 ratio, effectively balancing textual reasoning with visual intelligence to enhance the model’s performance on interleaved multimodal tasks.
• **Stage 2: Multimodal Integration.** 改为 1:1, 平衡文本推理与视觉智能.

> **问:** §3.1 Stage 1 文本:多模态 = 9:1, Stage 2 改为 1:1; 同节又写 Stage 1 约 190B token, Stage 2 约 36B. 第二阶段是否按 token 量也变成与第一阶段等量的多模态?
> 不是. 比例 1:1 只约束 Stage 2 混合内的文本/多模态份额; 绝对 token 仍是 36B 对 190B. 不能把 「1:1」 读成两阶段总量对半, 或读成多模态总暴露量已经追上 Stage 1.

**Training Recipe.** We employed a cosine learning rate scheduler with a 200-step warmup phase, where the learning rate peaks at $1 \times 1 0 ^ { - 4 }$ and anneals to a final value of $1 \times 1 0 ^ { - 5 }$ . To optimize the learning process across diverse data sources, we implemented domain-specific sampling weights in the dataloader, which translate to varying epoch counts for different domains. Throughout the entire two-stage process, the model was trained on a total of approximately 190B tokens during stage 1 and 36B during stage 2.
**Training Recipe.** 余弦学习率, 200 step warmup, 峰值 `1e-4`, 终值 `1e-5`. dataloader 按域设采样权重, 等价于不同域不同 epoch 数. 阶段 1 约 190B token, 阶段 2 约 36B token.

### 3.2. Reinforcement Learning

#### 3.2.1. Optimization Algorithm

We adopt PPO combined with GAE as our optimization algorithm for reinforcement learning, following Open-Reasoner-Zero (Hu et al., 2025) and Open-Vision-Reasoner (Wei et al., 2025c).
RL 优化采用 PPO + GAE, 跟随 Open-Reasoner-Zero 与 Open-Vision-Reasoner.

Formally, given a multimodal input tuple consisting of an image 𝐼 and a textual prompt 𝑞, the policy network $\pi _ { \theta }$ generates a response trajectory $\tau = ( s _ { 0 } , a _ { 0 } , \cdots , s _ { T - 1 } , a _ { T - 1 } )$ of length 𝑇. The state $s _ { t }$ encapsulates the input context $( I , q )$ and the sequence of tokens generated prior to step 𝑡,
形式化: 多模态输入为图像 I 与文本 prompt q; 策略 π_θ 生成长为 T 的轨迹 τ. 状态 s_t 含上下文 (I, q) 与步 t 之前已生成 token,

<!-- page 8 of 50 -->

while $a _ { t }$ denotes the action (token) sampled at step 𝑡.
而 a_t 为步 t 采样的动作 (token).

To effectively balance the bias-variance trade-off in policy gradient estimation, we utilize GAE for advantage computation. The advantage estimator $\hat { A } _ { t }$ for a state-action pair $( s _ { t } , a _ { t } )$ is defined as:
为平衡策略梯度估计的偏差-方差, 用 GAE 算 advantage. 状态-动作对 (s_t, a_t) 的估计为:

$$
\hat {A} _ {t} = \sum_ {l = 0} ^ {T - t - 1} (\gamma \lambda) ^ {l} \delta_ {t + l}, \quad \mathrm{with} \quad \delta_ {t ^ {\prime}} = r _ {t ^ {\prime}} + \gamma V _ {\varphi} (s _ {t ^ {\prime} + 1}) - V _ {\varphi} (s _ {t ^ {\prime}}),\tag{1}
$$

where $r _ { t ^ { \prime } }$ is the reward at step $t ^ { \prime } ,$ , $V _ { \varphi }$ represents the value function parameterized by $\varphi ,$ and $\gamma , \lambda \in [ 0 , 1 ]$ are the discount factor and GAE smoothing parameter, respectively.
其中 r 为步奖励, V_φ 为价值函数, γ, λ 为折扣与 GAE 平滑系数.

The policy parameters $\theta$ are updated by maximizing the clipped surrogate objective, which penalizes large policy deviations to maintain training stability:
策略参数 θ 最大化 clipped surrogate, 以惩罚大幅偏离并稳住训练:

$$
\mathcal {J} _ {\mathrm{PPO}} (\theta) = \hat {\mathbb {E}} _ {t} \left[ \min \left(\rho_ {t} (\theta) \hat {A} _ {t}, \mathrm{clip} \left(\rho_ {t} (\theta), 1 - \varepsilon , 1 + \varepsilon\right) \hat {A} _ {t}\right) \right],\tag{2}
$$

where $\begin{array} { r } { \rho _ { t } ( \theta ) = \frac { \pi _ { \theta } \left( a _ { t } \left| s _ { t } \right. \right) } { \pi _ { \mathrm { o l d } } \left( a _ { t } \left| s _ { t } \right. \right) } } \end{array}$ is the probability ratio, and 𝜀 is the clipping hyperparameter.
ρ_t(θ) 为概率比, ε 为 clipping 超参.

Concurrently, the value function is updated to minimize the mean squared error between the estimated value and a target value $V _ { t } ^ { \mathrm { t a r g e t } }$ , typically the estimated discounted return $G _ { t } =$ $\hat { A } _ { t } ^ { \mathrm { G A E } \left( \gamma , \lambda \right) } + V _ { \varphi } ( s _ { t } )$
同时, 价值函数最小化估计值与目标值 V_t^target 的均方误差; 目标常取 G_t = Â_t^GAE + V_φ(s_t).

$$
\mathcal {J} _ {\mathrm{value}} (\varphi) = \frac {1}{2} \mathbb {E} _ {\tau \sim \pi_ {\theta_ {\mathrm{old}}}} \left[ \sum_ {t = 0} ^ {T - 1} \left(V _ {\varphi} (s _ {t}) - V _ {t} ^ {\mathrm{target}}\right) ^ {2} \right],\tag{3}
$$

Concretely, we adopt a variant of PPO algorithm with GAE $( \gamma   =   1 , \lambda   =   1 )$ for off-policy setting, omitting standard importance sampling. Each iteration splits samples into four minibatches. The actor and critic learning rates are set to $2 \times 1 0 ^ { - 6 }$ and $5 \times 1 0 ^ { - 6 } ,$ , respectively. To mitigate training–inference inconsistency, we apply the truncated importance sampling ratio with threshold 𝐶 = 8 following (Yao et al., 2025). The entire RL phase runs for 1,400 training iterations, updating only the decoder while keeping the encoder frozen.
具体: 采用 GAE (γ=1, λ=1) 的 PPO 变体用于 off-policy, 并省略标准 importance sampling. 每迭代样本切 4 个 minibatch. actor / critic 学习率 `2e-6` / `5e-6`. 为缓解训推不一致, 用阈值阈 C=8 的 truncated IS (Yao et al., 2025). 整个 RL 共 1,400 迭代, **只更新 decoder, 冻 encoder**.

> **回看:** §3.2.1 式 (1) 给出 GAE, 下文又写 GAE `(γ=1, λ=1)` 用于 off-policy 「omitting standard importance sampling」, 同时仍用 truncated IS 阈 `C=8`. 本文优势估计到底还依不依赖概率比?
> 优势估计本身走式 (1) 的 GAE (本文取 γ=λ=1); 「omitting standard importance sampling」 修饰的是该 PPO 变体的 off-policy 设定. 同段另写 truncated IS (`C=8`) 专门缓解训推不一致. 不能把 「省略标准 IS」 读成全程没有任何 IS, 也不能把本文写成改用 GRPO, 丢掉了 GAE 式 (1).

> **拆开:** 摘要写 「over 1k iterations of reinforcement learning」, §3.2.1 写整段 RL 1,400 迭代.1,400 如何拆到 RLVR / RLHF / PaCoRe?
> §3.2.3–3.2.4 写明: RLVR 600 + RLHF 300 + PaCoRe 500 = 1,400. 「over 1k」 是摘要口径; 精确拆分以这三节为准.

#### 3.2.2. Reward System

To support scalable training across heterogeneous modalities and task types, we design a bifurcated reward framework that explicitly distinguishes between verifiable tasks, where objective correctness can be reliably assessed, and non-verifiable tasks, where alignment must be guided by preference modeling and constraints.
为覆盖异构模态与任务, 奖励框架二分: 可验证任务用客观正确性; 不可验证任务用偏好建模与约束.

**Verifiable Rewards: Precision and Consistency.** For tasks with accessible ground truth, our reward design prioritizes strict correctness and reasoning consistency. We implement a multi-faceted verification pipeline that combines perception-based, and model-assisted signals.
**Verifiable Rewards.** 有 ground truth 时优先严格正确性与推理一致性; 管线混合感知信号与模型辅助信号.

**Perception Rewards.** For perception tasks such as pointing and grounding, following Perception-R1 (Yu et al., 2025b), we align the model’s geometric outputs with deterministic ground truths using metrics like Intersection over Union (IoU) or Euclidean distance. Crucially, we implement strict, distance-decay reward shaping to guarantee a distinct and unambiguous optimization landscape and robust RL convergence.
**Perception Rewards.** 指向 / grounding 等任务跟 Perception-R1, 用 IoU 或欧氏距离对齐几何输出与确定性真值; 并施加强距离衰减的 reward shaping, 保证优化地貌清晰, RL 收敛稳健.

• **Model-Based Verification.** For general visual tasks, we deploy **GPT-OSS-120B** (OpenAI, 2025b) as the answer verifier. Compared to simple string matching or mathverify-style heuristics, this model-based verification mechanism is substantially more robust to noisy or imperfect ground truth and significantly improves training stability. In particular, it pro vides **parse-invariant** evaluation that is resilient to formatting variations (e.g., idiosyncratic
• **Model-Based Verification.** 一般视觉任务用 **GPT-OSS-120B** 作答案校验器. 相对字符串匹配或 mathverify 启发式, 对噪声 / 不完美真值更稳, 并改善训练稳定性. 尤其提供 **parse-invariant** 评测, 抗格式抖动 (例如特异

<!-- page 9 of 50 -->

LATEX), recognizes **semantic equivalence** among mathematically identical expressions or reordered derivation steps, and enforces **process consistency** by penalizing false positives, cases where the model arrives at a correct final answer through flawed or unsupported reasoning. Together, these properties yield more reliable reward signals for supervising complex reasoning behaviors.
LaTeX), 识别数学等价或步骤重排的 **semantic equivalence**, 并以 **process consistency** 惩罚 「终答对但推理不成立」 的假阳性. 合起来给复杂推理更可靠的奖励信号.

> **停一下:** §3.2.2 Model-Based Verification 写 process consistency 惩罚 false positives. 这里的假阳性是指答案格式不对, 还是终答对但推理不成立?
> 原句写明: 「cases where the model arrives at a correct final answer through flawed or unsupported reasoning」. 罚的是终答正确, 过程却有缺陷或无支持的情形, 不是单纯格式解析失败 (格式侧另写 parse-invariant).

**Non-Verifiable Rewards: Preference and Constraints.** For open-ended generation where ground truth is absent, we rely on learned preference models and heuristic constraints to guide human-centric alignment.
**Non-Verifiable Rewards.** 无 ground truth 的开放生成, 靠学得的偏好模型与启发式约束做人向对齐.

• **Generative Reward Modeling (GenRM).** We adopt a pairwise preference framework where the GenRM evaluates rollouts against responses generated by a more capable teacher model. Moving beyond direct outcome continuous rewarding, our GenRM incorporates an explicit reasoning judgment before deriving a fine-grained scalar score to discern subtle quality differences between plausible responses.
• **GenRM.** pairwise 偏好: GenRM 把 rollout 与更强教师回答对照; 在给细粒度标量分之前先做显式推理判断, 以区分多个都说得通的回答.

• **Behavioral Regularization.** To mitigate “reward hacking” and enforce safety and reliability constraints during optimization, we incorporate a set of model-based penalty terms as behavioral regularization. Specifically, we impose **language consistency** penalties to discourage code-switching and question–answer language mismatch; apply strict **citation verification** that zeros the reward when fabricated references or links are detected, directly targeting hallucinations at the source; and introduce **epistemic calibration** penalties to suppress unjustified certainty or overconfident claims, encouraging the model to appropriately express uncertainty in ambiguous or underspecified settings. Together, these constraints act as guardrails that stabilize preference optimization and align model behavior with safety and trustworthiness objectives.
• **Behavioral Regularization.** 防 reward hacking 并施加安全 / 可靠约束: **language consistency** 惩罚语码混用与问答语言不一致; **citation verification** 在检测到伪造引用 / 链接时把奖励置零; **epistemic calibration** 压制无根据的确信, 鼓励在含糊设定下表达不确定. 合起来作偏好优化护栏.

> **再看:** §3.2.2 citation verification 写 「zeros the reward when fabricated references or links are detected」. 这是扣一部分分, 还是整条 rollout 奖励直接归零?
> 原文是 zeros the reward, 中文译稿也写 「把奖励置零」. 针对伪造引用 / 链接, 把幻觉打在源头; 不是写成按比例打折的 soft penalty.

#### 3.2.3. Scaling Sequential Reasoning

We aim to scale the model’s reasoning capability by incentivizing extended sequential thinking processes, effectively converting test-time compute into performance gains. Concretely, we structure our sequential reasoning training to first establish robust logical foundations on verifiable tasks before aligning with subjective human preferences.
目标是通过激励更长的串行思考过程, 把 TestingTime 换成表现增益. 具体先在可验证任务上建立逻辑底座, 再对齐主观人类偏好.

**Reinforcement Learning with Verifiable Rewards (RLVR).** We conduct training on a diverse set of verifiable multimodal tasks, drawing from large-scale open-source datasets such as Open-Vision-Reasoner (Wei et al., 2025c), which cover mathematics, geometry, physics, scientific reasoning, perception, recognition, chart-based reasoning, and puzzles, together with visual grounding tasks from Perception-R1 (Yu et al., 2025b) and internal K–12 educational resources.
**RLVR.** 在多样可验证多模态任务上训练: Open-Vision-Reasoner (数学, 几何, 物理, 科学推理, 感知, 识别, 图表推理, 谜题等), Perception-R1 的 grounding, 以及内部 K-12 资源.

To ensure high-quality supervision, we design a multi-dimensional filtration pipeline along three axes: **(1) Checkability** is enforced by employing GPT-OSS-120B to perform four independent verification passes per prompt, retaining only all-agree samples.**(2) Visual relevance** is ensured by using an early version of ST EP3-VL-10B to evaluate the semantic correlation and mutual contribution between images and questions, filtering out redundant or misaligned multimodal pairs.(3) Finally, to control **difficulty**, we perform 24 rollouts per prompt to identify some-accept samples, namely cases that are neither trivially solvable nor consistently failed. Each filtration stage plays a non-trivial role in ensuring long-term training stability and enabling sustained performance gains. The RLVR stage is executed for 600 iterations with a maximum sequence length of 24k. For each iteration, we sample 512 prompts with 16 rollouts per prompt, optimizing via the aforementioned verifiable reward system.
高质量监督靠三轴过滤: (1) Checkability: GPT-OSS-120B 对每 prompt 做四次独立校验, 只留全票通过; (2) Visual relevance: 用早期 STEP3-VL-10B 评图问语义相关与互相贡献, 滤冗余 / 错配; (3) difficulty: 每 prompt 24 rollout, 只留 some-accept (既非必过也非必挂). RLVR 600 迭代, 最大长 24k; 每迭代 512 prompt × 16 rollout.

<!-- page 10 of 50 -->

**Reinforcement Learning from Human Feedback (RLHF).** Building on the reasoning-focused checkpoint from RLVR, we further align the model with human preferences using open-ended tasks. We curate prompts from opensourced arena datasets (Chiang et al., 2024; Chou et al., 2024; Tang et al., 2025) and internal instruction pools, explicitly filtering for uncheckable queries that lack deterministic ground-truth. For these prompts, we leverage our strongest internal models to generate high-quality reference responses as anchors for preference learning. This stage proceeds for 300 iterations using a maximum sequence length of 32k. We maintain a throughput of 512 prompts per iteration with 8 rollouts per prompt, optimizing the model against an unverifiable reward system to refine its conversational and alignment capabilities while preserving its underlying reasoning strength.
**RLHF.** 在 RLVR 推理检查点上, 用开放任务对齐人类偏好. prompt 来自开源 arena 与内部指令池, 显式只留无确定性真值的 uncheckable 查询; 用最强内部模型生成高质量参考回答作偏好锚.300 迭代, 最大长 32k, 每迭代 512 prompt × 8 rollout, 走不可验证奖励,  refining 对话 / 对齐并保住推理强度.

#### 3.2.4. Further Scaling Parallel Coordinated Reasoning

To further scale test-time compute beyond the limits of sequential generation, we adopt a **parallel coordinated reasoning** paradigm following PaCoRe (Hu et al., 2026). This approach allocates compute to explore diverse perceptual hypotheses in parallel and synthesizes them into a unified conclusion.
为在串行生成上限之外继续加大 TestingTime, 采用 PaCoRe 的 **parallel coordinated reasoning**: 并行探索多样感知假说, 再综合成统一结论.

To construct the training data for parallel reasoning, we extend the difficulty filtration (Axis 3) from the RLVR stage. We repurpose the 24 rollouts from the difficulty tagging phase as a message cache pool. Starting with the identified some-accept prompts, we apply a secondary Synthesis Filtration to ensure **coordinated solvability**: (1) We simulate the parallel reasoning process by sampling 16–24 messages from the pool and feeding them back into the model as a synthesis context" to regenerate responses. (2) We strictly retain instances that remain categorized as some-accept under this coordinated setting. Crucially, this prevents task trivialization to maintain effective reward signals, while compelling the model to perform multi-perspective self-verification and cross-checking.
并行推理训练数据: 延用 RLVR 难度过滤 (轴 3), 把难度标注阶段的 24 rollout 当作 message 缓存池. 从 some-accept prompt 出发做二次 Synthesis Filtration 以保证 **coordinated solvability**: (1) 从池中采 16–24 条 message 作为综合上下文, 模拟并行推理再生成; (2) 只保留在协调设定下仍属 some-accept 的实例. 这样既防任务被综合变简单而奖励失效, 又迫使模型做多视角自核与交叉核对.

The model is optimized using PPO in a strict on-policy setting for 500 iterations. We utilize a maximum sequence length of 64k to accommodate the aggregated context. Each iteration samples 64 prompts with 16 rollouts per instance, stabilizing the optimization of coordinated behaviors against the verifiable reward system.
严格 on-policy PPO, 500 迭代; 最大长 64k 以容纳聚合上下文; 每迭代 64 prompt × 16 rollout, 在可验证奖励上稳住协调行为.

## 4. Evaluations

To rigorously validate the capabilities of STEP3-VL-10B, we conduct extensive evaluations across a broad spectrum of multimodal and text-centric benchmarks. Our results position STEP3- VL-10B as the **most powerful open-source model** in the 10B parameter class, demonstrating performance that not only significantly outperforms **7–10B open-source models** but also rivals frontier open-source systems (10×–20× larger) and proprietary flagships in reasoning and perception domains.
为严格验证能力, 在广谱多模态与文本中心基准上评测. 结果把 STEP3-VL-10B 放在 10B 开源最强一档: 显著强于 7–10B 开源同列, 并在推理 / 感知域与更大开源 (10×–20×) 及闭源旗舰对打.

### 4.1. Evaluation Setup

**Benchmark Protocols.** We evaluate STEP3-VL-10B on a comprehensive suite of over 60 benchmarks. To ensure a holistic assessment consistent with our reported results, we categorize these benchmarks into specific capability domains across multimodal and text-centric modalities.
**Benchmark Protocols.** 覆盖 60+ 基准, 按多模态与文本中心能力域归类, 以保证与所报结果一致的整体评估.

**I. Multimodal Benchmarks.** We assess vision-language capabilities across nine distinct domains:
**I. Multimodal Benchmarks.** 视觉-语言能力分九域:

<!-- page 11 of 50 -->

• **STEM / Multimodal Reasoning:** We employ MMMU (Standard/Pro) (Yue et al., 2024), MathVista (Lu et al., 2023), MathVision (Wang et al., 2024b), MathVerse (Zhang et al., 2024), DynaMath (Zou et al., 2024), We-Math (Qiao et al., 2024), and PhyX (Shen et al., 2025) for scientific and mathematical reasoning. Logical and puzzle-solving abilities are tested via LogicVista (Xiao et al., 2024), ZeroBench (Roberts et al., 2025), VisuLogic (Xu et al., 2025), and HLE (Team, 2025c) .
• **STEM / Multimodal Reasoning:** MMMU (Standard/Pro), MathVista, MathVision, MathVerse, DynaMath, We-Math, PhyX; 逻辑与谜题用 LogicVista, ZeroBench, VisuLogic, HLE.

• **Recognition / General VQA:** General perception is evaluated using MMBench (EN/CN) (Liu et al., 2024b), SimpleVQA (Cheng et al., 2025), and MMStar (Chen et al., 2024b). Robustness and fine-grained recognition are assessed via HallusionBench (Guan et al., 2024), MMVP (Tong et al., 2024c), ReMI (Kazemi et al., 2024), M3GIA (Song et al., 2024), and DoYouSeeMe (Kanade and Ganu, 2025).
• **Recognition / General VQA:** MMBench (EN/CN), SimpleVQA, MMStar; 鲁棒与细粒度用 HallusionBench, MMVP, ReMI, M3GIA, DoYouSeeMe.

• **Counting:** We utilize CountBench (Paiss et al., 2023), CountQA (Tamarapalli et al., 2025), and PixMo-Count (Deitke et al., 2024) to evaluate precise object enumeration.
• **Counting:** CountBench, CountQA, PixMo-Count.

• **Instruction Following:** Multimodal compliance is tested on MM-MT-Bench (Ying et al., 2024), MIA-Bench (Qian et al., 2025), and MM-IFEval (Ding et al., 2025).
• **Instruction Following:** MM-MT-Bench, MIA-Bench, MM-IFEval.

• **Multimodal Code:** Visual coding capabilities are evaluated using HumanEval-V (Zhang et al., 2025), and Design2Code (including Design2Code-Hard) (Si et al., 2025).
• **Multimodal Code:** HumanEval-V, Design2Code (含 Hard).

• **OCR:** Text-rich image understanding is assessed via OCRBench (Liu et al., 2024c), OmniOCR (OmniAI), and CC-OCR (Yang et al., 2024).
• **OCR:** OCRBench, OmniOCR, CC-OCR.

• **2D / 3D Spatial Understanding:** We conduct extensive spatial reasoning tests using BLINK (Fu et al., 2024), CVBench (Tong et al., 2024b), MMSI-Bench (Yang et al., 2025b), ERQA (Team et al., 2025b), OmniSpatial (Jia et al., 2025), All-Angles-Bench (Yeh et al., 2025), MindCube-tiny (Yin et al., 2025), RealWorldQA (X.AI, 2024), SpatialViz-Bench (Wang et al., 2025a), STARE (Li et al., 2025c), CoreCognition (Li et al., 2025d), V\* (Wu and Xie, 2023), and ViewSpatial (Li et al., 2025a).
• **2D / 3D Spatial Understanding:** BLINK, CVBench, MMSI-Bench, ERQA, OmniSpatial, All-Angles-Bench, MindCube-tiny, RealWorldQA, SpatialViz-Bench, STARE, CoreCognition, V*, ViewSpatial.

• **Document & Chart Understanding:** Complex parsing is tested on CharXiv (RQ) (Wang et al., 2024d), AI2D (Kembhavi et al., 2016), OmniDocBench (Ouyang et al., 2024), and CSVQA (Jian et al., 2025).
• **Document & Chart Understanding:** CharXiv (RQ), AI2D, OmniDocBench, CSVQA.

• **GUI Grounding:** To evaluate actionable intelligence, we employ ScreenSpot-Pro (Li et al., 2025b), ScreenSpot-V2 (Wu et al., 2024), OSWorld-G (Xie et al., 2025), and MMBench-GUI (Wang et al., 2025c).
• **GUI Grounding:** ScreenSpot-Pro, ScreenSpot-V2, OSWorld-G, MMBench-GUI.

**II. Text-Centric Benchmarks.** We verify LLM foundations across six categories:
**II. Text-Centric Benchmarks.** 文本中心基础能力分六类:

• **Exam:** General knowledge is evaluated on MMLU-Pro (Wang et al., 2024c), GPQA-Diamond (Rein et al., 2023), SuperGPQA (Team et al., 2025c), and LiveBench (White et al., 2025).
• **Exam:** MMLU-Pro, GPQA-Diamond, SuperGPQA, LiveBench.

• **Mathematics:** Mathematical reasoning is rigorously tested on AIME (2024/2025) (MAA, a,b), Beyond-AIME (ByteDance-Seed, 2025), HMMT25 (HMMT, 2025), CNMO 2024 (CNMO Committee, 2024), and IMO-AnswerBench (Luong et al., 2025).
• **Mathematics:** AIME 2024/2025, Beyond-AIME, HMMT25, CNMO 2024, IMO-AnswerBench.

• **Code:** Pure text coding is evaluated via LiveCodeBench (2408-2505) (Jain et al., 2024).
• **Code:** LiveCodeBench (2408-2505).

• **Instruction Following:** We use IFEval (Zhou et al., 2023), IFBench (Pyatkin et al., 2025), and MultiChallenge (Sirdeshmukh et al., 2025).
• **Instruction Following:** IFEval, IFBench, MultiChallenge.

• **Subjective:** Open-ended generation quality is assessed on Arena-Hard-V2 (Li et al., 2024) and WildBench (Lin et al., 2024).
• **Subjective:** Arena-Hard-V2, WildBench.

• **Medical:** Domain-specific knowledge is tested on HealthBench (Arora et al., 2025).
• **Medical:** HealthBench.

<!-- page 12 of 50 -->

**Inference Settings.** We evaluate STEP3-VL-10B using a fixed configuration (temperature=1.0, top-p=1.0, top-k=0). By default, the model uses **Sequential Reasoning (SeRe)**, generating thoughts wrapped in &lt;think&gt; and &lt;/think&gt; tags before the answer, with a maximum length of 65,536 tokens. For complex perception and advanced reasoning tasks, we employ **Parallel Coordinated Reasoning (PaCoRe)** (Hu et al., 2026), which synthesizes 16 SeRe rollouts into a context for final inference (more details refer to Sec. B). In PaCoRe mode, the maximum length is extended to 131,072 tokens to support the expanded context, while other hyperparameters remain consistent.
**Inference Settings.** 固定配置: temperature=1.0, top-p=1.0, top-k=0. 默认 **SeRe**: 思考包在 &lt;think&gt;...&lt;/think&gt;, 最长 65,536 token. 复杂感知与高阶推理用 **PaCoRe**: 综合 16 路 SeRe rollout 再最终推断 (详见附录 B); PaCoRe 最长 131,072, 其余超参不变.

> **对一下:** §4.1 Inference Settings 写 temperature=1.0, top-p=1.0, top-k=0; SeRe 最长 65,536, PaCoRe 最长 131,072. PaCoRe 模式有没有改采样温度, 还是只加长上下文?
> 原句: PaCoRe 把最大长度扩到 131,072 以容纳扩展上下文, 「while other hyperparameters remain consistent」. 评测默认采样三件套在 SeRe / PaCoRe 间不变; 变的是最大长度与是否综合 16 路 SeRe.

**Comparison Models.** We benchmark ST EP3-VL-10B against representative open-source models (7B–10B) including **GLM-4.6V-Flash** (9B) (Team et al., 2025d), **Qwen3-VL-Thinking** (8B) (Bai et al., 2025), **InternVL-3.5** (8B) (Wang et al., 2025b), and **MiMo-VL-RL-2508** (7B) (Team et al., 2025a). For scalability analysis, we compare against larger systems: **GLM-4.6V** (106B-A12B) (Team et al., 2025d), **Qwen3-VL** (235B-A22B) (Bai et al., 2025), **Gemini-2.5-Pro** (Team, 2025a), and **Seed-1.5-VL** (Guo et al., 2025a).
**Comparison Models.** 同档开源: GLM-4.6V-Flash (9B), Qwen3-VL-Thinking (8B), InternVL-3.5 (8B), MiMo-VL-RL-2508 (7B). 放大对照: GLM-4.6V (**106B-A12B**), Qwen3-VL (**235B-A22B**), Gemini-2.5-Pro, Seed-1.5-VL.

### 4.2. Multimodal Evaluation Results

In Table 1, we benchmark STEP3-VL-10B against strong open-source models within the 7B– 10B parameter range. The results indicate that STEP3-VL-10B establishes a new performance standard for compact models, securing the top position in almost all capability domains. We provide a detailed breakdown below.
表 1 对照 7B–10B 强开源. 结果表明 STEP3-VL-10B 为紧凑模型立下新标准, 在几乎所有能力域取第一. 分域如下.

**STEM and Multimodal Reasoning.** STEP3-VL-10B consistently outperforms competitive open-source models in the 7B–10B regime across all benchmarks targeting mathematical and scientific reasoning. ST EP3-VL-10B achieves 78.11%/64.08% on MMMU (Standard/Pro) and notably, on MathVision, it surpasses strong baselines such as MiMo-VL-RL-2508 and Qwen3-VL by more than 10 points. These gains can be primarily attributed to sufficient pre-training and scaled RL compute.
**STEM.** 在 7B–10B 数学 / 科学推理榜上持续领先. MMMU Standard/Pro 78.11%/64.08%; MathVision 相对 MiMo-VL-RL-2508 与 Qwen3-VL 等强基线高出 10 分以上. 增益主因归因充分预训练与加大的 RL 算力.

**Recognition and General VQA.** STEP3-VL-10B consistently exhibits superior performance in visual recognition and VQA tasks, outperforming existing baselines across all evaluated benchmarks. Notably, STEP3-VL-10B achieves 92.05%/91.55% on MMBench (EN/CN), establishing the strongest performance among models within the 10B parameter scale. We attribute this exceptional performance to large-scale, high-quality multimodal pre-training, particularly the scaling of the 1.8B Perception Encoder.
**Recognition / VQA.** 各评测基准均高于对照; MMBench EN/CN 92.05%/91.55%, 自称 10B 档最强. 归因大规模高质量多模态预训练, 尤其是 1.8B Perception Encoder 的部署前缩放.

**2D / 3D Spatial Understanding.** Despite the absence of specific data curation, STEP3-VL-10B demonstrates remarkable spatial awareness and reasoning capabilities across both 2D and 3D environments. This emergent proficiency underscores its immense potential as a robust baseline for downstream actionable scenarios, such as embodied intelligence and robotic control.
**2D/3D Spatial.** 正文写即便没有专门数据整理, 仍在 2D/3D 空间表现出色, 可作为具身 / 机器人等下游可执行场景的稳健基线.

**OCR and Document Understanding.** STEP3-VL-10B exhibits frontier-class document intelligence, achieving 86.75% on OCRBench and 89.35% on AI2D. This capability stems from our systematic OCR data construction, which combines extensive real-world collection with high-fidelity synthetic generation.
**OCR / Document.** OCRBench 86.75%, AI2D 89.35%; 归因系统化 OCR 数据建设 (真实采集 + 高保真合成).

**GUI Grounding and Interaction.** In actionable intelligence, ST EP3-VL-10B dominates the leaderboard with 92.61% on ScreenSpot-V2 and 59.02% on OSWorld-G. These margins validate our **Trajectory Modeling** approach, where training on granular action trajectories (e.g., CLICK, SCROLL) effectively grounds visual elements into executable actions, surpassing methods
**GUI.** ScreenSpot-V2 92.61%, OSWorld-G 59.02%; 归因 Trajectory Modeling: 在细粒度动作轨迹 (如 CLICK, SCROLL) 上训练, 把视觉元素落到可执行动作, 优于

<!-- page 13 of 50 -->

relying solely on static captioning. Notably, these gains are further amplified by RL integrated with a perception reward system, which significantly enhances the model’s ability to generalize in complex GUI environments.
仅靠静态 caption 的方法. 这些增益还被接入感知奖励的 RL 进一步放大, 提升复杂 GUI 环境泛化.

Table 1 | Comparison with state-of-the-art open-source models (7B–10B) on multimodal benchmarks. The bold and underlined numbers indicate the best and second-best results, respectively. <sup>∗</sup>indicates results reported in the original papers.
表 1 | 与 7B–10B 开源 SOTA 的多模态对照. 加粗 / 下划线分别为最佳 / 次佳; <sup>∗</sup> 表示引自原论文.

> **看表:** §4.2 写 「top position in almost all capability domains」, 但表 1 Counting 中 CountBench STEP3-VL-10B 88.75 低于 GLM-4.6V-Flash 90.22, PixMo-Count 70.85 低于 76.42; ScreenSpot-V2 92.61 也低于带 * 的 Qwen3-VL 93.60. 「almost all」 该怎么读?
> 应按域内多数格领先, 而非逐格第一. Counting 与部分 GUI / 指令格存在第二或更低; 带 * 的格子还可能来自原论文协议. 引用 「同档新标杆」 时保留 「almost」, 不要改写成全表加粗.

<table><tr><td rowspan="3"></td><td rowspan="3">Benchmark</td><td colspan="5">Model</td></tr><tr><td>STEP3-VL-10B</td><td>GLM-4.6V Flash</td><td>Qwen3-VL Thinking</td><td>InternVL 3.5</td><td>MiMo-VL RL-2508</td></tr><tr><td>10B</td><td>9B</td><td>8B</td><td>8B</td><td>7B</td></tr><tr><td rowspan="13">STEM / Multimodal Reasoning</td><td>MMMU</td><td>78.11</td><td>71.17</td><td>73.53</td><td>71.69</td><td>71.14</td></tr><tr><td>MMMU-Pro</td><td>64.08</td><td>59.93</td><td>60.94</td><td>59.11</td><td>60.29</td></tr><tr><td>MathVision</td><td>70.81</td><td>54.05</td><td>59.60</td><td>52.05</td><td>59.65</td></tr><tr><td>MathVista</td><td>83.97</td><td>82.85</td><td>78.50</td><td>76.78</td><td>79.86</td></tr><tr><td>LogicVista</td><td>66.89</td><td>60.29</td><td>64.37</td><td>54.03</td><td>63.37</td></tr><tr><td>DynaMath</td><td>56.39</td><td>48.40</td><td>45.11</td><td>39.47</td><td>51.65</td></tr><tr><td>ZeroBench (main)</td><td>1.00</td><td>0.50</td><td>0.50</td><td>0.75</td><td>0.50</td></tr><tr><td>ZeroBench (sub)</td><td>27.54</td><td>24.03</td><td>20.58</td><td>18.56</td><td>21.18</td></tr><tr><td>MathVerse (vision)</td><td>75.73</td><td>71.41</td><td>73.19</td><td>65.18</td><td>73.19</td></tr><tr><td>We-Math</td><td>73.03</td><td>61.86</td><td>67.31</td><td>51.26</td><td>63.24</td></tr><tr><td>VisuLogic</td><td>29.68</td><td>26.50</td><td>27.82</td><td>27.20</td><td>24.52</td></tr><tr><td>PhyX</td><td>59.45</td><td>52.28</td><td>57.67</td><td>50.51</td><td>56.00</td></tr><tr><td>HLE</td><td>10.73</td><td>3.82</td><td>5.98</td><td>4.51</td><td>5.90</td></tr><tr><td rowspan="9">Recognition / General VQA</td><td>MMBench EN</td><td>92.05</td><td>91.04</td><td>90.55</td><td>88.20</td><td>89.91</td></tr><tr><td>MMBench CN</td><td>91.55</td><td>89.56</td><td>89.75</td><td>86.24</td><td>88.79</td></tr><tr><td>SimpleVQA</td><td>53.08</td><td>52.09</td><td>48.69</td><td>41.43</td><td>49.65</td></tr><tr><td>MMStar</td><td>77.48</td><td>74.26</td><td>73.58</td><td>69.83</td><td>72.93</td></tr><tr><td>HallusionBench</td><td>64.91</td><td>59.92</td><td>62.23</td><td>58.79</td><td>63.53</td></tr><tr><td>MMVP</td><td>68.16</td><td>63.33</td><td>57.17</td><td>51.33</td><td>63.50</td></tr><tr><td>ReMI</td><td>67.29</td><td>60.75</td><td>57.17</td><td>52.65</td><td>63.13</td></tr><tr><td>M3GIA</td><td>78.36</td><td>76.66</td><td>76.86</td><td>62.38</td><td>65.84</td></tr><tr><td>DoYouSeeMe</td><td>67.48</td><td>65.52</td><td>56.90</td><td>38.22</td><td>60.92</td></tr><tr><td rowspan="3">Counting</td><td>CountBench</td><td>88.75</td><td>90.22</td><td>88.85</td><td>82.18</td><td>83.60</td></tr><tr><td>CountQA</td><td>33.69</td><td>33.79</td><td>23.35</td><td>22.32</td><td>27.41</td></tr><tr><td>PixMo-Count</td><td>70.85</td><td>76.42</td><td>69.51</td><td>63.24</td><td>69.98</td></tr><tr><td rowspan="3">Instruction Following</td><td>MM-MT-Bench</td><td>8.14</td><td>6.94</td><td>8.16</td><td>7.46</td><td>8.08</td></tr><tr><td>MIA-Bench</td><td>92.00</td><td>89.99</td><td>92.35</td><td>90.89</td><td>90.91</td></tr><tr><td>MM-IFEval</td><td>61.87</td><td>60.78</td><td>60.93</td><td>60.80</td><td>61.28</td></tr><tr><td rowspan="3">Code</td><td>HumanEval-V</td><td>66.05</td><td>29.26</td><td>26.94</td><td>24.31</td><td>31.96</td></tr><tr><td>Design2Code</td><td>79.55</td><td>25.93</td><td>72.21</td><td>64.15</td><td>82.54</td></tr><tr><td>Design2Code (hard)</td><td>54.69</td><td>19.37</td><td>48.75</td><td>46.25</td><td>59.38</td></tr><tr><td rowspan="3">OCR</td><td>OCRBench</td><td>86.75</td><td>85.97</td><td>82.85</td><td>83.70</td><td>85.40</td></tr><tr><td>OmniOCR</td><td>76.98</td><td>80.24</td><td>75.53</td><td>70.97</td><td>74.38</td></tr><tr><td>CC-OCR (Multi-Lang-OCR)</td><td>76.59</td><td>70.85</td><td>69.25</td><td>66.42</td><td>72.06</td></tr><tr><td rowspan="13">2D / 3D Spatial Understanding</td><td>BLINK</td><td>66.79</td><td>64.90</td><td>62.78</td><td>55.40</td><td>62.57</td></tr><tr><td>CVBench</td><td>83.49</td><td>86.01</td><td>84.81</td><td>77.52</td><td>82.04</td></tr><tr><td>MMSI-Bench</td><td>32.18</td><td>31.13</td><td>29.05</td><td>28.12</td><td>29.60</td></tr><tr><td>ERQA</td><td>48.87</td><td>45.13</td><td>44.31</td><td>38.88</td><td>41.94</td></tr><tr><td>OmniSpatial</td><td>51.58</td><td>49.41</td><td>46.56</td><td>47.49</td><td>46.74</td></tr><tr><td>All-Angles-Bench</td><td>57.21</td><td>53.24</td><td>45.88</td><td>45.29</td><td>51.62</td></tr><tr><td>MindCube-tiny</td><td>62.81</td><td>45.00</td><td>41.06</td><td>34.65</td><td>39.06</td></tr><tr><td>RealWorldQA</td><td>74.44</td><td>76.93</td><td>71.93</td><td>66.93</td><td>72.78</td></tr><tr><td>SpatialViz-Bench</td><td>45.51</td><td>33.79</td><td>35.15</td><td>32.42</td><td>28.94</td></tr><tr><td>STARE</td><td>61.75</td><td>56.45</td><td>54.95</td><td>48.20</td><td>55.06</td></tr><tr><td>CoreCognition</td><td>66.69</td><td>65.11</td><td>64.04</td><td>61.70</td><td>65.30</td></tr><tr><td>V*</td><td>82.85</td><td>83.51</td><td>81.02</td><td>66.89</td><td>83.38</td></tr><tr><td>ViewSpatial</td><td>46.14</td><td>43.26</td><td>45.20</td><td>35.96</td><td>40.19</td></tr><tr><td rowspan="4">Document &amp; Chart Understanding</td><td>CharXiv (RQ)</td><td>59.52</td><td>59.70</td><td>53.48</td><td>47.15</td><td>59.32</td></tr><tr><td>AI2D</td><td>89.35</td><td>88.93</td><td>83.32</td><td>82.34</td><td>84.96</td></tr><tr><td>CSVQA</td><td>63.33</td><td>54.99</td><td>61.32</td><td>46.62</td><td>60.23</td></tr><tr><td>OmniDocBenchNED↓</td><td>21.51</td><td>24.88</td><td>23.38</td><td>29.47</td><td>23.30</td></tr><tr><td rowspan="4">GUI Grounding</td><td>ScreenSpot-Pro</td><td>51.55</td><td>45.68</td><td>46.60*</td><td>15.39</td><td>34.84</td></tr><tr><td>OSWorld-G</td><td>59.02</td><td>54.71</td><td>56.70*</td><td>31.91</td><td>50.54</td></tr><tr><td>ScreenSpot-V2</td><td>92.61</td><td>92.14</td><td>93.60*</td><td>84.02</td><td>90.82</td></tr><tr><td>MMBench-GUI (L2)</td><td>81.50</td><td>78.46</td><td>76.60</td><td>63.95</td><td>75.69</td></tr></table>

<!-- page 14 of 50 -->

### 4.3. Text-Centric Evaluation Results

Table 2 illustrates that ST EP3-VL-10B preserves high-fidelity linguistic intelligence while scaling multimodal training. Unlike prior VL models, ST EP3-VL-10B effectively avoids the performance trade-off between text and vision modalities.
表 2 说明在多模态训练放大的同时, STEP3-VL-10B 仍保住高保真语言智能; 相对先前 VL 模型, 有效避免文本与视觉的此消彼长.

Table 2 | Comparison with SOTA open-source models (7B–10B) on text-centric benchmarks.
表 2 | 与 7B–10B 开源 SOTA 的文本中心对照.

<table><tbody><tr><td rowspan="2"></td><td rowspan="2">Benchmark</td><td colspan="5">Model</td></tr><tr><td>STEP3-VL-10B10B</td><td>GLM-4.6VFlash9B</td><td>Qwen3-VLThinking8B</td><td>InternVL3.58B</td><td>MiMo-VLRL-25087B</td></tr><tr><td>Exam</td><td>MMLU-Pro GPQA-Diamond SuperGPQALiveBench(2024-11-25)</td><td>76.0270.8350.3869.71</td><td>72.3049.3742.9544.11</td><td>77.0967.5549.5270.79</td><td>76.0365.1242.3555.62</td><td>73.8159.9745.6954.35</td></tr><tr><td>Mathematics</td><td>AIME2024AIME2025HMMT25CNMO2024BeyondAIME IMO-AnswerBench</td><td>90.9487.6678.1878.2063.2362.12</td><td>37.9233.0219.1761.7211.8022.62</td><td>74.0662.9245.2179.2230.5938.69</td><td>78.1862.5035.7866.5666.5635.00</td><td>75.3666.5147.3476.1743.9448.44</td></tr><tr><td>Code</td><td>LiveCodeBench (2408-2505)</td><td>75.77</td><td>22.17</td><td>51.05</td><td>45.90</td><td>39.65</td></tr><tr><td>Instruction</td><td>IFEval IFBench</td><td>82.1643.28</td><td>74.8627.47</td><td>83.2336.65</td><td>79.7228.14</td><td>68.6223.47</td></tr><tr><td>Following</td><td>MultiChallenge</td><td>62.64</td><td>42.49</td><td>49.82</td><td>37.73</td><td>44.69</td></tr><tr><td>Subjective</td><td>Arena-Hard-V2WildBench</td><td>58.5786.04</td><td>9.2634.04</td><td>47.3472.36</td><td>15.5756.45</td><td>28.5963.09</td></tr><tr><td>Medical</td><td>HealthBench</td><td>44.67</td><td>31.80</td><td>47.45</td><td>35.54</td><td>43.58</td></tr></tbody></table>

**Mathematics and Code.** STEP3-VL-10B significantly outpaces its counterparts in complex reasoning tasks. Its exceptional performance on challenging benchmarks like IMO-AnswerBench (62.12%) and LiveCodeBench (2408-2505) (75.77 %) serves as a strong testament to its robust logical inference capabilities, positioning it as a leading model for tasks requiring high-level problem-solving skills.
**Mathematics and Code.** 复杂推理明显快于同列; IMO-AnswerBench 62.12%, LiveCodeBench (2408-2505) 75.77%, 用作高阶解题能力证据.

**Human Alignment.** The exceptional instruction-following capabilities and subjective performance of STEP3-VL-10B further reveal its superior alignment with human preferences, effectively bridging the usability gap traditionally associated with models of 10B size. Our internal Elo-based evaluation confirms that, STEP3-VL-10B achieves a preference score that matches significantly larger open-source models, demonstrating its potential for high-quality, real-world deployment.
**Human Alignment.** 指令遵循与主观表现进一步显示人对齐更强, 缩小 10B 档常见的可用性差距. 内部 Elo 评测称偏好分可匹配显著更大的开源模型. 正文未公布 Elo 分表本身.

### 4.4. Comparison with Larger Models

To evaluate the performance ceiling of STEP3-VL-10B, we benchmark it against strong open-source (10×–20× larger) and closed-source flagships. As shown in Table 3, STEP3-VL-10B effectively bridges the gap between limited parameter scales (10B) and frontier intelligence. On standard benchmarks, STEP3-VL-10B outperforms GLM-4.6V (106B-A12B) across perception, recognition, and complex reasoning tasks, while remaining competitive with Qwen3-VL-
为估性能天花板, 对照 10×–20× 更大开源与闭源旗舰. 表 3 显示 10B 与前沿智能之间的差距被有效拉近. 标准基准上, 感知 / 识别 / 复杂推理多处超过 GLM-4.6V (**106B-A12B**), 并与 Qwen3-VL-

<!-- page 15 of 50 -->

Table 3 | Comparisons against models that are 10×–20× larger, as well as leading proprietary systems, on multimodal and text-centric benchmarks. SeRe and PaCoRe refer to Sequential Reasoning and Parallel Coordinated Reasoning (Hu et al., 2026), respectively.
表 3 | 对 10×–20× 更大模型与领先闭源系统的多模态 / 文本中心对照. SeRe / PaCoRe 分别为 Sequential Reasoning 与 Parallel Coordinated Reasoning.

> **回看:** 摘要 MathVision 75.95%, AIME2025 94.43%, MMMU 80.11% — 对应表 1 还是表 3?
> 表 1 MathVision 是 70.81 (同档 SeRe). 表 3 PaCoRe 列: MathVision 75.95, MMMU 80.11, AIME2025 94.43. 文首亮点分应按表 3 PaCoRe 读, 不要与表 1 SeRe 混引.

<table><tr><td rowspan="3"></td><td rowspan="3">Benchmark</td><td colspan="6">Model</td></tr><tr><td colspan="2">STEP3-VL-10B</td><td>GLM-4.6V</td><td rowspan="2">Qwen3-VL Thinking</td><td rowspan="2">Gemini-2.5 Pro</td><td rowspan="2">Seed-1.5-VL Thinking</td></tr><tr><td>SeRe 10B</td><td>PaCoRe 10B</td><td>106B-A12B</td></tr><tr><td colspan="8">Multimodal Benchmarks</td></tr><tr><td rowspan="12">STEM / Multi-modal Reasoning</td><td>MMMU</td><td>78.11</td><td>80.11</td><td>75.20</td><td>78.70</td><td>83.89</td><td>79.11</td></tr><tr><td>MMMU-Pro</td><td>64.08</td><td>67.18</td><td>65.84</td><td>72.37</td><td>76.96</td><td>70.60</td></tr><tr><td>MathVision</td><td>70.81</td><td>75.95</td><td>63.50*</td><td>72.10</td><td>73.30*</td><td>68.70*</td></tr><tr><td>MathVista</td><td>83.97</td><td>85.50</td><td>83.51</td><td>85.10</td><td>83.88</td><td>85.60</td></tr><tr><td>LogicVista</td><td>66.89</td><td>71.36</td><td>64.88</td><td>73.15</td><td>69.80</td><td>72.93</td></tr><tr><td>DynaMath</td><td>56.39</td><td>61.48</td><td>56.29</td><td>60.30</td><td>52.30</td><td>58.88</td></tr><tr><td>ZeroBench (main)</td><td>1.00</td><td>5.00</td><td>1.00</td><td>3.00</td><td>4.00</td><td>1.00</td></tr><tr><td>ZeroBench (sub)</td><td>27.54</td><td>29.94</td><td>29.04</td><td>28.40</td><td>33.53</td><td>31.74</td></tr><tr><td>MathVerse (vision)</td><td>75.73</td><td>78.30</td><td>72.84</td><td>76.65</td><td>78.30</td><td>77.79</td></tr><tr><td>We-Math</td><td>73.03</td><td>73.90</td><td>71.14</td><td>74.70</td><td>80.10</td><td>79.05</td></tr><tr><td>VisuLogic</td><td>29.68</td><td>32.70</td><td>28.30</td><td>31.80</td><td>31.40</td><td>34.30</td></tr><tr><td>PhyX</td><td>59.45</td><td>66.01</td><td>59.70</td><td>66.30</td><td>67.56</td><td>62.53</td></tr><tr><td rowspan="9">Recognition / General VQA</td><td>MMBench EN</td><td>92.05</td><td>92.38</td><td>92.75</td><td>92.70</td><td>93.19</td><td>92.11</td></tr><tr><td>MMBench CN</td><td>91.55</td><td>91.96</td><td>91.88</td><td>91.80</td><td>93.13</td><td>91.76</td></tr><tr><td>SimpleVQA</td><td>53.08</td><td>54.64</td><td>57.95</td><td>59.30</td><td>66.85</td><td>64.72</td></tr><tr><td>MMStar</td><td>77.48</td><td>77.64</td><td>75.30</td><td>76.80</td><td>79.18</td><td>77.91</td></tr><tr><td>HallusionBench</td><td>64.91</td><td>64.54</td><td>60.63</td><td>65.58</td><td>65.63</td><td>64.13</td></tr><tr><td>MMVP</td><td>68.16</td><td>68.00</td><td>71.33</td><td>71.30</td><td>70.67</td><td>74.00</td></tr><tr><td>ReMI</td><td>67.29</td><td>69.12</td><td>64.42</td><td>74.70</td><td>71.69</td><td>72.19</td></tr><tr><td>M3GIA</td><td>78.33</td><td>73.50</td><td>78.72</td><td>81.00</td><td>83.11</td><td>83.22</td></tr><tr><td>DoYouSeeMe</td><td>67.48</td><td>68.54</td><td>67.50</td><td>72.89</td><td>71.19</td><td>71.94</td></tr><tr><td rowspan="3">Counting</td><td>CountBench</td><td>88.75</td><td>88.80</td><td>92.06</td><td>92.46</td><td>87.78</td><td>91.85</td></tr><tr><td>CountQA</td><td>33.69</td><td>38.29</td><td>36.32</td><td>45.62</td><td>38.02</td><td>48.89</td></tr><tr><td>PixMo-Count</td><td>70.85</td><td>71.61</td><td>76.47</td><td>79.80</td><td>75.54</td><td>83.38</td></tr><tr><td rowspan="3">OCR</td><td>OCRBench</td><td>86.75</td><td>89.00</td><td>86.20</td><td>87.30</td><td>85.90</td><td>85.20</td></tr><tr><td>OmniOCR</td><td>76.98</td><td>78.14</td><td>84.53</td><td>87.20</td><td>66.05</td><td>87.80</td></tr><tr><td>CC-OCR (Multi-Lang-OCR)</td><td>76.59</td><td>77.51</td><td>74.08</td><td>80.80</td><td>81.10</td><td>78.82</td></tr><tr><td rowspan="13">2D / 3D Spatial Understanding</td><td>BLINK</td><td>66.79</td><td>67.39</td><td>68.17</td><td>67.12</td><td>72.01</td><td>71.54</td></tr><tr><td>CVBench</td><td>83.49</td><td>85.92</td><td>83.72</td><td>87.86</td><td>84.36</td><td>86.27</td></tr><tr><td>MMSI-Bench</td><td>32.18</td><td>36.40</td><td>30.80</td><td>32.50</td><td>40.40</td><td>30.60</td></tr><tr><td>ERQA</td><td>48.87</td><td>51.75</td><td>47.75</td><td>53.50</td><td>62.25</td><td>48.50</td></tr><tr><td>OmniSpatial</td><td>51.58</td><td>52.58</td><td>50.49</td><td>53.10</td><td>55.64</td><td>51.99</td></tr><tr><td>All-Angles-Bench</td><td>57.21</td><td>64.71</td><td>62.94</td><td>60.59</td><td>65.88</td><td>57.65</td></tr><tr><td>MindCube-tiny</td><td>62.81</td><td>68.58</td><td>52.83</td><td>47.58</td><td>58.92</td><td>39.83</td></tr><tr><td>RealWorldQA</td><td>74.44</td><td>75.56</td><td>77.78</td><td>78.80</td><td>77.78</td><td>79.61</td></tr><tr><td>SpatialViz-Bench</td><td>45.51</td><td>52.03</td><td>37.46</td><td>46.36</td><td>45.34</td><td>35.25</td></tr><tr><td>STARE</td><td>61.75</td><td>64.57</td><td>60.38</td><td>70.89</td><td>62.36</td><td>62.99</td></tr><tr><td>CoreCognition</td><td>66.69</td><td>71.54</td><td>69.50</td><td>72.66</td><td>78.78</td><td>72.38</td></tr><tr><td>V*</td><td>82.85</td><td>84.29</td><td>85.86</td><td>89.53</td><td>80.63</td><td>90.58</td></tr><tr><td>ViewSpatial</td><td>46.14</td><td>48.41</td><td>43.87</td><td>48.58</td><td>44.15</td><td>44.14</td></tr><tr><td colspan="8">Text-Centric Benchmarks</td></tr><tr><td rowspan="4">Exam</td><td>MMLU-Pro</td><td>76.02</td><td>77.09</td><td>79.96</td><td>83.75</td><td>86.45</td><td>83.39</td></tr><tr><td>GPQA-Diamond</td><td>70.83</td><td>73.99</td><td>69.19</td><td>77.68</td><td>84.06</td><td>71.91</td></tr><tr><td>SuperGPQA</td><td>50.38</td><td>53.15</td><td>53.28</td><td>64.20</td><td>65.00</td><td>60.50</td></tr><tr><td>LiveBench(2024-11-25)</td><td>69.71</td><td>71.69</td><td>62.75</td><td>80.14</td><td>76.34</td><td>65.62</td></tr><tr><td rowspan="6">Mathematics</td><td>AIME2024</td><td>90.94</td><td>93.33</td><td>80.63</td><td>91.93</td><td>79.53</td><td>79.48</td></tr><tr><td>AIME2025</td><td>87.66</td><td>94.43</td><td>71.88</td><td>83.59</td><td>83.96</td><td>64.06</td></tr><tr><td>HMMT25</td><td>78.18</td><td>92.14</td><td>57.29</td><td>67.71</td><td>65.68</td><td>51.30</td></tr><tr><td>CNMO2024</td><td>78.20</td><td>81.17</td><td>72.11</td><td>88.36</td><td>74.53</td><td>83.67</td></tr><tr><td>BeyondAIME</td><td>63.23</td><td>74.00</td><td>39.83</td><td>57.42</td><td>54.45</td><td>42.83</td></tr><tr><td>IMO-AnswerBench</td><td>62.12</td><td>76.66</td><td>51.25</td><td>69.25</td><td>72.00</td><td>44.75</td></tr><tr><td>Code</td><td>LiveCodeBench (2408-2505)</td><td>75.77</td><td>76.43</td><td>48.71</td><td>69.45</td><td>72.01</td><td>57.10</td></tr></table>

<!-- page 16 of 50 -->

Thinking (235B-A22B). Notably, it achieves 70.81% on MathVision, 87.66% on AIME 2025, and 77.48% on MMStar, demonstrating exceptional multimodal intelligence within a compact 10B budget.
Thinking (**235B-A22B**) 保持竞争力. 此处点名的 MathVision 70.81%, AIME 2025 87.66%, MMStar 77.48% 对应 SeRe / 表 1 口径.

We further explore the model’s limits by scaling test-time compute via the parallel coordinated reasoning setting. As shown in Table 3, the **PaCoRe** mode of ST EP3-VL-10B consistently surpasses its standard SeRe mode and achieves frontier-level performance on several reasoningheavy and perception-centric benchmarks, even outperforming Gemini-2.5-Pro and Seed-1.5-VL. Specifically, STEP3-VL-10B achieves 80.11% on the multimodal understanding and reasoning benchmark MMMU. On the challenging multimodal mathematical reasoning benchmarks, Math-Vision and MathVista, it scores 75.95% and 85.50%, respectively. Furthermore, on representative visual recognition tasks such as MMBench and MMStar, it attains 92.17% (average on CN & EN) and 77.64%, respectively. These results demonstrate that STEP3-VL-10B has reached a leading level in multimodal perception and reasoning. Even more notably, on challenging high-level textual mathematics tasks like AIME2025 and HMMT25, it achieves remarkable scores of 94.43% and 92.14%, respectively. These results significantly outperform competing models, underscoring that intelligence is not strictly constrained by model size.
进一步用并行协调推理加大 TestingTime. 表 3 中 PaCoRe 持续超过 SeRe, 并在若干重推理 / 重感知榜上达到前沿, 甚至超过 Gemini-2.5-Pro 与 Seed-1.5-VL. 具体: MMMU 80.11%; MathVision / MathVista 75.95% / 85.50%; MMBench CN&EN 平均 92.17%, MMStar 77.64%; AIME2025 / HMMT25 94.43% / 92.14%. 作者据此强调智能并不严格受模型尺寸约束 — 前提是把 TestingTime 算进总开销.

## 5. Discussion

This section presents a two-fold analysis of the empirical findings that shaped ST EP3-VL-10B. First, we distill key design insights regarding model architecture and optimization strategies that informed our final configurations. Second, we characterize the learning dynamics during RLVR and the emergent capabilities arising from subsequent RL scaling.
本节两折: 先提炼架构 / 优化设计洞见; 再刻画 RLVR 学习动态与后续 RL 放大带来的涌现能力.

### 5.1. Ablations and Design Insights

**Vision Encoder Selection: PE-lang vs. DINOv3.** We compare the Perception Encoder (PE-lang, 300M parameters specifically selected for ablation) with DINOv3 (ViT-large-16, 300M parameters) (Siméoni et al., 2025) as the vision backbone. While DINOv3 excels in pure vision tasks, it suffers from slow convergence in our multimodal setting due to the modality gap. Conversely, PE-lang explicitly pre-aligned with LLMs achieves superior data efficiency and benchmark performance (Tab. 4). This underscores that **language alignment in the vision encoder remains a prerequisite for efficient VL modeling**, irrespective of subsequent trillionscale generative training.
**Vision Encoder.** 消融用 PE-lang (300M) 对 DINOv3 (ViT-large-16, 300M). DINOv3 纯视觉强, 但因模态间隙在本多模态设定收敛慢; PE-lang 因与 LLM 预对齐, 数据效率与榜分更好 (表 4). 结论: 视觉编码器侧的语言对齐仍是高效 VL 的前提, 即便后续还有万亿级生成式训练.

Table 4 | Comparison of Vision Encoders: DINOv3 vs. PE-lang. Here, Omni. and SVQA denote OmniSpatial and SimpleVQA, respectively.
表 4 | 视觉编码器对照: DINOv3 vs PE-lang. Omni. / SVQA 分别指 OmniSpatial / SimpleVQA.

| Vision Encoder | BLINK | Pe Omni. | rception MMVP | OCRBench | MMStar | SVQA | Gener CCBench | al V* | MMMU | ReMI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DINOv3 | 42.35 | 43.31 | 28.00 | 57.60 | 41.43 | 22.18 | 56.32 | 34.55 | 46.56 | 24.50 |
| PE-lang (Ours) | 41.19 | 43.57 | 32.00 | 70.10 | 42.10 | 21.15 | 59.39 | 37.17 | 47.67 | 26.08 |
| Δ | -1.16 | +0.26 | +4.00 | +12.50 | +0.67 | -1.03 | +3.07 | +2.62 | +1.11 | +1.58 |

**Optimizer Choice: Muon vs. AdamW.** We investigate Muon (Keller, 2024), a matrix-wise optimizer utilizing Newton-Schulz iteration (Bernstein and Newhouse, 2024) to regularize weight topology. Muon effectively addresses the noise and imbalance inherent in large-scale multimodal data, yielding notable improvements in Tab. 5 for tail-knowledge tasks (+6.48% SimpleVQA). These results suggest Muon effectively **reduces sensitivity to data scarcity**. Despite
**Optimizer.** 试 Muon (矩阵级, Newton-Schulz 正则化权重拓扑). 表 5 显示尾部知识任务有收益 (SimpleVQA +6.48%), 提示 Muon 可降低对数据稀缺的敏感. 尽管

<!-- page 17 of 50 -->

these capabilities, **we exclude Muon from the final architecture due to initialization mismatch**. Recent literature (Liu et al., 2025a) indicates that Muon is sensitive to weights initially optimized by element-wise methods like AdamW. In our setting, this necessitates a prolonged warmup period to stabilize the transition, which paradoxically limits overall training efficiency compared to a well-tuned AdamW baseline. We therefore leave a more thorough exploration of Muon for future work.
有这些能力, **最终仍排除 Muon, 原因是初始化不匹配**. 文献指出 Muon 对 AdamW 等逐元素方法先优化过的权重敏感; 本设定下需要过长 warmup 才能稳住过渡, 反而相对调好的 AdamW 基线伤整体训练效率. 更彻底的 Muon 探索留作未来工作.

Table 5 | AdamW vs. Muon optimizers across selected benchmarks.
表 5 | 选定基准上 AdamW vs Muon.

| Optimizer | BLINK | Pe Omni. | rception MMVP | OCRBench | MMStar | SVQA | Gen CCB | eral V* | MMMU | ReMI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Muon | 41.14 | 42.73 | 32.00 | 67.70 | 44.58 | 27.08 | 60.72 | 36.65 | 47.56 | 22.23 |
| Adam (Ours) | 40.72 | 44.94 | 29.33 | 71.10 | 41.77 | 20.60 | 60.13 | 39.27 | 46.11 | 25.00 |
| Δ | -0.42 | +2.21 | -2.67 | +3.40 | -2.81 | -6.48 | -0.59 | +2.62 | -1.45 | +2.77 |

**Ablation for Deepstack.** We investigate the utility of Deepstack (Meng et al., 2024), a depthextension technique successfully utilized in Qwen3-VL (Bai et al., 2025). While enabling Deepstack effectively accelerates training convergence, this optimization-level improvement does not translate into meaningful gains on downstream evaluation benchmarks, as shown in Tab. 6. Given the computational overhead versus the marginal utility, we exclude it from the final model configuration.
**Deepstack.** 试过 Qwen3-VL 用过的 Deepstack. 开启可加速收敛, 但表 6 显示下游评测无明显收益; 因算力开销对边际效用不合算, 最终配置剔除.

Table 6 | Ablation study of Deepstack architecture scaling.
表 6 | Deepstack 架构消融.

| Technique | BLINK | Pe Omni. | rception MMVP | OCRBench | MMStar | SVQA | Gen CCB | eral V* | MMMU | ReMI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| w/ DeepStack | 40.72 | 42.92 | 26.00 | 71.20 | 43.31 | 28.66 | 63.94 | 36.65 | 47.44 | 26.96 |
| w/o DeepStack (Ours) | 40.61 | 43.57 | 31.33 | 69.30 | 42.44 | 25.20 | 62.80 | 38.22 | 47.78 | 26.96 |
| Δ | -0.11 | +0.65 | +5.33 | -1.90 | -0.87 | -3.46 | -1.14 | +1.57 | +0.34 | +0.00 |

> **停一下:** 表 5 的 Δ 行相对谁? 若 Δ = Adam − Muon, 则 SVQA -6.48 表示 Adam 更低; 正文却写 Muon 在 SimpleVQA +6.48%.
> 正文 「yielding notable improvements in Tab. 5 for tail-knowledge tasks (+6.48% SimpleVQA)」 是以 Muon 相对 Adam 的增益叙述. 表内 Δ 行按数值是 Adam 行减 Muon 行 (SVQA 20.60−27.08=−6.48). 读表时要把 Δ 符号与正文 「Muon +6.48%」 对照, 不要把 Δ 行直接念成 「Adam 赢 6.48」.

### 5.2. RL Dynamics, Performance, and Emergence

**Training Dynamics and Continuous Improvement.** We track the evolution of RLVR over 600 training iterations, monitoring reward progression, average rollout length, and downstream performance across multimodal reasoning, recognition, OCR, and grounding tasks (assessed every 100 iterations). As illustrated in Fig. 2 (right) and Fig. 3, the model exhibits a robust two-phase growth trajectory: an initial rapid ascent in both rewards and metrics during the first 200 iterations, followed by a steady, linear increase. Remarkably, the reward consistently approaches 0.8 **without observing saturation**, mirrored by continuous gains in downstream metrics.
**Training Dynamics.** 跟踪 RLVR 600 迭代: 奖励, 平均 rollout 长度, 以及推理 / 识别 / OCR / grounding 下游 (每 100 迭代评一次). 图 2 右与图 3: 前 200 迭代快升, 之后近似线性; 奖励逼近 0.8 且正文称未见饱和, 下游同步连涨.

**Distinct Length Dynamics.** In contrast to the “sequential scaling” (i.e., the progressive lengthening of reasoning paths) typically observed in text-only RL (Guo et al., 2025b; Hu et al., 2025), the **average rollout length** in STEP3-VL-10B does not increase monotonically. Instead, it rises initially but eventually returns to its starting level (see Fig. 2, left). We identify this as a **cancellation effect** between two opposing scaling properties:
**Distinct Length Dynamics.** 相对纯文本 RL 常见的串行路径越来越长, 本模型平均 rollout 长度非单调: 先升后回到起点附近 (图 2 左). 作者称之为两种相反性质的 **cancellation effect**:

1. **Reasoning Tasks (e.g., STEM, Puzzles)**: Exhibit **standard sequential scaling**, where model performance is positively correlated with the extension of inference-time compute (i.e., chain-of-thought length).
1. **Reasoning Tasks**: 标准串行放大 — 表现与 TestingTime 延长 (思考轨迹变长) 正相关.

2. **Deterministic Perception Tasks (e.g., Grounding, OCR)**: Characterized by **length diminishment** via policy refinement. Unlike the expansive “thinking” chains required for
2. **Deterministic Perception Tasks**: 策略精炼带来 **length diminishment**. 与推理所需的扩展式思考轨迹不同,

<!-- page 18 of 50 -->

![Chart block](images/p18-chart.png)

![Chart block](images/p18-figure-2-rlvr-dynamics-while-the-reward-continuously.png)

Figure 2 | RLVR dynamics. While the reward continuously increases without saturating (right), the average rollout tokens decrease towards the starting level after an initial rise (left).
图 2 | RLVR 动态. 右侧奖励持续上升且未见饱和; 左侧平均 rollout token 先升后回落到接近起点.

![Chart block](images/p18-chart-2.png)

![Chart block](images/p18-chart-3.png)

![Chart block](images/p18-chart-4.png)

![Chart block](images/p18-figure-3-trends-of-representative-multimodal-reasoning.png)

Figure 3 | Trends of representative multimodal reasoning and perception metrics during RLVR. Evaluated every 100 iterations, performance mirrors the reward dynamics: rapid initial growth followed by steady improvement.
图 3 | RLVR 期间代表性多模态推理与感知指标趋势. 每 100 迭代评一次; 表现镜像奖励动态: 先快升再稳升.

reasoning, RL gains in perception stem from **entropy reduction** (Cui et al., 2025b). To be specific, RL optimization induces a systematic collapse of the search space by pruning redundant exploratory tokens. This process concentrates the probability mass onto the singular deterministic mode, effectively converting high-temperature **Pass@N** exploration into robust **Pass@1** accuracy (Yue et al., 2025). In this regime, shorter rollout lengths serve as a direct proxy for higher model confidence and sharpened perceptual focus.
感知侧 RL 增益来自 **entropy reduction**: 剪掉冗余探索 token, 把概率质量收束到单一确定性模式, 把高温 Pass@N 探索转成稳健 Pass@1. 此制度下, 更短 rollout 可直接代理更高置信与更锋利的感知焦点.

> **核对:** §5.2 Distinct Length Dynamics 把平均 rollout 先升后回落写成 cancellation effect. 推理题与感知题各自怎么拉长度?
> 原文分两条: Reasoning Tasks (STEM, Puzzles) 走 standard sequential scaling, 表现与 TestingTime 延长 (思考轨迹变长) 正相关; Deterministic Perception Tasks (Grounding, OCR) 走 length diminishment / entropy reduction, 短轨迹代理更高 Pass@1 置信. 平均值回落是对消结果, 不是单一任务单调变短.

**The "Missing Trace" Hypothesis.** Given that RL scaling strictly depends on the initial policy’s behavioral coverage (Fan et al., 2025; Wang et al., 2025d), we hypothesize that the perceptual "unscaling" stems from a critical data deficiency. While human visual cognition relies on iterative, coarse-to-fine processes (e.g., "glance-and-focus" or "try-error-correct" mechanisms akin to o3 (OpenAI, 2025c) or RePer (Wei et al., 2025b)), these internal mental states are rarely explicitly verbalized in training corpora. Consequently, the RL optimization landscape lacks the "cognitive traces" necessary to spontaneously incentivize sequential perceptual reasoning.
**Missing Trace 假说.** 因 RL 放大严格依赖初始策略的行为覆盖, 作者假设感知侧 「反放大」 来自关键数据缺口: 人类视觉认知依赖粗到细的迭代过程, 但这些内部状态很少在语料里被显式写成词. 于是 RL 优化地貌缺少可自发激励串行感知推理的 「cognitive traces」.

**Emergence via PaCoRe.** To address this limitation, we employ PaCoRe (Hu et al., 2026), a test-time scaling strategy that effectively explicates these implicit visual processes. Conceptually, this approach mirrors the proposal-then-refinement philosophy of foundational computer vision architectures, such as the Region Proposal Networks (RPN) in Faster R-CNN (Ren et al., 2016). In this framework, the model first samples multiple perceptual hypotheses (proposals); conditioning on these, the model then performs a multi-faceted synthesis to derive the final
**Emergence via PaCoRe.** 用 PaCoRe 把隐式视觉过程外置 (TestingTime 策略). 概念上类比 Faster R-CNN 的 RPN: 先采样多种感知假说 (proposal), 再条件式多面综合得到最终

<!-- page 19 of 50 -->

| Question: Locate the mish and Mennonite section in the image....Now, based on the original problem and reference responses above, please provide your own comprehensive solution. |
| --- |
| Response:Got it, let's look at the references.The references have different x-coordinates (like 220, 228, 227, etc.) but the common y is 185 or around there.Let's check the problem's context.The references' labels mention...Let's see the reference 5 has 228, reference 6 227, reference 9 228, etc.To create a new point, we need to follow the logic. Let's check the references' labels and their coordinates' variations....Maybe the key is to find a value that's in the middle of the range. Alternatively, check the problem's structure. ... |

Table 7 | A perception case of parallel coordinated reasoning: The model first aggregates reference answers, then cross-validates their validity, and ultimately identifies the underlying patterns of the final answer.
表 7 | 并行协调推理的感知案例: 先聚合参考答案, 再交叉核验有效性, 最终识别终答底层模式.

output. As illustrated in Tab. 7, this process spontaneously gives rise to complex, **human-like verification behaviors** during inference.
输出. 表 7 显示推断期可自发出现复杂的类人核验行为.

Crucially, this paradigm exhibits two distinctive scaling properties: (1) A steady, deliberate **growth in response length**, indicating the model’s ability to effectively allocate additional compute for hypothesis verification. (2) **Significant performance gains** in PaCoRe mode over the vanilla SeRe mode, as shown in Tab. 3. These gains are evident across benchmarks demanding intensive reasoning, such as MathVision (+5.14%) and DynaMath (+5.09%), as well as those requiring **exhaustive perception** (especially depends on high recall rate), including visual counting (CountQA, +4.6%), OCR (OCRBench, +2.25%), and especially, spatial understanding (All-Angles-Bench, +7.50%, SpatialViz-Bench, +6.52%).
该范式有两点放大性质: (1) 响应长度稳定, 有意增长, 显示能为假说核验追加算力; (2) 相对 SeRe, PaCoRe 有显著增益 (表 3), 如 MathVision +5.14%, DynaMath +5.09%, CountQA +4.6%, OCRBench +2.25%, All-Angles-Bench +7.50%, SpatialViz-Bench +6.52%.

> **拆开:** 图 2 左显示 RLVR 平均 rollout 先升后回落; §5.2 Emergence via PaCoRe 又写该范式有 「steady, deliberate growth in response length」. 两处是否互相否定?
> 不否定. 图 2 明确标 RLVR dynamics; PaCoRe 的响应变长写在 Emergence via PaCoRe / Tab. 3 增益段, 对应并行综合与假说核验的 TestingTime. 阶段与机制不同: RLVR 训练动态的均值对消, 对不上 PaCoRe 推断/范式下的有意加长.

**Compress System 2 to System 1.** PaCoRe, functioning as a primitive multi-agent framework, indeed enables perceptual scaling, where the proposer generates massive visual proposals in parallel, and the controller subsequently performs sequential cross-checking and self-verification. Looking forward, we aim to employ self-distillation to internalize these materialized, parallel coordinated reasoning traces. By injecting the logic of parallel deliberation directly into the model’s parameters, we seek to transform expensive “slow-thinking” (Kahneman, 2011) traces into high-fidelity, intrinsic intuition, ultimately fostering a more efficient and accurate perceptual foundation.
**Compress System 2 to System 1.** PaCoRe 作为初级多智能体框架, 让 proposer 并行产大量视觉提案, controller 再串行交叉核验. 展望用自蒸馏把这些已物化的并行协调轨迹内化进参数, 把昂贵慢思考痕迹压成高保真直觉, 形成更高效准确的感知底座.

> **再看:** 「Missing Trace」 在正文是 hypothesis, 还是已用消融证明的因果?
> §5.2 原句是 「we hypothesize that the perceptual unscaling stems from...」. 后续用 PaCoRe 外置过程并展示表 3 / 表 7 增益, 但没有单独消融证明 「缺 cognitive traces => 长度回落」 的充要关系. 引用时应标成假说 + 干预结果, 不要写成已证因果定理.

## 6. Conclusion and Future Work

Anchored by a rigorously curated corpus of 1.2T multimodal tokens and sharpened via over 1k iterations of sequential and parallel coordinated RL, STEP3-VL-10B has achieved capabilities in perception, reasoning, and alignment that rival the strongest proprietary and open-source frontiers. Yet, raw capability is not synonymous with systemic maturity. On the trajectory toward comprehensive multimodal intelligence, we identify critical bottlenecks in computational density

凭借严格筛选的 1.2T 多模态 token 语料, 经 1k+ 次顺序与并行协同 RL 打磨, STEP3-VL-10B 在感知, 推理与对齐上的能力已可媲美最强的专有与开源前沿. 但原始能力不等于系统成熟. 在通向全面多模态智能的路上, 我们识别出算力密度与物理 grounding 上的关键瓶颈, 战略路线图要把这些限制变成下一个增长引擎:

<!-- page 20 of 50 -->

and physical grounding. Our strategic roadmap aims to transform these limitations into the next engines of growth:

**Maximizing Token Efficiency via Universal RL Scaling.** We prioritize the principle that every unit of compute, during both training and inference, must contribute directly to intelligence density.

**以通用 RL scaling 最大化 token 效率.** 我们奉行一个原则: 训练与推理的每一单位算力, 都必须直接贡献于智能密度.

• **Shifting Compute from Pre-training to RL.** RL scaling demonstrates continuous, saturationfree performance leaps that pre-training alone cannot sustain. We intend to aggressively pivot computational resources toward RL. By scaling universally in both **depth** (sequential reasoning) and **width** (parallel exploration), we aim to uncover high-value perception and reasoning traces, pushing the upper bounds of multimodal intelligence for models of all scales.

• **把算力从预训练挪向 RL.** RL scaling 带来持续不饱和的性能跃升, 预训练独自撑不起. 我们打算把算力激进地转向 RL. 在**深度** (顺序推理) 与**宽度** (并行探索) 两个方向同时缩放, 挖掘高价值感知与推理轨迹, 把各规模模型的多模态智能上限往上推.

• **Optimizing Reasoning Density.** We aim to bridge the gap between the high performance of extensive search and the low latency of standard inference. Our goal is to **internalize** the benefits of parallel exploration and eliminate redundant “over-thinking.” We envision a regime that continuously compresses reasoning paths, transforming explicit, coordinated search into efficient sequentiality, and ultimately distilling these capabilities into instinctive, “System 1”-like responses.

• **优化推理密度.** 要在大搜索的高性能与标准推理的低延迟之间架桥. 目标是把并行探索的收益**内化**, 消掉冗余的"过度思考". 设想一种不断压缩推理路径的机制: 把显式协同搜索转成高效的顺序性, 最终蒸馏成本能的, 类似"System 1"的响应.

**Bridging the Reality Gap.** While the model excels in digital tasks, the "reality gap" remains the critical frontier. We posit that bridging this gap necessitates a paradigm shift: moving beyond passive data consumption to active physical grounding.

**弥合现实鸿沟.** 模型在数字任务上表现出色, 但"现实鸿沟"仍是关键前沿. 要跨过它, 范式必须转变: 从被动消费数据转向主动的物理 grounding.

• **From Semantic to Physical World Models.** We regard current text-based multi-agent synthesis as a foundational step—constructing a semantic world model. To achieve true embodiment, we must scale this synthesis to encompass massive video trajectories and sensorimotor action sequences. This unifies distinct modalities into a **holistic world model** that transcends linguistic logic to internalize physical causality and spatiotemporal dynamics.

• **从语义世界模型到物理世界模型.** 我们把当前基于文本的多智能体合成视为奠基一步: 构建语义世界模型. 要真正具身, 必须把这类合成扩展到海量视频轨迹与感觉运动动作序列, 把不同模态统一成超越语言逻辑的**整体世界模型**, 内化物理因果与时空动态.

• **Physics as the Ultimate Verifier.** Current multimodal RL often relies on static or noisy proxy labels. We intend to integrate high-fidelity simulation environments where rewards are strictly governed by immutable physical laws. This shifts the learning paradigm from **surface-level imitation to interaction-driven mastery**, grounding the model’s reasoning in verifiable causality rather than statistical correlation.

• **以物理为最终验证者.** 当前多模态 RL 常依赖静态或有噪的代理标签. 我们计划接入高保真仿真环境, 奖励由不可变的物理定律严格裁定. 学习范式随之从**表层模仿转向交互驱动的掌握**, 把模型推理建立在可验证的因果上, 而非统计相关.

• **Embodied Chain-of-Thought (E-CoT).** We envision extending the reasoning context to explicitly model temporal dynamics and physical state transitions. By training the model to articulate “physical intuition” via predicting dynamics prior to action, we aim to develop agents capable of robust long-horizon planning in dynamic, open-world environments.

• **具身 CoT (E-CoT).** 我们设想把推理上下文扩展为显式建模时间动态与物理状态转移. 训练模型在行动前先预测动态, 以此表达"物理直觉", 最终造出在动态开放世界里做稳健长程规划的 Agent.

<!-- page 21 of 50 -->

## References

aallail. Nyu-book-eval-eg2 dataset. URL [https://huggingface.co/datasets/aallail/nyu\_book\_eval\_eg2](https://huggingface.co/datasets/aallail/nyu_book_eval_eg2).

X. An, Y. Xie, K. Yang, W. Zhang, X. Zhao, Z. Cheng, Y. Wang, S. Xu, C. Chen, D. Zhu, et al. Llava-onevision-1.5: Fully open framework for democratized multimodal training. arXiv preprint arXiv:2509.23661, 2025.

R. K. Arora, J. Wei, R. S. Hicks, P. Bowman, J. Quiñonero-Candela, F. Tsimpourlas, M. Sharman, M. Shah, A. Vallone, A. Beutel, J. Heidecke, and K. Singhal. Healthbench: Evaluating large language models towards improved human health, 2025. URL [https://arxiv.org/abs/2505.08775](https://arxiv.org/abs/2505.08775).

S. Bai, Y. Cai, R. Chen, K. Chen, X. Chen, Z. Cheng, L. Deng, W. Ding, C. Gao, C. Ge, W. Ge, Z. Guo, Q. Huang, J. Huang, F. Huang, B. Hui, S. Jiang, Z. Li, M. Li, M. Li, K. Li, Z. Lin, J. Lin, X. Liu, J. Liu, C. Liu, Y. Liu, D. Liu, S. Liu, D. Lu, R. Luo, C. Lv, R. Men, L. Meng, X. Ren, X. Ren, S. Song, Y. Sun, J. Tang, J. Tu, J. Wan, P. Wang, P. Wang, Q. Wang, Y. Wang, T. Xie, Y. Xu, H. Xu, J. Xu, Z. Yang, M. Yang, J. Yang, A. Yang, B. Yu, F. Zhang, H. Zhang, X. Zhang, B. Zheng, H. Zhong, J. Zhou, F. Zhou, J. Zhou, Y. Zhu, and K. Zhu. Qwen3-vl technical report, 2025. URL [https://arxiv.org/abs/2511.21631](https://arxiv.org/abs/2511.21631).

E. Bakouch, L. Ben Allal, A. Lozhkov, N. Tazi, L. Tunstall, C. M. Patiño, E. Beeching, A. Roucher, A. J. Reedi, Q. Gallouédec, K. Rasul, N. Habib, C. Fourrier, H. Kydlicek, G. Penedo, H. Larcher, M. Morlon, V. Srivastav, J. Lochner, X.-S. Nguyen, C. Raffel, L. von Werra, and T. Wolf. SmolLM3: smol, multilingual, long-context reasoner. [https://huggingface.co/blog/smollm3](https://huggingface.co/blog/smollm3), 2025.

A. Ben Abacha, S. A. Hasan, V. V. Datla, J. Liu, D. Demner-Fushman, and H. Müller. Vqa-med: Overview of the medical visual question answering task at imageclef 2019. In Working Notes of CLEF 2019, volume 2380 of CEUR Workshop Proceedings, Lugano, Switzerland, September 9-12 2019. CEUR-WS.org. URL [https://ceur-ws.org/Vol-2380/paper\_272.pdf](https://ceur-ws.org/Vol-2380/paper_272.pdf).

J. Bernstein and L. Newhouse. Old optimizer, new norm: An anthology, 2024. URL [https://arxiv.org/abs/2409.20325](https://arxiv.org/abs/2409.20325).

D. Bolya, P.-Y. Huang, P. Sun, J. H. Cho, A. Madotto, C. Wei, T. Ma, J. Zhi, J. Rajasegaran, H. Rasheed, et al. Perception encoder: The best visual embeddings are not at the output of the network. arXiv preprint arXiv:2504.13181, 2025.

M. Byeon, B. Park, H. Kim, S. Lee, W. Baek, and S. Kim. Coyo-700m: Image-text pair dataset. [https://github.com/kakaobrain/coyo-dataset](https://github.com/kakaobrain/coyo-dataset), 2022.

ByteDance-Seed. Beyondaime: Advancing math reasoning evaluation beyond high school olympiads. [https://huggingface.co/datasets/ByteDance-Seed/BeyondAIME](https://huggingface.co/datasets/ByteDance-Seed/BeyondAIME), 2025.

M. Caron, I. Misra, J. Mairal, P. Goyal, P. Bojanowski, and A. Joulin. Unsupervised learning of visual features by contrasting cluster assignments, 2021. URL [https://arxiv.org/abs/2006.09882](https://arxiv.org/abs/2006.09882).

M. Chai, Z. Shen, C. Zhang, Y. Zhang, X. Wang, S. Dou, J. Kang, J. Zhang, and Q. Zhang. Docfusion: A unified framework for document parsing tasks, 2025. URL [https://arxiv.org/abs/2412.12505](https://arxiv.org/abs/2412.12505).

<!-- page 22 of 50 -->

J. Chen, L. Kong, H. Wei, C. Liu, Z. Ge, L. Zhao, J. Sun, C. Han, and X. Zhang. Onechart: Purify the chart structural extraction via one auxiliary token. In Proceedings of the 32nd ACM International Conference on Multimedia, pages 147–155, 2024a.

L. Chen, J. Li, X. Dong, P. Zhang, Y. Zang, Z. Chen, H. Duan, J. Wang, Y. Qiao, D. Lin, et al. Are we on the right way for evaluating large vision-language models? arXiv preprint arXiv:2403.20330, 2024b.

X. Cheng, W. Zhang, S. Zhang, J. Yang, X. Guan, X. Wu, X. Li, G. Zhang, J. Liu, Y. Mai, Y. Zeng, Z. Wen, K. Jin, B. Wang, W. Zhou, Y. Lu, T. Li, W. Huang, and Z. Li. Simplevqa: Multimodal factuality evaluation for multimodal large language models, 2025. URL [https://arxiv.org/abs/2502.13059](https://arxiv.org/abs/2502.13059).

W.-L. Chiang, L. Zheng, Y. Sheng, A. N. Angelopoulos, T. Li, D. Li, H. Zhang, B. Zhu, M. Jordan, J. E. Gonzalez, and I. Stoica. Chatbot arena: An open platform for evaluating llms by human preference, 2024.

C. Chou, L. Dunlap, K. Mashita, K. Mandal, T. Darrell, I. Stoica, J. E. Gonzalez, and W.-L. Chiang. Visionarena: 230k real world user-vlm conversations with preference labels. 2024. URL [https://arxiv.org/abs/2412.08687](https://arxiv.org/abs/2412.08687).

CNMO Committee. Chinese national mathematical olympiad (cnmo), 2024. Accessed: 2025.

CommonCrawl. Common crawl. URL [https://commoncrawl.org/](https://commoncrawl.org/).

C. Cui, T. Sun, M. Lin, T. Gao, Y. Zhang, J. Liu, X. Wang, Z. Zhang, C. Zhou, H. Liu, Y. Zhang, W. Lv, K. Huang, Y. Zhang, J. Zhang, J. Zhang, Y. Liu, D. Yu, and Y. Ma. Paddleocr 3.0 technical report, 2025a. URL [https://arxiv.org/abs/2507.05595](https://arxiv.org/abs/2507.05595).

G. Cui, Y. Zhang, J. Chen, L. Yuan, Z. Wang, Y. Zuo, H. Li, Y. Fan, H. Chen, W. Chen, et al. The entropy mechanism of reinforcement learning for reasoning language models. arXiv preprint arXiv:2505.22617, 2025b.

M. Deitke, C. Clark, S. Lee, R. Tripathi, Y. Yang, J. S. Park, M. Salehi, N. Muennighoff, K. Lo, L. Soldaini, J. Lu, T. Anderson, E. Bransom, K. Ehsani, H. Ngo, Y. Chen, A. Patel, M. Yatskar, C. Callison-Burch, A. Head, R. Hendrix, F. Bastani, E. VanderBilt, N. Lambert, Y. Chou, A. Chheda, J. Sparks, S. Skjonsberg, M. Schmitz, A. Sarnat, B. Bischoff, P. Walsh, C. Newell, P. Wolters, T. Gupta, K.-H. Zeng, J. Borchardt, D. Groeneveld, C. Nam, S. Lebrecht, C. Wittlif, C. Schoenick, O. Michel, R. Krishna, L. Weihs, N. A. Smith, H. Hajishirzi, R. Girshick, A. Farhadi, and A. Kembhavi. Molmo and pixmo: Open weights and open data for state-of-the-art vision-language models, 2024. URL [https://arxiv.org/abs/2409.17146](https://arxiv.org/abs/2409.17146).

S. Ding, S. Wu, X. Zhao, Y. Zang, H. Duan, X. Dong, P. Zhang, Y. Cao, D. Lin, and J. Wang. Mm-ifengine: Towards multimodal instruction following. arXiv preprint arXiv:2504.07957, 2025.

R.-Z. Fan, Z. Wang, and P. Liu. Megascience: Pushing the frontiers of post-training datasets for science reasoning. arXiv preprint arXiv:2507.16812, 2025.

X. Fu, Y. Hu, B. Li, Y. Feng, H. Wang, X. Lin, D. Roth, N. A. Smith, W.-C. Ma, and R. Krishna. Blink: Multimodal large language models can see but not perceive. In European Conference on Computer Vision, pages 148–166. Springer, 2024.

<!-- page 23 of 50 -->

T. Guan, F. Liu, X. Wu, R. Xian, Z. Li, X. Liu, X. Wang, L. Chen, F. Huang, Y. Yacoob, et al. Hallusionbench: an advanced diagnostic suite for entangled language hallucination and visual illusion in large vision-language models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 14375–14385, 2024.

E. Guha, R. Marten, S. Keh, N. Raoof, G. Smyrnis, H. Bansal, M. Nezhurina, J. Mercat, T. Vu, Z. Sprague, A. Suvarna, B. Feuer, L. Chen, Z. Khan, E. Frankel, S. Grover, C. Choi, N. Muennighoff, S. Su, W. Zhao, J. Yang, S. Pimpalgaonkar, K. Sharma, C. C.-J. Ji, Y. Deng, S. Pratt, V. Ramanujan, J. Saad-Falcon, J. Li, A. Dave, A. Albalak, K. Arora, B. Wulfe, C. Hegde, G. Durrett, S. Oh, M. Bansal, S. Gabriel, A. Grover, K.-W. Chang, V. Shankar, A. Gokaslan, M. A. Merrill, T. Hashimoto, Y. Choi, J. Jitsev, R. Heckel, M. Sathiamoorthy, A. G. Dimakis, and L. Schmidt. Openthoughts: Data recipes for reasoning models, 2025. URL [https://arxiv.org/abs/2506.04178](https://arxiv.org/abs/2506.04178).

D. Guo, F. Wu, F. Zhu, F. Leng, G. Shi, H. Chen, H. Fan, J. Wang, J. Jiang, J. Wang, et al. Seed1. 5-vl technical report. arXiv preprint arXiv:2505.07062, 2025a.

D. Guo, D. Yang, H. Zhang, J. Song, R. Zhang, R. Xu, Q. Zhu, S. Ma, P. Wang, X. Bi, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025b.

X. He, Y. Zhang, L. Mou, E. Xing, and P. Xie. Pathvqa: 30000+ questions for medical visual question answering. arXiv preprint arXiv:2003.10286, 2020.

HMMT. Hmmt 2025, 2025. URL [https://www.hmmt.org/](https://www.hmmt.org/). Accessed: 2025.

J. Hu, Y. Zhang, Q. Han, D. Jiang, X. Zhang, and H.-Y. Shum. Open-reasoner-zero: An open source approach to scaling up reinforcement learning on the base model. arXiv preprint arXiv:2503.24290, 2025.

J. Hu, Y. Zhang, S. Shang, X. Yang, Y. Peng, Z. Huang, H. Zhou, X. Wu, J. Cheng, F. Wan, X. Kong, C. Yao, K. Yan, A. Huang, H. Zhou, Q. Han, Z. Ge, D. Jiang, X. Zhang, and H.-Y. Shum. Pacore: Learning to scale test-time compute with parallel coordinated reasoning, 2026. URL [https://arxiv.org/abs/2601.05593](https://arxiv.org/abs/2601.05593).

N. Jain, K. Han, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv:2403.07974, 2024.

M. Jia, Z. Qi, S. Zhang, W. Zhang, X. Yu, J. He, H. Wang, and L. Yi. Omnispatial: Towards comprehensive spatial reasoning benchmark for vision language models, 2025. URL [https://arxiv.org/abs/2506.03135](https://arxiv.org/abs/2506.03135).

A. Jian, W. Qiu, X. Wang, P. Wang, Y. Hao, J. Pei, Y. Wei, Y. Peng, and X. Song. Csvqa: A chinese multimodal benchmark for evaluating stem reasoning capabilities of vlms, 2025. URL [https://arxiv.org/abs/2505.24120](https://arxiv.org/abs/2505.24120).

Kaggle. Fcs dataset. URL [https://www.kaggle.com/datasets/xuncngng/fsc147-0](https://www.kaggle.com/datasets/xuncngng/fsc147-0).

D. Kahneman. Thinking, fast and slow. Farrar, Straus and Giroux, 2011.

A. Kanade and T. Ganu. Do you see me : A multidimensional benchmark for evaluating visual perception in multimodal llms, 2025. URL [https://arxiv.org/abs/2506.02022](https://arxiv.org/abs/2506.02022).

<!-- page 24 of 50 -->

M. Kazemi, N. Dikkala, A. Anand, P. Devic, I. Dasgupta, F. Liu, B. Fatemi, P. Awasthi, D. Guo, S. Gollapudi, and A. Qureshi. Remi: A dataset for reasoning with multiple images, 2024. URL [https://arxiv.org/abs/2406.09175](https://arxiv.org/abs/2406.09175).

J. Keller. Muon: An optimizer for hidden layers in neural networks, 2024. URL [https://kellerjordan.github.io/posts/muon/](https://kellerjordan.github.io/posts/muon/).

A. Kembhavi, M. Salvato, E. Kolve, M. Seo, H. Hajishirzi, and A. Farhadi. A diagram is worth a dozen images, 2016. URL [https://arxiv.org/abs/1603.07396](https://arxiv.org/abs/1603.07396).

G. Kim, T. Hong, M. Yim, J. Nam, J. Park, J. Yim, W. Hwang, S. Yun, D. Han, and S. Park. Ocr-free document understanding transformer. In European Conference on Computer Vision (ECCV), 2022.

A. Kuznetsova, H. Rom, N. Alldrin, J. Uijlings, I. Krasin, J. Pont-Tuset, S. Kamali, S. Popov, M. Malloci, A. Kolesnikov, T. Duerig, and V. Ferrari. The open images dataset v4: Unified image classification, object detection, and visual relationship detection at scale. International Journal of Computer Vision, 128(7):1956–1981, Mar. 2020. ISSN 1573-1405. doi: 10.1007/s112 63-020-01316-z. URL [http://dx.doi.org/10.1007/s11263-020-01316-z](http://dx.doi.org/10.1007/s11263-020-01316-z).

H. Laurençon, L. Tronchon, and V. Sanh. Unlocking the conversion of web screenshots into html code with the websight dataset, 2024.

D. Li, H. Li, Z. Wang, Y. Yan, H. Zhang, S. Chen, G. Hou, S. Jiang, W. Zhang, Y. Shen, W. Lu, and Y. Zhuang. Viewspatial-bench: Evaluating multi-perspective spatial localization in vision-language models, 2025a. URL [https://arxiv.org/abs/2505.21500](https://arxiv.org/abs/2505.21500).

J. Li, D. Li, C. Xiong, and S. Hoi. Blip: Bootstrapping language-image pre-training for unified vision-language understanding and generation, 2022. URL [https://arxiv.org/abs/2201.12086](https://arxiv.org/abs/2201.12086).

J. LI, E. Beeching, L. Tunstall, B. Lipkin, R. Soletskyi, S. C. Huang, K. Rasul, L. Yu, A. Jiang, Z. Shen, Z. Qin, B. Dong, L. Zhou, Y. Fleureau, G. Lample, and S. Polu. Numinamath. [https://huggingface.co/AI-MO/NuminaMath-1.5](https://github.com/project-numina/aimo-progress-prize/blob/main/report/numina\_dataset.pdf),2024.

K. Li, Z. Meng, H. Lin, Z. Luo, Y. Tian, J. Ma, Z. Huang, and T.-S. Chua. Screenspot-pro: Gui grounding for professional high-resolution computer use, 2025b. URL [https://arxiv.org/abs/2504.07981](https://arxiv.org/abs/2504.07981).

L. Li, M. Bigverdi, J. Gu, Z. Ma, Y. Yang, Z. Li, Y. Choi, and R. Krishna. Unfolding spatial cognition: Evaluating multimodal models on visual simulations, 2025c. URL [https://arxiv.org/abs/2506.04633](https://arxiv.org/abs/2506.04633).

T. Li, W.-L. Chiang, E. Frick, L. Dunlap, T. Wu, B. Zhu, J. E. Gonzalez, and I. Stoica. From crowdsourced data to high-quality benchmarks: Arena-hard and benchbuilder pipeline, 2024. URL [https://arxiv.org/abs/2406.11939](https://arxiv.org/abs/2406.11939).

Y. Li, Q. Gao, T. Zhao, B. Wang, H. Sun, H. Lyu, R. D. Hawkins, N. Vasconcelos, T. Golan, D. Luo, and H. Deng. Core knowledge deficits in multi-modal language models, 2025d. URL [https://arxiv.org/abs/2410.10855](https://arxiv.org/abs/2410.10855).

<!-- page 25 of 50 -->

B. Y. Lin, Y. Deng, K. Chandu, F. Brahman, A. Ravichander, V. Pyatkin, N. Dziri, R. L. Bras, and Y. Choi. Wildbench: Benchmarking llms with challenging tasks from real users in the wild, 2024. URL [https://arxiv.org/abs/2406.04770](https://arxiv.org/abs/2406.04770).

T.-Y. Lin, M. Maire, S. Belongie, L. Bourdev, R. Girshick, J. Hays, P. Perona, D. Ramanan, C. L. Zitnick, and P. Dollár. Microsoft coco: Common objects in context, 2015. URL [https://arxiv.org/abs/1405.0312](https://arxiv.org/abs/1405.0312).

C. Liu, H. Wei, J. Chen, L. Kong, Z. Ge, Z. Zhu, L. Zhao, J. Sun, C. Han, and X. Zhang. Focus anywhere for fine-grained multi-page document understanding. arXiv preprint arXiv:2405.14295, 2024a.

J. Liu, J. Su, X. Yao, Z. Jiang, G. Lai, Y. Du, Y. Qin, W. Xu, E. Lu, J. Yan, Y. Chen, H. Zheng, Y. Liu, S. Liu, B. Yin, W. He, H. Zhu, Y. Wang, J. Wang, M. Dong, Z. Zhang, Y. Kang, H. Zhang, X. Xu, Y. Zhang, Y. Wu, X. Zhou, and Z. Yang. Muon is scalable for llm training, 2025a. URL [https://arxiv.org/abs/2502.16982](https://arxiv.org/abs/2502.16982).

X. Liu, W. Wang, Y. Yuan, J. tse Huang, Q. Liu, P. He, and Z. Tu. Insight over sight: Exploring the vision-knowledge conflicts in multimodal llms, 2025b. URL [https://arxiv.org/abs/2410.08145](https://arxiv.org/abs/2410.08145).

Y. Liu, H. Duan, Y. Zhang, B. Li, S. Zhang, W. Zhao, Y. Yuan, J. Wang, C. He, Z. Liu, et al. Mmbench: Is your multi-modal model an all-around player? In European conference on computer vision, pages 216–233. Springer, 2024b.

Y. Liu, Z. Li, M. Huang, B. Yang, W. Yu, C. Li, X.-C. Yin, C.-L. Liu, L. Jin, and X. Bai. Ocrbench: on the hidden mystery of ocr in large multimodal models. Science China Information Sciences, 67(12), Dec. 2024c. ISSN 1869-1919. doi: 10.1007/s11432-024-4235-6. URL [http://dx.doi.org/10.1007/s11432-024-4235-6](http://dx.doi.org/10.1007/s11432-024-4235-6).

I. Loshchilov and F. Hutter. Decoupled weight decay regularization. arXiv preprint arXiv:1711.05101, 2017.

P. Lu, H. Bansal, T. Xia, J. Liu, C. Li, H. Hajishirzi, H. Cheng, K.-W. Chang, M. Galley, and J. Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

T. Luong, D. Hwang, H. H. Nguyen, G. Ghiasi, Y. Chervonyi, I. Seo, J. Kim, G. Bingham, J. Lee, S. Mishra, A. Zhai, C. H. Hu, H. Michalewski, J. Kim, J. Ahn, J. Bae, X. Song, T. H. Trinh, Q. V. Le, and J. Jung. Towards robust mathematical reasoning, 2025. URL [https://arxiv.org/abs/2511.01846](https://arxiv.org/abs/2511.01846).

MAA. American invitational mathematics examination 2024, a.

MAA. American invitational mathematics examination 2025, b.

A. Masry, P. Kavehzadeh, X. L. Do, E. Hoque, and S. Joty. Unichart: A universal vision-language pretrained model for chart comprehension and reasoning, 2023.

L. Meng, J. Yang, R. Tian, X. Dai, Z. Wu, J. Gao, and Y.-G. Jiang. Deepstack: Deeply stacking visual tokens is surprisingly simple and effective for lmms. Advances in Neural Information Processing Systems, 37:23464–23487, 2024.

OmniAI. Omni ocr benchmark. URL [https://getomni.ai/blog/ocr-benchmark](https://getomni.ai/blog/ocr-benchmark).

<!-- page 26 of 50 -->

OpenAI. Introducing gpt-5.2, 2025a. URL [https://openai.com/index/introducing-gpt-5-2/](https://openai.com/index/introducing-gpt-5-2/).

OpenAI. Gpt-oss-120b and gpt-oss-20b model card. arXiv preprint arXiv:2508.10925, 2025b. URL [https://arxiv.org/abs/2508.10925](https://arxiv.org/abs/2508.10925).

OpenAI. Introducing openai o3 and o4-mini. [https://openai.com/index/introducing-o3-and-o4-mini/](https://openai.com/index/introducing-o3-and-o4-mini/), 2025c.

L. Ouyang, Y. Qu, H. Zhou, J. Zhu, R. Zhang, Q. Lin, B. Wang, Z. Zhao, M. Jiang, X. Zhao, J. Shi, F. Wu, P. Chu, M. Liu, Z. Li, C. Xu, B. Zhang, B. Shi, Z. Tu, and C. He. Omnidocbench: Benchmarking diverse pdf document parsing with comprehensive annotations, 2024. URL [https://arxiv.org/abs/2412.07626](https://arxiv.org/abs/2412.07626).

R. Paiss, A. Ephrat, O. Tov, S. Zada, I. Mosseri, M. Irani, and T. Dekel. Teaching clip to count to ten, 2023. URL [https://arxiv.org/abs/2302.12066](https://arxiv.org/abs/2302.12066).

J. Poznanski, A. Rangapur, J. Borchardt, J. Dunkelberger, R. Huff, D. Lin, A. Rangapur, C. Wilhelm, K. Lo, and L. Soldaini. olmocr: Unlocking trillions of tokens in pdfs with vision language models, 2025. URL [https://arxiv.org/abs/2502.18443](https://arxiv.org/abs/2502.18443).

V. Pyatkin, S. Malik, V. Graf, H. Ivison, S. Huang, P. Dasigi, N. Lambert, and H. Hajishirzi. Generalizing verifiable instruction following, 2025.

Y. Qian, H. Ye, J.-P. Fauconnier, P. Grasch, Y. Yang, and Z. Gan. Mia-bench: Towards better instruction following evaluation of multimodal llms, 2025. URL [https://arxiv.org/abs/2407.01509](https://arxiv.org/abs/2407.01509).

R. Qiao, Q. Tan, G. Dong, M. Wu, C. Sun, X. Song, Z. GongQue, S. Lei, Z. Wei, M. Zhang, et al. We-math: Does your large multimodal model achieve human-like mathematical reasoning? arXiv preprint arXiv:2407.01284, 2024.

A. Radford, J. W. Kim, C. Hallacy, A. Ramesh, G. Goh, S. Agarwal, G. Sastry, A. Askell, P. Mishkin, J. Clark, G. Krueger, and I. Sutskever. Learning transferable visual models from natural language supervision, 2021. URL [https://arxiv.org/abs/2103.00020](https://arxiv.org/abs/2103.00020).

D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark. arXiv preprint arXiv:2311.12022, 2023.

S. Ren, K. He, R. Girshick, and J. Sun. Faster r-cnn: Towards real-time object detection with region proposal networks, 2016. URL [https://arxiv.org/abs/1506.01497](https://arxiv.org/abs/1506.01497).

J. Roberts, M. R. Taesiri, A. Sharma, A. Gupta, S. Roberts, I. Croitoru, S.-V. Bogolin, J. Tang, F. Langer, V. Raina, V. Raina, H. Xiong, V. Udandarao, J. Lu, S. Chen, S. Purkis, T. Yan, W. Lin, G. Shin, Q. Yang, A. T. Nguyen, D. I. Atkinson, A. Baranwal, A. Coca, M. Dang, S. Dziadzio, J. D. Kunz, K. Liang, A. Lo, B. Pulfer, S. Walton, C. Yang, K. Han, and S. Albanie. Zerobench: An impossible visual benchmark for contemporary large multimodal models, 2025. URL [https://arxiv.org/abs/2502.09696](https://arxiv.org/abs/2502.09696).

SakiRinn. Locount dataset. URL [https://github.com/SakiRinn/mmdetection-locount](https://github.com/SakiRinn/mmdetection-locount).

C. Schuhmann, R. Beaumont, R. Vencu, C. Gordon, R. Wightman, M. Cherti, T. Coombes, A. Katta, C. Mullis, M. Wortsman, P. Schramowski, S. Kundurthy, K. Crowson, L. Schmidt, R. Kaczmarczyk, and J. Jitsev. Laion-5b: An open large-scale dataset for training next generation image-text models, 2022. URL [https://arxiv.org/abs/2210.08402](https://arxiv.org/abs/2210.08402).

<!-- page 27 of 50 -->

J. Schulman, P. Moritz, S. Levine, M. Jordan, and P. Abbeel. High-dimensional continuous control using generalized advantage estimation. arXiv preprint arXiv:1506.02438, 2015.

J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv:1707.06347, 2017.

J. Shah, G. Bikshandi, Y. Zhang, V. Thakkar, P. Ramani, and T. Dao. Flashattention-3: Fast and accurate attention with asynchrony and low-precision. Advances in Neural Information Processing Systems, 37:68658–68685, 2024.

H. Shen, T. Wu, Q. Han, Y. Hsieh, J. Wang, Y. Zhang, Y. Cheng, Z. Hao, Y. Ni, X. Wang, et al. Phyx: Does your model have the" wits" for physical reasoning? arXiv preprint arXiv:2505.15929, 2025.

B. Shi, C. Yao, M. Liao, M. Yang, P. Xu, L. Cui, S. Belongie, S. Lu, and X. Bai. Icdar2017 competition on reading chinese text in the wild (rctw-17). In 2017 14th iapr international conference on document analysis and recognition (ICDAR), volume 1, pages 1429–1434. IEEE, 2017.

C. Si, Y. Zhang, R. Li, Z. Yang, R. Liu, and D. Yang. Design2code: Benchmarking multimodal code generation for automated front-end engineering, 2025. URL [https://arxiv.org/abs/2403.03163](https://arxiv.org/abs/2403.03163).

O. Siméoni, H. V. Vo, M. Seitzer, F. Baldassarre, M. Oquab, C. Jose, V. Khalidov, M. Szafraniec, S. Yi, M. Ramamonjisoa, F. Massa, D. Haziza, L. Wehrstedt, J. Wang, T. Darcet, T. Moutakanni, L. Sentana, C. Roberts, A. Vedaldi, J. Tolan, J. Brandt, C. Couprie, J. Mairal, H. Jégou, P. Labatut, and P. Bojanowski. Dinov3, 2025. URL [https://arxiv.org/abs/2508.10104](https://arxiv.org/abs/2508.10104).

V. Sirdeshmukh, K. Deshpande, J. Mols, L. Jin, E.-Y. Cardona, D. Lee, J. Kritz, W. Primack, S. Yue, and C. Xing. Multichallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier llms, 2025. URL [https://arxiv.org/abs/2501.17399](https://arxiv.org/abs/2501.17399).

W. Song, Y. Li, J. Xu, G. Wu, L. Ming, K. Yi, W. Luo, H. Li, Y. Du, F. Guo, and K. Yu. M3gia: A cognition inspired multilingual and multimodal general intelligence ability benchmark, 2024. URL [https://arxiv.org/abs/2406.05343](https://arxiv.org/abs/2406.05343).

J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

H. R. Sujet AI, Allaa Boutaleb. Sujet-finance-qa-vision-100k: A large-scale dataset for financial document vqa, 2024. URL [https://huggingface.co/datasets/sujet-ai/Sujet-Finance-QA-Vision-100k](https://huggingface.co/datasets/sujet-ai/Sujet-Finance-QA-Vision-100k).

J. S. Tamarapalli, R. Grover, N. Pande, and S. Yerramilli. Countqa: How well do mllms count in the wild?, 2025. URL [https://arxiv.org/abs/2508.06585](https://arxiv.org/abs/2508.06585).

K. Tang, W.-L. Chiang, and A. N. Angelopoulos. Arena explorer: A topic modeling pipeline for llm evals & analytics, 2025.

C. Team, Z. Yue, Z. Lin, Y. Song, W. Wang, S. Ren, S. Gu, S. Li, P. Li, L. Zhao, L. Li, K. Bao, H. Tian, H. Zhang, G. Wang, D. Zhu, Cici, C. He, B. Ye, B. Shen, Z. Zhang, Z. Jiang, Z. Zheng, Z. Song, Z. Luo, Y. Yu, Y. Wang, Y. Tian, Y. Tu, Y. Yan, Y. Huang, X. Wang, X. Xu, X. Song, X. Zhang, X. Yong, X. Zhang, X. Deng, W. Yang, W. Ma, W. Lv, W. Zhuang, W. Liu, S. Deng, S. Liu, S. Chen, S. Yu, S. Liu, S. Wang, R. Ma, Q. Wang, P. Wang, N. Chen, M. Zhu, K. Zhou, K. Zhou, K. Fang, J. Shi, J. Dong, J. Xiao, J. Xu, H. Liu, H. Xu, H. Qu, H. Zhao, H. Lv, G. Wang,

<!-- page 28 of 50 -->

D. Zhang, D. Zhang, D. Zhang, C. Ma, C. Liu, C. Cai, and B. Xia. Mimo-vl technical report, 2025a. URL [https://arxiv.org/abs/2506.03569](https://arxiv.org/abs/2506.03569).

G. Team. Gemini 2.5: Pushing the frontier with advanced reasoning, multimodality, long context, and next generation agentic capabilities, 2025a. URL [https://arxiv.org/abs/2507.06261](https://arxiv.org/abs/2507.06261).

G. Team. Gemini 3 pro: the frontier of vision ai, 2025b. URL [https://blog.google/technology/developers/gemini-3-pro-vision/](https://blog.google/technology/developers/gemini-3-pro-vision/).

G. R. Team, S. Abeyruwan, J. Ainslie, J.-B. Alayrac, M. G. Arenas, T. Armstrong, A. Balakrishna, R. Baruch, M. Bauza, M. Blokzijl, S. Bohez, K. Bousmalis, A. Brohan, T. Buschmann, A. Byravan, S. Cabi, K. Caluwaerts, F. Casarini, O. Chang, J. E. Chen, X. Chen, H.-T. L. Chiang, K. Choromanski, D. D’Ambrosio, S. Dasari, T. Davchev, C. Devin, N. D. Palo, T. Ding, A. Dostmohamed, D. Driess, Y. Du, D. Dwibedi, M. Elabd, C. Fantacci, C. Fong, E. Frey, C. Fu, M. Giustina, K. Gopalakrishnan, L. Graesser, L. Hasenclever, N. Heess, B. Hernaez, A. Herzog, R. A. Hofer, J. Humplik, A. Iscen, M. G. Jacob, D. Jain, R. Julian, D. Kalashnikov, M. E. Karagozler, S. Karp, C. Kew, J. Kirkland, S. Kirmani, Y. Kuang, T. Lampe, A. Laurens, I. Leal, A. X. Lee, T.-W. E. Lee, J. Liang, Y. Lin, S. Maddineni, A. Majumdar, A. H. Michaely, R. Moreno, M. Neunert, F. Nori, C. Parada, E. Parisotto, P. Pastor, A. Pooley, K. Rao, K. Reymann, D. Sadigh, S. Saliceti, P. Sanketi, P. Sermanet, D. Shah, M. Sharma, K. Shea, C. Shu, V. Sindhwani, S. Singh, R. Soricut, J. T. Springenberg, R. Sterneck, R. Surdulescu, J. Tan, J. Tompson, V. Vanhoucke, J. Varley, G. Vesom, G. Vezzani, O. Vinyals, A. Wahid, S. Welker, P. Wohlhart, F. Xia, T. Xiao, A. Xie, J. Xie, P. Xu, S. Xu, Y. Xu, Z. Xu, Y. Yang, R. Yao, S. Yaroshenko, W. Yu, W. Yuan, J. Zhang, T. Zhang, A. Zhou, and Y. Zhou. Gemini robotics: Bringing ai into the physical world, 2025b. URL [https://arxiv.org/abs/2503.20020](https://arxiv.org/abs/2503.20020).

H. Team. Humanity’s last exam, 2025c. URL [https://arxiv.org/abs/2501.14249](https://arxiv.org/abs/2501.14249).

M.-A.-P. Team, X. Du, Y. Yao, K. Ma, B. Wang, T. Zheng, K. Zhu, M. Liu, Y. Liang, X. Jin, Z. Wei, C. Zheng, K. Deng, S. Guo, S. Jia, S. Jiang, Y. Liao, R. Li, Q. Li, S. Li, Y. Li, Y. Li, D. Ma, Y. Ni, H. Que, Q. Wang, Z. Wen, S. Wu, T. Xing, M. Xu, Z. Yang, Z. M. Wang, J. Zhou, Y. Bai, X. Bu, C. Cai, L. Chen, Y. Chen, C. Cheng, T. Cheng, K. Ding, S. Huang, Y. Huang, Y. Li, Y. Li, Z. Li, T. Liang, C. Lin, H. Lin, Y. Ma, Z. Peng, Z. Peng, Q. Qi, S. Qiu, X. Qu, Y. Tan, Z. Wang, C. Wang, H. Wang, Y. Wang, Y. Wang, J. Xu, K. Yang, R. Yuan, Y. Yue, T. Zhan, C. Zhang, J. Zhang, X. Zhang, X. Zhang, Y. Zhang, Y. Zhao, X. Zheng, C. Zhong, Y. Gao, Z. Li, D. Liu, Q. Liu, T. Liu, S. Ni, J. Peng, Y. Qin, W. Su, G. Wang, S. Wang, J. Yang, M. Yang, M. Cao, X. Yue, Z. Zhang, W. Zhou, J. Liu, Q. Lin, W. Huang, and G. Zhang. Supergpqa: Scaling llm evaluation across 285 graduate disciplines, 2025c. URL [https://arxiv.org/abs/2502.14739](https://arxiv.org/abs/2502.14739).

S. Team. Step-3 is large yet affordable: Model-system co-design for cost-effective decoding, 2025d. URL [https://arxiv.org/abs/2507.19427](https://arxiv.org/abs/2507.19427).

V. Team, W. Hong, W. Yu, X. Gu, G. Wang, G. Gan, H. Tang, J. Cheng, J. Qi, J. Ji, L. Pan, S. Duan, W. Wang, Y. Wang, Y. Cheng, Z. He, Z. Su, Z. Yang, Z. Pan, A. Zeng, B. Wang, B. Chen, B. Shi, C. Pang, C. Zhang, D. Yin, F. Yang, G. Chen, J. Xu, J. Zhu, J. Chen, J. Chen, J. Chen, J. Lin, J. Wang, J. Chen, L. Lei, L. Gong, L. Pan, M. Liu, M. Xu, M. Zhang, Q. Zheng, S. Yang, S. Zhong, S. Huang, S. Zhao, S. Xue, S. Tu, S. Meng, T. Zhang, T. Luo, T. Hao, T. Tong, W. Li, W. Jia, X. Liu, X. Zhang, X. Lyu, X. Fan, X. Huang, Y. Wang, Y. Xue, Y. Wang, Y. Wang, Y. An, Y. Du, Y. Shi, Y. Huang, Y. Niu, Y. Wang, Y. Yue, Y. Li, Y. Zhang, Y. Wang, Y. Wang, Y. Zhang, Z. Xue, Z. Hou, Z. Du, Z. Wang, P. Zhang, D. Liu, B. Xu, J. Li, M. Huang, Y. Dong, and J. Tang. Glm-4.5v and glm-4.1v-thinking: Towards versatile multimodal reasoning with scalable reinforcement learning, 2025d. URL [https://arxiv.org/abs/2507.01006](https://arxiv.org/abs/2507.01006).

<!-- page 29 of 50 -->

P. Tong, E. Brown, P. Wu, S. Woo, A. J. V. IYER, S. C. Akula, S. Yang, J. Yang, M. Middepogu, Z. Wang, et al. Cambrian-1: A fully open, vision-centric exploration of multimodal llms. Advances in Neural Information Processing Systems, 37:87310–87356, 2024a.

S. Tong, E. Brown, P. Wu, S. Woo, M. Middepogu, S. C. Akula, J. Yang, S. Yang, A. Iyer, X. Pan, Z. Wang, R. Fergus, Y. LeCun, and S. Xie. Cambrian-1: A fully open, vision-centric exploration of multimodal llms, 2024b. URL [https://arxiv.org/abs/2406.16860](https://arxiv.org/abs/2406.16860).

S. Tong, Z. Liu, Y. Zhai, Y. Ma, Y. LeCun, and S. Xie. Eyes wide shut? exploring the visual shortcomings of multimodal llms, 2024c. URL [https://arxiv.org/abs/2401.06209](https://arxiv.org/abs/2401.06209).

B. Wang, C. Xu, X. Zhao, L. Ouyang, F. Wu, Z. Zhao, R. Xu, K. Liu, Y. Qu, F. Shang, B. Zhang, L. Wei, Z. Sui, W. Li, B. Shi, Y. Qiao, D. Lin, and C. He. Mineru: An open-source solution for precise document content extraction, 2024a. URL [https://arxiv.org/abs/2409.18839](https://arxiv.org/abs/2409.18839).

K. Wang, J. Pan, W. Shi, Z. Lu, M. Zhan, and H. Li. Measuring multimodal mathematical reasoning with math-vision dataset, 2024b. URL [https://arxiv.org/abs/2402.14804](https://arxiv.org/abs/2402.14804).

S. Wang, L. Sun, C. Deng, K. Shao, M. Pei, Z. Tian, H. Zhang, and J. Wang. Spatialviz-bench: Automatically generated spatial visualization reasoning tasks for mllms. arXiv e-prints, pages arXiv–2507, 2025a.

W. Wang, Z. Gao, L. Gu, H. Pu, L. Cui, X. Wei, Z. Liu, L. Jing, S. Ye, J. Shao, Z. Wang, Z. Chen, H. Zhang, G. Yang, H. Wang, Q. Wei, J. Yin, W. Li, E. Cui, G. Chen, Z. Ding, C. Tian, Z. Wu, J. Xie, Z. Li, B. Yang, Y. Duan, X. Wang, Z. Hou, H. Hao, T. Zhang, S. Li, X. Zhao, H. Duan, N. Deng, B. Fu, Y. He, Y. Wang, C. He, B. Shi, J. He, Y. Xiong, H. Lv, L. Wu, W. Shao, K. Zhang, H. Deng, B. Qi, J. Ge, Q. Guo, W. Zhang, S. Zhang, M. Cao, J. Lin, K. Tang, J. h. Gao, H. Huang, Y. Gu, C. Lyu, H. Tang, R. Wang, H. Lv, W. Ouyang, L. Wang, M. Dou, X. Zhu, T. Lu, D. Lin, J. Dai, W. Su, B. Zhou, K. Chen, Y. Qiao, W. Wang, and G. Luo. Internvl3.5: Advancing open-source multimodal models in versatility, reasoning, and efficiency. arXiv preprint arXiv:2508.18265, 2025b.

X. Wang, Z. Wu, J. Xie, Z. Ding, B. Yang, Z. Li, Z. Liu, Q. Li, X. Dong, Z. Chen, W. Wang, X. Zhao, J. Chen, H. Duan, T. Xie, C. Yang, S. Su, Y. Yu, Y. Huang, Y. Liu, X. Zhang, Y. Zhang, X. Yue, W. Su, X. Zhu, W. Shen, J. Dai, and W. Wang. Mmbench-gui: Hierarchical multi-platform evaluation framework for gui agents, 2025c. URL [https://arxiv.org/abs/2507.19478](https://arxiv.org/abs/2507.19478).

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, T. Li, M. Ku, K. Wang, A. Zhuang, R. Fan, X. Yue, and W. Chen. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In Advances in Neural Information Processing Systems, NeurIPS 2024, 2024c.

Z. Wang, M. Xia, L. He, H. Chen, Y. Liu, R. Zhu, K. Liang, X. Wu, H. Liu, S. Malladi, A. Chevalier, S. Arora, and D. Chen. Charxiv: Charting gaps in realistic chart understanding in multimodal llms, 2024d. URL [https://arxiv.org/abs/2406.18521](https://arxiv.org/abs/2406.18521).

Z. Wang, F. Zhou, X. Li, and P. Liu. Octothinker: Mid-training incentivizes reinforcement learning scaling. arXiv preprint arXiv:2506.20512, 2025d.

H. Wei, C. Liu, J. Chen, J. Wang, L. Kong, Y. Xu, Z. Ge, L. Zhao, J. Sun, Y. Peng, et al. General ocr theory: Towards ocr-2.0 via a unified end-to-end model. arXiv preprint arXiv:2409.01704, 2024.

<!-- page 30 of 50 -->

H. Wei, Y. Sun, and Y. Li. Deepseek-ocr: Contexts optical compression, 2025a. URL [https://arxiv.org/abs/2510.18234](https://arxiv.org/abs/2510.18234).

Y. Wei, L. Zhao, K. Lin, E. Yu, Y. Peng, R. Dong, J. Sun, H. Wei, Z. Ge, X. Zhang, et al. Perception in reflection. arXiv preprint arXiv:2504.07165, 2025b.

Y. Wei, L. Zhao, J. Sun, K. Lin, J. Yin, J. Hu, Y. Zhang, E. Yu, H. Lv, Z. Weng, et al. Open vision reasoner: Transferring linguistic cognitive behavior for visual reasoning. arXiv preprint arXiv:2507.05255, 2025c.

C. White, S. Dooley, M. Roberts, A. Pal, B. Feuer, S. Jain, R. Shwartz-Ziv, N. Jain, K. Saifullah, S. Dey, Shubh-Agrawal, S. S. Sandha, S. V. Naidu, C. Hegde, Y. LeCun, T. Goldstein, W. Neiswanger, and M. Goldblum. Livebench: A challenging, contamination-free LLM benchmark. In The Thirteenth International Conference on Learning Representations, 2025.

L. Wiedmann, O. Zohar, A. Mahla, X. Wang, R. Li, T. Frere, L. von Werra, A. R. Gosthipaty, and A. Marafioti. Finevision: Open data is all you need. arXiv preprint arXiv:2510.17269, 2025.

P. Wu and S. Xie. V\*: Guided visual search as a core mechanism in multimodal llms. arXiv preprint arXiv:2312.14135, 2023.

Z. Wu, Z. Wu, F. Xu, Y. Wang, Q. Sun, C. Jia, K. Cheng, Z. Ding, L. Chen, P. P. Liang, et al. Os-atlas: A foundation action model for generalist gui agents. arXiv preprint arXiv:2410.23218, 2024.

X.AI. Grok-2 beta release. [https://x.ai/blog/grok-2](https://x.ai/blog/grok-2), 2024. Accessed on: 2024-07-02.

R. Xia, B. Zhang, H. Peng, H. Ye, X. Yan, P. Ye, B. Shi, J. Yan, and Y. Qiao. Structchart: Perception, structuring, reasoning for visual chart understanding. arXiv preprint arXiv:2309.11268, 2023.

Y. Xiao, E. Sun, T. Liu, and W. Wang. Logicvista: Multimodal llm logical reasoning benchmark in visual contexts, 2024. URL [https://arxiv.org/abs/2407.04973](https://arxiv.org/abs/2407.04973).

C. Xie, H. Cai, J. Li, F. Kong, X. Wu, J. Song, H. Morimitsu, L. Yao, D. Wang, X. Zhang, D. Leng, B. Zhang, X. Ji, and Y. Deng. Ccmb: A large-scale chinese cross-modal benchmark. In Proceedings of the 31st ACM International Conference on Multimedia, page 4219–4227. ACM, Oct. 2023. doi: 10.1145/3581783.3611877. URL [http://dx.doi.org/10.1145/3581783.3611877](http://dx.doi.org/10.1145/3581783.3611877).

T. Xie, J. Deng, X. Li, J. Yang, H. Wu, J. Chen, W. Hu, X. Wang, Y. Xu, Z. Wang, Y. Xu, J. Wang, D. Sahoo, T. Yu, and C. Xiong. Scaling computer-use grounding via user interface decomposition and synthesis, 2025. URL [https://arxiv.org/abs/2505.13227](https://arxiv.org/abs/2505.13227).

W. Xu, J. Wang, W. Wang, Z. Chen, W. Zhou, A. Yang, L. Lu, H. Li, X. Wang, X. Zhu, W. Wang, J. Dai, and J. Zhu. Visulogic: A benchmark for evaluating visual reasoning in multi-modal large language models, 2025. URL [https://arxiv.org/abs/2504.15279](https://arxiv.org/abs/2504.15279).

H. Yan, J. Wang, X. Huang, Y. Shen, Z. Meng, Z. Fan, K. Tan, J. Gao, L. Shi, M. Yang, et al. Step-gui technical report. arXiv preprint arXiv:2512.15431, 2025.

A. Yang, A. Li, B. Yang, B. Zhang, B. Hui, B. Zheng, B. Yu, C. Gao, C. Huang, C. Lv, C. Zheng, D. Liu, F. Zhou, F. Huang, F. Hu, H. Ge, H. Wei, H. Lin, J. Tang, J. Yang, J. Tu, J. Zhang, J. Yang, J. Yang, J. Zhou, J. Zhou, J. Lin, K. Dang, K. Bao, K. Yang, L. Yu, L. Deng, M. Li, M. Xue, M. Li, P. Zhang, P. Wang, Q. Zhu, R. Men, R. Gao, S. Liu, S. Luo, T. Li, T. Tang, W. Yin, X. Ren, X. Wang, X. Zhang, X. Ren, Y. Fan, Y. Su, Y. Zhang, Y. Zhang, Y. Wan, Y. Liu, Z. Wang, Z. Cui, Z. Zhang, Z. Zhou, and Z. Qiu. Qwen3 technical report, 2025a. URL [https://arxiv.org/abs/2505.09388](https://arxiv.org/abs/2505.09388).

<!-- page 31 of 50 -->

S. Yang, R. Xu, Y. Xie, S. Yang, M. Li, J. Lin, C. Zhu, X. Chen, H. Duan, X. Yue, D. Lin, T. Wang, and J. Pang. Mmsi-bench: A benchmark for multi-image spatial intelligence, 2025b. URL [https://arxiv.org/abs/2505.23764](https://arxiv.org/abs/2505.23764).

Y. Yang, A. Patel, M. Deitke, T. Gupta, L. Weihs, A. Head, M. Yatskar, C. Callison-Burch, R. Krishna, A. Kembhavi, and C. Clark. Scaling text-rich image understanding via code-guided synthetic multimodal data generation, 2025c. URL [https://arxiv.org/abs/2502.14846](https://arxiv.org/abs/2502.14846).

Z. Yang, J. Tang, Z. Li, P. Wang, J. Wan, H. Zhong, X. Liu, M. Yang, P. Wang, S. Bai, L. Jin, and J. Lin. Cc-ocr: A comprehensive and challenging ocr benchmark for evaluating large multimodal models in literacy, 2024. URL [https://arxiv.org/abs/2412.02210](https://arxiv.org/abs/2412.02210).

C. Yao, X. Bai, W. Liu, Y. Ma, and Z. Tu. Detecting texts of arbitrary orientations in natural images. 2012. URL [https://pages.ucsd.edu/\~ztu/publication/cvpr12\_textdetection.pdf](https://pages.ucsd.edu/~ztu/publication/cvpr12_textdetection.pdf).

F. Yao, L. Liu, D. Zhang, C. Dong, J. Shang, and J. Gao. Your efficient rl framework secretly brings you off-policy rl training, Aug. 2025. URL [https://fengyao.notion.site/off-policy-rl](https://fengyao.notion.site/off-policy-rl).

C.-H. Yeh, C. Wang, S. Tong, T.-Y. Cheng, R. Wang, T. Chu, Y. Zhai, Y. Chen, S. Gao, and Y. Ma. Seeing from another perspective: Evaluating multi-view understanding in mllms, 2025. URL [https://arxiv.org/abs/2504.15280](https://arxiv.org/abs/2504.15280).

B. Yin, Q. Wang, P. Zhang, J. Zhang, K. Wang, Z. Wang, J. Zhang, K. Chandrasegaran, H. Liu, R. Krishna, S. Xie, M. Li, J. Wu, and L. Fei-Fei. Spatial mental modeling from limited views, 2025. URL [https://arxiv.org/abs/2506.21458](https://arxiv.org/abs/2506.21458).

K. Ying, F. Meng, J. Wang, Z. Li, H. Lin, Y. Yang, H. Zhang, W. Zhang, Y. Lin, S. Liu, J. Lei, Q. Lu, R. Chen, P. Xu, R. Zhang, H. Zhang, P. Gao, Y. Wang, Y. Qiao, P. Luo, K. Zhang, and W. Shao. Mmt-bench: A comprehensive multimodal benchmark for evaluating large vision-language models towards multitask agi, 2024. URL [https://arxiv.org/abs/2404.16006](https://arxiv.org/abs/2404.16006).

E. Yu, L. Zhao, Y. Wei, J. Yang, D. Wu, L. Kong, H. Wei, T. Wang, Z. Ge, X. Zhang, et al. Merlin: Empowering multimodal llms with foresight minds. In European Conference on Computer Vision, pages 425–443. Springer, 2024.

E. Yu, K. Lin, L. Zhao, Y. Wei, Z. Zhu, H. Wei, J. Sun, Z. Ge, X. Zhang, J. Wang, et al. Unhackable temporal rewarding for scalable video mllms. arXiv preprint arXiv:2502.12081, 2025a.

E. Yu, K. Lin, L. Zhao, J. Yin, Y. Wei, Y. Peng, H. Wei, J. Sun, C. Han, Z. Ge, et al. Perception-r1: Pioneering perception policy with reinforcement learning. arXiv preprint arXiv:2504.07954, 2025b.

Y. Yuan, X. Liu, W. Dikubab, H. Liu, Z. Ji, Z. Wu, and X. Bai. Syntax-aware network for handwritten mathematical expression recognition. arXiv preprint arXiv:2203.01601, 2022.

X. Yue, Y. Ni, K. Zhang, T. Zheng, R. Liu, G. Zhang, S. Stevens, D. Jiang, W. Ren, Y. Sun, et al. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9556–9567, 2024.

Y. Yue, Z. Chen, R. Lu, A. Zhao, Z. Wang, S. Song, and G. Huang. Does reinforcement learning really incentivize reasoning capacity in llms beyond the base model? arXiv preprint arXiv:2504.13837, 2025.

<!-- page 32 of 50 -->

R. Zellers, Y. Bisk, A. Farhadi, and Y. Choi. From recognition to cognition: Visual commonsense reasoning, 2019. URL [https://arxiv.org/abs/1811.10830](https://arxiv.org/abs/1811.10830).

F. Zhang, L. Wu, H. Bai, G. Lin, X. Li, X. Yu, Y. Wang, B. Chen, and J. Keung. Humaneval-v: Benchmarking high-level visual reasoning with complex diagrams in coding tasks, 2025. URL [https://arxiv.org/abs/2410.12381](https://arxiv.org/abs/2410.12381).

R. Zhang, D. Jiang, Y. Zhang, H. Lin, Z. Guo, P. Qiu, A. Zhou, P. Lu, K.-W. Chang, P. Gao, and H. Li. Mathverse: Does your multi-modal llm truly see the diagrams in visual math problems?, 2024. URL [https://arxiv.org/abs/2403.14624](https://arxiv.org/abs/2403.14624).

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instruction-following evaluation for large language models, 2023. URL [https://arxiv.org/abs/2311.07911](https://arxiv.org/abs/2311.07911).

C. Zou, X. Guo, R. Yang, J. Zhang, B. Hu, and H. Zhang. Dynamath: A dynamic visual benchmark for evaluating mathematical reasoning robustness of vision language models, 2024.

<!-- page 33 of 50 -->

## 7. Author List

All authors are listed in alphabetical order by their first names. <sup>†</sup>indicates project leaders.

**Core Contributors** Ailin Huang, Chengyuan Yao, Chunrui Han, Fanqi Wan, Hangyu Guo, Haoran Lv, Hongyu Zhou, Jia Wang, Jian Zhou, Jianjian Sun†, Jingcheng Hu, Kangheng Lin, Liang Zhao†, Mitt Huang, Song Yuan, Wenwen Qu, Xiangfeng Wang, Yanlin Lai, Yingxiu Zhao, Yinmin Zhang, Yukang Shi, Yuyang Chen, Zejia Weng, Ziyang Meng

**Contributors** Ang Li, Aobo Kong, Bo Dong, Changyi Wan, David Wang, Di Qi, Dingming Li, En Yu, Guopeng Li, Haiquan Yin, Han Zhou, Hanshan Zhang, Haolong Yan, Hebin Zhou, Hongbo Peng, Jiaran Zhang, Jiashu Lv, Jiayi Fu, Jie Cheng, Jie Zhou, Jisheng Yin, Jingjing Xie, Jingwei Wu, Jun Zhang, Junfeng Liu, Kaijun Tan, Kaiwen Yan, Liangyu Chen, Lina Chen, Mingliang Li, Qian Zhao, Quan Sun, Shaoliang Pang, Shengjie Fan, Shijie Shang, Siyuan Zhang, Tianhao You, Wei Ji, Wuxun Xie, Xiaobo Yang, Xiaojie Hou, Xiaoran Jiao, Xiaoxiao Ren, Xiangwen Kong, Xin Huang, Xin Wu, Xing Chen, Xinran Wang, Xuelin Zhang, Yana Wei, Yang Li, Yanming Xu, Yeqing Shen, Yuang Peng, Yue Peng, Yu Zhou, Yusheng Li, Yuxiang Yang, Yuyang Zhang, Zhe Xie, Zhewei Huang, Zhenyi Lu, Zhimin Fan, Zihui Cheng

**Sponsors** Daxin Jiang, Qi Han, Xiangyu Zhang, Yibo Zhu, Zheng Ge

<!-- page 34 of 50 -->

## Appendix A. More Results

**Qualitative Results.** This section presents a selection of qualitative examples illustrating the capabilities of **ST EP3-VL-10B** through responses generated from various prompts. The provided cases underscore the model’s superior ability of fine-grained perception and structured logical reasoning. More importantly, it demonstrates a high degree of cognitive systematicity, effectively integrating domain knowledge to execute multi-step tasks.

**定性结果.** 本节给出若干定性样例, 通过不同提示的响应展示 **STEP3-VL-10B** 的能力. 这些样例突出模型在细粒度感知与结构化逻辑推理上的优势. 更重要的是, 它展示出高度的认知系统性: 能有效整合领域知识执行多步任务.

### Case 1: Visual Pattern Matching and Sequential Decoding

![Image block](images/p34-figure-4-morse-code-reference.png)

Figure 4 | Morse Code Reference

![Image block](images/p34-34.png)

<!-- page 35 of 50 -->

### Case 2: Fine-grained Visual Counting and Semantic Filtering

![Image block](images/p35-figure-5-screenshot-of-the-compiler.png)

Figure 5 | Screenshot of the Compiler

#### User Prompt

The screenshot shows a snapshot of a LaTeX text editor a student uses for writing their PhD dissertation. What is the minimum number of chapter .tex files the student has opened?

#### Model Thinking Process

So, let’s look at the tabs at the top of the editor.

The visible tabs are:

• chapte. . . (leftmost, maybe chapter1.tex as the active file in the center)

• chapte. . . (next)

• thesis. . . (this is thesis.tex, not a chapter)

• chapte. . . (next)

• chapte. . . (next)

• chapte. . . (last one before the dark theme part)

To determine the minimum number of chapter .tex files opened, we analyze the tabs at the top of the editor.

1. Identify tabs: The image shows multiple tabs labeled chapte. . . (truncated for "chapter. . . ") and one tab labeled thesis. . .

2. Exclude non-chapter tabs: The thesis. . . tab is not a chapter file, so we count only the chapte. . . tabs.

3. Count chapter tabs: There are 5 visible chapte. . . tabs (excluding the thesis. . . tab).

#### Final Answer

<!-- page 36 of 50 -->

### Case 3: Low-Resolution Visual Detail Recognition

![Image block](images/p36-figure-6-out-of-focus-target.png)

Figure 6 | Out-of-focus Target

#### User Prompt

What is the brand name of the monitor in the image? What is its encoding with a Caesar cipher with a left shift of 5. Give your answer as a combined string.

#### Model Thinking Process

Got it, let’s break this down. First, find the monitor’s brand.

The logo on the monitor’s base is HP.

Then, we need to do a Caesar cipher with a left shift of 5.

• First, H is the 8th letter (A=1, B=2. . . H=8). Left shift 5: 8-5=3 → C.

• Then, P is the 16th letter. 16-5=11 → K.

So "HP" shifted left 5 is "CK".

#### Final Answer

HPCK

<!-- page 37 of 50 -->

### Case 4: Topological Graph Analysis and Minimum Weight Search

![Image block](images/p37-figure-7-weighted-graph.png)

Figure 7 | Weighted Graph

#### User Prompt

How many edges have the shortest length?

#### Model Thinking Process

To determine the number of edges with the shortest length, we first identify the smallest edge weight in the diagram.

The smallest weight is 1. Next, we count all edges labeled with 1:

• 𝐴 → 𝑇: labeled 1

• 𝑇 → 𝑋: labeled 1

• 𝑃 → 𝑂: labeled 1

• 𝑊 → 𝑋: labeled 1

No other edges have a weight of 1. Thus, there are 4 edges with the shortest length.

#### Final Answer

<!-- page 38 of 50 -->

## B. Serialization Details for Synthesis in PaCoRe

```jinja
You are given a problem and a list of reference responses. Your job is to analyze these references and provide your own response.
Original Problem:
{{ original_prompt }}
Reference Responses:
{% for response in ref_responses %}
Reference {{ loop.index }}:
{{ response }}
{% endfor %}
Now, based on the original problem and reference responses above, please provide your own comprehensive solution.
```

Table 8 | Input serialization template for PaCoRe synthesis. We use this template to embed the current problem 𝑥 (denoted as original\_prompt) and the compact message set 𝑀 (denoted as ref\_responses) into the model’s context. In the degenerate case where the message set is empty (𝑀 = ∅), this template is bypassed, and the original problem input is passed to the model unmodified.

> **确认:** 附录 B 表 8 的 Jinja 模板要求模型做什么? 当 message set 𝑀=∅ 时还套模板吗?
> 模板开头要求分析 Reference Responses 并给出自己的 comprehensive solution; Original Problem 槽填 current problem. 表 8 说明 𝑀=∅ 时 **bypass** 该模板, 原题输入原样进模型. 综合动机句写 framing 为 Reference Responses 以鼓励综合多样视角.

As detailed in Table 8, we frame compact messages as “Reference Responses” to encourage the model to synthesize diverse perspectives. By populating the “Original Problem” slot with the latest observation while maintaining the interaction history in context, PaCoRe ensures seamless compatibility with existing reasoning ecosystems. Further implementation details regarding the synthesis process can be found in Hu et al. (2026), Section C.

如表 8 所示, 我们把压缩消息设定为"参考响应", 鼓励模型综合多样视角. PaCoRe 把"原始问题"槽位填最新观测, 同时在上下文保留交互历史, 保证与现有推理生态无缝兼容. 合成过程的更多实现细节见 Hu et al. (2026) 第 C 节.

## C. Evaluation Details

This section outlines the evaluation setup and the corresponding evaluation prompts.

### C.1. Evaluation Details for Multimodal Benchmarks

We detail the prompt formats used for evaluation across different benchmarks. For each benchmark, we present the corresponding prompt template, where {question} denotes the textual problem description, potentially including answer options, and &lt;image&gt; represents the visual input. When images are embedded in the question with explicit positional semantics, their original positions are preserved; otherwise, images are placed before the question text.

**MMMU.** We adopt the evaluation metric suggested by OpenCompass.<sup>1</sup>. The placement of image placeholders follows the original MMMU samples, allowing for interleaved visual inputs.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>https://github.com/open-compass/VLMEvalKit</span></small>

<!-- page 39 of 50 -->

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**MMMU-Pro.** We use the official metric of MMMU-Pro.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**MathVision.** We use the official metric of MathVision.

```txt
Please solve the problem and put your answer in one "\boxed{}". If it is a multiple choice question, only one letter is allowed in the "\boxed{}". <image> {question}
```

**MathVista.** For MathVista, we follow the official evaluation protocol and use distinct prompt templates corresponding to different answer formats.<sup>2</sup>

For questions requiring floating-point answers with one or two decimal places, we use the following prompts, respectively:

```txt
<image>
Hint: Please answer the question requiring a floating-point number with two decimal places and provide the final value, e.g., 1.23, 1.34, 1.45, at the end.
Question: {question}
```

```txt
<image>
Hint: Please answer the question requiring a floating-point number with one decimal place and provide the final value (e.g., 1.2, 1.3, 1.4) at the end.
Question: {question}
```

For multiple-choice questions, we use the following prompt:

```txt
<image>
Hint: Please answer the question and provide the correct option letter (e.g., A, B, C, D) at the end.
Question: {question}
```

For questions requiring an integer answer, we use the following prompt:

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>https://github.com/lupantech/MathVista</span></small>

<!-- page 40 of 50 -->

```txt
<image>
Hint: Please answer the question requiring an integer answer and provide the final value (e.g., 1, 2, 3) at the end.
Question: {question}
```

For questions requiring a Python list as the answer, we use the following prompt:

```txt
<image>
Hint: Please answer the question requiring a Python list as an answer and provide the final list, e.g., [1, 2, 3], [1.2, 1.3, 1.4], at the end.
Question: {question}
```

Additional details are available on the official MathVista website.

**LogicVista.** We use the official metric of LogicVista.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**DynaMath.** For DynaMath, we adopt the official evaluation protocol and use the worstcase accuracy metric, defined as the percentage of correctly answered seed questions across all generated variations, to assess model robustness on mathematical reasoning tasks.<sup>3</sup>

For multiple-choice questions, we use the following prompt:

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" (option letter only).
```

For questions requiring a floating-point answer, we use the following prompt:

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: \boxed{{answer}}." Round the answer to three decimal places.
```

For all other questions, we use the following prompt:

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>https://github.com/DynaMath/DynaMath</span></small>

<!-- page 41 of 50 -->

```swift
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: \boxed{{answer}}."
```

Additional details are available on the official DynaMath repository.

**ZeroBench.** We use the official metric of ZeroBench.

```txt
<image>
{question}
Give the final answer in curly braces, like:
\boxed{final_answer}.
```

**MathVerse.** We use the official metric of MathVerse and focus on the Vision-only subset. Details of the answer extraction and judgement can be seen in the official MathVerse repository. <sup>4</sup>

For multiple-choice questions, we use the following prompt:

```txt
Answer the question in the image. Provide the correct option letter, e.g., A, B, C, D, within \boxed{}. <image>
```

For other questions, we use the following prompt:

```txt
Answer the question in the image. Put your answer within \boxed{}. <image>
```

**We-Math.** We use the official metric of We-Math.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**VisuLogic.** We use the official metric of VisuLogic.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer should follow this format:
Answer: \boxed{$LETTER}.
```

**PhyX.** We use the official metric of PhyX.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>https://github.com/ZrrSkywalker/MathVerse</span></small>

<!-- page 42 of 50 -->

```txt
<image>
{question}
```

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**HLE.** We follow the official evaluation metrics and LLM-based judgement protocols of HLE.

```txt
<image>
{question}
```

**MMBench.** We report accuracy on the MMBench v1.1 Dev set. We use the following prompt for MMBench-EN, and apply its Chinese translation for MMBench-CN.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**SimpleVQA.** We follow the official evaluation metrics and LLM-based judgement protocols of SimpleVQA.

**MMStar.** We use official metric of MMStar.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**HallusionBench.** We use official metric of HallusionBench.

```txt
<image>
{question}
Please answer yes or no.
```

**MMVP.** We use the official metric of MMVP. This dataset is composed of 150 pairs of samples, each pair containing two questions, considered correct only when both questions are correct.

<!-- page 43 of 50 -->

```txt
<image>
{question}
Please select the correct answer from the options above.
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**ReMI.** We use the official metric of ReMI. The placement of image placeholders follows the original ReMI samples, allowing for interleaved visual inputs.

```txt
<image>
{question}
Please select the correct answer from the options above.
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**M3GIA.** We use the official metric and adopt the following system and user prompts.

We use the system prompt format below:

```txt
Answer following questions with the option's letter from the given choices directly.
```

**DoYouSeeMe.** We use the official metric and adopt the following system and user prompts.

We adopt the system prompt specified by the question domain.

<!-- page 44 of 50 -->

```txt
# ['Shape Discrimination', 'Joint Shape-Color', 'Spatial Grids']
You are an AI assistant specialized in visual perception tasks.
Please analyze the image carefully and provide your answer as
an integer number. Format your response by putting your final
answer after 'Answer:', for example: Answer: 5

# ['Letter Discrimination']
You are an AI assistant specialized in visual perception tasks.
Please analyze the image carefully and identify the letter or
text. Format your response by putting your final answer after
'Answer:', for example: Answer: A

# ['Form Constancy', 'Visual Closure', 'Visual Figure-Ground']
You are an AI assistant specialized in visual perception tasks.
Please analyze the image carefully and select the correct
option. Format your response by putting your final answer
after 'Answer:', using only the option number (1-4), for example:
Answer: 2

# Otherwise:
You are an AI assistant specialized in visual perception tasks.
Please analyze the image carefully and provide your answer.
Format your response by putting your final answer after 'Answer:'
```

And we use the user prompt format below:

```txt
<image>
{question}
```

**CountBench.** We use the official metric of CountBench.

```txt
<image>
{question}
Please select the correct answer from the options above.
Your response can be freely expressed in any format, but the
final answer must be presented in this format:
"Final answer: [the correct count number]" with the number only.
```

**CountQA.** We use the official metric of CountQA.

```txt
<image>
{question}
Please select the correct answer from the options above.
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct answer]".
```

**PixMo-Count.** We use the official metric of PixMo-Count.

<!-- page 45 of 50 -->

```txt
<image>
{question}
Please select the correct answer from the options above.
Your response can be freely expressed in any format, but the
final answer must be presented in this format:
"Final answer: [the correct count number]" with the number only.
```

**MM-MT-Bench.** We use the official metric of MM-MT-Bench.<sup>5</sup>

```txt
<image>
{question}
```

**MIA-Bench.** We follow the official evaluation metrics and LLM-based judgement protocols of MIA-Bench.

```txt
<image>
{question}
```

**MM-IFEval.** We follow the official metric and evaluation protocols. We adopt the system prompts specified by the question types.

For the P-Level questions, we use the following system prompt:

```txt
You are an AI assistant. Please answer the question based on the image. Provide a clear and concise answer.
```

For the C-Level questions, we use the following system prompt:

```txt
# Have constraints
You are an AI assistant. Please answer the question based on the image while strictly following these constraints:
{constrains}
Make sure your response adheres to ALL the constraints above.
# Others
You are an AI assistant. Please answer the question based on the image while following any instructions or constraints mentioned in the question.
```

And we use the user prompt format below:

|  |
| --- |
| {question} |

**HumanEval-V.** We use the official metric of HumanEval-V.

|  |
| --- |
| {question} |

**Design2Code.** We use the official metric of Design2Code.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>https://github.com/mistralai/mistral-evals/tree/main</span></small>

<!-- page 46 of 50 -->

```txt
You are an expert web developer who specializes in HTML and CSS.
A user will provide you with a screenshot of a webpage.
You need to return a single html file that uses HTML and CSS to reproduce the given website.
Include all CSS code in the HTML file itself.
If it involves any images, use "rick.jpg" as the placeholder.
Some images on the webpage are replaced with a blue rectangle as the placeholder, use "rick.jpg" for those as well.
Do not hallucinate any dependencies to external files. You do not need to include JavaScript scripts for dynamic interactions.
Pay attention to things like size, text, position, and color of all the elements, as well as the overall layout.
Respond with the content of the HTML+CSS file:
<image>
```

**OCRBench .** We use the official metric and follow the prompt.

```txt
<image>
{question}
```

**Omni-OCR.** We use the official metric of Omni-OCR.

```txt
<image>
{question}
```

**CC-OCR (Multi-Lang-OCR subset).** We use the official metric of CC-OCR.

```txt
<image>
Please output only the text content from the image without any additional descriptions or formatting.
```

**BLINK.** We use the official metric of BLINK.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**CVBench.** We use the official metric of CVBench.

```txt
<image>
{question}
```

**MMSI-Bench.** We use the official metric of MMSI-Bench.

```txt
<image>
{question}
Answer with the option's letter from the given choices directly.
Enclose the option's letter within ' '.
```

<!-- page 47 of 50 -->

**ERQA.** We use the official metric of ERQA.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**OmniSpatial.** We use the official metric of OmniSpatial.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**All-Angles-Bench.** We use the official metric of All-Angles-Bench.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**MindCube-tiny.** MindCube-tiny is a condensed subset of the MindCube benchmark designed for efficient evaluation of Vision-Language Models in reconstructing 3D spatial structures and performing mental simulations from limited perspectives. We use its official metric.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**RealWorldQA.** We use the official metric of RealWorldQA.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**SpatialViz-Bench.** We use the official metric of SpatialViz-Bench.

<!-- page 48 of 50 -->

```txt
For the True/False (Yes/No) questions, we use the following prompt:
    <image>
    {question}
    Answer with YES or NO and put the answer in one \boxed{}.
```

```txt
<image>
{question}
You should first provide a reasoning process, then provide a single option(A, B, C or D) as the final answer. The reasoning process and the answer are enclosed within <think></think> and <answer></answer> tags, respectively, i.e., <think>reasoning process</think>, <answer>answer</answer>.
```

**STARE.** We use the official metric of STARE.

```txt
<image>
{question}
Answer with the option's letter from the given choices and put the letter in one \boxed{}.
Please solve the problem step by step.
```

**CoreCognition.** We use the official metric of CoreCognition.

<u>For multiple-choice questions, we use the following prompt:</u>

```txt
<image>
{question}
Answer with the option's letter from the given choices and put the letter in one \boxed{}.
```

**V\*.** We use the official metric of V\*.

```txt
<image>
{question}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]" with the option letter only.
```

**ViewSpatial.** We use the official metric of ViewSpatial.

```txt
<image>
{question}
Reply only to the corresponding option.
Answer:
```

**CharXiv (RQ).** We use the official metric of CharXiv and adopt the following system and user prompts.

We adopt the system prompt specified by the question domain.

<!-- page 49 of 50 -->

```txt
You should first think about the reasoning process in the mind and then provide the user with the answer. The reasoning process is enclosed within <think> </think> tags, i.e. <think> reasoning process here </think> answer here.
```

And we use the user prompt format below:

```txt
<image>
{question}
```

**AI2D.** We use the official metric of AI2D.

```txt
Answer following questions with the option's letter from the given choices directly.
<image>
{question}
```

**CSVQA.** We use the official metric of CSVQA.

For multiple-choice questions, we use the following prompt:

```txt
<image>
请回答图片中的问题。将正确选项字母（如A、B、C、D）放在\boxed{} 中。
```

For other questions, we use the following prompt:

```txt
<image>
请回答图片中的问题。将最终答案放在\boxed{} 中。
```

**EncQA.** We use the official metric and adopt the following user prompts specified by the question type.

```txt
# For multiple choices problem
Answer using only a single word or letter from the options provided.
{question}
Options: {options}

# For set problems
Answer choosing only from the options provided, your answer should be just a simple comma separated list.
{question}
Options: {options}

# For numeric problem
Answer using only a single number.
{question}
```

**OmniDocBench.** We use the NED (Normalized Edit Distance) metric and adopt the official system prompt and user prompt. <sup>6</sup>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>https://github.com/opendatalab/OmniDocBench</span></small>

<!-- page 50 of 50 -->

**ScreenSpot-Pro & ScreenSpot-V2 & OSWorld-G & MMBench-GUI-L2.** For the GUI grounding tasks, we use a unified prompt format designed to localize visual elements and output their coordinates in a structured form.

```txt
<image>
Based on the instruction '{question}', locate the target element and output its coordinate point in JSON format.
```

### C.2. Evaluation Details for Text-Centric Benchmarks

To reduce metric variance and improve result reliability on text-centric benchmarks, we perform repeated evaluation for selected benchmarks. For a benchmark with Repeat = 𝑁, each sample is evaluated independently 𝑁 times, and the final score is reported as the average over all runs.

为降低以文本为中心基准的指标方差, 提高结果可靠性, 我们对选定基准做重复评测. Repeat = N 表示每个样本独立评 N 次, 最终分数取所有轮次的平均.

The repetition settings for each text-centric benchmark are listed below:

• **MMLU-Pro**: Repeat = 1

• **GPQA-Diamond**: Repeat = 16

• **SuperGPQA**: Repeat = 1

• **LiveBench(2024-11-25)**: Repeat = 1

• **AIME 2024**: Repeat = 64

• **AIME 2025**: Repeat = 64

• **HMMT25**: Repeat = 64

• **CNMO2024**: Repeat = 64

• **BeyondAIME**: Repeat = 64

• **IMO-AnswerBench**: Repeat = 1

• **LiveCodeBench (2408-2505)**: Repeat = 16

• **IFEval**: Repeat = 4

• **IFBench**: Repeat = 4

• **MultiChallenge**: Repeat = 1

• **Arena-Hard-V2**: Repeat = 1

• **WildBench**: Repeat = 1

• **HealthBench**: Repeat = 1

### C.3. Evaluation Details for Ablations

Each ablation study in Sec. 5.1 is conducted on checkpoints pre-trained with the same number of billions of tokens, ensuring fair and controlled comparisons, but without extending to the final checkpoint due to computational cost. In terms of evaluation setups, these results are attained from a few-shot evaluation manner on the pre-trained checkpoints.

第 5.1 节的每项消融都在预训练 token 数相同的检查点上进行, 保证对照公平可控; 受算力所限, 没做到最终检查点. 评测设定上, 这些结果取自预训练检查点上的 few-shot 评测.

50
