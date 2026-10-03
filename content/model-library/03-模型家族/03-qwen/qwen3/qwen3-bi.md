<!-- page 1 of 35 -->

arXiv:2505.09388v1 [cs.CL] 14 May 2025

Qwen

2025-05-15

# Qwen3 Technical Report # Qwen3 技术报告

Qwen Team

https://huggingface.co/Qwen

https://modelscope.cn/organization/qwen

https://github.com/QwenLM/Qwen3

## Abstract

In this work, we present Qwen3, the latest version of the Qwen model family. Qwen3 comprises a series of large language models (LLMs) designed to advance performance, efficiency, and multilingual capabilities. The Qwen3 series includes models of both dense and Mixture-of-Expert (MoE) architectures, with parameter scales ranging from 0.6 to 235 billion. A key innovation in Qwen3 is the integration of thinking mode (for complex, multi-step reasoning) and non-thinking mode (for rapid, context-driven responses) into a unified framework. This eliminates the need to switch between different models—such as chat-optimized models (e.g., GPT-4o) and dedicated reasoning models (e.g., QwQ-32B)—and enables dynamic mode switching based on user queries or chat templates. Meanwhile, Qwen3 introduces a thinking budget mechanism, allowing users to allocate computational resources adaptively during inference, thereby balancing latency and performance based on task complexity. Moreover, by leveraging the knowledge from the flagship models, we significantly reduce the computational resources required to build smaller-scale models, while ensuring their highly competitive performance. Empirical evaluations demonstrate that Qwen3 achieves state-of-the-art results across diverse benchmarks, including tasks in code generation, mathematical reasoning, agent tasks, etc., competitive against larger MoE models and proprietary models. Compared to its predecessor Qwen2.5, Qwen3 expands multilingual support from 29 to 119 languages and dialects, enhancing global accessibility through improved cross-lingual understanding and generation capabilities. To facilitate reproducibility and community-driven research and development, all Qwen3 models are publicly accessible under Apache 2.0.

本文推出 Qwen 模型家族最新版 Qwen3: 一系列追求性能, 效率与多语言能力的大语言模型 (LLM), 同时提供 dense 与 MoE 两种架构, 参数规模从 0.6B 到 235B. 关键创新是把 thinking mode (复杂多步推理) 与 non-thinking mode (快速, 上下文驱动的响应) 整合进统一框架: 用户无需再于聊天优化模型 (如 GPT-4o) 与专用推理模型 (如 QwQ-32B) 之间切换, 可按用户查询或 chat template 动态切换模式. Qwen3 还引入 thinking budget 机制, 让用户在推理时自适应分配算力, 按任务复杂度平衡延迟与性能. 同时, 借助旗舰模型的知识蒸馏, 构建小模型的算力开销大幅降低, 性能仍具强竞争力. 实证评测显示, Qwen3 在代码生成, 数学推理, Agent 任务等多类基准上达到 SOTA, 可对标更大的 MoE 模型与闭源模型. 相比前代 Qwen2.5, 多语言支持从 29 种扩展到 119 种语言与方言, 跨语言理解与生成能力增强, 覆盖全球用户. 所有 Qwen3 模型以 Apache 2.0 协议公开, 便于复现与社区研发.

<!-- page 2 of 35 -->

## 1 Introduction

The pursuit of artificial general intelligence (AGI) or artificial super intelligence (ASI) has long been a goal for humanity. Recent advancements in large foundation models, e.g., GPT-4o (OpenAI, 2024), Claude 3.7 (Anthropic, 2025), Gemini 2.5 (DeepMind, 2025), DeepSeek-V3 (Liu et al., 2024a), Llama-4 (Meta-AI, 2025), and Qwen2.5 (Yang et al., 2024b), have demonstrated significant progress toward this objective. These models are trained on vast datasets spanning trillions of tokens across diverse domains and tasks, effectively distilling human knowledge and capabilities into their parameters. Furthermore, recent developments in reasoning models, optimized through reinforcement learning, highlight the potential for foundation models to enhance inference-time scaling and achieve higher levels of intelligence, e.g., o3 (OpenAI, 2025), DeepSeek-R1 (Guo et al., 2025). While most state-of-the-art models remain proprietary, the rapid growth of open-source communities has substantially reduced the performance gap between open-weight and closed-source models. Notably, an increasing number of top-tier models (Meta-AI, 2025; Liu et al., 2024a; Guo et al., 2025; Yang et al., 2024b) are now being released as open-source, fostering broader research and innovation in artificial intelligence.

追求 AGI 乃至 ASI 是人类长期目标. GPT-4o, Claude 3.7, Gemini 2.5, DeepSeek-V3, Llama-4, Qwen2.5 等大型基座模型的近期进展显著推进了这一目标: 它们在跨领域, 跨任务的数万亿 token 数据上训练, 把人类知识与能力蒸馏进参数. o3, DeepSeek-R1 等经强化学习优化的推理模型, 进一步展现了基座模型通过 inference-time scaling 提升智能的潜力. 尽管多数 SOTA 模型仍是闭源, 开源社区的快速壮大已大幅缩小开放权重与闭源模型的差距; 越来越多顶尖模型以开源形式发布, 推动更广泛的研究与创新.

In this work, we introduce Qwen3, the latest series in our foundation model family, Qwen3 is a collection of open-weight large language models (LLMs) that achieve state-of-the-art performance across a wide variety of tasks and domains. We release both dense and Mixture-of-Experts (MoE) models, with the number of parameters ranging from 0.6 billion to 235 billion, to meet the needs of different downstream applications. Notably, the flagship model, Qwen3-235B-A22B, is an MoE model with a total of 235 billion parameters and 22 billion activated ones per token. This design ensures both high performance and efficient inference.

本文推出基座模型家族最新系列 Qwen3: 一组在各类任务与领域均达 SOTA 的开放权重 LLM. 我们同时发布 dense 与 MoE 模型, 参数规模 0.6B 到 235B, 匹配不同下游应用的需求. 旗舰 Qwen3-235B-A22B 为 MoE 架构, 总参数 235B, 每 token 激活 22B, 兼顾高性能与推理效率.

Qwen3 introduces several key advancements to enhance its functionality and usability. First, it integrates two distinct operating modes, thinking mode and non-thinking mode, into a single model. This allows users to switch between these modes without alternating between different models, e.g., switching from Qwen2.5 to QwQ (Qwen Team, 2024). This flexibility ensures that developers and users can adapt the model's behavior to suit specific tasks efficiently. Additionally, Qwen3 incorporates thinking budgets, providing users with fine-grained control over the level of reasoning effort applied by the model during task execution. This capability is crucial to the optimization of computational resources and performance, tailoring the model's thinking behavior to meet varying complexity in real-world applications. Furthermore, Qwen3 has been pre-trained on 36 trillion tokens covering up to 119 languages and dialects, effectively enhancing its multilingual capabilities. This broadened language support amplifies its potential for deployment in global use cases and international applications. These advancements together establish Qwen3 as a cutting-edge open-source large language model family, capable of effectively addressing complex tasks across various domains and languages.

Qwen3 有几项关键升级: 第一, 把 thinking 与 non-thinking 两种模式整合进单一模型, 用户无需在 Qwen2.5 与 QwQ 等模型间来回切换, 可按任务灵活调整模型行为; 第二, 引入 thinking budget, 让用户细粒度控制模型在任务中的推理投入, 对算力与性能做优化, 适配真实场景中不同的任务复杂度; 第三, 预训练使用 36 万亿 token, 覆盖多达 119 种语言与方言, 多语言能力显著增强, 更契合全球化部署. 这些进步共同确立了 Qwen3 作为前沿开源 LLM 家族的地位, 能有效应对跨领域, 跨语言的复杂任务.

The pre-training process for Qwen3 utilizes a large-scale dataset consisting of approximately 36 trillion tokens, curated to ensure linguistic and domain diversity. To efficiently expand the training data, we employ a multi-modal approach: Qwen2.5-VL (Bai et al., 2025) is finetuned to extract text from extensive PDF documents. We also generate synthetic data using domain-specific models: Qwen2.5-Math (Yang et al., 2024c) for mathematical content and Qwen2.5-Coder (Hui et al., 2024) for code-related data. The pre-training process follows a three-stage strategy. In the first stage, the model is trained on about 30 trillion tokens to build a strong foundation of general knowledge. In the second stage, it is further trained on knowledge-intensive data to enhance reasoning abilities in areas like science, technology, engineering, and mathematics (STEM) and coding. Finally, in the third stage, the model is trained on long-context data to increase its maximum context length from 4,096 to 32,768 tokens.

Qwen3 预训练使用约 36 万亿 token 的大规模数据集, 并精心保证语言与领域多样性. 为高效扩充训练数据, 我们采用多模态手段: 微调 Qwen2.5-VL 从海量 PDF 文档中抽取文本; 用领域专用模型合成数据: Qwen2.5-Math 负责数学内容, Qwen2.5-Coder 负责代码数据. 预训练分三阶段: 第一阶段约 30 万亿 token, 打牢通用知识基础; 第二阶段用知识密集型数据强化 STEM 与编程等推理能力; 第三阶段用长上下文数据把最大上下文长度从 4,096 扩到 32,768 token.

To better align foundation models with human preferences and downstream applications, we employ a multi-stage post-training approach that empowers both thinking (reasoning) and non-thinking modes. In the first two stages, we focus on developing strong reasoning abilities through long chain-of-thought (CoT) cold-start finetuning and reinforcement learning focusing on mathematics and coding tasks. In the final two stages, we combine data with and without reasoning paths into a unified dataset for further fine-tuning, enabling the model to handle both types of input effectively, and we then apply general-domain reinforcement learning to improve performance across a wide range of downstream tasks. For smaller models, we use strong-to-weak distillation, leveraging both off-policy and on-policy knowledge transfer from larger models to enhance their capabilities. Distillation from advanced teacher models significantly outperforms reinforcement learning in performance and training efficiency.

为让基座模型对齐人类偏好与下游应用, 我们采用多阶段 post-training, 同时增强 thinking (推理) 与 non-thinking 两种模式. 前两阶段通过长 CoT 冷启动微调与聚焦数学, 代码任务的强化学习锻造强推理能力; 后两阶段把带与不带推理路径的数据合并为统一数据集继续微调, 让模型两类输入都能处理, 最后施加通用领域强化学习, 提升广泛下游任务的表现. 小模型采用 strong-to-weak 蒸馏: 同时利用 off-policy 与 on-policy 知识迁移增强能力; 高级教师模型的蒸馏在性能与训练效率上均显著优于强化学习.

We evaluate both pre-trained and post-trained versions of our models across a comprehensive set of benchmarks spanning multiple tasks and domains. Experimental results show that our base pre-trained models achieve state-of-the-art performance. The post-trained models, whether in thinking or non-thinking mode, perform competitively against leading proprietary models and large mixture-of-experts (MoE) models such as o1, o3-mini, and DeepSeek-V3. Notably, our models excel in coding, mathematics, and agent-related tasks. For example, the flagship model Qwen3-235B-A22B achieves 85.7 on AIME'24

<!-- page 3 of 35 -->

and 81.5 on AIME'25 (AIME, 2025), 70.7 on LiveCodeBench v5 (Jain et al., 2024), 2,056 on CodeForces, and 70.8 on BFCL v3 (Yan et al., 2024). In addition, other models in the Qwen3 series also show strong performance relative to their size. Furthermore, we observe that increasing the thinking budget for thinking tokens leads to a consistent improvement in the model's performance across various tasks.

我们在覆盖多任务, 多领域的全套基准上评测了预训练与 post-training 版本. 实验显示: 基座预训练模型已达 SOTA; post-training 模型无论 thinking 还是 non-thinking 模式, 都可对标 o1, o3-mini, DeepSeek-V3 等领先闭源模型与大型 MoE 模型, 在代码, 数学与 Agent 任务上尤为突出. 旗舰 Qwen3-235B-A22B 在 AIME'24 得 85.7, AIME'25 得 81.5, LiveCodeBench v5 得 70.7, CodeForces 得 2,056, BFCL v3 得 70.8; 系列其他模型在同尺寸下也表现强劲. 我们还观察到: 增大 thinking token 的 thinking budget, 模型在各类任务上的表现持续提升.

In the following sections, we describe the design of the model architecture, provide details on its training procedures, present the experimental results of pre-trained and post-trained models, and finally, conclude this technical report by summarizing the key findings and outlining potential directions for future research.

后续章节依次介绍模型架构设计, 训练流程细节, 预训练与 post-training 模型的实验结果, 最后总结要点并展望未来的研究方向.

## 2 Architecture 架构

The Qwen3 series includes 6 dense models, namely Qwen3-0.6B, Qwen3-1.7B, Qwen3-4B, Qwen3-8B, Qwen3-14B, and Qwen3-32B, and 2 MoE models, Qwen3-30B-A3B and Qwen3-235B-A22B. The flagship model, Qwen3-235B-A22B, has a total of 235B parameters with 22B activated ones. Below, we elaborate on the architecture of the Qwen3 models.

Qwen3 含 6 个 Dense: 0.6B, 1.7B, 4B, 8B, 14B, 32B; 以及 2 个 MoE: 30B-A3B 与 235B-A22B. 旗舰 235B-A22B 总参 235B, 每 token 激活 22B. 下面展开架构.

The architecture of the Qwen3 dense models is similar to Qwen2.5 (Yang et al., 2024b), including using Grouped Query Attention (GQA, Ainslie et al., 2023), SwiGLU (Dauphin et al., 2017), Rotary Positional Embeddings (RoPE, Su et al., 2024), and RMSNorm (Jiang et al., 2023) with pre-normalization. Besides, we remove QKV-bias used in Qwen2 (Yang et al., 2024a) and introduce QK-Norm (Dehghani et al., 2023) to the attention mechanism to ensure stable training for Qwen3. Key information on model architecture is provided in Table 1.

Dense 架构接近 Qwen2.5: GQA, SwiGLU, RoPE, 以及 pre-norm 的 RMSNorm. 另外去掉 Qwen2 的 QKV-bias, 引入 QK-Norm 以稳住 Qwen3 训练. 关键规格见表 1.

The Qwen3 MoE models share the same fundamental architecture as the Qwen3 dense models. Key information on model architecture is provided in Table 2. We follow Qwen2.5-MoE (Yang et al., 2024b) and implement fine-grained expert segmentation (Dai et al., 2024). The Qwen3 MoE models have 128 total experts with 8 activated experts per token. Unlike Qwen2.5-MoE, the Qwen3-MoE design excludes shared experts. Furthermore, we adopt the global-batch load balancing loss (Qiu et al., 2025) to encourage expert specialization. These architectural and training innovations have yielded substantial improvements in model performance across downstream tasks.

MoE 与 Dense 共用基础骨架, 规格见表 2. 沿用 Qwen2.5-MoE 的细粒度专家切分. 共 128 个专家, 每 token 激活 8 个. 与 Qwen2.5-MoE 不同, Qwen3-MoE 去掉共享专家. 另用 global-batch load balancing loss 推动专家专业化. 下游任务上有实质抬升.

Qwen3 models utilize Qwen's tokenizer (Bai et al., 2023), which implements byte-level byte-pair encoding (BBPE, Brown et al., 2020; Wang et al., 2020; Sennrich et al., 2016) with a vocabulary size of 151,669.

分词沿用 Qwen tokenizer, BBPE, 词表大小 151,669.

Table 1: Model architecture of Qwen3 dense models.

表 1: Model architecture of Qwen3 dense models.

| Models | Layers | Heads (Q / KV) | Tie Embedding | Context Length |
| --- | --- | --- | --- | --- |
| Qwen3-0.6B | 28 | 16 / 8 | Yes | 32K |
| Qwen3-1.7B | 28 | 16 / 8 | Yes | 32K |
| Qwen3-4B | 36 | 32 / 8 | Yes | 128K |
| Qwen3-8B | 36 | 32 / 8 | No | 128K |
| Qwen3-14B | 40 | 40 / 8 | No | 128K |
| Qwen3-32B | 64 | 64 / 8 | No | 128K |

Table 2: Model architecture of Qwen3 MoE models.

表 2: Model architecture of Qwen3 MoE models.

| Models | Layers | Heads (Q / KV) | # Experts (Total / Activated) | Context Length |
| --- | --- | --- | --- | --- |
| Qwen3-30B-A3B | 48 | 32 / 4 | 128 / 8 | 128K |
| Qwen3-235B-A22B | 94 | 64 / 4 | 128 / 8 | 128K |

## 3 Pre-training 预训练

In this section, we describe the construction of our pretraining data, the details of our pretraining approach, and present experimental results from evaluating the base models on standard benchmarks.

本节写预训练数据构造, 训练做法, 以及 Base 模型在标准基准上的结果.

### 3.1 Pre-training Data 预训练数据

Compared with Qwen2.5 (Yang et al., 2024b), we have significantly expanded the scale and diversity of our training data. Specifically, we collected twice as many pre-training tokens—covering three times more languages. All Qwen3 models are trained on a large and diverse dataset consisting of 119 languages and dialects, with a total of 36 trillion tokens. This dataset includes high-quality content in various

相对 Qwen2.5, 训练数据规模与多样性明显扩大: 预训练 token 约两倍, 语言约三倍. 全系在 119 种语言与方言, 共约 36 万亿 token 上训练. 语料覆盖编码, STEM, 推理, 书籍, 多语与合成等高质内容.

<!-- page 4 of 35 -->

domains such as coding, STEM (Science, Technology, Engineering, and Mathematics), reasoning tasks, books, multilingual texts, and synthetic data.

To further expand the pre-training data corpus, we first employ the Qwen2.5-VL model (Bai et al., 2025) to perform text recognition on a large volume of PDF-like documents. The recognized text is then refined using the Qwen2.5 model (Yang et al., 2024b), which helps improve its quality. Through this two-step process, we are able to obtain an additional set of high-quality text tokens, amounting to trillions in total. Besides, we employ Qwen2.5 (Yang et al., 2024b), Qwen2.5-Math (Yang et al., 2024c), and Qwen2.5-Coder (Hui et al., 2024) models to synthesize trillions of text tokens in different formats, including textbooks, question-answering, instructions, and code snippets, covering dozens of domains. Finally, we further expand the pre-training corpus by incorporating additional multilingual data and introducing more languages. Compared to the pre-training data used in Qwen2.5, the number of supported languages has been significantly increased from 29 to 119, enhancing the model's linguistic coverage and cross-lingual capabilities.

扩语料先用 Qwen2.5-VL 对大量 PDF 类文档做文字识别, 再用 Qwen2.5 精炼, 额外拿到数万亿高质文本 token. 另用 Qwen2.5, Qwen2.5-Math, Qwen2.5-Coder 合成教科书, 问答, 指令与代码片段等, 覆盖数十领域. 再补多语数据, 支持语言从 29 扩到 119.

We have developed a multilingual data annotation system designed to enhance both the quality and diversity of training data. This system has been applied to our large-scale pre-training datasets, annotating over 30 trillion tokens across multiple dimensions such as educational value, fields, domains, and safety. These detailed annotations support more effective data filtering and combination. Unlike previous studies (Xie et al., 2023; Fan et al., 2023; Liu et al., 2024b) that optimize the data mixture at the data source or domain level, our method optimizes the data mixture at the instance-level through extensive ablation experiments on small proxy models with the fine-grained data labels.

多语言数据标注系统给超过 30 万亿 token 打教育价值, 学科, 领域, 安全等标签. 与先前在数据源或领域级优化配比不同, 我们用细粒度标签在小代理模型上消融, 把配比优化落到 instance-level.

### 3.2 Pre-training Stage 预训练阶段

The Qwen3 models are pre-trained through a three-stage process:

Qwen3 预训练分三阶段:

(1) General Stage (S1): At the first pre-training stage, all Qwen3 models are trained on over 30 trillion tokens using a sequence length of 4,096 tokens. At this stage, the models have been fully pre-trained on language proficiency and general world knowledge, with training data covering 119 languages and dialects.

(1) 通用阶段 (S1): 全体在超过 30 万亿 token 上以序列长 4,096 训练, 铺语言能力与通用世界知识, 数据覆盖 119 种语言与方言.

(2) Reasoning Stage (S2): To further improve the reasoning ability, we optimize the pre-training corpus of this stage by increasing the proportion of STEM, coding, reasoning, and synthetic data. The models are further pre-trained with about 5T higher-quality tokens at a sequence length of 4,096 tokens. We also accelerate the learning rate decay during this stage.

(2) 推理阶段 (S2): 提高 STEM, 编码, 推理与合成数据比例, 再以约 5T 更高质 token, 序列长 4,096 继续训, 并加速学习率衰减.

> **确认:** S2 的 5T 是额外新数据, 还是从 36T 里切出来的一段课表?
> 行文是三阶段课表: S1 超过 30T, S2 再约 5T 更高推理比例, 然后长文段. 总量叙事仍落在约 36T.

(3) Long Context Stage: In the final pre-training stage, we collect high-quality long context corpora to extend the context length of Qwen3 models. All models are pre-trained on hundreds of billions of tokens with a sequence length of 32,768 tokens. The long context corpus includes 75% of text between 16,384 to 32,768 tokens in length, and 25% of text between 4,096 to 16,384 in length. Following Qwen2.5 (Yang et al., 2024b), we increase the base frequency of RoPE from 10,000 to 1,000,000 using the ABF technique (Xiong et al., 2023). Meanwhile, we introduce YARN (Peng et al., 2023) and Dual Chunk Attention (DCA, An et al., 2024) to achieve a four-fold increase in sequence length capacity during inference.

(3) 长上下文阶段: 在数百亿 token 上以序列长 32,768 训练. 语料 75% 落在 16,384–32,768, 25% 落在 4,096–16,384. 用 ABF 把 RoPE base 从 10,000 提到 1,000,000; 推理期再叠 YaRN 与 DCA, 序列能力约再乘四.

> **对一下:** YaRN+DCA 写的 four-fold 序列能力, 是相对哪一段训练长度?
> 相对长上下文阶段的训练顶长 32,768. §3.2 先把训练序列拉到 32,768, 再声明推理期用 YaRN 与 DCA 做约四倍外推.

Similar to Qwen2.5 (Yang et al., 2024b), we develop scaling laws for optimal hyper-parameters (e.g., learning rate scheduler, and batch size) predictions based on three pre-training stages mentioned above. Through extensive experiments, we systematically study the relationship between model architecture, training data, training stage, and optimal training hyper-parameters. Finally, we set the predicted optimal learning rate and batch size strategy for each dense or MoE model.

与 Qwen2.5 类似, 基于上述三阶段做 Scaling Laws, 预测最优学习率调度与 batch size 等. 系统研究架构, 数据, 阶段与超参关系后, 为每个 Dense 或 MoE 设定预测最优学习率与 batch 策略.

### 3.3 Pre-training Evaluation 预训练评测

We conduct comprehensive evaluations of the base language models of the Qwen3 series. The evaluation of base models mainly focuses on their performance in general knowledge, reasoning, mathematics, scientific knowledge, coding, and multilingual capabilities. The evaluation datasets for pre-trained base models include 15 benchmarks:

对 Qwen3 Base 做全面评测, 侧重通用知识, 推理, 数学, 科学, 编码与多语. Base 基准共 15 项:

\- General Tasks: MMLU (Hendrycks et al., 2021a) (5-shot), MMLU-Pro (Wang et al., 2024) (5-shot, CoT), MMLU-redux (Gema et al., 2024) (5-shot), BBH (Suzgun et al., 2023) (3-shot, CoT), SuperGPQA (Du et al., 2025)(5-shot, CoT).

\- Math & STEM Tasks: GPQA (Rein et al., 2023) (5-shot, CoT), GSM8K (Cobbe et al., 2021) (4-shot, CoT), MATH (Hendrycks et al., 2021b) (4-shot, CoT).

<!-- page 5 of 35 -->

