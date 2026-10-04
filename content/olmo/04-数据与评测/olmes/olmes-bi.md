---
title: "OLMES 对照译稿"
category: "数据与评测"
tags: ["OLMES", "语言模型评测", "可复现性", "多项选择"]
published: true
excerpt: "OLMES 为基础语言模型的多项选择评测规定可复现标准, 统一提示格式、few-shot 示例、概率归一化、任务形式与实现细节。"
---

# OLMES: A Standard for Language Model Evaluations · 语言模型评测标准
<!-- arXiv 2406.08446; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/olmes/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 29 -->

OLMES: A Standard for Language Model Evaluations

Yuling Gu α Oyvind Tafjord α Bailey Kuehl α Dany Haddad α

Jesse Dodge α Hannaneh Hajishirzi αβ

αAllen Institute for Artificial Intelligence βUniversity of Washington {yulingg, oyvindt}@allenai.org

Model↓ Ref1 Ref2 Ref3 Ref4 Ref5 Ref6 OLMES

Abstract

MPT-7B 47.7 42.6 46.5 45.7 RPJ-Incite-7B 46.3 42.8 45.3 Falcon-7B 47.9 42.4 44.5 47.5 49.7 Mistral-7B 60.0 55.5 54.9 78.6†

Llama2-7B 53.1 45.9 43.2 45.9 48.5 53.7† 54.2 Llama2-13B 59.4 49.4 48.8 49.4 67.6† 67.3†

Llama3-8B 60.2 78.6† 79.3†

Num shots 25 0 0 0 0 25 5 Curated shots No No Yes Formulation CF CF CF? CF CF MCF MCF/CF Normalization char char ? char? pmi none none/pmi

射击次数 25 0 0 0 0 25 5 策划射击 否 否 是 配方 CF CF CF？ CF CF MCF MCF/CF 标准化 char char ?炭？ PMI 无 无/PMI

Ref Reference citation

Ref1 HF Open LLM Leaderboard (Beeching et al., 2023) Ref2 Llama2 paper (Touvron et al., 2023a) Ref3 Mistral 7B (Jiang et al., 2023) Ref4 Falcon paper (Almazrouei et al., 2023) Ref5 OLMo paper (Groeneveld et al., 2024) Ref6 Llama3 model card (AI@Meta, 2024)

Ref1 HF Open LLM Leaderboard (Beeching et al., 2023) Ref2 Llama2 paper (Touvron et al., 2023a) Ref3 Mistral 7B (Jiang et al., 2023) Ref4 Falcon paper (Almazrouei et al., 2023) Ref5 OLMo paper (Groeneveld et al., 2024) Ref6 Llama3 模型卡（AI@Meta,2024）

Progress in AI is often demonstrated by new models claiming improved performance on tasks measuring model capabilities. Evaluating language models can be particularly challeng- ing, as choices of how a model is evaluated on a task can lead to large changes in mea- sured performance. There is no common stan- dard setup, so different models are evaluated on the same tasks in different ways, leading to claims about which models perform best not being reproducible. We propose OLMES, a completely documented, practical, open stan- dard for reproducible LLM evaluations. In developing this standard, we identify and re- view the varying factors in evaluation practices adopted by the community – such as details of prompt formatting, choice of in-context ex- amples, probability normalizations, and task formulation. In particular, OLMES supports meaningful comparisons between smaller base models that require the unnatural “cloze” for- mulation of multiple-choice questions against larger models that can utilize the original for- mulation. OLMES includes well-considered, documented recommendations guided by re- sults from existing literature as well as new experiments resolving open questions.1

人工智能的进步通常通过新模型来证明,新模型声称在衡量模型能力的任务上性能有所提高.评估语言模型可能特别具有挑战性,因为选择如何评估任务的模型可能会导致测量性能发生巨大变化.没有通用的标准设置,因此不同的模型在相同的任务上以不同的方式进行评估,导致关于哪些模型表现最好的说法不可重现.我们提出 OLMES,这是一个完整记录的、实用的、开放的、可重复的 LLM 评估标准.在制定该标准的过程中,我们识别并审查了社区采用的评估实践中的不同因素,例如提示格式的细节、上下文示例的选择、概率标准化和任务制定.特别是,OLMES 支持在较小的基本模型之间进行有意义的比较,这些模型需要对多项选择问题进行不自然的“完形填空”表述,而较大的模型则可以利用原始表述. OLMES 包括以现有文献结果为指导的经过深思熟虑、记录在案的建议以及解决悬而未决问题的新实验.1

Table 1: Scores reported in different references for LLM performances on ARC-CHALLENGE. Scores indicated with † are using multiple-choice formulation (MCF) rather than “cloze” formulation (CF) (see Section 2.1 for definitions). Entries with “?” denote either undoc- umented or mixed approaches across models. Differ- ent references use different evaluation setups, some of which are not fully specified, so conclusions about per- formances and relative strengths of models are not re- producible.

1 Introduction · 引言

arXiv:2406.08446v2  [cs.CL]  11 Feb 2025

is currently no standard way to decide on these choices, and they can have significant impact on model performance, with some recent papers claim- ing as much as an 80% difference in accuracy on a given task just from varying formatting and in- context examples (Sclar et al., 2023).

目前还没有决定这些选择的标准方法,它们可能会对模型性能产生重大影响,最近的一些论文声称,仅通过不同的格式和上下文示例,给定任务的准确率就有高达 80% 的差异（Sclar 等人,2023）.

Scientific credibility in AI rests on reproducible and well-considered comparisons between mod- els. Many current AI models, such as pretrained large language models (LLMs), are generalist mod- els capable of performing downstream tasks they were not specifically trained on (Brown et al., 2020; Bommasani et al., 2022). When evaluating LLMs on such tasks, there are many choices in how the task is presented to the model and how the model outputs are interpreted before scoring (Gao, 2021; Biderman et al., 2024; Liang et al., 2023). There

人工智能的科学可信度取决于模型之间可重复且经过深思熟虑的比较.当前的许多人工智能模型,例如预训练的大语言模型（LLM）,都是通用模型,能够执行未经过专门训练的下游任务（Brown 等人,2020；Bommasani 等人,2022）.在评估此类任务的法学硕士时,如何将任务呈现给模型以及如何在评分之前解释模型输出有很多选择（Gao,2021；Biderman 等人,2024；Liang 等人,2023）.那里

1All prompts, examples, and code used for OLMES are available at https://github.com/allenai/olmes.

These choices in evaluation setups are often not reported with enough details to reproduce, so when a team of ML practitioners releases a new model it is often impossible for them to directly compare against previously-reported results by others. Ef- forts like the Holistic Evaluation of Language Mod-

评估设置中的这些选择通常没有提供足够的详细信息来重现,因此当 ML 从业者团队发布新模型时,他们通常不可能直接与其他人之前报告的结果进行比较.像语言模型的整体评估这样的努力

1

<!-- page 2 of 29 -->

els (HELM) benchmark (Liang et al., 2023) and the Hugging Face Open LLM Leaderboard (Beech- ing et al., 2023) tackle the issue of reproducibility by striving towards standardizing LM evaluations. While the same setup is used to evaluate many mod-

els (HELM) 基准（Liang 等人,2023）和 Hugging Face Open LLM 排行榜（Beeching 等人,2023）通过努力标准化 LM 评估来解决可重复性问题.虽然相同的设置用于评估许多mod-

practical point of view, removing ambiguity in how a final performance metric is obtained when evalu- ating a model on a dataset. OLMES can be applied to evaluation during the model development pro- cess, and in published leaderboards and papers. OLMES provides justified recommendations on all aspects of task setups, such as data sampling, how to format instances, the choice of in-context examples, probability normalization, and task for- mulation.

从实用的角度来看,消除在评估数据集上的模型时如何获得最终性能指标的歧义. OLMES 可应用于模型开发过程中以及已发表的排行榜和论文中的评估. OLMES 为任务设置的各个方面提供了合理的建议,例如数据采样、如何格式化实例、上下文示例的选择、概率标准化和任务制定.

Importantly, OLMES is:

els ensuring consistency and reproducibility, the ra- tionale behind prompt formatting, use of in-content examples, normalization techniques, and task for- mulation are not always clearly documented and thus not consistently followed by other researchers in subsequent work (Touvron et al., 2023b; Bider- man et al., 2023; Jiang et al., 2023; Groeneveld et al., 2024; AI@Meta, 2024).

为了确保一致性和可重复性,提示格式背后的基本原理、内容内示例的使用、标准化技术和任务制定并不总是有明确的记录,因此其他研究人员在后续工作中并没有一致遵循（Touvron et al., 2023b; Biderman et al., 2023; Jiang et al., 2023; Groeneveld et al., 2024; AI@Meta, 2024）.

• Reproducible: OLMES specifies all details of the evaluations, from processing datasets to presenting the task to model, to processing models’ outputs, so there are no ambiguities in the evaluation procedure.

• 可重复：OLMES 指定了评估的所有细节,从处理数据集到向模型呈现任务,再到处理模型的输出,因此评估过程中不存在任何歧义.

• Practical: OLMES makes practical decisions in use of computation resources for easy adop- tion by the community.

• 实用：OLMES 在使用计算资源方面做出实用决策,以便于社区采用.

• Documented: Each decision in the standard is documented with justifications by applying principles from existing studies and perform- ing experiments to resolve open questions.

• 记录：通过应用现有研究的原理并进行实验来解决悬而未决的问题,标准中的每个决定都记录有合理性.

We highlight two problems in the field today. (1) Releasing a new model and comparing it against previously reported results is flawed unless the pre- vious work explicitly described their full evaluation setup, and then that setup is followed in the new work. Currently, different references (like leader- boards, papers) use different (and sometimes under- specified) evaluation setups, leading to different results and conclusions. For a particular dataset, evaluating a specified language model, different references can tell you very different stories. We illustrate this phenomenon in Table 1, which shows how several models’ published performance on the

今天我们强调该领域的两个问题. (1) 发布新模型并将其与先前报告的结果进行比较是有缺陷的,除非先前的工作明确描述了其完整的评估设置,然后在新的工作中遵循该设置.目前,不同的参考文献（如排行榜、论文）使用不同的（有时是未指定的）评估设置,导致不同的结果和结论.对于特定的数据集,评估指定的语言模型,不同的参考可以告诉你非常不同的故事.我们在表 1 中说明了这一现象,该表显示了几种模型在

• Open: We release all prompts and code, along with the rationales behind the choices made in OLMES, for subsequent work to follow and build upon by extending the same principles to any new task and model.

• 开放：我们发布所有提示和代码,以及OLMES 中所做选择背后的基本原理,以便后续工作可以遵循并通过将相同的原则扩展到任何新任务和模型来进行构建.

Since OLMES is a documented, practical, open evaluation standard, it is straightforward to adopt in publicly available, well-maintained evaluation code bases like the Eleuther LM Evaluation Har- ness (Gao et al., 2023; Biderman et al., 2024) and HELM (Liang et al., 2023). When used by model developers and other researchers, OLMES will help unify evaluation practices in the field. We believe this work is the first of its kind to unify practices for evaluating base models throughout the full de- velopment cycle, from small to large models as well as early to late training stages. All prompts, examples, and code used for OLMES can be found at https://github.com/allenai/olmes.

2 Experimental setup · 实验设置

ARC-CHALLENGE (Clark et al., 2018) task can vary in the literature. For instance, looking at Ref1, we would conclude that Llama2-13B and Llama3-8B are performing similarly, but Ref6 reveals there is likely a gap of over 10% between them. (2) Despite current efforts to standardize model evalu- ation (e.g., HF Open LLM Leaderboard, HELM), the choices made are not justified and most model creators do not use these setups for their evalu- ations. We also see evidence of this in Table 1, showing a variety of setups being used for the same task, differing in choices such as number of shots, source of in-context examples, task formulation, and probability normalization. While these differ- ent choices are made in implementing the evalu- ations, to date, there is no documented standard studying and/or justifying if one choice is better than another, leading to the lack of a set of justified choices that the community can adopt. Mai and Liang (2024) also demonstrates how this might be a community-wide problem in a recent effort (see Figure 4 in Appendix).

ARC-CHALLENGE（Clark 等人,2018）任务在文献中可能有所不同.例如,查看 Ref1,我们会得出结论,Llama2-13B 和 Llama3-8B 的性能相似,但 Ref6 表明它们之间可能存在超过 10% 的差距. (2) 尽管目前正在努力标准化模型评估（例如,HF Open LLM Leaderboard、HELM）,但所做的选择并不合理,并且大多数模型创建者不使用这些设置进行评估.我们还在表 1 中看到了这方面的证据,显示了用于同一任务的各种设置,在选择上有所不同,例如镜头数量、上下文示例的来源、任务制定和概率标准化.尽管在实施评估时做出了这些不同的选择,但迄今为止,还没有记录在案的标准来研究和/或证明一个选择是否优于另一个选择,从而导致缺乏一套可供社区采用的合理选择. Mai 和 Liang (2024) 还在最近的努力中证明了这可能是一个社区范围的问题（参见附录中的图 4）.

2.1 Multiple-choice QA and LLM evaluation · 多项选择问答与语言模型评测

Multiple-choice question answering (MCQA) tasks present a compelling way of evaluating models and humans alike, due to the ease of scoring (whether

多项选择题回答（MCQA）任务提供了一种令人信服的评估模型和人类的方式,因为评分很容易（无论

To address these problems, we present OLMES (Open Language Model Evaluation Standard), a standard to improve the transparency and repro- ducibility of language model evaluation from a

为了解决这些问题,我们提出了 OLMES（开放语言模型评估标准）,该标准旨在提高语言模型评估的透明度和可重复性

2

<!-- page 3 of 29 -->

Answer: <answer>

Each answer choice is separately substituted in for <answer>. Then the LLM probability of the an- swer choice tokens are used to rank the choices and predict an answer. This formulation has ambigu- ities in how to normalize the probability, as well as absolute limitations, such as not being able to properly address cases where one answer choice is “none of the above” or similar.

每个答案选项都单独替换为<answer>.然后,使用答案选择标记的 LLM 概率对选择进行排序并预测答案.这种表述在如何标准化概率方面存在模糊性,并且存在绝对限制,例如无法正确解决一个答案选择是“以上都不是”或类似情况的情况.

2.2 Targeted tasks · 目标任务

We select and implement standards for 10 popu-

the correct answer is chosen out of the given op- tions) and the allowed flexibility in the domain and complexity of the questions. One motivation for multiple-choice tasks is that early in training, and for smaller base models before instruction- tuning, other tasks (generative tasks, math reason- ing, coding, etc) tend to provide less useful signals. Multiple-choice tasks are the most common type of benchmarks for evaluating base LLMs (Beech- ing et al., 2023; Touvron et al., 2023a; Jiang et al., 2023; Groeneveld et al., 2024; AI@Meta, 2024), where the evaluation seems straightforward (did the model predict the right answer?), but in prac- tice, a statement like “model X scores Y on ARC-

正确答案是从给定的选项中选择的）以及领域允许的灵活性和问题的复杂性.多项选择任务的动机之一是,在训练早期,对于指令调整之前的较小基础模型,其他任务（生成任务、数学推理、编码等）往往提供不太有用的信号.多项选择任务是评估基础法学硕士最常见的基准类型（Beeching et al., 2023; Touvron et al., 2023a; Jiang et al., 2023; Groeneveld et al., 2024; AI@Meta, 2024）,其中评估看起来很简单（模型预测了正确的答案吗？）,但在实践中,像“模型X”这样的陈述ARC 得分为 Y-

CHALLENGE” is generally uninterpretable (with un- specified details and cannot be meaningfully com- pared across references, see Table 1) without a clear evaluation standard like OLMES.

如果没有像 OLMES 这样明确的评估标准,“挑战”通常是无法解释的（具有未指定的细节,并且不能在参考文献之间进行有意义的比较,见表 1）.

lar benchmark MCQA tasks, see Table 2 for the list. The list covers tasks that are frequently used in the community’s evaluation practices, such as the Hugging Face Open LLM Leaderboard (Beech- ing et al., 2023), Llama papers (Touvron et al., 2023a,b; AI@Meta, 2024), HELM (Liang et al., 2023), and the OLMo evaluation suite (Groeneveld et al., 2024). This selection includes questions on science, various types of commonsense, factual knowledge, and covers a range of topics (MMLU alone covers 57 subjects), of varying difficulty.

lar 基准 MCQA 任务,列表见表 2.该列表涵盖了社区评估实践中经常使用的任务,例如 Hugging Face Open LLM Leaderboard (Beeching et al., 2023)、Llama 论文 (Touvron et al., 2023a,b; AI@Meta, 2024)、HELM (Liang et al., 2023) 和 OLMo 评估套件 (Groeneveld et al., 2024).该选题包括科学问题、各类常识、事实知识,涵盖一系列主题（仅 MMLU 就涵盖了 57 个主题）,难度各异.

2.3 Selection of models · 模型选择

We develop OLMES based on a selection of 15

We specifically focus on evaluation using these tasks to provide useful guidance during and after base model training, giving important insights into the potential of such models before committing to further tuning (e.g., instruction-tuning). Such tasks form a large, essential part of LLM evaluations and are the focus of OLMES. There are generally two ways to formulate these tasks.

我们特别关注使用这些任务进行评估,以在基础模型训练期间和之后提供有用的指导,在进行进一步调整（例如指令调整）之前对此类模型的潜力提供重要见解.此类任务构成了 LLM 评估的重要组成部分,也是 OLMES 的重点.通常有两种方法来制定这些任务.

MCF (Multiple-choice formulation): present- ing answer choices indicated by labels and scoring prediction of answer labels, just like how MCQA is posed to humans. Here is an example of MCQA from ARC-EASY (Clark et al., 2018), a dataset of real grade-school level science questions:

MCF（多项选择公式）：呈现由标签指示的答案选择并对答案标签的评分预测,就像向人类提出MCQA一样.以下是来自 ARC-EASY（Clark 等人,2018）的 MCQA 示例,这是一个真实小学水平科学问题的数据集：

Question: Earth’s core is primarily composed of

which of the following materials?

A. basalt

B. iron

C. magma

D. quartz

Answer: B

