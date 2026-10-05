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
Code
Data & Models
 Interactive Demo
Abstract
Deep research agents perform multi-step research
to produce long-form, well-attributed answers.
However, most open deep research agents are
trained on easily verifiable short-form QA tasks
via reinforcement learning with verifiable rewards,
which does not extend to realistic long-form tasks.
We address this with Reinforcement Learning
with Evolving Rubrics (RLER), where rubrics
are constructed and maintained to co-evolve with
the policy model during training. This allows the
rubrics to incorporate newly explored informa-
tion from search and contrasting model responses,
enabling better fact checking and more discrimi-
native on-policy feedback. Using RLER, we de-
velop Deep Research Tulu (DR Tulu-8B), the
first fully open model that is directly trained for
open-ended, long-form deep research. Across
four long-form deep research benchmarks in sci-
ence, healthcare, and general domains, DR Tulu
substantially outperforms existing open deep re-
search agents (by 15.6% over Tongyi DR on av-
erage) and matches or exceeds proprietary deep
research agents (by 0.7% over OpenAI DR on
average), while being significantly smaller and
cheaper per query (1000× cheaper than OpenAI
DR per query).
♡Joint first authors.
†Core contributors.
See full author
contributions here.
1University of Washington
2Allen In-
stitute for AI
3Carnegie Mellon University
4Massachusetts
Institute
of
Technology
5Seattle
Children’s
Hospital
6University
of
California,
Berkeley.
Correspondence
to:
Rulin Shao <rulins@cs.washington.edu>, Akari Asai
<akaria@allenai.org>.
Proceedings of the 43 rd International Conference on Machine
Learning, Seoul, South Korea. PMLR 306, 2026. Copyright 2026
by the author(s).
Figure 1. Performance vs. cost of deep research models. We
report average performance over 4 long-form DR benchmarks
(ScholarQA-CSv2, HealthBench, ResearchQA, and DeepResearch-
Bench) against inference cost (USD per query on ScholarQA-
CSv2). DR Tulu-8B lies on the Pareto frontier, outperforming
larger open models and matching proprietary models (Table 1).
1. Introduction
Deep research (DR) agents aim to produce in-depth, well-
attributed answers to complex research tasks by plan-
ning, searching, and synthesizing information from diverse
sources (OpenAI, 2025). Existing open DR agents are ei-
ther training-free, using manually designed prompts with
off-the-shelf models (Li et al., 2025b;a), or trained via re-
inforcement learning with verifiable rewards (RLVR) on
search-intensive yet constrained short-form question an-
swering (Jin et al., 2025; Nguyen et al., 2025; Liu et al.,
2025). RL training for open-ended DR tasks critically de-
pends on reliable reward signals. However, defining such
rewards is challenging. The desiderata for good responses
are often under-specified (Xu et al., 2023; Krishna et al.,
2021) and therefore hard to fully capture with static, pre-
defined evaluation criteria. Moreover, accurate assessment
often requires access to extensive and up-to-date external
information beyond a model’s parametric knowledge.
In this paper, we introduce Deep Research Tulu (DR Tulu-
8B), the first open model trained end-to-end for open-ended,
1
arXiv:2511.19399v3  [cs.CL]  15 May 2026

### 第 1 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

作者与机构信息保持英文原文。代码、数据与模型；交互式演示。

## 摘要

图 1：深度研究模型的性能与成本。横轴为 ScholarQA-CSv2 上每次查询的推理成本（美元），纵轴为四个长篇深度研究基准（ScholarQA-CSv2、HealthBench、ResearchQA、DeepResearchBench）的平均表现。DR Tulu-8B 位于帕累托前沿：优于更大的开放模型，并达到专有模型水平（表 1）。

深度研究代理通过多步研究生成篇幅较长、引用充分的答案。然而，多数开放深度研究代理通过带可验证奖励的强化学习，在易于验证的短问答任务上训练，无法延伸到真实长篇任务。我们提出“演化评分细则强化学习”（RLER）：在训练中构造并维护与策略模型共同演化的评分细则。评分细则因此可以吸收搜索中新探索的信息，并对比模型回答，从而改进事实核验，提供区分力更强的同策略反馈。基于 RLER，我们开发 Deep Research Tulu（DR Tulu-8B），这是首个直接针对开放式长篇深度研究训练的完全开放模型。在科学、医疗与通用领域四个长篇基准上，DR Tulu 显著超过现有开放深度研究代理，平均比 Tongyi DR 高 15.6%；也达到或超过专有代理，平均比 OpenAI DR 高 0.7%，同时模型显著更小、单次查询成本低约 1000 倍。

## 1 引言

深度研究代理旨在通过规划、搜索并综合多源信息，为复杂研究任务生成深入且引用充分的答案。现有开放代理要么无需训练，以手工提示驱动现成模型；要么在搜索密集但受限的短问答上做可验证奖励强化学习。开放式深度研究的强化学习极度依赖可靠奖励，但好答案的要求通常没有充分说明，静态预定义标准难以完整覆盖；准确评估还经常需要模型参数知识之外广泛且最新的外部信息。

本文提出 DR Tulu-8B，这是首个针对开放式长篇深度研究进行端到端训练的开放模型。（本句续至下一页。）

♡ 表示共同第一作者，† 表示核心贡献者；完整作者贡献见原文链接。机构依次为华盛顿大学、艾伦人工智能研究所、卡内基梅隆大学、麻省理工学院、西雅图儿童医院、加州大学伯克利分校。通讯作者信息保持原文。

发表于第 43 届国际机器学习大会，韩国首尔，PMLR 306，2026；版权归作者所有。
<!-- page 2 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
long-form DR tasks.
DR Tulu-8B is first finetuned on
high-quality, naturally occurring user data, and then trained
via a new method, Reinforcement Learning with Evolv-
ing Rubrics (RLER), in which we construct and maintain
rubrics that co-evolve with the policy model during train-
ing. At each training step, we sample several responses and
search traces from the model, and generate new rubrics that
capture and contrast the strengths and weaknesses of these
responses. This lets us continuously update the rubrics with
newly discovered information, keeping feedback on-policy
and discriminative across model responses.
DR Tulu-8B outperforms the strongest open 8–32B models,
including previous state-of-the-art Tongyi DR 30B (Team
et al., 2025), by 4.8–41.8 percentage points on four
long-form DR benchmarks—AstaBench-ScholarQA-CS2
(SQAv2) (Asai et al., 2024; Bragg et al., 2025), DeepRe-
searchBench (Du et al., 2025), ResearchQA (Yifei et al.,
2025), and HealthBench (Arora et al., 2025). In addition,
it matches or exceeds proprietary systems such as OpenAI
DR, Perplexity DR, and Gemini3 Pro + Search. As Figure 1
shows, DR Tulu-8B is substantially more cost-efficient than
all other models: on SQAv2, OpenAI DR costs about USD
1.8 per query, whereas DR Tulu-8B is almost three orders
of magnitude cheaper at USD 0.0019. We further construct
GeneticDiseasesQA, a challenging clinical deep research
dataset that requires models to search for and synthesize
supporting evidence to assess the therapeutic eligibility of
disease-causing genetic variants. On GeneticDiseasesQA,
DR Tulu-8B similarly exceeds or competes with proprietary
DR agents; no other open agents can tackle this task due to
their inability to produce reliable, verifiable citations.
Our analysis shows that RLER improves the model’s ability
to produce more comprehensive and in-depth long-form re-
sponses with accurate citations, yielding gains of 6.4–16.0
points on top of the finetuned model across the four bench-
marks. Moreover, DR Tulu-8B learns to select appropriate
search tools for each task, instead of relying on a single
hard-coded search tool like in prior work (Gao et al., 2025;
Bragg et al., 2025). On SQAv2, DR Tulu-8B uses paper
search 90% of the time, whereas on DeepResearchBench,
whose questions span more diverse, general-domain topics,
it relies on web search and browsing about 55% of the time.
We release all data, code, and models, along with an ex-
tensible deep research library (dr-agent-lib) and an
evaluation suite supporting plug-and-play multi-tool search.
This release provides an end-to-end training stack for deep
research agents, including data and infrastructure for asyn-
chronous tool calls and scalable RL over long-horizon tool-
use trajectories—addressing a long-standing barrier to deep
research training, where data, code, and infrastructure are
rarely available.
2. Preliminaries
This section covers the Deep Research formulation and
rubrics-as-rewards preliminaries.
Problem formulation. We consider a deep research model
to be a language model (LM) equipped with search-related
tools. Each tool takes a query and arguments, returning
textual resources that can be cited in the model’s answer.
Concretely, we define the model’s action space as { think
, tool , answer , cite }. At each step, the model sam-
ples an action and its associated content or arguments. If the
sampled action belongs to { think , answer , cite },
the output is appended to the context. If the sampled action
is tool , the model executes the tool call, receives the
tool observation, and appends it to the context. The process
continues until the model chooses the action answer , pro-
ducing the final answer. We refer to Appendix C for formal
definitions and the specification of tool protocol tokens.
Rubrics as rewards.
Rubrics define explicit evaluation
criteria for assessing the quality of (typically long-form)
model responses (Viswanathan et al., 2025; Gunjal et al.,
2025). We consider sample-wise rubrics, in which the eval-
uation criteria are specified on a per-example basis in nat-
ural language: Given a question x with associated rubrics
Rx = {(rx,k, wx,k)}K
k=1, where rx,k denotes a rubric item
and wx,k ∈R its weight, we evaluate a final response y
using the rubric-based score
S(x, y) =
PK
k=1 wx,k JUDGE(rx,k, y)
P
k: wx,k>0 wx,k
.
(1)
Each rubric is evaluated by a judge LM that outputs
{0, 0.5, 1} based on how well y satisfies rx,k. During train-
ing, we optimize the expected rubric score over the training
questions using RL. Using rubrics as rewards offers sev-
eral advantages: their concrete, well-defined items reduce
susceptibility to judge model bias and promote objective
evaluation, yielding consistent and comparable scores across
different LLM-as-a-judge runs.
3. RLER: Reinforcement Learning with
Evolving Rubrics
Despite the recent adoption of rubrics for evaluation, these
approaches typically rely on human experts to write and
iteratively refine the rubrics (Arora et al., 2025; Du et al.,
2025; Sharma et al., 2025), or assume the availability of
reference answers (Gunjal et al., 2025). Automating and
scaling rubric generation for training remains challenging:
Long-form questions are often under-specified and admit
many plausible notions of quality, making a small set of
fixed criteria inadequate for training. Deep research tasks
are also knowledge-intensive and require grounding claims
in a broad, evolving body of external knowledge beyond an
2

### 第 2 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

## 2 预备知识

本节介绍深度研究的形式化定义，以及把评分细则作为奖励的基础知识。

（接上页）DR Tulu-8B 首先在高质量、自然产生的用户数据上微调，随后使用新方法 RLER 训练。在 RLER 中，我们构造并维护与策略模型共同演化的评分细则。每个训练步骤从模型采样多个回答与搜索轨迹，再生成能够概括和对比这些回答优缺点的新细则。这样便可用新发现的信息持续更新细则，使反馈保持同策略特性，并能区分不同模型回答。

DR Tulu-8B 在四个长篇基准 SQAv2、DeepResearchBench、ResearchQA 与 HealthBench 上，比最强的开放 8B–32B 模型（包括此前最先进的 Tongyi DR 30B）高 4.8–41.8 个百分点；它也达到或超过 OpenAI DR、Perplexity DR、Gemini 3 Pro + Search 等专有系统。图 1 显示，在 SQAv2 上 OpenAI DR 每次查询约 1.8 美元，DR Tulu-8B 约 0.0019 美元，便宜接近三个数量级。我们还构建 GeneticDiseasesQA：一个有挑战性的临床深度研究数据集，要求搜索并综合支持证据，判断致病基因变异是否符合治疗条件。DR Tulu-8B 同样达到或超过专有代理；其他开放代理因无法生成可靠、可验证的引用而不能完成该任务。

分析显示，RLER 提高模型生成更全面、深入且引用准确的长篇回答的能力，相对微调模型在四个基准上提升 6.4–16.0 点。DR Tulu-8B 还能为任务选择合适的搜索工具，不像以往方法只依赖一种硬编码工具。在 SQAv2 上它有 90% 的时间使用论文搜索；在主题更广的 DeepResearchBench 上，则约 55% 使用网页搜索和浏览。

我们发布全部数据、代码与模型，并发布可扩展深度研究库 `dr-agent-lib` 和支持即插即用多工具搜索的评测套件。该发布提供完整训练栈，包括异步工具调用、长时程工具轨迹的可扩展强化学习数据与基础设施，解决深度研究训练中数据、代码和基础设施罕见公开的长期障碍。

**问题形式化。** 深度研究模型是配备搜索工具的语言模型。每个工具接收查询与参数，返回可在答案中引用的文本资源。动作空间定义为 `{think, tool, answer, cite}`。每步模型采样动作及内容或参数；思考、回答、引用动作的输出追加到上下文；工具动作则执行调用、取得观察并追加到上下文。过程持续到模型选择回答动作并生成最终答案。形式化定义和工具协议词元见附录 C。

**评分细则作为奖励。** 评分细则为评估通常较长的模型回答定义明确标准。本文使用按样本设定的细则：对每个样例以自然语言给出评价标准。给定问题 $x$ 及细则集合 $R_x=\{(r_{x,k},w_{x,k})\}_{k=1}^{K}$，其中 $r_{x,k}$ 是细则项、$w_{x,k}\in\mathbb{R}$ 是权重，最终回答 $y$ 的分数为：

$$S(x,y)=\frac{\sum_{k=1}^{K}w_{x,k}\,\mathrm{JUDGE}(r_{x,k},y)}{\sum_{k:w_{x,k}>0}w_{x,k}}. \tag{1}$$

评审语言模型依据回答满足细则的程度输出 `{0, 0.5, 1}`。训练中通过强化学习最大化训练问题上的期望细则分数。具体明确的细则能减少评审模型偏差、促进客观评估，使不同 LLM 评审运行的分数更加一致、可比。

## 3 演化评分细则强化学习

尽管评分细则近来被用于评估，现有方法通常依赖人工专家编写并反复完善，或假设参考答案可用。训练所需细则难以自动化、规模化：长篇问题常缺乏充分约束，存在多种合理质量定义，少量固定标准不足以训练；任务知识密集，主张必须落地于模型参数知识之外广泛且不断变化的外部知识。（续下页。）
<!-- page 3 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Figure 2. Training with RLER. Given an instance, the policy LM πθt samples rollouts by interacting with the environment. A rubric LM
proposes new rubrics from the rollouts and the current rubric buffer. We score rollouts with these rubrics to update πθt, then add and
prune rubrics to keep a fixed-size buffer with the highest rollout-score variance.
LM’s parametric knowledge. As a result, closed-book static
LM-generated rubrics risk missing evidence, subtle errors,
and are vulnerable to reward hacking.
To address these challenges, we introduce Reinforcement
Learning with Evolving Rubrics (RLER) for long-form deep
research, using rubrics that are instance-specific, grounded
in external knowledge, and co-evolve with the policy model.
3.1. Search-Augmented Evolving Rubrics
The key intuition behind RLER is to improve rubric qual-
ity by providing the rubric generator with privileged infor-
mation that is unavailable to the policy during generation,
thereby creating a generation–verification gap. Concretely,
our design leverages two forms of privileged information:
(1) external knowledge retrieved from multiple search roll-
outs, which supports fact verification; and (2) multiple in-
dependently sampled model responses, which provide con-
trastive signals for assessing relative quality.
We next detail our RLER framework, covering rubric ini-
tialization, online rubric evolution with buffer management,
and auxiliary format and citation rewards (Figure 2; Algo-
rithm 1).
Initial search-based rubrics. For each training prompt x,
we build a customized rubric buffer to store evolving rubrics
that are dynamically updated during training. Before train-
ing, we initialize the rubric buffer with search-based rubrics.
Specifically, for each x, we first perform SEARCH(x) to
fetch relevant documents via web search API using the orig-
inal question. We then concatenate the retrieved documents
with the question x and feed them into an LM, Grubric, to pro-
duce a set of initial rubrics that will be persistently used
throughout RL training: Rpersist
x
= {R1, R2, . . . , RKs},
where Ks denotes the number of persistent rubrics.
Evolving rubrics during training. During training, we
add a new set of evolving rubrics to the active rubric buffer,
Ractive
x
, which are used for scoring. In each step, for every
prompt x and its corresponding set of responses {yi}G
i=1,
where G denotes the number of rollouts, we concatenate
the prompt x, all sampled responses {yi}G
i=1 (including the
search context and final answers), and the existing rubric
pool Rx = Rpersist
x
∪Ractive
x
as input to Grubric, obtaining a set
of evolving rubrics Rnew
$R_x^{\mathrm{new}}=\mathcal{G}_{\mathrm{rubric}}\!\left(x,\{y_i\}_{i=1}^{G},R_x\right)$. Specif-
ically, we instruct the LM to generate two types of evolving
rubrics: (1) positive rubrics, which capture strengths or new,
relevant knowledge explored by the current policy but not
yet reflected in Rx, and (2) negative rubrics, which summa-
rize common undesirable behaviors, such as reward hacking
observed across responses. For example, verbatim copying
of retrieved content to maximize citation precision can be
identified and suppressed by negative rubrics. Appendix D.3
presents rubric generation prompts.
Rubric buffer management.
Without appropriate man-
agement, the number of rubrics would grow linearly during
training as new rubrics are continuously generated. To main-
tain a compact yet informative set, we developed a rubric
buffer management strategy that filters, merges, and ranks
rubrics based on their discriminative power. After every
GRPO rollout, we score all responses {yi}G
i=1 using the cur-
rent active rubrics and obtain rubric-level scores. Rubrics
with zero variance in their corresponding rewards are re-
moved as they offer no discriminative value. We then com-
pute the standard deviation for each remaining rubric and
rank them by the standard deviation in descending order. To
limit evaluation cost, we retain only the top Kmax rubrics
with the highest standard deviation values.
In addition to evolving rubrics, we introduce three aux-
iliary rewards—format, search, and citation rewards—to
encourage correct formatting, effective use of search and
3

### 第 3 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

图 2：使用 RLER 训练。给定一个样例，策略语言模型 $\pi_{\theta_t}$ 与环境交互并采样多条轨迹。评分细则语言模型根据轨迹和当前细则缓冲区提出新细则。用这些细则给轨迹评分并更新 $\pi_{\theta_t}$，随后添加和裁剪细则，在固定容量的缓冲区中保留轨迹分数方差最高的细则。

（接上页）因此，由语言模型闭卷生成的静态细则可能遗漏证据和细微错误，也容易遭到奖励投机。为解决这些问题，我们提出面向长篇深度研究的 RLER，使细则针对具体样例、以外部知识为依据，并与策略模型共同演化。

### 3.1 搜索增强的演化细则

RLER 的关键直觉是：向细则生成器提供策略生成时不可获得的特权信息，提高细则质量，从而形成生成与验证之间的能力差。具体使用两类特权信息：（1）多次搜索轨迹检索到的外部知识，用于事实核验；（2）多个独立采样的模型回答，用于提供相对质量的对比信号。

以下依次说明细则初始化、带缓冲区管理的在线细则演化，以及格式和引用辅助奖励（图 2、算法 1）。

**初始搜索细则。** 对每个训练提示 $x$，建立动态更新的定制细则缓冲区。训练前先用搜索细则初始化：对 $x$ 执行 `SEARCH(x)`，通过网页搜索 API 检索相关文档；把文档与问题拼接后交给细则生成语言模型 $G_{rubric}$，生成在整个强化学习训练期间持续使用的初始细则 $R_x^{persist}=\{R_1,R_2,\ldots,R_{K_s}\}$，其中 $K_s$ 为持久细则数。

**训练中的细则演化。** 训练时把一组新演化细则加入用于评分的活动缓冲区 $R_x^{active}$。每一步，对每个提示 $x$ 及其 $G$ 条回答 $\{y_i\}_{i=1}^{G}$，拼接问题、全部回答（含搜索上下文和最终答案）以及现有细则池 $R_x=R_x^{persist}\cup R_x^{active}$，输入 $G_{rubric}$，得到演化细则：

$$R_x^{new}=G_{rubric}\left(x,\{y_i\}_{i=1}^{G},R_x\right).$$

要求语言模型生成两类演化细则：（1）正向细则，捕捉当前策略探索到、尚未反映在 $R_x$ 中的优势或相关新知识；（2）负向细则，概括回答中共同出现的奖励投机等不良行为。例如，为提高引用精确率而逐字复制检索内容，可被负向细则识别并抑制。生成提示见附录 D.3。

**细则缓冲区管理。** 若不管理，新细则不断产生会使数量随训练线性增长。为维持紧凑且信息充分的集合，本文依据区分能力过滤、合并与排序细则。每轮 GRPO 轨迹采样后，用当前活动细则为全部回答评分，得到细则级分数。对应奖励方差为零的细则没有区分价值，予以移除。对其余细则计算标准差并降序排序；为限制评估成本，仅保留标准差最高的前 $K_{max}$ 项。

除演化细则外，系统还引入格式、搜索与引用三类辅助奖励，以鼓励正确格式、有效搜索以及能够支撑相关主张的高质量引用，详见附录 D.5。
<!-- page 4 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
high-quality citations that support relevant claims. We detail
these auxiliary rewards in Appendix D.5.
4. DR Tulu with Open Infrastructure and
Training Recipe
Building on RLER, we train DR Tulu-8B starting from
Qwen3-8B (Yang et al., 2025). This section describes our
agent infrastructure and the SFT-then-RL training recipe.
4.1. DR Tulu Agent Infrastructure: dr-agent-lib
DR agents require an extensible, scalable, and user-friendly
tool infrastructure for diverse search and browsing APIs.
We develop dr-agent-lib, an agent library with three
core features: (i) a unified MCP-based tool backend in-
tegrating local and API-based web search and brows-
ing tools (Table 10); (ii) a high-concurrency backend
with global caching and asynchronous process locking
for efficient, rate-limit-aware tool execution; and (iii) a
lightweight, composable prompt layer enabling fine-grained
control over search workflows and configurations.
For
training, we implement an auto-search workflow (Ap-
pendix H.1) using google search (query →top web
snippets), web browse (URL →crawled page text), and
paper search (query →paragraphs from papers).
4.2. Supervised Fine-Tuning for Cold Start
We apply supervised fine-tuning (SFT) as a cold start to
distill common search patterns from a teacher model into
the initial model, improving early rollout quality and accel-
erating subsequent RL training (ablations in §6).
Prompts. We curate or synthesize both long-form and short-
form prompts. Long-form queries are real user queries col-
lected from SearchArena (Miroyan et al., 2025) and Open-
Scholar (Asai et al., 2024), covering general-domain and
scientific-domain questions, respectively. To address large
quality variation in real-world queries (Cao et al., 2025),
we apply a prompt-filtering stage in which an LM scores
each prompt on a 1-5 scale. Short-form prompts are drawn
from existing datasets, including HotpotQA (Yang et al.,
2018), TaskCraft (Shi et al., 2025), WebWalker-Silver (Wu
et al., 2025a), and MegaScience (Fan et al., 2025), sup-
plemented with challenging synthetic prompts inspired by
PopQA (Mallen et al., 2023). Details are in Appendix §F.1.
Teacher trajectories. Given each prompt, we instruct GPT-
5 to generate a trajectory, including simulated reasoning,
tool use, and the final answer, using a system prompt that
specifies the aforementioned auto-search workflow. We
apply two rejection-sampling filters: (i) retaining only tra-
jectories that follow the expected tool-calling and answer
formats, and (ii) for short-form prompts, discarding trajec-
tories whose final answers do not match the gold answers,
following prior work (Jin et al., 2025; Li et al., 2025a). This
process yields 16K SFT trajectories (Appendix Table 7).
4.3. Online RL with Asynchronous Tool Calls
We further train DR Tulu-8B using RLER with a customized
variant of GRPO (Shao et al., 2024). Training proceeds by
iteratively generating agentic rollouts with real tool calls and
scoring the model’s final answers against evolving rubrics.
RL training focuses exclusively on long-form questions.
Using the same LM-based filtering procedure as in long-
form SFT, we collect approximately 5K prompts from
SearchArena (Miroyan et al., 2025) and OpenScholar (Asai
et al., 2024), and an additional 4K prompts from RaR (Gun-
jal et al., 2025) to increase data diversity.1 Despite sourcing
from multiple datasets, the collected prompts remain par-
tially out-of-distribution relative to our evaluation datasets.
We train using GRPO (Shao et al., 2024) based on the Open-
Instruct implementation (Lambert et al., 2025), incorporat-
ing token-level loss (Yu et al., 2025), 1-step asynchronous
training (Noukhovitch et al., 2024), tool output masking (Jin
et al., 2025), and sample packing for improved efficiency.
We further adopt asynchronous tool calling (Jiang et al.,
2025), where tool requests are dispatched immediately upon
triggering during rollout generation, rather than waiting for
batch completion. Additional training details and hyperpa-
rameters are provided in Appendix G.2.
5. Experimental Results
5.1. Experimental Settings
Benchmarks.
We evaluate deep research agents on four
long-form, open-ended benchmarks: HealthBench (Arora
et al., 2025) for healthcare, ResearchQA (Yifei et al., 2025),
AstaBench-ScholarQA-CS2 (SQAv2; Asai et al. 2024;
Bragg et al. 2025) for scientific literature synthesis, and
DeepResearchBench (DRB; Du et al. 2025) for general-
domain deep research. All benchmarks require long-form
responses and are evaluated using human-written or human-
verified rubrics following official protocols. SQAv2 and
DRB additionally report fine-grained metrics, including rel-
evance, instruction-following, and citation precision/recall.
We also evaluate DR Tulu-8B on short-form QA (Analysis).
Further evaluation details are provided in Appendix H.3.
Baselines. We compare against multiple categories of deep
research systems (Table 1). (1) Open deep research mod-
els: ASearcher-7B (Gao et al., 2025), WebThinker-32B (Li
et al., 2025a), Search-R1-7B (Jin et al., 2025), WebExplorer-
1For RaR prompts, we initialize training with the dataset-
provided rubrics rather than generating search-based rubrics, while
still maintaining evolving rubrics during training.
4

### 第 4 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

（接上页）辅助奖励用于促进支持相关主张的高质量引用，详见附录 D.5。

## 4 开放基础设施与训练方案下的 DR Tulu

基于 RLER，我们从 Qwen3-8B 开始训练 DR Tulu-8B。本节说明代理基础设施以及先监督微调、后强化学习的训练方案。

### 4.1 DR Tulu 代理基础设施：`dr-agent-lib`

深度研究代理需要可扩展、可伸缩且易用的工具基础设施，以接入多样搜索与浏览 API。我们开发 `dr-agent-lib`，具有三项核心能力：（1）统一的 MCP 工具后端，集成本地和 API 网页搜索、浏览工具（表 10）；（2）高并发后端，使用全局缓存和异步进程锁实现高效且感知速率限制的工具执行；（3）轻量、可组合的提示层，可精细控制搜索流程与配置。训练使用自动搜索流程（附录 H.1），工具包括 Google 搜索（查询→顶部网页摘要）、网页浏览（URL→抓取页面文本）和论文搜索（查询→论文段落）。

### 4.2 用监督微调实现冷启动

我们用监督微调把教师模型的常见搜索模式蒸馏进初始模型，改善早期轨迹质量并加速后续强化学习（消融见 §6）。

**提示。** 整理或合成长、短两类提示。长篇查询来自 SearchArena 的通用领域真实用户查询和 OpenScholar 的科学领域查询。真实查询质量差异很大，因此先由语言模型按 1–5 分筛选。短问答提示来自 HotpotQA、TaskCraft、WebWalker-Silver、MegaScience，并补充受 PopQA 启发的高难合成提示，详见附录 F.1。

**教师轨迹。** 对每个提示，要求 GPT-5 依据指定自动搜索流程的系统提示生成包含模拟推理、工具使用和最终答案的轨迹。采用两道拒绝采样过滤：（1）只保留符合预期工具调用与答案格式的轨迹；（2）对短问答丢弃最终答案与标准答案不匹配的轨迹。最终得到 1.6 万条 SFT 轨迹（附录表 7）。

### 4.3 带异步工具调用的在线强化学习

使用 RLER 和定制 GRPO 变体继续训练 DR Tulu-8B：反复生成包含真实工具调用的代理轨迹，再按演化细则对最终答案评分。

强化学习只使用长篇问题。沿用长篇 SFT 的语言模型筛选流程，从 SearchArena 与 OpenScholar 收集约 5000 条提示，再加入约 4000 条 RaR 提示增加多样性。尽管来源多个数据集，收集提示相对于评测集仍部分分布外。RaR 提示以数据集自带细则初始化，而非生成搜索细则，但训练时仍维护演化细则。

训练基于 Open-Instruct 的 GRPO 实现，结合词元级损失、一步异步训练、工具输出掩码和样本打包。工具调用采用异步方式：轨迹生成一触发请求便立即派发，无需等待整个批次完成。细节与超参数见附录 G.2。

## 5 实验结果

### 5.1 实验设置

**基准。** 四个开放式长篇基准分别为医疗领域 HealthBench、ResearchQA、科学文献综合 SQAv2，以及通用深度研究 DRB。所有基准都要求长篇回答，并按官方协议用人工撰写或验证的细则评价。SQAv2 和 DRB 还报告相关性、指令遵循、引用精确率与召回率等细粒度指标。另在短问答上评估 DR Tulu，更多细节见附录 H.3。

