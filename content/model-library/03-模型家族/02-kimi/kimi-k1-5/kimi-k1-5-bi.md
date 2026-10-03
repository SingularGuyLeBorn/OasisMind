---
title: "Kimi k1.5 · 对照译稿"
category: "模型库"
tags: ["Kimi", "对照译稿"]
published: true
excerpt: "Kimi k1.5 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 25 -->

# KIMI K1.5: SCALING REINFORCEMENT LEARNING WITH LLMS # KIMI K1.5：用大语言模型扩展强化学习

TECHNICAL REPORT OF KIMI K1.5



Kimi k1.5 技术报告

**Kimi Team**

## ABSTRACT

Language model pretraining with next token prediction has proved effective for scaling compute but is limited to the amount of available training data. Scaling reinforcement learning (RL) unlocks a new axis for the continued improvement of artificial intelligence, with the promise that large language models (LLMs) can scale their training data by learning to explore with rewards. However, prior published work has not produced competitive results. In light of this, we report on the training practice of Kimi k1.5, our latest multi-modal LLM trained with RL, including its RL training techniques, multi-modal data recipes, and infrastructure optimization. Long context scaling and improved policy optimization methods are key ingredients of our approach, which establishes a simplistic, effective RL framework without relying on more complex techniques such as Monte Carlo tree search, value functions, and process reward models. Notably, our system achieves state-of-the-art reasoning performance across multiple benchmarks and modalities-e. g., 77.5 on AIME, 96.2 on MATH 500, 94-th percentile on Codeforces, 74.9 on MathVista-matching OpenAI’s o1. Moreover, we present effective long2short methods that use long-CoT techniques to improve short-CoT models, yielding state-of-the-art short-CoT reasoning results-e. g., 60.8 on AIME, 94.6 on MATH500, 47.3 on LiveCodeBench-outperforming existing short-CoT models such as GPT-4o and Claude Sonnet 3.5 by a large margin (up to +550%).



用下一 token 预测做语言模型预训练，在算力扩展上已经证明有效，但受限于可用训练数据量。扩展强化学习（RL）打开了继续提升智能的新轴：大语言模型（LLM）有望靠「带奖励的探索」自己扩大训练信号。不过此前公开工作尚未交出有竞争力的成绩。据此，我们报告最新多模态 LLM--Kimi k1.5-- 的 RL 训练实践，涵盖 RL 训练技术，多模态数据配方与基础设施优化。长上下文扩展与改进的策略优化是关键配料，据此建立了一套朴素而有效的 RL 框架，不必依赖蒙特卡洛树搜索，价值函数，过程奖励模型等更复杂技术。系统在多基准，多模态上达到当时领先的推理表现-- 例如 AIME 77.5，MATH 500 96.2，Codeforces 第 94 百分位，MathVista 74.9-- 与 OpenAI 的 o1 相当。此外，我们提出有效的 long2short 方法，用长 CoT(long-CoT)技术改进短 CoT(short-CoT)模型，短链推理亦达领先-- 例如 AIME 60.8，MATH500 94.6，LiveCodeBench 47.3-- 大幅超过 GPT-4o，Claude Sonnet 3.5 等既有短链模型（最高约 +550%）。

（「long-CoT / short-CoT」：长/短 CoT，指推理时生成很长或较短的中间步骤；「long2short」：把长链模型学到的思考先验迁移到短链，省 TestingTime token 的一类方法。）

![Chart block](images/p01-figure-1-kimi-k1-5-long-cot-results.png)

Figure 1: Kimi k1.5 long-CoT results.



图 1: Kimi k1.5 长 CoT 结果。

<!-- page 2 of 25 -->

Kimi k1.5

TECHNICAL REPORT

![Chart block](images/p02-figure-2-kimi-k1-5-short-cot-results.png)

Figure 2: Kimi k1.5 short-CoT results.



图 2: Kimi k1.5 短 CoT 结果。

## 1 Introduction

Language model pretraining with next token prediction has been studied under the context of the scaling law, where proportionally scaling model parameters and data sizes leads to the continued improvement of intelligence. (Kaplan et al. 2020; Hoffmann et al. 2022) However, this approach is limited to the amount of available high-quality training data (Villalobos et al. 2024; Muennighoff et al. 2023). In this report, we present the training recipe of Kimi k1.5, our latest multi-modal LLM trained with reinforcement learning (RL). The goal is to explore a possible new axis for continued scaling. Using RL with LLMs, the models learns to explore with rewards and thus is not limited to a pre-existing static dataset.



下一 token 预测预训练常在 Scaling Laws 语境下讨论：按比例放大参数与数据，智能持续提升。但这条路受高质量训练数据量限制。本报告给出 Kimi k1.5-- 最新用强化学习训练的多模态 LLM-- 的训练配方，目标是探索继续扩展的新轴。对 LLM 做 RL，模型靠奖励探索，因而不再绑死在预先给定的静态数据集上。

There are a few key ingredients about the design and training of k1.5.



k1.5 的设计与训练有几块关键配料。

• **Long context scaling**. We scale the context window of RL to 128k and observe continued improvement of performance with an increased context length. A key idea behind our approach is to use partial rollouts to improve training efficiency-i. e., sampling new trajectories by reusing a large chunk of previous trajectories, avoiding the cost to re-generate the new trajectories from scratch. Our observation identifies the context length as a key dimension of the continued scaling of RL with LLMs.



• **长上下文扩展**。把 RL 的上下文窗口扩到 128k，并观察到性能随上下文变长继续提升。关键想法是用 partial rollout（分段 rollout）提高训练效率-- 大量复用先前轨迹片段来采新轨迹，避免从头重生成整条轨迹的成本。观察表明：上下文长度是 LLM 上 RL 继续扩展的关键维度。

• **Improved policy optimization**. We derive a formulation of RL with long-CoT and employ a variant of online mirror descent for robust policy optimization. This algorithm is further improved by our effective sampling strategy, length penalty, and optimization of the data recipe.



• **改进的策略优化**。我们导出 long-CoT 下的 RL 表述，并用在线镜像下降（online mirror descent）的变体做稳健策略优化；再辅以有效采样策略，长度惩罚与数据配方优化。

• **Simplistic Framework**. Long context scaling, combined with the improved policy optimization methods, establishes a simplistic RL framework for learning with LLMs. Since we are able to scale the context length, the learned CoTs exhibit the properties of planning, reflection, and correction. An increased context length has an effect of increasing the number of search steps. As a result, we show that strong performance can be achieved without relying on more complex techniques such as Monte Carlo tree search, value functions, and process reward models.



• **朴素框架**。长上下文扩展加上改进的策略优化，构成面向 LLM 的朴素 RL 框架。上下文能拉长后，学到的 CoT 会表现出规划，反思与纠错；加长上下文相当于增加搜索步数。因此，不必依赖蒙特卡洛树搜索，价值函数，过程奖励模型等更复杂技术，也能达到强表现。

• **Multimodalities**. Our model is jointly trained on text and vision data, which has the capabilities of jointly reasoning over the two modalities.



• **多模态**。模型在文本与视觉数据上联合训练，能对两种模态联合推理。

Moreover, we present effective long2short methods that use long-CoT techniques to improve short-CoT models. Specifically, our approaches include applying length penalty with long-CoT activations and model merging.



此外，我们提出有效的 long2short 方法，用长链技术改进短链模型；具体包括在长链激活上施加长度惩罚，以及模型合并。

Our long-CoT version achieves state-of-the-art reasoning performance across multiple benchmarks and modalities-e. g., 77.5 on AIME, 96.2 on MATH 500, 94-th percentile on Codeforces, 74.9 on MathVista-matching OpenAI’s o1. Our model also achieves state-of-the-art short-CoT reasoning results-e. g., 60.8 on AIME, 94.6 on MATH500, 47.3 on LiveCodeBench-outperforming existing short-CoT models such as GPT-4o and Claude Sonnet 3.5 by a large margin (up to +550%). Results are shown in Figures 1 and 2.



长链版本在多基准，多模态上达到领先推理表现-- 例如 AIME 77.5，MATH 500 96.2，Codeforces 第 94 百分位，MathVista 74.9-- 与 OpenAI o1 相当。短链推理亦领先-- 例如 AIME 60.8，MATH500 94.6，LiveCodeBench 47.3-- 大幅超过 GPT-4o，Claude Sonnet 3.5 等既有短链模型（最高约 +550%）。结果见图 1，图 2。

<!-- page 3 of 25 -->

## 2 Approach: Reinforcement Learning with LLMs ## 2 方法：面向 LLM 的强化学习

The development of Kimi k1.5 consists of several stages: pretraining, vanilla supervised fine-tuning (SFT), long-CoT supervised fine-turning, and reinforcement learning (RL). This report focuses on RL, beginning with an overview of the RL prompt set curation (Section 2.1) and long-CoT supervised finetuning (Section 2.2), followed by an in-depth discussion of RL training strategies in Section 2.3. Additional details on pretraining and vanilla supervised finetuning can be found in Section 2.5.



Kimi k1.5 的开发分多阶段：预训练，常规监督微调（SFT），长 CoT 监督微调，以及强化学习（RL）。本报告聚焦 RL：先概述 RL 提示集策展（§2.1）与长链监督微调（§2.2），再深入 §2.3 的 RL 训练策略。预训练与常规 SFT 细节见 §2.5。

### 2.1 RL Prompt Set Curation ### 2.1 RL 提示集策展

Through our preliminary experiments, we found that the quality and diversity of the RL prompt set play a critical role in ensuring the effectiveness of reinforcement learning. A well-constructed prompt set not only guides the model toward robust reasoning but also mitigates the risk of reward hacking and overfitting to superficial patterns. Specifically, three key properties define a high-quality RL prompt set:



初步实验表明，RL 提示集的质量与多样性对强化学习是否有效至关重要。构造得当的提示集既能引导稳健推理，又能缓解奖励黑客与对肤浅模式过拟合。高质量 RL 提示集有三个关键性质：

• **Diverse Coverage**: Prompts should span a wide array of disciplines, such as STEM, coding, and general reasoning, to enhance the model’s adaptability and ensure broad applicability across different domains.



• **覆盖要广**：提示应跨越 STEM，编程，一般推理等多学科，增强适应性与跨域适用性。

• **Balanced Difficulty**: The prompt set should include a well-distributed range of easy, moderate, and difficult questions to facilitate gradual learning and prevent overfitting to specific complexity levels.



• **难度要均衡**：提示集应合理覆盖易，中，难，便于循序学习，避免只拟合某一复杂度。

• **Accurate Evaluability**: Prompts should allow objective and reliable assessment by verifiers, ensuring that model performance is measured based on correct reasoning rather than superficial patterns or random guess.



• **可准确评估**：提示应能被核验器客观，可靠地评判，让表现建立在正确推理上，而不是肤浅模式或瞎猜。

To achieve diverse coverage in the prompt set, we employ automatic filters to select questions that require rich reasoning and are straightforward to evaluate. Our dataset includes problems from various domains, such as STEM fields, competitions, and general reasoning tasks, incorporating both text-only and image-text question-answering data. Furthermore, we developed a tagging system to categorize prompts by domain and discipline, ensuring balanced representation across different subject areas (M. Li et al. 2023; W. Liu et al. 2023).



为求覆盖广，我们用自动过滤器选出「需要丰富推理，又便于评估」的题。数据涵盖 STEM，竞赛，一般推理等，含纯文本与图文问答。还做了按领域/学科打标的系统，保证各科表示均衡。

We adopt a model-based approach that leverages the model’s own capacity to adaptively assess the difficulty of each prompt. Specifically, for every prompt, an SFT model generates answers ten times using a relatively high sampling temperature. The pass rate is then calculated and used as a proxy for the prompt’s difficulty-the lower the pass rate, the higher the difficulty. This approach allows difficulty evaluation to be aligned with the model’s intrinsic capabilities, making it highly effective for RL training. By leveraging this method, we can prefilter most trivial cases and easily explore different sampling strategies during RL training.



难度用模型自身能力自适应评估：对每条提示，用 SFT 模型在较高采样温度下生成十次答案，把通过率当作难度代理-- 通过率越低越难。这样难度评估与模型内禀能力对齐，对 RL 训练很有效；可预先滤掉多数琐碎题，并在 RL 中方便探索不同采样策略。

To avoid potential reward hacking (Everitt et al. 2021; Pan et al. 2022), we need to ensure that both the reasoning process and the final answer of each prompt can be accurately verified. Empirical observations reveal that some complex reasoning problems may have relatively simple and easily guessable answers, leading to false positive verification-where the model reaches the correct answer through an incorrect reasoning process. To address this issue, we exclude questions that are prone to such errors, such as multiple-choice, true/false, and proof-based questions. Furthermore, for general question-answering tasks, we propose a simple yet effective method to identify and remove easy-to-hack prompts. Specifically, we prompt a model to guess potential answers without any CoT reasoning steps. If the model predicts the correct answer within N attempts, the prompt is considered too easy-to-hack and removed. We found that setting N = 8 can remove the majority easy-to-hack prompts. Developing more advanced verification models remains an open direction for future research.



为避免潜在奖励黑客，需要保证每条提示的推理过程与最终答案都能被准确核验。经验上，有些复杂推理题答案却相对简单，易猜，会造成假阳性核验-- 模型推理错了却蒙对答案。因此排除易出此类问题的题型，如选择题，判断题，证明题。对一般问答，我们提出简单有效的筛「易黑客」提示的方法：让模型在不做任何 CoT 的情况下猜答案；若在 N 次内猜对，就视为太易黑客并剔除。发现 N = 8 可去掉多数易黑客提示。更先进的核验模型仍是开放研究方向。

### 2.2 Long-CoT Supervised Fine-Tuning ### 2.2 长 CoT 监督微调

With the refined RL prompt set, we employ prompt engineering to construct a small yet high-quality long-CoT warmup dataset, containing accurately verified reasoning paths for both text and image inputs. This approach resembles rejection sampling (RS) but focuses on generating long-CoT reasoning paths through prompt engineering. The resulting warmup dataset is designed to encapsulate key cognitive processes that are fundamental to human-like reasoning, such as **planning**, where the model systematically outlines steps before execution; **evaluation**, involving critical assessment of intermediate steps; **reflection**, enabling the model to reconsider and refine its approach; and **exploration**, encouraging consideration of alternative solutions. By performing a lightweight SFT on this warm-up dataset, we effectively prime the model to internalize these reasoning strategies. As a result, the fine-tuned long-CoT model demonstrates improved capability in generating more detailed and logically coherent responses, which enhances its performance across diverse reasoning tasks.



有了精炼后的 RL 提示集，我们用提示工程构造小而高质量的 long-CoT 热身集，含文本与图像输入上经准确核验的推理路径。做法类似拒绝采样（RS），但重点是用提示工程生成长链推理路径。热身集旨在封装类人推理的关键认知过程：**规划**（执行前系统列出步骤），**评估**（批判性审视中间步骤），**反思**（重新考虑并 refinement 路径），**探索**（考虑备选解）。在这批热身数据上做轻量 SFT，可有效启动模型内化这些策略；微调后的长链模型能生成更细致，逻辑更连贯的回复，多样推理任务上表现更好。

<!-- page 4 of 25 -->

### 2.3 Reinforcement Learning ### 2.3 强化学习

#### 2.3.1 Problem Setting #### 2.3.1 问题设定

