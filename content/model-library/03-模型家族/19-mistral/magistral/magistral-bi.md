源文: arXiv:2506.10910v1, Magistral, Mistral AI, 2025 年 6 月 12 日, 23 页, 23 张图 (16 个图号, 其中图 6, 7, 8, 11, 12 由多张子图拼成). 英文段在前, 中文意译紧跟. Abstract, Introduction, Conclusion, References 的节名不译, 正文都附中文. 单独的页码行已删去, 跨页断开的半句已接回上一页. 转 Markdown 时把 5.1 节标题识别成 「f5.1」, 把图 4 图注里的 「Mistral Medium 3」 粘成 「aMistral Medium 3」, 把 7.2 节的 「Mistral Medium 3,」 识别成上标, 把 $\varepsilon_{\mathrm{high}}$ 识别成 「<sup>ε</sup>high」, 这里都按 PDF 文字层改回. 图 2 的系统提示词按图片原文照录, 保留原标点.

<!-- page 1 of 23 -->

arXiv:2506.10910v1 [cs.CL] 12 Jun 2025

arXiv 编号 2506.10910v1, 分类 cs.CL, 日期 2025 年 6 月 12 日.

# Magistral

![Mistral AI 标志: 橙黄渐变, 带深棕色立体投影的斜排大字 Mistral.AI](images/p01-abstract.png)

## Abstract

We introduce Magistral, Mistral's first reasoning model and our own scalable reinforcement learning (RL) pipeline. Instead of relying on existing implementations and RL traces distilled from prior models, we follow a ground up approach, relying solely on our own models and infrastructure. Notably, we demonstrate a stack that enabled us to explore the limits of pure RL training of LLMs, present a simple method to force the reasoning language of the model, and show that RL on text data alone maintains most of the initial checkpoint's capabilities. We find that RL on text maintains or improves multimodal understanding, instruction following and function calling. We present Magistral Medium, trained for reasoning on top of Mistral Medium 3 with RL alone, and we open-source Magistral Small (Apache 2.0) which further includes cold-start data from Magistral Medium.

本文介绍 Magistral: 这是 Mistral 的第一个推理模型, 也是我们自己搭的一套可扩展强化学习 (RL) 流水线. 我们没有依赖现成的实现, 也没有用从旧模型蒸馏来的 RL 轨迹, 而是从头做起, 只用自己的模型和基础设施. 值得一提的是, 我们展示了一套能用来探索 LLM 纯 RL 训练极限的技术栈, 给出一个强制模型用指定语言推理的简单方法, 并说明只在文本数据上做 RL 就能保住初始 checkpoint 的大部分能力. 我们发现文本上的 RL 能保持甚至提升多模态理解, 指令遵循和函数调用. 我们发布 Magistral Medium, 它在 Mistral Medium 3 之上只用 RL 训练出推理能力; 我们还开源 Magistral Small (Apache 2.0), 它额外用了来自 Magistral Medium 的冷启动数据.

> **想:** 摘要里 Medium 是 「RL alone」, Small 又 「further includes cold-start data」, 两条路线到底在哪一步分开?
> 第 8 页图 4 中栏画得最清楚: Mistral Medium 3 直接进 RL 得到 Magistral Medium; Magistral Medium 生成的轨迹先拿去对 Mistral Small 3 做 SFT, 再进 RL 得到 Magistral Small. 参数量方面, Small 在第 1 页和第 9 页印的是 24B, Medium 全篇没印.

## 1 Introduction

Enhancing the reasoning abilities of large language models (LLMs) has emerged as a key frontier in modern AI research. Reasoning models such as o1 [Jaech et al., 2024] differ widely from classic chatbots, leveraging longer chains-of-thought to improve performance on complex tasks. The seminal work by DeepSeek-AI et al. [2025] gave the community crucial insights on the Reinforcement Learning from Verifiable Rewards (RLVR) recipe, for creating reasoning models at scale.

提升大语言模型 (LLM) 的推理能力, 已经是当今 AI 研究的一条关键前沿. o1 [Jaech et al., 2024] 这类推理模型和传统聊天机器人差别很大, 它们靠更长的 CoT 在复杂任务上拿到更好的表现. DeepSeek-AI et al. [2025] 的开创性工作让社区看清了基于可验证奖励的强化学习 (RLVR) 这套配方, 可以用来大规模地造推理模型.

In this paper, we introduce Mistral's first reasoning models: Magistral Small and Magistral Medium, based on the Mistral Small 3 and Mistral Medium 3 models respectively, and outline our proposed RLVR framework in detail. The key contributions of our paper are the following:

本文介绍 Mistral 的第一批推理模型: Magistral Small 和 Magistral Medium, 分别基于 Mistral Small 3 和 Mistral Medium 3, 并详细说明我们提出的 RLVR 框架. 主要贡献如下:

• We present in detail how we trained Magistral Medium with RL alone, with no distillation from pre-existing reasoning models, yielding a nearly 50% boost in AIME-24 (pass@1).

• We discuss in depth the infrastructure and design choices that enable large-scale online RL. Our asynchronous system enables fast, continuous RL training by updating generators frequently without interrupting them, balancing efficiency with on-policyness.

• We present a simple yet effective strategy to make the model multilingual, where both the chain-of-thought and the final response are written in the user's language.

• We contribute insights that add to, or contradict, existing RLVR literature, for example on whether RL can improve upon the distillation SFT baseline for small models. We also show that multimodal reasoning capabilities emerge with online RL with textual data on top of a multimodal model. We share the results of our unsuccessful experiments.

• We release the weights of Magistral Small (24B) under the Apache 2 license<sup>1</sup>.

• 详细介绍我们如何只用 RL 训练 Magistral Medium, 不从任何现有推理模型蒸馏, AIME-24 (pass@1) 提升接近 50%.

• 深入讨论支撑大规模在线 RL 的基础设施和设计选择. 我们的异步系统频繁更新生成器却不打断它们, 让 RL 训练又快又连续, 在效率和 on-policy 程度之间取得平衡.

• 给出一个简单有效的办法让模型支持多语言: CoT 和最终回答都用用户的语言写.

• 提出一些对现有 RLVR 文献的补充或反驳, 例如小模型上 RL 能否超过蒸馏 SFT 基线. 我们还展示: 在多模态模型上只用文本数据做在线 RL, 多模态推理能力会自己冒出来. 我们也分享失败实验的结果.

• 以 Apache 2 许可发布 Magistral Small (24B) 的权重<sup>1</sup>.

> **问:** 「nearly 50% boost in AIME-24 (pass@1)」 是相对涨幅还是百分点?
> 看第 9 页表 2: Mistral Medium 3 是 26.8, Magistral Medium 是 73.6, 差 46.8 个百分点 (估算); 按相对涨幅算约 175% (估算). 所以这里的 50% 指百分点, 而且是 「接近」 50.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>https://huggingface.co/mistralai/Magistral-Small-2506</span></small>

脚注 1: Magistral Small 的 Hugging Face 权重页, 版本号 2506.

<!-- page 2 of 23 -->

![图 1 分组柱状图, 纵轴 Accuracy (%), 五组基准 AIME-24, AIME-25, GPQA Diamond, LiveCodeBench (v5), Aider-Polyglot; 每组依次为 Mistral-Medium 3 (浅橙), Magistral-Medium (深橙), Deepseek-V3 (浅蓝), Deepseek-R1 (蓝); 两个 AIME 组的橙色柱上叠了 maj@4 和 maj@64 的浅色段. AIME-24: 26.8 / 34.4 / 43.3, 73.6 / 81.3 / 90.0, 39.2, 79.8; AIME-25: 21.2 / 25.8 / 30.0, 64.9 / 72.1 / 83.3, 28.8, 70.0; GPQA Diamond: 59.6, 70.8, 59.1, 71.5; LiveCodeBench (v5): 29.1, 59.4, 36.2, 65.9; Aider-Polyglot: 28.9, 47.1, 49.6, 53.3](images/p02-figure-1-performance-of-magistral-medium-on-common.png)

Figure 1: Performance of Magistral Medium on common reasoning benchmarks. We highlight the strength of our proposed RLVR framework, which yields a 50% increase in AIME-24 (pass@1) over the initial Mistral Medium 3 checkpoint, without any cold-start reasoning traces. We compare against analogous results from [DeepSeek-AI et al., 2025], which show RL improvements from DeepSeek-v3 to DeepSeek-R1 (January 25). Magistral Medium reaches 90% accuracy on AIME-24 with majority voting.

图 1: Magistral Medium 在常见推理基准上的表现. 我们想突出所提 RLVR 框架的效果: 不用任何冷启动推理轨迹, AIME-24 (pass@1) 比初始的 Mistral Medium 3 checkpoint 提升 50%. 对比对象是 [DeepSeek-AI et al., 2025] 中的同类结果, 即 DeepSeek-v3 到 DeepSeek-R1 (1 月 25 日版) 的 RL 提升. 用多数投票时, Magistral Medium 在 AIME-24 上达到 90% 准确率.

> **核对:** 图 1 的数和第 9 页表 2 一样吗?
> pass@1 和 maj@64 大都一致: 73.6 / 90.0, 21.2 / 30.0, 64.9 / 83.3. 唯一对不上的是 Mistral Medium 3 的 AIME-24 maj@64: 图 1 印 43.3%, 表 2 印 43.4. 另外图 1 多了一档 maj@4 (34.4, 81.3, 25.8, 72.1), 表 2 没有这档.

> **看表:** 图 1 横轴写 「GPQA Diamond」, 表 2 只写 「GPQA」, 是同一个吗?
> 四个数完全相同 (59.6, 70.8, 59.1, 71.5), 应是同一个子集. 第 8 页 5.1 节只说 「the GPQA dataset」, 没点明 Diamond; 第 11 页图 5 和第 16 页图 13 的横轴也都写 GPQA Diamond.

The paper is organized as follows: Section 2 details the RL algorithm we used, along with the design choices implemented to guide the reasoning models in terms of language and format; Section 3 presents our scalable infrastructure that supports efficient training on a large cluster of GPUs; Section 4 discusses the data selection process we employed for efficient and effective training; Section 5 presents the performance of Magistral on reasoning and multilingual benchmarks; Section 6 shows the ablations done to motivate the training choices; Section 7 presents a PCA-based study of the model weights' trajectory during RL, demonstrates that RL on text data preserves or even improves multimodal capabilities, and includes methods that worked poorly for Magistral; Section 8 shows that one can train a model to perform on par with R1 with distillation followed by RL, which we did not use for Magistral Medium; Finally, we conclude with some future directions in Section 9.

全文结构如下: 第 2 节讲我们用的 RL 算法, 以及在语言和格式上引导推理模型的设计; 第 3 节介绍可扩展的基础设施, 它支撑在大规模 GPU 集群上高效训练; 第 4 节讲为了训得又快又好而采用的数据筛选流程; 第 5 节给出 Magistral 在推理和多语言基准上的表现; 第 6 节是支撑各项训练选择的消融; 第 7 节用 PCA 研究 RL 过程中模型权重的轨迹, 说明文本上的 RL 能保住甚至提升多模态能力, 并列出在 Magistral 上效果不好的方法; 第 8 节说明先蒸馏再 RL 可以训出和 R1 相当的模型, 这条路 Magistral Medium 没有用; 最后第 9 节给出未来方向.

## 2 Methodology (方法)

In this section, we outline the training methodology used to develop the Magistral models. This includes our optimizations of the GRPO algorithm for training stability (Section 2.1) and our training reward to improve both mathematical and coding capabilities, while ensuring the model adheres to proper format, length, and language usage (Section 2.2).

本节概述开发 Magistral 模型的训练方法. 内容包括: 为训练稳定对 GRPO 算法做的优化 (2.1 节); 训练奖励的设计, 它要同时提升数学和代码能力, 并保证模型遵守格式, 长度和语言上的要求 (2.2 节).

### 2.1 Reinforcement learning algorithm (强化学习算法)

We use Group Relative Policy Optimization (GRPO) [Shao et al., 2024] as our RL algorithm. Unlike PPO [Schulman et al., 2017], GRPO eliminates the need for a 'critic model', and instead uses the average reward from multiple generations per prompt from the policy to compute a baseline for advantage calculation. Specifically, GRPO optimizes the policy $\pi _ { \theta }$ to maximize the following objective:

我们用组相对策略优化 (GRPO) [Shao et al., 2024] 作为 RL 算法. 和 PPO [Schulman et al., 2017] 不同, GRPO 不需要 「critic 模型」, 而是对每个 prompt 让策略生成多条回答, 用它们的平均奖励作为计算优势的基线. 具体地, GRPO 优化策略 $\pi _ { \theta }$, 使下面的目标最大:

$$
\begin{array}{l} \mathcal {J} _ {\mathrm{GRPO}} (\theta) = \mathbb {E} _ {q \sim P (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {\mathrm{old}}} (\cdot | q)} \\ \left[ \sum_ {i = 1} ^ {G} \sum_ {t = 1} ^ {| o _ {i} |} \frac {1}{| o _ {i} |} \Big (\min \left[ \frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta_ {\mathrm{old}}} (o _ {i , t} | q , o _ {i , <   t})} \hat {A} _ {i, t}, \operatorname{clip} (\frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta_ {\mathrm{old}}} (o _ {i , t} | q , o _ {i , <   t})}, 1 - \varepsilon , 1 + \varepsilon) \hat {A} _ {i, t} \right] \right. \\ \left. - \beta D _ {\mathrm{KL}} [ \pi_ {\theta} (\cdot | q) \| \pi_ {\mathrm{ref}} (\cdot | q) ]\right) \Bigg ], \end{array}
$$

where q represents queries drawn from the input dataset, o represents the generation of the model, ε is the PPO clipping threshold, β is the KL penalty coefficient, and $D _ { \mathrm { K L } }$ denotes the Kullback–Leibler divergence between the current policy π<sub>θ</sub> and the reference policy $\pi _ { \mathrm { r e f } }$ . The relative advantage, or the group normalized advantage, is given by $\begin{array} { r } { \hat { A } _ { i , t } = \frac { r _ { i } - \mu } { \sigma } } \end{array}$ where $\mu$ and σ are the mean and standard deviation of rewards computed within a single group. Building on prior work adapting GRPO for reasoning tasks [Yu et al., 2025, Liu et al., 2025, Hu et al., 2025], we introduced several modifications:

其中 q 是从输入数据集中抽出的问题, o 是模型的生成, ε 是 PPO 的裁剪阈值, β 是 KL 惩罚系数, $D _ { \mathrm { K L } }$ 是当前策略 π<sub>θ</sub> 与参考策略 $\pi _ { \mathrm { r e f } }$ 之间的 Kullback–Leibler 散度. 相对优势, 也叫组归一化优势, 是 $\hat { A } _ { i , t } = \frac { r _ { i } - \mu } { \sigma }$, 其中 $\mu$ 和 σ 是同一组内奖励的均值和标准差. 在前人把 GRPO 改造用于推理任务的工作 [Yu et al., 2025, Liu et al., 2025, Hu et al., 2025] 基础上, 我们做了以下几处修改:

<!-- page 3 of 23 -->

**Eliminating KL divergence.** The KL divergence penalty constrains the online policy from deviating too much from a reference policy, helping to maintain alignment with the initial model. However, in GRPO, the policy diverges substantially regardless, and maintaining a copy of the reference model for KL computation incurs a compute cost we find unjustified. We remove the KL penalty entirely.

**去掉 KL 散度.** KL 散度惩罚约束在线策略不要偏离参考策略太远, 有助于和初始模型保持一致. 但在 GRPO 里, 策略无论如何都会偏离很多, 而为了算 KL 还要多存一份参考模型, 这份算力开销我们认为不值. 所以我们把 KL 惩罚整个删掉.

**Loss normalization.** To avoid introducing length biases between generations in one group, we normalize the loss by first adding token-wise loss for all tokens and all generations and then dividing by the total length of generations in the group $\textstyle \sum _ { i = 1 } ^ { G } | o _ { i } |$

**Loss 归一化.** 为了不在同一组的各条生成之间引入长度偏差, 我们这样归一化 loss: 先把所有生成的所有 token 的逐 token loss 加起来, 再除以这一组生成的总长度 $\textstyle \sum _ { i = 1 } ^ { G } | o _ { i } |$.

**Advantage normalization.** We estimate the advantage of each token simply as $\hat { A } _ { i , t } = \hat { A } _ { i } = r _ { i } - \mu ,$ where $\mu$ is the mean of rewards within a group. Following Andrychowicz et al. [2020], we additionally normalize the advantages in each minibatch as $\hat { A } _ { i , t } ^ { \mathrm { n o r m } } = ( \hat { A } _ { i } - \hat { A } ^ { \mathrm { m e a n } } ) / \hat { A } ^ { \mathrm { s t d } }$ where $\hat { A } ^ { \mathrm { m e a n } }$ and $\hat { A } ^ { \mathrm { s t d } }$ are the sequence-wise mean and standard deviation of the advantages $\hat { A } _ { i }$ in a minibatch.