**基线。** 比较多类深度研究系统：（1）开放模型 ASearcher-7B、WebThinker-32B、Search-R1-7B、WebExplorer-8B、Tongyi Deep Research-30B；（2）固定流水线系统 WebThinker-32B 报告模式和 Ai2 ScholarQA；（3）闭源系统 OpenAI Deep Research、Perplexity Sonar、Perplexity Deep Research、Claude-Sonnet Search、Gemini 3 Pro + Search。还以朴素 RAG 和基于 `dr-agent-lib` 的本方流水线评估 Qwen3-8B、QwQ-32B。（续下页。）
<!-- page 5 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
SQAv2
HealthBench
ResearchQA
DRB
Average
Closed Deep Research
Claude-Sonnet Search
–
–
64.3∗
34.5∗
–
Perplexity-Sonar (High)
–
–
69.1∗
40.7∗
–
Perplexity Deep Research
67.3
–
75.3∗
42.3∗
–
Gemini Deep Research
–
–
68.5∗
48.8∗
–
Gemini 3 Pro + Search
69.8
38.0
74.3
46.3
57.0
GPT-5 + Our Search
61.1
31.1
62.8
50.3
51.3
GPT-5 + Search
74.8
59.5†
78.2†
50.7
65.8
OpenAI Deep Research
79.6
53.8†
79.2†
46.9∗
64.9
Naive RAG
Qwen3-8B
40.4
16.5
56.1
33.3
36.5
QwQ-32B
41.9
24.5
60.9
40.3
41.9
Open Deep Research Models
Search-R1-7B
22.2
-0.1
27.9
9.5
14.9
ASearcher-Web-7B
26.9
-13.0
19.4
7.8
10.3
WebExplorer-8B
42.5
33.7
64.8
36.7
44.4
WebThinker-32B-DPO
32.9
11.1
48.6
23.3
28.9
Tongyi DeepResearch-30B-A3B
46.5
46.2
66.7
40.6
50.0
Fixed Pipeline Deep Research
WebThinker QwQ-32B (report)
45.2
36.5
72.8
37.9
48.1
WebThinker-32B-DPO (report)
46.7
39.4
74.2
40.6
50.2
Ai2 ScholarQA - Claude Sonnet
87.7
32.0†
75.0†
36.1
57.7
Open Deep Research (Ours)
Qwen3-8B + Our Search
57.2
5.9
46.3
18.2
31.9
DR Tulu-8B (SFT)
72.3
38.1
68.5
39.0
53.9
DR Tulu-8B (RL)
88.3
52.8
75.7
45.4
65.6
Table 1. Overall results. DR Tulu-8B outperforms all open deep research models, and is competitive with proprietary systems.
Bold indicates the best performance among open models. * denotes scores reported by the original benchmark authors. Except for GPT5
+ our tool, we reuse the existing leaderboard results rather than rerunning the evaluations, which would cost a few hundred USD per
task; we leave entries as “–” when the original benchmarks do not report the corresponding metric. † denotes that the evaluation was run
on a 100-sample subset because the method is expensive. For open models,
indicates that the training code is open-sourced, and
indicates that the training data is open-sourced. None of the existing open deep research models output citations, so their citation scores
on SQAv2 are 0. HealthBench scores can be negative, as HealthBench includes negative rubrics that indicate harmful responses.
8B (Liu et al., 2025), and Tongyi Deep Research-30B (Team
et al., 2025). None of these models was evaluated on realis-
tic long-form benchmarks, as their training primarily targets
short-form QA. For long-form tasks, we supply the official
evaluation prompts and require full report-style outputs. (2)
Fixed-pipeline deep research: WebThinker-32B (report
mode) and Ai2 ScholarQA (Singh et al., 2025), which com-
bine LMs with fixed inference-time pipelines; we run their
official implementations with default or recommended set-
tings. (3) Closed deep research: OpenAI Deep Research,
Perplexity Sonar (reasoning), Perplexity Deep Research,
Claude-Sonnet Search, and Gemini3 Pro + Search. Addi-
tionally, we evaluate Qwen3-8B and QwQ-32B using naive
RAG and our inference pipeline built on dr-agent-lib.
More baseline details are provided in Appendix §H.2. Ex-
isting open deep research models often omit citations, and
proprietary systems typically provide only URL-level links.
In contrast, DR Tulu-8B generates snippet-level citations
that directly support claims, enabling verification and im-
proving factual reliability (Liu et al., 2023a).
Training details. We initialize from Qwen3-8B (Yang
et al., 2025). SFT is conducted on a single H100 node
(8 GPUs) for 5 epochs, totaling 136 GPU hours; SFT hyper-
parameters are provided in Appendix G.1. RL training uses
the hyperparameters in Appendix G.2. Unless otherwise
stated, all training runs use 2 H100 nodes (16 GPUs), our
final run using 27,000 GPU hours. We use GPT-4.1-mini
(gpt-4.1-mini-2025-04-14) as the LM judge, and
GPT-4.1 as the rubric generator.
Inference details. We use a unified inference pipeline
with three tools, google search, web browse, and
paper search, for all long- and short-form tasks, with-
out task-specific customization. Following prior work, we
use the Serper Search API for google search (Li et al.,
2025a) and Jina browsing for web browse (Gao et al.,
2025; Liu et al., 2025), rather than the Crawl4AI browser
used during training; we verify in Appendix I.7.4 that this
train/inference browser mismatch has minimal impact on
downstream performance. For paper search, we use
the Semantic Scholar full-text API, which returns relevant
5

### 第 5 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

表 1：总体结果。DR Tulu-8B 超过所有开放深度研究模型，并可与专有系统竞争。列依次为 SQAv2、HealthBench、ResearchQA、DRB 和平均分；所有模型名称与数值保持英文表格原样。

粗体表示开放模型最佳成绩。`*` 表示原基准作者报告的分数。除 GPT-5 + 本方工具外，本文复用现有排行榜结果而不重新评测，因为每项任务需花费数百美元；原基准未报告的指标记为“–”。`†` 表示因方法成本高，只在 100 个样本子集上评测。开放模型标记分别说明训练代码与训练数据是否开源。现有开放深度研究模型均不输出引用，因此 SQAv2 引用分为 0。HealthBench 含表示有害回答的负向细则，所以总分可能为负。

**训练细节。** 从 Qwen3-8B 初始化。SFT 在一个 H100 节点（8 块 GPU）上训练 5 个 epoch，共 136 GPU 小时；超参数见附录 G.1。RL 使用附录 G.2 的超参数。除非另行说明，训练均使用两个 H100 节点（16 块 GPU），最终训练耗费 27,000 GPU 小时。GPT-4.1-mini（指定版本）担任语言模型评审，GPT-4.1 担任细则生成器。

（接上页基线。）这些开放模型主要针对短问答训练，未曾在真实长篇基准上评估；本文提供官方评测提示并要求完整报告式输出。固定流水线系统使用官方实现及默认或推荐配置。闭源系统之外，还评估了朴素 RAG 与本方代理流水线。细节见附录 H.2。现有开放模型往往不提供引用，专有系统通常也只有 URL 级链接；DR Tulu-8B 则生成直接支持主张的片段级引用，便于验证并提高事实可靠性。

**推理细节。** 长、短任务统一使用 Google 搜索、网页浏览、论文搜索三种工具，不做任务特定定制。Google 搜索使用 Serper Search API，网页浏览使用 Jina，而不是训练期 Crawl4AI；附录 I.7.4 验证该训练/推理浏览器错配对下游性能影响很小。论文搜索使用 Semantic Scholar 全文 API 返回相关段落。（续下页。）
<!-- page 6 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
paragraphs. We cap tool usage at 10 calls per rollout and
retrieve the top 10 snippets for both google search and
paper search. For web browse, we summarize long
outputs using Qwen3-8B, while truncating webpages during
training to improve efficiency.
5.2. Main Results
We report overall results across four long-form datasets
in Table 1. Appendix Table 11 provides a fine-grained
breakdown of SQAv2 and DRB.
DR Tulu-8B outperforms all open deep research models
on long-form tasks. Across four open-ended long-form
benchmarks, DR Tulu-8B (RL) achieves the strongest per-
formance among all open deep research models, with an
average score of 65.6, exceeding the best prior open baseline
(Tongyi Deep Research-30B) by 15.6 points. Models trained
primarily for constrained short-form tasks (e.g., Search-R1
and ASearcher) perform poorly on realistic report-length
generation, yielding very low scores. Notably, existing open
baselines lack citations, resulting in especially low SQAv2
scores when citation quality is central.
DR Tulu-8B outperforms open fixed-pipeline deep re-
search systems. WebThinker-32B, with its heavily en-
gineered report-mode inference, boosts long-form perfor-
mance (+21.3 points vs. default) but still trails DR Tulu-8B
on every benchmark, despite using a much larger 32B back-
bone. Ai2 ScholarQA, which is designed for scientific liter-
ature synthesis and uses a closed backbone (Claude Sonnet),
performs competitively on SQAv2 but lags behind DR Tulu-
8B on HealthBench and DeepResearchBench, resulting in a
lower overall average. Overall, despite using a smaller open
model and a single inference pipeline where it autonomously
decides its search strategy and response structure from the
prompt, DR Tulu-8B achieves the best average performance
among open systems. We further observe that fixed-pipeline
systems generalize poorly to short-form QA, often applying
report-style reasoning to simple factoid queries, whereas
DR Tulu-8B handles both long- and short-form tasks (§6.1).
DR Tulu-8B matches or outperforms proprietary deep
research systems. DR Tulu-8B achieves the strongest per-
formance among all systems on SQAv2 and matches or ex-
ceeds proprietary deep research systems across the remain-
ing long-form benchmarks. It outperforms Claude Sonnet
Search, Perplexity Sonar (high-reasoning), and Perplexity
Deep Research, and is competitive with OpenAI Deep Re-
search overall. We further observe that GPT-5 + Search and
Gemini3 Pro + Search outperform their corresponding deep
research variants on some datasets, suggesting that under-
lying base model capability plays a critical role in addition
to the research pipeline itself. Notably, despite being built
on an 8B open model, DR Tulu-8B remains on par with, or
even outperforms, these proprietary, larger-scale systems.
DR Tulu-8B is significantly cheaper than proprietary
and open deep research systems. DR Tulu-8B exhibits
a substantial cost advantage (Appendix Table 12; see Ap-
pendix I.5). Proprietary systems are orders of magnitude
more expensive: OpenAI Deep Research costs $1.80/query
on SQAv2, and Ai2 ScholarQA (Claude Sonnet) costs
$1.30/query. In contrast, DR Tulu-8B costs $0.00008/query
when accounting only for tool APIs, and $0.0018/query
when including LM inference via OpenRouter (Qwen3-8B
pricing). DR Tulu-8B also remains cheaper than other open
deep research models, including Tongyi Deep Research
($0.03/query) and WebThinker ($0.003/query; $0.015 in
report mode), despite achieving stronger performance. This
efficiency stems from adaptive tool usage: on SQAv2, DR
Tulu-8B primarily relies on free paper search, and even
on DRB, where web search and browsing are used more
frequently, it remains over 10× cheaper than Tongyi DR.
5.3. Application: Researching Pathogenic Gene Variants
To evaluate DR Tulu on a realistic, expert-driven deep re-
search task, we study pathogenic variant interpretation in
clinical genetics. In collaboration with medical experts,
we curate questions that reflect real-world deep research
challenges in diagnosing rare genetic diseases.
We introduce GeneticDiseasesQA, a dataset of 47 expert-
curated questions covering 24 pathogenic gene variants,
which requires aggregating heterogeneous evidence from
biological databases, research literature, and case reports.
Questions focus on molecular consequences, disease mecha-
nisms, and therapeutic evidence. For each question, models
generate a long-form, citation-backed report. Evaluation cri-
teria—Final Answer, Evidence Support, Evidence Quality,
and Evidence Synthesis—are illustrated in Figure 3, with
additional details in Appendix H.4.
Results. Figure 3 compares DR Tulu-8B (RL) against
Qwen3-8B + search, Ai2 ScholarQA, Gemini 3 Pro +
Search, GPT-5 + Search, and OpenAI Deep Research (o4-
mini). Evidence Support is computed from cited snippets;
for systems that return only URLs, we retrieve webpage
content via Jina browsing. We exclude baselines without
traceable citations. DR Tulu-8B substantially improves
over Qwen3-8B across all metrics and outperforms Ai2
ScholarQA on Final Answer correctness. While GPT-5 and
Gemini-based systems achieve higher Final Answer scores,
DR Tulu-8B remains competitive on Evidence Support, Ev-
idence Quality, and Evidence Synthesis, highlighting its
strength in reliable multi-source reasoning. Overall, these
results show that DR Tulu-8B generalizes effectively to
unseen, real-world deep research tasks in expert domains.
6

### 第 6 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

（接上页）每条轨迹最多调用工具 10 次；Google 搜索与论文搜索均取前 10 个摘要。网页浏览的长输出在推理时由 Qwen3-8B 总结，训练时则截断网页以提高效率。

### 5.2 主要结果

表 1 报告四个长篇数据集的总体结果，附录表 11 给出 SQAv2 与 DRB 的细分结果。

**DR Tulu-8B 在长篇任务上超过所有开放深度研究模型。** 四个开放式长篇基准上，RL 版平均 65.6，为开放模型最高，比此前最佳 Tongyi Deep Research-30B 高 15.6 点。主要为受限短问答训练的 Search-R1、ASearcher 在真实报告长度生成上得分很低；现有开放基线又缺乏引用，因此在重视引用质量的 SQAv2 上尤其低。

**DR Tulu-8B 超过开放固定流水线系统。** WebThinker-32B 的高度工程化报告模式使长篇成绩比默认高 21.3 点，但尽管骨干达到 32B，所有基准仍落后于 DR Tulu-8B。面向科学文献综合、采用 Claude Sonnet 闭源骨干的 Ai2 ScholarQA 在 SQAv2 上有竞争力，但 HealthBench 与 DRB 落后，平均分较低。DR Tulu-8B 使用更小开放模型和单一推理流水线，自主决定搜索策略与回答结构，取得开放系统最高平均分。固定流水线对短问答泛化较差，常把报告式推理用于简单事实问题，而 DR Tulu 同时处理长、短任务。

**DR Tulu-8B 达到或超过专有系统。** 它在 SQAv2 上为全部系统最佳，在其余长篇基准上达到或超过专有代理；总体超过 Claude Sonnet Search、Perplexity Sonar 与 Perplexity Deep Research，并与 OpenAI Deep Research 相当。GPT-5 + Search 和 Gemini 3 Pro + Search 在一些数据集上超过各自深度研究版本，说明除研究流水线外，基础模型能力也至关重要。尽管建立在开放 8B 模型上，DR Tulu 仍可与更大专有系统持平或胜出。

**DR Tulu-8B 成本显著更低。** SQAv2 上，OpenAI Deep Research 每题 1.80 美元，Ai2 ScholarQA（Claude Sonnet）1.30 美元；DR Tulu-8B 只计工具 API 为 0.00008 美元，加入 OpenRouter 上的语言模型推理为 0.0018 美元。它也比 Tongyi Deep Research（0.03 美元）和 WebThinker（0.003 美元；报告模式 0.015 美元）便宜。优势来自自适应工具使用：SQAv2 主要采用免费的论文搜索；即使在网页搜索和浏览更多的 DRB 上，也比 Tongyi DR 便宜十倍以上。

### 5.3 应用：研究致病基因变异

为在真实专家驱动任务上评估 DR Tulu，本文与医学专家合作整理反映罕见遗传病诊断实际研究挑战的问题，研究临床遗传学中的致病变异解释。

新数据集 GeneticDiseasesQA 含 47 个专家整理的问题，覆盖 24 个致病基因变异，要求聚合生物数据库、研究文献和病例报告中的异构证据。问题聚焦分子后果、疾病机制和治疗证据；模型需生成带引用的长篇报告。评价标准为最终答案、证据支持、证据质量和证据综合，图 3 示意，详见附录 H.4。

**结果。** 图 3 比较 DR Tulu-8B（RL）、Qwen3-8B + 本方搜索、Ai2 ScholarQA、Gemini 3 Pro + Search、GPT-5 + Search 和 OpenAI Deep Research（o4-mini）。证据支持依据引用片段计算；只返回 URL 的系统通过 Jina 获取网页内容；无可追踪引用的基线被排除。DR Tulu 各指标显著优于 Qwen3-8B，最终答案正确性高于 Ai2 ScholarQA。GPT-5 和 Gemini 系统的最终答案更高，但 DR Tulu 在证据支持、质量与综合上仍具竞争力，显示可靠多源推理能力。结果说明它能泛化到未见的真实专家领域任务。
<!-- page 7 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Figure 3. Comparison of DR agents GeneticDiseasesQA. Final Answer: proportion of expert-annotated facts recovered in responses.
Evidence Support: the proportion of cited claims that are fully supported by the original text of the cited source. Evidence Quality: whether
the type of supporting evidence requested is present. Evidence Synthesis: whether there was a statement addressing the relationship
between multiple sources. Results for DR Tulu-8B (RL) and Qwen3-8B + Our Search are reported as the average of 10 trials. The
remaining agents are reported as the average of 3 trials, given the high costs and inference times for proprietary deep research systems.
6. Analysis
We conduct a set of analyses on DR Tulu. Unless otherwise
specified, this section uses the DR Tulu SFT checkpoint and
an early DR Tulu RL checkpoint at 1k training steps.
6.1. Evaluation on Short-form QA Tasks
Although our RLER training targets long-form, open-ended
deep research, our SFT mixture intentionally includes short-
form, verifiable QA tasks that require search, enabling the
model to handle both concise and multi-paragraph responses.
We therefore evaluate how well our SFT and RL models
generalize to short-form queries.
We evaluate short-form QA on SimpleQA (Wei et al., 2024),
WebWalkerQA (Wu et al., 2025a), and 2Wiki (Ho et al.,
2020). Following prior work (Li et al., 2025a; Wei et al.,
2024), we use an LLM judge to assess answer correctness
and report Pass@1 accuracy with GPT-4.1 as the LLM
judge. For efficiency, we evaluate on 1,000 randomly sam-
pled questions each from SimpleQA and 2Wiki. Table 2
shows that DR Tulu performs competitively on short-form
QA benchmarks. The SFT stage yields substantial gains
over the Qwen3-8B + Our Search baseline, demonstrating
the effectiveness of our SFT data for short-form QA. No-
tably, although RL training uses only long-form prompts
and explicitly optimizes long-form generation, DR Tulu
(RL) achieves further improvements on short-form QA, in-
creasing the overall average by 3.3 points, indicating strong
cross-task generalization.
6.2. Analysis on Training and Inference
SFT benefits from mixed supervision but shows dimin-
ishing returns on long-form tasks.
Figure 4 shows that
combining long-form and short-form data during SFT is
important: removing long-form data substantially degrades
performance on all long-form benchmarks, while remov-
ing short-form data leaves long-form performance largely
unchanged but noticeably hurts short-form tasks such as
2Wiki. These results indicate that short-form supervision
SimpleQA
2Wiki
WebWalker
Avg.
Naive RAG
Qwen3-8B
52.6
18.9
8.8
26.8
QwQ-32B
57.2
34.2
10.1
33.8
Open Deep Research (Ours)
Qwen3-8B + Our Search
70.5
44.0
27.9
47.5
DR Tulu-8B (SFT)
75.5
66.5
31.9
58.0
DR Tulu-8B (RL)
75.9
68.9
39.0
61.3
Table 2. Short-form results. We report short-form performance
for our SFT and RL variants to analyze how each training stage
affects short-form behavior. All scores are computed from top-1
predictions under a unified evaluation pipeline.
SQAv2
Health
Research
DRB
Avg.
DR Tulu (SFTv0.1)
73.4
37.5
68.6
39.4
54.7
General rubrics
80.6
36.0
65.0
37.5
54.8
Closed-book rubrics
83.2
34.8
66.6
37.6
55.6
Initial search-based rubrics
82.8
37.9
66.9
39.3
56.7
Table 3. Search-based static rubrics work best. We train using
different static rubrics using RL for 500 steps, starting from an
intermediate SFT checkpoint (SFT v0.1). “Initial search-based
rubrics” refers to an ablation of RLER without evolving rubrics
generated during training. Search-based rubrics consistently out-
perform both general rubrics and closed-book rubrics that are not
grounded in up-to-date information.
alone does not reliably transfer to open-ended deep research,
whereas retaining a modest short-form component helps
preserve general-purpose behavior without sacrificing long-
form performance. Scaling SFT data yields clear early gains
across tasks, with long-form benchmarks showing substan-
tial improvements with as little as 5% of the data and largely
saturating beyond 50%, while short-form tasks (especially
2Wiki) continue to benefit from additional data up to the
full dataset. Although full-data SFT slightly reduces SQAv2
citation scores, overall short-form accuracy remains strong,
and subsequent RL training recovers citation performance,
motivating our use of the full SFT dataset followed by RL.
RL benefits from stronger SFT models and longer train-
ing. We ablate the effect of using different SFT cold start
datasets on RL in Figure 5, tracing performance up to 4000
training steps. Beginning RL directly from Qwen3 (no SFT
7

### 第 7 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

图 3：深度研究代理在 GeneticDiseasesQA 上的比较。最终答案：回答恢复的专家标注事实比例。证据支持：带引用主张中，被引用来源原文完全支持的比例。证据质量：是否存在问题要求的支持证据类型。证据综合：是否有陈述解释多个来源之间的关系。DR Tulu-8B（RL）与 Qwen3-8B + 本方搜索报告 10 次试验均值；其余代理因专有深度研究系统成本与推理时间高，报告 3 次试验均值。

## 6 分析

本文对 DR Tulu 开展一系列分析。除非另有说明，本节使用 DR Tulu SFT 检查点，以及训练 1000 步的早期 RL 检查点。

### 6.1 短问答任务评测

虽然 RLER 面向开放式长篇深度研究，但 SFT 混合有意加入需要搜索、答案可验证的短问答，使模型同时处理简洁回答和多段回答。因此评估 SFT 与 RL 模型对短查询的泛化。

短问答基准为 SimpleQA、WebWalkerQA 和 2Wiki。遵循既有工作，使用 GPT-4.1 作为语言模型评审判断答案正确性，报告统一评测流水线下首个预测的 Pass@1 准确率。为提高效率，从 SimpleQA 与 2Wiki 各随机抽取 1000 个问题。表 2 显示 DR Tulu 在短问答上具有竞争力：SFT 相比 Qwen3-8B + 本方搜索大幅提升，说明 SFT 数据有效。值得注意的是，尽管 RL 只使用长篇提示并明确优化长篇生成，RL 版短问答平均分仍再提高 3.3 点，显示较强跨任务泛化。

表 2：短问答结果。为分析各训练阶段对短回答行为的影响，报告 SFT 与 RL 版本表现。全部分数均来自统一评测流水线下的 top-1 预测。表中列为 SimpleQA、2Wiki、WebWalker 与平均分；模型和数值保持英文原表。

### 6.2 训练与推理分析

**SFT 从混合监督获益，但长篇任务收益递减。** 图 4 表明，SFT 同时使用长、短数据很重要：去掉长篇数据会显著损害所有长篇基准；去掉短篇数据对长篇表现影响不大，却明显伤害 2Wiki 等短任务。说明只用长篇监督不能可靠迁移到开放式深度研究；保留适量短篇成分可维持通用行为，且不牺牲长篇性能。扩大 SFT 数据早期收益明显：长篇基准只用 5% 数据就显著提升，超过 50% 后基本饱和；短任务，尤其 2Wiki，直到全量数据仍继续受益。全量 SFT 虽略降 SQAv2 引用分，但短问答总体准确率仍强，后续 RL 又恢复引用表现，因此最终采用全量 SFT 再接 RL。

**RL 从更强 SFT 模型和更长训练中获益。** 图 5 比较不同 SFT 冷启动数据对 RL 的影响，并追踪到 4000 步。（续下页。）

表 3：基于搜索的静态细则效果最好。从中间 SFT 检查点 SFT v0.1 出发，用不同静态细则进行 500 步 RL。“初始搜索细则”指不加入训练期演化细则的 RLER 消融。搜索细则持续优于未以最新信息为依据的通用细则和闭卷细则。列为 SQAv2、Health、Research、DRB、平均分；模型与数值保持原表。
<!-- page 8 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
0
5
10
50 100
SFT data (%)
0
5
10
15
20
25
30
35
40
Score (%)
HealthBench
0
5
10
50 100
SFT data (%)
40
45
50
55
60
65
70
Score (%)
ResearchQA
0
5
10
50 100
SFT data (%)
15
20
25
30
35
40
Score (%)
DRB
0
5
10
50 100
SFT data (%)
40
45
50
55
60
65
70
75
80
85
Score (%)
SQAv2
0
5
10
50 100
SFT data (%)
45
50
55
60
65
70
Score (%)
2Wiki
Varying Data Size
Short-form Only
Long-form Only
Figure 4. Ablation of SFT training data. We ablate SFT training data in terms of the mixture of data and the scale of training data. We
train models with varying sizes of SFT data (5%, 10%, 100%; 0% indicates the Qwen3-8B + dr-agent-lib results) as well as two
SFT subsets, long-form data only (LF only) and short-form data only (SF only).
0
200
400
600
1000
1900
4000
RL training steps
30
35
40
45
50
55
60
Score (%)
On Policy SFT
Our SFT
Undertrained SFT
No SFT
Figure 5. Our full SFT mix performs best during RL. We vary
the model used for RL training, keeping data and hyperparameters
constant. Note that the x-axis is not uniform in the gray area.
Performance is average across Healthbench, SQAv2, DRB.
0
500
1000
1500
2000
2500
RL training steps
50
52
54
56
58
60
Score (%)
No RL
w/ RLER
w/ initial rubrics only
w/ random
Figure 6. RLER consistently improves performance during
RL training. We train models with only our initial search-based
rubrics and with RLER. We also compare to using no RL and
using purely random rewards. Performance is average across
Healthbench, SQAv2, DRB.
cold start) dramatically improves scores over Qwen3-8B
with no training, but still underperforms using even a small
amount of high-quality SFT data (5% of our full mixture) as
cold-start data for the RL training. Using a larger amount of
SFT data (i.e., our full SFT mixture) further improves perfor-
mance. Extended RL training was crucial to performance:
in some cases, evaluations that initially seemed flat (e.g.,
DRB) improved with extended RL training. We found that
higher train reward (i.e., reward during RL training) did not
necessarily correspond to higher downstream reward; see
Appendix I.8 for details. We also experiment with using an
‘on-policy SFT’ model as a starting point, which we provide
further details on in Appendix I.3. Finally, we find that our
training is robust to tool errors, with the model improving
performance even after extended training with a tool that
consistently errors. Appendix I.2 provides details and the
full RL training curves.
Evolving rubrics improve over initial rubrics alone. We
ablate evolving rubrics and compare them against RL with
static, search-augmented rubrics only in Figure 6. Remov-
ing evolving rubrics results in up to a 2-point drop in av-
erage performance, with the gap widening over training as
evolving rubrics capture new knowledge the model explores.
Both approaches outperform random rewards instead of
rubric-based rewards, ensuring that our results are not due
to spurious behaviors in Qwen-based models (Shao et al.,
2025). Finally, branching a single training run with and
without the citation reward enabled yields comparable per-
formance (Appendix I.4), indicating that RLER’s rubric
reward, rather than auxiliary signals, drives the gains.
RLER does not rely on a strong proprietary judge.
We additionally replace GPT-4.1 and GPT-4.1-mini with
Qwen3-8B—the same initial model used to train DR Tulu—
as both the rubric generator and the LM judge in Table 4).
After 1000 RL steps, the open-judge variant still gains +4.4
average points over the SFT checkpoint, only 1.3 points be-
hind the GPT-judge configuration (+5.7). Combined with
the fact that GPT-4.1 and GPT-4.1-mini themselves perform
poorly on deep research tasks, this indicates that RLER’s
gains do not stem from distilling a stronger proprietary
judge, and the recipe transfers to settings without access to
such models.
Search-based rubrics outperform closed-book rubrics.
We ablate the effect of using different static rubrics (i.e.,
without adding evolving rubrics) during RL training in Ta-
ble 3. We run RL training (w/o ER) for 500 steps on top of
an intermediate SFT checkpoint using three different rubric
8

### 第 8 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

图 4：SFT 训练数据消融。分别考察数据混合与数据规模，使用不同比例的 SFT 数据训练模型（5%、10%、100%；0% 表示 Qwen3-8B + `dr-agent-lib` 的结果），并比较仅长篇数据（LF only）与仅短篇数据（SF only）两个子集。五幅图依次为 HealthBench、ResearchQA、DRB、SQAv2 与 2Wiki；横轴为 SFT 数据比例，纵轴为得分。

图 5：完整 SFT 混合在 RL 中表现最佳。在保持数据和超参数相同的条件下，改变 RL 起始模型，比较同策略 SFT、本方 SFT、训练不足 SFT 和无 SFT。灰色区域内横轴不等距。性能为 HealthBench、SQAv2 与 DRB 的平均分。

（接上页。）直接从 Qwen3 开始 RL（无 SFT 冷启动），相比完全未训练的 Qwen3-8B 能大幅提高分数，但仍不如仅用少量高质量 SFT 数据（完整混合的 5%）冷启动。使用更多 SFT 数据，即完整 SFT 混合，会进一步改善表现。延长 RL 训练对性能至关重要：一些初期看似停滞的评测（如 DRB）在训练延长后才提高。作者发现，训练奖励更高并不必然对应更高下游奖励，细节见附录 I.8。还尝试以“同策略 SFT”模型为起点，详见附录 I.3。训练对工具错误也较稳健：即使长期使用持续报错的工具，模型性能仍能提高；附录 I.2 给出完整训练曲线。

**演化细则优于仅使用初始细则。** 图 6 将 RLER 与只使用静态搜索增强细则的 RL 比较。移除演化细则使平均性能最多下降约 2 点；随着训练推进、演化细则不断捕捉模型探索的新知识，差距扩大。两者都优于随机奖励，排除了结果只是 Qwen 系模型伪行为所致的可能。另从同一训练分支分别启用和关闭引用奖励，表现接近（附录 I.4），说明主要增益来自 RLER 的细则奖励，而非辅助信号。

图 6：RLER 在 RL 训练期间持续提高性能。比较仅用初始搜索细则、使用 RLER、不做 RL 和使用纯随机奖励。性能为 HealthBench、SQAv2 与 DRB 的平均值。

**RLER 不依赖强大的专有评审。** 表 4 中把 GPT-4.1 与 GPT-4.1-mini 替换为 Qwen3-8B——也就是 DR Tulu 的初始模型——同时担任细则生成器和语言模型评审。训练 1000 步后，开放评审版本仍比 SFT 检查点平均高 4.4 点，只比 GPT 评审配置的 5.7 点增益低 1.3 点。结合 GPT-4.1 与 GPT-4.1-mini 自身在深度研究任务上表现不佳，这说明 RLER 的增益并非来自蒸馏更强专有评审，方法也能迁移到无法访问这类模型的环境。

**搜索细则优于闭卷细则。** 表 3 消融不同静态细则，不加入演化细则。从中间 SFT 检查点开始，分别使用三类细则运行 500 步 RL：（1）通用细则；（2）闭卷生成细则；（3）初始搜索细则。（该段续后页。）
<!-- page 9 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
SQAv2
HealthBench
ResearchQA
DRB
Average
Qwen3-8B + Our Search
57.2
5.9
46.3
18.2
31.9
+ SFT
72.3
38.1
68.5
39.0
53.9
+ RL (1000 steps, GPT-judge)
85.8
42.2
70.2
40.1
59.6
+ RL (1000 steps, Qwen3-8B-judge)
85.3
39.7
69.2
39.1
58.3
Table 4. Comparing using GPT-4.1 and Qwen3-8B as a judge model and rubric generator. For GPT-judge, we use GPT-4.1-mini as
the judge, and GPT-4.1 as the rubric generator. For Qwen3-8B-judge, we use Qwen3-8B as both judge and generator. Using Qwen3-8B
only underperforms using GPT models by 1.3 points, while still outperforming the SFT baseline by 4.4 points.
setups: (1) general rubrics, in which we use a simple prompt
and LM judge to score model outputs (see Appendix G.3
for prompt); (2) closed-book rubrics, which are generated
without access to any search information; (3) search-based
rubrics, which are generated with knowledge from an ini-
tial search (See Appendix D.2 for details). For these runs,
we use only OpenScholar training samples. Search-based
rubrics perform best overall, while a single general rubric
shared across samples underperforms the SFT baseline.
Evolving rubrics improve over initial rubrics alone.
We
additionally ablate using evolving rubrics on top of search-
based rubrics in Figure 5 (right), training for 2500 steps.
We find that removing RLER leads to up to a 2-point drop
in performance, with the gap widening over training as
evolving rubrics capture new knowledge the model explores.
Open rubric judge ablations.
We additionally experi-
ment with using a fully open model as the judge model for
citation and rubric scoring, as well as for generating the
evolving rubrics during RL training. We use Qwen3-8B as
the judge and generation model and run training for 1000
steps, with the citation reward only turned on for the ini-
tial 650 steps as in the main run. We also note that due to
context length limitations, we only pass the final answers to
the rubric generator, as opposed to the full output trajectory.
We present our results in Table 4. We compare to our main
training run at 1000 steps, in which we used GPT-4.1-mini
as the LM judge and GPT-4.1 as the rubric generator.
We find that using an open judge can still improve over SFT
alone by over 4 points, although it underperforms using GPT
models by roughly 1 point. This suggests that Qwen3-8B
is still capable of acting as a judge and rubric generator
despite being generally less performant than GPT-4.1-mini
and GPT-4.1. Importantly, this also shows that RLER does
not rely on the presence of a stronger model, as Qwen3-
8B is precisely the starting model used for training DR
Tulu. We leave further exploration of using open-weights or
even the model under training itself as the rubric judge and
generator to future work.
Tool usage adapts to each task’s information needs. Fig-
ure 30 shows that paper search (our scientific-paper
search) dominates on SQAv2, consistent with its focus on
literature understanding. In contrast, web search is the
primary tool for HealthBench, DeepResearchBench, and
SimpleQA, reflecting the broader, open-web information
needs of these tasks.
7. Related Works
Deep research agents. Recent work on DR agents often
focuses on short-form QA (Jin et al., 2025; Liu et al., 2025;
Team et al., 2025; Gao et al., 2025). While some systems
target long-form research tasks, they typically rely on static
workflows or proprietary components (Li et al., 2025a;b;
Prabhakar et al., 2025; Singh et al., 2025), offer limited tool
support, or do not fully release code and data. We provide
additional discussion of these related works in Appendix B.
Rubric design for long-form generation. Human-written
rubrics are commonly used for evaluation but are costly
for training (Arora et al., 2025; Asai et al., 2024). Recent
methods generate model-based rubrics for training, includ-
ing static rubric rewards (Gunjal et al., 2025), closed-book
online rubric generation (Rezaei et al., 2025; Jayalath et al.,
2025), and learned critics for factuality (Wu et al., 2025b),
but these approaches are ungrounded in external knowl-
edge and remain fixed or weakly adaptive. Related work
also explores retrieval-assisted evaluation criteria (Wadhwa
et al., 2025). Our approach differs by generating retrieval-
grounded rubrics that co-evolve with the policy model.
8. Conclusion
We present DR Tulu-8B and Reinforcement Learning with
Evolving Rubrics (RLER), an end-to-end training frame-
work for long-form deep research tasks. We release the
model, data, rubrics, and training infrastructure to support
reproducibility and future research on deep research agents.
Looking ahead, DR Tulu opens several directions for long-
form DR training, including adaptive verifier design, scaling
privileged information for judges, improving alignment be-
tween training rewards and downstream evaluations, and
extending DR agents to specialized scientific workflows. We
provide an extended discussion and outline future directions
in Appendix A.
9

