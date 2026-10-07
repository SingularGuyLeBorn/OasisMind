---
title: "Tulu 2 对照译稿"
category: "后训练与奖励模型"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: Tulu 2 用一套 32.6 万条的 V2 指令混合数据微调 LLAMA-2, 并证明 DPO 可以稳定扩展到 70B 规模, 使开放模型在多个基准上达到或超过 GPT-3.5-turbo-0301.
---

# Camels in a Changing Climate: Enhancing LM Adaptation with TÜLU 2

<!-- page 1 of 15 -->

Camels in a Changing Climate: Enhancing LM Adaptation with TÜLU 2

Hamish Ivison∗♠ Yizhong Wang∗♣♠ Valentina Pyatkin♣♠ Nathan Lambert♣

Matthew Peters♣ Pradeep Dasigi♣ Joel Jang ♣♠ David Wadden♣

Noah A. Smith♣♠ Iz Beltagy♣ Hannaneh Hajishirzi♣♠

♣Allen Institute for AI ♠University of Washington {yizhongw,hamishiv}@cs.washington.edu

Abstract

Since the release of TÜLU [Wang et al., 2023b], open resources for instruction tuning have developed quickly, from better base models to new finetuning tech- niques. We test and incorporate a number of these advances into TÜLU, resulting in TÜLU 2, a suite of improved TÜLU models for advancing the understanding and best practices of adapting pretrained language models to downstream tasks and user preferences. Concretely, we release: (1) TÜLU-V2-mix, an improved collection of high-quality instruction datasets; (2) TÜLU 2, LLAMA-2 models finetuned on the V2 mixture; (3) TÜLU 2+DPO, TÜLU 2 models trained with direct preference optimization (DPO), including the largest DPO-trained model to date (TÜLU 2+DPO 70B); (4) CODE TÜLU 2, CODE LLAMA models finetuned on our V2 mix that outperform CODE LLAMA and its instruction-tuned variant, CODE LLAMA-Instruct. Our evaluation from multiple perspectives shows that the TÜLU 2 suite achieves state-of-the-art performance among open models and matches or exceeds the performance of GPT-3.5-turbo-0301 on several benchmarks. We release all the checkpoints, data, training and evaluation code to facilitate future open efforts on adapting large language models.

自 TÜLU [Wang et al., 2023b] 发布以来, 指令微调的开放资源发展很快, 从更好的基座模型到新的微调技术都有进展. 本文把这些进展逐一测试并纳入 TÜLU, 得到 TÜLU 2, 一组改进的 TÜLU 模型, 目的是推进「如何把预训练语言模型适配到下游任务与用户偏好」的理解和最佳实践. 具体发布四样东西: (1) TÜLU-V2-mix, 一套改进的高质量指令数据集; (2) TÜLU 2, 在 V2 混合数据上微调的 LLAMA-2 模型; (3) TÜLU 2+DPO, 用直接偏好优化 (DPO) 训练的 TÜLU 2 模型, 其中包括迄今最大的 DPO 模型 TÜLU 2+DPO 70B; (4) CODE TÜLU 2, 在 V2 混合数据上微调的 CODE LLAMA 模型, 超过 CODE LLAMA 本体及其指令微调版本 CODE LLAMA-Instruct. 多角度的评测显示, TÜLU 2 系列在开放模型中达到最好水平, 并在多个基准上追平或超过 GPT-3.5-turbo-0301. 所有 checkpoint, 数据, 训练与评测代码全部公开, 为后续大模型适配的开放研究提供基础.

1 Introduction

arXiv:2311.10702v2 [cs.CL] 20 Nov 2023

The capabilities of large language models (LMs) to follow user requests have been progressing rapidly through a wide range of openly available models, datasets, and training methods. Since the release of the original TÜLU models [Wang et al., 2023b], there have been a number of significant advances in almost all aspects of language model adaptation, from the release of improved finetuning datasets [Ding et al., 2023, Cui et al., 2023], to increasingly powerful base models [Touvron et al., 2023a, Jiang et al., 2023], to powerful and accessible adaptation methods for combining these components [Rafailov et al., 2023, Dettmers et al., 2023]. We comprehensively evaluate and combine these recent advances to present strong open models across 7, 13, and 70 billion parameter scales with empirical studies of various training recipes.

大语言模型 (LM) 遵循用户请求的能力, 借助大量公开的模型, 数据集和训练方法在快速进步. 自最初的 TÜLU 模型 [Wang et al., 2023b] 发布以来, 语言模型适配的几乎每个方面都出现了重要进展: 更好的微调数据集 [Ding et al., 2023, Cui et al., 2023], 更强的基座模型 [Touvron et al., 2023a, Jiang et al., 2023], 以及把这些部件组合起来的强大且易用的适配方法 [Rafailov et al., 2023, Dettmers et al., 2023]. 本文全面评估并组合这些新进展, 在 7B, 13B 和 70B 三个参数规模上给出有竞争力的开放模型, 并对多种训练配方做实证研究.

Accompanying our new models, we release a new dataset mixture, TÜLU-V2-mix that results in stronger performance across a variety of reasoning and knowledge-probing tasks. We also compare the performance of both new parameter efficient tuning and reinforcement learning from human feedback (RLHF) methods. Included in our model suite is a LLAMA-2 70B model finetuned on TÜLU-V2-mix and further trained using direct preference optimization (DPO) algorithm, representing the first stable demonstration of using DPO at scales of 70 billion parameters. This model achieves results competitive with state-of-the-art on the MT-Bench and AlpacaEval benchmarks.

与新模型一起, 本文发布新的数据混合 TÜLU-V2-mix, 它在多种推理与知识探查任务上都有更强的表现. 本文也比较了新的参数高效微调方法与基于人类反馈的强化学习 (RLHF) 方法. 模型套件中包括在 TÜLU-V2-mix 上微调, 再进一步用直接偏好优化 (DPO) 算法训练的 LLAMA-2 70B 模型, 这是 DPO 首次在 700 亿参数规模上的稳定演示. 该模型在 MT-Bench 和 AlpacaEval 基准上达到了与当时最好水平相当的结果.

∗Equal contribution.

We additionally explore training with quantized low-rank adaptation (QLoRA), finding that it solid performance across traditional language processing tasks, but falls behind on evaluations that ex-

∗Equal contribution.

我们还用量化低秩适配 (QLoRA) 做了训练实验, 发现它在传统语言处理任务上表现扎实, 但在考察长文生成的评测上落后.


<!-- page 2 of 15 -->

amine long-form text generation such as AlpacaEval. Finally, we apply our mixture to CODE LLAMA [Roziere et al., 2023], resulting in CODE TÜLU 2, which outperforms both the base CODE LLAMAmodel and its instruction-tuned variant CODE LLAMA-Instruct across all model sizes.

比如在 AlpacaEval 上就明显偏弱. 末尾, 我们把这套数据混合应用到 CODE LLAMA [Roziere et al., 2023] 上, 得到 CODE TÜLU 2, 它在所有规模上都同时超过 CODE LLAMA 本体和其指令微调版本 CODE LLAMA-Instruct.

TÜLU-2 validates and extends the progress seen across many open instruction model recipes released recently, such as those with some RL component, including Zephyr-Beta [Tunstall et al., 2023], LLAMA-2-chat [Touvron et al., 2023a], XWin [Xwin-LM Team, 2023], WizardLM [Xu et al., 2023], and OpenChat [Wang et al., 2023a], and some without, including MISTRAL-Instruct [Jiang et al., 2023] and Mosaic Pretrained Transformer (MPT) [MosaicML, 2023].

TÜLU-2 验证并推广了近期众多开放指令模型配方上的进展, 包括带 RL 成分的 Zephyr-Beta [Tunstall et al., 2023], LLAMA-2-chat [Touvron et al., 2023a], XWin [Xwin-LM Team, 2023], WizardLM [Xu et al., 2023], OpenChat [Wang et al., 2023a], 以及不带 RL 成分的 MISTRAL-Instruct [Jiang et al., 2023] 和 MPT [MosaicML, 2023].

In summary, with TÜLU 2, we find that:

1. Recent distilled data mixtures have significantly improved in terms of downstream performance over both instruction and preference datasets available only six months ago, with our new mixture outperforming our old mixture by an average of 8%. 2. DPO training scales to 70 billion parameter models, and significantly improves open- ended generation metrics without degrading model capabilities, improving AlpacaEval performance by an average of 13% across model sizes. Our largest DPO trained model, TÜLU 2+DPO 70B, achieves state-of-the-art performance for MT-Bench [Zheng et al., 2023] compared to open-weight models. 3. QLoRA training does not match full-finetuning in long-form generation tasks, although the gap shrinks with model size (from 10% worse on average to 3% worse on average across our tasks). We note that QLoRA especially underperforms on open-ended generation tasks such as AlpacaEval (20% average gap in performance). 4. CODE TÜLU 2 significantly improves coding abilities over TÜLU 2 (70% average im- provement in Codex-Eval) but degrades open-ended model generations in AlpacaEval (20% average drop in performance).

总结起来, 本文用 TÜLU 2 得到四点发现: 1. 相比六个月前可用的指令与偏好数据集, 近期的蒸馏数据混合在下游表现上有明显提升, 新混合比旧混合平均高 8%. 2. DPO 训练可以扩展到 700 亿参数模型, 在不损害模型能力的前提下显著改善开放式生成指标, 各规模平均把 AlpacaEval 提升 13%. 其中最大的 DPO 模型 TÜLU 2+DPO 70B 在 MT-Bench [Zheng et al., 2023] 上相对开放权重模型达到当时最好水平. 3. QLoRA 训练在长文生成任务上不如全量微调, 但差距随模型规模缩小 (各任务平均从落后 10% 收窄到落后 3%); 在 AlpacaEval 这类开放式生成任务上落后尤多 (平均差 20%). 4. CODE TÜLU 2 相比 TÜLU 2 大幅提升编码能力 (Codex-Eval 平均提升 70%), 但 AlpacaEval 开放式生成明显下降 (平均降 20%).

We publicly release all models, data, and code associated with this work. Models and the new dataset mix can be found at https://huggingface.co/collections/allenai/tulu-v2-suite-6551b56e743e6349aab45101. Our finetuning and evaluation code can be found at https://github.com/allenai/open-instruct. We hope that publicly releasing all artifacts aids future research into post-pretraining LM adaptation.