diverse, openly available pretrained LLMs, fo- cusing on base (not instruction-tuned) models, covering a range of sizes from 1B to 70B – Pythia-1B, Pythia-6.7B (Biderman et al., 2023), OLMo-1B, OLMo-7B, OLMo-7B-0424 (Groen- eveld et al., 2024), TinyLlama-1.1B (Zhang et al., 2024), StableLM2-1.6B (Bellagente et al., 2024), RPJ-INCITE-7B (Together Computer, 2023), MPT- 7b (MosaicML, 2023), Falcon-7B (Almazrouei et al., 2023), Llama2-7B, Llama2-13B (Touvron et al., 2023b), Mistral-7B-v0.1 (Jiang et al., 2023), Llama3-8B, Llama3-70B (AI@Meta, 2024). This reflects our goal of providing an evaluation stan- dard that suits a range of model capabilities, with the flexibility to apply the same methodology dur- ing model development as well as when comparing final powerful base models.

多样化、公开可用的预训练法学硕士,专注于基础（非指令调整）模型,涵盖从 1B 到 70B 的各种尺寸 - Pythia-1B、Pythia-6.7B（Biderman 等人,2023）、OLMo-1B、OLMo-7B、OLMo-7B-0424（Groenevald 等人, 2024）、TinyLlama-1.1B（Zhang 等人,2024）、StableLM2-1.6B（Bellagente 等人,2024）、RPJ-INCITE-7B（Together Computer,2023）、MPT-7b（MosaicML,2023）、Falcon-7B（Almazrouei 等人,2023） 2023）、Llama2-7B、Llama2-13B（Touvron 等人,2023b）、Mistral-7B-v0.1（Jiang 等人,2023）、Llama3-8B、Llama3-70B（AI@Meta,2024）.这反映了我们的目标,即提供适合一系列模型功能的评估标准,并在模型开发期间以及比较最终强大的基础模型时灵活地应用相同的方法.

CF (Completion/cloze formulation): scoring each answer choice separately using LLM token probabilities. The MCF format is not natural for the pure language modeling task of generating the next token. Therefore, the CF format was introduced when evaluating the GPT-3 model (Brown et al., 2020). They found that it was possible to elicit much better performance using a “cloze” comple- tion version of the task, where the model is shown a prompt like:

CF（完成/完型填空）：使用 LLM 标记概率分别对每个答案选择进行评分. MCF 格式对于生成下一个标记的纯语言建模任务来说并不自然.因此,在评估 GPT-3 模型时引入了 CF 格式（Brown et al., 2020）.他们发现,使用任务的“完形填空”完成版本可以获得更好的性能,其中模型会显示如下提示：

Question: Earth’s core is primarily composed of

which of the following materials?

Assessing base models of different strengths is important during the training of models and be- fore it is used for further tuning (e.g., instruction- tuning). This is critical for the community when picking between alternate base models for further training or tuning for their application. There is limited established protocol in the community – evaluation during training is often left underspec- ified and understudied, and when evaluating final

在模型训练期间和用于进一步调整（例如指令调整）之前,评估不同强度的基础模型非常重要.当社区在备用基础模型之间进行选择以进一步训练或调整其应用程序时,这对于社区至关重要.社区中的既定协议有限——培训期间的评估往往没有明确说明和研究,并且在评估最终结果时

3

<!-- page 4 of 29 -->

task split #C # inst (total) CF norm reference

ARC-CHALLENGE (ARC_C) Test 4† 1172 pmi (Clark et al., 2018) ARC-EASY (ARC_E) Test 4† 1000 (2376) char (Clark et al., 2018) BOOLQ Val 2 1000 (3270) none (Clark et al., 2019) COMMONSENSEQA (CSQA) Val 5 1221 pmi (Talmor et al., 2019) HELLASWAG (HSwag) Val 4 1000 (10042) char (Zellers et al., 2019) MMLU Test 4 14042 char (Hendrycks et al., 2021) OPENBOOKQA (OBQA) Test 4 500 pmi (Mihaylov et al., 2018) PIQA Val 2 1000 (1838) char (Bisk et al., 2020) SOCIAL IQA (SIQA) Val 3 1000 (1954) char (Sap et al., 2019) WINOGRANDE (WinoG) Val 2 1267 none (Sakaguchi et al., 2020)

Table 2: OLMES details on tasks, with our standardized choices of dataset split, number of instances to use (along with total number if sampling was used), and which CF normalization scheme to use (see Section 3.3). Column #C shows the number of answer choices (ARC-CHALLENGE and ARC-EASY† have a few instances with 3 or 5 answer choices). See Section 3 for details on instance formatting, choice of in-context examples and task formulation.

base models, researchers across the field use differ- ent evaluation setups, leading to different results and conclusions (Tables 1 and 14). We hope this work will empower the community towards more unified practices in benchmarking base models so that further progress can be made on a stronger foundation based on careful evaluation.

由于基础模型不同,各领域的研究人员使用不同的评估设置,从而得出不同的结果和结论（表 1 和表 14）.我们希望这项工作能够使社区在基准模型的基准测试方面实现更统一的实践,以便在仔细评估的基础上取得进一步的进展.

3 Standardizing variations in evaluation · 评测变量的标准化

To evaluate a model on a dataset, there are a variety of decisions that have to be made to get a final score of that model on that dataset. These include:

要评估数据集上的模型,必须做出各种决策才能获得该模型在该数据集上的最终分数.这些包括：

• How to format dataset instances? (Sec- tion 3.1)

the literature. This includes simple choices like "Question:" vs "Q:" as question prefix (varying even within a paper, e.g., Brown et al. (2020)), or formatting the answer labels (e.g., "A." (Tou- vron et al., 2023a), "(A)" (Nori et al., 2023), "<mc>A</mc>" (Anthropic, 2024), etc). There is also a choice of whether or not to provide a general instruction, e.g., common for MMLU (Hendrycks et al., 2021), sometimes done for OPENBOOKQA (Al- mazrouei et al., 2023). Instance formatting. OLMES uses a consistent "Question: <question>" prefix and "Answer:" suffix in formatting the datasets. This clarifies the question-answering task in a natural way, without relying on verbose instruction understanding. The three exceptions are listed and explained here. For

文学.这包括简单的选择,例如“问题：”与“Q：”作为问题前缀（即使在论文中也会有所不同,例如,Brown 等人（2020））,或格式化答案标签（例如,“A.”（Touvron 等人,2023a）,“（A）”（Nori 等人,2023）,“<mc>A</mc>”（Anthropic, 2024）等）.还可以选择是否提供一般指令,例如 MMLU 常见的指令（Hendrycks 等人,2021）,有时为 OPENBOOKQA 提供的指令（Al-mazrouei 等人,2023）.实例格式化. OLMES 在格式化数据集时使用一致的“问题：<问题>”前缀和“答案：”后缀.这以自然的方式阐明了问答任务,而不依赖于冗长的指令理解.此处列出并解释了这三个例外情况.为了

• Which few-shot examples to use? (Sec- tion 3.2)

• How to normalize LLM probabilities for CF? (Section 3.3)

• What task formulation to use, MCF or CF? (Section 3.4)

• Other implementation choices impacting re- sults (Section 3.5)

• 影响结果的其他实施选择（第 3.5 节）

Below we enumerate key variations in these steps, and justify the choices made in OLMES (some of which are summarized in Table 2) to stan- dardize these steps, leaving some of the details for the Appendix.

下面我们列举了这些步骤中的关键变化,并证明了在 OLMES 中做出的选择（表 2 中总结了其中一些）的合理性,以标准化这些步骤,并在附录中留下一些细节.

3.1 How to format dataset instances? · 如何格式化数据集实例?

Each MCQA dataset includes a set of fields used to specify an instance, such as question, answer choices, and perhaps a context for the question. When formatting an instance as a prompt to an

每个 MCQA 数据集都包含一组用于指定实例的字段,例如问题、答案选择,可能还有问题的上下文.当格式化实例作为提示时

LLM, many different choices have been made in

PIQA, we use "Goal: <goal>" as the prefix instead to be consistent with the original semantics of the dataset. In the case of MCF, for HELLASWAG, we skip the question prefix and instead add "Choose the best continuation:" before presenting the continuation options, and for WINOGRANDE we use the prefix "Fill in the blank:" to align with the task. For HELLASWAG and WINOGRANDE, where the CF answer string is simply a language continuation, we remove such prefixes and suffixes for the CF evaluation so that the task is closer to pure language modeling. MCQA label choice. For MCF answer choices, OLMES uses the canonical letters A/B/C/... as answer labels, presenting the multiple-choice op- tions after simple letter labels, i.e., " A." for- mat. We note that most tokenizers treat a let- ter at the start of a line (or string) as a sepa- rate token from the same letter following a space. Therefore we add a prefix space in front of each answer label "\n A. <choice>" (rather than

PIQA,我们使用“Goal: <goal>”作为前缀,以与数据集的原始语义保持一致.对于 MCF,对于 HELLASWAG,我们跳过问题前缀,而是在呈现延续选项之前添加“选择最佳延续：”,对于 WINOGRANDE,我们使用前缀“填空：”来与任务保持一致.对于 HELLASWAG 和 WINOGRANDE,其中 CF 答案字符串只是语言延续,我们删除了 CF 评估的此类前缀和后缀,以便任务更接近纯语言建模. MCQA 标签选择.对于 MCF 答案选择,OLMES 使用规范字母 A/B/C/... 作为答案标签,在简单字母标签（即“A”）之后呈现多项选择选项.格式.我们注意到,大多数分词器将行（或字符串）开头的字母视为与空格后面的同一字母不同的分词.因此我们在每个答案标签前面添加一个前缀空格“\n A. <choice>”（而不是

4

<!-- page 5 of 29 -->

avoiding 4 A’s and 1 B among the 5 answers).5

Restricting to 5 in-context examples helps limit computational overhead, similar to HELM (Liang et al., 2023). Analysis suggests that going beyond 5 shots generally does not provide meaningful dif- ferences in scores (Brown et al., 2020; Barton, 2024). The manually curated shots for each task can be downloaded from https://github.com/ allenai/olmes.

3.3 How to normalize LLM probabilities for CF? · 如何归一化 CF 的模型概率?

When using the completion/cloze formulation (CF)

"\nA. <choice>"), to work naturally with all cur- rent tokenizers (so that the final answer token will be identical to the answer choice token, see Ap- pendix C.3 for details). All the exact OLMES prompt formats are listed in Appendix H. Sampling. Following existing LLM evaluation standardization efforts (Liang et al., 2023; Beech- ing et al., 2023), OLMES uses the test split of a dataset if the labels are publicly available, other- wise the validation split. If the dataset has more than 1500 instances, we sample 1000 instances to evaluate,2 similar to HELM (Liang et al., 2023) which caps evaluation instances at 1000.3 Note that the potential extra statistical signal from more instances would generally be dominated by other sources of score variations, like prompt formatting, so this is a practical consideration to avoid unneces- sary computation resources. See Table 2 for details on splits and sampling used in OLMES.

“\nA. <choice>”）,自然地与所有当前标记器一起工作（以便最终答案标记将与答案选择标记相同,详细信息请参阅附录 C.3）.所有确切的 OLMES 提示格式均在附录 H 采样中列出.遵循现有的 LLM 评估标准化工作（Liang 等人,2023 年；Beeching 等人,2023 年）,如果标签公开可用,OLMES 使用数据集的测试分割,否则使用验证分割.如果数据集有超过 1500 个实例,我们会采样 1000 个实例进行评估,2 类似于 HELM（Liang 等人,2023）,其将评估实例上限限制为 1000.3 请注意,来自更多实例的潜在额外统计信号通常会由其他分数变化来源（例如提示格式）主导,因此这是避免不必要的计算资源的实际考虑因素.有关 OLMES 中使用的分割和采样的详细信息,请参阅表 2.

for multiple-choice questions, the LLM returns P(ai|q), the probability for an answer choice ai given a question prompt q. Ranking solely based on the probability may heavily favor shorter an- swers with fewer tokens. To work around this issue, different normalization methods have been used in the literature, which we categorize below:

对于多项选择题,LLM 返回 P(ai|q),即给定问题提示 q 时选择答案 ai 的概率.仅基于概率进行排名可能会非常倾向于使用较少标记的较短答案.为了解决这个问题,文献中使用了不同的标准化方法,我们将其分类如下：

3.2 Which few-shot examples to use? · 应使用哪些 few-shot 示例?

• none: ln(P(ai|q))

• token: ln(P(ai|q))/ num_tokens(ai), which normalizes the log-probability by the number of tokens in the answer (Brown et al., 2020).

• token：ln(P(ai|q))/ num_tokens(ai),通过答案中的 token 数量标准化对数概率（Brown 等人,2020）.

Popularized by Brown et al. (2020), it is custom- ary to provide examples of the task to the model through few-shot examples, as this is an effective and universal way to convey a task to an LLM. For example, the MMLU task (Hendrycks et al., 2021) originally came with a fixed 5-shot prompt which is generally used in evaluation (Beeching et al., 2023; Gemma Team et al., 2024; Jiang et al., 2023; Tou- vron et al., 2023b; AI@Meta, 2024) resulting in more reproducible results than many other tasks.4

由布朗等人推广. （2020）,习惯上通过少量示例向模型提供任务示例,因为这是向法学硕士传达任务的有效且通用的方式.例如,MMLU 任务 (Hendrycks et al., 2021) 最初带有固定的 5 次提示,通常用于评估 (Beeching et al., 2023; Gemma Team et al., 2024; Jiang et al., 2023; Touvron et al., 2023b; AI@Meta, 2024),从而比许多其他任务产生更多可重复的结果任务.4

• character: ln(P(ai|q))/ num_characters(ai), which normalizes the log-probability by the number of characters in the answer, used by Llama models (Touvron et al., 2023a) and Eleuther AI LM Harness (Gao et al., 2023; Bi- derman et al., 2024).

• 字符：ln(P(ai|q))/ num_characters(ai),通过答案中的字符数标准化对数概率,由 Llama 模型（Touvron 等人,2023a）和 Eleuther AI LM Harness（Gao 等人,2023；Biderman 等人,2024）使用.

• pmi: ln(P(ai|q)/P(ai|u)) where u ="Answer:" is an unconditional prompt, which normalizes by dividing by the LLM probability of the same answer string without the presence of the question. This can be con- sidered a form of pointwise-mutual-information (PMI) and was explored further in other works (Holtzman et al., 2021).

• pmi: ln(P(ai|q)/P(ai|u)) 其中u ="Answer:" 是无条件提示,通过除以不存在问题的相同答案字符串的LLM 概率进行归一化.这可以被认为是逐点互信息（PMI）的一种形式,并在其他作品中进行了进一步探讨（Holtzman 等人,2021）.

For other tasks, both the number of shots and the way in which they are sampled have varied in dif- ferent evaluation setups. For example, to evalu- ate on HELLASWAG, Beeching et al. (2023) sam- pled 10-shot whereas HELM (Liang et al., 2023) uses 0-shot; within Beeching et al. (2023), a range of 25-shot, 10-shot, 5-shot was sampled for ARC- CHALLENGE, HELLASWAG and WINOGRANDE respec- tively.

对于其他任务,镜头数量和采样方式在不同的评估设置中都有所不同.例如,为了评估 HELLASWAG、Beeching 等人. (2023) 采样 10-shot,而 HELM (Liang et al., 2023) 使用 0-shot； Beeching 等人内部. (2023),ARC-CHALLENGE、HELLASWAG 和 WINOGRANDE 分别采样了 25 发、10 发、5 发的样本.

OLMES standardizes a manually curated 5- shots prompt for each task (from its training set), ensuring that the examples are of good quality and cover the label space in a balanced way (e.g.,

OLMES 为每个任务（来自其训练集）标准化了手动策划的 5 个镜头提示,确保示例具有良好的质量并以平衡的方式覆盖标签空间（例如,

2Sampling uses a specific random seed in Python: Random(1234).sample(all_instances, 1000)

2采样在Python中使用特定的随机种子：Random(1234).sample(all_instances, 1000)

Efforts like Liang et al. (2023); Gao et al. (2023); Biderman et al. (2024) compare and support com- parisons of different normalization approaches, leaving it an open question as to how to make a decision. See Appendix C.2 for further discussions around different normalizations.

梁等人的努力. （2023）；高等人. （2023）；比德曼等人. （2024）比较并支持不同标准化方法的比较,从而使如何做出决策成为一个悬而未决的问题.有关不同标准化的进一步讨论,请参阅附录 C.2.

3https://crfm-helm.readthedocs.io/en/latest/ reproducing_leaderboards/

To choose a normalization scheme in OLMES, we evaluate the models on each dataset, comparing

为了在 OLMES 中选择标准化方案,我们评估每个数据集上的模型,比较

4Sometimes sampled examples are used also for MMLU (MosaicML, 2024). Even for MMLU, noticeable discrep- ancies have been found, due to other differences in prompt formatting (Mai and Liang, 2024).

4有时采样示例也用于 MMLU（MosaicML,2024）.即使对于 MMLU,由于提示格式的其他差异,也发现了明显的差异（Mai 和 Liang,2024）.

5More details on curating the examples can be found in Appendix G.

5有关整理示例的更多详细信息,请参见附录 G.

5

<!-- page 6 of 29 -->

win percentage diff task none char tok pmi oracle OLMES

获胜百分比差异任务无 char tok pmi oracle OLMES

et al., 2023; Gao, 2021). It is also used in the Hug- ging Face Open LLM Leaderboard (Beeching et al., 2023) for ARC-CHALLENGE and HELLASWAG, in Tou- vron et al. (2023a,b)’s evaluations as the default, (with select datasets as exceptions), as well as re- ported in various works like Biderman et al. (2023); Almazrouei et al. (2023).

等,2023；高,2021）.它还在 Touvron 等人的 ARC-CHALLENGE 和 HELLASWAG 的 Hugging Face Open LLM 排行榜（Beeching 等人,2023）中使用. (2023a,b) 的评估作为默认值（选择数据集作为例外）,以及 Biderman 等人等各种著作中的报告. （2023）；阿尔马兹鲁伊等人. （2023）.

ARC_C 0.0 33.3 0.0 66.7 0.2 pmi ARC_E 6.7 86.7 6.7 0.0 0.1 char BoolQ 46.7 46.7 0.0 6.7 1.1 none CSQA 6.7 33.3 6.7 53.3 0.6 pmi HSwag 0.0 100.0 0.0 0.0 0.0 char MMLU 0.0 46.7 0.0 53.3 0.4 char OBQA 0.0 0.0 0.0 100.0 0.0 pmi PIQA 6.7 46.7 46.7 0.0 0.2 char SIQA 0.0 86.7 6.7 6.7 0.1 char WinoG 100.0 0.0 0.0 0.0 0.0 none

Table 3: Summary of CF normalization comparisons. “win percentage” shows how often each normalization

