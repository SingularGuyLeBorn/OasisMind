---
title: "01 · OLMES 对照译稿"
category: "数据与评测"
tags: ["OLMES", "语言模型评测", "可复现性", "多项选择"]
published: true
excerpt: "OLMES 为基础语言模型的多项选择评测规定可复现标准, 统一提示格式、few-shot 示例、概率归一化、任务形式与实现细节。"
---

# OLMES: A Standard for Language Model Evaluations · 语言模型评测标准
<!-- arXiv 2406.08446; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/olmes/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 29 -->

# OLMES: A Standard for Language Model Evaluations

# OLMES：语言模型评测标准

Yuling Gu, Oyvind Tafjord, Bailey Kuehl, Dany Haddad, Jesse Dodge, Hannaneh Hajishirzi

Allen Institute for Artificial Intelligence；University of Washington

## Abstract

Progress in AI is often demonstrated by new models claiming improved performance on tasks measuring model capabilities. Evaluating language models can be particularly challenging, as choices of how a model is evaluated on a task can lead to large changes in measured performance.

人工智能的进展通常通过新模型在能力测量任务上宣称更高性能来体现。然而，语言模型评测尤其困难，因为同一任务采用不同评测方式，测得性能可能发生巨大变化。

There is no common standard setup, so different models are evaluated on the same tasks in different ways, leading to claims about which models perform best not being reproducible. We propose OLMES, a completely documented, practical, open standard for reproducible LLM evaluations.

目前没有通用的标准设置，不同模型即便面对同一任务也常以不同方式评测，因而“哪个模型最好”的主张无法复现。我们提出 OLMES：一个记录完整、切实可行、开放的可复现大语言模型评测标准。

In developing this standard, we identify and review varying factors in community evaluation practices, such as prompt formatting, in-context examples, probability normalizations, and task formulation. OLMES supports meaningful comparisons between smaller base models that require the unnatural “cloze” formulation of multiple-choice questions and larger models that can use the original formulation.

在制定该标准时，我们识别并审查社区评测实践中的变化因素，包括提示格式、上下文示例、概率归一化和任务表述。较小基础模型往往需要把多选题改写为不自然的“完形填空”形式，而较大模型能够直接使用原始形式；OLMES 使两者之间可以做有意义比较。

OLMES provides carefully considered and documented recommendations, guided by existing literature and new experiments resolving open questions. All prompts, examples and code are available at `https://github.com/allenai/olmes`.

OLMES 给出经过审慎考虑、记录完整的建议，依据既有文献和解决开放问题的新实验形成。全部提示、示例和代码均发布于 `https://github.com/allenai/olmes`。

**Table 1: Scores reported in different references for ARC-CHALLENGE.** Scores marked † use multiple-choice formulation (MCF), not cloze formulation (CF). “?” means undocumented or mixed approaches. References use different, sometimes incompletely specified setups, so performance and relative-strength conclusions are not reproducible.

**表 1：不同资料报告的 ARC-CHALLENGE 分数。** † 表示使用多选表述（MCF）而非完形表述（CF）。“?” 表示方法未记录，或不同模型混用了不同方法。各资料采用不同且有时未完整说明的评测设置，因此关于性能和模型相对强弱的结论无法复现。

The table compares MPT-7B, RPJ-Incite-7B, Falcon-7B, Mistral-7B, Llama2-7B/13B and Llama3-8B across six references and OLMES. Setups vary in shot count (0, 5 or 25), curated shots, CF/MCF, and character/PMI/no normalization. References are the HF Open LLM Leaderboard, Llama 2 paper, Mistral 7B paper, Falcon paper, OLMo paper and Llama 3 model card.

该表比较 MPT-7B、RPJ-Incite-7B、Falcon-7B、Mistral-7B、Llama2-7B/13B 和 Llama3-8B 在六项资料及 OLMES 中的结果。设置在 shot 数（0、5 或 25）、是否人工整理示例、CF/MCF 形式及字符/PMI/无归一化等方面不同。六项资料分别为 HF Open LLM Leaderboard、Llama 2 论文、Mistral 7B 论文、Falcon 论文、OLMo 论文和 Llama 3 模型卡。

## 1 Introduction

Scientific credibility in AI rests on reproducible, well-considered model comparisons. Pretrained LLMs are generalist models capable of downstream tasks they were not specifically trained for. Evaluating them requires choices about task presentation and interpretation of outputs before scoring.

人工智能的科学可信度依赖可复现且经过审慎设计的模型比较。预训练大语言模型是通用模型，能够执行未被专门训练过的下游任务；评测时必须决定如何呈现任务，以及评分前如何解释模型输出。

There is no standard way to make these choices, although they significantly affect performance; recent work reports accuracy differences as large as 80% on one task from formatting and in-context examples alone.

目前没有决定这些选择的标准方法，尽管它们显著影响性能；近期研究报告，仅改变格式和上下文示例，同一任务的准确率差异就可高达 80%。

Evaluation setup choices are often not reported in enough detail to reproduce. When practitioners release a model, they often cannot directly compare with others' previously reported results. HELM and the HF Open LLM Leaderboard seek standardization, but rationales for formatting, examples, normalization and formulation are not always clearly documented or followed consistently in later work.

评测设置往往没有报告足够细节供人复现。模型发布时，实践者常无法与他人先前报告的结果直接比较。HELM 和 HF Open LLM Leaderboard 试图推动标准化，但对格式、示例、归一化和任务表述选择的理由并不总有清楚记录，后续工作也未一致遵循。
<!-- page 2 of 29 -->

The paper highlights two problems. First, comparing a new model with prior numbers is flawed unless the prior work fully describes its setup and the new work follows it. Different papers and leaderboards use different, sometimes underspecified setups and therefore tell different stories for the same model and dataset.

论文强调两个问题。第一，除非先前工作完整描述评测设置，且新工作严格遵循，否则用新模型与旧数字比较存在根本缺陷。不同论文和排行榜采用不同、甚至说明不足的设置，因此同一模型、同一数据集也会讲出不同故事。

For ARC-CHALLENGE, one reference suggests Llama2-13B and Llama3-8B are similar, while another reveals a likely gap over ten points. Second, existing standards make choices without sufficient justification and many model creators do not adopt them. Table 1 shows variation in shots, example sources, formulation and probability normalization. No documented standard has established which choice is preferable.

以 ARC-CHALLENGE 为例，一项资料让人以为 Llama2-13B 与 Llama3-8B 接近，另一项则显示二者可能相差超过 10 个百分点。第二，现有标准所做选择缺乏充分理由，许多模型开发者也不采用。表 1 展示 shot 数、示例来源、任务表述和概率归一化的变化；此前没有成文标准系统研究哪个选择更好。

OLMES addresses this from a practical perspective by removing ambiguity in how a final metric is obtained. It applies during model development and in leaderboards or papers, and gives justified recommendations for sampling, instance formatting, in-context examples, probability normalization and task formulation.

OLMES 从实践角度消除最终指标如何获得的歧义。它既适用于模型开发过程，也适用于排行榜和论文，并对采样、实例格式、上下文示例、概率归一化和任务表述给出有依据的建议。

OLMES is **reproducible**: it specifies all details from dataset processing through task presentation to output processing. It is **practical**: computation choices make community adoption easy. It is **documented**: every standard decision has a justification from prior principles or new experiments. It is **open**: all prompts, code and rationales are released for extension to new tasks and models.

OLMES 具有四项特征。**可复现**：从数据处理、任务呈现到模型输出处理，全部细节均被规定。**实用**：计算资源选择便于社区采用。**有记录**：每项决定都有既有研究原则或新实验作为理由。**开放**：提示、代码和理由均公开，可扩展到新任务与模型。

Because it is documented, practical and open, OLMES can be adopted in maintained evaluation code such as Eleuther LM Evaluation Harness and HELM. The authors argue it is the first effort to unify base-model evaluation throughout development, from small to large models and early to late training.

由于记录完整、实用且开放，OLMES 可直接纳入 Eleuther LM Evaluation Harness、HELM 等持续维护的评测代码。论文认为，这是首次统一基础模型全开发周期评测实践的工作，覆盖小到大模型以及训练早期到晚期。

## 2 Experimental Setup

### 2.1 Multiple-choice QA and LLM evaluation

MCQA tasks are attractive for both models and humans because scoring is easy—whether the correct option was selected—and domains and question complexity are flexible. Early in training and for small base models before instruction tuning, generative, mathematical and coding tasks often provide weaker signals. Consequently MCQA is the most common base-model benchmark.

多项选择问答（MCQA）适合评测模型和人类：评分只需判断是否选择正确选项，同时题目领域和复杂度很灵活。在训练早期以及指令微调前的小型基础模型上，生成、数学和代码任务往往提供较弱信号。因此 MCQA 是最常见的基础模型基准。

Yet “model X scores Y on ARC-CHALLENGE” is generally uninterpretable without details and cannot be meaningfully compared across references. OLMES focuses on MCQA to guide base-model training and assess potential before further tuning. Two formulations are common.

然而，如果缺少细节，“模型 X 在 ARC-CHALLENGE 得 Y 分”通常无法解释，也不能跨资料做有意义比较。OLMES 聚焦 MCQA，用于指导基础模型训练，并在进一步微调前评估潜力。常见表述有两种。

**MCF (multiple-choice formulation):** show answer choices with labels and score prediction of the answer label, matching how humans see MCQA.

**MCF（多选表述）：**展示带标签的选项，并对答案标签的预测评分，与人类作答形式一致。

Example from ARC-EASY:

```text
Question: Earth's core is primarily composed of which material?
A. basalt
B. iron
C. magma
D. quartz
Answer: B
```

**CF (cloze formulation):** append an answer slot to the question and substitute each choice separately. Rank choices by the model probability of their tokens. This raises probability-normalization ambiguity and cannot properly handle “none of the above”.

**CF（完形表述）：**在问题后添加答案空位，把每个选项分别代入，再按模型赋予其 token 的概率排序。它存在概率归一化歧义，也无法正确处理“以上皆非”等选项。
<!-- page 3 of 29 -->

### 2.2 Targeted tasks

OLMES selects ten popular MCQA benchmarks used in the HF leaderboard, Llama papers, HELM and OLMo evaluations. They cover science, several kinds of commonsense and factual knowledge across a range of difficulty; MMLU alone contains 57 subjects.

OLMES 选择十项常见 MCQA 基准，它们见于 HF 排行榜、Llama 论文、HELM 和 OLMo 评测。题目覆盖科学、多种常识和事实知识，难度多样；仅 MMLU 就含 57 个学科。

### 2.3 Selection of models

The standard is developed with 15 diverse, open pretrained base models, not instruction-tuned, ranging from 1B to 70B: Pythia-1B/6.7B, OLMo-1B/7B/7B-0424, TinyLlama-1.1B, StableLM2-1.6B, RPJ-INCITE-7B, MPT-7B, Falcon-7B, Llama2-7B/13B, Mistral-7B-v0.1, Llama3-8B and Llama3-70B.

标准基于 15 个多样、开放的预训练基础模型制定，不含指令微调模型，规模从 1B 到 70B：Pythia-1B/6.7B、OLMo-1B/7B/7B-0424、TinyLlama-1.1B、StableLM2-1.6B、RPJ-INCITE-7B、MPT-7B、Falcon-7B、Llama2-7B/13B、Mistral-7B-v0.1、Llama3-8B 与 Llama3-70B。
<!-- page 4 of 29 -->

**Table 2: OLMES task details.**

| Task | Split | choices | instances | CF normalization |
|---|---|---:|---:|---|
| ARC-CHALLENGE | test | 4† | 1172 | PMI |
| ARC-EASY | test | 4† | 1000 of 2376 | character |
| BOOLQ | validation | 2 | 1000 of 3270 | none |
| COMMONSENSEQA | validation | 5 | 1221 | PMI |
| HELLASWAG | validation | 4 | 1000 of 10042 | character |
| MMLU | test | 4 | 14042 | character |
| OPENBOOKQA | test | 4 | 500 | PMI |
| PIQA | validation | 2 | 1000 of 1838 | character |
| SOCIAL IQA | validation | 3 | 1000 of 1954 | character |
| WINOGRANDE | validation | 2 | 1267 | none |

**表 2：OLMES 任务细节。** 表中固定数据 split、实例数及 CF 归一化。† ARC 两项中少数实例有 3 或 5 个选项。

Different researchers use different setups for base models, producing different results and conclusions. OLMES seeks a unified foundation for careful benchmarking.

研究者对基础模型采用不同设置，导致不同结果与结论。OLMES 希望以审慎评测为基础，推动统一的基准实践。

## 3 Standardizing Variations in Evaluation

Obtaining a final score requires deciding: instance formatting; few-shot examples; CF probability normalization; MCF versus CF; and other implementation details. OLMES standardizes and justifies each.

获得最终分数必须决定：实例格式、few-shot 示例、CF 概率归一化、MCF 或 CF 表述，以及其他实现细节。OLMES 对每项进行标准化并说明理由。

### 3.1 How to format dataset instances?

Datasets provide question, choices and sometimes context. Literature varies from `Question:` to `Q:`, from `A.` to `(A)` or XML-like labels, and in whether instructions are added. OLMES consistently uses `Question: <question>` and `Answer:` without verbose instructions.

数据集包含问题、选项，有时还有上下文。文献使用 `Question:` 或 `Q:`，答案标签可能是 `A.`、`(A)` 或类 XML 形式，也可能增加指令。OLMES 统一用 `Question: <question>` 和 `Answer:`，避免依赖冗长指令理解。

Exceptions preserve task semantics: PIQA uses `Goal:`; HELLASWAG MCF adds `Choose the best continuation:`; WINOGRANDE uses `Fill in the blank:`. Their CF versions remove prefixes/suffixes to remain pure language continuation.

例外用于保持任务语义：PIQA 用 `Goal:`；HELLASWAG 的 MCF 加 `Choose the best continuation:`；WINOGRANDE 用 `Fill in the blank:`。二者的 CF 版本删除这些前后缀，以接近纯语言续写。

MCF uses canonical A/B/C labels in `\n A. <choice>` form. The leading space ensures tokenizers represent the final answer label identically to the option label.

MCF 采用规范 A/B/C 标签，格式为 `\n A. <choice>`。前导空格使 tokenizer 对最终答案标签和选项标签采用相同 token 表示。

Use public test labels when available, otherwise validation. If a dataset exceeds 1500 instances, sample 1000 using `Random(1234).sample`. More instances add less useful signal than formatting variation and cost extra computation.

标签公开时用 test split，否则用 validation。数据超过 1500 个实例时，以 `Random(1234).sample` 抽取 1000 个。相较格式变化，更多实例增加的统计信号有限，却增加计算成本。
<!-- page 5 of 29 -->

### 3.2 Which few-shot examples?

Few-shot examples universally communicate a task. MMLU's fixed five-shot prompt yields more reproducible results; other tasks vary widely in shot count and sampling. OLMES manually curates five training examples per task, balancing labels—for example avoiding four A answers and one B. Five shots limit overhead, and evidence suggests more than five generally changes scores little. Curated shots are released in the repository.

few-shot 示例能通用地传达任务。MMLU 固定的 5-shot 提示使结果更可复现；其他任务的 shot 数和采样差异很大。OLMES 为每项任务人工整理五个训练示例并平衡标签，例如避免五题中四个答案都是 A、一个是 B。五个示例限制开销，既有证据也表明超过五个通常不会显著改变分数。示例已在仓库发布。

### 3.3 How to normalize CF probabilities?

CF ranks `P(a_i|q)`, but raw probability favors shorter answers. Four methods are considered:

CF 按 `P(a_i|q)` 排序，但原始概率偏爱较短答案。论文比较四种方法：

- none: `ln P(a_i|q)`；
- token: divide log probability by answer token count；
- character: divide by character count；
- PMI: `ln(P(a_i|q)/P(a_i|u))`, where unconditional prompt `u` is `Answer:`.

PMI 用无问题条件下同一答案的概率校正其先验常见程度，但需要额外计算。OLMES 在 15 个模型上比较四种方法，并为每个任务选择有经验或理论依据的方案。
<!-- page 6 of 29 -->

**Table 3: CF normalization comparison.** Win percentage counts how often each method is best over 15 models. “diff oracle” measures the gap between OLMES's fixed recommendation and the empirically best method for each model/task; gaps are generally minimal.

**表 3：CF 归一化比较。** 胜率表示某方法在 15 个模型中成为最佳的频率；“diff oracle”衡量 OLMES 固定建议与每个模型/任务经验最优方法的差距，整体很小。

OLMES uses **none** for BOOLQ and WINOGRANDE. BOOLQ answers yes/no are each one token, so length normalization is unnecessary; character normalization sometimes benefits accidentally because “yes” has one more character. WINOGRANDE has identical continuations with varying prompts, so normalization choice does not matter.

OLMES 对 BOOLQ 与 WINOGRANDE 使用 **none**。BOOLQ 的 yes/no 都是单 token，无需长度归一化；字符归一化偶尔更好只是因为 “yes” 多一个字符。WINOGRANDE 的续写相同而提示不同，因此归一化选择无影响。

It uses **PMI** for ARC-CHALLENGE, COMMONSENSEQA and OPENBOOKQA because choices can contain unexpected, a priori unlikely phrases; PMI corrects this. The extra unconditional likelihood is avoided where no strong reason exists.

ARC-CHALLENGE、COMMONSENSEQA 和 OPENBOOKQA 使用 **PMI**，因为选项可能包含先验概率很低的意外短语；PMI 能做校正。其他任务没有充分理由时，避免额外无条件概率的计算开销。

It uses **character** normalization for ARC-EASY, HELLASWAG, PIQA, SOCIAL IQA and MMLU. Experiments generally favor it, it is cheaper than PMI, and Eleuther Harness already implements it as `acc_norm`.

ARC-EASY、HELLASWAG、PIQA、SOCIAL IQA 与 MMLU 使用**字符**归一化。实验总体支持该方法，它比 PMI 便宜，而且 Eleuther Harness 已以 `acc_norm` 实现。

### 3.4 MCF or CF?

As models strengthen, MCQA evaluation shifts from CF to MCF. Llama3-8B scores 78.6% with 25-shot MCF ARC-CHALLENGE versus 60.2% with 25-shot CF. Near 100% performance, CF's inherent limitations hide real capability; conversely, weak models can remain near random on MCF.