Given a training dataset $\mathcal { D } = \{ ( x _ { i } , y _ { i } ^ { * } ) \} _ { i = } ^ { n }$ 1 of problems $x _ { i }$ and corresponding ground truth answers $y _ { i } ^ { * }$ , our goal is to train a policy model $\pi _ { \theta }$ to accurately solve test problems. In the context of complex reasoning, the mapping of problem x to solution $y$ is non-trivial. To tackle this challenge, the chain of thought (CoT) method proposes to use a sequence of intermediate steps $z = ( z _ { 1 } , z _ { 2 } , \ldots , z _ { m } )$ to bridge x and $y , $ where each $z _ { i }$ is a coherent sequence of tokens that acts as a significant intermediate step toward solving the problem (J. Wei et al. 2022). When solving problem x, thoughts $z _ { t } \sim \pi _ { \theta } ( \cdot | x , z _ { 1 } , \ldots , z _ { t - 1 } )$ are auto-regressively sampled, followed by the final answer $y \sim \pi _ { \theta } ( \cdot | x , z _ { 1 } , \ldots , z _ { m } )$ . We use $y , z \sim \pi _ { \theta }$ to denote this sampling procedure. Note that both the thoughts and final answer are sampled as a language sequence.



给定训练集 $\mathcal{D}=\{(x_i, y_i^*)\}_{i=1}^n$（题 $x_i$ 与标准答案 $y_i^*$），目标是训练策略 $\pi_\theta$ 准确解测试题。复杂推理里从题 x 到解 $y$ 的映射并不平凡。CoT(CoT)用中间步骤序列 $z=(z_1, \ldots, z_m)$ 桥接 x 与 $y$，每步 $z_i$ 是一段连贯 token，作为解题的重要中间环节。解题时自回归采样思考 $z_t\sim\pi_\theta(\cdot|x, z_1, \ldots, z_{t-1})$，再采最终答案 $y\sim\pi_\theta(\cdot|x, z_1, \ldots, z_m)$；记为 $y, z\sim\pi_\theta$。思考与最终答案都以语言序列形式采样。

To further enhance the model’s reasoning capabilities, planning algorithms are employed to explore various thought processes, generating improved CoT at inference time (Yao et al. 2024; Y. Wu et al. 2024; Snell et al. 2024). The core insight of these approaches is the explicit construction of a search tree of thoughts guided by value estimations. This allows the model to explore diverse continuations of a thought process or backtrack to investigate new directions when encountering dead ends. In more detail, let $\mathcal { T }$ be a search tree where each node represents a partial solution $s   =   ( x , z _ { 1 : | s | } )$ Here s consists of the problem x and a sequence of thoughts $z _ { 1 : | s | }   =   ( z _ { 1 } , \ldots , z _ { | s | } )$ leading up to that node, with |s| denoting number of thoughts in the sequence. The planning algorithm uses a critic model v to provide feedback $v ( x , z _ { 1 : | s | } )$ , which helps evaluate the current progress towards solving the problem and identify any errors in the existing partial solution. We note that the feedback can be provided by either a discriminative score or a language sequence(L. Zhang et al. 2024). Guided by the feedbacks for all $s \in \mathcal { T }$ , the planning algorithm selects the most promising node for expansion, thereby growing the search tree. The above process repeats iteratively until a full solution is derived.



为进一步增强推理，推理时可用规划算法探索多种思考过程，生成更好的 CoT。核心洞察是：在价值估计引导下显式构造「想法搜索树」，从而探索多样续写，或在死胡同回溯换方向。设搜索树 $\mathcal{T}$，每个节点是部分解 $s=(x, z_{1: |s|})$。规划算法用批评模型 $v$ 给出反馈 $v(x, z_{1: |s|})$，评估当前进度并发现已有部分解中的错误；反馈可以是判别分数，也可以是语言序列。依据树上所有节点的反馈，算法选出最有希望的节点扩展，迭代直至得到完整解。

We can also approach planning algorithms from an algorithmic perspective. Given past search history available at the t-th iteration $( s _ { 1 } , v ( s _ { 1 } ) , \ldots , s _ { t - 1 } , v ( s _ { t - 1 } ) )$ , a planning algorithm $\mathcal { A }$ iteratively determines the next search direction $\mathcal { A } ( s _ { t } | s _ { 1 } , v ( s _ { 1 } ) , \ldots , s _ { t - 1 } , v ( s _ { t - 1 } ) )$ and provides feedbacks for the current search progress $\mathcal { A } ( v ( s _ { t } ) | s _ { 1 } , v ( s _ { 1 } ) , \ldots , s _ { t } )$ Since both thoughts and feedbacks can be viewed as intermediate reasoning steps, and these components can both be represented as sequence of language tokens, we use z to replace s and v to simplify the notations. Accordingly, we view a planning algorithm as a mapping that directly acts on a sequence of reasoning steps $\mathcal { A } ( \cdot | z _ { 1 } , z _ { 2 } , \dots )$ . In this framework, all information stored in the search tree used by the planning algorithm is flattened into the full context provided to the algorithm. This provides an intriguing perspective on generating high-quality CoT: Rather than explicitly constructing a search tree and implementing a planning algorithm, we could potentially train a model to approximate this process. Here, the number of thoughts (i. e., language tokens) serves as an analogy to the computational budget traditionally allocated to planning algorithms. Recent advancements in long context windows facilitate seamless scalability during both the training and testing phases. If feasible, this method enables the model to run an implicit search over the reasoning space directly via auto-regressive predictions. Consequently, the model not only learns to solve a set of training problems but also develops the ability to tackle individual problems effectively, leading to improved generalization to unseen test problems.



也可从算法视角看规划：第 t 轮给定历史 $(s_1, v(s_1), \ldots)$，规划算法 $\mathcal{A}$ 决定下一搜索方向并给出当前进度反馈。思考与反馈都可看成中间推理步骤，都可用语言 token 序列表示，于是用 z 统一记号，把规划算法看成作用在推理步骤序列上的映射 $\mathcal{A}(\cdot|z_1, z_2, \ldots)$。搜索树里存的信息，全部展平成算法看到的完整上下文。这给出一个有趣视角：不必显式建树，实现规划算法，或许可以训练模型去近似这一过程；想法（语言 token）数量类比传统规划算法的计算预算。长上下文窗口的进展使训练与测试期都能顺滑扩展。若可行，模型就能通过自回归预测在推理空间做隐式搜索-- 不仅学会解训练集上的题，也学会有效攻克单题，从而更好泛化到未见测试题。

We thus consider training the model to generate CoT with reinforcement learning (RL) (OpenAI 2024). Let $r$ be a reward model that justifies the correctness of the proposed answer y for the given problem x based on the ground truth $y ^ { * }$ , by assigning a value $r ( x , y , y ^ { * } ) \in \{ 0 , 1 \}$ . For verifiable problems, the reward is directly determined by predefined criteria or rules. For example, in coding problems, we assess whether the answer passes the test cases. For problems with free-form ground truth, we train a reward model $r ( x , y , y ^ { * } )$ that predicts if the answer matches the ground truth. Given a problem $x , $ the model $\pi _ { \theta }$ generates a CoT and the final answer through the sampling procedure $z \sim \pi _ { \theta } ( \cdot | x )$ $y \sim \pi _ { \theta } ( \cdot | x , z )$ . The quality of the generated CoT is evaluated by whether it can lead to a correct final answer. In summary, we consider the following objective to optimize the policy



因此考虑用强化学习训练模型生成 CoT。设奖励模型 $r$ 依据标准答案 $y^*$ 判断题 x 上答案 y 是否正确，给出 $r(x, y, y^*)\in\{0, 1\}$。对可核验题，奖励由预定义准则或规则直接决定（如代码是否通过测例）；对自由形式标准答案，则训练奖励模型预测答案是否匹配。给定题 $x$，模型采样 $z\sim\pi_\theta(\cdot|x)$，$y\sim\pi_\theta(\cdot|x, z)$；CoT 质量由是否导向正确答案衡量。策略优化目标为

$$
\max _ {\theta} \mathbb {E} _ {(x, y ^ {*}) \sim \mathcal {D}, (y, z) \sim \pi_ {\theta}} \left[ r (x, y, y ^ {*}) \right]. \tag{1}
$$

By scaling up RL training, we aim to train a model that harnesses the strengths of both simple prompt-based CoT and planning-augmented CoT. The model still auto-regressively sample language sequence during inference, thereby circumventing the need for the complex parallelization required by advanced planning algorithms during deployment. However, a key distinction from simple prompt-based methods is that the model should not merely follow a series of reasoning steps. Instead, it should also learn critical planning skills including error identification, backtracking and solution refinement by leveraging the entire set of explored thoughts as contextual information.



通过放大 RL 训练，希望兼得简单提示式 CoT 与规划增强 CoT 的长处：推理时仍自回归采样语言序列，部署时不必做高级规划算法那种复杂并行；但又与简单提示不同-- 模型不应只跟一串步骤走，而应学会利用整段已探索想法作上下文，掌握找错，回溯，refinement 等关键规划技能。

<!-- page 5 of 25 -->

#### 2.3.2 Policy Optimization #### 2.3.2 策略优化

We apply a variant of online policy mirror decent as our training algorithm (Abbasi-Yadkori et al. 2019; Mei et al. 2019; Tomar et al. 2020). The algorithm performs iteratively. At the i-th iteration, we use the current model $\pi _ { \theta _ { i } }$ as a reference model and optimize the following relative entropy regularized policy optimization problem,



训练算法采用在线策略镜像下降的变体，迭代进行。第 i 轮以当前模型 $\pi_{\theta_i}$ 为参考，优化如下相对熵正则的策略优化问题：

$$
\max _ {\theta} \mathbb {E} _ {(x, y ^ {*}) \sim \mathcal {D}} \left[ \mathbb {E} _ {(y, z) \sim \pi_ {\theta}} \left[ r (x, y, y ^ {*}) \right] - \tau \mathrm{KL} (\pi_ {\theta} (x) | | \pi_ {\theta_ {i}} (x)) \right], \tag{2}
$$

where $\tau > 0$ is a parameter controlling the degree of regularization. This objective has a closed form solution



其中 $\tau>0$ 控制正则强度。该目标有闭式解

$$
\pi^ {*} (y, z | x) = \pi_ {\theta_ {i}} (y, z | x) \exp (r (x, y, y ^ {*}) / \tau) / Z.
$$

Here $\begin{array} { r } { Z = \sum _ { y ^ { \prime } , z ^ { \prime } } \pi _ { \theta _ { i } } ( y ^ { \prime } , z ^ { \prime } | x ) \exp ( r ( x , y ^ { \prime } , y ^ { * } ) / \tau ) } \end{array}$ is the normalization factor. Taking logarithm of both sides we have for any $( y , z )$ the following constraint is satisfied, which allows us to leverage off-policy data during optimization



$Z$ 为归一化因子。两边取对数后，对任意 $(y, z)$ 满足如下约束，从而优化时可利用离策略数据：

$$
r (x, y, y ^ {*}) - \tau \log Z = \tau \log \frac {\pi^ {*} (y , z | x)}{\pi_ {\theta_ {i}} (y , z | x)}.
$$

This motivates the following surrogate loss



由此得到代理损失

$$
L (\theta) = \mathbb {E} _ {(x, y ^ {*}) \sim \mathcal {D}} \left[ \mathbb {E} _ {(y, z) \sim \pi_ {\theta_ {i}}} \left[ \left(r (x, y, y ^ {*}) - \tau \log Z - \tau \log \frac {\pi_ {\theta} (y , z | x)}{\pi_ {\theta_ {i}} (y , z | x)}\right) ^ {2} \right] \right].
$$

To approximate τ log $Z , $ we use samples $( y _ { 1 } , z _ { 1 } ) , \ldots , ( y _ { k } , z _ { k } ) { \sim } \pi _ { \theta _ { i } } { : }$ τ log $Z \approx \tau$ log $\textstyle { \frac { 1 } { k } } \sum _ { j = 1 } ^ { k }$ exp $\flat ( r ( x , y _ { j } , y ^ { * } ) / \tau )$ We also find that using empirical mean of sampled rewards $\overline { { r } } = \operatorname { m e a n } ( r ( x , y _ { 1 } , y ^ { * } ) , \ldots , r ( x , \dot { y } _ { k } , y ^ { * } ) )$ yields effective practical results. This is reasonable since τ log Z approaches the expected reward under $\pi _ { \theta _ { i } }$ as $\tau \to \infty$ . Finally, we conclude our learning algorithm by taking the gradient of surrogate loss. For each problem x, k responses are sampled using the reference policy $\pi _ { \theta _ { i } }$ , and the gradient is given by



用从 $\pi_{\theta_i}$ 采的 $k$ 条样本近似 $\tau\log Z$；实践中用采样奖励的经验均值 $\bar{r}$ 也很有效-- 因为当 $\tau\to\infty$ 时 $\tau\log Z$ 趋近 $\pi_{\theta_i}$ 下的期望奖励。对每个题 x 用参考策略采 $k$ 条回复，代理损失的梯度为

$$
\frac {1}{k} \sum_ {j = 1} ^ {k} \left(\nabla_ {\theta} \log \pi_ {\theta} (y _ {j}, z _ {j} | x) (r (x, y _ {j}, y ^ {*}) - \bar {r}) - \frac {\tau}{2} \nabla_ {\theta} \left(\log \frac {\pi_ {\theta} (y _ {j} , z _ {j} | x)}{\pi_ {\theta_ {i}} (y _ {j} , z _ {j} | x)}\right) ^ {2}\right). \tag{3}
$$

To those familiar with policy gradient methods, this gradient resembles the policy gradient of (2) using the mean of sampled rewards as the baseline (Kool et al. 2019; Ahmadian et al. 2024). The main differences are that the responses are sampled from $\pi _ { \theta _ { i } }$ rather than on-policy, and an l<sub>2</sub>-regularization is applied. Thus we could see this as the natural extension of a usual on-policy regularized policy gradient algorithm to the off-policy case (Nachum et al. 2017). We sample a batch of problems from D and update the parameters to $\theta _ { i + 1 }$ , which subsequently serves as the reference policy for the next iteration. Since each iteration considers a different optimization problem due to the changing reference policy, we also reset the optimizer at the start of each iteration.



熟悉策略梯度的人会看出：这很像用采样奖励均值作基线时目标（2）的策略梯度；主要差别是回复来自 $\pi_{\theta_i}$（而非在策略），并加了 $l_2$ 正则-- 可看成把常规在策略正则策略梯度自然推广到离策略。从 $\mathcal{D}$ 采一批题，更新到 $\theta_{i+1}$ 并作为下一轮参考；因每轮参考策略变了，优化问题不同，每轮开始还会重置优化器。

