---
title: "GLM-5V-Turbo · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-5V-Turbo 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 30 -->

arXiv:2604.26752v3 [cs.CV] 12 May 2026

arXiv:2604.26752v3，分类 cs.CV，2026 年 5 月 12 日。

> **确认：** 这份报告是哪一版，日期属于哪一版？
> 第 1 页页边印的是 arXiv:2604.26752v3，日期 12 May 2026，即第 3 版，2026 年 5 月 12 日。这个日期只属于 v3，全文没有印 v1 或 v2 的日期，不能拿 5 月 12 日当首发日。编号前缀 2604 按 arXiv 的编号规则对应 2026 年 4 月首次提交；参考文献 [4] [5] [12] [27] [28] [29] [50] 都写 「Accessed: 2026-04-15」（第 14 到 17 页），和 4 月成稿对得上。v1 到 v3 改了什么，本文没有交代。

# GLM-5V-Turbo: Toward a Native Foundation Model for Multimodal Agents

GLM-5V-Turbo：面向多模态智能体的原生基础模型

**GLM-5V-Turbo Team**

**GLM-5V-Turbo 团队**

Z.ai & Tsinghua University

Z.ai 与清华大学

(For the complete list of authors, please refer to the Contribution section)

（完整作者名单见 Contribution 一节。）

## Abstract

We present GLM-5V-Turbo, a step toward native foundation models for multimodal agents. As foundation models are increasingly deployed in real environments, agentic capability depends not only on language reasoning, but also on the ability to perceive, interpret, and act over heterogeneous contexts such as images, videos, webpages, documents, GUIs. GLM-5V-Turbo is built around this objective: multi-modal perception is integrated as a core component of reasoning, planning, tool use, and execution, rather than as an auxiliary interface to a language model. This report summarizes the main improvements behind GLM-5V-Turbo across model design, multimodal training, reinforcement learning, toolchain expansion, and integration with agent frameworks. These developments lead to strong performance in multimodal coding, visual tool use, and framework-based agentic tasks, while preserving competitive text-only coding capability. More importantly, our development process offers practical insights for building multimodal agents, highlighting the central role of multimodal perception, hierarchical optimization, and reliable end-to-end verification.

本文提出 GLM-5V-Turbo，朝多模态 Agent 的原生基座模型迈进一步。基座模型越来越多部署到真实环境，Agent 能力不只靠语言推理，还要能感知，理解并操作图像，视频，网页，文档，GUI 等异构上下文。GLM-5V-Turbo 围绕这个目标构建：多模态感知被集成为推理，规划，工具调用与执行的核心组件，而不是语言模型的外挂接口。本报告总结其在模型设计，多模态训练，强化学习，工具链扩展与 Agent 框架集成上的主要改进。这些进展带来多模态编码，视觉工具使用与框架化 Agent 任务的强劲表现，同时保住有竞争力的纯文本编码能力。更重要的是，开发过程为构建多模态 Agent 提供了实践经验：多模态感知是核心，分层优化与可靠的端到端验证缺一不可。

## 1 Overview（概述）

Recent advances in foundation models have driven a shift from language understanding to agentic real-world interaction [4; 28; 49], opening up substantial opportunities for productivity gains in domains such as knowledge work [12; 27; 22], software engineering [20], and tasks that require interacting with graphical user interfaces [16; 43]. A general-purpose agentic model requires not only advanced intelligence, but also the ability to natively process complex multimodal context—including images, videos, text, webpages, and documents—and to integrate these heterogeneous inputs into a unified process of perception, reasoning, and decision-making [12; 5; 37].

近来基础模型的进展推动了一次转向：从语言理解走向与真实世界的智能体式交互 [4; 28; 49]，为知识工作 [12; 27; 22]，软件工程 [20] 以及需要操作图形用户界面的任务 [16; 43] 带来了可观的生产力提升空间。一个通用智能体模型不仅需要高水平的智能，还需要原生处理复杂的多模态上下文，包括图像，视频，文本，网页和文档，并把这些异构输入整合进统一的感知，推理与决策过程 [12; 5; 37]。

Toward this goal, we introduce a set of coordinated advances in model design, training, and infrastructure to enable more native multimodal modeling. In model design, we develop CogViT, a new vision encoder tailored for multimodal fine-grained understanding, and propose Multimodal Multi-Token Prediction, which supports both text-only and multimodal inputs while remaining friendly to largescale infrastructure. In training, we deeply integrate vision and language throughout pre-training and supervised fine-tuning, and further perform joint reinforcement learning over more than 30 task categories spanning perception, reasoning, and agentic capabilities, supported by an optimized infrastructure stack for large-scale multimodal RL. Building on these advances, we further expand GLM-5V-Turbo’s multimodal agentic capabilities through toolchain extension, framework integration, and ecosystem development. We present a vision-centric deep search benchmark ImageMining that evaluates models’ ability to “think and deep search with image”。

为此，我们在模型设计，训练和基础设施上做了一组相互配合的改进，让多模态建模更原生。模型设计上，我们开发了 CogViT，一个面向多模态细粒度理解的新视觉编码器，并提出 Multimodal Multi-Token Prediction（多模态多 token 预测），它同时支持纯文本和多模态输入，并且对大规模基础设施友好。训练上，我们在预训练和监督微调全程深度融合视觉与语言，再在覆盖感知，推理和智能体能力的 30 多类任务上做联合强化学习，背后是一套为大规模多模态 RL 优化过的基础设施栈。在此基础上，我们通过工具链扩展，框架集成和生态建设，进一步扩展 GLM-5V-Turbo 的多模态智能体能力。我们还推出一个以视觉为中心的深度搜索基准 ImageMining，用来评测模型 「借图思考，借图深搜」 的能力。

> **问：** 「30 多类任务」 有没有清单？
> 没有。第 4 页 2.3 节再次写 「more than 30 task categories」，随后点名的是一批评测上的涨幅（RefCOCO-avg，PointBench，MVBench，SUNRGBD，OCRBench，CharXiv，MMMU 等，以及 OSWorld, CC-Backend, MMSearch）。这些是评测名，不是训练任务类别。全文没有给出 30 多类的名单，也没有每类的数据量。

These developments endow GLM-5V-Turbo with native multimodal agentic capability, while retaining strong text-based agentic and coding performance relative to its language-only base model GLM-5-Turbo. This is reflected both in benchmark results and in its effectiveness in practical agentic

这些进展让 GLM-5V-Turbo 具备原生的多模态智能体能力，同时相对它的纯语言基座模型 GLM-5-Turbo，保留了很强的文本智能体与编程表现。这一点既体现在基准结果上，也体现在实际智能体场景中的效果（句子在第 2 页接续）。

<!-- page 2 of 30 -->

settings, including chatbot-style environments such as Z.ai and framework-based scenarios such as Claude Code [3] and OpenClaw [29]. GLM-5V-Turbo achieves strong results on multimodal agentic benchmarks, including multimodal tool use (30.7 on ImageMining, 51.9 on BrowseComp-VL [10], 72.9 on MMSearch [18], and 78.2 on SimpleVQA [7]), GUI agent tasks (75.7 on AndroidWorld [30] and 62.3 on OSWorld [44]), and Claw-based evaluations (87.0/80.7 on PinchBench [1], 57.7/75.0 on ClawEval [46], and 57.6 on ZClawBench [2]). GLM-5V-Turbo also demonstrates strong coding performance in both multimodal and text-only settings. For the multimodal setting, GLM-5V-Turbo achieves 94.8 on Design2Code [31], outperforming Claude Opus 4.6 [4]; for the text-only setting, GLM-5V-Turbo preserves the coding capability of its language-only base model GLM-5-Turbo and even surpasses it on CC-Backend (22.8), CC-Frontend (68.4), and CC-RepoExploration (72.2) [49].

（接上页）这些场景包括 Z.ai 这类聊天机器人式环境，以及 Claude Code [3] 和 OpenClaw [29] 这类基于框架的场景。GLM-5V-Turbo 在多模态智能体基准上成绩很强：多模态工具使用（ImageMining 30.7, BrowseComp-VL [10] 51.9, MMSearch [18] 72.9, SimpleVQA [7] 78.2），GUI 智能体任务（AndroidWorld [30] 75.7, OSWorld [44] 62.3），以及基于 Claw 的评测（PinchBench [1] 87.0/80.7, ClawEval [46] 57.7/75.0, ZClawBench [2] 57.6）。GLM-5V-Turbo 在多模态和纯文本两种设定下的编程表现也很强。多模态设定下，它在 Design2Code [31] 上得 94.8，超过 Claude Opus 4.6 [4]；纯文本设定下，它保住了纯语言基座 GLM-5-Turbo 的编程能力，并称在 CC-Backend (22.8), CC-Frontend (68.4) 和 CC-RepoExploration (72.2) [49] 上还超过了基座。

> **核对：** 说在 CC-Frontend 上超过 GLM-5-Turbo，第 11 页的表对得上吗？
> 对不上。第 11 页图 5 的 CC-Frontend 一行，GLM-5V-Turbo 是 68.4，GLM-5-Turbo 是 69.4，前者低 1.0。另外两项成立：CC-Backend 22.8 对 20.5，CC-Repo-Exploration 72.2 对 68.9。所以 「三项都超过」 只有两项站得住。本段的 68.4 本身和表一致，错的是 「surpasses」 这个判断。

> **拆开：** 「87.0/80.7」 和 「57.7/75.0」 斜杠两边各是什么？
> 本段没写，要回看第 11 页图 5 的行名。PinchBench 一行标的是 「Best/Avg」，87.0 是最好一次，80.7 是平均；ClawEval 一行标的是 「Pass^3/Pass@3」，57.7 对应 Pass^3, 75.0 对应 Pass@3。按常见用法，Pass^3 要求三次都通过，Pass@3 三次里通过一次即可，论文本身没有给定义。两组都是同一基准上的两种统计口径，不能相加，也不能拿一边去和别家的另一边比。

Developing GLM-5V-Turbo also surfaced several broader lessons for agentic model development. Perception remains foundational to higher-level multimodal capability, while agentic competence is often acquired more effectively through hierarchical optimization than through monolithic end-to-end training. In addition, end-to-end agent tasks require clear specification, reliable verification, and carefully controlled evaluation for effective construction, assessment, and optimization. In this report, we summarize the main practices and lessons from developing GLM-5V-Turbo to inform future work on native multimodal agents.

开发 GLM-5V-Turbo 的过程也带出了几条关于智能体模型开发的更一般的经验。感知仍是更高层多模态能力的基础；智能体能力往往通过分层优化，比通过单一的端到端训练更有效地习得。此外，端到端智能体任务要想有效地构建，评估和优化，需要清楚的任务规格，可靠的验证和受控的评测。本报告总结开发 GLM-5V-Turbo 的主要做法与经验，供今后原生多模态智能体的工作参考。

## 2 Model, Training, and Infrastructure（模型，训练与基础设施）

## 2.1 CogViT Vision Encoder（CogViT 视觉编码器）

We develop **CogViT**, a novel parameter-efficient vision encoder tailored for multimodal perception and downstream agent-oriented tasks. It delivers strong capabilities in general object recognition, fine-grained understanding, as well as geometric and spatial perception. As illustrated in Figure 1, CogViT achieves competitive performance across these domains. To balance representation learning with cross-modal alignment, we employ a two-stage pretraining recipe.

我们开发了 **CogViT**，一个新的参数高效视觉编码器，面向多模态感知和下游的智能体类任务。它在通用物体识别，细粒度理解以及几何与空间感知上能力很强。如图 1 所示，CogViT 在这些领域的表现有竞争力。为了兼顾表征学习和跨模态对齐，我们采用两阶段预训练方案。

![Chart block](images/p02-figure-1-performance-comparison-of-cogvit-with-other.png)

(图：分组柱状图，纵轴 Accuracy (%)。图例是四个编码器及其参数量：CogViT-L (403M), SigLIP2-SO (427M), DFN-H (632M), MetaCLIP2-H (632M). ImageNet-1K (Zero-Shot): 83.5 / 83.3 / 83.4 / 79.8; 38 CLIP Bench (Mean): 70.4 / 69.1 / 69.6 / 67.7; 14 General Obj Bench (Mean): 45.1 / 41.5 / 43.9 / 45.0。三组里 CogViT 都最高，柱顶有三角标记。)

Figure 1: Performance comparison of CogViT with other state-of-the-art vision encoders across general and fine-grained multimodal tasks.

图 1: CogViT 与其他最先进视觉编码器在通用和细粒度多模态任务上的性能对比。

> **看表：** 图 1 的 403M 是 GLM-5V-Turbo 的参数量吗？
> 不是。403M 印在图例 「CogViT-L (403M)」 里，只是视觉编码器这一个组件，对比对象 SigLIP2-SO 427M，DFN-H 632M，MetaCLIP2-H 632M 也都是编码器。全文没有印 GLM-5V-Turbo 整体的参数量，也没有印 GLM-5-Turbo 的。第 3 页另有一个 0.5B，那是 MMTP 消融用的小模型。本文能引用的参数数字只有 403M（编码器）和 0.5B（消融模型），都不能当成整机规模。另外，图注说 「general and fine-grained multimodal tasks」，图上三组却都是分类或物体识别类指标，正文说的细粒度，几何和空间感知在图里没有单独的分数。

In the first stage, we use distillation-based masked image modeling to strengthen visual representations. Specifically, we train the student ViT to reconstruct the masked regions (35% masking ratio, 224 × 224 resolution) in the feature spaces of dual teacher models: SigLIP2 [39] for semantic representations and DINOv3 [32] for texture features. The training data follows a quality-aware mixture strategy: 80% high-quality natural images, 10% instruction-following data, and 10% scientific imagery. We optimize with Muon [21] optimizer with a cosine decay schedule. Additionally, we introduce QK-Norm [15] to normalize query and key vectors before attention computation, effectively mitigating logit explosion and ensuring stability at scale.

第一阶段，我们用基于蒸馏的掩码图像建模来强化视觉表征。具体是训练学生 ViT，在两个教师模型的特征空间里重建被遮住的区域（遮挡比例 35%，分辨率 224 × 224）：SigLIP2 [39] 提供语义表征，DINOv3 [32] 提供纹理特征。训练数据按质量感知的配比：80% 高质量自然图像，10% 指令跟随数据，10% 科学图像。优化器用 Muon [21]，配余弦衰减学习率。我们还引入 QK-Norm [15]，在注意力计算前对 query 和 key 向量做归一化，有效缓解 logit 爆炸，保证大规模训练稳定。

The second stage shifts to contrastive image-text pretraining to align visual and textual features in a shared embedding space. Compared to the first stage, we introduce three key upgrades: (1) replacing

第二阶段转向图文对比预训练，把视觉特征和文本特征对齐到共享的嵌入空间。和第一阶段相比有三处关键升级：（1）把固定的（句子在第 3 页接续）

<!-- page 3 of 30 -->

the fixed 224 × 224 resolution with the NaFlex [39] scheme to process variable-size inputs while preserving original aspect ratios; (2) scaling the global batch size to 64K using the sigmoid-based SigLIP loss, combined with a bidirectional distributed implementation for efficiency; and (3) utilizing an 8-billion bilingual (Chinese-English) image-text corpus to enhance cross-lingual understanding. We continue to optimize with Muon, assigning module-specific learning rates and decay schedules to the vision, text, and projection components.

（接上页）224 × 224 分辨率换成 NaFlex [39] 方案，处理可变尺寸输入并保留原始宽高比；（2）用基于 sigmoid 的 SigLIP 损失把全局 batch size 扩到 64K，配合双向分布式实现提高效率；（3）使用 80 亿规模的中英双语图文语料，增强跨语言理解。优化器仍是 Muon，视觉，文本和投影三个部分各自设定学习率和衰减方案。

> **停一下：** 「8-billion」 是参数量吗？
> 不是。第 3 页原文是 「an 8-billion bilingual (Chinese-English) image-text corpus」，修饰的是语料，单位没写是图文对还是图片张数。同段的 64K 是全局 batch size。这两个数都和模型规模无关，本文印出的参数数字见第 2 页图 1 的 403M 和第 3 页的 0.5B。

## 2.2 Multimodal Multi-Token Prediction（多模态多 token 预测）

We propose **Multimodal Multi-Token Prediction (MMTP)**, a multimodal extension of multi-token prediction (MTP) [11], designed to support both text-only and multimodal inputs while remaining friendly to large-scale infrastructure. The goal is to preserve acceptable length as well as training and inference efficiency in multimodal settings. In standard text-only MTP, prefix tokens can be passed into the MTP head directly through token IDs and embedded with the word embedding layer. Once MTP is extended to multimodal inputs, however, a central question arises: how should image tokens be passed to the MTP head? To answer this, we systematically compare three alternatives: The first directly passes the visual embeddings from the LLM backbone input to the MTP head; The second masks out all visual tokens at the MTP head input, reducing the design to text-only MTP; The third preserves visual positional information, but replaces all visual tokens with a shared learnable <|image|> special token as the visual input representation.

我们提出 **Multimodal Multi-Token Prediction (MMTP)**，它是 multi-token prediction (MTP) [11] 的多模态扩展，目标是同时支持纯文本和多模态输入，并对大规模基础设施友好，在多模态设定下保住可接受的长度以及训练和推理效率。标准纯文本 MTP 里，前缀 token 可以直接以 token ID 送进 MTP 头，由词嵌入层嵌入。一旦扩展到多模态输入，核心问题就来了：图像 token 该怎么送进 MTP 头？我们系统比较了三种做法：第一种把 LLM 主干输入端的视觉嵌入直接传给 MTP 头；第二种在 MTP 头输入端把视觉 token 全部遮掉，退化成纯文本 MTP；第三种保留视觉位置信息，但把所有视觉 token 换成一个共享的可学习特殊 token <|image|>，作为视觉输入表示。