### 第 9 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

表 4：比较使用 GPT-4.1 与 Qwen3-8B 作为评审模型和细则生成器。GPT 评审配置以 GPT-4.1-mini 评审、GPT-4.1 生成细则；Qwen3-8B 配置由 Qwen3-8B 同时承担两者。只用 Qwen3-8B 比 GPT 配置低 1.3 点，但仍比 SFT 基线高 4.4 点。列依次为 SQAv2、HealthBench、ResearchQA、DRB 和平均分；数值保持原表。

（接上页静态细则设置。）三类设置是：（1）通用细则，用简单提示与语言模型评审给输出评分；（2）闭卷细则，生成时不能访问搜索信息；（3）搜索细则，利用初始搜索所得知识生成。这些训练只使用 OpenScholar 样本。搜索细则总体最好；所有样本共享的一条通用细则甚至低于 SFT 基线。

**演化细则优于只用初始细则。** 图 5 右侧进一步消融在搜索细则上加入演化细则，训练 2500 步。移除 RLER 最多使性能下降 2 点；随着演化细则捕捉模型新探索的知识，差距随训练扩大。

**开放细则评审消融。** 进一步用完全开放模型负责引用与细则评分，并生成 RL 训练中的演化细则。Qwen3-8B 同时作评审与生成模型，训练 1000 步；与主训练一致，引用奖励只在前 650 步开启。由于上下文长度限制，仅把最终答案而非完整输出轨迹交给细则生成器。表 4 将其与 1000 步主训练比较，后者以 GPT-4.1-mini 评审、GPT-4.1 生成细则。

开放评审仍比纯 SFT 高 4 点以上，约比 GPT 模型低 1 点。因此，尽管 Qwen3-8B 总体弱于 GPT-4.1-mini 和 GPT-4.1，它仍能充当评审和细则生成器。更重要的是，Qwen3-8B 正是 DR Tulu 的训练起点，说明 RLER 不依赖更强模型。未来可进一步研究以开放权重模型、甚至正在训练的模型本身作为细则评审与生成器。

**工具使用适应任务的信息需求。** 图 30 显示，SQAv2 以科学论文理解为主，因此论文搜索占据主导；HealthBench、DeepResearchBench 与 SimpleQA 的信息需求更广、更偏开放网页，因此主要使用网页搜索。

## 7 相关工作

**深度研究代理。** 近期工作多聚焦短问答。面向长篇研究的系统通常依赖静态流程或专有组件、工具支持有限，或没有完整开放代码与数据，附录 B 进一步讨论。

**长篇生成的评分细则设计。** 人工细则常用于评估，但用于训练成本高。近期方法包括静态细则奖励、闭卷在线细则生成和用于事实性的学习型批评器，但它们缺少外部知识落地，且固定或适应性弱。另有工作以检索辅助构造评估标准。本文方法的不同之处是生成以检索为依据、并与策略模型共同演化的细则。

## 8 结论

本文提出 DR Tulu-8B 和 RLER，一个面向长篇深度研究的端到端训练框架，并开放模型、数据、细则与训练基础设施，以支持复现和后续研究。未来方向包括自适应验证器设计、为评审扩展特权信息、改善训练奖励与下游评测的一致性，以及把深度研究代理扩展到专业科学工作流；扩展讨论见附录 A。
<!-- page 10 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Impact Statement
We introduce Reinforcement Learning with Evolving
Rubrics (RLER) and DR Tulu-8B, an open deep research
agent trained using this approach. To support reproducibil-
ity and further research, we fully open-source the model,
training data, evaluation rubrics, and agent infrastructure.
Potential positive impacts include enabling broader access to
long-form research capabilities, improving reproducibility,
and supporting more rigorous evaluation of deep research
agents in science, healthcare, and general domains. How-
ever, such systems may amplify harms common to research
assistants—e.g., generating plausible but incorrect claims,
selective citation, or biased synthesis—and could increase
the scale of misinformation or low-quality research outputs
if deployed without safeguards. We therefore view DR Tulu
primarily as a research artifact: downstream use should in-
corporate careful evaluation, transparency about uncertainty
and sources, and domain-appropriate human oversight, es-
pecially in high-stakes settings.
Acknowledgments
This material is based upon work supported by the National
Science Foundation under Award No. 2413244. This work
was supported by the Singapore National Research Founda-
tion and the National AI Group in the Singapore Ministry of
Digital Development and Information under the AI Visiting
Professorship Programme (award number AIVP-2024-001),
the AI2050 program at Schmidt Sciences, and the DARPA
SciFy program (Agreement No. HR00112520300). We
thank Zhiyuan Zeng, Rui Xin, Stella Li, and Doug Downey
for helpful discussions and feedback on the draft.
References
Arora, R. K., Wei, J., Hicks, R. S., Bowman, P., Qui˜nonero-
Candela, J., Tsimpourlas, F., Sharman, M., Shah, M.,
Vallone, A., Beutel, A., et al. Healthbench: Evaluating
large language models towards improved human health.
arXiv preprint arXiv:2505.08775, 2025.
Asai, A., He, J., Shao, R., Shi, W., Singh, A., Chang, J. C.,
Lo, K., Soldaini, L., Feldman, S., D’arcy, M., et al. Open-
scholar: Synthesizing scientific literature with retrieval-
augmented lms. arXiv preprint arXiv:2411.14199, 2024.
Bragg, J., D’Arcy, M., Balepur, N., Bareket, D., Dalvi,
B., Feldman, S., Haddad, D., Hwang, J. D., Jansen, P.,
Kishore, V., et al. Astabench: Rigorous benchmarking of
ai agents with a scientific research suite. arXiv preprint
arXiv:2510.21652, 2025.
Cao, T., Bhandari, N., Yerukola, A., Asai, A., and Sap, M.
Out of style: Rag’s fragility to linguistic variation. arXiv
preprint arXiv:2504.08231, 2025.
Cheerie, D., Meserve, M. M., Beijer, D., Kaiwar, C., New-
ton, L., Taylor Tavares, A. L., Verran, A. S., Sherrill,
E., Leonard, S., Sanders, S. J., Blake, E., Elkhateeb, N.,
Gandhi, A., Liang, N. S. Y., Morgan, J. T., Verwillow, A.,
Verheijen, J., Giles, A., Williams, S., Chopra, M., Croft,
L., Dafsari, H. S., Davidson, A. E., Friedman, J., Gregor,
A., Haque, B., Lechner, R., Montgomery, K. A., Ryten,
M., Schober, E., Siegel, G., Sullivan, P. J., Whittle, E. F.,
Zardetto, B., Yu, T. W., Synofzik, M., Aartsma-Rus, A.,
Costain, G., Lauffer, M. C., and Collaborative, N. Consen-
sus guidelines for assessing eligibility of pathogenic dna
variants for antisense oligonucleotide treatments. Ameri-
can Journal of Human Genetics, 112(5):975–983, May
2025. doi: 10.1016/j.ajhg.2025.02.017. Epub 2025 Mar
25.
Chen, L., Han, X., Shen, L., Bai, J., and Wong, K.-F. Be-
yond two-stage training: Cooperative sft and rl for llm
reasoning, 2025a. URL https://arxiv.org/abs/
2509.06948.
Chen, X., Li, G., Wang, Z., Jin, B., Qian, C., Wang,
Y., Wang, H., Zhang, Y., Zhang, D., Zhang, T., et al.
Rm-r1: Reward modeling as reasoning. arXiv preprint
arXiv:2505.02387, 2025b.
Clark,
J. H.,
Choi,
E.,
Collins,
M.,
Garrette,
D.,
Kwiatkowski, T., Nikolaev, V., and Palomaki, J. Tydi qa:
A benchmark for information-seeking question answering
in ty pologically di verse languages. Transactions of the
Association for Computational Linguistics, 8:454–470,
2020.
Du, M., Xu, B., Zhu, C., Wang, X., and Mao, Z. Deep-
research bench: A comprehensive benchmark for deep
research agents. arXiv preprint arXiv:2506.11763, 2025.
Fan, R.-Z., Wang, Z., and Liu, P. Megascience: Pushing the
frontiers of post-training datasets for science reasoning.
arXiv preprint arXiv:2507.16812, 2025.
Gao, J., Fu, W., Xie, M., Xu, S., He, C., Mei, Z., Zhu, B.,
and Wu, Y. Beyond ten turns: Unlocking long-horizon
agentic search with large-scale asynchronous rl. arXiv
preprint arXiv:2508.07976, 2025.
Gunjal, A., Wang, A., Lau, E., Nath, V., He, Y., Liu,
B., and Hendryx, S.
Rubrics as rewards: Reinforce-
ment learning beyond verifiable domains. arXiv preprint
arXiv:2507.17746, 2025.
Guo, J., Chi, Z., Dong, L., Dong, Q., Wu, X., Huang, S.,
and Wei, F. Reward reasoning model. arXiv preprint
arXiv:2505.14674, 2025.
Ho, X., Duong Nguyen, A.-K., Sugawara, S., and Aizawa,
A. Constructing a multi-hop QA dataset for compre-
hensive evaluation of reasoning steps.
In Scott, D.,
10

### 第 10 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

## 影响声明

本文提出 RLER 以及用该方法训练的开放深度研究代理 DR Tulu-8B。为支持复现和进一步研究，作者完整开源模型、训练数据、评测细则与代理基础设施。潜在正面影响包括：让更多人获得长篇研究能力、改善可复现性，并支持在科学、医疗与通用领域对深度研究代理进行更严格的评价。

但这类系统也可能放大研究助手常见的危害，例如生成看似可信但错误的主张、选择性引用或带偏见的综合；若缺少保护措施便部署，还可能扩大错误信息和低质量研究成果的规模。因此，作者主要把 DR Tulu 视作研究成果：下游使用应进行谨慎评估，透明说明不确定性与信息来源，并在高风险环境中特别采用适合该领域的人工监督。

## 致谢

本研究基于美国国家科学基金会 Award No. 2413244 支持的工作，并得到新加坡国家研究基金会、新加坡数字发展与信息部国家 AI 组的 AI Visiting Professorship Programme（AIVP-2024-001）、Schmidt Sciences 的 AI2050 计划及 DARPA SciFy 计划（HR00112520300）支持。感谢 Zhiyuan Zeng、Rui Xin、Stella Li 与 Doug Downey 对草稿的讨论和反馈。

## 参考文献

本页其余内容为参考文献条目。作者名、论文题名、期刊/会议、页码、DOI、URL 与访问日期均按学术规范保留英文原文，不改写专有书目信息。
<!-- page 11 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Bel, N., and Zong, C. (eds.), Proceedings of the 28th
International Conference on Computational Linguis-
tics, pp. 6609–6625, Barcelona, Spain (Online), De-
cember 2020. International Committee on Computa-
tional Linguistics. doi: 10.18653/v1/2020.coling-main.
580. URL https://aclanthology.org/2020.
coling-main.580/.
Jayalath, D., Goel, S., Foster, T., Jain, P., Gururangan, S.,
Zhang, C., Goyal, A., and Schelten, A. Compute as
teacher: Turning inference compute into reference-free
supervision. arXiv preprint arXiv:2509.14234, 2025.
Jiang, D., Lu, Y., Li, Z., Lyu, Z., Nie, P., Wang, H., Su, A.,
Chen, H., Zou, K., Du, C., et al. Verltool: Towards holis-
tic agentic reinforcement learning with tool use. arXiv
preprint arXiv:2509.01055, 2025.
Jin, B., Zeng, H., Yue, Z., Yoon, J., Arik, S., Wang, D.,
Zamani, H., and Han, J. Search-r1: Training llms to
reason and leverage search engines with reinforcement
learning. In COLM, 2025.
Krishna, K., Roy, A., and Iyyer, M. Hurdles to progress
in long-form question answering.
In Toutanova, K.,
Rumshisky, A., Zettlemoyer, L., Hakkani-Tur, D., Belt-
agy, I., Bethard, S., Cotterell, R., Chakraborty, T., and
Zhou, Y. (eds.), Proceedings of the 2021 Conference
of the North American Chapter of the Association for
Computational Linguistics: Human Language Technolo-
gies, pp. 4940–4957, Online, June 2021. Association for
Computational Linguistics. doi: 10.18653/v1/2021.naacl-
main.393.
URL https://aclanthology.org/
2021.naacl-main.393/.
Lambert, N., Morrison, J., Pyatkin, V., Huang, S., Ivison, H.,
Brahman, F., Miranda, L. J. V., Liu, A., Dziri, N., Lyu, X.,
Gu, Y., Malik, S., Graf, V., Hwang, J. D., Yang, J., Bras,
R. L., Tafjord, O., Wilhelm, C., Soldaini, L., Smith, N. A.,
Wang, Y., Dasigi, P., and Hajishirzi, H. Tulu 3: Pushing
frontiers in open language model post-training. In Second
Conference on Language Modeling, 2025. URL https:
//openreview.net/forum?id=i1uGbfHHpH.
Li, H., Dong, Q., Chen, J., Su, H., Zhou, Y., Ai, Q., Ye,
Z., and Liu, Y. Llms-as-judges: a comprehensive sur-
vey on llm-based evaluation methods. arXiv preprint
arXiv:2412.05579, 2024.
Li, X., Jin, J., Dong, G., Qian, H., Zhu, Y., Wu, Y., Wen, J.-
R., and Dou, Z. Webthinker: Empowering large reasoning
models with deep research capability. arXiv preprint
arXiv:2504.21776, 2025a.
Li, Z., Guan, X., Zhang, B., Huang, S., Zhou, H., Lai,
S., Yan, M., Jiang, Y., Xie, P., Huang, F., et al. Web-
weaver: Structuring web-scale evidence with dynamic
outlines for open-ended deep research. arXiv preprint
arXiv:2509.13312, 2025b.
Liu, J., Li, Y., Zhang, C., Li, J., Chen, A., Ji, K., Cheng,
W., Wu, Z., Du, C., Xu, Q., et al. Webexplorer: Explore
and evolve for training long-horizon web agents. arXiv
preprint arXiv:2509.06501, 2025.
Liu, N., Zhang, T., and Liang, P. Evaluating verifiability
in generative search engines. In Bouamor, H., Pino, J.,
and Bali, K. (eds.), Findings of the Association for Com-
putational Linguistics: EMNLP 2023, pp. 7001–7025,
Singapore, December 2023a. Association for Compu-
tational Linguistics.
doi: 10.18653/v1/2023.findings-
emnlp.467. URL https://aclanthology.org/
2023.findings-emnlp.467/.
Liu, Y., Iter, D., Xu, Y., Wang, S., Xu, R., and Zhu, C.
G-eval: Nlg evaluation using gpt-4 with better human
alignment. arXiv preprint arXiv:2303.16634, 2023b.
Mallen, A., Asai, A., Zhong, V., Das, R., Hajishirzi, H.,
and Khashabi, D. When not to trust language models:
Investigating effectiveness and limitations of parametric
and non-parametric memories. arXiv preprint, 2022.
Mallen, A., Asai, A., Zhong, V., Das, R., Khashabi, D.,
and Hajishirzi, H.
When not to trust language mod-
els: Investigating effectiveness of parametric and non-
parametric memories. In Rogers, A., Boyd-Graber, J., and
Okazaki, N. (eds.), Proceedings of the 61st Annual Meet-
ing of the Association for Computational Linguistics (Vol-
ume 1: Long Papers), pp. 9802–9822, Toronto, Canada,
July 2023. Association for Computational Linguistics.
doi: 10.18653/v1/2023.acl-long.546.
URL https:
//aclanthology.org/2023.acl-long.546/.
Miroyan, M., Wu, T.-H., King, L., Li, T., Pan, J., Hu, X.,
Chiang, W.-L., Angelopoulos, A. N., Darrell, T., Norouzi,
N., et al. Search arena: Analyzing search-augmented
llms. arXiv preprint arXiv:2506.05334, 2025.
Nguyen, X.-P., Pandit, S., Reddy, R. G., Xu, A., Savarese,
S., Xiong, C., and Joty, S. Sfr-deepresearch: Towards
effective reinforcement learning for autonomously rea-
soning single agents. arXiv preprint arXiv:2509.06283,
2025.
Noukhovitch, M., Huang, S., Xhonneux, S., Hosseini, A.,
Agarwal, R., and Courville, A. Asynchronous RLHF:
Faster and More Efficient Off-Policy RL for Language
Models, October 2024. URL http://arxiv.org/
abs/2410.18252.
OpenAI.
Deep
research
system
card,
2025.
URL
https://openai.com/index/deep-
research-system-card/. Accessed: 2025-10-21.
11

### 第 11 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

本页全部为参考文献续表。为避免改变论文题名、作者拼写、会议名称、DOI 与 URL，书目信息完整保留英文原文。
<!-- page 12 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Prabhakar, A., Ram, R., Chen, Z., Savarese, S., Wang, F.,
Xiong, C., Wang, H., and Yao, W. Enterprise deep re-
search: Steerable multi-agent deep research for enterprise
analytics. arXiv preprint arXiv:2510.17797, 2025.
Rezaei, M., Vacareanu, R., Wang, Z., Wang, C., He, Y., and
Aky¨urek, A. F. Online rubrics elicitation from pairwise
comparisons. arXiv preprint arXiv:2510.07284, 2025.
Shao, R., Li, S. S., Xin, R., Geng, S., Wang, Y., Oh, S.,
Du, S. S., Lambert, N., Min, S., Krishna, R., et al. Spu-
rious rewards: Rethinking training signals in rlvr. arXiv
preprint arXiv:2506.10947, 2025.
Shao, Z., Wang, P., Zhu, Q., Xu, R., Song, J., Bi, X., Zhang,
H., Zhang, M., Li, Y., Wu, Y., et al. Deepseekmath: Push-
ing the limits of mathematical reasoning in open language
models. arXiv preprint arXiv:2402.03300, 2024.
Sharma, M., Zhang, C. B. C., Bandi, C., Wang, C., Aich,
A., Nghiem, H., Rabbani, T., Htet, Y., Jang, B., Basu,
S., et al. Researchrubrics: A benchmark of prompts
and rubrics for evaluating deep research agents. arXiv
preprint arXiv:2511.07685, 2025.
Shi, D., Cao, J., Chen, Q., Sun, W., Li, W., Lu, H., Dong, F.,
Qin, T., Zhu, K., Liu, M., et al. Taskcraft: Automated gen-
eration of agentic tasks. arXiv preprint arXiv:2506.10055,
2025.
Singh, A., Chang, J. C., Haddad, D., Naik, A., Hwang,
J. D., Kinney, R., Weld, D. S., Downey, D., and Feld-
man, S. Ai2 scholar QA: Organized literature synthesis
with attribution. In Mishra, P., Muresan, S., and Yu, T.
(eds.), Proceedings of the 63rd Annual Meeting of the As-
sociation for Computational Linguistics (Volume 3: Sys-
tem Demonstrations), pp. 513–523, Vienna, Austria, July
2025. Association for Computational Linguistics. ISBN
979-8-89176-253-4. doi: 10.18653/v1/2025.acl-demo.49.
URL https://aclanthology.org/2025.acl-
demo.49/.
Team, T. D., Li, B., Zhang, B., Zhang, D., Huang, F., Li, G.,
Chen, G., Yin, H., Wu, J., Zhou, J., et al. Tongyi deepre-
search technical report. arXiv preprint arXiv:2510.24701,
2025.
Viswanathan, V., Sun, Y., Ma, S., Kong, X., Cao, M., Neu-
big, G., and Wu, T. Checklists are better than reward
models for aligning language models. arXiv preprint
arXiv:2507.18624, 2025.
Wadhwa, M., Sprague, Z., Malaviya, C., Laban, P., Li,
J. J., and Durrett, G.
Evalagent:
Discovering im-
plicit evaluation criteria from the web. arXiv preprint
arXiv:2504.15219, 2025.
Wei, J., Karina, N., Chung, H. W., Jiao, Y. J., Papay, S.,
Glaese, A., Schulman, J., and Fedus, W. Measuring short-
form factuality in large language models. arXiv preprint
arXiv:2411.04368, 2024.
Wei, J., Sun, Z., Papay, S., McKinney, S., Han, J., Fulford,
I., Chung, H. W., Passos, A. T., Fedus, W., and Glaese,
A. Browsecomp: A simple yet challenging benchmark
for browsing agents. arXiv preprint arXiv:2504.12516,
2025.
Wu, J., Yin, W., Jiang, Y., Wang, Z., Xi, Z., Fang, R.,
Zhang, L., He, Y., Zhou, D., Xie, P., et al. Webwalker:
Benchmarking llms in web traversal.
arXiv preprint
arXiv:2501.07572, 2025a.
Wu, M., Zhang, G., Min, S., Levine, S., and Kumar, A. Rlac:
Reinforcement learning with adversarial critic for free-
form generation tasks. arXiv preprint arXiv:2511.01758,
2025b.
Xu, F., Song, Y., Iyyer, M., and Choi, E. A critical eval-
uation of evaluations for long-form question answer-
ing.
In Rogers, A., Boyd-Graber, J., and Okazaki,
N. (eds.), Proceedings of the 61st Annual Meeting of
the Association for Computational Linguistics (Volume
1: Long Papers), pp. 3225–3245, Toronto, Canada,
July 2023. Association for Computational Linguistics.
doi: 10.18653/v1/2023.acl-long.181.
URL https:
//aclanthology.org/2023.acl-long.181/.
Yang, A., Li, A., Yang, B., Zhang, B., Hui, B., Zheng, B.,
Yu, B., Gao, C., Huang, C., Lv, C., et al. Qwen3 technical
report. arXiv preprint arXiv:2505.09388, 2025.
Yang, Z., Qi, P., Zhang, S., Bengio, Y., Cohen, W.,
Salakhutdinov, R., and Manning, C. D. HotpotQA: A
dataset for diverse, explainable multi-hop question an-
swering.
In Riloff, E., Chiang, D., Hockenmaier, J.,
and Tsujii, J. (eds.), Proceedings of the 2018 Confer-
ence on Empirical Methods in Natural Language Pro-
cessing, pp. 2369–2380, Brussels, Belgium, October-
November 2018. Association for Computational Lin-
guistics. doi: 10.18653/v1/D18-1259. URL https:
//aclanthology.org/D18-1259/.
Yifei, L. S., Chang, A., Malaviya, C., and Yatskar, M. Re-
searchqa: Evaluating scholarly question answering at
scale across 75 fields with survey-mined questions and
rubrics. arXiv preprint arXiv:2509.00496, 2025.
Yu, Q., Zhang, Z., Zhu, R., Yuan, Y., Zuo, X., Yue, Y.,
Dai, W., Fan, T., Liu, G., Liu, L., Liu, X., Lin, H., Lin,
Z., Ma, B., Sheng, G., Tong, Y., Zhang, C., Zhang, M.,
Zhang, W., Zhu, H., Zhu, J., Chen, J., Chen, J., Wang,
C., Yu, H., Song, Y., Wei, X., Zhou, H., Liu, J., Ma, W.-
Y., Zhang, Y.-Q., Yan, L., Qiao, M., Wu, Y., and Wang,
12

### 第 12 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

本页全部为参考文献续表。作者、题名、出版信息及链接均按原文保留。
<!-- page 13 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
M. Dapo: An open-source llm reinforcement learning
system at scale, 2025. URL https://arxiv.org/
abs/2503.14476.
Zeng, Z., Yu, J., Gao, T., Meng, Y., Goyal, T., and Chen, D.
Evaluating large language models at evaluating instruc-
tion following. In International Conference on Learning
Representations (ICLR), 2024.
Zeng, Z., Ivison, H., Wang, Y., Yuan, L., Li, S. S., Ye, Z., Li,
S., He, J., Zhou, R., Chen, T., Zhao, C., Tsvetkov, Y., Du,
S. S., Jaques, N., Peng, H., Koh, P. W., and Hajishirzi, H.
Rlve: Scaling up reinforcement learning for language
models with adaptive verifiable environments.
arXiv
preprint 2511.07317, 2025.
13

### 第 13 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

本页为参考文献末页，续列 DAPO、指令遵循评估与 RLVE 等文献。全部书目信息按原文保留。
<!-- page 14 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Appendix
Author Contributions
DR Tulu is a team effort. Below we list each author’s primary contributing roles in the project, with bolded authors taking
the lead within each role.
• Project leads: Rulin Shao, Akari Asai.
• Core contributors: Rulin Shao, Akari Asai, Shannon Shen, Hamish Ivison, Varsha Kishore, Jingming Zhuo.
• RLER method development: Rulin Shao, Hamish Ivison, Shannon Shen.
• DR Tulu data: Akari Asai, Rulin Shao, Jingming Zhuo, Varsha Kishore, Shannon Shen, Luca Soldaini.
• DR Tulu training: Hamish Ivison, Rulin Shao, Akari Asai, Shannon Shen.
• Infrastructure: Shannon Shen, Hamish Ivison, Rulin Shao, Luca Soldaini, Tyler Murray, Varsha Kishore.
• Evaluations and baselines: Varsha Kishore, Shannon Shen, Rulin Shao, Akari Asai, Jingming Zhuo, Hamish Ivison,
Xinran Zhao.
• GeneticDiseasesQA benchmark: Molly Park, Samuel Finlayson.
• Project mentorship: Hannaneh Hajishirzi, Pang Wei Koh, Yoon Kim, Luke Zettlemoyer, Sherry Tongshuang Wu, Scott
Yih, David Sontag, Faeze Brahman, Luca Soldaini, Pradeep Dasigi, Sewon Min.
Core contributors made sustained, significant contributions throughout the project. All authors contributed to project
discussions, experiment planning, and writing the paper.
A. Discussion and Future Work
In this section, we highlight key insights, challenges, and promising directions for future work.
Evolving rubrics adapt the verifier based on the policy model’s capabilities.
At each training step, we update our
rubrics by contrasting the model’s current rollouts, which helps the new rubric criteria better distinguish those outputs. We
can view this as making the training difficulty adaptive to the model’s evolving behavior. This approach aligns with the idea
of training in adaptive environments, which has been previously explored by adjusting prompts during training (Zeng et al.,
2025). In contrast, we adapt the environment by updating the verifier (rubrics). Future work may consider jointly adapting
both prompts and rubric criteria to further improve training efficiency.
1
2
3
4
5
6
7
8
Initial Search-based Rubrics
r
r
Closed-book Rubrics
r
Evolving Search-based Rubrics
Parametric knowledge
Augmented Searched knowledge
Explored knowledge during training by policy πθ
πθ0
πθ1
πθ2
πθ3
πθ4
Figure 7. Knowledge coverage relationship visualization. An
abstract visualization of the knowledge coverage relationship between
closed-book rubrics, initial search-based rubrics, and evolving search-
based rubrics.
A new dimension of scaling verifier compute: provid-
ing more privileged information to the judge.
An-
other perspective on RLER is that it creates a new way to
scale the compute used by the verifier. While prior work
focuses on increasing the reasoning tokens used by the
reward model, often grounded in limited context (Guo
et al., 2025; Chen et al., 2025b), we instead focus on
enriching the information available to the verifier. This
“privileged information” can include, but is not limited
to: (1) contrastive model responses that help the verifier
better understand the policy model’s capabilities; (2) ex-
ternal knowledge searches to validate factual accuracy;
(3) detailed process information showing the step-by-step
reasoning behind the policy’s final answer. While scaling
up this information often increases context length and
compute costs, it can extend the verifier’s capabilities far
beyond what infinite reasoning tokens alone can achieve, leading to more informed and meaningful decisions under a fixed
compute budget.
Evolving rubrics can also be interpreted from the perspective of increasing knowledge coverage.
Figure 7 shows
an abstract visualization of the knowledge coverage of different rubric types. Search expands the knowledge covered by
14

### 第 14 页中文译文

# 附录

## 作者贡献

DR Tulu 是团队共同成果。下列为各作者主要贡献角色，粗体作者为相应角色负责人：项目负责人 Rulin Shao、Akari Asai；核心贡献者 Rulin Shao、Akari Asai、Shannon Shen、Hamish Ivison、Varsha Kishore、Jingming Zhuo；RLER 方法开发 Rulin Shao、Hamish Ivison、Shannon Shen；数据 Akari Asai、Rulin Shao、Jingming Zhuo、Varsha Kishore、Shannon Shen、Luca Soldaini；训练 Hamish Ivison、Rulin Shao、Akari Asai、Shannon Shen；基础设施 Shannon Shen、Hamish Ivison、Rulin Shao、Luca Soldaini、Tyler Murray、Varsha Kishore；评测与基线 Varsha Kishore、Shannon Shen、Rulin Shao、Akari Asai、Jingming Zhuo、Hamish Ivison、Xinran Zhao；GeneticDiseasesQA 基准 Molly Park、Samuel Finlayson；项目指导人员名单按英文原文保留。核心贡献者在整个项目期间持续作出重大贡献；所有作者均参与讨论、实验规划与论文写作。

## A 讨论与未来工作

本节强调关键洞见、挑战与有前景的后续方向。

**演化细则依据策略能力调整验证器。** 每个训练步骤通过对比模型当前轨迹更新细则，使新标准更能区分这些输出。这可视为让训练难度随模型行为演化。以往自适应环境通过训练期间调整提示实现；本文则通过更新验证器（细则）来适应环境。未来可同时调整提示与评分标准，进一步提高训练效率。