本文公开所有相关模型, 数据与代码. 模型和新数据混合见 https://huggingface.co/collections/allenai/tulu-v2-suite-6551b56e743e6349aab45101, 微调与评测代码见 https://github.com/allenai/open-instruct. 希望公开全部产物能帮助后续关于预训练后 LM 适配的研究.

2 TÜLU V2 Details

We first detail the aspects of adaptation we explored for TÜLU 2 in comparison to TÜLU 1 [Wang et al., 2023b]: new base models, a new data mixture, extended context training data, and RLHF training. TÜLU 1 constructed two data instruction mixes through a variety of experiments, one containing prompt-response pairs fully written by humans from the FLAN, Dolly and Open Assistant datasets, and another containing prompt-response pairs fully or partially generated by OpenAI models along with the human-written data.

先对照 TÜLU 1 [Wang et al., 2023b] 说明 TÜLU 2 探索的适配环节: 新基座模型, 新数据混合, 更长的上下文训练数据, 以及 RLHF 训练. TÜLU 1 通过一系列实验构建了两个指令数据混合: 一个全部来自 FLAN, Dolly 和 Open Assistant 的人工撰写 prompt-response 对, 另一个在人工数据之外加入全部或部分由 OpenAI 模型生成的 prompt-response 对.

Improved base models We first switch from using LLAMA-1 models [Touvron et al., 2023a] to LLAMA-2 [Touvron et al., 2023b], a newer set of models following similar architecture to LLAMA-1 but pretrained on significantly more tokens (2 trillion tokens as opposed to 1 or 1.4 trillion tokens), and displaying improved performance (Touvron et al. [2023b] shows a 10% average improvement across model sizes on a set of academic benchmarks). We also experiment with CODE LLAMA, a set of LLAMA-2 models further pretrained on code data. We finetune models at all possible LLAMA-2 sizes: 7B, 13B, and 70B, and all possible CODE LLAMA sizes: 7B, 13B, and 34B.

改进的基座模型. 本文把基座从 LLAMA-1 [Touvron et al., 2023a] 换成 LLAMA-2 [Touvron et al., 2023b]. 两者架构相近, 但 LLAMA-2 预训练 token 数多得多 (2 万亿, 对比 1 或 1.4 万亿), 表现也更好 (Touvron et al. [2023b] 报告其在学术基准集上各规模平均提升 10%). 本文还实验了在代码数据上继续预训练的 CODE LLAMA. 微调覆盖 LLAMA-2 的全部规模 (7B, 13B, 70B) 和 CODE LLAMA 的全部规模 (7B, 13B, 34B).

V2 data mixture Our original data mixture (TÜLU-V1-mix) was based on ablations over human and GPT-generated datasets – we refer readers to Wang et al. [2023b] for a full list. We keep a number of high-quality datasets from our first mix, and add new datasets that are either carefully manually curated for quality or generated from GPT models while encouraging complexity and diversity. We additionally downsample larger datasets such as FLAN to reduce the overall size of the training mixture, and remove Dolly [Databricks, 2023] from the mixture due to its poor performance in previous ablations. Our V2 mixture, TÜLU-V2-mix, comprises of data from the following sources (we mark datasets newly added to our V2 mixture with *):

V2 数据混合. 原始数据混合 (TÜLU-V1-mix) 基于对人工与 GPT 生成数据集的消融实验, 完整清单见 Wang et al. [2023b]. V2 保留了第一批混合中若干高质量数据集, 新增的数据集要么经过仔细的人工质量筛选, 要么由 GPT 模型生成且强调复杂性与多样性. 此外, 本文下采样了 FLAN 等较大的数据集以缩小训练混合总量, 并因 Dolly [Databricks, 2023] 在之前消融中表现差而将其移除. V2 混合 TÜLU-V2-mix 包含以下来源的数据 (V2 新增的数据集用 * 标出):


<!-- page 3 of 15 -->

![](images/v2mix_length_hist.png)

Figure 1: Histogram of token lengths in our V2 data mixture.

> 图 1: V2 数据混合的 token 长度直方图, 横轴为单条样本的 token 数, 纵轴为样本计数 (对数刻度), 原文 Figure 1.

• FLAN [Chung et al., 2022]: We use 50,000 examples sampled from FLAN v2.

FLAN [Chung et al., 2022]: 从 FLAN v2 中采样 50,000 条.

• CoT: To emphasize chain-of-thought (CoT) reasoning, we sample another 50,000 examples from the CoT subset of the FLAN v2 mixture.

CoT: 为强调思维链 (CoT) 推理, 再从 FLAN v2 混合的 CoT 子集中采样 50,000 条.

• Open Assistant 1 [Köpf et al., 2023]: We isolate the highest-scoring paths in each conversation tree and use these samples, resulting in 7,708 examples. Scores are taken from the quality labels provided by the original annotators of Open Assistant 1.

Open Assistant 1 [Köpf et al., 2023]: 取每棵对话树中得分最高的路径, 共 7,708 条. 分数来自 Open Assistant 1 原始标注者提供的质量标签.

• ShareGPT2: We use all 114,046 examples from our processed ShareGPT dataset, as we found including the ShareGPT dataset resulted in strong performance in prior work.

ShareGPT2: 使用处理后的 ShareGPT 数据集全部 114,046 条, 因为之前的工作发现加入 ShareGPT 数据集能带来很强表现.

• GPT4-Alpaca [Peng et al., 2023]: We sample 20,000 samples from GPT-4 Alpaca to further include distilled GPT-4 data.

GPT4-Alpaca [Peng et al., 2023]: 从 GPT-4 Alpaca 采样 20,000 条, 进一步加入蒸馏自 GPT-4 的数据.

• Code-Alpaca [Chaudhary, 2023]: We use all 20,022 examples from Code Alpaca, following our prior V1 mixture, in order to improve model coding abilities.

Code-Alpaca [Chaudhary, 2023]: 沿用 V1 混合的做法, 使用 Code Alpaca 全部 20,022 条, 以增强模型编码能力.

• *LIMA [Zhou et al., 2023]: We use 1,030 examples from LIMA as a source of carefully curated data.

*LIMA [Zhou et al., 2023]: 取 LIMA 的 1,030 条, 作为精心整理数据的来源.

• *WizardLM Evol-Instruct V2 [Xu et al., 2023]: We sample 30,000 examples from WizardLM, which contains distilled data of increasing diversity and complexity.

*WizardLM Evol-Instruct V2 [Xu et al., 2023]: 从 WizardLM 采样 30,000 条, 其中包含多样性与复杂度递增的蒸馏数据.

• *Open-Orca [Lian et al., 2023]: We sample 30,000 examples generated by GPT-4 from OpenOrca, a reproduction of Orca [Mukherjee et al., 2023], which augments FLAN data with additional model-generated explanations.

*Open-Orca [Lian et al., 2023]: 从 OpenOrca 中采样 GPT-4 生成的 30,000 条. OpenOrca 是 Orca [Mukherjee et al., 2023] 的复现, 在 FLAN 数据上增补模型生成的解释.

• *Science literature: We include 7,544 examples from a mixture of scientific document under- standing tasks— including question answering, fact-checking, summarization, and information extraction. A breakdown of tasks is given in Appendix C.

*科学文献: 加入 7,544 条科学文献理解任务的混合数据, 包括问答, 事实核查, 摘要和信息抽取. 任务明细见附录 C.

• *Hardcoded: We include a collection of 140 samples using prompts such as ‘Tell me about yourself’ manually written by the authors, such that the model generates correct outputs given inquiries about its name or developers.

*硬编码: 加入 140 条作者手工撰写的样本, prompt 形如 ‘Tell me about yourself’, 让模型对被问及自身名字或开发者的问题给出正确输出.

Additionally, we filter any samples that include references to other LLM systems such as GPT-4, Open Assistant, or Claude, to avoid contradicting the hardcoded prompts. After filtering, the V2 mixture consists of 326,154 samples, compared to 490,445 in the V1 mixture. Our dataset is available at https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture.

另外, 本文过滤掉一切提及 GPT-4, Open Assistant 或 Claude 等其他 LLM 系统的样本, 避免与硬编码 prompt 矛盾. 过滤后 V2 混合共 326,154 条, 而 V1 混合是 490,445 条. 数据集见 https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture.

逐项相加 50,000 + 50,000 + 7,708 + 114,046 + 20,000 + 20,022 + 1,030 + 30,000 + 30,000 + 7,544 + 140 = 330,490, 比 326,154 多 4,336 条, 对应上一句说的「过滤掉提及其他 LLM 系统的样本」这一步; 文中没有单独给出被过滤样本数, 4,336 是从这两个已给数字相减得到的.

Extended context length We expand the context length during training from a maximum of 2,048 tokens to 8,192 tokens in order to make better use of the many lengthy samples in datasets such as

更长的上下文. 训练上下文上限从 2,048 token 扩到 8,192 token, 以便更好利用 ShareGPT 等数据集中的大量长样本.

