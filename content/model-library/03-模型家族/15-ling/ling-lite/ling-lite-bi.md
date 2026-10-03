---
title: "Ling-Lite · 对照译稿"
category: "模型库"
tags: ["Ling", "对照译稿"]
published: true
excerpt: "Ling-Lite 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 34 -->

arXiv:2503.05139v2 [cs.LG] 10 Mar 2025

arXiv 编号 2503.05139v2, 分类 cs.LG, 2025 年 3 月 10 日提交这一版.

March 11, 2025

2025 年 3 月 11 日.

# EVERY FLOP COUNTS: SCALING A 300B MIXTURE-OF-EXPERTS LING LLM WITHOUT PREMIUM GPUS (每一个 FLOP 都算数: 不用高端 GPU 缩放一个 300B 的 MoE Ling 大模型)

**Ling Team, AI@Ant Group**

Ling 团队, 蚂蚁集团 (AI@Ant Group).

## ABSTRACT

In this technical report, we tackle the challenges of training large-scale Mixture of Experts (MoE) models, focusing on overcoming cost inefficiency and resource limitations prevalent in such systems. To address these issues, we present two differently sized MoE large language models (LLMs), namely Ling-Lite and Ling-Plus (referred to as "Bailing" in Chinese, spelled Bailíng in Pinyin). Ling-Lite ˇ contains 16.8 billion parameters with 2.75 billion activated parameters, while Ling-Plus boasts 290 billion parameters with 28.8 billion activated parameters. Both models exhibit comparable performance to leading industry benchmarks. This report offers actionable insights to improve the efficiency and accessibility of AI development in resource-constrained settings, promoting more scalable and sustainable technologies. Specifically, to reduce training costs for large-scale MoE models, we propose innovative methods for (1) optimization of model architecture and training processes, (2) refinement of training anomaly handling, and (3) enhancement of model evaluation efficiency. Additionally, leveraging high-quality data generated from knowledge graphs, our models demonstrate superior capabilities in tool use compared to other models. Ultimately, our experimental findings demonstrate that a 300B MoE LLM can be effectively trained on lower-performance devices while achieving comparable performance to models of a similar scale, including dense and MoE models. Compared to high-performance devices, utilizing a lower-specification hardware system during the pre-training phase demonstrates significant cost savings, reducing computing costs by approximately 20%. The models can be accessed at [https://huggingface.co/inclusionAI](https://huggingface.co/inclusionAI).

本技术报告处理训练大规模 MoE 模型时遇到的难题, 重点是这类系统里普遍存在的成本低效和资源受限. 为此我们推出两个不同尺寸的 MoE 大语言模型 (LLM): Ling-Lite 和 Ling-Plus (中文名 「百灵」, 拼音 Bailíng). Ling-Lite 总参数 16.8B, 激活参数 2.75B; Ling-Plus 总参数 290B, 激活参数 28.8B. 两个模型的表现都与业界领先的基准水平相当. 本报告给出可以落地的经验, 帮助在资源受限的条件下提高 AI 开发的效率和可及性, 推动更可扩展, 更可持续的技术. 具体来说, 为降低大规模 MoE 模型的训练成本, 我们提出了以下方法: (1) 优化模型架构和训练流程, (2) 改进训练异常处理, (3) 提高模型评测效率. 此外, 借助由知识图谱生成的高质量数据, 我们的模型在工具使用上强于其他模型. 最终, 实验结果表明, 一个 300B 的 MoE LLM 可以在性能较低的设备上有效训练, 并取得与同等规模 dense 模型和 MoE 模型相当的表现. 与高性能设备相比, 在预训练阶段使用规格较低的硬件系统能明显省钱, 计算成本降低约 20%. 模型可在 https://huggingface.co/inclusionAI 获取.

> **想:** 标题写 「SCALING A 300B MIXTURE-OF-EXPERTS LING LLM」, 摘要里 Ling-Plus 却是 「290 billion parameters」. 标题的 300B 和正文的 290B 是同一个数吗?
> 不是同一个数. 290B 是 Ling-Plus 的总参数, 出现在摘要第 3 句 「Ling-Plus boasts 290 billion parameters with 28.8 billion activated parameters」, 第 1.1 节末句又写了一次 「a total parameter count of 290B」. 300B 出现在标题, 摘要倒数第 3 句 「a 300B MoE LLM can be effectively trained on lower-performance devices」 和第 7 节结论里措辞相同的一句, 三处都在说 「三千亿量级的 MoE」, 是取整的量级说法, 本文任何一张表里都没有 300B 这个具体数值. 引用 Ling-Plus 的参数量用 290B; 说论文想证明的量级才用 300B.

## Introduction (引言)

## 1.1 Background and Motivation (背景与动机)

In recent years, the rapid development of LLMs OpenAI [2024a], Gemini [2024], Claude [2024], Qwen [2025], DeepSeek-AI [2025] has sparked widespread discussions across academia and industry regarding Artificial General Intelligence (AGI). While dense models have achieved remarkable progress, MoE models, such as the DeepSeek series DeepSeek-AI [2024a,b, 2025], the Qwen series Bai et al. [2023], Yang et al. [2024], Qwen [2025], and the MiniMax-01 series MiniMax [2025], have demonstrated outstanding performance, even surpassing traditional dense models in certain specific tasks. However, the training of MoE models typically relies on high-performance computing resources (e.g., advanced AI accelerator like H100 and H800), and their prohibitively high costs have limited broader adoption in resource-constrained environments. This study proposes innovative training strategies to enable efficient LLM training under restricted resources and budget constraints, thereby advancing the inclusive development of AI technologies. To provide the industry with a novel approach to model training in resource-constrained scenarios and to inspire the development of more innovative solutions, this report introduces our open-source MoE models, Ling-Lite (with a total parameter count of 16.8B and an activation parameter count of 2.75B) and Ling-Plus (with a total parameter count of 290B and an activation parameter count of 28.8B), focusing on their exploration and optimization practices.

近年来 LLM 发展迅速 (OpenAI [2024a], Gemini [2024], Claude [2024], Qwen [2025], DeepSeek-AI [2025]), 在学术界和产业界引发了关于通用人工智能 (AGI) 的广泛讨论. dense 模型进展显著, 而 MoE 模型, 例如 DeepSeek 系列 (DeepSeek-AI [2024a,b, 2025]), Qwen 系列 (Bai et al. [2023], Yang et al. [2024], Qwen [2025]) 和 MiniMax-01 系列 (MiniMax [2025]), 表现同样出色, 在某些特定任务上甚至超过传统 dense 模型. 但 MoE 模型的训练通常依赖高性能计算资源 (例如 H100, H800 这类先进 AI 加速器), 成本高得难以承受, 限制了它在资源受限环境中的推广. 本研究提出新的训练策略, 让 LLM 能在资源和预算受限的条件下高效训练, 推动 AI 技术的普惠发展. 为了给业界提供资源受限场景下训练模型的新思路, 并启发更多创新方案, 本报告介绍我们开源的 MoE 模型 Ling-Lite (总参数 16.8B, 激活参数 2.75B) 和 Ling-Plus (总参数 290B, 激活参数 28.8B), 重点讲它们的探索与优化实践.

> **核对:** Ling-Lite 的 16.8B 和 2.75B 在正文里各出现在哪一行? 两个数是什么关系?
> 都在第 1 页, 各出现两次. 第一处是摘要第 3 句 「Ling-Lite contains 16.8 billion parameters with 2.75 billion activated parameters」; 第二处是第 1.1 节最后一句的括号 「(with a total parameter count of 16.8B and an activation parameter count of 2.75B)」. 16.8B 是总参数, 即全部专家连同共享部分的参数量; 2.75B 是每个 token 前向时实际参与计算的激活参数. 两个数描述不同维度, 2.75/16.8 约为 16.4%. 同一句里 Ling-Plus 是 290B 对 28.8B, 比例约 9.9%, 所以 Lite 的激活比例比 Plus 高.

## 1.2 Computing Environment for Model Training (模型训练的计算环境)

The availability of computational resources is a critical determinant in the development of LLMs, particularly in the context of the increasingly popular MoE architecture. Recent State-of-the-art MoE models rely heavily on highperformance AI accelerators (e.g., H100 and H800) for training, yet the supply of such resources has remained constrained in recent years. Similar to the analysis on the imbalance of day-night inference load in the DeepSeek’s open-source files DeepSeek [2025], in the commercial deployment of AI services, these high-performance resources are also in high demand during peak usage periods to ensure service quality. As a result, many LLM research organizations face persistent shortages of high-performance AI accelerators. In comparison, lower-performance accelerators are more widely available and maybe cost-effective on a per-unit basis. This discrepancy highlights the need for a technical framework that enables seamless switching between heterogeneous computing units and distributed clusters for training

算力资源是否可得, 是 LLM 发展的关键因素, 在日益流行的 MoE 架构下尤其如此. 近期最先进的 MoE 模型训练高度依赖高性能 AI 加速器 (例如 H100 和 H800), 而这类资源近几年供应一直紧张. 与 DeepSeek 开源文件 (DeepSeek [2025]) 对推理负载昼夜不均的分析类似, 在 AI 服务的商业部署中, 这些高性能资源在高峰时段同样需求旺盛, 用来保证服务质量. 因此许多 LLM 研究机构长期缺少高性能 AI 加速器. 相比之下, 性能较低的加速器更容易获得, 按单卡计也可能更划算. 这种差距说明需要一套技术框架, 让训练 (句子接下页)

<!-- page 2 of 34 -->

![Chart block](images/p02-figure-1-ling-lite-performance.png)

Figure 1: Ling-Lite performance.

图 1: Ling-Lite 的表现.

![Chart block](images/p02-figure-2-ling-plus-performance.png)

Figure 2: Ling-Plus performance.

图 2: Ling-Plus 的表现.

<!-- page 3 of 34 -->

Table 1: Characteristics of different AI accelerators (listed in descending order of availability).

表 1: 不同 AI 加速器的特性 (按可得性从高到低排列).

| Device | Peak FLOPS (T) | Memory (GB) | Fair Cost per Hour (RMB) | Support FP8 |
| --- | --- | --- | --- | --- |
| A | 370 | 64 | 7 | × |
| B | 120 | 96 | 4.5 | × |
| C | 312 | 80 | 10 | × |
| D | 989 | 80 | 27.5 | √ |
| E | 147 | 96 | 5.64 | √ |

and inference. Such a system could alleviate the supply-demand imbalance and reduce overall training costs. The training of our Ling models utilized the computational resources in Table 1.

和推理能在异构计算单元和分布式集群之间无缝切换. 这样的系统可以缓解供需失衡, 降低整体训练成本. Ling 模型的训练用到了 Table 1 中的算力资源.

> **看表:** Table 1 里哪台是 「高性能设备」, 哪些算 「lower-performance devices」?
> D 的峰值算力 989 TFLOPS, 每小时 27.5 元, 支持 FP8, 是表里唯一的高端卡; 第 1.3 节末的成本对比也点名 「high-performance hardware configuration (device D)」. A, B, C, E 的峰值在 120 到 370 TFLOPS 之间, 每小时 4.5 到 10 元. 按每元每小时买到的峰值算力折算, A 约 52.9, D 约 36.0, C 约 31.2, B 约 26.7, E 约 26.1, 所以 「低配」 不等于 「单位算力更贵」, 按纸面峰值 A 反而最划算. 表题说 A 到 E 按可得性降序排列, 能不能买到, 租到才是这张表的排序依据. Table 8 做一致性对比时用的也正是 A 和 D.

From an economic efficiency perspective, these solutions reduce unit compute costs. However, the heterogeneous nature of device architectures (e.g., DSA and GPGPU) and the geographical dispersion of clusters introduce significant technical challenges, primarily in the following three aspects.

从经济效率看, 这些方案降低了单位算力成本. 但设备架构的异构 (例如 DSA 和 GPGPU) 以及集群在地理上的分散, 带来了不小的技术挑战, 主要有以下三方面.

**Cross-cluster and cross-device compatibility.** As described in the open-source project FlagScale FlagOpen [2025], heterogeneous hardware environments often exhibit discrepancies in the implementation of lowlevel computational and communication operators and high-level distributed training frameworks. These challenges are particularly evident in training advanced architectures like MoE, where operators such as group\_gemm, permute/unpermute, and all2all, and distributed strategies like expert parallelism may be missing or perform inconsistently across platforms. Ensuring training accuracy and portability requires: (1) collaboration with hardware vendors to standardize low-level operators, ensuring computational and communication consistency, (2) development of cross-platform compatibility layers to support seamless integration across distributed training frameworks, and (3) implementation of efficient debugging mechanisms for identifying and resolving issues in complex and heterogeneous environments.

**跨集群与跨设备兼容性.** 正如开源项目 FlagScale (FlagOpen [2025]) 所述, 异构硬件环境在底层计算与通信算子, 以及上层分布式训练框架的实现上, 往往存在差异. 训练 MoE 这类先进架构时, 这些问题尤其明显: group_gemm, permute/unpermute, all2all 等算子, 以及专家并行等分布式策略, 在不同平台上可能缺失或表现不一致. 要保证训练精度和可移植性, 需要: (1) 与硬件厂商合作统一底层算子, 保证计算和通信一致; (2) 开发跨平台兼容层, 支持在各分布式训练框架之间无缝集成; (3) 实现高效的调试机制, 在复杂的异构环境中定位并解决问题.

• **Reliability of cross-cluster resource synchronization.** LLM training, especially for ultra-large MoE models, requires managing massive datasets and checkpoint backups that can reach petabyte (PB) scales. Seamless task migration across clusters relies on: (1) achieving low-latency, consistent synchronization of data resources across clusters and (2) enabling flexible, high-speed management and I/O for training artifacts, such as model checkpoints, across distributed clusters.

• **跨集群资源同步的可靠性.** LLM 训练, 尤其是超大 MoE 模型, 需要管理海量数据集和检查点备份, 规模可达 PB 级. 跨集群无缝迁移任务依赖两点: (1) 跨集群的数据资源同步要低延迟且一致; (2) 在分布式集群之间, 对模型检查点等训练产物要能灵活, 高速地管理和读写.

• **Cost-performance optimization.** Balancing cost efficiency and model performance is a core objective. Achieving this requires: (1) optimization of hardware resource allocation and scheduling, (2) trade-offs between computational efficiency and training precision, and (3) rational design and scaling of model architectures to ensure cost-effective performance.

• **性价比优化.** 在成本效率和模型性能之间取得平衡是核心目标. 这需要: (1) 优化硬件资源的分配与调度; (2) 在计算效率和训练精度之间权衡; (3) 合理设计并缩放模型架构, 让性能与成本相称.

## 1.3 Optimization for Model Training (模型训练的优化)

To address the above-mentioned technical challenges posed by limited computational resources, we implement a series of systematic optimization strategies to balance resource cost and model performance. These strategies are outlined as follows.

为应对算力受限带来的上述技术挑战, 我们实施了一系列系统性的优化策略, 在资源成本和模型性能之间取得平衡. 这些策略概述如下.

**Optimization of model architecture and training strategies.** To enable efficient deployment on resourceconstrained platforms, we adpot the following three strategies. (1) Model architecture optimization: Based on the comprehensive analysis of scaling laws for dense and MoE models, we can choose the best-matching architecture for the available computational resource. (2) Training framework optimization: For heterogeneous computing platforms, we integrate multiple training frameworks into a unified distributed deep learning framework, i.e., our open-source project, DLRover DLRover [2023]. Additionally, to leverage the specific characteristics of various platforms, we develop a lightweight debugging tool, XPUTimer, which facilitates rapid and cost-effective task performance analysis while achieving a 90% reduction in memory usage. Furthermore, we implement a platform-agnostic asynchronous training strategy, namely EDiT (Elastic Distributed Training), which enhances the training efficiency, under various configurations, the training time can be reduced by up to 66.1%. (3) Storage optimization: Techniques such as device multi-tenancy and file system in user space (FUSE) are applied to achieve high performance and multi-cluster adaptability for large-scale training. Collaborative design of storage and training processes enhances I/O efficiency in MoE scenarios, reducing time overhead by 50%.

**模型架构与训练策略优化.** 为了在资源受限的平台上高效部署, 我们采用以下三项策略. (1) 模型架构优化: 基于对 dense 模型和 MoE 模型 scaling law 的全面分析, 为可用算力选出最匹配的架构. (2) 训练框架优化: 针对异构计算平台, 我们把多个训练框架整合进统一的分布式深度学习框架, 即我们的开源项目 DLRover (DLRover [2023]). 此外, 为了利用各平台的特性, 我们开发了轻量级调试工具 XPUTimer, 能快速, 低成本地做任务性能分析, 内存占用减少 90%. 我们还实现了与平台无关的异步训练策略 EDiT (Elastic Distributed Training, 弹性分布式训练), 提升训练效率, 在不同配置下训练时间最多可减少 66.1%. (3) 存储优化: 采用设备多租户和用户态文件系统 (FUSE) 等技术, 为大规模训练实现高性能和多集群适配. 存储与训练流程协同设计, 提升了 MoE 场景下的 I/O 效率, 时间开销减少 50%.

<!-- page 4 of 34 -->

• **Refinement of training anomaly handling.** To address hardware errors and loss anomalies in large-scale training, we develop a robust anomaly-handling mechanism as follows. (1) Multi-level anomaly detection system: To detect anomalies throughout the training process, we establish a real-time monitoring system. (2) Automated checkpoint recovery: To minimize the impact of anomalies on training progression, we implement an automated recovery mechanism.

• **训练异常处理的改进.** 为应对大规模训练中的硬件错误和 loss 异常, 我们建立了一套稳健的异常处理机制. (1) 多级异常检测系统: 为发现整个训练过程中的异常, 我们搭建了实时监控系统. (2) 自动检查点恢复: 为尽量减小异常对训练进度的影响, 我们实现了自动恢复机制.

• **Enhancement of model evaluation efficiency.** To optimize monitoring of cross-cluster model training, we attempt to improve the evaluation benchmarks and frameworks as follows. (1) Comprehensive evaluation dataset: To mitigate initial model underperformance and improve stability, we construct some domain-specific evaluation datasets and optimize the corresponding prediction strategies and prompting templates. (2) Efficient evaluation system: Based on our self-innovate offline inference framework, i.e., Flood, we develop a scalable system for cross-cluster evaluations with consistent results, achieving an average deviation of less than 0.5%. (3) Automated analysis system: To provide real-time feedback to adjust training strategies, we develop an automated system to correlate evaluation results with model performance and datasets.

• **模型评测效率的提升.** 为了更好地监控跨集群的模型训练, 我们从以下方面改进评测基准和评测框架. (1) 完善的评测数据集: 为缓解训练初期模型表现不佳带来的问题并提高稳定性, 我们构建了一些领域专用评测集, 并优化了对应的预测策略和 prompt 模板. (2) 高效的评测系统: 基于自研的离线推理框架 Flood, 我们开发了可扩展的跨集群评测系统, 结果一致, 平均偏差低于 0.5%. (3) 自动化分析系统: 为实时反馈并调整训练策略, 我们开发了把评测结果与模型表现和数据集关联起来的自动化系统.

**Improvement of tool use capability.** To enhance the tool use ability of large models, we focus on the following two key aspects. (1) High-quality data synthesis: To efficiently generate high-quality, scalable, and diverse tool-use data, we leverage knowledge graph technology and generalized calling instructions to extract diverse and complex function chains and thus enhance the applicability of Ling models across various real-world scenarios. (2) Adaptive tool learning: By leveraging learning strategies such as rejection sampling and error correction, we develop self-reflective multi-agent interactive dialogues to enhance the adaptive tool use capability of the Ling model.

**工具使用能力的提升.** 为增强大模型使用工具的能力, 我们重点做两件事. (1) 高质量数据合成: 为高效生成高质量, 可扩展, 多样的工具使用数据, 我们借助知识图谱技术和泛化的调用指令, 抽取多样而复杂的函数调用链, 提高 Ling 模型在各类真实场景中的适用性. (2) 自适应工具学习: 借助拒绝采样和纠错等学习策略, 我们构造了带自我反思的多智能体交互对话, 增强 Ling 模型自适应使用工具的能力.

Based on the above-mentioned technical optimizations, we develop and open-source the Ling series of MoE models, which achieves a balanced trade-off between resource cost and model performance. From the perspective of resource efficiency, Ling-Plus serves as an illustrative example, with pre-training conducted on 9 trillion tokens across five distinct hardware configurations (as detailed in Table 1). Training 1 trillion tokens using the high-performance hardware configuration (device D) incurs an estimated cost of approximately 6.35 million RMB. In contrast, utilizing a lowerspecification hardware system reduces the cost to around 5.08 million RMB, representing a cost savings of nearly 20%. These results demonstrate the feasibility of training state-of-the-art (SOTA) large-scale MoE models on less powerful hardware, enabling a more flexible and cost-effective approach to foundational model development with respect to computing resource selection.

基于上述技术优化, 我们开发并开源了 Ling 系列 MoE 模型, 在资源成本和模型性能之间取得了平衡. 从资源效率看, 以 Ling-Plus 为例, 它的预训练在五种不同硬件配置 (详见 Table 1) 上处理了 9 万亿 (9T) token. 用高性能硬件配置 (设备 D) 训练 1 万亿 token, 估算成本约 635 万元人民币; 换成规格较低的硬件系统, 成本降到约 508 万元, 节省近 20%. 这些结果说明, 在性能较弱的硬件上训练最先进 (SOTA) 的大规模 MoE 模型是可行的, 让基座模型开发在算力选择上更灵活, 更省钱.

> **对一下:** 635 万元和 508 万元, 算出来真是 「nearly 20%」 吗? 这组数是哪个模型的?
> 1 - 5.08/6.35 = 0.200, 正好 20%. 这组数出自第 1.3 节这一段, 对象是 Ling-Plus, 口径是 「训练 1 万亿 token」 的算力成本, 不是 9T token 全程的总花费, 也不涉及 Ling-Lite. 摘要和第 7 节说的 「reducing computing costs by approximately 20%」 指的就是这一组数.

We evaluated our Ling models on a comprehensive array of benchmarks. With similar parameter sizes, our Ling models trained under limited resources and budget constraints deliver comparable performance to existing open-source models, particularly in the ability of tool use (see the evaluation results in Figures 1 and 2).

我们在一系列基准上评测了 Ling 模型. 在参数规模相近时, 在有限资源和预算下训练的 Ling 模型与现有开源模型表现相当, 工具使用能力尤其突出 (评测结果见 Figure 1 和 Figure 2).

## 1.4 Challenges and Lessons Learned (挑战与教训)

Despite the above-mentioned contributions, the process of transitioning training tasks across different accelerators continues to pose significant challenges. Throughout the training process, several issues were identified, which are outlined below along with the key insights derived from addressing them:

尽管有上述贡献, 在不同加速器之间迁移训练任务仍然困难重重. 整个训练过程中我们发现了若干问题, 下面列出这些问题以及解决它们时得到的关键经验:

• **Training stability.** During the training of ultra-large-scale models, both hardware-related factors and seemingly minor modifications to the network structure can substantially influence the stability and convergence of the models. In particular, challenges such as loss divergence, loss spikes, and expert load imbalance were observed. These issues, along with the strategies employed to address them, are thoroughly discussed in Section 6.

• **训练稳定性.** 训练超大规模模型时, 硬件因素和网络结构上看似很小的改动, 都可能明显影响模型的稳定性和收敛. 我们观察到的具体问题包括 loss 发散, loss 尖峰和专家负载失衡. 这些问题及应对策略在第 6 节详细讨论.

• **Cross-platform alignment.** When migrating training workflows across different hardware environments, the upper-layer framework provides abstraction and ensures the accuracy of basic operations. However, minor precision errors can accumulate throughout the course of large-scale training. Over time, these seemingly negligible discrepancies can lead to significant variations in outcomes across different hardware configurations.

• **跨平台对齐.** 在不同硬件环境之间迁移训练流程时, 上层框架提供了抽象, 保证基础运算的正确性. 但微小的精度误差会在大规模训练过程中不断累积. 时间一长, 这些看似可以忽略的差异会让不同硬件配置下的结果出现明显偏差.

In the following sections, we will introduce our Ling models in the sequence of Infrastructure (Section 2), Pre-Training (Section 3), and Post-Training (Section 4). Finally, we will present the model’s performance on the evaluation benchmarks in Section 5, along with some of the lessons learned throughout the process in Section 6.

后续章节按以下顺序介绍 Ling 模型: 基础设施 (第 2 节), 预训练 (第 3 节), 后训练 (第 4 节). 最后在第 5 节展示模型在评测基准上的表现, 并在第 6 节总结过程中得到的一些教训.

## 2 Infrastructure, Scaling, and Efficiency (基础设施, 缩放与效率)

In response to the growing demand for high-performance accelerators required for training large-scale models, expanding computational capacity through the integration of additional hardware has become an essential strategy. To address this

为满足训练大模型对高性能加速器日益增长的需求, 通过接入更多硬件来扩充算力已成为必要策略. 为应对这一 (句子接下页)

<!-- page 5 of 34 -->

![Image block](images/p05-figure-3-the-general-structure-of-xputimer.png)

Figure 3: The general structure of XPUTimer.

图 3: XPUTimer 的总体结构.

challenge , we leverage our open-source project DLRover (Distributed Deep Learning Training System) to optimize and seamlessly migrate computing workloads to proprietary hardware. With the help of this framework, it is very easy to launch training frameworks on different platforms, including DeepSpeed Song et al. [2023], Megatron-LM Shoeybi et al. [2020], and Megatron vendor version. To meet the need for lightweight performance monitoring and fault diagnosis, DLRover incorporates the XPUTimer Cui et al. [2025], a minimalistic runtime performance analysis framework. Furthermore, to mitigate performance decline in large-scale heterogeneous distributed training environments, the EDiT Cheng et al. [2025] method has been adopted, which is an efficient asynchronous training approach tailored for LLMs. In addition to computational efficiency, I/O also has a significant impact on overall performance. To address this, we have developed PCache and a cross-cluster synchronization solution, further enhancing the overall training efficiency. Lastly, to improve data synthesis efficiency and accelerate the evaluation process, a high-performance offline inference framework, named Flood, has been introduced.

挑战, 我们利用开源项目 DLRover (Distributed Deep Learning Training System, 分布式深度学习训练系统) 优化计算负载, 并把它无缝迁移到自有硬件上. 借助这个框架, 可以很方便地在不同平台上启动各种训练框架, 包括 DeepSpeed (Song et al. [2023]), Megatron-LM (Shoeybi et al. [2020]) 以及 Megatron 厂商版本. 为满足轻量级性能监控和故障诊断的需要, DLRover 集成了 XPUTimer (Cui et al. [2025]), 一个极简的运行时性能分析框架. 此外, 为缓解大规模异构分布式训练环境中的性能下降, 我们采用了 EDiT 方法 (Cheng et al. [2025]), 这是一种为 LLM 定制的高效异步训练方法. 除计算效率外, I/O 对整体性能的影响也很大. 为此我们开发了 PCache 和一套跨集群同步方案, 进一步提升整体训练效率. 最后, 为提高数据合成效率, 加快评测流程, 我们引入了高性能离线推理框架 Flood.

## 2.1 Lightweight Profiler (轻量级性能分析器)

To address performance bottlenecks and hidden inefficiencies in distributed training of large-scale models, we propose a lightweight analytical tool, referred to as XPUTimer (see Figure 3). XPUTimer has been integrated into our open-source DLRover system, enabling real-time diagnostic capabilities across the entire training stack. This tool also facilitates the retrieval of status information from diverse training environments. As illustrated in Figure 3, XPUTimer comprises two primary components: (1) lightweight selective tracing and (2) diagnostic engine. The selective tracing mechanism is designed to monitor critical training code segments while incurring minimal overhead. The diagnostic engine, in turn, leverages the real-time data collected by a tracking daemon to rapidly pinpoint the root causes of training anomalies.

为解决大模型分布式训练中的性能瓶颈和隐性低效, 我们提出轻量级分析工具 XPUTimer (见 Figure 3). XPUTimer 已集成进开源的 DLRover 系统, 可对整个训练栈做实时诊断. 它也便于从各种训练环境中获取状态信息. 如 Figure 3 所示, XPUTimer 由两个主要组件构成: (1) 轻量级选择性追踪, (2) 诊断引擎. 选择性追踪机制只监控关键训练代码段, 开销极小. 诊断引擎则利用追踪守护进程实时收集的数据, 快速定位训练异常的根因.

## 2.1.1 Lightweight Selective Tracing (轻量级选择性追踪)

The lightweight selective tracing mechanism is designed to capture and log critical events selectively, ensuring that sufficient diagnostic information is collected without incurring the substantial memory and computational overhead of full-scale monitoring. The key features of this mechanism can be summarized as follows:

轻量级选择性追踪机制有选择地捕获和记录关键事件, 在收集足够诊断信息的同时, 避免全量监控带来的大量内存与计算开销. 它的主要特点如下:

**Error interception.** To identify high-level operations that may introduce performance bottlenecks or errors, we implemented Python-layer interception that allows dynamic configuration of APIs for monitoring (e.g., garbage collection, synchronization, and data loading). This is achieved by modifying environment variables such as TRACED\_PYTHON\_API. In addition, we designed a framework-agnostic kernel monitoring mechanism using C++/CUDA-level interception. This approach enables the tracking of computation kernels (e.g., cuBLAS and Flash Attention), communication kernels (e.g., NCCL operations), and custom operators via an explicit registration interface.

**错误拦截.** 为识别可能引入性能瓶颈或错误的高层操作, 我们实现了 Python 层拦截, 可动态配置需要监控的 API (例如垃圾回收, 同步和数据加载). 配置方式是修改 TRACED_PYTHON_API 等环境变量. 此外, 我们设计了与框架无关的内核监控机制, 在 C++/CUDA 层做拦截. 这样可以追踪计算内核 (例如 cuBLAS 和 Flash Attention), 通信内核 (例如 NCCL 操作), 以及通过显式注册接口接入的自定义算子.

• **Interference avoidance.** XPUTimer minimizes its impact on the training process by employing asynchronous event management. Specifically, it combines synchronous APIs for timestamp recording with asynchronous kernels of accelerators using CUDA events to monitor execution states. For instance, events are injected following NCCL kernel launches, and their completion is monitored in a background thread. This approach ensures that the diagnostic process does not interfere with the primary training workflow.

• **避免干扰.** XPUTimer 用异步事件管理把对训练过程的影响降到最低. 具体做法是把同步 API 记录时间戳与加速器上的异步内核结合起来, 用 CUDA event 监视执行状态. 例如, 在 NCCL 内核启动后注入 event, 再由后台线程监视它是否完成. 这样诊断过程不会干扰主训练流程.

<!-- page 6 of 34 -->

![Chart block](images/p06-figure-4-the-memory-usage-comparisons-between-xputimer.png)

Figure 4: The memory usage comparisons between XPUTimer and other methods.

图 4: XPUTimer 与其他方法的内存占用对比.

![Image block](images/p06-figure-5-the-comparisons-of-traditional-distributed.png)

Figure 5: The comparisons of traditional distributed method and EDiT method.

图 5: 传统分布式方法与 EDiT 方法的对比.

• **Low overhead.** XPUTimer is designed to maintain a low-cost diagnostic footprint. To enable asynchronous event management, it employs an optimized architecture that includes: (1) event pool management to reuse pre-allocated CUDA events, (2) asynchronous data processing via a dedicated background thread for event collection and logging, and (3) data compression techniques that record only essential fields, such as timestamps and kernel input layouts. These optimizations lead to significantly reduced log sizes, averaging approximately 1.5 MB per accelerator per training step, which represents an approximate 90% reduction in memory usage, as illustrated in Figure 4.

• **低开销.** XPUTimer 的诊断开销很低. 为实现异步事件管理, 它采用了优化后的架构: (1) 事件池管理, 复用预先分配的 CUDA event; (2) 由专门的后台线程异步收集事件并写日志; (3) 数据压缩, 只记录时间戳和内核输入布局等必要字段. 这些优化大幅缩小了日志体积, 平均每个加速器每个训练 step 约 1.5 MB, 内存占用减少约 90%, 见 Figure 4.

## 2.1.2 Diagnostic Engine (诊断引擎)

The diagnostic engine is also a core component of XPUTimer, responsible for analyzing real-time data collected by the tracing daemon to quickly pinpoint the root causes of training anomalies. It tackles the attribution challenges in large-scale distributed training through two key modules: error diagnosis and performance degradation diagnosis. The design of the diagnostic engine is built around two core objectives:

诊断引擎也是 XPUTimer 的核心组件, 负责分析追踪守护进程实时收集的数据, 快速定位训练异常的根因. 它通过两个关键模块处理大规模分布式训练中的归因难题: 错误诊断和性能退化诊断. 诊断引擎围绕两个核心目标设计:

• **Fast attribution.** Through the implementation of a multi-layered diagnostic approach that integrates call stack analysis with in-kernel tracing, the process of error localization is significantly optimized, reducing the time complexity from the conventional $\dot { O } ( l o g N )$ to O(1).

• **快速归因.** 通过把调用栈分析与内核内追踪结合起来的多层诊断方法, 错误定位过程大幅优化, 时间复杂度从常规的 O(log N) 降到 O(1).

• **Fine-grained diagnostics.** By combining macro-level metrics $( \mathbf { e . g . }$ , throughput) with micro-level metrics $( \mathbf { e . g . }$ kernel launch latency distribution), it enables anomaly detection across computation, communication, and non-critical operations such as data loading.

• **细粒度诊断.** 把宏观指标 (例如吞吐) 和微观指标 (例如内核启动延迟的分布) 结合起来, 能在计算, 通信以及数据加载这类非关键操作上检测异常.

<!-- page 7 of 34 -->

![Image block](images/p07-figure-6-the-schematic-illustration-of-the-edit-method.png)

Figure 6: The schematic illustration of the EDiT method with 4 workers as an example.

图 6: 以 4 个 worker 为例的 EDiT 方法示意图.

![Image block](images/p07-figure-7-the-illustration-of-pseudo-gradient-penalty.png)

Figure 7: The illustration of pseudo gradient penalty strategy in EDiT method.

图 7: EDiT 方法中伪梯度惩罚策略的示意图.

## 2.2 High-Performance Training Strategy (高性能训练策略)

With the explosive growth of model size and training data volume, distributed training methods have become critical for efficient training. However, traditional synchronous distributed training methods (e.g., All-Reduce) face the following challenges: (1) high communication overhead, (2) straggler problem, (3) difficulty in elastic training, and (4) sensitivity to data noise. To address these problems, we adopted EDiT method Cheng et al. [2025], which combines a tailored Local SGD (Stochastic Gradient Descent) approach with model sharding techniques to enhance large-scale training efficiency. The comparisons of EDiT and traditional distributed method are illustrated in Figure 5, and the pipeline of EDiT is illustrated in Figure 6. The characteristics of EDiT can be summarized as follows:

随着模型规模和训练数据量爆炸式增长, 分布式训练方法对高效训练至关重要. 但传统的同步分布式训练方法 (例如 All-Reduce) 面临这些挑战: (1) 通信开销大, (2) 掉队者 (straggler) 问题, (3) 难以弹性训练, (4) 对数据噪声敏感. 为解决这些问题, 我们采用了 EDiT 方法 (Cheng et al. [2025]), 它把定制的 Local SGD (随机梯度下降) 方法与模型分片技术结合起来, 提高大规模训练效率. EDiT 与传统分布式方法的对比见 Figure 5, EDiT 的流程见 Figure 6. EDiT 的特点概括如下:

• **Layer-wise synchronization.** Different from other Local SGD-based methods, EDiT synchronizes parameters layer by layer during forward propagation, significantly reducing the volume of data communicated in a single operation. With the prefetch method, the communication and computation are further overlapped, minimizing idle time and improving overall efficiency.

• **逐层同步.** 与其他基于 Local SGD 的方法不同, EDiT 在前向传播中逐层同步参数, 大幅减少单次通信的数据量. 配合预取, 通信与计算进一步重叠, 空闲时间更少, 整体效率更高.

• **Pseudo gradient penalty.** EDiT employs a pseudo gradient penalty strategy to suppress the loss spikes caused by diverse large-scale corpus and leverages the differences among workers to improve model performance, which is illustrated in Figure 7. This strategy consists of anomaly elimination, weighted averaging, and gradient clipping.

• **伪梯度惩罚.** EDiT 采用伪梯度惩罚策略, 抑制多样的大规模语料引起的 loss 尖峰, 并利用 worker 之间的差异提升模型表现, 见 Figure 7. 这一策略包括异常剔除, 加权平均和梯度裁剪三部分.

(1) Anomaly elimination. The pseudo gradients of each worker are tracked using exponential moving average to detect anomalous workers, which are subsequently excluded from the synchronization process.

(1) 异常剔除. 用指数移动平均跟踪每个 worker 的伪梯度, 检测出异常 worker, 并把它们排除在同步之外.

(2) Weighted averaging. Contributions from workers are weighted based on their pseudo gradient norms, effectively reducing the influence of noisy or outlier gradients on overall model updates.

(2) 加权平均. 按各 worker 伪梯度的范数给它们的贡献加权, 减小噪声梯度或离群梯度对整体更新的影响.

(3) Gradient clipping. A predefined threshold is applied to clip overly large pseudo gradients, ensuring gradient steps remain within a stable range and preventing training instability or divergence.

(3) 梯度裁剪. 用预设阈值裁剪过大的伪梯度, 让梯度步长保持在稳定范围内, 防止训练不稳定或发散.

<!-- page 8 of 34 -->

![Chart block](images/p08-figure-8-the-speed-comparisons-of-traditional.png)

Figure 8: The speed comparisons of traditional distributed method and EDiT.

图 8: 传统分布式方法与 EDiT 的速度对比.

• **Time-based synchronization.** Instead of synchronizing after a fixed number of iterations (as in conventional Local SGD-based methods), synchronization can also be triggered based on a time threshold in the EDiT method, enabling faster nodes to perform more local updates before syncing. By decoupling synchronization frequency from iteration counts, EDiT solves the problem of fixed stragglers. Furthermore, this adaptive synchronization mechanism enhances scalability and resilience by dynamically balancing workloads, particularly in heterogeneous environments with diverse hardware capabilities.

• **基于时间的同步.** 传统 Local SGD 方法在固定迭代次数后同步, EDiT 还可以按时间阈值触发同步, 让快节点在同步前多做几次本地更新. 把同步频率和迭代次数解耦后, EDiT 解决了固定掉队者的问题. 这种自适应同步机制还能动态平衡负载, 增强可扩展性和容错能力, 在硬件能力参差的异构环境中尤其有用.

As shown in Figure 8, in an ideal environment, as the number of accelerators increases, the minimum speed of the baseline approaches $5 . \dot { 4 } 9 e ^ { - 2 }$ step/s, at which point the speed-up ratio of EDiT would reach 66.1%. In practice, however, the average step time of slow steps tends to grow longer as the number of accelerators increases or the model size increases, making the actual acceleration effect of EDiT even more pronounced.

如 Figure 8 所示, 在理想环境下, 随着加速器数量增加, 基线的最低速度趋近 5.49e-2 step/s, 此时 EDiT 的加速比可达 66.1%. 但实际中, 随着加速器数量或模型规模增加, 慢 step 的平均耗时往往越来越长, EDiT 的实际加速效果会更明显.

> **拆开:** 第 1.3 节说 EDiT 让 「the training time can be reduced by up to 66.1%」, 第 2.2 节又说 「the speed-up ratio of EDiT would reach 66.1%」. 这两句说的是同一个量吗?
> 不是同一个量, 论文却用了同一个数. 按第 2.2 节 Figure 8 的上下文, 66.1% 是速度 (step/s) 的提升比例, 在基线最低速度趋近 5.49e-2 step/s 时取到. 速度提升 66.1%, 单步耗时变为原来的 1/1.661, 约 60.2%, 相当于时间减少约 39.8%; 反过来, 时间真要减少 66.1%, 速度得提升到约 2.95 倍. 两种读法只能有一种字面成立. 本文没有给出绝对耗时, 按 Figure 8 这个出处, 把 66.1% 当作加速比更贴近原始实验.

## 2.3 Efficient and Highly-Reliable Cross-Cluster Data Synchronization (高效, 高可靠的跨集群数据同步)

The training of modern MoE models requires processing massive datasets, often involving concurrent training and data processing tasks across distributed clusters. This necessitates efficient and reliable access to diverse datasets across clusters, which becomes challenging in cross-cluster environments. To address this problem, we will introduce (1) a robust distributed storage system and (2) an optimized cross-cluster synchronization mechanism respectively to support the needs of distributed training in the following section.

现代 MoE 模型的训练要处理海量数据集, 经常需要在分布式集群间同时运行训练任务和数据处理任务. 这要求跨集群高效, 可靠地访问多样的数据集, 在跨集群环境中并不容易. 为此, 下文分别介绍 (1) 一个稳健的分布式存储系统和 (2) 一套优化的跨集群同步机制, 用来支撑分布式训练的需求.

## 2.3.1 Distributed Storage System (分布式存储系统)

The exponential growth of data and increasing demands for high-performance input/output (I/O) in MoE models have set higher standards for storage system performance. We propose an in-house solution, PCache, has been developed as an all-flash distributed file caching system. PCache is specifically designed to support large-scale internal model training, addressing the performance and scalability requirements of modern distributed training environments.

数据的指数级增长以及 MoE 模型对高性能输入/输出 (I/O) 的需求, 对存储系统的性能提出了更高要求. 我们自研了全闪存分布式文件缓存系统 PCache. PCache 专为支撑内部大规模模型训练而设计, 满足现代分布式训练环境对性能和可扩展性的要求.

In contemporary storage architectures, most storage services are deployed as independent clusters. However, in multi-cluster environments, device multi-tenancy has become a crucial requirement. This shift introduces two significant challenges:

在当前的存储架构中, 多数存储服务以独立集群的形式部署. 但在多集群环境下, 设备多租户已成为关键需求. 这一转变带来两个明显的挑战:

• **Dependence on cluster provider storage services.** Each cluster provider offers varied storage capabilities, leading to potential inconsistencies in training performance across heterogeneous cluster environments.

• **依赖集群提供方的存储服务.** 各集群提供方的存储能力不一, 可能导致在异构集群环境中训练性能不一致.

• **Challenges in building custom storage services.** Independently deployed storage systems face challenges related to hardware compatibility across multiple sites, further compounded by the associated operational and maintenance costs. Networking constraints exacerbate these difficulties. Some cluster providers offer high-performance networks for data transfer, while others do not.

• **自建存储服务的困难.** 独立部署的存储系统要面对多站点之间的硬件兼容问题, 还有随之而来的运维成本. 网络条件让这些困难更严重: 有的集群提供方提供高性能网络传输数据, 有的则没有.

To address these challenges, we have designed a storage service specifically optimized for large-scale model training (see Figure 9), incorporating the following core features:

为应对这些挑战, 我们设计了一个专门为大模型训练优化的存储服务 (见 Figure 9), 核心特性如下:

<!-- page 9 of 34 -->

![Image block](images/p09-figure-9-the-general-structure-of-acclerator-multi.png)

Figure 9: The general structure of acclerator multi-tenancy.

图 9: 加速器多租户的总体结构 (原图题把 accelerator 拼成了 acclerator).

• **Broad hardware compatibility and scalability.** The system ensures seamless integration across multi-cluster environments.

• **广泛的硬件兼容性和可扩展性.** 系统能在多集群环境中无缝集成.

• **Cost-performance balance.** It achieves a competitive trade-off between operational costs and performance optimization, ensuring that scalability does not compromise efficiency.

• **成本与性能平衡.** 在运维成本和性能优化之间取得有竞争力的平衡, 保证扩展时不牺牲效率.

Currently, most accelerators are equipped with four or more NVMe SSDs, a configuration that serves as the foundation for PCache’s design. To optimize performance and resource utilization, PCache employs a mixed deployment model, integrating the storage service directly onto computing nodes. This integrated approach minimizes the costs associated with standalone deployments while significantly reducing network latency through localized data processing. This ensures that storage throughput grows proportionally with the expansion of computing cluster computational capabilities, providing a scalable and efficient solution for large-scale distributed training systems.

目前多数加速器机器都配有四块或更多 NVMe SSD, 这是 PCache 设计的基础. 为优化性能和资源利用率, PCache 采用混合部署模式, 把存储服务直接部署在计算节点上. 这种一体化做法省去了独立部署的成本, 并通过本地化的数据处理明显降低网络延迟. 这样存储吞吐会随计算集群算力的扩张成比例增长, 为大规模分布式训练系统提供可扩展且高效的方案.

**I/O Performance Optimization.** During the distributed training of MoE models, it is essential to optimize I/O performance to prevent excessive time consumption caused by reading data, checkpoints, and other resources, which can negatively impact training efficiency. The optimization strategies adopted by the PCache system are as follows:

**I/O 性能优化.** 在 MoE 模型的分布式训练中, 必须优化 I/O 性能, 避免读取数据, 检查点等资源耗时过长, 拖累训练效率. PCache 系统采用的优化策略如下:

• **File system in user space (FUSE).** In checkpoint read/write scenarios, PCache employs an interception mechanism to eliminate the overhead of multiple switches or data copies between user space and kernel space. By leveraging shared memory (shm), the system accelerates access efficiency for medium to large files.

• **用户态文件系统 (FUSE).** 在检查点读写场景中, PCache 用拦截机制消除用户态与内核态之间多次切换或数据拷贝的开销. 借助共享内存 (shm), 系统加快了对中大型文件的访问.

• **Metadata cache.** A metadata caching strategy combining file-level and data block-level caching significantly enhances client-side read performance, particularly in scenarios involving high volumes of random reads.

• **元数据缓存.** 文件级缓存与数据块级缓存相结合的元数据缓存策略, 大幅提升了客户端的读性能, 在大量随机读的场景中尤其明显.

• **Worker selection strategy.** This strategy prevents performance degradation caused by cluster bottlenecks or hotspots on overloaded machines.

• **Worker 选择策略.** 这一策略避免集群瓶颈或过载机器上的热点导致性能下降.

Based on these four optimization strategies, the PCache system achieves the following performance outcomes:

基于这四项优化策略, PCache 系统取得了以下性能结果:

• **Single client performance.** For scenarios involving single-threaded large file writes, PCache achieves throughput rates of 3–4 GB/s. In multi-threaded scenarios, throughput increases to 20–30 GB/s.

• **单客户端性能.** 单线程写大文件时, PCache 吞吐达到 3 到 4 GB/s; 多线程场景下, 吞吐提高到 20 到 30 GB/s.

• **Cluster-wide throughput.** Across a 1,000-accelerator cluster, PCache delivers aggregate throughput of 1 TB/s. For clusters with 10,000 accelerators, throughput scales linearly to 8 TB/s.

• **集群整体吞吐.** 在 1,000 卡集群上, PCache 的聚合吞吐达到 1 TB/s; 在 10,000 卡集群上, 吞吐线性扩展到 8 TB/s.

> **再看:** 上一段说 「Based on these four optimization strategies」, 前面实际列了几条? 「scales linearly to 8 TB/s」 算线性吗?
> I/O 优化下面只有三条带圆点的策略: FUSE, 元数据缓存, worker 选择. 把再前一段的 「存储服务与计算节点混合部署」 算进去才凑成四条, 论文没有明说第四条是哪一项. 吞吐方面, 1,000 卡时 1 TB/s, 卡数乘 10 到 10,000 卡, 严格线性应到 10 TB/s, 实际 8 TB/s 约为线性值的 80%, 属于近线性. 原文的 「scales linearly」 是宽松说法.

**AI Co-Design.** Megatron, a commonly used framework for training tasks in MoE scenarios, operates with a specific design for checkpoint writing. During the checkpoint writing phase, model and optimizer data are written based on Data Parallel (DP) groups, with the default behavior assigning the responsibility for data aggregation and storage to the rank\_0 device of each DP group. However, this approach can lead to resource contention, as the rank\_0 devices from all DP groups are often concentrated on specific physical nodes. This concentration results in competition for CPU computational resources and network bandwidth, ultimately reducing the overall efficiency of the checkpointing process. To address this issue, PCache implements a strategy to distribute DP group checkpoint writing across different physical nodes, rather than concentrating them on a subset of nodes. By dispersing the write nodes for each DP group, this approach mitigates competition for computational resources and network bandwidth. In real-world experiments

**AI 协同设计.** Megatron 是 MoE 场景下训练任务常用的框架, 它写检查点有一套特定的设计. 在写检查点阶段, 模型和优化器数据按数据并行 (DP) 组写出, 默认由每个 DP 组的 rank_0 设备负责汇总和存储. 但这种做法会引起资源争抢, 因为所有 DP 组的 rank_0 设备往往集中在某几台物理节点上. 这种集中导致 CPU 计算资源和网络带宽的竞争, 最终降低检查点写入的整体效率. 为解决这个问题, PCache 把各 DP 组的检查点写入分散到不同的物理节点上, 而不是集中在少数节点. 分散各 DP 组的写入节点后, 计算资源和网络带宽的竞争得到缓解. 在实际实验中, (句子接下页)

<!-- page 10 of 34 -->

with a 5,000-accelerator MoE training task, this optimization reduced checkpoint writing latency by 50%, while also lowering peak memory consumption on training nodes by 60%, as is shown in Table 2.

以一个 5,000 卡的 MoE 训练任务为例, 这项优化把检查点写入延迟降低了 50%, 训练节点的峰值内存占用降低了 60%, 见 Table 2.

Table 2: Comparison of checkpoint save time costs (seconds).

表 2: 检查点保存耗时对比 (单位: 秒).

| Test Case | PCache(cost time) | GPFS(cost time) |
| --- | --- | --- |
| Megatron(tp=1 ep=8 pp=1, 128 accelerators) | 70s | 160s |
| Megatron(tp=2 ep=8 pp=8, 512 accelerators) | 90s | 240s |

> **核对:** 正文说 5,000 卡任务上检查点写入延迟降 50%, 峰值内存降 60%, 「as is shown in Table 2」. Table 2 能对上吗?
> 对不上. Table 2 只有两行: 128 卡 (tp=1 ep=8 pp=1) 上 PCache 70s 对 GPFS 160s, 512 卡 (tp=2 ep=8 pp=8) 上 90s 对 240s, 分别省约 56% 和 62.5%. 表里比的是 PCache 与 GPFS 两套存储, 不是 「分散 DP 组写入」 的前后; 规模是 128 卡和 512 卡, 不是 5,000 卡; 也没有内存这一列. 50% 和 60% 这两个数在本文里只有文字, 没有表格支撑.

## 2.3.2 Cross-Cluster Synchronization Mechanism. (跨集群同步机制)

In distributed AI training scenarios, achieving efficient and reliable data synchronization across cluster environments presents unique challenges. To address this, we developed Babel, a data synchronization middleware specifically designed for large-scale model training. Babel is tailored to solve the complex problem of efficiently transmitting massive unstructured datasets and high-frequency checkpoint (ckpt) files in cross-cluster and cross-region environments.

在分布式 AI 训练场景中, 跨集群环境下高效可靠的数据同步有独特的难度. 为此我们开发了 Babel, 一个专为大模型训练设计的数据同步中间件. Babel 专门解决在跨集群, 跨地域环境中高效传输海量非结构化数据集和高频检查点 (ckpt) 文件这一复杂问题.

Whether it involves petabyte-scale datasets, billions of files, or frequently updated training state files, Babel provides a stable, high-speed, and accurate data synchronization service. Leveraging innovative features such as an adaptive data sharding strategy, efficient metadata prefetching mechanisms, and multi-dimensional data verification techniques, Babel significantly improves the transmission efficiency of large files while ensuring end-to-end data consistency. These capabilities provide robust technical support for distributed training environments. The main capabilities of Babel are summarized as follows.

无论是 PB 级数据集, 数十亿个文件, 还是频繁更新的训练状态文件, Babel 都能提供稳定, 高速, 准确的数据同步服务. 借助自适应数据分片策略, 高效的元数据预取机制和多维度数据校验技术, Babel 在保证端到端数据一致性的同时, 显著提升了大文件的传输效率. 这些能力为分布式训练环境提供了有力的技术支撑. Babel 的主要能力概括如下.

![Image block](images/p10-figure-10-the-parallel-metadata-prefetching-mechanism.png)

Figure 10: The parallel metadata prefetching mechanism.

图 10: 并行元数据预取机制.

**Metadata Prefetching Mechanism.** In distributed training workflows, metadata management plays a pivotal role in determining task startup time. Synchronizing millions or even billions of file entries using traditional serial loading methods often leads to prolonged startup times, thereby significantly reducing overall efficiency. To address this challenge, we propose a parallel metadata prefetching mechanism (see Figure 10), which leverages concurrent Object Storage Service (OSS) List operations in conjunction with intelligent scheduling algorithms.

**元数据预取机制.** 在分布式训练流程中, 元数据管理对任务启动时间有关键影响. 用传统的串行加载方式同步数百万乃至数十亿个文件条目, 往往让启动时间拖得很长, 显著降低整体效率. 为此我们提出并行元数据预取机制 (见 Figure 10), 把对象存储服务 (OSS) 的并发 List 操作与智能调度算法结合起来.

To evaluate the effectiveness of this method, we conducted a performance test using OSS data comprising 190 million files. The results demonstrate a substantial improvement, with approximately a 36-fold increase in performance. Specifically, serial file listing required over six hours, whereas the parallel metadata prefetching mechanism reduced the processing time to approximately ten minutes. These findings highlight the significant efficiency gains achieved through the adoption of concurrent operations in large-scale distributed training environments.

为评估这一方法的效果, 我们用包含 1.9 亿个文件的 OSS 数据做了性能测试. 结果显示性能提升约 36 倍: 串行列举文件需要六个多小时, 并行元数据预取机制把处理时间缩短到约十分钟. 这说明在大规模分布式训练环境中采用并发操作能带来可观的效率提升.

**Data Verification Technology.** Babel implements a highly efficient and robust data verification framework that encompasses both metadata validation and content-based sampling cyclic redundancy check (CRC) verification. The

**数据校验技术.** Babel 实现了一套高效而稳健的数据校验框架, 同时包括元数据校验和基于内容采样的循环冗余校验 (CRC). 该 (句子接下页)

<!-- page 11 of 34 -->

system offers two distinct verification modes: real-time (runtime) verification and post-transfer verification. Traditional methods, such as MD5 hashing, often require extensive computational resources and significant time to verify large files (e.g., 100GB files), taking tens to hundreds of seconds to complete. To address these inefficiencies, Babel leverages a content-sampling-based CRC verification approach specifically designed for large files. This method significantly accelerates the verification process while reducing CPU consumption, all without compromising transmission accuracy. By adopting this optimization strategy, Babel reduces the verification time for a 100GB file to approximately three seconds, achieving an effective balance between verification speed and reliability.

系统提供两种校验模式: 实时 (运行时) 校验和传输后校验. MD5 哈希等传统方法校验大文件 (例如 100GB 的文件) 往往要消耗大量计算资源和时间, 需要几十到几百秒. 为解决这种低效, Babel 针对大文件采用基于内容采样的 CRC 校验. 这种方法在不牺牲传输准确性的前提下, 大幅加快校验并降低 CPU 占用. 采用这一优化后, Babel 把一个 100GB 文件的校验时间缩短到约三秒, 在校验速度和可靠性之间取得了平衡.

## 2.4 High-Efficiency Offline Inference Framework (高效离线推理框架)

The current mainstream inference frameworks are primarily designed for online inference, emphasizing increased throughput under specific latency constraints. Consequently, parallelization strategies predominantly include inter-node tensor parallelism (TP) and intra-node pipeline parallelism (PP) across multiple computational nodes. However, TP often incurs substantial communication overhead, particularly in computing systems that lack high-speed interconnects such as NVLINK. In such cases, communication overhead can account for more than half of the total execution time. To address these limitations and enhance throughput by reducing communication overhead, we propose an efficient offline inference framework named Flood Flood [2025], which adopts a fully pipeline-parallel (PP) architecture.

目前主流的推理框架主要为在线推理设计, 强调在特定延迟约束下提高吞吐. 因此并行策略主要是跨多个计算节点的节点间张量并行 (TP) 和节点内流水线并行 (PP). 但 TP 往往带来大量通信开销, 在缺少 NVLINK 这类高速互连的计算系统中尤其如此, 这时通信开销可能占总执行时间的一半以上. 为克服这些局限, 通过减少通信开销提高吞吐, 我们提出了高效离线推理框架 Flood (Flood [2025]), 它采用全流水线并行 (PP) 架构.

Under high-concurrency scenarios, PP demonstrates superior throughput compared to TP and simplifies model adap tation by eliminating the need for tensor splitting. Instead of the conventional one-to-one mapping of processes to accelerators, our framework employs a many-to-one mapping strategy. This approach reduces inter-process communication overhead while offering greater flexibility in system design. To further isolate the performance impact of multiple processes on a single accelerator, a multi-stream strategy is implemented, where each process running on an accelerator is associated with a distinct stream. For multi-node inference, we initialize a number of processes on each node equal to the total number of pipeline stages. Leveraging the PP strategy enables the achievement of zero CPU overhead. For instance, in a single-node configuration with 8 accelerators, we deploy 9 processes such that there is always one process waiting for the accelerator assigned to the first pipeline stage to become available. This ensures that accelerator resources are utilized continuously, thereby minimizing idle time.

在高并发场景下, PP 的吞吐优于 TP, 而且不需要切分张量, 模型适配更简单. 我们的框架不采用进程与加速器一一对应的传统映射, 而是多对一映射. 这种做法降低了进程间通信开销, 系统设计也更灵活. 为进一步隔离单个加速器上多个进程之间的性能影响, 我们采用多 stream 策略, 让加速器上运行的每个进程绑定一个独立的 stream. 多节点推理时, 每个节点上初始化的进程数等于流水线的总 stage 数. 借助 PP 策略可以做到零 CPU 开销. 例如, 在 8 个加速器的单节点配置中, 我们部署 9 个进程, 这样始终有一个进程在等待分配给第一个流水线 stage 的加速器空出来. 这保证加速器资源被持续使用, 空闲时间最少.

In parallel, popular frameworks such as vLLM Kwon et al. [2023] commonly utilize block tables for managing the key-value cache (kvcache). However, small block sizes can result in inefficient utilization of computational resources. To address this issue and maximize accelerator resource usage, we propose a novel segment cache mechanism that allocates the kvcache in a contiguous memory space to enable the use of larger block sizes. Specifically, we allocate a kvcache tensor with the shape [max\_token\_num, num\_head, head\_dim]. During inference, a pre-allocated contiguous memory space is dedicated to each request to accommodate both the prompt and the output. This design, illustrated in Figure 11, facilitates efficient memory management and enhances computational performance.

另一方面, vLLM (Kwon et al. [2023]) 等流行框架通常用 block table 管理 key-value cache (kvcache). 但 block 太小会导致计算资源利用低效. 为解决这个问题, 充分利用加速器资源, 我们提出一种新的 segment cache 机制, 把 kvcache 分配在连续的内存空间里, 从而可以使用更大的 block. 具体做法是分配一个形状为 [max_token_num, num_head, head_dim] 的 kvcache 张量. 推理时, 为每个请求预留一段连续内存, 同时容纳 prompt 和输出. 这一设计见 Figure 11, 它让内存管理更高效, 也提升了计算性能.

![Image block](images/p11-figure-11-segment-kvcache.png)

Figure 11: Segment kvcache.

图 11: Segment kvcache (分段 kvcache).

In typical scenarios where the user-defined maximum output length is relatively small, the cache can be allocated based on this predefined maximum length. However, in cases where the specified maximum output length is exceptionally large (e.g., 32,768 tokens) and significantly surpasses the actual generated output length, this can result in the allocation of overly large segment caches, thereby reducing request concurrency. To address this inefficiency, a segment with a conservative size will be used during the initial allocation phase. If the actual generated tokens exceeds the allocated segment size, the following strategies can be employed:

在典型场景中, 用户设定的最大输出长度较小, 可以按这个预设的最大长度分配 cache. 但如果设定的最大输出长度特别大 (例如 32,768 个 token), 远超实际生成的长度, 就会分配过大的 segment cache, 降低请求并发. 为解决这种低效, 初始分配时使用一个保守大小的 segment. 如果实际生成的 token 超出了已分配的 segment, 可采用以下策略:

<!-- page 12 of 34 -->

Table 3: Inference performance comparison (the device details are listed in Table 1).

表 3: 推理性能对比 (设备细节见 Table 1).

| Model | Device | vLLM (token/s) | Flood (token/s) | Speedup |
| --- | --- | --- | --- | --- |
| Ling-Lite | 1 * Device E | 4355 | 5869 | 1.35 |
| Ling-Lite | 1 * Device C | 3576 | 5451 | 1.52 |
| Ling-Plus | 16 * Device B | 2331 | 4857 | 2.08 |
| Ling-Plus(FP8) | 8 * Device E | 2742 | 6569 | 2.40 |

• **Extend the current segment.** If the next segment in the kvcache memory space is free, the current segment can be extended into the adjacent space.

• **扩展当前 segment.** 如果 kvcache 内存空间中紧邻的下一个 segment 空闲, 当前 segment 可以扩展到相邻空间.

• **Append an additional segment.** If the next segment is occupied and an other segment is available, it can be appended to the request’s segment list to accommodate the overflow.

• **追加一个 segment.** 如果下一个 segment 已被占用, 但还有其他可用 segment, 就把它追加到该请求的 segment 列表中, 容纳溢出部分.

• **Wait.** If neither extension nor appending is possible, the request is placed in a wait-list until a segment becomes available.

• **等待.** 如果既不能扩展也不能追加, 请求进入等待列表, 直到有 segment 可用.

The segment cache not only resolves the challenges associated with excessively long maximum output lengths but also inherently supports prefix caching. For batch requests sharing a common prefix, the prefix can be stored using a single segment or a combination of multiple segments.

segment cache 不仅解决了最大输出长度过长带来的问题, 还天然支持前缀缓存. 对共享同一前缀的批量请求, 前缀可以用单个 segment 或多个 segment 的组合来存储.

Finally, we compare our Flood with vLLM (the version is ‘0.6.6.post2’) on a benchmark dataset, i.e., shareGPT AI [2023], and the detailed performance comparison is listed in Table 3. The performance is measured by generated tokens per second.

最后, 我们在基准数据集 shareGPT (AI [2023]) 上比较了 Flood 和 vLLM (版本为 '0.6.6.post2'), 详细结果见 Table 3. 性能以每秒生成的 token 数衡量.

> **停一下:** 第 2.4 节写主流框架用 「inter-node tensor parallelism (TP) and intra-node pipeline parallelism (PP)」, 节点内外的搭配是不是写反了? Table 3 的加速比算得对吗?
> 常见部署是节点内做 TP (依赖 NVLink 这类高速互连), 节点间做 PP, 原句的 inter/intra 与常见做法相反, 更像笔误. 紧接着的论点不受影响: TP 通信重, 缺少 NVLINK 时通信可能占一半以上的时间, 所以 Flood 改走全 PP. Table 3 的加速比逐行可复算: 5869/4355 ≈ 1.35, 5451/3576 ≈ 1.52, 4857/2331 ≈ 2.08, 6569/2742 ≈ 2.40, 与表中一致. Ling-Lite 两行都是单卡 (Device E 和 Device C), 加速比 1.35 到 1.52; Ling-Plus 用 8 卡或 16 卡时加速比超过 2 倍, 与 「省掉 TP 通信后卡越多收益越大」 的说法相符.

## 3 Pre-Training (预训练)

## 3.1 Pre-Training Data (预训练数据)

The Ling models demonstrate their competitive performance through rigorous methodologies designed to enhance the quality of large-scale pre-training datasets. The corpus utilized in the model development is a diverse collection of textual and non-textual data, encompassing sources such as web content, books, academic papers, social media, encyclopedias, mathematics, and programming code. To date, we have constructed a high-quality corpus consisting of approximately 9 trillion tokens, distributed across 1 trillion tokens in Chinese, 5.5 trillion in English, and 2.5 trillion in code. The development of such a large-scale, high-quality dataset is the result of systematic improvements in several key areas:

Ling 模型的竞争力来自一系列严格的方法, 这些方法用来提高大规模预训练数据集的质量. 模型开发所用的语料是文本与非文本数据的多样集合, 来源包括网页内容, 书籍, 学术论文, 社交媒体, 百科, 数学和编程代码. 迄今我们已构建约 9 万亿 token 的高质量语料, 其中中文 1 万亿, 英文 5.5 万亿, 代码 2.5 万亿. 这样大规模的高质量数据集, 来自以下几个关键方面的系统性改进:

**Data curation.** The majority of raw data used in this study were obtained from publicly available sources, including Common Crawl (CC), coding platforms, and encyclopedias. However, these sources often exhibit a range of quality issues. To address this, we developed specialized data cleaning pipelines tailored to the characteristics of different data types (e.g., web pages, academic papers, books, and code). The cleaning process included tasks such as text extraction and parsing from raw HTML/PDF files, deduplication, rulebased filtering, and the removal of toxic or undesirable content. Furthermore, we established a robust quality assessment framework comprising 10 categories and over 300 quality evaluation metrics. This framework enables us to systematically categorize datasets into quality tiers, which serve as a foundation for further refinement and the informed selection of training data.

**数据整理.** 本研究使用的原始数据大多来自公开来源, 包括 Common Crawl (CC), 编程平台和百科. 但这些来源常有各种质量问题. 为此我们针对不同数据类型 (例如网页, 学术论文, 书籍和代码) 的特点, 开发了专门的数据清洗流水线. 清洗包括从原始 HTML/PDF 文件中抽取和解析文本, 去重, 基于规则的过滤, 以及去除有害或不良内容. 此外, 我们建立了一套稳健的质量评估框架, 包含 10 个类别和 300 多项质量评估指标. 借助这套框架, 我们能系统地把数据集划分为不同质量等级, 作为进一步精炼和挑选训练数据的依据.

**High-quality data selection.** To identify high-quality data, we fine-tuned models such as fastText Bojanowski et al. [2017] and BERT Devlin et al. [2019], applying fine-grained labels and attributes to the cleaned data. These attributes include metrics such as text coherence, knowledge density, educational level, and complexity. Using this approach, we were able to extract high-quality data samples from the broader dataset. Additionally, sampling experiments were conducted across various features to identify optimal strategies for data selection. This process ensured that the selected data were well-suited for enhancing downstream model performance.

**高质量数据筛选.** 为识别高质量数据, 我们微调了 fastText (Bojanowski et al. [2017]) 和 BERT (Devlin et al. [2019]) 等模型, 给清洗后的数据打上细粒度的标签和属性. 这些属性包括文本连贯性, 知识密度, 教育程度和复杂度等指标. 用这种方法, 我们从更大的数据集中抽取出高质量样本. 此外, 我们针对不同特征做了采样实验, 找出最优的数据筛选策略. 这一过程保证选出的数据适合提升下游模型表现.

• **Mathematics and code data.** Informed by prior research Shao et al. [2024], we curated a large-scale dataset focused on programming and mathematical reasoning. The data collection process leveraged publicly available repositories such as Common Crawl and GitHub. To ensure the quality and relevance of the mathematics and code data, we developed advanced filtering models based on fastText and BERT. These models were employed to identify and retrieve content containing high-quality programming and mathematical reasoning, enabling the incorporation of specialized knowledge into the corpus.

• **数学与代码数据.** 参照已有研究 (Shao et al. [2024]), 我们整理了一个聚焦编程和数学推理的大规模数据集. 数据收集利用了 Common Crawl 和 GitHub 等公开仓库. 为保证数学和代码数据的质量与相关性, 我们基于 fastText 和 BERT 开发了进阶过滤模型, 用来识别和召回包含高质量编程与数学推理的内容, 把专门知识纳入语料.

<!-- page 13 of 34 -->

• **Data ablation and mixture.** Building on insights from earlier studies DeepSeek-AI et al. [2024], we employed a continued-training strategy to assess the contribution of newly integrated datasets to the overall model performance. This process was conducted on smaller models to validate the utility of the new data prior to full-scale implementation. Additionally, our data mixing strategy prioritized diversity and ensured balanced distributions across different data attributes. Particular attention was given to optimizing sampling strategies for critical data types, such as reasoning-related content. The effectiveness of these strategies was further validated on larger models, demonstrating their impact on enhancing training outcomes.

• **数据消融与配比.** 借鉴早期研究 (DeepSeek-AI et al. [2024]), 我们采用继续训练的策略, 评估新加入的数据集对整体模型表现的贡献. 这一过程先在较小的模型上进行, 在全面采用之前验证新数据的效用. 此外, 我们的数据配比策略优先保证多样性, 并让不同数据属性之间分布均衡. 我们特别注意优化推理相关内容等关键数据类型的采样策略. 这些策略的效果又在更大的模型上做了验证, 证明它们确实改善了训练结果.

## 3.2 Model Architecture (模型架构)

In contrast to conventional dense architectures, the MoE paradigm replaces standard FeedForward Networks (FFNs) with a collection of N experts Fedus et al. [2022], Lepikhin et al. [2020], Jiang et al. [2024], which are compact and modular FFN units. This design enables greater efficiency (shown in the following subsection 3.3) and specialization within LLMs. The core mechanism of MoE is the dynamic routing of tokens to specific experts through an individual router, R, for each token. This routing facilitates highly optimized and selective computation, as defined by the following equations:

与传统 dense 架构不同, MoE 范式把标准的前馈网络 (FFN) 换成 N 个专家的集合 (Fedus et al. [2022], Lepikhin et al. [2020], Jiang et al. [2024]), 每个专家是一个紧凑的模块化 FFN 单元. 这种设计让 LLM 更高效 (见下文 3.3 小节), 专家也更专精. MoE 的核心机制是通过路由器 R 为每个 token 动态地把它分配给特定专家. 这种路由让计算高度优化且有选择性, 由下式定义:

$$
\left| \begin{array}{l} \mathbf {p} _ {t} = \operatorname{Softmax} (\mathrm{R} (\mathbf {h} _ {t})), \\ \mathbf {o} _ {t} = \sum_ {i} \mathbf {p} _ {t, i} \mathrm{E} _ {i} (\mathbf {h} _ {t}) \quad \text {s.t.} \quad \mathbf {p} _ {t, i} \in \operatorname{Topk} (\mathbf {p} _ {t}). \end{array} \right|\tag{1}
$$

where $\mathbf { h } _ { t } \in \mathbb { R } ^ { d }$ is the d-dimensional FFNs input of the t-th token, $\mathrm { E } _ { i }$ is the i-th expert in total N experts, $\mathbf { p } \in \mathbb { R } ^ { N }$ denote the gates for expert selection, and $\mathbf { o } _ { t } \in \bar { \mathbb { R } ^ { d } }$ denotes the output of the t-th token after being processed by routing experts. Next, we will elaborate Ling’s architectural innovations on the above MoE framework.

其中 h_t ∈ R^d 是第 t 个 token 在 FFN 的 d 维输入, E_i 是全部 N 个专家中的第 i 个, p ∈ R^N 是用于选择专家的门控值, o_t ∈ R^d 是第 t 个 token 经路由专家处理后的输出. 接下来介绍 Ling 在上述 MoE 框架上做的架构创新.

## 3.2.1 Fine-Grained Experts (细粒度专家)

To enhance the advantages of the MoE architecture over traditional dense models, while simultaneously improving training efficiency and scalability, the Ling models adopt a fine-grained expert strategy Dai et al. [2024], DeepSeek-AI [2024b]. Specifically, compared to the original expert design, our approach scales the number of experts while proportionally reducing the intermediate size of each expert, thus maintaining the equivalent total capacity. This design promotes a higher degree of specialization among experts, allowing the model to encapsulate a wider and more diverse range of knowledge.

为增强 MoE 架构相对传统 dense 模型的优势, 同时提升训练效率和可扩展性, Ling 模型采用细粒度专家策略 (Dai et al. [2024], DeepSeek-AI [2024b]). 具体来说, 与原始的专家设计相比, 我们增加专家数量, 同时按比例缩小每个专家的中间维度, 保持总容量不变. 这种设计让专家之间分工更专精, 模型能容纳更广, 更多样的知识.

Nevertheless, solely relying on fine-grained experts poses a potential challenge, i.e., individual experts may struggle to simultaneously develop both general and specialized capabilities under constrained capacity. This limitation may incentivize experts to prioritize improving general capabilities over specialized ones, which contradicts the design intent of the fine-grained experts. To address this, we introduce an additional share expert that can utilize all tokens for training without the need of routing Rajbhandari et al. [2022], Dai et al. [2024] to provide general ability. The final output $\mathbf { o } _ { t } ^ { \prime }$ of the MoE FFNs can be represented as follows:

不过, 只靠细粒度专家有一个潜在问题: 在容量受限的情况下, 单个专家可能难以同时发展通用能力和专门能力. 这可能促使专家优先提升通用能力而不是专门能力, 与细粒度专家的设计初衷相悖. 为此我们加入一个额外的共享专家, 它不经路由就能用所有 token 训练 (Rajbhandari et al. [2022], Dai et al. [2024]), 负责提供通用能力. MoE FFN 的最终输出 o'_t 可以写成:

$$
\mathbf {o} _ {t} ^ {\prime} = \mathbf {o} _ {t} + \mathrm{E} _ {\text {share}} (\mathbf {h} _ {t}).\tag{2}
$$

## 3.2.2 Expert Routing (专家路由)

Routing in MoE-based LLMs can generally be categorized into two approaches: token-drop and dropless. To ensure the efficient utilization of training data, we adopt a dropless strategy in our implementation. Additionally, we incorporate two key mechanisms, i.e., load balance loss and router z-loss, to enhance training efficiency and to prevent imbalances in the distribution of tokens across experts.

MoE LLM 中的路由一般分为两类: token-drop 和 dropless. 为了充分利用训练数据, 我们采用 dropless 策略. 此外我们加入两项关键机制: 负载均衡损失和 router z-loss, 用来提高训练效率, 防止 token 在专家之间分布失衡.

Meanwhile, to mitigate the instability issue during the early stage of pretraining, we propose a Stochastic Routing Warmup mechanism. Unlike conventional load-balancing losses or manual interventions, this method introduces controlled randomness into the routing module to prevent expert overload, and further prevent the experts from collapsing due to routing imbalance during the early training stage. Let $\mathbf { s } _ { t } \in \mathbb { R } ^ { N }$ denote the raw routing logits for input token t, computed by a linear projection layer. During the warmup phase (global step $i \leq W )$ , we interpolate between learned logits and synthesized random logits. The final routing logits ŝtare computed as:

同时, 为缓解预训练早期的不稳定, 我们提出随机路由预热 (Stochastic Routing Warmup) 机制. 与常规的负载均衡损失或人工干预不同, 这种方法在路由模块中引入受控的随机性, 防止专家过载, 并进一步避免训练早期因路由失衡导致专家坍塌. 设 s_t ∈ R^N 为输入 token t 的原始路由 logits, 由一个线性投影层算出. 在预热阶段 (全局 step i ≤ W), 我们在学到的 logits 和合成的随机 logits 之间插值. 最终路由 logits ŝ_t 按下式计算:

<!-- page 14 of 34 -->

$$
\begin{array}{l} \hat {\mathbf {s}} _ {t} = \alpha \cdot \mathbf {s} _ {t} + (1 - \alpha) \cdot (\mu_ {s} + \sigma_ {s} \cdot \epsilon), \\ \alpha = \min (\frac {i}{W}, 1. 0), \quad \epsilon \sim \mathcal {N} (0, I), \end{array}\tag{3}
$$

where $\mu _ { s }$ and $\sigma _ { s }$ represent the running mean and standard deviation of $\mathbf { s } _ { t }$ . The router warmup ensures balanced expert activation at initialization while gradually shifting control to the learned routing distribution, effectively mitigating out-of-memory risks and stabilizing training process.

其中 μ_s 和 σ_s 表示 s_t 的滑动均值和标准差. 路由预热保证初始化时各专家被均衡激活, 再逐步把控制权交给学到的路由分布, 有效降低显存溢出的风险, 让训练过程更稳定.

## 3.2.3 NormHead (归一化输出头)

Compared to dense architectures, MoE-based models exhibit increased training complexity and significantly reduced stability, which can lead to fluctuations in loss values and hinder convergence. During our preliminary experiments, we observed that the output norm of the LM-Head often becomes unstable, particularly during loss spikes. This instability can negatively impact both the convergence and the overall performance of the model. To address this issue, we involve a Normed LM-Head (NormHead) for token prediction Yang et al. [2023]. In this approach, the weight of the LM-Head, i.e., $\mathbf { W } _ { l m \_ h e a d }$ are subjected to L2 normalization before being applied for the token prediction. The formulation is as follows:

与 dense 架构相比, MoE 模型训练更复杂, 稳定性明显更差, 可能导致 loss 波动, 妨碍收敛. 在前期实验中我们观察到, LM-Head 的输出范数经常变得不稳定, 在 loss 尖峰期间尤其明显. 这种不稳定会损害模型的收敛和整体表现. 为解决这个问题, 我们在 token 预测中引入归一化的 LM-Head (NormHead) (Yang et al. [2023]). 做法是对 LM-Head 的权重 W_lm_head 先做 L2 归一化, 再用于 token 预测. 公式如下:

$$
\mathbf {h} _ {o} = \frac {\mathbf {W} _ {l m \_ h e a d}}{| | \mathbf {W} _ {l m \_ h e a d} | | _ {2}} \mathbf {h},\tag{4}
$$

where h represents the input to the LM-Head, and $\mathbf { h } _ { o }$ is the normalized output. By normalizing the weights, the NormHead ensures that variations in weight magnitude do not contribute to instability, particularly in scenarios involving large gradients or fluctuating loss values. Our empirical experiments indicate that NormHead significantly enhances the stability of training.

其中 h 是 LM-Head 的输入, h_o 是归一化后的输出. 通过归一化权重, NormHead 保证权重大小的变化不会引起不稳定, 在梯度较大或 loss 波动的场景下尤其如此. 我们的实验表明, NormHead 显著提升了训练稳定性.

## 3.3 Scaling Laws (scaling law)

As a foundational principle, scaling laws provide valuable predictive insights into the behavior of LLMs as model capacity and data volume increase. These scaling laws can serve as a framework for comparing different LLM architectures and guiding the training of hundred-billion-parameter LLMs. The existing studies Kaplan et al. [2020], Hoffmann et al. [2022], Henighan et al. [2020] have extensively investigated scaling laws in the context of dense LLMs, whereas some subsequent works Gao et al. [2024], Clark et al. [2022] have initiated discussions on the scaling laws for MoE models. However, there remains a significant gap in the systematic exploration of scaling laws for MoE architectures.

作为基础性原理, scaling law 能预测模型容量和数据量增加时 LLM 的行为. 这些 scaling law 可以作为比较不同 LLM 架构的框架, 并指导千亿参数 LLM 的训练. 已有研究 (Kaplan et al. [2020], Hoffmann et al. [2022], Henighan et al. [2020]) 对 dense LLM 的 scaling law 做了大量探讨, 后续一些工作 (Gao et al. [2024], Clark et al. [2022]) 开始讨论 MoE 模型的 scaling law. 但对 MoE 架构 scaling law 的系统性探索仍有明显空白.

In developing the MoE architecture for the Ling models, we conducted a systematic analysis of its scaling behavior with respect to two critical hyper-parameters: batch size and learning rate. Additionally, we evaluated its overall performance by examining validation loss. Using the scaling law of loss as a framework, we compared the MoE and dense architectures, uncovering insights into the scaling behavior and effectiveness of MoE models.

在为 Ling 模型设计 MoE 架构时, 我们系统分析了它随两个关键超参数的缩放行为: batch size 和学习率. 此外, 我们通过验证 loss 评估它的整体表现. 以 loss 的 scaling law 为框架, 我们比较了 MoE 和 dense 架构, 得到了关于 MoE 模型缩放行为和有效性的认识.

## 3.3.1 Scaling Laws for Hyper-parameters (超参数的 scaling law)

To optimize model performance across varying compute budgets, it is essential to first determine the optimal batch size and learning rate for different model sizes and data scales. To achieve this, we aligned the MoE architecture with Ling-Plus during scaling law experiments to minimize variability in the factors influencing model performance. We then performed a grid search over batch size and learning rate in the context of small-scale MoE model training, with compute budgets spanning a range from $1 e ^ { 1 8 }$ to 6e<sup>20</sup>. This systematic exploration enabled us to identify configurations that maximize the efficiency and performance of the models under differing computational constraints.

为在不同计算预算下优化模型表现, 首先要确定不同模型规模和数据规模下的最优 batch size 和学习率. 为此, 在 scaling law 实验中我们让 MoE 架构与 Ling-Plus 对齐, 尽量减少影响模型表现的变量. 随后我们在小规模 MoE 模型训练中对 batch size 和学习率做网格搜索, 计算预算从 1e18 到 6e20. 这种系统探索让我们找到在不同算力约束下效率和表现最好的配置.

Subsequently, we modeled the power law relationship between batch size (B) and learning rate (η) with respect to the compute budget (C). The results are illustrated in Figure 12 and provide insights into how these hyper-parameters scale under varying computational constraints.

随后我们对 batch size (B) 和学习率 (η) 相对计算预算 (C) 的幂律关系建模. 结果见 Figure 12, 它说明这些超参数在不同算力约束下如何缩放.

The fitted results indicate that the scaling behaviors of batch size (B) and learning rate (η) for MoE models are consistent with those observed in dense models, aligning with findings from previous work DeepSeek-AI [2024a]. Furthermore, we adjusted the MoE architecture, specifically the number of routed and shared experts, to achieve varying degrees of sparsity, ranging from 4.6% to 12.1%. In addition, we tuned the weighting of auxiliary loss components, such as balance loss and z-loss, to evaluate their potential impact.

拟合结果表明, MoE 模型 batch size (B) 和学习率 (η) 的缩放行为与 dense 模型一致, 与已有工作 (DeepSeek-AI [2024a]) 的发现吻合. 此外, 我们调整 MoE 架构, 具体是路由专家和共享专家的数量, 得到 4.6% 到 12.1% 的不同稀疏度. 我们还调整了 balance loss 和 z-loss 等辅助损失项的权重, 评估它们可能的影响.

Our analysis revealed that, for a given compute budget, neither the MoE architecture nor the auxiliary loss functions had any significant influence on the optimal batch size and learning rate. Instead, the optimal configuration of these

分析发现, 在给定计算预算下, MoE 架构和辅助损失函数对最优 batch size 和学习率都没有明显影响. 这 (句子接下页)

<!-- page 15 of 34 -->

![Chart block](images/p15-a-batch-size.png)

(a) Batch size.

(a) 批大小 (batch size).

![Chart block](images/p15-b-learning-rate.png)

(b) Learning rate.

(b) 学习率.

Figure 12: Scaling curve for batch size and learning rate.

图 12: batch size 和学习率的缩放曲线.

two hyper-parameters was found to be primarily determined by the compute budget. This observation underscores the compute budget as the dominant factor in hyper-parameter tuning for MoE training.

两个超参数的最优配置主要由计算预算决定. 这说明在 MoE 训练的超参数调优中, 计算预算是主导因素.

> **问:** 第 3.3.1 节的超参实验把稀疏度扫在 4.6% 到 12.1%, 而且 「aligned the MoE architecture with Ling-Plus」. Ling-Lite 落在这个范围里吗?
> 按激活参数除以总参数估算, Ling-Plus 是 28.8/290 ≈ 9.9%, 在 4.6% 到 12.1% 之内; Ling-Lite 是 2.75/16.8 ≈ 16.4%, 在范围之外. 论文没有给 「sparsity」 下精确定义, 按激活比例理解只是一种估算. 本文也没有说 Ling-Lite 的架构来自这组扫参, 实验明确对齐的是 Ling-Plus. 这一节的结论是最优 batch size 和学习率主要由计算预算决定, 与架构和辅助损失关系不大; 这条结论若成立, 对 Lite 同样适用, 但本文没有单独给出 Lite 的验证.

## 3.3.2 Scaling Laws for Model Performance (模型表现的 scaling law)

One of the critical questions surrounding the MoE architecture is its efficiency relative to dense architectures. To address this, we define the efficiency lever of MoE compared to dense models as the ratio of compute budgets required for each architecture to train a sufficiently large model that achieves the same level of training loss. To evaluate this, we selected a range of compute budgets spanning from $1 e ^ { 1 8 }$ to $3 e ^ { 2 0 }$ and conducted small-scale training experiments for both MoE and dense models. For each compute budget, we collected the results corresponding to the optimal training loss and subsequently fit a logarithmic inverse FLOPs-to-Loss curve for both MoE and dense architectures, respectively. This approach enabled a systematic comparison of the training efficiency between the two architectures.

关于 MoE 架构, 一个关键问题是它相对 dense 架构的效率. 为此我们把 MoE 相对 dense 模型的效率杠杆 (efficiency lever) 定义为: 两种架构各自训练出足够大, 达到同一训练 loss 水平的模型时, 所需计算预算的比值. 为评估这一点, 我们选取从 1e18 到 3e20 的一系列计算预算, 对 MoE 和 dense 模型分别做小规模训练实验. 对每个计算预算, 收集最优训练 loss 对应的结果, 再分别为 MoE 和 dense 架构拟合对数反比形式的 FLOPs-Loss 曲线. 这让我们能系统比较两种架构的训练效率.

![Chart block](images/p15-figure-13-scaling-curve-of-loss.png)

Figure 13: Scaling curve of loss.

图 13: loss 的缩放曲线.

As evidenced in Figure 13, MoE architecture consistently achieves lower training loss than the dense architecture under equivalent compute budgets. The average efficiency lever is approximately 3x, meaning that the MoE architecture is about 3 times more efficient than the dense architecture in terms of compute required to achieve the same performance. Interestingly, we observed that the efficiency lever increases as the compute budget grows. For example, at $_ { 1 e ^ { 2 1 } } ^ { 1 }$ FL $\mathrm { { \cal { L } } O P s } ,$ the efficiency lever is approximately 3, whereas at $1 e ^ { 2 4 }$ FLOPs, the efficiency lever exceeds 3.5. This trend suggests that MoE architectures exhibit increasing advantages over dense architectures as the compute budget scales up, reinforcing their potential for large-scale applications. The enhanced scalability implies that MoE architectures, such as Ling, could

如 Figure 13 所示, 在同等计算预算下, MoE 架构的训练 loss 始终低于 dense 架构. 平均效率杠杆约为 3 倍, 也就是达到同样表现时, MoE 架构所需的计算约为 dense 架构的三分之一. 有意思的是, 我们观察到效率杠杆随计算预算增加而增大. 例如在 1e21 FLOPs 时效率杠杆约为 3, 而在 1e24 FLOPs 时超过 3.5. 这一趋势说明随着计算预算扩大, MoE 架构相对 dense 架构的优势越来越大, 更适合大规模应用. 更强的可扩展性意味着像 Ling 这样的 MoE 架构 (句子接下页)

<!-- page 16 of 34 -->

become even more powerful and efficient when applied to massive-scale models, providing significant benefits in terms of resource utilization and performance at higher compute budgets. As models continue to scale, these efficiency gains highlight the promise of MoE as a highly scalable and cost-effective alternative to dense architectures.

用到超大规模模型上时会更强大, 更高效, 在更高的计算预算下带来资源利用和性能上的明显收益. 随着模型继续扩大, 这些效率增益显示出 MoE 作为 dense 架构的高可扩展, 高性价比替代方案的前景.

> **回看:** 效率杠杆 「at 1e21 FLOPs ... approximately 3, whereas at 1e24 FLOPs ... exceeds 3.5」, 这两个点在实验范围内吗?
> 不在. 第 3.3.2 节开头交代, 小规模实验的计算预算从 1e18 到 3e20. 1e21 已在范围之外, 1e24 比上限高三个多数量级, 两个数都是用拟合出的 FLOPs-Loss 曲线外推得到的. 「平均约 3 倍」 才是实验区间内的结论, 「超过 3.5」 属于外推预测. Figure 13 只画了 loss 曲线, 没有 1e24 处的实测点.

## 3.4 Training Recipe (训练配方)

## 3.4.1 Initial Pre-Training (初始预训练)

We pre-train Ling-Plus using the AdamW optimizer with the following hyper-parameters: $\beta_{1}   =   0.9,   \beta_{2}   =   0.95,$ $\epsilon = \dot { 1 } e ^ { - 8 }$ , and weight\_decay = 0.1. We adopt a warmup-and-stable-decay learning rate schedule, with a maximum learning rate of $2 . 4 \tilde { e } ^ { - 4 }$ . The learning rate is linearly warmed up from 0 to the maximum value over the first 2K training steps. Afterward, it is halved once approximately 60% of the training tokens are processed.

我们用 AdamW 优化器预训练 Ling-Plus, 超参数如下: β1 = 0.9, β2 = 0.95, ε = 1e-8, weight_decay = 0.1. 学习率采用 warmup-and-stable-decay 调度, 最大学习率 2.4e-4. 前 2K 个训练 step 内, 学习率从 0 线性升到最大值. 之后在处理完约 60% 的训练 token 时减半一次.

We also implement a batch size warmup strategy, starting from an initial batch size of 2,560. The batch size gradually increases to a maximum of 8,960 and remains at this maximum for the remainder of training. The gradient clipping norm is set to 1.0, and the maximum sequence length is fixed at 4K tokens. For the first stage of pre-training, we train on a total of 9T tokens. The load-balancing loss coefficient is set to 0.015, and the z-loss coefficient is set to $[ e ^ { - 4 }$ . We do not employ the token-dropping strategy during training.

我们还采用 batch size 预热策略, 初始 batch size 为 2,560, 逐步增加到最大 8,960, 之后保持不变直到训练结束. 梯度裁剪范数设为 1.0, 最大序列长度固定为 4K token. 第一阶段预训练共训练 9T token. 负载均衡损失系数设为 0.015, z-loss 系数设为 1e-4 (原文这里排版损坏, 印成了 「[e^-4」). 训练中不采用 token-dropping 策略.

Throughout the training process, we continuously monitor various indicators such as training loss, gradients, router token distribution, and benchmark scores to ensure that the model is learning effectively and consistently. We also perform several adjustments to the pre-training data mix to enhance model performance. During each adjustment, we increase the proportion of high-quality data while removing samples where the loss fails to decrease. To mitigate the risk of duplicate samples during these adjustments, we employ sample-level online data deduplication, ensuring the uniqueness of training data during the mixing process. These techniques and strategies collectively aim to optimize the pre-training process, ensuring robust model performance while maintaining training stability and data quality.

整个训练过程中, 我们持续监控训练 loss, 梯度, 路由器的 token 分布和基准分数等指标, 确保模型学习有效且稳定. 我们还多次调整预训练数据配比来提升模型表现. 每次调整时, 提高高质量数据的比例, 同时去掉 loss 不再下降的样本. 为降低调整中出现重复样本的风险, 我们采用样本级在线数据去重, 保证混合过程中训练数据的唯一性. 这些技术和策略共同优化预训练过程, 在保持训练稳定和数据质量的同时保证模型表现稳健.

## 3.4.2 Long Context Pre-Training (长上下文预训练)

During this phase of pre-training, the maximum input sequence length was extended to 16K tokens. This extension was achieved using Rotary Position Embedding (RoPE), with θ parameter adjusted from 10K to 600K to support longer sequences. Adjustments were also made to the training dataset to better align with the objectives of long-context processing. For the Ling-Plus model, the proportion of web-derived data was reduced, and additional long-form text data were incorporated to improve the model’s ability to process extended sequences. Similarly, for the Ling-Lite model, the amount of web-based data was scaled down, while the proportion of mathematical and coding-related corpora was increased. The learning rate schedule remained consistent with the prior training stage, and a total of 150B tokens were processed during this phase to enhance the model’s long-context processing capabilities.

在这一阶段的预训练中, 最大输入序列长度扩展到 16K token. 扩展借助旋转位置编码 (RoPE) 实现, θ 参数从 10K 调到 600K, 以支持更长的序列. 训练数据集也做了调整, 更贴合长上下文处理的目标. 对 Ling-Plus 模型, 降低了网页数据的比例, 加入更多长文本数据, 提升处理长序列的能力. 对 Ling-Lite 模型, 同样减少了网页数据, 同时提高了数学和代码语料的比例. 学习率调度与前一阶段保持一致, 这一阶段共处理 150B token, 增强模型的长上下文处理能力.

> **确认:** 第 3.4 节的训练配方里, 哪些数属于 Ling-Lite?
> 第 3.4.1 节第一句就是 「We pre-train Ling-Plus using the AdamW optimizer」, 后面的 β1 = 0.9, β2 = 0.95, 最大学习率 2.4e-4, batch size 2,560 到 8,960, 9T token, 负载均衡系数 0.015 等, 都是 Ling-Plus 的配置. 本节点名 Ling-Lite 的只有第 3.4.2 节这一段: 长上下文阶段 Lite 减少网页数据, 提高数学和代码语料比例. Lite 自己的学习率和 batch size 本文没有单列. 顺带可以核对一处前后一致: 最大学习率 2.4e-4 在约 60% token 处减半得到 1.2e-4, 正好是第 3.4.3 节退火的起点 1.2e-4.

## 3.4.3 Annealing (退火)

During the final phase of pre-training, the inverse square root decay schedule was employed to systematically reduce the learning rate from $1 . 2 e ^ { - \tilde { 4 } } \; \mathrm { t o } \; 1 . 2 e ^ { - \tilde { 8 } }$ . To maintain the effectiveness of this phase, the annealing process was conducted exclusively using clean, meticulously curated, high-quality datasets.

在预训练的最后阶段, 采用逆平方根衰减调度, 把学习率从 1.2e-4 系统地降到 1.2e-8. 为保证这一阶段的效果, 退火只使用干净, 精心整理的高质量数据集.

## 3.4.4 Skip loss spikes and Sample retry mechanism (跳过 loss 尖峰与样本重试机制)

During pre-training, the phenomenon where the loss abruptly rises and then falls is referred to as loss spikes. These abrupt changes are typically triggered by specific interactions between the data and optimizer states. Loss spikes can be classified into two types: (1) narrow spikes, which last for only a few steps and have minimal impact on model performance, and (2) wide spikes, which persist across more steps and can significantly disrupt model stability, sometimes even causing benchmark evaluation results to approach random levels. Our research shows that it is difficult to completely eliminate loss spikes. To mitigate their effects, we have designed a series of strategies, including skip loss spikes and sample retry mechanism. When a loss spike is detected, the affected update is skipped, and the associated data is randomly re-injected into subsequent training batches. If the spike persists, we automatically reduce the learning rate during the affected step. This approach has proven effective in reducing the negative impact of loss spikes, enabling consistent improvements in benchmark metrics throughout the training process. Figure 14 intuitively illustrates the improvement in train loss achieved by the proposed strategy.

预训练中, loss 突然上升又回落的现象称为 loss 尖峰. 这种突变通常由数据与优化器状态之间的特定相互作用触发. loss 尖峰可分为两类: (1) 窄尖峰, 只持续几个 step, 对模型表现影响很小; (2) 宽尖峰, 持续更多 step, 可能严重破坏模型稳定性, 有时甚至让基准评测结果接近随机水平. 我们的研究表明, 完全消除 loss 尖峰很难. 为减轻它的影响, 我们设计了一系列策略, 包括跳过 loss 尖峰和样本重试机制. 发现 loss 尖峰后, 跳过受影响的更新, 并把相关数据随机重新注入后续训练 batch. 如果尖峰持续, 就在受影响的 step 自动降低学习率. 事实证明这种方法能有效减轻 loss 尖峰的负面影响, 让基准指标在整个训练过程中持续提升. Figure 14 直观展示了这一策略对训练 loss 的改善.

<!-- page 17 of 34 -->

![Chart block](images/p17-a-before.png)

(a) before

(a) 之前.

![Chart block](images/p17-b-after.png)

(b) after

(b) 之后.

Figure 14: Comparison of train loss curves before and after applying skip loss spikes and sample retry mechanism.

图 14: 应用跳过 loss 尖峰和样本重试机制前后的训练 loss 曲线对比.

![Image block](images/p17-figure-15-illustration-of-our-post-training-modeling.png)

Figure 15: Illustration of our post-training modeling and dataset curation pipeline.

图 15: 后训练建模与数据集整理流水线示意图.

## 4 Post-Training (后训练)

As depicted in Figure 15, following the pre-training phase, the development of the Ling model involves a dual-stage alignment process: Supervised Fine-Tuning (SFT) Ouyang et al. [2022] and Direct Preference Optimization (DPO) Rafailov et al. [2023]. This alignment process adopts an iterative framework to progressively enhance both the dataset and the model’s capabilities. Specifically, after each training cycle, the best-performing model from prior iterations is leveraged to refine the SFT and preference data, thereby informing and improving subsequent training phases. In the following sections, we provide a detailed overview of our SFT data curation process (see Section 4.1), the DPO methodology (see Section 4.2), as well as the post-training techniques employed for long-text generation (see Section 4.3) and tool use (see Section 4.4). Additionally, the complete post-training pipelines and configurations, tailored for various computing platforms, will be made publicly available through our code repository.

如 Figure 15 所示, 预训练之后, Ling 模型的开发经历两阶段对齐: 监督微调 (SFT) (Ouyang et al. [2022]) 和直接偏好优化 (DPO) (Rafailov et al. [2023]). 这一对齐过程采用迭代框架, 逐步改进数据集和模型能力. 具体来说, 每轮训练结束后, 用此前各轮中表现最好的模型改进 SFT 数据和偏好数据, 为后续训练阶段提供依据. 下文依次介绍 SFT 数据整理过程 (见 4.1 节), DPO 方法 (见 4.2 节), 以及用于长文本生成 (见 4.3 节) 和工具使用 (见 4.4 节) 的后训练技术. 此外, 面向各种计算平台定制的完整后训练流水线和配置, 将通过我们的代码仓库公开.

## 4.1 Supervised Fine-tuning (监督微调)

Data serves as the cornerstone of the supervised fine-tuning (SFT) stage, with synthetic data assuming an increasingly significant role. This shift is driven by the diminishing availability of human-generated data and the substantial costs associated with its annotation, both in terms of time and labor. Our SFT dataset is constructed from an initial seed dataset consisting of one to two million instances derived from a combination of human annotations and open-source resources. This dataset is subsequently scaled by a substantial factor through the application of data synthesis techniques. In the following, we detail the measures implemented to ensure the quality and diversity of the synthetic data, which are critical to the success of the fine-tuning process.

数据是监督微调 (SFT) 阶段的基石, 合成数据的作用越来越大. 原因是人工生成的数据越来越少, 标注在时间和人力上又成本高昂. 我们的 SFT 数据集从一个初始种子集构建, 包含一百万到两百万条样本, 来自人工标注和开源资源. 之后通过数据合成技术把规模扩大很多倍. 下面介绍保证合成数据质量和多样性的措施, 这对微调成功至关重要.

<!-- page 18 of 34 -->

## 4.1.1 Quality Assurance (质量保证)

Our data synthesis process leverages methodologies inspired by Magpie-like approaches Xu et al. [2024] and OSS-Instruct Wei et al. [2023] to generate novel problem prompts. Following this, we applied the rejection sampling (RS) technique, as outlined in Dubey et al. [2024], to produce candidate responses. To ensure high-quality outputs, we established a dedicated pipeline designed to select the most optimal responses, with specific tailoring for reasoning and non-reasoning datasets. This targeted approach ensures that the synthesized data aligns with the desired quality standards while addressing the diverse requirements of different data types.

我们的数据合成借鉴了 Magpie 类方法 (Xu et al. [2024]) 和 OSS-Instruct (Wei et al. [2023]), 用来生成新的问题 prompt. 之后按 Dubey et al. [2024] 的做法, 用拒绝采样 (RS) 生成候选回答. 为保证输出质量, 我们建立了专门的流水线来挑选最优回答, 并针对推理类和非推理类数据分别定制. 这种有针对性的做法保证合成数据达到预期质量标准, 同时照顾到不同数据类型的不同需求.

For reasoning data, such as code, math, and logical reasoning, we implemented a series of rule-based filtering mechanisms to ensure high-quality data:

对代码, 数学和逻辑推理这类推理数据, 我们实施了一系列基于规则的过滤机制来保证数据质量:

• **Code data.** A comprehensive multi-stage validation process was developed, which involves: (1) extracting and verifying code through rule-based checks and execution tests, (2) generating synthetic test cases using advanced LLMs, and (3) retaining only those code solutions that successfully pass all stages of verification.

• **代码数据.** 我们开发了完整的多阶段验证流程, 包括: (1) 通过规则检查和执行测试抽取并验证代码, (2) 用先进的 LLM 生成合成测试用例, (3) 只保留通过所有验证阶段的代码解答.

• **Math data.** We prompted LLMs to translate computational logic into executable Python code, enabling the execution of the code to verify both the final answers and intermediate reasoning steps. This ensures accuracy throughout the problem-solving process.

• **数学数据.** 我们让 LLM 把计算逻辑翻译成可执行的 Python 代码, 通过执行代码验证最终答案和中间推理步骤, 保证整个解题过程的正确性.

• **Logical reasoning data.** A majority voting system was employed to achieve consensus-based selection of the best solutions. This approach helps identify the most accurate logical conclusions by aggregating multiple perspectives to ensure reliability.

• **逻辑推理数据.** 采用多数投票系统, 基于共识挑选最佳解答. 这种方法汇总多个视角, 帮助找出最准确的逻辑结论, 保证可靠性.

Our empirical analysis indicates that these rule-based methods effectively eliminated a significant number of incorrect responses while minimizing the exclusion of correct ones, thus maintaining dataset integrity. Subsequently, for both the filtered reasoning data and non-reasoning data (e.g., creative writing and general question answering), we employed an LLM-based judge with a detailed evaluation checklist to further assess the relevance and quality of the generated responses. This final quality control step ensures the overall robustness of the dataset.

实证分析表明, 这些基于规则的方法有效剔除了大量错误回答, 同时尽量少误删正确回答, 保持了数据集的完整性. 随后, 对过滤后的推理数据和非推理数据 (例如创意写作和通用问答), 我们用一个带详细评估清单的 LLM 评判器, 进一步评估生成回答的相关性和质量. 这最后一道质量控制保证了数据集整体的稳健.

## 4.1.2 Data Redundancy (数据冗余)

During the data synthesis process, we observed a degree of redundancy within the dataset, particularly in code-related synthetic data Tsai et al. [2024]. This redundancy often stemmed from similar response patterns, which posed the risk of causing the model to overfit to specific patterns, thereby potentially impairing its generalization capabilities. To address this issue, we implemented a semantic-based deduplication method to eliminate redundant data.

在数据合成过程中, 我们观察到数据集中存在一定程度的冗余, 在代码类合成数据中尤其明显 (Tsai et al. [2024]). 这种冗余通常来自相似的回答模式, 可能让模型过拟合特定模式, 损害泛化能力. 为解决这个问题, 我们采用基于语义的去重方法剔除冗余数据.

Specifically, we employed a text embedding model with demonstrated strong performance, as reported on the MTEB Leaderboard MTEB [2024], to map problem prompts and responses into a vector space. Using these embeddings, we identified and removed instruction data with high cosine similarity, effectively reducing redundancy in the dataset. Our analysis revealed that removing approximately 10% to 20% of the most similar data had no adverse effect on the model’s core capabilities. This finding underscores the significant potential for deduplication within synthetic datasets to enhance data quality without compromising model performance.

具体来说, 我们选用在 MTEB 排行榜 (MTEB [2024]) 上表现强的文本嵌入模型, 把问题 prompt 和回答映射到向量空间. 基于这些嵌入, 找出并删除余弦相似度高的指令数据, 有效降低数据集的冗余. 分析发现, 删除最相似的约 10% 到 20% 数据, 对模型核心能力没有负面影响. 这说明合成数据集有很大的去重空间, 可以在不损害模型表现的情况下提高数据质量.

## 4.2 Direct Preference Optimization (直接偏好优化)

The Direct Preference Optimization (DPO) workflow consists of two primary phases, each involving multiple iterative processes aimed at enhancing preference alignment and improving the robustness of the model’s reasoning:

直接偏好优化 (DPO) 流程包括两个主要阶段, 每个阶段都有多轮迭代, 目的是加强偏好对齐, 提高模型推理的稳健性:

• **Vanilla DPO (VD).** In this initial phase, the focus is on improving the model’s authenticity, relevance, harmlessness, and capacity to follow instructions. Preference data is curated through a rejection sampling strategy that integrates scoring mechanisms from both a large language model (LLM) judge and a reward model.

• **Vanilla DPO (VD).** 在第一阶段, 重点是提升模型回答的真实性, 相关性, 无害性和遵循指令的能力. 偏好数据通过拒绝采样策略整理, 打分机制结合了 LLM 评判器和奖励模型.

• **Robustness optimization (RO).** The second phase emphasizes strengthening the stability of the model’s reasoning across tasks such as mathematics, coding, and overall performance. For tasks with definitive answers, rejection sampling is utilized within a probability range of correct responses (e.g., 0.2 to 0.6), with responses selected via a Best-of-N approach and rejected using a Worst-of-N strategy based on reward model scores. For open-ended tasks, quality evaluation is performed through majority voting to mitigate bias and improve overall robustness. Additionally, a negative log-likelihood (NLL) regularization term Pang et al. [2024] with a weight of 0.05 is introduced. This regularization is designed to prevent high-quality selected responses from experiencing a decline in their probabilities, thereby maintaining output quality.

• **稳健性优化 (RO).** 第二阶段着重加强模型在数学, 代码等任务上以及整体表现上的推理稳定性. 对有确定答案的任务, 在正确回答概率落在某个区间 (例如 0.2 到 0.6) 的样本上做拒绝采样, 按奖励模型分数用 Best-of-N 选出 chosen 回答, 用 Worst-of-N 选出 rejected 回答. 对开放式任务, 用多数投票评估质量, 减少偏差, 提高整体稳健性. 此外引入权重为 0.05 的负对数似然 (NLL) 正则项 (Pang et al. [2024]). 这一正则项防止被选中的高质量回答概率下降, 从而保持输出质量.

<!-- page 19 of 34 -->

Table 4: The model’s performance across various post-training stages on multiple benchmarks, considering specific formatting requirements. ‘DPO-format’ refers to a DPO training designed for format recovery.

表 4: 模型在各后训练阶段, 在多个基准上的表现, 其中考虑了特定的格式要求. 「DPO-format」 指为恢复格式而设计的一轮 DPO 训练.

| Model | AGIEval | CMATH | MATH | CN Middle School 24 | GaoKao | Olympiad Bench | Minerva Math |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SFT | 64.78 | 94.72 | 78.98 | 59.41 | 51.65 | 44.30 | 40.81 |
| DPO | 65.76 | 95.26 | 80.16 | 70.30 | 57.14 | 43.41 | 40.07 |
| DPO-format | 67.67 | 95.63 | 80.62 | 73.27 | 63.74 | 44.89 | 41.18 |

To enhance training efficiency, we implemented an innovative data-packing strategy within the DPO framework. This method involves padding both chosen and rejected sequences to the maximum sequence length to maintain the integrity of the chosen-rejected pairing paradigm. By adopting this approach, we achieved a significant **3.7-fold increase in DPO training speed**. During the iterative optimization process, we identified issues related to the clarity and structural organization of responses, particularly in adherence to formatting instructions. To address these shortcomings, an additional DPO training phase focused specifically on formatting was conducted. This involved utilizing pairs of accepted and rejected responses that shared identical reasoning but differed in formatting. During the computation of the DPO loss, masking was applied to all content except the format-specific portions to ensure that valid reasoning within the rejected responses was not penalized. This precaution mitigated the risk of suppressing useful reasoning due to the contrastive nature of the DPO loss.

为提高训练效率, 我们在 DPO 框架中实现了一种新的数据打包策略. 做法是把 chosen 序列和 rejected 序列都 padding 到最大序列长度, 保持 chosen-rejected 成对的结构. 采用这种方法后, **DPO 训练速度提升到 3.7 倍**. 在迭代优化中, 我们发现回答的清晰度和结构组织有问题, 尤其是遵循格式指令方面. 为弥补这些不足, 我们额外做了一轮专门针对格式的 DPO 训练. 这一轮使用推理相同, 只在格式上不同的 accepted/rejected 回答对. 计算 DPO loss 时, 除格式相关部分外, 其余内容全部 mask 掉, 保证 rejected 回答中有效的推理不受惩罚. 这一预防措施降低了 DPO loss 的对比性质压制有用推理的风险.

Empirical results, as presented in Table 4, demonstrate that format-focused training effectively reduces penalties stemming from formatting errors. This improvement enables the model’s capabilities to be evaluated and utilized more reliably.

如 Table 4 所示, 实验结果表明针对格式的训练有效减少了格式错误带来的扣分. 这一改进让模型能力能被更可靠地评估和使用.

> **想:** Table 4 是 Ling-Lite 还是 Ling-Plus 的结果? DPO 这一步有没有让某些分数下降?
> 表题和正文都没写模型名, 本文无法确定是哪个模型. 从 SFT 到 DPO, 多数列上涨, CN Middle School 24 从 59.41 到 70.30 涨得最多; 但 Olympiad Bench 从 44.30 降到 43.41, Minerva Math 从 40.81 降到 40.07. 再做一轮 DPO-format 后, 这两列回到 44.89 和 41.18, 都超过 SFT. 第 4.2 节的解释是一部分失分来自格式错误, 所以格式 DPO 能把分数拉回来.

In the early stages of model development, we conducted experiments with various approaches to improve performance. Below, we present key insights from these exploratory attempts to inform future research directions:

在模型开发早期, 我们试验了多种提升表现的方法. 下面介绍这些探索中的关键发现, 供后续研究参考:

• **Length-regularized DPO.** We explored incorporating length regularization into the DPO framework to mitigate the model’s sensitivity to response length. While this approach effectively shortened response outputs, it did not yield improvements in overall performance. In fact, the vanilla DPO method outperformed length-regularized DPO, particularly on tasks involving mathematics and coding. We hypothesize that this limitation arises because complex problems in these domains often require detailed and lengthier solutions. Length regularization may inadvertently suppress the loss for such responses, reducing the model’s ability to handle intricate cases that inherently demand more extensive outputs. These findings highlight a trade-off: although length regularization can help control verbosity, it risks penalizing the longer responses necessary for addressing complex tasks. Future research could investigate adaptive strategies that balance length control with the varying complexity and requirements of tasks across different domains.

• **长度正则化 DPO.** 我们尝试在 DPO 框架中加入长度正则, 减轻模型对回答长度的敏感. 这种方法确实缩短了输出, 但没有提升整体表现. 事实上, vanilla DPO 的表现优于长度正则化 DPO, 在数学和代码任务上尤其明显. 我们推测原因是这些领域的复杂问题往往需要详细, 较长的解答. 长度正则可能无意中压低了这类回答的 loss, 削弱模型处理本身就需要较长输出的复杂情形的能力. 这些发现揭示了一种权衡: 长度正则可以帮助控制啰嗦, 但有惩罚复杂任务所需长回答的风险. 未来研究可以探索自适应策略, 在长度控制与不同领域任务的复杂度和需求之间取得平衡.

• **Avoid repeated prompts.** We also experimented with augmenting the training dataset by incorporating repeated prompts paired with varied responses. The goal was to expand the model’s exploration space and potentially enhance downstream DPO performance. This approach involved generating additional responses by sampling at different temperature settings. However, our results showed a slight performance decline compared to using the original dataset. This suggests that increasing data volume through repeated prompts does not necessarily lead to better optimization outcomes in DPO. Instead, our findings indicate that prioritizing diverse and unique prompts is more effective for improving performance.

• **避免重复 prompt.** 我们还尝试用重复的 prompt 配上不同的回答来扩充训练集, 目的是扩大模型的探索空间, 可能提升下游 DPO 的表现. 做法是在不同温度下采样, 生成额外的回答. 但结果显示, 与使用原始数据集相比, 表现略有下降. 这说明通过重复 prompt 增加数据量, 不一定带来更好的 DPO 优化结果. 我们的发现表明, 优先保证 prompt 多样且不重复, 对提升表现更有效.

## 4.3 Long Context (长上下文)

The Ling model is designed to process text lengths of up to 16k tokens, addressing the requirements of long-form content processing. To enhance the model’s performance on long-context tasks while ensuring that its capabilities on shorter tasks remain unaffected, it is essential to carefully refine the training strategy during the post-training phase. To achieve this goal, the following efforts were undertaken to strengthen the model’s ability to handle extended contexts:

Ling 模型设计为能处理最长 16k token 的文本, 满足长内容处理的需求. 为了在增强长上下文任务表现的同时不影响短任务上的能力, 后训练阶段必须仔细打磨训练策略. 为此, 我们做了以下工作来加强模型处理长上下文的能力:

## 4.3.1 Synthesis of Long-Context Instruction Data (长上下文指令数据的合成)

We curated high-quality Chinese and English documents from open-source corpora and concatenated them to create extended contexts. Using these extended contexts, the model was prompted to generate queries and responses across a variety of tasks, including retrieval, summarization, question answering (QA), and reasoning.

我们从开源语料中挑选高质量的中英文文档, 把它们拼接成长上下文. 基于这些长上下文, 让模型针对多种任务生成问题和回答, 包括检索, 摘要, 问答 (QA) 和推理.

<!-- page 20 of 34 -->

To address the "lost in the middle" phenomenon Liu et al. [2024]—a common challenge in long-context tasks where key information located in the middle of lengthy documents is often overlooked—we constructed specialized datasets to improve model performance in these scenarios. Specifically, we created single-needle, multi-needle, and multi-hop retrieval datasets by inserting critical information into the middle of documents. These datasets were designed to enhance the model’s performance on needle-in-a-haystack tasks and related benchmarks requiring precise identification and retrieval of key information from extended contexts. Figure 16 shows that Ling-Plus achieves nearly perfect performance in "Needle in A Haystack" testing across all context lengths up to 64K.

为应对 「lost in the middle」 现象 (Liu et al. [2024]), 即长上下文任务中常见的, 位于长文档中间的关键信息容易被忽略的问题, 我们构建了专门的数据集来提升模型在这类场景中的表现. 具体来说, 我们把关键信息插入文档中间, 构造了单针, 多针和多跳检索数据集. 这些数据集用来增强模型在大海捞针任务, 以及需要从长上下文中精确识别和检索关键信息的相关基准上的表现. Figure 16 显示, Ling-Plus 在 「Needle in A Haystack」 测试中, 在直到 64K 的所有上下文长度上都接近满分.

![Chart block](images/p20-figure-16-needle-in-a-haystack-testing-for-ling-plus.png)

Figure 16: Needle in A Haystack Testing for Ling-Plus

图 16: Ling-Plus 的大海捞针测试.

## 4.3.2 Progressive Fine-tuning Strategy (渐进式微调策略)

To address differences in convergence rates between long-context and short-context tasks, we implemented a two-stage fine-tuning strategy. This approach was designed to ensure robust performance across varying context lengths while preserving the model’s foundational capabilities:

为应对长上下文任务与短上下文任务收敛速度的差异, 我们实施了两阶段微调策略. 这种方法保证在不同上下文长度上都有稳健表现, 同时保住模型的基础能力:

• **Short-context adaptation.** In the initial stage, fine-tuning was conducted exclusively on short-context data (contexts with lengths ≤4K tokens). This step was aimed at preserving and refining the model’s core capabilities, particularly on shorter tasks.

• **短上下文适配.** 第一阶段只用短上下文数据 (上下文长度 ≤4K token) 微调, 目的是保持并打磨模型的核心能力, 特别是短任务上的能力.

**Context length extension.** In the second stage, long-context data (contexts ranging from 4K to 16K tokens) was progressively introduced into the fine-tuning process. To balance performance across context lengths, a training sample ratio of 95:5 (short-context to long-context samples) was empirically determined and applied. This ratio was optimized to prevent performance degradation on short-context tasks while enhancing the model’s ability to process longer contexts. Additional experiments demonstrated that this progressive fine-tuning approach yields even greater benefits when scaling to longer contexts, such as 16K→64K tokens.

**上下文长度扩展.** 第二阶段逐步把长上下文数据 (上下文长度 4K 到 16K token) 加入微调. 为平衡不同上下文长度上的表现, 根据经验确定并采用 95:5 的训练样本比例 (短上下文样本比长上下文样本). 这一比例经过优化, 防止短上下文任务表现下降, 同时增强模型处理更长上下文的能力. 另外的实验表明, 扩展到更长的上下文 (例如 16K→64K token) 时, 这种渐进式微调方法收益更大.

## 4.3.3 Reinforcement Learning Optimization (强化学习优化)

Consistent with the findings reported in Dubey et al. [2024], our experiments demonstrated that once the model undergoes successful long-context adaptation during SFT and RL with standard short-context samples effectively improves alignment with human preferences. Notably, this improvement is achieved without degrading the model’s performance on long-context tasks. Based on these observations, we adhered to conventional RL training protocols that rely on short-context data.

与 Dubey et al. [2024] 报告的发现一致, 我们的实验表明: 模型在 SFT 阶段完成长上下文适配之后, 用标准短上下文样本做 RL 就能有效改善与人类偏好的对齐. 值得注意的是, 这一改进不会降低模型在长上下文任务上的表现. 基于这些观察, 我们沿用依赖短上下文数据的常规 RL 训练流程.

## 4.4 Tool Use (工具使用)

In many AI application scenarios, particularly those involving LLM-based agents, the ability to utilize external tools or perform function calls represents a critical capability. To equip the Ling models with this functionality, we train them to interact with the following categories of tools:

在许多 AI 应用场景中, 尤其是基于 LLM 的智能体, 使用外部工具或执行函数调用是一项关键能力. 为让 Ling 模型具备这种能力, 我们训练它们与以下几类工具交互:

<!-- page 21 of 34 -->

• **Public APIs.** Ling models are trained to effectively leverage a wide range of publicly available APIs, such as those provided by RapidAPI RapidAPI [2025].

• **公共 API.** Ling 模型经过训练, 能有效使用大量公开 API, 例如 RapidAPI (RapidAPI [2025]) 提供的那些.

• **Application APIs.** Ling models are also trained to utilize application-specific APIs employed by proprietary systems, such as search engine and local service APIs from Alipay agents Alipay [2025].

• **应用 API.** Ling 模型还经过训练, 能使用专有系统中的应用专用 API, 例如支付宝智能体 (Alipay [2025]) 的搜索引擎和本地生活服务 API.

• **Synthetic APIs.** Ling models are trained to utilize synthetic APIs generated by our knowledge graph technology.

• **合成 API.** Ling 模型经过训练, 能使用由我们的知识图谱技术生成的合成 API.

To enhance the tool use ability of our Ling models, we mainly focus on the following two aspects.

为增强 Ling 模型的工具使用能力, 我们主要关注以下两方面.

**Synthesis of high-quality tool use data.** (1) Tool and user instruction collection: To enhance the Ling models ability to interact with diverse tools, we curate a comprehensive dataset comprising open-source APIs from platforms like RapidAPI and GoogleAPI, as well as application-specific APIs for search engines and local services. We employ a knowledge graph technology to design 14 subgraph patterns and their corresponding First-Order Logic (FOL) representations, facilitating the synthesis of APIs and user instructions (queries) and improving the models’ generalization in tool use. Furthermore, the dataset is enriched with tool-related user instructions from real-world agent applications and publicly available resources such as ToolBench Qin et al. [2023] and ToolAlpaca Tang et al. [2023], providing a strong foundation for training in tool interaction. (2) Task planning and system instruction generalization: Using the knowledge graphs mentioned above, we generate precise tool-calling paths to ensure accuracy and reliability in tool use. To address the variability of tool-based system instructions, we collect established instruction templates, such as LangChain ReACT LangChain [2025], OpenAI function calling OpenAI [2025], and ModelScope-Agent (Qwen’s Agent) Li et al. [2023a], and expand them into over 30,000 distinct templates, enabling their application across diverse scenarios and establishing a robust basis for effective task planning and execution.

**高质量工具使用数据的合成.** (1) 工具与用户指令收集: 为增强 Ling 模型与多样工具交互的能力, 我们整理了一个完整的数据集, 包括来自 RapidAPI 和 GoogleAPI 等平台的开源 API, 以及用于搜索引擎和本地服务的应用专用 API. 我们用知识图谱技术设计了 14 种子图模式及对应的一阶逻辑 (FOL) 表示, 便于合成 API 和用户指令 (查询), 提高模型在工具使用上的泛化能力. 此外, 数据集还加入了来自真实智能体应用和公开资源 (例如 ToolBench (Qin et al. [2023]) 和 ToolAlpaca (Tang et al. [2023])) 的工具相关用户指令, 为工具交互训练打下扎实基础. (2) 任务规划与系统指令泛化: 利用上述知识图谱, 我们生成精确的工具调用路径, 保证工具使用的准确和可靠. 为应对基于工具的系统指令的多变性, 我们收集了现成的指令模板, 例如 LangChain ReACT (LangChain [2025]), OpenAI function calling (OpenAI [2025]) 和 ModelScope-Agent (Qwen 的 Agent) (Li et al. [2023a]), 并把它们扩展为 3 万多个不同模板, 让它们能用于多种场景, 为有效的任务规划和执行打下稳固基础.

**Adaptive tool learning.** To address complex scenarios involving tool use, our Ling models are designed with advanced self-reflection and strategic planning capabilities. The data generation process comprises the following four key components. (1) Policy agent: The Ling models serve as policy agents, generating diverse calling responses and leveraging rejected calls to create self-reflective dialogues with the support of reference agents. (2) Reference agent: Advanced Ling models or other LLMs are employed to deconstruct user tasks and provide self-reflective feedback when policy models generate error callings. (3) Quality judgment: A "model-as-judge" strategy, utilizing advanced Ling models, assigns binary scores to evaluate the success of API calls and overall task completion, ensuring robust and reliable performance.

**自适应工具学习.** 为应对涉及工具使用的复杂场景, Ling 模型被设计为具备较强的自我反思和策略规划能力. 数据生成过程包括以下四个关键组成部分. (1) 策略智能体: Ling 模型充当策略智能体, 生成多样的调用回答, 并在参考智能体的支持下, 利用被拒绝的调用构造自我反思对话. (2) 参考智能体: 用更强的 Ling 模型或其他 LLM 拆解用户任务, 在策略模型调用出错时给出自我反思式反馈. (3) 质量判断: 采用 「模型即评判」 策略, 用更强的 Ling 模型给 API 调用是否成功和任务整体是否完成打二元分数, 保证表现稳健可靠.

> **拆开:** 「Adaptive tool learning」 说数据生成 「comprises the following four key components」, 实际列了几项?
> 只列了三项: (1) Policy agent, (2) Reference agent, (3) Quality judgment. 第四项在原文中缺失, 本文其他地方也没有补上. 第 1.3 节对应的概述只提到 「rejection sampling and error correction」 和 「self-reflective multi-agent interactive dialogues」, 同样对不出第四项. 读的时候按三项理解即可.

## 5 Results (结果)

## 5.1 Pre-trained Language Model (预训练语言模型)

## 5.1.1 Evaluation Benchmarks (评测基准)

The Ling base model is pre-trained on multilingual datasets comprising both English and Chinese. Consequently, we evaluate the model’s performance on a diverse set of benchmarks that include both Chinese and English. Specifically, the evaluation benchmarks are categorized into the following 4 types:

Ling 基座模型在包含英文和中文的多语言数据集上预训练. 因此我们在一组同时包含中文和英文的多样基准上评测模型表现. 具体来说, 评测基准分为以下 4 类:

• **English.** The English benchmarks contain multi-subject multiple-choice task and language understanding and reading comprehension task. Multi-subject multiple-choice include MMLU Hendrycks et al. [2020], MMLU-Pro Wang et al. [2024], MMLU-Redux Gema et al. [2024]. Language understanding and reading comprehension include BBH Suzgun et al. [2022], HellaSwag Zellers et al. [2019], PIQA Bisk et al. [2020], ARC challenge Clark et al. [2018], WinoGrande Sakaguchi et al. [2021], RACE-Middle and RACE-High Lai et al. [2017].

• **英文.** 英文基准包括多学科选择题任务和语言理解与阅读理解任务. 多学科选择题包括 MMLU (Hendrycks et al. [2020]), MMLU-Pro (Wang et al. [2024]), MMLU-Redux (Gema et al. [2024]). 语言理解与阅读理解包括 BBH (Suzgun et al. [2022]), HellaSwag (Zellers et al. [2019]), PIQA (Bisk et al. [2020]), ARC challenge (Clark et al. [2018]), WinoGrande (Sakaguchi et al. [2021]), RACE-Middle 和 RACE-High (Lai et al. [2017]).

• **Chinese.** The datasets include C-Eval Huang et al. [2023], and CMMLU Li et al. [2023b]

• **中文.** 数据集包括 C-Eval (Huang et al. [2023]) 和 CMMLU (Li et al. [2023b]).

• **Math.** The datasets include GSM8K Cobbe et al. [2021] and MATH Hendrycks et al. [2021]

• **数学.** 数据集包括 GSM8K (Cobbe et al. [2021]) 和 MATH (Hendrycks et al. [2021]).

• **Code.** The datasets include HumanEval Chen et al. [2021], MBPP Austin et al. [2021] and CRUXEval-I and CRUXEval-O Gu et al. [2024].

• **代码.** 数据集包括 HumanEval (Chen et al. [2021]), MBPP (Austin et al. [2021]) 以及 CRUXEval-I 和 CRUXEval-O (Gu et al. [2024]).

## 5.1.2 Benchmarks Optimization (评测基准的优化)

The evaluation of base LLM models suffer from 2 critical problems:

基座 LLM 的评测存在 2 个关键问题:

<!-- page 22 of 34 -->

![Image block](images/p22-figure-17-an-example-of-optimized-prompt-for-code-task.png)

Figure 17: An example of optimized prompt for code task.

图 17: 代码任务优化后 prompt 的一个示例.

![Chart block](images/p22-chart.png)

![Chart block](images/p22-chart-2.png)

![Chart block](images/p22-chart-3.png)

![Chart block](images/p22-figure-18-comparisons-on-improved-benchmarks-and.png)

Figure 18: Comparisons on improved benchmarks and original benchmarks.

图 18: 改进后的基准与原始基准的对比. 上面三张没有单独图题的 chart 与这张同属 Figure 18.

• **Instability in early stage.** Evaluation metrics such as perplexity play an important role in helping us monitor the training of LLM. However, in the early stages of base model pre-training, the model, due to its weak capabilities, shows low differentiation in predicting options in perplexity-based evaluations. This leads to fluctuating evaluation results throughout the training process, making it inadequate for monitoring training effectiveness.

• **训练早期不稳定.** 困惑度等评测指标在帮助我们监控 LLM 训练方面很重要. 但在基座模型预训练早期, 模型能力弱, 在基于困惑度的评测中对各选项的预测区分度低. 这导致评测结果在整个训练过程中波动, 不足以监控训练效果.

• **Lack of instruction-following.** Since the base model lacks instruction-following capabilities, the poor adherence to the answering process or result format negatively affects the evaluation scores, thus failing to accurately reflect the model’s true abilities, especially on generation-based evaluation tasks.

• **缺乏指令遵循.** 基座模型没有指令遵循能力, 对答题流程或结果格式遵守得差, 会拉低评测分数, 无法准确反映模型的真实能力, 在基于生成的评测任务上尤其如此.

To tackle the two problems with evaluating base LLM models, we optimize the existing evaluation methods for perplexity-based and generation-based evaluations, to provide results that better match the model’s true capability, and increase evaluation stability on LLM.

为解决评测基座 LLM 的这两个问题, 我们优化了现有的基于困惑度和基于生成的评测方法, 让结果更贴近模型的真实能力, 并提高 LLM 评测的稳定性.

**Optimize Perplexity-Based Evaluation.** To better adapt to the base model’s continuation, we change the prediction target from option labels to option content, increasing the differentiation of predictions for each option and improving the trend of capability growth throughout the pre-training process. Details on the optimizations of the above evaluation methods can be found in our corresponding work Luan et al. [2025].

**优化基于困惑度的评测.** 为更好地适配基座模型的续写方式, 我们把预测目标从选项标签改为选项内容, 提高对各选项预测的区分度, 让整个预训练过程中的能力增长趋势更清晰. 这些评测方法优化的细节见我们的相应工作 (Luan et al. [2025]).

**Optimize Generation-Based Evaluation.** To mitigate the impact of the Base model’s variable instruction-following capabilities, we optimize the prompt templates to guide its continuation in answering questions. By adding few-shot implicit guidance for reasoning and adherence to format, and configuring stopping criteria to timely conclude reasoning, we improve the effectiveness of question responses, making the evaluation results to better reflect the model’s true ability. Taking existing evaluation datasets for Math (e.g., GSM8K and MATH) and Code (e.g., HumanEval, MBPP, and CRUXE) for example:

**优化基于生成的评测.** 为减轻基座模型指令遵循能力不稳定的影响, 我们优化 prompt 模板, 引导它通过续写来答题. 通过加入针对推理和格式遵守的 few-shot 隐式引导, 并配置停止条件及时结束推理, 我们提高了答题的有效性, 让评测结果更能反映模型的真实能力. 以数学 (例如 GSM8K 和 MATH) 和代码 (例如 HumanEval, MBPP 和 CRUXE) 的现有评测集为例:

• **Math benchmark.** To better evaluate the capabilities of the base model, we propose several key modifications: providing refined few-shot examples, constructing lightweight prompt templates, and introducing an early

• **数学基准.** 为更好地评估基座模型的能力, 我们提出几项关键修改: 提供精炼的 few-shot 示例, 构建轻量的 prompt 模板, 并引入一种提前 (句子接下页)

<!-- page 23 of 34 -->

![Image block](images/p23-figure-19-illustration-on-the-process-of-using.png)

Figure 19: Illustration on the process of using evaluations to guide training process.

图 19: 用评测指导训练过程的流程示意图.

stopping mechanism. These improvements can assess the mathematical reasoning capabilities of the base model with more precision.

停止机制. 这些改进能更精确地评估基座模型的数学推理能力.

• **Code benchmark.** We observe that in code tasks, the evaluation of the base model confront two problems: (1) The base model does not understand the actual task requirements. For example, Qwen2-7B-Base do not perform the actual code completion task for 12.19% of the data in the Humaneval dataset; (2) Since the base model has not aligned with human preferences, it cannot engage in an effective dialogue. Its relatively weak instruction-following capability leads to issues such as truncation and overshooting during the post-processing of code extraction.

• **代码基准.** 我们观察到, 在代码任务中, 基座模型的评测面临两个问题: (1) 基座模型不理解实际任务要求. 例如 Qwen2-7B-Base 在 Humaneval 数据集中有 12.19% 的数据没有执行真正的代码补全任务; (2) 基座模型没有与人类偏好对齐, 无法进行有效对话. 它较弱的指令遵循能力导致在抽取代码的后处理中出现截断和越界等问题.

To address above two issues, we design corresponding solutions: 1) Clearly specify task requirements in the prompt. This enables the base model to clearly understand tasks such as selecting the correct option, calculating the correct answer, or completing the correct code. 2) Provide appropriate prefixes for base model evaluations, this assist the base model in generating the correct continuation and help improve the post-processing extraction of LLM outputs. In Figure 17 we present an example of our optimized prompt for code task, adding specification and prefixes to original prompt.

针对这两个问题, 我们设计了对应的解决方案: 1) 在 prompt 中明确说明任务要求. 这让基座模型清楚地理解任务, 例如选出正确选项, 算出正确答案或补全正确的代码. 2) 为基座模型评测提供合适的前缀, 帮助基座模型生成正确的续写, 并改善对 LLM 输出的后处理抽取. Figure 17 给出了代码任务优化后 prompt 的一个示例, 在原始 prompt 上加了任务说明和前缀.

