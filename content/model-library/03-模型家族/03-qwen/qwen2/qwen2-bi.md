---
title: "Qwen2 · 对照译稿"
category: "模型库"
tags: ["Qwen", "对照译稿"]
published: true
excerpt: "Qwen2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 26 -->

arXiv:2407.10671v4 [cs.CL] 10 Sep 2024

# QWEN2 TECHNICAL REPORT # Qwen2 技术报告

An Yang, Baosong Yang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Zhou, Chengpeng Li, Chengyuan Li, Dayiheng Liu, Fei Huang, Guanting Dong, Haoran Wei, Huan Lin, Jialong Tang, Jialin Wang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Ma, Jianxin Yang, Jin Xu, Jingren Zhou, Jinze Bai, Jinzheng He, Junyang Lin, Kai Dang, Keming Lu, Keqin Chen, Kexin Yang, Mei Li, Mingfeng Xue, Na Ni, Pei Zhang, Peng Wang, Ru Peng, Rui Men, Ruize Gao, Runji Lin, Shijie Wang, Shuai Bai, Sinan Tan, Tianhang Zhu, Tianhao Li, Tianyu Liu, Wenbin Ge, Xiaodong Deng, Xiaohuan Zhou, Xingzhang Ren, Xinyu Zhang, Xipin Wei, Xuancheng Ren, Xuejing Liu, Yang Fan, Yang Yao, Yichang Zhang, Yu Wan, Yunfei Chu, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, Zhifang Guo, and Zhihao Fan

**Qwen Team, Alibaba Group**

## ABSTRACT

This report introduces the Qwen2 series, the latest addition to our large language models and large multimodal models. We release a comprehensive suite of foundational and instruction-tuned language models, encompassing a parameter range from 0.5 to 72 billion, featuring dense models and a Mixture-of-Experts model. Qwen2 surpasses most prior open-weight models, including its predecessor Qwen1.5, and exhibits competitive performance relative to proprietary models across diverse benchmarks on language understanding, generation, multilingual proficiency, coding, mathematics, and reasoning.



本报告介绍 Qwen2 系列, 是我们大语言模型与大型多模态模型的最新成员. 我们发布一套完整的基础模型与指令微调模型, 参数覆盖 0.5B 到 72B, 含 Dense 与 MoE. Qwen2 超过多数先前开源权重模型 (含前代 Qwen1.5), 并在语言理解, 生成, 多语, 代码, 数学与推理等基准上与专有模型具有可比表现.

The flagship model, Qwen2-72B, showcases remarkable performance: 84.2 on MMLU, 37.9 on GPQA, 64.6 on HumanEval, 89.5 on GSM8K, and 82.4 on BBH as a base language model. The instruction-tuned variant, Qwen2-72B-Instruct, attains 9.1 on MT-Bench, 48.1 on Arena-Hard, and 35.7 on LiveCodeBench. Moreover, Qwen2 demonstrates robust multilingual capabilities, proficient in approximately 30 languages, spanning English, Chinese, Spanish, French, German, Arabic, Russian, Korean, Japanese, Thai, Vietnamese, and more, underscoring its versatility and global reach.



旗舰 Base 模型 Qwen2-72B 表现突出: MMLU 84.2, GPQA 37.9, HumanEval 64.6, GSM8K 89.5, BBH 82.4. 指令微调版 Qwen2-72B-Instruct 在 MT-Bench 得 9.1, Arena-Hard 48.1, LiveCodeBench 35.7. Qwen2 多语能力扎实, 约通 30 种语言, 覆盖英, 中, 西, 法, 德, 阿, 俄, 韩, 日, 泰, 越等, 说明其适应面与全球可用性.

To foster community innovation and accessibility, we have made the Qwen2 model weights openly available on Hugging Face<sup>1</sup>and ModelScope<sup>2</sup>, and the supplementary materials including example code on GitHub<sup>3</sup>. These platforms also include resources for quantization, fine-tuning, and deployment, facilitating a wide range of applications and research endeavors.



为便于社区创新与获取, 我们已在 Hugging Face 与 ModelScope 公开 Qwen2 权重, 并在 GitHub 提供含示例代码的补充材料. 这些平台也提供量化, 微调与部署资源, 方便各类应用与研究.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>∗</sup>Authors are ordered alphabetically by the first name.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://huggingface.co/Qwen](https://huggingface.co/Qwen)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://modelscope.cn/organization/qwen](https://modelscope.cn/organization/qwen)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>[https://github.com/QwenLM/Qwen2](https://github.com/QwenLM/Qwen2)</span></small>

<!-- page 2 of 26 -->

## CONTENTS 目录

- 1 Introduction 3
- 2 Tokenizer & Model 3
- 2.1 Tokenizer 3
- 2.2 Model Architecture 4
- 2.2.1 Qwen2 Dense Model 4
- 2.2.2 Qwen2 Mixture-of-experts Model 4
- 2.2.3 Model Configuration 5
- 3 Pre-training 5
- 3.1 Pre-training Data 5
- 3.2 Long-context Training 6
- 4 Post-training 6
- 4.1 Post-training Data 6
- 4.1.1 Collaborative Data Annotation 7
- 4.1.2 Automated Data Synthesis 7
- 4.2 Supervised Fine-tuning 8
- 4.3 Reinforcement Learning from Human Feedback 8
- 5 Evaluation 8
- 5.1 Base Language Models 8
- 5.1.1 Core Capabilities 8
- 5.2 Instruction-tuned Model 12
- 5.2.1 Open Benchmark Evaluation 12
- 5.2.2 In-house Automatic Evaluation 14
- 5.2.3 Long Context Capabilities 15
- 5.2.4 Multilingual Evaluation 18
- 5.2.5 Safety & Responsibility 18
- 5.2.6 Contamination Analysis 19
- 6 Conclusion 20


<!-- page 3 of 26 -->

## 1 INTRODUCTION

Following the emergence of ChatGPT (OpenAI, 2022), enthusiasm for large language models (LLMs) has escalated globally. The release of the Llama series (Touvron et al., 2023) has further ignited interests within the open-source community, particularly regarding GPT-level local LLMs. Recently, Claude-3 Opus (Anthropic, 2024) and GPT-4o (omni) (OpenAI, 2024), the updated model for ChatGPT, have ascended to the pinnacle of the Chatbot Arena (Chiang et al., 2024) in quick succession. This platform is well-regarded for its human evaluations of LLMs. Moreover, Llama-3 (AI@Meta, 2024) has emerged as the state-of-the-art open-weight model series, narrowing the performance gap with leading proprietary models and widely acknowledged as GPT-4–level. An increasing number of competitive LLMs are now pursuing advancements similar to those made by the GPT series from OpenAI. Many of these models, including Qwen (Bai et al., 2023a), Mistral (Jiang et al., 2023a), Gemma (Mesnard et al., 2024), etc., have been released in an open-weight manner.



ChatGPT (OpenAI, 2022) 出现后, 全球对大语言模型的热情迅速升温. Llama 系列 (Touvron et al., 2023) 进一步点燃开源社区对 GPT 级本地模型的兴趣. 近来 Claude-3 Opus (Anthropic, 2024) 与 ChatGPT 的更新版 GPT-4o (OpenAI, 2024) 先后登上以人类评测著称的 Chatbot Arena (Chiang et al., 2024) 顶端. Llama-3 (AI@Meta, 2024) 则成为开源权重系列中的当时最强一档, 缩小了与领先专有模型的差距, 并常被视作 GPT-4 级. 越来越多竞品正沿着 OpenAI GPT 系列的路径推进; 其中 Qwen (Bai et al., 2023a), Mistral (Jiang et al., 2023a), Gemma (Mesnard et al., 2024) 等也以开源权重方式发布.

Over recent months, we have successively introduced the Qwen series (Bai et al., 2023a) and progressed to Qwen1.5 (Qwen Team, 2024a). In the meantime, we have unveiled the vision-language model Qwen-VL (Bai et al., 2023b), and launched the audio-language model Qwen-Audio (Chu et al., 2023). In this work, we introduce the newest addition to the Qwen family of large language models and large multimodal modles: **Qwen2**. Qwen2 is a series of LLMs, grounded in the Transformer architecture (Vaswani et al., 2017), trained using next-token prediction. The model series encompasses foundational, i.e., base language models, pre-trained but unaligned to human preferences, and instruction-tuned models, fine-tuned with single-turn and multi-turn instructionfollowing datasets suitable for chat and agent purposes. Our release comprises four dense models with parameter counts of 0.5 billion, 1.5 billion, 7 billion, and 72 billion, plus a Mixture-of-Experts (MoE) model with 57 billion parameters, of which 14 billion are activated for each token. The smaller models, specifically Qwen2-0.5B and Qwen2-1.5B, are designed for easy deployment on portable devices such as smartphones, earphones, and smart glasses. Conversely, the larger models cater to deployment across GPUs of varying scales.



近几个月我们先后发布 Qwen 系列 (Bai et al., 2023a) 并推进到 Qwen1.5 (Qwen Team, 2024a), 同期推出视觉语言模型 Qwen-VL (Bai et al., 2023b) 与音频语言模型 Qwen-Audio (Chu et al., 2023). 本文介绍 Qwen 家族最新成员 **Qwen2**: 基于 Transformer (Vaswani et al., 2017), 以 next-token prediction 训练. 系列含基础模型 (预训练但未对齐人类偏好) 与指令微调模型 (用单轮 / 多轮指令跟随数据微调, 面向对话与 agent). 发布四档 Dense (0.5B, 1.5B, 7B, 72B), 外加总参 57B, 每 token 激活 14B 的 MoE. 较小的 Qwen2-0.5B 与 Qwen2-1.5B 面向手机, 耳机, 智能眼镜等便携设备; 更大模型则适配不同规模 GPU 部署.

All models were pre-trained on a high-quality, large-scale dataset comprising over 7 trillion tokens, covering a wide range of domains and languages. Compared to previous editions of Qwen, Qwen2 includes a broader spectrum of linguistic data, enhancing the quantity and quality of code and mathematics content. This enrichment is hypothesized to improve reasoning abilities of LLMs. Regarding post-training, all models underwent supervised fine-tuning and direct preference optimization (DPO, Rafailov et al., 2023), aligning them with human preferences through learning from human feedback. This process endows the models with the capability to follow instructions effectively.



全部模型在超过 7 万亿 token 的高质大规模数据上预训练, 覆盖多领域与多语言. 相对前代 Qwen, Qwen2 语言数据更广, 代码与数学的量与质都加强, 作者推测这有助于抬推理能力. 后训练上, 各模型都做了 SFT 与 DPO (Rafailov et al., 2023), 借助人类反馈对齐偏好, 从而具备有效的指令跟随能力.

We have conducted a thorough evaluation of Qwen2, alongside a selection of baseline models including both open-weight and proprietary models accessible via API. Qwen2 outperforms competing models in evaluations of both fundamental language capabilities and instruction-tuned functionalities Specifically, Qwen2-72B-Instruct, our instruction-tuned variant, scores 9.1 on MT-Bench (Zheng et al., 2023), 48.1 on Arena-Hard (Chiang et al., 2024), and 35.7 on LiveCodeBench (Jain et al., 2024). Meanwhile, Qwen2-72B, the base language model, achieves 84.2 on MMLU (Hendrycks et al., 2021a), 37.9 on GPQA (Rein et al., 2023), 64.6 on HumanEval (Chen et al., 2021), 89.5 on GSM8K (Cobbe et al., 2021), and 82.4 on BBH (Suzgun et al., 2023).



我们在开源权重与可通过 API 访问的专有基线上系统评测了 Qwen2. 基础语言能力与指令微调能力上, Qwen2 均超过对照. 具体而言, 指令版 Qwen2-72B-Instruct 在 MT-Bench 得 9.1 (Zheng et al., 2023), Arena-Hard 48.1 (Chiang et al., 2024), LiveCodeBench 35.7 (Jain et al., 2024); Base 版 Qwen2-72B 则达到 MMLU 84.2 (Hendrycks et al., 2021a), GPQA 37.9 (Rein et al., 2023), HumanEval 64.6 (Chen et al., 2021), GSM8K 89.5 (Cobbe et al., 2021), BBH 82.4 (Suzgun et al., 2023).

## 2 TOKENIZER & MODEL 分词器与模型

This section introduces the tokenizer and model design of Qwen2. We detail the model architecture and configurations for different model sizes.



本节介绍 Qwen2 的分词器与模型设计, 并给出各规模的架构与配置.

### 2.1 TOKENIZER 分词器

Following Qwen (Bai et al., 2023a), we employ the identical tokenizer based on byte-level bytepair encoding. Notably, this tokenizer exhibits high encoding efficiency, as evidenced by its better compression rate relative to alternatives, facilitating the multilingual capabilities of Qwen2.

Models of all sizes employ a common vocabulary consisting of 151,643 regular tokens and 3 control tokens. For more information, please refer to Bai et al. (2023a). It should be noted that, owing to considerations in distributed training, the effective size for the embeddings is larger.



沿用 Qwen 的 byte-level BPE 分词器. 压缩率相对更好, 有利于多语. 全系列共用词表: 常规 token 151,643, 控制 token 3; 分布式训练下 embedding 有效尺寸会更大. 细节见 Bai et al. (2023a).

> **想:** 词表写 151,643+3, Table 1 却写 Vocabulary Size 151,646, 差在哪?
> 常规加控制是 151,646; 表里的是 embedding 侧统一尺寸, 与正文「effective size for the embeddings is larger」一致, 读表时不要当成又换了一套分词器.

<!-- page 4 of 26 -->

### 2.2 MODEL ARCHITECTURE 模型架构

The Qwen2 series fundamentally constitute large language models based on the Transformer architecture, featuring self-attention with causal masks (Vaswani et al., 2017). Specifically, this series encompasses dense language models of 4 scales and a Mixture-of-Experts (MoE) model. We introduce the specifics of the dense models before delving into the MoE model's distinctive attributes.



Qwen2 是带因果掩码自注意力的 Transformer 语言模型: 四档 Dense 加一档 MoE. 先讲 Dense, 再讲 MoE 差异.

#### 2.2.1 QWEN2 DENSE MODEL Qwen2 Dense 模型

The architecture of the Qwen2 dense models comprises multiple Transformer layers, each equipped with causal attention mechanisms and feed-forward neural networks (FFNs). Key differences from Qwen are described below:

**Grouped Query Attention** We adopt Grouped Query Attention (GQA, Ainslie et al., 2023) instead of conventional multi-head attention (MHA). GQA optimizes KV cache usage during inference, significantly enhancing throughput. Detailed KV head configurations for various model sizes are reported in Section 2.2.3.

**Dual Chunk Attention with YARN** To expand the context window of Qwen2, we implement Dual Chunk Attention (DCA, An et al., 2024), which segments long sequences into chunks of manageable lengths. If the input can be handled in a chunk, DCA produces the same result as the original attention. Otherwise, DCA facilitates effective capture of relative positional information between tokens within and across chunks, thereby improving long context performance. Moreover, we also employ YARN (Peng et al., 2023) to rescale the attention weights for better length extrapolation.

Moreover, we follow Qwen with the usage of SwiGLU (Dauphin et al., 2017) for activation, Rotary Positional Embeddings (RoPE, Su et al., 2024) for positional embedding, QKV bias (Su, 2023) for attention, RMSNorm (Jiang et al., 2023b) and pre-normalization for training stability.



Dense 由多层 Transformer 组成, 每层因果注意力 + FFN. 相对 Qwen 的关键差异:

**Grouped Query Attention** 用 GQA 替代常规 MHA, 优化推理 KV cache, 抬吞吐. 各规模 KV 头配置见 §2.2.3.

**Dual Chunk Attention with YARN** 用 DCA 把长序列切成可管理 chunk: 单 chunk 内结果与原注意力相同; 跨 chunk 时更好抓相对位置. 另用 YARN 重标定注意力权重, 改善长度外推.

其余沿用 Qwen: SwiGLU,RoPE,QKV bias,RMSNorm,pre-norm.

#### 2.2.2 QWEN2 MIXTURE-OF-EXPERTS MODEL Qwen2 MoE 模型

The architecture of Qwen2 MoE models closely mirrors that of Qwen1.5-MoE-A2.7B (Qwen Team, 2024c). As a substitute for the original FFN, the MoE FFN consists of n individual FFNs, each serving as an expert. Each token is directed to a specific expert $E _ { i }$ for computation based on probabilities assigned by a gated network G:

$$
\mathbf {p} = \operatorname{softmax} \left(G (\mathbf {x})\right),\tag{1}
$$

$$
\mathbf {y} = \sum_ {i \in \operatorname{top} _ {k} (\mathbf {p})} \mathbf {p} _ {i} E _ {i} (\mathbf {x}).\tag{2}
$$

In the following, we present critical design considerations of Qwen2 MoE.