随着模型增强，MCQA 评测逐渐从 CF 转向 MCF。Llama3-8B 在 25-shot MCF ARC-CHALLENGE 得 78.6%，而 25-shot CF 仅 60.2%。当性能接近 100% 时，CF 的固有限制会遮蔽真实能力；反之，弱模型在 MCF 上可能仍接近随机。
<!-- page 7 of 29 -->

**Figure 1: MMLU performance during OLMo-7B-0424 training.** Early in training CF provides useful signal while MCF is random. Around 400B training tokens, the model gains the MCF skill and MCF becomes stronger than CF.

**图 1：OLMo-7B-0424 训练期间的 MMLU 表现。** 训练早期，CF 能提供有效信号，而 MCF 接近随机；约 400B 训练 token 后，模型获得 MCF 能力，MCF 的信号开始强于 CF。

CF usefully evaluates task knowledge in models that have not learned to answer MCF. For models that understand MCF, however, MCF is more realistic and produces higher, more representative scores. Figure 1 explicitly shows this transition: CF is better early, while late in training CF plateaus and MCF is markedly better.

对尚未学会以 MCF 作答的模型，CF 能有效评估任务知识；但对理解 MCF 的模型，MCF 更符合真实任务，分数也更高、更具代表性。图 1 明确展示这种转变：早期 CF 更好，后期 CF 趋于平台，而 MCF 显著更强。

Across 15 models, the weakest eight are near random on ARC-CHALLENGE MCF but above random with CF. Stronger models clearly score higher with MCF. Llama3-70B obtains 93.7% MCF (6.3% error) versus 69.0% CF (31% error), nearly five times the error rate.

在 15 个模型中，最弱的八个在 ARC-CHALLENGE MCF 上接近随机，但 CF 能超过随机；强模型则明显在 MCF 上更高。Llama3-70B 的 MCF 为 93.7%（错误率 6.3%），CF 仅 69.0%（错误率 31%），错误率相差近五倍。

Other tasks show the same pattern: for strong models MCF exceeds CF on ARC-EASY, OPENBOOKQA, MMLU, SOCIAL IQA, COMMONSENSEQA and PIQA, and catches up on HELLASWAG, WINOGRANDE and BOOLQ. OLMES therefore evaluates every model using both MCF and CF and reports the better result, enabling comparison from weak base models to strong ones.

其他任务呈现同一模式：对强模型，MCF 在 ARC-EASY、OPENBOOKQA、MMLU、SOCIAL IQA、COMMONSENSEQA、PIQA 上超过 CF，并在 HELLASWAG、WINOGRANDE、BOOLQ 上追平。OLMES 因此对每个模型同时运行 MCF 与 CF，报告较优结果，使弱基础模型到强模型都能比较。

### 3.5 Other implementation details

- MMLU uses macro average over 57 tasks, not micro average over 14,042 instances, better representing field diversity.
- Add the proper `<bos>` token when a model requires it.
- Character normalization includes the leading space in answer length.
- Inputs including completions are capped at 2048 tokens for cross-model consistency.
- Use default model precision; avoid options such as `load_in_8bit` unless results are identical.
- Separate in-context examples with two newlines.
- Except MMLU's original instruction line, add no extra instructions, reducing prompt variation.

- MMLU 对 57 个任务做宏平均，而非对 14,042 个实例做微平均，以更好体现领域多样性。
- 模型需要时加入正确的 `<bos>` token。
- 字符归一化计算答案长度时包含前导空格。
- 输入连同补全统一限制为 2048 token。
- 使用模型默认精度；除非结果完全一致，否则不使用 `load_in_8bit` 等选项。
- 上下文示例之间以两个换行分隔。
- 除 MMLU 原始指令行外不增加额外指令，以减少提示变化来源。
<!-- page 8 of 29 -->

**Figure 2: MCF versus CF across ten tasks.** The 15 models are ordered by overall performance. CF is generally needed to elicit non-random signal from weaker models; stronger models exploit MCF for more accurate assessment.

**图 2：十项任务中的 MCF 与 CF。** 15 个模型按总体性能排序。弱模型通常需要 CF 才能产生非随机信号；强模型则能利用 MCF 获得更准确评估。

Computational details such as batch size and GPU type/state can alter floating-point operations, flipping answer choices when confidence is extremely close. Treating sufficiently close choices as ties might address this, but is left for future work. The Apache-2.0 reference implementation is at `https://github.com/allenai/olmes`.

batch size、GPU 类型和状态等计算细节会影响浮点运算；当选项置信度非常接近时，预测可能翻转。可把足够接近的选项视为平局，但论文留待未来研究。Apache-2.0 参考实现在 `https://github.com/allenai/olmes`。

## 4 OLMES: Summary and Results

OLMES specifies: use test split when labels are available, otherwise validation; sample 1000 if there are more than 1500 instances; use exact prescribed prompt formats; use fixed curated five-shot examples; use prescribed CF normalization; evaluate both MCF and CF and take the better result; and follow all other Section 3.5 details.

OLMES 规定：标签可得时使用 test，否则使用 validation；实例超过 1500 时抽取 1000；使用精确规定的提示格式；使用固定人工整理的 5-shot；按规定做 CF 归一化；同时评测 MCF 和 CF 并取较优结果；遵循第 3.5 节全部其他细节。

Table 4 reports fully reproducible OLMES scores for 15 models; Table 13 in Appendix D extends this to 40 models.

表 4 报告 15 个模型完全可复现的 OLMES 分数；附录 D 的表 13 扩展到 40 个模型。

## 5 Related Work

Model releases use popular benchmarks to measure progress and guide community understanding of strong-model construction. Yet even frequently used datasets have varied accuracy practices. Results are sensitive to option position, choice symbols, answer reordering, number of choices, task formulation and even minor formatting, often producing large arbitrary score changes.

模型发布以常见基准衡量进展，也帮助社区理解强模型如何构建。然而，即便常用数据集也存在多种准确率测量实践。结果会受到选项位置、标签符号、选项重排、选项数量、任务表述乃至轻微格式变化影响，并常产生巨大而任意的分数波动。

The page begins discussing HELM and related standardization efforts; the discussion continues on page 9.

本页末尾开始讨论 HELM 等标准化工作，内容续至第 9 页。
<!-- page 9 of 29 -->

model
ARC_C ARC_E BoolQ CSQA HSwag MMLU OBQA PIQA SIQA WinoG average
Pythia-1B
31.4
63.4
56.8†
50.9
48.0
31.1
40.4
68.9
46.4
52.7
49.0
OLMo-1B
38.6
68.3
51.3
62.2
65.2
33.4
47.6
74.1
51.5
59.3
55.1
TinyLlama-1.1B
38.1
69.5
63.6
61.1
60.8
33.6
45.0
71.7
50.4
60.1
55.4
Pythia-6.7B
44.6
72.6
68.7
62.1
66.1
37.7
50.4
74.9
51.7
62.3
59.1
RPJ-INCITE-7B
45.3
78.8
72.0
69.2
72.8
40.1
49.0
75.9
56.6
68.0
62.8
StableLM2-1.6B
50.6†
75.3
82.3
70.4†
70.3
40.4†
56.6†
75.6
64.3†
65.7
65.1
OLMo-7B
46.4
78.9
78.7
70.8
78.1
40.5
55.8
78.5
56.5
68.5
65.3
MPT-7b
45.7
78.0
82.4
70.9
79.6
40.6
52.4
79.2
57.4
70.2
65.6
Falcon-7B
49.7
80.6
78.2
73.4
79.0
42.1
55.2
79.0
60.1
71.3
66.9
Llama2-7B
54.2
84.0
86.1
74.2
78.9
46.2†
57.8
77.5
59.6
71.7
69.0
Llama2-13B
67.3†
85.9
86.7
74.0
83.9
55.8†
65.4†
80.2
65.9†
74.9
74.0
OLMo-7B-0424
66.9†
83.6†
85.9
85.8†
80.1
54.4†
68.6†
80.3
76.1†
73.6
75.5
Llama3-8B
79.3†
92.4†
87.5
73.9†
81.8
66.6†
77.2†
81.6
70.2†
76.2
78.7
Mistral-7B-v0.1
78.6†
90.8†
89.3
72.4†
83.0
64.0†
80.6†
82.8
71.3†
77.9
79.1
Llama3-70B
93.7†
97.7†
91.7†
83.2†
89.5
79.8†
93.4†
91.6†
78.9†
84.1
88.4
Table 4: Reproducible performance scores across models and tasks using OLMES, providing robust, meaningful
comparisons across a wide range of models and tasks. † indicates use of the MCF score.
ging Face Open LLM Leaderboard (Beeching
et al., 2023), Mosaic Eval Gauntlet (Barton, 2024),
Eleuther LM Evaluation Harness (Gao et al., 2023;
Biderman et al., 2024), and Unitxt (Bandel et al.,
2024) present efforts toward greater transparency
and reproducibility of LLM evaluations. These
frameworks generally describe and provide support
for various task setups, presenting them as open
choices to researchers and users. When specific
default setups are given, the rationale is not always
documented and thus not followed by others in
subsequent work (see Tables 1 and 14).
6
Discussion
By identifying and reviewing common evaluation
practices in the community, and performing ex-
periments to resolve open questions, we present
OLMES – an open, documented, reproducible, and
practical evaluation standard. OLMES provides
justified recommendations on decisions such as
how to format dataset instances, the choice of in-
context examples, task formulation, probability nor-
malization, as well as other implementation details.
The goal is for OLMES to be a useful guide for
model developers to obtain signals as to whether
their model is on track during training, and to com-
pare final powerful base models. The practical
choices encourage evaluations without unnecessary
computation resources. The reproducible nature
means that any evaluation done using OLMES can
be directly compared to existing OLMES evalua-
tions. We also document the rationales behind the
choices made, guiding the community toward more
justified evaluation practices. OLMES can be ap-
plied to current leaderboards and evaluation code
bases to unify evaluation practices in the field.
Future work and limitations. Future work in-
cludes adding more tasks to OLMES, covering
tasks beyond MCQA such as generative tasks and
chain-of-thought prompting. This will include stan-
dardizing how answers are extracted for evalua-
tion, and for chat models how to split the prompt
into messages. We welcome the community to
contribute to OLMES, extending the principles of
OLMES to new tasks.
OLMES is a step towards standardizing LLM
evaluations, ready to be incorporated into evalua-
tion code bases for broad usage. OLMES facilitates
robust and simplified comparisons of model perfor-
mances, both for researchers during model training
and development, and for developers in choosing
models to build upon.
Acknowledgments
In creating this evaluation standard, OLMES, we
build on top of the various previous efforts on lan-
guage model evaluation in the community – includ-
ing previous work on language model evaluation
standardization, the many open research reports dis-
closing how evaluation on LLMs have been done,
and the datasets that made OLMES possible, which
we explicitly cite and acknowledge in our paper.
Limitations
The current version of OLMES is focused on pro-
viding guidance useful for LLM evaluation dur-
ing the training stage and for comparing final base
models, which provides important insights into the
potential of such models before further tuning (e.g.,
9

<!-- chinese translation page 9 -->

**中文。** 表 4：使用 OLMES 得到的跨模型、跨任务可复现性能分数，为大量不同模型和任务提供稳健且有意义的比较。† 表示采用 MCF 分数。

**中文。** Hugging Face Open LLM Leaderboard（Beeching 等，2023）、Mosaic Eval Gauntlet（Barton，2024）、Eleuther LM Evaluation Harness（Gao 等，2023；Biderman 等，2024）以及 Unitxt（Bandel 等，2024）都在推动大语言模型评测获得更高的透明度与可复现性。这些框架通常会描述并支持多种任务配置，把它们作为研究者和用户可以自由选择的方案。即使框架提供了特定默认配置，其理由也并不总有文档说明，因此后续工作未必会沿用这些默认设置（见表 1 和表 14）。

**中文。** 我们识别并审视社区中常见的评测实践，同时通过实验解决尚无定论的问题，由此提出 OLMES——一种开放、有文档、可复现且实用的评测标准。对于数据集实例如何格式化、上下文示例如何选择、任务如何表述、概率如何归一化以及其他实现细节，OLMES 都给出了有依据的建议。

**中文。** OLMES 的目标是帮助模型开发者在训练过程中判断模型是否仍沿着正确方向前进，并比较训练完成后的强大基础模型。其实用性选择鼓励在不耗费无谓计算资源的情况下完成评测。可复现性意味着任何采用 OLMES 的评测都能与已有 OLMES 结果直接比较。我们还记录了每一项选择背后的理由，引导社区采用依据更充分的评测实践。OLMES 也可以应用到现有排行榜和评测代码库中，从而统一该领域的评测方式。

**中文。未来工作与局限。** 后续工作包括向 OLMES 增加更多任务，覆盖多项选择问答之外的生成式任务和思维链提示。这将包括标准化评测时的答案提取方式，以及针对聊天模型规定如何把提示拆分为多条消息。我们欢迎社区参与贡献，把 OLMES 的原则扩展到新任务。

**中文。** OLMES 是大语言模型评测标准化道路上的一步，已经可以被广泛纳入各类评测代码库。它使模型性能比较更稳健、更简单，既服务于训练和开发模型的研究者，也服务于选择基础模型继续构建产品或系统的开发者。

**中文。** 在创建 OLMES 时，我们建立在社区此前诸多工作的基础之上，包括语言模型评测标准化研究、公开披露大语言模型评测方法的研究报告，以及使 OLMES 得以实现的各个数据集。本文对这些贡献均作了明确引用与致谢。

**中文。** 当前版本的 OLMES 重点为大语言模型训练阶段的评测以及最终基础模型之间的比较提供指导。这类评测能够在后续微调（例如指令微调或安全微调）之前揭示模型的潜力。

<!-- end chinese translation page 9 -->
<!-- page 10 of 29 -->

instruction-tuning, safety-tuning). Interesting di-
rections for future work include looking into eval-
uations targeted at accessing the effectiveness of
various kinds of model tuning, as well as evaluation
for multi-modal models.
This paper focuses on design choices in evalu-
ating language models with multiple-choice tasks.
While the suite of multiple-choice tasks used in
this work includes questions on science, various
types of commonsense, factual knowledge, and
covers a range of topics (MMLU alone covers 57
subjects), of varying difficulty, an important future
direction would be to apply the same principles in
OLMES (e.g., prompt formatting, curated few-shot
examples) to generative tasks and chain-of-thought
prompting.
While the recommendations in OLMES are well-
considered, justified and practical, they do not
cover all plausible variants of presenting a task.
See Appendix A for further discussion, showing
how performance measured using OLMES is sta-
ble and consistent when subject to small changes
in prompt wording or the selection of few-shot
examples, within the general recommendations.
Larger differences would be expected when diverg-
ing from OLMES recommendations such as by
using unnatural prompts e.g., using rare symbols
as answer labels, or randomly sampled few-shot
examples which could run into skewed label dis-
tribution covered in few-shot examples or include
noisy examples from train sets. We leave evalu-
ating the robustness of models under adversarial
setups as a topic for future work.
Ethical considerations
This study involves the use of large-scale language
models. We only use their outputs to obtain their
answers to questions in commonly used multiple-
choice datasets, therefore we do not foresee any
ethical issues with their use for the research pre-
sented in this work.
References
AI2 blog. 2024. OLMo 1.7–7B: A 24 point improve-
ment on MMLU.
https://blog.allenai.org/
olmo-1-7-7b-92b43f7d269d. Accessed: 2024-06-
03.
AI@Meta.
2024.
Llama
3
model
card.
https://github.com/meta-llama/llama3/
blob/main/MODEL_CARD.md. Accessed: 2024-05-
29.
Ebtesam Almazrouei, Hamza Alobeidli, Abdulaziz Al-
shamsi, Alessandro Cappelli, Ruxandra Cojocaru,
Mérouane Debbah, Étienne Goffinet, Daniel Hesslow,
Julien Launay, Quentin Malartic, Daniele Mazzotta,
Badreddine Noune, Baptiste Pannier, and Guilherme
Penedo. 2023. The falcon series of open language
models. arXiv:2311.16867.
Norah Alzahrani, Hisham Abdullah Alyahya, Yazeed
Alnumay, Sultan Alrashed, Shaykhah Alsubaie,
Yusef Almushaykeh, Faisal Mirza, Nouf Alotaibi,
Nora Altwairesh, Areeb Alowisheq, M Saiful Bari,
and Haidar Khan. 2024. When benchmarks are tar-
gets: Revealing the sensitivity of large language
model leaderboards. arXiv:2402.01781.
Anthropic. 2024. The claude 3 model family: Opus,
sonnet, haiku. https://www-cdn.anthropic.com/
de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/
Model_Card_Claude_3.pdf. Accessed: 2024-06-
03.
Elron Bandel, Yotam Perlitz, Elad Venezian, Roni Fried-
man, Ofir Arviv, Matan Orbach, Shachar Don-Yehiya,
Dafna Sheinwald, Ariel Gera, Leshem Choshen,
Michal Shmueli-Scheuer, and Yoav Katz. 2024.
Unitxt: Flexible, shareable and reusable data prepara-
tion and evaluation for generative AI. In Proceedings
of the 2024 Conference of the North American Chap-
ter of the Association for Computational Linguistics:
Human Language Technologies (Volume 3: System
Demonstrations), pages 207–215, Mexico City, Mex-
ico. Association for Computational Linguistics.
Tessa Barton. 2024. Calibrating the mosaic evaluation
gauntlet.
https://www.databricks.com/blog/
calibrating-mosaic-evaluation-gauntlet.
Accessed: 2024-05-05.
Edward Beeching, Clémentine Fourrier, Nathan Habib,
Sheon Han, Nathan Lambert, Nazneen Rajani, Omar
Sanseviero, Lewis Tunstall, and Thomas Wolf. 2023.
Open llm leaderboard. https://huggingface.co/
spaces/open-llm-leaderboard-old/open_llm_
leaderboard.
Marco Bellagente, Jonathan Tow, Dakota Mahan, Duy
Phung, Maksym Zhuravinskyi, Reshinth Adithyan,
James Baicoianu, Ben Brooks, Nathan Cooper,
Ashish Datta, Meng Lee, Emad Mostaque, Michael
Pieler, Nikhil Pinnaparju, Paulo Rocha, Harry Saini,
Hannah Teufel, Niccolo Zanichelli, and Carlos
Riquelme. 2024. Stable LM 2 1.6b technical report.
arXiv:2402.17834.
Stella Biderman, Hailey Schoelkopf, Quentin Gregory
Anthony, Herbie Bradley, Kyle O’Brien, Eric Hal-
lahan, Mohammad Aflah Khan, Shivanshu Purohit,
USVSN Sai Prashanth, Edward Raff, et al. 2023.
Pythia: A suite for analyzing large language mod-
els across training and scaling.
In International
Conference on Machine Learning, pages 2397–2430.
PMLR.
Stella Biderman, Hailey Schoelkopf, Lintang Sutawika,
Leo Gao, Jonathan Tow, Baber Abbasi, Alham Fikri
10