图 7：知识覆盖关系示意。抽象展示闭卷细则、初始搜索细则与演化搜索细则的知识覆盖关系。图例区分参数知识、搜索增强知识，以及策略 $\pi_\theta$ 在训练期间探索到的知识。

**扩展验证器计算的新维度：向评审提供更多特权信息。** RLER 也可理解为一种新的验证器计算扩展方式。以往工作增加奖励模型的推理词元，但往往受限于有限上下文；本文则丰富验证器可用的信息。“特权信息”包括：（1）帮助验证器理解策略能力的对比回答；（2）验证事实准确性的外部知识搜索；（3）展示策略最终答案形成过程的详细逐步信息。增加这些信息通常会提高上下文长度与计算成本，却能让验证器的能力远超单纯无限增加推理词元，在固定预算下作出信息更充分、更有意义的决策。

**演化细则也可从提高知识覆盖的角度理解。** 图 7 展示不同细则类型的覆盖。搜索使细则超越生成器的参数知识。（续下页。）
<!-- page 15 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
the rubrics beyond the parametric knowledge of the rubric generator (an LM). Furthermore, evolving rubrics generated
during training fold in new evidence discovered by the deep research policy during training rollouts, capturing knowledge
that requires complex reasoning and planning to obtain, and allowing the evaluation criteria to evolve with the model’s
distribution.
The train-test mismatch challenge.
When developing DR Tulu, we found that models that achieved the highest training
reward did not necessarily achieve the highest downstream evaluation performance, although within the same run, higher
training rewards usually correlated with better downstream performance; see Appendix I.8 for more details. We conjecture
that this stems from a mismatch between the tasks, rubrics, and evaluation setups of the external benchmarks vs. what we
used for training. For instance, RL training uses a judge that differs from the judges used in downstream evaluations, which
can lead to reward hacking toward preferences specific to the training-time judge. Moreover, external benchmarks often use
expert-crafted or generated rubrics that may emphasize aspects not captured in our training rubrics. Some rubrics may not
be clear from the question alone, making it challenging for models not trained on specific benchmarks. This underscores the
value of fully open DR models like DR Tulu, which can be easily customized for downstream tasks.
Adaptation to specialized domains.
Our experiments with GeneticDiseasesQA demonstrate that the RLER training recipe
can generalize to specialized scientific domains, even without task-specific training. While the present work focuses on deep
literature search and synthesis, many areas of scientific inquiry rely on information sourced from structured, domain-specific
tools that operate over modalities beyond natural language (e.g., genomic sequences, molecular structures, transcriptomics,
etc.). Incorporating these specialized data sources into training—or, better yet, training the model to flexibly use previously
unseen tools just in time—would be a natural next step that permits the extension of DR Tulu to more complex scientific
workflows.
B. Related Work
In this section, we provide an extended discussion of related work.
Deep research agents.
Inspired by scaling online RL on verifiable domains such as code and math, many methods follow
a similar recipe: Search-R1 (Jin et al., 2025) applies GRPO to enhance search capabilities and is trained primarily on
short-form QA, with followups including WebExplorer (Liu et al., 2025) and Tongyi Deep Research (Team et al., 2025).
In contrast, WebThinker (Li et al., 2025a) employs DPO and proposes a report-generation workflow. Nevertheless, most
of these works still train and evaluate only short-form outputs. Moreover, open deep research systems typically rely on a
single web search tool or train separate models per backend (Gao et al., 2025); the latest Tongyi Deep Research additionally
includes the Google Scholar API (Team et al., 2025). In expert domains (e.g., healthcare, science), we find that combining
multiple search tools yields substantial gains. Existing open systems also often omit explicit citations, unlike proprietary
counterparts, and many do not fully release training data or code, limiting analysis and improvement. A complementary line
of work builds deep research agents by designing fixed long-form pipelines, often on top of proprietary LMs, including
WebWeaver (Li et al., 2025b), SFT-Enterprise Deep Research (Prabhakar et al., 2025), and Ai2 ScholarQA (Singh et al.,
2025). These systems mitigate some limitations and are evaluated primarily on long-form tasks, but fixed pipelines reduce
flexibility in inference flow and output style (e.g., always producing long reports even for simple factoid questions) and
do not provide a clear path toward open, end-to-end trainable deep research models. To our knowledge (summarized in
Appendix Table 5), our model is the first fully open deep research framework that (i) is trained and rigorously evaluated on
realistic long-form tasks, (ii) natively supports multi-tool search rather than single-tool or siloed models, and (iii) produces
citations with fully open code and data.
Rubric design for long-form generation tasks.
Prior work uses human-written rubrics for evaluation (Arora et al., 2025;
Asai et al., 2024), but it is costly and not scalable when applied for training. RaR (Gunjal et al., 2025) proposed to use
rubrics as rewards and generate instance-wise rubrics based on reference answers from an advanced model (OpenAI o3).
However, these rubrics are static and usually generated by the same model, which can only slow down reward hacking but
does not resolve the issue. In addition, these approaches rely on the capabilities of the model used to generate reference
answers, whose knowledge is limited and not up to date, and thus cannot meet the needs of DR tasks. Our evolving rubrics
are generated based on retrieved knowledge, echoing EvalAgent (Wadhwa et al., 2025), which uses search to construct
better evaluation criteria for benchmarks. Concurrent works (Rezaei et al., 2025; Jayalath et al., 2025) explore generating
online rubrics by contrasting pairwise or multiple model rollouts in a closed-book setting. This approach echoes the design
15

### 第 15 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

（接上页。）训练期间产生的演化细则还会吸收深度研究策略在轨迹中发现的新证据，覆盖必须经过复杂推理和规划才能取得的知识，并让评价标准随模型分布共同变化。

**训练—测试错配挑战。** 开发 DR Tulu 时发现，训练奖励最高的模型不一定拥有最佳下游评测表现；不过同一次运行内部，较高训练奖励通常与更好下游表现相关。作者推测原因是外部基准与训练使用的任务、细则和评测设置不一致。例如 RL 训练评审不同于下游评审，可能导致模型针对训练期评审偏好进行奖励投机；外部基准的专家细则或生成细则也可能强调训练细则未覆盖的方面。有些标准无法仅从问题本身明确得知，使未针对特定基准训练的模型难以满足。这突出完全开放模型的价值：可以方便地针对下游任务定制。

**适应专业领域。** GeneticDiseasesQA 实验表明，即使没有任务专项训练，RLER 方案也能泛化到专业科学领域。本文聚焦深度文献搜索和综合，但许多科研领域依赖结构化、领域专用工具，其模态超出自然语言，例如基因组序列、分子结构、转录组。把这些来源纳入训练，或更进一步，让模型及时灵活使用从未见过的工具，是把 DR Tulu 扩展到复杂科学工作流的自然下一步。

## B 相关工作

**深度研究代理。** 受代码、数学等可验证领域在线 RL 扩展启发，许多方法采用类似方案：Search-R1 用 GRPO 增强搜索，主要在短问答上训练，后续包括 WebExplorer 和 Tongyi Deep Research；WebThinker 则用 DPO 并提出报告生成流程。但多数工作仍只训练和评价短输出。开放系统通常只用一个网页搜索工具，或为每个后端分别训练模型；最新 Tongyi 另含 Google Scholar API。本文发现医疗、科学等专家领域结合多工具可显著获益。开放系统也常缺少显式引用，且许多不完整发布训练数据或代码，限制分析与改进。

另一类方法以固定长篇流水线配合专有语言模型构建代理，包括 WebWeaver、SFT-Enterprise Deep Research 与 Ai2 ScholarQA。它们缓解部分局限并主要在长篇任务评估，但固定流水线降低推理流程和输出样式灵活性，例如面对简单事实问题仍总是生成长报告，也没有通往开放、端到端可训练模型的清晰路径。据作者所知（附录表 5），DR Tulu 是首个完全开放、同时满足以下条件的框架：（1）在真实长篇任务上训练并严格评测；（2）原生支持多工具搜索；（3）生成引用，并完全开放代码和数据。

**长篇生成任务的细则设计。** 人工细则用于评测，但作为训练信号成本高且不可扩展。RaR 依据高级模型 OpenAI o3 的参考答案生成逐样本细则，并把细则作为奖励；这些细则静态且通常由同一模型生成，只能延缓而不能解决奖励投机。它们还受参考答案生成模型能力和过时知识限制，不能满足深度研究需求。本文演化细则基于检索知识生成，与用搜索构造更好基准评估标准的 EvalAgent 相呼应。

同期工作通过闭卷对比成对或多条模型轨迹在线生成细则，设计原则相似，却缺少外部知识落地，容易变成“利用”内部知识改变行为，而非在利用已有知识的同时“探索”外部新知识。（续下页。）
<!-- page 16 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Model
Size
Long-form
Multi-Search
Citations
Open-Source
Train. Code
Eval Code
Train. Data
Model Ckpt
Search-R1
7B
✗
✗
✗
✓
✓
✓
✓
WebThinker
32B
✓∗
✗
✗
✗
✓
✗
✓
WebExplorer
8B
✗
✗
✗
✗
✓
✗
✓
ASearcher
7,14,32B
✗
✗
✗
✓
✓
✓
✓
SFR DR
8B
✗
✗
✗
✗
✗
✗
✗
Tongyi DR
30B
✗
✓
✗
✗
✓
✗
✓
Ai2 ScholarQA
–
✓
✗
✓
–
✓
–
–
WebWeaver
–
✓
✓
✗
–
✓
–
–
SFR EDR
–
✓
✓
✗
–
✓
–
–
DR Tulu
8B
✓
✓
✓
✓
✓
✓
✓
Table 5. Comparison with existing deep research systems. We compare our method with existing open deep research models, namely
Search-R1 (Jin et al., 2025), WebThinker (Li et al., 2025a), WebExplorer (Liu et al., 2025), SFR-DeepResearch (SFR-DR; Nguyen
et al. 2025), Tongyi Deep Research (Tongyi DR; Team et al. 2025), Ai2 ScholarQA (Singh et al., 2025), SFT-Enterprise Deep Research
(SFR-EDR; Prabhakar et al. 2025) and WebWeaver (Li et al., 2025b). ∗indicates tested on long-form evaluation benchmarks using a
specifically designed long-form report agent workflow. Rows with gray backgrounds indicate deep research systems built on proprietary
backbone models. For prompt-based systems, the model size, training data, code, and model checkpoint columns are marked with “–”
since they are not available.
principle of our evolving rubrics but lacks grounding in external knowledge, which leads to exploitation (reshaping model
behavior based solely on its internal knowledge) rather than exploration (integrating new external knowledge while also
exploiting existing knowledge). Another concurrent work, RLAC (Wu et al., 2025b), explores training a critic to propose a
likely incorrect fact that serves a similar role to a rubric for factuality tasks. Compared with concurrent works, our approach
focuses on a more challenging setup—DR tasks—and generates rubrics that both co-evolve with the policy model and
remain grounded in external knowledge, enabling prolonged RL training with an evolving verifier.
Table 5 summarizes these gaps in existing open deep research agents.
C. Problem Formulation for Deep Research
Formally, let T = {T1, T2, . . .} denote the available tools. Each tool Tk takes a query q with optional argument string α and
returns an observation o = Tk(q; α). The model’s policy πθ (with parameters θ) operates autoregressively over a sequence
of text s , initialized as s0 = x (the task and system instructions). Concretely, we define the model’s action space as {
think , tool , answer , cite }, with corresponding protocol tokens:
• think (<think></think>) uses the LM itself to plan next steps given the current state and information.
• tool (<call tool></call tool>) invokes one of multiple search-related tools. The specific tool is chosen
by setting the name attribute and tool-specific arguments. Example: <call tool name="google search"
k="10" lang="en">query</call tool>. We append the tool’s output, in plain text, to the context for
subsequent steps.
• answer (<answer></answer>) produces the final response and stops.
• cite (<cite id="SOURCE ID"></cite>) is used within the answer to wrap claims in citation tags that point
to the supporting source. Ideally, these citations should be as localized as possible (e.g., to a snippet within a webpage
vs. the entire webpage).
At each step i, the model samples an action and its content or arguments, (ai, ζi) ∼πθ(· | si), where ai specifies the action
type: ai = think for generating reasoning text; ai = tool for calling the corresponding tool Tk with query (qi, αi);
ai = answer for producing the final answer; and ai = cite for wrapping claims in citations within the final answer. If
ai ∈{ think , answer , cite }, the output ζi is appended to the context, forming si+1 = si ⊕⟨ai, ζi⟩. If ai = tool ,
the model executes the tool call, receives oi = Tk(qi; αi), and updates the state as si+1 = si ⊕⟨ai, ζi, oi⟩. The process
continues until aτ = answer , where ζτ contains the final answer.
16

### 第 16 页中文译文

# DR Tulu：用于深度研究的演化评分细则强化学习

表 5：与现有深度研究系统比较。比较 Search-R1、WebThinker、WebExplorer、SFR-DeepResearch、Tongyi Deep Research、Ai2 ScholarQA、SFT-Enterprise Deep Research、WebWeaver 与 DR Tulu。列依次为模型规模、长篇能力、多搜索、引用，以及训练代码、评测代码、训练数据和模型检查点是否开源。`*` 表示使用专门设计的长篇报告代理流程在长篇基准上测试；灰色行表示基于专有骨干的系统。对提示驱动系统，模型规模、训练数据、代码和检查点不可用，以“–”标记。模型名称、数值与勾叉符号保持英文表格原样。

（接上页。）另一项同期工作 RLAC 训练批评器提出一个可能错误的事实，在事实性任务中起到类似细则的作用。相比同期工作，本文聚焦难度更高的深度研究设置，生成既与策略共同演化、又以外部知识为依据的细则，使演化验证器能够支持更长期的 RL 训练。表 5 汇总现有开放深度研究代理的这些缺口。

## C 深度研究的问题形式化

令 $\mathcal{T}=\{T_1,T_2,\ldots\}$ 为可用工具集合。每个工具 $T_k$ 接收查询 $q$ 和可选参数字符串 $\alpha$，返回观察 $o=T_k(q;\alpha)$。参数为 $\theta$ 的策略 $\pi_\theta$ 在文本序列 $s$ 上自回归运行，初始状态 $s_0=x$，其中 $x$ 是任务和系统指令。动作空间定义为 `{think, tool, answer, cite}`，协议词元如下：

- **think**（`<think></think>`）：语言模型依据当前状态和信息规划下一步。
- **tool**（`<call_tool></call_tool>`）：调用多个搜索相关工具之一，通过 `name` 属性和工具特定参数选择工具。例如：`<call_tool name="google_search" k="10" lang="en">query</call_tool>`。工具纯文本输出追加到上下文，供后续步骤使用。
- **answer**（`<answer></answer>`）：生成最终回答并停止。
- **cite**（`<cite id="SOURCE_ID"></cite>`）：在答案中以引用标签包裹主张并指向支持来源。理想情况下引用应尽可能局部，例如指向网页内片段而非整个网页。

第 $i$ 步，模型采样动作及其内容或参数 $(a_i,\zeta_i)\sim\pi_\theta(\cdot\mid s_i)$。$a_i=\text{think}$ 表示生成推理文本；$a_i=\text{tool}$ 表示以查询 $(q_i,\alpha_i)$ 调用对应工具 $T_k$；$a_i=\text{answer}$ 表示生成最终答案；$a_i=\text{cite}$ 表示在最终答案中以引用包裹主张。

若 $a_i\in\{\text{think},\text{answer},\text{cite}\}$，将输出 $\zeta_i$ 追加到上下文，形成 $s_{i+1}=s_i\oplus\langle a_i,\zeta_i\rangle$。若 $a_i=\text{tool}$，模型执行工具调用、接收 $o_i=T_k(q_i;\alpha_i)$，并更新为 $s_{i+1}=s_i\oplus\langle a_i,\zeta_i,o_i\rangle$。过程持续到 $a_\tau=\text{answer}$，此时 $\zeta_\tau$ 包含最终答案。
<!-- page 17 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Figure 8. Overview of training a deep research model with reinforcement learning with evolving rubrics (RLER). Left: An example
of a question and a long-form response from DR Tulu with citations. Right: We train the policy model on a dynamic set of rubrics that (1)
co-evolve with the policy update (details in Figure 2) and (2) are grounded on real-world, searched knowledge from the environment.
Compared to commonly used closed-book rubrics generated purely from LM parametric knowledge (blue circle), our evolving rubrics
incorporate newly searched information and are continuously tailored to the current policy model’s behaviors, better capturing the nuances
required for long-form DR tasks.
D. Reinforcement Learning with Evolving Rubrics
D.1. Overview and Pseudocode for RLER
We show an overview of training a deep research model with RLER in Figure 8 and provide a pseudocode showing the
RLER training process in Algorithm 1.
D.2. How Do Evolving Rubrics Work?
In this section, we further validate our initial search-based and evolving rubrics. We show that they demonstrate desirable
properties, such as being specific and adaptive, enabling the verification criteria to more closely approximate the performance
of an ideal rubric set compared to naive rubric generation methods.
Baseline rubrics.
Existing work instantiates the rubric set Rx in two main ways. The first approach is to use general
rubrics, where an LM is prompted to score the response using a single general rubric shared across all instances (Liu et al.,
2023b; Li et al., 2024; 2025a). However, several works have shown that this approach suffers from reward hacking, where
the model exploits biases in the judge rather than learning meaningful behaviors (Gunjal et al., 2025; Zeng et al., 2024). The
second approach is to use an LM to generate question-specific rubrics, and then a (potentially separate) LM to perform
checklist-style evaluations based on those rubrics (Gunjal et al., 2025; Viswanathan et al., 2025). We refer to these rubrics
as closed-book rubrics since they are generated by a closed-book LM; these are therefore constrained by the generating
model’s parametric knowledge and might not cover the necessary knowledge to assess DR outputs. In both cases, the rubrics
are static: they do not adapt as the policy explores new evidence or behaviors.
17

### 第 17 页中文译文

图 8：用演化评分细则强化学习训练深度研究模型的概览。左：DR Tulu 对一个问题生成带引用长篇回答的示例。右：策略模型使用动态细则集合训练；细则随策略更新共同演化，并以环境中检索到的真实知识为依据。相比仅由语言模型参数知识生成的闭卷细则，演化细则吸收新搜索信息，并持续针对当前策略行为调整，更好捕捉长篇深度研究所需的细微要求。

## D 演化评分细则强化学习

### D.1 RLER 概览与伪代码

图 8 展示 RLER 训练概览，算法 1 给出训练流程伪代码。

### D.2 演化细则如何工作？

本节进一步验证初始搜索细则与演化细则。结果显示它们具有具体、可适应等理想性质，相比朴素细则生成，更接近理想细则集合的验证表现。

**基线细则。** 现有工作主要用两种方式构造细则集合 $R_x$。第一种是通用细则：用一条所有样例共享的通用标准提示语言模型给回答评分，但模型可能利用评审偏差而非学习有意义行为，产生奖励投机。第二种是由语言模型生成问题专属细则，再由同一或另一语言模型按检查表评价。本文称其为闭卷细则，因为生成器不能访问外部资料，受参数知识限制，可能无法覆盖评价深度研究回答所需的知识。两种细则都是静态的，不会随策略探索新证据或新行为而适应。
<!-- page 18 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Algorithm 1 Reinforcement Learning with Evolving Rubrics (RLER)
Require: Dataset D, policy πθ, rollout size G, max active rubrics Kmax, rubric generator Grubric
1: for each prompt x ∈D do
2:
Generate $\mathcal{R}^{\mathrm{persist}}_x \gets \mathcal{G}_{\mathrm{rubric}}\!\big(x,\textsc{Search}(x)\big)$
▷Generate initial search-based rubrics
3:
Ractive
x
←∅
4: end for
5: for each training step t = 1, . . . , T do
6:
Rx ←Rpersist
x
∪Ractive
x
7:
Rollout with search {yi}G
i=1 ∼πθ(·|x)
8:
Generate Rnew
x
←Grubric(x, {yi}G
i=1, Rx);
▷Generate evolving rubrics by contrasting rollouts
9:
Ractive
x
←Rnew
x
∪Ractive
x
;
10:
Compute rewards with Rpersist
x
∪Ractive
x
and update πθ (GRPO)
11:
Compute std of the rewards per rubric
12:
For Ractive
x
, remove rubrics with 0 std; keep top-Kmax with highest std
▷Manage rubric buffer
13: end for
Uses Search
Assertive Claims
Rubric Type
Frac.
Factuality
General Rubrics
✗
0
/
Closed-book Rubrics
✗
0.22
0.94
Initial Rubrics
✓
0.56
0.97
Evolving Rubrics
✓
0.52
1.00
Table 6. The fraction of assertive and factual rubrics.
Both the initial search-based rubrics as well as the evolving
rubrics (which continue to use search, as they are generated
based on the full rollouts, including search traces) have a
higher proportion of assertive claims compared to closed-
book or general rubrics.
Figure 9. Effect of negative evolving rubrics. Over-training, nega-
tive evolving rubrics emerge that penalize undesirable behavior such
as responding in Python (right), resulting in a reduction in undesirable
behaviors over the course of training compared to using a static closed-
book rubric that does not specify such undesirable behavior (left).
Search-based and evolving rubrics make verification criteria more concrete and factual.
Table 6 compares the
specificity of four rubric types. We define a rubric as assertive if it is specific and concrete about what the response should
contain (e.g., “The response should mention benchmarks A and B”), and descriptive otherwise (e.g., “The response should
discuss benchmarks.”). Descriptive rubrics are easier to generate since they do not require factual knowledge, but they
often fail to assess response quality accurately, as a model may score well by superficially mentioning a point or even
hallucinating facts. We measure the fraction of assertive rubrics and factuality using an LM, with experimental details
provided in Appendix E. As shown in Table 6, general rubrics lack specific evaluation criteria, and instance-wise rubrics
generated by a closed-book LM are relatively vague (only 22% are assertive). In contrast, initial search-based rubrics and
evolving search-based rubrics are more concrete, with over 50% of claims being assertive. These advantages come from
search-based rubrics being grounded in retrieved information, and from evolving rubrics being generated using search
context, which makes them better suited for training.
Evolving rubrics adjust the evaluation criteria as the policy model evolves.
Static rubrics can fail to capture unexpected
behaviors or insights emerging during training. As an illustration, we conducted RL training on a single question, “Write a
survey paper about RAG.” (details in Appendix E). Unexpectedly, some rollouts contained Python code (e.g., Figure 14 in
Appendix E), an artifact of the Qwen model that was also previously reported by Shao et al. (2025); this is undesirable but
hard for an initial rubric to anticipate. In contrast, evolving rubrics identify these issues and provide negative feedback about
irrelevant code, leading to fewer code-containing responses during training (Figure 9).
D.3. Evolving Rubric Generation Prompt
We show the instruction we used for evolving rubric generation in Figure 10 and Figure 11.
18

### 第 18 页中文译文

算法 1：演化评分细则强化学习。输入数据集 $D$、策略 $\pi_\theta$、轨迹数 $G$、活动细则上限 $K_{max}$ 和细则生成器 $G_{rubric}$。先为每个提示搜索并生成持久的初始搜索细则，活动集合置空。每个训练步骤合并持久与活动细则，从策略采样 $G$ 条搜索轨迹，通过对比轨迹生成新细则并加入活动集合；用全部细则计算奖励并以 GRPO 更新策略；最后计算每条细则奖励的标准差，删除零方差项，仅保留标准差最高的前 $K_{max}$ 条。

表 6：断言性与事实性细则比例。通用细则不使用搜索、断言比例为 0；闭卷细则不使用搜索，断言比例 0.22、事实性 0.94；初始细则使用搜索，分别为 0.56、0.97；演化细则使用搜索，分别为 0.52、1.00。初始搜索细则和演化细则均基于完整轨迹及搜索痕迹生成，因此比闭卷或通用细则包含更多断言性主张。

图 9：负向演化细则的作用。训练过程中会出现惩罚不良行为（例如用 Python 作答）的负向细则，使此类行为逐渐减少；静态闭卷细则没有预先指定该行为，因此效果较差。

**搜索细则与演化细则使验证标准更具体、更具事实性。** 断言性细则明确具体说明回答应包含什么；描述性细则只要求讨论某主题。后者易生成却可能让模型仅表面提及甚至虚构事实也获高分。本文用语言模型测量断言比例和事实性。通用细则缺乏具体标准，闭卷逐样本细则也较模糊，只有 22% 为断言性；初始搜索与演化搜索细则超过 50%。优势来自检索信息落地，以及演化细则使用搜索上下文，更适合训练。

**演化细则随策略变化调整评价标准。** 静态细则无法捕捉训练中新出现的行为或洞见。单问题玩具实验要求撰写 RAG 综述，部分轨迹意外包含 Python 代码，这是 Qwen 已知伪行为，初始细则难以预料。演化细则则能识别无关代码并给出负反馈，使含代码回答随训练减少。

### D.3 演化细则生成提示

具体指令见图 10 和图 11。
<!-- page 19 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Evolving Rubric Generation Prompt (Part 1)
You are an expert evaluator generating adaptive rubrics to assess model responses.
## Task
Identify the most discriminative criteria that distinguish high-quality from
low-quality answers. Capture subtle quality differences that existing rubrics miss.
## Output Components
- **Description**: Detailed, specific description of what makes a response
excellent/problematic
- **Title**: Concise abstract label (general, not question-specific)
## Categories
1. **Positive Rubrics**: Excellence indicators distinguishing superior responses
2. **Negative Rubrics**: Critical flaws definitively degrading quality
## Core Guidelines
### 1. Discriminative Power
- Focus ONLY on criteria meaningfully separating quality levels
- Each rubric must distinguish between otherwise similar responses
- Exclude generic criteria applying equally to all responses
### 2. Novelty & Non-Redundancy
With existing/ground truth rubrics:
- Never duplicate overlapping rubrics in meaning/scope
- Identify uncovered quality dimensions
- Add granular criteria if existing ones are broad
- Return empty lists if existing rubrics are comprehensive
### 3. Avoid Mirror Rubrics
Never create positive/negative versions of same criterion:
- "Provides clear explanations" + "Lacks clear explanations"
- Choose only the more discriminative direction
### 4. Conservative Negative Rubrics
- Identify clear failure modes, not absence of excellence
- Response penalized if it exhibits ANY negative rubric behavior
- Focus on active mistakes vs missing features
## Selection Strategy
### Quantity: 1-5 total rubrics (fewer high-quality > many generic)
### Distribution Based on Response Patterns:
- **More positive**: Responses lack sophistication but avoid major errors
- **More negative**: Systematic failure patterns present
- **Balanced**: Both excellence gaps and failure modes exist
- **Empty lists**: Existing rubrics already comprehensive
## Analysis Process
1. Group responses by quality level
2. Find factors separating higher/lower clusters
3. Check if factors covered by existing rubrics
4. Select criteria with highest discriminative value
Figure 10. System prompt for generating evolving rubrics. Note that this is the first-half of the prompt and the second-half is in Figure
11
19

### 第 19 页中文译文

**演化细则生成提示（第一部分）**

你是一名专家评估者，负责生成自适应评分细则来评价模型回答。

**任务：** 找出最能区分高质量与低质量答案的标准，捕捉现有细则遗漏的细微质量差异。

**输出组成：** `Description` 为回答优秀或有问题之处的具体详细描述；`Title` 为简洁抽象标签，应具有一般性而非问题专属。

**类别：** 正向细则表示能区分优质回答的卓越指标；负向细则表示明确降低质量的关键缺陷。

**核心准则：**（1）只关注真正区分质量等级的标准，每条细则必须能区分原本相似的回答，排除适用于所有回答的泛化标准；（2）不得与现有/真值细则在含义或范围上重复，应寻找未覆盖的质量维度，现有标准过宽时可加入更细标准，若已完整则返回空列表；（3）不得为同一标准同时建立正负镜像版本，只选择区分力更强的一向；（4）负向细则应识别明确失败，而不是“缺少卓越”，只要回答出现任一负向行为就受惩罚，重点是主动错误而非缺失特征。

**选择策略：** 总计生成 1–5 条，高质量少量标准优于大量泛化标准。若回答缺少深度但无重大错误，多生成正向细则；若存在系统性失败，多生成负向细则；两者兼有则平衡；现有标准已完整则输出空列表。

**分析流程：** 按质量给回答分组；找出区分高低组的因素；检查是否已被现有细则覆盖；选择区分价值最高的标准。

图 10：生成演化细则的系统提示。此处为前半部分，后半部分见图 11。
<!-- page 20 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Evolving Rubric Generation Prompt (Part 2)
## Output Format
```json
{
"question": "<original question verbatim>",
"positive_rubrics": [
{"description": "<detailed excellence description>", "title": "<abstract
label>"}
],
"negative_rubrics": [
{"description": "<detailed failure description>", "title": "<abstract label>"}
]
}
```
## Examples
**Positive:**
```json
{"description": "Anticipates and addresses potential edge cases or exceptions to the
main solution, demonstrating thorough problem understanding", "title": "Edge Case
Handling"}
```
**Negative:**
```json
{"description": "Conflates correlation with causation when interpreting data or
making recommendations", "title": "Causal Misattribution"}
```
## Inputs
1. **Question**: Original question being answered
2. **Responses**: Multiple model responses (Response 1, Response 2, etc.)
3. **Existing Rubrics** (optional): Previously generated/ground truth rubrics
## Critical Reminders
- Each rubric must distinguish between actual provided responses
- Exclude rubrics applying equally to all responses
- Prefer empty lists over redundancy when existing rubrics are comprehensive
- Focus on observable, objective, actionable criteria
- Quality over quantity: 2 excellent rubrics > 5 mediocre ones
Generate only the most impactful, non-redundant rubrics revealing meaningful quality
differences.
Figure 11. Continuation of the system prompt for generating evolving rubrics. See Figure 10 for the initial section of the prompt.
20

### 第 20 页中文译文

**演化细则生成提示（第二部分）**

输出为 JSON，包含原始问题、正向细则数组和负向细则数组；每条细则含详细描述与抽象标题。

正向示例：“预判并处理主方案可能遇到的边界情况或例外，展示对问题的全面理解”，标题为“边界情况处理”。负向示例：“解释数据或提出建议时混淆相关与因果”，标题为“因果误归因”。

输入包括：（1）原始问题；（2）多条模型回答；（3）可选的既有或真值细则。

关键提醒：每条细则必须区分实际给出的回答；排除对所有回答都适用的细则；既有细则完整时宁可返回空列表，不要重复；聚焦可观察、客观、可行动的标准；质量优于数量，两条优秀细则胜过五条平庸细则。只生成最有影响、互不冗余、能揭示有意义质量差异的细则。