Considering both optimization behavior and system efficiency, GLM-5V-Turbo ultimately adopts the third design. Compared with directly passing visual embeddings to the MTP head, using the <|image|> token removes the need to propagate visual embeddings across pipeline-parallel stages, substantially reducing communication complexity while improving system scalability and engineering maintainability. Empirically, according to the ablation study on a 0.5B model, the <|image|>-based design achieves lower training loss and more stable convergence than directly using visual embeddings. We hypothesize that this is because the MTP head is typically lightweight, and may not have sufficient modeling capacity to effectively absorb visual representations whose distribution differs substantially from that of text embeddings; by contrast, the <|image|> token presents the input in a more uniform form and thus alleviates this optimization difficulty. At the same time, compared with fully masking out visual tokens, this design remains naturally compatible with existing partitioning strategies such as sequence parallelism and context parallelism, without requiring additional handling for visualembedding partitioning, alignment, or offset mapping, which reduces implementation complexity. Overall, the design gives GLM-5V-Turbo a more balanced trade-off among multimodal modeling capability, training stability, and system efficiency.

综合优化行为和系统效率，GLM-5V-Turbo 最终采用第三种设计。和直接传视觉嵌入相比，用 <|image|> token 不需要在流水线并行的各级之间传递视觉嵌入，大幅降低通信复杂度，同时提高系统可扩展性和工程可维护性。实验上，按 0.5B 模型上的消融，基于 <|image|> 的设计比直接用视觉嵌入训练损失更低，收敛更稳。我们的推测是：MTP 头通常很轻，可能没有足够容量吸收分布和文本嵌入差别很大的视觉表征；<|image|> token 让输入形式更统一，缓解了这个优化难点。同时，和完全遮掉视觉 token 相比，这个设计天然兼容序列并行，上下文并行等现有切分策略，不需要为视觉嵌入的切分，对齐或偏移映射做额外处理，实现复杂度更低。总体上，这个设计让 GLM-5V-Turbo 在多模态建模能力，训练稳定性和系统效率之间取得更平衡的折中。

![Image block](images/p03-figure-2-illustration-of-our-multimodal-multi-token.png)

(图：左上三个方框是三种输入做法。Option 1 「Direct Vision Embeddings」 的序列是 v11 v12 t1 t2 v21 v22 t3 t4 t5; Option 2 「Masked Vision Tokens」 把 v 的位置涂成斜线；Option 3 「<|image|> placeholder (Adopted)」 用橙框标出，每张图的位置换成一个 <|image|>。右侧是主干：Visual Inputs 经 「CogViT + MLP Adapter」，Text Inputs 经 「Embedding Layer」，进入 「Transformer Block x L」，再接三个共享参数的 MTP Module 1/2/3。左下是 「MTP Loss Comparison」 曲线，横轴 Step 0 到约 2500，纵轴 Loss Value，蓝线 Option1，红线 Option3，约 300 步以后红线略低于蓝线。)

Figure 2: Illustration of our multimodal multi-token prediction (MMTP) design. Bottom-left: Training loss curves comparing Option 1 and Option 3, where the adopted design achieves lower loss.

图 2：我们的多模态多 token 预测（MMTP）设计示意。左下：Option 1 与 Option 3 的训练损失曲线对比，所采用的设计损失更低。

> **回看：** 正文说比较了三种做法，图 2 的曲线比了几种？
> 两种。左下角只有 Option1 和 Option3 两条线，Option 2（遮掉视觉 token）没有曲线。第 3 页淘汰 Option 2 的理由是工程上的：说第三种 「不需要为视觉嵌入的切分，对齐或偏移映射做额外处理」。可 Option 2 已经把视觉 token 遮掉，按字面也不会有视觉嵌入进入 MTP 头，这条理由和 Option 2 的定义放在一起读不通顺，原文没有再解释。损失对比也只来自 0.5B 消融模型，两条线差距很小，图里没有标数值；正式规模的 GLM-5V-Turbo 上有没有同样的差距，本文没说。

<!-- page 4 of 30 -->

## 2.3 Broad training across perception, reasoning, and agent capability（覆盖感知，推理与智能体能力的广泛训练）

The practical performance of multimodal agents depends on the joint development of perception, reasoning, planning, and execution, making narrow, domain-specific optimization insufficient. To improve these capabilities, we deeply integrate vision and language starting from the pretraining stage, strengthening the model’s native ability to represent and process multimodal context. During the pre-training phase, we utilize a mixture of plain text and multimodal data to foster a balanced development of diverse capabilities. The multimodal datasets encompass a wide array of categories, including world knowledge, interleaved image-text, OCR, coding, GUI, video, multimodal tool-use, spatial perception, grounding, and academic problem-solving. We place particular emphasis on multimodal coding data to better align visual understanding with code generation and to improve the model’s performance in multimodal agentic tasks.

多模态智能体的实际表现取决于感知，推理，规划和执行的共同发展，只做窄的领域优化不够。为此，我们从预训练阶段就深度融合视觉与语言，加强模型表示和处理多模态上下文的原生能力。预训练阶段混用纯文本和多模态数据，让各种能力均衡发展。多模态数据覆盖的类别很广，包括世界知识，图文交错，OCR，编程，GUI，视频，多模态工具使用，空间感知，grounding 和学科解题。我们特别看重多模态编程数据，用它把视觉理解和代码生成对齐，并提升模型在多模态智能体任务上的表现。

GLM-5V-Turbo further undergoes **joint RL optimization over more than 30 task categories**. We adopt several technical improvements such as relative visual policy optimization in UI-to-code tasks [45]. This broad training setup yields gains at multiple levels: on the **perceptual** side, the model improves on tasks such as 2D image grounding and pointing (compared to SFT, the RL stage achieves improvements of 4.8% and 3.2% On RefCOCO-avg [23] and PointBench [6] respectively), video understanding (+5.6% on MVBench [24]), 3D grounding (+7.7% on SUNRGBD [33]), OCR (+4.2% on OCRBench [25]), and chart understanding (+7.7% on CharXiv [40]); on **reasoning**-heavy tasks such as STEM (+1.8% on MMMU\_Val [47], MMMU\_Pro [48], MathVista [26] and LogicVista [42]), it exhibits greater stability in problem solving; and in **agentic** settings—including GUI agents (+4.9% on OSWorld [43]), coding agents (+0.2% on CC-Backend [49]), and general tool use (+3.5% on MMSearch [19] which demonstrates improved planning and execution). Importantly, these gains are not confined to a single task family, but remain relatively consistent across a broad set of tasks.

GLM-5V-Turbo 还在 **30 多类任务上做联合 RL 优化**。我们用了若干技术改进，比如在 UI 转代码任务里用相对视觉策略优化 [45]。这种宽口径训练在多个层面带来提升。**感知**侧：2D 图像 grounding 与指点（相对 SFT，RL 阶段在 RefCOCO-avg [23] 上提升 4.8%，在 PointBench [6] 上提升 3.2%），视频理解（MVBench [24] +5.6%），3D grounding (SUNRGBD [33] +7.7%), OCR (OCRBench [25] +4.2%)，图表理解（CharXiv [40] +7.7%）。**推理**较重的 STEM 任务（MMMU_Val [47]，MMMU_Pro [48]，MathVista [26] 和 LogicVista [42] 上 +1.8%）上，解题更稳定。**智能体**设定下：GUI 智能体（OSWorld [43] +4.9%），编程智能体（CC-Backend [49] +0.2%），通用工具使用（MMSearch [19] +3.5%，论文说这体现了规划与执行的改进）。重要的是，这些提升不局限于某一类任务，在很宽的任务集合上相对一致。

> **想：** 这些 「+4.8%」 「+1.8%」 是百分点还是相对涨幅？STEM 的 +1.8% 怎么来的？
> 原文只写了百分号，没说是绝对分差还是相对比例，也没给 SFT 和 RL 两端的原始分数，没法换算。STEM 那一项把 MMMU_Val，MMMU_Pro，MathVista，LogicVista 四个基准放在同一个 +1.8% 后面，是平均，求和还是每项都 +1.8%，原文没交代。这一段只能读成 「RL 相对 SFT 有正向变化」，不能拿去和第 11 页图 4 的绝对分数混算。另外这里 OSWorld 引的是 [43]，MMSearch 引的是 [19]，第 2 页和第 10 页引的是 [44] 和 [18]，见第 15 页的对照。

This multi-task RL setting also exhibits several properties that we have consistently observed in earlier explorations such as GLM-4.1V-Thinking and GLM-4.5V [37]. Compared with the cross-domain trade-offs often seen in SFT, RL tends to show weaker interference across domains, allowing multiple domains to improve together with stable gains. Interestingly, in domains with narrower distributions where single-task RL is often prone to oscillation, collaborative training can make optimization more stable by exposing the model to a richer distribution of strategies and steering it toward more robust solutions. Beyond this, we observe some transfer of thinking patterns across tasks: reasoning behaviors acquired in one domain can sometimes carry over to another and produce measurable benefits there as well. This suggests that the value of multi-task RL lies not only in covering a broader range of tasks, but also in inducing deeper sharing at the level of strategy patterns.

这种多任务 RL 设定也呈现出几条我们在更早的探索（如 GLM-4.1V-Thinking 和 GLM-4.5V [37]）里一再观察到的性质。和 SFT 里常见的跨领域此消彼长相比，RL 的跨领域干扰更弱，多个领域能一起稳定提升。有意思的是，在分布较窄，单任务 RL 容易振荡的领域，协同训练让模型接触更丰富的策略分布，把它引向更稳健的解，反而让优化更稳。此外，我们还观察到思考模式在任务之间有一定迁移：在一个领域学到的推理行为，有时能带到另一个领域并产生可测的收益。这说明多任务 RL 的价值不只是覆盖更多任务，还在于在策略模式层面引出更深的共享。

At the same time, broad coverage in joint optimization does not mean that the problem is fully resolved. We do observe that capabilities left uncovered during RL can sometimes decline after post-training, especially those more orthogonal to the trained task distribution. One plausible explanation is that, as RL proceeds, both model capacity and learned thinking patterns become increasingly concentrated around the sampled task distribution, weakening the model’s ability to retain performance in underrepresented domains. This suggests that the scope of task coverage during RL is itself an important factor shaping the model’s eventual generalization boundary. Even when a target capability cannot be easily formulated directly as an RL task, semantically or structurally related proxy tasks may provide useful optimization signals. For example, RL on single-turn UI-to-code generation can support more complex multi-turn coding ability. Taken together, these observations suggest that multi-task collaborative RL, including on-policy distillation, is not merely a tool for improving individual capabilities, but a central path toward shaping a more unified multimodal capability structure over a broader agentic distribution.

同时，联合优化覆盖面广，不代表问题已经完全解决。我们确实观察到，RL 阶段没有覆盖到的能力在后训练之后有时会下降，尤其是那些和训练任务分布更正交的能力。一个可能的解释是：随着 RL 推进，模型容量和学到的思考模式都越来越集中在被采样的任务分布附近，削弱了模型在代表不足的领域保持表现的能力。这说明 RL 阶段的任务覆盖范围本身就是决定模型最终泛化边界的重要因素。即使某个目标能力不容易直接写成 RL 任务，语义或结构上相关的代理任务也可能提供有用的优化信号。例如，单轮 UI 转代码生成上的 RL 能支撑更复杂的多轮编程能力。综合来看，多任务协同 RL（包括在策略蒸馏）不只是提升单项能力的工具，而是在更宽的智能体分布上塑造更统一的多模态能力结构的核心路径。

## 2.4 Multimodal RL at Scale（大规模多模态 RL）

In the agent era, training infrastructure faces much stricter demands on both efficiency and stability, especially in large-scale multi-task multimodal reinforcement learning (RL). Compared with conventional training, this setting must handle wide variation in prompt and response lengths, support both single-step and multi-step tasks, and coordinate one or more rule-based or model-based verifiers for each task. To address these challenges, we systematically redesign the training stack along four dimensions: unified task and reward abstraction, end-to-end asynchrony and stage overlap, fine-grained memory management for multimodal workloads, and topology-aware partitioning and load balancing for visual inputs.

到了智能体时代，训练基础设施在效率和稳定性上的要求严格得多，大规模多任务多模态强化学习（RL）尤其如此。和常规训练相比，这种设定要应对提示和回复长度的大幅波动，同时支持单步和多步任务，还要为每个任务协调一个或多个基于规则或基于模型的验证器。为此，我们从四个方向系统地重做了训练栈：统一的任务与奖励抽象，端到端异步与阶段重叠，面向多模态负载的细粒度显存管理，以及面向视觉输入的拓扑感知切分与负载均衡。

<!-- page 5 of 30 -->

**Unified task and reward abstraction.** We build a unified VLM RL Gym that provides a consistent environment interface for both single-step and multi-step tasks, so that heterogeneous task types can be handled within the same training framework. In parallel, we introduce an independent reward system that centrally orchestrates multiple verifiers. Rule-based verifiers are executed locally and synchronously, while model-based judges are invoked asynchronously through APIs; their outputs are then combined into rewards through configurable aggregation strategies, without entangling verifier logic with the main training codepath. To improve observability in mixed-task training, each sample also carries a data-source tag, allowing source-specific metrics such as reward and pass@k to be aggregated across parallel groups and reported separately.

**统一的任务与奖励抽象。** 我们搭了一个统一的 VLM RL Gym，为单步和多步任务提供一致的环境接口，让不同类型的任务能在同一个训练框架里处理。同时引入一个独立的奖励系统，集中编排多个验证器。基于规则的验证器在本地同步执行，基于模型的评判通过 API 异步调用；两者的输出再按可配置的聚合策略合成奖励，验证器逻辑不和主训练代码路径纠缠。为了提高混合任务训练的可观测性，每个样本带一个数据来源标签，reward，pass@k 等按来源的指标可以跨并行组汇总并分别报告。

**Full-pipeline decoupling, asynchrony, and stage overlap.** We restructure the training pipeline to decouple rollout inference, reward evaluation, batch construction and weight transfer, to maximize overlap across these stages. Each inference request is registered with a completion callback, so reward computation can be triggered as soon as that request finishes, rather than waiting for the entire rollout batch to complete; this reduces pipeline idle time caused by long-tail requests. Batch construction is executed in parallel with CPU–GPU transfer of old-policy weights. For the reference model, parameters remain resident on CPU memory, are asynchronously prefetched to GPU immediately before reference forward, and are released right after use, allowing reference computation to overlap effectively with the main training step. The system also supports two early-abort modes, based on either completion count or time threshold. Aborted prompts can be cached and reused, which helps control long-tail latency without materially reducing data utilization.

**全流水线解耦，异步与阶段重叠。** 我们重构训练流水线，把 rollout 推理，奖励评估，batch 构建和权重传输解耦，让这些阶段尽量重叠。每个推理请求注册一个完成回调，请求一结束就能触发奖励计算，不用等整个 rollout batch 完成，这减少了长尾请求造成的流水线空闲。batch 构建和旧策略权重的 CPU-GPU 传输并行执行。参考模型的参数常驻 CPU 内存，在参考前向之前异步预取到 GPU，用完立即释放，让参考计算和主训练步有效重叠。系统还支持两种提前中止模式，按完成数量或按时间阈值。被中止的提示可以缓存复用，在不明显降低数据利用率的前提下控制长尾延迟。

**Fine-grained runtime memory management for multimodal workloads.** Standard recomputation schemes are largely designed around text-only training and do not adequately address the memory bottlenecks introduced by multimodal inputs. To address this, we design separate memorymanagement strategies for the vision-side ViT and projector modules, combining targeted recomputation with CPU offloading. This prevents activation memory from scaling linearly with the number of images in the naïve way, and substantially reduces runtime memory pressure while preserving overall computational efficiency.

**面向多模态负载的细粒度运行时显存管理。** 标准的重计算方案主要围绕纯文本训练设计，没有很好地处理多模态输入带来的显存瓶颈。为此，我们为视觉侧的 ViT 和投影模块分别设计显存管理策略，把定向重计算和 CPU 卸载结合起来。这样激活显存不会像朴素做法那样随图像数量线性增长，运行时显存压力大幅降低，整体计算效率不受影响。

**Topology-aware partitioning and dynamic load balancing for visual inputs.** For visual inputs such as long videos, where sequence lengths vary significantly, we further introduce a topology-aware partitioning and dynamic load-balancing scheme. In a conventional implementation, partitioning is performed during the forward pass, which means each rank must first hold the full patch tensor before redistribution, leading to unnecessary memory and communication overhead. To address this, we move CP and TP partitioning upstream into the data-loading stage and align partition boundaries with downsample groups, thereby eliminating the need for cross-rank patch aggregation. After load balancing across DP groups, precise dispatch is carried out through asynchronous all-to-all communication, so that each rank receives only the partition it actually needs. We further move large Python objects off the GPU communication path and onto the CPU path, which reduces GPU communication buffer overhead by about 7 GB in practice. For the variable-length sequences produced during rollout, we additionally perform joint bin-packing over both sequence length and ViT token count, leading to better-balanced micro-batches for both compute and memory pressure.