<!-- chinese translation page 10 -->

**中文。** 值得探索的后续方向包括：设计专门评估不同模型微调方式有效性的评测，以及面向多模态模型的评测。

**中文。** 本文关注使用多项选择任务评测语言模型时的设计选择。本文采用的任务套件覆盖科学、多种常识、事实知识和广泛主题——仅 MMLU 就覆盖 57 个学科——并包含不同难度。一个重要的未来方向，是把 OLMES 的相同原则（例如提示格式和精心筛选的少样本示例）应用于生成式任务与思维链提示。

**中文。** 尽管 OLMES 的建议经过审慎考虑、有充分依据且实用，但它们并未覆盖所有可能的任务呈现变体。附录 A 进一步说明：只要遵守总体建议，当提示措辞或少样本示例选择发生小幅变化时，OLMES 测得的性能仍然稳定且一致。若明显偏离 OLMES 建议，则可能出现更大差异，例如用罕见符号作为答案标签，或随机抽取少样本示例，以致标签分布偏斜或混入训练集噪声样例。模型在对抗性设置下的稳健性留待未来研究。

**中文。** 本研究使用了大规模语言模型，但只利用模型输出获取它们对常用多项选择数据集问题的答案。因此，我们预计这种使用方式不会给本文研究带来伦理问题。

**中文。** AI2 博客，2024。《OLMo 1.7–7B：MMLU 提升 24 分》。访问日期：2024-06-03。

**中文。** AI@Meta，2024。《Llama 3 模型卡》。访问日期：2024-05-29。

**中文。** Almazrouei 等，2023。《Falcon 开放语言模型系列》。arXiv:2311.16867。

**中文。** Alzahrani 等，2024。《当基准成为目标：揭示大语言模型排行榜的敏感性》。arXiv:2402.01781。

**中文。** Anthropic，2024。《Claude 3 模型家族：Opus、Sonnet、Haiku》。访问日期：2024-06-03。

**中文。** Bandel 等，2024。《Unitxt：面向生成式 AI 的灵活、可共享、可复用数据准备与评测》。NAACL 2024 系统演示论文集，第 207–215 页。

**中文。** Barton，2024。《校准 Mosaic Evaluation Gauntlet》。访问日期：2024-05-05。

**中文。** Beeching 等，2023。《开放大语言模型排行榜》。

**中文。** Bellagente 等，2024。《Stable LM 2 1.6B 技术报告》。arXiv:2402.17834。

**中文。** Biderman 等，2023。《Pythia：贯穿训练与规模扩展过程的大语言模型分析套件》。ICML，第 2397–2430 页。

<!-- end chinese translation page 10 -->
<!-- page 11 of 29 -->

Aji, Pawan Sasanka Ammanamanchi, Sidney Black,
Jordan Clive, Anthony DiPofi, Julen Etxaniz, Ben-
jamin Fattori, Jessica Zosa Forde, Charles Foster, Mi-
mansa Jaiswal, Wilson Y. Lee, Haonan Li, Charles
Lovering, Niklas Muennighoff, Ellie Pavlick, Ja-
son Phang, Aviya Skowron, Samson Tan, Xiangru
Tang, Kevin A. Wang, Genta Indra Winata, François
Yvon, and Andy Zou. 2024.
Lessons from the
trenches on reproducible evaluation of language mod-
els. arXiv:2405.14782.
Yonatan Bisk, Rowan Zellers, Ronan Le bras, Jianfeng
Gao, and Yejin Choi. 2020. PIQA: Reasoning about
physical commonsense in natural language. Proceed-
ings of the AAAI Conference on Artificial Intelligence,
34(05):7432–7439.
Rishi Bommasani, Drew A. Hudson, Ehsan Adeli, Russ
Altman, Simran Arora, Sydney von Arx, Michael S.
Bernstein, Jeannette Bohg, Antoine Bosselut, Emma
Brunskill, Erik Brynjolfsson, Shyamal Buch, Dallas
Card, Rodrigo Castellon, Niladri Chatterji, Annie
Chen, Kathleen Creel, Jared Quincy Davis, Dora
Demszky, Chris Donahue, Moussa Doumbouya,
Esin Durmus, Stefano Ermon, John Etchemendy,
Kawin Ethayarajh, Li Fei-Fei, Chelsea Finn, Trevor
Gale, Lauren Gillespie, Karan Goel, Noah Goodman,
Shelby Grossman, Neel Guha, Tatsunori Hashimoto,
Peter Henderson, John Hewitt, Daniel E. Ho, Jenny
Hong, Kyle Hsu, Jing Huang, Thomas Icard, Saahil
Jain, Dan Jurafsky, Pratyusha Kalluri, Siddharth
Karamcheti, Geoff Keeling, Fereshte Khani, Omar
Khattab, Pang Wei Koh, Mark Krass, Ranjay Kr-
ishna, Rohith Kuditipudi, Ananya Kumar, Faisal Lad-
hak, Mina Lee, Tony Lee, Jure Leskovec, Isabelle
Levent, Xiang Lisa Li, Xuechen Li, Tengyu Ma,
Ali Malik, Christopher D. Manning, Suvir Mirchan-
dani, Eric Mitchell, Zanele Munyikwa, Suraj Nair,
Avanika Narayan, Deepak Narayanan, Ben Newman,
Allen Nie, Juan Carlos Niebles, Hamed Nilforoshan,
Julian Nyarko, Giray Ogut, Laurel Orr, Isabel Pa-
padimitriou, Joon Sung Park, Chris Piech, Eva Porte-
lance, Christopher Potts, Aditi Raghunathan, Rob
Reich, Hongyu Ren, Frieda Rong, Yusuf Roohani,
Camilo Ruiz, Jack Ryan, Christopher Ré, Dorsa
Sadigh, Shiori Sagawa, Keshav Santhanam, Andy
Shih, Krishnan Srinivasan, Alex Tamkin, Rohan
Taori, Armin W. Thomas, Florian Tramèr, Rose E.
Wang, William Wang, Bohan Wu, Jiajun Wu, Yuhuai
Wu, Sang Michael Xie, Michihiro Yasunaga, Jiaxuan
You, Matei Zaharia, Michael Zhang, Tianyi Zhang,
Xikun Zhang, Yuhui Zhang, Lucia Zheng, Kaitlyn
Zhou, and Percy Liang. 2022. On the opportunities
and risks of foundation models. arXiv:2108.07258.
Tom Brown, Benjamin Mann, Nick Ryder, Melanie
Subbiah, Jared D Kaplan, Prafulla Dhariwal, Arvind
Neelakantan, Pranav Shyam, Girish Sastry, Amanda
Askell, Sandhini Agarwal, Ariel Herbert-Voss,
Gretchen Krueger, Tom Henighan, Rewon Child,
Aditya Ramesh, Daniel Ziegler, Jeffrey Wu, Clemens
Winter, Chris Hesse, Mark Chen, Eric Sigler, Ma-
teusz Litwin, Scott Gray, Benjamin Chess, Jack
Clark, Christopher Berner, Sam McCandlish, Alec
Radford, Ilya Sutskever, and Dario Amodei. 2020.
Language models are few-shot learners.
In Ad-
vances in Neural Information Processing Systems,
volume 33, pages 1877–1901. Curran Associates,
Inc.
Aakanksha Chowdhery, Sharan Narang, Jacob Devlin,
Maarten Bosma, Gaurav Mishra, Adam Roberts,
Paul Barham, Hyung Won Chung, Charles Sutton,
Sebastian Gehrmann, Parker Schuh, Kensen Shi,
Sasha Tsvyashchenko, Joshua Maynez, Abhishek
Rao, Parker Barnes, Yi Tay, Noam Shazeer, Vin-
odkumar Prabhakaran, Emily Reif, Nan Du, Ben
Hutchinson, Reiner Pope, James Bradbury, Jacob
Austin, Michael Isard, Guy Gur-Ari, Pengcheng Yin,
Toju Duke, Anselm Levskaya, Sanjay Ghemawat,
Sunipa Dev, Henryk Michalewski, Xavier Garcia,
Vedant Misra, Kevin Robinson, Liam Fedus, Denny
Zhou, Daphne Ippolito, David Luan, Hyeontaek Lim,
Barret Zoph, Alexander Spiridonov, Ryan Sepassi,
David Dohan, Shivani Agrawal, Mark Omernick, An-
drew M. Dai, Thanumalayan Sankaranarayana Pil-
lai, Marie Pellat, Aitor Lewkowycz, Erica Moreira,
Rewon Child, Oleksandr Polozov, Katherine Lee,
Zongwei Zhou, Xuezhi Wang, Brennan Saeta, Mark
Diaz, Orhan Firat, Michele Catasta, Jason Wei, Kathy
Meier-Hellstern, Douglas Eck, Jeff Dean, Slav Petrov,
and Noah Fiedel. 2022. PaLM: Scaling language
modeling with pathways. arXiv:2204.02311.
Christopher Clark, Kenton Lee, Ming-Wei Chang,
Tom Kwiatkowski, Michael Collins, and Kristina
Toutanova. 2019. BoolQ: Exploring the surprising
difficulty of natural yes/no questions. In Proceedings
of the 2019 Conference of the North American Chap-
ter of the Association for Computational Linguistics:
Human Language Technologies, Volume 1 (Long and
Short Papers), pages 2924–2936, Minneapolis, Min-
nesota. Association for Computational Linguistics.
Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot,
Ashish Sabharwal, Carissa Schoenick, and Oyvind
Tafjord. 2018. Think you have solved question an-
swering? Try ARC, the AI2 reasoning challenge.
CoRR, arXiv:1803.05457.
Nan Du, Yanping Huang, Andrew M Dai, Simon Tong,
Dmitry Lepikhin, Yuanzhong Xu, Maxim Krikun,
Yanqi Zhou, Adams Wei Yu, Orhan Firat, et al. 2022.
Glam: Efficient scaling of language models with
mixture-of-experts. In International Conference on
Machine Learning, pages 5547–5569. PMLR.
Leo Gao. 2021.
Multiple choice normalization
in LM evaluation.
https://blog.eleuther.ai/
multiple-choice-normalization/.
Accessed:
2024-05-08.
Leo Gao, Jonathan Tow, Baber Abbasi, Stella Biderman,
Sid Black, Anthony DiPofi, Charles Foster, Laurence
Golding, Jeffrey Hsu, Alain Le Noac’h, Haonan Li,
Kyle McDonell, Niklas Muennighoff, Chris Ociepa,
Jason Phang, Laria Reynolds, Hailey Schoelkopf,
Aviya Skowron, Lintang Sutawika, Eric Tang, Anish
Thite, Ben Wang, Kevin Wang, and Andy Zou. 2023.
11

<!-- chinese translation page 11 -->

**中文。** Biderman 等，2024。《来自一线实践的语言模型可复现评测经验》。arXiv:2405.14782。

**中文。** Bisk 等，2020。《PIQA：用自然语言推理物理常识》。AAAI，34(05)：7432–7439。

**中文。** Bommasani 等，2022。《论基础模型的机遇与风险》。arXiv:2108.07258。

**中文。** Brown 等，2020。《语言模型是少样本学习者》。NeurIPS 第 33 卷，第 1877–1901 页。

**中文。** Chowdhery 等，2022。《PaLM：使用 Pathways 扩展语言建模》。arXiv:2204.02311。

**中文。** Clark 等，2019。《BoolQ：探索自然是非问题出人意料的难度》。NAACL-HLT，第 2924–2936 页。

**中文。** Clark 等，2018。《以为问答问题已经解决？试试 ARC：AI2 推理挑战》。CoRR，arXiv:1803.05457。

**中文。** Du 等，2022。《GLaM：使用专家混合高效扩展语言模型》。ICML，第 5547–5569 页。

**中文。** Gao，2021。《语言模型评测中的多项选择归一化》。访问日期：2024-05-08。

**中文。** Gao 等，2023。《少样本语言模型评测框架》。

<!-- end chinese translation page 11 -->
<!-- page 12 of 29 -->

A framework for few-shot language model evaluation.
https://zenodo.org/records/10256836.
Gemma Team, Thomas Mesnard, Cassidy Hardin,
Robert Dadashi, Surya Bhupatiraju, Shreya Pathak,
Laurent Sifre, Morgane Rivière, Mihir Sanjay
Kale, Juliette Love, Pouya Tafti, Léonard Hussenot,
Pier Giuseppe Sessa, Aakanksha Chowdhery, Adam
Roberts, Aditya Barua, Alex Botev, Alex Castro-
Ros, Ambrose Slone, Amélie Héliou, Andrea Tac-
chetti, Anna Bulanova, Antonia Paterson, Beth
Tsai, Bobak Shahriari, Charline Le Lan, Christo-
pher A. Choquette-Choo, Clément Crepy, Daniel Cer,
Daphne Ippolito, David Reid, Elena Buchatskaya,
Eric Ni, Eric Noland, Geng Yan, George Tucker,
George-Christian Muraru, Grigory Rozhdestvenskiy,
Henryk Michalewski, Ian Tenney, Ivan Grishchenko,
Jacob Austin, James Keeling, Jane Labanowski,
Jean-Baptiste Lespiau, Jeff Stanway, Jenny Bren-
nan, Jeremy Chen, Johan Ferret, Justin Chiu, Justin
Mao-Jones, Katherine Lee, Kathy Yu, Katie Milli-
can, Lars Lowe Sjoesund, Lisa Lee, Lucas Dixon,
Machel Reid, Maciej Mikuła, Mateo Wirth, Michael
Sharman, Nikolai Chinaev, Nithum Thain, Olivier
Bachem, Oscar Chang, Oscar Wahltinez, Paige Bai-
ley, Paul Michel, Petko Yotov, Rahma Chaabouni,
Ramona Comanescu, Reena Jana, Rohan Anil, Ross
McIlroy, Ruibo Liu, Ryan Mullins, Samuel L Smith,
Sebastian Borgeaud, Sertan Girgin, Sholto Douglas,
Shree Pandya, Siamak Shakeri, Soham De, Ted Kli-
menko, Tom Hennigan, Vlad Feinberg, Wojciech
Stokowiec, Yu hui Chen, Zafarali Ahmed, Zhitao
Gong, Tris Warkentin, Ludovic Peran, Minh Giang,
Clément Farabet, Oriol Vinyals, Jeff Dean, Koray
Kavukcuoglu, Demis Hassabis, Zoubin Ghahramani,
Douglas Eck, Joelle Barral, Fernando Pereira, Eli
Collins, Armand Joulin, Noah Fiedel, Evan Senter,
Alek Andreev, and Kathleen Kenealy. 2024. Gemma:
Open models based on gemini research and technol-
ogy. arXiv:2403.08295.
Dirk Groeneveld, Iz Beltagy, Pete Walsh, Akshita Bha-
gia, Rodney Kinney, Oyvind Tafjord, Ananya Harsh
Jha, Hamish Ivison, Ian Magnusson, Yizhong Wang,
Shane Arora, David Atkinson, Russell Authur, Khy-
athi Raghavi Chandu, Arman Cohan, Jennifer Du-
mas, Yanai Elazar, Yuling Gu, Jack Hessel, Tushar
Khot, William Merrill, Jacob Morrison, Niklas Muen-
nighoff, Aakanksha Naik, Crystal Nam, Matthew E.
Peters, Valentina Pyatkin, Abhilasha Ravichander,
Dustin Schwenk, Saurabh Shah, Will Smith, Emma
Strubell, Nishant Subramani, Mitchell Wortsman,
Pradeep Dasigi, Nathan Lambert, Kyle Richardson,
Luke Zettlemoyer, Jesse Dodge, Kyle Lo, Luca Sol-
daini, Noah A. Smith, and Hannaneh Hajishirzi. 2024.
OLMo: Accelerating the science of language models.
arXiv:2402.00838.
Dan Hendrycks, Collin Burns, Steven Basart, Andy
Zou, Mantas Mazeika, Dawn Song, and Jacob Stein-
hardt. 2021. Measuring massive multitask language
understanding. Proceedings of the International Con-
ference on Learning Representations (ICLR).
Ari Holtzman, Peter West, Vered Shwartz, Yejin Choi,
and Luke Zettlemoyer. 2021.
Surface form com-
petition: Why the highest probability answer isn’t
always right. In Proceedings of the 2021 Conference
on Empirical Methods in Natural Language Process-
ing, pages 7038–7051, Online and Punta Cana, Do-
minican Republic. Association for Computational
Linguistics.
Albert Q. Jiang, Alexandre Sablayrolles, Arthur Men-
sch, Chris Bamford, Devendra Singh Chaplot, Diego
de las Casas, Florian Bressand, Gianna Lengyel,
Guillaume Lample, Lucile Saulnier, Lélio Re-
nard Lavaud, Marie-Anne Lachaux, Pierre Stock,
Teven Le Scao, Thibaut Lavril, Thomas Wang, Timo-
thée Lacroix, and William El Sayed. 2023. Mistral
7B. arXiv:2310.06825.
Aisha Khatun and Daniel G. Brown. 2024. A study on
large language models’ limitations in multiple-choice
question answering. arXiv:2401.07955.
Wangyue Li, Liangzhi Li, Tong Xiang, Xiao Liu, Wei
Deng, and Noa Garcia. 2024. Can multiple-choice
questions really be useful in detecting the abilities of
LLMs? In LREC-COLING 2024.
Percy Liang, Rishi Bommasani, Tony Lee, Dimitris
Tsipras, Dilara Soylu, Michihiro Yasunaga, Yian
Zhang, Deepak Narayanan, Yuhuai Wu, Ananya Ku-
mar, Benjamin Newman, Binhang Yuan, Bobby Yan,
Ce Zhang, Christian Alexander Cosgrove, Christo-
pher D Manning, Christopher Re, Diana Acosta-
Navas, Drew Arad Hudson, Eric Zelikman, Esin
Durmus, Faisal Ladhak, Frieda Rong, Hongyu Ren,
Huaxiu Yao, Jue WANG, Keshav Santhanam, Laurel
Orr, Lucia Zheng, Mert Yuksekgonul, Mirac Suzgun,
Nathan Kim, Neel Guha, Niladri S. Chatterji, Omar
Khattab, Peter Henderson, Qian Huang, Ryan An-
drew Chi, Sang Michael Xie, Shibani Santurkar,
Surya Ganguli, Tatsunori Hashimoto, Thomas Icard,
Tianyi Zhang, Vishrav Chaudhary, William Wang,
Xuechen Li, Yifan Mai, Yuhui Zhang, and Yuta Ko-
reeda. 2023. Holistic evaluation of language models.
Transactions on Machine Learning Research.
Opher Lieber, Or Sharir, Barak Lenz, and Yoav Shoham.
2021. Jurassic-1: Technical details and evaluation.
White Paper. AI21 Labs.
Yifan Mai and Percy Liang. 2024.
Massive
multitask language understanding (MMLU) on
helm.
https://crfm.stanford.edu/2024/05/
01/helm-mmlu.html. Accessed: 2024-05-29.
Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish
Sabharwal. 2018. Can a suit of armor conduct elec-
tricity? a new dataset for open book question an-
swering. In Proceedings of the 2018 Conference on
Empirical Methods in Natural Language Processing,
pages 2381–2391, Brussels, Belgium. Association
for Computational Linguistics.
MosaicML. 2023.
Introducing MPT-7B: A new
standard for open-source, commercially usable
LLMs.
https://www.databricks.com/blog/
mpt-7b. Accessed: 2024-05-08.
12