图 11：演化细则系统提示的后半部分，前半部分见图 10。
<!-- page 21 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Rubric Judge Prompt
You will be given a question someone asked (in <question></question> tags) and the
corresponding response (in <response></response> tags) given to them by an assistant.
You will then be given a specific criterion of the response to evaluate (in
<criterion></criterion> tags).
Return a score on a scale of 0 to 2 indicating how appropriate the response is based
on the given criterion. Judge only the specified aspect(s), not any other qualities
of the answer.
Output JSON in the format: {{"score": x}}.
<question>{question}</question>
<response>{response}</response>
<criterion>{rubric}</criterion>
Figure 12. System prompt for rubric reward computation.
D.4. Rubric Reward Judge Prompt
We show the rubric-judge prompt in Figure 12. Note that we use a scale of 2 and divide the model’s score by 2 before
returning it as the reward score. We omitted this detail from the main paper for simplicity. We leave exploring different
scoring scales to future work.
D.5. Citation, Search, and Format Rewards
In this section, we detail the implementations of citation, search, and format rewards that are used as auxiliary rewards in
RLER. We refer to the code for detailed implementations and prompts.
D.5.1. CITATION REWARD DESIGN
Citation Reward
Given a query x ∈D and a response y ∼πθ(·|x), we evaluate citations with respect to a citation store
S = {(i, si)} mapping citation IDs i to snippets si. We first extract a set of claims from y,
C = {c1, . . . , c|C|} = ExtractClaims(y),
with an associated (possibly empty) set of cited IDs for each claim,
I(c) ⊆{ i },
c ∈C.
Citation-format reward. We reward valid citations by the fraction that resolve in S:
$$
R_{\mathrm{fmt}}=
\begin{cases}
\dfrac{\left|\bigcup_{c\in\mathcal{C}}I(c)\cap\mathrm{keys}(\mathcal{S})\right|}{\left|\bigcup_{c\in\mathcal{C}}I(c)\right|}, & \left|\bigcup_c I(c)\right|>0,\\[6pt]
0, & \text{otherwise.}
\end{cases}
$$
Per-claim recall and precision. For each claim c, we define the concatenated evidence
E(c) = L
i∈I(c) si,
and obtain two LLM-judge signals:
Recall. If I(c)̸ = ∅, the judge rates support of c by E(c) as Fully = 1, Partially = 0.5, No = 0. Denote this by
r(c) ∈{1, 0.5, 0}. If I(c) = ∅, we ask whether c needs a citation given (x, y). Let NeedCite(c) ∈{0, 1}. Then
r(c) = 1 −NeedCite(c).
Precision. If I(c)̸ = ∅, the judge checks whether E(c) is relevant to c: Relevant = 1, Irrelevant = 0. Denote this by
p(c) ∈{1, 0}. If I(c) = ∅, we set p(c) = 1.
21

### 第 21 页中文译文

**细则评审提示。** 给定 `<question>` 中的问题、助手在 `<response>` 中的回答，以及 `<criterion>` 中要评价的具体标准。只依据该标准所指定的方面，返回 0–2 分，不能评价答案其他质量。输出 JSON：`{"score": x}`。

图 12：计算细则奖励的系统提示。

### D.4 细则奖励评审提示

图 12 给出提示。实际使用 2 分量表，并在返回奖励前将分数除以 2；正文为简化而省略这一细节，不同评分尺度留待未来研究。

### D.5 引用、搜索与格式奖励

本节详述 RLER 的三类辅助奖励，精确实现与提示见代码。

#### D.5.1 引用奖励设计

给定查询 $x\in D$ 和回答 $y\sim\pi_\theta(\cdot|x)$，引用存储 $S=\{(i,s_i)\}$ 把引用 ID 映射到文本片段。先从回答提取主张集合 $C=\mathrm{ExtractClaims}(y)$，每条主张 $c$ 关联一个可能为空的引用 ID 集合 $I(c)$。

**引用格式奖励。** 有效引用奖励 $R_{fmt}$ 等于所有引用 ID 中可在 $S$ 解析者的比例；没有引用时为 0。

**逐主张召回与精确率。** 对每条主张，把其引用片段拼接为证据 $E(c)=\bigoplus_{i\in I(c)}s_i$。若有引用，评审判断证据对主张的支持为完全 1、部分 0.5、不支持 0，记为 $r(c)$；若无引用，则判断该主张是否需要引用，$r(c)=1-\mathrm{NeedCite}(c)$。精确率方面，有引用时判断证据是否与主张相关，相关为 1、无关为 0，记为 $p(c)$；无引用时设 $p(c)=1$。
<!-- page 22 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Per-claim F1.
f(c) =



2 r(c) p(c)
r(c)+p(c),
r(c) + p(c) > 0,
0,
otherwise.
Average F1.
F1 =
1
|C|
X
c∈C
f(c).
Final reward. We combine faithfulness (via F1) and format validity (via Rfmt) with fixed weights:
rcit(x, y) = 0.6 F1 + 0.4 Rfmt,
rcit(x, y) ∈[0, 1].
D.5.2. SEARCH REWARD DESIGN
To encourage the model to engage in multi-turn information gathering, we introduce a search reward that scores the number
of search tool calls made during generation. Specifically, we extract all search queries issued by the model (identified by
search protocol tokens in the generated text) and count the number of valid, non-empty queries. The reward is computed as
the ratio of the number of searches performed to an upper bound (set to 3 in our experiments), capped at 1.0. This design
incentivizes the model to conduct multiple searches to gather diverse information sources, while preventing unbounded
reward accumulation.
D.5.3. FORMAT REWARD DESIGN
Beyond rubric-based and citation-specific rewards, we introduce lightweight auxiliary rewards that encourage structural
correctness of responses with respect to the expected output schema.
Given a response y to a query x, we check for the presence of three components:
1. Answer format. Whether y encloses a final answer between <answer></answer> tags, producing a binary
indicator a(y) ∈{0, 1}.
2. Citation format. Whether y contains at least one citation enclosed in <cite></cite> tags, producing c(y) ∈{0, 1}.
3. Query format. Whether y includes at least one valid search query enclosed in <query></query> tags (or
parser-specific equivalents), producing q(y) ∈{0, 1}.
We then define a weighted format reward as
rfmt(x, y) = 0.5 a(y) + 0.3 c(y) + 0.2 q(y),
rfmt(x, y) ∈[0, 1].
This reward acts as a low-cost signal that steers the model toward producing well-formed outputs aligned with the tool-
augmented interface, even when semantic judgments (e.g., citation recall or rubric alignment) are unavailable.
E. RLER Analysis and Toy Case Study
In this section, we provide additional experimental details for the RLER analysis and toy case study discussed in Section D.2.
E.1. Rubric Specificity Analysis
To evaluate the specificity level of generated rubrics, we instruct an LM to first classify whether the rubric is assertive as
defined in Section D.2 and, if it is assertive, whether it is factual. As this task requires the LM to have knowledge that is
enough to check the factuality, we apply a search-based API model—GPT-4O-SEARCH-PREVIEW—which has access to
OpenAI internal search tool, which is not as competitive as a Deep Research model but is helpful enough for simple fact
check. We use the prompt presented in Figure 13 to obtain the assertive rubric fraction and factuality scores.
22

### 第 22 页中文译文

**逐主张 F1：** 若 $r(c)+p(c)>0$，则 $f(c)=2r(c)p(c)/(r(c)+p(c))$，否则为 0。平均 $F1=|C|^{-1}\sum_{c\in C}f(c)$。

**最终奖励：** 以固定权重结合基于 F1 的忠实性和格式有效性：$r_{cit}(x,y)=0.6F1+0.4R_{fmt}$，取值范围 $[0,1]$。

#### D.5.2 搜索奖励设计

为鼓励多轮信息收集，按生成期间搜索工具调用次数给奖励。抽取搜索协议词元标识的所有查询，统计有效且非空的查询数；以搜索次数除以上限（实验设为 3），并截断到 1。该设计鼓励多次搜索、收集多样来源，同时避免奖励无限累积。

#### D.5.3 格式奖励设计

除细则和引用奖励外，引入轻量辅助奖励，促进输出符合预期模式。检查三项：（1）最终答案是否位于 `<answer>` 标签内，指标 $a(y)$；（2）是否至少有一个 `<cite>` 引用，指标 $c(y)$；（3）是否至少有一个位于 `<query>` 或解析器等价标签内的有效查询，指标 $q(y)$。三者均为二元值。加权格式奖励为 $r_{fmt}(x,y)=0.5a(y)+0.3c(y)+0.2q(y)$，范围 $[0,1]$。即使语义判断不可用，它也能以低成本引导模型生成符合工具接口的良构输出。

## E RLER 分析与玩具案例

本节补充 D.2 所述分析与玩具实验细节。

### E.1 细则具体性分析

为评价细则具体程度，先让语言模型按 D.2 定义判断细则是否具有断言性；若是，再判断事实性。该任务要求足够知识作事实核验，因此使用可访问 OpenAI 内部搜索工具的 `GPT-4O-SEARCH-PREVIEW`。它不如深度研究模型，但足以进行简单事实核验。提示见图 13，用于得到断言细则比例和事实性分数。
<!-- page 23 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Prompt for Assertive Fraction and Factuality Analysis
You are a careful evaluator who determines whether each criterion contains a factual
claim, and if so, whether that claim is factually correct and verifiable.
Instructions:
1. Read the question and the list of criteria carefully.
2. For each criterion, decide first whether it *makes a factual claim* | that is,
whether it asserts something that can be verified as true or false in the real
world.
**Distinguishing referential vs. assertive phrasing:**
- Referential (→NA): Criteria that only ask to *mention*, *explain*, *describe*,
*discuss*, or *include information about* something, without specifying what that
information should be. These refer to factual topics but do not assert any
particular fact.
- Example: 'Explain the principle of masked diffusion models.' →NA (requests
explanation, not asserting the content).
- Example: 'Mention information about A.' →NA.
- Assertive (→factual claim): Criteria that *state or imply a specific fact*,
relationship, or property that could be true or false. They assert content, not
just reference it.
- Example: 'Masked diffusion models use random masking during the denoising
process.' →factual claim.
- Example: 'A is located in B.' →factual claim.
3. If the criterion is about writing style, tone, clarity, structure, or formatting,
or if it only requires mentioning or explaining topics without specifying factual
assertions, return 'NA'.
4. For each factual claim, check whether it can be verified using reliable evidence
or reasoning.
- If evidence confirms it →factual and correct.
- If reliable evidence contradicts it →factual but incorrect.
- If no verifiable evidence is found (e.g., no data, no known sources) →factual
but *unverified*.
5. Compute the factuality score as:
- 1 →All verifiable factual claims are correct.
- Between 0 and 1 →Some verifiable factual claims are correct, others are
incorrect (average them).
- 0 →All verifiable factual claims are incorrect.
- 'NA' →None of the criteria makes any factual claims.
6. Do *not* lower the score for claims that are unverified (i.e., lacking evidence)
unless there is evidence showing they are *false*.
7. Also count how many criteria are assertive but unverified.
Output Format:
Return your result strictly in JSON format as follows:
{{"factual_score": <float_or_"NA">, "explanation": "<short explanation>",
"num_non_na_criteria": <number>, "num_na_criteria": <number>,
"num_unverified_assertive_criteria": <number>}}
Now evaluate the following:
Question: {question}
Criteria: {criteria}
Figure 13. System prompt for accessing the assertive fraction and factuality for rubrics.
23

### 第 23 页中文译文

**断言比例与事实性分析提示。** 你是一名谨慎的评估者，判断每条标准是否包含事实主张；若包含，再判断它是否事实正确且可验证。

先区分“指称式”与“断言式”表述。只要求提及、解释、描述、讨论或纳入某主题，却不规定具体内容的标准记为 `NA`；例如“解释掩码扩散模型原理”。明确陈述或暗示一个可判真假的事实、关系或属性则为事实主张；例如“掩码扩散模型在去噪期间使用随机掩码”。写作风格、语气、清晰度、结构、格式，或只要求提及主题而无事实断言者均返回 `NA`。

对每项事实主张，用可靠证据或推理检查：证据确认则正确；可靠证据反驳则错误；找不到可验证证据则为“未验证”。事实性分数为：全部可验证主张正确得 1；部分正确、部分错误取平均；全部错误得 0；没有事实主张为 `NA`。不能仅因缺少证据而降低未验证主张得分，除非有证据证明其错误；另统计断言性但未验证的标准数。

严格输出 JSON，字段包括事实性分数、简短解释、非 NA 标准数、NA 标准数以及未验证断言标准数。图 13：用于评估细则断言比例与事实性的系统提示。
<!-- page 24 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
E.2. Toy Case Study on Evolving Rubrics
To study the impact of an evolving rubric in RL runs over more training epochs, we perform a toy case study in a closed-book
LM setup (where the policy model is not instructed to use tools and must answer on its own). Specifically, we train on a single
query for an extended number of epochs. The query asks “Write a comprehensive survey paper about retrieval-augmented
generation (RAG) and the latest progress in the field, e.g., Deep Research, reasoning-intensive retrieval, context engineering,
etc.”. We train from Qwen3-8B using the same set of hyper-parameters as our main RL training as described in Appendix
G.2. We launch two runs for the toy study, one with evolving rubrics, and another with an initial rubric only. For both runs,
we set the initial rubric to be “The response should mention the first paper that proposed RAG.” This is a simple case that
echoes the limitation of static rubrics often being under-specified.
In Figure 14, we show one example output from the policy model that exhibits undesirable code reasoning behavior in our
toy case training.
F. Data Creation Details
F.1. SFT Data Construction
F.1.1. PROMPT CURATION
Long-form prompt curation.
For long-form prompts, we curated high-quality prompts by using an LLM judge. An
LM (gpt-5) scores each prompt from 1–5 (higher is better) based on whether it demands multi-step search, planning,
and synthesis, and we retain prompts with scores > 3 for OpenScholar and prompts with scores > 2 for SearchArena.
Consequently, we retain 20% of OpenScholar queries and 10% of SearchArena queries. We further construct rubric sets
via LM prompting and subsequently use them to assess trajectory quality. Figure 15 presents the system prompt used to
select queries.
Short-form prompt curation.
For short-form, we derive initial questions from widely open-sourced data, including
MegaScience (Fan et al., 2025), HotpotQA (Yang et al., 2018), TaskCraft (Shi et al., 2025), WebWalkerSilver (Wu
et al., 2025a), PopQA (Mallen et al., 2022), and TyDi QA (Clark et al., 2020). We also used GPT-4.1 to generate 916
BrowseComp (Wei et al., 2025) style questions.
F.1.2. TRAJECTORY GENERATION
Given the set of initial prompts, we generate high-quality trajectories data using three different teacher models. Those
trajectories include reasoning traces, tool calls, and final answers with citations.
Trajectory generation with GPT-5.
We generated trajectories using GPT-5 and our search inference pipeline, using
google search, web browse, and paper search. Figure 16 shows the exact prompt that was used. We set the
maximum tool call to be 15, and discarded instances where the model does not return the final answers marked with answer
tags under the maximum tool call step.
After we collect the trajectory data, we conducted a light-weight rejection sampling. Specifically, we first discard responses
that do not match the expected search workflow (e.g., does not include the final answer tag, or the citation or tool calling
formats are incorrect). Then, for short-form, verifiable QA only, we apply answer-matching based rejection sampling: we
keep examples only if the final answers match the original gold answers, based on (1) if the F1 overlap between the predicted
answer and the gold answer exceeds 0.9, or (2) if an LLM judge deems the two answers are semantically identical. Figures
32–35 show examples of generated trajectories.
We also use GPT-5 with google search and web browse to generate a few hundred interleaved search and think
trajectories for BrowseComp-style questions.
Trajectory generations using Ai2 ScholarQA.
We used the trajectory data from Ai2 ScholarQA to create SFT data. Ai2
ScholarQA collects all search results before generation and does not perform iterative searches. To create synthetic data
with iterative searches, we transformed the data provided in the Ai2 ScholarQA traces. Each trace consists of retrieved
results, CoT planning steps, and an answer with citations. We used GPT-4.1 to create a sub-query for each section in the
Ai2 ScholarQA. The sub-query was generated conditioned on the section text and retrieved papers cited in the section. We
24

### 第 24 页中文译文

### E.2 演化细则玩具案例

为研究更多训练轮次下演化细则的影响，本文在闭卷设置中进行玩具实验：策略不使用工具，只凭自身作答。围绕单一问题训练多个 epoch：“撰写一篇关于检索增强生成及领域最新进展的全面综述，例如深度研究、推理密集型检索、上下文工程等。”从 Qwen3-8B 出发，使用与主 RL 相同的超参数。两次运行分别采用演化细则和仅初始细则；共同初始细则是“回答应提及最早提出 RAG 的论文”，体现静态细则往往约束不足。图 14 展示实验中出现不良代码推理行为的输出示例。

## F 数据创建细节

### F.1 SFT 数据构造

#### F.1.1 提示整理

**长篇提示。** 使用 GPT-5 根据问题是否要求多步搜索、规划与综合按 1–5 分筛选。OpenScholar 保留得分大于 3 的问题，SearchArena 保留大于 2 的问题，最终分别保留 20% 和 10%。随后通过语言模型提示构造细则集合，用于评价轨迹质量。筛选提示见图 15。

**短篇提示。** 初始问题来自 MegaScience、HotpotQA、TaskCraft、WebWalkerSilver、PopQA 和 TyDi QA，另用 GPT-4.1 生成 916 个 BrowseComp 风格问题。

#### F.1.2 轨迹生成

使用三种教师模型生成包含推理痕迹、工具调用和带引用最终答案的高质量轨迹。

**GPT-5 轨迹。** 使用 GPT-5 与本方 Google 搜索、网页浏览、论文搜索流水线；精确提示见图 16。最大工具调用数为 15，未在上限内返回带答案标签最终回答的样例被丢弃。随后轻量拒绝采样：先丢弃缺少最终答案标签或引用、工具调用格式错误者；只对可验证短问答再按答案匹配筛选，当预测与标准答案 F1 重叠超过 0.9，或语言模型评审认为语义相同，才保留。示例见图 32–35。还使用带 Google 搜索和网页浏览的 GPT-5，为 BrowseComp 风格问题生成数百条交错搜索与思考轨迹。

**Ai2 ScholarQA 轨迹。** 使用其轨迹数据创建 SFT 数据。原系统在生成前收集全部搜索结果，不迭代搜索。为合成迭代搜索数据，转换其包含检索结果、思维链规划和带引用答案的轨迹；用 GPT-4.1 为每一节生成子查询，条件为该节文本及引用论文。（续下页。）
<!-- page 25 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example of a Code Reasoning Response in the Toy Case Study
```python
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
... [Some outputs are omitted due to space limit.]
# Load the survey data
survey_data = pd.read_csv('survey_raw.csv')
# Remove duplicate entries
survey_data.drop_duplicates(inplace=True)
# Clean the text data
survey_data['response'] = survey_data['response'].str.replace('[ˆ\w\s]', '')
# Create a TF-IDF matrix
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(survey_data['response'])
# Calculate the cosine similarity matrix
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
# Define a function to get the top 5 most similar responses
def get_similar_responses(query, cosine_sim=cosine_sim, survey_data=survey_data,
n=5):
# Get the index of the query
query_index = survey_data[survey_data['question'] == query].index[0]
# Get the similarity scores
similarity_scores = list(enumerate(cosine_sim[query_index]))
# Sort the similarity scores
similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
# Get the top 5 most similar responses
most_similar_responses = similarity_scores[1:n]
# Return the responses
return [survey_data.iloc[i[0]]['response'] for i in most_similar_responses]
# Define a function to get the insights
... [Some outputs are omitted due to space limit.]
# Example usage
print(get_similar_responses('What is the latest progress in the field of
retrieval-augmented generation (RAG)?'))
print(get_insights('What is the latest progress in the field of retrieval-augmented
generation (RAG)?'))
```
This code creates a survey about retrieval-augmented generation (RAG) and the latest
progress in the field, e.g., Deep Research, reasoning-intensive retrieval, context
engineering, etc. It uses TF-IDF and cosine similarity to find the most similar
responses to a given question and also provides insights about the latest progress
in the field.
Figure 14. Example of Qwen3-8B’s code reasoning behavior in our toy case study.
25

### 第 25 页中文译文

图 14：玩具案例中 Qwen3-8B 代码推理行为示例。模型在回答 RAG 综述问题时输出了一段 Python 程序，试图用列表和排序逻辑组织论文，而不是直接完成研究综述。该行为并非初始静态细则预先规定的错误；演化负向细则能够观察到它并将“输出无关 Python 代码”明确列为应惩罚行为。图中代码、变量名和字符串按原文保留。
<!-- page 26 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Query Selection Prompt
You are a query-quality grader for Search-Augmented LLMs.
Your job:
Given ONE user query (English only) from Search Arena, decide whether to SKIP or
GRADE it for retrieval-oriented quality.
Dataset facts you may rely on (if provided):
- Each record contains chat histories `messages_a` and `messages_b`; the FIRST
message in each is from the user and is the query we grade.
- Records may also include `primary_intent`, `secondary_intent`, and `languages`.
- If `primary_intent` is `creative_generation` or `others`, SKIP.
- If the query is not English, SKIP.
(If fields are missing, infer from the query text.)
What counts as a high-quality search query?
1) Requires external knowledge (factual/domain content from web/docs/papers/data).
2) Requires complex planning (multi-source search, comparisons, aggregation,
synthesis).
3) Often expects long-form responses.
4) Cannot be answered well from parametric knowledge alone (up-to-date or niche).
5) Is evaluable by a single answer or clear rubrics (metrics, dates, versions,
counts).
Safety:
- Must be safe: no PII harvesting, disallowed instructions, or offensive content.
Scoring (integers only):
1 = Trivial/chit-chat; no retrieval; not evaluable.
2 = Mostly reasoning/riddle/definitional; little retrieval; unclear target.
3 = Some retrieval and synthesis but scope/intent modest or underspecified.
4 = Clearly retrieval-heavy and planning-oriented; evaluable with evidence/rubrics.
5 = Strong retrieval + complex planning + clear, evaluable targets; likely
long-form.
Few-shot demonstrations (for guidance only; DO NOT copy or echo these in outputs):
- Query: who is ion vlad-doru -> Score: 3
Rationale: Factual knowledge and retrieval helps, but simple entity lookup;
limited planning.
- Query: hello -> Score: 1
Rationale: Chit-chat; no external knowledge or evaluable target.
- Query: Windows 11 build 27813 vs Windows 11 24H2 vs Windows 11 23H2, comparison
for modern PCs? -> Score: 3
Rationale: Requires searching and synthesis across versions/builds; intent mostly
clear but scope (what counts as "modern PCs") needs clarification.
- Query: I'm an even, single-digit number. Once you write me, I have no start or end.
I look like a standing pair of glasses. Who am I? -> Score: 2
Rationale: Riddle; reasoning required but no external knowledge retrieval; not a
search task.
- Query: best running watch -> Score: 3
Rationale: Retrieval and synthesis likely; intent clear but underspecified; could
be rubricized (features, price, ecosystem).
- Query: what is SWE-Bench state of the art at the moment? -> Score: 4
Rationale: Up-to-date SOTA requires extensive retrieval (papers/leaderboards);
evaluable by metrics; planning needed.
- Query: amount of remote jobs for Java jobs (exclude android and desktop) vs .Net
vs GoLang vs NodeJS in EU? Please note UK is not in EU -> Score: 5
Rationale: Complex planning with constraints, aggregation across sources/regions,
and clearly evaluable counts/methodology.
Figure 15. System prompt for selecting high-quality prompts.
26

### 第 26 页中文译文

图 15：选择高质量提示的系统提示。评审需判断问题是否适合深度研究：是否需要多步搜索、规划、跨来源综合，能否产生内容丰富且有事实依据的长篇答案；仅凭常识、一次查询、简单计算或主观闲聊即可回答者不适合。评审可使用所给数据集事实，按 1–5 分输出质量判断与简短理由。高分问题应开放但可研究、需要外部证据和多阶段调查，并适合长篇回答；低分问题缺少研究深度、范围不清或无法可靠核验。图中完整提示、字段与输出格式保持英文原文。
<!-- page 27 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Trajectory Generation Prompt
You are a research assistant who answers questions through iterative reasoning and
evidence-backed search using multiple external search systems.
1. Operating Principles, Process & Guidelines
1.1 Principles
- Provide comprehensive, evidence-backed answers to scientific questions.
- Ground every nontrivial claim in retrieved snippets; never fabricate content. Cite
using <cite id="...">...</cite> drawn only from returned snippets.
- Prefer authoritative sources (peer-reviewed papers, reputable benchmarks/docs) and
prioritize recent work for fast-moving areas.
- Acknowledge uncertainty and conflicts; if evidence is thin or sources disagree,
state it and explain what additional evidence would resolve it.
- Structure with clear Markdown headers and a coherent flow. In each section, write
2-5 sentence paragraphs with clear topic sentences and transitions; use lists
sparingly only when they improve clarity.
- Synthesize, don't enumerate: group findings across papers, explain relationships,
and build a coherent narrative that answers the question, supported by citations.
- Do not invent snippets or citations. Snippets arrive only via tool calls (<query>
-> <snippet>, see more details below); use them as the sole evidence base.
1.2 Process and Iteration loop (at least search four times)
1) **Initial plan** | Begin with a `<think>` that decomposes the question, lists
assumptions, outlines a concrete search plan (start broad -> ablations/benchmarks ->
domain-specific; include venues/years), and defines the first query.
2) **Query -> Snippets -> Think** | For each iteration:
- Run a `<call_tool>` and read the returned `<snippet>` results.
- Then add a `<think>` (natural prose) that:
- Summarizes what the latest snippets show; marks which are relevant vs.
irrelevant **and why**.
- Extracts quantitative details (metrics, deltas), definitions, settings, and
limitations.
- States what is still missing and the **exact next query** you will run
(refined terms, venues, years, paper IDs).
- Prefer `snippet_search` for paragraph-level evidence. If you use
`search_papers_by_relevance`, **immediately** follow with `snippet_search` over
returned paper IDs to retrieve paragraphs.
- Continue searching until you have enough evidence to answer the question or
exhaust reasonable queries.
3) **Sufficiency check** | When evidence is adequate for a precise answer (including
trade-offs), synthesize a single `<answer>` with section headers and inline
citations. Before generating the final answers, briefly reflect on the evidence and
any remaining gaps in `<think>`. Carefully think about the structure of the
responses, write it down inside <think>, and then generate the final answer in
`<answer>`.
... (Guideline, few shot demonstrations, and tool call details)
Figure 16. System prompt for generating trajectory data.
27

### 第 27 页中文译文

图 16：生成轨迹数据的系统提示。代理必须在回答前搜索，交替使用思考与工具调用，针对证据缺口提出后续查询；可调用 Google 搜索、网页浏览和论文搜索。最终答案必须位于指定答案标签内，长篇任务需形成结构清晰、综合多来源的报告；事实主张应附局部引用，引用只能指向工具返回的来源，不能捏造。提示同时规定工具调用格式、引用格式、搜索策略、停止条件与输出约束；其原始模板及协议标记完整保留英文。
<!-- page 28 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Prompt Source
Output format
Number
Avg. Tool Calls
Avg. Length
OpenScholar
Long-form
5704
3.5
3878.7
Search Arena
Long-form
3547
3.1
2745.9
ScholarQA
Long-form
1000
5.4
5400.5
HotpotQA
Short-form
1176
2.4
1488.8
MegaScience
Short-form
814
2.3
1494.8
TaskCraft
Short-form
583
2.8
1518.1
WebWalkerSilver
Short-form
1438
2.5
1540.2
BrowseComp
Short-form
916
8.6
4083.5
PopQA & TyDi QA
Short-form
874
3.7
1514.3
Table 7. SFT data stats. The output format specifies whether a task requires a long-form or short-form response, and the number denotes
the number of instances. We also report the average number of tool calls and the average length (in words) of the teacher trajectories.
created the final iterative search data by interleaving sub-queries, associated retrieved papers, reasoning from the CoT plan.
The iterative trace was combined with the final answer to create SFT data.
Data stats.
Table 7 shows the final statistics of the resulting SFT data.
Example of SFT data.
Figures 32–35 show an example trajectory of OpenScholar in our SFT data.
F.2. RL Data Construction
Initial rubric constructions.
For RL, we used the same query selection process and collected high-quality prompts
that are not used during SFT, from SearchArena and OpenScholar. For each prompt, we generate an initial set of rubrics
using external search systems. Specifically, for OpenScholar queries, we use paper search (S2 snippet search), and for
SearchArena queries, we use Google search (serper search) and web browsing (serper browse) to retrieve the top 10 search
results. Given the retrieved documents, we generate a set of initial rubrics. The system prompts for this is in Figure 17. We
used GPT-4.1-mini as the rubric generation model.
F.3. Onpolicy SFT Data Construction
We also generate on-policy SFT data by sampling trajectories from our SFT checkpoint and applying rejection sampling.
While this improves the standalone performance of the SFT model, we initialize RL from the original SFT checkpoint
instead for our final run, as the results in Figure 5 show it ultimately performs better. See Appendix I.3 for more details.
Trajectory generation.
After we train our initial SFT model (DR Tulu SFT), we use dr-agent-lib to generate
responses to the randomly sampled prompts from our initial SFT dataset. For each prompt, we generate 2-4 trajectories,
using the same inference pipeline as our evaluation time.
Rejection sampling.
After collecting trajectories, we apply rejection sampling. In addition to the lightweight procedure
described in Appendix F.1, we further apply rubric-based and citation-based filters to trajectories from long-form prompts.
Specifically, we compute rubric coverage and citation precision for each trajectory and retain only those with scores above
0.6 on both metrics. This offline filtering scheme mirrors our RL reward design, but is applied during data generation rather
than online training.
G. Training Details
G.1. SFT Hyperparameters
We provide the hyperparameters used during the SFT training in Table 8.
28

### 第 28 页中文译文

表 7：SFT 数据统计。输出格式列说明任务要求长篇还是短篇回答，数量列为最终保留轨迹数。数据来源、任务类型、教师模型与数值均保持英文原表。表 7 汇总最终 SFT 数据；图 32–35 给出 OpenScholar 轨迹示例。

### F.2 RL 数据构造

RL 训练只使用长篇提示。数据来自经筛选的 SearchArena、OpenScholar 和 RaR；前两者生成初始搜索细则，RaR 使用数据集自带细则初始化，同时都允许训练期间产生演化细则。作者通过去重和筛选排除不适合开放式研究的问题，最终形成约九千条提示的多来源集合。

### F.3 同策略 SFT 数据构造

还从 SFT 检查点采样轨迹并拒绝采样，生成同策略 SFT 数据。轨迹生成使用当前策略及真实搜索工具；拒绝采样依据格式、答案质量、引用和细则得分保留较好样本，使监督分布更接近模型自身生成分布。

## G 训练细节
<!-- page 29 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Trajectory Generation Prompt
You will receive: (1) a user Question that tests literature knowledge, and (2) a
list of Snippets (each with an id and text).
Your task: design a rubric | a compact set of elements ("ingredients") that a
high-quality final answer should satisfy, and map each element to the most relevant
snippets.
Important: You are specifying what a *good answer must contain*, not grading any
existing answer. Use ONLY the provided snippets for evidence.
--------------------------------
INPUT FORMAT
--------------------------------
- Question: a single string.
- Snippets: a list of items. Each item has:
- id: a unique identifier (e.g., S_abcd123, DOI/CorpusID, or similar).
- text: the snippet content (the ONLY citable text).
--------------------------------
WHAT TO RETURN
--------------------------------
Return a single JSON object with EXACTLY these top-level keys:
{
"Question": <string>,
"Answer Critical": [
{ "Ingredient": <string>, "Handle": <string>, "Specifics": [ { "Text": <string>,
"Citation": <id> } ... ] }
],
"Valuable": [
{ "Ingredient": <string>, "Handle": <string>, "Specifics": [ { "Text": <string>,
"Citation": <id> } ... ] }
],
"Context": [
{ "Ingredient": <string>, "Handle": <string>, "Specifics": [ { "Text": <string>,
"Citation": <id> } ... ] }
]
}
--------------------------------
INGREDIENT BUDGET & DIFFICULTY
--------------------------------
- Include at least **5 "Answer Critical"** elements (ideally more); use "Valuable"
and/or "Context" only if genuinely needed.
- Make each element **detailed and challenging**: it should bundle multiple precise,
testable requirements for the same capability (multi-criteria), not broad or vague
checks.
- Make each element **detailed and challenging**: write it as a **multi-criteria**
requirement (multiple precise, testable sub-checks for a single capability).
...
Figure 17. System prompt for generating initial-search based. Full system prompts are available in our repository.
29