**Expert Granularity** The key structural difference between MoE models and dense models is that MoE layers incorporate multiple FFNs, each serving as an individual expert. Consequently, one straightforward strategy to transition from a dense architecture to an MoE architecture is to set the parameters of each expert equal to those of a single FFN from the original dense model. For example, transitioning from Mistral-7B (Jiang et al., 2023a) to Mixtral 8x7B (Jiang et al., 2024), involves activating two of the eight experts at a time. Differently, our model employs fine-grained experts (Dai et al., 2024), creating smaller-scale experts while activating a greater number of experts simultaneously. Given an equal total number of expert parameters and activated parameters, finegrained experts offer a richer set of expert combinations. By leveraging these fine-grained experts, Qwen2 MoE facilitates more diverse and dynamic expert utilization, thereby enhancing overall performance and adaptability.

**Expert Routing** The design of expert routing mechanisms is crucial for enhancing the performance of MoE models. Recently, there has been a notable trend towards integrating both shared and routing-specific experts within MoE layers (Rajbhandari et al., 2022; Dai et al., 2024). We adopt this approach, as it facilitates the application of shared experts across various tasks while reserving others for selective use in specific routing scenarios. The introduction of shared and specialized experts offers a more adaptable and efficient method for developing MoE routing mechanisms.



Qwen2 MoE 架构贴近 Qwen1.5-MoE-A2.7B. MoE FFN 由 n 个专家 FFN 组成; 门控 G 给出概率后, token 进入 Top-K 专家, 见式 (1)(2).

**Expert Granularity** 粗切常见做法是「每个专家 = 原 Dense 的一个 FFN」, 如 Mistral-7B → Mixtral 8x7B 八选二. Qwen2 改用细粒度专家: 专家更小, 同时激活更多个; 总参与激活参预算相同时, 组合空间更大, 利用更灵活.

**Expert Routing** 采用共享专家 + 路由专家: 共享专家跨任务常开, 其余按路由选用.

<!-- page 5 of 26 -->

Table 1: Architecture of Qwen2 dense and MoE models. For MoE models, 57B-A14B denotes that the model has 57B parameters in total and for each token 14B parameters are active, the Intermediate size denotes that of each expert, and # Activated Experts excludes the shared experts.



表 1: Qwen2 Dense 与 MoE 架构. 57B-A14B = 总参 57B / 每 token 激活 14B; Intermediate size 是每个专家的中间宽; # Activated Experts 不含共享专家.

| Configuration | 0.5B | 1.5B | 7B | 72B | 57B-A14B |
| --- | --- | --- | --- | --- | --- |
| Hidden Size | 896 | 1,536 | 3,584 | 8,192 | 3,584 |
| # Layers | 24 | 28 | 28 | 80 | 28 |
| # Query Heads | 14 | 12 | 28 | 64 | 28 |
| # KV Heads | 2 | 2 | 4 | 8 | 4 |
| Head Size | 64 | 128 | 128 | 128 | 128 |
| Intermediate Size | 4,864 | 8,960 | 18,944 | 29,568 | 2,560 |
| # Routed Experts | - | - | - | - | 64 |
| # Activated Experts | - | - | - | - | 8 |
| # Shared Experts | - | - | - | - | 8 |
| Embedding Tying | True | True | False | False | False |
| Vocabulary Size | 151,646 | 151,646 | 151,646 | 151,646 | 151,646 |
| # Trained Tokens | 12T | 7T | 7T | 7T | 4.5T |

**Expert Initialization** We initialize the experts in a similar way to upcycling (Komatsuzaki et al., 2023), leveraging the weights of a dense model. In contrast, our approach emphasizes diversification among fine-grained experts to enhance the model's representational breadth. Given the designated expert intermediate size h<sub>E</sub>, the number of experts n, and the original FFN intermediate size $h _ { \mathrm { F F N } }$ , the FFN is replicated $\left[ \left. n \times h _ { \mathrm { E } } \right/ h _ { \mathrm { F F N } } \right]$ times. This replication ensures compatibility with the specified number of experts while accommodating any arbitrary expert intermediate size. To promote diversity within each FFN copy, parameters are shuffled along the intermediate dimension. This guarantees that each fine-grained expert exhibits unique characteristics, even across different FFN copies. Subsequently, these experts are extracted from the FFN copies, and the remaining dimensions are discarded. For each fine-grained expert, 50% of its parameters are randomly reinitialized. This process introduces additional stochasticity into expert initialization, potentially enhancing the model's capacity for exploration during training.



**Expert Initialization** 类似 upcycling, 从 Dense 权重初始化, 但更强调细专家之间的多样性. 按专家中间宽 $h_E$,专家数 $n$,原 FFN 中间宽 $h_{\mathrm{FFN}}$, 把 FFN 复制 $\lceil n \times h_E / h_{\mathrm{FFN}} \rceil$ 次; 沿中间维 shuffle 后切出细专家, 丢掉剩余维; 每个细专家再有 50% 参数随机重初始化, 给训练期探索加随机性.

#### 2.2.3 MODEL CONFIGURATION 模型配置

In the following, we provide the key configuration and information for the Qwen2 series.

The Qwen2 series consists of models of 5 sizes, which are Qwen2-0.5B, Qwen2-1.5B, Qwen2-7B, Qwen2-57B-A14B, and Qwen2-72B. Table 1 lists the hyper-parameters and important information, e.g., the number of pre-trained tokens. Particularly, Qwen2-57B-A14B is upscaled from Qwen2-7B. Notably, Qwen2 models demonstrate a substantially lower Key-Value (KV) size per token relative to Qwen1.5 models. This characteristic translates into a reduced memory footprint, particularly advantageous in long-context inference tasks.



五档: 0.5B,1.5B,7B,57B-A14B,72B. 超参见 Table 1. 57B-A14B 从 Qwen2-7B 升档. 相对 Qwen1.5, 每 token KV 明显更小, 长上下文推理更省显存.

> **想:** 57B-A14B 的 4.5T 是「从头再训」还是「升档后续训」?
> 正文写 upscaled from Qwen2-7B, 并与 upcycling 原则一致, 是在 Dense 权重上升档后再吃 4.5T, 不是与 7B 无关的从零 MoE.

## 3 PRE-TRAINING 预训练

In the pre-training of Qwen2, our efforts were focused on refining the dataset and investigating methods to handle extended context lengths effectively.



预训练重点两块: 把数据做扎实, 以及把长上下文训顺.

### 3.1 PRE-TRAINING DATA 预训练数据

The pre-training of the Qwen2 models involves the development of a new, large-scale, high-quality multilingual dataset. This dataset represents an improvement over the corpora used in previous Qwen and Qwen1.5 models (Bai et al., 2023a; Qwen Team, 2024a), enhancing the scale, quality, and diversity of the pre-training data in several key areas:

**Quality Enhancement** The filtering algorithm has been refined with additional heuristic and modelbased methods, including the use of the Qwen models to filter out low-quality data. Moreover, these models are utilized to synthesize high-quality pre-training data.

<!-- page 6 of 26 -->

**Data Expansion** Compared to Qwen1.5 (Qwen Team, 2024a), we have collected a significantly larger volume of high-quality code, mathematics, and multilingual data, enhancing the model's capabilities in respective areas. This new dataset supports approximately 30 languages, such as English, Chinese, Spanish, French, German, Arabic, Russian, Korean, Japanese, Thai, and Vietnamese.

**Distribution Improvement** To ensure the model learns the distribution akin to human-like learning, we conduct experiments on scaled-down models to optimize the mixing of data from various sources and domains.

Based on these enhancements, the pre-training data was expanded from 3 trillion tokens in Qwen1.5 (Qwen Team, 2024a) to 7 trillion tokens. An attempt to further relax the quality threshold resulted in a 12 trillion token dataset. However, the model trained on this dataset did not show a significant performance improvement over the 7 trillion token model. It is suspected that increasing the volume of data does not necessarily benefit model pre-training. Considering training costs, we opted to use the higher-quality 7 trillion token dataset for training larger models, leaving further exploration for future model iterations.

All Qwen2 dense models, excluding Qwen2-0.5B, were pre-trained on this large-scale dataset of over 7 trillion tokens. Qwen2-0.5B were pre-trained using the 12 trillion token dataset. The MoE model received an additional 4.5 trillion tokens of pre-training, in line with the principle of upcycling. Similar to previous Qwen models, high-quality multi-task instruction data is integrated into the Qwen2 pre-training process to enhance in-context learning and instruction-following abilities.



相对 Qwen / Qwen1.5, 新多语料在规模,质量,多样性上加码:

**Quality Enhancement** 过滤加启发式与模型方法, 用 Qwen 滤低质, 并合成高质预训练数据.

**Data Expansion** 代码,数学,多语显著加量; 约 30 种语言, 含英,中,西,法,德,阿,俄,韩,日,泰,越等.

**Distribution Improvement** 在缩小模型上做配比实验, 优化多来源混合, 使学习分布更接近「人类式」节奏.

数据从 Qwen1.5 的约 3T 扩到 7T. 放宽质量阈值得到 12T 后, 大模型未显著超过 7T 课表; 作者怀疑「只加量」未必总有益, 考虑成本后大模型守高质量 7T. 除 0.5B 外 Dense 都训 7T+; 0.5B 用 12T; MoE 按 upcycling 再加 4.5T. 与前代一样, 预训练混入高质多任务指令数据, 抬 in-context learning 与跟随.

> **问:** 12T「没赢」7T, 是不是说 Scaling Laws 失效了?
> 不是. 报告只记录一次放松质量阈值的尝试, 没有给出可外推的缩放拟合; 结论停在「这一次大模型更吃质量」.

### 3.2 LONG-CONTEXT TRAINING 长上下文训练

To enhance the long-context capability of Qwen2, we augmented the context length from 4,096 tokens to 32,768 tokens during the concluding phase of pre-training. This expansion was complemented by the introduction of a significantly increased volume of high-quality, lengthy data. In conjunction with these enhancements, we modified the base frequency of RoPE from 10,000 to 1,000,000 to optimize performance in long-context scenarios (Xiong et al., 2023).

To fully leverage the model's length extrapolation potential, we adopted the YARN mechanism (Peng et al., 2023) and the Dual Chunk Attention mechanism (An et al., 2024). These strategies enable the model to process sequences of up to 131,072 tokens while maintaining high performance, as evidenced by minimal perplexity degradation in preliminary experiments.



预训练末段把上下文从 4,096 拉到 32,768, 同步加大高质长文本, 并把 RoPE base frequency 从 10,000 改到 1,000,000. 再叠 YARN 与 DCA, 使模型能处理最长约 131,072; 初步实验困惑度退化很小.

## 4 POST-TRAINING 后训练

Following extensive large-scale pre-training, we engage in a post-training phase for Qwen2. This process is pivotal in enhancing its proficiency across a broad spectrum of domains, including coding, mathematics, logical reasoning, instruction following, and multilingual comprehension. Moreover, it ensures that the generation from the models is in harmony with human values, making it helpful, honest, and harmless. Unlike traditional methods that heavily rely on extensive human supervision, our approach focuses on scalable alignment with minimal human annotation (Cao et al., 2024). Specifically, we investigate methods to acquire high-quality demonstration and preference data for Supervised Fine-Tuning (SFT) and Reinforcement Learning from Human Feedback (RLHF), aiming to minimize the need for human labeling while maximizing the quality and reliability of the data.



大规模预训练后进入后训练: 抬代码,数学,逻辑,跟随,多语, 并让生成更 helpful / honest / harmless. 路径强调少人工标注的可扩展对齐; 研究如何为 SFT 与 RLHF 拿到高质演示与偏好数据.

### 4.1 POST-TRAINING DATA 后训练数据

The post-training data primarily consists of two components: demonstration data $\mathcal { D } = \{ ( x _ { i } , y _ { i } ) \}$ and preference data $\mathcal { P } = \{ ( x _ { i } , y _ { i } ^ { + } , y _ { i } ^ { - } ) \}$ , where $x _ { i }$ represents the instruction, $y _ { i }$ represents a satisfactory response, and $y _ { i } ^ { + }$ and $y _ { i } ^ { - }$ are two responses to $x _ { i } ,$ with $y _ { i } ^ { + }$ being the preferred choice over $y _ { i } ^ { - }$ . T h e set D is utilized in SFT, whereas $\mathcal { P }$ is employed in RLHF.

The construction of training data entails a two-step process: collaborative data annotation and automated data synthesis. First, we extract the data ontology from large-scale instruction corpora, leading to a broad and diverse set of high-quality instructions. These instructions are systematically enhanced to incorporate greater complexity. Through human annotation, we obtain the target response $y _ { i }$ and their positive and negative counterparts $\tilde { ( } y _ { i } ^ { + } , y _ { i } ^ { - } )$ . Subsequently, a variety of automated



后训练数据两块: 演示集 $\mathcal{D}=\{(x_i,y_i)\}$ 与偏好集 $\mathcal{P}=\{(x_i,y_i^+,y_i^-)\}$. $\mathcal{D}$ 供 SFT, $\mathcal{P}$ 供 RLHF. 构造分两步: 协作标注与自动合成. 先从大规模指令语料抽本体, 得到广覆盖高质指令并系统性加难; 人工标注得到目标回复与正负对照, 再进入自动合成.

<!-- page 7 of 26 -->

alignment strategies are employed to synthesize a substantial volume of artificially annotated data across the domains of code, mathematics, instruction-following, creation, role-playing, and safety.

#### 4.1.1 COLLABORATIVE DATA ANNOTATION 协作数据标注

**Automatic Ontology Extraction** The process initiates with the application of InsTag (Lu et al., 2024c), an open-set fine-grained tagger, to extract the underlying ontology from a large-scale instruction dataset. Subsequent manual refinement ensures the accuracy of the extracted ontology.

**Instruction Selection** Each instruction, with tags annotated, is evaluated for tag diversity, semantic richness, complexity, and intent completeness. Based on these criteria, we select a set of representative instructions (Dong et al., 2023).

**Instruction Evolution** To enrich the instruction dataset, a self-evolution strategy (Zhao et al., 2024) is employed, prompting the Qwen models to add constraints or requirements to existing instructions, thereby increasing their complexity and ensuring a diverse range of difficulty levels within the dataset.

**Human Annotation** Multiple responses to an instruction are obtained using diverse generation strategies and Qwen models of different scales. Annotators rank these responses based on their preferences, ensuring the best response meets established criteria, yielding both demonstration and preference data.



自动对齐策略在代码,数学,跟随,创作,角色扮演,安全等域合成大量「人工风格」标注数据.

**Automatic Ontology Extraction** 用 InsTag 从大规模指令集抽本体, 再人工校对.

**Instruction Selection** 按标签多样性,语义丰富度,复杂度,意图完整度筛代表指令.

**Instruction Evolution** 自我进化: 让 Qwen 给已有指令加约束 / 要求, 拉高复杂度与难度梯度.

**Human Annotation** 多策略,多尺度模型生成多回复, 标注员排序, 最好回复须达标, 同时得到演示与偏好数据.

#### 4.1.2 AUTOMATED DATA SYNTHESIS 自动数据合成

Maintaining the quality of annotations for responses to instructions presents significant challenges on a large scale, particularly those that require expertise, experience, carefulness, or patience. To address these challenges, we devised various automated alignment strategies to synthesize data at scale.

**Rejection Sampling** For mathematical or similar tasks with definitive final answers, rejection sampling (Yuan et al., 2023) is applied to improve the quality of solutions. Large language models (LLMs) are tasked to generate multiple responses, namely the reasoning paths, for each instruction. Paths that result in accurate conclusions and are considered reasonable by the model are preserved, serving as demonstration data. Preference data is generated by contrasting correct and incorrect paths.

**Execution Feedback** For coding tasks, LLMs are employed to generate solutions and associated test cases. The efficacy of these solutions is evaluated by compiling and executing them against the test cases, thereby creating demonstration and preference data. This methodology is also applicable to assessing instruction following (Dong et al., 2024). For each instruction with constraints, e.g., length limit, the LLM is tasked to generate a Python verification function to ensure the response aligns with the instruction requirements.

**Data Repurposing** Creating skilled responses in literary writing tasks is challenging for annotators without specialized training. To tackle this problem, we aggregate high-quality literary works from the public domain and employ LLMs to develop instructions with varying levels of detail. These instructions, paired with the original works, serve as demonstration data. For example, to compile roleplay data with vivid and engaging responses, we source detailed character profiles from knowledge repositories such as Wikipedia and instruct LLMs to generate corresponding instructions and responses (Lu et al., 2024b). This process, similar to a reading comprehension task, ensures that the integrity of the character's profile is maintained.

**Constitutional Feedback** Constitutional AI refers to the process of guiding LLMs to generate responses based on predefined sets of principles (Bai et al., 2022). To ensure adherence to guidelines such as safety and values, a constitution dataset was compiled. This dataset delineates principles to be followed and those to be avoided. It was used to instruct LLMs to produce responses that either are aligned with or deviated from these guidelines, serving as a reference for demonstration and preference data.



大规模上靠人工维持回复质量很难, 尤其需要专长,细心与耐心的题. 于是用自动对齐策略放量合成.

**Rejection Sampling** 对有明确终局答案的数学类题: 多样本生成推理路径, 保留结论正确且模型认为合理的路径作演示; 正误路径对照作偏好.