**优势归一化.** 每个 token 的优势直接估计为 $\hat { A } _ { i , t } = \hat { A } _ { i } = r _ { i } - \mu$, 其中 $\mu$ 是组内奖励均值. 参照 Andrychowicz et al. [2020], 我们再在每个 minibatch 内归一化优势: $\hat { A } _ { i , t } ^ { \mathrm { n o r m } } = ( \hat { A } _ { i } - \hat { A } ^ { \mathrm { m e a n } } ) / \hat { A } ^ { \mathrm { s t d } }$, 其中 $\hat { A } ^ { \mathrm { m e a n } }$ 和 $\hat { A } ^ { \mathrm { s t d } }$ 是这个 minibatch 里各序列优势 $\hat { A } _ { i }$ 的均值和标准差.

> **拆开:** 改过的优势和第 2 页原始 GRPO 的 $(r_i-\mu)/\sigma$ 差在哪?
> 原式在组内既减均值又除组内标准差; 改后组内只减均值, 标准差这一步挪到 minibatch 里, 按所有序列的 $\hat{A}_i$ 统一做. 第 12 页图 7 比较了 minibatch, group, 不归一化三种做法, 300 步内 AIME 24 和 LiveCodeBench v5 的曲线交织在一起, 所以论文选了 minibatch.

**Relaxing the trust region's upper bound.** We allow the model to explore rare but potentially insightful reasoning steps, preventing deterministic policies. We adopt the Clip-Higher [Yu et al., 2025] strategy to address entropy collapse. In standard GRPO, ε-clipping limits exploration by restricting the increase in probability of low-likelihood tokens, hindering the reinforcement of rare but important reasoning paths. By increasing the upper clipping threshold to $\varepsilon _ { \mathrm { h i g h } }$ , low-probability tokens have more room to grow, enhancing entropy and diversity in outputs, and improving reasoning exploration. We found that careful tuning of $\varepsilon _ { \mathrm { h i g h } }$ is crucial to maintaining stability in the RL run. We adjusted it between 0.26 and 0.28 during the training to keep the group entropy stable.

**放宽信任域上界.** 我们让模型去探索少见但可能有启发的推理步骤, 防止策略变成确定性的. 为应对熵坍缩, 我们采用 Clip-Higher [Yu et al., 2025]. 标准 GRPO 的 ε 裁剪会限制低概率 token 的概率上涨, 从而限制探索, 让少见但重要的推理路径难以被强化. 把上裁剪阈值提到 $\varepsilon _ { \mathrm { h i g h } }$ 后, 低概率 token 有了更大的上涨空间, 输出的熵和多样性变高, 推理探索也更充分. 我们发现仔细调 $\varepsilon _ { \mathrm { h i g h } }$ 对 RL 运行的稳定性很关键. 训练中我们把它在 0.26 到 0.28 之间调整, 让组熵保持稳定.

> **确认:** $\varepsilon_{\mathrm{high}}$ 到底用了哪些值?
> Magistral Medium 的训练在 0.26 到 0.28 之间调 (本段); Magistral Small 的 RL 用 0.3 (第 9 页); 第 15 页图 12 的对照实验用的是 0.2 和 0.28. 下界 $\varepsilon_{\mathrm{low}}$ 全篇没有印出数值.

**Eliminating non-diverse groups.** Groups where all generations are either entirely correct or wrong have zero advantage and therefore contribute nothing to the batch loss. This results in smaller gradients with increased noise sensitivity. To address this, we filter out all groups with zero advantage when forming training batches.

**剔除没有差异的组.** 如果一组里的生成全对或全错, 优势就是零, 对 batch loss 毫无贡献. 这会让梯度变小, 对噪声更敏感. 为此, 组 batch 时我们把所有优势为零的组都滤掉.

The final GRPO loss with all modifications highlighted in red is

加上所有修改后, 最终的 GRPO loss 如下 (原文把修改处标成红色, Markdown 里颜色丢失):

$$
\begin{array}{l} \mathcal {J} _ {\mathrm{GRPO}} (\theta) = \mathbb {E} _ {q \sim P (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {\mathrm{old}}} (\cdot | q)} \frac {1}{\sum_ {i = 1} ^ {G} | o _ {i} |} \sum_ {i = 1} ^ {G} \sum_ {t = 1} ^ {| o _ {i} |} \\ \qquad \min \left[ \frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta_ {\mathrm{old}}} (o _ {i , t} | q , o _ {i , <   t})} \hat {A} _ {i, t} ^ {\text {norm}},   \text {clip} (\frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta_ {\mathrm{old}}} (o _ {i , t} | q , o _ {i , <   t})}, 1 - \varepsilon_ {\text {low}}, 1 + \varepsilon_ {\text {high}}) \hat {A} _ {i, t} ^ {\text {norm}} \right], \\ \qquad \text {s. t.} \exists 1 \leq m <   n \leq G, r _ {m} \neq r _ {n}. \end{array}
$$

> **回看:** 最后一行的约束 「存在 m, n 使 $r_m \neq r_n$」 就是上面的 「剔除没有差异的组」 吗?
> 是同一件事的公式写法: 组内奖励全相等, 优势就全为零, 这组不进 batch. 但第 4 页式 (1) 的长度惩罚是连续值, 两条都答对的回答也可能奖励不同; 这种组算不算 「有差异」, 页面没说.

### 2.2 Reward shaping (奖励设计)

Choosing the appropriate reward is crucial for the RL algorithm to work effectively. During training, model generations are evaluated along four axes: formatting, correctness, length, and language consistency, which we describe below.

选对奖励, RL 算法才能有效. 训练中, 模型的生成从四个方面打分: 格式, 正确性, 长度, 语言一致性. 下面逐一说明.

### 2.2.1 Formatting (格式)

For both math and code problems, we instruct the model to follow a specific format, which facilitates the extraction of the model's answer:

对数学题和代码题, 我们都要求模型遵守特定格式, 方便抽取模型的答案:

1. **Tag requirements:** (i) The model response must start with a &lt;think&gt; tag and must include a corresponding &lt;/think&gt; tag. (ii) There should be exactly one set of these tags present in the response.

2. **Mathematical responses:** For mathematical outputs, the response must include the final answer enclosed in \boxed{} within the answer section, following the &lt;/think&gt; tag.

3. **Code responses:** For code outputs, the response must include at least one markdown block, formatted with triple backticks followed by the programming language specification, in the answer section.

1. **标签要求:** (i) 回答必须以 &lt;think&gt; 标签开头, 并包含对应的 &lt;/think&gt; 标签. (ii) 回答里这对标签必须恰好出现一次.

2. **数学回答:** 数学题的回答必须在 &lt;/think&gt; 之后的答案部分, 用 \boxed{} 包住最终答案.

3. **代码回答:** 代码题的回答必须在答案部分包含至少一个 markdown 代码块, 写法是三个反引号后面跟编程语言名.

<!-- page 4 of 23 -->

Failure to meet any of these conditions results in a reward of 0, and the response will not be graded further. Otherwise, the response gets a reward of 0.1 and proceeds to grading.

只要有一条不满足, 奖励就是 0, 不再往下评分. 否则回答得到 0.1 的奖励, 进入评分.

### 2.2.2 Correctness (正确性)

If the generated answer follows the required formatting, we extract the model solution and use a verifier to assess its correctness.

如果生成的回答符合格式要求, 我们就抽出模型的解, 用验证器判断对错.

**Math correctness.** The final answer is extracted from inside the last \boxed{} in the solution and compared against the reference answer using a rule-based verifier. It normalizes both the ground-truth and the generated answer to correctly reward semantically identical responses with different syntaxes. We leverage a combination of different parsers and SymPy<sup>2</sup> to evaluate outputs and compare them to the original ground truth. An additional reward of 0.9 is given if the answer is correct, making the total reward 1.0.

**数学正确性.** 从解答里最后一个 \boxed{} 中抽出最终答案, 用基于规则的验证器和参考答案比较. 验证器会把标准答案和生成答案都规范化, 这样写法不同但意思相同的回答也能正确拿分. 我们组合使用多种解析器和 SymPy<sup>2</sup> 来计算输出, 并与原始标准答案比较. 答对再加 0.9 的奖励, 总奖励为 1.0.

**Code correctness.** Code is extracted from the first markdown code block in the answer section. If the code is written in C++, it is compiled with a timeout of 10 seconds, using the C++20 standard. We pre-compile the bits/stdc++.h standard library header, which is commonly used in competitive programming, to speed up the compilation process. We randomly select 20 tests from the available test cases, ensuring that the same tests are used within a given response group. The code is then executed against these tests, with each test having a timeout of 4 seconds and a memory limit of 300 MB. An additional reward of 0.9 is given if the code successfully passes all the tests.

**代码正确性.** 从答案部分的第一个 markdown 代码块抽出代码. 如果是 C++, 就按 C++20 标准编译, 超时上限 10 秒. 为加快编译, 我们预编译了竞赛编程常用的标准库头文件 bits/stdc++.h. 从可用的测试用例里随机选 20 个, 并保证同一个回答组用同一批测试. 然后在这些用例上运行代码, 每个用例限 4 秒, 内存上限 300 MB. 全部通过再加 0.9 的奖励.

> **停一下:** 可用测试不足 20 个的题怎么办?
> 本页没写. 第 7 页 4.2 节只说要 「a large number of correct tests per problem」, 先删掉 「without enough tests」 的题, 缺测试的题再生成补上, 但 「enough」 的门槛没印. 另外 Python 代码的运行时限和编译方式也没单独说明.

### 2.2.3 Length penalty (长度惩罚)

Following [Yu et al., 2025], we use soft length penalty to signal the model that the hard cutoff on maximal completion length is near. We fix two lengths $l _ { \mathrm { m a x } }$ and $l _ { \mathrm { c a c h e } }$ and compute length penalty as

参照 [Yu et al., 2025], 我们用软长度惩罚提醒模型: 最大生成长度的硬截断快到了. 固定两个长度 $l _ { \mathrm { m a x } }$ 和 $l _ { \mathrm { c a c h e } }$, 按下式计算长度惩罚:

$$
R _ {\text {length}} (y) = \left\{ \begin{array}{l l} 0, & | y | \leq l _ {\max} - l _ {\text {cache}} \\ - 0. 1 \cdot \frac {| y | - l _ {\max} + l _ {\text {cache}}}{l _ {\text {cache}}}, & l _ {\max} - l _ {\text {cache}} <   | y | \leq l _ {\max}, \\ - 0. 1, & l _ {\max} <   | y | \end{array} \right.\tag{1}
$$

式 (1) 的意思: 长度不超过 $l_{\max}-l_{\mathrm{cache}}$ 时不罚; 落在 $l_{\max}-l_{\mathrm{cache}}$ 到 $l_{\max}$ 之间时, 惩罚从 0 线性降到 -0.1; 超过 $l_{\max}$ 就罚 -0.1.

### 2.2.4 Language consistency reward (语言一致性奖励)

A core design principle for Magistral is for it to reason in the same language as the user. Reinforcement learning on math and coding problems without any treatment often results in mixed-language model responses. In preliminary experiments without language constraints, we frequently observed outputs that mixed English, Chinese, and Russian words. While these outputs were coherent, they were undesirable from a user perspective.

Magistral 的一条核心设计原则是用和用户相同的语言推理. 如果不加处理, 在数学和代码题上做强化学习, 模型的回答常常会混杂多种语言. 在不加语言约束的初步实验里, 我们经常看到英文, 中文, 俄文词混在一起的输出. 这些输出虽然连贯, 从用户角度看并不理想.

To prevent language switching, we translated 10% of our problems written in English to the following languages: French, Spanish, Italian, German, Chinese, and Russian. When calculating the reward for a conversation—a triple of (problem, thoughts, answer)—we first normalized each of the three components by removing LaTeX content and code blocks, and then applied a fastText classifier [Joulin et al., 2016] to each. If the classifier indicates that all three parts used the same language, we give an additional reward of 0.1.

为防止切换语言, 我们把 10% 的英文题目翻译成法语, 西班牙语, 意大利语, 德语, 中文和俄语. 计算一段对话 (即 (题目, 思考, 回答) 三元组) 的奖励时, 先把三部分各自规范化, 去掉 LaTeX 内容和代码块, 再分别用 fastText 分类器 [Joulin et al., 2016] 判语言. 如果分类器认定三部分用的是同一种语言, 就再加 0.1 的奖励.

> **再看:** 这 10% 是每种语言各 10%, 还是六种语言合计 10%?
> 按字面是英文题目总量的 10% 被翻译, 分到六种语言; 如果均分, 每种约 1.7% (估算), 页面没说怎么分. 第 10 页表 4 的多语言 AIME'24 测的正好是这六种语言, 比英文低 4.3 到 9.9 分.

These simple modifications are sufficient to enable the model to closely follow the language of the user, with minimal code-switching, while maintaining performance on reasoning tasks. Although we only translated the original English problems into a few languages, we observed that the model could successfully generate chains of thought in arbitrary languages.

这些简单的改动就足以让模型紧跟用户的语言, 很少中途切换语言, 同时推理任务上的表现不受影响. 虽然我们只把英文原题翻成了几种语言, 但观察到模型能用任意语言写出 CoT.

**System prompt.** We specify the format and the language requirements in the system prompt, which can be found in Figure 2. We find that RL training is quite sensitive to the system prompt we use. For example, the Be as casual and as long as you want part of the system prompt increases the entropy of the model and therefore improves the exploration of the model.

**系统提示.** 格式和语言要求写在系统提示里, 见图 2. 我们发现 RL 训练对所用的系统提示相当敏感. 例如系统提示里 「Be as casual and as long as you want」 这一句会提高模型的熵, 从而改善模型的探索.

> **对一下:** 格式奖励检查的 \boxed{} 和带语言名的代码块, 系统提示里写了吗?
> 第 5 页图 2 的提示词只规定了 &lt;think&gt; 模板, Markdown 和 LaTeX 排版, 以及思考和总结要用用户语言, 没有提 \boxed{}, 也没提代码块要标语言. 这两条要求是写在题目文本里, 还是靠模型自己学, 页面没交代.

<!-- page 5 of 23 -->

![图 2 橙色标题栏 "Magistral's system prompt" 下的一段系统提示词原文: 要求先在 think 标签内写草稿式思考, 再写自洽的总结, 用 Markdown 和 LaTeX 排版, 思考和总结都用用户提问的语言, 末尾是 Problem: 和占位符 {problem}](images/p05-figure-2-magistral-s-system-prompt-the-system-prompt.png)

图 2 图片中的提示词原文 (照录):

```text
Magistral's system prompt

A user will ask you to solve a task. You should first draft your thinking process (inner monologue) until you have derived the final answer. Afterwards, write a self-contained summary of your thoughts (i.e. your summary should be succinct but contain all the critical steps you needed to reach the conclusion). You should use Markdown and Latex to format your response. Write both your thoughts and summary in the same language as the task posed by the user.

Your thinking process must follow the template below:
<think>
Your thoughts or/and draft, like working through an exercise on scratch paper. Be as casual and as long as you want until you are confident to generate a correct answer.
</think>

Here, provide a concise summary that reflects your reasoning and presents a clear final answer to the user.

Problem:

{problem}
```

提示词大意: 用户会让你解一个任务. 你应先起草思考过程 (内心独白), 直到得出最终答案. 然后写一段自洽的思路总结 (总结要简洁, 但要包含得出结论所需的全部关键步骤). 用 Markdown 和 Latex 排版回答. 思考和总结都用用户提问所用的语言. 思考过程必须遵循下面的模板: 在 &lt;think&gt; 与 &lt;/think&gt; 之间写你的想法或草稿, 就像在草稿纸上做练习; 想多随意, 写多长都行, 直到有把握给出正确答案. 之后给出一段简洁的总结, 体现你的推理, 并向用户给出清楚的最终答案. 最后是 「Problem:」 和题目占位符 {problem}.

Figure 2: Magistral's system prompt. The system prompt spells out the format and language guidelines for the model. The same system prompt is utilized for both mathematical and coding problems.

图 2: Magistral 的系统提示. 系统提示写明了模型要遵守的格式和语言准则. 数学题和代码题用的是同一份系统提示.

## 3 Infrastructure (基础设施)

In this section, we present our infrastructure for online training. We adopt a distributed RL training system similar to those proposed in several prior works [Espeholt et al., 2018, Hu et al., 2024, Noukhovitch et al., 2024, Sheng et al., 2024, Wu et al., 2025] that coordinates three kinds of workers:

本节介绍在线训练的基础设施. 我们采用的分布式 RL 训练系统和好几篇前人工作 [Espeholt et al., 2018, Hu et al., 2024, Noukhovitch et al., 2024, Sheng et al., 2024, Wu et al., 2025] 提出的相似, 协调三类 worker:

• **Trainers** maintain the main copy of the model weights and perform gradient updates.

• **Generators** perform 'roll-outs', using the latest policy to return completions with logprobabilities from the training prompts.

• **Verifiers** evaluate the completions produced by the generators and return a reward (see Section 2.2 for details).

• **Trainer (训练器)** 保存模型权重的主副本, 执行梯度更新.

• **Generator (生成器)** 做 「roll-out」: 用最新策略对训练 prompt 生成回答, 连同对数概率一起返回.

• **Verifier (验证器)** 评估生成器产出的回答, 返回奖励 (细节见 2.2 节).

**Challenges with distributed RL.** Generators are a significant part of the total compute and the part that's unique to online RL. Their workload is highly heterogeneous and hard to predict as the distribution of sequence lengths is highly skewed and changes over the course of training: the longest completions can take up to 5 times longer than the shortest. One of the main constraints of the system is to introduce no bias on sequence lengths: the distribution of completion lengths must be exactly that of the training data, even though shorter completions finish more quickly. A competing goal is to update the generator weights as soon as possible. We want the generations to be as on-policy as possible, but we also want the generators to operate without waiting for each other or the trainers.

**分布式 RL 的难点.** 生成器占总算力的很大一块, 也是在线 RL 独有的部分. 它的负载差异大, 难以预测, 因为序列长度的分布偏得厉害, 而且在训练中不断变化: 最长的回答可能要花最短回答 5 倍的时间. 系统的一条主要约束是不能在序列长度上引入偏差: 回答长度的分布必须和训练数据完全一致, 尽管短回答完成得更快. 与之相冲突的目标是尽快更新生成器的权重. 我们希望生成尽量 on-policy, 同时又希望生成器不必互相等待, 也不必等训练器.

**Asynchronous generations.** In order to train without any approximation, we could process batches sequentially: start generators on a batch, wait for all sequences to complete, update the model weights for both trainers and generators, and repeat. However, this approach leads to idle generators and low pipeline efficiency due to heterogeneous completion times. Instead, we prioritize efficiency and operate the generators continuously at maximum throughput without ever waiting for the trainers. We constantly gather groups from the generators, verify them, and update the trainers. After these updates, the trainers send the new weights to the generators via NCCL, without discarding the in-flight sequences currently being generated. Broadcasting weights from GPUs to GPUs is crucial as it reduces the time required for a single update to below 5 seconds, even with large models and large world sizes. We illustrate this process in Figure 3.

**异步生成.** 如果想不做任何近似地训练, 可以顺序处理 batch: 让生成器跑一个 batch, 等所有序列完成, 同时更新训练器和生成器的权重, 然后重复. 但各条回答完成时间差别很大, 这样做会让生成器闲着, 流水线效率低. 我们改为优先保证效率: 让生成器始终以最大吞吐连续运行, 从不等训练器. 我们不断从生成器收集组, 验证后更新训练器. 更新完, 训练器通过 NCCL 把新权重发给生成器, 正在生成中的序列不丢弃. GPU 到 GPU 直接广播权重很关键, 即便模型很大, world size 很大, 单次更新也能压到 5 秒以内. 图 3 画出了这个过程.

> **想:** 异步之后, 一条序列最多跨了几个策略版本?
> 第 6 页图 3 画了 $\pi_{i-2}$ 到 $\pi_{i+1}$ 四个版本, 最长的那条序列颜色变了三次 (读图). 第 11 页 6.3 节给了一般说法: 典型序列经历约 $n_{\mathrm{async}}/n_{\mathrm{batch}}$ 个策略, 最终训练把这个比值控制在 2 以内.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>https://www.sympy.org/en/index.html</span></small>

脚注 2: SymPy 官网.

<!-- page 6 of 23 -->

![图 3 在线训练流水线示意: 右上一叠 Generators 向左伸出多条横线表示正在生成的序列, 线段颜色由黄到红表示策略从 π_{i-2}, π_{i-1}, π_i 变到 π_{i+1}, 斜虚线标出每次策略切换; 序列末端的绿点和红点是奖励, 圆圈 2 连到上方的 Verifiers; 圆圈 3 把完成的序列收进虚线框 Step i batch; 右下 Trainers 方块中橙色一层标 π_i, 圆圈 4 标 π_{i+1} = π_i + ∇J 并把权重送回 Generators; 左下图例说明 1. Generation, 2. Scoring, 3. Batching, 4. Weight update, 以及序列起点, 终点, 策略切换, 奖励, 上一批序列的画法](images/p06-figure-3-online-training-pipeline-1-generators.png)

Figure 3: Online training pipeline. 1) Generators continuously output completions to prompts from input data sources. 2) Whenever a completion is finished, it is sent to the appropriate verifier. 3) Each sequence is sent to a different data parallel group using a pre-set permutation until every data parallel group has enough sequences to form a batch. 4) A single gradient step is performed and the trainer and generators are updated. In the generators, weights are replaced mid-generation, which means that in-flight generations continue with a slightly outdated key-value cache, as we do not refresh the cache. Since the model resides on GPUs in both the trainer and the generators, the weights are transferred using NCCL for optimal performance. The model weights are dynamically consolidated to accommodate the different sharding topologies between trainers and generators.

