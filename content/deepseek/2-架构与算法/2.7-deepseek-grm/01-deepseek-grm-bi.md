---
title: "DeepSeek-GRM 对照译稿"
category: "架构与算法"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek-GRM 论文 Inference-Time Scaling for Generalist Reward Modeling 的逐段中英对照, 覆盖正文与附录, 附疑点批注."
---

<!-- page 1 of 44 -->

arXiv:2504.02495v3 [cs.CL] 25 Sep 2025

Preprint. Under review.

# Inference-Time Scaling for Generalist Reward Modeling / 通用奖励建模的 TestingTime 扩展

**Zijun Liu**<sup>1,2†∗</sup>**, Peiyi Wang**<sup>1∗</sup>**, Runxin Xu**<sup>1</sup>**, Shirong Ma**<sup>1</sup>**, Chong Ruan**<sup>1</sup>, **Peng Li**<sup>3</sup>, **Yang Liu**<sup>2,3</sup>, **Yu Wu**<sup>1</sup>

<sup>1</sup>DeepSeek-AI, <sup>2</sup>Dept. of Computer Sci. & Tech., Tsinghua University, <sup>3</sup>Institute for AI Industry Research (AIR), Tsinghua University zj-liu24@mails.tsinghua.edu.cn, wangpeiyi9979@gmail.com

## Abstract