**Execution Feedback** 代码: 生成解与测试用例, 编译执行判定, 得到演示与偏好. 也可用于跟随评估: 对带约束指令, 让模型写 Python 校验函数检查回复是否满足要求.

**Data Repurposing** 文学写作难靠非专业标注员写出「高手回复」: 聚合公域高质作品, 让 LLM 生成不同细度的指令, 与原文配对作演示. 角色扮演则从 Wikipedia 等人设库取详细档案, 再生成指令与回复, 类似阅读理解, 保持人设一致.

**Constitutional Feedback** 按预定原则引导生成 (Constitutional AI). 编宪法数据集, 标明应遵循与应避免的原则, 生成合规 / 偏离对照, 供演示与偏好参考.

> **核对:** 后训练仍叫 RLHF, 优化器却是 DPO, 会不会打架?
> §4.3 写清: 离线用偏好集做 DPO; 在线用奖励模型挑最好 / 最差对再 DPO. 「RLHF」在这里是偏好对齐总称, 具体算法是 DPO, 不是 PPO.

<!-- page 8 of 26 -->

### 4.2 SUPERVISED FINE-TUNING 监督微调

We have assembled an extensive instruction dataset featuring more than 500,000 examples that cover skills such as instruction following, coding, mathematics, logical reasoning, role-playing, multilingualism, and safety. Our model was fine-tuned for two epochs with a sequence length of 32,768 tokens. To optimize learning, the learning rate was gradually decreased from $7 \times 1 \tilde { 0 } ^ { - 6 }$ to $7 \times 1 0 ^ { - 7 }$ . To address overfitting, we applied a weight decay of 0.1 and gradients were clipped at a maximum value of 1.0.



指令数据超过 500,000 条, 覆盖跟随,代码,数学,逻辑,角色,多语,安全. 微调 2 epoch, 序列长 32,768; 学习率从 $7\times10^{-6}$ 降到 $7\times10^{-7}$; weight decay 0.1, 梯度裁剪 1.0.

### 4.3 REINFORCEMENT LEARNING FROM HUMAN FEEDBACK 来自人类反馈的强化学习

Our training regime for RLHF comprises two sequential stages: offline and online training. In the offline training stage, we use a pre-compiled preference dataset $\mathcal { P }$ to maximize the difference in likelihood between $y _ { i } ^ { + }$ and $y _ { i } ^ { - }$ with Direct Preference Optimization (DPO, Rafailov et al., 2023). In the online training stage, the model iteratively refines its performance in real-time, leveraging reward models for immediate feedback. Specifically, we sample multiple responses from the current policy model, and the reward model selects the most and the least preferred responses, forming preference pairs that are used for DPO in each episode. Moreover, we employ Online Merging Optimizer (Lu et al., 2024a) to mitigate the alignment tax, i.e., the performance degradation associated with aligning model generation with human preferences.



RLHF 分两段. 离线: 用预编译偏好集 $\mathcal{P}$, 以 DPO 拉大 $y_i^+$ 与 $y_i^-$ 的似然差. 在线: 当前策略多样本采样, 奖励模型挑最好与最差组成偏好对, 每轮再做 DPO. 另用 Online Merging Optimizer 减轻 alignment tax (对齐人类偏好时的能力掉点).

## 5 EVALUATION 评测

To thoroughly assess the Qwen2 models, consisting of both base and instruction-tuned models, we implement a comprehensive evaluation protocol. This protocol examines a range of competencies, including general knowledge understanding, language comprehension, generation, coding, mathematics, reasoning, and additional areas of expertise. Specifically, base models are assessed using established benchmark datasets for large language models (LLMs), with responses elicited through few-shot prompting, unless specified otherwise. For instruction-tuned models, in addition to benchmark evaluations, we prioritize human preference assessments.



对 Base 与 Instruct 做综合评测: 知识,理解,生成,代码,数学,推理等. Base 默认 few-shot 基准; Instruct 在基准之外更看重人类偏好评估.

### 5.1 BASE LANGUAGE MODELS Base 语言模型

In this section, we illustrate the evaluation of the base language models of the Qwen2 series. Specifically, we evaluate the models on benchmark datasets for knowledge and basic capabilities and apply multilingual benchmark datasets to evaluate their support of languages. As there are multiple model sizes, we compare them with the state-of-the-art (SOTA) models of similar or larger sizes.



本节评 Base: 知识与基础能力基准 + 多语基准; 各规模与相近或更大的 SOTA 对照.

#### 5.1.1 CORE CAPABILITIES 核心能力

