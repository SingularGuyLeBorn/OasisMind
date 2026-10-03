---
title: "Seed1.5-Thinking · 对照译稿"
category: "模型库"
tags: ["Doubao", "对照译稿"]
published: true
excerpt: "Seed1.5-Thinking 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 19 -->

arXiv:2504.13914v3 [cs.CL] 29 Apr 2025

I ByteDance Seed

# Seed1.5-Thinking: Advancing Superb Reasoning Models with Reinforcement Learning

ByteDance Seed

Full author list in Contributions

完整作者名单见贡献部分.

## Abstract

We introduce Seed1.5-Thinking, capable of reasoning through thinking before responding, resulting in improved performance on a wide range of benchmarks. Seed1.5-Thinking achieves 86.7 on AIME 2024, 55.0 on Codeforces and 77.3 on GPQA, demonstrating excellent reasoning abilities in STEM and coding. Beyond reasoning tasks, the method demonstrates notable generalization across diverse domains. For instance, it surpasses DeepSeek R1 by 8% in win rate on non-reasoning tasks, indicating its broader applicability. Compared to other state-of-the-art reasoning models, Seed1.5- Thinking is a Mixture-of-Experts (MoE) model with a relatively small size, featuring 20B activated and 200B total parameters. As part of our effort to assess generalized reasoning, we develop two internal benchmarks, BeyondAIME and Codeforces, both of which will be publicly released to support future research. Model trial link: [https://www.volcengine.com/experience/ark](https://www.volcengine.com/experience/ark).

我们推出 Seed1.5-Thinking, 它会在回答前先思考推理, 因此在大量基准上表现更好. Seed1.5-Thinking 在 AIME 2024 上得 86.7, Codeforces 上得 55.0, GPQA 上得 77.3, 在 STEM 和编程上显示出出色的推理能力. 在推理任务之外, 这套方法在多个领域也有明显的泛化. 例如在非推理任务上, 它的胜率比 DeepSeek R1 高 8%, 说明适用面更广. 与其他顶尖推理模型相比, Seed1.5-Thinking 是规模相对较小的 MoE 模型, 激活参数 20B, 总参数 200B. 为评估泛化推理能力, 我们构建了两个内部基准 BeyondAIME 和 Codeforces, 二者都将公开发布, 供后续研究使用. 模型试用链接: [https://www.volcengine.com/experience/ark](https://www.volcengine.com/experience/ark).

**Date:** April 10, 2025

日期: 2025 年 4 月 10 日.

![Chart block](images/p01-figure-1-benchmark-performance-on-reasoning-tasks.png)

Figure 1 Benchmark performance on reasoning tasks

图 1 推理任务上的基准表现.

> **想:** 摘要里 Codeforces 的 55.0 是单次提交的通过率, 还是多次提交取最好?
> 是多次取最好. 表 2 的 Codeforces 有两行: avg@8 为 36.3%, pass@8 为 55.0%, 摘要引的是后者. §1 把 pass@k 定义为 「从 k 份提交里取最好结果」, 所以 55.0 是 8 次里至少对一次的比例; 按单次期望算, 更接近 avg@8 的 36.3. 摘要把 「Codeforces」 列为内部基准, 指的是 §1 所说最近 12 场比赛这套评测协议, 不是一套新出的题库.

<!-- page 2 of 19 -->

## 1 Introduction

Driven by large-scale reinforcement learning on large language models, reasoning models have seen significant advancements. Notably, OpenAI’s o1 series [1], DeepSeek’s R1 [2], Google’s Gemini 2.5 [3], and Anthropic’s Claude 3.7 [4] have emerged as state-of-the-art models, each making substantial progress in logical reasoning, mathematical problem-solving, and code generation. These advancements underscore a shift toward more structured, efficient and scalable reasoning models, with ongoing research focusing on training efficiency, long chain-of-thought, and large-scale reinforcement learning.

在大语言模型上做大规模强化学习, 推动推理模型取得了显著进展. 其中 OpenAI 的 o1 系列 [1], DeepSeek 的 R1 [2], Google 的 Gemini 2.5 [3] 和 Anthropic 的 Claude 3.7 [4] 已成为顶尖模型, 在逻辑推理, 数学解题和代码生成上都有长足进步. 这些进展说明推理模型正转向更结构化, 更高效, 更可扩展的形态, 当前研究集中在训练效率, 长 CoT 和大规模强化学习上.

In this work, we present a new reasoning model, called Seed1.5-Thinking. This model has achieved strong performance in both reasoning and non-reasoning tasks.

本文提出新的推理模型 Seed1.5-Thinking. 它在推理与非推理任务上都表现强劲.

Mathematical Reasoning : For math competition, Seed1.5-Thinking achieves 86.7 on AIME 2024, matching the performance of o3-mini-high and significantly outperforming o1 and DeepSeek R1, demonstrating competitive strength. Since AIME 2024 no longer provides sufficient discrimination, we construct a more challenging evaluation set named BeyondAIME. All problems in BeyondAIME are newly curated by human experts and designed to minimize the chance of being solved through memorization or guessing. While Seed1.5-Thinking surpasses both o1 and R1, there remains a performance gap compared to o3 and Gemini pro 2.5. This also further demonstrates the discriminative power of the new evaluation set.

数学推理: 数学竞赛上, Seed1.5-Thinking 在 AIME 2024 得 86.7, 与 o3-mini-high 持平, 明显超过 o1 和 DeepSeek R1, 竞争力很强. 由于 AIME 2024 已不足以拉开差距, 我们构建了更难的评测集 BeyondAIME. BeyondAIME 的全部题目由人类专家新整理, 设计上尽量降低靠记忆或猜测答对的可能. Seed1.5-Thinking 在这套题上超过 o1 和 R1, 但与 o3 和 Gemini pro 2.5 仍有差距, 这也从侧面说明新评测集的区分度.

> **核对:** BeyondAIME 和公开 AIME 是不是同一套题? 这里说题目 「newly curated」, 那里面还有没有旧题的影子?
> 不是同一套, 但也不全是凭空新题. §2.2 写得更细: 100 道题由数学专家 「参照已有竞赛形式」 编写, 并对已有竞赛题做结构改动和情境重构, 只保证 「没有直接重复」; 难度不低于 AIME 最难题, 答案是整数但不限定数值范围. 所以它降低了背题风险, 没有排除改编题与原题相近的可能. 表 2 里同一模型在 AIME 2024 是 86.7%, 在 Beyond AIME 只有 48.0%, 这个落差既来自难度, 也来自题目新旧.

Competitive Programming : For the evaluation of competitive programming, we adopt Codeforces as our benchmark. Unlike some prior works that rely on Elo Scores, which contains estimation and are not directly comparable, we adopt a concrete evaluation protocol based on the most recent 12 Codeforces contests. Specifically, we report pass@1 and pass@8 metrics, where pass@k indicates whether the model solves the problem within k attempts, i.e., selecting the best result from k generated submissions. We choose to report pass@8 since it provides more stable results and aligns more closely with actual user submission patterns. Seed1.5-Thinking outperforms DeepSeek R1 on both metrics, though a performance gap remains compared to o3. The evaluation set will be made publicly available in a future release.

竞赛编程: 竞赛编程评测采用 Codeforces 作为基准. 一些已有工作依赖 Elo 分, Elo 分含估计成分, 彼此不能直接比较; 我们改用基于最近 12 场 Codeforces 比赛的具体评测协议. 具体地, 我们报告 pass@1 和 pass@8, 其中 pass@k 表示模型能否在 k 次尝试内解出题目, 即从 k 份生成的提交中取最好结果. 选择报告 pass@8, 是因为它结果更稳定, 也更贴近真实用户的提交习惯. Seed1.5-Thinking 在两个指标上都超过 DeepSeek R1, 但与 o3 仍有差距. 该评测集会在后续版本中公开.

> **看表:** 正文说与 「o3」 仍有差距, 可表 2 只有 「OpenAI o3-mini」 一列. 这些对手的 Codeforces 分数是不是也在同一 12 场协议下测的?
> 表 2 的 OpenAI 列只有 o3-mini, §6.1 又写 「o3-mini-high」, 正文的 「o3」 只能对应这一列, 文中没有完整 o3 的数. 这套 12 场评测集尚未公开, o3-mini 的 pass@8 67.5% 和 Gemini 2.5 pro 的 56.3% 只能是作者自己跑的, 但文中没交代对手的采样温度, 最大输出长度和提交次数上限是否一致. 表 2 唯一标了 「内部沙箱」 的是 SWE-bench verified* 一行, Codeforces 两行没有同类说明.

Science : Seed1.5-Thinking reaches a score of 77.3 on GPQA, close to o3-level performance. Importantly, this gain is largely attributed to improved generalization from mathematical training, rather than an increase in domain-specific science data.

科学: Seed1.5-Thinking 在 GPQA 上得 77.3, 接近 o3 水平. 值得注意的是, 这一提升主要来自数学训练带来的泛化, 而非增加特定领域的科学数据.

> **拆开:** GPQA 77.3 被归功于 「数学训练的泛化」, 文中有没有去掉科学数据或去掉数学数据的对照?
> 没有. 支撑这句话的只有两处: §2.1.1 说 STEM 题里数学占 80% 以上, 表 2 里 GPQA diamond 相对 DeepSeek R1 是 77.3% 对 71.5%. 这是跨模型比较, 不是同一模型的消融; 表 3 和表 4 的消融只看 AIME, 不涉及 GPQA. 另外按 §6.1, GPQA 是 8 次回答的平均, 不是单次.

Non-reasoning Tasks : For non-reasoning tasks, Seed1.5-Thinking is evaluated using a test set designed to replicate real-world user needs. Through human evaluations conducted against DeepSeek R1 across diverse scenarios, Seed1.5-Thinking demonstrates significant advancements: it attains an 8.0% overall rise in users’ positive feedback, thereby highlighting its augmented ability to manage intricate user scenarios.

非推理任务: 非推理任务用一套模拟真实用户需求的测试集评估. 在多种场景下与 DeepSeek R1 做人工对比评估, Seed1.5-Thinking 进步明显: 用户正向反馈整体提升 8.0%, 说明它处理复杂用户场景的能力更强.

There are three key points in the development of high-quality reasoning models: training data, RL algorithm, and RL infrastructure. We have devoted considerable effort to these three areas, and we will discuss them in detail.

开发高质量推理模型有三个关键: 训练数据, 强化学习算法和强化学习基础设施. 我们在这三方面投入了大量精力, 下面逐一详述.

Data For SFT training, unlike conventional post-training data, reasoning models rely on chain-of-thought data, which explicitly outlines the step-by-step reasoning process. Our preliminary experiments showed that too much non-CoT SFT data can significantly reduce the model’s ability to explore. For RL training, we incorporate four categories of data: STEM problems, code-related tasks, logic reasoning and non-reasoning data like creative writing and dialogue. Among these, the logic reasoning data contributes to performance improvements on the ARC-AGI benchmark significantly. The math data exhibits strong generalization capabilities and can lead to broad performance improvements across tasks.

数据: SFT 训练方面, 推理模型与常规后训练数据不同, 依赖 CoT 数据, 即把逐步推理过程明确写出来的数据. 我们的初步实验表明, 非 CoT 的 SFT 数据过多会明显削弱模型的探索能力. 强化学习训练方面, 我们纳入四类数据: STEM 题, 代码类任务, 逻辑推理, 以及创意写作和对话等非推理数据. 其中逻辑推理数据对 ARC-AGI 基准的提升贡献显著. 数学数据泛化能力强, 能带动各类任务的整体提升.

RL Algorithm RL training of reasoning models is highly unstable and often crashes, especially for models without SFT. Sometimes, the score difference between two runs can be as high as 10 points. The stable training of RL systems is crucial for the success of reasoning models. To address these long-standing issues, we have pioneered VAPO[5] and DAPO[6]—two distinct frameworks tailored for actor-critic and policy-gradient RL paradigms, respectively. VAPO now stands as the state-of-the-art (SOTA) solution in actor-critic methods, while DAPO establishes a new SOTA result for policy-gradient approaches

<!-- page 3 of 19 -->

without critic models. By targeting the core instability issues in RL training, both methods deliver robust and consistent training trajectories, effectively enabling reliable optimization of reasoning models.

强化学习算法: 推理模型的强化学习训练很不稳定, 经常崩溃, 没有经过 SFT 的模型尤甚. 有时两次运行的分数能差到 10 分. 强化学习系统能否稳定训练, 是推理模型成败的关键. 为解决这些长期问题, 我们率先提出 VAPO [5] 和 DAPO [6], 分别面向 actor-critic 与 policy-gradient 两种强化学习范式. VAPO 目前是 actor-critic 方法中的 SOTA 方案, DAPO 则在不用 critic 模型的 policy-gradient 方法上刷新了 SOTA. 两者都针对强化学习训练的核心不稳定问题, 给出稳健一致的训练轨迹, 让推理模型的优化变得可靠.

RL Infrastructure The complexity of Large Language Models (LLM) based reinforcement learning systems demands robust infrastructure to ensure scalability, reproducibility, and computational efficiency. To handle heterogeneous workloads, we decouple streaming rollout architecture that asynchronously processes partial trajectory generations through prioritized sample pools, achieving 3× faster iteration cycles than synchronous frameworks. The system also supports mixed-precision training with automatic fault recovery, critical for maintaining stability during large-scale RL runs.

强化学习基础设施: 基于大语言模型的强化学习系统很复杂, 需要稳健的基础设施来保证可扩展性, 可复现性和计算效率. 为应对异构负载, 我们采用解耦的流式 rollout 架构, 通过带优先级的样本池异步处理部分轨迹的生成, 迭代周期比同步框架快 3×. 系统还支持混合精度训练和自动故障恢复, 这对大规模强化学习运行保持稳定至关重要.

## 2 Data 数据

### 2.1 RL Training Data 强化学习训练数据

Our RL training data consists of two main parts: verifiable problems with definitive answers and non-verifiable problems without definitive answers. The model’s reasoning ability primarily comes from the first part and can be generalized to the second part.

我们的强化学习训练数据由两部分组成: 有确定答案的可验证问题, 和没有确定答案的不可验证问题. 模型的推理能力主要来自前者, 并能泛化到后者.

#### 2.1.1 Verifiable Problems 可验证问题

The Verifiable problems primarily comprise STEM questions paired with answers, coding problems equipped with unit tests, and logic reasonings that are amenable to automated verification.

可验证问题主要包括配有答案的 STEM 题, 配有单元测试的编程题, 以及可自动核验的逻辑推理题.

##### STEM Data STEM 数据

Our dataset consists of several hundred thousand high-quality, competition-grade problems spanning mathematics, physics, and chemistry, with mathematics comprising the majority (over 80%). These problems are drawn from a mix of open-source datasets, public competitions (both domestic and international), and proprietary collections.

数据集包含数十万道高质量竞赛级题目, 覆盖数学, 物理和化学, 其中数学占多数 (超过 80%). 题目来源混合了开源数据集, 国内外公开竞赛和自有题库.

For data cleaning, we first eliminate questions with incomplete statements, inconsistent notation, or unclear requirements. For the remaining questions, we use our model (Doubao-Pro 1.5) to generate multiple responses. Problems for which the model achieved a woN score (worst of N) of 1 are deemed too simple and removed. Finally, some questions may have an inaccurate reference answer. We use SOTA reasoning models to generate multiple candidate responses for each question. If the model’s answers were inconsistent with the reference answer, but the model’s outputs showed high internal consistency, or involved only a very small number of reasoning tokens, we consider the reference answer to be incorrect. Human experts then conduct manual verification on these questions to ensure that the reference answers are correct. We also apply data augmentation to make the data more suitable for learning and evaluation. Specifically, we convert multiple-choice questions into fill-in-the-blank or short-answer formats to eliminate the possibility of guessing and to better assess reasoning ability. And we modify certain math problems to ensure that the answers are integers whenever possible.

数据清洗时, 先剔除题干不完整, 记号不一致或要求不清的题目. 对剩下的题目, 用我们的模型 (Doubao-Pro 1.5) 生成多个回答; woN 分数 (N 次中最差的一次) 为 1 的题目被视为太简单而移除. 最后, 有些题的参考答案可能不准. 我们用 SOTA 推理模型为每道题生成多个候选回答: 如果模型答案与参考答案不一致, 但模型输出之间高度自洽, 或只用了极少的推理 token, 就认为参考答案有误. 随后由人类专家人工核验这些题, 确保参考答案正确. 我们还做了数据增强, 让数据更适合学习与评测. 具体地, 把选择题改成填空或简答形式, 消除猜答案的可能, 更好地考察推理能力; 并修改部分数学题, 尽量让答案为整数.

After data cleaning and augmentation, we finally obtain a training set of 100k STEM problems. During training, we use model-based Seed-Verifier to evaluate response correctness, which is introduced in 3.1.

经过清洗与增强, 最终得到 100k 道 STEM 训练题. 训练中用基于模型的 Seed-Verifier 判断回答是否正确, 详见 3.1 节.

> **对一下:** 这里 STEM 训练题清洗后是 100k, §4.1 却说 SFT 的 300k 可验证 prompt 「从强化学习训练集中随机采样」. 强化学习训练集够 300k 吗?
> 按文中给出的数加不出来. §2.1.1 只给了 STEM 100k 和逻辑谜题约 10k, 代码题没给数量; §4.1 的 300k 用的词是 「training instance」, 可能包含同一 prompt 的多条拒绝采样轨迹, 也可能代码题量很大, 两种解读文中都没排除. 另一个没交代的数是 woN 过滤里的 N: 只知道 N 次全对的题被删, 本节既没给 N, 也没给删题比例, 表 1 之前没有任何表格覆盖这一步.

##### Code Data 代码数据

For coding problems, we prioritize the source of high-quality and challenging algorithmic tasks, primarily drawn from esteemed competitive programming contests.

编程题方面, 我们优先选取高质量, 有挑战的算法题, 主要来自知名的竞赛编程比赛.

We filter data to ensure that each problem includes a comprehensive specification: a clear problem description, a set of unit tests, and a checker script. Unit tests validate the functional correctness of solutions, while the checker script enforces additional constraints such as output formatting and edge cases. We also perform difficulty filtering, ensuring that problems possess an appropriate level of complexity and applicability to real-world algorithmic reasoning.

我们过滤数据, 确保每道题都有完整规格: 清晰的题目描述, 一组单元测试和一个 checker 脚本. 单元测试验证解法的功能正确性, checker 脚本检查输出格式和边界情况等额外约束. 我们还做了难度过滤, 保证题目复杂度适当, 且贴近真实的算法推理.

For evaluation, the most accurate form is to submit the generated code to the official platforms. However, during reinforcement learning, real-time submission isn’t feasible. Thus, we developed an off-line evaluation

<!-- page 4 of 19 -->

set for efficient local validation. Our observations indicate a strong correlation between offline evaluation results and official verdicts. All training and evaluation problems are integrated into an in-house code sandbox environment, enabling direct execution and assessment of model-generated code. We ensure the sandbox’s stability and high throughput to deliver consistent and accurate feedback during the RL training process.

评测方面, 最准确的方式是把生成的代码提交到官方平台. 但强化学习过程中无法实时提交, 因此我们开发了离线评测集, 用于高效的本地验证. 我们观察到离线评测结果与官方判定高度相关. 所有训练和评测题目都集成到内部代码沙箱环境中, 可以直接执行并评估模型生成的代码. 我们保证沙箱稳定且吞吐高, 以便在强化学习训练中提供一致准确的反馈.

##### Logical Puzzle Data 逻辑谜题数据

For the logic reasoning data, we gather 22 commonly studied tasks, such as 24-point, mazes, Sudoku, etc. For each task, we construct a data generator and an answer verifier. The data generator can automatically produce a large amount of training and evaluation data. Moreover, for many of the tasks, we can configure the difficulty of the generated problems. During the training process, we gradually adjust the difficulty of the training data based on the model’s performance on certain tasks. The answer verifier rigorously evaluates the generation correctness and can be seamlessly integrated into RL pipelines as reward functions. We generate about 10k puzzle problems for RL training.

逻辑推理数据方面, 我们收集了 22 个常见研究任务, 如 24 点, 迷宫, 数独等. 每个任务都构建一个数据生成器和一个答案验证器. 数据生成器能自动产出大量训练和评测数据, 而且很多任务可以配置生成题目的难度. 训练中, 我们根据模型在某些任务上的表现逐步调整训练数据难度. 答案验证器严格评估生成结果的正确性, 可以作为奖励函数无缝接入强化学习流水线. 我们生成了约 10k 道谜题用于强化学习训练.

> **问:** 谜题数据 「根据模型表现逐步调整难度」, 这和 §4.2 的 Online Data Distribution Adaptation 是同一个机制吗? ARC-AGI 的提升有没有单独归因实验?
> 文中没有把两者等同. 本节的调难度发生在单个谜题生成器内部, 改的是题目参数; §4.2 改的是不同领域 prompt 的混合分布, 两处都没给阈值或更新公式. ARC-AGI 方面, §1 把提升归给逻辑推理数据, 表 2 里是 39.9% 对 DeepSeek R1 的 18.3%, 但没有 「去掉约 10k 谜题」 的消融, 归因只是作者的判断.

#### 2.1.2 Non-verifiable Problems

Non-verifiable problems mainly encompass non-reasoning tasks requiring quality assessment based on human preferences, involving tasks like creative writing, translation, knowledge QA, role-playing, and so on. The prompts are originated from RL training data for Doubao-1.5 Pro [7]. The dataset has sufficient coverage across diverse domains.

不可验证问题主要是非推理任务, 质量要按人的偏好来评, 包括创意写作, 翻译, 知识问答, 角色扮演等. prompt 来自 Doubao-1.5 Pro 的强化学习训练数据. 覆盖面够广.

We discard data with low sample score variance and low difficulty. To be specific, we use the SFT model to generate multiple candidates for each prompt and then score them using a reward model. Prompts with low score variances are removed as they exhibit limited sampling diversity and minimal potential for improvement. Prompts are also removed where the reward score improvement surpasses a certain threshold during the Doubao 1.5 Pro RL training process [8]. This is because such data may be overly simplistic or already abundantly represented in the dataset. Offline experiments show that overoptimizing such samples leads to premature collapse of the model's exploration space and diminish the performance.

低分差, 低难度的数据被丢掉. 具体做法是用 SFT 模型对每个 prompt 采多份候选, 再用奖励模型打分. 分差低的 prompt 去掉, 因为采样多样性小, 提升空间也小. Doubao 1.5 Pro 强化学习过程中奖励提升已经超过某阈值的 prompt 也去掉, 因为可能太简单, 或数据集里已经很多. 离线实验表明, 过度优化这类样本会让探索空间过早塌缩. 阈值本身没有印出来.

For these non-verifiable data, we employ a pairwise rewarding method for scoring and RL training. By comparing the relative quality of two samples, this approach aids the model in better understanding user preferences, enhancing the quality and diversity of generated results. The detail of the reward model is introduced in 3.2.

这类数据用成对奖励来打分和训练: 比较两份样本谁更好. 奖励模型细节在 3.2.

> **核对:** 已经在 Doubao 1.5 Pro 上涨过奖励的 prompt, 为什么从这轮训练集里删掉?
> 正文的理由是它们可能太简单, 或已经大量出现. 删的标准是 「奖励提升超过某阈值」, 阈值没给. 留下的是分差还不低, 而且上一轮模型没把分抬过线的题. 这和 「难题才有梯度」 是同一方向, 但和 §4.2 的动态采样不是同一步: 动态采样是批内丢掉准确率已经是 0 或 1 的 prompt, 这里是训练前按历史奖励涨幅删 prompt.

### 2.2 Advanced Math Benchmark

The current reasoning models usually use AIME as the go-to benchmark to evaluate mathematical reasoning abilities. However, with only 30 problems released annually, its limited size can lead to high-variance evaluation results, making it challenging to effectively differentiate between state-of-the-art reasoning models. To better evaluate models' capabilities in mathematical reasoning, we construct a new benchmark dataset: **BeyondAIME**. Specifically, we collaborate with mathematics specialists to develop original problems informed by established competition formats. We systematically adapt existing competition questions through structural modifications and scenario reconfigurations, ensuring no direct duplication occurs. Furthermore, we ensure that the answers are never trivial values—such as numbers explicitly mentioned in the problem statement—to reduce the chance of models guessing the correct answer without proper reasoning.

公开 AIME 每年只有 30 题, 方差大, 分不出顶尖模型. BeyondAIME 由数学专家按竞赛格式出原题, 并对已有竞赛题做结构和情境改写, 避免直接重复. 答案不会是题干里已经写出的那种平凡数, 以降低不推理就猜中的可能.

Through this rigorous filtering and curation process, we compile a final set of 100 problems, each with a difficulty level equal to or greater than that of the hardest questions in AIME. Similar to AIME, all answers are guaranteed to be integers (without being restricted to a specific numerical range), which simplifies and stabilizes the evaluation process.

最终 100 题, 难度不低于 AIME 最难题. 答案保证是整数, 不限定数值范围, 评测因此更稳.

<!-- page 5 of 19 -->

## 3 Reward Modeling

As a crucial component in RL, reward modeling defines the objective or goal that the policy is trying to achieve. Thus, a well-designed reward mechanism is essential to provide precise and reliable reward signals for model responses during the training stage. For verifiable and non-verifiable problems, we employ distinct reward modeling methodologies.

奖励建模定义策略要优化的目标. 可验证题和不可验证题用两套奖励.

| Verifier-type | Training examples (approximate) | Human labeled testset |
| --- | --- | --- |
| Seed-Verifier | > 98% | 82.7% |
| Seed-Thinking-Verifier | > 99% | 99.3% |

Table 1 Accuracy of two verifier-types. Specifically, the accuracy on the training set is derived from the training statistics. Additionally, we manually annotated 456 samples to form the test set, which are specifically selected from cases that the Seed-Verifier can not handle stably.

表 1 两种验证器的准确率. 训练集准确率来自训练统计. 另外人工标注了 456 条测试, 专门从 Seed-Verifier 处理不稳定的案例里挑出.

> **看表:** 表 1 里训练集都在 98% 以上, 人工测试集却从 82.7% 跳到 99.3%. 这 456 条能代表一般题吗?
> 不能. 表注写明测试集是从 Seed-Verifier 无法稳定处理的案例里挑的, 不是随机抽的. 所以 82.7% 对 99.3% 量的是难例, 不是全量准确率. 训练集上 >98% 对 >99% 几乎分不开. 把 99.3% 说成验证器在所有数学题上的准确率, 会把挑选过的分母说大.

### 3.1 Reward Modeling for Verifiable Problems

With proper principles and thought trajectories, we utilize LLMs to judge a wide array of verifiable questions across diverse scenarios. This approach yields a more generalized solution that surpasses the limitations of rule-based reward systems.

用写好的原则和思考轨迹, 让 LLM 判断多种可验证题, 以越过纯规则奖励的限制.

We have designed two progressive reward modeling solutions, **Seed-Verifier** and **Seed-Thinking-Verifier**:

两套递进的方案是 **Seed-Verifier** 和 **Seed-Thinking-Verifier**.

Seed-Verifier 依据人写的原则, 看题目, 参考答案, 模型答案这三元组. 若两者在计算规则和数学意义上等价, 返回 YES, 否则 NO. 不是字符串精确匹配. 例如格式不同但值相同, 也应算对.

Seed-Thinking-Verifier 会先写出判断的推理路径, 并和其他数学推理任务一起, 当作可验证任务来优化. 它要拆开参考答案和模型答案的异同.

正文说它缓解三件事: 不思考的模型钻空子拿奖励; 等价但写法不同时 YES/NO 摇摆, 例子是 2^19 和 524288; 以及 Seed-Verifier 处理不了的边角. 思考过程更费 GPU. 作者认为精确奖励对策略的推理能力是必要的.

### 3.2 Reward Modeling for Non-verifiable Problems

For non-verifiable problems, we train a reward model for RL training. The reward model training data is consistent with the human preference data utilized in Doubao 1.5 Pro [7], primarily encompassing categories such as creative writing and summarization.

不可验证题另训一个奖励模型, 数据和 Doubao 1.5 Pro 的人类偏好数据一致, 主要是创意写作和摘要.

To enhance the effectiveness of reward model, we adopt the pairwise generative reward model mentioned in [9], which evaluates the superiority of two responses and use the probability of "YES" or "NO" as the final reward score. This approach enables the model to directly compare differences between responses during scoring, thereby avoiding excessive focus on irrelevant details. Experimental results demonstrate that this reward modeling method improves the stability of RL training, particularly in the mixed training scenarios involving both non-verifiable and verifiable problems, by minimizing conflicts between the two different types of reward modeling paradigms. This improvement may be attributed to the pairwise generative reward model’s inherent advantage in mitigating outlier score generation compared to conventional reward models, therefore avoiding significant discrepancies in score distributions with the verifier.

成对生成式奖励模型比较两份回答谁更好, 用 YES 或 NO 的概率当最终奖励分. 混着可验证题训练时, 这比常规奖励模型更不容易打出离群分, 从而和验证器的分数分布不至于差太远. 文中没有给出冲突下降了多少个百分点.

<!-- page 6 of 19 -->

## 4 Approach

### 4.1 Supervised Fine-Tuning

Our training process starts with supervised fine-tuning (SFT). The SFT phase sets a solid foundation for the subsequent reinforcement learning stage. Compared to initiating RL from a base model, the SFT model produces more readable outputs, exhibits fewer instances of hallucination, and demonstrates reduced harmfulness. We curate an SFT data comprising 400k training instance, including 300k verifiable problems and 100k non-verifiable problems. Verifiable prompts are randomly sampled from RL training set. Non-verifiable data are sourced from the SFT data used for Doubao-Pro 1.5 [7], covering areas such as creative writing, knowledge-based QA, safety, and function calling.

训练从 SFT 开始. 相对直接从基座做强化学习, SFT 后的输出更可读, 幻觉更少, 有害性更低. SFT 数据 400k: 可验证 300k, 不可验证 100k. 可验证 prompt 从强化学习训练集随机采样. 不可验证数据来自 Doubao-Pro 1.5 的 SFT 数据, 含创意写作, 知识问答, 安全和函数调用.

To generate high-quality responses with long CoT, we employ an iterative workflow that integrates model synthesis, human annotation, and rejection sampling. Initially, human experts apply prompt engineering techniques or engage in interactive dialogues with an internal model to produce responses with various reasoning patterns. After accumulating tens of high-quality cold-start samples, we can train a reasoning model with long CoT as a more capable assistant. Then we perform rejection sampling on this reasoning model using Seed-Verifier. While this workflow is primarily applied to mathematical data, we observe it can generalize well to other domains, such as coding, logic puzzle and even creative writing. Thus, for other domains, we also conduct a cold start process followed by rejection sampling to produce detailed reasoning trajectories.

长 CoT 的回答用迭代流程: 模型合成, 人工标注, 拒绝采样. 专家先用提示或和内部模型对话, 做出几十条高质量冷启动. 再训一个会长 CoT 的模型, 用 Seed-Verifier 做拒绝采样. 这套主要用在数学上, 作者观察到也能泛化到代码, 逻辑谜题甚至创意写作. 其他领域同样是冷启动再拒绝采样.

During training, each instance is truncated to 32,000 tokens. We fine-tune the base model for two epochs using the above data. We use a cosine decay learning rate scheduling that the peak lr is $2 \times 10^{-5}$ and decays to $2 \times 10^{-6}$ gradually.

每条截断到 32,000 token. 基座微调 2 个 epoch. 学习率余弦衰减, 峰值 $2 \times 10^{-5}$, 降到 $2 \times 10^{-6}$.

### 4.2 Reinforcement Learning

We have developed a unified reinforcement learning framework that seamlessly fuses data from a broad range of domains. This integration incorporates three data categories:

统一的强化学习框架混三类数据: 验证器打分的可验证数据; 奖励模型打分的一般数据; 以及两种分数一起用的混合数据.

In the context of long-CoT RLHF, we encounter several challenges such as value model bias and the sparsity of reward signals. To address these issues, we draw on key techniques from our prior work [5, 6, 10]:

长 CoT 的 RLHF 遇到价值模型偏差和奖励稀疏. 用到先前工作里的几项技术.

Value-Pretraining: 从固定策略 $\pi_{\mathrm{sft}}$ 采样, 用蒙特卡洛回报更新价值模型, 使初始价值模型和 $\pi_{\mathrm{sft}}$ 对齐. 作者认为这对保住 CoT 形态是必要的.

Decoupled-GAE: $\lambda_{\mathrm{value}} = 1.0$, $\lambda_{\mathrm{policy}} = 0.95$. 价值模型按无偏方式更新, 策略自己另平衡偏差和方差.

Length-adaptive GAE: $\lambda_{\mathrm{policy}} = 1 - \frac{1}{\alpha l}$, $\alpha$ 是超参, $l$ 是回答长度. 目的是让 TD 误差在短序列和长序列上更均匀. $\alpha$ 的取值没有印出.

Dynamic Sampling: 丢掉准确率为 1 或 0 的 prompt, 批里只留还有有效梯度的.

Clip-Higher: PPO 的上下 clip 拆开, 式 (1):

$$\mathcal{L}^{CLIP}(\theta) = \hat{\mathbb{E}}_t \left[ \min \left(r_t(\theta) \hat{A}_t, \mathrm{clip}(r_t(\theta), 1 - \epsilon_{\mathrm{low}}, 1 + \epsilon_{\mathrm{high}}) \hat{A}_t\right) \right]$$

把 $\epsilon_{\mathrm{high}}$ 加大, 给低概率 token 更多上升空间.

Token-level Loss: 策略损失定义在全部 token 上, 而不是整段回答上, 以免长短回答对损失的贡献不均衡.

Positive Example LM Loss, 式 (2): $\mathcal{L}(\theta) = \mathcal{L}_{\mathrm{PPO}}(\theta) + \mu \mathcal{L}_{\mathrm{NLL}}(\theta)$. 正样本再加一项语言模型损失, 系数 $\mu$ 没有给数值.

Online Data Distribution Adaptation 把强化学习里静止的 prompt 分布改成随训练变化的分布, 用来减轻领域之间的互相干扰. 干扰来自难度差和奖励钻空. 没有给出每一轮的混合比例.

> **对一下:** $\lambda_{\mathrm{value}} = 1.0$ 和 $\lambda_{\mathrm{policy}} = 0.95$ 之后, 又写 $\lambda_{\mathrm{policy}} = 1 - 1/(\alpha l)$. 策略用的是哪一个 $\lambda$?
> 两句不是同一个超参同时生效. Decoupled-GAE 那句给的是价值模型和策略可以各用一个常数, 例子是 1.0 和 0.95. Length-adaptive 那句把策略的 $\lambda$ 改成随长度变的式子. $l$ 很大时这个式子靠近 1, 短回答则更小. $\alpha$ 没给, 所以不能把 0.95 代进去算出一个长度. 价值模型仍是 $\lambda = 1$, 也就是蒙特卡洛回报, 不跟着这个式子走.

<!-- page 7 of 19 -->

> **想:** 式 (2) 在 PPO 损失上加 $\mu$ 倍的正样本 NLL. $\mu$ 很大时, 这项和式 (1) 的 clip 是同一方向吗?
> 不一定. 式 (1) 用 $\epsilon_{\mathrm{high}}$ 放宽的是概率比的上界, 鼓励低概率 token 上升, 仍受 clip 限制. 式 (2) 的 NLL 是直接提高正样本 token 的似然, $\mu$ 若很大, 这项可以压过 clip 的约束. 论文没有给 $\mu$, 也没有消融 $\mu$ 和 $\epsilon_{\mathrm{high}}$ 谁主导. 能确定的只有: 正样本被用了两次, 一次在 PPO 优势里, 一次在额外的 NLL 里.

## 5 Infrastructures

### 5.1 Framework

训练框架用 HybridFlow, 跑在 Ray 上. 数据加载和 RL 算法在单个 Ray Actor 里. 训练和生成在 Ray Worker Group, 组内用 SPMD. 单控制器调用 generate_response 和 train_batch 来串起训练流.

Seed1.5-Thinking 用混合引擎, 各模型放在一起, 避免训练和生成切换时 GPU 空等. 长 CoT 生成时, 不同 prompt 的回答长度差很大, 出现落后者, GPU 空等严重. SRS (Streaming Rollout System) 用独立的流式计算单元, 把约束从内存侧转到计算侧.

### 5.2 Streaming Rollout System

SRS 用完成比例 $\alpha \in [0,1]$ 表示用最新模型做 on-policy 生成的样本占比. 剩下的 $1-\alpha$ 用来自旧快照的 off-policy rollout, 在独立资源上把未完成的生成异步接下去. 环境和交互阶段还有 FP8 策略网络, 以及 TP, EP, SP 三层并行. $\alpha$ 的具体数值没有给.

### 5.3 Training System

并行是 TP, EP, CP 加上 FSDP. 注意力层用 TP 和 CP, MoE 层用 EP. 序列长度在 DP rank 之间可能不均衡, 用 KARP 在一个 mini-batch 内重排, 让 micro-batch 更均衡. 内存上用逐层重计算, 激活卸载和优化器卸载. AutoTuner 按剖面估计显存和速度, 选配置. ByteCheckpoint 支持从不同分布式配置恢复.

<!-- page 8 of 19 -->

这些是训练系统的调度, 不是模型结构的公式. 论文没有因此改写 20B 激活和 200B 总参数的定义.

<!-- page 9 of 19 -->

## 6 Experiment Results

### 6.1 Auto Evaluation Results

Table 2. 数学题是 32 次回答的平均. GPQA 是 8 次平均. Codeforces 同时报告 avg@8 和 pass@8, 因为 pass@8 更接近人的提交习惯. 其余任务是 1 次回答的平均.

| Benchmark | Seed1.5-Thinking | DeepSeek R1 | OpenAI o3-mini | Grok 3 Beta | Gemini 2.5 pro |
| --- | --- | --- | --- | --- | --- |
| AIME 2025 | 74.0% | 65.0% | 86.5% | 77.3% | 86.7% |
| AIME 2024 | 86.7% | 79.8% | 87.3% | 83.9% | 92.0% |
| Beyond AIME | 48.0% | 42.4% | 63.6% | - | 58.8% |
| GPQA diamond | 77.3% | 71.5% | 79.7% | 80.2% | 84.0% |
| SuperGPQA | 62.1% | 60.5% | 52.2% | 62.8% | 65.3% |
| MMLU-PRO | 87.0% | 85.6% | 82.4% | 84.6% | 86.3% |
| Codeforces avg@8 | 36.3% | 32.0% | 50.9% | - | 40.3% |
| Codeforces pass@8 | 55.0% | 45.0% | 67.5% | - | 56.3% |
| LiveCodeBench v5 | 64.9% | 64.3% | 74.1% | 70.6% | 70.4% |
| Aider Polyglot | 54.2% | 56.9% | 68.6% | - | 74.0% |
| SWE-bench verified | 47.0% | 49.2% | 49.3% | - | 63.8% |
| SWE-bench verified * | 47.0% | 46.2% | 44.5% | - | 63.8% |
| ARC-AGI | 39.9% | 18.3% | 25.8% | 31.9% | 27.6% |
| SimpleQA | 12.9% | 30.1% | 13.8% | 43.6% | 52.9% |
| Collie | 73.1% | 34.2% | 87.6% | 33.6% | 62.5% |
| IFEval | 87.4% | 86.1% | 93.7% | 83.4% | 91.5% |

星号行是内部沙箱, 可能和公开报告的环境不一致. 横线不是零.

数学上 AIME 2024 的 86.7 被说成对齐 OpenAI o3-mini-high. 更新的 AIME 2025 和 BeyondAIME 仍落后于 o3 这一档. GPQA 77.3% 接近 o3-mini-high 的说法, 表上 o3-mini 是 79.7%. Codeforces 接近 Gemini 2.5 Pro, 仍落后 o3-mini. SimpleQA 明显弱, 作者说这项更像记忆, 和预训练规模的相关强于和推理的相关.

> **拆开:** 摘要的 AIME 86.7 和表 2 的 86.7% 是同一次测量吗? 表头的 o3-mini 87.3% 为什么被说成 「对齐 o3-mini-high」?
> 数字对得上 AIME 2024 那一行, 但口径要补上: §6.1 写数学结果是 32 次回答的平均, 摘要没写 avg@32. 表的列名是 OpenAI o3-mini, 不是 o3-mini-high, 这一列是 87.3%, 比 86.7 高 0.6. 正文的 「对齐 o3-mini-high」 没有单独一列. AIME 2025 是 74.0%, 低于 o3-mini 的 86.5% 和 Gemini 的 86.7%. 摘要只引了 2024.

> **确认:** SWE-bench 两行 Seed 都是 47.0%, 能不能说沙箱不影响排名?
> 不能. Seed 和 Gemini 两行相同, DeepSeek R1 从 49.2% 降到 46.2%, o3-mini 从 49.3% 降到 44.5%. 公开那一行 Seed 低于 R1 和 o3-mini. 内部沙箱那一行 Seed 高于这两家. 排名翻转发生在对照模型上, 不是发生在 Seed 自己的数字上. 脚注说环境不一致会导致和公开报告不同.

<!-- page 10 of 19 -->

### 6.2 Human Evaluation Results

To evaluate model performance on subjective tasks, where automated metrics are insufficient to capture nuanced human preferences, we conduct human evaluations across a diverse suite of non-reasoning scenarios. Our assessments are designed to measure key dimensions of quality, such as coherence, relevance, creativity, and adherence to human-centric preferences, with a panel of domain-expert evaluators rating model outputs against Deepseek R1 under predefined rubrics. We use a 5-point ordinal scale, ranging from 0(very poor) to 4(excellent), and evaluate both models on session prompts with multiple rounds. Each full session is annotated with a binary win/loss outcome to capture the overall user experience and a single 0-4 score is assigned per-round.

主观任务由领域专家按量表对照 DeepSeek R1 打分. 量表是 0 到 4. 多轮 session 上, 整个 session 给一个胜负, 每一轮另给一个 0 到 4 的分.

Seed1.5-Thinking achieves an overall win ratio of 8.0% on the evaluated sessions, indicating superiority in aligning with human-centric preferences. Further more, this win rate is consistent across diverse scenarios, from creative writing to humanities knowledge elaboration. Figure 2 shows the per-round level score distribution.

评测的 session 上总胜率 8.0%. 作者说从创意写作到人文知识都一致. 图 2 是逐轮分数分布, 不是这个胜率本身.

![Chart block](images/p10-figure-2-rating-distribution.png)

Figure 2 Rating Distribution

图 2 评分分布.

> **回看:** 摘要说非推理任务胜率比 DeepSeek R1 高 8%, §6.2 的 8.0% 是不是同一个数, 和图 2 是不是同一张账?
> 两句的数字相同, 对象都是相对 R1 的非推理比较, 可以当成同一处结果. 但它不是 0 到 4 分数的平均. §6.2 写明 8.0% 是 session 的胜负比. 每一轮的 0 到 4 分另计, 图 2 画的是这个分布. 没有给出评了多少个 session, 所以 8.0% 的分母未知. 也不能从图 2 的柱高反推出 8%.

### 6.3 Effects of pre-train models

Rejection sampling 的消融: 用 RFT 模型初始化强化学习, 训练中更快饱和, 最终却低于不用 RFT 的模型. 表 3 里 AIME avg@32, Baseline 58%, w/ RFT 54%.

算法排序在不同规模上一致. 表 4: Qwen-32B 上 DAPO 50%, VAPO 60%. Seed-150B-MoE 上 DAPO 73%, VAPO 79%. 表注写 Seed-150B-MoE 只是有限步数的消融, 不是发布的 Seed1.5-Thinking. 排序一致意味着 Qwen-32B 可以当算法搜索的代理, 不意味着 73% 能和发布模型的 AIME 86.7 相减.

MinerU 把表 3 和表 4 拼进了同一个网格. 读的时候要拆开: 58% 和 54% 是有没有 RFT 的 AIME avg@32. 50% 和 60%, 73% 和 79% 是 DAPO 对 VAPO, 模型分别是 Qwen-32B 和 Seed-150B-MoE.

> **停一下:** §4.1 用拒绝采样制造 SFT 的长 CoT, §6.3 却说用 RFT 初始化强化学习最终更差. 拒绝采样是帮了还是害了?
> 两处不是同一次使用. §4.1 的拒绝采样发生在造 SFT 数据的时候, 用 Seed-Verifier 滤轨迹, 然后才进入强化学习. §6.3 比的是强化学习的起点是不是一个 RFT 模型. 表 3 的结果是起点用了 RFT 则 AIME avg@32 从 58% 降到 54%, 而且更早饱和. 所以 「用拒绝采样造冷启动数据」 没有被这张表否定, 「把 RFT 模型当作 RL 的初始策略」 被这张表否定.

> **再看:** 表 4 的 VAPO 高于 DAPO, 能不能把 Seed-150B-MoE 的 79% 当成发布模型的算法上限?
> 不能. 表注写这是有限步数的消融, 模型也不是摘要里的 200B 总参数, 20B 激活那一版. 79% 和 73% 只说明在这个代理上 VAPO 高于 DAPO, 和 Qwen-32B 上 60% 高于 50% 的方向一致. 绝对分不能和表 2 的 86.7 比, 步数和模型都不同.

<!-- page 11 of 19 -->

## 7 Related Work

Test-time scaling, 例如 OpenAI o1 和 DeepSeek R1, 被写成范式变化. 长 CoT 和大规模强化学习让模型在 AIME, Codeforces 这类竞赛题上变强. 作者认为可扩展强化学习的关键算法在已有推理模型的技术文档里常常被省略. 这里的 test-time scaling 是推理时多花算力, 写成 TestingTime, 不是部署前把模型做大.

本文从数据, RL 算法, RL 基础设施三方面交代 Seed1.5-Thinking 如何达到文中的性能.

## 8 Conclusion

Seed1.5-Thinking 在推理和非推理任务上都强. 结论里的数字是 AIME24 86.7%, AIME25 74.0%, Codeforces 55.0%. 55.0% 仍是表 2 的 pass@8, 不是 avg@8 的 36.3%. 以后的方向是更高效的 RL 配方, 以及和验证器准确率相当的通用奖励模型. 这些是计划, 不是已经做出的结果.

<!-- page 12 of 19 -->

## 9 Contributions and Acknowledgments

姓名按姓的字母序. 星号表示已离开团队. 名单保留原文, 不译.

<!-- page 13 of 19 -->

贡献者名单续, 保留原文.

<!-- page 14 of 19 -->

## References

参考文献保留原文, 不另起译名行.

<!-- page 15 of 19 -->

## Appendix

## A Case Study on Verifier

表 5 用一道序列计数题对比两种验证器. 参考答案给递推 $f(1)=3$, $f(2)=9$, $f(n)=2f(n-1)+f(n-2)$. 模型给的是闭式. Seed-Verifier 判成不正确. Seed-Thinking-Verifier 逐步检查闭式在 n=1, 2 上等于 3 和 9, 并且满足该递推, (b) 的极限两边都是 0, 因而判成正确. 案例说明等价判断依赖推理, 不依赖字符串相同. 完整推导表留在源文.

## B Case Study on Creative Writing

表 6, 7, 8 是创意写作例子, 每例分用户 prompt, CoT, 最终回答. 用来展示非推理任务上的长思考, 不进入能力表的数字. 例子正文不另抄.

<!-- page 16 of 19 -->

表 5 的格子在这一页. 判断结果只有两行: Seed-Verifier 为 Non-Correct, Seed-Thinking-Verifier 为 Correct.

<!-- page 17 of 19 -->

表 6 是创意写作案例 1, 源文在页末写了截断. 不另抄对白.

<!-- page 18 of 19 -->

表 7 是创意写作案例 2. 不另抄碑文.

<!-- page 19 of 19 -->

表 8 的 CoT 与回答续页. 不另抄独白.

> **问:** 表 5 里 Seed-Verifier 判错, Seed-Thinking-Verifier 判对. 这能推出表 1 的 99.3% 吗?
> 不能. 表 5 是一条案例: 闭式和递推在 n=1, 2 上一致, 并且代入后递推成立, 极限都是 0. 它解释表 1 为什么要单独建一个会思考的验证器, 但 99.3% 的分母是另外挑出的 456 条难例, 不是这一条. 一条案例不能代替那 456 条的通过率.
