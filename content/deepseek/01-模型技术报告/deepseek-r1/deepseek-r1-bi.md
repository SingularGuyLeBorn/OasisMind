---
title: "DeepSeek-R1 · 对照译稿"
category: "模型技术报告"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek-R1 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 86 -->

arXiv: 2501.12948v2 [cs. CL] 4 Jan 2026

Qdeepseek

# DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning / DeepSeek-R1: 用强化学习激励大语言模型的推理能力

DeepSeek-AI

**research@deepseek. com**

## Abstract

General reasoning represents a long-standing and formidable challenge in artificial intelligence. Recent breakthroughs, exemplified by large language models (LLMs) (Brown et al., 2020; OpenAI, 2023) and chain-of-thought prompting (Wei et al., 2022b), have achieved considerable success on foundational reasoning tasks. However, this success is heavily contingent upon extensive human-annotated demonstrations, and models’ capabilities are still insufficient for more complex problems. Here we show that the reasoning abilities of LLMs can be incentivized through pure reinforcement learning (RL), obviating the need for human-labeled reasoning trajectories. The proposed RL framework facilitates the emergent development of advanced reasoning patterns, such as self-reflection, verification, and dynamic strategy adaptation. Consequently, the trained model achieves superior performance on verifiable tasks such as mathematics, coding competitions, and STEM fields, surpassing its counterparts trained via conventional supervised learning on human demonstrations. Moreover, the emergent reasoning patterns exhibited by these large-scale models can be systematically harnessed to guide and enhance the reasoning capabilities of smaller models.



通用推理一直是 AI 里难啃的骨头. 大语言模型与 CoT 提示在基础推理题上已经能打, 但成功高度依赖大量人类标注示范, 复杂题上仍不够用. 本文表明: 纯靠强化学习就能把 LLM 的推理能力「激励」出来, 不必再喂人类标注的推理轨迹. 这套 RL 框架会催生自我反思, 校验, 动态换策略等高级推理模式; 训出来的模型在数学, 编程竞赛, STEM 等可核验任务上超过按人类示范做监督微调的同族; 大规模模型里冒出来的长思考模式, 还可以系统化地用来带小模型.

## 1. Introduction

Reasoning capability, the cornerstone of human intelligence, enables complex cognitive tasks ranging from mathematical problem-solving to logical deduction and programming. Recent advances in artificial intelligence have demonstrated that large language models (LLMs) can exhibit emergent behaviors, including reasoning abilities, when scaled to a sufficient size (Kaplan et al., 2020; Wei et al., 2022a). However, achieving such capabilities in pre-training typically demands substantial computational resources. In parallel, a complementary line of research has demonstrated that large language models can be effectively augmented through chain-of-thought (CoT) prompting. This technique, which involves either providing carefully designed few-shot examples or using minimalistic prompts such as “Let’s think step by step”(Kojima et al., 2022; Wei et al., 2022b), enables models to produce intermediate reasoning steps, thereby substantially enhancing their performance on complex tasks. Similarly, further performance gains have been observed when models learn high-quality, multi-step reasoning trajectories during the post-training phase (Chung et al., 2024; OpenAI, 2023). Despite their effectiveness, these approaches exhibit notable limitations. Their dependence on human-annotated reasoning traces hinders scalability and introduces cognitive biases. Furthermore, by constraining models to replicate human thought processes, their performance is inherently capped by the human-



推理是人类智能的底座, 从解题, 演绎到写程序都靠它. 规模够大时, LLM 会出现含推理在内的涌现行为, 但预训练把这种能力砸出来通常极贵. 另一条线是 CoT 提示: 精心设计的 few-shot, 或一句「Let’s think step by step」, 逼模型写出中间步骤, 复杂题分数会明显抬高. 后训练阶段学高质量多步轨迹也能再涨. 局限同样清楚: 依赖人类标注轨迹, 难扩, 还带认知偏见; 把模型困在模仿人类思路里, 分数也就被人类示范封顶.

<!-- page 2 of 86 -->

provided exemplars, which prevents the exploration of superior, non-human-like reasoning pathways.



示范一旦定成模板, 模型就很难再探索「不像人, 但可能更好」的推理路径.

To tackle these issues, we aim to explore the potential of LLMs for developing reasoning abilities through self-evolution in an RL framework, with minimal reliance on human labeling efforts. Specifically, we build upon DeepSeek-V3-Base (DeepSeek-AI, 2024b) and employ Group Relative Policy Optimization (GRPO) (Shao et al., 2024) as our RL framework. The reward signal is solely based on the correctness of final predictions against ground-truth answers, without imposing constraints on the reasoning process itself. Notably, we bypass the conventional supervised fine-tuning (SFT) phase before RL training. This design choice stems from our hypothesis that human-defined reasoning patterns may limit model exploration, whereas unrestricted RL training can better incentivize the emergence of novel reasoning capabilities in LLMs. Through this process, detailed in Section 2, our model (referred to as DeepSeek-R1- Zero) naturally developed diverse and sophisticated reasoning behaviors. In solving reasoning problems, the model exhibits a tendency to generate longer responses, incorporating verification, reflection, and the exploration of alternative approaches within each response. Although we do not explicitly teach the model how to reason, it successfully learns improved reasoning strategies through reinforcement learning.



为压低对人类标注的依赖, 我们在 RL 框架里做自我演化: 底座用 DeepSeek-V3-Base, 算法用 **Group Relative Policy Optimization(GRPO)**. 奖励只看最终预测相对标准答案是否正确, 不约束中间推理怎么写. RL 前故意跳过常规 SFT-- 假设是: 人类事先写好的推理模板会限制探索, 放开手脚的 RL 更容易冒出新能力. §2 里把这条路训成的模型叫 DeepSeek-R1-Zero: 解题时回复自然变长, 夹带校验, 反思与换路; 并没有人手把手教它「怎么想」, 策略却靠强化学习自己变好.

解释: GRPO(组相对策略优化)= 同一道题从旧策略采一组回答, 用组内奖励的均值/方差估优势, 省掉 PPO 里那套价值网络(critic). 冷启动(cold start)= 正式大规模 RL 前, 先用少量高质量长 CoT 样本把模型「扶」到可读, 可用的起点. 长思考(long CoT)= 生成成百上千 token 的中间推理, 而不是直接甩答案.

Although DeepSeek-R1-Zero demonstrates excellent reasoning capabilities, it faces challenges such as poor readability and language mixing, occasionally combining English and Chinese within a single chain-of-thought response. Furthermore, the rule-based RL training stage of DeepSeek-R1-Zero is narrowly focused on reasoning tasks, resulting in limited performance in broader areas such as writing and open-domain question answering. To address these challenges, we introduce DeepSeek-R1, a model trained through a multi-stage learning framework that integrates rejection sampling, reinforcement learning, and supervised finetuning, detailed in Section 3. This training pipeline enables DeepSeek-R1 to inherit the reasoning capabilities of its predecessor, DeepSeek-R1-Zero, while aligning model behavior with human preferences through additional non-reasoning data.



R1-Zero 推理强, 但可读性差, 会中英混写; 规则 RL 又几乎只盯推理题, 写作与开放问答偏弱. 于是引入 DeepSeek-R1: 多阶段管线, 把拒绝采样, RL 与 SFT 串起来(§3). 目标是继承 Zero 的推理, 同时用非推理数据把行为拉向人类偏好.