**Applications in LLM Base Model Training.** To demonstrate the effectiveness of our improved evaluation methods, we compare the changes in evaluation metrics during the early stages of pre-training on several small models under 5B parameters consisting 0.96B, 2.07B and 4.14B models, using our improved benchmarks and the original benchmarks. As shown in Figure 18, our improvements in evaluation stability effectively reduce fluctuations in evaluation metrics on the knowledge benchmark MMLU-Pro, and the math benchmark GSM8K, reflecting the stable change in model capabilities as training progresses.

**在 LLM 基座模型训练中的应用.** 为证明改进后评测方法的有效性, 我们在几个 5B 参数以下的小模型上 (0.96B, 2.07B 和 4.14B), 比较预训练早期评测指标在改进后基准和原始基准上的变化. 如 Figure 18 所示, 我们在评测稳定性上的改进, 有效减小了知识基准 MMLU-Pro 和数学基准 GSM8K 上评测指标的波动, 反映出模型能力随训练推进而平稳变化.

Our optimizations on perplexity-based evaluation and generation-based evaluation, are implemented in the evaluation of both Ling models and other baselines, i.e. DeepSeek, Qwen, LLaMA and Mistral models. These optimizations can accurately assess the model’s performance in the early stages of training, being used in many application scenarios: providing basis for data ablation experiments, verify the effectiveness of new computing clusters for model training, and facilitate comparisons of training consistency across different computing clusters.