We exclude the value network in our training system which has also been exploited in previous studies (Ahmadian et al. 2024). While this design choice significantly improves training efficiency, we also hypothesize that the conventional use of value functions for credit assignment in classical RL may not be suitable for our context. Consider a scenario where the model has generated a partial CoT $( z _ { 1 } , z _ { 2 } , \ldots , z _ { t } )$ and there are two potential next reasoning steps: $z _ { t + 1 }$ and $z _ { t + 1 } ^ { \prime }$ Assume that $z _ { t + 1 }$ directly leads to the correct answer, while $z _ { t + 1 } ^ { \prime }$ contains some errors. If an oracle value function were accessible, it would indicate that $z _ { t + 1 }$ preserves a higher value compared to $z _ { t + 1 } ^ { \prime }$ . According to the standard credit assignment principle, selecting $z _ { t + 1 } ^ { \prime }$ would be penalized as it has a negative advantages relative to the current policy. However, exploring $z _ { t + 1 } ^ { \prime }$ is extremely valuable for training the model to generate long CoT. By using the justification of the final answer derived from a long CoT as the reward signal, the model can learn the pattern of trial and error from taking $z _ { t + 1 } ^ { \prime }$ as long as it successfully recovers and reaches the correct answer. The key takeaway from this example is that we should encourage the model to explore diverse reasoning paths to enhance its capability in solving complex problems. This exploratory approach generates a wealth of experience that supports the development of critical planning skills. Our primary goal is not confined to attaining high accuracy on training problems but focuses on equipping the model with effective problem-solving strategies, ultimately improving its performance on test problems.



训练系统排除价值网络（此前亦有工作这样做）。这显著提高训练效率，且我们假设：经典 RL 用价值函数做信用分配的做法，在本场景未必合适。设想已生成部分 CoT $(z_1, \ldots, z_t)$，下一步有 $z_{t+1}$ 与带错的 $z'_{t+1}$；若有神谕价值函数，会认为 $z_{t+1}$ 价值更高，按标准信用分配，$z'_{t+1}$ 因相对当前策略优势为负而受罚。但探索 $z'_{t+1}$ 对训练长 CoT 极有价值-- 只要最终靠长链恢复并答对，用终局对错作奖励，模型就能从试错路径里学到模式。要点是：应鼓励探索多样推理路径以增强解难题能力；探索带来的经验支撑关键规划技能。首要目标不限于训练集高准确率，而在于配备有效解题策略，最终抬测试表现。

#### 2.3.3 Length Penalty #### 2.3.3 长度惩罚

We observe an overthinking phenomenon that the model’s response length significantly increases during RL training. Although this leads to better performance, an excessively lengthy reasoning process is costly during training and inference, and overthinking is often not preferred by humans. To address this issue, we introduce a length reward to restrain the rapid growth of token length, thereby improving the model’s token efficiency. Given k sampled responses



我们观察到「过思」现象：RL 训练中回复长度显著变长。虽带来更好表现，过长推理在训练与推理都很贵，人类也常不喜欢过思。为此引入长度奖励，抑制 token 长度过快增长，提高 token 效率。给定 k 条采样回复

<!-- page 6 of 25 -->

$( y _ { 1 } , z _ { 1 } ) , \ldots , ( y _ { k } , z _ { k } )$ of problem x with true answer $y ^ { * }$ , let len(i) be the length of $( y _ { i } , z _ { i } )$ , min\_len = min<sub>i</sub> len(i) and max\_len = max<sub>i</sub> len(i). If max\_len = min\_len, we set length reward zero for all responses, as they have the same length. Otherwise the length reward is given by



对题 x 与真答案 $y^*$ 的 k 条 $(y_i, z_i)$，记 len(i) 为长度，min_len / max_len 为最长短长度。若 max_len = min_len，则长度奖励全为 0；否则