图 3: 在线训练流水线. 1) 生成器持续对输入数据源的 prompt 输出回答. 2) 每完成一条回答, 就送到对应的验证器. 3) 每条序列按预设的排列送到不同的数据并行组, 直到每个数据并行组都凑够一个 batch. 4) 执行一次梯度更新, 同时更新训练器和生成器. 生成器里的权重在生成途中被替换, 这意味着正在进行的生成会带着稍微过时的 key-value cache 继续下去, 因为我们不刷新 cache. 由于训练器和生成器里的模型都在 GPU 上, 权重用 NCCL 传输以求最佳性能. 为适应训练器和生成器不同的分片拓扑, 模型权重会动态合并.

As a solution is generated for a single prompt, it may experience multiple updates to the model weights, reflecting the latest improvements from the trainers. By the time it is fully processed and sent to the trainers, the model weights may have been updated several times, but the latest tokens are always generated on-policy. When updating the model weights, the hidden states previously stored in the key-value cache become slightly outdated because they were computed by previous versions of the model. For performance, we find that recomputing the key-value cache is not necessary, potentially due to off-policy corrections inherent to the loss function [Schulman et al., 2017].

为一个 prompt 生成解答的过程中, 模型权重可能被更新好几次, 带上训练器的最新改进. 等这条解答生成完, 送到训练器时, 权重也许已经更新了几轮, 但最新的 token 总是 on-policy 生成的. 权重更新后, key-value cache 里之前存的隐藏状态会有点过时, 因为它们是旧版本模型算的. 为了性能, 我们发现没必要重算 key-value cache, 可能是因为 loss 函数本身带有 off-policy 修正 [Schulman et al., 2017].

**Trainer optimization.** We define a batch as a fixed number of generated completions, rather than a fixed number of tokens. Generators send each finished completion to a random trainer rank according to a pre-set permutation. A gradient update is performed when each data parallel rank has received enough completions to make a batch. If the trainers are the bottleneck, as is the case in early training when the generations are still short, we accumulate incoming generations into a blocking queue with a fixed size limit that controls off-policy degree. A batch may be partitioned into minibatches to perform several optimization steps (see Section 6.3). Each minibatch has a fixed number of completions but a variable number of tokens, so it is further divided into microbatches of a fixed token size. Since we accumulate the gradient over microbatches, the order of samples does not matter. We take advantage of this property to implement a greedy collation algorithm, sorting the sequences by descending size and trying to fit them one by one into a free microbatch if there is one or starting a new otherwise. This ensures a homogeneous workload across training workers for each minibatch, reducing padding by 19%.

**训练器优化.** 我们把一个 batch 定义为固定条数的生成回答, 而不是固定数量的 token. 生成器按预设排列把每条完成的回答发给一个随机的训练器 rank. 当每个数据并行 rank 都收够一个 batch 的回答时, 执行一次梯度更新. 如果瓶颈在训练器 (训练早期生成还很短时就是这样), 我们把新到的生成放进一个有固定容量上限的阻塞队列, 这个上限控制 off-policy 的程度. 一个 batch 可以拆成几个 minibatch, 做几步优化 (见 6.3 节). 每个 minibatch 的回答条数固定, token 数却不固定, 所以再切成 token 数固定的 microbatch. 因为梯度在 microbatch 上累加, 样本顺序无关紧要. 我们利用这一点实现了一个贪心拼装算法: 按长度从大到小排序, 逐条尝试塞进有空位的 microbatch, 塞不下就新开一个. 这样每个 minibatch 在各训练 worker 之间负载均匀, padding 减少了 19%.

> **问:** padding 减少 19%, 是和什么比?
> 页面没给基线, 也没给绝对的 padding 比例. 从上下文看, 对照可能是不排序直接按到达顺序装 microbatch. 第 6 页图 3 的第 3 步只画了 Step i batch 的组成, 没有画 microbatch 的拼装.

## 4 Data curation (数据整理)

We limit ourselves to problems with verifiable solutions; we use mathematical problems whose solution is a numerical answer or expression, and code problems with associated tests. We apply extensive filtering, which we describe here.

我们只用解答可验证的题: 数学题的解是数值答案或表达式, 代码题带有配套测试. 我们做了大量过滤, 下面说明.

<!-- page 7 of 23 -->

### 4.1 Math (数学)

**Format filtering.** We started with a large but noisy problem set of around 700k samples. We first perform comprehensive pre-processing and filtering of the data to ensure all the problems are complete and that the final answers were accurate and verifiable with a rule-based system. Particularly, we filter proof-based and multi-part problems for which it is difficult to verify correctness. Furthermore, we reformulate multiple-choice problems into statement-based problems for more robust verification and increased difficulty.

**格式过滤.** 起点是一个量大但噪声多的题库, 约 70 万条. 我们先对数据做全面的预处理和过滤, 确保题目完整, 最终答案准确, 能被基于规则的系统验证. 特别地, 我们滤掉了难以验证对错的证明题和多问题. 此外, 我们把选择题改写成陈述式题目, 让验证更可靠, 难度也更高.

**Difficulty filtering.** We implemented a two-stage filtering pipeline to curate a dataset of problems at a 'goldilocks' difficulty level, neither too easy nor too hard for the model to learn from. First, we performed an initial difficulty assessment using Mistral Large 2 [MistralAI, 2024], by sampling 16 solutions for each problem and removing the ones that are either never solved or solved with a high success rate. This initial, curated set of problems was then used to train a 24B model via our online RL pipeline, resulting in a small but capable checkpoint which we use solely for grading.

**难度过滤.** 我们搭了一条两阶段过滤流水线, 挑出难度 「恰到好处」 的题, 对模型来说既不太容易, 也不太难. 第一阶段用 Mistral Large 2 [MistralAI, 2024] 做初步难度评估: 每题采 16 个解, 把一次也没解出和成功率很高的题去掉. 然后用这批初筛的题, 通过我们的在线 RL 流水线训练一个 24B 模型, 得到一个小而能干的 checkpoint, 它只用来给题目评级.

In the second stage, this stronger, RL-trained model was used to re-grade the entire original dataset. We again sampled 16 responses for each problem, filtering out the easiest and the still-unsolved problems. We then further filter out potentially incorrect problems where a majority of samples have the same final answer but disagree with the "ground-truth" answer. This is because when the model consistently reaches a consensus that contradicts the reference solution, the problems themselves are more likely to have wrong ground-truth answers.

第二阶段用这个经 RL 训练, 更强的模型重新给整个原始数据集评级. 同样每题采 16 个回答, 滤掉最容易的和仍然解不出的题. 接着再滤掉可能有错的题: 多数样本给出同一个最终答案, 却和 「标准答案」 不一致. 原因是, 当模型一致地达成与参考解相矛盾的共识时, 更可能是题目本身的标准答案错了.

> **核对:** 两阶段的阈值和 24B 评级模型的来历, 页面给了吗?
> 两阶段都是每题采 16 个, 但 「high success rate」 和 「easiest」 的具体门槛没印, 「majority」 是几成也没印. 那个只用来评级的 24B 模型从哪个 checkpoint 起步, 本页没说. 表 1 只给了难度过滤后的总数 38k, 没拆成两个阶段各剩多少.

This two-stage methodology was crucial because a single pass with the initial, weaker Mistral Large 2 model would have been insufficient. Its reasoning capabilities would likely have caused it to discard many genuinely difficult problems by incorrectly classifying them as unsolvable. By using a stronger, RL-trained model for a second pass, we ensured that these valuable and challenging training examples were accurately assessed and retained.

两阶段做法很关键, 因为只用最初那个较弱的 Mistral Large 2 过一遍是不够的. 以它的推理能力, 很可能把许多真正难的题误判为无解而丢掉. 用经 RL 训练, 更强的模型再过一遍, 就保证这些有价值又有挑战性的训练样本被准确评估并留下来.

Table 1: Number of math training samples after different filtering stages.

表 1: 各过滤阶段之后的数学训练样本数.

| Initial data | w/ Format filtering | w/ Difficulty filtering |
| --- | --- | --- |
| 699k | 501k | 38k |

表头依次是: 初始数据, 经格式过滤, 经难度过滤.

> **看表:** 表 1 三步各留下多少?
> 699k 到 501k, 格式过滤留下约 71.7% (估算); 501k 到 38k, 难度过滤只留约 7.6% (估算); 最终 38k 占初始的约 5.4% (估算). 正文说起点 「around 700k」, 和 699k 一致. 砍得最狠的是难度过滤.

### 4.2 Code (代码)

We gathered code contest data from various sources. Each data point includes a problem statement and, when available, correct solutions and related tests. For the training process, we want problem statements and a large number of correct tests per problem. In order to achieve this, we first remove any problems without solutions and without enough tests. Each solution is then executed on all available tests, and we discard tests with insufficient agreement. For tests with sufficient agreement but where no solution succeeded, we assume that the test is incorrect and update it to reflect the most common result among the solutions' outputs. In cases where code problems lack tests, we generate additional tests and subject them to the same evaluation process.

我们从多个来源收集编程竞赛数据. 每条数据含题面, 有的还附带正确解和相关测试. 训练需要的是题面, 以及每题大量正确的测试. 为此, 先去掉没有解, 测试又不够的题. 再把每个解在所有可用测试上跑一遍, 丢掉一致性不足的测试. 对一致性足够却没有任何解通过的测试, 我们认为测试本身有错, 把它改成各个解输出中最常见的结果. 缺测试的代码题, 我们另外生成测试, 并走同样的评估流程.

Finally, where applicable, problem statements are duplicated to require code in Python or C++, two commonly used languages in competitive programming. This process resulted in a dataset of 35k code problems.

最后, 在适用的情况下, 把题面复制一份, 分别要求用 Python 或 C++ 作答, 这是竞赛编程最常用的两种语言. 这一流程最终得到 35k 道代码题.

> **拆开:** 35k 是去重后的题数, 还是复制成两种语言以后的条数?
> 按句子顺序, 35k 是 「This process」 的结果, 应已包含复制. 独立题目有多少没印, 最多就是 35k, 最少约 17.5k (估算, 假设每题都复制). 数学 38k (表 1) 加代码 35k, RL 数据合计约 73k 条 (估算).

## 5 Experiment and results (实验与结果)

In this section we present the Magistral models. Our goal is to answer two questions: (i) how far can one get with pure reinforcement learning on a large base model? (ii) given a strong teacher model, how can one achieve the strongest possible lightweight model? To this end, we trained Magistral Medium, on top of Mistral Medium 3 [MistralAI, 2025] with pure RL; and Magistral Small, which began with SFT traces derived from Magistral Medium.

本节介绍 Magistral 模型. 我们想回答两个问题: (i) 在一个大的基座模型上只用强化学习, 能走多远? (ii) 有了强 teacher 模型, 怎样得到尽可能强的轻量模型? 为此, 我们在 Mistral Medium 3 [MistralAI, 2025] 上用纯 RL 训练了 Magistral Medium; Magistral Small 则从 Magistral Medium 生成的 SFT 轨迹起步.

<!-- page 8 of 23 -->

![图 4 三栏流程图: 左栏 Data Filtering, Math 一行是 Format filtering (文件图标) 和 Difficulty filtering (一排由浅到深, 逐渐变少的数据库图标), 虚线下 Code 一行是 Test cases success filtering (笔记本电脑图标); 中栏 Training overview, 上行 Mistral Medium 3 经 RL 菱形到 Magistral Medium, 由它引出 Magistral Medium traces 数据库, 下行 Mistral Small 3 经 SFT 菱形, 再经 RL 菱形到 Magistral Small; 右栏 RL stages, 一个 RL 菱形向左引出 Performance plateaus 到 More challenging data, 向右引出 Length plateaus 到 Increase completion length, 两条虚线箭头回到 RL](images/p08-figure-4-overview-of-the-filtering-training-and-rl.png)

Figure 4: Overview of the filtering, training and RL stages discussed in the paper. We do RL over Mistral Medium 3 to get Magistral Medium. We use this model to generate answers for a large set of diverse prompts. We use these generated traces to finetune Mistral Small 3 and then perform RL to get Magistral Small.

图 4: 本文讨论的过滤, 训练和 RL 各阶段总览. 在 Mistral Medium 3 上做 RL 得到 Magistral Medium. 用这个模型对大量多样的 prompt 生成回答. 用这些生成的轨迹微调 Mistral Small 3, 再做 RL, 得到 Magistral Small.

### 5.1 Evaluation benchmarks and baselines (评测基准与基线)