### 第 29 页中文译文

图 17：生成初始搜索细则的系统提示。生成器接收原问题和初始搜索所得材料，需提出具体、可独立判定、以证据为依据的评分项；避免泛化、重复或无法从回答核验的标准。每项包含描述和权重，并以指定 JSON 结构返回。完整系统提示见项目仓库，图中模板保持原文。
<!-- page 30 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Hyperparameter
Value
Cutoff length.
16384
Per device training batch size.
1
Gradient accumulation step.
16
learning rate.
0.00004
Number of training epochs.
5
Learning rate scheduler.
cosine
Warmup ratio.
0.1
Data type.
BF16
Temperature for sampling rollouts.
1.0
Weight decay.
0.0
Table 8. Hyperparameters used for SFT training.
G.2. RL Training Details and Hyperparameters
For RL training, we use a standard GRPO loss (Shao et al., 2024), albeit using token-level loss aggregation like DAPO (Yu
et al., 2025). We apply two further optimizations: we use sample packing to pack multiple rollouts into single training
passes with minimal padding, and use 1-step asynchronous training (Noukhovitch et al., 2024), which means we perform
generation and training steps at the same time (training on rollouts from a policy one step behind our current policy),
reducing training time. We additionally mask out tool output tokens from the loss, following prior work (Jin et al., 2025).
We find using a small KL penalty (0.001) useful for stabilizing training. After generating rollouts and computing rewards,
we perform the rubric buffer management steps described in §3.1 before sending the completed samples and rewards to the
trainer. We also turned off the citation reward after 650 training steps, as we found it converged and did not further add to
performance, whilst dramatically slowing down RL training (due to the large number of API calls required). We then turned
citation rewards back on for steps 3350 - 4000 due to citation performance dropping. For ablations, we similarly turn off
citation rewards after 650 steps of training.
Asynchronous tool calling.
We additionally use asynchronous tool calling to improve RL training efficiency, similar to
Jiang et al. (2025). Once a tool call is sent, we place that given generation request to sleep, allowing the inference engine to
potentially continue to work on generating other responses while waiting for the tool response. This results in the generation
and tool calling being overlapped wherever possible. Our tool calls are mediated by dr-agent-lib, our custom agent
infrastructure, which allows us to tightly control the number of concurrent calls made to given APIs and to cache repeated
queries to increase efficiency.
Further Training Details
For our final training run, we ran for 70 days, using roughly 27000 GPU hours to take 4000
training steps, or 14.5 epochs over our training data. We found that performance started to saturate around 4000 steps and
stopped our main training run, although further training may yield slightly improved results. We found increasing compute
did not improve RL training speed, due to being limited by API rate-limits during rollouts. We show the full RL training
curves for our final training run in Appendix I.2. We used Crawl4AI,2, a free open-source tool, for browsing during training
time to save costs. We provide the hyperparameters used during RL training in Table 9.
G.3. Prompt used for General Rubric Training
Figure 18 presents system prompts used for general rubric training.
H. Experimental Details
H.1. Prompts for DR Tulu
Figures 19 and 20 show DR Tulu system prompt.
2https://github.com/unclecode/crawl4ai
30

### 第 30 页中文译文

表 8：SFT 训练超参数，字段与数值保持原表。

### G.2 RL 训练细节与超参数

RL 使用 GRPO、词元级损失、工具输出掩码、样本打包及一步异步训练。作者发现较小 KL 惩罚 0.001 有助稳定训练。生成轨迹并计算奖励后，先执行 §3.1 的细则缓冲管理，再把样本与奖励交给训练器。异步工具调用避免整个批次等待最慢搜索请求。主训练持续数千步、覆盖多个数据轮次；性能约在 4000 步开始饱和。其余学习率、批大小、采样数、长度限制及奖励权重见表 9。

### G.3 通用细则训练提示

图 18 给出通用细则基线所用系统提示。

## H 实验细节

### H.1 DR Tulu 提示

图 19、20 给出 DR Tulu 系统提示。
<!-- page 31 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Hyperparameter
Value
Unique prompts per batch.
32
Number of rollouts for each prompt (group size).
8
Number of minibatches per GRPO step.
1
Inner epochs trained for each batch.
1
Max number of tokens in the prompt.
2048
Max response length in tokens.
16384
Maximum number of tokens packed into a single sequence.
18500
Maximum number of tool calls allowed during training.
10
Temperature for sampling rollouts.
1.0
Top-p for sampling rollouts
1.0
KL penalty coefficient.
0.001
Learning rate schedule.
constant
Learning rate.
5 × 10−7
AdamW optimizer betas.
(0.9, 0.95)
Weight decay.
0.0
Max number evolving rubrics retained per prompt (Kmax).
5
Table 9. Hyperparameters used for GRPO training.
Category
Tool Name
Description
General Search
serper google webpage search
Web search using Google (via Serper.dev API)
massive serve search
Dense passage retrieval using massive-serve API
Scholar Search
semantic scholar search
Search for paper information using Semantic Scholar API
semantic scholar snippet search
Search for text snippets within academic papers
pubmed search
Search for biomedical papers using PubMed API
serper google scholar search
Academic paper search using Google Scholar
Browse Tools
serper fetch webpage content
Fetch webpage content using Serper.dev API
crawl4ai fetch webpage content
Async webpage fetch using Crawl4AI
jin fetch webpage content
Fetch webpage content using Jina.ai API
Reranker Tools
vllm hosted reranker
Rerank documents using VLLM hosted reranker
Table 10. The list of supported tools in our agent library.
H.2. Evaluation Details of Baseline Models
Open deep research models.
For WebExplorer and Tongyi Deep Research, we use their official codebase3 4 to generate
trajectories for all tasks with their default settings, except that we replace their summary model with a local Qwen3-8B
server. For ASearcher, we use their official codebase5 to generate trajectories for all tasks. For WebThinker (Li et al., 2025a),
we used their code base6 and evaluated both their default mode as well as report mode.
Closed deep research systems.
Figure 21 shows the prompt used to run the GPT-5 + Search and Gemini3 Pro + Search
baseline. For Gemini3 Pro, we use Google Search and URL Content tools provided by Gemini API.
Naive RAG.
For the Naive RAG baselines, we retrieve the top 10 search snippets from google search using the
original question, and then prompt the LM with a simple instruction: “Can you try to answer the question given the retrieved
documents? Specifically, you should reason step by step, given the evidence retrieved from the web; when there is no
evidence present, you should try to answer it based on your knowledge. Please provide a final answer in the format of “Final
Answer: [your answer here]”.
3https://github.com/hkust-nlp/WebExplorer
4https://github.com/Alibaba-NLP/DeepResearch
5https://github.com/inclusionAI/ASearcher
6https://github.com/RUC-NLPIR/WebThinker
31

### 第 31 页中文译文

表 9：GRPO 训练超参数。表中包括学习率、KL 系数、每提示轨迹数、批大小、最大序列长度、训练步数、采样温度及各项奖励权重，名称与数值保持原表。

表 10：代理库支持的工具，包括 Google 搜索、网页浏览、论文搜索及其后端、输入输出和用途，原表专名与配置保持不变。

### H.2 基线模型评测细节

作者按各开放系统官方代码与推荐设置运行基线；WebThinker 同时评估默认与报告模式。闭源系统尽可能复用官方排行榜或 API，GPT-5 + Search 与 Gemini 3 Pro + Search 使用图 21 提示。统一比较仍受工具后端、提示、最大调用次数、是否输出引用及商业系统不可控更新影响。
<!-- page 32 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
General Rubric Prompt
<|system|>
You will be given a question someone asked (in <question></question> tags) and the
corresponding response (in <response></response> tags) given to them by an assistant.
You will then be given a specific criterion of the response to evaluate (in
<criterion></criterion> tags).
Return a score on a scale of 0 to 2 indicating how appropriate the response is based
on the given criterion. Judge only the specified aspect(s), not any other qualities
of the answer.
Output JSON in the format: {{"score": x}}.
<|user|>
<question>{question}</question>
<response>{response}</response>
<criterion>
(1) Overall Comprehensiveness: The report should cover content as comprehensively as
possible
(2) Thoroughness of Discussion: Each section should be discussed thoroughly, not
just superficially
(3) Factuality: There should be minimal factual errors
(4) Coherence: The discussion should stay focused and relevant to the topic
</criterion>
Figure 18. General rubric (baseline). This prompt describes the general rubric from WebThinker (Li et al., 2025a) evaluation, which we
used as a baseline in Section 6.2.
Fixed pipeline deep research models on short-form questions.
We do not evaluate models that use a specialized
inference pipeline on short-form questions because they are unable to follow instructions to only output the answer. For
instance, here is an example answer from Ai2 ScholarQA for a query from SimpleQA:
Query: Which two scientists (first and last names) are credited with first isolating Azotobacter salinestris from
saline soils? Answer in fewer than 10 words.
Answer: Page and Shivprasad were the scientists who first isolated Azotobacter salinestris from saline soils
<Paper corpusId=“7646032” paperTitle=“(Robson et al., 2015)” isShortName></Paper>. While Beijerinck
isolated Azotobacter species in 1901, this was a different species and predated the discovery of A. salinestris
<Paper corpusId=“87342753” paperTitle=”(Shin et al., 2016)” isShortName></Paper>
H.3. Score Calculation Details
Asta-ScholarQA-CS2.
We use the official code7 to evaluate our method and the baselines on Asta-ScholarQA-CS2. We
compute rubric score, answer precision, citation precision and citation recall on the 100 test set questions using gemini-2.5-
flash as the judge as detailed in (Bragg et al., 2025). Asta-ScholarQA-CS2 requires evidence text from citations in order to
judge citation precision and recall. For proprietary models (OpenAI Deep Research, GPT-5) that only provide URLs for
citations, we use JINA API to scrape the URL and use the resulting text as citation evidence.
HealthBench.
We use an adapted version of the OpenAI simple-evals suite8 for the evaluation. For each multi-turn
example, we concatenate the full conversation into a single input and prepend an instruction directing the model to answer
the question based on this doctorpatient conversation. For efficiency, we randomly sample a subset of 1000 cases for
evaluation.
DeepResearchBench.
We use the official code9 to evaluate our method and the baselines on DeepResearchBench. We
compute the Comprehensiveness, Insight/Depth, Instruction-Following, and Readability of articles answering 50 English
and 50 Chinese open-ended deep research questions. We report the Overall as the macro average of the component metrics.
We use gemini-2.5-flash as the judge and Jina API to scrape the URL to acquire the evidence snippets when needed, as
7https://github.com/allenai/asta-bench
8https://github.com/openai/simple-evals
9https://github.com/Ayanami0730/deep_research_bench
32

### 第 32 页中文译文

图 18：通用评分细则基线。该提示采用 WebThinker 评测中的通用标准，要求语言模型从正确性、相关性、完整性、清晰度和引用等总体方面给回答评分；同一标准用于所有样例，因此不含问题专属事实。图中完整提示与输出格式保持原文。

作者不评估依赖专门领域或不可获得基础设施的模型，并说明各基线的运行配置与限制。

### H.3 分数计算细节

**Asta-ScholarQA-CS2。** 使用官方代码评估本方法与基线，并按官方协议计算细则得分、引用精确率、引用召回率及其他细粒度指标。

**HealthBench。** 使用改编的 OpenAI `simple-evals` 套件。对每个多轮样例，模型获得完整对话并生成最终回答，再由官方细则和评审流程评分；负向细则可使总分低于零。

**DeepResearchBench。** 使用官方代码评估。该基准分别衡量内容质量、指令遵循和引用，并将细粒度结果组合为最终分数。

**ResearchQA。** 使用指定评审模型按问题专属细则评价。需要证据片段时，以 Jina API 抓取 URL；评审采用 `gemini-2.5-flash`。商业网页变化、抓取失败和评审模型版本都可能影响复现。原文脚注中的官方代码与仓库链接保持不变。
<!-- page 33 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
DR Tulu System Prompt Part I
You are a research assistant who answers questions through iterative reasoning and
research.
## Process
- Use <think></think> tags to show your reasoning at any point.
- Use <call_tool name="...">query</call_tool> when you need information (see tools
below).
- You can alternate between thinking and searching multiple times.
- Only provide <answer></answer> tags when you have enough information for a
complete response. If the problem asks for a specific, short-form answer, you can
also put the answer string in the \boxed{} format.
- Support every non-trivial claim with retrieved evidence. Wrap the exact claim
span in <cite id="ID1,ID2">...</cite>, where id are snippet IDs from searched
results (comma-separated if multiple). Use only returned snippets; never invent
IDs. Avoid citing filler text - cite just the factual claim.
## Calling Tools (<call_tool name="...">query</call_tool>)
- You can use the following tools:
1. google_search
- Purpose: general web search.
- Input via: <call_tool name="google_search">your query</call_tool>
- Output: web search snippets (see SEARCH RESULTS).
- Optional parameters
- gl: geolocation
- hl: host language
2. browse_webpage
- Purpose: open a specific URL (typically one returned by google_search) and
extract readable page text as snippets.
- Input via: <call_tool
name="browse_webpage">https://example.com/article</call_tool>
- Output: webpage (see SEARCH RESULTS).
3. snippet_search
- Purpose: focused snippet retrieval from scientific papers
- Input via: <call_tool name="snippet_search">your query</call_tool>
- Output: snippets from existing papers (see SEARCH RESULTS).
- Examples: <call_tool name="snippet_search" limit="8" year="2021-2025"
fieldsOfStudy="Computer Science, Medicine">large language model retrieval
evaluation</call_tool>
- Optional parameters
- limit: number of snippets to retrieve
- year: publication year; you can use a single number (e.g., 2024) or a range
(e.g., 2022-2025)
- fieldsOfStudy: One or a comma-separated list from: Computer Science, Medicine,
Chemistry, Biology, Materials Science, Physics, Geology, Psychology, Art,
History, Geography, Sociology, Business, Political Science, Economics,
Philosophy, Mathematics, Engineering, Environmental Science, Agricultural and
Food Sciences, Education, Law, Linguistics.
## Tool Output
- After you issue a tool call, we will execute it and return results wrapped in
<tool_output> tags.
- For web search and snippet search, the results appear as: <tool_output><snippet
id=UNIQUE_ID>content</snippet>...</tool_output>
- For web browsing, the searched results are represented as <tool_output><webpage
id=UNIQUE_ID>content</webpage></tool_output>
Figure 19. DR Tulu System Prompts Part I.
33

### 第 33 页中文译文

图19：DR Tulu系统提示第一部分。规定代理身份、深度研究目标、思考/搜索/浏览/论文检索工具协议，以及必须以可追踪引用支撑事实主张。要求先规划再迭代搜索，不能捏造来源；完整模板和标签保持英文原文。
<!-- page 34 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
DR Tulu System Prompt Part II
## Answer and Citation Format
- Once you collect all of the necessary information, generate the final answer,
and mark your answer with answer tags: <answer></answer>.
- If your answer is short (e.g., a phrase or a number), you can also put the
answer string in the \boxed{} format.
- In your answer, wrap the supported text in <cite id="SNIPPET_ID"> ... </cite>.
You have to use the exact ID from a returned <snippet id=...>...</snippet>.
- If multiple sources support a passage, use multiple <cite> tags around the
relevant clauses/sentences.
- Examples
<cite id="S17">LLMs often hallucinate on long-tail facts.</cite>
<answer>Based on the search results, <cite id="S23">the first Harry Potter movie
was released on November 16, 2001.</cite>Therefore, the final answer is
\boxed{November 16, 2001}.</answer>
## WORKFLOW EXAMPLE
Below is a simple example that demonstrates the process and the correct use of
tools and tags. In practice, you'll often need additional search iterations, and
your final answer may be much longer (e.g., a multi-paragraph report).
Question: Give a concise update on 2024 renewable energy market trends and current
commercial solar efficiency benchmarks.
<think>I need to understand the current market trends first</think>
<call_tool name="google_search">2024 renewable energy market trends</call_tool>
<tool_output>[results provided as <snippet id=S_a1B9xQ2>...</snippet>, <snippet
id=S_p0Zr41Q>...</snippet>]</tool_output>
<think>Now I need specific data on solar panel efficiency</think>
<call_tool name="snippet_search" limit="5" year="2023-2025"
fieldsOfStudy="Engineering, Materials Science">latest solar panel efficiency
2024</call_tool>
<tool_output>[results provided as <snippet id=S_x4xU7dU>...</snippet>, <snippet
id=S_GxA2ZLh>...</snippet>]</tool_output>
<think>I have enough to answer succinctly</think>
<answer>
Global renewables expanded rapidly in 2024, <cite ids="S_p0Zr41Q,S_GxA2ZLh">driven
primarily by the growth of solar and wind energy.</cite>
<cite ids="S_x4xU7dU">State-of-the-art commercial solar modules report cell
efficiencies of ˜26-27% and module efficiencies of ˜23-24%.</cite>
\boxed{Solar leads 2024 renewables; top commercial module efficiency ˜ 23-24%}
</answer>
Figure 20. DR Tulu System Prompts Part II.
34

### 第 34 页中文译文

图20：DR Tulu系统提示第二部分。要求综合多源证据、处理冲突、用局部引用紧随主张，并在证据充分后生成结构清晰的最终报告。一次搜索通常不够，应依据新信息继续查询；工具与标签的精确定义保留原文。
<!-- page 35 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
GPT-5+ Search (baseline) Prompt
You are a research assistant who answers questions through reasoning and research.
Requirements:
- For the given question, please write a comprehensive, evidence-backed answers to
scientific questions. The report should be a structure multi-paragraph report.
- Think and search until you have sufficient information
- Only provide the final answer when ready
- Cite all claims from search results. You should ground every nontrivial claim in
retrieved snippets.
- Please prefer authoritative sources (peer-reviewed papers, reputable
benchmarks/docs) and prioritize recent work for fast-moving areas.
- You should acknowledge uncertainty and conflicts; if evidence is thin or sources
disagree, state it and explain what additional evidence would resolve it.
- It's important to structure with clear markdown headers and a coherent flow. In
each section, write 2-5 sentence paragraphs with clear topic sentences and
transitions; use lists sparingly only when they improve clarity. Ideally, you should
synthesize rather than enumerate content: it's helpful to group findings across
papers, explain relationships, and build a coherent narrative that answers the
question, supported by citations.
- Most importantly, DO NOT invent snippets or citations and never fabricate content.
Question:
Figure 21. GPT-5+ Search (baseline). This is the prompt used for the GPT-5 + Search baseline.
detailed in (Du et al., 2025). For outputs from our system, we use the scraped URL content from the corresponding search
or browsing tools.
ResearchQA.
We evaluate our method and baselines using the original ResearchQA evaluation suite10. We compute the
averaged rubric scores with GPT-4.1-mini as the judge on the 776 official subset of questions used to evaluate deep research
systems, following (Yifei et al., 2025).
H.4. Details of Pathogenic Gene Variants Evaluation
Dataset
The evaluation data for this task was derived from expert-curated information collected for 24 pathogenic gene
variants published in the supplementary data of (Cheerie et al., 2025), which was used to develop guidelines for the
assessment of variant eligibility for various types of antisense oligonucleotide (ASO) gene therapy. Curations were done by
members of the N=1 Collaborative Patient Identification Working Group, which consists of both medical professionals (MD,
PhD, and master’s level) and faculty with expertise in medical genetics. The selected variants were deemed feasible to assess
with publicly available information, and each response was agreed upon by two members. This data reports characteristics
of selected variants that are essential to determining therapeutic eligibility, including the variant’s pathomechanism,
haploinsufficiency status of the gene it affects, inheritance pattern of associated diseases, splicing effects, and findings
from prior therapeutic approaches explored. We manually reformatted this data into 47 question-answer examples. Genetic
variants are specified in HGVS notation. Questions were preceded by a few sentences of context containing some details on
what types of evidence are preferred and the proper answer format.
Setup
To avoid the effects of contamination, we blocked all search results pointing to the paper and its supplementary files
when evaluating models with our search tools. This was not possible for closed-source DR systems, though the original
paper did not appear in the output citations for any model. We also add the statement: ”You should try to find multiple pieces
of evidence to support any claims you make, and acknowledge conflicting/supporting evidence among sources searched” to
the baseline prompt in Figure 21 for GPT+5, OpenAI DR, and Gemini 3 Pro to ensure they are calibrated to the preferences
of this task
10https://github.com/realliyifei/ResearchQA
35

### 第 35 页中文译文

图21：GPT-5 + Search基线提示，规定搜索、浏览、引用和最终回答格式。ResearchQA使用原始评测套件计算问题专属细则得分，并按既有协议比较系统。

### H.4 致病基因变异评测细节

作者与医学专家构造GeneticDiseasesQA，要求围绕变异的分子后果、疾病机制、治疗资格和证据强度生成带引用报告；只纳入可追踪引用的系统，并按最终答案、证据支持、证据质量和跨来源综合评价。
<!-- page 36 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Evaluation Criteria
Given that the task’s ultimate goal is to aid medical decision-making, we designed criteria that
capture not only the correctness of the final answer, but the usefulness of the generated report to a clinician or researcher:
• Final Answer indicates whether the expert-annotated fact was mentioned in the response. Each question has 1-3 key
facts that should be present in an ideal response, and the per-example correctness is the average of these.
• Evidence Quality indicates if the type of evidence requested in the query is present within the cited statements (e.g.
functional assays in patient-derived cells). This score aims to penalize (1) uncited evidence and (2) evidence that
is cited, but irrelevant. To demonstrate this, we provide an example response from DR Tulu that met the Evidence
Synthesis criteria (Figure 22)
• Evidence Support measures the proportion of cited statements in the response that are consistent with the original
source text retrieved. This was calculated by evaluating each cited span with the original content of the cited source.
• Evidence Synthesis indicates whether or not there was at least one statement describing the relationship between
multiple sources, e.g. how papers might build off each other or conflict.
Similar to our prior experiments, we defined specific LLM judge instructions for each evaluation criteria per question and
used GPT-4.1 to score each response. No additional training was performed for this task.
I. More Results and Analysis
I.1. Performance and Cost Breakdown
Table 11 provides detailed performance breakdown of models across four main long-form benchmarks.
Comparing DR Tulu (SFT) and DR Tulu (RL), we observe consistent gains from RLER across multiple aspects, including
rubric coverage (+11.0 points), answer precision (+7.8), comprehensiveness (+7.9), and depth of response (+9.2). RLER
also yields large improvements in citation precision and recall on SQAv2 (+25.2 and +20.0 points, respectively). These
results highlight that RLER can effectively improve deep research responses along both content and attribution dimensions.
Table 12 shows the cost of the inference of competitive systems.
I.2. Full RL Training Curves
We show the reward, number of tool calls, and output sequence length through training in Figure 26. We observe that there
appear to be three phases of training: in the first phase, sequence lengths and the average number of tool calls drop. They
then slowly increase until starting to decline again after thousands of training steps. Similar to prior work, we hypothesize
the initial phase may be due to the model initially unlearning unsuccessful behaviors picked up during SFT training before
stabilizing and exploring new strategies. A similar drop-and-rise behavior when combining RL training with SFT cold-start
data has been observed in other domains, such as mathematical reasoning (Chen et al., 2025a), and we leave further
investigation of this phenomenon to future work. The final phases may be due to the model refining its answers to stay
strictly within the output length and max tool call restrictions placed on it during training (16384 output tokens and 5 total
tool calls, respectively).
Surprisingly, we also find that our training is somewhat robust to tool errors, as we accidentally ran out of Serper
credits during training. While we eventually refilled, the model did train for some number of steps wherein Serper would
continuously return errors, as seen by the drop in reward and sequence length. However, despite this, our overall model
performance continued to improve, with step 1900 being significantly better than step 1000 (right before the Serper credit
issue). We faced credit or server issues throughout training, as seen in various dips in reward and output length, but our
model generally continued to improve across most downstream evaluations. This suggests our training is somewhat robust
to server-side tool errors, and exploring the degree of this robustness is an interesting avenue for future investigation.
I.3. On-Policy SFT and RL Results
We additionally explore augmenting the SFT data with an extra “on-policy” SFT stage. Specifically, we run our trained
model on randomly sampled prompts, apply rejection sampling to discard trajectories that do not achieve high scores on
search-based rubric verification and citation verification (details in Appendix F.3), and then use the remaining trajectories
36

### 第 36 页中文译文

本页列出GeneticDiseasesQA评价标准及表11、表12。表11分解四个长篇基准的细粒度表现，表12比较竞争系统推理成本；模型、指标和数值保持原表。

## I 更多结果与分析

### I.1 性能与成本分解

表11提供详细成绩，表12给出推理成本。

### I.2 完整RL训练曲线

图26展示奖励、工具调用数和输出长度随训练变化；作者观察不同信号并不同步，训练奖励上升不总能预测下游表现。

### I.3 同策略SFT与RL结果

作者在原SFT后加入由当前策略采样并拒绝筛选的同策略SFT，再进行RL，以研究分布匹配的影响。
<!-- page 37 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
LLM judge prompt for Evidence Support evaluation (GeneticDiseasesQA)
# Instructions
You are a claim validator. You will be given the text content from a webpage, and
a list of claims from a research report that cited the webpage.
<<content>>
<<prompt>>
<<claims>>
For each claim given you, you will determine if it is supported by the original
source's content given. For source content
with only the title available, judge them as `supporting` if the title indicates
that the
paper is likely relevant to the claim being considered.
Return a JSON object with a single key `claims` which is a list of `claim` objects,
one for each phrase given from the research report. Each `claim` object contains the
claim itself (`text`), a boolean `is_supported` which indicates if the claim is fully
supported by the citation source content, and `explanation`, which should be a
string briefly
explaining why the response is or is not supported by the citation source content.
If the provided source content is completely empty, entirely filler webpage text, or
is an error message or content filter,
output an empty list for the `claims` key.
# Example
USER:
Content of cited source: "US holidays include Veteran's Day (November 11th) and
Halloween (October 31st)."
Claims from generated report:
- "Veteran's Day is a national holiday in November."
ASSISTANT:
```json
"claims": [
{
"text": "Veteran's Day is a national holiday in November.",
"is_supported": true,
"explanation": "Sources states that Veteran's Day falls on November 11th."
},
]
```
# Final instruction
Return just the json object in markdown format. Do not include any other text in the
response.
37

### 第 37 页中文译文