<!-- chinese translation page 12 -->

**中文。** Gao 等，2023。《少样本语言模型评测框架》。Zenodo 记录 10256836。

**中文。** Gemma 团队等，2024。《Gemma：基于 Gemini 研究与技术的开放模型》。arXiv:2403.08295。

**中文。** Groeneveld 等，2024。《OLMo：加速语言模型科学研究》。arXiv:2402.00838。

**中文。** Hendrycks 等，2021。《衡量大规模多任务语言理解》。ICLR。

**中文。** Holtzman 等，2021。《表层形式竞争：为什么概率最高的答案并不总是正确》。EMNLP，第 7038–7051 页。

**中文。** Jiang 等，2023。《Mistral 7B》。arXiv:2310.06825。

**中文。** Khatun 与 Brown，2024。《大语言模型在多项选择问答中的局限性研究》。arXiv:2401.07955。

**中文。** Li 等，2024。《多项选择题真的能有效检测大语言模型的能力吗？》LREC-COLING 2024。

**中文。** Liang 等，2023。《语言模型的整体评测》。Transactions on Machine Learning Research。

**中文。** Lieber 等，2021。《Jurassic-1：技术细节与评测》。AI21 Labs 白皮书。

**中文。** Mai 与 Liang，2024。《HELM 上的大规模多任务语言理解（MMLU）》。访问日期：2024-05-29。

**中文。** Mihaylov 等，2018。《盔甲能导电吗？一个用于开卷问答的新数据集》。EMNLP，第 2381–2391 页。

**中文。** MosaicML，2023。《介绍 MPT-7B：开源且可商用大语言模型的新标准》。访问日期：2024-05-08。

<!-- end chinese translation page 12 -->
<!-- page 13 of 29 -->

MosaicML. 2024.
Mosaic eval gauntlet v0.3.0 -
evaluation suite. https://github.com/mosaicml/
llm-foundry/blob/main/scripts/eval/local_
data/EVAL_GAUNTLET.md. Accessed: 2024-05-29.
Harsha Nori, Nicholas King, Scott Mayer McKinney,
Dean Carignan, and Eric Horvitz. 2023.
Capa-
bilities of GPT-4 on medical challenge problems.
arXiv:2303.13375.
OpenAI.
2024.
GPT-4
technical
report.
arXiv:2303.08774.
Joshua Robinson, Christopher Michael Rytting, and
David Wingate. 2023. Leveraging Large Language
Models for Multiple Choice Question Answering.
Proceedings of the International Conference on
Learning Representations (ICLR).
Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavat-
ula, and Yejin Choi. 2020. WinoGrande: An adver-
sarial winograd schema challenge at scale. Proceed-
ings of the AAAI Conference on Artificial Intelligence,
34(05):8732–8740.
Maarten Sap, Hannah Rashkin, Derek Chen, Ronan
Le Bras, and Yejin Choi. 2019. Social IQa: Com-
monsense reasoning about social interactions. In
Proceedings of the 2019 Conference on Empirical
Methods in Natural Language Processing and the
9th International Joint Conference on Natural Lan-
guage Processing (EMNLP-IJCNLP), pages 4463–
4473, Hong Kong, China. Association for Computa-
tional Linguistics.
Melanie Sclar, Yejin Choi, Yulia Tsvetkov, and Alane
Suhr. 2023. Quantifying language models’ sensitiv-
ity to spurious features in prompt design or: How i
learned to start worrying about prompt formatting.
arXiv:2310.11324.
Shaden Smith, Mostofa Patwary, Brandon Norick,
Patrick LeGresley, Samyam Rajbhandari, Jared
Casper, Zhun Liu, Shrimai Prabhumoye, George
Zerveas, Vijay Korthikanti, et al. 2022.
Using
deepspeed and megatron to train megatron-turing
nlg 530b, a large-scale generative language model.
arXiv:2201.11990.
Alon Talmor, Jonathan Herzig, Nicholas Lourie, and
Jonathan Berant. 2019. CommonsenseQA: A ques-
tion answering challenge targeting commonsense
knowledge. In Proceedings of the 2019 Conference
of the North American Chapter of the Association for
Computational Linguistics: Human Language Tech-
nologies, Volume 1 (Long and Short Papers), pages
4149–4158, Minneapolis, Minnesota. Association for
Computational Linguistics.
Together Computer. 2023. RedPajama: an open dataset
for training large language models.
Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier
Martinet, Marie-Anne Lachaux, Timothée Lacroix,
Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal
Azhar, Aurelien Rodriguez, Armand Joulin, Edouard
Grave, and Guillaume Lample. 2023a.
LLaMA:
Open and efficient foundation language models.
arXiv:2302.13971.
Hugo Touvron, Louis Martin, Kevin Stone, Peter Al-
bert, Amjad Almahairi, Yasmine Babaei, Nikolay
Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti
Bhosale, Dan Bikel, Lukas Blecher, Cristian Canton
Ferrer, Moya Chen, Guillem Cucurull, David Esiobu,
Jude Fernandes, Jeremy Fu, Wenyin Fu, Brian Fuller,
Cynthia Gao, Vedanuj Goswami, Naman Goyal, An-
thony Hartshorn, Saghar Hosseini, Rui Hou, Hakan
Inan, Marcin Kardas, Viktor Kerkez, Madian Khabsa,
Isabel Kloumann, Artem Korenev, Punit Singh Koura,
Marie-Anne Lachaux, Thibaut Lavril, Jenya Lee, Di-
ana Liskovich, Yinghai Lu, Yuning Mao, Xavier Mar-
tinet, Todor Mihaylov, Pushkar Mishra, Igor Moly-
bog, Yixin Nie, Andrew Poulton, Jeremy Reizen-
stein, Rashi Rungta, Kalyan Saladi, Alan Schelten,
Ruan Silva, Eric Michael Smith, Ranjan Subrama-
nian, Xiaoqing Ellen Tan, Binh Tang, Ross Tay-
lor, Adina Williams, Jian Xiang Kuan, Puxin Xu,
Zheng Yan, Iliyan Zarov, Yuchen Zhang, Angela Fan,
Melanie Kambadur, Sharan Narang, Aurelien Ro-
driguez, Robert Stojnic, Sergey Edunov, and Thomas
Scialom. 2023b. Llama 2: Open foundation and
fine-tuned chat models. arXiv:2307.09288.
Haochun Wang, Sendong Zhao, Zewen Qiang, Bing
Qin, and Ting Liu. 2024. Beyond the answers: Re-
viewing the rationality of multiple choice question
answering for the evaluation of large language mod-
els. arXiv:2402.01349.
Sarah Wiegreffe, Matthew Finlayson, Oyvind Tafjord,
Peter Clark, and Ashish Sabharwal. 2023. Increasing
probability mass on answer choices does not always
improve accuracy. In Proceedings of the 2023 Con-
ference on Empirical Methods in Natural Language
Processing, pages 8392–8417, Singapore. Associa-
tion for Computational Linguistics.
Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali
Farhadi, and Yejin Choi. 2019. HellaSwag: Can a ma-
chine really finish your sentence? In Proceedings of
the 57th Annual Meeting of the Association for Com-
putational Linguistics, pages 4791–4800, Florence,
Italy. Association for Computational Linguistics.
Peiyuan Zhang, Guangtao Zeng, Tianduo Wang, and
Wei Lu. 2024. TinyLlama: An open-source small
language model. arXiv:2401.02385.
Chujie Zheng, Hao Zhou, Fandong Meng, Jie Zhou, and
Minlie Huang. 2024. Large Language Models Are
Not Robust Multiple Choice Selectors. Proceedings
of the International Conference on Learning Repre-
sentations (ICLR).
13

<!-- chinese translation page 13 -->

**中文。** MosaicML，2024。《Mosaic Eval Gauntlet v0.3.0——评测套件》。访问日期：2024-05-29。

**中文。** Nori 等，2023。《GPT-4 在医学挑战问题上的能力》。arXiv:2303.13375。

**中文。** OpenAI，2024。《GPT-4 技术报告》。arXiv:2303.08774。

**中文。** Robinson 等，2023。《利用大语言模型进行多项选择问答》。ICLR。

**中文。** Sakaguchi 等，2020。《WinoGrande：大规模对抗性 Winograd 模式挑战》。AAAI，34(05)：8732–8740。

**中文。** Sap 等，2019。《Social IQa：关于社会互动的常识推理》。EMNLP-IJCNLP，第 4463–4473 页。

**中文。** Sclar 等，2023。《量化语言模型对提示设计中伪特征的敏感性，或：我如何开始担忧提示格式》。arXiv:2310.11324。

**中文。** Smith 等，2022。《使用 DeepSpeed 与 Megatron 训练大规模生成式语言模型 Megatron-Turing NLG 530B》。arXiv:2201.11990。

**中文。** Talmor 等，2019。《CommonsenseQA：面向常识知识的问答挑战》。NAACL-HLT，第 4149–4158 页。

**中文。** Together Computer，2023。《RedPajama：用于训练大语言模型的开放数据集》。

**中文。** Touvron 等，2023a。《LLaMA：开放且高效的基础语言模型》。arXiv:2302.13971。

**中文。** Touvron 等，2023b。《Llama 2：开放基础模型与微调聊天模型》。arXiv:2307.09288。

**中文。** Wang 等，2024。《超越答案：审视用多项选择问答评测大语言模型的合理性》。arXiv:2402.01349。

**中文。** Wiegreffe 等，2023。《提高答案选项上的概率质量并不总能提升准确率》。EMNLP，第 8392–8417 页。

**中文。** Zellers 等，2019。《HellaSwag：机器真的能续写你的句子吗？》ACL，第 4791–4800 页。

**中文。** Zhang 等，2024。《TinyLlama：开源小型语言模型》。arXiv:2401.02385。

**中文。** Zheng 等，2024。《大语言模型并非稳健的多项选择器》。ICLR。

<!-- end chinese translation page 13 -->
<!-- page 14 of 29 -->

A
FAQs
Q: Are there existing established protocols that differ from the proposed ones? Will they cause
resistance from the research community in adopting the OLMES standard?
The lack of “established protocols” is precisely the issue that our work addresses. As discussed in
our Introduction and Related work sections, existing efforts either present different variations as
open choices to users or are underspecified or under-documented (e.g., the rationale behind
default choice is unexplained) and thus not followed by others in subsequent work. Therefore,
there is no existing established protocol in the community – researchers across the field use different
evaluation setups, with reasons behind their choices left unexplained, leading to different results and
conclusions. We illustrate this in Table 1, with Table 14 showing an extended version to include
score variations across different references on OPENBOOKQA in addition to ARC-CHALLENGE.
This is the main motivation for the standard, to reconcile the differences in practices so that scores
reported in papers can be meaningfully interpreted and compared (as we show, a statement like
“score on 25-shot ARC Challenge” is woefully underspecified, whereas “score on ARC Challenge
using OLMES” is a well-defined number without any ambiguity). We also justify each decision we
make so that the community can, for the first time, appreciate the rationale behind the setups and
thus encourage broad adoption.
Q: What is novel about OLMES?
Building on the many existing works that introduce new methodologies (e.g., new way of prompting,
probability normalization, etc), OLMES is the first work of its kind to provide a completely open,
practical, reproducible, and documented evaluation standard with justified choices so that
results across research work can be meaningfully compared. This fills an important gap in current
research on LLMs – the adoption of OLMES by model developers and other researchers will
help unify evaluation practices in the field for the first time, significantly shifting current research
paradigms.
Q: Why is OLMES more principled than trying a range of settings?
Rather than having to train a model from scratch to discover patterns in task formulation, run the
different settings to choose a normalization scheme, or delve into the same literature again to study
the variants, the community can now directly build upon the various choices in OLMES.
We hope to guide the community towards more well-documented and justifiable chosen evaluation
settings like OLMES without having to go through trying a mix of less informed choices (which
we argue should be avoided altogether). Through extensive literature review and experimentation,
we observe that some settings provide better signals than others, and document them in this work to
guide the community to use them, a few examples include:
– CF gives a clearer signal early in training, which is helpful for developers to cheaply make
modeling decisions. On the other hand, MCF is a better indicator of performance later on.
CF often works better for weaker models while MCF is at random, and MCF is a better
representation of task performance for stronger models.
– Few-shot prompting is an effective and universal way to convey a task to an LLM (more stable
learning curve than 0-shot) but going beyond 5 shots generally does not provide meaningful
differences in scores.
– For probability normalization, in BOOLQ the only answer choices are “yes” or “no” which
are single tokens, therefore no length normalization is needed. Even if for some models, the
“character” normalization has slightly better performance on BOOLQ (see Table 9), one should
note that this is an accidental side effect of “yes” having one more character than “no” and
indeed a normalization which changes the probability of “yes” vs “no” simply because the “no”
token has fewer characters seem problematic.
14

<!-- chinese translation page 14 -->

### 问：是否已有不同于本文方案的成熟协议？它们会不会使研究社区抗拒采用 OLMES 标准？

**中文。** 缺少“成熟协议”恰恰是本文要解决的问题。正如引言和相关工作所讨论的，已有工作要么把不同变体作为开放选项交给用户，要么规定不充分、文档不完备——例如不解释为何选择某项默认配置——因而后续工作也不会一致沿用。社区实际上不存在统一的成熟协议：不同研究者采用不同评测配置，却不解释选择理由，最终得到不同的结果和结论。

**中文。** 表 1 展示了这一问题，表 14 则扩展到不同资料中 OPENBOOKQA 与 ARC-CHALLENGE 分数的变化。这正是制定标准的核心动机：协调实践差异，使论文报告的分数能够得到有意义的解释和比较。“25-shot ARC Challenge 上的分数”这一说法严重缺少必要信息；相比之下，“使用 OLMES 得到的 ARC Challenge 分数”则是定义清楚、没有歧义的数值。我们解释每一项决定的依据，让社区第一次能够理解这些配置背后的理由，并以此促进广泛采用。

### 问：OLMES 的创新之处是什么？

**中文。** 在已有研究提出新提示方法、概率归一化等技术的基础上，OLMES 首次给出一套完全开放、实用、可复现且有完整文档的评测标准，并为每项选择提供明确依据，使不同研究成果能够得到有意义的比较。它填补了当前大语言模型研究中的重要空白：模型开发者和其他研究者采用 OLMES 后，可以首次统一该领域的评测实践，并显著改变当前研究范式。

### 问：为什么 OLMES 比遍试一系列配置更有原则性？

**中文。** 社区不必为了重新发现任务表述规律而从头训练模型，不必遍跑各种配置只为选出一种归一化方案，也不必反复钻研同一批文献来梳理变体，；实际是可以直接建立在 OLMES 的各项选择之上。我们希望引导社区采用像 OLMES 这样文档完善、理由充分的评测配置，不再混用依据不足的尝试——我们认为这种做法应当完全避免。通过广泛的文献综述与实验，我们观察到某些配置能提供更好的信号，并在本文中予以记录。

**中文。** 例子包括：（1）CF 在训练早期给出更清晰的信号，有助于开发者以较低成本作出建模决策；MCF 则更能反映训练后期的性能。当较弱模型的 MCF 仍处于随机水平时，CF 往往表现更好；对较强模型，MCF 更能代表任务性能。（2）少样本提示是一种有效且通用的任务传达方式，其学习曲线比零样本提示更稳定，但超过 5 个样本通常不会带来有意义的分数差异。（3）BOOLQ 只有“yes”和“no”两个单词元答案，因此无需长度归一化。对某些模型，“字符”归一化可能略有优势，但这只是因为“yes”比“no”多一个字符而产生的偶然副作用；仅仅因为“no”字符更少就改变二者概率，是有问题的。

<!-- end chinese translation page 14 -->
<!-- page 15 of 29 -->