We report results on benchmarks that assess capabilities in the fields of mathematics, coding, and STEM. For math, we provide results on the American Invitational Mathematics Examination benchmarks (AIME'24, AIME'25), and on the MATH dataset [Hendrycks et al., 2021]. In coding, we include LiveCodeBench (both v5 and v6 versions) [Jain et al., 2024], and Aider Polyglot [Gauthier, 2024]. For STEM, we report results based on the GPQA dataset [Rein et al., 2024]. Additionally, we also report our results on the text-only questions from Humanity's Last Exam [Phan et al., 2025] which comprises of 2,500 questions across dozens of subjects, including mathematics, humanities, and natural sciences. For all evaluation tasks, we set the temperature to 0.7 and use a top-p of 1.0 for Math evals and GPQA, and 0.95 for coding tasks. The maximum token length is set to 40k for AIME and LiveCodeBench, and 32k for all other evaluations.

我们报告数学, 代码和 STEM 三个领域的基准结果. 数学用美国数学邀请赛基准 (AIME'24, AIME'25) 和 MATH 数据集 [Hendrycks et al., 2021]. 代码用 LiveCodeBench (v5 和 v6 两个版本) [Jain et al., 2024] 和 Aider Polyglot [Gauthier, 2024]. STEM 用 GPQA 数据集 [Rein et al., 2024]. 此外, 我们还报告 Humanity's Last Exam [Phan et al., 2025] 中纯文本题的结果, 这个基准共 2,500 题, 覆盖数学, 人文, 自然科学等几十个学科. 所有评测任务的温度都设为 0.7; top-p 在数学评测和 GPQA 上取 1.0, 代码任务取 0.95. 最大 token 长度在 AIME 和 LiveCodeBench 上设为 40k, 其余评测设为 32k.

> **确认:** 评测的采样设置和训练一样吗?
> 不一样. 评测温度 0.7, Magistral Small 的 RL 采样温度是 1.0 (第 9 页). 评测最大长度 40k 或 32k, 训练里不受惩罚的最大长度 $l_{\max}-l_{\mathrm{cache}}$ 最后是 32k (第 8 页和第 9 页), 而 $l_{\max}$ 本身没有印出. HLE 共 2,500 题, 其中纯文本题有多少, 本页没给.

For baselines we include results from [DeepSeek-AI et al., 2025], which reports comparable datapoints for training with RL at scale, both with and without SFT on traces from a reasoning model.

基线取自 [DeepSeek-AI et al., 2025], 它报告了大规模 RL 训练的可比数据点, 既有先在推理模型轨迹上做 SFT 的, 也有不做的.

### 5.2 Magistral Medium – reasoning RL from scratch (Magistral Medium: 从零开始的推理 RL)

Here our goal is to evaluate the quality of our RL stack by training a model without any 'cold start' (i.e priming for reasoning by distillation of reasoning traces). We used Mistral Medium 3 Instruct [MistralAI, 2025] as the starting checkpoint for this run. Training was done in multiple stages with distinct hyper-parameters. Particularly, the stages were designed to ensure the following criteria were always satisfied:

这里的目标是检验我们 RL 技术栈的质量: 训练一个不带任何 「冷启动」 的模型 (冷启动即先蒸馏推理轨迹, 为推理打底). 这次运行的起始 checkpoint 是 Mistral Medium 3 Instruct [MistralAI, 2025]. 训练分多个阶段, 各阶段超参数不同. 这些阶段的设计是为了始终满足以下几条:

1. **Dataset is not too easy.** As the model performance increases, we increase the difficulty of the data. Harder data splits are constructed by including more complicated data (which were filtered out in earlier stages) or removing completely solved problems from the data.

2. **Generation length does not stop growing.** To prevent stagnation in generation length, we increase both maximal allowed completion length and maximal completion length $l _ { \mathrm { m a x } } - l _ { \mathrm { c a c h e } }$ not punished by length penalty (c.f. Section 2.2.3). We increased $l _ { \mathrm { m a x } } - l _ { \mathrm { c a c h e } }$ twice as 16k → 24k and 24k → 32k.

3. **KV-cache memory burden is not too large.** As generation length increases, the memory usage associated with the KV cache increases. To address this, we scale down the total number of concurrent requests running $n _ { \mathrm { a s y n c } } ,$ the batch size $n _ { \mathrm { b a t c h } }$ , and the minibatch size $n _ { \mathrm { m i n i b a t c h } }$ . The impact of batch size is discussed in Section 6.3. During training we decreased batch size twice as 8k → 4k and 4k → 2k.

1. **数据集不能太容易.** 随着模型表现提高, 我们提高数据难度. 更难的数据划分有两种构造方式: 加入更复杂的数据 (早期阶段被滤掉的), 或者把已经完全解出的题从数据中去掉.

2. **生成长度不能停止增长.** 为防止生成长度停滞, 我们同时提高允许的最大生成长度, 以及不受长度惩罚的最大生成长度 $l _ { \mathrm { m a x } } - l _ { \mathrm { c a c h e } }$ (见 2.2.3 节). 我们把 $l _ { \mathrm { m a x } } - l _ { \mathrm { c a c h e } }$ 提高了两次: 16k → 24k, 24k → 32k.

3. **KV cache 的显存负担不能太大.** 生成长度增加, KV cache 占的显存也随之增加. 为此我们调小同时运行的请求总数 $n _ { \mathrm { a s y n c } }$, batch 大小 $n _ { \mathrm { b a t c h } }$ 和 minibatch 大小 $n _ { \mathrm { m i n i b a t c h } }$. batch 大小的影响在 6.3 节讨论. 训练中我们把 batch 大小降了两次: 8k → 4k, 4k → 2k.

> **回看:** batch 一路降到 2k, 和第 11 页 「$n_{\mathrm{async}}/n_{\mathrm{batch}} \leq 2$」 的规则怎么对上?
> batch 到 2k 时, 按那条规则 $n_{\mathrm{async}}$ 不能超过 4k (估算). 本段说 $n_{\mathrm{async}}$ 也一起调小, 但 Magistral Medium 各阶段的 $n_{\mathrm{async}}$ 具体是多少没印. 第 12 页图 6 的 3B 实验里 $n_{\mathrm{async}}$ 固定为 4096. 阶段数, 每阶段步数和学习率也都没有给.

Table 2 shows the results of Magistral Medium trained with pure RL, compared against analogous experiments from [DeepSeek-AI et al., 2025]. We find our RL pipeline alone yields a nearly 50% accuracy increase in AIME '24 (pass@1), and 30% on LiveCodeBench (v5).

表 2 给出纯 RL 训练的 Magistral Medium 的结果, 并和 [DeepSeek-AI et al., 2025] 的同类实验对比. 我们发现, 仅靠我们的 RL 流水线, AIME '24 (pass@1) 准确率提升接近 50%, LiveCodeBench (v5) 提升 30%.

### 5.3 Magistral Small – RL on top of reasoning SFT bootstrapping (Magistral Small: 在推理 SFT 打底之上做 RL)

Given a strong 'teacher' model in Magistral Medium, we next explore how one can train the strongest possible student model. To do so, we train Magistral Small, which is 'cold-started' with SFT traces from Magistral Medium.

有了 Magistral Medium 这个强 「teacher」, 我们接着探索怎样训出尽可能强的学生模型. 为此我们训练 Magistral Small, 它用 Magistral Medium 的 SFT 轨迹做 「冷启动」.

<!-- page 9 of 23 -->

In contrast with pure RL training (which benefits from a small set of extremely clean and difficult training points, Section 4), we find diversity of prompts to be important for the reasoning cold-start. We begin by extracting traces with correct answers from the RL training of Magistral Medium, excluding those from early steps with short CoTs. We also maintain a mixed difficulty level of the problems by limiting number of generations per problem to avoid biasing the collected traces towards easier problems and also upsampling problems with lower pass rates.

纯 RL 训练受益于一小批极干净, 极难的训练数据 (第 4 节); 与此不同, 我们发现推理冷启动看重的是 prompt 的多样性. 我们先从 Magistral Medium 的 RL 训练过程中抽出答案正确的轨迹, 排除早期步骤里 CoT 很短的那些. 我们还保持题目难度的混合: 限制每题的生成条数, 免得收集到的轨迹偏向容易的题, 同时对通过率低的题做上采样.

We augment this SFT cold-start data by generating responses from our Magistral Medium on a large set of diverse prompts, sourced from OpenThoughts [Guha et al., 2025] and the code subset of OpenR1 [Hugging Face, 2025, Penedo et al., 2025]. We perform additional filtering on top and kept a subset of the prompts. This gives us a reasoning dataset with mixed difficulty. We also include 10% of datapoints for general instruction tuning in order to preserve non-reasoning capabilities. We finetuned Mistral Small 3 Instruct (a 24-billion parameter model) for 4 epochs, and chose the best checkpoint on AIME'24 as the initial checkpoint for the following RL stage.

我们再用 Magistral Medium 对一大批多样的 prompt 生成回答, 扩充这份 SFT 冷启动数据; prompt 来自 OpenThoughts [Guha et al., 2025] 和 OpenR1 [Hugging Face, 2025, Penedo et al., 2025] 的代码子集. 在此之上我们又做了过滤, 只保留一部分 prompt. 这样得到一个难度混合的推理数据集. 我们还加入 10% 的通用指令微调数据, 以保住非推理能力. 我们对 Mistral Small 3 Instruct (一个 240 亿参数的模型) 微调了 4 个 epoch, 选 AIME'24 上最好的 checkpoint 作为接下来 RL 阶段的起点.

> **停一下:** SFT 冷启动数据一共多少条?
> 本页没给总量, 只给了 10% 的通用指令数据比例和 4 个 epoch. 用 AIME'24 选 checkpoint, 而第 10 页表 3 又拿 AIME'24 报结果, 选模和报分用的是同一个基准. 作为参照, 第 16 页第 8 节的 OSS 轨迹实验印了约 1.3M 条生成, 那是另一组实验.

We then trained this SFT checkpoint with RL using a batch size of 2048 sequences, and a maximum non-penalized completion length $l _ { \mathrm { m a x } } - l _ { \mathrm { c a c h e } }$ of 32k. We used a sampling temperature of 1.0 for our generations, as it provided the best balance between avoiding the lack of diversity seen at lower temperatures and the incoherent outputs generated at higher temperatures. We use a $\varepsilon _ { \mathrm { h i g h } }$ of 0.3, to encourage exploration, as the cold-started model yielded responses with far lower entropy.

然后我们用 RL 训练这个 SFT checkpoint, batch 大小为 2048 条序列, 不受惩罚的最大生成长度 $l _ { \mathrm { m a x } } - l _ { \mathrm { c a c h e } }$ 为 32k. 生成的采样温度取 1.0, 它在两头之间取得了最好的平衡: 温度低时缺乏多样性, 温度高时输出不连贯. 我们用 0.3 的 $\varepsilon _ { \mathrm { h i g h } }$ 鼓励探索, 因为冷启动后的模型给出的回答熵低得多.

Table 3 shows the performance of the 24B model trained under three different paradigms: with SFT alone; with RL alone; and with RL on top of the cold-start checkpoint. Here, contrary to findings from [DeepSeek-AI et al., 2025], we find one can get substantial boosts with RL even on a smaller base model, over and above distillation from the larger teacher. This underscores the strength of the RL stack introduced in this work.

表 3 给出 24B 模型在三种训练范式下的表现: 只做 SFT; 只做 RL; 在冷启动 checkpoint 上再做 RL. 与 [DeepSeek-AI et al., 2025] 的结论相反, 我们发现即便在较小的基座模型上, RL 也能带来可观提升, 而且是在大 teacher 蒸馏的基础上再往上涨. 这说明了本文 RL 技术栈的实力.

Table 2: Results of Magistral Medium trained solely with RL. To reduce variance, we compute the average over 64 runs for AIME (shown as pass@1/maj@64) and over 16 runs for LiveCodeBench. Humanity's Last Exam is evaluated only for the text subset.

表 2: 只用 RL 训练的 Magistral Medium 的结果. 为降低方差, AIME 取 64 次运行的平均 (写成 pass@1/maj@64), LiveCodeBench 取 16 次运行的平均. Humanity's Last Exam 只评纯文本子集.

| Task | Mistral Medium 3 | Magistral Medium | DeepSeek-v3 | DeepSeek-R1-Zero | DeepSeek-R1 |
| --- | --- | --- | --- | --- | --- |
| Reasoning SFT before RL | - | ✗ | - | ✗ | ✓ |
| AIME'24 | 26.8 / 43.4 | 73.6 / 90.0 | 39.2 | 71.0 | 79.8 |
| AIME'25 | 21.2 / 30.0 | 64.9 / 83.3 | 28.8 | - | 70.0 |
| MATH-500 | 91.0 | 94.3 | 90.2 | 95.9 | 97.3 |
| GPQA | 59.6 | 70.8 | 59.1 | 73.3 | 71.5 |
| LiveCodeBench (v5) | 29.1 | 59.4 | 36.2 | 50.0 | 65.9 |
| Aider Polyglot | 28.9 | 47.1 | 49.6 | - | 53.3 |
| LiveCodeBench (v6) | 30.0 | 50.3 | - | - | - |
| Humanity's Last Exam | 4.4 | 9.0 | - | - | 8.6 |

表 2 第一行 「Reasoning SFT before RL」 表示 RL 之前有没有做推理 SFT: Magistral Medium 和 DeepSeek-R1-Zero 没做, DeepSeek-R1 做了; 两个基座模型不适用.

> **再看:** Magistral Medium 和 DeepSeek-R1-Zero 同样没做推理 SFT, 谁涨得多?
> 表 2 AIME'24: Mistral Medium 3 从 26.8 到 73.6, 涨 46.8 分 (估算); DeepSeek-v3 从 39.2 到 R1-Zero 的 71.0, 涨 31.8 分 (估算). 起点更低, 终点更高. 但 MATH-500 (94.3 对 95.9) 和 GPQA (70.8 对 73.3) 上 R1-Zero 更高, LiveCodeBench (v5) 上 Magistral Medium 更高 (59.4 对 50.0).

> **对一下:** 纯 RL 之后, Magistral Medium 有没有哪项还不如 DeepSeek-v3?
> 有. 表 2 的 Aider Polyglot: Magistral Medium 47.1, DeepSeek-v3 49.6, 这个没做推理训练的基座反而高 2.5 分 (估算). 不过起点差得更多: Mistral Medium 3 只有 28.9. HLE 上 Magistral Medium 的 9.0 略高于 DeepSeek-R1 的 8.6.

### 5.4 Multilingual benchmarks (多语言基准)

To evaluate Magistral's multilingual capabilities, we interacted with Magistral Medium in multiple languages to check that it could reason and answer in the user's language. We also tested Magistral Medium on multilingual (French, Spanish, German, Italian, Russian, and Chinese) versions of the AIME 2024 benchmark. These multilingual versions were created by translating the questions from English into each of the languages. The results are presented in Table 4. We see that the model performs 4.3-9.9% lower on multilingual versions compared to English, which corresponds to 1-3 questions on the actual AIME test, possibly because we constrained the language of reasoning. This degradation is roughly similar to that of the base model. Note that on the multilingual benchmarks, all of the reasoning and the final response are conducted in the input language (i.e., not English).

为评估 Magistral 的多语言能力, 我们用多种语言和 Magistral Medium 对话, 检查它能否用用户的语言推理和作答. 我们还在 AIME 2024 基准的多语言版本 (法语, 西班牙语, 德语, 意大利语, 俄语, 中文) 上测试了 Magistral Medium. 这些版本是把英文题目逐一翻译成各语言得到的. 结果见表 4. 模型在多语言版本上比英文低 4.3 到 9.9 个百分点, 相当于真实 AIME 考试里的 1 到 3 道题, 原因可能是我们约束了推理所用的语言. 这个降幅和基座模型大致相当. 注意, 在多语言基准上, 推理和最终回答全部用输入语言 (即非英文) 进行.

<!-- page 10 of 23 -->

Table 3: Performance of Magistral Small compared with different training setups across various benchmarks. We report the performance of three distinct 24B models: Mistral Small 24B fine-tuned on reasoning traces from Magistral Medium (SFT), Mistral Small 24B trained from scratch with RL (RL only), and Mistral Small 24B fine-tuned on Magistral Medium traces and subsequently enhanced with RL (SFT + RL) which is the final Magistral Small. We observe that the combination of fine-tuning on reasoning traces with RL leads to the best performance. For the evaluation of Humanity's Last Exam, only the text subset was considered.

表 3: Magistral Small 与不同训练设置在各基准上的对比. 我们报告三个不同的 24B 模型: 在 Magistral Medium 推理轨迹上微调的 Mistral Small 24B (SFT), 从零开始只用 RL 训练的 Mistral Small 24B (RL only), 以及先在 Magistral Medium 轨迹上微调, 再用 RL 增强的 Mistral Small 24B (SFT + RL), 后者就是最终的 Magistral Small. 我们观察到, 推理轨迹微调加 RL 的组合效果最好. Humanity's Last Exam 只评纯文本子集.

| Task | SFT | RL-only | SFT + RL (Magistral Small) |
| --- | --- | --- | --- |
| AIME'24<sub>pass</sub>@1 | 65.4 | 65.8 | 70.7 |
| AIME'24<sub>maj</sub>@64 | 90.0 | 86.7 | 83.3 |
| AIME'25<sub>pass</sub>@1 | 55.6 | 51.9 | 62.8 |
| AIME'25<sub>maj</sub>@64 | 76.7 | 66.7 | 76.7 |
| MATH-500 | 93.2 | 95.4 | 95.9 |
| GPQA | 63.4 | 68.8 | 68.2 |
| LiveCodeBench (v5) | 52.2 | 46.4 | 55.8 |
| LiveCodeBench (v6) | 44.6 | 42.4 | 47.4 |
| Humanity's Last Exam | 5.3 | 6.1 | 6.4 |