was best across the 15 models. “diff oracle” (difference between the OLMES recommendation and the empiri- cally best normalization for each task and model) shows that there is in general minimal difference between the OLMES normalization and the oracle optimal normal- ization for each task (difference out of 100%).

在 15 个型号中表现最好. “差异预言”（OLMES 推荐与每个任务和模型的经验最佳标准化之间的差异）表明,每个任务的 OLMES 标准化与预言最佳标准化之间的差异通常很小（差异超过 100%）.

OLMES specifies the “none” normalization for BOOLQ and WINOGRANDE. In BOOLQ the only an- swer choices are “yes” or “no” which are single tokens, therefore no length normalization is needed. Note that for some models, the “character” normal- ization has slightly better performance on BOOLQ (see Table 10), an accidental side effect of “yes” having one more character than “no”. One could argue that the pmi normalization is appropriate as it counters any existing bias in the model for “yes” vs “no”, but we argue that models should be capable of

OLMES 为 BOOLQ 和 WINOGRANDE 指定“无”规范化.在 BOOLQ 中,唯一的答案选择是“是”或“否”,它们是单个标记,因此不需要长度标准化.请注意,对于某些模型,“字符”规范化在 BOOLQ 上的性能稍好（参见表 10）,这是“是”比“否”多一个字符的意外副作用.有人可能会说,PMI 标准化是适当的,因为它抵消了模型中“是”与“否”之间的任何现有偏差,但我们认为模型应该能够

the effect of the 4 normalization techniques. Ta- ble 3 shows for each task, how often each normal- ization is empirically the best across the 15 models. Detailed scores per model are in Appendix C.2.

4种归一化技术的效果.表 3 显示了对于每项任务,每种标准化在 15 个模型中凭经验获得最佳效果的频率.每个模型的详细分数参见附录 C.2.

producing such common words (also indicated in the 5-shot examples) without any such corrections. Finally, WINOGRANDE is a special case in that the continuations are identical (and the prompts vary), so the choice of normalization does not matter and we simply use the “none” normalization.

生成如此常见的单词（也在 5 个镜头的示例中指出）,而无需任何此类更正.最后,WINOGRANDE 是一个特殊情况,因为延续是相同的（并且提示不同）,因此规范化的选择并不重要,我们只需使用“无”规范化.

OLMES specifies the “pmi” normalization for ARC-CHALLENGE, COMMONSENSEQA, and OPEN-

OLMES 指定 ARC-CHALLENGE、COMMONSENSEQA 和 OPEN- 的“pmi”标准化

In general, we observe little difference between the OLMES recommendation and the empirically best (“oracle”) normalization for each task and model, see “diff oracle” column in Table 3 (Table 9 in Appendix C.2 has more details).

一般来说,我们观察到每个任务和模型的 OLMES 建议与经验最佳（“oracle”）标准化之间几乎没有什么区别,请参见表 3 中的“diff oracle”列（附录 C.2 中的表 9 有更多详细信息）.

3.4 What task formulation to use, MCF or CF? · 应采用 MCF 还是 CF?

BOOKQA. The answer choices in these datasets tend to contain unexpected words or phrases that are less likely for models to generate (e.g., “Whirlpool bath” compared to “Bathtub”). The pmi normalization adjusts for this by taking into account the a priori likelihood of the answers. This is consistent with other findings (Holtzman et al., 2021) and some existing evaluation practices, e.g., Brown et al. (2020) selectively uses this normalization for ARC and OPENBOOKQA, and Touvron et al. (2023a,b) for OPENBOOKQA. Computing the extra uncondi- tional likelihood incurs some computation over- head, thus OLMES avoids this normalization for other datasets where there is no strong empirical or theoretical reason to choose this approach.

书评.这些数据集中的答案选择往往包含模型不太可能生成的意外单词或短语（例如,“漩涡浴”与“浴缸”相比）. pmi 归一化通过考虑答案的先验可能性来对此进行调整.这与其他研究结果（Holtzman 等人,2021）和一些现有的评估实践（例如 Brown 等人）一致. (2020) 有选择地将这种标准化用于 ARC 和 OPENBOOKQA,Touvron 等人. (2023a,b) OPENBOOKQA.计算额外的无条件可能性会产生一些计算开销,因此 OLMES 避免了对其他数据集的这种归一化,因为这些数据集没有强有力的经验或理论理由来选择这种方法.

