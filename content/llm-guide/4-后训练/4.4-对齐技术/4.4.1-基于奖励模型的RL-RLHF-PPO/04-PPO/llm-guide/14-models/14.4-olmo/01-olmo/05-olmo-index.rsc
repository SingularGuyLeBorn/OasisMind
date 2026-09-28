monsense. Given evaluating on its 150 tasks is time-consuming for LLMs, we report the BIG-bench-lite -- an official 24-task sub-collection -- for now.

BIG-bench (Srivastava et al., 2022) 对涉及模型推理、知识和常识能力的挑战性任务进行基准测试。鉴于对其 150 个任务的评估对 LLM 而言耗时,我们目前报告 BIG-bench-lite -- 一个官方的 24 任务子集。

Observed from Figure 7 and Table 4, GLM-130B outperforms GPT-3 175B and even PaLM 540B (4x larger) in zero-shot setting. This is probably owing to GLM-130B's bidirectional context attention and MIP, which has been proved to improve zero-shot results in unseen tasks. As the number of shots increases, GLM-130B's performance keeps going up, maintaining its outperformance over GPT-3.

从图 7 和表 4 观察,GLM-130B 在零样本设置中优于 GPT-3 175B 甚至 PaLM 540B(大 4 倍)。这可能归功于 GLM-130B 的双向上下文注意力和 MIP,后者已被证明可以改善未见任务的零样本结果。随着 shot 数量增加,GLM-130B 的性能持续上升,保持对 GPT-3 的优势。

> 译者注(结果分析): BIG-bench 零样本结果揭示了 GLM 架构的独特优势。1) 在零样本设置中击败 PaLM 540B(参数大四倍)是一个显著成就,说明架构选择(双向注意力 + 多任务预训练)可以部分弥补规模差距;2) 然而,随着 shot 增加,PaLM 的增长速度更快,这符合缩放定律的预期 -- 更大模型从上下文学习中获益更多;3) 作者对"少样本增长不如 GPT-3 显著"的分析值得注意: 他们认为双向模型本身的零样本性能已经接近少样本上限,而现有 MIP 范式只训练零样本预测,可能存在偏差;4) 这一反思直接启发了后续的改进方向 -- 在 MIP 中引入 varied shots 的训练。

**Limitations and Discussions.** In the experiments above, we observe that GLM-130B's performance growth (13.31 to 15.12) with the increase of few-shot samples is not as significant as GPT-3's (4.35 to 13.18). Here is our intuitive attempt to understand the phenomenon.

**局限性与讨论。** 在上述实验中,我们观察到 GLM-130B 的性能增长(13.31 到 15.12)随少样本数量增加不如 GPT-3(4.35 到 13.18)显著。以下是我们直观理解这一现象的尝试。

First, the bidirectional nature of GLM-130B could lead to strong zero-shot performance (as is indicated in zero-shot language modeling), thus getting closer to the few-shot "upper-bound" for models of similar scale (i.e., 100B-scale) than unidirectional LLMs. Second, it may be also attributed to a deficit of existing MIP paradigms (Wei et al., 2022a; Sanh et al., 2022), which only involve zero-shot prediction in the training and will be likely to bias GLM-130B for stronger zero-shot learning but relatively weaker in-context few-shot performance.

首先,GLM-130B 的双向性质可能导致强大的零样本性能(如零样本语言建模所示),因此比单向 LLM 更接近相似规模模型(即 100B 规模)的少样本"上限"。其次,这也可能归因于现有 MIP 范式(Wei et al., 2022a; Sanh et al., 2022)的缺陷,它们仅在训练中涉及零样本预测,可能使 GLM-130B 偏向于更强的零样本学习但相对较弱的上下文少样本性能。

### 5.4 CHINESE LANGUAGE UNDERSTANDING EVALUATION (CLUE)
#### 中文语言理解评估

We evaluate GLM-130B's Chinese zero-shot performance on established Chinese NLP benchmarks, CLUE (Xu et al., 2020) and FewCLUE (Xu et al., 2021). Note that we do not include any Chinese downstream tasks in MIP. To date, we have finished testing on part of the two benchmarks, including 7 CLUE and 5 FewCLUE datasets.

我们在成熟的中文 NLP 基准 CLUE (Xu et al., 2020) 和 FewCLUE (Xu et al., 2021) 上评估 GLM-130B 的中文零样本性能。注意我们在 MIP 中未包含任何中文下游任务。截至目前,我们已完成两个基准的部分测试,包括 7 个 CLUE 和 5 个 FewCLUE 数据集。

We compare GLM-130B to the largest existing Chinese monolingual language model -- the 260B ERNIE Titan 3.0 (Wang et al., 2021). We follow its setting to report zero-shot results on dev datasets. GLM-130B consistently outperforms ERNIE Titan 3.0 across 12 tasks. Interestingly, GLM-130B performs at least 260% better than ERNIE on two abstractive MRC datasets (DRCD and CMRC2018), possibly due to GLM-130B's pre-training objective that naturally resonates to abstractive MRC's form.

我们将 GLM-130B 与当时最大的中文单语语言模型 -- 260B ERNIE Titan 3.0 (Wang et al., 2021) -- 进行比较。我们遵循其设置报告 dev 数据集上的零样本结果。GLM-130B 在 12 个任务上始终优于 ERNIE Titan 3.0。有趣的是,GLM-130B 在两个抽象 MRC 数据集(DRCD 和 CMRC2018)上比 ERNIE 好至少 260%,这可能归因于 GLM-130B 的预训练目标与抽象 MRC 形式天然共鸣。

> 译者注(结果分析): CLUE 结果展示了 GLM-130B 双语能力的独特价值。1) 以 130B 参数击败 260B 的 ERNIE Titan 3.0,证明了双语联合预训练的效率 -- 中英文知识可以相互迁移和增强;2) 在抽象 MRC 任务上的压倒性优势(260%+)直接源于 GLM 的空白填充预训练目标: 模型本质上就是在做"从上下文中生成被掩码内容"的任务,这与阅读理解的形式高度一致;3) 值得注意的是,ERNIE 3.0 Titan 是百度在 2021 年发布的当时最大中文模型,GLM-130B 的结果表明开源社区模型可以匹敌甚至超越工业界闭源模型。

## 6 RELATED WORK
### 相关工作

In this section, we review related work to GLM-130B on topics of pre-training, transferring, and inference of pre-train