我们对基于困惑度和基于生成的评测所做的优化, 同时用于 Ling 模型和其他基线 (即 DeepSeek, Qwen, LLaMA 和 Mistral 模型) 的评测. 这些优化能在训练早期准确评估模型表现, 用于许多场景: 为数据消融实验提供依据, 验证新计算集群用于模型训练的有效性, 以及方便比较不同计算集群之间训练的一致性.

**Linking Evaluations to Training.** In addition to accurately measuring the model’s performance via above optimizations on the evaluation benchmarks, we hope that evaluations of LLM can also help identify issues in the training process, such as problems with the training data. During the evaluation process, we observe that abnormal evaluation results might emerge after the model consumes a certain segment of tokens. This is typically due to problematic data within that segment of training tokens. To identify the reason of such issues and provide real-time feedback for adjustments in the training strategy or training data, we further re-define the ability dimensions corresponding to each evaluation sample within the evaluation benchmark. Simultaneously, we assign the same ability dimensions to the training corpus, enabling the mapping of evaluation results to the training data. This allows us to effectively pinpoint which part of data encounter issues during the training process. We present this whole process in Figure 19.

**把评测与训练关联起来.** 除了通过上述对评测基准的优化准确衡量模型表现, 我们还希望 LLM 评测能帮助发现训练过程中的问题, 例如训练数据的问题. 在评测过程中我们观察到, 模型消耗某一段 token 之后, 可能出现异常的评测结果. 这通常是那段训练 token 里有问题数据造成的. 为找出这类问题的原因, 实时反馈以调整训练策略或训练数据, 我们进一步重新定义了评测基准中每个评测样本对应的能力维度. 同时给训练语料打上相同的能力维度, 这样就能把评测结果映射到训练数据. 这让我们能有效定位训练过程中哪部分数据出了问题. 整个流程见 Figure 19.