**面向视觉输入的拓扑感知切分与动态负载均衡。** 对长视频这类序列长度差异很大的视觉输入，我们进一步引入拓扑感知的切分和动态负载均衡方案。常规实现在前向时才切分，每个 rank 要先持有完整的 patch 张量再重新分发，带来不必要的显存和通信开销。我们把 CP 和 TP 的切分前移到数据加载阶段，并让切分边界和下采样组对齐，省掉跨 rank 的 patch 汇聚。在 DP 组之间做完负载均衡后，通过异步 all-to-all 通信精确分发，每个 rank 只拿到自己真正需要的那一份。我们还把大的 Python 对象从 GPU 通信路径挪到 CPU 路径，实际减少约 7 GB 的 GPU 通信缓冲开销。对 rollout 产生的变长序列，我们再按序列长度和 ViT token 数联合装箱，让 micro-batch 在计算和显存压力上都更均衡。

## 3 Multimodal Agent Capabilities and Ecosystem（多模态智能体能力与生态）

## 3.1 Multimodal Toolchain Expansion（多模态工具链扩展）

GLM-5V-Turbo further expands its multimodal toolchain<sup>1</sup>, enabling the model to support a fuller perception–planning–execution loop in more realistic environments. In addition to expanding its repertoire of visual tools, the model demonstrates a sophisticated ability to maintain long-horizon engagement, frequently switching between multimodal search, annotation, screenshotting, and multimodal webpage reading tools to achieve thorough task resolution. Consequently, coding and task execution are no longer confined to textual interfaces but are instead iteratively grounded in a comprehensive, vision-based understanding of the environment.