Not only are recommendations in OLMES backed by both existing literature and new experimental
results, there is also little difference between the OLMES recommendation and the empirically
best (“oracle”) normalization for each task and model, see “diff oracle” column. We argue that
adopting such an approach is a better practice than blindly optimizing for the best performance e.g.,
problematically using “character” normalization for BOOLQ.
Q: Including a broader range of datasets?
The focus on multiple-choice datasets in OLMES is motivated by their frequent use in evaluating
base LLMs, where the evaluation seems straightforward (did the model predict the right answer?)
but in practice, a statement like “model X scores Y on ARC Challenge” is generally uninterpretable
(with unspecified details and cannot be meaningfully compared across references) without a clear
evaluation standard like OLMES. In this paper, we focused on datasets chosen to provide guidance
useful for the training stage and evaluation of base models, which provides important insights into
the potential of such models before further tuning (e.g., instruction-tuning).
Note that the fundamental principles of OLMES as introduced, generalize to any dataset of interest.
Rather than viewing what we have illustrated in our paper as a fixed set, our goal is to use that as an
illustration and empower researchers to move towards reproducible evaluation by applying OLMES
to any dataset of interest suited for their own work.
Q: Evaluating on more models? What are some valuable insights from extended experiments?
We provide additional results in Appendix D, Table 13 with additional models. Evaluating different
models using OLMES provides valuable insights for understanding LLMs and model development.
For instance, within each batch of model release by developers, models of bigger size perform
better than smaller ones (see average scores of Pythia-6.7B outperforms Pythia-1B, OLMo-7B
outperforms OLMo-1B, Llama2-13B outperforms Llama2-7B, Gemma2-9B outperforms Gemma2-
2B). However, size is not the only way to get to a stronger model, evaluating on OLMES also
allow the community meaningful comparison of models to witness the effect of model improvement
via better training data, model architecture, as well as other improved approaches as researchers
iterate on their models e.g., OLMo-7B-0424’s improvement over initial OLMo-7B; Llama3-8B’s
improvement over Llama2-7B and even Llama2-13B, Mixtral-8x7B-v0.1 outperforming the Mistral
model, aligning with the insights reported in these model releases documenting their improved
recipes and innovations for better models. Further, OLMES also gives meaningful comparison
of model performance as researchers experiment to reduce computational costs, e.g., our results
align with the original DeepSeekMoE paper where they “scale up DeepSeekMoE to 16B parameters
and show that it achieves comparable performance with LLaMA2 7B, with only about 40% of
computations”. All these underscore the applicability and value of OLMES in supporting unified
evaluation as the field progress towards better models, as an open, well-documented, practical and
reproducible evaluation standard. We make all prompts, examples, and code used for OLMES openly
available, and encourage researchers to try it for any model of their interest be it one they are studying
or building.
Q: How does OLMES stay relevant in the rapid evolution of AI and LLMs?
We have been continuously looking out for new LLMs and evaluating them using OLMES, showing
that the same guiding principles still apply as best practices providing a systematic, comparable
approach. See extended evaluation results in Table 13.
As the field moves forward, we look forward to applying the principles of OLMES to more bench-
marks and evaluating newer models using OLMES. While we are working on extending OLMES,
we do not anticipate revisions to the currently established recommendations in OLMES any time
soon as the guiding principles are built on top of a rich literature of existing work over the years and
will likely remain relevant in the community for a while in the near future.
15

<!-- chinese translation page 15 -->

**中文。** OLMES 的建议不仅得到既有文献和新实验结果的共同支持，而且与针对每个任务、每个模型实证选出的最佳“预言机”归一化方案相差很小，见“diff oracle”列。我们认为，采用这种方法比盲目追求最高测量分数更合理，例如不应为了分数而在 BOOLQ 上使用存在问题的“字符”归一化。

### 问：是否应纳入范围更广的数据集？

**中文。** OLMES 聚焦多项选择数据集，是因为这类数据集经常用于评测基础大语言模型。它们看似容易评测——模型是否选中了正确答案？——但如果没有 OLMES 这样的明确标准，“模型 X 在 ARC Challenge 上得分 Y”通常无法解释，也无法与其他资料作有意义的比较，因为关键细节并未说明。本文选择的数据集旨在为训练阶段和基础模型评测提供实用指导，从而在指令微调等后续调优之前揭示模型潜力。

**中文。** OLMES 的基本原则可以推广到任何感兴趣的数据集。本文展示的任务集合不应被视为固定不变的清单；它是一种示范，旨在帮助研究者把 OLMES 应用于适合自身工作的任意数据集，进而走向可复现评测。

### 问：是否在更多模型上评测？扩展实验带来了哪些有价值的认识？

**中文。** 附录 D 的表 13 给出了更多模型的结果。使用 OLMES 评测不同模型，能为理解大语言模型和模型开发提供有价值的认识。在每批开发者发布的模型中，大模型都优于小模型：Pythia-6.7B 优于 Pythia-1B，OLMo-7B 优于 OLMo-1B，Llama2-13B 优于 Llama2-7B，Gemma2-9B 优于 Gemma2-2B。

**中文。** 规模并非获得更强模型的唯一途径。OLMES 所提供的有意义比较还能揭示更优训练数据、模型架构和其他改进方法带来的收益：OLMo-7B-0424 优于初版 OLMo-7B；Llama3-8B 优于 Llama2-7B，甚至优于 Llama2-13B；Mixtral-8x7B-v0.1 优于 Mistral。这些结果与相应模型发布材料中记录的配方改进和创新一致。

**中文。** OLMES 还能够对降低计算成本的研究进行有意义的性能比较。例如，我们的结果与 DeepSeekMoE 原论文一致：其 16B 参数模型仅使用约 40% 的计算量，就取得了与 LLaMA2 7B 相当的性能。这些结果凸显了 OLMES 的适用性与价值：随着领域不断开发更优模型，它作为开放、文档完善、实用且可复现的标准，能够支持统一评测。我们公开了 OLMES 使用的所有提示、示例和代码，并鼓励研究者在自己研究或构建的任何模型上尝试。

### 问：面对 AI 与大语言模型的快速演进，OLMES 如何保持相关性？

**中文。** 我们持续关注新大语言模型并使用 OLMES 评测，结果表明，相同的指导原则仍是提供系统、可比评测的最佳实践，详见表 13。随着领域继续发展，我们期待把 OLMES 原则应用到更多基准，并用 OLMES 评测更新的模型。尽管我们仍在扩展 OLMES，但目前建立的建议以多年积累的丰富文献为基础，因此预计短期内无需修订，并很可能在未来一段时间继续与社区密切相关。

<!-- end chinese translation page 15 -->
<!-- page 16 of 29 -->

Q: Why not use prompting techniques such as CoT or self-reflection?
While these prompting strategies have shown to be useful for instruction-tuned models, they tend
to be much less effective on base models, which is a focus of this work. E.g., some experiments
we performed with MMLU showed that various CoT prompts (both zero-shot and few-shot) have a
positive boost on instruction-tuned models (like Llama-3.1-8B-Instruct), but tend to lower the scores
a bit for base models (like Llama-3.1-8B).
Q: How do you ensure that formatting settings are fair to all models?
Supported by reviewing common evaluation practices in the community and empirical evidence
across a wide range of models, the recommendations we make are at least as reasonable and fair as
the myriad of settings that have been used in the literature.
If a model is peculiar in any specific way (e.g., only able to do multiple choice questions with one
type of answer label like “1.” or “2.”), it is not the goal of OLMES to tailor to such peculiarities as
this standard is intended to be applied across a range of models and to encourage the development of
models that produce reasonable outputs given any reasonable input.
Q: What happens when there are minor variants to OLMES?
Through OLMES, we provide best practices to evaluate language models and justify our choices. Our
choices are mostly aligned with common practices in LLM evaluations, but with defining standards
in formatting, choice of in-context examples, probability normalizations, and task formulation. In the
process, we accounted for many factors, taking into consideration the robustness of OLMES under
minor variations. We discuss some of these considerations here.
[Part 1] Order of presenting the options A/B/C/D:
The order of presenting the multiple-choice options A/B/C/D does not apply to CF since each answer
is processed independently. For MCF it is indeed a confounder that some (especially weaker) models
might highly prefer a given label (like B). The benchmarks in OLMES are generally balanced such
that such a model would not be much better than random. Further, if this happens, CF would generally
get a better score in such cases and OLMES would use that score in its final output. Therefore,
having a setting where we use both CF (not affected by the order of options) and MCF (where the
order of options may matter) makes sure the final metric will not be hugely affected by such factors.
We considered applying more rigorous measures (like running all cyclic permutations of answer
choices) but decided for practical reasons, the extra processing time and complexity were not worth
the minor improvements in robustness (as one consideration of OLMES is also to be a practical
standard that does not take unnecessarily more compute than is needed).
[Part 2] Minor variations in prompt wording or few-shot examples:
To address potential concerns on minor variations in prompt wording or few-shot examples, we
evaluated under three additional settings, while adhering to the general principles in OLMES:
Variant 1 (minor variation in prompting):
3 changes to OLMES prompt format - (1) change the label and text separator from “.” to “)”, (2)
insert an additional new line before the answer descriptor, (3) change the “Answer” descriptor to
“Correct answer”
Variant 2 (varying few-shot examples):
Create a different set of curated few-shot examples by changing 3 out of the 5 in-context examples to
new ones that are different from those in OLMES. In picking the new few-shot examples, the same
recommendations were followed to ensure diversity in the examples and that they cover the label
space.
Variant 3 (minor variation in prompting + varying few-shot examples):
Apply changes in both Variants 1 and 2 together.
16

<!-- chinese translation page 16 -->

### 问：为什么不使用思维链或自我反思等提示技术？

**中文。** 这些提示策略对指令微调模型可能有帮助，但对本文重点关注的基础模型往往远没有那么有效。例如，我们在 MMLU 上进行的一些实验表明，多种零样本和少样本思维链提示能提升 Llama-3.1-8B-Instruct 这类指令微调模型，却往往会使 Llama-3.1-8B 这类基础模型的分数略有下降。

### 问：如何确保格式设置对所有模型都公平？

**中文。** 我们的建议建立在对社区常见评测实践的审视以及跨大量模型的实证证据之上，因此至少与文献中采用的诸多配置同样合理、公平。如果某个模型具有特殊局限，例如只能用“1.”、“2.”这一类答案标签完成多项选择题，那么 OLMES 的目标并非迁就这种特殊性。该标准旨在跨多种模型应用，并鼓励开发者构建面对任何合理输入都能产生合理输出的模型。

### 问：如果对 OLMES 作小幅变动，会发生什么？

**中文。** OLMES 给出了评测语言模型的最佳实践，并解释各项选择的依据。这些选择大体上与常见大语言模型评测实践一致，同时明确规定格式、上下文示例、概率归一化和任务表述标准。在制定过程中，我们考虑了许多因素，也考察了 OLMES 面对小幅变动时的稳健性。

#### 第 1 部分：A/B/C/D 选项的呈现顺序

**中文。** 对 CF 而言，选项呈现顺序没有影响，因为每个答案都被独立处理。对 MCF 而言，顺序确实可能成为混杂因素，因为有些模型——尤其较弱模型——可能强烈偏好某个标签，例如 B。OLMES 中的基准总体保持平衡，因此这种模型的表现不会比随机猜测好多少。而且在这种情况下，CF 通常会得到更高分，OLMES 会在最终输出中采用该分数。因此，同时使用不受选项顺序影响的 CF 和可能受顺序影响的 MCF，可以确保最终指标不会受到这类因素的巨大影响。我们也考虑过更严格的措施，例如运行答案选项的全部循环排列，但出于实用性考虑，额外处理时间与复杂度并不值得其带来的少量稳健性提升；OLMES 也要避免不必要的计算开销。

#### 第 2 部分：提示措辞或少样本示例的小幅变化

**中文。** 为回应对提示措辞或少样本示例小幅变化的担忧，我们在遵守 OLMES 总体原则的前提下，又评测了三种设置。

**中文。变体 1——提示的小幅变化。** 对 OLMES 提示格式作三项修改：（1）把标签与文本之间的分隔符由“.”改为“)”；（2）在答案描述词之前增加一个换行；（3）把“Answer”描述词改为“Correct answer”。

**中文。变体 2——更换少样本示例。** 创建另一组经过筛选的少样本示例，把五个上下文示例中的三个替换为不同于 OLMES 原示例的新样例。选择新样例时继续遵守相同建议，确保示例具有多样性并覆盖整个标签空间。

**中文。变体 3——提示小幅变化并更换少样本示例。** 同时应用变体 1 和变体 2 的修改。

<!-- end chinese translation page 16 -->
<!-- page 17 of 29 -->