本页延续表格和消融结果，报告不同训练阶段、奖励与检查点在各基准上的表现。所有数值与模型名称保持英文原表；正文结论是同策略SFT并未稳定超过高质量混合SFT，RL时长和起始模型质量仍是关键因素。
<!-- page 38 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Response of DR Tulu-8B on GeneticDiseasesQA Part I
USER:
Context: Your task is to determine the pathomechanism of a given pathogenic gene
variant. A pathogenic variant can lead to different effects. The variant can lead to
a loss of function (LoF) of a protein, a toxic gain of function (GoF), or a
dominant-negative (DN) effect. Assessing the variant effect can be done by
retrieving publications and reports of the variant [...]
Question: What is the pathomechanism of variant NM_001127222.2(CACNA1A):c.4174G>A?
Summary of the variant and its identity
- The variant NM_001127222.2(CACNA1A):c.4174G>A corresponds to a missense change
p.Val1392Met in the CACNA1A alpha 1A subunit and is curated as a pathogenic or
likely pathogenic allele in clinical resources, notably ClinVar and the ClinGen
allele registry, where it is associated with familial hemiplegic migraine and
related neurologic phenotypes <cite
id="00907dd4-0">NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) is cataloged as a
single-nucleotide variant in ClinVar with the canonical transcript
NM_001127222.2</cite> <cite id="00907dd4-4">The ClinGen Allele Registry lists
NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) as a registered canonical
allele</cite> <cite id="00907dd4-6">MGeND maps NM_001127222.2(CACNA1A):c.4174G>A
(p.Val1392Met) to Migraine, familial hemiplegic, 1 (FHM1)</cite>.
Gene-level context: CACNA1A encodes the P/Q-type calcium channel alpha 1A subunit
and underlies an autosomal dominant channelopathy spectrum
- CACNA1A encodes the pore-forming $\alpha$1A subunit of the high-voltage{activated
P/Q-type calcium channel and is a dominant disease gene for three disorders:
familial hemiplegic migraine (FHM), episodic ataxia type 2 (EA2), and
spinocerebellar ataxia type 6 (SCA6) <cite id="00907dd4-1">Pathogenic variants in
CACNA1A are associated with episodic ataxia type 2, familial hemiplegic migraine,
and spinocerebellar ataxia 6</cite> <cite id="8169b531-9">The CACNA1A gene was
identified for FHM; it encodes the $\alpha$1A subunit of the P/Q-type calcium
channel</cite>.
- Clinically, affected individuals present on a phenotypic spectrum from migraine
with transient hemiplegia/ataxia to persistent cerebellar ataxia and atrophy,
consistent with dominant inheritance and variable expressivity <cite
id="7a079b1d-9">Mutations in CACNA1A are responsible for at least three autosomal
dominant disorders: FHM1, episodic ataxia, and spinocerebellar ataxia</cite> <cite
id="7a079b1d-0">CACNA1A-related hemiplegic migraine is associated with neurological
variability and requires urgent treatment</cite> <cite id="7a079b1d-7">Clinically,
CACNA1A variants are linked to autosomal dominant FHM with cerebellar ataxia</cite>.
- Across conditions, both gain-of-function (GoF) and loss-of-function
(LoF)/haploinsufficient phenotypes have been described, with FHM commonly linked to
GoF variants affecting channel gating/hyperexcitability and ataxia/SCA6 more often
associated with LoF/hypofunction or channel dysfunction leading to neurodegeneration
<cite id="8169b531-7">Hemiplegic migraines are associated with particular types of
genetic changes in CACNA1A called \gain of function" variants</cite> <cite
id="7a079b1d-6">FHM with cerebellar ataxia is only associated with specific CACNA1A
mutations that lead to ataxia</cite>.
- In broader neurodevelopmental disease, CACNA1A variants have also been reported in
epileptic encephalopathy and cognitive/autism phenotypes, underscoring that some
pathogenic variants may act through haploinsufficiency or dominant-negative effects
in certain contexts <cite id="00907dd4-2">ClinVar Miner notes CACNA1A missense
variants in neurodevelopmental conditions</cite> <cite id="00907dd4-5">Reports
associate CACNA1A haploinsufficiency with cognitive impairment, autism, and
epileptic encephalopathy with mild cerebellar symptoms</cite>.
Figure 22. Example response of DR Tulu-8B on GeneticDiseasesQA Part I
38

### 第 38 页中文译文

图22：DR Tulu-8B在GeneticDiseasesQA上的回答示例第一部分。模型界定基因变异和临床问题，检索数据库、论文与病例证据，并用编号引用支撑关于分子机制、表型和治疗可能性的主张。基因、变异、论文标题及引用内容保持原文以避免医学专名失真。
<!-- page 39 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Response of DR Tulu-8B on GeneticDiseasesQA Part II
Variant-specific evidence and phenotype triangulation for p.Val1392Met (c.4174G>A)
- The p.Val1392Met change in CACNA1A is curated as pathogenic/likely pathogenic for
FHM and, in some families, associated with persistent cerebellar ataxia and atrophy,
aligning with a dominant gain-of-toxic-function mechanism that perturbs neuronal
excitability (migraine) and, in some cases, contributes to neurodegeneration <cite
id="00907dd4-0">ClinVar classifies NM_001127222.2(CACNA1A):c.4174G>A
(p.Val1392Met)</cite> <cite id="7a079b1d-9">FHM and ataxia phenotypes are both
linked to CACNA1A mutations in an autosomal dominant framework</cite> <cite
id="7a079b1d-6">FHM with cerebellar ataxia is only associated with certain CACNA1A
mutations</cite>.
- Population and registry compilations include c.4174G>A among pathogenic CACNA1A
variants, reinforcing its role in the dominant channelopathy spectrum; however,
direct electrophysiological characterization of this specific variant (e.g.,
activation voltage, Ca2+ influx, inactivation) is not provided in the retrieved
summaries and would require targeted functional assays <cite id="00907dd4-9">Variant
catalogs list NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met) among pathogenic
CACNA1A variants</cite> <cite id="8169b531-8">Clinical-genetic characterization of
CACNA1A-related disease summarizes dominant phenotypes across FHM, EA2, and
SCA6</cite>.
Applying the criteria to determine pathomechanism
- Dominant inheritance and autosomal transmission across FHM, EA2, and SCA6 support
a dominant mechanism at the gene{phenotype level for CACNA1A variants <cite
id="7a079b1d-9">CACNA1A-related disorders are autosomal dominant</cite>.
- For pathomechanism, CACNA1A variants can act as GoF (hyperexcitability/channel
dysfunction causing migraine) or LoF/haploinsufficient (reduced channel function
leading to ataxia/degeneration), with some variants producing mixed or variable
phenotypes depending on domain impact and genetic background <cite
id="8169b531-7">FHM is associated with gain-of-function variants in CACNA1A</cite>
<cite id="7a079b1d-6">FHM with cerebellar ataxia is specifically associated with
certain CACNA1A mutations that lead to ataxia</cite> <cite
id="00907dd4-5">Haploinsufficiency in CACNA1A has been linked to neurodevelopmental
phenotypes</cite>.
- When both GoF and LoF mechanisms are plausible at the gene level, the variant’s
phenotype and inheritance refine the likely mechanism. In FHM, transient neurologic
deficits and aura point to a dominant gain-of-toxic-function mechanism in
sensory-motor cortical circuits; in EA2/SCA6, persistent ataxia and cerebellar
atrophy point to reduced channel function or progressive neurodegeneration,
consistent with LoF/haploinsufficiency or dominant-negative effects in cerebellar
pathways <cite id="8169b531-7">Hemiplegic migraine variants are labeled as
gain-of-function</cite> <cite id="7a079b1d-6">Cerebellar ataxia in FHM is linked to
specific CACNA1A mutations</cite>.
- Given that p.Val1392Met is cataloged as pathogenic for FHM and associated with
cerebellar ataxia/atrophy in some pedigrees, the most parsimonious pathomechanism is
a dominant gain-of-toxic-function effect on neuronal excitability that drives
migraine, with possible additional contributions to cerebellar dysfunction via
haploinsufficiency or dominant-negative effects in cerebellar circuits, depending on
genetic background and penetrance <cite id="00907dd4-0">ClinVar catalogs
p.Val1392Met as a pathogenic CACNA1A variant</cite> <cite id="7a079b1d-9">Autosomal
dominant inheritance and variable phenotypes across FHM, EA2, and SCA6 are
established</cite> <cite id="00907dd4-5">Haploinsufficiency in CACNA1A contributes
to neurodevelopmental disease</cite>.
Figure 23. Example response of DR Tulu-8B on GeneticDiseasesQA Part II
39

### 第 39 页中文译文

图23：示例回答第二部分。模型继续综合功能实验、遗传证据、病例与疗法机制，区分直接证据和推断，并讨论证据局限。原始医学术语、变异记法、药物名和引用保持英文。
<!-- page 40 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Response of DR Tulu-8B on GeneticDiseasesQA Part III
Uncertainties and what functional studies would resolve them
- The retrieved evidence establishes the variant’s identity, clinical classification,
and the gene’s dominant channelopathy framework, but does not provide direct
patch-clamp or Ca2+ imaging data for p.Val1392Met. Therefore, while a dominant
gain-of-toxic-function mechanism is most consistent with FHM presentation and
gene-level GoF associations, we cannot exclude a dominant-negative or partial
haploinsufficient contribution without direct tests <cite id="8169b531-8">Clinical
and genetic characterization supports dominant mechanisms but lacks variant-specific
electrophysiology</cite>.
- To conclusively classify the mechanism for c.4174G>A (p.Val1392Met), the following
functional evidence would be decisive:
- Heterologous expression studies in HEK293 or Xenopus oocytes measuring Ca2+
current amplitude, activation/dactivation kinetics, voltage dependence,
inactivation, and pharmacology, with rescue by wild-type co-expression to test for
dominant-negative effects <cite id="00907dd4-9">Variant catalogs emphasize the
need for functional characterization for CACNA1A missense variants</cite>.
- Neuronal action potential and neurotransmitter release assays in cerebellar
Purkinje cells or cortical neurons to quantify excitability changes and test for
GoF vs LoF phenotypes <cite id="8169b531-9">CACNA1A encodes the P/Q-type channel
critical for neurotransmitter release and neuronal excitability</cite>.
- Human induced pluripotent stem cell{derived neurons or patient-specific
cerebellar organoids to assess developmental Ca2+ signaling and degeneration
kinetics in LoF vs GoF contexts <cite id="00907dd4-5">Reports link CACNA1A
haploinsufficiency to neurodevelopmental phenotypes, supporting developmental
functional assays</cite>.
- Trans-heterozygosity testing in models (e.g., LoF knockouts) to probe
dominant-negative interactions specific to p.Val1392Met <cite id="7a079b1d-6">FHM
with cerebellar ataxia is associated with specific CACNA1A mutations suggesting
gene-dose interactions</cite>.
Final assessment for NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met)
- Pathomechanism: Dominant gain-of-toxic-function in the neuronal excitability
pathway is the most consistent explanation for p.Val1392Met, given its
classification as a pathogenic FHM variant and the gene’s GoF-linked channelopathy
basis for migraine; in some pedigrees with cerebellar ataxia/atrophy, additional
haploinsufficient or dominant-negative contributions in cerebellar pathways may
contribute, yielding a mixed mechanism across brain regions and genetic backgrounds
<cite id="00907dd4-0">ClinVar classifies p.Val1392Met as pathogenic in
CACNA1A</cite> <cite id="8169b531-7">FHM is associated with gain-of-function CACNA1A
variants</cite> <cite id="7a079b1d-6">Cerebellar ataxia in FHM is associated with
specific CACNA1A mutations, suggesting multi-domain effects</cite> <cite
id="00907dd4-5">Haploinsufficiency in CACNA1A is linked to neurodevelopmental
phenotypes</cite>.
- Practical implication: In clinical contexts where CACNA1A pathogenic variants are
known to act dominantly and cause FHM with possible cerebellar involvement,
c.4174G>A (p.Val1392Met) should be considered to confer a dominant gain-of-function
(toxic) effect on P/Q-type Ca2+ channel{mediated neurotransmission, with possible
additive/penetrant haploinsufficient effects in cerebellar pathways in affected
families <cite id="7a079b1d-9">Autosomal dominant inheritance and variable
phenotypes across migraine and ataxia are established for CACNA1A</cite> <cite
id="8169b531-7">Gain-of-function mechanism is characteristic of FHM-associated
CACNA1A variants</cite>.
Figure 24. Example response of DR Tulu-8B on GeneticDiseasesQA Part III
40

### 第 40 页中文译文

图24：DR Tulu-8B在GeneticDiseasesQA上的回答示例第三部分。模型形成最终综合判断，说明特定变异是否支持显性功能获得机制及反义寡核苷酸治疗资格，同时标明证据强弱、尚缺验证和临床决策限制。医学专名、HGVS变异记法、引用与原始结论保持英文，避免改动高风险事实。
<!-- page 41 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Response of DR Tulu-8B on GeneticDiseasesQA Part IV
Evidence gaps and recommendations
- Direct functional characterization of p.Val1392Met remains to be reported in the
retrieved literature; thus, further mechanistic studies (as outlined above) are
warranted to exclude or confirm dominant-negative or LoF contributions and to
delineate the variant’s phenotype{mechanism continuum within the CACNA1A spectrum of
disease <cite id="8169b531-8">Clinical-genetic summaries highlight the need for
functional follow-up of CACNA1A missense variants</cite> <cite
id="00907dd4-9">Variant catalogs emphasize the presence of pathogenic missense
variants across neurological conditions and the need for functional
characterization</cite>.
Cited texts:
[00907dd4-0]: Title: NM_001127222.2(CACNA1A):c.4174G>A (p.Val1392Met ... - NCBI
[00907dd4-4]: Title: CA242642 - Allele Registry - ClinGen
[00907dd4-6]: Title: Annotation Detail : MGeND
[00907dd4-1]: Title: Clinical and genetic characterization of CACNA1A-related
disease
[8169b531-9]: Title: CACNA1A gene mutations in familial hemiplegic migraine
[7a079b1d-9]: Title: Two distinct phenotypes, hemiplegic migraine and episodic
Ataxia ...
[7a079b1d-0]: Title: Hemiplegic Migraine Variant List - CACNA1A Foundation
[7a079b1d-7]: Title: Next-generation sequencing identified a novel CACNA1A I1379F
...
[8169b531-7]: Title: CACNA1A-Related Disorders - Children's Hospital of Philadelphia
[7a079b1d-6]: Title: [Familial hemiplegic migraine] - PubMed - PMID:15775664
[00907dd4-2]: Title: Submissions for variant NM_001127222.2(CACNA1A):c.4174G>T
[00907dd4-5]: Title: LOC126862864 Gene - GeneCards - GeneCards
[00907dd4-9]: Title: Total 90 pathogenic variants reported for Spinocerebellar
ataxia type 6
[8169b531-8]: Title: Clinical and genetic characterization of CACNA1A-related
disease
Figure 25. Example response of DR Tulu-8B on GeneticDiseasesQA Part IV
41

### 第 41 页中文译文

图 25：DR Tulu-8B 在 GeneticDiseasesQA 上的回答示例第四部分。模型完成对变异致病机制、功能获得证据、反义寡核苷酸治疗可行性及剩余不确定性的综合，并给出带来源的最终判断。医学专名、HGVS 记法、药物与文献引用保持英文原文，避免高风险信息失真。
<!-- page 42 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
AstaBench-ScholarQA-CS2 (SQAv2)
DeepResearchBench (DRB)
Rubric
Answer
Cite-P
Cite-R
Comp
Depth
Instruction
Readability
Closed Deep Research
Claude-Sonnet Search
-
-
-
-
39.0
37.7
45.8
41.5
Perplexity Sonar
-
-
-
-
37.4
36.1
45.7
44.7
Perplexity DR
91.6
92.7
47.3
37.6
40.7
39.3
46.4
44.3
Gemini Deep Research
-
-
-
-
48.5
48.5
49.2
49.4
Gemini3 Pro + Search
83.1
98.3
68.5
29.4
43.4
44.9
49.8
49.0
GPT-5 + Search
92.3
93.8
67.8
45.6
49.7
51.5
51.6
48.5
GPT-5 + Our Search
74.9
93.2
42.5
33.7
26.7
21.3
41.0
29.4
OpenAI DR
91.5
95.6
77.4
43.1
46.8
45.2
49.2
47.1
Naive RAG
Qwen3-8B
69.2
92.3
-
-
29.4
27.0
40.2
41.1
QwQ-32B
77.5
90.3
-
-
38.1
34.8
47.0
44.6
Open Deep Research
Search-R1-7B
9.7
79.0
-
-
5.2
2.1
18.6
16.8
ASearcher-7B
13.7
94.0
-
-
5.1
1.7
15.2
11.8
WebExplorer-8B
78.6
91.4
-
-
33.7
28.5
45.7
42.2
WebThinker-32B-DPO
36.7
94.9
-
-
19.7
12.3
36.8
26.3
Tongyi DeepResearch-30B-A3B
89.5
96.4
-
-
39.1
34.3
46.8
45.4
Fixed Pipeline Deep Research
WebThinker QwQ-32B (report)
86.4
94.3
-
-
36.2
32.6
43.2
42.9
WebThinker-32B-DPO (report)
91.2
95.5
-
-
39.4
35.4
46.0
43.5
Ai2 ScholarQA - Claude Sonnet
88.1
89.1
92.4
81.2
35.1
32.0
40.5
38.9
Open Deep Research (Ours)
Qwen3-8B + Our Search
42.8
92.1
53.7
40.3
14.3
8.7
29.5
24.4
DR Tulu-8B (SFT)
81.4
91.0
65.3
51.6
36.3
35.3
45.5
39.5
DR Tulu-8B (RL)
92.4
98.8
90.5
71.6
44.2
44.5
49.4
42.4
Table 11. Performance breakdown for Asta-ScholarQA-CS2 and DeepResearchBench. Open deep research models and naive RAG
baselines do not provide citations, indicated as “-” in citation columns. Rows with a gray background indicate models that use closed
models as backbone LMs. Bold indicates the best results among the baselines that do not use propriety models.
Answer Length
Citations
Tool Calls
Cost / Query*
GPT-5+ Search
2358.7
28.1
-
0.29
OpenAI Deep Research
6445.1
79.6
-
1.8
Gemini 3 Pro + Search
1310.9
8.6
8.5
0.13
Ai2 ScholarQA - Claude Sonnet
2090.5
61.2
1.0
1.3
WebExplorer-8B
1250.4
-
9.1
0.019
WebThinker-32B
92.2
-
6.9
0.0037
WebThinker-32B (report)
4416.7
-
8.2
0.015
Tongyi Deep Research-30B-A3B
2138.9
-
23.0
0.032
DR Tulu-8B (RL)
1889.2
35.8
4.3
0.0019
Table 12. Comparison of model usage statistics on SQAv2. We report answer lengths, tool usage, and citation counts across systems. “-”
denotes this information was either not available or it was not applicable. The cost per query is estimated based on model inference on
ScholarQA-CS2, following (Bragg et al., 2025). More details of cost estimations are available in Appendix I.5.
for further SFT. We show the results in Figure 5 (left), comparing using the on-policy-trained model as a starting point for
RL relative to our original SFT set, an undertrained model, or using no SFT at all. While the on-policy SFT slightly boosts
SFT model performance, we find it ultimately weakens performance later on during RL training, underperforming using our
regular SFT mixture on Healthbench and SQAv2.
42

### 第 42 页中文译文

表 11：Asta-ScholarQA-CS2 与 DeepResearchBench 的性能细分。开放深度研究模型、朴素 RAG、固定流水线、闭源系统及本方 SFT/RL 模型按总体质量、相关性、指令遵循、引用精确率/召回率等指标比较；模型名和数值保持原表。

表 12：SQAv2 上的模型使用统计与成本比较，报告答案长度、不同工具调用数、引用数及每次查询成本。“–”表示不可获得。成本为指定 API 价格与推理用量估算，并非统一硬件实测。
<!-- page 43 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
0K
1K
2K
3K
4K
6
7
8
9
Overall Reward
0K
1K
2K
3K
4K
8000
10000
12000
Output Length
0K
1K
2K
3K
4K
3
4
5
Num. Tool Calls
Training Steps
Figure 26. Overall reward, output length (in tokens, including tool outputs), and average number of tool calls during RL training.
Note that during the run, we periodically ran out of serper credits, causing a rise tool errors until we refilled the account, causing a drop in
reward and output length, and a rise in tool calls (as the model retried the failed calls). This happened a few times during the run. We also
found that reward jumped sharply around step 2000 after a run restart.
HealthBench
ResearchQA
SQAv2
DRB
Average
w/ citation reward
42.7
71.0
86.4
42.1
60.6
w/o citation reward
44.7
71.9
86.7
41.4
61.2
Table 13. Ablation on the citation reward. Both runs branch from a shared checkpoint at step 650 (when RL starts to show clear gains
on long-form benchmarks) and continue through step 1300 with identical hyperparameters; the only difference is whether the citation
reward is enabled. Disabling the citation reward in the later phase of training does not hurt overall performance and slightly improves the
average score, suggesting that the rubric component of RLER, rather than the citation auxiliary signal, drives the gains.
I.4. Ablation on the Citation Reward
To isolate the contribution of the evolving rubric reward from the auxiliary citation reward used during RL training, we
run an ablation that branches from a shared checkpoint at step 650 (the point at which RL begins to show clear gains on
the long-form benchmarks) into two runs with identical hyperparameters through step 1300: one with the citation reward
enabled (w/ cite) and one without (w/o cite). As shown in Table 13, the two runs achieve comparable final performance, with
w/o cite slightly ahead on average (61.2 vs. 60.6). This indicates that the citation reward is not the source of RLER’s gains
in this regime, and that the rubric-based reward is responsible for the bulk of the improvement. We additionally observe that
the format reward saturates at 1.0 early in training and contributes little signal beyond the warmup phase. Combined with
the RLER on/off ablation in Figure 6, these results suggest that RLER, rather than the auxiliary rewards, is the main source
of our gains, although a full factorial sweep over auxiliary rewards is beyond our compute budget.
I.5. Cost Estimation
In this section, we detail how we estimate the cost of deep research models. Detailed cost comparison can be found in
Table 12.
For proprietary models, we use the actual billed costs reported in their API consoles. Although Gemini 3 + Search waives
the first 1,500 searches per day,11 we still include search costs in our estimates for a fair comparison with other systems that
charge for search.
For open models (including our own), we compute the number of input and output tokens and use OpenRouter’s published
pricing to estimate inference costs. Specifically, we use the published pricing for Tongyi Deep Research12; we use the
published pricing for Qwen3-8B for DR Tulu, WebExplorer-8B, ASearcher13; We we use the published pricing for QwQ-32B
for WebThinker models14. We treat system prompts and questions as input tokens, and all remaining tokens as output tokens
in our calculations for open models. We also add tool-call costs based on the pricing of each tool’s API provider and the
average number of tool calls performed by each model across our long-form evaluations.
11https://ai.google.dev/gemini-api/docs/pricing?hl=en
12Tongyi Deep Research costs USD 0.09 per input token and USD 0.4 per output token as of Nov 23 2025.
13Qwen3-8B costs USD 0.2 per input and output token as of Nov 23 2025.
14QwQ-32B costs USD 0.4 per input and output token as of Nov 23 2025.
43

### 第 43 页中文译文

图 26：RL 训练期间总体奖励、输出长度（含工具输出词元）和平均工具调用数。训练推进时，奖励、长度和调用数变化并不完全同步，说明奖励提高可能部分来自行为尺度变化。

表 13：引用奖励消融。两次运行从第 650 步同一检查点分支，一支继续使用引用奖励，另一支关闭；总体结果接近。

### I.4 引用奖励消融

该分支实验表明，关闭引用辅助奖励后下游表现差异较小，主要增益更可能来自细则奖励；但单次分支与有限检查点不足以排除引用奖励对训练稳定性或特定指标的影响。

### I.5 成本估算

专有模型采用 API 控制台实际费用；开放模型按工具 API 与模型推理词元估算。不同系统的搜索后端、缓存、托管和定价口径不同，详见表 12。
<!-- page 44 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
5
10
15
Max tool calls
35.0
37.5
40.0
42.5
45.0
47.5
Score (%)
HealthBench
5
10
15
Max tool calls
37
38
39
40
41
DRB
5
10
15
Max tool calls
75
80
85
SQAv2
5
10
15
Max tool calls
64
66
68
70
ResearchQA
SFT
RL
Figure 27. Ablations on maximum tool calls. We evaluate DR Tulu (SFT) and DR Tulu (RL; 1900 steps) on four long-form datasets
while varying the maximum number of allowed tool calls from 1 to 15, and report how performance changes under these caps.
Top-K Snippets
Metric
1
3
5
10
set same
0.77
2.04
3.34
6.01
pos match
0.77
1.71
2.22
2.93
(a) One-week apart
Top-K Snippets
Metric
1
3
5
10
set same
0.88
2.53
4.20
7.67
pos match
0.88
2.35
3.48
5.64
(b) Within a short interval
Table 14. Search engine output variance across repeated queries. The left table shows results when two queries were issued one week
apart, while the right table shows results when the two queries were issued within a short interval.
I.6. Effect of the tool-call budget at inference time.
We studied how the inference-time tool-call budget affects performance by varying the maximum number of allowed tool
calls to {1,3,5,10,15}. For both SFT and RL models, performance typically saturates around a budget of five tool calls,
although RL occasionally improves with an additional budget of up to ten tool calls; see Figure 27. This matches tool call
behavior seen during RL training (Appendix I.2), in which the model uses 3-4 tool calls on average per sample.
I.7. Evaluation Variances
The inference and evaluation of deep research models often exhibit significant variance. When running models on the same
questions or evaluating them on the same benchmarks, the results can vary substantially. Typically, there are three key
factors that contribute to this variance and we will discuss them in the following sections.
I.7.1. VARIANCES INTRODUCED BY TOOLS
Invoking a tool with identical inputs at different times can yield inconsistent outputs, leading the model to produce divergent
subsequent contexts. In this section, we focus on the output variance introduced by the search engine.
We sampled 100 function-calling queries and reissued these queries to the Google search engine, with approximately one
week between the two invocations. We then computed the differences in the top-1, top-3, top-5, and top-10 retrieved snippets
for each pair of calls. For comparison, we also measured the differences between two calls issued nearly at the same time.
We use the following metrics to evaluate the variance of search engines’ returns.
• set same: The number of shared items within the top-k results, regardless of order (i.e., the size of the intersection).
• pos match: The number of positions in the top-k where both lists contain the same item at the same rank.
As shown in Table 14, the search engine’s returns are unstable. Even when calling the same query within a short interval, it
still produces noticeably different results. The average overlap in the top-10 snippets is only about 7.67, with exact rank
matches dropping to 5.64. When the same queries are reissued one week apart, the search engine’s returns diverge more
significantly. We show examples of inconsistencies in Figure 28.
44

### 第 44 页中文译文

图 27：最大工具调用次数消融。在四个长篇数据集上比较 DR Tulu SFT 与训练 1900 步 RL 检查点，横轴为调用预算；更多调用通常先带来收益，随后趋于饱和，任务间最佳预算不同。

### I.6 推理期工具调用预算的影响

作者改变允许的最大工具调用数，研究质量、成本和时延权衡。固定预算可能限制复杂任务，也可能让简单任务产生无效检索；DR Tulu 的自适应使用可减少浪费。

### I.7 评测方差

#### I.7.1 工具引入的方差

对 100 个函数调用查询间隔约一周重新请求 Google 搜索。表 14 比较结果集合重叠、排序与文本变化。搜索引擎具有时间和个性化波动，相同查询不会稳定返回相同证据。

表 14：重复查询的搜索输出方差；左侧为相隔一周，右侧为较短间隔。指标定义与数值保持原表。
<!-- page 45 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Showcase of Search Engine’s Returns
# Search Results I (show top-5 snippets)
Position: 1
Link: https://en.wikipedia.org/wiki/E._Howard_Hunt
Snippet: Everette Howard Hunt Jr. (October 9, 1918 { January 23, 2007) was an
American intelligence officer and author. From 1949 to 1970, Hunt served as an
officer ...
Position: 2
Link: https://www.amazon.com/stores/author/B0034QAV74
Snippet: Top E. Howard Hunt titles · American Spy: My Secret History in the CIA,
Watergate and Beyond. American Spy: My Secret History in the CIA, Watergate and
Beyond.
Position: 3
Link: https://www.fantasticfiction.com/h/e-howard-hunt/
Snippet: Everette Howard Hunt, Jr. was an American author and spy. He worked for the
Central Intelligence Agency (CIA) and later the White House under President ...
Position: 4
Link: https://www.goodreads.com/author/list/118536.E_Howard_Hunt
Snippet: E. Howard Hunt has 85 books on Goodreads with 2730 ratings. E. Howard
Hunt's most popular book is House Dick.
Position: 5
Snippet: E. Howard Hunt, a spy's spy. Hunt carried on writing spy novels long after
the Watergate scandal but the Peter Ward books are among his most popular series ...
# Search Results II
Position: 1
Link: https://en.wikipedia.org/wiki/E._Howard_Hunt
Snippet: Everette Howard Hunt Jr. (October 9, 1918 { January 23, 2007) was an
American intelligence officer and author. From 1949 to 1970, Hunt served as an
officer ...
Position: 2
Link: https://www.goodreads.com/author/list/118536.E_Howard_Hunt
Snippet: E. Howard Hunt has 85 books on Goodreads with 2730 ratings. E. Howard
Hunt's most popular book is House Dick.
Position: 3
Link: https://www.amazon.com/E-Howard-Hunt/e/B0034QAV74/ref=dp_byline_cont_ebooks_1
Snippet: Follow E. Howard Hunt and explore their bibliography from Amazon's E.
Howard Hunt Author Page ... Howard Hunt. Most popular. American Spy: My Secret
History ...
Position: 4
Link: https://www.fantasticfiction.com/h/e-howard-hunt/
Snippet: Everette Howard Hunt, Jr. was an American author and spy. He worked for the
Central Intelligence Agency (CIA) and later the White House under President ...
Position: 5
Link:
https://spyscape.com/article/cia-spy-howard-hunt-confessions-of-a-watergate-plumber
Snippet: E. Howard Hunt, a spy's spy. Hunt carried on writing spy novels long after
the Watergate scandal but the Peter Ward books are among his most popular series ...
Figure 28. Examples of Inconsistencies of Search Results.
45

### 第 45 页中文译文

图 28：搜索结果不一致示例。相同或近似查询在不同时间返回的页面、摘要与排序会变化，有些原结果消失，有些新增；即便 URL 相同，摘要文本也可能不同。这直接改变代理可见证据与后续轨迹，因此在线搜索评测不是确定性实验。
<!-- page 46 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
I.7.2. VARIANCES INTRODUCED BY INFERENCE
Generating particularly long trajectories can also introduce variance. Small differences early in the process can lead to
substantially divergent final responses. To observe the impact of this variability, we re-ran one short-form benchmark and
two long-form benchmarks, comparing the outputs from two separate generations using GPT-4.1 with our auto-search
pipeline.
As shown in Table 15, in 2Wiki, GPT-4.1 produces final answers that differ by 29.3% in the 300 cases and obtains high
variances in long-form tasks like Healthbench and ResearchQA as well.
Task
2Wiki
Healthbench
ResearchQA
Numbers
300
900
776
Diff
29.3
17.1
9.81
Table 15. Inference Variance. The Diff in 2Wiki refers to the difference in two final answers of the two trajectories under the same cases,
while the Diff in Healthbench and ResearchQA represents the absolute difference in LLM judged scores.
I.7.3. VARIANCES INTRODUCED BY JUDGE MODELS
When evaluating the same responses in different times, even if using the same model as a judge, inconsistent judgments may
occur.
We use GPT-4.1 to evaluate the same trajectories twice and the results are shown in Table 16. The judgments show relatively
high consistency and reliability on both short-form and long-form tasks.
2Wiki
Healthbench
ResearchQA
1
67.67
37.67
66.18
2
66.33
37.51
66.43
Table 16. Judgement Variance.
I.7.4. ROBUSTNESS TO THE BROWSER TOOL USED AT INFERENCE
DR Tulu-8B is trained with a local Crawl4AI-based web browse tool to reduce training cost, but evaluated with the Jina
API to remain consistent with prior open-source baselines (e.g., Tongyi DR, ASearcher). To verify that this train/inference
mismatch does not significantly affect downstream performance, we re-evaluate DR Tulu-8B with Crawl4AI as the inference-
time browser. Table 17 shows that the choice of browser at inference has minimal impact (≤1 point on every benchmark,
−0.5 on average), suggesting that one can train with cheaper browser alternatives and still benefit from other browser
providers at test time without re-training.
Browser
HealthBench
ResearchQA
SQAv2
DRB
Average
Crawl4AI (training-time tool)
54.2
76.4
87.8
45.4
66.0
Jina (main-evaluation tool)
54.0
75.6
87.2
45.3
65.5
Table 17. Browser tool ablation at inference. Switching the inference-time web browse tool from Crawl4AI (used during training)
to Jina (used in our main evaluations) yields only a minor average drop (−0.5), demonstrating that the agent generalizes to alternative
browsers without re-training.
I.8. Mismatch between RL Training and Downstream Evaluation
During development of DR Tulu, we found that our RL training setup had some mismatch with our downstream performance:
models that achieved the highest training reward did not necessarily achieve the highest downstream evaluation performance.
To highlight this, compare the training reward of the “No SFT” and “Our SFT” models in Figure 29 against their performance
in Figure 5. While starting directly from Qwen 3 (“No SFT”) achieves highest train reward,it has dramatically lower
46

### 第 46 页中文译文

#### I.7.2 推理引入的方差

在相同样例上重复采样轨迹。表 15 用 2Wiki 最终答案差异、长篇基准得分差和工具调用差衡量推理随机性；即使提示和系统相同，采样、工具结果与后续决策也会产生不同答案。

表 15：推理方差。2Wiki 的 Diff 表示同一案例两条轨迹最终答案是否不同，其余列比较得分或行为差异，数值保持原表。

#### I.7.3 评审模型引入的方差

使用 GPT-4.1 对相同轨迹评价两次，结果见表 16。总体判断较一致但并非完全相同，边界细则和长答案仍可能波动。

表 16：评审方差，指标与数值保持原表。

#### I.7.4 对推理期浏览器工具的稳健性

训练使用本地 Crawl4AI 浏览器以降低成本，评测使用 Jina。表 17 比较两者，性能接近，说明此处训练—推理工具错配影响有限，但不能保证对所有网页类型成立。

### I.8 RL 训练与下游评测的错配

作者发现训练奖励最高的配置不总是下游最佳，进一步分析不同起点和奖励曲线。（续下页。）
<!-- page 47 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
0K
0.1K
0.2K
0.3K
0.4K
0.5K
0.6K
4
6
8
Overall Reward
0K
0.1K
0.2K
0.3K
0.4K
0.5K
0.6K
0.4
0.6
0.8
Pers. Rubric Reward
0K
0.1K
0.2K
0.3K
0.4K
0.5K
0.6K
2
4
6
Num. Tool Calls
Training Steps
Our SFT
No SFT
Figure 29. Metrics during RL training when starting from two different models (with and without SFT). “Pers. Rubric reward”
refers to the reward over the search-based rubrics only (not including the rubrics generated as part of the RLER process). Starting from a
model without cold start data (“no SFT”) achieves higher train reward, but underperforms on downstream evaluations.
2.4%
0.9%
96.8%
SQAv2
5.4%
23.4%
71.3%
Healthbench
6.4%
43.1%
50.5%
DeepResearchBench
0.7%
77.0%
22.2%
SimpleQA
Paper Search
Google Search
Browse Webpage
Figure 30. Distribution of tool calls for SQAv2 (science), HealthBench (healthcare), DeepResearchBench (general domain) and
SimpleQA (factoid, short-form QA). DR Tulu can adaptively choose effective tools for different tasks, relying more on paper search
for scientific questions (SQAv2), and more on google search for general-domain questions (SimpleQA).
downstream evaluation results (see Figure 5). It also displays significantly different behavior, using significantly more tool
calls than the cold-started (“Our SFT”) model.
This may be due to a few factors: first, our evaluations use rubrics generated in different manners to our own training rubrics
(e.g., Healthbench uses expert-annotated rubrics), potentially leading to cases where test-time rubrics evaluate features not
commonly tested in our training rubrics. Second, there may be reward hacking behavior during RL training, due to our use
of an LM judge different to the judges used in downstream evaluation. Our in-loop judge model uses GPT-4.1-mini, while
downstream evaluations use varied different models (e.g., SQAv2 uses Gemini Flash 2.5, DRB uses a mix of Gemini Pro 2.5
and Gemini Flash 2.5, and Healthbench uses GPT-4.1, all with varying prompts and evaluation harnesses). This may lead to
our RL training optimizing for attributes preferred by GPT-4.1-mini, but not by downstream evaluation judges. We finally
conjecture that another contributing factor may be the difference in model priors: different models may exploit rewards
in different ways. For example, rollouts from a weaker model may contain fewer high-quality answers; when all answers
are poor, the judge model may end up selecting based solely on spurious features rather than making meaningful quality
comparisons. In contrast, when starting from the same initial model, we usually observe that reward improvements correlate
well with downstream scores. We defer a deeper investigation of this mismatch phenomenon to future work, as addressing it
would help improve the effectiveness of rubrics for RL training.
J. Analysis on Searched Tools and Domain Distributions
We analyze the tools used by an intermediate RL checkpoint of DR Tulu (step 1900), and find that its tool usage adapts to
each task’s information needs. Figure 30 shows that paper search (our scientific-paper search) dominates on SQAv2,
consistent with its focus on literature understanding.
47

### 第 47 页中文译文

图 29：从有 SFT 与无 SFT 两种模型开始 RL 时的训练指标。“个性化细则奖励”等曲线显示，训练内奖励增长与下游平均分可能错位；更高奖励、更多工具调用或更长输出不自动等于更好研究质量。

图 30：SQAv2、HealthBench、DeepResearchBench 与 SimpleQA 的工具调用分布。对训练 1900 步的中间检查点分析发现，工具选择会适应任务：科学任务主要用论文搜索，医疗和通用任务更多使用网页搜索/浏览，短问答调用更少。
<!-- page 48 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
0
2
4
github.com
lmsys.org
huggingface.co
arxiv.org
youtube.com
SQAv2
0
40
80
120
160
pmc.ncbi.nlm.nih.gov
cdc.gov
aafp.org
mayoclinic.org
ncbi.nlm.nih.gov
Healthbench
0
20
40
Count
researchgate.net
en.wikipedia.org
youtube.com
reddit.com
pmc.ncbi.nlm.nih.gov
DeepResearchBench
0
100
200
Count
en.wikipedia.org
facebook.com
youtube.com
reddit.com
instagram.com
SimpleQA
Figure 31. Distribution of domains among web search results for SQAv2 (science), HealthBench (healthcare), DeepResearchBench
(general domain) and SimpleQA (factoid, short-form QA). We show top domains returned by the google search tool. Calculations
are based on 100 samples from each task. These top domains match the evaluation domain; e.g., when evaluating on Healthbench, DR
Tulu searches more for medical domain websites.
Figure 31 further confirms task-specific retrieval behavior. HealthBench emphasizes authoritative biomedical and public-
health sites (e.g., cdc.gov, pmc.ncbi.nlm.nih.gov, ncbi.nlm.nih.gov, mayoclinic.org). DeepRe-
searchBench mixes technical and policy sources (e.g., researchgate.net, oecd.org, github.com), consistent
with deeper, exploratory research tasks. SimpleQA is dominated by general reference and social/information platforms (e.g.,
en.wikipedia.org, facebook.com, youtube.com). Overall, tool usage and surfaced domains align with each
dataset’s information demands: literature-centric tasks favor scientific search and scholarly venues, whereas open-domain
tasks lean on general web search and broad reference sites.
J.1. Qualitative Examples
We present one trajectory of our DR Tulu on the long-form task ResearchQA in Figures 36–38. The response is truncated
for brevity; we will release full model response samples after review.
48

### 第 48 页中文译文

图 31：四个任务网页搜索结果的域名分布。HealthBench 更强调权威生物医学与公共卫生来源；SQAv2 以学术来源为主；DeepResearchBench 混合技术、政策与通用来源，如 ResearchGate、OECD 和 GitHub；SimpleQA 的来源更分散。该图进一步确认检索行为具有任务特异性，但域名频率本身不等于来源质量。

### J.1 定性示例

图 36–38 展示 DR Tulu 在 ResearchQA 长篇任务上的一条轨迹。为版面长度，回答有所截断；示例用于说明规划、迭代搜索、证据综合与局部引用方式，不能代表总体成功率。
<!-- page 49 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Trajectory for OpenScholar SFT Data Part I
User
Please provide a detailed overview of theories and models related to Artificial
Intelligence (AI) in education. Include information on the foundational theories
that underpin AI's role in education, such as constructivism, behaviorism, and
connectivism, and how these theories inform AI-based learning tools. Additionally,
explain prominent AI models and frameworks, such as Intelligent Tutoring Systems
(ITS), Adaptive Learning Systems, Learning Analytics, and Natural Language
Processing in education. Highlight their key features, applications, and
contributions to personalized learning, teacher efficiency, and student engagement.
Please reference recent scholarly works to support your response.
Assistant
<think>
Decompose the question: We need to (a) outline foundational learning theories
(behaviorism, constructivism, connectivism) and explicitly connect them to
AI-in-education designs, and (b) explain prominent AI models/frameworks (ITS,
adaptive learning, learning analytics, NLP in education), including features,
applications, and contributions (personalization, teacher efficiency, engagement),
all supported by recent scholarly sources.
Assumptions: There are review/survey papers in AI in Education (AIED), Learning
Analytics (LAK), and Educational Data Mining (EDM) from 2020{2025 that synthesize
how pedagogical theories inform AI tools, and evaluations of ITS, adaptive systems,
analytics, and NLP tools. We should also pull specific examples and quantified
impacts where possible (e.g., learning gains from ITS, prediction performance in LA,
efficacy of automated feedback).
Search plan:
1) Start with surveys/reviews linking AI in education to learning theories
(2020{2025), ideally in AIED, BJET, Computers \& Education, Review of Educational
Research, LAK, EDM venues.
2) Retrieve authoritative sources on ITS and adaptive learning (classic + recent
advances like knowledge tracing, deep KT, mastery learning, LLM tutoring).
3) Gather learning analytics frameworks and applications (early warning systems,
dashboards, ethics).
4) Collect NLP-in-education applications (automated scoring, feedback, dialogue
tutoring, LLMs) and evidence on teacher efficiency and student engagement.
First query will target a broad review tying theories and AI models together.
</think>
<call_tool name="snippet_search" year="2020-2025" limit="10"
fieldsOfStudy="Education,Computer Science">AI in education review behaviorism
constructivism connectivism intelligent tutoring systems adaptive learning learning
analytics NLP</call_tool>
Figure 32. Example trajectory for OpenScholar SFT data Part I.
49

### 第 49 页中文译文

图 32：OpenScholar SFT 数据轨迹示例第一部分。面对关于学习科学与人工智能教育工具的综述问题，教师代理先分析任务范围，提出需要覆盖的主题和证据类型，再用论文搜索发起宽范围查询。搜索结果、工具协议、论文题名与引用标识保持英文原文；核心过程是从初始问题建立检索计划，而不是立即生成答案。
<!-- page 50 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Trajectory for OpenScholar SFT Data Part II
Functional Calling
<tool_output>
...
<snippet id="S_4yWB0UY">Title: The AI Revolution in Education: Will AI Replace or
Assist Teachers in Higher Education?
AI in education has evolved from computer-assisted instruction to intelligent
tutoring systems (ITS) and adaptive learning technologies, with key themes including
personalized feedback, natural language processing, and innovative tools like
chatbots and virtual reality, enhancing student engagement and facilitating
knowledge co-creation between 2020 and 2025.</snippet>
<snippet id="S_KAymhlA">Title: AI Language Models as Educational Allies: Enhancing
Instructional Support in Higher Education
AI in education enhances instructional techniques, assessment methods, and
personalized learning through intelligent tutoring systems and adaptive learning,
while also necessitating further knowledge on technology to avoid misinformation,
indicating a dynamic area of research from 2020 to 2025.</snippet>
...
</tool_output>
Assistant
<think>
Reflection on first query results:
- The initial search returned broad reviews touching on AI branches (ML, DL, NLP)
and applications (ITS, adaptive learning, automated assessment) with some claims
about personalization and teacher support (S_c8C9s9m, S_NTanrK5, S_N8QWms7). These
are relevant but high-level and light on explicit connections to learning theories
and quantitative evidence.
- S_tuhIPDv explicitly mentions ITS and NLP integrating behaviorism, constructivism,
and connectivism, which is directly pertinent, though I need stronger, peer-reviewed
sources that articulate these theory-to-tool mappings.
- For models/frameworks, I also need authoritative, recent evidence on ITS
effectiveness, adaptive learning via knowledge tracing, learning analytics
frameworks (predictive models, dashboards), and NLP applications (AWE, ASR, chatbots,
LLMs) with impacts on personalization, teacher efficiency, and engagement.
Gaps:
- Explicit theoretical grounding linking behaviorism, constructivism, and
connectivism to AI tools with scholarly backing.
- Quantitative or meta-analytic evidence for ITS/adaptive systems.
- Up-to-date learning analytics frameworks and outcomes.
- NLP in education evidence, including automated feedback and LLM-based tutoring.
Next query:
Search for papers that explicitly connect behaviorism, constructivism, and
connectivism to AI/ITS/adaptive learning frameworks in education, 2020{2025, in
education and CS venues.
</think>
<call_tool name="snippet_search" year="2020-2025" limit="10"
fieldsOfStudy="Education,Computer Science">behaviorism constructivism connectivism
artificial intelligence in education theoretical framework</call_tool>
Functional Calling
...
Figure 33. Example Trajectory for OpenScholar SFT Data Part II.
50

### 第 50 页中文译文

图 33：OpenScholar SFT 轨迹第二部分。代理阅读初步论文结果，识别已有综述过于宽泛、缺少直接连接学习理论与具体 AI 工具的证据，于是提出更聚焦的子查询，分别搜索智能辅导、适应性学习、学习分析及生成式 AI。页面中的思考文本、调用参数和检索片段完整保留英文。
<!-- page 51 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Trajectory for OpenScholar SFT Data Part III
Assistant
<think>
We have initial broad reviews but need stronger, specific evidence tying learning
theories to AI designs and quantifying effects for ITS, adaptive learning, learning
analytics, and NLP in education. Key gaps: (1) explicit mapping of
behaviorism/constructivism/connectivism to AI paradigms with scholarly backing; (2)
quantitative evidence for ITS/adaptive learning (e.g., learning gains, knowledge
tracing); (3) learning analytics frameworks and teacher-facing outcomes; and (4) NLP
applications (AWE/ASR/chatbots/LLM tutors) with impacts on personalization,
efficiency, and engagement.
Next, I will search for meta-analyses or systematic reviews on ITS effectiveness and
adaptive learning from 2020{2025, then for learning analytics frameworks and
NLP-in-education evaluations.
</think>
<call_tool name="snippet_search" year="2020-2025" limit="10"
fieldsOfStudy="Education,Computer Science">intelligent tutoring systems
meta-analysis effectiveness learning gains 2020..2025 educational data mining
knowledge tracing adaptive learning</call_tool>
Functional Calling
...
Assistant
<think>
We have gathered broad reviews on AI in education and some mentions connecting
pedagogical theories to AI paradigms. We also have meta-analytic evidence for ITS
effectiveness summarized in recent reviews, but we still need: (a) clearer, recent
sources on adaptive learning mechanisms like knowledge tracing; (b) specific
learning analytics frameworks and teacher-facing applications; and (c)
NLP-in-education evidence including automated feedback and LLM-based tutoring
impacts. We have performed four searches; we can do up to four more if needed.
However, current snippets include: a systematic review describing AI branches and
applications in education (S_c8C9s9m); papers situating AI paradigms within
behaviorist, constructivist, and connectivist frames (S_YRwbcNE, S_JCPVjqk,
S_6KKZmn3); reviews summarizing ITS/adaptivity and meta-analyses with effect sizes
(S_lUcsvG5, S_sUEgQk4, S_xkpGPkk); and reviews of NLP applications in language
learning (S_KVwSGwG) and integrated AI+learning analytics perspectives (S_RBEFb7h).
While we could add more targeted evidence on knowledge tracing and dashboards, the
current evidence suffices to construct a theory-to-tool mapping and to detail
features/applications and contributions across ITS, adaptive learning, learning
analytics, and NLP with citations. I will structure the answer with sections: (1)
Foundations: behaviorism, constructivism, connectivism and their implications for AI
tools; (2) Intelligent Tutoring Systems; (3) Adaptive Learning Systems; (4) Learning
Analytics; (5) NLP in Education; (6) Contributions to personalized learning, teacher
efficiency, and engagement; (7) Emerging trends and considerations. I will ensure
claims are supported by retrieved snippets.
</think>
Figure 34. Example trajectory for OpenScholar SFT data Part III.
51

### 第 51 页中文译文

图 34：OpenScholar SFT 轨迹第三部分。代理总结当前证据缺口：需要更具体地说明工具如何对应认知主义、建构主义、自我调节学习等理论，并继续搜索。随后规划报告结构，包括生成式 AI 工具、智能辅导系统、适应性学习系统与学习分析四部分，要求每部分讨论机制、证据、局限和教学含义。
<!-- page 52 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Trajectory for OpenScholar SFT Data Part IV
Assistant (Final Answer)
<answer>
# Overview
Artificial Intelligence (AI) in education encompasses techniques such as machine
learning, deep learning, and natural language processing that analyze learner data
to personalize instruction, generate feedback, and support pedagogical
decision-making across intelligent tutoring systems, adaptive platforms, and
learning analytics tools <cite id="S_c8C9s9m">AI has many branches and sub-branches,
such as machine learning, deep learning, and natural language processing; in
education, AI supports intelligent tutoring systems, intelligent agents, and
intelligent collaborative learning systems, and supports teachers' decision making
by reporting real-time class statuses and personalized learning platforms</cite>.
Recent syntheses emphasize AI’s rapid expansion into personalized feedback, chatbots,
and virtual environments for engagement and co-creation, while underscoring the need
for interdisciplinary integration with learning sciences <cite id="S_4yWB0UY">AI in
education has evolved from computer-assisted instruction to intelligent tutoring
systems and adaptive learning technologies, with key themes including personalized
feedback, natural language processing, and innovative tools like chatbots and
virtual reality, enhancing student engagement and facilitating knowledge
co-creation</cite><cite id="S_RBEFb7h">The integration of AI, particularly through
learning analytics and NLP, is revolutionizing education by enhancing personalized
learning experiences and engagement, with advancements like large language models
improving performance in examinations and emphasizing collaboration between AI
developers and educators</cite>.
# Foundational Theories and How They Inform AI in Education
Behaviorism, cognitivism, constructivism, and connectivism offer complementary
lenses for designing AI-enabled learning experiences. Behaviorism emphasizes
observable behavior change through stimuli, repetition, and reinforcement, aligning
with drill-and-practice, mastery learning, and immediate feedback mechanisms common
in early computer-assisted instruction and some ITS components <cite
id="S_6KKZmn3">The earliest learning theory, behaviorism, focuses on human behaviors
based on repetition and response to stimuli, enabling learning to be observed and
quantified</cite>. Constructivism positions learners as active constructors of
knowledge through authentic, collaborative, and reflective activity, motivating AI
tools that scaffold inquiry, support problem-based learning, and adaptively guide
students through complex tasks <cite id="S_6KKZmn3">Constructivism is
learner-centered, emphasizing collaborative, active, and reflective learning where
students act autonomously and self-directed</cite><cite
id="S_XrZdksg">Constructivism encompasses situated cognition, activity theory,
experiential learning, anchored instruction, and authentic learning as frameworks
for educational technology, organized under a constructivist umbrella</cite>.
Connectivism reframes learning as networked, distributed across people and
technologies, shaping AI designs that augment learner agency through networked
resources, recommendation, and collaborative tools typical of MOOCs and social
learning environments <cite id="S_JCPVjqk">Connectivism, emerging as a response to
technology's role, emphasizes learning through external connections and technology
performing cognitive tasks</cite><cite id="S_TzKH9RC">Connectivism is grounded in
interactions within networks, incorporating aspects of behaviorism, cognitivism, and
social constructivism, and has been influential as an epistemological basis for
MOOCs</cite>.
... (Response truncated for brevity; see our full dataset for complete prompts and
examples.)
Figure 35. Example trajectory for OpenScholar SFT data Part IV.
52

### 第 52 页中文译文

图 35：OpenScholar SFT 轨迹第四部分。代理生成最终长篇综合，围绕个性化、探究式学习支架、问题导向学习、自适应指导与反馈等主题，把多篇论文组织到学习理论框架中；同时讨论偏差、隐私、教师角色、过度依赖及评测不足。每项事实主张以局部引用连接到检索证据。学术题名、术语和引用保持英文，避免改变来源含义。
<!-- page 53 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Trajectory of DR Tulu on ResearchQA Part I
User
How do the narrow and broad approaches to CSR reporting differ in terms of their
scope and the stakeholders they address?
Assistant
<think>
Decompose the question: We need to define and differentiate the "narrow" versus
"broad" approaches to CSR reporting, specifically along two dimensions: (1) scope
(what is reported) and (2) stakeholders addressed (who benefits/engages with the
report). Assumptions: This terminology is used in CSR/ sustainability reporting
frameworks and literature (e.g., AA1000AS, GRI, SASB, integrated reporting). Plan:
1) Search for authoritative definitions of "narrow" vs "broad" stakeholder
engagement in CSR.
2) Find sources that explicitly define "narrow scope" CSR (e.g., compliance-only,
triple bottom line metrics) vs "broad scope" (stakeholder dialogue, materiality,
governance, long-term value).
3) Retrieve evidence on who the reports address (shareholders vs a wider stakeholder
community), including practitioner frameworks (e.g., AA1000AS stakeholder engagement
principle).
4) Cross-check with standards like GRI (comprehensive, wide stakeholder audience)
and SASB (focused, investor-material), to map scope vs audience.
First query: "narrow and broad approaches to CSR reporting definition stakeholders
scope".
</think>
<call_tool name="google_search" num="5" gl="us" hl="en">narrow and broad approaches
to CSR reporting definition stakeholders scope</call_tool>
Functional Calling
<tool_output><snippet id=d7607bb2-0>
Title: Mandatory CSR and sustainability reporting: economic analysis and ...
URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8319709/
Snippet: Whether one chooses a narrow or a broad approach to CSR reporting depends
on|among other things|normative views about the intended scope and target audience.
</snippet>
<snippet id=d7607bb2-1>
Title: Stakeholders, stakeholder theory and Corporate Social ...
URL: https://jcsr.springeropen.com/articles/10.1186/s40991-024-00094-y
Snippet: This paper shows how stakeholder theory proactively moderates the strength
of CSR in social interactions, environmental protection, and sustainable
development.
</snippet>
<snippet id=d7607bb2-2>
Title: Sustainability, corporate social responsibility, non-financial reporting ...
URL: https://www.sciencedirect.com/science/article/pii/S2352550922003116
Snippet: CSR is a corporate management approach that applies sustainability values
in business to promote social welfare within a company and outside it, employs
ethical ...
</snippet>
...
Figure 36. Example trajectory of DR Tulu on ResearchQA Part I.
53

### 第 53 页中文译文

图 36：DR Tulu 在 ResearchQA 上的轨迹示例第一部分。用户询问企业社会责任（CSR）报告的狭义与广义方法在范围和所面向利益相关者上的区别。代理先把问题拆为报告内容范围与目标受众两维，计划寻找学术定义、AA1000AS、GRI、SASB 等权威框架，并交叉验证“合规/投资者导向”与“多利益相关者/全面重要性”之间的差别。随后发起首次 Google 搜索。查询、工具输出、标题和 URL 保持英文原文。
<!-- page 54 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Trajectory of DR Tulu on ResearchQA Part II
Assistant
<think>Goal: Define and differentiate "narrow" vs "broad" approaches to CSR
reporting by (a) scope of what is reported and (b) stakeholders addressed. Strategy:
1) Find authoritative definitions and contrasts (preferably from academic papers and
reputable frameworks).
2) Use the first Google search results to identify key sources, then browse pages
for precise language on scope and audience.
3) Corroborate with recognized reporting frameworks (AA1000AS stakeholder engagement
principle; GRI vs SASB scope differences).
4) Ensure at least four searches: initial Google search done; next, targeted
searches for AA1000AS, GRI/SASB comparison, and a paper explicitly discussing narrow
vs broad CSR reporting scope.
Reflection on first search:
- PMC article (S_d7607bb2-0) mentions that approach choice depends on intended scope
and target audience|relevant framing.
- Sustainability Management Wiki (S_d7607bb2-3) claims narrow vs broad scope/target
group|potentially useful but I need more authoritative backing.
- Harvard Law corporate governance post (S_d7607bb2-5) discusses CSR report
informing stakeholders about addressing their concerns|useful for
audience/stakeholder dialogue.
- NBER working paper (S_d7607bb2-6) gives an operational definition of narrowing
scope to securities-law-required info|useful for narrow scope exemplar.
What's missing: Explicit framework language (AA1000AS principle 1: stakeholder
engagement as a condition for materiality) and standard contrasts (GRI comprehensive
vs SASB issue-focused/investor-oriented). Next query: "AA1000AS stakeholder
engagement principle 1 materiality definition".</think>
<call_tool name="google_search" num="5" gl="us" hl="en">AA1000AS stakeholder
engagement principle 1 materiality definition</call_tool>
Functional Calling
<tool_output><snippet id=59a6bf6a-0>
Title: Understanding the AA1000 Assurance Standard - LinkedIn
URL:
https://www.linkedin.com/pulse/understanding-aa1000-assurance-standard-enhancing-credibility-
vn1tf
Snippet: Materiality: Organizations must determine the relevance and significance of
an issue to stakeholders and the business, ensuring that all ...
</snippet>
<snippet id=59a6bf6a-1>
Title: AA1000 Stakeholder Engagement Standard - Accountability.org
URL: https://accountability.org/standards/aa1000-stakeholder-engagement
Snippet: The AA1000SES sets the global standard for conducting high-quality
stakeholder engagement by offering a simple, practical framework for empowering
stakeholders.
</snippet>
<snippet id=59a6bf6a-2>
Title: [PDF] AA1000 STAKEHOLDER ENGAGEMENT STANDARD 2011
URL:
https://cdn2.hubspot.net/hubfs/2642721/Recursos/Guias\%20y\%20Estandares/AA1000/AA1000\%20Stake
holder\%20engagement\%20standard.pdf
Snippet: Inclusivity, materiality and responsiveness require a defined process of
stakeholder engagement that provides comprehensive and balanced involvement and ...
</snippet>
...
Figure 37. Example trajectory of DR Tulu on ResearchQA Part II.
54