OLMES specifies the “character” normaliza- tion for ARC-EASY, HELLASWAG, PIQA, SOCIAL IQA and MMLU. Based on our experiments, it is empiri- cally the normalization technique that gives the best scores6 for these datasets, and less computationally expensive than the “pmi” normalization. It also has the advantage (unlike the “token” normaliza- tion) of already being implemented (as acc_norm) in the Eleuther LM Evaluation Harness, where it is generally available for multiple-choice tasks (Gao

OLMES 指定了 ARC-EASY、HELLASWAG、PIQA、SOCIAL IQA 和 MMLU 的“字符”标准化.根据我们的实验,根据经验,归一化技术为这些数据集提供了最佳分数6,并且比“pmi”归一化的计算成本更低.它还具有已经在 Eleuther LM 评估工具中实现（作为 acc_norm）的优势（与“令牌”规范化不同）,通常可用于多项选择任务（Gao

6Tie for PIQA, and second-best for MMLU.

As LLMs have gotten stronger, the MCQA task formats have gradually changed from CF to MCF. For instance, ARC-CHALLENGE was often evaluated using the CF approach (Touvron et al., 2023a,b; Almazrouei et al., 2023; Beeching et al., 2023), but has switched to MCF for stronger models like OpenAI (2024); AI@Meta (2024), appearing with identical names like “25-shot ARC-CHALLENGE”. As an example, AI@Meta (2024) reports a 25-shot MCF ARC-CHALLENGE score for the Llama-3 8B model of 78.6% vs 60.2% for the 25-shot CF on the Hugging Face Open LLM Leaderboard. As performance on a multiple-choice task gets closer to 100%, the CF approach lags behind due to its inherent limitations, giving significantly less signal about a model’s actual performance. On the other hand, MMLU is almost exclusively evaluated using the MCF approach, which often results in near- random performance for weaker models (Beeching et al., 2023).

随着LLM的实力越来越强,MCQA的任务格式也逐渐从CF变为MCF.例如,ARC-CHALLENGE 通常使用 CF 方法进行评估（Touvron 等人,2023a,b；Almazrouei 等人,2023；Beeching 等人,2023）,但已转向 MCF 以获得更强大的模型,如 OpenAI（2024）； AI@Meta (2024),以相同的名称出现,如“25-shot ARC-CHALLENGE”.例如,AI@Meta (2024) 在 Hugging Face Open LLM 排行榜上报告,Llama-3 8B 模型的 25 次 MCF ARC-CHALLENGE 得分为 78.6%,而 25 次 CF 的得分为 60.2%.随着多项选择任务的性能接近 100%,CF 方法由于其固有的局限性而落后,给出的有关模型实际性能的信号显着减少.另一方面,MMLU 几乎完全使用 MCF 方法进行评估,这通常会导致较弱模型的性能接近随机（Beeching 等人,2023）.

6

<!-- page 7 of 29 -->

MMLU during training of OLMo-1.7-7B

0.55

MCF

0.50

CF

0.45

of task performance compared to the flatter trends using CF (for Llama3-70B the MCF score is 93.7% (6.3% error) while the CF score is just 69.0% (31% error), a nearly 5x difference in error rate!).

与使用 CF 的平坦趋势相比,任务性能的变化（对于 Llama3-70B,MCF 分数为 93.7%（6.3% 错误）,而 CF 分数仅为 69.0%（31% 错误）,错误率相差近 5 倍！）.

random

0.40

0.35

Accuracy

A similar pattern can be seen across other tasks in Figure 2, where the stronger models show per- formance using MCF either exceeding CF (like

在图 2 中的其他任务中可以看到类似的模式,其中更强的模型显示使用 MCF 的性能超过了 CF（例如

0.30

ARC-EASY, OPENBOOKQA, MMLU, SOCIAL IQA, COM-

0.25

MONSENSEQA, and PIQA) or at least catching up to it (HELLASWAG, WINOGRANDE, BOOLQ).8

MONSENSEQA 和 PIQA）或至少赶上它（HELLASWAG、WINOGRANDE、BOOLQ）8.

0 500 1000 1500 2000 2500 0.20

Training data (billion tokens)

Figure 1: Performance on MMLU validation set during the training of OLMo-7B-0424 model. During early training, there is good signal from CF while MCF is random. Around 400B tokens, the model starts gaining the ability on the MCF format, becoming a stronger signal than CF.

In OLMES, we standardize to evaluate each model using both the MCF and CF formulations, and the best performing one is used. This allows for meaningful comparison of task evaluation num- bers over a range of models, from the smaller, weaker base models which can only deal with the CF (where MCF scores hovering around random baseline), to the stronger models which can report more accurate performance using the MCF (where CF provides less clear signal).

在 OLMES 中,我们使用 MCF 和 CF 公式标准化评估每个模型,并使用性能最好的模型.这允许对一系列模型上的任务评估数字进行有意义的比较,从只能处理 CF 的较小、较弱的基本模型（其中 MCF 分数徘徊在随机基线附近）,到可以使用 MCF 报告更准确的性能的更强模型（其中 CF 提供不太清晰的信号）.

3.5 Other implementation details · 其他实现细节

There are other important details that go into a fully specified evaluation result, and we enumerate the choices made in OLMES here:

完整指定的评估结果还有其他重要细节,我们在此列举了 OLMES 中所做的选择：

In OLMES, we argue that the CF formulation provides a useful evaluation of task knowledge for models that have not yet acquired the skill of an- swering multiple-choice questions using MCF. On the other hand, MCF is a more realistic formulation for models that can “understand” this format, yield- ing higher and more representative scores (Robin- son et al., 2023; OpenAI, 2024). See Appendix C.1 for further discussion.

在 OLMES 中,我们认为 CF 公式为尚未获得使用 MCF 回答多项选择问题的技能的模型提供了有用的任务知识评估.另一方面,MCF 是一种更现实的模型表述,可以“理解”这种格式,产生更高、更具代表性的分数（Robinson 等人,2023；OpenAI,2024）.进一步讨论请参见附录 C.1.

• For MMLU: use macro average (over 57 tasks) rather than micro average (over 14042 in- stances), following AI@Meta (2024). This better represents the diversity of fields in the dataset, although in practice it does not gener- ally make a big difference (see Figure 8).

• 对于MMLU：遵循AI@Meta (2024),使用宏观平均值（超过57 个任务）而不是微观平均值（超过14042 个实例）.这更好地代表了数据集中字段的多样性,尽管在实践中它通常不会产生很大的差异（见图 8）.

• When a model requires it, make sure to add the appropriate <bos> token at start of prompt (e.g., Gemma (Gemma Team et al., 2024)).

• 当模型需要时,请确保在提示开始时添加适当的 <bos> 标记（例如,Gemma (Gemma Team et al., 2024)）.

We can see an explicit example of a model ac- quiring the “understanding” of MCF during train- ing in Figure 1, showing the OLMo-7B-0424 model (Groeneveld et al., 2024; AI2 blog, 2024) evaluated on the MMLU validation set in both CF and MCF variations. The plot suggests that model starts learning the MCF task format after about 400 billion training tokens, so in early training CF pro- vides a better signal, while MCF is significantly better in late training where CF levels off.

我们可以在图 1 中看到一个在训练过程中“理解”MCF 的模型的明确示例,其中显示了 OLMo-7B-0424 模型（Groeneveld 等人,2024 年；AI2 博客,2024 年）在 CF 和 MCF 变体中的 MMLU 验证集上进行了评估.该图表明模型在大约 4000 亿个训练标记后开始学习 MCF 任务格式,因此在早期训练中 CF 提供了更好的信号,而 MCF 在 CF 趋于平稳的后期训练中明显更好.

• When using the “character” normalization for CF, include the leading space in the calcula- tion of answer length.

• 当对CF 使用“字符”规范化时,在计算答案长度时包括前导空格.

To further study this phenomenon, we evaluate the CF and MCF versions for each task and model.7

为了进一步研究这一现象,我们评估了每个任务和模型的 CF 和 MCF 版本.7

• Restrict all inputs (with completions) to 2048 tokens for consistency across models.9

• 将所有输入（包括完成）限制为 2048 个令牌,以确保模型之间的一致性.9

• Use the default model precision when evalu- ating (i.e., avoid options like load_in_8bit unless it produces identical results).

• 评估时使用默认模型精度（即,避免使用 load_in_8bit 等选项,除非它产生相同的结果）.

• OLMES uses the standard approach of two newlines to separate each in-context example.

• OLMES 使用两个换行符的标准方法来分隔每个上下文示例.

• Other than the original instruction line for MMLU (Hendrycks et al., 2021), we do not

• 除了 MMLU 的原始指令行（Hendrycks 等人,2021）之外,我们不

Figure 2 shows for each task, the MCF and CF per- formances for the 15 models ordered along the x-axis by overall performance on all tasks. For in- stance, on ARC-CHALLENGE, we see a clear distinc- tion where the weakest 8 models have near-random performance on the MCF version of the task, yet above random when using CF which offers a better signal to the relative strength of models. For the stronger models, the MCF version clearly outscores the CF version, and is a much better representation

7More detailed numbers can be found in Tables 6 and 7 in the Appendix B.

7更详细的数字可参见附录 B 的表 6 和表 7.

8Appendix C.2.1 provides further discussion. 9For current tasks this is only exhausted for a few MMLU instances.

8 附录 C.2.1 提供了进一步的讨论. 9对于当前任务,这仅对少数 MMLU 实例耗尽.

7

<!-- page 8 of 29 -->

1.0 ARC-Easy

1.0 BoolQ

1.0CommonsenseQA

1.0 HellaSwag

1.0 ARC-Challenge

0.8

0.8

0.8

0.8

0.8

0.6

0.6

0.6

0.6

0.6

0.4

0.4

0.4

0.4

0.4

0.2

0.2

0.2

0.2

0.2

5 10 15 0.0

5 10 15 0.0

5 10 15 0.0

5 10 15 0.0

5 10 15 0.0

1.0 MMLU

1.0 OpenbookQA

1.0 PIQA

1.0 Social IQa

1.0 WinoGrande

0.8

0.8

0.8

0.8

0.8

0.6

0.6

0.6

0.6

0.6

0.4

0.4

0.4

0.4

0.4

0.2

0.2

0.2

0.2

0.2

5 10 15 0.0

5 10 15 0.0

5 10 15 0.0

5 10 15 0.0

5 10 15 0.0

MCF CF random

Figure 2: Comparing model performance on each task for MCF vs CF. The 15 models are ordered along the x-axis by overall performance across all 10 tasks. In general, CF is needed to elicit a non-random signal from the weaker models, while stronger models can take advantage of MCF for a more accurate assessment.

• Follow recommendations for all other evalua- tion details (in Section 3.5)

• 遵循所有其他评估细节的建议（第 3.5 节）

add any extra instructions. This is in view of previous work finding the subject informa- tion from instructions makes little changes to model ranking (Alzahrani et al., 2024), and to reduce additional sources of variation in the prompt.

添加任何额外的说明.这是考虑到之前的工作从指令中查找主题信息对模型排名几乎没有改变（Alzahrani 等人,2024）,并减少了提示中的额外变化来源.

Table 4 reports the overall, fully reproducible, OLMES scores for the 15 models across the bench- marks. An extended table with a total of 40 models is shown in Table 13 (Appendix D).

5 Related work · 相关工作

With model releases, performance on popular

Note that computational details, like batch size and type/state of GPU, can affect floating point operations such that answer choice decisions can flip if they are very close. This is hard to avoid unless one considers “ties” when answers are suf- ficiently close in confidence, we leave that for fu- ture consideration. A reference implementation of OLMES is released at https://github.com/ allenai/olmes under the Apache 2.0 license.

4 OLMES: Summary and results · OLMES 总结与结果

OLMES includes the following elements, justified in detail above:

OLMES 包括以下元素,上面已详细说明：

• Use test set when available, otherwise vali- dation. Sample 1000 instances if more than 1500 (Section 3.1)

• 如果可用,则使用测试装置,否则进行验证.如果实例超过 1500 个,则抽取 1000 个实例（第 3.1 节）

• Use specified, exact prompt format (Sec- tion 3.1)

• Use fixed, curated 5-shot examples (Sec- tion 3.2)

• Use prescribed probability normalization for CF (Section 3.3)

• 对 CF 使用规定的概率归一化（第 3.3 节）

datasets is used to gauge the progress achieved e.g., OpenAI (2024) showing superhuman performance on benchmarks like MMLU. Such evaluation also guides community efforts towards understanding and sharing findings on what it takes to build a strong model (Touvron et al. (2023a,b); Biderman et al. (2023); Almazrouei et al. (2023); MosaicML (2023); Jiang et al. (2023); Gemma Team et al. (2024); Groeneveld et al. (2024) inter alia). How- ever, given a model and a dataset, even for the frequently used datasets, there are varied practices in how accuracy on them is measured. Various work has shown that model evaluations are vulner- able to differences such as option position changes in multiple-choice questions (Zheng et al., 2024; Li et al., 2024), choice symbols, re-ordering of answer options, changing number of answer options (Wang et al., 2024), and task formulation (Alzahrani et al., 2024; Robinson et al., 2023; Khatun and Brown, 2024; Wiegreffe et al., 2023). Even minor format- ting changes can cause large, generally arbitrary, score variations (Sclar et al., 2023).

数据集用于衡量所取得的进展,例如 OpenAI (2024) 在 MMLU 等基准上显示出超人的性能.这种评估还指导社区努力理解和分享建立强大模型所需的研究结果（Touvron et al. (2023a,b)；Biderman et al. (2023)；Almazrouei et al. (2023)；MosaicML (2023)；Jiang et al. (2023)；Gemma Team et al. (2024)；Groeneveld et al. (2024) inter别名）.然而,给定一个模型和一个数据集,即使对于经常使用的数据集,在如何测量它们的准确性方面也有不同的做法.各种工作表明,模型评估容易受到诸如多项选择题中选项位置变化的影响（Zheng et al., 2024; Li et al., 2024）、选择符号、答案选项的重新排序、答案选项数量的变化（Wang et al., 2024）和任务制定（Alzahrani et al., 2024; Robinson et al., 2023; Khatun and Brown, 2024；Wiegreffe 等人,2023）.即使很小的格式变化也可能导致大的、通常是任意的分数变化（Sclar et al., 2023）.

• Evaluate with both MCF and CF, use the best result (Section 3.4)

• 使用 MCF 和 CF 进行评估,使用最佳结果（第 3.4 节）

The Holistic Evaluation of Language Models (HELM) benchmark (Liang et al., 2023), the Hug-

语言模型的整体评估 (HELM) 基准（Liang 等人,2023）、Hug-

8

<!-- page 9 of 29 -->

model ARC_C ARC_E BoolQ CSQA HSwag MMLU OBQA PIQA SIQA WinoG average

模型 ARC_C ARC_E BoolQ CSQA HSwag MMLU OBQA PIQA SIQA WinoG 平均

Pythia-1B 31.4 63.4 56.8† 50.9 48.0 31.1 40.4 68.9 46.4 52.7 49.0 OLMo-1B 38.6 68.3 51.3 62.2 65.2 33.4 47.6 74.1 51.5 59.3 55.1 TinyLlama-1.1B 38.1 69.5 63.6 61.1 60.8 33.6 45.0 71.7 50.4 60.1 55.4 Pythia-6.7B 44.6 72.6 68.7 62.1 66.1 37.7 50.4 74.9 51.7 62.3 59.1 RPJ-INCITE-7B 45.3 78.8 72.0 69.2 72.8 40.1 49.0 75.9 56.6 68.0 62.8 StableLM2-1.6B 50.6† 75.3 82.3 70.4† 70.3 40.4† 56.6† 75.6 64.3† 65.7 65.1 OLMo-7B 46.4 78.9 78.7 70.8 78.1 40.5 55.8 78.5 56.5 68.5 65.3 MPT-7b 45.7 78.0 82.4 70.9 79.6 40.6 52.4 79.2 57.4 70.2 65.6 Falcon-7B 49.7 80.6 78.2 73.4 79.0 42.1 55.2 79.0 60.1 71.3 66.9 Llama2-7B 54.2 84.0 86.1 74.2 78.9 46.2† 57.8 77.5 59.6 71.7 69.0 Llama2-13B 67.3† 85.9 86.7 74.0 83.9 55.8† 65.4† 80.2 65.9† 74.9 74.0 OLMo-7B-0424 66.9† 83.6† 85.9 85.8† 80.1 54.4† 68.6† 80.3 76.1† 73.6 75.5 Llama3-8B 79.3† 92.4† 87.5 73.9† 81.8 66.6† 77.2† 81.6 70.2† 76.2 78.7 Mistral-7B-v0.1 78.6† 90.8† 89.3 72.4† 83.0 64.0† 80.6† 82.8 71.3† 77.9 79.1 Llama3-70B 93.7† 97.7† 91.7† 83.2† 89.5 79.8† 93.4† 91.6† 78.9† 84.1 88.4

Table 4: Reproducible performance scores across models and tasks using OLMES, providing robust, meaningful comparisons across a wide range of models and tasks. † indicates use of the MCF score.

bases to unify evaluation practices in the field.

Future work and limitations. Future work in- cludes adding more tasks to OLMES, covering tasks beyond MCQA such as generative tasks and chain-of-thought prompting. This will include stan- dardizing how answers are extracted for evalua- tion, and for chat models how to split the prompt into messages. We welcome the community to contribute to OLMES, extending the principles of OLMES to new tasks.

未来的工作和限制.未来的工作包括向 OLMES 添加更多任务,涵盖 MCQA 之外的任务,例如生成任务和思维链提示.这将包括标准化如何提取答案以进行评估,以及对于聊天模型如何将提示拆分为消息.我们欢迎社区为 OLMES 做出贡献,将 OLMES 的原则扩展到新的任务.

ging Face Open LLM Leaderboard (Beeching et al., 2023), Mosaic Eval Gauntlet (Barton, 2024), Eleuther LM Evaluation Harness (Gao et al., 2023; Biderman et al., 2024), and Unitxt (Bandel et al., 2024) present efforts toward greater transparency and reproducibility of LLM evaluations. These frameworks generally describe and provide support for various task setups, presenting them as open choices to researchers and users. When specific default setups are given, the rationale is not always documented and thus not followed by others in subsequent work (see Tables 1 and 14).

ging Face Open LLM Leaderboard (Beeching et al., 2023)、Mosaic Eval Gauntlet (Barton, 2024)、Eleuther LM Evaluation Harness (Gao et al., 2023; Biderman et al., 2024) 和 Unitxt (Bandel et al., 2024) 展示了提高 LLM 评估透明度和可重复性的努力.这些框架通常描述并提供对各种任务设置的支持,将它们作为研究人员和用户的开放选择.当给出特定的默认设置时,其基本原理并不总是被记录下来,因此在后续工作中不会被其他人遵循（参见表 1 和 14）.

6 Discussion · 讨论

OLMES is a step towards standardizing LLM evaluations, ready to be incorporated into evalua- tion code bases for broad usage. OLMES facilitates robust and simplified comparisons of model perfor- mances, both for researchers during model training and development, and for developers in choosing models to build upon.

OLMES 是 LLM 评估标准化的一步,可以纳入评估代码库以供广泛使用. OLMES 有助于对模型性能进行稳健且简化的比较,无论是在模型训练和开发期间的研究人员,还是在选择要构建的模型时的开发人员.

Acknowledgments

In creating this evaluation standard, OLMES, we build on top of the various previous efforts on lan- guage model evaluation in the community – includ- ing previous work on language model evaluation standardization, the many open research reports dis- closing how evaluation on LLMs have been done, and the datasets that made OLMES possible, which we explicitly cite and acknowledge in our paper.

在创建这个评估标准 OLMES 的过程中,我们建立在社区之前关于语言模型评估的各种努力的基础上,包括之前关于语言模型评估标准化的工作、许多公开的研究报告,这些报告披露了如何完成对法学硕士的评估,以及使 OLMES 成为可能的数据集,我们在论文中明确引用并承认了这些数据集.

Limitations

The current version of OLMES is focused on pro- viding guidance useful for LLM evaluation dur- ing the training stage and for comparing final base models, which provides important insights into the potential of such models before further tuning (e.g.,

OLMES 当前版本的重点是在训练阶段为 LLM 评估和比较最终基础模型提供有用的指导,这在进一步调整之前提供了有关此类模型潜力的重要见解（例如,

By identifying and reviewing common evaluation practices in the community, and performing ex- periments to resolve open questions, we present OLMES – an open, documented, reproducible, and practical evaluation standard. OLMES provides justified recommendations on decisions such as how to format dataset instances, the choice of in- context examples, task formulation, probability nor- malization, as well as other implementation details. The goal is for OLMES to be a useful guide for model developers to obtain signals as to whether their model is on track during training, and to com- pare final powerful base models. The practical choices encourage evaluations without unnecessary computation resources. The reproducible nature means that any evaluation done using OLMES can be directly compared to existing OLMES evalua- tions. We also document the rationales behind the choices made, guiding the community toward more justified evaluation practices. OLMES can be ap- plied to current leaderboards and evaluation code

通过识别和审查社区中常见的评估实践,并进行实验来解决悬而未决的问题,我们提出了 OLMES——一个开放的、有记录的、可重复的、实用的评估标准. OLMES 提供了有关决策的合理建议,例如如何格式化数据集实例、上下文示例的选择、任务制定、概率标准化以及其他实现细节. OLMES 的目标是成为模型开发人员的有用指南,以获取有关其模型在训练期间是否步入正轨的信号,并比较最终强大的基础模型.实际的选择鼓励在没有不必要的计算资源的情况下进行评估.可重复性意味着使用 OLMES 进行的任何评估都可以直接与现有的 OLMES 评估进行比较.我们还记录了所做选择背后的理由,指导社区采取更合理的评估实践. OLMES 可应用于当前排行榜和评估代码

9

<!-- page 10 of 29 -->

Ebtesam Almazrouei, Hamza Alobeidli, Abdulaziz Al-

instruction-tuning, safety-tuning). Interesting di- rections for future work include looking into eval- uations targeted at accessing the effectiveness of various kinds of model tuning, as well as evaluation for multi-modal models.

shamsi, Alessandro Cappelli, Ruxandra Cojocaru, Mérouane Debbah, Étienne Goffinet, Daniel Hesslow, Julien Launay, Quentin Malartic, Daniele Mazzotta, Badreddine Noune, Baptiste Pannier, and Guilherme Penedo. 2023. The falcon series of open language models. arXiv:2311.16867.

Norah Alzahrani, Hisham Abdullah Alyahya, Yazeed

This paper focuses on design choices in evalu- ating language models with multiple-choice tasks. While the suite of multiple-choice tasks used in

Alnumay, Sultan Alrashed, Shaykhah Alsubaie, Yusef Almushaykeh, Faisal Mirza, Nouf Alotaibi,

Nora Altwairesh, Areeb Alowisheq, M Saiful Bari, and Haidar Khan. 2024. When benchmarks are tar- gets: Revealing the sensitivity of large language model leaderboards. arXiv:2402.01781.

Anthropic. 2024. The claude 3 model family: Opus,

this work includes questions on science, various types of commonsense, factual knowledge, and covers a range of topics (MMLU alone covers 57 subjects), of varying difficulty, an important future direction would be to apply the same principles in OLMES (e.g., prompt formatting, curated few-shot examples) to generative tasks and chain-of-thought prompting.

sonnet, haiku. https://www-cdn.anthropic.com/ de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/ Model_Card_Claude_3.pdf. Accessed: 2024-06- 03.

Elron Bandel, Yotam Perlitz, Elad Venezian, Roni Fried-

man, Ofir Arviv, Matan Orbach, Shachar Don-Yehiya, Dafna Sheinwald, Ariel Gera, Leshem Choshen, Michal Shmueli-Scheuer, and Yoav Katz. 2024. Unitxt: Flexible, shareable and reusable data prepara- tion and evaluation for generative AI. In Proceedings of the 2024 Conference of the North American Chap- ter of the Association for Computational Linguistics: Human Language Technologies (Volume 3: System Demonstrations), pages 207–215, Mexico City, Mex- ico. Association for Computational Linguistics.

Tessa Barton. 2024. Calibrating the mosaic evaluation

gauntlet. https://www.databricks.com/blog/ calibrating-mosaic-evaluation-gauntlet. Accessed: 2024-05-05.

Edward Beeching, Clémentine Fourrier, Nathan Habib,

While the recommendations in OLMES are well- considered, justified and practical, they do not cover all plausible variants of presenting a task. See Appendix A for further discussion, showing how performance measured using OLMES is sta- ble and consistent when subject to small changes in prompt wording or the selection of few-shot examples, within the general recommendations. Larger differences would be expected when diverg- ing from OLMES recommendations such as by using unnatural prompts e.g., using rare symbols as answer labels, or randomly sampled few-shot examples which could run into skewed label dis- tribution covered in few-shot examples or include noisy examples from train sets. We leave evalu- ating the robustness of models under adversarial setups as a topic for future work.

Ethical considerations

Sheon Han, Nathan Lambert, Nazneen Rajani, Omar Sanseviero, Lewis Tunstall, and Thomas Wolf. 2023. Open llm leaderboard. https://huggingface.co/ spaces/open-llm-leaderboard-old/open_llm_ leaderboard.

Marco Bellagente, Jonathan Tow, Dakota Mahan, Duy

This study involves the use of large-scale language models. We only use their outputs to obtain their answers to questions in commonly used multiple- choice datasets, therefore we do not foresee any ethical issues with their use for the research pre- sented in this work.

Phung, Maksym Zhuravinskyi, Reshinth Adithyan, James Baicoianu, Ben Brooks, Nathan Cooper, Ashish Datta, Meng Lee, Emad Mostaque, Michael Pieler, Nikhil Pinnaparju, Paulo Rocha, Harry Saini, Hannah Teufel, Niccolo Zanichelli, and Carlos Riquelme. 2024. Stable LM 2 1.6b technical report. arXiv:2402.17834.

Stella Biderman, Hailey Schoelkopf, Quentin Gregory

References

AI2 blog. 2024. OLMo 1.7–7B: A 24 point improve-

ment on MMLU. https://blog.allenai.org/ olmo-1-7-7b-92b43f7d269d. Accessed: 2024-06- 03.

Anthony, Herbie Bradley, Kyle O’Brien, Eric Hal- lahan, Mohammad Aflah Khan, Shivanshu Purohit, USVSN Sai Prashanth, Edward Raff, et al. 2023. Pythia: A suite for analyzing large language mod- els across training and scaling. In International Conference on Machine Learning, pages 2397–2430. PMLR.

Stella Biderman, Hailey Schoelkopf, Lintang Sutawika,

Leo Gao, Jonathan Tow, Baber Abbasi, Alham Fikri

AI@Meta. 2024. Llama 3 model card. https://github.com/meta-llama/llama3/ blob/main/MODEL_CARD.md. Accessed: 2024-05- 29.

10

<!-- page 11 of 29 -->

Radford, Ilya Sutskever, and Dario Amodei. 2020. Language models are few-shot learners. In Ad- vances in Neural Information Processing Systems, volume 33, pages 1877–1901. Curran Associates, Inc.

Aakanksha Chowdhery, Sharan Narang, Jacob Devlin,

Aji, Pawan Sasanka Ammanamanchi, Sidney Black, Jordan Clive, Anthony DiPofi, Julen Etxaniz, Ben- jamin Fattori, Jessica Zosa Forde, Charles Foster, Mi- mansa Jaiswal, Wilson Y. Lee, Haonan Li, Charles Lovering, Niklas Muennighoff, Ellie Pavlick, Ja- son Phang, Aviya Skowron, Samson Tan, Xiangru Tang, Kevin A. Wang, Genta Indra Winata, François Yvon, and Andy Zou. 2024. Lessons from the trenches on reproducible evaluation of language mod- els. arXiv:2405.14782.

Yonatan Bisk, Rowan Zellers, Ronan Le bras, Jianfeng

Gao, and Yejin Choi. 2020. PIQA: Reasoning about physical commonsense in natural language. Proceed- ings of the AAAI Conference on Artificial Intelligence, 34(05):7432–7439.

Rishi Bommasani, Drew A. Hudson, Ehsan Adeli, Russ

Maarten Bosma, Gaurav Mishra, Adam Roberts, Paul Barham, Hyung Won Chung, Charles Sutton, Sebastian Gehrmann, Parker Schuh, Kensen Shi, Sasha Tsvyashchenko, Joshua Maynez, Abhishek Rao, Parker Barnes, Yi Tay, Noam Shazeer, Vin- odkumar Prabhakaran, Emily Reif, Nan Du, Ben Hutchinson, Reiner Pope, James Bradbury, Jacob Austin, Michael Isard, Guy Gur-Ari, Pengcheng Yin, Toju Duke, Anselm Levskaya, Sanjay Ghemawat, Sunipa Dev, Henryk Michalewski, Xavier Garcia, Vedant Misra, Kevin Robinson, Liam Fedus, Denny Zhou, Daphne Ippolito, David Luan, Hyeontaek Lim, Barret Zoph, Alexander Spiridonov, Ryan Sepassi, David Dohan, Shivani Agrawal, Mark Omernick, An- drew M. Dai, Thanumalayan Sankaranarayana Pil- lai, Marie Pellat, Aitor Lewkowycz, Erica Moreira, Rewon Child, Oleksandr Polozov, Katherine Lee, Zongwei Zhou, Xuezhi Wang, Brennan Saeta, Mark Diaz, Orhan Firat, Michele Catasta, Jason Wei, Kathy Meier-Hellstern, Douglas Eck, Jeff Dean, Slav Petrov, and Noah Fiedel. 2022. PaLM: Scaling language modeling with pathways. arXiv:2204.02311.

Christopher Clark, Kenton Lee, Ming-Wei Chang,

Tom Kwiatkowski, Michael Collins, and Kristina Toutanova. 2019. BoolQ: Exploring the surprising difficulty of natural yes/no questions. In Proceedings of the 2019 Conference of the North American Chap- ter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2924–2936, Minneapolis, Min- nesota. Association for Computational Linguistics.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot,

Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. 2018. Think you have solved question an- swering? Try ARC, the AI2 reasoning challenge. CoRR, arXiv:1803.05457.

Nan Du, Yanping Huang, Andrew M Dai, Simon Tong,

Dmitry Lepikhin, Yuanzhong Xu, Maxim Krikun, Yanqi Zhou, Adams Wei Yu, Orhan Firat, et al. 2022.

Glam: Efficient scaling of language models with mixture-of-experts. In International Conference on Machine Learning, pages 5547–5569. PMLR.

Altman, Simran Arora, Sydney von Arx, Michael S. Bernstein, Jeannette Bohg, Antoine Bosselut, Emma Brunskill, Erik Brynjolfsson, Shyamal Buch, Dallas Card, Rodrigo Castellon, Niladri Chatterji, Annie Chen, Kathleen Creel, Jared Quincy Davis, Dora Demszky, Chris Donahue, Moussa Doumbouya, Esin Durmus, Stefano Ermon, John Etchemendy, Kawin Ethayarajh, Li Fei-Fei, Chelsea Finn, Trevor Gale, Lauren Gillespie, Karan Goel, Noah Goodman, Shelby Grossman, Neel Guha, Tatsunori Hashimoto, Peter Henderson, John Hewitt, Daniel E. Ho, Jenny Hong, Kyle Hsu, Jing Huang, Thomas Icard, Saahil Jain, Dan Jurafsky, Pratyusha Kalluri, Siddharth Karamcheti, Geoff Keeling, Fereshte Khani, Omar Khattab, Pang Wei Koh, Mark Krass, Ranjay Kr- ishna, Rohith Kuditipudi, Ananya Kumar, Faisal Lad- hak, Mina Lee, Tony Lee, Jure Leskovec, Isabelle Levent, Xiang Lisa Li, Xuechen Li, Tengyu Ma, Ali Malik, Christopher D. Manning, Suvir Mirchan- dani, Eric Mitchell, Zanele Munyikwa, Suraj Nair, Avanika Narayan, Deepak Narayanan, Ben Newman, Allen Nie, Juan Carlos Niebles, Hamed Nilforoshan, Julian Nyarko, Giray Ogut, Laurel Orr, Isabel Pa- padimitriou, Joon Sung Park, Chris Piech, Eva Porte- lance, Christopher Potts, Aditi Raghunathan, Rob Reich, Hongyu Ren, Frieda Rong, Yusuf Roohani, Camilo Ruiz, Jack Ryan, Christopher Ré, Dorsa Sadigh, Shiori Sagawa, Keshav Santhanam, Andy Shih, Krishnan Srinivasan, Alex Tamkin, Rohan Taori, Armin W. Thomas, Florian Tramèr, Rose E. Wang, William Wang, Bohan Wu, Jiajun Wu, Yuhuai Wu, Sang Michael Xie, Michihiro Yasunaga, Jiaxuan You, Matei Zaharia, Michael Zhang, Tianyi Zhang, Xikun Zhang, Yuhui Zhang, Lucia Zheng, Kaitlyn Zhou, and Percy Liang. 2022. On the opportunities and risks of foundation models. arXiv:2108.07258.

Tom Brown, Benjamin Mann, Nick Ryder, Melanie

Leo Gao. 2021. Multiple choice normalization in LM evaluation. https://blog.eleuther.ai/ multiple-choice-normalization/. Accessed: 2024-05-08.

Leo Gao, Jonathan Tow, Baber Abbasi, Stella Biderman,

Sid Black, Anthony DiPofi, Charles Foster, Laurence Golding, Jeffrey Hsu, Alain Le Noac’h, Haonan Li, Kyle McDonell, Niklas Muennighoff, Chris Ociepa, Jason Phang, Laria Reynolds, Hailey Schoelkopf, Aviya Skowron, Lintang Sutawika, Eric Tang, Anish Thite, Ben Wang, Kevin Wang, and Andy Zou. 2023.

Subbiah, Jared D Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel Ziegler, Jeffrey Wu, Clemens Winter, Chris Hesse, Mark Chen, Eric Sigler, Ma- teusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec

11

<!-- page 12 of 29 -->

A framework for few-shot language model evaluation. https://zenodo.org/records/10256836.

Gemma Team, Thomas Mesnard, Cassidy Hardin,

and Luke Zettlemoyer. 2021. Surface form com- petition: Why the highest probability answer isn’t always right. In Proceedings of the 2021 Conference on Empirical Methods in Natural Language Process- ing, pages 7038–7051, Online and Punta Cana, Do- minican Republic. Association for Computational Linguistics.

Albert Q. Jiang, Alexandre Sablayrolles, Arthur Men-

sch, Chris Bamford, Devendra Singh Chaplot, Diego de las Casas, Florian Bressand, Gianna Lengyel, Guillaume Lample, Lucile Saulnier, Lélio Re- nard Lavaud, Marie-Anne Lachaux, Pierre Stock, Teven Le Scao, Thibaut Lavril, Thomas Wang, Timo- thée Lacroix, and William El Sayed. 2023. Mistral 7B. arXiv:2310.06825.

Aisha Khatun and Daniel G. Brown. 2024. A study on

large language models’ limitations in multiple-choice question answering. arXiv:2401.07955.

Wangyue Li, Liangzhi Li, Tong Xiang, Xiao Liu, Wei

Deng, and Noa Garcia. 2024. Can multiple-choice questions really be useful in detecting the abilities of LLMs? In LREC-COLING 2024.

Percy Liang, Rishi Bommasani, Tony Lee, Dimitris

Robert Dadashi, Surya Bhupatiraju, Shreya Pathak, Laurent Sifre, Morgane Rivière, Mihir Sanjay Kale, Juliette Love, Pouya Tafti, Léonard Hussenot, Pier Giuseppe Sessa, Aakanksha Chowdhery, Adam Roberts, Aditya Barua, Alex Botev, Alex Castro- Ros, Ambrose Slone, Amélie Héliou, Andrea Tac- chetti, Anna Bulanova, Antonia Paterson, Beth Tsai, Bobak Shahriari, Charline Le Lan, Christo- pher A. Choquette-Choo, Clément Crepy, Daniel Cer, Daphne Ippolito, David Reid, Elena Buchatskaya, Eric Ni, Eric Noland, Geng Yan, George Tucker, George-Christian Muraru, Grigory Rozhdestvenskiy, Henryk Michalewski, Ian Tenney, Ivan Grishchenko, Jacob Austin, James Keeling, Jane Labanowski, Jean-Baptiste Lespiau, Jeff Stanway, Jenny Bren- nan, Jeremy Chen, Johan Ferret, Justin Chiu, Justin Mao-Jones, Katherine Lee, Kathy Yu, Katie Milli- can, Lars Lowe Sjoesund, Lisa Lee, Lucas Dixon, Machel Reid, Maciej Mikuła, Mateo Wirth, Michael Sharman, Nikolai Chinaev, Nithum Thain, Olivier Bachem, Oscar Chang, Oscar Wahltinez, Paige Bai- ley, Paul Michel, Petko Yotov, Rahma Chaabouni, Ramona Comanescu, Reena Jana, Rohan Anil, Ross McIlroy, Ruibo Liu, Ryan Mullins, Samuel L Smith, Sebastian Borgeaud, Sertan Girgin, Sholto Douglas, Shree Pandya, Siamak Shakeri, Soham De, Ted Kli- menko, Tom Hennigan, Vlad Feinberg, Wojciech Stokowiec, Yu hui Chen, Zafarali Ahmed, Zhitao Gong, Tris Warkentin, Ludovic Peran, Minh Giang, Clément Farabet, Oriol Vinyals, Jeff Dean, Koray Kavukcuoglu, Demis Hassabis, Zoubin Ghahramani, Douglas Eck, Joelle Barral, Fernando Pereira, Eli Collins, Armand Joulin, Noah Fiedel, Evan Senter, Alek Andreev, and Kathleen Kenealy. 2024. Gemma: Open models based on gemini research and technol- ogy. arXiv:2403.08295.

Dirk Groeneveld, Iz Beltagy, Pete Walsh, Akshita Bha-

Tsipras, Dilara Soylu, Michihiro Yasunaga, Yian Zhang, Deepak Narayanan, Yuhuai Wu, Ananya Ku- mar, Benjamin Newman, Binhang Yuan, Bobby Yan, Ce Zhang, Christian Alexander Cosgrove, Christo- pher D Manning, Christopher Re, Diana Acosta- Navas, Drew Arad Hudson, Eric Zelikman, Esin Durmus, Faisal Ladhak, Frieda Rong, Hongyu Ren, Huaxiu Yao, Jue WANG, Keshav Santhanam, Laurel Orr, Lucia Zheng, Mert Yuksekgonul, Mirac Suzgun, Nathan Kim, Neel Guha, Niladri S. Chatterji, Omar Khattab, Peter Henderson, Qian Huang, Ryan An- drew Chi, Sang Michael Xie, Shibani Santurkar, Surya Ganguli, Tatsunori Hashimoto, Thomas Icard, Tianyi Zhang, Vishrav Chaudhary, William Wang, Xuechen Li, Yifan Mai, Yuhui Zhang, and Yuta Ko- reeda. 2023. Holistic evaluation of language models. Transactions on Machine Learning Research.

Opher Lieber, Or Sharir, Barak Lenz, and Yoav Shoham.

2021. Jurassic-1: Technical details and evaluation. White Paper. AI21 Labs.

Yifan Mai and Percy Liang. 2024. Massive multitask language understanding (MMLU) on helm. https://crfm.stanford.edu/2024/05/ 01/helm-mmlu.html. Accessed: 2024-05-29.

Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish

gia, Rodney Kinney, Oyvind Tafjord, Ananya Harsh Jha, Hamish Ivison, Ian Magnusson, Yizhong Wang, Shane Arora, David Atkinson, Russell Authur, Khy- athi Raghavi Chandu, Arman Cohan, Jennifer Du- mas, Yanai Elazar, Yuling Gu, Jack Hessel, Tushar Khot, William Merrill, Jacob Morrison, Niklas Muen- nighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Valentina Pyatkin, Abhilasha Ravichander, Dustin Schwenk, Saurabh Shah, Will Smith, Emma Strubell, Nishant Subramani, Mitchell Wortsman, Pradeep Dasigi, Nathan Lambert, Kyle Richardson, Luke Zettlemoyer, Jesse Dodge, Kyle Lo, Luca Sol- daini, Noah A. Smith, and Hannaneh Hajishirzi. 2024. OLMo: Accelerating the science of language models. arXiv:2402.00838.

Dan Hendrycks, Collin Burns, Steven Basart, Andy

Sabharwal. 2018. Can a suit of armor conduct elec- tricity? a new dataset for open book question an- swering. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing, pages 2381–2391, Brussels, Belgium. Association for Computational Linguistics.

Zou, Mantas Mazeika, Dawn Song, and Jacob Stein- hardt. 2021. Measuring massive multitask language understanding. Proceedings of the International Con- ference on Learning Representations (ICLR).

MosaicML. 2023. Introducing MPT-7B: A new standard for open-source, commercially usable LLMs. https://www.databricks.com/blog/ mpt-7b. Accessed: 2024-05-08.

Ari Holtzman, Peter West, Vered Shwartz, Yejin Choi,

12

<!-- page 13 of 29 -->

Grave, and Guillaume Lample. 2023a. LLaMA: Open and efficient foundation language models. arXiv:2302.13971.

MosaicML. 2024. Mosaic eval gauntlet v0.3.0 - evaluation suite. https://github.com/mosaicml/ llm-foundry/blob/main/scripts/eval/local_ data/EVAL_GAUNTLET.md. Accessed: 2024-05-29.

Hugo Touvron, Louis Martin, Kevin Stone, Peter Al-

Harsha Nori, Nicholas King, Scott Mayer McKinney,

Dean Carignan, and Eric Horvitz. 2023. Capa- bilities of GPT-4 on medical challenge problems. arXiv:2303.13375.

OpenAI. 2024. GPT-4 technical report. arXiv:2303.08774.

Joshua Robinson, Christopher Michael Rytting, and

David Wingate. 2023. Leveraging Large Language Models for Multiple Choice Question Answering. Proceedings of the International Conference on Learning Representations (ICLR).

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavat-

ula, and Yejin Choi. 2020. WinoGrande: An adver- sarial winograd schema challenge at scale. Proceed- ings of the AAAI Conference on Artificial Intelligence, 34(05):8732–8740.

Maarten Sap, Hannah Rashkin, Derek Chen, Ronan

bert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, Dan Bikel, Lukas Blecher, Cristian Canton Ferrer, Moya Chen, Guillem Cucurull, David Esiobu, Jude Fernandes, Jeremy Fu, Wenyin Fu, Brian Fuller, Cynthia Gao, Vedanuj Goswami, Naman Goyal, An- thony Hartshorn, Saghar Hosseini, Rui Hou, Hakan Inan, Marcin Kardas, Viktor Kerkez, Madian Khabsa, Isabel Kloumann, Artem Korenev, Punit Singh Koura, Marie-Anne Lachaux, Thibaut Lavril, Jenya Lee, Di- ana Liskovich, Yinghai Lu, Yuning Mao, Xavier Mar- tinet, Todor Mihaylov, Pushkar Mishra, Igor Moly- bog, Yixin Nie, Andrew Poulton, Jeremy Reizen- stein, Rashi Rungta, Kalyan Saladi, Alan Schelten, Ruan Silva, Eric Michael Smith, Ranjan Subrama- nian, Xiaoqing Ellen Tan, Binh Tang, Ross Tay- lor, Adina Williams, Jian Xiang Kuan, Puxin Xu, Zheng Yan, Iliyan Zarov, Yuchen Zhang, Angela Fan, Melanie Kambadur, Sharan Narang, Aurelien Ro- driguez, Robert Stojnic, Sergey Edunov, and Thomas Scialom. 2023b. Llama 2: Open foundation and fine-tuned chat models. arXiv:2307.09288.

Haochun Wang, Sendong Zhao, Zewen Qiang, Bing

Qin, and Ting Liu. 2024. Beyond the answers: Re- viewing the rationality of multiple choice question answering for the evaluation of large language mod- els. arXiv:2402.01349.

Le Bras, and Yejin Choi. 2019. Social IQa: Com- monsense reasoning about social interactions. In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Lan- guage Processing (EMNLP-IJCNLP), pages 4463– 4473, Hong Kong, China. Association for Computa- tional Linguistics.

Sarah Wiegreffe, Matthew Finlayson, Oyvind Tafjord,

Melanie Sclar, Yejin Choi, Yulia Tsvetkov, and Alane

Suhr. 2023. Quantifying language models’ sensitiv- ity to spurious features in prompt design or: How i learned to start worrying about prompt formatting. arXiv:2310.11324.

Peter Clark, and Ashish Sabharwal. 2023. Increasing probability mass on answer choices does not always improve accuracy. In Proceedings of the 2023 Con- ference on Empirical Methods in Natural Language Processing, pages 8392–8417, Singapore. Associa- tion for Computational Linguistics.

Shaden Smith, Mostofa Patwary, Brandon Norick,

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali

Patrick LeGresley, Samyam Rajbhandari, Jared Casper, Zhun Liu, Shrimai Prabhumoye, George Zerveas, Vijay Korthikanti, et al. 2022. Using deepspeed and megatron to train megatron-turing nlg 530b, a large-scale generative language model. arXiv:2201.11990.

Farhadi, and Yejin Choi. 2019. HellaSwag: Can a ma- chine really finish your sentence? In Proceedings of the 57th Annual Meeting of the Association for Com- putational Linguistics, pages 4791–4800, Florence, Italy. Association for Computational Linguistics.

Alon Talmor, Jonathan Herzig, Nicholas Lourie, and

Peiyuan Zhang, Guangtao Zeng, Tianduo Wang, and

Wei Lu. 2024. TinyLlama: An open-source small language model. arXiv:2401.02385.

Chujie Zheng, Hao Zhou, Fandong Meng, Jie Zhou, and

Jonathan Berant. 2019. CommonsenseQA: A ques- tion answering challenge targeting commonsense knowledge. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Tech- nologies, Volume 1 (Long and Short Papers), pages 4149–4158, Minneapolis, Minnesota. Association for Computational Linguistics.

Minlie Huang. 2024. Large Language Models Are Not Robust Multiple Choice Selectors. Proceedings of the International Conference on Learning Repre- sentations (ICLR).

Together Computer. 2023. RedPajama: an open dataset

for training large language models.

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier

Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard

13

<!-- page 14 of 29 -->

A FAQs · 常见问题

Q: Are there existing established protocols that differ from the proposed ones? Will they cause

resistance from the research community in adopting the OLMES standard?

The lack of “established protocols” is precisely the issue that our work addresses. As discussed in our Introduction and Related work sections, existing efforts either present different variations as open choices to users or are underspecified or under-documented (e.g., the rationale behind default choice is unexplained) and thus not followed by others in subsequent work. Therefore, there is no existing established protocol in the community – researchers across the field use different evaluation setups, with reasons behind their choices left unexplained, leading to different results and conclusions. We illustrate this in Table 1, with Table 14 showing an extended version to include score variations across different references on OPENBOOKQA in addition to ARC-CHALLENGE.

This is the main motivation for the standard, to reconcile the differences in practices so that scores reported in papers can be meaningfully interpreted and compared (as we show, a statement like “score on 25-shot ARC Challenge” is woefully underspecified, whereas “score on ARC Challenge

using OLMES” is a well-defined number without any ambiguity). We also justify each decision we make so that the community can, for the first time, appreciate the rationale behind the setups and thus encourage broad adoption.

Q: What is novel about OLMES?

Building on the many existing works that introduce new methodologies (e.g., new way of prompting, probability normalization, etc), OLMES is the first work of its kind to provide a completely open, practical, reproducible, and documented evaluation standard with justified choices so that results across research work can be meaningfully compared. This fills an important gap in current research on LLMs – the adoption of OLMES by model developers and other researchers will help unify evaluation practices in the field for the first time, significantly shifting current research paradigms.

Q: Why is OLMES more principled than trying a range of settings?

Rather than having to train a model from scratch to discover patterns in task formulation, run the different settings to choose a normalization scheme, or delve into the same literature again to study the variants, the community can now directly build upon the various choices in OLMES.

We hope to guide the community towards more well-documented and justifiable chosen evaluation

settings like OLMES without having to go through trying a mix of less informed choices (which we argue should be avoided altogether). Through extensive literature review and experimentation, we observe that some settings provide better signals than others, and document them in this work to guide the community to use them, a few examples include:

– CF gives a clearer signal early in training, which is helpful for developers to cheaply make

modeling decisions. On the other hand, MCF is a better indicator of performance later on. CF often works better for weaker models while MCF is at random, and MCF is a better representation of task performance for stronger models. – Few-shot prompting is an effective and universal way to convey a task to an LLM (more stable

learning curve than 0-shot) but going beyond 5 shots generally does not provide meaningful differences in scores. – For probability normalization, in BOOLQ the only answer choices are “yes” or “no” which

are single tokens, therefore no length normalization is needed. Even if for some models, the “character” normalization has slightly better performance on BOOLQ (see Table 9), one should

note that this is an accidental side effect of “yes” having one more character than “no” and indeed a normalization which changes the probability of “yes” vs “no” simply because the “no” token has fewer characters seem problematic.

14

<!-- page 15 of 29 -->

Not only are recommendations in OLMES backed by both existing literature and new experimental results, there is also little difference between the OLMES recommendation and the empirically best (“oracle”) normalization for each task and model, see “diff oracle” column. We argue that adopting such an approach is a better practice than blindly optimizing for the best performance e.g., problematically using “character” normalization for BOOLQ.

Q: Including a broader range of datasets?

The focus on multiple-choice datasets in OLMES is motivated by their frequent use in evaluating base LLMs, where the evaluation seems straightforward (did the model predict the right answer?) but in practice, a statement like “model X scores Y on ARC Challenge” is generally uninterpretable (with unspecified details and cannot be meaningfully compared across references) without a clear evaluation standard like OLMES. In this paper, we focused on datasets chosen to provide guidance useful for the training stage and evaluation of base models, which provides important insights into the potential of such models before further tuning (e.g., instruction-tuning).

Note that the fundamental principles of OLMES as introduced, generalize to any dataset of interest. Rather than viewing what we have illustrated in our paper as a fixed set, our goal is to use that as an illustration and empower researchers to move towards reproducible evaluation by applying OLMES to any dataset of interest suited for their own work.

Q: Evaluating on more models? What are some valuable insights from extended experiments?

We provide additional results in Appendix D, Table 13 with additional models. Evaluating different

models using OLMES provides valuable insights for understanding LLMs and model development. For instance, within each batch of model release by developers, models of bigger size perform better than smaller ones (see average scores of Pythia-6.7B outperforms Pythia-1B, OLMo-7B outperforms OLMo-1B, Llama2-13B outperforms Llama2-7B, Gemma2-9B outperforms Gemma2- 2B). However, size is not the only way to get to a stronger model, evaluating on OLMES also allow the community meaningful comparison of models to witness the effect of model improvement via better training data, model architecture, as well as other improved approaches as researchers iterate on their models e.g., OLMo-7B-0424’s improvement over initial OLMo-7B; Llama3-8B’s improvement over Llama2-7B and even Llama2-13B, Mixtral-8x7B-v0.1 outperforming the Mistral model, aligning with the insights reported in these model releases documenting their improved recipes and innovations for better models. Further, OLMES also gives meaningful comparison of model performance as researchers experiment to reduce computational costs, e.g., our results align with the original DeepSeekMoE paper where they “scale up DeepSeekMoE to 16B parameters and show that it achieves comparable performance with LLaMA2 7B, with only about 40% of computations”. All these underscore the applicability and value of OLMES in supporting unified evaluation as the field progress towards better models, as an open, well-documented, practical and reproducible evaluation standard. We make all prompts, examples, and code used for OLMES openly available, and encourage researchers to try it for any model of their interest be it one they are studying or building.

Q: How does OLMES stay relevant in the rapid evolution of AI and LLMs?

We have been continuously looking out for new LLMs and evaluating them using OLMES, showing

that the same guiding principles still apply as best practices providing a systematic, comparable approach. See extended evaluation results in Table 13.

As the field moves forward, we look forward to applying the principles of OLMES to more bench- marks and evaluating newer models using OLMES. While we are working on extending OLMES, we do not anticipate revisions to the currently established recommendations in OLMES any time soon as the guiding principles are built on top of a rich literature of existing work over the years and will likely remain relevant in the community for a while in the near future.

15

<!-- page 16 of 29 -->

Q: Why not use prompting techniques such as CoT or self-reflection?

While these prompting strategies have shown to be useful for instruction-tuned models, they tend

to be much less effective on base models, which is a focus of this work. E.g., some experiments we performed with MMLU showed that various CoT prompts (both zero-shot and few-shot) have a positive boost on instruction-tuned models (like Llama-3.1-8B-Instruct), but tend to lower the scores a bit for base models (like Llama-3.1-8B).

Q: How do you ensure that formatting settings are fair to all models?

Supported by reviewing common evaluation practices in the community and empirical evidence across a wide range of models, the recommendations we make are at least as reasonable and fair as the myriad of settings that have been used in the literature.

If a model is peculiar in any specific way (e.g., only able to do multiple choice questions with one type of answer label like “1.” or “2.”), it is not the goal of OLMES to tailor to such peculiarities as this standard is intended to be applied across a range of models and to encourage the development of models that produce reasonable outputs given any reasonable input.

Q: What happens when there are minor variants to OLMES?

Through OLMES, we provide best practices to evaluate language models and justify our choices. Our choices are mostly aligned with common practices in LLM evaluations, but with defining standards in formatting, choice of in-context examples, probability normalizations, and task formulation. In the process, we accounted for many factors, taking into consideration the robustness of OLMES under minor variations. We discuss some of these considerations here.

[Part 1] Order of presenting the options A/B/C/D:

The order of presenting the multiple-choice options A/B/C/D does not apply to CF since each answer is processed independently. For MCF it is indeed a confounder that some (especially weaker) models might highly prefer a given label (like B). The benchmarks in OLMES are generally balanced such that such a model would not be much better than random. Further, if this happens, CF would generally get a better score in such cases and OLMES would use that score in its final output. Therefore, having a setting where we use both CF (not affected by the order of options) and MCF (where the order of options may matter) makes sure the final metric will not be hugely affected by such factors. We considered applying more rigorous measures (like running all cyclic permutations of answer

choices) but decided for practical reasons, the extra processing time and complexity were not worth the minor improvements in robustness (as one consideration of OLMES is also to be a practical standard that does not take unnecessarily more compute than is needed).

[Part 2] Minor variations in prompt wording or few-shot examples:

To address potential concerns on minor variations in prompt wording or few-shot examples, we evaluated under three additional settings, while adhering to the general principles in OLMES:

Variant 1 (minor variation in prompting): 3 changes to OLMES prompt format - (1) change the label and text separator from “.” to “)”, (2) insert an additional new line before the answer descriptor, (3) change the “Answer” descriptor to “Correct answer”