\- Coding Tasks: EvalPlus (Liu et al., 2023a) (0-shot) (Average of HumanEval (Chen et al., 2021), MBPP (Austin et al., 2021), Humaneval+, MBPP+) (Liu et al., 2023a), MultiPL-E (Cassano et al., 2023) (0-shot) (Python, C++, JAVA, PHP, TypeScript, C#, Bash, JavaScript), MBPP-3shot (Austin et al., 2021), CRUX-O of CRUXEval (1-shot) (Gu et al., 2024).

\- Multilingual Tasks: MGSM (Shi et al., 2023) (8-shot, CoT), MMMLU (OpenAI, 2024) (5-shot), INCLUDE (Romanou et al., 2024) (5-shot).

For the base model baselines, we compare the Qwen3 series base models with the Qwen2.5 base models (Yang et al., 2024b) and other leading open-source base models, including DeepSeek-V3 Base (Liu et al., 2024a), Gemma-3 (Team et al., 2025), Llama-3 (Dubey et al., 2024), and Llama-4 (Meta-AI, 2025) series base models, in terms of scale of parameters. All models are evaluated using the same evaluation pipeline and the widely-used evaluation settings to ensure fair comparison.

Base 对照含 Qwen2.5 Base 与 DeepSeek-V3 Base, Gemma-3, Llama-3, Llama-4 等开源 Base, 按参数规模对齐. 统一评测流水与常用设置以保证公平.

Summary of Evaluation Results Based on the overall evaluation results, we highlight some key conclusions of Qwen3 base models.

评测小结: 基于总体结果, 突出 Qwen3 Base 的若干关键结论.

(1) Compared with the previously open-source SOTA dense and MoE base models (such as DeepSeek-V3 Base, Llama-4-Maverick Base, and Qwen2.5-72B-Base), Qwen3-235B-A22B-Base outperforms these models in most tasks with significantly fewer total parameters or activated parameters.

(1) 相对此前开源 SOTA Dense/MoE Base (如 DeepSeek-V3 Base, Llama-4-Maverick Base, Qwen2.5-72B-Base), Qwen3-235B-A22B-Base 在多数任务上以明显更少总参或激活参取胜.

(2) For the Qwen3 MoE base models, our experimental results indicate that: (a) Using the same pre-training data, Qwen3 MoE base models can achieve similar performance to Qwen3 dense base models with only 1/5 activated parameters. (b) Due to the improvements of the Qwen3 MoE architecture, the scale-up of the training tokens, and more advanced training strategies, the Qwen3 MoE base models can outperform the Qwen2.5 MoE base models with less than 1/2 activated parameters and fewer total parameters. (c) Even with 1/10 of the activated parameters of the Qwen2.5 dense base model, the Qwen3 MoE base model can achieve comparable performance, which brings us significant advantages in inference and training costs.

(2) MoE Base: (a) 同数据下仅约 1/5 激活参可逼近同代 Dense; (b) 架构, 数据与策略改进后, 以不到 1/2 激活参与更少总参超过 Qwen2.5 MoE Base; (c) 即使激活参仅为 Qwen2.5 Dense 的约 1/10 也可比, 推理与训练成本优势明显.

(3) The overall performance of the Qwen3 dense base models is comparable to the Qwen2.5 base models at higher parameter scales. For example, Qwen3-1.7B/4B/8B/14B/32B-Base achieve comparable performance to Qwen2.5-3B/7B/14B/32B/72B-Base, respectively. Especially in STEM, coding, and reasoning benchmarks, the performance of Qwen3 dense base models even surpasses Qwen2.5 base models at higher parameter scales.

(3) Dense Base 整体可比更高参数档的 Qwen2.5 Base, 例如 1.7B/4B/8B/14B/32B 分别对上 3B/7B/14B/32B/72B. STEM, 编码与推理上甚至超过更高档 Qwen2.5.

The detailed results are as follows.

详细结果如下.

Qwen3-235B-A22B-Base We compare Qwen3-235B-A22B-Base to our previous similar-sized MoE Qwen2.5-Plus-Base (Yang et al., 2024b) and other leading open-source base models: Llama-4-Maverick (Meta-AI, 2025), Qwen2.5-72B-Base (Yang et al., 2024b), DeepSeek-V3 Base (Liu et al., 2024a). From the results in Table 3, the Qwen3-235B-A22B-Base model attains the highest performance scores across most of the evaluated benchmarks. We further compare Qwen3-235B-A22B-Base with other baselines separately for the detailed analysis.

Qwen3-235B-A22B-Base 对照同规模 MoE Qwen2.5-Plus-Base 以及 Llama-4-Maverick, Qwen2.5-72B-Base, DeepSeek-V3 Base. 表 3 显示其在多数基准上最高. 下面分别细比.

(1) Compared with the recently open-source model Llama-4-Maverick-Base, which has about twice the number of parameters, Qwen3-235B-A22B-Base still performs better on most benchmarks.

(1) 相对参数约大一倍的 Llama-4-Maverick-Base, 仍在多数基准上更好.

(2) Compared with the previously state-of-the-art open-source model DeepSeek-V3-Base, Qwen3-235B-A22B-Base outperforms DeepSeek-V3-Base on 14 out of 15 evaluation benchmarks with only about 1/3 the total number of parameters and 2/3 activated parameters, demonstrating the powerful and cost-effectiveness of our models.

(2) 相对 DeepSeek-V3-Base, 以约 1/3 总参与 2/3 激活参在 15 项中赢 14 项, 显示强与省.

(3) Compared with our previous MoE Qwen2.5-Plus of similar size, Qwen3-235B-A22B-Base significantly outperforms it with fewer parameters and activated parameters, which shows the remarkable advantages of Qwen3 in pre-training data, training strategy, and model architecture.

(3) 相对同规模上代 MoE Qwen2.5-Plus, 以更少总参与激活参显著超过, 体现数据, 策略与架构优势.

(4) Compared with our previous flagship open-source dense model Qwen2.5-72B-Base, Qwen3-235B-A22B-Base surpasses the latter in all benchmarks and uses fewer than 1/3 of the activated parameters. Meanwhile, due to the advantage of the model architecture, the inference costs and training costs on each trillion tokens of Qwen3-235B-A22B-Base are much cheaper than those of Qwen2.5-72B-Base.

(4) 相对上代旗舰 Dense Qwen2.5-72B-Base, 全基准超过且激活参不到 1/3; 架构优势下每万亿 token 的推理与训练成本也更低.

Qwen3-32B-Base Qwen3-32B-Base is our largest dense model among the Qwen3 series. We compare it to the baselines of similar sizes, including Gemma-3-27B (Team et al., 2025) and Qwen2.5-32B (Yang et al., 2024b). In addition, we introduce two strong baselines: the recently open-source MoE model Llama-4-Scout, which has three times the parameters of Qwen3-32B-Base but half the activated parameters;

Qwen3-32B-Base 是系列最大 Dense. 对照同规模 Gemma-3-27B 与 Qwen2.5-32B, 并引入更强对照: Llama-4-Scout (总参约三倍, 激活参约一半) 以及上代旗舰 Dense Qwen2.5-72B-Base.

<!-- page 6 of 35 -->

Table 3: Comparison among Qwen3-235B-A22B-Base and other representative strong open-source baselines. The highest, the second-best scores are shown in bold and underlined, respectively.

表 3: Comparison among Qwen3-235B-A22B-Base and other representative strong open-source baselines. The highest, the second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Qwen2.5-72B Base</td><td>Qwen2.5-Plus Base</td><td>Llama-4-Maverick Base</td><td>DeepSeek-V3 Base</td><td>Qwen3-235B-A22B Base</td></tr><tr><td>Architecture</td><td>Dense</td><td>MoE</td><td>MoE</td><td>MoE</td><td>MoE</td></tr><tr><td># Total Params</td><td>72B</td><td>271B</td><td>402B</td><td>671B</td><td>235B</td></tr><tr><td># Activated Params</td><td>72B</td><td>37B</td><td>17B</td><td>37B</td><td>22B</td></tr><tr><td colspan="6">General Tasks</td></tr><tr><td>MMLU</td><td>86.06</td><td>85.02</td><td>85.16</td><td>87.19</td><td>87.81</td></tr><tr><td>MMLU-Redux</td><td>83.91</td><td>82.69</td><td>84.05</td><td>86.14</td><td>87.40</td></tr><tr><td>MMLU-Pro</td><td>58.07</td><td>63.52</td><td>63.91</td><td>59.84</td><td>68.18</td></tr><tr><td>SuperGPQA</td><td>36.20</td><td>37.18</td><td>40.85</td><td>41.53</td><td>44.06</td></tr><tr><td>BBH</td><td>86.30</td><td>85.60</td><td>83.62</td><td>86.22</td><td>88.87</td></tr><tr><td colspan="6">Math &amp; STEM Tasks</td></tr><tr><td>GPQA</td><td>45.88</td><td>41.92</td><td>43.94</td><td>41.92</td><td>47.47</td></tr><tr><td>GSM8K</td><td>91.50</td><td>91.89</td><td>87.72</td><td>87.57</td><td>94.39</td></tr><tr><td>MATH</td><td>62.12</td><td>62.78</td><td>63.32</td><td>62.62</td><td>71.84</td></tr><tr><td colspan="6">Coding Tasks</td></tr><tr><td>EvalPlus</td><td>65.93</td><td>61.43</td><td>68.38</td><td>63.75</td><td>77.60</td></tr><tr><td>MultiPL-E</td><td>58.70</td><td>62.16</td><td>57.28</td><td>62.26</td><td>65.94</td></tr><tr><td>MBPP</td><td>76.00</td><td>74.60</td><td>75.40</td><td>74.20</td><td>81.40</td></tr><tr><td>CRUX-O</td><td>66.20</td><td>68.50</td><td>77.00</td><td>76.60</td><td>79.00</td></tr><tr><td colspan="6">Multilingual Tasks</td></tr><tr><td>MGSM</td><td>82.40</td><td>82.21</td><td>79.69</td><td>82.68</td><td>83.53</td></tr><tr><td>MMMLU</td><td>84.40</td><td>83.49</td><td>83.09</td><td>85.88</td><td>86.70</td></tr><tr><td>INCLUDE</td><td>69.05</td><td>66.97</td><td>73.47</td><td>75.17</td><td>73.46</td></tr></table>

Table 4: Comparison among Qwen3-32B-Base and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 4: Comparison among Qwen3-32B-Base and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Qwen2.5-32B Base</td><td>Qwen2.5-72B Base</td><td>Gemma-3-27B Base</td><td>Llama-4-Scout Base</td><td>Qwen3-32B Base</td></tr><tr><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>MoE</td><td>Dense</td></tr><tr><td># Total Params</td><td>32B</td><td>72B</td><td>27B</td><td>109B</td><td>32B</td></tr><tr><td># Activated Params</td><td>32B</td><td>72B</td><td>27B</td><td>17B</td><td>32B</td></tr><tr><td colspan="6">General Tasks</td></tr><tr><td>MMLU</td><td>83.32</td><td>86.06</td><td>78.69</td><td>78.27</td><td>83.61</td></tr><tr><td>MMLU-Redux</td><td>81.97</td><td>83.91</td><td>76.53</td><td>71.09</td><td>83.41</td></tr><tr><td>MMLU-Pro</td><td>55.10</td><td>58.07</td><td>52.88</td><td>56.13</td><td>65.54</td></tr><tr><td>SuperGPQA</td><td>33.55</td><td>36.20</td><td>29.87</td><td>26.51</td><td>39.78</td></tr><tr><td>BBH</td><td>84.48</td><td>86.30</td><td>79.95</td><td>82.40</td><td>87.38</td></tr><tr><td colspan="6">Math &amp; STEM Tasks</td></tr><tr><td>GPQA</td><td>47.97</td><td>45.88</td><td>26.26</td><td>40.40</td><td>49.49</td></tr><tr><td>GSM8K</td><td>92.87</td><td>91.50</td><td>81.20</td><td>85.37</td><td>93.40</td></tr><tr><td>MATH</td><td>57.70</td><td>62.12</td><td>51.78</td><td>51.66</td><td>61.62</td></tr><tr><td colspan="6">Coding Tasks</td></tr><tr><td>EvalPlus</td><td>66.25</td><td>65.93</td><td>55.78</td><td>59.90</td><td>72.05</td></tr><tr><td>MultiPL-E</td><td>58.30</td><td>58.70</td><td>45.03</td><td>47.38</td><td>67.06</td></tr><tr><td>MBPP</td><td>73.60</td><td>76.00</td><td>68.40</td><td>68.60</td><td>78.20</td></tr><tr><td>CRUX-O</td><td>67.80</td><td>66.20</td><td>60.00</td><td>61.90</td><td>72.50</td></tr><tr><td colspan="6">Multilingual Tasks</td></tr><tr><td>MGSM</td><td>78.12</td><td>82.40</td><td>73.74</td><td>79.93</td><td>83.06</td></tr><tr><td>MMMLU</td><td>82.40</td><td>84.40</td><td>77.62</td><td>74.83</td><td>83.83</td></tr><tr><td>INCLUDE</td><td>64.35</td><td>69.05</td><td>68.94</td><td>68.09</td><td>67.87</td></tr></table>

<!-- page 7 of 35 -->

Table 5: Comparison among Qwen3-14B-Base, Qwen3-30B-A3B-Base, and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 5: Comparison among Qwen3-14B-Base, Qwen3-30B-A3B-Base, and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Gemma-3-12B Base</td><td>Qwen2.5-14B Base</td><td>Qwen2.5-32B Base</td><td>Qwen2.5-Turbo Base</td><td>Qwen3-14B Base</td><td>Qwen3-30B-A3B Base</td></tr><tr><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>MoE</td><td>Dense</td><td>MoE</td></tr><tr><td># Total Params</td><td>12B</td><td>14B</td><td>32B</td><td>42B</td><td>14B</td><td>30B</td></tr><tr><td># Activated Params</td><td>12B</td><td>14B</td><td>32B</td><td>6B</td><td>14B</td><td>3B</td></tr><tr><td colspan="7">General Tasks</td></tr><tr><td>MMLU</td><td>73.87</td><td>79.66</td><td>83.32</td><td>79.50</td><td>81.05</td><td>81.38</td></tr><tr><td>MMLU-Redux</td><td>70.70</td><td>76.64</td><td>81.97</td><td>77.11</td><td>79.88</td><td>81.17</td></tr><tr><td>MMLU-Pro</td><td>44.91</td><td>51.16</td><td>55.10</td><td>55.60</td><td>61.03</td><td>61.49</td></tr><tr><td>SuperGPQA</td><td>24.61</td><td>30.68</td><td>33.55</td><td>31.19</td><td>34.27</td><td>35.72</td></tr><tr><td>BBH</td><td>74.28</td><td>78.18</td><td>84.48</td><td>76.10</td><td>81.07</td><td>81.54</td></tr><tr><td colspan="7">Math &amp; STEM Tasks</td></tr><tr><td>GPQA</td><td>31.31</td><td>32.83</td><td>47.97</td><td>41.41</td><td>39.90</td><td>43.94</td></tr><tr><td>GSM8K</td><td>78.01</td><td>90.22</td><td>92.87</td><td>88.32</td><td>92.49</td><td>91.81</td></tr><tr><td>MATH</td><td>44.43</td><td>55.64</td><td>57.70</td><td>55.60</td><td>62.02</td><td>59.04</td></tr><tr><td colspan="7">Coding Tasks</td></tr><tr><td>EvalPlus</td><td>52.65</td><td>60.70</td><td>66.25</td><td>61.23</td><td>72.23</td><td>71.45</td></tr><tr><td>MultiPL-E</td><td>43.03</td><td>54.79</td><td>58.30</td><td>53.24</td><td>61.69</td><td>66.53</td></tr><tr><td>MBPP</td><td>60.60</td><td>69.00</td><td>73.60</td><td>67.60</td><td>73.40</td><td>74.40</td></tr><tr><td>CRUX-O</td><td>52.00</td><td>61.10</td><td>67.80</td><td>60.20</td><td>68.60</td><td>67.20</td></tr><tr><td colspan="7">Multilingual Tasks</td></tr><tr><td>MGSM</td><td>64.35</td><td>74.68</td><td>78.12</td><td>70.45</td><td>79.20</td><td>79.11</td></tr><tr><td>MMMLU</td><td>72.50</td><td>78.34</td><td>82.40</td><td>79.76</td><td>79.69</td><td>81.46</td></tr><tr><td>INCLUDE</td><td>63.34</td><td>60.26</td><td>64.35</td><td>59.25</td><td>64.55</td><td>67.00</td></tr></table>

Table 6: Comparison among Qwen8B-Base and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 6: Comparison among Qwen8B-Base and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Llama-3-8B Base</td><td>Qwen2.5-7B Base</td><td>Qwen2.5-14B Base</td><td>Qwen3-8B Base</td></tr><tr><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td></tr><tr><td># Total Params</td><td>8B</td><td>7B</td><td>14B</td><td>8B</td></tr><tr><td># Activated Params</td><td>8B</td><td>7B</td><td>14B</td><td>8B</td></tr><tr><td colspan="5">General Tasks</td></tr><tr><td>MMLU</td><td>66.60</td><td>74.16</td><td>79.66</td><td>76.89</td></tr><tr><td>MMLU-Redux</td><td>61.59</td><td>71.06</td><td>76.64</td><td>76.17</td></tr><tr><td>MMLU-Pro</td><td>35.36</td><td>45.00</td><td>51.16</td><td>56.73</td></tr><tr><td>SuperGPQA</td><td>20.54</td><td>26.34</td><td>30.68</td><td>31.64</td></tr><tr><td>BBH</td><td>57.70</td><td>70.40</td><td>78.18</td><td>78.40</td></tr><tr><td colspan="5">Math &amp; STEM Tasks</td></tr><tr><td>GPQA</td><td>25.80</td><td>36.36</td><td>32.83</td><td>44.44</td></tr><tr><td>GSM8K</td><td>55.30</td><td>85.36</td><td>90.22</td><td>89.84</td></tr><tr><td>MATH</td><td>20.50</td><td>49.80</td><td>55.64</td><td>60.80</td></tr><tr><td colspan="5">Coding Tasks</td></tr><tr><td>EvalPlus</td><td>44.13</td><td>62.18</td><td>60.70</td><td>67.65</td></tr><tr><td>MultiPL-E</td><td>31.45</td><td>50.73</td><td>54.79</td><td>58.75</td></tr><tr><td>MBPP</td><td>48.40</td><td>63.40</td><td>69.00</td><td>69.80</td></tr><tr><td>CRUX-O</td><td>36.80</td><td>48.50</td><td>61.10</td><td>62.00</td></tr><tr><td colspan="5">Multilingual Tasks</td></tr><tr><td>MGSM</td><td>38.92</td><td>63.60</td><td>74.68</td><td>76.02</td></tr><tr><td>MMMLU</td><td>59.65</td><td>71.34</td><td>78.34</td><td>75.72</td></tr><tr><td>IINCLUDE</td><td>44.94</td><td>53.98</td><td>60.26</td><td>59.40</td></tr></table>

<!-- page 8 of 35 -->

Table 7: Comparison among Qwen3-4B-Base and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 7: Comparison among Qwen3-4B-Base and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Gemma-3-4B Base</td><td>Qwen2.5-3B Base</td><td>Qwen2.5-7B Base</td><td>Qwen3-4B Base</td></tr><tr><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td></tr><tr><td># Total Params</td><td>4B</td><td>3B</td><td>7B</td><td>4B</td></tr><tr><td># Activated Params</td><td>4B</td><td>3B</td><td>7B</td><td>4B</td></tr><tr><td colspan="5">General Tasks</td></tr><tr><td>MMLU</td><td>59.51</td><td>65.62</td><td>74.16</td><td>72.99</td></tr><tr><td>MMLU-Redux</td><td>56.91</td><td>63.68</td><td>71.06</td><td>72.79</td></tr><tr><td>MMLU-Pro</td><td>29.23</td><td>34.61</td><td>45.00</td><td>50.58</td></tr><tr><td>SuperGPQA</td><td>17.68</td><td>20.31</td><td>26.34</td><td>28.43</td></tr><tr><td>BBH</td><td>51.70</td><td>56.30</td><td>70.40</td><td>72.59</td></tr><tr><td colspan="5">Math &amp; STEM Tasks</td></tr><tr><td>GPQA</td><td>24.24</td><td>26.26</td><td>36.36</td><td>36.87</td></tr><tr><td>GSM8K</td><td>43.97</td><td>79.08</td><td>85.36</td><td>87.79</td></tr><tr><td>MATH</td><td>26.10</td><td>42.64</td><td>49.80</td><td>54.10</td></tr><tr><td colspan="5">Coding Tasks</td></tr><tr><td>EvalPlus</td><td>43.23</td><td>46.28</td><td>62.18</td><td>63.53</td></tr><tr><td>MultiPL-E</td><td>28.06</td><td>39.65</td><td>50.73</td><td>53.13</td></tr><tr><td>MBPP</td><td>46.40</td><td>54.60</td><td>63.40</td><td>67.00</td></tr><tr><td>CRUX-O</td><td>34.00</td><td>36.50</td><td>48.50</td><td>55.00</td></tr><tr><td colspan="5">Multilingual Tasks</td></tr><tr><td>MGSM</td><td>33.11</td><td>47.53</td><td>63.60</td><td>67.74</td></tr><tr><td>MMMLU</td><td>59.62</td><td>65.55</td><td>71.34</td><td>71.42</td></tr><tr><td>INCLUDE</td><td>49.06</td><td>45.90</td><td>53.98</td><td>56.29</td></tr></table>

Table 8: Comparison among Qwen3-1.7B-Base, Qwen3-0.6B-Base, and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 8: Comparison among Qwen3-1.7B-Base, Qwen3-0.6B-Base, and other strong open-source baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Qwen2.5-0.5B Base</td><td>Qwen3-0.6B Base</td><td>Gemma-3-1B Base</td><td>Qwen2.5-1.5B Base</td><td>Qwen3-1.7B Base</td></tr><tr><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td></tr><tr><td># Total Params</td><td>0.5B</td><td>0.6B</td><td>1B</td><td>1.5B</td><td>1.7B</td></tr><tr><td># Activated Params</td><td>0.5B</td><td>0.6B</td><td>1B</td><td>1.5B</td><td>1.7B</td></tr><tr><td colspan="6">General Tasks</td></tr><tr><td>MMLU</td><td>47.50</td><td>52.81</td><td>26.26</td><td>60.90</td><td>62.63</td></tr><tr><td>MMLU-Redux</td><td>45.10</td><td>51.26</td><td>25.99</td><td>58.46</td><td>61.66</td></tr><tr><td>MMLU-Pro</td><td>15.69</td><td>24.74</td><td>9.72</td><td>28.53</td><td>36.76</td></tr><tr><td>SuperGPQA</td><td>11.30</td><td>15.03</td><td>7.19</td><td>17.64</td><td>20.92</td></tr><tr><td>BBH</td><td>20.30</td><td>41.47</td><td>28.13</td><td>45.10</td><td>54.47</td></tr><tr><td colspan="6">Math &amp; STEM Tasks</td></tr><tr><td>GPQA</td><td>24.75</td><td>26.77</td><td>24.75</td><td>24.24</td><td>28.28</td></tr><tr><td>GSM8K</td><td>41.62</td><td>59.59</td><td>2.20</td><td>68.54</td><td>75.44</td></tr><tr><td>MATH</td><td>19.48</td><td>32.44</td><td>3.66</td><td>35.00</td><td>43.50</td></tr><tr><td colspan="6">Coding Tasks</td></tr><tr><td>EvalPlus</td><td>31.85</td><td>36.23</td><td>8.98</td><td>44.80</td><td>52.70</td></tr><tr><td>MultiPL-E</td><td>18.70</td><td>24.58</td><td>5.15</td><td>33.10</td><td>42.71</td></tr><tr><td>MBPP</td><td>29.80</td><td>36.60</td><td>9.20</td><td>43.60</td><td>55.40</td></tr><tr><td>CRUX-O</td><td>12.10</td><td>27.00</td><td>3.80</td><td>29.60</td><td>36.40</td></tr><tr><td colspan="6">Multilingual Tasks</td></tr><tr><td>MGSM</td><td>12.07</td><td>30.99</td><td>1.74</td><td>32.82</td><td>50.71</td></tr><tr><td>MMMLU</td><td>31.53</td><td>50.16</td><td>26.57</td><td>60.27</td><td>63.27</td></tr><tr><td>INCLUDE</td><td>24.74</td><td>34.26</td><td>25.62</td><td>39.55</td><td>45.57</td></tr></table>

<!-- page 9 of 35 -->

and our previous flagship open-source dense model Qwen2.5-72B-Base, which has more than twice the number of parameters compared to Qwen3-32B-Base. The results are shown in Table 4, which support three key conclusions:

(1) Compared with the similar-sized models, Qwen3-32B-Base outperforms Qwen2.5-32B-Base and Gemma-3-27B Base on most benchmarks. Notably, Qwen3-32B-Base achieves 65.54 on MMLU-Pro and 39.78 on SuperGPQA, significantly outperforming its predecessor Qwen2.5-32B-Base. In addition, Qwen3-32B-Base achieves significantly higher encoding benchmark scores than all baseline models.

(1) 相对同规模, 多数基准超过 Qwen2.5-32B-Base 与 Gemma-3-27B Base. MMLU-Pro 65.54, SuperGPQA 39.78, 明显高于上代 32B; 编码基准也全面更高.

(2) Surprisingly, we find that Qwen3-32B-Base achieves competitive results compared to Qwen2.5-72B-Base. Although Qwen3-32B-Base has less than half the number of parameters of Qwen2.5-72B-Base, it outperforms Qwen2.5-72B-Base in 10 of the 15 evaluation benchmarks. On coding, mathematics, and reasoning benchmarks, Qwen3-32B-Base has remarkable advantages.

(2) 相对 Qwen2.5-72B-Base 仍有竞争力: 参数不到一半, 15 项中赢 10 项; 编码, 数学与推理优势明显.

(3) Compared to Llama-4-Scout-Base, Qwen3-32B-Base significantly outperforms it on all 15 benchmarks, with only one-third of the number of parameters of Llama-4-Scout-Base, but twice the number of activated parameters.

(3) 相对 Llama-4-Scout-Base, 15 项全胜; 总参约三分之一, 激活参约两倍.

Qwen3-14B-Base & Qwen3-30B-A3B-Base The evaluation of the Qwen3-14B-Base and Qwen3-30B-A3B-Base is compared against baselines of similar sizes, including Gemma-3-12B Base, Qwen2.5-14B Base. Similarly, we also introduce two strong baselines: (1) Qwen2.5-Turbo (Yang et al., 2024b), which has 42B parameters and 6B activated parameters. Note that its activated parameters are twice those of Qwen3-30B-A3B-Base. (2) Qwen2.5-32B-Base, which has 11 times the activated parameters of Qwen3-30B-A3B and more than twice that of Qwen3-14B. The results are shown in Table 5, where we can draw the following conclusions.

14B-Base 与 30B-A3B-Base 对照同规模 Gemma-3-12B, Qwen2.5-14B, 以及更强对照 Qwen2.5-Turbo (42B/6B 激活, 激活约为 30B-A3B 两倍) 与 Qwen2.5-32B-Base (激活约为 30B-A3B 的 11 倍, 约为 14B 两倍以上). 见表 5.

(1) Compared with the similar-sized models, Qwen3-14B-Base significantly performs better than Qwen2.5-14B-Base and Gemma-3-12B-Base on all 15 benchmarks.

(1) 14B-Base 在全部 15 项上明显超过 Qwen2.5-14B-Base 与 Gemma-3-12B-Base.

(2) Similarly, Qwen3-14B-Base also achieves very competitive results compared to Qwen2.5-32B-Base with less than half of the parameters.

(2) 14B-Base 以不到一半参数对上 Qwen2.5-32B-Base 仍很有竞争力.

(3) With only 1/5 activated non-embedding parameters, Qwen3-30B-A3B significantly outperforms Qwen2.5-14B-Base on all tasks, and achieves comparable performance to Qwen3-14B-Base and Qwen2.5-32B-Base, which brings us significant advantages in inference and training costs.

(3) 30B-A3B 仅约 1/5 激活非嵌入参即在全部任务超过 Qwen2.5-14B-Base, 并与 14B-Base 及 Qwen2.5-32B-Base 可比, 推理与训练成本优势大.

Qwen3-8B / 4B / 1.7B / 0.6B-Base For edge-side models, we take similar-sized Qwen2.5, Llama-3, and Gemma-3 base models as the baselines. The results can be seen in Table 6, Table 7, and Table 8. All Qwen3 8B / 4B / 1.7B / 0.6B-Base models continue to maintain strong performance across nearly all benchmarks. Notably, Qwen3-8B / 4B / 1.7B-Base models even outperform larger size Qwen2.5-14B / 7B / 3B Base models on over half of the benchmarks, especially on STEM-related and coding benchmarks, reflecting the significant improvement of the Qwen3 models.

边侧 8B/4B/1.7B/0.6B-Base 对照同规模 Qwen2.5, Llama-3, Gemma-3 (表 6–8). 几乎全基准保持强; 8B/4B/1.7B 甚至在一半以上项目超过更大档 Qwen2.5-14B/7B/3B, STEM 与编码尤明显.

## 4 Post-training 后训练

![Image block](images/p09-figure-1-post-training-pipeline-of-the-qwen3-series.png)

Figure 1: Post-training pipeline of the Qwen3 series models.

图 1: Post-training pipeline of the Qwen3 series models.

<!-- page 10 of 35 -->

The post-training pipeline of Qwen3 is strategically designed with two core objectives:

后训练两个核心目标:

(1) Thinking Control: This involves the integration of two distinct modes, namely the “non-thinking” and “thinking” modes, providing users with the flexibility to choose whether the model should engage in reasoning or not, and to control the depth of thinking by specifying a token budget for the thinking process.

(1) Thinking Control: 整合 non-thinking 与 thinking, 用户可选择是否推理, 并用 token 预算控制思考深度.

> **停一下:** Thinking Control 和 Strong-to-Weak Distillation 是不是同一条流水?
> 不是. 前者是旗舰四段后训练的产品目标; 后者是轻量档用教师 logits 走捷径, 报告称约 1/10 GPU hours.

(2) Strong-to-Weak Distillation: This aims to streamline and optimize the post-training process for lightweight models. By leveraging the knowledge from large-scale models, we substantially reduce both the computational costs and the development efforts required for building smaller-scale models.

(2) Strong-to-Weak Distillation: 优化轻量档后训练, 借大模型知识大幅降低小模型算力与开发成本.

As illustrated in Figure 1, the flagship models in the Qwen3 series follow a sophisticated four-stage training process. The first two stages focus on developing the models' “thinking” abilities. The next two stages aim to integrate strong “non-thinking” functionalities into the models.

如图 1, 旗舰走四段: 前两段做 thinking, 后两段融入强 non-thinking.

Preliminary experiments suggest that directly distilling the output logits from teacher models into lightweight student models can effectively enhance their performance while maintaining fine-grained control over their reasoning processes. This approach eliminates the necessity of performing an exhaustive four-stage training process individually for every small-scale model. It leads to better immediate performance, as indicated by higher Pass@1 scores, and also improves the model's ability of exploration, as reflected in improved Pass@64 results. In addition, it achieves these gains with much greater training efficiency, requiring only 1/10 of the GPU hours compared to the four-stage training method.

初步实验表明, 把教师 logits 蒸给学生可抬表现并保留细粒度推理控制, 不必为每个小模型重跑四段; Pass@1 与 Pass@64 更好, GPU hours 约只需四段的 1/10.

> **再看:** 蒸馏省算力, 会不会只抬 Pass@1, 伤探索?
> 报告相反: 蒸馏同时抬 Pass@1 与 Pass@64, 而对照 RL 在表 21 上 Pass@64 不涨.

In the following sections, we present the four-stage training process and provide a detailed explanation of the Strong-to-Weak Distillation approach.

下文展开四段训练, 并详述 Strong-to-Weak Distillation.

### 4.1 Long-CoT Cold Start 长 CoT 冷启动

We begin by curating a comprehensive dataset that spans a wide range of categories, including math, code, logical reasoning, and general STEM problems. Each problem in the dataset is paired with verified reference answers or code-based test cases. This dataset serves as the foundation for the “cold start” phase of long Chain-of-Thought (long-CoT) training.

先整理覆盖数学, 代码, 逻辑与通用 STEM 的数据, 每题配已验证答案或代码测试, 作为 long-CoT 冷启动基础.

The dataset construction involves a rigorous two-phase filtering process: query filtering and response filtering. In the query filtering phase, we use Qwen2.5-72B-Instruct to identify and remove queries that are not easily verifiable. This includes queries containing multiple sub-questions or those asking for general text generation. Furthermore, we exclude queries that Qwen2.5-72B-Instruct can answer correctly without using CoT reasoning. This helps prevent the model from relying on superficial guessing and ensures that only complex problems requiring deeper reasoning are included. Additionally, we annotate each query's domain using Qwen2.5-72B-Instruct to maintain balanced domain representation across the dataset.

数据构造两阶段过滤: 查询过滤与响应过滤. 查询侧用 Qwen2.5-72B-Instruct 去掉难验证, 多小题, 纯生成, 以及不用 CoT 也能答对的题, 并做领域标注以平衡.

After reserving a validation query set, we generate N candidate responses for each remaining query using QwQ-32B (Qwen Team, 2025). When QwQ-32B consistently fails to generate correct solutions, human annotators manually assess the accuracy of the responses. For queries with positive Pass@N, further stringent filtering criteria are applied to remove responses that (1) yield incorrect final answers, (2) contain substantial repetition, (3) clearly indicate guesswork without adequate reasoning, (4) exhibit inconsistencies between the thinking and summary contents, (5) involve inappropriate language mixing or stylistic shifts, or (6) are suspected of being overly similar to potential validation set items. Subsequently, a carefully selected subset of the refined dataset is used for the initial cold-start training of the reasoning patterns. The objective at this stage is to instill foundational reasoning patterns in the model without overly emphasizing immediate reasoning performance. This approach ensures that the model's potential is not limited, allowing for greater flexibility and improvement during the subsequent reinforcement learning (RL) phase. To achieve this objective effectively, it is preferable to minimize both the number of training samples and the training steps during this preparatory phase.

留出验证查询后, 用 QwQ-32B 为每查询生成 N 条候选; 持续失败则人工审. Pass@N 为正时再严滤错答, 重复, 无推理乱猜, 思考与摘要不一致, 语码混杂, 以及疑似撞验证集. 再用精选集做冷启动, 目标是种推理模式而非刷满即时分数, 样本与步数宜少.

### 4.2 Reasoning RL 推理强化学习

The query-verifier pairs used in the Reasoning RL stage must satisfy the following four criteria: (1) They were not used during the cold-start phase. (2) They are learnable for the cold-start model. (3) They are as challenging as possible. (4) They cover a broad range of sub-domains. We ultimately collect a total of 3,995 query-verifier pairs, and employed GRPO (Shao et al., 2024) to update the model parameters. We observe that using a large batch size and a high number of rollouts per query, along with off-policy training to improve sample efficiency, is beneficial to the training process. We have also addressed how to balance exploration and exploitation by controlling the model's entropy to increase steadily or remain

Reasoning RL 的 query-verifier 须满足: 未进冷启动, 对冷启动模型可学, 尽量难, 子域广. 共 3,995 对, 用 GRPO 更新. 大批次, 高 rollout 与 off-policy 有益; 用熵控制探索. 单次 run 中奖励与验证分一致上升, 例如 235B-A22B 的 AIME'24 在约 170 步从 70.1 到 85.1.

> **拆开:** Reasoning RL 里报告用来稳住探索-利用、从而单次 run 不用手拧超参的旋钮是哪些?
> §4.2: 大批次, 每查询高 rollout, 再加 off-policy 提样本效率; 同时把熵控成稳步上升或持平. 70.1→85.1 的轨迹写在同段, 对外最终分见表 11.

<!-- page 11 of 35 -->

Table 9: Examples of SFT data for thinking and non-thinking modes during the thinking mode fusion stage. For the thinking mode, the /think flag can be omitted since it represents the default behavior. This feature has been implemented in the chat template$^{1}$ supported by the Hugging Face's tokenizer, where the thinking mode can be disabled using an additional parameter enable\_thinking=False.

表 9: Examples of SFT data for thinking and non-thinking modes during the thinking mode fusion stage. For the thinking mode, the /think flag can be omitted since it represents the default behavior. This feature has been implemented in the chat template$^{1}$ supported by the Hugging Face's tokenizer, where the thinking mode can be disabled using an additional parameter enable\_thinking=False.

| Thinking Mode | Non-Thinking Mode |
| --- | --- |
|  |  |
| {query} /think |  |

stable, which is crucial for maintaining stable training. As a result, we achieve consistent improvements in both training reward and validation performance over the course of a single RL run, without any manual intervention on hyperparameters. For instance, the AIME'24 score of the Qwen3-235B-A22B model increases from 70.1 to 85.1 over a total of 170 RL training steps.

### 4.3 Thinking Mode Fusion 思考模式融合

The goal of the Thinking Mode Fusion stage is to integrate the “non-thinking” capabilities into the previously developed “thinking” model. This approach allows developers to manage and control reasoning behaviors, while also reducing the cost and complexity of deploying separate models for thinking and non-thinking tasks. To achieve this, we conduct continual supervised fine-tuning (SFT) on the Reasoning RL model and design a chat template to fuse the two modes. Moreover, we find that models capable of handling both modes proficiently perform consistently well under different thinking budgets.

Thinking Mode Fusion 要把 non-thinking 融进已具备 thinking 的模型, 降低双模型部署成本. 对 Reasoning RL 模型继续 SFT, 并设计 chat template; 双模式熟练的模型在不同 thinking budget 下也稳定.

Construction of SFT data. The SFT dataset combines both the “thinking” and “non-thinking” data. To ensure that the performance of the Stage 2 model is not compromised by the additional SFT, the “thinking” data is generated via rejection sampling on Stage 1 queries using the Stage 2 model itself. The “non-thinking” data, on the other hand, is carefully curated to cover a diverse range of tasks, including coding, mathematics, instruction-following, multilingual tasks, creative writing, question answering, and role-playing. Additionally, we employ automatically generated checklists for assessing the response quality of “non-thinking” data. To enhance the performance on tasks with low-resource languages, we particularly increase the proportion of translation tasks.

SFT 数据混合 thinking 与 non-thinking. thinking 数据用 Stage 2 模型对 Stage 1 查询拒绝采样, 以免冲掉 Stage 2. non-thinking 覆盖代码, 数学, 指令, 多语, 创作, QA, 角色扮演等, 并用自动清单评估; 低资源语加强翻译比例.

> **核对:** Fusion 的 thinking 数据为何用 Stage 2 自身做拒绝采样, 而不是继续用冷启动时的 QwQ-32B?
> §4.3 写明要避免额外 SFT 损害 Stage 2; 因此 thinking 轨迹由 Stage 2 模型对 Stage 1 查询拒绝采样生成, 让分布贴住刚训完的 Reasoning RL 策略, 而不是再灌一版外部教师风格.

Chat Template Design. To better integrate the two modes and enable users to dynamically switch the model's thinking process, we design chat templates for Qwen3, as shown in Table 9. Specifically, for samples in thinking mode and non-thinking mode, we introduce /think and /no\_think flags in the user query or system message, respectively. This allows the model to follow the user's input and select the appropriate thinking mode accordingly. For non-thinking mode samples, we retain an empty thinking block in the assistant's response. This design ensures internal format consistency within the model and allows developers to prevent the model from engaging in thinking behavior by concatenating an empty think block in the chat template. By default, the model operates in thinking mode; therefore, we add some thinking mode training samples where the user queries do not include /think flags. For more complex multi-turn dialogs, we randomly insert multiple /think and /no\_think flags into users' queries, with the model response adhering to the last flag encountered.

chat template 在用户/系统侧引入 /think 与 /no_think. non-thinking 样本保留空 thinking 块以统一格式, 部署可拼空块禁想. 默认 thinking, 故部分 thinking 样本不含 /think. 多轮随机插入多个开关时, 以最后一次为准.

Thinking Budget. An additional advantage of Thinking Mode Fusion is that, once the model learns to respond in both non-thinking and thinking modes, it naturally develops the ability to handle intermediate cases—generating responses based on incomplete thinking. This capability lays the foundation for implementing budget control over the model's thinking process. Specifically, when the length of the model's thinking reaches a user-defined threshold, we manually halt the thinking process and insert the stop-thinking instruction: "Considering the limited time by the user, I have to give the solution based on the thinking directly now.\n&lt;/think&gt;.\n\n". After this instruction is inserted, the model proceeds to generate a final response based on its accumulated reasoning up to that point. It is worth noting that this ability is not explicitly trained but emerges naturally as a result of applying Thinking Mode Fusion.

Fusion 后模型自然能处理不完整思考, 从而支持 budget: 思考长度触顶则插入停想指令并 </think>, 再基于已有思考作答. 该能力未显式单训, 由 Fusion 涌现.

<!-- page 12 of 35 -->

### 4.4 General RL 通用强化学习

The General RL stage aims to broadly enhance the models' capabilities and stability across diverse scenarios. To facilitate this, we have established a sophisticated reward system covering over 20 distinct tasks, each with customized scoring criteria. These tasks specifically target enhancements in the following core capabilities:

General RL 广泛增强多样场景能力与稳定性, 建立覆盖 20+ 任务的奖励系统, 针对指令遵循, 格式遵循, 偏好对齐, Agent 真环境多轮, 以及 RAG 等专项.

\- Instruction Following: This capability ensures that models accurately interpret and follow user instructions, including requirements related to content, format, length, and the use of structured output, delivering responses that align with user expectations.

\- Format Following: In addition to explicit instructions, we expect the model to adhere to specific formatting conventions. For instance, it should respond appropriately to the /think and /no\_think flags by switching between thinking and non-thinking modes, and consistently use designated tokens (e.g., &lt;think&gt; and &lt;/think&gt;) to separate the thinking and response parts in the final output.

\- Preference Alignment: For open-ended queries, preference alignment focuses on improving the model's helpfulness, engagement, and style, ultimately delivering a more natural and satisfying user experience.

\- Agent Ability: This involves training the model to correctly invoke tools via designated interfaces. During the RL rollout, the model is allowed to perform complete multi-turn interaction cycles with real environment execution feedback, thereby improving its performance and stability in long-horizon decision-making tasks.

\- Abilities for Specialized Scenarios: In more specialized scenarios, we design tasks tailored to the specific context. For example, in Retrieval-Augmented Generation (RAG) tasks, we incorporate reward signals to guide the model toward generating accurate and contextually appropriate responses, thereby minimizing the risk of hallucination.

To provide feedback for the aforementioned tasks, we utilized three distinct types of rewards:

反馈用三类奖励: (1) 规则奖励, 高精度防 hacking; (2) 带参考答案的模型评分 (Qwen2.5-72B-Instruct); (3) 无参考的偏好奖励模型, 覆盖更广开放题.

(1) Rule-based Reward: The rule-based reward has been widely used in the reasoning RL stage, and is also useful for general tasks such as instruction following (Lambert et al., 2024) and format adherence. Well-designed rule-based rewards can assess the correctness of model outputs with high precision, preventing issues like reward hacking.

(1) 规则奖励: 已在 Reasoning RL 阶段广泛使用, 也适用于指令遵循与格式遵守等通用任务. 设计良好的规则奖励可高精度判断输出正误, 抑制 reward hacking.

(2) Model-based Reward with Reference Answer: In this approach, we provide a reference answer for each query and prompt Qwen2.5-72B-Instruct to score the model's response based on this reference. This method allows for more flexible handling of diverse tasks without requiring strict formatting, avoiding false negatives that can occur with purely rule-based rewards.

(2) 带参考答案的模型奖励: 为每查询提供参考, 让 Qwen2.5-72B-Instruct 据此打分. 更灵活覆盖多样任务, 不必严格式, 可减少纯规则奖励的假阴性.

(3) Model-based Reward without Reference Answer: Leveraging human preference data, we train a reward model to assign scalar scores to model responses. This approach, which does not depend on a reference answer, can handle a broader range of queries while effectively enhancing the model's engagement and helpfulness.

(3) 无参考的模型奖励: 用人偏好数据训奖励模型给标量分. 不依赖参考答案, 可覆盖更广查询, 并提升参与度与有用性.

### 4.5 Strong-to-Weak Distillation 强到弱蒸馏

The Strong-to-Weak Distillation pipeline is specifically designed to optimize lightweight models, encompassing 5 dense models (Qwen3-0.6B, 1.7B, 4B, 8B, and 14B) and one MoE model (Qwen3-30B-A3B). This approach enhances model performance while effectively imparting robust mode-switching capabilities. The distillation process is divided into two primary phases:

Strong-to-Weak Distillation 面向 5 个 Dense (0.6B–14B) 与 30B-A3B: (1) Off-policy 混合教师 /think 与 /no_think 输出做响应蒸馏; (2) On-policy 由学生生成序列, 再对齐教师 (32B 或 235B-A22B) logits 以最小化 KL.

(1) Off-policy Distillation: At this initial phase, we combine the outputs of teacher models generated with both /think and /no\_think modes for response distillation. This helps lightweight student models develop basic reasoning skills and the ability to switch between different modes of thinking, laying a solid foundation for the next on-policy training phase.

(1) Off-policy 蒸馏: 先混合教师在 /think 与 /no_think 下的输出做响应蒸馏, 让轻量学生建立基本推理与模式切换能力, 为后续 on-policy 打底.

(2) On-policy Distillation: In this phase, the student model generates on-policy sequences for fine-tuning. Specifically, prompts are sampled, and the student model produces responses in either /think or /no\_think mode. The student model is then fine-tuned by aligning its logits with those of a teacher model (Qwen3-32B or Qwen3-235B-A22B) to minimize the KL divergence.

(2) On-policy 蒸馏: 学生按采样提示自行以 /think 或 /no_think 生成序列, 再将其 logits 与教师 (Qwen3-32B 或 Qwen3-235B-A22B) 对齐以最小化 KL.

> **对一下:** On-policy 蒸馏对齐的是教师答案文本, 还是 logits?
> 对齐 logits, 最小化与教师 (32B 或 235B-A22B) 的 KL; 学生先自己按 /think 或 /no_think 生成序列.

### 4.6 Post-training Evaluation 后训练评测

To comprehensively evaluate the quality of instruction-tuned models, we adopted automatic benchmarks to assess model performance under both thinking and non-thinking modes. These benchmarks are

指令模型在 thinking 与 non-thinking 两套自动基准上评测, 维度见下.

<!-- page 13 of 35 -->

Table 10: Multilingual benchmarks and the included languages. The languages are identified in IETF language tags.

表 10: Multilingual benchmarks and the included languages. The languages are identified in IETF language tags.

| Benchmark | # Langs | Languages |
| --- | --- | --- |
| Multi-IF | 8 | en, es, fr, hi, it, pt, ru, zh |
| INCLUDE | 44 | ar, az, be, bg, bn, de, el, es, et, eu, fa, fi, fr, he, hi, hr, hu, hy, id, it, ja, ka, kk, ko, lt, mk, ml, ms, ne, nl, pl, pt, ru, sq, sr, ta, te, tl, tr, uk, ur, uz, vi, zh |
| MMMLU | 14 | ar, bn, de, en, es, fr, hi, id, it, ja, ko, pt, sw, zh |
| MT-AIME2024 | 55 | af, ar, bg, bn, ca, cs, cy, da, de, el, en, es, et, fa, fi, fr, gu, he, hi, hr, hu, id, it, ja, kn, ko, lt, lv, mk, ml, mr, ne, nl, no, pa, pl, pt, ro, ru, sk, sl, so, sq, sv, sw, ta, te, th, tl, tr, uk, ur, vi, zh-Hans, zh-Hant |
| PolyMath | 18 | ar, bn, de, en, es, fr, id, it, ja, ko, ms, pt, ru, sw, te, th, vi, zh |
| MLogiQA | 10 | ar, en, es, fr, ja, ko, pt, th, vi, zh |

categorized into several dimensions:

\- General Tasks: We utilize benchmarks including MMLU-Redux (Gema et al., 2024), GPQA-Diamond (Rein et al., 2023), C-Eval (Huang et al., 2023), and LiveBench (2024-11-25) (White et al., 2024). For GPQA-Diamond, we sample 10 times for each query and report the averaged accuracy.

\- Alignment Tasks: To evaluate how well the model aligns with human preferences, we employ a suite of specialized benchmarks. For instruction-following performance, we report the strict-prompt accuracy of IFEval (Zhou et al., 2023). To assess alignment with human preferences on general topics, we utilize Arena-Hard (Li et al., 2024) and AlignBench v1.1 (Liu et al., 2023b). For writing tasks, we rely on Creative Writing V3 (Paech, 2024) and WritingBench (Wu et al., 2025) to evaluate the model's proficiency and creativity.

\- Math & Text Reasoning: For evaluating mathematical and logical reasoning skills, we employ high-level math benchmarks including MATH-500 (Lightman et al., 2023), AIME'24 and AIME'25 (AIME, 2025), and text reasoning tasks including ZebraLogic (Lin et al., 2025) and AutoLogi (Zhu et al., 2025). For AIME problems, each year's questions include Part I and Part II, totaling 30 questions. For each question, we sample 64 times and take the average accuracy as the final score.

\- Agent & Coding: To test the model's proficiency in coding and agent-based tasks, we use BFCL v3 (Yan et al., 2024), LiveCodeBench (v5, 2024.10-2025.02) (Jain et al., 2024), and Codeforces Ratings from CodeElo (Quan et al., 2025). For BFCL, all Qwen3 models are evaluated using the FC format, and yarn was used to deploy the models to a context length of 64k for Multi-Turn evaluation. Some baselines are derived from the BFCL leaderboard, taking the higher scores between FC and Prompt formats. For models not reported on the leaderboard, the Prompt formats are evaluated. For LiveCodeBench, for the non-thinking mode, we use the officially recommended prompt, while for the thinking mode, we adjust the prompt template to allow the model to think more freely, by removing the restriction You will not return anything except for the program. To evaluate the performance gap between models and competitive programming experts, we use CodeForces to calculate Elo ratings. In our benchmark, each problem is solved by generating up to eight independent reasoning attempts.

\- Multilingual Tasks: For multilingual capabilities, we evaluate four kinds of tasks: instruction following, knowledge, mathematics, and logical reasoning. Instruction following is assessed using Multi-IF (He et al., 2024), which focuses on 8 key languages. Knowledge assessment consisted of two types: regional knowledge evaluated through INCLUDE (Romanou et al., 2024), covering 44 languages, and general knowledge assessed with MMMLU (OpenAI, 2024) across 14 languages, excluding the unoptimized Yoruba language; for these two benchmarks, we sample only $10\%$ of the original data to improve evaluation efficiency. The mathematics task employ MT-AIME2024 (Son et al., 2025), encompassing 55 languages, and PolyMath (Wang et al., 2025), which includes 18 languages. Logical reasoning is evaluated using MlogiQA, covering 10 languages, sourced from Zhang et al. (2024).

For all Qwen3 models in the thinking mode, we utilize a sampling temperature of 0.6, a top-p value of 0.95, and a top-k value of 20. Additionally, for Creative Writing v3 and WritingBench, we apply a presence penalty of 1.5 to encourage the generation of more diverse content. For Qwen3 models in the non-thinking mode, we configure the sampling hyperparameters with temperature = 0.7, top-p = 0.8, top-k = 20, and presence penalty = 1.5. For both the thinking and non-thinking modes, we set the max output length to 32,768 tokens, except AIME'24 and AIME'25 where we extend this length to 38,912 tokens to provide sufficient thinking space.

thinking 采样: temperature 0.6, top-p 0.95, top-k 20; 写作类加 presence penalty 1.5. non-thinking: 0.7/0.8/20, presence penalty 1.5. 最大输出默认 32,768, AIME 到 38,912.

<!-- page 14 of 35 -->

Table 11: Comparison among Qwen3-235B-A22B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 11: Comparison among Qwen3-235B-A22B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>OpenAI-o1</td><td>DeepSeek-R1</td><td>Grok-3-Beta (Think)</td><td>Gemini2.5-Pro</td><td>Qwen3-235B-A22B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>-</td><td>MoE</td><td>-</td><td>-</td><td>MoE</td></tr><tr><td># Activated Params</td><td>-</td><td>37B</td><td>-</td><td>-</td><td>22B</td></tr><tr><td># Total Params</td><td>-</td><td>671B</td><td>-</td><td>-</td><td>235B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>92.8</td><td>92.9</td><td>-</td><td>93.7</td><td>92.7</td></tr><tr><td>GPQA-Diamond</td><td>78.0</td><td>71.5</td><td>80.2</td><td>84.0</td><td>71.1</td></tr><tr><td>C-Eval</td><td>85.5</td><td>91.8</td><td>-</td><td>82.9</td><td>89.6</td></tr><tr><td>LiveBench 2024-11-25</td><td>75.7</td><td>71.6</td><td>-</td><td>82.4</td><td>77.1</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>92.6</td><td>83.3</td><td>-</td><td>89.5</td><td>83.4</td></tr><tr><td>Arena-Hard</td><td>92.1</td><td>92.3</td><td>-</td><td>96.4</td><td>95.6</td></tr><tr><td>AlignBench v1.1</td><td>8.86</td><td>8.76</td><td>-</td><td>9.03</td><td>8.94</td></tr><tr><td>Creative Writing v3</td><td>81.7</td><td>85.5</td><td>-</td><td>86.0</td><td>84.6</td></tr><tr><td>WritingBench</td><td>7.69</td><td>7.71</td><td>-</td><td>8.09</td><td>8.03</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>96.4</td><td>97.3</td><td></td><td>98.8</td><td>98.0</td></tr><tr><td>AIME&#x27;24</td><td>74.3</td><td>79.8</td><td>83.9</td><td>92.0</td><td>85.7</td></tr><tr><td>AIME&#x27;25</td><td>79.2</td><td>70.0</td><td>77.3</td><td>86.7</td><td>81.5</td></tr><tr><td>ZebraLogic</td><td>81.0</td><td>78.7</td><td>-</td><td>87.4</td><td>80.3</td></tr><tr><td>AutoLogi</td><td>79.8</td><td>86.1</td><td>-</td><td>85.4</td><td>89.0</td></tr><tr><td rowspan="3">Agent &amp; Coding</td><td>BFCL v3</td><td>67.8</td><td>56.9</td><td>-</td><td>62.9</td><td>70.8</td></tr><tr><td>LiveCodeBench v5</td><td>63.9</td><td>64.3</td><td>70.6</td><td>70.4</td><td>70.7</td></tr><tr><td>CodeForces (Rating / Percentile)</td><td>1891 / 96.7%</td><td>2029 / 98.1%</td><td>-</td><td>2001 / 97.9%</td><td>2056 / 98.2%</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>48.8</td><td>67.7</td><td>-</td><td>77.8</td><td>71.9</td></tr><tr><td>INCLUDE</td><td>84.6</td><td>82.7</td><td>-</td><td>85.1</td><td>78.7</td></tr><tr><td>MMMLU 14 languages</td><td>88.4</td><td>86.4</td><td>-</td><td>86.9</td><td>84.3</td></tr><tr><td>MT-AIME2024</td><td>67.4</td><td>73.5</td><td>-</td><td>76.9</td><td>80.8</td></tr><tr><td>PolyMath</td><td>38.9</td><td>47.1</td><td>-</td><td>52.2</td><td>54.7</td></tr><tr><td>MLogiQA</td><td>75.5</td><td>73.8</td><td>-</td><td>75.6</td><td>77.1</td></tr></table>

Table 12: Comparison among Qwen3-235B-A22B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 12: Comparison among Qwen3-235B-A22B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>GPT-4o -2024-11-20</td><td>DeepSeek-V3</td><td>Qwen2.5-72B-Instruct</td><td>LLaMA-4-Maverick</td><td>Qwen3-235B-A22B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>-</td><td>MoE</td><td>Dense</td><td>MoE</td><td>MoE</td></tr><tr><td># Activated Params</td><td>-</td><td>37B</td><td>72B</td><td>17B</td><td>22B</td></tr><tr><td># Total Params</td><td>-</td><td>671B</td><td>72B</td><td>402B</td><td>235B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>87.0</td><td>89.1</td><td>86.8</td><td>91.8</td><td>89.2</td></tr><tr><td>GPQA-Diamond</td><td>46.0</td><td>59.1</td><td>49.0</td><td>69.8</td><td>62.9</td></tr><tr><td>C-Eval</td><td>75.5</td><td>86.5</td><td>84.7</td><td>83.5</td><td>86.1</td></tr><tr><td>LiveBench 2024-11-25</td><td>52.2</td><td>60.5</td><td>51.4</td><td>59.5</td><td>62.5</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>86.5</td><td>86.1</td><td>84.1</td><td>86.7</td><td>83.2</td></tr><tr><td>Arena-Hard</td><td>85.3</td><td>85.5</td><td>81.2</td><td>82.7</td><td>96.1</td></tr><tr><td>AlignBench v1.1</td><td>8.42</td><td>8.64</td><td>7.89</td><td>7.97</td><td>8.91</td></tr><tr><td>Creative Writing v3</td><td>81.1</td><td>74.0</td><td>61.8</td><td>61.3</td><td>80.4</td></tr><tr><td>WritingBench</td><td>7.11</td><td>6.49</td><td>7.06</td><td>5.46</td><td>7.70</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>77.2</td><td>90.2</td><td>83.6</td><td>90.6</td><td>91.2</td></tr><tr><td>AIME&#x27;24</td><td>11.1</td><td>39.2</td><td>18.9</td><td>38.5</td><td>40.1</td></tr><tr><td>AIME&#x27;25</td><td>7.6</td><td>28.8</td><td>15.0</td><td>15.9</td><td>24.7</td></tr><tr><td>ZebraLogic</td><td>27.4</td><td>42.1</td><td>26.6</td><td>40.0</td><td>37.7</td></tr><tr><td>AutoLogi</td><td>65.9</td><td>76.1</td><td>66.1</td><td>75.2</td><td>83.3</td></tr><tr><td rowspan="3">Agent &amp; Coding</td><td>BFCL v3</td><td>72.5</td><td>57.6</td><td>63.4</td><td>52.9</td><td>68.0</td></tr><tr><td>LiveCodeBench v5</td><td>32.7</td><td>33.1</td><td>30.7</td><td>37.2</td><td>35.3</td></tr><tr><td>CodeForces (Rating / Percentile)</td><td>864 / 35.4%</td><td>1134 / 54.1%</td><td>859 / 35.0%</td><td>712 / 24.3%</td><td>1387 / 75.7%</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>65.6</td><td>55.6</td><td>65.3</td><td>75.5</td><td>70.2</td></tr><tr><td>INCLUDE</td><td>78.8</td><td>76.7</td><td>69.6</td><td>80.9</td><td>75.6</td></tr><tr><td>MMMLU 14 languages</td><td>80.3</td><td>81.1</td><td>76.9</td><td>82.5</td><td>79.8</td></tr><tr><td>MT-AIME2024</td><td>9.2</td><td>20.9</td><td>12.7</td><td>27.0</td><td>32.4</td></tr><tr><td>PolyMath</td><td>13.7</td><td>20.4</td><td>16.9</td><td>26.1</td><td>27.0</td></tr><tr><td>MLogiQA</td><td>57.4</td><td>58.9</td><td>59.3</td><td>59.9</td><td>67.6</td></tr></table>

<!-- page 15 of 35 -->

Summary of Evaluation Results From the evaluation results, we summarize several key conclusions of the finalized Qwen3 models as follows:

后训练评测小结如下.

(1) Our flagship model, Qwen3-235B-A22B, demonstrates the state-of-the-art overall performance among open-source models in both the thinking and non-thinking modes, surpassing strong baselines such as DeepSeek-R1 and DeepSeek-V3. Qwen3-235B-A22B is also highly competitive to closed-source leading models, such as OpenAI-o1, Gemini2.5-Pro, and GPT-4o, showcasing its profound reasoning capabilities and comprehensive general abilities.

(1) 旗舰 235B-A22B 在 thinking 与 non-thinking 上均达开源总体最强档, 超过 DeepSeek-R1/V3 等, 并对闭源 o1, Gemini2.5-Pro, GPT-4o 有竞争力.

(2) Our flagship dense model, Qwen3-32B, outperforms our previous strongest reasoning model, QwQ-32B, in most of the benchmarks, and performs comparably to the closed-source OpenAI-o3-mini, indicating its compelling reasoning capabilities. Qwen3-32B is also remarkably performant in the non-thinking mode and surpasses our previous flagship non-reasoning dense model, Qwen2.5-72B-Instruct.

(2) 旗舰 Dense 32B 在多数基准超过 QwQ-32B, 并与 o3-mini 可比; non-thinking 也超过上代 Qwen2.5-72B-Instruct.

(3) Our lightweight models, including Qwen3-30B-A3B, Qwen3-14B, and other smaller dense ones, possess consistently superior performance to the open-source models with a close or larger amount of parameters, proving the success of our Strong-to-Weak Distillation approach.

(3) 轻量档 (含 30B-A3B, 14B 与更小 Dense) 相对相近或更大开源持续更强, 证明 Strong-to-Weak Distillation.

The detailed results are as follows.

详细结果如下.

Qwen3-235B-A22B For our flagship model Qwen3-235B-A22B, we compare it with the leading reasoning and non-reasoning models. For the thinking mode, we take OpenAI-o1 (OpenAI, 2024), DeepSeek-R1 (Guo et al., 2025), Grok-3-Beta (Think) (xAI, 2025), and Gemini2.5-Pro (DeepMind, 2025) as the reasoning baselines. For the non-thinking mode, we take GPT-4o-2024-11-20 (OpenAI, 2024), DeepSeek-V3 (Liu et al., 2024a), Qwen2.5-72B-Instruct (Yang et al., 2024b), and LLaMA-4-Maverick (Meta-AI, 2025) as the non-reasoning baselines. We present the evaluation results in Table 11 and 12.

旗舰 235B-A22B: thinking 对照 o1, R1, Grok-3-Beta (Think), Gemini2.5-Pro (表 11); non-thinking 对照 GPT-4o, V3, Qwen2.5-72B-Instruct, LLaMA-4-Maverick (表 12).

(1) From Table 11, with only 60% activated and 35% total parameters, Qwen3-235B-A22B (Thinking) outperforms DeepSeek-R1 on 17/23 the benchmarks, particularly on the reasoning-demanded tasks (e.g., mathematics, agent, and coding), demonstrating the state-of-the-art reasoning capabilities of Qwen3-235B-A22B among open-source models. Moreover, Qwen3-235B-A22B (Thinking) is also highly competitive to the closed-source OpenAI-o1, Grok-3-Beta (Think), and Gemini2.5-Pro, substantially narrowing the gap in the reasoning capabilities between open-source and close-source models.

(1) 表 11: 以约 60% 激活与 35% 总参, thinking 在 23 项中 17 项超过 R1, 数学/agent/编码尤强, 并对闭源推理模型有竞争力.

(2) From Table 12, Qwen3-235B-A22B (Non-thinking) exceeds the other leading open-source models, including DeepSeek-V3, LLaMA-4-Maverick, and our previous flagship model Qwen2.5-72B-Instruct, and also surpasses the closed-source GPT-4o-2024-11-20 in 18/23 the benchmarks, indicating its inherent strong capabilities even when not enhanced with the deliberate thinking process.

(2) 表 12: non-thinking 超过 V3, Maverick 与上代 72B-Instruct, 并在 23 项中 18 项超过 GPT-4o-2024-11-20.

Qwen3-32B For our flagship dense model, Qwen3-32B, we take DeepSeek-R1-Distill-Llama-70B, OpenAI-o3-mini (medium), and our previous strongest reasoning model, QwQ-32B (Qwen Team, 2025), as the baselines in the thinking mode. We also take GPT-4o-mini-2024-07-18, LLaMA-4-Scout, and our previous flagship model, Qwen2.5-72B-Instruct, as the baselines in the non-thinking mode. We present the evaluation results in Table 13 and 14.

32B: thinking 对照 R1-Distill-Llama-70B, QwQ-32B, o3-mini (medium) (表 13); non-thinking 对照 GPT-4o-mini, LLaMA-4-Scout, Qwen2.5-72B-Instruct (表 14).

(1) From Table 13, Qwen3-32B (Thinking) outperforms QwQ-32B on 17/23 the benchmarks, making it the new state-of-the-art reasoning model at the sweet size of 32B. Moreover, Qwen3-32B (Thinking) also competes with the closed-source OpenAI-o3-mini (medium) with better alignment and multilingual performance.

(1) 表 13: thinking 在 23 项中 17 项超过 QwQ-32B, 成为 32B 甜区新 SOTA, 并对 o3-mini (medium) 在对齐与多语上有优势.

(2) From Table 14, Qwen3-32B (Non-thinking) exhibits superior performance to all the baselines on almost all the benchmarks. Particularly, Qwen3-32B (Non-thinking) performs on par with Qwen2.5-72B-Instruct on the general tasks with significant advantages on the alignment, multilingual, and reasoning-related tasks, again proving the fundamental improvements of Qwen3 over our previous Qwen2.5 series models.

(2) 表 14: non-thinking 几乎全面超过对照; 通用上与 Qwen2.5-72B-Instruct 相当, 对齐/多语/推理相关更强.

Qwen3-30B-A3B & Qwen3-14B For Qwen3-30B-A3B and Qwen3-14B, we compare them with DeepSeek-R1-Distill-Qwen-32B and QwQ-32B in the thinking mode, and Phi-4 (Abdin et al., 2024), Gemma-3-27B-IT (Team et al., 2025), and Qwen2.5-32B-Instruct in the non-thinking mode, respectively. We present the evaluation results in Table 15 and 16.

30B-A3B 与 14B: thinking 对照 R1-Distill-Qwen-32B 与 QwQ-32B (表 15); non-thinking 对照 Phi-4, Gemma-3-27B-IT, Qwen2.5-32B-Instruct (表 16).

(1) From Table 15, Qwen3-30B-A3B and Qwen3-14B (Thinking) are both highly competitive to QwQ-32B, especially on the reasoning-related benchmarks. It is noteworthy that Qwen3-30B-A3B achieves comparable performance to QwQ-32B with a smaller model size and less than

(1) 表 15: 两者 thinking 对 QwQ-32B 有竞争力; 30B-A3B 以更小体积与不到 1/10 激活参逼近 QwQ-32B, 体现蒸馏.

<!-- page 16 of 35 -->

Table 13: Comparison among Qwen3-32B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 13: Comparison among Qwen3-32B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>DeepSeek-R1-Distill-Llama-70B</td><td>QwQ-32B</td><td>OpenAI-o3-mini (medium)</td><td>Qwen3-32B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>Dense</td><td>Dense</td><td>-</td><td>Dense</td></tr><tr><td># Activated Params</td><td>70B</td><td>32B</td><td>-</td><td>32B</td></tr><tr><td># Total Params</td><td>70B</td><td>32B</td><td>-</td><td>32B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>89.3</td><td>90.0</td><td>90.0</td><td>90.9</td></tr><tr><td>GPQA-Diamond</td><td>65.2</td><td>65.6</td><td>76.8</td><td>68.4</td></tr><tr><td>C-Eval</td><td>71.8</td><td>88.4</td><td>75.1</td><td>87.3</td></tr><tr><td>LiveBench 2024-11-25</td><td>54.5</td><td>72.0</td><td>70.0</td><td>74.9</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>79.3</td><td>83.9</td><td>91.5</td><td>85.0</td></tr><tr><td>Arena-Hard</td><td>60.6</td><td>89.5</td><td>89.0</td><td>93.8</td></tr><tr><td>AlignBench v1.1</td><td>6.74</td><td>8.70</td><td>8.38</td><td>8.72</td></tr><tr><td>Creative Writing v3</td><td>62.1</td><td>82.4</td><td>74.8</td><td>81.0</td></tr><tr><td>WritingBench</td><td>6.08</td><td>7.86</td><td>7.52</td><td>7.90</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>94.5</td><td>98.0</td><td>98.0</td><td>97.2</td></tr><tr><td>AIME&#x27;24</td><td>70.0</td><td>79.5</td><td>79.6</td><td>81.4</td></tr><tr><td>AIME&#x27;25</td><td>56.3</td><td>69.5</td><td>74.8</td><td>72.9</td></tr><tr><td>ZebraLogic</td><td>71.3</td><td>76.8</td><td>88.9</td><td>88.8</td></tr><tr><td>AutoLogi</td><td>83.5</td><td>88.1</td><td>86.3</td><td>87.3</td></tr><tr><td rowspan="3">Agent &amp; Coding</td><td>BFCL v3</td><td>49.3</td><td>66.4</td><td>64.6</td><td>70.3</td></tr><tr><td>LiveCodeBench v5</td><td>54.5</td><td>62.7</td><td>66.3</td><td>65.7</td></tr><tr><td>CodeForces (Rating / Percentile)</td><td>1633 / 91.4%</td><td>1982 / 97.7%</td><td>2036 / 98.1%</td><td>1977 / 97.7%</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>57.6</td><td>68.3</td><td>48.4</td><td>73.0</td></tr><tr><td>INCLUDE</td><td>62.1</td><td>69.7</td><td>73.1</td><td>73.7</td></tr><tr><td>MMMLU 14 languages</td><td>69.6</td><td>80.9</td><td>79.3</td><td>80.6</td></tr><tr><td>MT-AIME2024</td><td>29.3</td><td>68.0</td><td>73.9</td><td>75.0</td></tr><tr><td>PolyMath</td><td>29.4</td><td>45.9</td><td>38.6</td><td>47.4</td></tr><tr><td>MLogiQA</td><td>60.3</td><td>75.5</td><td>71.1</td><td>76.3</td></tr></table>

Table 14: Comparison among Qwen3-32B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 14: Comparison among Qwen3-32B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>GPT-4o-mini -2024-07-18</td><td>LLaMA-4 -Scout</td><td>Qwen2.5-72B -Instruct</td><td>Qwen3-32B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>-</td><td>MoE</td><td>Dense</td><td>Dense</td></tr><tr><td># Activated Params</td><td>-</td><td>17B</td><td>72B</td><td>32B</td></tr><tr><td># Total Params</td><td>-</td><td>109B</td><td>72B</td><td>32B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>81.5</td><td>86.3</td><td>86.8</td><td>85.7</td></tr><tr><td>GPQA-Diamond</td><td>40.2</td><td>57.2</td><td>49.0</td><td>54.6</td></tr><tr><td>C-Eval</td><td>66.3</td><td>78.2</td><td>84.7</td><td>83.3</td></tr><tr><td>LiveBench 2024-11-25</td><td>41.3</td><td>47.6</td><td>51.4</td><td>59.8</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>80.4</td><td>84.7</td><td>84.1</td><td>83.2</td></tr><tr><td>Arena-Hard</td><td>74.9</td><td>70.5</td><td>81.2</td><td>92.8</td></tr><tr><td>AlignBench v1.1</td><td>7.81</td><td>7.49</td><td>7.89</td><td>8.58</td></tr><tr><td>Creative Writing v3</td><td>70.3</td><td>55.0</td><td>61.8</td><td>78.3</td></tr><tr><td>WritingBench</td><td>5.98</td><td>5.49</td><td>7.06</td><td>7.54</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>78.2</td><td>82.6</td><td>83.6</td><td>88.6</td></tr><tr><td>AIME&#x27;24</td><td>8.1</td><td>28.6</td><td>18.9</td><td>31.0</td></tr><tr><td>AIME&#x27;25</td><td>8.8</td><td>10.0</td><td>15.0</td><td>20.2</td></tr><tr><td>ZebraLogic</td><td>20.1</td><td>24.2</td><td>26.6</td><td>29.2</td></tr><tr><td>AutoLogi</td><td>52.6</td><td>56.8</td><td>66.1</td><td>78.5</td></tr><tr><td rowspan="3">Agent &amp; Coding</td><td>BFCL v3</td><td>64.0</td><td>45.4</td><td>63.4</td><td>63.0</td></tr><tr><td>LiveCodeBench v5</td><td>27.9</td><td>29.8</td><td>30.7</td><td>31.3</td></tr><tr><td>CodeForces (Rating / Percentile)</td><td>1113 / 52.6%</td><td>981 / 43.7%</td><td>859 / 35.0%</td><td>1353 / 71.0%</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>62.4</td><td>64.2</td><td>65.3</td><td>70.7</td></tr><tr><td>INCLUDE</td><td>66.0</td><td>74.1</td><td>69.6</td><td>70.9</td></tr><tr><td>MMMLU 14 languages</td><td>72.1</td><td>77.5</td><td>76.9</td><td>76.5</td></tr><tr><td>MT-AIME2024</td><td>6.0</td><td>19.1</td><td>12.7</td><td>24.1</td></tr><tr><td>PolyMath</td><td>12.0</td><td>20.9</td><td>16.9</td><td>22.5</td></tr><tr><td>MLogiQA</td><td>42.6</td><td>53.9</td><td>59.3</td><td>62.9</td></tr></table>

<!-- page 17 of 35 -->

Table 15: Comparison among Qwen3-30B-A3B / Qwen3-14B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 15: Comparison among Qwen3-30B-A3B / Qwen3-14B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>DeepSeek-R1-Distill-Qwen-32B</td><td>QwQ-32B</td><td>Qwen3-14B</td><td>Qwen3-30B-A3B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>MoE</td></tr><tr><td># Activated Params</td><td>32B</td><td>32B</td><td>14B</td><td>3B</td></tr><tr><td># Total Params</td><td>32B</td><td>32B</td><td>14B</td><td>30B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>88.2</td><td>90.0</td><td>88.6</td><td>89.5</td></tr><tr><td>GPQA-Diamond</td><td>62.1</td><td>65.6</td><td>64.0</td><td>65.8</td></tr><tr><td>C-Eval</td><td>82.2</td><td>88.4</td><td>86.2</td><td>86.6</td></tr><tr><td>LiveBench 2024-11-25</td><td>45.6</td><td>72.0</td><td>71.3</td><td>74.3</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>72.5</td><td>83.9</td><td>85.4</td><td>86.5</td></tr><tr><td>Arena-Hard</td><td>60.8</td><td>89.5</td><td>91.7</td><td>91.0</td></tr><tr><td>AlignBench v1.1</td><td>7.25</td><td>8.70</td><td>8.56</td><td>8.70</td></tr><tr><td>Creative Writing v3</td><td>55.0</td><td>82.4</td><td>80.3</td><td>79.1</td></tr><tr><td>WritingBench</td><td>6.13</td><td>7.86</td><td>7.80</td><td>7.70</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>94.3</td><td>98.0</td><td>96.8</td><td>98.0</td></tr><tr><td>AIME&#x27;24</td><td>72.6</td><td>79.5</td><td>79.3</td><td>80.4</td></tr><tr><td>AIME&#x27;25</td><td>49.6</td><td>69.5</td><td>70.4</td><td>70.9</td></tr><tr><td>ZebraLogic</td><td>69.6</td><td>76.8</td><td>88.5</td><td>89.5</td></tr><tr><td>AutoLogi</td><td>74.6</td><td>88.1</td><td>89.2</td><td>88.7</td></tr><tr><td rowspan="3">Agent &amp; Coding</td><td>BFCL v3</td><td>53.5</td><td>66.4</td><td>70.4</td><td>69.1</td></tr><tr><td>LiveCodeBench v5</td><td>54.5</td><td>62.7</td><td>63.5</td><td>62.6</td></tr><tr><td>CodeForces (Rating / Percentile)</td><td>1691 / 93.4%</td><td>1982 / 97.7%</td><td>1766 / 95.3%</td><td>1974 / 97.7%</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>31.3</td><td>68.3</td><td>74.8</td><td>72.2</td></tr><tr><td>INCLUDE</td><td>68.0</td><td>69.7</td><td>71.7</td><td>71.9</td></tr><tr><td>MMMLU 14 languages</td><td>78.6</td><td>80.9</td><td>77.9</td><td>78.4</td></tr><tr><td>MT-AIME2024</td><td>44.6</td><td>68.0</td><td>73.3</td><td>73.9</td></tr><tr><td>PolyMath</td><td>35.1</td><td>45.9</td><td>45.8</td><td>46.1</td></tr><tr><td>MLogiQA</td><td>63.3</td><td>75.5</td><td>71.1</td><td>70.1</td></tr></table>

Table 16: Comparison among Qwen3-30B-A3B / Qwen3-14B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 16: Comparison among Qwen3-30B-A3B / Qwen3-14B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>Phi-4</td><td>Gemma-3 -27B-IT</td><td>Qwen2.5-32B-Instruct</td><td>Qwen3-14B</td><td>Qwen3-30B-A3B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td><td>MoE</td></tr><tr><td># Activated Params</td><td>14B</td><td>27B</td><td>32B</td><td>14B</td><td>3B</td></tr><tr><td># Total Params</td><td>14B</td><td>27B</td><td>32B</td><td>14B</td><td>30B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>85.3</td><td>82.6</td><td>83.9</td><td>82.0</td><td>84.1</td></tr><tr><td>GPQA-Diamond</td><td>56.1</td><td>42.4</td><td>49.5</td><td>54.8</td><td>54.8</td></tr><tr><td>C-Eval</td><td>66.9</td><td>66.6</td><td>80.6</td><td>81.0</td><td>82.9</td></tr><tr><td>LiveBench 2024-11-25</td><td>41.6</td><td>49.2</td><td>50.0</td><td>59.6</td><td>59.4</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>62.1</td><td>80.6</td><td>79.5</td><td>84.8</td><td>83.7</td></tr><tr><td>Arena-Hard</td><td>75.4</td><td>86.8</td><td>74.5</td><td>86.3</td><td>88.0</td></tr><tr><td>AlignBench v1.1</td><td>7.61</td><td>7.80</td><td>7.71</td><td>8.52</td><td>8.55</td></tr><tr><td>Creative Writing v3</td><td>51.2</td><td>82.0</td><td>54.6</td><td>73.1</td><td>68.1</td></tr><tr><td>WritingBench</td><td>5.73</td><td>7.22</td><td>5.90</td><td>7.24</td><td>7.22</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>80.8</td><td>90.0</td><td>84.6</td><td>90.0</td><td>89.8</td></tr><tr><td>AIME&#x27;24</td><td>22.9</td><td>32.6</td><td>18.8</td><td>31.7</td><td>32.8</td></tr><tr><td>AIME&#x27;25</td><td>17.3</td><td>24.0</td><td>12.8</td><td>23.3</td><td>21.6</td></tr><tr><td>ZebraLogic</td><td>32.3</td><td>24.6</td><td>26.1</td><td>33.0</td><td>33.2</td></tr><tr><td>AutoLogi</td><td>66.2</td><td>64.2</td><td>65.5</td><td>82.0</td><td>81.5</td></tr><tr><td rowspan="3">Agent &amp; Coding</td><td>BFCL v3</td><td>47.0</td><td>59.1</td><td>62.8</td><td>61.5</td><td>58.6</td></tr><tr><td>LiveCodeBench v5</td><td>25.2</td><td>26.9</td><td>26.4</td><td>29.0</td><td>29.8</td></tr><tr><td>CodeForces (Rating / Percentile)</td><td>1280 / 65.3%</td><td>1063 / 49.3%</td><td>903 / 38.2%</td><td>1200 / 58.6%</td><td>1267 / 64.1%</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>49.5</td><td>69.8</td><td>63.2</td><td>72.9</td><td>70.8</td></tr><tr><td>INCLUDE</td><td>65.3</td><td>71.4</td><td>67.5</td><td>67.8</td><td>67.8</td></tr><tr><td>MMMLU 14 languages</td><td>74.7</td><td>76.1</td><td>74.2</td><td>72.6</td><td>73.8</td></tr><tr><td>MT-AIME2024</td><td>13.1</td><td>23.0</td><td>15.3</td><td>23.2</td><td>24.6</td></tr><tr><td>PolyMath</td><td>17.4</td><td>20.3</td><td>18.3</td><td>22.0</td><td>23.3</td></tr><tr><td>MLogiQA</td><td>53.1</td><td>58.5</td><td>58.0</td><td>58.9</td><td>53.3</td></tr></table>

<!-- page 18 of 35 -->

Table 17: Comparison among Qwen3-8B / Qwen3-4B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 17: Comparison among Qwen3-8B / Qwen3-4B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>DeepSeek-R1-Distill-Qwen-14B</td><td>DeepSeek-R1-Distill-Qwen-32B</td><td>Qwen3-4B</td><td>Qwen3-8B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td></tr><tr><td># Activated Params</td><td>14B</td><td>32B</td><td>4B</td><td>8B</td></tr><tr><td># Total Params</td><td>14B</td><td>32B</td><td>4B</td><td>8B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>84.1</td><td>88.2</td><td>83.7</td><td>87.5</td></tr><tr><td>GPQA-Diamond</td><td>59.1</td><td>62.1</td><td>55.9</td><td>62.0</td></tr><tr><td>C-Eval</td><td>78.1</td><td>82.2</td><td>77.5</td><td>83.4</td></tr><tr><td>LiveBench 2024-11-25</td><td>52.3</td><td>45.6</td><td>63.6</td><td>67.1</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>72.6</td><td>72.5</td><td>81.9</td><td>85.0</td></tr><tr><td>Arena-Hard</td><td>48.0</td><td>60.8</td><td>76.6</td><td>85.8</td></tr><tr><td>AlignBench v1.1</td><td>7.43</td><td>7.25</td><td>8.30</td><td>8.46</td></tr><tr><td>Creative Writing v3</td><td>54.2</td><td>55.0</td><td>61.1</td><td>75.0</td></tr><tr><td>WritingBench</td><td>6.03</td><td>6.13</td><td>7.35</td><td>7.59</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>93.9</td><td>94.3</td><td>97.0</td><td>97.4</td></tr><tr><td>AIME&#x27;24</td><td>69.7</td><td>72.6</td><td>73.8</td><td>76.0</td></tr><tr><td>AIME&#x27;25</td><td>44.5</td><td>49.6</td><td>65.6</td><td>67.3</td></tr><tr><td>ZebraLogic</td><td>59.1</td><td>69.6</td><td>81.0</td><td>84.8</td></tr><tr><td>AutoLogi</td><td>78.6</td><td>74.6</td><td>87.9</td><td>89.1</td></tr><tr><td rowspan="3">Agent &amp; Coding</td><td>BFCL v3</td><td>49.5</td><td>53.5</td><td>65.9</td><td>68.1</td></tr><tr><td>LiveCodeBench v5</td><td>45.5</td><td>54.5</td><td>54.2</td><td>57.5</td></tr><tr><td>CodeForces (Rating / Percentile)</td><td>1574 / 89.1%</td><td>1691 / 93.4%</td><td>1671 / 92.8%</td><td>1785 / 95.6%</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>29.8</td><td>31.3</td><td>66.3</td><td>71.2</td></tr><tr><td>INCLUDE</td><td>59.7</td><td>68.0</td><td>61.8</td><td>67.8</td></tr><tr><td>MMMLU 14 languages</td><td>73.8</td><td>78.6</td><td>69.8</td><td>74.4</td></tr><tr><td>MT-AIME2024</td><td>33.7</td><td>44.6</td><td>60.7</td><td>65.4</td></tr><tr><td>PolyMath</td><td>28.6</td><td>35.1</td><td>40.0</td><td>42.7</td></tr><tr><td>MLogiQA</td><td>53.6</td><td>63.3</td><td>65.9</td><td>69.0</td></tr></table>

Table 18: Comparison among Qwen3-8B / Qwen3-4B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 18: Comparison among Qwen3-8B / Qwen3-4B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>LLaMA-3.1-8B-Instruct</td><td>Gemma-3-12B-IT</td><td>Qwen2.5-7B-Instruct</td><td>Qwen2.5-14B-Instruct</td><td>Qwen3-4B</td><td>Qwen3-8B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td></tr><tr><td># Activated Params</td><td>8B</td><td>12B</td><td>7B</td><td>14B</td><td>4B</td><td>8B</td></tr><tr><td># Total Params</td><td>8B</td><td>12B</td><td>7B</td><td>14B</td><td>4B</td><td>8B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>61.7</td><td>77.8</td><td>75.4</td><td>80.0</td><td>77.3</td><td>79.5</td></tr><tr><td>GPQA-Diamond</td><td>32.8</td><td>40.9</td><td>36.4</td><td>45.5</td><td>41.7</td><td>39.3</td></tr><tr><td>C-Eval</td><td>52.0</td><td>61.1</td><td>76.2</td><td>78.0</td><td>72.2</td><td>77.9</td></tr><tr><td>LiveBench 2024-11-25</td><td>26.0</td><td>43.7</td><td>34.9</td><td>42.2</td><td>48.4</td><td>53.5</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>75.0</td><td>80.2</td><td>71.2</td><td>81.0</td><td>81.2</td><td>83.0</td></tr><tr><td>Arena-Hard</td><td>30.1</td><td>82.6</td><td>52.0</td><td>68.3</td><td>66.2</td><td>79.6</td></tr><tr><td>AlignBench v1.1</td><td>6.01</td><td>7.77</td><td>7.27</td><td>7.67</td><td>8.10</td><td>8.38</td></tr><tr><td>Creative Writing v3</td><td>52.8</td><td>79.9</td><td>49.8</td><td>55.8</td><td>53.6</td><td>64.5</td></tr><tr><td>WritingBench</td><td>4.57</td><td>7.05</td><td>5.82</td><td>5.93</td><td>6.85</td><td>7.15</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>54.8</td><td>85.6</td><td>77.6</td><td>83.4</td><td>84.8</td><td>87.4</td></tr><tr><td>AIME&#x27;24</td><td>6.3</td><td>22.4</td><td>9.1</td><td>15.2</td><td>25.0</td><td>29.1</td></tr><tr><td>AIME&#x27;25</td><td>2.7</td><td>18.8</td><td>12.1</td><td>13.6</td><td>19.1</td><td>20.9</td></tr><tr><td>ZebraLogic</td><td>12.8</td><td>17.8</td><td>12.0</td><td>19.7</td><td>35.2</td><td>26.7</td></tr><tr><td>AutoLogi</td><td>30.9</td><td>58.9</td><td>42.9</td><td>57.4</td><td>76.3</td><td>76.5</td></tr><tr><td rowspan="3">Agent &amp; Coding</td><td>BFCL v3</td><td>49.6</td><td>50.6</td><td>55.8</td><td>58.7</td><td>57.6</td><td>60.2</td></tr><tr><td>LiveCodeBench v5</td><td>10.8</td><td>25.7</td><td>14.4</td><td>21.9</td><td>21.3</td><td>22.8</td></tr><tr><td>CodeForces (Rating / Percentile)</td><td>473 / 14.9%</td><td>462 / 14.7%</td><td>191 / 0.0%</td><td>904 / 38.3%</td><td>842 / 33.7%</td><td>1110 / 52.4%</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>52.1</td><td>65.6</td><td>47.7</td><td>55.5</td><td>61.3</td><td>69.2</td></tr><tr><td>INCLUDE</td><td>34.0</td><td>65.3</td><td>53.6</td><td>63.5</td><td>53.8</td><td>62.5</td></tr><tr><td>MMMLU 14 languages</td><td>44.4</td><td>70.0</td><td>61.4</td><td>70.3</td><td>61.7</td><td>66.9</td></tr><tr><td>MT-AIME2024</td><td>0.4</td><td>16.7</td><td>5.5</td><td>8.5</td><td>13.9</td><td>16.6</td></tr><tr><td>PolyMath</td><td>5.8</td><td>17.6</td><td>11.9</td><td>15.0</td><td>16.6</td><td>18.8</td></tr><tr><td>MLogiQA</td><td>41.9</td><td>54.5</td><td>49.5</td><td>51.3</td><td>49.9</td><td>51.4</td></tr></table>

<!-- page 19 of 35 -->

Table 19: Comparison among Qwen3-1.7B / Qwen3-0.6B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 19: Comparison among Qwen3-1.7B / Qwen3-0.6B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>DeepSeek-R1-Distill-Qwen-1.5B</td><td>DeepSeek-R1-Distill-Llama-8B</td><td>Qwen3-0.6B</td><td>Qwen3-1.7B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td></tr><tr><td># Activated Params</td><td>1.5B</td><td>8B</td><td>0.6B</td><td>1.7B</td></tr><tr><td># Total Params</td><td>1.5B</td><td>8B</td><td>0.6B</td><td>1.7B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>45.4</td><td>66.4</td><td>55.6</td><td>73.9</td></tr><tr><td>GPQA-Diamond</td><td>33.8</td><td>49.0</td><td>27.9</td><td>40.1</td></tr><tr><td>C-Eval</td><td>27.1</td><td>50.4</td><td>50.4</td><td>68.1</td></tr><tr><td>LiveBench 2024-11-25</td><td>24.9</td><td>40.6</td><td>30.3</td><td>51.1</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>39.9</td><td>59.0</td><td>59.2</td><td>72.5</td></tr><tr><td>Arena-Hard</td><td>4.5</td><td>17.6</td><td>8.5</td><td>43.1</td></tr><tr><td>AlignBench v1.1</td><td>5.00</td><td>6.24</td><td>6.10</td><td>7.60</td></tr><tr><td>Creative Writing v3</td><td>16.4</td><td>51.1</td><td>30.6</td><td>48.0</td></tr><tr><td>WritingBench</td><td>4.03</td><td>5.42</td><td>5.61</td><td>7.02</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>83.9</td><td>89.1</td><td>77.6</td><td>93.4</td></tr><tr><td>AIME&#x27;24</td><td>28.9</td><td>50.4</td><td>10.7</td><td>48.3</td></tr><tr><td>AIME&#x27;25</td><td>22.8</td><td>27.8</td><td>15.1</td><td>36.8</td></tr><tr><td>ZebraLogic</td><td>4.9</td><td>37.1</td><td>30.3</td><td>63.2</td></tr><tr><td>AutoLogi</td><td>19.1</td><td>63.4</td><td>61.6</td><td>83.2</td></tr><tr><td rowspan="2">Agent &amp; Coding</td><td>BFCL v3</td><td>14.0</td><td>21.5</td><td>46.4</td><td>56.6</td></tr><tr><td>LiveCodeBench v5</td><td>13.2</td><td>42.5</td><td>12.3</td><td>33.2</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>13.3</td><td>27.0</td><td>36.1</td><td>51.2</td></tr><tr><td>INCLUDE</td><td>21.9</td><td>34.5</td><td>35.9</td><td>51.8</td></tr><tr><td>MMMLU 14 languages</td><td>27.3</td><td>40.1</td><td>43.1</td><td>59.1</td></tr><tr><td>MT-AIME2024</td><td>12.4</td><td>13.2</td><td>7.8</td><td>36.1</td></tr><tr><td>PolyMath</td><td>14.5</td><td>10.8</td><td>11.4</td><td>25.2</td></tr><tr><td>MLogiQA</td><td>29.0</td><td>32.8</td><td>40.9</td><td>56.0</td></tr></table>

Table 20: Comparison among Qwen3-1.7B / Qwen3-0.6B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

表 20: Comparison among Qwen3-1.7B / Qwen3-0.6B (Non-thinking) and other non-reasoning baselines. The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td colspan="2"></td><td>Gemma-3 -1B-IT</td><td>Phi-4-mini</td><td>Qwen2.5-1.5B-Instruct</td><td>Qwen2.5-3B-Instruct</td><td>Qwen3-0.6B</td><td>Qwen3-1.7B</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td><td>Dense</td></tr><tr><td># Activated Params</td><td>1.0B</td><td>3.8B</td><td>1.5B</td><td>3.1B</td><td>0.6B</td><td>1.7B</td></tr><tr><td># Total Params</td><td>1.0B</td><td>3.8B</td><td>1.5B</td><td>3.1B</td><td>0.6B</td><td>1.7B</td></tr><tr><td rowspan="4">General Tasks</td><td>MMLU-Redux</td><td>33.3</td><td>67.9</td><td>50.7</td><td>64.4</td><td>44.6</td><td>64.4</td></tr><tr><td>GPQA-Diamond</td><td>19.2</td><td>25.2</td><td>29.8</td><td>30.3</td><td>22.9</td><td>28.6</td></tr><tr><td>C-Eval</td><td>28.5</td><td>40.0</td><td>53.3</td><td>68.2</td><td>42.6</td><td>61.0</td></tr><tr><td>LiveBench 2024-11-25</td><td>14.4</td><td>25.3</td><td>18.0</td><td>23.8</td><td>21.8</td><td>35.6</td></tr><tr><td rowspan="5">Alignment Tasks</td><td>IFEval strict prompt</td><td>54.5</td><td>68.6</td><td>42.5</td><td>58.2</td><td>54.5</td><td>68.2</td></tr><tr><td>Arena-Hard</td><td>17.8</td><td>32.8</td><td>9.0</td><td>23.7</td><td>6.5</td><td>36.9</td></tr><tr><td>AlignBench v1.1</td><td>5.3</td><td>6.00</td><td>5.60</td><td>6.49</td><td>5.60</td><td>7.20</td></tr><tr><td>Creative Writing v3</td><td>52.8</td><td>10.3</td><td>31.5</td><td>42.8</td><td>28.4</td><td>43.6</td></tr><tr><td>WritingBench</td><td>5.18</td><td>4.05</td><td>4.67</td><td>5.55</td><td>5.13</td><td>6.54</td></tr><tr><td rowspan="5">Math &amp; Text Reasoning</td><td>MATH-500</td><td>46.4</td><td>67.6</td><td>55.0</td><td>67.2</td><td>55.2</td><td>73.0</td></tr><tr><td>AIME&#x27;24</td><td>0.9</td><td>8.1</td><td>0.9</td><td>6.7</td><td>3.4</td><td>13.4</td></tr><tr><td>AIME&#x27;25</td><td>0.8</td><td>5.3</td><td>0.4</td><td>4.2</td><td>2.6</td><td>9.8</td></tr><tr><td>ZebraLogic</td><td>1.9</td><td>2.7</td><td>3.4</td><td>4.8</td><td>4.2</td><td>12.8</td></tr><tr><td>AutoLogi</td><td>16.4</td><td>28.8</td><td>22.5</td><td>29.9</td><td>37.4</td><td>59.8</td></tr><tr><td rowspan="2">Agent &amp; Coding</td><td>BFCL v3</td><td>16.3</td><td>31.3</td><td>47.8</td><td>50.4</td><td>44.1</td><td>52.2</td></tr><tr><td>LiveCodeBench v5</td><td>1.8</td><td>10.4</td><td>5.3</td><td>9.2</td><td>3.6</td><td>11.6</td></tr><tr><td rowspan="6">Multilingual Tasks</td><td>Multi-IF</td><td>32.8</td><td>40.5</td><td>20.2</td><td>32.3</td><td>33.3</td><td>44.7</td></tr><tr><td>INCLUDE</td><td>32.7</td><td>43.8</td><td>33.1</td><td>43.8</td><td>34.4</td><td>42.6</td></tr><tr><td>MMMLU 14 languages</td><td>32.5</td><td>51.4</td><td>40.4</td><td>51.8</td><td>37.1</td><td>48.3</td></tr><tr><td>MT-AIME2024</td><td>0.2</td><td>0.9</td><td>0.7</td><td>1.6</td><td>1.5</td><td>4.9</td></tr><tr><td>PolyMath</td><td>3.5</td><td>6.7</td><td>5.0</td><td>7.3</td><td>4.6</td><td>10.3</td></tr><tr><td>MLogiQA</td><td>31.8</td><td>39.5</td><td>40.9</td><td>39.5</td><td>37.3</td><td>41.1</td></tr></table>

<!-- page 20 of 35 -->

1/10 activated parameters, demonstrating the effectiveness of our Strong-to-Weak Distillation approach in endowing lightweight models with profound reasoning capabilities.

(2) From Table 16, Qwen3-30B-A3B and Qwen3-14B (Non-thinking) surpass the non-reasoning baselines in most of the benchmarks. They exceed our previous Qwen2.5-32B-Instruct model with significantly fewer activated and total parameters, allowing for more efficient and cost-effective performance.

(2) 表 16: non-thinking 多数超过对照, 并以更少激活/总参超过上代 Qwen2.5-32B-Instruct.

Qwen3-8B / 4B / 1.7B / 0.6B For Qwen3-8B and Qwen3-4B, we compare them with DeepSeek-R1-Distill-Qwen-14B and DeepSeek-R1-Distill-Qwen-32B in the thinking mode, and LLaMA-3.1-8B-Instruct (Dubey et al., 2024), Gemma-3-12B-IT (Team et al., 2025), Qwen2.5-7B-Instruct, and Qwen2.5-14B-Instruct in the non-thinking mode, respectively. For Qwen3-1.7B and Qwen3-0.6B, we compare them with DeepSeek-R1-Distill-Qwen-1.5B and DeepSeek-R1-Distill-Llama-8B in the thinking mode, and Gemma-3-1B-IT, Phi-4-mini, Qwen2.5-1.5B-Instruct, and Qwen2.5-3B-Instruct in the non-thinking mode, respectively. We present the evaluation results of Qwen3-8B and Qwen3-4B in Table 17 and 18 and those of Qwen3-1.7B and Qwen3-0.6B in Table 19 and 20, respectively. Overall, these edge-side models exhibit impressive performance and outperform baselines even with more parameters, including our previous Qwen2.5 models, in either the thinking or the non-thinking mode. These results, once again, demonstrate the efficacy of our Strong-to-Weak Distillation approach, making it possible for us to build the lightweight Qwen3 models with remarkably reduced costs and efforts.

边侧 Qwen3-8B/4B/1.7B/0.6B-Base 对照同规模 Qwen2.5, Llama-3, Gemma-3, 详见表 6–8; 多数基准保持强, 且常在一半以上项目超过更大档 Qwen2.5.

### 4.7 Discussion 讨论

The Effectiveness of Thinking Budget To verify that Qwen3 can enhance its intelligence level by leveraging an increased thinking budget, we adjust the allocated thinking budget on four benchmarks across Mathematics, Coding, and STEM domains. The resulting scaling curves are presented in Figure 2, Qwen3 demonstrates scalable and smooth performance improvements correlated to the allocated thinking budget. Moreover, we observe that if we further extend the output length beyond 32K, the model's performance is expected to improve further in the future. We leave this exploration as future work.

thinking budget 有效性: 在数学/代码/STEM 四条线上调预算, 图 2 显示随预算平滑上升; 预期输出超过 32K 仍有空间, 留作后续.

LiveCodeBench (v5)

AIME'24

![Chart block](images/p20-aime-25.png)

AIME'25

![Chart block](images/p20-chart.png)

![Chart block](images/p20-chart-2.png)

![Chart block](images/p20-figure-2-performance-of-qwen3-235b-a22b-with-respect-to.png)

Figure 2: Performance of Qwen3-235B-A22B with respect to the thinking budget.

图 2: Performance of Qwen3-235B-A22B with respect to the thinking budget.

The Effectiveness and Efficiency of On-Policy Distillation We evaluate the effectiveness and efficiency of on-policy distillation by comparing the performance and computational cost—measured in GPU hours—after undergoing distillation versus direct reinforcement learning, both starting from the same off-policy distilled 8B checkpoint. For simplicity, we focus solely on math and code-related queries in

On-policy 蒸馏有效性与效率: 同从 off-policy 8B 检查点出发, 比直接 RL (表 21). 蒸馏更强且约 1/10 GPU hours; 且抬 pass@64, RL 则不抬.

<!-- page 21 of 35 -->

this comparison. The results, summarized in Table 21, show that distillation achieves significantly better performance than reinforcement learning while requiring approximately only 1/10 of the GPU hours. Furthermore, distillation from teacher logits enables the student model to expand its exploration space and enhance its reasoning potential, as evidenced by the improved pass@64 scores on the AIME'24 and AIME'25 benchmarks after distillation, compared to the initial checkpoint. In contrast, reinforcement learning does not lead to any improvement in pass@64 scores. These observations highlight the advantages of leveraging a stronger teacher model in guiding student model learning.

Table 21: Comparison of reinforcement learning and on-policy distillation on Qwen3-8B. Numbers in parentheses indicate pass@64 scores.

表 21: Comparison of reinforcement learning and on-policy distillation on Qwen3-8B. Numbers in parentheses indicate pass@64 scores.

| Method | AIME'24 | AIME'25 | MATH500 | LiveCodeBench v5 | MMLU -Redux | GPQA -Diamond | GPU Hours |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Off-policy Distillation | 55.0 (90.0) | 42.8 (83.3) | 92.4 | 42.0 | 86.4 | 55.6 | - |
| + Reinforcement Learning | 67.6 (90.0) | 55.5 (83.3) | 94.8 | 52.9 | 86.9 | 61.3 | 17,920 |
| + On-policy Distillation | 74.4 (93.3) | 65.5 (86.7) | 97.0 | 60.3 | 88.3 | 63.3 | 1,800 |

The Effects of Thinking Mode Fusion and General RL To evaluate the effectiveness of Thinking Mode Fusion and General Reinforcement Learning (RL) during the post-training, we conduct evaluations on various stages of the Qwen-32B model. In addition to the datasets mentioned earlier, we introduce several in-house benchmarks to monitor other capabilities. These benchmarks include:

Fusion 与 General RL 效应: 在 Qwen3-32B 各阶段评测, 并加内部榜 CounterFactQA, LengthCtrl, ThinkFollow, ToolUse.

\- CounterFactQA: Contains counterfactual questions where the model needs to identify that the questions are not factual and avoid generating hallucinatory answers.

\- LengthCtrl: Includes creative writing tasks with length requirements; the final score is based on the difference between the generated content length and the target length.

\- ThinkFollow: Involves multi-turn dialogues with randomly inserted /think and /no\_think flags to test whether the model can correctly switch thinking modes based on user queries.

\- ToolUse: Evaluates the stability of the model in single-turn, multi-turn, and multi-step tool calling processes. The score includes accuracy in intent recognition, format accuracy, and parameter accuracy during the tool calling process.

Table 22: Performance of Qwen3-32B after Reasoning RL (Stage 2), Thinking Mode Fusion (Stage 3), and General RL (Stage 4). Benchmarks with \* are in-house datasets.

表 22: Performance of Qwen3-32B after Reasoning RL (Stage 2), Thinking Mode Fusion (Stage 3), and General RL (Stage 4). Benchmarks with \* are in-house datasets.

<table><tr><td rowspan="2"></td><td rowspan="2">Benchmark</td><td>Stage 2 Reasoning RL</td><td colspan="2">Stage 3 Thinking Mode Fusion</td><td colspan="2">Stage 4 General RL</td></tr><tr><td>Thinking</td><td>Thinking</td><td>Non-Thinking</td><td>Thinking</td><td>Non-Thinking</td></tr><tr><td rowspan="3">General Tasks</td><td>LiveBench 2024-11-25</td><td>68.6</td><td>70.9+2.3</td><td>57.1</td><td>74.9+4.0</td><td>59.8+2.8</td></tr><tr><td>Arena-Hard</td><td>86.8</td><td>89.4+2.6</td><td>88.5</td><td>93.8+4.4</td><td>92.8+4.3</td></tr><tr><td>CounterFactQA*</td><td>50.4</td><td>61.3+10.9</td><td>64.3</td><td>68.1+6.8</td><td>66.4+2.1</td></tr><tr><td rowspan="4">Instruction &amp; Format Following</td><td>IFEval strict prompt</td><td>73.0</td><td>78.4+5.4</td><td>78.4</td><td>85.0+6.6</td><td>83.2+4.8</td></tr><tr><td>Multi-IF</td><td>61.4</td><td>64.6+3.2</td><td>65.2</td><td>73.0+8.4</td><td>70.7+5.5</td></tr><tr><td>LengthCtrl*</td><td>62.6</td><td>70.6+8.0</td><td>84.9</td><td>73.5+2.9</td><td>87.3+2.4</td></tr><tr><td>ThinkFollow*</td><td>-</td><td></td><td>88.7</td><td colspan="2">98.9+10.2</td></tr><tr><td rowspan="2">Agent</td><td>BFCL v3</td><td>69.0</td><td>68.4-0.6</td><td>61.5</td><td>70.3+1.9</td><td>63.0+1.5</td></tr><tr><td>ToolUse*</td><td>63.3</td><td>70.4+7.1</td><td>73.2</td><td>85.5+15.1</td><td>86.5+13.3</td></tr><tr><td rowspan="2">Knowledge &amp; STEM</td><td>MMLU-Redux</td><td>91.4</td><td>91.0-0.4</td><td>86.7</td><td>90.9-0.1</td><td>85.7-1.0</td></tr><tr><td>GPQA-Diamond</td><td>68.8</td><td>69.0+0.2</td><td>50.4</td><td>68.4-0.6</td><td>54.6+4.3</td></tr><tr><td rowspan="2">Math &amp; Coding</td><td>AIME&#x27;24</td><td>83.8</td><td>81.9-1.9</td><td>28.5</td><td>81.4-0.5</td><td>31.0+2.5</td></tr><tr><td>LiveCodeBench v5</td><td>68.4</td><td>67.2-1.2</td><td>31.1</td><td>65.7-1.5</td><td>31.3+0.2</td></tr></table>

The results are shown in Table 22, where we can draw the following conclusions:

表 22 结论:

(1) Stage 3 integrates the non-thinking mode into the model, which already possesses thinking capabilities after the first two stages of training. The ThinkFollow benchmark score of 88.7 indicates that the model has developed an initial ability to switch between modes, though it still occasionally makes errors. Stage 3 also enhances the model's general and instruction-following capabilities in thinking mode, with CounterFactQA improving by 10.9 points and LengthCtrl by 8.0 points.

(1) Stage 3 融入 non-thinking; ThinkFollow 88.7 说明开关已初步可用. 同时抬 thinking 侧通用与指令, CounterFactQA +10.9, LengthCtrl +8.0.

<!-- page 22 of 35 -->

(2) Stage 4 further strengthens the model's general, instruction-following, and agent capabilities in both thinking and non-thinking modes. Notably, the ThinkFollow score improves to 98.9, ensuring accurate mode switching.

(2) Stage 4 继续加强两模式下的通用, 指令与 agent; ThinkFollow 到 98.9.

> **看表:** 表 22 里 ThinkFollow 在 Stage 3 是 88.7, Stage 4 才到 98.9, 模式开关的可靠性主要补在哪一段?
> 表 22: Stage 3 Fusion 已经让开关可用 (88.7), 但仍会偶发错误; Stage 4 General RL 再抬到 98.9. §4.7 (2) 把准确切换写在 Stage 4 的加强项里.

(3) For Knowledge, STEM, Math, and Coding tasks, Thinking Mode Fusion and General RL do not bring significant improvements. In contrast, for challenging tasks like AIME'24 and Live-CodeBench, the performance in thinking mode actually decreases after these two training stages. We conjecture this degradation is due to the model being trained on a broader range of general tasks, which may compromise its specialized capabilities in handling complex problems. During the development of Qwen3, we choose to accept this performance trade-off to enhance the model's overall versatility.

(3) 知识/STEM/数学/编码上 Fusion 与 General RL 无显著增益; AIME'24 与 LiveCodeBench 思考侧甚至略降. 报告猜想因通用任务变广而牺牲专项, 并选择接受该折中以换整体通用性.

> **想:** Fusion/General RL 伤了 AIME 还继续做, 不是矛盾吗?
> 报告接受折中: 换来模式切换, 指令与 agent 通用性. 表 22 里 ThinkFollow 到 98.9, ToolUse 大涨, AIME 思考侧略降.

> **核对:** global-batch load balancing 是不是还是旧的 token-level 辅助损失换皮?
> 报告点名 Qiu et al., 2025 的 global-batch 写法, 并与去掉共享专家一起写. 具体公式见该文, 本稿只记配置选择.

> **拆开:** instance-level 配比和 domain-level 配比差在哪一步?
> 前者用细粒度标签在小代理模型上消融到样本级; 后者只在数据源或领域桶上调权重. 报告声称走前者.

> **回看:** 训练顶长已经 32,768, 为何还要 YaRN+DCA?
> 训练段到 32k; YaRN+DCA 用于推理期再约四倍外推. 两段职责不同.

> **想:** 为何故意丢掉不用 CoT 也能答对的题?
> 防止 cold start 靠猜或短答混过去; 只留需要更深推理的题, 把上限留给后面 RL.

> **问:** 冷启动样本越少越好, 这不是和普通 SFT 相反吗?
> 是刻意的. 阶段目标是种推理模式, 不是刷满 Pass@1; 样本与步数少, 以免锁死后续 RL 探索.

> **看表:** 70.1 到 85.1 是最终对外分数吗?
> 这是 Reasoning RL 段内的轨迹. 对外旗舰 thinking 表 11 写 AIME'24 为 85.7, 还经过后续 Fusion/General RL.

> **拆开:** 空 thinking 块是训练花样, 还是部署接口?
> 两者都是. 训练保格式一致; 部署可直接拼接空块, 强制走 non-thinking.

> **确认:** thinking budget 触顶后的停想, 有没有单独训过?
> 报告写明未显式训练, 是双模式融合后对不完整思考的涌现; 触顶时人工插入停想指令再续写答案.

> **停一下:** budget 是硬截断思考 token, 还是另开一条搜索?
> 硬截断: 到阈值插入停想指令与 </think>, 再基于已有思考生成最终答案. 不是另开搜索树.

> **再看:** 为何 RL 反而不抬 pass@64?
> 表 21: 同起点上, +RL 的 pass@64 仍 90.0/83.3; +On-policy Distillation 到 93.3/86.7. 报告把探索扩展归到教师 logits 蒸馏.

> **看表:** budget 加大是否总是单调变好?
> 图 2 在数学/代码/STEM 线上呈平滑上升. 报告还预期输出超过 32K 仍有空间, 留作后续.

> **回看:** 长检 RULER 上为何 thinking 反而掉点?
> 报告猜想检索不靠长推理, 思考内容可能干扰. 附录把 thinking budget 设到 8192 以抑制过长思考.

## 5 Conclusion

In this technical report, we introduce Qwen3, the latest version of the Qwen series. Qwen3 features both thinking mode and non-thinking mode, allowing users to dynamically manage the number of tokens used for complex thinking tasks. The model was pre-trained on an extensive dataset containing 36 trillion tokens, enabling it to understand and generate text in 119 languages and dialects. Through a series of comprehensive evaluations, Qwen3 has shown strong performance across a range of standard benchmarks for both pre-trained and post-trained models, including tasks related to code generation, mathematics, reasoning, and agents.

本技术报告推出 Qwen 系列最新版 Qwen3: 同时支持 thinking 与 non-thinking 模式, 用户可按复杂思考任务动态分配 token 用量. 模型在 36 万亿 token 的超大规模数据集上预训练, 可理解与生成 119 种语言与方言的文本. 经全面评测, Qwen3 的预训练与 post-training 模型在代码生成, 数学, 推理, Agent 等标准基准上均有强劲表现.

In the near future, our research will focus on several key areas. We will continue to scale up pretraining by using data that is both higher in quality and more diverse in content. At the same time, we will work on improving model architecture and training methods for the purposes of effective compression, scaling to extremely long contexts, etc. In addition, we plan to increase computational resources for reinforcement learning, with a particular emphasis on agent-based RL systems that learn from environmental feedback. This will allow us to build agents capable of tackling complex tasks that require inference time scaling.

近期研究将聚焦几个方向: 继续用质量更高, 内容更多样的数据扩大预训练规模; 改进模型架构与训练方法, 实现有效压缩与超长上下文扩展; 加大强化学习的算力投入, 重点是能从环境反馈中学习的 Agent 式 RL 系统, 以构建能应对需要 inference time scaling 的复杂任务的 Agent.

## 6 Authors

Core Contributors: An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, Chujie Zheng, Dayiheng Liu, Fan Zhou, Fei Huang, Feng Hu, Hao Ge, Haoran Wei, Huan Lin, Jialong Tang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Yang, Jiaxi Yang, Jing Zhou, Jingren Zhou, Junyang Lin, Kai Dang, Keqin Bao, Kexin Yang, Le Yu, Lianghao Deng, Mei Li, Mingfeng Xue, Mingze Li, Pei Zhang, Peng Wang, Qin Zhu, Rui Men, Ruize Gao, Shixuan Liu, Shuang Luo, Tianhao Li, Tianyi Tang, Wenbiao Yin, Xingzhang Ren, Xinyu Wang, Xinyu Zhang, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yinger Zhang, Yu Wan, Yuqiong Liu, Zekun Wang, Zeyu Cui, Zhenru Zhang, Zhipeng Zhou, Zihan Qiu

Contributors: Bei Chen, Biao Sun, Bin Luo, Bin Zhang, Binghai Wang, Bowen Ping, Boyi Deng, Chang Si, Chaojie Yang, Chen Cheng, Chenfei Wu, Chengpeng Li, Chengyuan Li, Fan Hong, Guobin Zhao, Hang Zhang, Hangrui Hu, Hanyu Zhao, Hao Lin, Hao Xiang, Haoyan Huang, Hongkun Hao, Humen Zhong, Jialin Wang, Jiandong Jiang, Jianqiang Wan, Jianyuan Zeng, Jiawei Chen, Jie Zhang, Jin Xu, Jinkai Wang, Jinyang Zhang, Jinzheng He, Jun Tang, Kai Zhang, Ke Yi, Keming Lu, Keqin Chen, Langshi Chen, Le Jiang, Lei Zhang, Linjuan Wu, Man Yuan, Mingkun Yang, Minmin Sun, Mouxiang Chen, Na Ni, Nuo Chen, Peng Liu, Peng Wang, Peng Zhu, Pengcheng Zhang, Pengfei Wang, Qiaoyu Tang, Qing Fu, Qiuyue Wang, Rong Zhang, Rui Hu, Runji Lin, Shen Huang, Shuai Bai, Shutong Jiang, Sibo Song, Siqi Zhang, Song Chen, Tao He, Ting He, Tingfeng Hui, Wei Ding, Wei Liao, Wei Lin, Wei Zhang, Weijia Xu, Wenbin Ge, Wenmeng Zhou, Wenyuan Yu, Xianyan Jia, Xianzhong Shi, Xiaodong Deng, Xiaoming Huang, Xiaoyuan Li, Ximing Zhou, Xinyao Niu, Xipin Wei, Xuejing Liu, Yang Liu, Yang Yao, Yang Zhang, Yanpeng Li, Yantao Liu, Yidan Zhang, Yikai Zhu, Yiming Wang, Yiwen Hu, Yong Jiang, Yong Li, Yongan Yue, Yu Guan, Yuanzhi Zhu, Yunfei Chu, Yunlong Feng, Yuxin Zhou, Yuxuan Cai, Zeyao Ma, Zhaohai Li, Zheng Li, Zhengyang Tang, Zheren Fu, Zhi Li, Zhibo Yang, Zhifang Guo, Zhipeng Zhang, Zhiying Xu, Zhiyu Yin, Zhongshen Zeng, Zile Qiao, Ziye Meng, Zongmeng Zhang

<!-- page 23 of 35 -->

## A Appendix

### A.1 Additional Evaluation Results

#### A.1.1 Long-Context Ability

Table 23: Performance of Qwen3 Models on the RULER benchmark.

<table><tr><td rowspan="2" colspan="2">Model</td><td colspan="7">RULER</td></tr><tr><td>Avg.</td><td>4K</td><td>8K</td><td>16K</td><td>32K</td><td>64K</td><td>128K</td></tr><tr><td rowspan="4"></td><td>Qwen2.5-7B-Instruct</td><td>85.4</td><td>96.7</td><td>95.1</td><td>93.7</td><td>89.4</td><td>82.3</td><td>55.1</td></tr><tr><td>Qwen2.5-14B-Instruct</td><td>91.4</td><td>97.7</td><td>96.8</td><td>95.9</td><td>93.4</td><td>86.7</td><td>78.1</td></tr><tr><td>Qwen2.5-32B-Instruct</td><td>92.9</td><td>96.9</td><td>97.1</td><td>95.5</td><td>95.5</td><td>90.3</td><td>82.0</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>95.1</td><td>97.7</td><td>97.2</td><td>97.7</td><td>96.5</td><td>93.0</td><td>88.4</td></tr><tr><td rowspan="6">Non-thinking Mode</td><td>Qwen3-4B</td><td>85.2</td><td>95.1</td><td>93.6</td><td>91.0</td><td>87.8</td><td>77.8</td><td>66.0</td></tr><tr><td>Qwen3-8B</td><td>89.1</td><td>96.3</td><td>96.0</td><td>91.8</td><td>91.2</td><td>82.1</td><td>77.4</td></tr><tr><td>Qwen3-14B</td><td>94.6</td><td>98.0</td><td>97.8</td><td>96.4</td><td>96.1</td><td>94.0</td><td>85.1</td></tr><tr><td>Qwen3-32B</td><td>93.7</td><td>98.4</td><td>96.0</td><td>96.2</td><td>94.4</td><td>91.8</td><td>85.6</td></tr><tr><td>Qwen3-30B-A3B</td><td>91.6</td><td>96.5</td><td>97.0</td><td>95.3</td><td>92.4</td><td>89.1</td><td>79.2</td></tr><tr><td>Qwen3-235B-A22B</td><td>95.0</td><td>97.7</td><td>97.2</td><td>96.4</td><td>95.1</td><td>93.3</td><td>90.6</td></tr><tr><td rowspan="6">Thinking Mode</td><td>Qwen3-4B</td><td>83.5</td><td>92.7</td><td>88.7</td><td>86.5</td><td>83.2</td><td>83.0</td><td>67.2</td></tr><tr><td>Qwen3-8B</td><td>84.4</td><td>94.7</td><td>94.4</td><td>86.1</td><td>80.8</td><td>78.3</td><td>72.0</td></tr><tr><td>Qwen3-14B</td><td>90.1</td><td>95.4</td><td>93.6</td><td>89.8</td><td>91.9</td><td>90.6</td><td>79.0</td></tr><tr><td>Qwen3-32B</td><td>91.0</td><td>94.7</td><td>93.7</td><td>91.6</td><td>92.5</td><td>90.0</td><td>83.5</td></tr><tr><td>Qwen3-30B-A3B</td><td>86.6</td><td>94.1</td><td>92.7</td><td>89.0</td><td>86.6</td><td>82.1</td><td>75.0</td></tr><tr><td>Qwen3-235B-A22B</td><td>92.2</td><td>95.1</td><td>94.8</td><td>93.0</td><td>92.3</td><td>92.0</td><td>86.0</td></tr></table>

For evaluating long-context processing capabilities, we report the results on the RULER benchmark (Hsieh et al., 2024) in Table 23. To enable length extrapolation, we utilize YARN (Peng et al., 2023) with a scaling\_factor=4. In thinking mode, we set the thinking budget to 8192 tokens to mitigate overly verbose reasoning on the extremely long inputs.

长上下文处理能力报在表 23 的 RULER 基准上. 为支持长度外推, 我们使用 scaling_factor=4 的 YARN. thinking 模式下把 thinking budget 设为 8192 token, 以抑制超长输入上过长的推理.

The results show that:

结果表明:

1. In non-thinking mode, Qwen3 outperforms Qwen2.5 models of a similar size in long-context processing tasks.

1. non-thinking 模式下, Qwen3 在长上下文任务上超过同尺寸 Qwen2.5.

2. In thinking mode, the model's performance slightly degrades. We hypothesize that the thinking content does not provide significant benefits for these retrieval tasks, which do not rely on reasoning and may instead interfere with the retrieval process. We are committed to enhancing the long-context capability in the thinking mode in future versions.

2. thinking 模式下成绩略有下降, 我们猜想检索类任务并不依赖推理, 思考内容收益有限, 反而可能干扰检索过程; 后续版本会继续增强 thinking 模式的长上下文能力.

#### A.1.2 Multilingual Ability

Table 24-35 presents the detailed benchmark scores across various languages, including Spanish, French, Portuguese, Italian, Arabic, Japanese, Korean, Indonesian, Russian, Vietnamese, German, and Thai. The results of these tables demonstrate that the Qwen3 series models achieve competitive performance across all evaluated benchmarks, showcasing their strong multilingual capabilities.

To evaluate the performance of Qwen3 across a broader range of languages, we utilize Belebele (Bandarkar et al., 2023), a benchmark for natural language understanding. We conduct evaluations on 80 supported languages from the benchmark, excluding 42 unoptimized languages, as shown in Table 36 (organized by language family). The performance comparison between Qwen3 and other baseline models on the Belebele benchmark is presented in Table 37. The results show that Qwen3 achieves comparable performance to similarly-sized Gemma models while outperforming Qwen2.5 significantly.

为评测更广语言范围的表现, 我们使用自然语言理解基准 Belebele, 在其支持的 80 种语言上评测 (剔除 42 种未优化的语言), 按语系整理在表 36; 与其他基线模型的对比见表 37. 结果显示: Qwen3 与同尺寸 Gemma 模型表现相当, 并显著优于 Qwen2.5.

<!-- page 24 of 35 -->

Table 24: Benchmark scores for language: Spanish (es). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>Multi-IF</td><td>MLogiQA</td><td>INCLUDE</td><td>MMMLU</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>80.1</td><td>70.0</td><td>96.4</td><td>88.7</td><td>90.0</td><td>54.4</td><td>79.9</td></tr><tr><td>QwQ-32B</td><td>70.0</td><td>75.0</td><td>81.8</td><td>84.5</td><td>76.7</td><td>52.2</td><td>73.4</td></tr><tr><td>Qwen3-235B-A22B</td><td>74.2</td><td>76.2</td><td>89.1</td><td>86.7</td><td>86.7</td><td>57.3</td><td>78.4</td></tr><tr><td>Qwen3-32B</td><td>74.7</td><td>68.8</td><td>90.9</td><td>82.8</td><td>76.7</td><td>51.8</td><td>74.3</td></tr><tr><td>Qwen3-30B-A3B</td><td>74.9</td><td>71.2</td><td>80.0</td><td>81.9</td><td>76.7</td><td>48.5</td><td>72.2</td></tr><tr><td>Qwen3-14B</td><td>76.2</td><td>67.5</td><td>83.6</td><td>81.1</td><td>73.3</td><td>50.3</td><td>72.0</td></tr><tr><td>Qwen3-8B</td><td>74.1</td><td>70.0</td><td>78.2</td><td>79.2</td><td>70.0</td><td>43.7</td><td>69.2</td></tr><tr><td>Qwen3-4B</td><td>69.1</td><td>68.8</td><td>72.7</td><td>75.7</td><td>66.7</td><td>42.3</td><td>65.9</td></tr><tr><td>Qwen3-1.7B</td><td>56.0</td><td>55.0</td><td>72.7</td><td>64.5</td><td>46.7</td><td>30.2</td><td>54.2</td></tr><tr><td>Qwen3-0.6B</td><td>39.2</td><td>42.5</td><td>54.5</td><td>48.8</td><td>13.3</td><td>14.3</td><td>35.4</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>67.5</td><td>52.5</td><td>89.1</td><td>80.6</td><td>10.0</td><td>15.5</td><td>52.5</td></tr><tr><td>Gemma-3-27b-IT</td><td>73.5</td><td>57.5</td><td>89.1</td><td>77.7</td><td>30.0</td><td>22.4</td><td>58.4</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>66.7</td><td>61.3</td><td>80.0</td><td>80.1</td><td>20.0</td><td>18.8</td><td>54.5</td></tr><tr><td>Qwen3-235B-A22B</td><td>71.7</td><td>66.2</td><td>83.6</td><td>83.7</td><td>33.3</td><td>29.5</td><td>61.3</td></tr><tr><td>Qwen3-32B</td><td>72.1</td><td>65.0</td><td>83.6</td><td>80.4</td><td>26.7</td><td>24.7</td><td>58.8</td></tr><tr><td>Qwen3-30B-A3B</td><td>72.1</td><td>53.8</td><td>85.5</td><td>78.3</td><td>33.3</td><td>25.0</td><td>58.0</td></tr><tr><td>Qwen3-14B</td><td>76.2</td><td>63.7</td><td>78.2</td><td>77.4</td><td>40.0</td><td>25.0</td><td>60.1</td></tr><tr><td>Qwen3-8B</td><td>73.1</td><td>50.0</td><td>80.0</td><td>73.7</td><td>16.7</td><td>21.3</td><td>52.5</td></tr><tr><td>Qwen3-4B</td><td>65.8</td><td>50.0</td><td>60.0</td><td>68.3</td><td>13.3</td><td>17.3</td><td>45.8</td></tr><tr><td>Qwen3-1.7B</td><td>47.9</td><td>43.8</td><td>50.9</td><td>54.3</td><td>10.0</td><td>11.6</td><td>36.4</td></tr><tr><td>Qwen3-0.6B</td><td>35.5</td><td>37.5</td><td>43.6</td><td>39.5</td><td>3.3</td><td>5.8</td><td>27.5</td></tr></table>

Table 25: Benchmark scores for language: French (fr). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>Multi-IF</td><td>MLogiQA</td><td>INCLUDE</td><td>MMMLU</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>80.5</td><td>73.8</td><td>85.7</td><td>88.3</td><td>80.0</td><td>52.8</td><td>76.8</td></tr><tr><td>QwQ-32B</td><td>72.4</td><td>78.8</td><td>76.2</td><td>84.0</td><td>80.0</td><td>49.4</td><td>73.5</td></tr><tr><td>Qwen3-235B-A22B</td><td>77.3</td><td>78.8</td><td>85.7</td><td>86.6</td><td>86.7</td><td>57.4</td><td>78.8</td></tr><tr><td>Qwen3-32B</td><td>76.7</td><td>81.2</td><td>76.2</td><td>82.1</td><td>83.3</td><td>47.1</td><td>74.4</td></tr><tr><td>Qwen3-30B-A3B</td><td>75.2</td><td>67.5</td><td>83.3</td><td>81.0</td><td>76.7</td><td>46.9</td><td>71.8</td></tr><tr><td>Qwen3-14B</td><td>77.6</td><td>71.2</td><td>73.8</td><td>80.4</td><td>73.3</td><td>44.2</td><td>70.1</td></tr><tr><td>Qwen3-8B</td><td>73.8</td><td>66.2</td><td>85.7</td><td>77.9</td><td>70.0</td><td>45.3</td><td>69.8</td></tr><tr><td>Qwen3-4B</td><td>71.3</td><td>63.7</td><td>71.4</td><td>74.5</td><td>66.7</td><td>40.2</td><td>64.6</td></tr><tr><td>Qwen3-1.7B</td><td>52.6</td><td>56.2</td><td>54.8</td><td>64.8</td><td>60.0</td><td>28.7</td><td>52.8</td></tr><tr><td>Qwen3-0.6B</td><td>36.1</td><td>48.8</td><td>47.6</td><td>48.4</td><td>6.7</td><td>14.0</td><td>33.6</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>67.8</td><td>56.2</td><td>85.7</td><td>81.8</td><td>10.0</td><td>15.3</td><td>52.8</td></tr><tr><td>Gemma-3-27b-IT</td><td>73.9</td><td>57.5</td><td>73.8</td><td>78.3</td><td>23.3</td><td>21.5</td><td>54.7</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>72.1</td><td>55.0</td><td>81.0</td><td>80.2</td><td>26.7</td><td>15.7</td><td>55.1</td></tr><tr><td>Qwen3-235B-A22B</td><td>73.2</td><td>65.0</td><td>88.1</td><td>81.1</td><td>36.7</td><td>28.1</td><td>62.0</td></tr><tr><td>Qwen3-32B</td><td>75.8</td><td>60.0</td><td>73.8</td><td>79.5</td><td>30.0</td><td>23.0</td><td>57.0</td></tr><tr><td>Qwen3-30B-A3B</td><td>75.6</td><td>52.5</td><td>69.0</td><td>77.9</td><td>26.7</td><td>27.3</td><td>54.8</td></tr><tr><td>Qwen3-14B</td><td>78.4</td><td>63.7</td><td>73.8</td><td>75.1</td><td>33.3</td><td>24.4</td><td>58.1</td></tr><tr><td>Qwen3-8B</td><td>71.9</td><td>52.5</td><td>71.4</td><td>71.7</td><td>20.0</td><td>21.4</td><td>51.5</td></tr><tr><td>Qwen3-4B</td><td>64.2</td><td>47.5</td><td>61.9</td><td>67.6</td><td>20.0</td><td>19.2</td><td>46.7</td></tr><tr><td>Qwen3-1.7B</td><td>46.1</td><td>43.8</td><td>64.3</td><td>53.2</td><td>3.3</td><td>11.6</td><td>37.0</td></tr><tr><td>Qwen3-0.6B</td><td>32.8</td><td>35.0</td><td>38.1</td><td>39.4</td><td>6.7</td><td>4.6</td><td>26.1</td></tr></table>

<!-- page 25 of 35 -->

Table 26: Benchmark scores for language: Portuguese (pt). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>Multi-IF</td><td>MLogiQA</td><td>INCLUDE</td><td>MMMLU</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>80.5</td><td>73.8</td><td>83.9</td><td>88.9</td><td>73.3</td><td>52.2</td><td>75.4</td></tr><tr><td>QwQ-32B</td><td>70.5</td><td>70.0</td><td>80.4</td><td>84.0</td><td>80.0</td><td>48.7</td><td>72.3</td></tr><tr><td>Qwen3-235B-A22B</td><td>73.6</td><td>78.8</td><td>78.6</td><td>86.2</td><td>86.7</td><td>58.3</td><td>77.0</td></tr><tr><td>Qwen3-32B</td><td>74.1</td><td>76.2</td><td>76.8</td><td>82.6</td><td>80.0</td><td>52.4</td><td>73.7</td></tr><tr><td>Qwen3-30B-A3B</td><td>76.1</td><td>71.2</td><td>71.4</td><td>81.0</td><td>76.7</td><td>49.3</td><td>71.0</td></tr><tr><td>Qwen3-14B</td><td>77.3</td><td>68.8</td><td>75.0</td><td>81.6</td><td>83.3</td><td>46.7</td><td>72.1</td></tr><tr><td>Qwen3-8B</td><td>73.9</td><td>67.5</td><td>75.0</td><td>78.6</td><td>56.7</td><td>44.8</td><td>66.1</td></tr><tr><td>Qwen3-4B</td><td>70.6</td><td>62.5</td><td>71.4</td><td>75.1</td><td>73.3</td><td>44.2</td><td>66.2</td></tr><tr><td>Qwen3-1.7B</td><td>55.6</td><td>60.0</td><td>53.6</td><td>64.6</td><td>46.7</td><td>28.2</td><td>51.4</td></tr><tr><td>Qwen3-0.6B</td><td>38.7</td><td>33.8</td><td>42.9</td><td>47.5</td><td>10.0</td><td>12.7</td><td>30.9</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>66.8</td><td>57.5</td><td>78.6</td><td>80.7</td><td>10.0</td><td>15.0</td><td>51.4</td></tr><tr><td>Gemma-3-27b-IT</td><td>72.9</td><td>55.0</td><td>75.0</td><td>77.1</td><td>33.3</td><td>20.9</td><td>55.7</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>68.8</td><td>55.0</td><td>71.4</td><td>82.2</td><td>23.3</td><td>11.3</td><td>52.0</td></tr><tr><td>Qwen3-235B-A22B</td><td>72.5</td><td>67.5</td><td>82.1</td><td>83.5</td><td>33.3</td><td>28.3</td><td>61.2</td></tr><tr><td>Qwen3-32B</td><td>71.1</td><td>61.3</td><td>73.2</td><td>80.6</td><td>30.0</td><td>23.9</td><td>56.7</td></tr><tr><td>Qwen3-30B-A3B</td><td>72.3</td><td>47.5</td><td>67.9</td><td>77.8</td><td>26.7</td><td>24.0</td><td>52.7</td></tr><tr><td>Qwen3-14B</td><td>75.5</td><td>58.8</td><td>75.0</td><td>76.5</td><td>26.7</td><td>25.8</td><td>56.4</td></tr><tr><td>Qwen3-8B</td><td>71.9</td><td>56.2</td><td>71.4</td><td>72.9</td><td>20.0</td><td>19.7</td><td>52.0</td></tr><tr><td>Qwen3-4B</td><td>66.1</td><td>50.0</td><td>73.2</td><td>66.7</td><td>10.0</td><td>18.1</td><td>47.4</td></tr><tr><td>Qwen3-1.7B</td><td>49.5</td><td>33.8</td><td>39.3</td><td>52.9</td><td>6.7</td><td>12.8</td><td>32.5</td></tr><tr><td>Qwen3-0.6B</td><td>36.6</td><td>37.5</td><td>42.9</td><td>37.5</td><td>3.3</td><td>5.7</td><td>27.2</td></tr></table>

Table 27: Benchmark scores for language: Italian (it). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>Multi-IF</td><td>INCLUDE</td><td>MMMLU</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>80.9</td><td>100.0</td><td>87.2</td><td>90.0</td><td>54.1</td><td>82.4</td></tr><tr><td>QwQ-32B</td><td>71.2</td><td>96.4</td><td>84.9</td><td>76.7</td><td>49.3</td><td>75.7</td></tr><tr><td>Qwen3-235B-A22B</td><td>73.7</td><td>96.4</td><td>85.7</td><td>80.0</td><td>57.4</td><td>78.6</td></tr><tr><td>Qwen3-32B</td><td>76.6</td><td>90.9</td><td>81.6</td><td>80.0</td><td>49.7</td><td>75.8</td></tr><tr><td>Qwen3-30B-A3B</td><td>75.9</td><td>94.5</td><td>81.9</td><td>80.0</td><td>48.1</td><td>76.1</td></tr><tr><td>Qwen3-14B</td><td>79.0</td><td>94.5</td><td>80.2</td><td>70.0</td><td>47.0</td><td>74.1</td></tr><tr><td>Qwen3-8B</td><td>74.6</td><td>89.1</td><td>77.5</td><td>76.7</td><td>46.1</td><td>72.8</td></tr><tr><td>Qwen3-4B</td><td>69.8</td><td>83.6</td><td>74.4</td><td>76.7</td><td>44.5</td><td>69.8</td></tr><tr><td>Qwen3-1.7B</td><td>54.6</td><td>74.5</td><td>64.2</td><td>53.3</td><td>29.6</td><td>55.2</td></tr><tr><td>Qwen3-0.6B</td><td>37.8</td><td>45.5</td><td>45.9</td><td>6.7</td><td>13.3</td><td>29.8</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>67.6</td><td>98.2</td><td>80.7</td><td>13.3</td><td>15.2</td><td>55.0</td></tr><tr><td>Gemma-3-27b-IT</td><td>74.6</td><td>90.9</td><td>78.4</td><td>23.3</td><td>20.5</td><td>57.5</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>67.2</td><td>94.5</td><td>80.7</td><td>16.7</td><td>16.7</td><td>55.2</td></tr><tr><td>Qwen3-235B-A22B</td><td>72.9</td><td>92.7</td><td>82.6</td><td>33.3</td><td>28.6</td><td>62.0</td></tr><tr><td>Qwen3-32B</td><td>71.4</td><td>92.7</td><td>79.5</td><td>30.0</td><td>23.0</td><td>59.3</td></tr><tr><td>Qwen3-30B-A3B</td><td>73.9</td><td>87.3</td><td>77.7</td><td>33.3</td><td>24.8</td><td>59.4</td></tr><tr><td>Qwen3-14B</td><td>75.8</td><td>89.1</td><td>75.7</td><td>26.7</td><td>27.6</td><td>59.0</td></tr><tr><td>Qwen3-8B</td><td>72.1</td><td>85.5</td><td>72.9</td><td>13.3</td><td>23.8</td><td>53.5</td></tr><tr><td>Qwen3-4B</td><td>63.0</td><td>78.2</td><td>67.8</td><td>23.3</td><td>19.3</td><td>50.3</td></tr><tr><td>Qwen3-1.7B</td><td>46.1</td><td>70.9</td><td>53.4</td><td>6.7</td><td>11.9</td><td>37.8</td></tr><tr><td>Qwen3-0.6B</td><td>35.1</td><td>43.6</td><td>39.0</td><td>0.0</td><td>4.5</td><td>24.4</td></tr></table>

<!-- page 26 of 35 -->

Table 28: Benchmark scores for language: Arabic (ar). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>MLogiQA</td><td>INCLUDE</td><td>MMMLU</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>75.0</td><td>89.3</td><td>87.8</td><td>76.7</td><td>52.6</td><td>76.3</td></tr><tr><td>QwQ-32B</td><td>75.0</td><td>67.9</td><td>81.8</td><td>80.0</td><td>41.3</td><td>69.2</td></tr><tr><td>Qwen3-235B-A22B</td><td>80.0</td><td>71.4</td><td>83.6</td><td>76.7</td><td>53.7</td><td>73.1</td></tr><tr><td>Qwen3-32B</td><td>66.2</td><td>73.2</td><td>80.1</td><td>86.7</td><td>47.0</td><td>70.6</td></tr><tr><td>Qwen3-30B-A3B</td><td>66.2</td><td>66.1</td><td>77.2</td><td>83.3</td><td>47.3</td><td>68.0</td></tr><tr><td>Qwen3-14B</td><td>71.2</td><td>67.9</td><td>77.4</td><td>83.3</td><td>46.6</td><td>69.3</td></tr><tr><td>Qwen3-8B</td><td>65.0</td><td>67.9</td><td>74.4</td><td>76.7</td><td>44.9</td><td>65.8</td></tr><tr><td>Qwen3-4B</td><td>62.5</td><td>55.4</td><td>67.7</td><td>66.7</td><td>41.2</td><td>58.7</td></tr><tr><td>Qwen3-1.7B</td><td>55.0</td><td>44.6</td><td>53.2</td><td>36.7</td><td>25.8</td><td>43.1</td></tr><tr><td>Qwen3-0.6B</td><td>40.0</td><td>41.1</td><td>38.9</td><td>10.0</td><td>11.7</td><td>28.3</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>51.2</td><td>78.6</td><td>80.9</td><td>13.3</td><td>12.9</td><td>47.4</td></tr><tr><td>Gemma-3-27b-IT</td><td>56.2</td><td>62.5</td><td>74.4</td><td>26.7</td><td>22.8</td><td>48.5</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>56.2</td><td>66.1</td><td>77.2</td><td>6.7</td><td>14.7</td><td>44.2</td></tr><tr><td>Qwen3-235B-A22B</td><td>66.2</td><td>67.9</td><td>79.5</td><td>40.0</td><td>28.2</td><td>56.4</td></tr><tr><td>Qwen3-32B</td><td>55.0</td><td>69.6</td><td>75.7</td><td>23.3</td><td>25.4</td><td>49.8</td></tr><tr><td>Qwen3-30B-A3B</td><td>48.8</td><td>64.3</td><td>71.6</td><td>30.0</td><td>22.6</td><td>47.5</td></tr><tr><td>Qwen3-14B</td><td>52.5</td><td>60.7</td><td>69.5</td><td>23.3</td><td>23.5</td><td>45.9</td></tr><tr><td>Qwen3-8B</td><td>45.0</td><td>58.9</td><td>64.6</td><td>13.3</td><td>16.4</td><td>39.6</td></tr><tr><td>Qwen3-4B</td><td>52.5</td><td>42.9</td><td>56.7</td><td>13.3</td><td>15.3</td><td>36.1</td></tr><tr><td>Qwen3-1.7B</td><td>31.2</td><td>37.5</td><td>43.6</td><td>3.3</td><td>9.4</td><td>25.0</td></tr><tr><td>Qwen3-0.6B</td><td>40.0</td><td>39.3</td><td>35.4</td><td>0.0</td><td>3.8</td><td>23.7</td></tr></table>

Table 29: Benchmark scores for language: Japanese (ja). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>MLogiQA</td><td>INCLUDE</td><td>MMMLU</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>72.5</td><td>74.5</td><td>83.8</td><td>83.3</td><td>55.4</td><td>73.9</td></tr><tr><td>QwQ-32B</td><td>73.8</td><td>86.3</td><td>82.3</td><td>53.3</td><td>39.9</td><td>67.1</td></tr><tr><td>Qwen3-235B-A22B</td><td>75.0</td><td>94.1</td><td>84.8</td><td>73.3</td><td>52.7</td><td>76.0</td></tr><tr><td>Qwen3-32B</td><td>70.0</td><td>90.2</td><td>80.2</td><td>76.7</td><td>47.7</td><td>73.0</td></tr><tr><td>Qwen3-30B-A3B</td><td>66.2</td><td>88.2</td><td>79.9</td><td>73.3</td><td>47.4</td><td>71.0</td></tr><tr><td>Qwen3-14B</td><td>68.8</td><td>88.2</td><td>79.4</td><td>66.7</td><td>45.7</td><td>69.8</td></tr><tr><td>Qwen3-8B</td><td>71.2</td><td>86.3</td><td>74.9</td><td>73.3</td><td>44.7</td><td>70.1</td></tr><tr><td>Qwen3-4B</td><td>63.7</td><td>80.4</td><td>72.5</td><td>53.3</td><td>40.7</td><td>62.1</td></tr><tr><td>Qwen3-1.7B</td><td>53.8</td><td>74.5</td><td>61.8</td><td>36.7</td><td>28.5</td><td>51.1</td></tr><tr><td>Qwen3-0.6B</td><td>47.5</td><td>47.1</td><td>45.1</td><td>13.3</td><td>14.5</td><td>33.5</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>60.0</td><td>92.2</td><td>81.9</td><td>10.0</td><td>12.5</td><td>51.3</td></tr><tr><td>Gemma-3-27b-IT</td><td>66.2</td><td>86.3</td><td>76.5</td><td>20.0</td><td>17.3</td><td>53.3</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>55.0</td><td>94.1</td><td>77.7</td><td>16.7</td><td>17.7</td><td>52.2</td></tr><tr><td>Qwen3-235B-A22B</td><td>67.5</td><td>92.2</td><td>80.9</td><td>26.7</td><td>26.9</td><td>58.8</td></tr><tr><td>Qwen3-32B</td><td>58.8</td><td>92.2</td><td>78.0</td><td>20.0</td><td>20.5</td><td>53.9</td></tr><tr><td>Qwen3-30B-A3B</td><td>51.2</td><td>82.4</td><td>74.9</td><td>30.0</td><td>20.6</td><td>51.8</td></tr><tr><td>Qwen3-14B</td><td>55.0</td><td>84.3</td><td>73.8</td><td>33.3</td><td>19.8</td><td>53.2</td></tr><tr><td>Qwen3-8B</td><td>47.5</td><td>82.4</td><td>69.9</td><td>20.0</td><td>18.5</td><td>47.7</td></tr><tr><td>Qwen3-4B</td><td>46.2</td><td>76.5</td><td>64.8</td><td>13.3</td><td>15.1</td><td>43.2</td></tr><tr><td>Qwen3-1.7B</td><td>40.0</td><td>68.6</td><td>46.3</td><td>3.3</td><td>11.6</td><td>34.0</td></tr><tr><td>Qwen3-0.6B</td><td>37.5</td><td>37.3</td><td>37.9</td><td>3.3</td><td>3.7</td><td>23.9</td></tr></table>

<!-- page 27 of 35 -->

Table 30: Benchmark scores for language: Korean (ko). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>MLogiQA</td><td>INCLUDE</td><td>MMMLU</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>75.0</td><td>88.0</td><td>85.9</td><td>76.7</td><td>50.0</td><td>75.1</td></tr><tr><td>QwQ-32B</td><td>76.2</td><td>72.0</td><td>81.8</td><td>60.0</td><td>40.0</td><td>66.0</td></tr><tr><td>Qwen3-235B-A22B</td><td>71.2</td><td>80.0</td><td>84.7</td><td>80.0</td><td>55.7</td><td>74.3</td></tr><tr><td>Qwen3-32B</td><td>71.2</td><td>74.0</td><td>79.2</td><td>80.0</td><td>48.5</td><td>70.6</td></tr><tr><td>Qwen3-30B-A3B</td><td>68.8</td><td>72.0</td><td>78.6</td><td>76.7</td><td>46.6</td><td>68.5</td></tr><tr><td>Qwen3-14B</td><td>67.5</td><td>74.0</td><td>79.6</td><td>76.7</td><td>46.0</td><td>68.8</td></tr><tr><td>Qwen3-8B</td><td>60.0</td><td>80.0</td><td>74.7</td><td>76.7</td><td>42.3</td><td>66.7</td></tr><tr><td>Qwen3-4B</td><td>66.2</td><td>74.0</td><td>68.8</td><td>70.0</td><td>40.6</td><td>63.9</td></tr><tr><td>Qwen3-1.7B</td><td>53.8</td><td>66.0</td><td>57.8</td><td>43.3</td><td>25.2</td><td>49.2</td></tr><tr><td>Qwen3-0.6B</td><td>33.8</td><td>52.0</td><td>41.5</td><td>13.3</td><td>11.8</td><td>30.5</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>63.7</td><td>80.0</td><td>80.5</td><td>13.3</td><td>12.9</td><td>50.1</td></tr><tr><td>Gemma-3-27b-IT</td><td>58.8</td><td>76.0</td><td>75.9</td><td>20.0</td><td>18.3</td><td>49.8</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>58.8</td><td>68.0</td><td>76.7</td><td>6.7</td><td>17.7</td><td>45.6</td></tr><tr><td>Qwen3-235B-A22B</td><td>63.7</td><td>76.0</td><td>79.8</td><td>33.3</td><td>27.9</td><td>56.1</td></tr><tr><td>Qwen3-32B</td><td>60.0</td><td>74.0</td><td>77.2</td><td>26.7</td><td>21.2</td><td>51.8</td></tr><tr><td>Qwen3-30B-A3B</td><td>52.5</td><td>72.0</td><td>72.5</td><td>16.7</td><td>20.7</td><td>46.9</td></tr><tr><td>Qwen3-14B</td><td>52.5</td><td>68.0</td><td>73.3</td><td>20.0</td><td>18.7</td><td>46.5</td></tr><tr><td>Qwen3-8B</td><td>52.5</td><td>76.0</td><td>66.5</td><td>23.3</td><td>16.3</td><td>46.9</td></tr><tr><td>Qwen3-4B</td><td>46.2</td><td>74.0</td><td>59.9</td><td>13.3</td><td>16.6</td><td>42.0</td></tr><tr><td>Qwen3-1.7B</td><td>48.8</td><td>58.0</td><td>46.0</td><td>6.7</td><td>9.0</td><td>33.7</td></tr><tr><td>Qwen3-0.6B</td><td>40.0</td><td>52.0</td><td>36.9</td><td>0.0</td><td>5.5</td><td>26.9</td></tr></table>

Table 31: Benchmark scores for language: Indonesian (id). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>INCLUDE</td><td>MMMLU</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>80.0</td><td>86.3</td><td>83.3</td><td>51.3</td><td>75.2</td></tr><tr><td>QwQ-32B</td><td>76.4</td><td>83.7</td><td>73.3</td><td>47.3</td><td>70.2</td></tr><tr><td>Qwen3-235B-A22B</td><td>80.0</td><td>87.2</td><td>80.0</td><td>53.5</td><td>75.2</td></tr><tr><td>Qwen3-32B</td><td>80.0</td><td>82.0</td><td>76.7</td><td>45.6</td><td>71.1</td></tr><tr><td>Qwen3-30B-A3B</td><td>81.8</td><td>80.4</td><td>80.0</td><td>44.9</td><td>71.8</td></tr><tr><td>Qwen3-14B</td><td>78.2</td><td>79.6</td><td>70.0</td><td>45.3</td><td>68.3</td></tr><tr><td>Qwen3-8B</td><td>72.7</td><td>77.7</td><td>70.0</td><td>43.8</td><td>66.0</td></tr><tr><td>Qwen3-4B</td><td>70.9</td><td>72.3</td><td>66.7</td><td>41.2</td><td>62.8</td></tr><tr><td>Qwen3-1.7B</td><td>63.6</td><td>61.2</td><td>36.7</td><td>26.8</td><td>47.1</td></tr><tr><td>Qwen3-0.6B</td><td>36.4</td><td>46.6</td><td>10.0</td><td>12.6</td><td>26.4</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>80.0</td><td>81.1</td><td>10.0</td><td>14.7</td><td>46.4</td></tr><tr><td>Gemma-3-27b-IT</td><td>76.4</td><td>75.9</td><td>13.3</td><td>22.6</td><td>47.0</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>74.5</td><td>78.8</td><td>10.0</td><td>16.6</td><td>45.0</td></tr><tr><td>Qwen3-235B-A22B</td><td>81.8</td><td>81.9</td><td>33.3</td><td>27.5</td><td>56.1</td></tr><tr><td>Qwen3-32B</td><td>81.8</td><td>77.2</td><td>23.3</td><td>24.3</td><td>51.6</td></tr><tr><td>Qwen3-30B-A3B</td><td>70.9</td><td>76.4</td><td>30.0</td><td>25.9</td><td>50.8</td></tr><tr><td>Qwen3-14B</td><td>70.9</td><td>74.1</td><td>26.7</td><td>24.6</td><td>49.1</td></tr><tr><td>Qwen3-8B</td><td>78.2</td><td>69.6</td><td>20.0</td><td>21.6</td><td>47.4</td></tr><tr><td>Qwen3-4B</td><td>67.3</td><td>66.5</td><td>13.3</td><td>19.0</td><td>41.5</td></tr><tr><td>Qwen3-1.7B</td><td>52.7</td><td>49.0</td><td>3.3</td><td>10.8</td><td>29.0</td></tr><tr><td>Qwen3-0.6B</td><td>52.7</td><td>40.0</td><td>3.3</td><td>5.1</td><td>25.3</td></tr></table>

<!-- page 28 of 35 -->

Table 32: Benchmark scores for language: Russian (ru). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>Multi-IF</td><td>INCLUDE</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>68.1</td><td>80.4</td><td>70.0</td><td>52.3</td><td>67.7</td></tr><tr><td>QwQ-32B</td><td>61.2</td><td>73.2</td><td>76.7</td><td>43.6</td><td>63.7</td></tr><tr><td>Qwen3-235B-A22B</td><td>62.2</td><td>80.4</td><td>80.0</td><td>53.1</td><td>68.9</td></tr><tr><td>Qwen3-32B</td><td>62.5</td><td>73.2</td><td>63.3</td><td>46.5</td><td>61.4</td></tr><tr><td>Qwen3-30B-A3B</td><td>60.7</td><td>76.8</td><td>73.3</td><td>45.4</td><td>64.0</td></tr><tr><td>Qwen3-14B</td><td>63.6</td><td>80.4</td><td>66.7</td><td>46.4</td><td>64.3</td></tr><tr><td>Qwen3-8B</td><td>62.9</td><td>69.6</td><td>63.3</td><td>37.7</td><td>58.4</td></tr><tr><td>Qwen3-4B</td><td>52.8</td><td>69.6</td><td>56.7</td><td>36.6</td><td>53.9</td></tr><tr><td>Qwen3-1.7B</td><td>37.8</td><td>46.4</td><td>20.0</td><td>22.8</td><td>31.8</td></tr><tr><td>Qwen3-0.6B</td><td>26.4</td><td>46.4</td><td>3.3</td><td>7.0</td><td>20.8</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>52.0</td><td>80.4</td><td>20.0</td><td>13.7</td><td>41.5</td></tr><tr><td>Gemma-3-27b-IT</td><td>57.3</td><td>71.4</td><td>23.3</td><td>21.6</td><td>43.4</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>54.1</td><td>67.9</td><td>20.0</td><td>13.3</td><td>38.8</td></tr><tr><td>Qwen3-235B-A22B</td><td>56.7</td><td>75.0</td><td>40.0</td><td>26.1</td><td>49.4</td></tr><tr><td>Qwen3-32B</td><td>58.6</td><td>71.4</td><td>30.0</td><td>23.3</td><td>45.8</td></tr><tr><td>Qwen3-30B-A3B</td><td>58.0</td><td>73.2</td><td>30.0</td><td>21.1</td><td>45.6</td></tr><tr><td>Qwen3-14B</td><td>60.3</td><td>71.4</td><td>26.7</td><td>24.2</td><td>45.6</td></tr><tr><td>Qwen3-8B</td><td>59.3</td><td>58.9</td><td>20.0</td><td>22.8</td><td>40.2</td></tr><tr><td>Qwen3-4B</td><td>46.1</td><td>58.9</td><td>13.3</td><td>17.8</td><td>34.0</td></tr><tr><td>Qwen3-1.7B</td><td>34.8</td><td>41.1</td><td>3.3</td><td>13.2</td><td>23.1</td></tr><tr><td>Qwen3-0.6B</td><td>25.5</td><td>46.4</td><td>0.0</td><td>5.8</td><td>19.4</td></tr></table>

Table 33: Benchmark scores for language: Vietnamese (vi). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>MLogiQA</td><td>INCLUDE</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>72.5</td><td>89.1</td><td>70.0</td><td>52.1</td><td>70.9</td></tr><tr><td>QwQ-32B</td><td>71.2</td><td>69.1</td><td>70.0</td><td>49.2</td><td>64.9</td></tr><tr><td>Qwen3-235B-A22B</td><td>75.0</td><td>87.3</td><td>83.3</td><td>55.1</td><td>75.2</td></tr><tr><td>Qwen3-32B</td><td>67.5</td><td>81.8</td><td>83.3</td><td>44.0</td><td>69.2</td></tr><tr><td>Qwen3-30B-A3B</td><td>68.8</td><td>78.2</td><td>76.7</td><td>46.1</td><td>67.4</td></tr><tr><td>Qwen3-14B</td><td>72.5</td><td>72.7</td><td>73.3</td><td>45.8</td><td>66.1</td></tr><tr><td>Qwen3-8B</td><td>65.0</td><td>72.7</td><td>73.3</td><td>42.9</td><td>63.5</td></tr><tr><td>Qwen3-4B</td><td>68.8</td><td>63.6</td><td>60.0</td><td>42.2</td><td>58.6</td></tr><tr><td>Qwen3-1.7B</td><td>52.5</td><td>61.8</td><td>30.0</td><td>26.9</td><td>42.8</td></tr><tr><td>Qwen3-0.6B</td><td>33.8</td><td>38.2</td><td>6.7</td><td>9.8</td><td>22.1</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>57.5</td><td>81.8</td><td>10.0</td><td>13.0</td><td>40.6</td></tr><tr><td>Gemma-3-27b-IT</td><td>52.5</td><td>74.5</td><td>33.3</td><td>20.6</td><td>45.2</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>61.3</td><td>72.7</td><td>26.7</td><td>18.6</td><td>44.8</td></tr><tr><td>Qwen3-235B-A22B</td><td>70.0</td><td>83.6</td><td>36.7</td><td>27.1</td><td>54.4</td></tr><tr><td>Qwen3-32B</td><td>60.0</td><td>81.8</td><td>23.3</td><td>21.8</td><td>46.7</td></tr><tr><td>Qwen3-30B-A3B</td><td>52.5</td><td>81.8</td><td>20.0</td><td>24.7</td><td>44.8</td></tr><tr><td>Qwen3-14B</td><td>63.7</td><td>67.3</td><td>20.0</td><td>21.6</td><td>43.2</td></tr><tr><td>Qwen3-8B</td><td>48.8</td><td>65.5</td><td>20.0</td><td>19.1</td><td>38.4</td></tr><tr><td>Qwen3-4B</td><td>48.8</td><td>65.5</td><td>20.0</td><td>19.0</td><td>38.3</td></tr><tr><td>Qwen3-1.7B</td><td>36.2</td><td>60.0</td><td>3.3</td><td>10.9</td><td>27.6</td></tr><tr><td>Qwen3-0.6B</td><td>30.0</td><td>36.4</td><td>3.3</td><td>3.9</td><td>18.4</td></tr></table>

<!-- page 29 of 35 -->

Table 34: Benchmark scores for language: German (de). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>INCLUDE</td><td>MMMLU</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>50.0</td><td>85.6</td><td>86.7</td><td>53.8</td><td>69.0</td></tr><tr><td>QwQ-32B</td><td>57.1</td><td>83.8</td><td>76.7</td><td>51.0</td><td>67.2</td></tr><tr><td>Qwen3-235B-A22B</td><td>71.4</td><td>86.0</td><td>83.3</td><td>55.4</td><td>74.0</td></tr><tr><td>Qwen3-32B</td><td>64.3</td><td>81.9</td><td>86.7</td><td>48.1</td><td>70.2</td></tr><tr><td>Qwen3-30B-A3B</td><td>64.3</td><td>81.9</td><td>80.0</td><td>46.6</td><td>68.2</td></tr><tr><td>Qwen3-14B</td><td>57.1</td><td>80.9</td><td>70.0</td><td>48.1</td><td>64.0</td></tr><tr><td>Qwen3-8B</td><td>64.3</td><td>78.1</td><td>66.7</td><td>43.6</td><td>63.2</td></tr><tr><td>Qwen3-4B</td><td>57.1</td><td>74.0</td><td>73.3</td><td>43.1</td><td>61.9</td></tr><tr><td>Qwen3-1.7B</td><td>64.3</td><td>63.4</td><td>36.7</td><td>26.8</td><td>47.8</td></tr><tr><td>Qwen3-0.6B</td><td>57.1</td><td>47.6</td><td>10.0</td><td>13.7</td><td>32.1</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>57.1</td><td>80.4</td><td>10.0</td><td>13.5</td><td>40.2</td></tr><tr><td>Gemma-3-27b-IT</td><td>57.1</td><td>76.1</td><td>26.7</td><td>20.2</td><td>45.0</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>64.3</td><td>79.9</td><td>16.7</td><td>19.3</td><td>45.0</td></tr><tr><td>Qwen3-235B-A22B</td><td>71.4</td><td>81.7</td><td>40.0</td><td>25.9</td><td>54.8</td></tr><tr><td>Qwen3-32B</td><td>57.1</td><td>77.2</td><td>30.0</td><td>21.9</td><td>46.6</td></tr><tr><td>Qwen3-30B-A3B</td><td>57.1</td><td>77.7</td><td>23.3</td><td>25.2</td><td>45.8</td></tr><tr><td>Qwen3-14B</td><td>57.1</td><td>76.0</td><td>30.0</td><td>24.5</td><td>46.9</td></tr><tr><td>Qwen3-8B</td><td>64.3</td><td>70.8</td><td>20.0</td><td>19.9</td><td>43.8</td></tr><tr><td>Qwen3-4B</td><td>64.3</td><td>66.0</td><td>26.7</td><td>16.4</td><td>43.4</td></tr><tr><td>Qwen3-1.7B</td><td>42.9</td><td>53.2</td><td>10.0</td><td>10.6</td><td>29.2</td></tr><tr><td>Qwen3-0.6B</td><td>42.9</td><td>37.8</td><td>3.3</td><td>5.7</td><td>22.4</td></tr></table>

Table 35: Benchmark scores for language: Thai (th). The highest and second-best scores are shown in bold and underlined, respectively.

<table><tr><td></td><td>Model</td><td>MLogiQA</td><td>MT-AIME24</td><td>PolyMath</td><td>Average</td></tr><tr><td rowspan="10">Thinking Mode</td><td>Gemini2.5-Pro</td><td>73.8</td><td>80.0</td><td>50.7</td><td>68.2</td></tr><tr><td>QwQ-32B</td><td>75.0</td><td>60.0</td><td>41.3</td><td>58.8</td></tr><tr><td>Qwen3-235B-A22B</td><td>73.8</td><td>86.7</td><td>53.6</td><td>71.4</td></tr><tr><td>Qwen3-32B</td><td>73.8</td><td>76.7</td><td>46.9</td><td>65.8</td></tr><tr><td>Qwen3-30B-A3B</td><td>63.7</td><td>80.0</td><td>45.2</td><td>63.0</td></tr><tr><td>Qwen3-14B</td><td>65.0</td><td>76.7</td><td>44.4</td><td>62.0</td></tr><tr><td>Qwen3-8B</td><td>68.8</td><td>70.0</td><td>41.3</td><td>60.0</td></tr><tr><td>Qwen3-4B</td><td>60.0</td><td>60.0</td><td>39.4</td><td>53.1</td></tr><tr><td>Qwen3-1.7B</td><td>48.8</td><td>33.3</td><td>23.7</td><td>35.3</td></tr><tr><td>Qwen3-0.6B</td><td>33.8</td><td>13.3</td><td>11.4</td><td>19.5</td></tr><tr><td rowspan="11">Non-thinking Mode</td><td>GPT-4o-2024-1120</td><td>52.5</td><td>10.0</td><td>11.9</td><td>24.8</td></tr><tr><td>Gemma-3-27b-IT</td><td>50.0</td><td>16.7</td><td>19.0</td><td>28.6</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>58.8</td><td>6.7</td><td>17.4</td><td>27.6</td></tr><tr><td>Qwen3-235B-A22B</td><td>61.3</td><td>23.3</td><td>27.6</td><td>37.4</td></tr><tr><td>Qwen3-32B</td><td>61.3</td><td>13.3</td><td>22.2</td><td>32.3</td></tr><tr><td>Qwen3-30B-A3B</td><td>50.0</td><td>30.0</td><td>22.3</td><td>34.1</td></tr><tr><td>Qwen3-14B</td><td>47.5</td><td>23.3</td><td>22.1</td><td>31.0</td></tr><tr><td>Qwen3-8B</td><td>42.5</td><td>10.0</td><td>17.2</td><td>23.2</td></tr><tr><td>Qwen3-4B</td><td>43.8</td><td>13.3</td><td>16.1</td><td>24.4</td></tr><tr><td>Qwen3-1.7B</td><td>42.5</td><td>6.7</td><td>9.5</td><td>19.6</td></tr><tr><td>Qwen3-0.6B</td><td>37.5</td><td>0.0</td><td>3.6</td><td>13.7</td></tr></table>

<!-- page 30 of 35 -->

Table 36: Language families and language codes supported by Qwen3 in Belebele Benchmark

| Language family | # Langs | Language code (ISO 639-3_ISO 15924) |
| --- | --- | --- |
| Indo-European | 40 | por_Latn, deu_Latn, tgk_Cyrl, ces_Latn, nob_Latn, dan_Latn, snd_Arab, spa_Latn, isl_Latn, slv_Latn, eng_Latn, ory_Orya, hrv_Latn, ell_Grek, ukr_Cyrl, pan_Guru, srp_Cyrl, npi_Deva, mkd_Cyrl, guj_Gujr, nld_Latn, swe_Latn, hin_Deva, rus_Cyrl, asm_Beng, cat_Latn, als_Latn, sin_Sinh, urd_Arab, mar_Deva, lit_Latn, slk_Latn, ita_Latn, pol_Latn, bul_Cyrl, afr_Latn, ron_Latn, fra_Latn, ben_Beng, hye_Armn |
| Sino-Tibetan | 3 | zho_Hans, mya_Mymr, zho_Hant |
| Afro-Asiatic | 8 | heb_Hebr, apc_Arab, acm_Arab, ary_Arab, ars_Arab, arb_Arab, mlt_Latn, erz_Arab |
| Austronesian | 7 | ilo_Latn, ceb_Latn, tgl_Latn, sun_Latn, jav_Latn, war_Latn, ind_Latn |
| Dravidian | 4 | mal_Mlym, kan_Knda, tel_Telu, tam_Taml |
| Turkic | 4 | kaz_Cyrl, azj_Latn, tur_Latn, uzn_Latn |
| Tai-Kadai | 2 | tha_Thai, lao_Laoo |
| Uralic | 3 | fin_Latn, hun_Latn, est_Latn |
| Austroasiatic | 2 | vie_Latn, khm_Khmr |
| Other | 7 | eus_Latn, kor_Hang, hat_Latn, swh_Latn, kea_Latn, jpn_Jpan, kat_Geor |

Table 37: Comparison of Belebele Benchmark performance between Qwen3 and other baseline models. Scores are highlighted with the highest in bold and the second-best underlined.

| Model | Indo-European | Sino-Tibetan | Afro-Asiatic | Austronesian | Dravidian | Turkic | Tai-Kadai | Uralic | Austroasiatic | Other |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gemma-3-27B-IT | 89.2 | 86.3 | 85.9 | 84.1 | 83.5 | 86.8 | 81.0 | 91.0 | 86.5 | 87.0 |
| Qwen2.5-32B-Instruct | 85.5 | 82.3 | 80.4 | 70.6 | 67.8 | 80.8 | 74.5 | 87.0 | 79.0 | 72.6 |
| QwQ-32B | 86.1 | 83.7 | 81.9 | 71.3 | 69.3 | 80.3 | 77.0 | 88.0 | 83.0 | 74.0 |
| Qwen3-32B (Thinking) | 90.7 | 89.7 | 84.8 | 86.7 | 84.5 | 89.3 | 83.5 | 91.3 | 88.0 | 83.1 |
| Qwen3-32B (Non-thinking) | 89.1 | 88.0 | 82.3 | 83.7 | 84.0 | 85.0 | 85.0 | 88.7 | 88.0 | 81.3 |
| Gemma-3-12B-IT | 85.8 | 83.3 | 83.4 | 79.3 | 79.0 | 82.8 | 77.5 | 89.0 | 83.0 | 81.6 |
| Qwen2.5-14B-Instruct | 82.7 | 78.9 | 80.4 | 69.1 | 66.2 | 74.2 | 72.2 | 83.9 | 77.9 | 70.4 |
| Qwen3-14B (Thinking) | 88.6 | 87.3 | 82.4 | 82.4 | 81.0 | 83.8 | 83.5 | 91.0 | 82.5 | 81.7 |
| Qwen3-14B (Non-thinking) | 87.4 | 82.7 | 80.1 | 80.7 | 78.0 | 81.8 | 80.5 | 87.7 | 81.5 | 77.0 |
| Gemma-3-4B-IT | 71.8 | 72.0 | 63.5 | 61.7 | 64.8 | 64.0 | 61.5 | 70.7 | 71.0 | 62.6 |
| Qwen2.5-3B-Instruct | 58.0 | 62.3 | 57.2 | 47.9 | 36.9 | 45.1 | 49.8 | 50.6 | 56.8 | 48.4 |
| Qwen3-4B (Thinking) | 82.2 | 77.7 | 74.1 | 73.0 | 74.3 | 76.3 | 68.5 | 83.0 | 74.5 | 67.9 |
| Qwen3-4B (Non-thinking) | 76.0 | 77.0 | 65.6 | 65.6 | 65.5 | 64.0 | 60.5 | 74.0 | 74.0 | 61.0 |
| Gemma-3-1B-IT | 36.5 | 36.0 | 30.0 | 29.1 | 28.8 | 27.3 | 28.0 | 32.7 | 33.0 | 30.9 |
| Qwen2.5-1.5B-Instruct | 41.5 | 43.0 | 39.6 | 34.8 | 28.6 | 29.7 | 39.4 | 33.8 | 42.0 | 36.0 |
| Qwen3-1.7B (Thinking) | 69.7 | 66.0 | 59.4 | 58.6 | 52.8 | 57.8 | 53.5 | 70.3 | 63.5 | 53.4 |
| Qwen3-1.7B (Non-thinking) | 58.8 | 62.7 | 50.8 | 53.0 | 43.3 | 48.0 | 46.0 | 54.3 | 54.0 | 43.9 |

<!-- page 31 of 35 -->

## References

Marah Abdin, Jyoti Aneja, Harkirat Behl, Sébastien Bubeck, Ronen Eldan, Suriya Gunasekar, Michael Harrison, Russell J Hewett, Mojan Javaheripi, Piero Kauffmann, et al. Phi-4 technical report. arXiv preprint arXiv:2412.08905, 2024.

AIME. AIME problems and solutions, 2025. URL https://artofproblemsolving.com/wiki/index.php/AIME\_Problems\_and\_Solutions.

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebrón, and Sumit Sanghai. GQA: Training generalized multi-query Transformer models from multi-head checkpoints. In EMNLP, pp. 4895–4901. Association for Computational Linguistics, 2023.

Chenxin An, Fei Huang, Jun Zhang, Shansan Gong, Xipeng Qiu, Chang Zhou, and Lingpeng Kong. Training-free long-context scaling of large language models. CoRR, abs/2402.17463, 2024.

Anthropic. Claude 3.7 Sonnet, 2025. URL https://www.anthropic.com/news/claude-3-7-sonnet.

Jacob Austin, Augustus Odena, Maxwell I. Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie J. Cai, Michael Terry, Quoc V. Le, and Charles Sutton. Program synthesis with large language models. CoRR, abs/2108.07732, 2021.

Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, Binyuan Hui, Luo Ji, Mei Li, Junyang Lin, Runji Lin, Dayiheng Liu, Gao Liu, Chengqiang Lu, Keming Lu, Jianxin Ma, Rui Men, Xingzhang Ren, Xuancheng Ren, Chuanqi Tan, Sinan Tan, Jianhong Tu, Peng Wang, Shijie Wang, Wei Wang, Shengguang Wu, Benfeng Xu, Jin Xu, An Yang, Hao Yang, Jian Yang, Shusheng Yang, Yang Yao, Bowen Yu, Hongyi Yuan, Zheng Yuan, Jianwei Zhang, Xingxuan Zhang, Yichang Zhang, Zhenru Zhang, Chang Zhou, Jingren Zhou, Xiaohuan Zhou, and Tianhang Zhu. Qwen technical report. CoRR, abs/2309.16609, 2023.

Shuai Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Sibo Song, Kai Dang, Peng Wang, Shijie Wang, Jun Tang, et al. Qwen2.5-VL technical report. arXiv preprint arXiv:2502.13923, 2025.

Lucas Bandarkar, Davis Liang, Benjamin Muller, Mikel Artetxe, Satya Narayan Shukla, Donald Husa, Naman Goyal, Abhinandan Krishnan, Luke Zettlemoyer, and Madian Khabsa. The Belebele benchmark: A parallel reading comprehension dataset in 122 language variants. CoRR, abs/2308.16884, 2023.

Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, and Dario Amodei. Language models are few-shot learners. In NeurIPS, 2020.

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q. Feldman, Arjun Guha, Michael Greenberg, and Abhinav Jangda. MultiPL-E: A scalable and polyglot approach to benchmarking neural code generation. IEEE Trans. Software Eng., 49(7):3675–3691, 2023.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Pondé de Oliveira Pinto, Jared Kaplan, Harrison Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Joshua Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021.

Damai Dai, Chengqi Deng, Chenggang Zhao, R. X. Xu, Huazuo Gao, Deli Chen, Jiashi Li, Wangding Zeng, Xingkai Yu, Y. Wu, Zhenda Xie, Y. K. Li, Panpan Huang, Fuli Luo, Chong Ruan, Zhifang Sui, and Wenfeng Liang. DeepSeekMoE: Towards ultimate expert specialization in mixture-of-experts language models. CoRR, abs/2401.06066, 2024.

<!-- page 32 of 35 -->

Yann N. Dauphin, Angela Fan, Michael Auli, and David Grangier. Language modeling with gated convolutional networks. In ICML, volume 70 of Proceedings of Machine Learning Research, pp. 933–941. PMLR, 2017.

Google DeepMind. Gemini 2.5, 2025. URL https://blog.google/technology/google-deepmind/gemi-n-model-thinking-updates-march-2025/.

Mostafa Dehghani, Josip Djolonga, Basil Mustafa, Piotr Padlewski, Jonathan Heek, Justin Gilmer, Andreas Peter Steiner, Mathilde Caron, Robert Geirhos, Ibrahim Alabdulmohsin, Rodolphe Jenatton, Lucas Beyer, Michael Tschannen, Anurag Arnab, Xiao Wang, Carlos Riquelme Ruiz, Matthias Minderer, Joan Puigcerver, Utku Evci, Manoj Kumar, Sjoerd van Steenkiste, Gamaleldin Fathy Elsayed, Aravindh Mahendran, Fisher Yu, Avital Oliver, Fantine Huot, Jasmijn Bastings, Mark Collier, Alexey A. Gritsenko, Vighnesh Birodkar, Cristina Nader Vasconcelos, Yi Tay, Thomas Mensink, Alexander Kolesnikov, Filip Pavetic, Dustin Tran, Thomas Kipf, Mario Lucic, Xiaohua Zhai, Daniel Keysers, Jeremiah J. Harmsen, and Neil Houlsby. Scaling vision transformers to 22 billion parameters. In ICML, volume 202 of Proceedings of Machine Learning Research, pp. 7480–7512. PMLR, 2023.

Xinrun Du, Yifan Yao, Kaijing Ma, Bingli Wang, Tianyu Zheng, King Zhu, Minghao Liu, Yiming Liang, Xiaolong Jin, Zhenlin Wei, et al. SuperGPQA: Scaling LLM evaluation across 285 graduate disciplines. arXiv preprint arXiv:2502.14739, 2025.

Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, Anirudh Goyal, Anthony Hartshorn, Aobo Yang, Archi Mitra, Archie Sravankumar, Artem Korenev, Arthur Hinsvark, Arun Rao, Aston Zhang, Aurélien Rodriguez, Austen Gregerson, Ava Spataru, Baptiste Rozière, Bethany Biron, Binh Tang, Bobbie Chern, Charlotte Caucheteux, Chaya Nayak, Chloe Bi, Chris Marra, Chris McConnell, Christian Keller, Christophe Touret, Chunyang Wu, Corinne Wong, Cristian Canton Ferrer, Cyrus Nikolaidis, Damien Allonsius, Daniel Song, Danielle Pintz, Danny Livshits, David Esiobu, Dhruv Choudhary, Dhruv Mahajan, Diego Garcia-Olano, Diego Perino, Dieuwke Hupkes, Egor Lakomkin, Ehab AlBadawy, Elina Lobanova, Emily Dinan, Eric Michael Smith, Filip Radenovic, Frank Zhang, Gabriel Synnaeve, Gabrielle Lee, Georgia Lewis Anderson, Graeme Nail, Grégoire Mialon, Guan Pang, Guillem Cucurell, Hailey Nguyen, Hannah Korevaar, Hu Xu, Hugo Touvron, Iliyan Zarov, Imanol Arrieta Ibarra, Isabel M. Kloumann, Ishan Misra, Ivan Evtimov, Jade Copet, Jaewon Lee, Jan Geffert, Jana Vranes, Jason Park, Jay Mahadeokar, Jeet Shah, Jelmer van der Linde, Jennifer Billock, Jenny Hong, Jenya Lee, Jeremy Fu, Jianfeng Chi, Jianyu Huang, Jiawen Liu, Jie Wang, Jiecao Yu, Joanna Bitton, Joe Spisak, Jongsoo Park, Joseph Rocca, Joshua Johnstun, Joshua Saxe, Junteng Jia, Kalyan Vasuden Alwala, Kartikeya Upasani, Kate Plawiak, Ke Li, Kenneth Heafield, Kevin Stone, and et al. The Llama 3 herd of models. CoRR, abs/2407.21783, 2024.

Simin Fan, Matteo Pagliardini, and Martin Jaggi. DoGE: Domain reweighting with generalization estimation. arXiv preprint arXiv:2310.15393, 2023.

Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, et al. Are we done with MMLU? CoRR, abs/2406.04127, 2024.

Alex Gu, Baptiste Rozière, Hugh Leather, Armando Solar-Lezama, Gabriel Synnaeve, and Sida I. Wang. CRUXEval: A benchmark for code reasoning, understanding and execution. arXiv preprint arXiv:2401.03065, 2024.

Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, Xiao Bi, et al. DeepSeek-R1: Incentivizing reasoning capability in LLMs via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025.

Yun He, Di Jin, Chaoqi Wang, Chloe Bi, Karishma Mandyam, Hejia Zhang, Chen Zhu, Ning Li, Tengyu Xu, Hongjiang Lv, et al. Multi-IF: Benchmarking LLMs on multi-turn and multilingual instructions following. arXiv preprint arXiv:2410.15553, 2024.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In ICLR. OpenReview.net, 2021a.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the MATH dataset. In NeurIPS Datasets and Benchmarks, 2021b.

Cheng-Ping Hsieh, Simeng Sun, Samuel Kriman, Shantanu Acharya, Dima Rekesh, Fei Jia, Yang Zhang, and Boris Ginsburg. RULER: What's the real context size of your long-context language models? CoRR, abs/2404.06654, 2024.

<!-- page 33 of 35 -->

Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Jiayi Lei, Yao Fu, Maosong Sun, and Junxian He. C-Eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In NeurIPS, 2023.

Binyuan Hui, Jian Yang, Zeyu Cui, Jiaxi Yang, Dayiheng Liu, Lei Zhang, Tianyu Liu, Jiajun Zhang, Bowen Yu, Keming Lu, et al. Qwen2.5-Coder technical report. CoRR, abs/2409.12186, 2024.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. LiveCodeBench: Holistic and contamination free evaluation of large language models for code. CoRR, abs/2403.07974, 2024.

Zixuan Jiang, Jiaqi Gu, Hanqing Zhu, and David Z. Pan. Pre-RMSNorm and Pre-CRMSNorm Transformers: Equivalent and efficient pre-LN Transformers. CoRR, abs/2305.14858, 2023.

Nathan Lambert, Jacob Morrison, Valentina Pyatkin, Shengyi Huang, Hamish Ivison, Faeze Brahman, Lester James V. Miranda, Alisa Liu, Nouha Dziri, Shane Lyu, Yuling Gu, Saumya Malik, Victoria Graf, Jena D. Hwang, Jiangjiang Yang, Ronan Le Bras, Oyvind Tafjord, Chris Wilhelm, Luca Soldaini, Noah A. Smith, Yizhong Wang, Pradeep Dasigi, and Hannaneh Hajishirzi. Tülu 3: Pushing frontiers in open language model post-training. CoRR, abs/2411.15124, 2024.

Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Tianhao Wu, Banghua Zhu, Joseph E. Gonzalez, and Ion Stoica. From crowdsourced data to high-quality benchmarks: Arena-Hard and BenchBuilder pipeline. CoRR, abs/2406.11939, 2024.

Hunter Lightman, Vineet Kosaraju, Yura Burda, Harri Edwards, Bowen Baker, Teddy Lee, Jan Leike, John Schulman, Ilya Sutskever, and Karl Cobbe. Let's verify step by step. CoRR, abs/2305.20050, 2023.

Bill Yuchen Lin, Ronan Le Bras, Kyle Richardson, Ashish Sabharwal, Radha Poovendran, Peter Clark, and Yejin Choi. ZebraLogic: On the scaling limits of LLMs for logical reasoning. CoRR, abs/2502.01100, 2025.

Aixin Liu, Bei Feng, Bing Xue, Bingxuan Wang, Bochao Wu, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chenyu Zhang, Chong Ruan, et al. DeepSeek-V3 technical report. arXiv preprint arXiv:2412.19437, 2024a.

Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by ChatGPT really correct? Rigorous evaluation of large language models for code generation. In NeurIPS, 2023a.

Qian Liu, Xiaosen Zheng, Niklas Muennighoff, Guangtao Zeng, Longxu Dou, Tianyu Pang, Jing Jiang, and Min Lin. RegMix: Data mixture as regression for language model pre-training. arXiv preprint arXiv:2407.01492, 2024b.

Xiao Liu, Xuanyu Lei, Shengyuan Wang, Yue Huang, Zhuoer Feng, Bosi Wen, Jiale Cheng, Pei Ke, Yifan Xu, Weng Lam Tam, Xiaohan Zhang, Lichao Sun, Hongning Wang, Jing Zhang, Minlie Huang, Yuxiao Dong, and Jie Tang. AlignBench: Benchmarking Chinese alignment of large language models. CoRR, abs/2311.18743, 2023b.

Meta-AI. The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation, 2025. URL https://ai.meta.com/blog/llama-4-multimodal-intelligence/.

OpenAI. Hello GPT-4o, 2024. URL https://openai.com/index/hello-gpt-4o/.

OpenAI. Multilingual massive multitask language understanding, 2024. URL https://huggingface.co/datasets/openai/MMMLU.

OpenAI. Learning to reason with LLMs, 2024. URL https://openai.com/index/learning-to-reason-with-llms/.

OpenAI. Introducing openai o3 and o4-mini, 2025. URL https://openai.com/index/introducing-o3-and-o4-mini/.

Samuel J. Paech. Creative writing v3, 2024. URL https://eqbench.com/creative\_writing.html.

Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. YaRN: Efficient context window extension of large language models. CoRR, abs/2309.00071, 2023.

Zihan Qiu, Zeyu Huang, Bo Zheng, Kaiyue Wen, Zekun Wang, Rui Men, Ivan Titov, Dayiheng Liu, Jingren Zhou, and Junyang Lin. Demons in the detail: On implementing load balancing loss for training specialized mixture-of-expert models. CoRR, abs/2501.11873, 2025.

<!-- page 34 of 35 -->

Shanghaoran Quan, Jiaxi Yang, Bowen Yu, Bo Zheng, Dayiheng Liu, An Yang, Xuancheng Ren, Bofei Gao, Yibo Miao, Yunlong Feng, Zekun Wang, Jian Yang, Zeyu Cui, Yang Fan, Yichang Zhang, Binyuan Hui, and Junyang Lin. CodeElo: Benchmarking competition-level code generation of LLMs with human-comparable Elo ratings. CoRR, abs/2501.01257, 2025.

Qwen Team. QwQ: Reflect deeply on the boundaries of the unknown, November 2024. URL https://qwenlm.github.io/blog/qwq-32b-preview/.

Qwen Team. QwQ-32B: Embracing the power of reinforcement learning, March 2025. URL https://qwenlm.github.io/blog/qwq-32b/.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. GPQA: A graduate-level Google-proof Q&A benchmark. CoRR, abs/2311.12022, 2023.

Angelika Romanou, Negar Foroutan, Anna Sotnikova, Zeming Chen, Sree Harsha Nelaturu, Shivalika Singh, Rishabh Maheshwary, Micol Altomare, Mohamed A. Haggag, Snegha A, Alfonso Amayuelas, Azril Hafizi Amirudin, Viraat Aryabumi, Danylo Boiko, Michael Chang, Jenny Chim, Gal Cohen, Aditya Kumar Dalmia, Abraham Diress, Sharad Duwal, Daniil Dzenhaliou, Daniel Fernando Erazo Florez, Fabian Farestam, Joseph Marvin Imperial, Shayekh Bin Islam, Perttu Isotalo, Maral Jabbarishiviari, Börje F. Karlsson, Eldar Khalilov, Christopher Klamm, Fajri Koto, Dominik Krzeminski, Gabriel Adriano de Melo, Syrielle Montariol, Yiyang Nan, Joel Niklaus, Jekaterina Novikova, Johan Samir Obando Ceron, Debjit Paul, Esther Ploeger, Jebish Purbey, Swati Rajwal, Selvan Sunitha Ravi, Sara Rydell, Roshan Santhosh, Drishti Sharma, Marjana Prifti Skenduli, Arshia Soltani Moakhar, Bardia Soltani Moakhar, Ran Tamir, Ayush Kumar Tarun, Azmine Toushik Wasi, Thenuka Ovin Weerasinghe, Serhan Yilmaz, Mike Zhang, Imanol Schlag, Marzieh Fadaee, Sara Hooker, and Antoine Bosselut. INCLUDE: evaluating multilingual language understanding with regional knowledge. CoRR, abs/2411.19799, 2024.

Rico Sennrich, Barry Haddow, and Alexandra Birch. Neural machine translation of rare words with subword units. In ACL (1). The Association for Computer Linguistics, 2016.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. DeepSeekMath: Pushing the limits of mathematical reasoning in open language models. CoRR, abs/2402.03300, 2024.

Freda Shi, Mirac Suzgun, Markus Freitag, Xuezhi Wang, Suraj Srivats, Soroush Vosoughi, Hyung Won Chung, Yi Tay, Sebastian Ruder, Denny Zhou, Dipanjan Das, and Jason Wei. Language models are multilingual chain-of-thought reasoners. In ICLR. OpenReview.net, 2023.

Guijin Son, Jiwoo Hong, Hyunwoo Ko, and James Thorne. Linguistic generalizability of test-time scaling in mathematical reasoning. CoRR, abs/2502.17407, 2025.

Jianlin Su, Murtadha H. M. Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced Transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V. Le, Ed H. Chi, Denny Zhou, and Jason Wei. Challenging BIG-Bench tasks and whether chain-of-thought can solve them. In ACL (Findings), pp. 13003–13051. Association for Computational Linguistics, 2023.

Gemma Team, Aishwarya Kamath, Johan Ferret, Shreya Pathak, Nino Vieillard, Ramona Merhej, Sarah Perrin, Tatiana Matejovicova, Alexandre Ramé, Morgane Rivière, et al. Gemma 3 technical report. arXiv preprint arXiv:2503.19786, 2025.

Changhan Wang, Kyunghyun Cho, and Jiatao Gu. Neural machine translation with byte-level subwords. In AAAI, pp. 9154–9160. AAAI Press, 2020.

Yiming Wang, Pei Zhang, Jialong Tang, Haoran Wei, Baosong Yang, Rui Wang, Chenshu Sun, Feitong Sun, Jiran Zhang, Junxuan Wu, Qiqian Cang, Yichang Zhang, Fei Huang, Junyang Lin, Fei Huang, and Jingren Zhou. PolyMath: Evaluating mathematical reasoning in multilingual contexts, 2025.

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark. CoRR, abs/2406.01574, 2024.

<!-- page 35 of 35 -->

Colin White, Samuel Dooley, Manley Roberts, Arka Pal, Benjamin Feuer, Siddhartha Jain, Ravid Shwartz-Ziv, Neel Jain, Khalid Saifullah, Siddartha Naidu, Chinmay Hegde, Yann LeCun, Tom Goldstein, Willie Neiswanger, and Micah Goldblum. LiveBench: A challenging, contamination-free LLM benchmark. CoRR, abs/2406.19314, 2024.

Yuning Wu, Jiahao Mei, Ming Yan, Chenliang Li, Shaopeng Lai, Yuran Ren, Zijia Wang, Ji Zhang, Mengyue Wu, Qin Jin, and Fei Huang. WritingBench: A comprehensive benchmark for generative writing. CoRR, abs/2503.05244, 2025.

xAI. Grok 3 beta — the age of reasoning agents, 2025. URL https://x.ai/news/grok-3.

Sang Michael Xie, Hieu Pham, Xuanyi Dong, Nan Du, Hanxiao Liu, Yifeng Lu, Percy S Liang, Quoc V Le, Tengyu Ma, and Adams Wei Yu. Doremi: Optimizing data mixtures speeds up language model pretraining. Advances in Neural Information Processing Systems, 36:69798–69818, 2023.

Wenhan Xiong, Jingyu Liu, Igor Molybog, Hejia Zhang, Prajjwal Bhargava, Rui Hou, Louis Martin, Rashi Rungta, Karthik Abinav Sankararaman, Barlas Oguz, Madian Khabsa, Han Fang, Yashar Mehdad, Sharan Narang, Kshitiz Malik, Angela Fan, Shruti Bhosale, Sergey Edunov, Mike Lewis, Sinong Wang, and Hao Ma. Effective long-context scaling of foundation models. CoRR, abs/2309.16039, 2023.

Fanjia Yan, Huanzhi Mao, Charlie Cheng-Jie Ji, Tianjun Zhang, Shishir G. Patil, Ion Stoica, and Joseph E. Gonzalez. Berkeley function calling leaderboard. https://gorilla.cs.berkeley.edu/blogs/8\_berkeley\_function\_calling\_leaderboard.html, 2024.

An Yang, Baosong Yang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Zhou, Chengpeng Li, Chengyuan Li, Dayiheng Liu, Fei Huang, Guanting Dong, Haoran Wei, Huan Lin, Jialong Tang, Jialin Wang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Ma, Jianxin Yang, Jin Xu, Jingren Zhou, Jinze Bai, Jinzheng He, Junyang Lin, Kai Dang, Keming Lu, Keqin Chen, Kexin Yang, Mei Li, Mingfeng Xue, Na Ni, Pei Zhang, Peng Wang, Ru Peng, Rui Men, Ruize Gao, Runji Lin, Shijie Wang, Shuai Bai, Sinan Tan, Tianhang Zhu, Tianhao Li, Tianyu Liu, Wenbin Ge, Xiaodong Deng, Xiaohuan Zhou, Xingzhang Ren, Xinyu Zhang, Xipin Wei, Xuancheng Ren, Xuejing Liu, Yang Fan, Yang Yao, Yichang Zhang, Yu Wan, Yunfei Chu, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, Zhifang Guo, and Zhihao Fan. Qwen2 technical report. CoRR, abs/2407.10671, 2024a.

An Yang, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chengyuan Li, Dayiheng Liu, Fei Huang, Haoran Wei, et al. Qwen2.5 technical report. arXiv preprint arXiv:2412.15115, 2024b.

An Yang, Beichen Zhang, Binyuan Hui, Bofei Gao, Bowen Yu, Chengpeng Li, Dayiheng Liu, Jianhong Tu, Jingren Zhou, Junyang Lin, et al. Qwen2.5-Math technical report: Toward mathematical expert model via self-improvement. CoRR, abs/2409.12122, 2024c.

Yidan Zhang, Boyi Deng, Yu Wan, Baosong Yang, Haoran Wei, Fei Huang, Bowen Yu, Junyang Lin, and Jingren Zhou. P-MMEval: A parallel multilingual multitask benchmark for consistent evaluation of LLMs. CoRR, abs/2411.09116, 2024.

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. CoRR, abs/2311.07911, 2023.

Qin Zhu, Fei Huang, Runyu Peng, Keming Lu, Bowen Yu, Qinyuan Cheng, Xipeng Qiu, Xuanjing Huang, and Junyang Lin. AutoLogi: Automated generation of logic puzzles for evaluating reasoning abilities of large language models. CoRR, abs/2502.16906, 2025.

35