To enable broader access to powerful AI at a lower energy cost, we have distilled several smaller models and made them publicly available. These distilled models exhibit strong reasoning capabilities, surpassing the performance of their original instruction-tuned counterparts. We believe that these instruction-tuned versions will also significantly contribute to the research community by providing a valuable resource for understanding the mechanisms underlying long chain-of-thought (CoT) reasoning models and for fostering the development of more powerful reasoning models. We release DeepSeek-R1 series models to the public at [https://huggingface. co/deepseek-ai](https://huggingface. co/deepseek-ai).



为了更低能耗地普及强能力, 又把若干小模型蒸馏出来公开. 蒸馏版推理明显强过各自原来的指令微调版, 也方便社区研究长 CoT 机制. 系列权重发布于 https://huggingface. co/deepseek-ai.

解释: 蒸馏(distillation)= 用大教师模型生成的高质量轨迹去微调小学生模型, 让小模型学到类似的长思考行为, 而不必自己扛同等规模的 RL.

## 2. DeepSeek-R1-Zero


We begin by elaborating on the training of DeepSeek-R1-Zero, which relies exclusively on reinforcement learning without supervised fine-tuning. To facilitate large-scale RL efficiency, we adopt Group Relative Policy Optimization (GRPO) (Shao et al., 2024).



先讲 R1-Zero: 只靠 RL, 不做 SFT. 为撑住大规模 RL, 算法采用 GRPO.

### 2.1. Group Relative Policy Optimization 组相对策略优化(GRPO)

GRPO (Shao et al., 2024) is the reinforcement learning algorithm that we adopt to train DeepSeek-R1-Zero and DeepSeek-R1. It was originally proposed to simplify the training process and reduce the resource consumption of Proximal Policy Optimization (PPO) (Schulman et al., 2017), which is widely used in the RL stage of LLMs (Ouyang et al., 2022).



GRPO 用来训 R1-Zero 与 R1. 它最初是为了简化 PPO, 压资源: PPO 在 LLM 对齐阶段很常见, 但贵.

<!-- page 3 of 86 -->

For each question $q , $ GRPO samples a group of outputs $\{ o _ { 1 } , o _ { 2 } , \cdots , o _ { G } \}$ from the old policy $\pi _ { \theta _ { o l d } }$ and then optimizes the policy model $\pi _ { \theta }$ by maximizing the following objective:



对每个问题 $q$, GRPO 从旧策略 $\pi_{\theta_{old}}$ 采一组输出 $\{o_1, \ldots, o_G\}$, 再最大化下面目标来更新策略 $\pi_\theta$:

$$
\begin{array}{r l} & {\mathcal {J} _ {G R P O} (\theta) = \mathbb {E} [ q \sim P (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {o l d}} (O | q) ]} \\ & {\frac {1}{G} \sum_ {i = 1} ^ {G} \left(\min \left(\frac {\pi_ {\theta} (o _ {i} | q)}{\pi_ {\theta_ {o l d}} (o _ {i} | q)} A _ {i}, \mathrm{clip} \left(\frac {\pi_ {\theta} (o _ {i} | q)}{\pi_ {\theta_ {o l d}} (o _ {i} | q)}, 1 - \varepsilon , 1 + \varepsilon\right) A _ {i}\right) - \beta \mathbb {D} _ {K L} \left(\pi_ {\theta} | | \pi_ {r e f}\right)\right), } \end{array}\tag{1}
$$

$$
\mathbb {D} _ {K L} \left(\pi _ {\theta} | | \pi _ {r e f}\right) = \frac {\pi _ {r e f} (o _ {i} | q)}{\pi_ {\theta} (o _ {i} | q)} - \log \frac {\pi_ {r e f} (o _ {i} | q)}{\pi_ {\theta} (o _ {i} | q)} - 1, \tag{2}
$$

where $\pi _ { r e f }$ is a reference policy, 𝜀 and $\beta$ are hyper-parameters, and $A _ { i }$ is the advantage, computed using a group of rewards $\{ r _ { 1 } , r _ { 2 } , \cdots , r _ { G } \}$ corresponding to the outputs within each group:



其中 $\pi_{ref}$ 是参考策略, ε 与 β 是超参, $A_i$ 是优势, 由同组奖励 $\{r_1, \ldots, r_G\}$ 算出:

$$
A _ {i} = \frac {r _ {i} - \text {mean} (\{r _ {1} , r _ {2} , \cdots , r _ {G} \})}{\text {std} (\{r _ {1} , r _ {2} , \cdots , r _ {G} \})}. \tag{3}
$$

We give a comparison of GRPO and PPO in Supplementary A. 3. To train DeepSeek-R1-Zero, we set the learning rate to 3e-6, the KL coefficient to 0.001, and the sampling temperature to 1 for rollout. For each question, we sample 16 outputs with a maximum length of 32, 768 tokens before the 8.2k step and 65, 536 tokens afterward. As a result, both the performance and response length of DeepSeek-R1-Zero exhibit a significant jump at the 8.2k step, with training continuing for a total of 10, 400 steps, corresponding to 1.6 training epochs. Each training step consists of 32 unique questions, resulting in a training batch size of 512. Every 400 steps, we replace the reference model with the latest policy model. To accelerate training, each rollout generates 8, 192 outputs, which are randomly split into 16 mini-batches and trained for only a single inner epoch.



GRPO 与 PPO 的对照见附录 A. 3. 训 R1-Zero: 学习率 3e-6, KL 系数 0.001, rollout 温度 1; 每题采 16 条, 最大长度在 8.2k step 前为 32, 768, 之后为 65, 536. 因此在 8.2k step 附近分数与回复长度都跳一截; 总共训 10, 400 step(约 1.6 epoch). 每步 32 道独特题, 训练 batch 512. 每 400 step 用最新策略换掉参考模型. 加速上: 每次 rollout 生成 8, 192 条, 随机切成 16 个 mini-batch, 只跑一个 inner epoch.

Table 1 | Template for DeepSeek-R1-Zero. prompt will be replaced with the specific reasoning question during training.



表 1｜DeepSeek-R1-Zero 的模板. 训练时把 prompt 换成具体推理题.

A conversation between User and Assistant. The user asks a question, and the Assistant solves it. The assistant first thinks about the reasoning process in the mind and then provides the user with the answer. The reasoning process and answer are enclosed within &lt; think&gt;... &lt; /think&gt; and &lt; answer&gt;... &lt; /answer&gt; tags, respectively, $\mathbf { i . e . } , $ &lt; think&gt; reasoning process here &lt; /think&gt; &lt; answer&gt; answer here &lt; /answer&gt;. User: prompt. Assistant:



用户与助手对话. 用户提问, 助手先在心里推理, 再给答案. 推理与答案分别包在 &lt; think&gt;... &lt; /think&gt; 与 &lt; answer&gt;... &lt; /answer&gt; 里. User: prompt. Assistant:

Our high-performance RL infrastructure is described in Supplementary B. 1, ensuring scalable and efficient training.



高性能 RL 基建见附录 B. 1.

### 2.2. Reward Design 奖励设计

The reward is the source of the training signal, which decides the direction of RL optimization. For DeepSeek-R1-Zero, we employ rule-based rewards to deliver precise feedback for data in mathematical, coding, and logical reasoning domains. Our rule-based reward system mainly consists of two types of rewards: accuracy rewards and format rewards.



奖励决定 RL 往哪走. R1-Zero 在数学, 代码, 逻辑域用规则奖励给准反馈, 主要两类: 准确奖励与格式奖励.

**Accuracy rewards** evaluate whether the response is correct. For example, in the case of math problems with deterministic results, the model is required to provide the final answer in a specified format (e. g., within a box), enabling reliable rule-based verification of correctness. Similarly, for code competition prompts, a compiler can be utilized to evaluate the model’s



**准确奖励**看答对没有. 确定性数学题要求最终答案按指定格式(如装进 box), 方便规则核验; 竞赛代码题则可用编译器对照测例打分.

<!-- page 4 of 86 -->

![Chart block](images/p04-chart.png)

![Chart block](images/p04-figure-1-a-aime-accuracy-of-deepseek-r1-zero-during.png)

Figure 1 | (a) AIME accuracy of DeepSeek-R1-Zero during training. AIME takes a mathematical problem as input and a number as output, illustrated in Table 32. Pass@1 and Cons@16 are described in Supplementary D. 1. The baseline is the average score achieved by human participants in the AIME competition. (b) The average response length of DeepSeek-R1-Zero on the training set during the RL process. DeepSeek-R1-Zero naturally learns to solve reasoning tasks with more thinking time. Note that a training step refers to a single policy update operation.



图 1｜(a) 训练过程中 R1-Zero 的 AIME 准确率. AIME 输入数学题, 输出数字, 示例见表 32; Pass@1 与 Cons@16 见附录 D. 1; 基线是人类参赛均分. (b) 训练集上平均回复长度随 RL 变长: 模型自发学会「多想一会儿」. 一步 = 一次策略更新.

responses against a suite of predefined test cases, thereby generating objective feedback on correctness.



把模型输出拿去跑预定测例, 得到客观对错反馈.

**Format rewards** complement the accuracy reward model by enforcing specific formatting requirements. In particular, the model is incentivized to encapsulate its reasoning process within designated tags, specifically ‘&lt; think&gt; ’ and ‘&lt; /think&gt; ’. This ensures that the model’s thought process is explicitly delineated, enhancing interpretability and facilitating subsequent analysis.



**格式奖励**补准确奖励: 激励把推理包进 `&lt; think&gt; ` / `&lt; /think&gt; `, 思考过程外露, 方便读, 也好后续分析.

$$
R e w a r d _ {\text {rule}} = R e w a r d _ {\text {acc}} + R e w a r d _ {\text {format}}\tag{4}
$$

The accuracy, reward and format reward are combined with the same weight. Notably, we abstain from applying neural reward models-whether outcome-based or process-based-to reasoning tasks. This decision is predicated on our observation that neural reward models are susceptible to reward hacking during large-scale reinforcement learning. Moreover, retraining such models necessitates substantial computational resources and introduces additional complexity into the training pipeline, thereby complicating the overall optimization process.



准确与格式等权相加. 推理任务上故意不用神经奖励模型(无论结果型还是过程型): 大规模 RL 下容易被黑客; 重训 RM 又贵, 还把管线搅复杂.

### 2.3. Incentivize Reasoning Capability in LLMs 在 LLM 里激励推理能力

Specifically, we apply the RL technique on the DeepSeek-V3 base to train DeepSeek-R1-Zero. During training, we design a straightforward template, to require DeepSeek-R1-Zero to first produce a reasoning process, followed by the final answer. We intentionally limit our constraints to this structural format, avoiding any content-specific biases to ensure that we can accurately observe the model’s natural progression during the RL process.



在 DeepSeek-V3 base 上跑 RL 得到 R1-Zero. 模板只要求「先推理, 后答案」, 故意不加内容偏好, 好观察 RL 过程中的自然演化.

Figure 1(a) depicts the performance trajectory of DeepSeek-R1-Zero on the AIME 2024 benchmark throughout the RL training process, where the average pass@1 score on AIME 2024 shows a significant increase, jumping from an initial 15.6% to 77.9%. In addition, by leveraging the self-consistency decoding (Wang et al., 2023c), the model’s performance can be



图 1(a): AIME 2024 上平均 pass@1 从 15.6% 跳到 77.9%. 再用 self-consistency 解码, 还能

<!-- page 5 of 86 -->

Table 2 | An interesting “aha moment” of an intermediate version of DeepSeek-R1-Zero. The model learns to rethink using an anthropomorphic tone. This is also an aha moment for us, allowing us to witness the power and beauty of reinforcement learning.



表 2｜R1-Zero 中间版本一个有意思的「aha moment」: 模型用人称口吻学会重想. 对作者也是顿悟时刻-- 亲眼看到强化学习的力量.

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family: monospace;">
Question: If $a &gt; 1$, then the sum of the real solutions of $\sqrt{a - \sqrt{a + x}} = x$ is equal to
Response: &lt; think&gt;
To solve the equation $\sqrt{a - \sqrt{a + x}} = x$, let's start by squaring both $\cdots$
$\left(\sqrt{a - \sqrt{a + x}}\right)^2 = x^2 \implies a - \sqrt{a + x} = x^2$.
Rearrange to isolate the inner square root term:
$(a - x^2)^2 = a + x \implies a^2 - 2ax^2 + (x^2)^2 = a + x \implies x^4 - 2ax^2 - x + (a^2 - a) = 0$
$\cdots$
Wait, wait. Wait. That's an aha moment I can flag here.
Let's reevaluate this step-by-step to identify if the correct sum can be $\cdots$
We started with the equation:
$\sqrt{a - \sqrt{a + x}} = x$
First, let's square both sides:
$a - \sqrt{a + x} = x^2 \implies \sqrt{a + x} = a - x^2$
Next, I could square both sides again, treating the equation: $\cdots$
$\cdots$
</div>

further improved, achieving an accuracy of 86.7%. This performance significantly surpasses the average performance across all human competitors. Besides the math competitions, as shown in Figure 10, DeepSeek-R1-Zero also achieves remarkable performance in coding competitions and graduate-level biology, physics, and chemistry problems. These results underscore the effectiveness of RL in enhancing the reasoning capabilities of large language models.



再抬到 86.7%, 显著超过人类参赛均分. 除数学外, Figure 10 显示编程竞赛与研究生级生/物/化题也很强--RL 确实能抬 LLM 推理.

The self-evolution of DeepSeek-R1-Zero exemplifies how RL can autonomously enhance a model’s reasoning capabilities.



R1-Zero 的自我演化, 是「RL 能自己把推理做强」的样本.

As shown in Figure 1(b), DeepSeek-R1-Zero exhibits a steady increase in thinking time throughout training, driven solely by intrinsic adaptation rather than external modifications. Leveraging long CoT, the model progressively refines its reasoning, generating hundreds to thousands of tokens to explore and improve its problem-solving strategies.



图 1(b): 思考时间随训练稳步变长, 靠的是内在适应, 不是外加改超参. 借长 CoT, 模型逐步打磨推理, 生成成百上千 token 去探索, 改策略.

The increase in thinking time fosters the autonomous development of sophisticated behaviors. Specifically, DeepSeek-R1-Zero increasingly exhibits advanced reasoning strategies such as reflective reasoning and systematic exploration of alternative solutions (see Figure 9(a) in Supplementary C. 2 for details), significantly boosting its performance on verifiable tasks like math and coding. Notably, during training, DeepSeek-R1-Zero exhibits an “aha moment” (Table 2), characterized by a sudden increase in the use of the word “wait” during reflections (see Figure 9(b) in Supplementary C. 2 for details). This moment marks a distinct change in reasoning patterns and clearly shows the self-evolution process of DeepSeek-R1-Zero.



想得更久, 会催生更复杂行为: 反思, 系统换路(附录 C. 2 图 9(a)), 可核验的数学与代码题跟着涨. 训练中还出现 Table 2 的「aha moment」-- 反思里「wait」突然变多(图 9(b)), 标志推理模式切了一档, 自我演化肉眼可见.

The self-evolution of DeepSeek-R1-Zero underscores the power and beauty of RL: rather than explicitly teaching the model how to solve a problem, we simply provide it with the right incentives, and it autonomously develops advanced problem-solving strategies. This serves as a reminder of the potential of RL to unlock higher levels of capabilities in LLMs, paving the way for more autonomous and adaptive models in the future.



要点是: 不必手把手教解题, 给对激励, 模型自己会长出高级策略. 这提醒我们, RL 还能继续解锁 LLM 更高能力.

<!-- page 6 of 86 -->

![Image block](images/p06-figure-2-the-multi-stage-pipeline-of-deepseek-r1-a.png)

Figure 2 | The multi-stage pipeline of DeepSeek-R1. A detailed background on DeepSeek-V3 Base and DeepSeek-V3 is provided in Supplementary A. 1. The models DeepSeek-R1 Dev1, Dev2, and Dev3 represent intermediate checkpoints within this pipeline.



图 2｜DeepSeek-R1 多阶段管线. V3 Base / V3 背景见附录 A. 1; Dev1 / Dev2 / Dev3 是中间检查点.

## 3. DeepSeek-R1


Although DeepSeek-R1-Zero exhibits strong reasoning capabilities, it faces several issues. DeepSeek-R1-Zero struggles with challenges like poor readability, and language mixing, as DeepSeek-V3-Base is trained on multiple languages, especially English and Chinese. To address these issues, we develop DeepSeek-R1, whose pipeline is illustrated in Figure 2.



R1-Zero 推理强, 但可读性差, 语言混杂(底座多语, 尤其中英). 为此做 R1, 管线见图 2.

In the initial stage, we collect thousands of cold-start data that exhibits a conversational, human-aligned thinking process. RL training is then applied to improve the model performance with the conversational thinking process and language consistency. Subsequently, we apply rejection sampling and SFT once more. This stage incorporates both reasoning and non-reasoning datasets into the SFT process, enabling the model to not only excel in reasoning tasks but also demonstrate advanced writing capabilities. To further align the model with human preferences, we implement a secondary RL stage designed to enhance the model’s helpfulness and harmlessness while simultaneously refining its reasoning capabilities.



开头先收集几千条冷启动数据: 对话式, 对人友好的思考过程; 再 RL, 抬性能并稳住语言一致; 接着拒绝采样 + 再做 SFT, 混进推理与非推理数据, 写作能力也要上来; 最后第二轮 RL, 同时抬有用性, 无害性与推理.

The remainder of this section details the key components of this pipeline: Section 3.1 introduces the Reward Model utilized in our RL stages, and Section 3.2 elaborates on the specific training methodologies and implementation details. Data we used in this stage is detailed in Supplementary B. 3.



§3.1 讲奖励模型, §3.2 讲训练细节; 本阶段数据见附录 B. 3.

### 3.1. Model-based Rewards 基于模型的奖励

For general data, we resort to reward models to capture human preferences in complex and nuanced scenarios. We build upon the DeepSeek-V3 pipeline and adopt a similar distribution of preference pairs and training prompts. For helpfulness, we focus exclusively on the final summary, ensuring that the assessment emphasizes the utility and relevance of the response to the user while minimizing interference with the underlying reasoning process. For harmlessness, we evaluate the entire response of the model, including both the reasoning process and the summary, to identify and mitigate any potential risks, biases, or harmful content that may arise



通用数据用奖励模型抓复杂偏好. 沿用 V3 管线与类似的偏好对分布. 有用性只评最终摘要, 少干扰底层推理; 无害性评整段(含思考与摘要), 抓风险, 偏见与有害内容.

<!-- page 7 of 86 -->

during the generation process.



生成过程中冒出来的问题也要管.

**Helpful Reward Model** Regarding helpful reward model training, we first generate preference pairs by prompting DeepSeek-V3 using the arena-hard prompt format, listed in Supplementary B. 2, where each pair consists of a user query along with two candidate responses. For each preference pair, we query DeepSeek-V3 four times, randomly assigning the responses as either Response A or Response B to mitigate positional bias. The final preference score is determined by averaging the four independent judgments, retaining only those pairs where the score difference (Δ) exceeds 1 to ensure meaningful distinctions. Additionally, to minimize length-related biases, we ensure that the chosen and rejected responses of the whole dataset have comparable lengths. In total, we curated 66, 000 data pairs for training the reward model. The prompts used in this dataset are all non-reasoning questions and are sourced either from publicly available open-source datasets or from users who have explicitly consented to share their data for the purpose of model improvement. The architecture of our reward model is consistent with that of DeepSeek-R1, with the addition of a reward head designed to predict scalar preference scores.



**有用性奖励模型**: 用 arena-hard 格式提示 DeepSeek-V3 造偏好对(附录 B. 2). 每对查四次, 随机交换 A/B 压位置偏置; 四次判决取平均, 只留 Δ>1 的对; 全库 chosen/rejected 长度大体对齐. 共约 66, 000 对; 提示全是非推理题, 来自公开集或用户明确授权数据. 架构与 R1 一致, 外加预测标量偏好分的 reward head.

$$
R e w a r d _ {h e l p f u l} = R M _ {h e l p f u l} (R e s p o n s e _ {A}, R e s p o n s e _ {B})\tag{5}
$$

The helpful reward models were trained with a batch size of 256, a learning rate of 6e-6, and for a single epoch over the training dataset. The maximum sequence length during training is set to 8192 tokens, whereas no explicit limit is imposed during reward model inference.



有用性 RM: batch 256, lr 6e-6, 1 epoch; 训练最大序列 8192; 推理时不显式限长.

**Safety Reward Model** To assess and improve model safety, we curated a dataset of 106, 000 prompts with model-generated responses annotated as “safe" or “unsafe" according to predefined safety guidelines. Unlike the pairwise loss employed in the helpfulness reward model, the safety reward model was trained using a point-wise methodology to distinguish between safe and unsafe responses. The training hyperparameters are the same as the helpful reward model.



**安全奖励模型**: 约 106, 000 条提示 + 模型回复, 按安全指南标 safe/unsafe. 不用成对损失, 改点式区分; 超参与有用性 RM 相同.

$$
\text {Reward} _ {\text {safety}} = R M _ {\text {safety}} (\text {Response})\tag{6}
$$

For general queries, each instance is categorized as belonging to either the safety dataset or the helpfulness dataset. The general reward, $R e w a r d _ { G e n e r a l } , $ assigned to each query corresponds to the respective reward defined within the associated dataset.



通用查询归入安全集或有用性集之一, 通用奖励 $Reward_{General}$ 取对应数据集里的定义.

### 3.2. Training Details 训练细节

#### 3.2.1. Training Details of the First RL Stage 第一轮 RL

In the first stage of RL, we set the learning rate to 3e-6, the KL coefficient to 0.001, the GRPO clip ratio 𝜀 to 10, and the sampling temperature to 1 for rollout. For each question, we sample 16 outputs with a maximum length of 32, 768. Each training step consists of 32 unique questions, resulting in a training batch size of 512 per step. Every 400 steps, we replace the reference model with the latest policy model. To accelerate training, each rollout generates 8, 192 outputs, which are randomly split into 16 minibatches and trained for only a single inner epoch. However, to mitigate the issue of language mixing, we introduce a language consistency reward during RL training, which is calculated as the proportion of target language words in the CoT.



第一轮: lr 3e-6, KL 0.001, GRPO clip ε=10, rollout 温度 1; 每题 16 条, 最长 32, 768; 每步 32 题, batch 512; 每 400 step 换参考模型; 每次 rollout 8, 192 条切 16 个 mini-batch, 一个 inner epoch. 为压语言混杂, 加语言一致性奖励: CoT 里目标语词占比.

$$
\text {Reward}_{\text {language}} = \frac{\text {Num}(\text {Words}_{\text {target}})}{\text {Num}(\text {Words})}\tag{7}
$$

<!-- page 8 of 86 -->

Although ablation experiments in Supplementary B. 6 show that such alignment results in a slight degradation in the model’s performance, this reward aligns with human preferences, making it more readable. We apply the language consistency reward to both reasoning and non-reasoning data by directly adding it to the final reward.



附录 B. 6 消融显示这类对齐会略伤分, 但更符合人类可读偏好. 推理与非推理数据都把语言奖励直接加进最终奖励.

Note that the clip ratio plays a crucial role in training. A lower value can lead to the truncation of gradients for a significant number of tokens, thereby degrading the model’s performance, while a higher value may cause instability during training.



clip 比很关键: 太小会砍掉大量 token 梯度, 伤性能; 太大训练不稳.

#### 3.2.2. Training Details of the Second RL Stage 第二轮 RL

Specifically, we train the model using a combination of reward signals and diverse prompt distributions. For reasoning data, we follow the methodology outlined in DeepSeek-R1-Zero, which employs rule-based rewards to guide learning in mathematical, coding, and logical reasoning domains. During the training process, we observe that CoT often exhibits language mixing, particularly when RL prompts involve multiple languages. For general data, we utilize reward models to guide training. Ultimately, the integration of reward signals with diverse data distributions enables us to develop a model that not only excels in reasoning but also prioritizes helpfulness and harmlessness. Given a batch of data, the reward can be formulated as



奖励信号与多样提示分布一起训. 推理数据沿用 R1-Zero 的规则奖励; 多语提示时 CoT 仍易混语. 通用数据走奖励模型. 目标是推理强, 同时有用, 无害. 一批数据上的奖励写成:

$$
R e w a r d = R e w a r d _ {\text {reasoning}} + R e w a r d _ {\text {general}} + R e w a r d _ {\text {language}}\tag{8}
$$

$$
\text {where, Reward}_{\text {reasoning}} = \text {Reward}_{\text {rule}}\tag{9}
$$

$$
\text{Reward}_{\text{general}} = \text{Reward}_{\text{reward\_model}} + \text{Reward}_{\text{format}}\tag{10}
$$

The second stage of RL retains most of the parameters from the first stage, with the key difference being a reduced temperature of 0.7, as we find that higher temperatures in this stage lead to incoherent generation. The stage comprises a total of 1, 700 training steps, during which general instruction data and preference-based rewards are incorporated exclusively in the final 400 steps. We find that more training steps with the model based preference reward signal may lead to reward hacking, which is documented in Supplementary B. 5. The total training cost is listed in Supplementary B. 4.4.



第二轮大多沿用第一轮设定, 关键差别是温度降到 0.7(更高会胡言). 共约 1, 700 step; 通用指令与偏好奖励只在最后 400 step 混入-- 偏好信号训太久会 reward hacking(附录 B. 5). 总成本见附录 B. 4.4.

## 4. Experiment

We evaluate our models on MMLU (Hendrycks et al., 2021), MMLU-Redux (Gema et al., 2025), MMLU-Pro (Wang et al., 2024), C-Eval (Huang et al., 2023), and CMMLU (Li et al., 2024), IFEval (Zhou et al., 2023b), FRAMES (Krishna et al., 2024), GPQA Diamond (Rein et al., 2023), SimpleQA (OpenAI, 2024a), C-SimpleQA (He et al., 2024), SWE-Bench Verified (OpenAI, 2024b), Aider (Gauthier, 2025), LiveCodeBench (Jain et al., 2024) (2024-08 – 2025-01), Codeforces (Mirzayanov, 2025), Chinese National High School Mathematics Olympiad (CNMO 2024) (CMS, 2024), and American Invitational Mathematics Examination 2024 (AIME 2024) (MAA, 2024). The details of these benchmarks are listed in Supplementary D.



评测覆盖 MMLU / MMLU-Redux / MMLU-Pro, C-Eval, CMMLU, IFEval, FRAMES, GPQA Diamond, SimpleQA, C-SimpleQA, SWE-Bench Verified, Aider, LiveCodeBench(2024-08–2025-01), Codeforces, CNMO 2024, AIME 2024 等; 细节见附录 D.

Table 3 summarizes the performance of DeepSeek-R1 across multiple developmental stages, as outlined in Figure 2. A comparison between DeepSeek-R1-Zero and DeepSeek-R1 Dev1 reveals substantial improvements in instruction-following, as evidenced by higher scores on the IF-Eval and ArenaHard benchmarks. However, due to the limited size of the cold-start dataset, Dev1 exhibits a partial degradation in reasoning performance compared to DeepSeek-R1-Zero, most notably on the AIME benchmark. In contrast, DeepSeek-R1 Dev2 demonstrates



Table 3 汇总 Figure 2 各阶段. Zero→Dev1: IF-Eval, ArenaHard 指令跟随大涨; 但冷启动数据少, 推理尤其 AIME 有所掉. 相对地, Dev2

<!-- page 9 of 86 -->

Table 3 | Experimental results at each stage of DeepSeek-R1. Numbers in bold denote the performance is statistically significant (t−test with 𝑝 < 0.01).



表 3｜DeepSeek-R1 各阶段结果. 加粗表示统计显著(t 检验, p<0.01).

| Benchmark (Metric) | R1-Zero | R1-Dev1 | R1-Dev2 | R1-Dev | 3 R1 |
| --- | --- | --- | --- | --- | --- |
| MMLU (EM) | 88.8 | 89.1 | 91.2 | 91.0 | 90.8 |
| MMLU-Redux (EM) | 85.6 | 90.0 | 93.0 | 93.1 | 92.9 |
| MMLU-Pro (EM) | 68.9 | 74.1 | 83.8 | 83.1 | 84.0 |
| DROP (3-shotF1) | 89.1 | 89.8 | 91.1 | 88.7 | 92.2 |
| IF-Eval (PromptStrict) | 46.6 | 71.7 | 72.0 | 78.1 | 83.3 |
| English |  |  |  |  |  |
| GPQA Diamond (Pass@1) | 75.8 | 66.1 | 70.7 | 71.2 | 71.5 |
| SimpleQA (Correct) | 30.3 | 17.8 | 28.2 | 24.9 | 30.1 |
| FRAMES (Acc.) | 82.3 | 78.5 | 81.8 | 81.9 | 82.5 |
| AlpacaEval2.0 (LC-winrate) | 24.7 | 50.1 | 55.8 | 62.1 | 87.6 |
| ArenaHard (GPT-4-1106) | 53.6 | 77.0 | 73.2 | 75.6 | 92.3 |
| LiveCodeBench (Pass@1-COT) | 50.0 | 57.5 | 63.5 | 64.6 | 65.9 |
| Codeforces (Percentile) | 80.4 | 84.5 | 90.5 | 92.1 | 96.3 |
| Codeforces (Rating) | 1444 | 1534 | 1687 | 1746 | 2029 |
| Code SWE Verified (Resolved) | 43.2 | 39.6 | 44.6 | 45.6 | 49.2 |
| Aider-Polyglot (Acc.) | 12.2 | 6.7 | 25.6 | 44.8 | 53.3 |
| AIME 2024 (Pass@1) | 77.9 | 59.0 | 74.0 | 78.1 | 79.8 |
| Math MATH-500 (Pass@1) | 95.9 | 94.2 | 95.9 | 95.4 | 97.3 |
| CNMO 2024 (Pass@1) | 88.1 | 58.0 | 73.9 | 77.3 | 78.8 |
| CLUEWSC (EM) | 93.1 | 92.8 | 92.6 | 91.6 | 92.8 |
| Chinese C-Eval (EM) | 92.8 | 85.7 | 91.9 | 86.4 | 91.8 |
| C-SimpleQA (Correct) | 66.4 | 58.8 | 64.2 | 66.9 | 63.7 |

marked performance enhancements on benchmarks that require advanced reasoning skills, including those focused on code generation, mathematical problem solving, and STEM-related tasks. Benchmarks targeting general-purpose tasks, such as AlpacaEval 2.0, show marginal improvement. These results suggest that reasoning-oriented RL considerably enhances reasoning capabilities while exerting limited influence on user preference-oriented benchmarks.



在代码生成, 数学, STEM 等强推理基准上明显回升; AlpacaEval 2.0 一类通用偏好基准只小幅动. 说明推理向 RL 主要抬推理, 对用户偏好向基准影响有限.

DeepSeek-R1 Dev3 integrates both reasoning and non-reasoning datasets into the SFT pipeline, thereby enhancing the model’s proficiency in both reasoning and general language generation tasks. Compared to Dev2, DeepSeek-R1 Dev3 achieves notable performance improvements on AlpacaEval 2.0 and Aider-Polyglot, attributable to the inclusion of large-scale non-reasoning corpora and code engineering datasets. Finally, comprehensive RL training on DeepSeek-R1 Dev3 using mixed reasoning-focused and general-purpose data produced the final DeepSeek-R1. Marginal improvements occurred in code and mathematics benchmarks, as substantial reasoning-specific RL was done in prior stages. The primary advancements in the final DeepSeek-R1 were in general instruction-following and user-preference benchmarks, with AlpacaEval 2.0 improving by 25% and ArenaHard by 17%.



Dev3 把推理与非推理都塞进 SFT, 两边能力一起抬; 相对 Dev2, AlpacaEval 2.0 与 Aider-Polyglot 明显涨, 靠大规模非推理语料与代码工程数据. 终版 R1 在 Dev3 上再做混合 RL: 代码/数学只剩边际增益(前面推理 RL 已做足), 主涨在通用指令与偏好--AlpacaEval 2.0 +25%, ArenaHard +17%.

In addition, we compare DeepSeek-R1 with other models in Supplementary D. 2. Model safety evaluations are provided in Supplementary D. 3. A comprehensive analysis is provided in Supplementary E, including a comparison with DeepSeek-V3, performance evaluations on both fresh test sets, a breakdown of mathematical capabilities by category, and an investigation of test-time scaling behavior. Supplementary F shows that the strong reasoning capability can be transferred to smaller models.



与其他模型对照见附录 D. 2; 安全见 D. 3; 更细分析(对 V3, 新题, 数学分科, TestingTime Scaling)见 E; 蒸馏到小模型见 F.

<!-- page 10 of 86 -->

## 5. Ethics and Safety Statement 伦理与安全声明

With the advancement in the reasoning capabilities of DeepSeek-R1, we deeply recognize the potential ethical risks. For example, R1 can be subject to jailbreak attacks, leading to the generation of dangerous content such as explosive manufacturing plans, while the enhanced reasoning capabilities enable the model to provide plans with better operational feasibility and executability. Besides, a public model is also vulnerable to further fine-tuning that could compromise inherent safety protections.



推理变强也放大伦理风险: 越狱可能产出更可执行的危险内容(如爆炸物制作); 公开权重还可被再微调, 削弱固有安全.

In Supplementary D. 3, we present a comprehensive safety report from multiple perspectives, including performance on open-source and in-house safety evaluation benchmarks, and safety levels across multiple languages and against jailbreak attacks. These comprehensive safety analyses conclude that the inherent safety level of the DeepSeek-R1 model, compared to other state-of-the-art models, is generally at a moderate level (comparable to GPT-4o (2024-05-13)). Besides, when coupled with the risk control system, the model’s safety level is elevated to a superior standard.



附录 D. 3 从开源/内部安全基准, 多语安全, 越狱鲁棒性等多面报告. 结论: R1 固有安全大致中等, 可比 GPT-4o (2024-05-13); 接上风险控制系统后升到更优档.

## 6. Conclusion, Limitation, and Future Work 结论, 局限与未来工作

We present DeepSeek-R1-Zero and DeepSeek-R1, which rely on large-scale RL to incentivize model reasoning behaviors. Our results demonstrate that pre-trained checkpoints inherently possess substantial potential for complex reasoning tasks. We believe that the key to unlocking this potential lies not in large-scale human annotation but in the provision of hard reasoning questions, a reliable verifier, and sufficient computational resources for reinforcement learning. Sophisticated reasoning behaviors, such as self-verification and reflection, appeared to emerge organically during the reinforcement learning process.



本文给出 R1-Zero 与 R1: 靠大规模 RL 激励推理. 预训练检查点本身就蕴藏复杂推理潜力; 解锁关键往往不是海量人类标注, 而是难题 + 可靠核验器 + 足够 RL 算力. 自我校验, 反思等行为, 看起来是在 RL 过程中自然长出来的.

Even if DeepSeek-R1 achieves frontier results on reasoning benchmarks, it still faces several capability limitations, as outlined below:



即便推理基准已到前沿, 能力边界仍在:

**Structure Output and Tool Use:** Currently, the structural output capabilities of DeepSeek-R1 remain suboptimal compared to existing models. Moreover, DeepSeek-R1 cannot leverage tools, such as search engines and calculators, to improve the performance of output. However, as it is not hard to build an RL environment for structure output and tool use, we believe the issue will be addressed in the next version.



**结构输出与工具**: 结构输出仍偏弱; 也不会用搜索, 计算器等工具抬分. 给结构输出/工具用搭 RL 环境并不难, 下一版有望补.

**Token efficiency:** Unlike conventional test-time computation scaling approaches, such as majority voting or Monte Carlo Tree Search (MCTS), DeepSeek-R1 dynamically allocates computational resources during inference according to the complexity of the problem at hand. Specifically, it uses fewer tokens to solve simple tasks, while generating more tokens for complex tasks. Nevertheless, there remains room for further optimization in terms of token efficiency, as instances of excessive reasoning-manifested as overthinking-are still observed in response to simpler questions.



**Token 效率**: 不像多数投票或 MCTS 那种外挂 TestingTime Scaling, R1 按题难易动态分配算力-- 简单少 token, 复杂多 token. 但仍有过思: 简单题也会想过头.

**Language Mixing:** DeepSeek-R1 is currently optimized for Chinese and English, which may result in language mixing issues when handling queries in other languages. For instance, DeepSeek-R1 might use English for reasoning and responses, even if the query is in a language other than English or Chinese. We aim to address this limitation in future updates. The limitation may be related to the base checkpoint, DeepSeek-V3-Base, mainly utilizes Chinese and English, so that it can achieve better results with the two languages in reasoning.



**语言混杂**: 当前主优化中英, 其他语查询可能仍混语(甚至用英语想, 英语答). 未来更新要修; 根子可能在底座 V3-Base 本就偏中英.

**Prompting Engineering:** When evaluating DeepSeek-R1, we observe that it is sensitive to



**提示工程**: 评测时发现它对提示敏感,

<!-- page 11 of 86 -->

prompts. Few-shot prompting consistently degrades its performance. Therefore, we recommend users directly describe the problem and specify the output format using a zero-shot setting for optimal results.



few-shot 往往会掉分. 建议零样本直接陈述问题并指定输出格式.

**Software Engineering Tasks:** Due to the long evaluation times, which impact the efficiency of the RL process, large-scale RL has not been applied extensively in software engineering tasks. As a result, DeepSeek-R1 has not demonstrated a huge improvement over DeepSeek-V3 on software engineering benchmarks. Future versions will address this by implementing rejection sampling on software engineering data or incorporating asynchronous evaluations during the RL process to improve efficiency.



**软件工程**: 评测太慢拖 RL 效率, 工程任务上未做大规模 RL, 相对 V3 提升有限. 后续可用工程数据拒绝采样, 或在 RL 里做异步评测.

Beyond specific capability limitations, the pure RL methodology itself also presents inherent challenges:



能力边界之外, 纯 RL 方法本身也有坑:

**Reward Hacking:** The success of pure RL depends on reliable reward signals. In this study, we ensure reward reliability through a reasoning-domain rule-based reward model (RM). However, such dependable RMs are difficult to construct for certain tasks, such as writing. If the reward signal is assigned by a model instead of predefined rules, it becomes more susceptible to exploitation as training progresses, which means the policy model may find shortcuts to hack the reward model. Consequently, for complex tasks that cannot be effectively evaluated by a reliable reward model, scaling up pure RL methods remains an open challenge.



**奖励黑客**: 纯 RL 成败系于可靠奖励. 本文在推理域用规则 RM 保可靠; 写作一类任务很难造同等可靠 RM. 奖励若由模型打分, 训久了更容易被钻空子. 无法可靠打分的复杂任务, 纯 RL 怎么扩仍是开放题.

In this work, for tasks that cannot obtain a reliable signal, DeepSeek-R1 uses human annotation to create supervised data, and only conduct RL for hundreds of steps. We hope in the future, a robust reward model can be obtained to address such issues.



对拿不到可靠信号的任务, R1 用人标注做监督数据, RL 只跑几百步. 希望未来有更稳的 RM.

With the advent of pure RL methods like DeepSeek-R1, the future holds immense potential for solving any task that can be effectively evaluated by a verifier, regardless of its complexity for humans. Machines equipped with such advanced RL techniques are poised to surpass human capabilities in these domains, driven by their ability to optimize performance iteratively through trial and error. However, challenges remain for tasks where constructing a reliable reward model is inherently difficult. In such cases, the lack of a robust feedback mechanism may hinder progress, suggesting that future research should focus on developing innovative approaches to define and refine reward structures for these complex, less verifiable problems.



凡是能被核验器有效评估的任务, 纯 RL 都有潜力-- 跟人有多难无关; 机器靠试错迭代, 有望在这些域超过人. 难造可靠 RM 的任务仍卡住, 未来要在奖励结构定义上想新办法.

Furthermore, leveraging tools during the reasoning process holds significant promise. Whether it’s utilizing tools like compilers or search engines to retrieve or compute necessary information, or employing external tools-such as biological or chemical reagents, to validate final results in the real world, this integration of tool-augmented reasoning could dramatically enhance the scope and accuracy of machine-driven solutions.



推理过程接工具也值得做: 编译器, 搜索做检索与计算, 乃至生物/化学试剂做真实世界校验, 都会扩大机器解题的范围与精度.

## 7. Author List 作者列表

The list of authors is organized by contribution role, with individuals listed alphabetically by their first name within each category. Authors marked with an asterisk (\*) are no longer affiliated with our team.



按贡献角色分组, 组内按名字母序; 标星作者已不在团队.

**Core Contributors**: Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Peiyi Wang, Qihao Zhu, Runxin Xu, Ruoyu Zhang, Shirong Ma, Xiao Bi, Xiaokang Zhang, Xingkai Yu, Yu Wu, Z. F. Wu, Zhibin Gou, Zhihong Shao, Zhuoshu Li, Ziyi Gao,



**核心贡献者**: Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Peiyi Wang, Qihao Zhu, Runxin Xu, Ruoyu Zhang, Shirong Ma, Xiao Bi, Xiaokang Zhang, Xingkai Yu, Yu Wu, Z. F. Wu, Zhibin Gou, Zhihong Shao, Zhuoshu Li, Ziyi Gao,

**Contributions of the Core Authors:** Peiyi Wang and Daya Guo jointly demonstrated that outcome-based RL induces the emergence of long Chain-of-Thought patterns in LLMs, achieving



**核心作者贡献简述**: Peiyi Wang 与 Daya Guo 共同证明基于结果的 RL 能诱导长 CoT 涌现,

<!-- page 12 of 86 -->

breakthrough reasoning capabilities. They contributed equally to the creation of R1-Zero, and their work laid the foundation for R1. Daya Guo also contributed to the RL training stability of MOE models. Junxiao Song proposed the GRPO algorithm, implemented the initial version, and introduced rule-based rewards for math tasks. The GRPO algorithm was subsequently refined by Peiyi Wang and Runxin Xu. Zhibin Gou proposed a large PPO clipping strategy to enhance GRPO performance, demonstrating its significance alongside Zhihong Shao and Junxiao Song. Regarding data iteration, reward design, and evaluation, specific teams led efforts across different domains: Qihao Zhu, Z. F. Wu, and Dejian Yang focused on code tasks; Zhihong Shao, Zhibin Gou, and Junxiao Song focused on math tasks; and Peiyi Wang, Ruoyu Zhang, Runxin Xu, and Yu Wu led efforts for other reasoning and general tasks. Additionally, Qihao Zhu and Zhihong Shao contributed to the data selection strategy for RL training, while Zhuoshu Li and Yu Wu co-led the data labeling efforts for the entire project. On the system side, Xiao Bi, Xingkai Yu, Shirong Ma, Xiaokang Zhang, Haowei Zhang, and Ziyi Gao implemented the RL pipeline, optimizing system efficiency and addressing stability issues in large-scale training. Finally, Zhibin Gou, Daya Guo, and Ruoyu Zhang oversaw the final training phase and monitored the model training dynamics. Zhibin Gou led the development of the R1-distill series.



取得推理突破; 两人同等贡献 R1-Zero, 为 R1 奠基. Daya Guo 还参与 MoE 上 RL 稳定性. Junxiao Song 提出 GRPO, 做初版实现, 并引入数学规则奖励; 随后由 Peiyi Wang, Runxin Xu  refinement. Zhibin Gou 提出大 PPO clipping 策略抬 GRPO, 与 Zhihong Shao, Junxiao Song 一起验证其重要性. 数据迭代/奖励/评测按域分工: 代码(Qihao Zhu, Z. F. Wu, Dejian Yang), 数学(Zhihong Shao, Zhibin Gou, Junxiao Song), 其他推理与通用(Peiyi Wang, Ruoyu Zhang, Runxin Xu, Yu Wu). Qihao Zhu 与 Zhihong Shao 参与 RL 数据筛选; Zhuoshu Li 与 Yu Wu 共同主持全项目标注. 系统侧 Xiao Bi, Xingkai Yu, Shirong Ma, Xiaokang Zhang, Haowei Zhang, Ziyi Gao 实现 RL 管线, 优化效率与大规模稳定性. Zhibin Gou, Daya Guo, Ruoyu Zhang 盯最终训练与动力学; Zhibin Gou 主导 R1-distill 系列.

**Contributors**: Aixin Liu, Bing Xue, Bingxuan Wang, Bochao Wu, Bei Feng, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chong Ruan, Damai Dai, Deli Chen, Dongjie Ji, Erhang Li, Fangyun Lin, Fucong Dai, Fuli Luo\*, Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang, Hanwei Xu, Honghui Ding, Huazuo Gao, Hui Qu, Hui Li, Jianzhong Guo, Jiashi Li, Jingchang Chen, Jingyang Yuan, Jinhao Tu, Junjie Qiu, Junlong Li, J. L. Cai, Jiaqi Ni, Jian Liang, Jin Chen, Kai Dong, Kai Hu\*, Kaichao You, Kaige Gao, Kang Guan, Kexin Huang, Kuai Yu, Lean Wang, Lecong Zhang, Liang Zhao, Litong Wang, Liyue Zhang, Lei Xu, Leyi Xia, Mingchuan Zhang, Minghua Zhang, Minghui Tang, Mingxu Zhou, Meng Li, Miaojun Wang, Mingming Li, Ning Tian, Panpan Huang, Peng Zhang, Qiancheng Wang, Qinyu Chen, Qiushi Du, Ruiqi Ge, Ruisong Zhang, Ruizhe Pan, Runji Wang, R. J. Chen, R. L. Jin, Ruyi Chen, Shanghao Lu, Shangyan Zhou, Shanhuang Chen, Shengfeng Ye, Shiyu Wang, Shuiping Yu, Shunfeng Zhou, Shuting Pan, S. S. Li, Shuang Zhou, Shaoqing Wu, Shengfeng Ye, Tao Yun, Tian Pei, Tianyu Sun, T. Wang, Wangding Zeng, Wen Liu, Wenfeng Liang, Wenjun Gao, Wenqin Yu\*, Wentao Zhang, W. L. Xiao, Wei An, Xiaodong Liu, Xiaohan Wang, Xiaokang Chen, Xiaotao Nie, Xin Cheng, Xin Liu, Xin Xie, Xingchao Liu, Xinyu Yang, Xinyuan Li, Xuecheng Su, Xuheng Lin, X. Q. Li, Xiangyue Jin, Xiaojin Shen, Xiaosha Chen, Xiaowen Sun, Xiaoxiang Wang, Xinnan Song, Xinyi Zhou, Xianzu Wang, Xinxia Shan, Y. K. Li, Y. Q. Wang, Y. X. Wei, Yang Zhang, Yanhong Xu, Yao Li, Yao Zhao, Yaofeng Sun, Yaohui Wang, Yi Yu, Yichao Zhang, Yifan Shi, Yiliang Xiong, Ying He, Yishi Piao, Yisong Wang, Yixuan Tan, Yiyang Ma\*, Yiyuan Liu, Yongqiang Guo, Yuan Ou, Yuduan Wang, Yue Gong, Yuheng Zou, Yujia He, Yunfan Xiong, Yuxiang Luo, Yuxiang You, Yuxuan Liu, Yuyang Zhou, Y. X. Zhu, Yanping Huang, Yaohui Li, Yi Zheng, Yuchen Zhu, Yunxian Ma, Ying Tang, Yukun Zha, Yuting Yan, Z. Z. Ren, Zehui Ren, Zhangli Sha, Zhe Fu, Zhean Xu, Zhenda Xie, Zhengyan Zhang, Zhewen Hao, Zhicheng Ma, Zhigang Yan, Zhiyu Wu, Zihui Gu, Zijia Zhu, Zijun Liu\*, Zilin Li, Ziwei Xie, Ziyang Song, Zizheng Pan, Zhen Huang, Zhipeng Xu, Zhongyu Zhang, Zhen Zhang,



**贡献者**: Aixin Liu, Bing Xue, Bingxuan Wang, Bochao Wu, Bei Feng, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chong Ruan, Damai Dai, Deli Chen, Dongjie Ji, Erhang Li, Fangyun Lin, Fucong Dai, Fuli Luo\*, Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang, Hanwei Xu, Honghui Ding, Huazuo Gao, Hui Qu, Hui Li, Jianzhong Guo, Jiashi Li, Jingchang Chen, Jingyang Yuan, Jinhao Tu, Junjie Qiu, Junlong Li, J. L. Cai, Jiaqi Ni, Jian Liang, Jin Chen, Kai Dong, Kai Hu\*, Kaichao You, Kaige Gao, Kang Guan, Kexin Huang, Kuai Yu, Lean Wang, Lecong Zhang, Liang Zhao, Litong Wang, Liyue Zhang, Lei Xu, Leyi Xia, Mingchuan Zhang, Minghua Zhang, Minghui Tang, Mingxu Zhou, Meng Li, Miaojun Wang, Mingming Li, Ning Tian, Panpan Huang, Peng Zhang, Qiancheng Wang, Qinyu Chen, Qiushi Du, Ruiqi Ge, Ruisong Zhang, Ruizhe Pan, Runji Wang, R. J. Chen, R. L. Jin, Ruyi Chen, Shanghao Lu, Shangyan Zhou, Shanhuang Chen, Shengfeng Ye, Shiyu Wang, Shuiping Yu, Shunfeng Zhou, Shuting Pan, S. S. Li, Shuang Zhou, Shaoqing Wu, Shengfeng Ye, Tao Yun, Tian Pei, Tianyu Sun, T. Wang, Wangding Zeng, Wen Liu, Wenfeng Liang, Wenjun Gao, Wenqin Yu\*, Wentao Zhang, W. L. Xiao, Wei An, Xiaodong Liu, Xiaohan Wang, Xiaokang Chen, Xiaotao Nie, Xin Cheng, Xin Liu, Xin Xie, Xingchao Liu, Xinyu Yang, Xinyuan Li, Xuecheng Su, Xuheng Lin, X. Q. Li, Xiangyue Jin, Xiaojin Shen, Xiaosha Chen, Xiaowen Sun, Xiaoxiang Wang, Xinnan Song, Xinyi Zhou, Xianzu Wang, Xinxia Shan, Y. K. Li, Y. Q. Wang, Y. X. Wei, Yang Zhang, Yanhong Xu, Yao Li, Yao Zhao, Yaofeng Sun, Yaohui Wang, Yi Yu, Yichao Zhang, Yifan Shi, Yiliang Xiong, Ying He, Yishi Piao, Yisong Wang, Yixuan Tan, Yiyang Ma\*, Yiyuan Liu, Yongqiang Guo, Yuan Ou, Yuduan Wang, Yue Gong, Yuheng Zou, Yujia He, Yunfan Xiong, Yuxiang Luo, Yuxiang You, Yuxuan Liu, Yuyang Zhou, Y. X. Zhu, Yanping Huang, Yaohui Li, Yi Zheng, Yuchen Zhu, Yunxian Ma, Ying Tang, Yukun Zha, Yuting Yan, Z. Z. Ren, Zehui Ren, Zhangli Sha, Zhe Fu, Zhean Xu, Zhenda Xie, Zhengyan Zhang, Zhewen Hao, Zhicheng Ma, Zhigang Yan, Zhiyu Wu, Zihui Gu, Zijia Zhu, Zijun Liu\*, Zilin Li, Ziwei Xie, Ziyang Song, Zizheng Pan, Zhen Huang, Zhipeng Xu, Zhongyu Zhang, Zhen Zhang,

<!-- page 13 of 86 -->

## Appendix

## A. Background 背景

### A. 1. DeepSeek-V3


DeepSeek V3 (DeepSeek-AI, 2024b) is an advanced open-source LLM developed by DeepSeek. Released in December 2024, DeepSeek V3 represents a significant leap forward in AI innovation, designed to rival leading models like OpenAI’s GPT-4 and Meta’s Llama 3.1, while maintaining remarkable cost efficiency and performance. Built on a Mixture-of-Experts (MoE) architecture, DeepSeek V3 has 671 billion total parameters, with 37 billion activated per token, optimizing both efficiency and capability. It was pre-trained on an expansive dataset of 14.8 trillion highquality, diverse tokens, followed by supervised fine-tuning and reinforcement learning to enhance its abilities across various domains. The model incorporates innovative features like Multi-head Latent Attention (MLA) (DeepSeek-AI, 2024a) for efficient inference, an auxiliaryloss-free load-balancing strategy, and Multi-Token Prediction (MTP) (Gloeckle et al., 2024) to boost performance, particularly in tasks like mathematics and coding.



DeepSeek V3 是 DeepSeek 的开源 LLM(2024 年 12 月发布), 对标 GPT-4, Llama 3.1, 强调性价比. 架构 MoE: 总参 671B, 每 token 激活 37B; 预训练约 14.8T 高质量多样 token, 再接 SFT 与 RL. 创新包括 **Multi-head Latent Attention(MLA)** 做高效推理, 无辅助损失的负载均衡, 以及 **Multi-Token Prediction(MTP)**, 数学与代码受益明显.

解释: MLA= 把 KV 压进低秩潜变量再按需吸收回投影, 推理时 KV cache 更省; 细推导见本库 llm-guide 的 MLA 单独成篇, 此处不展开.

For the training data of DeepSeek-V3-Base, we exclusively use plain web pages and e-books, without incorporating any synthetic data. However, we have observed that some web pages contain a significant number of OpenAI-model-generated answers, which may lead the base model to acquire knowledge from other powerful models indirectly. However, we did not intentionally include synthetic data generated by OpenAI during the pre-training cooldown phase; all data used in this phase were naturally occurring and collected through web crawling. The pre-training dataset contains a substantial amount of mathematical and code-related content, indicating that DeepSeek-V3-Base has been exposed to a significant volume of reasoning trace data. This extensive exposure equips the model with the capability to generate plausible solution candidates, from which reinforcement learning can effectively identify and optimize high-quality outputs. We did the data contamination in pre-training as described in Appendix D. 1. The training data of DeepSeek-V3 base are mostly Chinese and English, which might be the cause for DeepSeek-R1-Zero language mixing when the language consistent reward is absent.



V3-Base 训练数据只用纯网页与电子书, 不故意掺合成数据; 但网页里可能已有大量 OpenAI 模型生成答案, 底座会间接吃到. cooldown 阶段也未故意塞 OpenAI 合成数据, 全是爬来的自然语料. 预训练含大量数学与代码, 等于见过很多推理痕迹, 能生成像样候选解, RL 再从中挑优. 污染处理见附录 D. 1. 底座主语言中英, 可能是 R1-Zero 在没有语言一致性奖励时混语的原因之一.

In this paper, we use the notation DeepSeek-V3-Base as the base model, DeepSeek-V3 as the instructed model. Notably, DeepSeek-R1 and DeepSeek-R1-Zero are trained on top of DeepSeek-V3-Base and DeepSeek-R1 leverages non-reasoning data from DeepSeek-V3 SFT data. DeepSeek-R1-Dev1, DeepSeek-R1-Dev2, DeepSeek-R1-Dev3 are intermediate checkpoints of DeepSeek-R1.



记号: DeepSeek-V3-Base = 底座; DeepSeek-V3 = 指令版. R1 与 R1-Zero 都在 V3-Base 上训; R1 还用了 V3 SFT 里的非推理数据. Dev1/2/3 是 R1 中间检查点.

### A. 2. Conventional Post-Training Paradigm 常规后训练范式

Post-training has emerged as an essential step in refining pre-trained LLMs to meet specific performance goals and align with human expectations. A widely adopted two-stage post-training framework is SFT followed by RL (Ouyang et al., 2022).



后训练把预训练 LLM 调到具体目标并对齐人类预期; 常见两阶段是 SFT 再接 RL.

Supervised Fine-Tuning refines a pre-trained LLM by training it on a curated dataset of inputoutput pairs tailored to specific tasks. The process employs a supervised learning objective, typically minimizing cross-entropy loss between the model’s predictions and labeled ground truth (Brown et al., 2020). For instance, in conversational applications, SFT might utilize dialogue datasets where desired responses are explicitly provided, enabling the model to adapt its outputs to predefined standards (Radford et al., 2019). SFT offers several compelling benefits. First, it achieves precise task alignment by leveraging high-quality examples, allowing the model to



SFT 在精选输入–输出对上训, 目标通常是交叉熵对齐标注. 对话场景里就是给期望回复. 好处: 高质量样例能精确对齐任务,

<!-- page 14 of 86 -->

excel in domains such as customer support or technical documentation (Radford et al., 2019). Second, its reliance on pre-trained weights ensures computational efficiency, requiring fewer resources than training from scratch. Finally, the use of explicit input-output mappings enhances interpretability, as the model’s learning process is directly tied to observable data, minimizing the risk of erratic behavior (Ouyang et al., 2022). Despite its strengths, the performance of SFT hinges on the quality and diversity of the training dataset; narrow or biased data can impair the model’s ability to generalize to novel contexts (Brown et al., 2020). Additionally, SFT’s static nature-optimizing for fixed outputs-may fail to capture evolving human preferences or nuanced objectives. The labor-intensive process of curating high-quality datasets further complicates its scalability, as errors or inconsistencies in the data can propagate into the model’s behavior (Ouyang et al., 2022).



在客服, 技术文档等域表现好; 复用预训练权重比从零训省; 显式映射也好解释. 短板: 质量与多样性不够就泛化差; 静态对齐固定输出, 追不上偏好变化; 高质量标注贵, 错误还会写进行为.

Following SFT, Reinforcement Learning further refines the LLM by optimizing its outputs against a reward signal. In this stage, the model interacts with an environment-often a reward model trained on human feedback-and adjusts its behavior to maximize cumulative rewards. A prominent instantiation of this approach is Reinforcement Learning from Human Feedback (RLHF), where the reward function encodes human preferences (Christiano et al., 2017). RL thus shifts the focus from static supervision to dynamic optimization. Notably, RL reduces the need for extensive annotated resources; while SFT demands a fully labeled dataset for every input-output pair, RL can operate with a smaller set of human evaluations or a trained reward model, even rule-based reward model, significantly lowering the annotation burden.



SFT 之后用 RL 对奖励信号优化: 与环境(常是人类反馈训出的 RM)互动, 最大化累计奖励. RLHF 是代表形态. 相对 SFT「每对都要标」, RL 可用更少评价, 学得的 RM, 甚至规则 RM, 标注负担更轻.

The sequential application of SFT and RL combines their complementary strengths. SFT establishes a robust, task-specific baseline by grounding the model in curated examples, while RL refines this foundation to align with broader, human-centric objectives (Ouyang et al., 2022). For example, SFT might ensure grammatical accuracy in a dialogue system, while RL optimizes for engagement and brevity, as demonstrated in the development of InstructGPT (Ouyang et al., 2022). This hybrid approach has proven effective in producing models that are both precise and adaptable.



SFT+RL 互补: SFT 用精选样例打任务底座, RL 再对齐更广的人类目标. 例如对话系统里 SFT 管语法, RL 管有趣与简洁(InstructGPT). 混合路线能同时要准, 要活.

In this study, we demonstrate that the SFT stage may impede a model’s ability to explore and develop effective reasoning strategies. This limitation arises because human-provided responses, which serve as targets during SFT, are not always optimal for model learning; they often omit critical reasoning components such as explicit reflection and verification steps. To address this, DeepSeek-R1-Zero enables direct exploration of reasoning patterns by the model itself, independent of human priors. The reasoning trajectories discovered through this self-exploration are subsequently distilled and used to train other models, thereby promoting the acquisition of more robust and generalizable reasoning capabilities.



本文指出: SFT 阶段可能阻碍探索有效推理策略-- 人类示范当目标时, 常省略显式反思与校验. R1-Zero 因此让模型自己探索, 不绑人类先验; 探索到的轨迹再蒸馏给其他模型, 促更稳, 更可泛化的推理.

### A. 3. A Comparison of GRPO and PPO GRPO 与 PPO 对照

Group Relative Policy Optimization (GRPO) (Shao et al., 2024) is the reinforcement learning algorithm that we adopt to train DeepSeek-R1-Zero and DeepSeek-R1. It was originally proposed to simplify the training process and reduce the resource consumption of Proximal Policy Optimization (PPO) (Schulman et al., 2017), which is widely used in the RL stage of LLMs (Ouyang et al., 2022). For an overall comparison between GRPO and PPO, see Figure 3.



GRPO 用于训 R1-Zero 与 R1, 初衷是简化 PPO, 压资源. 整体对照见图 3.

For each question 𝑞, GRPO samples a group of outputs $\{ o _ { 1 } , o _ { 2 } , \cdots , o _ { G } \}$ from the old policy



对每个问题 q, GRPO 从旧策略采一组输出

<!-- page 15 of 86 -->

![Image block](images/p15-figure-3-demonstration-of-ppo-and-our-grpo-grpo.png)

Figure 3 | Demonstration of PPO and our GRPO. GRPO foregoes the value model, instead estimating the advantages from group scores.



图 3｜PPO 与 GRPO 示意. GRPO 丢掉价值模型, 用组分数估优势.

$\pi _ { \theta _ { o l d } }$ and then optimizes the policy model $\pi _ { \theta }$ by maximizing the following objective:



$\pi_{\theta_{old}}$, 再最大化下列目标更新 $\pi_\theta$:

$$
\begin{array}{r l} & {\mathcal {J} _ {G R P O} (\theta) = \mathbb {E} [ q \sim P (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {o l d}} (O | q) ]} \\ & {\frac {1}{G} \sum_ {i = 1} ^ {G} \left(\min \left(\frac {\pi_ {\theta} (o _ {i} | q)}{\pi_ {\theta_ {o l d}} (o _ {i} | q)} A _ {i}, \mathrm{clip} \left(\frac {\pi_ {\theta} (o _ {i} | q)}{\pi_ {\theta_ {o l d}} (o _ {i} | q)}, 1 - \varepsilon , 1 + \varepsilon\right) A _ {i}\right) - \beta \mathbb {D} _ {K L} \left(\pi_ {\theta} | | \pi_ {r e f}\right)\right), } \end{array}\tag{11}
$$

$$
\mathbb {D} _ {K L} \left(\pi_ {\theta} | | \pi_ {r e f}\right) = \frac {\pi_ {r e f} (o _ {i} | q)}{\pi_ {\theta} (o _ {i} | q)} - \log \frac {\pi_ {r e f} (o _ {i} | q)}{\pi_ {\theta} (o _ {i} | q)} - 1, \tag{12}
$$

where $\pi _ { r e f }$ is a reference policy, 𝜀 and $\beta$ are hyper-parameters, and $A _ { i }$ is the advantage, computed using a group of rewards $\{ r _ { 1 } , r _ { 2 } , \cdots , r _ { G } \}$ corresponding to the outputs within each group:



$\pi_{ref}$ 为参考策略, ε, β 为超参, $A_i$ 由组内奖励算出:

$$
A _ {i} = \frac {r _ {i} - \text {mean} (\{r _ {1} , r _ {2} , \cdots , r _ {G} \})}{\text {std} (\{r _ {1} , r _ {2} , \cdots , r _ {G} \})}. \tag{13}
$$

In contrast, in PPO, the advantage is typically computed by applying the Generalized Advantage Estimation (GAE) (Schulman et al., 2015), based not only on the rewards but also on a learned value model. Since the value model is usually of similar size as the policy model, it introduces a significant memory and computational overhead. Additionally, the training objective of the value model is to predict the expected cumulative reward from the current position onward, based on the tokens generated from the beginning up to the current position. This is inherently difficult, especially when only the final outcome reward is available. The challenge becomes even more pronounced when training long chain-of-thought reasoning models. As the output length increases, the model is more likely to engage in behaviors such as reflection and revision during generation, meaning that the content initially generated may later be revised or contradicted, which makes it even less feasible to predict the final reward based on a partial response.



对照 PPO: 优势通常用 GAE, 既看奖励也看学得的价值模型; 价值模型往往与策略同量级, 显存与算力开销大. 价值目标是根据「开头到当前位置」的 token 预测后续累计奖励-- 只在末尾给结果奖励时本就难; 长 CoT 更难, 因为后面会反思, 改写, 前半段内容可能被推翻, 用部分回复预测最终奖励更不靠谱.

Another key difference between GRPO and PPO is how Kullback–Leibler (KL) divergence between the trained policy and the reference policy is incorporated into the training process. In GRPO, an unbiased estimator of the KL divergence (Schulman, 2020) is directly added in the loss as in equation 11, while in PPO the per-token KL penalty is added as a dense reward at each token (Ouyang et al., 2022). Since the optimization goal of reinforcement learning is to



另一关键差别是 KL 怎么进训练: GRPO 用无偏估计直接加进损失(式 11); PPO 常把每 token KL 惩罚当稠密奖励(Ouyang et al., 2022). RL 目标是

<!-- page 16 of 86 -->

![Chart block](images/p16-figure-4-performance-of-ppo-and-grpo-on-the-math-task.png)

Figure 4 | Performance of PPO and GRPO on the MATH task.



图 4｜PPO 与 GRPO 在 MATH 上的表现.

maximize cumulative rewards, PPO’s approach penalizes the cumulative KL divergence, which may implicitly penalize the length of the response and thereby prevent the model’s response length from increasing. In addition, as we may train thousands of steps in the scenario of training long chain-of-thought reasoning models, the trained policy can diverge significantly from the initial reference policy. In order to balance the scope that the training policy can explore and the stability of the training, we periodically update the reference policy to the latest policy during the actual training process.



最大化累计奖励, PPO 这种做法等于惩罚累计 KL, 可能间接惩罚长度, 妨碍回复变长. 长 CoT 场景常训上千步, 策略会远离初始参考; 为兼顾探索范围与稳定, 训练中周期性把参考策略换成最新策略.

Figure 4 compares the performance of PPO and GRPO on the MATH task using DeepSeek-Coder-V2-Lite (16B MoE with 2.4B active parameters). Unlike GRPO, PPO requires additional hyperparameter tuning-particularly of the 𝜆 coefficient in GAE-and is highly sensitive to this parameter. When 𝜆 is set to 0.95 (the default value in most open-source PPO implementations), PPO performs considerably worse than GRPO. However, with careful tuning (setting 𝜆 to 1.0), PPO’s performance improves substantially, nearing that of GRPO.



图 4: 在 DeepSeek-Coder-V2-Lite(16B MoE, 激活 2.4B)的 MATH 上比 PPO 与 GRPO. PPO 还要调 GAE 的 λ, 且很敏感: λ=0.95(多数开源默认)时明显弱于 GRPO; 调到 1.0 才接近.

While PPO can achieve comparable performance when appropriately tuned, it demands additional computational cost for hyperparameter optimization. Moreover, considering the memory and computational overhead associated with training an additional value model, GRPO presents a more practical alternative, especially when training large-scale models with constrained resources.



PPO 调好了能打平, 但超参搜索贵; 再加上价值模型的显存与算力, 资源紧时训大模型, GRPO 更实用.

<!-- page 17 of 86 -->

![Image block](images/p17-figure-5-overview-of-our-rl-framework.png)

Figure 5 | Overview of our RL framework.



图 5｜RL 框架总览.

## B. Training Details 训练细节

### B. 1. RL Infrastructure RL 基建

Conducting RL training on large models places high demands on the infrastructure. Our RL framework is architected with a decoupled and extensible structure to facilitate seamless integration of diverse models and algorithms. Within this framework, we have incorporated both intra-modular and inter-modular optimization techniques, to ensure training efficiency and scalability.



大模型 RL 对基建要求高. 框架做成解耦可扩展, 方便接不同模型与算法; 模块内与模块间都做了优化, 保证效率与可扩展.

Specifically, as depicted in Figure 5, the framework is partitioned into four distinct modules, each corresponding to a specific phase of the RL pipeline:



如图 5, 框架拆成四个模块, 对应 RL 管线各阶段:

• **Rollout Module:** Prompts are loaded from training dataset and uniformly dispatched across multiple vLLM (Kwon et al., 2023) workers, each equipped with the actor model, to sample multiple responses. For DeepSeek-V3 MoE architecture, we implement an expert parallelism strategy across nodes to reduce memory access overhead, and deploy redundant copies of hotspot experts to balance computational loads among different experts. Multi-Token Prediction (MTP) component is also leveraged for self-speculative decoding, significantly accelerating the decoding speed and effectively minimizing the completion time for the longest samples.



• **Rollout 模块**: 从训练集加载提示, 均匀分到多台带 actor 的 vLLM worker 上多样本采样. V3 MoE 做跨节点专家并行减访存, 热点专家冗余副本做负载均衡; MTP 做自投机解码, 加速并压最长样本完成时间.

• **Inference Module:** This module loads the reward model and reference to perform a forward pass on the samples generated during the rollout phase, thereby obtaining modelbased rewards and other essential information.



• **Inference 模块**: 加载奖励模型与参考模型, 对 rollout 样本前向, 拿到模型奖励等必要信息.

**Rule-based Reward Module:** This module computes rule-based rewards for the model-generated responses. A unified interface has been designed to accommodate diverse implementations (e. g., code executor, answer matcher, format checker, etc.). Although this module does not require loading models into GPU memory, its execution tends to be time-consuming. To tackle this issue, an asynchronous scheduling approach is employed to overlap its execution with the Rollout and Inference modules, effectively hiding the



**规则奖励模块**: 对模型回复算规则奖励, 统一接口可接代码执行器, 答案匹配, 格式检查等. 虽不占 GPU 模型, 但执行偏慢; 用异步调度与 Rollout/Inference 重叠, 把延迟

<!-- page 18 of 86 -->

associated latency.



藏起来.

• **Training Module:** This module loads the actor model and the critic model (if required), to compute loss and update model parameters. It provides flexible support for a variety of RL algorithms (e. g., PPO, GRPO, DPO, etc.). To minimize computational waste caused by sequence padding and balance the workload across devices, we design the following data packing strategy: first, all data in a global batch is sorted by length and distributed across processes within the data parallel group; subsequently, within each process, the Best-Fit strategy is applied to pack the data into fixed-length chunks with minimal padding; finally, the number of chunks is adjusted to be equal across all processes. Additionally, we have integrated the DualPipe algorithm, utilized in DeepSeek-V3 training, to achieve efficient pipeline parallelism.



• **Training 模块**: 加载 actor(以及需要时的 critic), 算损失, 更新参数; 灵活支持 PPO, GRPO, DPO 等. 为减 padding 浪费, 均衡设备负载: 全局 batch 按长度排序后分到数据并行进程; 进程内 Best-Fit 打成定长块; 再把块数调齐. 并接入 V3 训练用的 DualPipe 做高效流水并行.

Notably, upon completion of each module (excluding the Rule-based Reward module), the model instances utilized in that phase are automatically offloaded from VRAM to either system memory or disk storage, thereby freeing up VRAM for the subsequent phase.



除规则奖励模块外, 每阶段结束后所用模型实例自动从显存卸载到内存或磁盘, 给下一阶段腾 VRAM.

### B. 2. Reward Model Prompt 奖励模型提示

Please act as an impartial judge and evaluate the quality of the responses provided by two AI assistants to the user prompt displayed below. You will be given assistant A’s answer and assistant B’s answer. Your job is to evaluate which assistant’s answer is better. Begin your evaluation by generating your own answer to the prompt. You must provide your answers before judging any answers.



请充当公正裁判, 评价两位 AI 助手对下方用户提示的回复质量. 先自己答一遍, 再判 A/B 谁更好.

When evaluating the assistants’ answers, compare both assistants’ answers with your answer. You must identify and correct any mistakes or inaccurate information.



对照你自己的答案比较双方回复, 指出并纠正错误或不准确信息.

Then consider if the assistant’s answers are helpful, relevant, and concise. Helpful means the answer correctly responds to the prompt or follows the instructions. Note when user prompt has any ambiguity or more than one interpretation, it is more helpful and appropriate to ask for clarifications or more information from the user than providing an answer based on assumptions. Relevant means all parts of the response closely connect or are appropriate to what is being asked. Concise means the response is clear and not verbose or excessive.



再看是否有用, 相关, 简洁. 有用=正确响应提示或遵循指令; 提示有歧义时, 澄清比瞎猜更好. 相关=各部分紧扣所问. 简洁=清楚, 不啰嗦.

Then consider the creativity and novelty of the assistant’s answers when needed. Finally, identify any missing important information in the assistants’ answers that would be beneficial to include when responding to the user prompt.



必要时再看创意与新颖; 最后标出回复里缺的重要信息.

After providing your explanation, you must output only one of the following choices as your final verdict with a label:



解释之后, 最终裁决只能输出下列之一并带标签:

1. Assistant A is significantly better: [[A≫B]]

2. Assistant A is slightly better: [[A>B]]

3. Tie, relatively the same: [[A=B]]

4. Assistant B is slightly better: [[B>A]]

5. Assistant B is significantly better: [[B≫A]]

Example output: My final verdict is tie: [[A ¨ =B]]¨.



示例输出: My final verdict is tie: [[A=B]].

<!-- page 19 of 86 -->

Table 4 | Description of RL Data and Tasks.



表 4｜RL 数据与任务说明.

| Data Type | # Prompts | Question Type | Output Type |
| --- | --- | --- | --- |
| Math | 26K | Quantitative Reasoning | Number/Expression/Equation |
| Code | 17K | Algorithm and Bug Fixing | Code Solution |
| STEM | 22K | Multi-Choice | Option |
| Logic | 15K | Choice/Quantitative Reasoning | Option/Number |
| General | 66K | Helpfulness/Harmlessness | Ranked Responses |

### B. 3. Data Recipe 数据配方

#### B. 3.1. RL Data RL 数据

Reasoning RL data includes four categories: mathematics, coding, STEM, and logic problems. In addition, we also incorporate general RL data to improve the helpfulness and harmlessness of the model in the training of DeepSeek-R1. All questions are in Chinese or English. The description of the RL data can be found in Table 4, where we will describe the details of each data type one by one as follows:



推理 RL 含数学, 代码, STEM, 逻辑四类; 另加通用 RL 抬 R1 的有用性与无害性. 题面中英. 见表 4, 分述如下:

• **Mathematics** dataset consists of 26k quantitative reasoning questions, including math exam questions and competition problems. The average number of prompt tokens is 122. The dataset covers various mathematical domains such as algebra, calculus, probability, and geometry. Problems range in difficulty from regional contests to international Olympiads. For each problem, the model is expected to produce a step-by-step reasoning process culminating in a final answer, which can be a numerical value $( \mathrm { e . g . } , { '' 5 '' } )$ , a mathematical expression $( \mathrm{e. g. },   \mathrm{ " }x^{2} + 3x - 2\mathrm{"} )$ , or an equation $( \mathrm { e . g . , ~ } ^ { \prime \prime } y = 2 x + 1 ^ { \prime \prime } )$ . Mathematical proofs are excluded because it is difficult to determine their correctness. For reinforcement learning purposes, we calculate the reward of a reasoning process by matching the predicted answer with the reference answer. If the answer aligns with the reference, the reward is assigned a value of 1; otherwise, it is assigned a value of 0.



• **数学**: 26k 定量推理题(考试+竞赛), 平均提示约 122 token; 覆盖代数, 微积分, 概率, 几何等, 难度从地区赛到国际奥赛. 期望逐步推理到最终答案(数/式/方程). 证明题排除(难判对错). 奖励: 预测答案与参考匹配则 1, 否则 0.

• **Coding** dataset includes 17k algorithm competition questions, along with 8k bug fixing problems. The algorithm competition questions are similar to problems found on platforms like Codeforces or LeetCode. Each problem typically includes a detailed problem description, constraints, and multiple input-output examples. The task is to write a complete function or program that can solve the problem correctly and efficiently, passing a comprehensive set of hidden test cases that assess both correctness and performance. These problems test algorithmic skills, including dynamic programming, graph theory, string manipulation, and data structure usage.



• **代码**: 17k 算法竞赛题 + 8k 修 bug. 竞赛题类似 Codeforces/LeetCode: 描述, 约束, 多组样例; 要写完整函数/程序过隐藏测例(正确性+性能). 考点含 DP, 图, 字符串, 数据结构.

The bug-fixing problems are extracted from real-world GitHub issues. Each task provides an issue description, a buggy version of the source code, and a set of unit tests that partially or completely fail. The goal is to understand the intent of the issue, locate and fix the defect in the code, and ensure that the corrected version passes all unit tests.



修 bug 题来自真实 GitHub issue: issue 描述, 有缺陷源码, 部分/全部失败的单测. 目标是理解意图, 定位修复, 让全部单测通过.

STEM dataset comprises 22k choice questions that cover topics such as physics, chemistry, and biology. Each question in the STEM task presents a subject-specific problem accompanied by four to eight answer options. The model is required to select the most scientifically accurate answer based on the given context and domain knowledge. The average number of prompt tokens is 161. Specifically, the dataset includes 15.5% physics, 30.7% biology, 46.5% chemistry, and 7.3% other topics such as health and medicine. Since all STEM questions are multiple-choice, a binary reward is assigned based on whether the



STEM: 22k 选择题, 物/化/生等; 每题 4–8 选项, 平均提示约 161 token. 构成约 15.5% 物理, 30.7% 生物, 46.5% 化学, 7.3% 其他(如健康医学). 全是选择题, 奖励按是否选对

<!-- page 20 of 86 -->

correct option is matched.



选项做二值判定.

• **Logic** dataset contains 15k questions designed to evaluate a model’s reasoning capabilities across a broad spectrum of logical challenges. The dataset includes both real-world and synthetically generated problems. All problems support automatic evaluation, and the average prompt length is approximately 420 tokens. The real-world portion of the dataset comprises a diverse selection of problems sourced from the web, including brain teasers, classical logic puzzles, and knowledge-intensive questions. These questions are presented in a multiple-choice format to ensure objective and consistent assessment. The synthetic portion consists primarily of two categories: code-IO problems and puzzle tasks. Code-IO problems are generated using the data pipeline introduced by Li et al. (2025), which converts competitive coding problems and their corresponding input-output test cases into verifiable logical reasoning problems. The puzzle tasks include problems intended to assess specific reasoning competencies. For example, cryptography puzzles are designed to evaluate a model’s ability to identify and apply patterns in cipher schemes or perform string manipulations; logic puzzles focus on deductive reasoning over complex constraints, such as inferring valid conclusions from a fixed set of premises (e. g., the Zebra puzzle); and arithmetic puzzles test the model’s numerical reasoning (e. g. probability questions and 24 game).



• **逻辑**: 15k 题, 真实+合成, 均可自动评, 平均提示约 420 token. 真实部分来自网页: 脑筋急转弯, 经典逻辑谜, 知识密集题, 多选以便客观评分. 合成主要两类: code-IO(Li et al., 2025 管线, 把竞赛题与 IO 测例转成可核验逻辑题)与谜题(密码/模式, 斑马谜一类约束演绎, 概率与 24 点等算术).

• **General** dataset consists of 66k questions designed to assess helpfulness, spanning various categories such as creative writing, editing, factual question answering, and role-playing. Additionally, the dataset includes 12, 000 questions focused on evaluating harmlessness. To ensure robust verification, two reward models are utilized, each trained on a curated dataset of ranked responses generated by models in relation to helpfulness and harmlessness, respectively. We trained the helpful reward model for a single epoch with a maximum sequence length of 8192 tokens during the training phase. However, when deploying the model to generate reward signals, we did not impose any explicit length constraints on the input sequences being evaluated.



• **通用**: 66k 题评有用性(创意写作, 编辑, 事实问答, 角色扮演等), 另含 12, 000 题评无害. 用两个 RM 分别基于有用性/无害性排序回复训. 有用性 RM 训 1 epoch, 最大序列 8192; 部署打分时输入不显式限长.

#### B. 3.2. DeepSeek-R1 Cold Start DeepSeek-R1 冷启动

For DeepSeek-R1, we construct and collect a small amount of long CoT data to fine-tune the model as the initial RL actor. The motivation is primarily product-driven, with a strong emphasis on enhancing user experience. Users tend to find responses more intuitive and engaging when the reasoning process aligns with first-person perspective thought patterns. For example, DeepSeek-R1-Zero is more likely to employ the pronoun ’we’ or avoid first-person pronouns altogether during problem solving, whereas DeepSeek-R1 tends to use ’I’ more frequently. Furthermore, we acknowledge that such patterns may elicit unwarranted trust from users. Here, we would like to emphasize that the observed vivid reasoning patterns primarily reflect DeepSeek-engineered heuristics, rather than indicating that the model has inherently acquired human-like intelligence or autonomous problem-solving capabilities.



为 R1 构造并收集少量长 CoT, 微调成 RL 初始 actor. 动机主要是产品: 第一人称思考更直觉, 更好读. 例如 Zero 更爱用「we」或干脆不用第一人称, R1 更常说「I」. 也承认这类模式可能诱发用户过度信任-- 生动推理痕迹主要是工程启发式, 不等于模型真有人类智能或自主解题能力.

In cold start data creation, we prefer the thinking process that begins with comprehending the problem, followed by detailed reasoning that incorporates reflection and verification. The language employed throughout the thinking process is presented in the first-person perspective. Additionally, maintaining language consistency is crucial for an optimal user experience. Without proper control, model responses may contain a mixture of different languages, regardless of the language used in the query. Such inconsistencies can disrupt comprehension and reduce user satisfaction. Therefore, careful refinement is essential to ensure that responses remain coherent and aligned with user intent. Nevertheless, we acknowledge that the raw Chain-of-Thought (CoT) reasoning produced by DeepSeek-R1-Zero may possess potential that extends beyond the



冷启动偏好: 先理解题面, 再带反思与校验的细推理; 全程第一人称; 语言一致很关键-- 失控时即使用户用单语提问, 回复也可能混语. 同时承认: Zero 的原始 CoT 潜力可能超出

<!-- page 21 of 86 -->

limitations of current human priors. Specifically, we first engage human annotators to convert the reasoning trace into a more natural, human conversational style. The modified data pairs are then used as examples to prompt an LLM to rewrite additional data in a similar style. All LLM-generated outputs subsequently undergo a second round of human verification to ensure quality and consistency.



当前人类先验. 具体做法: 人先把推理轨迹改成更自然的对话风; 再用改好的对当样例, 提示 LLM 批量改写; LLM 产出再经第二轮人审.

Listing 1 | Prompt for producing a human-readable solution.



列表 1｜生成可读题解的提示.

```markdown
## Question
{question}

## Thought process
{thought_process}

---
Based on the above thought process, provide a clear, easy-to-follow, and well-formatted solution to the question. Use the same language as the question.

The solution must strictly follow these requirements:
- Stay faithful and consistent with the given thought process. Do not add new reasoning steps or conclusions not shown in the original.
- Show key steps leading to final answer(s) in clear, well-formatted LaTeX.
- Use \boxed{} for final answer(s).
- Be clean and concise. Avoid colloquial language. Do not use phrases like "thought process" in the solution.

Your response should start with the solution right away, and do not include anything else. Your task is solely to write the solution based on the provided thought process. Do not try to solve the question yourself.
```



中文说明: 按给定思考过程写清晰题解, 语言与题目一致; 不得新增原思考没有的步骤; 关键步骤用 LaTeX; 最终答案 `\boxed{}`; 不要口语, 不要提「thought process」; 直接从题解起笔, 勿自行重解.

Specifically, we begin by gathering thousands of high-quality, diverse reasoning prompts. For each prompt, we generate multiple reasoning trajectories using DeepSeek-R1-Zero with a relatively high temperature of 1.0. Next, we filter these generations to retain only those with correct final answers and a readable format. For mathematical outputs, we use sympy ([https://www. sympy. org/](https://www. sympy. org/)) for parsing and expression comparison; and for formatting, we apply rules such as repetition detection and language-mixing filtering. Finally, we prompt DeepSeek-V3 to refine both the reasoning and the summaries to ensure proper formatting and a human-friendly expression. In particular, to resolve language mixing, we instruct DeepSeek-V3 to “Translate the thinking process to the same language as the question. ” Since DeepSeek-R1- Zero’s summary only provided the final answer, we use the summary prompt in Listing 1 to produce a concise, human-readable solution that outlines both the reasoning steps and the final result.



流程: 先收集数千高质量多样推理提示; 每题用 R1-Zero, 温度 1.0 多样本; 只留最终答案正确且格式可读的; 数学用 sympy 解析比较; 格式上再做重复检测与混语过滤; 再用 V3  refinement 推理与摘要. 治混语时指示 V3「把思考过程译成与题目同语」. Zero 摘要往往只有终答, 故用列表 1 的提示生成可读题解.

For code data, we collect a large set of competitive programming problems. In detail, We have compiled an extensive collection of competitive programming problems from multiple online judge (OJ) platforms, specifically 5151 problems from Codeforces and 2504 problems from AtCoder. Since the original test cases are not publicly available from these platforms, we developed a methodology to create reliable test cases for each problem.



代码侧收集大量竞赛题: Codeforces 5151, AtCoder 2504. 原测例不公开, 故自建可靠测例方法.

Our approach involves using DeepSeek-V2.5 to generate candidate test cases, followed by a rigorous validation process. Specifically, we prompted DeepSeek-V2.5 to write Python programs that generate test cases tailored to each problem’s requirements as shown in Listing 2.



用 DeepSeek-V2.5 生成候选测例并严格校验: 提示它写生成测例的 Python 程序(列表 2).

After obtaining numerous candidate test cases, we implemented a two-phase filtering procedure. First, we used correct submissions to eliminate invalid test cases that produced incorrect outputs. Then, we strategically selected subsets of test cases that successfully identified



候选测例两阶段过滤: 先用正确提交剔除输出错误的无效测例; 再挑能揪出

<!-- page 22 of 86 -->

flaws in incorrect submissions. This process ensured our final test cases properly differentiated between correct and incorrect solutions for each problem.



错误提交的测例子集, 保证最终测例能区分对错解.

Listing 2 | Prompt for generating test cases for code problem.



列表 2｜为代码题生成测例的提示. (下列英文提示与代码块保留原文, 供复现.)

```python
<USER>
Question:
You are given a string word and an integer k.

A substring s of word is complete if:

Each character in s occurs exactly k times.
The difference between two adjacent characters is at most 2. That is, for any two
adjacent characters c1 and c2 in s, the absolute difference in their positions in
the alphabet is at most 2.
Return the number of complete substrings of word.

A substring is a non-empty contiguous sequence of characters in a string.

**Input**
The first line contains a single integer t the number of test cases.
The first line of each test case contain one string word.
The second line of each test case contain one integer k.
It is guaranteed that word consists only of lowercase English letters, and the sum of |word| over all test cases does not exceed 10^5.

**Output**
For each test case, print one integer the number of complete substrings of word.

**Example**
Input
'''
2
igigee
2
aaabbbccc
3
'''
Output
'''
3
6
'''
Construct some random input generators to generate diverse and adversarial inputs,
which are large enough to to make incorrect codes exceed the time limit.
</USER>

<ASSISTANT>
First construct a random input generator for large data with 10 testcases of the same
length.

''python
import random
import string

def generate_random_string(l_min, l_max):
    length = random. randint(l_min, l_max)
    seq = ''. join(random. choices(string. asciilowercase, k=length))
    k = random. randint(1, length)
```

<!-- page 23 of 86 -->

```python
return f"{seq}\\n{k-II}"
t = 10 # the number of test cases
testcase = [generate_random_string(10000, 10000) for _ in range(t)]

print(t)
print("\n". join(testcase))
'"

First construct a random input generator for large data with 10 testcases of different
length.

''python
import random
import string

def generate_random_string(l_min, l_max):
    length = random. randint(l_min, l_max)
    seq = ''. join(random. choices(string. asciilowercase, k=length))
    k = random. randint(1, length)
    return f"{seq}\\n{k-II}", len(seq)

t = 10 # the number of test cases
testcase = []
cum_length = 0
for i in range(t):
    # each test case should have length >= 1
    cur_testcase, cur_length = generate_random_string(1, 100000 - cum_length - (t - i))
    testcase. append(cur_testcase)
    cum_length += cur_length

print(t)
print("\n". join(testcase))
'"

Construct a random input generator for large data with only one test case.

''python
import random
import string

def generate_random_string(l_min, l_max):
    ...

t = 1 # the number of test cases
testcase = [generate_random_string(90000, 100000) for _ in range(t)]

print(t)
print("\n". join(testcase))
'"

Construct an input generator for large adversarial inputs of a string of a repeated
single character.

''python
import random
import string

def generate_single_repeated_char(l_min, l_max):
    length = random. randint(l_min, l_max)
```



(列表 2 测例生成器代码续页, 英文原样保留.)

<!-- page 24 of 86 -->

```python
char = random. choice(string. asciilowercase)
seq = char * length
k = random. randint(1, length)
return f"{{seq}}\n{{k}}""
t = 1 # the number of test cases
testcase = [generate_single_repeated_char(90000, 100000) for _ in range(t)]

print(t)
print("\n". join(testcase))
'"

Construct an input generator for large adversarial inputs of a string of two
alternating characters.
'``python
import random
import string

def generate_alternating_chars(l_min, l_max):
    length = random. randint(l_min, l_max)
    char1, char2 = random. sample(string. asciilowercase, 2)
    seq = ''. join(char1 if i % 2 == 0 else char2 for i in range(length))
    k = random. randint(1, length)
    return f"{{seq}}\n{{k}}""
t = 1 # the number of test cases
testcase = [generate_alternating_chars(90000, 100000) for _ in range(t)]

print(t)
print("\n". join(testcase))
'"

Construct an input generator for large adversarial inputs of a string of sequential
characters from alphabet.

'``python
...
'例如

</ASSISTANT>

Question:
Question Description

Construct some random input generators to generate large, diverse and adversarial
inputs, which are large enough to testing time complexity and to make incorrect
codes exceed the time limit.

Use the format used in the above example by returning several input generators in
different code blocks. Each of these generators prints EXACTLY ONE input directly
into stdout.
```



(列表 2 结束. 中文要点: 构造多种随机/对抗输入生成器, 输出足够大以测复杂度, 拖垮错误代码; 每个生成器代码块向 stdout 精确打印一份输入.)

In addition, we employ few-shot prompting for DeepSeek-V3 to generate responses to simple math problems, such as $\dot{1} + 1 = ? $ , ensuring that the outputs remain concise and appropriately structured. We provide the prompt for a simple math problem in Listing 3.



此外, 对简单数学题(如 1+1=?)用 few-shot 提示 V3, 保证输出简洁, 结构合适. 简单数学 CoT 提示见列表 3.

Listing 3 | Prompt for generating chain-of-thought for simple math problem.



列表 3｜简单数学题生成 CoT 的提示.

```markdown
## Question
How much is 5+4?
```

<!-- page 25 of 86 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family: monospace;">
## Response
&lt; think&gt;

I need to add the numbers 5 and 4. Starting with 5, if I add 4 to it, the total will be
    9. Therefore, the sum of 5 and 4 is 9.

&lt; /think&gt;

**Solution:**

We are asked to calculate the sum of 5 and 4.

**Step 1:** Start with the number 5.

**Step 2:** Add 4 to it.


$$
5 + 4 = 9

$$


**Final Answer:** $boxed{9}$

---

\## Question
what is 1 plus 2

\## Response
&lt; think&gt;

I need to determine the sum of 1 and 2.

Adding these two numbers together, 1 plus 2 equals 3.

Therefore, the answer is 3.

&lt; /think&gt;

Sure! Let's solve the problem step by step.

**Problem:** What is $1 + 2$?
**Solution:**

To find the sum of 1 and 2, simply add the two numbers together:


$$
1 + 2 = 3

$$


**Answer:**

$boxed{3}$

---

\## Question
{question}

\## Response
</div>



(列表 3 示例回复: 先短思考, 再结构化题解; 英文样例原样保留.)

<!-- page 26 of 86 -->

Listing 4 | An example prompt of using DeepSeek-V3 as a judge.



列表 4｜用 DeepSeek-V3 当裁判的示例提示.

```markdown
As an advanced reasoning problem evaluation assistant, your primary responsibility is to assess the accuracy of provided answers. You will be presented with a reasoning-related question, its corresponding reference answer, and an answer requiring evaluation.

## Answer Quality Classification
You have to carefully analyze and classify the answer into one of the following two levels:
1. **correct**: The answer fully aligns with the reference answer in both reasoning process and final conclusion, and address the question without any errors or omissions.
2. **incorrect**: The answer contains major errors in key reasoning steps or the final conclusion, or completely deviates from the core of the question. This indicates a fundamental misunderstanding or error in comprehending the question.

## Question
{question}

## Reference Answer
{reference}

## Answer to be Evaluated
{answer}

## Output Format
You need to combine the question and reference answer, first provide a detailed explanation of your analysis of the answer to be evaluated, then conclude with the final answer quality classification.
Output the following content in **JSON** format, including two key:
1. 'analysis': analysis of the answer's correctness;
2. 'correctness': correct/incorrect
```



中文说明: 推理题评测助手; 对照参考答案把待评回答标为 correct / incorrect; 先详细分析, 再输出 JSON: `analysis` 与 `correctness`.

#### B. 3.3. 800K Supervised Data 约 80 万监督数据

**Reasoning Data** We curate a large set of reasoning prompts and generate reasoning trajectories by performing rejection sampling from the checkpoint of the first-stage RL training. In the previous stage, we only included data that could be evaluated using rule-based rewards. However, in this stage, we expand the dataset by incorporating additional data, some of which uses a generative reward model by feeding the ground-truth and model predictions into DeepSeek-V3 for judgment, an example prompt is provided in Listing 4. Additionally, because the model output is sometimes chaotic and difficult to read, we have filtered out chain-of-thought with mixed languages, long paragraphs, and code blocks. For each prompt, we sample multiple responses and retain only the correct ones. In total, we collect about 600k reasoning-related training samples.



**推理数据**: 从第一轮 RL 检查点做拒绝采样, 生成推理轨迹. 上一阶段只收规则奖励可评的数据; 本阶段扩集, 部分用生成式奖励-- 把标准答案与模型预测喂给 V3 判定(列表 4). 过滤混语, 超长段, 代码块等难读 CoT; 每题多样本只留正确. 约 600k 推理训练样本.

**Non-Reasoning Data** For non-reasoning data, such as writing, factual QA, self-cognition, and translation, we adopt the DeepSeek-V3 pipeline and reuse portions of the SFT dataset of DeepSeek-V3. We also incorporate software engineering-focused data, including program repair and front-end web development, to enhance the model’s ability to solve real-world problems. For certain non-reasoning tasks, we call DeepSeek-V3 to generate a potential chain-of-thought before answering the question by prompting. However, for simpler queries, such as “hello” we do not provide a CoT in response. In the end, we collected a total of approximately 200k training samples that are unrelated to reasoning.



**非推理数据**: 写作, 事实问答, 自我认知, 翻译等沿用 V3 管线并复用部分 V3 SFT; 再加软件工程(修程序, 前端)抬真实题能力. 部分非推理题让 V3 先生成潜在 CoT 再答;「hello」一类简单问候不给 CoT. 约 200k 非推理样本.

<!-- page 27 of 86 -->

When designing our thinking process style, we ask the model to follow key principles: First, keep each paragraph concise and digestible. Short paragraphs make ideas clearer and easier to follow. Second, adopt a conversational tone that feels natural and engaging. We avoid technical formatting like markdown to maintain a smooth reading experience. Third, and most importantly, the thinking process begins by understanding the complete user context. This means analyzing who our users are, what situations they’re dealing with, and what they truly need - including those unstated needs that may lie beneath the surface of their initial request.



思考过程文风原则: 段要短, 好消化; 语气像对话, 少 markdown 技术排版; 最重要的是先吃透用户完整语境-- 是谁, 什么处境, 真正需要什么(含未言明需求).

After eliciting these thinking processes from the model, human annotators meticulously verify the accuracy of the outputs. Our findings indicate that these artificial reasoning traces enhance the model’s precision in interpreting user queries. Specifically, they effectively highlight format constraints, clarify user intentions, and elucidate the requisite structure of outputs. This methodological approach facilitates more accurate and responsive interactions between the model and users.



人再仔细核验. 观察: 这类人造推理痕迹能抬对用户意图的把握-- 标清格式约束, 澄清意图, 讲清输出结构, 交互更准, 更贴.

Table 5 | Data Statistics of SFT Data.



表 5｜SFT 数据统计.

| Domain | Num Samples | Avg Rounds | Avg Tokens |
| --- | --- | --- | --- |
| Math | 395285 | 1.0 | 6094.2 |
| Code | 211129 | 1.1 | 7435.7 |
| STEM | 10124 | 1.0 | 4928.8 |
| Logic | 10395 | 1.0 | 2739.0 |
| General | 177812 | 1.1 | 1419.8 |
| Total | 804745 | 1.0 | 5355.3 |

**SFT Data Statistics** Table 5 summarizes the data statistics across various domains, based on approximately 800, 000 supervised samples. It is worth noting that the majority of the data consists of single-turn interactions, which may limit the multi-turn conversational capabilities of DeepSeek-R1. We leave the expansion to multi-turn dialogue data as future work. The math-related data are primarily in Chinese and English, spanning a wide range of topics and difficulty levels. These questions are verifiable, either through deterministic rules or by reference to specific ground-truth answers. The code dataset encompasses not only competitive programming problems but also debugging tasks and project-oriented coding queries. STEM and logic-related questions, although smaller in volume compared to mathematics and code, are sourced from publicly available textbooks and online repositories. The general-domain queries are diverse, predominantly in Chinese and English, and include tasks such as creative writing, open-ended question answering, role-playing scenarios, and more.



**SFT 统计**: 约 80 万监督样本. 多数单轮, 可能限制多轮对话, 多轮留待未来. 数学以中英为主, 题材与难度广, 可用规则或标准答案核验. 代码含竞赛, 调试与项目向查询. STEM/逻辑量更小, 来自公开教材与网库. 通用域多样, 偏中英: 创意写作, 开放问答, 角色扮演等.

**Examples of SFT Trajectories** We provide examples of SFT trajectories related to math, code, and non-reasoning in Listings 5, 6, and 7.



**SFT 轨迹示例**: 数学, 代码, 非推理见列表 5, 6, 7(英文样例原样保留, 下同).

Listing 5 | An example SFT trajectory from reasoning data related to mathematics.



列表 5｜数学推理 SFT 轨迹示例.

```markdown
## Question
For positive integer $n$, define $S_n$ to be the minimum value of the sum 
$$
 \sum_{k=1}^n \sqrt{(2k-1)^2+a_k^2}, 
$$
 where $a_1, a_2, \ldots, a_n$ are positive real numbers whose sum is 17. There is a unique positive integer $n$ for which $S_n$ is also an integer. Find this $n$.
```

\## Response

<!-- page 28 of 86 -->



(列表 5 数学 SFT 轨迹续: 英文长思考原样保留, 下同各页算法框.)

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family: monospace;">
&lt; think&gt;
Alright, so I'm trying to solve this problem where I need to find a positive integer $n$ such that $S_n$, the minimum value of the sum $\sum_{k=1}^n \sqrt{(2k -1)^2 + a_k^2}$, is an integer. Here, $a_1, a_2, \ldots, a_n$ are positive real numbers that add up to 17.

Hmm, okay, let me break this down. I know that when you have a sum of square roots like this, it often relates to geometry, maybe minimizing distances. It reminds me of the problem where you have to break up a path into segments with certain slopes to minimize total distance. Maybe this is similar to finding the shortest path in a staircase.

Let me visualize it. Each term $sqrt{(2k - 1)^2 + a_k^2}$ looks like the hypotenuse of a right-angled triangle with legs $(2k - 1)$ and $a_k$. So, if I imagine a grid where I move horizontally by $a_k$ and vertically by $(2k - 1)$ for each step $k$, then $S_n$ would be the total length of this path.

Now, the sum of all $a_k$ is 17, which would be the total horizontal distance. I need to figure out the vertical distances, which are fixed based on $k$. So the total vertical distance would be $\sum_{k=1}^n (2k - 1)$. Let me compute that:
The sum $\sum_{k=1}^n (2k - 1)$ is equal to $2 \sum_{k=1}^n k - \sum_{k=1}^n 1 = 2 \cdot \frac{n(n + 1)}{2} - n = n(n + 1) - n = n^2$. So the total vertical distance is $n^2$.

Wait a second, so this entire setup is like moving from the origin to the point $(17, n^2)$ with $n$ segments. Each segment has a horizontal component $a_k$ and a vertical component $(2k - 1)$. But in reality, this entire path from $(0, 0)$ to $(17, n^2)$ can be considered as a single straight line if we could somehow combine all these segments.

But we can't change the number of segments $n$; each segment's vertical component is fixed. However, the horizontal components $a_k$ can be adjusted as long as their sum is 17. So, to find the minimal total distance, maybe we can think of it as if each segment is contributing to the total path optimally. If we scale each horizontal component $a_k$ proportionally, maybe this also corresponds to scaling the vertical components.

Alternatively, I can think of calculus optimization techniques. If I need to minimize the sum $\sum_{k=1}^n \sqrt{(2k - 1)^2 + a_k^2}$ subject to $\sum_{k=1}^n a_k = 17$, I can use the method of Lagrange multipliers.

Let me set up the Lagrangian. Let $L = \sum_{k=1}^n \sqrt{(2k - 1)^2 + a_k^2} + \lambda \left(17 - \sum_{k=1}^n a_k\right)$.

Taking the derivative of $L$ with respect to each $a_k$:
$\frac{\partial L}{partial a_k} = \frac{a_k}{sqrt{(2k - 1)^2 + a_k^2}} - \lambda = 0$.

So, for each $k$, we have $\frac{a_k}{sqrt{(2k - 1)^2 + a_k^2}} = \lambda$. Let me solve for $a_k$:

Squaring both sides gives $\frac{a_k^2}{(2k - 1)^2 + a_k^2} = \lambda^2$.

Rearranging terms: $a_k^2 = \lambda^2 \left( (2k - 1)^2 + a_k^2 \right)$.

Divide both sides by $a_k^2$ (assuming $a_k \neq 0$): $1 = \lambda^2 \left( \frac{(2k - 1)^2}{a_k^2} + 1 \right)$.
</div>

<!-- page 29 of 86 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family: monospace;">
Simplify: $1 - \lambda^2 = \lambda^2 \cdot \frac{(2k - 1)^2}{a_k^2}$.

Then, $frac{(2k - 1)^2}{a_k^2} = \frac{1 - \lambda^2}{\lambda^2}$.

Therefore, $frac{2k - 1}{a_k} = \sqrt{\frac{1 - \lambda^2}{\lambda^2}} = \frac{\sqrt{1 - \lambda^2}}{\lambda}$.

Let me denote $c = \frac{\sqrt{1 - \lambda^2}}{\lambda}$. Then, $a_k = \frac{2k - 1}{c}$.

So, each $a_k$ is proportional to $(2k - 1)$. That is, $a_k = \frac{2k - 1}{c}$.

Since the sum of all $a_k$ is 17, we can write:
$sum_{k=1}^n a_k = \sum_{k=1}^n \frac{2k - 1}{c} = \frac{1}{c} \sum_{k=1}^n (2k - 1)$.

Earlier, I found that $sum_{k=1}^n (2k - 1) = n^2$. Therefore,
$frac{n^2}{c} = 17$ =&gt; $c = \frac{n^2}{17}$.

Thus, $a_k = \frac{2k - 1}{c} = \frac{(2k - 1) \cdot 17}{n^2}$.

Now, going back to the original expression for $S_n$:
$S_n = \sum_{k=1}^n \sqrt{(2k - 1)^2 + a_k^2}$.

Substituting $a_k = \frac{17(2k - 1)}{n^2}$, we get:
$sqrt{(2k - 1)^2 + \left(\frac{17(2k - 1)}{n^2} \cdot \right)^2} = (2k - 1) \sqrt{1 + \left(\frac{17}{n^2} \cdot \right)^2}$.

So, factor that square root out of the sum:
$S_n = \sqrt{1 + \left(\frac{17}{n^2} \cdot \right)^2} \cdot \sum_{k=1}^n (2k - 1)$.
We already know that $sum_{k=1}^n (2k - 1) = n^2$, so this simplifies to:
$S_n = \sqrt{1 + \left(\frac{17}{n^2} \cdot \right)^2} \cdot \sum_{k=1}^n (2k - 1) \cdot \sqrt{n^4 + 17^2} = \sqrt{n^4 + 289}$.

Wait, that seems too simplified. Let me check my steps:
I set up the Lagrangian correctly.
Took the derivative and found $a_k = \frac{2k - 1}{c}$.
Summed them up to get $c = \frac{n^2}{17}$.
Plugged back into $S_n$ and factored out $(2k - 1)$, so each term becomes $(2k - 1)\sqrt{1 + \left(\frac{17}{n^2} \cdot \right)^2}$.
Since $sum(2k - 1) = n^2$, so total sum is $n^2 \times \sqrt{1 + \left(\frac{17}{n^2} \cdot \right)^2} = \sqrt{n^4 + 17^2}$.

Yeah, that seems to check out. So, $S_n = \sqrt{n^4 + 289}$. Wait, $17^2$ is 289.
Therefore, $S_n = \sqrt{n^4 + 289}$. We need this to be an integer.
So, I need to find an integer $n$ such that $n^4 + 289$ is a perfect square.
Let me denote $S_n = m$, where $m$ is an integer, so:
$n^4 + 289 = m^2$.
</div>



中文说明: 列表 5 续-- 由比例关系得 $a_k=17(2k-1)/n^2$, 化简得 $S_n=\sqrt{n^4+289}$, 再求使之为整数的 $n$.

<!-- page 30 of 86 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family: monospace;">
This implies $m^2 - n^4 = 289$.
Hmm, 289 is 17^2. So, $m^2 - n^4 = 17^2$. That can be written as:
$m^2 - n^4 = (17)^2$.
Looking at this equation, it's a difference of squares.
Wait, $m^2 - n^4 = (m - n^2)(m + n^2) = 17^2 = 289$.
So, we have $(m - n^2)(m + n^2) = 289$.
Since $m$ and $n$ are positive integers, both $m - n^2$ and $m + n^2$
    are positive integers and factors of 289. Also, $m + n^2 &gt; m - n^2$.
So, since 289 is 17^2, its positive factor pairs are (1, 289) and (17, 17).
Hence, the factor pairs are:
$m - n^2 = 1$ and $m + n^2 = 289$.
$m - n^2 = 17$ and $m + n^2 = 17$.
But the second case gives $m - n^2 = 17$ and $m + n^2 = 17$.
Subtracting the equations: $(m + n^2) - (m - n^2) = 17 - 17$ =&gt; $2n^2 = 0$ =&gt;
    $n^2 = 0$. But $n$ is a positive integer, so this case is invalid.
So, we only consider the first factor pair: $m - n^2 = 1$ and $m + n^2 = 289$.
Adding the two equations: $(m - n^2) + (m + n^2) = 1 + 289$ =&gt; $2m = 290$ =&gt; $m = 145$.
Subtracting the two equations: $(m + n^2) - (m - n^2) = 289 - 1$ =&gt; $2n^2 = 288$ =&gt;
    $n^2 = 144$ =&gt; $n = 12$ since $n$ is positive.
Therefore, $n = 12$.
Before I conclude, let me verify that $S_n = \sqrt{12^4 + 17^2} = \sqrt{20736 + 289} = \sqrt{21025} = 145$, which is indeed an integer.
Is this the only $n$? The question says there's a unique positive integer $n$, so this must be the one.
**Final Answer**
The unique positive integer $n$ is \boxed{12}.
&lt; /think&gt;
To solve the problem, we need to find a positive integer $n$ such that $S_n$,
    the minimum value of the sum $\sum_{k=1}^n \sqrt{(2k-1)^2 + a_k^2}$, is an integer. Here, $a_1, a_2, \ldots, a_n$ are positive real numbers whose sum is 17.
First, we recognize that each term $\sqrt{(2k - 1)^2 + a_k^2}$ represents the hypotenuse of a right-angled triangle with legs $(2k - 1)$ and $a_k$. The total vertical distance is the sum of the vertical components, which is $\sum_{k=1}^n (2k - 1) = n^2$. The total horizontal distance is the sum of $a_k$, which is 17.
To minimize the sum, we use the method of Lagrange multipliers. We find that each $a_k$ is proportional to $(2k - 1)$. Thus, $a_k = \frac{17(2k - 1)}{n^2}$.
</div>



中文说明: 列表 5 续-- 因式分解得唯一正整数 $n=12$, 并验算 $S_n=145$.

<!-- page 31 of 86 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family: monospace;">
Substituting this back into the expression for $S_n$, we get:

$$
 S_n = \sum_{k=1}^n \sqrt{(2k - 1)^2 + \left( \frac{17(2k - 1)}{n^2} \right)^2 } = \
    sqrt{n^4 + 289} 
$$


We need $\sqrt{n^4 + 289}$ to be an integer. Let $m$ be this integer, so:

$$
 m^2 = n^4 + 289 
$$


$$
 m^2 - n^4 = 289 
$$


This can be factored as:

$$
 (m - n^2)(m + n^2) = 289 
$$


The factor pairs of 289 are (1, 289) and (17, 17). The valid factor pair is (1, 289),
    leading to:

$$
 m - n^2 = 1 
$$


$$
 m + n^2 = 289 
$$


Adding and subtracting these equations, we find:

$$
 2m = 290 \implies m = 145 
$$


$$
 2n^2 = 288 \implies n^2 = 144 \implies n = 12 
$$


Thus, the unique positive integer $n$ is \boxed{12}.
</div>



中文说明: 列表 5 收束, 终答 $n=12$.

Listing 6 | An example SFT trajectory from reasoning data related to code.



列表 6｜代码推理 SFT 轨迹示例.

````python
## Question
In this kata, your job is to create a class Dictionary which you can add words to and
    their entries. Example:
    '``python
>>> d = Dictionary()

>>> d. newentry('Apple', 'A fruit that grows on trees')

>>> print(d. look('Apple'))
A fruit that grows on trees

>>> print(d. look('Banana'))
Can't find entry for Banana
```

Good luck and happy coding!

Here is the setup code:
    '``python
class Dictionary():
        def __init__(self):
            # Your code
            pass

        def newentry(self, word, definition):
            # Your code
            pass

        def look(self, key):
            # your code
            pass
```

## Response
<think>
Okay, I need to create a Python class called Dictionary. The class should allow adding
````

<!-- page 32 of 86 -->

```python
words with their definitions and looking them up. Hmm, let's think about the setup.
So, when a Dictionary object is created, like d = Dictionary(), I probably need some kind of data structure to store the words and their entries. A dictionary seems perfect for this because it can hold key-value pairs, where the key is the word and the value is the definition.
So in the __init__ method, I should initialize an empty dictionary. Like self. entries = {}.
Then, there's the newentry method. This method takes two arguments: word and definition
    So in newentry, I need to add the word as the key and the definition as the value to the self. entries dictionary.
Now, the look method is called with a key. It needs to return the definition if the key exists, else return a string saying it can't find the entry. Like, for example, looking up 'Apple' returns the definition, but looking up 'Banana' returns 'Can't find entry for Banana'.
Wait, how does it handle case sensitivity? I guess we're assuming the keys are case-sensitive as per the string passed. So 'Apple' is different from 'apple'.
So the steps for the look function are: check if the key is in self. entries. If yes, return the value. If no, return the specific string.
Putting it all together:
For the __init__':
def __init__(self):
    self. entries = {}
```



中文说明: 列表 6 思考过程-- 用 dict 存词条, 实现 `__init__` / `newentry` / `look`.

<!-- page 33 of 86 -->

````markdown
Wait, any edge cases? Like, what if word is an empty string? Or any other type? The problem doesn't specify handling those, so I think the code should work as intended.

Another thing: in the look method, when we do 'if key in self. entries', does it check for the presence as a key? Yes, so that's correct.

So, to implement:

Start by adding the __init__, newentry, and look methods as described.
</think>

To solve this problem, we need to create a Python class called Dictionary that allows adding words with their definitions and looking them up. The class should return the definition if the word exists and a specific message if it does not.

### Approach
1. **Data Structure**: Use a dictionary to store the words as keys and their definitions as values. This allows efficient lookups and additions.
2. **Initialization**: In the '__init__' method, initialize an empty dictionary to store the word definitions.
3. **Adding Entries**: The 'newentry' method takes a word and its definition, then adds this pair to the dictionary.
4. **Looking Up Entries**: The 'look' method checks if the word exists in the dictionary. If it does, it returns the definition; otherwise, it returns a message indicating the word was not found.

### Solution Code
''python
class Dictionary():
    def __init__(self):
        self. entries = {}

    def newentry(self, word, definition):
        self. entries[word] = definition

    def look(self, key):
        if key in self. entries:
            return self. entries[key]
        else:
            return f"Can't find entry for {key}"
```

### Explanation
1. **Initialization**: The '__init__' method sets up an empty dictionary 'self. entries' to store the words and their definitions.
2. **Adding Entries**: The 'newentry' method takes two parameters, 'word' and 'definition', and adds them to 'self. entries' where 'word' is the key and 'definition' is the value.
3. **Looking Up Entries**: The 'look' method checks if the given key exists in 'self. entries'. If the key is found, its corresponding definition is returned. If not, a message is returned indicating the absence of the entry.

This approach ensures efficient storage and retrieval of word definitions using a dictionary data structure, providing an optimal solution for the problem.
````



**思路**



中文: 用字典存词条, 高效增查.

**Solution Code 题解代码**

**Explanation 解释**

Listing 7 | An example SFT trajectory from non-reasoning data related to writing.



列表 7｜非推理(写作)SFT 轨迹示例.

```markdown
## Question
write a short poem ending in "was tentacles all along"
```

<!-- page 34 of 86 -->

```txt
## Response
<think>
Okay, I need to help the user write a short poem that ends with "was tentacles all along." Hmm, ending with that specific line suggests a twist or surprise, maybe something unexpected.

First, I'll think about the theme. Tentacles make me think of sea creatures, like octopuses or squids, so perhaps an underwater setting would work well. Maybe a treasure hunt or an adventure beneath the waves could set the scene.

I want the poem to build up anticipation. Starting with something mysterious, like shadows under the sea, could create intrigue. Then, introducing elements like a sunken chest or sailors' lore might add depth and keep the reader engaged.

Rhyme scheme is important for a poem. I'll probably go with something simple, like AABB or ABAB, to keep it flowing smoothly. Each stanza should have four lines to maintain structure.

Now, the twist at the end should be sudden but make sense. Perhaps the treasure they seek turns out to be something entirely different. The last line needs to be impactful, so building up the suspense through the previous lines will make the ending more surprising.

Let me outline the stanzas. The first stanza could set the scene with the ocean depths and a hidden secret. The second stanza can show the action, like diving for treasure, and then reveal the unexpected tentacles.

I'll make sure each line flows naturally and the imagery is vivid. Using words like "waves," "shadows," "caverns," and "mystery" can help paint the picture. Ending with the twist will leave the reader with a lasting impression.

Alright, putting it all together, I'll craft two stanzas that build up to the final line, ensuring the surprise feels satisfying and the poem feels complete.
</think>

Beneath the waves, where shadows creep,
A secret stirs in the ocean deep.
A sunken chest, a sailor's song,
The mystery whispered all along.

We dove for pearls, for gold, for lore,
Through caverns dark, to the ocean floor.
But what we found, so strange, so strong--
It wasn't treasure... it was tentacles all along.
```



中文说明: 列表 7-- 先构思主题, 韵脚与反转, 再给出两节短诗, 末行固定为「was tentacles all along」.

### B. 4. Hyper-Parameters 超参数

#### B. 4.1. Hyper-Parameters of DeepSeek-R1-Zero-Qwen-32B DeepSeek-R1-Zero-Qwen-32B 超参

To train DeepSeek-R1-Zero-Qwen-32B, we set the learning rate to 2e-6, the KL coefficient to 0.001, and the sampling temperature to 1 for rollout. For each question, we sample 16 outputs with a maximum length of 32, 768. Each training step consists of 32 unique questions, resulting in a training batch size of 512 per step. Every 400 steps, we replace the reference model with the latest policy model. To accelerate training, each rollout generates 8, 192 outputs, which are randomly split into 16 mini-batches and trained for only a single inner epoch.



训 DeepSeek-R1-Zero-Qwen-32B: lr 2e-6, KL 0.001, rollout 温度 1; 每题 16 条, 最长 32, 768; 每步 32 题, batch 512; 每 400 step 换参考; 每次 rollout 8, 192 切 16 mini-batch, 一个 inner epoch.

<!-- page 35 of 86 -->


For the experiment of Qwen2.5-32B-Zero in Appendix F. 1, we use the following hyper-parameters: the learning rate is set to 1e-6, the KL coefficient is set to 0.001, and the sampling temperature is set to 1 for rollout. For each question, we sample 16 outputs with a maximum length of 32, 768. Each training step consists of 32 unique questions, resulting in a training batch size of 512. Every 400 steps, we replace the reference model with the latest policy model. To accelerate training, each rollout generates 8, 192 outputs, which are randomly split into 16 mini-batches and trained for only a single inner epoch. The total training steps are over 10K.



附录 F. 1 的 Qwen2.5-32B-Zero: lr 1e-6, KL 0.001, rollout 温度 1; 每题 16 条, 最长 32, 768; 每步 32 题, batch 512; 每 400 step 换参考; 每次 rollout 8, 192 切 16 mini-batch, 一个 inner epoch; 总步数超过 10K.

#### B. 4.2. Hyper-Parameters of SFT SFT 超参

For SFT, we train the model for 2 epochs with a learning rate of 5e-6, a batch size of 64, and a maximum context length of 32, 768 tokens. We employ a cosine decay learning rate scheduler that gradually decreases the learning rate to one-tenth of its initial value.



SFT: 2 epoch, lr 5e-6, batch 64, 最大上下文 32, 768; cosine 衰减到初值的 1/10.

#### B. 4.3. Hyper-Parameters of Distillation 蒸馏超参

For distillation, we fine-tune the corresponding base model for 2–3 epochs using the 800k data described in Section B. 3.3. The base model and initial learning rate are listed in Table 6. We employ a cosine decay learning rate scheduler that gradually decreases the learning rate to one-tenth of its initial value. The maximum context length is 32, 768 tokens, and the batch size is 64.



蒸馏: 用 §B. 3.3 的 800k 数据微调对应底座 2–3 epoch; 底座与初始 lr 见表 6; cosine 到初值 1/10; 最大上下文 32, 768, batch 64.

Table 6 | DeepSeek-R1 Distilled Models, their corresponding Base Models, and Initial Learning Rates.



表 6｜R1 蒸馏模型, 对应底座与初始学习率.

| Distilled Model | Base Model | Initial Learning Rate |
| --- | --- | --- |
| DeepSeek-R1-Distill-Qwen-1.5B | Qwen2.5-Math-1.5B | 1×10<sup>-4</sup> |
| DeepSeek-R1-Distill-Qwen-7B | Qwen2.5-Math-7B | 8×10<sup>-5</sup> |
| DeepSeek-R1-Distill-Qwen-14B | Qwen2.5-14B | 7×10<sup>-5</sup> |
| DeepSeek-R1-Distill-Qwen-32B | Qwen2.5-32B | 6×10<sup>-5</sup> |
| DeepSeek-R1-Distill-Llama-8B | Llama-3.1-8B | 5×10<sup>-5</sup> |
| DeepSeek-R1-Distill-Llama-70B | Llama-3.3-70B-Instruct | 2×10<sup>-5</sup> |

#### B. 4.4. Training Cost 训练成本

Regarding our research on DeepSeek-R1, we utilized the A100 GPUs to prepare for the experiments with a smaller model (30B parameters). The results from this smaller model have been promising, which has allowed us to confidently scale up to 660B R1-Zero and R1. For the training of DeepSeek-R1-Zero, we employed 64\*8 H800 GPUs, and the process required approximately 198 hours. Additionally, during the training phase of DeepSeek-R1, we utilized the same 64\*8 H800 GPUs, completing the process in about 4 days, or roughly 80 hours. To create the SFT datasets, we use 5K GPU hours. The details are shown in Table 7.



研究阶段先用 A100 在约 30B 小模型上试; 结果够好才放大到约 660B 的 R1-Zero/R1. R1-Zero: 64×8 H800, 约 198 小时; R1: 同规模约 4 天(约 80 小时); SFT 数据约 5K GPU 小时. 见表 7.

### B. 5. Reward Hacking 奖励黑客

In the context of LLM training, reward hacking refers to the phenomenon wherein a model exploits flaws or biases in the reward function, thereby achieving high reward scores without truly aligning with the underlying human intent. In our work, we observe such reward hacking behavior when employing the helpful reward model. Specifically, if the reward model contains systematic biases or inaccuracies, the LLM may learn to generate responses that are rated highly by the model but diverge from authentic human preferences. This misalignment can manifest in performance degradation on tasks requiring complex reasoning, as illustrated in Figure 6.



LLM 训练里的奖励黑客: 钻奖励函数漏洞/偏见拿高分, 却不真正对齐人类意图. 使用有用性 RM 时观察到: RM 有系统偏差时, 模型会生成 RM 打高分但偏离真实偏好的回复, 复杂推理任务上分数反而掉(图 6).

### B. 6. Ablation Study of Language Consistency Reward 语言一致性奖励消融

To study the impact of the Language Consistency (LC) Reward, we conduct an ablation experiment on DeepSeek-R1-Distill-Qwen-7B. This model uses the same cold start data as DeepSeek-R1



为研究语言一致性(LC)奖励, 在 DeepSeek-R1-Distill-Qwen-7B 上做消融; 该模型与 R1 共用同一批冷启动数据,

<!-- page 36 of 86 -->

![Chart block](images/p36-figure-6-reward-hacking-the-reward-exhibits-an.png)

Figure 6 | Reward hacking: the reward exhibits an increasing trend as the performance on CodeForces decreases for training.



图 6｜奖励黑客: 训练中奖励分上升, 同时 CodeForces 表现下降.

<!-- page 37 of 86 -->

Table 7 | Training costs of DeepSeek-R1, assuming the rental price of H800 is \$2 per GPU hour.



表 7｜DeepSeek-R1 训练成本(假设 H800 租金 \$2 / GPU. 小时).

| Training Costs | DeepSeek-R1-Zero | SFT data creation | DeepSeek-R1 | Total |
| --- | --- | --- | --- | --- |
| in H800 GPU Hours | 101K | 5K | 41K | 147K |
| in USD | $202K | $10K | $82K | $294K |

and also exhibits language mixing during the RL process. The results are shown in Figure 7. As can be seen, without the LC reward, language consistency gradually deteriorates as training steps increase. However, when the LC reward is applied, stable language consistency is maintained throughout the training process. For benchmark performance, the model maintains comparable performance on the mathematical benchmark, while a slight degradation is observed on the coding benchmark. Although such alignment results in a slight degradation in model performance, this reward aligns with human preferences, making the output more readable.



RL 过程中也会混语. 结果见图 7: 无 LC 时一致性随步数变差; 加上后全程稳住. 基准上数学大致持平, 代码略掉. 对齐略伤分, 但更符合人类可读偏好.

![Chart block](images/p37-chart.png)

![Chart block](images/p37-chart-2.png)

![Chart block](images/p37-figure-7-the-experiment-results-of-language-consistency.png)

Figure 7 | The experiment results of Language Consistency (LC) Reward during reinforcement learning.



图 7｜强化学习中语言一致性(LC)奖励实验结果.

## C. Self-Evolution of DeepSeek-R1-Zero DeepSeek-R1-Zero 的自我演化

### C. 1. Evolution of Reasoning Capability in DeepSeek-R1-Zero during Training 训练中推理能力的演化

We analyzed DeepSeek-R1-Zero’s performance on the MATH dataset stratified by difficulty levels (1-5). Figure 8 reveals distinct learning patterns: easy problems (levels 1-3) quickly reach high accuracy (0.90-0.95) and remain stable throughout training, while difficult problems show remarkable improvement - level 4 problems improve from near 0.78 to 0.95, and the most challenging level 5 problems demonstrate the most dramatic improvement from near 0.55 to 0.90.



按难度 1–5 分层看 MATH. 图 8: 易题(1–3)很快到 0.90–0.95 并稳住; 难题涨幅大--level 4 从约 0.78 到 0.95, level 5 从约 0.55 到 0.90.

One may find it counterintuitive that the model’s accuracy on harder questions (levels 3-4) occasionally surpasses its performance on easier questions (level 1) by a small margin. This apparent anomaly stems from several dataset characteristics. The MATH dataset is unevenly distributed, with level-1 questions comprising only 43 of 500 examples, while higher levels contain approximately 100 questions each. Consequently, the model’s 95-97% accuracy on level-1 represents just 1-2 unsolved problems, primarily in geometry, where the model still struggles. Furthermore, the distribution of mathematical categories (geometry, algebra, etc.) varies across difficulty levels due to the dataset’s construction methodology. It’s also worth noting that these difficulty levels were annotated based on human perception of problem complexity rather than



难题(3–4)偶尔略高于易题(1)并不反直觉: 数据集不均--level-1 仅 43/500, 更高档约各 100 题; level-1 的 95–97% 往往只剩 1–2 道未解(多在几何). 各档科目分布也因构造方法不同; 难度标签按人类体感标, 而非

<!-- page 38 of 86 -->

![Chart block](images/p38-figure-8-performance-of-deepseek-r1-zero-on-problems.png)

Figure 8 | Performance of DeepSeek-R1-Zero on problems with varying difficulty levels in the MATH dataset.



图 8｜R1-Zero 在 MATH 不同难度题上的表现.

machine learning considerations.



机器学习意义上的难度.

Despite these nuances in comparing raw accuracy percentages across difficulty levels, the training trends still demonstrate that while simpler reasoning tasks (for humans) are mastered early in training, the model’s capability on complex reasoning problems (level 3-5) significantly improves over time.



跨档比原始准确率有 nuance, 但趋势仍清楚: 对人来说更简单的推理早掌握, 复杂题(3–5)能力随训练明显变强.

### C. 2. Evolution of Advanced Reasoning Behaviors in DeepSeek-R1-Zero during Training 高级推理行为的演化

We analyze the change in the reasoning behavior of the model during training.



分析训练中推理行为怎么变.

First, as shown in Figure 9(a), we counted some representative reflective words, including “wait”, “mistake”, “however”, “but”, “retry”, “error”, “verify”, “wrong”, “evaluate”, and “check” These reflective words were selected by 3 human experts, who are asked to think of several reflective words and then merge them into a final word list. As is shown, there is a gradual increase in the frequency of reflective behaviors as training progresses. Specifically, the count of the reflective words rises 5- to 7-fold compared to the start of training, suggesting that RL plays a key role in generating long-chain intermediate tokens.



图 9(a): 统计代表性反思词(wait, mistake, however, but, retry, error, verify, wrong, evaluate, check), 由 3 位专家各自想词再合并. 反思行为频率随训练渐升, 词计数相对开训升 5–7 倍, 说明 RL 在促生长链中间 token.

Second, specific reflective behaviors may appear at particular points in training. The analysis of the word “wait” (Figure 9(b)) demonstrates this clearly. This reflective strategy was nearly absent during early training, showed occasional usage between steps 4000-7000, and then exhibited significant spikes after step 8000. This suggests that the model learns different forms of reflection at specific stages of development.



特定反思会在特定阶段出现.「wait」(图 9(b))早期几乎没有, 4000–7000 step 偶发, 8000 后明显尖峰-- 不同反思形态在不同发育阶段学会.

In conclusion, we observe a gradual increase in the model’s reflective behavior during training, while certain reflection patterns like the use of “wait” emerge at specific points in the training process.



结论: 反思总体渐增;「wait」一类模式在特定节点冒出.

<!-- page 39 of 86 -->

![Chart block](images/p39-chart.png)

![Chart block](images/p39-figure-9-evolution-of-reasoning-behaviors-during.png)

Figure 9 | Evolution of reasoning behaviors during training. (a) Frequency of representative reflective words during the training process; (b) Specific occurrence patterns of the word “wait” throughout the training process.



图 9｜训练中推理行为演化. (a) 代表性反思词频率; (b) 「wait」出现模式.

## D. Evaluation of DeepSeek-R1 DeepSeek-R1 评测

### D. 1. Experiment Setup 实验设置

**Benchmarks** We evaluate models on MMLU (Hendrycks et al., 2021), MMLU-Redux (Gema et al., 2025), MMLU-Pro (Wang et al., 2024), C-Eval (Huang et al., 2023), IFEval (Zhou et al., 2023b), FRAMES (Krishna et al., 2024), GPQA Diamond (Rein et al., 2023), SimpleQA (OpenAI, 2024a), C-SimpleQA (He et al., 2024), SWE-Bench Verified (OpenAI, 2024b), Aider (Gauthier, 2025), LiveCodeBench (Jain et al., 2024) (2024-08 – 2025-01), Codeforces (Mirzayanov, 2025), Chinese National High School Mathematics Olympiad (CNMO 2024) (CMS, 2024), and American Invitational Mathematics Examination 2024 (AIME 2024) (MAA, 2024).



**基准**: MMLU / MMLU-Redux / MMLU-Pro, C-Eval, IFEval, FRAMES, GPQA Diamond, SimpleQA, C-SimpleQA, SWE-Bench Verified, Aider, LiveCodeBench(2024-08–2025-01), Codeforces, CNMO 2024, AIME 2024 等.

Specifically, MMLU, MMLU-Redux, MMLU-Pro, C-Eval, and CMMLU are multiple-choice benchmarks designed to assess model performance on general encyclopedic knowledge. Higher scores on these benchmarks indicate a broader understanding of world knowledge and the ability to correctly answer questions in a multiple-choice format. SimpleQA and C-SimpleQA evaluate model performance on long-tail knowledge, while GPQA assesses the ability to solve Ph. D.-level tasks in physics, chemistry, and biology. IFEval is designed to evaluate the model’s capacity to generate outputs in a required format. FRAMES and DROP focus on assessing model performance in processing and reasoning over long documents. In addition to these standard benchmarks, we also evaluate our models on open-ended generation tasks, employing LLM as judges. We follow the original evaluation protocols of AlpacaEval 2.0 and Arena-Hard, utilizing GPT-4-Turbo-1106 for pairwise comparisons. To mitigate length bias, only the final summary is provided to the evaluation model.



MMLU 系与 C-Eval/CMMLU 测百科多选; SimpleQA / C-SimpleQA 测长尾事实; GPQA 测博士级物化生; IFEval 测格式遵循; FRAMES / DROP 测长文理解推理. 开放生成用 LLM 裁判, AlpacaEval 2.0 与 Arena-Hard 原协议, GPT-4-Turbo-1106 成对比较; 为减长度偏置, 只把最终摘要交给评测模型.

LiveCodeBench and Codeforces are designed to measure model performance on algorithmic competition tasks, whereas SWE-Verified and Aider assess the model’s capabilities on real world software engineering problems. Finally, AIME, MATH-500, and CNMO 2024 comprise mathematics problems that test the model’s reasoning abilities in mathematical domains.



LiveCodeBench / Codeforces 测算法竞赛; SWE-Verified / Aider 测真实软件工程; AIME, MATH-500, CNMO 2024 测数学推理.

For distilled models, we report representative results on AIME 2024, MATH-500, GPQA Diamond, Codeforces, and LiveCodeBench.



蒸馏模型报告 AIME 2024, MATH-500, GPQA Diamond, Codeforces, LiveCodeBench 上的代表结果.

<!-- page 40 of 86 -->

**Decontamination** To prevent benchmark contamination, we implemented comprehensive decontamination procedures for both pre-training and post-training data. DeepSeek-V3 base has a knowledge cutoff date of July 2024, predating evaluation benchmarks like CNMO 2024, and we filtered out any text segments (including web pages and GitHub files) that contained matching 10-gram sequences from evaluation questions or reference solutions. As one example of our decontamination efforts, in the mathematics domain alone, our decontamination process identified and removed approximately six million potential pre-training texts. For post-training, mathematical SFT data and RL training prompts were sourced exclusively from pre-2023 competitions and underwent the same n-gram filtering protocol used in pre-training, ensuring no overlap between training and evaluation data. These measures ensure our model evaluation results reflect genuine problem-solving capabilities rather than memorization of test data.



**去污染**: 预训练与后训练都做. V3 base 知识截止 2024-07, 早于 CNMO 2024 等; 过滤含评测题或参考解 10-gram 匹配的文本(含网页与 GitHub). 仅数学域就剔除约六百万条潜在预训练文本. 后训练数学 SFT 与 RL 提示只来自 2023 前竞赛, 并走同一 n-gram 过滤, 避免训测重叠. 目标是测真解题, 而不是背题.

However, we acknowledge that the n-gram based decontamination method cannot prevent the paraphrase of testset. Therefore, it is possible that benchmarks released before 2024 may suffer from contamination issues.



也承认: n-gram 挡不住改写; 2024 前发布的基准仍可能有污染.

**Evaluation Prompts** Following the setup in DeepSeek-V3, standard benchmarks such as MMLU, DROP, GPQA Diamond, and SimpleQA are evaluated using prompts from the simpleevals framework. For MMLU-Redux, we adopt the Zero-Eval prompt format (Lin, 2024) in a zero-shot setting. In terms of MMLU-Pro, C-Eval and CLUE-WSC, since the original prompts are few-shot, we slightly modify the prompt to the zero-shot setting. The CoT in few-shot may hurt the performance of DeepSeek-R1. Other datasets follow their original evaluation protocols with default prompts provided by their creators. For code and math benchmarks, the HumanEval-Mul dataset covers eight mainstream programming languages (Python, Java, C++, C#, JavaScript, TypeScript, PHP, and Bash). Model performance on LiveCodeBench is evaluated using CoT format, with data collected between August 2024 and January 2025. The Codeforces dataset is evaluated using problems from 10 Div. 2 contests, along with expert-crafted test cases, after which the expected ratings and percentages of competitors are calculated. SWE-Bench verified results are obtained via the agentless framework (Xia et al., 2024). AIDER-related benchmarks are measured using a "diff" format. DeepSeek-R1 outputs are capped at a maximum of 32, 768 tokens for each benchmark.



**评测提示**: 沿用 V3; MMLU, DROP, GPQA Diamond, SimpleQA 用 simpleevals; MMLU-Redux 用 Zero-Eval 零样本; MMLU-Pro, C-Eval, CLUE-WSC 把原 few-shot 改成零样本(few-shot 里的 CoT 可能伤 R1). 其余跟官方默认. 代码/数学侧 HumanEval-Mul 覆盖八种主流语言; LiveCodeBench 用 CoT, 数据 2024-08–2025-01; Codeforces 取 10 场 Div. 2 + 专家测例算评分与百分位; SWE-Bench verified 走 agentless; AIDER 用 diff 格式. R1 每基准输出上限 32, 768 token.

Table 18 to Table 32 present examples of our evaluation formats on different benchmarks. We also detail the specific capabilities of large language models assessed by each benchmark in the corresponding table captions.



表 18–32 给出各基准评测格式示例; 表注写明各自测什么能力.

**Baselines** We conduct comprehensive evaluations against several strong baselines, including DeepSeek-V3, Claude-Sonnet-3.5-1022, GPT-4o-0513, OpenAI-o1-mini, and OpenAI-o1-1217. Since accessing the OpenAI-o1-1217 API is challenging in mainland China, we report its performance based on official reports. For distilled models, we also compare the open-source model QwQ-32B-Preview (Qwen, 2024a).



**基线**: DeepSeek-V3, Claude-Sonnet-3.5-1022, GPT-4o-0513, o1-mini, o1-1217. 大陆访问 o1-1217 API 困难, 其分数按官方报告. 蒸馏模型另比 QwQ-32B-Preview.

We set the maximum generation length to 32, 768 tokens for the models. We found that using greedy decoding to evaluate long-output reasoning models results in higher repetition rates and significant variability across different checkpoints. Therefore, we default to pass@𝑘 evaluation (Chen et al., 2021) and report pass@1 using a non-zero temperature. Specifically, we use a sampling temperature of 0.6 and a top-𝑝 value of 0.95 to generate 𝑘 responses (typically between 4 and 64, depending on the test set size) for each question. Sepcifically, we use 𝑘 = 64 for AIME and GPQA, 𝑘 = 16 for MATH and CodeForces, and 𝑘 = 8 for LCB. Pass@1 is then



最大生成长度 32, 768. 贪心解码评长输出推理模型时重复率高, 检查点间波动大, 故默认 pass@k, 并用非零温度报 pass@1. 温度 0.6, top-p 0.95, 每题采 k 条(通常 4–64). 具体: AIME/GPQA 的 k=64, MATH/CodeForces 的 k=16, LCB 的 k=8. pass@1

<!-- page 41 of 86 -->

calculated as



按

$$
\text {pass@1} = \frac {1}{k} \sum_ {i = 1} ^ {k} p _ {i},
$$

where $p _ { i }$ denotes the correctness of the 𝑖-th response. This method provides more reliable performance estimates. For AIME 2024, we also report consensus (majority vote) results using 64 samples, denoted as cons@64.



计算, 其中 $p_i$ 为第 i 条是否正确. 估计更稳. AIME 2024 另报 64 样本多数投票 cons@64.

### D. 2. Main Results 主结果

Table 8 | Comparison between DeepSeek-R1 and other representative models. Numbers in bold denote the performance is statistically significant (t−test with 𝑝 < 0.01).



表 8｜R1 与其他代表模型对照. 加粗为统计显著(t 检验, p<0.01).

| C Benchmark (Metric) S | laude-3.5onnet-102 | - GPT-4o2 0513 | DeepSeeV3 | k OpenAI o1-mini | OpenAIo1-1217 | DeepSeekR1 |
| --- | --- | --- | --- | --- | --- | --- |
| Architecture | - | - | MoE | - | - | MoE |
| # Activated Params | - | - | 37B | - | - | 37B |
| # Total Params | - | - | 671B | - | - | 671B |
| MMLU (EM) | 88.3 | 87.2 | 88.5 | 85.2 | 91.8 | 90.8 |
| MMLU-Redux (EM) | 88.9 | 88.0 | 89.1 | 86.7 | - | 92.9 |
| MMLU-Pro (EM) | 78.0 | 72.6 | 75.9 | 80.3 | - | 84.0 |
| DROP (3-shotF1) | 88.3 | 83.7 | 91.6 | 83.9 | 90.2 | 92.2 |
| IF-Eval (PromptStrict) | 86.5 | 84.3 | 86.1 | 84.8 | - | 83.3 |
| English |  |  |  |  |  |
| GPQA Diamond (Pass@1) | 65.0 | 49.9 | 59.1 | 60.0 | 75.7 | 71.5 |
| SimpleQA (Correct) | 28.4 | 38.2 | 24.9 | 7.0 | 47.0 | 30.1 |
| FRAMES (Acc.) | 72.5 | 80.5 | 73.3 | 76.9 | - | 82.5 |
| AlpacaEval2.0 (LC-winrate) | 52.0 | 51.1 | 70.0 | 57.8 | - | 87.6 |
| ArenaHard (GPT-4-1106) | 85.2 | 80.4 | 85.5 | 92.0 | - | 92.3 |
| LiveCodeBench (Pass@1-COT) | 38.9 | 32.9 | 36.2 | 53.8 | 63.4 | 65.9 |
| Codeforces (Percentile) | 20.3 | 23.6 | 58.7 | 93.4 | 96.6 | 96.3 |
| Code |  |  |  |  |  |
| Codeforces (Rating) | 717 | 759 | 1134 | 1820 | 2061 | 2029 |
| SWE Verified (Resolved) | 50.8 | 38.8 | 42.0 | 41.6 | 48.9 | 49.2 |
| Aider-Polyglot (Acc.) | 45.3 | 16.0 | 49.6 | 32.9 | 61.7 | 53.3 |
| AIME 2024 (Pass@1) | 16.0 | 9.3 | 39.2 | 63.6 | 79.2 | 79.8 |
| Math MATH-500 (Pass@1) | 78.3 | 74.6 | 90.2 | 90.0 | 96.4 | 97.3 |
| CNMO 2024 (Pass@1) | 13.1 | 10.8 | 43.2 | 67.6 | - | 78.8 |
| CLUEWSC (EM) | 85.4 | 87.9 | 90.9 | 89.9 | - | 92.8 |
| Chinese C-Eval (EM) | 76.7 | 76.0 | 86.5 | 68.9 | - | 91.8 |
| C-SimpleQA (Correct) | 55.4 | 58.7 | 68.0 | 40.3 | - | 63.7 |

**Standard Benchmark** We evaluate DeepSeek-R1 on multiple benchmarks. For educationoriented knowledge benchmarks such as MMLU, MMLU-Pro, and GPQA Diamond, DeepSeek-R1 demonstrates superior performance compared to DeepSeek-V3. This improvement is primarily attributed to enhanced accuracy in STEM-related questions, where significant gains are achieved through large-scale reinforcement learning. Additionally, DeepSeek-R1 excels on FRAMES, a long-context-dependent QA task, showcasing its strong document analysis capabilities. This highlights the potential of reasoning models in AI-driven search and data analysis tasks.



**标准基准**: 教育向知识基准(MMLU, MMLU-Pro, GPQA Diamond)上 R1 优于 V3, 主因 STEM 题在大规模 RL 后更准. 长文 FRAMES 也强, 显示文档分析潜力, 指向搜索与数据分析场景.

DeepSeek-R1 also delivers impressive results on IF-Eval, a benchmark designed to assess a model’s ability to follow format instructions. These improvements can be linked to the inclusion of instruction-following data during the final stages of SFT and RL training. Furthermore,



IF-Eval 格式遵循也亮眼, 可联系到末段 SFT/RL 加入的指令跟随数据. 再者,

<!-- page 42 of 86 -->

remarkable performance is observed on AlpacaEval2.0 and ArenaHard, indicating DeepSeek-R1’s strengths in writing tasks and open-domain question answering.



AlpacaEval2.0 与 ArenaHard 同样突出, 写作与开放问答强.

On math tasks, DeepSeek-R1 demonstrates performance on par with OpenAI-o1-1217, surpassing other models by a large margin. A similar trend is observed on coding algorithm tasks, such as LiveCodeBench and Codeforces, where reasoning-focused models dominate these benchmarks. On engineering-oriented coding tasks, OpenAI-o1-1217 outperforms DeepSeek-R1 on Aider but achieves comparable performance on SWE Verified. We believe the engineering performance of DeepSeek-R1 will improve in the next version, as the amount of related RL training data currently remains very limited.



数学上与 o1-1217 同档, 大幅超过其他模型; 算法竞赛(LiveCodeBench, Codeforces)同样是推理模型主导. 工程向代码: o1-1217 在 Aider 更强, SWE Verified 相近. 工程 RL 数据仍很少, 下一版有望抬.

![Chart block](images/p42-figure-10-the-benchmark-performance-of-deepseek-r1-and.png)

Figure 10 | The benchmark performance of DeepSeek-R1 and DeepSeek-R1-Zero is compared with human scores across different datasets. For AIME and Codeforces, the human scores represent the average performance of all human competitors. In the case of GPQA, the human score corresponds to Ph. D.-level individuals who had access to the web for answering the questions.



图 10｜R1 / R1-Zero 与人类分数对照. AIME, Codeforces 为人类参赛均分; GPQA 为可上网的博士级人类.

Figure 10 presents a comparative analysis of the performance of DeepSeek-R1-Zero, DeepSeek-R1, and human participants across several benchmark competitions. Notably, the AIME is a mathematics competition designed for high school students, and DeepSeek-R1 demonstrates performance that surpasses the mean score achieved by human competitors in this event. On the Codeforces platform, DeepSeek-R1 outperforms 96.3% of human participants, underscoring its advanced problem-solving capabilities. In the case of GPQA, where human experts-typically individuals with Ph. D.-level qualifications and access to web resources-participate, human performance remains superior to that of DeepSeek-R1. However, we anticipate that enabling web access for DeepSeek-R1 could substantially enhance its performance on GPQA, potentially narrowing or closing the observed gap.



图 10: AIME 上 R1 超过人类均分; Codeforces 超过 96.3% 人类; GPQA 上可上网博士仍更强, 若给 R1 联网或可缩小差距.

<!-- page 43 of 86 -->

| Rank*(UB) | Delta | Model | Arena Score | 95% CI | Votes | Organization | License |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 3 | o1-2024-12-17 | 1323 | +6/-5 | 9230 | OpenAI | Proprietary |
| 1 | 0 | Gemini-Exp-1206 | 1321 | +4/-5 | 22116 | Google | Proprietary |
| 1 | 2 | ChatGPT-4o-latest_(2024-11-20). | 1318 | +4/-3 | 35328 | OpenAI | Proprietary |
| 1 | 2 | DeepSeek-R1 | 1316 | +15/-11 | 1883 | DeepSeek | MIT |
| 3 | -2 | Gemini-2.0-Flash-Thinking-Exp-01-21 | 1310 | +7/-8 | 6437 | Google | Proprietary |
| 4 | 3 | o1-preview | 1303 | +4/-4 | 33186 | OpenAI | Proprietary |
| 5 | -1 | Gemini-2.0-Flash-Exp | 1297 | +5/-4 | 20939 | Google | Proprietary |
| 8 | 4 | Claude_3.5_Sonnet_(20241022). | 1286 | +3/-4 | 48847 | Anthropic | Proprietary |

Figure 11 | The style control ranking on ChatBotArena of DeepSeek-R1. The screenshot is captured on January 24, 2025, one week after model release. The ranking is dynamically updated in real time as the number of votes increases.



图 11｜ChatBotArena 风格控制榜上的 R1(截自 2025-01-24, 发布约一周). 票数增加时排名实时更新.

**Human Evaluation** We utilize ChatbotArena (Chiang et al., 2024) to show the human preference of DeepSeek-R1 with its ranking and elo score. ChatbotArena is an open, crowdsourced platform developed by LMSYS and UC Berkeley SkyLab to evaluate and rank LLMs based on human preferences. Its core mechanism involves pairwise comparisons, where two anonymous LLMs (randomly selected from a pool of over 100 models) respond to a user-submitted prompt. Users then vote on which response they prefer, declare a tie, or mark both as bad, without knowing the models’ identities until after voting. This double-blind approach ensures fairness and reduces bias. The platform collects millions of user votes as of recent updates-and uses them to rank models with the Elo rating system, a method adapted from chess that predicts win rates based on pairwise outcomes. To improve stability and incorporate new models efficiently, Chatbot Arena employs a bootstrap-like technique, shuffling vote data across permutations to compute reliable Elo scores. It has also begun adopting the Bradley-Terry model, which refines rankings by estimating win probabilities across all battles, leveraging the full vote history.



**人类评测**: 用 ChatbotArena 展示偏好排名与 Elo. 成对盲测, 用户投票; Elo / Bradley-Terry 汇总. 图 11 显示风格控制设定下 R1 与 o1, Gemini-Exp-1206 并列第一档-- 开源 MIT, 成本相对低, 却能打闭源, 是重要里程碑.

DeepSeek-R1 has demonstrated remarkable performance in ChatbotArena. Figure 11 presents the overall ranking of DeepSeek-R1 on ChatbotArena as of January 24, 2025, where DeepSeek-R1 shares the first position alongside OpenAI-o1 and Gemini-Exp-1206 on the style control setting. Style control refers to a feature introduced to separate the influence of a model’s response style (e. g., length, formatting, tone) from its substantive content (e. g., accuracy, relevance, reasoning) when evaluating and ranking LLMs. This addresses the question of whether models can "game" human preferences by producing responses that are longer, more polished, or better formatted, even if their content isn’t necessarily superior. It is a huge milestone that an open-source model under the MIT License could achieve comparable performance with closed-source models, especially considering that the cost of DeepSeek-R1 is relatively inexpensive. Figure 12 illustrates the rankings across different evaluation dimensions, highlighting DeepSeek-R1’s strong performance in mathematics, coding, and other areas. This demonstrates that DeepSeek-R1 excels not only in reasoning but also across a wide range of domains.



风格控制把「文风」(长度, 排版, 语气)与「实质」(准确, 相关, 推理)拆开, 防止靠更长更华丽刷偏好. 图 12 显示数学, 代码等多维也强-- 不只有推理.

<!-- page 44 of 86 -->

![Image block](images/p44-figure-12-the-rank-of-deepseek-r1-across-various.png)

Figure 12 | The rank of DeepSeek-R1 across various aspects on January 24, 2025.



图 12｜2025-01-24 R1 在各维度上的排名.

### D. 3. DeepSeek-R1 Safety Report DeepSeek-R1 安全报告

**Warning: This section contains potentially risky and offensive content!** **警告: 本节可能含风险与冒犯性内容!**

We fully recognize that, while open source sharing facilitates the dissemination of advanced technologies within the community, it also introduces potential risks of misuse. In this section, we systematically present the security risk assessment of DeepSeek-R1. Specifically, we structure our analysis around the following aspects: (1) D. 3.1: the risk control system for the official DeepSeek-R1 service, (2) D. 3.2: a comparative safety evaluation with other state-of-the-art models on 6 publicly safety benchmarks, (3) D. 3.3: a taxonomy-based study based on in-house safety testsets, (4) D. 3.4: an evaluation of the multilingual safety of the R1 model, (5) D. 3.5: an assessment of the model’s robustness to jailbreak attacks.



开源利于传播, 也带来误用风险. 本节系统评估: (1) 官方服务风险控制; (2) 六个公开安全基准对照; (3) 内部安全集分类研究; (4) 多语安全; (5) 越狱鲁棒性.

#### D. 3.1. Risk Control System for DeepSeek-R1 R1 风险控制系统

Generally, beyond the intrinsic safety of models, model-based services typically implement an external risk control system to enhance system-level security. In this subsection, we introduce the risk control system deployed in the official DeepSeek services. In the comparative experiments presented later in this chapter, we will report the results of DeepSeek-R1 with and without risk control measures. For models from other manufacturers, the results represent the comprehensive safety performance that integrates both the model’s intrinsic safety mechanisms and external risk control systems.



除固有安全外, 服务端通常再挂外部风控. 后文同时报 R1 有/无风控; 他厂模型分数则是「固有安全 + 外部风控」的综合表现.

Listing 8 | The Risk Review Prompt for DeepSeek-R1.



列表 8｜R1 风险审核提示. (英文提示原文保留.)

```xml
<Role>
  You are a content safety manager for artificial intelligence. You are responsible for
    detecting whether an AI assistant's <Model Response> to a given <User Question>
    complies with <Safety Standards> that align with universal values.
</Role>
```



  <Workflow>
  1. Please carefully read the <Workflow> and <Safety Standards> to understand your
    process and requirements.
  2. Based on the given <User Question>, <Model Response>, and <Safety Standards>,
    determine whether the AI assistant's <Model Response> meets the <Safety Standards>.
  3. In your output, first analyze in detail whether the <Model Response> complies with
    the <Safety Standards>. If the <Model Response> does not comply with the <Safety
    Standards>, please indicate the corresponding clause number from the <Safety
    Standards>; otherwise, output -1. For specific output format, please refer to the <Output Format>.
</Workflow>



中文说明: 角色是内容安全审核; 按工作流对照安全标准判模型回复是否合规, 不合规需标条款号, 否则输出 -1.

<!-- page 45 of 86 -->

```xml
&lt; Safety Standards&gt;
(源文此处展开多条安全标准英文条款: 歧视偏见, 违法犯罪, 有害行为, 伦理等细目; 下列续页继续.)
&lt; /Safety Standards&gt;
&lt; Output Format&gt;
Analyze: ...
Clause: ...
&lt; /Output Format&gt;
```



中文说明: 安全标准与输出格式英文条款跨页; 结构为 Analyze + Clause.

<!-- page 46 of 86 -->



中文说明: 列表 8 安全标准英文条文续页(歧视/违法/有害/伦理等细类定义与源文一致).

<!-- page 47 of 86 -->

#### D. 3.2. R1 Safety Evaluation on Standard Benchmarks 标准安全基准上的 R1

We evaluate DeepSeek-R1 on six publicly available safety benchmarks: SimpleSafetyTests (SST) (Vidgen et al., 2023), BBQ (Parrish et al., 2022), Anthropic Red Teaming (ART) (Ganguli et al., 2022), XSTest (Röttger et al., 2024), Do-Not-Answer (DNA) (Wang et al., 2023d), and HarmBench (Mazeika et al., 2024). For DNA and HarmBench, we reproduce the evaluations ourselves (marked with \*); other numerical results are obtained from the independent HELM evaluations. Table 9 summarizes the comparison.



在六个公开安全基准上评 R1: SST, BBQ, ART, XSTest, DNA, HarmBench. DNA 与 HarmBench 自行复现(标 \*); 其余取自 HELM. 见表 9.

When evaluating DeepSeek-R1, we consider two settings: (1) hide CoT - only the final summary is exposed to the judge; (2) full response including the reasoning process. The numbers in parentheses represent the results of the pure model without the risk control system.



评 R1 时两设定: (1) hide CoT-- 裁判只看最终摘要; (2) 含思考全过程. 括号内为无风控裸模.

Across most benchmarks measuring common safety risks (toxicity and bias, violence and extremism, privacy violations, etc.), R1 consistently shows strong safety measures.



多数测常见安全风险(毒性偏见, 暴力极端, 隐私等)的基准上, R1 安全表现总体扎实.

<!-- page 48 of 86 -->

Table 9 | Comparison of DeepSeek-R1 and other frontier models on safety benchmarks. A higher score indicates better safety performance. Benchmarks marked with \* are the results reproduced by us, while other numerical results are obtained from the independent HELM evaluations. The numbers in parentheses represent the results of the pure model without considering the risk control system (introduced in D. 3.1).



表 9｜安全基准对照. 分越高越安全. \* 为自行复现; 括号为无风控裸模(见 D. 3.1).

| Safety Score(%) | SST | BBQ | ART | XSTest | DNA* | HarmBench* | Average Score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Claude-3.7-Sonnet | 100.0 | 92.1 | 99.7 | 96.4 | 95.9 | 83.3 | 94.6 |
| o1 (2024-12-17) | 99.0 | 97.3 | 98.3 | 97.0 | 86.2 | 84.0 | 93.6 |
| GPT-4o (2024-05-13) | 98.5 | 95.1 | 99.1 | 97.3 | 90.6 | 72.7 | 92.2 |
| Qwen2.5 Instruct (72B) | 100.0 | 95.4 | 99.6 | 97.9 | 95.9 | 83.0 | 95.3 |
| DeepSeek-V3 | 95.3 | 96.7 | 97.1 | 97.1 | 95.6 | 96.0 (67.0) | 96.3 (91.5) |
| DeepSeek-R1 (hide cot) | 98.0 | 96.6 | 97.2 | 94.4 | 93.7 | 96.3 (58.0) | 96.0 (89.7) |
| DeepSeek R1 | 97.5 | 96.6 | 96.2 | 95.3 | 94.8 | 89.3 (35.0) | 95.0 (85.9) |

and bias, violence and extremism, privacy violations, etc.), R1 consistently shows strong safety measures.



(接上页)在毒性偏见, 暴力极端, 隐私等维度, R1 总体安全措施扎实.

#### D. 3.3. Safety Taxonomic Study of R1 on In-House Benchmark 内部安全集上的分类研究

In this section, we present our safety taxonomy research for the DeepSeek-R1 model based on an in-house safety benchmark. Specifically, we first introduce the construction of the in-house safety benchmark. Subsequently, we discuss the performance of our R1 model across different categories and compare it with the performance of other frontier models.



内部安全基准按分类研究: 构造、R1 的分类表现、与前沿模型的对比依次给出.

Although existing works have already contributed valuable safety evaluation datasets, different datasets focus on distinct domains and employ varying classification methods. Moreover, data from different sources exhibit disparities in attributes (such as languages, quantities, and evaluation methods), making direct alignment challenging. Therefore, we specifically constructed an internal safety evaluation dataset to monitor the overall safety level of the model. The construction of this dataset has the following characteristics: (1) Following unified taxonomic standards to build the testing framework, comprehensively covering various safety and ethical scenarios as much as possible; (2) Aligning the quantity, languages, and evaluation methods of safety test data across different categories, enabling us to conduct quantitative safety assessments for different safety scenarios; (3) Possessing good extensibility, where the multilingual language (D. 3.4) and the jailbreak attacks (D. 3.5) evaluations in subsequent sections are also based on extensions of this dataset.



现有安全集域与分类不一, 属性难对齐, 故自建内部集: (1) 统一分类尽量盖全场景; (2) 各类数量/语言/评法对齐, 便于定量; (3) 可扩展, 多语(D. 3.4)与越狱(D. 3.5)都基于此集扩展.

Our taxonomy of safety issues is presented in Figure 13. We have categorized potential content safety challenges faced by language models into 4 major categories and 28 subcategories. The detailed description is as follows:



分类见图 13: 4 大类, 28 子类.

**Discrimination and Prejudice Issues** Discrimination and bias issues are prevalent across communities with diverse cultural backgrounds. We have broadly categorized these into two types: discrimination based on personal physical attributes and discrimination based on personal social attributes. Discrimination based on physical attributes primarily refers to inappropriate dismissal and mockery stemming from an individual’s physiological conditions, such as age, gender, sexual orientation, appearance, body shape, and health status. Social



**歧视与偏见**: 分身体属性歧视与社会属性歧视. 身体侧含年龄, 性别, 性取向, 外貌, 体型, 健康等不当贬损. 社会

<!-- page 49 of 86 -->

![Image block](images/p49-figure-13-taxonomy-of-in-house-safety-benchmark.png)

Figure 13 | Taxonomy of in-house safety benchmark.



图 13｜内部安全基准分类体系.

<!-- page 50 of 86 -->

attribute discrimination encompasses stereotypes based on nationality, ethnicity, and religion, as well as narrow perspectives derived from individual economic status, educational background, cultural identity, and family background.



属性歧视含国籍/族群/宗教刻板印象, 以及经济, 教育, 文化身份, 家庭背景等偏狭视角.

**Illegal and Criminal Behavior** Illegal activities encompass the following safety topics: violent behavior, terrorism, illegal pornographic content, illegal medical practices (surrogacy, euthanasia, organ trafficking), illegal gambling, drug and substance abuse (including drug manufacturing, trafficking, and consumption), cybercrime (attacks on networks and computer systems), animalrelated offenses (such as animal abuse or poaching), among others.



**违法犯罪**: 暴力, 恐怖, 非法色情, 非法医疗(代孕, 安乐死, 器官买卖), 非法赌博, 毒品, 网络犯罪, 虐待/盗猎动物等.

**Harmful Behavior** Harmful behavior toward humans primarily include the following four categories: (1) Physical harm: including self-harm, suicide, injury or murder of others; (2) Psychological harm: including verbal abuse, threats, intimidation, mental manipulation, deception, and instigation; (3) Privacy violations: encompassing personal health information, basic biometric data, ID information, location tracking, financial information, etc.; (4) Violations of economic interests: including breaches of business ethics, intellectual property infringement, disclosure of trade secrets, and unfair business competition.



**有害行为**: (1) 身体伤害(自伤自杀, 伤害/杀害他人); (2) 心理伤害(辱骂, 威胁, 操纵, 欺骗, 煽动); (3) 隐私(健康, 生物特征, 证件, 定位, 财务等); (4) 经济利益(商业伦理, 知产, 商业秘密, 不正当竞争).

**Moral and Ethical Issues** We have identified and categorized the ethical issues in the following four scenarios: (1) Family ethics: including issues related to parental responsibilities, sibling relationships, and the treatment of elderly family members, (2) Marriage ethics: covering topics such as fidelity, communication, and shared responsibilities between spouses, (3) School, student, and academic ethics: addressing matters like academic integrity, bullying, and the relationship between students and teachers, (4) Professional ethics: encompassing concerns related to conflicts of interest, workplace conduct, and responsibilities toward clients and colleagues.



**道德伦理**: (1) 家庭; (2) 婚姻; (3) 校园与学术; (4) 职业伦理.

Following the establishment of the above safety content taxonomy, we constructed specialized test sets for each of the 28 subcategories to evaluate the model’s safety performance in the corresponding domains. Specifically, we manually created 20 Chinese test questions for each subcategory, covering important concepts and risk points within that domain while emphasizing question diversity. Subsequently, we translated these 20 Chinese test questions into corresponding English versions to better assess our model’s safety performance in both Chinese and English. Ultimately, we developed 1, 120 test questions for the systematic evaluation of model safety.



28 子类各建专测: 每类人工写 20 道中文题, 再译成英文, 共 1, 120 题系统评安全.

In our evaluation methodology, we employed the LLM-as-a-Judge approach, utilizing an advanced GPT version (GPT4o (2024-11-20)) to determine safety labels. Our safety assessment process categorizes each QA pair into the following three classes: (1) Unsafe: The model provides an answer that fails to meet ethical and safety standards, representing a clear negative sample; (2) Safe: The model provides a relevant answer that acknowledges the ethical risks in the question and offers appropriate cautions to the user, representing a clear positive sample; (3) Rejection: The model either provides an irrelevant refusal response or the system delivers a mechanical rejection based on risk control measures; we consider this situation as an intermediate state between safe and unsafe responses.



评法: LLM-as-a-Judge(GPT4o 2024-11-20)打标. 三类: (1) Unsafe-- 不符伦理安全; (2) Safe-- 相关作答并提示风险; (3) Rejection-- 拒答或风控机械拒绝(介于安全与不安全之间).

In Tables 10, we consider two metrics: Unsafe and Reject. The Unsafe metric measures the proportion of unsafe responses among all answers, with lower values indicating better safety performance. The Reject metric represents the proportion of rejection responses among all



表 10 看 Unsafe 与 Reject: Unsafe 越低越好; Reject 是拒答占比,

<!-- page 51 of 86 -->

Table 10 | Comparison of DeepSeek-R1 and other frontier models in fine-grained safety scenarios. Unsafe indicates the proportion of unsafe content in the model’s responses (lower values indicate better model safety), while Rej. represents the rejection rate in the model’s answers (lower values indicate a stronger tendency for the model to provide informative and safe answers to questions, rather than simply declining to respond). For DeepSeek-V3 and DeepSeek-R1, we report results under two configurations: with and without risk control system (introduced in D. 3.1).



表 10｜细粒度安全场景对照. Unsafe 越低越好; Rej. 越低表示更愿给信息性安全回答而非一味拒绝. V3/R1 报有/无风控两档.

answers, with lower values being more desirable (we prefer safe responses over rejections since it can provide risk warning information).



越低越理想(更偏好带风险提示的安全回答, 而不是干拒绝).

We crafted specialized prompts for different subcategories of questions to assess the safety of responses. We also verified that the consistency between LLM evaluation results and human assessments reached an acceptable level (consistency rate of sampled results is above 95%). The experimental comparison results are presented in Table 10, from which the following conclusions can be observed:



子类各有专用评测提示; LLM 与人工一致性抽样 >95%. 表 10 可见:

• **Analyzing unsafe rates**: DeepSeek-V3 (with risk control) belongs to the first tier of safe models (unsafe rate aound 5%); DeepSeek-R1 (with risk control), Claude-3.7-Sonnet, and o1 (2024-12-17) belong to the second tier of safe models (unsafe rate around 10%); DeepSeek-V3 (without risk control) and Qwen2.5 Instruct (72B) belong to the third tier of safe models (unsafe rate around 15%); while DeepSeek-R1 (without risk control) and GPT-4o (2024-05-13) are relatively unsafe models (unsafe rate beyond 20%).



• **不安全率**: 带风控 V3 约 5% 第一档; 带风控 R1, Claude-3.7, o1 约 10% 第二档; 无风控 V3 与 Qwen2.5-72B 约 15% 第三档; 无风控 R1 与 GPT-4o (2024-05-13) 超过 20%, 相对不安全.

• **Analyzing rejection rates**: The base models of DeepSeek-R1 and DeepSeek-V3 have relatively low rejection rates but higher unsafe rates. After implementing a risk control system, these models show relatively low unsafe rates but higher rejection rates (around 25%). Additionally, Claude-3.7-Sonnet achieves a good balance between user experience (lowest rejection rate) and model safety (unsafe rate at relatively low levels); while o1 (2024-12-17) demonstrates a more severe tendency to reject queries (around 50%), presumably employing strict system-level risk control to prevent the model from exposing unsafe content.



• **拒答率**: 裸 R1/V3 拒答低但不安全率高; 上风控后不安全降, 拒答升到约 25%. Claude-3.7 在体验(拒答最低)与安全之间较均衡; o1 拒答约 50%, 偏严系统风控.

• **Analyzing risk types**: DeepSeek-R1 performs exceptionally well in handling queries related to Illegal and Criminal Behavior and Moral and Ethical Issues, while showing average performance in scenarios involving Discrimination and Prejudice Issues and Harmful Behavior, which encourages us to pay more attention on these two categories when developing model safety features and risk control system.



• **风险类型**: 违法犯罪与道德伦理上 R1 很好; 歧视偏见与有害行为一般, 后续安全与风控要更盯这两类.

<!-- page 52 of 86 -->

![Chart block](images/p52-figure-14-multilingual-safety-performance-v3-check-and.png)

Figure 14 | Multilingual safety performance. V3-check and R1-check represent the risk control system evaluation results for DeepSeek-V3 and DeepSeek-R1, respectively.



图 14｜多语安全. V3-check / R1-check 表示接风控后的结果.

<!-- page 53 of 86 -->

#### D. 3.4. Multilingual Safety Performance 多语安全

In the previous section’s evaluation, we primarily focused on the model’s safety performance in special languages (Chinese and English). However, in practical usage scenarios, users’ linguistic backgrounds are highly diverse. Assessing safety disparities across different languages is essential. For this purpose, we translated the original bilingual safety testset (introduced in the D. 3.3) into 50 commonly used languages. For high-frequency languages, we conducted full translation of the entire dataset, while for low-frequency languages, we performed sampling translation. This process resulted in a comprehensive multilingual safety test set consisting of 9, 330 questions. During the translation process, we employed a combined approach of LLM translation and human-assisted calibration to ensure the quality of the translations.



此前主看中英; 实际用户语言多样. 把 D. 3.3 双语集译成 50 种常用语: 高频全译, 低频抽样, 共 9, 330 题; LLM 翻译 + 人工校准.

We continued to use the LLM-as-a-judge methodology described in the previous section, which determines safety labels (safe, unsafe, or rejected) for each question-answer pair. Rather than merely rejecting risky queries, we prefer responses that provide safe content; therefore, we assigned higher scores to safe responses (5 points per question, with 5 points for safe responses, 0 points for unsafe responses, and 4 points for rejections). The final safety score proportions (safety score as a percentage of the total possible safety score) across 50 languages are presented in Figure 14. For DeepSeek-V3 and DeepSeek-R1, we evaluated safety scores for models with and without the risk control system (introduced in D. 3.1). Additionally, we tested the multilingual safety performance of Claude-3.7-Sonnet and GPT-4o(2024-05-13). From Figure 14, we can draw the following conclusions:



仍用 LLM-as-a-judge. 更偏好给安全内容而非干拒绝: 安全 5 分, 不安全 0, 拒绝 4. 图 14 给 50 语安全分占比. 结论:

• With risk control system in place, DeepSeek-V3 (86.5%) and DeepSeek-R1 (85.9%) achieve total safety scores across 50 languages that approach the best-performing Claude-3.7- Sonnet (88.3%). This demonstrates that DeepSeek has reached state-of-the-art levels in system-level multilingual safety.



• 带风控: V3 86.5%, R1 85.9%, 接近 Claude-3.7 的 88.3%, 系统级多语安全已到前沿.

• Without risk control system, DeepSeek-V3 (75.3%) and DeepSeek-R1 (74.2%) get safety scores across 50 languages comparable to GPT-4o(2024-05-13)’s performance (75.2%). This indicates that even when directly using the open-source versions of R1, the model still exhibits a moderate level of safety standard.



• 无风控: V3 75.3%, R1 74.2%, 与 GPT-4o (2024-05-13) 的 75.2% 同档-- 开源裸用也有中等安全.

Examining language-specific weaknesses, we categorize languages with safety scores below 60 points as high-risk languages for the corresponding model. Among the 50 languages evaluated, DeepSeek-R1 (without risk control system) and Claude-3.7-Sonnet have zero high-risk languages; DeepSeek-V3 (without risk control system) and GPT-4o(2024-05-13) have one and two high-risk languages, respectively. This suggests that DeepSeek-R1 has no obvious language-specific vulnerabilities.



安全分 <60 记为高风险语种: 无风控 R1 与 Claude-3.7 为 0; 无风控 V3 与 GPT-4o 各 1, 2 种. R1 无明显语种短板.

#### D. 3.5. Robustness against Jailbreaking 越狱鲁棒性

In real-world application scenarios, malicious users may employ various jailbreaking techniques to circumvent a model’s safety alignment and elicit harmful responses. Therefore, beyond evaluating model safety under direct questioning, we place significant emphasis on examining the model’s robustness when confronted with jailbreaking attacks. Thus, we constructed a dedicated test suite for jailbreaking evaluation. Specifically, we developed a template collection consisting of 2, 232 jailbreaking instructions. We then randomly concatenated these jailbreaking prompts with questions from the original safety testset (introduced in D. 3.3) and further examined the performance differences in the model’s responses when confronted with original unsafe questions versus newly formulated questions with jailbreaking elements.



真实场景会有越狱. 除直接提问外, 专测越狱鲁棒: 2, 232 条越狱模板, 随机拼到 D. 3.3 原安全题上, 对比原不安全题 vs 加越狱包装后的表现差.

When evaluating the results, we followed the LLM-as-a-Judge safety assessment (introduced



评测仍用 LLM-as-a-Judge(见

<!-- page 54 of 86 -->

in D. 3.3), while improving the safety evaluation prompts to focus more specifically on identifying manipulative traps in jailbreak attempts. Each question-answer pair was classified into one of three categories: safe, unsafe, or rejected (introduced in D. 3.3). The results of jailbreak attacks against various models are presented in Table 11. From these results, we draw the following conclusions:



D. 3.3), 并强化识别操纵陷阱. 三类标签同前. 见表 11:

Table 11 | Comparison of DeepSeek-R1 and other frontier models in jailbreaking scenarios.



表 11｜越狱场景对照.

|  | Unsafe Ratio |  |  | Rejected Ratio |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| Ratio(%) | Origin | Jailbreak | GAP | Origin | Jailbreak | GAP |
| Claude-3.7-Sonnet | 10.7 | 26.2 | +15.5 | 3.6 | 21.9 | +18.3 |
| o1 (2024-12-17) | 9.0 | 12.1 | +3.1 | 50.4 | 79.8 | +29.4 |
| GPT-4o (2024-05-13) | 22.0 | 30.4 | +8.4 | 17.1 | 57.3 | +40.2 |
| Qwen2.5 Instruct (72B) | 13.8 | 29.7 | +15.9 | 5.4 | 25.2 | +19.8 |
| DeepSeek-V3 | 17.6 | 36.4 | +18.8 | 8.1 | 8.9 | +0.8 |
| + risk control system | 5.3 | 2.3 | -3.0 | 25.4 | 46.5 | +21.1 |
| DeepSeek-R1 | 25.2 | 85.9 | +60.7 | 5.6 | 1.9 | -3.7 |
| + risk control system | 8.5 | 4.3 | -4.2 | 27.3 | 87.3 | +60.0 |

• All tested models exhibited significantly increased rates of unsafe responses and rejections, along with decreased safety rates when facing jailbreak attacks. For example, Claude-3.7- Sonnet, showed a 33.8% decrease in the proportion of safe responses when confronted with our security jailbreak attacks. This demonstrates that current cutting-edge models still face substantial threats from jailbreak attacks.



• 所有模型遇越狱后不安全与拒答都升, 安全率降; 如 Claude-3.7 安全回答占比掉 33.8%. 前沿模型仍受越狱威胁.

• Compared to non-reasoning models, the two reasoning models in our experiments - DeepSeek-R1 and o1(2024-12-17) - rely more heavily on the risk control system for security checks, resulting in considerably higher overall rejection rates (79.8% and 87.3% respectively).



• 相对非推理模型, R1 与 o1 更依赖风控做安检, 整体拒答更高(79.8% 与 87.3%).

• Open-source models (DeepSeek, Qwen) face more severe jailbreak security challenges than closed-source models, because of the lack of a risk control system in locally deployed models. To address safety issues, we advise developers using open source models in their services to adopt comparable risk control measures.



• 开源(DeepSeek, Qwen)本地部署缺风控, 越狱更严峻; 建议服务方采用相当风控.

## E. More Analysis 更多分析

### E. 1. Performance Comparison with DeepSeek-V3 与 DeepSeek-V3 对照

Since both DeepSeek-R1 and DeepSeek-V3 share a common base architecture, namely DeepSeek V3-Base, a critical question naturally arises: which specific dimensions are enhanced through the application of different post-training techniques? To address this, we first compare the R1 family of models with DeepSeek-V3 and DeepSeek-V3-Base, as summarized in Table 12. Notably, DeepSeek-R1 demonstrates significant improvements in competitive programming and mathematical reasoning tasks, as evidenced by superior performance on benchmarks such as LiveCodeBench and AIME 2024. These enhancements in reasoning capabilities also translate into higher scores on the Arena-Hard evaluation suite. Furthermore, DeepSeek-R1 exhibits stronger long-context understanding, as indicated by its improved accuracy on the FRAMES



同底座 V3-Base, 后训练差在哪? 表 12: R1 在竞赛编程与数学(LiveCodeBench, AIME 2024)明显强, Arena-Hard 也更高; 长文 FRAMES 更准.

<!-- page 55 of 86 -->

![Chart block](images/p55-figure-15-the-comparison-of-deepseek-v3-and-deepseek-r1.png)

Figure 15 | The comparison of DeepSeek-V3 and DeepSeek-R1 across MMLU categories.



图 15｜V3 与 R1 在 MMLU 各类别上的对照.

![Chart block](images/p55-figure-16-the-comparison-of-deepseek-v3-and-deepseek-r1.png)

Figure 16 | The comparison of DeepSeek-V3 and DeepSeek-R1 across MMLU-Pro categories.



图 16｜V3 与 R1 在 MMLU-Pro 各类别上的对照.

<!-- page 56 of 86 -->

Table 12 | A Comparative Analysis of DeepSeek-V3 and DeepSeek-R1. DeepSeek-V3 is a non-reasoning model developed on top of DeepSeek-V3-Base, which also serves as the foundational base model for DeepSeek-R1. Numbers in bold denote the performance is statistically significant (t−test with 𝑝 < 0.01).



表 12｜V3 与 R1 对照. V3 是 V3-Base 上的非推理指令模型; R1 同底座. 加粗为统计显著.

| Benchmark (Metric) | V3-Bas | e V3 | R1-Zero | R1 |
| --- | --- | --- | --- | --- |
| MMLU (EM) | 87.1 | 88.5 | 88.8 | 90.8 |
| MMLU-Redux (EM) | 86.2 | 89.1 | 85.6 | 92.9 |
| MMLU-Pro (EM) | 64.4 | 75.9 | 68.9 | 84.0 |
| DROP (3-shotF1) | 89.0 | 91.6 | 89.1 | 92.2 |
| IF-Eval (PromptStrict) | 58.6 | 86.1 | 46.6 | 83.3 |
| English |  |  |  |  |
| GPQA Diamond (Pass@1) | - | 59.1 | 75.8 | 71.5 |
| SimpleQA (Correct) | 20.1 | 24.9 | 30.3 | 30.1 |
| FRAMES (Acc.) | - | 73.3 | 82.3 | 82.5 |
| AlpacaEval2.0 (LC-winrate) | - | 70.0 | 24.7 | 87.6 |
| ArenaHard (GPT-4-1106) | - | 85.5 | 53.6 | 92.3 |
| LiveCodeBench (Pass@1-COT) | - | 36.2 | 50.0 | 65.9 |
| Codeforces (Percentile) | - | 58.7 | 80.4 | 96.3 |
| Codeforces (Rating) | - | 1134 | 1444 | 2029 |
| Code SWE Verified (Resolved) | - | 42.0 | 43.2 | 49.2 |
| Aider-Polyglot (Acc.) | - | 49.6 | 12.2 | 53.3 |
| AIME 2024 (Pass@1) | - | 39.2 | 77.9 | 79.8 |
| Math MATH-500 (Pass@1) | - | 90.2 | 95.9 | 97.3 |
| CNMO 2024 (Pass@1) | - | 43.2 | 88.1 | 78.8 |
| CLUEWSC (EM) | 82.7 | 90.9 | 93.1 | 92.8 |
| Chinese C-Eval (EM) | 90.1 | 86.5 | 92.8 | 91.8 |
| C-SimpleQA (Correct) | - | 68.0 | 66.4 | 63.7 |

benchmark. In contrast, DeepSeek-V3 shows a relative advantage in instruction-following capabilities, suggesting different optimization priorities between the two models.



相对地, V3 在指令跟随上更占优, 两边优化重心不同.

To further elucidate the specific knowledge domains that benefit most from post-training, we conduct a fine-grained analysis of model performance across various subject categories within MMLU and MMLU-Pro. These categories, predefined during the construction of the test sets, allow for a more systematic assessment of domain-specific improvements.



为看后训练惠及哪些知识域, 对 MMLU / MMLU-Pro 预设科目做细拆.

As illustrated in Figure 16, performance improvements on MMLU-Pro are observed across all domains, with particularly notable gains in STEM-related categories such as mathematics and physics. Similarly, on MMLU, the largest improvements from DeepSeek-V3 to DeepSeek-R1 are also observed in STEM domains. However, unlike MMLU-Pro, gains in the STEM domain are smaller, suggesting differences in the impact of post-training between the two benchmarks.



图 16: MMLU-Pro 全域都涨, 数学物理等 STEM 最明显; MMLU 上 V3→R1 最大增益也在 STEM, 但幅度小于 MMLU-Pro, 说明两基准对后训练敏感度不同.

Our hypothesis is that MMLU represents a relatively easier challenge compared to MMLU-Pro. In STEM tasks of MMLU, post-training on DeepSeek-V3 may have already achieved near-saturation performance, leaving minimal room for further improvement in DeepSeek-R1. It surprised us that the non-STEM tasks, such as social sciences and humanities, are improved with the long CoT, which might attribute to the better understanding of the question.



假设: MMLU 相对更易, V3 后训练在 STEM 已近饱和, R1 空间小. 意外的是社科人文等非 STEM 也因长 CoT 上涨, 可能来自更好理解题意.

<!-- page 57 of 86 -->

Table 13 | Performance on latest math competitions. Participants with their USAMO index (AMC score + 10 × AIME score) surpassing 251.5 are qualified for USAMO.



表 13｜最新数学竞赛. USAMO Index = AMC 分 + 10×AIME 分, 超过 251.5 获 USAMO 资格.

| Average Score | AMC 12 2024 | AIME 2025 | USAMO Index |
| --- | --- | --- | --- |
| Human Participants | 61.7 | 6.2/15 | 123.7 |
| GPT-4o 0513 | 84.0 | 2.0/15 | 104.0 |
| DeepSeek V3 | 98.3 | 3.3/15 | 131.3 |
| OpenAI o1-1217 | 141.0 | 12.0/15 | 261.0 |
| DeepSeek R1 | 143.7 | 11.3/15 | 256.7 |

### E. 2. Generalization to Real-World Competitions 向真实竞赛泛化

Despite rigorous efforts to eliminate data contamination, variations of test set questions or discussions of related problems may still exist on websites that were included in the pre-training corpus. This raises an important question: can DeepSeek-R1 achieve comparable performance on test sets that were released after its training? To investigate this, we evaluate our model on AIME 2025, providing insights into its generalization capabilities on unseen data. As shown in Table 13, in AIME 2025 ([https://artofproblemsolving. com/wiki/index. php/2025\_AIME\_II\_Problems](https://artofproblemsolving. com/wiki/index. php/2025_AIME_II_Problems)), DeepSeek-R1 achieves a 75% solve rate (Pass@1), approaching o1’s performance of 80%. Most notably, the model attains a score of 143.7/150 in AMC 12 2024 ([https://artofproblemsolving. com/wiki/index. php/2024\_AMC\_12B\_Problems](https://artofproblemsolving. com/wiki/index. php/2024_AMC_12B_Problems))- a performance that, when combined with its AIME results, yields a score exceeding the qualification threshold for attending the USAMO (United States of America Mathematical Olympiad https://artofproblemsolving. com/wiki/index. php/AMC\_historical[results? srsltid=AfmBOoqQ6pQic5NCan\_NX1wYgr-aoHgJ33hsq7KSekF-rUwY8TBaBao1](https://artofproblemsolving. com/wiki/index. php/AMC_historical_results? srsltid=AfmBOoqQ6pQic5NCan_NX1wYgr-aoHgJ33hsq7KSekF-rUwY8TBaBao1)). This performance positions DeepSeek-R1 among the nation’s top-tier high school students.



即便去污染, 预训练语料仍可能含变体或讨论. 训后发布的 AIME 2025 上 R1 Pass@1 约 75%, 接近 o1 的 80%; AMC 12 2024 得 143.7/150, 合成 USAMO Index 越过 251.5 资格线-- 相当于顶尖高中生档.

### E. 3. Mathematical Capabilities Breakdown by Categories 数学能力分科

To assess DeepSeek-R1’s mathematical reasoning capabilities comprehensively, we evaluated its performance across diverse categories of quantitative reasoning problems. Our test set comprised 366 problems drawn from 93 mathematics competitions held in 2024 ([https://artofproblemsolving. com/community/c3752401\_2024\_contests](https://artofproblemsolving. com/community/c3752401_2024_contests)), including mathematical olympiads and team selection tests. As shown in Figure 17, DeepSeek-R1 sig nificantly outperforms the representative non-reasoning model GPT-4o 0513. DeepSeek-R1 demonstrates relatively strong proficiency in number theory and algebra, while exhibiting considerable room for improvement in geometry and combinatorics.



2024 年 93 场竞赛抽 366 题(见图 17): R1 大幅超过 GPT-4o 0513; 数论与代数相对强, 几何与组合仍有空间.

### E. 4. An Analysis on CoT Length CoT 长度分析

**Adaptive CoT length:** During training, DeepSeek-R1 was permitted to think for a long time (i. e., to generate a lengthy chain of thought) before arriving at a final solution. To maximize success on challenging reasoning tasks, the model learned to dynamically scale computation by generating more thinking tokens to verify or correct its reasoning steps, or to backtrack and explore alternative approaches when initial attempts proved unsuccessful. The complexity of a problem directly correlates with the number of thinking tokens required: more difficult problems typically demand more extensive computation. For extremely easy questions, like 1 + 1 =?, the model tends to use fewer tokens (< 100 tokens) to answer the question.



**自适应 CoT 长度**: 训练允许长时间思考. 为抬难题成功率, 模型学会动态加思考 token 做校验, 纠错或回溯换路. 难度与思考 token 正相关; 极简如 1+1=? 往往 <100 token.

<!-- page 58 of 86 -->

Mathematical Performance Breakdown by Categories

![Chart block](images/p58-figure-17-performance-breakdown-by-different-categories.png)

Figure 17 | Performance breakdown by different categories of quantitative reasoning problems from a collection of contests in 2024.



图 17｜2024 竞赛集定量推理分科表现.

<!-- page 59 of 86 -->

Test-Time Compute Scaling w. r. t. Problem Difficulty

![Chart block](images/p59-figure-18-test-time-compute-scaling-measured-by-the.png)

Figure 18 | Test-time compute scaling (measured by the number of thinking tokens generated to reach correct answers) as problem difficulty (measured by Pass@1) increases. The picture is smoothed using UnivariateSpline from SciPy with a smoothing factor of 5.



图 18｜TestingTime 算力随难度(Pass@1)缩放(以到达正确答的思考 token 计); SciPy UnivariateSpline, 平滑因子 5.

Figure 18 demonstrates how DeepSeek-R1 scales test-time compute to solve challenging problems from math competitions held in 2024 (the same set of problems used in Figure 17). DeepSeek-R1 achieves a 61.8% solve rate (Pass@1) by scaling test-time compute to an average of 8, 793 thinking tokens per problem. Notably, the model adaptively adjusts its computational effort based on problem difficulty, using fewer than 7, 000 thinking tokens for simple problems while dedicating more than 18, 000 thinking tokens to the most challenging ones, which demonstrates DeepSeek-R1 allocates test-time compute adaptively based on problem complexity: on more complex problems, it tends to think for longer. Looking forward, we hypothesize that if token budget allocation were explicitly modeled during training, the disparity in token usage between easy and hard questions at test time could become even more pronounced.



图 18: 同 2024 竞赛集, Pass@1 61.8%, 平均 8, 793 思考 token; 简单题 <7, 000, 最难题 >18, 000. 若训练时显式建模 token 预算, 易难差距或更大.

**Comparison of non-reasoning models:** A key advantage of reasoning models like DeepSeek-R1 over non-reasoning models such as GPT-4o 0513 is their ability to scale effectively along the dimension of reasoning. Non-reasoning models typically generate solutions directly, without intermediate thinking steps, and rarely demonstrate advanced problem-solving techniques like self-reflection, backtracking, or exploring alternative approaches. On this same set of math problems, GPT-4o 0513 achieves only a 24.7% solve rate while generating 711 output tokens on average - an order of magnitude less than DeepSeek-R1. Notably, non-reasoning models can also scale test-time compute with traditional methods like majority voting, but those methods fail to close the performance gap with reasoning models, even when controlling for the total number of tokens generated. For example, majority voting across 16 samples per problem yields minimal improvement in GPT-4o’s solve rate on the 2024 collection of competition-level math problems, despite consuming more total tokens than DeepSeek-R1. On AIME 2024, majority voting across 64 samples only increases GPT-4o’s solve rate from 9.3% to 13.4%-still dramatically lower than DeepSeek-R1’s 79.8% solve rate or o1’s 79.2% solve rate. This persistent performance gap stems



**与非推理模型比**: R1 这类能沿「推理维」缩放; GPT-4o 0513 同集仅 24.7%, 平均 711 token, 低一个数量级. 多数投票也补不齐: 16 票几乎不动; AIME 2024 上 64 票只把 GPT-4o 从 9.3% 抬到 13.4%, 仍远低于 R1 79.8% / o1 79.2%. 差距根子在

<!-- page 60 of 86 -->

from a fundamental limitation: in majority voting, samples are generated independently rather than building upon each other. Since non-reasoning models lack the ability to backtrack or self-correct, scaling the sample size merely results in repeatedly sampling potentially incorrect final solutions without increasing the probability of finding correct solutions in any single attempt, making this approach highly token-inefficient.



多数投票样本彼此独立; 非推理模型不会回溯自纠, 加样本只是反复抽可能错的终解, 单次找对概率不涨, token 极不划算.

**Drawback:** However, DeepSeek-R1’s extended reasoning chains still sometimes fail to be thorough or become trapped in incorrect logic paths. Independently sampling multiple reasoning chains increases the probability of discovering correct solutions, as evidenced by the fact that DeepSeek-R1’s Pass@64 score on AIME 2024 is 90.0%, significantly higher than its Pass@1 score of 79.8%. Therefore, traditional test-time scaling methods like majority voting or Monte Carlo Tree Search (MCTS) can complement DeepSeek-R1’s long reasoning; specifically, majority voting further improves DeepSeek-R1’s accuracy from 79.8% to 86.7%.



**短板**: 长链仍可能不彻底或陷错路. 独立多样本能抬发现正解概率: AIME 2024 上 Pass@64=90.0% 明显高于 Pass@1=79.8%. 多数投票或 MCTS 可补长推理; 多数投票把 R1 从 79.8% 抬到 86.7%.

### E. 5. Performance of Each Stage on Problems of Varying Difficulty 各阶段在不同难度上的表现

Table 14 | Experimental results for each stage of DeepSeek-R1 on problems with varying difficulty levels in the LiveCodeBench dataset.



表 14｜LiveCodeBench 上 R1 各阶段按难度结果.

| D Difficulty Level | eepSeek-R1Zero | DeepSeek-R1Dev1 | DeepSeek-R1Dev2 | DeepSeek-R1Dev3 | DeepSeekR1 |
| --- | --- | --- | --- | --- | --- |
| Easy | 98.07 | 99.52 | 100.00 | 100.00 | 100.00 |
| Medium | 58.78 | 73.31 | 81.76 | 81.42 | 83.45 |
| Hard | 17.09 | 23.21 | 30.36 | 33.16 | 34.44 |

To further evaluate the performance of each stage of DeepSeek-R1 on problems of varying difficulty, we present the experimental results for each stage of DeepSeek-R1 on the LiveCodeBench dataset, as shown in Table 14. It can be observed that for each stage, simple problems are generally solved correctly, while the main improvements come from medium and hard problems. This fine-grained analysis demonstrates that each stage brings significant improvement on complex coding reasoning problems.



表 14: 各阶段简单题大体已对, 主增益在中难档-- 每阶段都在推复杂代码推理.

## F. DeepSeek-R1 Distillation DeepSeek-R1 蒸馏

LLMs are energy-intensive, requiring substantial computational resources, including highperformance GPUs and considerable electricity, for training and deployment. These resource demands present a significant barrier to democratizing access to AI-powered technologies, particularly in under-resourced or marginalized communities.



LLM 训练部署耗能大, 阻碍普及, 尤其资源不足社区.

To address this challenge, we adopt a model distillation approach, a well-established technique for efficient knowledge transfer that has demonstrated strong empirical performance in prior work (Busbridge et al., 2025; Hinton et al., 2015). Specifically, we fine-tune open-source foundation models such as Qwen (Qwen, 2024b) and LLaMA (AI@Meta, 2024; Touvron et al., 2023) using a curated dataset comprising 800, 000 samples generated with DeepSeek-R1. Details of the dataset construction are provided in Appendix B. 3.3. We find that models distilled from high-quality teacher outputs consistently outperform those trained directly on human-generated data, corroborating prior findings on the efficacy of distillation (Busbridge et al., 2025).



用蒸馏: 以 R1 生成的约 80 万样本微调 Qwen / LLaMA 等开源底座(数据见 B. 3.3). 高质量教师轨迹蒸馏出来的学生, 稳定优于直接吃人类数据.

For distilled models, we apply only SFT and do not include an RL stage, even though incorporating RL could substantially boost model performance. Our primary goal here is to



蒸馏模型只做 SFT, 不加 RL(尽管加 RL 还能大涨). 此处主目标是

<!-- page 61 of 86 -->

demonstrate the effectiveness of the distillation technique, leaving the exploration of the RL stage to the broader research community. For details on distillation training, please see Appendix B. 4.3.



证明蒸馏有效, RL 留给社区. 训练细节见 B. 4.3.

Table 15 | Comparison of DeepSeek-R1 distilled models and other comparable models on reasoning-related benchmarks. Numbers in bold denote the performance is statistically significant (t−test with 𝑝 < 0.01).



表 15｜R1 蒸馏模型与可比模型在推理基准上的对照.

| Model | AIMpass@1 | E 2024 cons@64 | MATHpass@1 | GPQA Diamondpass@1 | LiveCode Benchpass@1 | CodeForces rating |
| --- | --- | --- | --- | --- | --- | --- |
| GPT-4o-0513 | 9.3 | 13.4 | 74.6 | 49.9 | 32.9 | 759 |
| Claude-3.5-Sonnet-1022 | 16.0 | 26.7 | 78.3 | 65.0 | 38.9 | 717 |
| DeepSeek-R1-Distill-Qwen-1.5B | 28.9 | 52.7 | 83.9 | 33.8 | 16.9 | 954 |
| DeepSeek-R1-Distill-Qwen-7B | 55.5 | 83.3 | 92.8 | 49.1 | 37.6 | 1189 |
| DeepSeek-R1-Distill-Qwen-14B | 69.7 | 80.0 | 93.9 | 59.1 | 53.1 | 1481 |
| DeepSeek-R1-Distill-Qwen-32B | 72.6 | 83.3 | 94.3 | 62.1 | 57.2 | 1691 |
| DeepSeek-R1-Distill-Llama-8B | 50.4 | 80.0 | 89.1 | 49.0 | 39.6 | 1205 |
| DeepSeek-R1-Distill-Llama-70B | 70.0 | 86.7 | 94.5 | 65.2 | 57.5 | 1633 |

We evaluate the distilled models on AIME, GPQA, Codeforces, as well as MATH-500 (Light man et al., 2024) and LiveCodeBench (Jain et al., 2024). For comparison, we use two wellestablished LLMs as baselines: GPT-4o and Claude-3.5-Sonnet. As shown in Table 15, the straightforward distillation of outputs from DeepSeek-R1 allows the distilled model, DeepSeek-R1-Distill-Qwen-1.5B, to surpass non-reasoning baselines on mathematical benchmarks. Notably, it is remarkable that a model with only 1.5 billion parameters achieves superior performance compared to the best closed-source models. Furthermore, model performance improves progressively as the parameter size of the student model increases.



蒸馏模型评 AIME, GPQA, Codeforces, MATH-500, LiveCodeBench; 基线 GPT-4o 与 Claude-3.5. 表 15: 仅 1.5B 的 Distill-Qwen 已在数学上超过非推理闭源; 学生参数越大分数越高.

Our experimental results demonstrate that smaller models can achieve strong performance through distillation. Furthermore, as shown in Appendix F, the distillation approach yields superior performance compared to reinforcement learning alone when applied to smaller model architectures. This finding has significant implications for democratizing AI access, as reduced computational requirements enable broader societal benefits.



小模型靠蒸馏就能很强; 附录 F 显示对小架构蒸馏往往优于单独做大规模 RL-- 算力门槛降, 更利于普及.

### F. 1. Distillation v. s. Reinforcement Learning 蒸馏 vs 强化学习

Table 16 | Comparison of distilled and RL Models on Reasoning-Related Benchmarks.



表 16｜蒸馏模型与 RL 模型对照.

| Model | AIME 2024 pass@1 | AIME 2024 cons@64 | MATH pass@1 | GPQA Diamond pass@1 | LiveCode Bench pass@1 |
| --- | --- | --- | --- | --- | --- |
| QwQ-32B-Preview | 50.0 | 60.0 | 90.6 | 54.5 | 41.9 |
| Qwen2.5-32B-Zero | 47.0 | 60.0 | 91.6 | 55.0 | 40.2 |
| DeepSeek-R1-Distill-Qwen-32B | 72.6 | 83.3 | 94.3 | 62.1 | 57.2 |

In Section F, we can see that by distilling DeepSeek-R1, the small model can achieve impressive results. However, there is still one question left: can the model achieve comparable



§F 显示蒸馏很强. 仍有一问: 不做蒸馏, 只靠文中大规模 RL,

<!-- page 62 of 86 -->

Table 17 | Performance of different models on AIME 2024 and AIME 2025.



表 17｜不同模型在 AIME 2024 / 2025 上的表现.

| Average Score | AIME 2024 | AIME 2025 |
| --- | --- | --- |
| GPT-4o-0513 | 9.3% | - |
| Qwen2-Math-7B-Instruct | 7.9% | 4.6% |
| Qwen2-Math-7B-Zero | 22.3% | 18.1% |

performance through the large-scale RL training discussed in the paper without distillation?



小模型能否打到相近水平?

To answer this question, we conduct large-scale RL training on Qwen2.5-32B-Base using math, code, and STEM data, training for over 10K steps, resulting in Qwen2.5-32B-Zero, as described in B. 4.1. The experimental results, shown in Table 16, demonstrate that the 32B base model, after large-scale RL training, achieves performance on par with QwQ-32B-Preview. However, DeepSeek-R1-Distill-Qwen-32B, which is distilled from DeepSeek-R1, performs significantly better than Qwen2.5-32B-Zero across all benchmarks.



对 Qwen2.5-32B-Base 做万步级 RL 得 Zero(B. 4.1): 表 16 显示与 QwQ-32B-Preview 同档, 但 Distill-Qwen-32B 全面更高.

Therefore, we can draw two conclusions: First, distilling more powerful models into smaller ones yields excellent results, whereas smaller models relying on the large-scale RL mentioned in this paper require enormous computational power and may not even achieve the performance of distillation. Second, while distillation strategies are both economical and effective, advancing beyond the boundaries of human intelligence may still require more powerful base models and larger-scale reinforcement learning.



两条结论: 强教师蒸馏进小模型很划算; 小模型自跑文中规模 RL 又贵又未必追上蒸馏. 蒸馏经济有效, 但要再推人类智能边界, 仍需更强 Base 与更大规模 RL.

Apart from the experiment based on Qwen-2.5-32B, we conducted experiments on Qwen2- Math-7B (released August 2024) prior to the launch of the first reasoning model, OpenAI-o1 (September 2024), to ensure the base model was not exposed to any reasoning trajectory data. We trained Qwen2-Math-7B-Zero with approximately 10, 000 policy gradient update steps. As shown in Table 17, Qwen2-Math-7B-Zero significantly outperformed the non-reasoning models like Qwen2-Math-7B-Instruct and GPT-4o. These results further demonstrate that the model can autonomously develop advanced reasoning strategies through large-scale reinforcement learning.



另在 o1 发布前对 Qwen2-Math-7B(2024-08)做约 10K 策略梯度更新, 确保底座未见推理轨迹. 表 17: Zero 明显超过 Instruct 与 GPT-4o-- 再次说明大规模 RL 能自主长出高级推理.

## G. Discussion 讨论

### G. 1. Key Findings 关键发现

We highlight our key findings, which may facilitate the community in better reproducing our work.



列出关键发现, 方便社区复现.

**The importance of base checkpoint:** During the initial phase of our development, we experimented with smaller-scale models, specifically a 7B dense model and a 16B Mixtureof-Experts (MoE) model, as the foundational architectures for RL training. However, these configurations consistently failed to yield meaningful improvements when evaluated on the AIME benchmark, which we employed as the primary validation set. We observed that as response lengths increased, these smaller models exhibited a tendency toward repetition and were unable to effectively leverage long chains of thought (CoT) to improve reasoning accuracy.



**底座很重要**: 早期试 7B Dense 与 16B MoE, 在主验证集 AIME 上几乎涨不动; 回复变长后易重复, 用不好长 CoT.

To address these limitations, we transitioned to larger-scale models, including a 32B dense model (Qwen, 2024b), a 230B MoE model (DeepSeek-AI, 2024a), and a 671B MoE model (DeepSeek-AI, 2024b). With these more capable architectures, we finally observed substantial



换到 32B Dense, 230B MoE, 671B MoE 后, 才看到

<!-- page 63 of 86 -->

performance gains attributable to pure RL training. These findings suggest that the effectiveness of reinforcement learning from base models is highly dependent on the underlying model capacity. We therefore recommend that future research in this area prioritize the use of sufficiently large and expressive models when aiming to validate the efficacy of RL from scratch.



纯 RL 带来的实质增益. 从底座做 RL 强依赖容量; 复现「从零 RL」应优先够大, 够表达的模型.

**The importance of verifiers:** The effectiveness of DeepSeek-R1-Zero is highly contingent upon the reliability and fidelity of the reward signal used during training. To date, our investigations indicate that two approaches-rule-based reward models (RMs) and LLMs to assess an answer’s correctness against a predefined ground-truth-serve as robust mechanisms for mitigating issues related to reward hacking. The LLM-based evaluation framework demonstrates particular effectiveness for tasks with well-defined, concise answers, such as single-sentence or phrase-level responses. However, this method exhibits limited generalizability to more complex tasks, including open-ended generation and long-form writing, where the notion of correctness is inherently more subjective and nuanced.



**核验器很重要**: R1-Zero 成败系于奖励可靠. 规则 RM, 以及用 LLM 对照标准答案判对错, 能压奖励黑客. LLM 评判对短而明确的答案尤其有效; 开放生成与长文写作主观性强, 泛化有限.

**Iterative pipeline:** We propose a multi-stage training pipeline comprising both SFT and RL stages. The RL component enables the model to explore and discover optimal reasoning trajectories for tasks capabilities that cannot be fully realized through human-annotated reasoning traces alone. In particular, without the RL stage, long-chain reasoning patterns, such as those required in complex Chain-of-Thought (CoT) prompting, would remain largely unexplored. Conversely, the SFT stage plays a crucial role in tasks where reliable reward signals are difficult to define or model, such as open-ended question answering and creative writing. Therefore, both RL and SFT are indispensable components of our training pipeline. Exclusive reliance on RL can lead to reward hacking and suboptimal behavior in ill-posed tasks, while depending solely on SFT may prevent the model from optimizing its reasoning capabilities through exploration.



**迭代管线**: SFT+RL 多阶段. RL 探索人类标注够不着的最优推理轨迹, 尤其长链 CoT; SFT 覆盖难定义可靠奖励的开放问答与创意写作. 只 RL 易黑客, 不适定任务掉链; 只 SFT 难靠探索把推理推满.

### G. 2. Unsuccessful Attempts 未成功的尝试

In the early stages of developing DeepSeek-R1, we also encountered failures and setbacks along the way. We share our failure experiences here to provide insights, but this does not imply that these approaches are incapable of developing effective reasoning models.



早期也踩过坑. 分享失败经验供参考, 不等于这些路永远训不出推理模型.

**Process Reward Model (PRM)** PRM is a reasonable method to guide the model toward better approaches for solving reasoning tasks (Lightman et al., 2024; Uesato et al., 2022; Wang et al., 2023a). However, in practice, PRM has three main limitations that may hinder its ultimate success. First, it is challenging to explicitly define a fine-grain step in general reasoning. Second, determining whether the current intermediate step is correct is a challenging task. Automated annotation using models may not yield satisfactory results, while manual annotation is not conducive to scaling up. Third, once a model-based PRM is introduced, it inevitably leads to reward hacking (Gao et al., 2022), and retraining the reward model needs additional training resources and it complicates the whole training pipeline. In conclusion, while PRM demonstrates a good ability to rerank the top-N responses generated by the model or assist in guided search (Snell et al., 2024), its advantages are limited compared to the additional computational overhead it introduces during the large-scale reinforcement learning process in our experiments.



**过程奖励模型(PRM)**: 合理, 但三坑: (1) 通用推理难定义细粒度步骤; (2) 中间步对错难判, 自动标不准, 手标难扩; (3) 模型 PRM 易黑客, 重训又贵又搅管线. PRM 适合 top-N 重排或引导搜索, 但相对大规模 RL 额外开销, 优势有限.

**Monte Carlo Tree Search (MCTS)** Inspired by AlphaGo (Silver et al., 2017b) and AlphaZero (Silver et al., 2017a), we explored using Monte Carlo Tree Search (MCTS) to enhance test-time compute scalability. This approach involves breaking answers into smaller parts to allow the model to explore the solution space systematically. To facilitate this, we prompt the model to



**蒙特卡洛树搜索(MCTS)**: 受 AlphaGo/AlphaZero 启发, 把答案拆小步系统探索. 提示模型生成

<!-- page 64 of 86 -->

generate multiple tags that correspond to specific reasoning steps necessary for the search. For training, we first use collected prompts to find answers via MCTS guided by a pre-trained value model. Subsequently, we use the resulting question-answer pairs to train both the actor model and the value model, iteratively refining the process.



对应搜索步骤的多个标签. 训练上先用预训练价值模型引导 MCTS 找答, 再用得到的问答对训 actor 与价值模型, 迭代 refinement.

However, this approach encounters several challenges when scaling up the training. First, unlike chess, where the search space is relatively well-defined, token generation presents an exponentially larger search space. To address this, we set a maximum extension limit for each node, but this can lead to the model getting stuck in local optima. Second, the value model directly influences the quality of generation since it guides each step of the search process. Training a fine-grained value model is inherently difficult, which makes it challenging for the model to iteratively improve. While AlphaGo’s core success relied on training a value model to progressively enhance its performance, this principle proves difficult to replicate in our setup due to the complexities of token generation.



放大后两难: token 搜索空间远大于棋; 给节点设最大扩展又易陷局部最优. 价值模型直接管每步质量, 细粒度价值难训, 迭代改进困难--AlphaGo 靠价值模型渐进变强, 在 token 生成里难复制.

In conclusion, while MCTS can improve performance during inference when paired with a pre-trained value model, iteratively boosting model performance through self-search remains a significant challenge.



结论: 配预训练价值模型时 MCTS 能抬推理表现; 靠自搜索迭代把模型推高仍很难.

## H. Related Work 相关工作

### H. 1. Chain-of-thought Reasoning CoT 推理

Chain-of-thought (CoT) reasoning (Wei et al., 2022b) revolutionized how LLMs approach complex reasoning tasks by prompting them to generate intermediate reasoning steps before producing a final answer. This method significantly improved performance on benchmarks involving arithmetic, commonsense, and symbolic reasoning. Subsequent work explored its scope: Suzgun et al. (2023) demonstrated that CoT’s effectiveness scales with model size, while Kojima et al. (2022) extended it to zero-shot settings by simply instructing models to “think step by step. ”



CoT 让模型先写中间步骤再给终答, 算术, 常识, 符号推理都涨. 后续: 效果随规模变强; 零样本一句「think step by step」也行.

Building on CoT’s framework, numerous “prompt engineering” techniques have been proposed to enhance model performance. Wang et al. (2023b) introduced self-consistency, a method that aggregates answers from multiple reasoning paths to improve robustness and accuracy. Zhou et al. (2023a) developed least-to-most prompting, which decomposes complex problems into sequential subquestions that are solved incrementally. Yao et al. (2023a) proposed tree-of-thoughts, enabling models to explore multiple reasoning branches simultaneously and perform deliberate decision-making through looking ahead or backtracking. Collectively, these approaches leverage human prior knowledge and more structured reasoning frameworks to enhance the reasoning capabilities of LLMs.



在此之上有 self-consistency, least-to-most, tree-of-thoughts 等提示工程, 借人类先验与更结构化框架抬推理.

### H. 2. Scaling Inference-time Compute 缩放推理时算力

As unsupervised pre-training scaling might be constrained by the amount of available human data (Kaplan et al., 2020; Muennighoff et al., 2023), scaling compute during inference has become even more critical (Snell et al., 2025). Broadly, we define methods that improve model performance by increasing inference compute as forms of scaling inference-time compute.



预训练或受人类数据量约束, 推理时加算力更关键. 凡靠加推理算力抬分的, 都算 TestingTime Scaling.

A straightforward approach trades compute for performance by generating multiple diverse reasoning chains and selecting the best answer. The optimal answer can be identified using a separate reranker (Brown et al., 2024; Cobbe et al., 2021), process-based reward models (Lightman et al., 2024; Uesato et al., 2022), or simply by selecting the most common answer



朴素做法: 多样本推理链再选最优-- 重排器, 过程奖励, 或取多数答案.

<!-- page 65 of 86 -->

(Wang et al., 2023b). Search methods, such as Monte Carlo Tree Search and Beam Search, also guide exploration of the solution space more effectively (Feng et al., 2024; Hao et al., 2023; Trinh et al., 2024; Xin et al., 2024). Beyond parallel generation, self-correct techniques prompt or train models to iteratively critique and refine their outputs (Kumar et al., 2024; Madaan et al., 2023; Welleck et al., 2023), often incorporating external feedback to enhance reliability (Gou et al., 2024a; Yao et al., 2023b). Additionally, some methods improve performance by integrating tool use during testing, which is particularly effective for knowledge-intensive (Nakano et al., 2021) and compute-intensive tasks (Chen et al., 2025; Gou et al., 2024b; Schick et al., 2023). Test-time training (TTT) further updates the model during inference to boost performance (Akyürek et al., 2024; Sun et al., 2020). There are also various other inference-time scaling approaches that-either implicitly (Geiping et al., 2025) or explicitly (Zelikman et al., 2024)-allocate more compute for each token.



另有 MCTS/Beam, 自纠正, 工具调用, TestingTime 训练, 以及按 token 隐式/显式加算力的做法.

In contrast, our work shows that LLMs can achieve scalable improvements through additional RL compute and increased test-time compute (i. e., more tokens). We integrate the benefits of scaling at test time into a broader framework that uses reinforcement learning to incentivize enhanced in-context search abilities.



本文则表明: 加 RL 算力 + TestingTime 更多 token, 也能可扩展地涨; 把 TestingTime Scaling 收益收进「用 RL 激励上下文内搜索」的更大框架.

### H. 3. Reinforcement Learning for Reasoning Enhancement 用强化学习增强推理

Reinforcement Learning plays a pivotal role in aligning LLMs with human preferences (Bai et al., 2022; Ouyang et al., 2022). Despite its importance, few studies have focused on using RL to enhance reasoning capabilities. Traditional RL pipelines begin with SFT on high-quality human demonstrations, which provides a strong initialization and prevents mode collapse. Following this, a reward model is trained on human preferences, and the language model is subsequently optimized using methods such as PPO (Schulman et al., 2017) or DPO (Rafailov et al., 2023). Although this method works well for alignment, it risks constraining models to emulate human reasoning patterns, potentially hindering the discovery of novel problem-solving strategies.



RL 常用于对齐偏好, 较少专攻推理. 传统管线: 人类示范 SFT → 偏好 RM → PPO/DPO. 对齐有效, 但可能把模型困在模仿人类思路上, 妨碍新策略.

Methods like STaR iteratively boost performance by fine-tuning on the model’s self-generated chain-of-thought that leads to correct final answers (Singh et al., 2024; Yuan et al., 2023; Zelikman et al., 2022). Recent studies have also investigated the use of process-based rewards that emphasize both the correctness of final answers and the soundness of the reasoning processes (Lightman et al., 2024; Shao et al., 2024; Wang et al., 2023a). Unlike these methods, our work applies outcome-based RL directly to base language models without an initial SFT phase. This design choice encourages the emergence of innovative and unconstrained reasoning strategies, enabling the model to develop diverse solutions beyond mere imitation of human examples. Our approach also inspired further exploration in subsequent research (Face, 2025; Liu et al., 2025; Pan et al., 2025).



STaR 等在自生成正确 CoT 上迭代微调; 也有过程奖励同时盯终答与过程. 本文不同: 结果型 RL 直接打在底座上, 不做前置 SFT, 鼓励不受人类示范束缚的多样策略; 后续工作亦有跟进.

## I. Open Weights, Code, and Data 开放权重, 代码与数据

To promote the development of the open-source community and industry ecosystem, we have made the model weights of [DeepSeek-R1](https://huggingface. co/deepseek-ai/DeepSeek-R1) and [DeepSeek-R1-Zero](https://huggingface. co/deepseek-ai/DeepSeek-R1-Zero{}) publicly available on HuggingFace. In addition, we release [DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface. co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B), [DeepSeek-R1-Distill-Qwen-7B](https://huggingface. co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B), [DeepSeek-R1-Distill-Qwen-14B](https://huggingface. co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B), [DeepSeek-R1-Distill-Qwen-32B](https://huggingface. co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B), [DeepSeek-R1-Distill-Llama-8B](https://huggingface. co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B), [DeepSeek-R1-Distill-Llama-70B](https://huggingface. co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B).



权重已在 Hugging Face 公开: R1, R1-Zero 及各蒸馏版.

Furthermore, we have released the fundamental model inference code ([https://github. com/deepseek-ai/DeepSeek-V3](https://github. com/deepseek-ai/DeepSeek-V3)) and provided detailed usage guidelines ([https://github. com/deepseek-ai/DeepSeek-R1](https://github. com/deepseek-ai/DeepSeek-R1)) on GitHub.



推理代码与用法指南见 GitHub.

<!-- page 66 of 86 -->

Here is an example of running the inference code to interact with DeepSeek-R1:



运行推理与 R1 交互的示例:

```shell
# Download the model weights from Hugging Face
huggingface-cli download deepseek-ai/DeepSeek-R1 --local-dir /path/to/DeepSeek-R1

# Clone DeepSeek-V3 GitHub repository
git clone https://github. com/deepseek-ai/DeepSeek-V3. git

# Install necessary dependencies
cd DeepSeek-R1/inference
pip install -r requirements. txt

# Convert Hugging Face model weights to a specific format (for running the model on 16 H800 GPUs)
python convert. py --hf-ckpt-path /path/to/DeepSeek-R1 --save-path /path/to/DeepSeek-R1-Demo --n-experts 256 --model-parallel 16
```



(后续交互命令英文原样; 完整 torchrun 示例见上文 shell 块.)

We also release SFT and RL data to the public at xxx. In the review process, we upload the data as an attachment.



SFT 与 RL 数据亦计划公开(原文占位 xxx); 审稿阶段以附件上传.

## J. Evaluation Prompts and Settings 评测提示与设定

Table 18 | MMLU assesses a model’s factual and conceptual understanding across 57 tasks spanning STEM (science, technology, engineering, mathematics), humanities, social sciences, and professional fields (e. g., law, medicine). The benchmark is commonly used to evaluate a model’s ability to perform general knowledge reasoning and multitask proficiency across a diverse range of subjects and tasks. Here is an example of MMLU.



表 18｜MMLU: 57 任务覆盖 STEM, 人文, 社科与专业域, 测通识与多任务. 示例提示英文原样.

**PROMPT**

```txt
Answer the following multiple choice question. The last line of your response should be of the following format: 'Answer: $LETTER' (without quotes) where LETTER is one of ABCD. Think step by step before answering.
Which tool technology is associated with Neandertals?
A. Aurignacian
B. Acheulean
C. Mousterian
D. both b and c
Evaluation
Parse the last line in response to judge if the choice equals to ground truth.
```

<!-- page 67 of 86 -->

Table 19 | MMLU-Redux is a subset of 5, 700 manually re-annotated questions across all 57 MMLU subjects. MMLU-Redux focuses on improving the quality, clarity, and robustness of the benchmark by reducing noise, ambiguities, and potential biases in the MMLU, while potentially adjusting the scope or difficulty of tasks to better align with modern evaluation needs. Here is an example of MMLU-Redux.



表 19｜MMLU-Redux: 5, 700 题人工重标子集, 降噪与减歧义.

| PROMPT |
| --- |
| ## Question: |
| Sauna use, sometimes referred to as "sauna bathing," is characterized by short-term passive exposure to extreme heat ... In fact, sauna use has been proposed as an alternative to exercise for people who are unable to engage in physical activity due to chronic disease or physical limitations. [13] According to the article, which of the following is NOT a benefit of sauna use? |
| ## Choices: |
| - (A) Decreased risk of heart attacks. |
| - (B) Increase in stroke volume. |
| - (C) Improved mental health. |
| - (D) Decreased rate of erectile dysfunction. |
| ## Instruction |
| Please answer this question by first reasoning and then selecting the correct choice. Present your reasoning and solution in the following json format. Please show your choice in the 'answer' field with only the choice letter, e. g., "answer": "C". { "reasoning": "____", "answer": "____" } |
| Evaluation |
| Parse the json output in response to judge if the answer equals to ground truth. |

<!-- page 68 of 86 -->

Table 20 | LiveCodeBench aims to evaluate model performance on the algorithm competition task, which collects new problems over time from contests across three competition platforms, namely LeetCode, AtCoder, and CodeForces.



表 20｜LiveCodeBench: 持续收集 LeetCode / AtCoder / CodeForces 新题.

| PROMPTQuestion: There is a stack of N cards, and the ith card from the top has an integer $A_i$ written on it. You take K cards from the bottom of the stack and place them on top of the stack, maintaining their order. Print the integers written on the cards from top to bottom after the operation. InputThe input is given from Standard Input in the following format: N KA1A2... ANOutputLet $B_i$ be the integer written on the ith card from the top of the stack after the operation. Print $B_1, B_2, \ldots, B_N$ in this order, separated by spaces. Constraints-1 ≤ K &lt; N ≤ 100-1 ≤ Ai ≤ 100All input values are integers. Sample Input 15312345Sample Output 134512Initially, the integers written on the cards are 1, 2, 3, 4, 5 from top to bottom. After taking three cards from the bottom of the stack and placing them on top, the integers written on the cards become 3, 4, 5, 1, 2 from top to bottom. Sample Input 2621212Sample Output 2121212The integers written on the cards are not necessarily distinct. Please write a python code to solve the above problem. Your code must read the inputs from stdin and output the results to stdout. |
| --- |
| EvaluationExtract the code wrapped by ''‘python''‘ in response to judge if the answer passes the test cases. |

<!-- page 69 of 86 -->

Table 21 | Compared to MMLU, MMLU-Pro features a curated subset of tasks, but with significantly increased difficulty. Questions in MMLU-Pro are designed to require deeper reasoning, multi-step problem-solving, and advanced domain-specific knowledge. For example, STEM tasks may involve complex mathematical derivations or nuanced scientific concepts, while humanities tasks may demand intricate contextual analysis.



表 21｜MMLU-Pro: 更难, 更重多步与领域知识. 提示全文见下.

**PROMPT**

The following are multiple choice questions (with answers) about business. Think step by step and then output the answer in the format of "The answer is (X)" at the end.

Question: Typical advertising regulatory bodies suggest, for example that adverts must not: encour-

age \_\_\_, cause unnecessary \_\_\_ or \_\_\_, and must not cause \_\_\_ offence.

Options: A. Safe practices, Fear, Jealousy, Trivial

B. Unsafe practices, Distress, Joy, Trivial

C. Safe practices, Wants, Jealousy, Trivial

D. Safe practices, Distress, Fear, Trivial

E. Unsafe practices, Wants, Jealousy, Serious

F. Safe practices, Distress, Jealousy, Serious

G. Safe practices, Wants, Fear, Serious

H. Unsafe practices, Wants, Fear, Trivial

I. Unsafe practices, Distress, Fear, Serious

Answer: Let’s think step by step.

**Evaluation**

Parse the capital letter following “Answer: ” in response to judge if the answer equals to ground truth.

<!-- page 70 of 86 -->

Table 22 | DROP assesses a model’s ability to understand and extract relevant information from extended textual passages. Unlike simpler question-answering benchmarks that focus on factual recall, DROP requires models to process and interpret context-rich paragraphs.



表 22｜DROP: 长段落理解与抽取, 非简单事实回忆.

**PROMPT**

You will be asked to read a passage and answer a question. Some examples of passages and Q&A are provided below.

\# Examples - Passage: Looking to avoid back-to-back divisional losses, the Patriots traveled to Miami to face the 6-4 Dolphins at Dolphin Stadium . . . Cassel’s 415 passing yards made him the second quarterback in Patriots history to throw for at least 400 yards in two or more games; Drew Bledsoe had four 400+ yard passing games in his Patriots career.

Question: How many points did the Dolphins lose by? Answer: 20.

- Passage: In week 2, the Seahawks took on their division rivals, the San Francisco 49ers. Prior to the season, NFL analysts rated this rivalry as the top upcoming rivalry, as well as the top rivalry of the decade . . . Seattle was now 2-0, and still unbeaten at home.

Question: How many field goals of at least 30 yards did Hauschka make? Answer: 2.

- Passage: at Raymond James Stadium, Tampa, Florida TV Time: CBS 1: 00pm eastern The Ravens opened the regular season on the road against the Tampa Bay Buccaneers on September 10. . . . With the win, the Ravens were 1-0 and 1-0 against NFC Opponents.

- Passage: The Chargers (1-0) won their season opener 22-14 against the Oakland Raiders after five field goals by Nate Kaeding and three botched punts by the Raiders. The Raiders Pro Bowl long snapper Jon Condo suffered a head injury in the second quarter. He was replaced by linebacker Travis Goethel, who had not snapped since high school. Goethel rolled two snaps to punter Shane Lechler, each giving the Chargers the ball in Raiders territory, and Lechler had another punt blocked by Dante Rosario. The Chargers scored their only touchdown in the second quarter after a 13-play, 90-yard drive resulted in a 6-yard touchdown pass from Philip Rivers to wide receiver Malcom Floyd. The Chargers failed to score four out of five times in the red zone. San Diego led at halftime 10-6, and the Raiders did not scored a touchdown until 54 seconds remained in the game. Undrafted rookie Mike Harris made his first NFL start, filing in for left tackle for an injured Jared Gaither. San Diego protected Harris by having Rivers throw short passes; sixteen of Rivers’ 24 completions were to running backs and tight ends, and he threw for 231 yards while only being sacked once. He did not have an interception after throwing 20 in 2011. The win was the Chargers’ eighth in their previous nine games at Oakland. It improved Norv Turner’s record to 4-2 in Chargers’ season openers. Running back Ryan Mathews and receiver Vincent Brown missed the game with injuries. Question: How many yards did Rivers pass? Answer:

Parse the capital letter following “Answer: ” in response to judge if the answer equals to ground truth.

<!-- page 71 of 86 -->

Table 23 | Instruction-Following Evaluation (IFEval) is a benchmark designed to assess a model’s ability to comply with explicit, verifiable instructions embedded within prompts. It targets a core competency of large language models (LLMs): producing outputs that meet multiple, clearly defined constraints specified by the user.



表 23｜IFEval: 遵循可核验显式指令.

**PROMPT** Kindly summarize the text below in XML format. Make sure the summary contains less than 4 sentences. Quantum entanglement is the phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in such a way that the quantum state of each particle of the group cannot be described independently of the state of the others, including when the particles are separated by a large distance. The topic of quantum entanglement is at the heart of the disparity between classical and quantum physics: entanglement is a primary feature of quantum mechanics not present in classical mechanics. Measurements of physical properties such as position, momentum, spin, and polarization performed on entangled particles can, in some cases, be found to be perfectly correlated. For example, if a pair of entangled particles is generated such that their total spin is known to be zero, and one particle is found to have clockwise spin on a first axis, then the spin of the other particle, measured on the same axis, is found to be anticlockwise. However, this behavior gives rise to seemingly paradoxical effects: any measurement of a particle’s properties results in an apparent and irreversible wave function collapse of that particle and changes the original quantum state. With entangled particles, such measurements affect the entangled system as a whole. Such phenomena were the subject of a 1935 paper by Albert Einstein, Boris Podolsky, and Nathan Rosen, and several papers by Erwin Schrödinger shortly thereafter, describing what came to be known as the EPR paradox. Einstein and others considered such behavior impossible, as it violated the local realism view of causality (Einstein referring to it as "spooky action at a distance") and argued that the accepted formulation of quantum mechanics must therefore be incomplete.**Evaluation** Call official functions to check if the answer is consistent with the instructions.

<!-- page 72 of 86 -->

Table 24 | FRAMES (Factuality, Retrieval, And reasoning MEasurement Set) is a comprehensive benchmark designed to evaluate core components of retrieval-augmented generation (RAG) systems. Our evaluation employs the benchmark’s official "Oracle Prompt" configuration. In this setting, each test prompt includes the question along with all the ground truth Wikipedia articles, thus eliminating the need for an external retrieval component (e. g., BM25). This setting allows us to specifically measure a model’s ability to reason over and synthesize information from provided sources to generate correct and verifiable facts.



表 24｜FRAMES: RAG 核心能力; 本文用 Oracle Prompt(题面已附全部相关维基), 专测综合推理而非检索.

| PROMPTHere are the relevant Wikipedia articles: url: https: en. wikipedia. orgwikiPresident_of_the_United_Statesurl content: The president of the United States (POTUS) is the head of state and head of government of the United States of America. The president directs the executive branch of the federal government and is the commander-in-chief of the United States Armed Forces. ... Based on all the information, answer the query. Query: If my future wife has the same first name as the 15th first lady of the United States' mother and her surname is the same as the second assassinated president's mother's maiden name, what is my future wife's name? |
| --- |
| Evaluation===Task===I need your help in evaluating an answer provided by an LLM against a ground truth answer. Your task is to determine if the ground truth answer is present in the LLM's response. Please analyze the provided data and make a decision. ==Instructions===1. Carefully compare the "Predicted Answer" with the "Ground Truth Answer". 2. Consider the substance of the answers - look for equivalent information or correct answers. Do not focus on exact wording unless the exact wording is crucial to the meaning. 3. Your final decision should be based on whether the meaning and the vital facts of the "Ground Truth Answer" are present in the "Predicted Answer:"===Input Data=== - Question: If my future wife has the same first name as the 15th first lady of the United States' mother and her surname is the same as the second assassinated president's mother's maiden name, what is my future wife's name?- Predicted Answer: ...- Ground Truth Answer: Jane Ballou===Output Format===Provide your final evaluation in the following format: Explanation: xxxDecision: "TRUE" or "FALSE"Please proceed with the evaluation. |

<!-- page 73 of 86 -->

Table 25 | Arena-Hard is an open-ended evaluation benchmark specifically designed to assess the capabilities of LLMs. It presents models with challenging, novel, and diverse prompts curated from Chatbot Arena, a continuously evolving, crowd-sourced platform. It focuses on measuring model performance in open-ended tasks, with particular emphasis on coding and mathematics-related prompts. Given the inherently subjective nature of open-ended tasks, where multiple valid responses may exist, the benchmark necessitates the use of an evaluation model to approximate human judgment effectively. Higher evaluation scores suggest that the



表 25｜Arena-Hard: 开放生成, 偏代码与数学; 用评测模型近似人类判断. 提示与裁判模板英文原样.

model is more likely to be favored by human users in real-world scenarios.

<!-- page 74 of 86 -->

Table 26 | AlpacaEval 2.0 is an open-ended evaluation dataset, similar in nature to ArenaHard, and leverages an LLM to assess model performance on subjective tasks. However, in contrast to ArenaHard, the prompts in AlpacaEval 2.0 are generally less challenging and only a small subset necessitates the deployment of reasoning capabilities by the evaluated models.



表 26｜AlpacaEval 2.0: 开放生成, 总体比 ArenaHard 易, 仅小部分需强推理. 提示英文原样.

<!-- page 75 of 86 -->

Table 27 | The CLUEWSC (Chinese Language Understanding Evaluation Benchmark - Winograd Schema Challenge) is a specialized task within the CLUE benchmark suite designed to evaluate a model’s commonsense reasoning and contextual understanding capabilities in Chinese.



表 27｜CLUEWSC: 中文常识与指代. 提示中英原样.

<!-- page 76 of 86 -->

Table 28 | C-EVAL evaluates a model’s breadth and depth of knowledge across 52 diverse academic disciplines, spanning humanities, social sciences, STEM (Science, Technology, Engineering, and Mathematics), and other professional fields (e. g., medicine, law). All question in C-Eval are Chinese.



表 28｜C-EVAL: 52 学科中文知识广度与深度. 提示中文原样.

Table 29 | GPQA (Graduate-Level Google-Proof QA Benchmark) is a rigorous evaluation framework designed to measure an LLM’s ability to tackle complex, graduate-level multiple-choice problems in STEM domains-specifically biology, physics, and chemistry.



表 29｜GPQA: 研究生级 STEM 多选.

**PROMPT**

Answer the following multiple choice question. The last line of your response should be of the following format: ’ANSWER: \$LETTER’ (without quotes) where LETTER is one of ABCD. Think step by step before answering. Two quantum states with energies E1 and E2 have a lifetime of 10<sup>−9</sup>sec and 10<sup>−8</sup>sec, respectively. We want to clearly distinguish these two energy levels. Which one of the following options could be their energy difference so that they can be clearly resolved? A) $1 0 ^ { - 9 }   \mathrm { e } \bar { \mathrm { V } }$ B) $1 0 ^ { - 8 }   \mathrm { e V }$ C) $1 0 ^ { - 4 }   \mathrm { e V }$ D) $1 0 ^ { - 1 1 }   \mathrm { e V }$

Parse the capital letter following “ANSWER: ” in response to judge if the choice equals to ground truth.

<!-- page 77 of 86 -->

Table 30 | SimpleQA is a factuality evaluation benchmark that measures a model’s ability to answer short, fact-seeking questions with precise, verifiable correctness.



表 30｜SimpleQA: 短事实题正确性.

| PROMPTWho received the IEEE Frank Rosenblatt Award in 2010? |
| --- |
| EvaluationYour job is to look at a question, a gold target, and a predicted answer, and then assign a grade of either ["CORRECT", "INCORRECT", "NOT_ATTEMPTED"]. ... Grade as A/B/C only. |

<!-- page 78 of 86 -->

Table 31 | An example of C-SimpleQA. It measures a model’s ability to answer short, fact-seeking questions in Chinese with precise, verifiable correctness.



表 31｜C-SimpleQA 示例: 中文短事实.

```txt
PROMPT
显脉香茶菜可以用来治疗急性的什么类型的黄疸型肝炎?
Evaluation
请根据给定问题, 标准答案和模型预测的答案来评估.. 只返回字母「A」,「B」或「C」.
```

Table 32 | An example of math evaluation, which applies to AIME, MATH, and CNMO. These benchmarks evaluate model performance on mathematical tasks.



表 32｜数学评测示例(AIME / MATH / CNMO): 逐步推理, 终答 `\boxed{}`, 规则判分.

| PROMPTLet $b \geqslant 2$ be an integer. Call a positive integer $n$ $b$-beautiful if it has exactly two digits when expressed in base $b$, and these two digits sum to $\sqrt{n}$. For example, 81 is 13-eautiful because $81 = \underline{6} \underline{3}_{13}$ and $6 + 3 = \sqrt{81}$. Find the least integer $b \geqslant 2$ for which there are more than ten $b$-beautiful integers. Please reason step by step, and put your final answer within \\boxed{}. |
| --- |
| EvaluationParse the final answer within \\boxed{} and use a rule-based grader to determine if it equals the ground truth. Round numerical values as needed, and use ‘SymPy’$^{1}$ to parse expressions. |

<!-- page 79 of 86 -->

## References

AI@Meta. Llama 3.1 model card, 2024. URL [https://github. com/meta-llama/llama-models/blob/main/models/llama3\_1/MODEL\_CARD.md](https://github. com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md).

E. Akyürek, M. Damani, L. Qiu, H. Guo, Y. Kim, and J. Andreas. The surprising effectiveness of test-time training for abstract reasoning. arXiv preprint arXiv: 2411.07279, 2024.

Y. Bai, A. Jones, K. Ndousse, A. Askell, A. Chen, N. DasSarma, D. Drain, S. Fort, D. Ganguli, T. Henighan, et al. Training a helpful and harmless assistant with reinforcement learning from human feedback. arXiv preprint arXiv: 2204.05862, 2022.

B. Brown, J. Juravsky, R. Ehrlich, R. Clark, Q. V. Le, C. Ré, and A. Mirhoseini. Large language monkeys: Scaling inference compute with repeated sampling. arXiv preprint arXiv: 2407.21787, 2024.

T. B. Brown, B. Mann, N. Ryder, M. Subbiah, J. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, S. Agarwal, A. Herbert-Voss, G. Krueger, T. Henighan, R. Child, A. Ramesh, D. M. Ziegler, J. Wu, C. Winter, C. Hesse, M. Chen, E. Sigler, M. Litwin, S. Gray, B. Chess, J. Clark, C. Berner, S. McCandlish, A. Radford, I. Sutskever, and D. Amodei. Language models are few-shot learners. In H. Larochelle, M. Ranzato, R. Hadsell, M. Balcan, and H. Lin, editors, Advances in Neural Information Processing Systems 33: Annual Conference on Neural Information Processing Systems 2020, NeurIPS 2020, December 6-12, 2020, virtual, 2020. URL [https://proceedings. neurips. cc/paper/2020/hash/1457c0d6bfcb4967418bfb8ac142f64a-Abstract. html](https://proceedings. neurips. cc/paper/2020/hash/1457c0d6bfcb4967418bfb8ac142f64a-Abstract. html).

D. Busbridge, A. Shidani, F. Weers, J. Ramapuram, E. Littwin, and R. Webb. Distillation scaling laws. arXiv preprint arXiv: 2502.08606, 2025.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021. URL [https://arxiv. org/abs/2107.03374](https://arxiv. org/abs/2107.03374).

Z. Chen, Y. Min, B. Zhang, J. Chen, J. Jiang, D. Cheng, W. X. Zhao, Z. Liu, X. Miao, Y. Lu, et al. An empirical study on eliciting and improving r1-like reasoning models. arXiv preprint arXiv: 2503.04548, 2025.

W.-L. Chiang, L. Zheng, Y. Sheng, A. N. Angelopoulos, T. Li, D. Li, H. Zhang, B. Zhu, M. Jordan, J. E. Gonzalez, et al. Chatbot arena: An open platform for evaluating llms by human preference. arXiv preprint arXiv: 2403.04132, 2024.

P. F. Christiano, J. Leike, T. B. Brown, M. Martic, S. Legg, and D. Amodei. Deep reinforcement learning from human preferences. In I. Guyon, U. von Luxburg, S. Bengio, H. M. Wallach, R. Fergus, S. V. N. Vishwanathan, and R. Garnett, editors, Advances in Neural Information Processing Systems 30: Annual Conference on Neural Information Processing Systems 2017, December 4-9, 2017, Long Beach, CA, USA, pages 4299–4307, 2017. URL [https://proceedings. neurips. cc/paper/2017/hash/d5e2c0adad503c91f91df240d0cd4e49-Abstract. html](https://proceedings. neurips. cc/paper/2017/hash/d5e2c0adad503c91f91df240d0cd4e49-Abstract. html).

<!-- page 80 of 86 -->

H. W. Chung, L. Hou, S. Longpre, B. Zoph, Y. Tay, W. Fedus, Y. Li, X. Wang, M. Dehghani, S. Brahma, A. Webson, S. S. Gu, Z. Dai, M. Suzgun, X. Chen, A. Chowdhery, A. Castro-Ros, M. Pellat, K. Robinson, D. Valter, S. Narang, G. Mishra, A. Yu, V. Y. Zhao, Y. Huang, A. M. Dai, H. Yu, S. Petrov, E. H. Chi, J. Dean, J. Devlin, A. Roberts, D. Zhou, Q. V. Le, and J. Wei. Scaling instruction-finetuned language models. J. Mach. Learn. Res., 25: 70: 1–70: 53, 2024. URL [https://jmlr. org/papers/v25/23-0870. html](https://jmlr. org/papers/v25/23-0870. html).

CMS. Chinese national high school mathematics olympiad, 2024. URL [https://www. cms. org. cn/Home/comp/comp/cid/12. html](https://www. cms. org. cn/Home/comp/comp/cid/12. html).

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv: 2110.14168, 2021.

DeepSeek-AI. Deepseek-v2: A strong, economical, and efficient mixture-of-experts language model. CoRR, abs/2405.04434, 2024a. URL [https://doi. org/10.48550/arXiv. 2405.04434](https://doi. org/10.48550/arXiv. 2405.04434).

DeepSeek-AI. Deepseek-v3 technical report. arXiv preprint arXiv: 2412.19437, 2024b.

H. Face. Open r1: A fully open reproduction of deepseek-r1, January 2025. URL [https://github. com/huggingface/open-r1](https://github. com/huggingface/open-r1).

X. Feng, Z. Wan, M. Wen, S. M. McAleer, Y. Wen, W. Zhang, and J. Wang. Alphazero-like tree-search can guide large language model decoding and training, 2024. URL [https://arxiv. org/abs/2309.17179](https://arxiv. org/abs/2309.17179).

D. Ganguli, L. Lovitt, J. Kernion, A. Askell, Y. Bai, S. Kadavath, B. Mann, E. Perez, N. Schiefer, K. Ndousse, A. Jones, S. Bowman, A. Chen, T. Conerly, N. DasSarma, D. Drain, N. Elhage, S. E. Showk, S. Fort, Z. Hatfield-Dodds, T. Henighan, D. Hernandez, T. Hume, J. Jacobson, S. Johnston, S. Kravec, C. Olsson, S. Ringer, E. Tran-Johnson, D. Amodei, T. Brown, N. Joseph, S. McCandlish, C. Olah, J. Kaplan, and J. Clark. Red Teaming Language Models to Reduce Harms: Methods, Scaling Behaviors, and Lessons Learned. CoRR, abs/2209.07858, 2022.

L. Gao, J. Schulman, and J. Hilton. Scaling laws for reward model overoptimization, 2022. URL [https://arxiv. org/abs/2210.10760](https://arxiv. org/abs/2210.10760).

P. Gauthier. Aider LLM leaderboard, 2025. URL [https://aider. chat/docs/leaderboards/](https://aider. chat/docs/leaderboards/).

J. Geiping, S. McLeish, N. Jain, J. Kirchenbauer, S. Singh, B. R. Bartoldson, B. Kailkhura, A. Bhatele, and T. Goldstein. Scaling up test-time compute with latent reasoning: A recurrent depth approach. arXiv preprint arXiv: 2502.05171, 2025.

A. P. Gema, J. O. J. Leang, G. Hong, A. Devoto, A. C. M. Mancino, R. Saxena, X. He, Y. Zhao, X. Du, M. R. G. Madani, C. Barale, R. McHardy, J. Harris, J. Kaddour, E. van Krieken, and P. Minervini. Are we done with mmlu? In L. Chiruzzo, A. Ritter, and L. Wang, editors, Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies, NAACL 2025 - Volume 1: Long Papers, Albuquerque, New Mexico, USA, April 29 - May 4, 2025, pages 5069–5096. Association for Computational Linguistics, 2025. URL [https://aclanthology. org/2025. naacl-long. 262/](https://aclanthology. org/2025. naacl-long. 262/).

<!-- page 81 of 86 -->

F. Gloeckle, B. Y. Idrissi, B. Rozière, D. Lopez-Paz, and G. Synnaeve. Better & faster large language models via multi-token prediction. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview. net, 2024. URL [https://openreview. net/forum? id=pEWAcejiU2](https://openreview. net/forum? id=pEWAcejiU2).

Z. Gou, Z. Shao, Y. Gong, yelong shen, Y. Yang, N. Duan, and W. Chen. CRITIC: Large language models can self-correct with tool-interactive critiquing. In The Twelfth International Conference on Learning Representations, 2024a. URL [https://openreview. net/forum? id=Sx038qxjek](https://openreview. net/forum? id=Sx038qxjek).

Z. Gou, Z. Shao, Y. Gong, yelong shen, Y. Yang, M. Huang, N. Duan, and W. Chen. ToRA: A toolintegrated reasoning agent for mathematical problem solving. In The Twelfth International Conference on Learning Representations, 2024b. URL [https://openreview. net/forum? id=Ep0TtjVoap](https://openreview. net/forum? id=Ep0TtjVoap).

S. Hao, Y. Gu, H. Ma, J. J. Hong, Z. Wang, D. Z. Wang, and Z. Hu. Reasoning with language model is planning with world model. In The 2023 Conference on Empirical Methods in Natural Language Processing, 2023. URL [https://openreview. net/forum? id=VTWWvYtF1R](https://openreview. net/forum? id=VTWWvYtF1R).

Y. He, S. Li, J. Liu, Y. Tan, W. Wang, H. Huang, X. Bu, H. Guo, C. Hu, B. Zheng, et al. Chinese simpleqa: A chinese factuality evaluation for large language models. arXiv preprint arXiv: 2411.07140, 2024.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. In 9th International Conference on Learning Representations, ICLR 2021, Virtual Event, Austria, May 3-7, 2021. OpenReview. net, 2021. URL [https://openreview. net/forum? id=d7KBjmI3GmQ](https://openreview. net/forum? id=d7KBjmI3GmQ).

G. E. Hinton, O. Vinyals, and J. Dean. Distilling the knowledge in a neural network. CoRR, abs/1503.02531, 2015. URL [http: //arxiv. org/abs/1503.02531](http: //arxiv. org/abs/1503.02531).

Y. Huang, Y. Bai, Z. Zhu, J. Zhang, J. Zhang, T. Su, J. Liu, C. Lv, Y. Zhang, J. Lei, Y. Fu, M. Sun, and J. He. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In A. Oh, T. Naumann, A. Globerson, K. Saenko, M. Hardt, and S. Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. URL [http: //papers. nips. cc/paper\_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets\_and\_Benchmarks. html](http: //papers. nips. cc/paper_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets_and_Benchmarks. html).

N. Jain, K. Han, A. Gu, W. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. CoRR, abs/2403.07974, 2024. URL [https://doi. org/10.48550/arXiv. 2403.07974](https://doi. org/10.48550/arXiv. 2403.07974).

J. Kaplan, S. McCandlish, T. Henighan, T. B. Brown, B. Chess, R. Child, S. Gray, A. Radford, J. Wu, and D. Amodei. Scaling laws for neural language models. arXiv preprint arXiv: 2001.08361, 2020.

T. Kojima, S. S. Gu, M. Reid, Y. Matsuo, and Y. Iwasawa. Large language models are zero-shot reasoners. In A. H. Oh, A. Agarwal, D. Belgrave, and K. Cho, editors, Advances in Neural Information Processing Systems, 2022. URL [https://openreview. net/forum? id=e2TBb5y0yFf](https://openreview. net/forum? id=e2TBb5y0yFf).

<!-- page 82 of 86 -->

S. Krishna, K. Krishna, A. Mohananey, S. Schwarcz, A. Stambler, S. Upadhyay, and M. Faruqui. Fact, fetch, and reason: A unified evaluation of retrieval-augmented generation. CoRR, abs/2409.12941, 2024. doi: 10.48550/ARXIV. 2409.12941. URL [https://doi. org/10.48550/arXiv. 2409.12941](https://doi. org/10.48550/arXiv. 2409.12941).

A. Kumar, V. Zhuang, R. Agarwal, Y. Su, J. D. Co-Reyes, A. Singh, K. Baumli, S. Iqbal, C. Bishop, R. Roelofs, et al. Training language models to self-correct via reinforcement learning. arXiv preprint arXiv: 2409.12917, 2024.

W. Kwon, Z. Li, S. Zhuang, Y. Sheng, L. Zheng, C. H. Yu, J. E. Gonzalez, H. Zhang, and I. Stoica. Efficient memory management for large language model serving with pagedattention. In Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles, 2023.

H. Li, Y. Zhang, F. Koto, Y. Yang, H. Zhao, Y. Gong, N. Duan, and T. Baldwin. CMMLU: measuring massive multitask language understanding in chinese. In L. Ku, A. Martins, and V. Srikumar, editors, Findings of the Association for Computational Linguistics, ACL 2024, Bangkok, Thailand and virtual meeting, August 11-16, 2024, pages 11260–11285. Association for Computational Linguistics, 2024. doi: 10.18653/V1/2024. FINDINGS-ACL. 671. URL [https://doi. org/10.18653/v1/2024. findings-acl. 671](https://doi. org/10.18653/v1/2024. findings-acl. 671).

J. Li, D. Guo, D. Yang, R. Xu, Y. Wu, and J. He. Codei/o: Condensing reasoning patterns via code input-output prediction. arXiv preprint arXiv: 2502.07316, 2025.

H. Lightman, V. Kosaraju, Y. Burda, H. Edwards, B. Baker, T. Lee, J. Leike, J. Schulman, I. Sutskever, and K. Cobbe. Let’s verify step by step. In The Twelfth International Conference on Learning Representations, ICLR 2024, Vienna, Austria, May 7-11, 2024. OpenReview. net, 2024. URL [https://openreview. net/forum? id=v8L0pN6EOi](https://openreview. net/forum? id=v8L0pN6EOi).

B. Y. Lin. ZeroEval: A Unified Framework for Evaluating Language Models, July 2024. URL [https://github. com/WildEval/ZeroEval](https://github. com/WildEval/ZeroEval).

Z. Liu, C. Chen, W. Li, T. Pang, C. Du, and M. Lin. There may not be aha moment in r1-zero-like training - a pilot study. [https://oatllm. notion. site/oat-zero](https://oatllm. notion. site/oat-zero), 2025. Notion Blog.

MAA. American invitational mathematics examination - aime. In American Invitational Mathematics Examination - AIME 2024, February 2024. URL [https://maa. org/math-competitions/american-invitational-mathematics-examination-aime](https://maa. org/math-competitions/american-invitational-mathematics-examination-aime).

A. Madaan, N. Tandon, P. Gupta, S. Hallinan, L. Gao, S. Wiegreffe, U. Alon, N. Dziri, S. Prabhumoye, Y. Yang, S. Gupta, B. P. Majumder, K. Hermann, S. Welleck, A. Yazdanbakhsh, and P. Clark. Self-refine: Iterative refinement with self-feedback. In Thirty-seventh Conference on Neural Information Processing Systems, 2023. URL [https://openreview. net/forum? id=S37hOerQLB](https://openreview. net/forum? id=S37hOerQLB).

M. Mazeika, L. Phan, X. Yin, A. Zou, Z. Wang, N. Mu, E. Sakhaee, N. Li, S. Basart, B. Li, D. A. Forsyth, and D. Hendrycks. HarmBench: A Standardized Evaluation Framework for Automated Red Teaming and Robust Refusal. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview. net, 2024.

M. Mirzayanov. Codeforces, 2025. URL [https://codeforces. com/](https://codeforces. com/).

N. Muennighoff, A. M. Rush, B. Barak, T. L. Scao, N. Tazi, A. Piktus, S. Pyysalo, T. Wolf, and C. Raffel. Scaling data-constrained language models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023. URL [https://openreview. net/forum? id=j5BuTrEj35](https://openreview. net/forum? id=j5BuTrEj35).

<!-- page 83 of 86 -->

R. Nakano, J. Hilton, S. Balaji, J. Wu, L. Ouyang, C. Kim, C. Hesse, S. Jain, V. Kosaraju, W. Saunders, et al. Webgpt: Browser-assisted question-answering with human feedback. arXiv preprint arXiv: 2112.09332, 2021.

OpenAI. GPT4 technical report. arXiv preprint arXiv: 2303.08774, 2023.

OpenAI. Introducing SimpleQA, 2024a. URL [https://openai. com/index/introducing-simpleqa/](https://openai. com/index/introducing-simpleqa/).

OpenAI. Introducing SWE-bench verified we’re releasing a human-validated subset of swebench that more, 2024b. URL [https://openai. com/index/introducing-swe-bench-verified/](https://openai. com/index/introducing-swe-bench-verified/).

L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. L. Wainwright, P. Mishkin, C. Zhang, S. Agarwal, K. Slama, A. Ray, J. Schulman, J. Hilton, F. Kelton, L. Miller, M. Simens, A. Askell, P. Welinder, P. F. Christiano, J. Leike, and R. Lowe. Training language models to follow instructions with human feedback. In S. Koyejo, S. Mohamed, A. Agarwal, D. Belgrave, K. Cho, and A. Oh, editors, Advances in Neural Information Processing Systems 35: Annual Conference on Neural Information Processing Systems 2022, NeurIPS 2022, New Orleans, LA, USA, November 28 - December 9, 2022, 2022. URL [http: //papers. nips. cc/paper\_files/paper/2022/hash/b1efde53be364a73914f58805a001731-Abstract-Conference. html](http: //papers. nips. cc/paper_files/paper/2022/hash/b1efde53be364a73914f58805a001731-Abstract-Conference. html).

J. Pan, J. Zhang, X. Wang, L. Yuan, H. Peng, and A. Suhr. Tinyzero. https://github. com/Jiayi-Pan/TinyZero, 2025. Accessed: 2025-01-24.

A. Parrish, A. Chen, N. Nangia, V. Padmakumar, J. Phang, J. Thompson, P. M. Htut, and S. R. Bowman. BBQ: A hand-built bias benchmark for question answering. In Findings of the Association for Computational Linguistics: ACL 2022, Dublin, Ireland, May 22-27, 2022, pages 2086–2105. Association for Computational Linguistics, 2022.

Qwen. Qwq: Reflect deeply on the boundaries of the unknown, 2024a. URL [https://qwenlm. github. io/blog/qwq-32b-preview/](https://qwenlm. github. io/blog/qwq-32b-preview/).

Qwen. Qwen2.5: A party of foundation models, 2024b. URL [https://qwenlm. github. io/blog/qwen2.5](https://qwenlm. github. io/blog/qwen2.5).

A. Radford, J. Wu, R. Child, D. Luan, D. Amodei, I. Sutskever, et al. Language models are unsupervised multitask learners. OpenAI blog, 1(8): 9, 2019.

R. Rafailov, A. Sharma, E. Mitchell, C. D. Manning, S. Ermon, and C. Finn. Direct preference optimization: Your language model is secretly a reward model. In A. Oh, T. Naumann, A. Globerson, K. Saenko, M. Hardt, and S. Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. URL [http: //papers. nips. cc/paper\_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference. html](http: //papers. nips. cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference. html).

D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. GPQA: A graduate-level google-proof q&a benchmark. arXiv preprint arXiv: 2311.12022, 2023.

P. Röttger, H. Kirk, B. Vidgen, G. Attanasio, F. Bianchi, and D. Hovy. XSTest: A Test Suite for Identifying Exaggerated Safety Behaviours in Large Language Models. In Proceedings of the 2024 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers), NAACL 2024, Mexico

<!-- page 84 of 86 -->

City, Mexico, June 16-21, 2024, pages 5377–5400. Association for Computational Linguistics, 2024.

T. Schick, J. Dwivedi-Yu, R. Dessi, R. Raileanu, M. Lomeli, E. Hambro, L. Zettlemoyer, N. Cancedda, and T. Scialom. Toolformer: Language models can teach themselves to use tools. In Thirty-seventh Conference on Neural Information Processing Systems, 2023. URL [https://openreview. net/forum? id=Yacmpz84TH](https://openreview. net/forum? id=Yacmpz84TH).

J. Schulman. Approximating kl divergence, 2020. URL [http: //joschu. net/blog/kl-approx. html](http: //joschu. net/blog/kl-approx. html).

J. Schulman, P. Moritz, S. Levine, M. Jordan, and P. Abbeel. High-dimensional continuous control using generalized advantage estimation. arXiv preprint arXiv: 1506.02438, 2015.

J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv: 1707.06347, 2017.

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, M. Zhang, Y. Li, Y. Wu, and D. Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv: 2402.03300, 2024.

D. Silver, T. Hubert, J. Schrittwieser, I. Antonoglou, M. Lai, A. Guez, M. Lanctot, L. Sifre, D. Kumaran, T. Graepel, T. P. Lillicrap, K. Simonyan, and D. Hassabis. Mastering chess and shogi by self-play with a general reinforcement learning algorithm. CoRR, abs/1712.01815, 2017a. URL [http: //arxiv. org/abs/1712.01815](http: //arxiv. org/abs/1712.01815).

D. Silver, J. Schrittwieser, K. Simonyan, I. Antonoglou, A. Huang, A. Guez, T. Hubert, L. Baker, M. Lai, A. Bolton, Y. Chen, T. P. Lillicrap, F. Hui, L. Sifre, G. van den Driessche, T. Graepel, and D. Hassabis. Mastering the game of go without human knowledge. Nat., 550(7676): 354–359, 2017b. doi: 10.1038/NATURE24270. URL [https://doi. org/10.1038/nature24270](https://doi. org/10.1038/nature24270).

A. Singh, J. D. Co-Reyes, R. Agarwal, A. Anand, P. Patil, X. Garcia, P. J. Liu, J. Harrison, J. Lee, K. Xu, A. T. Parisi, A. Kumar, A. A. Alemi, A. Rizkowsky, A. Nova, B. Adlam, B. Bohnet, G. F. Elsayed, H. Sedghi, I. Mordatch, I. Simpson, I. Gur, J. Snoek, J. Pennington, J. Hron, K. Kenealy, K. Swersky, K. Mahajan, L. A. Culp, L. Xiao, M. Bileschi, N. Constant, R. Novak, R. Liu, T. Warkentin, Y. Bansal, E. Dyer, B. Neyshabur, J. Sohl-Dickstein, and N. Fiedel. Beyond human data: Scaling self-training for problem-solving with language models. Transactions on Machine Learning Research, 2024. ISSN 2835-8856. URL [https://openreview. net/forum? id=lNAyUngGFK](https://openreview. net/forum? id=lNAyUngGFK). Expert Certification.

C. Snell, J. Lee, K. Xu, and A. Kumar. Scaling llm test-time compute optimally can be more effective than scaling model parameters, 2024. URL [https://arxiv. org/abs/2408.03314](https://arxiv. org/abs/2408.03314).

C. V. Snell, J. Lee, K. Xu, and A. Kumar. Scaling LLM test-time compute optimally can be more effective than scaling parameters for reasoning. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview. net/forum? id=4FWAwZtd2n](https://openreview. net/forum? id=4FWAwZtd2n).

Y. Sun, X. Wang, Z. Liu, J. Miller, A. Efros, and M. Hardt. Test-time training with self-supervision for generalization under distribution shifts. In International conference on machine learning, pages 9229–9248. PMLR, 2020.

<!-- page 85 of 86 -->

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. Le, E. Chi, D. Zhou, and J. Wei. Challenging BIG-bench tasks and whether chain-of-thought can solve them. In A. Rogers, J. Boyd-Graber, and N. Okazaki, editors, Findings of the Association for Computational Linguistics: ACL 2023, pages 13003–13051, Toronto, Canada, July 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023. findings-acl. 824. URL [https://aclanthology. org/2023. findings-acl. 824/](https://aclanthology. org/2023. findings-acl. 824/).

H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv: 2307.09288, 2023.

T. Trinh, Y. Wu, Q. Le, H. He, and T. Luong. Solving olympiad geometry without human demonstrations. Nature, 2024. doi: 10.1038/s41586-023-06747-5.

J. Uesato, N. Kushman, R. Kumar, F. Song, N. Siegel, L. Wang, A. Creswell, G. Irving, and I. Higgins. Solving math word problems with process-and outcome-based feedback. arXiv preprint arXiv: 2211.14275, 2022.

B. Vidgen, H. R. Kirk, R. Qian, N. Scherrer, A. Kannappan, S. A. Hale, and P. Röttger. SimpleSafetyTests: a Test Suite for Identifying Critical Safety Risks in Large Language Models. CoRR, abs/2311.08370, 2023.

P. Wang, L. Li, Z. Shao, R. Xu, D. Dai, Y. Li, D. Chen, Y. Wu, and Z. Sui. Math-shepherd: A labelfree step-by-step verifier for llms in mathematical reasoning. arXiv preprint arXiv: 2312.08935, 2023a.

X. Wang, J. Wei, D. Schuurmans, Q. V. Le, E. H. Chi, S. Narang, A. Chowdhery, and D. Zhou. Self-consistency improves chain of thought reasoning in language models. In The Eleventh International Conference on Learning Representations, ICLR 2023, Kigali, Rwanda, May 1-5, 2023. OpenReview. net, 2023b. URL [https://openreview. net/forum? id=1PL1NIMMrw](https://openreview. net/forum? id=1PL1NIMMrw).

X. Wang, J. Wei, D. Schuurmans, Q. V. Le, E. H. Chi, S. Narang, A. Chowdhery, and D. Zhou. Self-consistency improves chain of thought reasoning in language models. In The Eleventh International Conference on Learning Representations, ICLR 2023, Kigali, Rwanda, May 1-5, 2023. OpenReview. net, 2023c. URL [https://openreview. net/forum? id=1PL1NIMMrw](https://openreview. net/forum? id=1PL1NIMMrw).

Y. Wang, H. Li, X. Han, P. Nakov, and T. Baldwin. Do-Not-Answer: A Dataset for Evaluating Safeguards in LLMs. CoRR, abs/2308.13387, 2023d.

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, T. Li, M. Ku, K. Wang, A. Zhuang, R. Fan, X. Yue, and W. Chen. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In A. Globersons, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. M. Tomczak, and C. Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. URL [http: //papers. nips. cc/paper\_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets\_and\_Benchmarks\_Track. html](http: //papers. nips. cc/paper_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets_and_Benchmarks_Track. html).

J. Wei, Y. Tay, R. Bommasani, C. Raffel, B. Zoph, S. Borgeaud, D. Yogatama, M. Bosma, D. Zhou, D. Metzler, E. H. Chi, T. Hashimoto, O. Vinyals, P. Liang, J. Dean, and W. Fedus. Emergent abilities of large language models. Trans. Mach. Learn. Res., 2022, 2022a. URL [https://openreview. net/forum? id=yzkSU5zdwD](https://openreview. net/forum? id=yzkSU5zdwD).

<!-- page 86 of 86 -->

J. Wei, X. Wang, D. Schuurmans, M. Bosma, B. Ichter, F. Xia, E. H. Chi, Q. V. Le, and D. Zhou. Chain-of-thought prompting elicits reasoning in large language models. In S. Koyejo, S. Mohamed, A. Agarwal, D. Belgrave, K. Cho, and A. Oh, editors, Advances in Neural Information Processing Systems 35: Annual Conference on Neural Information Processing Systems 2022, NeurIPS 2022, New Orleans, LA, USA, November 28 - December 9, 2022, 2022b. URL [http: //papers. nips. cc/paper\_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference. html](http: //papers. nips. cc/paper_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference. html).

S. Welleck, X. Lu, P. West, F. Brahman, T. Shen, D. Khashabi, and Y. Choi. Generating sequences by learning to self-correct. In The Eleventh International Conference on Learning Representations, 2023. URL [https://openreview. net/forum? id=hH36JeQZDaO](https://openreview. net/forum? id=hH36JeQZDaO).

C. S. Xia, Y. Deng, S. Dunn, and L. Zhang. Agentless: Demystifying llm-based software engineering agents. arXiv preprint, 2024.

H. Xin, Z. Z. Ren, J. Song, Z. Shao, W. Zhao, H. Wang, B. Liu, L. Zhang, X. Lu, Q. Du, W. Gao, Q. Zhu, D. Yang, Z. Gou, Z. F. Wu, F. Luo, and C. Ruan. Deepseek-prover-v1.5: Harnessing proof assistant feedback for reinforcement learning and monte-carlo tree search, 2024. URL [https://arxiv. org/abs/2408.08152](https://arxiv. org/abs/2408.08152).

S. Yao, D. Yu, J. Zhao, I. Shafran, T. L. Griffiths, Y. Cao, and K. R. Narasimhan. Tree of thoughts: Deliberate problem solving with large language models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023a. URL [https://openreview. net/forum? id=5Xc1ecxO1h](https://openreview. net/forum? id=5Xc1ecxO1h).

S. Yao, J. Zhao, D. Yu, N. Du, I. Shafran, K. R. Narasimhan, and Y. Cao. React: Synergizing reasoning and acting in language models. In The Eleventh International Conference on Learning Representations, 2023b. URL [https://openreview. net/forum? id=WE\_vluYUL-X](https://openreview. net/forum? id=WE_vluYUL-X).

Z. Yuan, H. Yuan, C. Li, G. Dong, K. Lu, C. Tan, C. Zhou, and J. Zhou. Scaling relationship on learning mathematical reasoning with large language models. arXiv preprint arXiv: 2308.01825, 2023.

E. Zelikman, Y. Wu, J. Mu, and N. Goodman. STar: Bootstrapping reasoning with reasoning. In A. H. Oh, A. Agarwal, D. Belgrave, and K. Cho, editors, Advances in Neural Information Processing Systems, 2022. URL [https://openreview. net/forum? id=\_3ELRdg2sgI](https://openreview. net/forum? id=_3ELRdg2sgI).

E. Zelikman, G. R. Harik, Y. Shao, V. Jayasiri, N. Haber, and N. Goodman. Quiet-STar: Language models can teach themselves to think before speaking. In First Conference on Language Modeling, 2024. URL [https://openreview. net/forum? id=oRXPiSOGH9](https://openreview. net/forum? id=oRXPiSOGH9).

D. Zhou, N. Schärli, L. Hou, J. Wei, N. Scales, X. Wang, D. Schuurmans, C. Cui, O. Bousquet, Q. V. Le, and E. H. Chi. Least-to-most prompting enables complex reasoning in large language models. In The Eleventh International Conference on Learning Representations, 2023a. URL [https://openreview. net/forum? id=WZH7099tgfM](https://openreview. net/forum? id=WZH7099tgfM).

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instruction-following evaluation for large language models. arXiv preprint arXiv: 2311.07911, 2023b.

86