Variant 2 (varying few-shot examples): Create a different set of curated few-shot examples by changing 3 out of the 5 in-context examples to new ones that are different from those in OLMES. In picking the new few-shot examples, the same recommendations were followed to ensure diversity in the examples and that they cover the label space. Variant 3 (minor variation in prompting + varying few-shot examples): Apply changes in both Variants 1 and 2 together.

16

<!-- page 17 of 29 -->

model ARC_E orig var 1 var 2 var 3 avg diff std err

Pythia-1B 63.4 63.3 62.7 62.7 63.0 0.4 1.5 Llama2-7B 84.0 84.4 83.4 84.4 84.0 0.0 1.2 DeepSeek-7B 80.6 80.9 80.5 80.4 80.6 0.0 1.3 Gemma2-2B 84.3† 83.2† 83.9† 82.8† 83.5 0.8 1.2 Llama3-8B 92.4† 92.5† 92.3† 93.1† 92.6 0.2 0.8

model OBQA orig var 1 var 2 var 3 avg diff std err

Pythia-1B 40.4 38.6 39.4 37.6 39.0 1.4 2.2 Llama2-7B 57.8 57.2 55.2 57.4 56.9 0.9 2.2 DeepSeek-7B 62.2† 61.0† 61.6† 63.2† 62.0 0.2 2.2 Gemma2-2B 68.8† 67.2† 68.8† 67.0† 68.0 0.8 2.1 Llama3-8B 77.2† 76.8† 78.8† 77.8† 77.7 0.5 1.9