**Benchmarks and Evaluation Protocol** The common practice of evaluating the core capabilities of base language models is the implementation of benchmark dataset evaluation with few-shot or zero-shot prompting. The evaluation mainly focuses on the model performance of natural language understanding, general question answering, coding, mathematics, scientific knowledge, reasoning, etc. The datasets for evaluation include MMLU (Hendrycks et al., 2021a) (5-shot), MMLU-Pro (Wang et al., 2024) (5-shot), GPQA (Rein et al., 2023) (5shot), Theorem QA (Chen et al., 2023a) (5-shot), BBH (Suzgun et al., 2023) (3-shot), HellaSwag (Zellers et al., 2019) (10-shot), Winogrande (Sakaguchi et al., 2021) (5-shot), TruthfulQA (Lin et al., 2022a) (0-shot), ARC-C (Clark et al., 2018) (25-shot), HumanEval (Chen et al., 2021) (0-shot), MBPP (Austin et al., 2021) (0-shot), EvalPlus(Liu et al., 2023a) (0-shot), MultiPL-E (Cassano et al., 2023) (0-shot on Python, C++, Java, PHP, Type-Script, C#, Bash, and JavaScript), GSM8K (Cobbe et al., 2021) (5-shot), MATH (Hendrycks et al., 2021b) (4-shot), C-Eval (Huang et al., 2023) (5-shot), and CMMLU (Li et al., 2023) (5-shot). Multi-lingual datasets can be grouped into four categories: (a) Exam: M3Exam (5-shot, we only choose examples that require no image), IndoMMLU (Koto et al., 2023) (3-shot), ruMMLU (Fenogenova et al., 2024) (5-shot), and translated MMLU (Chen et al., 2023b) (5-shot on Arabic, Spanish, French, Portuguese, German, Italian, Japanese, and Korean); (b) Understanding: BELEBELE (Bandarkar et al., 2023) (5-shot), XCOPA (Ponti et al., 2020) (5-shot), XWinograd (Muennighoff et al., 2023) (5-shot), XStoryCloze (Lin et al., 2022b) (0-shot) and PAWS-X (Yang et al., 2019) (5-shot); (c)



**Benchmarks and Evaluation Protocol** Base 核心能力常用 few-shot / zero-shot 基准, 覆盖理解,问答,代码,数学,科学,推理等. 英文与中文集合及 shot 数见上文枚举; 多语分成 Exam,Understanding 等桶 (本页表格跨到下页).

<!-- page 9 of 26 -->

Table 2: Performance of the 70B+ models. We compare Qwen2-72B with the baselines, including Mixtral-8x22B, Llama-3-70B, Qwen1.5-110B, and Qwen1.5-72B. For most datasets, Qwen2-72B demonstrates advantages over the baselines.



表 2: 70B+ 模型表现. 对照 Mixtral-8x22B,Llama-3-70B,Qwen1.5-110B,Qwen1.5-72B. 多数数据集上 Qwen2-72B 占优.

<table><tr><td>Datasets</td><td>Mixtral-8x22B</td><td>Llama-3-70B</td><td>Qwen1.5-72B</td><td>Qwen1.5-110B</td><td>Qwen2-72B</td></tr><tr><td colspan="6">English</td></tr><tr><td>MMLU</td><td>77.8</td><td>79.5</td><td>77.5</td><td>80.4</td><td>84.2</td></tr><tr><td>MMLU-Pro</td><td>49.5</td><td>52.8</td><td>45.8</td><td>49.4</td><td>55.6</td></tr><tr><td>GPQA</td><td>34.3</td><td>36.3</td><td>36.3</td><td>35.9</td><td>37.9</td></tr><tr><td>Theorem QA</td><td>35.9</td><td>32.3</td><td>29.3</td><td>34.9</td><td>43.1</td></tr><tr><td>BBH</td><td>78.9</td><td>81.0</td><td>65.5</td><td>74.8</td><td>82.4</td></tr><tr><td>HellaSwag</td><td>88.7</td><td>88.0</td><td>86.0</td><td>87.5</td><td>87.6</td></tr><tr><td>Winogrande</td><td>85.0</td><td>85.3</td><td>83.0</td><td>83.5</td><td>85.1</td></tr><tr><td>ARC-C</td><td>70.7</td><td>68.8</td><td>65.9</td><td>69.6</td><td>68.9</td></tr><tr><td>TruthfulQA</td><td>51.0</td><td>45.6</td><td>59.6</td><td>49.6</td><td>54.8</td></tr><tr><td colspan="6">Coding</td></tr><tr><td>HumanEval</td><td>46.3</td><td>48.2</td><td>46.3</td><td>54.3</td><td>64.6</td></tr><tr><td>MBPP</td><td>71.7</td><td>70.4</td><td>66.9</td><td>70.9</td><td>76.9</td></tr><tr><td>EvalPlus</td><td>54.1</td><td>54.8</td><td>52.9</td><td>57.7</td><td>65.4</td></tr><tr><td>MultiPL-E</td><td>46.7</td><td>46.3</td><td>41.8</td><td>52.7</td><td>59.6</td></tr><tr><td colspan="6">Mathematics</td></tr><tr><td>GSM8K</td><td>83.7</td><td>83.0</td><td>79.5</td><td>85.4</td><td>89.5</td></tr><tr><td>MATH</td><td>41.7</td><td>42.5</td><td>34.1</td><td>49.6</td><td>51.1</td></tr><tr><td colspan="6">Chinese</td></tr><tr><td>C-Eval</td><td>54.6</td><td>65.2</td><td>84.1</td><td>89.1</td><td>91.0</td></tr><tr><td>CMMLU</td><td>53.4</td><td>67.2</td><td>83.5</td><td>88.3</td><td>90.1</td></tr><tr><td colspan="6">Multilingual</td></tr><tr><td>Exam</td><td>63.5</td><td>70.0</td><td>66.4</td><td>75.6</td><td>76.6</td></tr><tr><td>Understanding</td><td>77.7</td><td>79.9</td><td>78.2</td><td>78.2</td><td>80.7</td></tr><tr><td>Mathematics</td><td>62.9</td><td>67.1</td><td>61.7</td><td>64.4</td><td>76.0</td></tr><tr><td>Translation</td><td>23.3</td><td>38.0</td><td>35.6</td><td>36.2</td><td>37.8</td></tr></table>

Mathematics: MGSM (Goyal et al., 2022) (8-shot CoT); and (d) Translation: Flores-101 (Goyal et al., 2022) (5-shot).



多语其余两类: (c) Mathematics: MGSM (8-shot CoT); (d) Translation: Flores-101 (5-shot).

**Qwen2-72B** In terms of the largest model of Qwen2, we compare Qwen2-72B with competitive baseline open-weight models, including Mixtral-8x22B (Jiang et al., 2024), Llama-3-70B (AI@Meta, 2024), as well as Qwen1.5-72B (Qwen Team, 2024a) and Qwen1.5-110B (Qwen Team, 2024b). The results are reported in Table 2. Qwen2-72B outperforms Llama-3-70B in general **knowledge** understanding on both MMLU and MMLU-Pro, achieving accuracy improvements of 4.7 and 2.8, respectively. In **scientific** assessments, Qwen2-72B demonstrates superiority over Llama-3-70B with enhancements of 1.6 and 9.8 on GPQA and Theorem QA. Upon enrichment of **coding** data, Qwen2-72B exhibits a significant 18.3 and 10.0 percentage point advantage over Qwen1.5-72B in HumanEval and MBPP evaluations. Enhanced **mathematics**-related data allows Qwen2-72B to outperform Qwen1.5-72B by 10.0 and 17.0 percentage points in the GSM8K and MATH benchmarks. Qwen2-72B displays **reasoning** capabilities equivalent to Llama-3-70B, considering BBH, Winogrande, and ARC-C, attributable to its improved coding and mathematical data. In assessing language understanding in **Chinese**, Qwen2-72B significantly outperforms Mixtral-8x22B and Llama-3-70B, and also outperforms Qwen1.5-72B.



**Qwen2-72B** 与 Mixtral-8x22B,Llama-3-70B,Qwen1.5-72B/110B 对照, 见 Table 2. 相对 Llama-3-70B: MMLU / MMLU-Pro 高 4.7 / 2.8; GPQA / Theorem QA 高 1.6 / 9.8. 相对 Qwen1.5-72B: HumanEval / MBPP 高 18.3 / 10.0 个百分点; GSM8K / MATH 高 10.0 / 17.0 个百分点. 推理 (BBH,Winogrande,ARC-C) 与 Llama-3-70B 相当. 中文理解显著强于 Mixtral 与 Llama-3-70B, 也强于 Qwen1.5-72B.

**Qwen2-57B-A14B** For the evaluation of the MoE model, Qwen2-57B-A14B is compared against baselines of similar sizes. These baselines include other MoE models, such as Mixtral-8x7B (Jiang et al., 2024) and Jamba (Lieber et al., 2024), and dense models, such as Yi-1.5-34B (Young et al., 2024)



**Qwen2-57B-A14B** 与相近规模基线对照: MoE 如 Mixtral-8x7B,Jamba; Dense 如 Yi-1.5-34B (续下页).

> **对一下:** Table 2 里 HellaSwag 上 Mixtral 88.7 高于 Qwen2-72B 的 87.6, 和「多数占优」矛盾吗?
> 不矛盾. 正文说 for most datasets; 常识补全类个别项对手更高, 旗舰优势主要落在知识,代码,数学与中文.

<!-- page 10 of 26 -->

Table 3: Performance of the 30B+ dense models and 40B+ MoE models. Qwen2-57B-A14B, an MoE model with a total of 57 billion parameters and 14 billion activated parameters, is designed to match the performance of 30 billion parameter dense models. This comparison includes dense model baselines: Yi-1.5-34B and Qwen1.5-32B, as well as MoE baselines: Mixtral-8x7B and Jamba. Results demonstrate that Qwen2-57B-A14B achieves competitive performance overall, with a notable superiority in coding and mathematics tasks.



表 3: 30B+ Dense 与 40B+ MoE. 57B-A14B 目标对齐约 30B Dense; 对照 Yi-1.5-34B,Qwen1.5-32B,Mixtral-8x7B,Jamba. 总体可比, 代码与数学更亮.

<table><tr><td>Datasets</td><td>Jamba</td><td>Mixtral-8x7B</td><td>Yi-1.5-34B</td><td>Qwen1.5-32B</td><td>Qwen2-57B-A14B</td></tr><tr><td>Architecture</td><td>MoE</td><td>MoE</td><td>Dense</td><td>Dense</td><td>MoE</td></tr><tr><td># Act Params</td><td>12B</td><td>12B</td><td>32B</td><td>34B</td><td>14B</td></tr><tr><td># Params</td><td>52B</td><td>47B</td><td>32B</td><td>34B</td><td>57B</td></tr><tr><td colspan="6">English</td></tr><tr><td>MMLU</td><td>67.4</td><td>71.8</td><td>77.1</td><td>74.3</td><td>76.5</td></tr><tr><td>MMLU-Pro</td><td>-</td><td>41.0</td><td>48.3</td><td>44.0</td><td>43.0</td></tr><tr><td>GPQA</td><td>-</td><td>29.2</td><td>-</td><td>30.8</td><td>34.3</td></tr><tr><td>Theorem QA</td><td>-</td><td>23.2</td><td>-</td><td>28.8</td><td>33.5</td></tr><tr><td>BBH</td><td>45.4</td><td>50.3</td><td>76.4</td><td>66.8</td><td>67.0</td></tr><tr><td>HellaSwag</td><td>87.1</td><td>86.5</td><td>85.9</td><td>85.0</td><td>85.2</td></tr><tr><td>Winogrande</td><td>82.5</td><td>81.9</td><td>84.9</td><td>81.5</td><td>79.5</td></tr><tr><td>ARC-C</td><td>64.4</td><td>66.0</td><td>65.6</td><td>63.6</td><td>64.1</td></tr><tr><td>TruthfulQA</td><td>46.4</td><td>51.1</td><td>53.9</td><td>57.4</td><td>57.7</td></tr><tr><td colspan="6">Coding</td></tr><tr><td>HumanEval</td><td>29.3</td><td>37.2</td><td>46.3</td><td>43.3</td><td>53.0</td></tr><tr><td>MBPP</td><td>-</td><td>63.9</td><td>65.5</td><td>64.2</td><td>71.9</td></tr><tr><td>EvalPlus</td><td>-</td><td>46.4</td><td>51.9</td><td>50.4</td><td>57.2</td></tr><tr><td>MultiPL-E</td><td>-</td><td>39.0</td><td>39.5</td><td>38.5</td><td>49.8</td></tr><tr><td colspan="6">Mathematics</td></tr><tr><td>GSM8K</td><td>59.9</td><td>62.5</td><td>82.7</td><td>76.8</td><td>80.7</td></tr><tr><td>MATH</td><td>-</td><td>30.8</td><td>41.7</td><td>36.1</td><td>43.0</td></tr><tr><td colspan="6">Chinese</td></tr><tr><td>C-Eval</td><td>-</td><td>-</td><td>-</td><td>83.5</td><td>87.7</td></tr><tr><td>CMMLU</td><td>-</td><td>-</td><td>84.8</td><td>82.3</td><td>88.5</td></tr><tr><td colspan="6">Multilingual</td></tr><tr><td>Exam</td><td>-</td><td>56.1</td><td>58.3</td><td>61.6</td><td>65.5</td></tr><tr><td>Understanding</td><td>-</td><td>70.7</td><td>73.9</td><td>76.5</td><td>77.0</td></tr><tr><td>Mathematics</td><td>-</td><td>45.0</td><td>49.3</td><td>56.1</td><td>62.3</td></tr><tr><td>Translation</td><td>-</td><td>29.8</td><td>30.0</td><td>33.5</td><td>34.5</td></tr></table>

and Qwen1.5-32B (Qwen Team, 2024a), both of which have approximately 30 billion parameters. The results are shown in Table 3. We anticipate that Qwen2-57B-A14B, which activates 14 billion parameters, will match the performance of a 30 billion parameter dense equivalent Qwen2 model. Our evaluation reveals that Qwen2-57B-A14B performs comparably to Yi-1.5-34B in natural language understanding tasks. Moreover, it outperforms the baseline models in coding and mathematics tasks. Additionally, Qwen2-57B-A14B demonstrates robust Chinese language understanding capabilities, rivaling the larger Qwen2-72B model. In essence, Qwen2-57B-A14B is an efficient model that, while activating only 14 billion parameters per forward pass, maintains the performance level of a 30 billion parameter dense model.

**Qwen2-7B** The 7B model is widely utilized, as it enables the execution in 16-bit floating points on accelerators equipped with 16GB memory. Our focus is on comparing this model with other leading 7B models, including Llama-3-8B, which has recently demonstrated exceptional performance in the Chatbot Arena (Chiang et al., 2024). This comparison also includes Mistral-7B-v0.2 (Jiang et al., 2023a), Gemma-7B (Mesnard et al., 2024), and our predecessor, Qwen1.5-7B (Qwen Team, 2024a).



以及约 30B 的 Qwen1.5-32B. 结果见表 3. 预期激活 14B 的 57B-A14B 能对齐约 30B Dense; 实测理解与 Yi-1.5-34B 可比, 代码与数学超过基线, 中文理解强劲甚至逼近更大的 72B. 一句话: 每步只激活 14B, 性能贴近 30B Dense.

**Qwen2-7B** 常见于 16GB 显存上跑 16-bit. 对照 Llama-3-8B,Mistral-7B-v0.2,Gemma-7B,Qwen1.5-7B.

<!-- page 11 of 26 -->

Table 4: Performance of the 7B+ models. We compare Qwen2-7B with previously released state-of-the-art 7B+ models including Mixtral-7B, Gemma-7B, Llama-3-8B, and our previous Qwen1.5-7B. Qwen2-7B demonstrates significant advantages over the baselines in most of the evaluation datasets.



表 4: 7B+ 模型. 对照 Mistral-7B,Gemma-7B,Llama-3-8B,Qwen1.5-7B. 多数数据集上 Qwen2-7B 明显占优.

<table><tr><td>Datasets</td><td>Mistral-7B</td><td>Gemma-7B</td><td>Llama-3-8B</td><td>Qwen1.5-7B</td><td>Qwen2-7B</td></tr><tr><td colspan="6">English</td></tr><tr><td>MMLU</td><td>64.2</td><td>64.6</td><td>66.6</td><td>61.0</td><td>70.3</td></tr><tr><td>MMLU-Pro</td><td>30.9</td><td>33.7</td><td>35.4</td><td>29.9</td><td>40.0</td></tr><tr><td>GPQA</td><td>24.7</td><td>25.7</td><td>25.8</td><td>26.7</td><td>31.8</td></tr><tr><td>Theorem QA</td><td>19.2</td><td>21.5</td><td>22.1</td><td>14.2</td><td>31.1</td></tr><tr><td>BBH</td><td>56.1</td><td>55.1</td><td>57.7</td><td>40.2</td><td>62.6</td></tr><tr><td>HellaSwag</td><td>83.2</td><td>82.2</td><td>82.1</td><td>78.5</td><td>80.7</td></tr><tr><td>Winogrande</td><td>78.4</td><td>79.0</td><td>77.4</td><td>71.3</td><td>77.0</td></tr><tr><td>ARC-C</td><td>60.0</td><td>61.1</td><td>59.3</td><td>54.2</td><td>60.6</td></tr><tr><td>TruthfulQA</td><td>42.2</td><td>44.8</td><td>44.0</td><td>51.1</td><td>54.2</td></tr><tr><td colspan="6">Coding</td></tr><tr><td>HumanEval</td><td>29.3</td><td>37.2</td><td>33.5</td><td>36.0</td><td>51.2</td></tr><tr><td>MBPP</td><td>51.1</td><td>50.6</td><td>53.9</td><td>51.6</td><td>65.9</td></tr><tr><td>Evalplus</td><td>36.4</td><td>39.6</td><td>40.3</td><td>40.0</td><td>54.2</td></tr><tr><td>MultiPL-E</td><td>29.4</td><td>29.7</td><td>22.6</td><td>28.1</td><td>46.3</td></tr><tr><td colspan="6">Mathematics</td></tr><tr><td>GSM8K</td><td>52.2</td><td>46.4</td><td>56.0</td><td>62.5</td><td>79.9</td></tr><tr><td>MATH</td><td>13.1</td><td>24.3</td><td>20.5</td><td>20.3</td><td>44.2</td></tr><tr><td colspan="6">Chinese</td></tr><tr><td>C-Eval</td><td>47.4</td><td>43.6</td><td>49.5</td><td>74.1</td><td>83.2</td></tr><tr><td>CMMLU</td><td>-</td><td>-</td><td>50.8</td><td>73.1</td><td>83.9</td></tr><tr><td colspan="6">Multilingual</td></tr><tr><td>Exam</td><td>47.1</td><td>42.7</td><td>52.3</td><td>47.7</td><td>59.2</td></tr><tr><td>Understanding</td><td>63.3</td><td>58.3</td><td>68.6</td><td>67.6</td><td>72.0</td></tr><tr><td>Mathematics</td><td>26.3</td><td>39.1</td><td>36.3</td><td>37.3</td><td>57.5</td></tr><tr><td>Translation</td><td>23.3</td><td>31.2</td><td>31.9</td><td>28.4</td><td>31.5</td></tr></table>

The results can be found in Table 4. Qwen2-7B demonstrates superior performance across most datasets compared to other models, particularly excelling in coding tasks, mathematics, and Chinese language tasks. It also shows strong performance in multilingual understanding and exams. This indicates that Qwen2-7B has been optimized for a wide range of language and logic-based tasks, showcasing its versatility and advanced capabilities.

**Qwen2-1.5B & Qwen2-0.5B** To evaluate the performance of our smaller models, specifically Qwen2-1.5B and Qwen2-0.5B, we compare them against established baselines: Phi-2 (Abdin et al., 2024), Gemma-2B (Mesnard et al., 2024), and Qwen1.5-1.8B (Qwen Team, 2024a). The results are given in Table 5. In language understanding, Qwen2-1.5B outperforms Phi-2, a model trained on textbook-like data. For coding tasks, Qwen2-0.5B matches the performance of Gemma-2B and Qwen1.5-1.8B, while Qwen2-1.5B surpasses these baselines, except for Phi-2. Both Qwen2 models exhibit superior performance in mathematics compared to their competitors. In terms of general reasoning, we find that Phi-2 generally outperforms all others, which to some extent reflects the significance of textbook data for reasoning capabilities. In TruthfulQA, Qwen2-1.5B performs the best, demonstrating that smaller models does not necessarily suffer from hallucination. In Chinese language understanding, both Qwen2 models outperform all the others, a trend consistent with larger models in their respective comparisons.

In general, the Qwen2 series demonstrates superior performance against the baselines across different model sizes. Notably, Qwen2-72B exhibits the highest performance among all Qwen2 models, underscoring the efficacy of model size scaling.



结果见表 4. Qwen2-7B 多数数据集领先, 代码,数学,中文尤其突出, 多语理解与考试也不弱.

**Qwen2-1.5B & Qwen2-0.5B** 对照 Phi-2,Gemma-2B,Qwen1.5-1.8B, 见表 5. 理解上 1.5B 超过教科书风的 Phi-2; 代码上 0.5B 与 Gemma-2B / Qwen1.5-1.8B 持平, 1.5B 超过后两者 (Phi-2 除外); 数学双模型都更强; 通用推理仍多是 Phi-2 更好, 侧面说明教科书数据对推理的价值; TruthfulQA 上 1.5B 最好, 说明小模型未必更幻觉; 中文两项双模型全面领先. 总体各档相对基线占优; 系列内仍是 72B 最强, 呼应模型规模缩放.

<!-- page 12 of 26 -->

Table 5: Performance of the smaller models. We compare our Qwen2-0.5B and Qwen2-1.5B with the previous SOTA small models including Phi-2, Gemma-2B and Qwen1.5-1.8B. Qwen2-0.5B with a much smaller model size achieves competitive performance, and Qwen2-1.5B significantly outperforms Qwen2-0.5B.



表 5: 更小模型. 对照 Phi-2,Gemma-2B,Qwen1.5-1.8B. 0.5B 以更小体积保持竞争力; 1.5B 明显强于 0.5B.

| Datasets | Phi-2 | Gemma-2B | Qwen1.5-1.8B | Qwen2-0.5B | Qwen2-1.5B |
| --- | --- | --- | --- | --- | --- |
| # Non-Emb Params | 2.5B | 2.0B | 1.2B | 0.3B | 1.2B |
| MMLU | 52.7 | 42.3 | 46.8 | 45.4 | 56.5 |
| MMLU-Pro | - | 15.9 | - | 14.7 | 21.8 |
| Theorem QA | - | - | - | 8.9 | 15.0 |
| BBH | 43.4 | 35.2 | 24.2 | 28.4 | 37.2 |
| HellaSwag | 73.1 | 71.4 | 61.4 | 49.3 | 66.6 |
| Winogrande | 74.4 | 66.8 | 60.3 | 56.8 | 66.2 |
| ARC-C | 61.1 | 48.5 | 37.9 | 31.5 | 43.9 |
| TruthfulQA | 44.5 | 33.1 | 39.4 | 39.7 | 45.9 |
| HumanEval | 47.6 | 22.0 | 20.1 | 22.0 | 31.1 |
| MBPP | 55.0 | 29.2 | 18.0 | 22.0 | 37.4 |
| GSM8K | 57.2 | 17.7 | 38.4 | 36.5 | 58.5 |
| MATH | 3.5 | 11.8 | 10.1 | 10.7 | 21.7 |
| C-Eval | 23.4 | 28.0 | 59.7 | 58.2 | 70.6 |
| CMMLU | 24.2 | - | 57.8 | 55.1 | 70.3 |

### 5.2 INSTRUCTION-TUNED MODEL 指令微调模型

To critically evaluate instruction-tuned models, we implement a multifaceted approach. Assessments of foundational skills and human preferences are conducted using open datasets and benchmarks. Our detailed in-house examinations further probe model competencies in key areas. A particular focus is placed on assessing long context capability. Safety measures include multilingual safety assessments and red teaming exercises. The following sections detail the evaluation methods and their outcomes.



Instruct 评测多管齐下: 开放基准看基础能力与人类偏好; 内部集探关键能力; 长上下文单独加压; 安全含多语安全与红队. 下文分节给出方法与结果.

#### 5.2.1 OPEN BENCHMARK EVALUATION 开放基准评测

To comprehensively evaluate the quality of instruction-tuned models, we compile automatic and human evaluation to assess the capabilities and human preference. For the evaluation of basic capabilities, we apply similar datasets in the pre-trained model evaluation, which target on natural language understanding, coding, mathematics, and reasoning. Specifically, we evaluate on MMLU, MMLU-Pro, GPQA, and Theorem QA for language understanding and knowledge, HumanEval, MBPP, MultiPL-E, and LiveCodeBench v1 (Jain et al., 2024) for coding, GSM8K and MATH for mathematics. Additionally, we assess the performance of human preference alignment and instruction following by evaluating on benchmarks including MT-Bench (Zheng et al., 2023), Arena-Hard (Li et al., 2024), AlignBench (Liu et al., 2023b), MixEval (Ni et al., 2024) whose results approximate those of Chatbot Arena, and IFEval (Zhou et al., 2023)<sup>4</sup>for instruction following.

**Qwen2-72B-Instruct** We compare Qwen2-72B-Instruct against the instruction-tuned models including Mixtral-8x22B-Instruct, Llama-3-70B-Instruct, as well as Qwen1.5-72B-Chat. The results are presented in Table 6. It can be found that a strong base language model can help boost the downstream performance of the instruction-tuned model. Specifically, Qwen2-72B-Instruct outshines its peers in areas such as language understanding, coding, and mathematics, with the exception of GPQA and MBPP. Regarding human preference alignment and instruction following, Qwen2-72B has significant advantages over the baselines. We assume this achievement is attributed to both the high-quality pre-trained model and improvements in both data and training techniques for post-training.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>For simplicity, we report the results of the subset strict-prompt.</span></small>



综合自动与人类评测. 基础能力沿用与 Base 相近的理解 / 代码 / 数学集, 并加 LiveCodeBench v1; 偏好与跟随用 MT-Bench,Arena-Hard,AlignBench,MixEval,IFEval (脚注: 只报 strict-prompt 子集).

**Qwen2-72B-Instruct** 对照 Mixtral-8x22B-Instruct,Llama-3-70B-Instruct,Qwen1.5-72B-Chat, 见表 6. 强 Base 有助于抬 Instruct; 理解,代码,数学多数领先 (GPQA,MBPP 例外); 偏好对齐与跟随优势明显, 归因于高质 Base 与后训练数据 / 技法改进.

<!-- page 13 of 26 -->

Table 6: Performance of 70B+ instruction-tuned models. We compare Qwen2-72B-Instruct with Mixtral-8x22B-Instruct, Llama-3-70B-Instruct, Qwen1.5-72B-Chat, and Qwen1.5-110B-Chat. "- Instruct" or "-Chat" is omitted in the table. Qwen2-72B-Instruct demonstrates advantages in core capabilities, and superior performance in human preference alignment.



表 6: 70B+ Instruct. 对照 Mixtral-8x22B,Llama-3-70B,Qwen1.5-72B/110B (表中省略 -Instruct/-Chat). 核心能力占优, 人类偏好对齐更强.

<table><tr><td>Datasets</td><td>Mixtral-8x22B</td><td>Llama-3-70B</td><td>Qwen1.5-72B</td><td>Qwen1.5-110B</td><td>Qwen2-72B</td></tr><tr><td colspan="6">English</td></tr><tr><td>MMLU</td><td>74.0</td><td>82.0</td><td>75.6</td><td>76.5</td><td>82.3</td></tr><tr><td>MMLU-Pro</td><td>56.1</td><td>56.2</td><td>51.7</td><td>50.5</td><td>64.4</td></tr><tr><td>GPQA</td><td>49.7</td><td>41.9</td><td>39.4</td><td>32.8</td><td>42.4</td></tr><tr><td>Theorem QA</td><td>40.8</td><td>42.5</td><td>28.8</td><td>18.8</td><td>44.4</td></tr><tr><td colspan="6">Coding</td></tr><tr><td>HumanEval</td><td>73.8</td><td>81.7</td><td>71.3</td><td>74.4</td><td>86.0</td></tr><tr><td>MBPP</td><td>75.9</td><td>82.3</td><td>71.9</td><td>76.4</td><td>80.2</td></tr><tr><td>MultiPL-E</td><td>61.1</td><td>63.4</td><td>48.1</td><td>55.4</td><td>69.2</td></tr><tr><td>LiveCodeBench v1</td><td>21.8</td><td>29.3</td><td>17.9</td><td>25.3</td><td>35.7</td></tr><tr><td colspan="6">Mathematics</td></tr><tr><td>GSM8K</td><td>89.1</td><td>93.0</td><td>82.7</td><td>84.5</td><td>93.2</td></tr><tr><td>MATH</td><td>47.4</td><td>50.4</td><td>42.5</td><td>42.0</td><td>69.0</td></tr><tr><td colspan="6">Alignment</td></tr><tr><td>MT-Bench</td><td>8.66</td><td>8.95</td><td>8.61</td><td>8.88</td><td>9.12</td></tr><tr><td>MixEval</td><td>82.3</td><td>84.0</td><td>84.1</td><td>85.7</td><td>86.7</td></tr><tr><td>Arena-Hard</td><td>36.4</td><td>41.1</td><td>36.1</td><td>39.8</td><td>48.1</td></tr><tr><td>IFEval strict-prompt</td><td>67.1</td><td>77.3</td><td>55.8</td><td>57.5</td><td>77.6</td></tr><tr><td>AlignBench</td><td>-</td><td>7.42</td><td>7.28</td><td>7.87</td><td>8.27</td></tr></table>

**Qwen2-57B-A14B-Instruct** For medium-size models, we compare Qwen2-57B-A14B-Instruct with Mixtral-8x7B-Instruct, another MoE baseline, as well as the dense SOTA models with over 30 billion parameters, e.g., Yi-1.5-34B-Chat and Qwen1.5-32B-Chat. The results are provided in Table 7. Compared with Qwen1.5-32B-Chat, Qwen2-57B-A14B-Instruct reaches superior performance in almost all benchmarks, and compared with the 30B SOTA model Yi-1.5-34B-Chat, Qwen2-57B-A14B-Instruct has gained advantages in most evaluations except for those for mathematics. In terms of the evaluation for alignment, the advantages of Qwen2-57B-A14B-Instruct are notably evident.

**Qwen2-7B-Instruct** Within the spectrum of 7B to 9B models, we compare Qwen2-7B-Instruct with Llama-3-8B-Instruct, Yi-1.5-9B-Chat, GLM-4-9B-Chat, and Qwen1.5-7B-Chat. The results can be found in Table 8. Qwen2-7B-Instruct demonstrates substantial advancements compared to its predecessor, Qwen1.5-7B-Chat, across comprehensive evaluations, notably achieving higher scores in coding and mathematics-related tasks. Compared with the recent SOTA model, Llama-3-8B-Instruct, Qwen2-7B-Instruct demonstrates competitive performance and specifically it achieves superior performance in coding. Nonetheless, in terms of instruction following, Qwen2-7B-Instruct greatly falls behind the competitor. To address this limitation, we plan to augment the 7B model's instruction-following ability by enhancing the quality of post-training data, ensuring a more robust understanding and execution of complex commands.

**Qwen2-1.5B-Instruct & Qwen2-0.5B-Instruct** In the context of smaller models, we compare Qwen2-0.5B-Instruct with Qwen1.5-0.5B-Chat, and Qwen2-1.5B-Instruct with Qwen1.5-1.8B-Chat. Notably, the complexity of certain datasets designed for larger models exceeds the capabilities of these smaller models; thus, our analysis focuses on a selected subset. As detailed in Table 9, the Qwen2 models demonstrate a marked advantage over their predecessors in both core capabilities and instruction-following tasks. The achievement mainly attributes to the scaling of pre-training data. Consequently, our results affirm that data scaling remains an effective strategy for enhancing model performance, even in the domain of sub-billion parameter models.



**Qwen2-57B-A14B-Instruct** 对照 Mixtral-8x7B-Instruct,Yi-1.5-34B-Chat,Qwen1.5-32B-Chat, 见表 7. 相对 Qwen1.5-32B-Chat 几乎全面领先; 相对 Yi-1.5-34B-Chat 多数项占优,数学除外; 对齐评测优势明显.

**Qwen2-7B-Instruct** 对照 Llama-3-8B-Instruct,Yi-1.5-9B-Chat,GLM-4-9B-Chat,Qwen1.5-7B-Chat, 见表 8. 相对前代全面抬升, 代码与数学尤其明显; 对 Llama-3-8B-Instruct 总体可比,代码更强, 但跟随明显落后. 计划靠提高后训练数据质量补 7B 跟随.

**Qwen2-1.5B-Instruct & Qwen2-0.5B-Instruct** 对照 Qwen1.5 同档小 Chat; 部分为大模型设计的集超出小模型能力, 故只报子集. Table 9 显示核心能力与跟随都明显超过前代, 主因归因于预训练数据缩放, 说明亚十亿参数档数据缩放仍有效.

> **停一下:** 摘要 MT-Bench 写 9.1, Table 6 写 9.12, 交稿引用哪一个?
> 对表用 9.12; 摘要是四舍五入. Arena-Hard 48.1 与 LiveCodeBench 35.7 与表一致.

<!-- page 14 of 26 -->

Table 7: Performance of 30B+ dense and 40B+ MoE instruction-tuned models. We compare Qwen2-57B-A14B-Instruct with the similar-size MoE model Mixtral-8x7B-Instruct, 30B dense models such as Yi-1.5-34B-Chat and Qwen1.5-32B-Chat. "-Instruct" or "-Chat" is omitted in the table. Qwen2-57B-A14B-Instruct is competitive with the recent SOTA 30B dense models, and significantly outcompetes the MoE baseline.



表 7: 30B+ Dense 与 40B+ MoE Instruct. 对照 Mixtral-8x7B,Yi-1.5-34B,Qwen1.5-32B. 与近期 30B Dense SOTA 可比, 明显强于 MoE 基线.

<table><tr><td>Datasets</td><td>Mixtral-8x7B</td><td>Yi-1.5-34B</td><td>Qwen1.5-32B</td><td>Qwen2-57B-A14B</td></tr><tr><td>Architecture</td><td>MoE</td><td>Dense</td><td>Dense</td><td>MoE</td></tr><tr><td># Act Params</td><td>12B</td><td>32B</td><td>34B</td><td>14B</td></tr><tr><td># Params</td><td>47B</td><td>32B</td><td>34B</td><td>57B</td></tr><tr><td colspan="5">English</td></tr><tr><td>MMLU</td><td>71.4</td><td>76.8</td><td>74.8</td><td>75.4</td></tr><tr><td>MMLU-Pro</td><td>43.3</td><td>52.3</td><td>46.4</td><td>52.8</td></tr><tr><td>GPQA</td><td>-</td><td>-</td><td>30.8</td><td>34.3</td></tr><tr><td>Theorem QA</td><td>-</td><td>-</td><td>30.9</td><td>33.1</td></tr><tr><td colspan="5">Coding</td></tr><tr><td>HumanEval</td><td>45.1</td><td>75.2</td><td>68.3</td><td>79.9</td></tr><tr><td>MBPP</td><td>59.5</td><td>74.6</td><td>67.9</td><td>70.9</td></tr><tr><td>MultiPL-E</td><td>-</td><td>-</td><td>50.7</td><td>66.4</td></tr><tr><td>LiveCodeBench v1</td><td>12.3</td><td>-</td><td>15.2</td><td>25.5</td></tr><tr><td colspan="5">Mathematics</td></tr><tr><td>GSM8K</td><td>65.7</td><td>90.2</td><td>83.6</td><td>85.3</td></tr><tr><td>MATH</td><td>30.7</td><td>50.1</td><td>42.4</td><td>49.1</td></tr><tr><td colspan="5">Alignment</td></tr><tr><td>MT-Bench</td><td>8.30</td><td>8.50</td><td>8.30</td><td>8.55</td></tr><tr><td>MixEval</td><td>70.0</td><td>81.7</td><td>81.0</td><td>82.3</td></tr><tr><td>IFEval strict-prompt</td><td>-</td><td>-</td><td>50.3</td><td>59.9</td></tr><tr><td>AlignBench</td><td>5.70</td><td>7.20</td><td>7.19</td><td>7.36</td></tr></table>

#### 5.2.2 IN-HOUSE AUTOMATIC EVALUATION 内部自动评测

Despite a number of open benchmark datasets for the evaluation, we believe that it is far from sufficient to fully comprehend the capabilities of LLMs. Specifically, we have made a series of in-house datasets that assess different capabilities of the models, e.g., knowledge understanding, text generation, coding, etc. The evaluation is in Chinese and English. The results are gathered in Table 10 and Table 11, respectively.

**Chinese Evaluation** For the evaluations in Chinese, we focus on comparing the performance of Qwen2 models with the Qwen1.5 counterparts. For the small models, Qwen2-1.5B-Instruct generally outperforms Qwen1.5-1.8B-Chat in almost all the evaluations even with fewer parameters. In terms of the comparison of 7B models, the advantages of Qwen2 are more significant. Noteworthy is Qwen2-72B's superior performance to Qwen1.5-110B-Chat, despite the latter's greatly more parameters. The MoE model displays superior performance across most domains relative to Qwen1.5-32B-Chat, excluding knowledge understanding. This discrepancy may be attributed to a short of pre-training tokens. In the near future, we are about to continue the pre-training of the MoE model to discover its scaling behaviors.

**English Evaluation** For English, we compare Qwen2 with both Qwen1.5 and Llama-3. Similarly, the small models of Qwen2 significantly outcompete the Qwen1.5 counterparts. However, in comparison with Llama-3-70B, Qwen2-72B-Instruct is falling behind by small margins especially in comprehension and coding. We assume both the amount of English tokens for pre-training and the quantity and diversity of data for post-training lead to the performance gap in English.



开放榜仍不足以完整刻画能力, 故另建中英内部集, 覆盖知识理解,文本生成,代码等, 结果见表 10 / 11.

**Chinese Evaluation** 主对照 Qwen1.5 同族. 小模型上 1.5B-Instruct 以更少参数几乎全面超过 1.8B-Chat; 7B 档优势更大; 72B 超过参数更多的 Qwen1.5-110B-Chat. MoE 相对 Qwen1.5-32B-Chat 多数域更好, 知识理解例外, 或因预训练 token 仍偏少; 计划继续训 MoE 观察缩放.

**English Evaluation** 对照 Qwen1.5 与 Llama-3. 小模型相对 Qwen1.5 明显更强; 相对 Llama-3-70B, 72B-Instruct 在理解与代码上略落后, 归因于英文预训练量与后训练数据量 / 多样性.

<!-- page 15 of 26 -->

Table 8: Performance of 7B+ instruction-tuned models. We compare Qwen2-7B-Instruct with the recent SOTA models with 7-9 billion parameters, including Llama-3-8B-Instruct, Yi-1.5-9B-Chat, GLM-4-9B-Chat, and Qwen1.5-7B-Chat. "-Instruct" or "-Chat" is omitted in the table. Qwen2-7B-Instruct demonstrates competitive performance against Llama-3-8B-Instruct.



表 8: 7B+ Instruct. 对照 Llama-3-8B,Yi-1.5-9B,GLM-4-9B,Qwen1.5-7B. 对 Llama-3-8B-Instruct 总体可比.

<table><tr><td>Datasets</td><td>Llama-3-8B</td><td>Yi-1.5-9B</td><td>GLM-4-9B</td><td>Qwen1.5-7B</td><td>Qwen2-7B</td></tr><tr><td colspan="6">English</td></tr><tr><td>MMLU</td><td>68.4</td><td>69.5</td><td>72.4</td><td>59.5</td><td>70.5</td></tr><tr><td>MMLU-Pro</td><td>41.0</td><td>-</td><td>-</td><td>29.1</td><td>44.1</td></tr><tr><td>GPQA</td><td>34.2</td><td>-</td><td>-</td><td>27.8</td><td>34.3</td></tr><tr><td>Theorem QA</td><td>23.0</td><td>-</td><td>-</td><td>14.1</td><td>25.3</td></tr><tr><td colspan="6">Coding</td></tr><tr><td>HumanEval</td><td>62.2</td><td>66.5</td><td>71.8</td><td>46.3</td><td>79.9</td></tr><tr><td>MBPP</td><td>67.9</td><td>-</td><td>-</td><td>48.9</td><td>67.2</td></tr><tr><td>MultiPL-E</td><td>48.5</td><td>-</td><td>-</td><td>27.2</td><td>59.1</td></tr><tr><td>LiveCodeBench v1</td><td>17.3</td><td>-</td><td>-</td><td>6.0</td><td>26.6</td></tr><tr><td colspan="6">Mathematics</td></tr><tr><td>GSM8K</td><td>79.6</td><td>84.8</td><td>79.6</td><td>60.3</td><td>85.7</td></tr><tr><td>MATH</td><td>30.0</td><td>47.7</td><td>50.6</td><td>23.2</td><td>52.9</td></tr><tr><td colspan="6">Alignment</td></tr><tr><td>MT-Bench</td><td>8.05</td><td>8.20</td><td>8.35</td><td>7.60</td><td>8.41</td></tr><tr><td>MixEval</td><td>75.0</td><td>74.2</td><td>-</td><td>71.4</td><td>76.5</td></tr><tr><td>IFEval strict-prompt</td><td>72.1</td><td>-</td><td>69.0</td><td>38.3</td><td>54.7</td></tr><tr><td>AlignBench</td><td>6.20</td><td>6.90</td><td>7.01</td><td>6.20</td><td>7.21</td></tr></table>

Table 9: Performance of smaller instruction-tuned models. We compare both Qwen2-0.5B-Instruct and Qwen2-1.5B-Instruct with Qwen1.5-0.5B-Chat and Qwen2-1.8B-Chat. "-Instruct" or "-Chat" is omitted in the table. Compared with the similar-size baselines, Qwen2 significant surpasses the performance of Qwen1.5.



表 9: 更小 Instruct. 对照 Qwen1.5-0.5B 与 Qwen1.5-1.8B (源表写作 Qwen2-1.8B-Chat 处为笔误口径, 数字列仍按源表). 同档下 Qwen2 显著超过 Qwen1.5.

| Datasets | Qwen1.5-0.5B | Qwen2-0.5B | Qwen1.5-1.8B | Qwen2-1.5B |
| --- | --- | --- | --- | --- |
| MMLU | 35.0 | 37.9 | 43.7 | 52.4 |
| HumanEval | 10.4 | 29.9 | 27.4 | 47.0 |
| MBPP | 14.5 | 37.8 | 28.6 | 51.9 |
| GSM8K | 11.3 | 40.1 | 35.3 | 61.6 |
| IFEval strict-prompt | 14.6 | 20.0 | 16.8 | 29.0 |

#### 5.2.3 LONG CONTEXT CAPABILITIES 长上下文能力

Three methods to evaluate long context capabilities are employed: the Needle in a Haystack (NIAH, Kamradt, 2023), NeedleBench (OpenCompass Contributors, 2023), and LV-Eval (Yuan et al., 2024).

**Needle in a Haystack** This experiment assesses a model's proficiency in pinpointing facts within voluminous texts. Texts with 8K, 16K, ..., 128K tokens in length were crafted, with facts strategically positioned at varying depths. Each depth interval, e.g., from 0% to 10%, encompassed two instances. For contexts over 32K, YARN (Peng et al., 2023) was applied in this evaluation. As illustrated in Figure 1, Qwen2-72B-Instruct exhibits exceptional accuracy in retrieving information from the entire 128K context. Coupled with its inherent strength, this model emerges as the optimal choice for processing extensive texts, assuming sufficient resources are accessible. Additionally, models within the same series showcases remarkable performance across different context lengths. Precisely, Qwen2-7B-Instruct achieves a high level of accuracy in handling contexts up to 128K tokens. Meanwhile, Qwen2-57B-A14B-Instruct manages contexts up to 64K tokens proficiently, and the two smaller models in the Qwen2 series could support contexts of 32K tokens.



长上下文三条线: NIAH,NeedleBench,LV-Eval.

**Needle in a Haystack** 在 8K…128K 文本里按深度埋事实, 每 10% 深度区间两个样本; 超过 32K 启用 YARN. Figure 1: 72B-Instruct 在全 128K 检索准确; 资源够时是处理长文的优选. 同系列: 7B-Instruct 到 128K 仍高准确; 57B-A14B-Instruct 熟练到约 64K; 两档小模型约 32K.

<!-- page 16 of 26 -->

Table 10: Performances of Qwen2-Instruct models on our in-house Chinese automatic evaluation benchmark. Scores of Qwen2 models surpassing their comparable-sized Qwen1.5 counterparts are in bold. Qwen2-57B-A14B-Instruct is compared with Qwen1.5-32B-Chat.



表 10: 内部中文自动评测. 超过同档 Qwen1.5 的分数加粗; MoE 对照 Qwen1.5-32B-Chat.

<table><tr><td>Models</td><td>Knowledge</td><td>Exam</td><td>Comprehension</td><td>Coding</td><td>Math</td><td>Reasoning</td><td>Avg.</td></tr><tr><td colspan="8">Proprietary LLMs</td></tr><tr><td>GPT-4o-2024-05-13</td><td>66.68</td><td>69.04</td><td>76.85</td><td>59.58</td><td>71.16</td><td>69.94</td><td>68.87</td></tr><tr><td>Qwen-Max-0428</td><td>76.65</td><td>74.80</td><td>73.66</td><td>49.48</td><td>66.01</td><td>70.84</td><td>68.57</td></tr><tr><td colspan="8">Qwen1.5 Series</td></tr><tr><td>Qwen1.5-0.5B-Chat</td><td>28.55</td><td>36.99</td><td>29.70</td><td>3.82</td><td>13.10</td><td>25.47</td><td>22.94</td></tr><tr><td>Qwen1.5-1.8B-Chat</td><td>30.31</td><td>44.98</td><td>44.81</td><td>6.86</td><td>29.85</td><td>34.61</td><td>31.90</td></tr><tr><td>Qwen1.5-4B-Chat</td><td>33.67</td><td>47.17</td><td>50.44</td><td>14.05</td><td>36.20</td><td>39.98</td><td>36.92</td></tr><tr><td>Qwen1.5-MoE-A2.7B-Chat</td><td>52.76</td><td>60.49</td><td>52.84</td><td>19.34</td><td>38.45</td><td>43.07</td><td>44.49</td></tr><tr><td>Qwen1.5-7B-Chat</td><td>56.77</td><td>59.36</td><td>55.50</td><td>18.85</td><td>46.41</td><td>48.77</td><td>47.61</td></tr><tr><td>Qwen1.5-14B-Chat</td><td>63.35</td><td>66.13</td><td>60.06</td><td>28.19</td><td>54.80</td><td>50.20</td><td>53.79</td></tr><tr><td>Qwen1.5-32B-Chat</td><td>68.63</td><td>67.59</td><td>64.67</td><td>35.28</td><td>60.62</td><td>62.87</td><td>59.94</td></tr><tr><td>Qwen1.5-72B-Chat</td><td>71.52</td><td>70.04</td><td>66.70</td><td>38.22</td><td>63.09</td><td>61.30</td><td>61.81</td></tr><tr><td>Qwen1.5-110B-Chat</td><td>76.26</td><td>74.00</td><td>71.25</td><td>44.25</td><td>64.92</td><td>64.47</td><td>65.86</td></tr><tr><td colspan="8">Qwen2 Series</td></tr><tr><td>Qwen2-0.5B-Instruct</td><td>28.18</td><td>38.09</td><td>35.90</td><td>9.40</td><td>21.20</td><td>25.61</td><td>26.40</td></tr><tr><td>Qwen2-1.5B-Instruct</td><td>35.46</td><td>51.93</td><td>44.70</td><td>14.05</td><td>34.58</td><td>35.94</td><td>36.11</td></tr><tr><td>Qwen2-7B-Instruct</td><td>61.54</td><td>66.66</td><td>59.63</td><td>34.74</td><td>60.99</td><td>58.22</td><td>56.96</td></tr><tr><td>Qwen2-57B-A14B-Instruct</td><td>64.15</td><td>73.67</td><td>67.52</td><td>40.66</td><td>63.90</td><td>59.89</td><td>61.63</td></tr><tr><td>Qwen2-72B-Instruct</td><td>76.19</td><td>75.65</td><td>74.72</td><td>49.53</td><td>70.80</td><td>70.59</td><td>69.58</td></tr></table>

Table 11: Performances of Qwen2-Instruct models on our in-house English automatic evaluation benchmark. Scores of Qwen2 models surpassing their comparable-sized Qwen1.5 and Llama-3 counterparts are in bold. Qwen2-57B-A14B-Instruct is compared with Qwen1.5-32B-Chat.



表 11: 内部英文自动评测. 超过同档 Qwen1.5 / Llama-3 的分数加粗; MoE 对照 Qwen1.5-32B-Chat.

<table><tr><td>Models</td><td>Knowledge</td><td>Comprehension</td><td>Coding</td><td>Math</td><td>Avg.</td></tr><tr><td colspan="6">Proprietary LLMs</td></tr><tr><td>GPT-4o-2024-05-13</td><td>87.29</td><td>76.30</td><td>55.87</td><td>84.99</td><td>76.11</td></tr><tr><td>Qwen-Max-0428</td><td>80.73</td><td>71.63</td><td>48.76</td><td>79.12</td><td>70.06</td></tr><tr><td colspan="6">Qwen1.5 Series</td></tr><tr><td>Qwen1.5-0.5B-Chat</td><td>30.12</td><td>25.44</td><td>1.78</td><td>15.48</td><td>18.21</td></tr><tr><td>Qwen1.5-1.8B-Chat</td><td>40.37</td><td>41.87</td><td>4.99</td><td>29.71</td><td>29.23</td></tr><tr><td>Qwen1.5-4B-Chat</td><td>51.44</td><td>50.16</td><td>15.45</td><td>44.83</td><td>40.47</td></tr><tr><td>Qwen1.5-MoE-A2.7B-Chat</td><td>61.64</td><td>54.79</td><td>21.28</td><td>50.46</td><td>47.04</td></tr><tr><td>Qwen1.5-7B-Chat</td><td>64.86</td><td>58.61</td><td>20.79</td><td>54.24</td><td>49.62</td></tr><tr><td>Qwen1.5-14B-Chat</td><td>74.41</td><td>59.80</td><td>28.18</td><td>66.91</td><td>57.32</td></tr><tr><td>Qwen1.5-32B-Chat</td><td>76.38</td><td>64.70</td><td>37.39</td><td>73.04</td><td>62.88</td></tr><tr><td>Qwen1.5-72B-Chat</td><td>77.59</td><td>67.58</td><td>37.30</td><td>73.76</td><td>64.06</td></tr><tr><td>Qwen1.5-110B-Chat</td><td>78.29</td><td>70.17</td><td>44.12</td><td>78.87</td><td>67.86</td></tr><tr><td colspan="6">Llama-3 Series</td></tr><tr><td>Llama-3-8B-Instruct</td><td>71.01</td><td>64.71</td><td>42.56</td><td>65.82</td><td>61.03</td></tr><tr><td>Llama-3-70B-Instruct</td><td>83.06</td><td>76.31</td><td>57.18</td><td>79.70</td><td>74.06</td></tr><tr><td colspan="6">Qwen2 Series</td></tr><tr><td>Qwen2-0.5B-Instruct</td><td>43.19</td><td>29.57</td><td>6.95</td><td>31.52</td><td>27.81</td></tr><tr><td>Qwen2-1.5B-Instruct</td><td>56.03</td><td>45.08</td><td>17.61</td><td>50.44</td><td>42.29</td></tr><tr><td>Qwen2-7B-Instruct</td><td>73.75</td><td>63.09</td><td>36.41</td><td>75.67</td><td>62.23</td></tr><tr><td>Qwen2-57B-A14B-Instruct</td><td>76.80</td><td>67.92</td><td>42.37</td><td>77.04</td><td>66.03</td></tr><tr><td>Qwen2-72B-Instruct</td><td>83.00</td><td>73.58</td><td>53.03</td><td>82.15</td><td>72.94</td></tr></table>

<!-- page 17 of 26 -->

Retrieve Facts from Given Documents across Context Lengths and Document Depth

Testing Qwen2-Instruct via "Needle in A HayStack"

![Chart block](images/p17-chart.png)

![Chart block](images/p17-chart-2.png)

![Chart block](images/p17-figure-1-performance-of-qwen2-instruction-tuned-models.png)

Figure 1: Performance of Qwen2 instruction-tuned models on Needle in A Haystack Test. All models that supports context lengths above 32k tokens integrates the YARN mechanism.



图 1: Qwen2 Instruct 在 Needle in A Haystack 上的表现. 支持超过 32k 上下文的模型均集成 YARN.

Table 12: Performance of Qwen2-72B-Instruct and Qwen2-7B-Instruct on NeedleBench and LV-Eval. +YARN+DCA does not change the model behavior within 32k tokens.



表 12: 72B / 7B Instruct 在 NeedleBench 与 LV-Eval 上的表现. +YARN+DCA 在 32k 以内不改变模型行为.

| Datasets8k | NeedleBench 32k 128k | 256k 16k | LV-Eval 32k 64k | 128k | 256k |
| --- | --- | --- | --- | --- | --- |
| ChatGLM4-9B-1M 56.61 | 49.15 44.30 | 45.29 46.40 | 43.23 42.92 | 40.41 | 36.95 |
| Qwen2-7B-Instruct | 38.77 | 2.92 | 28.03 | 11.01 | 0.55 |
| 87.07 | 73.64 | 49.77 | 46.93 |  |  |
| + YARN + DCA | 66.32 | 60.71 | 42.14 | 36.64 | 34.72 |
| Qwen2-72B-Instruct | 73.05 | 17.13 | 42.92 | 31.79 | 2.88 |
| 91.90 | 92.01 | 58.82 | 56.70 |  |  |
| + YARN + DCA | 90.27 | 85.21 | 53.03 | 48.83 | 42.35 |

<!-- page 18 of 26 -->

Table 13: Performance of Qwen2-72B-Instruct and proprietary LLMs in multilingual human evaluation. We compare Qwen2-72B-Instruct with GPT-3.5-Turbo-1106, GPT-4-Turbo-0409, GPT-4o-0513, Claude-3-Opus-0229. Scores range from 1 to 5. Overall, Qwen2-72B-Instruct performs substantially better than GPT-3.5-Turbo but there is progress to be made to be competitive with the proprietary models released in the last 6 months.



表 13: 72B-Instruct 与专有模型的多语人工评测 (1–5 分). 明显强于 GPT-3.5-Turbo; 相对近半年专有旗舰仍有差距.

| Language G | PT-3.5-Turbo | GPT-4-Turbo | GPT-4o C | laude-3-Opus | Qwen2-72B-Instruct |
| --- | --- | --- | --- | --- | --- |
| Arabic | 2.52 | 3.44 | 3.55 | 4.15 | 3.86 |
| French | 3.47 | 4.19 | 4.16 | 4.23 | 4.01 |
| Indonesian | 3.56 | 4.09 | 4.39 | 4.40 | 3.83 |
| Japanese | 2.75 | 3.68 | 3.72 | 3.85 | 3.63 |
| Korean | 2.37 | 4.24 | 4.40 | 4.23 | 4.14 |
| Portuguese | 3.37 | 3.86 | 3.89 | 4.09 | 3.97 |
| Russian | 3.24 | 4.27 | 4.32 | 4.25 | 4.15 |
| Spanish | 4.07 | 4.08 | 4.26 | 4.31 | 4.10 |
| Thai | 3.38 | 4.11 | 4.09 | 4.01 | 3.75 |
| Vietnamese | 3.90 | 3.84 | 4.14 | 3.98 | 3.91 |
| Average | 3.16 | 3.98 | 4.09 | 4.15 | 3.93 |

**NeedleBench** NeedleBench ups the challenge on NIAH by including multiple facts (two to five) in passages, necessitating simultaneous identification and multi-hop reasoning. Table 12 reveals that the integration of YARN and DCA (An et al., 2024) notably improves Qwen2 models' long-context abilities. Qwen2-7B-Instruct surpasses ChatGLM4-9B-1M (Zeng et al., 2024), which claims a 1M context length. Moreover, Qwen2-72B-Instruct demonstrates strong performance, with an accuracy reduction of just 6 points, compared to ChatGLM4-9B-1M, which shows a more pronounced decline of 11 points, particularly given its lower initial accuracy.

**LV-Eval** LV-Eval comprises 11 diverse QA datasets that demand comprehension of multiple pieces of evidence at once. To rectify the shortcomings of its original metric, which was excessively stringent and led to a high rate of false negatives, we adopt the keyword recall as the reported score. As shown in Table 12, integrating YARN and DCA substantially bolsters the long-context competencies of Qwen2 models on LV-Eval. Qwen2-7B-Instruct achieves parity with ChatGLM4-9B-1M, albeit with a more noticeable decline at extended contexts. Moreover, Qwen2-72B-Instruct demonstrates strong performance across all lengths, confirming its proficiency in handling long-context tasks.



**NeedleBench** 在段落中埋 2–5 个事实, 要求同时识别与多跳推理. Table 12: 加 YARN+DCA 明显抬长上下文; 7B-Instruct 超过宣称 1M 窗的 ChatGLM4-9B-1M; 72B-Instruct 随长度只掉约 6 分, 而 ChatGLM4 掉约 11 分 (且起点更低).

**LV-Eval** 11 个需同时理解多证据的 QA 集. 原指标过严假阴性高, 改报 keyword recall. Table 12: YARN+DCA 大幅抬分; 7B 与 ChatGLM4-9M 大致持平但更长窗衰减更明显; 72B 各长度都强.

#### 5.2.4 MULTILINGUAL EVALUATION 多语评测

For the multilingual evaluation, we implement a comprehensive human evaluation for the assessment of multilingual capabilities. Specifically, we design diverse test cases assessing different capabilities of large language models, and we have test cases that are in a number of languages. For the annotators, we invite one professional annotator for each language who majors in the language for the evaluation. For each test case, the annotator grades the response from model with a score from 1 to 5.

We report the results of our model and the baselines in the evaluation of different languages. From Table 13, it can be found that on average Qwen2-72B-Instruct significantly outperforms GPT-3.5- Turbo and it is competitive with GPT-4-Turbo and slightly falls behind Claude-3-Opus. This shows that our multilingual pre-training and instruction tuning data contribute to the multilingual capabilities of Qwen2-72B-Instruct and it is competitive with most state-of-the-art proprietary LLMs.



多语用人评: 多能力,多语言用例; 每种语言一位该语专业标注员, 1–5 分. Table 13: 均分上 72B-Instruct 显著高于 GPT-3.5-Turbo, 接近 GPT-4-Turbo, 略低于 Claude-3-Opus. 说明多语预训练与指令数据起了作用, 已能与多数专有 SOTA 拉打.

#### 5.2.5 SAFETY & RESPONSIBILITY 安全与责任

LLMs with openly accessible weights effectively accelerate the development of the research as well as their applications. Moreover, we believe that it is crucial to build safe and responsible LLMs so that the effect of the misuse of AI technologies could be significantly alleviated.

We implement a multilingual safety evaluation that tests the LLMs in different languages. Specifically, we assess the safety performance of the models in the topics about illegal behaviors, fraud,

<!-- page 19 of 26 -->

Table 14: Performance of models in safety evaluation. We compare Qwen2-72B-Instruct with GPT-4 and Mixtral-8x22B-Instruct. The lower, the better. Qwen2-72B-Instruct rejected more prompts with risks than the competitors.



表 14: 安全评测 (有害回复占比, 越低越好). 对照 GPT-4 与 Mixtral-8x22B-Instruct; Qwen2-72B-Instruct 拒绝了更多风险提示.

| Risk Category | GPT-4 | Mixtral-8x22B | Qwen2-72B-Instruct |
| --- | --- | --- | --- |
| Illegal | 0.00 | 6.87 | 0.00 |
| Fraud | 3.40 | 8.49 | 2.41 |
| Pornography | 23.63 | 33.82 | 22.91 |
| Privacy | 3.37 | 15.03 | 2.47 |

Table 15: Contamination Analysis. The contaminated samples in this table are identified using a strict criterion: any test sample with a 13-gram overlap with the pre-training or post-training data is considered contaminated. We report the percentage of contaminated samples as well as the model performance on both the original and non-contaminated test sets.



表 15: 污染分析. 严格标准: 与预训练或后训练数据有 13-gram 重叠即视为污染. 报告污染比例, 以及原集与非污染集上的表现.

<table><tr><td rowspan="2">Test set</td><td rowspan="2">Percent of Contamination</td><td colspan="3">Qwen2-72B-Instruct</td><td colspan="3">Qwen2-7B-Instruct</td></tr><tr><td>Original</td><td>Non-Contam.</td><td>Δ</td><td>Original</td><td>Non-Contam.</td><td>Δ</td></tr><tr><td>MMLU</td><td>11.2%</td><td>82.3</td><td>83.2</td><td>0.9</td><td>70.5</td><td>71.3</td><td>0.8</td></tr><tr><td>MMLU-Pro</td><td>11.6%</td><td>64.4</td><td>65.6</td><td>1.2</td><td>44.1</td><td>46.5</td><td>2.4</td></tr><tr><td>GPQA</td><td>1.0%</td><td>42.4</td><td>41.8</td><td>0.6</td><td>34.3</td><td>34.1</td><td>-0.2</td></tr><tr><td>HumanEval</td><td>75.0%</td><td>86.0</td><td>87.0</td><td>1.0</td><td>79.9</td><td>87.8</td><td>7.9</td></tr><tr><td>MBPP</td><td>29.6%</td><td>80.2</td><td>79.7</td><td>0.5</td><td>67.2</td><td>69.0</td><td>1.8</td></tr><tr><td>MultiPL-E</td><td>37.7%</td><td>69.2</td><td>69.2</td><td>0.0</td><td>59.1</td><td>58.9</td><td>-0.2</td></tr><tr><td>GSM8k</td><td>0.7%</td><td>93.2</td><td>92.8</td><td>-0.4</td><td>85.7</td><td>85.6</td><td>-0.1</td></tr><tr><td>Math</td><td>31.7%</td><td>69.0</td><td>74.6</td><td>5.6</td><td>52.9</td><td>57.6</td><td>4.7</td></tr><tr><td>IFEval</td><td>0.9%</td><td>77.6</td><td>77.4</td><td>-0.2</td><td>54.7</td><td>53.7</td><td>-1.0</td></tr></table>

pornography, and privacy. We have collected prompts prone to jail-breaking and use them to test whether the models can provide safe responses by rejection.

The results are presented in Table 14, where the proportion of harmful responses generated by the models are shown and the lower, the better. It can be observed that Qwen2-72B-Instruct performs better than the proprietary model, GPT-4, and significantly outperforms the open-weight model, Mixtral-8x22B-Instruct. However, we believe that there is still much room for our model to improve to be a safer and more responsible model, especially in terms of pornography, which is a conventionally difficult category to differentiate even for humans.



续上页: 安全主题含非法,欺诈,色情,隐私; 收集易越狱提示, 看模型能否拒绝. Table 14: 有害回复占比越低越好; 72B-Instruct 优于 GPT-4, 显著优于 Mixtral-8x22B-Instruct. 作者仍认为有提升空间, 尤其色情类对人来说也难判.

#### 5.2.6 CONTAMINATION ANALYSIS 污染分析

For large language models, what counts as contamination and how to run contamination analysis remain an active area of research (Ravaut et al., 2024; Golchin & Surdeanu, 2024; Sainz et al., 2023). In the following, we first introduce how we try to decontaminate the training corpora against the evaluation datasets, and then estimate the extent to which benchmark scores are influenced by the remaining contamination.

During the construction of the pre-training and post-training datasets, we exclude potentially contaminated data using n-gram matching. However, we found that this approach may lead to a high false negative rate, because there could be commonly used expressions, especially in mathematical and coding data. Therefore, we also applied another constraint based on the longest common subsequence (LCS). Specifically, we first remove all symbols and punctuation from both the test and training sequences and perform tokenization. For a training sequence $\mathbf { s } _ { t }$ , we remove it if there is a test sequence $\mathbf { s } _ { e }$ such that $| \mathrm { L C S } ( \mathbf { s } _ { t } , \mathbf { s } _ { e } ) | \geq 1 3$ and $| \mathrm { L C S } ( \mathbf { \tilde { s } } _ { t } , \mathbf { \tilde { s } } _ { e } ) | \geq 0 . 6 \times \operatorname* { m i n } ( | \mathbf { s } _ { t } | , | \mathbf { s } _ { e } | )$

To assess the potential effects of leaking data on the test performance, we follow OpenAI (2023) to construct a strict non-contaminated test set to check if there is a significant performance degradation after strict decontamination. Specifically, we construct the non-contaminated test set by excluding any



污染界定与测法仍是活跃研究. 先讲训练语料如何相对评测集去污, 再估计残留污染对分数的影响.

构建预训练 / 后训练时用 n-gram 排除潜在污染, 但数学与代码里常见表达式会导致假阴性偏高, 于是再加 LCS 约束: 去符号标点并分词后, 若存在测试序列使 $|\mathrm{LCS}|\ge 13$ 且覆盖率 $\ge 0.6\times\min(|s_t|,|s_e|)$, 则丢掉该训练序列.

为估计泄漏影响, 按 OpenAI (2023) 思路构造更严的非污染测试集, 看严格去污后是否明显掉分: 凡与预训练或后训练有 13-gram 重叠的样本都剔除 (本页公式条件收到下页续完).

> **对一下:** HumanEval 污染率 75%, 非污染集分数反而升高, 怎么解释?
> 报告认为多数命中是常见代码片段假阳性; 72B 原 86.0 → 非污染 87.0, 说明严格切集并未暴露「靠背题抬分」. 读代码榜时把 Table 15 的 Δ 一并带上.

<!-- page 20 of 26 -->

sample which has 13-gram overlap with the pre-training or the post-training data (without constraint on LCS), and then compute the corresponding metric on the test set.

The results are presented in Table 15. Although some datasets exhibit a high percentage of contamination under the strict criterion, we noticed that most of the identified contaminated samples are false positives, primarily stemming from the mathematics and coding datasets. It is likely that certain code snippets and mathematical equations are so common that they do not provide any meaningful advantage in solving the test data. Furthermore, our analysis shows that the performance of the Qwen2 models remains consistent between the original and non-contaminated test data, suggesting that the potential issue of data contamination does not significantly impact the model's performance.



续: 用「仅 13-gram,不加 LCS」标准剔测试样本, 再算指标. Table 15: 严格标准下部分集污染比例很高, 但作者判断多为数学 / 代码假阳性; 常见片段未必给解题优势. 原集与非污染集分数接近, 认为污染未显著抬分.

## 6 CONCLUSION

This technical report has presented the Qwen2 series, a versatile suite of foundational and instructiontuned language models, ranging from 0.5 to 72 billion parameters, including models of dense and Mixture-of-Experts architecture. Qwen2 outperforms previous open-weight models, notably its predecessor Qwen1.5, and displays competitive performance against proprietary models across a broad spectrum of benchmarks in language understanding, generation, multilingual capabilities, coding, mathematics, and reasoning. In this update, we have extra focus on long-context, multi-lingual, coding, mathematics capabilities and safety and responsibility. In a commitment to fostering innovation and accessibility within the community, we have made the Qwen2 model weights openly accessible, which enables researchers and developers to harness the full potential of Qwen2 in a variety of applications and research projects. Through these efforts, we aim to contribute to the advancement of AI technologies and their positive impact on society.



本技术报告介绍了 Qwen2 系列: 一套覆盖基础与指令微调, 参数从 0.5B 到 72B, 含 Dense 与 MoE 架构的通用语言模型族. Qwen2 超过先前开源权重模型 (尤其前代 Qwen1.5), 并在语言理解, 生成, 多语, 代码, 数学与推理等广泛基准上与专有模型具有可比表现. 本版额外侧重长上下文, 多语, 代码, 数学, 以及安全与责任. 为推动社区创新与可及性, 我们公开了 Qwen2 权重, 使研究者与开发者能在多样应用与研究中发挥其潜力. 我们希望借此为 AI 技术进展及其对社会的积极影响作出贡献.

<!-- page 21 of 26 -->

## REFERENCES

Marah Abdin, Jyoti Aneja, Sebastien Bubeck, Caio Cesar Teodoro Mendes, Weizhu Chen, Allie Del ´ Giorno, Ronen Eldan, Sivakanth Gopi, Suriya Gunasekar, Mojan Javaheripi, Piero Kauffmann, Yin Tat Lee, Yuanzhi Li, Anh Nguyen, Gustavo de Rosa, Olli Saarikivi, Adil Salim, Shital Shah, Michael Santacroce, Harkirat Singh Behl, Adam Taumann Kalai, Xin Wang, Rachel Ward, Philipp Witte, Cyril Zhang, and Yi Zhang. Phi-2: The surprising power of small language models, 2024. URL [https://www.microsoft.com/en-us/research/blog/phi-2-the-surprising-power-of-small-language-models/](https://www.microsoft.com/en-us/research/blog/phi-2-the-surprising-power-of-small-language-models/).

AI@Meta. Llama 3 model card, 2024. URL [https://github.com/meta-llama/llama3/blob/main/MODEL\_CARD.md](https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md).

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebron, and Sumit ´ Sanghai. GQA: Training generalized multi-query Transformer models from multi-head checkpoints. In EMNLP, pp. 4895–4901. Association for Computational Linguistics, 2023.

Chenxin An, Fei Huang, Jun Zhang, Shansan Gong, Xipeng Qiu, Chang Zhou, and Lingpeng Kong. Training-free long-context scaling of large language models. CoRR, abs/2402.17463, 2024.

Anthropic. The Claude 3 model family: Opus, Sonnet, Haiku. Technical report, Anthropic, AI, 2024. URL [https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model\_Card\_Claude\_3.pdf](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf).

Jacob Austin, Augustus Odena, Maxwell I. Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie J. Cai, Michael Terry, Quoc V. Le, and Charles Sutton. Program synthesis with large language models. CoRR, abs/2108.07732, 2021.

Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, Binyuan Hui, Luo Ji, Mei Li, Junyang Lin, Runji Lin, Dayiheng Liu, Gao Liu, Chengqiang Lu, Keming Lu, Jianxin Ma, Rui Men, Xingzhang Ren, Xuancheng Ren, Chuanqi Tan, Sinan Tan, Jianhong Tu, Peng Wang, Shijie Wang, Wei Wang, Shengguang Wu, Benfeng Xu, Jin Xu, An Yang, Hao Yang, Jian Yang, Shusheng Yang, Yang Yao, Bowen Yu, Hongyi Yuan, Zheng Yuan, Jianwei Zhang, Xingxuan Zhang, Yichang Zhang, Zhenru Zhang, Chang Zhou, Jingren Zhou, Xiaohuan Zhou, and Tianhang Zhu. Qwen technical report. CoRR, abs/2309.16609, 2023a.

Jinze Bai, Shuai Bai, Shusheng Yang, Shijie Wang, Sinan Tan, Peng Wang, Junyang Lin, Chang Zhou, and Jingren Zhou. Qwen-VL: A frontier large vision-language model with versatile abilities. CoRR, abs/2308.12966, 2023b.

Yuntao Bai, Saurav Kadavath, Sandipan Kundu, Amanda Askell, Jackson Kernion, Andy Jones, Anna Chen, Anna Goldie, Azalia Mirhoseini, Cameron McKinnon, Carol Chen, Catherine Olsson, Christopher Olah, Danny Hernandez, Dawn Drain, Deep Ganguli, Dustin Li, Eli Tran-Johnson, Ethan Perez, Jamie Kerr, Jared Mueller, Jeffrey Ladish, Joshua Landau, Kamal Ndousse, Kamile Lukosiute, Liane Lovitt, Michael Sellitto, Nelson Elhage, Nicholas Schiefer, Noem´ı Mercado, Nova DasSarma, Robert Lasenby, Robin Larson, Sam Ringer, Scott Johnston, Shauna Kravec, Sheer El Showk, Stanislav Fort, Tamera Lanham, Timothy Telleen-Lawton, Tom Conerly, Tom Henighan, Tristan Hume, Samuel R. Bowman, Zac Hatfield-Dodds, Ben Mann, Dario Amodei, Nicholas Joseph, Sam McCandlish, Tom Brown, and Jared Kaplan. Constitutional AI: Harmlessness from AI feedback. CoRR, abs/2212.08073, 2022.

Lucas Bandarkar, Davis Liang, Benjamin Muller, Mikel Artetxe, Satya Narayan Shukla, Donald Husa, Naman Goyal, Abhinandan Krishnan, Luke Zettlemoyer, and Madian Khabsa. The Belebele benchmark: A parallel reading comprehension dataset in 122 language variants. CoRR, abs/2308.16884, 2023.

Boxi Cao, Keming Lu, Xinyu Lu, Jiawei Chen, Mengjie Ren, Hao Xiang, Peilin Liu, Yaojie Lu, Ben He, Xianpei Han, Le Sun, Hongyu Lin, and Bowen Yu. Towards scalable automated alignment of LLMs: A survey. CoRR, abs/2406.01252, 2024.

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q. Feldman, Arjun Guha, Michael Greenberg, and Abhinav Jangda. MultiPL-E: A scalable and polyglot approach to benchmarking neural code generation. IEEE Trans. Software Eng., 49(7):3675–3691, 2023.

<!-- page 22 of 26 -->

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared ´ Kaplan, Harrison Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Joshua Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021.

Wenhu Chen, Ming Yin, Max Ku, Pan Lu, Yixin Wan, Xueguang Ma, Jianyu Xu, Xinyi Wang, and Tony Xia. TheoremQA: A theorem-driven question answering dataset. In EMNLP, pp. 7889–7901. Association for Computational Linguistics, 2023a.

Zhihong Chen, Shuo Yan, Juhao Liang, Feng Jiang, Xiangbo Wu, Fei Yu, Guiming Hardy Chen, Junying Chen, Hongbo Zhang, Li Jianquan, Wan Xiang, and Benyou Wang. Multilingual-SIFT: Multilingual supervised instruction fine-tuning, 2023b. URL [https://github.com/FreedomIntelligence/MultilingualSIFT](https://github.com/FreedomIntelligence/MultilingualSIFT).

Wei-Lin Chiang, Lianmin Zheng, Ying Sheng, Anastasios Nikolas Angelopoulos, Tianle Li, Dacheng Li, Hao Zhang, Banghua Zhu, Michael I. Jordan, Joseph E. Gonzalez, and Ion Stoica. Chatbot arena: An open platform for evaluating LLMs by human preference. CoRR, abs/2403.04132, 2024.

Yunfei Chu, Jin Xu, Xiaohuan Zhou, Qian Yang, Shiliang Zhang, Zhijie Yan, Chang Zhou, and Jingren Zhou. Qwen-Audio: Advancing universal audio understanding via unified large-scale audio-language models. CoRR, abs/2311.07919, 2023.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? Try ARC, the AI2 reasoning challenge. CoRR, abs/1803.05457, 2018.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021.

Damai Dai, Chengqi Deng, Chenggang Zhao, R. X. Xu, Huazuo Gao, Deli Chen, Jiashi Li, Wangding Zeng, Xingkai Yu, Y. Wu, Zhenda Xie, Y. K. Li, Panpan Huang, Fuli Luo, Chong Ruan, Zhifang Sui, and Wenfeng Liang. DeepSeekMoE: Towards ultimate expert specialization in mixture-of-experts language models. CoRR, abs/2401.06066, 2024.

Yann N. Dauphin, Angela Fan, Michael Auli, and David Grangier. Language modeling with gated convolutional networks. In ICML, volume 70 of Proceedings of Machine Learning Research, pp. 933–941. PMLR, 2017.

Guanting Dong, Hongyi Yuan, Keming Lu, Chengpeng Li, Mingfeng Xue, Dayiheng Liu, Wei Wang, Zheng Yuan, Chang Zhou, and Jingren Zhou. How abilities in large language models are affected by supervised fine-tuning data composition. CoRR, abs/2310.05492, 2023.

Guanting Dong, Keming Lu, Chengpeng Li, Tingyu Xia, Bowen Yu, Chang Zhou, and Jingren Zhou. Self-play with execution feedback: Improving instruction-following capabilities of large language models. CoRR, abs/2406.13542, 2024.

Alena Fenogenova, Artem Chervyakov, Nikita Martynov, Anastasia Kozlova, Maria Tikhonova, Albina Akhmetgareeva, Anton A. Emelyanov, Denis Shevelev, Pavel Lebedev, Leonid Sinev, Ulyana Isaeva, Katerina Kolomeytseva, Daniil Moskovskiy, Elizaveta Goncharova, Nikita Savushkin, Polina Mikhailova, Denis Dimitrov, Alexander Panchenko, and Sergey Markov. MERA: A comprehensive LLM evaluation in russian. CoRR, abs/2401.04531, 2024.

Shahriar Golchin and Mihai Surdeanu. Time travel in llms: Tracing data contamination in large language models. In ICLR. OpenReview.net, 2024.

<!-- page 23 of 26 -->

Naman Goyal, Cynthia Gao, Vishrav Chaudhary, Peng-Jen Chen, Guillaume Wenzek, Da Ju, Sanjana Krishnan, Marc'Aurelio Ranzato, Francisco Guzman, and Angela Fan. The Flores-101 evalua- ´ tion benchmark for low-resource and multilingual machine translation. Trans. Assoc. Comput. Linguistics, 10:522–538, 2022.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In ICLR. OpenReview.net, 2021a.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the MATH dataset. In NeurIPS Datasets and Benchmarks, 2021b.

Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Jiayi Lei, Yao Fu, Maosong Sun, and Junxian He. C-Eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In NeurIPS, 2023.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. LiveCodeBench: Holistic and contamination free evaluation of large language models for code. CoRR, abs/2403.07974, 2024.

Albert Q. Jiang, Alexandre Sablayrolles, Arthur Mensch, Chris Bamford, Devendra Singh Chaplot, Diego de Las Casas, Florian Bressand, Gianna Lengyel, Guillaume Lample, Lucile Saulnier, Lelio Renard Lavaud, Marie-Anne Lachaux, Pierre Stock, Teven Le Scao, Thibaut Lavril, Thomas ´ Wang, Timothee Lacroix, and William El Sayed. Mistral 7B. ´ CoRR, abs/2310.06825, 2023a.

Albert Q. Jiang, Alexandre Sablayrolles, Antoine Roux, Arthur Mensch, Blanche Savary, Chris Bamford, Devendra Singh Chaplot, Diego de Las Casas, Emma Bou Hanna, Florian Bressand, Gianna Lengyel, Guillaume Bour, Guillaume Lample, Lelio Renard Lavaud, Lucile Saulnier, Marie- ´ Anne Lachaux, Pierre Stock, Sandeep Subramanian, Sophia Yang, Szymon Antoniak, Teven Le Scao, Theophile Gervet, Thibaut Lavril, Thomas Wang, Timoth ´ ee Lacroix, and William El Sayed. ´ Mixtral of experts. CoRR, abs/2401.04088, 2024.

Zixuan Jiang, Jiaqi Gu, Hanqing Zhu, and David Z. Pan. Pre-RMSNorm and Pre-CRMSNorm Transformers: Equivalent and efficient pre-LN Transformers. CoRR, abs/2305.14858, 2023b.

Gregory Kamradt. Needle in a haystack - pressure testing LLMs, 2023. URL [https://github.com/gkamradt/LLMTest\_NeedleInAHaystack](https://github.com/gkamradt/LLMTest_NeedleInAHaystack).

Aran Komatsuzaki, Joan Puigcerver, James Lee-Thorp, Carlos Riquelme Ruiz, Basil Mustafa, Joshua Ainslie, Yi Tay, Mostafa Dehghani, and Neil Houlsby. Sparse upcycling: Training mixture-of-experts from dense checkpoints. In ICLR. OpenReview.net, 2023.

Fajri Koto, Nurul Aisyah, Haonan Li, and Timothy Baldwin. Large language models only pass primary school exams in Indonesia: A comprehensive test on IndoMMLU. In EMNLP, pp. 12359–12374. Association for Computational Linguistics, 2023.

Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. CMMLU: Measuring massive multitask language understanding in Chinese. CoRR, abs/2306.09212, 2023.

Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Tianhao Wu, Banghua Zhu, Joseph E. Gonzalez, and Ion Stoica. From crowdsourced data to high-quality benchmarks: Arena-Hard and BenchBuilder pipeline. CoRR, abs/2406.11939, 2024.

Opher Lieber, Barak Lenz, Hofit Bata, Gal Cohen, Jhonathan Osin, Itay Dalmedigos, Erez Safahi, Shaked Meirom, Yonatan Belinkov, Shai Shalev-Shwartz, Omri Abend, Raz Alon, Tomer Asida, Amir Bergman, Roman Glozman, Michael Gokhman, Avashalom Manevich, Nir Ratner, Noam Rozen, Erez Shwartz, Mor Zusman, and Yoav Shoham. Jamba: A hybrid Transformer-Mamba language model. CoRR, abs/2403.19887, 2024.

Stephanie Lin, Jacob Hilton, and Owain Evans. TruthfulQA: Measuring how models mimic human falsehoods. In ACL (1), pp. 3214–3252. Association for Computational Linguistics, 2022a.

<!-- page 24 of 26 -->

Xi Victoria Lin, Todor Mihaylov, Mikel Artetxe, Tianlu Wang, Shuohui Chen, Daniel Simig, Myle Ott, Naman Goyal, Shruti Bhosale, Jingfei Du, Ramakanth Pasunuru, Sam Shleifer, Punit Singh Koura, Vishrav Chaudhary, Brian O'Horo, Jeff Wang, Luke Zettlemoyer, Zornitsa Kozareva, Mona T. Diab, Veselin Stoyanov, and Xian Li. Few-shot learning with multilingual generative language models. In EMNLP, pp. 9019–9052. Association for Computational Linguistics, 2022b.

Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by ChatGPT really correct? Rigorous evaluation of large language models for code generation. In NeurIPS, 2023a.

Xiao Liu, Xuanyu Lei, Shengyuan Wang, Yue Huang, Zhuoer Feng, Bosi Wen, Jiale Cheng, Pei Ke, Yifan Xu, Weng Lam Tam, Xiaohan Zhang, Lichao Sun, Hongning Wang, Jing Zhang, Minlie Huang, Yuxiao Dong, and Jie Tang. AlignBench: Benchmarking Chinese alignment of large language models. CoRR, abs/2311.18743, 2023b.

Keming Lu, Bowen Yu, Fei Huang, Yang Fan, Runji Lin, and Chang Zhou. Online merging optimizers for boosting rewards and mitigating tax in alignment. CoRR, abs/2405.17931, 2024a.

Keming Lu, Bowen Yu, Chang Zhou, and Jingren Zhou. Large language models are superpositions of all characters: Attaining arbitrary role-play via self-alignment. CoRR, abs/2401.12474, 2024b.

Keming Lu, Hongyi Yuan, Zheng Yuan, Runji Lin, Junyang Lin, Chuanqi Tan, Chang Zhou, and Jingren Zhou. #InsTag: Instruction tagging for analyzing supervised fine-tuning of large language models. In ICLR. OpenReview.net, 2024c.

Thomas Mesnard, Cassidy Hardin, Robert Dadashi, Surya Bhupatiraju, Shreya Pathak, Laurent Sifre, Morgane Riviere, Mihir Sanjay Kale, Juliette Love, Pouya Tafti, L \` eonard Hussenot, Pier Giuseppe ´ Sessa, Aakanksha Chowdhery, Adam Roberts, Aditya Barua, Alex Botev, Alex Castro-Ros, Ambrose Slone, Amelie H ´ eliou, Andrea Tacchetti, Anna Bulanova, Antonia Paterson, Beth Tsai, ´ Bobak Shahriari, Charline Le Lan, Christopher A. Choquette-Choo, Clement Crepy, Daniel Cer, ´ Daphne Ippolito, David Reid, Elena Buchatskaya, Eric Ni, Eric Noland, Geng Yan, George Tucker, George-Christian Muraru, Grigory Rozhdestvenskiy, Henryk Michalewski, Ian Tenney, Ivan Grishchenko, Jacob Austin, James Keeling, Jane Labanowski, Jean-Baptiste Lespiau, Jeff Stanway, Jenny Brennan, Jeremy Chen, Johan Ferret, Justin Chiu, Justin Mao-Jones, Katherine Lee, Kathy Yu, Katie Millican, Lars Lowe Sjoesund, Lisa Lee, Lucas Dixon, Machel Reid, Maciej Mikuła, Mateo Wirth, Michael Sharman, Nikolai Chinaev, Nithum Thain, Olivier Bachem, Oscar Chang, Oscar Wahltinez, Paige Bailey, Paul Michel, Petko Yotov, Rahma Chaabouni, Ramona Comanescu, Reena Jana, Rohan Anil, Ross McIlroy, Ruibo Liu, Ryan Mullins, Samuel L Smith, Sebastian Borgeaud, Sertan Girgin, Sholto Douglas, Shree Pandya, Siamak Shakeri, Soham De, Ted Klimenko, Tom Hennigan, Vlad Feinberg, Wojciech Stokowiec, Yu hui Chen, Zafarali Ahmed, Zhitao Gong, Tris Warkentin, Ludovic Peran, Minh Giang, Clement Farabet, Oriol Vinyals, Jeff ´ Dean, Koray Kavukcuoglu, Demis Hassabis, Zoubin Ghahramani, Douglas Eck, Joelle Barral, Fernando Pereira, Eli Collins, Armand Joulin, Noah Fiedel, Evan Senter, Alek Andreev, and Kathleen Kenealy. Gemma: Open models based on Gemini research and technology. CoRR, abs/2403.08295, 2024.

Niklas Muennighoff, Thomas Wang, Lintang Sutawika, Adam Roberts, Stella Biderman, Teven Le Scao, M. Saiful Bari, Sheng Shen, Zheng Xin Yong, Hailey Schoelkopf, Xiangru Tang, Dragomir Radev, Alham Fikri Aji, Khalid Almubarak, Samuel Albanie, Zaid Alyafeai, Albert Webson, Edward Raff, and Colin Raffel. Crosslingual generalization through multitask finetuning. In ACL (1), pp. 15991–16111. Association for Computational Linguistics, 2023.

Jinjie Ni, Fuzhao Xue, Xiang Yue, Yuntian Deng, Mahir Shah, Kabir Jain, Graham Neubig, and Yang You. MixEval: Deriving wisdom of the crowd from LLM benchmark mixtures. CoRR, abs/2406.06565, 2024.

OpenAI. Introducing ChatGPT, 2022. URL [https://openai.com/index/chatgpt/](https://openai.com/index/chatgpt/).

OpenAI. GPT4 technical report. arXiv preprint arXiv:2303.08774, 2023.

OpenAI. Hello GPT-4o, 2024. URL [https://openai.com/index/hello-gpt-4o/](https://openai.com/index/hello-gpt-4o/).

<!-- page 25 of 26 -->

OpenCompass Contributors. OpenCompass: A universal evaluation platform for foundation models, 2023. URL [https://github.com/open-compass/opencompass](https://github.com/open-compass/opencompass).

Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. YaRN: Efficient context window extension of large language models. CoRR, abs/2309.00071, 2023.

Edoardo Maria Ponti, Goran Glavas, Olga Majewska, Qianchu Liu, Ivan Vulic, and Anna Korhonen. XCOPA: A multilingual dataset for causal commonsense reasoning. In EMNLP (1), pp. 2362–2376. Association for Computational Linguistics, 2020.

Qwen Team. Introducing Qwen1.5, 2024a. URL [https://qwenlm.github.io/blog/qwen1.5/](https://qwenlm.github.io/blog/qwen1.5/).

Qwen Team. Qwen1.5-110B: The first 100B+ model of the Qwen1.5 series, 2024b. URL [https://qwenlm.github.io/blog/qwen1.5-110b/](https://qwenlm.github.io/blog/qwen1.5-110b/).

Qwen Team. Qwen1.5-MoE: Matching 7B model performance with 1/3 activated parameters, 2024c. URL [https://qwenlm.github.io/blog/qwen-moe/](https://qwenlm.github.io/blog/qwen-moe/).

Rafael Rafailov, Archit Sharma, Eric Mitchell, Christopher D. Manning, Stefano Ermon, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. In NeurIPS, 2023.

Samyam Rajbhandari, Conglong Li, Zhewei Yao, Minjia Zhang, Reza Yazdani Aminabadi, Ammar Ahmad Awan, Jeff Rasley, and Yuxiong He. DeepSpeed-MoE: Advancing mixture-of-experts inference and training to power next-generation AI scale. In ICML, volume 162 of Proceedings of Machine Learning Research, pp. 18332–18346. PMLR, 2022.

Mathieu Ravaut, Bosheng Ding, Fangkai Jiao, Hailin Chen, Xingxuan Li, Ruochen Zhao, Chengwei Qin, Caiming Xiong, and Shafiq Joty. How much are LLMs contaminated? A comprehensive survey and the llmsanitize library. CoRR, abs/2404.00699, 2024.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. GPQA: A graduate-level Google-proof Q&A benchmark. CoRR, abs/2311.12022, 2023.

Oscar Sainz, Jon Ander Campos, Iker Garc´ıa-Ferrero, Julen Etxaniz, Oier Lopez de Lacalle, and Eneko Agirre. NLP evaluation in trouble: On the need to measure LLM data contamination for each benchmark. In EMNLP (Findings), pp. 10776–10787. Association for Computational Linguistics, 2023.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. WinoGrande: An adversarial winograd schema challenge at scale. Commun. ACM, 64(9):99–106, 2021.

Jianlin Su. The magical effect of the Bias term: RoPE + Bias = better length extrapolation, 2023. URL [https://spaces.ac.cn/archives/9577](https://spaces.ac.cn/archives/9577).

Jianlin Su, Murtadha H. M. Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced Transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

Mirac Suzgun, Nathan Scales, Nathanael Scharli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, ¨ Aakanksha Chowdhery, Quoc V. Le, Ed H. Chi, Denny Zhou, and Jason Wei. Challenging BIG-Bench tasks and whether chain-of-thought can solve them. In ACL (Findings), pp. 13003–13051. Association for Computational Linguistics, 2023.

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothee´ Lacroix, Baptiste Roziere, Naman Goyal, Eric Hambro, Faisal Azhar, Aur \` elien Rodriguez, Armand ´ Joulin, Edouard Grave, and Guillaume Lample. LLaMA: Open and efficient foundation language models. CoRR, abs/2302.13971, 2023.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, and Illia Polosukhin. Attention is all you need. In NIPS, pp. 5998–6008, 2017.

<!-- page 26 of 26 -->

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark. CoRR, abs/2406.01574, 2024.

Wenhan Xiong, Jingyu Liu, Igor Molybog, Hejia Zhang, Prajjwal Bhargava, Rui Hou, Louis Martin, Rashi Rungta, Karthik Abinav Sankararaman, Barlas Oguz, Madian Khabsa, Han Fang, Yashar Mehdad, Sharan Narang, Kshitiz Malik, Angela Fan, Shruti Bhosale, Sergey Edunov, Mike Lewis, Sinong Wang, and Hao Ma. Effective long-context scaling of foundation models. CoRR, abs/2309.16039, 2023.

Yinfei Yang, Yuan Zhang, Chris Tar, and Jason Baldridge. PAWS-X: A cross-lingual adversarial dataset for paraphrase identification. In EMNLP/IJCNLP (1), pp. 3685–3690. Association for Computational Linguistics, 2019.

Alex Young, Bei Chen, Chao Li, Chengen Huang, Ge Zhang, Guanwei Zhang, Heng Li, Jiangcheng Zhu, Jianqun Chen, Jing Chang, Kaidong Yu, Peng Liu, Qiang Liu, Shawn Yue, Senbin Yang, Shiming Yang, Tao Yu, Wen Xie, Wenhao Huang, Xiaohui Hu, Xiaoyi Ren, Xinyao Niu, Pengcheng Nie, Yuchi Xu, Yudong Liu, Yue Wang, Yuxuan Cai, Zhenyu Gu, Zhiyuan Liu, and Zonghong Dai. Yi: Open foundation models by 01.AI. CoRR, abs/2403.04652, 2024.

Tao Yuan, Xuefei Ning, Dong Zhou, Zhijie Yang, Shiyao Li, Minghui Zhuang, Zheyue Tan, Zhuyu Yao, Dahua Lin, Boxun Li, Guohao Dai, Shengen Yan, and Yu Wang. LV-Eval: A balanced long-context benchmark with 5 length levels up to 256K. CoRR, abs/2402.05136, 2024.

Zheng Yuan, Hongyi Yuan, Chengpeng Li, Guanting Dong, Chuanqi Tan, and Chang Zhou. Scaling relationship on learning mathematical reasoning with large language models. CoRR, abs/2308.01825, 2023.

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence? In ACL (1), pp. 4791–4800. Association for Computational Linguistics, 2019.

Aohan Zeng, Bin Xu, Bowen Wang, Chenhui Zhang, Da Yin, Diego Rojas, Guanyu Feng, Hanlin Zhao, Hanyu Lai, Hao Yu, Hongning Wang, Jiadai Sun, Jiajie Zhang, Jiale Cheng, Jiayi Gui, Jie Tang, Jing Zhang, Juanzi Li, Lei Zhao, Lindong Wu, Lucen Zhong, Mingdao Liu, Minlie Huang, Peng Zhang, Qinkai Zheng, Rui Lu, Shuaiqi Duan, Shudan Zhang, Shulin Cao, Shuxun Yang, Weng Lam Tam, Wenyi Zhao, Xiao Liu, Xiao Xia, Xiaohan Zhang, Xiaotao Gu, Xin Lv, Xinghan Liu, Xinyi Liu, Xinyue Yang, Xixuan Song, Xunkai Zhang, Yifan An, Yifan Xu, Yilin Niu, Yuantao Yang, Yueyan Li, Yushi Bai, Yuxiao Dong, Zehan Qi, Zhaoyu Wang, Zhen Yang, Zhengxiao Du, Zhenyu Hou, and Zihan Wang. ChatGLM: A family of large language models from GLM-130B to GLM-4 all tools. CoRR, abs/2406.12793, 2024.

Yingxiu Zhao, Bowen Yu, Binyuan Hui, Haiyang Yu, Minghao Li, Fei Huang, Nevin L. Zhang, and Yongbin Li. Tree-Instruct: A preliminary study of the intrinsic relationship between complexity and alignment. In LREC/COLING, pp. 16776–16789. ELRA and ICCL, 2024.

Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, Siyuan Zhuang, Zhanghao Wu, Yonghao Zhuang, Zi Lin, Zhuohan Li, Dacheng Li, Eric P. Xing, Hao Zhang, Joseph E. Gonzalez, and Ion Stoica. Judging LLM-as-a-judge with MT-Bench and Chatbot Arena. In NeurIPS, 2023.

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. CoRR, abs/2311.07911, 2023.

26

> **想:** 正文写「approximately 30 languages」, 和 Table 13 只报 10 种语言人工分, 如何并存?
> 30 是预训练 / 能力声明的覆盖面; Table 13 是抽 10 语做 1–5 分人工评. 不要把表当成「只支持 10 语」.

> **问:** Embedding tying 为什么只开在 0.5B / 1.5B?
> Table 1 写明 True / True / False / False / False. 小模型用 tying 收参数; 7B 以上关闭. 正文未给关掉 tying 的消融, 当作配置事实即可.

> **核对:** Dual Chunk Attention 在单 chunk 内是否改注意力数值?
> §2.2.1 写清: 输入能落在一个 chunk 里时, DCA 与原注意力结果相同; 跨 chunk 才补相对位置信息.

> **问:** 预训练混了指令数据, Base 榜还能叫「未对齐」吗?
> 报告仍区分 foundational (pretrained but unaligned to human preferences) 与 instruction-tuned. 混入的是高质多任务指令数据以抬 in-context learning, 不等于已经走完 SFT+DPO. 读表时 Base / Instruct 仍分开.

> **看表:** 安全表「越低越好」和 Arena「越高越好」混读时要注意什么?
> Table 14 是有害回复占比; 其它能力表是准确率或均分. 引用时把度量方向写进同一句, 避免把 0.00 读成「零分很差」.

> **拆开:** 57B-A14B 的 Intermediate size 2560 和 7B 的 18944 差这么多, 还说从 7B 升档?
> 升档的是注意力宽与层等骨架, FFN 换成细专家后每个专家中间宽变小,专家个数变多. Table 1 的 2560 是每专家宽度, 不是 Dense 7B 的 FFN 宽度拷贝.