model
ARC_E orig
var 1
var 2
var 3
avg
diff
std err
Pythia-1B
63.4
63.3
62.7
62.7
63.0
0.4
1.5
Llama2-7B
84.0
84.4
83.4
84.4
84.0
0.0
1.2
DeepSeek-7B
80.6
80.9
80.5
80.4
80.6
0.0
1.3
Gemma2-2B
84.3†
83.2†
83.9†
82.8†
83.5
0.8
1.2
Llama3-8B
92.4†
92.5†
92.3†
93.1†
92.6
0.2
0.8
model
OBQA orig
var 1
var 2
var 3
avg
diff
std err
Pythia-1B
40.4
38.6
39.4
37.6
39.0
1.4
2.2
Llama2-7B
57.8
57.2
55.2
57.4
56.9
0.9
2.2
DeepSeek-7B
62.2†
61.0†
61.6†
63.2†
62.0
0.2
2.2
Gemma2-2B
68.8†
67.2†
68.8†
67.0†
68.0
0.8
2.1
Llama3-8B
77.2†
76.8†
78.8†
77.8†
77.7
0.5
1.9
model
PIQA orig
var 1
var 2
var 3
avg
diff
std err
Pythia-1B
68.9
69.2
69.2
69.3
69.1
0.2
1.5
Llama2-7B
77.5
77.2
77.7
77.8
77.5
0.0
1.3
DeepSeek-7B
79.3
78.8
80.9
80.6
79.9
0.6
1.3
Gemma2-2B
78.5
77.8
79.3
78.5
78.5
0.0
1.3
Llama3-8B
81.6
80.7
82.4
82.8
81.9
0.3
1.2
Table 5: Extended results comparing using OLMES (orig) and when the setting is subjected to minor variations
in prompt wording (var1), few-shot examples (var2), or both (var3). † indicates the use of MCF. The “avg” score
obtained via averaging orig, var1, var2, and var3 results is often within 1% of that obtained by the original OLMES
setup (orig). We report the observed differences between averaging the 4 setups (“avg”) and directly using OLMES
(orig) in the “diff” column, illustrating the minor differences (often <1%) do not justify the 4 times more compute
needed, against the “practical” consideration in OLMES.
We
report
these
additional
results
in
Table
5.
Following
EleutherAI
in
calculat-
ing
standard
error
(https://github.com/EleutherAI/lm-evaluation-harness/blob/
ebe7226ebfb8d11a9fb8d6b53eb65891f895c633/lm_eval/api/metrics.py#L288),
in
the
additional results, we also incorporated bounds on standard error in our evaluations using OLMES
(see “std err” column). This provides a statistical bound on the degree of variation in reported
numbers and illustrates that while any performance metric should be interpreted to have slight
variants (e.g., < 2.5%), the scenario where a model underperforms significantly due to minor variants
is unlikely statistically.
The additional results show that differences in performance between averaging variations vs. using
the OLMES setup directly were generally minimal, typically less than 1 percent (the largest difference
seen is 1.4%). This suggests that performance measured using OLMES is quite stable and consistent
when subject to small changes in prompt wording or the selection of few-shot examples, within the
general recommendations. Note that these variants still format the instances in natural ways and
are slight modifications of the original settings of OLMES, still adhering to the general principles
such as instance formatting that clarifies the task in a natural way and choice of in-context examples
to cover a range of examples and different answer labels. Larger differences would be expected
when diverging from OLMES recommendations such as by using unnatural prompts e.g., using rare
symbols as answer labels, or randomly sampled few-shot examples which could run into skewed label
distribution covered in few-shot examples or include noisy examples from train sets. We observe that
current successful language models are generally robust to the OLMES evaluation standard. OLMES
has been informed by prior efforts like HELM and Eleuther LM Evaluation Harness, therefore the
prompts are designed to be natural, and suitable for evaluating language models.
17

### 第 17 页中文译文

表 5：扩展结果，比较原始 OLMES 设置（orig）与三种小改动：提示措辞变化（var1）、少样本示例变化（var2）以及两者同时变化（var3）。`†` 表示使用 MCF。“avg”是四种设置的平均；它与原始 OLMES 分数通常相差不到 1%。`diff` 列报告平均值与原设置之差，说明这些通常低于 1% 的差异不足以抵偿四倍计算量，支持 OLMES 的实用性考虑。模型、任务、分数和标准误数字保持原表。

作者遵循 EleutherAI 的方法计算标准误，并在 `std err` 列提供界限。它说明任何性能指标都有轻微波动（如低于 2.5%），但模型仅因小改动便显著退化，在统计上不太可能。

附加结果显示，对各种变体求平均与直接使用 OLMES 的差异普遍很小，通常低于 1%，最大为 1.4%。这表明在遵循总体建议的前提下，OLMES 对提示措辞和少样本选择的小幅变化较稳定。这些变体仍以自然方式格式化实例，遵循清晰表达任务、上下文示例覆盖多种类型和答案标签等原则。

若偏离建议，例如使用罕见符号作为答案标签，或随机抽取少样本而造成标签分布偏斜、纳入训练集噪声，则预计差异更大。当前成功的语言模型总体对 OLMES 标准较稳健；其设计吸收 HELM 与 EleutherAI LM Evaluation Harness 的经验，因此提示自然且适合模型评测。
<!-- page 18 of 29 -->

B
Detailed CF and MCF task scores
Tables 6 and 7 present detailed scores across all tasks, with both MCF and CF results (using the OLMES
recommendations for CF normalization).
C
Further details on variations
In this appendix we discuss further details on how LLM evaluations can vary and the choices made in
OLMES.
C.1
Task formulation details
LLM evaluations started out using the CF approach for many tasks (Brown et al., 2020; Du et al., 2022;
Smith et al., 2022; Chowdhery et al., 2022; Lieber et al., 2021), which is a more reasonable option for
weaker models that struggle with the more natural MCF (Khatun and Brown, 2024). The task formulation
only very recently and gradually switched to the MCF approach when it became clear that the model
could utilize it, producing higher scores (Robinson et al., 2023; OpenAI, 2024; AI@Meta, 2024).
The HELM study (Liang et al., 2023) included comparisons between the MCF (“joint”) and CF
(“separate”) approaches, finding that certain models can really benefit from the MCF approach, although
among the models in the original study it was really only the Anthropic-LM v4-s3 (52B) model which
could take full advantage of it.
C.2
CF normalization details
Tables 10, 11 and 12 show detailed comparisons of CF normalization on different models, for the various
tasks.
Unlike in MCF, where the evaluation metric involves just scoring the log-likelihood corresponding to
the answer choice label (i.e., A/B/C/...), there is a choice of log-likelihood normalization (“none”, “per
token”, “per character” or “pmi”) for CF as detailed in Section 3.3.
When evaluating the GPT-3 model (Brown et al., 2020), they worked around this issue by normalizing
the log-probability by the number of tokens in the answer (similar to how loss is computed during
training). They also noted that for a few datasets, it worked markedly better to instead “normalize” by
dividing by LLM probability of the same answer string without the presence of the question (usually
by just having a generic prefix like "Answer: <answer_string>"). This can be considered a form of
pointwise-mutual-information (PMI) and was explored further in other works (Holtzman et al., 2021).
The Eleuther LM Evaluation Harness (Gao et al., 2023; Biderman et al., 2024) and some subsequent
evaluations (e.g., the Llama models (Touvron et al., 2023a)) have also used “per answer character”
normalization, using the argumentation (Gao, 2021; Biderman et al., 2024), that normalizing per token is
problematic since it depends on the tokenizer. Since the purpose of the normalization is simply to rank the
answer choices within themselves (keeping model and tokenizer fixed), this does not seem like a relevant
argument, and indeed a normalization which changes the probability of “yes” vs “no” simply because
the “no” token has fewer characters seem problematic. In practice, for tasks where answers are either
relatively long or similar in length, there are minor differences between these two length normalizations.
The HELM study (Liang et al., 2023) included comparisons between these normalization approaches
for a number of tasks and models (using the terms “separate” and “separate calibrated” for “token” and
“pmi” respectively), eventually settling on a default choice for each, not unlike the choices in the GPT-3
report (Brown et al., 2020). The Eleuther LM Evaluation Harness generally reports two metrics for
each multiple-choice task: acc (using the “none” normalization) and acc_norm (using the “character”
normalization).
C.2.1
Tasks that generally prefer CF
HELLASWAG and WINOGRANDE continue to have CF scores higher than MCF scores even for the strongest
models that can understand the MCF prompt. This somewhat surprising tendency seems correlated with
the fact that these tasks in the CF format are exactly like the language modeling task of finding the most
natural continuation of a running piece of text. Judging from the trends in the plot, it would also be
18

### 第 18 页中文译文

## B CF 与 MCF 的逐任务详细得分

表 6、7 给出所有任务的 MCF 与 CF 详细结果；CF 使用 OLMES 推荐的归一化。

## C 变体的进一步细节

本附录讨论语言模型评测为何变化，以及 OLMES 的选择。

### C.1 任务形式

早期许多评测使用 CF，它更适合难以理解自然 MCF 提示的弱模型。直到模型明显能够利用 MCF 并取得更高分后，任务形式才逐渐转向 MCF。HELM 比较了 MCF（joint）和 CF（separate），发现部分模型明显受益，但原研究中只有 Anthropic-LM v4-s3（52B）充分利用了 MCF。

### C.2 CF 归一化

表 10–12 比较不同模型和任务上的 CF 归一化。MCF 只需给答案标签 A/B/C 等的对数似然评分；CF 则必须在不归一化、按词元、按字符或 PMI 之间选择。

GPT-3 通过答案词元数归一化对数概率，类似训练损失；部分数据集更适合用没有问题时同一答案字符串的概率作校准，即近似 PMI。EleutherAI Harness 和 Llama 等评测也使用按字符归一化，理由是按词元依赖分词器。但归一化只用于同一模型与分词器内对选项排序，因此论文认为该理由并不关键；例如仅因 `no` 字符更少便改变 `yes` 与 `no` 的相对概率也有问题。答案较长或长度相近时，两种长度归一化实际差异较小。

HELM 比较这些方案，把按词元和 PMI 称为 separate 与 separate calibrated，最终为每项任务选择默认值，与 GPT-3 报告类似。EleutherAI Harness 通常为每个多项选择任务报告 `acc`（无归一化）和 `acc_norm`（按字符）。

### C.2.1 通常偏好 CF 的任务

即使对能够理解 MCF 提示的最强模型，HellaSwag 与 WinoGrande 的 CF 仍高于 MCF。这种现象可能因为两项任务的 CF 形式恰好类似语言建模：寻找连续文本最自然的续写。随着模型继续增强，MCF 是否最终超过 CF 值得持续观察。（续下页。）
<!-- page 19 of 29 -->

ARC_C
ARC_E
BoolQ
CSQA
HSwag
MMLU
model
MCF CF MCF CF MCF CF MCF CF MCF CF MCF CF
Pythia-1B
24.1 31.4 24.0 63.4 56.8 56.6 21.0 50.9 23.6 48.0 26.5 31.1
OLMo-1B
25.3 38.6 25.4 68.3 37.9 51.3 20.2 62.2 24.6 65.2 26.6 33.4
TinyLlama-1.1B 26.4 38.1 24.3 69.5 60.7 63.6 17.9 61.1 26.2 60.8 26.2 33.6
Pythia-6.7B
26.6 44.6 24.9 72.6 64.0 68.7 20.5 62.1 24.3 66.1 25.4 37.7
RPJ-INCITE-7B 28.1 45.3 25.1 78.8 64.2 72.0 19.7 69.2 23.5 72.8 29.0 40.1
StableLM2-1.6B 50.6 47.3 69.6 75.3 60.1 82.3 70.4 68.2 52.4 70.3 40.4 37.1
OLMo-7B
27.2 46.4 27.0 78.9 67.5 78.7 20.8 70.8 25.0 78.1 28.3 40.5
MPT-7b
27.9 45.7 27.5 78.0 44.6 82.4 20.9 70.9 26.4 79.6 30.0 40.6
Falcon-7B
27.2 49.7 25.3 80.6 48.1 78.2 20.2 73.4 27.7 79.0 28.0 42.1
Llama2-7B
52.6 54.2 70.6 84.0 57.5 86.1 59.2 74.2 41.4 78.9 46.2 44.4
Llama2-13B
67.3 56.2 85.0 85.9 77.8 86.7 68.1 74.0 62.4 83.9 55.8 47.6
OLMo-7B-0424
66.9 51.2 83.6 81.5 82.0 85.9 85.8 70.4 50.0 80.1 54.4 42.4
Llama3-8B
79.3 57.1 92.4 86.6 84.8 87.5 73.9 69.9 63.8 81.8 66.6 51.1
Mistral-7B-v0.1
78.6 59.6 90.8 86.8 87.2 89.3 72.4 72.3 71.5 83.0 64.0 50.3
Llama3-70B
93.7 69.0 97.7 89.6 91.7 91.2 83.2 75.8 89.1 89.5 79.8 60.7
Table 6: Comparing MCF and CF scores on each task (part 1). Weaker models at the top of the table have
near-random MCF scores, while for stronger models at the bottom, the MCF score provides a better assessment
than the CF score.
OBQA
PIQA
SIQA
WinoG
average scores
model
MCF CF MCF CF MCF CF MCF CF MCF CF
all
max
Pythia-1B
26.0 40.4 52.2 68.9 33.5 46.4 50.4 52.7 33.8 49.0 41.4 49.0
OLMo-1B
28.0 47.6 50.6 74.1 32.8 51.5 51.1 59.3 32.3 55.1 43.7 55.1
TinyLlama-1.1B 25.6 45.0 50.2 71.7 34.9 50.4 50.0 60.1 34.2 55.4 44.8 55.4
Pythia-6.7B
26.2 50.4 51.2 74.9 33.5 51.7 49.6 62.3 34.6 59.1 46.9 59.1
RPJ-INCITE-7B 22.6 49.0 53.5 75.9 33.7 56.6 52.1 68.0 35.1 62.8 49.0 62.8
StableLM2-1.6B 56.6 51.0 62.8 75.6 64.3 61.1 53.5 65.7 58.1 63.4 60.7 65.1
OLMo-7B
27.0 55.8 57.2 78.5 35.1 56.5 50.4 68.5 36.6 65.3 50.9 65.3
MPT-7b
29.6 52.4 53.8 79.2 34.4 57.4 51.1 70.2 34.6 65.6 50.1 65.6
Falcon-7B
27.8 55.2 50.5 79.0 33.9 60.1 49.0 71.3 33.8 66.9 50.3 66.9
Llama2-7B
54.8 57.8 63.2 77.5 58.7 59.6 52.4 71.7 55.7 68.8 62.2 69.0
Llama2-13B
65.4 60.8 74.0 80.2 65.9 63.6 56.1 74.9 67.8 71.4 69.6 74.0
OLMo-7B-0424
68.6 59.8 65.6 80.3 76.1 54.9 56.2 73.6 68.9 68.0 68.5 75.5
Llama3-8B
77.2 56.2 77.3 81.6 70.2 62.6 61.6 76.2 74.7 71.0 72.9 78.7
Mistral-7B-v0.1
80.6 61.0 79.0 82.8 71.3 63.0 59.8 77.9 75.5 72.6 74.1 79.1
Llama3-70B
93.4 69.0 91.6 83.1 78.9 65.6 79.6 84.1 87.9 77.8 82.8 88.4
Table 7: Comparing MCF and CF scores on each task (part 2), along with overall averages. The “max” average
corresponds to the OLMES score, taking the best of MCF and CF for each task.
19

### 第 19 页中文译文

表 6：逐任务比较 MCF 与 CF 得分（第一部分）。表格顶部的较弱模型，其 MCF 得分接近随机；对底部较强模型，MCF 比 CF 提供更好的能力评估。任务、模型和全部数值保持原表。

表 7：逐任务比较 MCF 与 CF 得分（第二部分），并给出总体平均。“max”平均即 OLMES 分数：每个任务取 MCF 与 CF 中较高者。全部模型、任务缩写与数字保持原样。
<!-- page 20 of 29 -->

model
MCF-macro MCF-micro CF-macro CF-micro
Pythia-6.7B
25.4
25.2
37.7
37.5
TinyLlama-1.1B
26.2
25.7
33.6
33.5
Pythia-1B
26.5
26.4
31.1
31.2
OLMo-1B
26.6
26.3
33.4
33.6
Falcon-7B
28.0
27.7
42.1
41.9
OLMo-7B
28.3
28.3
40.5
40.7
RPJ-INCITE-7B
29.0
28.4
40.1
40.1
MPT-7b
30.0
29.3
40.6
40.6
StableLM2-1.6B
40.4
39.6
37.1
37.0
Llama2-7B
46.2
45.5
44.4
44.3
OLMo-7B-0424
54.4
52.8
42.4
42.4
Llama2-13B
55.8
55.5
47.6
47.1
Mistral-7B-v0.1
64.0
63.0
50.3
49.8
Llama3-8B
66.6
65.4
51.1
50.8
Llama3-70B
79.8
79.2
60.7
60.5
Table 8: Macro vs micro average scores on MMLU, where macro average is over the 57 tasks and micro average is
over the 14042 individual questions. In general there are small differences between the two.
ARC_C ARC_E
BoolQ
CSQA
HSwag MMLU OBQA
PIQA
SIQA
model
pmi diff char diff none diff pmi diff char diff char diff pmi diff char diff char diff
Pythia-1B
31.4 0.0 63.4 0.0 56.6 4.5 50.9 0.0 48.0 0.0 31.1 1.2 40.4 0.0 68.9 1.4 46.4 0.0
OLMo-1B
38.6 0.0 68.3 0.2 51.3 4.7 62.2 0.0 65.2 0.0 33.4 0.8 47.6 0.0 74.1 0.0 51.5 0.0
TinyLlama-1.1B 38.1 0.0 69.5 0.0 63.6 2.2 61.1 0.0 60.8 0.0 33.6 0.9 45.0 0.0 71.7 0.6 50.4 0.0
Pythia-6.7B
44.6 0.0 72.6 0.0 68.7 0.0 62.1 0.2 66.1 0.0 37.7 0.2 50.4 0.0 74.9 0.0 51.7 1.1
RPJ-INCITE-7B 45.3 0.0 78.8 0.0 72.0 2.5 69.2 0.2 72.8 0.0 40.1 0.8 49.0 0.0 75.9 0.1 56.6 0.0
MPT-7b
45.7 0.6 78.0 0.0 82.4 0.0 70.9 0.0 79.6 0.0 40.6 0.0 52.4 0.0 79.2 0.0 57.4 0.0
Falcon-7B
49.7 0.0 80.6 0.0 78.2 0.6 73.4 0.0 79.0 0.0 42.1 0.0 55.2 0.0 79.0 0.2 60.1 0.0
OLMo-7B
46.4 0.0 78.9 0.0 78.7 0.0 70.8 0.0 78.1 0.0 40.5 0.1 55.8 0.0 78.5 0.8 56.5 0.0
StableLM2-1.6B 47.3 0.0 75.3 0.0 82.3 0.0 68.2 0.0 70.3 0.0 37.1 1.5 51.0 0.0 75.6 0.3 61.1 0.0
Llama2-7B
54.2 0.0 84.0 0.0 86.1 0.0 74.2 0.0 78.9 0.0 44.4 0.4 57.8 0.0 77.5 0.2 59.6 0.0
OLMo-7B-0424 51.2 0.0 81.5 0.0 85.9 0.0 70.4 1.1 80.1 0.0 42.4 0.0 59.8 0.0 80.3 0.0 54.9 0.8
Llama2-13B
56.2 0.9 85.9 0.0 86.7 1.5 74.0 0.0 83.9 0.0 47.6 0.0 60.8 0.0 80.2 0.0 63.6 0.0
Llama3-8B
57.1 1.3 86.6 0.0 87.5 0.3 69.9 4.3 81.8 0.0 51.1 0.0 56.2 0.0 81.6 0.0 62.6 0.0
Mistral-7B-v0.1 59.6 0.6 86.8 0.0 89.3 0.0 72.3 2.1 83.0 0.0 50.3 0.0 61.0 0.0 82.8 0.0 63.0 0.0
Llama3-70B
69.0 0.0 89.6 0.8 91.2 0.5 75.8 1.3 89.5 0.0 60.7 0.0 69.0 0.0 83.1 0.1 65.6 0.0
Table 9: Normalization details, showing that our recommendations are not only supported by reasoning using
principles behind the normalization but also close to the empirically best normalization that lets you get the highest
accuracy for each model on each task (see “diff” columns).
ARC_C
ARC_E
BoolQ
model
none char
tok
pmi best none char
tok
pmi
best none char
tok
pmi
best
Pythia-1B
26.1 28.4 29.0 31.4 pmi 61.9 63.4 60.9 56.5 char
56.6 61.1 56.6 41.0 char
OLMo-1B
32.9 34.4 34.7 38.6 pmi 68.5 68.3 65.8 60.2 none 51.3 56.0 51.3 42.3 char
TinyLlama-1.1B 31.5 34.1 32.2 38.1 pmi 68.6 69.5 64.4 60.4 char
63.6 65.8 63.6 53.6 char
Pythia-6.7B
36.3 39.5 39.0 44.6 pmi 71.4 72.6 70.0 64.1 char
68.7 66.9 68.7 47.6 none
RPJ-INCITE-7B 40.3 43.5 42.9 45.3 pmi 76.1 78.8 75.9 70.1 char
72.0 74.5 72.0 72.4 char
MPT-7b
41.7 46.3 44.7 45.7 char 76.3 78.0 76.2 68.5 char
82.4 79.9 82.4 76.7 none
Falcon-7B
41.6 47.4 47.6 49.7 pmi 77.0 80.6 78.3 69.8 char
78.2 78.8 78.2 77.6 char
OLMo-7B
41.6 45.5 45.0 46.4 pmi 76.7 78.9 77.4 69.6 char
78.7 77.7 78.7 78.6 none
StableLM2-1.6B 42.2 44.3 44.9 47.3 pmi 73.3 75.3 74.4 70.0 char
82.3 82.0 82.3 76.1 none
Llama2-7B
48.4 52.0 50.2 54.2 pmi 81.4 84.0 81.0 74.7 char
86.1 85.6 86.1 80.5 none
OLMo-7B-0424
45.5 49.3 48.5 51.2 pmi 79.2 81.5 79.7 71.1 char
85.9 83.8 85.9 85.6 none
Llama2-13B
52.4 57.1 54.2 56.2 char 83.9 85.9 82.8 77.6 char
86.7 88.2 86.7 77.5 char
Llama3-8B
53.6 58.4 56.8 57.1 char 85.8 86.6 85.8 76.6 char
87.5 87.8 87.5 67.0 char
Mistral-7B-v0.1
56.1 60.2 58.9 59.6 char 84.7 86.8 84.6 78.6 char
89.3 89.1 89.3 89.2 none
Llama3-70B
65.7 69.0 67.7 69.0 char 89.7 89.6 90.4 82.6
tok
91.2 90.4 91.2 91.7
pmi
average scores
43.7 47.3 46.4 49.0 NA
77.0 78.7 76.5 70.0
NA
77.4 77.8 77.4 70.5
NA
win percentage
0.0
33.3
0.0
66.7 pmi
6.7
86.7
6.7
0.0
char 46.7 46.7
0.0
6.7
none
Table 10: Comparing CF normalization schemes (part 1).
20

### 第 20 页中文译文

表 8：MMLU 宏平均与微平均。宏平均先对 57 个任务求平均；微平均直接对 14,042 个问题求平均。两者通常差异很小，表中模型和数值保持原样。

表 9：归一化细节。结果表明，作者的推荐不仅有归一化原则作为依据，也接近对每个模型、每个任务经验上能得到最高准确率的方案；`diff` 列表示与逐项经验最优值的差距。

表 10：CF 归一化方案比较（第一部分）。`none`、`char`、`tok`、`pmi` 分别表示不归一化、按字符、按词元和基于点互信息归一化；`best` 标出该模型—任务组合的最高方案。平均分与胜率按原表保留。
<!-- page 21 of 29 -->

CSQA
HSwag
MMLU
model
none char
tok
pmi
best none
char
tok
pmi
best none char
tok
pmi best
Pythia-1B
47.7 50.9 47.3 50.9 char
39.2
48.0
47.8 41.0 char
29.5 31.1 30.8 32.3 pmi
OLMo-1B
56.8 60.0 57.6 62.2 pmi
50.9
65.2
64.1 49.8 char
31.7 33.4 33.3 34.2 pmi
TinyLlama-1.1B 58.9 60.5 55.9 61.1 pmi
46.9
60.8
59.7 48.5 char
31.2 33.6 33.0 34.5 pmi
Pythia-6.7B
59.5 62.2 58.9 62.1 char
50.4
66.1
65.9 53.5 char
34.9 37.7 37.0 37.9 pmi
RPJ-INCITE-7B 67.7 69.4 67.2 69.2 char
55.7
72.8
71.8 60.6 char
37.4 40.1 40.0 40.9 pmi
MPT-7b
69.6 70.3 69.1 70.9 pmi
60.5
79.6
76.5 61.5 char
37.8 40.6 40.1 40.4 char
Falcon-7B
70.0 70.3 69.5 73.4 pmi
60.7
79.0
78.4 60.0 char
39.3 42.1 41.9 42.1 char
OLMo-7B
69.0 70.0 67.9 70.8 pmi
59.3
78.1
76.3 64.2 char
37.9 40.5 40.5 40.6 pmi
StableLM2-1.6B 63.6 66.3 65.6 68.2 pmi
54.7
70.3
69.7 56.4 char
35.2 37.1 37.1 38.6 pmi
Llama2-7B
70.5 72.7 68.4 74.2 pmi
61.9
78.9
77.1 64.4 char
42.0 44.4 43.9 44.8 pmi
OLMo-7B-0424
71.6 63.5 59.0 70.4 none 61.4
80.1
77.7 65.2 char
39.9 42.4 42.2 41.8 char
Llama2-13B
72.2 72.7 68.4 74.0 pmi
63.7
83.9
81.0 70.3 char
44.3 47.6 46.7 47.1 char
Llama3-8B
72.0 74.2 73.5 69.9 char
62.8
81.8
80.3 71.1 char
47.5 51.1 50.8 49.6 char
Mistral-7B-v0.1
73.1 73.8 74.4 72.3
tok
64.5
83.0
81.0 70.3 char
46.9 50.3 50.0 49.0 char
Llama3-70B
77.1 77.1 77.1 75.8 char
70.3
89.5
87.1 80.8 char
57.2 60.7 60.5 59.4 char
average scores
66.6 67.6 65.3 68.4
NA
57.5
74.5
73.0 61.2
NA
39.5 42.2 41.9 42.2 NA
win percentage
6.7
33.3
6.7
53.3 pmi
0.0
100.0
0.0
0.0
char
0.0
46.7
0.0
53.3 pmi
Table 11: Comparing CF normalization schemes (part 2)
OBQA
PIQA
SIQA
model
none char
tok
pmi
best none char
tok
pmi
best none char
tok
pmi
best
Pythia-1B
20.2 28.6 30.4
40.4
pmi 70.3 68.9 68.8 60.1 none 42.8 46.4 46.0 44.4 char
OLMo-1B
26.0 33.0 38.4
47.6
pmi 73.2 74.1 73.2 59.9 char
45.3 51.5 49.9 47.3 char
TinyLlama-1.1B 24.4 34.8 35.8
45.0
pmi 72.1 71.7 72.3 62.0
tok
45.6 50.4 48.2 48.4 char
Pythia-6.7B
25.8 37.0 37.4
50.4
pmi 74.8 74.9 74.3 63.6 char
48.0 51.7 52.8 49.2
tok
RPJ-INCITE-7B 31.8 40.0 42.8
49.0
pmi 74.9 75.9 76.0 61.9
tok
50.8 56.6 56.0 52.2 char
MPT-7b
31.6 43.8 43.8
52.4
pmi 77.7 79.2 78.1 63.7 char
51.0 57.4 55.9 52.5 char
Falcon-7B
35.2 45.8 44.4
55.2
pmi 78.3 79.0 79.2 63.2
tok
52.9 60.1 57.5 54.4 char
OLMo-7B
33.2 42.8 45.0
55.8
pmi 78.2 78.5 79.3 65.2
tok
50.3 56.5 56.5 52.8 char
StableLM2-1.6B 34.4 41.6 45.2
51.0
pmi 75.2 75.6 75.9 63.6
tok
52.7 61.1 60.7 56.1 char
Llama2-7B
33.8 44.6 45.0
57.8
pmi 76.7 77.5 77.7 62.9
tok
52.6 59.6 58.3 53.6 char
OLMo-7B-0424
37.2 48.4 49.6
59.8
pmi 78.5 80.3 79.3 66.3 char
53.5 54.9 54.3 55.7 pmi
Llama2-13B
39.2 46.4 48.4
60.8
pmi 78.9 80.2 79.8 66.4 char
56.7 63.6 60.7 56.8 char
Llama3-8B
37.0 47.6 50.0
56.2
pmi 79.7 81.6 81.1 67.5 char
54.6 62.6 60.1 56.4 char
Mistral-7B-v0.1
38.2 48.4 50.0
61.0
pmi 80.8 82.8 81.3 67.4 char
55.6 63.0 60.9 57.5 char
Llama3-70B
47.0 55.0 56.6
69.0
pmi 82.8 83.1 83.2 68.3
tok
59.7 65.6 64.8 57.3 char
average scores
33.0 42.5 44.2
54.1
NA
76.8 77.6 77.3 64.1
NA
51.5 57.4 56.2 53.0
NA
win percentage
0.0
0.0
0.0
100.0 pmi
6.7
46.7 46.7
0.0
char
0.0
86.7
6.7
6.7
char
Table 12: Comparing CF normalization schemes (part 3).
21

### 第 21 页中文译文

表 11：CF 归一化方案比较（第二部分），覆盖 CSQA、HellaSwag 与 MMLU。不同任务的经验最佳归一化不同：HellaSwag 强烈偏向字符归一化，而 CSQA、MMLU 在字符与 PMI 之间变化。表中所有数值原样保留。

表 12：CF 归一化方案比较（第三部分），覆盖 OpenBookQA、PIQA 与 SIQA。OpenBookQA 几乎一致偏向 PMI，PIQA 与 SIQA 更常偏向字符或词元归一化。这说明不存在对所有任务都最优的单一 CF 归一化方法。
<!-- page 22 of 29 -->

interesting to monitor if as even more capable models are developed, the MCF scores will eventually
surpass that of the CF scores (given how close they already get to each other).
C.2.2
Hybrid formulation
In CF, overall probability score could be quite misleading since it may heavily favor shorter answers with
fewer tokens. Note that this would be different if the answer choices are actually listed before scoring the
answer string, then most tokens (after the choice has been disambiguated by the first few tokens) would
have probability near one. This “hybrid” formulation has been used in some cases, but usually scores
in between the CF and MCF approaches (Wiegreffe et al., 2023). However, this hybrid approach is not
popular in evaluation standardization efforts like the Open LLM Leaderboard, HELM, or when used to
evaluate models during development, so it is not a focus in OLMES.
C.3
Tokenization of MCQA choice labels
When formatting multiple-choice questions, OLMES specifies the use of a prefix space in front of each
answer choice, that is "\n A. <choice>" rather than "\nA. <choice>". Figure 3 shows explicit
examples of tokenizers where this helps maintain a correspondence between the token for the answer label
and the token in the final answer (e.g., "\nAnswer: A"). E.g., for the Llama tokenizer, the consistent
token is the "_A" rather than the separate token "A" you get without the prefix space.
> from transformers import AutoTokenizer
> llama_tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")
> olmo_tokenizer = AutoTokenizer.from_pretrained("allenai/OLMo-7B-0424-hf")
> test_string = "What is 3+4?\n A. 7\nA. 7\nAnswer: A"
> llama_tokenizer.tokenizer(test_string)
[’_What’, ’_is’, ’_’, ’3’, ’+’, ’4’, ’?’, ’<0x0A>’, ’_A’, ’.’, ’_’, ’7’, ’<0x0A>’, ’A’, ’.’, ’_’,
’7’, ’<0x0A>’, ’Answer’, ’:’, ’_A’]
> olmo_tokenizer.tokenizer(test_string)
[’What’, ’˙Gis’, ’˙G3’, ’+’, ’4’, ’?’, ’˙C’, ’˙GA’, ’.’, ’˙G7’, ’˙C’, ’A’, ’.’, ’˙G7’, ’˙C’, ’Answer’,
’:’, ’˙GA’]
Figure 3: Tokenizer example, showing two examples of tokenizers which need a prefix space before MCQA answer
choice labels to represent the choice label and the final answer label using the same token.
D
Extended OLMES result table
Table 13 shows OLMES evaluations across an extended set of 40 models. Table 14 shows an extended
version of Table 1 which includes score variations across different references on OPENBOOKQA in addition
to ARC-CHALLENGE.
E
HELM Reproduction of MMLU
In Figure 4 we see data taken from HELM’s reproduction of MMLU scores for a variety of models.
F
Compute used
The inference on the models evaluated were done on NVIDIA RTX A6000 GPUs. A total of around 400
GPU hours was used.
G
Curation of 5-shot examples: considerations
Procedure for manually curating the few-shot examples:
• Download the train set from Hugging Face datasets
• Start from the beginning of the training set, looking at a batch of 10 (i.e., start with first 10)
22

### 第 22 页中文译文

随着更强模型出现，值得继续观察 MCF 是否最终超过 CF，因为二者已经越来越接近。

### C.2.2 混合形式

CF 的整体概率会明显偏向词元更少的短答案。若先列出选项再给答案字符串评分，情况会不同：最初几个词元消除歧义后，后续多数词元概率会接近 1。这种“混合”形式已有使用，得分通常介于 CF 与 MCF 之间。但 Open LLM Leaderboard、HELM 等标准化评测以及模型开发期评测并不常用，因此 OLMES 不把它作为重点。

### C.3 多项选择答案标签的分词

OLMES 规定答案选项标签前加一个空格，即使用 `\n A. <choice>` 而并非 `\nA. <choice>`。图 3 展示两个分词器示例：前置空格能让选项标签与最终答案中的标签使用同一词元。例如 Llama 分词器中，一致的词元是带空格的 `_A`，而无前置空格时会得到独立的 `A`。代码和词元序列保持英文原样。

图 3：分词器示例，说明某些分词器需要在多项选择标签前加空格，才能以同一词元表示选项标签和最终答案标签。

## D 扩展 OLMES 结果表

表 13 给出扩展至 40 个模型的 OLMES 评测。表 14 是表 1 的扩展版，除 ARC-Challenge 外还纳入不同参考来源对 OpenBookQA 的分数差异。

## E HELM 对 MMLU 的复现

图 4 展示 HELM 对多种模型 MMLU 分数的复现数据。

## F 计算资源

模型推理使用 NVIDIA RTX A6000 GPU，总计约 400 GPU 小时。

## G 五样本示例整理：注意事项

人工整理少样本示例的流程：从 Hugging Face datasets 下载训练集；从训练集开头开始，每次查看 10 条（即先看前 10 条）。（续下页。）
<!-- page 23 of 29 -->

model
ARC_C ARC_E BoolQ CSQA HSwag MMLU OBQA PIQA SIQA WinoG average
Pythia-1B
31.4
63.4
56.8† 50.9
48.0
31.1
40.4
68.9 46.4
52.7
49.0
OLMo-1B-0724
36.4
53.5
66.8
42.4
67.5
32.0
44.2
74.0 45.2
62.9
52.5
OLMo-1B
38.6
68.3
51.3
62.2
65.2
33.4
47.6
74.1 51.5
59.3
55.1
TinyLlama-1.1B
38.1
69.5
63.6
61.1
60.8
33.6
45.0
71.7 50.4
60.1
55.4
Qwen2-0.5B
48.4†
64.9†
64.3
56.2
48.9
45.3† 51.6† 67.9 54.7†
56.1
55.8
Llama3.2-1B
43.5
71.6
69.4
59.6
67.3
38.2
42.0
73.7 52.0
62.5
58.0
Pythia-6.7B
44.6
72.6
68.7
62.1
66.1
37.7
50.4
74.9 51.7
62.3
59.1
RPJ-INCITE-7B
45.3
78.8
72.0
69.2
72.8
40.1
49.0
75.9 56.6
68.0
62.8
Gemma-2B
49.9
80.2
76.6
68.9
72.5
41.7†
52.4
76.1 57.1
66.1
64.2
StableLM2-1.6B
50.6†
75.3
82.3 70.4†
70.3
40.4† 56.6† 75.6 64.3†
65.7
65.1
OLMo-7B
46.4
78.9
78.7
70.8
78.1
40.5
55.8
78.5 56.5
68.5
65.3
MPT-7b
45.7
78.0
82.4
70.9
79.6
40.6
52.4
79.2 57.4
70.2
65.6
Zamba2-1.2B
55.0†
85.4
76.1
70.1
73.4
44.7† 59.8† 76.6 58.4
67.2
66.7
Falcon-7B
49.7
80.6
78.2
73.4
79.0
42.1
55.2
79.0 60.1
71.3
66.9
DCLM-1B
57.6†
79.5
80.9
71.3
75.1
48.5† 60.0† 76.6 60.5†
68.1
67.8
DeepSeek-MoE-16B
53.4
82.7
81.9
72.7
80.4
45.5†
58.4
80.1 59.9
73.2
68.8
Llama2-7B
54.2
84.0
86.1
74.2
78.9
46.2†
57.8
77.5 59.6
71.7
69.0
DeepSeek-7B
57.2†
80.6
84.8
74.0
80.4
48.7† 62.2† 79.3 65.1†
72.5
70.5
Qwen2-1.5B
68.6†
85.2†
75.3 72.0†
67.6
56.5† 74.6† 75.7 65.3†
64.5
70.5
OLMoE-1B-7B-0924
62.1†
84.2
79.2
72.9
80.0
54.1† 65.4† 79.8 63.0†
70.2
71.1
Gemma2-2B
67.5†
84.3†
83.6 66.4†
74.6
53.3† 68.8† 78.5 64.7†
71.8
71.3
Llama3.2-3B
69.6†
85.1†
78.3
69.0
77.0
57.8† 67.2† 77.4 64.9†
69.9
71.6
JetMoE-8B
61.4†
81.9†
85.7 75.3†
81.7
49.1† 68.0† 80.3 71.3†
70.7
72.5
Llama2-13B
67.3†
85.9
86.7
74.0
83.9
55.8† 65.4† 80.2 65.9†
74.9
74.0
OLMo-7B-0424
66.9†
83.6†
85.9 85.8†
80.1
54.4† 68.6† 80.3 76.1†
73.6
75.5
OLMo-7B-0724
68.0†
85.7†
85.3 85.4†
80.5
54.9† 67.6† 79.3 76.1†
73.2
75.6
DeepSeek-V2-Lite
74.0†
88.9†
84.7
73.8
81.9
58.8† 72.4† 80.2 69.1†
74.0
75.8
Qwen1.5-MoE-A2.7B 77.4†
91.6†
85.0 81.4†
80.0
62.4† 80.6† 81.0 74.1†
72.3
78.6
Llama3-8B
79.3†
92.4†
87.5 73.9†
81.8
66.6† 77.2† 81.6 70.2†
76.2
78.7
Mistral-7B-v0.3
78.3†
91.1†
88.4 72.7†
83.1
63.5† 80.0† 81.9 71.2†
77.7
78.8
Llama3.1-8B
79.5†
91.7†
88.5 74.3†
81.6
66.9† 78.6† 81.1 71.4†
76.6
79.0
Mistral-7B-v0.1
78.6†
90.8†
89.3 72.4†
83.0
64.0† 80.6† 82.8 71.3†
77.9
79.1
DCLM-7B
79.8†
92.3†
87.0
77.0
82.3
64.4† 79.6† 80.1 71.2†
77.3
79.1
Qwen2-7B
88.1†
95.3†
88.9 81.2† 86.4†
71.8† 88.2† 86.0† 78.0†
75.1
83.9
Gemma2-9B
89.5†
95.5†
89.4 78.8† 87.3†
70.6† 88.4† 86.1† 76.0†
78.8
84.0
Mixtral-8x7B-v0.1
87.1†
96.1† 90.0† 78.3†
86.7
71.9† 87.0† 86.1† 75.1†
82.6
84.1
Zamba2-7B
92.2†
96.7†
89.3 84.0† 89.4†
68.5† 84.2† 86.5† 77.7†
79.6
84.8
Llama3.1-70B
92.8†
97.4†
91.9 81.7†
89.4
79.1† 92.6† 91.2† 80.6†
84.5
88.1
Llama3-70B
93.7†
97.7† 91.7† 83.2†
89.5
79.8† 93.4† 91.6† 78.9†
84.1
88.4
Qwen2.5-72B
95.5†
98.8† 91.9† 89.7† 97.5†
85.3† 97.4† 94.0† 82.2† 84.3†
91.7
Table 13: Extended reproducible performance scores across models and tasks using OLMES, providing robust,
meaningful comparisons across a wide range of models and tasks. † indicates use of the MCF score.
23

### 第 23 页中文译文

表 13：使用 OLMES 在扩展的模型与任务集合上得到的可复现性能分数，为广泛模型和任务提供稳健、有意义的比较。`†` 表示该项使用 MCF 分数。模型、任务缩写、排序和全部数字保持英文表格原样。
<!-- page 24 of 29 -->

ARC-CHALLENGE Evaluations:
OPENBOOKQA Evaluations:
Model↓
Ref1 Ref2 Ref3 Ref4 Ref5 Ref6 OLMES
Ref2 Ref4 Ref5 Ref7 Ref8 OLMES
MPT-7B
47.7 42.6
46.5
45.7
51.4
48.6
52.4
RPJ-INCITE-7B 46.3
42.8
45.3
49.4
49.0
Falcon-7B
47.9 42.4
44.5 47.5
49.7
51.6 44.6 53.0
26.0†
55.2
Mistral-7B
60.0
55.5 54.9
78.6†
52.2 77.6†
80.6†
Llama2-7B
53.1 45.9 43.2 45.9 48.5 53.7†
54.2
58.6 58.6 48.4 58.6 54.4†
57.8
Llama2-13B
59.4 49.4 48.8 49.4
67.6†
67.3†
57.0 57.0
57.0 63.4†
65.4†
Llama3-8B
60.2
78.6†
79.3†
76.6†
77.2†
Num shots
25
0
0
0
0
25
5
0
0
0
0
5
5
Curated shots
No
No
Yes
No
Yes
Formulation
CF
CF
CF?
CF
CF MCF MCF/CF
CF
CF
CF
CF MCF MCF/CF
Normalization
char char
?
char? pmi none none/pmi
pmi pmi? pmi pmi? none none/pmi
Ref
Reference citation
Ref
Reference citation
Ref1 HF Open LLM Leaderboard (Beeching et al., 2023)
Ref5 OLMo paper (Groeneveld et al., 2024)
Ref2 Llama2 paper (Touvron et al., 2023a)
Ref6 Llama3 model card (AI@Meta, 2024)
Ref3 Mistral 7B (Jiang et al., 2023)
Ref7 Gemma paper (Gemma Team et al., 2024)
Ref4 Falcon paper (Almazrouei et al., 2023)
Ref8 HELM Lite Leaderboard (Liang et al., 2023)
Table 14: Extended version of Table 1 showing scores reported in different references for LLM performances on
ARC-CHALLENGE and OPENBOOKQA. Scores indicated with † are using multiple-choice formulation (MCF) rather
than “cloze” formulation (CF) (see Section 2.1 for definitions). Entries with “?” denote either undocumented or
mixed approaches across models. Different references use different evaluation setups, some of which are not fully
specified, so conclusions about which models perform best are not reproducible.
Self-Reported MMLU Score
Self-Reported Score - Reproduction Score
-2
0
2
4
6
30
40
50
60
70
80
Trendline for series 1 R² = 0.26
Self-reporting overestimates MMLU score compared to reproduction
Figure 4: Self-reporting overestimates MMLU score compared to reproduction, from https://crfm.stanford.
edu/2024/05/01/helm-mmlu.html. Each point corresponds to a model, the x-axis shows self-reported MMLU
score, and the y-axis shows the difference between the self-reported score and the reproduced score. Points above
the y=0 line have higher self-reported performance than the reproduction; the trend line has a positive slope,
indicating that on average, the higher the self-reported score the more they overestimate performance compared to
the reproduction.
24

### 第 24 页中文译文

表 14：表 1 的扩展版本，汇总不同参考来源所报告的 ARC-CHALLENGE 与 OPENBOOKQA 模型成绩。带 `†` 的分数采用多项选择形式 MCF，而非完形填空形式 CF；带 `?` 的条目表示方法未记录，或不同模型混用了多种方法。表中同时记录样本数、是否人工整理示例、任务形式、归一化方式及参考来源。由于不同来源使用不同评测设置，且部分设置没有完整说明，无法复现“哪个模型最好”的结论。模型名称、分数、脚注和全部数字保持原样。

参考来源包括 Hugging Face Open LLM Leaderboard、Llama 2 论文、Mistral 7B、Falcon、OLMo 论文、Llama 3 模型卡、Gemma 论文与 HELM Lite Leaderboard，引用信息保持英文。

图 4：自报 MMLU 分数相较复现结果存在高估。每个点对应一个模型；横轴为模型自报 MMLU 分数，纵轴为自报分数减去复现分数。位于 $y=0$ 上方的点表示自报成绩高于复现；趋势线斜率为正，$R^2=0.26$，说明平均而言，自报成绩越高，相对复现成绩的高估越明显。数据来源链接保持原文。
<!-- page 25 of 29 -->

Prompt
Question: George wants to warm his hands quickly by rubbing them. Which skin surface
will produce the most heat?
Answer: dry palms
Question: Which of the following statements best explains why magnets usually stick to
a refrigerator door?
Answer: The refrigerator door contains iron.
Question: A fold observed in layers of sedimentary rock most likely resulted from the
Answer: converging of crustal plates.
Question: Which of these do scientists offer as the most recent explanation as to why
many plants and animals died out at the end of the Mesozoic era?
Answer: impact of an asteroid created dust that blocked the sunlight
Question: Which of the following is a trait that a dog does NOT inherit from its parents?
Answer: the size of its appetite
Question: A boat is acted on by a river current flowing north and by wind blowing on its
sails. The boat travels northeast. In which direction is the wind most likely applying
force to the sails of the boat?
Answer:
Completion
east
Figure 5: OLMES 5-shot prompt example for ARC-CHALLENGE (CF).
• Skip ambiguous instances
• Skip instances that hint at discrimination or otherwise deemed inappropriate
• Skip instances if the same label has appeared frequently (e.g., 4 consecutive instances with gold label
‘C’, keep better ones out of those)
• If instances are grouped/labeled by topic, choose instances to be diverse (e.g., first 3 are all about a
certain topic, pick from later ones to ensure diversity).
• If you end up with less than 7 instances that cover the label space or range of different topics, look at
the next batch of 10.
• Finally, reorder instances to obtain a somewhat balanced output of answer labels – the first 5 shots
should cover the space of answer labels.
Note that a few more than 5 shots per dataset were curated in the process, though in practice we are just
using the first 5.
H
OLMES prompt formats for each task
In Figure 5 we show an example of a full 5-shot prompt from ARC-CHALLENGE (CF). Then we show single
instance formatting for each of the 10 tasks in Figures 6- 25. For each task, we show both the MCF and
CF formats.
All curated few-shot examples and prompt formatting code are available by accessing https://github.
com/allenai/olmes.
25

### 第25页直译

提示
问题：George 想通过摩擦双手迅速把手暖起来。哪一种皮肤表面会产生最多热量？
答案：干燥的手掌
问题：以下哪项陈述最能解释为什么磁铁通常会吸附在冰箱门上？
答案：冰箱门含有铁。
问题：在沉积岩层中观察到的褶皱最可能是由什么造成的？
答案：地壳板块的汇聚。
问题：对于为何许多动植物在中生代末期灭绝，科学家提出的最新解释是哪一个？
答案：小行星撞击产生的尘埃遮挡了阳光
问题：以下哪一种特征并非狗从父母那里遗传的？
答案：食欲的大小
问题：一艘船受到向北流动的河流以及吹向船帆的风的共同作用。船向东北方向行驶。风最可能沿哪个方向对船帆施力？
答案：
补全
向东
图5：ARC-CHALLENGE（CF）的 OLMES 五样本提示示例。

• 跳过含义模糊的样本。
• 跳过暗示歧视或因其他原因被视为不适当的样本。
• 如果同一标签频繁出现，则跳过其中部分样本（例如连续四个样本的真实标签都是“C”，从中保留质量较好的样本）。
• 如果样本按主题分组或标注，应选择具有多样性的样本（例如前三个都属于某一主题，就从后面的样本中挑选，以确保多样性）。
• 如果最终得到的、能够覆盖标签空间或不同主题范围的样本少于七个，则查看下一批十个样本。
• 末尾，对样本重新排序，使输出答案标签大致均衡——前五个样本应覆盖答案标签空间。

其中，整理过程中为每个数据集策划了略多于五个样本，但实际使用的只是前五个。

H

各项任务的 OLMES 提示格式

图5展示了 ARC-CHALLENGE（CF）的一个完整五样本提示示例。随后，图6至图25展示了十项任务各自的单个样本格式。每项任务均同时展示 MCF 与 CF 格式。

所有人工策划的少样本示例和提示格式化代码均可通过 https://github.com/allenai/olmes 获取。
<!-- page 26 of 29 -->

Prompt
Question: George wants to warm his hands quickly by rubbing them. Which skin surface
will produce the most heat?
A. dry palms
B. wet palms
C. palms covered with oil
D. palms covered with lotion
Answer:
Completion
A
Figure 6: OLMES prompt example for ARC-CHALLENGE (MCF).
Prompt
Question: George wants to warm his hands quickly by rubbing them. Which skin surface
will produce the most heat?
Answer:
Completion
dry palms
Figure 7: OLMES prompt example for ARC-CHALLENGE (CF).
Prompt
Question: Lichens are symbiotic organisms made of green algae and fungi. What do the
green algae supply to the fungi in this symbiotic relationship?
A. carbon dioxide
B. food
C. protection
D. water
Answer:
Completion
B
Figure 8: OLMES prompt example for ARC-EASY (MCF).
Prompt
Question: Lichens are symbiotic organisms made of green algae and fungi. What do the
green algae supply to the fungi in this symbiotic relationship?
Answer:
Completion
food
Figure 9: OLMES prompt example for ARC-EASY (CF).
Prompt
Persian language – Persian, also known by its endonym Farsi, is one of the Western
Iranian languages within the Indo-Iranian branch of the Indo-European language family.
It is primarily spoken in Iran, Afghanistan (officially known as Dari since 1958), and
Tajikistan (officially known as Tajiki since the Soviet era), and some other regions
which historically were Persianate societies and considered part of Greater Iran. It is
written in the Persian alphabet, a modified variant of the Arabic script, which itself
evolved from the Aramaic alphabet.
Question: do iran and afghanistan speak the same language?
A. yes
B. no
Answer:
Completion
A
Figure 10: OLMES prompt example for BOOLQ (MCF).
26

### 第26页直译

提示
问题：George 想通过摩擦双手迅速把手暖起来。哪一种皮肤表面会产生最多热量？
A. 干燥的手掌
B. 湿润的手掌
C. 涂有油的手掌
D. 涂有乳液的手掌
答案：
补全
A
图6：ARC-CHALLENGE（MCF）的 OLMES 提示示例。

提示
问题：George 想通过摩擦双手迅速把手暖起来。哪一种皮肤表面会产生最多热量？
答案：
补全
干燥的手掌
图7：ARC-CHALLENGE（CF）的 OLMES 提示示例。

提示
问题：地衣是由绿藻和真菌组成的共生生物。在这种共生关系中，绿藻向真菌提供什么？
A. 二氧化碳
B. 食物
C. 保护
D. 水
答案：
补全
B
图8：ARC-EASY（MCF）的 OLMES 提示示例。

提示
问题：地衣是由绿藻和真菌组成的共生生物。在这种共生关系中，绿藻向真菌提供什么？
答案：
补全
食物
图9：ARC-EASY（CF）的 OLMES 提示示例。

提示
波斯语——波斯语的本族语名称也叫 Farsi，是印欧语系印度—伊朗语族中的西伊朗语言之一。它主要通行于伊朗、阿富汗（自1958年起正式称为达里语）和塔吉克斯坦（自苏联时期起正式称为塔吉克语），以及其他一些历史上属于波斯文化社会、并被认为是大伊朗一部分的地区。它使用波斯字母书写；波斯字母是阿拉伯字母的一种修改形式，而阿拉伯字母本身由阿拉米字母演化而来。
问题：伊朗和阿富汗说同一种语言吗？
A. 是
B. 否
答案：
补全
A
图10：BOOLQ（MCF）的 OLMES 提示示例。
<!-- page 27 of 29 -->

Prompt
Persian language – Persian, also known by its endonym Farsi, is one of the Western
Iranian languages within the Indo-Iranian branch of the Indo-European language family.
It is primarily spoken in Iran, Afghanistan (officially known as Dari since 1958), and
Tajikistan (officially known as Tajiki since the Soviet era), and some other regions
which historically were Persianate societies and considered part of Greater Iran. It is
written in the Persian alphabet, a modified variant of the Arabic script, which itself
evolved from the Aramaic alphabet.
Question: do iran and afghanistan speak the same language?
Answer:
Completion
yes
Figure 11: OLMES prompt example for BOOLQ (CF).
Prompt
Question: Sammy wanted to go to where the people were. Where might he go?
A. race track
B. populated areas
C. the desert
D. apartment
E. roadblock
Answer:
Completion
B
Figure 12: OLMES prompt example for COMMONSENSEQA (MCF).
Prompt
Question: Sammy wanted to go to where the people were. Where might he go?
Answer:
Completion
populated areas
Figure 13: OLMES prompt example for COMMONSENSEQA (CF).
Prompt
Health: How to cope with suicidal thoughts. Put off any plans. Promise yourself that
you’ll wait 48 hours before doing anything. Remember, thoughts don’t have the power to
force you to act.
Choose the best continuation:
A. Even when you do, there may be a small image of the future still lurking around your
brain. For instance, don’t tell yourself that you can’t make it.
B. You’re doing something, and no one can force you to act. It’s completely natural to
feel negative thoughts before you act.
C. Do not panic if people talk to you (even if it’s about quitting smoking). Have a
plan for how you’re going to react to a group of people who bring on suicidal thoughts.
D. Sometimes extreme pain can distort our perception. Waiting before taking action
will give your mind time to clear.
Answer:
Completion
D
Figure 14: OLMES prompt example for HELLASWAG (MCF).
Prompt
Health: How to cope with suicidal thoughts. Put off any plans. Promise yourself that
you’ll wait 48 hours before doing anything. Remember, thoughts don’t have the power to
force you to act.
Completion
Sometimes extreme pain can distort our perception. Waiting before taking action will
give your mind time to clear.
Figure 15: OLMES prompt example for HELLASWAG (CF).
27

### 第27页直译

提示
波斯语——波斯语的本族语名称也叫 Farsi，是印欧语系印度—伊朗语族中的西伊朗语言之一。它主要通行于伊朗、阿富汗（自1958年起正式称为达里语）和塔吉克斯坦（自苏联时期起正式称为塔吉克语），以及其他一些历史上属于波斯文化社会、并被认为是大伊朗一部分的地区。它使用波斯字母书写；波斯字母是阿拉伯字母的一种修改形式，而阿拉伯字母本身由阿拉米字母演化而来。
问题：伊朗和阿富汗说同一种语言吗？
答案：
补全
是
图11：BOOLQ（CF）的 OLMES 提示示例。

提示
问题：Sammy 想去有人在的地方。他可能去哪里？
A. 方向
B. 人口稠密地区
C. 沙漠
D. 公寓
E. 路障
答案：
补全
B
图12：COMMONSENSEQA（MCF）的 OLMES 提示示例。

提示
问题：Sammy 想去有人在的地方。他可能去哪里？
答案：
补全
人口稠密地区
图13：COMMONSENSEQA（CF）的 OLMES 提示示例。

提示
健康：如何应对自杀念头。推迟任何计划。向自己承诺，在采取任何行动之前等待48小时。请记住，想法本身没有迫使你行动的力量。
选择最佳续写：
A. 即使你这样做了，脑海中可能仍潜藏着一幅关于未来的小小图景。例如，不要告诉自己你做不到。
B. 你正在做某件事，而且没有人能够强迫你行动。在采取行动前产生消极想法是完全自然的。
C. 如果有人与你交谈，请不要惊慌（即使话题是戒烟）。对于一群引发你自杀念头的人，要预先计划好自己将如何回应。
D. 有时，极度痛苦会扭曲我们的感知。采取行动前先等待，会让你的头脑有时间恢复清醒。
答案：
补全
D
图14：HELLASWAG（MCF）的 OLMES 提示示例。

提示
健康：如何应对自杀念头。推迟任何计划。向自己承诺，在采取任何行动之前等待48小时。请记住，想法本身没有迫使你行动的力量。
补全
有时，极度痛苦会扭曲我们的感知。采取行动前先等待，会让你的头脑有时间恢复清醒。
图15：HELLASWAG（CF）的 OLMES 提示示例。
<!-- page 28 of 29 -->

Instruction
The following are multiple choice questions (with answers) about abstract algebra.
Prompt
Question: Find all c in Z_3 such that Z_3[x]/(x^2 + c) is a field.
A. 0
B. 1
C. 2
D. 3
Answer:
Completion
B
Figure 16: OLMES prompt example for MMLU (abstract_algebra) (MCF).
Instruction
The following are multiple choice questions (with answers) about abstract algebra.
Prompt
Question: Find all c in Z_3 such that Z_3[x]/(x^2 + c) is a field.
Answer:
Completion
1
Figure 17: OLMES prompt example for MMLU (abstract_algebra) (CF).
Prompt
Question: When standing miles away from Mount Rushmore
A. the mountains seem very close
B. the mountains are boring
C. the mountains look the same as from up close
D. the mountains seem smaller than in photographs
Answer:
Completion
D
Figure 18: OLMES prompt example for OPENBOOKQA (MCF).
Prompt
Question: When standing miles away from Mount Rushmore
Answer:
Completion
the mountains seem smaller than in photographs
Figure 19: OLMES prompt example for OPENBOOKQA (CF).
Prompt
Goal: how do you stab something?
A. stick a sharp object through it.
B. pin it with a sharp object.
Answer:
Completion
A
Figure 20: OLMES prompt example for Physical Interaction QA (MCF).
Prompt
Goal: how do you stab something?
Answer:
Completion
stick a sharp object through it.
Figure 21: OLMES prompt example for Physical Interaction QA (CF).
Prompt
Question: Cameron decided to have a barbecue and gathered her friends together. How
would Others feel as a result?
A. like attending
B. like staying home
C. a good friend to have
Answer:
Completion
A
Figure 22: OLMES prompt example for SOCIAL IQA (MCF).
28

### 第28页直译

指令
以下是关于抽象代数的多项选择题（附答案）。
提示
问题：求所有满足 Z_3[x]/(x^2 + c) 为域的 Z_3 中的 c。
A. 0
B. 1
C. 2
D. 3
答案：
补全
B
图16：MMLU（abstract_algebra，抽象代数）（MCF）的 OLMES 提示示例。

指令
以下是关于抽象代数的多项选择题（附答案）。
提示
问题：求所有满足 Z_3[x]/(x^2 + c) 为域的 Z_3 中的 c。
答案：
补全
1
图17：MMLU（abstract_algebra，抽象代数）（CF）的 OLMES 提示示例。

提示
问题：站在距拉什莫尔山数英里远的地方时，
A. 山看起来非常近
B. 山令人感到无聊
C. 山看起来与近距离观看时一样
D. 山看起来比照片中更小
答案：
补全
D
图18：OPENBOOKQA（MCF）的 OLMES 提示示例。

提示
问题：站在距拉什莫尔山数英里远的地方时，
答案：
补全
山看起来比照片中更小
图19：OPENBOOKQA（CF）的 OLMES 提示示例。

提示
目标：怎样刺穿某样东西？
A. 将一个尖锐物体穿过它。
B. 用一个尖锐物体把它别住。
答案：
补全
A
图20：Physical Interaction QA（物理交互问答）（MCF）的 OLMES 提示示例。

提示
目标：怎样刺穿某样东西？
答案：
补全
将一个尖锐物体穿过它。
图21：Physical Interaction QA（物理交互问答）（CF）的 OLMES 提示示例。

提示
问题：Cameron 决定举办一次烧烤聚会，并把朋友们召集到一起。其他人会因此有什么感受？
A. 想参加
B. 想待在家里
C. 她是一个值得结交的好朋友
答案：
补全
A
图22：SOCIAL IQA（MCF）的 OLMES 提示示例。
<!-- page 29 of 29 -->

Prompt
Question: Cameron decided to have a barbecue and gathered her friends together. How
would Others feel as a result?
Answer:
Completion
like attending
Figure 23: OLMES prompt example for SOCIAL IQA (CF).
Prompt
Fill in the blank: John moved the couch from the garage to the backyard to create space.
The ___ is small.
A. garage
B. backyard
Answer:
Completion
A
Figure 24: OLMES prompt example for WINOGRANDE (MCF).
Prompt1
John moved the couch from the garage to the backyard to create space. The garage
Prompt2
John moved the couch from the garage to the backyard to create space. The backyard
Completion
is small.
Figure 25: OLMES prompt example for WINOGRANDE (CF). In this case the completions are the same for each
answer choice, but the prompt is different.
29

### 第29页直译

提示
问题：Cameron 决定举办一次烧烤聚会，并把朋友们召集到一起。其他人会因此有什么感受？
答案：
补全
想参加
图23：SOCIAL IQA（CF）的 OLMES 提示示例。

提示
填空：John 为了腾出空间，把沙发从车库搬到了后院。这个___很小。
A. 车库
B. 后院
答案：
补全
A
图24：WINOGRANDE（MCF）的 OLMES 提示示例。

提示1
John 为了腾出空间，把沙发从车库搬到了后院。车库
提示2
John 为了腾出空间，把沙发从车库搬到了后院。后院
补全
很小。
图25：WINOGRANDE（CF）的 OLMES 提示示例。在这种情况下，每个答案选项的补全部分相同，但提示不同。