<!-- page 24 of 34 -->

Table 5: Comparison between Ling-Lite-Base model and other representative models.

表 5: Ling-Lite-Base 模型与其他代表性模型的对比.

| Benchmark(Metric) | #shots | Ling-Lite -Base | Qwen2.5-7B | LLaMA-3.1-8B | Mistral-7B-v0.3 |
| --- | --- | --- | --- | --- | --- |
| BBH(EM) | 3 | 67.38 | 69.07 | 64.02 | 56.12 |
| MMLU(EM) | 5 | 70.88 | 75.50 | 66.61 | 63.45 |
| MMLU-Redux(EM) | 5 | 65.67 | 70.70 | 60.84 | 58.35 |
| MMLU-Pro(EM) | 5 | 41.47 | 47.60 | 36.72 | 31.47 |
| ARC-Challenge(EM) | 0 | 87.46 | 91.86 | 81.02 | 72.20 |
| English |  |  |  |  |  |
| WinoGrande(EM) | 5 | 74.58 | 75.61 | 77.51 | 77.58 |
| HellaSwag(EM) | 0 | 73.65 | 73.46 | 74.60 | 75.77 |
| RACE-Middle(EM) | 0 | 89.07 | 91.09 | 90.81 | 71.93 |
| RACE-High(EM) | 0 | 86.05 | 88.05 | 87.56 | 71.12 |
| PIQA(EM) | 0 | 78.89 | 79.82 | 80.79 | 81.01 |
| HumanEval(Pass@1) | 0 | 78.66 | 75.00 | 43.97 | 29.88 |
| MBPP(Pass@1) | 3 | 60.80 | 62.80 | 45.60 | 46.60 |
| Code |  |  |  |  |  |
| CRUXEval-I(EM) | 1 | 44.38 | 51.38 | 40.88 | 44.00 |
| CRUXEval-O(EM) | 1 | 44.50 | 48.38 | 36.50 | 34.62 |
| GSM8K(EM) | 4 | 79.68 | 82.71 | 56.56 | 45.94 |
| Math |  |  |  |  |  |
| MATH(EM) | 4 | 47.48 | 49.42 | 16.94 | 11.26 |
| C-Eval(EM) | 5 | 79.33 | 81.14 | 51.50 | 45.86 |
| Chinese |  |  |  |  |  |
| CMMLU(EM) | 5 | 80.08 | 81.66 | 52.32 | 44.29 |