> **想:** 表注说 SFT + RL 「leads to the best performance」, 每一行都成立吗?
> 不是. 表 3 AIME'24 maj@64: SFT 90.0, RL-only 86.7, SFT + RL 83.3, 最终模型反而最低; AIME'25 maj@64 上 SFT 和 SFT + RL 同为 76.7; GPQA 上 RL-only 的 68.8 略高于 SFT + RL 的 68.2. pass@1 各行里 SFT + RL 都最高.

Table 4: Magistral Medium's pass@1 performance on multilingual versions of the AIME 2024 benchmark.

表 4: Magistral Medium 在 AIME 2024 多语言版本上的 pass@1 表现.

| Language | English | French | Spanish | German | Italian | Russian | Chinese |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AIME'24 (pass@1) | 73.6 | 68.5 | 69.3 | 66.8 | 66.7 | 65.0 | 63.7 |

表头依次是: 语言, 英语, 法语, 西班牙语, 德语, 意大利语, 俄语, 中文.

> **问:** 「4.3-9.9% lower」 和 「1-3 questions」 按表 4 算得上吗?
> 逐项差: 法语 5.1, 西班牙语 4.3, 德语 6.8, 意大利语 6.9, 俄语 8.6, 中文 9.9 (估算), 最小最大正好是 4.3 和 9.9 个百分点. AIME 一套 30 题, 一题约 3.33 分, 4.3 到 9.9 分约 1.3 到 3.0 题 (估算), 对得上. 正文说降幅 「roughly similar to that of the base model」, 但基座模型的多语言分数全篇没印.

## 6 Ablations (消融)

In this section, we tweak parameters of the training process to investigate what happens when RL is performed on only one modality, compare RL to the distillation SFT baseline, and shed light on two training choices we had to reckon with, batch and minibatch size, and advantage normalization.

本节调整训练过程的参数, 研究只在一个领域上做 RL 会怎样, 把 RL 和蒸馏 SFT 基线相比, 并说明我们不得不权衡的两个训练选择: batch 和 minibatch 大小, 以及优势归一化.

### 6.1 Cross-domain generalization (跨领域泛化)

We investigate the ability of our model to generalize across domains by training on one domain (math or code) and evaluating on the other. Specifically, we conduct two experiments on the 24B model: one where the model is trained exclusively on math data and evaluated on both math and code, and another where it is trained only on code and evaluated similarly. As shown in Table 5, the model demonstrates strong performance to out-of-domain tasks, showcasing the generalization ability of RL.

我们在一个领域 (数学或代码) 上训练, 在另一个领域上评估, 以此考察模型的跨领域泛化能力. 具体做了两组 24B 模型的实验: 一组只用数学数据训练, 在数学和代码上都评估; 另一组只用代码训练, 同样评估. 如表 5 所示, 模型在领域外任务上表现很强, 体现了 RL 的泛化能力.

### 6.2 Distillation vs. RL for small models (小模型上的蒸馏与 RL)

Previous works [DeepSeek-AI et al., 2025] have observed that smaller models relying solely on RL may not be able to achieve performance comparable to those distilled from larger reasoning models. However, our findings contradict this observation: we achieved strong results even with pure RL on top of Mistral Small 3.

前人工作 [DeepSeek-AI et al., 2025] 观察到, 只靠 RL 的小模型可能达不到从大推理模型蒸馏出的模型的水平. 我们的发现与此相反: 即便在 Mistral Small 3 上只做纯 RL, 也拿到了很强的结果.

Table 5: Cross-domain generalization during math-only and code-only RL for a 24B model

表 5: 24B 模型只用数学或只用代码做 RL 时的跨领域泛化

| Model | AIME'24 | LiveCodeBench v5 |
| --- | --- | --- |
| Starting Checkpoint | 32.2 | 22.7 |
| RL (Math only) | 62.5 | 38.3 (+15.6) |
| RL (Code only) | 49.7 (+17.5) | 42.7 |

表 5 各行: 起始 checkpoint, 只用数学做 RL, 只用代码做 RL. 括号里的增量只标在领域外那一列.

> **核对:** 表 5 的增量算得对吗, 起始 checkpoint 是谁?
> 38.3 - 22.7 = 15.6, 49.7 - 32.2 = 17.5, 都对. 没标出的领域内增量: 数学 RL 在 AIME'24 上涨 30.3, 代码 RL 在 LiveCodeBench v5 上涨 20.0 (估算). 起始 checkpoint 只说是 24B 模型, 没说是哪个版本; 它的 AIME'24 是 32.2, 而表 3 的 RL-only 做到了 65.8, 两者的数据和步数显然不同.

<!-- page 11 of 23 -->

As shown in Figure 5, our Mistral Small 3 with pure RL achieves similar performance on AIME'24 as the distilled version. It even outperforms the distilled version on MATH and GPQA, but has slightly lower performance on code benchmarks such as LiveCodeBench. These results suggest that the benefits of RL are not exclusive to larger base models and hold equally well for smaller models. Furthermore, our findings indicate that the RL on top of the distilled checkpoint can yield even better performance, leading to over 5 points gain across various benchmarks.

如图 5 所示, 纯 RL 的 Mistral Small 3 在 AIME'24 上和蒸馏版表现相近. 它在 MATH 和 GPQA 上甚至超过蒸馏版, 但在 LiveCodeBench 这类代码基准上略低. 这些结果说明 RL 的好处并不只属于大的基座模型, 对小模型同样成立. 此外, 我们的结果表明, 在蒸馏 checkpoint 上再做 RL 效果更好, 在多个基准上带来超过 5 分的提升.

> **看表:** 「over 5 points gain across various benchmarks」 按表 3 逐项看呢?
> 表 3 从 SFT 到 SFT + RL: AIME'24 +5.3, AIME'25 +7.2, MATH-500 +2.7, GPQA +4.8, LiveCodeBench v5 +3.6, v6 +2.8, HLE +1.1 (估算). 超过 5 分的只有两项 AIME pass@1. 另外图 5 只画了 AIME-24, AIME-25, GPQA Diamond, LiveCodeBench (v5) 四项, 正文说的 「MATH」 不在图 5 里, 要看表 3 (95.4 对 93.2).

![图 5 分组柱状图, 纵轴 Accuracy (%) 从 40 起, 四组基准 AIME-24, AIME-25, GPQA Diamond, LiveCodeBench (v5), 每组三根柱: RL only (最浅), SFT on Magistral Medium Traces (中), SFT on Magistral Medium Traces + RL (Magistral Small) (最深). AIME-24: 65.8, 65.4, 70.7; AIME-25: 51.9, 55.6, 62.8; GPQA Diamond: 68.8, 63.4, 68.2; LiveCodeBench (v5): 46.4, 52.2, 55.8](images/p11-figure-5-performance-of-magistral-small-compared-with.png)

Figure 5: Performance of Magistral Small compared with different training setups on various benchmarks. We report the performance of three distinct 24B models: Mistral Small 24B trained from scratch with RL (RL only), Mistral Small 24B fine-tuned on reasoning traces from Magistral Medium, and Mistral Small 24B fine-tuned on Magistral Medium traces and subsequently enhanced with RL, which is the final Magistral Small. We observe that the combination of fine-tuning on reasoning traces with RL leads to the best performance.

图 5: Magistral Small 与不同训练设置在各基准上的对比. 我们报告三个不同的 24B 模型: 从零开始只用 RL 训练的 Mistral Small 24B (RL only), 在 Magistral Medium 推理轨迹上微调的 Mistral Small 24B, 以及先在 Magistral Medium 轨迹上微调, 再用 RL 增强的 Mistral Small 24B, 后者就是最终的 Magistral Small. 我们观察到, 推理轨迹微调加 RL 的组合效果最好.

### 6.3 Batch and minibatch size (batch 与 minibatch 大小)

Reinforcement learning (RL) algorithms like PPO or GRPO introduce two distinct batch scales. The batch size, denoted as $n _ { \mathrm { b a t c h } } ,$ refers to the number of sequences collected before updating the generator's weights. The minibatch size, $n _ { \mathrm { m i n i b a t c h } } ,$ , indicates the number of sequences used to compute the gradient and perform a single optimization step. It is important to note that $n _ { \mathrm { m i n i b a t c h } }$ must divide $n _ { \mathrm { b a t c h } }$ Additionally, in an asynchronous RL pipeline, a third scale is introduced: the number of concurrent sequences, $n _ { \mathrm { a s y n c } }$ , which represents the number of sequences being generated in parallel. If the number of concurrently generated sequences $n _ { \mathrm { a s y n c } }$ is much larger than the batch size $n _ { \mathrm { b a t c h } } ,$ a typical sequence was generated with $n _ { \mathrm { a s y n c } } / n _ { \mathrm { b a t c h } }$ different policies and could be too off-policy. The effect becomes worse as we do more than one minibatch update per one batch.

PPO, GRPO 这类强化学习 (RL) 算法有两个不同的 batch 尺度. batch 大小记作 $n _ { \mathrm { b a t c h } }$, 指更新生成器权重之前收集的序列数. minibatch 大小 $n _ { \mathrm { m i n i b a t c h } }$ 指计算梯度, 执行一步优化所用的序列数. 注意 $n _ { \mathrm { m i n i b a t c h } }$ 必须整除 $n _ { \mathrm { b a t c h } }$. 此外, 异步 RL 流水线还引入第三个尺度: 并发序列数 $n _ { \mathrm { a s y n c } }$, 即同时在生成的序列条数. 如果并发生成的序列数 $n _ { \mathrm { a s y n c } }$ 远大于 batch 大小 $n _ { \mathrm { b a t c h } }$, 一条典型序列会经历 $n _ { \mathrm { a s y n c } } / n _ { \mathrm { b a t c h } }$ 个不同的策略, 可能过于 off-policy. 如果每个 batch 做不止一次 minibatch 更新, 这个影响会更糟.

To test this hypothesis we prepared a strong 3B model using SFT starting from Ministral 3B, and then trained it using GRPO on math-only data with a constant learning rate, a fixed $n _ { \mathrm { a s y n c } } = 4 0 9 6$ and different values of $n _ { \mathrm { b a t c h } }$ and $n _ { \mathrm { m i n i b a t c h } }$ in {1024, 2048, 4096, 8192}.

为验证这个假设, 我们从 Ministral 3B 出发, 用 SFT 准备了一个较强的 3B 模型, 然后只用数学数据以 GRPO 训练它: 学习率恒定, $n _ { \mathrm { a s y n c } }$ 固定为 4096, $n _ { \mathrm { b a t c h } }$ 和 $n _ { \mathrm { m i n i b a t c h } }$ 在 {1024, 2048, 4096, 8192} 中取不同的值.

We observe that as long as we keep $n _ { \mathrm { b a t c h } } = n _ { \mathrm { m i n i b a t c h } }$ and that $n _ { \mathrm { b a t c h } }$ is large enough, the performance is very similar when plotted depending on the number of processed prompts, as can be seen in Figure 6 (a). On the other hand, when $n _ { \mathrm { m i n i b a t c h } }$ is decreased while keeping $n _ { \mathrm { b a t c h } }$ constant, the performance suddenly degrades, even when compared to $n _ { \mathrm { b a t c h } }$ reduced to the same $n _ { \mathrm { m i n i b a t c h } } ,$ , as highlighted in Figure 6 (b). When $n _ { \mathrm { b a t c h } } \leq 1 0 2 4$ , the training becomes less stable, so we opt to keep ratio $n _ { \mathrm { a s y n c } } / n _ { \mathrm { b a t c h } } \leq 2$ and $n _ { \mathrm { b a t c h } } = n _ { \mathrm { m i n i b a t c h } }$ during final training and further ablations.

我们观察到, 只要保持 $n _ { \mathrm { b a t c h } } = n _ { \mathrm { m i n i b a t c h } }$ 且 $n _ { \mathrm { b a t c h } }$ 足够大, 按已处理 prompt 数画出来的表现就非常接近, 见图 6 (a). 反过来, 保持 $n _ { \mathrm { b a t c h } }$ 不变而减小 $n _ { \mathrm { m i n i b a t c h } }$, 表现会突然变差, 甚至比直接把 $n _ { \mathrm { b a t c h } }$ 降到同样的 $n _ { \mathrm { m i n i b a t c h } }$ 还差, 见图 6 (b). 当 $n _ { \mathrm { b a t c h } } \leq 1024$ 时训练变得不太稳定, 所以在最终训练和后续消融中, 我们保持 $n _ { \mathrm { a s y n c } } / n _ { \mathrm { b a t c h } } \leq 2$, 并令 $n _ { \mathrm { b a t c h } } = n _ { \mathrm { m i n i b a t c h } }$.

### 6.4 Advantage normalization (优势归一化)

We experimented with the following advantage normalization methods:

• Minibatch - normalize advantages within a minibatch

• Group normalization - normalize advantages within a group over a single prompt

• No normalization - do not normalize advantages

我们试验了以下几种优势归一化方法:

• Minibatch: 在 minibatch 内归一化优势

• 组归一化: 在同一个 prompt 的一组生成内归一化优势

• 不归一化: 不对优势做归一化

Previous works [Liu et al., 2025, Andrychowicz et al., 2020] have noted that normalization over a group of generations for a given question can lead to a bias where easy questions or hard questions are upweighted due to their lower standard deviation values. However, we did not observe any significant effects on evaluation performance or the growth of the length as shown in Figure 7. Hence, we decided to use minibatch normalization for all our experiments.

前人工作 [Liu et al., 2025, Andrychowicz et al., 2020] 指出, 在同一道题的一组生成内做归一化会带来偏差: 容易题或难题的标准差较低, 权重就被放大. 但如图 7 所示, 我们没有观察到这对评估表现或长度增长有任何显著影响. 因此所有实验都用 minibatch 归一化.

<!-- page 12 of 23 -->

![图 6 (a) 折线图, 纵轴 Reward 0 到 0.7, 横轴 Prompts (单位 10^5) 0 到 3.5, 图例 Batch size 为 1024, 2048, 4096, 8192 四条曲线; 1024 和 2048 上升最快, 8192 最慢, 约 2 x 10^5 条 prompt 后四条都汇合到约 0.65, 最后约 0.67](images/p12-chart.png)

![图 6 (b) 折线图, 纵轴 Reward 0 到 0.7, 横轴 Prompts (单位 10^5) 0 到约 4.7, 图例 Minibatch size 为 2048, 4096, 8192; 4096 和 8192 两条几乎重合, 最后约 0.68; 2048 在约 0.35 处停滞, 约 1 x 10^5 条 prompt 时跌到约 0.32, 最后只到约 0.55 到 0.6](images/p12-figure-6-impact-of-batch-and-minibatch-sizes-on-rl.png)

Figure 6: Impact of batch and minibatch sizes on RL training rewards. (a) Reward during RL training of 3B model on math data for different batch sizes, while keeping minibatch size equal to batch size. Number of concurrently generated sequences is kept constant at 4096. (b) Reward during RL training in the same setup for different minibatch sizes at fixed batch size of 8192 sequences. We observe that performance doesn't depend strongly on batch size, but degrades when there are more than 2 minibatches in a batch.

图 6: batch 和 minibatch 大小对 RL 训练奖励的影响. (a) 3B 模型在数学数据上做 RL 时, 不同 batch 大小下的奖励, minibatch 大小始终等于 batch 大小. 并发生成的序列数固定为 4096. (b) 同样设置下, batch 大小固定为 8192 条序列, 不同 minibatch 大小下的奖励. 我们观察到表现对 batch 大小不太敏感, 但一个 batch 里超过 2 个 minibatch 时就会变差.

> **拆开:** 正文说 「$n_{\mathrm{batch}} \leq 1024$ 时训练不太稳定」, 图 6 (a) 看得出来吗?
> 看不太出. 图 6 (a) 里 1024 这条和 2048 几乎重合, 前期还最快, 最后同样到约 0.67 (读图). 而且在 $n_{\mathrm{async}}=4096$ 下, batch 1024 的比值是 4, 超出了 「$\leq 2$」 的规则; 图 6 (b) 里 minibatch 2048 对 batch 8192 是 4 个 minibatch, 掉得最明显, 和图注 「more than 2 minibatches」 对得上.

![图 7 左: LiveCodeBench v5 折线图, 纵轴 Accuracy (%) 约 21 到 42, 横轴 Steps 0 到 300, 三条线 Minibatch (黄), Group (红), None (蓝); 三条线都从约 22 到 25 升起, Minibatch 在 200 步附近回落到约 35.4, 300 步回到约 41; Group 在 250 步约 40.2, 300 步降到约 37.8; None 在 300 步约 41.3](images/p12-chart-2.png)

![图 7 中: AIME 24 折线图, 纵轴 Accuracy (%) 约 27 到 60, 横轴 Steps 0 到 300, 三条线颜色同左图; 三条线从约 28 到 30 一起升到 300 步, Group 约 60.5, Minibatch 约 58, None 约 56.5](images/p12-chart-3.png)

