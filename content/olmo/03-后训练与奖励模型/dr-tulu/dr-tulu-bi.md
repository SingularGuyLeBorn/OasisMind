---
title: "DR Tulu：用于深度研究的演化评分细则强化学习"
slug: dr-tulu
type: paper
status: complete
language: bilingual
source: arXiv:2511.19399
---

# dr-tulu

<!-- arXiv 2511.19399; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/dr-tulu/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Rulin Shao ♡† 1 Akari Asai ♡† 2 3 Shannon Zejiang Shen ♡† 4 Hamish Ivison ♡† 1 2

Varsha Kishore † 1 2 Jingming Zhuo † 1 Xinran Zhao 3 Molly Park 1 Samuel G. Finlayson 1 5

David Sontag 4 Tyler Murray 2 Sewon Min 2 6 Pradeep Dasigi 2 Luca Soldaini 2 Faeze Brahman 2

Wen-tau Yih 1 Tongshuang Wu 3 Luke Zettlemoyer 1 Yoon Kim 4

Hannaneh Hajishirzi 1 2 Pang Wei Koh 1 2

Code Data & Models  Interactive Demo

Abstract

Figure 1. Performance vs. cost of deep research models. We

report average performance over 4 long-form DR benchmarks (ScholarQA-CSv2, HealthBench, ResearchQA, and DeepResearch- Bench) against inference cost (USD per query on ScholarQA- CSv2). DR Tulu-8B lies on the Pareto frontier, outperforming larger open models and matching proprietary models (Table 1).

1. Introduction

arXiv:2511.19399v3  [cs.CL]  15 May 2026

Deep research agents perform multi-step research to produce long-form, well-attributed answers. However, most open deep research agents are trained on easily verifiable short-form QA tasks via reinforcement learning with verifiable rewards, which does not extend to realistic long-form tasks. We address this with Reinforcement Learning with Evolving Rubrics (RLER), where rubrics are constructed and maintained to co-evolve with the policy model during training. This allows the rubrics to incorporate newly explored informa- tion from search and contrasting model responses, enabling better fact checking and more discrimi- native on-policy feedback. Using RLER, we de- velop Deep Research Tulu (DR Tulu-8B), the first fully open model that is directly trained for open-ended, long-form deep research. Across four long-form deep research benchmarks in sci- ence, healthcare, and general domains, DR Tulu substantially outperforms existing open deep re- search agents (by 15.6% over Tongyi DR on av- erage) and matches or exceeds proprietary deep research agents (by 0.7% over OpenAI DR on average), while being significantly smaller and cheaper per query (1000× cheaper than OpenAI DR per query).

♡Joint first authors. †Core contributors. See full author contributions here. 1University of Washington 2Allen In- stitute for AI 3Carnegie Mellon University 4Massachusetts Institute of Technology 5Seattle Children’s Hospital 6University of California, Berkeley. Correspondence to: Rulin Shao <rulins@cs.washington.edu>, Akari Asai <akaria@allenai.org>.

Deep research (DR) agents aim to produce in-depth, well- attributed answers to complex research tasks by plan- ning, searching, and synthesizing information from diverse sources (OpenAI, 2025). Existing open DR agents are ei- ther training-free, using manually designed prompts with off-the-shelf models (Li et al., 2025b;a), or trained via re- inforcement learning with verifiable rewards (RLVR) on search-intensive yet constrained short-form question an- swering (Jin et al., 2025; Nguyen et al., 2025; Liu et al., 2025). RL training for open-ended DR tasks critically de- pends on reliable reward signals. However, defining such rewards is challenging. The desiderata for good responses are often under-specified (Xu et al., 2023; Krishna et al., 2021) and therefore hard to fully capture with static, pre- defined evaluation criteria. Moreover, accurate assessment often requires access to extensive and up-to-date external information beyond a model’s parametric knowledge.

Proceedings of the 43 rd International Conference on Machine Learning, Seoul, South Korea. PMLR 306, 2026. Copyright 2026 by the author(s).

In this paper, we introduce Deep Research Tulu (DR Tulu- 8B), the first open model trained end-to-end for open-ended,

1

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

邵儒林 ♡† 1 浅井明里 ♡† 2 3 沉泽江 香农 ♡† 4 哈米什·艾维森 ♡† 1 2

Varsha Kishore † 1 2 卓敬明 † 1 赵欣然 3 Molly Park 1 Samuel G. Finlayson 1 5

大卫·桑塔格 4 泰勒·穆雷 2 Sewon Min 2 6 普拉迪普·达西吉 2 卢卡·索尔戴尼 2 费兹·布拉曼 2

Wen-tau Yih 1 Tongshuang Wu 3 Luke Zettlemoyer 1 Yoon Kim 4

Hannaneh Hajishirzi 1 2 庞伟 Koh 1 2

代码数据和模型 交互式演示

摘要

图 1. 深度研究模型的性能与成本。我们

报告 4 个长格式 DR 基准（ScholarQA-CSv2、HealthBench、ResearchQA 和 DeepResearch-Bench）与推理成本（ScholarQA-CSv2 上每个查询的美元）的平均性能。 DR Tulu-8B 位于 Pareto 边界，其性能优于较大的开放模型并匹配专有模型（表 1）。

一、简介

arXiv:2511.19399v3 [cs.CL] 2026 年 5 月 15 日

深度研究代理执行多步骤研究，以产生长篇、明确的答案。然而，大多数开放式深度研究代理都是通过具有可验​​证奖励的强化学习来训练易于验证的简短形式的 QA 任务，这并不能扩展到现实的长形式任务。我们通过使用不断演变的规则的强化学习（RLER）来解决这个问题，其中规则的构建和维护是为了在训练期间与策略模型共同进化。这使得评价标准能够纳入来自搜索和对比模型响应的新探索的信息，从而实现更好的事实检查和更具区别性的政策反馈。使用 RLER，我们开发了 Deep Research Tulu (DR Tulu-8B)，这是第一个完全开放的模型，直接训练用于开放式、长形式的深度研究。在科学、医疗保健和一般领域的四个长期深度研究基准中，DR Tulu 大大优于现有的开放深度研究代理（平均比 Tongyi DR 提高 15.6％），并匹配或超过专有深度研究代理（平均比 OpenAI DR 提高 0.7％），同时显着更小且每个查询更便宜（每个查询比 OpenAI DR 便宜 1000 倍）。

♡联合第一作者。 †核心贡献者。请在此处查看完整的作者贡献。 1华盛顿大学 2艾伦人工智能研究所 3卡内基梅隆大学 4麻省理工学院 5西雅图儿童医院 6加州大学伯克利分校。通讯作者：Rulin Shao <rules@cs.washington.edu>、Akari Asai <akaria@allenai.org>。

深度研究（DR）代理旨在通过规划、搜索和综合来自不同来源的信息，为复杂的研究任务提供深入、明确的答案（OpenAI，2025）。现有的开放 DR 代理要么无需训练，使用现成模型手动设计的提示（Li 等人，2025b；a），要么通过具有可验证奖励的强化学习（RLVR）对搜索密集但受限的简短问答进行训练（Jin 等人，2025；Nguyen 等人，2025；Liu 等人， 2025）。开放式 DR 任务的 RL 训练关键取决于可靠的奖励信号。然而，定义此类奖励具有挑战性。良好响应的需求通常不明确（Xu 等人，2023 年；Krishna 等人，2021 年），因此很难用静态的、预先定义的评估标准来完全捕获。此外，准确的评估通常需要访问模型参数知识之外的广泛且最新的外部信息。

第 43 届国际机器学习会议论文集，韩国首尔。 PMLR 306, 2026。作者版权所有 2026。

在本文中，我们介绍了 Deep Research Tulu (DR Tulu-8B)，这是第一个针对开放式、端到端训练的开放模型，

1

<!-- page 2 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

2. Preliminaries

This section covers the Deep Research formulation and rubrics-as-rewards preliminaries.

long-form DR tasks. DR Tulu-8B is first finetuned on high-quality, naturally occurring user data, and then trained via a new method, Reinforcement Learning with Evolv- ing Rubrics (RLER), in which we construct and maintain rubrics that co-evolve with the policy model during train- ing. At each training step, we sample several responses and search traces from the model, and generate new rubrics that capture and contrast the strengths and weaknesses of these responses. This lets us continuously update the rubrics with newly discovered information, keeping feedback on-policy and discriminative across model responses.

Problem formulation. We consider a deep research model to be a language model (LM) equipped with search-related tools. Each tool takes a query and arguments, returning textual resources that can be cited in the model’s answer. Concretely, we define the model’s action space as { think , tool , answer , cite }. At each step, the model sam- ples an action and its associated content or arguments. If the sampled action belongs to { think , answer , cite }, the output is appended to the context. If the sampled action is tool , the model executes the tool call, receives the tool observation, and appends it to the context. The process continues until the model chooses the action answer , pro- ducing the final answer. We refer to Appendix C for formal definitions and the specification of tool protocol tokens.

Rubrics as rewards. Rubrics define explicit evaluation criteria for assessing the quality of (typically long-form) model responses (Viswanathan et al., 2025; Gunjal et al., 2025). We consider sample-wise rubrics, in which the eval- uation criteria are specified on a per-example basis in nat- ural language: Given a question x with associated rubrics Rx = {(rx,k, wx,k)}K

k=1, where rx,k denotes a rubric item and wx,k ∈R its weight, we evaluate a final response y using the rubric-based score

PK

S(x, y) =

. (1)

k=1 wx,k JUDGE(rx,k, y) P

k: wx,k>0 wx,k

DR Tulu-8B outperforms the strongest open 8–32B models, including previous state-of-the-art Tongyi DR 30B (Team et al., 2025), by 4.8–41.8 percentage points on four long-form DR benchmarks—AstaBench-ScholarQA-CS2 (SQAv2) (Asai et al., 2024; Bragg et al., 2025), DeepRe- searchBench (Du et al., 2025), ResearchQA (Yifei et al., 2025), and HealthBench (Arora et al., 2025). In addition, it matches or exceeds proprietary systems such as OpenAI DR, Perplexity DR, and Gemini3 Pro + Search. As Figure 1 shows, DR Tulu-8B is substantially more cost-efficient than all other models: on SQAv2, OpenAI DR costs about USD 1.8 per query, whereas DR Tulu-8B is almost three orders of magnitude cheaper at USD 0.0019. We further construct GeneticDiseasesQA, a challenging clinical deep research dataset that requires models to search for and synthesize supporting evidence to assess the therapeutic eligibility of disease-causing genetic variants. On GeneticDiseasesQA, DR Tulu-8B similarly exceeds or competes with proprietary DR agents; no other open agents can tackle this task due to their inability to produce reliable, verifiable citations.

Each rubric is evaluated by a judge LM that outputs {0, 0.5, 1} based on how well y satisfies rx,k. During train- ing, we optimize the expected rubric score over the training questions using RL. Using rubrics as rewards offers sev- eral advantages: their concrete, well-defined items reduce susceptibility to judge model bias and promote objective evaluation, yielding consistent and comparable scores across different LLM-as-a-judge runs.

3. RLER: Reinforcement Learning with Evolving Rubrics

Our analysis shows that RLER improves the model’s ability to produce more comprehensive and in-depth long-form re- sponses with accurate citations, yielding gains of 6.4–16.0 points on top of the finetuned model across the four bench- marks. Moreover, DR Tulu-8B learns to select appropriate search tools for each task, instead of relying on a single hard-coded search tool like in prior work (Gao et al., 2025; Bragg et al., 2025). On SQAv2, DR Tulu-8B uses paper search 90% of the time, whereas on DeepResearchBench, whose questions span more diverse, general-domain topics, it relies on web search and browsing about 55% of the time.

We release all data, code, and models, along with an ex- tensible deep research library (dr-agent-lib) and an evaluation suite supporting plug-and-play multi-tool search. This release provides an end-to-end training stack for deep research agents, including data and infrastructure for asyn- chronous tool calls and scalable RL over long-horizon tool- use trajectories—addressing a long-standing barrier to deep research training, where data, code, and infrastructure are rarely available.

Despite the recent adoption of rubrics for evaluation, these approaches typically rely on human experts to write and iteratively refine the rubrics (Arora et al., 2025; Du et al., 2025; Sharma et al., 2025), or assume the availability of reference answers (Gunjal et al., 2025). Automating and scaling rubric generation for training remains challenging: Long-form questions are often under-specified and admit many plausible notions of quality, making a small set of fixed criteria inadequate for training. Deep research tasks are also knowledge-intensive and require grounding claims in a broad, evolving body of external knowledge beyond an

2

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

2. 预赛

本节涵盖深度研究的制定和奖励细则的预备知识。长格式灾难恢复任务。 DR Tulu-8B 首先对高质量、自然发生的用户数据进行微调，然后通过一种新方法进行训练，即使用进化规则的强化学习（RLER），其中我们构建和维护在训练期间与策略模型共同进化的规则。在每个训练步骤中，我们都会对模型中的多个响应进行采样并搜索轨迹，并生成新的评分标准来捕获和对比这些响应的优点和缺点。这使我们能够利用新发现的信息不断更新规则，保持反馈符合政策并在模型响应之间具有区分性。问题表述。我们认为深度研究模型是配备搜索相关工具的语言模型（LM）。每个工具都接受查询和参数，返回可以在模型答案中引用的文本资源。具体来说，我们将模型的动作空间定义为{think，tool，answer，cite}。在每个步骤中，模型都会对一个操作及其关联的内容或参数进行采样。如果采样的操作属于 { think , answer , cite }，则输出将附加到上下文中。如果采样的操作是 tool ，则模型执行工具调用、接收工具观察并将其附加到上下文。这个过程一直持续到模型选择动作答案，产生最终答案。我们参考附录 C 来了解工具协议令牌的正式定义和规范。评分标准作为奖励。细则定义了用于评估（通常是长格式）模型响应质量的明确评估标准（Viswanathan 等人，2025 年；Gunjal 等人，2025 年）。我们考虑样本量规，其中评估标准是在每个示例的基础上用自然语言指定的：给定一个问题 x 以及相关的量规 Rx = {(rx,k, wx,k)}K

k=1，其中 rx,k 表示一个 rubric 项目，wx,k ∈R 其权重，我们使用基于 rubric 的分数评估最终响应 y

PK

S(x, y) =

。 (1)

k=1 wx,k JUDGE(rx,k, y) P

k: wx,k>0 wx,k

DR Tulu-8B 在四个长格式 DR 基准 AstaBench-ScholarQA-CS2 (SQAv2)（Asai 等人，2024 年；Bragg 等人， 2025）、DeepResearchBench（Du 等人，2025）、ResearchQA（Yifei 等人，2025）和 HealthBench（Arora 等人，2025）。此外，它还匹配或超过了 OpenAI DR、Perplexity DR 和 Gemini3 Pro + Search 等专有系统。如图 1 所示，DR Tulu-8B 比所有其他模型更具成本效益：在 SQAv2 上，OpenAI DR 每次查询的成本约为 1.8 美元，而 DR Tulu-8B 几乎便宜三个数量级，为 0.0019 美元。我们进一步构建了 GeneticDiseasesQA，这是一个具有挑战性的临床深度研究数据集，需要模型来搜索和合成支持证据，以评估致病遗传变异的治疗资格。在 GeneticDiseasesQA 上，DR Tulu-8B 同样超过或与专有 DR 药物竞争；由于无法产生可靠、可验证的引文，没有其他开放代理可以完成这项任务。每个评分标准由判断 LM 进行评估，该判断 LM 根据 y 满足 rx,k 的程度输出 {0, 0.5, 1}。在训练过程中，我们使用强化学习优化训练问题的预期评分。使用评分标准作为奖励有几个优点：它们具体、定义明确的项目降低了判断模型偏差的敏感性，促进客观评估，在不同的法学硕士法官运行中产生一致和可比较的分数。 3.
RLER：具有不断演变的规则的强化学习

我们的分析表明，RLER 提高了模型生成更全面、更深入的长篇回复和准确引用的能力，在四个基准上比微调模型提高了 6.4-16.0 分。此外，DR Tulu-8B 学会为每项任务选择合适的搜索工具，而不是像之前的工作那样依赖单个硬编码的搜索工具（Gao 等人，2025；Bragg 等人，2025）。在 SQAv2 上，DR Tulu-8B 90% 的时间使用论文搜索，而在 DeepResearchBench 上，其问题涵盖更多样化的通用领域主题，大约 55% 的时间依赖网络搜索和浏览。我们发布了所有数据、代码和模型，以及可扩展的深度研究库（dr-agent-lib）和支持即插即用多工具搜索的评估套件。该版本为深度研究代理提供了端到端的培训堆栈，包括用于异步工具调用的数据和基础设施，以及长期工具使用轨迹上的可扩展强化学习，解决了深度研究培训的长期障碍，因为数据、代码和基础设施很少可用。尽管最近采用了评估准则，但这些方法通常依赖于人类专家来编写和迭代完善准则（Arora 等人，2025 年；Du 等人，2025 年；Sharma 等人，2025 年），或假设参考答案的可用性（Gunjal 等人，2025 年）。自动化和扩展训练的标题生成仍然具有挑战性：长格式问题通常不明确，并且承认许多看似合理的质量概念，使得一小组固定标准不足以进行训练。深入的研究任务也是知识密集型的，需要将主张建立在广泛的、不断发展的外部知识体系中，而不仅仅是

2

<!-- page 3 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Figure 2. Training with RLER. Given an instance, the policy LM πθt samples rollouts by interacting with the environment. A rubric LM

proposes new rubrics from the rollouts and the current rubric buffer. We score rollouts with these rubrics to update πθt, then add and prune rubrics to keep a fixed-size buffer with the highest rollout-score variance.

Evolving rubrics during training. During training, we add a new set of evolving rubrics to the active rubric buffer, Ractive

LM’s parametric knowledge. As a result, closed-book static LM-generated rubrics risk missing evidence, subtle errors, and are vulnerable to reward hacking.

x , which are used for scoring. In each step, for every prompt x and its corresponding set of responses {yi}G

i=1, where G denotes the number of rollouts, we concatenate the prompt x, all sampled responses {yi}G

To address these challenges, we introduce Reinforcement Learning with Evolving Rubrics (RLER) for long-form deep research, using rubrics that are instance-specific, grounded in external knowledge, and co-evolve with the policy model.

x ∪Ractive

i=1 (including the search context and final answers), and the existing rubric pool Rx = Rpersist



x as input to Grubric, obtaining a set of evolving rubrics Rnew

x, {yi}G

x = Grubric

i=1, Rx

3.1. Search-Augmented Evolving Rubrics

. Specif- ically, we instruct the LM to generate two types of evolving rubrics: (1) positive rubrics, which capture strengths or new, relevant knowledge explored by the current policy but not yet reflected in Rx, and (2) negative rubrics, which summa- rize common undesirable behaviors, such as reward hacking observed across responses. For example, verbatim copying of retrieved content to maximize citation precision can be identified and suppressed by negative rubrics. Appendix D.3 presents rubric generation prompts.

The key intuition behind RLER is to improve rubric qual- ity by providing the rubric generator with privileged infor- mation that is unavailable to the policy during generation, thereby creating a generation–verification gap. Concretely, our design leverages two forms of privileged information: (1) external knowledge retrieved from multiple search roll- outs, which supports fact verification; and (2) multiple in- dependently sampled model responses, which provide con- trastive signals for assessing relative quality.

We next detail our RLER framework, covering rubric ini- tialization, online rubric evolution with buffer management, and auxiliary format and citation rewards (Figure 2; Algo- rithm 1).

Rubric buffer management. Without appropriate man- agement, the number of rubrics would grow linearly during training as new rubrics are continuously generated. To main- tain a compact yet informative set, we developed a rubric buffer management strategy that filters, merges, and ranks rubrics based on their discriminative power. After every GRPO rollout, we score all responses {yi}G

i=1 using the cur- rent active rubrics and obtain rubric-level scores. Rubrics with zero variance in their corresponding rewards are re- moved as they offer no discriminative value. We then com- pute the standard deviation for each remaining rubric and rank them by the standard deviation in descending order. To limit evaluation cost, we retain only the top Kmax rubrics with the highest standard deviation values.

Initial search-based rubrics. For each training prompt x, we build a customized rubric buffer to store evolving rubrics that are dynamically updated during training. Before train- ing, we initialize the rubric buffer with search-based rubrics. Specifically, for each x, we first perform SEARCH(x) to fetch relevant documents via web search API using the orig- inal question. We then concatenate the retrieved documents with the question x and feed them into an LM, Grubric, to pro- duce a set of initial rubrics that will be persistently used throughout RL training: Rpersist

x = {R1, R2, . . . , RKs}, where Ks denotes the number of persistent rubrics.

In addition to evolving rubrics, we introduce three aux- iliary rewards—format, search, and citation rewards—to encourage correct formatting, effective use of search and

3

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

图 2. 使用 RLER 进行训练。给定一个实例，策略 LM πθt 通过与环境交互来进行采样。 LM 的标题

从推出和当前的标题缓冲区中提出新的标题。我们使用这些评分标准对推出进行评分以更新 πθt，然后添加和修剪评分标准以保持具有最高推出分数方差的固定大小缓冲区。

培训期间不断变化的规则。在训练期间，我们将一组新的不断发展的评分标准添加到活动评分标准缓冲区中，Ractive

LM的参数知识。因此，封闭式静态 LM 生成的评分标准存在证据缺失、细微错误的风险，并且容易受到奖励黑客攻击。

x ，用于评分。在每一步中，对于每个提示 x 及其相应的响应集 {yi}G

i=1，其中G表示推出次数，我们连接提示x，所有采样响应{yi}G

为了应对这些挑战，我们引入了强化学习与进化规则（RLER）进行长期深入研究，使用特定于实例、基于外部知识并与政策模型共同进化的规则。

x ∪活性

i=1（包括搜索上下文和最终答案），现有的标题池 Rx = Rpersist



x 作为 Grubric 的输入，获得一组不断发展的规则 Rnew

x, {yi}G

x = 格鲁布里克

我=1，接收

3.1.搜索增强不断发展的评分标准

。具体来说，我们指示 LM 生成两种类型的不断演变的评估标准：（1）积极评估标准，捕捉当前政策探索但尚未反映在 Rx 中的优势或新的相关知识；（2）消极评估标准，总结常见的不良行为，例如在响应中观察到的奖励黑客行为。例如，为了最大限度地提高引用精度而逐字复制检索到的内容可以通过负面评价规则来识别和抑制。附录 D.3 提供了标题生成提示。

RLER 背后的关键直觉是通过向标题生成器提供生成过程中策略无法获得的特权信息来提高标题质量，从而产生生成验证差距。具体来说，我们的设计利用了两种形式的特权信息：（1）从多个搜索中检索的外部知识，支持事实验证； （2）多个独立采样的模型响应，为评估相对质量提供对比信号。

接下来，我们详细介绍我们的 RLER 框架，包括标题初始化、带有缓冲区管理的在线标题演变以及辅助格式和引用奖励（图 2；算法 1）。

Rubric 缓冲区管理。如果没有适当的管理，随着新的量规不断生成，量规的数量将在训练过程中线性增长。为了维护一个紧凑但信息丰富的集合，我们开发了一种评估表缓冲区管理策略，该策略根据评估表的判别力对评估表进行过滤、合并和排名。每次 GRPO 推出后，我们都会对所有回复进行评分 {yi}G

i=1 使用当前有效的评分标准并获得评分标准。相应奖励方差为零的评分标准将被删除，因为它们不提供任何歧视性价值。然后，我们计算剩余每个量规的标准差，并按标准差降序对它们进行排名。为了限制评估成本，我们仅保留具有最高标准差值的顶级 Kmax 评分标准。

初始基于搜索的标题。对于每个训练提示 x，我们构建一个定制的评分标准缓冲区来存储在训练期间动态更新的不断发展的评分标准。在训练之前，我们使用基于搜索的评分标准初始化评分标准缓冲区。具体来说，对于每个 x，我们首先执行 SEARCH(x) 以使用原始问题通过网络搜索 API 获取相关文档。然后，我们将检索到的文档与问题 x 连接起来，并将它们输入到 LM Grubric 中，以生成一组将在整个 RL 训练过程中持续使用的初始准则：Rpersist

x = {R1, R2, . 。 。 , RKs}，其中 Ks 表示持久性评分标准的数量。

除了不断发展的标准之外，我们还引入了三种辅助奖励——格式奖励、搜索奖励和引文奖励——以鼓励正确的格式、有效地使用搜索和引用。

3

<!-- page 4 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

high-quality citations that support relevant claims. We detail these auxiliary rewards in Appendix D.5.

tories whose final answers do not match the gold answers, following prior work (Jin et al., 2025; Li et al., 2025a). This process yields 16K SFT trajectories (Appendix Table 7).

4.3. Online RL with Asynchronous Tool Calls

4. DR Tulu with Open Infrastructure and Training Recipe

Building on RLER, we train DR Tulu-8B starting from Qwen3-8B (Yang et al., 2025). This section describes our agent infrastructure and the SFT-then-RL training recipe.

We further train DR Tulu-8B using RLER with a customized variant of GRPO (Shao et al., 2024). Training proceeds by iteratively generating agentic rollouts with real tool calls and scoring the model’s final answers against evolving rubrics.

4.1. DR Tulu Agent Infrastructure: dr-agent-lib

RL training focuses exclusively on long-form questions. Using the same LM-based filtering procedure as in long- form SFT, we collect approximately 5K prompts from SearchArena (Miroyan et al., 2025) and OpenScholar (Asai et al., 2024), and an additional 4K prompts from RaR (Gun- jal et al., 2025) to increase data diversity.1 Despite sourcing from multiple datasets, the collected prompts remain par- tially out-of-distribution relative to our evaluation datasets.

DR agents require an extensible, scalable, and user-friendly tool infrastructure for diverse search and browsing APIs. We develop dr-agent-lib, an agent library with three core features: (i) a unified MCP-based tool backend in- tegrating local and API-based web search and brows- ing tools (Table 10); (ii) a high-concurrency backend with global caching and asynchronous process locking for efficient, rate-limit-aware tool execution; and (iii) a lightweight, composable prompt layer enabling fine-grained control over search workflows and configurations. For training, we implement an auto-search workflow (Ap- pendix H.1) using google search (query →top web snippets), web browse (URL →crawled page text), and paper search (query →paragraphs from papers).

4.2. Supervised Fine-Tuning for Cold Start

We train using GRPO (Shao et al., 2024) based on the Open- Instruct implementation (Lambert et al., 2025), incorporat- ing token-level loss (Yu et al., 2025), 1-step asynchronous training (Noukhovitch et al., 2024), tool output masking (Jin et al., 2025), and sample packing for improved efficiency. We further adopt asynchronous tool calling (Jiang et al., 2025), where tool requests are dispatched immediately upon triggering during rollout generation, rather than waiting for batch completion. Additional training details and hyperpa- rameters are provided in Appendix G.2.

5. Experimental Results

We apply supervised fine-tuning (SFT) as a cold start to distill common search patterns from a teacher model into the initial model, improving early rollout quality and accel- erating subsequent RL training (ablations in §6).

5.1. Experimental Settings

Prompts. We curate or synthesize both long-form and short- form prompts. Long-form queries are real user queries col- lected from SearchArena (Miroyan et al., 2025) and Open- Scholar (Asai et al., 2024), covering general-domain and scientific-domain questions, respectively. To address large quality variation in real-world queries (Cao et al., 2025), we apply a prompt-filtering stage in which an LM scores each prompt on a 1-5 scale. Short-form prompts are drawn from existing datasets, including HotpotQA (Yang et al., 2018), TaskCraft (Shi et al., 2025), WebWalker-Silver (Wu et al., 2025a), and MegaScience (Fan et al., 2025), sup- plemented with challenging synthetic prompts inspired by PopQA (Mallen et al., 2023). Details are in Appendix §F.1.

Benchmarks. We evaluate deep research agents on four long-form, open-ended benchmarks: HealthBench (Arora et al., 2025) for healthcare, ResearchQA (Yifei et al., 2025), AstaBench-ScholarQA-CS2 (SQAv2; Asai et al. 2024; Bragg et al. 2025) for scientific literature synthesis, and DeepResearchBench (DRB; Du et al. 2025) for general- domain deep research. All benchmarks require long-form responses and are evaluated using human-written or human- verified rubrics following official protocols. SQAv2 and DRB additionally report fine-grained metrics, including rel- evance, instruction-following, and citation precision/recall. We also evaluate DR Tulu-8B on short-form QA (Analysis). Further evaluation details are provided in Appendix H.3.

Baselines. We compare against multiple categories of deep research systems (Table 1). (1) Open deep research mod- els: ASearcher-7B (Gao et al., 2025), WebThinker-32B (Li et al., 2025a), Search-R1-7B (Jin et al., 2025), WebExplorer-

Teacher trajectories. Given each prompt, we instruct GPT- 5 to generate a trajectory, including simulated reasoning, tool use, and the final answer, using a system prompt that specifies the aforementioned auto-search workflow. We apply two rejection-sampling filters: (i) retaining only tra- jectories that follow the expected tool-calling and answer formats, and (ii) for short-form prompts, discarding trajec-

1For RaR prompts, we initialize training with the dataset- provided rubrics rather than generating search-based rubrics, while still maintaining evolving rubrics during training.

4

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

支持相关主张的高质量引文。我们在附录 D.5 中详细介绍了这些辅助奖励。根据之前的工作，最终答案与黄金答案不匹配的理论（Jin 等人，2025；Li 等人，2025a）。该过程产生 16K SFT 轨迹（附录表 7）。 4.3.具有异步工具调用的在线强化学习

4. DR Tulu 具有开放的基础设施和培训方案

在 RLER 的基础上，我们从 Qwen3-8B 开始训练 DR Tulu-8B（Yang 等人，2025）。本节介绍我们的代理基础设施和 SFT-then-RL 训练方法。我们使用 RLER 和 GRPO 的定制变体进一步训练 DR Tulu-8B（Shao 等人，2024）。训练通过使用真实的工具调用迭代生成代理部署并根据不断变化的规则对模型的最终答案进行评分来进行。 4.1. DR Tulu 代理基础设施：dr-agent-lib

强化学习训练专门关注长格式问题。使用与长格式 SFT 相同的基于 LM 的过滤程序，我们从 SearchArena（Miroyan 等人，2025）和 OpenScholar（Asai 等人，2024）收集了大约 5K 提示，并从 RaR（Gunjal 等人，2025）收集了额外的 4K 提示，以增加数据多样性。1 尽管来自多个数据集，但收集到的提示仍然是部分的。相对于我们的评估数据集，分布不均。 DR 代理需要可扩展、可伸缩且用户友好的工具基础架构来支持各种搜索和浏览 API。我们开发了 dr-agent-lib，一个具有三个核心功能的代理库：（i）一个基于 MCP 的统一工具后端，集成了本地和基于 API 的网络搜索和浏览工具（表 10）； (ii) 高并发后端，具有全局缓存和异步进程锁定，可实现高效、速率限制感知的工具执行； (iii) 轻量级、可组合的提示层，能够对搜索工作流程和配置进行细粒度控制。对于训练，我们使用谷歌搜索（查询→顶级网页片段）、网页浏览（URL→爬行的页面文本）和论文搜索（查询→论文中的段落）实现自动搜索工作流程（附录 H.1）。 4.2.冷启动的监督微调

我们使用基于 Open-Instruct 实现（Lambert 等人，2025）的 GRPO（Shao 等人，2024）进行训练，结合令牌级损失（Yu 等人，2025）、一步异步训练（Noukhovitch 等人，2024）、工具输出屏蔽（Jin 等人，2025）和样本打包以提高效率。我们进一步采用异步工具调用（Jiang et al., 2025），其中工具请求在推出生成期间触发后立即分派，而不是等待批处理完成。附录 G.2 中提供了额外的训练细节和超参数。 5. 实验结果

我们应用监督微调（SFT）作为冷启动，将常见的搜索模式从教师模型提炼到初始模型中，提高早期推出质量并加速后续的 RL 训练（第 6 节中的消融）。 5.1.实验设置

提示。我们策划或综合长格式和短格式的提示。长格式查询是从 SearchArena (Miroyan et al., 2025) 和 OpenScholar (Asai et al., 2024) 收集的真实用户查询，分别涵盖一般领域和科学领域问题。为了解决现实世界查询中巨大的质量变化问题（Cao et al., 2025），我们应用了提示过滤阶段，其中 LM 按 1-5 的等级对每个提示进行评分。简短的提示来自现有数据集，包括 HotpotQA (Yang et al., 2018)、TaskCraft (Shi et al., 2025)、WebWalker-Silver (Wu et al., 2025a) 和 MegaScience (Fan et al., 2025)，并补充了受 PopQA (Mallen et al., 2025) 启发的具有挑战性的合成提示。 2023）。详细信息参见附录§F.1。基准。我们根据四个长期、开放式基准评估深度研究代理：用于医疗保健的 HealthBench（Arora 等人，2025）、ResearchQA（Yifei 等人，2025）、AstaBench-ScholarQA-CS2（SQAv2；Asai 等人。
2024；布拉格等人。 2025）用于科学文献综合，DeepResearchBench（DRB；Du et al. 2025）用于一般领域的深度研究。所有基准都需要长格式的响应，并按照官方协议使用人工编写或人工验证的标准进行评估。 SQAv2 和 DRB 还报告细粒度的指标，包括相关性、指令遵循和引用精度/召回率。我们还通过简短的 QA（分析）评估 DR Tulu-8B。附录 H.3 中提供了进一步的评估细节。基线。我们与多个类别的深度研究系统进行比较（表 1）。 （1）开放深度研究模型：ASearcher-7B（Gao et al., 2025）、WebThinker-32B（Li et al., 2025a）、Search-R1-7B（Jin et al., 2025）、WebExplorer-

教师轨迹。给定每个提示，我们指示 GPT-5 使用指定上述自动搜索工作流程的系统提示生成轨迹，包括模拟推理、工具使用和最终答案。我们应用两个拒绝采样过滤器：（i）仅保留遵循预期工具调用和答案格式的轨迹，以及（ii）对于简短的提示，丢弃轨迹

1对于 RaR 提示，我们使用数据集提供的评分标准来初始化训练，而不是生成基于搜索的评分标准，同时在训练期间仍然保持不断变化的评分标准。 4

<!-- page 5 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

SQAv2 HealthBench ResearchQA DRB Average

Closed Deep Research

Claude-Sonnet Search – – 64.3∗ 34.5∗ – Perplexity-Sonar (High) – – 69.1∗ 40.7∗ – Perplexity Deep Research 67.3 – 75.3∗ 42.3∗ – Gemini Deep Research – – 68.5∗ 48.8∗ – Gemini 3 Pro + Search 69.8 38.0 74.3 46.3 57.0 GPT-5 + Our Search 61.1 31.1 62.8 50.3 51.3 GPT-5 + Search 74.8 59.5† 78.2† 50.7 65.8 OpenAI Deep Research 79.6 53.8† 79.2† 46.9∗ 64.9

Naive RAG Qwen3-8B 40.4 16.5 56.1 33.3 36.5 QwQ-32B 41.9 24.5 60.9 40.3 41.9

Open Deep Research Models Search-R1-7B 22.2 -0.1 27.9 9.5 14.9 ASearcher-Web-7B 26.9 -13.0 19.4 7.8 10.3 WebExplorer-8B 42.5 33.7 64.8 36.7 44.4 WebThinker-32B-DPO 32.9 11.1 48.6 23.3 28.9 Tongyi DeepResearch-30B-A3B 46.5 46.2 66.7 40.6 50.0

Fixed Pipeline Deep Research WebThinker QwQ-32B (report) 45.2 36.5 72.8 37.9 48.1 WebThinker-32B-DPO (report) 46.7 39.4 74.2 40.6 50.2 Ai2 ScholarQA - Claude Sonnet 87.7 32.0† 75.0† 36.1 57.7

Open Deep Research (Ours) Qwen3-8B + Our Search 57.2 5.9 46.3 18.2 31.9 DR Tulu-8B (SFT) 72.3 38.1 68.5 39.0 53.9 DR Tulu-8B (RL) 88.3 52.8 75.7 45.4 65.6 Table 1. Overall results. DR Tulu-8B outperforms all open deep research models, and is competitive with proprietary systems.

Bold indicates the best performance among open models. * denotes scores reported by the original benchmark authors. Except for GPT5 + our tool, we reuse the existing leaderboard results rather than rerunning the evaluations, which would cost a few hundred USD per

task; we leave entries as “–” when the original benchmarks do not report the corresponding metric. † denotes that the evaluation was run on a 100-sample subset because the method is expensive. For open models, indicates that the training code is open-sourced, and indicates that the training data is open-sourced. None of the existing open deep research models output citations, so their citation scores on SQAv2 are 0. HealthBench scores can be negative, as HealthBench includes negative rubrics that indicate harmful responses.

Training details. We initialize from Qwen3-8B (Yang et al., 2025). SFT is conducted on a single H100 node (8 GPUs) for 5 epochs, totaling 136 GPU hours; SFT hyper- parameters are provided in Appendix G.1. RL training uses the hyperparameters in Appendix G.2. Unless otherwise stated, all training runs use 2 H100 nodes (16 GPUs), our final run using 27,000 GPU hours. We use GPT-4.1-mini (gpt-4.1-mini-2025-04-14) as the LM judge, and GPT-4.1 as the rubric generator.

8B (Liu et al., 2025), and Tongyi Deep Research-30B (Team et al., 2025). None of these models was evaluated on realis- tic long-form benchmarks, as their training primarily targets short-form QA. For long-form tasks, we supply the official evaluation prompts and require full report-style outputs. (2) Fixed-pipeline deep research: WebThinker-32B (report mode) and Ai2 ScholarQA (Singh et al., 2025), which com- bine LMs with fixed inference-time pipelines; we run their official implementations with default or recommended set- tings. (3) Closed deep research: OpenAI Deep Research, Perplexity Sonar (reasoning), Perplexity Deep Research, Claude-Sonnet Search, and Gemini3 Pro + Search. Addi- tionally, we evaluate Qwen3-8B and QwQ-32B using naive RAG and our inference pipeline built on dr-agent-lib. More baseline details are provided in Appendix §H.2. Ex- isting open deep research models often omit citations, and proprietary systems typically provide only URL-level links. In contrast, DR Tulu-8B generates snippet-level citations that directly support claims, enabling verification and im- proving factual reliability (Liu et al., 2023a).

Inference details. We use a unified inference pipeline with three tools, google search, web browse, and paper search, for all long- and short-form tasks, with- out task-specific customization. Following prior work, we use the Serper Search API for google search (Li et al., 2025a) and Jina browsing for web browse (Gao et al., 2025; Liu et al., 2025), rather than the Crawl4AI browser used during training; we verify in Appendix I.7.4 that this train/inference browser mismatch has minimal impact on downstream performance. For paper search, we use the Semantic Scholar full-text API, which returns relevant

5

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

SQAv2 HealthBench ResearchQA DRB 平均值

封闭式深度研究

Claude-Sonnet 搜索 – – 64.3* 34.5* – 困惑声纳（高） – – 69.1* 40.7* – 困惑深度研究 67.3 – 75.3* 42.3* – Gemini 深度研究 – – 68.5* 48.8* – Gemini 3 Pro + 搜索 69.8 38.0 74.3 46.3 57.0 GPT-5 + 我们的搜索 61.1 31.1 62.8 50.3 51.3 GPT-5 + 搜索 74.8 59.5† 78.2† 50.7 65.8 OpenAI 深度研究 79.6 53.8† 79.2† 46.9* 64.9

朴素 RAG Qwen3-8B 40.4 16.5 56.1 33.3 36.5 QwQ-32B 41.9 24.5 60.9 40.3 41.9

开放深度研究模型 Search-R1-7B 22.2 -0.1 27.9 9.5 14.9 ASearcher-Web-7B 26.9 -13.0 19.4 7.8 10.3 WebExplorer-8B 42.5 33.7 64.8 36.7 44.4 WebThinker-32B-DPO 32.9 11.1 48.6 23.3 28.9 统一深研-30B-A3B 46.5 46.2 66.7 40.6 50.0

固定管道深度研究 WebThinker QwQ-32B（报告） 45.2 36.5 72.8 37.9 48.1 WebThinker-32B-DPO（报告） 46.7 39.4 74.2 40.6 50.2 Ai2 ScholarQA - Claude Sonnet 87.7 32.0† 75.0† 36.1 57.7

开放深度研究（我们的） Qwen3-8B + 我们的搜索 57.2 5.9 46.3 18.2 31.9 DR Tulu-8B (SFT) 72.3 38.1 68.5 39.0 53.9 DR Tulu-8B (RL) 88.3 52.8 75.7 45.4 65.6 表 1. 总体结果。 DR Tulu-8B 优于所有开放深度研究模型，并且与专有系统具有竞争力。粗体表示开放模型中性能最好的。 * 表示原始基准作者报告的分数。除了 GPT5 + 我们的工具之外，我们重用现有的排行榜结果，而不是重新运行评估，这将花费数百美元

任务；当原始基准未报告相应的指标时，我们将条目保留为“-”。 † 表示评估是在 100 个样本子集上进行的，因为该方法成本高昂。对于开放模型，表示训练代码开源，表示训练数据开源。现有的开放深度研究模型都没有输出引用，因此它们在 SQAv2 上的引用分数为 0。HealthBench 分数可能为负，因为 HealthBench 包含表明有害反应的负面评价标准。培训细节。我们从 Qwen3-8B 进行初始化（Yang et al., 2025）。 SFT在单个H100节点（8个GPU）上进行5个epoch，总计136个GPU小时；附录 G.1 中提供了 SFT 超参数。 RL 训练使用附录 G.2 中的超参数。除非另有说明，所有训练运行均使用 2 个 H100 节点（16 个 GPU），我们的最终运行使用 27,000 个 GPU 小时。我们使用 GPT-4.1-mini (gpt-4.1-mini-2025-04-14) 作为 LM 判断器，使用 GPT-4.1 作为 rubric 生成器。 8B（Liu 等人，2025）和 Tongyi Deep Research-30B（Team 等人，2025）。这些模型都没有在现实的长式基准上进行评估，因为它们的训练主要针对短式 QA。对于长格式任务，我们提供官方评估提示并要求完整的报告式输出。 （2）固定管道深度研究：WebThinker-32B（报告模式）和Ai2 ScholarQA（Singh等人，2025），将LM与固定推理时间管道相结合；我们使用默认或推荐的设置运行他们的官方实现。 （3）封闭深度研究：OpenAI Deep Research、Perplexity Sonar（推理）、Perplexity Deep Research、Claude-Sonnet Search、Gemini3 Pro + Search。此外，我们使用 naive RAG 和基于 dr-agent-lib 构建的推理管道来评估 Qwen3-8B 和 QwQ-32B。附录§H.2 中提供了更多基线详细信息。现有的开放式深度研究模型通常会省略引用，而专有系统通常只提供 URL 级别的链接。相比之下，DR Tulu-8B 生成直接支持主张的片段级引文，从而能够进行验证并提高事实可靠性（Liu 等人，2023a）。推理细节。我们使用带有三种工具的统一推理管道：谷歌搜索、网络浏览和论文搜索，适用于所有长格式和短格式任务，无需针对特定任务进行定制。
继之前的工作之后，我们使用 Serper Search API 进行谷歌搜索（Li et al., 2025a），使用 Jina 浏览进行网页浏览（Gao et al., 2025；Liu et al., 2025），而不是训练期间使用的 Crawl4AI 浏览器；我们在附录 I.7.4 中验证了这种训练/推理浏览器不匹配对下游性能的影响最小。对于论文搜索，我们使用 Semantic Scholar 全文 API，它返回相关的

5

<!-- page 6 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

paragraphs. We cap tool usage at 10 calls per rollout and retrieve the top 10 snippets for both google search and paper search. For web browse, we summarize long outputs using Qwen3-8B, while truncating webpages during training to improve efficiency.

5.2. Main Results

We report overall results across four long-form datasets in Table 1. Appendix Table 11 provides a fine-grained breakdown of SQAv2 and DRB.

DR Tulu-8B is significantly cheaper than proprietary and open deep research systems. DR Tulu-8B exhibits a substantial cost advantage (Appendix Table 12; see Ap- pendix I.5). Proprietary systems are orders of magnitude more expensive: OpenAI Deep Research costs $1.80/query on SQAv2, and Ai2 ScholarQA (Claude Sonnet) costs $1.30/query. In contrast, DR Tulu-8B costs $0.00008/query when accounting only for tool APIs, and $0.0018/query when including LM inference via OpenRouter (Qwen3-8B pricing). DR Tulu-8B also remains cheaper than other open deep research models, including Tongyi Deep Research ($0.03/query) and WebThinker ($0.003/query; $0.015 in report mode), despite achieving stronger performance. This efficiency stems from adaptive tool usage: on SQAv2, DR Tulu-8B primarily relies on free paper search, and even on DRB, where web search and browsing are used more frequently, it remains over 10× cheaper than Tongyi DR.

5.3. Application: Researching Pathogenic Gene Variants

DR Tulu-8B outperforms all open deep research models on long-form tasks. Across four open-ended long-form benchmarks, DR Tulu-8B (RL) achieves the strongest per- formance among all open deep research models, with an average score of 65.6, exceeding the best prior open baseline (Tongyi Deep Research-30B) by 15.6 points. Models trained primarily for constrained short-form tasks (e.g., Search-R1 and ASearcher) perform poorly on realistic report-length generation, yielding very low scores. Notably, existing open baselines lack citations, resulting in especially low SQAv2 scores when citation quality is central.

To evaluate DR Tulu on a realistic, expert-driven deep re- search task, we study pathogenic variant interpretation in clinical genetics. In collaboration with medical experts, we curate questions that reflect real-world deep research challenges in diagnosing rare genetic diseases.

We introduce GeneticDiseasesQA, a dataset of 47 expert- curated questions covering 24 pathogenic gene variants, which requires aggregating heterogeneous evidence from biological databases, research literature, and case reports. Questions focus on molecular consequences, disease mecha- nisms, and therapeutic evidence. For each question, models generate a long-form, citation-backed report. Evaluation cri- teria—Final Answer, Evidence Support, Evidence Quality, and Evidence Synthesis—are illustrated in Figure 3, with additional details in Appendix H.4.

DR Tulu-8B outperforms open fixed-pipeline deep re- search systems. WebThinker-32B, with its heavily en- gineered report-mode inference, boosts long-form perfor- mance (+21.3 points vs. default) but still trails DR Tulu-8B on every benchmark, despite using a much larger 32B back- bone. Ai2 ScholarQA, which is designed for scientific liter- ature synthesis and uses a closed backbone (Claude Sonnet), performs competitively on SQAv2 but lags behind DR Tulu- 8B on HealthBench and DeepResearchBench, resulting in a lower overall average. Overall, despite using a smaller open model and a single inference pipeline where it autonomously decides its search strategy and response structure from the prompt, DR Tulu-8B achieves the best average performance among open systems. We further observe that fixed-pipeline systems generalize poorly to short-form QA, often applying report-style reasoning to simple factoid queries, whereas DR Tulu-8B handles both long- and short-form tasks (§6.1).

Results. Figure 3 compares DR Tulu-8B (RL) against Qwen3-8B + search, Ai2 ScholarQA, Gemini 3 Pro + Search, GPT-5 + Search, and OpenAI Deep Research (o4- mini). Evidence Support is computed from cited snippets; for systems that return only URLs, we retrieve webpage content via Jina browsing. We exclude baselines without traceable citations. DR Tulu-8B substantially improves over Qwen3-8B across all metrics and outperforms Ai2 ScholarQA on Final Answer correctness. While GPT-5 and Gemini-based systems achieve higher Final Answer scores, DR Tulu-8B remains competitive on Evidence Support, Ev- idence Quality, and Evidence Synthesis, highlighting its strength in reliable multi-source reasoning. Overall, these results show that DR Tulu-8B generalizes effectively to unseen, real-world deep research tasks in expert domains.

DR Tulu-8B matches or outperforms proprietary deep research systems. DR Tulu-8B achieves the strongest per- formance among all systems on SQAv2 and matches or ex- ceeds proprietary deep research systems across the remain- ing long-form benchmarks. It outperforms Claude Sonnet Search, Perplexity Sonar (high-reasoning), and Perplexity Deep Research, and is competitive with OpenAI Deep Re- search overall. We further observe that GPT-5 + Search and Gemini3 Pro + Search outperform their corresponding deep research variants on some datasets, suggesting that under- lying base model capability plays a critical role in addition to the research pipeline itself. Notably, despite being built on an 8B open model, DR Tulu-8B remains on par with, or even outperforms, these proprietary, larger-scale systems.

6

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

段落。我们将每次部署的工具使用次数限制为 10 次调用，并检索 Google 搜索和论文搜索的前 10 个片段。对于网页浏览，我们使用 Qwen3-8B 总结长输出，同时在训练期间截断网页以提高效率。 5.2.主要结果

我们在表 1 中报告了四个长格式数据集的总体结果。附录表 11 提供了 SQAv2 和 DRB 的细粒度细分。 DR Tulu-8B 比专有和开放深度研究系统便宜得多。 DR Tulu-8B 表现出巨大的成本优势（附录表 12；参见附录 I.5）。专有系统的成本要高出几个数量级：OpenAI Deep Research 在 SQAv2 上的每次查询成本为 1.80 美元，而 Ai2 ScholarQA (Claude Sonnet) 的每次查询成本为 1.30 美元。相比之下，当仅考虑工具 API 时，DR Tulu-8B 的成本为 0.00008 美元/查询；当通过 OpenRouter 包含 LM 推理时，DR Tulu-8B 的成本为 0.0018 美元/查询（Qwen3-8B 定价）。尽管实现了更强的性能，DR Tulu-8B 仍然比其他开放深度研究模型便宜，包括 Tongyi Deep Research（0.03 美元/查询）和 WebThinker（0.003 美元/查询；报告模式 0.015 美元）。这种效率源于自适应工具的使用：在SQAv2上，DR Tulu-8B主要依赖于免费的纸张搜索，即使在更频繁使用网页搜索和浏览的DRB上，它仍然比统一DR便宜10倍以上。 5.3.应用：研究致病基因变异

DR Tulu-8B 在长格式任务上的表现优于所有开放深度研究模型。在四个开放式长格式基准中，DR Tulu-8B（RL）在所有开放式深度研究模型中取得了最强的性能，平均得分为 65.6，比之前最好的开放式基准（Tongyi Deep Research-30B）高出 15.6 分。主要针对受限短格式任务训练的模型（例如 Search-R1 和 ASearcher）在实际报告长度生成方面表现不佳，得分非常低。值得注意的是，现有的开放基线缺乏引用，导致当引用质量是核心时 SQAv2 分数特别低。为了在现实的、专家驱动的深入研究任务中评估 DR Tulu，我们研究了临床遗传学中的致病变异解释。我们与医学专家合作，提出了反映现实世界在诊断罕见遗传疾病方面的深入研究挑战的问题。我们引入了 GeneticDiseasesQA，这是一个由 47 个专家策划的问题组成的数据集，涵盖 24 个致病基因变异，需要从生物数据库、研究文献和病例报告中汇总异质证据。问题集中在分子后果、疾病机制和治疗证据上。对于每个问题，模型都会生成一份长格式的、有引文支持的报告。评估标准——最终答案、证据支持、证据质量和证据合成——如图 3 所示，其他详细信息参见附录 H.4。 DR Tulu-8B 的性能优于开放式固定管道深度研究系统。 WebThinker-32B 凭借其精心设计的报告模式推理，提高了长格式性能（与默认值相比+21.3 分），但尽管使用了更大的 32B 主干，但在每个基准测试中仍然落后于 DR Tulu-8B。 Ai2 ScholarQA 专为科学文献综合而设计，采用封闭主干网（Claude Sonnet），在 SQAv2 上表现具有竞争力，但在 HealthBench 和 DeepResearchBench 上落后于 DR Tulu-8B，导致总体平均值较低。总体而言，尽管使用较小的开放模型和单个推理管道（根据提示自主决定搜索策略和响应结构），DR Tulu-8B 在开放系统中实现了最佳平均性能。我们进一步观察到，固定管道系统对于短格式 QA 的泛化能力很差，通常将报告式推理应用于简单的事实查询，而 DR Tulu-8B 可以处理长格式和短格式任务（第 6.1 节）。结果。
图 3 将 DR Tulu-8B (RL) 与 Qwen3-8B + 搜索、Ai2 ScholarQA、Gemini 3 Pro + 搜索、GPT-5 + 搜索和 OpenAI Deep Research (o4-mini) 进行了比较。证据支持是根据引用的片段计算得出的；对于仅返回 URL 的系统，我们通过 Jina 浏览检索网页内容。我们排除没有可追踪引用的基线。 DR Tulu-8B 在所有指标上都比 Qwen3-8B 有了显着改进，并且在最终答案正确性方面优于 Ai2 ScholarQA。虽然 GPT-5 和基于 Gemini 的系统获得了更高的最终答案分数，但 DR Tulu-8B 在证据支持、证据质量和证据合成方面仍然具有竞争力，凸显了其在可靠多源推理方面的优势。总体而言，这些结果表明 DR Tulu-8B 可以有效地推广到专家领域中未见过的、现实世界的深度研究任务。 DR Tulu-8B 匹配或优于专有的深度研究系统。 DR Tulu-8B 在 SQAv2 上的所有系统中实现了最强的性能，并且在其余的长格式基准测试中匹配或超过了专有的深度研究系统。它的性能优于 Claude Sonnet Search、Perplexity Sonar（高推理）和 Perplexity Deep Research，总体上与 OpenAI Deep Research 具有竞争力。我们进一步观察到，GPT-5 + Search 和 Gemini3 Pro + Search 在某些数据集上的表现优于其相应的深度研究变体，这表明除了研究管道本身之外，底层基础模型功能也发挥着关键作用。值得注意的是，尽管 DR Tulu-8B 是基于 8B 开放模型构建的，但其性能仍与这些专有的大型系统相当，甚至优于这些系统。 6

<!-- page 7 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Figure 3. Comparison of DR agents GeneticDiseasesQA. Final Answer: proportion of expert-annotated facts recovered in responses. Evidence Support: the proportion of cited claims that are fully supported by the original text of the cited source. Evidence Quality: whether the type of supporting evidence requested is present. Evidence Synthesis: whether there was a statement addressing the relationship between multiple sources. Results for DR Tulu-8B (RL) and Qwen3-8B + Our Search are reported as the average of 10 trials. The remaining agents are reported as the average of 3 trials, given the high costs and inference times for proprietary deep research systems.

SimpleQA 2Wiki WebWalker Avg.

6. Analysis

Naive RAG Qwen3-8B 52.6 18.9 8.8 26.8 QwQ-32B 57.2 34.2 10.1 33.8

We conduct a set of analyses on DR Tulu. Unless otherwise specified, this section uses the DR Tulu SFT checkpoint and an early DR Tulu RL checkpoint at 1k training steps.

6.1. Evaluation on Short-form QA Tasks

Open Deep Research (Ours) Qwen3-8B + Our Search 70.5 44.0 27.9 47.5 DR Tulu-8B (SFT) 75.5 66.5 31.9 58.0 DR Tulu-8B (RL) 75.9 68.9 39.0 61.3 Table 2. Short-form results. We report short-form performance

for our SFT and RL variants to analyze how each training stage affects short-form behavior. All scores are computed from top-1 predictions under a unified evaluation pipeline.

SQAv2 Health Research DRB Avg.

Although our RLER training targets long-form, open-ended deep research, our SFT mixture intentionally includes short- form, verifiable QA tasks that require search, enabling the model to handle both concise and multi-paragraph responses. We therefore evaluate how well our SFT and RL models generalize to short-form queries.

DR Tulu (SFTv0.1) 73.4 37.5 68.6 39.4 54.7 General rubrics 80.6 36.0 65.0 37.5 54.8 Closed-book rubrics 83.2 34.8 66.6 37.6 55.6 Initial search-based rubrics 82.8 37.9 66.9 39.3 56.7 Table 3. Search-based static rubrics work best. We train using

different static rubrics using RL for 500 steps, starting from an intermediate SFT checkpoint (SFT v0.1). “Initial search-based rubrics” refers to an ablation of RLER without evolving rubrics generated during training. Search-based rubrics consistently out- perform both general rubrics and closed-book rubrics that are not grounded in up-to-date information.

We evaluate short-form QA on SimpleQA (Wei et al., 2024), WebWalkerQA (Wu et al., 2025a), and 2Wiki (Ho et al., 2020). Following prior work (Li et al., 2025a; Wei et al., 2024), we use an LLM judge to assess answer correctness and report Pass@1 accuracy with GPT-4.1 as the LLM judge. For efficiency, we evaluate on 1,000 randomly sam- pled questions each from SimpleQA and 2Wiki. Table 2 shows that DR Tulu performs competitively on short-form QA benchmarks. The SFT stage yields substantial gains over the Qwen3-8B + Our Search baseline, demonstrating the effectiveness of our SFT data for short-form QA. No- tably, although RL training uses only long-form prompts and explicitly optimizes long-form generation, DR Tulu (RL) achieves further improvements on short-form QA, in- creasing the overall average by 3.3 points, indicating strong cross-task generalization.

6.2. Analysis on Training and Inference

alone does not reliably transfer to open-ended deep research, whereas retaining a modest short-form component helps preserve general-purpose behavior without sacrificing long- form performance. Scaling SFT data yields clear early gains across tasks, with long-form benchmarks showing substan- tial improvements with as little as 5% of the data and largely saturating beyond 50%, while short-form tasks (especially 2Wiki) continue to benefit from additional data up to the full dataset. Although full-data SFT slightly reduces SQAv2 citation scores, overall short-form accuracy remains strong, and subsequent RL training recovers citation performance, motivating our use of the full SFT dataset followed by RL.

SFT benefits from mixed supervision but shows dimin- ishing returns on long-form tasks. Figure 4 shows that combining long-form and short-form data during SFT is important: removing long-form data substantially degrades performance on all long-form benchmarks, while remov- ing short-form data leaves long-form performance largely unchanged but noticeably hurts short-form tasks such as 2Wiki. These results indicate that short-form supervision

RL benefits from stronger SFT models and longer train- ing. We ablate the effect of using different SFT cold start datasets on RL in Figure 5, tracing performance up to 4000 training steps. Beginning RL directly from Qwen3 (no SFT

7

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

图 3. DR 药物的比较 GeneticDiseasesQA。最终答案：回复中恢复的专家注释事实的比例。证据支持：被引用来源的原文完全支持的引用主张的比例。证据质量：是否存在所要求的支持证据类型。证据综合：是否存在解决多个来源之间关系的声明。 DR Tulu-8B (RL) 和 Qwen3-8B + 我们的搜索结果报告为 10 次试验的平均值。考虑到专有深度研究系统的高成本和推理时间，剩余的代理被报告为 3 次试验的平均值。 SimpleQA 2Wiki WebWalker 平均六、分析

朴素 RAG Qwen3-8B 52.6 18.9 8.8 26.8 QwQ-32B 57.2 34.2 10.1 33.8

我们对 DR Tulu 进行了一系列分析。除非另有说明，本节在 1k 训练步骤中使用 DR Tulu SFT 检查点和早期 DR Tulu RL 检查点。 6.1.对简短 QA 任务的评估

开放深度研究（我们的） Qwen3-8B + 我们的搜索 70.5 44.0 27.9 47.5 DR Tulu-8B (SFT) 75.5 66.5 31.9 58.0 DR Tulu-8B (RL) 75.9 68.9 39.0 61.3 表 2. 简短结果。我们报告简短的表现

我们的 SFT 和 RL 变体可以分析每个训练阶段如何影响简短的行为。所有分数都是根据统一评估流程下的 top-1 预测计算得出的。 SQAv2 健康研究 DRB 平均尽管我们的 RLER 训练目标是长篇、开放式的深入研究，但我们的 SFT 混合物有意包含需要搜索的短篇、可验证的 QA 任务，使模型能够处理简洁和多段落的响应。因此，我们评估我们的 SFT 和 RL 模型推广到短格式查询的效果。 DR Tulu (SFTv0.1) 73.4 37.5 68.6 39.4 54.7 一般评分标准 80.6 36.0 65.0 37.5 54.8 闭卷评分标准 83.2 34.8 66.6 37.6 55.6 基于初始搜索的评分标准 82.8 37.9 66.9 39.3 56.7 表 3. 基于搜索的静态评分标准效果最佳。我们训练使用

从中间 SFT 检查点（SFT v0.1）开始，使用 RL 进行 500 个步骤的不同静态规则。 “基于初始搜索的评分标准”是指在不演化训练过程中生成的评分标准的情况下对 RLER 的消融。基于搜索的评分标准始终优于一般评分标准和不以最新信息为基础的闭卷评分标准。我们在 SimpleQA (Wei et al., 2024)、WebWalkerQA (Wu et al., 2025a) 和 2Wiki (Ho et al., 2020) 上评估简短的 QA。根据之前的工作（Li et al., 2025a；Wei et al., 2024），我们使用 LLM 法官来评估答案的正确性，并以 GPT-4.1 作为 LLM 法官来报告 Pass@1 准确性。为了提高效率，我们对来自 SimpleQA 和 2Wiki 的 1,000 个随机抽样问题进行评估。表 2 显示 DR Tulu 在简短的 QA 基准测试中表现出竞争力。 SFT 阶段比 Qwen3-8B + 我们的搜索基线取得了显着的进步，证明了我们的 SFT 数据对于简短形式 QA 的有效性。值得注意的是，尽管 RL 训练仅使用长格式提示并显式优化长格式生成，但 DR Tulu (RL) 在短格式 QA 上实现了进一步改进，将总体平均值提高了 3.3 分，表明具有很强的跨任务泛化能力。 6.2.训练与推理分析

单独并不能可靠地转移到开放式深度研究，而保留适度的短形式成分有助于保留通用行为而不牺牲长形式的性能。扩展 SFT 数据在各个任务中产生了明显的早期收益，长格式基准显示仅使用 5% 的数据即可实现实质性改进，并且在 50% 以上基本饱和，而短格式任务（尤其是 2Wiki）继续受益于直至完整数据集的附加数据。
尽管全数据 SFT 略微降低了 SQAv2 引文分数，但总体简短准确率仍然很高，并且后续的 RL 训练恢复了引文性能，这促使我们使用完整的 SFT 数据集，然后再使用 RL。 SFT 受益于混合监督，但在长期任务上表现出回报递减。图 4 显示，在 SFT 期间合并长格式和短格式数据非常重要：删除长格式数据会大大降低所有长格式基准测试的性能，而删除短格式数据会使长格式性能基本保持不变，但会明显损害 2Wiki 等短格式任务。这些结果表明，短期监管

强化学习受益于更强大的 SFT 模型和更长的训练。我们消除了在图 5 中使用不同 SFT 冷启动数据集对 RL 的影响，跟踪多达 4000 个训练步骤的性能。直接从 Qwen3 开始 RL（无 SFT

7

<!-- page 8 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

HealthBench

ResearchQA

DRB

SQAv2

2Wiki

40

70

40

70

35

65

35

65

30

60

25

30

60

20

55

25

55

15

Score (%)

Score (%)

Score (%)

Score (%)

Score (%)

50

10

20

50

45

5

0

40

15

40 45 50 55 60 65 70 75 80 85

45

0 5 10 50 100 SFT data (%)

0 5 10 50 100 SFT data (%)

0 5 10 50 100 SFT data (%)

0 5 10 50 100 SFT data (%)

0 5 10 50 100 SFT data (%)

Varying Data Size Short-form Only Long-form Only

Figure 4. Ablation of SFT training data. We ablate SFT training data in terms of the mixture of data and the scale of training data. We

train models with varying sizes of SFT data (5%, 10%, 100%; 0% indicates the Qwen3-8B + dr-agent-lib results) as well as two SFT subsets, long-form data only (LF only) and short-form data only (SF only).

60

55

50

higher train reward (i.e., reward during RL training) did not necessarily correspond to higher downstream reward; see Appendix I.8 for details. We also experiment with using an ‘on-policy SFT’ model as a starting point, which we provide

45

Score (%)

40

35

30

On Policy SFT Our SFT Undertrained SFT No SFT

further details on in Appendix I.3. Finally, we find that our training is robust to tool errors, with the model improving performance even after extended training with a tool that consistently errors. Appendix I.2 provides details and the full RL training curves.

0 200 400 600 1000 1900 4000 RL training steps

Figure 5. Our full SFT mix performs best during RL. We vary

the model used for RL training, keeping data and hyperparameters constant. Note that the x-axis is not uniform in the gray area. Performance is average across Healthbench, SQAv2, DRB.

60

58

56

Score (%)

54

Evolving rubrics improve over initial rubrics alone. We ablate evolving rubrics and compare them against RL with static, search-augmented rubrics only in Figure 6. Remov- ing evolving rubrics results in up to a 2-point drop in av- erage performance, with the gap widening over training as evolving rubrics capture new knowledge the model explores. Both approaches outperform random rewards instead of rubric-based rewards, ensuring that our results are not due to spurious behaviors in Qwen-based models (Shao et al., 2025). Finally, branching a single training run with and without the citation reward enabled yields comparable per- formance (Appendix I.4), indicating that RLER’s rubric reward, rather than auxiliary signals, drives the gains.

52

50

0 500 1000 1500 2000 2500 RL training steps

No RL w/ RLER w/ initial rubrics only w/ random

Figure 6. RLER consistently improves performance during

RL training. We train models with only our initial search-based rubrics and with RLER. We also compare to using no RL and using purely random rewards. Performance is average across Healthbench, SQAv2, DRB.

RLER does not rely on a strong proprietary judge. We additionally replace GPT-4.1 and GPT-4.1-mini with Qwen3-8B—the same initial model used to train DR Tulu— as both the rubric generator and the LM judge in Table 4). After 1000 RL steps, the open-judge variant still gains +4.4 average points over the SFT checkpoint, only 1.3 points be- hind the GPT-judge configuration (+5.7). Combined with the fact that GPT-4.1 and GPT-4.1-mini themselves perform poorly on deep research tasks, this indicates that RLER’s gains do not stem from distilling a stronger proprietary judge, and the recipe transfers to settings without access to such models.

Search-based rubrics outperform closed-book rubrics. We ablate the effect of using different static rubrics (i.e., without adding evolving rubrics) during RL training in Ta- ble 3. We run RL training (w/o ER) for 500 steps on top of an intermediate SFT checkpoint using three different rubric

cold start) dramatically improves scores over Qwen3-8B with no training, but still underperforms using even a small amount of high-quality SFT data (5% of our full mixture) as cold-start data for the RL training. Using a larger amount of SFT data (i.e., our full SFT mixture) further improves perfor- mance. Extended RL training was crucial to performance: in some cases, evaluations that initially seemed flat (e.g., DRB) improved with extended RL training. We found that

8

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

健康台

研究质量保证

DRB

SQAv2

2维基百科

40

70

40

70

35

65

35

65

30

60

25

30

60

20

55

25

55

15

得分（%）

得分（%）

得分（%）

得分（%）

得分（%）

50

10

20

50

45

5

0

40

15

40 45 50 55 60 65 70 75 80 85

45

0 5 10 50 100 SFT 数据 (%)

0 5 10 50 100 SFT 数据 (%)

0 5 10 50 100 SFT 数据 (%)

0 5 10 50 100 SFT 数据 (%)

0 5 10 50 100 SFT 数据 (%)

改变数据大小 仅短格式 仅长格式

图 4.SFT 训练数据的消融。我们根据数据混合和训练数据规模来消融 SFT 训练数据。我们

使用不同大小的 SFT 数据（5%、10%、100%；0% 表示 Qwen3-8B + dr-agent-lib 结果）以及两个 SFT 子集（仅长格式数据（仅 LF）和仅短格式数据（仅 SF））训练模型。

60

55

50

较高的训练奖励（即强化学习训练期间的奖励）不一定对应于较高的下游奖励；详细信息参见附录I.8。我们还尝试使用“on-policy SFT”模型作为起点，我们提供了该模型

45

得分（%）

40

35

30

关于政策 SFT 我们的 SFT 训练不足的 SFT 没有 SFT

更多详情请参见附录 I.3。最后，我们发现我们的训练对工具错误具有鲁棒性，即使在使用持续错误的工具进行扩展训练后，模型也能提高性能。附录 I.2 提供了详细信息和完整的 RL 训练曲线。

0 200 400 600 1000 1900 4000 RL 训练步骤

图 5.我们的完整 SFT 组合在 RL 期间表现最佳。我们各有不同

用于强化学习训练的模型，保持数据和超参数恒定。请注意，灰色区域的 x 轴不均匀。 Healthbench、SQAv2、DRB 的性能处于平均水平。

60

58

56

得分（%）

54

不断发展的评估标准比最初的评估标准有所改进。仅在图 6 中，我们取消了不断发展的评价标准，并将它们与静态、搜索增强的强化学习评价标准进行比较。删除不断发展的评价标准会导致平均性能下降最多 2 个百分点，并且随着不断发展的评价标准捕获模型探索的新知识，训练过程中的差距会扩大。这两种方法都优于随机奖励而不是基于标题的奖励，确保我们的结果不是由于基于 Qwen 的模型中的虚假行为造成的（Shao 等人，2025）。最后，在启用和不启用引用奖励的情况下对单个训练运行进行分支会产生可比较的性能（附录 I.4），这表明 RLER 的标题奖励（而不是辅助信号）驱动了增益。

52

50

0 500 1000 1500 2000 2500 RL 训练步骤

无 RL，带 RLER，带初始量规，仅带随机

图 6. RLER 持续提高性能

强化学习训练。我们仅使用最初的基于搜索的量规和 RLER 来训练模型。我们还与不使用强化学习和使用纯随机奖励进行比较。 Healthbench、SQAv2、DRB 的性能处于平均水平。

RLER 不依赖于强大的专有判断。我们还用 Qwen3-8B（用于训练 DR Tulu 的相同初始模型）替换了 GPT-4.1 和 GPT-4.1-mini，作为表 4 中的红字生成器和 LM 判断。经过 1000 个 RL 步骤后，开放判断变体仍然比 SFT 检查点平均获得 +4.4 分，仅落后 GPT 判断配置（+5.7） 1.3 分。结合 GPT-4.1 和 GPT-4.1-mini 本身在深度研究任务上表现不佳的事实，这表明 RLER 的收益并非源于提炼出更强的专有判断，并且配方转移到无法访问此类模型的设置。

基于搜索的评分标准优于闭卷评分标准。我们消除了表 3 中 RL 训练期间使用不同静态评分标准（即不添加演化评分标准）的影响。我们使用三种不同的评分标准在中间 SFT 检查点之上运行 RL 训练（无 ER）500 步

冷启动）比没有训练的 Qwen3-8B 显着提高了分数，但即使使用少量高质量 SFT 数据（全部混合物的 5%）作为 RL 训练的冷启动数据，仍然表现不佳。使用大量 SFT 数据（即我们的完整 SFT 混合物）可以进一步提高性能。扩展 RL 训练对于性能至关重要：在某些情况下，最初看似平淡的评估（例如 DRB）随着扩展 RL 训练而得到改善。我们发现

8

<!-- page 9 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

SQAv2 HealthBench ResearchQA DRB Average

Qwen3-8B + Our Search 57.2 5.9 46.3 18.2 31.9 + SFT 72.3 38.1 68.5 39.0 53.9 + RL (1000 steps, GPT-judge) 85.8 42.2 70.2 40.1 59.6 + RL (1000 steps, Qwen3-8B-judge) 85.3 39.7 69.2 39.1 58.3

Table 4. Comparing using GPT-4.1 and Qwen3-8B as a judge model and rubric generator. For GPT-judge, we use GPT-4.1-mini as

the judge, and GPT-4.1 as the rubric generator. For Qwen3-8B-judge, we use Qwen3-8B as both judge and generator. Using Qwen3-8B only underperforms using GPT models by 1.3 points, while still outperforming the SFT baseline by 4.4 points.

literature understanding. In contrast, web search is the primary tool for HealthBench, DeepResearchBench, and SimpleQA, reflecting the broader, open-web information needs of these tasks.

7. Related Works

setups: (1) general rubrics, in which we use a simple prompt and LM judge to score model outputs (see Appendix G.3 for prompt); (2) closed-book rubrics, which are generated without access to any search information; (3) search-based rubrics, which are generated with knowledge from an ini- tial search (See Appendix D.2 for details). For these runs, we use only OpenScholar training samples. Search-based rubrics perform best overall, while a single general rubric shared across samples underperforms the SFT baseline.

Deep research agents. Recent work on DR agents often focuses on short-form QA (Jin et al., 2025; Liu et al., 2025; Team et al., 2025; Gao et al., 2025). While some systems target long-form research tasks, they typically rely on static workflows or proprietary components (Li et al., 2025a;b; Prabhakar et al., 2025; Singh et al., 2025), offer limited tool support, or do not fully release code and data. We provide additional discussion of these related works in Appendix B.

Evolving rubrics improve over initial rubrics alone. We additionally ablate using evolving rubrics on top of search- based rubrics in Figure 5 (right), training for 2500 steps. We find that removing RLER leads to up to a 2-point drop in performance, with the gap widening over training as evolving rubrics capture new knowledge the model explores.

Rubric design for long-form generation. Human-written rubrics are commonly used for evaluation but are costly for training (Arora et al., 2025; Asai et al., 2024). Recent methods generate model-based rubrics for training, includ- ing static rubric rewards (Gunjal et al., 2025), closed-book online rubric generation (Rezaei et al., 2025; Jayalath et al., 2025), and learned critics for factuality (Wu et al., 2025b), but these approaches are ungrounded in external knowl- edge and remain fixed or weakly adaptive. Related work also explores retrieval-assisted evaluation criteria (Wadhwa et al., 2025). Our approach differs by generating retrieval- grounded rubrics that co-evolve with the policy model.

Open rubric judge ablations. We additionally experi- ment with using a fully open model as the judge model for citation and rubric scoring, as well as for generating the evolving rubrics during RL training. We use Qwen3-8B as the judge and generation model and run training for 1000 steps, with the citation reward only turned on for the ini- tial 650 steps as in the main run. We also note that due to context length limitations, we only pass the final answers to the rubric generator, as opposed to the full output trajectory. We present our results in Table 4. We compare to our main training run at 1000 steps, in which we used GPT-4.1-mini as the LM judge and GPT-4.1 as the rubric generator.

8. Conclusion

We find that using an open judge can still improve over SFT alone by over 4 points, although it underperforms using GPT models by roughly 1 point. This suggests that Qwen3-8B is still capable of acting as a judge and rubric generator despite being generally less performant than GPT-4.1-mini and GPT-4.1. Importantly, this also shows that RLER does not rely on the presence of a stronger model, as Qwen3- 8B is precisely the starting model used for training DR Tulu. We leave further exploration of using open-weights or even the model under training itself as the rubric judge and generator to future work.

We present DR Tulu-8B and Reinforcement Learning with Evolving Rubrics (RLER), an end-to-end training frame- work for long-form deep research tasks. We release the model, data, rubrics, and training infrastructure to support reproducibility and future research on deep research agents. Looking ahead, DR Tulu opens several directions for long- form DR training, including adaptive verifier design, scaling privileged information for judges, improving alignment be- tween training rewards and downstream evaluations, and extending DR agents to specialized scientific workflows. We provide an extended discussion and outline future directions in Appendix A.

Tool usage adapts to each task’s information needs. Fig- ure 30 shows that paper search (our scientific-paper search) dominates on SQAv2, consistent with its focus on

9

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

SQAv2 HealthBench ResearchQA DRB 平均值

Qwen3-8B + 我们的搜索 57.2 5.9 46.3 18.2 31.9 + SFT 72.3 38.1 68.5 39.0 53.9 + RL（1000 步，GPT 判断） 85.8 42.2 70.2 40.1 59.6 + RL（1000 步，GPT 判断） Qwen3-8B-法官) 85.3 39.7 69.2 39.1 58.3

表 4. 使用 GPT-4.1 和 Qwen3-8B 作为判断模型和评分标准生成器的比较。对于GPT-judge，我们使用GPT-4.1-mini作为

判断，GPT-4.1 作为标题生成器。对于Qwen3-8B-judge，我们使用Qwen3-8B作为判断器和生成器。使用 Qwen3-8B 仅比使用 GPT 模型低 1.3 个点，但仍比 SFT 基线高 4.4 个点。文学理解。相比之下，网络搜索是 HealthBench、DeepResearchBench 和 SimpleQA 的主要工具，反映了这些任务更广泛的开放网络信息需求。 7. 相关作品

设置：（1）一般评分标准，其中我们使用简单的提示和LM判断对模型输出进行评分（提示见附录G.3）； (2) 闭卷评分表，无需访问任何检索信息即可生成； (3) 基于搜索的评分标准，是根据初始搜索的知识生成的（详细信息请参见附录 D.2）。对于这些运行，我们仅使用 OpenScholar 训练样本。基于搜索的评分标准总体表现最佳，而跨样本共享的单个通用评分标准的表现则低于 SFT 基线。深研代理。最近关于 DR 代理的工作通常侧重于简短的 QA（Jin 等人，2025；Liu 等人，2025；Team 等人，2025；Gao 等人，2025）。虽然一些系统针对的是长期研究任务，但它们通常依赖于静态工作流程或专有组件（Li et al., 2025a;b; Prabhakar et al., 2025; Singh et al., 2025），提供有限的工具支持，或者不完全发布代码和数据。我们在附录 B 中提供了对这些相关工作的额外讨论。不断发展的评估标准比最初的评估标准单独进行了改进。我们还在图 5（右）中基于搜索的评分标准之上使用不断演变的评分标准，训练 2500 个步骤。我们发现，删除 RLER 会导致性能下降最多 2 个百分点，并且随着不断发展的规则捕获模型探索的新知识，训练中的差距会扩大。用于长格式生成的标题设计。人工编写的评分标准通常用于评估，但训练成本高昂（Arora 等人，2025；Asai 等人，2024）。最近的方法生成基于模型的训练标题，包括静态标题奖励（Gunjal et al., 2025）、闭卷在线标题生成（Rezaei et al., 2025; Jayalath et al., 2025）和学习事实性批评（Wu et al., 2025b），但这些方法没有外部知识的基础，并且保持固定或适应性较弱。相关工作还探讨了检索辅助评估标准（Wadhwa 等人，2025）。我们的方法的不同之处在于生成与策略模型共同演化的基于检索的标题。开放评审规则消融。我们还尝试使用完全开放的模型作为引文和评分标准的判断模型，以及在强化学习训练期间生成不断演变的评分标准。我们使用Qwen3-8B作为判断和生成模型，并运行1000步训练，与主运行一样，仅在最初的650步中打开引用奖励。我们还注意到，由于上下文长度限制，我们仅将最终答案传递给标题生成器，而不是完整的输出轨迹。我们在表 4 中展示了我们的结果。我们与 1000 步的主要训练运行进行了比较，其中我们使用 GPT-4.1-mini 作为 LM 判断器，使用 GPT-4.1 作为评分生成器。八、结论

我们发现，使用开放法官仍然可以比单独的 SFT 提高 4 个百分点以上，尽管它比使用 GPT 模型大约低 1 个百分点。这表明 Qwen3-8B 仍然能够充当法官和标题生成器，尽管其性能普遍低于 GPT-4.1-mini 和 GPT-4.1。
重要的是，这也表明 RLER 并不依赖于更强模型的存在，因为 Qwen3-8B 正是用于训练 DR Tulu 的起始模型。我们将进一步探索使用开放权重甚至正在训练的模型本身作为标题判断和生成器的未来工作。我们提出了 DR Tulu-8B 和带有进化规则的强化学习（RLER），这是一个用于长期深度研究任务的端到端训练框架。我们发布模型、数据、规则和培训基础设施，以支持深度研究代理的可重复性和未来研究。展望未来，DR Tulu 为长期 DR 培训开辟了几个方向，包括自适应验证器设计、为法官扩展特权信息、改善培训奖励和下游评估之间的一致性，以及将 DR 代理扩展到专门的科学工作流程。我们在附录 A 中提供了扩展的讨论并概述了未来的方向。工具的使用适应每个任务的信息需求。图 30 显示论文搜索（我们的科学论文搜索）在 SQAv2 上占主导地位，这与它对

9

<!-- page 10 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Cheerie, D., Meserve, M. M., Beijer, D., Kaiwar, C., New-

Impact Statement

ton, L., Taylor Tavares, A. L., Verran, A. S., Sherrill, E., Leonard, S., Sanders, S. J., Blake, E., Elkhateeb, N., Gandhi, A., Liang, N. S. Y., Morgan, J. T., Verwillow, A., Verheijen, J., Giles, A., Williams, S., Chopra, M., Croft, L., Dafsari, H. S., Davidson, A. E., Friedman, J., Gregor, A., Haque, B., Lechner, R., Montgomery, K. A., Ryten, M., Schober, E., Siegel, G., Sullivan, P. J., Whittle, E. F., Zardetto, B., Yu, T. W., Synofzik, M., Aartsma-Rus, A., Costain, G., Lauffer, M. C., and Collaborative, N. Consen- sus guidelines for assessing eligibility of pathogenic dna variants for antisense oligonucleotide treatments. Ameri- can Journal of Human Genetics, 112(5):975–983, May 2025. doi: 10.1016/j.ajhg.2025.02.017. Epub 2025 Mar 25.

Chen, L., Han, X., Shen, L., Bai, J., and Wong, K.-F. Be-

yond two-stage training: Cooperative sft and rl for llm reasoning, 2025a. URL https://arxiv.org/abs/ 2509.06948.

We introduce Reinforcement Learning with Evolving Rubrics (RLER) and DR Tulu-8B, an open deep research agent trained using this approach. To support reproducibil- ity and further research, we fully open-source the model, training data, evaluation rubrics, and agent infrastructure. Potential positive impacts include enabling broader access to long-form research capabilities, improving reproducibility, and supporting more rigorous evaluation of deep research agents in science, healthcare, and general domains. How- ever, such systems may amplify harms common to research assistants—e.g., generating plausible but incorrect claims, selective citation, or biased synthesis—and could increase the scale of misinformation or low-quality research outputs if deployed without safeguards. We therefore view DR Tulu primarily as a research artifact: downstream use should in- corporate careful evaluation, transparency about uncertainty and sources, and domain-appropriate human oversight, es- pecially in high-stakes settings.

Chen, X., Li, G., Wang, Z., Jin, B., Qian, C., Wang,

Acknowledgments

Y., Wang, H., Zhang, Y., Zhang, D., Zhang, T., et al.

Rm-r1: Reward modeling as reasoning. arXiv preprint arXiv:2505.02387, 2025b.

Clark, J. H., Choi, E., Collins, M., Garrette, D., Kwiatkowski, T., Nikolaev, V., and Palomaki, J. Tydi qa: A benchmark for information-seeking question answering in ty pologically di verse languages. Transactions of the Association for Computational Linguistics, 8:454–470,

2020.

Du, M., Xu, B., Zhu, C., Wang, X., and Mao, Z. Deep-

This material is based upon work supported by the National Science Foundation under Award No. 2413244. This work was supported by the Singapore National Research Founda- tion and the National AI Group in the Singapore Ministry of Digital Development and Information under the AI Visiting Professorship Programme (award number AIVP-2024-001), the AI2050 program at Schmidt Sciences, and the DARPA SciFy program (Agreement No. HR00112520300). We thank Zhiyuan Zeng, Rui Xin, Stella Li, and Doug Downey for helpful discussions and feedback on the draft.

research bench: A comprehensive benchmark for deep research agents. arXiv preprint arXiv:2506.11763, 2025.

References

Fan, R.-Z., Wang, Z., and Liu, P. Megascience: Pushing the

Arora, R. K., Wei, J., Hicks, R. S., Bowman, P., Qui˜nonero-

frontiers of post-training datasets for science reasoning. arXiv preprint arXiv:2507.16812, 2025.

Gao, J., Fu, W., Xie, M., Xu, S., He, C., Mei, Z., Zhu, B.,

Candela, J., Tsimpourlas, F., Sharman, M., Shah, M., Vallone, A., Beutel, A., et al. Healthbench: Evaluating large language models towards improved human health. arXiv preprint arXiv:2505.08775, 2025.

Asai, A., He, J., Shao, R., Shi, W., Singh, A., Chang, J. C.,

and Wu, Y. Beyond ten turns: Unlocking long-horizon agentic search with large-scale asynchronous rl. arXiv preprint arXiv:2508.07976, 2025.

Gunjal, A., Wang, A., Lau, E., Nath, V., He, Y., Liu,

Lo, K., Soldaini, L., Feldman, S., D’arcy, M., et al. Open- scholar: Synthesizing scientific literature with retrieval- augmented lms. arXiv preprint arXiv:2411.14199, 2024.

Bragg, J., D’Arcy, M., Balepur, N., Bareket, D., Dalvi,

B., and Hendryx, S. Rubrics as rewards: Reinforce- ment learning beyond verifiable domains. arXiv preprint arXiv:2507.17746, 2025.

Guo, J., Chi, Z., Dong, L., Dong, Q., Wu, X., Huang, S.,

B., Feldman, S., Haddad, D., Hwang, J. D., Jansen, P., Kishore, V., et al. Astabench: Rigorous benchmarking of ai agents with a scientific research suite. arXiv preprint arXiv:2510.21652, 2025.

and Wei, F. Reward reasoning model. arXiv preprint arXiv:2505.14674, 2025.

Ho, X., Duong Nguyen, A.-K., Sugawara, S., and Aizawa,

Cao, T., Bhandari, N., Yerukola, A., Asai, A., and Sap, M.

Out of style: Rag’s fragility to linguistic variation. arXiv preprint arXiv:2504.08231, 2025.

A. Constructing a multi-hop QA dataset for compre- hensive evaluation of reasoning steps. In Scott, D.,

10

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

Cheerie, D.、Meserve, M.M.、Beijer, D.、Kaiwar, C.、New-

影响报告

吨，L.，泰勒塔瓦雷斯，A.L.，韦兰，A.S.，谢里尔，E.，伦纳德，S.，桑德斯，S.J.，布莱克，E.，Elkhateeb，N.，甘地，A.，梁，N.S.Y.，摩根，J.T.，Verwillow，A.，Verheijen，J.，吉尔斯，A.，威廉姆斯，S.，乔普拉，M.，克罗夫特， L.、Dafsari, H.S.、Davidson, A.E.、Friedman, J.、Gregor, A.、Haque, B.、Lechner, R.、Montgomery, K.A.、Ryten, M.、Schober, E.、Siegel, G.、Sullivan, P.J.、Whittle, E.F.、Zardetto, B.、Yu, T.W.、Synofzik, M., Aartsma-Rus, A., Costain, G., Lauffer, M. C., 和 Collaborative, N. 评估致病性 dna 变异是否适合反义寡核苷酸治疗的共识指南。美国人类遗传学杂志，112(5):975–983，2025 年 5 月。doi: 10.1016/j.ajhg.2025.02.017。 Epub 2025 年 Mar 25。Chen, L.、Han, X.、Shen, L.、Bai, J. 和 Wong, K.-F。是-

超越两阶段训练：LLM 推理的合作 SFT 和 RL，2025a。网址 https://arxiv.org/abs/2509.06948。我们引入了带有进化规则的强化学习 (RLER) 和 DR Tulu-8B，这是一种使用这种方法训练的开放式深度研究代理。为了支持可重复性和进一步研究，我们完全开源模型、训练数据、评估标准和代理基础设施。潜在的积极影响包括使人们能够更广泛地获得长期研究能力、提高可重复性以及支持对科学、医疗保健和一般领域的深度研究机构进行更严格的评估。然而，此类系统可能会放大研究助理常见的危害——例如，产生看似合理但不正确的主张、选择性引用或有偏见的合成——并且如果在没有保障措施的情况下部署，可能会增加错误信息或低质量研究成果的规模。因此，我们主要将 DR Tulu 视为一种研究制品：下游使用应包括仔细评估、不确定性和来源的透明度以及适合领域的人类监督，尤其是在高风险环境中。陈X.，李G.，王Z.，金B.，钱C.，王，

致谢

Y.，王H.，张Y.，张D.，张T.，等。 Rm-r1：奖励建模作为推理。 arXiv 预印本 arXiv:2505.02387, 2025b。 Clark, J. H.、Choi, E.、Collins, M.、Garrette, D.、Kwiatkowski, T.、Nikolaev, V. 和 Palomaki, J. Tydi qa：以不同类型语言进行信息搜索问答的基准。计算语言学协会汇刊，8：454–470，

2020.杜明、徐B.、朱成、王X.、毛Z.深-

本材料基于美国国家科学基金会资助的编号为 2413244 的工作。这项工作得到了新加坡国家研究基金会和新加坡数字发展和信息部国家人工智能组的人工智能客座教授计划（资助号 AIVP-2024-001）、Schmidt Sciences 的 AI2050 计划和 DARPA SciFy 计划（协议号 2413244）的支持。 HR00112520300）。我们感谢 Zengyuan Zeng、Rui Xin、Stella Li 和 Doug Downey 对草案进行了有益的讨论和反馈。研究平台：深度研究代理的综合基准。 arXiv 预印本 arXiv:2506.11763, 2025。 参考文献

Fan, R.-Z.、Wang, Z. 和 Liu, P. 巨型科学：推动

Arora, R.K.、Wei, J.、Hicks, R.S.、Bowman, P.、Quinonero-

用于科学推理的训练后数据集的前沿。 arXiv 预印本 arXiv:2507.16812, 2025。高杰、付伟、谢明、徐胜、何成、梅志、朱波、

Candela, J.、Tsimpourlas, F.、Sharman, M.、Shah, M.、Vallone, A.、Beutel, A. 等人。 Healthbench：评估大型语言模型以改善人类健康。 arXiv 预印本 arXiv:2505.08775, 2025。Asai, A.、He, J.、Shao, R.、Shi, W.、Singh, A.、Chang, J. C.,

和 Wu, Y. 超越十转：通过大规模异步 RL 解锁长视野代理搜索。 arXiv 预印本 arXiv:2508.07976, 2025。
Gunjal, A.、Wang, A.、Lau, E.、Nath, V.、He, Y.、Liu,

Lo, K.、Soldaini, L.、Feldman, S.、D’arcy, M. 等人。开放学者：利用检索增强型医学综合科学文献。 arXiv 预印本 arXiv:2411.14199, 2024。Bragg, J.、D’Arcy, M.、Balepur, N.、Bareket, D.、Dalvi,

B. 和 Hendryx, S. 作为奖励的评分标准：超越可验证领域的强化学习。 arXiv 预印本 arXiv:2507.17746, 2025。Guo, J., Chi, Z., Dong, L., Dong, Q., Wu, X., Huang, S.,

B.、Feldman, S.、Haddad, D.、Hwang, J. D.、Jansen, P.、Kishore, V. 等。 Astabench：通过科学研究套件对人工智能代理进行严格的基准测试。 arXiv 预印本 arXiv:2510.21652, 2025。以及 Wei, F. 奖励推理模型。 arXiv 预印本 arXiv:2505.14674, 2025。Ho, X.、Duong Nguyen, A.-K.、Sugarara, S. 和 Aizawa,

Cao, T.、Bhandari, N.、Yerukola, A.、Asai, A. 和 Sap, M. 过时的风格：拉格对语言变异的脆弱性。 arXiv 预印本 arXiv:2504.08231, 2025。A. 构建多跳 QA 数据集以全面评估推理步骤。在斯科特，D.，

10

<!-- page 11 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

outlines for open-ended deep research. arXiv preprint arXiv:2509.13312, 2025b.

Liu, J., Li, Y., Zhang, C., Li, J., Chen, A., Ji, K., Cheng,

W., Wu, Z., Du, C., Xu, Q., et al. Webexplorer: Explore and evolve for training long-horizon web agents. arXiv preprint arXiv:2509.06501, 2025.

Bel, N., and Zong, C. (eds.), Proceedings of the 28th International Conference on Computational Linguis- tics, pp. 6609–6625, Barcelona, Spain (Online), De- cember 2020. International Committee on Computa- tional Linguistics. doi: 10.18653/v1/2020.coling-main. 580. URL https://aclanthology.org/2020. coling-main.580/.

Liu, N., Zhang, T., and Liang, P. Evaluating verifiability

Jayalath, D., Goel, S., Foster, T., Jain, P., Gururangan, S.,

Zhang, C., Goyal, A., and Schelten, A. Compute as teacher: Turning inference compute into reference-free supervision. arXiv preprint arXiv:2509.14234, 2025.

Jiang, D., Lu, Y., Li, Z., Lyu, Z., Nie, P., Wang, H., Su, A.,

in generative search engines. In Bouamor, H., Pino, J., and Bali, K. (eds.), Findings of the Association for Com- putational Linguistics: EMNLP 2023, pp. 7001–7025, Singapore, December 2023a. Association for Compu- tational Linguistics. doi: 10.18653/v1/2023.findings- emnlp.467. URL https://aclanthology.org/ 2023.findings-emnlp.467/.

Chen, H., Zou, K., Du, C., et al. Verltool: Towards holis- tic agentic reinforcement learning with tool use. arXiv preprint arXiv:2509.01055, 2025.

Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., and Zhu, C.

Jin, B., Zeng, H., Yue, Z., Yoon, J., Arik, S., Wang, D.,

G-eval: Nlg evaluation using gpt-4 with better human alignment. arXiv preprint arXiv:2303.16634, 2023b.

Mallen, A., Asai, A., Zhong, V., Das, R., Hajishirzi, H.,

Zamani, H., and Han, J. Search-r1: Training llms to reason and leverage search engines with reinforcement learning. In COLM, 2025.

Krishna, K., Roy, A., and Iyyer, M. Hurdles to progress

and Khashabi, D. When not to trust language models: Investigating effectiveness and limitations of parametric and non-parametric memories. arXiv preprint, 2022.

Mallen, A., Asai, A., Zhong, V., Das, R., Khashabi, D.,

in long-form question answering. In Toutanova, K., Rumshisky, A., Zettlemoyer, L., Hakkani-Tur, D., Belt- agy, I., Bethard, S., Cotterell, R., Chakraborty, T., and Zhou, Y. (eds.), Proceedings of the 2021 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technolo- gies, pp. 4940–4957, Online, June 2021. Association for Computational Linguistics. doi: 10.18653/v1/2021.naacl- main.393. URL https://aclanthology.org/ 2021.naacl-main.393/.

Lambert, N., Morrison, J., Pyatkin, V., Huang, S., Ivison, H.,

and Hajishirzi, H. When not to trust language mod- els: Investigating effectiveness of parametric and non- parametric memories. In Rogers, A., Boyd-Graber, J., and Okazaki, N. (eds.), Proceedings of the 61st Annual Meet- ing of the Association for Computational Linguistics (Vol- ume 1: Long Papers), pp. 9802–9822, Toronto, Canada, July 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.acl-long.546. URL https: //aclanthology.org/2023.acl-long.546/.

Miroyan, M., Wu, T.-H., King, L., Li, T., Pan, J., Hu, X.,

Chiang, W.-L., Angelopoulos, A. N., Darrell, T., Norouzi, N., et al. Search arena: Analyzing search-augmented llms. arXiv preprint arXiv:2506.05334, 2025.

Nguyen, X.-P., Pandit, S., Reddy, R. G., Xu, A., Savarese,

Brahman, F., Miranda, L. J. V., Liu, A., Dziri, N., Lyu, X., Gu, Y., Malik, S., Graf, V., Hwang, J. D., Yang, J., Bras, R. L., Tafjord, O., Wilhelm, C., Soldaini, L., Smith, N. A., Wang, Y., Dasigi, P., and Hajishirzi, H. Tulu 3: Pushing frontiers in open language model post-training. In Second Conference on Language Modeling, 2025. URL https: //openreview.net/forum?id=i1uGbfHHpH.

Li, H., Dong, Q., Chen, J., Su, H., Zhou, Y., Ai, Q., Ye,

S., Xiong, C., and Joty, S. Sfr-deepresearch: Towards effective reinforcement learning for autonomously rea- soning single agents. arXiv preprint arXiv:2509.06283, 2025.

Z., and Liu, Y. Llms-as-judges: a comprehensive sur- vey on llm-based evaluation methods. arXiv preprint arXiv:2412.05579, 2024.

Noukhovitch, M., Huang, S., Xhonneux, S., Hosseini, A.,

Li, X., Jin, J., Dong, G., Qian, H., Zhu, Y., Wu, Y., Wen, J.-

Agarwal, R., and Courville, A. Asynchronous RLHF: Faster and More Efficient Off-Policy RL for Language Models, October 2024. URL http://arxiv.org/ abs/2410.18252.

R., and Dou, Z. Webthinker: Empowering large reasoning models with deep research capability. arXiv preprint arXiv:2504.21776, 2025a.

Li, Z., Guan, X., Zhang, B., Huang, S., Zhou, H., Lai,

OpenAI. Deep research system card, 2025. URL https://openai.com/index/deep- research-system-card/. Accessed: 2025-10-21.

S., Yan, M., Jiang, Y., Xie, P., Huang, F., et al. Web- weaver: Structuring web-scale evidence with dynamic

11

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

开放式深入研究的大纲。 arXiv 预印本 arXiv:2509.13312, 2025b。刘J.，李Y.，张成，李J.，陈A.，季K.，程，

W.，吴，Z.，杜，C.，徐Q.，等。 Webexplorer：探索和发展以培训长期网络代理。 arXiv 预印本 arXiv:2509.06501, 2025。Bel, N. 和 Zong, C.（编辑），第 28 届国际计算语言学会议论文集，第 6609-6625 页，西班牙巴塞罗那（在线），2020 年 12 月。国际计算语言学委员会。 doi：10.18653/v1/2020.coling-main。 580.网址https://aclanthology.org/2020。 coling-main.580/。 Liu, N.、Zhang, T.和Liang, P. 评估可验证性

Jayalath, D.、Goel, S.、Foster, T.、Jain, P.、Gururangan, S.、

张，C.，戈亚尔，A.，和谢尔滕，A。作为教师进行计算：将推理计算转变为无参考监督。 arXiv 预印本 arXiv:2509.14234, 2025. 姜丹., 卢 Y., 李 Z., 吕 Z., 聂平., 王 H., 苏 A.,

在生成搜索引擎中。 Bouamor, H.、Pino, J. 和 Bali, K.（编辑），计算语言学协会的调查结果：EMNLP 2023，第 7001–7025 页，新加坡，2023 年 12 月a。计算语言学协会。 doi：10.18653/v1/2023.findings-emnlp.467。网址 https://aclanthology.org/2023.findings-emnlp.467/。陈 H.，邹 K.，杜 C.，等。 Verltool：通过工具使用实现整体代理强化学习。 arXiv 预印本 arXiv:2509.01055, 2025。Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., 和 Zhu, C. Jin, B., Zeng, H., Yue, Z., Yoon, J., Arik, S., Wang, D.,

G-eval：使用 gpt-4 进行 Nlg 评估，具有更好的人体对齐能力。 arXiv 预印本 arXiv:2303.16634, 2023b。 Mallen, A.、Asai, A.、Zhong, V.、Das, R.、Hajishirzi, H.、

Zamani, H. 和 Han, J. Search-r1：通过强化学习训练 llms 进行推理和利用搜索引擎。在 COLM，2025 年。Krishna, K.、Roy, A. 和 Iyyer, M. 取得进步的障碍

和 Khashabi, D. 何时不信任语言模型：研究参数和非参数记忆的有效性和局限性。 arXiv 预印本，2022 年。Mallen, A.、Asai, A.、Zhong, V.、Das, R.、Khashabi, D.，

在长篇问答中。 Toutanova, K.、Rumshisky, A.、Zettlemoyer, L.、Hakkani-Tur, D.、Bethard, S.、Cotterell, R.、Chakraborty, T. 和 Zhou, Y.（编辑），计算语言学协会北美分会 2021 年会议记录：人类语言技术gies，第 4940–4957 页，在线，2021 年 6 月。计算语言学协会。 doi：10.18653/v1/2021.naacl-main.393。网址 https://aclanthology.org/2021.naacl-main.393/。兰伯特，N.，莫里森，J.，皮特金，V.，黄，S.，艾维森，H.，

和 Hajishirzi, H. 何时不信任语言模型：研究参数和非参数记忆的有效性。收录于 Rogers, A.、Boyd-Graber, J. 和 Okazaki, N.（编），计算语言学协会第 61 届年会论文集（第一卷：长论文），第 9802-9822 页，加拿大多伦多，2023 年 7 月。计算语言学协会。 doi：10.18653/v1/2023.acl-long.546。网址 https://aclanthology.org/2023.acl-long.546/。 Miroyan, M.、吴 T.-H.、King, L.、李 T.、潘 J.、胡 X.、

蒋，W.-L.，安杰洛普洛斯，A.N.，达雷尔，T.，诺鲁兹，N.，等人。搜索领域：分析搜索增强的 LLMS。 arXiv 预印本 arXiv：2506.05334，2025。Nguyen，X.-P.，Pandit，S.，Reddy，R.G.，Xu，A.，Savarese，

Brahman, F.、Miranda, L. J. V.、Liu, A.、Dziri, N.、Lyu, X.、Gu, Y.、Malik, S.、Graf, V.、Hwang, J. D.、Yang, J.、Bras, R. L.、Tafjord, O.、Wilhelm, C.、Soldaini, L.、Smith, N.A.、Wang, Y.、Dasigi, P. 和Hajishirzi, H. Tulu 3：拓展开放语言模型训练后的前沿。第二届语言建模会议，2025 年。URL https://openreview.net/forum?id=i1uGbfHHpH。李红、董强、陈建、苏红、周勇、艾强、叶、

S.、Xiong, C. 和 Joty, S.
Sfr-deepresearch：针对单智能体自主推理的有效强化学习。 arXiv 预印本 arXiv:2509.06283, 2025. Z. 和 Liu, Y. Llms-as-judges：基于 LLM 的评估方法的综合调查。 arXiv 预印本 arXiv:2412.05579, 2024。Noukhovitch, M.、Huang, S.、Xhonneux, S.、Hosseini, A.,

李X.，金J.，董G.，钱红，朱Y.，吴Y.，文J.-

Agarwal, R. 和 Courville, A. 异步 RLHF：更快、更高效的语言模型离策略强化学习，2024 年 10 月。URL http://arxiv.org/abs/2410.18252。 R. 和 Dou, Z. Webthinker：通过深入的研究能力增强大型推理模型。 arXiv 预印本 arXiv:2504.21776, 2025a。李正，关X，张本，黄生，周红，赖，

开放人工智能。深度研究系统卡，2025。URL https://openai.com/index/deep-research-system-card/。访问时间：2025 年 10 月 21 日。 S.，严明，江Y.，谢平，黄F.，等。 Web-weaver：利用动态结构构建网络规模的证据

11

<!-- page 12 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Prabhakar, A., Ram, R., Chen, Z., Savarese, S., Wang, F.,

Wei, J., Karina, N., Chung, H. W., Jiao, Y. J., Papay, S.,

Xiong, C., Wang, H., and Yao, W. Enterprise deep re- search: Steerable multi-agent deep research for enterprise analytics. arXiv preprint arXiv:2510.17797, 2025.

Glaese, A., Schulman, J., and Fedus, W. Measuring short- form factuality in large language models. arXiv preprint arXiv:2411.04368, 2024.

Wei, J., Sun, Z., Papay, S., McKinney, S., Han, J., Fulford,

Rezaei, M., Vacareanu, R., Wang, Z., Wang, C., He, Y., and

Aky¨urek, A. F. Online rubrics elicitation from pairwise comparisons. arXiv preprint arXiv:2510.07284, 2025.

Shao, R., Li, S. S., Xin, R., Geng, S., Wang, Y., Oh, S.,

I., Chung, H. W., Passos, A. T., Fedus, W., and Glaese, A. Browsecomp: A simple yet challenging benchmark for browsing agents. arXiv preprint arXiv:2504.12516, 2025.

Wu, J., Yin, W., Jiang, Y., Wang, Z., Xi, Z., Fang, R.,

Du, S. S., Lambert, N., Min, S., Krishna, R., et al. Spu- rious rewards: Rethinking training signals in rlvr. arXiv preprint arXiv:2506.10947, 2025.

Zhang, L., He, Y., Zhou, D., Xie, P., et al. Webwalker: Benchmarking llms in web traversal. arXiv preprint arXiv:2501.07572, 2025a.

Shao, Z., Wang, P., Zhu, Q., Xu, R., Song, J., Bi, X., Zhang,

Wu, M., Zhang, G., Min, S., Levine, S., and Kumar, A. Rlac:

H., Zhang, M., Li, Y., Wu, Y., et al. Deepseekmath: Push- ing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

Reinforcement learning with adversarial critic for free- form generation tasks. arXiv preprint arXiv:2511.01758, 2025b.

Sharma, M., Zhang, C. B. C., Bandi, C., Wang, C., Aich,

Xu, F., Song, Y., Iyyer, M., and Choi, E. A critical eval-

A., Nghiem, H., Rabbani, T., Htet, Y., Jang, B., Basu, S., et al. Researchrubrics: A benchmark of prompts and rubrics for evaluating deep research agents. arXiv preprint arXiv:2511.07685, 2025.

Shi, D., Cao, J., Chen, Q., Sun, W., Li, W., Lu, H., Dong, F.,

Qin, T., Zhu, K., Liu, M., et al. Taskcraft: Automated gen- eration of agentic tasks. arXiv preprint arXiv:2506.10055, 2025.

uation of evaluations for long-form question answer- ing. In Rogers, A., Boyd-Graber, J., and Okazaki, N. (eds.), Proceedings of the 61st Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 3225–3245, Toronto, Canada, July 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.acl-long.181. URL https: //aclanthology.org/2023.acl-long.181/.

Singh, A., Chang, J. C., Haddad, D., Naik, A., Hwang,

Yang, A., Li, A., Yang, B., Zhang, B., Hui, B., Zheng, B.,

Yu, B., Gao, C., Huang, C., Lv, C., et al. Qwen3 technical

report. arXiv preprint arXiv:2505.09388, 2025.

Yang, Z., Qi, P., Zhang, S., Bengio, Y., Cohen, W.,

J. D., Kinney, R., Weld, D. S., Downey, D., and Feld- man, S. Ai2 scholar QA: Organized literature synthesis with attribution. In Mishra, P., Muresan, S., and Yu, T. (eds.), Proceedings of the 63rd Annual Meeting of the As- sociation for Computational Linguistics (Volume 3: Sys- tem Demonstrations), pp. 513–523, Vienna, Austria, July 2025. Association for Computational Linguistics. ISBN 979-8-89176-253-4. doi: 10.18653/v1/2025.acl-demo.49. URL https://aclanthology.org/2025.acl- demo.49/.

Team, T. D., Li, B., Zhang, B., Zhang, D., Huang, F., Li, G.,

Salakhutdinov, R., and Manning, C. D. HotpotQA: A dataset for diverse, explainable multi-hop question an- swering. In Riloff, E., Chiang, D., Hockenmaier, J., and Tsujii, J. (eds.), Proceedings of the 2018 Confer- ence on Empirical Methods in Natural Language Pro- cessing, pp. 2369–2380, Brussels, Belgium, October- November 2018. Association for Computational Lin- guistics. doi: 10.18653/v1/D18-1259. URL https: //aclanthology.org/D18-1259/.

Yifei, L. S., Chang, A., Malaviya, C., and Yatskar, M. Re-

Chen, G., Yin, H., Wu, J., Zhou, J., et al. Tongyi deepre- search technical report. arXiv preprint arXiv:2510.24701, 2025.

Viswanathan, V., Sun, Y., Ma, S., Kong, X., Cao, M., Neu-

searchqa: Evaluating scholarly question answering at scale across 75 fields with survey-mined questions and rubrics. arXiv preprint arXiv:2509.00496, 2025.

Yu, Q., Zhang, Z., Zhu, R., Yuan, Y., Zuo, X., Yue, Y.,

big, G., and Wu, T. Checklists are better than reward models for aligning language models. arXiv preprint arXiv:2507.18624, 2025.

Wadhwa, M., Sprague, Z., Malaviya, C., Laban, P., Li,

J. J., and Durrett, G. Evalagent: Discovering im- plicit evaluation criteria from the web. arXiv preprint arXiv:2504.15219, 2025.

Dai, W., Fan, T., Liu, G., Liu, L., Liu, X., Lin, H., Lin, Z., Ma, B., Sheng, G., Tong, Y., Zhang, C., Zhang, M., Zhang, W., Zhu, H., Zhu, J., Chen, J., Chen, J., Wang, C., Yu, H., Song, Y., Wei, X., Zhou, H., Liu, J., Ma, W.- Y., Zhang, Y.-Q., Yan, L., Qiao, M., Wu, Y., and Wang,

12

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

普拉巴卡尔，A.，拉姆，R.，陈，Z.，萨瓦雷斯，S.，王，F.，

魏，J.，卡琳娜，N.，钟H.W.，焦Y.J.，帕佩，S.，

Xiong, C., Wang, H., 和 Yao, W. 企业深度研究：用于企业分析的可引导多代理深度研究。 arXiv 预印本 arXiv:2510.17797, 2025。Glaese, A.、Schulman, J. 和 Fedus, W. 在大型语言模型中测量简短事实性。 arXiv 预印本 arXiv:2411.04368, 2024。Wei, J.、Sun, Z.、Papay, S.、McKinney, S.、Han, J.、Fulford,

Rezaei, M.、Vacareanu, R.、Wang, Z.、Wang, C.、He, Y. 和

Akyurek，A. F. 从成对比较中得出在线评价。 arXiv 预印本 arXiv:2510.07284, 2025。 邵 R.、李 S. S.、辛 R.、耿 S.、王 Y.、Oh S.、

I.、Chung, H. W.、Passos, A. T.、Fedus, W. 和 Glaese, A. Browsecomp：浏览代理的简单但具有挑战性的基准。 arXiv 预印本 arXiv:2504.12516, 2025。 吴静，尹文，蒋勇，王志，习志，方瑞，

Du, S.S.、Lambert, N.、Min, S.、Krishna, R. 等。虚假奖励：重新思考 rlvr 中的训练信号。 arXiv 预印本 arXiv:2506.10947, 2025。Zhang, L., He, Y., Zhou, D., Xie, P., et al. Webwalker：网络遍历中的 llms 基准测试。 arXiv 预印本 arXiv:2501.07572, 2025a。邵志、王平、朱启、徐荣、宋杰、毕新、张、

Wu, M.、Zhang, G.、Min, S.、Levine, S. 和 Kumar, A. Rlac：

H.，张明，李Y.，吴Y.，等。 Deepseekmath：突破开放语言模型中数学推理的极限。 arXiv 预印本 arXiv:2402.03300, 2024。针对自由形式生成任务的对抗性批评家的强化学习。 arXiv 预印本 arXiv:2511.01758, 2025b。 Sharma, M., 张, C. B. C., Bandi, C., Wang, C., Aich,

Xu, F.、Song, Y.、Iyyer, M. 和 Choi, E. 批判性评估

A.、Nghiem, H.、Rabbani, T.、Htet, Y.、Jang, B.、Basu, S. 等。研究细则：用于评估深度研究代理的提示和细则基准。 arXiv 预印本 arXiv:2511.07685, 2025. 施德., 曹杰., 陈强., 孙文., 李文., 卢浩., 董芳.,

秦T.，朱K.，刘M.，等。 Taskcraft：自动生成代理任务。 arXiv 预印本 arXiv:2506.10055, 2025。长篇问答的评估。收录于 Rogers, A.、Boyd-Graber, J. 和 Okazaki, N.（编辑），计算语言学协会第 61 届年会论文集（第一卷：长论文），第 3225-3245 页，加拿大多伦多，2023 年 7 月。计算语言学协会。 doi：10.18653/v1/2023.acl-long.181。网址 https://aclanthology.org/2023.acl-long.181/。辛格，A.，张，J.C.，哈达德，D.，奈克，A.，黄，

杨A.、李A.、杨B.、张B.、惠B.、郑B.、

余本，高成，黄成，吕成，等。 Qwen3技术

报告。 arXiv 预印本 arXiv:2505.09388, 2025。Yang, Z.、Qi, P.、Zhang, S.、Bengio, Y.、Cohen, W.,

J. D.、Kinney, R.、Weld, D. S.、Downey, D. 和 Feldman, S. Ai2 学者 QA：有组织的文献综合与归属。载于 Mishra, P.、Muresan, S. 和 Yu, T.（编辑），计算语言学协会第 63 届年会论文集（第 3 卷：系统演示），第 513-523 页，奥地利维也纳，2025 年 7 月。计算语言学协会。 ISBN 979-8-89176-253-4。 doi：10.18653/v1/2025.acl-demo.49。网址 https://aclanthology.org/2025.acl-demo.49/。 T.D.团队，李B.，张B.，张D.，黄F.，李G.，

Salakhutdinov, R. 和 Manning, C. D. HotpotQA：用于多样化、可解释的多跳问答的数据集。 Riloff, E.、Chiang, D.、Hockenmaier, J. 和 Tsujii, J.（编辑），2018 年自然语言处理经验方法会议论文集，第 2369-2380 页，比利时布鲁塞尔，2018 年 10 月至 11 月。计算语言学协会。 doi：10.18653/v1/D18-1259。网址 https://aclanthology.org/D18-1259/。 Yifei, L.S.、Chang, A.、Malaviya, C. 和 Yatskar, M. Re-

陈G.，尹H.，吴J.，周J.，等。
同益深研技术报告。 arXiv 预印本 arXiv:2510.24701, 2025。Viswanathan, V.、Sun, Y.、Ma, S.、Kong, X.、Cao, M.、Neu-

searchqa：通过调查挖掘的问题和评价标准大规模评估 75 个领域的学术问答。 arXiv 预印本 arXiv:2509.00496, 2025。于 Q.、张 Z.、朱 R.、袁 Y.、左 X.、岳 Y.、

big, G. 和 Wu, T. 在调整语言模型方面，清单比奖励模型更好。 arXiv 预印本 arXiv:2507.18624, 2025。Wadhwa, M.、Sprague, Z.、Malaviya, C.、Laban, P.、Li,

J. J. 和 Durrett, G. Evalagent：从网络中发现隐式评估标准。 arXiv 预印本 arXiv:2504.15219, 2025。戴 W.、范 T.、刘 G.、刘 L.、刘 X.、林 H.、林 Z.、马 B.、盛 G.、童 Y.、张 C.、张 M.、张 W.、朱 H.、朱 J.、陈 J.、陈 J.、王, C.、于 H.、宋 Y.、魏 X.、周 H.、刘 J.、马 W.-Y.、张 Y.-Q.、颜 L.、乔 M.、吴 Y. 和王，

12

<!-- page 13 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

M. Dapo: An open-source llm reinforcement learning system at scale, 2025. URL https://arxiv.org/ abs/2503.14476.

Zeng, Z., Yu, J., Gao, T., Meng, Y., Goyal, T., and Chen, D.

Evaluating large language models at evaluating instruc- tion following. In International Conference on Learning Representations (ICLR), 2024.

Zeng, Z., Ivison, H., Wang, Y., Yuan, L., Li, S. S., Ye, Z., Li,

S., He, J., Zhou, R., Chen, T., Zhao, C., Tsvetkov, Y., Du, S. S., Jaques, N., Peng, H., Koh, P. W., and Hajishirzi, H. Rlve: Scaling up reinforcement learning for language models with adaptive verifiable environments. arXiv preprint 2511.07317, 2025.

13

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

M. Dapo：大规模开源 llm 强化学习系统，2025 年。URL https://arxiv.org/abs/2503.14476。

曾Z.、于J.、高T.、孟Y.、戈亚尔T.和陈D.

在评估指令遵循时评估大型语言模型。国际学习表征会议 (ICLR)，2024 年。

曾Z.，Ivison，H.，王Y.，袁L.，李S.S.，叶Z.，李，

S.、He, J.、Zhou, R.、Chen, T.、Zhao, C.、Tsvetkov, Y.、Du, S. S.、Jaques, N.、Peng, H.、Koh, P. W. 和 Hajishirzi, H. Rlve：在具有自适应可验证环境的语言模型中扩展强化学习。 arXiv 预印本 2511.07317, 2025。

13

<!-- page 14 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Appendix

Author Contributions

DR Tulu is a team effort. Below we list each author’s primary contributing roles in the project, with bolded authors taking the lead within each role.

• Project leads: Rulin Shao, Akari Asai. • Core contributors: Rulin Shao, Akari Asai, Shannon Shen, Hamish Ivison, Varsha Kishore, Jingming Zhuo. • RLER method development: Rulin Shao, Hamish Ivison, Shannon Shen. • DR Tulu data: Akari Asai, Rulin Shao, Jingming Zhuo, Varsha Kishore, Shannon Shen, Luca Soldaini. • DR Tulu training: Hamish Ivison, Rulin Shao, Akari Asai, Shannon Shen. • Infrastructure: Shannon Shen, Hamish Ivison, Rulin Shao, Luca Soldaini, Tyler Murray, Varsha Kishore. • Evaluations and baselines: Varsha Kishore, Shannon Shen, Rulin Shao, Akari Asai, Jingming Zhuo, Hamish Ivison, Xinran Zhao. • GeneticDiseasesQA benchmark: Molly Park, Samuel Finlayson. • Project mentorship: Hannaneh Hajishirzi, Pang Wei Koh, Yoon Kim, Luke Zettlemoyer, Sherry Tongshuang Wu, Scott Yih, David Sontag, Faeze Brahman, Luca Soldaini, Pradeep Dasigi, Sewon Min.

Core contributors made sustained, significant contributions throughout the project. All authors contributed to project discussions, experiment planning, and writing the paper.

A. Discussion and Future Work

In this section, we highlight key insights, challenges, and promising directions for future work.

Evolving rubrics adapt the verifier based on the policy model’s capabilities. At each training step, we update our rubrics by contrasting the model’s current rollouts, which helps the new rubric criteria better distinguish those outputs. We can view this as making the training difficulty adaptive to the model’s evolving behavior. This approach aligns with the idea of training in adaptive environments, which has been previously explored by adjusting prompts during training (Zeng et al., 2025). In contrast, we adapt the environment by updating the verifier (rubrics). Future work may consider jointly adapting both prompts and rubric criteria to further improve training efficiency.

πθ3 πθ4

6 7

8

5

πθ1

πθ2

πθ0

r Closed-book Rubrics

4

Initial Search-based Rubrics r

2

r Evolving Search-based Rubrics

3

A new dimension of scaling verifier compute: provid- ing more privileged information to the judge. An- other perspective on RLER is that it creates a new way to scale the compute used by the verifier. While prior work focuses on increasing the reasoning tokens used by the reward model, often grounded in limited context (Guo et al., 2025; Chen et al., 2025b), we instead focus on enriching the information available to the verifier. This “privileged information” can include, but is not limited

1

Parametric knowledge

Augmented Searched knowledge

Explored knowledge during training by policy πθ

Figure 7. Knowledge coverage relationship visualization. An

abstract visualization of the knowledge coverage relationship between closed-book rubrics, initial search-based rubrics, and evolving search- based rubrics.

to: (1) contrastive model responses that help the verifier better understand the policy model’s capabilities; (2) ex- ternal knowledge searches to validate factual accuracy; (3) detailed process information showing the step-by-step reasoning behind the policy’s final answer. While scaling up this information often increases context length and compute costs, it can extend the verifier’s capabilities far beyond what infinite reasoning tokens alone can achieve, leading to more informed and meaningful decisions under a fixed compute budget.

Evolving rubrics can also be interpreted from the perspective of increasing knowledge coverage. Figure 7 shows an abstract visualization of the knowledge coverage of different rubric types. Search expands the knowledge covered by

14

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

附录

作者贡献

DR Tulu 是团队努力的成果。下面我们列出了每位作者在该项目中的主要贡献角色，粗体作者在每个角色中起带头作用。

• 项目负责人：邵儒林、浅井明里。 • 核心贡献者：Rulin Shao、Akari Asai、Shannon Shen、Hamish Ivison、Varsha Kishore、Jingming Zhuo。 • RLER 方法开发：Rulin Shao、Hamish Ivison、Shannon Shen。 • DR Tulu 数据：Akari Asai、Rulin Shao、Jingming Zhuo、Varsha Kishore、Shannon Shen、Luca Soldaini。 • DR Tulu 培训：Hamish Ivison、Rulin Shao、Akari Asai、Shannon Shen。 • 基础设施：Shannon Shen、Hamish Ivison、Rulin Shao、Luca Soldaini、Tyler Murray、Varsha Kishore。 • 评估和基线：Varsha Kishore、Shannon Shen、Rulin Shao、Akari Asai、Jingming Zhuo、Hamish Ivison、Xinran Zhao。 • GeneticDiseasesQA 基准：Molly Park、Samuel Finlayson。 • 项目指导：Hannaneh Hajishirzi、Pang Wei Koh、Yoon Kim、Luke Zettlemoyer、Sherry Tongshuang Wu、Scott Yih、David Sontag、Faeze Brahman、Luca Soldaini、Pradeep Dasigi、Sewon Min。

核心贡献者在整个项目中做出了持续、重大的贡献。所有作者都对项目讨论、实验计划和论文写作做出了贡献。

A. 讨论和未来的工作

在本节中，我们将重点介绍关键见解、挑战和未来工作的有希望的方向。

不断发展的规则根据策略模型的功能来调整验证者。在每个训练步骤中，我们都会通过对比模型当前的推出来更新我们的评分标准，这有助于新的评分标准更好地区分这些输出。我们可以将其视为使训练难度适应模型不断变化的行为。这种方法与自适应环境中的训练理念相一致，之前已经通过在训练期间调整提示来探索过这种想法（Zeng et al., 2025）。相反，我们通过更新验证者（标题）来适应环境。未来的工作可能会考虑联合调整提示和标题标准，以进一步提高培训效率。

πθ3 πθ4

6 7

8

5

πθ1

πθ2

πθ0

r 闭卷量规

4

基于初始搜索的量规 r

2

r 不断发展的基于搜索的量规

3

扩展验证者计算的新维度：向法官提供更多特权信息。关于 RLER 的另一个观点是，它创建了一种新的方法来扩展验证者使用的计算。虽然之前的工作重点是增加奖励模型使用的推理标记，通常基于有限的上下文（Guo et al., 2025; Chen et al., 2025b），但我们反而专注于丰富验证者可用的信息。该“特权信息”可以包括但不限于

1

参数知识

增强搜索知识

通过策略 πθ 训练期间探索知识

图 7.知识覆盖关系可视化。安

闭卷量规、基于初始搜索的量规和不断发展的基于搜索的量规之间知识覆盖关系的抽象可视化。

为了：（1）对比模型响应，帮助验证者更好地理解策略模型的功能； (2) 外部知识搜索以验证事实准确性； (3) 详细的流程信息，显示政策最终答案背后的逐步推理。虽然扩大这些信息通常会增加上下文长度和计算成本，但它可以扩展验证者的能力，远远超出无限推理令牌本身所能实现的范围，从而在固定的计算预算下做出更明智、更有意义的决策。

不断演变的评价标准也可以从增加知识覆盖面的角度来解释。图 7 显示了不同标题类型的知识覆盖范围的抽象可视化。搜索扩展了所涵盖的知识

14

<!-- page 15 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

the rubrics beyond the parametric knowledge of the rubric generator (an LM). Furthermore, evolving rubrics generated during training fold in new evidence discovered by the deep research policy during training rollouts, capturing knowledge that requires complex reasoning and planning to obtain, and allowing the evaluation criteria to evolve with the model’s distribution.

The train-test mismatch challenge. When developing DR Tulu, we found that models that achieved the highest training reward did not necessarily achieve the highest downstream evaluation performance, although within the same run, higher training rewards usually correlated with better downstream performance; see Appendix I.8 for more details. We conjecture that this stems from a mismatch between the tasks, rubrics, and evaluation setups of the external benchmarks vs. what we used for training. For instance, RL training uses a judge that differs from the judges used in downstream evaluations, which can lead to reward hacking toward preferences specific to the training-time judge. Moreover, external benchmarks often use expert-crafted or generated rubrics that may emphasize aspects not captured in our training rubrics. Some rubrics may not be clear from the question alone, making it challenging for models not trained on specific benchmarks. This underscores the value of fully open DR models like DR Tulu, which can be easily customized for downstream tasks.

Adaptation to specialized domains. Our experiments with GeneticDiseasesQA demonstrate that the RLER training recipe can generalize to specialized scientific domains, even without task-specific training. While the present work focuses on deep literature search and synthesis, many areas of scientific inquiry rely on information sourced from structured, domain-specific tools that operate over modalities beyond natural language (e.g., genomic sequences, molecular structures, transcriptomics, etc.). Incorporating these specialized data sources into training—or, better yet, training the model to flexibly use previously unseen tools just in time—would be a natural next step that permits the extension of DR Tulu to more complex scientific workflows.

B. Related Work

In this section, we provide an extended discussion of related work.

Deep research agents. Inspired by scaling online RL on verifiable domains such as code and math, many methods follow a similar recipe: Search-R1 (Jin et al., 2025) applies GRPO to enhance search capabilities and is trained primarily on short-form QA, with followups including WebExplorer (Liu et al., 2025) and Tongyi Deep Research (Team et al., 2025). In contrast, WebThinker (Li et al., 2025a) employs DPO and proposes a report-generation workflow. Nevertheless, most of these works still train and evaluate only short-form outputs. Moreover, open deep research systems typically rely on a single web search tool or train separate models per backend (Gao et al., 2025); the latest Tongyi Deep Research additionally includes the Google Scholar API (Team et al., 2025). In expert domains (e.g., healthcare, science), we find that combining multiple search tools yields substantial gains. Existing open systems also often omit explicit citations, unlike proprietary counterparts, and many do not fully release training data or code, limiting analysis and improvement. A complementary line of work builds deep research agents by designing fixed long-form pipelines, often on top of proprietary LMs, including WebWeaver (Li et al., 2025b), SFT-Enterprise Deep Research (Prabhakar et al., 2025), and Ai2 ScholarQA (Singh et al., 2025). These systems mitigate some limitations and are evaluated primarily on long-form tasks, but fixed pipelines reduce flexibility in inference flow and output style (e.g., always producing long reports even for simple factoid questions) and do not provide a clear path toward open, end-to-end trainable deep research models. To our knowledge (summarized in Appendix Table 5), our model is the first fully open deep research framework that (i) is trained and rigorously evaluated on realistic long-form tasks, (ii) natively supports multi-tool search rather than single-tool or siloed models, and (iii) produces citations with fully open code and data.

Rubric design for long-form generation tasks. Prior work uses human-written rubrics for evaluation (Arora et al., 2025; Asai et al., 2024), but it is costly and not scalable when applied for training. RaR (Gunjal et al., 2025) proposed to use rubrics as rewards and generate instance-wise rubrics based on reference answers from an advanced model (OpenAI o3). However, these rubrics are static and usually generated by the same model, which can only slow down reward hacking but does not resolve the issue. In addition, these approaches rely on the capabilities of the model used to generate reference answers, whose knowledge is limited and not up to date, and thus cannot meet the needs of DR tasks. Our evolving rubrics are generated based on retrieved knowledge, echoing EvalAgent (Wadhwa et al., 2025), which uses search to construct better evaluation criteria for benchmarks. Concurrent works (Rezaei et al., 2025; Jayalath et al., 2025) explore generating online rubrics by contrasting pairwise or multiple model rollouts in a closed-book setting. This approach echoes the design

15

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

超出了标题生成器（LM）的参数知识的标题。此外，训练期间生成的不断发展的规则会纳入训练推出期间深入研究政策发现的新证据，捕获需要复杂推理和规划才能获得的知识，并允许评估标准随着模型的分布而发展。训练-测试不匹配挑战。在开发DR Tulu时，我们发现获得最高训练奖励的模型并不一定获得最高的下游评估性能，尽管在同一次运行中，更高的训练奖励通常与更好的下游性能相关；详细信息请参见附录 I.8。我们推测，这是由于外部基准的任务、评分标准和评估设置与我们用于训练的内容之间的不匹配所致。例如，强化学习训练使用的法官与下游评估中使用的法官不同，这可能会导致奖励黑客针对训练时法官的特定偏好。此外，外部基准通常使用专家制作或生成的评估标准，这些评估标准可能会强调我们的培训评估标准中未涵盖的方面。仅从问题中来看，某些标题可能并不明确，这使得未在特定基准上训练的模型面临挑战。这凸显了 DR Tulu 等完全开放的灾难恢复模型的价值，可以轻松针对下游任务进行定制。适应专业领域。我们对 GeneticDiseasesQA 的实验表明，即使没有针对特定任务的训练，RLER 训练方法也可以推广到专门的科学领域。虽然目前的工作侧重于深度文献搜索和综合，但许多科学探究领域都依赖于来自结构化、特定领域工具的信息，这些工具在自然语言之外的模式（例如基因组序列、分子结构、转录组学等）上运行。将这些专门的数据源纳入训练中，或者更好的是，训练模型以及时灵活地使用以前未见过的工具，将是自然而然的下一步，可以将 DR Tulu 扩展到更复杂的科学工作流程。 B. 相关工作

在本节中，我们对相关工作进行了扩展讨论。深研代理。受到在代码和数学等可验证领域上扩展在线 RL 的启发，许多方法都遵循类似的方法：Search-R1（Jin 等人，2025）应用 GRPO 来增强搜索能力，并主要在简短的 QA 上进行训练，后续包括 WebExplorer（Liu 等人，2025）和 Tongyi Deep Research（Team 等人，2025）。相比之下，WebThinker（Li et al., 2025a）采用 DPO 并提出了报告生成工作流程。尽管如此，大多数这些工作仍然只训练和评估简短的输出。此外，开放式深度研究系统通常依赖于单个网络搜索工具或为每个后端训练单独的模型（Gao 等人，2025）；最新的统一深度研究还包括 Google Scholar API（Team et al., 2025）。在专家领域（例如医疗保健、科学），我们发现结合多种搜索工具可以带来巨大的收益。与专有系统不同，现有的开放系统也经常省略明确的引用，并且许多系统没有完全发布训练数据或代码，从而限制了分析和改进。互补的工作线通过设计固定的长形式管道来构建深度研究代理，通常在专有的 LM 之上，包括 WebWeaver (Li et al., 2025b)、SFT-Enterprise Deep Research (Prabhakar et al., 2025) 和 Ai2 ScholarQA (Singh et al., 2025)。
这些系统缓解了一些限制，主要针对长格式任务进行评估，但固定管道降低了推理流和输出风格的灵活性（例如，即使对于简单的事实问题，也总是生成长报告），并且没有提供通向开放、端到端可训练深度研究模型的清晰路径。据我们所知（附录表 5 中总结），我们的模型是第一个完全开放的深度研究框架，它 (i) 经过实际的长格式任务的训练和严格评估，(ii) 本身支持多工具搜索而不是单一工具或孤立的模型，(iii) 使用完全开放的代码和数据生成引用。用于长格式生成任务的标题设计。先前的工作使用人类编写的评估标准（Arora 等人，2025；Asai 等人，2024），但在应用于培训时成本高昂且不可扩展。 RaR（Gunjal 等人，2025）建议使用评分标准作为奖励，并根据高级模型 (OpenAI o3) 的参考答案生成实例评分评分标准。然而，这些规则是静态的，通常由同一模型生成，这只能减缓奖励黑客行为，但不能解决问题。此外，这些方法依赖于用于生成参考答案的模型的能力，其知识有限且不是最新的，因此无法满足灾难恢复任务的需求。我们不断发展的评价标准是根据检索到的知识生成的，与 EvalAgent（Wadhwa 等人，2025）相呼应，它使用搜索来构建更好的基准评估标准。并行工作（Rezaei 等人，2025；Jayalat 等人，2025）探索通过在闭门环境中对比成对或多模型推出来生成在线评分标准。这种做法与设计相呼应

15

<!-- page 16 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Model Size Long-form Multi-Search Citations Open-Source Train. Code Eval Code Train. Data Model Ckpt

Search-R1 7B ✗ ✗ ✗ ✓ ✓ ✓ ✓ WebThinker 32B ✓∗ ✗ ✗ ✗ ✓ ✗ ✓ WebExplorer 8B ✗ ✗ ✗ ✗ ✓ ✗ ✓ ASearcher 7,14,32B ✗ ✗ ✗ ✓ ✓ ✓ ✓ SFR DR 8B ✗ ✗ ✗ ✗ ✗ ✗ ✗ Tongyi DR 30B ✗ ✓ ✗ ✗ ✓ ✗ ✓ Ai2 ScholarQA – ✓ ✗ ✓ – ✓ – – WebWeaver – ✓ ✓ ✗ – ✓ – – SFR EDR – ✓ ✓ ✗ – ✓ – – DR Tulu 8B ✓ ✓ ✓ ✓ ✓ ✓ ✓ Table 5. Comparison with existing deep research systems. We compare our method with existing open deep research models, namely

Search-R1 (Jin et al., 2025), WebThinker (Li et al., 2025a), WebExplorer (Liu et al., 2025), SFR-DeepResearch (SFR-DR; Nguyen et al. 2025), Tongyi Deep Research (Tongyi DR; Team et al. 2025), Ai2 ScholarQA (Singh et al., 2025), SFT-Enterprise Deep Research (SFR-EDR; Prabhakar et al. 2025) and WebWeaver (Li et al., 2025b). ∗indicates tested on long-form evaluation benchmarks using a specifically designed long-form report agent workflow. Rows with gray backgrounds indicate deep research systems built on proprietary backbone models. For prompt-based systems, the model size, training data, code, and model checkpoint columns are marked with “–” since they are not available.

principle of our evolving rubrics but lacks grounding in external knowledge, which leads to exploitation (reshaping model behavior based solely on its internal knowledge) rather than exploration (integrating new external knowledge while also exploiting existing knowledge). Another concurrent work, RLAC (Wu et al., 2025b), explores training a critic to propose a likely incorrect fact that serves a similar role to a rubric for factuality tasks. Compared with concurrent works, our approach focuses on a more challenging setup—DR tasks—and generates rubrics that both co-evolve with the policy model and remain grounded in external knowledge, enabling prolonged RL training with an evolving verifier.

Table 5 summarizes these gaps in existing open deep research agents.

C. Problem Formulation for Deep Research

Formally, let T = {T1, T2, . . .} denote the available tools. Each tool Tk takes a query q with optional argument string α and returns an observation o = Tk(q; α). The model’s policy πθ (with parameters θ) operates autoregressively over a sequence of text s , initialized as s0 = x (the task and system instructions). Concretely, we define the model’s action space as { think , tool , answer , cite }, with corresponding protocol tokens:

• think (<think></think>) uses the LM itself to plan next steps given the current state and information.

• tool (<call tool></call tool>) invokes one of multiple search-related tools. The specific tool is chosen by setting the name attribute and tool-specific arguments. Example: <call tool name="google search" k="10" lang="en">query</call tool>. We append the tool’s output, in plain text, to the context for subsequent steps.

• answer (<answer></answer>) produces the final response and stops.

• cite (<cite id="SOURCE ID"></cite>) is used within the answer to wrap claims in citation tags that point to the supporting source. Ideally, these citations should be as localized as possible (e.g., to a snippet within a webpage vs. the entire webpage).

At each step i, the model samples an action and its content or arguments, (ai, ζi) ∼πθ(· | si), where ai specifies the action type: ai = think for generating reasoning text; ai = tool for calling the corresponding tool Tk with query (qi, αi); ai = answer for producing the final answer; and ai = cite for wrapping claims in citations within the final answer. If ai ∈{ think , answer , cite }, the output ζi is appended to the context, forming si+1 = si ⊕⟨ai, ζi⟩. If ai = tool , the model executes the tool call, receives oi = Tk(qi; αi), and updates the state as si+1 = si ⊕⟨ai, ζi, oi⟩. The process continues until aτ = answer , where ζτ contains the final answer.

16

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

模型大小长格式多重搜索引文开源火车。代码评估代码火车。数据模型控制点

Search-R1 7B ✗ ✗ ✗ ✓ ✓ ✓ ✓ WebThinker 32B ✓* ✗ ✗ ✗ ✓ ✗ ✓ WebExplorer 8B ✗ ✗ ✗ ✗ ✓ ✗ ✓ ASearcher 7,14,32B ✗ ✗ ✗ ✓ ✓ ✓ ✓ SFR DR 8B ✗ ✗ ✗ ✗ ✗ ✗ ✗ 统一 DR 30B ✗ ✓ ✗ ✗ ✓ ✗ ✓ Ai2 ScholarQA – ✓ ✗ ✓ – ✓ – – WebWeaver – ✓ ✓ ✗ – ✓ – – SFR EDR – ✓ ✓ ✗ – ✓ – – DR Tulu 8B ✓ ✓ ✓ ✓ ✓ ✓ ✓ 表 5. 与现有深度研究系统的比较。我们将我们的方法与现有的开放深度研究模型进行比较，即

Search-R1（Jin 等人，2025）、WebThinker（Li 等人，2025a）、WebExplorer（Liu 等人，2025）、SFR-DeepResearch（SFR-DR；Nguyen 等人，2025）、Tongyi Deep Research（Tongyi DR；Team 等人，2025）、Ai2 ScholarQA（Singh 等人） al., 2025)、SFT-Enterprise Deep Research (SFR-EDR; Prabhakar et al., 2025) 和 WebWeaver (Li et al., 2025b)。 *表示使用专门设计的长式报告代理工作流程在长式评估基准上进行测试。灰色背景的行表示基于专有骨干模型构建的深度研究系统。对于基于提示的系统，模型大小、训练数据、代码和模型检查点列标记为“-”，因为它们不可用。

我们不断发展的规则的原则，但缺乏外部知识的基础，这导致剥削（仅基于其内部知识重塑模型行为）而不是探索（整合新的外部知识，同时也利用现有知识）。另一项同时进行的工作，RLAC（Wu et al., 2025b），探索训练批评家提出一个可能不正确的事实，该事实与事实性任务的标题具有类似的作用。与并发工作相比，我们的方法侧重于更具挑战性的设置（DR 任务），并生成既与策略模型共同演化又以外部知识为基础的规则，从而能够通过不断发展的验证器进行长时间的 RL 训练。

表 5 总结了现有开放深度研究机构的这些差距。

C. 深入研究的问题表述

形式上，令 T = {T1, T2, . 。 .} 表示可用的工具。每个工具 Tk 接受带有可选参数字符串 α 的查询 q 并返回观察值 o = Tk(q; α)。该模型的策略 πθ（带有参数 θ）对文本序列 s 进行自回归运算，初始化为 s0 = x（任务和系统指令）。具体来说，我们将模型的动作空间定义为 { think , tool , answer , cite } ，以及相应的协议标记：

• think (<think></think>) 使用LM 本身根据当前状态和信息来规划后续步骤。

• 工具（<call tool></call tool>）调用多个与搜索相关的工具之一。通过设置名称属性和特定于工具的参数来选择特定工具。示例：<call tool name="google search" k="10" lang="en">查询</call tool>。我们将工具的输出以纯文本形式附加到后续步骤的上下文中。

• 答案(<answer></answer>) 产生最终响应并停止。

• cite (<cite id="SOURCE ID"></cite>) 用于在答案中将声明包含在指向支持来源的引文标签中。理想情况下，这些引用应尽可能本地化（例如，网页内的片段与整个网页）。

在每一步 i，模型对一个动作及其内容或参数进行采样，(ai, ζi) ∼πθ(· | si)，其中 ai 指定动作类型：ai = think forgeneric text; ai = 用于通过查询(qi, αi)调用相应工具Tk的工具； ai = 用于产生最终答案的答案； ai = cite 将声明包含在最终答案的引文中。如果 ai ∈{ think , answer , cite }，则输出 zei 附加到上下文中，形成 si+1 = si ⊕⟨ai, zei⟩。如果 ai = tool ，则模型执行工具调用，接收 oi = Tk(qi; αi)，并将状态更新为 si+1 = si ⊕⟨ai, ζi, oi⟩。该过程一直持续到 aτ = 答案，其中 zτ 包含最终答案。

16

<!-- page 17 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Figure 8. Overview of training a deep research model with reinforcement learning with evolving rubrics (RLER). Left: An example

of a question and a long-form response from DR Tulu with citations. Right: We train the policy model on a dynamic set of rubrics that (1) co-evolve with the policy update (details in Figure 2) and (2) are grounded on real-world, searched knowledge from the environment. Compared to commonly used closed-book rubrics generated purely from LM parametric knowledge (blue circle), our evolving rubrics incorporate newly searched information and are continuously tailored to the current policy model’s behaviors, better capturing the nuances required for long-form DR tasks.

D. Reinforcement Learning with Evolving Rubrics

D.1. Overview and Pseudocode for RLER

We show an overview of training a deep research model with RLER in Figure 8 and provide a pseudocode showing the RLER training process in Algorithm 1.

D.2. How Do Evolving Rubrics Work?

In this section, we further validate our initial search-based and evolving rubrics. We show that they demonstrate desirable properties, such as being specific and adaptive, enabling the verification criteria to more closely approximate the performance of an ideal rubric set compared to naive rubric generation methods.

Baseline rubrics. Existing work instantiates the rubric set Rx in two main ways. The first approach is to use general rubrics, where an LM is prompted to score the response using a single general rubric shared across all instances (Liu et al., 2023b; Li et al., 2024; 2025a). However, several works have shown that this approach suffers from reward hacking, where the model exploits biases in the judge rather than learning meaningful behaviors (Gunjal et al., 2025; Zeng et al., 2024). The second approach is to use an LM to generate question-specific rubrics, and then a (potentially separate) LM to perform checklist-style evaluations based on those rubrics (Gunjal et al., 2025; Viswanathan et al., 2025). We refer to these rubrics as closed-book rubrics since they are generated by a closed-book LM; these are therefore constrained by the generating model’s parametric knowledge and might not cover the necessary knowledge to assess DR outputs. In both cases, the rubrics are static: they do not adapt as the policy explores new evidence or behaviors.

17

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

图 8. 使用进化评估准则 (RLER) 强化学习训练深度研究模型的概述。左：一个例子

图鲁博士的问题和长篇回复并附有引文。右图：我们根据一组动态的规则来训练政策模型，这些规则 (1) 与政策更新共同演化（详细信息见图 2），(2) 基于现实世界中从环境中搜索到的知识。与纯粹从 LM 参数知识（蓝色圆圈）生成的常用闭卷评分标准相比，我们不断发展的评分标准包含了新搜索的信息，并不断根据当前政策模型的行为进行定制，更好地捕捉长期灾难恢复任务所需的细微差别。

D. 不断演变的强化学习

D.1. RLER 概述和伪代码

我们在图 8 中展示了使用 RLER 训练深度研究模型的概述，并提供了显示算法 1 中的 RLER 训练过程的伪代码。

D.2.不断发展的评分标准如何运作？

在本节中，我们进一步验证我们最初的基于搜索和不断发展的规则。我们表明，它们表现出了理想的特性，例如特定性和适应性，使验证标准与朴素的评估标准生成方法相比能够更接近理想评估标准集的性能。

基线细则。现有工作以两种主要方式实例化标题集 Rx。第一种方法是使用通用评分标准，其中提示 LM 使用所有实例共享的单个通用评分标准对响应进行评分（Liu 等人，2023b；Li 等人，2024；2025a）。然而，一些研究表明，这种方法受到奖励黑客攻击，即模型利用了法官的偏见，而不是学习有意义的行为（Gunjal 等人，2025；Zeng 等人，2024）。第二种方法是使用 LM 生成特定于问题的评分标准，然后使用（可能独立的）LM 根据这些评分标准执行清单式评估（Gunjal 等人，2025 年；Viswanathan 等人，2025 年）。我们将这些准则称为闭卷准则，因为它们是由闭卷 LM 生成的；因此，这些受到生成模型参数知识的限制，并且可能不涵盖评估 DR 输出所需的知识。在这两种情况下，规则都是静态的：它们不会随着政策探索新的证据或行为而调整。

17 号

<!-- page 18 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Algorithm 1 Reinforcement Learning with Evolving Rubrics (RLER)

Require: Dataset D, policy πθ, rollout size G, max active rubrics Kmax, rubric generator Grubric



1: for each prompt x ∈D do 2: Generate Rpersist

x, SEARCH(x)

x ←Grubric

▷Generate initial search-based rubrics 3: Ractive

x ∪Ractive

x ←∅ 4: end for 5: for each training step t = 1, . . . , T do 6: Rx ←Rpersist

x 7: Rollout with search {yi}G

i=1 ∼πθ(·|x) 8: Generate Rnew

x ←Grubric(x, {yi}G

i=1, Rx); ▷Generate evolving rubrics by contrasting rollouts 9: Ractive

x ←Rnew

x ∪Ractive

x ; 10: Compute rewards with Rpersist

x ∪Ractive

x and update πθ (GRPO) 11: Compute std of the rewards per rubric 12: For Ractive

x , remove rubrics with 0 std; keep top-Kmax with highest std ▷Manage rubric buffer 13: end for

Uses Search Assertive Claims

Rubric Type Frac. Factuality

General Rubrics ✗ 0 /

Closed-book Rubrics ✗ 0.22 0.94

Initial Rubrics ✓ 0.56 0.97

Evolving Rubrics ✓ 0.52 1.00

Table 6. The fraction of assertive and factual rubrics.

Figure 9. Effect of negative evolving rubrics. Over-training, nega-

Both the initial search-based rubrics as well as the evolving rubrics (which continue to use search, as they are generated based on the full rollouts, including search traces) have a higher proportion of assertive claims compared to closed- book or general rubrics.

tive evolving rubrics emerge that penalize undesirable behavior such as responding in Python (right), resulting in a reduction in undesirable behaviors over the course of training compared to using a static closed- book rubric that does not specify such undesirable behavior (left).

Search-based and evolving rubrics make verification criteria more concrete and factual. Table 6 compares the specificity of four rubric types. We define a rubric as assertive if it is specific and concrete about what the response should contain (e.g., “The response should mention benchmarks A and B”), and descriptive otherwise (e.g., “The response should discuss benchmarks.”). Descriptive rubrics are easier to generate since they do not require factual knowledge, but they often fail to assess response quality accurately, as a model may score well by superficially mentioning a point or even hallucinating facts. We measure the fraction of assertive rubrics and factuality using an LM, with experimental details provided in Appendix E. As shown in Table 6, general rubrics lack specific evaluation criteria, and instance-wise rubrics generated by a closed-book LM are relatively vague (only 22% are assertive). In contrast, initial search-based rubrics and evolving search-based rubrics are more concrete, with over 50% of claims being assertive. These advantages come from search-based rubrics being grounded in retrieved information, and from evolving rubrics being generated using search context, which makes them better suited for training.

Evolving rubrics adjust the evaluation criteria as the policy model evolves. Static rubrics can fail to capture unexpected behaviors or insights emerging during training. As an illustration, we conducted RL training on a single question, “Write a survey paper about RAG.” (details in Appendix E). Unexpectedly, some rollouts contained Python code (e.g., Figure 14 in Appendix E), an artifact of the Qwen model that was also previously reported by Shao et al. (2025); this is undesirable but hard for an initial rubric to anticipate. In contrast, evolving rubrics identify these issues and provide negative feedback about irrelevant code, leading to fewer code-containing responses during training (Figure 9).

D.3. Evolving Rubric Generation Prompt

We show the instruction we used for evolving rubric generation in Figure 10 and Figure 11.

18

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

算法 1 不断演化的强化学习 (RLER)

要求：数据集 D、策略 πθ、部署大小 G、最大活跃量规 Kmax、量规生成器 Grubric



1: 对于每个提示 x ∈D 执行 2: 生成 Rpersist

x，搜索(x)

x ←格鲁布里克

▷生成基于搜索的初始评分标准 3：Ractive

x ∪活性

x ←∅ 4：结束 5：对于每个训练步骤 t = 1，. 。 。 , T 做 6: Rx ←R 坚持

x 7：通过搜索 {yi}G 推出

i=1 ∼πθ(·|x) 8: 生成 Rnew

x ←Grubric(x, {yi}G

i=1，Rx)； ▷通过对比推出来生成不断发展的评价标准 9：Ractive

x ←R新

x ∪活性

x ; 10：使用 Rpersist 计算奖励

x ∪活性

x 并更新 πθ (GRPO) 11：计算每个标题的奖励标准 12：对于 Ractive

x ，删除标准为 0 的评分细则；保持 top-Kmax 具有最高标准 ▷管理 rubric 缓冲区 13：结束

使用搜索断言声明

评分细则类型分数。事实性

一般评分标准 ✗ 0 /

闭卷评分标准 ✗ 0.22 0.94

初始评分标准 ✓ 0.56 0.97

不断发展的评分标准 ✓ 0.52 1.00

表 6. 自信和事实性评分标准的比例。

图 9. 负面演变的评价标准的影响。过度训练，消极

与闭卷或一般的评估标准相比，最初的基于搜索的评估标准以及不断发展的评估标准（继续使用搜索，因为它们是基于完整的部署而生成的，包括搜索跟踪）都具有更高比例的断言主张。

出现了一些不断发展的规则，用于惩罚不良行为，例如用 Python 进行响应（右），与使用未指定此类不良行为的静态闭卷规则（左）相比，可以减少训练过程中的不良行为。

基于搜索和不断发展的规则使验证标准更加具体和真实。表 6 比较了四种评分标准类型的特异性。如果一个标题对于响应应包含的内容具体且具体（例如，“响应应提及基准 A 和 B”），则我们将其定义为断言性的，否则为描述性的（例如，“响应应讨论基准。”）。描述性评价标准更容易生成，因为它们不需要事实知识，但它们通常无法准确评估响应质量，因为模型可能通过肤浅地提及一个观点甚至幻觉事实来获得良好的分数。我们使用 LM 来衡量自信的评分标准和事实性的比例，实验细节在附录 E 中提供。如表 6 所示，一般评分标准缺乏具体的评估标准，并且闭卷 LM 生成的实例评分相对模糊（只有 22% 是自信的）。相比之下，最初的基于搜索的评分标准和不断发展的基于搜索的评分标准更加具体，超过 50% 的声明是自信的。这些优势来自于基于检索信息的基于搜索的评分标准，以及使用搜索上下文生成的不断发展的评分标准，这使得它们更适合训练。

随着政策模型的发展，不断变化的评价标准也会调整评估标准。静态评分标准可能无法捕捉培训期间出现的意外行为或见解。作为说明，我们针对一个问题“写一篇关于 RAG 的调查论文”进行了 RL 训练。 （详情见附录 E）。出乎意料的是，一些发布包含 Python 代码（例如附录 E 中的图 14），这是 Shao 等人之前报告过的 Qwen 模型的工件。 （2025）；这是不可取的，但对于最初的标题来说很难预见。相比之下，不断发展的规则可以识别这些问题，并提供有关不相关代码的负面反馈，从而导致训练期间包含代码的响应减少（图 9）。

D.3。不断演变的标题生成提示

我们在图 10 和图 11 中展示了用于演化标题生成的指令。

18

<!-- page 19 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Evolving Rubric Generation Prompt (Part 1)

You are an expert evaluator generating adaptive rubrics to assess model responses.

## Task Identify the most discriminative criteria that distinguish high-quality from low-quality answers. Capture subtle quality differences that existing rubrics miss.

## Output Components - **Description**: Detailed, specific description of what makes a response excellent/problematic - **Title**: Concise abstract label (general, not question-specific)

## Categories 1. **Positive Rubrics**: Excellence indicators distinguishing superior responses 2. **Negative Rubrics**: Critical flaws definitively degrading quality

## Core Guidelines

### 1. Discriminative Power - Focus ONLY on criteria meaningfully separating quality levels - Each rubric must distinguish between otherwise similar responses - Exclude generic criteria applying equally to all responses

### 2. Novelty & Non-Redundancy With existing/ground truth rubrics: - Never duplicate overlapping rubrics in meaning/scope - Identify uncovered quality dimensions - Add granular criteria if existing ones are broad - Return empty lists if existing rubrics are comprehensive

### 3. Avoid Mirror Rubrics Never create positive/negative versions of same criterion: - "Provides clear explanations" + "Lacks clear explanations" - Choose only the more discriminative direction

### 4. Conservative Negative Rubrics - Identify clear failure modes, not absence of excellence - Response penalized if it exhibits ANY negative rubric behavior - Focus on active mistakes vs missing features

## Selection Strategy

### Quantity: 1-5 total rubrics (fewer high-quality > many generic)

### Distribution Based on Response Patterns: - **More positive**: Responses lack sophistication but avoid major errors - **More negative**: Systematic failure patterns present - **Balanced**: Both excellence gaps and failure modes exist - **Empty lists**: Existing rubrics already comprehensive

## Analysis Process 1. Group responses by quality level 2. Find factors separating higher/lower clusters 3. Check if factors covered by existing rubrics 4. Select criteria with highest discriminative value

Figure 10. System prompt for generating evolving rubrics. Note that this is the first-half of the prompt and the second-half is in Figure 11

19

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

不断演变的评分标准生成提示（第 1 部分）

您是一位专家评估员，生成自适应评分标准来评估模型响应。

## 任务 确定区分高质量和低质量答案的最具区别性的标准。捕捉现有标准所忽略的细微质量差异。

## 输出组件 - **描述**：对响应优秀/有问题的详细、具体描述 - **标题**：简洁的抽象标签（一般性的，不是针对特定问题的）

## 类别 1. **正面评分**：区分卓越响应的卓越指标 2. **负面评分**：明显降低质量的关键缺陷

## 核心准则

### 1. 区分力 - 仅关注有意义地区分质量水平的标准 - 每个标题必须区分其他相似的回答 - 排除同样适用于所有回答的通用标准

### 2. 新颖性和非冗余性 对于现有/基本事实量规： - 切勿在含义/范围上重复重叠的量规 - 识别未覆盖的质量维度 - 如果现有标准很宽泛，则添加细化标准 - 如果现有量规很全面，则返回空列表

### 3. 避免镜像规则 切勿创建相同标准的正面/负面版本： - “提供明确的解释” + “缺乏明确的解释” - 仅选择更具歧视性的方向

### 4. 保守的负面评价标准 - 识别明确的失败模式，而不是缺乏卓越 - 如果响应表现出任何负面评价行为，则会受到惩罚 - 关注主动错误与缺失功能

## 选择策略

### 数量：总共 1-5 个量规（高质量的较少 > 通用的较多）

### 基于响应模式的分布： - **更积极**：响应缺乏复杂性，但避免重大错误 - **更消极**：存在系统性失败模式 - **平衡**：卓越差距和失败模式都存在 - **空列表**：现有评价标准已经全面

## 分析过程 1. 按质量水平对响应进行分组 2. 查找区分较高/较低聚类的因素 3. 检查现有评分标准是否涵盖因素 4. 选择具有最高区分值的标准

图 10. 生成不断演变的评分标准的系统提示。请注意，这是提示的前半部分，后半部分如图 11 所示

19

<!-- page 20 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Evolving Rubric Generation Prompt (Part 2)

## Output Format ```json {

"question": "<original question verbatim>", "positive_rubrics": [

{"description": "<detailed excellence description>", "title": "<abstract label>"} ], "negative_rubrics": [

{"description": "<detailed failure description>", "title": "<abstract label>"} ] } ```

## Examples

**Positive:** ```json {"description": "Anticipates and addresses potential edge cases or exceptions to the main solution, demonstrating thorough problem understanding", "title": "Edge Case Handling"} ```

**Negative:** ```json {"description": "Conflates correlation with causation when interpreting data or making recommendations", "title": "Causal Misattribution"} ```

## Inputs 1. **Question**: Original question being answered 2. **Responses**: Multiple model responses (Response 1, Response 2, etc.) 3. **Existing Rubrics** (optional): Previously generated/ground truth rubrics

## Critical Reminders - Each rubric must distinguish between actual provided responses - Exclude rubrics applying equally to all responses - Prefer empty lists over redundancy when existing rubrics are comprehensive - Focus on observable, objective, actionable criteria - Quality over quantity: 2 excellent rubrics > 5 mediocre ones

Generate only the most impactful, non-redundant rubrics revealing meaningful quality differences.

Figure 11. Continuation of the system prompt for generating evolving rubrics. See Figure 10 for the initial section of the prompt.

20

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

不断发展的Rubric生成提示（第2部分）

## 输出格式 ```json {

"question": "<原始问题逐字>", "positive_rubrics": [

{"description": "<详细卓越描述>", "title": "<抽象标签>"} ], "negative_rubrics": [

{"description": "<详细故障描述>", "title": "<抽象标签>"} ] } ```

## 示例

**积极：** ```json {"description": "预测并解决主要解决方案的潜在边缘情况或异常，展示对问题的彻底理解", "title": "边缘情况处理"} ```

**否定：** ```json {"description": "在解释数据或提出建议时将相关性与因果关系混为一谈", "title": "因果误归因"} ```

## 输入 1. **问题**：正在回答的原始问题 2. **响应**：多个模型响应（响应 1、响应 2 等） 3. **现有评分标准**（可选）：之前生成的/真实评分标准

## 重要提醒 - 每个评分标准必须区分实际提供的回答 - 排除同样适用于所有回答的评分标准 - 当现有评分标准全面时，更喜欢空列表而不是冗余 - 关注可观察的、客观的、可操作的标准 - 质量胜于数量：2 个优秀评分标准 > 5 个平庸评分标准

仅生成最具影响力、非冗余的评价标准，揭示有意义的质量差异。

图 11. 系统继续提示生成不断演变的评分标准。有关提示的初始部分，请参见图 10。

20

<!-- page 21 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Rubric Judge Prompt

You will be given a question someone asked (in <question></question> tags) and the corresponding response (in <response></response> tags) given to them by an assistant. You will then be given a specific criterion of the response to evaluate (in <criterion></criterion> tags). Return a score on a scale of 0 to 2 indicating how appropriate the response is based on the given criterion. Judge only the specified aspect(s), not any other qualities of the answer. Output JSON in the format: {{"score": x}}.

<question>{question}</question> <response>{response}</response> <criterion>{rubric}</criterion>

Figure 12. System prompt for rubric reward computation.

D.4. Rubric Reward Judge Prompt

We show the rubric-judge prompt in Figure 12. Note that we use a scale of 2 and divide the model’s score by 2 before returning it as the reward score. We omitted this detail from the main paper for simplicity. We leave exploring different scoring scales to future work.

D.5. Citation, Search, and Format Rewards

In this section, we detail the implementations of citation, search, and format rewards that are used as auxiliary rewards in RLER. We refer to the code for detailed implementations and prompts.

D.5.1. CITATION REWARD DESIGN

Citation Reward Given a query x ∈D and a response y ∼πθ(·|x), we evaluate citations with respect to a citation store S = {(i, si)} mapping citation IDs i to snippets si. We first extract a set of claims from y,

C = {c1, . . . , c|C|} = ExtractClaims(y),

with an associated (possibly empty) set of cited IDs for each claim,

I(c) ⊆{ i }, c ∈C.

Citation-format reward. We reward valid citations by the fraction that resolve in S:

c∈C I(c) ∩keys(S)

S

c I(c)

 

S

> 0,

c∈C I(c)

Rfmt =

S

,

0, otherwise.



Per-claim recall and precision. For each claim c, we define the concatenated evidence

i∈I(c) si,

E(c) = L

and obtain two LLM-judge signals:

Recall. If I(c)̸ = ∅, the judge rates support of c by E(c) as Fully = 1, Partially = 0.5, No = 0. Denote this by r(c) ∈{1, 0.5, 0}. If I(c) = ∅, we ask whether c needs a citation given (x, y). Let NeedCite(c) ∈{0, 1}. Then

r(c) = 1 −NeedCite(c).

Precision. If I(c)̸ = ∅, the judge checks whether E(c) is relevant to c: Relevant = 1, Irrelevant = 0. Denote this by p(c) ∈{1, 0}. If I(c) = ∅, we set p(c) = 1.

21

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

评分标准 法官提示

您将收到某人提出的问题（在 <question></question> 标签中）以及助理向他们提供的相应响应（在 <response></response> 标签中）。然后，您将获得要评估的响应的具体标准（在 <criterion></criterion> 标签中）。返回 0 到 2 范围内的分数，指示响应基于给定标准的适当程度。仅判断答案的指定方面，而不判断任何其他质量。输出 JSON 格式为：{{"score": x}}。

<问题>{问题}</问题> <响应>{响应}</响应> <标准>{标题}</标准>

图 12. 规则奖励计算的系统提示。

D.4。评分标准奖励法官提示

我们在图 12 中显示了 rubric-judge 提示。请注意，我们使用 2 的比例并将模型的分数除以 2，然后将其作为奖励分数返回。为了简单起见，我们从主论文中省略了这个细节。我们将探索不同的评分标准留到未来的工作中。

D.5。引文、搜索和格式奖励

在本节中，我们详细介绍了 RLER 中用作辅助奖励的引用、搜索和格式奖励的实现。详细的实现和提示我们参考代码。

D.5.1。嘉奖奖励设计

引文奖励给定查询 x ∈D 和响应 y ∼πθ(·|x)，我们评估相对于引文存储 S = {(i, si)} 将引文 ID i 映射到片段 si 的引文。我们首先从 y 中提取一组声明，

C = {c1, . 。 。 , c|C|} = ExtractClaims(y),

每个声明都有一组关联的（可能是空的）引用 ID，

I(c) ⊆{ i }, c ∈C。

引文格式的奖励。我们根据 S 中解析的分数来奖励有效引用：

c∈C I(c) ∩keys(S)

S

我(c)

 

S

> 0,

c∈C I(c)

Rfmt =

S

,

0，否则。



每个声明的召回率和精确度。对于每个声明 c，我们定义串联证据

i∈I(c) si,

E(c) = L

并获得两个LLM判断信号：

回忆一下。如果 I(c)̸ = ∅，则法官将 E(c) 对 c 的支持评级为完全 = 1、部分 = 0.5、否 = 0。用 r(c) ε{1, 0.5, 0} 表示。如果 I(c) = ∅，我们询问 c 是否需要给定 (x, y) 的引用。令 NeedCite(c) ∈{0, 1}。然后

r(c) = 1 −NeedCite(c)。

精确。如果 I(c)̸ = ∅，则判断者检查 E(c) 是否与 c 相关：相关 = 1，不相关 = 0。用 p(c) ∈{1, 0} 表示。如果 I(c) = ∅，我们设置 p(c) = 1。

21

<!-- page 22 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Per-claim F1.

2 r(c) p(c) r(c)+p(c), r(c) + p(c) > 0,

 

f(c) =

0, otherwise.



Average F1.

X

f(c).

F1 = 1 |C|

c∈C

Final reward. We combine faithfulness (via F1) and format validity (via Rfmt) with fixed weights:

rcit(x, y) = 0.6 F1 + 0.4 Rfmt, rcit(x, y) ∈[0, 1].

D.5.2. SEARCH REWARD DESIGN

To encourage the model to engage in multi-turn information gathering, we introduce a search reward that scores the number of search tool calls made during generation. Specifically, we extract all search queries issued by the model (identified by search protocol tokens in the generated text) and count the number of valid, non-empty queries. The reward is computed as the ratio of the number of searches performed to an upper bound (set to 3 in our experiments), capped at 1.0. This design incentivizes the model to conduct multiple searches to gather diverse information sources, while preventing unbounded reward accumulation.

D.5.3. FORMAT REWARD DESIGN

Beyond rubric-based and citation-specific rewards, we introduce lightweight auxiliary rewards that encourage structural correctness of responses with respect to the expected output schema.

Given a response y to a query x, we check for the presence of three components:

1. Answer format. Whether y encloses a final answer between <answer></answer> tags, producing a binary indicator a(y) ∈{0, 1}.

2. Citation format. Whether y contains at least one citation enclosed in <cite></cite> tags, producing c(y) ∈{0, 1}.

3. Query format. Whether y includes at least one valid search query enclosed in <query></query> tags (or parser-specific equivalents), producing q(y) ∈{0, 1}.

We then define a weighted format reward as

rfmt(x, y) = 0.5 a(y) + 0.3 c(y) + 0.2 q(y), rfmt(x, y) ∈[0, 1].

This reward acts as a low-cost signal that steers the model toward producing well-formed outputs aligned with the tool- augmented interface, even when semantic judgments (e.g., citation recall or rubric alignment) are unavailable.

E. RLER Analysis and Toy Case Study

In this section, we provide additional experimental details for the RLER analysis and toy case study discussed in Section D.2.

E.1. Rubric Specificity Analysis

To evaluate the specificity level of generated rubrics, we instruct an LM to first classify whether the rubric is assertive as defined in Section D.2 and, if it is assertive, whether it is factual. As this task requires the LM to have knowledge that is enough to check the factuality, we apply a search-based API model—GPT-4O-SEARCH-PREVIEW—which has access to OpenAI internal search tool, which is not as competitive as a Deep Research model but is helpful enough for simple fact check. We use the prompt presented in Figure 13 to obtain the assertive rubric fraction and factuality scores.

22

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

每个索赔 F1。

2 r(c) p(c) r(c)+p(c), r(c) + p(c) > 0,

 

f(c) =

0，否则。



平均F1。

X

f(c)。

F1 = 1 |C|

c∈C

最后的奖励。我们将忠实度（通过 F1）和格式有效性（通过 Rfmt）与固定权重结合起来：

rcit(x, y) = 0.6 F1 + 0.4 Rfmt, rcit(x, y) ∈[0, 1]。

D.5.2。搜索奖励设计

为了鼓励模型进行多轮信息收集，我们引入了搜索奖励，对生成期间进行的搜索工具调用次数进行评分。具体来说，我们提取模型发出的所有搜索查询（由生成的文本中的搜索协议标记标识）并计算有效的非空查询的数量。奖励的计算方式为执行的搜索次数与上限（在我们的实验中设置为 3）的比率，上限为 1.0。这种设计激励模型进行多次搜索以收集不同的信息源，同时防止无限制的奖励积累。

D.5.3。形式奖励设计

除了基于标题和特定引文的奖励之外，我们还引入了轻量级辅助奖励，鼓励响应相对于预期输出模式的结构正确性。

给定查询 x 的响应 y，我们检查是否存在三个组件：

1.答案格式。 y 是否将最终答案括在 <answer></answer> 标记之间，从而生成二进制指示符 a(y) ∈{0, 1}。

2. 引文格式。 y 是否包含至少一个包含在 <cite></cite> 标签中的引用，产生 c(y) ∈{0, 1}。

3.查询格式。 y 是否包含至少一个包含在 <query></query> 标记（或特定于解析器的等效项）中的有效搜索查询，生成 q(y) ∈{0, 1}。

然后我们将加权格式奖励定义为

rfmt(x, y) = 0.5 a(y) + 0.3 c(y) + 0.2 q(y)，rfmt(x, y) ∈[0, 1]。

这种奖励充当低成本信号，引导模型产生与工具增强界面一致的格式良好的输出，即使语义判断（例如，引文回忆或标题对齐）不可用。

E. RLER 分析和玩具案例研究

在本节中，我们为 D.2 节中讨论的 RLER 分析和玩具案例研究提供更多实验细节。

E.1。评分标准特异性分析

为了评估生成的评分标准的特异性水平，我们指示 LM 首先对评分标准是否如 D.2 节中定义的断言进行分类，如果是断言，则它是否是事实。由于这项任务要求 LM 拥有足以检查事实性的知识，因此我们应用了基于搜索的 API 模型——GPT-4O-SEARCH-PREVIEW——它可以访问 OpenAI 内部搜索工具，该工具不像 Deep Research 模型那样具有竞争力，但对于简单的事实检查来说足够有帮助。我们使用图 13 中显示的提示来获取自信评分标准分数和事实性分数。

22

<!-- page 23 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Prompt for Assertive Fraction and Factuality Analysis

You are a careful evaluator who determines whether each criterion contains a factual claim, and if so, whether that claim is factually correct and verifiable.

Instructions: 1. Read the question and the list of criteria carefully. 2. For each criterion, decide first whether it *makes a factual claim* | that is, whether it asserts something that can be verified as true or false in the real world.

**Distinguishing referential vs. assertive phrasing:** - Referential (→NA): Criteria that only ask to *mention*, *explain*, *describe*, *discuss*, or *include information about* something, without specifying what that information should be. These refer to factual topics but do not assert any particular fact.

- Example: 'Explain the principle of masked diffusion models.' →NA (requests explanation, not asserting the content). - Example: 'Mention information about A.' →NA. - Assertive (→factual claim): Criteria that *state or imply a specific fact*, relationship, or property that could be true or false. They assert content, not just reference it.

- Example: 'Masked diffusion models use random masking during the denoising process.' →factual claim. - Example: 'A is located in B.' →factual claim. 3. If the criterion is about writing style, tone, clarity, structure, or formatting, or if it only requires mentioning or explaining topics without specifying factual assertions, return 'NA'. 4. For each factual claim, check whether it can be verified using reliable evidence or reasoning.

- If evidence confirms it →factual and correct. - If reliable evidence contradicts it →factual but incorrect. - If no verifiable evidence is found (e.g., no data, no known sources) →factual but *unverified*. 5. Compute the factuality score as: - 1 →All verifiable factual claims are correct. - Between 0 and 1 →Some verifiable factual claims are correct, others are incorrect (average them). - 0 →All verifiable factual claims are incorrect. - 'NA' →None of the criteria makes any factual claims. 6. Do *not* lower the score for claims that are unverified (i.e., lacking evidence) unless there is evidence showing they are *false*. 7. Also count how many criteria are assertive but unverified.

Output Format: Return your result strictly in JSON format as follows: {{"factual_score": <float_or_"NA">, "explanation": "<short explanation>", "num_non_na_criteria": <number>, "num_na_criteria": <number>, "num_unverified_assertive_criteria": <number>}}

Now evaluate the following: Question: {question} Criteria: {criteria}

Figure 13. System prompt for accessing the assertive fraction and factuality for rubrics.

23

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

提示断言分数和事实性分析

您是一位细心的评估者，确定每个标准是否包含事实主张，如果包含，则该主张是否事实上正确且可验证。

说明： 1. 仔细阅读问题和标准列表。 2. 对于每个标准，首先决定它是否*提出事实主张* |也就是说，它是否断言某些在现实世界中可以被验证为真或假的东西。

**区分引用性与断言性措辞：** - 引用性（→NA）：仅要求*提及*、*解释*、*描述*、*讨论*或*包含有关*某事的信息的标准，而不指定该信息应该是什么。这些涉及事实主题，但不断言任何特定事实。

- 示例：“解释掩蔽扩散模型的原理。” →NA（要求解释，而不是断言内容）。 - 示例：“提及有关 A 的信息。” →不适用。 - 断言（→事实主张）：*陈述或暗示特定事实*、关系或属性（可能是真或假）的标准。他们主张内容，而不仅仅是引用它。

- 示例：“掩蔽扩散模型在去噪过程中使用随机掩蔽。” →事实主张。 - 示例：“A 位于 B。” →事实主张。 3. 如果标准涉及写作风格、语气、清晰度、结构或格式，或者仅要求提及或解释主题而不指定事实断言，则返回“NA”。 4. 对于每一个事实主张，检查是否可以使用可靠的证据或推理进行验证。

- 如果证据证实→事实且正确。 - 如果可靠的证据与之相矛盾→事实但不正确。 - 如果没有找到可验证的证据（例如，没有数据，没有已知来源）→事实但*未经验证*。 5. 将事实分数计算为： - 1 →所有可验证的事实主张都是正确的。 - 0 到 1 之间→一些可验证的事实主张是正确的，其他的是不正确的（平均）。 - 0 →所有可验证的事实主张都是不正确的。 - 'NA' →所有标准均未提出任何事实主张。 6. 不要*降低未经验证（即缺乏证据）的说法的分数，除非有证据表明这些说法是“错误的”。 7. 还要计算有多少标准是肯定的但未经验证的。

输出格式：严格以 JSON 格式返回结果，如下所示： {{"factual_score": <float_or_"NA">, "explanation": "<shortterpretation>", "num_non_na_criteria": <number>, "num_na_criteria": <number>, "num_unverified_assertive_criteria": <number>}}

现在评估以下内容： 问题：{question} 标准：{criteria}

图 13. 访问评分标准的自信分数和事实性的系统提示。

23

<!-- page 24 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

E.2. Toy Case Study on Evolving Rubrics

To study the impact of an evolving rubric in RL runs over more training epochs, we perform a toy case study in a closed-book LM setup (where the policy model is not instructed to use tools and must answer on its own). Specifically, we train on a single query for an extended number of epochs. The query asks “Write a comprehensive survey paper about retrieval-augmented generation (RAG) and the latest progress in the field, e.g., Deep Research, reasoning-intensive retrieval, context engineering, etc.”. We train from Qwen3-8B using the same set of hyper-parameters as our main RL training as described in Appendix G.2. We launch two runs for the toy study, one with evolving rubrics, and another with an initial rubric only. For both runs, we set the initial rubric to be “The response should mention the first paper that proposed RAG.” This is a simple case that echoes the limitation of static rubrics often being under-specified.

In Figure 14, we show one example output from the policy model that exhibits undesirable code reasoning behavior in our toy case training.

F. Data Creation Details

F.1. SFT Data Construction

F.1.1. PROMPT CURATION

Long-form prompt curation. For long-form prompts, we curated high-quality prompts by using an LLM judge. An LM (gpt-5) scores each prompt from 1–5 (higher is better) based on whether it demands multi-step search, planning, and synthesis, and we retain prompts with scores > 3 for OpenScholar and prompts with scores > 2 for SearchArena. Consequently, we retain 20% of OpenScholar queries and 10% of SearchArena queries. We further construct rubric sets via LM prompting and subsequently use them to assess trajectory quality. Figure 15 presents the system prompt used to select queries.

Short-form prompt curation. For short-form, we derive initial questions from widely open-sourced data, including MegaScience (Fan et al., 2025), HotpotQA (Yang et al., 2018), TaskCraft (Shi et al., 2025), WebWalkerSilver (Wu et al., 2025a), PopQA (Mallen et al., 2022), and TyDi QA (Clark et al., 2020). We also used GPT-4.1 to generate 916 BrowseComp (Wei et al., 2025) style questions.

F.1.2. TRAJECTORY GENERATION

Given the set of initial prompts, we generate high-quality trajectories data using three different teacher models. Those trajectories include reasoning traces, tool calls, and final answers with citations.

Trajectory generation with GPT-5. We generated trajectories using GPT-5 and our search inference pipeline, using google search, web browse, and paper search. Figure 16 shows the exact prompt that was used. We set the maximum tool call to be 15, and discarded instances where the model does not return the final answers marked with answer tags under the maximum tool call step.

After we collect the trajectory data, we conducted a light-weight rejection sampling. Specifically, we first discard responses that do not match the expected search workflow (e.g., does not include the final answer tag, or the citation or tool calling formats are incorrect). Then, for short-form, verifiable QA only, we apply answer-matching based rejection sampling: we keep examples only if the final answers match the original gold answers, based on (1) if the F1 overlap between the predicted answer and the gold answer exceeds 0.9, or (2) if an LLM judge deems the two answers are semantically identical. Figures 32–35 show examples of generated trajectories.

We also use GPT-5 with google search and web browse to generate a few hundred interleaved search and think trajectories for BrowseComp-style questions.

Trajectory generations using Ai2 ScholarQA. We used the trajectory data from Ai2 ScholarQA to create SFT data. Ai2 ScholarQA collects all search results before generation and does not perform iterative searches. To create synthetic data with iterative searches, we transformed the data provided in the Ai2 ScholarQA traces. Each trace consists of retrieved results, CoT planning steps, and an answer with citations. We used GPT-4.1 to create a sub-query for each section in the Ai2 ScholarQA. The sub-query was generated conditioned on the section text and retrieved papers cited in the section. We

24

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

E.2。不断演变的评分标准的玩具案例研究

为了研究 RL 中不断演变的标题对更多训练周期的影响，我们在闭卷 LM 设置中进行了一个玩具案例研究（其中策略模型没有被指示使用工具，必须自行回答）。具体来说，我们对单个查询进行扩展次数的训练。该查询要求“撰写一篇关于检索增强生成（RAG）以及该领域最新进展的综合调查论文，例如深度研究、推理密集型检索、上下文工程等”。我们使用与主要 RL 训练相同的一组超参数从 Qwen3-8B 进行训练，如附录 G.2 中所述。我们启动了两次玩具研究，一次具有不断发展的评估标准，另一次仅具有初始评估标准。对于这两次运行，我们将初始标题设置为“响应应提及提出 RAG 的第一篇论文”。这是一个简单的案例，反映了静态标准经常被低估的局限性。

在图 14 中，我们展示了策略模型的一个示例输出，该模型在我们的玩具案例训练中表现出不良的代码推理行为。

F. 数据创建细节

F.1。 SFT数据构建

F.1.1。及时策划

长篇即时策展。对于长格式的提示，我们通过法学硕士法官策划了高质量的提示。 LM (gpt-5) 根据是否需要多步骤搜索、规划和综合对每个提示进行从 1 到 5 的评分（越高越好），并且我们为 OpenScholar 保留分数 > 3 的提示，为 SearchArena 保留分数 > 2 的提示。因此，我们保留了 20% 的 OpenScholar 查询和 10% 的 SearchArena 查询。我们通过 LM 提示进一步构建标题集，然后使用它们来评估轨迹质量。图 15 显示了用于选择查询的系统提示。

简短的即时策展。对于简短形式，我们从广泛的开源数据中得出初始问题，包括 MegaScience (Fan et al., 2025)、HotpotQA (Yang et al., 2018)、TaskCraft (Shi et al., 2025)、WebWalkerSilver (Wu et al., 2025a)、PopQA (Mallen et al., 2022) 和 TyDi QA (Clark et al., 2025)等，2020）。我们还使用 GPT-4.1 生成 916 个 BrowseComp（Wei 等人，2025）风格的问题。

F.1.2。轨迹生成

给定一组初始提示，我们使用三种不同的教师模型生成高质量的轨迹数据。这些轨迹包括推理轨迹、工具调用以及带有引用的最终答案。

使用 GPT-5 生成轨迹。我们使用 GPT-5 和我们的搜索推理管道、谷歌搜索、网页浏览和论文搜索生成轨迹。图 16 显示了所使用的确切提示。我们将最大工具调用设置为 15，并丢弃模型未返回在最大工具调用步骤下标有答案标签的最终答案的实例。

收集轨迹数据后，我们进行了轻量级拒绝采样。具体来说，我们首先丢弃与预期搜索工作流程不匹配的响应（例如，不包含最终答案标签，或者引文或工具调用格式不正确）。然后，仅对于简短的、可验证的 QA，我们应用基于答案匹配的拒绝抽样：仅当最终答案与原始黄金答案匹配时，我们才保留示例，基于 (1) 预测答案和黄金答案之间的 F1 重叠是否超过 0.9，或 (2) 如果 LLM 法官认为两个答案在语义上相同。图 32-35 显示了生成轨迹的示例。

我们还将 GPT-5 与谷歌搜索和网页浏览结合使用，为 BrowseComp 风格的问题生成数百个交错搜索和思考轨迹。

使用 Ai2 ScholarQA 生成轨迹。我们使用 Ai2 ScholarQA 的轨迹数据来创建 SFT 数据。 Ai2 ScholarQA 在生成之前收集所有搜索结果，并且不执行迭代搜索。为了通过迭代搜索创建合成数据，我们转换了 Ai2 ScholarQA 跟踪中提供的数据。每个跟踪都包含检索结果、CoT 规划步骤以及带有引用的答案。我们使用 GPT-4.1 为 Ai2 ScholarQA 中的每个部分创建一个子查询。子查询是根据章节文本生成的，并检索该章节中引用的论文。我们

24

<!-- page 25 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example of a Code Reasoning Response in the Toy Case Study

```python import pandas as pd from sklearn.feature_extraction.text import TfidfVectorizer from sklearn.metrics.pairwise import cosine_similarity ... [Some outputs are omitted due to space limit.]

# Load the survey data survey_data = pd.read_csv('survey_raw.csv')

# Remove duplicate entries survey_data.drop_duplicates(inplace=True)

# Clean the text data survey_data['response'] = survey_data['response'].str.replace('[ˆ\w\s]', '')

# Create a TF-IDF matrix vectorizer = TfidfVectorizer(stop_words='english') tfidf_matrix = vectorizer.fit_transform(survey_data['response'])

# Calculate the cosine similarity matrix cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Define a function to get the top 5 most similar responses def get_similar_responses(query, cosine_sim=cosine_sim, survey_data=survey_data, n=5):

# Get the index of the query query_index = survey_data[survey_data['question'] == query].index[0]

# Get the similarity scores similarity_scores = list(enumerate(cosine_sim[query_index]))

# Sort the similarity scores similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

# Get the top 5 most similar responses most_similar_responses = similarity_scores[1:n]

# Return the responses return [survey_data.iloc[i[0]]['response'] for i in most_similar_responses]

# Define a function to get the insights

... [Some outputs are omitted due to space limit.]

# Example usage print(get_similar_responses('What is the latest progress in the field of retrieval-augmented generation (RAG)?')) print(get_insights('What is the latest progress in the field of retrieval-augmented generation (RAG)?')) ``` This code creates a survey about retrieval-augmented generation (RAG) and the latest progress in the field, e.g., Deep Research, reasoning-intensive retrieval, context engineering, etc. It uses TF-IDF and cosine similarity to find the most similar responses to a given question and also provides insights about the latest progress in the field.

Figure 14. Example of Qwen3-8B’s code reasoning behavior in our toy case study.

25

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

玩具案例研究中的代码推理响应示例

```python import pandas as pd from sklearn.feature_extraction.text import TfidfVectorizer from sklearn.metrics.pairwise import cosine_similarity ... [由于空间限制，省略了一些输出。]

# 加载调查数据survey_data = pd.read_csv('survey_raw.csv')

# 删除重复条目survey_data.drop_duplicates(inplace=True)

# 清理文本数据 Survey_data['response'] = Survey_data['response'].str.replace('[ˆ\w\s]', '')

# 创建 TF-IDF 矩阵 vectorizer = TfidfVectorizer(stop_words='english') tfidf_matrix = vectorizer.fit_transform(survey_data['response'])

# 计算余弦相似度矩阵 cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# 定义一个函数来获取前 5 个最相似的响应 def get_similar_responses(query, cosine_sim=cosine_sim, Survey_data=survey_data, n=5):

# 获取查询的索引 query_index = Survey_data[survey_data['question'] == query].index[0]

# 获取相似度分数相似度_scores = list(enumerate(cosine_sim[query_index]))

# 对相似度分数进行排序相似性_分数=排序（相似性_分数，key = lambda x：x [1]，reverse = True）

# 获取前 5 个最相似的响应 most_similar_responses = approximation_scores[1:n]

# 返回响应 return [survey_data.iloc[i[0]]['response'] for i in most_similar_responses]

# 定义一个函数来获取洞察

... [由于篇幅限制，省略了一些输出。]

# 用法示例 print(get_similar_responses('检索增强生成 (RAG) 领域的最新进展是什么？')) print(get_insights('检索增强生成 (RAG) 领域的最新进展是什么？')) ``` 此代码创建一个关于检索增强生成 (RAG) 以及该领域最新进展的调查，例如深度研究、推理密集型检索、上下文它使用 TF-IDF 和余弦相似度来查找给定问题的最相似答案，并提供有关该领域最新进展的见解。

图 14.我们的玩具案例研究中 Qwen3-8B 的代码推理行为示例。

25

<!-- page 26 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Query Selection Prompt

You are a query-quality grader for Search-Augmented LLMs.

Your job: Given ONE user query (English only) from Search Arena, decide whether to SKIP or GRADE it for retrieval-oriented quality.

Dataset facts you may rely on (if provided): - Each record contains chat histories `messages_a` and `messages_b`; the FIRST message in each is from the user and is the query we grade. - Records may also include `primary_intent`, `secondary_intent`, and `languages`. - If `primary_intent` is `creative_generation` or `others`, SKIP. - If the query is not English, SKIP. (If fields are missing, infer from the query text.)

What counts as a high-quality search query? 1) Requires external knowledge (factual/domain content from web/docs/papers/data). 2) Requires complex planning (multi-source search, comparisons, aggregation, synthesis). 3) Often expects long-form responses. 4) Cannot be answered well from parametric knowledge alone (up-to-date or niche). 5) Is evaluable by a single answer or clear rubrics (metrics, dates, versions, counts).

Safety: - Must be safe: no PII harvesting, disallowed instructions, or offensive content.

Scoring (integers only): 1 = Trivial/chit-chat; no retrieval; not evaluable. 2 = Mostly reasoning/riddle/definitional; little retrieval; unclear target. 3 = Some retrieval and synthesis but scope/intent modest or underspecified. 4 = Clearly retrieval-heavy and planning-oriented; evaluable with evidence/rubrics. 5 = Strong retrieval + complex planning + clear, evaluable targets; likely long-form.

Few-shot demonstrations (for guidance only; DO NOT copy or echo these in outputs): - Query: who is ion vlad-doru -> Score: 3

Rationale: Factual knowledge and retrieval helps, but simple entity lookup; limited planning. - Query: hello -> Score: 1

Rationale: Chit-chat; no external knowledge or evaluable target. - Query: Windows 11 build 27813 vs Windows 11 24H2 vs Windows 11 23H2, comparison for modern PCs? -> Score: 3

Rationale: Requires searching and synthesis across versions/builds; intent mostly clear but scope (what counts as "modern PCs") needs clarification. - Query: I'm an even, single-digit number. Once you write me, I have no start or end. I look like a standing pair of glasses. Who am I? -> Score: 2

Rationale: Riddle; reasoning required but no external knowledge retrieval; not a search task. - Query: best running watch -> Score: 3

Rationale: Retrieval and synthesis likely; intent clear but underspecified; could be rubricized (features, price, ecosystem). - Query: what is SWE-Bench state of the art at the moment? -> Score: 4

Rationale: Up-to-date SOTA requires extensive retrieval (papers/leaderboards); evaluable by metrics; planning needed. - Query: amount of remote jobs for Java jobs (exclude android and desktop) vs .Net vs GoLang vs NodeJS in EU? Please note UK is not in EU -> Score: 5

Rationale: Complex planning with constraints, aggregation across sources/regions, and clearly evaluable counts/methodology.

Figure 15. System prompt for selecting high-quality prompts.

26

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

查询选择提示

您是搜索增强法学硕士的查询质量评分者。

您的工作：给定 Search Arena 中的一个用户查询（仅限英文），决定是跳过还是对其进行分级，以获得面向检索的质量。

您可能依赖的数据集事实（如果提供）： - 每条记录都包含聊天历史记录“messages_a”和“messages_b”；每个消息中的第一条消息来自用户，是我们评分的查询。 - 记录还可以包括“主要意图”、“次要意图”和“语言”。 - 如果“primary_intent”是“creative_ Generation”或“others”，则跳过。 - 如果查询不是英语，请跳过。 （如果字段缺失，请从查询文本中推断。）

什么才算是高质量的搜索查询？ 1）需要外部知识（来自网络/文档/论文/数据的事实/领域内容）。 2）需要复杂的规划（多源搜索、比较、聚合、综合）。 3）通常期望长篇回复。 4）仅凭参数知识（最新的或利基的）无法很好地回答。 5) 可通过单一答案或明确的标准（指标、日期、版本、计数）进行评估。

安全： - 必须安全：无 PII 收集、不允许的指令或攻击性内容。

评分（仅限整数）：1 = 琐碎/闲聊；没有检索；不可评价。 2 = 主要是推理/谜语/定义；很少检索；目标不明确。 3 = 一些检索和综合，但范围/意图适度或未明确。 4 = 明显以检索为主且以计划为导向；可通过证据/评估标准进行评估。 5=强大的检索+复杂的规划+清晰、可评估的目标；可能是长形式。

少量演示（仅供参考；请勿在输出中复制或回显这些内容）： - 查询：who is ion vlad-doru -> 得分：3

理由：事实知识和检索有帮助，但简单的实体查找；有限的规划。 - 查询：你好 -> 得分：1

理由：闲聊；没有外部知识或可评估的目标。 - 查询：Windows 11 build 27813 vs Windows 11 24H2 vs Windows 11 23H2，现代 PC 的比较？ -> 得分：3

理由：需要跨版本/构建进行搜索和综合；意图基本明确，但范围（什么算作“现代 PC”）需要澄清。 - 查询：我是一个偶数，一位数。一旦你给我写信，我就没有开始也没有结束。我看起来就像一副站立的眼镜。我是谁？ -> 得分：2

理由：谜语；需要推理，但不需要外部知识检索；不是搜索任务。 - 查询：最佳跑步手表 -> 得分：3

理由：可能检索和合成；意图明确但未明确说明；可以进行分类（功能、价格、生态系统）。 - 询问：SWE-Bench 目前的技术水平如何？ -> 得分：4

理由：最新的 SOTA 需要大量检索（论文/排行榜）；可通过指标进行评估；需要规划。 - 查询：欧盟 Java 作业（不包括 Android 和桌面）、.Net、GoLang、NodeJS 的远程作业数量？请注意英国不属于欧盟 -> 分数：5

理由：具有约束的复杂规划、跨来源/区域的聚合以及明确可评估的计数/方法。

图 15. 选择高质量提示的系统提示。

26

<!-- page 27 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Trajectory Generation Prompt

You are a research assistant who answers questions through iterative reasoning and evidence-backed search using multiple external search systems.

1. Operating Principles, Process & Guidelines 1.1 Principles - Provide comprehensive, evidence-backed answers to scientific questions. - Ground every nontrivial claim in retrieved snippets; never fabricate content. Cite using <cite id="...">...</cite> drawn only from returned snippets. - Prefer authoritative sources (peer-reviewed papers, reputable benchmarks/docs) and prioritize recent work for fast-moving areas. - Acknowledge uncertainty and conflicts; if evidence is thin or sources disagree, state it and explain what additional evidence would resolve it. - Structure with clear Markdown headers and a coherent flow. In each section, write 2-5 sentence paragraphs with clear topic sentences and transitions; use lists sparingly only when they improve clarity. - Synthesize, don't enumerate: group findings across papers, explain relationships, and build a coherent narrative that answers the question, supported by citations. - Do not invent snippets or citations. Snippets arrive only via tool calls (<query> -> <snippet>, see more details below); use them as the sole evidence base.

1.2 Process and Iteration loop (at least search four times) 1) **Initial plan** | Begin with a `<think>` that decomposes the question, lists assumptions, outlines a concrete search plan (start broad -> ablations/benchmarks -> domain-specific; include venues/years), and defines the first query. 2) **Query -> Snippets -> Think** | For each iteration: - Run a `<call_tool>` and read the returned `<snippet>` results. - Then add a `<think>` (natural prose) that:

- Summarizes what the latest snippets show; marks which are relevant vs. irrelevant **and why**. - Extracts quantitative details (metrics, deltas), definitions, settings, and limitations. - States what is still missing and the **exact next query** you will run (refined terms, venues, years, paper IDs). - Prefer `snippet_search` for paragraph-level evidence. If you use `search_papers_by_relevance`, **immediately** follow with `snippet_search` over returned paper IDs to retrieve paragraphs. - Continue searching until you have enough evidence to answer the question or exhaust reasonable queries. 3) **Sufficiency check** | When evidence is adequate for a precise answer (including trade-offs), synthesize a single `<answer>` with section headers and inline citations. Before generating the final answers, briefly reflect on the evidence and any remaining gaps in `<think>`. Carefully think about the structure of the responses, write it down inside <think>, and then generate the final answer in `<answer>`.

... (Guideline, few shot demonstrations, and tool call details)

Figure 16. System prompt for generating trajectory data.

27

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

轨迹生成提示

您是一名研究助理，通过迭代推理和使用多个外部搜索系统的证据支持搜索来回答问题。

1. 操作原则、流程和指南 1.1 原则 - 为科学问题提供全面、有证据支持的答案。 - 为检索到的片段中的每一个重要主张提供依据；绝不捏造内容。使用仅从返回的片段中提取的 <cite id="...">...</cite> 进行引用。 - 喜欢权威来源（同行评审的论文、信誉良好的基准/文档），并优先考虑快速发展领域的近期工作。 - 承认不确定性和冲突；如果证据薄弱或消息来源不同意，请说明并解释哪些额外证据可以解决该问题。 - 具有清晰的 Markdown 标题和连贯流程的结构。每个部分写2-5个句子段落，主题句​​和过渡清晰；仅当列表可以提高清晰度时才应谨慎使用。 - 综合，而不是枚举：对论文中的发现进行分组，解释关系，并建立一个连贯的叙述来回答问题，并有引文支持。 - 不要发明片段或引文。片段仅通过工具调用到达（<query> -> <snippet>，请参阅下面的更多详细信息）；使用它们作为唯一的证据基础。

1.2 流程和迭代循环（至少搜索四次） 1) **初始计划** |从分解问题的“<think>”开始，列出假设，概述具体的搜索计划（从广泛开始 -> 消融/基准 -> 特定领域；包括地点/年份），并定义第一个查询。 2) **查询 -> 片段 -> 思考** |对于每次迭代： - 运行“<call_tool>”并读取返回的“<snippet>”结果。 - 然后添加一个“<think>”（自然散文）：

- 总结最新片段显示的内容；相关与不相关的标记**以及原因**。 - 提取定量详细信息（指标、增量）、定义、设置和限制。 - 说明仍然缺少的内容以及您将运行的**确切的下一个查询**（精确的术语、地点、年份、论文 ID）。 - 更喜欢使用“snippet_search”来获取段落级证据。如果您使用“search_papers_by_relevance”，**立即**在返回的论文 ID 上使用“snippet_search”来检索段落。 - 继续搜索，直到有足够的证据来回答问题或穷尽合理的疑问。 3) **充分性检查** |当证据足以得出精确答案（包括权衡）时，请合成一个带有节标题和内联引用的“<answer>”。在生成最终答案之前，请简要反思“<think>”中的证据和任何剩余的空白。仔细思考响应的结构，将其写在 <think> 中，然后在 `<answer>` 中生成最终答案。

...（指南、一些镜头演示以及工具调用详细信息）

图 16. 生成轨迹数据的系统提示。

27

<!-- page 28 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Prompt Source Output format Number Avg. Tool Calls Avg. Length

OpenScholar Long-form 5704 3.5 3878.7 Search Arena Long-form 3547 3.1 2745.9 ScholarQA Long-form 1000 5.4 5400.5 HotpotQA Short-form 1176 2.4 1488.8 MegaScience Short-form 814 2.3 1494.8 TaskCraft Short-form 583 2.8 1518.1 WebWalkerSilver Short-form 1438 2.5 1540.2 BrowseComp Short-form 916 8.6 4083.5 PopQA & TyDi QA Short-form 874 3.7 1514.3

Table 7. SFT data stats. The output format specifies whether a task requires a long-form or short-form response, and the number denotes

the number of instances. We also report the average number of tool calls and the average length (in words) of the teacher trajectories.

created the final iterative search data by interleaving sub-queries, associated retrieved papers, reasoning from the CoT plan. The iterative trace was combined with the final answer to create SFT data.

Data stats. Table 7 shows the final statistics of the resulting SFT data.

Example of SFT data. Figures 32–35 show an example trajectory of OpenScholar in our SFT data.

F.2. RL Data Construction

Initial rubric constructions. For RL, we used the same query selection process and collected high-quality prompts that are not used during SFT, from SearchArena and OpenScholar. For each prompt, we generate an initial set of rubrics using external search systems. Specifically, for OpenScholar queries, we use paper search (S2 snippet search), and for SearchArena queries, we use Google search (serper search) and web browsing (serper browse) to retrieve the top 10 search results. Given the retrieved documents, we generate a set of initial rubrics. The system prompts for this is in Figure 17. We used GPT-4.1-mini as the rubric generation model.

F.3. Onpolicy SFT Data Construction

We also generate on-policy SFT data by sampling trajectories from our SFT checkpoint and applying rejection sampling. While this improves the standalone performance of the SFT model, we initialize RL from the original SFT checkpoint instead for our final run, as the results in Figure 5 show it ultimately performs better. See Appendix I.3 for more details.

Trajectory generation. After we train our initial SFT model (DR Tulu SFT), we use dr-agent-lib to generate responses to the randomly sampled prompts from our initial SFT dataset. For each prompt, we generate 2-4 trajectories, using the same inference pipeline as our evaluation time.

Rejection sampling. After collecting trajectories, we apply rejection sampling. In addition to the lightweight procedure described in Appendix F.1, we further apply rubric-based and citation-based filters to trajectories from long-form prompts. Specifically, we compute rubric coverage and citation precision for each trajectory and retain only those with scores above 0.6 on both metrics. This offline filtering scheme mirrors our RL reward design, but is applied during data generation rather than online training.

G. Training Details

G.1. SFT Hyperparameters

We provide the hyperparameters used during the SFT training in Table 8.

28

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

提示源输出格式 数字平均值工具平均调用次数长度

OpenScholar 长格式 5704 3.5 3878.7 Search Arena 长格式 3547 3.1 2745.9 ScholarQA 长格式 1000 5.4 5400.5 HotpotQA 短格式 1176 2.4 1488.8 MegaScience 短格式 814 2.3 1494.8 TaskCraft 短格式583 2.8 1518.1 WebWalkerSilver 简短形式 1438 2.5 1540.2 BrowseComp 简短形式 916 8.6 4083.5 PopQA 和 TyDi QA 简短形式 874 3.7 1514.3

表 7.SFT 数据统计。输出格式指定任务需要长格式还是短格式响应，数字表示

实例数。我们还报告了工具调用的平均数量和教师轨迹的平均长度（以字为单位）。

通过交错子查询、相关检索的论文、从 CoT 计划进行推理来创建最终的迭代搜索数据。迭代跟踪与最终答案相结合以创建 SFT 数据。

数据统计。表 7 显示了所得 SFT 数据的最终统计结果。

SFT 数据示例。图 32-35 显示了 OpenScholar 在我们的 SFT 数据中的轨迹示例。

F.2。强化学习数据构建

最初的标题结构。对于 RL，我们使用相同的查询选择过程，并从 SearchArena 和 OpenScholar 收集了 SFT 期间未使用的高质量提示。对于每个提示，我们使用外部搜索系统生成一组初始评分标准。具体来说，对于 OpenScholar 查询，我们使用论文搜索（S2 片段搜索），对于 SearchArena 查询，我们使用 Google 搜索（serper 搜索）和网页浏览（serper 浏览）来检索前 10 个搜索结果。给定检索到的文档，我们生成一组初始标题。系统对此的提示如图 17 所示。我们使用 GPT-4.1-mini 作为 rubric 生成模型。

F.3。 Onpolicy SFT数据构建

我们还通过从 SFT 检查点采样轨迹并应用拒绝采样来生成策略 SFT 数据。虽然这提高了 SFT 模型的独立性能，但我们从原始 SFT 检查点初始化 RL 来进行最终运行，如图 5 中的结果显示它最终表现得更好。更多详细信息，请参见附录 I.3。

轨迹生成。训练初始 SFT 模型 (DR Tulu SFT) 后，我们使用 dr-agent-lib 生成对初始 SFT 数据集中随机采样提示的响应。对于每个提示，我们使用与评估时间相同的推理管道生成 2-4 个轨迹。

拒绝抽样。收集轨迹后，我们应用拒绝采样。除了附录 F.1 中描述的轻量级程序之外，我们还进一步将基于标题和基于引文的过滤器应用于来自长格式提示的轨迹。具体来说，我们计算每个轨迹的标题覆盖率和引用精度，并仅保留在这两个指标上得分均高于 0.6 的那些。这种离线过滤方案反映了我们的 RL 奖励设计，但应用在数据生成过程中，而不是在线训练过程中。

G. 培训细节

G.1。 SFT 超参数

我们在表 8 中提供了 SFT 训练期间使用的超参数。

28

<!-- page 29 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Trajectory Generation Prompt

You will receive: (1) a user Question that tests literature knowledge, and (2) a list of Snippets (each with an id and text). Your task: design a rubric | a compact set of elements ("ingredients") that a high-quality final answer should satisfy, and map each element to the most relevant snippets.

Important: You are specifying what a *good answer must contain*, not grading any existing answer. Use ONLY the provided snippets for evidence.

-------------------------------- INPUT FORMAT -------------------------------- - Question: a single string. - Snippets: a list of items. Each item has:

- id: a unique identifier (e.g., S_abcd123, DOI/CorpusID, or similar). - text: the snippet content (the ONLY citable text).

-------------------------------- WHAT TO RETURN -------------------------------- Return a single JSON object with EXACTLY these top-level keys: {

"Question": <string>, "Answer Critical": [

{ "Ingredient": <string>, "Handle": <string>, "Specifics": [ { "Text": <string>, "Citation": <id> } ... ] } ], "Valuable": [

{ "Ingredient": <string>, "Handle": <string>, "Specifics": [ { "Text": <string>, "Citation": <id> } ... ] } ], "Context": [

{ "Ingredient": <string>, "Handle": <string>, "Specifics": [ { "Text": <string>, "Citation": <id> } ... ] } ] }

-------------------------------- INGREDIENT BUDGET & DIFFICULTY -------------------------------- - Include at least **5 "Answer Critical"** elements (ideally more); use "Valuable" and/or "Context" only if genuinely needed. - Make each element **detailed and challenging**: it should bundle multiple precise, testable requirements for the same capability (multi-criteria), not broad or vague checks. - Make each element **detailed and challenging**: write it as a **multi-criteria** requirement (multiple precise, testable sub-checks for a single capability).

...

Figure 17. System prompt for generating initial-search based. Full system prompts are available in our repository.

29

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

轨迹生成提示

您将收到：(1) 一个测试文献知识的用户问题，以及 (2) 一个片段列表（每个片段都有一个 ID 和文本）。您的任务：设计一个标题 |高质量的最终答案应满足的一组紧凑的元素（“成分”），并将每个元素映射到最相关的片段。

重要提示：您正在指定“好答案必须包含什么”，而不是对任何现有答案进行评分。仅使用提供的片段作为证据。

-------------------------------- 输入格式 -------------------------------- - 问题：单个字符串。 - 片段：项目列表。每个项目有：

- id：唯一标识符（例如，S_abcd123、DOI/CorpusID 或类似标识符）。 - 文本：片段内容（唯一可引用的文本）。

-------------------------------- 返回什么 -------------------------------- 返回单个 JSON 对象，其中包含这些顶级键：{

“问题”：<字符串>，“关键答案”：[

{ "成分": <字符串>, "手柄": <字符串>, "规格": [ { "文本": <字符串>, "引用": <id> } ... ] } ], "有价值": [

{“成分”：<字符串>，“处理”：<字符串>，“规格”：[ {“文本”：<字符串>，“引用”：<id> } ... ] } ]，“上下文”：[

{ "成分": <字符串>, "手柄": <字符串>, "规格": [ { "文本": <字符串>, "引用": <id> } ... ] } ] }

-------------------------------- 原料预算和难度 -------------------------------- - 至少包含 **5 个“关键答案”** 元素（最好更多）；仅在真正需要时才使用“有价值”和/或“上下文”。 - 使每个元素**详细且具有挑战性**：它应该针对同一功能（多标准）捆绑多个精确的、可测试的要求，而不是广泛或模糊的检查。 - 使每个元素**详细且具有挑战性**：将其编写为**多标准**要求（对单个功能进行多个精确的、可测试的子检查）。

...

图 17. 生成基于初始搜索的系统提示。我们的存储库中提供了完整的系统提示。

29

<!-- page 30 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Hyperparameter Value

Cutoff length. 16384 Per device training batch size. 1 Gradient accumulation step. 16 learning rate. 0.00004 Number of training epochs. 5 Learning rate scheduler. cosine Warmup ratio. 0.1 Data type. BF16 Temperature for sampling rollouts. 1.0 Weight decay. 0.0

Table 8. Hyperparameters used for SFT training.

G.2. RL Training Details and Hyperparameters

For RL training, we use a standard GRPO loss (Shao et al., 2024), albeit using token-level loss aggregation like DAPO (Yu et al., 2025). We apply two further optimizations: we use sample packing to pack multiple rollouts into single training passes with minimal padding, and use 1-step asynchronous training (Noukhovitch et al., 2024), which means we perform generation and training steps at the same time (training on rollouts from a policy one step behind our current policy), reducing training time. We additionally mask out tool output tokens from the loss, following prior work (Jin et al., 2025). We find using a small KL penalty (0.001) useful for stabilizing training. After generating rollouts and computing rewards, we perform the rubric buffer management steps described in §3.1 before sending the completed samples and rewards to the trainer. We also turned off the citation reward after 650 training steps, as we found it converged and did not further add to performance, whilst dramatically slowing down RL training (due to the large number of API calls required). We then turned citation rewards back on for steps 3350 - 4000 due to citation performance dropping. For ablations, we similarly turn off citation rewards after 650 steps of training.

Asynchronous tool calling. We additionally use asynchronous tool calling to improve RL training efficiency, similar to Jiang et al. (2025). Once a tool call is sent, we place that given generation request to sleep, allowing the inference engine to potentially continue to work on generating other responses while waiting for the tool response. This results in the generation and tool calling being overlapped wherever possible. Our tool calls are mediated by dr-agent-lib, our custom agent infrastructure, which allows us to tightly control the number of concurrent calls made to given APIs and to cache repeated queries to increase efficiency.

Further Training Details For our final training run, we ran for 70 days, using roughly 27000 GPU hours to take 4000 training steps, or 14.5 epochs over our training data. We found that performance started to saturate around 4000 steps and stopped our main training run, although further training may yield slightly improved results. We found increasing compute did not improve RL training speed, due to being limited by API rate-limits during rollouts. We show the full RL training curves for our final training run in Appendix I.2. We used Crawl4AI,2, a free open-source tool, for browsing during training time to save costs. We provide the hyperparameters used during RL training in Table 9.

G.3. Prompt used for General Rubric Training

Figure 18 presents system prompts used for general rubric training.

H. Experimental Details

H.1. Prompts for DR Tulu

Figures 19 and 20 show DR Tulu system prompt.

2https://github.com/unclecode/crawl4ai

30

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

超参数值

切断长度。 16384 每设备训练批量大小。 1 梯度累积步骤。 16 学习率。 0.00004 训练时期数。 5 学习率调度器。余弦预热比率。 0.1 数据类型。 BF16 采样卷展温度。 1.0 权重衰减。 0.0

表 8.用于 SFT 训练的超参数。

G.2。强化学习训练细节和超参数

对于 RL 训练，我们使用标准 GRPO 损失（Shao 等人，2024），尽管使用像 DAPO 这样的令牌级损失聚合（Yu 等人，2025）。我们应用了两项进一步的优化：我们使用样本打包将多个 rollout 打包到具有最小填充的单个训练通道中，并使用 1 步异步训练（Noukhovitch 等人，2024），这意味着我们同时执行生成和训练步骤（从落后于当前策略一步的策略进行 rollout 训练），从而减少了训练时间。根据之前的工作，我们还从损失中屏蔽了工具输出代币（Jin 等人，2025）。我们发现使用小的 KL 罚分 (0.001) 对于稳定训练很有用。生成部署和计算奖励后，我们执行第 3.1 节中描述的标题缓冲区管理步骤，然后将完成的样本和奖励发送给培训师。我们还在 650 个训练步骤后关闭了引用奖励，因为我们发现它收敛了并且没有进一步提高性能，同时显着减慢了 RL 训练速度（由于需要大量 API 调用）。然后，由于引用性能下降，我们在步骤 3350 - 4000 中重新打开引用奖励。对于消融，我们同样在 650 步训练后关闭引用奖励。

异步工具调用。我们还使用异步工具调用来提高 RL 训练效率，类似于 Jiang 等人。 （2025）。发送工具调用后，我们会将给定的生成请求置于休眠状态，从而允许推理引擎在等待工具响应的同时继续生成其他响应。这会导致生成和工具调用尽可能重叠。我们的工具调用由我们的自定义代理基础架构 dr-agent-lib 介导，这使我们能够严格控制对给定 API 的并发调用数量，并缓存重复查询以提高效率。

更多训练细节 对于我们的最终训练运行，我们运行了 70 天，使用大约 27000 个 GPU 小时来执行 4000 个训练步骤，或者对我们的训练数据进行 14.5 个 epoch。我们发现，在 4000 步左右，性能开始饱和，并停止了我们的主要训练运行，尽管进一步的训练可能会产生稍微改善的结果。我们发现，由于部署期间受到 API 速率限制的限制，增加计算量并没有提高 RL 训练速度。我们在附录 I.2 中展示了最终训练的完整 RL 训练曲线。我们使用免费开源工具 Crawl4AI,2 在训练期间进行浏览以节省成本。我们在表 9 中提供了 RL 训练期间使用的超参数。

G.3。用于一般评分标准培训的提示

图 18 显示了用于一般评估规则培训的系统提示。

H. 实验细节

H.1。提示 DR Tulu

图19和图20显示了DR Tulu系统提示符。

2https://github.com/unclecode/crawl4ai

30

<!-- page 31 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Hyperparameter Value

Unique prompts per batch. 32 Number of rollouts for each prompt (group size). 8 Number of minibatches per GRPO step. 1 Inner epochs trained for each batch. 1 Max number of tokens in the prompt. 2048 Max response length in tokens. 16384 Maximum number of tokens packed into a single sequence. 18500 Maximum number of tool calls allowed during training. 10 Temperature for sampling rollouts. 1.0 Top-p for sampling rollouts 1.0 KL penalty coefficient. 0.001 Learning rate schedule. constant Learning rate. 5 × 10−7

AdamW optimizer betas. (0.9, 0.95) Weight decay. 0.0 Max number evolving rubrics retained per prompt (Kmax). 5

Table 9. Hyperparameters used for GRPO training.

Category Tool Name Description

General Search serper google webpage search Web search using Google (via Serper.dev API)

massive serve search Dense passage retrieval using massive-serve API

semantic scholar search Search for paper information using Semantic Scholar API

semantic scholar snippet search Search for text snippets within academic papers

Scholar Search

pubmed search Search for biomedical papers using PubMed API

serper google scholar search Academic paper search using Google Scholar

Browse Tools serper fetch webpage content Fetch webpage content using Serper.dev API

crawl4ai fetch webpage content Async webpage fetch using Crawl4AI

jin fetch webpage content Fetch webpage content using Jina.ai API

Reranker Tools vllm hosted reranker Rerank documents using VLLM hosted reranker

Table 10. The list of supported tools in our agent library.

H.2. Evaluation Details of Baseline Models

Open deep research models. For WebExplorer and Tongyi Deep Research, we use their official codebase3 4 to generate trajectories for all tasks with their default settings, except that we replace their summary model with a local Qwen3-8B server. For ASearcher, we use their official codebase5 to generate trajectories for all tasks. For WebThinker (Li et al., 2025a), we used their code base6 and evaluated both their default mode as well as report mode.

Closed deep research systems. Figure 21 shows the prompt used to run the GPT-5 + Search and Gemini3 Pro + Search baseline. For Gemini3 Pro, we use Google Search and URL Content tools provided by Gemini API.

Naive RAG. For the Naive RAG baselines, we retrieve the top 10 search snippets from google search using the original question, and then prompt the LM with a simple instruction: “Can you try to answer the question given the retrieved documents? Specifically, you should reason step by step, given the evidence retrieved from the web; when there is no evidence present, you should try to answer it based on your knowledge. Please provide a final answer in the format of “Final Answer: [your answer here]”.

3https://github.com/hkust-nlp/WebExplorer 4https://github.com/Alibaba-NLP/DeepResearch 5https://github.com/inclusionAI/ASearcher 6https://github.com/RUC-NLPIR/WebThinker

31

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

超参数值

每批次都有独特的提示。 32 每个提示的转出次数（组大小）。 8 每个 GRPO 步骤的小批量数。 1 每批次训练 1 个内部 epoch。 1 提示中的最大标记数。 2048 最大响应长度（以令牌为单位）。 16384 打包到单个序列中的令牌的最大数量。 18500 训练期间允许的最大工具调用次数。 10 采样推出的温度。 1.0 抽样推出的 Top-p 1.0 KL 惩罚系数。 0.001 学习率表。恒定的学习率。 5×10−7

AdamW 优化器测试版。 (0.9, 0.95) 权重衰减。 0.0 每个提示保留的最大发展量规数量 (Kmax)。 5

表 9. 用于 GRPO 训练的超参数。

类别 工具名称 说明

一般搜索 serper google 网页搜索 使用 Google 进行网页搜索（通过 Serper.dev API）

大规模服务搜索 使用大规模服务 API 进行密集段落检索

语义学者搜索 使用语义学者 API 搜索论文信息

语义学者片段搜索 在学术论文中搜索文本片段

学者搜索

pubmed 搜索 使用 PubMed API 搜索生物医学论文

serper 谷歌学术搜索 使用谷歌学术搜索学术论文

浏览工具 serper 获取网页内容 使用 Serper.dev API 获取网页内容

crawl4ai 获取网页内容 使用 Crawl4AI 异步网页获取

jin 获取网页内容 使用 Jina.ai API 获取网页内容

Reranker Tools vllm 托管的 reranker 使用 VLLM 托管的 reranker 对文档进行重新排序

表 10. 我们的代理库中支持的工具列表。

H.2。基线模型的评估细节

开放深度研究模型。对于WebExplorer和Tongyi Deep Research，我们使用他们的官方codebase3 4以默认设置生成所有任务的轨迹，除了我们用本地Qwen3-8B服务器替换他们的摘要模型。对于 ASearcher，我们使用他们的官方代码库 5 来生成所有任务的轨迹。对于 WebThinker（Li et al., 2025a），我们使用了他们的代码库 6 并评估了他们的默认模式和报告模式。

封闭的深度研究系统。图 21 显示了用于运行 GPT-5 + Search 和 Gemini3 Pro + Search 基线的提示。对于 Gemini3 Pro，我们使用 Gemini API 提供的 Google 搜索和 URL 内容工具。

天真的拉格。对于 Naive RAG 基线，我们使用原始问题从 google 搜索中检索前 10 个搜索片段，然后用一个简单的指令提示 LM：“你能尝试根据检索到的文档回答问题吗？具体来说，你应该根据从网络检索到的证据逐步推理；当没有证据存在时，你应该尝试根据你的知识来回答。请以“最终答案：[此处你的答案]”的格式提供最终答案。

3https://github.com/hkust-nlp/WebExplorer 4https://github.com/Alibaba-NLP/DeepResearch 5https://github.com/inclusionAI/ASearcher 6https://github.com/RUC-NLPIR/WebThinker

31

<!-- page 32 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

General Rubric Prompt

<|system|> You will be given a question someone asked (in <question></question> tags) and the corresponding response (in <response></response> tags) given to them by an assistant. You will then be given a specific criterion of the response to evaluate (in <criterion></criterion> tags). Return a score on a scale of 0 to 2 indicating how appropriate the response is based on the given criterion. Judge only the specified aspect(s), not any other qualities of the answer. Output JSON in the format: {{"score": x}}. <|user|> <question>{question}</question> <response>{response}</response> <criterion> (1) Overall Comprehensiveness: The report should cover content as comprehensively as possible (2) Thoroughness of Discussion: Each section should be discussed thoroughly, not just superficially (3) Factuality: There should be minimal factual errors (4) Coherence: The discussion should stay focused and relevant to the topic </criterion>

Figure 18. General rubric (baseline). This prompt describes the general rubric from WebThinker (Li et al., 2025a) evaluation, which we

used as a baseline in Section 6.2.

Fixed pipeline deep research models on short-form questions. We do not evaluate models that use a specialized inference pipeline on short-form questions because they are unable to follow instructions to only output the answer. For instance, here is an example answer from Ai2 ScholarQA for a query from SimpleQA:

Query: Which two scientists (first and last names) are credited with first isolating Azotobacter salinestris from saline soils? Answer in fewer than 10 words.

Answer: Page and Shivprasad were the scientists who first isolated Azotobacter salinestris from saline soils <Paper corpusId=“7646032” paperTitle=“(Robson et al., 2015)” isShortName></Paper>. While Beijerinck isolated Azotobacter species in 1901, this was a different species and predated the discovery of A. salinestris <Paper corpusId=“87342753” paperTitle=”(Shin et al., 2016)” isShortName></Paper>

H.3. Score Calculation Details

Asta-ScholarQA-CS2. We use the official code7 to evaluate our method and the baselines on Asta-ScholarQA-CS2. We compute rubric score, answer precision, citation precision and citation recall on the 100 test set questions using gemini-2.5- flash as the judge as detailed in (Bragg et al., 2025). Asta-ScholarQA-CS2 requires evidence text from citations in order to judge citation precision and recall. For proprietary models (OpenAI Deep Research, GPT-5) that only provide URLs for citations, we use JINA API to scrape the URL and use the resulting text as citation evidence.

HealthBench. We use an adapted version of the OpenAI simple-evals suite8 for the evaluation. For each multi-turn example, we concatenate the full conversation into a single input and prepend an instruction directing the model to answer the question based on this doctorpatient conversation. For efficiency, we randomly sample a subset of 1000 cases for evaluation.

DeepResearchBench. We use the official code9 to evaluate our method and the baselines on DeepResearchBench. We compute the Comprehensiveness, Insight/Depth, Instruction-Following, and Readability of articles answering 50 English and 50 Chinese open-ended deep research questions. We report the Overall as the macro average of the component metrics. We use gemini-2.5-flash as the judge and Jina API to scrape the URL to acquire the evidence snippets when needed, as

7https://github.com/allenai/asta-bench 8https://github.com/openai/simple-evals 9https://github.com/Ayanami0730/deep_research_bench

32

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

一般提示

<|system|> 您将收到某人提出的问题（在 <question></question> 标签中）以及助理向他们提供的相应响应（在 <response></response> 标签中）。然后，您将获得要评估的响应的具体标准（在 <criterion></criterion> 标签中）。返回 0 到 2 范围内的分数，指示响应基于给定标准的适当程度。仅判断答案的指定方面，而不判断任何其他质量。输出 JSON 格式为：{{"score": x}}。 <|user|> <question>{question}</question> <response>{response}</response> <criterion> (1) 总体全面性：报告应尽可能全面地涵盖内容 (2) 讨论的彻底性：每个部分都应进行彻底讨论，而不只是肤浅 (3) 事实性：应尽量减少事实错误 (4) 连贯性：讨论应保持重点突出并与主题相关</criterion>

图 18. 一般标题（基线）。此提示描述了 WebThinker（Li 等人，2025a）评估的一般标题，我们将其

用作第 6.2 节中的基线。

修复了简短问题的管道深度研究模型。我们不会评估在简短问题上使用专门推理管道的模型，因为它们无法遵循指令仅输出答案。例如，以下是 Ai2 ScholarQA 针对 SimpleQA 查询的示例答案：

问题：哪两位科学家（名字和姓氏）被认为是第一个从盐渍土壤中分离出盐渍固氮菌的人？请用 10 字以内的字数来回答。

答案：Page 和 Shivprasad 是首先从盐渍土壤中分离出盐碱固氮菌的科学家 <Paper corpusId=“7646032” paperTitle=“(Robson et al., 2015)” isShortName></Paper>。虽然 Beijerinck 在 1901 年分离出了固氮杆菌，但这是一个不同的物种，并且早于 A. salinestris 的发现 <Paper corpusId=“87342753” paperTitle=”(Shin et al., 2016)” isShortName></Paper>

H.3。分数计算详情

Asta-ScholarQA-CS2。我们使用官方代码7来评估我们的方法和Asta-ScholarQA-CS2上的基线。我们使用 Gemini-2.5-flash 作为评判者，计算 100 个测试集问题的评分、答案精度、引文精度和引文召回率，详细信息请参见（Bragg 等人，2025）。 Asta-ScholarQA-CS2 需要引文中的证据文本，以便判断引文精确度和召回率。对于仅提供引用 URL 的专有模型（OpenAI Deep Research、GPT-5），我们使用 JINA API 来抓取 URL 并使用生成的文本作为引用证据。

健康工作台。我们使用 OpenAI simple-evals suite8 的改编版本进行评估。对于每个多轮示例，我们将完整的对话连接成单个输入，并预先添加一条指令，指导模型根据该医患对话回答问题。为了提高效率，我们随机抽取 1000 个案例的子集进行评估。

深度研究平台。我们使用官方的 code9 来评估我们的方法和 DeepResearchBench 上的基线。我们计算了回答 50 个英文和 50 个中文开放式深度研究问题的文章的综合性、洞察力/深度、指令遵循性和可读性。我们将总体报告为组成指标的宏观平均值。我们使用gemini-2.5-flash作为判断器，并在需要时使用Jina API来抓取URL以获取证据片段，如下

7https://github.com/allenai/asta-bench 8https://github.com/openai/simple-evals 9https://github.com/Ayanami0730/deep_research_bench

32

<!-- page 33 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

DR Tulu System Prompt Part I

You are a research assistant who answers questions through iterative reasoning and research.

## Process - Use <think></think> tags to show your reasoning at any point. - Use <call_tool name="...">query</call_tool> when you need information (see tools below). - You can alternate between thinking and searching multiple times. - Only provide <answer></answer> tags when you have enough information for a complete response. If the problem asks for a specific, short-form answer, you can also put the answer string in the \boxed{} format. - Support every non-trivial claim with retrieved evidence. Wrap the exact claim span in <cite id="ID1,ID2">...</cite>, where id are snippet IDs from searched results (comma-separated if multiple). Use only returned snippets; never invent IDs. Avoid citing filler text - cite just the factual claim.

## Calling Tools (<call_tool name="...">query</call_tool>) - You can use the following tools:

1. google_search - Purpose: general web search. - Input via: <call_tool name="google_search">your query</call_tool> - Output: web search snippets (see SEARCH RESULTS). - Optional parameters

- gl: geolocation - hl: host language

2. browse_webpage - Purpose: open a specific URL (typically one returned by google_search) and extract readable page text as snippets. - Input via: <call_tool name="browse_webpage">https://example.com/article</call_tool> - Output: webpage (see SEARCH RESULTS).

3. snippet_search - Purpose: focused snippet retrieval from scientific papers - Input via: <call_tool name="snippet_search">your query</call_tool> - Output: snippets from existing papers (see SEARCH RESULTS). - Examples: <call_tool name="snippet_search" limit="8" year="2021-2025" fieldsOfStudy="Computer Science, Medicine">large language model retrieval evaluation</call_tool> - Optional parameters

- limit: number of snippets to retrieve - year: publication year; you can use a single number (e.g., 2024) or a range (e.g., 2022-2025)

- fieldsOfStudy: One or a comma-separated list from: Computer Science, Medicine, Chemistry, Biology, Materials Science, Physics, Geology, Psychology, Art, History, Geography, Sociology, Business, Political Science, Economics, Philosophy, Mathematics, Engineering, Environmental Science, Agricultural and Food Sciences, Education, Law, Linguistics.

## Tool Output - After you issue a tool call, we will execute it and return results wrapped in <tool_output> tags. - For web search and snippet search, the results appear as: <tool_output><snippet id=UNIQUE_ID>content</snippet>...</tool_output> - For web browsing, the searched results are represented as <tool_output><webpage id=UNIQUE_ID>content</webpage></tool_output>

Figure 19. DR Tulu System Prompts Part I.

33

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

DR Tulu系统提示第一部分

你是一名研究助理，通过迭代推理和研究来回答问题。

## 流程 - 使用 <think></think> 标签随时展示您的推理。 - 当您需要信息时，使用<call_tool name="...">查询</call_tool>（请参阅下面的工具）。 - 您可以多次交替思考和搜索。 - 仅当您有足够的信息来完成回复时才提供 <answer></answer> 标签。如果问题需要特定的简短答案，您还可以将答案字符串采用 \boxed{} 格式。 - 用检索到的证据支持每一个重要的主张。将确切的声明范围包含在 <cite id="ID1,ID2">...</cite> 中，其中 id 是搜索结果中的代码段 ID（如果有多个，则以逗号分隔）。仅使用返回的片段；永远不要发明ID。避免引用填充文本 - 仅引用事实主张。

## 调用工具 (<call_tool name="...">query</call_tool>) - 您可以使用以下工具：

1. google_search - 用途：一般网络搜索。 - 输入通过：<call_tool name="google_search">您的查询</call_tool> - 输出：网络搜索片段（请参阅搜索结果）。 - 可选参数

- gl：地理位置 - hl：宿主语言

2. browser_webpage - 目的：打开特定的 URL（通常由 google_search 返回）并提取可读的页面文本作为片段。 - 输入通过：<call_tool name="browse_webpage">https://example.com/article</call_tool> - 输出：网页（参见搜索结果）。

3. snippet_search - 目的：从科学论文中检索重点片段 - 输入通过：<call_tool name="snippet_search">您的查询</call_tool> - 输出：现有论文中的片段（参见搜索结果）。 - 示例： <call_tool name="snippet_search" limit="8"year="2021-2025" fieldsOfStudy="Computer Science, Medicine">大语言模型检索评估</call_tool> - 可选参数

- 限制：要检索的片段数量 - 年份：出版年份；您可以使用单个数字（例如 2024）或范围（例如 2022-2025）

- fieldsOfStudy：一个或一个逗号分隔的列表：计算机科学、医学、化学、生物学、材料科学、物理学、地质学、心理学、艺术、历史、地理学、社会学、商业、政治学、经济学、哲学、数学、工程、环境科学、农业和食品科学、教育、法律、语言学。

## 工具输出 - 在发出工具调用后，我们将执行它并返回包含在 <tool_output> 标记中的结果。 - 对于网页搜索和代码片段搜索，结果显示为： <tool_output><snippet id=UNIQUE_ID>content</snippet>...</tool_output> - 对于网页浏览，搜索结果显示为 <tool_output><webpage id=UNIQUE_ID>content</webpage></tool_output>

图 19. DR Tulu 系统提示第 I 部分。

33

<!-- page 34 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

DR Tulu System Prompt Part II

## Answer and Citation Format

- Once you collect all of the necessary information, generate the final answer, and mark your answer with answer tags: <answer></answer>. - If your answer is short (e.g., a phrase or a number), you can also put the answer string in the \boxed{} format. - In your answer, wrap the supported text in <cite id="SNIPPET_ID"> ... </cite>. You have to use the exact ID from a returned <snippet id=...>...</snippet>. - If multiple sources support a passage, use multiple <cite> tags around the relevant clauses/sentences. - Examples <cite id="S17">LLMs often hallucinate on long-tail facts.</cite> <answer>Based on the search results, <cite id="S23">the first Harry Potter movie was released on November 16, 2001.</cite>Therefore, the final answer is \boxed{November 16, 2001}.</answer>

## WORKFLOW EXAMPLE

Below is a simple example that demonstrates the process and the correct use of tools and tags. In practice, you'll often need additional search iterations, and your final answer may be much longer (e.g., a multi-paragraph report).

Question: Give a concise update on 2024 renewable energy market trends and current commercial solar efficiency benchmarks.

<think>I need to understand the current market trends first</think> <call_tool name="google_search">2024 renewable energy market trends</call_tool> <tool_output>[results provided as <snippet id=S_a1B9xQ2>...</snippet>, <snippet id=S_p0Zr41Q>...</snippet>]</tool_output>

<think>Now I need specific data on solar panel efficiency</think> <call_tool name="snippet_search" limit="5" year="2023-2025" fieldsOfStudy="Engineering, Materials Science">latest solar panel efficiency 2024</call_tool> <tool_output>[results provided as <snippet id=S_x4xU7dU>...</snippet>, <snippet id=S_GxA2ZLh>...</snippet>]</tool_output>

<think>I have enough to answer succinctly</think> <answer> Global renewables expanded rapidly in 2024, <cite ids="S_p0Zr41Q,S_GxA2ZLh">driven primarily by the growth of solar and wind energy.</cite> <cite ids="S_x4xU7dU">State-of-the-art commercial solar modules report cell efficiencies of ˜26-27% and module efficiencies of ˜23-24%.</cite> \boxed{Solar leads 2024 renewables; top commercial module efficiency ˜ 23-24%} </answer>

Figure 20. DR Tulu System Prompts Part II.

34

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

DR Tulu系统提示第二部分

## 答案和引文格式

- 收集完所有必要的信息后，生成最终答案，并使用答案标签标记您的答案：<answer></answer>。 - 如果您的答案很短（例如短语或数字），您还可以将答案字符串采用 \boxed{} 格式。 - 在您的答案中，将支持的文本包含在 <cite id="SNIPPET_ID"> ... </cite> 中。您必须使用返回的 <snippet id=...>...</snippet> 中的确切 ID。 - 如果多个来源支持某个段落，请在相关子句/句子周围使用多个 <cite> 标签。 - 示例 <cite id="S17">法学硕士经常对长尾事实产生幻觉。</cite> <answer>根据搜索结果，<cite id="S23">第一部哈利波特电影于 2001 年 11 月 16 日上映。</cite>因此，最终答案是 \boxed{2001 年 11 月 16 日}。</answer>

## 工作流程示例

下面是一个简单的示例，演示了该过程以及工具和标签的正确使用。在实践中，您经常需要额外的搜索迭代，并且您的最终答案可能会更长（例如，多段落报告）。

问题：简要介绍 2024 年可再生能源市场趋势和当前商业太阳能效率基准的最新情况。

<think>我需要先了解当前的市场趋势</think> <call_tool name="google_search">2024 年可再生能源市场趋势</call_tool> <tool_output>[结果提供为 <snippet id=S_a1B9xQ2>...</snippet>、<snippet id=S_p0Zr41Q>...</snippet>]</tool_output>

<think>现在我需要有关太阳能电池板效率的具体数据</think> <call_tool name="snippet_search" limit="5"year="2023-2025" fieldsOfStudy="Engineering, Materials Science">2024年最新太阳能电池板效率</call_tool> <tool_output>[结果提供为<snippet id=S_x4xU7dU>...</snippet>, <snippet id=S_GxA2ZLh>...</snippet>]</tool_output>

<think>我已经足够简洁地回答</think> <answer>全球可再生能源在 2024 年迅速扩张，<cite ids="S_p0Zr41Q,S_GxA2ZLh">主要由太阳能和风能的增长推动。</cite> <cite ids="S_x4xU7dU">最先进的商业太阳能组件报告电池效率约为 26-27%，组件效率约 23-24%。</cite> \boxed{太阳能引领 2024 年可再生能源；顶级商业模块效率 ~ 23-24%} </answer>

图 20. DR Tulu 系统提示第二部分。

34

<!-- page 35 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

GPT-5+ Search (baseline) Prompt

You are a research assistant who answers questions through reasoning and research.

Requirements: - For the given question, please write a comprehensive, evidence-backed answers to scientific questions. The report should be a structure multi-paragraph report. - Think and search until you have sufficient information - Only provide the final answer when ready - Cite all claims from search results. You should ground every nontrivial claim in retrieved snippets. - Please prefer authoritative sources (peer-reviewed papers, reputable benchmarks/docs) and prioritize recent work for fast-moving areas. - You should acknowledge uncertainty and conflicts; if evidence is thin or sources disagree, state it and explain what additional evidence would resolve it. - It's important to structure with clear markdown headers and a coherent flow. In each section, write 2-5 sentence paragraphs with clear topic sentences and transitions; use lists sparingly only when they improve clarity. Ideally, you should synthesize rather than enumerate content: it's helpful to group findings across papers, explain relationships, and build a coherent narrative that answers the question, supported by citations. - Most importantly, DO NOT invent snippets or citations and never fabricate content.

Question:

Figure 21. GPT-5+ Search (baseline). This is the prompt used for the GPT-5 + Search baseline.

detailed in (Du et al., 2025). For outputs from our system, we use the scraped URL content from the corresponding search or browsing tools.

ResearchQA. We evaluate our method and baselines using the original ResearchQA evaluation suite10. We compute the averaged rubric scores with GPT-4.1-mini as the judge on the 776 official subset of questions used to evaluate deep research systems, following (Yifei et al., 2025).

H.4. Details of Pathogenic Gene Variants Evaluation

Dataset The evaluation data for this task was derived from expert-curated information collected for 24 pathogenic gene variants published in the supplementary data of (Cheerie et al., 2025), which was used to develop guidelines for the assessment of variant eligibility for various types of antisense oligonucleotide (ASO) gene therapy. Curations were done by members of the N=1 Collaborative Patient Identification Working Group, which consists of both medical professionals (MD, PhD, and master’s level) and faculty with expertise in medical genetics. The selected variants were deemed feasible to assess with publicly available information, and each response was agreed upon by two members. This data reports characteristics of selected variants that are essential to determining therapeutic eligibility, including the variant’s pathomechanism, haploinsufficiency status of the gene it affects, inheritance pattern of associated diseases, splicing effects, and findings from prior therapeutic approaches explored. We manually reformatted this data into 47 question-answer examples. Genetic variants are specified in HGVS notation. Questions were preceded by a few sentences of context containing some details on what types of evidence are preferred and the proper answer format.

Setup To avoid the effects of contamination, we blocked all search results pointing to the paper and its supplementary files when evaluating models with our search tools. This was not possible for closed-source DR systems, though the original paper did not appear in the output citations for any model. We also add the statement: ”You should try to find multiple pieces of evidence to support any claims you make, and acknowledge conflicting/supporting evidence among sources searched” to the baseline prompt in Figure 21 for GPT+5, OpenAI DR, and Gemini 3 Pro to ensure they are calibrated to the preferences of this task

10https://github.com/realliyifei/ResearchQA

35

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

GPT-5+ 搜索（基线）提示

你是一名研究助理，通过推理和研究来回答问题。

要求： - 对于给定的问题，请写出对科学问题的全面、有证据支持的答案。该报告应该是一个多段落结构的报告。 - 思考和搜索，直到获得足够的信息 - 仅在准备好后才提供最终答案 - 引用搜索结果中的所有声明。您应该在检索到的片段中论证每一个重要的主张。 - 请优先选择权威来源（同行评审的论文、信誉良好的基准/文档），并优先考虑快速发展领域的近期工作。 - 您应该承认不确定性和冲突；如果证据薄弱或消息来源不同意，请说明并解释哪些额外证据可以解决该问题。 - 具有清晰的降价标题和连贯的流程的结构非常重要。每个部分写2-5个句子段落，主题句​​和过渡清晰；仅当列表可以提高清晰度时才应谨慎使用。理想情况下，您应该综合而不是枚举内容：这有助于对论文中的发现进行分组，解释关系，并建立一个连贯的叙述来回答问题，并由引文支持。 - 最重要的是，不要发明片段或引文，也不要捏造内容。

问题：

图 21.GPT-5+ 搜索（基线）。这是用于 GPT-5 + 搜索基线的提示。

详细信息参见（Du et al., 2025）。对于我们系统的输出，我们使用从相应搜索或浏览工具中抓取的 URL 内容。

研究质量保证。我们使用原始 ResearchQA 评估套件10 评估我们的方法和基线。我们使用 GPT-4.1-mini 作为评估深度研究系统的 776 个官方问题子集的评委来计算平均评分，如下（Yifei 等人，2025）。

H.4。致病基因变异评估详情

数据集 这项任务的评估数据来自专家整理的信息，收集了在补充数据中发布的 24 个致病基因变异（Cheerie 等人，2025），该信息用于制定评估各种类型反义寡核苷酸（ASO）基因治疗的变异资格的指南。策划是由 N=1 协作患者识别工作组的成员完成的，该工作组由医疗专业人员（医学博士、博士和硕士）和具有医学遗传学专业知识的教师组成。选定的变体被认为可以利用公开信息进行评估，并且每个响应都得到了两名成员的同意。该数据报告了选定变异的特征，这些特征对于确定治疗资格至关重要，包括变异的病理机制、其影响的基因的单倍体不足状态、相关疾病的遗传模式、剪接效应以及先前探索的治疗方法的发现。我们手动将这些数据重新格式化为 47 个问答示例。遗传变异以 HGVS 表示法指定。问题之前有几句话上下文，其中包含有关首选证据类型和正确答案格式的一些详细信息。

设置 为了避免污染的影响，我们在使用搜索工具评估模型时屏蔽了所有指向论文及其补充文件的搜索结果。这对于闭源灾难恢复系统来说是不可能的，尽管原始论文没有出现在任何模型的输出引用中。我们还在图 21 中针对 GPT+5、OpenAI DR 和 Gemini 3 Pro 的基线提示添加了以下声明：“您应该尝试找到多个证据来支持您提出的任何主张，并承认搜索来源中存在冲突/支持的证据”，以确保它们根据此任务的偏好进行校准

10https://github.com/realliyifei/ResearchQA

35

<!-- page 36 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Evaluation Criteria Given that the task’s ultimate goal is to aid medical decision-making, we designed criteria that capture not only the correctness of the final answer, but the usefulness of the generated report to a clinician or researcher:

• Final Answer indicates whether the expert-annotated fact was mentioned in the response. Each question has 1-3 key facts that should be present in an ideal response, and the per-example correctness is the average of these.

• Evidence Quality indicates if the type of evidence requested in the query is present within the cited statements (e.g. functional assays in patient-derived cells). This score aims to penalize (1) uncited evidence and (2) evidence that is cited, but irrelevant. To demonstrate this, we provide an example response from DR Tulu that met the Evidence Synthesis criteria (Figure 22)

• Evidence Support measures the proportion of cited statements in the response that are consistent with the original source text retrieved. This was calculated by evaluating each cited span with the original content of the cited source.

• Evidence Synthesis indicates whether or not there was at least one statement describing the relationship between multiple sources, e.g. how papers might build off each other or conflict.

Similar to our prior experiments, we defined specific LLM judge instructions for each evaluation criteria per question and used GPT-4.1 to score each response. No additional training was performed for this task.

I. More Results and Analysis

I.1. Performance and Cost Breakdown

Table 11 provides detailed performance breakdown of models across four main long-form benchmarks.

Comparing DR Tulu (SFT) and DR Tulu (RL), we observe consistent gains from RLER across multiple aspects, including rubric coverage (+11.0 points), answer precision (+7.8), comprehensiveness (+7.9), and depth of response (+9.2). RLER also yields large improvements in citation precision and recall on SQAv2 (+25.2 and +20.0 points, respectively). These results highlight that RLER can effectively improve deep research responses along both content and attribution dimensions.

Table 12 shows the cost of the inference of competitive systems.

I.2. Full RL Training Curves

We show the reward, number of tool calls, and output sequence length through training in Figure 26. We observe that there appear to be three phases of training: in the first phase, sequence lengths and the average number of tool calls drop. They then slowly increase until starting to decline again after thousands of training steps. Similar to prior work, we hypothesize the initial phase may be due to the model initially unlearning unsuccessful behaviors picked up during SFT training before stabilizing and exploring new strategies. A similar drop-and-rise behavior when combining RL training with SFT cold-start data has been observed in other domains, such as mathematical reasoning (Chen et al., 2025a), and we leave further investigation of this phenomenon to future work. The final phases may be due to the model refining its answers to stay strictly within the output length and max tool call restrictions placed on it during training (16384 output tokens and 5 total tool calls, respectively).

Surprisingly, we also find that our training is somewhat robust to tool errors, as we accidentally ran out of Serper credits during training. While we eventually refilled, the model did train for some number of steps wherein Serper would continuously return errors, as seen by the drop in reward and sequence length. However, despite this, our overall model performance continued to improve, with step 1900 being significantly better than step 1000 (right before the Serper credit issue). We faced credit or server issues throughout training, as seen in various dips in reward and output length, but our model generally continued to improve across most downstream evaluations. This suggests our training is somewhat robust to server-side tool errors, and exploring the degree of this robustness is an interesting avenue for future investigation.

I.3. On-Policy SFT and RL Results

We additionally explore augmenting the SFT data with an extra “on-policy” SFT stage. Specifically, we run our trained model on randomly sampled prompts, apply rejection sampling to discard trajectories that do not achieve high scores on search-based rubric verification and citation verification (details in Appendix F.3), and then use the remaining trajectories

36

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

评估标准鉴于该任务的最终目标是帮助医疗决策，我们设计的标准不仅能捕获最终答案的正确性，还能捕获生成的报告对临床医生或研究人员的有用性：

• 最终答案表明答复中是否提及了专家注释的事实。每个问题都有 1-3 个关键事实，这些事实应该出现在理想的回答中，每个示例的正确性是这些事实的平均值。 • 证据质量表明查询中要求的证据类型是否存在于引用的陈述中（例如患者来源细胞的功能测定）。该分数旨在惩罚 (1) 未引用的证据和 (2) 引用但不相关的证据。为了证明这一点，我们提供了 DR Tulu 的响应示例，该响应符合证据综合标准（图 22）

• 证据支持衡量回复中引用的陈述与检索到的原始源文本一致的比例。这是通过使用引用来源的原始内容评估每个引用的跨度来计算的。 • 证据综合表明是否至少有一个陈述描述了多个来源之间的关系，例如：论文如何相互促进或发生冲突。与我们之前的实验类似，我们为每个问题的每个评估标准定义了具体的 LLM 判断指令，并使用 GPT-4.1 对每个回答进行评分。没有为此任务进行任何额外的培训。一、更多结果和分析

一.1.性能和成本细分

表 11 提供了四个主要长格式基准模型的详细性能细分。比较 DR Tulu (SFT) 和 DR Tulu (RL)，我们观察到 RLER 在多个方面都有一致的收益，包括标题覆盖率 (+11.0 分)、答案精度 (+7.8)、全面性 (+7.9) 和响应深度 (+9.2)。 RLER 还大大提高了 SQAv2 的引用精度和召回率（分别为 +25.2 和 +20.0 分）。这些结果凸显了 RLER 可以有效地改善内容和归因维度上的深度研究响应。表 12 显示了竞争系统的推理成本。 I.2.完整的强化学习训练曲线

我们在图 26 中显示了通过训练获得的奖励、工具调用次数和输出序列长度。我们观察到训练似乎分为三个阶段：在第一阶段，序列长度和平均工具调用次数下降。然后它们慢慢增加，直到经过数千个训练步骤后再次开始下降。与之前的工作类似，我们假设初始阶段可能是由于模型在稳定和探索新策略之前最初忘记了在 SFT 训练期间发现的不成功行为。在数学推理等其他领域也观察到了将 RL 训练与 SFT 冷启动数据相结合时类似的下降和上升行为（Chen 等人，2025a），我们将对此现象的进一步研究留待未来的工作。最后阶段可能是由于模型精炼了其答案，以严格保持在训练期间对其施加的输出长度和最大工具调用限制（分别为 16384 个输出标记和 5 个总工具调用）。令人惊讶的是，我们还发现我们的训练对工具错误具有一定的鲁棒性，因为我们在训练期间意外地耗尽了 Serper 积分。当我们最终重新填充时，模型确实训练了一些步骤，其中 Serper 会不断返回错误，如奖励和序列长度的下降所示。然而，尽管如此，我们的整体模型性能继续提高，步骤 1900 明显优于步骤 1000（就在 Serper 信用问题之前）。我们在整个训练过程中遇到了信用或服务器问题，从奖励和输出长度的各种下降中可以看出，但我们的模型在大多数下游评估中总体上持续改进。
这表明我们的训练对服务器端工具错误有一定的鲁棒性，探索这种鲁棒性的程度是未来研究的一个有趣的途径。 I.3。同策略 SFT 和 RL 结果

我们还探索通过额外的“on-policy”SFT 阶段来增强 SFT 数据。具体来说，我们在随机采样的提示上运行经过训练的模型，应用拒绝采样来丢弃在基于搜索的标题验证和引文验证中未获得高分的轨迹（详细信息参见附录 F.3），然后使用剩余的轨迹

36

<!-- page 37 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

LLM judge prompt for Evidence Support evaluation (GeneticDiseasesQA)

# Instructions You are a claim validator. You will be given the text content from a webpage, and a list of claims from a research report that cited the webpage.

<<content>> <<prompt>> <<claims>>

For each claim given you, you will determine if it is supported by the original source's content given. For source content with only the title available, judge them as `supporting` if the title indicates that the paper is likely relevant to the claim being considered. Return a JSON object with a single key `claims` which is a list of `claim` objects, one for each phrase given from the research report. Each `claim` object contains the claim itself (`text`), a boolean `is_supported` which indicates if the claim is fully supported by the citation source content, and `explanation`, which should be a string briefly explaining why the response is or is not supported by the citation source content. If the provided source content is completely empty, entirely filler webpage text, or is an error message or content filter, output an empty list for the `claims` key.

# Example

USER: Content of cited source: "US holidays include Veteran's Day (November 11th) and Halloween (October 31st)."

Claims from generated report: - "Veteran's Day is a national holiday in November."

ASSISTANT: ```json "claims": [

{

"text": "Veteran's Day is a national holiday in November.", "is_supported": true, "explanation": "Sources states that Veteran's Day falls on November 11th." }, ] ```

# Final instruction Return just the json object in markdown format. Do not include any other text in the response.

37

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

法学硕士法官提示进行证据支持评估（GeneticDiseasesQA）

# 说明 您是声明验证者。您将获得网页中的文本内容以及引用该网页的研究报告中的声明列表。

<<内容>> <<提示>> <<声明>>

对于您提供的每项声明，您将确定其是否得到原始来源内容的支持。对于只有标题的源内容，如果标题表明论文可能与正在考虑的主张相关，则将其判断为“支持性”。返回一个带有单个键“claims”的 JSON 对象，该对象是“claim”对象的列表，每个对象对应研究报告中给出的每个短语。每个“claim”对象包含声明本身（“text”）、一个布尔值“is_supported”（指示引用源内容是否完全支持该声明）和“explain”（它应该是一个字符串，简要解释为什么引用源内容支持或不支持响应。如果提供的源内容完全为空、完全填充网页文本，或者是错误消息或内容过滤器，则为“claims”键输出一个空列表。

# 例子

用户：引用来源的内容：“美国假期包括退伍军人节（11 月 11 日）和万圣节（10 月 31 日）。”

生成的报告中的声明： - “退伍军人节是 11 月的国定假日。”

助理：```json“声明”：[

{

"text": "退伍军人节是 11 月的国定假日。", "is_supported": true, "explanation": "消息来源称退伍军人节是 11 月 11 日。" },] ```

# 最终指令仅返回 markdown 格式的 json 对象。请勿在响应中包含任何其他文本。

37

<!-- page 38 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Response of DR Tulu-8B on GeneticDiseasesQA Part I

USER: Context: Your task is to determine the pathomechanism of a given pathogenic gene variant. A pathogenic variant can lead to different effects. The variant can lead to a loss of function (LoF) of a protein, a toxic gain of function (GoF), or a dominant-negative (DN) effect. Assessing the variant effect can be done by retrieving publications and reports of the variant [...] Question: What is the pathomechanism of variant NM_001127222.2(CACNA1A):c.4174G>A?

Summary of the variant and its identity - The variant NM_001127222.2(CACNA1A):c.4174G>A corresponds to a missense change p.Val1392Met in the CACNA1A alpha 1A subunit and is curated as a pathogenic or likely pathogenic allele in clinical resources, notably ClinVar and the ClinGen allele registry, where it is associated with familial hemiplegic migraine and related neurologic phenotypes <cite id="00907dd4-0">NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) is cataloged as a single-nucleotide variant in ClinVar with the canonical transcript NM_001127222.2</cite> <cite id="00907dd4-4">The ClinGen Allele Registry lists NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) as a registered canonical allele</cite> <cite id="00907dd4-6">MGeND maps NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) to Migraine, familial hemiplegic, 1 (FHM1)</cite>.

Gene-level context: CACNA1A encodes the P/Q-type calcium channel alpha 1A subunit and underlies an autosomal dominant channelopathy spectrum - CACNA1A encodes the pore-forming $\alpha$1A subunit of the high-voltage{activated P/Q-type calcium channel and is a dominant disease gene for three disorders: familial hemiplegic migraine (FHM), episodic ataxia type 2 (EA2), and spinocerebellar ataxia type 6 (SCA6) <cite id="00907dd4-1">Pathogenic variants in CACNA1A are associated with episodic ataxia type 2, familial hemiplegic migraine, and spinocerebellar ataxia 6</cite> <cite id="8169b531-9">The CACNA1A gene was identified for FHM; it encodes the $\alpha$1A subunit of the P/Q-type calcium channel</cite>. - Clinically, affected individuals present on a phenotypic spectrum from migraine with transient hemiplegia/ataxia to persistent cerebellar ataxia and atrophy, consistent with dominant inheritance and variable expressivity <cite id="7a079b1d-9">Mutations in CACNA1A are responsible for at least three autosomal dominant disorders: FHM1, episodic ataxia, and spinocerebellar ataxia</cite> <cite id="7a079b1d-0">CACNA1A-related hemiplegic migraine is associated with neurological variability and requires urgent treatment</cite> <cite id="7a079b1d-7">Clinically, CACNA1A variants are linked to autosomal dominant FHM with cerebellar ataxia</cite>. - Across conditions, both gain-of-function (GoF) and loss-of-function (LoF)/haploinsufficient phenotypes have been described, with FHM commonly linked to

GoF variants affecting channel gating/hyperexcitability and ataxia/SCA6 more often associated with LoF/hypofunction or channel dysfunction leading to neurodegeneration <cite id="8169b531-7">Hemiplegic migraines are associated with particular types of genetic changes in CACNA1A called \gain of function" variants</cite> <cite id="7a079b1d-6">FHM with cerebellar ataxia is only associated with specific CACNA1A mutations that lead to ataxia</cite>. - In broader neurodevelopmental disease, CACNA1A variants have also been reported in epileptic encephalopathy and cognitive/autism phenotypes, underscoring that some pathogenic variants may act through haploinsufficiency or dominant-negative effects in certain contexts <cite id="00907dd4-2">ClinVar Miner notes CACNA1A missense variants in neurodevelopmental conditions</cite> <cite id="00907dd4-5">Reports associate CACNA1A haploinsufficiency with cognitive impairment, autism, and epileptic encephalopathy with mild cerebellar symptoms</cite>.

Figure 22. Example response of DR Tulu-8B on GeneticDiseasesQA Part I

38

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

DR Tulu-8B 对 GeneticDiseasesQA 第 I 部分的响应示例

用户：背景：您的任务是确定给定致病基因变异的病理机制。致病变异可以导致不同的影响。该变异可导致蛋白质功能丧失 (LoF)、毒性功能获得 (GoF) 或显性失活 (DN) 效应。评估变异效应可以通过检索变异的出版物和报告来完成[...]问题：变异NM_001127222.2(CACNA1A):c.4174G>A的病理机制是什么？

变异及其身份摘要 - 变异 NM_001127222.2(CACNA1A):c.4174G>A 对应于 CACNA1A α 1A 亚基中的错义变化 p.Val1392Met，并在临床资源中被视为致病或可能致病等位基因，特别是 ClinVar 和 ClinGen 等位基因注册表，其中它与家族性偏瘫相关偏头痛和相关神经表型 <cite id="00907dd4-0">NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) 在 ClinVar 中被列为单核苷酸变异，其规范转录本为 NM_001127222.2</cite> <cite id="00907dd4-4">ClinGen 等位基因注册表将 NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) 列为已注册的规范等位基因</cite> <cite id="00907dd4-6">MGeND 图谱NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) 至偏头痛，家族性偏瘫，1 (FHM1)</cite>。

基因水平背景：CACNA1A 编码 P/Q 型钙通道 α 1A 亚基，是常染色体显性通道病谱的基础 - CACNA1A 编码高电压{激活的 P/Q 型钙通道的成孔 $\alpha$1A 亚基，是三种疾病的显性疾病基因：家族性偏瘫性偏头痛 (FHM)、阵发性共济失调 2 型 (EA2) 和脊髓小脑性共济失调 6 型 (SCA6) <cite id="00907dd4-1">CACNA1A 的致病性变异与阵发性共济失调 2 型、家族性偏瘫性偏头痛和脊髓小脑性共济失调 6 相关</cite> <cite id="8169b531-9">CACNA1A 基因已被鉴定为 FHM；它编码 ​​P/Q 型钙通道的 $\alpha$1A 亚基</cite>。 - 临床上，受影响的个体表现出从偏头痛伴短暂性偏瘫/共济失调到持续性小脑共济失调和萎缩的表型谱，与显性遗传和可变表达性一致 <cite id="7a079b1d-9">CACNA1A 突变导致至少三种常染色体显性遗传性疾病：FHM1、阵发性共济失调和脊髓小脑共济失调</cite> <cite id="7a079b1d-0">CACNA1A 相关的偏瘫性偏头痛与神经变异有关，需要紧急治疗</cite> <cite id="7a079b1d-7">临床上，CACNA1A 变异与常染色体显性 FHM 伴小脑性共济失调有关</cite>。 - 在不同条件下，功能获得 (GoF) 和功能丧失 (LoF)/单倍体不足表型均已被描述，其中 FHM 通常与

影响通道门控/过度兴奋性和共济失调/SCA6 的 GoF 变异更常与 LoF/功能减退或导致神经变性的通道功能障碍相关<cite id="8169b531-7">偏瘫偏头痛与 CACNA1A 中称为“功能获得”变异的特定类型遗传变化相关</cite> <cite id="7a079b1d-6">FHM 仅与小脑性共济失调相关具有导致共济失调的特定 CACNA1A 突变</cite> - 在更广泛的神经发育疾病中，癫痫性脑病和认知/自闭症表型中也有 CACNA1A 变异的报道，这强调了某些致病变异可能在某些情况下通过单倍体不足或显性失活效应发挥作用 <cite id="00907dd4-2">ClinVar Miner 指出神经发育中的 CACNA1A 错义变异。条件</cite> <cite id="00907dd4-5">报告将 CACNA1A 单倍体不足与认知障碍、自闭症和伴有轻度小脑症状的癫痫性脑病联系起来</cite>。

图 22. DR Tulu-8B 对 GeneticDiseasesQA 第 I 部分的响应示例

38

<!-- page 39 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Response of DR Tulu-8B on GeneticDiseasesQA Part II

Variant-specific evidence and phenotype triangulation for p.Val1392Met (c.4174G>A) - The p.Val1392Met change in CACNA1A is curated as pathogenic/likely pathogenic for FHM and, in some families, associated with persistent cerebellar ataxia and atrophy, aligning with a dominant gain-of-toxic-function mechanism that perturbs neuronal excitability (migraine) and, in some cases, contributes to neurodegeneration <cite id="00907dd4-0">ClinVar classifies NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met)</cite> <cite id="7a079b1d-9">FHM and ataxia phenotypes are both

linked to CACNA1A mutations in an autosomal dominant framework</cite> <cite id="7a079b1d-6">FHM with cerebellar ataxia is only associated with certain CACNA1A mutations</cite>. - Population and registry compilations include c.4174G>A among pathogenic CACNA1A variants, reinforcing its role in the dominant channelopathy spectrum; however, direct electrophysiological characterization of this specific variant (e.g., activation voltage, Ca2+ influx, inactivation) is not provided in the retrieved summaries and would require targeted functional assays <cite id="00907dd4-9">Variant catalogs list NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) among pathogenic CACNA1A variants</cite> <cite id="8169b531-8">Clinical-genetic characterization of CACNA1A-related disease summarizes dominant phenotypes across FHM, EA2, and SCA6</cite>.

Applying the criteria to determine pathomechanism - Dominant inheritance and autosomal transmission across FHM, EA2, and SCA6 support a dominant mechanism at the gene{phenotype level for CACNA1A variants <cite id="7a079b1d-9">CACNA1A-related disorders are autosomal dominant</cite>. - For pathomechanism, CACNA1A variants can act as GoF (hyperexcitability/channel dysfunction causing migraine) or LoF/haploinsufficient (reduced channel function leading to ataxia/degeneration), with some variants producing mixed or variable phenotypes depending on domain impact and genetic background <cite id="8169b531-7">FHM is associated with gain-of-function variants in CACNA1A</cite> <cite id="7a079b1d-6">FHM with cerebellar ataxia is specifically associated with certain CACNA1A mutations that lead to ataxia</cite> <cite id="00907dd4-5">Haploinsufficiency in CACNA1A has been linked to neurodevelopmental phenotypes</cite>. - When both GoF and LoF mechanisms are plausible at the gene level, the variant’s phenotype and inheritance refine the likely mechanism. In FHM, transient neurologic deficits and aura point to a dominant gain-of-toxic-function mechanism in sensory-motor cortical circuits; in EA2/SCA6, persistent ataxia and cerebellar atrophy point to reduced channel function or progressive neurodegeneration, consistent with LoF/haploinsufficiency or dominant-negative effects in cerebellar pathways <cite id="8169b531-7">Hemiplegic migraine variants are labeled as gain-of-function</cite> <cite id="7a079b1d-6">Cerebellar ataxia in FHM is linked to specific CACNA1A mutations</cite>. - Given that p.Val1392Met is cataloged as pathogenic for FHM and associated with cerebellar ataxia/atrophy in some pedigrees, the most parsimonious pathomechanism is a dominant gain-of-toxic-function effect on neuronal excitability that drives migraine, with possible additional contributions to cerebellar dysfunction via haploinsufficiency or dominant-negative effects in cerebellar circuits, depending on genetic background and penetrance <cite id="00907dd4-0">ClinVar catalogs p.Val1392Met as a pathogenic CACNA1A variant</cite> <cite id="7a079b1d-9">Autosomal dominant inheritance and variable phenotypes across FHM, EA2, and SCA6 are established</cite> <cite id="00907dd4-5">Haploinsufficiency in CACNA1A contributes to neurodevelopmental disease</cite>.

Figure 23. Example response of DR Tulu-8B on GeneticDiseasesQA Part II

39

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

DR Tulu-8B 对 GeneticDiseasesQA 第 II 部分的响应示例

p.Val1392Met (c.4174G>A) 的变体特异性证据和表型三角测量 - CACNA1A 中的 p.Val1392Met 变化被认为是 FHM 的致病性/可能致病性，并且在某些家族中与持续性小脑共济失调和萎缩相关，与扰乱神经元兴奋性的显性毒性功能获得机制相一致（偏头痛），并且在某些情况下会导致神经退行性<cite id="00907dd4-0">ClinVar 分类 NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met)</cite> <cite id="7a079b1d-9">FHM 和共济失调表型都是

与常染色体显性框架中的 CACNA1A 突变相关</cite> <cite id="7a079b1d-6">伴有小脑性共济失调的 FHM 仅与某些 CACNA1A 突变相关</cite>。 - 群体和登记汇编包括致病性 CACNA1A 变异中的 c.4174G>A，加强了其在主要通道病谱中的作用；然而，检索到的摘要中未提供该特定变体的直接电生理学特征（例如激活电压、Ca2+ 流入、失活），需要进行有针对性的功能测定<cite id="00907dd4-9">变体目录列表 NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) 致病性CACNA1A 变异</cite> <cite id="8169b531-8">CACNA1A 相关疾病的临床遗传特征总结了 FHM、EA2 和 SCA6 的显性表型</cite>。

应用标准确定病理机制 - FHM、EA2 和 SCA6 之间的显性遗传和常染色体传递支持 CACNA1A 变异在基因{表型水平上的显性机制<cite id="7a079b1d-9">CACNA1A 相关疾病是常染色体显性遗传</cite>。 - 对于病理机制，CACNA1A 变体可以充当 GoF（过度兴奋/通道功能障碍导致偏头痛）或 LoF/单倍体不足（通道功能减少导致共济失调/变性），一些变体根据结构域影响和遗传背景产生混合或可变表型<cite id="8169b531-7">FHM 与 CACNA1A 中的功能获得变体相关</cite> <cite id="7a079b1d-6">伴有小脑性共济失调的 FHM 与导致共济失调的某些 CACNA1A 突变特别相关</cite> <cite id="00907dd4-5">CACNA1A 的单倍体不足与神经发育表型相关</cite>。 - 当 GoF 和 LoF 机制在基因水平上都合理时，变体的表型和遗传会完善可能的机制。在 FHM 中，短暂的神经功能缺损和先兆表明感觉运动皮层回路中的主要毒性功能获得机制；在 EA2/SCA6 中，持续性共济失调和小脑萎缩表明通道功能降低或进行性神经变性，与小脑通路中的 LoF/单倍剂量不足或显性负性效应一致 <cite id="8169b531-7">偏瘫偏头痛变异被标记为功能获得</cite> <cite id="7a079b1d-6">FHM 中的小脑共济失调与特定的 CACNA1A 突变相关</cite>。 - 鉴于 p.Val1392Met 被列为 FHM 致病性，并与某些谱系中的小脑共济失调/萎缩相关，最简约的病理机制是对驱动偏头痛的神经元兴奋性的主要毒性功能增益效应，并且可能通过小脑回路中的单倍体不足或显性负性效应对小脑功能障碍产生额外贡献，具体取决于遗传背景和外显率<引用id="00907dd4-0">ClinVar 将 p.Val1392Met 列为致病性 CACNA1A 变异</cite> <cite id="7a079b1d-9">建立了 FHM、EA2 和 SCA6 的常染色体显性遗传和可变表型</cite> <cite id="00907dd4-5">CACNA1A 中的单倍体不足导致神经发育疾病</cite>。

图 23. DR Tulu-8B 对 GeneticDiseasesQA 第 II 部分的响应示例

39

<!-- page 40 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Response of DR Tulu-8B on GeneticDiseasesQA Part III

Uncertainties and what functional studies would resolve them - The retrieved evidence establishes the variant’s identity, clinical classification, and the gene’s dominant channelopathy framework, but does not provide direct patch-clamp or Ca2+ imaging data for p.Val1392Met. Therefore, while a dominant gain-of-toxic-function mechanism is most consistent with FHM presentation and gene-level GoF associations, we cannot exclude a dominant-negative or partial haploinsufficient contribution without direct tests <cite id="8169b531-8">Clinical and genetic characterization supports dominant mechanisms but lacks variant-specific electrophysiology</cite>. - To conclusively classify the mechanism for c.4174G>A (p.Val1392Met), the following functional evidence would be decisive:

- Heterologous expression studies in HEK293 or Xenopus oocytes measuring Ca2+ current amplitude, activation/dactivation kinetics, voltage dependence, inactivation, and pharmacology, with rescue by wild-type co-expression to test for dominant-negative effects <cite id="00907dd4-9">Variant catalogs emphasize the need for functional characterization for CACNA1A missense variants</cite>. - Neuronal action potential and neurotransmitter release assays in cerebellar Purkinje cells or cortical neurons to quantify excitability changes and test for GoF vs LoF phenotypes <cite id="8169b531-9">CACNA1A encodes the P/Q-type channel critical for neurotransmitter release and neuronal excitability</cite>. - Human induced pluripotent stem cell{derived neurons or patient-specific cerebellar organoids to assess developmental Ca2+ signaling and degeneration kinetics in LoF vs GoF contexts <cite id="00907dd4-5">Reports link CACNA1A haploinsufficiency to neurodevelopmental phenotypes, supporting developmental functional assays</cite>. - Trans-heterozygosity testing in models (e.g., LoF knockouts) to probe dominant-negative interactions specific to p.Val1392Met <cite id="7a079b1d-6">FHM with cerebellar ataxia is associated with specific CACNA1A mutations suggesting gene-dose interactions</cite>.

Final assessment for NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) - Pathomechanism: Dominant gain-of-toxic-function in the neuronal excitability pathway is the most consistent explanation for p.Val1392Met, given its classification as a pathogenic FHM variant and the gene’s GoF-linked channelopathy basis for migraine; in some pedigrees with cerebellar ataxia/atrophy, additional haploinsufficient or dominant-negative contributions in cerebellar pathways may contribute, yielding a mixed mechanism across brain regions and genetic backgrounds <cite id="00907dd4-0">ClinVar classifies p.Val1392Met as pathogenic in CACNA1A</cite> <cite id="8169b531-7">FHM is associated with gain-of-function CACNA1A variants</cite> <cite id="7a079b1d-6">Cerebellar ataxia in FHM is associated with specific CACNA1A mutations, suggesting multi-domain effects</cite> <cite id="00907dd4-5">Haploinsufficiency in CACNA1A is linked to neurodevelopmental phenotypes</cite>. - Practical implication: In clinical contexts where CACNA1A pathogenic variants are known to act dominantly and cause FHM with possible cerebellar involvement, c.4174G>A (p.Val1392Met) should be considered to confer a dominant gain-of-function (toxic) effect on P/Q-type Ca2+ channel{mediated neurotransmission, with possible

additive/penetrant haploinsufficient effects in cerebellar pathways in affected families <cite id="7a079b1d-9">Autosomal dominant inheritance and variable phenotypes across migraine and ataxia are established for CACNA1A</cite> <cite id="8169b531-7">Gain-of-function mechanism is characteristic of FHM-associated CACNA1A variants</cite>.

Figure 24. Example response of DR Tulu-8B on GeneticDiseasesQA Part III

40

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

DR Tulu-8B 对 GeneticDiseasesQA 第 III 部分的反应示例

不确定性以及哪些功能研究可以解决这些问题 - 检索到的证据确定了变异的身份、临床分类和基因的主要通道病框架，但没有提供 p.Val1392Met 的直接膜片钳或 Ca2+ 成像数据。因此，虽然显性毒性功能获得机制与 FHM 表现和基因水平 GoF 关联最为一致，但在没有直接测试的情况下，我们不能排除显性失活或部分单倍体不足的贡献<cite id="8169b531-8">临床和遗传特征支持显性机制，但缺乏变异特异性电生理学</cite>。 - 为了对 c.4174G>A (p.Val1392Met) 的机制进行最终分类，以下功能证据将是决定性的：

- HEK293 或非洲爪蟾卵母细胞中的异源表达研究，测量 Ca2+ 电流幅度、激活/失活动力学、电压依赖性、失活和药理学，并通过野生型共表达进行救援以测试显性负效应<cite id="00907dd4-9">变体目录强调需要对 CACNA1A 错义变体进行功能表征</cite>。 - 小脑浦肯野细胞或皮质神经元中的神经元动作电位和神经递质释放测定，以量化兴奋性变化并测试 GoF 与 ​​LoF 表型 <cite id="8169b531-9">CACNA1A 编码对神经递质释放和神经元兴奋性至关重要的 P/Q 型通道</cite>。 - 人类诱导多能干细胞{衍生的神经元或患者特异性小脑类器官，用于评估 LoF 与 ​​GoF 背景下的发育 Ca2+ 信号传导和变性动力学<cite id="00907dd4-5">报告将 CACNA1A 单倍体不足与神经发育表型联系起来，支持发育功能测定</cite>。 - 在模型中进行跨杂合性测试（例如 LoF 敲除），以探测 p.Val1392Met 特异的显性失活相互作用<cite id="7a079b1d-6">小脑性共济失调的 FHM 与特定 CACNA1A 突变相关，表明基因剂量相互作用</cite>。

对 NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) 的最终评估 - 病理机制：神经元兴奋性途径中毒性功能的显性获得是对 p.Val1392Met 最一致的解释，因为它被分类为致病性 FHM 变异，并且该基因的 GoF 相关通道病基础是偏头痛的基础；在一些患有小脑共济失调/萎缩的家系中，小脑通路中额外的单倍体不足或显性负性贡献可能有所贡献，从而产生跨大脑区域和遗传背景的混合机制 <cite id="00907dd4-0">ClinVar 将 p.Val1392Met 分类为 CACNA1A 致病性</cite> <cite id="8169b531-7">FHM 相关具有功能获得性 CACNA1A 变异</cite> <cite id="7a079b1d-6">FHM 中的小脑共济失调与特定的 CACNA1A 突变相关，表明多域效应</cite> <cite id="00907dd4-5">CACNA1A 中的单倍剂量不足与神经发育表型相关</cite>。 - 实际意义：在已知 CACNA1A 致病性变异起主导作用并导致可能累及小脑的 FHM 的临床背景下，应考虑 c.4174G>A (p.Val1392Met) 对 P/Q 型 Ca2+ 通道{介导的神经传递产生显着的功能获得（毒性）效应，并可能导致

受影响家族中小脑通路的加性/渗透单倍体不足<cite id="7a079b1d-9">针对 CACNA1A 建立了常染色体显性遗传以及偏头痛和共济失调的可变表型</cite> <cite id="8169b531-7">功能获得机制是 FHM 相关 CACNA1A 变体的特征</cite>。

图 24. DR Tulu-8B 对 GeneticDiseasesQA 第 III 部分的响应示例

40

<!-- page 41 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Response of DR Tulu-8B on GeneticDiseasesQA Part IV

Evidence gaps and recommendations - Direct functional characterization of p.Val1392Met remains to be reported in the retrieved literature; thus, further mechanistic studies (as outlined above) are warranted to exclude or confirm dominant-negative or LoF contributions and to delineate the variant’s phenotype{mechanism continuum within the CACNA1A spectrum of disease <cite id="8169b531-8">Clinical-genetic summaries highlight the need for functional follow-up of CACNA1A missense variants</cite> <cite id="00907dd4-9">Variant catalogs emphasize the presence of pathogenic missense variants across neurological conditions and the need for functional characterization</cite>.

Cited texts: [00907dd4-0]: Title: NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met ... - NCBI [00907dd4-4]: Title: CA242642 - Allele Registry - ClinGen [00907dd4-6]: Title: Annotation Detail : MGeND [00907dd4-1]: Title: Clinical and genetic characterization of CACNA1A-related disease [8169b531-9]: Title: CACNA1A gene mutations in familial hemiplegic migraine [7a079b1d-9]: Title: Two distinct phenotypes, hemiplegic migraine and episodic Ataxia ... [7a079b1d-0]: Title: Hemiplegic Migraine Variant List - CACNA1A Foundation [7a079b1d-7]: Title: Next-generation sequencing identified a novel CACNA1A I1379F ... [8169b531-7]: Title: CACNA1A-Related Disorders - Children's Hospital of Philadelphia [7a079b1d-6]: Title: [Familial hemiplegic migraine] - PubMed - PMID:15775664 [00907dd4-2]: Title: Submissions for variant NM_001127222.2(CACNA1A):c.4174G>T [00907dd4-5]: Title: LOC126862864 Gene - GeneCards - GeneCards [00907dd4-9]: Title: Total 90 pathogenic variants reported for Spinocerebellar ataxia type 6 [8169b531-8]: Title: Clinical and genetic characterization of CACNA1A-related disease

Figure 25. Example response of DR Tulu-8B on GeneticDiseasesQA Part IV

41

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

DR Tulu-8B 对 GeneticDiseasesQA 第 IV 部分的反应示例

证据差距和建议 - p.Val1392Met 的直接功能表征仍有待在检索到的文献中报告；因此，有必要进行进一步的机制研究（如上所述），以排除或确认显性失活或 LoF 贡献，并描绘 CACNA1A 疾病谱中变异的表型{机制连续体<cite id="8169b531-8">临床遗传总结强调需要对 CACNA1A 错义变异进行功能随访</cite> <cite id="00907dd4-9">变异目录强调神经系统疾病中致病性错义变异的存在以及功能表征的需要</cite>。

引用文本：[00907dd4-0]：标题：NM_001127222.2（CACNA1A）：c.4174G>A（p.Val1392Met ... - NCBI [00907dd4-4]：标题：CA242642 - 等位基因注册表 - ClinGen [00907dd4-6]：标题：注释详细信息： MGeND [00907dd4-1]：标题：CACNA1A 相关疾病的临床和遗传特征[8169b531-9]：标题：家族性偏瘫性偏头痛中的 CACNA1A 基因突变[7a079b1d-9]：标题：两种不同的表型，偏瘫性偏头痛和发作性共济失调...[7a079b1d-0]：标题：偏瘫性偏头痛变异列表 - CACNA1A 基金会 [7a079b1d-7]：标题：下一代测序鉴定出一种新型 CACNA1A I1379F ... [8169b531-7]：标题：CACNA1A 相关疾病 - 费城儿童医院 [7a079b1d-6]：标题：[家族性偏瘫性偏头痛] - PubMed - PMID：15775664 [00907dd4-2]：标题：变体 NM_001127222.2（CACNA1A）：c.4174G>T [00907dd4-5]：标题：LOC126862864 基因 - GeneCards - GeneCards [00907dd4-9]：标题：总计报告了 6 型脊髓小脑共济失调的 90 种致病变异 [8169b531-8]：标题：CACNA1A 相关疾病的临床和遗传特征

图 25. DR Tulu-8B 对 GeneticDiseasesQA 第 IV 部分的响应示例

41

<!-- page 42 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

AstaBench-ScholarQA-CS2 (SQAv2) DeepResearchBench (DRB) Rubric Answer Cite-P Cite-R Comp Depth Instruction Readability

Closed Deep Research

Claude-Sonnet Search - - - - 39.0 37.7 45.8 41.5 Perplexity Sonar - - - - 37.4 36.1 45.7 44.7 Perplexity DR 91.6 92.7 47.3 37.6 40.7 39.3 46.4 44.3 Gemini Deep Research - - - - 48.5 48.5 49.2 49.4 Gemini3 Pro + Search 83.1 98.3 68.5 29.4 43.4 44.9 49.8 49.0 GPT-5 + Search 92.3 93.8 67.8 45.6 49.7 51.5 51.6 48.5 GPT-5 + Our Search 74.9 93.2 42.5 33.7 26.7 21.3 41.0 29.4 OpenAI DR 91.5 95.6 77.4 43.1 46.8 45.2 49.2 47.1

Naive RAG Qwen3-8B 69.2 92.3 - - 29.4 27.0 40.2 41.1 QwQ-32B 77.5 90.3 - - 38.1 34.8 47.0 44.6

Open Deep Research Search-R1-7B 9.7 79.0 - - 5.2 2.1 18.6 16.8 ASearcher-7B 13.7 94.0 - - 5.1 1.7 15.2 11.8 WebExplorer-8B 78.6 91.4 - - 33.7 28.5 45.7 42.2 WebThinker-32B-DPO 36.7 94.9 - - 19.7 12.3 36.8 26.3 Tongyi DeepResearch-30B-A3B 89.5 96.4 - - 39.1 34.3 46.8 45.4

Fixed Pipeline Deep Research WebThinker QwQ-32B (report) 86.4 94.3 - - 36.2 32.6 43.2 42.9 WebThinker-32B-DPO (report) 91.2 95.5 - - 39.4 35.4 46.0 43.5 Ai2 ScholarQA - Claude Sonnet 88.1 89.1 92.4 81.2 35.1 32.0 40.5 38.9

Open Deep Research (Ours) Qwen3-8B + Our Search 42.8 92.1 53.7 40.3 14.3 8.7 29.5 24.4 DR Tulu-8B (SFT) 81.4 91.0 65.3 51.6 36.3 35.3 45.5 39.5 DR Tulu-8B (RL) 92.4 98.8 90.5 71.6 44.2 44.5 49.4 42.4

Table 11. Performance breakdown for Asta-ScholarQA-CS2 and DeepResearchBench. Open deep research models and naive RAG

baselines do not provide citations, indicated as “-” in citation columns. Rows with a gray background indicate models that use closed models as backbone LMs. Bold indicates the best results among the baselines that do not use propriety models.

Answer Length Citations Tool Calls Cost / Query*

GPT-5+ Search 2358.7 28.1 - 0.29 OpenAI Deep Research 6445.1 79.6 - 1.8 Gemini 3 Pro + Search 1310.9 8.6 8.5 0.13 Ai2 ScholarQA - Claude Sonnet 2090.5 61.2 1.0 1.3 WebExplorer-8B 1250.4 - 9.1 0.019 WebThinker-32B 92.2 - 6.9 0.0037 WebThinker-32B (report) 4416.7 - 8.2 0.015 Tongyi Deep Research-30B-A3B 2138.9 - 23.0 0.032 DR Tulu-8B (RL) 1889.2 35.8 4.3 0.0019

Table 12. Comparison of model usage statistics on SQAv2. We report answer lengths, tool usage, and citation counts across systems. “-”

denotes this information was either not available or it was not applicable. The cost per query is estimated based on model inference on ScholarQA-CS2, following (Bragg et al., 2025). More details of cost estimations are available in Appendix I.5.

for further SFT. We show the results in Figure 5 (left), comparing using the on-policy-trained model as a starting point for RL relative to our original SFT set, an undertrained model, or using no SFT at all. While the on-policy SFT slightly boosts SFT model performance, we find it ultimately weakens performance later on during RL training, underperforming using our regular SFT mixture on Healthbench and SQAv2.

42

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

AstaBench-ScholarQA-CS2 (SQAv2) DeepResearchBench (DRB) Rubric 答案 Cite-P Cite-R Comp 深度 指令可读性

封闭式深度研究

克劳德十四行诗搜索 - - - - 39.0 37.7 45.8 41.5 困惑声纳 - - - - 37.4 36.1 45.7 44.7 困惑 DR 91.6 92.7 47.3 37.6 40.7 39.3 46.4 44.3 双子座深度研究 - - - - 48.5 48.5 49.2 49.4 Gemini3 Pro + 搜索 83.1 98.3 68.5 29.4 43.4 44.9 49.8 49.0 GPT-5 + 搜索 92.3 93.8 67.8 45.6 49.7 51.5 51.6 48.5 GPT-5 + 我们的搜索 74.9 93.2 42.5 33.7 26.7 21.3 41.0 29.4 OpenAI DR 91.5 95.6 77.4 43.1 46.8 45.2 49.2 47.1

朴素 RAG Qwen3-8B 69.2 92.3 - - 29.4 27.0 40.2 41.1 QwQ-32B 77.5 90.3 - - 38.1 34.8 47.0 44.6

开放深度研究搜索-R1-7B 9.7 79.0 - - 5.2 2.1 18.6 16.8 ASearcher-7B 13.7 94.0 - - 5.1 1.7 15.2 11.8 WebExplorer-8B 78.6 91.4 - - 33.7 28.5 45.7 42.2 WebThinker-32B-DPO 36.7 94.9 - - 19.7 12.3 36.8 26.3 统一深研-30B-A3B 89.5 96.4 - - 39.1 34.3 46.8 45.4

固定管道深度研究 WebThinker QwQ-32B（报告） 86.4 94.3 - - 36.2 32.6 43.2 42.9 WebThinker-32B-DPO（报告） 91.2 95.5 - - 39.4 35.4 46.0 43.5 Ai2 ScholarQA - Claude Sonnet 88.1 89.1 92.4 81.2 35.1 32.0 40.5 38.9

开放深度研究（我们的） Qwen3-8B + 我们的搜索 42.8 92.1 53.7 40.3 14.3 8.7 29.5 24.4 DR Tulu-8B (SFT) 81.4 91.0 65.3 51.6 36.3 35.3 45.5 39.5 DR Tulu-8B (RL) 92.4 98.8 90.5 71.6 44.2 44.5 49.4 42.4

表 11.Asta-ScholarQA-CS2 和 DeepResearchBench 的性能细分。开放深度研究模型和朴素的 RAG

基线不提供引文，在引文栏中用“-”表示。灰色背景的行表示使用封闭模型作为骨干 LM 的模型。粗体表示不使用专有模型的基线中的最佳结果。

答案长度 引文工具调用 成本/查询*

GPT-5+ 搜索 2358.7 28.1 - 0.29 OpenAI 深度研究 6445.1 79.6 - 1.8 Gemini 3 Pro + 搜索 1310.9 8.6 8.5 0.13 Ai2 ScholarQA - 克劳德 Sonnet 2090.5 61.2 1.0 1.3 WebExplorer-8B 1250.4 - 9.1 0.019 WebThinker-32B 92.2 - 6.9 0.0037 WebThinker-32B（报告） 4416.7 - 8.2 0.015 统一深度研究-30B-A3B 2138.9 - 23.0 0.032 DR Tulu-8B (RL) 1889.2 35.8 4.3 0.0019

表 12. SQAv2 上模型使用统计数据的比较。我们报告跨系统的答案长度、工具使用情况和引用计数。 “——”

表示此信息不可用或不适用。每个查询的成本是根据 ScholarQA-CS2 上的模型推断来估计的，如下（Bragg 等人，2025）。有关成本估算的更多详细信息，请参阅附录 I.5。

进行进一步的 SFT。我们在图 5（左）中展示了结果，将使用策略训练模型作为 RL 起点与我们的原始 SFT 集、训练不足的模型或根本不使用 SFT 进行比较。虽然策略上的 SFT 稍微提升了 SFT 模型的性能，但我们发现它最终会在 RL 训练期间削弱性能，在 Healthbench 和 SQAv2 上使用我们的常规 SFT 混合时表现不佳。

42

<!-- page 43 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

12000

5

9

8

10000

4

7

8000

3

Output Length

6

Overall Reward

Num. Tool Calls

0K 1K 2K 3K 4K

0K 1K 2K 3K 4K

0K 1K 2K 3K 4K

Training Steps

Figure 26. Overall reward, output length (in tokens, including tool outputs), and average number of tool calls during RL training.

Note that during the run, we periodically ran out of serper credits, causing a rise tool errors until we refilled the account, causing a drop in reward and output length, and a rise in tool calls (as the model retried the failed calls). This happened a few times during the run. We also found that reward jumped sharply around step 2000 after a run restart.

HealthBench ResearchQA SQAv2 DRB Average

w/ citation reward 42.7 71.0 86.4 42.1 60.6 w/o citation reward 44.7 71.9 86.7 41.4 61.2

Table 13. Ablation on the citation reward. Both runs branch from a shared checkpoint at step 650 (when RL starts to show clear gains

on long-form benchmarks) and continue through step 1300 with identical hyperparameters; the only difference is whether the citation reward is enabled. Disabling the citation reward in the later phase of training does not hurt overall performance and slightly improves the average score, suggesting that the rubric component of RLER, rather than the citation auxiliary signal, drives the gains.

I.4. Ablation on the Citation Reward

To isolate the contribution of the evolving rubric reward from the auxiliary citation reward used during RL training, we run an ablation that branches from a shared checkpoint at step 650 (the point at which RL begins to show clear gains on the long-form benchmarks) into two runs with identical hyperparameters through step 1300: one with the citation reward enabled (w/ cite) and one without (w/o cite). As shown in Table 13, the two runs achieve comparable final performance, with w/o cite slightly ahead on average (61.2 vs. 60.6). This indicates that the citation reward is not the source of RLER’s gains in this regime, and that the rubric-based reward is responsible for the bulk of the improvement. We additionally observe that the format reward saturates at 1.0 early in training and contributes little signal beyond the warmup phase. Combined with the RLER on/off ablation in Figure 6, these results suggest that RLER, rather than the auxiliary rewards, is the main source of our gains, although a full factorial sweep over auxiliary rewards is beyond our compute budget.

I.5. Cost Estimation

In this section, we detail how we estimate the cost of deep research models. Detailed cost comparison can be found in Table 12.

For proprietary models, we use the actual billed costs reported in their API consoles. Although Gemini 3 + Search waives the first 1,500 searches per day,11 we still include search costs in our estimates for a fair comparison with other systems that charge for search.

For open models (including our own), we compute the number of input and output tokens and use OpenRouter’s published pricing to estimate inference costs. Specifically, we use the published pricing for Tongyi Deep Research12; we use the published pricing for Qwen3-8B for DR Tulu, WebExplorer-8B, ASearcher13; We we use the published pricing for QwQ-32B for WebThinker models14. We treat system prompts and questions as input tokens, and all remaining tokens as output tokens in our calculations for open models. We also add tool-call costs based on the pricing of each tool’s API provider and the average number of tool calls performed by each model across our long-form evaluations.

11https://ai.google.dev/gemini-api/docs/pricing?hl=en 12Tongyi Deep Research costs USD 0.09 per input token and USD 0.4 per output token as of Nov 23 2025. 13Qwen3-8B costs USD 0.2 per input and output token as of Nov 23 2025. 14QwQ-32B costs USD 0.4 per input and output token as of Nov 23 2025.

43

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

12000

5

9

8

10000

4

7

8000

3

输出长度

6

整体奖励

编号。工具调用

0K 1K 2K 3K 4K

0K 1K 2K 3K 4K

0K 1K 2K 3K 4K

训练步骤

图 26. RL 训练期间的总体奖励、输出长度（以令牌为单位，包括工具输出）和平均工具调用次数。

请注意，在运行过程中，我们会定期耗尽 serper 积分，从而导致工具错误增加，直到我们重新填充帐户为止，从而导致奖励和输出长度下降，以及工具调用增加（当模型重试失败的调用时）。这种情况在跑步过程中发生过几次。我们还发现，在运行重新启动后，奖励在 2000 步左右急剧跃升。

HealthBench ResearchQA SQAv2 DRB 平均值

有引用奖励 42.7 71.0 86.4 42.1 60.6 无引用奖励 44.7 71.9 86.7 41.4 61.2

表 13. 引用奖励的消融。两者都在步骤 650 处从共享检查点运行分支（当 RL 开始显示出明显的增益时）

在长格式基准上）并使用相同的超参数继续执行步骤 1300；唯一的区别是是否启用了引用奖励。在训练后期禁用引文奖励不会损害整体表现，并且会略微提高平均分数，这表明 RLER 的标题组件（而不是引文辅助信号）驱动了增益。

I.4。引文奖励的消融

为了将不断演变的标题奖励与 RL 训练期间使用的辅助引用奖励分开，我们运行了一种消融，该消融从步骤 650 处的共享检查点（RL 开始在长格式基准上显示出明显增益的点）分支到步骤 1300 处具有相同超参数的两次运行：一次启用了引用奖励（w/ cite），另一次没有启用（w/o cite）。如表 13 所示，两次运行实现了可比的最终性能，平均无引用略有领先（61.2 比 60.6）。这表明引用奖励并不是 RLER 在此制度下收益的来源，而基于标题的奖励才是大部分改进的原因。我们还观察到，格式奖励在训练早期饱和于 1.0，并且在热身阶段之后几乎没有提供任何信号。结合图 6 中的 RLER 开/关消融，这些结果表明 RLER，而不是辅助奖励，是我们收益的主要来源，尽管对辅助奖励的完整阶乘扫描超出了我们的计算预算。

I.5。成本估算

在本节中，我们详细介绍如何估计深度研究模型的成本。详细成本比较见表12。

对于专有模型，我们使用其 API 控制台中报告的实际计费成本。尽管 Gemini 3 + 搜索放弃了每天前 1,500 次搜索，11我们仍然将搜索成本纳入我们的估算中，以便与其他搜索收费系统进行公平比较。

对于开放模型（包括我们自己的模型），我们计算输入和输出令牌的数量，并使用 OpenRouter 发布的定价来估计推理成本。具体来说，我们使用统一深度研究12公布的定价；我们使用 DR Tulu、WebExplorer-8B、ASearcher13 的 Qwen3-8B 的已发布定价；我们使用 WebThinker 型号的 QwQ-32B 的已发布定价14。在开放模型的计算中，我们将系统提示和问题视为输入标记，并将所有剩余标记视为输出标记。我们还根据每个工具的 API 提供商的定价以及每个模型在我们的长式评估中执行的平均工具调用次数来添加工具调用成本。

11https://ai.google.dev/gemini-api/docs/pricing?hl=en 12截至 2025 年 11 月 23 日，统一深度研究每个输入代币的成本为 0.09 美元，每个输出代币的成本为 0.4 美元。截至 2025 年 11 月 23 日，13Qwen3-8B 每个输入和输出代币的成本为 0.2 美元。14QwQ-32B 每个输入和输出代币的成本为 0.4 美元，如下： 2025 年 11 月 23 日。

43

<!-- page 44 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

HealthBench

DRB

SQAv2

ResearchQA

47.5

85

41

45.0

70

40

42.5

68

80

39

40.0

66

Score (%)

37.5

38

75

64

35.0

37

5 10 15 Max tool calls

5 10 15 Max tool calls

5 10 15 Max tool calls

5 10 15 Max tool calls

SFT RL

Figure 27. Ablations on maximum tool calls. We evaluate DR Tulu (SFT) and DR Tulu (RL; 1900 steps) on four long-form datasets while varying the maximum number of allowed tool calls from 1 to 15, and report how performance changes under these caps.

Top-K Snippets

Top-K Snippets

Metric 1 3 5 10

Metric 1 3 5 10

set same 0.77 2.04 3.34 6.01 pos match 0.77 1.71 2.22 2.93

set same 0.88 2.53 4.20 7.67 pos match 0.88 2.35 3.48 5.64

(a) One-week apart

(b) Within a short interval

Table 14. Search engine output variance across repeated queries. The left table shows results when two queries were issued one week

apart, while the right table shows results when the two queries were issued within a short interval.

I.6. Effect of the tool-call budget at inference time.

We studied how the inference-time tool-call budget affects performance by varying the maximum number of allowed tool calls to {1,3,5,10,15}. For both SFT and RL models, performance typically saturates around a budget of five tool calls, although RL occasionally improves with an additional budget of up to ten tool calls; see Figure 27. This matches tool call behavior seen during RL training (Appendix I.2), in which the model uses 3-4 tool calls on average per sample.

I.7. Evaluation Variances

The inference and evaluation of deep research models often exhibit significant variance. When running models on the same questions or evaluating them on the same benchmarks, the results can vary substantially. Typically, there are three key factors that contribute to this variance and we will discuss them in the following sections.

I.7.1. VARIANCES INTRODUCED BY TOOLS

Invoking a tool with identical inputs at different times can yield inconsistent outputs, leading the model to produce divergent subsequent contexts. In this section, we focus on the output variance introduced by the search engine.

We sampled 100 function-calling queries and reissued these queries to the Google search engine, with approximately one week between the two invocations. We then computed the differences in the top-1, top-3, top-5, and top-10 retrieved snippets for each pair of calls. For comparison, we also measured the differences between two calls issued nearly at the same time. We use the following metrics to evaluate the variance of search engines’ returns.

• set same: The number of shared items within the top-k results, regardless of order (i.e., the size of the intersection).

• pos match: The number of positions in the top-k where both lists contain the same item at the same rank.

As shown in Table 14, the search engine’s returns are unstable. Even when calling the same query within a short interval, it still produces noticeably different results. The average overlap in the top-10 snippets is only about 7.67, with exact rank matches dropping to 5.64. When the same queries are reissued one week apart, the search engine’s returns diverge more significantly. We show examples of inconsistencies in Figure 28.

44

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

健康台

DRB

SQAv2

研究质量保证

47.5

85

41

45.0

70

40

42.5

68

80

39

40.0

66

得分（%）

37.5

38

75

64

35.0

37

5 10 15 最大工具调用次数

5 10 15 最大工具调用次数

5 10 15 最大工具调用次数

5 10 15 最大工具调用次数

短时傅里叶变换RL

图 27. 最大工具调用的消融。我们在四个长格式数据集上评估 DR Tulu (SFT) 和 DR Tulu (RL；1900 步骤)，同时将允许的工具调用最大数量从 1 更改为 15，并报告在这些上限下性能如何变化。

Top-K 片段

Top-K 片段

公制 1 3 5 10

公制 1 3 5 10

设置相同 0.77 2.04 3.34 6.01 位置匹配 0.77 1.71 2.22 2.93

设置相同 0.88 2.53 4.20 7.67 位置匹配 0.88 2.35 3.48 5.64

(a) 间隔一周

(b) 短时间内

表 14. 重复查询的搜索引擎输出差异。左表显示一周发出两个查询时的结果

分开，而右表显示在短时间内发出两个查询时的结果。

I.6。推理时工具调用预算的影响。

我们通过将允许的工具调用最大数量更改为 {1,3,5,10,15}，研究了推理时间工具调用预算如何影响性能。对于 SFT 和 RL 模型，性能通常在 5 次工具调用的预算左右饱和，尽管 RL 偶尔会通过最多 10 次工具调用的额外预算来提高；请参见图 27。这与 RL 训练期间看到的工具调用行为（附录 I.2）相匹配，其中模型每个样本平均使用 3-4 次工具调用。

I.7。评估差异

深度研究模型的推断和评估往往表现出显着的差异。当针对相同问题运行模型或在相同基准上评估它们时，结果可能会有很大差异。通常，造成这种差异的三个关键因素，我们将在以下部分中讨论。

I.7.1。工具带来的差异

在不同时间调用具有相同输入的工具可能会产生不一致的输出，从而导致模型产生不同的后续上下文。在本节中，我们重点关注搜索引擎引入的输出方差。

我们对 100 个函数调用查询进行了采样，并向 Google 搜索引擎重新发出这些查询，两次调用之间的间隔大约为一周。然后，我们计算每对调用的 top-1、top-3、top-5 和 top-10 检索片段的差异。为了进行比较，我们还测量了几乎同时发出的两个呼叫之间的差异。我们使用以下指标来评估搜索引擎返回的方差。

• 设置相同：前 k 个结果中共享项目的数量，无论顺序如何（即交集的大小）。

• pos match：top-k 中两个列表包含相同排名的相同项目的位置数。

如表14所示，搜索引擎的回报不稳定。即使在短时间内调用相同的查询，它仍然会产生明显不同的结果。前 10 名片段的平均重叠度仅为 7.67 左右，精确排名匹配度下降至 5.64。当相同的查询相隔一周重新发出时，搜索引擎的返回结果差异会更加显着。我们在图 28 中展示了不一致的示例。

44

<!-- page 45 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Showcase of Search Engine’s Returns

# Search Results I (show top-5 snippets) Position: 1 Link: https://en.wikipedia.org/wiki/E._Howard_Hunt Snippet: Everette Howard Hunt Jr. (October 9, 1918 { January 23, 2007) was an American intelligence officer and author. From 1949 to 1970, Hunt served as an officer ... Position: 2 Link: https://www.amazon.com/stores/author/B0034QAV74 Snippet: Top E. Howard Hunt titles · American Spy: My Secret History in the CIA, Watergate and Beyond. American Spy: My Secret History in the CIA, Watergate and Beyond. Position: 3 Link: https://www.fantasticfiction.com/h/e-howard-hunt/ Snippet: Everette Howard Hunt, Jr. was an American author and spy. He worked for the Central Intelligence Agency (CIA) and later the White House under President ... Position: 4 Link: https://www.goodreads.com/author/list/118536.E_Howard_Hunt Snippet: E. Howard Hunt has 85 books on Goodreads with 2730 ratings. E. Howard Hunt's most popular book is House Dick. Position: 5 Snippet: E. Howard Hunt, a spy's spy. Hunt carried on writing spy novels long after the Watergate scandal but the Peter Ward books are among his most popular series ...

# Search Results II Position: 1 Link: https://en.wikipedia.org/wiki/E._Howard_Hunt Snippet: Everette Howard Hunt Jr. (October 9, 1918 { January 23, 2007) was an American intelligence officer and author. From 1949 to 1970, Hunt served as an officer ... Position: 2 Link: https://www.goodreads.com/author/list/118536.E_Howard_Hunt Snippet: E. Howard Hunt has 85 books on Goodreads with 2730 ratings. E. Howard Hunt's most popular book is House Dick. Position: 3 Link: https://www.amazon.com/E-Howard-Hunt/e/B0034QAV74/ref=dp_byline_cont_ebooks_1 Snippet: Follow E. Howard Hunt and explore their bibliography from Amazon's E. Howard Hunt Author Page ... Howard Hunt. Most popular. American Spy: My Secret History ... Position: 4 Link: https://www.fantasticfiction.com/h/e-howard-hunt/ Snippet: Everette Howard Hunt, Jr. was an American author and spy. He worked for the Central Intelligence Agency (CIA) and later the White House under President ... Position: 5 Link: https://spyscape.com/article/cia-spy-howard-hunt-confessions-of-a-watergate-plumber Snippet: E. Howard Hunt, a spy's spy. Hunt carried on writing spy novels long after the Watergate scandal but the Peter Ward books are among his most popular series ...

Figure 28. Examples of Inconsistencies of Search Results.

45

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

搜索引擎返回结果展示

# 搜索结果 I（显示前 5 个片段） 位置：1 链接：https://en.wikipedia.org/wiki/E._Howard_Hunt 片段：小埃弗雷特·霍华德·亨特（Everette Howard Hunt Jr.，1918 年 10 月 9 日 { 2007 年 1 月 23 日）是一名美国情报官员和作家。从 1949 年到 1970 年，亨特担任军官...职位：2 链接：https://www.amazon.com/stores/author/B0034QAV74 片段：顶级 E. 霍华德·亨特标题·美国间谍：我在中央情报局、水门事件及其他地方的秘密历史。 《美国间谍：我在中央情报局、水门事件及其他地方的秘史》。位置：3 链接：https://www.fantasticfiction.com/h/e-howard-hunt/ 片段：小埃弗雷特·霍华德·亨特 (Everette Howard Hunt, Jr.) 是一位美国作家和间谍。他曾在中央情报局 (CIA) 工作，后来在总统领导下的白宫工作... 职位：4 链接：https://www.goodreads.com/author/list/118536.E_Howard_Hunt 片段：E. Howard Hunt 在 Goodreads 上有 85 本书，评分为 2730。 E. 霍华德·亨特最受欢迎的书是《迪克之家》。位置：5 片段：E. Howard Hunt，间谍中的间谍。水门丑闻发生很久之后，亨特继续创作间谍小说，但彼得·沃德的书是他最受欢迎的系列之一……

# 搜索结果 II 位置：1 链接：https://en.wikipedia.org/wiki/E._Howard_Hunt 片段：小埃弗雷特·霍华德·亨特（Everette Howard Hunt Jr.，1918 年 10 月 9 日 { 2007 年 1 月 23 日）是一位美国情报官员和作家。从1949年到1970年，亨特担任军官... 职位：2 链接：https://www.goodreads.com/author/list/118536.E_Howard_Hunt 片段：E. Howard Hunt 在 Goodreads 上有 85 本书，评分为 2730。 E. 霍华德·亨特最受欢迎的书是《迪克之家》。位置：3 链接：https://www.amazon.com/E-Howard-Hunt/e/B0034QAV74/ref=dp_byline_cont_ebooks_1 片段：关注 E. Howard Hunt 并从亚马逊的 E. Howard Hunt 作者页面探索他们的参考书目 ... Howard Hunt。最受欢迎。美国间谍：我的秘史... 位置：4 链接：https://www.fantasticfiction.com/h/e-howard-hunt/ 片段：小埃弗雷特·霍华德·亨特是一位美国作家和间谍。他曾在中央情报局 (CIA) 工作，后来在总统领导下的白宫工作... 职位：5 链接：https://spyscape.com/article/cia-spy-howard-hunt-confessions-of-a-watergate-plumber 片段：E. Howard Hunt，间谍中的间谍。水门丑闻发生很久之后，亨特继续创作间谍小说，但彼得·沃德的书是他最受欢迎的系列之一……

图 28. 搜索结果不一致的示例。

45

<!-- page 46 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

I.7.2. VARIANCES INTRODUCED BY INFERENCE

Generating particularly long trajectories can also introduce variance. Small differences early in the process can lead to substantially divergent final responses. To observe the impact of this variability, we re-ran one short-form benchmark and two long-form benchmarks, comparing the outputs from two separate generations using GPT-4.1 with our auto-search pipeline.

As shown in Table 15, in 2Wiki, GPT-4.1 produces final answers that differ by 29.3% in the 300 cases and obtains high variances in long-form tasks like Healthbench and ResearchQA as well.

Task 2Wiki Healthbench ResearchQA

Numbers 300 900 776 Diff 29.3 17.1 9.81

Table 15. Inference Variance. The Diff in 2Wiki refers to the difference in two final answers of the two trajectories under the same cases, while the Diff in Healthbench and ResearchQA represents the absolute difference in LLM judged scores.

I.7.3. VARIANCES INTRODUCED BY JUDGE MODELS

When evaluating the same responses in different times, even if using the same model as a judge, inconsistent judgments may occur.

We use GPT-4.1 to evaluate the same trajectories twice and the results are shown in Table 16. The judgments show relatively high consistency and reliability on both short-form and long-form tasks.

2Wiki Healthbench ResearchQA

1 67.67 37.67 66.18 2 66.33 37.51 66.43

Table 16. Judgement Variance.

I.7.4. ROBUSTNESS TO THE BROWSER TOOL USED AT INFERENCE

DR Tulu-8B is trained with a local Crawl4AI-based web browse tool to reduce training cost, but evaluated with the Jina API to remain consistent with prior open-source baselines (e.g., Tongyi DR, ASearcher). To verify that this train/inference mismatch does not significantly affect downstream performance, we re-evaluate DR Tulu-8B with Crawl4AI as the inference- time browser. Table 17 shows that the choice of browser at inference has minimal impact (≤1 point on every benchmark, −0.5 on average), suggesting that one can train with cheaper browser alternatives and still benefit from other browser providers at test time without re-training.

Browser HealthBench ResearchQA SQAv2 DRB Average

Crawl4AI (training-time tool) 54.2 76.4 87.8 45.4 66.0 Jina (main-evaluation tool) 54.0 75.6 87.2 45.3 65.5

Table 17. Browser tool ablation at inference. Switching the inference-time web browse tool from Crawl4AI (used during training)

to Jina (used in our main evaluations) yields only a minor average drop (−0.5), demonstrating that the agent generalizes to alternative browsers without re-training.

I.8. Mismatch between RL Training and Downstream Evaluation

During development of DR Tulu, we found that our RL training setup had some mismatch with our downstream performance: models that achieved the highest training reward did not necessarily achieve the highest downstream evaluation performance. To highlight this, compare the training reward of the “No SFT” and “Our SFT” models in Figure 29 against their performance in Figure 5. While starting directly from Qwen 3 (“No SFT”) achieves highest train reward,it has dramatically lower

46

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

I.7.2。推论引入的方差

生成特别长的轨迹也会引入方差。过程早期的微小差异可能会导致最终反应大相径庭。为了观察这种变异性的影响，我们重新运行了一个简短的基准测试和两个长格式的基准测试，将使用 GPT-4.1 的两代不同版本的输出与我们的自动搜索管道进行比较。

如表 15 所示，在 2Wiki 中，GPT-4.1 在 300 个案例中生成的最终答案相差 29.3%，并且在 Healthbench 和 ResearchQA 等长格式任务中也获得了很高的差异。

任务 2Wiki Healthbench 研究 QA

数量 300 900 776 差异 29.3 17.1 9.81

表 15. 推断方差。 2Wiki中的Diff是指同一案例下两条轨迹的两个最终答案的差异，而Healthbench和ResearchQA中的Diff则代表LLM评判分数的绝对差异。

I.7.3。法官模型引入的差异

在不同时间评估相同的响应时，即使使用相同的模型作为判断，也可能会出现不一致的判断。

我们使用GPT-4.1对相同的轨迹进行两次评估，结果如表16所示。无论是短式任务还是长式任务，判断都表现出较高的一致性和可靠性。

2Wiki Healthbench 研究质量保证

1 67.67 37.67 66.18 2 66.33 37.51 66.43

表 16. 判断方差。

I.7.4。推理时使用的浏览器工具的稳健性

DR Tulu-8B 使用本地基于 Crawl4AI 的网络浏览工具进行训练，以降低训练成本，但使用 Jina API 进行评估，以与之前的开源基线（例如 Tongyi DR、ASearcher）保持一致。为了验证这种训练/推理不匹配不会显着影响下游性能，我们使用 Crawl4AI 作为推理时间浏览器重新评估 DR Tulu-8B。表 17 显示，推理时浏览器的选择影响很小（每个基准测试≤1 分，平均 -0.5），这表明人们可以使用更便宜的浏览器替代品进行训练，并且在测试时仍然受益于其他浏览器提供商，而无需重新训练。

浏览器 HealthBench ResearchQA SQAv2 DRB 平均值

Crawl4AI（训练时工具） 54.2 76.4 87.8 45.4 66.0 Jina（主要评估工具） 54.0 75.6 87.2 45.3 65.5

表 17. 推理时的浏览器工具消融。从 Crawl4AI 切换推理时网页浏览工具（在训练期间使用）

到 Jina（在我们的主要评估中使用）仅产生较小的平均下降（−0.5），这表明该代理无需重新训练即可泛化到其他浏览器。

I.8.强化学习训练与下游评估之间的不匹配

在 DR Tulu 的开发过程中，我们发现我们的 RL 训练设置与下游性能存在一些不匹配：获得最高训练奖励的模型不一定能获得最高的下游评估性能。为了强调这一点，将图 29 中“无 SFT”和“我们的 SFT”模型的训练奖励与图 5 中的性能进行比较。虽然直接从 Qwen 3（“无 SFT”）开始获得最高的训练奖励，但其训练奖励却大大降低

46

<!-- page 47 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

6

8

0.8

4

6

0.6

2

4

Overall Reward

Num. Tool Calls

0.4

Pers. Rubric Reward

0K 0.1K 0.2K 0.3K 0.4K 0.5K 0.6K

0K 0.1K 0.2K 0.3K 0.4K 0.5K 0.6K

0K 0.1K 0.2K 0.3K 0.4K 0.5K 0.6K

Training Steps

Our SFT No SFT

Figure 29. Metrics during RL training when starting from two different models (with and without SFT). “Pers. Rubric reward”

refers to the reward over the search-based rubrics only (not including the rubrics generated as part of the RLER process). Starting from a model without cold start data (“no SFT”) achieves higher train reward, but underperforms on downstream evaluations.

SQAv2

Healthbench

DeepResearchBench

SimpleQA

6.4%

5.4%

2.4% 0.9%

0.7%

22.2%

50.5%

23.4% 71.3%

96.8%

43.1%

77.0%

Paper Search Google Search Browse Webpage

Figure 30. Distribution of tool calls for SQAv2 (science), HealthBench (healthcare), DeepResearchBench (general domain) and

SimpleQA (factoid, short-form QA). DR Tulu can adaptively choose effective tools for different tasks, relying more on paper search for scientific questions (SQAv2), and more on google search for general-domain questions (SimpleQA).

downstream evaluation results (see Figure 5). It also displays significantly different behavior, using significantly more tool calls than the cold-started (“Our SFT”) model.

This may be due to a few factors: first, our evaluations use rubrics generated in different manners to our own training rubrics (e.g., Healthbench uses expert-annotated rubrics), potentially leading to cases where test-time rubrics evaluate features not commonly tested in our training rubrics. Second, there may be reward hacking behavior during RL training, due to our use of an LM judge different to the judges used in downstream evaluation. Our in-loop judge model uses GPT-4.1-mini, while downstream evaluations use varied different models (e.g., SQAv2 uses Gemini Flash 2.5, DRB uses a mix of Gemini Pro 2.5 and Gemini Flash 2.5, and Healthbench uses GPT-4.1, all with varying prompts and evaluation harnesses). This may lead to our RL training optimizing for attributes preferred by GPT-4.1-mini, but not by downstream evaluation judges. We finally conjecture that another contributing factor may be the difference in model priors: different models may exploit rewards in different ways. For example, rollouts from a weaker model may contain fewer high-quality answers; when all answers are poor, the judge model may end up selecting based solely on spurious features rather than making meaningful quality comparisons. In contrast, when starting from the same initial model, we usually observe that reward improvements correlate well with downstream scores. We defer a deeper investigation of this mismatch phenomenon to future work, as addressing it would help improve the effectiveness of rubrics for RL training.

J. Analysis on Searched Tools and Domain Distributions

We analyze the tools used by an intermediate RL checkpoint of DR Tulu (step 1900), and find that its tool usage adapts to each task’s information needs. Figure 30 shows that paper search (our scientific-paper search) dominates on SQAv2, consistent with its focus on literature understanding.

47

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

6

8

0.8

4

6

0.6

2

4

整体奖励

编号。工具调用

0.4

个人。评分细则奖励

0K 0.1K 0.2K 0.3K 0.4K 0.5K 0.6K

0K 0.1K 0.2K 0.3K 0.4K 0.5K 0.6K

0K 0.1K 0.2K 0.3K 0.4K 0.5K 0.6K

训练步骤

我们的 SFT 没有 SFT

图 29.从两个不同模型（使用和不使用 SFT）开始时的 RL 训练期间的指标。 “个人评分奖励”

仅指基于搜索的评分标准的奖励（不包括作为 RLER 流程的一部分生成的评分标准）。从没有冷启动数据（“无 SFT”）的模型开始可以获得更高的训练奖励，但在下游评估中表现不佳。

SQAv2

健康台

深度研究台

简单的质量保证

6.4%

5.4%

2.4% 0.9%

0.7%

22.2%

50.5%

23.4% 71.3%

96.8%

43.1%

77.0%

论文搜索 Google 搜索 浏览网页

图 30. SQAv2（科学）、HealthBench（医疗保健）、DeepResearchBench（通用领域）和

SimpleQA（事实，简短的 QA）。 DR Tulu 可以针对不同的任务自适应地选择有效的工具，更多地依靠论文搜索来解决科学问题（SQAv2），更多地依靠谷歌搜索来解决一般领域的问题（SimpleQA）。

下游评价结果（见图5）。它还显示出显着不同的行为，比冷启动（“我们的 SFT”）模型使用更多的工具调用。

这可能是由于以下几个因素造成的：首先，我们的评估使用与我们自己的培训评估准则不同的方式生成的评估准则（例如，Healthbench 使用专家注释的评估准则），可能导致测试时评估准则评估我们的训练评估准则中不常见测试的功能的情况。其次，由于我们使用的 LM 判断器与下游评估中使用的判断器不同，因此在 RL 训练期间可能存在奖励黑客行为。我们的循环内判断模型使用 GPT-4.1-mini，而下游评估使用各种不同的模型（例如，SQAv2 使用 Gemini Flash 2.5，DRB 使用 Gemini Pro 2.5 和 Gemini Flash 2.5 的混合，Healthbench 使用 GPT-4.1，所有模型都有不同的提示和评估工具）。这可能会导致我们的 RL 训练针对 GPT-4.1-mini 首选的属性进行优化，但下游评估法官则不会。我们最终推测另一个影响因素可能是模型先验的差异：不同的模型可能以不同的方式利用奖励。例如，较弱模型的推出可能包含较少的高质量答案；当所有答案都很差时，判断模型可能最终仅根据虚假特征进行选择，而不是进行有意义的质量比较。相反，当从相同的初始模型开始时，我们通常会观察到奖励改进与下游分数密切相关。我们将对这种不匹配现象的更深入调查推迟到未来的工作中，因为解决这个问题将有助于提高强化学习训练规则的有效性。

J. 搜索工具及领域分布分析

我们分析了 DR Tulu 的中间 RL 检查点使用的工具（步骤 1900），发现其工具使用适应每个任务的信息需求。图 30 显示论文搜索（我们的科学论文搜索）在 SQAv2 上占主导地位，这与其对文献理解的关注一致。

47

<!-- page 48 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

SQAv2

Healthbench

github.com

pmc.ncbi.nlm.nih.gov

cdc.gov

lmsys.org

huggingface.co

aafp.org

arxiv.org

mayoclinic.org

youtube.com

ncbi.nlm.nih.gov

0 2 4

0 40 80 120 160

DeepResearchBench

SimpleQA

researchgate.net

en.wikipedia.org

en.wikipedia.org

facebook.com

youtube.com

youtube.com

reddit.com

reddit.com

instagram.com

pmc.ncbi.nlm.nih.gov

0 20 40 Count

0 100 200 Count

Figure 31. Distribution of domains among web search results for SQAv2 (science), HealthBench (healthcare), DeepResearchBench (general domain) and SimpleQA (factoid, short-form QA). We show top domains returned by the google search tool. Calculations are based on 100 samples from each task. These top domains match the evaluation domain; e.g., when evaluating on Healthbench, DR Tulu searches more for medical domain websites.

Figure 31 further confirms task-specific retrieval behavior. HealthBench emphasizes authoritative biomedical and public- health sites (e.g., cdc.gov, pmc.ncbi.nlm.nih.gov, ncbi.nlm.nih.gov, mayoclinic.org). DeepRe- searchBench mixes technical and policy sources (e.g., researchgate.net, oecd.org, github.com), consistent with deeper, exploratory research tasks. SimpleQA is dominated by general reference and social/information platforms (e.g., en.wikipedia.org, facebook.com, youtube.com). Overall, tool usage and surfaced domains align with each dataset’s information demands: literature-centric tasks favor scientific search and scholarly venues, whereas open-domain tasks lean on general web search and broad reference sites.

J.1. Qualitative Examples

We present one trajectory of our DR Tulu on the long-form task ResearchQA in Figures 36–38. The response is truncated for brevity; we will release full model response samples after review.

48

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

SQAv2

健康台

github.com

pmc.ncbi.nlm.nih.gov

疾病预防控制中心政府

lmsys.org

拥抱脸网

aafp.org

arxiv.org

梅奥诊所.org

youtube.com

ncbi.nlm.nih.gov

0 2 4

0 40 80 120 160

深度研究台

简单的质量保证

研究门网

en.wikipedia.org

en.wikipedia.org

脸书网

youtube.com

youtube.com

reddit.com

reddit.com

Instagram.com

pmc.ncbi.nlm.nih.gov

0 20 40 计数

0 100 200 计数

图 31. SQAv2（科学）、HealthBench（医疗保健）、DeepResearchBench（通用域）和 SimpleQA（factoid，简短形式 QA）的 Web 搜索结果中的域分布。我们显示谷歌搜索工具返回的顶级域名。计算基于每个任务的 100 个样本。这些顶级域与评估域相匹配；例如，在 Healthbench 上进行评估时，DR Tulu 会更多地搜索医疗领域网站。

图 31 进一步证实了特定于任务的检索行为。 HealthBench 强调权威的生物医学和公共卫生网站（例如 cdc.gov、pmc.ncbi.nlm.nih.gov、ncbi.nlm.nih.gov、mayoclinic.org）。 DeepResearchBench 混合了技术和政策来源（例如，researchgate.net、oecd.org、github.com），与更深入的探索性研究任务一致。 SimpleQA 主要由一般参考和社交/信息平台（例如 en.wikipedia.org、facebook.com、youtube.com）主导。总体而言，工具的使用和表面域与每个数据集的信息需求相一致：以文献为中心的任务有利于科学搜索和学术场所，而开放域任务则依赖于一般的网络搜索和广泛的参考站点。

J.1。定性例子

我们在图 36-38 中展示了 DR Tulu 在长格式任务 ResearchQA 上的一个轨迹。为简洁起见，响应被截断；我们将在审核后发布完整的模型响应样本。

48

<!-- page 49 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Trajectory for OpenScholar SFT Data Part I

User

Please provide a detailed overview of theories and models related to Artificial Intelligence (AI) in education. Include information on the foundational theories that underpin AI's role in education, such as constructivism, behaviorism, and connectivism, and how these theories inform AI-based learning tools. Additionally, explain prominent AI models and frameworks, such as Intelligent Tutoring Systems (ITS), Adaptive Learning Systems, Learning Analytics, and Natural Language

Processing in education. Highlight their key features, applications, and contributions to personalized learning, teacher efficiency, and student engagement. Please reference recent scholarly works to support your response.

Assistant

<think> Decompose the question: We need to (a) outline foundational learning theories (behaviorism, constructivism, connectivism) and explicitly connect them to AI-in-education designs, and (b) explain prominent AI models/frameworks (ITS, adaptive learning, learning analytics, NLP in education), including features, applications, and contributions (personalization, teacher efficiency, engagement), all supported by recent scholarly sources. Assumptions: There are review/survey papers in AI in Education (AIED), Learning Analytics (LAK), and Educational Data Mining (EDM) from 2020{2025 that synthesize how pedagogical theories inform AI tools, and evaluations of ITS, adaptive systems, analytics, and NLP tools. We should also pull specific examples and quantified impacts where possible (e.g., learning gains from ITS, prediction performance in LA, efficacy of automated feedback). Search plan: 1) Start with surveys/reviews linking AI in education to learning theories (2020{2025), ideally in AIED, BJET, Computers \& Education, Review of Educational

Research, LAK, EDM venues. 2) Retrieve authoritative sources on ITS and adaptive learning (classic + recent advances like knowledge tracing, deep KT, mastery learning, LLM tutoring). 3) Gather learning analytics frameworks and applications (early warning systems, dashboards, ethics). 4) Collect NLP-in-education applications (automated scoring, feedback, dialogue tutoring, LLMs) and evidence on teacher efficiency and student engagement. First query will target a broad review tying theories and AI models together. </think> <call_tool name="snippet_search" year="2020-2025" limit="10" fieldsOfStudy="Education,Computer Science">AI in education review behaviorism constructivism connectivism intelligent tutoring systems adaptive learning learning analytics NLP</call_tool>

Figure 32. Example trajectory for OpenScholar SFT data Part I.

49

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

OpenScholar SFT 数据轨迹示例第 I 部分

用户

请详细概述教育领域人工智能（AI）相关的理论和模型。包括有关支撑人工智能在教育中作用的基础理论的信息，例如建构主义、行为主义和联通主义，以及这些理论如何为基于人工智能的学习工具提供信息。此外，解释著名的人工智能模型和框架，例如智能辅导系统 (ITS)、自适应学习系统、学习分析和自然语言

教育处理。重点介绍其主要功能、应用以及对个性化学习、教师效率和学生参与度的贡献。请参考最近的学术著作来支持您的回答。

助理

<思考>分解问题：我们需要（a）概述基础学习理论（行为主义、建构主义、联通主义），并将它们与人工智能教育设计明确联系起来，（b）解释著名的人工智能模型/框架（ITS、自适应学习、学习分析、教育中的自然语言处理），包括功能、应用和贡献（个性化、教师效率、参与度），所有这些都得到最新学术资源的支持。假设：从 2020 年到 2025 年，人工智能教育 (AIED)、学习分析 (LAK) 和教育数据挖掘 (EDM) 领域都有评论/调查论文，综合了教学理论如何影响人工智能工具，以及对 ITS、自适应系统、分析和 NLP 工具的评估。我们还应该尽可能提取具体的例子和量化的影响（例如，ITS 的学习收益、洛杉矶的预测性能、自动反馈的有效性）。搜索计划：1）从将教育中的人工智能与学习理论联系起来的调查/评论开始（2020{2025），最好是 AIED、BJET、计算机\与教育、教育评论

研究、LAK、EDM 场所。 2）检索ITS和自适应学习的权威来源（经典+最新进展，如知识追踪、深度KT、掌握学习、LLM辅导）。 3) 收集学习分析框架和应用程序（预警系统、仪表板、道德规范）。 4) 收集 NLP 在教育中的应用（自动评分、反馈、对话辅导、法学硕士）以及教师效率和学生参与度的证据。第一个查询将针对将理论和人工智能模型结合在一起的广泛审查。 </think> <call_tool name="snippet_search"year="2020-2025" limit="10" fieldsOfStudy="教育，计算机科学">人工智能在教育中的评论行为主义建构主义连接主义智能辅导系统自适应学习学习分析NLP</call_tool>

图 32. OpenScholar SFT 数据第一部分的示例轨迹。

49

<!-- page 50 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Trajectory for OpenScholar SFT Data Part II

Functional Calling

<tool_output> ... <snippet id="S_4yWB0UY">Title: The AI Revolution in Education: Will AI Replace or Assist Teachers in Higher Education? AI in education has evolved from computer-assisted instruction to intelligent tutoring systems (ITS) and adaptive learning technologies, with key themes including personalized feedback, natural language processing, and innovative tools like chatbots and virtual reality, enhancing student engagement and facilitating knowledge co-creation between 2020 and 2025.</snippet> <snippet id="S_KAymhlA">Title: AI Language Models as Educational Allies: Enhancing Instructional Support in Higher Education AI in education enhances instructional techniques, assessment methods, and personalized learning through intelligent tutoring systems and adaptive learning, while also necessitating further knowledge on technology to avoid misinformation, indicating a dynamic area of research from 2020 to 2025.</snippet> ... </tool_output>

Assistant

<think> Reflection on first query results: - The initial search returned broad reviews touching on AI branches (ML, DL, NLP) and applications (ITS, adaptive learning, automated assessment) with some claims about personalization and teacher support (S_c8C9s9m, S_NTanrK5, S_N8QWms7). These are relevant but high-level and light on explicit connections to learning theories and quantitative evidence. - S_tuhIPDv explicitly mentions ITS and NLP integrating behaviorism, constructivism, and connectivism, which is directly pertinent, though I need stronger, peer-reviewed sources that articulate these theory-to-tool mappings. - For models/frameworks, I also need authoritative, recent evidence on ITS effectiveness, adaptive learning via knowledge tracing, learning analytics frameworks (predictive models, dashboards), and NLP applications (AWE, ASR, chatbots, LLMs) with impacts on personalization, teacher efficiency, and engagement.

Gaps: - Explicit theoretical grounding linking behaviorism, constructivism, and connectivism to AI tools with scholarly backing. - Quantitative or meta-analytic evidence for ITS/adaptive systems. - Up-to-date learning analytics frameworks and outcomes. - NLP in education evidence, including automated feedback and LLM-based tutoring.

Next query: Search for papers that explicitly connect behaviorism, constructivism, and connectivism to AI/ITS/adaptive learning frameworks in education, 2020{2025, in education and CS venues. </think> <call_tool name="snippet_search" year="2020-2025" limit="10" fieldsOfStudy="Education,Computer Science">behaviorism constructivism connectivism artificial intelligence in education theoretical framework</call_tool>

Functional Calling

...

Figure 33. Example Trajectory for OpenScholar SFT Data Part II.

50

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

OpenScholar SFT 数据第二部分的轨迹示例

函数调用

<tool_output> ... <snippet id="S_4yWB0UY">标题：教育领域的人工智能革命：人工智能会取代或协助高等教育中的教师吗？教育领域的人工智能已从计算机辅助教学发展到智能辅导系统 (ITS) 和自适应学习技术，其关键主题包括个性化反馈、自然语言处理以及聊天机器人和虚拟现实等创新工具，从而在 2020 年至 2025 年间提高学生的参与度并促进知识共同创造。</snippet> <snippet id="S_KAymhlA">标题：人工智能语言模型作为教育盟友：增强高等教育的教学支持人工智能教育通过智能辅导系统和自适应学习增强教学技术、评估方法和个性化学习，同时还需要进一步了解技术以避免错误信息，这表明 2020 年至 2025 年将是一个动态的研究领域。</snippet> ... </tool_output>

助理

<think> 对第一个查询结果的反思： - 初始搜索返回了涉及 AI 分支（ML、DL、NLP）和应用程序（ITS、自适应学习、自动评估）的广泛评论，并带有一些关于个性化和教师支持的声明（S_c8C9s9m、S_NTanrK5、S_N8QWms7）。这些都是相关的，但层次较高，并且与学习理论和定量证据有明确的联系。 - S_tuhIPDv 明确提到 ITS 和 NLP 整合了行为主义、建构主义和联通主义，这是直接相关的，尽管我需要更强大的、经过同行评审的来源来阐明这些理论到工具的映射。 - 对于模型/框架，我还需要有关 ITS 有效性的权威最新证据、通过知识追踪进行的自适应学习、学习分析框架（预测模型、仪表板）和 NLP 应用程序（AWE、ASR、聊天机器人、法学硕士）对个性化、教师效率和参与度的影响。

差距： - 将行为主义、建构主义和联通主义与人工智能工具联系起来的明确理论基础，并有学术支持。 - ITS/自适应系统的定量或荟萃分析证据。 - 最新的学习分析框架和成果。 - 教育证据中的 NLP，包括自动反馈和基于法学硕士的辅导。

下一个查询：搜索将行为主义、建构主义和联通主义与 2020 年{2025 年教育和计算机科学领域的 AI/ITS/自适应学习框架明确联系起来的论文。 </think> <call_tool name="snippet_search"year="2020-2025" limit="10" fieldsOfStudy="Education,Computer Science">行为主义建构主义联通主义人工智能教育理论框架</call_tool>

函数调用

...

图 33. OpenScholar SFT 数据第二部分的示例轨迹。

50

<!-- page 51 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Trajectory for OpenScholar SFT Data Part III

Assistant

<think> We have initial broad reviews but need stronger, specific evidence tying learning theories to AI designs and quantifying effects for ITS, adaptive learning, learning analytics, and NLP in education. Key gaps: (1) explicit mapping of behaviorism/constructivism/connectivism to AI paradigms with scholarly backing; (2) quantitative evidence for ITS/adaptive learning (e.g., learning gains, knowledge tracing); (3) learning analytics frameworks and teacher-facing outcomes; and (4) NLP applications (AWE/ASR/chatbots/LLM tutors) with impacts on personalization, efficiency, and engagement.

Next, I will search for meta-analyses or systematic reviews on ITS effectiveness and adaptive learning from 2020{2025, then for learning analytics frameworks and NLP-in-education evaluations. </think> <call_tool name="snippet_search" year="2020-2025" limit="10" fieldsOfStudy="Education,Computer Science">intelligent tutoring systems meta-analysis effectiveness learning gains 2020..2025 educational data mining knowledge tracing adaptive learning</call_tool>

Functional Calling

...

Assistant

<think> We have gathered broad reviews on AI in education and some mentions connecting pedagogical theories to AI paradigms. We also have meta-analytic evidence for ITS effectiveness summarized in recent reviews, but we still need: (a) clearer, recent sources on adaptive learning mechanisms like knowledge tracing; (b) specific learning analytics frameworks and teacher-facing applications; and (c) NLP-in-education evidence including automated feedback and LLM-based tutoring impacts. We have performed four searches; we can do up to four more if needed. However, current snippets include: a systematic review describing AI branches and applications in education (S_c8C9s9m); papers situating AI paradigms within behaviorist, constructivist, and connectivist frames (S_YRwbcNE, S_JCPVjqk, S_6KKZmn3); reviews summarizing ITS/adaptivity and meta-analyses with effect sizes (S_lUcsvG5, S_sUEgQk4, S_xkpGPkk); and reviews of NLP applications in language

learning (S_KVwSGwG) and integrated AI+learning analytics perspectives (S_RBEFb7h). While we could add more targeted evidence on knowledge tracing and dashboards, the current evidence suffices to construct a theory-to-tool mapping and to detail features/applications and contributions across ITS, adaptive learning, learning analytics, and NLP with citations. I will structure the answer with sections: (1) Foundations: behaviorism, constructivism, connectivism and their implications for AI tools; (2) Intelligent Tutoring Systems; (3) Adaptive Learning Systems; (4) Learning Analytics; (5) NLP in Education; (6) Contributions to personalized learning, teacher efficiency, and engagement; (7) Emerging trends and considerations. I will ensure claims are supported by retrieved snippets. </think>

Figure 34. Example trajectory for OpenScholar SFT data Part III.

51

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

OpenScholar SFT 数据轨迹示例第 III 部分

助理

<思考>我们已经进行了初步广泛的审查，但需要更强有力、具体的证据，将学习理论与人工智能设计联系起来，并量化 ITS、自适应学习、学习分析和自然语言处理在教育中的效果。主要差距：（1）在学术支持下将行为主义/建构主义/联结主义明确映射到人工智能范式； (2) ITS/适应性学习的定量证据（例如学习收益、知识追踪）； (3) 学习分析框架和面向教师的成果； (4) NLP 应用程序（AWE/ASR/聊天机器人/LLM 导师）对个性化、效率和参与度有影响。

接下来，我将搜索 2020 年至 2025 年 ITS 有效性和自适应学习的荟萃分析或系统评价，然后搜索学习分析框架和 NLP 教育评估。 </think> <call_tool name="snippet_search"year="2020-2025" limit="10" fieldsOfStudy="Education,Computer Science">智能辅导系统元分析有效性学习收获2020..2025教育数据挖掘知识追踪自适应学习</call_tool>

函数调用

...

助理

<思考>我们收集了有关人工智能在教育领域的广泛评论，其中一些提到了将教学理论与人工智能范式联系起来。我们还在最近的评论中总结了 ITS 有效性的元分析证据，但我们仍然需要：（a）关于知识追踪等自适应学习机制的更清晰、最新的来源； (b) 具体的学习分析框架和面向教师的应用程序； (c) NLP 教育证据，包括自动反馈和基于法学硕士的辅导影响。我们进行了四次搜索；如果需要的话，我们最多可以再做四个。然而，当前的片段包括：描述人工智能分支和教育应用的系统回顾（S_c8C9s9m）；将人工智能范式置于行为主义、建构主义和联通主义框架内的论文（S_YRwbcNE、S_JCPVjqk、S_6KKZmn3）；总结 ITS/适应性和效果大小荟萃分析的评论（S_lUcsvG5、S_sUEgQk4、S_xkpGPkk）；以及NLP在语言方面的应用综述

学习 (S_KVwSGwG) 和集成的 AI+学习分析视角 (S_RBEFb7h)。虽然我们可以在知识追踪和仪表板上添加更多有针对性的证据，但当前的证据足以构建理论到工具的映射，并详细说明 ITS、自适应学习、学习分析和 NLP 的功能/应用程序和贡献（带引文）。我将通过以下部分来构建答案：（1）基础：行为主义、建构主义、联通主义及其对人工智能工具的影响； (2)智能辅导系统； (3) 自适应学习系统； (4) 学习分析； (5) NLP教育； (6) 对个性化学习、教师效率和参与度的贡献； (7) 新趋势和考虑因素。我将确保检索到的片段支持声明。 </认为>

图 34.OpenScholar SFT 数据的示例轨迹第 III 部分。

51

<!-- page 52 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Trajectory for OpenScholar SFT Data Part IV

Assistant (Final Answer)

<answer> # Overview

Artificial Intelligence (AI) in education encompasses techniques such as machine learning, deep learning, and natural language processing that analyze learner data to personalize instruction, generate feedback, and support pedagogical decision-making across intelligent tutoring systems, adaptive platforms, and learning analytics tools <cite id="S_c8C9s9m">AI has many branches and sub-branches, such as machine learning, deep learning, and natural language processing; in education, AI supports intelligent tutoring systems, intelligent agents, and intelligent collaborative learning systems, and supports teachers' decision making by reporting real-time class statuses and personalized learning platforms</cite>. Recent syntheses emphasize AI’s rapid expansion into personalized feedback, chatbots, and virtual environments for engagement and co-creation, while underscoring the need for interdisciplinary integration with learning sciences <cite id="S_4yWB0UY">AI in education has evolved from computer-assisted instruction to intelligent tutoring systems and adaptive learning technologies, with key themes including personalized feedback, natural language processing, and innovative tools like chatbots and virtual reality, enhancing student engagement and facilitating knowledge co-creation</cite><cite id="S_RBEFb7h">The integration of AI, particularly through learning analytics and NLP, is revolutionizing education by enhancing personalized learning experiences and engagement, with advancements like large language models improving performance in examinations and emphasizing collaboration between AI developers and educators</cite>.

# Foundational Theories and How They Inform AI in Education Behaviorism, cognitivism, constructivism, and connectivism offer complementary lenses for designing AI-enabled learning experiences. Behaviorism emphasizes observable behavior change through stimuli, repetition, and reinforcement, aligning with drill-and-practice, mastery learning, and immediate feedback mechanisms common in early computer-assisted instruction and some ITS components <cite id="S_6KKZmn3">The earliest learning theory, behaviorism, focuses on human behaviors based on repetition and response to stimuli, enabling learning to be observed and quantified</cite>. Constructivism positions learners as active constructors of knowledge through authentic, collaborative, and reflective activity, motivating AI tools that scaffold inquiry, support problem-based learning, and adaptively guide students through complex tasks <cite id="S_6KKZmn3">Constructivism is learner-centered, emphasizing collaborative, active, and reflective learning where students act autonomously and self-directed</cite><cite id="S_XrZdksg">Constructivism encompasses situated cognition, activity theory, experiential learning, anchored instruction, and authentic learning as frameworks for educational technology, organized under a constructivist umbrella</cite>. Connectivism reframes learning as networked, distributed across people and technologies, shaping AI designs that augment learner agency through networked resources, recommendation, and collaborative tools typical of MOOCs and social learning environments <cite id="S_JCPVjqk">Connectivism, emerging as a response to technology's role, emphasizes learning through external connections and technology performing cognitive tasks</cite><cite id="S_TzKH9RC">Connectivism is grounded in interactions within networks, incorporating aspects of behaviorism, cognitivism, and social constructivism, and has been influential as an epistemological basis for MOOCs</cite>. ... (Response truncated for brevity; see our full dataset for complete prompts and examples.)

Figure 35. Example trajectory for OpenScholar SFT data Part IV.

52

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

OpenScholar SFT 数据第四部分的轨迹示例

助理（最终答案）

<answer> # 概述

教育领域的人工智能 (AI) 涵盖机器学习、深度学习和自然语言处理等技术，可分析学习者数据以个性化教学、生成反馈并支持跨智能辅导系统、自适应平台和学习分析工具的教学决策<cite id="S_c8C9s9m">人工智能有许多分支和子分支，例如机器学习、深度学习和自然语言处理；在教育领域，人工智能支持智能辅导系统、智能代理和智能协作学习系统，并通过报告实时课堂状态和个性化学习平台来支持教师决策</cite>。最近的综合强调人工智能快速扩展到个性化反馈、聊天机器人和用于参与和共同创造的虚拟环境，同时强调与学习科学跨学科整合的必要性<cite id="S_4yWB0UY">教育中的人工智能已经从计算机辅助教学发展到智能辅导系统和自适应学习技术，其关键主题包括个性化反馈、自然语言处理以及聊天机器人和虚拟现实等创新工具，提高学生参与度并促进知识共同创造</cite><cite id="S_RBEFb7h">人工智能的集成，特别是通过学习分析和 NLP 的集成，通过增强个性化学习体验和参与度，正在彻底改变教育，大型语言模型等进步提高了考试成绩，并强调人工智能开发人员和教育工作者之间的协作</cite>。

# 基础理论及其如何在教育中影响人工智能 行为主义、认知主义、建构主义和联通主义为设计人工智能学习体验提供了补充视角。行为主义强调通过刺激、重复和强化来观察行为变化，与早期计算机辅助教学和一些 ITS 组件中常见的钻练、掌握学习和即时反馈机制保持一致。建构主义通过真实、协作和反思的活动将学习者定位为知识的主动建构者，激发人工智能工具支持探究，支持基于问题的学习，并自适应地引导学生完成复杂的任务 <cite id="S_6KKZmn3">建构主义以学习者为中心，强调协作、主动和反思性学习，让学生自主和自我导向</cite><cite id="S_XrZdksg">建构主义包含情境认知、活动理论、体验式学习、锚定教学和真实学习作为教育技术的框架，在建构主义的保护伞下组织起来</cite>。联通主义将学习重新构建为网络化、分布于人员和技术之间的学习方式，塑造人工智能设计，通过 MOOC 和社交学习环境中典型的网络资源、推荐和协作工具增强学习者的能动性<cite id="S_JCPVjqk">联通主义作为对技术作用的回应而出现，强调通过外部连接和技术执行认知任务进行学习</cite><cite id="S_TzKH9RC">联通主义植根于网络内的互动，结合了行为主义、认知主义和社会建构主义，并且作为 MOOC 的认识论基础具有影响力</cite>。 ...（为简洁起见，响应被截断；请参阅我们的完整数据集以获取完整的提示和示例。）

图 35.OpenScholar SFT 数据第四部分的示例轨迹。

52

<!-- page 53 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Trajectory of DR Tulu on ResearchQA Part I

User

How do the narrow and broad approaches to CSR reporting differ in terms of their scope and the stakeholders they address?

Assistant

<think> Decompose the question: We need to define and differentiate the "narrow" versus "broad" approaches to CSR reporting, specifically along two dimensions: (1) scope

(what is reported) and (2) stakeholders addressed (who benefits/engages with the

report). Assumptions: This terminology is used in CSR/ sustainability reporting frameworks and literature (e.g., AA1000AS, GRI, SASB, integrated reporting). Plan: 1) Search for authoritative definitions of "narrow" vs "broad" stakeholder engagement in CSR. 2) Find sources that explicitly define "narrow scope" CSR (e.g., compliance-only, triple bottom line metrics) vs "broad scope" (stakeholder dialogue, materiality, governance, long-term value). 3) Retrieve evidence on who the reports address (shareholders vs a wider stakeholder community), including practitioner frameworks (e.g., AA1000AS stakeholder engagement principle). 4) Cross-check with standards like GRI (comprehensive, wide stakeholder audience) and SASB (focused, investor-material), to map scope vs audience. First query: "narrow and broad approaches to CSR reporting definition stakeholders scope". </think> <call_tool name="google_search" num="5" gl="us" hl="en">narrow and broad approaches to CSR reporting definition stakeholders scope</call_tool>

Functional Calling

<tool_output><snippet id=d7607bb2-0> Title: Mandatory CSR and sustainability reporting: economic analysis and ... URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8319709/ Snippet: Whether one chooses a narrow or a broad approach to CSR reporting depends on|among other things|normative views about the intended scope and target audience. </snippet> <snippet id=d7607bb2-1> Title: Stakeholders, stakeholder theory and Corporate Social ... URL: https://jcsr.springeropen.com/articles/10.1186/s40991-024-00094-y Snippet: This paper shows how stakeholder theory proactively moderates the strength of CSR in social interactions, environmental protection, and sustainable development. </snippet> <snippet id=d7607bb2-2> Title: Sustainability, corporate social responsibility, non-financial reporting ... URL: https://www.sciencedirect.com/science/article/pii/S2352550922003116 Snippet: CSR is a corporate management approach that applies sustainability values in business to promote social welfare within a company and outside it, employs ethical ... </snippet> ...

Figure 36. Example trajectory of DR Tulu on ResearchQA Part I.

53

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

DR Tulu 在 ResearchQA 第 I 部分上的轨迹示例

用户

狭义和广义的企业社会责任报告方法在范围和针对的利益相关者方面有何不同？

助理

<思考>分解问题：我们需要定义和区分企业社会责任报告的“狭义”与“广义”方法，特别是从两个维度：（1）范围

（报告的内容）和（2）涉及的利益相关者（谁受益/参与

报告）。假设：该术语用于企业社会责任/可持续发展报告框架和文献（例如 AA1000AS、GRI、SASB、综合报告）。计划：1) 寻找企业社会责任中“狭义”与“广泛”利益相关者参与的权威定义。 2) 寻找明确定义“窄范围”企业社会责任（例如，仅合规性、三重底线指标）与“宽范围”（利益相关者对话、重要性、治理、长期价值）的来源。 3) 检索报告针对的对象（股东与更广泛的利益相关者群体）的证据，包括从业者框架（例如 AA1000AS 利益相关者参与原则）。 4) 与 GRI（全面、广泛的利益相关者受众）和 SASB（重点关注、投资者材料）等标准进行交叉检查，以映射范围与受众。第一个查询：“企业社会责任报告定义利益相关者范围的狭义和广义方法”。 </think> <call_tool name="google_search" num="5" gl="us" hl="en">企业社会责任报告定义利益相关者范围的狭义和广义方法</call_tool>

函数调用

<tool_output><snippet id=d7607bb2-0> 标题：强制性企业社会责任和可持续发展报告：经济分析和... URL：https://pmc.ncbi.nlm.nih.gov/articles/PMC8319709/ 片段：选择狭义还是广义的企业社会责任报告方法取决于|除其他事项外|关于预期范围和目标受众的规范观点。 </snippet> <snippet id=d7607bb2-1> 标题：利益相关者、利益相关者理论与企业社会... URL：https://jcsr.springeropen.com/articles/10.1186/s40991-024-00094-y 摘要：本文展示了利益相关者理论如何主动调节企业社会责任在社会互动、环境保护和可持续发展方面的力量。 </snippet> <snippet id=d7607bb2-2> 标题：可持续性、企业社会责任、非财务报告... URL：https://www.sciencedirect.com/science/article/pii/S2352550922003116 片段：企业社会责任是一种企业管理方法，它将可持续发展价值观应用于企业内部和外部，以促进社会福利，采用道德... </snippet> ...

图 36. DR Tulu 在 ResearchQA 第 I 部分上的轨迹示例。

53

<!-- page 54 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Trajectory of DR Tulu on ResearchQA Part II

Assistant

<think>Goal: Define and differentiate "narrow" vs "broad" approaches to CSR reporting by (a) scope of what is reported and (b) stakeholders addressed. Strategy: 1) Find authoritative definitions and contrasts (preferably from academic papers and reputable frameworks). 2) Use the first Google search results to identify key sources, then browse pages for precise language on scope and audience. 3) Corroborate with recognized reporting frameworks (AA1000AS stakeholder engagement principle; GRI vs SASB scope differences). 4) Ensure at least four searches: initial Google search done; next, targeted searches for AA1000AS, GRI/SASB comparison, and a paper explicitly discussing narrow vs broad CSR reporting scope.

Reflection on first search: - PMC article (S_d7607bb2-0) mentions that approach choice depends on intended scope and target audience|relevant framing. - Sustainability Management Wiki (S_d7607bb2-3) claims narrow vs broad scope/target group|potentially useful but I need more authoritative backing. - Harvard Law corporate governance post (S_d7607bb2-5) discusses CSR report informing stakeholders about addressing their concerns|useful for audience/stakeholder dialogue. - NBER working paper (S_d7607bb2-6) gives an operational definition of narrowing scope to securities-law-required info|useful for narrow scope exemplar.

What's missing: Explicit framework language (AA1000AS principle 1: stakeholder engagement as a condition for materiality) and standard contrasts (GRI comprehensive vs SASB issue-focused/investor-oriented). Next query: "AA1000AS stakeholder engagement principle 1 materiality definition".</think> <call_tool name="google_search" num="5" gl="us" hl="en">AA1000AS stakeholder engagement principle 1 materiality definition</call_tool>

Functional Calling

<tool_output><snippet id=59a6bf6a-0> Title: Understanding the AA1000 Assurance Standard - LinkedIn URL: https://www.linkedin.com/pulse/understanding-aa1000-assurance-standard-enhancing-credibility- vn1tf Snippet: Materiality: Organizations must determine the relevance and significance of an issue to stakeholders and the business, ensuring that all ... </snippet> <snippet id=59a6bf6a-1> Title: AA1000 Stakeholder Engagement Standard - Accountability.org URL: https://accountability.org/standards/aa1000-stakeholder-engagement Snippet: The AA1000SES sets the global standard for conducting high-quality stakeholder engagement by offering a simple, practical framework for empowering stakeholders. </snippet> <snippet id=59a6bf6a-2> Title: [PDF] AA1000 STAKEHOLDER ENGAGEMENT STANDARD 2011 URL: https://cdn2.hubspot.net/hubfs/2642721/Recursos/Guias\%20y\%20Estandares/AA1000/AA1000\%20Stake holder\%20engagement\%20standard.pdf Snippet: Inclusivity, materiality and responsiveness require a defined process of stakeholder engagement that provides comprehensive and balanced involvement and ... </snippet> ...

Figure 37. Example trajectory of DR Tulu on ResearchQA Part II.

54

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

ResearchQA 第 II 部分中 DR Tulu 的轨迹示例

助理

<think>目标：通过 (a) 报告内容的范围和 (b) 涉及的利益相关者来定义和区分企业社会责任报告的“狭义”与“广义”方法。策略：1）找到权威的定义和对比（最好来自学术论文和信誉良好的框架）。 2) 使用第一个 Google 搜索结果来识别关键来源，然后浏览页面以获取有关范围和受众的精确语言。 3) 与公认的报告框架进行确认（AA1000AS 利益相关者参与原则；GRI 与 SASB 范围差异）。 4) 确保至少进行四次搜索：完成初始 Google 搜索；接下来，有针对性地搜索 AA1000AS、GRI/SASB 比较，以及明确讨论狭义与广义企业社会责任报告范围的论文。

对第一次搜索的反思： - PMC 文章 (S_d7607bb2-0) 提到方法选择取决于预期范围和目标受众|相关框架。 - 可持续发展管理 Wiki (S_d7607bb2-3) 声称范围狭窄与广泛/目标群体|可能有用，但我需要更多权威支持。 - 哈佛法公司治理帖子 (S_d7607bb2-5) 讨论了企业社会责任报告，告知利益相关者如何解决他们的担忧|对受众/利益相关者对话有用。 - NBER 工作文件 (S_d7607bb2-6) 给出了将范围缩小到证券法所需信息的操作定义|对于缩小范围的范例很有用。

缺少的内容：明确的框架语言（AA1000AS 原则 1：利益相关者参与作为重要性的条件）和标准对比（GRI 综合性与 SASB 以问题为中心/以投资者为导向）。下一个查询：“AA1000AS 利益相关者参与原则 1 重要性定义”。</think> <call_tool name="google_search" num="5" gl="us" hl="en">AA1000AS 利益相关者参与原则 1 重要性定义</call_tool>

函数调用

<tool_output><snippet id=59a6bf6a-0> 标题：了解 AA1000 保证标准 - LinkedIn URL：https://www.linkedin.com/pulse/understand-aa1000-assurance-standard-enhancing-credibility- vn1tf 片段：重要性：组织必须确定问题与利益相关者和业务的相关性和重要性，确保所有... </snippet> <snippet id=59a6bf6a-1> 标题：AA1000 利益相关者参与标准 - Accountability.org URL：https://accountability.org/standards/aa1000-stakeholder-engagement 片段：AA1000SES 通过为利益相关者赋权提供简单、实用的框架，为进行高质量利益相关者参与设定了全球标准。 </snippet> <snippet id=59a6bf6a-2> 标题：[PDF] AA1000 利益相关者参与标准 2011 URL： https://cdn2.hubspot.net/hubfs/2642721/Recursos/Guias\%20y\%20Estandares/AA1000/AA1000\%20Stakeholder\%20engagement\%20standard.pdf 片段：包容性、实质性和响应性需要利益相关者参与的明确流程，提供全面和平衡的参与和... </snippet> ...

图 37.ResearchQA 第 II 部分中 DR Tulu 的轨迹示例。

54

<!-- page 55 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Trajectory of DR Tulu on ResearchQA Part III

Assistant (Final Answer)

<think> Plan: We need authoritative definitions and contrasts of "narrow" versus "broad" CSR reporting, specifically along (1) reporting scope and (2) stakeholders addressed. I will: - Use the initial Google results to identify key academic framing (scope and audience). - Add AA1000AS to ground a "broad" approach via stakeholder engagement and materiality. - Use GRI vs SASB comparisons to concretely illustrate broad (comprehensive, multi-stakeholder) versus narrow (focused, investor-material) scope and audiences. I have already run three searches and have relevant snippets: a peer-reviewed article noting that approach choice depends on intended scope and target audience; examples of narrowing scope to legally required information; and multiple GRI{SASB sources indicating GRI's broad scope and audience versus SASB's focused/investor materiality. I will synthesize these, noting where evidence is explicit (scope and audience differences) and where it is inferential (mapping "broad" to AA1000AS stakeholder engagement/materiality). I will then produce a structured answer with citations on each claim.

Remaining gaps: A direct paper explicitly defining "narrow" vs "broad" CSR reporting terms would be ideal, but the PMC article and other sources suffice to explain the distinction in scope and audience. I will proceed to synthesize.

Structure for answer: - Definitions and framing: what "narrow" vs "broad" mean in scope and audience. - Scope differences: compliance/required info vs comprehensive material issues. - Stakeholders addressed: narrow (selected investors/regulators/creditors) vs broad (all materially affected stakeholders including communities, customers, employees,

suppliers, NGOs). - Standards mapping: AA1000AS (stakeholder engagement/materiality), GRI (broad), SASB (narrow/investor materiality) as illustrative examples.

</think> <answer> # Short answer

- Scope: A narrow CSR reporting approach confines disclosure to a limited set of issues, often legally required or compliance-oriented; a broad approach covers a wider set of material issues identified through stakeholder engagement across economic, environmental, and social dimensions. <cite id="d7607bb2-6">One way to narrow the scope of CSR reporting is to confine it to information required by securities law.</cite> <cite id="4a55f4d8-4">GRI requires identifying material topics to establish the scope and included issues covered by a company's report.</cite> <cite id="59a6bf6a-2">AA1000's principles of inclusivity, materiality, and responsiveness require a defined process of stakeholder engagement to determine what to report.</cite> - Stakeholders addressed: A narrow approach targets a limited audience (e.g., investors, regulators, or specific creditors) and signals compliance; a broad approach addresses a wider community of stakeholders (including employees, communities, customers, suppliers, NGOs) through dialogue and reporting on issues that materially affect them. <cite id="d7607bb2-0">Whether one chooses a narrow or broad approach depends on normative views about the intended scope and target audience.</cite> <cite id="d7607bb2-5">CSR reports can inform stakeholders about how a company has addressed their concerns, reflecting stakeholder engagement.</cite> <cite id="4a55f4d8-1">GRI has a larger scope and broader audience, while SASB enables deeper, sector-specific information for a more focused audience.</cite>

# What "narrow" CSR reporting entails

Figure 38. Example trajectory of DR Tulu on ResearchQA Part III.

55

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

DR Tulu 在 ResearchQA 第 III 部分上的轨迹示例

助理（最终答案）

<思考>计划：我们需要“狭义”与“广义”企业社会责任报告的权威定义和对比，特别是在（1）报告范围和（2）涉及的利益相关者方面。我将： - 使用最初的 Google 结果来确定关键的学术框架（范围和受众）。 - 添加 AA1000AS，通过利益相关者参与和实质性来落实“广泛”方法。 - 使用 GRI 与 SASB 的比较来具体说明广泛（全面、多利益相关者）与狭窄（集中、投资者材料）范围和受众。我已经运行了三个搜索并获得了相关片段：一篇同行评审的文章指出方法选择取决于预期范围和目标受众；将范围缩小到法律要求的信息的示例；多个 GRI{SASB 来源表明 GRI 的广泛范围和受众与 SASB 的重点/投资者重要性。我将综合这些，指出哪些证据是明确的（范围和受众差异）以及哪些证据是推论的（将“广泛”映射到 AA1000AS 利益相关者参与/重要性）。然后，我将给出一个结构化的答案，并对每个主张进行引用。

剩余差距：直接明确定义“狭义”与“广义”企业社会责任报告术语的论文将是理想的选择，但 PMC 文章和其他来源足以解释范围和受众的区别。我将继续综合。

答案结构： - 定义和框架：“窄”与“宽”在范围和受众方面的含义。 - 范围差异：合规/所需信息与综合材料问题。 - 涉及的利益相关者：狭义（选定的投资者/监管机构/债权人）与广泛（所有受到重大影响的利益相关者，包括社区、客户、员工、

供应商、非政府组织）。 - 标准映射：AA1000AS（利益相关者参与/重要性）、GRI（广义）、SASB（狭义/投资者重要性）作为说明性示例。

</think> <answer> # 简短回答

- 范围：狭隘的企业社会责任报告方法将披露限制在一组有限的问题上，通常是法律要求的或以合规为导向的；广泛的方法涵盖通过利益相关者参与经济、环境和社会层面确定的更广泛的实质性问题。 <cite id="d7607bb2-6">缩小企业社会责利益相关者参与的明确流程，以确定要报告的内容。</cite> - 针对利益相关者：狭隘的方法针对有限的受众（例如投资者、监管机构或特定债权人）并表示合规；广泛的方法通过对话和报告对利益相关者产生重大影响的问题来解决更广泛的利益相关者群体（包括员工、社区、客户、供应商、非政府组织）。 <cite id="d7607bb2-0">选择狭义还是广义的方法取决于对预期范围和目标受众的规范性看法。</cite> <cite id="d7607bb2-5">企业社会责任报告可以让利益相关者了解公司如何解决他们的担忧，反映利益相关者的参与。</cite> <cite id="4a55f4d8-1">GRI 具有更大的范围和更广泛的受众，而 SASB 可以为利益相关者提供更深入、针对特定行业的信息。受众更加集中。</cite>

# “狭义”企业社会责任报告意味着什么

图 38.ResearchQA 第 III 部分中 DR Tulu 的轨迹示例。

55

<!-- page 56 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research

Example Trajectory of DR Tulu on ResearchQA Part IV

Assistant (Final Answer)

- Reporting scope: Restricted to a small set of issues, typically where regulation or minimal standards dictate disclosure; this constrains the breadth of topics and the depth of information. <cite id="d7607bb2-6">Confining CSR reporting to information required under securities laws is a concrete way to narrow scope.</cite> - Stakeholders addressed: Primarily those with formal information rights or enforcement powers (e.g., investors, regulators, creditors) rather than a broad stakeholder community; the report often signals compliance rather than engaging a wider set of interest groups. <cite id="d7607bb2-0">Choice of a narrow approach is linked to a narrower target audience.</cite> <cite id="d7607bb2-5">A narrow CSR report addresses concerns raised by a more limited set of stakeholders compared to a broad report.</cite>

# What "broad" CSR reporting entails

- Reporting scope: Comprehensive coverage of material issues determined through inclusive stakeholder engagement and materiality assessments across environmental, social, and governance domains; this typically includes balanced, context-sensitive issues with depth where material. <cite id="59a6bf6a-2">Materiality and inclusivity require a defined stakeholder engagement process to guide what is included.</cite> <cite id="4a55f4d8-4">Materiality is used to establish the report's scope and included issues.</cite> <cite id="4a55f4d8-6">GRI Standards are designed to be used by organizations in any sector, implying broader coverage.</cite> - Stakeholders addressed: A wide range of stakeholders who can affect or are affected by the organization, including employees, communities, customers, suppliers, NGOs, and regulators, with reporting intended to inform and facilitate dialogue. <cite id="d7607bb2-0">A broad approach targets a broader audience.</cite> <cite id="d7607bb2-5">CSR reports in a broad approach inform stakeholders about how their concerns have been addressed, reflecting engagement.</cite> <cite id="4a55f4d8-2">GRI is designed to provide information to a broad audience, while SASB dives deeper for a more specific one.</cite>

# How standards illustrate the difference

- AA1000AS (Accountability Principles): Embeds materiality in stakeholder engagement (principles of inclusivity, materiality, and responsiveness), operationalizing a

broad approach that defines scope through dialogue with those affected and allocating limited resources to material topics. <cite id="59a6bf6a-2">AA1000 emphasizes inclusivity, materiality, and responsiveness via structured stakeholder engagement.</cite> <cite id="59a6bf6a-8">A material topic is one that will substantively influence assessments, decisions, actions, and performance of the organization and/or stakeholders.</cite> - GRI: Broad, global framework that covers a wide range of sustainability topics and guides scope via materiality assessments, addressing diverse stakeholder groups. <cite id="4a55f4d8-6">GRI Standards are sector-applicable and designed for broad use, covering a wide range of sustainability topics.</cite> <cite id="4a55f4d8-4">GRI requires identifying material topics to establish scope.</cite> <cite id="4a55f4d8-1">GRI's scope is larger and intended for a broader audience than SASB.</cite> - SASB: Narrower, investor-oriented framework that focuses on industry-specific, financially material issues, enabling deeper coverage for a focused audience (primarily investors). <cite id="4a55f4d8-1">SASB enables deeper, sector-specific

information for a more focused audience than GRI.</cite> <cite id="4a55f4d8-8">SASB is focused on financially material ESG issues in specific industries, i.e., a narrower scope and audience.</cite> ... (Response truncated for brevity; see our full example in our static demo.)

Figure 39. Example trajectory of DR Tulu on ResearchQA Part IV.

56

### 本页中文译文

DR Tulu：强化学习与不断发展的深度研究标准

DR Tulu 在 ResearchQA 第 IV 部分上的轨迹示例

助理（最终答案）

- 报告范围：仅限于一小部分问题，通常是法规或最低标准要求披露的问题；这限制了主题的广度和信息的深度。 <cite id="d7607bb2-6">将企业社会责任报告限制在证券法要求的信息范围内是缩小范围的具体方法。</cite> - 涉及的利益相关者：主要是那些拥有正式信息权或执行权的人（例如投资者、监管机构、债权人），而不是广泛的利益相关者群体；该报告常常表明遵守，而不是让更广泛的利益群体参与。 <cite id="d7607bb2-0">选择狭义方法与更窄的目标受众相关。</cite> <cite id="d7607bb2-5">与广义报告相比，狭义企业社会责任报告解决了更有限的利益相关者提出的担忧。</cite>

# “广泛”的企业社会责任报告意味着什么

- 报告范围：全面覆盖通过环境、社会和治理领域的包容性利益相关者参与和重要性评估确定的重大问题；这通常包括平衡的、上下文敏感的问题以及材料的深度。 <cite id="59a6bf6a-2">重要性和包容性需要明确的利益相关者参与流程来指导所包含的内容。</cite> <cite id="4a55f4d8-4">重要性用于确定报告的范围和所包含的问题。</cite> <cite id="4a55f4d8-6">GRI 标准旨在供任何部门的组织使用，这意味着覆盖范围更广。</cite> - 涉及的利益相关者：能够影响组织或受组织影响的广泛利益相关者，包括员工、社区、客户、供应商、非政府组织和监管机构，报告旨在告知和促进对话。 <cite id="d7607bb2-0">广泛的方法针对更广泛的受众。</cite> <cite id="d7607bb2-5">广泛的企业社会责任报告让利益相关者了解他们的担忧是如何得到解决的，从而体现了参与度。</cite> <cite id="4a55f4d8-2">GRI 旨在向广泛的受众提供信息，而 SASB 则深入研究更具体的受众。</cite>

# 标准如何说明差异

- AA1000AS（问责原则）：将实质性纳入利益相关者参与（包容性、实质性和响应性原则），

广泛的方法，通过与受影响者的对话来确定范围，并将有限的资源分配给实质性主题。 <cite id="59a6bf6a-2">AA1000 强调通过结构化的利益相关者参与来实现包容性、实质性和响应性。</cite> <cite id="59a6bf6a-8">实质性主题是指将对组织和/或利益相关者的评估、决策、行动和绩效产生实质性影响的主题。</cite> - GRI：广泛的全球框架，涵盖广泛的可持续发展主题，并通过实质性评估指导范围，针对不同的利益相关者群体。 <cite id="4a55f4d8-6">GRI 标准是行业适用的，旨在广泛使用，涵盖广泛的可持续发展主题。</cite> <cite id="4a55f4d8-4">GRI 需要确定实质性主题来确定范围。</cite> <cite id="4a55f4d8-1">GRI 的范围比 SASB 更大，面向更广泛的受众。</cite> - SASB：更窄，以投资者为导向的框架，重点关注特定行业的财务重大问题，为重点受众（主要是投资者）提供更深入的报道。 <cite id="4a55f4d8-1">SASB 能够实现更深入、针对特定行业的

为比 GRI 更集中的受众提供信息。</cite> <cite id="4a55f4d8-8">SASB 专注于特定行业中具有重大财务意义的 ESG 问题，即范围和受众范围更窄。</cite> ...（为简洁起见，响应被截断；请参阅静态演示中的完整示例。）

图 39.ResearchQA 第 IV 部分中 DR Tulu 的轨迹示例。

56