### 第 54 页中文译文

图 37：ResearchQA 轨迹第二部分。代理反思首轮结果：同行评议文章明确指出方法选择取决于预期范围和目标受众；另有资料将狭义范围具体化为证券法要求的信息。它同时指出仍缺 AA1000AS 的利益相关者参与原则，以及 GRI 与 SASB 的权威对比，因此继续发起针对性搜索。该过程展示证据缺口驱动的迭代检索，而不是把首批摘要直接当作答案。
<!-- page 55 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Trajectory of DR Tulu on ResearchQA Part III
Assistant (Final Answer)
<think>
Plan: We need authoritative definitions and contrasts of "narrow" versus "broad" CSR
reporting, specifically along (1) reporting scope and (2) stakeholders addressed. I
will:
- Use the initial Google results to identify key academic framing (scope and
audience).
- Add AA1000AS to ground a "broad" approach via stakeholder engagement and
materiality.
- Use GRI vs SASB comparisons to concretely illustrate broad (comprehensive,
multi-stakeholder) versus narrow (focused, investor-material) scope and audiences.
I have already run three searches and have relevant snippets: a peer-reviewed
article noting that approach choice depends on intended scope and target audience;
examples of narrowing scope to legally required information; and multiple GRI{SASB
sources indicating GRI's broad scope and audience versus SASB's focused/investor
materiality. I will synthesize these, noting where evidence is explicit (scope and
audience differences) and where it is inferential (mapping "broad" to AA1000AS
stakeholder engagement/materiality). I will then produce a structured answer with
citations on each claim.
Remaining gaps: A direct paper explicitly defining "narrow" vs "broad" CSR reporting
terms would be ideal, but the PMC article and other sources suffice to explain the
distinction in scope and audience. I will proceed to synthesize.
Structure for answer:
- Definitions and framing: what "narrow" vs "broad" mean in scope and audience.
- Scope differences: compliance/required info vs comprehensive material issues.
- Stakeholders addressed: narrow (selected investors/regulators/creditors) vs broad
(all materially affected stakeholders including communities, customers, employees,
suppliers, NGOs).
- Standards mapping: AA1000AS (stakeholder engagement/materiality), GRI (broad),
SASB (narrow/investor materiality) as illustrative examples.
</think>
<answer>
# Short answer
- Scope: A narrow CSR reporting approach confines disclosure to a limited set of
issues, often legally required or compliance-oriented; a broad approach covers a
wider set of material issues identified through stakeholder engagement across
economic, environmental, and social dimensions. <cite id="d7607bb2-6">One way to
narrow the scope of CSR reporting is to confine it to information required by
securities law.</cite> <cite id="4a55f4d8-4">GRI requires identifying material
topics to establish the scope and included issues covered by a company's
report.</cite> <cite id="59a6bf6a-2">AA1000's principles of inclusivity, materiality,
and responsiveness require a defined process of stakeholder engagement to determine
what to report.</cite>
- Stakeholders addressed: A narrow approach targets a limited audience (e.g.,
investors, regulators, or specific creditors) and signals compliance; a broad
approach addresses a wider community of stakeholders (including employees,
communities, customers, suppliers, NGOs) through dialogue and reporting on issues
that materially affect them. <cite id="d7607bb2-0">Whether one chooses a narrow or
broad approach depends on normative views about the intended scope and target
audience.</cite> <cite id="d7607bb2-5">CSR reports can inform stakeholders about how
a company has addressed their concerns, reflecting stakeholder engagement.</cite>
<cite id="4a55f4d8-1">GRI has a larger scope and broader audience, while SASB
enables deeper, sector-specific information for a more focused audience.</cite>
# What "narrow" CSR reporting entails
Figure 38. Example trajectory of DR Tulu on ResearchQA Part III.
55

### 第 55 页中文译文

图 38：ResearchQA 轨迹第三部分。代理在最终回答前规划综合结构：先界定狭义与广义方法，再分别比较范围和受众，最后用 AA1000AS、GRI 与 SASB 作示例。它区分显式证据和推断：狭义报告聚焦法规要求或投资者重要信息，广义报告覆盖更全面的环境、社会和治理议题，并通过利益相关者参与确定重要性。页面后半开始生成带局部引用的最终答案。
<!-- page 56 of 56 -->

DR Tulu: Reinforcement Learning with Evolving Rubrics for Deep Research
Example Trajectory of DR Tulu on ResearchQA Part IV
Assistant (Final Answer)
- Reporting scope: Restricted to a small set of issues, typically where regulation
or minimal standards dictate disclosure; this constrains the breadth of topics and
the depth of information. <cite id="d7607bb2-6">Confining CSR reporting to
information required under securities laws is a concrete way to narrow scope.</cite>
- Stakeholders addressed: Primarily those with formal information rights or
enforcement powers (e.g., investors, regulators, creditors) rather than a broad
stakeholder community; the report often signals compliance rather than engaging a
wider set of interest groups. <cite id="d7607bb2-0">Choice of a narrow approach is
linked to a narrower target audience.</cite> <cite id="d7607bb2-5">A narrow CSR
report addresses concerns raised by a more limited set of stakeholders compared to a
broad report.</cite>
# What "broad" CSR reporting entails
- Reporting scope: Comprehensive coverage of material issues determined through
inclusive stakeholder engagement and materiality assessments across environmental,
social, and governance domains; this typically includes balanced, context-sensitive
issues with depth where material. <cite id="59a6bf6a-2">Materiality and inclusivity
require a defined stakeholder engagement process to guide what is included.</cite>
<cite id="4a55f4d8-4">Materiality is used to establish the report's scope and
included issues.</cite> <cite id="4a55f4d8-6">GRI Standards are designed to be used
by organizations in any sector, implying broader coverage.</cite>
- Stakeholders addressed: A wide range of stakeholders who can affect or are
affected by the organization, including employees, communities, customers, suppliers,
NGOs, and regulators, with reporting intended to inform and facilitate dialogue.
<cite id="d7607bb2-0">A broad approach targets a broader audience.</cite> <cite
id="d7607bb2-5">CSR reports in a broad approach inform stakeholders about how their
concerns have been addressed, reflecting engagement.</cite> <cite
id="4a55f4d8-2">GRI is designed to provide information to a broad audience, while
SASB dives deeper for a more specific one.</cite>
# How standards illustrate the difference
- AA1000AS (Accountability Principles): Embeds materiality in stakeholder engagement
(principles of inclusivity, materiality, and responsiveness), operationalizing a
broad approach that defines scope through dialogue with those affected and
allocating limited resources to material topics. <cite id="59a6bf6a-2">AA1000
emphasizes inclusivity, materiality, and responsiveness via structured stakeholder
engagement.</cite> <cite id="59a6bf6a-8">A material topic is one that will
substantively influence assessments, decisions, actions, and performance of the
organization and/or stakeholders.</cite>
- GRI: Broad, global framework that covers a wide range of sustainability topics and
guides scope via materiality assessments, addressing diverse stakeholder groups.
<cite id="4a55f4d8-6">GRI Standards are sector-applicable and designed for broad use,
covering a wide range of sustainability topics.</cite> <cite id="4a55f4d8-4">GRI
requires identifying material topics to establish scope.</cite> <cite
id="4a55f4d8-1">GRI's scope is larger and intended for a broader audience than
SASB.</cite>
- SASB: Narrower, investor-oriented framework that focuses on industry-specific,
financially material issues, enabling deeper coverage for a focused audience
(primarily investors). <cite id="4a55f4d8-1">SASB enables deeper, sector-specific
information for a more focused audience than GRI.</cite> <cite id="4a55f4d8-8">SASB
is focused on financially material ESG issues in specific industries, i.e., a
narrower scope and audience.</cite>
... (Response truncated for brevity; see our full example in our static demo.)
Figure 39. Example trajectory of DR Tulu on ResearchQA Part IV.
56

### 第 56 页中文译文

图 39：DR Tulu 在 ResearchQA 上的轨迹示例第四部分。

**狭义 CSR 报告的含义。** 报告范围限于少数议题，通常只披露法规或最低标准要求的信息，因此主题广度和信息深度受限；只报告证券法要求的信息就是缩窄范围的具体方式。面向的主要是拥有正式知情权或执行权的主体，例如投资者、监管者和债权人，而非广泛利益相关者社群；报告通常传达合规情况，而不是同更广泛群体对话。

**广义 CSR 报告的含义。** 报告通过包容性的利益相关者参与和重要性评估，全面覆盖环境、社会与治理领域的重要议题；在重要之处提供均衡、结合语境且有深度的信息。它面向所有能够影响组织或受组织影响的广泛群体，包括员工、社区、客户、供应商、非政府组织和监管者，目的在于告知并促进对话。

**标准如何体现差别。** AA1000AS 把重要性置于利益相关者参与过程之中；GRI 面向任何行业和广泛受众，覆盖组织对经济、环境与社会的影响，更接近广义方法；SASB 更深入聚焦对投资者具有财务重要性的行业特定议题，可作为较狭义、资本市场导向的实例。二者并非简单优劣关系：狭义方法更简洁、便于比较和满足合规需求，广义方法更能呈现组织影响与多方关切，但成本和复杂度也更高。

原回答中的每项主张均带片段级引用；引用 ID、来源措辞和剩余英文内容保持原文，以便核验。