GLM-5V-Turbo 扩展了多模态工具链<sup>1</sup>，目标是在更真实的环境里支撑更完整的感知-规划-执行循环。论文点名的工具类别是多模态搜索，标注，截图和多模态网页阅读，并称模型能在长程任务里在这些工具之间频繁切换；调用步骤不转写。论文的结论是：编程和任务执行不再局限于文本接口，而是建立在对环境的视觉理解之上。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>The proprietary tools can be accessed and experienced through GLM-5V-Turbo model on [https://chat.z.ai/](https://chat.z.ai/).</span></small>

<sup>1</sup> 脚注：这些专有工具可以在 https://chat.z.ai/ 上通过 GLM-5V-Turbo 使用。

<!-- page 6 of 30 -->

Table 1: Categorization of multimodal tools and processing functions based on application scenarios and tool sets. Tools prefixed with zai\_ are proprietary developments, while the GLM-5V-Turbo model also maintains compatibility with other user-defined custom tools.

表 1：按应用场景和工具集对多模态工具与处理函数的分类。前缀为 zai_ 的工具是自研专有工具，GLM-5V-Turbo 也兼容用户自定义工具。

<table><tr><td>Scenarios</td><td>Tool Sets</td><td>Tool Names</td></tr><tr><td rowspan="4">General</td><td>Recognition Tools</td><td>zai_recognize_plantzai_recognize_locationzai_recognize_person</td></tr><tr><td>Multimodal Search</td><td>zai_search_web_textzai_search_web_by_imagezai_search_similar_imageszai_search_web_imageszai_search_scholar</td></tr><tr><td>Browser Tools</td><td>zai_load_image_from_urlzai_read_webpage</td></tr><tr><td>Image Processing</td><td>zai_crop_imagezai_draw_imageBounding_boxeszai_draw_image_point_markerszai_draw_image_geometryzai_draw_image_3d_bounding_boxeszai_draw_video_objects_tracking</td></tr><tr><td rowspan="2">Creation</td><td>Web Creation</td><td>submit_planapply_editszai_generate_web_htmlzai_generate_web_outline</td></tr><tr><td>Slide Creation</td><td>zai_generate_slide_htmlzai_generate_outline_ppt</td></tr><tr><td>Deep Research</td><td>Multimodal DR Tools</td><td>zai_dr_pythonzai_dr_open_url_mmzai_dr_visit_imgzai_dr_searchzai_dr_images_searchzai_dr_images_lens</td></tr></table>

（表 1 只保留名称和数量：General 场景下 Recognition Tools 3 个，Multimodal Search 5 个，Browser Tools 2 个，Image Processing 6 个；Creation 场景下 Web Creation 4 个（其中 `submit_plan` 和 `apply_edits` 不带 zai_ 前缀），Slide Creation 2 个；Deep Research 场景下 Multimodal DR Tools 6 个，合计 28 个名字。MinerU 把同一格里的多个工具名连成了一串，例如 「zai_recognize_plantzai_recognize_locationzai_recognize_person」 实为 `zai_recognize_plant`，`zai_recognize_location`，`zai_recognize_person` 三个；「zai_draw_imageBounding_boxes」 里的大写 B 照录。）

These architectural advancements are validated by significant performance gains across specialized benchmarks. Compared to our recent model GLM-4.6V [37], GLM-5V-Turbo demonstrates a substantial leap in complex multimodal tasks; notably, it achieves a score of 30.0 on MMSearch-Plus [35], nearly an eightfold improvement over the previous generation. Strong growth is also evident in BrowseComp-VL [10] (51.9) and ImageMining (30.7), which specifically test the model’s ability to navigate web interfaces and extract deep visual insights. By matching or exceeding the performance of industry benchmarks like Kimi K-2.5 [36] and Claude Opus 4.6 [4] in these categories, GLM-5V-Turbo proves its capability to handle the high-dimensional reasoning required for modern agentic workflows.

论文称这些改进在专门基准上得到验证。和上一代 GLM-4.6V [37] 相比，GLM-5V-Turbo 在 MMSearch-Plus [35] 上得 30.0，原文说接近上一代的八倍；BrowseComp-VL [10] 51.9，ImageMining 30.7，这两项考的是操作网页界面和挖掘深层视觉信息。论文称在这几类上达到或超过 Kimi K-2.5 [36] 和 Claude Opus 4.6 [4]，足以应对现代智能体工作流所需的高维推理。

> **对一下：** 「接近八倍」 和 「达到或超过 Claude Opus 4.6」 能在本文里核实吗？
> 八倍无法核实。本文没有印 GLM-4.6V 在 MMSearch-Plus 上的分数，第 11 页图 4 也没有 GLM-4.6V 这一列；按八倍反推上一代大约 4 分上下，这只是推算，不是原文数字。对 Claude 的比较看第 11 页图 4: MMSearch-Plus 30.0 对 25.6，BrowseComp-VL 51.9 对 35.9，成立；ImageMining 一格 Claude Opus 4.6 是 「-」，没有分数，这一项上 「超过」 没有依据。另外本段写 「Kimi K-2.5」，图 4 表头和参考文献 [36] 写 「Kimi K2.5」，是同一个模型的两种写法。

This expansion is particularly important for multimodal agents. Many real-world tasks are not simply a matter of reading text and calling functions; they require the model to first interpret the visual environment, decide what to do next, and then continue adapting its behavior based on the outcome of its actions. For example, when reproducing a real website, the model can first use a multimodal GUI agent to explore the site through screenshots, interaction with page elements, and navigation across pages, building a richer understanding of layout, functionality, and interaction flow. It can then rely on its native UI-to-code capability to reproduce the site more faithfully. Likewise, when media assets such as images need to be incorporated, they can be processed directly through native tools such as cropping before being embedded into the final output.

这种扩展对多模态智能体尤其重要。很多真实任务不只是读文本，调函数；模型要先理解视觉环境，决定下一步，再根据行动结果不断调整。论文举的例子是复刻真实网站和处理图片素材，涉及的能力名称是多模态 GUI 智能体，原生 UI 转代码和裁剪工具。操作步骤不转写。

<!-- page 7 of 30 -->

## 3.2 Integration with External Agent Frameworks: Claude Code and AutoClaw（与外部智能体框架集成：Claude Code 与 AutoClaw）

A critical component of GLM-5V-Turbo’s deployment strategy is its seamless integration with industry-standard external agent frameworks. By moving beyond isolated tool calls, the model serves as the cognitive core for systems like Claude Code and AutoClaw [50], bridging the gap between high-level reasoning and low-level system execution. The integration with Claude Code transforms GLM-5V-Turbo from a passive code generator into an active system-level collaborator. Within this framework, the model leverages its multimodal capabilities to navigate complex terminal environments and local file systems. While Claude Code handles the logic and environment, AutoClaw provides the "hands" for browser-based and GUI-centric automation. GLM-5V-Turbo acts as the vision-language controller for AutoClaw, enabling sophisticated agentic workflows.

GLM-5V-Turbo 部署策略的一个关键部分，是和业界常用的外部智能体框架无缝集成。它不再只做孤立的工具调用，而是作为 Claude Code 和 AutoClaw [50] 这类系统的认知核心，连接高层推理和底层系统执行。和 Claude Code 集成后，GLM-5V-Turbo 从被动的代码生成器变成主动的系统级协作者，在这个框架里用多模态能力操作复杂的终端环境和本地文件系统。Claude Code 负责逻辑和环境，AutoClaw 提供面向浏览器和 GUI 自动化的 「手」。GLM-5V-Turbo 是 AutoClaw 的视觉-语言控制器，支撑复杂的智能体工作流。

The convergence of GLM-5V-Turbo with these frameworks facilitates a complete perception–planning–execution loop. By offloading specific execution logic to Claude Code and AutoClaw, the model can focus on high-dimensional reasoning. This transition marks a fundamental shift in the model’s role: it is no longer just a text-based assistant, but a multimodal actor grounded in real-world environments, capable of autonomous task resolution across diverse digital interfaces.

GLM-5V-Turbo 和这些框架结合，形成完整的感知-规划-执行循环。把具体执行逻辑交给 Claude Code 和 AutoClaw，模型可以专注于高维推理。论文把这看作模型角色的根本转变：它不再只是文本助手，而是扎根于真实环境的多模态行动者，能在各种数字界面上自主完成任务。

## 3.3 ImageMining: A Self-Collected Vision-Centric Deep Search Benchmark（ImageMining：自采的以视觉为中心的深度搜索基准）

The core potential of a multimodal agent lies in anchoring reasoning within visual contexts—a paradigm we term “think with image, deep search with image.” To evaluate this, we introduce **ImageMining**<sup>2</sup>, a benchmark designed to test the integration of high-density visual understanding and autonomous multimodal search.

多模态智能体的核心潜力在于把推理锚定在视觉上下文里，我们称之为 「think with image, deep search with image」（借图思考，借图深搜）。为了评测这一点，我们推出 **ImageMining**<sup>2</sup>，一个检验高密度视觉理解与自主多模态搜索结合程度的基准。

Unlike traditional VQA [10; 19; 35], ImageMining requires models to actively mine visual inputs through agentic behaviors. Success relies on multi-step tool calls, such as localized cropping or magnification of minute details to refine search queries. This “Deep-Wide-Search” spectrum evaluates models on their search breadth across sources and their depth in visual reasoning, where task performance correlates strongly with the precision of on-image tool usage.

和传统 VQA [10; 19; 35] 不同，ImageMining 要求模型通过智能体行为主动挖掘视觉输入，成功依赖多步工具调用，论文点名的工具是局部裁剪和放大。这个 「Deep-Wide-Search」 谱系从两头评测模型：跨来源的搜索广度，以及视觉推理的深度；论文称任务表现和图上工具使用的精度高度相关。

ImageMining comprises 217 curated test cases derived from manually collected trace samples, spanning seven domains (Social, Entertainment, Products, Places, Rich Text, Nature, and Science) and five reasoning categories:

ImageMining 包含 217 个精选测试样例，来自人工收集的轨迹样本，覆盖七个领域（Social, Entertainment, Products, Places, Rich Text, Nature, Science）和五个推理类别：

• **Universal Recognition:** Fine-grained identification of flora, fauna, and artifacts.

• **通用识别：** 对植物，动物和器物的细粒度识别。

• **Spatio-Temporal Reasoning:** Geographic deduction grounded in visual cues.

• **时空推理：** 基于视觉线索的地理推断。

• **Event Reasoning:** Comprehension of news events and product launches.

• **事件推理：** 理解新闻事件和产品发布。

• **Text-based Reasoning:** Reasoning over embedded rich text (e.g., academic papers, reports).

• **基于文本的推理：** 对图中嵌入的富文本（如学术论文，报告）做推理。

• **Visual Search:** Cross-referencing visual inputs to retrieve specific artworks or imagery.

• **视觉搜索：** 用视觉输入交叉比对，找出特定的艺术品或图像。

To equip GLM-5V-Turbo with these capabilities, we developed a multi-stage automated data pipeline covering knowledge discovery, QA reconstruction, and quality filtering. A pivotal constraint in this process is the **“Visual Jump”** (WEB\_VISUAL): during discovery, intermediate reasoning hops must involve visual transitions, forcing the model to parse images rather than relying on textual shortcuts or parametric knowledge. Furthermore, we constructed specialized **OCR Search data** for charts, maps, and posters. This compels the model to perform entity isolation and localized cropping before initiating search chains, transforming images from static inputs into interactive environments for deep exploration.

为了让 GLM-5V-Turbo 具备这些能力，我们开发了多阶段自动化数据流水线，覆盖知识发现，QA 重构和质量过滤。其中一个关键约束是 **「Visual Jump」** (WEB_VISUAL)：发现阶段的中间推理跳必须包含视觉转换，迫使模型解析图像，而不是走文本捷径或靠参数知识。此外，我们还为图表，地图和海报构建了专门的 **OCR Search 数据**。论文称这让图像从静态输入变成可供深入探索的交互环境；其中的工具操作步骤不转写。

> **问：** ImageMining 的 30.7 是在谁出的题上拿的分？
> 是同一团队自己出的题。第 7 页说 217 个样例来自人工收集的轨迹，本段又说为了让模型具备这些能力，专门搭了数据流水线造训练数据，两边围绕的是同样的五个推理类别。第 11 页图 4 里 ImageMining 只有 GLM-5V-Turbo 30.7 和 Kimi K2.5 24.4 两个分，Claude Opus 4.6 是 「-」。训练数据和评测样例是否隔离，本文没有说明。读这个分数时要记住：它是自建基准上的自评分，可比的外部对手只有一家。

## 3.4 Multimodal Deep Research and Content Creation（多模态深度研究与内容创作）

Leveraging its agentic capabilities, GLM-5V-Turbo facilitates a complete multimodal deep research workflow, encompassing iterative information gathering, evidence consolidation, and long-form synthesis from heterogeneous sources. Unlike traditional text-centric agents [12; 27], this workflow begins with open-ended objectives and proceeds through autonomous cycles of planning, multimodal reading, and state updating. By natively parsing visually rich webpages, charts, and structured documents, the model accesses high-value evidence—such as slides and figures—that is typically discarded in text-only pipelines.

借助智能体能力，GLM-5V-Turbo 支持完整的多模态深度研究工作流，包括迭代式信息收集，证据整合，以及从异构来源生成长篇综述。和传统以文本为中心的智能体 [12; 27] 不同，这个工作流从开放目标出发，自主循环地做规划，多模态阅读和状态更新。模型原生解析视觉丰富的网页，图表和结构化文档，因此能拿到幻灯片，图等高价值证据，这些在纯文本流水线里通常会被丢掉。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://github.com/zai-org/ImageMining](https://github.com/zai-org/ImageMining)</span></small>

<sup>2</sup> 脚注：ImageMining 的仓库地址 https://github.com/zai-org/ImageMining.

<!-- page 8 of 30 -->

![Image block](images/p08-a.png)

（图：18 页报告的缩略图，按 1 到 18 编号排成三行。第 3 页是 「OpenClaw Architecture」 框图，第 5 页是 「Hermes Architecture」 框图，第 9 页有一张深色示意图，第 11 页是紫色柱状图，第 12, 14, 17 页是深色截图，其余多为正文页。）

![Image block](images/p08-b.png)

（图：15 页博客的缩略图，按 1 到 15 编号。第 1 页和第 9 页有蓝色柱状图，第 3 页有框图，第 5, 6 页是表格，第 7 页是两张深色截图，第 8 页是折线图，第 15 页只有一小段文字。）

Figure 3: Examples of multimodal deep research and content creation. (a) A multimodal deep research report, where the visuals are harvested from the Internet via web search, and selected and complied by GLM-5V-Turbo (Query: Compare OpenClaw and Hermes agent systems and give a comprehensive report. Note that the output should be a text-image interleaved markdown.). (b) A technical blog excerpted from an academic paper [49], where the visual elements are cropped from the original paper and inserted into the output to compose a complete blog, fully automated by GLM-5V-Turbo.

图 3：多模态深度研究与内容创作示例。（a）一份多模态深度研究报告，其中的图片由 GLM-5V-Turbo 通过网页搜索从互联网收集，再挑选并编排（Query：比较 OpenClaw 和 Hermes 两个智能体系统，写一份完整报告，输出为图文交错的 markdown）。（b）一篇由学术论文 [49] 改写的技术博客，图片元素从原论文裁出后插入输出，组成完整博客，全程由 GLM-5V-Turbo 自动完成。原文 「complied」 应为 compiled，照录。

A defining characteristic of this system is its integrated multimodal reasoning. Rather than treating images as peripheral data, GLM-5V-Turbo extracts textual and visual evidence (e.g., table regions, screenshots) in tandem. This is crucial for realistic research environments where key insights are often distributed across document layouts and visual artifacts rather than isolated within text paragraphs.

这个系统的一个关键特征是一体化的多模态推理。GLM-5V-Turbo 不把图像当边缘数据，而是同时抽取文本证据和视觉证据（如表格区域，截图）。在真实研究环境里，关键信息常常分散在文档版面和视觉材料里，而不是只在正文段落中，所以这一点很重要。

Beyond information acquisition, GLM-5V-Turbo supports diverse, presentation-oriented downstream formats:

除了信息获取，GLM-5V-Turbo 还支持多种面向展示的下游格式：

• **Interleaved Reports:** Generating text-image interleaved outputs (see Fig. 3 (a)) where visual evidence is embedded alongside grounded explanations—ideal for comparative analysis and literature reviews.

• **图文交错报告：** 生成图文交错的输出 (见图 3 (a))，视觉证据和有依据的解释放在一起，适合对比分析和文献综述。

• **Deep Research to PPT:** Synthesizing gathered materials into structured slide decks, including page allocation and multimodal content organization, to mirror professional presentation workflows.

• **深度研究转 PPT:** 把收集到的材料整理成结构化幻灯片，包括页数分配和多模态内容编排，贴近专业的演示制作流程。

• **Document-Style Write-ups:** Creating blog-like interpretations or structured notes (see Fig. 3 (b)) that maintain the visual-textual integrity of the research findings.

• **文档式写作：** 生成博客式解读或结构化笔记 (见图 3 (b))，保持研究结论的图文完整性。

These capabilities further extend to document-grounded generation. Users can provide complex source materials for the model to reorganize into structured slides or interleaved interpretations. By preserving the synergy between textual conclusions and supporting visual evidence, GLM-5V-Turbo marks a system-level transition from simple multimodal information retrieval to comprehensive multimodal transformation and presentation.

这些能力还延伸到基于文档的生成。用户可以提供复杂的原始材料，让模型重组成结构化幻灯片或图文交错的解读。论文称，通过保持文字结论与支撑性视觉证据之间的配合，GLM-5V-Turbo 实现了从简单多模态信息检索到完整多模态转换与呈现的系统级转变。

## 3.5 Official Skills（官方技能）

As a foundation model adept at agentic and coding tasks, GLM-5V-Turbo can be readily integrated into general and coding agent frameworks (such as OpenClaw [34], AutoClaw [50] and Claude Code [3]), which are becoming increasingly popular in the community. To make it easier for users to utilize GLM-5V-Turbo within these agent systems, and to better leverage its strengths, we provide a set of official skills, which fall into two categories: one is built upon the native capabilities of the GLM-5V-Turbo model, and the other wraps GLM-5V-Turbo as an external tool (in the form of a MaaS API) for OpenClaw, AutoClaw and Claude Code to invoke. Additionally, we have developed 5 skills based on the previously released specialized models, GLM-OCR [8] and GLM-Image [38], to support a wider range of scenarios and tasks. To help users better understand, install, and use the official skills, we also provide a unified master skill ([https://clawhub.ai/jaredforreal/glm-master-skill](https://clawhub.ai/jaredforreal/glm-master-skill)).

作为擅长智能体和编程任务的基础模型，GLM-5V-Turbo 可以方便地接入通用和编程智能体框架（如 OpenClaw [34]，AutoClaw [50] 和 Claude Code [3]），这些框架在社区里越来越流行。为了让用户在这些智能体系统里更方便地使用 GLM-5V-Turbo，更好地发挥它的长处，我们提供了一套官方技能，分两类：一类建立在 GLM-5V-Turbo 模型的原生能力上，另一类把 GLM-5V-Turbo 包装成外部工具（MaaS API 形式），供 OpenClaw，AutoClaw 和 Claude Code 调用。此外，我们基于此前发布的专用模型 GLM-OCR [8] 和 GLM-Image [38] 开发了 5 个技能，覆盖更多场景和任务。为了帮助用户理解，安装和使用这些官方技能，我们还提供了一个统一的总技能（https://clawhub.ai/jaredforreal/glm-master-skill）。

The official skills are listed in Tab. 2 and more details can be found in the Github repository: [https://github.com/zai-org/GLM-skills.](https://github.com/zai-org/GLM-skills)

官方技能列在表 2，更多细节见 GitHub 仓库 https://github.com/zai-org/GLM-skills.

<!-- page 9 of 30 -->

Table 2: Overview of official skills supported by GLM-5V-Turbo.

表 2: GLM-5V-Turbo 支持的官方技能一览。

| Skill | Type | URL |
| --- | --- | --- |
| PDF-to-Web | Native | https://clawhub.ai/zai-org/glmv-pdf-to-web |
| PDF-to-PPT | Native | https://clawhub.ai/zai-org/glmv-pdf-to-ppt |
| Web Replication | Native | https://clawhub.ai/zai-org/glmv-web-replication |
| PRD-to-App | Native | https://clawhub.ai/zai-org/glmv-prd-to-app |
| Stock Analyst | Native | https://clawhub.ai/zai-org/glmv-stock-analyst |
| Image Captioning | External Tool | https://clawhub.ai/JaredforReal/glmv-caption |
| Visual Grounding | External Tool | https://clawhub.ai/jaredforreal/glmv-grounding |
| Doc-based Writing | External Tool | https://clawhub.ai/jaredforreal/glmv-doc-based-writing |
| Resume Screening | External Tool | https://clawhub.ai/JaredforReal/glmv-resume-screen |
| Prompt Generation | External Tool | https://clawhub.ai/JaredforReal/glmv-prompt-gen |
| General OCR | Specialized | https://clawhub.ai/JaredforReal/glmocr |
| Table Recognition | Specialized | https://clawhub.ai/JaredforReal/glmocr-table |
| Handwriting Recognition | Specialized | https://clawhub.ai/JaredforReal/glmocr-handwriting |
| Formula Recognition | Specialized | https://clawhub.ai/JaredforReal/glmocr-formula |
| Image Generation | Specialized | https://clawhub.ai/JaredforReal/glm-image-gen |

（表 2 共 15 个技能：Native 5 个（PDF-to-Web, PDF-to-PPT, Web Replication, PRD-to-App, Stock Analyst），External Tool 5 个（Image Captioning, Visual Grounding, Doc-based Writing, Resume Screening, Prompt Generation），Specialized 5 个（General OCR, Table Recognition, Handwriting Recognition, Formula Recognition, Image Generation）。第 8 页说基于 GLM-OCR 和 GLM-Image 做了 5 个，正好对应 Specialized 这 5 行。URL 照录，账号名有 zai-org，JaredforReal，jaredforreal 三种写法。）

## 4 Design Lenses from Development（开发中得到的设计视角）

Beyond the developments described above, the process of building GLM-5V-Turbo also led us to several practical lenses for agentic model development. We present them not as universal rules, but as design perspectives that repeatedly proved useful in our development process.

除了上面描述的开发工作，构建 GLM-5V-Turbo 的过程还让我们形成了几条关于智能体模型开发的实用视角。我们不把它们当普适规则，只当作在开发中反复证明有用的设计视角。

**Lens 1:** Perception remains foundational to higher-level multimodal capability.

**视角 1:** 感知仍是更高层多模态能力的基础。

Recent work has placed increasing emphasis on higher-level abilities such as planning, reasoning, and reflection. Our observation, however, is that further gains in multimodal capability still depend critically on perception. Even among the strongest current VLMs, errors in fine-grained perception and spatial understanding remain common, and these often propagate into downstream reasoning, decision-making, and execution. Many failures that appear high-level, in other words, begin with the model not seeing the environment accurately enough.

近来的工作越来越强调规划，推理和反思这类高层能力。但我们的观察是，多模态能力的进一步提升仍然很依赖感知。即便是当前最强的 VLM，细粒度感知和空间理解上的错误也很常见，而且常常传导到下游的推理，决策和执行。换句话说，很多看起来是高层的失败，起点是模型没把环境看准。

In our development, multimodal coding and grounding proved to be useful proxy tasks for perceptual learning. Tasks such as frontend or SVG coding require the model to capture layout, structure, relative position, and local detail, rather than relying only on coarse semantics. We found that adding paired data between subject-specific images and their SVG representations during pretraining contributed positively to downstream STEM problem solving, while strengthening grounding-related training during RL also improved GUI-agent performance. These observations suggest that some seemingly downstream structured tasks can in fact provide a useful route to better perception.

在我们的开发中，多模态编程和 grounding 是感知学习的有用代理任务。前端或 SVG 编程这类任务要求模型抓住版面，结构，相对位置和局部细节，不能只靠粗粒度语义。我们发现，预训练时加入学科图像与其 SVG 表示的配对数据，对下游 STEM 解题有正面贡献；RL 阶段加强 grounding 相关训练，也提升了 GUI 智能体表现。这说明一些看似下游的结构化任务，其实可以成为改善感知的途径。

We also find that explicitly training the model to critique its own perception can help reduce hallucination during generation. In GUI-agent instruction tuning, we include a subset of critic data that targets errors in the reasoning process, such as misreading interface details, misidentifying target elements, and making incorrect decisions about the next action. This improves the model’s observation quality on GUI details and reduces several recurring perception failure modes. More broadly, our view is that perception is not a low-level module that can simply be solved early and then left behind; it continues to shape the upper bound of higher-level multimodal capability.

我们还发现，显式训练模型批评自己的感知，有助于减少生成中的幻觉。在 GUI 智能体指令微调里，我们加入一部分 critic 数据，针对推理过程中的错误，比如看错界面细节，认错目标元素，对下一步动作做出错误判断。这提高了模型对 GUI 细节的观察质量，减少了几种反复出现的感知失败。更宽地说，我们认为感知不是一个可以早早解决然后放在身后的低层模块，它会持续决定高层多模态能力的上限。

Lens 2: Agent capability can be more efficiently built through hierarchical optimization.

视角 2：智能体能力通过分层优化可以建得更高效。（原文这里的 「Lens 2」 没有加粗，和视角 1, 3 的排版不一致。）

Agent training is inherently resource-intensive: environment setup and task construction are costly, high-quality data is scarce, and reliable verification is often difficult. At the same time, agent tasks themselves are hard to optimize efficiently, since they typically involve complex compositions, long interaction trajectories, non-unique solution paths, and strong dependence on the evolving environment state. Under these conditions, a central question is how to maximize the return on data construction under limited resources.

智能体训练天生耗资源：环境搭建和任务构造成本高，高质量数据稀缺，可靠验证常常很难。同时，智能体任务本身也难以高效优化，因为它们通常组合复杂，交互轨迹长，解法路径不唯一，且强烈依赖不断变化的环境状态。在这些条件下，核心问题是如何在有限资源下让数据构造的回报最大。

<!-- page 10 of 30 -->

This led us to adopt a hierarchical optimization strategy. In our experience, agent capability is developed more effectively when optimization is distributed across multiple levels of the capability hierarchy, rather than concentrated primarily on high-level long-horizon tasks. In GUI-agent development, for example, this motivated us to build a multi-level task hierarchy spanning element perception, GUI grounding, single-step action prediction, and trajectory-level action prediction, and to use it in both SFT and RL. The appeal of this design is twofold: lower-level tasks are usually easier to construct, annotate, and verify than long-horizon ones under the same resource constraints; and when lower-level capabilities are still underdeveloped, pushing only on high-level tasks often fails to yield reliable gains and can instead make training less stable. Overall, hierarchical optimization serves not only as a way to improve efficiency, but also as a practical path toward more stable agent training.

这促使我们采用分层优化策略。按我们的经验，把优化分散到能力层级的多个层次上，比主要集中在高层长程任务上更有效。以 GUI 智能体开发为例，我们搭建了一个多层任务层级，涵盖元素感知，GUI grounding，单步动作预测和轨迹级动作预测，并在 SFT 和 RL 中都使用它。这个设计的好处有两点：同样资源约束下，低层任务通常比长程任务更容易构造，标注和验证；低层能力还没发展好时，只推高层任务往往拿不到可靠收益，反而可能让训练更不稳定。总体上，分层优化不只是提高效率的手段，也是让智能体训练更稳定的实用路径。

**Lens 3:** The key to constructing, evaluating, and optimizing end-to-end long-horizon tasks lies in clear task specification, reliable outcome verification, and controlled evaluation procedures.

**视角 3:** 构造，评测和优化端到端长程任务的关键，在于清楚的任务规格，可靠的结果验证和受控的评测流程。

For multimodal agents, the real challenge is often not extending tasks to longer horizons, but making end-to-end tasks stable enough to serve as meaningful targets for evaluation and optimization. Many realistic agent settings are inherently open-ended, with underspecified goals, ambiguous execution boundaries, and outcomes that depend heavily on intermediate decisions. As a result, they are often difficult to compare consistently and even harder to turn into reusable optimization signals.

对多模态智能体来说，真正的难点往往不是把任务拉得更长，而是让端到端任务足够稳定，能作为评测和优化的有意义目标。很多真实的智能体场景天生开放：目标说不清，执行边界模糊，结果很依赖中间决策。因此它们往往很难一致地比较，更难转成可复用的优化信号。

This led us to a broader view: the value of an end-to-end task depends not only on how realistic it is, but also on whether it can be specified clearly enough, verified reliably enough, and evaluated under sufficient procedural control to produce stable and reusable feedback. This perspective shaped how we think about data construction, evaluation, and downstream optimization. In multimodal agent settings, task definition often depends on multiple sources of constraint rather than a single prompt alone, while evaluation needs structure not only at the level of final outcomes but also at the level of the verification process itself. Under this view, task definition, verification design, and feedback structure should be considered together rather than in isolation.

这让我们形成一个更宽的看法：一个端到端任务的价值，不只取决于它多真实，还取决于它能否被说得足够清楚，验证得足够可靠，并在足够受控的流程下评测，从而产生稳定，可复用的反馈。这个视角影响了我们对数据构造，评测和下游优化的思考。在多模态智能体场景里，任务定义往往依赖多个约束来源，不只是一条提示；评测也不只需要在最终结果层面有结构，在验证过程本身的层面也需要结构。按这个看法，任务定义，验证设计和反馈结构应该放在一起考虑，而不是各自孤立。

Vision2Web [14], our benchmark for end-to-end visual website development, is one concrete instantiation of this view. Each task is grounded not just in a textual instruction, but in a richer specification that may include PRDs, mockups, reference pages, and resource assets, making the task definition better specified. On the evaluation side, rather than treating website development as a loosely specified open-ended problem, we use workflow-based verification so that execution is assessed through a controlled sequence of dependent steps rather than a single final state. This makes it easier to compare systems, attribute failures, and model different forms of signal separately — for example, functional correctness during interactive execution and visual consistency in a more isolated comparison setting. In this sense, Vision2Web is not only a benchmark, but also a concrete attempt to align task construction, verification, and feedback design in a way that better supports reliable evaluation and optimization.

Vision2Web [14] 是我们的端到端视觉网站开发基准，也是这一看法的具体体现。每个任务不只基于一条文字指令，而是基于更丰富的规格，可能包括 PRD，视觉稿，参考页面和资源素材，让任务定义更完整。评测上，我们不把网站开发当成松散的开放问题，而是用基于工作流的验证，通过一串受控的，相互依赖的步骤来评估执行，而不是只看单一最终状态。这样更容易比较系统，归因失败，并把不同形式的信号分开建模，比如交互执行中的功能正确性，以及在更隔离的比较设定下的视觉一致性。在这个意义上，Vision2Web 不只是一个基准，也是一次把任务构造，验证和反馈设计对齐起来，以更好支撑可靠评测与优化的具体尝试。

> **再看：** Vision2Web 是本团队的基准，GLM-5V-Turbo 在上面排第几？
> 排最后。参考文献 [14] 的作者里，除第一作者 Z. He 无法从缩写确认外，W. Hong, Z. Yang, Z. Pan, M. Liu, X. Gu, J. Tang 都能在第 13 页名单里找到对应的全名（Wenyi Hong, Zhen Yang, Ziyang Pan, Mingdao Liu, Xiaotao Gu, Jie Tang）。第 11 页图 4 的 Vision2Web 一行：GLM-5V-Turbo 31.0, Kimi K2.5 33.2, Claude Opus 4.6 43.5。同属多模态编程的 Flame-VLM-Code 上 Claude 也更高（98.8 对 93.8）。多模态编程三项里 GLM-5V-Turbo 只在 Design2Code 上领先，第 2 页挑出来讲的也正是这一项。

## 5 Evaluation（评测）

We evaluate GLM-5V-Turbo across four categories:

我们从四类评测 GLM-5V-Turbo:

• **Multimodal Coding**: Desing2Code [31], Flame-VLM-Code [9], Vision2Web [14];

• **多模态编程**：Design2Code [31]（原文拼作 「Desing2Code」），Flame-VLM-Code [9], Vision2Web [14];

• **Multimodal ToolUse**: ImageMining, BrowseComp-VL [10], MMSearch [18], MMSearch-Plus [35], SimpleVQA [7], Facts [17], V\* [41];

• **多模态工具使用**：ImageMining, BrowseComp-VL [10], MMSearch [18], MMSearch-Plus [35], SimpleVQA [7], Facts [17], V* [41];

• **GUI Agent**: OSWorld [44], AndroidWorld [30], WebVoyager [13];

• **GUI 智能体**：OSWorld [44], AndroidWorld [30], WebVoyager [13];

• **Text-only Coding and Claw**: CC-Bench-V2 [49], PinchBench [1], ClawEval [46], ZClaw-Bench [2].

• **纯文本编程与 Claw**: CC-Bench-V2 [49], PinchBench [1], ClawEval [46], ZClaw-Bench [2]。

Across these dimensions, GLM-5V-Turbo exhibits a consistent pattern: it achieves strong performance on multimodal benchmarks for coding and agent-oriented tasks, while maintaining solid capability on text-only tasks. This balance aligns with our core objective for GLM-5V-Turbo: **building foundational multimodal agentic capability without sacrificing the coding and reasoning ability required in text-first workflows.**

在这几个维度上，GLM-5V-Turbo 呈现一致的模式：在面向编程和智能体任务的多模态基准上表现强，在纯文本任务上保持扎实。这种平衡符合我们对 GLM-5V-Turbo 的核心目标：**建立基础的多模态智能体能力，同时不牺牲以文本为主的工作流所需的编程与推理能力。**

On multimodal coding and tool-use benchmarks, GLM-5V-Turbo performs strongly on UI-to-code generation, visual website development, multimodal search, and visually grounded QA. It is also

在多模态编程和工具使用基准上，GLM-5V-Turbo 在 UI 转代码生成，视觉网站开发，多模态搜索和有视觉依据的问答上表现强。它在（句子在第 11 页接续）

<!-- page 11 of 30 -->

<table><tr><td colspan="2">Benchmarks</td><td>GLM-5V-Turbo</td><td>Kimi K2.5</td><td>Claude Opus 4.6</td></tr><tr><td rowspan="3">Multimodal Coding</td><td>Design2Code</td><td>94.8</td><td>91.3</td><td>77.3</td></tr><tr><td>Flame-VLM-Code</td><td>93.8</td><td>88.8</td><td>98.8</td></tr><tr><td>Vision2Web</td><td>31.0</td><td>33.2</td><td>43.5</td></tr><tr><td rowspan="7">Multimodal ToolUse</td><td>ImageMining</td><td>30.7</td><td>24.4</td><td>-</td></tr><tr><td>BrowseComp-VL</td><td>51.9</td><td>42.9</td><td>35.9</td></tr><tr><td>MMSearch</td><td>72.9</td><td>58.7</td><td>63.8</td></tr><tr><td>MMSearch-Plus</td><td>30.0</td><td>25.6</td><td>25.6</td></tr><tr><td>SimpleVQA</td><td>78.2</td><td>71.5</td><td>63.2</td></tr><tr><td>Facts</td><td>58.6</td><td>57.8</td><td>-</td></tr><tr><td>V*</td><td>89.0</td><td>84.3</td><td>66.5</td></tr><tr><td rowspan="3">GUI Agent</td><td>OSWorld</td><td>62.3</td><td>63.3</td><td>72.2</td></tr><tr><td>AndroidWorld</td><td>75.7</td><td>43.1</td><td>62.0</td></tr><tr><td>WebVoyager</td><td>88.5</td><td>84.3</td><td>88.0</td></tr></table>

（图 4 其实是一张表，三列模型：GLM-5V-Turbo, Kimi K2.5, Claude Opus 4.6。多模态编程：Design2Code 94.8 / 91.3 / 77.3, Flame-VLM-Code 93.8 / 88.8 / 98.8, Vision2Web 31.0 / 33.2 / 43.5。多模态工具使用：ImageMining 30.7 / 24.4 / -, BrowseComp-VL 51.9 / 42.9 / 35.9, MMSearch 72.9 / 58.7 / 63.8, MMSearch-Plus 30.0 / 25.6 / 25.6, SimpleVQA 78.2 / 71.5 / 63.2, Facts 58.6 / 57.8 / -, V* 89.0 / 84.3 / 66.5. GUI 智能体：OSWorld 62.3 / 63.3 / 72.2, AndroidWorld 75.7 / 43.1 / 62.0, WebVoyager 88.5 / 84.3 / 88.0.）

Figure 4: Evaluation of GLM-5V-Turbo on multimodal coding, tool-use, and GUI agent benchmarks.

图 4: GLM-5V-Turbo 在多模态编程，工具使用和 GUI 智能体基准上的评测。

> **看表：** 多模态分数和纯文本分数是不是同一列？
> 不是。第 11 页有两张表。多模态三类（编程，工具使用，GUI 智能体）只出现在图 4，列是 GLM-5V-Turbo，Kimi K2.5，Claude Opus 4.6 三家；纯文本编程和 Claw 只出现在图 5，多了一列 GLM-5-Turbo，共四家。GLM-5-Turbo 是纯语言基座，图 4 里没有它，所以 「加了视觉以后多模态涨了多少」 在本文里没有基座对照，能对照的只有图 5 里 「纯文本掉没掉」。两张表都题为 「Figure」，实为表格。GLM-5V-Turbo 在两张表里各有一列，两列之间没有共同的基准，不能合并成一个总分。

> **拆开：** 工具开和关有没有分开的列？
> 没有。图 4 每个模型只有一列分数，「Multimodal ToolUse」 七行没有 「w/ tools」 和 「w/o tools」 之分。SimpleVQA，Facts，V* 被归在工具使用类，本文没说它们是开工具还是关工具跑的。第 6 页表 1 的 zai_ 工具是专有工具，Kimi K2.5 和 Claude Opus 4.6 用的是什么工具集，本文也没写；Claude 在 ImageMining 和 Facts 上是 「-」。所以图 4 工具类的分差里，模型差异和工具差异分不开。第 4 页 MMSearch +3.5% 是 RL 对 SFT 的差，也不是工具开关的差。

highly competitive on GUI-agent benchmarks such as AndroidWorld and WebVoyager, indicating that its visual understanding transfers effectively into grounded interaction and action. At the same time, on CC-Bench-V2 including CC-Backend, CC-Frontend, and CC-Repo-Exploration which evaluate model performance on Claude Code framework, the model remains solid in pure-text coding, suggesting that the addition of visual capability does not materially erode its underlying coding performance, which is a critical feature for the multimodal agentic foundations.

（接上页）在 AndroidWorld 和 WebVoyager 等 GUI 智能体基准上也很有竞争力，说明它的视觉理解能有效迁移到有依据的交互与行动。同时，在 CC-Bench-V2（包括 CC-Backend，CC-Frontend 和 CC-Repo-Exploration，评测模型在 Claude Code 框架上的表现）上，模型的纯文本编程保持扎实，说明加入视觉能力没有实质削弱底层编程表现，论文认为这是多模态智能体基础的关键特性。

<table><tr><td colspan="2">Benchmarks</td><td>GLM-5V-Turbo</td><td>GLM-5-Turbo</td><td>Kimi K2.5</td><td>Claude Opus 4.6</td></tr><tr><td rowspan="3">Coding</td><td>CC-Backend</td><td>22.8</td><td>20.5</td><td>25.3</td><td>26.9</td></tr><tr><td>CC-Frontend</td><td>68.4</td><td>69.4</td><td>62.3</td><td>75.9</td></tr><tr><td>CC-Repo-Exploration</td><td>72.2</td><td>68.9</td><td>66.7</td><td>74.4</td></tr><tr><td rowspan="3">Claw</td><td>PinchBench(Best/Avg)</td><td>87.0 / 80.7</td><td>86.5 / 81.1</td><td>84.8 / 79.2</td><td>93.3 / 82.9</td></tr><tr><td>ClawEval(Pass^3/Pass@3)</td><td>57.7 / 75.0</td><td>51.0 / 72.1</td><td>52.9 / 73.1</td><td>66.3 / 77.9</td></tr><tr><td>ZClawBench</td><td>57.6</td><td>60.6</td><td>49.1</td><td>62.3</td></tr></table>

(图 5 也是表，四列：GLM-5V-Turbo, GLM-5-Turbo, Kimi K2.5, Claude Opus 4.6. Coding: CC-Backend 22.8 / 20.5 / 25.3 / 26.9, CC-Frontend 68.4 / 69.4 / 62.3 / 75.9, CC-Repo-Exploration 72.2 / 68.9 / 66.7 / 74.4. Claw: PinchBench (Best/Avg) 87.0/80.7, 86.5/81.1, 84.8/79.2, 93.3/82.9; ClawEval (Pass^3/Pass@3) 57.7/75.0, 51.0/72.1, 52.9/73.1, 66.3/77.9; ZClawBench 57.6 / 60.6 / 49.1 / 62.3.)

Figure 5: Evaluation of GLM-5V-Turbo on text coding and claw agent benchmarks.

图 5: GLM-5V-Turbo 在文本编程和 claw 智能体基准上的评测。

> **对一下：** 「保住纯文本能力」 逐项看是什么情况？
> 和 GLM-5-Turbo 一列逐项比：CC-Backend +2.3, CC-Repo-Exploration +3.3，PinchBench Best +0.5，ClawEval Pass^3 +6.7，Pass@3 +2.9，这五个数更高；CC-Frontend -1.0，PinchBench Avg -0.4，ZClawBench -3.0，这三个数更低。八个数五高三低，「没有实质削弱」 大体成立，但不是每项都不掉，第 2 页 「三项都超过」 的说法前面已经核对过。和 Claude Opus 4.6 比，这八个数全部低于它。

We also find that GLM-5V-Turbo transfers effectively to vision-enabled general agent frameworks. In particular, when integrated into Claw agent frameworks, the model can natively perceive on-screen content and act on it more effectively, leading to strong results on execution-oriented evaluations such as PinchBench, ClawEval, and ZClawBench. While Claw is only one representative framework, these results provide further evidence that the model’s multimodal capability is not limited to isolated benchmark gains, but carries over to realistic end-to-end agent execution.

我们还发现 GLM-5V-Turbo 能有效迁移到带视觉的通用智能体框架。特别是接入 Claw 智能体框架后，模型能原生感知屏幕内容并更有效地据此行动，在 PinchBench，ClawEval 和 ZClawBench 这类面向执行的评测上拿到很强的结果。Claw 只是一个有代表性的框架，但论文认为这些结果进一步说明，模型的多模态能力不局限于孤立的基准涨分，而能带到真实的端到端智能体执行中。

> **想：** Claw 三项算纯文本还是多模态？
> 本文说法不一。第 10 页的类别名是 「Text-only Coding and Claw」，第 11 页图 5 题为 「text coding and claw agent benchmarks」，都没把 Claw 明说成纯文本；本段又说接入 Claw 框架后模型 「natively perceive on-screen content」，意思是 Claw 评测里用到了视觉。第 2 页则把 Claw 评测和 「text-only setting」 的编程分开列。另一方面，GLM-5-Turbo 是纯语言模型，它在 Claw 三行也有分，说明这些评测至少能以纯文本方式跑。能确定是纯文本的只有 CC-Bench-V2 三项；Claw 三项两家是否在同一输入条件下测，本文没交代，不能把 GLM-5-Turbo 那一列当同条件对照。

## 6 Remaining Challenges（尚存的挑战）

Despite the progress described above, several challenges remain central to future agentic model development. In our view, the hardest open problems increasingly lie not in isolated capability improvement, but in agentic strategy emergence, long-horizon multimodal context management, and the growing entanglement between model capability and harness design.

尽管有上述进展，仍有几项挑战是今后智能体模型开发的核心。我们认为，最难的开放问题越来越不在孤立的能力提升，而在智能体策略的涌现，长程多模态上下文管理，以及模型能力和 harness 设计之间越来越深的耦合。

**How to enable the emergence of better agentic strategies.** Agent training still depends heavily on hand-crafted or strongly filtered cold-start trajectories. This is effective for initialization, but it also narrows the space of reasoning and action patterns the model is likely to explore, so later

**如何让更好的智能体策略涌现。** 智能体训练仍然很依赖手工构造或强过滤的冷启动轨迹。这对初始化有效，但也收窄了模型可能探索的推理与行动模式空间，所以之后的（句子在第 12 页接续）

<!-- page 12 of 30 -->

improvement often remains local: the model becomes better at executing familiar paths, without discovering genuinely better ones. In our experiments, we found that increasing trajectory diversity at the cold-start stage can partially loosen this constraint, making it easier for RL to uncover nearby but improved variants. This suggests that trajectory diversity is not merely a matter of broader data coverage, but may be one of the conditions for strategy emergence itself. Still, this is only a first step. The more fundamental goal is to enable models to discover better reasoning and agentic strategies on their own, rather than remaining confined to variations of human-provided starting patterns. Beyond that lies an even harder challenge: enabling models to discover richer organizational forms, such as sub-agent decomposition, multi-agent collaboration, and more flexible hierarchical decision structures.

（接上页）改进往往停留在局部：模型更擅长走熟悉的路径，却发现不了真正更好的路径。实验中我们发现，在冷启动阶段增加轨迹多样性能部分放松这个约束，让 RL 更容易找到附近的改进变体。这说明轨迹多样性不只是数据覆盖更广的问题，可能本身就是策略涌现的条件之一。不过这只是第一步。更根本的目标是让模型自己发现更好的推理与智能体策略，而不是一直困在人给的起点模式的变体里。再往后还有更难的挑战：让模型发现更丰富的组织形式，比如子智能体分解，多智能体协作，以及更灵活的分层决策结构。

**Multimodal context management remains a core bottleneck for long-horizon agents.** Compared with text, images and especially videos consume context budget much more aggressively, making them expensive to retain over long trajectories. In practice, many systems respond by dropping earlier visual observations as context grows. While being an understandable engineering compromise, it also discards information that may remain important for later reasoning, planning, or verification. The challenge becomes sharper as trajectories lengthen. In text-only settings, systems such as Claude Code often respond to growing context pressure by compacting or summarizing earlier interaction history once the context window starts to fill up; in multimodal settings, however, faithful compression is much harder, because what must be preserved is not only semantic content, but also visual detail that may later become important again, such as layout, spatial relations, or temporal change in video. Most current memory mechanisms remain fundamentally text-centric: they are better at compressing what was said than what was seen, or how visual states evolved over time. For long-horizon multimodal agents, simply adapting text memory mechanisms will therefore be insufficient. What is needed instead is a more multimodal-native approach to context and memory.

**多模态上下文管理仍是长程智能体的核心瓶颈。** 和文本相比，图像尤其是视频消耗上下文预算快得多，在长轨迹里保留它们代价很高。实践中，很多系统的应对是随着上下文增长丢掉早期的视觉观察。这是可以理解的工程折中，但也丢掉了之后推理，规划或验证可能还用得上的信息。轨迹越长，问题越尖锐。在纯文本设定下，Claude Code 这类系统在上下文窗口快满时，常常压缩或总结早期交互历史；在多模态设定下，忠实压缩难得多，因为要保留的不只是语义内容，还有之后可能重新变得重要的视觉细节，比如版面，空间关系或视频里的时间变化。现有的大多数记忆机制本质上以文本为中心：它们更擅长压缩说过什么，而不是看到过什么，或视觉状态如何随时间演变。因此对长程多模态智能体来说，简单套用文本记忆机制不够，需要更原生多模态的上下文与记忆方法。

**Model and harness increasingly co-shape the system’s capability boundary.** For agentic systems, the effective capability boundary is no longer determined by the model alone, but jointly shaped by the model and the harness around it. This greatly expands the design space: task decomposition, tool use, memory mechanisms, and verification loops can all affect what the system is able to do in practice. At the same time, it makes the development path substantially complex: the same model may behave very differently under different decomposition strategies, tool-use policies, memory designs, or verification workflows; conversely, what appears to be a model limitation may sometimes reflect a poor harness choice instead. More importantly, this dependence runs both ways: the usefulness of a harness often depends on the model’s capability regime, and designs that are ineffective at one stage may become critical once the model crosses a threshold in reasoning, planning, or feedback utilization. This means the harness is not a stable external layer that can be optimized independently of the model. Its role, value, and optimal form shift as the model evolves. More broadly, this means that agentic model development can no longer be framed as model improvement alone: the effective capability boundary is increasingly co-shaped by the model and the harness, and so too are the objectives by which progress is optimized and evaluated.

**模型和 harness 越来越共同决定系统的能力边界。** 对智能体系统而言，有效能力边界不再只由模型决定，而是由模型和包在它外面的 harness 共同塑造。这大大扩展了设计空间：任务分解，工具使用，记忆机制和验证循环都会影响系统实际能做什么。同时也让开发路径复杂得多：同一个模型在不同的分解策略，工具使用策略，记忆设计或验证流程下表现可能差别很大；反过来，看起来是模型的局限，有时其实是 harness 选得不好。更重要的是，这种依赖是双向的：harness 有没有用往往取决于模型所处的能力区间，在某个阶段无效的设计，可能在模型的推理，规划或利用反馈的能力越过某个门槛后变得关键。这意味着 harness 不是一个可以脱离模型独立优化的稳定外层，它的角色，价值和最优形态会随模型演进而变化。更宽地说，智能体模型开发不能再只被看作模型改进：有效能力边界越来越由模型和 harness 共同塑造，用来优化和评测进展的目标也是如此。

<!-- page 13 of 30 -->

## 7 Contribution（贡献）

The contributors’ names are listed in reverse alphabetical order (Z to A) by first name.

贡献者姓名按名字首字母倒序（Z 到 A）排列。

## Core Contributors（核心贡献者）

Ziyang Pan, Zhen Yang, Yuting Wang, Yue Wang, Yuanchang Yue, Yu Wang, Yanling Wang, Yan Wang, Xijun Liu, Wenmeng Yu, Weihan Wang, Wei Li, Shuaiqi Duan, Sheng Yang, Ruiliang Lv, Mingdao Liu, Lihang Pan, Ke Ning, Junhui Ji, Jinjiang Wang, Jing Chen, Jiazheng Xu, Jiale Zhu, Jiale Cheng, Ji Qi, Guobing Gan, Guo Wang, Cong Yao

（核心贡献者 28 人，人名照录不译。）

## Contributors（贡献者）

Zijun Dou, Zihao Zhou, Zihan Wang, Zhiqi Ge, Zhijie Li, Zhenyu Hou, Zhao Xue, Zehui Wang, Zehan Qi, Zehai He, Yutao Zhang, Yusen Liu, Yukuo Cen, Yuchen Li, Yuan Wang, Yu Yang, Yongbin Liu, Yijian Lu, Yifan Xu, Yanzi Wang, Yanxiao Zhao, Yanfeng Wang, Yadong Xue, Yabo Xu, Xinyu Zhang, Xinyu Liu, Xiao Liu, Wenyi Zhao, Wenkai Li, Tianyu Tong, Tianshu Zhang, Shudan Zhang, Shengdong Yan, Qinkai Zheng, Mingde Xu, Licheng Bao, lat Long long, Jiaxing Xu, Jiaxin Fan, Jiawen Qian, Jiali Chen, Jiahui Lin, Jiadai Sun, Haozhi Zheng, Haoran Wang, Haochen Li, Hanyu Lai, Han Xu, Fan Yang, Dan Zhang, Da Yin, Chuangxin Zhao, Chengcheng Wu, Boyan Shi, Bowen Lv, Bowei Jia, Bo Li, Bin Chen, Baoxu Wang

（贡献者名单，人名照录不译。其中 「lat Long long」 疑为 OCR 错字，照录。）

## Tech Leads（技术负责人）

Wenyi Hong, Xiaotao Gu

（技术负责人两位，人名照录。）

## Academic Advisors（学术顾问）

Peng Zhang, Debing Liu, Bin Xu, Juanzi Li, Minlie Huang, Yuxiao Dong, Jie Tang

（学术顾问七位，人名照录。）

<!-- page 14 of 30 -->

## References（参考文献）

[1] Pinchbench. [https://github.com/pinchbench/skill.](https://github.com/pinchbench/skill)

[2] Zclawbench. [https://huggingface.co/datasets/zai-org/ZClawBench.](https://huggingface.co/datasets/zai-org/ZClawBench)

[3] Anthropic. Claude code: Ai-powered coding assistant, 2025. CLI tool and IDE extension for AI-assisted software development.

[4] Anthropic. Introducing claude opus 4.6. [https://www.anthropic.com/news/claude-opus-4-6](https://www.anthropic.com/news/claude-opus-4-6), Feb. 2026. Accessed: 2026-04-15.

[5] ByteDance Seed. Seed2.0 model card: Towards intelligence frontier for real-world complexity. [https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/seed2/0214/Seed2.0%20Model%20Card.pdf](https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/seed2/0214/Seed2.0%20Model%20Card.pdf), 2026. Technical report / model card, accessed 2026-04-15.

[6] L. Cheng, J. Duan, Y. R. Wang, H. Fang, B. Li, Y. Huang, E. Wang, A. Eftekhar, J. Lee, W. Yuan, et al. Pointarena: Probing multimodal grounding through language-guided pointing. arXiv preprint arXiv:2505.09990, 2025.

[7] X. Cheng, W. Zhang, S. Zhang, J. Yang, X. Guan, X. Wu, X. Li, G. Zhang, J. Liu, Y. Mai, et al. Simplevqa: Multimodal factuality evaluation for multimodal large language models. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 4637–4646, 2025.

[8] S. Duan, Y. Xue, W. Wang, Z. Su, H. Liu, S. Yang, G. Gan, G. Wang, Z. Wang, S. Yan, D. Jin, Y. Zhang, G. Wen, Y. Wang, Y. Zhang, X. Zhang, W. Hong, Y. Cen, D. Yin, B. Chen, W. Yu, X. Gu, and J. Tang. Glm-ocr technical report, 2026.

[9] T. Ge, Y. Liu, J. Ye, T. Li, and C. Wang. Advancing vision-language models in front-end development via data synthesis. arXiv preprint arXiv:2503.01619, 2025.

[10] X. Geng, P. Xia, Z. Zhang, X. Wang, Q. Wang, R. Ding, C. Wang, J. Wu, Y. Zhao, K. Li, Y. Jiang, P. Xie, F. Huang, and J. Zhou. Webwatcher: Breaking new frontier of vision-language deep research agent, 2025.

[11] F. Gloeckle, B. Y. Idrissi, B. Rozière, D. Lopez-Paz, and G. Synnaeve. Better & faster large language models via multi-token prediction. arXiv preprint arXiv:2404.19737, 2024.

[12] Google Workspace. The latest updates for Deep Research in Gemini. [https://workspaceupdates.googleblog.com/2025/05/deep-research-updates-gemini-io-2025.html](https://workspaceupdates.googleblog.com/2025/05/deep-research-updates-gemini-io-2025.html), May 2025. Accessed: 2026-04-15.

[13] H. He, W. Yao, K. Ma, W. Yu, Y. Dai, H. Zhang, Z. Lan, and D. Yu. Webvoyager: Building an end-to-end web agent with large multimodal models. arXiv preprint arXiv:2401.13919, 2024.

[14] Z. He, W. Hong, Z. Yang, Z. Pan, M. Liu, X. Gu, and J. Tang. Vision2web: A hierarchical benchmark for visual website development with agent verification. arXiv preprint arXiv:2603.26648, 2026.

[15] A. Henry, P. R. Dachapally, S. S. Pawar, and Y. Chen. Query-key normalization for transformers. In Findings of the Association for Computational Linguistics: EMNLP 2020, pages 4246–4253, 2020.

[16] W. Hong, W. Wang, Q. Lv, J. Xu, W. Yu, J. Ji, Y. Wang, Z. Wang, Y. Dong, M. Ding, et al. Cogagent: A visual language model for gui agents. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 14281–14290, 2024.

[17] A. Jacovi, A. Wang, C. Alberti, J. L. Connie Tao, K. Olszewska, L. Haas, M. Liu, N. Keating, A. Bloniarz, C. Saroufim, C. Fry, D. Marcus, D. Kukliansky, G. S. Tomar, J. Swirhun, J. Xing, L. Wang, M. Aaron, M. Ambar, R. Fellinger, R. Wang, R. Sims, Z. Zhang, S. Goldshtein, Y. Matias, and D. Das. Facts leaderboard. [https://kaggle.com/facts-leaderboard](https://kaggle.com/facts-leaderboard),2024. Google DeepMind, Google Research, Google Cloud, Kaggle.

（本页为参考文献 [1] 到 [17]，条目保留原文，不译。）

<!-- page 15 of 30 -->

[18] D. Jiang, R. Zhang, Z. Guo, Y. Wu, J. Lei, P. Qiu, P. Lu, Z. Chen, C. Fu, G. Song, et al. Mmsearch: Benchmarking the potential of large models as multi-modal search engines. arXiv preprint arXiv:2409.12959, 2024.

[19] D. Jiang, R. Zhang, Z. Guo, Y. Wu, J. Lei, P. Qiu, P. Lu, Z. Chen, C. Fu, G. Song, et al. Mmsearch: Benchmarking the potential of large models as multi-modal search engines. arXiv preprint arXiv:2409.12959, 2024.

[20] C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. Narasimhan. Swe-bench: Can language models resolve real-world github issues? arXiv preprint arXiv:2310.06770, 2023.

[21] K. Jordan et al. Muon: An optimizer for hidden layers in neural networks. [https://kellerjordan.github.io/posts/muon/,](https://kellerjordan.github.io/posts/muon/) 2024.

[22] A. Karpathy. Autoresearch: Ai agents running research, March 2026. AI agents running research on single-GPU nanochat training automatically.

[23] S. Kazemzadeh, V. Ordonez, M. Matten, and T. Berg. Referitgame: Referring to objects in photographs of natural scenes. In Proceedings of the 2014 conference on empirical methods in natural language processing (EMNLP), pages 787–798, 2014.

[24] K. Li, Y. Wang, Y. He, Y. Li, Y. Wang, Y. Liu, Z. Wang, J. Xu, G. Chen, P. Luo, et al. Mvbench: A comprehensive multi-modal video understanding benchmark. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 22195–22206, 2024.

[25] Y. Liu, Z. Li, M. Huang, B. Yang, W. Yu, C. Li, X.-C. Yin, C.-L. Liu, L. Jin, and X. Bai. Ocrbench: on the hidden mystery of ocr in large multimodal models. Science China Information Sciences, 67(12):220102, 2024.

[26] P. Lu, H. Bansal, T. Xia, J. Liu, C. Li, H. Hajishirzi, H. Cheng, K.-W. Chang, M. Galley, and J. Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

[27] OpenAI. Introducing deep research. [https://openai.com/index/introducing-deep-research](https://openai.com/index/introducing-deep-research), February 2025. Accessed: 2026-04-15.

[28] OpenAI. Introducing gpt-5.4. [https://openai.com/index/introducing-gpt-5-4/](https://openai.com/index/introducing-gpt-5-4/), Mar. 2026. Accessed: 2026-04-15.

[29] OpenClaw. Openclaw. [https://github.com/openclaw/openclaw](https://github.com/openclaw/openclaw), 2026. GitHub repository, accessed 2026-04-15.

[30] C. Rawles, S. Clinckemaillie, Y. Chang, J. Waltz, G. Lau, M. Fair, A. Li, W. Bishop, W. Li, F. Campbell-Ajala, et al. Androidworld: A dynamic benchmarking environment for autonomous agents. arXiv:2405.14573, 2024.

[31] C. Si, Y. Zhang, R. Li, Z. Yang, R. Liu, and D. Yang. Design2code: Benchmarking multimodal code generation for automated front-end engineering. In Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers), pages 3956–3974, 2025.

[32] O. Siméoni, H. V. Vo, M. Seitzer, F. Baldassarre, M. Oquab, C. Jose, V. Khalidov, M. Szafraniec, S. Yi, M. Ramamonjisoa, et al. Dinov3. arXiv preprint arXiv:2508.10104, 2025.

[33] S. Song, S. P. Lichtenberg, and J. Xiao. Sun rgb-d: A rgb-d scene understanding benchmark suite. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 567–576, 2015.

[34] P. Steinberger. Openclaw: Open-source personal ai agent framework, 2026. Open-source AI agent platform for building autonomous agents.

[35] X. Tao, Y. Teng, X. Su, X. Fu, J. Wu, C. Tao, Z. Liu, H. Bai, R. Liu, and L. Kong. Mmsearchplus: Benchmarking provenance-aware search for multimodal browsing agents. arXiv preprint arXiv:2508.21475, 2025.

（本页为参考文献 [18] 到 [35]，条目保留原文。）

> **回看：** 正文里 MMSearch 和 OSWorld 各引了两个编号，是不是两篇文献？
> 不是。本页 [18] 和 [19] 的作者，标题，arXiv 号（2409.12959）完全相同；第 17 页 [43] 和 [44] 的标题和页码相同，只是年份写成 2024 和 2025，作者里 「T. J. Hua」 和 「J. H. Toh」 不同。正文第 2 页，第 10 页引 MMSearch [18]，OSWorld [44]；第 4 页引 MMSearch [19]，OSWorld [43]；第 1 页 GUI 任务也引 [43]。同一基准用了两个编号，对照分数时按基准名认，不按编号认。OpenClaw 也有两条：[29] 是 GitHub 仓库，[34] 是 P. Steinberger 的条目。

<!-- page 16 of 30 -->

[36] K. Team, T. Bai, Y. Bai, Y. Bao, S. H. Cai, Y. Cao, Y. Charles, H. S. Che, C. Chen, G. Chen, H. Chen, J. Chen, J. Chen, J. Chen, J. Chen, K. Chen, L. Chen, R. Chen, X. Chen, Y. Chen, Y. Chen, Y. Chen, Y. Chen, Y. Chen, Y. Chen, Y. Chen, Y. Chen, Z. Chen, Z. Chen, D. Cheng, M. Chu, J. Cui, J. Deng, M. Diao, H. Ding, M. Dong, M. Dong, Y. Dong, Y. Dong, A. Du, C. Du, D. Du, L. Du, Y. Du, Y. Fan, S. Fang, Q. Feng, Y. Feng, G. Fu, K. Fu, H. Gao, T. Gao, Y. Ge, S. Geng, C. Gong, X. Gong, Z. Gongque, Q. Gu, X. Gu, Y. Gu, L. Guan, Y. Guo, X. Hao, W. He, W. He, Y. He, C. Hong, H. Hu, J. Hu, Y. Hu, Z. Hu, K. Huang, R. Huang, W. Huang, Z. Huang, T. Jiang, Z. Jiang, X. Jin, Y. Jing, G. Lai, A. Li, C. Li, C. Li, F. Li, G. Li, G. Li, H. Li, H. Li, J. Li, J. Li, J. Li, L. Li, M. Li, W. Li, W. Li, X. Li, X. Li, Y. Li, Y. Li, Y. Li, Y. Li, Z. Li, Z. Li, W. Liao, J. Lin, X. Lin, Z. Lin, Z. Lin, C. Liu, C. Liu, H. Liu, L. Liu, S. Liu, S. Liu, S. Liu, T. Liu, T. Liu, W. Liu, X. Liu, Y. Liu, Y. Liu, Y. Liu, Y. Liu, Y. Liu, Z. Liu, Z. Liu, E. Lu, H. Lu, Z. Lu, J. Luo, T. Luo, Y. Luo, L. Ma, Y. Ma, S. Mao, Y. Mei, X. Men, F. Meng, Z. Meng, Y. Miao, M. Ni, K. Ouyang, S. Pan, B. Pang, Y. Qian, R. Qin, Z. Qin, J. Qiu, B. Qu, Z. Shang, Y. Shao, T. Shen, Z. Shen, J. Shi, L. Shi, S. Shi, F. Song, P. Song, T. Song, X. Song, H. Su, J. Su, Z. Su, L. Sui, J. Sun, J. Sun, T. Sun, F. Sung, Y. Tai, C. Tang, H. Tang, X. Tang, Z. Tang, J. Tao, S. Teng, C. Tian, P. Tian, A. Wang, B. Wang, C. Wang, C. Wang, C. Wang, D. Wang, D. Wang, D. Wang, F. Wang, H. Wang, H. Wang, H. Wang, H. Wang, H. Wang, J. Wang, J. Wang, J. Wang, K. Wang, L. Wang, Q. Wang, S. Wang, S. Wang, S. Wang, W. Wang, X. Wang, X. Wang, Y. Wang, Y. Wang, Y. Wang, Y. Wang, Y. Wang, Y. Wang, Z. Wang, Z. Wang, Z. Wang, Z. Wang, Z. Wang, Z. Wang, C. Wei, M. Wei, C. Wen, Z. Wen, C. Wu, H. Wu, J. Wu, R. Wu, W. Wu, Y. Wu, Y. Wu, Y. Wu, Z. Wu, C. Xiao, J. Xie, X. Xie, Y. Xie, Y. Xin, B. Xing, B. Xu, J. Xu, J. Xu, J. Xu, L. H. Xu, L. Xu, S. Xu, W. Xu, X. Xu, X. Xu, Y. Xu, Y. Xu, Y. Xu, Z. Xu, Z. Xu, J. Yan, Y. Yan, G. Yang, H. Yang, J. Yang, K. Yang, N. Yang, R. Yang, X. Yang, X. Yang, Y. Yang, Y. Yang, Y. Yang, Z. Yang, Z. Yang, Z. Yang, H. Yao, D. Ye, W. Ye, Z. Ye, B. Yin, C. Yu, L. Yu, T. Yu, T. Yu, E. Yuan, M. Yuan, X. Yuan, Y. Yue, W. Zeng, D. Zha, H. Zhan, D. Zhang, H. Zhang, J. Zhang, P. Zhang, Q. Zhang, R. Zhang, X. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Z. Zhang, C. Zhao, F. Zhao, J. Zhao, S. Zhao, X. Zhao, Y. Zhao, Z. Zhao, H. Zheng, R. Zheng, S. Zheng, T. Zheng, J. Zhong, L. Zhong, W. Zhong, M. Zhou, R. Zhou, X. Zhou, Z. Zhou, J. Zhu, L. Zhu, X. Zhu, Y. Zhu, Z. Zhu, J. Zhuang, W. Zhuang, Y. Zou, and X. Zu. Kimi k2.5: Visual agentic intelligence, 2026.

[37] V. Team, W. Hong, W. Yu, X. Gu, G. Wang, G. Gan, H. Tang, J. Cheng, J. Qi, J. Ji, L. Pan, S. Duan, W. Wang, Y. Wang, Y. Cheng, Z. He, Z. Su, Z. Yang, Z. Pan, A. Zeng, B. Wang, B. Chen, B. Shi, C. Pang, C. Zhang, D. Yin, F. Yang, G. Chen, J. Xu, J. Zhu, J. Chen, J. Chen, J. Chen, J. Lin, J. Wang, J. Chen, L. Lei, L. Gong, L. Pan, M. Liu, M. Xu, M. Zhang, Q. Zheng, S. Yang, S. Zhong, S. Huang, S. Zhao, S. Xue, S. Tu, S. Meng, T. Zhang, T. Luo, T. Hao, T. Tong, W. Li, W. Jia, X. Liu, X. Zhang, X. Lyu, X. Fan, X. Huang, Y. Wang, Y. Xue, Y. Wang, Y. Wang, Y. An, Y. Du, Y. Shi, Y. Huang, Y. Niu, Y. Wang, Y. Yue, Y. Li, Y. Zhang, Y. Wang, Y. Wang, Y. Zhang, Z. Xue, Z. Hou, Z. Du, Z. Wang, P. Zhang, D. Liu, B. Xu, J. Li, M. Huang, Y. Dong, and J. Tang. Glm-4.5v and glm-4.1v-thinking: Towards versatile multimodal reasoning with scalable reinforcement learning, 2025.

[38] Z. A. Team. Glm-image: Auto-regressive for dense-knowledge and high-fidelity image generation. Technical blog, Zhipu AI (Z.ai), January 2026. First open-source industrial-grade discrete autoregressive image generation model with hybrid AR+Diffusion architecture.

[39] M. Tschannen, A. Gritsenko, X. Wang, M. F. Naeem, I. Alabdulmohsin, N. Parthasarathy, T. Evans, L. Beyer, Y. Xia, B. Mustafa, et al. Siglip 2: Multilingual vision-language encoders with improved semantic understanding, localization, and dense features. arXiv preprint arXiv:2502.14786, 2025.

[40] Z. Wang, M. Xia, L. He, H. Chen, Y. Liu, R. Zhu, K. Liang, X. Wu, H. Liu, S. Malladi, et al. Charxiv: Charting gaps in realistic chart understanding in multimodal llms. Advances in Neural Information Processing Systems, 37:113569–113697, 2024.

[41] P. Wu and S. Xie. V\*: Guided visual search as a core mechanism in multimodal llms, 2023.

[42] Y. Xiao, E. Sun, T. Liu, and W. Wang. Logicvista: Multimodal llm logical reasoning benchmark in visual contexts. arXiv preprint arXiv:2407.04973, 2024.

（本页为参考文献 [36] 到 [42]，条目保留原文。[36] 是 Kimi K2.5 报告，作者名单很长，照录。）

<!-- page 17 of 30 -->

[43] T. Xie, D. Zhang, J. Chen, X. Li, S. Zhao, R. Cao, T. J. Hua, Z. Cheng, D. Shin, F. Lei, et al. Osworld: Benchmarking multimodal agents for open-ended tasks in real computer environments. Advances in Neural Information Processing Systems, 37:52040–52094, 2024.

[44] T. Xie, D. Zhang, J. Chen, X. Li, S. Zhao, R. Cao, J. H. Toh, Z. Cheng, D. Shin, F. Lei, et al. Osworld: Benchmarking multimodal agents for open-ended tasks in real computer environments. Advances in Neural Information Processing Systems, 37:52040–52094, 2025.

[45] Z. Yang, W. Hong, M. Xu, X. Fan, W. Wang, J. Cheng, X. Gu, and J. Tang. Ui2codeˆ n: Ui-to-code generation as interactive visual optimization. arXiv preprint arXiv:2511.08195, 2025.

[46] B. Ye, R. Li, Q. Yang, Y. Liu, L. Yao, H. Lv, Z. Xie, C. An, L. Li, L. Kong, et al. Claw-eval: Toward trustworthy evaluation of autonomous agents. arXiv preprint arXiv:2604.06132, 2026.

[47] X. Yue, Y. Ni, K. Zhang, T. Zheng, R. Liu, G. Zhang, S. Stevens, D. Jiang, W. Ren, Y. Sun, et al. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 9556–9567, 2024.

[48] X. Yue, T. Zheng, Y. Ni, Y. Wang, K. Zhang, S. Tong, Y. Sun, B. Yu, G. Zhang, H. Sun, et al. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15134–15186, 2025.

[49] A. Zeng, X. Lv, Z. Hou, Z. Du, Q. Zheng, B. Chen, D. Yin, C. Ge, C. Huang, C. Xie, et al. Glm-5: from vibe coding to agentic engineering. arXiv preprint arXiv:2602.15763, 2026.

[50] Zhipu AI Team. Autoclaw. [https://autoglm.zhipuai.cn/autoclaw/](https://autoglm.zhipuai.cn/autoclaw/), 2026. AI Assistant Tool Supporting Windows & macOS, Model Hot-Swapping, 50+ Skills, AutoGLM Browser Automation, accessed 2026-04-15.

（本页为参考文献 [43] 到 [50]，条目保留原文。）

<!-- page 18 of 30 -->

## A Demo Cases（演示案例）

We demonstrate the capabilities and advantages of GLM-5V-Turbo through typical qualitative examples from various scenarios.

我们用来自各类场景的典型定性例子展示 GLM-5V-Turbo 的能力和优势。

## A.1 In Combination with Agent Systems and Skills（结合智能体系统与技能）

![Image block](images/p18-figure-6-a-case-showing-the-application-of-glm-5v-turbo.png)

(图：一份四页的 「NVIDIA Corporation (NVDA) Equity Research Report」，依次有 Executive Summary, 1. Technical Analysis（K 线图，时间戳 2026-04-16 04:00），Key Levels 表和分时走势，2. Fundamental Analysis 的财务表，Four Investment Pillars, 3. Analyst Sentiment & Events, 4. Bull vs. Bear, 5. Action Plan 的策略矩阵和情景表。)

Figure 6: A case showing the application of GLM-5V-Turbo to stock analysis, with OpenClaw and the official skill glmv-stock-analyst<sup>3</sup>. It gathers relevant information from multiple sources and produces a professional analysis report, including technical analysis, fundamental analysis, analyst sentiment and action plan. Query: Analyze NVIDIA’s stock and give a English report.

图 6: GLM-5V-Turbo 结合 OpenClaw 和官方技能 glmv-stock-analyst<sup>3</sup> 做股票分析的案例。它从多个来源收集信息，生成一份专业分析报告，包括技术分析，基本面分析，分析师情绪和行动计划。Query：分析 NVIDIA 的股票，给出一份英文报告（原文 「a English report」 照录）。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>URL: [https://clawhub.ai/zai-org/glmv-stock-analyst](https://clawhub.ai/zai-org/glmv-stock-analyst)</span></small>

<sup>3</sup> 脚注：技能地址 https://clawhub.ai/zai-org/glmv-stock-analyst.

<!-- page 19 of 30 -->

![Image block](images/p19-figure-7-a-case-showing-the-application-of-glm-5v-turbo.png)

（图：复刻出的旅游网站 「Let's plan your next vacation」 的四段长截图，包括 Across the world 目的地卡片，「Get unparalleled peace of mind」 横幅，攻略列表，团队头像和博客区。）

Figure 7: A case showing the application of GLM-5V-Turbo to URL-based GUI exploration, asset collection, and webpage recreation, with Claude Code and the official skill glmv-web-replication<sup>4</sup>. Query: Given a target website URL: [https: // webflow-path-three. webflow. io/](https://webflow-path-three.webflow.io/) , please explore it via GUI, collect the necessary assets, and recreate the webpage in HTML code with high visual fidelity and functional completeness.

图 7: GLM-5V-Turbo 结合 Claude Code 和官方技能 glmv-web-replication<sup>4</sup>，做基于 URL 的 GUI 探索，素材收集和网页复刻的案例。Query：给定目标网站 URL (https://webflow-path-three.webflow.io/)，通过 GUI 探索它，收集所需素材，并以高视觉保真度和功能完整度用 HTML 代码复刻网页。

![Image block](images/p19-figure-8-a-case-showing-the-application-of-glm-5v-turbo.png)

(图：左边是 PRD.md 文档截图，含 Product Background，Core Functional Modules，Business Processes 和页面导航流程图；箭头指向右边 12 张生成页面的缩略图，标签有 Login Page, Home Dashboard, Create New Dropdown, Activity Modal, Contacts List View, Contact Detail View, Calendar - Month View, Task Board (Kanban), Opportunities, Dashboards & Reports, Tools, User Dropdown.)

Figure 8: A case showing the application of GLM-5V-Turbo to PRD-driven website generation, with Claude Code and the official skill glmv-prd-to-app<sup>5</sup>. Given a product requirements document and the project contents under the act folder, the model uses the PRD skill to design and implement a website in the working directory ./act\_workspace. Query: Based on my PRD document, please use your PRD skills to build a website for the project in the act folder. The working directory is./act\_workspace.

图 8: GLM-5V-Turbo 结合 Claude Code 和官方技能 glmv-prd-to-app<sup>5</sup> 做 PRD 驱动网站生成的案例。给定一份产品需求文档和 act 文件夹下的项目内容，模型用 PRD 技能在工作目录 ./act_workspace 里设计并实现网站。Query：根据我的 PRD 文档，用你的 PRD 技能为 act 文件夹里的项目建一个网站，工作目录是 ./act_workspace。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>URL: [https://clawhub.ai/zai-org/glmv-web-replication](https://clawhub.ai/zai-org/glmv-web-replication)</span></small>

<sup>4</sup> 脚注：技能地址 https://clawhub.ai/zai-org/glmv-web-replication.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>URL: [https://clawhub.ai/zai-org/glmv-prd-to-app](https://clawhub.ai/zai-org/glmv-prd-to-app)</span></small>

<sup>5</sup> 脚注：技能地址 https://clawhub.ai/zai-org/glmv-prd-to-app.

<!-- page 20 of 30 -->

## A.2 Multimodal Coding（多模态编程）

![Image block](images/p20-prompt-you-are-a-master-of-frontend-recreation-and-web.png)

（图：黄框里是作为参考输入的购物网站截图，左边是 Product 商品网格页，右边是长页面，底部有 「VALORÉ」 字样。）

Prompt: You are a master of frontend recreation and web design. Please complete the following design tasks and implement everything in HTML code. 1. Recreate all pages of such a shopping website, using valid image URLs. 2. Create a welcome page and then transition into the shopping interface. 3. On the \`'About Brand" page, use parallax scrolling to tell the brand story, allowing text to appear rhythmically as the image background moves. 4. Design a color scheme that preserves a premium aesthetic in dark mode and resolves the issue of product images blending into dark backgrounds. 5. Design a one-page checkout interface to reduce user drop-off, including dynamic shipping calculation and address autocomplete. In addition to the above, also implement all button functionalities, such as Home, Products, About Brand, and Checkout.

Prompt：你是前端复刻和网页设计高手。请完成以下设计任务，全部用 HTML 代码实现。1。复刻这个购物网站的所有页面，使用有效的图片 URL. 2。做一个欢迎页，再过渡到购物界面。3。在 「About Brand」 页用视差滚动讲品牌故事，让文字随图片背景移动有节奏地出现。4。设计一套在深色模式下保持高级感，并解决商品图融进深色背景问题的配色。5。设计单页结账界面以减少用户流失，包括动态运费计算和地址自动补全。此外，实现所有按钮功能，如 Home，Products，About Brand 和 Checkout。

![Image block](images/p20-figure-9-a-case-showing-the-application-of-glm-5v-turbo.png)

（图：生成的 「VALORE」 网站八张截图：深色欢迎页，服装陈列横幅，「全部商品」 网格，商品列表与页脚，品牌故事页，「我们的核心价值观」 三栏，以及浅色和深色两版 「结账」 页。页面文字是中文。）

Figure 9: A case showing the application of GLM-5V-Turbo to full-stack e-commerce website design and implementation, using our official website z.ai <sup>6</sup>. Given a high-level product design request, the model generates a complete HTML-based shopping website with multiple functional pages, including a welcome page, shopping interface, brand-story page with parallax scrolling, dark-mode visual design, and a one-page checkout interface with dynamic shipping calculation and address suggestion. The model also completes interactive button behaviors across key pages such as Home, Products, About Brand, and Checkout. Query: You are a master of frontend recreation and web design. Please complete the following design tasks and implement everything in HTML code. 1. Recreate all pages of such a shopping website, using valid image URLs. 2. Create a welcome page and then transition into the shopping interface. 3. On the “About Brand” page, use parallax scrolling to tell the brand story, allowing text to appear rhythmically as the image background moves. 4. Design a color scheme that preserves a premium aesthetic in dark mode and resolves the issue of product images blending into dark backgrounds. 5. Design a one-page checkout interface to reduce user drop-off, including dynamic shipping calculation and address autocomplete. In addition to the above, also implement all button functionalities, such as Home, Products, About Brand, and Checkout.

图 9: GLM-5V-Turbo 在我们的官网 z.ai<sup>6</sup> 上做全栈电商网站设计与实现的案例。给定一个高层的产品设计需求，模型生成一个完整的 HTML 购物网站，包含多个功能页面：欢迎页，购物界面，带视差滚动的品牌故事页，深色模式视觉设计，以及带动态运费计算和地址建议的单页结账界面。模型还完成了 Home，Products，About Brand，Checkout 等关键页面上的按钮交互。Query 与上面的 Prompt 相同，不再重复翻译。

> **核对：** 图 9 的 Prompt 是英文，生成的网站为什么是中文界面？
> 本文没解释。第 20 页的 Prompt 和图注里的 Query 是同一段英文，前后印了两遍，只有 「About Brand」 的引号写法不同。生成页截图里的文字是 「全部商品」 「我们的核心价值观」 「结账」 等中文，而参考截图（p20-prompt 那张）是英文商品页。图注称这是 「full-stack」 电商网站，Prompt 要的却是 「implement everything in HTML code」，截图里也只能看到前端页面，看不出后端。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>URL: [https://chat.z.ai/](https://chat.z.ai/)</span></small>

<sup>6</sup> 脚注：https://chat.z.ai/.

<!-- page 21 of 30 -->

![Image block](images/p21-figure-10-a-case-showing-the-application-of-glm-5v.png)

(图：左边黄框是参考图，三部手机展示情绪记录 App (「We care how you feel!」，「Hello Dany! How are you feeling today?」，Mood Calendar)，下方印着 Prompt 原文。箭头指向右边八张生成的手机页面：欢迎页，首页，记录情绪后的首页，All Specialists，Schedule，Mood Calendar，以及两张个人资料页。)

Figure 10: A case showing the application of GLM-5V-Turbo to UI recreation and mock interface generation, using our official website z.ai. Given a reference image of a mobile mood-tracking application, the model reconstructs the interface in executable web code and further mocks additional plausible pages and interactions in a consistent visual style. Query: Please recreate the mobile app interface based on the provided image, and additionally mock several possible follow-up pages or user interactions that fit the same product design and functionality.

图 10: GLM-5V-Turbo 在官网 z.ai 上做 UI 复刻与界面模拟生成的案例。给定一张移动端情绪追踪应用的参考图，模型用可执行的网页代码重建界面，并按一致的视觉风格模拟出更多合理的页面和交互。Query：根据图片复刻这个移动 App 界面，再模拟几个符合同一产品设计和功能的后续页面或用户交互。

![Image block](images/p21-figure-11-a-case-showing-the-application-of-glm-5v.png)

（图：左边黄框是 「Pomodoro Focus Timer」 网页参考截图，下面印着 Prompt；右边是 Step 1 到 Step 5 五张截图，页面从只有框架逐步补全到带 25:00 计时器，My Progress 和 Session History 的完整页面。）

Figure 11: A case showing the application of GLM-5V-Turbo to agentic UI recreation, using our official website z.ai. Given a reference screenshot of a webpage, the model reconstructs the page in HTML while automatically retrieving the image assets appearing in the screenshot. This example highlights the agentic framework’s ability to jointly perform visual understanding, asset collection, and faithful UI recreation. Query: Please recreate the webpage based on the reference screenshot, output the result in HTML, and retrieve the image assets appearing in the screenshot.

图 11: GLM-5V-Turbo 在官网 z.ai 上做智能体式 UI 复刻的案例。给定一张网页参考截图，模型用 HTML 重建页面，并自动检索截图里出现的图片素材。论文称这个例子体现了智能体框架把视觉理解，素材收集和忠实复刻结合起来的能力。Query：根据参考截图复刻网页，以 HTML 输出，并检索截图中出现的图片素材。

<!-- page 22 of 30 -->

![Image block](images/p22-figure-12-a-case-showing-the-application-of-glm-5v.png)

（图：生成的深色长网页，分四栏展示。标题 「GLM-5: from Vibe Coding to Agentic Engineering」，依次有 Abstract, Key Achievements, Architecture & Technical Innovations, Three-Stage Training Framework, Reinforcement Learning Breakthroughs, Comprehensive Evaluation Results, Real-World Software Engineering at Scale, Advanced Context Management Strategies, Full-Stack Adaptation to Domestic Hardware，Beyond Coding，A New Era of Agentic Intelligence，Citation 等区块，夹有原论文的图表。）

Figure 12: A case showing the application of GLM-5V-Turbo to automatic website generation for research paper, using our official website z.ai. Given the paper GLM-5: from Vibe Coding to Agentic Engineering, the model generates an English website that presents the paper’s motivation, core ideas, system design, and key results in a clear and visually organized format with interleaved text and figures. Query: I am preparing an introduction website for the paper GLM-5: from Vibe Coding to Agentic Engineering. Please generate an English website that clearly presents the paper’s background, methodology, main findings, and contributions.

图 12: GLM-5V-Turbo 在官网 z.ai 上为研究论文自动生成网站的案例。给定论文 GLM-5: from Vibe Coding to Agentic Engineering，模型生成一个英文网站，用图文交错，视觉上有条理的形式呈现论文的动机，核心思想，系统设计和关键结果。Query：我在为论文 GLM-5: from Vibe Coding to Agentic Engineering 准备介绍网站，请生成一个英文网站，清楚呈现论文的背景，方法，主要发现和贡献。

<!-- page 23 of 30 -->

![Image block](images/p23-figure-13-a-case-showing-the-application-of-glm-5v.png)

（图：生成的 14 页紫色渐变幻灯片缩略图，页标题依次为 Attention Is All You Need, Research Background & Motivation, The Key Idea: Replace Recurrence with Attention, Overall Transformer Architecture, Self-Attention Mechanism: Scaled Dot-Product Attention, Multi-Head Attention, Positional Encoding, Encoder-Decoder Structure Details, Why Self-Attention? Computational Analysis, Training Setup, Main Experimental Results: Machine Translation, Ablation Studies & Model Variations, Attention Visualization: Interpretability, Contributions, Impact & Legacy.）

Figure 13: A case showing the application of GLM-5V-Turbo to automatic PowerPoint generation from a research paper, using our official website z.ai. Given the paper Attention Is All You Need, the model generates an English slide deck that summarizes the main motivation, method, architecture, and key findings in a presentation-ready format with interleaved text and figures. Query: I am preparing a presentation based on the paper Attention Is All You Need. Please generate an English PowerPoint that summarizes the paper clearly and professionally.

图 13: GLM-5V-Turbo 在官网 z.ai 上从研究论文自动生成 PowerPoint 的案例。给定论文 Attention Is All You Need，模型生成一份英文幻灯片，以图文交错，可直接演示的形式总结主要动机，方法，架构和关键发现。Query：我要基于论文 Attention Is All You Need 做一次报告，请生成一份清楚，专业地总结这篇论文的英文 PowerPoint。

<!-- page 24 of 30 -->

## A.3 Multimodal Deep Research（多模态深度研究）

![Image block](images/p24-figure-14-a-case-showing-the-application-of-glm-5v.png)

（图：一份 27 页图文报告的缩略图，前 23 页穿插 Apple Watch，AirPods，iPhone 健康界面，Vision Pro 等产品图和两张图表，第 24 到 27 页是来源列表。）

Figure 14: A case showing the application of GLM-5V-Turbo to image materials collection, using our official website z.ai. Note that the original source for each of the chosen images is cited. Query: I am preparing a feature report on Apple Wearables. Please help me collect image assets, ensuring the sources are authoritative and the image quality is high. Requirements: 1. Output in English. 2. Organize into an illustrated report with interleaved images and text.

图 14: GLM-5V-Turbo 在官网 z.ai 上收集图片素材的案例。每张选中图片都标注了原始出处。Query：我在准备一篇关于 Apple 可穿戴设备的专题报道，请帮我收集图片素材，确保来源权威，画质高。要求：1。英文输出。2。组织成图文交错的图文报告。

<!-- page 25 of 30 -->

A.4 Document-Based Writing

A.4 基于文档的写作

![Image block](images/p25-a.png)

（图：北京旅游指南 103 页的缩略图，按 1 到 103 编号，多为图文杂志排版，第 95 到 102 页是雪景。）

![Image block](images/p25-b.png)

（图：三页英文输出。前两页是 「Ten Must-Visit Attractions in Beijing for Foreigners」，列出 Prince Kung's Mansion, Fahai Temple, Beihai Park, Sanlitun, Capital Museum, Dashilar, Olympic Forest Park, National Centre for the Performing Arts，Lu Xun Former Residence，Wu Yutai Tea House 共十处，每处一段 Summary；第三页是 Commentary.）

Figure 15: A case showing the ability of document-based writing. (a) A travel guide of Beijing (in Chinese, 103 pages in total). (b) The commentary introducing must-visit attractions in Beijing. Query: Read this travel guide, summarize ten must-visit attractions for foreigners and write the commentary.

图 15：基于文档写作能力的案例。（a）一份北京旅游指南（中文，共 103 页）。（b）介绍北京必去景点的解说文字。Query：读这份旅游指南，为外国人总结十个必去景点并写解说。

<!-- page 26 of 30 -->

![Image block](images/p26-a-5-ocr-and-document-parsing.png)

(图：教材插图 「图 4.2-5 光的反射现象中光路可逆」，一条入射光和一条反射光在镜面上构成 V 形。这张图来自图 17 (a) 的教材原页，MinerU 把它排到了 A.5 标题之前，文件名也因此带上了 A.5 的标题。)

## A.5 OCR and Document Parsing（OCR 与文档解析）

![Image block](images/p26-a.png)

（图：放射状词云，中心一点连出 24 个不同语言的 「谢谢」，包括 Thank you，谢谢，감사합니다, ありがとう, Danke，Merci，Gracias，Спасибо，Εὐχαριστῶ，qatlho'，Go raibh maith agaibh，Tapadh leibh 等，另有泰米尔文，印地文，阿拉伯文，藏文等文字。）

![Image block](images/p26-b.png)

(图：输出表按 WORD/PHRASE 和 LANGUAGE 两列列出 23 行，语种包括 English, Chinese (Mandarin), Korean, Japanese, Klingon (fictional language)，Bengali 等，表下注明这些词都是各语言的 「Thank you」。)

Figure 16: A case showing the ability of multilingual OCR. (a) Original image. (b) Recognized words/phrases and corresponding language type. Prompt: Recognize each word in the image and identify the language.

图 16：多语种 OCR 能力的案例。（a）原图。（b）识别出的单词/短语及对应语种。Prompt：识别图中每个词并判断语种。

![Image block](images/p26-image.png)

（图：教材插图 「图 4.2-4 探究光的反射定律」，分甲乙两幅：平面镜 M 上立着由 E，F 两块扇形组成的半圆屏，法线 ON；乙图画出入射光 AO 和反射光 OB.）

## 探究光的反射定律

实验装置如图4.2-4甲所示，其中M是一面水平放置的小镜子，上面竖立着一块用来显示光的传播路径的半圆形的屏。这个屏由两个大小相同的扇形面E、F连接而成，E、F与镜面垂直。E与镜子M固定在一起，F可绕接缝ON转动。

如图4.2-4乙所示，让一细光束沿平面 E射到镜面O点，在平面E上可看到入射光AO。此时ON就是过入射点且垂直于镜面的法线。

当改变入射角时，反射角是否改变？每次反射角与入射角各有什么关系？用量角器测量入射角和反射角，把测量结果记录在表4.2-1中。

表 4.2-1 探究光的反射定律

| 实验序号 | 1 | 2 | 3 | ... |
| --- | --- | --- | --- | --- |
| 入射角i |  |  |  |  |
| 反射角r |  |  |  |  |

通过实验探究，我们可以得到结论：光在发生反射时，反射光线、入射光线与法线在同一平面内，反射光线和入射光线分别位于法线两侧，反射角等于入射角。这就是光的反射定律（law of reflection）。在上述实验中，如果让光逆着反射光的方向射到镜面，它被反射后就会逆着原入射光的方向射出（图4.2-5)。这表明，在光的反射现象中，光路是可逆的。

(从 「探究光的反射定律」 到这里，是 MinerU 对图 17 (a) 教材原页的转写，原文即中文，照录，不再另译。)

![Image block](images/p26-a-2.png)

(图：图 17 (b) 输出界面的上半部分，顶部有 Markdown / JSON 两个标签，下面是重新排版的 「图4.2-4 探究光的反射定律」 甲乙两图。)

![Image block](images/p26-b-2.png)

(图：图 17 (b) 的转写结果：标题 「探究光的反射定律」，正文段落，表 4.2-1（实验序号，入射角 i，反射角 r），图 4.2-5，以及结论段。)

Figure 17: A case showing the ability of accurate document transcription. (a) Original page from a physics textbook. (b) Transcribed result, including text, table and figures, in Markdown format.

图 17：准确转写文档的能力案例。（a）物理教材原页。（b）转写结果，包括文字，表格和图，Markdown 格式。

<!-- page 27 of 30 -->

## A.6 Visual Search and Reasoning（视觉搜索与推理）

![Image block](images/p27-figure-18-a-case-showing-the-ability-of-utilizing-the.png)

（图：四页对话截图。第 1 页是一条浅粉色鱼的照片和问题；第 2, 3 页是多轮搜索与思考记录；第 4 页是最终回答。）

Figure 18: A case showing the ability of utilizing the information from the image and multimodal searching tools to solve a complex question, using our official website z.ai. Query: There is a novel written by a British author whose title contains a location where the animal shown in the image is distributed. This author has also written other novels featuring animal names—among them, one whose animal is relatively small in size and not part of the Chinese zodiac, how many people appear on the poster displayed on the Douban page for the film adaptation of this work?

图 18：在官网 z.ai 上结合图像信息与多模态搜索工具解决复杂问题的案例。Query：有一位英国作家的小说，书名里含有图中动物分布的某个地点。这位作家还写过其他以动物命名的小说，其中一部的动物体型较小且不属于十二生肖，这部作品改编电影在豆瓣页面展示的海报上有几个人？搜索过程不转写。

![Image block](images/p27-figure-19-a-case-showing-the-ability-of-locating-the.png)

（图：四页截图。第 1 页是一张雪山下小镇酒店与街道的照片；第 2 页是定位与搜索记录；第 3, 4 页是酒店推荐和价格对比表。）

Figure 19: A case showing the ability of locating the input image and search local hotel prices on specific dates provided by the user, using our official website z.ai. Query: I would like to book a hotel room from 5.1-5.5 in this town, give me a list of 3 hotels in order of total price, with total price, reviews, experience suggestion.

图 19：在官网 z.ai 上定位输入图片，并按用户给定日期搜索当地酒店价格的案例。Query：我想在这个小镇订 5.1 到 5.5 的酒店房间，按总价列出 3 家酒店，附总价，评价和体验建议。搜索过程不转写。

<!-- page 28 of 30 -->

## A.7 Visual Recognition and Grounding（视觉识别与 grounding）

![Image block](images/p28-image.png)

（图：篮球场视频的一帧，蓝框和黄框各框住一名打球的人。）

![Image block](images/p28-image-2.png)

（图：同一视频的另一帧，两人靠近，蓝框和黄框重叠。）

![Image block](images/p28-figure-20-a-case-showing-the-ability-of-video-objects.png)

（图：同一视频第三帧，黄框里的人在运球，蓝框里的人站在篮下。）

Figure 20: A case showing the ability of video objects tracking. Prompt: Output the per-second object tracking results for all people playing basketball in the video. Use valid JSON format, where each key is the second number, and the value is a list of detected objects in that frame.

图 20：视频目标跟踪能力的案例。Prompt：输出视频中所有打篮球的人逐秒的目标跟踪结果，用合法 JSON，键是秒数，值是该帧检测到的目标列表。

![Image block](images/p28-image-3.png)

（图：加油站监控画面，底部字幕 「RED BANK CAR THEFT CAUGHT ON CAMERA」，红框标出车旁的一个人。）

![Image block](images/p28-image-4.png)

（图：同一监控的下一帧，红框跟着同一个人移动。）

![Image block](images/p28-figure-21-a-case-showing-the-ability-of-video-objects.png)

（图：同一监控的第三帧，红框仍在同一人身上。）

Figure 21: A case showing the ability of video objects tracking. Prompt: Based on the description of the objects appearing in the video "person committing crime", please track the objects corresponding to this description at every second (tracks per second) of the given video, and provide the bounding box and a globally consistent label for each object.

图 21：视频目标跟踪能力的案例。Prompt：根据描述 「person committing crime」，在给定视频的每一秒跟踪与描述对应的目标，给出每个目标的边界框和全局一致的标签。

![Image block](images/p28-a.png)

（图：一张多人合影的上色老照片，约三十人分前后几排，每人一个彩色框。这张截图上看不到名字标注。）

![Image block](images/p28-b.png)

(图：展台上的 「NVIDIA GB200 Grace Blackwell Superchip」 电路板，各部件被不同颜色的框标出，框上有小字标签，如 「B200 GPU #1 (Blackwell GPU)」。)

Figure 22: A case demonstrating recognition capability based on grounding and search tools. (a) Person recognition. Prompt: Box out all people and their names. (b) Prompt: This is a screenshot of a GPU circuit board. Search this image, frame each component along with its name, and write a parameter comparison report comparing it with the H100.

图 22：基于 grounding 和搜索工具的识别能力案例。（a）人物识别。Prompt：框出所有人并写出名字。（b）Prompt：这是一张 GPU 电路板的截图。搜索这张图，框出每个部件及其名称，并写一份与 H100 对比的参数报告。原文说是 「GPU circuit board」，图上印的是 GB200 Grace Blackwell Superchip。

<!-- page 29 of 30 -->

| 得分 | 评卷人 |
| --- | --- |
|  |  |

# 2022--2023学年度上学期期末教学质量测查六年级科学试卷

| 题号 | 一 | 二 | 三 | 四 | 五 | 六 | 总分 | 核分人 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 得分 |  |  |  |  |  |  |  |  |

一、填空题（每空2分，共计30分）

1. 放大镜的镜片又 凸透 镜。中央厚，边缘薄的透明物体能把 物体 大，显现人眼看不清的细微之处，使我们获得更多的信息。

2. 同一个微小的物体在肉眼、放大镜和显微镜下观察到的图像大小及视野是不同 的。

3. 细胞是生物体最基本的 恒量和

4. 在水中生活着形态各异的微小生物，它们具有微、的特征。

5. 通过制作地球模型，我们了解了地球的内部圈层结构，知道地球内部可分为 地壳 、地幔和地核 ，地球外部包围着厚厚的大气层 的大气层 如

6. 地球绕地轴自转，地球的自转产生 夜立 现象。

7. 电磁起重机通电时，电能转换为能，可吸起钢铁。

8. 杠杆和斜面一样，都是一种 基本 械。

9. 在我们观察到的各种现象中，能量的表现形式虽然各不相同，但最终都可以转化为一种新的能量形式 机xie 能。 它可以使物体

## 1

Dear Lisa

I'm glad to hear from you. Let me tell you somethings about the idiom "Chen Men Li xue 11

The story happened in the Song Dynasty. Cheng Yi is one of the famousEeacherduning the Song Dunasty. One day, two of his students came to ask questions. When theygoChenghome it began to snow. However, they found their teacher was having a nap. so they decided to wait outside the door.

A few hours later, whenChen  woke up, he surprisely found two students were waiting outside and they werecover withno0. He askea why they didn't come in. They askedtey clidn't want to disturb the teacher.

I think thi's story i's very meaningful, it tells us we should respect our teachers.

（从 「得分 | 评卷人」 到这里，是 MinerU 把图 23 的两张图直接转写成了文字：前半是一份六年级科学期末试卷的填空题，含学生手写答案的识别结果；后半是一封英文作文 「Dear Lisa」，讲 「程门立雪」 的故事，其中的拼写错误是作文原样。照录，不译。）

Figure 23: A case demonstrating the ability to grounding educational scene elements. (a) Grounding of student handwritten answers. Prompt: Find the bounding box of each student’s handwritten answer for each blank. (b) Grounding of writing errors. Prompt: Identify the misspelled words or incorrectly used words/phrases in it.

图 23：教育场景元素 grounding 能力的案例。（a）学生手写答案的 grounding. Prompt：找出每个空里学生手写答案的边界框。（b）写作错误的 grounding. Prompt：找出其中拼错的单词或用错的词/短语。

> **确认：** 图 23 的两张图在哪？
> 目录里没有图 23 的图片文件。第 29 页 MinerU 把试卷和英文作文两张图识别成了文字（表格，标题 「# 2022--2023学年度...」 和 「## 1」），只留下一个 「(a)」，（b）标签丢了。紧接着的 p29-a.png 和 p29-b.png 属于图 24 (3D grounding): p29-a 是厨房里的 3D 框，p29-b 是走廊里一盆绿植的 3D 框。所以第 29 页的两张图片文件对应图 24 的（a）（b），不是图 23。源文在 p29-a 后面还多出一个孤立的 「(b)」，也是版面识别留下的。

![Image block](images/p29-a.png)

（图：厨房照片上叠加多个 3D 框，标签有 shelves，bin，sink，counter 等，标签里带 h=0.7m，dep=3m 这类高度与深度数值。）

![Image block](images/p29-b.png)

（图：智谱办公区走廊，墙上有 「智谱」 字样，左边是一台显示屏，右侧第一盆绿植被蓝色 3D 框框住。）

Figure 24: A case demonstrating 3D grounding capability, where our model outputs a 3D bounding box defined by nine values: the center point coordinates (x, y, z) and the sizes (x\_size, y\_size, z\_size) — all in meters — along with the three rotation angles in radians. (a) Prompt: Please identify all objects belonging to the category furniture and output their 3D bounding boxes in JSON format. (b) Prompt: Please locate the first potted plant’s 3D bounding box and output it in JSON format, where the 9 coordinate values correspond to the center point (x, y, z) and the sizes (x\_size, y\_size, z\_size) across three dimensions all in meters, and the three rotation angles in radians.

图 24: 3D grounding 能力的案例。模型输出由九个值定义的 3D 边界框：中心点坐标（x, y, z），尺寸（x_size, y_size, z_size），单位均为米，以及三个以弧度表示的旋转角。（a）Prompt：识别所有属于 furniture 类别的物体，以 JSON 输出它们的 3D 边界框。（b）Prompt：定位第一盆盆栽的 3D 边界框，以 JSON 输出，9 个坐标值分别对应中心点（x, y, z），三个维度的尺寸（x_size, y_size, z_size），单位米，以及三个弧度制旋转角。

<!-- page 30 of 30 -->

## A.8 Spatial Reasoning（空间推理）

![Image block](images/p30-figure-25-a-case-showing-the-ability-of-spatial.png)

（图：一张手部 X 光片，有六根手指，每根手指上一个红点，共六个红点。）

Figure 25: A case showing the ability of spatial reasoning and object counting. Prompt: How many fingers are there in the image? Please mark the positions of all fingers in the image using the [[x,y]] format.

图 25：空间推理与物体计数能力的案例。Prompt：图中有几根手指？用 [[x，y]] 格式标出所有手指的位置。

> **再看：** 图 25 的正确答案是几根？
> 图注没给答案，只给了 Prompt。看 p30 那张图：X 光片上是一只六指的手，红点也是六个，一指一个。我的理解是，这个例子考的是数图上实际有几根，不按 「手有五指」 的常识作答。论文没有给这类任务的分数；第 4 页和空间有关的只有 SUNRGBD 3D grounding +7.7% 这一个 RL 涨幅，图 1 里 CogViT 也没有空间感知的单独柱子。

30