Reinforcement learning (RL) has been widely adopted in post-training for large language models (LLMs) at scale. Recently, the incentivization of reasoning capabilities in LLMs from RL indicates that proper learning methods could enable effective inference-time scalability. A key challenge of RL is to obtain accurate reward signals for LLMs in various domains beyond verifiable questions or artificial rules. In this work, we investigate how to improve reward modeling (RM) with more inference compute for general queries, i.e. the **inference-time scalability of generalist RM**. For the RM approach, we adopt pointwise generative reward modeling (GRM) to enable flexibility for different input types and the potential for inference-time scaling. For the learning method, we propose **Self-Principled Critique Tuning** (SPCT) to foster scalable reward generation behaviors in GRMs through online RL, to generate principles adaptively and critiques accurately, resulting in **DeepSeek-GRM** models. Furthermore, for effective inference-time scaling, we use parallel sampling to expand compute usage, and introduce a meta RM to guide the voting process for better scaling performance. Empirically, we show that SPCT significantly improves the quality and scalability of GRMs, outperforming existing methods and models in various RM benchmarks without severe biases, and it can achieve better performance compared to training-time scaling. DeepSeek-GRM still meets challenges in some tasks, which we believe can be addressed by future efforts in generalist reward systems. The models are released at [Hugging Face](https://huggingface.co/collections/BBQGOD/deepseek-grm-68b4681169dbb97fd30614b5) and [ModelScope](https://www.modelscope.cn/collections/DeepSeek-GRM-ff6a2d8babdd4a).

强化学习 (RL) 已被大规模用于大语言模型 (LLM) 的后训练. 近来用 RL 激发 LLM 推理能力的工作表明, 合适的学习方法能带来有效的 TestingTime 可扩展性. RL 的一个关键难题, 是在可验证问题和人工规则之外的各种领域里为 LLM 拿到准确的奖励信号. 本工作研究如何在通用查询上用更多推理算力改进奖励建模 (RM), 即**通用 RM 的 TestingTime 可扩展性**. RM 方法上, 我们采用 pointwise 生成式奖励建模 (GRM), 让它能灵活处理不同类型的输入, 并具备 TestingTime 扩展的潜力. 学习方法上, 我们提出**自原则评语微调** (Self-Principled Critique Tuning, SPCT), 通过在线 RL 在 GRM 中培养可扩展的奖励生成行为: 自适应地生成原则, 准确地写出评语, 由此得到 **DeepSeek-GRM** 系列模型. 为了让 TestingTime 扩展有效, 我们用并行采样增加算力投入, 并引入一个 meta RM 来引导投票, 获得更好的扩展表现. 实验表明, SPCT 显著提升了 GRM 的质量和可扩展性, 在多个 RM 基准上超过现有方法和模型, 没有严重的偏差, 而且效果可以好于训练侧扩大模型规模. DeepSeek-GRM 在部分任务上仍有困难, 我们相信未来在通用奖励系统上的工作可以解决这些问题. 模型已发布在 [Hugging Face](https://huggingface.co/collections/BBQGOD/deepseek-grm-68b4681169dbb97fd30614b5) 和 [ModelScope](https://www.modelscope.cn/collections/DeepSeek-GRM-ff6a2d8babdd4a).

## 1 Introduction

The remarkable advancements in large language models (LLMs) (DeepSeek-AI, 2024b; OpenAI, 2025b) have catalyzed significant shifts in artificial intelligence research, enabling models to perform tasks that require understanding, generation, and nuanced decision-making capabilities. Recently, reinforcement learning (RL) as a post-training method for LLMs has been widely adopted at scale, and resulting in remarkable improvements in human value alignment (Ouyang et al., 2022; Bai et al., 2022a), long-term reasoning (DeepSeek-AI, 2025; OpenAI, 2025c), and environment adaptation (OpenAI, 2025a) for LLMs. Reward modeling (RM) (Gao et al., 2023), as

![Image block](./images/p01-figure-1-inference-time-scaling-performance-with-different-rms.jpg)

Figure 1: Inference-time scaling performance with different RMs on all tested RM benchmarks. Results are shown with up to 8 samples for each method, and are further scaled to 32 samples for ours. Non-italic font indicates models based on Gemma-2-27B.

\*Equal contribution. <sup>†</sup>Work done during internship at DeepSeek-AI.

\*同等贡献. <sup>†</sup>在 DeepSeek-AI 实习期间完成的工作.

<!-- page 2 of 44 -->

Preprint. Under review.

a crucial component in RL, is essential for generating accurate reward signals for LLM responses. Current studies (Lightman et al., 2024; DeepSeek-AI, 2025) also show that, with high-quality and robust rewards in either training or inference time, LLMs can achieve strong performance in specific domains.

大语言模型 (DeepSeek-AI, 2024b; OpenAI, 2025b) 的显著进步推动了人工智能研究的重大转向, 让模型能完成需要理解, 生成和细致决策的任务. 近来, RL 作为 LLM 的后训练方法被大规模采用, 在人类价值对齐 (Ouyang et al., 2022; Bai et al., 2022a), 长程推理 (DeepSeek-AI, 2025; OpenAI, 2025c) 和环境适应 (OpenAI, 2025a) 上都带来了明显提升. 奖励建模 (RM) (Gao et al., 2023) 是 RL 的关键组件, 负责为 LLM 的回答生成准确的奖励信号. 现有研究 (Lightman et al., 2024; DeepSeek-AI, 2025) 也表明, 只要在训练时或推理时有高质量, 稳健的奖励, LLM 就能在特定领域取得很强的表现.

However, such high-quality rewards in specific domains are mainly obtained from humandesigned environments with clear conditions (Yao et al., 2022; Xie et al., 2024) or from hand-crafted rules for verifiable questions, e.g., mathematical problems (Hendrycks et al., 2021; Veeraboina, 2023) and coding tasks (Jimenez et al., 2024; Zhuo et al., 2025). In general domains, reward generation is more challenging, as the criteria for rewards are more diverse and complex, and there are often no explicit reference or ground truth. Generalist reward modeling is thus crucial for improving the performance of LLMs in broader applications, either from post-training perspectives, e.g., RL at scale, or from inference perspectives, e.g., RM-guided search. Furthermore, RM performance should be improved by increasing both the training compute (Gao et al., 2023) and the inference compute.

但这类特定领域的高质量奖励, 主要来自条件明确的人工设计环境 (Yao et al., 2022; Xie et al., 2024), 或者来自为可验证问题手写的规则, 例如数学题 (Hendrycks et al., 2021; Veeraboina, 2023) 和编程任务 (Jimenez et al., 2024; Zhuo et al., 2025). 在通用领域, 奖励生成难得多: 评判标准更多样, 更复杂, 而且常常没有明确的参考答案或真值. 因此, 大规模 RL 与 RM 引导的搜索若要扩展到更多场景, 都需要能够处理开放标准和无参考答案的通用奖励模型. 此外, RM 的表现应当能随训练算力 (Gao et al., 2023) 和推理算力的增加而提升.

In practice, challenges arise in making RMs both general and effectively scalable in inference time. The former demands (1) flexibility for different input types and (2) accurate reward generation in various domains. We refer to this paradigm as **generalist reward modeling**. Moreover, effective **inference-time scalability** requires the RM (3) to generate higher-quality reward signals with increased inference compute, and (4) to learn scalable behaviors for better performance-compute scaling. Existing research on reward modeling demonstrates several paradigms for reward generation, including scalar (Cobbe et al., 2021; Wang et al., 2024e; Liu et al., 2024), semi-scalar (Ye et al., 2025a; Yu et al., 2025b; Zhang et al., 2025a), and generative (Li et al., 2024a; Kim et al., 2024; Vu et al., 2024; Cao et al., 2024; Arabzadeh et al., 2024; Ye et al., 2025b; Alexandru et al., 2025; Yu et al., 2025a) approaches, and various scoring patterns, such as pointwise (Kendall & Smith, 1940; Gao et al., 2023; Yuan et al., 2024; Winata et al., 2025; Guo et al., 2025) and pairwise (Park et al., 2024; Zheng et al., 2023; Jiang et al., 2023; Wang et al., 2024c; Liu et al., 2025). These approaches inherently determine the input flexibility and the inference-time scalability of RMs ((1)&(3)), as shown in Figure 2. For instance, pairwise RMs only consider the relative preference of paired responses, lacking flexibility to accept single or multiple responses as input; scalar RMs could hardly generate diverse reward signals for the same response, which obstructs getting better rewards through sampling-based inference-time scaling methods (Snell et al., 2025). Also, different learning methods (Wang et al., 2024a; Ankner et al., 2024; Wang et al., 2024c; Mahan et al., 2024) have been proposed to improve the quality of rewards, but few of them focus on inference-time scalability and study the interconnection between the learned reward generation behaviors and the effectiveness of inference-time scaling of RMs, resulting in marginal performance improvement ((2)&(4)). Current research (DeepSeek-AI, 2025) indicates that effective inference-time scalability could be enabled by proper learning methods, which raises the question: Can we design a learning method aiming to enable effective inference-time scaling for generalist reward modeling?

实践中, 要让 RM 既通用又能在推理时有效扩展, 会遇到几个难题. 通用性要求 (1) 能灵活处理不同类型的输入, (2) 在各个领域都能生成准确的奖励. 我们把这种范式称为**通用奖励建模**. 有效的 **TestingTime 可扩展性**则要求 RM (3) 推理算力增加时能生成质量更高的奖励信号, (4) 学到可扩展的行为, 使性能随算力的增长曲线更好. 现有奖励建模研究给出了几种奖励生成范式: 标量 (Cobbe et al., 2021; Wang et al., 2024e; Liu et al., 2024), 半标量 (Ye et al., 2025a; Yu et al., 2025b; Zhang et al., 2025a) 和生成式 (Li et al., 2024a; Kim et al., 2024; Vu et al., 2024; Cao et al., 2024; Arabzadeh et al., 2024; Ye et al., 2025b; Alexandru et al., 2025; Yu et al., 2025a); 以及几种打分模式, 如 pointwise (Kendall & Smith, 1940; Gao et al., 2023; Yuan et al., 2024; Winata et al., 2025; Guo et al., 2025) 和 pairwise (Park et al., 2024; Zheng et al., 2023; Jiang et al., 2023; Wang et al., 2024c; Liu et al., 2025). 如图 2 所示, 这些方法从根本上决定了 RM 的输入灵活性和 TestingTime 可扩展性 ((1)&(3)). 例如, pairwise RM 只考虑一对回答之间的相对偏好, 无法灵活地接受单个或多个回答作为输入; 标量 RM 很难对同一个回答生成不同的奖励信号, 这妨碍了用基于采样的 TestingTime 扩展方法 (Snell et al., 2025) 得到更好的奖励. 另外, 已有不少学习方法 (Wang et al., 2024a; Ankner et al., 2024; Wang et al., 2024c; Mahan et al., 2024) 被提出来提升奖励质量, 但很少有工作关注 TestingTime 可扩展性, 研究学到的奖励生成行为和 RM 的 TestingTime 扩展效果之间的联系, 结果性能提升有限 ((2)&(4)). 现有研究 (DeepSeek-AI, 2025) 表明, 合适的学习方法可以带来有效的 TestingTime 可扩展性, 这就引出一个问题: 能不能设计一种学习方法, 专门让通用奖励建模获得有效的 TestingTime 扩展?

In this work, we investigated different approaches for RM, and found that pointwise generative reward modeling (GRM) could unify the scoring of single, paired, and multiple responses within pure language representation, overcoming challenge (1). We explored that certain principles could guide reward generation within proper criteria for GRMs, improving the quality of rewards, which suggested that inference-time scalability of RM might be achieved by scaling the generation of high-quality principles and accurate critiques. Based on this preliminary, we propose a novel learning method, **Self-Principled Critique Tuning** (SPCT), to foster effective inference-time scalable behaviors in GRMs. By leveraging rulebased online RL, SPCT enables GRMs to learn to adaptively posit principles and critiques based on the input query and responses, leading to better outcome rewards in general domains (challenge (2)). We then come up with **DeepSeek-GRM-27B**, which is post-trained with SPCT based on Gemma-2-27B (Team, 2024). For inference-time scaling, we expand compute usage by sampling multiple times. By sampling in parallel, DeepSeek-GRM could generate different sets of principles and corresponding critiques, and then vote for the final reward. **With larger-scale sampling, DeepSeek-GRM could judge more accurately based on more diverse principles, and output rewards with finer granularity**, which resolves challenge (3)&(4). Furthermore, we train a meta RM in addition to voting for

<!-- page 3 of 44 -->

Preprint. Under review.

![Image block](./images/p03-figure-2-different-paradigms-for-reward-generation-including-a.jpg)

Figure 2: Different paradigms for reward generation, including (a) scalar, (b) semi-scalar, and (c) generative approaches, and different scoring patterns, including (i) pointwise and (ii) pairwise approaches. We list the representative methods for each approach, and corresponding inference-time scalability (whether better rewards could be obtained from multiple sampling) and input flexibility (whether supports rating single and multiple responses).

better scaling performance. Empirically, we show that SPCT significantly improves the quality and scalability of GRMs, outperforming existing methods and models in multiple comprehensive RM benchmarks without severe domain biases. We also compared the inference-time scaling performance of DeepSeek-GRM-27B with larger models up to 671B parameters, and found it could achieve better performance compared to training-time scaling on model sizes. Though the current method meets challenges in efficiency and specific tasks, with efforts beyond SPCT, we believe GRMs with enhanced scalability and efficiency could serve as a versatile interface for generalist reward systems, advancing the frontiers of LLM post-training and inference.

本工作考察了多种 RM 方法, 发现 pointwise 生成式奖励建模 (GRM) 能在纯语言表示内统一单个, 成对和多个回答的打分, 克服难题 (1). 我们还发现, 一定的原则可以把 GRM 的奖励生成约束在合适的标准之内, 提升奖励质量; 这提示 RM 的 TestingTime 可扩展性也许可以通过扩大高质量原则和准确评语的生成来实现. 在这一初步结论的基础上, 我们提出一种新的学习方法: **自原则评语微调** (SPCT), 在 GRM 中培养有效的 TestingTime 可扩展行为. SPCT 借助基于规则的在线 RL, 让 GRM 学会根据输入的查询和回答自适应地提出原则和评语, 在通用领域得到更好的结果奖励 (难题 (2)). 我们由此得到 **DeepSeek-GRM-27B**, 它基于 Gemma-2-27B (Team, 2024) 用 SPCT 后训练得到. 在 TestingTime 扩展上, 我们通过多次采样增加算力投入. 并行采样时, DeepSeek-GRM 能生成多组不同的原则和对应的评语, 再对最终奖励投票. **采样规模越大, DeepSeek-GRM 依据的原则越多样, 判断越准确, 输出的奖励粒度也越细**, 这解决了难题 (3)&(4). 此外, 在投票之外我们还训练了一个 meta RM, 进一步提升扩展表现. 实验表明, SPCT 显著提升了 GRM 的质量和可扩展性, 在多个综合 RM 基准上超过现有方法和模型, 没有严重的领域偏差. 我们还把 DeepSeek-GRM-27B 的 TestingTime 扩展表现与参数量最高 671B 的更大模型做了比较, 发现它可以好于训练侧扩大模型规模. 当前方法在效率和特定任务上仍有困难, 但我们相信, 在 SPCT 之外继续努力, 可扩展性和效率都更强的 GRM 可以成为通用奖励系统的通用接口, 推进 LLM 后训练和推理的前沿.

In general, our main contributions are as follows.

总的来说, 我们的主要贡献如下.

1. We propose a novel approach, **Self-Principled Critique Tuning** (SPCT), to foster effective inference-time scalability for generalist reward modeling, resulting in **DeepSeek-GRM** models. And we further introduce a meta RM to effectively improve the inference-time scaling performance of DeepSeek-GRM beyond voting.

1. 我们提出一种新方法: **自原则评语微调** (SPCT), 为通用奖励建模培养有效的 TestingTime 可扩展性, 由此得到 **DeepSeek-GRM** 系列模型. 我们还引入 meta RM, 在投票之外进一步有效提升 DeepSeek-GRM 的 TestingTime 扩展表现.

2. We empirically show SPCT significantly improves the quality and inference-time scalability of GRMs over existing methods and several strong public models.

2. 实验表明, 相比现有方法和几个强的公开模型, SPCT 显著提升了 GRM 的质量和 TestingTime 可扩展性.

3. We also applied the SPCT training schedule to LLMs with larger sizes and found that inference-time scaling could outperform model size scaling in training time.

3. 我们还把 SPCT 的训练流程用到更大的 LLM 上, 发现 TestingTime 扩展可以好于训练侧扩大模型规模.

## 2 Preliminaries · 预备知识

## 2.1 Comparisons of Different RM approaches · 不同 RM 方法的比较

As shown in Figure 2, RM approaches are mainly determined by reward generation paradigms and scoring patterns, which inherently affect the inference-time scalability and the input flexibility of the RM. For **reward generation paradigms**, we distinguish three main approaches: scalar, semi-scalar, and generative. For **scoring patterns**, we distinguish two main approaches: pointwise and pairwise. To expand compute usage in inference time, we focus on sampling-based methods, which generate multiple sets of rewards for the same query and responses, and then aggregate the final reward. Thus, the inference-time scalability of RMs is determined by whether different rewards could be obtained from multiple sampling, where scalar RMs would fail in most cases due to the invariant generation of rewards; and the input flexibility is defined by whether the RM supports rating single, paired, and

<!-- page 4 of 44 -->

Preprint. Under review.

multiple responses, where pairwise RMs could hardly rate single responses and usually require extra techniques (Jiang et al., 2023; Liu et al., 2025) to handle multiple responses.

如图 2 所示, RM 方法主要由奖励生成范式和打分模式决定, 二者从根本上影响 RM 的 TestingTime 可扩展性和输入灵活性. **奖励生成范式**分三类: 标量, 半标量和生成式. **打分模式**分两类: pointwise 和 pairwise. 为了在推理时增加算力投入, 我们关注基于采样的方法: 对同一个查询和同一组回答生成多组奖励, 再聚合出最终奖励. 因此, RM 的 TestingTime 可扩展性取决于多次采样能否得到不同的奖励, 标量 RM 生成的奖励不变, 多数情况下做不到这一点; 输入灵活性则看 RM 是否支持给单个, 成对和多个回答打分, pairwise RM 很难给单个回答打分, 处理多个回答通常也需要额外技巧 (Jiang et al., 2023; Liu et al., 2025).

**Reward Generation Paradigms** Classic RMs adopt the **(a) scalar** approach to generate rewards (R), which assigns scalar values to the given query and responses. The scalar approach is further extended to the **(b) semi-scalar** approach, which generates texts in addition to the scalar value. And the **(c) generative** approach only generates textual rewards.

**奖励生成范式** 经典 RM 采用 **(a) 标量**方法生成奖励 ($\mathcal R$), 即给定查询和回答, 输出标量值. 标量方法进一步扩展为 **(b) 半标量**方法, 在标量值之外再生成文本. **(c) 生成式**方法只生成文本形式的奖励.

$$
\mathcal {R} = \left\{ \begin{array}{l l} \boldsymbol {S} & (\text {Scalar}) \\ (\boldsymbol {S}, \boldsymbol {C}) & (\text {Semi - Scalar}) \sim r _ {\theta} \left(x, \left\{y _ {i} \right\} _ {i = 1} ^ {n}\right), \\ \boldsymbol {C} & (\text {Generative}) \end{array} \right.\tag{1}
$$

where x is the query, $y _ { i }$ is the i-th response, $r _ { \theta }$ is the reward function parameterized by θ, $S \in \mathbb { R } ^ { m } , m \leq n$ is the scalar reward, and C is the critique.

其中 $x$ 是查询, $y_i$ 是第 $i$ 个回答, $r_\theta$ 是参数为 $\theta$ 的奖励函数, $S\in\mathbb R^m, m\le n$ 是标量奖励, $C$ 是评语.

**Scoring Patterns** We distinguish two main scoring approaches for rewards: pointwise and pairwise. The **(i) pointwise** approach assigns an individual score to each response:

**打分模式** 我们区分两种主要的打分方式: pointwise 和 pairwise. **(i) pointwise** 方法给每个回答单独打一个分:

$$
\{S _ {i} \} _ {i = 1} ^ {n} = f _ {\mathrm{point}} \left(\mathcal {R}, \{y _ {i} \} _ {i = 1} ^ {n}\right), \quad \mathcal {R} \sim r _ {\theta} \left(x, \{y _ {i} \} _ {i = 1} ^ {n}\right), S _ {i} \in \mathbb {R},\tag{2}
$$

where $f _ { \mathrm { p o i n t } } ( \cdot , \cdot )$ is a splitting function. In contrast, the **(ii) pairwise** approach can be viewed as a best-of-n method, selecting a single best response from all candidates:

其中 $f_{\mathrm{point}}(\cdot,\cdot)$ 是拆分函数. 与之相对, **(ii) pairwise** 方法可以看作一种 best-of-n 方法, 从所有候选里选出一个最好的回答:

$$
\hat {y} = f _ {\text {pair}} (\mathcal {R}, \{y _ {i} \} _ {i = 1} ^ {n}), \quad \mathcal {R} \sim r _ {\theta} (x, \{y _ {i} \} _ {i = 1} ^ {n}), \hat {y} \in \{y _ {i} \} _ {i = 1} ^ {n},\tag{3}
$$

where $f _ { \mathrm { p a i r } } ( \cdot , \cdot )$ is a selection function and $n   =   2$ in most cases. Though the pairwise approach could be extended to $n > 2 ,$ , it could not be applied to single response scoring $( \widehat { n = 1 } )$ ).

其中 $f_{\mathrm{pair}}(\cdot,\cdot)$ 是选择函数, 多数情况下 $n=2$. pairwise 方法虽然可以扩展到 $n>2$, 却无法用于单个回答的打分 ($n=1$).

**Representative Methods** Figure 2 illustrates how the three reward generation paradigms (scalar, semi-scalar, generative) can be combined with the two scoring patterns (pointwise, pairwise). Specifically, Bradley-Terry model (Kendall & Smith, 1940) $( \widetilde { ( a ) } { + } ( i ) )$ is trained with pairwise preference data and outputs scalar rewards pointwisely

**代表性方法** 图 2 展示了三种奖励生成范式 (标量, 半标量, 生成式) 如何与两种打分模式 (pointwise, pairwise) 组合. 具体来说, Bradley-Terry 模型 (Kendall & Smith, 1940) ((a)+(i)) 用成对偏好数据训练, 以 pointwise 方式输出标量奖励:

$$
\{S _ {i} \} _ {i = 1} ^ {n} = f _ {\text {point}} \left(\mathcal {R}, \{y _ {i} \} _ {i = 1} ^ {n}\right) = \boldsymbol {S} \in \mathbb {R} ^ {n}.\tag{4}
$$

PairRM (Jiang et al., 2023) ((a)+(ii)) compares a pair of responses with the sign of the scalar reward

PairRM (Jiang et al., 2023) ((a)+(ii)) 用标量奖励的符号来比较一对回答:

$$
\hat {y} = f _ {\text {pair}} \left(\mathcal {R}, \{y _ {i} \} _ {i = 1} ^ {n}\right) = y _ {\lfloor \frac {1}{2} (3 - \operatorname{sgn} (S)) \rfloor}, \quad n = 2, \mathcal {S} \in \mathbb {R}.\tag{5}
$$

The scalar methods above could barely perform inference-time scaling due to the lack of diversity in reward generation. CLoud (Ankner et al., 2024) $( ( b ) { + } ( i ) \tilde { ) }$ generates scalar rewards for each response based on pre-generated critiques, similar to Equation 4. LLM-asa-Judge (Zheng et al., 2023; Wang et al., 2025a) $( ( c ) { + } ( i i ) )$ judges the preference order between paired responses textually,

上面这些标量方法的奖励生成缺乏多样性, 几乎无法做 TestingTime 扩展. CLoud (Ankner et al., 2024) ((b)+(i)) 先生成评语, 再据此为每个回答生成标量奖励, 形式与式 (4) 相似. LLM-as-a-Judge (Zheng et al., 2023; Wang et al., 2025a) ((c)+(ii)) 用文本判断一对回答的偏好顺序:

$$
\hat {y} = f _ {\mathrm{pair}} \left(\mathcal {R}, \{y _ {i} \} _ {i = 1} ^ {n}\right) = y _ {f _ {\mathrm{extract}} (C)}, \quad n = 2,\tag{6}
$$

where $f _ { \mathsf { e x t r a c t } } ( \cdot )$ extracts the index of best response from language representations. However, this approach defaults to neglecting ties of the paired responses. Following Zhang et al. (2025a), the generation probability of the token that indicates the preference order could be used as the scalar reward $( ( b ) { + } ( i i ) )$ : S = TokenProb $\begin{array} { r } { \hat { \left( C \right) } = r _ { \theta } \hat { \left( C | x , \left\{ y _ { i } \right\} _ { i = 1 } ^ { n } \right) } } \end{array}$ , where $\hat { C }$ is a pre-defined token related to the preference order. However, without additional constraints, GRMs are able to generate pointwise rewards for multiple responses within pure language representations $( ( \widetilde { c } ) { + } ( i ) )$ :

其中 $f_{\mathrm{extract}}(\cdot)$ 从语言表示中抽取最佳回答的下标. 不过, 这种方法默认忽略了一对回答打平的情况. 按照 Zhang et al. (2025a) 的做法, 可以把表示偏好顺序的 token 的生成概率当作标量奖励 ((b)+(ii)): $S=\mathrm{TokenProb}(\hat C)=r_\theta(\hat C\mid x,\{y_i\}_{i=1}^n)$, 其中 $\hat C$ 是一个与偏好顺序相关的预定义 token. 然而, 在不加额外约束的情况下, GRM 本来就能在纯语言表示内为多个回答生成 pointwise 奖励 ((c)+(i)):

$$
\{S _ {i} \} _ {i = 1} ^ {n} = f _ {\text {point}} \left(\mathcal {R}, \{y _ {i} \} _ {i = 1} ^ {n}\right) = f _ {\text {extract}} (\boldsymbol {C}),\tag{7}
$$

where $f _ { \mathsf { e x t r a c t } } ( \cdot )$ extracts the rewards assigned to each response from generation results. Usually, the rewards are discrete, and in this work we assign $\left[ S _ { i } \in \mathbb { N } , 1 \leq \overset { \circ } { S _ { i } } \leq 1 0 \right.$ by default. This approach enables both inference-time scalability and input flexibility.

其中 $f_{\mathrm{extract}}(\cdot)$ 从生成结果中抽取分给每个回答的奖励. 奖励通常是离散的, 本工作默认取 $S_i\in\mathbb N$, $1\le S_i\le 10$. 这种方法同时具备 TestingTime 可扩展性和输入灵活性.

<!-- page 5 of 44 -->

Preprint. Under review.

## 2.2 Boosting Reward Quality with Principles · 用原则提升奖励质量

Generalist RM requires generating high-quality rewards beyond specific domains (Hendrycks et al., 2021; Jimenez et al., 2024), where the criteria for rewards are more diverse and complex, and there are often no explicit reference or ground truth. To this end, for general domains, we adopt principles to guide reward generation in place of artificial rules. Principles for LLMs are first introduced in Constitutional AI (Bai et al., 2022b; Sharma et al., 2025), which are hand-crafted criteria that guide the LLMs or curated classifiers to construct safe data pipelines. With principles, the reward generation of GRMs changes to

通用 RM 需要在特定领域 (Hendrycks et al., 2021; Jimenez et al., 2024) 之外生成高质量奖励, 而这些领域的评判标准更多样, 更复杂, 常常没有明确的参考答案或真值. 为此, 在通用领域我们用原则代替人工规则来引导奖励生成. LLM 的原则最早由 Constitutional AI (Bai et al., 2022b; Sharma et al., 2025) 提出, 是一组人工撰写的标准, 用来引导 LLM 或专门的分类器构建安全的数据流水线. 引入原则后, GRM 的奖励生成变为

$$
\mathcal {R} = \boldsymbol {C} \sim r _ {\theta} \left(x, \{y _ {i} \} _ {i = 1} ^ {n}, \{p _ {i} \} _ {i = 1} ^ {m}\right),\tag{8}
$$

where $\{ p _ { i } \} _ { i = 1 } ^ { m }$ denotes the principles. We conduct a preliminary experiment to examine the influence of proper principles on reward quality, with the Chat Hard subset of Reward Bench (Lambert et al., 2024) and the IFEval subset of the PPE benchmark (Frick et al., 2025)

其中 $\{p_i\}_{i=1}^m$ 表示原则. 我们做了一个初步实验, 考察合适的原则对奖励质量的影响, 用的是 Reward Bench (Lambert et al., 2024) 的 Chat Hard 子集和 PPE 基准 (Frick et al., 2025) 的 IFEval 子集.

In the experiment, data samples contain a query and two responses, with the groundtruth label denoting the better response. We use GPT-4o-2024-08-06 to generate the principles and then pointwise rewards four times for each sample. We filter the principles from the correct reward generation process, where the larger reward value is assigned to the labeled better response. We test different LLMs with principles generated by themselves and the filtered principles, and compare them with the default setting with no principle guidance. The results are shown in Table 1. We found that

| Method | Chat Hard | IFEval |
| --- | --- | --- |
| GPT-4o-2024-08-06 | 76.1 | 56.0 |
| w/ Self-Gen. Principles | 75.9 | 55.6 |
| w/ Filtered Principles | 77.8 | 57.5 |
| Gemma-2-27B-it | 59.1 | 56.1 |
| w/ Self-Gen. Principles | 64.0 | 55.8 |
| w/ Filtered Principles | 68.0 | 57.3 |

Table 1: Preliminary experiments on the influence of principles on reward quality. The default setting of DeepSeek-GRM-27B includes self-generated principles.

the self-generated principles barely improve performance, but the filtered principles could significantly boost the reward quality. The result is non-trivial and two main conclusions could be drawn: (a) Current LLMs could generate diverse principles, but not all of them are proper for reward generation. (b) A subset of generated principles could better guide reward generation under correct criteria, indicating a potential of self-bootstrapping. These findings are the foundation of the usage of online RL to optimize GRMs, where they could learn from the principles generated by themselves with a clear signal to tell whether the principles are proper or not. Other details are depicted in Appendix D.

实验中, 每个数据样本包含一个查询和两个回答, 真值标签指出哪个回答更好. 我们用 GPT-4o-2024-08-06 为每个样本生成原则, 再生成 pointwise 奖励, 重复四次. 我们从奖励生成正确的过程中筛出原则, 「正确」指给标注为更好的回答打了更高的分. 我们测试了不同 LLM 分别使用自己生成的原则和筛选后的原则的效果, 并与不加原则引导的默认设置对比, 结果见表 1. 我们发现, 自己生成的原则几乎没有提升, 而筛选后的原则能显著提升奖励质量. 这个结果并不显然, 可以得出两点主要结论: (a) 现有 LLM 能生成多样的原则, 但不是每条都适合用来生成奖励. (b) 生成的原则中有一部分能在正确的标准下更好地引导奖励生成, 说明存在自举的潜力. 这些发现是我们用在线 RL 优化 GRM 的基础: GRM 可以从自己生成的原则中学习, 并有清晰的信号告诉它这些原则是否合适. 其他细节见附录 D.

> **想:** 表 1 里 Filtered Principles 一行的提升, 能不能当作 GRM 在测评时可达到的上限?
> 答: 不能. 按第 2.2 节的做法, 筛选条件是「这次奖励生成把更高分给了标注更好的回答」, 也就是用测试样本的真值标签挑原则, 测评时拿不到这个信号. 所以 Filtered 一行 (GPT-4o 的 Chat Hard 从 76.1 到 77.8, Gemma-2-27B-it 从 59.1 到 68.0) 衡量的是「存在好原则」, 不是「模型能自己选出好原则」. 这正是 SPCT 要补的环节: 把标签信号从测评时挪到训练时, 用式 (11) 的规则奖励去奖励那些产生正确排序的原则. 附录 E.2 的表 14 给出了对照: DeepSeek-GRM-27B 自己生成原则时 Chat Hard 是 78.3, 换成同一批 Filtered 原则反而降到 77.0, 说明训练后模型自生成的原则已经不弱于这批用标签挑出来的原则.

## 3 Self-Principled Critique Tuning (SPCT) · 自原则评语微调

Inspired by the preliminary results, we developed a novel approach for pointwise GRMs to learn generating adaptive and high-quality principles that could effectively guide the generation of critiques, termed **Self-Principled Critique Tuning** (SPCT). As shown in Figure 3, SPCT consists of two phases: rejective fine-tuning, as the cold start, and rule-based online RL, reinforcing generalist reward generation by advancing the generated principles and critiques. SPCT fosters these behaviors in GRMs for inference-time scaling as well.

受初步结果启发, 我们为 pointwise GRM 设计了一种新方法, 让它学会生成自适应的高质量原则, 有效引导评语的生成, 称为**自原则评语微调** (SPCT). 如图 3 所示, SPCT 分两个阶段: 拒绝采样微调 (rejective fine-tuning) 作为冷启动; 基于规则的在线 RL 通过改进生成的原则和评语来强化通用奖励生成. SPCT 也在 GRM 中培养了用于 TestingTime 扩展的这些行为.

## 3.1 Unpinning Principles from Understanding to Generation · 把原则从理解环节挪到生成环节

From preliminary experiments in Section 2.2, we found that proper principles could guide reward generation within certain criteria, which is critical for high-quality rewards. However, it remains challenging to generate effective principles for generalist RM at scale. To address this challenge, we propose to unpin principles from understanding to generation, i.e. view principles as a part of reward generation instead of a preprocessing step.

第 2.2 节的初步实验表明, 合适的原则能约束奖励生成并提高奖励质量. 但大规模地为通用 RM 生成有效原则仍然困难. 为此, 我们把原则从理解环节移到生成环节, 将原则视为奖励生成的一部分, 不再作为预处理步骤.

Formally, principles guide the generation of rewards following Equation 8, when principles are pre-defined. GRMs could generate principles themselves, and then generate critiques based on the principles, formalized as

形式上, 原则预先给定时, 按式 (8) 引导奖励的生成. GRM 也可以自己生成原则, 再基于这些原则生成评语, 形式化为

$$
\{p _ {i} \} _ {i = 1} ^ {m} \sim p _ {\theta} (x, \{y _ {i} \} _ {i = 1} ^ {n}), \quad \mathcal {R} = C \sim r _ {\theta} (x, \{y _ {i} \} _ {i = 1} ^ {n}, \{p _ {i} \} _ {i = 1} ^ {m}),\tag{9}
$$

<!-- page 6 of 44 -->

Preprint. Under review.

![Image block](./images/p06-figure-3-illustration-of-spct-including-rejective-fine-tuning.jpg)

Figure 3: Illustration of SPCT, including rejective fine-tuning, rule-based RL, and corresponding scalable behaviors during inference. The inference-time scaling is achieved via naive voting or meta RM guided voting with principles generated at scale, resulting in finer-grained outcome rewards within an expanded value space.

where $p _ { \theta }$ is the principle generation function parameterized by $\theta ,$ that shares the same model with reward generation $r _ { \theta } .$ In practice, they are implemented with the same language head in LLMs. This shift enables principles to be generated based on the input query and responses, adaptively aligning reward generation process, and the quality and granularity of the principles and corresponding critiques could be further improved with post-training on GRMs. With **the principles generated at scale**, GRMs could potentially output rewards with finer granularity and broader consideration to achieve better inference-time scalability.

其中 $p_\theta$ 是参数为 $\theta$ 的原则生成函数, 与奖励生成 $r_\theta$ 共用同一个模型. 实际实现中, 二者用的是 LLM 的同一个语言头. 这一转变让原则可以根据输入的查询和回答生成, 自适应地对齐奖励生成过程; 原则和对应评语的质量与粒度还可以通过对 GRM 的后训练进一步提升. 有了**大规模生成的原则**, GRM 有可能输出粒度更细, 考虑更全面的奖励, 获得更好的 TestingTime 可扩展性.

## 3.2 Rule-Based Reinforcement Learning · 基于规则的强化学习

To optimize principle and critique generation in GRMs simultaneously, we propose SPCT, which integrates <u>rejective fine-tuning</u> and <u>rule-based RL</u>. The former serves as a cold start.

为了同时优化 GRM 中原则和评语的生成, 我们提出 SPCT, 它结合了拒绝采样微调和基于规则的 RL, 前者作为冷启动.

**Rejective Fine-Tuning (Cold Start)** The core idea of the rejective fine-tuning stage is to train the GRM to generate principles and critiques in the correct format and for various input types. Unlike previous works (Vu et al., 2024; Cao et al., 2024; Alexandru et al., 2025) that mix RM data for single, paired, and multiple responses in different formats, we adopt pointwise GRM, introduced in Section 2.1, to flexibly generate rewards for any number of responses in the same format. For data construction, besides general instruction data, we sample trajectories with a pretrained GRM by giving the query and corresponding responses. Each RM data point contains a query and one or multiple responses to the query, as well as the ground-truth label denoting the best response. For each RM data point, the sampling of principles and critiques is performed $N _ { \mathrm { R F T } } ^ { \mathrm { ~   ~ } }$ times. The rejection strategy is also unified, which is to reject trajectories with predicted rewards that are incorrect, and the query and responses with all $\acute { N } _ { \mathrm { R F T } }$ trajectories correct (too easy). Formally, let $r _ { i }$ denote the ground-truth reward for the i-th response $y _ { i }$ to the query x, the predicted pointwise rewards $\{ S _ { i } \} _ { i = 1 } ^ { n }$ are correct if

**拒绝采样微调 (冷启动)** 这一阶段的核心想法, 是训练 GRM 以正确的格式, 针对各种输入类型生成原则和评语. 以往工作 (Vu et al., 2024; Cao et al., 2024; Alexandru et al., 2025) 把单个, 成对和多个回答的 RM 数据以不同格式混在一起; 我们采用第 2.1 节介绍的 pointwise GRM, 用同一种格式为任意数量的回答灵活生成奖励. 数据构造上, 除了通用指令数据, 我们还给定查询和对应回答, 用一个预训练 GRM 采样轨迹. 每条 RM 数据包含一个查询, 针对它的一个或多个回答, 以及指出最佳回答的真值标签. 对每条 RM 数据, 原则和评语的采样进行 $N_{\mathrm{RFT}}$ 次. 拒绝策略也是统一的: 拒绝预测奖励错误的轨迹, 也拒绝 $N_{\mathrm{RFT}}$ 条轨迹全部正确 (过于简单) 的查询和回答. 形式上, 令 $r_i$ 表示查询 $x$ 的第 $i$ 个回答 $y_i$ 的真值奖励, 预测的 pointwise 奖励 $\{S_i\}_{i=1}^n$ 在以下条件下判为正确:

$$
\left\{ \begin{array}{l l} \forall i \neq j, \quad S _ {j} > S _ {i}, \quad j = \arg \max _ {l} \{r _ {l} \} _ {l = 1} ^ {n}, & \text {if} n \geq 2, \\ S _ {1} = r _ {1}, & \text {if} n = 1. \end{array} \right.\tag{10}
$$

<!-- page 7 of 44 -->

Preprint. Under review.

with a guarantee that the ground-truth rewards only contain one maximum. However, similar to previous works (Zhang et al., 2025a), we found pretrained GRMs could hardly generate correct rewards for a portion of queries and corresponding responses within limited sampling quota. Thus, we optionally append arg max $\{ r _ { l } \} _ { l = 1 } ^ { n }$ to the prompt of the GRM, termed hinted sampling, with the expectation that the predicted rewards to align with the ground truth, besides non-hinted sampling. Specifically, an additional segment “The best response is: Response arg ma $x _ { l } \{ r _ { l } \} _ { l = 1 } ^ { n } { } ^ { \prime \prime }$ will be appended to the input. For hinted sampling, each query and the corresponding responses are sampled once, and trajectories are only rejected when incorrect. Beyond previous studies (Li et al., 2024a; Mahan et al., 2024), we observed that hinted sampled trajectories sometimes take shortcuts in the generated critique, especially for reasoning tasks, indicating the necessity and potential benefits of online RL for the GRM.

这里保证真值奖励只有一个最大值. 不过, 和以往工作 (Zhang et al., 2025a) 一样, 我们发现在有限的采样配额内, 预训练 GRM 对一部分查询和回答很难生成正确的奖励. 因此, 除了无提示采样, 我们还可选地把 $\arg\max\{r_l\}_{l=1}^n$ 附加到 GRM 的提示里, 称为带提示采样 (hinted sampling), 期望预测奖励与真值对齐. 具体来说, 在输入后追加一段「The best response is: Response $\arg\max_l\{r_l\}_{l=1}^n$」. 带提示采样时, 每个查询和对应回答只采样一次, 轨迹只在错误时被拒绝. 在以往研究 (Li et al., 2024a; Mahan et al., 2024) 之外, 我们还观察到, 带提示采样得到的轨迹有时会在生成的评语里走捷径, 推理任务上尤其明显, 这说明对 GRM 做在线 RL 是必要的, 也可能有好处.

**Rule-Based RL** The GRM is further fine-tuned with rule-based online RL. Specifically, we use the original setting of GRPO (Shao et al., 2024) with rule-based outcome rewards. During rollout, the GRM generates principles and critiques based on the input query and responses, and then the predicted reward is extracted and compared to the ground truth with accuracy rules. Unlike DeepSeek-AI (2025), no format rewards are used. Instead, a larger coefficient for the KL penalty is applied to ensure the format and avoid severe biases. Formally, the reward for the i-th output $o _ { i }$ to the given query x and responses $\{ y _ { i } \} _ { i = 1 } ^ { n }$ is

**基于规则的 RL** GRM 接着用基于规则的在线 RL 继续微调. 具体来说, 我们采用 GRPO (Shao et al., 2024) 的原始设定, 配合基于规则的结果奖励. rollout 时, GRM 根据输入的查询和回答生成原则和评语, 然后抽取预测奖励, 用准确率规则与真值比较. 与 DeepSeek-AI (2025) 不同, 这里不用格式奖励, 而是用更大的 KL 惩罚系数来保证格式并避免严重偏差. 形式上, 给定查询 $x$ 和回答 $\{y_i\}_{i=1}^n$, 第 $i$ 个输出 $o_i$ 的奖励为

$$
\hat {r} _ {i} = \left\{ \begin{array}{l l} 1, & \text {if} n \geq 2 \text {and} \forall i ^ {\prime} \neq j ^ {\prime}, \quad S _ {j ^ {\prime}} > S _ {i ^ {\prime}}, \quad j ^ {\prime} = \arg \max _ {l} \{r _ {l} \} _ {l = 1} ^ {n}, \\ 1, & \text {if} n = 1 \text {and} S _ {1} = r _ {1}, \\ - 1, & \text {otherwise}, \end{array} \right.\tag{11}
$$

where the pointwise rewards $\{ S _ { i } \} _ { i = 1 } ^ { n }$ are extracted from $o _ { i } .$ **The reward function encourages GRMs to distinguish the best responses with online optimized principles and critiques, in favor of effective inference-time scaling.** The reward signal could be obtained seamlessly from any preference dataset and labeled LLM responses.

其中 pointwise 奖励 $\{S_i\}_{i=1}^n$ 从 $o_i$ 中抽取. **这个奖励函数鼓励 GRM 借助在线优化的原则和评语分辨出最佳回答, 有利于有效的 TestingTime 扩展.** 奖励信号可以直接从任何偏好数据集和带标签的 LLM 回答中得到.

## 4 Inference-Time Scaling with SPCT · 用 SPCT 做 TestingTime 扩展

To further improve the performance of DeepSeek-GRM for generalist reward generation using more inference compute, we explore sampling-based strategies to achieve effective inference-time scalability.

为了用更多推理算力进一步提升 DeepSeek-GRM 的通用奖励生成表现, 我们探索基于采样的策略, 以获得有效的 TestingTime 可扩展性.

**Voting with Generated Rewards** Voting is a widely adopted method for inference-time scaling in RM. Recalling the approaches in Section 2.1, we demonstrate voting results of k samples for semi-scalar and generative RMs. For semi-scalar RMs (Ankner et al., 2024; Zhang et al., 2025a), voting is performed as averaging:

**对生成的奖励投票** 投票是 RM 中广泛使用的 TestingTime 扩展方法. 回顾第 2.1 节的方法, 我们给出半标量 RM 和生成式 RM 对 $k$ 个样本的投票方式. 对半标量 RM (Ankner et al., 2024; Zhang et al., 2025a), 投票就是取平均:

$$
\boxed {S ^ {*} = \frac {1}{k} \sum_ {i = 1} ^ {k} S _ {i}, \quad \left\{\mathcal {R} _ {i} = \left(S _ {i}, C _ {i}\right) \right\} _ {i = 1} ^ {k} \sim r _ {\theta} \left(x, \left\{y _ {i} \right\} _ {i = 1} ^ {n}\right),}\tag{12}
$$

where $S ^ { * }$ is the final reward. In practice, the scalar value has limited variance which could hinder the scalability. For pairwise GRMs (Mahan et al., 2024; Wang et al., 2024c), voting is performed as selecting the response identified to be the best with the highest frequency, i.e. majority:

其中 $S^*$ 是最终奖励. 实际中, 标量值的方差有限, 这会妨碍可扩展性. 对 pairwise GRM (Mahan et al., 2024; Wang et al., 2024c), 投票是选出被判为最佳次数最多的回答, 即多数投票:

$$
\hat {y} ^ {*} = \arg \max _ {y} \sum_ {i = 1} ^ {k} \mathbb {I} (y = \hat {y} _ {i}), \quad \{\mathcal {R} _ {i} = \boldsymbol {C} _ {i} \} _ {i = 1} ^ {k} \sim r _ {\theta} \left(x, \{y _ {i} \} _ {i = 1} ^ {n}\right),\tag{13}
$$

where ${ \hat { y } } ^ { * }$ is the final predicted best response, $f _ { \mathrm { p a i r } } ( \cdot , \cdot )$ is a selection function, $\hat { y } _ { i } \; = \;$ $f _ { \mathrm { p a i r } } \big ( C _ { i } , \big \{ y _ { i } \big \} _ { i = 1 } ^ { n } \big )$ is the individually selected best response of each sample, and $\mathbb { I } ( \cdot )$ is the indicator function. Though the voting process is scalable, the majority voted result might be biased since ties are not allowed in each sample, and may not be able to tell apart subtle differences between responses due to the lack of quantitative scores. The voting process for pointwise GRMs is defined as summing the rewards:

其中 $\hat y^*$ 是最终预测的最佳回答, $f_{\mathrm{pair}}(\cdot,\cdot)$ 是选择函数, $\hat y_i=f_{\mathrm{pair}}(C_i,\{y_i\}_{i=1}^n)$ 是每个样本各自选出的最佳回答, $\mathbb I(\cdot)$ 是指示函数. 这一投票过程虽然可扩展, 但由于每个样本都不允许打平, 多数投票的结果可能有偏; 又因为缺少定量分数, 可能分辨不出回答之间的细微差别. pointwise GRM 的投票定义为对奖励求和:

$$
S _ {i} ^ {*} = \sum_ {j = 1} ^ {k} S _ {i, j}, \quad \left\{p _ {i, j} \right\} _ {i = 1} ^ {m _ {j}} \sim p _ {\theta} \left(x, \left\{y _ {i} \right\} _ {i = 1} ^ {n}\right), \mathcal {R} _ {j} = \boldsymbol {C} _ {j} \sim r _ {\theta} \left(x, \left\{y _ {i} \right\} _ {i = 1} ^ {n}, \left\{p _ {i, j} \right\} _ {i = 1} ^ {m _ {j}}\right), j = 1, \dots , k,\tag{14}
$$

<!-- page 8 of 44 -->

Preprint. Under review.

<table><tr><td>Model</td><td>RB</td><td>PPE Pref.</td><td>PPE Correct.</td><td>RMB</td><td>Overall</td><td>Avg. Rank (↓)</td></tr><tr><td colspan="7">Reported Results of Public Models</td></tr><tr><td>Skywork-Reward-Gemma-2-27B</td><td>94.1</td><td>56.6</td><td>56.6</td><td>60.2</td><td>66.9</td><td>-</td></tr><tr><td>DeepSeek-V2.5-0905</td><td>81.5</td><td>62.8</td><td>58.5</td><td>65.7</td><td>67.1</td><td>-</td></tr><tr><td>Gemini-1.5-Pro</td><td>86.8</td><td>66.1</td><td>59.8</td><td>56.5</td><td>67.3</td><td>-</td></tr><tr><td>ArmoRM-8B-v0.1</td><td>90.4</td><td>60.6</td><td>61.2</td><td>64.6</td><td>69.2</td><td>-</td></tr><tr><td>InternLM2-20B-Reward</td><td>90.2</td><td>61.0</td><td>63.0</td><td>62.9</td><td>69.3</td><td>-</td></tr><tr><td>LLaMA-3.1-70b-Instruct</td><td>84.1</td><td>65.3</td><td>59.2</td><td>68.9</td><td>69.4</td><td>-</td></tr><tr><td>Claude-3.5-sonnet</td><td>84.2</td><td>65.3</td><td>58.8</td><td>70.6</td><td>69.7</td><td>-</td></tr><tr><td>Nemotron-4-340B-Reward</td><td>92.0</td><td>59.3</td><td>60.8</td><td>69.9</td><td>70.5</td><td>-</td></tr><tr><td>GPT-4o</td><td>86.7</td><td>67.1</td><td>57.6</td><td>73.8</td><td>71.3</td><td>-</td></tr><tr><td colspan="7">Reproduced Results of Baseline Methods</td></tr><tr><td>LLM-as-a-Judge</td><td>83.4</td><td>64.2</td><td>58.8</td><td>64.8</td><td>67.8</td><td>4.50</td></tr><tr><td>DeepSeek-BTRM-27B</td><td>81.7</td><td>68.3</td><td>66.7</td><td>57.9</td><td>68.6</td><td>3.50</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>82.0</td><td>67.1</td><td>62.4</td><td>63.4</td><td>68.7</td><td>3.50</td></tr><tr><td>DeepSeek-PairRM-27B</td><td>87.1</td><td>65.8</td><td>64.8</td><td>58.2</td><td>69.0</td><td>2.75</td></tr><tr><td colspan="7">Results of Our Method</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>84.5</td><td>64.1</td><td>59.6</td><td>67.0</td><td>68.8</td><td>4.00</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>86.0</td><td>64.7</td><td>59.8</td><td>69.0</td><td>69.9</td><td>2.75</td></tr><tr><td colspan="7">Results of Inference-Time Scaling (Voting@32)</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>88.5</td><td>65.3</td><td>60.4</td><td>69.7</td><td>71.0</td><td>-</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>90.4</td><td>67.2</td><td>63.2</td><td>70.3</td><td>72.8</td><td>-</td></tr></table>

where $S _ { i } ^ { * }$ is the final reward for the i-th response $( i \quad = \quad 1 , . . . , n )$ and $\{ S _ { i , j } \} _ { i = 1 } ^ { n } =$ $f _ { \mathrm { p o i n t } } \big ( C _ { j } , \big \{ y _ { i } \big \} _ { i = 1 } ^ { n } \big )$ is the j-th set of pointwise rewards. **Since** $S _ { i , j }$ **is usually set within a small discrete range,** $\mathbf { e . g . , } \{ 1 , . . . , 1 0 \}$ , **the voting process actually expands the reward space by** k **times, and enables the GRM to generate a large number of principles, which benefits the quality and granularity of the final rewards**. An intuitive explanation is that, if each principle could be viewed as a proxy of judgement perspectives, a larger number of principles may reflect the real distribution more accurately, leading to scaling effectiveness. Notably, to avoid positional biases and for diversity, responses are shuffled before sampling.

其中 $S_i^*$ 是第 $i$ 个回答 ($i=1,\dots,n$) 的最终奖励, $\{S_{i,j}\}_{i=1}^n=f_{\mathrm{point}}(C_j,\{y_i\}_{i=1}^n)$ 是第 $j$ 组 pointwise 奖励. **由于 $S_{i,j}$ 通常取在一个很小的离散范围内, 例如 $\{1,\dots,10\}$, 投票过程实际上把奖励空间扩大了 $k$ 倍, 并让 GRM 能生成大量原则, 这有利于最终奖励的质量和粒度.** 一个直观的解释是: 如果把每条原则看作某个评判视角的代理, 那么原则越多, 越可能更准确地反映真实分布, 从而带来扩展效果. 另外, 为了避免位置偏差并增加多样性, 采样前会打乱回答的顺序.

> **拆开:** 式 (14) 说投票把奖励空间扩大了 $k$ 倍, 具体扩大到多少, 打平还会剩多少?
> 答: 单次采样 $S_{i,j}\in\{1,\dots,10\}$, 只有 10 个取值; $k$ 次求和后 $S_i^*\in\{k,\dots,10k\}$, 共 $9k+1$ 个取值. $k=8$ 时是 8 到 80 共 73 个取值, $k=32$ 时是 32 到 320 共 289 个取值, 所以「扩大 $k$ 倍」是取值个数的量级, 准确数是 $9k+1$. 取值变多的直接后果是打平变少: 单次采样时两个回答同分很常见 (表 17 的结果 1 就是 8 比 8), 第 5.1 节对打平的处理是打乱后取 $\arg\max$, 等于随机猜. 求和之后, 只要各次采样的打分不完全对称, 打平概率就会下降, 一部分提升来自这里. 文中没有给出单次采样和投票后的打平比例, 这部分贡献有多大无法从表中分离.

**Meta Reward Modeling Guided Voting** The voting process of DeepSeek-GRM requires multiple sampling and a few generated principles and critiques might be biased or lowquality due to randomness or model limitations. Thus, we train a meta RM to guide the voting process. The meta RM is a pointwise scalar RM, trained to identify the correctness of the principles and critiques generated by DeepSeek-GRM, with the binary cross-entropy loss, where the label is identified based on Equation 10. The prompt template is in Appendix G, integrates the query, candidate responses, corresponding principles, and the critiques. The dataset comprises trajectories from non-hinted sampling in the RFT stage, and also trajectories sampled from the DeepSeek-GRM to be guided, to both provide enough positive and negative rewards and alleviate the gap between training and inference policy as suggested by Chow et al. (2025). The guided voting is simple: The meta RM outputs meta rewards for k sampled rewards, and the final outcome is voted by rewards with top $k _ { \mathrm { m e t a } } \leq k$ meta rewards, so that filtering out low-quality samples.

**meta RM 引导的投票** DeepSeek-GRM 的投票需要多次采样, 而由于随机性或模型本身的局限, 少数生成的原则和评语可能有偏或质量低. 因此, 我们训练一个 meta RM 来引导投票过程. meta RM 是一个 pointwise 标量 RM, 用二元交叉熵损失训练, 判断 DeepSeek-GRM 生成的原则和评语是否正确, 标签按式 (10) 确定. 提示模板见附录 G, 其中整合了查询, 候选回答, 对应的原则和评语. 数据集包括 RFT 阶段无提示采样得到的轨迹, 以及从待引导的 DeepSeek-GRM 采样得到的轨迹, 这样既能提供足够的正负样本, 也能按 Chow et al. (2025) 的建议缓解训练策略和推理策略之间的差距. 引导投票的做法很简单: meta RM 为 $k$ 个采样得到的奖励各输出一个元奖励, 最终结果由元奖励排在前 $k_{\mathrm{meta}}\le k$ 的那些奖励投票得出, 从而过滤掉低质量样本.

## 5 Results on Reward Modeling Benchmarks · 奖励建模基准上的结果

## 5.1 Experiment Settings · 实验设置

**Benchmarks and Evaluation Metrics** We evaluate the performance of different methods on various RM benchmarks of different domains: **Reward Bench (RB)** (Lambert et al., 2024), **PPE** (Preference and Correctness subsets) (Frick et al., 2025), **RMB** (Zhou et al., 2025), **ReaLMistake** (Kamoi et al., 2024). We use the standard evaluation metrics for each benchmark: accuracy of picking the best response from a set of responses in Reward

<!-- page 9 of 44 -->

Preprint. Under review.

<table><tr><td>Model</td><td>Overall</td></tr><tr><td colspan="2">Reported Results of Public Models</td></tr><tr><td>Nemotron-4-340B-Reward</td><td>70.5</td></tr><tr><td>GPT-4o</td><td>71.3</td></tr><tr><td colspan="2">Results of Inference-Time Scaling (Voting@1)</td></tr><tr><td>LLM-as-a-Judge</td><td>67.0</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>68.5</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>67.8</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>67.9</td></tr><tr><td colspan="2">Results of Inference-Time Scaling (Voting@8)</td></tr><tr><td>LLM-as-a-Judge</td><td>67.6 (+0.6)</td></tr><tr><td>LLM-as-a-Judge w/ TokenProb</td><td>68.1 (+1.1)</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>68.8 (+0.3)</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>69.3 (+1.5)</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>70.6 (+2.7)</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>72.0 (+4.1)</td></tr><tr><td colspan="2">Results of Further Inference-Time Scaling (Voting@32)</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>71.0 (+3.1)</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>72.8 (+4.9)</td></tr></table>

<table><tr><td>Method</td><td>Overall</td></tr><tr><td colspan="2">Results of Greedy Decoding</td></tr><tr><td>DeepSeek-GRM-27B</td><td>69.9</td></tr><tr><td>w/o Principle Generation</td><td>67.5</td></tr><tr><td>w/o Rejective Sampling</td><td>68.7</td></tr><tr><td>DeepSeek-GRM-27B-RFT</td><td>68.8</td></tr><tr><td>w/o Hinted Sampling (1)</td><td>68.0</td></tr><tr><td>w/o Non-Hinted Sampling (2)</td><td>67.4</td></tr><tr><td>w/o Rejective Sampling (1&amp;2)</td><td>66.1</td></tr><tr><td>w/o General Instruction Data</td><td>63.3</td></tr><tr><td colspan="2">Results of Inference-Time Scaling (Voting@8)</td></tr><tr><td>DeepSeek-GRM-27B</td><td>70.6</td></tr><tr><td>w/o Principle Generation</td><td>68.0</td></tr><tr><td colspan="2">Results of Inference-Time Scaling (Voting@32)</td></tr><tr><td>DeepSeek-GRM-27B</td><td>71.0</td></tr><tr><td>DeepSeek-GRM-27B ( $k_{meta} = 1$ )</td><td>71.5</td></tr><tr><td>DeepSeek-GRM-27B ( $k_{meta} = 8$ )</td><td>72.7</td></tr><tr><td>DeepSeek-GRM-27B ( $k_{meta} = 16$ )</td><td>72.8</td></tr></table>

Bench, PPE, and RMB, and ROC-AUC for ReaLMistake. To deal with ties of the predicted rewards for multiple responses, we shuffle the responses and determine the best response by arg max Si, where Si is the predicted reward for the i-th response after shuffling. Details are in Appendix D.

**基准与评测指标** 我们在不同领域的多个 RM 基准上评测各方法: **Reward Bench (RB)** (Lambert et al., 2024), **PPE** (Preference 和 Correctness 两个子集) (Frick et al., 2025), **RMB** (Zhou et al., 2025), **ReaLMistake** (Kamoi et al., 2024). 每个基准用其标准指标: Reward Bench, PPE 和 RMB 用从一组回答中选出最佳回答的准确率, ReaLMistake 用 ROC-AUC. 为了处理多个回答预测奖励打平的情况, 我们先打乱回答顺序, 再用 $\arg\max S_i$ 确定最佳回答, 其中 $S_i$ 是打乱后第 $i$ 个回答的预测奖励. 细节见附录 D.

**Method Implementation** For the baseline methods, we re-implement **LLM-as-a-Judge** (Zheng et al., 2023), **DeepSeek-BTRM-27B** (Bradley-Terry model) (Kendall & Smith, 1940), **CLoud-Gemma-2-27B** (Ankner et al., 2024), and **DeepSeek-PairRM-27B** (Jiang et al., 2023) based on Gemma-2-27B (Team, 2024) and with all compatible training data and settings as DeepSeek-GRM. For our methods, we implement **DeepSeek-GRM-27B-RFT** based on Gemma-2-27B, and **DeepSeek-GRM** on different sizes of LLMs, including DeepSeek-V2-Lite (16B MoE) (DeepSeek-AI, 2024a), Gemma-2-27B, DeepSeek-V2.5 (236B MoE), and DeepSeek-V3 (671B MoE) (DeepSeek-AI, 2024b). The meta RM is trained on Gemma-2-27B. Default results are reported with greedy decoding, and the inference-time scaling uses temperature = 0.5. Other details are provided in Appendix C.

**方法实现** 基线方法方面, 我们基于 Gemma-2-27B (Team, 2024) 重新实现了 **LLM-as-a-Judge** (Zheng et al., 2023), **DeepSeek-BTRM-27B** (Bradley-Terry 模型) (Kendall & Smith, 1940), **CLoud-Gemma-2-27B** (Ankner et al., 2024) 和 **DeepSeek-PairRM-27B** (Jiang et al., 2023), 所有能兼容的训练数据和设置都与 DeepSeek-GRM 一致. 我们的方法方面, 基于 Gemma-2-27B 实现了 **DeepSeek-GRM-27B-RFT**, 并在不同规模的 LLM 上实现了 **DeepSeek-GRM**, 包括 DeepSeek-V2-Lite (16B MoE) (DeepSeek-AI, 2024a), Gemma-2-27B, DeepSeek-V2.5 (236B MoE) 和 DeepSeek-V3 (671B MoE) (DeepSeek-AI, 2024b). meta RM 在 Gemma-2-27B 上训练. 默认结果用贪心解码报告, TestingTime 扩展用 temperature = 0.5. 其他细节见附录 C.

## 5.2 Results and Analysis · 结果与分析

**Performance on RM Benchmarks** The overall results of different methods and models on RM benchmarks are shown in Table 2. We compare the performance of DeepSeek-GRM-27B with the reported results of public models and the reproduced results of baseline methods. We find that DeepSeek-GRM-27B outperforms the baseline methods in overall performance, and achieves competitive performance with strong public RMs, such as Nemotron-4-340B-Reward and GPT-4o; with inference-time scaling, DeepSeek-GRM-27B could further improve and achieve the best overall results. For detailed comparisons, scalar (DeepSeek-BTRM-27B) and semi-scalar (CLoud-Gemma-2-27B) RMs demonstrate biased results on different benchmarks, with significantly better performance on verifiable tasks (PPE Correctness) than all generative RMs, but fail in different other benchmarks, respectively. Nonetheless, most public scalar RMs also exhibit severe domain biases. The PairRM approach could alleviate the problem. LLM-as-a-Judge shows similar trends with DeepSeek-GRM-27B with lower performance, potentially due to the lack of training on rating single responses. In conclusion, **SPCT improves the generalist reward generation capability of GRMs, with significantly fewer biases compared to scalar and semi-scalar RMs**.

**RM 基准上的表现** 表 2 给出了不同方法和模型在各 RM 基准上的整体结果. 我们把 DeepSeek-GRM-27B 与公开模型的报告结果, 以及基线方法的复现结果作比较. DeepSeek-GRM-27B 的整体表现超过各基线方法, 与 Nemotron-4-340B-Reward 和 GPT-4o 等强的公开 RM 相当; 加上 TestingTime 扩展, DeepSeek-GRM-27B 还能进一步提升, 取得最好的整体结果. 细看的话, 标量 (DeepSeek-BTRM-27B) 和半标量 (CLoud-Gemma-2-27B) RM 在不同基准上表现有偏: 在可验证任务 (PPE Correctness) 上明显好于所有生成式 RM, 却分别在其他不同基准上失手. 多数公开的标量 RM 也有严重的领域偏差. PairRM 方法能缓解这个问题. LLM-as-a-Judge 的趋势与 DeepSeek-GRM-27B 相似但分数更低, 可能是因为缺少给单个回答打分的训练. 总之, **SPCT 提升了 GRM 的通用奖励生成能力, 偏差明显小于标量和半标量 RM**.

**Inference-Time Scalability** The inference-time scaling results of different methods are shown in Table $^ { 3 , }$ and the overall trends are demonstrated in Figure 1. Details are in Appendix D.3. With up to 8 samples, we find that DeepSeek-GRM-27B has the highest performance increase over the greedy decoding and sampling results. DeepSeek-GRM-27B

<!-- page 10 of 44 -->

Preprint. Under review.

![Image block](./images/p10-a-inference-time-scaling-results-of-deepseek-grm.jpg)

(a) Inference-time scaling results of DeepSeek-GRM-16B and DeepSeek-GRM-27B $( k _ { \mathrm { m e t a } } = { \textstyle { \frac { 1 } { 2 } } } k )$

![Image block](./images/p10-figure-4-inference-time-scaling-performance-v-s-training.jpg)

(b) Training-time scaling results with different model sizes, using greedy decoding except DeepSeek-R1.

Figure 4: Inference-time scaling performance v.s. training-time scaling performance on the Reward Bench benchmark.

further shows a strong potential to increase performance with larger inference compute, up to 32 samples. We attribute the effectiveness to the refined principle generation, which expands the output length in a structural way and guides the outcome rewards closer to the ground-truth distribution. The meta RM also reveals its validity in filtering low-quality trajectories for DeepSeek-GRM on each benchmark. Voted with token probabilities, LLM-asa-Judge also shows a significant performance increase, indicating that the token probability as quantitative weights could help the reliability over mere majority voting on discrete indices. For CLoud-Gemma-2-27B, the performance increase is limited, mainly due to the lack of variance in scalar reward generation, even though the critique has changed a lot. In summary, **SPCT improves the inference-time scalability of GRMs, and the meta RM further boosts the scaling performance in general**.

**TestingTime 可扩展性** 表 3 给出了各方法的 TestingTime 扩展结果, 整体趋势见图 1, 细节见附录 D.3. 在最多 8 个样本时, DeepSeek-GRM-27B 相对贪心解码和单次采样结果的提升最大. DeepSeek-GRM-27B 还显示出随推理算力增加继续提升的强劲势头, 一直到 32 个样本. 我们把这种效果归因于改进后的原则生成: 它以结构化的方式拉长了输出, 并把结果奖励引导到更接近真值的分布. meta RM 也在每个基准上证明了它过滤 DeepSeek-GRM 低质量轨迹的作用. 用 token 概率投票时, LLM-as-a-Judge 同样有明显提升, 说明把 token 概率当作定量权重, 比单纯对离散下标做多数投票更可靠. CLoud-Gemma-2-27B 的提升有限, 主要原因是标量奖励的生成缺乏方差, 尽管评语变化很大. 总之, **SPCT 提升了 GRM 的 TestingTime 可扩展性, meta RM 总体上进一步提升了扩展表现**.

> **核对:** 表 3 里 DeepSeek-GRM-27B 在 Voting@8 后标的 (+2.7), Voting@32 标的 (+3.1), 是相对哪个基线算的?
> 答: 相对表 3 的 Voting@1 一行, 即 temperature 0.5 下单次采样的 67.9: $70.6-67.9=2.7$, $71.0-67.9=3.1$, MetaRM 的 $72.8-67.9=4.9$. 表 2 报告的默认结果是贪心解码的 69.9, 比单次采样高 2.0. 以贪心为基线, 投票 8 次只多 0.7, 投票 32 次多 1.1, meta RM 引导的 32 次多 2.9. 其他方法也一样: CLoud 的 Voting@1 是 68.5, 贪心是 68.7, (+0.3) 的 Voting@8 只比贪心高 0.1. 附录表 6 的分项能对上这一读法: GRM-27B 的 Voting@1 在 RB, PPE Pref., PPE Correct., RMB 上是 85.2, 62.4, 59.5, 64.4, 四项平均 67.9. 所以「采样投票提升多少」取决于拿贪心还是拿单次采样作参照, 用贪心作参照时, 不带 meta RM 的纯投票收益只有 1 个点左右.

**Ablation Study** Table 4 shows the ablation study results of different components of the proposed SPCT, detailed results are listed in Appendix D.3. Surprisingly, without the cold start with rejective sampled critique data, general-instruction-tuned GRMs still improve significantly after undergoing the online RL (66.1 → 68.7). Also, the non-hinted sampling seems more important than the hinted sampling, potentially because of the shortcuts appearing in hinted sampled trajectories. These indicate the **importance of online training for GRMs**. Aligned with previous works (Cao et al., 2024), we confirm that the general instruction data is essential for the performance of GRMs. We find that **the principle generation is crucial for the performance of both greedy decoding and inference-time scaling of DeepSeek-GRM-27B**. For inference-time scaling, the meta RM guided voting shows robustness with different $k _ { \mathrm { m e t a } } .$ . Further analysis on the generalist RM performance, including input flexibility, domain generalization of training data, etc., is discussed in Appendix E.

**消融研究** 表 4 给出了 SPCT 各组成部分的消融结果, 详细结果见附录 D.3. 即便没有用拒绝采样评语数据做冷启动, 只经过通用指令微调的 GRM 在在线 RL 后仍从 66.1 提升到 68.7. 无提示采样的贡献也高于带提示采样, 可能因为后者的轨迹中会出现捷径. 这些结果表明在线训练可以继续提高 GRM, 与以往工作 (Cao et al., 2024) 一致; 去掉通用指令数据或原则生成都会降低表现, 原则生成同时影响 DeepSeek-GRM-27B 的贪心解码和 TestingTime 扩展. 在 TestingTime 扩展中, meta RM 引导的投票对不同 $k_{\mathrm{meta}}$ 都较稳定. 关于输入灵活性和训练数据领域泛化的进一步分析见附录 E.

**Scaling Inference and Training Costs** We further investigate the inference-time and training-time scaling performance of DeepSeek-GRM-27B, by post-training LLMs of different sizes. The models are tested on the Reward Bench, and the results are shown in Figure 4. We find that direct voting with 32 samples of DeepSeek-GRM-27B could achieve comparable performance to the 671B MoE model, and the meta RM guided voting could achieve the best results with 8 samples, demonstrating the **effectiveness of inference-time scaling of DeepSeek-GRM-27B compared to scaling model sizes**. Moreover, we test DeepSeek-R1-0120 with a downsampled test set containing 300 samples, and find that its performance is even worse than the 236B MoE RFT model, indicating that expanding long chain-of-thoughts for reasoning tasks could not significantly improve the performance of generalist RM.

**扩大推理成本与训练成本** 我们通过对不同规模的 LLM 做后训练, 进一步考察 DeepSeek-GRM-27B 在 TestingTime 扩展和训练侧扩展下的表现. 模型在 Reward Bench 上测试, 结果见图 4. 我们发现, DeepSeek-GRM-27B 直接投票 32 个样本就能达到与 671B MoE 模型相当的表现, meta RM 引导的投票只用 8 个样本就能取得最好结果, 说明**相比扩大模型规模, DeepSeek-GRM-27B 的 TestingTime 扩展是有效的**. 此外, 我们在一个降采样到 300 条样本的测试集上测试了 DeepSeek-R1-0120, 发现它的表现甚至不如 236B MoE 的 RFT 模型, 说明为推理任务扩展长 CoT 并不能显著提升通用 RM 的表现.

> **再看:** 图 4(b) 把 671B 那个点画在 RL 曲线上, 和附录 C.1 的训练说明对得上吗?
> 答: 对不上. 附录 C.1 末尾写的是「大于 27B 的 DeepSeek-GRM 模型没有经过规则 RL, 只用 50K 条拒绝采样数据训练」, 但图 4(b) 的 RL 曲线从 16B 经 27B 一直连到 671B, 671B 的点旁标的是「DeepSeek-V3 (Greedy)」, 而 RFT 曲线只连到 230B. 表 8 里这个点记作 DeepSeek-GRM-671B, 四个子集 95.8, 82.9, 88.3, 86.6, 平均 88.4; 它也不是 DeepSeek-V3 技术报告表 8 里 V3 自己的 RewardBench 成绩 (96.9, 79.8, 87.0, 84.3, 平均 87.0). 236B 模型在正文写作 DeepSeek-V2.5 (236B MoE), 在表 8 写作 DeepSeek-GRM-230B, 两处名字也不一致. 因此「27B 加 TestingTime 扩展胜过 671B」这一比较里, 两边的训练流程不同: 27B 做完了 RFT 加规则 RL, 671B 至少按附录 C.1 只做了 50K 条数据的 RFT. 文中没有给出 671B 做完整 SPCT 的结果, 这一比较只能说明「同等训练预算不对等时」的情况.

<!-- page 11 of 44 -->

Preprint. Under review.

## 6 Related Work · 相关工作

**Generative Reward Models** GRMs represent a paradigm shift from scalar RMs (Ouyang et al., 2022), modeling reward as textual feedback or scores. (Li et al., 2024a; Kim et al., 2024; Wang et al., 2024c; Cao et al., 2024; Vu et al., 2024; Alexandru et al., 2025), enabling richer reward representations and more flexible for judging single and multiple responses. Previously, the LLM-as-a-judge method (Zheng et al., 2023; Wang et al., 2025a) accommodates reference-based or reference-free pairwise judgement for evaluating LLMs. Recent studies use offline and online RL to train GRMs (Wu et al., 2024; Mahan et al., 2024; Yu et al., 2025a; Ye et al., 2025b; Chen et al., 2025), incorporate tools and external knowledge with GRMs (Li et al., 2024b; Peng et al., 2025), and even train GRMs as an interface to adjust rewards from environments (Baker et al., 2025). Though these methods face challenges in efficiency, they demonstrate the potential to improve rewards at scale, towards a more generalist reward system.

**生成式奖励模型** GRM 是对标量 RM (Ouyang et al., 2022) 的范式转换, 把奖励建模成文本反馈或分数 (Li et al., 2024a; Kim et al., 2024; Wang et al., 2024c; Cao et al., 2024; Vu et al., 2024; Alexandru et al., 2025), 奖励的表示更丰富, 给单个和多个回答打分也更灵活. 更早的 LLM-as-a-judge 方法 (Zheng et al., 2023; Wang et al., 2025a) 支持带参考或不带参考的 pairwise 判断, 用于评测 LLM. 近期研究用离线和在线 RL 训练 GRM (Wu et al., 2024; Mahan et al., 2024; Yu et al., 2025a; Ye et al., 2025b; Chen et al., 2025), 在 GRM 中引入工具和外部知识 (Li et al., 2024b; Peng et al., 2025), 甚至把 GRM 训练成调整环境奖励的接口 (Baker et al., 2025). 这些方法虽然在效率上有困难, 但展示了大规模改进奖励的潜力, 朝着更通用的奖励系统迈进.

**Inference-Time Scaling for LLMs** Inference-time scaling for LLMs has been a critical research direction parallel with scaling LLMs in training time. Studies focus on sampling and RM guided aggregation (Lightman et al., 2024; Brown et al., 2024; Snell et al., 2025; Wu et al., 2025). Recently, long-horizon chain-of-thoughts (Wei et al., 2022) incentivized from LLMs significantly improve the reasoning capabilities of the models in both solving (OpenAI, 2024; DeepSeek-AI, 2025; OpenAI, 2025c) and judging (Zheng et al., 2025; Kim et al., 2025) difficult verifiable questions, as another format of inference-time scaling. However, we do not find an effective way to incentivize long-horizon reward generation for generalist reward modeling as DeepSeek-AI (2025), and we leave the combination of reasoning and principle-guided reward generation for future engineering efforts. There is also research using scalable rewards or verifiers to improve the performance of policy models, in domains of coding (Chen et al., 2023), reasoning (Lifshitz et al., 2025), etc. Thus, the development of inference-time scalable generalist RMs in this work might also contribute to the general performance of policy models by inference-time co-scaling.

**LLM 的 TestingTime 扩展** LLM 的 TestingTime 扩展是与训练侧扩大 LLM 并行的一个关键研究方向. 相关研究集中在采样和 RM 引导的聚合上 (Lightman et al., 2024; Brown et al., 2024; Snell et al., 2025; Wu et al., 2025). 近来, 从 LLM 中激发出的长程 CoT (Wei et al., 2022) 显著提升了模型在求解 (OpenAI, 2024; DeepSeek-AI, 2025; OpenAI, 2025c) 和评判 (Zheng et al., 2025; Kim et al., 2025) 可验证难题上的推理能力, 这是 TestingTime 扩展的另一种形式. 不过, 我们没有找到像 DeepSeek-AI (2025) 那样为通用奖励建模激发长程奖励生成的有效办法, 推理与原则引导的奖励生成如何结合, 留待未来的工程工作. 也有研究用可扩展的奖励或验证器提升策略模型的表现, 领域包括编程 (Chen et al., 2023), 推理 (Lifshitz et al., 2025) 等. 因此, 本工作中可在推理时扩展的通用 RM, 也可能通过与策略模型在推理时共同扩展, 提升策略模型的通用表现.

## 7 Conclusion and Future Work · 结论与未来工作

We introduced Self-Principled Critique Tuning (SPCT), a method that enhances the scalability of inference time for generalist reward modeling. With rule-based online RL, SPCT enables adaptive generation of principles and critiques, significantly boosting reward quality and inference-time scalability for GRMs in diverse domains. Empirical results demonstrate that DeepSeek-GRM surpasses baseline methods and a few strong public RMs, and shows notable improvement through inference-time scaling, particularly with the guidance of the meta RM. Future directions could include integrating GRMs into online RL pipelines as versatile interfaces of reward systems, exploring inference-time co-scaling with policy models, or serving as robust offline evaluators for foundation models.

我们提出了自原则评语微调 (SPCT), 一种提升通用奖励建模 TestingTime 可扩展性的方法. 借助基于规则的在线 RL, SPCT 让模型自适应地生成原则和评语, 在多个领域显著提升了 GRM 的奖励质量和 TestingTime 可扩展性. 实验结果表明, DeepSeek-GRM 超过了各基线方法和几个强的公开 RM, 并通过 TestingTime 扩展, 尤其是在 meta RM 引导下, 取得了明显提升. 未来方向包括: 把 GRM 作为奖励系统的通用接口接入在线 RL 流水线, 探索与策略模型在推理时共同扩展, 或者作为稳健的离线评估器服务于基础模型.

## Ethics Statement · 伦理声明

Our proposed method, Self-Principled Critique Tuning (SPCT), aims to enhance inferencetime scalability of generative reward models (GRMs) for general domains. While this advancement promotes accuracy and consistency in reward modeling, several ethical implications might warrant explicit consideration.

我们提出的自原则评语微调 (SPCT) 方法, 旨在提升通用领域生成式奖励模型 (GRM) 的 TestingTime 可扩展性. 这一进展虽然提高了奖励建模的准确性和一致性, 但有几项伦理影响需要明确考虑.

Firstly, even though through our empirical analysis that DeepSeek-GRM shows fewer biases on different domains, the automated generation of principles and critiques can inadvertently perpetuate or amplify biases when the training data is toxic. We argue that further investigation in the meta RM and other bias mitigation strategies should be prioritized to ensure equitable outcomes. Also, our approach does not aim to diminish human oversight. Instead, we advocate maintaining human-in-the-loop frameworks, and developing reliable proxy methods, like SPCT, to scale human oversight more efficiently and effectively.

第一, 尽管我们的实证分析表明 DeepSeek-GRM 在不同领域上的偏差较小, 但在训练数据有毒时, 自动生成原则和评语可能在无意中延续或放大偏差. 我们认为应当优先进一步研究 meta RM 和其他去偏策略, 以保证结果公平. 此外, 我们的方法并不是要削弱人的监督. 相反, 我们主张保留人在回路中的框架, 并发展 SPCT 这类可靠的代理方法, 更高效, 更有效地扩大人的监督.

<!-- page 12 of 44 -->

Preprint. Under review.

Secondly, expanded applicability of the inference-time scalable GRMs across diverse domains might raise concerns regarding transparency, accountability, etc. Since the reward generation behavior is largely emerged from self-bootstrapping, the potential for unfaithful principles and critiques is non-negligible. We demonstrate case studies in Appendix F.1 and limitations in Appendix B, and open-source the model under public supervision, which is essential for maintaining trust and ensuring responsible deployment of the artifact.

第二, 可在推理时扩展的 GRM 适用范围扩大到更多领域, 可能引发透明性和问责方面的担忧. 奖励生成行为主要通过自举形成, 其中可能出现不忠实的原则和评语. 我们在附录 F.1 给出案例研究, 在附录 B 说明局限, 并开源模型接受公众监督, 以便外部检查这些风险并支持负责任部署.

Finally, robust validation and ongoing vigilance across varied RM benchmarks and practical scenarios remain crucial. Ethical use of DeepSeek-GRM necessitates proactive management of risks and continuous evaluation against biases, requiring efforts in research about RM evaluation.

最终, 在各种 RM 基准和实际场景中做稳健验证, 保持持续警惕, 仍然十分关键. 合乎伦理地使用 DeepSeek-GRM, 需要主动管理风险, 持续评估偏差, 这也要求在 RM 评测方面投入研究.

## References

Andrei Alexandru, Antonia Calvi, Henry Broomfield, Jackson Golden, Kyle Dai, Mathias Leys, Maurice Burger, Max Bartolo, Roman Engeler, Sashank Pisupati, Toby Drane, and Young Sun Park. Atla selene mini: A general purpose evaluation model. Computing Research Repository, arXiv:2501.17195, 2025. URL [https://arxiv.org/abs/2501.17195](https://arxiv.org/abs/2501.17195).

Wei An, Xiao Bi, Guanting Chen, Shanhuang Chen, Chengqi Deng, Honghui Ding, Kai Dong, Qiushi Du, Wenjun Gao, Kang Guan, Jianzhong Guo, Yongqiang Guo, Zhe Fu, Ying He, Panpan Huang, Jiashi Li, Wenfeng Liang, Xiaodong Liu, Xin Liu, Yiyuan Liu, Yuxuan Liu, Shanghao Lu, Xuan Lu, Xiaotao Nie, Tian Pei, Junjie Qiu, Hui Qu, Zehui Ren, Zhangli Sha, Xuecheng Su, Xiaowen Sun, Yixuan Tan, Minghui Tang, Shiyu Wang, Yaohui Wang, Yongji Wang, Ziwei Xie, Yiliang Xiong, Yanhong Xu, Shengfeng Ye, Shuiping Yu, Yukun Zha, Liyue Zhang, Haowei Zhang, Mingchuan Zhang, Wentao Zhang, Yichao Zhang, Chenggang Zhao, Yao Zhao, Shangyan Zhou, Shunfeng Zhou, and Yuheng Zou. Fireflyer ai-hpc: A cost-effective software-hardware co-design for deep learning. Computing Research Repository, arXiv:2408.14158, 2024. URL [https://arxiv.org/abs/2408.14158](https://arxiv.org/abs/2408.14158).

Zachary Ankner, Mansheej Paul, Brandon Cui, Jonathan D. Chang, and Prithviraj Ammanabrolu. Critique-out-loud reward models. Computing Research Repository, arXiv:2408.11791, 2024. URL [https://arxiv.org/abs/2408.11791](https://arxiv.org/abs/2408.11791).

Negar Arabzadeh, Siqing Huo, Nikhil Mehta, Qingyun Wu, Chi Wang, Ahmed Hassan Awadallah, Charles L. A. Clarke, and Julia Kiseleva. Assessing and verifying task utility in LLM-powered applications. In Yaser Al-Onaizan, Mohit Bansal, and Yun-Nung Chen (eds.), Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pp. 21868–21888, Miami, Florida, USA, November 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.emnlp-main.1219. URL [https://aclanthology.org/2024.emnlp-main.1219/](https://aclanthology.org/2024.emnlp-main.1219/).

Amanda Askell, Yuntao Bai, Anna Chen, Dawn Drain, Deep Ganguli, Tom Henighan, Andy Jones, Nicholas Joseph, Ben Mann, Nova DasSarma, Nelson Elhage, Zac Hatfield-Dodds, Danny Hernandez, Jackson Kernion, Kamal Ndousse, Catherine Olsson, Dario Amodei, Tom Brown, Jack Clark, Sam McCandlish, Chris Olah, and Jared Kaplan. A general language assistant as a laboratory for alignment. Computing Research Repository, arXiv:2112.00861, 2021. URL [https://arxiv.org/abs/2112.00861](https://arxiv.org/abs/2112.00861).

Yuntao Bai, Andy Jones, Kamal Ndousse, Amanda Askell, Anna Chen, Nova DasSarma, Dawn Drain, Stanislav Fort, Deep Ganguli, Tom Henighan, Nicholas Joseph, Saurav Kadavath, Jackson Kernion, Tom Conerly, Sheer El-Showk, Nelson Elhage, Zac Hatfield-Dodds, Danny Hernandez, Tristan Hume, Scott Johnston, Shauna Kravec, Liane Lovitt, Neel Nanda, Catherine Olsson, Dario Amodei, Tom Brown, Jack Clark, Sam McCandlish, Chris Olah, Ben Mann, and Jared Kaplan. Training a helpful and harmless assistant with reinforcement learning from human feedback. Computing Research Repository, arXiv:2204.05862, 2022a. URL [https://arxiv.org/abs/2204.05862](https://arxiv.org/abs/2204.05862).

Yuntao Bai, Saurav Kadavath, Sandipan Kundu, Amanda Askell, Jackson Kernion, Andy Jones, Anna Chen, Anna Goldie, Azalia Mirhoseini, Cameron McKinnon, Carol Chen, Catherine Olsson, Christopher Olah, Danny Hernandez, Dawn Drain, Deep Ganguli,

<!-- page 13 of 44 -->

Preprint. Under review.

Dustin Li, Eli Tran-Johnson, Ethan Perez, Jamie Kerr, Jared Mueller, Jeffrey Ladish, Joshua Landau, Kamal Ndousse, Kamile Lukosuite, Liane Lovitt, Michael Sellitto, Nelson Elhage, Nicholas Schiefer, Noemi Mercado, Nova DasSarma, Robert Lasenby, Robin Larson, Sam Ringer, Scott Johnston, Shauna Kravec, Sheer El Showk, Stanislav Fort, Tamera Lanham, Timothy Telleen-Lawton, Tom Conerly, Tom Henighan, Tristan Hume, Samuel R. Bowman, Zac Hatfield-Dodds, Ben Mann, Dario Amodei, Nicholas Joseph, Sam McCandlish, Tom Brown, and Jared Kaplan. Constitutional ai: Harmlessness from ai feedback. Computing Research Repository, arXiv:2212.08073, 2022b. URL [https://arxiv.org/abs/2212.08073](https://arxiv.org/abs/2212.08073).

Bowen Baker, Joost Huizinga, Leo Gao, Zehao Dou, Melody Y. Guan, Aleksander Madry, Wojciech Zaremba, Jakub Pachocki, and David Farhi. Monitoring reasoning models for misbehavior and the risks of promoting obfuscation. OpenAI Publication, 2025. URL [https://cdn.openai.com/pdf/34f2ada6-870f-4c26-9790-fd8def56387f/CoT\_Monitoring.pdf](https://cdn.openai.com/pdf/34f2ada6-870f-4c26-9790-fd8def56387f/CoT_Monitoring.pdf).

Bradley Brown, Jordan Juravsky, Ryan Ehrlich, Ronald Clark, Quoc V. Le, Christopher Ré, and Azalia Mirhoseini. Large language monkeys: Scaling inference compute with repeated sampling. Computing Research Repository, arXiv:2407.21787, 2024. URL [https://arxiv.org/abs/2407.21787](https://arxiv.org/abs/2407.21787).

Zheng Cai, Maosong Cao, Haojiong Chen, Kai Chen, Keyu Chen, Xin Chen, Xun Chen, Zehui Chen, Zhi Chen, Pei Chu, Xiaoyi Dong, Haodong Duan, Qi Fan, Zhaoye Fei, Yang Gao, Jiaye Ge, Chenya Gu, Yuzhe Gu, Tao Gui, Aijia Guo, Qipeng Guo, Conghui He, Yingfan Hu, Ting Huang, Tao Jiang, Penglong Jiao, Zhenjiang Jin, Zhikai Lei, Jiaxing Li, Jingwen Li, Linyang Li, Shuaibin Li, Wei Li, Yining Li, Hongwei Liu, Jiangning Liu, Jiawei Hong, Kaiwen Liu, Kuikun Liu, Xiaoran Liu, Chengqi Lv, Haijun Lv, Kai Lv, Li Ma, Runyuan Ma, Zerun Ma, Wenchang Ning, Linke Ouyang, Jiantao Qiu, Yuan Qu, Fukai Shang, Yunfan Shao, Demin Song, Zifan Song, Zhihao Sui, Peng Sun, Yu Sun, Huanze Tang, Bin Wang, Guoteng Wang, Jiaqi Wang, Jiayu Wang, Rui Wang, Yudong Wang, Ziyi Wang, Xingjian Wei, Qizhen Weng, Fan Wu, Yingtong Xiong, Chao Xu, Ruiliang Xu, Hang Yan, Yirong Yan, Xiaogui Yang, Haochen Ye, Huaiyuan Ying, Jia Yu, Jing Yu, Yuhang Zang, Chuyu Zhang, Li Zhang, Pan Zhang, Peng Zhang, Ruijie Zhang, Shuo Zhang, Songyang Zhang, Wenjian Zhang, Wenwei Zhang, Xingcheng Zhang, Xinyue Zhang, Hui Zhao, Qian Zhao, Xiaomeng Zhao, Fengzhe Zhou, Zaida Zhou, Jingming Zhuo, Yicheng Zou, Xipeng Qiu, Yu Qiao, and Dahua Lin. Internlm2 technical report. Computing Research Repository, arXiv:2403.17297, 2024. URL [https://arxiv.org/abs/2403.17297](https://arxiv.org/abs/2403.17297).

Maosong Cao, Alexander Lam, Haodong Duan, Hongwei Liu, Songyang Zhang, and Kai Chen. Compassjudger-1: All-in-one judge model helps model evaluation and evolution. Computing Research Repository, arXiv:2410.16256, 2024. URL [https://arxiv.org/abs/2410.16256](https://arxiv.org/abs/2410.16256).

Bei Chen, Fengji Zhang, Anh Nguyen, Daoguang Zan, Zeqi Lin, Jian-Guang Lou, and Weizhu Chen. Codet: Code generation with generated tests. In The Eleventh International Conference on Learning Representations, 2023. URL [https://openreview.net/forum?id=ktrw68Cmu9c](https://openreview.net/forum?id=ktrw68Cmu9c).

Nuo Chen, Zhiyuan Hu, Qingyun Zou, Jiaying Wu, Qian Wang, Bryan Hooi, and Bingsheng He. Judgelrm: Large reasoning models as a judge. Computing Research Repository, arXiv:2504.00050, 2025. URL [https://arxiv.org/abs/2504.00050](https://arxiv.org/abs/2504.00050).

Yinlam Chow, Guy Tennenholtz, Izzeddin Gur, Vincent Zhuang, Bo Dai, Aviral Kumar, Rishabh Agarwal, Sridhar Thiagarajan, Craig Boutilier, and Aleksandra Faust. Inferenceaware fine-tuning for best-of-n sampling in large language models. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=77gQUdQhE7](https://openreview.net/forum?id=77gQUdQhE7).

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. Computing Research Repository, arXiv:2110.14168, 2021. URL [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

<!-- page 14 of 44 -->

Preprint. Under review.

Ganqu Cui, Lifan Yuan, Ning Ding, Guanming Yao, Bingxiang He, Wei Zhu, Yuan Ni, Guotong Xie, Ruobing Xie, Yankai Lin, Zhiyuan Liu, and Maosong Sun. ULTRAFEEDBACK: Boosting language models with scaled AI feedback. In Ruslan Salakhutdinov, Zico Kolter, Katherine Heller, Adrian Weller, Nuria Oliver, Jonathan Scarlett, and Felix Berkenkamp (eds.), Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pp. 9722–9744. PMLR, 21–27 Jul 2024. URL [https://proceedings.mlr.press/v235/cui24f.html](https://proceedings.mlr.press/v235/cui24f.html).

DeepSeek-AI. Deepseek-v2: A strong, economical, and efficient mixture-of-experts language model. Computing Research Repository, arXiv:2405.04434, 2024a. URL [https://arxiv.org/abs/2405.04434](https://arxiv.org/abs/2405.04434).

DeepSeek-AI. Deepseek-v3 technical report. Computing Research Repository, arXiv:2412.19437, 2024b. URL [https://arxiv.org/abs/2412.19437](https://arxiv.org/abs/2412.19437).

DeepSeek-AI. Deepseek-r1 incentivizes reasoning in llms through reinforcement learning. Nature, 645(7952):633–638, September 2025. doi: 10.1038/s41586-025-09422-z.

Kawin Ethayarajh, Yejin Choi, and Swabha Swayamdipta. Understanding dataset difficulty with V-usable information. In Kamalika Chaudhuri, Stefanie Jegelka, Le Song, Csaba Szepesvari, Gang Niu, and Sivan Sabato (eds.), Proceedings of the 39th International Conference on Machine Learning, volume 162 of Proceedings of Machine Learning Research, pp. 5988–6008. PMLR, 17–23 Jul 2022. URL [https://proceedings.mlr.press/v162/ethayarajh22a.html](https://proceedings.mlr.press/v162/ethayarajh22a.html).

Jan-Philipp Fränken, Eric Zelikman, Rafael Rafailov, Kanishk Gandhi, Tobias Gerstenberg, and Noah Goodman. Self-supervised alignment with mutual information: Learning to follow principles without preference labels. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. URL [https://openreview.net/forum?id=UvbpbEhGaw](https://openreview.net/forum?id=UvbpbEhGaw).

Evan Frick, Tianle Li, Connor Chen, Wei-Lin Chiang, Anastasios Nikolas Angelopoulos, Jiantao Jiao, Banghua Zhu, Joseph E. Gonzalez, and Ion Stoica. How to evaluate reward models for RLHF. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=cbttLtO94Q](https://openreview.net/forum?id=cbttLtO94Q).

Leo Gao, John Schulman, and Jacob Hilton. Scaling laws for reward model overoptimization. In Andreas Krause, Emma Brunskill, Kyunghyun Cho, Barbara Engelhardt, Sivan Sabato, and Jonathan Scarlett (eds.), Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pp. 10835–10866. PMLR, 23–29 Jul 2023. URL [https://proceedings.mlr.press/v202/gao23h.html](https://proceedings.mlr.press/v202/gao23h.html).

Amelia Glaese, Nat McAleese, Maja Trębacz, John Aslanides, Vlad Firoiu, Timo Ewalds, Maribeth Rauh, Laura Weidinger, Martin Chadwick, Phoebe Thacker, Lucy Campbell-Gillingham, Jonathan Uesato, Po-Sen Huang, Ramona Comanescu, Fan Yang, Abigail See, Sumanth Dathathri, Rory Greig, Charlie Chen, Doug Fritz, Jaume Sanchez Elias, Richard Green, Soňa Mokrá, Nicholas Fernando, Boxi Wu, Rachel Foley, Susannah Young, Iason Gabriel, William Isaac, John Mellor, Demis Hassabis, Koray Kavukcuoglu, Lisa Anne Hendricks, and Geoffrey Irving. Improving alignment of dialogue agents via targeted human judgements. Computing Research Repository, arXiv:2209.14375, 2022. URL [https://arxiv.org/abs/2209.14375](https://arxiv.org/abs/2209.14375).

Fang Guo, Wenyu Li, Honglei Zhuang, Yun Luo, Yafu Li, Le Yan, Qi Zhu, and Yue Zhang. Mcranker: Generating diverse criteria on-the-fly to improve pointwise llm rankers. In Proceedings of the Eighteenth ACM International Conference on Web Search and Data Mining, WSDM ’25, pp. 944–953, New York, NY, USA, 2025. Association for Computing Machinery. ISBN 9798400713293. doi: 10.1145/3701551.3703583. URL [https://doi.org/10.1145/3701551.3703583](https://doi.org/10.1145/3701551.3703583).

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the MATH dataset. In Thirty-fifth Conference on Neural Information Processing Systems Datasets and Benchmarks Track (Round 2), 2021. URL [https://openreview.net/forum?id=7Bywt2mQsCe](https://openreview.net/forum?id=7Bywt2mQsCe).

<!-- page 15 of 44 -->

Preprint. Under review.

Dongfu Jiang, Xiang Ren, and Bill Yuchen Lin. LLM-blender: Ensembling large language models with pairwise ranking and generative fusion. In Anna Rogers, Jordan Boyd-Graber, and Naoaki Okazaki (eds.), Proceedings of the 61st Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 14165–14178, Toronto, Canada, July 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.acl-long.792. URL [https://aclanthology.org/2023.acl-long.792/](https://aclanthology.org/2023.acl-long.792/).

Carlos E Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik R Narasimhan. SWE-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=VTF8yNQM66](https://openreview.net/forum?id=VTF8yNQM66).

Ryo Kamoi, Sarkar Snigdha Sarathi Das, Renze Lou, Jihyun Janice Ahn, Yilun Zhao, Xiaoxin Lu, Nan Zhang, Yusen Zhang, Haoran Ranran Zhang, Sujeeth Reddy Vummanthala, Salika Dave, Shaobo Qin, Arman Cohan, Wenpeng Yin, and Rui Zhang. Evaluating LLMs at detecting errors in LLM responses. In First Conference on Language Modeling, 2024. URL [https://openreview.net/forum?id=dnwRScljXr](https://openreview.net/forum?id=dnwRScljXr).

M. G. Kendall and B. Babington Smith. On the method of paired comparisons. Biometrika, 31(3/4):324–345, 1940. ISSN 00063444. URL [http://www.jstor.org/stable/2332613](http://www.jstor.org/stable/2332613).

Seungone Kim, Juyoung Suk, Shayne Longpre, Bill Yuchen Lin, Jamin Shin, Sean Welleck, Graham Neubig, Moontae Lee, Kyungjae Lee, and Minjoon Seo. Prometheus 2: An open source language model specialized in evaluating other language models. In Yaser Al-Onaizan, Mohit Bansal, and Yun-Nung Chen (eds.), Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pp. 4334–4353, Miami, Florida, USA, November 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024. emnlp-main.248. URL [https://aclanthology.org/2024.emnlp-main.248/](https://aclanthology.org/2024.emnlp-main.248/).

Seungone Kim, Ian Wu, Jinu Lee, Xiang Yue, Seongyun Lee, Mingyeong Moon, Kiril Gashteovski, Carolin Lawrence, Julia Hockenmaier, Graham Neubig, and Sean Welleck. Scaling evaluation-time compute with reasoning models as process evaluators. Computing Research Repository, arXiv:2503.19877, 2025. URL [https://arxiv.org/abs/2503.19877](https://arxiv.org/abs/2503.19877).

Nathan Lambert, Valentina Pyatkin, Jacob Morrison, LJ Miranda, Bill Yuchen Lin, Khyathi Chandu, Nouha Dziri, Sachin Kumar, Tom Zick, Yejin Choi, Noah A. Smith, and Hannaneh Hajishirzi. Rewardbench: Evaluating reward models for language modeling. Computing Research Repository, arXiv:2403.13787, 2024. URL [https://arxiv.org/abs/2403.13787](https://arxiv.org/abs/2403.13787).

Junlong Li, Shichao Sun, Weizhe Yuan, Run-Ze Fan, hai zhao, and Pengfei Liu. Generative judge for evaluating alignment. In The Twelfth International Conference on Learning Representations, 2024a. URL [https://openreview.net/forum?id=gtkFw6sZGS](https://openreview.net/forum?id=gtkFw6sZGS).

Lei Li, Yekun Chai, Shuohuan Wang, Yu Sun, Hao Tian, Ningyu Zhang, and Hua Wu. Tool-augmented reward modeling. In The Twelfth International Conference on Learning Representations, 2024b. URL [https://openreview.net/forum?id=d94x0gWTUX](https://openreview.net/forum?id=d94x0gWTUX).

Xuechen Li, Tianyi Zhang, Yann Dubois, Rohan Taori, Ishaan Gulrajani, Carlos Guestrin, Percy Liang, and Tatsunori B. Hashimoto. Alpacaeval: An automatic evaluator of instruction-following models. [https://github.com/tatsu-lab/alpaca\_eval](https://github.com/tatsu-lab/alpaca_eval), 5 2023.

Shalev Lifshitz, Sheila A. McIlraith, and Yilun Du. Multi-agent verification: Scaling test-time compute with multiple verifiers. In Second Conference on Language Modeling, 2025. URL [https://openreview.net/forum?id=LriQ3NY9uL](https://openreview.net/forum?id=LriQ3NY9uL).

Hunter Lightman, Vineet Kosaraju, Yuri Burda, Harrison Edwards, Bowen Baker, Teddy Lee, Jan Leike, John Schulman, Ilya Sutskever, and Karl Cobbe. Let’s verify step by step. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=v8L0pN6EOi](https://openreview.net/forum?id=v8L0pN6EOi).

<!-- page 16 of 44 -->

Preprint. Under review.

Chris Yuhao Liu, Liang Zeng, Jiacai Liu, Rui Yan, Jujie He, Chaojie Wang, Shuicheng Yan, Yang Liu, and Yahui Zhou. Skywork-reward: Bag of tricks for reward modeling in llms. Computing Research Repository, arXiv:2410.18451, 2024. URL [https://arxiv.org/abs/2410.18451](https://arxiv.org/abs/2410.18451).

Yantao Liu, Zijun Yao, Rui Min, Yixin Cao, Lei Hou, and Juanzi Li. Pairjudge rm: Perform best-of-n sampling with knockout tournament. Computing Research Repository, arXiv:2501.13007, 2025. URL [https://arxiv.org/abs/2501.13007](https://arxiv.org/abs/2501.13007).

Dakota Mahan, Duy Van Phung, Rafael Rafailov, Chase Blagden, Nathan Lile, Louis Castricato, Jan-Philipp Fränken, Chelsea Finn, and Alon Albalak. Generative reward models. Computing Research Repository, arXiv:2410.12832, 2024. URL [https://arxiv.org/abs/2410.12832](https://arxiv.org/abs/2410.12832).

Tong Mu, Alec Helyar, Johannes Heidecke, Joshua Achiam, Andrea Vallone, Ian D Kivlichan, Molly Lin, Alex Beutel, John Schulman, and Lilian Weng. Rule based rewards for language model safety. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. URL [https://openreview.net/forum?id=QVtwpT5Dmg](https://openreview.net/forum?id=QVtwpT5Dmg).

Niklas Muennighoff, Qian Liu, Armel Randy Zebaze, Qinkai Zheng, Binyuan Hui, Terry Yue Zhuo, Swayam Singh, Xiangru Tang, Leandro Von Werra, and Shayne Longpre. Octopack: Instruction tuning code large language models. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=mw1PWNSWZP](https://openreview.net/forum?id=mw1PWNSWZP).

OpenAI. Openai o1 system card. Computing Research Repository, arXiv:2412.16720, 2024. URL [https://arxiv.org/abs/2412.16720](https://arxiv.org/abs/2412.16720).

OpenAI. Deep research system card. OpenAI Publication, 2025a. URL [https://cdn.openai.com/deep-research-system-card.pdf](https://cdn.openai.com/deep-research-system-card.pdf).

OpenAI. Openai gpt-4.5 system card. OpenAI Publication, 2025b. URL [https://cdn.openai.com/gpt-4-5-system-card-2272025.pdf](https://cdn.openai.com/gpt-4-5-system-card-2272025.pdf).

OpenAI. Openai o3-mini system card. OpenAI Publication, 2025c. URL [https://cdn.openai.com/o3-mini-system-card-feb10.pdf](https://cdn.openai.com/o3-mini-system-card-feb10.pdf).

Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul Christiano, Jan Leike, and Ryan Lowe. Training language models to follow instructions with human feedback. In Proceedings of the 36th International Conference on Neural Information Processing Systems, NIPS ’22, Red Hook, NY, USA, 2022. Curran Associates Inc. ISBN 9781713871088.

Junsoo Park, Seungyeon Jwa, Ren Meiying, Daeyoung Kim, and Sanghyuk Choi. OffsetBias: Leveraging debiased data for tuning evaluators. In Yaser Al-Onaizan, Mohit Bansal, and Yun-Nung Chen (eds.), Findings of the Association for Computational Linguistics: EMNLP 2024, pp. 1043–1067, Miami, Florida, USA, November 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.findings-emnlp.57. URL [https://aclanthology.org/2024.findings-emnlp.57/](https://aclanthology.org/2024.findings-emnlp.57/).

Hao Peng, Yunjia Qi, Xiaozhi Wang, Zijun Yao, Bin Xu, Lei Hou, and Juanzi Li. Agentic reward modeling: Integrating human preferences with verifiable correctness signals for reliable reward systems. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar (eds.), Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 15934–15949, Vienna, Austria, July 2025. Association for Computational Linguistics. ISBN 979-8-89176-251-0. doi: 10.18653/v1/2025.acl-long.775. URL [https://aclanthology.org/2025.acl-long.775/](https://aclanthology.org/2025.acl-long.775/).

Paul Röttger, Hannah Kirk, Bertie Vidgen, Giuseppe Attanasio, Federico Bianchi, and Dirk Hovy. XSTest: A test suite for identifying exaggerated safety behaviours in large language models. In Kevin Duh, Helena Gomez, and Steven Bethard (eds.), Proceedings of the 2024

<!-- page 17 of 44 -->

Preprint. Under review.

Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers), pp. 5377–5400, Mexico City, Mexico, June 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.naacl-long. 301. URL [https://aclanthology.org/2024.naacl-long.301/](https://aclanthology.org/2024.naacl-long.301/).

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. Computing Research Repository, arXiv:2402.0330, 2024. URL [https://arxiv.org/abs/2402.03300](https://arxiv.org/abs/2402.03300).

Mrinank Sharma, Meg Tong, Jesse Mu, Jerry Wei, Jorrit Kruthoff, Scott Goodfriend, Euan Ong, Alwin Peng, Raj Agarwal, Cem Anil, Amanda Askell, Nathan Bailey, Joe Benton, Emma Bluemke, Samuel R. Bowman, Eric Christiansen, Hoagy Cunningham, Andy Dau, Anjali Gopal, Rob Gilson, Logan Graham, Logan Howard, Nimit Kalra, Taesung Lee, Kevin Lin, Peter Lofgren, Francesco Mosconi, Clare O’Hara, Catherine Olsson, Linda Petrini, Samir Rajani, Nikhil Saxena, Alex Silverstein, Tanya Singh, Theodore Sumers, Leonard Tang, Kevin K. Troy, Constantin Weisser, Ruiqi Zhong, Giulio Zhou, Jan Leike, Jared Kaplan, and Ethan Perez. Constitutional classifiers: Defending against universal jailbreaks across thousands of hours of red teaming. Computing Research Repository, arXiv:2501.18837, 2025. URL [https://arxiv.org/abs/2501.18837](https://arxiv.org/abs/2501.18837).

Charlie Victor Snell, Jaehoon Lee, Kelvin Xu, and Aviral Kumar. Scaling LLM test-time compute optimally can be more effective than scaling parameters for reasoning. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=4FWAwZtd2n](https://openreview.net/forum?id=4FWAwZtd2n).

Nisan Stiennon, Long Ouyang, Jeff Wu, Daniel M. Ziegler, Ryan Lowe, Chelsea Voss, Alec Radford, Dario Amodei, and Paul Christiano. Learning to summarize from human feedback. In Proceedings of the 34th International Conference on Neural Information Processing Systems, NIPS ’20, Red Hook, NY, USA, 2020. Curran Associates Inc. ISBN 9781713829546.

Zhiqing Sun, Yikang Shen, Qinhong Zhou, Hongxin Zhang, Zhenfang Chen, David Daniel Cox, Yiming Yang, and Chuang Gan. Principle-driven self-alignment of language models from scratch with minimal human supervision. In Thirty-seventh Conference on Neural Information Processing Systems, 2023. URL [https://openreview.net/forum?id=p40XRfBX96](https://openreview.net/forum?id=p40XRfBX96).

Zhiqing Sun, Yikang Shen, Hongxin Zhang, Qinhong Zhou, Zhenfang Chen, David Daniel Cox, Yiming Yang, and Chuang Gan. SALMON: Self-alignment with instructable reward models. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=xJbsmB8UMx](https://openreview.net/forum?id=xJbsmB8UMx).

Gemma Team. Gemma 2: Improving open language models at a practical size. Computing Research Repository, arXiv:2408.0011, 2024. URL [https://arxiv.org/abs/2408.00118](https://arxiv.org/abs/2408.00118).

Hemish Veeraboina. Aime problem set 1983-2024, 2023. URL [https://www.kaggle.com/datasets/hemishveeraboina/aime-problem-set-1983-2024](https://www.kaggle.com/datasets/hemishveeraboina/aime-problem-set-1983-2024).

Tu Vu, Kalpesh Krishna, Salaheddin Alzubi, Chris Tar, Manaal Faruqui, and Yun-Hsuan Sung. Foundational autoraters: Taming large language models for better automatic evaluation. In Yaser Al-Onaizan, Mohit Bansal, and Yun-Nung Chen (eds.), Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pp. 17086–17105, Miami, Florida, USA, November 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.emnlp-main.949. URL [https://aclanthology.org/2024.emnlp-main.949/](https://aclanthology.org/2024.emnlp-main.949/).

Chenglong Wang, Yang Gan, Yifu Huo, Yongyu Mu, Qiaozhi He, MuRun Yang, Bei Li, Tong Xiao, Chunliang Zhang, Tongran Liu, and JingBo Zhu. GRAM: A generative foundation reward model for reward generalization. In Forty-second International Conference on Machine Learning, 2025a. URL [https://openreview.net/forum?id=rxKC8v2uHc](https://openreview.net/forum?id=rxKC8v2uHc).

Haoxiang Wang, Wei Xiong, Tengyang Xie, Han Zhao, and Tong Zhang. Interpretable preferences via multi-objective reward modeling and mixture-of-experts. In Yaser Al-Onaizan,

<!-- page 18 of 44 -->

Preprint. Under review.

Mohit Bansal, and Yun-Nung Chen (eds.), Findings of the Association for Computational Linguistics: EMNLP 2024, pp. 10582–10592, Miami, Florida, USA, November 2024a. Association for Computational Linguistics. doi: 10.18653/v1/2024.findings-emnlp.620. URL [https://aclanthology.org/2024.findings-emnlp.620/](https://aclanthology.org/2024.findings-emnlp.620/).

Peiyi Wang, Lei Li, Zhihong Shao, Runxin Xu, Damai Dai, Yifei Li, Deli Chen, Yu Wu, and Zhifang Sui. Math-shepherd: Verify and reinforce LLMs step-by-step without human annotations. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar (eds.), Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 9426–9439, Bangkok, Thailand, August 2024b. Association for Computational Linguistics. doi: 10.18653/v1/2024.acl-long.510. URL [https://aclanthology.org/2024.acl-long.510/](https://aclanthology.org/2024.acl-long.510/).

Tianlu Wang, Ilia Kulikov, Olga Golovneva, Ping Yu, Weizhe Yuan, Jane Dwivedi-Yu, Richard Yuanzhe Pang, Maryam Fazel-Zarandi, Jason Weston, and Xian Li. Self-taught evaluators. Computing Research Repository, arXiv:2408.02666, 2024c. URL [https://arxiv.org/abs/2408.02666](https://arxiv.org/abs/2408.02666).

Yuxia Wang, Haonan Li, Xudong Han, Preslav Nakov, and Timothy Baldwin. Do-not-answer: Evaluating safeguards in LLMs. In Yvette Graham and Matthew Purver (eds.), Findings of the Association for Computational Linguistics: EACL 2024, pp. 896–911, St. Julian’s, Malta, March 2024d. Association for Computational Linguistics. URL [https://aclanthology.org/2024.findings-eacl.61/](https://aclanthology.org/2024.findings-eacl.61/).

Zhilin Wang, Yi Dong, Olivier Delalleau, Jiaqi Zeng, Gerald Shen, Daniel Egert, Jimmy J. Zhang, Makesh Narsimhan Sreedhar, and Oleksii Kuchaiev. Helpsteer 2: Open-source dataset for training top-performing reward models. In The Thirty-eight Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2024e. URL [https://openreview.net/forum?id=PvVKUFhaNy](https://openreview.net/forum?id=PvVKUFhaNy).

Zhilin Wang, Alexander Bukharin, Olivier Delalleau, Daniel Egert, Gerald Shen, Jiaqi Zeng, Oleksii Kuchaiev, and Yi Dong. Helpsteer2-preference: Complementing ratings with preferences. In The Thirteenth International Conference on Learning Representations, 2025b. URL [https://openreview.net/forum?id=MnfHxPP5gs](https://openreview.net/forum?id=MnfHxPP5gs).

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, brian ichter, Fei Xia, Ed H. Chi, Quoc V Le, and Denny Zhou. Chain of thought prompting elicits reasoning in large language models. In Alice H. Oh, Alekh Agarwal, Danielle Belgrave, and Kyunghyun Cho (eds.), Advances in Neural Information Processing Systems, 2022. URL [https://openreview.net/forum?id=\_VjQlMeSB\_J](https://openreview.net/forum?id=_VjQlMeSB_J).

Genta Indra Winata, David Anugraha, Lucky Susanto, Garry Kuwanto, and Derry Tanti Wijaya. Metametrics: Calibrating metrics for generation tasks using human preferences. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=slO3xTt4CG](https://openreview.net/forum?id=slO3xTt4CG).

Tianhao Wu, Weizhe Yuan, Olga Golovneva, Jing Xu, Yuandong Tian, Jiantao Jiao, Jason Weston, and Sainbayar Sukhbaatar. Meta-rewarding language models: Self-improving alignment with llm-as-a-meta-judge. Computing Research Repository, arXiv:2407.19594, 2024. URL [https://arxiv.org/abs/2407.19594](https://arxiv.org/abs/2407.19594).

Yangzhen Wu, Zhiqing Sun, Shanda Li, Sean Welleck, and Yiming Yang. Inference scaling laws: An empirical analysis of compute-optimal inference for LLM problem-solving. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=VNckp7JEHn](https://openreview.net/forum?id=VNckp7JEHn).

Tianbao Xie, Danyang Zhang, Jixuan Chen, Xiaochuan Li, Siheng Zhao, Ruisheng Cao, Toh Jing Hua, Zhoujun Cheng, Dongchan Shin, Fangyu Lei, Yitao Liu, Yiheng Xu, Shuyan Zhou, Silvio Savarese, Caiming Xiong, Victor Zhong, and Tao Yu. OSWorld: Benchmarking multimodal agents for open-ended tasks in real computer environments. In The Thirty-eight Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2024. URL [https://openreview.net/forum?id=tN61DTr4Ed](https://openreview.net/forum?id=tN61DTr4Ed).

<!-- page 19 of 44 -->

Preprint. Under review.

Shunyu Yao, Howard Chen, John Yang, and Karthik R Narasimhan. Webshop: Towards scalable real-world web interaction with grounded language agents. In Alice H. Oh, Alekh Agarwal, Danielle Belgrave, and Kyunghyun Cho (eds.), Advances in Neural Information Processing Systems, 2022. URL [https://openreview.net/forum?id=R9KnuFlvnU](https://openreview.net/forum?id=R9KnuFlvnU).

Zihuiwen Ye, Fraser David Greenlee, Max Bartolo, Phil Blunsom, Jon Ander Campos, and Matthias Gallé. Improving reward models with synthetic critiques. In Luis Chiruzzo, Alan Ritter, and Lu Wang (eds.), Findings of the Association for Computational Linguistics: NAACL 2025, pp. 4506–4520, Albuquerque, New Mexico, April 2025a. Association for Computational Linguistics. ISBN 979-8-89176-195-7. doi: 10.18653/v1/2025.findings-naacl.254. URL [https://aclanthology.org/2025.findings-naacl.254/](https://aclanthology.org/2025.findings-naacl.254/).

Ziyi Ye, Xiangsheng Li, Qiuchi Li, Qingyao Ai, Yujia Zhou, Wei Shen, Dong Yan, and Yiqun LIU. Learning LLM-as-a-judge for preference alignment. In The Thirteenth International Conference on Learning Representations, 2025b. URL [https://openreview.net/forum?id=HZVIQE1MsJ](https://openreview.net/forum?id=HZVIQE1MsJ).

Jiachen Yu, Shaoning Sun, Xiaohui Hu, Jiaxu Yan, Kaidong Yu, and Xuelong Li. Improve llm-as-a-judge ability as a general ability. Computing Research Repository, arXiv:2502.11689, 2025a. URL [https://arxiv.org/abs/2502.11689](https://arxiv.org/abs/2502.11689).

Yue Yu, Zhengxing Chen, Aston Zhang, Liang Tan, Chenguang Zhu, Richard Yuanzhe Pang, Yundi Qian, Xuewei Wang, Suchin Gururangan, Chao Zhang, Melanie Kambadur, Dhruv Mahajan, and Rui Hou. Self-generated critiques boost reward modeling for language models. In Luis Chiruzzo, Alan Ritter, and Lu Wang (eds.), Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers), pp. 11499–11514, Albuquerque, New Mexico, April 2025b. Association for Computational Linguistics. ISBN 979-8-89176-189-6. doi: 10.18653/v1/2025.naacl-long.573. URL [https://aclanthology.org/2025.naacl-long.573/](https://aclanthology.org/2025.naacl-long.573/).

Weizhe Yuan, Richard Yuanzhe Pang, Kyunghyun Cho, Xian Li, Sainbayar Sukhbaatar, Jing Xu, and Jason E Weston. Self-rewarding language models. In Ruslan Salakhutdinov, Zico Kolter, Katherine Heller, Adrian Weller, Nuria Oliver, Jonathan Scarlett, and Felix Berkenkamp (eds.), Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pp. 57905–57923. PMLR, 21–27 Jul 2024. URL [https://proceedings.mlr.press/v235/yuan24d.html](https://proceedings.mlr.press/v235/yuan24d.html).

Zhiyuan Zeng, Jiatong Yu, Tianyu Gao, Yu Meng, Tanya Goyal, and Danqi Chen. Evaluating large language models at evaluating instruction following. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=tr0KidwPLc](https://openreview.net/forum?id=tr0KidwPLc).

Lunjun Zhang, Arian Hosseini, Hritik Bansal, Mehran Kazemi, Aviral Kumar, and Rishabh Agarwal. Generative verifiers: Reward modeling as next-token prediction. In The Thirteenth International Conference on Learning Representations, 2025a. URL [https://openreview.net/forum?id=Ccwp4tFEtE](https://openreview.net/forum?id=Ccwp4tFEtE).

Zhenru Zhang, Chujie Zheng, Yangzhen Wu, Beichen Zhang, Runji Lin, Bowen Yu, Dayiheng Liu, Jingren Zhou, and Junyang Lin. The lessons of developing process reward models in mathematical reasoning. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar (eds.), Findings of the Association for Computational Linguistics: ACL 2025, pp. 10495–10516, Vienna, Austria, July 2025b. Association for Computational Linguistics. ISBN 979-8-89176-256-5. doi: 10.18653/v1/2025.findings-acl.547. URL [https://aclanthology.org/2025.findings-acl.547/](https://aclanthology.org/2025.findings-acl.547/).

Chujie Zheng, Zhenru Zhang, Beichen Zhang, Runji Lin, Keming Lu, Bowen Yu, Dayiheng Liu, Jingren Zhou, and Junyang Lin. ProcessBench: Identifying process errors in mathematical reasoning. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar (eds.), Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 1009–1024, Vienna, Austria,

<!-- page 20 of 44 -->

Preprint. Under review.

July 2025. Association for Computational Linguistics. ISBN 979-8-89176-251-0. doi: 10.18653/v1/2025.acl-long.50. URL [https://aclanthology.org/2025.acl-long.50/](https://aclanthology.org/2025.acl-long.50/).

Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, Siyuan Zhuang, Zhanghao Wu, Yonghao Zhuang, Zi Lin, Zhuohan Li, Dacheng Li, Eric P. Xing, Hao Zhang, Joseph E. Gonzalez, and Ion Stoica. Judging llm-as-a-judge with mt-bench and chatbot arena. In Proceedings of the 37th International Conference on Neural Information Processing Systems, NIPS ’23, Red Hook, NY, USA, 2023. Curran Associates Inc.

Enyu Zhou, Guodong Zheng, Binghai Wang, Zhiheng Xi, Shihan Dou, Rong Bao, Wei Shen, Limao Xiong, Jessica Fan, Yurong Mou, Rui Zheng, Tao Gui, Qi Zhang, and Xuanjing Huang. RMB: Comprehensively benchmarking reward models in LLM alignment. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=kmgrlG9TR0](https://openreview.net/forum?id=kmgrlG9TR0).

Terry Yue Zhuo, Vu Minh Chien, Jenny Chim, Han Hu, Wenhao Yu, Ratnadira Widyasari, Imam Nur Bani Yusuf, Haolan Zhan, Junda He, Indraneil Paul, Simon Brunner, Chen GONG, James Hoang, Armel Randy Zebaze, Xiaoheng Hong, Wen-Ding Li, Jean Kaddour, Ming Xu, Zhihan Zhang, Prateek Yadav, Naman Jain, Alex Gu, Zhoujun Cheng, Jiawei Liu, Qian Liu, Zijian Wang, David Lo, Binyuan Hui, Niklas Muennighoff, Daniel Fried, Xiaoning Du, Harm de Vries, and Leandro Von Werra. Bigcodebench: Benchmarking code generation with diverse function calls and complex instructions. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=YrycTjllL0](https://openreview.net/forum?id=YrycTjllL0).

<!-- page 21 of 44 -->

Preprint. Under review.

## Contents

- 1 Introduction 1
- 2 Preliminaries 3
- 2.1 Comparisons of Different RM approaches . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3
- 2.2 Boosting Reward Quality with Principles . . . . . . . . . . . . . . . . . . . . 5
- 3 Self-Principled Critique Tuning (SPCT) 5
- 3.1 Unpinning Principles from Understanding to Generation . . . . . . . . . . . . . . . 5
- 3.2 Rule-Based Reinforcement Learning . . . . . . . . . . . . . . . . . . 6
- 4 Inference-Time Scaling with SPCT 7
- 5 Results on Reward Modeling Benchmarks 8
- 5.1 Experiment Settings . . . . . . . . . . . . . . . . . . . . . . . . . . 8
- 5.2 Results and Analysis . . . . . . . . . . . . . . . . . . 9
- 6 Related Work 11
- 7 Conclusion and Future Work 11
- A Additional Related Work 23
- B Limitations and Future Directions 23
- C Implementation Details 24
- C.1 Model Training . . . . . . . . . . . . . . . . . . . . . . 24
- C.2 Baseline Implementation . . . . . . . . . . . . . . . . 25
- D Experiment Details 25
- D.1 Hyper-Parameters . . . . . . . . . . . . . . . . . . 25
- D.2 Benchmarks . . . . . . . . . . . . . . . . . 26
- D.3 Detailed Results . . . . . . . . . . . . . . . 28
- E Additional Experiments 29
- E.1 Input Flexibility of the Pointwise GRM Approach . . . . . . . . . . . . 29
- E.1.1 Generating Rewards for Many Responses . . . . . . . . . . 29
- E.1.2 Generating Rewards for Single Responses . . . . . . . . 29
- E.1.3 Generating Rewards with Reference . . . . . . . . 29
- E.2 Transferability of Generated Principles . . . . . . . . . . 30
- E.3 Generalization beyond Training Data . . . . . . . . . . . 30
- E.4 Response Length Analysis for Rule-Based RL . . . . . . . . 30

<!-- page 22 of 44 -->

Preprint. Under review.

- F Qualitative Analysis 31
- F.1 Case Study 31
- F.2 Failure Mode Analysis 40
- G Prompt Templates 41

<!-- page 23 of 44 -->

Preprint. Under review.

![Image block](./images/p23-figure-5-illustration-of-the-derivation-of-deepseek-grm.jpg)

Figure 5: Illustration of the derivation of DeepSeek-GRM-RFT, DeepSeek-GRM, and Meta RM in the SPCT pipeline.

## A Additional Related Work · 补充相关工作

**Constitutional AI** Constitutional AI has emerged as a scalable alternative to traditional reinforcement learning from human feedback (Ouyang et al., 2022), aiming to align language models with human values through a set of guiding principles or “constitutions” (Bai et al., 2022b; Sun et al., 2023; 2024), replacing human critiques with AI-generated feedback (Fränken et al., 2024) or classifiers (Sharma et al., 2025) based on these hand-crafted principles. Similarly, rule-based approaches like Sparrow (Glaese et al., 2022) and Rule-Based Rewards (RBR) (Mu et al., 2024) incorporate explicit natural language rules into the training loop for specific domains like safety. Although effective, these methods rely on static, manually written constitutions that are limited in scope, potentially biased, and inflexible. This has motivated interests in automating the generation or refinement of principles, which aligns with our target in this work.

**Constitutional AI** Constitutional AI 是传统基于人类反馈的强化学习 (Ouyang et al., 2022) 之外一种可扩展的替代方案, 目标是借助一组指导原则或「宪法」(Bai et al., 2022b; Sun et al., 2023; 2024) 让语言模型与人类价值对齐, 用基于这些人工撰写原则的 AI 反馈 (Fränken et al., 2024) 或分类器 (Sharma et al., 2025) 代替人写的评语. 类似地, Sparrow (Glaese et al., 2022) 和 Rule-Based Rewards (RBR) (Mu et al., 2024) 等基于规则的方法, 在安全等特定领域把显式的自然语言规则纳入训练循环. 这些方法虽然有效, 但依赖静态的, 人工撰写的宪法, 覆盖范围有限, 可能有偏, 也不够灵活. 这促使人们关注原则的自动生成或改进, 与本工作的目标一致.

**Scalar Reward Models** Scalar reward modeling for LLMs are proposed the earliest to serve as a proxy model for human feedback (Stiennon et al., 2020; Gao et al., 2023). Recent studies focus on Bradley-Terry modeling (Kendall & Smith, 1940) and other regression approaches for better expressiveness for scalar reward models (Cai et al., 2024; Wang et al., 2024e;a; Liu et al., 2024; Wang et al., 2025b) of general preference. In contrast to these outcome reward models, process reward models are proposed as step verifiers for reasoning problems, e.g., math, etc. (Cobbe et al., 2021; Wang et al., 2024b; Zhang et al., 2025b), demonstrating the feasibility of scalar RMs in a formal domain with extensive reasoning and knowledge. Scalar RM excels in simplicity and is computationally efficient, but suffers from limited expressivity and struggles to generalize across diverse input types or refine reward signals at inference time.

**标量奖励模型** LLM 的标量奖励建模出现得最早, 用作人类反馈的代理模型 (Stiennon et al., 2020; Gao et al., 2023). 近期研究集中在 Bradley-Terry 建模 (Kendall & Smith, 1940) 和其他回归方法上, 让标量奖励模型更好地表达一般偏好 (Cai et al., 2024; Wang et al., 2024e;a; Liu et al., 2024; Wang et al., 2025b). 与这些结果奖励模型不同, 过程奖励模型被提出来作为数学等推理问题的步骤验证器 (Cobbe et al., 2021; Wang et al., 2024b; Zhang et al., 2025b), 说明标量 RM 在需要大量推理和知识的形式化领域是可行的. 标量 RM 胜在简单, 计算高效, 但表达能力有限, 难以泛化到多样的输入类型, 也难以在推理时改进奖励信号.

**Semi-Scalar Reward Models** Semi-scalar reward models aim to enrich scalar reward signals through textual intermediate representations. (Ye et al., 2025a; Ankner et al., 2024) Consequently, works (Yu et al., 2025b) proposed to enhance the quality of generated critiques to eventually improve reward generation. Some studies use the token probability to substitute the scalar head for reward extraction (Mahan et al., 2024; Zhang et al., 2025a). These works show that semi-scalar RMs face challenges in inference-time scaling based on sampling and voting, resulting in limited performance improvement. The semi-scalar approach trades off between scalar RMs and GRMs in terms of both efficiency and effectiveness.

**半标量奖励模型** 半标量奖励模型试图借助文本形式的中间表示丰富标量奖励信号 (Ye et al., 2025a; Ankner et al., 2024). 在此基础上, 有工作 (Yu et al., 2025b) 提出提升生成评语的质量, 最终改进奖励生成. 还有研究用 token 概率代替标量头来抽取奖励 (Mahan et al., 2024; Zhang et al., 2025a). 这些工作表明, 半标量 RM 在基于采样和投票的 TestingTime 扩展上有困难, 性能提升有限. 半标量方法在效率和效果两方面都介于标量 RM 和 GRM 之间.

## B Limitations and Future Directions · 局限与未来方向

**Limitations** Though SPCT significantly leverages the performance and inference-time scalability of GRMs and surpasses (semi-)scalar RMs in general domains, it still faces a few limitations. (1) The efficiency of the generative RMs is largely lagging behind the scalar RMs at the same scale by nature, which inhibits its large-scale usage in online RL pipelines. However, since we adopt parallel sampling for inference-time scaling, the latency of reward generation with a reasonable amount of, e.g., eight samplings will not increase significantly. Further research around the efficient generation of LLMs and innovations in RM applications

<!-- page 24 of 44 -->

Preprint. Under review.

could alleviate the problem. (2) In specific domains such as verifiable tasks, DeepSeek-GRM still lags behind scalar models. This could be because the scalar RMs capture hidden features of reasoning queries and responses, while GRMs need stronger reasoning capabilities to examine responses thoroughly. However, scalar RMs suffer severe biases and scalability issues. For GRMs, we found that both reference-based reward generation (Appendix E.1.3 and long-horizon reasoning (Appendix D.3) could mitigate this limitation. (3) Due to the universality of the pointwise GRM approach, DeepSeek-GRM could potentially serve as a process RM in addition to the outcome RM. Though we have not explored much in this direction in the paper, the performance in the Reasoning subset of Reward Bench, which mainly comprises of MATH-prm data (Lightman et al., 2024), could partially support the potential of this application.

**局限** 尽管 SPCT 显著提升了 GRM 的表现和 TestingTime 可扩展性, 并在通用领域超过 (半) 标量 RM, 它仍有几项局限. (1) 生成式 RM 的效率天然大幅落后于同规模的标量 RM, 这限制了它在在线 RL 流水线中的大规模使用. 不过, 由于我们用并行采样做 TestingTime 扩展, 在合理的采样数下 (例如 8 次), 奖励生成的时延不会显著增加. 围绕 LLM 高效生成的进一步研究, 以及 RM 应用上的创新, 可以缓解这个问题. (2) 在可验证任务等特定领域, DeepSeek-GRM 仍落后于标量模型. 原因可能是标量 RM 捕捉到了推理类查询和回答的隐藏特征, 而 GRM 需要更强的推理能力才能彻底检查回答. 不过, 标量 RM 有严重的偏差和可扩展性问题. 对 GRM 而言, 我们发现带参考的奖励生成 (附录 E.1.3) 和长程推理 (附录 D.3) 都能缓解这一局限. (3) 由于 pointwise GRM 方法的通用性, DeepSeek-GRM 除了作结果 RM, 还可能作过程 RM. 我们在论文中没有深入探索这个方向, 但它在 Reward Bench 的 Reasoning 子集 (主要由 MATH-prm 数据 (Lightman et al., 2024) 构成) 上的表现, 可以部分支持这种应用的潜力.

**Future Directions** There are also several promising directions for future research based on SPCT or DeepSeek-GRM models. (1) Tool incorporation of RMs is studied by previous work (Li et al., 2024b), and could also be used for DeepSeek-GRM augmentation. **With tools such as code interpreters and search engine interfaces**, the generated critiques could be more accurate for tasks that requires strict procedures or extensive knowledge, and the cases in which GRMs fail to follow principles related to numeric calculations, pattern matching, etc. could be avoided. (2) **The generation paradigm for principles and critiques could be decomposed** into separate stages, that is, the principles could be generated ahead of time for each query and the responses to be rated and stored, and then the critiques are generated with GRMs, rules, or other agentic approaches. The principle generation serves as an interface for the following critiques. This might improve the efficiency of current GRMs for the integration of RL pipelines. (3) The DeepSeek-GRM could be potentially **used in LLM offline evaluation**. Since each principle reflects a criteria, we can get criteria from all data points that a particular LLM is inferior than one another, as a interpretable protocol of the weaknesses of the particular LLM. (4) The DeepSeek-GRM might **be benefit from long-horizon reasoning**. However, this will further affect its efficiency. These directions should be studied in the future work.

**未来方向** 基于 SPCT 或 DeepSeek-GRM 模型, 还有几个有前景的研究方向. (1) RM 引入工具已有前人研究 (Li et al., 2024b), 也可用于增强 DeepSeek-GRM. **借助代码解释器和搜索引擎接口等工具**, 对需要严格流程或大量知识的任务, 生成的评语可以更准确, GRM 在数值计算, 模式匹配等原则上执行不到位的情况也可以避免. (2) **原则和评语的生成范式可以拆分**成独立的阶段, 也就是说, 可以针对每个查询和待打分的回答提前生成并存储原则, 再用 GRM, 规则或其他 Agent 方法生成评语. 原则生成充当后续评语的接口. 这可能提升现有 GRM 接入 RL 流水线时的效率. (3) DeepSeek-GRM 有可能**用于 LLM 的离线评测**. 由于每条原则反映一项标准, 我们可以从某个 LLM 不如另一个 LLM 的所有数据点中收集标准, 作为这个 LLM 弱点的可解释记录. (4) DeepSeek-GRM 也许能**从长程推理中获益**, 但这会进一步影响效率. 这些方向留待未来工作研究.

## C Implementation Details · 实现细节

## C.1 Model Training · 模型训练

For the rule-based online RL, we use the standard GRPO setting (Shao et al., 2024). The overall objective is

基于规则的在线 RL 采用标准的 GRPO 设定 (Shao et al., 2024). 总目标为

$$
\begin{array}{l} \mathcal {J} _ {\mathrm{GRPO}} (\theta) = \mathbb {E} [ q \sim P (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {o l d}} (O | q) ] \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{| o _ {i} |} \sum_ {t = 1} ^ {| o _ {i} |} \\ \left\{\min \left[ \frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta_ {o l d}} (o _ {i , t} | q , o _ {i , <   t})} \hat {A} _ {i, t}, \mathrm{clip} \left(\frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta_ {o l d}} (o _ {i , t} | q , o _ {i , <   t})}, 1 - \epsilon , 1 + \epsilon\right) \hat {A} _ {i, t} \right] - \beta \mathbb {D} _ {K L} \left[ \pi_ {\theta} | | \pi_ {r e f} \right] \right\}, \end{array}\tag{15}
$$

where $\begin{array} { r } { \hat { A } _ { i , t } = \frac { \hat { r } _ { i } - \mathrm { m e a n } ( \hat { \mathbf { r } } ) } { \mathrm { s t d } ( \hat { \mathbf { r } } ) } } \end{array}$ , G is the group size, $\beta$ is the coefficient of KL penalty, and $q = \left( x , \{ y _ { i } \} _ { i = 1 } ^ { n } \right)$ with prompts. We performed grid search on hyper-parameter $\beta \in$ $\left\{ 0 . 0 0 , 0 . 0 1 , 0 . 0 2 , 0 . 0 8 \right\}$ and found that $\beta = 0 . 0 8$ is the most stable configuration for DeepSeek-GRM-27B. And with too small KL coefficient, DeepSeek-GRM-27B tends to collapse on a few subsets in benchmarks, e.g., Chat in the Reward Bench benchmark and Harmlessness in the RMB benchmark, and shows biases towards some other domains. For smaller DeepSeek-GRM-16B, we use $\beta = 0 . 0 0 2$ because it is less vulnerable to the KL loss coefficient. We set G = 4 for a better trade-off between efficiency and performance.

其中 $\hat A_{i,t}=\frac{\hat r_i-\mathrm{mean}(\hat{\mathbf r})}{\mathrm{std}(\hat{\mathbf r})}$, $G$ 是组大小, $\beta$ 是 KL 惩罚系数, $q=(x,\{y_i\}_{i=1}^n)$ 带提示词. 我们在 $\beta\in\{0.00, 0.01, 0.02, 0.08\}$ 上做了网格搜索, 发现 $\beta=0.08$ 对 DeepSeek-GRM-27B 最稳定. KL 系数太小时, DeepSeek-GRM-27B 容易在基准的少数子集上崩溃, 例如 Reward Bench 的 Chat 和 RMB 的 Harmlessness, 并对其他一些领域表现出偏差. 较小的 DeepSeek-GRM-16B 对 KL 损失系数没那么敏感, 我们用 $\beta=0.002$. 为了在效率和效果之间取得更好的平衡, 我们设 $G=4$.

The training set comprises of 1256K RFT data, including 1070K general instruction data and 186K rejective sampled data, and 237K RL data. General instruction data are from in-house datasets. Rejective sampled data and RL data are from the same RM datasets, containing the preference for single, paired, and multiple responses, constructed from internal data

<!-- page 25 of 44 -->

Preprint. Under review.

and open-source datasets, including the training sets from MATH (Hendrycks et al., 2021), UltraFeedback (Cui et al., 2024), OffsetBias (Park et al., 2024), Skywork-Reward-Preference-80K-v0.2 (Liu et al., 2024), and HelpSteer2-Preference (Wang et al., 2025b). Specifically, we re-tagged the preference label of a part of UltraFeedback due to its quality issues; we sampled and filtered trajectories on MATH by rule-based ground-truth matching, resulting in pairwise preference data; for rating single responses, we set the ground-truth reward to 1 for correct responses and 0 for incorrect ones, only incorporating verifiable questions. For rejective sampling, we use DeepSeek-v2.5-0905 to generate the trajectories with principles and critiques. The sampling time N<sub>RFT</sub> is set to 3. During hinted sampling on HelpSteer2, we add the preference strengths labeled in the original dataset as the hint. We also remove the samples that are viewed too easy for DeepSeek-V2-Lite-Chat, i.e. all generated rewards are correct for three times according to Equation 10, from the RL data.

训练集包括 1256K 条 RFT 数据 (其中 1070K 条通用指令数据, 186K 条拒绝采样数据) 和 237K 条 RL 数据. 通用指令数据来自内部数据集. 拒绝采样数据和 RL 数据来自同一批 RM 数据集, 包含单个, 成对和多个回答的偏好, 由内部数据和开源数据集构建, 开源部分包括 MATH (Hendrycks et al., 2021), UltraFeedback (Cui et al., 2024), OffsetBias (Park et al., 2024), Skywork-Reward-Preference-80K-v0.2 (Liu et al., 2024) 和 HelpSteer2-Preference (Wang et al., 2025b) 的训练集. 具体来说, 由于质量问题, 我们重新标注了 UltraFeedback 一部分数据的偏好标签; 在 MATH 上, 我们采样轨迹并按规则与真值匹配做过滤, 得到成对偏好数据; 对单个回答的打分, 正确回答的真值奖励设为 1, 错误回答设为 0, 只纳入可验证问题. 拒绝采样用 DeepSeek-v2.5-0905 生成带原则和评语的轨迹. 采样次数 $N_{\mathrm{RFT}}$ 设为 3. 在 HelpSteer2 上做带提示采样时, 我们把原数据集标注的偏好强度作为提示加进去. 我们还从 RL 数据中去掉了对 DeepSeek-V2-Lite-Chat 来说过于简单的样本, 即按式 (10) 三次生成的奖励全部正确的样本.

The derivation of DeepSeek-GRM models and the meta RM is illustrated in Figure 5. All DeepSeek-GRM models are trained from the pretrained version of LLMs. For the training of the meta RM, we reuse the rejective sampled data from the RFT stage, and use DeepSeek-GRM-27B to perform rejective sampling with $N _ { \mathrm { R F T } } = \dot { 3 } ,$ , in order to avoid potential bias (Chow et al., 2025) in the meta RM guided voting. The learning rate is $1 \times 1 0 ^ { - 5 }$ and the batch size is 512 for the meta RM training. The training time of RFT and RL for DeepSeek-GRM-27B is depicted in Table 5, Gemma-2-27B based models are trained

| Stage | Time (h) |
| --- | --- |
| RFT | 19.2 |
| Rule-Based RL | 15.6 |

with 128 A100 GPUs on the Fire-Flyer platform (An et al., 2024). The learning rate is $5 \times 1 0 ^ { - 6 }$ for the RFT stage and $4 \times 1 0 ^ { - 7 }$ for the RL stage, and the batch size is 1024 for the RFT stage and 512 for the RL stage. Both stages are trained for 900 steps. Due to resource constraints, DeepSeek-GRM models larger than 27B does not undergo the rule-based RL and only trained with 50K rejective sampled data.

DeepSeek-GRM 模型和 meta RM 的派生关系见图 5. 所有 DeepSeek-GRM 模型都从 LLM 的预训练版本开始训练. 训练 meta RM 时, 我们复用 RFT 阶段的拒绝采样数据, 并用 DeepSeek-GRM-27B 以 $N_{\mathrm{RFT}}=3$ 做拒绝采样, 以避免 meta RM 引导投票中可能出现的偏差 (Chow et al., 2025). meta RM 训练的学习率为 $1\times10^{-5}$, batch size 为 512. DeepSeek-GRM-27B 的 RFT 和 RL 训练时间见表 5, 基于 Gemma-2-27B 的模型在 Fire-Flyer 平台 (An et al., 2024) 上用 128 张 A100 GPU 训练. RFT 阶段学习率为 $5\times10^{-6}$, RL 阶段为 $4\times10^{-7}$; RFT 阶段 batch size 为 1024, RL 阶段为 512. 两个阶段都训练 900 步. 受资源限制, 大于 27B 的 DeepSeek-GRM 模型没有经过基于规则的 RL, 只用 50K 条拒绝采样数据训练.

> **问:** RFT 和 RL 都训 900 步, 这与 1256K 条 RFT 数据和 237K 条 RL 数据对得上吗?
> 答: RFT 阶段 batch size 1024, 900 步共 $921.6$K 条, 少于 1256K, 不到一个 epoch (约 0.73). RL 阶段 batch size 512, 900 步若按 prompt 计是 $460.8$K, 约为 237K 的 1.94 倍, 即接近两个 epoch; 若 512 指 rollout 条数, 按 $G=4$ 每步只有 128 个 prompt, 900 步共 115.2K, 不到半个 epoch. 文中没有说明 batch size 的计数单位, 两种读法差 4 倍. 按表 5 的时间, RFT 每步约 $19.2\times3600/900=76.8$ 秒, RL 每步约 62.4 秒; RL 每步还包含 rollout 生成, 单步时间反而更短, 更符合「512 是 rollout 条数, 每步 128 个 prompt」的读法, 不过这只是从已知数字推出的说法, 没有数据验证.

## C.2 Baseline Implementation · 基线实现

For the baseline methods, we re-implement **LLM-as-a-Judge** (Zheng et al., 2023), **DeepSeek-BTRM-27B** (Kendall & Smith, 1940), **CLoud-Gemma-2-27B** (Ankner et al., 2024), and **DeepSeek-PairRM-27B** (Jiang et al., 2023) based on Gemma-2-27B (Team, 2024) and with all compatible training data and settings as DeepSeek-GRM.

基线方法方面, 我们基于 Gemma-2-27B (Team, 2024) 重新实现了 **LLM-as-a-Judge** (Zheng et al., 2023), **DeepSeek-BTRM-27B** (Kendall & Smith, 1940), **CLoud-Gemma-2-27B** (Ankner et al., 2024) 和 **DeepSeek-PairRM-27B** (Jiang et al., 2023), 所有能兼容的训练数据和设置都与 DeepSeek-GRM 一致.

For **LLM-as-a-Judge**, we use exactly the same training configuration as DeepSeek-GRM-27B, including RFT with rejective sampled data from DeepSeek-v2.5-0905 and rule-based online RL. Due to its scoring pattern, only pairwise data could be used in the RL stage. For **CLoud-Gemma-2-27B**, we also generate pointwise critiques from DeepSeek-v2.5-0905 using the same prompt template. However, it is not feasible to perform rejective sampling, since no rewards could be extracted without a trained value head. We fine-tune Gemma-2-27B with the same general instruction data of DeepSeek-GRM-27B along with the sampled critique, resulting in a critique generation model. Specifically, we fine-tune another Gemma-2-27B model with a value head for reward generation, instead of training value heads post hoc on the critique model. The training of the value head of CLoud-Gemma-2-27B, **DeepSeek-BTRM-27B**, and **DeepSeek-PairRM-27B** (Jiang et al., 2023) uses the same dataset from the RL stage of DeepSeek-GRM-27B, except for single response rating data.

**LLM-as-a-Judge** 采用与 DeepSeek-GRM-27B 完全相同的训练配置, 包括用 DeepSeek-v2.5-0905 拒绝采样数据做 RFT, 以及基于规则的在线 RL. 受打分模式所限, RL 阶段只能用成对数据. **CLoud-Gemma-2-27B** 同样用相同的提示模板从 DeepSeek-v2.5-0905 生成 pointwise 评语. 但它无法做拒绝采样, 因为没有训练好的价值头就抽取不出奖励. 我们用 DeepSeek-GRM-27B 的同一批通用指令数据加上采样得到的评语微调 Gemma-2-27B, 得到一个评语生成模型. 具体来说, 我们另外微调一个带价值头的 Gemma-2-27B 模型来生成奖励, 而不是在评语模型上事后训练价值头. CLoud-Gemma-2-27B 的价值头, **DeepSeek-BTRM-27B** 和 **DeepSeek-PairRM-27B** (Jiang et al., 2023) 的训练都用 DeepSeek-GRM-27B RL 阶段的同一份数据集, 但不含单个回答的打分数据.

## D Experiment Details · 实验细节

## D.1 Hyper-Parameters · 超参数

For inference-time scaling results of DeepSeek-GRM-27B, DeepSeek-GRM-16B, LLM-asa-Judge, and CLoud-Gemma-2-27B, the temperature is set to 0.5 for each model. And for other experiments, temperature is set to 0 for all models. Without specific description, $k _ { \mathrm { m e t a } } = { \textstyle { \frac { 1 } { 2 } } } k$ by default in the meta RM guided voting for DeepSeek-GRM-27B. For inference on DeepSeek-R1-0120, the temperature is set to 0.6. Please note that we let DeepSeek-GRM to

<!-- page 26 of 44 -->

Preprint. Under review.

![Image block](./images/p26-a-results-on-the-reward-bench-benchmark.jpg)

(a) Results on the Reward Bench benchmark.

![Image block](./images/p26-b-results-on-all-tested-reward-modeling-benchmarks.jpg)

(b) Results on all tested reward modeling benchmarks.

<table><tr><td>Model</td><td>Reward Bench</td><td>PPE Preference</td><td>PPE Correctness</td><td>RMB</td><td>Overall</td></tr><tr><td colspan="6">Reported Results of Public Models</td></tr><tr><td>Nemotron-4-340B-Reward</td><td>92.0</td><td>59.3</td><td>60.8</td><td>69.9</td><td>70.5</td></tr><tr><td>GPT-4o</td><td>86.7</td><td>67.1</td><td>57.6</td><td>73.8</td><td>71.3</td></tr><tr><td colspan="6">Results of Inference-Time Scaling (Voting@1)</td></tr><tr><td>LLM-as-a-Judge</td><td>83.0</td><td>63.4</td><td>57.4</td><td>64.3</td><td>67.0</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>82.0</td><td>67.0</td><td>62.0</td><td>63.2</td><td>68.5</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>84.0</td><td>62.2</td><td>59.4</td><td>65.8</td><td>67.8</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>85.2</td><td>62.4</td><td>59.5</td><td>64.4</td><td>67.9</td></tr><tr><td colspan="6">Results of Inference-Time Scaling (Voting@8)</td></tr><tr><td>LLM-as-a-Judge</td><td>83.4</td><td>63.8</td><td>58.2</td><td>65.2</td><td>67.6 (+0.6)</td></tr><tr><td>LLM-as-a-Judge w/ TokenProb</td><td>83.8</td><td>64.6</td><td>58.8</td><td>65.2</td><td>68.1 (+1.1)</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>82.4</td><td>67.3</td><td>62.4</td><td>63.2</td><td>68.8 (+0.3)</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>85.3</td><td>64.5</td><td>59.7</td><td>67.7</td><td>69.3 (+1.5)</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>87.7</td><td>64.9</td><td>60.3</td><td>69.5</td><td>70.6 (+2.7)</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>89.8</td><td>66.4</td><td>63.0</td><td>68.8</td><td>72.0 (+4.1)</td></tr><tr><td colspan="6">Results of Further Inference-Time Scaling (Voting@32)</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>88.5</td><td>65.3</td><td>60.4</td><td>69.7</td><td>71.0 (+3.1)</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>90.4</td><td>67.2</td><td>63.2</td><td>70.3</td><td>72.8 (+4.9)</td></tr></table>

output rewards in the same range for rating single responses in the ReaLMistake benchmark as other benchmarks.

DeepSeek-GRM-27B, DeepSeek-GRM-16B, LLM-as-a-Judge 和 CLoud-Gemma-2-27B 的 TestingTime 扩展结果, 每个模型的 temperature 都设为 0.5. 其他实验中, 所有模型的 temperature 都设为 0. 没有特别说明时, DeepSeek-GRM-27B 的 meta RM 引导投票默认取 $k_{\mathrm{meta}}=\frac12k$. DeepSeek-R1-0120 推理时 temperature 设为 0.6. 需要注意的是, 在 ReaLMistake 基准上给单个回答打分时, 我们让 DeepSeek-GRM 输出与其他基准相同范围的奖励.

## D.2 Benchmarks · 基准

We evaluate the performance of different methods on various RM benchmarks of different domains: (1) **Reward Bench** (Lambert et al., 2024), a common benchmark for RM evaluation, with semi-automatically collected chat (Li et al., 2023; Zheng et al., 2023; Zeng et al., 2024), reasoning (Lightman et al., 2024; Muennighoff et al., 2024), and safety (Röttger et al., 2024; Wang et al., 2024d) preference data, where two responses require to be ranked for each query; (2) **PPE** (Frick et al., 2025), a large-scale benchmark containing crowdsourced preference data and correctness data for verifiable tasks, and each query has two responses; (3) **RMB** (Zhou et al., 2025), a more comprehensive benchmark with various types of preference data, focusing on helpfulness and harmlessness, and each query has two responses or more response in pairwise and best-of-N (BoN) subsets, respectively; (4) **ReaLMistake** (Kamoi et al., 2024), a benchmark for diagnosing the error within single responses. Specifically, we

<!-- page 27 of 44 -->

Preprint. Under review.

<table><tr><td>Model</td><td>Reward Bench</td><td>PPE Preference</td><td>PPE Correctness</td><td>RMB</td><td>Overall</td></tr><tr><td colspan="6">Results of Greedy Decoding</td></tr><tr><td>DeepSeek-GRM-27B</td><td>86.0</td><td>64.7</td><td>59.8</td><td>69.0</td><td>69.9</td></tr><tr><td>w/o Principle Generation</td><td>82.0</td><td>62.8</td><td>58.2</td><td>67.1</td><td>67.5</td></tr><tr><td>w/o Rejective Sampling</td><td>84.0</td><td>63.2</td><td>59.4</td><td>68.0</td><td>68.7</td></tr><tr><td>DeepSeek-GRM-27B-RFT</td><td>84.5</td><td>64.1</td><td>59.6</td><td>67.0</td><td>68.8</td></tr><tr><td>w/o Hinted Sampling (1)</td><td>83.0</td><td>63.8</td><td>58.2</td><td>65.8</td><td>68.0</td></tr><tr><td>w/o Non-Hinted Sampling (2)</td><td>82.5</td><td>63.4</td><td>58.6</td><td>65.2</td><td>67.4</td></tr><tr><td>w/o Rejective Sampling (1&amp;2)</td><td>81.5</td><td>61.8</td><td>57.8</td><td>63.1</td><td>66.1</td></tr><tr><td>w/o General Instruction Data</td><td>79.1</td><td>59.2</td><td>51.5</td><td>63.2</td><td>63.3</td></tr><tr><td colspan="6">Results of Inference-Time Scaling (Voting@8)</td></tr><tr><td>DeepSeek-GRM-27B</td><td>87.7</td><td>64.9</td><td>60.3</td><td>69.5</td><td>70.6</td></tr><tr><td>w/o Principle Generation</td><td>83.0</td><td>63.2</td><td>58.6</td><td>67.1</td><td>68.0</td></tr><tr><td colspan="6">Results of Inference-Time Scaling (Voting@32)</td></tr><tr><td>DeepSeek-GRM-27B</td><td>88.5</td><td>65.3</td><td>60.4</td><td>69.7</td><td>71.0</td></tr><tr><td>DeepSeek-GRM-27B ( $k_{\text{meta}} = 1$ )</td><td>88.5</td><td>67.1</td><td>65.2</td><td>65.2</td><td>71.5</td></tr><tr><td>DeepSeek-GRM-27B ( $k_{\text{meta}} = 8$ )</td><td>89.7</td><td>67.2</td><td>64.7</td><td>69.1</td><td>72.7</td></tr><tr><td>DeepSeek-GRM-27B ( $k_{\text{meta}} = 16$ )</td><td>90.4</td><td>67.2</td><td>63.2</td><td>70.3</td><td>72.8</td></tr></table>

<table><tr><td>Method</td><td>Chat</td><td>Chat Hard</td><td>Safety</td><td>Reasoning</td><td>Prior Sets</td><td>Reward Bench</td></tr><tr><td colspan="7">Results of Other Models</td></tr><tr><td>DeepSeek-R1-0120</td><td>97.1</td><td>73.7</td><td>73.3</td><td>95.6</td><td>-</td><td>84.9</td></tr><tr><td>DeepSeek-GRM-16B</td><td>90.8</td><td>74.3</td><td>84.7</td><td>81.8</td><td>62.5</td><td>82.9</td></tr><tr><td>DeepSeek-GRM-230B</td><td>96.5</td><td>72.5</td><td>87.8</td><td>84.3</td><td>-</td><td>85.3</td></tr><tr><td>DeepSeek-GRM-671B</td><td>95.8</td><td>82.9</td><td>88.3</td><td>86.6</td><td>-</td><td>88.4</td></tr><tr><td colspan="7">Results of Greedy Decoding</td></tr><tr><td>LLM-as-a-Judge</td><td>96.7</td><td>69.3</td><td>83.5</td><td>84.3</td><td>-</td><td>83.4</td></tr><tr><td>DeepSeek-BTRM-27B</td><td>96.7</td><td>86.2</td><td>75.7</td><td>89.8</td><td>68.5</td><td>81.7</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>96.7</td><td>69.3</td><td>83.5</td><td>84.3</td><td>-</td><td>82.0</td></tr><tr><td>DeepSeek-PairRM-27B</td><td>95.5</td><td>86.8</td><td>52.3</td><td>92.0</td><td>67.6</td><td>87.1</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>94.7</td><td>77.2</td><td>87.0</td><td>79.2</td><td>65.9</td><td>84.5</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>94.1</td><td>78.3</td><td>88.0</td><td>83.8</td><td>66.7</td><td>86.0</td></tr><tr><td colspan="7">Results of Inference-Time Scaling (Voting@8)</td></tr><tr><td>LLM-as-a-Judge</td><td>95.0</td><td>70.0</td><td>83.5</td><td>85.0</td><td>-</td><td>83.4</td></tr><tr><td>LLM-as-a-Judge w/ TokenProb</td><td>95.8</td><td>71.3</td><td>83.3</td><td>84.8</td><td>-</td><td>83.8</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>96.7</td><td>85.8</td><td>56.2</td><td>91.0</td><td>-</td><td>82.4</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>94.7</td><td>79.0</td><td>87.3</td><td>80.2</td><td>-</td><td>85.3</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>95.3</td><td>80.9</td><td>89.3</td><td>85.4</td><td>66.8</td><td>87.7</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>95.5</td><td>85.7</td><td>88.5</td><td>89.5</td><td>69.4</td><td>89.8</td></tr><tr><td colspan="7">Results of Further Inference-Time Scaling (Voting@32)</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>95.5</td><td>81.8</td><td>90.0</td><td>86.9</td><td>68.1</td><td>88.5</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>95.3</td><td>85.7</td><td>89.5</td><td>91.0</td><td>69.4</td><td>90.4</td></tr></table>

do not include the prior sets (Bai et al., 2022a; Askell et al., 2021; Ethayarajh et al., 2022; Stiennon et al., 2020) of the Reward Bench benchmark in overall score calculations. For the reported results of public models, we use the scores released with each benchmark. Specifically, the version of gpt-4o is slightly different, as we reported results of gpt-4o-2024-08-06 for Reward Bench and PPE (the Correctness subset is reproduced with AlpacaEval prompt templates), and gpt-4o-2024-05-13 for RMB.

我们在不同领域的多个 RM 基准上评测各方法: (1) **Reward Bench** (Lambert et al., 2024), 常用的 RM 评测基准, 包含半自动收集的对话 (Li et al., 2023; Zheng et al., 2023; Zeng et al., 2024), 推理 (Lightman et al., 2024; Muennighoff et al., 2024) 和安全 (Röttger et al., 2024; Wang et al., 2024d) 偏好数据, 每个查询需要对两个回答排序; (2) **PPE** (Frick et al., 2025), 大规模基准, 包含众包偏好数据和可验证任务的正确性数据, 每个查询有两个回答; (3) **RMB** (Zhou et al., 2025), 更全面的基准, 包含各类偏好数据, 侧重有用性和无害性, pairwise 子集每个查询有两个回答, best-of-N (BoN) 子集有更多回答; (4) **ReaLMistake** (Kamoi et al., 2024), 诊断单个回答中错误的基准. 具体来说, 计算总分时我们不计入 Reward Bench 的 prior sets (Bai et al., 2022a; Askell et al., 2021; Ethayarajh et al., 2022; Stiennon et al., 2020). 公开模型的报告结果采用各基准随附发布的分数. 需要特别说明的是, gpt-4o 的版本略有不同: Reward Bench 和 PPE 报告的是 gpt-4o-2024-08-06 的结果 (Correctness 子集用 AlpacaEval 提示模板复现), RMB 报告的是 gpt-4o-2024-05-13.

> **看表:** 表 8 的 Reward Bench 总分是四个子集的平均, 逐行算下来都对得上吗?
> 答: 多数行对得上, 例如 DeepSeek-GRM-27B 是 $(94.1+78.3+88.0+83.8)/4=86.05$, 记 86.0; 671B 是 $(95.8+82.9+88.3+86.6)/4=88.4$. 有三行对不上. DeepSeek-BTRM-27B 的子集 96.7, 86.2, 75.7, 89.8 平均是 87.1, 表里写 81.7; DeepSeek-PairRM-27B 的子集 95.5, 86.8, 52.3, 92.0 平均是 81.65, 表里写 87.1. 两行的总分正好互换, 而表 2 的总分是 BTRM 81.7, PairRM 87.1, 所以更可能是表 8 里这两行的子集数互换了, 但仅凭表文无法判定哪一边错. CLoud-Gemma-2-27B 贪心一行的四个子集 96.7, 69.3, 83.5, 84.3 与 LLM-as-a-Judge 一行逐位相同, 平均 83.45, 却写总分 82.0; 它的 Voting@8 一行是 96.7, 85.8, 56.2, 91.0, 平均 82.4, 呈现高 Chat Hard, 低 Safety 的标量 RM 特征, 与贪心行完全不像. 贪心行的子集更像是从上一行复制过来的, 真实子集文中没有给出.

We use the standard evaluation metrics for each benchmark: accuracy of picking the best response from a set of responses in Reward Bench, PPE, and RMB, and ROC-AUC for ReaLMistake. The BoN subsets of the RMB benchmark contains multiple responses for each query, and each data point is correct only when the best response is identified. The default setting to evaluate models on RMB BoN subsets is to pairwise evaluate (n − 1) pairs, where each pair includes the best response and another different response, if there is totally n responses. For baseline methods, we adopt this approach for evaluation. And for our models (DeepSeek-GRM), we directly input all responses to the model and identify

<!-- page 28 of 44 -->

Preprint. Under review.

<table><tr><td>Method</td><td>MMLU-Pro</td><td>MATH</td><td>GPQA</td><td>MBPP-Plus</td><td>IFEval</td><td>PPE Correctness</td></tr><tr><td colspan="7">Results of Greedy Decoding</td></tr><tr><td>LLM-as-a-Judge</td><td>66.0</td><td>68.0</td><td>52.8</td><td>50.2</td><td>56.8</td><td>58.8</td></tr><tr><td>DeepSeek-BTRM-27B</td><td>68.8</td><td>73.2</td><td>56.8</td><td>68.8</td><td>66.0</td><td>66.7</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>68.7</td><td>68.8</td><td>53.5</td><td>59.0</td><td>62.0</td><td>62.4</td></tr><tr><td>DeepSeek-PairRM-27B</td><td>68.3</td><td>74.7</td><td>55.0</td><td>63.1</td><td>62.9</td><td>64.8</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>64.8</td><td>68.7</td><td>55.5</td><td>49.0</td><td>60.2</td><td>59.6</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>64.8</td><td>68.8</td><td>55.6</td><td>50.1</td><td>59.8</td><td>59.8</td></tr><tr><td>w/ Reference</td><td>98.2</td><td>97.5</td><td>99.8</td><td>86.6</td><td>75.9</td><td>91.6</td></tr><tr><td colspan="7">Results of Inference-Time Scaling (Voting@8)</td></tr><tr><td>LLM-as-a-Judge</td><td>66.2</td><td>66.4</td><td>51.9</td><td>49.9</td><td>56.8</td><td>58.2</td></tr><tr><td>LLM-as-a-Judge w/ TokenProb</td><td>66.4</td><td>68.1</td><td>53.0</td><td>49.5</td><td>57.0</td><td>58.8</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>68.7</td><td>68.9</td><td>53.5</td><td>59.0</td><td>62.0</td><td>62.4</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>64.8</td><td>68.7</td><td>55.5</td><td>49.5</td><td>60.2</td><td>59.7</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>65.7</td><td>68.7</td><td>55.5</td><td>50.0</td><td>61.6</td><td>60.3</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>68.0</td><td>68.7</td><td>57.3</td><td>51.3</td><td>69.9</td><td>63.0</td></tr><tr><td colspan="7">Results of Further Inference-Time Scaling (Voting@32)</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>65.5</td><td>69.4</td><td>56.0</td><td>49.9</td><td>61.0</td><td>60.4</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>68.1</td><td>70.0</td><td>56.9</td><td>50.8</td><td>70.4</td><td>63.2</td></tr></table>

<table><tr><td>Method</td><td>Helpfulness BoN</td><td>Helpfulness Pairwise</td><td>Harmlessness BoN</td><td>Harmlessness Pairwise</td><td>RMB</td></tr><tr><td colspan="6">Results of Greedy Decoding</td></tr><tr><td>LLM-as-a-Judge</td><td>55.8</td><td>78.5</td><td>50.8</td><td>73.9</td><td>64.8</td></tr><tr><td>DeepSeek-BTRM-27B</td><td>64.0</td><td>83.0</td><td>33.6</td><td>51.0</td><td>57.9</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>64.7</td><td>81.1</td><td>41.7</td><td>66.1</td><td>63.4</td></tr><tr><td>DeepSeek-PairRM-27B</td><td>59.9</td><td>83.3</td><td>34.1</td><td>55.5</td><td>58.2</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>58.4</td><td>79.3</td><td>54.2</td><td>76.0</td><td>67.0</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>62.3</td><td>80.5</td><td>57.0</td><td>76.1</td><td>69.0</td></tr><tr><td colspan="6">Results of Inference-Time Scaling (Voting@8)</td></tr><tr><td>LLM-as-a-Judge</td><td>56.0</td><td>78.5</td><td>52.5</td><td>73.8</td><td>65.2</td></tr><tr><td>LLM-as-a-Judge w/ TokenProb</td><td>56.0</td><td>78.5</td><td>52.5</td><td>73.8</td><td>65.2</td></tr><tr><td>CLoud-Gemma-2-27B</td><td>63.8</td><td>82.1</td><td>40.9</td><td>66.1</td><td>63.2</td></tr><tr><td>DeepSeek-GRM-27B-RFT (Ours)</td><td>59.2</td><td>80.1</td><td>54.8</td><td>76.5</td><td>67.7</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>63.9</td><td>79.5</td><td>57.6</td><td>77.1</td><td>69.5</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>63.4</td><td>80.5</td><td>56.8</td><td>74.6</td><td>68.8</td></tr><tr><td colspan="6">Results of Further Inference-Time Scaling (Voting@32)</td></tr><tr><td>DeepSeek-GRM-27B (Ours)</td><td>63.9</td><td>79.8</td><td>58.0</td><td>77.0</td><td>69.7</td></tr><tr><td>DeepSeek-GRM-27B (MetaRM) (Ours)</td><td>64.2</td><td>81.6</td><td>58.0</td><td>77.4</td><td>70.3</td></tr></table>

the best response with arg max $S _ { i i = 1 } ^ { \; n } ,$ where $S _ { i }$ is the predicted reward for i-th response, which is a more direct but harder way, and barely affects the performance. Please refer to Appendix E.1.1 for empirical analysis.

每个基准用其标准指标: Reward Bench, PPE 和 RMB 用从一组回答中选出最佳回答的准确率, ReaLMistake 用 ROC-AUC. RMB 的 BoN 子集每个查询有多个回答, 只有选对最佳回答, 这条数据才算正确. 在 RMB BoN 子集上评测模型的默认做法, 是在总共 $n$ 个回答时成对评估 $(n-1)$ 对, 每对由最佳回答和另一个回答组成. 基线方法采用这种做法. 而我们的模型 (DeepSeek-GRM) 直接输入所有回答, 用 $\arg\max\,S_i$ ($i=1,\dots,n$) 确定最佳回答, 其中 $S_i$ 是第 $i$ 个回答的预测奖励. 这种做法更直接, 也更难, 但几乎不影响表现. 实证分析见附录 E.1.1.

For DeepSeek-R1-0120, due to the large costs and latency of inference, we evenly downsampled 300 data points from the Reward Bench benchmark, and test DeepSeek-R1-0120 on this subset. The result is illustrated in Figure 4(b).

由于 DeepSeek-R1-0120 推理成本和时延都很大, 我们从 Reward Bench 中均匀降采样出 300 个数据点, 在这个子集上测试 DeepSeek-R1-0120. 结果见图 4(b).

## D.3 Detailed Results · 详细结果

We provide detailed results of Figure 1 in Figure 6, with performance of more public models for reference. We provide detailed results of Table 3 in Table $^ { 6 , }$ and detailed results of Table 4 in Table 7, with scores on each RM benchmark. Furthermore, we list detailed results for all tested methods on each RM benchmarks, with the Reward Bench benchmark in Table 8, the PPE Correctness benchmark in Table 9, and the RMB benchmark in Table 10. We found that DeepSeek-R1 achieves the highest result in the Reasoning subset of the Reward Bench benchmark, indicating that long-horizon reasoning could boost GRMs in reasoning extensive scenarios.

图 1 的详细结果见图 6, 并加入了更多公开模型作参考. 表 3 的详细结果见表 6, 表 4 的详细结果见表 7, 都给出了每个 RM 基准上的分数. 此外, 我们列出所有被测方法在各 RM 基准上的详细结果: Reward Bench 见表 8, PPE Correctness 见表 9, RMB 见表 10. 我们发现 DeepSeek-R1 在 Reward Bench 的 Reasoning 子集上取得最高分, 说明在推理密集的场景下, 长程推理可以提升 GRM.

> **停一下:** 表 7 里 $k_{\mathrm{meta}}=1$ 的总分 71.5 比纯投票 71.0 高, 分项上发生了什么?
> 答: 分项变化方向相反. 和 Voting@32 相比, $k_{\mathrm{meta}}=1$ 把 PPE Correctness 从 60.4 抬到 65.2, PPE Preference 从 65.3 抬到 67.1, 却把 RMB 从 69.7 拉到 65.2, RB 持平 88.5. 只留元奖励最高的一条, 结果就由 meta RM 一个标量 RM 的偏好决定, 分项形状向第 5.2 节说的标量 RM 靠拢: 可验证任务变好, RMB 变差 (表 2 中 BTRM 的 RMB 只有 57.9). $k_{\mathrm{meta}}=8$ 和 16 时 RMB 回到 69.1 和 70.3, PPE Correctness 回落到 64.7 和 63.2. 所以第 5.2 节说 meta RM 引导的投票「对不同 $k_{\mathrm{meta}}$ 表现稳健」, 只在总分上成立; 分项上 $k_{\mathrm{meta}}$ 越小, 越接近一个标量 RM.

<!-- page 29 of 44 -->

Preprint. Under review.

| Method | Helpfulness | Harmlessness |
| --- | --- | --- |
| DeepSeek-GRM-27B |  |  |
| w/ Pair Input | 62.1 | 57.5 |
| w/ List Input | 62.3 | 57.0 |
| \|∆\| | 0.2 | 0.5 |

| Method | Overall |
| --- | --- |
| DeepSeek-GRM-27B | 59.8 |
| w/ Voting@32 | 60.4 |
| w/ Meta RM (k<sub>meta</sub> = 8) | 64.7 |
| w/ Reference | 91.6 |

| Model | Overall |
| --- | --- |
| DeepSeek-V2.5-0905 | 69.4 |
| GPT-4o-2024-08-06 | 74.3 |
| DeepSeek-V2-Lite-Chat | 61.9 |
| DeepSeek-GRM-16B (Ours) | 64.9 |
| Gemma-2-27B-it | 65.8 |
| DeepSeek-BTRM-27B | 69.3 |
| DeepSeek-GRM-27B (Ours) | 72.2 |
| DeepSeek-GRM-27B (Voting@8) (Ours) | 74.4 |

## E Additional Experiments · 补充实验

## E.1 Input Flexibility of the Pointwise GRM Approach · pointwise GRM 的输入灵活性

In Section 2.1, we demonstrate the input flexibility of the pointwise GRM approach theoretically. In this section, we provide empirical evidence on various input types to support it.

第 2.1 节从理论上说明了 pointwise GRM 方法的输入灵活性. 本节在多种输入类型上给出实证证据.

## E.1.1 Generating Rewards for Many Responses · 为多个回答生成奖励

In Table 11, we show the experimental results of DeepSeek-GRM-27B on the BoN subsets of the RMB benchmark, where each query has multiple responses. If there is at total n, (n > 2) responses for a query, the pair input setting is to evaluate (n − 1) pairs comprise of the best response and the other responses, and only when the best response is correctly identified from all (n − 1) pairs, the data point is considered as correct. It is also the default setting for the original benchmark. We compare the performance of DeepSeek-GRM-27B with pair input and list input, where the list input setting is to identify the best response with inputting all n responses. The result shows that DeepSeek-GRM-27B is barely affected by the input types, and the performance difference is less than 1% on both helpfulness and harmlessness subsets. This indicates that **the pointwise GRM is flexible to input many responses, and the performance is not sensitive to the input types**.

表 11 给出 DeepSeek-GRM-27B 在 RMB 基准 BoN 子集上的实验结果, 这些子集每个查询有多个回答. 若一个查询共有 $n$ ($n>2$) 个回答, pair input 设置是评估由最佳回答和其他回答组成的 $(n-1)$ 对, 只有在所有 $(n-1)$ 对中都正确识别出最佳回答, 这条数据才算正确. 这也是原基准的默认设置. 我们比较了 DeepSeek-GRM-27B 在 pair input 和 list input 下的表现, list input 设置是一次输入全部 $n$ 个回答来识别最佳回答. 结果显示, DeepSeek-GRM-27B 几乎不受输入类型影响, 在有用性和无害性子集上的差距都小于 1%. 这说明 **pointwise GRM 能灵活地输入多个回答, 表现对输入类型不敏感**.

## E.1.2 Generating Rewards for Single Responses · 为单个回答生成奖励

In Table 13, we show the experimental results of DeepSeek-GRM in 16B and 27B on the ReaLMistake benchmark, where each query has only one response. We compare with public models, e.g., DeepSeek-V2.5-0905, GPT-4o-2024-08-06, DeepSeek-V2-Lite, and Gemma-2-27B-it, and DeepSeek-BTRM-27B. The result shows that DeepSeek-GRM achieves the best performance among models with the same size, and comparable performance with the best public models with inference-time scaling. This indicates that **the pointwise GRM could effectively rate single responses**.

表 13 给出 16B 和 27B 的 DeepSeek-GRM 在 ReaLMistake 基准上的实验结果, 这个基准每个查询只有一个回答. 我们与 DeepSeek-V2.5-0905, GPT-4o-2024-08-06, DeepSeek-V2-Lite, Gemma-2-27B-it 等公开模型以及 DeepSeek-BTRM-27B 作比较. 结果显示, DeepSeek-GRM 在同规模模型中表现最好, 加上 TestingTime 扩展后与最好的公开模型相当. 这说明 **pointwise GRM 能有效地给单个回答打分**.

## E.1.3 Generating Rewards with Reference · 带参考答案生成奖励

In Section 5.2, we show that scalar and semi-scalar RMs could have significant domain biases, and generally perform better on verifiable questions. To alleviate this issue, we test DeepSeek-GRM-27B to generate rewards for these tasks with reference, where the reference is the ground truth for each query. The results are shown in Table 12. We find that DeepSeek-GRM-27B could achieve a more than 90% accuracy with reference provided. This indicates that **the pointwise GRM could effectively judge responses with reference, mitigating performance on verifiable tasks**.

第 5.2 节表明, 标量和半标量 RM 可能有明显的领域偏差, 通常在可验证问题上表现更好. 为了缓解这一问题, 我们测试 DeepSeek-GRM-27B 在这些任务上带参考生成奖励, 参考即每个查询的真值. 结果见表 12. 我们发现, 提供参考后 DeepSeek-GRM-27B 的准确率能超过 90%. 这说明 **pointwise GRM 能有效地借助参考判断回答, 改善在可验证任务上的表现**.

<!-- page 30 of 44 -->

Preprint. Under review.

## E.2 Transferability of Generated Principles · 生成原则的可迁移性

We extend the preliminary experiment in Section 2.2 with DeepSeek-GRM-27B generated principles. We test GPT-4o-2024-08-06 and DeepSeek-GRM-27B with the filtered principles exactly the same as Table 1, and aforementioned DeepSeek-GRM-27B generated ones. The results are shown in Table 14. We find that the principles generated by DeepSeek-GRM-27B could be transferred to other models, and are even sightly better than manually filtered principles from GPT-

| Method | Chat Hard | IFEval |
| --- | --- | --- |
| GPT-4o-2024-08-06 | 76.1 | 56.0 |
| +Self-Gen. Principles | 75.9 | 55.6 |
| +Filtered Principles | 77.8 | 57.5 |
| +DGRM-27B-Gen. Principles | 78.1 | 58.3 |
| DeepSeek-GRM-27B | 78.3 | 59.8 |
| +Filtered Principles | 77.0 | 58.5 |

4o. This indicates that **the principles generated by DeepSeek-GRM-27B are robust and transferable to other models**.

我们用 DeepSeek-GRM-27B 生成的原则扩展第 2.2 节的初步实验. 我们用与表 1 完全相同的筛选后原则, 以及上面提到的 DeepSeek-GRM-27B 生成的原则, 测试 GPT-4o-2024-08-06 和 DeepSeek-GRM-27B. 结果见表 14. 我们发现, DeepSeek-GRM-27B 生成的原则可以迁移到其他模型, 甚至略好于从 GPT-4o 的结果中人工筛选出的原则. 这说明 **DeepSeek-GRM-27B 生成的原则稳健, 可以迁移到其他模型**.

## E.3 Generalization beyond Training Data · 训练数据之外的泛化

<table><tr><td>Model</td><td>Chat</td><td>Chat Hard</td><td>Safety</td><td>Reasoning</td><td>Reward Bench</td></tr><tr><td colspan="6">Results of Greedy Decoding</td></tr><tr><td>DeepSeek-GRM-27B</td><td>94.1</td><td>78.3</td><td>88.0</td><td>83.8</td><td>86.0</td></tr><tr><td>w/o MATH RM Data</td><td>96.1</td><td>70.4</td><td>85.3</td><td>82.5</td><td>83.0</td></tr><tr><td>DeepSeek-GRM-16B</td><td>90.8</td><td>74.3</td><td>84.7</td><td>81.8</td><td>82.9</td></tr><tr><td>w/o MATH RM Data</td><td>95.0</td><td>63.4</td><td>76.9</td><td>74.3</td><td>77.4</td></tr></table>

We conduct ablation study on the generalization of training data for DeepSeek-GRM-27B. We remove the all data from MATH training set, and re-implement the training recipe. Results on the Reward Bench benchmark are shown in Table 15. We found that merely adding math related preference data could also boost generalist RM performance on various domains, especially on the Chat Hard subset. The result reveals that DeepSeek-GRM-27B could generalize to domains beyond the coverage of training data.

我们对 DeepSeek-GRM-27B 训练数据的泛化做了消融. 我们去掉来自 MATH 训练集的全部数据, 重新执行训练流程. Reward Bench 上的结果见表 15. 我们发现, 仅仅加入数学相关的偏好数据, 也能提升通用 RM 在多个领域的表现, 在 Chat Hard 子集上尤其明显. 这一结果说明 DeepSeek-GRM-27B 可以泛化到训练数据覆盖范围之外的领域.

## E.4 Response Length Analysis for Rule-Based RL · 规则 RL 前后的回答长度分析

![Image block](./images/p30-figure-7-the-changes-of-response-lengths-tokens-of.jpg)

Figure 7: The changes of response lengths (#tokens) of DeepSeek-GRM-27B before and after rule-based online RL on the Reward Bench benchmark, compared with DeepSeek-R1-0120.

We calculate the response lengths of DeepSeek-GRM-27B before and after rule-based online RL on each subset of the Reward Bench benchmark in Figure 7. The token count of DeepSeek-GRM-27B is calculated based on the tokenizer of Gemma-2-27B, while the result of DeepSeek-R1-0120 uses its corresponding tokenizer. We found that the response length for the Chat subset barely increases in RL, and the response length for the Safety subset even drops slightly. The largest increase of response lengths occurs in the Reasoning subset, where

<!-- page 31 of 44 -->

Preprint. Under review.

the performance of DeepSeek-GRM-27B also improves greatly compared to DeepSeek-GRM-27B-RFT, according to Table 8. This might indicate that DeepSeek-GRM-27B learns to adaptively use more inference compute on reasoning extensive tasks, and the compute could be saved for some other domains, such as safety, after the model learns to generate principles accurately. However, DeepSeek-R1-0120 uses way more tokens and achieves lower results, except for Reasoning, which shows that long-horizon reasoning also helps RM tasks regarding to extensive reasoning.

我们在图 7 中统计了 DeepSeek-GRM-27B 在规则在线 RL 前后, 在 Reward Bench 各子集上的回答长度. DeepSeek-GRM-27B 的 token 数按 Gemma-2-27B 的 tokenizer 计算, DeepSeek-R1-0120 的结果用它自己的 tokenizer. 我们发现, Chat 子集的回答长度在 RL 中几乎没有增加, Safety 子集甚至略有下降. 回答长度增加最多的是 Reasoning 子集, 按表 8, DeepSeek-GRM-27B 在这个子集上相比 DeepSeek-GRM-27B-RFT 的表现也提升最多. 这可能说明, 学会准确生成原则后, DeepSeek-GRM-27B 学会了在推理密集的任务上自适应地多用推理算力, 而在安全等其他领域省下算力. 不过, DeepSeek-R1-0120 用的 token 多得多, 除 Reasoning 外结果却更低, 说明长程推理对涉及大量推理的 RM 任务同样有帮助.

## F Qualitative Analysis · 定性分析

## F.1 Case Study · 案例研究

We provide a case study on DeepSeek-GRM-27B in Table 16, 17 and 18. The first case shows that DeepSeek-BTRM-27B as a scalar RM could be hacked or biased under specific circumstances, and DeepSeek-GRM-27B generates textual principles and critiques, showing better robustness. The second case shows the scalable behaviors of DeepSeek-GRM-27B, generating accurate rewards after voting on multiple samples. The according meta RM scores also show the effectiveness of the meta RM in guiding the voting process. The third case shows the potential failure of DeepSeek-GRM-27B which is caused by the inability of the model to accurately judge responses following some principles, e.g., assessing real-time data, and the weights of each principle might not be balanced. The critique processes including weight attribution and score collection are largely emerged from RFT and online RL training, which can largely vary among different samplings and test cases.

表 16, 17 和 18 给出了 DeepSeek-GRM-27B 的案例研究. 第一个案例表明, 作为标量 RM 的 DeepSeek-BTRM-27B 在特定情况下可能被 hack 或出现偏差, 而 DeepSeek-GRM-27B 生成文本形式的原则和评语, 表现出更好的稳健性. 第二个案例展示了 DeepSeek-GRM-27B 的可扩展行为: 对多个样本投票后生成了准确的奖励. 对应的 meta RM 分数也说明了 meta RM 在引导投票过程中的作用. 第三个案例展示了 DeepSeek-GRM-27B 的一种潜在失败, 原因是模型无法按某些原则准确判断回答, 例如评估实时数据, 而且各条原则的权重可能不均衡. 包括权重分配和分数汇总在内的评语过程, 主要是从 RFT 和在线 RL 训练中涌现出来的, 在不同采样和测试用例之间可能差异很大.

以下表 16 至表 18 中的查询, 回答和模型输出是引用样本, 保留原文.

> **确认:** 表 17 的三次结果分数是 (8, 8), (9, 5), (10, 7), 最终投票却是「Response 1: 20; Response 2: 27」, 这个和是怎么来的?
> 答: arXiv 版表 17 的题注写明, 生成结果 2 和结果 3 时回答的输入顺序是反过来的. 从评语内容也能看出来: 结果 1 说 Response 1 错在多加了 `1 + i + (i + 1) / 2`, 这是原 Response 1 的代码; 结果 2 和结果 3 却说 Response 2 多加了这一项, 指的仍是原 Response 1. 按原始顺序还原: 原 Response 1 得 $8+5+7=20$, 原 Response 2 得 $8+9+10=27$, 与表中一致, 也与真值「Response 2 更好」一致. 题目递推式里奇数项要用 $\mathrm{tri}(n+1)=1+(n+1)/2$, 所以正确写法是 `p[i - 2] + p[i - 1] + 1 + (i + 1) / 2`, 即原 Response 2. 结果 1 打成 8 比 8 的平局, meta RM 给出 $-15.78$, 远低于结果 2 和 3 的 1.31 和 1.67; 按 $k_{\mathrm{meta}}=\frac12k$ 的默认设置, 三条里保留哪几条文中没有给出, 但只要去掉结果 1, 结论不变.

| Query | Please help me review for my behavioral neuroscience exam by giving me the core information that is essential to this course. Please give an expansive review and include explanations in analogy or metaphors |
| --- | --- |

<!-- page 32 of 44 -->

Preprint. Under review.

| Response 1 | Behavioral neuroscience, also known as biological psychology, explores the relationship between the brain and behavior. It examines how the nervous system influences cognitive processes, emotions, and motor functions. Here's a comprehensive review with analogies and metaphors:\\n1. **Neuroanatomy**: Imagine the brain as a complex city with different neighborhoods (lobes) and roads (neuronal pathways). The cerebral cortex is the outer layer, like the skin of the city, responsible for higher functions like thinking and perception. The cerebellum is like a choreographer, ensuring smooth and coordinated movements. The brainstem acts as the city's backbone, connecting the brain with the spinal cord, and controlling basic life functions.2. **Neurons**: These are the building blocks of the nervous system. Think of them as the city's messengers, transmitting information via electrical and chemical signals. The dendrites receive messages, the cell body processes them, and the axon sends the signal to other neurons at the synapse.3. **Synapses and neurotransmitters**: The synapse is like a tiny bridge between neurons. Neurotransmitters are the messengers that cross this bridge, transmitting signals from one neuron to another. Analogous to different languages, there are various neurotransmitters (e.g., dopamine, serotonin, glutamate) that influence distinct aspects of behavior and mood.4. **Sensory Systems**: These are the city's surveillance cameras, detecting external stimuli. For example, the visual system (retina) captures light, and the auditory system (cochlea) picks up sound waves. These systems transmit information to the brain for processing.5. **Motor Systems**: The motor systems act like the city's transportation network, sending signals from the brain to muscles, enabling movement. The somatic motor system controls voluntary movements, while the autonomic nervous system is like an unseen hand managing involuntary functions like heart rate and digestion.6. ** Plasticity**: Brain plasticity is like the city's ability to adapt and change over time. It refers to the brain's capacity to reorganize itself by forming new neural connections in response to experiences, learning, or injury.7. **Memory**: Memory can be thought of as a vast library where information is stored and retrieved. There are three main types: sensory memory (like a quick glance at a book), short-term memory (reading a paragraph), and long-term memory (remembering the entire book).8. **Learning**: Learning is the process of acquiring new knowledge, skills, or behaviors. It's like adding new books to the library or updating old information. There are different types, such as classical conditioning (learning through association, like Pavlov's dogs) and operant conditioning (learning through consequences, like reinforcements and punishments).9. **Emotions and Motivation**: Emotions are like the city's weather, influencing how we perceive and respond to events. Different brain regions, like the amygdala (the emotional storm center), contribute to emotional experiences. Motivation can be seen as the city's energy, driving us to act in pursuit of goals, with systems like the mesolimbic dopamine pathway playing a key role.10. **Hormones and the Endocrine System**: These are the city's internal postal service, sending chemical messages throughout the body. Hormones, like cortisol and oxytocin, can influence behavior and mood by interacting with the brain and nervous system.\\nUnderstanding these core concepts will help you navigate the complex world of behavioral neuroscience and prepare for your exam. Remember that this field is constantly evolving, so stay curious and engaged with the latest research. |
| --- | --- |

<!-- page 33 of 44 -->

Preprint. Under review.

| Response 2 | Certainly! Behavioral neuroscience is a fascinating field that explores the intricate relationship between the brain and behavior. It's like unraveling the mysteries of a complex machine, where the brain is the central processing unit, and behavior is the output. Let's dive into the core concepts that form the foundation of this course.\\n1. Neuroanatomy: Understanding the Brain's Architecture\\n The brain is a remarkable structure, and understanding its anatomy is crucial. Think of it as a vast city, with different regions serving as specialized districts. The cerebral cortex is the bustling metropolis, where higher cognitive functions like decision-making and problem-solving take place. The limbic system, on the other hand, is the emotional heart, regulating feelings and memories. And deep within, the brainstem acts as the city's control center, managing essential functions like breathing and heartbeat.\\n2. Neurophysiology: The Language of the Brain\\n Just as a city communicates through intricate networks of roads and signals, the brain uses electrical and chemical signals to transmit information. Neurons, the brain's messengers, fire action potentials like lightning bolts, carrying vital information. Neurotransmitters, on the other hand, are the chemical couriers, facilitating communication between neurons at synapses, akin to the handoff of a letter from one postal worker to another.\\n3. Sensory and Motor Systems: The Brain's Gateways\\n The brain is not an isolated entity; it constantly interacts with the external world. The sensory systems act as the brain's eyes, ears, and touch receptors, gathering information from the environment. Imagine them as surveillance cameras and sensors, feeding data into the brain's processing centers. Conversely, the motor systems are the brain's actuators, executing commands and translating neural signals into physical movements, like a robotic arm carrying out instructions.\\n4. Learning and Memory: The Brain's Database\\n Just like a computer stores and retrieves data, the brain has its own mechanisms for learning and memory. Long-term potentiation (LTP) is like upgrading the bandwidth between neurons, strengthening connections and facilitating information storage. Consolidation is akin to backing up data, transferring memories from short-term to long-term storage. And retrieval is like accessing a file, recalling stored information when needed.\\n5. Motivation and Emotion: The Brain's Driving Forces\\n Behavior is not just a product of cognitive processes; it's also influenced by motivation and emotion. The reward system, centered around structures like the nucleus accumbens, acts as the brain's carrot-and-stick, reinforcing desirable behaviors with pleasurable sensations. The amygdala, on the other hand, is the brain's security guard, processing emotional cues and triggering appropriate responses, like the fight-or-flight reflex.\\n6. Neuroplasticity: The Brain's Adaptability\\n The brain is not a static entity; it's a dynamic and ever-changing landscape. Neuroplasticity is the brain's ability to reorganize and rewire itself in response to experience and environmental changes. It's like a city constantly undergoing renovations, adapting to new demands and challenges. This plasticity allows the brain to recover from injuries, acquire new skills, and adapt to changing circumstances.\\n7. Neurological Disorders: When the Brain Malfunctions\\n Just as a city can experience breakdowns and malfunctions, the brain is susceptible to various disorders and dysfunctions. Neurodegenerative diseases like Alzheimer's and Parkinson's are akin to the gradual deterioration of a city's infrastructure, leading to cognitive and motor impairments. Psychiatric disorders, such as depression and anxiety, can be viewed as imbalances in the brain's chemical signaling system, disrupting emotional regulation and behavior.\\nBy understanding these core concepts and embracing the analogies and metaphors, you'll gain a deeper appreciation for the intricate workings of the brain and its profound influence on behavior. Remember, the brain is a complex and fascinating realm, and behavioral neuroscience is the key to unlocking its secrets. |
| --- | --- |

<!-- page 34 of 44 -->

Preprint. Under review.

| DeepSeek-BTRM-27B Result | Response 1: 0.4665; Response 2: 0.3209. |
| --- | --- |
| DeepSeek-GRM- | Specific Criteria: |
| 27B | 1. **Depth of Analogies and Metaphors** (Weight: 30%): The extent |
| Result | to which the analogies and metaphors used are deep, creative, and effectively convey complex concepts. 2. **Comprehensiveness of Core Information** (Weight: 30%): The thoroughness with which the core information essential to behavioral neuroscience is covered. 3. **Clarity and Organization** (Weight: 20%): The clarity of explanations and the logical organization of the information. 4. **Engagement and Appeal** (Weight: 20%): The level of engagement and appeal the response has, making the information interesting and memorable. Analysis: - **Response 1**: This response excels in comprehensiveness and clarity, covering all major aspects of behavioral neuroscience with detailed and well-organized explanations. The analogies and metaphors are well-crafted and effectively enhance understanding. However, some metaphors could be more creative to enhance engagement further. - **Response 2**: This response is also comprehensive and clear, but it stands out more in the depth and creativity of its analogies and metaphors. The organization is logical, and the explanations are clear. The engagement level is high, making the information appealing and memorable. Scores: \\boxed{8, 9} |
| Ground Truth | Response 2 is better than Response 1. |

```txt
Query
Write a JavaScript function 'const tri = (n)' to solve the following problem:
Everyone knows Fibonacci sequence, it was studied deeply by mathematicians in
the last couple centuries. However, what people don't know is Tribonacci sequence.
Tribonacci sequence is defined by the recurrence:
tri(1) = 3
tri(n) = 1 + n / 2, if n is even.
tri(n) = tri(n - 1) + tri(n - 2) + tri(n + 1), if n is odd.
For example:
tri(2) = 1 + (2 / 2) = 2
tri(4) = 3
tri(3) = tri(2) + tri(1) + tri(4)
= 2 + 3 + 3 = 8
You are given a non-negative integer number n, you have to a return a list of the
first n + 1 numbers of the Tribonacci sequence.
Examples:
tri(3) = [1, 3, 2, 8]
```

<!-- page 35 of 44 -->

Preprint. Under review.

```txt
Response 1 | if (n == 0) { return [1] }
    if (n == 1) { return [1, 3] }
    let p = [1, 3]
    for (let i = 2; i <= n; i++) {
        if (i % 2 == 0) {
            p.push(1 + i / 2)
        }
        else {
            p.push(p[i - 2] + p[i - 1] + 1 + i + (i + 1) / 2)
        }
    }
    return p
}
Response 2 | if (n == 0) { return [1] }
    if (n == 1) { return [1, 3] }
    let p = [1, 3]
    for (let i = 2; i <= n; i++) {
        if (i % 2 == 0) {
            p.push(1 + i / 2)
        }
        else {
            p.push(p[i - 2] + p[i - 1] + 1 + (i + 1) / 2)
        }
    }
    return p
}
```

<!-- page 36 of 44 -->

Preprint. Under review.

```txt
DeepSeek-GRM-27B Result 1
### Output
**Specific Criteria:**
1. **Correctness of Sequence Calculation (Weight: 40%)**: The response must correctly implement the Tribonacci sequence as defined, including handling both even and odd cases accurately.
2. **Initialization and Base Cases (Weight: 20%)**: The response should correctly initialize the sequence and handle base cases (n = 0 and n = 1) appropriately.
3. **Loop and Conditional Logic (Weight: 20%)**: The response should use appropriate loop and conditional logic to generate the sequence.
4. **Output Format (Weight: 20%)**: The response should return the sequence in the correct format as specified.
**Analysis:**
- **Response 1**: 
- **Correctness of Sequence Calculation**: The logic for even and odd cases is mostly correct, but there is a mistake in the calculation for odd numbers where it incorrectly adds '1 + i + (i + 1) / 2'.
- **Initialization and Base Cases**: Correctly initializes and handles base cases.
- **Loop and Conditional Logic**: Uses appropriate loop and conditional logic.
- **Output Format**: Returns the sequence in the correct format.
- **Response 2**: 
- **Correctness of Sequence Calculation**: Similar to Response 1, the logic for even and odd cases is mostly correct, but there is a mistake in the calculation for odd numbers where it incorrectly adds '1 + (i + 1) / 2'.
- **Initialization and Base Cases**: Correctly initializes and handles base cases.
- **Loop and Conditional Logic**: Uses appropriate loop and conditional logic.
- **Output Format**: Returns the sequence in the correct format.
**Scores:**
- **Response 1**: 
- Instruction Adherence: 8 (Partially Adhered)\n - Usefulness: 7 (Useful but Incomplete)\n - Level of Detail: 8 (Detailed but Slightly Lacking)\n - Relevance: 9 (Highly Relevant)\n - **Overall Score**: 8\n
- **Response 2**: 
- Instruction Adherence: 8 (Partially Adhered)\n - Usefulness: 7 (Useful but Incomplete)\n - Level of Detail: 8 (Detailed but Slightly Lacking)\n - Relevance: 9 (Highly Relevant)\n - **Overall Score**: 8
**Scores: \boxed{8, 8}**
Meta RM Score 1
-15.7781
```

<!-- page 37 of 44 -->

Preprint. Under review.

| DeepSeek-GRM-27B Result 2 | ### OutputSpecific Criteria:1. **Correctness of Tribonacci Sequence Calculation** (Weight: 40%): The response must correctly implement the Tribonacci sequence as defined in the problem.2. **Code Structure and Readability** (Weight: 30%): The code should be well-structured, readable, and follow best practices.3. **Edge Case Handling** (Weight: 20%): The response should correctly handle edge cases such as 'n = 0' and 'n = 1'.4. **Efficiency** (Weight: 10%): The code should efficiently compute the sequence without unnecessary computations.Analysis:- **Response 1**:- **Correctness of Tribonacci Sequence Calculation**: The response correctly implements the Tribonacci sequence for both even and odd indices.- **Code Structure and Readability**: The code is structured well and is readable. It uses a loop to generate the sequence and correctly handles the conditions for even and odd indices.- **Edge Case Handling**: The response correctly handles the edge cases for 'n = 0' and 'n = 1'.- **Efficiency**: The code efficiently computes the sequence with a single loop.- **Response 2**:- **Correctness of Tribonacci Sequence Calculation**: The response incorrectly computes the sequence for odd indices by adding an extra '1 + i + (i + 1) / 2', which deviates from the defined Tribonacci sequence.- **Code Structure and Readability**: The code is structured similarly to Response 1 but includes an incorrect computation.- **Edge Case Handling**: The response correctly handles the edge cases for 'n = 0' and 'n = 1'.- **Efficiency**: The code is efficient but the incorrect computation affects its usefulness.Scores:\\boxed{9, 5} |
| --- | --- |
| Meta RM Score 2 | 1.3126 |

<!-- page 38 of 44 -->

Preprint. Under review.

```markdown
DeepSeek-GRM-27B Result 3
### Specific Criteria:
1. **Correctness of Tribonacci Sequence Calculation (Weight: 40%)**: - The response must correctly implement the Tribonacci sequence as defined, including handling both even and odd cases accurately.
2. **Code Structure and Readability (Weight: 30%)**: - The code should be well-structured, readable, and follow best practices in JavaScript.
3. **Edge Case Handling (Weight: 20%)**: - The response should correctly handle edge cases such as 'n = 0' and 'n = 1'.
4. **Efficiency (Weight: 10%)**: - The code should be efficient in terms of time and space complexity, avoiding unnecessary computations.
### Analysis:
- **Response 1**: - **Correctness of Tribonacci Sequence Calculation**: The response correctly implements the Tribonacci sequence for both even and odd cases. It accurately follows the given recurrence relations.
- **Code Structure and Readability**: The code is structured well and is readable. It uses a loop to generate the sequence and handles the initial conditions correctly.
- **Edge Case Handling**: The response correctly handles the edge cases 'n = 0' and 'n = 1'.
- **Efficiency**: The code is efficient, with a time complexity of O(n) and space complexity of O(n).
- **Response 2**: - **Correctness of Tribonacci Sequence Calculation**: The response has a logical error in the calculation for odd 'n'. It incorrectly adds '1 + i + (i + 1) / 2' instead of 'p[i - 2] + p[i - 1] + 1 + (i + 1) / 2'.
- **Code Structure and Readability**: The code structure is similar to Response 1, but the logical error makes it less readable.
- **Edge Case Handling**: The response correctly handles the edge cases 'n = 0' and 'n = 1'.
- **Efficiency**: The code is efficient in terms of time and space complexity, but the logical error impacts its correctness.
### Scores:
- **Response 1**: - Instruction Adherence: 10\n - Usefulness: 10\n - Level of Detail: 9\n - Relevance: 10\n - **Overall Score**: 10\n
- **Response 2**: - Instruction Adherence: 8\n - Usefulness: 6\n - Level of Detail: 8\n - Relevance: 8\n - **Overall Score**: 7
### Output:
\boxed{10, 7}
Meta RM Score 3
1.6739
Voted Result
Response 1: 20; Response 2: 27.
Ground Truth
Response 2 is better than Response 1.
```

<!-- page 39 of 44 -->

Preprint. Under review.

| Query | User: Make a research and find the best coins opportunities and relatively obscure coins that have the potential for significant growth for a short-term &amp; mid-term from coingecko and it must be listed in centralized exchange. Remove all coins with price higher than 1$. By implementing fundamental analysis to assessing the intrinsic value, news and crypto social sentiment and voulume of discussion analysis, On-Chain analysis, time series analysis and technical analysis, You will decide which cryptocurrencies is the best to invest. Then show me the best 5 coins that met the all of the conditions. Then show me the real time price of each coin. Then calculate the weekly support and resistance. Then show the best price to buy, for each coin. Then show me the target price. Then insert all of the above in a table and show it to me.Assistant: Based on the given criteria, here are the top 5 relatively obscure coins with potential for significant growth for short-term and mid-term investment. Please note that these recommendations should not be considered as financial advice, and are subject to change.\| Coin \| Real-time Price \| Weekly Support \| Weekly Resistance \| Best Price to Buy \| Target Price \|\|——\|——\|——\|——\|——\|——\|——\|\|XTZ (Tezos) \| $0.70 \| $0.65 \| $0.80 \| $0.68 \| $1.2 \|\| REN (Ren) \| $0.40 \| $0.35 \| $0.48 \| $0.38 \| $0.72 \|\| LRC (Loopring) \| $0.08 \| $0.07 \| $0.10 \| $0.075 \| $0.14 \|\| OCEAN (Ocean Protocol) \| $0.32 \| $0.28 \| $0.38 \| $0.305 \| $0.52 \|\| ZRX (0x) \| $0.96 \| $0.89 \| $1.10 \| $0.94 \| $1.5 \|Please note that the real-time prices mentioned above will change according to the current market rate. It is vital to conduct your due diligence and re-evaluate the investments regularly. The target prices mentioned are speculative estimates based on assessed potential growth and technical analysis. Always exercise caution and consult a financial advisor before making any investment decisions.User: The real time prices aren't correct. |
| --- | --- |
| Response 1 | I apologize for the misunderstanding, as I do not have real-time data access to provide current cryptocurrency prices or market conditions. However, I can guide you on how to find this information and analyze it.\\nTo identify potential investment opportunities in cryptocurrencies priced under $1, you can follow these steps:\\n1. **Use CoinGecko or CoinMarketCap**: These platforms allow you to filter cryptocurrencies by price, market cap, and trading volume. You can set the price filter to under $1.\\n2. **Fundamental Analysis**: Look for coins with strong fundamentals, such as:\\n - Active development teams\\n - Real-world use cases\\n - Partnerships and collaborations\\n - Community support and engagement\\n3. **News and Sentiment Analysis**: Use tools like Google Trends, Twitter, and Reddit to gauge the sentiment around specific coins. Positive news can drive short-term price increases.\\n4. **On-Chain Analysis**: Examine metrics like transaction volume, active addresses, and network growth to assess the health of the blockchain.\\n5. **Technical Analysis**: Use charting tools to identify support and resistance levels, trends, and potential entry and exit points.\\n6. **Volume of Discussion**: Monitor forums and social media platforms to see which coins are being discussed frequently, as this can indicate growing interest.\\nOnce you gather this information, you can create a table similar to the one I provided earlier, but with accurate real-time data.\\nIf you need help with specific analysis techniques or tools, feel free to ask! |

<!-- page 40 of 44 -->

Preprint. Under review.

| Response 2 | I apologize for any confusion in the real-time prices mentioned in the previous response. It is quite challenging to ensure real-time accuracy due to the rapidly changing nature of cryptocurrency prices. Here are the updated real-time prices at the time of this response.\\n \| Coin \| Real-time Price \|\|--\|------\|\| XTZ (Tezos) \| $0.63 \| \| REN (Ren) \| $0.36 \| \| LRC (Loopring) \| $0.08 \| \| OCEAN (Ocean Protocol) \| $0.29 \| \| ZRX (0x) \| $0.93 \|\\n To obtain accurate real-time prices, I recommend using reliable cryptocur-rency tracking websites such as CoinGecko, CoinMarketCap, or Binance. Please note that the table containing other information provided earlier stands, as it is not dependent on real-time prices.\\n Keep in mind that investing in cryptocurrencies always carries risk, and it's essential to do your own research, consider your investment strategy, and exercise cautionbefore making investment decisions. Always consult a financial advisor for professional guidance. |
| --- | --- |
| DeepSeek-GRM- | Specific Criteria: |
| 27B Result | - Real-time Price Accuracy (Weight: 30%): The response must provide accurate real-time prices for the listed coins. - Guidance on Analysis Techniques (Weight: 20%): The response should offer clear guidance on how to conduct the required analyses. - Table Update (Weight: 15%): The response should update the table with the correct real-time prices. - Risk Disclosure (Weight: 10%): The response should include a clear disclaimer about the risks of investing in cryptocurrencies. - Resource Recommendations (Weight: 10%): The response should recommend reliable resources for obtaining real-time data. - Clarity and Structure (Weight: 15%): The response should be clear, well-structured, and easy to follow. Analysis: - **Response 1**: This response acknowledges the lack of real-time data access and provides a comprehensive guide on how to find and analyze cryptocurrency data. It scores well on Guidance on Analysis Techniques and Clarity and Structure but lacks in Real-time Price Accuracy and Table Update. It includes a Risk Disclosure and Resource Recommendations. - **Response 2**: This response attempts to provide updated real-time prices but lacks the comprehensive analysis techniques and detailed guidance offered in Response 1. It scores well on Real-time Price Accuracy and Table Update but poorly on Guidance on Analysis Techniques and Clarity and Structure. It includes a Risk Disclosure and Resource Recommendations. Scores: \\boxed{7, 5} |
| Ground Truth | Response 2 is better than Response 1. |

## F.2 Failure Mode Analysis · 失败模式分析

We randomly sampled 10 incorrect data points from test results of DeepSeek-GRM-27B on each benchmark and summarize the failure modes in Figure 8. Analysis of the failure cases indicates that the challenge lies mainly in the incapability of the model to judge responses that are too complex or within specific domains, such as pattern matching, counting, etc., and the lack of expert knowledge, resulting in incorrect critiques. Although the principles

<!-- page 41 of 44 -->

Preprint. Under review.

![Image block](./images/p41-figure-8-the-distributions-of-failure-modes-of-deepseek.jpg)

Figure 8: The distributions of failure modes of DeepSeek-GRM-27B on different RM benchmarks. We manually examined and categorized the modes into four classes. “Annotation Contradicting the Ground Truth” represents the preference label provided in the benchmark is disagreed by the annotator.

are correctly generated in most cases, the weights assigned by the model for each principle affect the generation of rewards and sometimes cause incorrect results. However, we also found that the ground truths of a few data points in the RM benchmarks are inconsistent with the preference of the human annotator, probably because of the bias from this smallscale human annotation study or potential mistakes in ground truth labeling.

我们在每个基准上从 DeepSeek-GRM-27B 的测试结果中随机抽取 10 个错误数据点, 把失败模式汇总在图 8. 对失败案例的分析表明, 难点主要在于模型无法判断过于复杂或属于特定领域 (如模式匹配, 计数等) 的回答, 以及缺乏专业知识, 从而写出错误的评语. 虽然多数情况下原则生成得正确, 但模型给每条原则分配的权重会影响奖励的生成, 有时导致错误结果. 不过我们也发现, RM 基准中有少数数据点的真值与人工标注者的偏好不一致, 可能来自这次小规模人工标注研究的偏差, 也可能是真值标注本身有误.

## G Prompt Templates · 提示模板

We demonstrate the prompt templates used for DeepSeek-GRM, for DeepSeek-GRM with a single response during training, for the meta-RM, and for LLM-as-a-Judge below. For prompt engineering, we design a few example principles for both in-context learning and basic critique guidance. We use a plainer template for the meta RM to ensure the query, responses, and the generated principles and critiques could fit in the context window. After assembling with the template of the meta RM, we further enclose the content with chat templates designed for DeepSeek-V3-1226 (DeepSeek-AI, 2024b) before input.

下面给出所用的提示模板: DeepSeek-GRM 的模板, 训练时 DeepSeek-GRM 给单个回答打分的模板, meta RM 的模板, 以及 LLM-as-a-Judge 的模板. 提示工程上, 我们设计了几条示例原则, 既用于上下文学习, 也作为基本的评语引导. meta RM 用的模板更简洁, 保证查询, 回答以及生成的原则和评语能放进上下文窗口. 套用 meta RM 的模板后, 我们还会再用为 DeepSeek-V3-1226 (DeepSeek-AI, 2024b) 设计的对话模板把内容包起来, 再输入模型.

以下模板是引用样本, 保留原文.

## DeepSeek-GRM (Default) · 默认模板

You are a skilled little expert at scoring responses. You should evaluate given responses based on the given judging criteria.\n Given the context of the conversation (the last round is the User’s query) and multiple responses from the Assistant, you need to refer to the [General Evaluation Criteria] to score the responses. Based on the general evaluation criteria, state potential other specific criteria to the query, the weights of different criteria, and then provide an overall comprehensive score upon them.\n Each score is an integer between 1 and 10, with a higher score indicating that the response meets the relevant criteria more closely. For example, a score of 1 means the response does not meet the criteria at all, a score of 6 means the response meets only some parts, and a score of 10 means the response perfectly meets the evaluation criteria.\n Before scoring, please analyze step by step. Your scoring needs to be as strict as possible.

## \#### Evaluation Criteria ####

1. Instruction Adherence:\n - Fully Adhered (9-10 points): The response fully complies with all instructions and requirements of the question.\n - Partially Adhered (6-8 points): The response meets most of the instructions but has some omissions or misunderstandings.\n - Basically Adhered (3-5 points): The response meets some instructions, but the main requirements are not fulfilled.\n - Not Adhered (1-2 points): The response does not meet any instructions.\n Example: If the question requires three examples and the response provides only one, it falls under “Partially Adhered.”

2. Usefulness:\n - Highly Useful (9-10 points): The response provides comprehensive and

<!-- page 42 of 44 -->

Preprint. Under review.

accurate information, fully addressing the issue.\n - Useful but Incomplete (6-8 points): The response provides some useful information, but lacks details or accuracy.\n - Limited Usefulness (3-5 points): The response offers little useful information, with most content being irrelevant or incorrect.\n - Useless or Incorrect (1-2 points): The response is completely irrelevant or incorrect.\n Example: If there are factual errors in the response but the overall direction is correct, it falls under “Useful but Incomplete.”

3. Level of Detail:\n - Very Detailed (9-10 points): The response includes ample details covering all aspects of the issue.\n - Detailed but Slightly Lacking (6-8 points): The response is fairly detailed but misses some important details.\n - Basically Detailed (3-5 points): The response provides some details but is not thorough enough overall.\n - Not Detailed (1-2 points): The response is very brief and lacks necessary details.\n Example: If the response provides only a simple conclusion without an explanation, it falls under “Not Detailed.”

4. Relevance:\n - Highly Relevant (9-10 points): The response is highly relevant to the question, with information closely aligned with the topic.\n - Generally Relevant (6-8 points): The response is generally relevant but includes some unnecessary information.\n - Partially Relevant (3-5 points): The response has a lot of content that deviates from the topic.\n - Not Relevant (1-2 points): The response is completely irrelevant.\n Example: If the response strays from the topic but still provides some relevant information, it falls under “Partially Relevant.”

\#### Conversation Context ####\n{conversation context & query}\n

\#### Responses to be Scored ####

[The Begin of Response i]\n{the i-th response}\n[The End of Response i]\n

\#### Output Format Requirements ####

## Output with three lines

Specific Criteria: &lt;Other potential criteria specific to the query and the context, and the weights of each criteria&gt;.

Analysis: &lt;Compare different responses based on given Criteria&gt;.

Scores: &lt;the overall comprehensive score of all responses in order, separate by comma in the boxed, e.g., \boxed{x, x} if there exists 2 responeses&gt;.

## DeepSeek-GRM (Training on Rating Single Response) · 训练时给单个回答打分的模板

You are a skilled little expert at scoring responses. You should evaluate given responses based on the given judging criteria.\nGiven the context of the conversation (the last round is the User’s query) and multiple responses from the Assistant, you need to refer to the [General Evaluation Criteria] to score the responses. Based on the general evaluation criteria, state potential other specific criteria to the query, the weights of different criteria, and then provide an overall comprehensive score upon them. The score is 0 or 1, with 1 indicating that the response is correct.\nBefore scoring, please analyze step by step. Your scoring needs to be as strict as possible.

## \#### Evaluation Criteria ####

1. Instruction Adherence:\n - Fully Adhered: The response fully complies with all instructions and requirements of the question.\n - Partially Adhered: The response meets most of the instructions but has some omissions or misunderstandings.\n - Basically Adhered: The response meets some instructions, but the main requirements are not fulfilled.\n - Not Adhered: The response does not meet any instructions.\n Example: If the question requires three examples and the response provides only one, it falls under “Partially Adhered.”

2. Clarity:\n - Very Clear: The response is fluent, well-structured, and logically clear.\n - Clear but Minor Issues: The response is mostly clear but has some minor language or structural issues.\n - Basically Clear: The response has noticeable language or logic issues but is still understandable.\n - Not Clear: The response is disjointed, illogical, and hard to understand.\n Example: If the response has complex sentence structures and lacks punctuation, it falls under “Basically Clear” or “Not Clear.”

3. Accuracy:\n - Completely Accurate: All information and data are completely accurate.\n - Mostly Accurate: Most information is accurate, with minor errors.\n - Some Errors: There are some noticeable errors affecting comprehension.\n - Mostly Incorrect: There are numerous errors seriously affecting the credibility of the information.\n Example: If a specific data point is incorrectly cited but doesn’t affect the overall conclusion, it falls under “Mostly Accurate.”

\#### Conversation Context ####\n{conversation context & query}\n

<!-- page 43 of 44 -->

Preprint. Under review.

## \#### Responses to be Scored ####

[The Begin of Response]\n{the response}\n[The End of Response]\n #### Output Format Requirements ####

Specific Criteria: &lt;Other potential criteria specific to the query and the context, and the weights of each criteria&gt;. Analysis: &lt;Compare different responses based on given Criteria&gt;. Scores: &lt;the overall comprehensive score of the response, e.g., \boxed{x}&gt;.

## Meta RM · meta RM 模板

## Prompt:

Please score the responses.

\#### Conversation Context ####\n{conversation context & query}\n #### Responses to be Scored #### [The Begin of Response i]\n{the i-th response}\n[The End of Response i]\n

## Response:

{principle & critique}

## LLM-as-a-Judge · LLM-as-a-Judge 模板

You are a skilled little expert at scoring responses. You should evaluate given responses based on the given judging criteria.\nGiven the context of the conversation (the last round is the User’s query) and multiple responses from the Assistant, you need to refer to the [General Evaluation Criteria] to score the responses. Based on the general evaluation criteria, state potential other specific criteria to the query, the weights of different criteria, and then select the best response among all candidates.\nBefore judging, please analyze step by step. Your judgement needs to be as strict as possible.

## \#### Evaluation Criteria ####

1. Instruction Adherence:\n - Fully Adhered: The response fully complies with all instructions and requirements of the question.\n - Partially Adhered: The response meets most of the instructions but has some omissions or misunderstandings.\n - Basically Adhered: The response meets some instructions, but the main requirements are not fulfilled.\n - Not Adhered: The response does not meet any instructions.\n Example: If the question requires three examples and the response provides only one, it falls under “Partially Adhered.”

2. Usefulness:\n - Highly Useful: The response provides comprehensive and accurate information, fully addressing the issue.\n - Useful but Incomplete: The response provides some useful information, but lacks details or accuracy.\n - Limited Usefulness: The response offers little useful information, with most content being irrelevant or incorrect.\n - Useless or Incorrect: The response is completely irrelevant or incorrect.\n Example: If there are factual errors in the response but the overall direction is correct, it falls under “Useful but Incomplete.” 3. Level of Detail:\n - Very Detailed: The response includes ample details covering all aspects of the issue.\n - Detailed but Slightly Lacking: The response is fairly detailed but misses some important details.\n - Basically Detailed: The response provides some details but is not thorough enough overall.\n - Not Detailed: The response is very brief and lacks necessary details.\n Example: If the response provides only a simple conclusion without an explanation, it falls under “Not Detailed.”

4. Relevance:\n - Highly Relevant: The response is highly relevant to the question, with information closely aligned with the topic.\n - Generally Relevant: The response is generally relevant but includes some unnecessary information.\n - Partially Relevant: The response has a lot of content that deviates from the topic.\n - Not Relevant: The response is completely irrelevant.\n Example: If the response strays from the topic but still provides some relevant information, it falls under “Partially Relevant.”

\#### Conversation Context ####\n{conversation context & query}\n

\#### Responses to be Scored ####

[The Begin of Response]\n{the response}\n[The End of Response]\n

<!-- page 44 of 44 -->

Preprint. Under review.

## \#### Output Format Requirements ####

Specific Criteria: &lt;Other potential criteria specific to the query and the context, and the weights of each criteria&gt;

Analysis: &lt;Compare different responses based on given Criteria&gt;.

Scores: &lt;the index of the best response based on the judgement, in the format of \boxed{x}&gt;.
