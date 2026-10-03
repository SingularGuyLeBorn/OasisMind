---
title: "Qwen2.5 · 对照译稿"
category: "模型库"
tags: ["Qwen", "对照译稿"]
published: true
excerpt: "Qwen2.5 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 26 -->

To handle diverse and varied use cases effectively, we present Qwen2.5 LLM series in rich configurations. The open-weight offerings include base models and instruction-tuned models in sizes of 0.5B, 1.5B, 3B, 7B, 14B, 32B, and 72B parameters. Quantized versions of the instruction-tuned models are also provided. Over 100 models can be accessed from Hugging Face Hub, ModelScope, and Kaggle. In addition, for hosted solutions, the proprietary models currently include two mixture-of-experts (MoE) variants: Qwen2.5- Turbo and Qwen2.5-Plus, both available from [Alibaba Cloud Model Studio](https://www.alibabacloud.com/en/product/modelstudio).

为覆盖多样用法, Qwen2.5 以多档配置推出. 开源权重侧提供 Base 与指令微调型号, 规模为 0.5B, 1.5B, 3B, 7B, 14B, 32B, 72B; 指令型号另有量化版. Hugging Face Hub, ModelScope, Kaggle 上可取到超过 100 个模型. 托管侧目前有两款 MoE 专有型号: Qwen2.5-Turbo 与 Qwen2.5-Plus, 入口在 Alibaba Cloud Model Studio.

> **想:** 开源侧写了七档 Dense, 托管侧又写 MoE, 是不是同一套权重换皮?
> 不是. 报告把 Dense 开源与 Turbo/Plus 的 MoE API 分开写. Dense 给本地与社区, MoE 走云端计费.

arXiv:2412.15115v2 [cs.CL] 3 Jan 2025

Qwen

2025-01-06

# Qwen2.5 Technical Report # Qwen2.5 技术报告

**Qwen Team**

[https://huggingface.co/Qwen](https://huggingface.co/Qwen)

[https://modelscope.cn/organization/qwen](https://modelscope.cn/organization/qwen)

[https://github.com/QwenLM/Qwen2.5](https://github.com/QwenLM/Qwen2.5)

## Abstract

In this report, we introduce Qwen2.5, a comprehensive series of large language models (LLMs) designed to meet diverse needs. Compared to previous iterations, Qwen 2.5 has been significantly improved during both the pre-training and post-training stages. In terms of pre-training, we have scaled the high-quality pre-training datasets from the previous 7 trillion tokens to 18 trillion tokens. This provides a strong foundation for common sense, expert knowledge, and reasoning capabilities. In terms of post-training, we implement intricate supervised finetuning with over 1 million samples, as well as multistage reinforcement learning, including offline learning DPO and online learning GRPO. Post-training techniques significantly enhance human preference, and notably improve long text generation, structural data analysis, and instruction following.

本报告介绍面向多样需求的 Qwen2.5 大语言模型系列. 相对前代, 预训练与后训练都明显加强. 预训练高质量数据从先前的 7 万亿 token 扩到 18 万亿 token, 为常识, 专家知识与推理打底. 后训练做超过 100 万样本的细致 SFT, 以及多阶段强化学习: 离线 DPO 与在线 GRPO. 后训练显著抬升人类偏好对齐, 并改善长文本生成, 结构化数据分析与指令遵循.

Qwen2.5 has demonstrated top-tier performance on a wide range of benchmarks evaluating language understanding, reasoning, mathematics, coding, human preference alignment, etc. Specifically, the open-weight flagship Qwen2.5-72B-Instruct outperforms a number of open and proprietary models and demonstrates competitive performance to the state-of-the-art open-weight model, Llama-3-405B-Instruct, which is around 5 times larger. Qwen2.5-Turbo and Qwen2.5-Plus offer superior cost-effectiveness while performing competitively against GPT-4o-mini and GPT-4o respectively. Additionally, as the foundation, Qwen2.5 models have been instrumental in training specialized models such as Qwen2.5-Math (Yang et al., 2024b), Qwen2.5-Coder (Hui et al., 2024), QwQ (Qwen Team, 2024d), and multimodal models.

Qwen2.5 在语言理解, 推理, 数学, 代码, 人类偏好对齐等广泛基准上表现居前. 开源旗舰 Qwen2.5-72B-Instruct 超过多名开源与专有型号, 并与约大 5 倍的开源最强档 Llama-3-405B-Instruct 可比. Qwen2.5-Turbo 与 Qwen2.5-Plus 性价比更高, 分别与 GPT-4o-mini, GPT-4o 竞争. 此外, Qwen2.5 还作为底座, 支撑 Qwen2.5-Math, Qwen2.5-Coder, QwQ 与多模态等专项型号的训练.

![Image block](images/p01-figure-1-in-the-iterative-development-of-the-qwen.png)

Figure 1: In the iterative development of the Qwen series, data scaling has played a crucial role. Qwen 2.5, which leverages 18 trillion tokens for pre-training, has demonstrated the most advanced capabilities within the Qwen series, especially in terms of domain expertise, underscoring the importance of scale together with mixture in enhancing the model’s capabilities.

图 1: Qwen 系列迭代里, 数据放大一直是主轴. Qwen2.5 预训练吃到 18 万亿 token, 在系列内能力最强, 尤其领域专长; 强调的是规模与配比一起抬能力.

<!-- page 2 of 26 -->

## 1 Introduction

The sparks of artificial general intelligence (AGI) are increasingly visible through the fast development of large foundation models, notably large language models (LLMs) (Brown et al., 2020; OpenAI, 2023; 2024a; Gemini Team, 2024; Anthropic, 2023a;b; 2024; Bai et al., 2023; Yang et al., 2024a; Touvron et al., 2023a;b; Dubey et al., 2024). The continuous advancement in model and data scaling, combined with the paradigm of large-scale pre-training followed by high-quality supervised fine-tuning (SFT) and reinforcement learning from human feedback (RLHF) (Ouyang et al., 2022), has enabled large language models (LLMs) to develop emergent capabilities in language understanding, generation, and reasoning. Building on this foundation, recent breakthroughs in inference time scaling, particularly demonstrated by o1 (OpenAI, 2024b), have enhanced LLMs’ capacity for deep thinking through step-by-step reasoning and reflection. These developments have elevated the potential of language models, suggesting they may achieve significant breakthroughs in scientific exploration as they continue to demonstrate emergent capabilities indicative of more general artificial intelligence.

大基础模型, 尤其是大语言模型的快速发展, 让 AGI 的迹象更可见. 模型与数据持续放大, 叠加大规模预训练再接高质量 SFT 与 RLHF 的范式, 使 LLM 在理解, 生成与推理上出现涌现能力. 在此之上, 以 o1 为代表的推理期 test-time scaling 又抬了逐步推理与反思的深度. 这些进展抬高了语言模型的潜力, 暗示它们在继续展现更一般智能迹象时, 也可能推动科学探索上的突破.

Besides the fast development of model capabilities, the recent two years have witnessed a burst of open (open-weight) large language models in the LLM community, for example, the Llama series (Touvron et al., 2023a;b; Dubey et al., 2024), Mistral series (Jiang et al., 2023a; 2024a), and our Qwen series (Bai et al., 2023; Yang et al., 2024a; Qwen Team, 2024a; Hui et al., 2024; Qwen Team, 2024c; Yang et al., 2024b). The open-weight models have democratized the access of large language models to common users and developers, enabling broader research participation, fostering innovation through community collaboration, and accelerating the development of AI applications across diverse domains.

能力变强之外, 近两年开源 (open-weight) 大模型也在社区爆发, 例如 Llama 系列, Mistral 系列, 以及我们的 Qwen 系列. 开源权重降低了普通用户与开发者获取 LLM 的门槛, 扩大研究参与, 借助社区协作推动创新, 并加速各领域 AI 应用落地.

Recently, we release the details of our latest version of the Qwen series, Qwen2.5. In terms of the open-weight part, we release pre-trained and instruction-tuned models of 7 sizes, including 0.5B, 1.5B, 3B, 7B, 14B, 32B, and 72B, and we provide not only the original models in bfloat16 precision but also the quantized models in different precisions. Specifically, the flagship model Qwen2.5-72B-Instruct demonstrates competitive performance against the state-of-the-art open-weight model, Llama-3-405B-Instruct, which is around 5 times larger. Additionally, we also release the proprietary models of Mixture-of-Experts (MoE, Lepikhin et al., 2020; Fedus et al., 2022; Zoph et al., 2022), namely Qwen2.5-Turbo and Qwen2.5-Plus<sup>1</sup>, which performs competitively against GPT-4o-mini and GPT-4o respectively.

我们近日公开 Qwen 系列最新版 Qwen2.5 的细节. 开源侧发布 7 档预训练与指令微调型号: 0.5B, 1.5B, 3B, 7B, 14B, 32B, 72B; 既有 bfloat16 原精度, 也有不同精度的量化版. 旗舰 Qwen2.5-72B-Instruct 与约大 5 倍的开源最强档 Llama-3-405B-Instruct 可比. 另发布专有 MoE 型号 Qwen2.5-Turbo 与 Qwen2.5-Plus, 分别与 GPT-4o-mini, GPT-4o 竞争.

In this technical report, we introduce Qwen2.5, the result of our continuous endeavor to create better LLMs. Below, we show the key features of the latest version of Qwen:

本技术报告介绍持续打磨更好 LLM 的产物 Qwen2.5. 以下概括最新版的关键特征:

**Better in Size**: Compared with Qwen2, in addition to 0.5B, 1.5B, 7B, and 72B models, Qwen2.5 brings back the 3B, 14B, and 32B models, which are more cost-effective for resource-limited scenarios and are under-represented in the current field of open foundation models. Qwen2.5- Turbo and Qwen2.5-Plus offer a great balance among accuracy, latency, and cost.

**Better in Size**: 相对 Qwen2, 在保留 0.5B, 1.5B, 7B, 72B 之外, Qwen2.5 补回 3B, 14B, 32B, 更贴合资源受限场景, 也填补开源基础模型中间档的空白. Qwen2.5-Turbo 与 Qwen2.5-Plus 在精度, 延迟与成本之间取得更好平衡.

• **Better in Data**: The pre-training and post-training data have been improved significantly. The pre-training data increased from 7 trillion tokens to 18 trillion tokens, with focus on knowledge, coding, and mathematics. The pre-training is staged to allow transitions among different mixtures. The post-training data amounts to 1 million examples, across the stage of supervised finetuning (SFT, Ouyang et al., 2022), direct preference optimization (DPO, Rafailov et al., 2023), and group relative policy optimization (GRPO, Shao et al., 2024).

• **Better in Data**: 预训练与后训练数据都明显改进. 预训练从 7 万亿 token 扩到 18 万亿 token, 侧重知识, 代码与数学; 预训练分阶段以便切换不同配比. 后训练约 100 万条样本, 覆盖 SFT, DPO 与 GRPO 各阶段.

**Better in Use**: Several key limitations of Qwen2 in use have been eliminated, including larger generation length (from 2K tokens to 8K tokens), better support for structured input and output, (e.g., tables and JSON), and easier tool use. In addition, Qwen2.5-Turbo supports a context length of up to 1 million tokens.

**Better in Use**: Qwen2 若干使用侧短板被去掉: 生成长度从 2K token 提到 8K token, 结构化输入输出 (如表格与 JSON) 更好, 工具调用更易用. 另外, Qwen2.5-Turbo 支持长达 100 万 token 的上下文.

## 2 Architecture & Tokenizer 架构与分词器

Basically, the Qwen2.5 series include dense models for opensource, namely Qwen2.5-0.5B / 1.5B / 3B / 7B / 14B / 32B / 72B, and MoE models for API service, namely Qwen2.5-Turbo and Qwen2.5-Plus. Below, we provide details about the architecture of models.

Qwen2.5 开源侧是 Dense: 0.5B / 1.5B / 3B / 7B / 14B / 32B / 72B; API 侧是 MoE: Turbo 与 Plus. 下面写架构细节.

For dense models, we maintain the Transformer-based decoder architecture (Vaswani et al., 2017; Radford et al., 2018) as Qwen2 (Yang et al., 2024a). The architecture incorporates several key components: Grouped Query Attention (GQA, Ainslie et al., 2023) for efficient KV cache utilization, SwiGLU activation function (Dauphin et al., 2017) for non-linear activation, Rotary Positional Embeddings (RoPE, Su

Dense 沿用与 Qwen2 相同的 Transformer decoder-only 底盘. 关键积木包括: GQA 省 KV cache, SwiGLU 做非线性, RoPE 编位置.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">1<sub>Qwen2</sub>.5-Turbo is identified as qwen-turbo-2024-11-01 and Qwen2.5-Plus is identified as qwen-plus-2024-xx-xx (to be released) in the API.</span></small>

<!-- page 3 of 26 -->

Table 1: Model architecture and license of Qwen2.5 open-weight models.

表 1: Qwen2.5 开源权重型号的架构与许可证.

> **看表:** 0.5B/1.5B/3B 的 Tie Embedding 是 Yes, 7B 起是 No, 是不是小模型才绑嵌入?
> 是. 表 1 写明小三档 Yes, 7B 及以上 No. Context 也分两档: 小三档 32K/8K, 7B 起 128K/8K.

| Models | Layers | Heads (Q / KV) | Tie Embedding | Context / Generation Length | License |
| --- | --- | --- | --- | --- | --- |
| 0.5B | 24 | 14 / 2 | Yes | 32K / 8K | Apache 2.0 |
| 1.5B | 28 | 12 / 2 | Yes | 32K / 8K | Apache 2.0 |
| 3B | 36 | 16 / 2 | Yes | 32K / 8K | Qwen Research |
| 7B | 28 | 28 / 4 | No | 128K / 8K | Apache 2.0 |
| 14B | 48 | 40 / 8 | No | 128K / 8K | Apache 2.0 |
| 32B | 64 | 40 / 8 | No | 128K / 8K | Apache 2.0 |
| 72B | 80 | 64 / 8 | No | 128K / 8K | Qwen |

et al., 2024) for encoding position information, QKV bias (Su, 2023) in the attention mechanism and RMSNorm (Jiang et al., 2023b) with pre-normalization to ensure stable training.

位置用 RoPE; 注意力带 QKV bias; 归一化是 pre-norm 的 RMSNorm, 稳住训练.

Building upon the dense model architectures, we extend it to MoE model architectures. This is achieved by replacing standard feed-forward network (FFN) layers with specialized MoE layers, where each layer comprises multiple FFN experts and a routing mechanism that dispatches tokens to the top-K experts. Following the approaches demonstrated in Qwen1.5-MoE (Yang et al., 2024a), we implement fine-grained expert segmentation (Dai et al., 2024) and shared experts routing (Rajbhandari et al., 2022; Dai et al., 2024). These architectural innovations have yielded substantial improvements in model performance across downstream tasks.

MoE 在 Dense 上改 FFN: 每层多个 FFN 专家, 路由把 token 派给 top-K. 沿用 Qwen1.5-MoE 的细粒度专家切分与共享专家路由. 下游任务上有实质抬升.

For tokenization, we utilize Qwen’s tokenizer (Bai et al., 2023), which implements byte-level byte-pair encoding (BBPE, Brown et al., 2020; Wang et al., 2020; Sennrich et al., 2016) with a vocabulary of 151,643 regular tokens. We have expanded the set of control tokens from 3 to 22 compared to previous Qwen versions, adding two new tokens for tool functionality and allocating the remainder for other model capabilities. This expansion establishes a unified vocabulary across all Qwen2.5 models, enhancing consistency and reducing potential compatibility issues.

分词沿用 Qwen 的 BBPE, 常规词表 151,643. 控制 token 从 3 扩到 22: 其中两个给工具调用, 其余留给别的能力. 全系列统一词表.

## 3 Pre-training 预训练

Our language model pre-training process consists of several key components. First, we carefully curate high-quality training data through sophisticated filtering and scoring mechanisms, combined with strategic data mixture. Second, we conduct extensive research on hyperparameter optimization to effectively train models at various scales. Finally, we incorporate specialized long-context pre-training to enhance the model’s ability to process and understand extended sequences. Below, we detail our approaches to data preparation, hyperparameter selection, and long-context training.

预训练三块: 高质量数据的过滤与配比, 各规模超参研究, 以及专门的长上下文阶段.

### 3.1 Pre-training Data 预训练数据

Qwen2.5 demonstrates significant enhancements in pre-training data quality compared to its predecessor Qwen2. These improvements stem from several key aspects:

(1) **Better data filtering**. High-quality pre-training data is crucial for model performance, making data quality assessment and filtering a critical component of our pipeline. We leverage Qwen2-Instruct models as data quality filters that perform comprehensive, multi-dimensional analysis to evaluate and score training samples. The filtering method represents a significant advancement over our previous approach used for Qwen2, as it benefits from Qwen2’s expanded pre-training on a larger multilingual corpus. The enhanced capabilities enable more nuanced quality assessment, resulting in both improved retention of high-quality training data and more effective filtering of low-quality samples across multiple languages.

(1) 更好的过滤. 用 Qwen2-Instruct 当质量打分器, 多维评样本. 相对 Qwen2 时期, 过滤吃了更大多语语料的红利.

(2) **Better math and code data**. During the pre-training phase of Qwen2.5, we incorporate training data from Qwen2.5-Math (Yang et al., 2024b) and Qwen2.5-Coder (Hui et al., 2024). This data integration strategy proves highly effective, as these specialized datasets are instrumental in achieving state-of-the-art performance on mathematical and coding tasks. By leveraging these high-quality domain-specific datasets during pre-training, Qwen2.5 inherits strong capabilities in both mathematical reasoning and code generation.

(2) 更好的数学与代码数据. 预训练并入 Qwen2.5-Math 与 Qwen2.5-Coder 的训练数据.

> **核对:** 通模预训练就吃了 Math/Coder 数据, 那专项模型还剩什么差异?
> 这里只写预训练并入专项数据. Math/Coder 专报还有各自后训练, 不能读成通模等于专项.

(3) **Better synthetic data**. To generate high-quality synthetic data, particularly in mathematics, code, and knowledge domains, we leverage both Qwen2-72B-Instruct (Yang et al., 2024a) and Qwen2- Math-72B-Instruct (Qwen Team, 2024c). The quality of this synthesized data is further enhanced through rigorous filtering using our proprietary general reward model and the specialized Qwen2-Math-RM-72B (Qwen Team, 2024c) model.

(3) 更好的合成数据. 用 Qwen2-72B-Instruct 与 Qwen2-Math-72B-Instruct 生成, 再用通用奖励模型与 Qwen2-Math-RM-72B 过滤.

<!-- page 4 of 26 -->

(4) **Better data mixture**. To optimize the pre-training data distribution, we employ Qwen2-Instruct models to classify and balance content across different domains. Our analysis revealed that domains like e-commerce, social media, and entertainment are significantly overrepresented in web-scale data, often containing repetitive, template-based, or machine-generated content. Conversely, domains such as technology, science, and academic research, while containing higherquality information, are traditionally underrepresented. Through strategic down-sampling of overrepresented domains and up-sampling of high-value domains, we ensure a more balanced and information-rich training dataset that better serves our model’s learning objectives.

(4) 更好的配比. 电商/社交/娱乐压采样, 科技/科学/学术上采样.

Building on these techniques, we have developed a larger and higher-quality pre-training dataset, expanding from the 7 trillion tokens used in Qwen2 (Yang et al., 2024a) to **18 trillion** tokens.

综合以上, 预训练从 Qwen2 的 7 万亿 token 扩到 18 万亿.

### 3.2 Scaling Law for Hyper-parameters 超参的 Scaling Laws

We develop scaling laws for hyper-parameter based on the pre-training data of Qwen2.5 (Hoffmann et al., 2022; Kaplan et al., 2020). While previous studies (Dubey et al., 2024; Almazrouei et al., 2023; Hoffmann et al., 2022) primarily used scaling laws to determine optimal model sizes given compute budgets, we leverage them to identify optimal hyperparameters across model architectures. Specifically, our scaling laws help determine key training parameters like batch size B and learning rate µ for both dense models and MoE models of varying sizes.

基于 Qwen2.5 数据做超参的 Scaling Laws. 主用途是跨架构找最优 batch size B 与学习率 µ, Dense 与 MoE 都覆盖.

> **回看:** Scaling Laws 在这里主要决定模型总参, 还是训练超参?
> 报告写明主用途是找 B 与 µ. 也用来对照 MoE 与 Dense, 但不是只算最优 N.

Through extensive experimentation, we systematically study the relationship between model architecture and optimal training hyper-parameters. Specifically, we analyze how the optimal learning rate µ<sub>opt</sub> and batch size $B _ { \mathrm { o p t } }$ vary with model size N and pre-training data size D. Our experiments cover a comprehensive range of architectures, including dense models with 44M to 14B parameters and MoE models with 44M to 1B activated parameters, trained on datasets ranging from 0.8B to 600B tokens. Using these optimal hyper-parameter predictions, we then model the final loss as a function of model architecture and training data scale.

实验覆盖 Dense 44M–14B, MoE 激活参 44M–1B, 数据 0.8B–600B token, 建模最终 loss.

Additionally, we leverage scaling laws to predict and compare the performance of MoE models with varying parameter counts against their dense counterparts. This analysis guides our hyper-parameter configuration for MoE models, enabling us to achieve performance parity with specific dense model variants (such as Qwen2.5-72B and Qwen2.5-14B) through careful tuning of both activated and total parameters.

并用 Scaling Laws 指导 MoE 的激活参与总参, 使 Turbo/Plus 能与 72B, 14B 等 Dense 对标.

### 3.3 Long-context Pre-training 长上下文预训练

For optimal training efficiency, Qwen2.5 employs a two-phase pre-training approach: an initial phase with a 4,096-token context length, followed by an extension phase for longer sequences. Following the strategy used in Qwen2, we extend the context length from 4,096 to 32,768 tokens during the final pre-training stage for all model variants except Qwen2.5-Turbo. Concurrently, we increase the base frequency of RoPEfrom 10,000 to 1,000,000 using the ABF technique (Xiong et al., 2023).

先 4,096 上下文预训练再延长. 除 Turbo 外末段扩到 32,768, ABF 把 RoPE base 从 10,000 提到 1,000,000.

For Qwen2.5-Turbo, we implement a progressive context length expansion strategy during training, advancing through four stages: 32,768 tokens, 65,536 tokens, 131,072 tokens, and ultimately 262,144 tokens, with a RoPE base frequency of 10,000,000. At each stage, we carefully curate the training data to include 40% sequences at the current maximum length and 60% shorter sequences. This progressive training methodology enables smooth adaptation to increasing context lengths while maintaining the model’s ability to effectively process and generalize across sequences of varying lengths.

Turbo 四阶段: 32,768 → 65,536 → 131,072 → 262,144, RoPE base 10,000,000; 每阶段 40% 顶长 + 60% 更短.

> **停一下:** Turbo 训练顶长是 262K, 为什么评测又说 1M?
> 训练渐进到 262,144. 推理再叠 YaRN 与 DCA, 报告写可到 1 百万 token.

To enhance our models’ ability to process longer sequences during inference, we implement two key strategies: YARN (Peng et al., 2023) and Dual Chunk Attention (DCA, An et al., 2024). Through these innovations, we achieve a four-fold increase in sequence length capacity, enabling Qwen2.5-Turbo to handle up to **1 million** tokens and other models to process up to 131,072 tokens. Notably, these approaches not only improve the modeling of long sequences by reducing perplexity but also maintain the models’ strong performance on shorter sequences, ensuring consistent quality across varying input lengths.

推理外推靠 YaRN 与 DCA, 大约再乘四: Turbo 到 1M, 其余到 131,072. 长序列困惑度下降, 短序列不牺牲.

## 4 Post-training 后训练

Qwen 2.5 introduces two significant advancements in its post-training design compared to Qwen 2:

相对 Qwen2, 后训练有两处大改:

(1) **Expanded Supervised Fine-tuning Data Coverage:** The supervised fine-tuning process leverages a massive dataset comprising millions of high-quality examples. This expansion specifically addresses key areas where the previous model showed limitations, such as long-sequence

(1) SFT 覆盖面扩大: 百万级高质量样本, 专补上一代短板, 例如长序列

<!-- page 5 of 26 -->

generation, mathematical problem-solving, coding, instruction-following, structured data understanding, logical reasoning, cross-lingual transfer, and robust system instruction.

生成, 数学, 代码, 指令遵循, 结构化数据理解, 逻辑推理, 跨语迁移, 以及更稳的系统指令.

(2) **Two-stage Reinforcement Learning:** The reinforcement learning (RL) process in Qwen 2.5 is divided into two distinct stages: Offline RL and Online RL.

(2) 两阶段强化学习: 先 Offline RL, 再 Online RL.

• Offline RL: This stage focuses on developing capabilities that are challenging for the reward model to evaluate, such as reasoning, factuality, and instruction-following. Through meticulous construction and validation of training data, we ensure that the Offline RL signals are both learnable and reliable (Xiang et al., 2024), enabling the model to acquire those complex skills effectively.

• Online RL: The Online RL phase leverages the reward model’s ability to detect nuances in output quality, including truthfulness, helpfulness, conciseness, relevance, harmlessness and debiasing. It enables the model to generate responses that are precise, coherent, and well-structured while maintaining safety and readability. As a result, the model’s outputs consistently meet human quality standards and expectations.

• Online RL: 用奖励模型抓真值, 有用, 简洁, 相关, 无害, 去偏等细粒度质量.

### 4.1 Supervised Fine-tuning 监督微调

In this section, we detail the key enhancements made during the SFT phase of Qwen2.5, focusing on several critical areas:

(1) **Long-sequence Generation:** Qwen2.5 is capable of generating high-quality content with an output context length of up to 8,192 tokens, a significant advancement over the typical post-training response length, which often remains under 2,000 tokens. To address this gap, we develop long-response datasets (Quan et al., 2024). We employ back-translation techniques to generate queries for long-text data from pre-training corpora, impose output length constraints, and use Qwen2 to filter out low-quality paired data.

(1) 长序列生成: 输出可到 8,192 token. 回译造长答查询, 加长度约束, Qwen2 滤低质对.

(2) **Mathematics:** We introduce the chain-of-thought data of Qwen2.5-Math (Yang et al., 2024b), which encompasses a diverse range of query sources, including public datasets, K-12 problem collections, and synthetic problems. To ensure high-quality reasoning, we employ rejection sampling (Yuan et al., 2023) along with reward modeling and annotated answers for guidance, producing step-by-step reasoning process.

(2) 数学: 并入 Qwen2.5-Math 的 CoT 数据; 拒采样 + 奖励模型 + 标注答案.

(3) **Coding:** To enhance coding capabilities, we incorporate the instruction tuning data of Qwen2.5- Coder (Hui et al., 2024). We use multiple language-specific agents into a collaborative framework, generating diverse and high-quality instruction pairs across nearly 40 programming languages. We expand our instruction dataset by synthesizing new examples from code-related Q&A websites and gathering algorithmic code snippets from GitHub. A comprehensive multilingual sandbox is used to perform static code checking and validate code snippets through automated unit testing, ensuring code quality and correctness (Dou et al., 2024; Yang et al., 2024c).

(3) 代码: 并入 Qwen2.5-Coder 指令数据, 近 40 种编程语言; 多语沙箱做静态检查与单测.

(4) **Instruction-following:** To ensure high-quality instruction-following data, we implement a rigorous code-based validation framework. In this approach, LLMs generate both instructions and corresponding verification code, along with comprehensive unit tests for cross-validation. Through execution feedback-based rejection sampling, we carefully curate the training data used for Supervised Fine-Tuning, thereby guaranteeing the model’s faithful adherence to intended instructions (Dong et al., 2024).

(4) 指令遵循: 代码化校验 + 执行反馈拒采样后再进 SFT.

(5) **Structured Data Understanding:** We develop a comprehensive structured understanding dataset that encompasses both traditional tasks, such as tabular question-answering, fact verification, error correction, and structural understanding, as well as complex tasks involving structured and semi-structured data. By incorporating reasoning chains into the model’s responses, we significantly enhance its ability to infer information from structured data, thereby improving its performance across these diverse tasks. This approach not only broadens the scope of the dataset but also deepens the model’s capacity to reason and derive meaningful insights from complex data structures.

(5) 结构化理解: 表格问答, 事实核验, 纠错等; 答复带推理链.

(6) **Logical Reasoning:** To enhance the model’s logical reasoning capabilities, we introduce a diverse set of 70,000 new queries spanning various domains. These queries encompass multiple-choice questions, true / false questions, and open-ended questions. The model is trained to approach problems systematically, employing a range of reasoning methods such as deductive reasoning, inductive generalization, analogical reasoning, causal reasoning, and statistical reasoning. Through iterative refinement, we systematically filter out data containing incorrect answers or flawed reasoning processes. This process progressively strengthens the model’s ability to reason logically and accurately, ensuring robust performance across different types of reasoning tasks.

(6) 逻辑推理: 新增约 70,000 条跨域查询, 迭代去掉错答与坏推理.

<!-- page 6 of 26 -->

(7) **Cross-Lingual Transfer:** To facilitate the transfer of the model’s general capabilities across languages, we employ a translation model to convert instructions from high-resource languages into various low-resource languages, thereby generating corresponding response candidates. To ensure the accuracy and consistency of these responses, we evaluate the semantic alignment between each multilingual response and its original counterpart. This process preserves the logical structure and stylistic nuances of the original responses, thereby maintaining their integrity and coherence across different languages.

(7) 跨语迁移: 高资源指令译到低资源语, 再核语义对齐.

(8) **Robust System Instruction:** We construct hundreds of general system prompts to improve the diversity of system prompts in post-training, ensuring consistency between system prompts and conversations. Evaluations with different system prompts show that the model maintains good performance (Lu et al., 2024b) and reduced variance, indicating improved robustness.

(8) 稳健系统指令: 数百条通用 system prompt, 换 prompt 时方差下降.

(9) **Response Filtering:** To evaluate the quality of responses, we employ multiple automatic annotation methods, including a dedicated critic model and a multi-agent collaborative scoring system. Responses are subjected to rigorous assessment, and only those deem flawless by all scoring systems are retained. This comprehensive approach ensures that our outputs maintain the highest quality standards.

(9) 答复过滤: critic + 多 agent 打分, 全员判无瑕才保留.

Ultimately, we construct a dataset of over 1 million SFT examples. The model is fine-tuned for two epochs with a sequence length of 32,768 tokens. To optimize learning, the learning rate is gradually decreased from $7 \times \bar { 1 } 0 ^ { - 6 }   \mathrm { t o }   7 \times \bar { 1 } 0 ^ { - 7 }$ . To address overfitting, we apply a weight decay of 0.1, and gradient norms are clipped at a maximum value of 1.0.

最终 SFT 样本超过 100 万. 两 epoch, 序列长 32,768; 学习率从约 7e-6 降到 7e-7; weight decay 0.1, 梯度裁剪上限 1.0.

### 4.2 Offline Reinforcement Learning 离线强化学习

Compared to Online Reinforcement Learning (RL), Offline RL enables the pre-preparation of training signals, which is particularly advantageous for tasks where standard answers exist but are challenging to evaluate using reward models. In this study, we focus on objective query domains such as mathematics, coding, instruction following, and logical reasoning, where obtaining accurate evaluations can be complex. In the previous phase, we extensively employ strategies like execution feedback and answer matching to ensure the quality of responses. For the current phase, we reuse that pipeline, employing the SFT model to resample responses for a new set of queries. Responses that pass our quality checks are used as positive examples, while those that fail are treated as negative examples for Direct Preference Optimization (DPO) training (Rafailov et al., 2023). To further enhance the reliability and accuracy of the training signals, we make use of both human and automated review processes (Cao et al., 2024). This dual approach ensures that the training data is not only learnable but also aligned with human expectations. Ultimately, we construct a dataset consisting of approximately 150,000 training pairs. The model is then trained for one epoch using the Online Merging Optimizer (Lu et al., 2024a), with a learning rate of $7 \times 1 0 ^ { - 7 }$

Offline RL 做 DPO: 约 150,000 训练对, Online Merging Optimizer 一 epoch, 学习率 7e-7. 适合有标准答案但奖励模型难评的题.

### 4.3 Online Reinforcement Learning 在线强化学习

To develop a robust reward model for online RL, we adhere to a set of carefully defined labeling criteria. Those criteria ensure that the responses generated by the model are not only high-quality but also aligned with ethical and user-centric standards (Wang et al., 2024a). The specific guidelines for data labeling are as follows:

在线 RL 的奖励模型按固定标注准则: 真值, 有用, 简洁, 相关, 无害, 去偏.

• **Truthfulness:** Responses must be grounded in factual accuracy, faithfully reflecting the provided context and instructions. The model should avoid generating information that is false or unsupported by the given data.

• **Helpfulness:** The model’s output should be genuinely useful, addressing the user’s query effectively while providing content that is positive, engaging, educational, and relevant. It should follow the given instructions precisely and offer value to the user.

**Conciseness:** Responses should be succinct and to the point, avoiding unnecessary verbosity. The goal is to convey information clearly and efficiently without overwhelming the user with excessive detail.

• **Relevance:** All parts of the response should be directly related to the user’s query, dialogue history, and the assistant’s context. The model should tailor its output to ensure it is perfectly aligned with the user’s needs and expectations.

• **Harmlessness:** The model must prioritize user safety by avoiding any content that could lead to illegal, immoral, or harmful behavior. It should promote ethical conduct and responsible communication at all times.

<!-- page 7 of 26 -->

• **Debiasing:** The model should produce responses that are free from bias, including but not limited to gender, race, nationality, and politics. It should treat all topics equally and fairly, adhering to widely accepted moral and ethical standards.

The queries utilized to train the reward model are drawn from two distinct datasets: publicly available open-source data and a proprietary query set characterized by higher complexity. Responses are generated from checkpoints of the Qwen models, which have been fine-tuned using different methods—SFT, DPO, and RL—at various stages of training. To introduce diversity, those responses are sampled at different temperature settings. Preference pairs are created through both human and automated labeling processes, and the training data for DPO is also integrated into this dataset.

奖励模型的 query 取自两块: 公开开源数据 + 复杂度更高的内部私有集. 回复来自 Qwen 各训练阶段 (SFT, DPO, RL) 的 checkpoint, 按不同温度采样以增加多样性. 偏好对由人工与自动标注共同产生, DPO 的训练数据也并入此集.

In our online reinforcement learning (RL) framework, we employ Group Relative Policy Optimization (GRPO, Shao et al., 2024). The query set utilized for training the reward model is identical to the one used in the RL training phase. The sequence in which queries are processed during training is determined by the variance of their response scores, as evaluated by the reward model. Specifically, queries with higher variance in response scores are prioritized to ensure more effective learning. We sample 8 responses for each query. All models are trained with a 2048 global batch size and 2048 samples in each episode, considering a pair of queries and responses as a sample.

Online RL 用 GRPO. 按答复分数方差优先排查询; 每查询采 8 条; global batch 2048.

### 4.4 Long Context Fine-tuning 长上下文微调

To further extend the context length of Qwen2.5-Turbo, we introduce longer SFT examples during post-training, enabling it to better align with human preference in long queries.

Turbo 后训练再加长 SFT 样本, 抬长查询上的人类偏好对齐.

In the SFT phase, we employ a two-stage approach. In the first stage, the model is fine-tuned exclusively using short instructions, each containing up to 32,768 tokens. This stage uses the same data and training steps as those employed for the other Qwen2.5 models, ensuring strong performance on short tasks. In the second stage, the fine-tuning process combines both short instructions (up to 32,768 tokens) and long instructions (up to 262,144 tokens). This hybrid approach effectively enhances the model’s instruction-following ability in long context tasks while maintaining its performance on short tasks.

Turbo SFT 两阶段: 先 ≤32,768 短指令; 再短+长混合 (长可达 262,144).

During the RL stage, we use a training strategy similar to that used for the other Qwen2.5 models, focusing solely on short instructions. This design choice is driven by two primary considerations: first, RL training is computationally expensive for long context tasks; second, there is currently a scarcity of reward models that provide suitable reward signals for long context tasks. Additionally, we find that adopting RL on short instructions alone can still significantly enhance the model’s alignment with human preferences in long context tasks.

RL 仍只用短指令: 长上下文 RL 太贵, 且缺合适奖励信号; 但短指令 RL 仍能抬长查询对齐.

## 5 Evaluation 评测

The base models produced by pre-training and the instruction-tuned models produced by post-training are evaluated accordingly with a comprehensive evaluation suite, including both commonly-used open benchmarks and skill-oriented in-house datasets. The evaluation suite is designed to be primarily automatic with minimal human interaction.

Base 与指令型号用公开基准 + 内部技能集评测, 以自动评为主.

To prevent test data leakage, we exclude potentially contaminated data using n-gram matching when constructing the pre-training and post-training datasets. Following the criteria used in Qwen2, a training sequence s<sub>t</sub> is removed from the training data if there exists a test sequence $\mathbf { s } _ { e }$ such that the length of the longest common subsequence (LCS) between tokenized $\mathbf { s } _ { t }$ and $\mathbf { s } _ { e }$ satisfies both $\left| \mathrm { L C S } \big ( \mathbf { s } _ { t } , \mathbf { s } _ { e } \big ) \right| \stackrel { \sim } { \geq } 1 3$ and $| \mathrm { L C S } ( \mathbf { s } _ { t } , \mathbf { s } _ { e } ) | \geq 0 . 6 \times \min ( | \mathbf { s } _ { t } | , | \mathbf { s } _ { e } | )$

防泄漏沿用 Qwen2 的 LCS 规则: token 化后公共子序列既要够长 (≳13), 又要占较短序列的六成以上, 才从训练里删掉.

> **再看:** 只要和考题有 13 个 token 重叠就删吗?
> 不是. 两个条件同时满足才删: LCS 长度 ≳13, 且 LCS ≥0.6×min(|s_t|,|s_e|).

### 5.1 Base Models Base 模型

We conduct comprehensive evaluations of the base language models of the Qwen2.5 series. The evaluation of base models primarily emphasizes their performance in natural language understanding, general question answering, coding, mathematics, scientific knowledge, reasoning, and multilingual capabilities.

对 Qwen2.5 全系列 Base 做综合评测, 侧重自然语言理解, 通用问答, 代码, 数学, 科学知识, 推理与多语能力.

The evaluation datasets include:

**General Tasks** MMLU (Hendrycks et al., 2021a) (5-shot), MMLU-Pro (Wang et al., 2024b) (5-shot), MMLU-redux (Gema et al., 2024) (5-shot), BBH (Suzgun et al., 2023) (3-shot), ARC-C (Clark et al., 2018) (25-shot), TruthfulQA (Lin et al., 2022a) (0-shot), Winogrande (Sakaguchi et al., 2021) (5-shot), HellaSwag (Zellers et al., 2019) (10-shot).

<!-- page 8 of 26 -->

Table 2: Performance of the 70B+ base models and Qwen2.5-Plus.

表 2: 70B+ Base 与 Qwen2.5-Plus.

> **看表:** Qwen2.5-72B Base 的 MMLU 是 86.1, Llama-3-405B 是 85.2, 是不是已经全面超过 405B?
> 多项很强, 但 HumanEval 59.1 低于 405B 的 61.0. 报告说整体可比, 不是每格全胜.

<table><tr><td>Datasets</td><td>Llama-3-70B</td><td>Mixtral-8x22B</td><td>Llama-3-405B</td><td>Qwen2-72B</td><td>Qwen2.5-72B</td><td>Qwen2.5-Plus</td></tr><tr><td colspan="7">General Tasks</td></tr><tr><td>MMLU</td><td>79.5</td><td>77.8</td><td>85.2</td><td>84.2</td><td>86.1</td><td>85.4</td></tr><tr><td>MMLU-Pro</td><td>52.8</td><td>51.6</td><td>61.6</td><td>55.7</td><td>58.1</td><td>64.0</td></tr><tr><td>MMLU-redux</td><td>75.0</td><td>72.9</td><td>-</td><td>80.5</td><td>83.9</td><td>82.8</td></tr><tr><td>BBH</td><td>81.0</td><td>78.9</td><td>85.9</td><td>82.4</td><td>86.3</td><td>85.8</td></tr><tr><td>ARC-C</td><td>68.8</td><td>70.7</td><td>-</td><td>68.9</td><td>72.4</td><td>70.9</td></tr><tr><td>TruthfulQA</td><td>45.6</td><td>51.0</td><td>-</td><td>54.8</td><td>60.4</td><td>55.3</td></tr><tr><td>WindoGrande</td><td>85.3</td><td>85.0</td><td>86.7</td><td>85.1</td><td>83.9</td><td>85.5</td></tr><tr><td>HellaSwag</td><td>88.0</td><td>88.7</td><td>-</td><td>87.3</td><td>87.6</td><td>89.2</td></tr><tr><td colspan="7">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>36.3</td><td>34.3</td><td>-</td><td>37.4</td><td>45.9</td><td>43.9</td></tr><tr><td>TheoremQA</td><td>32.3</td><td>35.9</td><td>-</td><td>42.8</td><td>42.4</td><td>48.5</td></tr><tr><td>MATH</td><td>42.5</td><td>41.7</td><td>53.8</td><td>50.9</td><td>62.1</td><td>64.4</td></tr><tr><td>MMLU-stem</td><td>73.7</td><td>71.7</td><td>-</td><td>79.6</td><td>82.7</td><td>81.2</td></tr><tr><td>GSM8K</td><td>77.6</td><td>83.7</td><td>89.0</td><td>89.0</td><td>91.5</td><td>93.0</td></tr><tr><td colspan="7">Coding Tasks</td></tr><tr><td>HumanEval</td><td>48.2</td><td>46.3</td><td>61.0</td><td>64.6</td><td>59.1</td><td>59.1</td></tr><tr><td>HumanEval+</td><td>42.1</td><td>40.2</td><td>-</td><td>56.1</td><td>51.2</td><td>52.4</td></tr><tr><td>MBPP</td><td>70.4</td><td>71.7</td><td>73.0</td><td>76.9</td><td>84.7</td><td>79.7</td></tr><tr><td>MBPP+</td><td>58.4</td><td>58.1</td><td>-</td><td>63.9</td><td>69.2</td><td>66.9</td></tr><tr><td>MultiPL-E</td><td>46.3</td><td>46.7</td><td>-</td><td>59.6</td><td>60.5</td><td>61.0</td></tr><tr><td colspan="7">Multilingual Tasks</td></tr><tr><td>Multi-Exam</td><td>70.0</td><td>63.5</td><td>-</td><td>76.6</td><td>78.7</td><td>78.5</td></tr><tr><td>Multi-Understanding</td><td>79.9</td><td>77.7</td><td>-</td><td>80.7</td><td>89.6</td><td>89.2</td></tr><tr><td>Multi-Mathematics</td><td>67.1</td><td>62.9</td><td>-</td><td>76.0</td><td>76.7</td><td>82.4</td></tr><tr><td>Multi-Translation</td><td>38.0</td><td>23.3</td><td>-</td><td>37.8</td><td>39.0</td><td>40.4</td></tr></table>

**Mathematics & Science Tasks** GPQA (Rein et al., 2023) (5-shot), Theorem QA (Chen et al., 2023a) (5-shot), GSM8K (Cobbe et al., 2021) (4-shot), MATH (Hendrycks et al., 2021b) (4-shot).

**Coding Tasks** HumanEval (Chen et al., 2021) (0-shot), HumanEval+ (Liu et al., 2023)(0-shot), MBPP (Austin et al., 2021) (0-shot), MBPP+ (Liu et al., 2023) (0-shot), MultiPL-E (Cassano et al., 2023) (0-shot) (Python, C++, JAVA, PHP, TypeScript, C#, Bash, JavaScript).

**Multilingual Tasks** We group them into four categories: (a) Exam: M3Exam (5-shot, we only choose examples that require no image), IndoMMLU (Koto et al., 2023) (3-shot), ruMMLU (Fenogenova et al., 2024) (5-shot), and translated MMLU (Chen et al., 2023b) (5-shot on Arabic, Spanish, French, Portuguese, German, Italian, Japanese, and Korean); (b) Understanding: BELEBELE (Bandarkar et al., 2023) (5-shot), XCOPA (Ponti et al., 2020) (5-shot), XWinograd (Muennighoff et al., 2023) (5-shot), XStoryCloze (Lin et al., 2022b) (0-shot) and PAWS-X (Yang et al., 2019) (5-shot); (c) Mathematics: MGSM (Goyal et al., 2022) (8-shot CoT); and (d) Translation: Flores-101 (Goyal et al., 2022) (5-shot).

For base models, we compare Qwen2.5 models with Qwen2 models and other leading open-weight models in terms of scales of parameters.

Base 各规模与 Qwen2 及其他领先开源模型按参数量分档对照.

**Qwen2.5-72B & Qwen2.5-Plus** We compare the base models of Qwen2.5-72B and Qwen2.5-Plus to other leading open-weight base models: Llama3-70B (Dubey et al., 2024), Llama3-405B (Dubey et al., 2024), Mixtrail-8x22B (Jiang et al., 2024a), and our previous 72B version, the Qwen2-72B (Yang et al., 2024a). The Qwen2.5-72B base model significantly outperforms its peers in the same category across a wide range of tasks. It achieves results comparable to Llama-3-405B while utilizing only one-fifth of the parameters. Furthermore, when compared to its predecessor, Qwen2-72B, the Qwen2.5-72B shows marked improvements in nearly all benchmark evaluations, particularly excelling in general tasks, mathematics, and coding challenges. With significantly lower training and inference costs, Qwen2.5-Plus achieves very competitive performance results compared to Qwen2.5-72B and Llama3-405B, outperforming other baseline models on the Hellaswag, TheoremQA, MATH, GSM8K, MultiPL-E, Multi-Mathematics, and Multi-Translation. Moreover, Qwen2.5-Plus achieves 64.0 on MMLU-Pro, which is 5.9 points higher than Qwen2.5-72B.

72B Base 以约五分之一参数量与 Llama-3-405B 可比; Plus 更省成本, MMLU-Pro 64.0, 比 72B Dense 高 5.9.

**Qwen2.5-14B/32B & Qwen2.5-Turbo** The evaluation of the Qwen2.5-Turbo, Qwen2.5-14B, and 32B models is compared against baselines of similar sizes. These baselines include Yi-1.5-34B (Young et al.,

<!-- page 9 of 26 -->

Table 3: Performance of the 14B-30B+ base models and Qwen2.5-Turbo.

表 3: 14B–30B+ Base 与 Turbo.

<table><tr><td>Datasets</td><td>Qwen1.5-32B</td><td>Gemma2-27B</td><td>Yi-1.5-34B</td><td>Qwen2.5-Turbo</td><td>Qwen2.5-14B</td><td>Qwen2.5-32B</td></tr><tr><td colspan="7">General Tasks</td></tr><tr><td>MMLU</td><td>74.3</td><td>75.2</td><td>77.2</td><td>79.5</td><td>79.7</td><td>83.3</td></tr><tr><td>MMLU-pro</td><td>44.1</td><td>49.1</td><td>48.3</td><td>55.6</td><td>51.2</td><td>55.1</td></tr><tr><td>MMLU-redux</td><td>69.0</td><td>-</td><td>74.1</td><td>77.1</td><td>76.6</td><td>82.0</td></tr><tr><td>BBH</td><td>66.8</td><td>74.9</td><td>76.4</td><td>76.1</td><td>78.2</td><td>84.5</td></tr><tr><td>ARC-C</td><td>63.6</td><td>71.4</td><td>65.6</td><td>67.8</td><td>67.3</td><td>70.4</td></tr><tr><td>TruthfulQA</td><td>57.4</td><td>40.1</td><td>53.9</td><td>56.3</td><td>58.4</td><td>57.8</td></tr><tr><td>Winogrande</td><td>81.5</td><td>59.7</td><td>84.9</td><td>81.1</td><td>81.0</td><td>82.0</td></tr><tr><td>Hellaswag</td><td>85.0</td><td>86.4</td><td>85.9</td><td>85.0</td><td>84.3</td><td>85.2</td></tr><tr><td colspan="7">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>30.8</td><td>34.9</td><td>37.4</td><td>41.4</td><td>32.8</td><td>48.0</td></tr><tr><td>Theoremqa</td><td>28.8</td><td>35.8</td><td>40.0</td><td>42.1</td><td>43.0</td><td>44.1</td></tr><tr><td>MATH</td><td>36.1</td><td>42.7</td><td>41.7</td><td>55.6</td><td>55.6</td><td>57.7</td></tr><tr><td>MMLU-stem</td><td>66.5</td><td>71.0</td><td>72.6</td><td>77.0</td><td>76.4</td><td>80.9</td></tr><tr><td>GSM8K</td><td>78.5</td><td>81.1</td><td>81.7</td><td>88.3</td><td>90.2</td><td>92.9</td></tr><tr><td colspan="7">Coding Tasks</td></tr><tr><td>HumanEval</td><td>43.3</td><td>54.9</td><td>46.3</td><td>57.3</td><td>56.7</td><td>58.5</td></tr><tr><td>HumanEval+</td><td>40.2</td><td>46.3</td><td>40.2</td><td>51.2</td><td>51.2</td><td>52.4</td></tr><tr><td>MBPP</td><td>64.2</td><td>75.7</td><td>65.5</td><td>76.2</td><td>76.7</td><td>84.5</td></tr><tr><td>MBPP+</td><td>53.9</td><td>60.2</td><td>55.4</td><td>63.0</td><td>63.2</td><td>67.2</td></tr><tr><td>MultiPL-E</td><td>38.5</td><td>48.0</td><td>39.5</td><td>53.9</td><td>53.5</td><td>59.4</td></tr><tr><td colspan="7">Multilingual Tasks</td></tr><tr><td>Multi-Exam</td><td>61.6</td><td>65.8</td><td>58.3</td><td>70.3</td><td>70.6</td><td>75.4</td></tr><tr><td>Multi-Understanding</td><td>76.5</td><td>82.2</td><td>73.9</td><td>85.3</td><td>85.9</td><td>88.4</td></tr><tr><td>Multi-Mathematics</td><td>56.1</td><td>61.6</td><td>49.3</td><td>71.3</td><td>68.5</td><td>73.7</td></tr><tr><td>Multi-Translation</td><td>33.5</td><td>38.7</td><td>30.0</td><td>36.8</td><td>36.2</td><td>37.3</td></tr></table>

Table 4: Performance of the 7B+ base models.

表 4: 7B+ Base.

<table><tr><td>Datasets</td><td>Mistral-7B</td><td>Llama3-8B</td><td>Gemma2-9B</td><td>Qwen2-7B</td><td>Qwen2.5-7B</td></tr><tr><td colspan="6">General Tasks</td></tr><tr><td>MMLU</td><td>64.2</td><td>66.6</td><td>71.3</td><td>70.3</td><td>74.2</td></tr><tr><td>MMLU-pro</td><td>30.9</td><td>35.4</td><td>44.7</td><td>40.1</td><td>45.0</td></tr><tr><td>MMLU-redux</td><td>58.1</td><td>61.6</td><td>67.9</td><td>68.1</td><td>71.1</td></tr><tr><td>BBH</td><td>56.1</td><td>57.7</td><td>68.2</td><td>62.3</td><td>70.4</td></tr><tr><td>ARC-C</td><td>60.0</td><td>59.3</td><td>68.2</td><td>60.6</td><td>63.7</td></tr><tr><td>TruthfulQA</td><td>42.2</td><td>44.0</td><td>45.3</td><td>54.2</td><td>56.4</td></tr><tr><td>Winogrande</td><td>78.4</td><td>77.4</td><td>79.5</td><td>77.0</td><td>75.9</td></tr><tr><td>HellaSwag</td><td>83.3</td><td>82.1</td><td>81.9</td><td>80.7</td><td>80.2</td></tr><tr><td colspan="6">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>24.7</td><td>25.8</td><td>32.8</td><td>30.8</td><td>36.4</td></tr><tr><td>TheoremQA</td><td>19.2</td><td>22.1</td><td>28.9</td><td>29.6</td><td>36.0</td></tr><tr><td>MATH</td><td>10.2</td><td>20.5</td><td>37.7</td><td>43.5</td><td>49.8</td></tr><tr><td>MMLU-stem</td><td>50.1</td><td>55.3</td><td>65.1</td><td>64.2</td><td>72.3</td></tr><tr><td>GSM8K</td><td>36.2</td><td>55.3</td><td>70.7</td><td>80.2</td><td>85.4</td></tr><tr><td colspan="6">Coding Tasks</td></tr><tr><td>HumanEval</td><td>29.3</td><td>33.5</td><td>37.8</td><td>51.2</td><td>57.9</td></tr><tr><td>HumanEval+</td><td>24.4</td><td>29.3</td><td>30.5</td><td>43.3</td><td>50.6</td></tr><tr><td>MBPP</td><td>51.1</td><td>53.9</td><td>62.2</td><td>64.2</td><td>74.9</td></tr><tr><td>MBPP+</td><td>40.9</td><td>44.4</td><td>50.6</td><td>51.9</td><td>62.9</td></tr><tr><td>MultiPL-E</td><td>29.4</td><td>22.6</td><td>34.9</td><td>41.0</td><td>50.3</td></tr><tr><td colspan="6">Multilingual Tasks</td></tr><tr><td>Multi-Exam</td><td>47.1</td><td>52.3</td><td>61.2</td><td>59.2</td><td>59.4</td></tr><tr><td>Multi-Understanding</td><td>63.3</td><td>68.6</td><td>78.3</td><td>72.0</td><td>79.3</td></tr><tr><td>Multi-Mathematics</td><td>26.3</td><td>36.3</td><td>53.0</td><td>57.5</td><td>57.8</td></tr><tr><td>Multi-Translation</td><td>23.3</td><td>31.9</td><td>36.5</td><td>31.5</td><td>32.4</td></tr></table>

<!-- page 10 of 26 -->

Table 5: Performance of the smaller base models.

表 5: 更小档 Base.

> **拆开:** 非嵌入参 Qwen2.5-7B 只有 6.5B, 为什么还和 Gemma2-9B 比?
> 报告点明: Qwen2.5-7B 非嵌入 6.5B, Gemma2-9B 是 8.2B. 比的是同档开源小模型.

<table><tr><td>Datasets</td><td>Qwen2-0.5B</td><td>Qwen2.5-0.5B</td><td>Qwen2-1.5B</td><td>Qwen2.5-1.5B</td><td>Gemma2-2.6B</td><td>Qwen2.5-3B</td></tr><tr><td colspan="7">General Tasks</td></tr><tr><td>MMLU</td><td>44.3</td><td>47.5</td><td>55.9</td><td>60.9</td><td>52.2</td><td>65.6</td></tr><tr><td>MMLU-pro</td><td>14.7</td><td>15.7</td><td>21.6</td><td>28.5</td><td>23.0</td><td>34.6</td></tr><tr><td>MMLU-redux</td><td>40.7</td><td>45.1</td><td>51.8</td><td>58.5</td><td>50.9</td><td>63.7</td></tr><tr><td>BBH</td><td>18.2</td><td>20.3</td><td>36.5</td><td>45.1</td><td>41.9</td><td>56.3</td></tr><tr><td>ARC-C</td><td>31.0</td><td>35.6</td><td>43.7</td><td>54.7</td><td>55.7</td><td>56.5</td></tr><tr><td>TruthfulQA</td><td>39.7</td><td>40.2</td><td>45.9</td><td>46.6</td><td>36.2</td><td>48.9</td></tr><tr><td>Winogrande</td><td>56.9</td><td>56.3</td><td>65.0</td><td>65.0</td><td>71.5</td><td>71.1</td></tr><tr><td>Hellaswag</td><td>49.1</td><td>52.1</td><td>67.0</td><td>67.9</td><td>74.6</td><td>74.6</td></tr><tr><td colspan="7">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>29.8</td><td>24.8</td><td>20.7</td><td>24.2</td><td>25.3</td><td>26.3</td></tr><tr><td>TheoremQA</td><td>9.6</td><td>16.0</td><td>14.8</td><td>22.1</td><td>15.9</td><td>27.4</td></tr><tr><td>MATH</td><td>11.2</td><td>19.5</td><td>21.6</td><td>35.0</td><td>18.3</td><td>42.6</td></tr><tr><td>MMLU-STEM</td><td>27.5</td><td>39.8</td><td>42.7</td><td>54.8</td><td>45.8</td><td>62.5</td></tr><tr><td>GSM8K</td><td>36.4</td><td>41.6</td><td>46.9</td><td>68.5</td><td>30.3</td><td>79.1</td></tr><tr><td colspan="7">Coding Tasks</td></tr><tr><td>HumanEval</td><td>22.6</td><td>30.5</td><td>34.8</td><td>37.2</td><td>19.5</td><td>42.1</td></tr><tr><td>HumanEval+</td><td>18.9</td><td>26.8</td><td>29.9</td><td>32.9</td><td>15.9</td><td>36.0</td></tr><tr><td>MBPP</td><td>33.1</td><td>39.3</td><td>46.9</td><td>60.2</td><td>42.1</td><td>57.1</td></tr><tr><td>MBPP+</td><td>27.6</td><td>33.8</td><td>37.6</td><td>49.6</td><td>33.6</td><td>49.4</td></tr><tr><td>MultiPL-E</td><td>16.3</td><td>18.9</td><td>27.9</td><td>33.1</td><td>17.6</td><td>41.2</td></tr><tr><td colspan="7">Multilingual Tasks</td></tr><tr><td>Multi-Exam</td><td>29.4</td><td>30.8</td><td>43.1</td><td>47.9</td><td>38.1</td><td>54.6</td></tr><tr><td>Multi-Understanding</td><td>40.4</td><td>41.0</td><td>50.7</td><td>65.1</td><td>46.8</td><td>76.6</td></tr><tr><td>Multi-Mathematics</td><td>7.8</td><td>13.5</td><td>21.3</td><td>37.5</td><td>18.2</td><td>48.9</td></tr><tr><td>Multi-Translation</td><td>14.1</td><td>15.3</td><td>23.8</td><td>25.0</td><td>26.9</td><td>29.3</td></tr></table>

2024), Gemma2-27B (Gemma Team et al., 2024), and Qwen1.5-32B (Qwen Team, 2024b). The results are shown in Table 3. The Qwen2.5-14B model demonstrates a solid performance across various tasks, particularly excelling in general tasks like MMLU and BBH, where it achieves scores of 79.7 and 78.2, outcompeting competitors of larger sizes. Meanwhile, Qwen2.5-32B, in particular, showcases exceptional capabilities, often surpassing larger models of similar model sizes. Notably, it outperforms its predecessor Qwen1.5-32B significantly, especially in challenging areas such as mathematics and coding, with notable scores of 57.7 in MATH and 84.5 in MBPP. For Qwen2.5-Turbo, although its training cost and inference cost are significantly smaller than those of Qwen2.5-14B, it achieves comparable results, where its MMLU-Pro score is even better than that of Qwen2.5-32B.

表 3: 14B 的 MMLU 79.7, BBH 78.2; 32B 的 MATH 57.7, MBPP 84.5. Turbo 更便宜, MMLU-Pro 甚至高于 32B.

**Qwen2.5-7B** For 7B-level models, we focus on comparing Qwen2.5-7B with other leading 7B+ models, including Mistral-7B (Jiang et al., 2023a), Llama3-8B (Dubey et al., 2024), Gemma2-9B (Gemma Team et al., 2024), and our predecessor, Qwen2-7B (Yang et al., 2024a). The results can be found in Table 4. Note that the non-embedding parameters of Qwen2-7B and Qwen2.5-7B are only 6.5B, while that of Gemma2-9B is 8.2B. The Qwen2.5-7B model surpasses its predecessors and counterparts in numerous benchmarks, despite having fewer non-embedding parameters. It demonstrates significant improvements across various tasks, achieving 74.2 on general benchmarks like MMLU (Hendrycks et al., 2021a), 49.8 on math challenges such as MATH (Hendrycks et al., 2021b), and 57.9 on coding tasks like HumanEval (Chen et al., 2021).

表 4: Qwen2.5-7B 的 MMLU 74.2, MATH 49.8, HumanEval 57.9.

**Qwen2.5-0.5B/1.5B/3B** For edge-side models, we compare Qwen2.5-0.5B, 1.5B, and 3B against established baselines: Qwen2-0.5B/1.5B (Yang et al., 2024a) and Gemma2-2.6B (Gemma Team et al., 2024). The results are given in Table 5. Qwen2.5-0.5B, 1.5B, and 3B continue to maintain strong performance across nearly all benchmarks. Notably, the Qwen2.5-0.5B model outperforms the Gemma2-2.6B on various math and coding tasks.

表 5: 端侧三档强势; 0.5B 在多项数学与代码上超过 Gemma2-2.6B.

### 5.2 Instruction-tuned Model 指令微调模型

To critically evaluate instruction-tuned models, we adopt a multifaceted approach. Foundational skills and human preferences are assessed using open datasets and benchmarks. Additionally, our detailed in-house evaluations delve deeper into the models’competencies in key areas and multilingualism. A particular focus is placed on assessing long-context capability. The subsequent sections outline the evaluation methods and present the results.

指令模型的评测多管齐下: 基础技能与人类偏好用公开数据集与基准, 内部评测再深挖关键能力与多语, 并重点评长上下文. 下文分述方法与结果.

<!-- page 11 of 26 -->

Table 6: Performance of the 70B+ Instruct models and Qwen2.5-Plus.

表 6: 70B+ Instruct 与 Plus.

<table><tr><td>Datasets</td><td>Llama-3.1-70B</td><td>Llama-3.1-405B</td><td>Qwen2-72B</td><td>Qwen2.5-72B</td><td>Qwen2.5-Plus</td></tr><tr><td colspan="6">General Tasks</td></tr><tr><td>MMLU-Pro</td><td>66.4</td><td>73.3</td><td>64.4</td><td>71.1</td><td>72.5</td></tr><tr><td>MMLU-redux</td><td>83.0</td><td>86.2</td><td>81.6</td><td>86.8</td><td>86.3</td></tr><tr><td>LiveBench 0831</td><td>46.6</td><td>53.2</td><td>41.5</td><td>52.3</td><td>54.6</td></tr><tr><td colspan="6">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>46.7</td><td>51.1</td><td>42.4</td><td>49.0</td><td>49.7</td></tr><tr><td>MATH</td><td>68.0</td><td>73.8</td><td>69.0</td><td>83.1</td><td>84.7</td></tr><tr><td>GSM8K</td><td>95.1</td><td>96.8</td><td>93.2</td><td>95.8</td><td>96.0</td></tr><tr><td colspan="6">Coding Tasks</td></tr><tr><td>HumanEval</td><td>80.5</td><td>89.0</td><td>86.0</td><td>86.6</td><td>87.8</td></tr><tr><td>MBPP</td><td>84.2</td><td>84.5</td><td>80.2</td><td>88.2</td><td>85.5</td></tr><tr><td>MultiPL-E</td><td>68.2</td><td>73.5</td><td>69.2</td><td>75.1</td><td>77.0</td></tr><tr><td>LiveCodeBench</td><td>32.1</td><td>41.6</td><td>32.2</td><td>55.5</td><td>51.4</td></tr><tr><td colspan="6">Alignment Tasks</td></tr><tr><td>IFEval</td><td>83.6</td><td>86.0</td><td>77.6</td><td>84.1</td><td>86.3</td></tr><tr><td>Arena-Hard</td><td>55.7</td><td>69.3</td><td>48.1</td><td>81.2</td><td>81.4</td></tr><tr><td>MTbench</td><td>8.79</td><td>9.08</td><td>9.12</td><td>9.35</td><td>9.30</td></tr></table>

Table 7: Performance of the 14B-30B+ instruction-tuned models and Qwen2.5-Turbo.

表 7: 14B–30B+ Instruct 与 Turbo.

<table><tr><td>Datasets</td><td>Qwen2-57BA14B</td><td>Gemma2-27B</td><td>GPT4o-mini</td><td>Qwen2.5-Turbo</td><td>Qwen2.5-14B</td><td>Qwen2.5-32B</td></tr><tr><td colspan="7">General Tasks</td></tr><tr><td>MMLU-Pro</td><td>52.8</td><td>55.5</td><td>63.1</td><td>64.5</td><td>63.7</td><td>69.0</td></tr><tr><td>MMLU-redux</td><td>72.6</td><td>75.7</td><td>81.5</td><td>81.7</td><td>80.0</td><td>83.9</td></tr><tr><td>LiveBench 0831</td><td>31.1</td><td>39.6</td><td>43.3</td><td>42.3</td><td>44.4</td><td>50.7</td></tr><tr><td colspan="7">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>34.3</td><td>38.4</td><td>40.2</td><td>42.3</td><td>45.5</td><td>49.5</td></tr><tr><td>MATH</td><td>49.1</td><td>54.4</td><td>70.2</td><td>81.1</td><td>80.0</td><td>83.1</td></tr><tr><td>GSM8K</td><td>85.3</td><td>90.4</td><td>93.2</td><td>93.8</td><td>94.8</td><td>95.9</td></tr><tr><td colspan="7">Coding Tasks</td></tr><tr><td>HumanEval</td><td>79.9</td><td>78.7</td><td>88.4</td><td>86.6</td><td>83.5</td><td>88.4</td></tr><tr><td>MBPP</td><td>70.9</td><td>81.0</td><td>85.7</td><td>82.8</td><td>82.0</td><td>84.0</td></tr><tr><td>MultiPL-E</td><td>66.4</td><td>67.4</td><td>75.0</td><td>73.7</td><td>72.8</td><td>75.4</td></tr><tr><td>LiveCodeBench</td><td>22.5</td><td>-</td><td>40.7</td><td>37.8</td><td>42.6</td><td>51.2</td></tr><tr><td colspan="7">Alignment Tasks</td></tr><tr><td>IFEval</td><td>59.9</td><td>77.1</td><td>80.4</td><td>76.3</td><td>81.0</td><td>79.5</td></tr><tr><td>Arena-Hard</td><td>17.8</td><td>57.5</td><td>74.9</td><td>67.1</td><td>68.3</td><td>74.5</td></tr><tr><td>MTbench</td><td>8.55</td><td>9.10</td><td>-</td><td>8.81</td><td>8.88</td><td>9.20</td></tr></table>

#### 5.2.1 Open Benchmark Evaluation 公开基准评测

To comprehensively evaluate the quality of instruction-tuned models, we compile automatic and human evaluation to assess the capabilities and human preference. For the evaluation of basic capabilities, we apply similar datasets in the pre-trained model evaluation, which target on natural language understanding, coding, mathematics, and reasoning. Specifically, we evaluate on MMLU-Pro, MMLU-redux and LiveBench 0831 (White et al., 2024) for general evaluation, GPQA, GSM8K and MATH for science and mathematics, HumanEval, MBPP, MultiPL-E and LiveCodeBench 2305-2409 (Jain et al., 2024) for coding, IFEval (Zhou et al., 2023)<sup>2</sup>for instruction following. Additionally, we assess the performance of human preference alignment and instruction following by evaluating on benchmarks including MT-Bench (Zheng et al., 2023) and Arena-Hard (Li et al., 2024).

指令评测结合自动与人工. 基础能力沿用预训练评测的数据集: 通用用 MMLU-Pro, MMLU-redux, LiveBench 0831; 科学数学用 GPQA, GSM8K, MATH; 代码用 HumanEval, MBPP, MultiPL-E, LiveCodeBench; 指令遵循用 IFEval; 人类偏好对齐用 MT-Bench 与 Arena-Hard.

**Qwen2.5-72B-Instruct & Qwen2.5-Plus** As shown in Table 6, we compare Qwen2.5-72B-Instruct and Qwen2.5-Plus to other leading open-weight instrution-tuned models: Llama3.1-70B-Instruct (Dubey

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>For simplicity, we report the results of the subset strict-prompt.</span></small>

<!-- page 12 of 26 -->

Table 8: Performance of the 7B+ instruction-tuned models.

表 8: 7B+ Instruct.

<table><tr><td>Datasets</td><td>Gemma2-9B</td><td>Llama3.1-8B</td><td>Qwen2-7B</td><td>Qwen2.5-7B</td></tr><tr><td colspan="5">General Tasks</td></tr><tr><td>MMLU-Pro</td><td>52.1</td><td>48.3</td><td>44.1</td><td>56.3</td></tr><tr><td>MMLU-redux</td><td>72.8</td><td>67.2</td><td>67.3</td><td>75.4</td></tr><tr><td>LiveBench 0831</td><td>30.6</td><td>26.7</td><td>29.2</td><td>35.9</td></tr><tr><td colspan="5">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>32.8</td><td>32.8</td><td>34.3</td><td>36.4</td></tr><tr><td>MATH</td><td>44.3</td><td>51.9</td><td>52.9</td><td>75.5</td></tr><tr><td>GSM8K</td><td>76.7</td><td>84.5</td><td>85.7</td><td>91.6</td></tr><tr><td colspan="5">Coding Tasks</td></tr><tr><td>HumanEval</td><td>68.9</td><td>72.6</td><td>79.9</td><td>84.8</td></tr><tr><td>MBPP</td><td>74.9</td><td>69.6</td><td>67.2</td><td>79.2</td></tr><tr><td>MultiPL-E</td><td>53.4</td><td>50.7</td><td>59.1</td><td>70.4</td></tr><tr><td>LiveCodeBench</td><td>18.9</td><td>8.3</td><td>23.9</td><td>28.7</td></tr><tr><td colspan="5">Alignment Tasks</td></tr><tr><td>IFEval</td><td>70.1</td><td>75.9</td><td>54.7</td><td>71.2</td></tr><tr><td>Arena-Hard</td><td>41.6</td><td>27.8</td><td>25.0</td><td>52.0</td></tr><tr><td>MTbench</td><td>8.49</td><td>8.23</td><td>8.26</td><td>8.75</td></tr></table>

Table 9: Performance comparison of 2B-4B instruction-tuned models.

表 9: 2B–4B Instruct.

<table><tr><td>Datasets</td><td>Gemma2-2B</td><td>Phi3.5-Mini</td><td>MiniCPM3-4B</td><td>Qwen2.5-3B</td></tr><tr><td>Non-Emb Params</td><td>2.0B</td><td>3.6B</td><td>4.0B</td><td>2.8B</td></tr><tr><td colspan="5">General Tasks</td></tr><tr><td>MMLU-Pro</td><td>26.7</td><td>47.5</td><td>43.0</td><td>43.7</td></tr><tr><td>MMLU-redux</td><td>51.9</td><td>67.7</td><td>59.9</td><td>64.4</td></tr><tr><td>LiveBench 0831</td><td>20.1</td><td>27.4</td><td>27.6</td><td>26.8</td></tr><tr><td colspan="5">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>29.3</td><td>27.2</td><td>31.3</td><td>30.3</td></tr><tr><td>MATH</td><td>26.6</td><td>48.5</td><td>46.6</td><td>65.9</td></tr><tr><td>GSM8K</td><td>63.2</td><td>86.2</td><td>81.1</td><td>86.7</td></tr><tr><td colspan="5">Coding Tasks</td></tr><tr><td>HumanEval</td><td>68.9</td><td>72.6</td><td>74.4</td><td>74.4</td></tr><tr><td>MBPP</td><td>74.9</td><td>63.2</td><td>72.5</td><td>72.7</td></tr><tr><td>MultiPL-E</td><td>30.5</td><td>47.2</td><td>49.1</td><td>60.2</td></tr><tr><td>LiveCodeBench</td><td>5.8</td><td>15.8</td><td>23.8</td><td>19.9</td></tr><tr><td colspan="5">Alignment Tasks</td></tr><tr><td>IFEval</td><td>51.0</td><td>52.1</td><td>68.4</td><td>58.2</td></tr></table>

et al., 2024), Llama3.1-405B-Instruct (Dubey et al., 2024), and our previous 72B version, Qwen2-72B-Instruct (Yang et al., 2024a). The Qwen2.5-72B-Instruct model delivers exceptional performance, even surpassing the larger Llama-3.1-405B-Instruct in several critical benchmarks including MMLU-redux, MATH, MBPP, MultiPL-E, LiveCodeBench, Arena-Hard and MTBench. Moreover, Qwen2.5-Plus outperforms Qwen2.5-72B-Instruct on 9 out of 13 benchmarks.

表 6: 72B-Instruct 在多项关键基准上超过更大的 Llama-3.1-405B-Instruct. Plus 在 13 项里有 9 项高于 72B-Instruct.

> **问:** 摘要写约 5 倍小, 结论写六倍小, 对的是哪张表?
> 两处措辞不一致. 按 72B vs 405B 的数量级理解即可, 不要两边各取一个精确倍数.

**Qwen2.5-14B/32B-Instruct & Qwen2.5-Turbo** The performance of the Qwen2.5-Turbo, Qwen2.5-14B-Instruct, and Qwen2.5-32B-Instruct models is evaluated and compared against baselines of similar sizes. The baselines include GPT4o-mini, Gemma2-27B-IT (Gemma Team et al., 2024), and Qwen2-57BA14B-Instruct (Yang et al., 2024a). The results are summarized in Table 7. The Qwen2.5-32B-Instruct model exhibits superior performance across most tasks when compared to other models of similar size. Notably, our open-weight Qwen2.5-14B-Instruct model delivers competitive results across all benchmarks, rivaling those of GPT-4o-mini. Despite its significantly lower training and inference costs, the Qwen2.5-Turbo model outperforms Qwen2.5-14B-Instruct on eight out of ten benchmarks. This demonstrates that Qwen2.5-Turbo achieves remarkable efficiency and effectiveness, making it a compelling choice for resource-constrained environments.

表 7: 32B-Instruct 同档多数领先; 14B-Instruct 与 GPT-4o-mini 可比; Turbo 在十项里有 **八** 项超过 14B-Instruct.

<!-- page 13 of 26 -->

Table 10: Performance comparison of 0.5B-1.5B instruction-tuned models.

表 10: 0.5B–1.5B Instruct.

<table><tr><td>Datasets</td><td>Qwen2-0.5B</td><td>Qwen2.5-0.5B</td><td>Qwen2-1.5B</td><td>Qwen2.5-1.5B</td></tr><tr><td colspan="5">General Tasks</td></tr><tr><td>MMLU-Pro</td><td>14.4</td><td>15.0</td><td>22.9</td><td>32.4</td></tr><tr><td>MMLU-redux</td><td>12.9</td><td>24.1</td><td>41.2</td><td>50.7</td></tr><tr><td>LiveBench</td><td>7.4</td><td>12.6</td><td>12.4</td><td>18.8</td></tr><tr><td colspan="5">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>23.7</td><td>29.8</td><td>21.2</td><td>29.8</td></tr><tr><td>MATH</td><td>13.9</td><td>34.4</td><td>25.3</td><td>55.2</td></tr><tr><td>GSM8K</td><td>40.1</td><td>49.6</td><td>61.6</td><td>73.2</td></tr><tr><td colspan="5">Coding Tasks</td></tr><tr><td>HumanEval</td><td>31.1</td><td>35.4</td><td>42.1</td><td>61.6</td></tr><tr><td>MBPP</td><td>39.7</td><td>49.6</td><td>44.2</td><td>63.2</td></tr><tr><td>MultiPL-E</td><td>20.8</td><td>28.5</td><td>38.5</td><td>50.4</td></tr><tr><td>LiveCodeBench</td><td>1.6</td><td>5.1</td><td>4.5</td><td>14.8</td></tr><tr><td colspan="5">Alignment Tasks</td></tr><tr><td>IFEval</td><td>14.6</td><td>27.9</td><td>29.0</td><td>42.5</td></tr></table>

Table 11: Performance Comparison on our in-house English automatic evaluation benchmark.

表 11: 内部英文自动评测.

<table><tr><td>Models</td><td>IF</td><td>Knowledge</td><td>Comprehension</td><td>Coding</td><td>Math</td><td>Reasoning</td></tr><tr><td colspan="7">Proprietary LLMs</td></tr><tr><td>GPT-4o-2024-08-06</td><td>83.28</td><td>68.08</td><td>76.51</td><td>58.05</td><td>52.36</td><td>66.45</td></tr><tr><td>GPT-4o-2024-11-20</td><td>80.06</td><td>65.25</td><td>79.07</td><td>60.19</td><td>49.74</td><td>67.07</td></tr><tr><td>Claude3.5-sonnet-2024-10-22</td><td>84.22</td><td>74.61</td><td>79.02</td><td>67.17</td><td>48.67</td><td>70.20</td></tr><tr><td colspan="7">Qwen2 Series</td></tr><tr><td>Qwen2-0.5B-Instruct</td><td>18.33</td><td>18.59</td><td>30.64</td><td>5.42</td><td>13.16</td><td>32.03</td></tr><tr><td>Qwen2-1.5B-Instruct</td><td>29.42</td><td>29.23</td><td>45.81</td><td>17.02</td><td>20.34</td><td>38.86</td></tr><tr><td>Qwen2-7B-Instruct</td><td>50.47</td><td>44.79</td><td>58.04</td><td>43.04</td><td>38.31</td><td>50.25</td></tr><tr><td>Qwen2-72B-Instruct</td><td>76.08</td><td>59.49</td><td>72.19</td><td>48.95</td><td>48.07</td><td>60.33</td></tr><tr><td colspan="7">Llama-3.1 Series</td></tr><tr><td>Llama-3.1-70B-Instruct</td><td>81.33</td><td>63.42</td><td>69.29</td><td>55.96</td><td>48.00</td><td>63.18</td></tr><tr><td>Llama-3.1-405B-Instruct</td><td>83.33</td><td>67.10</td><td>75.55</td><td>58.14</td><td>47.09</td><td>64.74</td></tr><tr><td colspan="7">Qwen2.5 Series</td></tr><tr><td>Qwen2.5-0.5B-Instruct</td><td>33.35</td><td>30.29</td><td>29.78</td><td>15.41</td><td>26.29</td><td>36.13</td></tr><tr><td>Qwen2.5-1.5B-Instruct</td><td>40.25</td><td>41.19</td><td>47.69</td><td>26.19</td><td>40.99</td><td>42.23</td></tr><tr><td>Qwen2.5-3B-Instruct</td><td>60.60</td><td>46.11</td><td>57.98</td><td>41.43</td><td>49.38</td><td>49.80</td></tr><tr><td>Qwen2.5-7B-Instruct</td><td>70.01</td><td>52.74</td><td>62.69</td><td>48.41</td><td>56.93</td><td>54.69</td></tr><tr><td>Qwen2.5-14B-Instruct</td><td>74.17</td><td>59.78</td><td>69.11</td><td>52.68</td><td>59.68</td><td>62.51</td></tr><tr><td>Qwen2.5-Turbo</td><td>72.76</td><td>58.56</td><td>68.70</td><td>54.48</td><td>57.77</td><td>61.06</td></tr><tr><td>Qwen2.5-32B-Instruct</td><td>76.79</td><td>64.08</td><td>71.28</td><td>58.90</td><td>60.97</td><td>65.49</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>82.65</td><td>66.09</td><td>74.43</td><td>60.41</td><td>59.73</td><td>65.90</td></tr><tr><td>Qwen2.5-Plus</td><td>83.18</td><td>68.41</td><td>79.35</td><td>59.58</td><td>62.52</td><td>66.92</td></tr></table>

**Other Instruction-tuned Models** As illustrated in Table 8, the Qwen2.5-7B-Instruct model significantly outperforms its competitors, Gemma2-9B-IT and Llama3.1-8B-Instruct, across all tasks except IFEval. Notably, Qwen2.5-7B-Instruct exhibits clear advantages in mathematics (MATH: 75.5) and coding (HumanEval: 84.8). For the edge-side instruction models, the Qwen2.5-3B-Instruct model, despite having fewer parameters than both the Phi3.5-mini-instruct (Abdin et al., 2024) and MiniCPM3-4B-Instruct (Hu et al., 2024) models, surpasses them in mathematics and coding tasks, as shown in Table 9. Additionally, it delivers competitive results in language understanding. The Qwen2.5-1.5B-Instruct and Qwen2.5-0.5B-Instruct models have also seen substantial performance improvements over their previous versions, as detailed in Table 10. These enhancements make them particularly well-suited for edge-side applications in highly resource-constrained environments.

表 8: 7B-Instruct 除 IFEval 外全面领先; MATH 75.5, HumanEval 84.8. 表 9/10: 端侧 Instruct 相对上一代大幅抬升.

<!-- page 14 of 26 -->

Table 12: Performance Comparison on our in-house Chinese automatic evaluation benchmark.

表 12: 内部中文自动评测.

<table><tr><td>Models</td><td>IF</td><td>Knowledge</td><td>Comprehension</td><td>Coding</td><td>Math</td><td>Reasoning</td></tr><tr><td colspan="7">Proprietary LLMs</td></tr><tr><td>GPT-4o-2024-08-06</td><td>42.50</td><td>68.55</td><td>80.11</td><td>61.53</td><td>61.74</td><td>56.88</td></tr><tr><td>GPT-4o-2024-11-20</td><td>42.71</td><td>71.29</td><td>83.04</td><td>62.39</td><td>66.04</td><td>62.04</td></tr><tr><td>Claude3.5-sonnet-2024-10-22</td><td>49.25</td><td>72.09</td><td>82.16</td><td>66.00</td><td>63.71</td><td>66.60</td></tr><tr><td colspan="7">Qwen2 Series</td></tr><tr><td>Qwen2-0.5B-Instruct</td><td>4.69</td><td>40.43</td><td>39.13</td><td>9.85</td><td>14.07</td><td>32.73</td></tr><tr><td>Qwen2-1.5B-Instruct</td><td>6.81</td><td>51.54</td><td>46.89</td><td>14.14</td><td>24.57</td><td>35.19</td></tr><tr><td>Qwen2-7B-Instruct</td><td>16.83</td><td>65.95</td><td>60.30</td><td>37.05</td><td>50.52</td><td>44.96</td></tr><tr><td>Qwen2-72B-Instruct</td><td>31.98</td><td>74.96</td><td>75.49</td><td>41.57</td><td>65.55</td><td>58.19</td></tr><tr><td colspan="7">Llama-3.1 Series</td></tr><tr><td>Llama-3.1-70B-Instruct</td><td>28.96</td><td>57.41</td><td>67.24</td><td>54.82</td><td>41.18</td><td>52.42</td></tr><tr><td>Llama-3.1-405B-Instruct</td><td>30.39</td><td>63.79</td><td>72.27</td><td>60.73</td><td>46.05</td><td>55.88</td></tr><tr><td colspan="7">Qwen2.5 Series</td></tr><tr><td>Qwen2.5-0.5B-Instruct</td><td>6.12</td><td>39.13</td><td>42.97</td><td>9.60</td><td>24.03</td><td>33.72</td></tr><tr><td>Qwen2.5-1.5B-Instruct</td><td>7.38</td><td>48.68</td><td>49.69</td><td>22.96</td><td>37.30</td><td>39.17</td></tr><tr><td>Qwen2.5-3B-Instruct</td><td>16.50</td><td>57.18</td><td>62.55</td><td>29.88</td><td>51.64</td><td>39.57</td></tr><tr><td>Qwen2.5-7B-Instruct</td><td>26.64</td><td>65.77</td><td>67.55</td><td>39.56</td><td>61.06</td><td>49.70</td></tr><tr><td>Qwen2.5-14B-Instruct</td><td>26.87</td><td>70.28</td><td>76.96</td><td>49.78</td><td>67.01</td><td>56.41</td></tr><tr><td>Qwen2.5-Turbo</td><td>32.94</td><td>72.93</td><td>74.37</td><td>51.92</td><td>66.08</td><td>53.30</td></tr><tr><td>Qwen2.5-32B-Instruct</td><td>32.64</td><td>74.70</td><td>79.46</td><td>54.45</td><td>67.86</td><td>60.19</td></tr><tr><td>Qwen2.5-72B-Instruct</td><td>37.22</td><td>75.86</td><td>78.85</td><td>56.71</td><td>68.39</td><td>63.02</td></tr><tr><td>Qwen2.5-Plus</td><td>46.15</td><td>72.07</td><td>82.64</td><td>58.48</td><td>69.96</td><td>62.98</td></tr></table>

#### 5.2.2 In-house Automatic Evaluation 内部自动评测

Despite the availability of several open benchmark datasets for evaluation, we believe that these are insufficient to fully capture the capabilities of LLMs. To address this, we have developed a series of in-house datasets designed to assess various aspects of model performance, including knowledge understanding, text generation, coding, and more. These evaluations are conducted in both Chinese and English. In addition, we have specifically evaluated the multilingual performance of instructiontuned models. The results are summarized in Table 11 for English, Table 12 for Chinese, Table 13 for multilingualism of 70B+ Instruct models, and Table 14 for 7B-14B models, respectively.

公开基准不足以完整刻画 LLM 能力, 故自建内部数据集评知识理解, 文本生成, 代码等, 中英双语, 另评指令模型的多语能力. 英文见表 11, 中文表 12, 70B+ Instruct 多语表 13, 7B–14B 表 14.

**English & Chinese Evaluation** We compare the performance of Qwen2.5-Instruct models against several leading language models, including GPT-4, Claude3.5-sonnet, Qwen2, and Llama-3.1, across both English and Chinese languages. Our analysis focuses on model size and its impact on performance, as well as how our latest Qwen2.5 series compares to previous iterations and competing models. For smaller models, we observe that the Qwen2.5-0.5B model achieves performance that is on par with or even surpasses the Qwen2-1.5B model. This indicates that the Qwen2.5 series has optimized parameter usage, enabling mid-sized models to achieve similar performance levels to larger models from the previous generation. The Qwen2.5-3B model demonstrates performance that is comparable to the Qwen2-7B model. Notably, the Qwen2.5-32B model exhibits a remarkable improvement over the Qwen2-72B model. Our flagship model, Qwen2.5-72B, further narrows the gap between Qwen and state-of-the-art models like GPT-4 and Claude3.5-sonnet. In particular, Qwen2.5-72B matches or exceeds the performance of Llama-3.1-405B in all metrics except for instruction following. This achievement underscores the competitiveness of Qwen2.5-72B in a wide range of language processing tasks, while also identifying areas for future improvement. Qwen2.5-Plus addresses the previous shortcomings in Chinese instruction following and further enhances its advantages in other areas.

内部英/中: 0.5B 可追平甚至超过上代 1.5B; 3B 可比上代 7B; 旗舰 72B 多数指标逼近或超过 Llama-3.1-405B, 指令遵循仍是例外. Plus 补中文指令遵循.

> **核对:** 表 11 英文 IF 上 72B 是 82.65, 405B 是 83.33, 这就是那条缝吗?
> 是. 与正文「除 instruction following 外」一致.

**Multilingual Evaluation** To comprehensively evaluate the multilingual capabilities of instruction-tuned models, we followed P-MMEval (Zhang et al., 2024) and extended several benchmarks as follows: (1) IFEval (Multilingual): We expanded the IFEval benchmark, originally in English, to include multilingual examples. To ensure language neutrality, we removed instances that contained language-specific content (e.g., ”start with letter A”). (2) Knowledge Utilization: to assess the knowledge utilization abilities of the Qwen2.5 series models across multiple languages, we employed five MMLU-like benchmarks (multiple-choice format). These benchmarks include: AMMLU (Arabic), JMMLU (Japanese), KMMLU (Korean), IndoMMLU (Indonesian), and TurkishMMLU (Turkish). Additionally, we evaluated the models’ performance on the translated version of the MMLU benchmark (okapi MMLU), which has been adapted

<!-- page 15 of 26 -->

Table 13: Performance of the 70B+ Instruct models on Multilingual Tasks.

表 13: 70B+ Instruct 多语任务.

<table><tr><td>Datasets</td><td>Qwen2-72B</td><td>Llama3.1-70B</td><td>Qwen2.5-32B</td><td>Mistral-Large</td><td>GPT4o-mini</td><td>Qwen2.5-72B</td></tr><tr><td colspan="7">Instruction Following</td></tr><tr><td>IFEval (multilingual)</td><td>79.69</td><td>80.47</td><td>82.68</td><td>82.69</td><td>85.03</td><td>86.98</td></tr><tr><td colspan="7">Knowledge</td></tr><tr><td>AMMLU (Arabic)</td><td>68.85</td><td>70.08</td><td>70.44</td><td>69.24</td><td>69.73</td><td>72.44</td></tr><tr><td>JMMLU (Japanese)</td><td>77.37</td><td>73.89</td><td>76.55</td><td>75.77</td><td>73.74</td><td>80.56</td></tr><tr><td>KMMLU (Korean)</td><td>57.04</td><td>53.23</td><td>60.75</td><td>56.42</td><td>56.77</td><td>61.96</td></tr><tr><td>IndoMMLU (Indonesian)</td><td>66.31</td><td>67.50</td><td>66.42</td><td>63.21</td><td>67.75</td><td>69.25</td></tr><tr><td>TurkishMMLU (Turkish)</td><td>69.22</td><td>66.89</td><td>72.41</td><td>64.78</td><td>71.19</td><td>76.12</td></tr><tr><td>okapi MMLU (translated)</td><td>77.84</td><td>76.49</td><td>77.16</td><td>78.37</td><td>73.44</td><td>79.97</td></tr><tr><td colspan="7">Math Reasoning</td></tr><tr><td>MGSM8K (extended)</td><td>82.72</td><td>73.31</td><td>87.15</td><td>89.01</td><td>87.36</td><td>88.16</td></tr><tr><td colspan="7">Cultural Nuances</td></tr><tr><td>BLEnD</td><td>25.90</td><td>30.49</td><td>27.88</td><td>33.47</td><td>35.91</td><td>32.48</td></tr></table>

Table 14: Performance of the 7B-14B Instruct models on Multilingual Tasks.

表 14: 7B–14B Instruct 多语任务.

<table><tr><td>Datasets</td><td>Qwen2-7B</td><td>Llama3.1-8B</td><td>Qwen2.5-7B</td><td>Gemma2-9B</td><td>Qwen2.5-14B</td></tr><tr><td colspan="6">Instruction Following</td></tr><tr><td>IFEval (multilingual)</td><td>51.43</td><td>60.68</td><td>74.87</td><td>77.47</td><td>77.08</td></tr><tr><td colspan="6">Knowledge</td></tr><tr><td>AMMLU (Arabic)</td><td>54.87</td><td>54.28</td><td>59.78</td><td>60.26</td><td>66.81</td></tr><tr><td>JMMLU (Japanese)</td><td>57.71</td><td>53.26</td><td>61.88</td><td>64.59</td><td>72.78</td></tr><tr><td>KMMLU (Korean)</td><td>43.96</td><td>42.28</td><td>46.59</td><td>46.24</td><td>59.71</td></tr><tr><td>IndoMMLU (Indonesian)</td><td>54.05</td><td>53.92</td><td>56.42</td><td>61.73</td><td>65.09</td></tr><tr><td>TurkishMMLU (Turkish)</td><td>49.27</td><td>45.61</td><td>54.28</td><td>55.44</td><td>66.85</td></tr><tr><td>okapi MMLU (translated)</td><td>60.47</td><td>55.18</td><td>66.98</td><td>46.72</td><td>72.12</td></tr><tr><td colspan="6">Math Reasoning</td></tr><tr><td>MGSM8K (extended)</td><td>56.13</td><td>66.05</td><td>66.11</td><td>78.37</td><td>82.27</td></tr><tr><td colspan="6">Cultural Nuances</td></tr><tr><td>BLEnD</td><td>22.49</td><td>19.47</td><td>23.66</td><td>28.31</td><td>26.99</td></tr></table>

into multiple languages from its original English form. (3) MGSM8K (Extended): Building upon the original MGSM8K benchmark, we extended the language support to include Arabic (ar), Korean (ko), Portuguese (pt), and Vietnamese (vi). (4) Cultural Nuances: To evaluate the models’ ability to capture cultural nuances, we utilized the BLEnD benchmark (Myung et al., 2024). This benchmark is specifically designed to test LLMs on their understanding of cultural subtleties.

多语评测沿 P-MMEval 扩展: (1) IFEval 多语化, 去掉语言相关题 (如 "start with letter A"); (2) 知识用 AMMLU, JMMLU, KMMLU, IndoMMLU, TurkishMMLU 五个 MMLU 类选择题基准, 另加翻译版 okapi MMLU; (3) MGSM8K 扩到阿拉伯, 韩, 葡, 越; (4) 文化细微处用 BLEnD.

Qwen2.5 exhibits competitive performance in instruction following, multilingual knowledge, and mathematical reasoning, aligning well with models of comparable size. Although it shows notable improvements in capturing cultural nuances relative to its predecessor, Qwen2, there remains potential for further refinement in this domain.

多语指令遵循, 知识, 数学与同档可比; 文化细微处仍有 refined 空间.

#### 5.2.3 Reward Model 奖励模型

The reward model serves as the cornerstone for guiding RL processes, and thus we conduct a separate evaluation of the reward model used in the Qwen2.5 series. Our assessment benchmarks encompass Reward Bench (Lambert et al., 2024), RMB (Zhou et al., 2024), PPE (Frick et al., 2024b), and an internally collected out-of-domain Chinese human preference benchmark (Human-Preference-Chinese) to provide a comprehensive analysis. For comparison, we included baseline models such as Nemotron-4-340B-Reward (Adler et al., 2024), Llama-3.1-Nemotron-70B-Reward (Wang et al., 2024c), and Athene-RM-70B (Frick et al., 2024a). The results are shown in Table 15. Overall, our findings indicate that Llama-3.1- Nemotron-70B-Reward excels on the Reward Bench, while Athene-RM-70B performs best on the RMB benchmark. The Qwen2.5-RM-72B, leads in both the PPE and Human-Preference-Chinese evaluations, ranking second only to Athene-RM-70B on the RMB and achieving a performance level comparable to

<!-- page 16 of 26 -->

Table 15: Performance comparison across multiple RM benchmarks.

表 15: 多套奖励模型基准对照.

> **确认:** Reward Bench 最高分是不是就该拿去当唯一选 RM 的依据?
> 报告明确反对. 各榜第一名不同; 单榜过优化会触发 Goodhart, 且 RM 高分不必然预测下游 RL 更好.

<table><tr><td>Metric</td><td>Nemotron-4-340B-Reward</td><td>Llama-3.1-Nemotron-70B-Reward</td><td>Athene-RM -70B</td><td>Qwen2.5-RM -72B</td></tr><tr><td colspan="5">Reward Bench</td></tr><tr><td>Chat</td><td>95.80</td><td>97.50</td><td>98.32</td><td>97.21</td></tr><tr><td>Chat Hard</td><td>87.10</td><td>85.70</td><td>70.61</td><td>78.73</td></tr><tr><td>Safety</td><td>91.50</td><td>95.10</td><td>92.10</td><td>92.71</td></tr><tr><td>Reasoning</td><td>93.60</td><td>98.10</td><td>92.19</td><td>97.65</td></tr><tr><td>Score</td><td>92.00</td><td>94.10</td><td>88.32</td><td>91.59</td></tr><tr><td colspan="5">RMB</td></tr><tr><td>Helpfulness (BoN)</td><td>48.85</td><td>61.02</td><td>67.24</td><td>65.72</td></tr><tr><td>Helpfulness (Pairwise)</td><td>68.70</td><td>75.28</td><td>80.82</td><td>78.83</td></tr><tr><td>Harmlessness (BoN)</td><td>50.92</td><td>52.00</td><td>67.02</td><td>56.35</td></tr><tr><td>Harmlessness (Pairwise)</td><td>70.84</td><td>69.96</td><td>80.83</td><td>73.94</td></tr><tr><td>Overall</td><td>59.83</td><td>64.57</td><td>73.98</td><td>68.71</td></tr><tr><td colspan="5">PPE</td></tr><tr><td>Human Preference</td><td>59.28</td><td>64.32</td><td>66.48</td><td>64.80</td></tr><tr><td>IFEval</td><td>62.66</td><td>63.40</td><td>62.15</td><td>67.97</td></tr><tr><td>GPQA</td><td>56.56</td><td>59.14</td><td>59.26</td><td>59.80</td></tr><tr><td>MATH</td><td>65.12</td><td>69.73</td><td>79.14</td><td>81.48</td></tr><tr><td>MBPP-Plus</td><td>49.15</td><td>55.62</td><td>67.97</td><td>64.34</td></tr><tr><td>MMLU-Pro</td><td>69.69</td><td>70.20</td><td>76.95</td><td>75.66</td></tr><tr><td>Objective-Avg</td><td>60.64</td><td>63.62</td><td>69.09</td><td>69.85</td></tr><tr><td colspan="5">Human-Preference-Chinese</td></tr><tr><td>Accuracy</td><td>50.46</td><td>59.95</td><td>61.11</td><td>61.27</td></tr></table>

Nemotron-4-340B-Reward on the Reward Bench, albeit slightly behind Llama-3.1-Nemotron-70B-Reward.

奖励模型单独评: Reward Bench, RMB, PPE, 加内部中文偏好集 Human-Preference-Chinese; 对照 Nemotron-4-340B-Reward, Llama-3.1-Nemotron-70B-Reward, Athene-RM-70B. 各榜榜首不同: Reward Bench 第一是 Llama-3.1-Nemotron-70B, RMB 第一是 Athene-RM-70B; Qwen2.5-RM-72B 在 PPE 与中文偏好集领先, RMB 仅次 Athene, Reward Bench 上略低于 Llama-3.1-Nemotron-70B.

Due to the lack of evaluation methods for reward models, current reward models are typically evaluated using Reward Bench. However, our evaluation results from multiple RM benchmarks suggest that overoptimization on a specific benchmark may trigger Goodhart’s law (Hoskin, 1996), resulting in degraded performance on other benchmarks and potentially impacting downstream alignment performance. This highlights the need for comprehensive evaluation of reward models across diverse benchmarks rather than relying solely on a single benchmark.

不能只盯 Reward Bench. 多榜显示单榜过优化可能伤其他榜与下游对齐.

More importantly, through iterative experimentation, we have also come to recognize a critical limitation: current reward model evaluation benchmarks do not accurately predict the performance of the RL models trained under their guidance. In other words, a higher score on RM benchmarks does not necessarily correlate with superior performance of the resulting RL model. This insight underscores the need for further research into more predictive evaluation methods for reward models.

更关键: 现有 RM 榜不能准确预测其指导下训出的 RL 模型表现.

#### 5.2.4 Long Context Capabilities 长上下文能力

We utilize three benchmarks to evaluate long context capabilities of Qwen2.5 models: RULER (Hsieh et al., 2024), LV-Eval (Yuan et al., 2024), and Longbench-Chat (Bai et al., 2024). In LV-Eval, we adopt keyword recall as the reported score to mitigate the high rate of false negatives present in the original metrics.

长上下文三套: RULER, LV-Eval, Longbench-Chat. LV-Eval 改报 keyword recall.

The results are shown in Table 16 and Table 17. We can observe that the Qwen2.5 models, after equipping length extrapolation techniques (i.e., DCA + YARN), have demonstrated strong long context processing capabilities on the three datasets. Among them, Qwen2.5-72B-Instruct has shown the strongest performance across all context lengths, significantly outperforming existing open-weight long-context models as well as the proprietary models like GPT-4o-mini and GPT-4.

表 16/17: 加上 DCA + YaRN 后长上下文强; 72B-Instruct 全长度最强.

> **回看:** 表注写 YARN+DCA 不改变 32K 以内行为, 那 32K 内 w/ 与 w/o 分数为何相同?
> 外推在宣称窗口内不改行为. 差异出现在更长档.

Furthermore, as shown in Figure 2, Qwen2.5-Turbo achieves 100% accuracy in the 1M-token passkey retrieval task, demonstrating its exceptional ability to capture detailed information from ultra-long contexts. We develop a sparse attention mechanism based on Minference (Jiang et al., 2024b) to significantly enhance inference speed

> **对一下:** 12.5 倍是端到端延迟, 还是只算注意力算力?
> 正文写的是 reduces the computational load of the attention mechanism by 12.5 times, 指注意力机制的计算负载, 不是整条请求的墙钟时间. TTFT 的 3.2-4.3 倍才是首 token 时延.
, which is critical for user experience when processing long contexts. For sequences of 1M tokens, this approach reduces the computational load of the attention mechanism by 12.5 times. Figure 3 illustrates the time to first token (TTFT) of Qwen2.5-Turbo across various hardware configurations, where our method achieves a 3.2 to 4.3 times speedup.

图 2: Turbo 在 1M Passkey 上 100%. 基于 Minference 的稀疏注意力把 1M 注意力计算量降约 12.5 倍; 图 3 显示 TTFT 加速约 3.2–4.3 倍.

<!-- page 17 of 26 -->

Table 16: Performance of Qwen2.5 Models on RULER. YARN+DCA does not change the model behavior within 32K tokens.

表 16: RULER. YaRN+DCA 在 32K 以内不改变行为.

| Model | Claimed Length | Avg. | 4K | RUL8K | ER16K | 32K | 64K | 128K |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GLM4-9b-Chat-1M | 1M | 89.9 | 94.7 | 92.8 | 92.1 | 89.9 | 86.7 | 83.1 |
| Llama-3-8B-Instruct-Gradient-1048k | 1M | 88.3 | 95.5 | 93.8 | 91.6 | 87.4 | 84.7 | 77.0 |
| Llama-3.1-70B-Instruct | 128K | 89.6 | 96.5 | 95.8 | 95.4 | 94.8 | 88.4 | 66.6 |
| GPT-4o-mini | 128K | 87.3 | 95.0 | 92.9 | 92.7 | 90.2 | 87.6 | 65.8 |
| GPT-4 | 128K | 91.6 | 96.6 | 96.3 | 95.2 | 93.2 | 87.0 | 81.2 |
| Qwen2.5-7B-Instruct | 128K | 85.4 | 96.7 | 95.1 | 93.7 | 89.4 | 82.3 | 55.1 |
| w/o DCA + YARN |  | 80.1 | 96.7 | 95.1 | 93.7 | 89.4 | 74.5 | 31.4 |
| Qwen2.5-14B-Instruct | 128K | 91.4 | 97.7 | 96.8 | 95.9 | 93.4 | 86.7 | 78.1 |
| w/o DCA + YARN |  | 86.5 | 97.7 | 96.8 | 95.9 | 93.4 | 82.3 | 53.0 |
| Qwen2.5-32B-Instruct | 128K | 92.9 | 96.9 | 97.1 | 95.5 | 95.5 | 90.3 | 82.0 |
| w/o DCA + YARN |  | 88.0 | 96.9 | 97.1 | 95.5 | 95.5 | 85.3 | 57.7 |
| Qwen2.5-72B-Instruct | 128K | 95.1 | 97.7 | 97.2 | 97.7 | 96.5 | 93.0 | 88.4 |
| w/o DCA + YARN |  | 90.8 | 97.7 | 97.2 | 97.7 | 96.5 | 88.5 | 67.0 |
| Qwen2.5-Turbo | 1M | 93.1 | 97.5 | 95.7 | 95.5 | 94.8 | 90.8 | 84.5 |

Table 17: Performance of Qwen2.5 Models on LV-Eval and LongBench-Chat. YARN+DCA does not change the model behavior within 32k tokens.

表 17: LV-Eval 与 LongBench-Chat.

| Model | Claimed Length | 16k | 32k | LV-Eval64k | 128k | 256k | LongBench-Chat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GLM4-9B-Chat-1M | 1M | 46.4 | 43.2 | 42.9 | 40.4 | 37.0 | 7.82 |
| Llama-3-8B-Instruct-Gradient-1048k | 1M | 31.7 | 31.8 | 28.8 | 26.3 | 21.1 | 6.20 |
| Llama-3.1-70B-Instruct | 128k | 48.6 | 47.4 | 42.9 | 26.2 | N/A | 6.80 |
| GPT-4o-mini | 128k | 52.9 | 48.1 | 46.0 | 40.7 | N/A | 8.48 |
| Qwen2.5-7B-Instruct | 128k | 55.9 | 49.7 | 48.0 | 41.1 | 36.9 | 7.42 |
| w/o DCA + YARN |  | 55.9 | 49.7 | 33.1 | 13.6 | 0.5 | - |
| Qwen2.5-14B-Instruct | 128k | 53.0 | 50.8 | 46.8 | 43.6 | 39.4 | 8.04 |
| w/o DCA + YARN |  | 53.0 | 50.8 | 37.0 | 18.4 | 0.8 | - |
| Qwen2.5-32B-Instruct | 128k | 56.0 | 53.6 | 48.8 | 45.3 | 41.0 | 8.70 |
| w/o DCA + YARN |  | 56.0 | 53.6 | 40.1 | 20.5 | 0.7 | - |
| Qwen2.5-72B-Instruct | 128k | 60.4 | 57.5 | 53.9 | 50.9 | 45.2 | 8.72 |
| w/o DCA + YARN |  | 60.4 | 57.5 | 47.4 | 27.0 | 2.4 | - |
| Qwen2.5-Turbo | 1M | 53.4 | 50.0 | 45.4 | 43.9 | 38.0 | 8.34 |

Testing Qwen2.5-Turbo via “Passkey Retrieval”

Retrieve Hidden Number from Irrelevant Sentences across Context Lengths and Document Depth

![Chart block](images/p17-figure-2-performance-of-qwen2-5-turbo-on-passkey.png)

Figure 2: Performance of Qwen2.5-Turbo on Passkey Retrieval Task with 1M Token Lengths.

图 2: Qwen2.5-Turbo 在 1M token 长度 Passkey Retrieval 上的表现.

> **停一下:** 图 2 的 100% 是否等于任意长文档问答都满分?
> 不是. 这是 Passkey Retrieval 针检索, 不能外推成所有长文档任务满分.

<!-- page 18 of 26 -->

![Chart block](images/p18-figure-3-ttft-time-to-first-token-of-qwen2-5-turbo-and.png)

Figure 3: TTFT (Time To First Token) of Qwen2.5-Turbo and Qwen2.5-7B with Full Attention and Our Method.

图 3: Qwen2.5-Turbo 与 Qwen2.5-7B 在全注意力与本文方法下的 TTFT.

## 6 Conclusion

Qwen2.5 represents a significant advancement in large language models (LLMs), with enhanced pre-training on 18 trillion tokens and sophisticated post-training techniques, including supervised fine-tuning and multi-stage reinforcement learning. These improvements boost human preference alignment, long text generation, and structural data analysis, making Qwen2.5 highly effective for instruction-following tasks. Available in various configurations, Qwen2.5 offers both open-weight from 0.5B to 72B parameters and proprietary models including cost-effective MoE variants like Qwen2.5-Turbo and Qwen2.5-Plus. Empirical evaluations show that Qwen2.5-72B-Instruct matches the performance of the state-of-the-art Llama-3-405B-Instruct, despite being six times smaller. Qwen2.5 also serves as a foundation for specialized models, demonstrating its versatility for domain-specific applications. We believe that Qwen2.5’s robust performance, flexible architecture, and broad availability make it a valuable resource for both academic research and industrial applications, positioning it as a key player of future innovations.

Qwen2.5 是大语言模型上的显著进展: 预训练加到 18 万亿 token, 后训练含 SFT 与多阶段强化学习. 这些改进抬高人类偏好对齐, 长文本生成与结构化数据分析, 使指令遵循更有效. 配置覆盖开源 0.5B 到 72B, 以及含 Qwen2.5-Turbo, Qwen2.5-Plus 等性价比 MoE 的专有型号. 评测显示 Qwen2.5-72B-Instruct 虽约小 6 倍, 仍可匹敌最强开源档 Llama-3-405B-Instruct. Qwen2.5 也作为专项模型底座, 体现领域扩展能力. 我们认为其稳健表现, 灵活架构与广泛可得性, 对学术研究与工业应用都有价值, 并可能成为后续创新的关键一环.

In the future, we will focus on advancing robust foundational models. First, we will iteratively refine both base and instruction-tuned large language models (LLMs) by incorporating broader, more diverse, higherquality data. Second, we will also continue to develop multimodal models. Our goal is to integrate various modalities into a unified framework. This will facilitate seamless, end-to-end information processing across textual, visual, and auditory domains. Third, we are committed to enhancing the reasoning capabilities of our models. This will be achieved through strategic scaling of inference compute resources. These efforts aim to push the boundaries of current technological limitations and contribute to the broader field of artificial intelligence.

未来重心仍是更稳健的基础模型. 一是继续用更广, 更多样, 更高质的数据迭代 Base 与指令微调 LLM. 二是继续做多模态, 目标是把各模态收进统一框架, 便于文本, 视觉与听觉的端到端信息处理. 三是通过有策略地放大推理算力, 增强模型推理能力. 这些努力旨在突破当前技术边界, 并为更广的人工智能领域做贡献.

## 7 Authors 作者

**Core Contributors:** An Yang, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chengyuan Li, Dayiheng Liu, Fei Huang, Haoran Wei, Huan Lin, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Yang, Jiaxi Yang, Jingren Zhou, Junyang Lin, Kai Dang, Keming Lu, Keqin Bao, Kexin Yang, Le Yu, Mei Li, Mingfeng Xue, Pei Zhang, Qin Zhu, Rui Men, Runji Lin, Tianhao Li, Tianyi Tang, Tingyu Xia,

<!-- page 19 of 26 -->

Xingzhang Ren, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yu Wan, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, Zihan Qiu

**Contributors:** Biao Sun, Bin Luo, Bin Zhang, Binghai Wang, Chaojie Yang, Chang Si, Cheng Chen, Chengpeng Li, Chujie Zheng, Fan Hong, Guanting Dong, Guobin Zhao, Hangrui Hu, Hanyu Zhao, Hao Lin, Hao Xiang, Haoyan Huang, Humen Zhong, Jialin Wang, Jialong Tang, Jiandong Jiang, Jianqiang Wan, Jianxin Ma, Jianyuan Zeng, Jie Zhang, Jin Xu, Jinkai Wang, Jinzheng He, Jun Tang, Ke Yi, Keqin Chen, Langshi Chen, Le Jiang, Lei Zhang, Liang Chen, Man Yuan, Mingkun Yang, Minmin Sun, Na Ni, Nuo Chen, Peng Wang, Peng Zhu, Pengcheng Zhang, Pengfei Wang, Qiaoyu Tang, Qing Fu, Rong Zhang, Ru Peng, Ruize Gao, Shanghaoran Quan, Shen Huang, Shuai Bai, Shuang Luo, Sibo Song, Song Chen, Tao He, Ting He, Wei Ding, Wei Liao, Weijia Xu, Wenbin Ge, Wenbiao Yin, Wenyuan Yu, Xianyan Jia, Xianzhong Shi, Xiaodong Deng, Xiaoming Huang, Ximing Zhou, Xinyu Wang, Xipin Wei, Xuejing Liu, Yang Liu, Yang Yao, Yang Zhang, Yibo Miao, Yidan Zhang, Yikai Zhu, Yinger Zhang, Yong Jiang, Yong Li, Yongan Yue, Yuanzhi Zhu, Yunfei Chu, Zekun Wang, Zhaohai Li, Zheren Fu, Zhi Li, Zhibo Yang, Zhifang Guo, Zhipeng Zhang, Zhiying Xu, Zile Qiao, Ziye Meng

## References

Marah I Abdin, Sam Ade Jacobs, Ammar Ahmad Awan, Jyoti Aneja, Ahmed Awadallah, Hany Awadalla, Nguyen Bach, Amit Bahree, Arash Bakhtiari, Harkirat S. Behl, Alon Benhaim, Misha Bilenko, Johan Bjorck, Sebastien Bubeck, Martin Cai, Caio C ´ esar Teodoro Mendes, Weizhu Chen, Vishrav Chaudhary, ´ Parul Chopra, Allie Del Giorno, Gustavo de Rosa, Matthew Dixon, Ronen Eldan, Dan Iter, Amit Garg, Abhishek Goswami, Suriya Gunasekar, Emman Haider, Junheng Hao, Russell J. Hewett, Jamie Huynh, Mojan Javaheripi, Xin Jin, Piero Kauffmann, Nikos Karampatziakis, Dongwoo Kim, Mahoud Khademi, Lev Kurilenko, James R. Lee, Yin Tat Lee, Yuanzhi Li, Chen Liang, Weishung Liu, Eric Lin, Zeqi Lin, Piyush Madan, Arindam Mitra, Hardik Modi, Anh Nguyen, Brandon Norick, Barun Patra, Daniel Perez-Becker, Thomas Portet, Reid Pryzant, Heyang Qin, Marko Radmilac, Corby Rosset, Sambudha Roy, Olatunji Ruwase, Olli Saarikivi, Amin Saied, Adil Salim, Michael Santacroce, Shital Shah, Ning Shang, Hiteshi Sharma, Xia Song, Masahiro Tanaka, Xin Wang, Rachel Ward, Guanhua Wang, Philipp Witte, Michael Wyatt, Can Xu, Jiahang Xu, Sonali Yadav, Fan Yang, Ziyi Yang, Donghan Yu, Chengruidong Zhang, Cyril Zhang, Jianwen Zhang, Li Lyna Zhang, Yi Zhang, Yue Zhang, Yunan Zhang, and Xiren Zhou. Phi-3 technical report: A highly capable language model locally on your phone. CoRR, abs/2404.14219, 2024.

Bo Adler, Niket Agarwal, Ashwath Aithal, Dong H. Anh, Pallab Bhattacharya, Annika Brundyn, Jared Casper, Bryan Catanzaro, Sharon Clay, Jonathan Cohen, Sirshak Das, Ayush Dattagupta, Olivier Delalleau, Leon Derczynski, Yi Dong, Daniel Egert, Ellie Evans, Aleksander Ficek, Denys Fridman, Shaona Ghosh, Boris Ginsburg, Igor Gitman, Tomasz Grzegorzek, Robert Hero, Jining Huang, Vibhu Jawa, Joseph Jennings, Aastha Jhunjhunwala, John Kamalu, Sadaf Khan, Oleksii Kuchaiev, Patrick LeGresley, Hui Li, Jiwei Liu, Zihan Liu, Eileen Peters Long, Ameya Mahabaleshwarkar, Somshubra Majumdar, James Maki, Miguel Martinez, Maer Rodrigues de Melo, Ivan Moshkov, Deepak Narayanan, Sean Narenthiran, Jesus Navarro, Phong Nguyen, Osvald Nitski, Vahid Noroozi, Guruprasad Nutheti, Christopher Parisien, Jupinder Parmar, Mostofa Patwary, Krzysztof Pawelec, Wei Ping, Shrimai Prabhumoye, Rajarshi Roy, Trisha Saar, Vasanth Rao Naik Sabavat, Sanjeev Satheesh, Jane Polak Scowcroft, Jason D. Sewall, Pavel Shamis, Gerald Shen, Mohammad Shoeybi, Dave Sizer, Misha Smelyanskiy, Felipe Soares, Makesh Narsimhan Sreedhar, Dan Su, Sandeep Subramanian, Shengyang Sun, Shubham Toshniwal, Hao Wang, Zhilin Wang, Jiaxuan You, Jiaqi Zeng, Jimmy Zhang, Jing Zhang, Vivienne Zhang, Yian Zhang, and Chen Zhu. Nemotron-4 340B technical report. CoRR, abs/2406.11704, 2024.

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebron, and Sumit ´ Sanghai. GQA: Training generalized multi-query Transformer models from multi-head checkpoints. In EMNLP, pp. 4895–4901. Association for Computational Linguistics, 2023.

Ebtesam Almazrouei, Hamza Alobeidli, Abdulaziz Alshamsi, Alessandro Cappelli, Ruxandra Cojocaru, Merouane Debbah, ´ Etienne Goffinet, Daniel Hesslow, Julien Launay, Quentin Malartic, Daniele Maz- ´ zotta, Badreddine Noune, Baptiste Pannier, and Guilherme Penedo. The Falcon series of open language models. CoRR, abs/2311.16867, 2023.

Chenxin An, Fei Huang, Jun Zhang, Shansan Gong, Xipeng Qiu, Chang Zhou, and Lingpeng Kong. Training-free long-context scaling of large language models. CoRR, abs/2402.17463, 2024.

Anthropic. Introducing Claude, 2023a. URL [https://www.anthropic.com/index/introducing-claude](https://www.anthropic.com/index/introducing-claude).

Anthropic. Claude 2. Technical report, Anthropic, 2023b. URL [https://www-files.anthropic.com/production/images/Model-Card-Claude-2.pdf](https://www-files.anthropic.com/production/images/Model-Card-Claude-2.pdf).

<!-- page 20 of 26 -->

Anthropic. The Claude 3 model family: Opus, Sonnet, Haiku. Technical report, Anthropic, AI, 2024. URL [https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model Card Claud e 3.pdf](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf).

Jacob Austin, Augustus Odena, Maxwell I. Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie J. Cai, Michael Terry, Quoc V. Le, and Charles Sutton. Program synthesis with large language models. CoRR, abs/2108.07732, 2021.

Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, Binyuan Hui, Luo Ji, Mei Li, Junyang Lin, Runji Lin, Dayiheng Liu, Gao Liu, Chengqiang Lu, Keming Lu, Jianxin Ma, Rui Men, Xingzhang Ren, Xuancheng Ren, Chuanqi Tan, Sinan Tan, Jianhong Tu, Peng Wang, Shijie Wang, Wei Wang, Shengguang Wu, Benfeng Xu, Jin Xu, An Yang, Hao Yang, Jian Yang, Shusheng Yang, Yang Yao, Bowen Yu, Hongyi Yuan, Zheng Yuan, Jianwei Zhang, Xingxuan Zhang, Yichang Zhang, Zhenru Zhang, Chang Zhou, Jingren Zhou, Xiaohuan Zhou, and Tianhang Zhu. Qwen technical report. CoRR, abs/2309.16609, 2023.

Yushi Bai, Xin Lv, Jiajie Zhang, Yuze He, Ji Qi, Lei Hou, Jie Tang, Yuxiao Dong, and Juanzi Li. LongAlign: A recipe for long context alignment of large language models. In EMNLP (Findings), pp. 1376–1395. Association for Computational Linguistics, 2024.

Lucas Bandarkar, Davis Liang, Benjamin Muller, Mikel Artetxe, Satya Narayan Shukla, Donald Husa, Naman Goyal, Abhinandan Krishnan, Luke Zettlemoyer, and Madian Khabsa. The Belebele benchmark: A parallel reading comprehension dataset in 122 language variants. CoRR, abs/2308.16884, 2023.

Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, and Dario Amodei. Language models are few-shot learners. In NeurIPS, 2020.

Boxi Cao, Keming Lu, Xinyu Lu, Jiawei Chen, Mengjie Ren, Hao Xiang, Peilin Liu, Yaojie Lu, Ben He, Xianpei Han, Le Sun, Hongyu Lin, and Bowen Yu. Towards scalable automated alignment of LLMs: A survey. CoRR, abs/2406.01252, 2024.

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q. Feldman, Arjun Guha, Michael Greenberg, and Abhinav Jangda. MultiPL-E: A scalable and polyglot approach to benchmarking neural code generation. IEEE Trans. Software Eng., 49(7):3675–3691, 2023.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared Kaplan, ´ Harrison Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Joshua Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021.

Wenhu Chen, Ming Yin, Max Ku, Pan Lu, Yixin Wan, Xueguang Ma, Jianyu Xu, Xinyi Wang, and Tony Xia. TheoremQA: A theorem-driven question answering dataset. In EMNLP, pp. 7889–7901. Association for Computational Linguistics, 2023a.

Zhihong Chen, Shuo Yan, Juhao Liang, Feng Jiang, Xiangbo Wu, Fei Yu, Guiming Hardy Chen, Junying Chen, Hongbo Zhang, Li Jianquan, Wan Xiang, and Benyou Wang. MultilingualSIFT: Multilingual supervised instruction fine-tuning, 2023b. URL [https://github.com/FreedomIntelligence/MultilingualSIFT](https://github.com/FreedomIntelligence/MultilingualSIFT).

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? Try ARC, the AI2 reasoning challenge. CoRR, abs/1803.05457, 2018.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021.

<!-- page 21 of 26 -->

Damai Dai, Chengqi Deng, Chenggang Zhao, R. X. Xu, Huazuo Gao, Deli Chen, Jiashi Li, Wangding Zeng, Xingkai Yu, Y. Wu, Zhenda Xie, Y. K. Li, Panpan Huang, Fuli Luo, Chong Ruan, Zhifang Sui, and Wenfeng Liang. DeepSeekMoE: Towards ultimate expert specialization in mixture-of-experts language models. CoRR, abs/2401.06066, 2024.

Yann N. Dauphin, Angela Fan, Michael Auli, and David Grangier. Language modeling with gated convolutional networks. In ICML, volume 70 of Proceedings of Machine Learning Research, pp. 933–941. PMLR, 2017.

Guanting Dong, Keming Lu, Chengpeng Li, Tingyu Xia, Bowen Yu, Chang Zhou, and Jingren Zhou. Self-play with execution feedback: Improving instruction-following capabilities of large language models. CoRR, abs/2406.13542, 2024.

Shihan Dou, Jiazheng Zhang, Jianxiang Zang, Yunbo Tao, Haoxiang Jia, Shichun Liu, Yuming Yang, Shenxi Wu, Shaoqing Zhang, Muling Wu, et al. Multi-programming language sandbox for llms. CoRR, abs/2410.23074, 2024.

Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, Anirudh Goyal, Anthony Hartshorn, Aobo Yang, Archi Mitra, Archie Sravankumar, Artem Korenev, Arthur Hinsvark, Arun Rao, Aston Zhang, Aurelien Rodriguez, Austen Gregerson, Ava Spataru, Baptiste Rozi ´ ere, Bethany Biron, Binh \` Tang, Bobbie Chern, Charlotte Caucheteux, Chaya Nayak, Chloe Bi, Chris Marra, Chris McConnell, Christian Keller, Christophe Touret, Chunyang Wu, Corinne Wong, Cristian Canton Ferrer, Cyrus Nikolaidis, Damien Allonsius, Daniel Song, Danielle Pintz, Danny Livshits, David Esiobu, Dhruv Choudhary, Dhruv Mahajan, Diego Garcia-Olano, Diego Perino, Dieuwke Hupkes, Egor Lakomkin, Ehab AlBadawy, Elina Lobanova, Emily Dinan, Eric Michael Smith, Filip Radenovic, Frank Zhang, Gabriel Synnaeve, Gabrielle Lee, Georgia Lewis Anderson, Graeme Nail, Gregoire Mialon, Guan ´ Pang, Guillem Cucurell, Hailey Nguyen, Hannah Korevaar, Hu Xu, Hugo Touvron, Iliyan Zarov, Imanol Arrieta Ibarra, Isabel M. Kloumann, Ishan Misra, Ivan Evtimov, Jade Copet, Jaewon Lee, Jan Geffert, Jana Vranes, Jason Park, Jay Mahadeokar, Jeet Shah, Jelmer van der Linde, Jennifer Billock, Jenny Hong, Jenya Lee, Jeremy Fu, Jianfeng Chi, Jianyu Huang, Jiawen Liu, Jie Wang, Jiecao Yu, Joanna Bitton, Joe Spisak, Jongsoo Park, Joseph Rocca, Joshua Johnstun, Joshua Saxe, Junteng Jia, Kalyan Vasuden Alwala, Kartikeya Upasani, Kate Plawiak, Ke Li, Kenneth Heafield, Kevin Stone, and et al. The Llama 3 herd of models. CoRR, abs/2407.21783, 2024.

William Fedus, Barret Zoph, and Noam Shazeer. Switch transformers: Scaling to trillion parameter models with simple and efficient sparsity. J. Mach. Learn. Res., 23:120:1–120:39, 2022.

Alena Fenogenova, Artem Chervyakov, Nikita Martynov, Anastasia Kozlova, Maria Tikhonova, Albina Akhmetgareeva, Anton A. Emelyanov, Denis Shevelev, Pavel Lebedev, Leonid Sinev, Ulyana Isaeva, Katerina Kolomeytseva, Daniil Moskovskiy, Elizaveta Goncharova, Nikita Savushkin, Polina Mikhailova, Denis Dimitrov, Alexander Panchenko, and Sergey Markov. MERA: A comprehensive LLM evaluation in russian. CoRR, abs/2401.04531, 2024.

Evan Frick, Peter Jin, Tianle Li, Karthik Ganesan, Jian Zhang, Jiantao Jiao, and Banghua Zhu. Athene-70b: Redefining the boundaries of post-training for open models, July 2024a. URL [https://nexusflow.ai/blogs/athene](https://nexusflow.ai/blogs/athene).

Evan Frick, Tianle Li, Connor Chen, Wei-Lin Chiang, Anastasios Nikolas Angelopoulos, Jiantao Jiao, Banghua Zhu, Joseph E. Gonzalez, and Ion Stoica. How to evaluate reward models for RLHF. CoRR, abs/2410.14872, 2024b.

Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, et al. Are we done with mmlu? CoRR, abs/2406.04127, 2024.

Gemini Team. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. Technical report, Google, 2024. URL [https://storage.googleapis.com/deepmind-media/gemini/gemini v1 5 report.pdf](https://storage.googleapis.com/deepmind-media/gemini/gemini_v1_5_report.pdf).

Gemma Team, Morgane Riviere, Shreya Pathak, Pier Giuseppe Sessa, Cassidy Hardin, Surya Bhupatiraju, Leonard Hussenot, Thomas Mesnard, Bobak Shahriari, Alexandre Ram ´ e, et al. Gemma 2: Improving ´ open language models at a practical size. CoRR, abs/2408.00118, 2024.

Naman Goyal, Cynthia Gao, Vishrav Chaudhary, Peng-Jen Chen, Guillaume Wenzek, Da Ju, Sanjana Krishnan, Marc’Aurelio Ranzato, Francisco Guzman, and Angela Fan. The Flores-101 evaluation ´ benchmark for low-resource and multilingual machine translation. Trans. Assoc. Comput. Linguistics, 10: 522–538, 2022.

<!-- page 22 of 26 -->

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In ICLR. OpenReview.net, 2021a.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the MATH dataset. In NeurIPS Datasets and Benchmarks, 2021b.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, et al. Training computeoptimal large language models. CoRR, abs/2203.15556, 2022.

Keith Hoskin. The “awful idea of accountability”: Inscribing people into the measurement of objects. Accountability: Power, ethos and the technologies of managing, 1996.

Cheng-Ping Hsieh, Simeng Sun, Samuel Kriman, Shantanu Acharya, Dima Rekesh, Fei Jia, Yang Zhang, and Boris Ginsburg. RULER: What’s the real context size of your long-context language models? CoRR, abs/2404.06654, 2024.

Shengding Hu, Yuge Tu, Xu Han, Chaoqun He, Ganqu Cui, Xiang Long, Zhi Zheng, Yewei Fang, Yuxiang Huang, Weilin Zhao, Xinrong Zhang, Zhen Leng Thai, Kai Zhang, Chongyi Wang, Yuan Yao, Chenyang Zhao, Jie Zhou, Jie Cai, Zhongwu Zhai, Ning Ding, Chao Jia, Guoyang Zeng, Dahai Li, Zhiyuan Liu, and Maosong Sun. MiniCPM: Unveiling the potential of small language models with scalable training strategies. CoRR, abs/2404.06395, 2024.

Binyuan Hui, Jian Yang, Zeyu Cui, Jiaxi Yang, Dayiheng Liu, Lei Zhang, Tianyu Liu, Jiajun Zhang, Bowen Yu, Keming Lu, et al. Qwen2.5-Coder technical report. CoRR, abs/2409.12186, 2024.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. LiveCodeBench: Holistic and contamination free evaluation of large language models for code. CoRR, abs/2403.07974, 2024.

Albert Q. Jiang, Alexandre Sablayrolles, Arthur Mensch, Chris Bamford, Devendra Singh Chaplot, Diego de Las Casas, Florian Bressand, Gianna Lengyel, Guillaume Lample, Lucile Saulnier, Lelio Renard ´ Lavaud, Marie-Anne Lachaux, Pierre Stock, Teven Le Scao, Thibaut Lavril, Thomas Wang, Timothee´ Lacroix, and William El Sayed. Mistral 7B. CoRR, abs/2310.06825, 2023a.

Albert Q. Jiang, Alexandre Sablayrolles, Antoine Roux, Arthur Mensch, Blanche Savary, Chris Bamford, Devendra Singh Chaplot, Diego de Las Casas, Emma Bou Hanna, Florian Bressand, Gianna Lengyel, Guillaume Bour, Guillaume Lample, Lelio Renard Lavaud, Lucile Saulnier, Marie-Anne Lachaux, ´ Pierre Stock, Sandeep Subramanian, Sophia Yang, Szymon Antoniak, Teven Le Scao, Theophile Gervet, ´ Thibaut Lavril, Thomas Wang, Timothee Lacroix, and William El Sayed. Mixtral of experts. ´ CoRR, abs/2401.04088, 2024a.

Huiqiang Jiang, Yucheng Li, Chengruidong Zhang, Qianhui Wu, Xufang Luo, Surin Ahn, Zhenhua Han, Amir H Abdi, Dongsheng Li, Chin-Yew Lin, Yuqing Yang, and Lili Qiu. Minference 1.0: Accelerating pre-filling for long-context llms via dynamic sparse attention. arXiv preprint arXiv:2407.02490, 2024b.

Zixuan Jiang, Jiaqi Gu, Hanqing Zhu, and David Z. Pan. Pre-RMSNorm and Pre-CRMSNorm Transformers: Equivalent and efficient pre-LN Transformers. CoRR, abs/2305.14858, 2023b.

Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, and Dario Amodei. Scaling laws for neural language models. CoRR, abs/2001.08361, 2020.

Fajri Koto, Nurul Aisyah, Haonan Li, and Timothy Baldwin. Large language models only pass primary school exams in Indonesia: A comprehensive test on IndoMMLU. In EMNLP, pp. 12359–12374. Association for Computational Linguistics, 2023.

Nathan Lambert, Valentina Pyatkin, Jacob Daniel Morrison, Lester James Validad Miranda, Bill Yuchen Lin, Khyathi Raghavi Chandu, Nouha Dziri, Sachin Kumar, Tom Zick, Yejin Choi, Noah A. Smith, and Hanna Hajishirzi. RewardBench: Evaluating reward models for language modeling. CoRR, abs/2403.13787, 2024.

Dmitry Lepikhin, HyoukJoong Lee, Yuanzhong Xu, Dehao Chen, Orhan Firat, Yanping Huang, Maxim Krikun, Noam Shazeer, and Zhifeng Chen. GShard: Scaling giant models with conditional computation and automatic sharding. CoRR, abs/2006.16668, 2020.

<!-- page 23 of 26 -->

Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Tianhao Wu, Banghua Zhu, Joseph E. Gonzalez, and Ion Stoica. From crowdsourced data to high-quality benchmarks: Arena-Hard and BenchBuilder pipeline. CoRR, abs/2406.11939, 2024.

Stephanie Lin, Jacob Hilton, and Owain Evans. TruthfulQA: Measuring how models mimic human falsehoods. In ACL (1), pp. 3214–3252. Association for Computational Linguistics, 2022a.

Xi Victoria Lin, Todor Mihaylov, Mikel Artetxe, Tianlu Wang, Shuohui Chen, Daniel Simig, Myle Ott, Naman Goyal, Shruti Bhosale, Jingfei Du, Ramakanth Pasunuru, Sam Shleifer, Punit Singh Koura, Vishrav Chaudhary, Brian O’Horo, Jeff Wang, Luke Zettlemoyer, Zornitsa Kozareva, Mona T. Diab, Veselin Stoyanov, and Xian Li. Few-shot learning with multilingual generative language models. In EMNLP, pp. 9019–9052. Association for Computational Linguistics, 2022b.

Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by ChatGPT really correct? Rigorous evaluation of large language models for code generation. In NeurIPS, 2023.

Keming Lu, Bowen Yu, Fei Huang, Yang Fan, Runji Lin, and Chang Zhou. Online merging optimizers for boosting rewards and mitigating tax in alignment. CoRR, abs/2405.17931, 2024a.

Keming Lu, Bowen Yu, Chang Zhou, and Jingren Zhou. Large language models are superpositions of all characters: Attaining arbitrary role-play via self-alignment. CoRR, abs/2401.12474, 2024b.

Niklas Muennighoff, Thomas Wang, Lintang Sutawika, Adam Roberts, Stella Biderman, Teven Le Scao, M. Saiful Bari, Sheng Shen, Zheng Xin Yong, Hailey Schoelkopf, Xiangru Tang, Dragomir Radev, Alham Fikri Aji, Khalid Almubarak, Samuel Albanie, Zaid Alyafeai, Albert Webson, Edward Raff, and Colin Raffel. Crosslingual generalization through multitask finetuning. In ACL (1), pp. 15991–16111. Association for Computational Linguistics, 2023.

Junho Myung, Nayeon Lee, Yi Zhou, Jiho Jin, Rifki Afina Putri, Dimosthenis Antypas, Hsuvas Borkakoty, Eunsu Kim, Carla Perez-Almendros, Abinew Ali Ayele, V ´ ´ıctor Gutierrez-Basulto, Yazm ´ ´ın Ibánez- ˜ Garc´ıa, Hwaran Lee, Shamsuddeen Hassan Muhammad, Ki-Woong Park, Anar Sabuhi Rzayev, Nina White, Seid Muhie Yimam, Mohammad Taher Pilehvar, Nedjma Ousidhoum, Jose Camacho-Collados, ´ and Alice Oh. Blend: A benchmark for llms on everyday knowledge in diverse cultures and languages. CoRR, abs/2406.09948, 2024.

OpenAI. GPT4 technical report. CoRR, abs/2303.08774, 2023.

OpenAI. Hello GPT-4o, 2024a. URL [https://openai.com/index/hello-gpt-4o/](https://openai.com/index/hello-gpt-4o/).

OpenAI. Learning to reason with LLMs, 2024b. URL [https://openai.com/index/learning-to-reason-with-llms/](https://openai.com/index/learning-to-reason-with-llms/).

Long Ouyang, Jeffrey Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul F. Christiano, Jan Leike, and Ryan Lowe. Training language models to follow instructions with human feedback. In NeurIPS, 2022.

Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. YaRN: Efficient context window extension of large language models. CoRR, abs/2309.00071, 2023.

Edoardo Maria Ponti, Goran Glavas, Olga Majewska, Qianchu Liu, Ivan Vulic, and Anna Korhonen. XCOPA: A multilingual dataset for causal commonsense reasoning. In EMNLP (1), pp. 2362–2376. Association for Computational Linguistics, 2020.

Shanghaoran Quan, Tianyi Tang, Bowen Yu, An Yang, Dayiheng Liu, Bofei Gao, Jianhong Tu, Yichang Zhang, Jingren Zhou, and Junyang Lin. Language models can self-lengthen to generate long texts. CoRR, abs/2410.23933, 2024.

Qwen Team. Code with CodeQwen1.5, 2024a. URL [https://qwenlm.github.io/blog/codeqwen1.5/](https://qwenlm.github.io/blog/codeqwen1.5/).

Qwen Team. Introducing Qwen1.5, 2024b. URL [https://qwenlm.github.io/blog/qwen1.5/](https://qwenlm.github.io/blog/qwen1.5/).

Qwen Team. Introducing Qwen2-Math, 2024c. URL [https://qwenlm.github.io/blog/qwen2-math/](https://qwenlm.github.io/blog/qwen2-math/).

Qwen Team. QwQ: Reflect deeply on the boundaries of the unknown, 2024d. URL [https://qwenlm.github.io/blog/qwq-32b-preview/](https://qwenlm.github.io/blog/qwq-32b-preview/).

Alec Radford, Karthik Narasimhan, Tim Salimans, Ilya Sutskever, et al. Improving language understanding by generative pre-training. Technical report, OpenAI, 2018.

<!-- page 24 of 26 -->

Rafael Rafailov, Archit Sharma, Eric Mitchell, Christopher D. Manning, Stefano Ermon, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. In NeurIPS, 2023.

Samyam Rajbhandari, Conglong Li, Zhewei Yao, Minjia Zhang, Reza Yazdani Aminabadi, Ammar Ahmad Awan, Jeff Rasley, and Yuxiong He. DeepSpeed-MoE: Advancing mixture-of-experts inference and training to power next-generation AI scale. In ICML, volume 162 of Proceedings of Machine Learning Research, pp. 18332–18346. PMLR, 2022.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. GPQA: A graduate-level Google-proof Q&A benchmark. CoRR, abs/2311.12022, 2023.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. WinoGrande: An adversarial winograd schema challenge at scale. Commun. ACM, 64(9):99–106, 2021.

Rico Sennrich, Barry Haddow, and Alexandra Birch. Neural machine translation of rare words with subword units. In ACL (1). The Association for Computer Linguistics, 2016.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. CoRR, abs/2402.03300, 2024.

Jianlin Su. The magical effect of the Bias term: RoPE + Bias = better length extrapolation, 2023. URL [https://spaces.ac.cn/archives/9577](https://spaces.ac.cn/archives/9577).

Jianlin Su, Murtadha H. M. Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced Transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

Mirac Suzgun, Nathan Scales, Nathanael Scharli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, ¨ Aakanksha Chowdhery, Quoc V. Le, Ed H. Chi, Denny Zhou, and Jason Wei. Challenging BIG-Bench tasks and whether chain-of-thought can solve them. In ACL (Findings), pp. 13003–13051. Association for Computational Linguistics, 2023.

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothee Lacroix, ´ Baptiste Roziere, Naman Goyal, Eric Hambro, Faisal Azhar, Aur \` elien Rodriguez, Armand Joulin, ´ Edouard Grave, and Guillaume Lample. LLaMA: Open and efficient foundation language models. CoRR, abs/2302.13971, 2023a.

Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, Dan Bikel, Lukas Blecher, Cristian Canton-Ferrer, Moya Chen, Guillem Cucurull, David Esiobu, Jude Fernandes, Jeremy Fu, Wenyin Fu, Brian Fuller, Cynthia Gao, Vedanuj Goswami, Naman Goyal, Anthony Hartshorn, Saghar Hosseini, Rui Hou, Hakan Inan, Marcin Kardas, Viktor Kerkez, Madian Khabsa, Isabel Kloumann, Artem Korenev, Punit Singh Koura, Marie-Anne Lachaux, Thibaut Lavril, Jenya Lee, Diana Liskovich, Yinghai Lu, Yuning Mao, Xavier Martinet, Todor Mihaylov, Pushkar Mishra, Igor Molybog, Yixin Nie, Andrew Poulton, Jeremy Reizenstein, Rashi Rungta, Kalyan Saladi, Alan Schelten, Ruan Silva, Eric Michael Smith, Ranjan Subramanian, Xiaoqing Ellen Tan, Binh Tang, Ross Taylor, Adina Williams, Jian Xiang Kuan, Puxin Xu, Zheng Yan, Iliyan Zarov, Yuchen Zhang, Angela Fan, Melanie Kambadur, Sharan Narang, Aurelien Rodriguez, Robert Stojnic, Sergey Edunov, and Thomas Scialom. Llama 2: Open ´ foundation and fine-tuned chat models. CoRR, abs/2307.09288, 2023b.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, and Illia Polosukhin. Attention is all you need. In NIPS, pp. 5998–6008, 2017.

Binghai Wang, Rui Zheng, Lu Chen, Yan Liu, Shihan Dou, Caishuang Huang, Wei Shen, Senjie Jin, Enyu Zhou, Chenyu Shi, et al. Secrets of RLHF in large language models part II: Reward modeling. CoRR, abs/2401.06080, 2024a.

Changhan Wang, Kyunghyun Cho, and Jiatao Gu. Neural machine translation with byte-level subwords. In AAAI, pp. 9154–9160. AAAI Press, 2020.

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark. CoRR, abs/2406.01574, 2024b.

Zhilin Wang, Alexander Bukharin, Olivier Delalleau, Daniel Egert, Gerald Shen, Jiaqi Zeng, Oleksii Kuchaiev, and Yi Dong. HelpSteer2-Preference: Complementing ratings with preferences. CoRR, abs/2410.01257, 2024c.

<!-- page 25 of 26 -->

Colin White, Samuel Dooley, Manley Roberts, Arka Pal, Benjamin Feuer, Siddhartha Jain, Ravid Shwartz-Ziv, Neel Jain, Khalid Saifullah, Siddartha Naidu, Chinmay Hegde, Yann LeCun, Tom Goldstein, Willie Neiswanger, and Micah Goldblum. LiveBench: A challenging, contamination-free LLM benchmark. CoRR, abs/2406.19314, 2024.

Hao Xiang, Bowen Yu, Hongyu Lin, Keming Lu, Yaojie Lu, Xianpei Han, Le Sun, Jingren Zhou, and Junyang Lin. Aligning large language models via self-steering optimization. CoRR, abs/2410.17131, 2024.

Wenhan Xiong, Jingyu Liu, Igor Molybog, Hejia Zhang, Prajjwal Bhargava, Rui Hou, Louis Martin, Rashi Rungta, Karthik Abinav Sankararaman, Barlas Oguz, Madian Khabsa, Han Fang, Yashar Mehdad, Sharan Narang, Kshitiz Malik, Angela Fan, Shruti Bhosale, Sergey Edunov, Mike Lewis, Sinong Wang, and Hao Ma. Effective long-context scaling of foundation models. CoRR, abs/2309.16039, 2023.

An Yang, Baosong Yang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Zhou, Chengpeng Li, Chengyuan Li, Dayiheng Liu, Fei Huang, Guanting Dong, Haoran Wei, Huan Lin, Jialong Tang, Jialin Wang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Ma, Jianxin Yang, Jin Xu, Jingren Zhou, Jinze Bai, Jinzheng He, Junyang Lin, Kai Dang, Keming Lu, Keqin Chen, Kexin Yang, Mei Li, Mingfeng Xue, Na Ni, Pei Zhang, Peng Wang, Ru Peng, Rui Men, Ruize Gao, Runji Lin, Shijie Wang, Shuai Bai, Sinan Tan, Tianhang Zhu, Tianhao Li, Tianyu Liu, Wenbin Ge, Xiaodong Deng, Xiaohuan Zhou, Xingzhang Ren, Xinyu Zhang, Xipin Wei, Xuancheng Ren, Xuejing Liu, Yang Fan, Yang Yao, Yichang Zhang, Yu Wan, Yunfei Chu, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, Zhifang Guo, and Zhihao Fan. Qwen2 technical report. CoRR, abs/2407.10671, 2024a.

An Yang, Beichen Zhang, Binyuan Hui, Bofei Gao, Bowen Yu, Chengpeng Li, Dayiheng Liu, Jianhong Tu, Jingren Zhou, Junyang Lin, et al. Qwen2.5-Math technical report: Toward mathematical expert model via self-improvement. CoRR, abs/2409.12122, 2024b.

Jian Yang, Jiaxi Yang, Ke Jin, Yibo Miao, Lei Zhang, Liqun Yang, Zeyu Cui, Yichang Zhang, Binyuan Hui, and Junyang Lin. Evaluating and aligning codellms on human preference. CoRR, abs/2412.05210, 2024c.

Yinfei Yang, Yuan Zhang, Chris Tar, and Jason Baldridge. PAWS-X: A cross-lingual adversarial dataset for paraphrase identification. In EMNLP/IJCNLP (1), pp. 3685–3690. Association for Computational Linguistics, 2019.

Alex Young, Bei Chen, Chao Li, Chengen Huang, Ge Zhang, Guanwei Zhang, Heng Li, Jiangcheng Zhu, Jianqun Chen, Jing Chang, Kaidong Yu, Peng Liu, Qiang Liu, Shawn Yue, Senbin Yang, Shiming Yang, Tao Yu, Wen Xie, Wenhao Huang, Xiaohui Hu, Xiaoyi Ren, Xinyao Niu, Pengcheng Nie, Yuchi Xu, Yudong Liu, Yue Wang, Yuxuan Cai, Zhenyu Gu, Zhiyuan Liu, and Zonghong Dai. Yi: Open foundation models by 01.AI. CoRR, abs/2403.04652, 2024.

Tao Yuan, Xuefei Ning, Dong Zhou, Zhijie Yang, Shiyao Li, Minghui Zhuang, Zheyue Tan, Zhuyu Yao, Dahua Lin, Boxun Li, Guohao Dai, Shengen Yan, and Yu Wang. LV-Eval: A balanced long-context benchmark with 5 length levels up to 256K. CoRR, abs/2402.05136, 2024.

Zheng Yuan, Hongyi Yuan, Chengpeng Li, Guanting Dong, Chuanqi Tan, and Chang Zhou. Scaling relationship on learning mathematical reasoning with large language models. CoRR, abs/2308.01825, 2023.

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. HellaSwag: Can a machine really finish your sentence? In ACL (1), pp. 4791–4800. Association for Computational Linguistics, 2019.

Yidan Zhang, Boyi Deng, Yu Wan, Baosong Yang, Haoran Wei, Fei Huang, Bowen Yu, Junyang Lin, and Jingren Zhou. P-MMEval: A parallel multilingual multitask benchmark for consistent evaluation of LLMs. CoRR, abs/2411.09116, 2024.

Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, Siyuan Zhuang, Zhanghao Wu, Yonghao Zhuang, Zi Lin, Zhuohan Li, Dacheng Li, Eric P. Xing, Hao Zhang, Joseph E. Gonzalez, and Ion Stoica. Judging LLM-as-a-judge with MT-Bench and Chatbot Arena. In NeurIPS, 2023.

Enyu Zhou, Guodong Zheng, Bing Wang, Zhiheng Xi, Shihan Dou, Rong Bao, Wei Shen, Limao Xiong, Jessica Fan, Yurong Mou, Rui Zheng, Tao Gui, Qi Zhang, and Xuanjing Huang. RMB: Comprehensively benchmarking reward models in LLM alignment. CoRR, abs/2410.09893, 2024.

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. CoRR, abs/2311.07911, 2023.

<!-- page 26 of 26 -->

Barret Zoph, Irwan Bello, Sameer Kumar, Nan Du, Yanping Huang, Jeff Dean, Noam Shazeer, and William Fedus. ST-MoE: Designing stable and transferable sparse expert models. CoRR, abs/2202.08906, 2022.

26