$$
\text {len\_reward} (\mathrm{i}) = \left\{ \begin{array}{c l} \lambda & \text {If} r (x, y _ {i}, y ^ {*}) = 1 \\ \min (0, \lambda) & \text {If} r (x, y _ {i}, y ^ {*}) = 0 \end{array} , \quad \text {where} \lambda = 0.5 - \frac {\operatorname{len} (i) - \min \_ \text {len}}{\max \_ \text {len} - \min \_ \text {len}}. \right.
$$

In essence, we promote shorter responses and penalize longer responses among correct ones, while explicitly penalizing long responses with incorrect answers. This length-based reward is then added to the original reward with a weighting parameter.



实质是：在答对的样本里鼓励更短，惩罚更长；对答错且偏长的回复显式惩罚。长度奖励再以权重加到原始奖励上。

In our preliminary experiments, length penalty may slow down training during the initial phases. To alleviate this issue, we propose to gradually warm up the length penalty during training. Specifically, we employ standard policy optimization without length penalty, followed by a constant length penalty for the rest of training.



初步实验中，长度惩罚可能拖慢初期训练。缓解办法是逐渐热身：先做无长度惩罚的标准策略优化，其后训练再用恒定长度惩罚。

#### 2.3.4 Sampling Strategies #### 2.3.4 采样策略

Although RL algorithms themselves have relatively good sampling properties (with more difficult problems providing larger gradients), their training efficiency is limited. Consequently, some well-defined prior sampling methods can yield potentially greater performance gains. We exploit multiple signals to further improve the sampling strategy. First, the RL training data we collect naturally come with different difficulty labels. For example, a math competition problem is more difficult than a primary school math problem. Second, because the RL training process samples the same problem multiple times, we can also track the success rate for each individual problem as a metric of difficulty. We propose two sampling methods to utilize these priors to improve training efficiency.



尽管 RL 算法本身采样性质尚可（更难题梯度更大），训练效率仍有限。因此良定义的先验采样方法可能带来更大收益。我们利用多类信号改进采样：一是收集到的 RL 数据天然带难度标签（如竞赛题难于小学题）；二是同一题在 RL 中多次采样，可跟踪每题成功率作为难度度量。据此提出两种采样方法以提升训练效率。

**Curriculum Sampling** We start by training on easier tasks and gradually progress to more challenging ones. Since the initial RL model has limited performance, spending a restricted computation budget on very hard problems often yields few correct samples, resulting in lower training efficiency. Meanwhile, our collected data naturally includes grade and difficulty labels, making difficulty-based sampling an intuitive and effective way to improve training efficiency.



**课程采样** 先训较易任务，再逐步过渡到更难。初期 RL 模型能力有限，把有限算力砸在极难题上常几乎采不到正确样本，效率低；而数据自带年级/难度标签，按难度采样直观有效。

**Prioritized Sampling** In addition to curriculum sampling, we use a prioritized sampling strategy to focus on problems where the model underperforms. We track the success rates $s _ { i }$ for each problem i and sample problems proportional to $1 - s _ { i } , $ so that problems with lower success rates receive higher sampling probabilities. This directs the model’s efforts toward its weakest areas, leading to faster learning and better overall performance.



**优先采样** 在课程采样之外，按模型表现差的题倾斜：跟踪每题成功率 $s_i$，以与 $1-s_i$ 成比例采样，成功率低的题采样概率更高，把力气砸在最弱处，学得更快，整体更好。

#### 2.3.5 More Details on Training Recipe #### 2.3.5 训练配方更多细节

**Test Case Generation for Coding** Since test cases are not available for many coding problems from the web, we design a method to automatically generate test cases that serve as a reward to train our model with RL. Our focus is primarily on problems that do not require a special judge. We also assume that ground truth solutions are available for these problems so that we can leverage the solutions to generate higher quality test cases.



**代码测例生成** 网上许多编程题没有测例，我们设计自动生成测例的方法，作为 RL 奖励。主要聚焦不需要 special judge 的题，并假设有标准解可用，以便借标准解生成更高质量测例。

We utilize the widely recognized test case generation library, CYaRon, to enhance our approach. We employ our base Kimi k1.5 to generate test cases based on problem statements. The usage statement of CYaRon and the problem description are provided as the input to the generator. For each problem, we first use the generator to produce 50 test cases and also randomly sample 10 ground truth submissions for each test case. We run the test cases against the submissions. A test case is deemed valid if at least 7 out of 10 submissions yield matching results. After this round of filtering, we obtain a set of selected test cases. A problem and its associated selected test cases are added to our training set if at least 9 out of 10 submissions pass the entire set of selected test cases.



借助测例生成库 CYaRon，用底座 Kimi k1.5 按题面生成测例；生成器输入含 CYaRon 用法说明与题述。每题先生成 50 个测例，并对每个测例随机抽 10 份标准提交跑测：至少 7/10 结果一致则测例有效。筛选后再要求至少 9/10 提交通过整套入选测例，才把该题及测例加入训练集。

In terms of statistics, from a sample of 1, 000 online contest problems, approximately 614 do not require a special judge. We developed 463 test case generators that produced at least 40 valid test cases, leading to the inclusion of 323 problems in our training set.



统计上：抽样 1, 000 道在线竞赛题中约 614 道不需 special judge；做出 463 个至少产出 40 个有效测例的生成器，最终 323 道题进入训练集。

**Reward Modeling for Math** One challenge in evaluating math solutions is that different written forms can represent the same underlying answer. For instance, $a ^ { \widetilde { 2 } } - 4$ and $\widetilde{(a + 2)(a - 2)}$ may both be valid solutions to the same problem. We adopted two methods to improve the reward model’s scoring accuracy:



**数学奖励建模** 评估数学解的难点是：不同写法可表示同一答案（如 $a^2-4$ 与 $(a+2)(a-2)$）。我们用两种方法提高奖励模型打分准确性：

1. Classic RM: Drawing inspiration from the InstructGPT (Ouyang et al. 2022) methodology, we implemented a value-head based reward model and collected approximately 800k data points for fine-tuning. The model ultimately



1. 经典 RM：借鉴 InstructGPT，实现基于 value head 的奖励模型，收集约 800k 数据点微调。模型最终

<!-- page 7 of 25 -->

takes as input the “question, ” the “reference answer, ” and the “response, ” and outputs a single scalar that indicates whether the response is correct.



以「问题」「参考答案」「回复」为输入，输出标量表示回复是否正确。

2. Chain-of-Thought RM: Recent research (Ankner et al. 2024; McAleese et al. 2024) suggests that reward models augmented with chain-of-thought (CoT) reasoning can significantly outperform classic approaches, particularly on tasks where nuanced correctness criteria matter-such as mathematics. Therefore, we collected an equally large dataset of about 800k CoT-labeled examples to fine-tune the Kimi model. Building on the same inputs as the Classic RM, the chain-of-thought approach explicitly generates a step-by-step reasoning process before providing a final correctness judgment in JSON format, enabling more robust and interpretable reward signals.



2. CoT RM：近期研究表明带 CoT 的奖励模型可显著优于经典做法，尤其在正确性标准细腻的任务（如数学）。我们同样收集约 800k 带 CoT 标注的例子微调 Kimi 模型；输入与经典 RM 相同，但先显式逐步推理，再以 JSON 给出最终对错判断，奖励信号更稳健，可解释。

During our manual spot checks, the Classic RM achieved an accuracy of approximately 84.4, while the Chain-of-Thought RM reached 98.5 accuracy. In the RL training process, we adopted the Chain-of-Thought RM to ensure more correct feedback.



人工抽查：经典 RM 准确率约 84.4，CoT RM 约 98.5. RL 训练采用 CoT RM，以保证反馈更正确。

**Vision Data** To improve the model’s real-world image reasoning capabilities and to achieve a more effective alignment between visual inputs and large language models (LLMs), our vision reinforcement learning (Vision RL) data is primarily sourced from three distinct categories: Real-world data, Synthetic visual reasoning data, and Text-rendered data.



**视觉数据** 为提升真实图像推理，更好对齐视觉输入与 LLM，视觉 RL 数据主要来自三类：真实世界数据，合成视觉推理数据，文本渲染数据。

1. The real-world data encompass a range of science questions across various grade levels that require graphical comprehension and reasoning, location guessing tasks that necessitate visual perception and inference, and data analysis that involves understanding complex charts, among other types of data. These datasets improve the model’s ability to perform visual reasoning in real-world scenarios.



1. 真实世界数据：各年级需读图推理的理科题，需视觉感知与推断的定位猜题，需理解复杂图表的数据分析等，提升真实场景视觉推理。

2. Synthetic visual reasoning data is artificially generated, including procedurally created images and scenes aimed at improving specific visual reasoning skills, such as understanding spatial relationships, geometric patterns, and object interactions. These synthetic datasets offer a controlled environment for testing the model’s visual reasoning capabilities and provide an endless supply of training examples.



2. 合成视觉推理数据：程序生成图像与场景，针对空间关系，几何模式，物体交互等技能；环境可控，训练样本近乎无限。

3. Text-rendered data is created by converting textual content into visual format, enabling the model to maintain consistency when handling text-based queries across different modalities. By transforming text documents, code snippets, and structured data into images, we ensure the model provides consistent responses regardless of whether the input is pure text or text rendered as images (like screenshots or photos). This also helps to enhance the model’s capability when dealing with text-heavy images.



3. 文本渲染数据：把文本转成视觉形式，使跨模态处理文本查询时保持一致；文档，代码片段，结构化数据渲成图后，无论纯文本还是截图/照片输入，回复应一致，并增强对文字密集图像的能力。

Each type of data is essential in building a comprehensive visual language model that can effectively manage a wide range of real-world applications while ensuring consistent performance across various input modalities.



每一类对建成能覆盖广泛真实应用，并在各输入模态上表现一致的视觉语言模型都必不可少。

### 2.4 Long2short: Context Compression for Short-CoT Models ### 2.4 Long2short：面向短链模型的上下文压缩

Though long-CoT models achieve strong performance, it consumes more test-time tokens compared to standard short-CoT LLMs. However, it is possible to transfer the thinking priors from long-CoT models to short-CoT models so that performance can be improved even with limited test-time token budgets. We present several approaches for this long2short problem, including model merging (Yang et al. 2024), shortest rejection sampling, DPO (Rafailov et al. 2024), and long2short RL. Detailed descriptions of these methods are provided below:



长链模型强，但比标准短链 LLM 更吃 TestingTime token。可以把长链的思考先验迁到短链，使在有限 TestingTime token 预算下仍涨分。我们给出若干 long2short 做法：模型合并，最短拒绝采样，DPO，以及 long2short RL。分述如下：

**Model Merging** Model merging has been found to be useful in maintaining generalization ability. We also discovered its effectiveness in improving token efficiency when merging a long-cot model and a short-cot model. This approach combines a long-cot model with a shorter model to obtain a new one without training. Specifically, we merge the two models by simply averaging their weights.



**模型合并** 合并有助于保持泛化；我们还发现合并长链与短链模型可提高 token 效率。无需训练，直接对两模型权重简单平均得到新模型。

**Shortest Rejection Sampling** We observed that our model generates responses with a large length variation for the same problem. Based on this, we designed the Shortest Rejection Sampling method. This method samples the same question n times (in our experiments, n = 8) and selects the shortest correct response for supervised fine-tuning.



**最短拒绝采样** 同一题回复长度差异很大。据此设计最短拒绝采样：同一题采 n 次（实验中 n = 8），选最短的正确回复做监督微调。

**DPO** Similar with Shortest Rejection Sampling, we utilize the Long CoT model to generate multiple response samples. The shortest correct solution is selected as the positive sample, while longer responses are treated as negative samples, including both wrong longer responses and correct longer responses (1.5 times longer than the chosen positive sample). These positive-negative pairs form the pairwise preference data used for DPO training.



**DPO** 类似最短拒绝采样：用长链模型多采；最短正确解作正样本，更长回复作负样本（含更长的错答，以及比正样本长 1.5 倍以上的正确更长答）。正负对构成 DPO 训练的成对偏好数据。

<!-- page 8 of 25 -->

**Long2short RL** After a standard RL training phase, we select a model that offers the best balance between performance and token efficiency to serve as the base model, and conduct a separate long2short RL training phase. In this second phase, we apply the length penalty introduced in Section 2.3.3, and significantly reduce the maximum rollout length to further penalize responses that exceed the desired length while possibly correct.



**Long2short RL** 标准 RL 阶段后，选出表现与 token 效率平衡最好的模型作底座，再单独做一轮 long2short RL：施加 §2.3.3 的长度惩罚，并显著降低最大 rollout 长度，进一步惩罚虽可能正确但超长的回复。

### 2.5 Other Training Details ### 2.5 其他训练细节

#### 2.5.1 Pretraining #### 2.5.1 预训练

The Kimi k1.5 base model is trained on a diverse, high-quality multimodal corpus. The language data covers five domains: English, Chinese, Code, Mathematics Reasoning, and Knowledge. Multimodal data, including Captioning, Image-text Interleaving, OCR, Knowledge, and QA datasets, enables our model to acquire vision-language capabilities. Rigorous quality control ensures relevance, diversity, and balance in the overall pretrain dataset. Our pretraining proceeds in three stages: (1) Vision-language pretraining, where a strong language foundation is established, followed by gradual multimodal integration; (2) Cooldown, which consolidates capabilities using curated and synthetic data, particularly for reasoning and knowledge-based tasks; and (3) Long-context activation, extending sequence processing to 131, 072 tokens. More details regarding our pretraining efforts can be found in Appendix B.



Kimi k1.5 底座在多样，高质量多模态语料上训练。语言数据覆盖五域：英，中，代码，数学推理，知识。多模态含 Caption，图文交错，OCR，知识与 QA，使模型获得视觉-语言能力。严格质控保证相关，多样与均衡。预训练三阶段：（1）视觉-语言预训练：先立稳语言底座，再逐步融入多模态；（2）Cooldown：用精选与合成数据巩固能力，尤其推理与知识任务；（3）长上下文激活：序列处理扩到 131, 072 token。更多细节见附录 B。

#### 2.5.2 Vanilla Supervised Finetuning #### 2.5.2 常规监督微调

We create the vanilla SFT corpus covering multiple domains. For non-reasoning tasks, including question-answering, writing, and text processing, we initially construct a seed dataset through human annotation. This seed dataset is used to train a seed model. Subsequently, we collect a diverse of prompts and employ the seed model to generate multiple responses to each prompt. Annotators then rank these responses and refine the top-ranked response to produce the final version. For reasoning tasks such as math and coding problems, where rule-based and reward modeling based verifications are more accurate and efficient than human judgment, we utilize rejection sampling to expand the SFT dataset.



常规 SFT 语料覆盖多域。非推理任务（问答，写作，文本处理）：先人工标注种子集训种子模型，再收多样提示让种子模型多生成，标注员排序并润色排名最高者。推理任务（数学，编程）：规则与奖励模型核验往往比人工更准更省，用拒绝采样扩 SFT 集。

Our vanilla SFT dataset comprises approximately 1 million text examples. Specifically, 500k examples are for general question answering, 200k for coding, 200k for math and science, 5k for creative writing, and 20k for long-context tasks such as summarization, doc-qa, translation, and writing. In addition, we construct 1 million text-vision examples encompassing various categories including chart interpretation, OCR, image-grounded conversations, visual coding, visual reasoning, and math/science problems with visual aids.



常规 SFT 约 100 万文本例：一般问答 500k，编程 200k，数理 200k，创意写作 5k，长上下文（摘要，文档问答，翻译，写作等）20k. 另构造 100 万图文例：图表解读，OCR，图像接地对话，视觉编程，视觉推理，带图数理题等。

We first train the model at the sequence length of 32k tokens for 1 epoch, followed by another epoch at the sequence length of 128k tokens. In the first stage (32k), the learning rate decays from $2 \times 1 0 ^ { - 5 } \stackrel { \cdot } { \mathrm { t o } } 2 \times 1 0 ^ { - 6 }$ , before it re-warmups to $\tilde { 1 } \times 1 0 ^ { - 5 }$ in the second stage (128k) and finally decays to $1 \times 1 0 ^ { \frac { \cdot } { - 6 } }$ . To improve training efficiency, we pack multiple training examples into each single training sequence.



先按序列长 32k 训 1 个 epoch，再按 128k 训 1 个 epoch。第一阶段学习率从 $2\times10^{-5}$ 衰减到 $2\times10^{-6}$；第二阶段再升温到约 $1\times10^{-5}$，最后衰减到 $1\times10^{-6}$。为提效，多条训练例打包进同一训练序列。

### 2.6 RL Infrastructure ### 2.6 RL 基础设施

![Image block](images/p08-figure-3-large-scale-reinforcement-learning-training.png)

Figure 3: Large Scale Reinforcement Learning Training System for LLM



图 3：面向 LLM 的大规模强化学习训练系统。

<!-- page 9 of 25 -->

#### 2.6.1 Large Scale Reinforcement Learning Training System for LLM #### 2.6.1 面向 LLM 的大规模强化学习训练系统

In the realm of artificial intelligence, reinforcement learning (RL) has emerged as a pivotal training methodology for large language models (LLMs)(Ouyang et al. 2022)(Jaech et al. 2024), drawing inspiration from its success in mastering complex games like Go, StarCraft II, and Dota 2 through systems such as AlphaGo(Silver et al. 2017), AlphaStar(Vinyals et al. 2019), and OpenAI Dota Five (Berner et al. 2019). Following in this tradition, the Kimi k1.5 system adopts an iterative synchronous RL framework, meticulously designed to bolster the model’s reasoning capabilities through persistent learning and adaptation. A key innovation in this system is the introduction of a Partial Rollout technique, designed to optimize the handling of complex reasoning trajectories.



强化学习已成为 LLM 的关键训练方法，灵感来自 AlphaGo，AlphaStar，OpenAI Five 等在围棋，星际争霸 II，Dota 2 上的成功。沿此传统，Kimi k1.5 采用迭代同步 RL 框架，通过持续学习与适应增强推理；关键创新是 Partial Rollout（分段 rollout）技术，优化复杂推理轨迹的处理。

The RL training system as illustrated in Figure 3a operates through an iterative synchronous approach, with each iteration encompassing a rollout phase and a training phase. During the rollout phase, rollout workers, coordinated by a central master, generate rollout trajectories by interacting with the model, producing sequences of responses to various inputs. These trajectories are then stored in a replay buffer, which ensures a diverse and unbiased dataset for training by disrupting temporal correlations. In the subsequent training phase, trainer workers access these experiences to update the model’s weights. This cyclical process allows the model to continuously learn from its actions, adjusting its strategies over time to enhance performance.



如图 3a：每轮含 rollout 与训练两相。rollout 阶段，由中央 master 协调的 worker 与模型交互生成轨迹，写入 replay buffer，打断时间相关以保证训练数据多样，无偏。随后 trainer worker 用这些经验更新权重；循环使模型持续从行动中学习，调整策略。

The central master serves as the central conductor, managing the flow of data and communication between the rollout workers, trainer workers, evaluation with reward models and the replay buffer. It ensures that the system operates harmoniously, balancing the load and facilitating efficient data processing.



中央 master 调度 rollout / trainer / 奖励评估与 replay buffer 之间的数据与通信，平衡负载，保障高效处理。

The trainer workers access these rollout trajectories, whether completed in a single iteration or divided across multiple iterations, to compute gradient updates that refine the model’s parameters and enhance its performance. This process is overseen by a reward model, which evaluates the quality of the model’s outputs and provides essential feedback to guide the training process. The reward model’s evaluations are particularly pivotal in determining the effectiveness of the model’s strategies and steering the model towards optimal performance.



Trainer 可读取单轮完成或跨多轮切开的轨迹，算梯度更新参数。奖励模型评估输出质量并给反馈，对判断策略有效性，导向更优表现尤为关键。

Moreover, the system incorporates a code execution service, which is specifically designed to handle code-related problems and is integral to the reward model. This service evaluates the model’s outputs in practical coding scenarios, ensuring that the model’s learning is closely aligned with real-world programming challenges. By validating the model’s solutions against actual code executions, this feedback loop becomes essential for refining the model’s strategies and enhancing its performance in code-related tasks.



系统还含代码执行服务，专处理编程题，并嵌入奖励模型：在真实编码场景评估输出，用实际执行校验解，形成 refine 策略，抬编程表现的反馈环。

#### 2.6.2 Partial Rollouts for Long CoT RL #### 2.6.2 面向长 CoT RL 的分段 Rollout

One of the primary ideas of our work is to scale long-context RL training. Partial rollouts is a key technique that effectively addresses the challenge of handling long-CoT features by managing the rollouts of both long and short trajectories. This technique establishes a fixed output token budget, capping the length of each rollout trajectory. If a trajectory exceeds the token limit during the rollout phase, the unfinished portion is saved to the replay buffer and continued in the next iteration. It ensures that no single lengthy trajectory monopolizes the system’s resources. Moreover, since the rollout workers operate asynchronously, when some are engaged with long trajectories, others can independently process new, shorter rollout tasks. The asynchronous operation maximizes computational efficiency by ensuring that all rollout workers are actively contributing to the training process, thereby optimizing the overall performance of the system.



本工作主旨之一是扩展长上下文 RL. Partial rollout 是关键技术：为每条轨迹设固定输出 token 预算；超限则把未完成部分存进 replay buffer，下一轮续写，避免单条超长轨迹独占资源。Worker 异步运行：有人忙长轨迹时，他人可独立处理新的短任务，最大化算力利用率。

As illustrated in Figure 3b, the partial rollout system works by breaking down long responses into segments across iterations (from iter n-m to iter n). The Replay Buffer acts as a central storage mechanism that maintains these response segments, where only the current iteration (iter n) requires on-policy computation. Previous segments (iter n-m to n-1) can be efficiently reused from the buffer, eliminating the need for repeated rollouts. This segmented approach significantly reduces the computational overhead: instead of rolling out the entire response at once, the system processes and stores segments incrementally, allowing for the generation of much longer responses while maintaining fast iteration times. During training, certain segments can be excluded from loss computation to further optimize the learning process, making the entire system both efficient and scalable.



如图 3b：长回复跨轮切成段（iter n-m 到 iter n）。Replay Buffer 存这些段；仅当前轮（iter n）需在策略计算，先前段可复用，无需反复 rollout。分段显著降开销：不必一次滚出整段回复，即可生成更长回复并保持快迭代。训练时还可把某些段排除出损失计算，进一步优化学习。

The implementation of partial rollouts also offers repeat detection. The system identifies repeated sequences in the generated content and terminates them early, reducing unnecessary computation while maintaining output quality. Detected repetitions can be assigned additional penalties, effectively discouraging redundant content generation in the prompt set.



分段 rollout 还支持重复检测：发现生成内容中的重复序列可提前终止，减少无谓算力；检测到的重复可加额外惩罚，抑制提示集上冗余生成。

#### 2.6.3 Hybrid Deployment of Training and Inference #### 2.6.3 训练与推理的混合部署

The RL training process comprises of the following phases:



RL 训练过程包含下列阶段：

<!-- page 10 of 25 -->

![Image block](images/p10-figure-4-hybrid-deployment-framework.png)

Figure 4: Hybrid Deployment Framework



图 4：混合部署框架。

• **Training Phase:** At the outset, Megatron (Shoeybi et al. 2020) and vLLM (Kwon et al. 2023) are executed within separate containers, encapsulated by a shim process known as checkpoint-engine (Section 2.6.3). Megatron commences the training procedure. After the training is completed, Megatron offloads the GPU memory and prepares to transfer current weights to vLLM.



• **训练阶段**：起初 Megatron 与 vLLM 分容器运行，由 checkpoint-engine 封装。Megatron 开训；训完后卸载 GPU 内存，准备把当前权重交给 vLLM。

• **Inference Phase:** Following Megatron’s offloading, vLLM starts with dummy model weights and updates them with the latest ones transferred from Megatron via Mooncake (Qin et al. 2024). Upon completion of the rollout, the checkpoint-engine halts all vLLM processes.



• **推理阶段**：Megatron 卸载后，vLLM 以 dummy 权重启动，再经 Mooncake 从 Megatron 拉取最新权重更新；rollout 完成后 checkpoint-engine 停掉所有 vLLM 进程。

• **Subsequent Training Phase:** Once the memory allocated to vLLM is released, Megatron onloads the memory and initiates another round of training.



• **后续训练阶段**：释放 vLLM 占用的内存后，Megatron 再装载内存，开启下一轮训练。

We find existing works challenging to simultaneously support all the following characteristics.



我们发现既有工作难以同时支持下列全部特性。

• Complex parallelism strategy: Megatron may have different parallelism strategy with vLLM. Training weights distributing in several nodes in Megatron could be challenging to be shared with vLLM.



• 复杂并行策略：Megatron 与 vLLM 并行策略可能不同；训练权重跨多节点时，与 vLLM 共享并不容易。

• Minimizing idle GPU resources: For On-Policy RL, recent works such as SGLang (L. Zheng et al. 2024) and vLLM might reserve some GPUs during the training process, which conversely could lead to idle training GPUs. It would be more efficient to share the same devices between training and inference.



• 尽量减少空闲 GPU：在策略 RL 中，SGLang，vLLM 等可能在训练期预留 GPU，反而让训练 GPU 空闲；训练与推理共享同一批设备更高效。

• Capability of dynamic scaling: In some cases, a significant acceleration can be achieved by increasing the number of inference nodes while keeping the training process constant. Our system enables the efficient utilization of idle GPU nodes when needed.



• 动态扩缩能力：有时只需加推理节点，训练不变即可显著加速；本系统可在需要时高效利用空闲 GPU 节点。

As illustrated in Figure 4, we implement this hybrid deployment framework (Section 2.6.3) on top of Megatron and vLLM, achieving less than one minute from training to inference phase and about ten seconds conversely.



如图 4，我们在 Megatron 与 vLLM 之上实现该混合部署框架：训练切到推理不到一分钟，反向约十秒。

**Hybrid Deployment Strategy** We propose a hybrid deployment strategy for training and inference tasks, which leverages Kubernetes Sidecar containers sharing all available GPUs to collocate both workloads in one pod. The primary advantages of this strategy are:



**混合部署策略** 用 Kubernetes Sidecar 容器共享全部可用 GPU，把训练与推理共置同一 pod。主要优点：

• It facilitates efficient resource sharing and management, preventing train nodes idling while waiting for inference nodes when both are deployed on separate nodes.



• 高效共享与管理资源，避免训练与推理分节点时训练干等推理。

• Leveraging distinct deployed images, training and inference can each iterate independently for better performance.



• 用不同部署镜像，训练与推理可各自独立迭代以求更好性能。

• The architecture is not limited to vLLM, other frameworks can be conveniently integrated.



• 架构不限于 vLLM，其他框架也可方便接入。

**Checkpoint Engine** Checkpoint Engine is responsible for managing the lifecycle of the vLLM process, exposing HTTP APIs that enable triggering various operations on vLLM. For overall consistency and reliability, we utilize a global metadata system managed by the etcd service to broadcast operations and statuses.



**Checkpoint Engine** 管理 vLLM 生命周期，暴露 HTTP API 触发各类操作；用 etcd 管理的全局元数据系统广播操作与状态，保证一致性与可靠性。

<!-- page 11 of 25 -->

It could be challenging to entirely release GPU memory by vLLM offloading primarily due to CUDA graphs, NCCL buffers and NVIDIA drivers. To minimize modifications to vLLM, we terminate and restart it when needed for better GPU utilization and fault tolerance.



因 CUDA graph，NCCL buffer，驱动等，vLLM 卸载很难完全释放 GPU 内存。为尽量少改 vLLM，需要时终止并重启，以更好利用 GPU 并提高容错。

The worker in Megatron converts the owned checkpoints into the Hugging Face format in shared memory. This conversion also takes Pipeline Parallelism and Expert Parallelism into account so that only Tensor Parallelism remains in these checkpoints. Checkpoints in shared memory are subsequently divided into shards and registered in the global metadata system. We employ Mooncake to transfer checkpoints between peer nodes over RDMA. Some modifications to vLLM are needed to load weight files and perform tensor parallelism conversion.



Megatron 侧 worker 把自有 checkpoint 转成 Hugging Face 格式写入共享内存；转换考虑流水线并行与专家并行，使 checkpoint 中只剩张量并行。共享内存中的 checkpoint 再切分，登记到全局元数据；用 Mooncake 经 RDMA 在对等节点间传权重。vLLM 需少量修改以加载权重并做张量并行转换。

#### 2.6.4 Code Sandbox #### 2.6.4 代码沙箱

We developed the sandbox as a secure environment for executing user-submitted code, optimized for code execution and code benchmark evaluation. By dynamically switching container images, the sandbox supports different use cases through MultiPL-E (Cassano, Gouwar, D. Nguyen, S. Nguyen, et al. 2023), DMOJ Judge Server, Lean, Jupyter Notebook, and other images.



我们开发沙箱作为安全执行用户代码的环境，面向代码执行与代码基准评测。通过动态切换容器镜像，支持 MultiPL-E，DMOJ Judge Server，Lean，Jupyter Notebook 等用例。

For RL in coding tasks, the sandbox ensures the reliability of training data judgment by providing consistent and repeatable evaluation mechanisms. Its feedback system supports multi-stage assessments, such as code execution feedback and repo-level editing, while maintaining a uniform context to ensure fair and equitable benchmark comparisons across programming languages.



编程 RL 中，沙箱以一致，可重复的评估机制保证训练数据判定可靠；反馈支持多阶段评估（代码执行反馈，仓库级编辑等），并保持统一上下文，保证跨语言基准公平可比。

We deploy the service on Kubernetes for scalability and resilience, exposing it through HTTP endpoints for external integration. Kubernetes features like automatic restarts and rolling updates ensure availability and fault tolerance.



服务部署在 Kubernetes 上以求可扩展与韧性，经 HTTP 端点对外集成；自动重启，滚动更新等保障可用性与容错。

To optimize performance and support RL environments, we incorporate several techniques into the code execution service to enhance efficiency, speed, and reliability. These include:



为优化性能并支撑 RL 环境，代码执行服务融入若干提效，提速，提可靠技术，包括：

• **Using Crun:** We utilize crun as the container runtime instead of Docker, significantly reducing container startup times.



• **使用 crun**：用 crun 替代 Docker 作容器运行时，显著缩短启动时间。

• **Cgroup Reusing:** We pre-create cgroups for container use, which is crucial in scenarios with high concurrency where creating and destroying cgroups for each container can become a bottleneck.



• **复用 cgroup**：预先创建 cgroup 供容器使用；高并发下频繁创建/销毁 cgroup 会成瓶颈。

• **Disk Usage Optimization:** An overlay filesystem with an upper layer mounted as tmpfs is used to control disk writes, providing a fixed-size, high-speed storage space. This approach is beneficial for ephemeral workloads.



• **磁盘用量优化**：overlay 文件系统上层挂 tmpfs，控制写盘，提供固定大小高速空间，适合短生命周期负载。

| Method | Time (s) | Method | Containers/sec |
| --- | --- | --- | --- |
| Docker | 0.12 | Docker | 27 |
| Sandbox | 0.04 | Sandbox | 120 |

(a) Container startup times



(a) 容器启动时间

(b) Maximum containers started per second on a 16-core machine



(b) 16 核机器上每秒最多启动容器数

These optimizations improve RL efficiency in code execution, providing a consistent and reliable environment for evaluating RL-generated code, essential for iterative training and model improvement.



这些优化提升代码执行侧的 RL 效率，为评估 RL 生成代码提供一致可靠环境，对迭代训练与模型改进必不可少。

## 3 Experiments

### 3.1 Evaluation ### 3.1 评测

Since k1.5 is a multimodal model, we conducted comprehensive evaluation across various benchmarks for different modalities. The detailed evaluation setup can be found in Appendix C. Our benchmarks primarily consist of the following three categories:



因 k1.5 是多模态模型，我们在各模态多基准上做了全面评测；细节见附录 C. 基准主要分三类：

• **Text Benchmark**: MMLU (Hendrycks et al. 2020), IF-Eval (J. Zhou et al. 2023), CLUEWSC (L. Xu et al. 2020), C-EVAL (Y. Huang et al. 2023)



• **文本基准**：MMLU, IF-Eval, CLUEWSC, C-EVAL

• **Reasoning Benchmark**: HumanEval-Mul, LiveCodeBench (Jain et al. 2024), Codeforces, AIME 2024, MATH-500 (Lightman et al. 2023)



• **推理基准**：HumanEval-Mul, LiveCodeBench, Codeforces, AIME 2024, MATH-500

• **Vision Benchmark**: MMMU (Yue, Ni, et al. 2024), MATH-Vision (K. Wang et al. 2024), MathVista (Lu et al. 2023)



• **视觉基准**：MMMU, MATH-Vision, MathVista

<!-- page 12 of 25 -->

### 3.2 Main Results ### 3.2 主结果

**K1.5 long-CoT model** The performance of the Kimi k1.5 long-CoT model is presented in Table 2. Through long-CoT supervised fine-tuning (described in Section 2.2) and vision-text joint reinforcement learning (discussed in Section 2.3), the model’s long-term reasoning capabilities are enhanced significantly. The test-time computation scaling further strengthens its performance, enabling the model to achieve state-of-the-art results across a range of modalities. Our evaluation reveals marked improvements in the model’s capacity to reason, comprehend, and synthesize information over extended contexts, representing a advancement in multi-modal AI capabilities.



**K1.5 长链模型** 表现见表 2。经长链 SFT(§2.2)与视觉-文本联合 RL(§2.3)，长期推理能力显著增强；TestingTime Scaling 进一步加固，多模态上达领先结果。评测显示模型在长上下文上推理，理解与综合信息的能力明显提升，是多模态 AI 能力的一次推进。

**K1.5 short-CoT model** The performance of the Kimi k1.5 short-CoT model is presented in Table 3. This model integrates several techniques, including traditional supervised fine-tuning (discussed in Section 2.5.2), reinforcement learning (explored in Section 2.3), and long-to-short distillation (outlined in Section 2.4). The results demonstrate that the k1.5 short-CoT model delivers competitive or superior performance compared to leading open-source and proprietary models across multiple tasks. These include text, vision, and reasoning challenges, with notable strengths in natural language understanding, mathematics, coding, and logical reasoning.



**K1.5 短链模型** 表现见表 3。融合常规 SFT(§2.5.2), RL(§2.3)与 long-to-short 蒸馏（§2.4）。结果显示短链模型在多项任务上相对领先开源与专有模型具备竞争力或更优，含文本，视觉与推理，在自然语言理解，数学，编程与逻辑推理上优势明显。

<table><tr><td rowspan="2"></td><td rowspan="2">Benchmark (Metric)</td><td colspan="2">Language-only Model</td><td colspan="3">Vision-Language Model</td></tr><tr><td>QwQ-32B Preview</td><td>OpenAI o1-mini</td><td>QVQ-72B Preview</td><td>OpenAI o1</td><td>Kimi k1.5</td></tr><tr><td rowspan="4">Reasoning</td><td>MATH-500 (EM)</td><td>90.6</td><td>90.0</td><td>-</td><td>94.8</td><td>96.2</td></tr><tr><td>AIME 2024 (Pass@1)</td><td>50.0</td><td>63.6</td><td>-</td><td>74.4</td><td>77.5</td></tr><tr><td>Codeforces (Percentile)</td><td>62</td><td>88</td><td>-</td><td>94</td><td>94</td></tr><tr><td>LiveCodeBench (Pass@1)</td><td>40.6</td><td>53.1</td><td>-</td><td>67.2</td><td>62.5</td></tr><tr><td rowspan="3">Vision</td><td>MathVista-Test (Pass@1)</td><td>-</td><td>-</td><td>71.4</td><td>71.0</td><td>74.9</td></tr><tr><td>MMMU-Val (Pass@1)</td><td>-</td><td>-</td><td>70.3</td><td>77.3</td><td>70.0</td></tr><tr><td>MathVision-Full (Pass@1)</td><td>-</td><td>-</td><td>35.9</td><td>-</td><td>38.6</td></tr></table>

Table 2: Performance of Kimi k1.5 long-CoT and flagship open-source and proprietary models.



表 2: Kimi k1.5 长链与旗舰开源/专有模型表现。

| Benchmark (Metric)7 | LangQwen2.52B-Inst. | uage-only M LLaMA-3.1405B-Inst. | odel DeepSeekV3 | ViQwen2-V | sion-Language L Claude-3.5- Sonnet-1022 | ModelGPT-4o0513 | Kimik1.5 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MMLU (EM) | 85.3 | 88.6 | 88.5 | - | 88.3 | 87.2 | 87.4 |
| IF-Eval (PromptStrict) | 84.1 | 86.0 | 86.1 | - | 86.5 | 84.3 | 87.2 |
| Text |  |  |  |  |  |  |  |
| CLUEWSC (EM) | 91.4 | 84.7 | 90.9 | - | 85.4 | 87.9 | 91.7 |
| C-Eval (EM) | 86.1 | 61.5 | 86.5 | - | 76.7 | 76.0 | 88.3 |
| MATH-500 (EM) | 80.0 | 73.8 | 90.2 | - | 78.3 | 74.6 | 94.6 |
| AIME 2024 (Pass@1) | 23.3 | 23.3 | 39.2 | - | 16.0 | 9.3 | 60.8 |
| Reasoning |  |  |  |  |  |  |  |
| HumanEval-Mul (Pass@1) | 77.3 | 77.2 | 82.6 | - | 81.7 | 80.5 | 81.5 |
| LiveCodeBench (Pass@1) | 31.1 | 28.4 | 40.5 | - | 36.3 | 33.4 | 47.3 |
| MathVista-Test (Pass@1) | - | - | - | 69.7 | 65.3 | 63.8 | 70.1 |
| Vision MMMU-Val (Pass@1) | - | - | - | 64.5 | 66.4 | 69.1 | 68.0 |
| MathVision-Full (Pass@1) | - | - | - | 26.6 | 35.6 | 30.4 | 31.0 |

Table 3: Performance of Kimi k1.5 short-CoT and flagship open-source and proprietary models. VLM model performance were obtained from the OpenCompass benchmark platform (https://opencompass. org. cn/).



表 3: Kimi k1.5 短链与旗舰开源/专有模型表现。VLM 分数来自 OpenCompass(https://opencompass. org. cn/).

### 3.3 Long Context Scaling ### 3.3 长上下文扩展

We employ a mid-sized model to study the scaling properties of RL with LLMs. Figure 5 illustrates the evolution of both training accuracy and response length across training iterations for the small model variant trained on the mathematical prompt set. As training progresses, we observe a concurrent increase in both response length and performance accuracy. Notably, more challenging benchmarks exhibit a steeper increase in response length, suggesting that the model learns to generate more elaborate solutions for complex problems. Figure 6 indicates a strong correlation between the model’s



我们用中等规模模型研究 LLM 上 RL 的扩展性质。图 5 展示在数学提示集上训练的较小变体随训练迭代的准确率与回复长度演变：二者随训练同步上升；更难基准上回复长度升得更陡，暗示模型学会为复杂题生成更细致的解。图 6 表明模型的

<!-- page 13 of 25 -->

output context length and its problem-solving capabilities. Our final run of k1.5 scales to 128k context length and observes continued improvement on hard reasoning benchmarks.



输出上下文长度与解题能力强相关。k1.5 最终跑到 128k 上下文，并在难推理基准上观察到持续提升。

![Chart block](images/p13-figure-5-the-changes-on-the-training-accuracy-and.png)

Figure 5: The changes on the training accuracy and length as train iterations grow. Note that the scores above come from an internal long-cot model with much smaller model size than k1.5 long-CoT model. The shaded area represents the 95% percentile of the response length.



图 5：训练准确率与长度随训练迭代的变化。注意分数来自比 k1.5 长链小得多的内部 long-cot 模型；阴影为回复长度的 95% 分位。

### 3.4 Long2short



### 3.4 Long2short

We compared the proposed long2short RL algorithm with the DPO, shortest rejection sampling, and model merge methods introduced in the Section 2.4, focusing on the token efficiency for the long2short problem (X. Chen et al. 2024), specifically how the obtained long-cot model can benefit a short model. In Figure 7, k1.5-long represents our long-cot model selected for long2short training. k1.5-short w/ rl refers to the short model obtained using the long2short RL training. k1.5-short w/ dpo denotes the short model with improved token efficiency through DPO training. k1.5-short w/ merge represents the model after model merging, while k1.5-short w/ merge + rs indicates the short model obtained by applying shortest rejection sampling to the merged model. k1.5-shortest represents the shortest model we obtained during the long2short training. As shown in Figure 7, the proposed long2short RL algorithm demonstrates the highest token efficiency compared other mehtods such as DPO and model merge. Notably, all models in the k1.5 series (marked in orange) demonstrate superior token efficiency compared to other models (marked in blue). For instance, k1.5-short w/ rl achieves a Pass@1 score of 60.8 on AIME2024 (averaged over 8 runs) while utilizing only 3, 272 tokens on average. Similarly, k1.5-shortest attains a Pass@1 score of 88.2 on MATH500 while consuming approximately the same number of tokens as other short models.



我们把提出的 long2short RL 与 §2.4 的 DPO，最短拒绝采样，模型合并对照，关注 long2short 的 token 效率-- 长链模型如何惠及短模型。图 7 中：k1.5-long 为选作 long2short 训练的长链；k1.5-short w/ rl 为 long2short RL 得到的短模型；w/ dpo 为经 DPO 提高 token 效率的短模型；w/ merge 为合并后；w/ merge + rs 为合并后再做最短拒绝采样；k1.5-shortest 为 long2short 训练中得到的最短模型。图 7 显示 long2short RL 的 token 效率高于 DPO，合并等；k1.5 系列（橙）整体优于其他模型（蓝）。例如 k1.5-short w/ rl 在 AIME2024 上 Pass@1 60.8（8 次平均），平均仅用 3, 272 token；k1.5-shortest 在 MATH500 上 Pass@1 88.2，token 消耗与其他短模型大致相当。

<!-- page 14 of 25 -->

![Chart block](images/p14-figure-6-model-performance-increases-with-response.png)

Figure 6: Model Performance Increases with Response Length



图 6：模型表现随回复长度提升。

![Chart block](images/p14-chart.png)

![Chart block](images/p14-figure-7-long2short-performance-all-the-k1-5-series.png)

Figure 7: Long2Short Performance. All the k1.5 series demonstrate better token efficiency compared to other models.



图 7: Long2Short 表现。k1.5 系列相对其他模型均有更好的 token 效率。

### 3.5 Ablation Studies ### 3.5 消融实验

**Scaling of model size and context length** Our main contribution is the application of RL to enhance the model’s capacity for generating extended CoT, thereby improving its reasoning ability. A natural question arises: how does this compare to simply increasing the model size? To demonstrate the effectiveness of our approach, we trained two models of different sizes using the same dataset and recorded the evaluation results and average inference lengths from all checkpoints during RL training. These results are shown in Figure 8. Notably, although the larger model initially outperforms the smaller one, the smaller model can achieve comparable performance by utilizing longer CoTs optimized through RL. However, the larger model generally shows better token efficiency than the smaller model. This also indicates that if one targets the best possible performance, scaling the context length of a larger model has a higher upper bound and is more token efficient. However, if test-time compute has a budget, training smaller models with a larger context length may be viable solutions.



**模型规模与上下文长度的扩展** 主贡献是用 RL 增强生成更长 CoT 的能力以抬推理。自然问题是：这与单纯加大模型比如何？我们用同一数据集训两个不同规模模型，记录 RL 训练中各 checkpoint 的评测与平均推理长度，见图 8。较大模型起初更好，但较小模型靠 RL 优化的更长 CoT 可追到可比表现；较大模型通常 token 效率更好。若追求最佳表现，放大更大模型的上下文上限更高，更省 token；若 TestingTime 算力有预算，训「更小模型 + 更长上下文」也可行。

**Effects of using negative gradients** We investigate the effectiveness of using ReST (Gulcehre et al. 2023) as the policy optimization algorithm in our setting. The primary distinction between ReST and other RL-based methods including



**负梯度的作用** 我们考察在本设定下用 ReST 作策略优化的效果。ReST 与其他含本方法在内的 RL 方法的主要区别是：

<!-- page 15 of 25 -->

ours is that ReST iteratively refines the model by fitting the best response sampled from the current model, without applying negative gradients to penalize incorrect responses. As illustrated in Figure 10, our method exhibits superior sample complexity compared to ReST, indicating that the incorporation of negative gradients markedly enhances the model’s efficiency in generating long CoT. Our method not only elevates the quality of reasoning but also optimizes the training process, achieving robust performance with fewer training samples. This finding suggests that the choice of policy optimization algorithm is crucial in our setting, as the performance gap between ReST and other RL-based methods is not as pronounced in other domains (Gulcehre et al. 2023). Therefore, our results highlight the importance of selecting an appropriate optimization strategy to maximize effectiveness in generating long CoT.



ReST 迭代地拟合当前模型采到的最佳回复来 refine 模型，不对错误回复施加负梯度惩罚。如图 10，我们的方法样本复杂度优于 ReST，说明引入负梯度显著提高生成长 CoT 的效率；不仅抬推理质量，也优化训练过程，用更少样本达到稳健表现。这提示在本设定下策略优化算法选择很关键-- 在其他领域 ReST 与 RL 方法差距未必如此明显。因此，选对优化策略对最大化长 CoT 生成效果很重要。

**Sampling strategies** We further demonstrate the effectiveness of our curriculum sampling strategy, as introduced in Section 2.3.4. Our training dataset D comprises a diverse mix of problems with varying levels of difficulty. With our curriculum sampling method, we initially use D for a warm-up phase and then focus solely on hard questions to train the model. This approach is compared to a baseline method that employs a uniform sampling strategy without any curriculum adjustments. As illustrated in Figure 9, our results clearly show that the proposed curriculum sampling method significantly enhances the performance. This improvement can be attributed to the method’s ability to progressively challenge the model, allowing it to develop a more robust understanding and competency in handling complex problems. By focusing training efforts on more difficult questions after an initial general introduction, the model can better strengthen its reasoning and problem solving capabilities.



**采样策略** 进一步验证 §2.3.4 的课程采样。训练集 $\mathcal{D}$ 含难度不一的多样题。课程采样先用全 $\mathcal{D}$ 热身，再只聚焦难题；对照为无课程调整的均匀采样。图 9 清楚显示课程采样显著抬表现-- 能循序挑战模型，先泛后专，更好加强推理与解题能力。

![Chart block](images/p15-chart.png)

![Chart block](images/p15-chart-2.png)

![Chart block](images/p15-chart-3.png)

![Chart block](images/p15-figure-8-model-performance-vs-response-length-of.png)

Figure 8: Model Performance vs Response Length of Different Model Sizes



图 8：不同模型规模下表现相对回复长度。

![Chart block](images/p15-figure-9-analysis-of-curriculum-learning-approaches-on.png)

Figure 9: Analysis of curriculum learning approaches on model performance.



图 9：课程学习方法对模型表现的分析。

## 4 Conclusions

We present the training recipe and system design of k1.5, our latest multi-modal LLM trained with RL. One of the key insights we extract from our practice is that the scaling of context length is crucial to the continued improvement of LLMs. We employ optimized learning algorithms and infrastructure optimization such as partial rollouts to achieve efficient long-context RL training. How to further improve the efficiency and scalability of long-context RL training remains an important question moving forward.



我们给出用 RL 训练的最新多模态 LLM--k1.5-- 的训练配方与系统设计。实践中的关键洞察之一是：上下文长度扩展对 LLM 继续提升至关重要。我们用优化后的学习算法与 partial rollout 等基础设施优化，实现高效长上下文 RL。如何进一步提高长上下文 RL 的效率与可扩展性，仍是前进中的重要问题。

<!-- page 16 of 25 -->

![Chart block](images/p16-figure-10-comparison-with-using-rest-for-policy.png)

Figure 10: Comparison with using ReST for policy optimization.



图 10：与用 ReST 做策略优化的对照。

Another contribution we made is a combination of techniques that enable improved policy optimization. Specifically, we formulate long-CoT RL with LLMs and derive a variant of online mirror descent for robust optimization. We also experiment with sampling strategies, length penalty, and optimizing the data recipe to achieve strong RL performance.



另一贡献是一组改进策略优化的技术组合：形式化 LLM 上的 long-CoT RL，导出在线镜像下降变体做稳健优化；并实验采样策略，长度惩罚与数据配方优化，以达强 RL 表现。

We show that strong performance can be achieved by long context scaling and improved policy optimization, even without using more complex techniques such as Monte Carlo tree search, value functions, and process reward models. In the future, it will also be intriguing to study improving credit assignments and reducing overthinking without hurting the model’s exploration abilities.



我们表明：靠长上下文扩展与改进策略优化即可达强表现，即便不用蒙特卡洛树搜索，价值函数，过程奖励模型等更复杂技术。未来亦值得研究：在不伤探索能力的前提下改进信用分配，减轻过思。

We have also observed the potential of long2short methods. These methods largely improve performance of short CoT models. Moreover, it is possible to combine long2short methods with long-CoT RL in an iterative way to further increase token efficiency and extract the best performance out of a given context length budget.



我们也观察到 long2short 方法的潜力：它们大幅抬升短链模型表现；还可与 long-CoT RL 迭代结合，进一步提高 token 效率，在给定上下文预算下榨出最佳表现。

## References

（下列条目保留英文文献信息；中文仅作对照提示。页码与条目顺序与源文一致。）

Abbasi-Yadkori, Yasin et al. “Politex: Regret bounds for policy iteration using expert prediction”。In: International Conference on Machine Learning. PMLR. 2019, pp. 3692–3702.

Ahmadian, Arash et al. “Back to basics: Revisiting reinforce style optimization for learning from human feedback in llms”。In: arXiv preprint arXiv: 2402.14740 (2024).

Ankner, Zachary et al. Critique-out-Loud Reward Models. 2024. arXiv: 2408.11791 [cs. LG].

Berner, Christopher et al. “Dota 2 with large scale deep reinforcement learning”。In: arXiv preprint arXiv: 1912.06680 (2019).

<!-- page 17 of 25 -->

Cassano, Federico, John Gouwar, Daniel Nguyen, Sy Duy Nguyen, et al. “MultiPL-E: A Scalable and Extensible Approach to Benchmarking Neural Code Generation”。In: ArXiv (2022).

Cassano, Federico, John Gouwar, Daniel Nguyen, Sydney Nguyen, et al. “MultiPL-E: A Scalable and Polyglot Approach to Benchmarking Neural Code Generation”。In: IEEE Transactions on Software Engineering 49.7 (2023), pp. 3675–3691.

Chen, Jianlv et al. “Bge m3-embedding: Multi-lingual, multi-functionality, multi-granularity text embeddings through self-knowledge distillation”。In: arXiv preprint arXiv: 2402.03216 (2024).

Chen, Xingyu et al. “Do NOT Think That Much for 2+ 3=? On the Overthinking of o1-Like LLMs”。In: arXiv preprint arXiv: 2412.21187 (2024).

Everitt, Tom et al. Reward Tampering Problems and Solutions in Reinforcement Learning: A Causal Influence Diagram Perspective. 2021. arXiv: 1908.04734 [cs. AI].

Gadre, Samir Yitzhak et al. “Datacomp: In search of the next generation of multimodal datasets”。In: Advances in Neural Information Processing Systems 36 (2024).

Grattafiori, Aaron et al. The Llama 3 Herd of Models. 2024. arXiv: 2407.21783 [cs. AI].

Gulcehre, Caglar et al. “Reinforced self-training (rest) for language modeling”。In: arXiv preprint arXiv: 2308.08998 (2023).

Hendrycks, Dan et al. “Measuring Massive Multitask Language Understanding”。In: ArXiv abs/2009.03300 (2020).

Hoffmann, Jordan et al. Training Compute-Optimal Large Language Models. 2022. arXiv: 2203.15556 [cs. CL].

Huang, Yuzhen et al. “C-Eval: A Multi-Level Multi-Discipline Chinese Evaluation Suite for Foundation Models”。In: ArXiv abs/2305.08322 (2023).

Jaech, Aaron et al. “Openai o1 system card”。In: arXiv preprint arXiv: 2412.16720 (2024).

Jain, Naman et al. “LiveCodeBench: Holistic and Contamination Free Evaluation of Large Language Models for Code”。In: ArXiv abs/2403.07974 (2024).

Joulin, Armand et al. “Bag of tricks for efficient text classification”。In: arXiv preprint arXiv: 1607.01759 (2016).

Kaplan, Jared et al. Scaling Laws for Neural Language Models. 2020. arXiv: 2001.08361 [cs. LG].

Kool, Wouter, Herke van Hoof, and Max Welling。“Buy 4 reinforce samples, get a baseline for free! ” In: (2019).

Kwon, Woosuk et al. “Efficient Memory Management for Large Language Model Serving with PagedAttention”。In: Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles. 2023.

Laurençon, Hugo et al. “Obelics: An open web-scale filtered dataset of interleaved image-text documents”。In: Advances in Neural Information Processing Systems 36 (2024).

Li, Jeffrey et al. “Datacomp-lm: In search of the next generation of training sets for language models”。In: arXiv preprint arXiv: 2406.11794 (2024).

Li, Ming et al. “From quantity to quality: Boosting llm performance with self-guided data selection for instruction tuning”。In: arXiv preprint arXiv: 2308.12032 (2023).

Li, Raymond et al. StarCoder: may the source be with you! 2023. arXiv: 2305.06161 [cs. CL].

Lightman, Hunter et al. “Let’s Verify Step by Step”。In: arXiv preprint arXiv: 2305.20050 (2023).

Liu, Wei et al. “What makes good data for alignment? a comprehensive study of automatic data selection in instruction tuning”。In: arXiv preprint arXiv: 2312.15685 (2023).

Lozhkov, Anton et al. StarCoder 2 and The Stack v2: The Next Generation. 2024. arXiv: 2402.19173 [cs. SE].

Lu, Pan et al. “Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts”。In: arXiv preprint arXiv: 2310.02255 (2023).

McAleese, Nat et al. LLM Critics Help Catch LLM Bugs. 2024. arXiv: 2407.00215 [cs. SE].

Mei, Jincheng et al. “On principled entropy exploration in policy optimization”。In: Proceedings of the 28th International Joint Conference on Artificial Intelligence. 2019, pp. 3130–3136.

Muennighoff, Niklas et al. Scaling Data-Constrained Language Models. 2023. arXiv: 2305.16264 [cs. CL].

Nachum, Ofir et al. “Bridging the gap between value and policy based reinforcement learning”。In: Advances in neural information processing systems 30 (2017).

OpenAI。“Learning to reason with LLMs”。In: (2024). URL: https://openai. com/index/learning-to-reason-with-llms/.

<!-- page 18 of 25 -->

Ouyang, Long et al. “Training language models to follow instructions with human feedback”。In: Advances in neural information processing systems 35 (2022), pp. 27730–27744.

Pan, Alexander, Kush Bhatia, and Jacob Steinhardt。“The Effects of Reward Misspecification: Mapping and Mitigating Misaligned Models”。In: International Conference on Learning Representations. 2022.

Paster, Keiran et al. “Openwebmath: An open dataset of high-quality mathematical web text”。In: arXiv preprint arXiv: 2310.06786 (2023).

Penedo, Guilherme et al. “The fineweb datasets: Decanting the web for the finest text data at scale”。In: arXiv preprint arXiv: 2406.17557 (2024).

Qin, Ruoyu et al. Mooncake: A KVCache-centric Disaggregated Architecture for LLM Serving. 2024. arXiv: 2407.00079 [cs. DC].

Rafailov, Rafael et al. “Direct preference optimization: Your language model is secretly a reward model”。In: Advances in Neural Information Processing Systems 36 (2024).

Schuhmann, Christoph et al. “Laion-5b: An open large-scale dataset for training next generation image-text models”。In: Advances in Neural Information Processing Systems 35 (2022), pp. 25278–25294.

Shoeybi, Mohammad et al. Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism. 2020. arXiv: 1909.08053 [cs. CL].

Silver, David et al. “Mastering the game of go without human knowledge”。In: nature 550.7676 (2017), pp. 354–359.

Snell, Charlie et al. “Scaling llm test-time compute optimally can be more effective than scaling model parameters”。In: arXiv preprint arXiv: 2408.03314 (2024).

Su, Dan et al. “Nemotron-CC: Transforming Common Crawl into a Refined Long-Horizon Pretraining Dataset”。In: arXiv preprint arXiv: 2412.02595 (2024).

Su, Jianlin et al. “Roformer: Enhanced transformer with rotary position embedding”。In: Neurocomputing 568 (2024), p. 127063.

Team, Gemini et al. Gemini: A Family of Highly Capable Multimodal Models. 2024. arXiv: 2312.11805 [cs. CL].

Tomar, Manan et al. “Mirror descent policy optimization”。In: arXiv preprint arXiv: 2005.09814 (2020).

Vaswani, Ashish et al. “Attention is All you Need”。In: Advances in Neural Information Processing Systems. Vol. 30.2017.

Villalobos, Pablo et al. Will we run out of data? Limits of LLM scaling based on human-generated data. 2024. arXiv: 2211.04325 [cs. LG].

Vinyals, Oriol et al. “Grandmaster level in StarCraft II using multi-agent reinforcement learning”。In: nature 575.7782 (2019), pp. 350–354.

Wang, Ke et al. “Measuring multimodal mathematical reasoning with math-vision dataset”。In: arXiv preprint arXiv: 2402.14804 (2024).

Wei, Haoran et al. “General OCR Theory: Towards OCR-2.0 via a Unified End-to-end Model”。In: arXiv preprint arXiv: 2409.01704 (2024).

Wei, Jason et al. “Chain-of-thought prompting elicits reasoning in large language models”。In: Advances in neural information processing systems 35 (2022), pp. 24824–24837.

Wu, Yangzhen et al. “Inference scaling laws: An empirical analysis of compute-optimal inference for problem-solving with language models”。In: arXiv preprint arXiv: 2408.00724 (2024).

Xu, Liang et al. “CLUE: A Chinese Language Understanding Evaluation Benchmark”。In: International Conference on Computational Linguistics. 2020.

Yang, Enneng et al. “Model merging in llms, mllms, and beyond: Methods, theories, applications and opportunities”。In: arXiv preprint arXiv: 2408.07666 (2024).

Yao, Shunyu et al. “Tree of thoughts: Deliberate problem solving with large language models”。In: Advances in Neural Information Processing Systems 36 (2024).

Yue, Xiang, Yuansheng Ni, et al. “Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi”。In: Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition. 2024, pp. 9556–9567.

Yue, Xiang, Xingwei Qu, et al. “Mammoth: Building math generalist models through hybrid instruction tuning”。In: arXiv preprint arXiv: 2309.05653 (2023).

Zhang, Lunjun et al. “Generative verifiers: Reward modeling as next-token prediction, 2024”。In: URL https://arxiv. org/abs/2408.15240 (2024).

Zheng, Lianmin et al. SGLang: Efficient Execution of Structured Language Model Programs. 2024. arXiv: 2312.07104 [cs. AI].

Zhou, Jeffrey et al. “Instruction-Following Evaluation for Large Language Models”。In: ArXiv abs/2311.07911 (2023).

<!-- page 19 of 25 -->

Zhu, Wanrong et al. “Multimodal c4: An open, billion-scale corpus of images interleaved with text”。In: Advances in Neural Information Processing Systems 36 (2024).

<!-- page 20 of 25 -->

## Appendix

## A Contributions ## A 贡献者

| Research & Development | |
| --- | --- |
| Angang Du | Wenyang He |
| Bofei Gao | Xianqing Jia |
| Bowei Xing | Xinran Xu |
| Changjiu Jiang | Xingzhe Wu |
| Cheng Chen | Xinyu Zhou |
| Cheng Li | Xinxing Zu |
| Chenjun Xiao | Xuehai Pan |
| Chenzhuang Du | Yang Li |
| Chonghua Liao* | Yangyang Hu |
| Congcong Wang | Yangyang Liu |
| Dehao Zhang | Yanru Chen |
| Enming Yuan | Yejie Wang |
| Enzhe Lu | Yidao Qin |
| Flood Sung | Yibo Liu |
| Guokun Lai | Yiping Bao |
| Haiqing Guo | Yifeng Liu* |
| Han Zhu | Yulun Du |
| Hao Ding | Yuzhi Wang |
| Hao Hu | Yuxin Wu |
| Hao Yang | Y. Charles |
| Hao Zhang | Zaida Zhou |
| Haotian Yao | Zhaoji Wang |
| Haotian Zhao | Zhaowei Li |
| Haoyu Lu | Zheng Zhang |
| Hongcheng Gao | Zhexu Wang |
| Huan Yuan | Zhiqi Huang |
| Huabin Zheng | Zhilin Yang |
| Jingyuan Liu | Zihao Huang |
| Jianlin Su | Ziyao Xu |
| Jianzhou Wang | Zonghan Yang |
| Jin Zhang | |
| Junjie Yan | |
| Lidong Shi | |
| Longhui Yu | |
| Mengnan Dong | |
| Neo Zhang | |
| Ningchen Ma* | |
| Qiwei Pan | |
| Qucheng Gong | |
| Shaowei Liu | |
| Shupeng Wei | |
| Sihan Cao | |
| Tao Jiang | |
| Weimin Xiong | |
| Weiran He | |
| Weihao Gao* | |
| Weixiao Huang | |
| Wenhao Wu | |

| Data Annotation | |
| --- | --- |
| Chuning Tang | Jia Chen |
| Fengxiang Tang | Jianhang Guo |
| Guangda Wei | Jie Zhao |
| Haoze Li | Junyan Wu |
| Haozhen Yu | Ling Ye |
| | Shengling Ma |
| | Siying Huang |
| | Xianghui Wei |
| | Yangyang Liu |
| | Ying Yang |
| | Zhen Zhu |

The listing of authors is in alphabetical order based on their first names. Names marked with an asterisk (*) indicate people who are no longer part of our team.



作者按名字母序排列；标星号（*）表示已不在团队中。

<!-- page 21 of 25 -->

## B Pretraining ## B 预训练

Reinforcement learning (RL) efficiency is closely tied to the performance of the underlying base model. Frontier models such as Gemini(Team et al. 2024) and Llama(Grattafiori et al. 2024) highlight the importance of pretraining data quality in achieving high performance. However, many recent open-source models lack full transparency regarding their data processing pipelines and recipes, creating challenges for broader community understanding. While we are not open-sourcing our proprietary model at this time, we are committed to providing a comprehensive disclosure of our data pipeline and methodologies. In this section, we focus primarily on the multimodal pretraining data recipe, followed by a brief discussion of the model architecture and training stages.



RL 效率与底座模型表现紧密相关。Gemini，Llama 等前沿模型凸显预训练数据质量的重要性；许多近期开源模型对数据处理管线与配方不够透明。我们暂不开放专有模型权重，但承诺较完整披露数据管线与方法。本节主要讲多模态预训练数据配方，并简述架构与训练阶段。

### B. 1 Language Data ### B. 1 语言数据

Our pretrain corpus is designed to provide comprehensive and high-quality data for training large language models (LLMs). It encompasses five domains: English, Chinese, Code, Mathematics & Reasoning, and Knowledge. We employ sophisticated filtering and quality control mechanisms for each domain to ensure the highest quality training data. For all pretrain data, we conducted rigorous individual validation for each data source to assess its specific contribution to the overall training recipe. This systematic evaluation ensures the quality and effectiveness of our diverse data composition.



预训练语料面向全面，高质量 LLM 训练，含五域：英，中，代码，数学与推理，知识。各域有精细过滤与质控；对每个数据源做单独验证，评估其对整体配方的贡献。

**English and Chinese textual data** we developed a multi-dimensional quality filtering framework that combines multiple scoring methods to reduce individual biases and ensure comprehensive quality assessment. Our framework incorporates:



**中英文本** 我们开发多维质量过滤框架，组合多种打分以降低单一偏差：

1. **Rule-based filtering**: We implement domain-specific heuristics to remove problematic content, including duplicate content, machine-translated text, and low-quality web scrapes. We also filter out documents with excessive special characters, unusual formatting, or spam patterns.



1. **规则过滤**：领域启发式去掉重复，机翻，低质爬取，以及特殊字符过多，版式异常，垃圾模式文档。

2. **FastText-based classification**: We trained specialized FastText(Joulin et al. 2016; J. Li et al. 2024) models to identify content quality based on linguistic features and semantic coherence. This helps identify documents with natural language flow and proper grammatical structure.



2. **FastText 分类**：训专用 FastText 按语言特征与语义连贯判质量，识别自然语言流畅，语法正常的文档。

3. **Embedding-based similarity analysis**: Using document embeddings (Jianlv Chen et al. 2024), we compute document-level similarity scores to identify and remove near-duplicates while preserving semantically valuable variations. This approach helps maintain diversity in our training corpus.



3. **嵌入相似度**：用文档嵌入算相似度，去近重复同时保留有语义价值的变体，维持语料多样性。

4. **LLM-based quality assessment**: Following (Penedo et al. 2024), we leverage LLMs to score documents based on coherence, informativeness, and potential educational value. This method is particularly effective at identifying nuanced quality indicators that simpler methods might miss.



4. **LLM 质量评估**：按 FineWeb 一类做法，用 LLM 按连贯性，信息量，教育价值打分，捕捉简单方法易漏的细腻质量信号。

The final quality score for each document is calculated as a combination of these individual scores. Based on extensive empirical analysis, we implement dynamic sampling rates, where high-quality documents are upsampled, while low-quality documents are downsampled during training.



最终质量分为各分组合；据实证分析做动态采样率：高质量上采样，低质量下采样。

**Code data** The code data primarily consists of two categories. For the pure code data derived from code files, we adhered to the methodology of BigCode (R. Li et al. 2023; Lozhkov et al. 2024) and conducted a comprehensive preprocessing of the dataset. Initially, we eliminated miscellaneous languages and applied a rule-based cleaning procedure to enhance data quality. Subsequently, we addressed language imbalance through strategic sampling techniques. Specifically, markup languages such as JSON, YAML, and YACC were down-sampled, while 32 major programming languages, including Python, C, C++, Java, and Go, were up-sampled to ensure a balanced representation. Regarding the text-code interleaved data sourced from various data sources, we use an embedding-based method to recall high-quality data. This approach ensures the diversity of the data and maintains its high quality.



**代码数据** 主要两类。纯代码文件：沿 BigCode 方法全面预处理-- 去掉杂项语言，规则清洗，再策略采样纠失衡：JSON/YAML/YACC 等标记语言下采样，Python，C，C++，Java，Go 等 32 种主语言上采样。图文/文本-代码交错数据：用嵌入召回高质量样本，保多样与质量。

**Math & Reasoning data** The mathematics and reasoning component of our dataset is crucial for developing strong analytical and problem-solving capabilities. The mathematical pre-training data are mainly retrieved from web text and PDF documents collected from publicly available internet sources. (Paster et al. 2023) Initially, we discovered that our general-domain text extraction, data cleaning process and OCR models exhibited high false negative rates in the mathematical domain. Therefore, we first developed specialized data cleaning procedures and OCR models specifically for mathematical content, aiming to maximize the recall rate of mathematical data. Subsequently, we implemented a two-stage data cleaning process:



**数学与推理数据** 对分析与解题能力关键。数学预训练主要来自公开网络文本与 PDF。起初发现通用抽取，清洗与 OCR 在数学域假阴性高，故先做数学专用清洗与 OCR 以抬召回，再两阶段清洗：

1. Using FastText model for initial cleaning to remove most irrelevant data.



1. FastText 初清，去掉多数无关数据。

<!-- page 22 of 25 -->

2. Utilizing a fine-tuned language model to further clean the remaining data, resulting in high-quality mathematical data.



2. 用微调语言模型再清剩余数据，得到高质量数学数据。

**Knowledge data** The knowledge corpus is meticulously curated to ensure a comprehensive coverage in academic disciplines. Our knowledge base primarily consists of academic exercises, textbooks, research papers, and other general educational literature. A significant portion of these materials is digitized through OCR processing, for which we have developed proprietary models optimized for academic content, particularly for handling mathematical formulas and special symbols.



**知识数据** 精心策展以覆盖多学科学术面。主体为习题，教材，论文与一般教育文献；大量经 OCR 数字化，我们开发了面向学术内容（尤其公式与特殊符号）的专用模型。

We employ internal language models to annotate documents with multi-dimensional labels, including:



用内部语言模型做多维标注，包括：

1. OCR quality metrics to assess recognition accuracy



1. OCR 质量指标，评估识别准确度

2. Educational value indicators measuring pedagogical relevance



2. 教育价值指标，衡量教学相关度

3. Document type classification (e. g., exercises, theoretical materials)



3. 文档类型分类（如习题，理论材料）

Based on these multi-dimensional annotations, we implement a sophisticated filtering and sampling pipeline. First and foremost, documents are filtered through OCR quality thresholds. Our OCR quality assessment framework places special attention on detecting and filtering out common OCR artifacts, particularly repetitive text patterns that often indicate recognition failures.



基于多维标注做过滤与采样：先过 OCR 质量阈值；质评框架特别关注过滤常见 OCR 伪影，尤其常标志识别失败的重复文本模式。

Beyond basic quality control, we carefully evaluate the educational value of each document through our scoring system. Documents with high pedagogical relevance and knowledge depth are prioritized, while maintaining a balance between theoretical depth and instructional clarity. This helps ensure that our training corpus contains high-quality educational content that can effectively contribute to the model’s knowledge acquisition.



在基础质控之外，用打分系统评估教育价值：优先高教学相关与知识深度文档，并在理论深度与讲授清晰之间平衡，使语料有效贡献知识习得。

Finally, to optimize the overall composition of our training corpus, the sampling strategy for different document types is empirically determined through extensive experimentation. We conduct isolated evaluations to identify document subsets that contribute most significantly to the model’s knowledge acquisition capabilities. These high-value subsets are upsampled in the final training corpus. However, to maintain data diversity and ensure model generalization, we carefully preserve a balanced representation of other document types at appropriate ratios. This data-driven approach helps us optimize the trade-off between focused knowledge acquisition and broad generalization capabilities.



最终各文档类型采样比由大量实验经验确定：隔离评估找出对知识习得贡献最大的子集并上采样；同时按适当比例保留其他类型以保多样与泛化，在「聚焦知识」与「广覆盖」之间折中。

### B. 2 Multimodal Data ### B. 2 多模态数据

Our multi-modal pretraining corpus is designed to provide high-quality data that enables models to process and understand information from multiple modalities, including text, images, and videos. To this end, we also have curated high-quality data from five categories-captioning, interleaving, OCR (Optical Character Recognition), knowledge, and general question answering-to form the corpus.



多模态预训练语料使模型能处理理解文本，图像，视频等多模态信息。我们策展五类高质量数据：caption，交错，OCR，知识，一般问答。

When constructing our training corpus, we developed several multi-modal data processing pipelines to ensure data quality, encompassing filtering, synthesis, and deduplication. Establishing an effective multi-modal data strategy is crucial during the joint training of vision and language, as it both preserves the capabilities of the language model and facilitates alignment of knowledge across diverse modalities.



构建语料时开发多条多模态处理管线（过滤，合成，去重）。视觉-语言联合训练中，有效多模态数据策略既要保住语言模型能力，又要促成跨模态知识对齐。

We provide a detailed description of these sources in this section, which is organized into the following categories:



本节按下列类别详述来源：

**Caption data** Our caption data provides the model with fundamental modality alignment and a broad range of world knowledge. By incorporating caption data, the multi-modal LLM gains wider world knowledge with high learning efficiency. We have integrated various open-source Chinese and English caption datasets like (Schuhmann et al. 2022; S. Y. Gadre et al. 2024) and also collected substantial in-house caption data from multiple sources. However, throughout the training process, we strictly limit the proportion of synthetic caption data to mitigate the risk of hallucination stemming from insufficient real-world knowledge.



**Caption 数据** 提供基础模态对齐与广泛世界知识，学习效率高。整合开源中英 caption（如 LAION, DataComp）与大量内部 caption；训练全程严格限制合成 caption 比例，减轻因真实世界知识不足导致的幻觉风险。

For general caption data, we follow a rigorous quality control pipeline that avoids duplication and maintain high image-text correlation. We also vary image resolution during pretraining to ensure that the vision tower remains effective when processing images of both high- and low-resolution.



一般 caption 走严格质控：去重，保高图文相关；预训练中变化图像分辨率，使视觉塔在高低分辨率下都有效。

**Image-text interleaving data** During the pretraining phase, model is benefit from interleaving data for many aspects, for example, multi-image comprehension ability can be boosted by interleaving data; interleaving data always provide detailed knowledge for the given image; a longer multi-modal context learning ability can also be gained by the interleaving data. What’s more, we also find that interleaving data can contributes positively to maintaining the model’s language abilities. Thus, image-text interleaving data is an important part in our training corpus. Our multi-modal



**图文交错数据** 预训练中多方面受益：抬多图理解，给图像带更细知识，练更长多模态上下文；还发现有助于维持语言能力。因此交错数据是语料重要部分。我们的多模态

<!-- page 23 of 25 -->

corpus considered open-sourced interleave datasets like (Zhu et al. 2024; Laurençon et al. 2024) and also constructed large-scale in-house data using resources like textbooks, webpages and tutorials. Further, we also find that synthesizing the interleaving data benefits the performance of multi-modal LLM for keeping the text knowledges. To ensure each image’s knowledge is sufficiently studied, for all the interleaving data, other than the standard filtering, deduping and other quality control pipeline, we also integrated a data reordering procedure for keeping all the image and text in the correct order.



语料纳入开源交错集（如 Multimodal C4, OBELICS），并用教材，网页，教程等建大规模内部数据。还发现合成交错有助于保住文本知识。为保证每张图的知识被充分学习，除标准过滤，去重等质控外，还做重排序，保持图文正确顺序。

**OCR data** Optical Character Recognition (OCR) is a widely adopted technique that converts text from images into an editable format. In k1.5, a robust OCR capability is deemed essential for better aligning the model with human values. Accordingly, our OCR data sources are diverse, ranging from open-source to in-house datasets, and encompassing both clean and augmented images.



**OCR 数据** OCR 把图中文字转成可编辑格式；在 k1.5 中，稳健 OCR 被视为更好对齐人类价值所必需。来源多样：开源与内部，干净与增强图像皆有。

In addition to the publicly available data, we have developed a substantial volume of in-house OCR datasets, covering multilingual text, dense text layouts, web-based content, and handwritten samples. Furthermore, following the principles outlined in OCR 2.0 (H. Wei et al. 2024), our model is also equipped to handle a variety of optical image types, including figures, tables, geometry diagrams, mermaid plots, and natural scene text. We apply extensive data augmentation techniques-such as rotation, distortion, color adjustments, and noise addition-to enhance the model’s robustness. As a result, our model achieves a high level of proficiency in OCR tasks.



除公开数据外，内部 OCR 覆盖多语，密排，网页与手写；并按 OCR 2.0 原则覆盖图，表，几何图，mermaid，自然场景文字等。大量增强（旋转，畸变，调色，加噪）提升稳健性，OCR 任务达到较高熟练度。

**Knowledge data** The concept of multi-modal knowledge data is analogous to the previously mentioned text pretraining data, except here we focus on assembling a comprehensive repository of human knowledge from diverse sources to further enhance the model’s capabilities. For example, carefully curated geometry data in our dataset is vital for developing visual reasoning skills, ensuring the model can interpret the abstract diagrams created by humans.



**知识数据** 概念类似文本预训练知识，但聚焦从多样来源组装人类知识库。例如精心策展的几何数据对视觉推理至关重要，使模型能解读人类绘制的抽象图示。

Our knowledge corpus adheres to a standardized taxonomy to balance content across various categories, ensuring diversity in data sources. Similar to text-only corpora, which gather knowledge from textbooks, research papers, and other academic materials, multi-modal knowledge data employs both a layout parser and an OCR model to process content from these sources. While we also include filtered data from internet-based and other external resources.



知识语料按标准分类法平衡各类，保来源多样；与文本侧类似，从教材，论文等取料，并用版面解析与 OCR 处理；亦纳入过滤后的互联网等外部资源。

Because a significant portion of our knowledge corpus is sourced from internet-based materials, infographics can cause the model to focus solely on OCR-based information. In such cases, relying exclusively on a basic OCR pipeline may limit training effectiveness. To address this, we have developed an additional pipeline that better captures the purely textual information embedded within images.



因大量来自互联网，信息图易让模型只盯 OCR 信息；仅靠基础 OCR 管线会限制训练效果。为此另建管线，更好捕获图中纯文本信息。

**General QA Data** During the training process, we observed that incorporating a substantial volume of high-quality QA datasets into pretraining offers significant benefits. Specifically, we included rigorous academic datasets addressing tasks such as grounding, table/chart question answering, web agents, and general QA. In addition, we compiled a large amount of in-house QA data to further enhance the model’s capabilities. To maintain balanced difficulty and diversity, we applied scoring models and meticulous manual categorization to our general question answering dataset, resulting in overall performance improvements.



**一般 QA 数据** 训练中观察到预训练混入大量高质量 QA 显著有益。纳入 grounding，表/图问答，web agent，一般 QA 等严谨学术集，并汇编大量内部 QA；用打分模型与细致人工分类平衡难度与多样性，整体表现提升。

### B. 3 Model Architecture ### B. 3 模型架构

Kimi k-series models employ a variant of the Transformer decoder (Vaswani et al. 2017) that integrates multimodal capabilities alongside improvements in architecture and optimization strategies, illustrated in Figure 11. These advancements collectively support stable large-scale training and efficient inference, tailored specifically to large-scale reinforcement learning and the operational requirements of Kimi users.



Kimi k 系列采用 Transformer 解码器变体，整合多模态能力并改进架构与优化策略，见图 11。这些改进共同支撑稳定大规模训练与高效推理，专为大规模 RL 与 Kimi 用户运营需求定制。

Extensive scaling experiments indicate that most of the base model performance comes from improvements in the quality and diversity of the pretraining data. Specific details regarding model architecture scaling experiments lie beyond the scope of this report and will be addressed in future publications.



大量扩展实验表明：底座表现大多来自预训练数据质量与多样性的提升。架构扩展实验细节超出本报告范围，留给后续发表。

### B. 4 Training Stages ### B. 4 训练阶段

The Kimi k1.5 model is trained in three stages: the vision-language pretraining stage, the vision-language cooldown stage, and the long-context activation stage. Each stage of the Kimi k1.5 model’s training focuses on a particular capability enhancement.



Kimi k1.5 分三阶段训练：视觉-语言预训练，视觉-语言 cooldown，长上下文激活；每阶段聚焦特定能力增强。

**Vision-language pretraining stage** In this stage, the model is firstly trained solely on language data, establishing a robust language model foundation. Then the model is gradually introduced to interleaved vision-language data, acquiring multimodal capabilities. The visual tower is initially trained in isolation without updating the language model parameters, then we unfreeze the language model layers, and ultimately increase the proportion of vision-text data



**视觉-语言预训练** 先纯语言立稳语言底座，再逐步引入交错视觉-语言数据获得多模态能力。视觉塔起初单独训，不更新语言模型参数，再解冻语言层，最终把视觉-文本数据比例

<!-- page 24 of 25 -->

to 30%. The final data mixtures and their respective weights were determined through ablation studies conducted on smaller models.



提到 30%。最终数据混合与权重由小模型消融确定。

![Image block](images/p24-figure-11-kimi-k1-5-supports-interleaved-images-and.png)

Figure 11: Kimi k1.5 supports interleaved images and text as input, leveraging large-scale reinforcement learning to enhance the model’s reasoning capabilities.



图 11: Kimi k1.5 支持图文交错输入，并借助大规模强化学习增强推理能力。

**Vision-language cooldown stage** The second stage serves as a cooldown phase, where the model is continue trained with high-quality language and vision-language datasets to ensure superior performance. Through empirical investigation, we observed that the incorporation of synthetic data during the cooldown phase yields significant performance improvements, particularly in mathematical reasoning, knowledge-based tasks, and code generation. The English and Chinese components of the cooldown dataset are curated from high-fidelity subsets of the pre-training corpus. For math, knowledge, and code domains, we employ a hybrid approach: utilizing selected pre-training subsets while augmenting them with synthetically generated content. Specifically, we leverage existing mathematical, knowledge and code corpora as source material to generate question-answer pairs through a proprietary language model, implementing rejection sampling techniques to maintain quality standards (Yue, Qu, et al. 2023; D. Su et al. 2024). These synthesized QA pairs undergo comprehensive validation before being integrated into the cooldown dataset.



**视觉-语言 cooldown** 第二阶段继续用高质量语言与视觉-语言数据训，巩固表现。实证发现 cooldown 期混入合成数据显著抬分，尤其数学推理，知识任务与代码生成。中英 cooldown 取自预训练高保真子集；数理与代码域采用「预训练子集 + 合成」混合：用既有语料经专有语言模型生成问答对，并以拒绝采样保质（MAmmoTH，Nemotron-CC 一类做法），合成 QA 全面校验后再并入 cooldown。

**Long-context activation stage** Finally, in the third stage, k1.5 is trained with upsampled long-context cooldown data, enabling it to process extended sequences and support tasks that demand longer context. To ensure excellent long-text capabilities of the base model, we upsampled long-context data and used 40% full attention data and 60% partial attention data during long context training. The full attention data came partly from high-quality natural data and partly from synthetic long context Q&A and summary data. The partial attention data came from uniform sampling of cooldown data. The RoPE frequency (J. Su et al. 2024) was set to 1, 000, 000. During this stage, we gradually extended length activation training by increasing the maximum sequence length from 4, 096 to 32, 768, and ultimately to 131, 072.



**长上下文激活** 第三阶段用上采样的长上下文 cooldown 数据训，使模型能处理更长序列。为保证底座长文能力，长上下文数据上采样，并在长上下文训练中使用 40% 全注意力数据与 60% 部分注意力数据。全注意力部分来自高质量自然数据与合成长文问答/摘要；部分注意力来自 cooldown 均匀采样。RoPE 频率设为 1, 000, 000。本阶段逐步拉长：最大序列从 4, 096 到 32, 768，最终到 131, 072。

## C Evaluation Details ## C 评测细节

### C. 1 Text Benchmark ### C. 1 文本基准

**MMLU** (Hendrycks et al. 2020) covers 57 subjects in STEM, the humanities, social sciences, and more. It ranges in difficulty from an elementary level to an advanced professional level, and it tests both world knowledge and problem-solving ability.



**MMLU** 覆盖 STEM，人文，社科等 57 科，难度从小学到专业，测世界知识与解题能力。

**IF-Eval** (J. Zhou et al. 2023) is a benchmark for evaluating large language models’ ability to follow verifiable instructions. There are 500+ prompts with instructions such as "write an article with more than 800 words", etc. Due to a version shift, the number of IFEval reported in Table 3 derived from an intermediate model. We will update the scores based on the final model.



**IF-Eval** 评可核验指令跟随，500+ 条提示（如「写超过 800 字文章」等）。因版本切换，表 3 中 IFEval 分数来自中间模型，将按终版更新。

**CLUEWSC** (L. Xu et al. 2020) is a coreference resolution task in CLUE benchmark, requiring models to determine if a pronoun and a noun phrase in a sentence co-refer, with data from Chinese fiction books.



**CLUEWSC** 为 CLUE 中的共指消解：判断句中代词与名词短语是否共指，数据来自中文小说。

**C-EVAL** (Y. Huang et al. 2023) is a comprehensive Chinese evaluation suite for assessing advanced knowledge and reasoning abilities of foundation models. It includes 13, 948 multiple-choice questions across 52 disciplines and four difficulty levels.



**C-EVAL** 综合中文评测套件，测底座高级知识与推理；含 13, 948 道选择题，跨 52 学科，四难度档。

### C. 2 Reasoning Benchmark ### C. 2 推理基准

**HumanEval-Mul** is a subset of Multipl-E (Cassano, Gouwar, D. Nguyen, S. D. Nguyen, et al. 2022). MultiPL-E extends the HumanEval benchmark and MBPP benchmark to 18 languages that encompass a range of programming



**HumanEval-Mul** 是 MultiPL-E 子集。MultiPL-E 把 HumanEval 与 MBPP 扩到 18 种编程语言，覆盖多种

<!-- page 25 of 25 -->

paradigms and popularity. We choose HumanEval translations in 8 mainstream programming languages (Python, Java, Cpp, C#, JavaScript, TypeScript, PHP, and Bash).



范式与流行度。我们取 8 种主流语言的 HumanEval 译文：Python, Java, Cpp, C#, JavaScript, TypeScript, PHP, Bash。

**LiveCodeBench** (Jain et al. 2024) serves as a comprehensive and contamination-free benchmark for assessing large language models (LLMs) in coding tasks. It features live updates to prevent data contamination, holistic evaluation across multiple coding scenarios, high-quality problems and tests, and balanced problem difficulty. We test short-CoT model with questions from 2408-2411 (release v4), and long-CoT model with questions from 2412-2502 (release v5).



**LiveCodeBench** 综合，防污染的编程评测：滚动更新，多场景整体评估，高质量题与测例，难度均衡。短链用 2408–2411(release v4)题；长链用 2412–2502(release v5)题。

**AIME 2024** comprises the competition questions for the AIME in 2024. The AIME is a prestigious, invitation-only math contest for top high school students, assessing advanced math skills and requiring solid foundation and high logical thinking.



**AIME 2024** 为 2024 年 AIME 赛题。AIME 面向顶尖高中生的邀请制数学赛，考高级数学技能，需扎实基础与高逻辑思维。

**MATH-500** (Lightman et al. 2023) is a comprehensive mathematics benchmark that contains 500 problems on various mathematics topics including algebra, calculus, probability, and more. Tests both computational ability and mathematical reasoning. Higher scores indicate stronger mathematical problem-solving capabilities.



**MATH-500** 含 500 道代数，微积分，概率等题，测计算与数学推理；分越高解题越强。

**Codeforces** is a well-known online judge platform and serves as a popular testbed for evaluating long-CoT coding models. To achieve higher rankings in the Div2 and Div3 competitions, we utilize majority voting on the code snippets generated by the k1.5 long-CoT model, employing test cases that are also generated by the same model. The percentile of the codeforce ELO rating was extracted from OpenAI Day12 talk.



**Codeforces** 知名在线评测平台，常作长链编程模型试验场。为在 Div2/Div3 拿更高排名，对 k1.5 长链生成的代码片段做多数投票，测例亦由同模型生成。Codeforces ELO 百分位取自 OpenAI Day12 talk。

### C. 3 Image Benchmark ### C. 3 图像基准

**MMMU** (Yue, Ni, et al. 2024) encompasses a carefully curated collection of 11.5K multimodal questions sourced from college exams, quizzes, and textbooks. These questions span six major academic fields: Art & Design, Business, Science, Health & Medicine, Humanities & Social Science, and Tech & Engineering.



**MMMU** 精选约 11.5K 多模态题，来自大学考试，测验与教材，跨六大学术领域：艺术与设计，商业，科学，健康与医学，人文社科，技术与工程。

**MATH-Vision** (MATH-V) (K. Wang et al. 2024) is a carefully curated collection of 3, 040 high-quality mathematical problems with visual contexts that are sourced from real math competitions. It covers 16 distinct mathematical disciplines and is graded across 5 levels of difficulty. This dataset offers a comprehensive and diverse set of challenges, making it ideal for evaluating the mathematical reasoning abilities of LMMs.



**MATH-Vision(MATH-V)** 精选 3, 040 道带视觉上下文的高质量数学题，来自真实数学竞赛；覆盖 16 个数学学科，5 档难度，适合评 LMM 数学推理。

**MathVista** (Lu et al. 2023) is a benchmark that integrates challenges from a variety of mathematical and visual tasks, demanding participants to exhibit fine-grained, deep visual understanding along with compositional reasoning to successfully complete the tasks.



**MathVista** 整合多种数学与视觉任务挑战，要求细粒度，深入的视觉理解与组合推理才能完成。