Table 6: Comparison between Ling-Plus-Base model and other representative models.

表 6: Ling-Plus-Base 模型与其他代表性模型的对比.

| Benchmark(Metric) | #shots | Ling-Plus -Base | DeepSeek-V2-Base | Qwen2.5-72B-Base | LLaMA-3.1-70B-Base |
| --- | --- | --- | --- | --- | --- |
| BBH(EM) | 3 | 81.95 | 78.60 | 83.80 | 80.88 |
| MMLU(EM) | 5 | 81.84 | 79.16 | 86.30 | 79.15 |
| MMLU-Redux(EM) | 5 | 78.47 | 74.69 | 83.29 | 74.41 |
| MMLU-Pro(EM) | 5 | 55.18 | 54.17 | 61.40 | 51.42 |
| ARC-Challenge(EM) | 0 | 92.88 | 90.51 | 96.30 | 91.17 |
| English |  |  |  |  |  |
| WinoGrande(EM) | 5 | 77.98 | 84.06 | 81.85 | 84.93 |
| HellaSwag(EM) | 0 | 77.61 | 80.45 | 80.30 | 79.85 |
| RACE-Middle(EM) | 0 | 94.15 | 92.41 | 96.20 | 92.48 |
| RACE-High(EM) | 0 | 92.11 | 90.02 | 93.90 | 88.34 |
| PIQA(EM) | 0 | 80.09 | 83.35 | 83.80 | 84.06 |
| HumanEval (Pass@1) | 0 | 84.76 | 63.41 | 81.70 | 56.10 |
| MBPP(Pass@1) | 3 | 71.40 | 66.80 | 76.40 | 66.20 |
| Code |  |  |  |  |  |
| CRUXEval-I(EM) | 1 | 64.38 | 56.62 | 60.00 | 55.38 |
| CRUXEval-O(EM) | 1 | 63.75 | 58.75 | 66.12 | 60.62 |
| GSM8K(EM) | 4 | 88.55 | 83.78 | 89.69 | 83.62 |
| Math |  |  |  |  |  |
| MATH(EM) | 4 | 56.96 | 43.60 | 60.72 | 41.76 |
| C-Eval(EM) | 5 | 90.93 | 82.16 | 88.40 | 68.60 |
| Chinese |  |  |  |  |  |
| CMMLU(EM) | 5 | 88.56 | 83.01 | 89.50 | 68.84 |