2 ShareGPT (https://sharegpt.com/) data was used to build the Vicuna model [Chiang et al., 2023], but the exact dataset has not been released. Following Wang et al. [2023b], we instead use a reproduced version from https://huggingface.co/datasets/anon8231489123/ShareGPT_Vicuna_unfiltered/ tree/main/HTML_cleaned_raw_dataset, and follow Vicuna to split the long conversations into blocks with a maximum length of 4,196 tokens.

ShareGPT (https://sharegpt.com/) 数据曾被用来训练 Vicuna 模型 [Chiang et al., 2023], 但确切数据集从未发布. 本文沿用 Wang et al. [2023b] 的做法, 改用 https://huggingface.co/datasets/anon8231489123/ShareGPT_Vicuna_unfiltered/tree/main/HTML_cleaned_raw_dataset 上的复现版本, 并沿用 Vicuna 的做法把长对话切成最长 4,196 token 的块.

<!-- page 4 of 15 -->

ShareGPT and Open Assistant 1. Moving from 2,048 to 8,192 max length means we only truncate 20 (as opposed to 63,900) samples within our V2 mixture, better capturing the long tail of lengthy examples in our training data. We plot the length distribution of our V2 mixture in Figure 1. The mean length of a sample is 1097 tokens, with the 25th and 75th percentile values being 230 and 1464 respectively.

上限提高后, V2 混合中被截断的样本只有 20 条 (原来是 63,900 条), 训练数据的长样本长尾被保留得更完整. V2 混合的长度分布见图 1. 样本平均长度 1,097 token, 第 25 和 75 百分位分别是 230 和 1,464.

RLHF training Reinforcement learning from human feedback (RLHF) is a core component of modern user-facing LLM systems [Bai et al., 2022, Ouyang et al., 2022, Touvron et al., 2023a]. Early systems for RLHF were built primarily upon the proximal policy optimization (PPO) algorithm, but recent advances have seen exploration of offline RL [Snell et al., 2022], reward model data filtering called rejection sampling (RS) [Touvron et al., 2023a] or reinforced self-training (ReST) [Gulcehre et al., 2023] and direct integration of preference data [Rafailov et al., 2023]. In this work, we use the direct preference optimization (DPO) algorithm due to the simplicity of its implementation [Rafailov et al., 2023]. For DPO training, we follow the Zephyr-Beta approach [Tunstall et al., 2023]: we train on a filtered and binarized form of UltraFeedback [Cui et al., 2023] for three epochs. One thing to note is the low learning rate, 5 × 10−7, required for stable and effective DPO training. We find this significantly improves performance on open-ended generation evaluations such as AlpacaEval [Li et al., 2023], while making little to no difference in performance over more capability-focussed evaluations such as MMLU and HumanEval.

RLHF 训练. 基于人类反馈的强化学习 (RLHF) 是现代面向用户 LLM 系统的核心部件 [Bai et al., 2022, Ouyang et al., 2022, Touvron et al., 2023a]. 早期 RLHF 系统主要建立在 proximal policy optimization (PPO) 算法上, 后来的进展包括离线 RL [Snell et al., 2022], 用奖励模型过滤数据的 rejection sampling (RS) [Touvron et al., 2023a] 或 reinforced self-training (ReST) [Gulcehre et al., 2023], 以及直接利用偏好数据 [Rafailov et al., 2023]. 本文选用直接偏好优化 (DPO) 算法, 因为它实现简单 [Rafailov et al., 2023]. 具体沿用 Zephyr-Beta [Tunstall et al., 2023] 的做法: 在 UltraFeedback [Cui et al., 2023] 过滤并二值化后的版本上训练三个 epoch. 有一点值得注意: 为了让 DPO 稳定有效, 学习率必须很低, 取 $5 \times 10^{-7}$. 这样的训练显著改善了 AlpacaEval [Li et al., 2023] 等开放式生成评测, 而对 MMLU 和 HumanEval 等更侧重能力的评测几乎无影响.

附录 B 给出两套超参: SFT 用学习率 $2 \times 10^{-5}$ (70B 用 $1 \times 10^{-5}$), DPO 用 $5 \times 10^{-7}$. 正文只说低学习率是「稳定且有效」DPO 训练的必要条件, 没有给出更细的原因或消融; 文中没有给出更深处的解释.

QLoRA training We experimented with QLoRA training at the instruction tuning stage in order to determine if we could reduce our compute demands without reducing performance. Due to sub-par performance at the instruction tuning stage, we did not explore using QLoRA during RLHF training, although we note that prior work has found it perform well for PPO-based RLHF training [Santacroce et al., 2023, Sun et al., 2023].

QLoRA 训练. 本文在指令微调阶段实验了 QLoRA, 想确认能否在降低算力需求的同时不掉表现. 由于在指令微调阶段表现不达标, 本文没有继续探索在 RLHF 阶段使用 QLoRA; 不过前人的工作发现 QLoRA 在基于 PPO 的 RLHF 训练中表现不错 [Santacroce et al., 2023, Sun et al., 2023].

3 Experiments

Evaluation tools We reuse the evaluation framework from TÜLU 1 [Wang et al., 2023b], which includes evaluations testing factual knowledge (MMLU), reasoning (GSM8k, Big Bench Hard), multilinguality (TydiQA), coding (CodexEval), open-ended generation (AlpacaEval), toxicity (Toxi- Gen), and truthfulness (TruthfulQA). We refer the reader to Wang et al. [2023b] for an in-depth explanation of these evaluations, and provide an overview of each evaluation in Appendix A.

评测工具. 本文沿用 TÜLU 1 [Wang et al., 2023b] 的评测框架, 覆盖事实知识 (MMLU), 推理 (GSM8k, BBH), 多语言 (TydiQA), 编码 (CodexEval), 开放式生成 (AlpacaEval), 毒性 (ToxiGen) 与真实性 (TruthfulQA). 各评测的深入解释见 Wang et al. [2023b], 本文在附录 A 给出每个评测的概览.

We make two changes to this evaluation framework: first, we replace our old AlpacaFarm setup with the default AlpacaEval setup [Li et al., 2023], making our reported numbers directly comparable with the AlpacaEval leaderboard (https://tatsu-lab.github.io/alpaca_eval/). At time of writing, AlpacaEval does not use a pinned GPT-4 version for evaluation, so we ensure all evaluations reported use GPT-4-0613 as the evaluator model. Second, we also evaluate a set of models on MT-Bench [Zheng et al., 2023], a popular benchmark for open-ended generation that similarly uses GPT-4 to judge model outputs across a diverse set of prompts.

框架做了两处改动: 第一, 把旧的 AlpacaFarm 设置换成 AlpacaEval 默认设置 [Li et al., 2023], 让报告数字可以直接和 AlpacaEval 排行榜 (https://tatsu-lab.github.io/alpaca_eval/) 对比. 当时 AlpacaEval 没有固定 GPT-4 版本, 本文保证所有评测都用 GPT-4-0613 作为评判模型. 第二, 在一组模型上增加 MT-Bench [Zheng et al., 2023] 评测, 它同样是开放式生成基准, 用 GPT-4 对多样 prompt 下的模型输出打分.

While TruthfulQA is included in our evaluation suite, we found that the data used for DPO training (UltraFeedback) made use of TruthfulQA prompts. As such, we omit TruthfulQA results when showing comparisons with contaminated models (any models trained with the UltraFeedback dataset). We also note that although we report results for several GPT models (GPT-4-0314, GPT-3.5-turbo- 0301, GPT-4-1106-preview), we cannot rule out the possibility they are trained on the evaluation benchmark datasets.

评测套件里包含 TruthfulQA, 但本文发现 DPO 训练用的 UltraFeedback 数据用了 TruthfulQA 的 prompt. 因此在展示与被污染模型 (任何用 UltraFeedback 训练过的模型) 的对比时, 本文省略 TruthfulQA 结果. 另外要说明, 尽管本文报告了若干 GPT 模型 (GPT-4-0314, GPT-3.5-turbo-0301, GPT-4-1106-preview) 的结果, 也不能排除这些模型在评测基准数据上训练过的可能.

Training We detail the hyperparameters used to train models in Appendix B. The 70B variant of TÜLU V2-DPO was trained on a 512-core TPUv3, completing three epochs in approximately 7 days.

训练. 训练超详见附录 B. TÜLU V2-DPO 的 70B 版本在 512 核 TPUv3 上训练, 三个 epoch 约 7 天.

3.1 Overall Results

We present our overall results comparing TÜLU-2 to popular proprietary and open models in Table 1. We find:

表 1 给出 TÜLU-2 与主流私有及开放模型的总体对比. 发现如下:

TÜLU 2 outperforms all open models on average. TÜLU-2 70B is the highest-performing model on average and is the best-performing open model in 3/7 tasks. For the remaining 4 tasks, it is

TÜLU 2 平均超过所有开放模型. TÜLU-2 70B 平均表现最高, 在 7 项任务中的 3 项上是最好的开放模型. 其余 4 项上, 它


<!-- page 5 of 15 -->

MMLU GSM8k BBH TydiQA GP CodexEval AlpacaEval ToxiGen Average 0-shot, EM 8-shot CoT, EM 3-shot CoT, EM 1-shot, F1 P@10 % Win % Toxic -

Proprietary models

GPT-4-0613 81.4 95.0 89.1 65.2 87.0 91.2 0.6 86.9 GPT-3.5-turbo-0613 65.7 76.5 70.8 51.2 88.0 91.8 0.5 77.6 GPT-3.5-turbo-0301 67.9 76.0 66.1 51.9 88.4 83.6 27.7 72.3

Non-TÜLU Open Models

Zephyr-Beta 7B 58.6 28.0 44.9 23.7 54.3 86.3 64.0 47.4 Xwin-LM v0.1 70B 65.0 65.5 65.6 38.2 66.1 95.8 12.7 69.1 LLAMA-2-Chat 7B 46.8 12.0 25.6 22.7 24.0 87.3 0.0 45.4 LLAMA-2-Chat 13B 53.2 9.0 40.3 32.1 33.1 91.4 0.0 51.3 LLAMA-2-Chat 70B 60.9 59.0 49.0 44.4 52.1 94.5 0.0 65.7

TÜLU 2 Suite

TÜLU 2 7B 50.4 34.0 48.5 46.4 36.9 73.9 7.0 54.7 TÜLU 2+DPO 7B 50.7 34.5 45.5 44.5 40.0 85.1 0.5 56.3 TÜLU 2 13B 55.4 46.0 49.5 53.2 49.0 78.9 1.7 61.5 TÜLU 2+DPO 13B 55.3 49.5 49.4 39.7 48.9 89.5 1.1 61.6 TÜLU 2 70B 67.3 73.0 68.4 53.6 68.5 86.6 0.5 73.8 TÜLU 2+DPO 70B 67.8 71.5 66.0 35.8 68.9 95.1 0.2 72.1

Table 1: The evaluation metrics of our core TÜLU-2 suite and its peers. Most of the models included use LLAMA 2 base models, except Zephyr-Beta, which uses MISTRAL-7B. For all evaluations except ToxiGen, higher scores are better. We average scores naively, apart from Toxigen, where we take 100 - x as the value to average. The top-performing open model per task has been underlined, and the top-performing model in each set of models is bolded.

Size Data MMLU GSM8k BBH TydiQA Codex-Eval AlpacaEval ToxiGen TruthfulQA Average 0-shot 8-shot CoT 3-shot CoT 1-shot Pass@10 %win % Toxic %Info+True -

7B ShareGPT 47.8 20.0 41.5 24.0 29.2 72.3 12.6 54.1 47.0 V1 mix. 49.2 37.0 44.2 52.9 33.9 64.5 39.9 40.8 47.8 V2 mix. 50.4 34.0 48.5 46.4 36.9 73.9 7.0 50.2 54.2

13B V1 mix. 52.3 53.0 50.6 58.8 38.9 67.7 18.7 45.3 56.0 V2 mix. 55.4 46.0 49.5 53.2 49.0 78.9 1.7 55.8 60.8

70B V1 mix. 67.3 74.5 67.5 56.8 65.4 82.8 0.0 57.9 71.5 V2 mix. 67.3 73.0 68.4 53.6 68.5 86.6 0.5 62.2 72.4

Table 2: Results of LLAMA-2 models finetuned on our V1 and V2 data mixtures, and ShareGPT.

outperformed in MMLU and CodexEval by TÜLU 2+DPO 70B, in ToxiGen by LLAMA-2-Chat models, and in AlpacaEval by Xwin-LM 70B. We note that the average gap between TÜLU 2 70B and the highest performing model in these 4 tasks is under 1%, highlighting that TÜLU 2 is at least competitive if not outright better than all open models in most evaluations.

在 MMLU 和 CodexEval 上被 TÜLU 2+DPO 70B 超过, 在 ToxiGen 上被 LLAMA-2-Chat 系列超过, 在 AlpacaEval 上被 Xwin-LM 70B 超过. 其中, 这 4 项上 TÜLU 2 70B 与最好模型的平均差距不到 1%, 说明 TÜLU 2 在多数评测上至少与所有开放模型持平, 甚至更好.

TÜLU 2 is competitive with GPT 3.5-0301. TÜLU 2 70B achieves similar performance to GPT-3.5-turbo-0301 in MMLU, BBH and TydiQA, and outperforms it in AlpacaEval and ToxiGen. However, there remains a large gap with GPT-4 and a moderate gap with GPT-3.5-turbo-0613 (a more modern variant of the model) in most evaluations.

TÜLU 2 与 GPT 3.5-0301 相当. TÜLU 2 70B 在 MMLU, BBH 和 TydiQA 上与 GPT-3.5-turbo-0301 接近, 在 AlpacaEval 和 ToxiGen 上超过它. 但与 GPT-4 仍有很大差距, 与更新的 GPT-3.5-turbo-0613 在多数评测上也有中等差距.

Scaling trends remain strong with TÜLU 2. Increasing model size improves almost every metric when the finetuning setup is held consistent across our model suite.

TÜLU 2 的 Scaling 趋势依然明显. 微调设置保持一致时, 增大模型规模几乎改善每一项指标.

3.2 TÜLU V1 vs V2 Data Mixtures

We compare our new model suite to our old models in Table 2, comparing LLAMA-2 models at all sizes on our V1 and V2 mix. We additionally compare our V2 mix to a model trained only on ShareGPT, the most promising single dataset from our original work. We find that:

表 2 对比新旧模型套件, 即在 V1 和 V2 混合上微调的各规模 LLAMA-2 模型. 本文还把 V2 混合与只在 ShareGPT 上训练的模型对比, ShareGPT 是先前工作中表现最好的单一数据集. 发现如下:

Models trained on the V2 mix perform better than models trained on the V1 mix on open- ended generation. V2 mix models outperform V1 mix models consistently on BBH, Codex-Eval, AlpacaEval, and TruthfulQA, and consistently underperform the V1 mix on GSM8k and TydiQA. The former is likely due to training on fewer CoT examples (which contains the GSM8k train dataset), while the latter indicates our V2 mix is worse for multilingual capabilities. This reinforces the findings from Wang et al. [2023b] that no one dataset is optimal for all tasks, although we note on average models trained on our V2 mix outperform those trained on our V1 mix.

V2 混合训练的模型在开放式生成上优于 V1 混合. V2 混合模型在 BBH, Codex-Eval, AlpacaEval 和 TruthfulQA 上稳定优于 V1 混合, 在 GSM8k 和 TydiQA 上稳定不如 V1 混合. 前者可能是因为 CoT 样例变少 (CoT 子集含 GSM8k 训练集), 后者说明 V2 混合对多语言能力更差. 这再次印证 Wang et al. [2023b] 的发现: 没有对所有任务都最优的数据集; 不过平均来看, V2 混合训练的模型仍优于 V1 混合.

Models trained on the V2 mix outperform training on ShareGPT across most evals. In prior work and in Table 2, we find that training on ShareGPT alone results in overall performance close to models trained on our V1 mix, and greatly improved AlpacaEval performance. However, our new mix actually outperforms using ShareGPT alone both overall and only considering AlpacaEval. This is likely due to the V2 mix’s greater reliance on distilled datasets that have similar origins to ShareGPT.

V2 混合在多数评测上超过只用 ShareGPT 训练. 先前工作和表 2 都显示, 只用 ShareGPT 训练的整体表现接近 V1 混合模型, 且 AlpacaEval 大幅提升. 但新混合无论看总体还是只看 AlpacaEval 都超过只用 ShareGPT, 原因可能是 V2 混合更多使用与 ShareGPT 同源多样的蒸馏数据集.

Improvements from the V2 mix shrink with model size. While the V2 mix provides a 13% average improvement at the 7B scale, it only provides a 1% improvement at the 70B scale. This suggests that the importance of instruction data quality may shrink as model size (and/or capabilities) increase.

V2 混合带来的提升随模型规模缩小. 7B 规模上 V2 混合带来 13% 的平均提升, 70B 规模上只有 1%. 这说明指令数据质量的重要性可能随模型规模 (和/或能力) 增大而下降.

Having established the overall superiority of our V2 mix, especially on open-ended generation, we now turn to alternate finetuning methods to further improve TÜLU 2.

在确认 V2 混合整体更优, 尤其在开放式生成上之后, 接下来换用其他微调方法继续改进 TÜLU 2.

<!-- page 6 of 15 -->

3.3 Scaling DPO Training

Size Model MMLU GSM8k BBH TydiQA Codex-Eval AlpacaEval ToxiGen Average 0-shot 8-shot CoT 3-shot CoT 1-shot Pass@10 %win % Toxic

7B TÜLU 2 50.4 34.0 48.5 46.4 36.9 73.9 7.0 54.7 TÜLU 2+DPO 50.7 34.5 45.5 44.5 40.0 85.1 0.5 56.3 ∆ +0.3 +0.5 -3.0 -1.9 +3.1 +11.2 -6.5 +1.6

13B TÜLU 2 55.4 46.0 49.5 53.2 49.0 78.9 1.7 61.5 TÜLU 2+DPO 55.3 49.5 49.4 39.7 48.9 89.5 1.1 61.6 ∆ -0.1 +3.5 -0.1 -13.5 -0.1 +10.6 -0.6 +0.1

70B TÜLU 2 67.3 73.0 68.4 53.6 68.5 86.6 0.5 73.8 TÜLU 2+DPO 67.8 71.5 66.0 35.8 68.9 95.1 0.2 72.1 ∆ +0.5 -1.5 -2.4 -17.8 +0.4 +8.5 -0.3 -1.7

Table 3: Evaluation results for TÜLU V2 models with and without DPO finetuning, and the difference between the two results (∆).

We finetune our models using DPO [Rafailov et al., 2023] and the Ultrafeedback dataset [Cui et al., 2023], following the hyperparameters and overall setup used by Zephyr-Beta [Tunstall et al., 2023], who apply DPO to a 7B Mistral model finetuned on UltraChat [Ding et al., 2023]. Surprisingly, we find these hyperparameters scale, providing stable training and performance improvements for models at all sizes. We show our results in Table 3 and results focusing on GPT-based evaluations (MT-Bench and AlpacaEval) in Table 4. We provide full MT-Bench results in Appendix D. We find that:

本文用 DPO [Rafailov et al., 2023] 和 Ultrafeedback 数据集 [Cui et al., 2023] 微调模型, 超参与整体设置沿用 Zephyr-Beta [Tunstall et al., 2023] 的做法 (Zephyr-Beta 把 DPO 用在 UltraChat [Ding et al., 2023] 微调的 7B Mistral 模型上). 出乎意料的是, 这套超参可以直接扩展, 在所有规模上都训练稳定且带来提升. 结果见表 3, 聚焦 GPT 评测 (MT-Bench 和 AlpacaEval) 的结果见表 4, 完整 MT-Bench 结果见附录 D. 发现如下:

DPO training significantly improves AlpacaEval and MT-Bench performance. At all sizes, DPO training provides significant improvements in AlpacaEval, with our largest DPO-trained model significantly outperforming GPT-3.5-turbo-0314 (89.4 vs. 95.1) and is competitive with GPT-4 (see Table 4. TÜLU 2+DPO 70B is the second best-performing open model on AlpacaEval,3 just behind Xwin-LM 70B. We also observe that DPO training provides a large boost in MT-Bench performance for the 13B and 70B size models, with TÜLU 2+DPO 70B being the best-performing open model compared to all other models on the MT-Bench leaderboard.4 Curiously, while TÜLU 2 outperforms most GPT models we examine in AlpacaEval, it underperforms compared to all of them in MT-Bench.

DPO 训练显著提升 AlpacaEval 和 MT-Bench 表现. 各规模上 DPO 都显著改善 AlpacaEval, 最大的 DPO 模型大幅超过 GPT-3.5-turbo-0314 (89.4 比 95.1), 与 GPT-4 也有竞争力 (见表 4). 按当时排行榜, TÜLU 2+DPO 70B 在 AlpacaEval 上是表现第二的开放模型, 仅次于 Xwin-LM 70B. 同时 DPO 训练对 13B 和 70B 的 MT-Bench 提升很大, TÜLU 2+DPO 70B 是 MT-Bench 排行榜上所有开放模型中最好的. 有意思的是, TÜLU 2 在 AlpacaEval 上超过多数被测 GPT 模型, 在 MT-Bench 上却不如其中任何一个.

3At time of writing. See https://tatsu-lab.github.io/alpaca_eval/ 4At time of writing. See https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard

表 4 只列了 GPT-3.5-turbo-0301, AlpacaEval 胜率 83.6, 没有 GPT-3.5-turbo-0314, 也没有 89.4; 89.4 在全文任何表中都没有出现, 文中没有给出它的出处. 按表 4 的数字, TÜLU 2+DPO 70B 的 95.1 对比 GPT-3.5-turbo-0301 应是 95.1 对 83.6, 正文引用的版本号与数字都和表 4 对不上, 属于论文自身的一处不一致.


<!-- page 7 of 15 -->

Size Model MT-Bench AlpacaEval

Average Score Winrate (%) Avg. Output

Length

unk.

GPT-4-1106-preview 9.26 97.1 2041 GPT-4-0613 9.18 91.2 1090 GPT-3.5-turbo-0613 8.39 91.8 1416 GPT-3.5-turbo-0301 7.94 83.6 838

7B Zephyr-Beta 7.35 86.3 2721 TÜLU 2 6.30 73.9 1248 TÜLU 2+DPO 6.27 85.1 1437

13B Xwin v0.2 7.01 91.0 2748 TÜLU 2 6.70 78.9 1034 TÜLU 2+DPO 7.00 89.5 1414

70B Xwin v0.1 7.53 95.8 1797 TÜLU 2 7.49 86.6 1011 TÜLU 2+DPO 7.89 95.1 1414

Table 4: MT-Bench and AlpacaEval results, along with average output length of AlpacaEval responses. GPT model size is unknown. We include output length to observe the effect of DPO on model verbosity. ‘GPT-4-1106-preview’ is also known as ‘GPT-4 Turbo’ (See https://help.openai. com/en/articles/8555510-gpt-4-turbo).

DPO training is stable at large scales. We find that DPO training scales without issues with 70B- size models, with DPO training still providing large benefits for open-ended generation (AlpacaEval) even at the 70B size. This suggests DPO is a promising path for training large models on human feedback without the engineering complexity required by PPO. To our knowledge, TÜLU 2+DPO 70B is the largest publicly-released DPO-trained model.

DPO 训练在大规模下稳定. DPO 训练在 70B 规模上没有出现问题, 即使在这个规模上仍给开放式生成 (AlpacaEval) 带来很大收益. 这说明 DPO 是一条有前景的路径: 不用 PPO 那样的工程复杂度, 就能在大模型上利用人类反馈训练. 就本文所知, TÜLU 2+DPO 70B 是公开发布的最大的 DPO 训练模型.

DPO does not dramatically harm most other metrics. We find that DPO training does not significantly change performance in most other metrics we measure, such as factual reasoning (MMLU) or reasoning (BBH, GSM8k), with the exception of multilinguality (which we discuss below). This suggests that DPO training does not significantly change model capabilities.

DPO 不会明显损害多数其他指标. 除多语言能力 (下面讨论) 外, DPO 训练不改变多数已测指标的显著表现, 比如事实推理 (MMLU) 或推理 (BBH, GSM8k). 这说明 DPO 训练不会明显改变模型能力.

DPO training significantly drops multilingual capabilities. We find that DPO training signifi- cantly drops performance in TydiQA, which tests the multilingual capabilities of our model. However, we note that both our supervised finetuning and DPO data mixes do not explicitly contain multilingual data, and are majority English-language. As such, DPO training is likely to make multilingual outputs further out-of-distribution, and mixing in multilingual data at instruction tuning and DPO training stages may significantly improve these results.

DPO 训练显著拉低多语言能力. DPO 训练大幅降低了考察多语言能力的 TydiQA 表现. 不过本文也注意到, SFT 和 DPO 数据混合都没有显式包含多语言数据, 绝大多数是英文. 因此 DPO 训练很可能让多语言输出更加超出训练分布; 如果在指令微调和 DPO 两个阶段都混入多语言数据, 结果可能会有明显改善.

DPO training increases model verbosity. As seen in Table 4, TÜLU 2+DPO models generally output answers of longer length than those trained without DPO. This is in line with prior work showing a bias toward verbosity from RLHF training [Dubois et al., 2023, Singhal et al., 2023]. However, we note that our DPO-trained models appear dramatically less verbose than other open- weight models, which future work will investigate.

DPO 训练让模型输出变长. 表 4 显示, TÜLU 2+DPO 模型的输出普遍比未做 DPO 的模型更长, 这与先前工作发现的 RLHF 训练偏向冗长输出一致 [Dubois et al., 2023, Singhal et al., 2023]. 不过本文的 DPO 模型似乎比其他开放权重模型短得多, 这一点留待未来工作研究.

3.4 Parameter-efficient Finetuning

In order to reduce compute demands, we experimented with using quantized low-rank adaptation (QLoRA) [Dettmers et al., 2023] at the instruction tuning stage. We followed the suggested hyperpa- rameters from Dettmers et al. [2023] and trained LLAMA-2 models at all sizes using QLoRA. We compare these to our fully-finetuned TÜLU 2 models (without DPO) in Table 5. We find:

为降低算力需求, 本文在指令微调阶段实验了量化低秩适配 (QLoRA) [Dettmers et al., 2023]. 具体沿用 Dettmers et al. [2023] 的推荐超参, 在所有规模上用 QLoRA 训练 LLAMA-2. 与全量微调的 TÜLU 2 (未做 DPO) 的对比如表 5. 发现如下:

QLoRA struggles on open-ended generation tasks. We observe that QLoRA underperforms full-finetuning in AlpacaEval in a consistent manner, likely due to the open-ended nature of the task.

QLoRA 在开放式生成任务上吃力. QLoRA 在 AlpacaEval 上稳定落后于全量微调, 原因可能在于这类任务的开放式本质.

<!-- page 8 of 15 -->

Size Model MMLU GSM8k BBH TydiQA Codex-Eval AlpacaEval ToxiGen TruthfulQA Average 0-shot 8-shot CoT 3-shot CoT 1-shot Pass@10 %win % Toxic %Info+True

7B LLAMA-2 base 41.8 12.0 39.3 51.2 26.8 - 77.3 26.7 - TÜLU 2 50.4 34.0 48.5 46.4 36.9 73.9 7.0 40.8 53.0 TÜLU 2 (QLoRA) 48.8 20.5 45.7 49.2 31.7 56.1 14.7 44.6 47.7

13B LLAMA-2 base 52.0 25.0 48.9 56.5 32.5 - 85.7 31.1 - TÜLU 2 55.4 46.0 49.5 53.2 49.0 78.9 1.7 55.8 60.8 TÜLU 2 (QLoRA) 54.6 36.0 52.5 54.6 39.1 65.6 0.0 55.2 57.2

70B LLAMA-2 base 64.5 55.5 66.0 62.6 60.1 - 84.2 38.2 - TÜLU 2 67.3 73.0 68.4 53.6 68.5 86.6 0.5 62.2 73.4 TÜLU 2 (QLoRA) 67.4 64.5 71.6 60.9 66.9 78.6 0.5 58.4 71.0

Table 5: Results from LLAMA-2 models finetuned with and without QLoRA on our V2 mix. We also report results from LLAMA-2 models without any finetuning (base).

We suggest the discrepancy of our results compared to Dettmers et al. [2023] may be due to the wider set of tasks in our evaluation suite, as Dettmers et al. [2023] focusses on MMLU performance as a way to compare QLoRA and full-finetuning performance (where we do see much closer performance between QLoRA and full-finetuning). In our overall average, we observe a gap between QLoRA and full-finetuning.

本文与 Dettmers et al. [2023] 结论的差异, 可能是因为本文评测套件覆盖的任务更宽: Dettmers et al. [2023] 主要用 MMLU 对比 QLoRA 与全量微调, 而在 MMLU 上本文也确实看到两者差距很小. 在本文的整体平均上, QLoRA 与全量微调之间存在差距.

The gap between QLoRA and full-finetuning shrinks with size. Similar to prior work in parameter-efficient learning [Lester et al., 2021], we find that the average gap in performance between QLoRA and full-finetuning shrinks with model size, suggesting that QLoRA may start to match full-finetuning at even larger model sizes.

QLoRA 与全量微调之间的差距随规模缩小. 与参数高效学习的先前工作 [Lester et al., 2021] 类似, QLoRA 与全量微调的平均差距随模型规模增大而缩小, 这提示在更大规模上 QLoRA 可能开始追平全量微调.

7B 的 TÜLU 2 在表 2 里是 TruthfulQA 50.2, 平均 54.2, 在表 5 里却是 TruthfulQA 40.8, 平均 53.0; 13B 和 70B 两行两表一致. 两个表测的应是同一批 checkpoint, 只有 7B 的 TruthfulQA 和平均对不上, 相差 9.4 与 1.2, 文中没有解释这个差异, 属于论文自身的一处不一致; 按表 5 的平均 53.0 反推, 它用的 TruthfulQA 应是 40.8.

3.5 Improving Code Performance with CODE LLAMA

Size Model MMLU GSM8k BBH TydiQA Codex-Eval AlpacaEval ToxiGen TruthfulQA Average 0-shot 8-shot CoT 3-shot CoT 1-shot Pass@10 %win % Toxic %Info+True

7B CODE LLAMA base 33.8 12.0 43.4 47.6 58.7 - 81.5 26.1 - CODE LLAMA Instruct 41.5 17.0 38.4 41.6 64.1 71.9 1.0 15.2 48.6 TÜLU 2 50.4 34.0 48.5 46.4 36.9 73.9 7.0 40.8 53.0 CODE TÜLU 2 43.7 33.0 49.1 52.6 68.9 58.0 5.0 33.0 54.2

13B CODE LLAMA base 37.5 22.0 49.5 52.1 69.8 - 77.9 26.9 - CODE LLAMA Instruct 43.3 23.0 48.0 37.8 69.2 75.3 0.0 38.1 54.3 TÜLU 2 55.4 46.0 49.5 53.2 49.0 78.9 1.7 55.8 60.8 CODE TÜLU 2 45.9 41.0 52.8 55.7 76.2 64.1 0.0 36.7 59.1

34B CODE LLAMA base 47.4 35.0 57.0 57.1 77.6 - 88.3 24.4 - CODE LLAMA Instruct 50.9 38.0 59.2 55.1 76.5 84.5 0.0 51.2 64.4 CODE TÜLU 2 53.6 54.0 64.3 60.6 82.5 76.8 0.0 42.0 66.7

Table 6: Evaluation results comparing models based on CODE LLAMA with our TÜLU models. CODE TÜLU 2 refers to CODE LLAMA models finetuned on our V2 mixture.


<!-- page 9 of 15 -->

Finally, we attempted using CODE LLAMA [Roziere et al., 2023] as a base model instead of LLAMA-2 due to its improved performance on coding tasks. We dub CODE LLAMA models trained on our V2 data mixture as CODE TÜLU 2 models. We present our results comparing CODE LLAMA and LLAMA-2 models fully finetuned on our V2 mixture in Table 6. We find that:

末尾, 由于 CODE LLAMA [Roziere et al., 2023] 编码任务更强, 本文尝试用它代替 LLAMA-2 做基座, 把在 V2 数据混合上训练的 CODE LLAMA 模型称为 CODE TÜLU 2. CODE LLAMA 与 LLAMA-2 基座在 V2 混合上全量微调的结果对比见表 6. 发现如下:

CODE TÜLU 2 models significantly outperform TÜLU 2 models at coding tasks. As expected, CODE TÜLU 2 models report drastically improved Codex-Eval performance compared to TÜLU 2 – in Codex-Eval, our smallest (7B) CODE TÜLU 2 model matches the performance of TÜLU-V2+DPO 70B, our strongest LLAMA-2-based model. This highlights the efficacy of using smaller, domain- specific models when limiting evaluation to that domain alone.

CODE TÜLU 2 在编码任务上大幅超过 TÜLU 2. 如预期, CODE TÜLU 2 的 Codex-Eval 相比 TÜLU 2 提升巨大: 最小的 (7B) CODE TÜLU 2 在 Codex-Eval 上就追平了 TÜLU 2+DPO 70B, 即本文最强的 LLAMA-2 基座模型. 这说明在只考察单一领域的评测里, 用更小的领域专用模型是有效的.

CODE TÜLU 2 and TÜLU 2 display drastically different results across non-code evaluations. While we can only compare two sizes, we find that TÜLU 2 models consistently outperform CODE TÜLU 2 models in 4 out of 8 tasks (MMLU, GSM8k, AlpacaEval, TruthfulQA), while CODE TÜLU 2 performs well in BBH, TydiQA, ToxiGen, and Codex-Eval. Since CODE LLAMA models are variants of LLAMA-2 models additionally pretrained on code data, this suggests the continued code pretraining has significantly altered model capabilities. In particular, we note that performance on AlpacaEval appears to drop by a large margin (by around 20%).

CODE TÜLU 2 与 TÜLU 2 在非编码评测上差异很大. 虽然只能对比两个规模, 但 TÜLU 2 在 8 项任务中的 4 项 (MMLU, GSM8k, AlpacaEval, TruthfulQA) 稳定优于 CODE TÜLU 2, CODE TÜLU 2 则在 BBH, TydiQA, ToxiGen 和 Codex-Eval 上更好. CODE LLAMA 是在代码数据上继续预训练的 LLAMA-2 变体, 这说明持续的代码预训练显著改变了模型能力. 特别地, AlpacaEval 表现大幅下降 (约 20%).

Code TÜLU 2 outperforms CODE LLAMA-base and CODE LLAMA-Instruct across all sizes. We find that CODE TÜLU 2 models, using our V2 data mix, outperform both base CODE LLAMA and CODE LLAMA-Instruct models in 5 our of 8 evaluation settings (and are stronger on average), highlighting the efficacy of our V2 data mixture. CODE LLAMA-Instruct was finetuned on an internally developed private dataset we do not have access to, which makes it difficult to compare to our mixture, but the strong performance of CODE LLAMA-Instruct on AlpacaEval suggests the mixture may focus on general open-ended queries rather than specific model capabilities.

Code TÜLU 2 在所有规模上都超过 CODE LLAMA 基座与 CODE LLAMA-Instruct. 用 V2 混合训练的 CODE TÜLU 2 在 8 项评测设置中的 5 项上超过 CODE LLAMA 基座和 CODE LLAMA-Instruct (平均也更强), 显示 V2 数据混合的有效性. CODE LLAMA-Instruct 微调用的是其内部私有数据集, 本文无法拿到, 难以与本文混合直接对比; 但 CODE LLAMA-Instruct 在 AlpacaEval 上很强, 暗示其数据混合可能更侧重通用开放式提问, 而非具体模型能力.

We release our CODE TÜLU 2 models alongside the rest of our V2 suite.

本文把 CODE TÜLU 2 与其余 V2 套件一起发布.

4 Conclusion

We present TÜLU 2, a set of models, along with recipes for continuing the progress of fine-tuning LMs across a variety of tasks. This release represents a strong incremental step through better performance of the new data mixture, stability of DPO training, and comparison to parameter-efficient training methods.

本文发布 TÜLU 2, 一组模型与一套配方, 延续了在多种任务上微调 LM 的进展. 这次发布通过新数据混合的更优表现, DPO 训练的稳定性, 以及与参数高效训练方法的对比, 迈出了一步扎实的增量推进.

Substantial work is still needed to understand the mechanisms causing the improvement in perfor- mance from these datasets and the DPO training methodology. Future work could involve more investigation of the impact of methods such as DPO on handling refusal behaviour, investigating the impact of different data ablations on DPO performance, and performing comparisons to other RLHF algorithms (e.g., PPO) at scale. Additionally, incorporating improved base models will likely yield further gains over the models presented here. We hope such work can be enabled by the public release of all our data, code, and models.

要理解这些数据集与 DPO 训练方法为何带来提升, 还有大量工作要做. 未来方向包括: 更深入研究 DPO 等方法对拒答行为的影响, 研究不同数据消融对 DPO 表现的影响, 以及在更大规模上与其他 RLHF 算法 (如 PPO) 对比. 此外, 换用更强的基座模型, 很可能在本文模型基础上进一步提升. 希望公开全部数据, 代码和模型能支撑这类工作.

Acknowledgments

Research supported by Cloud TPUs from Google’s TPU Research Cloud (TRC). We thank Eric Mitchell and Rafael Rafailov for helpful discussions involving DPO training dynamics.

研究得到 Google TPU Research Cloud (TRC) 的 Cloud TPU 支持. 感谢 Eric Mitchell 和 Rafael Rafailov 关于 DPO 训练动态的有益讨论.

References

R. Anil, A. M. Dai, O. Firat, M. Johnson, D. Lepikhin, A. Passos, S. Shakeri, E. Taropa, P. Bailey,

Z. Chen, et al. Palm 2 technical report. arXiv preprint arXiv:2305.10403, 2023.

Y. Bai, A. Jones, K. Ndousse, A. Askell, A. Chen, N. DasSarma, D. Drain, S. Fort, D. Ganguli,

T. Henighan, et al. Training a helpful and harmless assistant with reinforcement learning from human feedback. arXiv preprint arXiv:2204.05862, 2022.

I. Cachola, K. Lo, A. Cohan, and D. Weld. TLDR: Extreme summarization of scientific documents. In

Findings of the Association for Computational Linguistics: EMNLP 2020, pages 4766–4777, On-

line, Nov. 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020.findings-emnlp. 428. URL https://aclanthology.org/2020.findings-emnlp.428.

S. Chaudhary. Code alpaca: An instruction-following llama model for code generation. GitHub

repository, 2023. URL https://github.com/sahil280114/codealpaca.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. d. O. Pinto, J. Kaplan, H. Edwards, Y. Burda,

N. Joseph, G. Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

W.-L. Chiang, Z. Li, Z. Lin, Y. Sheng, Z. Wu, H. Zhang, L. Zheng, S. Zhuang, Y. Zhuang, J. E. Gonza-

lez, I. Stoica, and E. P. Xing. Vicuna: An open-source chatbot impressing gpt-4 with 90%* chatgpt quality. Blog post, March 2023. URL https://lmsys.org/blog/2023-03-30-vicuna/.


<!-- page 10 of 15 -->

H. W. Chung, L. Hou, S. Longpre, B. Zoph, Y. Tay, W. Fedus, E. Li, X. Wang, M. Dehghani,

S. Brahma, et al. Scaling instruction-finetuned language models. arXiv preprint arXiv:2210.11416, 2022.

G. Cui, L. Yuan, N. Ding, G. Yao, W. Zhu, Y. Ni, G. Xie, Z. Liu, and M. Sun. Ultrafeedback:

Boosting language models with high-quality feedback. arXiv preprint arXiv:2310.01377, 2023.

P. Dasigi, K. Lo, I. Beltagy, A. Cohan, N. A. Smith, and M. Gardner. A dataset of information-seeking

questions and answers anchored in research papers. In Proceedings of the 2021 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Tech- nologies, pages 4599–4610, Online, June 2021. Association for Computational Linguistics. doi: 10. 18653/v1/2021.naacl-main.365. URL https://aclanthology.org/2021.naacl-main.365.

Databricks. Free dolly: Introducing the world’s first truly open instruction-tuned llm. Blog post, 2023. URL https://www.databricks.com/blog/2023/04/12/ dolly-first-open-commercially-viable-instruction-tuned-llm.

T. Dettmers, A. Pagnoni, A. Holtzman, and L. Zettlemoyer. Qlora: Efficient finetuning of quantized

llms. arXiv preprint arXiv:2305.14314, 2023.

N. Ding, Y. Chen, B. Xu, S. Hu, Y. Qin, Z. Liu, M. Sun, and B. Zhou. Ultrachat: A large-scale

auto-generated multi-round dialogue data. GitHub Repository, 2023. URL https://github. com/thunlp/ultrachat.

Y. Dubois, X. Li, R. Taori, T. Zhang, I. Gulrajani, J. Ba, C. Guestrin, P. Liang, and T. B. Hashimoto.

Alpacafarm: A simulation framework for methods that learn from human feedback. arXiv preprint arXiv:2305.14387, 2023.

X. Geng. Easylm: A simple and scalable training framework for large language models, 2023. URL

https://github.com/young-geng/EasyLM.

C. Gulcehre, T. L. Paine, S. Srinivasan, K. Konyushkova, L. Weerts, A. Sharma, A. Siddhant,

A. Ahern, M. Wang, C. Gu, et al. Reinforced self-training (rest) for language modeling. arXiv preprint arXiv:2308.08998, 2023.

T. Hartvigsen, S. Gabriel, H. Palangi, M. Sap, D. Ray, and E. Kamar. TOXIGEN: Controlling

Language Models to Generate Implied and Adversarial Toxicity. In ACL, 2022. URL https: //arxiv.org/abs/2203.09509.

A. Q. Jiang, A. Sablayrolles, A. Mensch, C. Bamford, D. S. Chaplot, D. d. l. Casas, F. Bressand,

G. Lengyel, G. Lample, L. Saulnier, et al. Mistral 7b. arXiv preprint arXiv:2310.06825, 2023.

A. Köpf, Y. Kilcher, D. von Rütte, S. Anagnostidis, Z.-R. Tam, K. Stevens, A. Barhoum, N. M. Duc,

O. Stanley, R. Nagyfi, et al. Openassistant conversations–democratizing large language model alignment. arXiv preprint arXiv:2304.07327, 2023.

E. Lehman, J. DeYoung, R. Barzilay, and B. Wallace. Inferring which medical treatments work

from reports of clinical trials. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 3705–3717, Minneapolis, Minnesota, June 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1371. URL https://aclanthology.org/ N19-1371.

B. Lester, R. Al-Rfou, and N. Constant. The power of scale for parameter-efficient prompt tun-

ing. In Proceedings of the 2021 Conference on Empirical Methods in Natural Language Pro- cessing, pages 3045–3059, Online and Punta Cana, Dominican Republic, Nov. 2021. Associ- ation for Computational Linguistics. doi: 10.18653/v1/2021.emnlp-main.243. URL https: //aclanthology.org/2021.emnlp-main.243.

X. Li, T. Zhang, Y. Dubois, R. Taori, I. Gulrajani, C. Guestrin, P. Liang, and T. B. Hashimoto.

Alpacaeval: An automatic evaluator of instruction-following models. Github repository, 2023. URL https://github.com/tatsu-lab/alpaca_eval.

<!-- page 11 of 15 -->

W. Lian, B. Goodson, E. Pentland, A. Cook, C. Vong, and "Teknium". Openorca: An open dataset

of gpt augmented flan reasoning traces. https://https://huggingface.co/Open-Orca/ OpenOrca, 2023.

S. Lin, J. Hilton, and O. Evans. Truthfulqa: Measuring how models mimic human falsehoods. In

Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3214–3252, 2022.

Y. Luan, L. He, M. Ostendorf, and H. Hajishirzi. Multi-task identification of entities, relations, and

coreference for scientific knowledge graph construction. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing, pages 3219–3232, Brussels, Belgium, Oct.-Nov. 2018. Association for Computational Linguistics. doi: 10.18653/v1/D18-1360. URL https://aclanthology.org/D18-1360.

MosaicML. Introducing mpt-7b: A new standard for open-source, commercially usable llms. Blog

post, 2023. URL https://www.mosaicml.com/blog/mpt-7b.

S. Mukherjee, A. Mitra, G. Jawahar, S. Agarwal, H. Palangi, and A. Awadallah. Orca: Progressive

learning from complex explanation traces of gpt-4, 2023.

L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. L. Wainwright, P. Mishkin, C. Zhang, S. Agarwal,

K. Slama, A. Ray, et al. Training Language Models to Follow Instructions with Human Feedback. In Advances in Neural Information Processing Systems (NeurIPS), 2022.

B. Peng, C. Li, P. He, M. Galley, and J. Gao. Instruction tuning with gpt-4. arXiv preprint arXiv:2304.03277, 2023.

R. Rafailov, A. Sharma, E. Mitchell, S. Ermon, C. D. Manning, and C. Finn. Direct preference

optimization: Your language model is secretly a reward model. arXiv preprint arXiv:2305.18290, 2023.

B. Roziere, J. Gehring, F. Gloeckle, S. Sootla, I. Gat, X. E. Tan, Y. Adi, J. Liu, T. Remez, J. Rapin,

et al. Code llama: Open foundation models for code. arXiv preprint arXiv:2308.12950, 2023.

M. Santacroce, Y. Lu, H. Yu, Y. Li, and Y. Shen. Efficient rlhf: Reducing the memory usage of ppo,

2023.

P. Singhal, T. Goyal, J. Xu, and G. Durrett. A long way to go: Investigating length correlations in

rlhf. arXiv preprint arXiv:2310.03716, 2023.

C. Snell, I. Kostrikov, Y. Su, M. Yang, and S. Levine. Offline rl for natural language generation with

implicit language q learning. arXiv preprint arXiv:2206.11871, 2022.

S. Sun, D. Gupta, and M. Iyyer. Exploring the impact of low-rank adaptation on the performance,

efficiency, and regularization of rlhf, 2023.

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H.

Chi, D. Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

H. Touvron, T. Lavril, G. Izacard, X. Martinet, M.-A. Lachaux, T. Lacroix, B. Rozière, N. Goyal,

E. Hambro, F. Azhar, et al. Llama: Open and efficient foundation models. arXiv preprint arXiv:2302.13971, 2023a.

H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra,

P. Bhargava, S. Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv:2307.09288, 2023b.

L. Tunstall, E. Beeching, N. Lambert, N. Rajani, K. Rasul, Y. Belkada, S. Huang, L. von Werra,

C. Fourrier, N. Habib, et al. Zephyr: Direct distillation of lm alignment. arXiv preprint arXiv:2310.16944, 2023.

<!-- page 12 of 15 -->

D. Wadden, S. Lin, K. Lo, L. L. Wang, M. van Zuylen, A. Cohan, and H. Hajishirzi. Fact or fiction: Verifying scientific claims. In Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pages 7534–7550, Online, Nov. 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020.emnlp-main.609. URL https://aclanthology.org/2020.emnlp-main.609.

G. Wang, S. Cheng, X. Zhan, X. Li, S. Song, and Y. Liu. Openchat: Advancing open-source language

models with mixed-quality data. arXiv preprint arXiv:2309.11235, 2023a.

Y. Wang, H. Ivison, P. Dasigi, J. Hessel, T. Khot, K. R. Chandu, D. Wadden, K. MacMillan, N. A.

Smith, I. Beltagy, et al. How far can camels go? exploring the state of instruction tuning on open resources. arXiv preprint arXiv:2306.04751, 2023b.

J. Wei, X. Wang, D. Schuurmans, M. Bosma, E. Chi, Q. Le, and D. Zhou. Chain of thought prompting

elicits reasoning in large language models. arXiv preprint arXiv:2201.11903, 2022.

C. Xu, Q. Sun, K. Zheng, X. Geng, P. Zhao, J. Feng, C. Tao, and D. Jiang. Wizardlm: Empowering

large language models to follow complex instructions. arXiv preprint arXiv:2304.12244, 2023.

Xwin-LM Team. Xwin-lm, 2023. URL https://github.com/Xwin-LM/Xwin-LM.

L. Zheng, W.-L. Chiang, Y. Sheng, S. Zhuang, Z. Wu, Y. Zhuang, Z. Lin, Z. Li, D. Li, E. P. Xing,

H. Zhang, J. E. Gonzalez, and I. Stoica. Judging llm-as-a-judge with mt-bench and chatbot arena. In NeurIPS Datasets and Benchmarks Track, 2023.

C. Zhou, P. Liu, P. Xu, S. Iyer, J. Sun, Y. Mao, X. Ma, A. Efrat, P. Yu, L. Yu, et al. Lima: Less is

more for alignment. arXiv preprint arXiv:2305.11206, 2023.


<!-- page 13 of 15 -->

A Evaluation Suite

We describe our evaluation suite below for easy reference:

下面列出评测套件供查阅:

• MMLU: We use the official MMLU evaluation script and prompts available at https://github. com/hendrycks/test, with modifications to allow batch processing. We evaluate using 0 few-shot examples, following the original setup of MMLU. We report average accuracy across test examples.

MMLU: 使用 https://github.com/hendrycks/test 上的官方评测脚本与 prompt, 做了允许批处理的修改. 按 MMLU 原设置用 0 few-shot 评测, 报告测试样本上的平均准确率.

• GSM: We evaluate models on the test set of GSM. Following Wei et al. [2022], we evaluate with chain-of-thought. We use 8 few-shot in-context examples. Because all answers in GSM are numbers, we extract the last number in the model response as the final answer. We report average accuracy across test examples.

GSM: 在 GSM 测试集上评测, 沿用 Wei et al. [2022] 的思维链方式, 用 8 个 few-shot 示例. GSM 的答案都是数字, 因此取模型回复中末尾一个数字作为最终答案, 报告测试样本上的平均准确率.

• BBH: We follow the setup described in the original paper Suzgun et al. [2022], and evaluate with chain-of-thought. The officially provided prompts, which have 3 few-shot in-context examples are used. For the CoT setup, we extract the first word after the phrase ‘So the answer is’, or the entire response if there is no such substring present. We report average accuracy over sub-tasks (all of which use accuracy as the primary metric).

BBH: 沿用 Suzgun et al. [2022] 的设置, 以思维链评测, 用官方提供的 3 few-shot prompt. CoT 设置下, 取 ‘So the answer is’ 之后的第一个词, 没有该子串则取整个回复. 报告各子任务 (均以准确率为主要指标) 的平均准确率.

• TydiQA: We follow the setup described in the PaLM 2 technical report [Anil et al., 2023] to evaluate models’ performance in answering multilingual questions. We report only one setting, GP, where the gold passage that contains the answer is given (GoldP/GP). One in-context example is used to familiarize the model with the answering format.

TydiQA: 沿用 PaLM 2 技术报告 [Anil et al., 2023] 的设置评测多语言问答. 只报告 GP 这一种设置, 即给定含答案的金标段落 (GoldP/GP). 用 1 个 in-context 示例让模型熟悉答题格式.

• Codex-Eval: We use the HumanEval dataset in the Codex paper [Chen et al., 2021] for evaluating models’ coding ability. The dataset contains 164 programming problems, where models are prompted to complete the Python function given its docstring. Following the original paper, we compute unbiased estimates of pass@k to measure the functional correctness of models’ outputs. We report pass@10. We sample with a temperature of 0.8.

Codex-Eval: 用 Codex 论文 [Chen et al., 2021] 的 HumanEval 数据集评测编码能力. 数据集含 164 个编程问题, 给出函数 docstring 让模型补全 Python 函数. 沿用原文计算 pass@k 的无偏估计, 报告 pass@10, 采样温度 0.8.

• ToxiGen: We follow the setup in Touvron et al. [2023b], but use the original set of prompts from Hartvigsen et al. [2022], which are designed to elicit toxic generations for certain groups. We take only the prompts designed to produce toxic language (‘hateful’ prompts) and use 500 prompts per group to reduce evaluation costs. For base language models, we pass in the original ToxiGen prompts unchanged and greedily decode up to the first new line (or a maximum of 512 tokens). For instruction-tuned models, we place the prompt in the corresponding template, and ask the model to complete the prompt, until the model generates a stop token (or a maximum of 512 tokens). We pass the generated text into a roberta-large model trained to detect toxic content finetuned as part of Hartvigsen et al. [2022]5. We then report the percentage of generations deemed toxic by the classifier.

ToxiGen: 沿用 Touvron et al. [2023b] 的设置, 但用 Hartvigsen et al. [2022] 的原始 prompt (为诱发对特定群体的有毒生成而设计). 只取设计为产出有毒语言的 (‘hateful’) prompt, 每组 500 条以控制评测成本. 基座模型直接输入原始 prompt, 贪心解码到第一个换行 (或最多 512 token); 指令微调模型把 prompt 放入对应模板让模型续写, 直到产生 stop token (或最多 512 token). 生成文本送入一个 roberta-large 毒性分类器 (Hartvigsen et al. [2022] 微调产物), 报告被分类为有毒的生成比例.

• TruthfulQA: Following Touvron et al. [2023b], we mainly use the generation setting of TruthfulQA [Lin et al., 2022]. The TruthfulQA dataset contains 818 questions, which are used to prompt the tested model to generate answers. We use the default QA prompt format with 6 in-context QA examples. We follow the official script in their official implemention6 to do greedy decoding and answer postprocessing. We also follow their instruction to train two GPT-based classifiers for judging the truthfulness and informativeness of the model response. We report the rate of the responses being truthful and informative (% Informative and Truthful) following Touvron et al. [2023b]. We only report the % Informative and Truthful as our primary metric.

TruthfulQA: 沿用 Touvron et al. [2023b], 主要用 TruthfulQA [Lin et al., 2022] 的生成设置. 数据集含 818 个问题, 用来让被测模型生成答案. 用默认 QA prompt 格式和 6 个 in-context QA 示例, 按官方脚本做贪心解码与答案后处理. 按其说明训练两个 GPT 分类器评判回复的真实性与信息量, 报告既真实又有信息量的比例 (% Informative and Truthful) 作为主要指标.

• AlpacaEval: We use the package provided by Li et al., following the default setup which asks the evaluated model to generate responses for 805 prompts and employ GPT-4 to compare the response with Davinci-003. We employ the “alpaca_eval_gpt4” annotator. We allow the evaluated model to generate up to 8192 tokens, without specifying special stop sequences. The reported win-rate is the percentage of model generations that GPT-4 reports as being preferred over the generations from Davinci-003.

AlpacaEval: 使用 Li et al. 提供的包, 按默认设置让被测模型对 805 个 prompt 生成回复, 再由 GPT-4 与 Davinci-003 的回复对比. 评判器用 “alpaca_eval_gpt4”. 被测模型最多生成 8,192 token, 不设特殊 stop 序列. 报告的胜率是 GPT-4 判定优于 Davinci-003 回复的比例.

• MT-Bench: We use the single-answer grading setting of MT-Bench, as suggested by the MT-Bench repository7. MT-Bench consists of 80 questions with followups, resulting in 160 responses being

MT-Bench: 按 MT-Bench 仓库建议, 用单回答评分设置. MT-Bench 含 80 个带追问的问题, 共 160 个回复待评分.

5https://huggingface.co/tomh/toxigen_roberta 6https://github.com/sylinrl/TruthfulQA/ 7https://github.com/lm-sys/FastChat/tree/main/fastchat/llm_judge#mt-bench

13


<!-- page 14 of 15 -->

graded by a GPT-4 model across varying domains. While MT-Bench does not have a pinned GPT-4 version, we ensure all reported evaluations use GPT-4-0613.

由 GPT-4 对不同领域打分. MT-Bench 没有固定 GPT-4 版本, 本文保证所有报告的评测都用 GPT-4-0613.

B Training Hyperparameters

For instruction-tuning/supervised fine-tuning, our training hyperparameters were as follows:

指令微调/有监督微调的训练超参如下:

• Precision: BFloat16 • Epochs: 2 • Weight decay: 0 • Warmup ratio: 0.03 • Learning rate: 2e-5 (1e-5 for 70B) • Max. seq. length: 8,192 • Effective batch size: 128

精度: BFloat16; 训练轮数: 2; 权重衰减: 0; Warmup 比例: 0.03; 学习率: $2 \times 10^{-5}$ (70B 用 $1 \times 10^{-5}$); 最大序列长: 8,192; 有效 batch size: 128.

For QLoRA training, we used the following:

QLoRA 训练的超参如下:

• Epochs: 5 • Weight decay: 0 • Warmup ratio: 0.03 • Learning rate: 1e-4 • Max. seq. length: 4,096 • Effective batch size: 128 • LoRA Rank: 64 • LoRA Alpha: 16 • LoRA dropout: 0.1 • Layers wrapped: all attention and feedforward linear layers

训练轮数: 5; 权重衰减: 0; Warmup 比例: 0.03; 学习率: $1 \times 10^{-4}$; 最大序列长: 4,096; 有效 batch size: 128; LoRA rank: 64; LoRA alpha: 16; LoRA dropout: 0.1; 包裹的层: 全部注意力与前馈线性层.

We experimented with a variety of QLoRA hyperparameters and found in smaller-scale experiments that these were the best hyperparameters we could fit into our compute budget while still giving strong performance.

本文尝试了多种 QLoRA 超参, 在小规模实验中发现: 这是在算力预算内能放下且仍给出强表现的最好超参组合.

For DPO, we used the following hyperparameters:

DPO 训练的超参如下:

• Precision: BFloat16 • Epochs: 3 • Weight decay: 0 • Warmup ratio: 0.1 • Learning rate: 5e-7 • Max. seq. length: 8,192 • Effective batch size: 32 • Beta: 0.1

精度: BFloat16; 训练轮数: 3; 权重衰减: 0; Warmup 比例: 0.1; 学习率: $5 \times 10^{-7}$; 最大序列长: 8,192; 有效 batch size: 32; $\beta$: 0.1.

All models except QLoRA models were trained on a 256-chip (512-chip for 70B DPO train- ing) TPU v3 pod. Our training code is based off EasyLM [Geng, 2023] and available at https://github.com/hamishivi/EasyLM.

除 QLoRA 模型外, 所有模型都在 256 芯片的 TPU v3 pod 上训练 (70B 的 DPO 训练用 512 芯片). 训练代码基于 EasyLM [Geng, 2023], 见 https://github.com/hamishivi/EasyLM.

QLoRA models were trained on an internal A100 80GB cluster using finetuning code available at https://github.com/allenai/open-instruct.

QLoRA 模型在内部 A100 80GB 集群上训练, 微调代码见 https://github.com/allenai/open-instruct.

C Science Mixture Breakdown

We provide a breakdown of what tasks are included, and their dataset of origin, in our science mixture in Table 7.

表 7 列出科学文献混合包含的任务及来源数据集.

14


<!-- page 15 of 15 -->

Dataset Tasks # Examples

Evidence Inference [Lehman et al., 2019] Information extraction: Medical evidence 5-tuples 1,678 Qasper [Dasigi et al., 2021] Question answering 2,255 SciERC [Luan et al., 2018] Information extraction: Named entity recognition, Relation extraction 700 SciFact [Wadden et al., 2020] Fact checking 919 SciTLDR [Cachola et al., 2020] Summarization 1,992

Table 7: Datasets included in the science literature instruction mix for TÜLU V2.

数据集 | 任务 | 条数

Evidence Inference [Lehman et al., 2019] | 信息抽取: 医学证据 5 元组 | 1,678

Qasper [Dasigi et al., 2021] | 问答 | 2,255

SciERC [Luan et al., 2018] | 信息抽取: 命名实体识别, 关系抽取 | 700

SciFact [Wadden et al., 2020] | 事实核查 | 919

SciTLDR [Cachola et al., 2020] | 摘要 | 1,992

表 7 题注: TÜLU V2 科学文献指令混合包含的数据集.

D Full MT-Bench Results

In Table 8 we show full MT-Bench results, split by category, for all models shown in Table 4. We use GPT-4-0613 as the judge model.

表 8 按类别给出表 4 中所有模型的完整 MT-Bench 结果, 评判模型为 GPT-4-0613.

STEM Humanities Reasoning Coding Math Extraction Roleplay Writing Average

Proprietary Models

GPT-4-1106-preview 9.90 9.95 8.10 9.05 7.95 9.90 9.50 9.70 9.26 GPT-4-0613 9.65 9.85 9.30 8.60 8.10 9.35 9.03 9.55 9.18 GPT-3.5-turbo-0613 9.55 9.95 6.20 7.05 7.05 9.00 8.65 9.65 8.39 GPT-3.5-turbo-0301 9.05 9.55 6.30 6.70 5.20 8.60 8.55 9.60 7.94

Open Models

LLAMA-2-Chat 7B 8.65 8.75 4.25 3.00 2.40 6.50 7.70 8.90 6.27 LLAMA-2-Chat 13B 8.63 9.75 5.10 3.00 3.45 6.93 7.50 8.85 6.65 LLAMA-2-Chat 70B 8.93 9.63 5.80 3.15 3.30 7.25 7.50 9.30 6.86 Zephyr-Beta 7B 9.03 9.63 5.60 5.10 4.45 7.45 8.20 9.35 7.35 Xwin 70b v0.1 9.68 9.95 6.55 4.25 3.30 8.75 8.25 9.55 7.53 Xwin 13b v0.2 9.55 9.88 5.20 3.60 2.85 7.70 8.60 8.68 7.01

TÜLU V2 Models

TÜLU 2 7B 8.00 9.50 4.40 3.40 3.30 6.10 7.63 8.10 6.30 TÜLU 2+DPO 7B 8.23 9.60 4.30 3.32 2.35 6.05 7.95 8.35 6.27 TÜLU 2 13B 8.70 9.25 5.45 4.30 3.75 7.35 7.50 7.30 6.70 TÜLU 2+DPO 13B 9.08 9.80 5.30 3.60 2.95 8.00 8.60 8.70 7.00 TÜLU 2 70B 9.00 9.75 5.50 5.10 4.70 8.45 8.30 9.15 7.49 TÜLU 2+DPO 70B 9.00 9.90 7.00 4.70 4.65 9.35 9.25 9.25 7.89

Table 8: Full MT-Bench results split by category. Score is an average of scores given by a GPT-4 annotator. The best open-weight model performance is underlined.

15