![图 7 右: Length evolution during training 折线图, 纵轴 # Tokens 0 到 15000, 横轴 Steps 0 到 300, 三条线颜色同左图并高度重叠, 从约 1000 token 缓慢升高, 200 步后陡升, 末段在约 10000 到 15000 之间抖动](images/p12-figure-7-results-for-training-with-different-advantage.png)

Figure 7: Results for training with different advantage normalizations in GRPO. We observe that different normalization methods do not lead to significant difference either in evaluation performance or the length growth during training.

图 7: GRPO 中采用不同优势归一化方式的训练结果. 我们观察到, 不同归一化方法在评估表现和训练中的长度增长上都没有显著差别.

> **确认:** 图 7 三种归一化差多少, 能说 「没有显著差别」 吗?
> 读图: 300 步时 LiveCodeBench v5 上 Minibatch 约 41, Group 约 37.8, None 约 41.3; AIME 24 上 Group 约 60.5, Minibatch 约 58, None 约 56.5. 差距在 2 到 4 分之间, 而且排序在两个基准上相反. 图 7 看起来是每种设置各跑一次, 没有误差带, 所以 「不显著」 更准确的说法是 「看不出稳定的差别」. 这组实验用的是哪个尺寸的模型, 本页也没写.

## 7 Analysis (分析)

In this section, we investigate the dynamics of RL training and present evidence that increasing completion length is the main resource that improves the performance of the model. Those dynamics are not destructive to previous capabilities, and the reasoning capabilities can even generalize: multimodal reasoning gets improved for free, and function calling and instruction following remain unchanged or even get a small boost. Additionally, we discuss two ideas that didn't work for us - giving more fine-grained rewards in code tasks based on test completion rate and controlling entropy via entropy bonus term in the loss.

本节研究 RL 训练的动态, 并给出证据: 增加生成长度是提升模型表现的主要资源. 这些动态不会破坏原有能力, 推理能力甚至还能泛化: 多模态推理白白得到提升, 函数调用和指令遵循保持不变甚至略有提升. 此外, 我们讨论两个对我们无效的想法: 按测试通过率给代码任务更细粒度的奖励, 以及在 loss 里加熵奖励项来控制熵.

### 7.1 Reinforcement learning moves weights in low-dimensional space (强化学习让权重在低维空间里移动)

To better understand the dynamics of Magistral during RL training, we follow the method of [Li et al., 2018] to analyze the **Magistral Small RL-only** run and visualize the loss landscape around the final checkpoint.

为了更好地理解 Magistral 在 RL 训练中的动态, 我们按 [Li et al., 2018] 的方法分析 **Magistral Small RL-only** 这次运行, 并把最终 checkpoint 周围的 loss 地形画出来.

First, we stack the weights of all intermediate checkpoints in a matrix $X   \in   \mathbb { R } ^ { T \times W }$ , where $T$ is the number of checkpoints and W is the number of weights. Then, we subtract the mean weights across the $T$ checkpoints and perform a PCA analysis to find two principal components of the matrix X in the weight space. Since the weight space is very high-dimensional, we use the iterative Lanczos-Arnoldi algorithm [Saad, 2003] to find the top-2 eigenvectors of $X ^ { T } X$ . As a result, we obtain two components $c _ { 1 }$ and $c _ { 2 }$ that we L2-normalize to have a unit norm.

第一步, 把所有中间 checkpoint 的权重堆成矩阵 $X \in \mathbb { R } ^ { T \times W }$, 其中 $T$ 是 checkpoint 个数, W 是权重个数. 然后减去 $T$ 个 checkpoint 的平均权重, 做 PCA, 找出矩阵 X 在权重空间里的两个主成分. 由于权重空间维度极高, 我们用迭代的 Lanczos-Arnoldi 算法 [Saad, 2003] 求 $X ^ { T } X$ 的前两个特征向量. 这样得到两个分量 $c _ { 1 }$ 和 $c _ { 2 }$, 再做 L2 归一化, 使它们的范数为 1.

<!-- page 13 of 23 -->

Second, we perturb the final checkpoint weights $w ^ { * } \in \mathbb { R } ^ { W }$ by adding two components as

第二步, 在最终 checkpoint 的权重 $w ^ { * } \in \mathbb { R } ^ { W }$ 上加两个分量做扰动:

$$
w (\alpha_ {1}, \alpha_ {2}) = w ^ {*} + \alpha_ {1} c _ {1} + \alpha_ {2} c _ {2}\tag{2}
$$

We evaluate each perturbed checkpoint on a fixed batch of 512 prompts, generating 16 completions per prompt, and using the same reward setting as in **Magistral Small RL-only** run. Finally, we compute mean reward and mean output length for each checkpoint and plot it in $( \alpha _ { 1 } , \alpha _ { 2 } )$ coordinates.

每个扰动后的 checkpoint 都在固定的一批 512 个 prompt 上评估, 每个 prompt 生成 16 条回答, 奖励设置和 **Magistral Small RL-only** 运行相同. 最后算出每个 checkpoint 的平均奖励和平均输出长度, 画在 $( \alpha _ { 1 } , \alpha _ { 2 } )$ 坐标上.

> **回看:** 512 个 prompt 乘 16 条是 8192 条, 和图 9 说的 8192 是同一批吗?
> 512 × 16 = 8192 (估算), 正好等于第 13 页图 9 图注的 「8192 completions」, 应是同一套评估. 7.1 节开头说分析的是 Magistral Small RL-only 运行, 而它的起点是 Mistral Small 3 还是图 10 图例里的 Mistral Small 3.1, 本节没再说明.

![图 8 左: Reward 等高线图, 横轴 First component α_1 从 -0.5 到 1.5, 纵轴 Second component α_2 从 -0.6 到 0.3, 色标 0.35 (紫) 到 0.80 (红); 黑点是扰动 checkpoint, 黑色箭头轨迹从右下约 (1.0, -0.4) 出发, 先向上到约 (0.8, -0.05), 再到约 (0.55, 0.08), 最后向左到原点 (0, 0), 终点位于红色最高奖励区](images/p13-chart.png)

![图 8 右: Output length 等高线图, 坐标轴和箭头轨迹与左图相同, 色标 0 (紫) 到 13500 (红); 右下角长度在 1500 以下, 越往左越长, 原点附近约 9000 到 10500, 最左缘出现 10500 到 12000 的橙色带](images/p13-figure-8-reward-and-length-evolution-in-w-alpha-1-alpha.png)

Figure 8: Reward and length evolution in $w ( \alpha _ { 1 } , \alpha _ { 2 } )$ hyperplane. Black arrow trajectory is a projection of intermediate checkpoints of Magistral Small RL-only run on the hyperplane. Black points are perturbed checkpoints computed using Equation 2. Intermediate values are computed with linear interpolation on the triangular grid.

图 8: 奖励和长度在 $w ( \alpha _ { 1 } , \alpha _ { 2 } )$ 超平面上的变化. 黑色箭头轨迹是 Magistral Small RL-only 运行的中间 checkpoint 在这个超平面上的投影. 黑点是用式 (2) 算出的扰动 checkpoint. 中间值在三角网格上线性插值得到.

We clearly observe that there is a "length" direction - as model goes from right to left in Figure 8, mean reward and output length grow up until the point where length starts to hit length penalty and maximally allowed completion length. We additionally plot dependence of raw reward without length penalty on output length, observing a ubiquitous log scaling in Figure 9.

我们清楚地看到存在一个 「长度」 方向: 在图 8 中模型从右往左走时, 平均奖励和输出长度一起增长, 直到长度开始碰到长度惩罚和允许的最大生成长度为止. 我们另外画出不含长度惩罚的原始奖励与输出长度的关系, 在图 9 中看到一个普遍存在的对数 Scaling.

> **停一下:** 图 8 的奖励最高能到多少?
> 左图色标上限 0.80, 箭头终点落在 0.75 到 0.80 的红色区 (读图). 按第 4 页的奖励设计, 单条回答最高可到 1.1 (估算: 格式 0.1 + 正确 0.9 + 语言 0.1), 所以 0.8 左右的平均奖励说明仍有不少题答错. 右图原点附近长度约 9000 到 10500 (读图).

![图 9 散点图, 纵轴 Raw reward 约 0.37 到 0.81, 横轴 Output length 用对数刻度, 标 1000, 2000, 4000, 8000, 16000; 黑点 Perturbed checkpoints 从约 (1000, 0.37) 沿直线上升, 橙色虚线 a * log(length) + b 拟合约 1500 到 8000 之间的点, 从约 0.52 升到约 0.81; 长度约 8000 到 9000 处点聚在 0.78 到 0.81, 再往右骤降, 约 9000 到 11000 处散落在 0.58 到 0.75](images/p13-figure-9-reward-scaling-with-output-length-each-point.png)

Figure 9: Reward scaling with output length. Each point corresponds to a perturbed checkpoint computed with Equation 2. We generate 8192 completions with the checkpoint and evaluate mean output length and raw reward (reward without length penalty). We perform linear regression on checkpoints with mean output length between 1500 and 8000 and observe that reward scales logarithmically with the output length.

图 9: 奖励随输出长度的 Scaling. 每个点对应一个用式 (2) 算出的扰动 checkpoint. 我们用每个 checkpoint 生成 8192 条回答, 算平均输出长度和原始奖励 (不含长度惩罚的奖励). 对平均输出长度在 1500 到 8000 之间的 checkpoint 做线性回归, 看到奖励随输出长度按对数增长.

> **再看:** 图 9 的原始奖励不含长度惩罚, 为什么过了约 8000 以后还会掉?
> 读图: 长度约 8000 到 9000 时奖励在 0.78 到 0.81 见顶, 之后一批点掉到 0.58 到 0.75. 原始奖励不扣长度分, 掉下来多半是回答被最大长度截断, 答案没写完 (格式不合格得 0). 正文把拐点归于 「length penalty and maximally allowed completion length」, 但这次运行的 $l_{\max}$ 没有印出, 拐点和 $l_{\max}$ 的对应关系核对不了. 拟合系数 a, b 也没给.

### 7.2 Eating the multimodal free lunch (吃下多模态的免费午餐)

The initial checkpoints utilized for RL training, Mistral Small 3 and Mistral Medium 3, are multimodal models and come with associated vision encoders. During the RL training phase, as the models are trained on text-only data, one might expect the multimodal performance to degrade. However, on the contrary, we discover that the models not only retain their multimodal capabilities, but unexpectedly develop enhanced multimodal reasoning abilities. The resulting models also showcase improved performance on multimodal benchmarks.

RL 训练的初始 checkpoint, Mistral Small 3 和 Mistral Medium 3, 都是多模态模型, 带有配套的视觉编码器. RL 阶段模型只用纯文本数据训练, 人们可能以为多模态表现会下降. 恰恰相反, 我们发现模型不但保住了多模态能力, 还意外地增强了多模态推理能力. 得到的模型在多模态基准上的表现也有提升.

<!-- page 14 of 23 -->

![图 10 分组柱状图, 纵轴 Accuracy (%), 四组基准 MMMU, MathVista, MMMU-Pro (Standard), MMMU-Pro (Vision), 每组四根柱依次为 Mistral Small 3.1, Magistral Small, Mistral Medium 3, Magistral Medium. MMMU: 61.9, 66.0, 65.0, 70.0; MathVista: 65.8, 66.8, 68.5, 70.1; MMMU-Pro (Standard): 45.8, 51.8, 53.5, 57.9; MMMU-Pro (Vision): 42.4, 39.2, 39.7, 52.1](images/p14-figure-10-performance-on-multimodal-benchmarks.png)

Figure 10: Performance on multimodal benchmarks.

图 10: 多模态基准上的表现.

> **对一下:** 图 10 的图例和正文说的起点对得上吗?
> 对不上. 图 10 图例写的是 Mistral Small 3.1, 而第 1 页, 第 8 页图 4, 第 9 页和第 13 页 7.2 节都说 Magistral Small 的起点是 Mistral Small 3. 另外 Magistral Small 在 MMMU-Pro (Vision) 上从 42.4 掉到 39.2, 是图 10 里唯一的回退, 正文 「no performance regression across most benchmarks」 的 「most」 容得下它, 但没点名.

We report results multimodal benchmarks designed to assess reasoning capabilities, specifically MathVista [Lu et al., 2024], MMMU [Yue et al., 2024], and MMMU-Pro [Yue et al., 2025]. Our results in Figure 10 show no performance regression across most benchmarks, with notable improvements observed on MMMU (+5%, reaching 70%), MMMU-Pro-Standard (+4.4%, reaching 57.9%) and MMMU-Pro-Vision (+12%, reaching 52.1%). While the most significant improvements are seen in scientific questions that require textual reasoning, we observe that the model transfers its extended thinking process across all types of questions (see Figures 14 15 16 for qualitative examples).

我们报告几个为评估推理能力而设计的多模态基准的结果: MathVista [Lu et al., 2024], MMMU [Yue et al., 2024] 和 MMMU-Pro [Yue et al., 2025]. 图 10 显示大多数基准上没有退步, 且有几项明显提升: MMMU (+5%, 达到 70%), MMMU-Pro-Standard (+4.4%, 达到 57.9%), MMMU-Pro-Vision (+12%, 达到 52.1%). 提升最大的是需要文本推理的科学题, 但我们观察到模型把它延长的思考过程带到了所有类型的题目上 (定性例子见图 14, 15, 16).

> **核对:** 这三个 「+%」 是百分点还是相对涨幅, 说的是哪个模型?
> 按图 10 的 Magistral Medium 算: MMMU 65.0 到 70.0, +5.0; MMMU-Pro (Standard) 53.5 到 57.9, +4.4; MMMU-Pro (Vision) 39.7 到 52.1, +12.4 (估算). 都是百分点, 而且只对 Medium 成立. Magistral Small 的对应涨幅是 +4.1, +6.0, -3.2 (估算).

### 7.3 Impact of RL on other capabilities (RL 对其他能力的影响)

Similar to the multimodal capabilities mentioned in Section 7.2, our RL checkpoint maintains and even improves its tool calling and instruction following capabilities [Zhou et al., 2023] (Table 6). This allows us to integrate the model out-of-the-box with existing tools as shown.

和 7.2 节的多模态能力类似, 我们的 RL checkpoint 保住甚至提升了工具调用和指令遵循能力 [Zhou et al., 2023] (表 6). 这让模型可以开箱即用地接入现有工具.

Table 6: Benchmarks before and after reinforcement learning. Internal bench is Mistral's internal function calling benchmark. We use an internal version of IFEval that fixes some issues with the public version. The scores are not comparable with other publicly shared scores.

表 6: 强化学习前后的基准分数. Internal bench 是 Mistral 内部的函数调用基准. IFEval 用的是内部版本, 修正了公开版本的一些问题. 这些分数不能和其他公开分数直接比较.

| Category | Benchmark | Mistral Medium 3 | Magistral Medium |
| --- | --- | --- | --- |
| Function calling | Internal bench | 87.2 | 87.4 |
| Instruction following | IFEval | 86.8 | 87.4 |

表 6 两行: 函数调用 (内部基准), 指令遵循 (IFEval).

> **看表:** 表 6 的提升有多大, Small 的数在哪?
> 函数调用 87.2 到 87.4, 指令遵循 86.8 到 87.4, 分别只涨 0.2 和 0.6 分 (估算), 说 「保持」 比说 「提升」 更贴切. 表 6 只有 Medium 两列, Magistral Small 的函数调用和指令遵循分数全篇没印.

### 7.4 Unsuccessful approaches (没成功的做法)

In this section, we present various approaches that we tried but ultimately did not adopt, as they did not yield any performance improvements.

本节介绍我们尝试过但最终没有采用的几种做法, 因为它们没有带来任何表现提升.

### 7.4.1 Partial reward for code data (代码数据的部分奖励)

The strict requirements of competitive programming, in terms of correctness and adherence to complexity constraints, result in sparse rewards, often causing many code generations to be discarded due to limited reward diversity.

竞赛编程对正确性和复杂度约束要求严格, 导致奖励稀疏; 由于奖励缺乏差异, 很多代码生成常常被丢弃.

To address this, we experimented with a proportional reward: based on the fraction of tests passed, as opposed to the binary reward discussed in Section 2.2.2. In an ablation with a 24B model over 250 steps, we found that training with proportional rewards was faster, discarding three times less data. However, this approach led to slightly lower final performance on benchmarks, with a 2% decrease on LiveCodeBench (Figure 11a), and slower growth in generation length (Figure 11b).

为此我们试了按比例给奖励: 依据通过测试的比例, 而不是 2.2.2 节的二元奖励. 在一个 24B 模型训练 250 步的消融中, 我们发现比例奖励训练更快, 丢弃的数据少到原来的三分之一. 但这种做法让基准上的最终表现略低, LiveCodeBench 下降 2% (图 11a), 生成长度增长也更慢 (图 11b).

<!-- page 15 of 23 -->

The hope was that a reward based on the fraction of tests passed should provide a richer signal than a simple pass/fail for RL training. However, the potential issue is that partial rewards could also provide false signal to incorrect solutions and be more sensitive to minor inconsistencies between implementations, potentially leading to less meaningful training batches.

原本的期望是, 按通过测试比例给的奖励应当比简单的通过/不通过给 RL 训练提供更丰富的信号. 但潜在问题是, 部分奖励也可能给错误的解答发出虚假信号, 并且对不同实现之间的细小差异更敏感, 可能让训练 batch 的意义打折扣.

![图 11 (a) 分组柱状图, 纵轴 Accuracy (%) 0 到 50, 四组 AIME 24, AIME 25, LCB V5, LCB V6, 每组黄柱 Binary Reward, 红柱 Proportional Reward; AIME 24 约 48.2 对 49.3, AIME 25 约 37.9 对 37.7, LCB V5 约 41.7 对 40.7, LCB V6 约 37.7 对 36.2](images/p15-chart.png)

![图 11 (b) 折线图, 纵轴 Average Generation Length 0 到约 14700, 横轴 Steps 0 到 250, 黄线 Binary Reward, 红线 Proportional Reward; 前 50 步两条都在约 1000, 之后黄线升得更快, 250 步时黄线约 12000 到 14700, 红线约 8000 到 9400](images/p15-figure-11-binary-vs-proportional-reward-for-code.png)

Figure 11: Binary vs proportional reward for code problems. (a) Accuracy on AIME and LiveCodeBench after 250 steps of training with binary reward and proportional reward. Performance on LiveCodeBench is 2% lower with proportional rewards. (b) Length evolution throughout training. Length increases more with binary rewards.

图 11: 代码题上的二元奖励与比例奖励. (a) 分别用二元奖励和比例奖励训练 250 步后, 在 AIME 和 LiveCodeBench 上的准确率. 用比例奖励时 LiveCodeBench 低 2%. (b) 训练过程中的长度变化. 二元奖励下长度增长更多.

> **问:** 图 11 (a) 的 「低 2%」 是百分点吗?
> 读图: LCB V5 约 41.7 对 40.7, LCB V6 约 37.7 对 36.2, 差约 1.0 和 1.5 个百分点; 按相对值约 2.4% 和 4% (估算). 所以 「2%」 更接近 V5 的相对降幅. 同一张图里 AIME 24 上比例奖励反而高约 1 分. 「discarding three times less data」 没有给出丢弃数据的绝对量.

### 7.4.2 Entropy targeting (熵目标控制)

![图 12 (a) 折线图, 纵轴 Entropy 约 0.27 到 0.40, 横轴 Steps 约 10 到 200, 三条线: ε_high = 0.2 (黄), ε_high = 0.28 (红), entropy bonus = 7 x 10^-4 (蓝); 三条都从约 0.37 到 0.40 出发, 黄线一路降到约 0.27, 蓝线降到约 0.30, 红线在 0.35 到 0.38 之间保持](images/p15-chart-2.png)

![图 12 (b) 折线图, 纵轴 Entropy 约 0.55 到 2.1, 横轴 Steps 约 10 到 200, 线条同 (a); 黄线和红线从约 1.6 到 1.7 很快降到约 0.9, 之后在约 0.6 到 0.7 走平; 蓝线先降到约 1.0, 约 140 步后陡升, 约 160 步冲到约 2.1, 之后回落到约 1.2 到 1.25](images/p15-figure-12-impact-of-varepsilon-mathbf-h-i-g-h-on-the.png)

Figure 12: Impact of $\varepsilon _ { \mathbf { h i g h } }$ on the entropy distribution throughout training. (a) Entropy evolution throughout training of a 3B model on a math only dataset. Entropy drops with entropy bonus, while higher $\varepsilon _ { \mathrm { h i g h } }$ maintains entropy, allowing for better exploration. (b) Entropy evolution throughout training of a 3B model on a math and code dataset. Entropy explodes with entropy bonus, even though the coefficient is the same as the math only version. Higher $\varepsilon _ { \mathrm { h i g h } }$ behaves better, allowing entropy to decrease.

图 12: $\varepsilon _ { \mathrm { high } }$ 对训练中熵分布的影响. (a) 3B 模型在纯数学数据集上训练时的熵变化. 加熵奖励时熵下降, 而较高的 $\varepsilon _ { \mathrm { h i g h } }$ 能保住熵, 探索更充分. (b) 3B 模型在数学加代码数据集上训练时的熵变化. 加熵奖励时熵爆炸, 尽管系数和纯数学版本一样. 较高的 $\varepsilon _ { \mathrm { h i g h } }$ 表现更好, 让熵得以下降.

To encourage exploration and prevent entropy collapse during RL training, a common strategy in the literature [Schulman et al., 2017] is to add an entropy bonus loss term. However, we found this strategy to be unstable as the effect of the entropy bonus varies significantly depending on the dataset. For a math-only dataset, entropy drops with the entropy bonus, while a higher $\varepsilon _ { \mathrm { h i g h } }$ maintains entropy, enhancing exploration (Figure 12a). On a math and code dataset, entropy increases excessively with the entropy bonus (even with the same coefficient as in the math-only run), while a higher $\varepsilon _ { \mathrm { h i g h } }$ allows entropy to decrease, improving exploitation (Figure 12b).

为鼓励探索, 防止 RL 训练中熵坍缩, 文献 [Schulman et al., 2017] 里常见的做法是加一个熵奖励 loss 项. 但我们发现这种做法不稳定, 熵奖励的效果随数据集变化很大. 在纯数学数据集上, 加熵奖励时熵下降, 而较高的 $\varepsilon _ { \mathrm { h i g h } }$ 能保住熵, 加强探索 (图 12a). 在数学加代码数据集上, 加熵奖励时熵涨得过头 (即使系数和纯数学那次一样), 而较高的 $\varepsilon _ { \mathrm { h i g h } }$ 让熵得以下降, 改善利用 (图 12b).

> **核对:** 图 12 里 「较高」 的 $\varepsilon_{\mathrm{high}}$ 在两个数据集上作用相反吗?
> 读图: (a) 纯数学时 0.28 让熵停在约 0.36 以上, 0.2 降到约 0.27; (b) 数学加代码时 0.2 和 0.28 两条几乎重合, 都降到约 0.6 到 0.7, 真正失控的是熵奖励 (7 × 10^-4) 那条, 冲到约 2.1. 所以 (b) 里 「higher $\varepsilon_{\mathrm{high}}$ behaves better」 是相对熵奖励说的, 和 0.2 比看不出差别.

<!-- page 16 of 23 -->

Instead, we found it more effective to depend on $\varepsilon_{\mathrm{high}}$, as also noted in literature [Yu et al., 2025, Wang et al., 2025]. This method avoids the instability issues associated with entropy bonuses.

我们发现更有效的办法是依靠 $\varepsilon_{\mathrm{high}}$, 文献 [Yu et al., 2025, Wang et al., 2025] 也指出了这一点. 这种做法避开了熵奖励带来的不稳定.

Another approach for controlling entropy is adding a KL term to the PPO loss. However, as the generation distribution is expected to deviate significantly from the original model, we found that using a KL penalty primarily hinders training, consistent with previous findings [Yu et al., 2025]. We attempted using an exponential moving average of the weights during training as a reference for KL, but found it simpler to manually adjust $\varepsilon_{\mathrm{high}}$.

另一种控制熵的办法是在 PPO loss 里加 KL 项. 但生成分布本来就预期会大幅偏离原模型, 我们发现用 KL 惩罚主要是在拖累训练, 这和前人发现 [Yu et al., 2025] 一致. 我们试过用训练中权重的指数滑动平均作为 KL 的参考, 但发现手动调 $\varepsilon_{\mathrm{high}}$ 更简单.

![图 13 分组柱状图, 纵轴 Accuracy (%) 从 40 起, 五组 AIME-24, AIME-25, MATH, GPQA Diamond, LiveCodeBench (v5); 每组左柱是 Medium OSS-SFT (深橙) 叠加 Medium OSS-SFT + RL (浅橙段), 右柱 Deepseek R1 (蓝). AIME-24: 73.7 到 79.7, R1 79.8; AIME-25: 59.2 到 71.5, R1 70.0; MATH: 95.3 到 97.3, R1 97.3; GPQA Diamond: SFT 72.9, RL 后 71.0, R1 71.5; LiveCodeBench (v5): 60.6 到 66.0, R1 65.9](images/p16-figure-13-benchmark-performance-of-magistral-medium.png)

Figure 13: Benchmark performance of Magistral Medium fine-tuned on open-source traces. All results are reported using pass@1. The shaded region highlights the additional improvement achieved through RL on top of supervised fine-tuning. We find that while fine-tuning on open-source traces yields strong results, applying RL further enhances performance significantly. In particular, the accuracy on AIME'25 increases by more than 12%. Please note that the performance on GPQA Diamond drops after RL from 72.9% to 71.0%.

图 13: 在开源轨迹上微调的 Magistral Medium 的基准表现. 所有结果都是 pass@1. 阴影部分表示在 SFT 之上再做 RL 带来的额外提升. 我们发现, 在开源轨迹上微调已经能拿到很强的结果, 再做 RL 还能显著提升. 尤其 AIME'25 的准确率提高了 12% 以上. 请注意 GPQA Diamond 在 RL 之后从 72.9% 降到 71.0%.

## 8 RL on model finetuned using OSS reasoning traces (在用开源推理轨迹微调过的模型上做 RL)

As an experiment, we also tried to first finetune Mistral Medium 3 using open source reasoning datasets OpenThoughts [Guha et al., 2025] and the code subset of OpenR1 [Hugging Face, 2025, Penedo et al., 2025] including both the prompts and the generations from these datasets i.e. Deepseek R1 generated traces. This included a total of about 1.3M generations. We then run RL on top of this finetuned checkpoint using our most difficult subset of the data. As shown in Figure 13, applying RL yields substantial performance gains over the SFT checkpoint. Notably, the RL model improves by over 10 points on AIME'25 and 5 points on LiveCodeBench, achieving a final performance level on par with Deepseek-R1 on code and math benchmarks.

作为一项实验, 我们还试过先用开源推理数据集 OpenThoughts [Guha et al., 2025] 和 OpenR1 [Hugging Face, 2025, Penedo et al., 2025] 的代码子集微调 Mistral Medium 3, 既用这些数据集里的 prompt, 也用其中的生成, 即 DeepSeek R1 生成的轨迹. 总共约 130 万条生成. 然后在这个微调 checkpoint 上, 用我们数据里最难的子集做 RL. 如图 13 所示, 做 RL 比 SFT checkpoint 有大幅提升. 值得一提的是, RL 模型在 AIME'25 上提高 10 分以上, 在 LiveCodeBench 上提高 5 分, 最终在代码和数学基准上达到和 DeepSeek-R1 相当的水平.

> **拆开:** 图 13 逐项涨了多少, 和纯 RL 的 Magistral Medium 比呢?
> 图 13: AIME-24 +6.0, AIME-25 +12.3, MATH +2.0, GPQA Diamond -1.9, LiveCodeBench (v5) +5.4 (估算), 和正文 「over 10 points」 及 「5 points」 对得上. 和表 2 的 Magistral Medium 比, 这条 OSS-SFT + RL 路线的 AIME-24 高 6.1 (79.7 对 73.6), LiveCodeBench (v5) 高 6.6 (66.0 对 59.4) (估算), 只做了 SFT 的 GPQA 72.9 也高于纯 RL 的 70.8. 「most difficult subset」 有多少题没印.

## 9 Conclusion

Magistral is our first step towards generally capable systems with reinforcement learning. We look forward to the next research problems ahead of us: what loss and optimization algorithms are the most appropriate, how much gain can be unlocked by bootstrapping a model on its own reasoning traces, or how to scale to the next order of magnitude of compute. Looking ahead, we are also excited to push the boundaries of RL across a whole range of applications, with tool-use, integrated multimodality, and agents. As we explore this frontier, we remain committed to contributing to science in a transparent and optimistic manner.

Magistral 是我们用强化学习走向通用能力系统的第一步. 我们期待接下来的研究问题: 哪种 loss 和优化算法最合适; 让模型用自己的推理轨迹自举能释放多少收益; 怎样把算力再扩大一个数量级. 展望未来, 我们也期待在一整类应用上推进 RL 的边界, 包括工具使用, 深度融合的多模态和 agent. 在探索这片前沿的过程中, 我们会继续以透明和乐观的方式为科学做贡献.

> **想:** 结论提的 「bootstrapping a model on its own reasoning traces」, 本文做过类似的事吗?
> 部分做过, 但不是自举到同一个模型. 第 9 页 5.3 节用 Magistral Medium 的轨迹去训练 Mistral Small 3; 第 16 页图 13 用的是 DeepSeek R1 的轨迹去训练 Mistral Medium 3. 用 Magistral Medium 自己的轨迹再训 Magistral Medium, 本文没有结果.

<!-- page 17 of 23 -->

## Core contributors (核心贡献者)

Abhinav Rastogi, Albert Q. Jiang, Andy Lo, Gabrielle Berrada, Guillaume Lample, Jason Rute, Joep Barmentlo, Karmesh Yadav, Kartik Khandelwal, Khyathi Raghavi Chandu, Léonard Blier, Lucile Saulnier, Matthieu Dinot, Maxime Darrin, Neha Gupta, Roman Soletskyi, Sagar Vaze, Teven Le Scao, Yihan Wang

核心贡献者共 19 人, 按名字字母顺序排列, 人名照录不译.

## Contributors (贡献者)

Adam Yang, Alexander H. Liu, Alexandre Sablayrolles, Amélie Héliou, Amélie Martin, Andy Ehrenberg, Anmol Agarwal, Antoine Roux, Arthur Darcet, Arthur Mensch, Baptiste Bout, Baptiste Rozière, Baudouin De Monicault, Chris Bamford, Christian Wallenwein, Christophe Renaudin, Clémence Lanfranchi, Darius Dabert, Devon Mizelle, Diego de las Casas, Elliot Chane-Sane, Emilien Fugier, Emma Bou Hanna, Gauthier Delerce, Gauthier Guinet, Georgii Novikov, Guillaume Martin, Himanshu Jaju, Jan Ludziejewski, Jean-Hadrien Chabran, Jean-Malo Delignon, Joachim Studnia, Jonas Amar, Josselin Somerville Roberts, Julien Denize, Karan Saxena, Kush Jain, Lingxiao Zhao, Louis Martin, Luyu Gao, Lélio Renard Lavaud, Marie Pellat, Mathilde Guillaumin, Mathis Felardos, Maximilian Augustin, Mickaël Seznec, Nikhil Raghuraman, Olivier Duchenne, Patricia Wang, Patrick von Platen, Patryk Saffer, Paul Jacob, Paul Wambergue, Paula Kurylowicz, Pavankumar Reddy Muddireddy, Philomène Chagniot, Pierre Stock, Pravesh Agrawal, Romain Sauvestre, Rémi Delacourt, Sanchit Gandhi, Sandeep Subramanian, Shashwat Dalal, Siddharth Gandhi, Soham Ghosh, Srijan Mishra, Sumukh Aithal, Szymon Antoniak, Thibault Schueller, Thibaut Lavril, Thomas Robert, Thomas Wang, Timothée Lacroix, Valeriia Nemychnikova, Victor Paltz, Virgile Richard, Wen-Ding Li, William Marshall, Xuanyu Zhang, Yunhao Tang

其余贡献者按名字字母顺序排列, 人名照录不译.

<!-- page 18 of 23 -->

## References

每条文献下附一行中文, 译出题名和出处; 作者名照录.

Marcin Andrychowicz, Anton Raichuk, Piotr Stanczyk, Manu Orsini, Sertan Girgin, Raphael Marinier, Léonard Hussenot, Matthieu Geist, Olivier Pietquin, Marcin Michalski, Sylvain Gelly, and Olivier Bachem. What matters in on-policy reinforcement learning? a large-scale empirical study, 2020. URL [https://arxiv.org/abs/2006.05990](https://arxiv.org/abs/2006.05990).

Andrychowicz 等, 2020: 在策略强化学习里什么最重要? 一项大规模实证研究. arXiv 2006.05990.

DeepSeek-AI, Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, Xiao Bi, Xiaokang Zhang, Xingkai Yu, Yu Wu, Z. F. Wu, Zhibin Gou, Zhihong Shao, Zhuoshu Li, Ziyi Gao, Aixin Liu, Bing Xue, Bingxuan Wang, Bochao Wu, Bei Feng, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chenyu Zhang, Chong Ruan, Damai Dai, Deli Chen, Dongjie Ji, Erhang Li, Fangyun Lin, Fucong Dai, Fuli Luo, Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang, Han Bao, Hanwei Xu, Haocheng Wang, Honghui Ding, Huajian Xin, Huazuo Gao, Hui Qu, Hui Li, Jianzhong Guo, Jiashi Li, Jiawei Wang, Jingchang Chen, Jingyang Yuan, Junjie Qiu, Junlong Li, J. L. Cai, Jiaqi Ni, Jian Liang, Jin Chen, Kai Dong, Kai Hu, Kaige Gao, Kang Guan, Kexin Huang, Kuai Yu, Lean Wang, Lecong Zhang, Liang Zhao, Litong Wang, Liyue Zhang, Lei Xu, Leyi Xia, Mingchuan Zhang, Minghua Zhang, Minghui Tang, Meng Li, Miaojun Wang, Mingming Li, Ning Tian, Panpan Huang, Peng Zhang, Qiancheng Wang, Qinyu Chen, Qiushi Du, Ruiqi Ge, Ruisong Zhang, Ruizhe Pan, Runji Wang, R. J. Chen, R. L. Jin, Ruyi Chen, Shanghao Lu, Shangyan Zhou, Shanhuang Chen, Shengfeng Ye, Shiyu Wang, Shuiping Yu, Shunfeng Zhou, Shuting Pan, S. S. Li, Shuang Zhou, Shaoqing Wu, Shengfeng Ye, Tao Yun, Tian Pei, Tianyu Sun, T. Wang, Wangding Zeng, Wanjia Zhao, Wen Liu, Wenfeng Liang, Wenjun Gao, Wenqin Yu, Wentao Zhang, W. L. Xiao, Wei An, Xiaodong Liu, Xiaohan Wang, Xiaokang Chen, Xiaotao Nie, Xin Cheng, Xin Liu, Xin Xie, Xingchao Liu, Xinyu Yang, Xinyuan Li, Xuecheng Su, Xuheng Lin, X. Q. Li, Xiangyue Jin, Xiaojin Shen, Xiaosha Chen, Xiaowen Sun, Xiaoxiang Wang, Xinnan Song, Xinyi Zhou, Xianzu Wang, Xinxia Shan, Y. K. Li, Y. Q. Wang, Y. X. Wei, Yang Zhang, Yanhong Xu, Yao Li, Yao Zhao, Yaofeng Sun, Yaohui Wang, Yi Yu, Yichao Zhang, Yifan Shi, Yiliang Xiong, Ying He, Yishi Piao, Yisong Wang, Yixuan Tan, Yiyang Ma, Yiyuan Liu, Yongqiang Guo, Yuan Ou, Yuduan Wang, Yue Gong, Yuheng Zou, Yujia He, Yunfan Xiong, Yuxiang Luo, Yuxiang You, Yuxuan Liu, Yuyang Zhou, Y. X. Zhu, Yanhong Xu, Yanping Huang, Yaohui Li, Yi Zheng, Yuchen Zhu, Yunxian Ma, Ying Tang, Yukun Zha, Yuting Yan, Z. Z. Ren, Zehui Ren, Zhangli Sha, Zhe Fu, Zhean Xu, Zhenda Xie, Zhengyan Zhang, Zhewen Hao, Zhicheng Ma, Zhigang Yan, Zhiyu Wu, Zihui Gu, Zijia Zhu, Zijun Liu, Zilin Li, Ziwei Xie, Ziyang Song, Zizheng Pan, Zhen Huang, Zhipeng Xu, Zhongyu Zhang, and Zhen Zhang. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning, 2025. URL [https://arxiv.org/abs/2501.12948](https://arxiv.org/abs/2501.12948).

DeepSeek-AI 等, 2025: DeepSeek-R1, 用强化学习激发 LLM 的推理能力. arXiv 2501.12948.

Lasse Espeholt, Hubert Soyer, Remi Munos, Karen Simonyan, Vlad Mnih, Tom Ward, Yotam Doron, Vlad Firoiu, Tim Harley, Iain Dunning, et al. Impala: Scalable distributed deep-rl with importance weighted actor-learner architectures. In International conference on machine learning, pages 1407–1416. PMLR, 2018.

Espeholt 等, 2018: IMPALA, 带重要性加权 actor-learner 架构的可扩展分布式深度 RL. ICML 2018, 第 1407 到 1416 页.

Paul Gauthier. Polyglot Benchmark. [https://github.com/Aider-AI/polyglot-benchmark](https://github.com/Aider-AI/polyglot-benchmark),2024. URL [https://github.com/Aider-AI/polyglot-benchmark](https://github.com/Aider-AI/polyglot-benchmark). GitHub repository. Coding problems sourced from Exercism language tracks.

Gauthier, 2024: Polyglot 基准, GitHub 仓库, 编程题取自 Exercism 的各语言练习.

Etash Guha, Ryan Marten, Sedrick Keh, Negin Raoof, Georgios Smyrnis, Hritik Bansal, Marianna Nezhurina, Jean Mercat, Trung Vu, Zayne Sprague, Ashima Suvarna, Benjamin Feuer, Liangyu Chen, Zaid Khan, Eric Frankel, Sachin Grover, Caroline Choi, Niklas Muennighoff, Shiye Su, Wanjia Zhao, John Yang, Shreyas Pimpalgaonkar, Kartik Sharma, Charlie Cheng-Jie Ji, Yichuan Deng, Sarah Pratt, Vivek Ramanujan, Jon Saad-Falcon, Jeffrey Li, Achal Dave, Alon Albalak, Kushal Arora, Blake Wulfe, Chinmay Hegde, Greg Durrett, Sewoong Oh, Mohit Bansal, Saadia Gabriel, Aditya Grover, Kai-Wei Chang, Vaishaal Shankar, Aaron Gokaslan, Mike A. Merrill, Tatsunori Hashimoto, Yejin Choi, Jenia Jitsev, Reinhard Heckel, Maheswaran Sathiamoorthy, Alexandros G. Dimakis, and Ludwig Schmidt. Openthoughts: Data recipes for reasoning models, 2025. URL [https://arxiv.org/abs/2506.04178](https://arxiv.org/abs/2506.04178).

Guha 等, 2025: OpenThoughts, 推理模型的数据配方. arXiv 2506.04178.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

Hendrycks 等, 2021: 用 MATH 数据集衡量数学解题能力. arXiv 2103.03874.

<!-- page 19 of 23 -->

Jian Hu, Xibin Wu, Zilin Zhu, Weixun Wang, Dehao Zhang, Yu Cao, et al. Openrlhf: An easy-to-use, scalable and high-performance rlhf framework. arXiv preprint arXiv:2405.11143, 2024.

Hu 等, 2024: OpenRLHF, 一个易用, 可扩展, 高性能的 RLHF 框架. arXiv 2405.11143.

Jingcheng Hu, Yinmin Zhang, Qi Han, Daxin Jiang, Xiangyu Zhang, and Heung-Yeung Shum. Open-reasoner-zero: An open source approach to scaling up reinforcement learning on the base model, 2025. URL [https://arxiv.org/abs/2503.24290](https://arxiv.org/abs/2503.24290).

Hu 等, 2025: Open-Reasoner-Zero, 在基座模型上扩大强化学习规模的开源做法. arXiv 2503.24290.

Hugging Face. Open r1: A fully open reproduction of deepseek-r1, January 2025. URL [https://github.com/huggingface/open-r1](https://github.com/huggingface/open-r1).

Hugging Face, 2025 年 1 月: Open R1, DeepSeek-R1 的完全开放复现. GitHub 仓库.

Aaron Jaech, Adam Kalai, Adam Lerer, Adam Richardson, Ahmed El-Kishky, Aiden Low, Alec Helyar, Aleksander Madry, Alex Beutel, Alex Carney, et al. Openai o1 system card. arXiv preprint arXiv:2412.16720, 2024.

Jaech 等, 2024: OpenAI o1 系统卡. arXiv 2412.16720.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv:2403.07974, 2024.

Jain 等, 2024: LiveCodeBench, 面向代码的大语言模型全面且无污染的评估. arXiv 2403.07974.

Armand Joulin, Edouard Grave, Piotr Bojanowski, Matthijs Douze, Hérve Jégou, and Tomas Mikolov. Fasttext.zip: Compressing text classification models. arXiv preprint arXiv:1612.03651, 2016.

Joulin 等, 2016: FastText.zip, 压缩文本分类模型. arXiv 1612.03651.

Hao Li, Zheng Xu, Gavin Taylor, Christoph Studer, and Tom Goldstein. Visualizing the loss landscape of neural nets, 2018. URL [https://arxiv.org/abs/1712.09913](https://arxiv.org/abs/1712.09913).

Li 等, 2018: 神经网络 loss 地形的可视化. arXiv 1712.09913.

Zichen Liu, Changyu Chen, Wenjun Li, Penghui Qi, Tianyu Pang, Chao Du, Wee Sun Lee, and Min Lin. Understanding r1-zero-like training: A critical perspective. arXiv preprint arXiv:2503.20783, 2025.

Liu 等, 2025: 理解 R1-Zero 式训练, 一个批判性视角. arXiv 2503.20783.

Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. In International Conference on Learning Representations (ICLR), 2024.

Lu 等, 2024: MathVista, 在视觉情境中评估基础模型的数学推理. ICLR 2024.

MistralAI. Mistral large 2. [https://mistral.ai/news/mistral-large-2407](https://mistral.ai/news/mistral-large-2407), 2024.

MistralAI, 2024: Mistral Large 2 发布页.

MistralAI. Mistral medium 3. [https://mistral.ai/fr/news/mistral-medium-3](https://mistral.ai/fr/news/mistral-medium-3), 2025.

MistralAI, 2025: Mistral Medium 3 发布页.

Michael Noukhovitch, Shengyi Huang, Sophie Xhonneux, Arian Hosseini, Rishabh Agarwal, and Aaron Courville. Asynchronous rlhf: Faster and more efficient off-policy rl for language models. arXiv preprint arXiv:2410.18252, 2024.

Noukhovitch 等, 2024: 异步 RLHF, 更快更高效的语言模型 off-policy RL. arXiv 2410.18252.

Guilherme Penedo, Anton Lozhkov, Hynek Kydlíček, Loubna Ben Allal, Edward Beeching, Agustín Piqueres Lajarín, Quentin Gallouédec, Nathan Habib, Lewis Tunstall, and Leandro von Werra. Codeforces cots. [https://huggingface.co/datasets/open-r1/codeforces-cots](https://huggingface.co/datasets/open-r1/codeforces-cots),2025.

Penedo 等, 2025: Codeforces CoTs 数据集, Hugging Face.

Long Phan, Alice Gatti, Ziwen Han, Nathaniel Li, Josephina Hu, Hugh Zhang, Chen Bo Calvin Zhang, Mohamed Shaaban, John Ling, Sean Shi, et al. Humanity's last exam. arXiv preprint arXiv:2501.14249, 2025.

Phan 等, 2025: Humanity's Last Exam (人类最后的考试). arXiv 2501.14249.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024.

Rein 等, 2024: GPQA, 研究生水平, 搜不到答案的问答基准. 首届 COLM 会议.

Youcef Saad. Iterative methods for sparse linear systems. SIAM, 2003.

Saad, 2003: 稀疏线性方程组的迭代方法. SIAM 出版.

John Schulman, Filip Wolski, Prafulla Dhariwal, Alec Radford, and Oleg Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv:1707.06347, 2017.

Schulman 等, 2017: 近端策略优化 (PPO) 算法. arXiv 1707.06347.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models, 2024. URL [https://arxiv.org/abs/2402.03300](https://arxiv.org/abs/2402.03300).

Shao 等, 2024: DeepSeekMath, 推高开放语言模型数学推理的上限 (GRPO 出处). arXiv 2402.03300.

<!-- page 20 of 23 -->

Guangming Sheng, Chi Zhang, Zilingfeng Ye, Xibin Wu, Wang Zhang, Ru Zhang, Yanghua Peng, Haibin Lin, and Chuan Wu. Hybridflow: A flexible and efficient rlhf framework. arXiv preprint arXiv:2409.19256, 2024.

Sheng 等, 2024: HybridFlow, 灵活高效的 RLHF 框架. arXiv 2409.19256.

Shenzhi Wang, Le Yu, Chang Gao, Chujie Zheng, Shixuan Liu, Rui Lu, Kai Dang, Xionghui Chen, Jianxin Yang, Zhenru Zhang, et al. Beyond the 80/20 rule: High-entropy minority tokens drive effective reinforcement learning for llm reasoning. arXiv preprint arXiv:2506.01939, 2025.

Wang 等, 2025: 超越 80/20 法则, 少数高熵 token 驱动 LLM 推理的有效强化学习. arXiv 2506.01939.

Bo Wu, Sid Wang, Yunhao Tang, Jia Ding, Eryk Helenowski, Liang Tan, Tengyu Xu, Tushar Gowda, Zhengxing Chen, Chen Zhu, et al. Llamarl: A distributed asynchronous reinforcement learning framework for efficient large-scale llm trainin. arXiv preprint arXiv:2505.24034, 2025.

Wu 等, 2025: LlamaRL, 面向高效大规模 LLM 训练的分布式异步强化学习框架 (原题末词拼作 「trainin」). arXiv 2505.24034.

Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan, Xiaochen Zuo, Yu Yue, Tiantian Fan, Gaohong Liu, Lingjun Liu, Xin Liu, et al. Dapo: An open-source llm reinforcement learning system at scale. arXiv preprint arXiv:2503.14476, 2025.

Yu 等, 2025: DAPO, 一个开源的大规模 LLM 强化学习系统 (Clip-Higher 和软长度惩罚的出处). arXiv 2503.14476.

Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, Cong Wei, Botao Yu, Ruibin Yuan, Renliang Sun, Ming Yin, Boyuan Zheng, Zhenzhu Yang, Yibo Liu, Wenhao Huang, Huan Sun, Yu Su, and Wenhu Chen. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proceedings of CVPR, 2024.

Yue 等, 2024: MMMU, 面向专家级 AGI 的大规模多学科多模态理解与推理基准. CVPR 2024.

Xiang Yue, Tianyu Zheng, Yuansheng Ni, Yubo Wang, Kai Zhang, Shengbang Tong, Yuxuan Sun, Botao Yu, Ge Zhang, Huan Sun, Yu Su, Wenhu Chen, and Graham Neubig. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. In Proceedings of ACL, 2025.

Yue 等, 2025: MMMU-Pro, 更稳健的多学科多模态理解基准. ACL 2025.

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models, 2023. URL [https://arxiv.org/abs/2311.07911](https://arxiv.org/abs/2311.07911).

Zhou 等, 2023: 大语言模型的指令遵循评估 (IFEval 出处). arXiv 2311.07911.

<!-- page 21 of 23 -->

![图 14 物理多模态题示例: 上半 Problem 有一张示意图, 光线从上方介质 n1 斜射入 n2, 向法线偏折, 再进入 n3 后几乎贴着界面水平射出; 题目问三种介质中光速的关系, 选项 A. v3 > v1 > v2, B. v1 > v2 > v3, C. v1 > v3 < v2, D. v2 > v3 > v1; 下半 Model Generation 是 think 标签内的等宽字体推理, 依据折射率与光速成反比, 推出 v3 > v1 > v2, 末行 Final Answer: A](images/p21-figure-14-a-physics-multimodal-problem-and-its-solution.png)

Figure 14: A physics multimodal problem and its solution generated by Magistral Medium.

图 14: 一道物理多模态题, 以及 Magistral Medium 生成的解答.

> **看表:** 图 14 的解答推理过程顺不顺?
> 结论 A (v3 > v1 > v2) 和示意图的偏折方向一致: 进入 n2 时偏向法线, 进入 n3 时远离法线且比 n1 中更平. 推理里有一处排版粘连, 「v1 > v2 v3 > v2」 两个不等式挤在一起, 不影响结论. 论文没有给出这道题的来源和标准答案.

<!-- page 22 of 23 -->

![图 15 化学多模态题示例: 上半 Problem 问 "Which arrow points to a hydrogen bond?", 附图是几个水分子, 用实线表示 O-H 共价键, 虚线表示分子间作用, 四个带圈字母 a, b, c, d 的箭头指向不同的键; 下半 Model Generation 在 think 标签内逐个分析箭头 a 到 d, 判定 a, b, d 指向同一分子内的共价键, c 指向一个水分子的 H 与另一个水分子的 O 之间的键, think 后给出一段总结, 末行 Final Answer: c](images/p22-figure-15-a-chemistry-multimodal-problem-and-its.png)

Figure 15: A chemistry multimodal problem and its solution generated by Magistral Medium.

图 15: 一道化学多模态题, 以及 Magistral Medium 生成的解答.

<!-- page 23 of 23 -->

![图 16 生物多模态题示例: 上半 Problem 问 "What is leading to the crinkling of this leaf's veins?", 选项 A. Bacterial pathogen, B. I don't know and I don't want to guess, C. Fungal pathogen, D. Oomycete (watermould) pathogen, E. Physiological condition; no pathogen involved, 下附一张绿色叶片叶脉皱缩的特写照片; 下半 Model Generation 在 think 标签内先排除 A, C, D, 再指出 B 不是有效答案, 认为 E 最可能, think 后以 Summary: 开头总结, 末行 Final Answer: E](images/p23-figure-16-a-biology-multimodal-problem-and-its-solution.png)

Figure 16: A biology multimodal problem and its solution generated by Magistral Medium.

图 16: 一道生物多模态题, 以及 Magistral Medium 生成的解答.

> **拆开:** 图 14 到图 16 三个例子是对是错, 格式守了没有?
> 三图都只给了模型输出, 没给标准答案, 对错页面没说. 格式上三图都有一对 &lt;think&gt; 标签, 和第 3 页的标签要求一致; 但图 15 和图 16 在 think 之后写了一段总结, 图 14 直接给 「Final Answer: A」, 都没有用第 3 页数学回答要求的 \boxed{}. 这三道是选择题, 不在 RL 训练的数学和代码格式规则之内.