<!-- page 25 of 34 -->

## 5.1.3 Compared Baselines (对比基线)

We release two models of different parameter scales, namely the Ling-Plus model and the Ling-Lite model, and evaluate their performance by comparing them against state-of-the-art open-source models of similar parameter scales, which serve as our baselines. Specifically, the Ling-Plus-Base model is compared with DeepSeek-V2.5, Qwen2.5-72B, and LLaMA-3.1-70B. For Ling-Lite-Base model, we use Qwen2.5-7B, LLaMA-3.1-8B, and Mistral-7B as baselines for its evaluation. The detailed experimental results are listed in Tables 5 and 6.

我们发布了两个不同参数规模的模型, 即 Ling-Plus 和 Ling-Lite, 并与参数规模相近的最先进开源模型对比来评估它们的表现, 这些开源模型作为基线. 具体来说, Ling-Plus-Base 与 DeepSeek-V2.5, Qwen2.5-72B 和 LLaMA-3.1-70B 对比. Ling-Lite-Base 以 Qwen2.5-7B, LLaMA-3.1-8B 和 Mistral-7B 为基线. 详细实验结果见 Table 5 和 Table 6.

> **看表:** 第 5.1.3 节说 Ling-Plus-Base 的对比对象是 「DeepSeek-V2.5」, Table 6 的表头写的是什么?
> Table 6 的列名是 「DeepSeek-V2-Base」, 第 5.1.4 节的分析文字也一直写 DeepSeek-V2-Base. 基座对比实际用的是 V2 的 base 模型, 第 5.1.3 节的 「V2.5」 与表头不一致. 到了对话模型对比, Table 8 用的才是 「DeepSeek-V2.5-1210-Chat」. 读 Table 6 以表头为准. Ling-Lite-Base 这一组没有这个问题, Table 5 的三列 Qwen2.5-7B, LLaMA-3.1-8B, Mistral-7B-v0.3 与正文一致.

For the evaluation process, we adopt metrics consistent with prior work such as DeepSeek-V2.5 and LLaMA-3.1. Perplexity-based evaluation is employed for datasets including MMLU, MMLU-Redux, MMLU-Pro, HellaSwag, PIQA, WinoGrande, RACE-Middle, RACE-High, ARC-Challenge, C-Eval, and CMMLU. Additionally, generation-based evaluation is used for tasks involving HumanEval, MBPP, CRUXEval, MATH, GSM8K, and BBH.

评测过程中, 我们采用与 DeepSeek-V2.5 和 LLaMA-3.1 等已有工作一致的指标. MMLU, MMLU-Redux, MMLU-Pro, HellaSwag, PIQA, WinoGrande, RACE-Middle, RACE-High, ARC-Challenge, C-Eval 和 CMMLU 等数据集采用基于困惑度的评测. HumanEval, MBPP, CRUXEval, MATH, GSM8K 和 BBH 等任务采用基于生成的评测.

## 5.1.4 Result Analysis (结果分析)

We compare our Ling pre-trained models with other state-of-the-art open-source base models. All experiments are conducted using our internal evaluation framework, and we ensure that all models are assessed with same evaluation parameters. In all experiments, we set the temperature of the LLM to 0 and evaluate it in a single run.

我们把 Ling 预训练模型与其他最先进的开源基座模型对比. 所有实验都用我们的内部评测框架完成, 并保证所有模型使用相同的评测参数. 所有实验中, LLM 的温度设为 0, 只运行一次.

• **Ling-Lite.** Comparing our Ling-Lite pre-trained model with other leading 7B+ models. The overall performance of our Ling-Lite-Base model is very close to that of Qwen2.5-7B model, which achieves nearly the best performance across all dimensions we considered. In code and math benchmarks, the Ling-Lite-Base model outperforms Llama3.1-8B and Mistral-7B v0.3. Additionally, in chinese language benchmarks, both the Ling-Lite-Base and Qwen2.5-7B, which are Chinese open-source models, shows significantly higher scores compared to the other benchmark models.

• **Ling-Lite.** 把 Ling-Lite 预训练模型与其他领先的 7B+ 模型对比. Ling-Lite-Base 的整体表现与 Qwen2.5-7B 非常接近, 后者在我们考察的所有维度上几乎都是最好的. 在代码和数学基准上, Ling-Lite-Base 优于 Llama3.1-8B 和 Mistral-7B v0.3. 此外, 在中文基准上, 同为中国开源模型的 Ling-Lite-Base 和 Qwen2.5-7B, 分数明显高于其他对比模型.

• **Ling-Plus.** Comparing our Ling-Plus pre-trained model with other leading 70B+models. In the dimensions of code, math, and Chinese language, the overall performance of the Ling-Plus-Base is comparable to that of the Qwen2.5-72B, both models yield similar benchmark scores and higher than those of DeepSeek-V2-Base and Llama3.1-70B-Base. In English language benchmarks, the overall score of the Ling-Plus-Base model is slightly lower than that of Qwen2.5-72B-Base model, but still exceeds the scores of DeepSeek-V2-Base and Llama3.1-70B-Base. It is noteworthy that while Ling-Plus-Base outperforms DeepSeek-V2-Base, it is inferior to its 3.0 version, which currently represents the most advanced open-source model.

• **Ling-Plus.** 把 Ling-Plus 预训练模型与其他领先的 70B+ 模型对比. 在代码, 数学和中文三个维度上, Ling-Plus-Base 的整体表现与 Qwen2.5-72B 相当, 两者分数相近, 都高于 DeepSeek-V2-Base 和 Llama3.1-70B-Base. 在英文基准上, Ling-Plus-Base 的总分略低于 Qwen2.5-72B-Base, 但仍高于 DeepSeek-V2-Base 和 Llama3.1-70B-Base. 值得一提的是, Ling-Plus-Base 虽然优于 DeepSeek-V2-Base, 但不如它的 3.0 版本, 后者是目前最先进的开源模型.

## 5.2 Post-trained Language Model (后训练语言模型)

## 5.2.1 Evaluation Benchmarks (评测基准)

In addition to the benchmarks used for evaluating the base model, we introduce additional benchmarks to assess the capabilities of the instructed model in English and Chinese on language understanding and reading comprehension task, Code and Math task. Specifically, for English language datasets, we incorporate IFEvalZhou et al. [2023], GPQA-Diamond Rein et al. [2024], and SimpleQA OpenAI [2024b]; for Chinese language datasets, we add C-SimpleQA He et al. [2024]; for Code task, we use MultiPL-E Cassano et al. [2022] <sup>1</sup>and LiveCodeBench Jain et al. [2024]; for Math tasks, we add AIME MAA [2024].

除评测基座模型用到的基准外, 我们还引入更多基准, 评估指令模型在中英文语言理解与阅读理解任务, 代码和数学任务上的能力. 具体来说, 英文数据集加入 IFEval (Zhou et al. [2023]), GPQA-Diamond (Rein et al. [2024]) 和 SimpleQA (OpenAI [2024b]); 中文数据集加入 C-SimpleQA (He et al. [2024]); 代码任务使用 MultiPL-E (Cassano et al. [2022]) (见脚注 1) 和 LiveCodeBench (Jain et al. [2024]); 数学任务加入 AIME (MAA [2024]).

Additionally, to further explore the capability of the model serving as agents, and simulate the real-world applications, we supplement 2 categories of benchmarks focusing on tool use task and open-ended generation task, to further evaluate the chat model’s ability. The tool use benchmarks include BFCL Yan et al. [2024], Nexus Srinivasan et al. [2023] and T-eval Chen et al. [2023], and the open-ended generation use Arena-Hard Li et al. [2024].

此外, 为进一步考察模型作为智能体的能力, 模拟真实应用, 我们补充了 2 类基准, 分别针对工具使用任务和开放式生成任务, 进一步评估对话模型的能力. 工具使用基准包括 BFCL (Yan et al. [2024]), Nexus (Srinivasan et al. [2023]) 和 T-eval (Chen et al. [2023]), 开放式生成使用 Arena-Hard (Li et al. [2024]).

## 5.2.2 Baseline Comparison (基线对比)

Similar to the baselines used for evaluating the base model, for chat models with different parameter scales, we adopt instructed models of corresponding scales as baselines. We compare the Ling-Lite model to Qwen2.5-7B-Instruct, Llama3.1-8B-Instruct and Mistral-7B-v0.3-Instruct in Table 7. We compare our Ling-Plus model to DeepSeek-V2.5- Chat, Qwen2.5-72B-Instruct and Llama3.1-70B-Instruct in Table 8.

与评测基座模型时的基线类似, 对不同参数规模的对话模型, 我们采用相应规模的指令模型作为基线. Table 7 把 Ling-Lite 与 Qwen2.5-7B-Instruct, Llama3.1-8B-Instruct 和 Mistral-7B-v0.3-Instruct 对比. Table 8 把 Ling-Plus 与 DeepSeek-V2.5-Chat, Qwen2.5-72B-Instruct 和 Llama3.1-70B-Instruct 对比.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Excluding C#, due to the coding environment.</span></small>

脚注 1: 由于代码环境的原因, 不含 C#.

<!-- page 26 of 34 -->

Table 7: Comparison between Ling-Lite model and other representative models.

表 7: Ling-Lite 模型与其他代表性模型的对比.

<table><tr><td colspan="2">Benchmark (Metric)</td><td>Ling-Lite</td><td>Qwen2.5-7B-Instruct</td><td>Llama3.1-8B-Instruct</td><td>Mistral-7B-v0.3-Instruct</td></tr><tr><td rowspan="7">English</td><td>MMLU (EM)</td><td>71.27</td><td>74.26</td><td>68.67</td><td>61.45</td></tr><tr><td>MMLU-Redux (EM)</td><td>70.35</td><td>75.37</td><td>67.20</td><td>35.72</td></tr><tr><td>MMLU-Pro (EM)</td><td>49.19</td><td>55.98</td><td>47.93</td><td>18.54</td></tr><tr><td>IFEval (Prompt Strict)</td><td>77.99</td><td>71.16</td><td>73.01</td><td>53.45</td></tr><tr><td>GPQA (Pass@1)</td><td>28.66</td><td>34.47</td><td>32.80</td><td>25.63</td></tr><tr><td>ARC-Challenge (EM)</td><td>85.08</td><td>89.15</td><td>81.69</td><td>78.98</td></tr><tr><td>SimpleQA (Correct)</td><td>4.35</td><td>5.38</td><td>15.58</td><td>4.32</td></tr><tr><td rowspan="4">Code</td><td>MultiPL-E (Pass@1)</td><td>65.78</td><td>63.11</td><td>51.66</td><td>26.27</td></tr><tr><td>HumanEval (Pass@1)</td><td>83.54</td><td>87.20</td><td>70.73</td><td>38.41</td></tr><tr><td>MBPP (Pass@1)</td><td>64.80</td><td>61.80</td><td>59.00</td><td>40.00</td></tr><tr><td>LiveCodeBench (Pass@1)</td><td>15.18</td><td>16.96</td><td>11.61</td><td>8.97</td></tr><tr><td rowspan="4">Math</td><td>GSM8K (EM)</td><td>86.88</td><td>90.60</td><td>83.02</td><td>58.61</td></tr><tr><td>MATH-zero-shot (EM)</td><td>72.80</td><td>73.66</td><td>52.42</td><td>13.66</td></tr><tr><td>MATH-few-shot (EM)</td><td>71.52</td><td>72.86</td><td>31.76</td><td>12.42</td></tr><tr><td>AIME-2024 (Pass@1)</td><td>6.67</td><td>16.67</td><td>0.00</td><td>0.00</td></tr><tr><td rowspan="3">Tool Use</td><td>BFCL-v2 (Acc)</td><td>67.92</td><td>65.84</td><td>49.98</td><td>58.42</td></tr><tr><td>Nexus (Acc)</td><td>34.77</td><td>31.88</td><td>38.19</td><td>28.70</td></tr><tr><td>T-eval (Acc)</td><td>85.58</td><td>76.64</td><td>81.99</td><td>75.30</td></tr><tr><td rowspan="3">Chinese</td><td>C-Eval (EM)</td><td>73.63</td><td>78.00</td><td>53.34</td><td>43.78</td></tr><tr><td>CMMLU (EM)</td><td>72.95</td><td>78.89</td><td>53.33</td><td>42.51</td></tr><tr><td>C-SimpleQA (Correct)</td><td>26.07</td><td>29.63</td><td>18.94</td><td>14.10</td></tr><tr><td>Open Ended</td><td>Arena-Hard</td><td>42.09</td><td>49.20</td><td>26.94</td><td>23.47</td></tr></table>

## 5.2.3 Result Analysis (结果分析)

Comparing the Ling-Plus model and the Ling-Lite model to the baselines, considering 5 tasks including Language understanding and reading comprehension (both English and Chinese), Code, Math, Tool use and Open-ended Generation, we have the following findings:

把 Ling-Plus 和 Ling-Lite 与基线对比, 考察 5 类任务: 语言理解与阅读理解 (中英文), 代码, 数学, 工具使用和开放式生成, 得到以下发现:

**English & Chinese language understanding.** MMLU is a widely used LLM benchmark across knowledge domains and tasks. The Ling-Lite demonstrates performance comparable to Qwen2.5-7B-Instruct, while outperforming Llama3.1-8B-Instruct and Mistral-7B-v0.3-Instruct. Ling-Plus achieve performance comparable to DeepSeek-V2.5-Chat and Qwen2.5-72B-Instruct. On GPQA dataset, Ling-Plus is comparable to DeepSeek-V2.5 and Ling-Lite is comparable to Mistral-7B-v0.3. On the instruction-following benchmark IFEval, Ling-Lite achieves the best performance compared to other small-size baselines, and Ling-Plus is also comparable to other large-size baseline models. ARC-challange is a more difficult subset of ARC. Both our Lite and Plus models maintain performance comparable to other baselines. On the factual knowledge benchmark SimpleQA, all models exhibit relatively poor performance, our Ling-Plus has a similar performance compared to DeepSeek-V2.5.

**中英文语言理解.** MMLU 是一个覆盖多个知识领域和任务的常用 LLM 基准. Ling-Lite 的表现与 Qwen2.5-7B-Instruct 相当, 优于 Llama3.1-8B-Instruct 和 Mistral-7B-v0.3-Instruct. Ling-Plus 的表现与 DeepSeek-V2.5-Chat 和 Qwen2.5-72B-Instruct 相当. 在 GPQA 数据集上, Ling-Plus 与 DeepSeek-V2.5 相当, Ling-Lite 与 Mistral-7B-v0.3 相当. 在指令遵循基准 IFEval 上, Ling-Lite 在小尺寸基线中表现最好, Ling-Plus 也与其他大尺寸基线模型相当. ARC-challenge 是 ARC 中较难的子集, Lite 和 Plus 两个模型都与其他基线保持相当的水平. 在事实知识基准 SimpleQA 上, 所有模型表现都比较差, Ling-Plus 与 DeepSeek-V2.5 表现相近.

On Chinese benchmarks, as Qwen, Deepseek and our Ling model are trained with more Chinese language data, they demonstrate significantly superior performance compared to Llama and Mistral. Both our Lite and Plus performs slightly better than Deepseek, and is comparable to Qwen on CEval and CMMLU, while Deepseek performs better on C-SimpleQA.

在中文基准上, Qwen, Deepseek 和 Ling 模型用了更多中文数据训练, 表现明显优于 Llama 和 Mistral. Lite 和 Plus 在 CEval 和 CMMLU 上都略好于 Deepseek, 与 Qwen 相当, 而 Deepseek 在 C-SimpleQA 上表现更好.

• **Math & code.** On math and code benchmarks, Ling-Lite demonstrates performance comparable to Qwen2.5-7B, while both Qwen and Ling-Lite outperforms Llama3.1-8B and Mistral-7B-v0.3. Ling-Plus model exhibits performance better than DeepSeek-V2.5, closely approximating Qwen2.5-72B.

• **数学与代码.** 在数学和代码基准上, Ling-Lite 的表现与 Qwen2.5-7B 相当, Qwen 和 Ling-Lite 都优于 Llama3.1-8B 和 Mistral-7B-v0.3. Ling-Plus 的表现优于 DeepSeek-V2.5, 接近 Qwen2.5-72B.

• **Tool use**. Tool use is an important and challenging task for LLMs. The tool use capability enables LLMs to work as agents, control robotic system and integrate with many software tools. Compared with other baseline models, in most cases, both our Ling-Plus and Ling-Lite achieve the best performance on tool use benchmarks, especially on BFCL-v2 and T-eval. On the Nexus dataset, our model achieve comparable performance to other baselines, with 4 points lower than Llama3.1-8B. As an open-source model, we hope our Ling models,

• **工具使用.** 工具使用是 LLM 一项重要而有挑战的任务. 工具使用能力让 LLM 能充当智能体, 控制机器人系统, 并与许多软件工具集成. 与其他基线模型相比, 多数情况下 Ling-Plus 和 Ling-Lite 在工具使用基准上都取得最好表现, 在 BFCL-v2 和 T-eval 上尤其明显. 在 Nexus 数据集上, 我们的模型与其他基线表现相当, 比 Llama3.1-8B 低 4 分. 作为开源模型, 我们希望 Ling 模型, (句子接下页)

> **对一下:** 第 5.2.3 节说 Nexus 上 「4 points lower than Llama3.1-8B」. Table 7 里差多少?
> Table 7 中 Ling-Lite 的 Nexus (Acc) 是 34.77, Llama3.1-8B-Instruct 是 38.19, 差 3.42 分, 文字里的 「4 points」 偏大. 大模型那边, Table 8 里 Ling-Plus 为 50.10 (Device-A) 和 50.09 (Device-D), Llama3.1-70B-Instruct 为 52.07, 差约 2 分. 工具使用的另两项里 Lite 都是同组最高: BFCL-v2 上 67.92 对 Qwen2.5-7B-Instruct 的 65.84, T-eval 上 85.58 对 Llama3.1-8B-Instruct 的 81.99.

<!-- page 27 of 34 -->

Table 8: Comparison between Ling-Plus and other representative models.

表 8: Ling-Plus 与其他代表性模型的对比.

<table><tr><td colspan="2">Benchmark (Metric)</td><td>Ling-Plus (Device-A accelerator)</td><td>Ling-Plus (Device-D accelerator)</td><td>DeepSeek-V2.5 -1210-Chat</td><td>Qwen2.5-72B-Instruct</td><td>Llama3.1-70B-Instruct</td><td>GPT4o-0806</td></tr><tr><td rowspan="7">English</td><td>MMLU (EM)</td><td>82.33</td><td>82.52</td><td>80.74</td><td>84.30</td><td>81.68</td><td>86.46</td></tr><tr><td>MMLU-Redux (EM)</td><td>83.90</td><td>83.95</td><td>81.25</td><td>85.56</td><td>80.48</td><td>88.00</td></tr><tr><td>MMLU-Pro (EM)</td><td>67.57</td><td>67.92</td><td>64.47</td><td>70.77</td><td>66.94</td><td>74.83</td></tr><tr><td>IFEval (Prompt Strict)</td><td>83.73</td><td>85.65</td><td>79.67</td><td>82.44</td><td>82.44</td><td>86.17</td></tr><tr><td>GPQA (Pass@1)</td><td>43.81</td><td>42.55</td><td>41.67</td><td>47.98</td><td>42.42</td><td>52.53</td></tr><tr><td>ARC-Challenge (EM)</td><td>93.90</td><td>94.24</td><td>92.88</td><td>95.25</td><td>93.22</td><td>95.25</td></tr><tr><td>SimpleQA (Correct)</td><td>11.86</td><td>11.93</td><td>10.91</td><td>12.31</td><td>10.10</td><td>40.07</td></tr><tr><td rowspan="4">Code</td><td>MultiPL-E (Pass@1)</td><td>69.79</td><td>69.39</td><td>71.04</td><td>69.08</td><td>61.32</td><td>69.97</td></tr><tr><td>HumanEval (Pass@1)</td><td>90.24</td><td>89.02</td><td>88.41</td><td>88.41</td><td>79.88</td><td>91.46</td></tr><tr><td>MBPP (Pass@1)</td><td>76.60</td><td>76.60</td><td>78.80</td><td>78.40</td><td>72.80</td><td>80.20</td></tr><tr><td>LiveCodeBench (Pass@1)</td><td>26.79</td><td>25.89</td><td>31.25</td><td>26.79</td><td>12.50</td><td>34.20</td></tr><tr><td rowspan="4">Math</td><td>GSM8K (EM)</td><td>94.47</td><td>94.16</td><td>90.67</td><td>93.40</td><td>92.12</td><td>96.21</td></tr><tr><td>MATH-zero-shot (EM)</td><td>78.82</td><td>78.76</td><td>76.94</td><td>81.14</td><td>57.86</td><td>77.94</td></tr><tr><td>MATH-few-shot (EM)</td><td>78.63</td><td>78.57</td><td>74.39</td><td>80.46</td><td>52.46</td><td>75.34</td></tr><tr><td>AIME-2024 (Pass@1)</td><td>33.33</td><td>26.67</td><td>23.33</td><td>20.00</td><td>23.33</td><td>20.00</td></tr><tr><td rowspan="3">Tool Use</td><td>BFCL-v2 (Acc)</td><td>74.90</td><td>75.65</td><td>58.24</td><td>73.39</td><td>60.51</td><td>62.19</td></tr><tr><td>Nexus (Acc)</td><td>50.10</td><td>50.09</td><td>45.75</td><td>51.99</td><td>52.07</td><td>51.55</td></tr><tr><td>T-eval (Acc)</td><td>89.25</td><td>89.14</td><td>75.37</td><td>87.62</td><td>86.29</td><td>88.44</td></tr><tr><td rowspan="3">Chinese</td><td>C-Eval (EM)</td><td>86.87</td><td>86.55</td><td>82.25</td><td>88.02</td><td>68.25</td><td>77.29</td></tr><tr><td>CMMLU (EM)</td><td>86.59</td><td>86.49</td><td>81.19</td><td>87.44</td><td>70.92</td><td>80.04</td></tr><tr><td>C-SimpleQA (Correct)</td><td>51.77</td><td>52.13</td><td>57.40</td><td>50.93</td><td>40.69</td><td>61.43</td></tr><tr><td>Open Ended</td><td>Arena-Hard</td><td>74.25</td><td>74.56</td><td>77.92</td><td>78.98</td><td>58.46</td><td>80.40</td></tr></table>

Table 9: Safety performance comparison between Ling-Lite model and other baseline models.

表 9: Ling-Lite 模型与其他基线模型的安全表现对比 (表题原文如此, 表内数据列实际是 Ling-Plus).

| Benchmark | Ling-Plus | DeepSeek-V2.5-1210-Chat | Qwen2.5-72B-Instruct | Llama3.1-70B-Instruct |
| --- | --- | --- | --- | --- |
| Arena Safety | 89.50 | 75.50 | 92.50 | 80.50 |
| safety |  |  |  |  |
| Cvalues | 96.09 | 96.26 | 96.26 | 93.52 |
| Xstest | 98.40 | 97.20 | 98.80 | 100.00 |
| false refusal |  |  |  |  |
| Orbench-Hard-1k | 90.24 | 91.96 | 77.15 | 60.11 |
| average score | 93.56 | 90.23 | 91.18 | 83.53 |

> **核对:** Table 9 的表题写 「between Ling-Lite model and other baseline models」, 表里是哪个模型?
> 表头第一列数据是 Ling-Plus, 对比对象 DeepSeek-V2.5-1210-Chat, Qwen2.5-72B-Instruct, Llama3.1-70B-Instruct 也都是大模型, 第 5.3.2 节的分析同样只谈 Ling-Plus. 表题里的 「Ling-Lite」 与内容不符, 本文没有给出 Ling-Lite 的安全分数. 平均分可以复算: Ling-Plus 为 (89.50 + 96.09 + 98.40 + 90.24)/4 ≈ 93.56, 与表中一致.

including Ling-Plus and Ling-Light, can provide some insights for the community, facilitating the deployment of LLMs as agents capable of handling more complex tasks.

包括 Ling-Plus 和 Ling-Light (原文拼写如此, 指 Ling-Lite), 能为社区提供一些启发, 推动把 LLM 部署为能处理更复杂任务的智能体.

Furthermore, we observe that using few-shot prompts, can have negative impacts on the model’s performance. On MATH benchmark, the zero-shot version demonstrate significantly superior performance compared to few-shot version. This suggests that caution should be exercised when employing the few-shot setting with instruct models, on Math tasks.

此外, 我们观察到使用 few-shot prompt 可能对模型表现产生负面影响. 在 MATH 基准上, zero-shot 版本的表现明显优于 few-shot 版本. 这说明在数学任务上对指令模型使用 few-shot 设置时应当谨慎.

• **Open-ended generation.** On open-ended benchmark Arena-Hard, which consists of difficult code and mathematical problems, our Ling-Lite model outperforms Llama3.1-8B and Mistral-7B-v0.3, and our Ling-Plus model demonstrates comparable performance to DeepSeek-V2.5.

• **开放式生成.** 在开放式基准 Arena-Hard (由较难的代码和数学问题组成) 上, Ling-Lite 优于 Llama3.1-8B 和 Mistral-7B-v0.3, Ling-Plus 的表现与 DeepSeek-V2.5 相当.

• **Consistency on different AI accelerator.** Last but not least, we compare the performance of Ling-Plus model using different AI accelerators, i.e., Device-A AI accelerator and Device-D AI accelerator, on various benchmarks. As shown in Table 8, the Ling-Plus model achieve almost identical results on each benchmark regardless of which AI accelerator is used.

• **不同 AI 加速器上的一致性.** 最后, 我们比较了 Ling-Plus 模型在不同 AI 加速器, 即 Device-A 和 Device-D 上, 在各基准上的表现. 如 Table 8 所示, 无论使用哪种 AI 加速器, Ling-Plus 在每个基准上的结果几乎相同.

<!-- page 28 of 34 -->

## 5.3 Safety (安全)

## 5.3.1 Evaluation Benchamarks (评测基准)

In addition to evaluating Ling models ability on various evaluation benchmarks, we also assess the models’ safety performance. Two evaluation datasets are constructed from the open-sourced data: 1) Arena Safety is constructed by randomly sampling 803 questions from a subset of lmsys-chat-1m Zheng et al. [2023] which is identified as risk by OpenAI moderation API Markov et al. [2023], and the responses are evaluated by Llama-Guard3 PurpleLlama [2024]; 2) Cvalues Xu et al. [2023] uses 1711 multiple-choice questions to assess responsibility in a chinese context.

除了在各种评测基准上评估 Ling 模型的能力, 我们还评估了模型的安全表现. 我们用开源数据构建了两个评测集: 1) Arena Safety: 从 lmsys-chat-1m (Zheng et al. [2023]) 中被 OpenAI moderation API (Markov et al. [2023]) 标为有风险的子集里随机抽取 803 个问题, 回答由 Llama-Guard3 (PurpleLlama [2024]) 评判; 2) Cvalues (Xu et al. [2023]) 用 1711 道选择题评估中文语境下的责任感.

Moreover, previous work Röttger et al. [2023] found that improving LLM’s harmlessness can lead to a decrease in helpfulness. To balance this trade-off, we additionally introduce two over-refusal evaluation benchmarks: (1) Xstest Röttger et al. [2023] contains 250 non-risky but easily erroneously refused questions; (2) Orbench-Hard-1k Cui et al. [2024] includes 1000 more challenging questions for a large-scale over-refusal test. Both Xstest and Orbench-Hard-1k use GPT-4o to judge if the LLM refuses to answer.

此外, 已有工作 (Röttger et al. [2023]) 发现, 提高 LLM 的无害性可能降低有用性. 为平衡这一权衡, 我们另外引入两个过度拒答评测基准: (1) Xstest (Röttger et al. [2023]) 包含 250 个无风险但容易被误拒的问题; (2) Orbench-Hard-1k (Cui et al. [2024]) 包含 1000 个更难的问题, 用于大规模过度拒答评测. Xstest 和 Orbench-Hard-1k 都用 GPT-4o 判断 LLM 是否拒答.

In Table 9, we present the safety and false refusal results by comparing the Ling models to baseline models. The safety metric reflects the proportion of safe responses, and the false rejection metric reflects the proportion of non-refusal responses. Both metrics are the higher the better.

Table 9 给出 Ling 模型与基线模型在安全和误拒上的对比结果. 安全指标反映安全回答的比例, 误拒指标反映非拒答回答的比例. 两个指标都是越高越好.

## 5.3.2 Results analysis (结果分析)

As in Table 9, both Ling-Plus and Qwen2.5-72B-Instruct stand out in terms of safety, and Ling-Plus performs better considering false refusal. The DeepSeek series models exhibit the least false refusal phenomenon, but they show lower safety on risk questions within the lmsys-chat-1m. Ling-Plus demonstrates a better overall trade-off between safety and refusal, achieving the best results in terms of the average of these metrics.

如 Table 9 所示, Ling-Plus 和 Qwen2.5-72B-Instruct 在安全方面都很突出, 考虑误拒时 Ling-Plus 更好. DeepSeek 系列模型的误拒现象最少, 但在 lmsys-chat-1m 的风险问题上安全性较低. Ling-Plus 在安全与拒答之间的整体权衡更好, 这些指标的平均值最高.

## Bitter Lessons (苦涩的教训)

Training LLM is a challenging and resource-intensive process, often accompanied by various technical difficulties. Errors and exceptions are common, with some being relatively straightforward to resolve while others require significant time and effort. To aid researchers and practitioners in this field, we have compiled a summary of frequent issues encountered during training, along with strategies to address them.

训练 LLM 是一个困难且耗费资源的过程, 常伴随各种技术难题. 错误和异常很常见, 有的比较容易解决, 有的要花大量时间和精力. 为帮助这一领域的研究者和从业者, 我们总结了训练中常遇到的问题及应对策略.

## 6.1 Training Stability (训练稳定性)

Training stability encompasses challenges such as loss spikes, loss divergence, and expert load imbalance, particularly in MoE models. These issues can hinder performance or even lead to training failure. Based on empirical observations:

训练稳定性包括 loss 尖峰, loss 发散和专家负载失衡等挑战, 在 MoE 模型中尤其突出. 这些问题会损害表现, 甚至导致训练失败. 基于经验观察:

• **Loss spikes.** Loss spikes are abrupt increases in training loss and are often caused by specific data and optimizer state combinations. Narrow, sharp spikes tend to have a minimal impact on performance, whereas wide, prolonged spikes can adversely affect both stability and model performance. During MoE training, such spikes may also result from hardware issues, such as malfunctioning accelerators or under-performing compute nodes. To mitigate these effects, we implemented a series of measures, including retry and skip mechanisms. When wide spikes occur for the first time, the affected update is skipped, the data is saved, and the training step is retried, as is described in Section3.4.4. If spikes persist upon retrying, we automatically reduce the learning rate during the affected step. This strategy has proven relatively effective in minimizing the impact of loss spikes compared to leaving them unaddressed.

• **loss 尖峰.** loss 尖峰是训练 loss 的突然上升, 通常由特定的数据与优化器状态组合引起. 窄而尖的尖峰对表现影响往往很小, 宽而持久的尖峰则会损害稳定性和模型表现. 在 MoE 训练中, 这类尖峰也可能由硬件问题引起, 例如加速器故障或计算节点性能不足. 为减轻这些影响, 我们实施了一系列措施, 包括重试和跳过机制. 第一次出现宽尖峰时, 跳过受影响的更新, 保存数据, 并重试该训练 step, 见 3.4.4 节. 如果重试后尖峰仍然存在, 就在受影响的 step 自动降低学习率. 与放任不管相比, 这一策略在减轻 loss 尖峰影响方面相当有效.

• **Loss divergence.** Loss divergence, which halts training progress, is often caused by numerical instabilities in softmax layers. To counter this, our training architecture incorporates two mitigation techniques: (1) the use of HeadNorm to stabilize the softmax layer in the language modeling head and (2) the application of zloss to the router softmax layer for expert routing. These methods are inspired by the work of Zoph et al. on designing stable MoE architectures Zoph et al. [2022].

• **loss 发散.** loss 发散会让训练停滞, 通常由 softmax 层的数值不稳定引起. 为此我们的训练架构加入两项缓解技术: (1) 用 HeadNorm 稳定语言建模头中的 softmax 层, (2) 对专家路由的 router softmax 层施加 z-loss. 这些方法受 Zoph et al. 关于设计稳定 MoE 架构的工作 (Zoph et al. [2022]) 启发.

**Expert load imbalance.** Maintaining balanced expert utilization is essential for the effectiveness of MoE models. Wide loss spikes can significantly disrupt expert load balance by causing abrupt gradient surges, which destabilize the routing equilibrium. Once experts become imbalanced, the issue tends to escalate, leading to widespread instability across the model. By integrating our spike mitigation techniques with balance loss and the aforementioned router zloss, we successfully achieved stable training for an MoE model containing hundreds of billions of parameters. This approach resulted in a stable loss trajectory, with no observed instances of loss divergence, wide loss spikes, or disruptions in expert routing balance.

**专家负载失衡.** 保持专家使用均衡对 MoE 模型的效果至关重要. 宽 loss 尖峰会引起梯度骤增, 破坏路由平衡, 从而严重扰乱专家负载均衡. 专家一旦失衡, 问题往往会升级, 导致整个模型大范围不稳定. 把我们的尖峰缓解技术与 balance loss 和前面提到的 router z-loss 结合, 我们成功稳定地训练了一个包含数千亿参数的 MoE 模型. 这一做法带来平稳的 loss 轨迹, 没有观察到 loss 发散, 宽 loss 尖峰或专家路由平衡被破坏的情况.

> **回看:** 第 6.1 节 loss 发散那一条写的是 「HeadNorm」, 第 3.2.3 节叫 「NormHead」. 这是两样东西吗?
> 是同一样东西. 第 3.2.3 节定义的 NormHead 是对 LM-Head 权重做 L2 归一化 (公式 4), 第 6.1 节说 HeadNorm 用来 「stabilize the softmax layer in the language modeling head」, 作用对象都是语言建模头, 只是名字前后写法不同. 另一项措施 router z-loss 在第 3.2.2 节已经出现, 系数 1e-4 在第 3.4.1 节给出.

<!-- page 29 of 34 -->

![Chart block](images/p29-figure-20-when-switching-between-different-hardware.png)

Figure 20: When switching between different hardware platforms, even after verifying the consistency among various operators, it is still necessary to examine the detailed operations and communication behaviors within the frameworks to ensure that the final results meet the expected outcomes. This is our record of fixing the loss curve in the Megatron vendor version on Device A.

图 20: 在不同硬件平台之间切换时, 即使已经验证了各算子之间的一致性, 仍需检查框架内部的细节运算和通信行为, 确保最终结果符合预期. 这是我们在设备 A 上修复 Megatron 厂商版本 loss 曲线的记录.

## 6.2 Cross-Platform Alignment (跨平台对齐)

The migration of LLMs training across different platforms presents a multifaceted challenge, primarily due to discrepancies in the implementation of fundamental operations and framework-level distinctions. These variations can lead to divergent training outcomes, underscoring the necessity for rigorous alignment strategies. To facilitate the migration of Ling—a large-scale LLM—to multiple platforms, we conducted extensive preparatory experiments aimed at ensuring the consistency of basic operations and communication algorithms across platforms, while accounting for minor precision errors inherent to numerical computations. Only after successful validation of these foundational components did we proceed to large-scale LLM training.

在不同平台之间迁移 LLM 训练是一个多方面的难题, 主要源于基础运算实现的差异和框架层面的区别. 这些差异可能导致训练结果分叉, 因此必须有严格的对齐策略. 为了把 Ling 这样的大规模 LLM 迁移到多个平台, 我们做了大量准备实验, 确保跨平台的基础运算和通信算法一致, 同时考虑数值计算固有的微小精度误差. 只有在这些基础组件验证通过后, 我们才开始大规模 LLM 训练.

However, validating basic operations alone proved insufficient for achieving seamless cross-platform migration. During subsequent training phases, significant disparities in loss convergence were observed between platforms post-migration. To address this issue, we extended our alignment efforts beyond basic operations to encompass the frameworks themselves. This process required the elimination of all potential sources of divergence; otherwise, pinpointing the root cause of errors would have been infeasible. Consequently, we achieved full alignment of fundamental operations, including matrix multiplication (matmul) and linear transformations, across both platforms. At the framework level, discrepancies in the implementation of modules—such as Attention mechanisms, Multi-Layer Perceptrons (MLPs), and Router components—were addressed to avoid precision errors stemming from floating-point arithmetic. This effort resulted in complete alignment of forward-pass computations across platforms. In this process, we resolved issues arising from variations in tensor parallelism (TP) and auxiliary loss calculations and corrected errors in certain communication operations. During backward-pass computations, leveraging the insights gained from aligning the forward pass allowed us to efficiently identify and rectify errors in gradient propagation, particularly in the router components. While such issues may appear negligible in isolation or during unit testing, their cumulative effect over the course of training can significantly impact convergence outcomes for LLMs. Even minor discrepancies, when compounded over many iterations, can lead to substantial deviations in final loss convergence.

但只验证基础运算, 不足以实现无缝的跨平台迁移. 在后续训练阶段, 迁移后的平台之间在 loss 收敛上出现了明显差异. 为解决这个问题, 我们把对齐工作从基础运算扩展到框架本身. 这一过程要求消除所有可能的分歧来源, 否则就无法定位错误的根因. 因此, 我们在两个平台上实现了矩阵乘法 (matmul) 和线性变换等基础运算的完全对齐. 在框架层面, 处理了 Attention 机制, 多层感知机 (MLP) 和 Router 组件等模块在实现上的差异, 避免浮点运算带来的精度误差. 这项工作让前向计算在各平台之间完全对齐. 在此过程中, 我们解决了张量并行 (TP) 和辅助损失计算上的差异引起的问题, 并修正了某些通信操作中的错误. 在反向计算中, 借助对齐前向时积累的经验, 我们高效地找出并修正了梯度传播中的错误, 尤其是 router 组件中的错误. 这些问题单独看或在单元测试中可能微不足道, 但在整个训练过程中的累积效应会显著影响 LLM 的收敛结果. 即使是微小的差异, 经过多次迭代叠加, 也可能让最终 loss 收敛出现大幅偏离.

Thus, achieving full alignment of both forward and backward computational passes is imperative for training on new platforms or frameworks. This process not only ensures training correctness and stability but also enhances the understanding of platform-specific characteristics. Furthermore, it facilitates the development of new features and optimization strategies, contributing to future advancements in LLM performance and scalability. Our repair process can be referenced in Figure 20.