model PIQA orig var 1 var 2 var 3 avg diff std err

Pythia-1B 68.9 69.2 69.2 69.3 69.1 0.2 1.5 Llama2-7B 77.5 77.2 77.7 77.8 77.5 0.0 1.3 DeepSeek-7B 79.3 78.8 80.9 80.6 79.9 0.6 1.3 Gemma2-2B 78.5 77.8 79.3 78.5 78.5 0.0 1.3 Llama3-8B 81.6 80.7 82.4 82.8 81.9 0.3 1.2

Table 5: Extended results comparing using OLMES (orig) and when the setting is subjected to minor variations in prompt wording (var1), few-shot examples (var2), or both (var3). † indicates the use of MCF. The “avg” score obtained via averaging orig, var1, var2, and var3 results is often within 1% of that obtained by the original OLMES setup (orig). We report the observed differences between averaging the 4 setups (“avg”) and directly using OLMES (orig) in the “diff” column, illustrating the minor differences (often <1%) do not justify the 4 times more compute needed, against the “practical” consideration in OLMES.

We report these additional results in Table 5. Following EleutherAI in calculat- ing standard error (https://github.com/EleutherAI/lm-evaluation-harness/blob/ ebe7226ebfb8d11a9fb8d6b53eb65891f895c633/lm_eval/api/metrics.py#L288), in the additional results, we also incorporated bounds on standard error in our evaluations using OLMES (see “std err” column). This provides a statistical bound on the degree of variation in reported numbers and illustrates that while any performance metric should be interpreted to have slight variants (e.g., < 2.5%), the scenario where a model underperforms significantly due to minor variants is unlikely statistically.

The additional results show that differences in performance between averaging variations vs. using the OLMES setup directly were generally minimal, typically less than 1 percent (the largest difference seen is 1.4%). This suggests that performance measured using OLMES is quite stable and consistent when subject to small changes in prompt wording or the selection of few-shot examples, within the general recommendations. Note that these variants still format the instances in natural ways and are slight modifications of the original settings of OLMES, still adhering to the general principles such as instance formatting that clarifies the task in a natural way and choice of in-context examples to cover a range of examples and different answer labels. Larger differences would be expected when diverging from OLMES recommendations such as by using unnatural prompts e.g., using rare symbols as answer labels, or randomly sampled few-shot examples which could run into skewed label distribution covered in few-shot examples or include noisy examples from train sets. We observe that current successful language models are generally robust to the OLMES evaluation standard. OLMES has been informed by prior efforts like HELM and Eleuther LM Evaluation Harness, therefore the prompts are designed to be natural, and suitable for evaluating language models.

17

<!-- page 18 of 29 -->

B Detailed CF and MCF task scores · CF 与 MCF 任务详细分数

Tables 6 and 7 present detailed scores across all tasks, with both MCF and CF results (using the OLMES recommendations for CF normalization).

表 6 和表 7 列出了所有任务的详细分数,以及 MCF 和 CF 结果（使用 OLMES 建议进行 CF 标准化）.

C Further details on variations · 评测变量的更多细节

In this appendix we discuss further details on how LLM evaluations can vary and the choices made in OLMES.

在本附录中,我们进一步详细讨论了 LLM 评估如何变化以及 OLMES 中做出的选择.

C.1 Task formulation details · 任务形式细节

LLM evaluations started out using the CF approach for many tasks (Brown et al., 2020; Du et al., 2022; Smith et al., 2022; Chowdhery et al., 2022; Lieber et al., 2021), which is a more reasonable option for weaker models that struggle with the more natural MCF (Khatun and Brown, 2024). The task formulation only very recently and gradually switched to the MCF approach when it became clear that the model could utilize it, producing higher scores (Robinson et al., 2023; OpenAI, 2024; AI@Meta, 2024).

LLM 评估开始对许多任务使用 CF 方法（Brown 等人,2020；Du 等人,2022；Smith 等人,2022；Chowdhery 等人,2022；Lieber 等人,2021）,对于与更自然的 MCF 作斗争的较弱模型来说,这是一个更合理的选择（Khatun 和 Brown,2024）.任务制定直到最近才逐渐转向 MCF 方法,当模型明确可以利用它并产生更高的分数时（Robinson 等人,2023；OpenAI,2024；AI@Meta,2024）.

The HELM study (Liang et al., 2023) included comparisons between the MCF (“joint”) and CF (“separate”) approaches, finding that certain models can really benefit from the MCF approach, although among the models in the original study it was really only the Anthropic-LM v4-s3 (52B) model which could take full advantage of it.

HELM 研究（Liang et al., 2023）包括 MCF（“联合”）和 CF（“单独”）方法之间的比较,发现某些模型确实可以从 MCF 方法中受益,尽管在原始研究的模型中实际上只有 Anthropic-LM v4-s3 (52B) 模型可以充分利用它.

C.2 CF normalization details · CF 归一化细节

Tables 10, 11 and 12 show detailed comparisons of CF normalization on different models, for the various tasks.

表 10、11 和 12 显示了针对各种任务的不同模型上 CF 归一化的详细比较.

Unlike in MCF, where the evaluation metric involves just scoring the log-likelihood corresponding to the answer choice label (i.e., A/B/C/...), there is a choice of log-likelihood normalization (“none”, “per token”, “per character” or “pmi”) for CF as detailed in Section 3.3.

与 MCF 不同,MCF 中的评估指标仅涉及对与答案选择标签（即 A/B/C/...）相对应的对数似然进行评分,CF 可以选择对数似然标准化（“无”、“每个标记”、“每个字符”或“pmi”）,如第 3.3 节所述.

When evaluating the GPT-3 model (Brown et al., 2020), they worked around this issue by normalizing the log-probability by the number of tokens in the answer (similar to how loss is computed during training). They also noted that for a few datasets, it worked markedly better to instead “normalize” by dividing by LLM probability of the same answer string without the presence of the question (usually by just having a generic prefix like "Answer: <answer_string>"). This can be considered a form of pointwise-mutual-information (PMI) and was explored further in other works (Holtzman et al., 2021).

在评估 GPT-3 模型（Brown 等人,2020）时,他们通过根据答案中的标记数量标准化对数概率来解决这个问题（类似于训练期间损失的计算方式）.他们还指出,对于一些数据集,通过在不存在问题的情况下除以相同答案字符串的 LLM 概率（通常只使用像“答案：<answer_string>”这样的通用前缀）来“标准化”效果明显更好.这可以被认为是逐点互信息 (PMI) 的一种形式,并在其他作品中进行了进一步探讨（Holtzman 等人,2021）.

The Eleuther LM Evaluation Harness (Gao et al., 2023; Biderman et al., 2024) and some subsequent evaluations (e.g., the Llama models (Touvron et al., 2023a)) have also used “per answer character” normalization, using the argumentation (Gao, 2021; Biderman et al., 2024), that normalizing per token is problematic since it depends on the tokenizer. Since the purpose of the normalization is simply to rank the answer choices within themselves (keeping model and tokenizer fixed), this does not seem like a relevant argument, and indeed a normalization which changes the probability of “yes” vs “no” simply because the “no” token has fewer characters seem problematic. In practice, for tasks where answers are either relatively long or similar in length, there are minor differences between these two length normalizations.

Eleuther LM 评估工具（Gao 等人,2023；Biderman 等人,2024）和一些后续评估（例如 Llama 模型（Touvron 等人,2023a））也使用了“每个答案字符”标准化,使用论证（Gao,2021；Biderman 等人,2024）,每个标记的标准化是有问题的,因为它取决于分词器.由于标准化的目的只是对答案选择进行排序（保持模型和分词器固定）,这似乎不是一个相关的论点,实际上,仅仅因为“否”标记具有较少的字符而改变“是”与“否”的概率的标准化似乎是有问题的.实际上,对于答案相对较长或长度相似的任务,这两种长度标准化之间存在细微差别.

The HELM study (Liang et al., 2023) included comparisons between these normalization approaches for a number of tasks and models (using the terms “separate” and “separate calibrated” for “token” and “pmi” respectively), eventually settling on a default choice for each, not unlike the choices in the GPT-3

HELM 研究（Liang 等人,2023）包括对多个任务和模型的这些标准化方法之间的比较（分别对“token”和“pmi”使用术语“单独”和“单独校准”）,最终为每个任务和模型确定默认选择,与 GPT-3 中的选择不同

report (Brown et al., 2020). The Eleuther LM Evaluation Harness generally reports two metrics for each multiple-choice task: acc (using the “none” normalization) and acc_norm (using the “character” normalization).

报告（Brown 等人,2020）. Eleuther LM 评估工具通常为每个多项选择任务报告两个指标：acc（使用“无”标准化）和 acc_norm（使用“字符”标准化）.

C.2.1 Tasks that generally prefer CF · 通常偏好 CF 的任务

HELLASWAG and WINOGRANDE continue to have CF scores higher than MCF scores even for the strongest models that can understand the MCF prompt. This somewhat surprising tendency seems correlated with the fact that these tasks in the CF format are exactly like the language modeling task of finding the most natural continuation of a running piece of text. Judging from the trends in the plot, it would also be

即使对于能够理解 MCF 提示的最强模型,HELLASWAG 和 WINOGRANDE 的 CF 分数仍然高于 MCF 分数.这种有点令人惊讶的趋势似乎与以下事实相关：CF 格式中的这些任务与寻找正在运行的文本片段的最自然延续的语言建模任务完全相同.从剧情的走向来看,也是如此

18

<!-- page 19 of 29 -->

ARC_C ARC_E BoolQ CSQA HSwag MMLU model MCF CF MCF CF MCF CF MCF CF MCF CF MCF CF

ARC_C ARC_E BoolQ CSQA HSwag MMLU 模型 MCF CF MCF CF MCF CF MCF CF MCF CF MCF CF

Pythia-1B 24.1 31.4 24.0 63.4 56.8 56.6 21.0 50.9 23.6 48.0 26.5 31.1 OLMo-1B 25.3 38.6 25.4 68.3 37.9 51.3 20.2 62.2 24.6 65.2 26.6 33.4 TinyLlama-1.1B 26.4 38.1 24.3 69.5 60.7 63.6 17.9 61.1 26.2 60.8 26.2 33.6 Pythia-6.7B 26.6 44.6 24.9 72.6 64.0 68.7 20.5 62.1 24.3 66.1 25.4 37.7 RPJ-INCITE-7B 28.1 45.3 25.1 78.8 64.2 72.0 19.7 69.2 23.5 72.8 29.0 40.1 StableLM2-1.6B 50.6 47.3 69.6 75.3 60.1 82.3 70.4 68.2 52.4 70.3 40.4 37.1 OLMo-7B 27.2 46.4 27.0 78.9 67.5 78.7 20.8 70.8 25.0 78.1 28.3 40.5 MPT-7b 27.9 45.7 27.5 78.0 44.6 82.4 20.9 70.9 26.4 79.6 30.0 40.6 Falcon-7B 27.2 49.7 25.3 80.6 48.1 78.2 20.2 73.4 27.7 79.0 28.0 42.1 Llama2-7B 52.6 54.2 70.6 84.0 57.5 86.1 59.2 74.2 41.4 78.9 46.2 44.4 Llama2-13B 67.3 56.2 85.0 85.9 77.8 86.7 68.1 74.0 62.4 83.9 55.8 47.6 OLMo-7B-0424 66.9 51.2 83.6 81.5 82.0 85.9 85.8 70.4 50.0 80.1 54.4 42.4 Llama3-8B 79.3 57.1 92.4 86.6 84.8 87.5 73.9 69.9 63.8 81.8 66.6 51.1 Mistral-7B-v0.1 78.6 59.6 90.8 86.8 87.2 89.3 72.4 72.3 71.5 83.0 64.0 50.3 Llama3-70B 93.7 69.0 97.7 89.6 91.7 91.2 83.2 75.8 89.1 89.5 79.8 60.7

Table 6: Comparing MCF and CF scores on each task (part 1). Weaker models at the top of the table have near-random MCF scores, while for stronger models at the bottom, the MCF score provides a better assessment than the CF score.

OBQA PIQA SIQA WinoG average scores model MCF CF MCF CF MCF CF MCF CF MCF CF all max

OBQA PIQA SIQA WinoG 平均分数模型 MCF CF MCF CF MCF CF MCF CF MCF CF 全部最大

Pythia-1B 26.0 40.4 52.2 68.9 33.5 46.4 50.4 52.7 33.8 49.0 41.4 49.0 OLMo-1B 28.0 47.6 50.6 74.1 32.8 51.5 51.1 59.3 32.3 55.1 43.7 55.1 TinyLlama-1.1B 25.6 45.0 50.2 71.7 34.9 50.4 50.0 60.1 34.2 55.4 44.8 55.4 Pythia-6.7B 26.2 50.4 51.2 74.9 33.5 51.7 49.6 62.3 34.6 59.1 46.9 59.1 RPJ-INCITE-7B 22.6 49.0 53.5 75.9 33.7 56.6 52.1 68.0 35.1 62.8 49.0 62.8 StableLM2-1.6B 56.6 51.0 62.8 75.6 64.3 61.1 53.5 65.7 58.1 63.4 60.7 65.1 OLMo-7B 27.0 55.8 57.2 78.5 35.1 56.5 50.4 68.5 36.6 65.3 50.9 65.3 MPT-7b 29.6 52.4 53.8 79.2 34.4 57.4 51.1 70.2 34.6 65.6 50.1 65.6 Falcon-7B 27.8 55.2 50.5 79.0 33.9 60.1 49.0 71.3 33.8 66.9 50.3 66.9 Llama2-7B 54.8 57.8 63.2 77.5 58.7 59.6 52.4 71.7 55.7 68.8 62.2 69.0 Llama2-13B 65.4 60.8 74.0 80.2 65.9 63.6 56.1 74.9 67.8 71.4 69.6 74.0 OLMo-7B-0424 68.6 59.8 65.6 80.3 76.1 54.9 56.2 73.6 68.9 68.0 68.5 75.5 Llama3-8B 77.2 56.2 77.3 81.6 70.2 62.6 61.6 76.2 74.7 71.0 72.9 78.7 Mistral-7B-v0.1 80.6 61.0 79.0 82.8 71.3 63.0 59.8 77.9 75.5 72.6 74.1 79.1 Llama3-70B 93.4 69.0 91.6 83.1 78.9 65.6 79.6 84.1 87.9 77.8 82.8 88.4

Table 7: Comparing MCF and CF scores on each task (part 2), along with overall averages. The “max” average corresponds to the OLMES score, taking the best of MCF and CF for each task.

19

<!-- page 20 of 29 -->

model MCF-macro MCF-micro CF-macro CF-micro

Pythia-6.7B 25.4 25.2 37.7 37.5 TinyLlama-1.1B 26.2 25.7 33.6 33.5 Pythia-1B 26.5 26.4 31.1 31.2 OLMo-1B 26.6 26.3 33.4 33.6 Falcon-7B 28.0 27.7 42.1 41.9 OLMo-7B 28.3 28.3 40.5 40.7 RPJ-INCITE-7B 29.0 28.4 40.1 40.1 MPT-7b 30.0 29.3 40.6 40.6 StableLM2-1.6B 40.4 39.6 37.1 37.0 Llama2-7B 46.2 45.5 44.4 44.3 OLMo-7B-0424 54.4 52.8 42.4 42.4 Llama2-13B 55.8 55.5 47.6 47.1 Mistral-7B-v0.1 64.0 63.0 50.3 49.8 Llama3-8B 66.6 65.4 51.1 50.8 Llama3-70B 79.8 79.2 60.7 60.5

Table 8: Macro vs micro average scores on MMLU, where macro average is over the 57 tasks and micro average is over the 14042 individual questions. In general there are small differences between the two.

ARC_C ARC_E BoolQ CSQA HSwag MMLU OBQA PIQA SIQA model pmi diff char diff none diff pmi diff char diff char diff pmi diff char diff char diff

ARC_C ARC_E BoolQ CSQA HSwag MMLU OBQA PIQA SIQA 模型 pmi diff char diff 无 diff pmi diff char diff char diff pmi diff char diff char diff

Pythia-1B 31.4 0.0 63.4 0.0 56.6 4.5 50.9 0.0 48.0 0.0 31.1 1.2 40.4 0.0 68.9 1.4 46.4 0.0 OLMo-1B 38.6 0.0 68.3 0.2 51.3 4.7 62.2 0.0 65.2 0.0 33.4 0.8 47.6 0.0 74.1 0.0 51.5 0.0 TinyLlama-1.1B 38.1 0.0 69.5 0.0 63.6 2.2 61.1 0.0 60.8 0.0 33.6 0.9 45.0 0.0 71.7 0.6 50.4 0.0 Pythia-6.7B 44.6 0.0 72.6 0.0 68.7 0.0 62.1 0.2 66.1 0.0 37.7 0.2 50.4 0.0 74.9 0.0 51.7 1.1 RPJ-INCITE-7B 45.3 0.0 78.8 0.0 72.0 2.5 69.2 0.2 72.8 0.0 40.1 0.8 49.0 0.0 75.9 0.1 56.6 0.0 MPT-7b 45.7 0.6 78.0 0.0 82.4 0.0 70.9 0.0 79.6 0.0 40.6 0.0 52.4 0.0 79.2 0.0 57.4 0.0 Falcon-7B 49.7 0.0 80.6 0.0 78.2 0.6 73.4 0.0 79.0 0.0 42.1 0.0 55.2 0.0 79.0 0.2 60.1 0.0 OLMo-7B 46.4 0.0 78.9 0.0 78.7 0.0 70.8 0.0 78.1 0.0 40.5 0.1 55.8 0.0 78.5 0.8 56.5 0.0 StableLM2-1.6B 47.3 0.0 75.3 0.0 82.3 0.0 68.2 0.0 70.3 0.0 37.1 1.5 51.0 0.0 75.6 0.3 61.1 0.0 Llama2-7B 54.2 0.0 84.0 0.0 86.1 0.0 74.2 0.0 78.9 0.0 44.4 0.4 57.8 0.0 77.5 0.2 59.6 0.0 OLMo-7B-0424 51.2 0.0 81.5 0.0 85.9 0.0 70.4 1.1 80.1 0.0 42.4 0.0 59.8 0.0 80.3 0.0 54.9 0.8 Llama2-13B 56.2 0.9 85.9 0.0 86.7 1.5 74.0 0.0 83.9 0.0 47.6 0.0 60.8 0.0 80.2 0.0 63.6 0.0 Llama3-8B 57.1 1.3 86.6 0.0 87.5 0.3 69.9 4.3 81.8 0.0 51.1 0.0 56.2 0.0 81.6 0.0 62.6 0.0 Mistral-7B-v0.1 59.6 0.6 86.8 0.0 89.3 0.0 72.3 2.1 83.0 0.0 50.3 0.0 61.0 0.0 82.8 0.0 63.0 0.0 Llama3-70B 69.0 0.0 89.6 0.8 91.2 0.5 75.8 1.3 89.5 0.0 60.7 0.0 69.0 0.0 83.1 0.1 65.6 0.0

Table 9: Normalization details, showing that our recommendations are not only supported by reasoning using principles behind the normalization but also close to the empirically best normalization that lets you get the highest accuracy for each model on each task (see “diff” columns).

ARC_C ARC_E BoolQ model none char tok pmi best none char tok pmi best none char tok pmi best

ARC_C ARC_E BoolQ 模型 无 char tok pmi 最佳 无 char tok pmi 最佳 无 char tok pmi 最佳

Pythia-1B 26.1 28.4 29.0 31.4 pmi 61.9 63.4 60.9 56.5 char 56.6 61.1 56.6 41.0 char OLMo-1B 32.9 34.4 34.7 38.6 pmi 68.5 68.3 65.8 60.2 none 51.3 56.0 51.3 42.3 char TinyLlama-1.1B 31.5 34.1 32.2 38.1 pmi 68.6 69.5 64.4 60.4 char 63.6 65.8 63.6 53.6 char Pythia-6.7B 36.3 39.5 39.0 44.6 pmi 71.4 72.6 70.0 64.1 char 68.7 66.9 68.7 47.6 none RPJ-INCITE-7B 40.3 43.5 42.9 45.3 pmi 76.1 78.8 75.9 70.1 char 72.0 74.5 72.0 72.4 char MPT-7b 41.7 46.3 44.7 45.7 char 76.3 78.0 76.2 68.5 char 82.4 79.9 82.4 76.7 none Falcon-7B 41.6 47.4 47.6 49.7 pmi 77.0 80.6 78.3 69.8 char 78.2 78.8 78.2 77.6 char OLMo-7B 41.6 45.5 45.0 46.4 pmi 76.7 78.9 77.4 69.6 char 78.7 77.7 78.7 78.6 none StableLM2-1.6B 42.2 44.3 44.9 47.3 pmi 73.3 75.3 74.4 70.0 char 82.3 82.0 82.3 76.1 none Llama2-7B 48.4 52.0 50.2 54.2 pmi 81.4 84.0 81.0 74.7 char 86.1 85.6 86.1 80.5 none OLMo-7B-0424 45.5 49.3 48.5 51.2 pmi 79.2 81.5 79.7 71.1 char 85.9 83.8 85.9 85.6 none Llama2-13B 52.4 57.1 54.2 56.2 char 83.9 85.9 82.8 77.6 char 86.7 88.2 86.7 77.5 char Llama3-8B 53.6 58.4 56.8 57.1 char 85.8 86.6 85.8 76.6 char 87.5 87.8 87.5 67.0 char Mistral-7B-v0.1 56.1 60.2 58.9 59.6 char 84.7 86.8 84.6 78.6 char 89.3 89.1 89.3 89.2 none Llama3-70B 65.7 69.0 67.7 69.0 char 89.7 89.6 90.4 82.6 tok 91.2 90.4 91.2 91.7 pmi

average scores 43.7 47.3 46.4 49.0 NA 77.0 78.7 76.5 70.0 NA 77.4 77.8 77.4 70.5 NA

win percentage 0.0 33.3 0.0 66.7 pmi 6.7 86.7 6.7 0.0 char 46.7 46.7 0.0 6.7 none

Table 10: Comparing CF normalization schemes (part 1).

20

<!-- page 21 of 29 -->

CSQA HSwag MMLU model none char tok pmi best none char tok pmi best none char tok pmi best

CSQA HSwag MMLU 模型 无 char tok pmi 最佳 无 char tok pmi 最佳 无 char tok pmi 最佳

Pythia-1B 47.7 50.9 47.3 50.9 char 39.2 48.0 47.8 41.0 char 29.5 31.1 30.8 32.3 pmi OLMo-1B 56.8 60.0 57.6 62.2 pmi 50.9 65.2 64.1 49.8 char 31.7 33.4 33.3 34.2 pmi TinyLlama-1.1B 58.9 60.5 55.9 61.1 pmi 46.9 60.8 59.7 48.5 char 31.2 33.6 33.0 34.5 pmi Pythia-6.7B 59.5 62.2 58.9 62.1 char 50.4 66.1 65.9 53.5 char 34.9 37.7 37.0 37.9 pmi RPJ-INCITE-7B 67.7 69.4 67.2 69.2 char 55.7 72.8 71.8 60.6 char 37.4 40.1 40.0 40.9 pmi MPT-7b 69.6 70.3 69.1 70.9 pmi 60.5 79.6 76.5 61.5 char 37.8 40.6 40.1 40.4 char Falcon-7B 70.0 70.3 69.5 73.4 pmi 60.7 79.0 78.4 60.0 char 39.3 42.1 41.9 42.1 char OLMo-7B 69.0 70.0 67.9 70.8 pmi 59.3 78.1 76.3 64.2 char 37.9 40.5 40.5 40.6 pmi StableLM2-1.6B 63.6 66.3 65.6 68.2 pmi 54.7 70.3 69.7 56.4 char 35.2 37.1 37.1 38.6 pmi Llama2-7B 70.5 72.7 68.4 74.2 pmi 61.9 78.9 77.1 64.4 char 42.0 44.4 43.9 44.8 pmi OLMo-7B-0424 71.6 63.5 59.0 70.4 none 61.4 80.1 77.7 65.2 char 39.9 42.4 42.2 41.8 char Llama2-13B 72.2 72.7 68.4 74.0 pmi 63.7 83.9 81.0 70.3 char 44.3 47.6 46.7 47.1 char Llama3-8B 72.0 74.2 73.5 69.9 char 62.8 81.8 80.3 71.1 char 47.5 51.1 50.8 49.6 char Mistral-7B-v0.1 73.1 73.8 74.4 72.3 tok 64.5 83.0 81.0 70.3 char 46.9 50.3 50.0 49.0 char Llama3-70B 77.1 77.1 77.1 75.8 char 70.3 89.5 87.1 80.8 char 57.2 60.7 60.5 59.4 char

average scores 66.6 67.6 65.3 68.4 NA 57.5 74.5 73.0 61.2 NA 39.5 42.2 41.9 42.2 NA

win percentage 6.7 33.3 6.7 53.3 pmi 0.0 100.0 0.0 0.0 char 0.0 46.7 0.0 53.3 pmi

Table 11: Comparing CF normalization schemes (part 2)

OBQA PIQA SIQA model none char tok pmi best none char tok pmi best none char tok pmi best

OBQA PIQA SIQA 模型 无 char tok pmi 最佳 无 char tok pmi 最佳 无 char tok pmi 最佳

Pythia-1B 20.2 28.6 30.4 40.4 pmi 70.3 68.9 68.8 60.1 none 42.8 46.4 46.0 44.4 char OLMo-1B 26.0 33.0 38.4 47.6 pmi 73.2 74.1 73.2 59.9 char 45.3 51.5 49.9 47.3 char TinyLlama-1.1B 24.4 34.8 35.8 45.0 pmi 72.1 71.7 72.3 62.0 tok 45.6 50.4 48.2 48.4 char Pythia-6.7B 25.8 37.0 37.4 50.4 pmi 74.8 74.9 74.3 63.6 char 48.0 51.7 52.8 49.2 tok RPJ-INCITE-7B 31.8 40.0 42.8 49.0 pmi 74.9 75.9 76.0 61.9 tok 50.8 56.6 56.0 52.2 char MPT-7b 31.6 43.8 43.8 52.4 pmi 77.7 79.2 78.1 63.7 char 51.0 57.4 55.9 52.5 char Falcon-7B 35.2 45.8 44.4 55.2 pmi 78.3 79.0 79.2 63.2 tok 52.9 60.1 57.5 54.4 char OLMo-7B 33.2 42.8 45.0 55.8 pmi 78.2 78.5 79.3 65.2 tok 50.3 56.5 56.5 52.8 char StableLM2-1.6B 34.4 41.6 45.2 51.0 pmi 75.2 75.6 75.9 63.6 tok 52.7 61.1 60.7 56.1 char Llama2-7B 33.8 44.6 45.0 57.8 pmi 76.7 77.5 77.7 62.9 tok 52.6 59.6 58.3 53.6 char OLMo-7B-0424 37.2 48.4 49.6 59.8 pmi 78.5 80.3 79.3 66.3 char 53.5 54.9 54.3 55.7 pmi Llama2-13B 39.2 46.4 48.4 60.8 pmi 78.9 80.2 79.8 66.4 char 56.7 63.6 60.7 56.8 char Llama3-8B 37.0 47.6 50.0 56.2 pmi 79.7 81.6 81.1 67.5 char 54.6 62.6 60.1 56.4 char Mistral-7B-v0.1 38.2 48.4 50.0 61.0 pmi 80.8 82.8 81.3 67.4 char 55.6 63.0 60.9 57.5 char Llama3-70B 47.0 55.0 56.6 69.0 pmi 82.8 83.1 83.2 68.3 tok 59.7 65.6 64.8 57.3 char

average scores 33.0 42.5 44.2 54.1 NA 76.8 77.6 77.3 64.1 NA 51.5 57.4 56.2 53.0 NA

win percentage 0.0 0.0 0.0 100.0 pmi 6.7 46.7 46.7 0.0 char 0.0 86.7 6.7 6.7 char

Table 12: Comparing CF normalization schemes (part 3).

21

<!-- page 22 of 29 -->

interesting to monitor if as even more capable models are developed, the MCF scores will eventually surpass that of the CF scores (given how close they already get to each other).

有趣的是,随着功能更强大的模型被开发出来,MCF 分数最终将超过 CF 分数（考虑到它们已经非常接近）.

C.2.2 Hybrid formulation · 混合任务形式

In CF, overall probability score could be quite misleading since it may heavily favor shorter answers with fewer tokens. Note that this would be different if the answer choices are actually listed before scoring the answer string, then most tokens (after the choice has been disambiguated by the first few tokens) would have probability near one. This “hybrid” formulation has been used in some cases, but usually scores in between the CF and MCF approaches (Wiegreffe et al., 2023). However, this hybrid approach is not popular in evaluation standardization efforts like the Open LLM Leaderboard, HELM, or when used to evaluate models during development, so it is not a focus in OLMES.

在 CF 中,总体概率得分可能会产生很大的误导,因为它可能非常倾向于使用较少标记的较短答案.请注意,如果在对答案字符串进行评分之前实际上列出了答案选项,则情况会有所不同,那么大多数标记（在通过前几个标记消除选择歧义之后）的概率将接近 1.这种“混合”公式已在某些情况下使用,但通常得分介于 CF 和 MCF 方法之间（Wiegreffe 等人,2023）.然而,这种混合方法在 Open LLM Leaderboard、HELM 等评估标准化工作中并不流行,或者在开发过程中用于评估模型时并不流行,因此它不是 OLMES 的重点.

C.3 Tokenization of MCQA choice labels · MCQA 选项标签的分词

When formatting multiple-choice questions, OLMES specifies the use of a prefix space in front of each

当格式化多项选择题时,OLMES 指定在每个选项前面使用前缀空格

answer choice, that is "\n A. <choice>" rather than "\nA. <choice>". Figure 3 shows explicit examples of tokenizers where this helps maintain a correspondence between the token for the answer label and the token in the final answer (e.g., "\nAnswer: A"). E.g., for the Llama tokenizer, the consistent token is the "_A" rather than the separate token "A" you get without the prefix space.

答案选择,即“\n A.<choice>”而不是“\nA.<choice>”.图 3 显示了标记器的显式示例,这有助于维护答案标签的标记与最终答案中的标记之间的对应关系（例如“\n答案：A”）.例如,对于 Llama 标记器,一致标记是“_A”,而不是您在没有前缀空格的情况下获得的单独标记“A”.

> from transformers import AutoTokenizer

> llama_tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")

> llama_tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")

> olmo_tokenizer = AutoTokenizer.from_pretrained("allenai/OLMo-7B-0424-hf")

> olmo_tokenizer = AutoTokenizer.from_pretrained("allenai/OLMo-7B-0424-hf")

> test_string = "What is 3+4?\n A. 7\nA. 7\nAnswer: A"

> llama_tokenizer.tokenizer(test_string)

[’_What’, ’_is’, ’_’, ’3’, ’+’, ’4’, ’?’, ’<0x0A>’, ’_A’, ’.’, ’_’, ’7’, ’<0x0A>’, ’A’, ’.’, ’_’,

’7’, ’<0x0A>’, ’Answer’, ’:’, ’_A’]

> olmo_tokenizer.tokenizer(test_string)

[’What’, ’˙Gis’, ’˙G3’, ’+’, ’4’, ’?’, ’˙C’, ’˙GA’, ’.’, ’˙G7’, ’˙C’, ’A’, ’.’, ’˙G7’, ’˙C’, ’Answer’,

’:’, ’˙GA’]

Figure 3: Tokenizer example, showing two examples of tokenizers which need a prefix space before MCQA answer choice labels to represent the choice label and the final answer label using the same token.

D Extended OLMES result table · OLMES 扩展结果表

Table 13 shows OLMES evaluations across an extended set of 40 models. Table 14 shows an extended version of Table 1 which includes score variations across different references on OPENBOOKQA in addition to ARC-CHALLENGE.

E HELM Reproduction of MMLU · HELM 的 MMLU 复现

In Figure 4 we see data taken from HELM’s reproduction of MMLU scores for a variety of models.

在图 4 中,我们看到了从 HELM 再现各种模型的 MMLU 分数中获取的数据.

F Compute used · 计算资源

The inference on the models evaluated were done on NVIDIA RTX A6000 GPUs. A total of around 400 GPU hours was used.

评估模型的推理是在 NVIDIA RTX A6000 GPU 上完成的.总共使用了大约 400 个 GPU 小时.

G Curation of 5-shot examples: considerations · 5-shot 示例策划考量

Procedure for manually curating the few-shot examples:

手动管理少数样本的过程：

• Download the train set from Hugging Face datasets

• Start from the beginning of the training set, looking at a batch of 10 (i.e., start with first 10)

• 从训练集的开头开始,查看 10 个批次（即从前 10 个开始）

22

<!-- page 23 of 29 -->

model ARC_C ARC_E BoolQ CSQA HSwag MMLU OBQA PIQA SIQA WinoG average

模型 ARC_C ARC_E BoolQ CSQA HSwag MMLU OBQA PIQA SIQA WinoG 平均

Pythia-1B 31.4 63.4 56.8† 50.9 48.0 31.1 40.4 68.9 46.4 52.7 49.0 OLMo-1B-0724 36.4 53.5 66.8 42.4 67.5 32.0 44.2 74.0 45.2 62.9 52.5 OLMo-1B 38.6 68.3 51.3 62.2 65.2 33.4 47.6 74.1 51.5 59.3 55.1 TinyLlama-1.1B 38.1 69.5 63.6 61.1 60.8 33.6 45.0 71.7 50.4 60.1 55.4 Qwen2-0.5B 48.4† 64.9† 64.3 56.2 48.9 45.3† 51.6† 67.9 54.7† 56.1 55.8 Llama3.2-1B 43.5 71.6 69.4 59.6 67.3 38.2 42.0 73.7 52.0 62.5 58.0 Pythia-6.7B 44.6 72.6 68.7 62.1 66.1 37.7 50.4 74.9 51.7 62.3 59.1 RPJ-INCITE-7B 45.3 78.8 72.0 69.2 72.8 40.1 49.0 75.9 56.6 68.0 62.8 Gemma-2B 49.9 80.2 76.6 68.9 72.5 41.7† 52.4 76.1 57.1 66.1 64.2 StableLM2-1.6B 50.6† 75.3 82.3 70.4† 70.3 40.4† 56.6† 75.6 64.3† 65.7 65.1 OLMo-7B 46.4 78.9 78.7 70.8 78.1 40.5 55.8 78.5 56.5 68.5 65.3 MPT-7b 45.7 78.0 82.4 70.9 79.6 40.6 52.4 79.2 57.4 70.2 65.6 Zamba2-1.2B 55.0† 85.4 76.1 70.1 73.4 44.7† 59.8† 76.6 58.4 67.2 66.7 Falcon-7B 49.7 80.6 78.2 73.4 79.0 42.1 55.2 79.0 60.1 71.3 66.9 DCLM-1B 57.6† 79.5 80.9 71.3 75.1 48.5† 60.0† 76.6 60.5† 68.1 67.8 DeepSeek-MoE-16B 53.4 82.7 81.9 72.7 80.4 45.5† 58.4 80.1 59.9 73.2 68.8 Llama2-7B 54.2 84.0 86.1 74.2 78.9 46.2† 57.8 77.5 59.6 71.7 69.0 DeepSeek-7B 57.2† 80.6 84.8 74.0 80.4 48.7† 62.2† 79.3 65.1† 72.5 70.5 Qwen2-1.5B 68.6† 85.2† 75.3 72.0† 67.6 56.5† 74.6† 75.7 65.3† 64.5 70.5 OLMoE-1B-7B-0924 62.1† 84.2 79.2 72.9 80.0 54.1† 65.4† 79.8 63.0† 70.2 71.1 Gemma2-2B 67.5† 84.3† 83.6 66.4† 74.6 53.3† 68.8† 78.5 64.7† 71.8 71.3 Llama3.2-3B 69.6† 85.1† 78.3 69.0 77.0 57.8† 67.2† 77.4 64.9† 69.9 71.6 JetMoE-8B 61.4† 81.9† 85.7 75.3† 81.7 49.1† 68.0† 80.3 71.3† 70.7 72.5 Llama2-13B 67.3† 85.9 86.7 74.0 83.9 55.8† 65.4† 80.2 65.9† 74.9 74.0 OLMo-7B-0424 66.9† 83.6† 85.9 85.8† 80.1 54.4† 68.6† 80.3 76.1† 73.6 75.5 OLMo-7B-0724 68.0† 85.7† 85.3 85.4† 80.5 54.9† 67.6† 79.3 76.1† 73.2 75.6 DeepSeek-V2-Lite 74.0† 88.9† 84.7 73.8 81.9 58.8† 72.4† 80.2 69.1† 74.0 75.8 Qwen1.5-MoE-A2.7B 77.4† 91.6† 85.0 81.4† 80.0 62.4† 80.6† 81.0 74.1† 72.3 78.6 Llama3-8B 79.3† 92.4† 87.5 73.9† 81.8 66.6† 77.2† 81.6 70.2† 76.2 78.7 Mistral-7B-v0.3 78.3† 91.1† 88.4 72.7† 83.1 63.5† 80.0† 81.9 71.2† 77.7 78.8 Llama3.1-8B 79.5† 91.7† 88.5 74.3† 81.6 66.9† 78.6† 81.1 71.4† 76.6 79.0 Mistral-7B-v0.1 78.6† 90.8† 89.3 72.4† 83.0 64.0† 80.6† 82.8 71.3† 77.9 79.1 DCLM-7B 79.8† 92.3† 87.0 77.0 82.3 64.4† 79.6† 80.1 71.2† 77.3 79.1 Qwen2-7B 88.1† 95.3† 88.9 81.2† 86.4† 71.8† 88.2† 86.0† 78.0† 75.1 83.9 Gemma2-9B 89.5† 95.5† 89.4 78.8† 87.3† 70.6† 88.4† 86.1† 76.0† 78.8 84.0 Mixtral-8x7B-v0.1 87.1† 96.1† 90.0† 78.3† 86.7 71.9† 87.0† 86.1† 75.1† 82.6 84.1 Zamba2-7B 92.2† 96.7† 89.3 84.0† 89.4† 68.5† 84.2† 86.5† 77.7† 79.6 84.8 Llama3.1-70B 92.8† 97.4† 91.9 81.7† 89.4 79.1† 92.6† 91.2† 80.6† 84.5 88.1 Llama3-70B 93.7† 97.7† 91.7† 83.2† 89.5 79.8† 93.4† 91.6† 78.9† 84.1 88.4 Qwen2.5-72B 95.5† 98.8† 91.9† 89.7† 97.5† 85.3† 97.4† 94.0† 82.2† 84.3† 91.7

Table 13: Extended reproducible performance scores across models and tasks using OLMES, providing robust, meaningful comparisons across a wide range of models and tasks. † indicates use of the MCF score.

23

<!-- page 24 of 29 -->

ARC-CHALLENGE Evaluations: OPENBOOKQA Evaluations: Model↓ Ref1 Ref2 Ref3 Ref4 Ref5 Ref6 OLMES Ref2 Ref4 Ref5 Ref7 Ref8 OLMES

MPT-7B 47.7 42.6 46.5 45.7 51.4 48.6 52.4 RPJ-INCITE-7B 46.3 42.8 45.3 49.4 49.0 Falcon-7B 47.9 42.4 44.5 47.5 49.7 51.6 44.6 53.0 26.0† 55.2 Mistral-7B 60.0 55.5 54.9 78.6† 52.2 77.6† 80.6†

Llama2-7B 53.1 45.9 43.2 45.9 48.5 53.7† 54.2 58.6 58.6 48.4 58.6 54.4† 57.8 Llama2-13B 59.4 49.4 48.8 49.4 67.6† 67.3† 57.0 57.0 57.0 63.4† 65.4†

Llama3-8B 60.2 78.6† 79.3† 76.6† 77.2†

Num shots 25 0 0 0 0 25 5 0 0 0 0 5 5 Curated shots No No Yes No Yes Formulation CF CF CF? CF CF MCF MCF/CF CF CF CF CF MCF MCF/CF Normalization char char ? char? pmi none none/pmi pmi pmi? pmi pmi? none none/pmi

Ref Reference citation Ref Reference citation

Ref1 HF Open LLM Leaderboard (Beeching et al., 2023) Ref5 OLMo paper (Groeneveld et al., 2024) Ref2 Llama2 paper (Touvron et al., 2023a) Ref6 Llama3 model card (AI@Meta, 2024) Ref3 Mistral 7B (Jiang et al., 2023) Ref7 Gemma paper (Gemma Team et al., 2024) Ref4 Falcon paper (Almazrouei et al., 2023) Ref8 HELM Lite Leaderboard (Liang et al., 2023)

Table 14: Extended version of Table 1 showing scores reported in different references for LLM performances on ARC-CHALLENGE and OPENBOOKQA. Scores indicated with † are using multiple-choice formulation (MCF) rather than “cloze” formulation (CF) (see Section 2.1 for definitions). Entries with “?” denote either undocumented or mixed approaches across models. Different references use different evaluation setups, some of which are not fully specified, so conclusions about which models perform best are not reproducible.

Trendline for series 1 R² = 0.26 Self-reporting overestimates MMLU score compared to reproduction

6

4

2

0

Self-Reported Score - Reproduction Score

-2

30 40 50 60 70 80

Self-Reported MMLU Score

Figure 4: Self-reporting overestimates MMLU score compared to reproduction, from https://crfm.stanford. edu/2024/05/01/helm-mmlu.html. Each point corresponds to a model, the x-axis shows self-reported MMLU score, and the y-axis shows the difference between the self-reported score and the reproduced score. Points above the y=0 line have higher self-reported performance than the reproduction; the trend line has a positive slope, indicating that on average, the higher the self-reported score the more they overestimate performance compared to the reproduction.

24

<!-- page 25 of 29 -->

Prompt Question: George wants to warm his hands quickly by rubbing them. Which skin surface will produce the most heat? Answer: dry palms

Question: Which of the following statements best explains why magnets usually stick to a refrigerator door? Answer: The refrigerator door contains iron.

Question: A fold observed in layers of sedimentary rock most likely resulted from the Answer: converging of crustal plates.

Question: Which of these do scientists offer as the most recent explanation as to why many plants and animals died out at the end of the Mesozoic era? Answer: impact of an asteroid created dust that blocked the sunlight

Question: Which of the following is a trait that a dog does NOT inherit from its parents? Answer: the size of its appetite

Question: A boat is acted on by a river current flowing north and by wind blowing on its sails. The boat travels northeast. In which direction is the wind most likely applying force to the sails of the boat? Answer:

Completion east

Figure 5: OLMES 5-shot prompt example for ARC-CHALLENGE (CF).

• Skip ambiguous instances

• Skip instances that hint at discrimination or otherwise deemed inappropriate

• Skip instances if the same label has appeared frequently (e.g., 4 consecutive instances with gold label ‘C’, keep better ones out of those)

• If instances are grouped/labeled by topic, choose instances to be diverse (e.g., first 3 are all about a certain topic, pick from later ones to ensure diversity).

• If you end up with less than 7 instances that cover the label space or range of different topics, look at the next batch of 10.

• Finally, reorder instances to obtain a somewhat balanced output of answer labels – the first 5 shots should cover the space of answer labels.

Note that a few more than 5 shots per dataset were curated in the process, though in practice we are just using the first 5.

H OLMES prompt formats for each task

In Figure 5 we show an example of a full 5-shot prompt from ARC-CHALLENGE (CF). Then we show single instance formatting for each of the 10 tasks in Figures 6- 25. For each task, we show both the MCF and CF formats.

All curated few-shot examples and prompt formatting code are available by accessing https://github. com/allenai/olmes.

25

<!-- page 26 of 29 -->

Prompt Question: George wants to warm his hands quickly by rubbing them. Which skin surface will produce the most heat?

A. dry palms B. wet palms C. palms covered with oil D. palms covered with lotion Answer:

Completion A

Figure 6: OLMES prompt example for ARC-CHALLENGE (MCF).

Prompt Question: George wants to warm his hands quickly by rubbing them. Which skin surface will produce the most heat? Answer:

Completion dry palms

Figure 7: OLMES prompt example for ARC-CHALLENGE (CF).

Prompt Question: Lichens are symbiotic organisms made of green algae and fungi. What do the green algae supply to the fungi in this symbiotic relationship?

A. carbon dioxide B. food C. protection D. water Answer:

Completion B

Figure 8: OLMES prompt example for ARC-EASY (MCF).

Prompt Question: Lichens are symbiotic organisms made of green algae and fungi. What do the green algae supply to the fungi in this symbiotic relationship? Answer:

Completion food

Figure 9: OLMES prompt example for ARC-EASY (CF).

Prompt Persian language – Persian, also known by its endonym Farsi, is one of the Western Iranian languages within the Indo-Iranian branch of the Indo-European language family. It is primarily spoken in Iran, Afghanistan (officially known as Dari since 1958), and Tajikistan (officially known as Tajiki since the Soviet era), and some other regions which historically were Persianate societies and considered part of Greater Iran. It is written in the Persian alphabet, a modified variant of the Arabic script, which itself evolved from the Aramaic alphabet. Question: do iran and afghanistan speak the same language?

A. yes B. no Answer:

Completion A

Figure 10: OLMES prompt example for BOOLQ (MCF).

26

<!-- page 27 of 29 -->

Prompt Persian language – Persian, also known by its endonym Farsi, is one of the Western Iranian languages within the Indo-Iranian branch of the Indo-European language family. It is primarily spoken in Iran, Afghanistan (officially known as Dari since 1958), and Tajikistan (officially known as Tajiki since the Soviet era), and some other regions which historically were Persianate societies and considered part of Greater Iran. It is written in the Persian alphabet, a modified variant of the Arabic script, which itself evolved from the Aramaic alphabet. Question: do iran and afghanistan speak the same language? Answer:

Completion yes

Figure 11: OLMES prompt example for BOOLQ (CF).

Prompt Question: Sammy wanted to go to where the people were. Where might he go?

A. race track B. populated areas C. the desert D. apartment E. roadblock Answer:

Completion B

Figure 12: OLMES prompt example for COMMONSENSEQA (MCF).

Prompt Question: Sammy wanted to go to where the people were. Where might he go? Answer:

Completion populated areas

Figure 13: OLMES prompt example for COMMONSENSEQA (CF).

Prompt Health: How to cope with suicidal thoughts. Put off any plans. Promise yourself that you’ll wait 48 hours before doing anything. Remember, thoughts don’t have the power to force you to act. Choose the best continuation:

A. Even when you do, there may be a small image of the future still lurking around your brain. For instance, don’t tell yourself that you can’t make it.

B. You’re doing something, and no one can force you to act. It’s completely natural to feel negative thoughts before you act.

C. Do not panic if people talk to you (even if it’s about quitting smoking). Have a plan for how you’re going to react to a group of people who bring on suicidal thoughts.

D. Sometimes extreme pain can distort our perception. Waiting before taking action will give your mind time to clear. Answer:

Completion D

Figure 14: OLMES prompt example for HELLASWAG (MCF).

Prompt Health: How to cope with suicidal thoughts. Put off any plans. Promise yourself that you’ll wait 48 hours before doing anything. Remember, thoughts don’t have the power to force you to act.

Completion Sometimes extreme pain can distort our perception. Waiting before taking action will give your mind time to clear.

Figure 15: OLMES prompt example for HELLASWAG (CF).

27

<!-- page 28 of 29 -->

Instruction The following are multiple choice questions (with answers) about abstract algebra. Prompt Question: Find all c in Z_3 such that Z_3[x]/(x^2 + c) is a field.

A. 0 B. 1 C. 2 D. 3 Answer:

Completion B

Figure 16: OLMES prompt example for MMLU (abstract_algebra) (MCF).

Instruction The following are multiple choice questions (with answers) about abstract algebra. Prompt Question: Find all c in Z_3 such that Z_3[x]/(x^2 + c) is a field. Answer:

Completion 1

Figure 17: OLMES prompt example for MMLU (abstract_algebra) (CF).

Prompt Question: When standing miles away from Mount Rushmore

A. the mountains seem very close B. the mountains are boring C. the mountains look the same as from up close D. the mountains seem smaller than in photographs Answer:

Completion D

Figure 18: OLMES prompt example for OPENBOOKQA (MCF).

Prompt Question: When standing miles away from Mount Rushmore Answer:

Completion the mountains seem smaller than in photographs

Figure 19: OLMES prompt example for OPENBOOKQA (CF).

Prompt Goal: how do you stab something?

A. stick a sharp object through it. B. pin it with a sharp object. Answer:

Completion A

Figure 20: OLMES prompt example for Physical Interaction QA (MCF).

Prompt Goal: how do you stab something? Answer:

Completion stick a sharp object through it.

Figure 21: OLMES prompt example for Physical Interaction QA (CF).

Prompt Question: Cameron decided to have a barbecue and gathered her friends together. How would Others feel as a result?

A. like attending B. like staying home C. a good friend to have Answer:

Completion A

Figure 22: OLMES prompt example for SOCIAL IQA (MCF).

28

<!-- page 29 of 29 -->

Prompt Question: Cameron decided to have a barbecue and gathered her friends together. How would Others feel as a result? Answer:

Completion like attending

Figure 23: OLMES prompt example for SOCIAL IQA (CF).

Prompt Fill in the blank: John moved the couch from the garage to the backyard to create space. The ___ is small.

A. garage B. backyard Answer:

Completion A

Figure 24: OLMES prompt example for WINOGRANDE (MCF).

Prompt1 John moved the couch from the garage to the backyard to create space. The garage Prompt2 John moved the couch from the garage to the backyard to create space. The backyard

Completion is small.

Figure 25: OLMES prompt example for WINOGRANDE (CF). In this case the completions are the same for each answer choice, but the prompt is different.

29