因此, 在新平台或新框架上训练时, 必须实现前向和反向计算的完全对齐. 这一过程不仅保证训练的正确和稳定, 还加深了对平台特性的理解. 此外, 它也有助于开发新功能和优化策略, 为今后提升 LLM 性能和可扩展性打下基础. 我们的修复过程可参考 Figure 20.

<!-- page 30 of 34 -->

## 7 Conclusion (结论)

This report has addressed the challenges associated with training large-scale MoE models, including cost inefficiency and resource limitations, by proposing innovative strategies to improve efficiency in resource-constrained environments. Specifically, we introduced two open-source MoE models, Ling-Lite and Ling-Plus, which are designed to reduce training costs through advancements in architectural design, frameworks, and storage optimization. Our experimental findings have demonstrated that a 300B MoE LLM can be effectively trained on lower-performance devices while achieving comparable performance to similar scale of dense and MoE models, such as Qwen2.5-72B-Instruct and DeepSeek-V2.5-1210-Chat. Also, compared with the high-performance devices, utilizing a lower-specification hardware system during the pre-training phase has demonstrated significant cost savings, reducing computing cost by approximately 20%. In this report, we also presented our comprehensive optimization solutions for model training across diverse computational resources. These include improvements to model architecture and training strategies, enhancements to training anomaly handling mechanisms, optimization of model evaluation processes, and advancements in the ability of tool use. To continue the development of the Ling series of LLMs, we plan to release our coder model in the near future.

本报告针对训练大规模 MoE 模型时的难题, 包括成本低效和资源受限, 提出了在资源受限环境中提高效率的新策略. 具体来说, 我们推出了两个开源 MoE 模型 Ling-Lite 和 Ling-Plus, 通过架构设计, 框架和存储优化上的改进降低训练成本. 实验结果表明, 一个 300B 的 MoE LLM 可以在性能较低的设备上有效训练, 并取得与同等规模 dense 模型和 MoE 模型 (例如 Qwen2.5-72B-Instruct 和 DeepSeek-V2.5-1210-Chat) 相当的表现. 同时, 与高性能设备相比, 在预训练阶段使用规格较低的硬件系统明显省钱, 计算成本降低约 20%. 本报告还介绍了我们在多种计算资源上训练模型的完整优化方案, 包括模型架构与训练策略的改进, 训练异常处理机制的增强, 模型评测流程的优化, 以及工具使用能力的提升. 为继续发展 Ling 系列 LLM, 我们计划近期发布代码模型.

## 8 Authors (作者)

Binwei Zeng, Chao Huang, Chao Zhang, Changxin Tian, Cong Chen, Dingnan Jin, Feng Yu, Feng Zhu, Feng Yuan, Fakang Wang, Gangshan Wang, Guangyao Zhai, Haitao Zhang, Huizhong Li, Jun Zhou, Jia Liu, Junpeng Fang, Junjie Ou, Jun Hu, Ji Luo, Ji Zhang, Jian Liu, Jian Sha, Jianxue Qian, Jiewei Wu, Junping Zhao, Jianguo Li, Jubao Feng, Jingchao Di, Junming Xu, Jinghua Yao, Kuan Xu, Kewei Du, Longfei Li, Lei Liang, Lu Yu, Li Tang, Lin Ju, Peng Xu, Qing Cui, Song Liu, Shicheng Li, Shun Song, Song Yan, Tengwei Cai, Tianyi Chen, Ting Guo, Ting Huang, Tao Feng, Tao Wu, Wei Wu, Xiaolu Zhang, Xueming Yang, Xin Zhao, Xiaobo Hu, Xin Lin, Yao Zhao, Yilong Wang, Yongzhen Guo, Yuanyuan Wang, Yue Yang, Yang Cao, Yuhao Fu, Yi Xiong, Yanzhe Li, Zhe Li, Zhiqiang Zhang, Ziqi Liu, Zhaoxin Huan, Zujie Wen, Zhenhang Sun, Zhuoxuan Du, and Zhengyu He.

作者名单保留英文原文拼写.

## References (参考文献)

参考文献条目保留英文原文.

Ryoko AI. Sharegpt dataset, 2023. URL [https://huggingface.co/datasets/RyokoAI/ShareGPT52K](https://huggingface.co/datasets/RyokoAI/ShareGPT52K).

Alipay. Alipay: https://www.alipay.com/, 2025. URL [https://www.alipay.com/](https://www.alipay.com/).

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, Binyuan Hui, Luo Ji, Mei Li, Junyang Lin, Runji Lin, Dayiheng Liu, Gao Liu, Chengqiang Lu, Keming Lu, Jianxin Ma, Rui Men, Xingzhang Ren, Xuancheng Ren, Chuanqi Tan, Sinan Tan, Jianhong Tu, Peng Wang, Shijie Wang, Wei Wang, Shengguang Wu, Benfeng Xu, Jin Xu, An Yang, Hao Yang, Jian Yang, Shusheng Yang, Yang Yao, Bowen Yu, Hongyi Yuan, Zheng Yuan, Jianwei Zhang, Xingxuan Zhang, Yichang Zhang, Zhenru Zhang, Chang Zhou, Jingren Zhou, Xiaohuan Zhou, and Tianhang Zhu. Qwen technical report, 2023. URL [https://arxiv.org/abs/2309.16609](https://arxiv.org/abs/2309.16609).

Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi, et al. Piqa: Reasoning about physical commonsense in natural language. In Proceedings of the AAAI conference on artificial intelligence, volume 34, pages 7432–7439, 2020.

Piotr Bojanowski, Edouard Grave, Armand Joulin, and Tomas Mikolov. Enriching word vectors with subword information, 2017. URL [https://arxiv.org/abs/1607.04606](https://arxiv.org/abs/1607.04606).

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q Feldman, et al. Multipl-e: A scalable and extensible approach to benchmarking neural code generation. arXiv preprint arXiv:2208.08227, 2022.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

Zehui Chen, Weihua Du, Wenwei Zhang, Kuikun Liu, Jiangning Liu, Miao Zheng, Jingming Zhuo, Songyang Zhang, Dahua Lin, Kai Chen, et al. T-eval: Evaluating the tool utilization capability step by step. arXiv preprint arXiv:2312.14033, 2023.

<!-- page 31 of 34 -->

Jialiang Cheng, Ning Gao, Yun Yue, Zhiling Ye, Jiadi Jiang, and Jian Sha. EDiT: A local-SGD-based efficient distributed training method for large language models. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=xtlMtbVfWu](https://openreview.net/forum?id=xtlMtbVfWu).

Aidan Clark, Diego de Las Casas, Aurelia Guy, Arthur Mensch, Michela Paganini, Jordan Hoffmann, Bogdan Damoc, Blake Hechtman, Trevor Cai, Sebastian Borgeaud, et al. Unified scaling laws for routed language models. In International conference on machine learning, pages 4057–4086. PMLR, 2022.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

Claude. The claude 3 model family: Opus, sonnet, haiku, 2024. URL [https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/ModelCardClaude3.pdf](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model%20Card%20Claud%20e%203.pdf).

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

Justin Cui, Wei-Lin Chiang, Ion Stoica, and Cho-Jui Hsieh. Or-bench: An over-refusal benchmark for large language models. arXiv preprint arXiv:2405.20947, 2024.

Weihao Cui, Ji Zhang, Han Zhao, Chao Liu, Wenhao Zhang, Jian Sha, Quan Chen, Bingsheng He, and Minyi Guo. Xputimer: Anomaly diagnostics for divergent llm training in gpu clusters of thousand-plus scale. arXiv preprint arXiv:2502.05413, 2025.

Damai Dai, Chengqi Deng, Chenggang Zhao, RX Xu, Huazuo Gao, Deli Chen, Jiashi Li, Wangding Zeng, Xingkai Yu, Yu Wu, et al. Deepseekmoe: Towards ultimate expert specialization in mixture-of-experts language models. arXiv preprint arXiv:2401.06066, 2024.

DeepSeek. Deepseek opensourceweek, 2025. URL [https://github.com/deepseek-ai/open-infra-index/tree/main/202502OpenSourceWeek](https://github.com/deepseek-ai/open-infra-index/tree/main/202502OpenSourceWeek).

DeepSeek-AI. Deepseek llm: Scaling open-source language models with longtermism, 2024a. URL [https://arxiv.org/abs/2401.02954](https://arxiv.org/abs/2401.02954).

DeepSeek-AI. Deepseek-v2: A strong, economical, and efficient mixture-of-experts language model, 2024b. URL [https://arxiv.org/abs/2405.04434](https://arxiv.org/abs/2405.04434).

DeepSeek-AI. Deepseek-v3 technical report, 2025. URL [https://arxiv.org/abs/2412.19437](https://arxiv.org/abs/2412.19437).

DeepSeek-AI, Qihao Zhu, Daya Guo, Zhihong Shao, Dejian Yang, Peiyi Wang, Runxin Xu, Y. Wu, Yukun Li, Huazuo Gao, Shirong Ma, Wangding Zeng, Xiao Bi, Zihui Gu, Hanwei Xu, Damai Dai, Kai Dong, Liyue Zhang, Yishi Piao, Zhibin Gou, Zhenda Xie, Zhewen Hao, Bingxuan Wang, Junxiao Song, Deli Chen, Xin Xie, Kang Guan, Yuxiang You, Aixin Liu, Qiushi Du, Wenjun Gao, Xuan Lu, Qinyu Chen, Yaohui Wang, Chengqi Deng, Jiashi Li, Chenggang Zhao, Chong Ruan, Fuli Luo, and Wenfeng Liang. Deepseek-coder-v2: Breaking the barrier of closed-source models in code intelligence, 2024. URL [https://arxiv.org/abs/2406.11931](https://arxiv.org/abs/2406.11931).

Jacob Devlin, Ming-Wei Chang, Kenton Lee, and Kristina Toutanova. Bert: Pre-training of deep bidirectional transformers for language understanding, 2019. URL [https://arxiv.org/abs/1810.04805](https://arxiv.org/abs/1810.04805).

DLRover. Dlrover: An automatic distributed deep learning system, 2023. URL [https://github.com/intelligent-machine-learning/dlrover](https://github.com/intelligent-machine-learning/dlrover).

Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, et al. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

William Fedus, Barret Zoph, and Noam Shazeer. Switch transformers: Scaling to trillion parameter models with simple and efficient sparsity. Journal of Machine Learning Research, 23(120):1–39, 2022.

FlagOpen. Flagscale: a large model toolkit based on open-sourced projects, 2025. URL [https://github.com/FlagOpen/FlagScale](https://github.com/FlagOpen/FlagScale).

Flood. Flood: A toolkit for llm painless inference acceleration, 2025. URL [https://github.com/alipay/PainlessInferenceAcceleration](https://github.com/alipay/PainlessInferenceAcceleration).

Leo Gao, Tom Dupré la Tour, Henk Tillman, Gabriel Goh, Rajan Troll, Alec Radford, Ilya Sutskever, Jan Leike, and Jeffrey Wu. Scaling and evaluating sparse autoencoders. arXiv preprint arXiv:2406.04093, 2024.

Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, et al. Are we done with mmlu? arXiv preprint arXiv:2406.04127, 2024.

<!-- page 32 of 34 -->

Gemini. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context, 2024. URL [https://arxiv.org/abs/2403.05530](https://arxiv.org/abs/2403.05530).

Alex Gu, Baptiste Rozière, Hugh Leather, Armando Solar-Lezama, Gabriel Synnaeve, and Sida I Wang. Cruxeval: A benchmark for code reasoning, understanding and execution. arXiv preprint arXiv:2401.03065, 2024.

Yancheng He, Shilong Li, Jiaheng Liu, Yingshui Tan, Weixun Wang, Hui Huang, Xingyuan Bu, Hangyu Guo, Chengwei Hu, Boren Zheng, et al. Chinese simpleqa: A chinese factuality evaluation for large language models. arXiv preprint arXiv:2411.07140, 2024.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv:2009.03300, 2020.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

Tom Henighan, Jared Kaplan, Mor Katz, Mark Chen, Christopher Hesse, Jacob Jackson, Heewoo Jun, Tom B Brown, Prafulla Dhariwal, Scott Gray, et al. Scaling laws for autoregressive generative modeling. arXiv preprint arXiv:2010.14701, 2020.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, et al. Training compute-optimal large language models. arXiv preprint arXiv:2203.15556, 2022.

Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Yao Fu, et al. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models. Advances in Neural Information Processing Systems, 36:62991–63010, 2023.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv:2403.07974, 2024.

Albert Q Jiang, Alexandre Sablayrolles, Antoine Roux, Arthur Mensch, Blanche Savary, Chris Bamford, Devendra Singh Chaplot, Diego de las Casas, Emma Bou Hanna, Florian Bressand, et al. Mixtral of experts. arXiv preprint arXiv:2401.04088, 2024.

Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, and Dario Amodei. Scaling laws for neural language models. arXiv preprint arXiv:2001.08361, 2020.

Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph E. Gonzalez, Hao Zhang, and Ion Stoica. Efficient memory management for large language model serving with pagedattention, 2023. URL [https://arxiv.org/abs/2309.06180](https://arxiv.org/abs/2309.06180).

Guokun Lai, Qizhe Xie, Hanxiao Liu, Yiming Yang, and Eduard Hovy. Race: Large-scale reading comprehension dataset from examinations. arXiv preprint arXiv:1704.04683, 2017.

LangChain. Langchain react: https://python.langchain.com/v0.1/docs/modules/agents/agent\_types/react/, 2025. URL [https://python.langchain.com/v0.1/docs/modules/agents/agent\_types/react/](https://python.langchain.com/v0.1/docs/modules/agents/agent_types/react/).

Dmitry Lepikhin, HyoukJoong Lee, Yuanzhong Xu, Dehao Chen, Orhan Firat, Yanping Huang, Maxim Krikun, Noam Shazeer, and Zhifeng Chen. Gshard: Scaling giant models with conditional computation and automatic sharding. arXiv preprint arXiv:2006.16668, 2020.

Chenliang Li, Hehong Chen, Ming Yan, Weizhou Shen, Haiyang Xu, Zhikai Wu, Zhicheng Zhang, Wenmeng Zhou, Yingda Chen, Chen Cheng, Hongzhu Shi, Ji Zhang, Fei Huang, and Jingren Zhou. Modelscope-agent: Building your customizable agent system with open-source large language models, 2023a. URL [https://arxiv.org/abs/2309.00986](https://arxiv.org/abs/2309.00986).

Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese. arXiv preprint arXiv:2306.09212, 2023b.

Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Tianhao Wu, Banghua Zhu, Joseph E Gonzalez, and Ion Stoica. From crowdsourced data to high-quality benchmarks: Arena-hard and benchbuilder pipeline. arXiv preprint arXiv:2406.11939, 2024.

Nelson F Liu, Kevin Lin, John Hewitt, Ashwin Paranjape, Michele Bevilacqua, Fabio Petroni, and Percy Liang. Lost in the middle: How language models use long contexts. Transactions of the Association for Computational Linguistics, 12:157–173, 2024.

<!-- page 33 of 34 -->

Hongzhi Luan, Changxin Tian, Zhaoxin Huan, Xiaolu Zhang, Kunlong Chen, Zhiqiang Zhang, and Jun Zhou. Toward stable and consistent evaluation results: A new methodology for base model evaluation, 2025. URL [https://arxiv.org/abs/2503.00812](https://arxiv.org/abs/2503.00812).

MAA. American invitational mathematics examination - aime. In American Invitational Mathematics Examination - AIME 2024, February 2024., 2024. URL URLhttps://maa.org/math-competitions/ american-invitational-mathematics-examination-aime.

Todor Markov, Chong Zhang, Sandhini Agarwal, Florentine Eloundou Nekoul, Theodore Lee, Steven Adler, Angela Jiang, and Lilian Weng. A holistic approach to undesired content detection in the real world. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 37, pages 15009–15018, 2023.

MiniMax. Minimax-01: Scaling foundation models with lightning attention, 2025. URL [https://arxiv.org/abs/2501.08313](https://arxiv.org/abs/2501.08313).

MTEB. Mteb leaderboard, 2024. URL [https://huggingface.co/spaces/mteb/leaderboard](https://huggingface.co/spaces/mteb/leaderboard).

OpenAI. Gpt-4 technical report, 2024a. URL [https://arxiv.org/abs/2303.08774](https://arxiv.org/abs/2303.08774).

OpenAI. Introducing simpleqa, 2024b. URL URLhttps://openai.com/index/introducing-simpleqa/.

OpenAI. Openai function calling url: https://platform.openai.com/docs/guides/function-calling, 2025. URL [https://platform.openai.com/docs/guides/function-calling](https://platform.openai.com/docs/guides/function-calling).

Long Ouyang, Jeffrey Wu, Xu Jiang, Diogo Almeida, Carroll Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, et al. Training language models to follow instructions with human feedback. Advances in neural information processing systems, 35:27730–27744, 2022.

Richard Yuanzhe Pang, Weizhe Yuan, He He, Kyunghyun Cho, Sainbayar Sukhbaatar, and Jason Weston. Iterative reasoning preference optimization. In NeurIPS, 2024.

PurpleLlama. Llama-guard3 url: https://github.com/meta-llama/purplellama/blob/main/llama-guard3, 2024. URL [https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Guard3](https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Guard3).

Yujia Qin, Shihao Liang, Yining Ye, Kunlun Zhu, Lan Yan, Yaxi Lu, Yankai Lin, Xin Cong, Xiangru Tang, Bill Qian, Sihan Zhao, Runchu Tian, Ruobing Xie, Jie Zhou, Mark Gerstein, Dahai Li, Zhiyuan Liu, and Maosong Sun. Toolllm: Facilitating large language models to master 16000+ real-world apis, 2023.

Qwen. Qwen2.5 technical report, 2025. URL [https://arxiv.org/abs/2412.15115](https://arxiv.org/abs/2412.15115).

Rafael Rafailov, Archit Sharma, Eric Mitchell, Christopher D. Manning, Stefano Ermon, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. In NeurIPS, 2023.

Samyam Rajbhandari, Conglong Li, Zhewei Yao, Minjia Zhang, Reza Yazdani Aminabadi, Ammar Ahmad Awan, Jeff Rasley, and Yuxiong He. Deepspeed-moe: Advancing mixture-of-experts inference and training to power next-generation ai scale. In International conference on machine learning, pages 18332–18346. PMLR, 2022.

RapidAPI. Rapidapi: https://rapidapi.com/, 2025. URL [https://rapidapi.com/](https://rapidapi.com/).

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024.

Paul Röttger, Hannah Rose Kirk, Bertie Vidgen, Giuseppe Attanasio, Federico Bianchi, and Dirk Hovy. Xstest: A test suite for identifying exaggerated safety behaviours in large language models. arXiv preprint arXiv:2308.01263, 2023.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An adversarial winograd schema challenge at scale. Communications of the ACM, 64(9):99–106, 2021.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models, 2024. URL [https://arxiv.org/abs/2402.03300](https://arxiv.org/abs/2402.03300).

Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism, 2020. URL [https://arxiv.org/abs/1909.08053](https://arxiv.org/abs/1909.08053).

Shuaiwen Leon Song, Bonnie Kruft, Minjia Zhang, Conglong Li, Shiyang Chen, Chengming Zhang, Masahiro Tanaka, Xiaoxia Wu, Jeff Rasley, Ammar Ahmad Awan, Connor Holmes, Martin Cai, Adam Ghanem, Zhongzhu Zhou, Yuxiong He, Pete Luferenko, Divya Kumar, Jonathan Weyn, Ruixiong Zhang, Sylwester Klocek, Volodymyr Vragov, Mohammed AlQuraishi, Gustaf Ahdritz, Christina Floristean, Cristina Negri, Rao Kotamarthi, Venkatram Vishwanath, Arvind Ramanathan, Sam Foreman, Kyle Hippe, Troy Arcomano, Romit Maulik, Maxim Zvyagin,

<!-- page 34 of 34 -->

Alexander Brace, Bin Zhang, Cindy Orozco Bohorquez, Austin Clyde, Bharat Kale, Danilo Perez-Rivera, Heng Ma, Carla M. Mann, Michael Irvin, J. Gregory Pauloski, Logan Ward, Valerie Hayot, Murali Emani, Zhen Xie, Diangen Lin, Maulik Shukla, Ian Foster, James J. Davis, Michael E. Papka, Thomas Brettin, Prasanna Balaprakash, Gina Tourassi, John Gounley, Heidi Hanson, Thomas E Potok, Massimiliano Lupo Pasini, Kate Evans, Dan Lu, Dalton Lunga, Junqi Yin, Sajal Dash, Feiyi Wang, Mallikarjun Shankar, Isaac Lyngaas, Xiao Wang, Guojing Cong, Pei Zhang, Ming Fan, Siyan Liu, Adolfy Hoisie, Shinjae Yoo, Yihui Ren, William Tang, Kyle Felker, Alexey Svyatkovskiy, Hang Liu, Ashwin Aji, Angela Dalton, Michael Schulte, Karl Schulz, Yuntian Deng, Weili Nie, Josh Romero, Christian Dallago, Arash Vahdat, Chaowei Xiao, Thomas Gibbs, Anima Anandkumar, and Rick Stevens. Deepspeed4science initiative: Enabling large-scale scientific discovery through sophisticated ai system technologies, 2023. URL [https://arxiv.org/abs/2310.04610](https://arxiv.org/abs/2310.04610).

Venkat Krishna Srinivasan, Zhen Dong, Banghua Zhu, Brian Yu, Damon Mosk-Aoyama, Kurt Keutzer, Jiantao Jiao, and Jian Zhang. Nexusraven: a commercially-permissive language model for function calling. In NeurIPS 2023 Foundation Models for Decision Making Workshop, 2023.

Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V Le, Ed H Chi, Denny Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

Qiaoyu Tang, Ziliang Deng, Hongyu Lin, Xianpei Han, Qiao Liang, and Le Sun. Toolalpaca: Generalized tool learning for language models with 3000 simulated cases, 2023.

Yun-Da Tsai, Mingjie Liu, and Haoxing Ren. Code less, align more: Efficient llm fine-tuning for code generation with data pruning. CoRR, 2024.

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In The Thirty-eight Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2024.

Yuxiang Wei, Zhe Wang, Jiawei Liu, Yifeng Ding, and Lingming Zhang. Magicoder: Empowering code generation with oss-instruct. arXiv preprint arXiv:2312.02120, 2023.

Guohai Xu, Jiayi Liu, Ming Yan, Haotian Xu, Jinghui Si, Zhuoran Zhou, Peng Yi, Xing Gao, Jitao Sang, Rong Zhang, et al. Cvalues: Measuring the values of chinese large language models from safety to responsibility. arXiv preprint arXiv:2307.09705, 2023.

Zhangchen Xu, Fengqing Jiang, Luyao Niu, Yuntian Deng, Radha Poovendran, Yejin Choi, and Bill Yuchen Lin. Magpie: Alignment data synthesis from scratch by prompting aligned llms with nothing. arXiv preprint arXiv:2406.08464, 2024.

Fanjia Yan, Huanzhi Mao, Charlie Cheng-Jie Ji, Tianjun Zhang, Shishir G. Patil, Ion Stoica, and Joseph E. Gonzalez. Berkeley function calling leaderboard, 2024. URL [https://gorilla.cs.berkeley.edu/blogs/8\_berkeley\_function\_calling\_leaderboard.html](https://gorilla.cs.berkeley.edu/blogs/8_berkeley_function_calling_leaderboard.html).

Aiyuan Yang, Bin Xiao, Bingning Wang, Borong Zhang, Ce Bian, Chao Yin, Chenxu Lv, Da Pan, Dian Wang, Dong Yan, et al. Baichuan 2: Open large-scale language models. arXiv preprint arXiv:2309.10305, 2023.

An Yang, Baosong Yang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Zhou, Chengpeng Li, Chengyuan Li, Dayiheng Liu, Fei Huang, Guanting Dong, Haoran Wei, Huan Lin, Jialong Tang, Jialin Wang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Ma, Jianxin Yang, Jin Xu, Jingren Zhou, Jinze Bai, Jinzheng He, Junyang Lin, Kai Dang, Keming Lu, Keqin Chen, Kexin Yang, Mei Li, Mingfeng Xue, Na Ni, Pei Zhang, Peng Wang, Ru Peng, Rui Men, Ruize Gao, Runji Lin, Shijie Wang, Shuai Bai, Sinan Tan, Tianhang Zhu, Tianhao Li, Tianyu Liu, Wenbin Ge, Xiaodong Deng, Xiaohuan Zhou, Xingzhang Ren, Xinyu Zhang, Xipin Wei, Xuancheng Ren, Xuejing Liu, Yang Fan, Yang Yao, Yichang Zhang, Yu Wan, Yunfei Chu, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, Zhifang Guo, and Zhihao Fan. Qwen2 technical report, 2024. URL [https://arxiv.org/abs/2407.10671](https://arxiv.org/abs/2407.10671).

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence? arXiv preprint arXiv:1905.07830, 2019.

Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, Tianle Li, Siyuan Zhuang, Zhanghao Wu, Yonghao Zhuang, Zhuohan Li, Zi Lin, Eric P Xing, et al. Lmsys-chat-1m: A large-scale real-world llm conversation dataset. arXiv preprint arXiv:2309.11998, 2023.

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. arXiv preprint arXiv:2311.07911, 2023.

Barret Zoph, Irwan Bello, Sameer Kumar, Nan Du, Yanping Huang, Jeff Dean, Noam Shazeer, and William Fedus. Stmoe: Designing stable and transferable sparse expert models, 2022. URL [https://arxiv.org/abs/2202.08906](https://arxiv.org/abs/2202.08906).
