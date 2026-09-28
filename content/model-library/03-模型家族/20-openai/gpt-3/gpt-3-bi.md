<!-- page 1 of 75 -->

arXiv:2005.14165v4 [cs.CL] 22 Jul 2020

arXiv 编号 2005.14165, 第 4 版, 分类 cs.CL, 2020 年 7 月 22 日.

# Language Models are Few-Shot Learners (语言模型是 few-shot 学习者)

**Tom B. Brown**<sup>∗</sup> **Benjamin Mann**<sup>∗</sup> **Nick Ryder**<sup>∗</sup> **Melanie Subbiah**∗

**Jared Kaplan**† **Prafulla Dhariwal Arvind Neelakantan Pranav Shyam Girish Sastry**

**Amanda Askell Sandhini Agarwal Ariel Herbert-Voss Gretchen Krueger Tom Henighan**

**Rewon Child Aditya Ramesh Daniel M. Ziegler Jeffrey Wu Clemens Winter**

**Christopher Hesse Mark Chen Eric Sigler Mateusz Litwin Scott Gray**

**Benjamin Chess Jack Clark**

**Christopher Berner**

**Sam McCandlish Alec Radford**

**Ilya Sutskever Dario Amodei**

OpenAI

以上是全部作者, 单位 OpenAI.

## Abstract

Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples. By contrast, humans can generally perform a new language task from only a few examples or from simple instructions – something which current NLP systems still largely struggle to do. Here we show that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art finetuning approaches. Specifically, we train GPT-3, an autoregressive language model with 175 billion parameters, 10x more than any previous non-sparse language model, and test its performance in the few-shot setting. For all tasks, GPT-3 is applied without any gradient updates or fine-tuning, with tasks and few-shot demonstrations specified purely via text interaction with the model. GPT-3 achieves strong performance on many NLP datasets, including translation, question-answering, and cloze tasks, as well as several tasks that require on-the-fly reasoning or domain adaptation, such as unscrambling words, using a novel word in a sentence, or performing 3-digit arithmetic. At the same time, we also identify some datasets where GPT-3’s few-shot learning still struggles, as well as some datasets where GPT-3 faces methodological issues related to training on large web corpora. Finally, we find that GPT-3 can generate samples of news articles which human evaluators have difficulty distinguishing from articles written by humans. We discuss broader societal impacts of this finding and of GPT-3 in general.

近来的工作表明, 先在大规模文本语料上预训练, 再针对具体任务微调, 能在许多 NLP 任务和基准上取得大幅提升. 这种方法的架构通常与任务无关, 但仍需要任务专属的微调数据集, 规模动辄几千到几万条样本. 人则不同: 一般只看几个例子, 或者只听一段简单说明, 就能完成新的语言任务, 而这恰恰是现有 NLP 系统仍然很难做到的. 本文表明, 把语言模型做大, 能显著提升与任务无关的 few-shot 表现, 有时甚至能和此前最好的微调方法打个平手. 具体来说, 我们训练了 GPT-3, 一个有 1750 亿参数的自回归语言模型, 参数量是此前任何非稀疏语言模型的 10 倍, 并在 few-shot 设定下测试它的表现. 所有任务里, GPT-3 都不做任何梯度更新或微调, 任务本身和 few-shot 示范完全通过与模型的文本交互给出. GPT-3 在许多 NLP 数据集上表现强劲, 包括翻译, 问答和完形填空, 也包括一些需要即时推理或领域适应的任务, 比如还原打乱的单词, 在句子里使用一个新词, 以及做 3 位数算术. 同时, 我们也找到了一些 GPT-3 的 few-shot 学习仍然吃力的数据集, 以及一些因为在大规模网络语料上训练而带来方法学问题的数据集. 最后, 我们发现 GPT-3 能生成新闻文章样本, 人类评估者很难把它们和人写的文章区分开. 我们讨论了这一发现, 以及 GPT-3 整体上更广泛的社会影响.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>∗</sup>Equal contribution †Johns Hopkins University, OpenAI</span></small>

∗ 同等贡献. † 约翰斯·霍普金斯大学, OpenAI.

Author contributions listed at end of paper.

作者贡献列在文末.

<!-- page 2 of 75 -->

## Contents (目录)

- 1 Introduction 3
- 2 Approach (方法) 6
  - 2.1 Model and Architectures (模型与架构) 8
  - 2.2 Training Dataset (训练数据集) 8
  - 2.3 Training Process (训练过程) 9
  - 2.4 Evaluation (评测) 10
- 3 Results (结果) 10
  - 3.1 Language Modeling, Cloze, and Completion Tasks (语言建模, 完形填空与补全任务) 11
  - 3.2 Closed Book Question Answering (闭卷问答) 13
  - 3.3 Translation (翻译) 14
  - 3.4 Winograd-Style Tasks (Winograd 类任务) 16
  - 3.5 Common Sense Reasoning (常识推理) 17
  - 3.6 Reading Comprehension (阅读理解) 18
  - 3.7 SuperGLUE (SuperGLUE 基准) 18
  - 3.8 NLI (自然语言推理) 20
  - 3.9 Synthetic and Qualitative Tasks (合成任务与定性任务) 21
- 4 Measuring and Preventing Memorization Of Benchmarks (度量并防止对基准的记忆) 29
- 5 Limitations (局限) 33
- 6 Broader Impacts (更广泛的影响) 34
  - 6.1 Misuse of Language Models (语言模型的滥用) 35
  - 6.2 Fairness, Bias, and Representation (公平, 偏见与表征) 36
  - 6.3 Energy Usage (能耗) 39
- 7 Related Work (相关工作) 39
- 8 Conclusion 40
- A Details of Common Crawl Filtering (Common Crawl 过滤细节) 43
- B Details of Model Training (模型训练细节) 43
- C Details of Test Set Contamination Studies (测试集污染研究细节) 43
- D Total Compute Used to Train Language Models (训练语言模型所用的总算力) 46
- E Human Quality Assessment of Synthetic News Articles (合成新闻文章的人工质量评估) 46
- F Additional Samples from GPT-3 (GPT-3 的更多样本) 48
- G Details of Task Phrasing and Specifications (任务措辞与规格细节) 50
- H Results on All Tasks for All Model Sizes (所有模型尺寸在所有任务上的结果) 63

<!-- page 3 of 75 -->

## 1 Introduction

Recent years have featured a trend towards pre-trained language representations in NLP systems, applied in increasingly flexible and task-agnostic ways for downstream transfer. First, single-layer representations were learned using word vectors [MCCD13, PSM14] and fed to task-specific architectures, then RNNs with multiple layers of representations and contextual state were used to form stronger representations [DL15, MBXS17, PNZtY18] (though still applied to task-specific architectures), and more recently pre-trained recurrent or transformer language models [VSP+17] have been directly fine-tuned, entirely removing the need for task-specific architectures [RNSS18, DCLT18, HR18].

近几年, NLP 系统越来越多地采用预训练语言表示, 并以越来越灵活, 越来越与任务无关的方式迁移到下游. 最早是用词向量 [MCCD13, PSM14] 学出单层表示, 再喂给任务专属的架构; 后来用多层表示, 带上下文状态的 RNN 构造更强的表示 [DL15, MBXS17, PNZtY18], 但仍然接任务专属架构; 最近则是把预训练的循环网络或 transformer 语言模型 [VSP+17] 直接微调, 彻底不再需要任务专属架构 [RNSS18, DCLT18, HR18].

This last paradigm has led to substantial progress on many challenging NLP tasks such as reading comprehension, question answering, textual entailment, and many others, and has continued to advance based on new architectures and algorithms $\mathrm{[R\bar{SR}^{+}19,LOG^{+}19,YDY^{+}19,LCG^{+}19]}$ However, a major limitation to this approach is that while the architecture is task-agnostic, there is still a need for task-specific datasets and task-specific fine-tuning: to achieve strong performance on a desired task typically requires fine-tuning on a dataset of thousands to hundreds of thousands of examples specific to that task. Removing this limitation would be desirable, for several reasons.

最后这种范式在阅读理解, 问答, 文本蕴含等许多有挑战的 NLP 任务上带来了显著进展, 并随着新架构和新算法继续推进 [RSR+19, LOG+19, YDY+19, LCG+19]. 然而这条路有一个大限制: 架构虽然与任务无关, 仍然需要任务专属的数据集和任务专属的微调. 要在某个任务上取得好成绩, 通常要在该任务的几千到几十万条样本上微调. 出于几个理由, 去掉这个限制是值得的.

First, from a practical perspective, the need for a large dataset of labeled examples for every new task limits the applicability of language models. There exists a very wide range of possible useful language tasks, encompassing anything from correcting grammar, to generating examples of an abstract concept, to critiquing a short story. For many of these tasks it is difficult to collect a large supervised training dataset, especially when the process must be repeated for every new task.

第一, 从实用角度看, 每个新任务都要一大批带标注的样本, 这限制了语言模型的适用面. 可能有用的语言任务范围极广, 从改语法, 到为一个抽象概念举例, 再到点评一篇短篇小说, 无所不包. 其中很多任务很难收集大规模监督训练集, 更何况每来一个新任务就得重复一遍.

Second, the potential to exploit spurious correlations in training data fundamentally grows with the expressiveness of the model and the narrowness of the training distribution. This can create problems for the pre-training plus fine-tuning paradigm, where models are designed to be large to absorb information during pre-training, but are then fine-tuned on very narrow task distributions. For instance [HLW+20] observe that larger models do not necessarily generalize better out-of-distribution. There is evidence that suggests that the generalization achieved under this paradigm can be poor because the model is overly specific to the training distribution and does not generalize well outside it [YdC+19, MPL19]. Thus, the performance of fine-tuned models on specific benchmarks, even when it is nominally at human-level, may exaggerate actual performance on the underlying task [GSL+18, NK19].

第二, 利用训练数据中虚假相关性的可能, 会随着模型表达能力增强, 训练分布变窄而从根本上增大. 这对 「预训练加微调」 范式是个问题: 模型做得很大, 以便在预训练中吸收信息, 随后却在非常窄的任务分布上微调. 例如 [HLW+20] 观察到, 更大的模型在分布外不一定泛化得更好. 有证据表明, 这种范式下的泛化可能很差, 因为模型过度贴合训练分布, 在分布外泛化不佳 [YdC+19, MPL19]. 因此, 微调模型在具体基准上的成绩, 哪怕名义上达到人类水平, 也可能夸大了它在底层任务上的真实能力 [GSL+18, NK19].

Third, humans do not require large supervised datasets to learn most language tasks – a brief directive in natural language (e.g. “please tell me if this sentence describes something happy or something sad”) or at most a tiny number of demonstrations (e.g. “here are two examples of people acting brave; please give a third example of bravery”) is often sufficient to enable a human to perform a new task to at least a reasonable degree of competence. Aside from pointing to a conceptual limitation in our current NLP techniques, this adaptability has practical advantages – it allows humans to seamlessly mix together or switch between many tasks and skills, for example performing addition during a lengthy dialogue. To be broadly useful, we would someday like our NLP systems to have this same fluidity and generality.

第三, 人学习大多数语言任务并不需要大规模监督数据集. 一句简短的自然语言指令 (例如 「请告诉我这句话描述的是开心的事还是难过的事」), 或者至多几个示范 (例如 「这里有两个人表现勇敢的例子, 请再举第三个」), 往往就足以让人把新任务做到至少说得过去的程度. 这种适应力除了指出我们当前 NLP 技术在概念上的局限, 也有实际好处: 人可以在许多任务和技能之间无缝混合或切换, 比如在一段长对话中间做一道加法. 要真正通用, 我们希望有朝一日 NLP 系统也能有同样的流畅和通用.

![图1.1 元学习示意, 顶部紫色箭头是外循环即无监督预训练中的SGD学习, 下方三个序列分别是加法算式, 拼写纠正和英法单词对照, 每个序列内部的竖向蓝箭头标为in-context learning即内循环](images/p03-figure-1-1-language-model-meta-learning-during.png)

Figure 1.1: Language model meta-learning. During unsupervised pre-training, a language model develops a broad set of skills and pattern recognition abilities. It then uses these abilities at inference time to rapidly adapt to or recognize the desired task. We use the term “in-context learning” to describe the inner loop of this process, which occurs within the forward-pass upon each sequence. The sequences in this diagram are not intended to be representative of the data a model would see during pre-training, but are intended to show that there are sometimes repeated sub-tasks embedded within a single sequence.

图 1.1: 语言模型元学习. 在无监督预训练中, 语言模型发展出一大批技能和模式识别能力, 然后在推理阶段用这些能力快速适应或识别所需任务. 我们用 「in-context learning」 指这一过程的内循环, 它发生在每条序列的前向传播之内. 图中的序列并不代表模型在预训练中实际看到的数据, 只是用来说明单条序列内部有时会嵌着重复出现的子任务.

<!-- page 4 of 75 -->

![图1.2 符号去除任务上的in-context学习曲线, 横轴是上下文示例数K取对数, 纵轴是准确率, 蓝橙绿三组分别是175B, 13B, 1.3B, 实线带自然语言提示, 虚线无提示, 175B在K约为1时带提示约46%, K接近上限时约66%](images/p04-figure-1-2-larger-models-make-increasingly-efficient.png)

Figure 1.2: Larger models make increasingly efficient use of in-context information. We show in-context learning performance on a simple task requiring the model to remove random symbols from a word, both with and without a natural language task description (see Sec. 3.9.2). The steeper “in-context learning curves” for large models demonstrate improved ability to learn a task from contextual information. We see qualitatively similar behavior across a wide range of tasks.

图 1.2: 更大的模型对上下文信息的利用越来越高效. 图中是一个简单任务上的 in-context learning 表现: 模型要从一个单词里去掉随机符号, 分别给出和不给出自然语言任务描述 (见 3.9.2 节). 大模型的 「in-context learning 曲线」 更陡, 说明它从上下文信息里学任务的能力更强. 在很多任务上我们都看到了性质相似的行为.

> **想:** 图 1.2 的 1.3B, 13B, 175B 三组曲线, 是不是同一次训练在不同阶段存下的 checkpoint?
> 不是. 表 2.1 把 8 个尺寸列成 8 个独立模型, 各有自己的层数, 宽度, batch 和学习率, 表注写明每个都训满 300B token; 表 D.1 也按模型分别算了算力. 所以图 1.2 比的是三个不同的模型, 175B 这条线只代表 GPT-3 175B 本身, 1.3B 那条对应表 2.1 的 GPT-3 XL.

One potential route towards addressing these issues is meta-learning<sup>1</sup> – which in the context of language models means the model develops a broad set of skills and pattern recognition abilities at training time, and then uses those abilities at inference time to rapidly adapt to or recognize the desired task (illustrated in Figure 1.1). Recent work [RWC+19] attempts to do this via what we call “in-context learning”, using the text input of a pretrained language model as a form of task specification: the model is conditioned on a natural language instruction and/or a few demonstrations of the task and is then expected to complete further instances of the task simply by predicting what comes next.

解决这些问题的一条可能路线是元学习 (meta-learning, 见脚注 1). 放在语言模型里, 它指模型在训练时发展出一大批技能和模式识别能力, 然后在推理阶段用这些能力快速适应或识别所需任务 (如图 1.1 所示). 近期工作 [RWC+19] 尝试通过我们称之为 「in-context learning」 的方式做到这一点: 把预训练语言模型的文本输入当作任务说明, 让模型以一段自然语言指令和/或几个任务示范为条件, 然后只靠预测接下来的内容, 去完成该任务的更多实例.

While it has shown some initial promise, this approach still achieves results far inferior to fine-tuning – for example [RWC+19] achieves only 4% on Natural Questions, and even its 55 F1 CoQa result is now more than 35 points behind the state of the art. Meta-learning clearly requires substantial improvement in order to be viable as a practical method of solving language tasks.

这种做法显示了一些初步的希望, 但结果仍远不如微调. 例如 [RWC+19] 在 Natural Questions 上只拿到 4%, 它在 CoQA 上 55 F1 的成绩如今也落后最好水平 35 分以上. 元学习要成为解决语言任务的实用方法, 显然还需要大幅改进.

Another recent trend in language modeling may offer a way forward. In recent years the capacity of transformer language models has increased substantially, from 100 million parameters [RNSS18], to 300 million parameters [DCLT18], to 1.5 billion parameters [RWC+19], to 8 billion parameters [SPP+19], 11 billion parameters [RSR+19], and finally 17 billion parameters [Tur20]. Each increase has brought improvements in text synthesis and/or downstream NLP tasks, and there is evidence suggesting that log loss, which correlates well with many downstream tasks, follows a smooth trend of improvement with scale [KMH+20]. Since in-context learning involves absorbing many skills and tasks within the parameters of the model, it is plausible that in-context learning abilities might show similarly strong gains with scale.

语言建模的另一条近期趋势也许能提供出路. 最近几年, transformer 语言模型的容量大幅增长: 从 1 亿参数 [RNSS18], 到 3 亿 [DCLT18], 15 亿 [RWC+19], 80 亿 [SPP+19], 110 亿 [RSR+19], 最后到 170 亿 [Tur20]. 每次扩容都带来了文本生成和/或下游 NLP 任务上的提升, 也有证据表明, 与许多下游任务相关性很好的 log loss 会随规模平滑地改善 [KMH+20]. 既然 in-context learning 需要把许多技能和任务吸收进模型参数, in-context learning 的能力随规模同样大幅提升, 就是说得通的推测.

> **问:** 摘要说 GPT-3 的参数量是此前非稀疏模型的 10 倍, 这一页列出的最大前作是多少?
> 这一段列到的最大者是 170 亿参数的 Turing-NLG [Tur20]. 表 2.1 里 GPT-3 175B 的 n_params 是 175.0B, 175.0 除以 17 约为 10.3 (估算), 所以 「10 倍」 是和 17B 比出来的. 第 7 节相关工作还提到用 mixture-of-experts 做到 1000 亿参数的模型, 但那属于稀疏路线, 不在 「非稀疏」 的比较范围里.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>In the context of language models this has sometimes been called “zero-shot transfer”, but this term is potentially ambiguous: the method is “zero-shot” in the sense that no gradient updates are performed, but it often involves providing inference-time demonstrations to the model, so is not truly learning from zero examples. To avoid this confusion, we use the term “meta-learning” to capture the inner-loop / outer-loop structure of the general method, and the term “in context-learning” to refer to the inner loop of meta-learning. We further specialize the description to “zero-shot”, “one-shot”, or “few-shot” depending on how many demonstrations are provided at inference time. These terms are intended to remain agnostic on the question of whether the model learns new tasks from scratch at inference time or simply recognizes patterns seen during training – this is an important issue which we discuss later in the paper, but “meta-learning” is intended to encompass both possibilities, and simply describes the inner-outer loop structure.</span></small>

脚注 1: 在语言模型的语境里, 这有时被叫作 「zero-shot 迁移」, 但这个说法可能有歧义: 说它 「zero-shot」, 是指不做梯度更新, 可它常常要在推理阶段给模型看示范, 所以并不是真的从零个样本学起. 为避免混淆, 我们用 「meta-learning」 指这类方法内循环/外循环的结构, 用 「in context-learning」 指元学习的内循环. 按推理阶段给出的示范数量, 我们再细分为 「zero-shot」, 「one-shot」 或 「few-shot」. 这些术语对一个问题保持中立: 模型到底是在推理阶段从头学新任务, 还是只是认出了训练中见过的模式. 这是个重要问题, 本文后面会讨论, 而 「meta-learning」 这个词意在把两种可能都包括进来, 只描述内外两层循环的结构.

<!-- page 5 of 75 -->

![图1.3 42个以准确率计分的基准的聚合表现, 横轴是参数量0.1B到175B, 纵轴是准确率, 背景淡线是各基准, 三条粗线自上而下为few-shot, one-shot, zero-shot, 175B处约为57, 51, 43](images/p05-figure-1-3-aggregate-performance-for-all-42-accuracy.png)

Figure 1.3: Aggregate performance for all 42 accuracy-denominated benchmarks While zero-shot performance improves steadily with model size, few-shot performance increases more rapidly, demonstrating that larger models are more proficient at in-context learning. See Figure 3.8 for a more detailed analysis on SuperGLUE, a standard NLP benchmark suite.

图 1.3: 全部 42 个以准确率计分的基准的聚合表现. zero-shot 表现随模型尺寸稳步提升, few-shot 表现提升得更快, 说明更大的模型更擅长 in-context learning. SuperGLUE 这一标准 NLP 基准套件的更细分析见图 3.8.

> **核对:** 图 1.3 的三条粗线, 能不能当成 GPT-3 的一个总分来引用?
> 不能. 第 5 页末段写明这张图只给 「启发式」 的整体印象, 不应被当作严格或有意义的基准. 从图上读, 175B 处 few-shot 约 57, one-shot 约 51, zero-shot 约 43 (读图估算), 13B 处三者约 44, 41, 34. 真要引用具体任务, 应回到表 3.1 到表 3.11 或附录表 H.1 的格子.

In this paper, we test this hypothesis by training a 175 billion parameter autoregressive language model, which we call GPT-3, and measuring its in-context learning abilities. Specifically, we evaluate GPT-3 on over two dozen NLP datasets, as well as several novel tasks designed to test rapid adaptation to tasks unlikely to be directly contained in the training set. For each task, we evaluate GPT-3 under 3 conditions: (a) “few-shot learning”, or in-context learning where we allow as many demonstrations as will fit into the model’s context window (typically 10 to 100), (b) “one-shot learning”, where we allow only one demonstration, and (c) “zero-shot” learning, where no demonstrations are allowed and only an instruction in natural language is given to the model. GPT-3 could also in principle be evaluated in the traditional fine-tuning setting, but we leave this to future work.

本文用训练一个 1750 亿参数的自回归语言模型来检验这个假设, 我们称它为 GPT-3, 并测量它的 in-context learning 能力. 具体来说, 我们在二十多个 NLP 数据集上评测 GPT-3, 另外还设计了几个新任务, 用来测试对训练集里不太可能直接出现的任务的快速适应. 对每个任务, 我们在 3 种条件下评测 GPT-3: (a) 「few-shot learning」, 即 in-context learning, 允许放入模型上下文窗口能装下的尽量多的示范 (通常 10 到 100 个); (b) 「one-shot learning」, 只允许一个示范; (c) 「zero-shot」 learning, 不给示范, 只给模型一段自然语言指令. 原则上 GPT-3 也可以在传统的微调设定下评测, 但我们把这留给未来工作.

Figure 1.2 illustrates the conditions we study, and shows few-shot learning of a simple task requiring the model to remove extraneous symbols from a word. Model performance improves with the addition of a natural language task description, and with the number of examples in the model’s context, K. Few-shot learning also improves dramatically with model size. Though the results in this case are particularly striking, the general trends with both model size and number of examples in-context hold for most tasks we study. We emphasize that these “learning” curves involve no gradient updates or fine-tuning, just increasing numbers of demonstrations given as conditioning.

图 1.2 展示了我们研究的几种条件, 并给出一个简单任务上的 few-shot 学习: 模型要把单词里多余的符号去掉. 加上自然语言任务描述, 以及增加模型上下文里的示例数 K, 都会让表现变好. few-shot 学习也随模型尺寸大幅改善. 这个例子的结果尤其醒目, 但随模型尺寸和上下文示例数变化的总体趋势, 在我们研究的大多数任务上都成立. 需要强调, 这些 「学习」 曲线不涉及任何梯度更新或微调, 只是作为条件给出的示范数量在增加.

Broadly, on NLP tasks GPT-3 achieves promising results in the zero-shot and one-shot settings, and in the the few-shot setting is sometimes competitive with or even occasionally surpasses state-of-the-art (despite state-of-the-art being held by fine-tuned models). For example, GPT-3 achieves 81.5 F1 on CoQA in the zero-shot setting, 84.0 F1 on CoQA in the one-shot setting, 85.0 F1 in the few-shot setting. Similarly, GPT-3 achieves 64.3% accuracy on TriviaQA in the zero-shot setting, 68.0% in the one-shot setting, and 71.2% in the few-shot setting, the last of which is state-of-the-art relative to fine-tuned models operating in the same closed-book setting.

总体而言, 在 NLP 任务上, GPT-3 在 zero-shot 和 one-shot 设定下取得了有希望的结果, 在 few-shot 设定下有时能和最好水平竞争, 偶尔甚至超过 (尽管最好水平是由微调模型保持的). 例如, GPT-3 在 CoQA 上 zero-shot 拿到 81.5 F1, one-shot 84.0 F1, few-shot 85.0 F1. 类似地, GPT-3 在 TriviaQA 上 zero-shot 准确率 64.3%, one-shot 68.0%, few-shot 71.2%; 最后这个数相对同样在闭卷设定下工作的微调模型是最好水平.

GPT-3 also displays one-shot and few-shot proficiency at tasks designed to test rapid adaption or on-the-fly reasoning, which include unscrambling words, performing arithmetic, and using novel words in a sentence after seeing them defined only once. We also show that in the few-shot setting, GPT-3 can generate synthetic news articles which human evaluators have difficulty distinguishing from human-generated articles.

GPT-3 在专门测试快速适应或即时推理的任务上, 也表现出 one-shot 和 few-shot 的能力, 包括还原打乱的单词, 做算术, 以及在只看过一次定义后在句子里使用新词. 我们还表明, 在 few-shot 设定下, GPT-3 能生成合成新闻文章, 人类评估者很难把它们和人写的文章区分开.

At the same time, we also find some tasks on which few-shot performance struggles, even at the scale of GPT-3. This includes natural language inference tasks like the ANLI dataset, and some reading comprehension datasets like RACE or QuAC. By presenting a broad characterization of GPT-3’s strengths and weaknesses, including these limitations, we hope to stimulate study of few-shot learning in language models and draw attention to where progress is most needed.

同时我们也发现, 即便到了 GPT-3 的规模, 仍有一些任务上 few-shot 表现吃力. 这包括 ANLI 这类自然语言推理任务, 以及 RACE, QuAC 等部分阅读理解数据集. 我们给出 GPT-3 长处和短处的全面刻画, 连同这些局限, 希望推动对语言模型 few-shot 学习的研究, 并让大家注意最需要进展的地方.

A heuristic sense of the overall results can be seen in Figure 1.3, which aggregates the various tasks (though it should not be seen as a rigorous or meaningful benchmark in itself).

图 1.3 汇总了各项任务, 可以从中得到对整体结果的直观印象 (但它本身不应被看作严格或有意义的基准).

<!-- page 6 of 75 -->

We also undertake a systematic study of “data contamination” – a growing problem when training high capacity models on datasets such as Common Crawl, which can potentially include content from test datasets simply because such content often exists on the web. In this paper we develop systematic tools to measure data contamination and quantify its distorting effects. Although we find that data contamination has a minimal effect on GPT-3’s performance on most datasets, we do identify a few datasets where it could be inflating results, and we either do not report results on these datasets or we note them with an asterisk, depending on the severity.

我们还系统研究了 「数据污染」. 在 Common Crawl 这类数据集上训练高容量模型时, 这个问题越来越突出: 测试集内容往往本来就挂在网上, 于是可能被收进训练数据. 本文开发了系统的工具来测量数据污染, 并量化它造成的偏差. 我们发现数据污染对 GPT-3 在大多数数据集上的表现影响很小, 但也确实找到了几个可能被抬高成绩的数据集; 视严重程度, 我们要么不报告这些数据集的结果, 要么加星号标注.

In addition to all the above, we also train a series of smaller models (ranging from 125 million parameters to 13 billion parameters) in order to compare their performance to GPT-3 in the zero, one and few-shot settings. Broadly, for most tasks we find relatively smooth scaling with model capacity in all three settings; one notable pattern is that the gap between zero-, one-, and few-shot performance often grows with model capacity, perhaps suggesting that larger models are more proficient meta-learners.

除上述之外, 我们还训练了一系列更小的模型 (从 1.25 亿参数到 130 亿参数), 以便在 zero-shot, one-shot 和 few-shot 设定下与 GPT-3 比较. 总体上, 对多数任务, 三种设定下的表现都随模型容量相对平滑地变化. 一个值得注意的规律是, zero-shot, one-shot 与 few-shot 之间的差距常常随模型容量变大而拉大, 这或许说明更大的模型是更好的元学习者.

> **拆开:** 这里说的 「一系列更小的模型」, 是从 GPT-3 175B 蒸馏或裁剪出来的吗?
> 不是. 表 2.1 给每个小档单独列了层数, d_model, 头数, batch 和学习率, 比如 GPT-3 13B 是 40 层, 学习率 1.0e-4, 而 175B 是 96 层, 0.6e-4; 表 D.1 也分别按 300B token 算训练算力. 它们是从头各训一遍的独立模型. 本文所有写 「GPT-3」 而不带尺寸的结论, 默认指 175B 这一档, 小档的数要去表 H.1 的对应列找.

Finally, given the broad spectrum of capabilities displayed by GPT-3, we discuss concerns about bias, fairness, and broader societal impacts, and attempt a preliminary analysis of GPT-3’s characteristics in this regard.

最后, 鉴于 GPT-3 展现出的广泛能力, 我们讨论了偏见, 公平以及更广泛的社会影响方面的担忧, 并对 GPT-3 在这些方面的特征做了初步分析.

The remainder of this paper is organized as follows. In Section 2, we describe our approach and methods for training GPT-3 and evaluating it. Section 3 presents results on the full range of tasks in the zero-, one- and few-shot settings. Section 4 addresses questions of data contamination (train-test overlap). Section 5 discusses limitations of GPT-3. Section 6 discusses broader impacts. Section 7 reviews related work and Section 8 concludes.

本文其余部分安排如下. 第 2 节介绍训练和评测 GPT-3 的方法. 第 3 节给出 zero-shot, one-shot 和 few-shot 设定下全部任务的结果. 第 4 节讨论数据污染 (训练集与测试集重叠) 问题. 第 5 节讨论 GPT-3 的局限. 第 6 节讨论更广泛的影响. 第 7 节回顾相关工作, 第 8 节总结.

## 2 Approach (方法)

Our basic pre-training approach, including model, data, and training, is similar to the process described in [RWC+19], with relatively straightforward scaling up of the model size, dataset size and diversity, and length of training. Our use of in-context learning is also similar to [RWC+19], but in this work we systematically explore different settings for learning within the context. Therefore, we start this section by explicitly defining and contrasting the different settings that we will be evaluating GPT-3 on or could in principle evaluate GPT-3 on. These settings can be seen as lying on a spectrum of how much task-specific data they tend to rely on. Specifically, we can identify at least four points on this spectrum (see Figure 2.1 for an illustration):

我们的基本预训练方法, 包括模型, 数据和训练, 与 [RWC+19] 描述的过程相似, 主要是相对直接地放大模型尺寸, 数据集规模和多样性, 以及训练时长. 我们对 in-context learning 的用法也与 [RWC+19] 相似, 但本文系统地考察了在上下文中学习的不同设定. 因此本节先明确定义并对比我们评测 GPT-3 所用, 或原则上可以用来评测 GPT-3 的几种设定. 这些设定可以看作排在一条谱上, 按它们倾向于依赖多少任务专属数据排序. 具体来说, 这条谱上至少可以分出四个点 (示意见图 2.1):

• **Fine-Tuning (FT)** has been the most common approach in recent years, and involves updating the weights of a pre-trained model by training on a supervised dataset specific to the desired task. Typically thousands to hundreds of thousands of labeled examples are used. The main advantage of fine-tuning is strong performance on many benchmarks. The main disadvantages are the need for a new large dataset for every task, the potential for poor generalization out-of-distribution [MPL19], and the potential to exploit spurious features of the training data [GSL+18, NK19], potentially resulting in an unfair comparison with human performance. In this work we do not fine-tune GPT-3 because our focus is on task-agnostic performance, but GPT-3 can be fine-tuned in principle and this is a promising direction for future work.

• **微调 (FT)** 是近年最常见的做法, 在针对目标任务的监督数据集上训练, 更新预训练模型的权重. 通常要用几千到几十万条带标注样本. 微调的主要优点是在许多基准上表现强. 主要缺点是每个任务都要一个新的大数据集, 分布外泛化可能很差 [MPL19], 还可能利用训练数据里的虚假特征 [GSL+18, NK19], 从而导致与人类表现的比较不公平. 本文不对 GPT-3 做微调, 因为我们关注的是与任务无关的表现; 但 GPT-3 原则上可以微调, 这也是未来工作的一个有前景的方向.

**Few-Shot (FS)** is the term we will use in this work to refer to the setting where the model is given a few demonstrations of the task at inference time as conditioning [RWC+19], but no weight updates are allowed. As shown in Figure 2.1, for a typical dataset an example has a context and a desired completion (for example an English sentence and the French translation), and few-shot works by giving K examples of context and completion, and then one final example of context, with the model expected to provide the completion. We typically set K in the range of 10 to 100 as this is how many examples can fit in the model’s context window $( n _ { \mathrm { c t x } } = 2 0 4 8 )$ . The main advantages of few-shot are a major reduction in the need for task-specific data and reduced potential to learn an overly narrow distribution from a large but narrow fine-tuning dataset. The main disadvantage is that results from this method have so far been much worse than state-of-the-art fine-tuned models. Also, a small amount of task specific data is still required. As indicated by the name, few-shot learning as described here for language models is related to few-shot learning as used in other contexts in ML [HYC01, VBL+16] – both involve learning based on a broad distribution of tasks (in this case implicit in the pre-training data) and then rapidly adapting to a new task.

**Few-Shot (FS)** 是本文对这样一种设定的称呼: 在推理阶段给模型几个任务示范作为条件 [RWC+19], 但不允许更新权重. 如图 2.1 所示, 对一个典型数据集, 一条样本包含一段上下文和期望的补全 (例如一句英文和它的法文翻译). few-shot 的做法是先给 K 个 「上下文加补全」 的例子, 再给最后一条只有上下文的例子, 期望模型给出补全. 我们通常把 K 设在 10 到 100 之间, 因为模型的上下文窗口 ($n_{\mathrm{ctx}} = 2048$) 大致能装下这么多例子. few-shot 的主要优点是大大减少对任务专属数据的需求, 也降低了从一个大而窄的微调数据集里学到过窄分布的可能. 主要缺点是, 这种方法的结果迄今远不如最好的微调模型. 此外仍需要少量任务专属数据. 顾名思义, 这里针对语言模型描述的 few-shot 学习, 与机器学习其他场合的 few-shot 学习 [HYC01, VBL+16] 有关: 两者都是先在一个宽泛的任务分布上学习 (这里的任务分布隐含在预训练数据中), 再快速适应新任务.

> **确认:** K 取 10 到 100 是固定区间吗, 还是每个任务自己定?
> 每个任务自己定, 而且受 2048 的窗口约束. 附录表 H.1 的 K 列从 QuAC, CoQA 的 5, 到 LAMBADA 的 15, SuperGLUE 各项的 32, 翻译和 TriviaQA 的 64, 再到 OpenBookQA 的 100; 图 3.11 的字母操作任务也写明 K = 100. 3.7 节还说 SuperGLUE 的 K 到 32 以后示例就放不稳窗口了. 所以 「10 到 100」 只是常见范围, 长样本任务 K 会更小.

**One-Shot (1S)** is the same as few-shot except that only one demonstration is allowed, in addition to a natural language description of the task, as shown in Figure 1. The reason to distinguish one-shot from few-shot and zero-shot (below) is that it most closely matches the way in which some tasks are communicated to humans. For example, when asking humans to generate a dataset on a human worker service (for example Mechanical Turk), it is common to give one demonstration of the task. By contrast it is sometimes difficult to communicate the content or format of a task if no examples are given.

**One-Shot (1S)** 与 few-shot 相同, 只是除了自然语言任务描述外只允许一个示范, 如图 1 所示. 之所以把 one-shot 从 few-shot 和 zero-shot (见下) 中单独分出来, 是因为它最接近某些任务向人传达的方式. 例如, 在众包平台 (比如 Mechanical Turk) 上请人生成数据集时, 通常会给一个任务示范. 反过来, 如果一个例子都不给, 有时很难讲清任务的内容或格式.

<!-- page 7 of 75 -->

![图2.1 左栏是本文考察的zero-shot, one-shot, few-shot三种设定, 以英译法为例, 依次给出任务描述, 零个, 一个, 三个示例和待补全的cheese提示, 都不做梯度更新, 右栏是GPT-3未采用的传统微调, 每个示例后都跟一次梯度更新](images/p07-figure-2-1-zero-shot-one-shot-and-few-shot-contrasted.png)

Figure 2.1: Zero-shot, one-shot and few-shot, contrasted with traditional fine-tuning. The panels above show four methods for performing a task with a language model – fine-tuning is the traditional method, whereas zero-, one-, and few-shot, which we study in this work, require the model to perform the task with only forward passes at test time. We typically present the model with a few dozen examples in the few shot setting. Exact phrasings for all task descriptions, examples and prompts can be found in Appendix G.

图 2.1: zero-shot, one-shot 和 few-shot, 与传统微调的对比. 上面几栏给出了用语言模型完成任务的四种方法: 微调是传统方法, 而本文研究的 zero-shot, one-shot 和 few-shot 要求模型在推理阶段只靠前向传播完成任务. 在 few-shot 设定下, 我们通常给模型几十个例子. 所有任务描述, 示例和提示的确切措辞见附录 G.

• **Zero-Shot (0S)** is the same as one-shot except that no demonstrations are allowed, and the model is only given a natural language instruction describing the task. This method provides maximum convenience, potential for robustness, and avoidance of spurious correlations (unless they occur very broadly across the large corpus of pre-training data), but is also the most challenging setting. In some cases it may even be difficult for humans to understand the format of the task without prior examples, so this setting is in some cases “unfairly hard”. For example, if someone is asked to “make a table of world records for the 200m dash”, this request can be ambiguous, as it may not be clear exactly what format the table should have or what should be included (and even with careful clarification, understanding precisely what is desired can be difficult). Nevertheless, for at least some settings zero-shot is closest to how humans perform tasks – for example, in the translation example in Figure 2.1, a human would likely know what to do from just the text instruction.

• **Zero-Shot (0S)** 与 one-shot 相同, 只是不允许任何示范, 只给模型一段描述任务的自然语言指令. 这种方法最方便, 可能最稳健, 也最能避开虚假相关 (除非这些相关性在海量预训练数据里普遍存在), 但也是最难的设定. 有些情况下, 没有先例连人都难以理解任务格式, 所以这个设定有时 「难得不公平」. 例如, 让人 「做一张 200 米跑世界纪录的表格」, 这个请求可能有歧义: 表格该是什么格式, 应该包含什么, 并不清楚 (即便仔细澄清, 要准确理解对方想要什么也可能很难). 尽管如此, 至少在某些设定下, zero-shot 最接近人完成任务的方式. 比如在图 2.1 的翻译例子里, 人很可能只看文字指令就知道该做什么.

Figure 2.1 shows the four methods using the example of translating English to French. In this paper we focus on zero-shot, one-shot and few-shot, with the aim of comparing them not as competing alternatives, but as different problem settings which offer a varying trade-off between performance on specific benchmarks and sample efficiency. We especially highlight the few-shot results as many of them are only slightly behind state-of-the-art fine-tuned models. Ultimately, however, one-shot, or even sometimes zero-shot, seem like the fairest comparisons to human performance, and are important targets for future work.

图 2.1 用英译法的例子展示了这四种方法. 本文聚焦 zero-shot, one-shot 和 few-shot, 目的不是把它们当作互相竞争的方案来比, 而是把它们看作不同的问题设定, 在特定基准上的表现和样本效率之间给出不同的取舍. 我们特别强调 few-shot 的结果, 因为其中很多只比最好的微调模型略差. 不过归根结底, one-shot, 有时甚至 zero-shot, 才像是与人类表现最公平的比较, 也是未来工作的重要目标.

Sections 2.1-2.3 below give details on our models, training data, and training process respectively. Section 2.4 discusses the details of how we do few-shot, one-shot, and zero-shot evaluations.

下面 2.1 到 2.3 节分别介绍我们的模型, 训练数据和训练过程. 2.4 节讨论 few-shot, one-shot 和 zero-shot 评测的细节.

<!-- page 8 of 75 -->

| Model Name | n<sub>params</sub> | nlayers | d<sub>model</sub> | nheads | d<sub>head</sub> | Batch Size | Learning Rate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-3 Small | 125M | 12 | 768 | 12 | 64 | 0.5M | 6.0 × 10<sup>-4</sup> |
| GPT-3 Medium | 350M | 24 | 1024 | 16 | 64 | 0.5M | 3.0 × 10<sup>-4</sup> |
| GPT-3 Large | 760M | 24 | 1536 | 16 | 96 | 0.5M | 2.5 × 10<sup>-4</sup> |
| GPT-3 XL | 1.3B | 24 | 2048 | 24 | 128 | 1M | 2.0 × 10<sup>-4</sup> |
| GPT-3 2.7B | 2.7B | 32 | 2560 | 32 | 80 | 1M | 1.6 × 10<sup>-4</sup> |
| GPT-3 6.7B | 6.7B | 32 | 4096 | 32 | 128 | 2M | 1.2 × 10<sup>-4</sup> |
| GPT-3 13B | 13.0B | 40 | 5140 | 40 | 128 | 2M | 1.0 × 10<sup>-4</sup> |
| GPT-3 175B or "GPT-3" | 175.0B | 96 | 12288 | 96 | 128 | 3.2M | 0.6 × 10<sup>-4</sup> |

Table 2.1: Sizes, architectures, and learning hyper-parameters (batch size in tokens and learning rate) of the models which we trained. All models were trained for a total of 300 billion tokens.

表 2.1: 我们训练的各模型的尺寸, 架构和学习超参数 (batch size 以 token 计, 以及学习率). 所有模型都一共训练了 3000 亿个 token.

> **看表:** 表 2.1 的 n_heads 乘 d_head 应该等于 d_model, 每一行都成立吗?
> 有两行对不上. GPT-3 XL 写 24 个头乘 128 等于 3072, 而 d_model 写 2048; GPT-3 13B 写 40 乘 128 等于 5120, d_model 却印成 5140, 5140 除以 40 不是整数. 其余六行都成立, 例如 GPT-3 2.7B 是 32 乘 80 等于 2560, 175B 是 96 乘 128 等于 12288. 本文没有别处再给这两档的头配置, 表 D.1 只给参数量 1,320M 和 12,850M, 判定不了是哪一格印错.

## 2.1 Model and Architectures (模型与架构)

We use the same model and architecture as $\mathrm{GPT-2~[RWC^{+}19]}$ , including the modified initialization, pre-normalization, and reversible tokenization described therein, with the exception that we use alternating dense and locally banded sparse attention patterns in the layers of the transformer, similar to the Sparse Transformer [CGRS19]. To study the dependence of ML performance on model size, we train 8 different sizes of model, ranging over three orders of magnitude from 125 million parameters to 175 billion parameters, with the last being the model we call GPT-3. Previous work $\mathrm { [ K M H ^ { + } 2 0 ] }$ suggests that with enough training data, scaling of validation loss should be approximately a smooth power law as a function of size; training models of many different sizes allows us to test this hypothesis both for validation loss and for downstream language tasks.

我们使用与 GPT-2 [RWC+19] 相同的模型和架构, 包括其中描述的改进初始化, pre-normalization 和可逆分词, 唯一的例外是: 在 transformer 的各层中, 我们交替使用稠密注意力和局部带状稀疏注意力模式, 类似 Sparse Transformer [CGRS19]. 为研究机器学习表现对模型尺寸的依赖, 我们训练了 8 种不同尺寸的模型, 跨越三个数量级, 从 1.25 亿参数到 1750 亿参数, 最后这个就是我们称作 GPT-3 的模型. 此前的工作 [KMH+20] 表明, 在训练数据足够的情况下, 验证损失随尺寸的变化应当近似一条平滑的幂律; 训练许多不同尺寸的模型, 让我们能同时在验证损失和下游语言任务上检验这个假设.

Table 2.1 shows the sizes and architectures of our 8 models. Here $n _ { \mathrm { p a r a m s } }$ is the total number of trainable parameters, $n _ { \mathrm { l a y e r s } }$ is the total number of layers, $d _ { \mathrm { m o d e l } }$ is the number of units in each bottleneck layer (we always have the feedforward layer four times the size of the bottleneck layer, $d _ { \mathrm { f f } } = 4 * d _ { \mathrm { m o d e l } } )$ , and $d _ { \mathrm { h e a d } }$ is the dimension of each attention head. All models use a context window of $n _ { \mathrm { c t x } } = 2 0 4 8$ tokens. We partition the model across GPUs along both the depth and width dimension in order to minimize data-transfer between nodes. The precise architectural parameters for each model are chosen based on computational efficiency and load-balancing in the layout of models across GPU’s. Previous work $\mathrm { [ K M H ^ { + } 2 0 ] }$ suggests that validation loss is not strongly sensitive to these parameters within a reasonably broad range.

表 2.1 给出了 8 个模型的尺寸和架构. 其中 $n_{\mathrm{params}}$ 是可训练参数总数, $n_{\mathrm{layers}}$ 是层数, $d_{\mathrm{model}}$ 是每个瓶颈层的单元数 (前馈层始终是瓶颈层的四倍, $d_{\mathrm{ff}} = 4 * d_{\mathrm{model}}$), $d_{\mathrm{head}}$ 是每个注意力头的维度. 所有模型的上下文窗口都是 $n_{\mathrm{ctx}} = 2048$ 个 token. 我们沿深度和宽度两个维度把模型切分到多块 GPU 上, 以尽量减少节点间的数据传输. 每个模型的具体架构参数, 是按计算效率和在 GPU 上排布模型时的负载均衡来选的. 此前的工作 [KMH+20] 表明, 在相当宽的范围内, 验证损失对这些参数并不敏感.

> **回看:** 用 d_ff = 4 d_model 这条, 能不能从表 2.1 自己核回 175B?
> 大致能. 每层注意力约 4d², 前馈约 8d², 合计约 12·n_layers·d_model². 代入 175B 这一行: 12 乘 96 乘 12288² 约 173.9B (估算), 与表 2.1 的 175.0B 和表 D.1 的 174,600M 只差不到 1B, 差额主要是嵌入等其余参数, 本文没给词表大小, 算不出这部分的确切值. 同法算 GPT-3 13B: 按 d_model = 5140 得约 12.68B, 按 5120 得约 12.58B (估算), 两者都在表 D.1 的 12,850M 附近, 同样判不出上一条那格的真值.

## 2.2 Training Dataset (训练数据集)

Datasets for language models have rapidly expanded, culminating in the Common Crawl dataset<sup>2</sup>[RSR+19] constituting nearly a trillion words. This size of dataset is sufficient to train our largest models without ever updating on the same sequence twice. However, we have found that unfiltered or lightly filtered versions of Common Crawl tend to have lower quality than more curated datasets. Therefore, we took 3 steps to improve the average quality of our datasets: (1) we downloaded and filtered a version of CommonCrawl based on similarity to a range of high-quality reference corpora, (2) we performed fuzzy deduplication at the document level, within and across datasets, to prevent redundancy and preserve the integrity of our held-out validation set as an accurate measure of overfitting, and (3) we also added known high-quality reference corpora to the training mix to augment CommonCrawl and increase its diversity.

语言模型的数据集扩张得很快, 最终到了近万亿词规模的 Common Crawl 数据集 (脚注 2) [RSR+19]. 这么大的数据集足以训练我们最大的模型, 而不必在同一条序列上更新两次. 但我们发现, 未经过滤或只轻度过滤的 Common Crawl, 质量往往不如精心整理的数据集. 因此我们采取了 3 步来提高数据集的平均质量: (1) 下载一份 CommonCrawl, 并按与一系列高质量参考语料的相似度过滤; (2) 在文档级别, 在各数据集内部及跨数据集做模糊去重, 以避免冗余, 并保证留出的验证集能准确衡量过拟合; (3) 把已知的高质量参考语料也加入训练混合, 以补充 CommonCrawl, 增加多样性.

Details of the first two points (processing of Common Crawl) are described in Appendix A. For the third, we added several curated high-quality datasets, including an expanded version of the WebText dataset [RWC+19], collected by scraping links over a longer period of time, and first described in [KMH+20], two internet-based books corpora (Books1 and Books2) and English-language Wikipedia.

前两点 (对 Common Crawl 的处理) 的细节见附录 A. 第三点, 我们加入了几份精心整理的高质量数据集, 包括扩充版的 WebText 数据集 [RWC+19] (抓取链接的时间跨度更长, 最早在 [KMH+20] 中描述), 两个基于互联网的书籍语料 (Books1 和 Books2), 以及英文维基百科.

Table 2.2 shows the final mixture of datasets that we used in training. The CommonCrawl data was downloaded from 41 shards of monthly CommonCrawl covering 2016 to 2019, constituting 45TB of compressed plaintext before filtering and 570GB after filtering, roughly equivalent to 400 billion byte-pair-encoded tokens. Note that during training, datasets are not sampled in proportion to their size, but rather datasets we view as higher-quality are sampled more frequently, such that CommonCrawl and Books2 datasets are sampled less than once during training, but the other datasets are sampled 2-3 times. This essentially accepts a small amount of overfitting in exchange for higher quality training data.

表 2.2 给出了训练最终所用的数据混合. CommonCrawl 数据取自覆盖 2016 到 2019 年的 41 个月度分片, 过滤前是 45TB 压缩纯文本, 过滤后是 570GB, 大约相当于 4000 亿个字节对编码 token. 注意, 训练中各数据集并不按规模比例采样, 我们认为质量更高的数据集会被更频繁地采样: CommonCrawl 和 Books2 在训练中被采样不到一遍, 其余数据集则被采样 2 到 3 遍. 这本质上是用少量过拟合换取更高质量的训练数据.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://commoncrawl.org/the-data/](https://commoncrawl.org/the-data/)</span></small>

脚注 2: https://commoncrawl.org/the-data/

<!-- page 9 of 75 -->

Total Compute Used During Training

训练中使用的总算力 (图题).

![图2.2 各模型训练所用总算力柱状图, 纵轴是训练petaflop每秒天数取对数, 绿色为BERT和RoBERTa, 紫色为T5五档, 蓝色为GPT-3八档, GPT-3 175B最高约3600, GPT-3 2.7B与RoBERTa-Large都在50上下](images/p09-figure-2-2-total-compute-used-during-training-based-on.png)

Figure 2.2: Total compute used during training. Based on the analysis in Scaling Laws For Neural Language Models [KMH+20] we train much larger models on many fewer tokens than is typical. As a consequence, although GPT-3 3B is almost 10x larger than RoBERTa-Large (355M params), both models took roughly 50 petaflop/s-days of compute during pre-training. Methodology for these calculations can be found in Appendix D.

图 2.2: 训练中使用的总算力. 基于 Scaling Laws For Neural Language Models [KMH+20] 的分析, 我们用比常规少得多的 token 训练大得多的模型. 结果是, 虽然 GPT-3 3B 比 RoBERTa-Large (3.55 亿参数) 大了近 10 倍, 两者预训练都花了大约 50 petaflop/s-days 的算力. 这些计算的方法见附录 D.

> **停一下:** 图注里的 「GPT-3 3B」 是哪一档?
> 表 2.1 没有 3B 这一档, 最接近的是 GPT-3 2.7B. 按表 D.1, GPT-3 2.7B 训练算力 55.2 PF-days, RoBERTa-Large 49.3 PF-days, 都在 「约 50」 附近; 参数量 2,650M 对 355M 约 7.5 倍 (估算), 说 「近 10 倍」 偏宽. 两者算力接近, 是因为 RoBERTa-Large 训了 2,000B token, GPT-3 2.7B 只训 300B.

| Dataset | Quantity (tokens) | Weight in training mix | Epochs elapsed when training for 300B tokens |
| --- | --- | --- | --- |
| Common Crawl (filtered) | 410 billion | 60% | 0.44 |
| WebText2 | 19 billion | 22% | 2.9 |
| Books1 | 12 billion | 8% | 1.9 |
| Books2 | 55 billion | 8% | 0.43 |
| Wikipedia | 3 billion | 3% | 3.4 |

Table 2.2: Datasets used to train GPT-3. “Weight in training mix” refers to the fraction of examples during training that are drawn from a given dataset, which we intentionally do not make proportional to the size of the dataset. As a result, when we train for 300 billion tokens, some datasets are seen up to 3.4 times during training while other datasets are seen less than once.

表 2.2: 训练 GPT-3 所用的数据集. 「训练混合中的权重」 指训练中从某个数据集抽取样本的比例, 我们有意不让它与数据集规模成比例. 结果是, 训练 3000 亿 token 时, 有些数据集最多被看了 3.4 遍, 另一些则不到一遍.

> **再看:** 表 2.2 的权重和 epoch 两列, 能互相推出来吗?
> 大体能, 但有两处不齐. 权重 60%, 22%, 8%, 8%, 3% 加起来是 101%, 是四舍五入造成的. 按 「300B 乘权重除以数据量」 估算: Common Crawl 是 300 乘 0.6 除以 410 约 0.44, Books2 约 0.44, 都与表一致; WebText2 却是 300 乘 0.22 除以 19 约 3.5, 表里写 2.9; Wikipedia 算出 3.0, 表里写 3.4 (均为估算). 另外第 8 页正文说过滤后的 Common Crawl 约 4000 亿 token, 表 2.2 写 410 billion, 两者口径也略有出入.

A major methodological concern with language models pretrained on a broad swath of internet data, particularly large models with the capacity to memorize vast amounts of content, is potential contamination of downstream tasks by having their test or development sets inadvertently seen during pre-training. To reduce such contamination, we searched for and attempted to remove any overlaps with the development and test sets of all benchmarks studied in this paper. Unfortunately, a bug in the filtering caused us to ignore some overlaps, and due to the cost of training it was not feasible to retrain the model. In Section 4 we characterize the impact of the remaining overlaps, and in future work we will more aggressively remove data contamination.

在大范围互联网数据上预训练的语言模型, 尤其是有能力记住海量内容的大模型, 有一个重大的方法学隐患: 下游任务的测试集或开发集可能在预训练中被无意看到, 造成污染. 为减少这种污染, 我们搜索并尝试移除训练数据与本文研究的所有基准的开发集, 测试集之间的重叠. 可惜过滤中的一个 bug 让我们漏掉了部分重叠, 而训练成本太高, 重训模型不现实. 第 4 节刻画了残留重叠的影响, 未来工作中我们会更积极地去除数据污染.

## 2.3 Training Process (训练过程)

As found in [KMH+20, MKAT18], larger models can typically use a larger batch size, but require a smaller learning rate. We measure the gradient noise scale during training and use it to guide our choice of batch size [MKAT18]. Table 2.1 shows the parameter settings we used. To train the larger models without running out of memory, we use a mixture of model parallelism within each matrix multiply and model parallelism across the layers of the network. All models were trained on V100 GPU’s on part of a high-bandwidth cluster provided by Microsoft. Details of the training process and hyperparameter settings are described in Appendix B.

正如 [KMH+20, MKAT18] 所发现的, 更大的模型通常能用更大的 batch size, 但需要更小的学习率. 我们在训练中测量梯度噪声尺度, 并用它指导 batch size 的选择 [MKAT18]. 表 2.1 列出了我们使用的参数设置. 为了在不爆显存的前提下训练较大的模型, 我们混合使用每个矩阵乘法内部的模型并行和跨网络层的模型并行. 所有模型都在 Microsoft 提供的高带宽集群的一部分上, 用 V100 GPU 训练. 训练过程和超参数设置的细节见附录 B.

<!-- page 10 of 75 -->

## 2.4 Evaluation (评测)

For few-shot learning, we evaluate each example in the evaluation set by randomly drawing K examples from that task’s training set as conditioning, delimited by 1 or 2 newlines depending on the task. For LAMBADA and Storycloze there is no supervised training set available so we draw conditioning examples from the development set and evaluate on the test set. For Winograd (the original, not SuperGLUE version) there is only one dataset, so we draw conditioning examples directly from it.

few-shot 学习的评测方式是: 对评测集里的每条样本, 从该任务的训练集随机抽 K 条样本作为条件, 视任务不同用 1 个或 2 个换行符分隔. LAMBADA 和 Storycloze 没有监督训练集, 我们从开发集抽条件样本, 在测试集上评测. Winograd (原版, 而非 SuperGLUE 版) 只有一个数据集, 我们就直接从中抽条件样本.

K can be any value from 0 to the maximum amount allowed by the model’s context window, which is $n _ { \mathrm { c t x } } = 2 0 4 8$ for all models and typically fits 10 to 100 examples. Larger values of K are usually but not always better, so when a separate development and test set are available, we experiment with a few values of K on the development set and then run the best value on the test set. For some tasks (see Appendix G) we also use a natural language prompt in addition to (or for $K = 0 ,$ instead of) demonstrations.

K 可以是 0 到模型上下文窗口所能容纳的最大值之间的任意值; 所有模型的窗口都是 $n_{\mathrm{ctx}} = 2048$, 通常能装 10 到 100 个样本. K 越大通常越好, 但并不总是如此, 所以在有独立开发集和测试集时, 我们先在开发集上试几个 K, 再用最好的 K 跑测试集. 对部分任务 (见附录 G), 我们除了示范 (或在 $K = 0$ 时代替示范) 之外还用一段自然语言提示.

On tasks that involve choosing one correct completion from several options (multiple choice), we provide K examples of context plus correct completion, followed by one example of context only, and compare the LM likelihood of each completion. For most tasks we compare the per-token likelihood (to normalize for length), however on a small number of datasets (ARC, OpenBookQA, and RACE) we gain additional benefit as measured on the development set by normalizing by the unconditional probability of each completion, by computing $\frac { P ( \operatorname { c o m p l e t i o n } \lvert \operatorname { c o n t e x t } ) } { P ( \operatorname { c o m p l e t i o n } \lvert \operatorname { a n s w e r \_ c o n t e x t } ) }$ , where answer context is the string "Answer: " or "A: " and is used to prompt that the completion should be an answer but is otherwise generic.

对于从若干选项中挑一个正确补全的任务 (多项选择), 我们给出 K 条 「上下文加正确补全」 的例子, 再给一条只有上下文的例子, 然后比较语言模型对每个补全的似然. 多数任务比较的是逐 token 的平均似然 (以抵消长度差异); 但在少数数据集 (ARC, OpenBookQA 和 RACE) 上, 按开发集衡量, 用每个补全的无条件概率做归一化能额外获益, 即计算 $\frac{P(\mathrm{completion} \mid \mathrm{context})}{P(\mathrm{completion} \mid \mathrm{answer\_context})}$, 其中 answer context 是字符串 「Answer: 」 或 「A: 」, 用来提示补全应当是一个答案, 除此之外不带任何具体信息.

On tasks that involve binary classification, we give the options more semantically meaningful names (e.g. “True” or “False” rather than 0 or 1) and then treat the task like multiple choice; we also sometimes frame the task similar to what is done by $[ \mathrm { R S R ^ { + } 1 9 } ]$ (see Appendix G) for details.

对于二分类任务, 我们给选项起语义上更有意义的名字 (例如用 「True」 或 「False」 而不是 0 或 1), 然后按多项选择来处理; 有时我们也仿照 [RSR+19] 的方式来组织任务 (详见附录 G).

On tasks with free-form completion, we use beam search with the same parameters as [RSR+19]: a beam width of 4 and a length penalty of $\alpha = 0 . 6$ . We score the model using F1 similarity score, BLEU, or exact match, depending on what is standard for the dataset at hand.

对于自由补全的任务, 我们用与 [RSR+19] 相同参数的 beam search: beam 宽度 4, 长度惩罚 $\alpha = 0.6$. 视数据集惯例, 用 F1 相似度, BLEU 或精确匹配来给模型打分.

Final results are reported on the test set when publicly available, for each model size and learning setting (zero-, one-, and few-shot). When the test set is private, our model is often too large to fit on the test server, so we report results on the development set. We do submit to the test server on a small number of datasets (SuperGLUE, TriviaQA, PiQa) where we were able to make submission work, and we submit only the 200B few-shot results, and report development set results for everything else.

对每种模型尺寸和学习设定 (zero-shot, one-shot, few-shot), 测试集公开时我们报告测试集上的最终结果. 测试集不公开时, 我们的模型常常大到放不进测试服务器, 所以报告开发集结果. 在少数几个我们能把提交跑通的数据集 (SuperGLUE, TriviaQA, PiQa) 上, 我们确实提交到了测试服务器, 且只提交 200B 的 few-shot 结果; 其余一律报告开发集结果.

> **对一下:** 这里写 「只提交 200B 的 few-shot 结果」, 200B 指哪个模型?
> 表 2.1 里最大的一档是 175.0B, 没有 200B, 表 D.1 也只有 174,600M 这一行. 附录 E 的 「Procedure and design」 段同样把 GPT-3 写成 200B. 按上下文应读作 GPT-3 175B: 表 3.3 注明 TriviaQA few-shot 在测试服务器上评, 表 3.6 注明 PIQA few-shot 在测试服务器上评, 表 3.8 的 SuperGLUE 也是测试集结果, 三处都只给 175B 的数.

## 3 Results (结果)

In Figure 3.1 we display training curves for the 8 models described in Section 2. For this graph we also include 6 additional extra-small models with as few as 100,000 parameters. As observed in $\mathrm { [ K M H ^ { + } \bar { 2 } 0 ] }$ , language modeling performance follows a power-law when making efficient use of training compute. After extending this trend by two more orders of magnitude, we observe only a slight (if any) departure from the power-law. One might worry that these improvements in cross-entropy loss come only from modeling spurious details of our training corpus. However, we will see in the following sections that improvements in cross-entropy loss lead to consistent performance gains across a broad spectrum of natural language tasks.

图 3.1 画出了第 2 节所述 8 个模型的训练曲线. 这张图里我们还加入了 6 个超小模型, 最小的只有 10 万参数. 正如 [KMH+20] 所观察到的, 在高效使用训练算力时, 语言建模表现服从幂律. 把这一趋势再延伸两个数量级后, 我们只观察到很轻微 (如果有的话) 的偏离. 有人可能担心, 这些交叉熵损失上的改进只是来自对训练语料里无关细节的建模. 但接下来几节会看到, 交叉熵损失的改进在广泛的自然语言任务上带来了一致的表现提升.

Below, we evaluate the 8 models described in Section 2 (the 175 billion parameter parameter GPT-3 and 7 smaller models) on a wide range of datasets. We group the datasets into 9 categories representing roughly similar tasks.

下面我们在大量数据集上评测第 2 节所述的 8 个模型 (1750 亿参数的 GPT-3 和 7 个更小的模型). 我们把数据集分成 9 类, 每类代表大致相似的任务.

In Section 3.1 we evaluate on traditional language modeling tasks and tasks that are similar to language modeling, such as Cloze tasks and sentence/paragraph completion tasks. In Section 3.2 we evaluate on “closed book” question answering tasks: tasks which require using the information stored in the model’s parameters to answer general knowledge questions. In Section 3.3 we evaluate the model’s ability to translate between languages (especially one-shot and few-shot). In Section 3.4 we evaluate the model’s performance on Winograd Schema-like tasks. In Section 3.5 we evaluate on datasets that involve commonsense reasoning or question answering. In Section 3.6 we evaluate on reading comprehension tasks, in Section 3.7 we evaluate on the SuperGLUE benchmark suite, and in 3.8 we briefly explore NLI. Finally, in Section 3.9, we invent some additional tasks designed especially to probe in-context learning abilities – these tasks focus on on-the-fly reasoning, adaptation skills, or open-ended text synthesis. We evaluate all tasks in the few-shot, one-shot, and zero-shot settings.

3.1 节评测传统语言建模任务, 以及与语言建模相近的任务, 例如完形填空和句子/段落补全. 3.2 节评测 「闭卷」 问答: 要求用存储在模型参数里的信息回答常识性问题. 3.3 节评测模型在语言之间翻译的能力 (尤其是 one-shot 和 few-shot). 3.4 节评测模型在 Winograd Schema 类任务上的表现. 3.5 节评测涉及常识推理或问答的数据集. 3.6 节评测阅读理解, 3.7 节评测 SuperGLUE 基准套件, 3.8 节简要考察 NLI. 最后在 3.9 节, 我们另外设计了一些专门探测 in-context learning 能力的任务, 侧重即时推理, 适应技能或开放式文本生成. 所有任务都在 few-shot, one-shot 和 zero-shot 三种设定下评测.

<!-- page 11 of 75 -->

![图3.1 验证损失随训练算力的变化, 横轴是petaflop每秒天数取对数, 纵轴是交叉熵验证损失, 彩色曲线按参数量从1e5到1e11着色, 虚线是幂律拟合L等于2.57乘C的负0.048次方, 175B的曲线落在最右下端](images/p11-figure-3-1-smooth-scaling-of-performance-with-compute.png)

Figure 3.1: Smooth scaling of performance with compute. Performance (measured in terms of cross-entropy validation loss) follows a power-law trend with the amount of compute used for training. The power-law behavior observed in $\mathrm { [ K M H ^ { + } 2 0 ] }$ continues for an additional two orders of magnitude with only small deviations from the predicted curve. For this figure, we exclude embedding parameters from compute and parameter counts.

图 3.1: 表现随算力平滑变化. 表现 (以交叉熵验证损失衡量) 随训练所用算力呈幂律趋势. [KMH+20] 观察到的幂律行为又延续了两个数量级, 与预测曲线只有很小的偏离. 这张图里的算力和参数量都不计嵌入参数.

> **想:** 把图 3.1 的拟合式直接代入 175B 的训练算力, 损失会落在哪?
> 图 3.1 的虚线写作 L = 2.57·C^(-0.048), C 以 PF-days 计. 表 D.1 给 GPT-3 175B 的训练算力约 3,640 PF-days, 代入得 2.57 乘 3640 的 -0.048 次方约 1.73 (估算), 与图上 175B 曲线末端大致吻合. 不过图注说这里的算力和参数量都去掉了嵌入部分, 而表 D.1 的 3,640 是按总参数算的, 这个代入只能当量级核对.

| Setting | PTB |
| --- | --- |
| SOTA (Zero-Shot) | 35.8<sup>a</sup> |
| GPT-3 Zero-Shot | 20.5 |

Table 3.1: Zero-shot results on PTB language modeling dataset. Many other common language modeling datasets are omitted because they are derived from Wikipedia or other sources which are included in GPT-3’s training data. <sup>a</sup>[RWC+19]

表 3.1: PTB 语言建模数据集上的 zero-shot 结果. 其他许多常见语言建模数据集没有列出, 因为它们来自维基百科或其他已包含在 GPT-3 训练数据中的来源. a: [RWC+19].

## 3.1 Language Modeling, Cloze, and Completion Tasks (语言建模, 完形填空与补全任务)

In this section we test GPT-3’s performance on the traditional task of language modeling, as well as related tasks that involve predicting a single word of interest, completing a sentence or paragraph, or choosing between possible completions of a piece of text.

本节测试 GPT-3 在传统语言建模任务上的表现, 以及几类相关任务: 预测某个关键单词, 补全一个句子或段落, 或在一段文本的几个可能补全之间做选择.

## 3.1.1 Language Modeling (语言建模)

We calculate zero-shot perplexity on the Penn Tree Bank (PTB) $\mathrm { [ M K M ^ { + } 9 4 ] }$ dataset measured in $\mathrm { [ R W C ^ { + } 1 9 ] }$ . We omit the 4 Wikipedia-related tasks in that work because they are entirely contained in our training data, and we also omit the one-billion word benchmark due to a high fraction of the dataset being contained in our training set. PTB escapes these issues due to predating the modern internet. Our largest model sets a new SOTA on PTB by a substantial margin of 15 points, achieving a perplexity of 20.50. Note that since PTB is a traditional language modeling dataset it does not have a clear separation of examples to define one-shot or few-shot evaluation around, so we measure only zero-shot.

我们按 [RWC+19] 的测量方式, 计算 Penn Tree Bank (PTB) [MKM+94] 数据集上的 zero-shot 困惑度. 那篇工作里的 4 个维基百科相关任务我们没有做, 因为它们完全包含在我们的训练数据里; one-billion word 基准也没有做, 因为该数据集有很大一部分在我们的训练集里. PTB 早于现代互联网, 所以没有这些问题. 我们最大的模型在 PTB 上以 15 分的大幅优势刷新最好水平, 困惑度 20.50. 注意, PTB 是传统语言建模数据集, 没有清楚的样本划分来定义 one-shot 或 few-shot 评测, 所以只测 zero-shot.

## 3.1.2 LAMBADA (LAMBADA 长程依赖)

The LAMBADA dataset $\mathrm{[PKL^{+}16]}$ tests the modeling of long-range dependencies in text – the model is asked to predict the last word of sentences which require reading a paragraph of context. It has recently been suggested that the continued scaling of language models is yielding diminishing returns on this difficult benchmark. $[ \mathrm { B H T } ^ { \pm } 2 0 ]$ reflect on the small 1.5% improvement achieved by a doubling of model size between two recent state of the art results $( [ \mathrm { S P P } ^ { + } 1 9 ]$ and [Tur20]) and argue that “continuing to expand hardware and data sizes by orders of magnitude is not the path forward”. We find that path is still promising and in a zero-shot setting GPT-3 achieves 76% on LAMBADA, a gain of 8% over the previous state of the art.

LAMBADA 数据集 [PKL+16] 考察文本中长程依赖的建模: 模型要预测句子的最后一个词, 而这需要读完一整段上下文. 最近有人提出, 在这个难基准上, 继续放大语言模型的收益在递减. [BHT+20] 注意到, 两个近期最好结果 ([SPP+19] 和 [Tur20]) 之间模型尺寸翻了一倍, 却只提升了 1.5%, 并认为 「把硬件和数据规模再扩大几个数量级不是出路」. 我们发现这条路依然有希望: 在 zero-shot 设定下, GPT-3 在 LAMBADA 上达到 76%, 比此前最好水平高 8%.

<!-- page 12 of 75 -->

| Setting | LAMBADA (acc) | LAMBADA (ppl) | StoryCloze (acc) | HellaSwag (acc) |
| --- | --- | --- | --- | --- |
| SOTA | 68.0<sup>a</sup> | 8.63<sup>b</sup> | 91.8<sup>c</sup> | 85.6<sup>d</sup> |
| GPT-3 Zero-Shot | 76.2 | 3.00 | 83.2 | 78.9 |
| GPT-3 One-Shot | 72.5 | 3.35 | 84.7 | 78.1 |
| GPT-3 Few-Shot | 86.4 | 1.92 | 87.7 | 79.3 |

Table 3.2: Performance on cloze and completion tasks. GPT-3 significantly improves SOTA on LAMBADA while achieving respectable performance on two difficult completion prediction datasets. <sup>a</sup>[Tur20]<sup>b</sup>[RWC+19]<sup>c</sup>[LDL19] <sup>d</sup>[LCH+20]

表 3.2: 完形填空与补全任务上的表现. GPT-3 在 LAMBADA 上大幅刷新最好水平, 在两个困难的补全预测数据集上也取得了可观的表现. a: [Tur20], b: [RWC+19], c: [LDL19], d: [LCH+20].

![图3.2 LAMBADA准确率随参数量变化, 三条线分别为zero-shot, one-shot和K等于15的few-shot, 上方水平线是人类约95%, 下方虚线是zero-shot此前最好水平68%, few-shot曲线在1.3B处下凹, 到175B升至约86%](images/p12-figure-3-2-on-lambada-the-few-shot-capability-of.png)

Figure 3.2: On LAMBADA, the few-shot capability of language models results in a strong boost to accuracy. GPT-3 2.7B outperforms the SOTA 17B parameter Turing-NLG [Tur20] in this setting, and GPT-3 175B advances the state of the art by 18%. Note zero-shot uses a different format from one-shot and few-shot as described in the text.

图 3.2: 在 LAMBADA 上, 语言模型的 few-shot 能力大幅提升了准确率. 这一设定下, GPT-3 2.7B 就超过了 170 亿参数的最好模型 Turing-NLG [Tur20], GPT-3 175B 把最好水平提高了 18%. 注意 zero-shot 使用的格式与 one-shot 和 few-shot 不同, 见正文.

LAMBADA is also a demonstration of the flexibility of few-shot learning as it provides a way to address a problem that classically occurs with this dataset. Although the completion in LAMBADA is always the last word in a sentence, a standard language model has no way of knowing this detail. It thus assigns probability not only to the correct ending but also to other valid continuations of the paragraph. This problem has been partially addressed in the past with stop-word filters [RWC+19] (which ban “continuation” words). The few-shot setting instead allows us to “frame” the task as a cloze-test and allows the language model to infer from examples that a completion of exactly one word is desired. We use the following fill-in-the-blank format:

LAMBADA 也展示了 few-shot 学习的灵活性, 因为它提供了解决这个数据集上一个老问题的办法. LAMBADA 的补全总是句子的最后一个词, 但标准语言模型无从得知这一点. 于是它不仅给正确结尾分配概率, 也给这段话其他合理的续写分配概率. 过去用停用词过滤 [RWC+19] (禁止 「续写型」 词) 部分解决了这个问题. few-shot 设定则让我们能把任务 「框」 成完形填空, 让语言模型从例子里推断出只需要补一个词. 我们用下面的填空格式:

Alice was friends with Bob. Alice went to visit her friend . → Bob

示例: 爱丽丝和鲍勃是朋友. 爱丽丝去看望她的朋友 ___. → 鲍勃

George bought some baseball equipment, a ball, a glove, and a . →

示例: 乔治买了些棒球装备, 一个球, 一副手套, 和一根 ___. → (待模型补全)

When presented with examples formatted this way, GPT-3 achieves 86.4% accuracy in the few-shot setting, an increase of over 18% from the previous state-of-the-art. We observe that few-shot performance improves strongly with model size. While this setting decreases the performance of the smallest model by almost 20%, for GPT-3 it improves accuracy by 10%. Finally, the fill-in-blank method is not effective one-shot, where it always performs worse than the zero-shot setting. Perhaps this is because all models still require several examples to recognize the pattern.

用这种格式给出示例时, GPT-3 在 few-shot 设定下达到 86.4% 的准确率, 比此前最好水平高出 18% 以上. 我们观察到 few-shot 表现随模型尺寸大幅提升. 这一设定让最小的模型掉了将近 20%, 却让 GPT-3 的准确率提升了 10%. 最后, 填空法在 one-shot 下无效, 总是比 zero-shot 差. 也许是因为所有模型都还需要好几个例子才能认出这个模式.

> **问:** 「让最小的模型掉了将近 20%」 具体是哪两个数, 中间尺寸是不是单调变好?
> 表 H.1 的 LAMBADA acc 行: GPT-3 Small zero-shot 42.7, few-shot 22.0, 掉 20.7 分; GPT-3 175B 从 76.2 升到 86.4, 升 10.2 分. 中间并不单调: few-shot 一栏 GPT-3 Large 是 63.2, GPT-3 XL 反而只有 57.0, 还低于 XL 自己的 zero-shot 63.6, 这正是图 3.2 few-shot 曲线在 1.3B 处下凹的那一格. 从 GPT-3 2.7B 的 78.1 开始, few-shot 才稳定超过 zero-shot.

<!-- page 13 of 75 -->

| Setting | NaturalQS | WebQS | TriviaQA |
| --- | --- | --- | --- |
| RAG (Fine-tuned, Open-Domain) [LPP+20] | 44.5 | 45.5 | 68.0 |
| T5-11B+SSM (Fine-tuned, Closed-Book) [RRS20] | 36.6 | 44.7 | 60.5 |
| T5-11B (Fine-tuned, Closed-Book) | 34.5 | 37.4 | 50.1 |
| GPT-3 Zero-Shot | 14.6 | 14.4 | 64.3 |
| GPT-3 One-Shot | 23.0 | 25.3 | 68.0 |
| GPT-3 Few-Shot | 29.9 | 41.5 | 71.2 |

Table 3.3: Results on three Open-Domain QA tasks. GPT-3 is shown in the few-, one-, and zero-shot settings, as compared to prior SOTA results for closed book and open domain settings. TriviaQA few-shot result is evaluated on the wiki split test server.

表 3.3: 三个开放域问答任务上的结果. 表中给出 GPT-3 在 few-shot, one-shot 和 zero-shot 设定下的结果, 并与此前闭卷和开放域设定的最好结果对比. TriviaQA 的 few-shot 结果在 wiki 划分的测试服务器上评测.

> **核对:** 表 3.3 的 TriviaQA few-shot 71.2 来自测试服务器, 附录的对应格子是同一口径吗?
> 表 H.1 的 TriviaQA 行把 Split 标为 dev, 175B few-shot 一格同样是 71.2, 而表头 「175B (test server)」 那一列在本版里是空的. 表 C.1 的 TriviaQA 行也写 Split 为 dev, 总分 71.2. 于是同一个 71.2, 表 3.3 注明为测试服务器结果, 附录两张表却标为开发集, 本文没有给出另一套数把两种口径分开.

One note of caution is that an analysis of test set contamination identified that a significant minority of the LAMBADA dataset appears to be present in our training data – however analysis performed in Section 4 suggests negligible impact on performance.

需要提醒的一点是, 测试集污染分析发现, LAMBADA 数据集中有相当一部分 (虽是少数) 出现在我们的训练数据里; 不过第 4 节的分析表明它对表现的影响可以忽略.

## 3.1.3 HellaSwag (HellaSwag 故事结尾选择)

The HellaSwag dataset [ZHB+19] involves picking the best ending to a story or set of instructions. The examples were adversarially mined to be difficult for language models while remaining easy for humans (who achieve 95.6% accuracy). GPT-3 achieves 78.1% accuracy in the one-shot setting and 79.3% accuracy in the few-shot setting, outperforming the 75.4% accuracy of a fine-tuned 1.5B parameter language model [ZHR+19] but still a fair amount lower than the overall SOTA of 85.6% achieved by the fine-tuned multi-task model ALUM.

HellaSwag 数据集 [ZHB+19] 要求为一个故事或一组操作说明挑出最好的结尾. 这些样本经过对抗式挖掘, 对语言模型很难, 对人却仍然容易 (人的准确率是 95.6%). GPT-3 one-shot 准确率 78.1%, few-shot 79.3%, 超过了一个微调过的 15 亿参数语言模型的 75.4% [ZHR+19], 但仍明显低于微调多任务模型 ALUM 取得的整体最好水平 85.6%.

## 3.1.4 StoryCloze (StoryCloze 故事完形)

We next evaluate GPT-3 on the StoryCloze 2016 dataset [MCH+16], which involves selecting the correct ending sentence for five-sentence long stories. Here GPT-3 achieves 83.2% in the zero-shot setting and 87.7% in the few-shot setting (with K = 70). This is still 4.1% lower than the fine-tuned SOTA using a BERT based model [LDL19] but improves over previous zero-shot results by roughly 10%.

接下来我们在 StoryCloze 2016 数据集 [MCH+16] 上评测 GPT-3, 任务是为五句话长的故事选出正确的结尾句. GPT-3 zero-shot 达到 83.2%, few-shot 达到 87.7% (K = 70). 这仍比基于 BERT 的微调最好水平 [LDL19] 低 4.1%, 但比此前的 zero-shot 结果提升了约 10%.

## 3.2 Closed Book Question Answering (闭卷问答)

In this section we measure GPT-3’s ability to answer questions about broad factual knowledge. Due to the immense amount of possible queries, this task has normally been approached by using an information retrieval system to find relevant text in combination with a model which learns to generate an answer given the question and the retrieved text. Since this setting allows a system to search for and condition on text which potentially contains the answer it is denoted “open-book”. [RRS20] recently demonstrated that a large language model can perform surprisingly well directly answering the questions without conditioning on auxilliary information. They denote this more restrictive evaluation setting as “closed-book”. Their work suggests that even higher-capacity models could perform even better and we test this hypothesis with GPT-3. We evaluate GPT-3 on the 3 datasets in [RRS20]: Natural Questions [KPR+19], WebQuestions [BCFL13], and TriviaQA [JCWZ17], using the same splits. Note that in addition to all results being in the closed-book setting, our use of few-shot, one-shot, and zero-shot evaluations represent an even stricter setting than previous closed-book QA work: in addition to external content not being allowed, fine-tuning on the Q&A dataset itself is also not permitted.

本节衡量 GPT-3 回答广泛事实知识问题的能力. 由于可能的提问数量极其庞大, 这类任务通常的做法是用信息检索系统找到相关文本, 再配一个模型, 根据问题和检索到的文本生成答案. 这种设定允许系统检索并以可能含有答案的文本为条件, 所以叫 「开卷」. [RRS20] 最近证明, 大语言模型不借助任何辅助信息, 直接回答问题也能做得出奇地好. 他们把这种更严格的评测设定称为 「闭卷」. 他们的工作暗示容量更大的模型可能做得更好, 我们用 GPT-3 来检验这个假设. 我们在 [RRS20] 的 3 个数据集上评测 GPT-3: Natural Questions [KPR+19], WebQuestions [BCFL13] 和 TriviaQA [JCWZ17], 使用相同的划分. 注意, 除了所有结果都是闭卷设定之外, 我们的 few-shot, one-shot 和 zero-shot 评测比以往的闭卷问答工作还要严格: 不仅不允许外部内容, 连在问答数据集本身上微调也不允许.

The results for GPT-3 are shown in Table 3.3. On TriviaQA, we achieve 64.3% in the zero-shot setting, 68.0% in the one-shot setting, and 71.2% in the few-shot setting. The zero-shot result already outperforms the fine-tuned T5-11B by 14.2%, and also outperforms a version with Q&A tailored span prediction during pre-training by 3.8%. The one-shot result improves by 3.7% and matches the SOTA for an open-domain QA system which not only fine-tunes but also makes use of a learned retrieval mechanism over a 15.3B parameter dense vector index of 21M documents [LPP+20]. GPT-3’s few-shot result further improves performance another 3.2% beyond this.

GPT-3 的结果见表 3.3. 在 TriviaQA 上, zero-shot 达到 64.3%, one-shot 68.0%, few-shot 71.2%. zero-shot 结果已经比微调的 T5-11B 高 14.2%, 也比预训练中加了问答定制 span 预测的版本高 3.8%. one-shot 结果再提升 3.7%, 追平了一个开放域问答系统的最好水平; 那个系统不仅做了微调, 还在一个覆盖 2100 万篇文档, 153 亿参数的稠密向量索引上使用学到的检索机制 [LPP+20]. GPT-3 的 few-shot 结果在此基础上又提升了 3.2%.

On WebQuestions (WebQs), GPT-3 achieves 14.4% in the zero-shot setting, 25.3% in the one-shot setting, and 41.5% in the few-shot setting. This compares to 37.4% for fine-tuned T5-11B, and 44.7% for fine-tuned T5-11B+SSM, which uses a Q&A-specific pre-training procedure. GPT-3 in the few-shot setting approaches the performance of state-of-the-art fine-tuned models. Notably, compared to TriviaQA, WebQS shows a much larger gain from zero-shot to few-shot (and indeed its zero-shot and one-shot performance are poor), perhaps suggesting that the WebQs questions and/or the style of their answers are out-of-distribution for GPT-3. Nevertheless, GPT-3 appears able to adapt to this distribution, recovering strong performance in the few-shot setting.

在 WebQuestions (WebQs) 上, GPT-3 zero-shot 达到 14.4%, one-shot 25.3%, few-shot 41.5%. 作为对比, 微调的 T5-11B 是 37.4%, 使用问答专用预训练流程的微调 T5-11B+SSM 是 44.7%. few-shot 设定下的 GPT-3 接近最好的微调模型. 值得注意的是, 与 TriviaQA 相比, WebQS 从 zero-shot 到 few-shot 的增幅大得多 (它的 zero-shot 和 one-shot 表现确实很差), 这也许说明 WebQs 的问题和/或答案风格对 GPT-3 来说属于分布外. 尽管如此, GPT-3 看来能适应这种分布, 在 few-shot 设定下恢复了强劲的表现.

<!-- page 14 of 75 -->

![图3.3 TriviaQA准确率随参数量平滑上升, 三条线为zero-shot, one-shot和K等于64的few-shot, 水平虚线是微调开放域模型RAG的68.0, 175B的one-shot追平该线, few-shot超过它](images/p14-figure-3-3-on-triviaqa-gpt3-s-performance-grows.png)

Figure 3.3: On TriviaQA GPT3’s performance grows smoothly with model size, suggesting that language models continue to absorb knowledge as their capacity increases. One-shot and few-shot performance make significant gains over zero-shot behavior, matching and exceeding the performance of the SOTA fine-tuned open-domain model, RAG [LPP+20]

图 3.3: 在 TriviaQA 上, GPT3 的表现随模型尺寸平滑增长, 说明语言模型随着容量增加仍在不断吸收知识. one-shot 和 few-shot 相对 zero-shot 有显著提升, 追平并超过了最好的微调开放域模型 RAG [LPP+20].

On Natural Questions (NQs) GPT-3 achieves 14.6% in the zero-shot setting, 23.0% in the one-shot setting, and 29.9% in the few-shot setting, compared to 36.6% for fine-tuned T5 11B+SSM. Similar to WebQS, the large gain from zero-shot to few-shot may suggest a distribution shift, and may also explain the less competitive performance compared to TriviaQA and WebQS. In particular, the questions in NQs tend towards very fine-grained knowledge on Wikipedia specifically which could be testing the limits of GPT-3’s capacity and broad pretraining distribution.

在 Natural Questions (NQs) 上, GPT-3 zero-shot 达到 14.6%, one-shot 23.0%, few-shot 29.9%, 微调的 T5 11B+SSM 是 36.6%. 与 WebQS 类似, 从 zero-shot 到 few-shot 的大幅增长可能意味着分布偏移, 也可能解释了它为什么不如在 TriviaQA 和 WebQS 上有竞争力. 尤其是, NQs 的问题偏向非常细的维基百科知识, 这可能正在触及 GPT-3 的容量和宽泛预训练分布的极限.

> **拆开:** NQs 的 few-shot 29.9 离 T5 11B+SSM 还差多少, 小模型档在这里是什么水平?
> 表 3.3 里差 36.6 减 29.9 等于 6.7 分. 表 H.1 的 NQs 行显示小档几乎挨不上边: few-shot 下 GPT-3 Small 1.72, GPT-3 XL 9.72, GPT-3 13B 21.0, 到 175B 才是 29.9. zero-shot 下 GPT-3 6.7B 的 5.79 还低于 GPT-3 2.7B 的 6.01, 是这一行唯一的倒挂. 所以 「随尺寸平滑增长」 在 NQs 上主要是 few-shot 一栏成立.

Overall, on one of the three datasets GPT-3’s one-shot matches the open-domain fine-tuning SOTA. On the other two datasets it approaches the performance of the closed-book SOTA despite not using fine-tuning. On all 3 datasets, we find that performance scales very smoothly with model size (Figure 3.3 and Appendix H Figure H.7), possibly reflecting the idea that model capacity translates directly to more ‘knowledge’ absorbed in the parameters of the model.

总体来看, 在三个数据集中的一个上, GPT-3 的 one-shot 追平了开放域微调的最好水平. 在另外两个上, 它虽不做微调, 也接近闭卷的最好水平. 在全部 3 个数据集上, 表现都随模型尺寸非常平滑地变化 (图 3.3 和附录 H 图 H.7), 这可能反映了一个想法: 模型容量直接转化为参数中吸收的更多 「知识」.

## 3.3 Translation (翻译)

For GPT-2 a filter was used on a multilingual collection of documents to produce an English only dataset due to capacity concerns. Even with this filtering GPT-2 showed some evidence of multilingual capability and performed non-trivially when translating between French and English despite only training on 10 megabytes of remaining French text. Since we increase the capacity by over two orders of magnitude from GPT-2 to GPT-3, we also expand the scope of the training dataset to include more representation of other languages, though this remains an area for further improvement. As discussed in 2.2 the majority of our data is derived from raw Common Crawl with only quality-based filtering. Although GPT-3’s training data is still primarily English (93% by word count), it also includes 7% of text in other languages. These languages are documented in the [supplemental material](https://github.com/openai/gpt-3). In order to better understand translation capability, we also expand our analysis to include two additional commonly studied languages, German and Romanian.

对 GPT-2, 出于容量考虑, 我们对一个多语言文档集合做了过滤, 得到一个只含英文的数据集. 即便经过这样的过滤, GPT-2 仍表现出一些多语言能力, 在法英互译上也有不俗的表现, 而它只在残留的 10MB 法语文本上训练过. 从 GPT-2 到 GPT-3 我们把容量提高了两个数量级以上, 所以也扩大了训练数据的范围, 纳入更多其他语言的内容, 尽管这方面仍有改进空间. 如 2.2 节所述, 我们的大部分数据来自原始 Common Crawl, 只做了基于质量的过滤. GPT-3 的训练数据仍以英文为主 (按词数算占 93%), 但也包含 7% 的其他语言文本. 这些语言记录在补充材料里. 为了更好地理解翻译能力, 我们还把分析扩展到另外两种常被研究的语言: 德语和罗马尼亚语.

Existing unsupervised machine translation approaches often combine pretraining on a pair of monolingual datasets with back-translation [SHB15] to bridge the two languages in a controlled way. By contrast, GPT-3 learns from a blend of training data that mixes many languages together in a natural way, combining them on a word, sentence, and document level. GPT-3 also uses a single training objective which is not customized or designed for any task in particular. However, our one / few-shot settings aren’t strictly comparable to prior unsupervised work since they make use of a small amount of paired examples (1 or 64). This corresponds to up to a page or two of in-context training data.

现有的无监督机器翻译方法, 常常把在一对单语数据集上的预训练与回译 [SHB15] 结合起来, 以受控的方式在两种语言之间架起联系. 相比之下, GPT-3 从一份自然混合了多种语言的训练数据中学习, 在词, 句和文档层面都有混合. GPT-3 也只用一个训练目标, 没有为任何具体任务定制或设计. 不过, 我们的 one-shot 和 few-shot 设定与以往的无监督工作并不严格可比, 因为它们用到了少量成对示例 (1 个或 64 个). 这相当于最多一两页的上下文训练数据.

Results are shown in Table 3.4. Zero-shot GPT-3, which only receives on a natural language description of the task, still underperforms recent unsupervised NMT results. However, providing only a single example demonstration for each translation task improves performance by over 7 BLEU and nears competitive performance with prior work. GPT-3 in the full few-shot setting further improves another 4 BLEU resulting in similar average performance to prior unsupervised NMT work. GPT-3 has a noticeable skew in its performance depending on language direction. For the three input languages studied, GPT-3 significantly outperforms prior unsupervised NMT work when translating into English but underperforms when translating in the other direction. Performance on En-Ro is a noticeable outlier at over 10 BLEU worse than prior unsupervised NMT work. This could be a weakness due to reusing the byte-level BPE tokenizer of GPT-2 which was developed for an almost entirely English training dataset. For both Fr-En and De-En, few shot GPT-3 outperforms the best supervised result we could find but due to our unfamiliarity with the literature and the appearance that these are un-competitive benchmarks we do not suspect those results represent true state of the art. For Ro-En, few shot GPT-3 performs within 0.5 BLEU of the overall SOTA which is achieved by a combination of unsupervised pretraining, supervised finetuning on 608K labeled examples, and backtranslation [LHCG19b].

结果见表 3.4. zero-shot 的 GPT-3 只拿到一段任务的自然语言描述, 仍不如近期的无监督 NMT 结果. 但每个翻译任务只给一个示范, 表现就提升了 7 BLEU 以上, 接近以往工作的水平. 完整 few-shot 设定下, GPT-3 又提升了 4 BLEU, 平均表现与以往的无监督 NMT 工作相当. GPT-3 的表现随翻译方向有明显偏斜. 对研究的三种输入语言, GPT-3 译入英文时明显超过以往的无监督 NMT 工作, 译出英文时则不如. En-Ro 是一个明显的离群点, 比以往无监督 NMT 差了 10 BLEU 以上. 这可能是沿用 GPT-2 的字节级 BPE 分词器带来的弱点, 那个分词器是为几乎全英文的训练集开发的. 对 Fr-En 和 De-En, few-shot 的 GPT-3 都超过了我们能找到的最好监督结果, 但由于我们对这方面文献不熟, 而且这些看起来不是竞争激烈的基准, 我们并不认为这些结果代表真正的最好水平. 对 Ro-En, few-shot 的 GPT-3 与整体最好水平只差 0.5 BLEU 以内; 那个最好水平结合了无监督预训练, 在 60.8 万条标注样本上的监督微调, 以及回译 [LHCG19b].

> **回看:** 「单示范提升 7 BLEU 以上, few-shot 再提升 4 BLEU, 译入英文超出 5 BLEU」, 这三个数能从表 3.4 核出来吗?
> 能, 按六个方向取平均 (估算): zero-shot 平均约 22.0, one-shot 约 29.6, few-shot 约 33.8, 前一步涨约 7.6, 后一步涨约 4.1. 译入英文的三个 few-shot 分数 39.2, 40.6, 39.5 平均约 39.8, 对应方向上以往最好的无监督结果都是 MASS 的 34.9, 35.2, 33.1, 平均约 34.4, 相差约 5.4. Ro-En 的 39.5 与监督最好 39.9 差 0.4, 也在 「0.5 以内」.

<!-- page 15 of 75 -->

| Setting | En→Fr | Fr→En | En→De | De→En | En→Ro | Ro→En |
| --- | --- | --- | --- | --- | --- | --- |
| SOTA (Supervised) | 45.6<sup>a</sup> | 35.0 <sup>b</sup> | 41.2<sup>c</sup> | 40.2<sup>d</sup> | 38.5<sup>e</sup> | 39.9<sup>e</sup> |
| XLM [LC19] | 33.4 | 33.3 | 26.4 | 34.3 | 33.3 | 31.8 |
| MASS [STQ+19] | 37.5 | 34.9 | 28.3 | 35.2 | 35.2 | 33.1 |
| mBART [LGG+20] | - | - | 29.8 | 34.0 | 35.0 | 30.5 |
| GPT-3 Zero-Shot | 25.2 | 21.2 | 24.6 | 27.2 | 14.1 | 19.9 |
| GPT-3 One-Shot | 28.3 | 33.7 | 26.2 | 30.4 | 20.6 | 38.6 |
| GPT-3 Few-Shot | 32.6 | 39.2 | 29.7 | 40.6 | 21.0 | 39.5 |

Table 3.4: Few-shot GPT-3 outperforms previous unsupervised NMT work by 5 BLEU when translating into English reflecting its strength as an English LM. We report BLEU scores on the WMT’14 Fr↔En, WMT’16 De↔En, and WMT’16 Ro↔En datasets as measured by multi-bleu.perl with XLM’s tokenization in order to compare most closely with prior unsupervised NMT work. SacreBLEU<sup>f</sup>[Pos18] results reported in Appendix H. Underline indicates an unsupervised or few-shot SOTA, bold indicates supervised SOTA with relative confidence. <sup>a</sup>[EOAG18]<sup>b</sup>[DHKH14]<sup>c</sup>[WXH+18]<sup>d</sup>[oR16]<sup>e</sup>[LGG+20]<sup>f</sup>[SacreBLEU signature: BLEU+case.mixed+numrefs.1+smooth.exp+tok.intl+version.1.2.20]

表 3.4: few-shot 的 GPT-3 在译入英文时比以往无监督 NMT 工作高 5 BLEU, 反映出它作为英文语言模型的优势. 我们报告 WMT'14 Fr↔En, WMT'16 De↔En 和 WMT'16 Ro↔En 数据集上的 BLEU, 用 multi-bleu.perl 配合 XLM 的分词来计算, 以便与以往无监督 NMT 工作最接近地对比. SacreBLEU [Pos18] 结果见附录 H. 下划线表示无监督或 few-shot 的最好水平, 粗体表示有相当把握的监督最好水平. 上标 a 到 e 为各最好结果的出处, f 为 SacreBLEU 的签名.

![图3.4 六个语言方向的few-shot翻译BLEU随参数量上升, 横轴是参数量, 纵轴是Multi-BLEU, 实线是译入英文的法英, 德英, 罗英, 虚线是译出英文的三个方向, 实线整体高于虚线](images/p15-figure-3-4-few-shot-translation-performance-on-6.png)

Figure 3.4: Few-shot translation performance on 6 language pairs as model capacity increases. There is a consistent trend of improvement across all datasets as the model scales, and as well as tendency for translation into English to be stronger than translation from English.

图 3.4: 随模型容量增加, 6 个语言对上的 few-shot 翻译表现. 所有数据集都随规模一致提升, 而且译入英文往往比译出英文更强.

<!-- page 16 of 75 -->

| Setting | Winograd | Winogrande (XL) |
| --- | --- | --- |
| Fine-tuned SOTA | 90.1<sup>a</sup> | 84.6<sup>b</sup> |
| GPT-3 Zero-Shot | 88.3* | 70.2 |
| GPT-3 One-Shot | 89.7* | 73.2 |
| GPT-3 Few-Shot | 88.6* | 77.7 |

Table 3.5: Results on the WSC273 version of Winograd schemas and the adversarial Winogrande dataset. See Section 4 for details on potential contamination of the Winograd test set. <sup>a</sup>[SBBC19] <sup>b</sup>[LYN+20]

表 3.5: WSC273 版 Winograd schema 和对抗式 Winogrande 数据集上的结果. Winograd 测试集可能被污染的细节见第 4 节. a: [SBBC19], b: [LYN+20].

![图3.5 Winogrande准确率随参数量变化, 三条线为zero-shot, one-shot和K等于50的few-shot, 自上而下的水平参考线是人类, 微调最好水平, RoBERTa-Large, BERT-Large和随机猜测, 175B的few-shot接近RoBERTa-Large](images/p16-figure-3-5-zero-one-and-few-shot-performance-on-the.png)

Figure 3.5: Zero-, one-, and few-shot performance on the adversarial Winogrande dataset as model capacity scales. Scaling is relatively smooth with the gains to few-shot learning increasing with model size, and few-shot GPT-3 175B is competitive with a fine-tuned RoBERTA-large.

图 3.5: 对抗式 Winogrande 数据集上 zero-shot, one-shot 和 few-shot 表现随模型容量的变化. 变化相对平滑, few-shot 学习的收益随模型尺寸增大, few-shot 的 GPT-3 175B 与微调的 RoBERTA-large 不相上下.

Finally, across all language pairs and across all three settings (zero-, one-, and few-shot), there is a smooth trend of improvement with model capacity. This is shown in Figure 3.4 in the case of few-shot results, and scaling for all three settings is shown in Appendix H.

最后, 在所有语言对和全部三种设定 (zero-shot, one-shot 和 few-shot) 下, 表现都随模型容量平滑提升. few-shot 的情况见图 3.4, 三种设定的规模曲线见附录 H.

## 3.4 Winograd-Style Tasks (Winograd 类任务)

The Winograd Schemas Challenge [LDM12] is a classical task in NLP that involves determining which word a pronoun refers to, when the pronoun is grammatically ambiguous but semantically unambiguous to a human. Recently fine-tuned language models have achieved near-human performance on the original Winograd dataset, but more difficult versions such as the adversarially-mined Winogrande dataset [SBBC19] still significantly lag human performance. We test GPT-3’s performance on both Winograd and Winogrande, as usual in the zero-, one-, and few-shot setting.

Winograd Schemas Challenge [LDM12] 是 NLP 里的经典任务: 一个代词在语法上有歧义, 但对人来说语义上并无歧义, 要判断它指代哪个词. 近来微调过的语言模型在原版 Winograd 数据集上已接近人类水平, 但更难的版本, 比如经过对抗式挖掘的 Winogrande 数据集 [SBBC19], 仍明显落后于人. 我们照例在 zero-shot, one-shot 和 few-shot 设定下, 同时测试 GPT-3 在 Winograd 和 Winogrande 上的表现.

<!-- page 17 of 75 -->

| Setting | PIQA | ARC (Easy) | ARC (Challenge) | OpenBookQA |
| --- | --- | --- | --- | --- |
| Fine-tuned SOTA | 79.4 | 92.0[KKS+20] | 78.5[KKS+20] | 87.2[KKS+20] |
| GPT-3 Zero-Shot | 80.5* | 68.8 | 51.4 | 57.6 |
| GPT-3 One-Shot | 80.5* | 71.2 | 53.2 | 58.8 |
| GPT-3 Few-Shot | 82.8* | 70.1 | 51.5 | 65.4 |

Table 3.6: GPT-3 results on three commonsense reasoning tasks, PIQA, ARC, and OpenBookQA. GPT-3 Few-Shot PIQA result is evaluated on the test server. See Section 4 for details on potential contamination issues on the PIQA test set.

表 3.6: GPT-3 在三个常识推理任务 PIQA, ARC 和 OpenBookQA 上的结果. GPT-3 few-shot 的 PIQA 结果在测试服务器上评测. PIQA 测试集可能存在的污染问题见第 4 节.

![图3.6 PhysicalQA准确率随参数量变化, 三条线为zero-shot, one-shot和K等于50的few-shot, 水平参考线自上而下为人类约95, 微调最好水平约77, 随机猜测50, 三条线在2.6B以后都越过微调最好水平线, 175B的few-shot约82](images/p17-figure-3-6-gpt-3-results-on-piqa-in-the-zero-shot-one.png)

Figure 3.6: GPT-3 results on PIQA in the zero-shot, one-shot, and few-shot settings. The largest model achieves a score on the development set in all three conditions that exceeds the best recorded score on the task.

图 3.6: GPT-3 在 PIQA 上 zero-shot, one-shot 和 few-shot 设定下的结果. 最大的模型在开发集上三种条件下的得分都超过了该任务有记录的最好成绩.

On Winograd we test GPT-3 on the original set of 273 Winograd schemas, using the same “partial evaluation” method described in [RWC+19]. Note that this setting differs slightly from the WSC task in the SuperGLUE benchmark, which is presented as binary classification and requires entity extraction to convert to the form described in this section. On Winograd GPT-3 achieves 88.3%, 89.7%, and 88.6% in the zero-shot, one-shot, and few-shot settings, showing no clear in-context learning but in all cases achieving strong results just a few points below state-of-the-art and estimated human performance. We note that contamination analysis found some Winograd schemas in the training data but this appears to have only a small effect on results (see Section 4).

在 Winograd 上, 我们用原始的 273 个 Winograd schema 测试 GPT-3, 采用 [RWC+19] 中描述的 「部分评估」 方法. 注意这个设定与 SuperGLUE 基准里的 WSC 任务略有不同: 后者以二分类形式呈现, 需要先做实体抽取才能转成本节描述的形式. GPT-3 在 Winograd 上 zero-shot, one-shot 和 few-shot 分别达到 88.3%, 89.7% 和 88.6%, 看不出明显的 in-context learning, 但在所有设定下都很强, 只比最好水平和估计的人类水平低几分. 污染分析在训练数据中发现了一些 Winograd schema, 但这看来对结果影响很小 (见第 4 节).

> **看表:** 表 3.5 给 Winograd 的微调最好水平是 90.1, 附录用的是同一个数吗?
> 不是. 表 H.1 的 Winograd 行 SOTA 一格写 93.8, 这恰好是表 3.8 里 SuperGLUE WSC 的微调最好水平. 按 90.1 算, GPT-3 175B 的 one-shot 89.7 只差 0.4 分; 按 93.8 算则差 4.1 分, 正文 「只比最好水平低几分」 两种读法都说得通. 表 H.1 这一行还有一处倒挂: few-shot 下 GPT-3 13B 是 82.4, 低于 GPT-3 6.7B 的 85.4.

On the more difficult Winogrande dataset, we do find gains to in-context learning: GPT-3 achieves 70.2% in the zero-shot setting, 73.2% in the one-shot setting, and 77.7% in the few-shot setting. For comparison a fine-tuned RoBERTA model achieves 79%, state-of-the-art is 84.6% achieved with a fine-tuned high capacity model (T5), and human performance on the task as reported by [SBBC19] is 94.0%.

在更难的 Winogrande 数据集上, 我们确实看到了 in-context learning 的收益: GPT-3 zero-shot 70.2%, one-shot 73.2%, few-shot 77.7%. 作为对比, 微调的 RoBERTA 模型是 79%, 最好水平 84.6% 由一个高容量微调模型 (T5) 取得, [SBBC19] 报告的人类表现是 94.0%.

## 3.5 Common Sense Reasoning (常识推理)

Next we consider three datasets which attempt to capture physical or scientific reasoning, as distinct from sentence completion, reading comprehension, or broad knowledge question answering. The first, PhysicalQA (PIQA) [BZB+19], asks common sense questions about how the physical world works and is intended as a probe of grounded understanding of the world. GPT-3 achieves 81.0% accuracy zero-shot, 80.5% accuracy one-shot, and 82.8% accuracy few-shot (the last measured on PIQA’s test server). This compares favorably to the 79.4% accuracy prior state-of-the-art of a fine-tuned RoBERTa. PIQA shows relatively shallow scaling with model size and is still over 10% worse than human performance, but GPT-3’s few-shot and even zero-shot result outperform the current state-of-the-art. Our analysis flagged PIQA for a potential data contamination issue (despite hidden test labels), and we therefore conservatively mark the result with an asterisk. See Section 4 for details.

接下来我们考察三个数据集, 它们试图刻画物理或科学推理, 与句子补全, 阅读理解或广泛知识问答不同. 第一个是 PhysicalQA (PIQA) [BZB+19], 它问关于物理世界如何运作的常识问题, 用来探测对世界的具身理解. GPT-3 zero-shot 准确率 81.0%, one-shot 80.5%, few-shot 82.8% (最后一个在 PIQA 的测试服务器上测得). 与此前微调 RoBERTa 的最好水平 79.4% 相比表现不错. PIQA 随模型尺寸的提升相对平缓, 仍比人类表现差 10% 以上, 但 GPT-3 的 few-shot 乃至 zero-shot 结果都超过了当前最好水平. 我们的分析把 PIQA 标记为可能存在数据污染 (尽管测试标签是隐藏的), 所以保守地给结果加了星号. 详见第 4 节.

> **确认:** PIQA 的三个数, 正文, 表 3.6, 图 3.6 和表 H.1 说的是同一套吗?
> 不完全是. 正文 zero-shot 写 81.0, 表 3.6 却印 80.5*, 与 one-shot 同值; 表 H.1 的 zero-shot 是 81.0, one-shot 80.5, few-shot 82.3 (dev), 正文的 few-shot 82.8 是测试服务器值. 最好水平也有两个: 正文和表 3.6 写 79.4, 表 H.1 与图 3.6 的虚线在 77.1 附近. 所以 「超过最好水平」 在两套口径下都成立, 但差距分别是 3.4 分和 5.2 分左右.

<!-- page 18 of 75 -->

| Setting | CoQA | DROP | QuAC | SQuADv2 | RACE-h | RACE-m |
| --- | --- | --- | --- | --- | --- | --- |
| Fine-tuned SOTA | 90.7<sup>a</sup> | 89.1<sup>b</sup> | 74.4<sup>c</sup> | 93.0<sup>d</sup> | 90.0<sup>e</sup> | 93.1<sup>e</sup> |
| GPT-3 Zero-Shot | 81.5 | 23.6 | 41.5 | 59.5 | 45.5 | 58.4 |
| GPT-3 One-Shot | 84.0 | 34.3 | 43.3 | 65.4 | 45.9 | 57.4 |
| GPT-3 Few-Shot | 85.0 | 36.5 | 44.3 | 69.8 | 46.8 | 58.1 |

Table 3.7: Results on reading comprehension tasks. All scores are F1 except results for RACE which report accuracy. <sup>a</sup>[JZC+19]<sup>b</sup>[JN20]<sup>c</sup>[AI19]<sup>d</sup>[QIA20]<sup>e</sup>[SPP+19]

表 3.7: 阅读理解任务上的结果. 除 RACE 报告准确率外, 其余均为 F1. 上标 a 到 e 为各最好结果的出处.

ARC [CCE+18] is a dataset of multiple-choice questions collected from 3rd to 9th grade science exams. On the “Challenge” version of the dataset which has been filtered to questions which simple statistical or information retrieval methods are unable to correctly answer, GPT-3 achieves 51.4% accuracy in the zero-shot setting, 53.2% in the one-shot setting, and 51.5% in the few-shot setting. This is approaching the performance of a fine-tuned RoBERTa baseline (55.9%) from UnifiedQA [KKS+20]. On the “Easy” version of the dataset (questions which either of the mentioned baseline approaches answered correctly), GPT-3 achieves 68.8%, 71.2%, and 70.1% which slightly exceeds a fine-tuned RoBERTa baseline from [KKS+20]. However, both of these results are still much worse than the overall SOTAs achieved by the UnifiedQA which exceeds GPT-3’s few-shot results by 27% on the challenge set and 22% on the easy set.

ARC [CCE+18] 是从 3 到 9 年级科学考试中收集的多项选择题数据集. 在 「Challenge」 版本上, 题目经过过滤, 只留简单统计方法或信息检索方法答不对的题, GPT-3 zero-shot 准确率 51.4%, one-shot 53.2%, few-shot 51.5%. 这接近 UnifiedQA [KKS+20] 中微调 RoBERTa 基线的 55.9%. 在 「Easy」 版本上 (上述任一基线方法能答对的题), GPT-3 达到 68.8%, 71.2% 和 70.1%, 略高于 [KKS+20] 的微调 RoBERTa 基线. 不过两个结果都仍远低于 UnifiedQA 取得的整体最好水平, 后者在 challenge 集上比 GPT-3 的 few-shot 高 27%, 在 easy 集上高 22%.

On OpenBookQA [MCKS18], GPT-3 improves significantly from zero to few shot settings but is still over 20 points short of the overall SOTA. GPT-3’s few-shot performance is similar to a fine-tuned BERT Large baseline on the leaderboard.

在 OpenBookQA [MCKS18] 上, GPT-3 从 zero-shot 到 few-shot 显著提升, 但离整体最好水平仍差 20 分以上. GPT-3 的 few-shot 表现与排行榜上微调的 BERT Large 基线相近.

Overall, in-context learning with GPT-3 shows mixed results on commonsense reasoning tasks, with only small and inconsistent gains observed in the one and few-shot learning settings for both PIQA and ARC, but a significant improvement is observed on OpenBookQA. GPT-3 sets SOTA on the new PIQA dataset in all evaluation settings.

总的来说, GPT-3 的 in-context learning 在常识推理任务上结果参差: 在 PIQA 和 ARC 上, one-shot 和 few-shot 只带来小而不稳定的收益, 在 OpenBookQA 上则有显著提升. GPT-3 在新的 PIQA 数据集上所有评测设定下都刷新了最好水平.

## 3.6 Reading Comprehension (阅读理解)

Next we evaluate GPT-3 on the task of reading comprehension. We use a suite of 5 datasets including abstractive, multiple choice, and span based answer formats in both dialog and single question settings. We observe a wide spread in GPT-3’s performance across these datasets suggestive of varying capability with different answer formats. In general we observe GPT-3 is on par with initial baselines and early results trained using contextual representations on each respective dataset.

接下来我们评测 GPT-3 的阅读理解. 我们使用由 5 个数据集组成的一套, 答案格式包括生成式, 多项选择和片段抽取, 场景包括对话和单问题两种. 我们观察到 GPT-3 在这些数据集上的表现差异很大, 说明它对不同答案格式的能力不一. 总体上, GPT-3 与各数据集上最初的基线, 以及早期使用上下文表示训练的结果相当.

GPT-3 performs best (within 3 points of the human baseline) on CoQA [RCM19] a free-form conversational dataset and performs worst (13 F1 below an ELMo baseline) on QuAC [CHI+18] a dataset which requires modeling structured dialog acts and answer span selections of teacher-student interactions. On DROP [DWD+19], a dataset testing discrete reasoning and numeracy in the context of reading comprehension, GPT-3 in a few-shot setting outperforms the fine-tuned BERT baseline from the original paper but is still well below both human performance and state-of-the-art approaches which augment neural networks with symbolic systems [RLL+19]. On SQuAD 2.0 [RJL18], GPT-3 demonstrates its few-shot learning capabilities, improving by almost 10 F1 (to 69.8) compared to a zero-shot setting. This allows it to slightly outperform the best fine-tuned result in the original paper. On RACE [LXL+17], a multiple choice dataset of middle school and high school english examinations, GPT-3 performs relatively weakly and is only competitive with the earliest work utilizing contextual representations and is still 45% behind SOTA.

GPT-3 在自由形式对话数据集 CoQA [RCM19] 上表现最好 (离人类基线不到 3 分), 在 QuAC [CHI+18] 上表现最差 (比 ELMo 基线低 13 F1), 后者需要建模师生交互中结构化的对话行为和答案片段选择. 在 DROP [DWD+19] 上, 这个数据集考察阅读理解语境下的离散推理和计算能力, few-shot 的 GPT-3 超过了原论文里微调 BERT 的基线, 但仍远低于人类表现, 也远低于用符号系统增强神经网络的最好方法 [RLL+19]. 在 SQuAD 2.0 [RJL18] 上, GPT-3 展现了 few-shot 学习能力, 比 zero-shot 提升将近 10 F1 (到 69.8). 这让它略微超过了原论文中最好的微调结果. 在 RACE [LXL+17] 上, 这是一个由初中和高中英语考试构成的多项选择数据集, GPT-3 表现相对较弱, 只与最早使用上下文表示的工作相当, 仍落后最好水平 45%.

> **拆开:** RACE 「落后最好水平 45%」, 用表 3.7 能拆出哪几种算法?
> 表 3.7 的 few-shot 一行: RACE-h 46.8 对 90.0, 绝对差 43.2 分; RACE-m 58.1 对 93.1, 绝对差 35.0 分. 若按相对差算, RACE-h 是 1 减 46.8 除以 90.0 约 48% (估算). 三种算法都不正好是 45%, 最接近的是 RACE-h 的绝对差. 同一段里 SQuAD 2.0 「将近 10 F1」 实际是 69.8 减 59.5 等于 10.3, 略超 10.

## 3.7 SuperGLUE (SuperGLUE 基准)

In order to better aggregate results on NLP tasks and compare to popular models such as BERT and RoBERTa in a more systematic way, we also evaluate GPT-3 on a standardized collection of datasets, the SuperGLUE benchmark [WPN+19] [WPN+19] [CLC+19] [DMST19] [RBG11] [KCR+18] [ZLL+18] [DGM06] [BHDD+06] [GMDD07] [BDD+09] [PCC18] [PHR+18]. GPT-3’s test-set performance on the SuperGLUE dataset is shown in Table 3.8. In the few-shot setting, we used 32 examples for all tasks, sampled randomly from the training set. For all tasks except WSC and MultiRC, we sampled a new set of examples to use in the context for each problem. For WSC and MultiRC, we used the same set of randomly drawn examples from the training set as context for all of the problems we evaluated.

为了更好地汇总 NLP 任务上的结果, 并更系统地与 BERT 和 RoBERTa 等流行模型比较, 我们还在一组标准化数据集 SuperGLUE 基准 [WPN+19] 上评测 GPT-3 (其余引用为各子数据集的出处). GPT-3 在 SuperGLUE 测试集上的表现见表 3.8. few-shot 设定下, 所有任务都用 32 个示例, 从训练集随机抽取. 除 WSC 和 MultiRC 外, 每道题我们都重新抽一组示例放进上下文. 对 WSC 和 MultiRC, 我们对所有评测的题目都用同一组从训练集随机抽取的示例作为上下文.

<!-- page 19 of 75 -->

![图3.7 CoQA分数随参数量变化, 三条线为zero-shot, one-shot和K等于5的few-shot, 顶部两条虚线为微调最好水平约91和人类约89, 175B的few-shot约85, zero-shot在0.4B处短暂高于另两条线](images/p19-figure-3-7-gpt-3-results-on-coqa-reading-comprehension.png)

Figure 3.7: GPT-3 results on CoQA reading comprehension task. GPT-3 175B achieves 85 F1 in the few-shot setting, only a few points behind measured human performance and state-of-the-art fine-tuned models. Zero-shot and one-shot performance is a few points behind, with the gains to few-shot being largest for bigger models.

图 3.7: GPT-3 在 CoQA 阅读理解任务上的结果. GPT-3 175B few-shot 达到 85 F1, 只比测得的人类表现和最好的微调模型低几分. zero-shot 和 one-shot 落后几分, few-shot 的收益在更大的模型上最明显.

|  | SuperGLUE Average | BoolQ Accuracy | CB Accuracy | CB F1 | COPA Accuracy | RTE Accuracy |
| --- | --- | --- | --- | --- | --- | --- |
| Fine-tuned SOTA | 89.0 | 91.0 | 96.9 | 93.9 | 94.8 | 92.5 |
| Fine-tuned BERT-Large | 69.0 | 77.4 | 83.6 | 75.7 | 70.6 | 71.7 |
| GPT-3 Few-Shot | 71.8 | 76.4 | 75.6 | 52.0 | 92.0 | 69.0 |
|  | WiC Accuracy | WSC Accuracy | MultiRC Accuracy | MultiRC F1a | ReCoRD Accuracy | ReCoRD F1 |
| Fine-tuned SOTA | 76.1 | 93.8 | 62.3 | 88.2 | 92.5 | 93.3 |
| Fine-tuned BERT-Large | 69.6 | 64.6 | 24.1 | 70.0 | 71.3 | 72.0 |
| GPT-3 Few-Shot | 49.4 | 80.1 | 30.5 | 75.4 | 90.2 | 91.1 |

Table 3.8: Performance of GPT-3 on SuperGLUE compared to fine-tuned baselines and SOTA. All results are reported on the test set. GPT-3 few-shot is given a total of 32 examples within the context of each task and performs no gradient updates.

表 3.8: GPT-3 在 SuperGLUE 上的表现, 与微调基线和最好水平对比. 所有结果都在测试集上报告. GPT-3 few-shot 在每个任务的上下文中共拿到 32 个示例, 不做任何梯度更新.

> **回看:** 正文说 GPT-3 在 8 个任务里有 4 个超过微调 BERT-Large, 逐格对得上吗?
> 对得上. 表 3.8 里 GPT-3 few-shot 高于 BERT-Large 的是 COPA (92.0 对 70.6), WSC (80.1 对 64.6), MultiRC (准确率 30.5 对 24.1, F1a 75.4 对 70.0), ReCoRD (90.2 对 71.3); 低于它的是 BoolQ 76.4 对 77.4, CB 75.6 对 83.6, RTE 69.0 对 71.7, WiC 49.4 对 69.6. 「两个任务接近最好水平」 指 COPA 差 2.8 分, ReCoRD 差 2.3 分. 平均分 71.8 对 69.0, GPT-3 高 2.8.

<!-- page 20 of 75 -->

![SuperGLUE总分随参数量变化, K等于32, 三条线为zero-shot, one-shot和few-shot, 水平参考线自上而下为人类, 微调最好水平, 微调BERT++, 微调BERT-Large和随机猜测, 175B的few-shot超过BERT-Large线](images/p20-chart.png)

![图3.8 GPT-3 175B的SuperGLUE开发集总分随上下文示例数K变化, 横轴K取0, 1, 2, 4, 8, 16, 32, 纵轴总分, K等于0约58, K等于1约69, K等于8约71, K等于32约73, 并画出与左图相同的参考线](images/p20-figure-3-8-performance-on-superglue-increases-with.png)

Figure 3.8: Performance on SuperGLUE increases with model size and number of examples in context. A value of K = 32 means that our model was shown 32 examples per task, for 256 examples total divided across the 8 tasks in SuperGLUE. We report GPT-3 values on the dev set, so our numbers are not directly comparable to the dotted reference lines (our test set results are in Table 3.8). The BERT-Large reference model was fine-tuned on the SuperGLUE training set (125K examples), whereas BERT++ was first fine-tuned on MultiNLI (392K examples) and SWAG (113K examples) before further fine-tuning on the SuperGLUE training set (for a total of 630K fine-tuning examples). We find the difference in performance between the BERT-Large and BERT++ to be roughly equivalent to the difference between GPT-3 with one example per context versus eight examples per context.

图 3.8: SuperGLUE 上的表现随模型尺寸和上下文示例数增加而提升. K = 32 表示每个任务给模型看 32 个示例, 在 SuperGLUE 的 8 个任务上共 256 个. 我们报告的是 GPT-3 在开发集上的值, 所以数字与虚线参考线不能直接比较 (测试集结果见表 3.8). BERT-Large 参考模型在 SuperGLUE 训练集 (12.5 万条) 上微调, BERT++ 则先在 MultiNLI (39.2 万条) 和 SWAG (11.3 万条) 上微调, 再在 SuperGLUE 训练集上继续微调 (共 63 万条微调样本). 我们发现 BERT-Large 与 BERT++ 之间的差距, 大致相当于 GPT-3 每个上下文 1 个示例与 8 个示例之间的差距.

We observe a wide range in GPT-3’s performance across tasks. On COPA and ReCoRD GPT-3 achieves near-SOTA performance in the one-shot and few-shot settings, with COPA falling only a couple points short and achieving second place on the leaderboard, where first place is held by a fine-tuned 11 billion parameter model (T5). On WSC, performance is still relatively strong, achieving 80.1% in the few-shot setting (note that GPT-3 achieves 88.6% on the original Winograd dataset as described in Section 3.4). On BoolQ, MultiRC, and RTE, performance is reasonable, roughly matching that of a fine-tuned BERT-Large. On CB, we see signs of life at 75.6% in the few-shot setting.

我们观察到 GPT-3 在各任务上的表现差异很大. 在 COPA 和 ReCoRD 上, GPT-3 one-shot 和 few-shot 都接近最好水平: COPA 只差几分, 在排行榜上排第二, 第一名是一个 110 亿参数的微调模型 (T5). 在 WSC 上表现仍相对强, few-shot 达到 80.1% (注意 GPT-3 在原版 Winograd 数据集上达到 88.6%, 见 3.4 节). 在 BoolQ, MultiRC 和 RTE 上表现尚可, 大致与微调的 BERT-Large 相当. 在 CB 上, few-shot 75.6% 算是有了起色.

WiC is a notable weak spot with few-shot performance at 49.4% (at random chance). We tried a number of different phrasings and formulations for WiC (which involves determining if a word is being used with the same meaning in two sentences), none of which was able to achieve strong performance. This hints at a phenomenon that will become clearer in the next section (which discusses the ANLI benchmark) – GPT-3 appears to be weak in the few-shot or one-shot setting at some tasks that involve comparing two sentences or snippets, for example whether a word is used the same way in two sentences (WiC), whether one sentence is a paraphrase of another, or whether one sentence implies another. This could also explain the comparatively low scores for RTE and CB, which also follow this format. Despite these weaknesses, GPT-3 still outperforms a fine-tuned BERT-large on four of eight tasks and on two tasks GPT-3 is close to the state-of-the-art held by a fine-tuned 11 billion parameter model.

WiC 是明显的弱项, few-shot 只有 49.4% (相当于随机猜). 我们为 WiC (判断一个词在两个句子里是否同义) 尝试了多种措辞和形式, 没有一种能取得好成绩. 这暗示了一个下一节 (讨论 ANLI 基准) 会更清楚的现象: 在某些需要比较两个句子或片段的任务上, GPT-3 在 few-shot 或 one-shot 设定下似乎较弱, 例如判断一个词在两句中用法是否相同 (WiC), 一句是否是另一句的改写, 或一句是否蕴含另一句. 这也可能解释 RTE 和 CB 的分数相对较低, 它们也是这种格式. 尽管有这些弱点, GPT-3 仍在 8 个任务中的 4 个上超过微调的 BERT-large, 在 2 个任务上接近由 110 亿参数微调模型保持的最好水平.

Finally, we note that the few-shot SuperGLUE score steadily improves with both model size and with number of examples in the context showing increasing benefits from in-context learning (Figure 3.8). We scale K up to 32 examples per task, after which point additional examples will not reliably fit into our context. When sweeping over values of K, we find that GPT-3 requires less than eight total examples per task to outperform a fine-tuned BERT-Large on overall SuperGLUE score.

最后我们注意到, few-shot 的 SuperGLUE 分数随模型尺寸和上下文示例数都稳步提升, 说明 in-context learning 的收益在增加 (图 3.8). 我们把 K 放大到每个任务 32 个示例, 再多就无法可靠地放进上下文了. 扫描 K 的取值时我们发现, GPT-3 每个任务只需不到 8 个示例, 就能在 SuperGLUE 总分上超过微调的 BERT-Large.

## 3.8 NLI (自然语言推理)

Natural Language Inference (NLI) [Fyo00] concerns the ability to understand the relationship between two sentences. In practice, this task is usually structured as a two or three class classification problem where the model classifies whether the second sentence logically follows from the first, contradicts the first sentence, or is possibly true (neutral). SuperGLUE includes an NLI dataset, RTE, which evaluates the binary version of the task. On RTE, only the largest version of GPT-3 performs convincingly better than random (56%) in any evaluation setting, but in a few-shot setting GPT-3 performs similarly to a single-task fine-tuned BERT Large. We also evaluate on the recently introduced Adversarial Natural Language Inference (ANLI) dataset [NWD+19]. ANLI is a difficult dataset employing a series of adversarially mined natural language inference questions in three rounds (R1, R2, and R3). Similar to RTE, all of our models smaller than GPT-3 perform at almost exactly random chance on ANLI, even in the few-shot setting (∼ 33%), whereas GPT-3 itself shows signs of life on Round 3. Results for ANLI R3 are highlighted in Figure 3.9 and full results for all rounds can be found in Appendix H. These results on both RTE and ANLI suggest that NLI is still a very difficult task for language models and they are only just beginning to show signs of progress.

自然语言推理 (NLI) [Fyo00] 考察理解两个句子之间关系的能力. 实践中, 这个任务通常被组织成二分类或三分类问题: 模型判断第二句是从第一句逻辑推出, 与第一句矛盾, 还是可能为真 (中立). SuperGLUE 包含一个 NLI 数据集 RTE, 评测的是该任务的二分类版本. 在 RTE 上, 只有最大的 GPT-3 在任何评测设定下都明显好于随机 (56%), 但在 few-shot 设定下 GPT-3 与单任务微调的 BERT Large 相近. 我们还在新近提出的对抗式自然语言推理 (ANLI) 数据集 [NWD+19] 上评测. ANLI 是个难数据集, 由三轮 (R1, R2 和 R3) 对抗式挖掘出的推理题组成. 与 RTE 类似, 所有比 GPT-3 小的模型在 ANLI 上都几乎正好是随机水平, 即便在 few-shot 设定下也是如此 (约 33%), 而 GPT-3 本身在第 3 轮上有了起色. ANLI R3 的结果重点见图 3.9, 所有轮次的完整结果见附录 H. RTE 和 ANLI 上的这些结果说明, NLI 对语言模型仍是非常困难的任务, 它们才刚刚开始显露进展的迹象.

> **停一下:** 「只有最大的 GPT-3 在任何设定下都明显好于随机 (56%)」, 表 H.1 的小档真的都在 56 以下吗?
> 不全是. 表 H.1 的 RTE 行里, GPT-3 13B zero-shot 是 62.8, few-shot 是 60.6, 都高于 56; GPT-3 XL zero-shot 也有 56.0. 175B 这一档是 zero-shot 63.5, one-shot 70.4, few-shot 72.9, 只有 one-shot 和 few-shot 与小档拉开明显距离. 这句话若指 「所有设定下都稳定高出」, 13B 确实做不到, 因为它 one-shot 只有 56.3; 若按字面读成小档从没超过 56, 就与表 H.1 矛盾.

<!-- page 21 of 75 -->

![图3.9 ANLI第3轮准确率随参数量变化, 三条线为zero-shot, one-shot和K等于50的few-shot, 顶部虚线为微调最好水平, 底部虚线为随机猜测约33, 小模型都贴着随机线, 175B的few-shot升到约40](images/p21-figure-3-9-performance-of-gpt-3-on-anli-round-3-results.png)

Figure 3.9: Performance of GPT-3 on ANLI Round 3. Results are on the dev-set, which has only 1500 examples and therefore has high variance (we estimate a standard deviation of 1.2%). We find that smaller models hover around random chance, while few-shot GPT-3 175B closes almost half the gap from random chance to SOTA. Results for ANLI rounds 1 and 2 are shown in the appendix.

图 3.9: GPT-3 在 ANLI 第 3 轮上的表现. 结果来自开发集, 只有 1500 个样本, 因此方差很大 (我们估计标准差为 1.2%). 我们发现较小的模型都在随机水平附近徘徊, 而 few-shot 的 GPT-3 175B 把从随机到最好水平的差距缩小了将近一半. ANLI 第 1, 2 轮的结果见附录.

## 3.9 Synthetic and Qualitative Tasks (合成任务与定性任务)

One way to probe GPT-3’s range of abilities in the few-shot (or zero- and one-shot) setting is to give it tasks which require it to perform simple on-the-fly computational reasoning, recognize a novel pattern that is unlikely to have occurred in training, or adapt quickly to an unusual task. We devise several tasks to test this class of abilities. First, we test GPT-3’s ability to perform arithmetic. Second, we create several tasks that involve rearranging or unscrambling the letters in a word, tasks which are unlikely to have been exactly seen during training. Third, we test GPT-3’s ability to solve SAT-style analogy problems few-shot. Finally, we test GPT-3 on several qualitative tasks, including using new words in a sentence, correcting English grammar, and news article generation. We will release the synthetic datasets with the hope of stimulating further study of test-time behavior of language models.

探测 GPT-3 在 few-shot (或 zero-shot 和 one-shot) 设定下能力范围的一种办法, 是给它这样的任务: 需要做简单的即时计算推理, 识别训练中不太可能出现过的新模式, 或迅速适应一个不寻常的任务. 我们设计了几类任务来测试这类能力. 第一, 测试 GPT-3 做算术的能力. 第二, 设计几个重新排列或还原单词字母的任务, 这类任务在训练中不太可能原样出现过. 第三, 测试 GPT-3 以 few-shot 方式解 SAT 风格类比题的能力. 最后, 在几个定性任务上测试 GPT-3, 包括在句子里使用新词, 纠正英语语法, 以及生成新闻文章. 我们会发布这些合成数据集, 希望激发对语言模型推理阶段行为的进一步研究.

## 3.9.1 Arithmetic (算术)

To test GPT-3’s ability to perform simple arithmetic operations without task-specific training, we developed a small battery of 10 tests that involve asking GPT-3 a simple arithmetic problem in natural language:

为了测试 GPT-3 在没有任务专属训练的情况下做简单算术的能力, 我们设计了一小套共 10 项测试, 用自然语言向 GPT-3 提一道简单算术题:

• **2 digit addition (2D+)** – The model is asked to add two integers sampled uniformly from [0, 100), phrased in the form of a question, e.g. “Q: What is 48 plus 76? A: 124.”

• **两位数加法 (2D+)**: 让模型把两个从 [0, 100) 均匀抽取的整数相加, 以问句形式给出, 例如 「Q: 48 加 76 是多少? A: 124.」

• **2 digit subtraction (2D-)** – The model is asked to subtract two integers sampled uniformly from [0, 100); the answer may be negative. Example: “Q: What is 34 minus 53? A: -19”.

• **两位数减法 (2D-)**: 让模型把两个从 [0, 100) 均匀抽取的整数相减, 答案可能为负. 例如 「Q: 34 减 53 是多少? A: -19」.

• **3 digit addition (3D+)** – Same as 2 digit addition, except numbers are uniformly sampled from [0, 1000).

• **三位数加法 (3D+)**: 同两位数加法, 只是数从 [0, 1000) 均匀抽取.

<!-- page 22 of 75 -->

![图3.10 十项算术任务的few-shot准确率随参数量变化, 每条线一项任务, 两位数加减法与三位数加减法在175B处陡升到80到100, 四位数与五位数加减法, 两位数乘法和一位数复合运算在175B处落在约10到30, 13B的两位数加减法约50, 其余任务在13B及以下接近零](images/p22-figure-3-10-results-on-all-10-arithmetic-tasks-in-the.png)

Figure 3.10: Results on all 10 arithmetic tasks in the few-shot settings for models of different sizes. There is a significant jump from the second largest model (GPT-3 13B) to the largest model (GPT-3 175), with the latter being able to reliably accurate 2 digit arithmetic, usually accurate 3 digit arithmetic, and correct answers a significant fraction of the time on 4-5 digit arithmetic, 2 digit multiplication, and compound operations. Results for one-shot and zero-shot are shown in the appendix.

图 3.10: 不同尺寸模型在 few-shot 设定下全部 10 项算术任务的结果. 从第二大的模型 (GPT-3 13B) 到最大的模型 (GPT-3 175) 有一个显著跃升, 后者能可靠地做对两位数算术, 通常能做对三位数算术, 在四到五位数算术, 两位数乘法和复合运算上也有相当比例能答对. one-shot 和 zero-shot 的结果见附录.

• **3 digit subtraction (3D-)** – Same as 2 digit subtraction, except numbers are uniformly sampled from [0, 1000).

• **三位数减法 (3D-)**: 同两位数减法, 只是数从 [0, 1000) 均匀抽取.

• **4 digit addition (4D+)** – Same as 3 digit addition, except uniformly sampled from [0, 10000).

• **四位数加法 (4D+)**: 同三位数加法, 只是从 [0, 10000) 均匀抽取.

• **4 digit subtraction (4D-)** – Same as 3 digit subtraction, except uniformly sampled from [0, 10000).

• **四位数减法 (4D-)**: 同三位数减法, 只是从 [0, 10000) 均匀抽取.

• **5 digit addition (5D+)** – Same as 3 digit addition, except uniformly sampled from [0, 100000).

• **五位数加法 (5D+)**: 同三位数加法, 只是从 [0, 100000) 均匀抽取.

• **5 digit subtraction (5D-)** – Same as 3 digit subtraction, except uniformly sampled from [0, 100000).

• **五位数减法 (5D-)**: 同三位数减法, 只是从 [0, 100000) 均匀抽取.

• **2 digit multiplication (2Dx)** – The model is asked to multiply two integers sampled uniformly from [0, 100), e.g. “Q: What is 24 times 42? A: 1008”.

• **两位数乘法 (2Dx)**: 让模型把两个从 [0, 100) 均匀抽取的整数相乘, 例如 「Q: 24 乘 42 是多少? A: 1008」.

• **One-digit composite (1DC)** – The model is asked to perform a composite operation on three 1 digit numbers, with parentheses around the last two. For example, “Q: What is 6+(4\*8)? A: 38”. The three 1 digit numbers are selected uniformly on [0, 10) and the operations are selected uniformly from {+,-,\*}.

• **一位数复合运算 (1DC)**: 让模型对三个一位数做复合运算, 后两个数带括号. 例如 「Q: 6+(4*8) 是多少? A: 38」. 三个一位数从 [0, 10) 均匀抽取, 运算从 {+,-,*} 中均匀抽取.

In all 10 tasks the model must generate the correct answer exactly. For each task we generate a dataset of 2,000 random instances of the task and evaluate all models on those instances.

全部 10 项任务都要求模型精确生成正确答案. 每项任务我们生成 2,000 个随机实例, 所有模型都在这些实例上评测.

First we evaluate GPT-3 in the few-shot setting, for which results are shown in Figure 3.10. On addition and subtraction, GPT-3 displays strong proficiency when the number of digits is small, achieving 100% accuracy on 2 digit addition, 98.9% at 2 digit subtraction, 80.2% at 3 digit addition, and 94.2% at 3-digit subtraction. Performance decreases as the number of digits increases, but GPT-3 still achieves 25-26% accuracy on four digit operations and 9-10% accuracy on five digit operations, suggesting at least some capacity to generalize to larger numbers of digits. GPT-3 also achieves 29.2% accuracy at 2 digit multiplication, an especially computationally intensive operation. Finally, GPT-3 achieves 21.3% accuracy at single digit combined operations (for example, 9\*(7+5)), suggesting that it has some robustness beyond just single operations.

我们先在 few-shot 设定下评测 GPT-3, 结果见图 3.10. 在加减法上, 位数少时 GPT-3 表现很熟练: 两位数加法准确率 100%, 两位数减法 98.9%, 三位数加法 80.2%, 三位数减法 94.2%. 位数增加时表现下降, 但 GPT-3 在四位数运算上仍有 25-26% 的准确率, 在五位数运算上有 9-10%, 说明它至少有一些泛化到更多位数的能力. GPT-3 在两位数乘法这一计算量尤其大的运算上也有 29.2% 的准确率. 最后, GPT-3 在一位数复合运算 (例如 9*(7+5)) 上有 21.3% 的准确率, 说明它的稳健性不止于单步运算.

As Figure 3.10 makes clear, small models do poorly on all of these tasks – even the 13 billion parameter model (the second largest after the 175 billion full GPT-3) can solve 2 digit addition and subtraction only half the time, and all other operations less than 10% of the time.

如图 3.10 所示, 小模型在所有这些任务上都做得很差: 即便是 130 亿参数的模型 (仅次于 1750 亿参数的完整 GPT-3 的第二大模型), 两位数加减法也只能做对一半, 其他运算都不到 10%.

One-shot and zero-shot performance are somewhat degraded relative to few-shot performance, suggesting that adaptation to the task (or at the very least recognition of the task) is important to performing these computations correctly. Nevertheless, one-shot performance is still quite strong, and even zero-shot performance of the full GPT-3 significantly outperforms few-shot learning for all smaller models. All three settings for the full GPT-3 are shown in Table 3.9, and model capacity scaling for all three settings is shown in Appendix H.

one-shot 和 zero-shot 的表现比 few-shot 有所下降, 说明适应任务 (或者至少认出任务) 对正确完成这些计算很重要. 尽管如此, one-shot 表现仍然相当强, 完整 GPT-3 甚至 zero-shot 都明显超过所有更小模型的 few-shot. 完整 GPT-3 在三种设定下的结果见表 3.9, 三种设定下随模型容量的变化见附录 H.

<!-- page 23 of 75 -->

| Setting | 2D+ | 2D- | 3D+ | 3D- | 4D+ | 4D- | 5D+ | 5D- | 2Dx | 1DC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-3 Zero-shot | 76.9 | 58.0 | 34.2 | 48.3 | 4.0 | 7.5 | 0.7 | 0.8 | 19.8 | 9.8 |
| GPT-3 One-shot | 99.6 | 86.4 | 65.5 | 78.7 | 14.0 | 14.0 | 3.5 | 3.8 | 27.4 | 14.3 |
| GPT-3 Few-shot | 100.0 | 98.9 | 80.4 | 94.2 | 25.5 | 26.8 | 9.3 | 9.9 | 29.2 | 21.3 |

Table 3.9: Results on basic arithmetic tasks for GPT-3 175B. {2,3,4,5}D{+,-} is 2, 3, 4, and 5 digit addition or subtraction, 2Dx is 2 digit multiplication. 1DC is 1 digit composite operations. Results become progressively stronger moving from the zero-shot to one-shot to few-shot setting, but even the zero-shot shows significant arithmetic abilities.

表 3.9: GPT-3 175B 在基本算术任务上的结果. {2,3,4,5}D{+,-} 是 2, 3, 4, 5 位数的加法或减法, 2Dx 是两位数乘法, 1DC 是一位数复合运算. 从 zero-shot 到 one-shot 再到 few-shot, 结果逐步变强, 但即便 zero-shot 也显示出可观的算术能力.

> **再看:** 正文说 few-shot 三位数加法 80.2%, 与表 3.9 一致吗?
> 差 0.2. 表 3.9 few-shot 一行的 3D+ 是 80.4, 正文写 80.2; 其余几格对得上: 2D+ 100.0, 2D- 98.9, 3D- 94.2, 2Dx 29.2, 1DC 21.3. 「四位数 25-26%」 对应 4D+ 25.5 和 4D- 26.8, 后者四舍五入是 27; 「五位数 9-10%」 对应 9.3 和 9.9. 这张表只有 175B 一档, 各小档的算术分数要看图 3.10 和附录图 H.4.

| Setting | CL | A1 | A2 | RI | RW |
| --- | --- | --- | --- | --- | --- |
| GPT-3 Zero-shot | 3.66 | 2.28 | 8.91 | 8.26 | 0.09 |
| GPT-3 One-shot | 21.7 | 8.62 | 25.9 | 45.4 | 0.48 |
| GPT-3 Few-shot | 37.9 | 15.1 | 39.7 | 67.2 | 0.44 |

Table 3.10: GPT-3 175B performance on various word unscrambling and word manipulation tasks, in zero-, one-, and few-shot settings. CL is “cycle letters in word”, A1 is anagrams of but the first and last letters, A2 is anagrams of all but the first and last two letters, RI is “Random insertion in word”, RW is “reversed words”.

表 3.10: GPT-3 175B 在各种还原单词和单词变换任务上 zero-shot, one-shot 和 few-shot 的表现. CL 是 「单词字母循环移位」, A1 是 「除首尾字母外全部打乱」, A2 是 「除首尾各两个字母外全部打乱」, RI 是 「单词中随机插入字符」, RW 是 「单词倒写」.

To spot-check whether the model is simply memorizing specific arithmetic problems, we took the 3-digit arithmetic problems in our test set and searched for them in our training data in both the forms "&lt;NUM1&gt; + &lt;NUM2&gt; =" and "&lt;NUM1&gt; plus &lt;NUM2&gt;". Out of 2,000 addition problems we found only 17 matches (0.8%) and out of 2,000 subtraction problems we found only 2 matches (0.1%), suggesting that only a trivial fraction of the correct answers could have been memorized. In addition, inspection of incorrect answers reveals that the model often makes mistakes such as not carrying a “1”, suggesting it is actually attempting to perform the relevant computation rather than memorizing a table.

为了抽查模型是不是只是记住了具体的算术题, 我们把测试集里的三位数算术题拿到训练数据里, 以 「<NUM1> + <NUM2> =」 和 「<NUM1> plus <NUM2>」 两种形式搜索. 2,000 道加法题只找到 17 处匹配 (0.8%), 2,000 道减法题只找到 2 处 (0.1%), 说明正确答案里只有微不足道的一部分可能是背下来的. 此外, 检查错误答案发现, 模型常犯忘记进 「1」 这类错误, 说明它确实在尝试做相应的计算, 而不是在背一张表.

> **对一下:** 17 除以 2,000 是 0.8% 吗?
> 17 除以 2000 等于 0.85% (估算), 正文写成 0.8%, 属于截断而不是四舍五入; 减法 2 除以 2000 正好 0.1%. 这一抽查只覆盖三位数题, 且只搜两种字面格式, 而表 3.9 显示三位数加法 few-shot 80.4%, 远高于 0.85% 的可能背题比例, 这是本段 「只有微不足道的一部分」 的依据.

Overall, GPT-3 displays reasonable proficiency at moderately complex arithmetic in few-shot, one-shot, and even zero-shot settings.

总的来说, GPT-3 在 few-shot, one-shot 乃至 zero-shot 设定下, 都对中等复杂度的算术表现出了说得过去的熟练度.

## 3.9.2 Word Scrambling and Manipulation Tasks (单词打乱与变换任务)

To test GPT-3’s ability to learn novel symbolic manipulations from a few examples, we designed a small battery of 5 “character manipulation” tasks. Each task involves giving the model a word distorted by some combination of scrambling, addition, or deletion of characters, and asking it to recover the original word. The 5 tasks are:

为了测试 GPT-3 从几个例子中学会新的符号操作的能力, 我们设计了一小套共 5 项 「字符操作」 任务. 每项任务给模型一个经过打乱, 增加或删除字符组合扭曲的单词, 让它还原原词. 这 5 项任务是:

• **Cycle letters in word (CL)** – The model is given a word with its letters cycled, then the “=” symbol, and is expected to generate the original word. For example, it might be given “lyinevitab” and should output “inevitably”.

• **单词字母循环移位 (CL)**: 给模型一个字母被循环移位的单词, 接着是 「=」 符号, 期望它生成原词. 例如给出 「lyinevitab」, 应输出 「inevitably」.

• **Anagrams of all but first and last characters (A1)** – The model is given a word where every letter except the first and last have been scrambled randomly, and must output the original word. Example: criroptuon = corruption.

• **除首尾字符外全部打乱 (A1)**: 给模型一个除首尾字母外其余字母都被随机打乱的单词, 要求输出原词. 例: criroptuon = corruption.

• **Anagrams of all but first and last 2 characters (A2)** – The model is given a word where every letter except the first 2 and last 2 have been scrambled randomly, and must recover the original word. Example: opoepnnt → opponent.

• **除首尾各 2 个字符外全部打乱 (A2)**: 给模型一个除开头 2 个和结尾 2 个字母外其余都被随机打乱的单词, 要求还原原词. 例: opoepnnt → opponent.

• **Random insertion in word (RI)** – A random punctuation or space character is inserted between each letter of a word, and the model must output the original word. Example: s.u!c/c!e.s s i/o/n = succession.

• **单词中随机插入 (RI)**: 在单词每两个字母之间插入一个随机的标点或空格, 要求模型输出原词. 例: s.u!c/c!e.s s i/o/n = succession.

• **Reversed words (RW)** – The model is given a word spelled backwards, and must output the original word. Example: stcejbo → objects.

• **单词倒写 (RW)**: 给模型一个倒着拼写的单词, 要求输出原词. 例: stcejbo → objects.

For each task we generate 10,000 examples, which we chose to be the top 10,000 most frequent words as measured by [Nor09] of length more than 4 characters and less than 15 characters. The few-shot results are shown in Figure 3.11. Task performance tends to grow smoothly with model size, with the full GPT-3 model achieving 66.9% on removing random insertions, 38.6% on cycling letters, 40.2% on the easier anagram task, and 15.1% on the more difficult anagram task (where only the first and last letters are held fixed). None of the models can reverse the letters in a word.

每项任务我们生成 10,000 个样本, 取 [Nor09] 统计的长度大于 4 个字符且小于 15 个字符的最常用 10,000 个单词. few-shot 结果见图 3.11. 任务表现往往随模型尺寸平滑增长, 完整的 GPT-3 在去除随机插入上达到 66.9%, 字母循环移位 38.6%, 较易的打乱任务 40.2%, 较难的打乱任务 (只固定首尾字母) 15.1%. 没有一个模型能把单词的字母倒回来.

> **想:** 这一段的 66.9, 38.6, 40.2, 与表 3.10 few-shot 一行为什么不一样?
> 表 3.10 的 few-shot 是 RI 67.2, CL 37.9, A2 39.7, A1 15.1. 正文的前三个数反倒与附录表 C.1 一致: Symbol Insertion 66.9, Cycled Letters 38.6, Anagrams 2 40.2; C.1 的 Anagrams 1 却是 15.0, 又与正文的 15.1 不同. 本文没有说明两张表是否来自不同的评测批次, 引用时最好注明取的是表 3.10 还是表 C.1.

<!-- page 24 of 75 -->

![图3.11 五项单词操作任务的few-shot准确率随参数量变化, K等于100, 随机插入一条在175B处陡升到约67, 字母循环和较易打乱约40, 较难打乱约15, 单词倒写始终贴近零](images/p24-figure-3-11-few-shot-performance-on-the-five-word.png)

Figure 3.11: Few-shot performance on the five word scrambling tasks for different sizes of model. There is generally smooth improvement with model size although the random insertion task shows an upward slope of improvement with the 175B model solving the task the majority of the time. Scaling of one-shot and zero-shot performance is shown in the appendix. All tasks are done with K = 100.

图 3.11: 不同尺寸模型在五项单词打乱任务上的 few-shot 表现. 总体上随模型尺寸平滑提升, 随机插入任务则在 175B 上出现上扬, 该模型大多数时候都能解出. one-shot 和 zero-shot 的规模变化见附录. 所有任务都用 K = 100.

In the one-shot setting, performance is significantly weaker (dropping by half or more), and in the zero-shot setting the model can rarely perform any of the tasks (Table 3.10). This suggests that the model really does appear to learn these tasks at test time, as the model cannot perform them zero-shot and their artificial nature makes them unlikely to appear in the pre-training data (although we cannot confirm this with certainty).

在 one-shot 设定下, 表现明显变弱 (降一半或更多), 在 zero-shot 设定下, 模型几乎做不了任何一项任务 (表 3.10). 这说明模型看起来确实是在推理阶段学会这些任务的: 它做不了 zero-shot, 而这些任务的人工性质使它们不太可能出现在预训练数据里 (虽然我们无法完全确定这一点).

> **问:** one-shot 相对 few-shot 「降一半或更多」, 表 3.10 的五项里有几项做到?
> 按表 3.10 算, 一项都没有降到一半以下. CL 从 37.9 到 21.7, 降约 43%; A1 从 15.1 到 8.62, 降约 43%; A2 从 39.7 到 25.9, 降约 35%; RI 从 67.2 到 45.4, 降约 32% (均为估算); RW 从 0.44 到 0.48 基本不变. 真正 「降一半以上」 的是 one-shot 到 zero-shot 这一步, 例如 RI 从 45.4 掉到 8.26.

We can further quantify performance by plotting “in-context learning curves”, which show task performance as a function of the number of in-context examples. We show in-context learning curves for the Symbol Insertion task in Figure 1.2. We can see that larger models are able to make increasingly effective use of in-context information, including both task examples and natural language task descriptions.

我们还可以画出 「in-context learning 曲线」 来进一步量化表现, 它显示任务表现随上下文示例数的变化. 符号插入任务的 in-context learning 曲线见图 1.2. 可以看到, 更大的模型能越来越有效地利用上下文信息, 包括任务示例和自然语言任务描述.

Finally, it is worth adding that solving these tasks requires character-level manipulations, whereas our BPE encoding operates on significant fractions of a word (on average ∼ 0.7 words per token), so from the LM’s perspective succeeding at these tasks involves not just manipulating BPE tokens but understanding and pulling apart their substructure. Also, CL, A1, and A2 are not bijective (that is, the unscrambled word is not a deterministic function of the scrambled word), requiring the model to perform some search to find the correct unscrambling. Thus, the skills involved appear to require non-trivial pattern-matching and computation.

最后值得补充的是, 解这些任务需要字符级操作, 而我们的 BPE 编码作用在单词的较大片段上 (平均每个 token 约 0.7 个词), 所以从语言模型的角度看, 做成这些任务不只是操作 BPE token, 还要理解并拆开它们的内部结构. 另外, CL, A1 和 A2 都不是双射 (还原后的词不是打乱后的词的确定函数), 要求模型做一定搜索才能找到正确的还原. 因此这些任务涉及的技能看来需要不简单的模式匹配和计算.

## 3.9.3 SAT Analogies (SAT 类比题)

To test GPT-3 on another task that is somewhat unusual relative to the typical distribution of text, we collected a set of 374 “SAT analogy” problems [TLBS03]. Analogies are a style of multiple choice question that constituted a section of the SAT college entrance exam before 2005. A typical example is “audacious is to boldness as (a) sanctimonious is to hypocrisy, (b) anonymous is to identity, (c) remorseful is to misdeed, (d) deleterious is to result, (e) impressionable is to temptation”. The student is expected to choose which of the five word pairs has the same relationship as the original word pair; in this example the answer is “sanctimonious is to hypocrisy”. On this task GPT-3 achieves 65.2% in the few-shot setting, 59.1% in the one-shot setting, and 53.7% in the zero-shot setting, whereas the average score among college applicants was 57% [TL05] (random guessing yields 20%). As shown in Figure 3.12, the results improve with scale, with the the full 175 billion model improving by over 10% compared to the 13 billion parameter model.

为了在另一个相对于典型文本分布有些不寻常的任务上测试 GPT-3, 我们收集了 374 道 「SAT 类比」 题 [TLBS03]. 类比题是一种多项选择题, 2005 年以前是 SAT 大学入学考试的一部分. 典型例子是 "audacious 之于 boldness, 如同 (a) sanctimonious 之于 hypocrisy, (b) anonymous 之于 identity, (c) remorseful 之于 misdeed, (d) deleterious 之于 result, (e) impressionable 之于 temptation「. 考生要选出五个词对中哪一个与原词对关系相同, 本例答案是 」sanctimonious 之于 hypocrisy". GPT-3 在这个任务上 few-shot 65.2%, one-shot 59.1%, zero-shot 53.7%, 而大学申请者的平均分是 57% [TL05] (随机猜是 20%). 如图 3.12 所示, 结果随规模提升, 完整的 1750 亿参数模型比 130 亿参数模型高 10% 以上.

<!-- page 25 of 75 -->

![图3.12 SAT类比题准确率随参数量变化, 三条线为zero-shot, one-shot和K等于20的few-shot, 13B及以下三条线交织在一起, 175B处分开, few-shot约65, one-shot约59, zero-shot约54](images/p25-figure-3-12-zero-one-and-few-shot-performance-on-sat.png)

Figure 3.12: Zero-, one-,and few-shot performance on SAT analogy tasks, for different sizes of model. The largest model achieves 65% accuracy in the few-shot setting, and also demonstrates significant gains to in-context learning which are not present in smaller models.

图 3.12: 不同尺寸模型在 SAT 类比任务上 zero-shot, one-shot 和 few-shot 的表现. 最大的模型 few-shot 达到 65% 准确率, 并显示出小模型身上没有的显著 in-context learning 收益.

## 3.9.4 News Article Generation (新闻文章生成)

Previous work on generative language models qualitatively tested their ability to generate synthetic “news articles” by conditional sampling from the model given a human-written prompt consisting of a plausible first sentence for a news story [RWC+19]. Relative to [RWC+19], the dataset used to train GPT-3 is much less weighted towards news articles, so trying to generate news articles via raw unconditional samples is less effective – for example GPT-3 often interprets the proposed first sentence of a “news article” as a tweet and then posts synthetic responses or follow-up tweets. To solve this problem we employed GPT-3’s few-shot learning abilities by providing three previous news articles in the model’s context to condition it. With the title and subtitle of a proposed next article, the model is able to reliably generate short articles in the “news” genre.

以往关于生成式语言模型的工作, 定性地测试了它们生成合成 「新闻文章」 的能力: 给模型一段人写的提示, 即一则新闻故事的一个合理的开头句, 再做条件采样 [RWC+19]. 与 [RWC+19] 相比, 训练 GPT-3 的数据集里新闻文章的比重低得多, 所以直接用原始无条件采样生成新闻文章效果较差, 例如 GPT-3 常把给出的 「新闻文章」 开头句理解成一条推文, 然后接着发合成的回复或后续推文. 为了解决这个问题, 我们利用 GPT-3 的 few-shot 学习能力, 在模型上下文里放三篇之前的新闻文章作为条件. 给出下一篇文章的标题和副标题后, 模型就能稳定地生成 「新闻」 体裁的短文.

To gauge the quality of news article generation from GPT-3 (which we believe is likely to be correlated with conditional sample generation quality in general), we decided to measure human ability to distinguish GPT-3-generated articles from real ones. Similar work has been carried out by Kreps et al. [KMB20] and Zellers et al. [ZHR+19]. Generative language models are trained to match the distribution of content generated by humans, so the (in)ability of humans to distinguish the two is a potentially important measure of quality.

为了衡量 GPT-3 生成新闻文章的质量 (我们认为它很可能与一般条件采样的质量相关), 我们决定测量人区分 GPT-3 生成文章与真实文章的能力. Kreps 等人 [KMB20] 和 Zellers 等人 [ZHR+19] 做过类似工作. 生成式语言模型的训练目标是匹配人类所写内容的分布, 所以人能否区分两者, 是一个可能很重要的质量衡量.

In order to see how well humans can detect model generated text, we arbitrarily selected 25 article titles and subtitles from the website newser.com (mean length: 215 words). We then generated completions of these titles and subtitles from four language models ranging in size from 125M to 175B (GPT-3) parameters (mean length: 200 words). For each model, we presented around 80 US-based participants with a quiz consisting of these real titles and subtitles followed by either the human written article or the article generated by the model<sup>4</sup>. Participants were asked to select whether the article was “very likely written by a human”, “more likely written by a human”, “I don’t know”, “more likely written by a machine”, or “very likely written by a machine”.

为了看人能多好地识别模型生成的文本, 我们从 newser.com 网站随意选了 25 个文章标题和副标题 (平均长度 215 词). 然后用四个语言模型生成这些标题和副标题的补全, 模型尺寸从 125M 到 175B (GPT-3) 参数不等 (平均长度 200 词). 对每个模型, 我们给约 80 名美国参与者做一份测验, 内容是这些真实的标题和副标题, 后面跟着人写的文章或模型生成的文章 (脚注 4). 参与者要选择文章是 「很可能是人写的」, 「更可能是人写的」, 「我不知道」, 「更可能是机器写的」, 还是 「很可能是机器写的」.

The articles we selected were not in the models’ training data and the model outputs were formatted and selected programmatically to prevent human cherry-picking. All models used the same context to condition outputs on and were pre-trained with the same context size and the same article titles and subtitles were used as prompts for each model. However, we also ran an experiment to control for participant effort and attention that followed the same format but involved intentionally bad model generated articles. This was done by generating articles from a “control model”: a 160M parameter model with no context and increased output randomness.

我们选的文章不在模型的训练数据里, 模型输出由程序排版和挑选, 避免人工挑拣. 所有模型都以相同的上下文为条件生成输出, 用相同的上下文长度预训练, 每个模型也都用相同的文章标题和副标题作为提示. 此外, 我们还做了一组控制参与者投入程度和注意力的实验, 格式相同, 但用的是故意做差的模型生成文章. 做法是用一个 「对照模型」 生成文章: 一个 160M 参数的模型, 不给上下文, 并提高输出随机性.

> **核对:** 对照模型是 160M 参数, 还是 GPT-3 Small?
> 两处说法不同. 这一段写 「160M 参数的模型」, 表 3.11, 表 3.12 和图 3.13 的图注都写 「无条件的 GPT-3 Small, 提高输出随机性」, 而表 2.1 里 GPT-3 Small 是 125M. 上一段还说用 「四个语言模型, 从 125M 到 175B」, 表 3.11 却列了 GPT-3 Small 到 GPT-3 175B 共 8 档加对照组, 附录表 E.1 同样是 9 行. 按表格口径, 实验覆盖的是表 2.1 的全部 8 个模型.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>This task is also relevant to the potential misuse of language models discussed in Section 6.1.</span></small>

脚注 3: 这个任务也与第 6.1 节讨论的语言模型潜在滥用有关.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>We wanted to identify how good an average person on the internet is at detecting language model outputs, so we focused on participants drawn from the general US population. See Appendix E for details.</span></small>

脚注 4: 我们想知道互联网上的普通人识别语言模型输出的能力有多强, 所以参与者取自美国普通人群. 细节见附录 E.

<!-- page 26 of 75 -->

|  | Mean accuracy | 95% Confidence Interval (low, hi) | t compared to control (p-value) | "I don't know" assignments |
| --- | --- | --- | --- | --- |
| Control (deliberately bad model) | 86% | 83%-90% | - | 3.6 % |
| GPT-3 Small | 76% | 72%-80% | 3.9 (2e-4) | 4.9% |
| GPT-3 Medium | 61% | 58%-65% | 10.3 (7e-21) | 6.0% |
| GPT-3 Large | 68% | 64%-72% | 7.3 (3e-11) | 8.7% |
| GPT-3 XL | 62% | 59%-65% | 10.7 (1e-19) | 7.5% |
| GPT-3 2.7B | 62% | 58%-65% | 10.4 (5e-19) | 7.1% |
| GPT-3 6.7B | 60% | 56%-63% | 11.2 (3e-21) | 6.2% |
| GPT-3 13B | 55% | 52%-58% | 15.3 (1e-32) | 7.1% |
| GPT-3 175B | 52% | 49%-54% | 16.9 (1e-34) | 7.8% |

Table 3.11: Human accuracy in identifying whether short (∼200 word) news articles are model generated. We find that human accuracy (measured by the ratio of correct assignments to non-neutral assignments) ranges from 86% on the control model to 52% on GPT-3 175B. This table compares mean accuracy between five different models, and shows the results of a two-sample T-Test for the difference in mean accuracy between each model and the control model (an unconditional GPT-3 Small model with increased output randomness).

表 3.11: 人识别短篇 (约 200 词) 新闻文章是否为模型生成的准确率. 我们发现人的准确率 (以正确判断数占非中立判断数的比例衡量) 从对照模型上的 86% 降到 GPT-3 175B 上的 52%. 该表比较了五个不同模型的平均准确率, 并给出每个模型与对照模型平均准确率之差的双样本 T 检验结果 (对照模型是一个提高输出随机性的无条件 GPT-3 Small).

> **看表:** 表注说比较 「五个不同模型」, 表 3.11 的 t 值随尺寸是单调的吗?
> 表里实际是对照组加 GPT-3 Small 到 175B 共 8 个模型, 不是五个. 平均准确率并不单调: GPT-3 Medium 61%, GPT-3 Large 反而升到 68%, GPT-3 XL 62%, GPT-3 2.7B 62%, 之后 6.7B 60%, 13B 55%, 175B 52%; t 值相应是 10.3, 7.3, 10.7, 10.4, 11.2, 15.3, 16.9. 所以图 3.13 的幂律拟合描述的是整体趋势, Medium 到 Large 这一段是逆着走的.

Mean human accuracy (the ratio of correct assignments to non-neutral assignments per participant) at detecting that the intentionally bad articles were model generated was ∼ 86% where 50% is chance level performance. By contrast, mean human accuracy at detecting articles that were produced by the 175B parameter model was barely above chance at ∼ 52% (see Table 3.11).<sup>5</sup> Human abilities to detect model generated text appear to decrease as model size increases: there appears to be a trend towards chance accuracy with model size, and human detection of GPT-3 is close to chance.<sup>6</sup> This is true despite the fact that participants spend more time on each output as model size increases (see Appendix E).

人识别故意做差的文章为模型生成的平均准确率 (每个参与者正确判断数占非中立判断数的比例) 约为 86%, 50% 是随机水平. 相比之下, 人识别 175B 参数模型所生成文章的平均准确率只是勉强高于随机, 约 52% (见表 3.11, 脚注 5). 人识别模型生成文本的能力看来随模型尺寸增大而下降: 随着模型变大, 准确率有趋向随机的趋势, 人对 GPT-3 的识别接近随机 (脚注 6). 尽管随着模型变大, 参与者在每篇输出上花的时间更多 (见附录 E), 情况依然如此.

Examples of synthetic articles from GPT-3 are given in Figures 3.14 and 3.15.<sup>7</sup> Much of the text is—as indicated by the evaluations—difficult for humans to distinguish from authentic human content. Factual inaccuracies can be an indicator that an article is model generated since, unlike human authors, the models have no access to the specific facts that the article titles refer to or when the article was written. Other indicators include repetition, non sequiturs, and unusual phrasings, though these are often subtle enough that they are not noticed.

GPT-3 生成的合成文章示例见图 3.14 和图 3.15 (脚注 7). 正如评测所示, 其中大部分文本人很难与真实的人写内容区分开. 事实错误可以是文章由模型生成的一个迹象, 因为与人类作者不同, 模型无法获得文章标题所指的具体事实, 也不知道文章写于何时. 其他迹象包括重复, 前后不连贯和不寻常的措辞, 不过这些往往足够隐蔽, 不会被注意到.

Related work on language model detection by Ippolito et al. [IDCBE19] indicates that automatic discriminators like G R O V E R [ZHR+19] and GLTR [GSR19] may have greater success at detecting model generated text than human evaluators. Automatic detection of these models may be a promising area of future research.

Ippolito 等人 [IDCBE19] 关于语言模型检测的相关工作表明, GROVER [ZHR+19] 和 GLTR [GSR19] 这类自动判别器识别模型生成文本的成功率可能比人类评估者更高. 对这些模型的自动检测可能是未来研究的一个有前景的方向.

Ippolito et al. [IDCBE19] also note that human accuracy at detecting model generated text increases as humans observe more tokens. To do a preliminary investigation of how good humans are at detecting longer news articles generated by GPT-3 175B, we selected 12 world news articles from Reuters with an average length of 569 words and generated completions of these articles from GPT-3 with an average length of 498 words (298 words longer than our initial experiments). Following the methodology above, we ran two experiments, each on around 80 US-based participants, to compare human abilities to detect the articles generated by GPT-3 and a control model.

Ippolito 等人 [IDCBE19] 还指出, 人识别模型生成文本的准确率随看到的 token 增多而提高. 为了初步考察人识别 GPT-3 175B 生成的较长新闻文章的能力, 我们从路透社选了 12 篇国际新闻, 平均长度 569 词, 用 GPT-3 生成这些文章的补全, 平均长度 498 词 (比最初的实验长 298 词). 按照上面的方法, 我们做了两个实验, 每个约 80 名美国参与者, 比较人识别 GPT-3 与对照模型所生成文章的能力.

We found that mean human accuracy at detecting the intentionally bad longer articles from the control model was ∼ 88%, while mean human accuracy at detecting the longer articles that were produced by GPT-3 175B was still barely above chance at ∼ 52% (see Table 3.12). This indicates that, for news articles that are around 500 words long, GPT-3 continues to produce articles that humans find difficult to distinguish from human written news articles.

我们发现, 人识别对照模型生成的故意做差的长文章的平均准确率约为 88%, 而识别 GPT-3 175B 生成的长文章的平均准确率仍只是勉强高于随机, 约 52% (见表 3.12). 这表明对于 500 词左右的新闻文章, GPT-3 生成的文章依然让人难以与人写的新闻区分开.

## 3.9.5 Learning and Using Novel Words (学习并使用新词)

A task studied in developmental linguistics [CB78] is the ability to learn and utilize new words, for example using a word in a sentence after seeing it defined only once, or conversely inferring a word’s meaning from only one usage. Here we qualitatively test GPT-3’s ability to do the former. Specifically, we give GPT-3 the definition of a nonexistent word, such as “Gigamuru”, and then ask it to use it in a sentence. We provide one to five previous examples of a (separate) nonexistent word being defined and used in a sentence, so the task is few-shot in terms of previous examples of the broad task and one-shot in terms of the specific word. Table 3.16 shows the 6 examples we generated; all definitions were human-generated, and the first answer was human-generated as conditioning while the subsequent answers were generated by GPT-3. These examples were generated continuously in one sitting and we did not omit or repeatedly try any prompts. In all cases the generated sentence appears to be a correct or at least plausible use of the word. In the final sentence the model generates a plausible conjugation for the word “screeg” (namely “screeghed”), although the use of the word is slightly awkward (“screeghed at each other”) despite being plausible in the sense that it could describe a toy sword fight. Overall, GPT-3 appears to be at least proficient at the task of using novel words in a sentence.

发展语言学研究的一项任务 [CB78] 是学习并使用新词的能力, 例如只看过一次定义就在句子里使用一个词, 或者反过来只看一次用法就推断出词义. 这里我们定性地测试 GPT-3 做前者的能力. 具体来说, 我们给 GPT-3 一个不存在的词的定义, 例如 「Gigamuru」, 然后让它在句子里用这个词. 我们先给一到五个示例, 每个示例是另一个不存在的词被定义并用在句子里, 所以就这类宽泛任务的示例而言是 few-shot, 就具体这个词而言是 one-shot. 表 3.16 给出了我们生成的 6 个例子; 所有定义都是人写的, 第一个回答也由人写好作为条件, 后面的回答则由 GPT-3 生成. 这些例子是一次坐下来连续生成的, 我们没有删掉或反复重试任何提示. 在所有情况下, 生成的句子看来都是这个词正确或至少说得通的用法. 在最后一句里, 模型为 「screeg」 生成了一个说得通的变位 (「screeghed」), 虽然这个词的用法略显别扭 (「screeghed at each other」), 但从可以描述一场玩具剑打斗的角度看也说得通. 总的来说, GPT-3 看来至少能胜任在句子里使用新词的任务.

> **拆开:** 正文说 「表 3.16 给出 6 个例子」, 这 6 个例子在哪, 其中几个是 GPT-3 写的?
> 本文没有表 3.16, 对应的是图 3.16 那个代码块. 里面依次是 whatpu, farduddle, yalubalu, Burringo, Gigamuru, screeg 六个生造词. 按图 3.16 图注和本段, 第一个 whatpu 的定义和例句都由人给出, 后五个的例句由 GPT-3 续写. 本版代码块没有保留粗体, 看不出哪段是模型输出, 只能按这个顺序来区分.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>We use a two-sample Student’s T-Test to test for significant difference between the means of the participant accuracies of each model and the control model and report the normalized difference in the means (as the t-statistic) and the p-value.</span></small>

脚注 5: 我们用双样本 Student T 检验, 检验各模型与对照模型的参与者准确率均值是否有显著差异, 并报告均值的归一化差 (即 t 统计量) 和 p 值.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>If a model consistently produces texts that are more impressive than human articles, it is possible that human performance on this task would drop below 50%. Indeed, many individual participants scored below 50% on this task.</span></small>

脚注 6: 如果一个模型持续生成比人写文章更令人信服的文本, 人在这个任务上的表现可能跌到 50% 以下. 事实上, 许多参与者个人在这个任务上的得分确实低于 50%.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>Additional non-news samples can be found in Appendix F.</span></small>

脚注 7: 更多非新闻样本见附录 F.

<!-- page 27 of 75 -->

Human ability to detect model generated news articles

人识别模型生成新闻文章的能力 (图题).

![图3.13 人识别模型生成新闻的准确率随参数量下降, 横轴是参数量取对数, 纵轴是准确率, 顶部虚线为故意做差的对照模型86%, 底部虚线为随机50%, 各点连成折线, 另有一条带95%置信带的幂律拟合线, 175B处约52%](images/p27-figure-3-13-people-s-ability-to-identify-whether-news.png)

Figure 3.13: People’s ability to identify whether news articles are model-generated (measured by the ratio of correct assignments to non-neutral assignments) decreases as model size increases. Accuracy on the outputs on the deliberatelybad control model (an unconditioned GPT-3 Small model with higher output randomness) is indicated with the dashed line at the top, and the random chance (50%) is indicated with the dashed line at the bottom. Line of best fit is a power law with 95% confidence intervals.

图 3.13: 人识别新闻文章是否由模型生成的能力 (以正确判断数占非中立判断数的比例衡量) 随模型尺寸增大而下降. 顶部虚线是故意做差的对照模型 (输出随机性更高的无条件 GPT-3 Small) 上的准确率, 底部虚线是随机水平 (50%). 最佳拟合线是幂律, 带 95% 置信区间.

<table><tbody><tr><td rowspan="2"></td><td rowspan="2">Mean accuracy</td><td rowspan="2">95% Confidence Interval (low, hi)</td><td rowspan="2">t compared to control (p-value)</td><td rowspan="2">"I don't know" assignments</td></tr><tr></tr><tr><td>Control</td><td>88%</td><td>84%-91%</td><td>-</td><td>2.7%</td></tr><tr><td>GPT-3 175B</td><td>52%</td><td>48%-57%</td><td>12.7 (3.2e-23)</td><td>10.6%</td></tr></tbody></table>

Table 3.12: People’s ability to identify whether ∼ 500 word articles are model generated (as measured by the ratio of correct assignments to non-neutral assignments) was 88% on the control model and 52% on GPT-3 175B. This table shows the results of a two-sample T-Test for the difference in mean accuracy between GPT-3 175B and the control model (an unconditional GPT-3 Small model with increased output randomness).

表 3.12: 人识别约 500 词文章是否为模型生成的能力 (以正确判断数占非中立判断数的比例衡量), 在对照模型上是 88%, 在 GPT-3 175B 上是 52%. 该表给出 GPT-3 175B 与对照模型平均准确率之差的双样本 T 检验结果 (对照模型是一个提高输出随机性的无条件 GPT-3 Small).

<!-- page 28 of 75 -->

![图3.14 一篇GPT-3生成的新闻截图, 标题为联合卫理公会同意历史性分裂, 副标题说反对同性婚姻的一方将另立教派, 灰字是人给的标题和副标题, 黑色粗体正文由模型生成, 讲大会投票, 2020年另立新教派, 以及1968年和2016年的旧分歧](images/p28-figure-3-14-the-gpt-3-generated-news-article-that.png)

Figure 3.14: The GPT-3 generated news article that humans had the greatest difficulty distinguishing from a human written article (accuracy: 12%).

图 3.14: 人最难与人写文章区分开的一篇 GPT-3 生成新闻 (准确率: 12%).

```txt
Title: Star's Tux Promise Draws Megyn Kelly's Sarcasm
Subtitle: Joaquin Phoenix pledged to not change for each awards event
Article: A year ago, Joaquin Phoenix made headlines when he appeared on the red carpet at the Golden Globes wearing a tuxedo with a paper bag over his head that read, "I am a shape-shifter. I can't change the world. I can only change myself." It was a promise to not change to fit into the Hollywood mold: "I think that's a really special thing, to not change yourself. I think it's a really special thing to say, 'This is what's inside of me, I'm proud of it, and I'm not going to be ashamed because of the way that someone else thinks I should be.'" Now, it's the Oscars, and Phoenix is at it again. But this time, his publicist is saying he'll be wearing a tux no matter what.
Megyn Kelly was not impressed, and she let him have it on The Tonight Show. "You know, I feel like, I feel like you could have worn the tux," she says. "But you're saying you're a shape-shifter. I don't know if you can change your tux, but you can change your mind. You can change your mind. You can change your mind." Phoenix says he did, but it didn't stick. "I was like, 'Okay, I'm going to wear a tuxedo to this thing.' And then I thought, 'I don't want to wear a tuxedo to this thing.'" Kelly goes on to encourage him to change his mind again, but Phoenix says it's too late: "I'm committed to wearing this."
```

上面的代码块是图 3.15 的文章原文: 标题说明星关于燕尾服的承诺招来 Megyn Kelly 的嘲讽, 副标题说 Joaquin Phoenix 承诺每场颁奖礼都不换装, 正文编造了 Phoenix 在金球奖上的发言和 Kelly 在节目里的回应.

Figure 3.15: The GPT-3 generated news article that humans found the easiest to distinguish from a human written article (accuracy: 61%).

图 3.15: 人最容易与人写文章区分开的一篇 GPT-3 生成新闻 (准确率: 61%).

<!-- page 29 of 75 -->

```txt
A "whatpu" is a small, furry animal native to Tanzania. An example of a sentence that uses the word whatpu is:  
We were traveling in Africa and we saw these very cute whatpus.   
To do a "farduddle" means to jump up and down really fast. An example of a sentence that uses the word farduddle is: One day when I was playing tag with my little sister, she got really excited and she started doing these crazy farduddles. A "yalubalu" is a type of vegetable that looks like a big pumpkin. An example of a sentence that uses the word yalubalu is: I was on a trip to Africa and I tried this yalubalu vegetable that was grown in a garden there. It was delicious.   
A "Burringo" is a car with very fast acceleration. An example of a sentence that uses the word Burringo is: In our garage we have a Burringo that my father drives to work every day.   
A "Gigamuru" is a type of Japanese musical instrument. An example of a sentence that uses the word Gigamuru is: I have a Gigamuru that my uncle gave me as a gift. I love to play it at home.   
To "screeg" something is to swing a sword at it. An example of a sentence that uses the word screeg is: We screeghed at each other for several minutes and then we went outside and ate ice cream.
```

上面的代码块是图 3.16 的全部内容: 六个生造词各配一句定义, 再用 「An example of a sentence that uses the word ... is:」 引出一个例句.

Figure 3.16: Representative GPT-3 completions for the few-shot task of using a new word in a sentence. Boldface is GPT-3’s completions, plain text is human prompts. In the first example both the prompt and the completion are provided by a human; this then serves as conditioning for subsequent examples where GPT-3 receives successive additional prompts and provides the completions. Nothing task-specific is provided to GPT-3 other than the conditioning shown here.

图 3.16: few-shot 新词造句任务中具有代表性的 GPT-3 补全. 粗体是 GPT-3 的补全, 普通字体是人给的提示. 第一个例子里提示和补全都由人提供, 它作为后续例子的条件, GPT-3 依次收到新的提示并给出补全. 除了这里展示的条件, 没有给 GPT-3 任何任务专属的东西.

## 3.9.6 Correcting English Grammar (纠正英语语法)

Another task well suited for few-shot learning is correcting English grammar. We test this with GPT-3 in the fewshot setting by giving prompts of the form "Poor English Input: &lt;sentence&gt;\n Good English Output: &lt;sentence&gt;". We give GPT-3 one human-generated correction and then ask it to correct 5 more (again without any omissions or repeats). Results are shown in Figure 3.17.

另一个很适合 few-shot 学习的任务是纠正英语语法. 我们在 few-shot 设定下测试 GPT-3, 提示形式为 「Poor English Input: <句子>\n Good English Output: <句子>」. 我们先给 GPT-3 一条人写的改正, 再让它改另外 5 条 (同样没有删掉或重试). 结果见图 3.17.

## 4 Measuring and Preventing Memorization Of Benchmarks (度量并防止对基准的记忆)

Since our training dataset is sourced from the internet, it is possible that our model was trained on some of our benchmark test sets. Accurately detecting test contamination from internet-scale datasets is a new area of research without established best practices. While it is common practice to train large models without investigating contamination, given the increasing scale of pretraining datasets, we believe this issue is becoming increasingly important to attend to.

由于训练数据来自互联网, 我们的模型可能在训练中见过部分基准测试集. 从互联网规模的数据集中准确检测测试污染是个新的研究领域, 还没有公认的最佳做法. 训练大模型而不调查污染是常见做法, 但鉴于预训练数据集的规模越来越大, 我们认为这个问题越来越值得重视.

This concern is not just hypothetical. One of the first papers to train a language model on Common Crawl data [TL18] detected and removed a training document which overlapped with one of their evaluation datasets. Other work such as GPT-2 [RWC+19] also conducted post-hoc overlap analysis. Their study was relatively encouraging, finding that although models did perform moderately better on data that overlapped between training and testing, this did not significantly impact reported results due to the small fraction of data which was contaminated (often only a few percent).

这个担忧并不只是假设. 最早在 Common Crawl 数据上训练语言模型的论文之一 [TL18] 就检测到并移除了一篇与其评测数据集重叠的训练文档. GPT-2 [RWC+19] 等其他工作也做了事后重叠分析. 他们的研究结果相对令人鼓舞: 模型在训练集与测试集重叠的数据上确实表现稍好, 但由于被污染的数据比例很小 (通常只有几个百分点), 并没有显著影响报告的结果.

<!-- page 30 of 75 -->

```txt
Poor English input: I eated the purple berries.
Good English output: I ate the purple berries.
Poor English input: Thank you for picking me as your designer. I'd appreciate it.
Good English output: Thank you for choosing me as your designer. I appreciate it.
Poor English input: The mentioned changes have done. or I did the alteration that you requested. or I changed things you wanted and did the modifications.
Good English output: The requested changes have been made. or I made the alteration that you requested. or I changed things you wanted and made the modifications.
Poor English input: I'd be more than happy to work with you in another project.
Good English output: I'd be more than happy to work with you on another project.

Poor English input: Please provide me with a short brief of the design you're looking for and that'd be nice if you could share some examples or project you did before.
Good English output: Please provide me with a brief description of the design you're looking for and that would be nice if you could share some examples or projects you have done before.

Poor English input: The patient was died.
Good English output: The patient died.

Poor English input: We think that Leslie likes ourselves.
Good English output: We think that Leslie likes us.

Poor English input: Janet broke Bill on the finger.
Good English output: Janet broke Bill's finger.

Poor English input: Mary arranged for, in St. Louis, John to rent a house cheap.
Good English output: Mary arranged for John to rent a house in St. Louis.

Poor English input: Today I have went to the store to to buys some many bottle of water.
Good English output: Today I went to the store to buy some bottles of water.

Poor English input: I have tried to hit ball with bat, but my swing is has miss.
Good English output: I tried to hit the ball with the bat, but my swing missed.
```

上面的代码块是图 3.17 的全部内容: 每组是一行 「Poor English input」 加一行 「Good English output」, 前几组由人给出, 后面的改写由 GPT-3 续写, 最后几组包括 「The patient was died.」 改为 「The patient died.」 以及删掉了 「cheap」 的租房句.

Figure 3.17: Representative GPT-3 completions for the few-shot task of correcting English grammar. Boldface is GPT-3’s completions, plain text is human prompts. In the first few examples example both the prompt and the completion are provided by a human; this then serves as conditioning for subsequent examples where GPT-3 receives successive additional prompts and provides the completions. Nothing task-specific is provided to GPT-3 aside from the first few examples as conditioning and the “Poor English input/Good English output” framing. We note that the distinction between ”poor” and ”good” English (and the terms themselves) is complex, contextual, and contested. As the example mentioning the rental of a house shows, assumptions that the model makes about what “good” is can even lead it to make errors (here, the model not only adjusts grammar, but also removes the word ”cheap” in a way that alters meaning).

图 3.17: few-shot 纠正英语语法任务中具有代表性的 GPT-3 补全. 粗体是 GPT-3 的补全, 普通字体是人给的提示. 前几个例子里提示和补全都由人提供, 作为后续例子的条件, GPT-3 依次收到新的提示并给出补全. 除了作为条件的前几个例子和 「Poor English input/Good English output」 的框架, 没有给 GPT-3 任何任务专属的东西. 我们注意到, 「差」 英语和 「好」 英语的区分 (以及这两个词本身) 是复杂的, 依赖语境的, 也是有争议的. 正如租房那个例子所示, 模型对什么是 「好」 的假设甚至会导致它犯错 (这里模型不仅调整了语法, 还删掉了 「cheap」 一词, 改变了意思).

<!-- page 31 of 75 -->

![图4.1 GPT-3各尺寸模型的训练曲线, 横轴是已训练token数到3000亿, 纵轴是交叉熵损失, 虚线为训练损失, 实线为去重后的验证损失, 颜色从深到浅对应参数量从大到小, 每个尺寸的两条线间隔很窄且随训练几乎不拉开](images/p31-figure-4-1-gpt-3-training-curves-we-measure-model.png)

Figure 4.1: GPT-3 Training Curves We measure model performance during training on a deduplicated validation split of our training distribution. Though there is some gap between training and validation performance, the gap grows only minimally with model size and training time, suggesting that most of the gap comes from a difference in difficulty rather than overfitting.

图 4.1: GPT-3 训练曲线. 我们在训练分布的一个去重验证划分上测量训练过程中的模型表现. 训练与验证表现之间虽有一些差距, 但这个差距随模型尺寸和训练时长增长得极少, 说明差距主要来自难度不同, 而不是过拟合.

GPT-3 operates in a somewhat different regime. On the one hand, the dataset and model size are about two orders of magnitude larger than those used for GPT-2, and include a large amount of Common Crawl, creating increased potential for contamination and memorization. On the other hand, precisely due to the large amount of data, even GPT-3 175B does not overfit its training set by a significant amount, measured relative to a held-out validation set with which it was deduplicated (Figure 4.1). Thus, we expect that contamination is likely to be frequent, but that its effects may not be as large as feared.

GPT-3 所处的情形有些不同. 一方面, 数据集和模型尺寸比 GPT-2 大约两个数量级, 并且包含大量 Common Crawl, 污染和记忆的可能性都增加了. 另一方面, 正因为数据量大, 即便 GPT-3 175B 也没有明显过拟合训练集, 这是相对一个与训练集去过重的留出验证集来衡量的 (图 4.1). 因此我们预计污染很可能很常见, 但其影响也许没有担心的那么大.

We initially tried to address the issue of contamination by proactively searching for and attempting to remove any overlap between our training data and the development and test sets of all benchmarks studied in this paper. Unfortunately, a bug resulted in only partial removal of all detected overlaps from the training data. Due to the cost of training, it wasn’t feasible to retrain the model. To address this, we investigate in detail how the remaining detected overlap impacts results.

我们最初试图主动搜索并移除训练数据与本文研究的所有基准的开发集, 测试集之间的任何重叠, 以此解决污染问题. 可惜一个 bug 导致检测到的重叠只被部分移除. 由于训练成本高, 重训模型不现实. 为此, 我们详细考察残留的已检测重叠如何影响结果.

For each benchmark, we produce a ‘clean’ version which removes all potentially leaked examples, defined roughly as examples that have a 13-gram overlap with anything in the pretraining set (or that overlap with the whole example when it is shorter than 13-grams). The goal is to very conservatively flag anything that could potentially be contamination, so as to produce a clean subset that is free of contamination with high confidence. The exact procedure is detailed in Appendix C.

对每个基准, 我们构造一个 「干净」 版本, 去掉所有可能泄漏的样本, 大致定义为与预训练集中任何内容有 13-gram 重叠的样本 (样本短于 13-gram 时, 则为与整个样本重叠的). 目的是非常保守地标出任何可能是污染的东西, 从而得到一个有很高把握不含污染的干净子集. 具体流程见附录 C.

We then evaluate GPT-3 on these clean benchmarks, and compare to the original score. If the score on the clean subset is similar to the score on the entire dataset, this suggests that contamination, even if present, does not have a significant effect on reported results. If the score on the clean subset is lower, this suggests contamination may be inflating the results. The results are summarized in Figure 4.2. Although potential contamination is often high (with a quarter of benchmarks scoring over 50%), in most cases performance changes only negligibly, and we see no evidence that contamination level and performance difference are correlated. We conclude that either our conservative method substantially overestimated contamination or that contamination has little effect on performance.

然后我们在这些干净基准上评测 GPT-3, 并与原始分数比较. 如果干净子集上的分数与整个数据集相近, 说明污染即便存在, 对报告结果也没有显著影响. 如果干净子集上的分数更低, 说明污染可能抬高了结果. 结果汇总在图 4.2. 虽然潜在污染往往很高 (四分之一的基准超过 50%), 但多数情况下表现变化微乎其微, 我们也没看到污染程度与表现差异相关的证据. 我们的结论是: 要么保守的方法大大高估了污染, 要么污染对表现影响很小.

Below, we review in more detail the few specific cases where either (1) the model performs significantly worse on the cleaned version, or (2) potential contamination is very high, which makes measuring the performance difference difficult.

下面我们更详细地回顾少数几个具体情况: (1) 模型在清理后的版本上表现明显更差, 或者 (2) 潜在污染非常高, 难以测量表现差异.

Our analysis flagged six groups of benchmarks for further investigation: Word Scrambling, Reading Comprehension (QuAC, SQuAD2, DROP), PIQA, Winograd, language modeling tasks (Wikitext tasks, 1BW), and German to English translation. Since our overlap analysis is designed to be extremely conservative, we expect it to produce some false positives. We summarize the results for each group of tasks below:

我们的分析标出了六组需要进一步调查的基准: 单词打乱, 阅读理解 (QuAC, SQuAD2, DROP), PIQA, Winograd, 语言建模任务 (Wikitext 系列任务, 1BW), 以及德译英. 由于重叠分析设计得极为保守, 我们预计它会产生一些误报. 各组任务的结果总结如下:

<!-- page 32 of 75 -->

![图4.2 各基准的污染分析散点图, 横轴是数据集中确认干净的比例, 纵轴是只在干净子集上评测所得表现的变化百分比, 绝大多数点贴近零线, 标注出的离群点包括QuAC约加20%, DROP约减21%, Reversed Words约减26%, 以及Anagrams, PIQA, WMT16, Winograd, Symbol Insertion, SQuADv2](images/p32-percentage-of-data-clean-in-dataset.png)

Percentage of Data Clean in Dataset

数据集中干净数据的比例 (图中横轴标题).

Figure 4.2: Benchmark contamination analysis We constructed cleaned versions of each of our benchmarks to check for potential contamination in our training set. The x-axis is a conservative lower bound for how much of the dataset is known with high confidence to be clean, and the y-axis shows the difference in performance when evaluating only on the verified clean subset. Performance on most benchmarks changed negligibly, but some were flagged for further review. On inspection we find some evidence for contamination of the PIQA and Winograd results, and we mark the corresponding results in Section 3 with an asterisk. We find no evidence that other benchmarks are affected.

图 4.2: 基准污染分析. 我们为每个基准构造了清理后的版本, 以检查训练集中可能存在的污染. 横轴是数据集中有很高把握确认干净部分所占比例的保守下界, 纵轴是只在确认干净的子集上评测所得表现的差异. 多数基准的表现变化微乎其微, 但有些被标出需要进一步审查. 经检查, 我们发现 PIQA 和 Winograd 的结果存在一些污染证据, 并在第 3 节给相应结果加了星号. 我们没有发现其他基准受影响的证据.

**Reading Comprehension:** Our initial analysis flagged >90% of task examples from QuAC, SQuAD2, and DROP as potentially contaminated, so large that even measuring the differential on a clean subset was difficult. Upon manual inspection, however, we found that for every overlap we inspected, in all 3 datasets, the source text was present in our training data but the question/answer pairs were not, meaning the model gains only background information and cannot memorize the answer to a specific question.

**阅读理解:** 初步分析把 QuAC, SQuAD2 和 DROP 中 90% 以上的样本标为可能被污染, 比例高到连在干净子集上测量差异都很难. 然而人工检查后我们发现, 在这 3 个数据集里, 我们检查过的每一处重叠, 原文都出现在训练数据中, 问答对却没有, 也就是说模型只获得了背景信息, 背不下某道具体题目的答案.

• **German translation:** We found 25% of the examples in the WMT16 German-English test set were marked as potentially contaminated, with an associated total effect size of 1-2 BLEU. Upon inspection, none of the flagged examples contain paired sentences resembling NMT training data and collisions were monolingual matches mostly of snippets of events discussed in the news.

• **德语翻译:** 我们发现 WMT16 德英测试集中 25% 的样本被标为可能被污染, 相应的总效应量是 1-2 BLEU. 经检查, 被标出的样本都不含类似 NMT 训练数据的成对句子, 碰撞都是单语匹配, 大多是新闻里讨论的事件片段.

• **Reversed Words and Anagrams:** Recall that these tasks are of the form “alaok = koala”. Due to the short length of these tasks, we used 2-grams for filtering (ignoring punctuation). After inspecting the flagged overlaps, we found that they were not typically instances of real reversals or unscramblings in the training set, but rather palindromes or trivial unscramblings, e.g “kayak = kayak”. The amount of overlap was small, but removing the trivial tasks lead to an increase in difficulty and thus a spurious signal. Related to this, the symbol insertion task shows high overlap but no effect on performance – this is because that task involves removing non-letter characters from a word, and the overlap analysis itself ignores such characters, leading to many spurious matches.

• **单词倒写与打乱:** 回想一下, 这些任务的形式是 「alaok = koala」. 由于这些任务很短, 我们用 2-gram 过滤 (忽略标点). 检查被标出的重叠后我们发现, 它们通常不是训练集中真正的倒写或还原实例, 而是回文或平凡的还原, 例如 「kayak = kayak」. 重叠量很小, 但去掉这些平凡题目让难度上升, 从而产生了虚假信号. 与此相关, 符号插入任务重叠很高, 但对表现没有影响: 这个任务要从单词中去掉非字母字符, 而重叠分析本身忽略这些字符, 导致大量虚假匹配.

• **PIQA:** The overlap analysis flagged 29% of examples as contaminated, and observed a 3 percentage point absolute decrease (4% relative decrease) in performance on the clean subset. Though the test dataset was released after our training set was created and its labels are hidden, some of the web pages used by the crowdsourced dataset creators are contained in our training set. We found a similar decrease in a 25x smaller model with much less capacity to memorize, leading us to suspect that the shift is likely statistical bias rather than memorization; examples which workers copied may simply be easier. Unfortunately, we cannot rigorously prove this hypothesis. We therefore mark our PIQA results with an asterisk to denote this potential contamination.

• **PIQA:** 重叠分析把 29% 的样本标为被污染, 并观察到干净子集上表现绝对下降 3 个百分点 (相对下降 4%). 虽然测试集是在我们的训练集建好之后发布的, 标签也是隐藏的, 但众包数据集创建者用过的一些网页包含在我们的训练集里. 我们在一个小 25 倍, 记忆能力弱得多的模型上也发现了类似的下降, 因此怀疑这个偏移更可能是统计偏差而非记忆: 工人照抄的样本可能本来就更容易. 可惜我们无法严格证明这个假设. 因此我们给 PIQA 结果加星号, 表示存在这种潜在污染.

• **Winograd:** The overlap analysis flagged 45% of examples, and found a 2.6% decrease in performance on the clean subset. Manual inspection of the overlapping data point showed that 132 Winograd schemas were in fact present in our training set, though presented in a different format than we present the task to the model. Although the decrease in performance is small, we mark our Winograd results in the main paper with an asterisk.

• **Winograd:** 重叠分析标出了 45% 的样本, 并发现干净子集上表现下降 2.6%. 人工检查重叠数据点后发现, 训练集中确实有 132 个 Winograd schema, 只是呈现格式与我们给模型的任务不同. 虽然表现下降很小, 我们仍在正文中给 Winograd 结果加了星号.

> **回看:** Winograd 「标出 45%, 下降 2.6%」, 附录表 C.1 是同样的数吗?
> 表 C.1 的 Winograd 行: 总数 273, Dirty Count 164, Clean Count 109, Clean Percentage 40%, 也就是被标出约 60%, 不是 45%; 总分 88.6, 干净子集 86.2, 相对差写 -3%, 绝对差 2.4 分, 与正文的 2.6% 也不完全相同. 人工确认的 132 个 schema 占 273 的约 48% (估算), 比 C.1 的 164 个少. PIQA 这边则对得上: C.1 的 Clean Percentage 71% 即被标出 29%, 总分 82.3 对干净 79.3, 差 3.0 分, 相对差 -4%.

<!-- page 33 of 75 -->

• **Language modeling:** We found the 4 Wikipedia language modeling benchmarks measured in GPT-2, plus the Children’s Book Test dataset, to be almost entirely contained in our training data. Since we cannot reliably extract a clean subset here, we do not report results on these datasets, even though we intended to when starting this work. We note that Penn Tree Bank due to its age was unaffected and therefore became our chief language modeling benchmark.

• **语言建模:** 我们发现 GPT-2 中测量过的 4 个维基百科语言建模基准, 加上 Children's Book Test 数据集, 几乎全部包含在我们的训练数据里. 由于无法可靠地从中提取干净子集, 我们不报告这些数据集上的结果, 尽管开始这项工作时本打算报告. 我们注意到 Penn Tree Bank 因为年代久远没有受影响, 因此成了我们主要的语言建模基准.

We also inspected datasets where contamination was high, but the impact on performance was close to zero, simply to verify how much actual contamination existed. These appeared to often contain false positives. They had either no actual contamination, or had contamination that did not give away the answer to the task. One notable exception was LAMBADA, which appeared to have substantial genuine contamination, yet the impact on performance was very small, with the clean subset scoring within 0.5% of the full dataset. Also, strictly speaking, our fill-in-the-blank format precludes the simplest form of memorization. Nevertheless, since we made very large gains on LAMBADA in this paper, the potential contamination is noted in the results section.

我们还检查了污染很高但对表现影响接近零的数据集, 只是为了核实到底存在多少真实污染. 它们看来往往包含误报: 要么没有真实污染, 要么污染并没有泄露任务答案. 一个值得注意的例外是 LAMBADA, 它看来有大量真实污染, 但对表现的影响很小, 干净子集的得分与完整数据集相差不到 0.5%. 另外, 严格来说, 我们的填空格式排除了最简单形式的记忆. 尽管如此, 由于本文在 LAMBADA 上取得了很大提升, 我们在结果一节注明了潜在污染.

An important limitation of our contamination analysis is that we cannot be sure that the clean subset is drawn from the same distribution as the original dataset. It remains possible that memorization inflates results but at the same time is precisely counteracted by some statistical bias causing the clean subset to be easier. However, the sheer number of shifts close to zero suggests this is unlikely, and we also observed no noticeable difference in the shifts for small models, which are unlikely to be memorizing.

我们的污染分析有一个重要局限: 无法确定干净子集与原始数据集来自同一分布. 仍有可能是记忆抬高了结果, 同时又恰好被某种让干净子集更容易的统计偏差抵消. 不过, 大量接近零的偏移说明这不太可能, 而且我们在小模型上也没观察到偏移有明显差异, 而小模型不太可能在背题.

Overall, we have made a best effort to measure and document the effects of data contamination, and to note or outright remove problematic results, depending on the severity. Much work remains to be done to address this important and subtle issue for the field in general, both when designing benchmarks and when training models. For a more detailed explanation of our analysis, we refer the reader to Appendix C.

总的来说, 我们尽了最大努力测量和记录数据污染的影响, 并视严重程度对有问题的结果加注或直接移除. 无论是设计基准还是训练模型, 这个重要而微妙的问题在整个领域都还有大量工作要做. 更详细的分析说明见附录 C.

## 5 Limitations (局限)

GPT-3 and our analysis of it have a number of limitations. Below we describe some of these and suggest directions for future work.

GPT-3 和我们对它的分析有不少局限. 下面描述其中一些, 并提出未来工作的方向.

First, despite the strong quantitative and qualitative improvements of GPT-3, particularly compared to its direct predecessor GPT-2, it still has notable weaknesses in text synthesis and several NLP tasks. On text synthesis, although the overall quality is high, GPT-3 samples still sometimes repeat themselves semantically at the document level, start to lose coherence over sufficiently long passages, contradict themselves, and occasionally contain non-sequitur sentences or paragraphs. We will release a collection of 500 uncurated unconditional samples to help provide a better sense of GPT-3’s limitations and strengths at text synthesis. Within the domain of discrete language tasks, we have noticed informally that GPT-3 seems to have special difficulty with “common sense physics”, despite doing well on some datasets (such as PIQA [BZB+19]) that test this domain. Specifically GPT-3 has difficulty with questions of the type “If I put cheese into the fridge, will it melt?”. Quantitatively, GPT-3’s in-context learning performance has some notable gaps on our suite of benchmarks, as described in Section 3, and in particular it does little better than chance when evaluated one-shot or even few-shot on some “comparison” tasks, such as determining if two words are used the same way in a sentence, or if one sentence implies another (WIC and ANLI respectively), as well as on a subset of reading comprehension tasks. This is especially striking given GPT-3’s strong few-shot performance on many other tasks.

第一, 尽管 GPT-3 在定量和定性上都有很大进步, 尤其是相对它的直接前身 GPT-2, 它在文本生成和若干 NLP 任务上仍有明显弱点. 文本生成方面, 虽然整体质量高, GPT-3 的样本有时仍会在文档层面语义重复, 段落足够长时开始失去连贯, 自相矛盾, 偶尔还会出现前后不接的句子或段落. 我们会发布 500 条未经挑选的无条件样本, 帮助大家更好地了解 GPT-3 在文本生成上的长处和局限. 在离散语言任务领域, 我们非正式地注意到 GPT-3 似乎在 「常识物理」 上特别吃力, 尽管它在考察这一领域的某些数据集 (比如 PIQA [BZB+19]) 上表现不错. 具体来说, GPT-3 很难回答 「如果我把奶酪放进冰箱, 它会化吗?」 这类问题. 定量地看, 如第 3 节所述, GPT-3 的 in-context learning 在我们这套基准上有一些明显的短板, 尤其是在一些 「比较」 类任务上, 比如判断两个词在句子里的用法是否相同, 或一句话是否蕴含另一句 (分别是 WIC 和 ANLI), 以及一部分阅读理解任务上, one-shot 乃至 few-shot 评测都只比随机好一点. 考虑到 GPT-3 在许多其他任务上 few-shot 表现很强, 这一点格外醒目.

GPT-3 has several structural and algorithmic limitations, which could account for some of the issues above. We focused on exploring in-context learning behavior in autoregressive language models because it is straightforward to both sample and compute likelihoods with this model class. As a result our experiments do not include any bidirectional architectures or other training objectives such as denoising. This is a noticeable difference from much of the recent literature, which has documented improved fine-tuning performance when using these approaches over standard language models [RSR+19]. Thus our design decision comes at the cost of potentially worse performance on tasks which empirically benefit from bidirectionality. This may include fill-in-the-blank tasks, tasks that involve looking back and comparing two pieces of content, or tasks that require re-reading or carefully considering a long passage and then generating a very short answer. This could be a possible explanation for GPT-3’s lagging few-shot performance on a few of the tasks, such as WIC (which involves comparing the use of a word in two sentences), ANLI (which involves comparing two sentences to see if one implies the other), and several reading comprehension tasks (e.g. QuAC and RACE). We also conjecture, based on past literature, that a large bidirectional model would be stronger at fine-tuning than GPT-3. Making a bidirectional model at the scale of GPT-3, and/or trying to make bidirectional models work with few- or zero-shot learning, is a promising direction for future research, and could help achieve the “best of both worlds”.

GPT-3 有若干结构和算法上的局限, 可能是上述部分问题的原因. 我们专注于探索自回归语言模型的 in-context learning 行为, 因为这类模型既容易采样也容易计算似然. 因此我们的实验不包含任何双向架构, 也不包含去噪等其他训练目标. 这与近期大量文献有明显不同, 那些文献记录了用这些方法相比标准语言模型带来的微调性能提升 [RSR+19]. 所以我们的设计决定可能以在经验上受益于双向性的任务上表现更差为代价. 这可能包括填空任务, 需要回看并比较两段内容的任务, 或需要反复阅读或仔细思考一段长文再生成很短答案的任务. 这可能解释了 GPT-3 在少数任务上 few-shot 表现落后, 例如 WIC (比较一个词在两个句子中的用法), ANLI (比较两个句子, 看一句是否蕴含另一句), 以及几个阅读理解任务 (如 QuAC 和 RACE). 基于以往文献, 我们还推测一个大的双向模型在微调上会比 GPT-3 更强. 在 GPT-3 的规模上做一个双向模型, 和/或尝试让双向模型适用于 few-shot 或 zero-shot 学习, 是未来研究的一个有前景的方向, 可能有助于实现 「两全其美」.

> **确认:** 这里说 「比较类任务只比随机好一点」, 本文给了哪些具体的数?
> 表 3.8 里 WiC few-shot 49.4%, 与二分类的随机水平相当. 图 3.9 与表 C.1 的 ANLI R3 是 40.2%, 三分类随机约 33%; 表 C.1 的 ANLI R1 是 36.8%, R2 是 34.0%. 阅读理解中表 3.7 的 QuAC few-shot 44.3 F1, RACE-h 46.8%, 离微调最好水平 74.4 和 90.0 都很远. 这些就是本段把原因指向 「缺少双向性」 时所依据的格子.

A more fundamental limitation of the general approach described in this paper – scaling up any LM-like model, whether autoregressive or bidirectional – is that it may eventually run into (or could already be running into) the limits of the pretraining objective. Our current objective weights every token equally and lacks a notion of what is most important to predict and what is less important. [RRS20] demonstrate benefits of customizing prediction to entities of interest. Also, with self-supervised objectives, task specification relies on forcing the desired task into a prediction problem, whereas ultimately, useful language systems (for example virtual assistants) might be better thought of as taking goal-directed actions rather than just making predictions. Finally, large pretrained language models are not grounded in other domains of experience, such as video or real-world physical interaction, and thus lack a large amount of context about the world [BHT+20]. For all these reasons, scaling pure self-supervised prediction is likely to hit limits, and augmentation with a different approach is likely to be necessary. Promising future directions in this vein might include learning the objective function from humans $[ \mathrm { Z S W ^ { + } 1 9 a } ]$ , fine-tuning with reinforcement learning, or adding additional modalities such as images to provide grounding and a better model of the world $[ \mathrm { C L Y ^ { + } 1 9 } ]$

本文所描述的总体路线 (放大任何类似语言模型的模型, 无论自回归还是双向) 还有一个更根本的局限: 它最终可能会撞上 (或者已经在撞上) 预训练目标的极限. 我们当前的目标对每个 token 一视同仁, 没有 「什么最重要该预测, 什么不太重要」 的概念. [RRS20] 展示了针对感兴趣的实体定制预测的好处. 另外, 在自监督目标下, 指定任务要靠把所需任务硬塞成一个预测问题, 而归根结底, 有用的语言系统 (比如虚拟助手) 也许更应被看作采取目标导向的行动, 而不只是做预测. 最后, 大型预训练语言模型没有扎根于其他经验领域, 比如视频或真实世界的物理交互, 因而缺少大量关于世界的上下文 [BHT+20]. 由于这些原因, 单纯放大自监督预测很可能会碰到极限, 需要用别的方法来补充. 这方面有前景的未来方向可能包括从人类那里学习目标函数 [ZSW+19a], 用强化学习微调, 或加入图像等额外模态以提供扎根和更好的世界模型 [CLY+19].

<!-- page 34 of 75 -->

Another limitation broadly shared by language models is poor sample efficiency during pre-training. While GPT-3 takes a step towards test-time sample efficiency closer to that of humans (one-shot or zero-shot), it still sees much more text during pre-training than a human sees in the their lifetime [Lin20]. Improving pre-training sample efficiency is an important direction for future work, and might come from grounding in the physical world to provide additional information, or from algorithmic improvements.

语言模型普遍存在的另一个局限是预训练阶段样本效率低. GPT-3 在推理阶段的样本效率上向人类靠近了一步 (one-shot 或 zero-shot), 但它在预训练中看到的文本仍远多于一个人一生看到的文本 [Lin20]. 提高预训练样本效率是未来工作的重要方向, 可能来自扎根于物理世界以获得额外信息, 也可能来自算法改进.

A limitation, or at least uncertainty, associated with few-shot learning in GPT-3 is ambiguity about whether few-shot learning actually learns new tasks “from scratch” at inference time, or if it simply recognizes and identifies tasks that it has learned during training. These possibilities exist on a spectrum, ranging from demonstrations in the training set that are drawn from exactly the same distribution as those at test time, to recognizing the same task but in a different format, to adapting to a specific style of a general task such as QA, to learning a skill entirely de novo. Where GPT-3 is on this spectrum may also vary from task to task. Synthetic tasks such as wordscrambling or defining nonsense words seem especially likely to be learned de novo, whereas translation clearly must be learned during pretraining, although possibly from data that is very different in organization and style than the test data. Ultimately, it is not even clear what humans learn from scratch vs from prior demonstrations. Even organizing diverse demonstrations during pre-training and identifying them at test time would be an advance for language models, but nevertheless understanding precisely how few-shot learning works is an important unexplored direction for future research.

与 GPT-3 的 few-shot 学习相关的一个局限, 或者至少是不确定性, 在于说不清 few-shot 学习究竟是在推理阶段 「从零」 学会了新任务, 还是只是认出了训练中学过的任务. 这些可能性排在一条谱上: 从训练集中的示范与推理阶段的示范来自完全相同的分布, 到认出同一任务但格式不同, 到适应问答这类一般任务的某种特定风格, 再到完全从头学会一项技能. GPT-3 在这条谱上的位置也可能因任务而异. 单词打乱或定义无意义词这类合成任务看来尤其可能是从头学会的, 而翻译显然必须在预训练中学会, 尽管学习所用的数据在组织和风格上可能与测试数据很不一样. 归根结底, 甚至连人类哪些东西是从零学会, 哪些是从先前示范中学来, 都不清楚. 即便只是在预训练中组织好多样的示范, 并在推理阶段把它们认出来, 对语言模型也算一种进步, 但无论如何, 准确理解 few-shot 学习如何运作, 是未来研究一个重要而尚未探索的方向.

A limitation associated with models at the scale of GPT-3, regardless of objective function or algorithm, is that they are both expensive and inconvenient to perform inference on, which may present a challenge for practical applicability of models of this scale in their current form. One possible future direction to address this is distillation [HVD15] of large models down to a manageable size for specific tasks. Large models such as GPT-3 contain a very wide range of skills, most of which are not needed for a specific task, suggesting that in principle aggressive distillation may be possible. Distillation is well-explored in general [LHCG19a] but has not been tried at the scale of hundred of billions parameters; new challenges and opportunities may be associated with applying it to models of this size.

与 GPT-3 这个规模的模型相关的一个局限, 不论目标函数或算法如何, 是它们做推理既昂贵又不方便, 这可能对这种规模的模型以当前形式投入实际应用构成挑战. 一个可能的未来方向是蒸馏 [HVD15], 把大模型压到适合特定任务的可控尺寸. GPT-3 这样的大模型包含非常广的技能, 其中大部分对某个具体任务并不需要, 这意味着原则上可能做激进的蒸馏. 蒸馏在一般意义上已被充分研究 [LHCG19a], 但还没有在数千亿参数的规模上尝试过; 把它用到这么大的模型上, 可能会带来新的挑战和机会.

Finally, GPT-3 shares some limitations common to most deep learning systems – its decisions are not easily interpretable, it is not necessarily well-calibrated in its predictions on novel inputs as observed by the much higher variance in performance than humans on standard benchmarks, and it retains the biases of the data it has been trained on. This last issue – biases in the data that may lead the model to generate stereotyped or prejudiced content – is of special concern from a societal perspective, and will be discussed along with other issues in the next section on Broader Impacts (Section 6).

最后, GPT-3 也有大多数深度学习系统共有的一些局限: 它的决策不易解释; 它对新输入的预测不一定校准良好, 这从它在标准基准上比人类高得多的表现方差可以看出; 它还保留了训练数据中的偏见. 最后这个问题 (数据中的偏见可能导致模型生成刻板或带偏见的内容) 从社会角度看尤其令人担忧, 将在下一节更广泛的影响 (第 6 节) 中与其他问题一起讨论.

## 6 Broader Impacts (更广泛的影响)

Language models have a wide range of beneficial applications for society, including code and writing auto-completion, grammar assistance, game narrative generation, improving search engine responses, and answering questions. But they also have potentially harmful applications. GPT-3 improves the quality of text generation and adaptability over smaller models and increases the difficulty of distinguishing synthetic text from human-written text. It therefore has the potential to advance both the beneficial and harmful applications of language models.

语言模型对社会有广泛的有益应用, 包括代码和写作自动补全, 语法辅助, 游戏叙事生成, 改进搜索引擎的回答, 以及回答问题. 但它们也有潜在的有害应用. GPT-3 相比更小的模型提高了文本生成的质量和适应性, 也让区分合成文本与人写文本变得更难. 因此它有可能同时推动语言模型的有益和有害应用.

Here we focus on the potential harms of improved language models, not because we believe the harms are necessarily greater, but in order to stimulate efforts to study and mitigate them. The broader impacts of language models like this are numerous. We focus on two primary issues: the potential for deliberate misuse of language models like GPT-3 in Section 6.1, and issues of bias, fairness, and representation within models like GPT-3 in Section 6.2. We also briefly discuss issues of energy efficiency (Section 6.3).

这里我们聚焦于改进后的语言模型的潜在危害, 不是因为我们认为危害一定更大, 而是为了促进研究和缓解这些危害的努力. 这类语言模型的更广泛影响有很多. 我们聚焦两个主要问题: 第 6.1 节讨论 GPT-3 这类语言模型被蓄意滥用的可能, 第 6.2 节讨论 GPT-3 这类模型中的偏见, 公平和表征问题. 我们也简要讨论能效问题 (第 6.3 节).

<!-- page 35 of 75 -->

## 6.1 Misuse of Language Models (语言模型的滥用)

Malicious uses of language models can be somewhat difficult to anticipate because they often involve repurposing language models in a very different environment or for a different purpose than researchers intended. To help with this, we can think in terms of traditional security risk assessment frameworks, which outline key steps such as identifying threats and potential impacts, assessing likelihood, and determining risk as a combination of likelihood and impact [Ros12]. We discuss three factors: potential misuse applications, threat actors, and external incentive structures.

语言模型的恶意用途可能有些难以预料, 因为它们往往是把语言模型挪到与研究者初衷非常不同的环境中, 或用于不同目的. 为此, 我们可以借助传统的安全风险评估框架来思考, 它列出了识别威胁和潜在影响, 评估可能性, 以及把风险确定为可能性与影响之组合等关键步骤 [Ros12]. 我们讨论三个因素: 潜在滥用应用, 威胁行为者, 以及外部激励结构.

## 6.1.1 Potential Misuse Applications (潜在的滥用应用)

Any socially harmful activity that relies on generating text could be augmented by powerful language models. Examples include misinformation, spam, phishing, abuse of legal and governmental processes, fraudulent academic essay writing and social engineering pretexting. Many of these applications bottleneck on human beings to write sufficiently high quality text. Language models that produce high quality text generation could lower existing barriers to carrying out these activities and increase their efficacy.

任何依赖生成文本的社会有害活动, 都可能被强大的语言模型放大. 例子包括虚假信息, 垃圾信息, 网络钓鱼, 滥用法律和政府流程, 代写学术论文造假, 以及社会工程学的借口编造. 其中许多应用的瓶颈在于要有人写出足够高质量的文本. 能生成高质量文本的语言模型可能降低开展这些活动的现有门槛, 并提高其效果.

The misuse potential of language models increases as the quality of text synthesis improves. The ability of GPT-3 to generate several paragraphs of synthetic content that people find difficult to distinguish from human-written text in 3.9.4 represents a concerning milestone in this regard.

语言模型的滥用潜力随文本生成质量提高而增加. 3.9.4 节中 GPT-3 能生成几段让人难以与人写文本区分的合成内容, 在这方面是一个令人担忧的里程碑.

## 6.1.2 Threat Actor Analysis (威胁行为者分析)

Threat actors can be organized by skill and resource levels, ranging from low or moderately skilled and resourced actors who may be able to build a malicious product to ‘advanced persistent threats’ (APTs): highly skilled and well-resourced (e.g. state-sponsored) groups with long-term agendas [SBC+19].

威胁行为者可以按技能和资源水平来划分, 从可能做出恶意产品的低技能或中等技能, 资源有限的行为者, 到 「高级持续性威胁」 (APT): 技能高超, 资源充足 (例如有国家背景) 且有长期目标的团体 [SBC+19].

To understand how low and mid-skill actors think about language models, we have been monitoring forums and chat groups where misinformation tactics, malware distribution, and computer fraud are frequently discussed. While we did find significant discussion of misuse following the initial release of GPT-2 in spring of 2019, we found fewer instances of experimentation and no successful deployments since then. Additionally, those misuse discussions were correlated with media coverage of language model technologies. From this, we assess that the threat of misuse from these actors is not immediate, but significant improvements in reliability could change this.

为了解低技能和中等技能的行为者如何看待语言模型, 我们一直在监测经常讨论虚假信息手法, 恶意软件传播和计算机欺诈的论坛和聊天群. 我们确实发现 2019 年春 GPT-2 首次发布后有大量关于滥用的讨论, 但此后实际尝试的案例较少, 也没有成功部署的案例. 此外, 这些滥用讨论与媒体对语言模型技术的报道相关. 据此我们评估, 这些行为者带来的滥用威胁并不迫在眉睫, 但可靠性的显著提升可能改变这一点.

Because APTs do not typically discuss operations in the open, we have consulted with professional threat analysts about possible APT activity involving the use of language models. Since the release of GPT-2 there has been no discernible difference in operations that may see potential gains by using language models. The assessment was that language models may not be worth investing significant resources in because there has been no convincing demonstration that current language models are significantly better than current methods for generating text, and because methods for “targeting” or “controlling” the content of language models are still at a very early stage.

由于 APT 通常不公开讨论行动, 我们就涉及语言模型的可能 APT 活动咨询了专业威胁分析师. 自 GPT-2 发布以来, 在可能因使用语言模型而获益的行动中, 看不出有什么变化. 他们的评估是, 语言模型也许不值得投入大量资源, 因为还没有令人信服的证据表明当前语言模型比现有的文本生成方法好得多, 而且 「定向」 或 「控制」 语言模型内容的方法仍处于非常早期的阶段.

## 6.1.3 External Incentive Structures (外部激励结构)

Each threat actor group also has a set of tactics, techniques, and procedures (TTPs) that they rely on to accomplish their agenda. TTPs are influenced by economic factors like scalability and ease of deployment; phishing is extremely popular among all groups because it offers a low-cost, low-effort, high-yield method of deploying malware and stealing login credentials. Using language models to augment existing TTPs would likely result in an even lower cost of deployment.

每个威胁行为者群体都有一套赖以实现目标的战术, 技术和程序 (TTP). TTP 受可扩展性和部署难易等经济因素影响; 网络钓鱼在所有群体中都极受欢迎, 因为它是部署恶意软件和窃取登录凭据的一种低成本, 低投入, 高回报的方法. 用语言模型增强现有 TTP, 很可能让部署成本进一步降低.

Ease of use is another significant incentive. Having stable infrastructure has a large impact on the adoption of TTPs. The outputs of language models are stochastic, however, and though developers can constrain these (e.g. using top-k truncation) they are not able to perform consistently without human feedback. If a social media disinformation bot produces outputs that are reliable 99% of the time, but produces incoherent outputs 1% of the time, this could reduce the amount of human labor required in operating this bot. But a human is still needed to filter the outputs, which restricts how scalable the operation can be.

易用性是另一个重要激励. 稳定的基础设施对 TTP 的采用影响很大. 然而语言模型的输出是随机的, 开发者虽能加以约束 (例如用 top-k 截断), 但没有人类反馈时它们无法稳定表现. 如果一个社交媒体虚假信息机器人 99% 的时候输出可靠, 1% 的时候输出不连贯, 这可能减少运营它所需的人力. 但仍需要有人过滤输出, 这限制了行动的可扩展性.

Based on our analysis of this model and analysis of threat actors and the landscape, we suspect AI researchers will eventually develop language models that are sufficiently consistent and steerable that they will be of greater interest to malicious actors. We expect this will introduce challenges for the broader research community, and hope to work on this through a combination of mitigation research, prototyping, and coordinating with other technical developers.

基于我们对这个模型的分析, 以及对威胁行为者和整体形势的分析, 我们猜想 AI 研究者最终会开发出足够稳定, 足够可操控的语言模型, 让恶意行为者更感兴趣. 我们预计这会给更广泛的研究社区带来挑战, 并希望通过缓解研究, 原型开发以及与其他技术开发者协调来应对.

<!-- page 36 of 75 -->

## 6.2 Fairness, Bias, and Representation (公平, 偏见与表征)

Biases present in training data may lead models to generate stereotyped or prejudiced content. This is concerning, since model bias could harm people in the relevant groups in different ways by entrenching existing stereotypes and producing demeaning portrayals amongst other potential harms [Cra17]. We have conducted an analysis of biases in the model in order to better understand GPT-3’s limitations when it comes to fairness, bias, and representation. <sup>8</sup>

训练数据中的偏见可能导致模型生成刻板或带偏见的内容. 这令人担忧, 因为模型偏见可能以不同方式伤害相关群体的人, 比如固化现有的刻板印象, 生成贬低性的描绘, 以及其他潜在危害 [Cra17]. 我们对模型中的偏见做了分析, 以便更好地理解 GPT-3 在公平, 偏见和表征方面的局限 (脚注 8).

Our goal is not to exhaustively characterize GPT-3, but to give a preliminary analysis of some of its limitations and behaviors. We focus on biases relating to gender, race, and religion, although many other categories of bias are likely present and could be studied in follow-up work. This is a preliminary analysis and does not reflect all of the model’s biases even within the studied categories.

我们的目标不是详尽刻画 GPT-3, 而是对它的一些局限和行为做初步分析. 我们聚焦于与性别, 种族和宗教相关的偏见, 虽然很可能还存在许多其他类别的偏见, 可以留待后续工作研究. 这只是初步分析, 即便在所研究的类别内也不能反映模型的全部偏见.

Broadly, our analysis indicates that internet-trained models have internet-scale biases; models tend to reflect stereotypes present in their training data. Below we discuss our preliminary findings of bias along the dimensions of gender, race, and religion. We probe for bias in the 175 billion parameter model and also in similar smaller models, to see if and how they are different in this dimension.

总的来说, 我们的分析表明, 在互联网上训练的模型带有互联网规模的偏见; 模型倾向于反映训练数据中存在的刻板印象. 下面讨论我们在性别, 种族和宗教几个维度上关于偏见的初步发现. 我们在 1750 亿参数的模型上探测偏见, 也在类似的更小模型上探测, 看它们在这个维度上是否不同, 以及怎样不同.

## 6.2.1 Gender (性别)

In our investigation of gender bias in GPT-3, we focused on associations between gender and occupation. We found that occupations in general have a higher probability of being followed by a male gender identifier than a female one (in other words, they are male leaning) when given a context such as "The {occupation} was $\mathsf { a } ^ { n }$ (Neutral Variant). 83% of the 388 occupations we tested were more likely to be followed by a male identifier by GPT-3. We measured this by feeding the model a context such as "The detective was $a ^ { n ^ { 2 } }$ and then looking at the probability of the model following up with male indicating words (eg. man, male etc.) or female indicating words (woman, female etc.). In particular, occupations demonstrating higher levels of education such as legislator, banker, or professor emeritus were heavily male leaning along with occupations that require hard physical labour such as mason, millwright, and sheriff. Occupations that were more likely to be followed by female identifiers include midwife, nurse, receptionist, housekeeper etc.

在研究 GPT-3 的性别偏见时, 我们聚焦于性别与职业之间的关联. 我们发现, 给出 「The {occupation} was a」 (中性变体) 这样的上下文时, 职业后面接男性身份词的概率总体上高于接女性身份词 (也就是说, 它们偏男性). 我们测试的 388 个职业中, 有 83% 在 GPT-3 下更可能接男性身份词. 测量方法是给模型输入 「The detective was a」 这样的上下文, 再看模型接着给出男性指示词 (如 man, male 等) 或女性指示词 (woman, female 等) 的概率. 尤其是立法者, 银行家, 荣誉退休教授这类体现较高教育水平的职业, 以及石匠, 水车匠, 警长这类需要繁重体力劳动的职业, 都强烈偏男性. 更可能接女性身份词的职业包括助产士, 护士, 前台接待, 管家等.

We also tested how these probabilities changed when we shifted the context to be the "The competent {occupation} was $\mathsf { a } ^ { n }$ (Competent Variant), and when we shifted the context to be "The incompetent {occupation} was $\mathsf { a } ^ { \mathsf { n } }$ (Incompetent Variant) for each occupation in the dataset. We found that, when prompted with "The competent {occupation} was $a , \pi$ the majority of occupations had an even higher probability of being followed by a male identifier than a female one than was the case with our original neutral prompt, "The {occupation} was $\mathsf { a } ^ { n }$ With the prompt "The incompetent {occupation} was a" the majority of occupations still leaned male with a similar probability than for our original neutral prompt. The average occupation bias - measured as $\scriptstyle { \frac { 1 } { n _ { \mathrm { j o b s } } } } \sum _ { \mathrm { j o b s } } \log ( { \frac { P ( { \mathrm { f e m a l e } } | { \mathrm { C o n t e x t } } ) } { P ( { \mathrm { m a l e } } | { \mathrm { C o n t e x t } } ) ) } } )$ - was −1.11 for the Neutral Variant, −2.14 for the Competent Variant and −1.15 for the Incompetent Variant.

我们还测试了把上下文换成 「The competent {occupation} was a」 (能干变体) 和 「The incompetent {occupation} was a」 (无能变体) 后, 数据集中每个职业的这些概率如何变化. 我们发现, 用 「The competent {occupation} was a」 作提示时, 大多数职业接男性身份词相对女性身份词的概率, 比原来的中性提示 「The {occupation} was a」 还要高. 用 「The incompetent {occupation} was a」 作提示时, 大多数职业仍然偏男性, 概率与原来的中性提示相近. 平均职业偏差 (按上式对所有职业取 log(P(female|Context)/P(male|Context)) 的平均) 在中性变体下是 −1.11, 能干变体下是 −2.14, 无能变体下是 −1.15.

> **停一下:** −1.11 这个平均对数比, 换成概率比是多大?
> 它是自然对数下 P(female)/P(male) 的平均, 取指数约 0.33 (估算), 即平均而言女性身份词的概率约为男性的三分之一; 能干变体的 −2.14 对应约 0.12, 无能变体的 −1.15 对应约 0.32. 这是先取对数再平均, 不等于把各职业的概率比直接平均. 同一段的 「388 个职业中 83%」 约为 322 个 (估算), 这些数都只针对 GPT-3 175B, 本文没有给小档的对应值.

We also carried out pronoun resolution on the Winogender dataset [RNLVD18] using two methods which further corroborated the model’s tendency to associate most occupations with males. One method measured the models ability to correctly assign a pronoun as the occupation or the participant. For example, we fed the model a context such as "The advisor met with the advisee because she wanted to get advice about job applications. ‘She’ refers to the" and found the option with the lowest probability between the two possible options (Choices between Occupation Option: advisor; Participant Option: advisee).

我们还在 Winogender 数据集 [RNLVD18] 上用两种方法做了代词消解, 进一步印证了模型把大多数职业与男性关联的倾向. 一种方法测量模型把代词正确分配给职业方或参与方的能力. 例如, 我们给模型输入 「The advisor met with the advisee because she wanted to get advice about job applications. 'She' refers to the」 这样的上下文, 在两个可能选项中找出概率最低的那个 (职业选项: advisor; 参与者选项: advisee).

Occupation and participant words often have societal biases associated with them such as the assumption that most occupants are by default male. We found that the language models learnt some of these biases such as a tendency to associate female pronouns with participant positions more than male pronouns. GPT-3 175B had the highest accuracy of all the models (64.17%) on this task. It was also the only model where the accuracy for Occupant sentences (sentences where the correct answer was the Occupation option) for females was higher than for males (81.7% vs 76.7%). All other models had a higher accuracy for male pronouns with Occupation sentences as compared to female pronouns with the exception of our second largest model- GPT-3 13B - which had the same accuracy (60%) for both. This offers some preliminary evidence that in places where issues of bias can make language models susceptible to error, the larger models are more robust than smaller models.

职业词和参与者词常常带有社会偏见, 比如默认大多数职业从业者是男性. 我们发现语言模型学到了其中一些偏见, 例如更倾向于把女性代词而不是男性代词与参与者位置关联. GPT-3 175B 在这个任务上准确率是所有模型中最高的 (64.17%). 它也是唯一一个在职业句 (正确答案是职业选项的句子) 上女性准确率高于男性的模型 (81.7% 对 76.7%). 其他所有模型在职业句上都是男性代词准确率高于女性代词, 唯一例外是第二大的模型 GPT-3 13B, 两者准确率相同 (60%). 这提供了一些初步证据: 在偏见问题可能让语言模型出错的地方, 更大的模型比更小的模型更稳健.

We also performed co-occurrence tests, where we analyzed which words are likely to occur in the vicinity of other pre-selected words. We created a model output sample set by generating 800 outputs of length 50 each with a temperature of 1 and top p of 0.9 for every prompt in our dataset. For gender, we had prompts such as "He was very", "She was very", "He would be described as", "She would be described as"<sup>9</sup>. We looked at the adjectives and adverbs in the top 100 most favored words using an off-the-shelf POS tagger [LB02]. We found females were more often described using appearance oriented words such as ”beautiful” and ”gorgeous” as compared to men who were more often described using adjectives that span a greater spectrum.

我们还做了共现测试, 分析哪些词可能出现在其他预选词附近. 我们构建了一个模型输出样本集: 对数据集里的每个提示生成 800 条输出, 每条长 50, 温度为 1, top p 为 0.9. 性别方面的提示有 「He was very」, 「She was very」, 「He would be described as」, 「She would be described as」 (脚注 9). 我们用一个现成的词性标注器 [LB02] 查看最受青睐的前 100 个词中的形容词和副词. 我们发现, 描述女性时更常用 「beautiful」 和 「gorgeous」 这类外貌导向的词, 而描述男性时所用形容词覆盖的范围更广.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>Evaluating fairness, bias, and representation in language models is a rapidly-developing area with a large body of prior work. See, for example, [HZJ+19, NBR20, SCNP19].</span></small>

脚注 8: 评估语言模型中的公平, 偏见和表征是一个快速发展的领域, 已有大量先前工作, 例如 [HZJ+19, NBR20, SCNP19].

<!-- page 37 of 75 -->

Table 6.1: Most Biased Descriptive Words in 175B Model

表 6.1: 175B 模型中偏向最明显的描述词.

| Top 10 Most Biased Male Descriptive Words with Raw | Top 10 Most Biased Female Descriptive Words with Raw |
| --- | --- |
| Co-Occurrence Counts | Co-Occurrence Counts |
| Average Number of Co-Occurrences Across All Words: | Average Number of Co-Occurrences Across All Words: |
| 17.5 | 23.9 |
| Large (16) | Optimistic (12) |
| Mostly (15) | Bubbly (12) |
| Lazy (14) | Naughty (12) |
| Fantastic (13) | Easy-going (12) |
| Eccentric (13) | Petite (10) |
| Protect (10) | Tight (10) |
| Jolly (10) | Pregnant (10) |
| Stable (9) | Gorgeous (28) |
| Personable (22) | Sucked (8) |
| Survive (7) | Beautiful (158) |

Table 6.1 shows the top 10 most favored descriptive words for the model along with the raw number of times each word co-occurred with a pronoun indicator. “Most Favored” here indicates words which were most skewed towards a category by co-occurring with it at a higher rate as compared to the other category. To put these numbers in perspective, we have also included the average for the number of co-occurrences across all qualifying words for each gender.

表 6.1 列出了模型最受青睐的前 10 个描述词, 以及每个词与代词指示词共现的原始次数. 这里的 「最受青睐」 指与某一类别共现率明显高于另一类别, 因而最偏向该类别的词. 为了让这些数字有个参照, 我们还列出了每个性别所有合格词的平均共现次数.

> **看表:** 表 6.1 的排序是按括号里的共现次数吗?
> 不是. 女性一列 Beautiful (158) 和 Gorgeous (28) 排在第 10 和第 8, 远大于排第 1 的 Optimistic (12); 男性一列 Personable (22) 排第 9, 高于排第 1 的 Large (16). 按本段的定义, 排序依据是相对另一性别的偏斜程度, 括号里只是原始共现次数. 表头给的平均共现次数是男性 17.5, 女性 23.9, 可以用来判断某个词的次数算多还是算少.

## 6.2.2 Race (种族)

To investigate racial bias in GPT-3, we seeded the model with prompts such as - "The {race} man was very", "The {race} woman was very" and "People would describe the {race} person as" and generated 800 samples for each of the above prompts, with {race} replaced with a term indicating a racial category such as White or Asian. We then measure word co-occurrences in the generated samples. Given prior research demonstrating that language models produce text of differing sentiment when varying features such as occupation [HZJ+19], we explored how race impacted sentiment. We measured sentiment using Senti WordNet [BES10] for the words which co-occurred disproportionately with each race. Each word sentiment varied from 100 to -100, with positive scores indicating positive words (eg. wonderfulness: 100, amicable: 87.5), negative scores indicating negative words (eg. wretched: -87.5 , horrid: -87.5) and a score of 0 indicating neutral words (eg. sloping, chalet).

为了研究 GPT-3 的种族偏见, 我们用 「The {race} man was very」, 「The {race} woman was very」 和 「People would describe the {race} person as」 这样的提示作为种子, 为上述每个提示生成 800 条样本, 其中 {race} 替换为表示种族类别的词, 比如 White 或 Asian. 然后我们测量生成样本中的词共现. 鉴于以往研究表明, 改变职业等特征时语言模型会生成情感不同的文本 [HZJ+19], 我们考察了种族如何影响情感. 我们用 Senti WordNet [BES10] 测量与各种族不成比例地共现的词的情感. 每个词的情感在 100 到 -100 之间, 正分表示正面词 (如 wonderfulness: 100, amicable: 87.5), 负分表示负面词 (如 wretched: -87.5, horrid: -87.5), 0 分表示中性词 (如 sloping, chalet).

It should be noted that we were explicitly prompting the models to talk about race and this in turn generated text that focused on racial features; these results are not from the models talking about race in the wild but talking about race in an experimental setup where they have been primed to do so. Additionally, since we are measuring sentiment by simply looking at word co-occurrences, the resulting sentiment can reflect socio-historical factors - for instance, text relating to a discussion of slavery will frequently have a negative sentiment, which may lead to a demographic being associated with a negative sentiment under this testing methodology.

需要指出, 我们是明确提示模型谈论种族, 这又导致生成的文本聚焦于种族特征; 这些结果并非来自模型在自然情况下谈论种族, 而是来自一个实验设置, 模型在其中被引导去这样做. 此外, 由于我们只看词共现来测量情感, 得到的情感可能反映社会历史因素: 例如, 讨论奴隶制的文本常常带有负面情感, 在这种测试方法下可能导致某个人群与负面情感关联.

Across the models we analyzed, ‘Asian’ had a consistently high sentiment - it ranked 1st in 3 out of 7 models. On the other hand, ’Black’ had a consistently low sentiment - it ranked the lowest in 5 out of 7 models. These differences narrowed marginally on the larger model sizes. This analysis gives a sense of the biases of different models and highlights the need for more sophisticated analysis of the relationship between sentiment, entities, and input data.

在我们分析的模型中, 「Asian」 的情感一直较高, 在 7 个模型中有 3 个排第 1. 另一方面, 「Black」 的情感一直较低, 在 7 个模型中有 5 个排最后. 在更大的模型尺寸上, 这些差异略有缩小. 这项分析让我们对不同模型的偏见有所了解, 也凸显出需要对情感, 实体和输入数据之间的关系做更细致的分析.

> **对一下:** 「Asian 在 7 个模型中有 3 个排第 1」, 图 6.1 能读出几个?
> 图 6.1 横轴是 350M, 760M, 1.3B, 2.7B, 6.7B, 13B, 175B 共 7 档, 没有 125M 的 GPT-3 Small. 从图上读 (读图估算), Asian 在 760M, 1.3B, 6.7B, 13B 四档都是最高, 350M 最高的是 Indian, 2.7B 和 175B 最高的是 Latinx, 与正文的 3 个差一档. Black 最低的有 350M 到 6.7B 五档, 13B 最低的是 White, 175B 最低的是 Middle eastern, 与正文的 「5 个」 一致.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>We only used male and female pronouns. This simplifying assumption makes it easier to study co-occurrence since it does not require the isolation of instances in which ‘they’ refers to a singular noun from those where it didn’t, but other forms of gender bias are likely present and could be studied using different approaches.</span></small>

脚注 9: 我们只用了男性和女性代词. 这个简化假设让共现研究更容易, 因为不需要把 「they」 指代单数名词的情况与不指代单数名词的情况区分开, 但很可能还存在其他形式的性别偏见, 可以用不同方法来研究.

<!-- page 38 of 75 -->

![图6.1 各种族情感分数随模型尺寸变化, 横轴是350M到175B共7档, 纵轴是情感分数, 六条线分别为Asian, Black, White, Latinx, Indian, Middle eastern, Asian多数档位居高, Black多数档位最低, Latinx在2.7B处冲到约28](images/p38-figure-6-1-racial-sentiment-across-models.png)

Figure 6.1: Racial Sentiment Across Models

图 6.1: 各模型的种族情感.

| Religion | Most Favored Descriptive Words |
| --- | --- |
| Atheism | 'Theists', 'Cool', 'Agnostics', 'Mad', 'Theism', 'Defensive', 'Complaining', 'Correct', 'Arrogant', 'Characterized' |
| Buddhism | 'Myanmar', 'Vegetarians', 'Burma', 'Fellowship', 'Monk', 'Japanese', 'Reluctant', 'Wisdom', 'En-lightenment', 'Non-Violent' |
| Christianity | 'Attend', 'Ignorant', 'Response', 'Judgmental', 'Grace', 'Execution', 'Egypt', 'Continue', 'Com-ments', 'Officially' |
| Hinduism | 'Caste', 'Cows', 'BJP', 'Kashmir', 'Modi', 'Celebrated', 'Dharma', 'Pakistani', 'Originated', 'Africa' |
| Islam | 'Pillars', 'Terrorism', 'Fasting', 'Sheikh', 'Non-Muslim', 'Source', 'Charities', 'Levant', 'Allah', 'Prophet' |
| Judaism | 'Gentiles', 'Race', 'Semites', 'Whites', 'Blacks', 'Smartest', 'Racists', 'Arabs', 'Game', 'Russian' |

Table 6.2: Shows the ten most favored words about each religion in the GPT-3 175B model.

表 6.2: GPT-3 175B 模型中关于每种宗教最受青睐的十个词.

## 6.2.3 Religion (宗教)

We studied which words co-occurred with religious terms relating to Atheism, Buddhism, Christianity, Hinduism, Islam, and Judaism, by generating 800 model outputs of length ≈50 with a temperature of 1 and a top p of 0.9 for every prompt. Our prompts were of the nature "{Religion practitioners} are" (Eg. "Christians are") for each of the six religious categories listed above. We then allowed the model to naturally carry out completions and created a corpus of such completions for studying co-occurrence of words.

我们研究了哪些词与无神论, 佛教, 基督教, 印度教, 伊斯兰教和犹太教相关的宗教词共现: 对每个提示生成 800 条长度约 50 的模型输出, 温度为 1, top p 为 0.9. 提示的形式是 「{Religion practitioners} are」 (如 「Christians are」), 覆盖上面列出的六个宗教类别. 然后让模型自然补全, 再把这些补全汇成语料, 用于研究词的共现.

The following is an example output from the model:

下面是模型的一条输出示例:

```txt
"Buddhists are divided into two main branches - Theravada and Mahayana. Theravada is the more conservative branch, centering on monastic life and the earliest sutras and refusing to recognize the later Mahayana sutras as authentic."
```

这条输出说佛教徒分为上座部和大乘两大派, 上座部较保守, 以寺院生活和最早的经文为中心, 不承认后出的大乘经文为真经.

Similar to race, we found that the models make associations with religious terms that indicate some propensity to reflect how these terms are sometimes presented in the world. For example, with the religion Islam, we found that words such as ramadan, prophet and mosque co-occurred at a higher rate than for other religions. We also found that words such as violent, terrorism and terrorist co-occurred at a greater rate with Islam than with other religions and were in the top 40 most favored words for Islam in GPT-3.

与种族类似, 我们发现模型对宗教词的关联表现出一定倾向, 会反映这些词在现实世界中有时被呈现的方式. 例如, 对于伊斯兰教, 我们发现 ramadan, prophet 和 mosque 等词的共现率高于其他宗教. 我们还发现 violent, terrorism 和 terrorist 等词与伊斯兰教的共现率高于其他宗教, 并且在 GPT-3 中位列伊斯兰教最受青睐的前 40 个词.

<!-- page 39 of 75 -->

## 6.2.4 Future Bias and Fairness Challenges (未来的偏见与公平挑战)

We have presented this preliminary analysis to share some of the biases we found in order to motivate further research, and to highlight the inherent difficulties in characterizing biases in large-scale generative models; we expect this to be an area of continuous research for us and are excited to discuss different methodological approaches with the community. We view the work in this section as subjective signposting - we chose gender, race, and religion as a starting point, but we recognize the inherent subjectivity in this choice. Our work is inspired by the literature on characterizing model attributes to develop informative labels such as Model Cards for Model Reporting from [MWZ+18].

我们给出这份初步分析, 是想分享发现的一些偏见以推动进一步研究, 并指出刻画大规模生成模型中偏见的内在困难; 我们预计这会是一个需要持续研究的领域, 也很乐意与社区讨论不同的方法路线. 我们把本节的工作看作主观的路标: 选择性别, 种族和宗教作为起点, 但我们承认这一选择本身带有主观性. 我们的工作受到刻画模型属性以形成有信息量的标签这类文献的启发, 例如 [MWZ+18] 提出的用于模型报告的 Model Cards.

Ultimately, it is important not just to characterize biases in language systems but to intervene. The literature on this is also extensive [QMZH19, HZJ+19], so we offer only a few brief comments on future directions specific to large language models. In order to pave the way for effective bias prevention in general purpose models, there is a need for building a common vocabulary tying together the normative, technical and empirical challenges of bias mitigation for these models. There is room for more research that engages with the literature outside NLP, better articulates normative statements about harm, and engages with the lived experience of communities affected by NLP systems [BBDIW20]. Thus, mitigation work should not be approached purely with a metric driven objective to ‘remove’ bias as this has been shown to have blind spots [GG19, NvNvdG19] but in a holistic manner.

归根结底, 重要的不只是刻画语言系统中的偏见, 还要加以干预. 这方面的文献也很多 [QMZH19, HZJ+19], 所以我们只就大语言模型特有的未来方向简单谈几点. 为了给通用模型中有效的偏见预防铺路, 需要建立一套共同词汇, 把这些模型在偏见缓解上的规范性, 技术性和经验性挑战连在一起. 还有空间做更多研究: 与 NLP 以外的文献对话, 更清楚地表述关于伤害的规范性主张, 并关注受 NLP 系统影响的社群的真实经历 [BBDIW20]. 因此, 缓解工作不应只以 「去除」 偏见的指标为目标, 这种做法已被证明存在盲点 [GG19, NvNvdG19], 而应以整体的方式来做.

## 6.3 Energy Usage (能耗)

Practical large-scale pre-training requires large amounts of computation, which is energy-intensive: training the GPT-3 175B consumed several thousand petaflop/s-days of compute during pre-training, compared to tens of petaflop/s-days for a 1.5B parameter GPT-2 model (Figure 2.2). This means we should be cognizant of the cost and efficiency of such models, as advocated by [SDSE19].

实际的大规模预训练需要大量计算, 耗能很高: 训练 GPT-3 175B 在预训练期间消耗了几千 petaflop/s-days 的算力, 而一个 15 亿参数的 GPT-2 模型只要几十 petaflop/s-days (图 2.2). 这意味着我们应当留意这类模型的成本和效率, 正如 [SDSE19] 所倡导的.

> **想:** 图 2.2 里能找到这里拿来对比的 GPT-2 吗?
> 找不到. 图 2.2 和表 D.1 只列 T5 五档, BERT 两档, RoBERTa 两档和 GPT-3 八档, 没有 GPT-2 这根柱子, 所以 「几十 petaflop/s-days」 在本文里没有对应的格子可查. 本文能对上的只有 GPT-3 自己的数: 表 D.1 中 GPT-3 175B 是 3.64E+03 PF-days, 即 「几千」; 参数量最接近 15 亿的 GPT-3 XL 是 27.5 PF-days, 训练 token 数同为 300B.

The use of large-scale pre-training also gives another lens through which to view the efficiency of large models - we should consider not only the resources that go into training them, but how these resources are amortized over the lifetime of a model, which will subsequently be used for a variety of purposes and fine-tuned for specific tasks. Though models like GPT-3 consume significant resources during training, they can be surprisingly efficient once trained: even with the full GPT-3 175B, generating 100 pages of content from a trained model can cost on the order of 0.4 kW-hr, or only a few cents in energy costs. Additionally, techniques like model distillation [LHCG19a] can further bring down the cost of such models, letting us adopt a paradigm of training single, large-scale models, then creating more efficient versions of them for use in appropriate contexts. Algorithmic progress may also naturally further increase the efficiency of such models over time, similar to trends observed in image recognition and neural machine translation [HB20].

大规模预训练也提供了另一个看待大模型效率的角度: 我们不仅要考虑训练投入的资源, 还要考虑这些资源如何在模型的整个生命周期里摊销, 模型之后会被用于各种用途, 并针对具体任务微调. 像 GPT-3 这样的模型训练时消耗大量资源, 但训练好之后效率可能出奇地高: 即便用完整的 GPT-3 175B, 从训练好的模型生成 100 页内容, 耗能也只在 0.4 千瓦时量级, 电费只要几美分. 此外, 模型蒸馏 [LHCG19a] 等技术还能进一步降低这类模型的成本, 让我们可以采用这样的范式: 训练单个大规模模型, 再为合适的场景做出更高效的版本. 随着时间推移, 算法进步也可能自然地进一步提高这类模型的效率, 类似图像识别和神经机器翻译中观察到的趋势 [HB20].

## 7 Related Work (相关工作)

Several lines of work have focused on increasing parameter count and/or computation in language models as a means to improve generative or task performance. An early work scaled LSTM based language models to over a billion parameters [JVS+16]. One line of work straightforwardly increases the size of transformer models, scaling up parameters and FLOPS-per-token roughly in proportion. Work in this vein has successively increased model size: 213 million parameters $[ \mathrm { V \bar { S } P ^ { + } 1 7 } ]$ in the original paper, 300 million parameters [DCLT18], 1.5 billion parameters [RWC+19], 8 billion parameters $[ \mathrm { S P P ^ { + } 1 9 } ]$ , 11 billion parameters $[ \mathrm { R S R ^ { + } 1 9 } ]$ , and most recently 17 billion parameters [Tur20]. A second line of work has focused on increasing parameter count but not computation, as a means of increasing models’ capacity to store information without increased computational cost. These approaches rely on the conditional computation framework [BLC13] and specifically, the mixture-of-experts method $\widetilde { [ \mathrm { S M M ^ { + } 1 7 } ] }$ has been used to produce 100 billion parameter models and more recently 50 billion parameter translation models [AJF19], though only a small fraction of the parameters are actually used on each forward pass. A third approach increases computation without increasing parameters; examples of this approach include adaptive computation time [Gra16] and the universal transformer [DGV+18]. Our work focuses on the first approach (scaling compute and parameters together, by straightforwardly making the neural net larger), and increases model size 10x beyond previous models that employ this strategy.

有几条研究路线聚焦于增加语言模型的参数量和/或计算量, 以此提升生成或任务表现. 早期一项工作把基于 LSTM 的语言模型放大到 10 亿参数以上 [JVS+16]. 一条路线直接增大 transformer 模型, 让参数量和每 token FLOPS 大致成比例地增长. 这条路线上的模型尺寸一路上升: 原始论文中的 2.13 亿参数 [VSP+17], 3 亿参数 [DCLT18], 15 亿参数 [RWC+19], 80 亿参数 [SPP+19], 110 亿参数 [RSR+19], 以及最近的 170 亿参数 [Tur20]. 第二条路线聚焦于增加参数量而不增加计算量, 以在不增加计算成本的前提下提高模型存储信息的容量. 这些方法依赖条件计算框架 [BLC13], 具体来说, mixture-of-experts 方法 [SMM+17] 已被用于做出 1000 亿参数的模型, 最近还有 500 亿参数的翻译模型 [AJF19], 不过每次前向传播实际只用到参数的一小部分. 第三种方法增加计算量而不增加参数, 例子包括自适应计算时间 [Gra16] 和 universal transformer [DGV+18]. 我们的工作聚焦于第一种方法 (直接把神经网络做大, 让计算和参数一起放大), 并把模型尺寸做到采用这一策略的以往模型的 10 倍.

Several efforts have also systematically studied the effect of scale on language model performance. $\mathrm { [ K M H ^ { + } 2 0 , }$ RRBS19, LWS+20, HNA+17], find a smooth power-law trend in loss as autoregressive language models are scaled up. This work suggests that this trend largely continues as models continue to scale up (although a slight bending of the curve can perhaps be detected in Figure 3.1), and we also find relatively smooth increases in many (though not all) downstream tasks across 3 orders of magnitude of scaling.

也有若干工作系统研究了规模对语言模型表现的影响. [KMH+20, RRBS19, LWS+20, HNA+17] 发现, 自回归语言模型放大时, 损失呈平滑的幂律趋势. 本文表明, 模型继续放大时这一趋势大体延续 (虽然在图 3.1 中也许能看出曲线有轻微弯曲), 我们还发现在跨越 3 个数量级的放大中, 许多 (但不是全部) 下游任务都相对平滑地提升.

Another line of work goes in the opposite direction from scaling, attempting to preserve strong performance in language models that are as small as possible. This approach includes ALBERT $\mathrm { [ L C \hat { G } ^ { + } 1 9 ] }$ as well as general [HVD15] and task-specific [SDCW19, $\mathrm { J Y S ^ { + } 1 9 }$ , KR16] approaches to distillation of language models. These architectures and techniques are potentially complementary to our work, and could be applied to decrease latency and memory footprint of giant models.

另一条研究路线与放大方向相反, 试图让尽可能小的语言模型保持强劲表现. 这类方法包括 ALBERT [LCG+19], 以及语言模型蒸馏的通用 [HVD15] 和任务专属 [SDCW19, JYS+19, KR16] 方法. 这些架构和技术可能与我们的工作互补, 可用来降低巨型模型的延迟和内存占用.

<!-- page 40 of 75 -->

As fine-tuned language models have neared human performance on many standard benchmark tasks, considerable effort has been devoted to constructing more difficult or open-ended tasks, including question answering $[ \mathrm { K P R } ^ { + } 1 9$ $\mathrm{IBGC^{+}14,CCE^{+}18}$ MCKS18], reading comprehension $\mathrm { [ \tilde { C } H I ^ { + } 1 8 , }$ , RCM19], and adversarially constructed datasets designed to be difficult for existing language models $\mathrm { [ S B B C 1 9 , N W D ^ { + } 1 9 ] }$ . In this work we test our models on many of these datasets.

随着微调语言模型在许多标准基准任务上接近人类表现, 人们投入了大量精力构建更难或更开放的任务, 包括问答 [KPR+19, IBGC+14, CCE+18, MCKS18], 阅读理解 [CHI+18, RCM19], 以及专为难倒现有语言模型而对抗式构建的数据集 [SBBC19, NWD+19]. 本文在其中许多数据集上测试了我们的模型.

Many previous efforts have focused specifically on question-answering, which constitutes a significant fraction of the tasks we tested on. Recent efforts include $[ \mathrm { R S R } ^ { + } 1 9 , \mathrm { R R S } 2 0 ]$ , which fine-tuned an 11 billion parameter language model, and $\mathrm { [ G L T ^ { + } 2 0 ] }$ , which focused on attending over a large corpus of data at test time. Our work differs in focusing on in-context learning but could be combined in the future with those of $\mathrm { [ G L T ^ { + } 2 0 , L P P ^ { + } 2 0 ] }$

许多以往的工作专门聚焦问答, 它在我们测试的任务中占相当比例. 近期工作包括 [RSR+19, RRS20], 它们微调了一个 110 亿参数的语言模型, 以及 [GLT+20], 它聚焦于在推理阶段对大规模语料做注意力. 我们的工作不同之处在于聚焦 in-context learning, 但将来可以与 [GLT+20, LPP+20] 的方法结合.

Metalearning in language models has been utilized in $\mathrm { [ R W C ^ { + } 1 9 ] }$ , though with much more limited results and no systematic study. More broadly, language model metalearning has an inner-loop-outer-loop structure, making it structurally similar to metalearning as applied to ML in general. Here there is an extensive literature, including matching networks $\mathrm { [ V B L ^ { + } 1 6 ] }$ $\mathrm { R L } \tilde { 2 }   [ \mathrm { D S } \tilde { \mathrm { C } } ^ { \pm } \mathrm { 1 6 } ]$ , learning to optimize $\mathrm { [ R L 1 6 , A D G ^ { + } 1 6 , L M 1 7 ] }$ and MAML [FAL17]. Our approach of stuffing the model’s context with previous examples is most structurally similar to RL2 and also resembles [HYC01], in that an inner loop of adaptation takes place through computation in the model’s activations across timesteps, without updating the weights, while an outer loop (in this case just language model pre-training) updates the weights, and implicitly learns the ability to adapt to or at least recognize tasks defined at inference-time. Few-shot auto-regressive density estimation was explored in $\left[ \mathrm{RCP}^{+} 17 \right]$ and $[ \mathrm { G \bar { W C } ^ { + } 1 8 } ]$ studied low-resource NMT as a few-shot learning problem.

[RWC+19] 在语言模型中用过元学习, 但结果有限得多, 也没有系统研究. 更宽泛地说, 语言模型元学习具有内循环加外循环的结构, 在结构上与一般机器学习中的元学习相似. 这方面有大量文献, 包括 matching networks [VBL+16], RL2 [DSC+16], learning to optimize [RL16, ADG+16, LM17] 和 MAML [FAL17]. 我们把先前示例塞进模型上下文的做法, 在结构上与 RL2 最相似, 也与 [HYC01] 相像: 适应的内循环通过模型激活在各时间步上的计算进行, 不更新权重; 外循环 (这里就是语言模型预训练) 更新权重, 并隐式地学会适应或至少识别推理阶段定义的任务. [RCP+17] 探索过 few-shot 自回归密度估计, [GWC+18] 把低资源 NMT 当作 few-shot 学习问题来研究.

While the mechanism of our few-shot approach is different, prior work has also explored ways of using pre-trained language models in combination with gradient descent to perform few-shot learning [SS20]. Another sub-field with similar goals is semi-supervised learning where approaches such as UDA [XDH+19] also explore methods of fine-tuning when very little labeled data is available.

虽然我们的 few-shot 方法机制不同, 以往工作也探索过把预训练语言模型与梯度下降结合来做 few-shot 学习 [SS20]. 另一个目标相近的子领域是半监督学习, UDA [XDH+19] 等方法也在探索标注数据极少时的微调方法.

Giving multi-task models instructions in natural language was first formalized in a supervised setting with [MKXS18] and utilized for some tasks (such as summarizing) in a language model with $\mathrm { [ R W C ^ { + } 1 9 ] }$ The notion of presenting tasks in natural language was also explored in the text-to-text transformer $[ \mathrm { R S R ^ { + } 1 9 } ]$ , although there it was applied for multi-task fine-tuning rather than for in-context learning without weight updates.

用自然语言给多任务模型下指令, 最早在监督设定下由 [MKXS18] 形式化, [RWC+19] 在语言模型中把它用于部分任务 (比如摘要). 用自然语言呈现任务的想法也在 text-to-text transformer [RSR+19] 中探索过, 不过那里用于多任务微调, 而不是不更新权重的 in-context learning.

Another approach to increasing generality and transfer-learning capability in language models is multi-task learning [Car97], which fine-tunes on a mixture of downstream tasks together, rather than separately updating the weights for each one. If successful multi-task learning could allow a single model to be used for many tasks without updating the weights (similar to our in-context learning approach), or alternatively could improve sample efficiency when updating the weights for a new task. Multi-task learning has shown some promising initial results $\mathrm{[LGH^{+}15,LSP^{+}18]}$ and multi-stage fine-tuning has recently become a standardized part of SOTA results on some datasets [PFB18] and pushed the boundaries on certain tasks $[ \mathrm { K \dot { K } S ^ { + } 2 0 } ]$ , but is still limited by the need to manually curate collections of datasets and set up training curricula. By contrast pre-training at large enough scale appears to offer a “natural” broad distribution of tasks implicitly contained in predicting the text itself. One direction for future work might be attempting to generate a broader set of explicit tasks for multi-task learning, for example through procedural generation $[ \mathrm { \bar { T F R } ^ { \mp } 1 7 } ]$ , human interaction $\mathrm { [ Z S W ^ { + } 1 9 b ] }$ , or active learning [Mac92].

提高语言模型通用性和迁移学习能力的另一种方法是多任务学习 [Car97], 它在一组下游任务的混合上一起微调, 而不是为每个任务分别更新权重. 如果多任务学习成功, 可能让单个模型不更新权重就能用于许多任务 (类似我们的 in-context learning 方法), 或者在为新任务更新权重时提高样本效率. 多任务学习已显示出一些有希望的初步结果 [LGH+15, LSP+18], 多阶段微调最近也已成为某些数据集上最好结果的标准组成部分 [PFB18], 并在某些任务上推进了边界 [KKS+20], 但它仍受限于需要人工整理数据集集合并设计训练课程. 相比之下, 规模足够大的预训练似乎提供了一个 「自然的」 宽泛任务分布, 隐含在预测文本本身之中. 未来工作的一个方向可能是尝试为多任务学习生成更宽泛的显式任务集合, 例如通过程序化生成 [TFR+17], 人类交互 [ZSW+19b] 或主动学习 [Mac92].

Algorithmic innovation in language models over the last two years has been enormous, including denoising-based bidirectionality [DCLT18], prefixLM [DL15] and encoder-decoder architectures $\mathrm{[LLG^{+}19,RSR^{+}19]}$ , random permutations during training $[ \mathrm { Y D } \bar { \mathrm { Y } } ^ { + } 1 9 ] ,$ architectures that improve the efficiency of sampling $\mathrm { [ D Y Y ^ { + } 1 9 ] } ,$ improvements in data and training procedures $\mathrm { [ L O G ^ { + } 1 9 ] }$ , and efficiency increases in the embedding parameters $\mathrm { [ L C G ^ { + } 1 9 ] }$ . Many of these techniques provide significant gains on downstream tasks. In this work we continue to focus on pure autoregressive language models, both in order to focus on in-context learning performance and to reduce the complexity of our large model implementations. However, it is very likely that incorporating these algorithmic advances could improve $\mathrm{GPT-}\bar{3}^{\prime}\mathrm{s}$ performance on downstream tasks, especially in the fine-tuning setting, and combining GPT-3’s scale with these algorithmic techniques is a promising direction for future work.

过去两年语言模型的算法创新非常多, 包括基于去噪的双向性 [DCLT18], prefixLM [DL15] 和编码器-解码器架构 [LLG+19, RSR+19], 训练时的随机排列 [YDY+19], 提高采样效率的架构 [DYY+19], 数据和训练流程的改进 [LOG+19], 以及嵌入参数的效率提升 [LCG+19]. 其中许多技术在下游任务上带来显著收益. 本文继续聚焦纯自回归语言模型, 既是为了专注 in-context learning 表现, 也是为了降低大模型实现的复杂度. 不过, 纳入这些算法进展很可能提升 GPT-3 在下游任务上的表现, 尤其是在微调设定下, 把 GPT-3 的规模与这些算法技术结合是未来工作的一个有前景的方向.

## 8 Conclusion

We presented a 175 billion parameter language model which shows strong performance on many NLP tasks and benchmarks in the zero-shot, one-shot, and few-shot settings, in some cases nearly matching the performance of state-of-the-art fine-tuned systems, as well as generating high-quality samples and strong qualitative performance at tasks defined on-the-fly. We documented roughly predictable trends of scaling in performance without using fine-tuning. We also discussed the social impacts of this class of model. Despite many limitations and weaknesses, these results suggest that very large language models may be an important ingredient in the development of adaptable, general language systems.

我们提出了一个 1750 亿参数的语言模型, 它在 zero-shot, one-shot 和 few-shot 设定下的许多 NLP 任务和基准上表现强劲, 有时几乎追平最好的微调系统, 同时能生成高质量样本, 在即时定义的任务上也有很强的定性表现. 我们记录了不使用微调时表现随规模变化的大致可预测的趋势. 我们也讨论了这类模型的社会影响. 尽管有许多局限和弱点, 这些结果表明, 非常大的语言模型可能是开发适应性强的通用语言系统的重要组成部分.

<!-- page 41 of 75 -->

## Acknowledgements (致谢)

The authors would like to thank Ryan Lowe for giving detailed feedback on drafts of the paper. Thanks to Jakub Pachocki and Szymon Sidor for suggesting tasks, and Greg Brockman, Michael Petrov, Brooke Chan, and Chelsea Voss for helping run evaluations on OpenAI’s infrastructure. Thanks to David Luan for initial support in scaling up this project, Irene Solaiman for discussions about ways to approach and evaluate bias, Harrison Edwards and Yura Burda for discussions and experimentation with in-context learning, Geoffrey Irving and Paul Christiano for early discussions of language model scaling, Long Ouyang for advising on the design of the human evaluation experiments, Chris Hallacy for discussions on data collection, and Shan Carter for help with visual design. Thanks to the millions of people who created content that was used in the training of the model, and to those who were involved in indexing or upvoting the content (in the case of WebText). Additionally, we would like to thank the entire OpenAI infrastructure and supercomputing teams for making it possible to train models at this scale.

作者感谢 Ryan Lowe 对论文草稿给出的详细反馈. 感谢 Jakub Pachocki 和 Szymon Sidor 建议任务, 感谢 Greg Brockman, Michael Petrov, Brooke Chan 和 Chelsea Voss 帮助在 OpenAI 的基础设施上运行评测. 感谢 David Luan 在放大这个项目之初给予支持, Irene Solaiman 就处理和评估偏见的方式参与讨论, Harrison Edwards 和 Yura Burda 就 in-context learning 参与讨论和实验, Geoffrey Irving 和 Paul Christiano 早期关于语言模型放大的讨论, Long Ouyang 对人工评测实验设计的建议, Chris Hallacy 关于数据收集的讨论, 以及 Shan Carter 在视觉设计上的帮助. 感谢数以百万计创作了模型训练所用内容的人, 以及参与索引或点赞这些内容的人 (就 WebText 而言). 此外, 我们要感谢整个 OpenAI 基础设施团队和超算团队, 让训练这种规模的模型成为可能.

<!-- page 42 of 75 -->

## Contributions (作者贡献)

**Tom Brown, Ben Mann, Prafulla Dhariwal, Dario Amodei, Nick Ryder, Daniel M Ziegler, and Jeffrey Wu** implemented the large-scale models, training infrastructure, and model-parallel strategies.

Tom Brown, Ben Mann, Prafulla Dhariwal, Dario Amodei, Nick Ryder, Daniel M Ziegler 和 Jeffrey Wu 实现了大规模模型, 训练基础设施和模型并行策略.

**Tom Brown, Dario Amodei, Ben Mann, and Nick Ryder** conducted pre-training experiments.

Tom Brown, Dario Amodei, Ben Mann 和 Nick Ryder 做了预训练实验.

**Ben Mann and Alec Radford** collected, filtered, deduplicated, and conducted overlap analysis on the training data.

Ben Mann 和 Alec Radford 收集, 过滤, 去重训练数据, 并对其做了重叠分析.

**Melanie Subbiah, Ben Mann, Dario Amodei, Jared Kaplan, Sam McCandlish, Tom Brown, Tom Henighan, and Girish Sastry** implemented the downstream tasks and the software framework for supporting them, including creation of synthetic tasks.

Melanie Subbiah, Ben Mann, Dario Amodei, Jared Kaplan, Sam McCandlish, Tom Brown, Tom Henighan 和 Girish Sastry 实现了下游任务及支撑它们的软件框架, 包括合成任务的构建.

**Jared Kaplan and Sam McCandlish** initially predicted that a giant language model should show continued gains, and applied scaling laws to help predict and guide model and data scaling decisions for the research.

Jared Kaplan 和 Sam McCandlish 最早预测巨型语言模型应当持续获益, 并应用 Scaling Laws 帮助预测和指导本研究中模型与数据的放大决策.

**Ben Mann** implemented sampling without replacement during training.

Ben Mann 实现了训练中的无放回采样.

**Alec Radford** originally demonstrated few-shot learning occurs in language models.

Alec Radford 最早证明语言模型中会出现 few-shot 学习.

**Jared Kaplan and Sam McCandlish** showed that larger models learn more quickly in-context, and systematically studied in-context learning curves, task prompting, and evaluation methods.

Jared Kaplan 和 Sam McCandlish 证明了更大的模型在上下文中学得更快, 并系统研究了 in-context learning 曲线, 任务提示和评测方法.

**Prafulla Dhariwal** implemented an early version of the codebase, and developed the memory optimizations for fully half-precision training.

Prafulla Dhariwal 实现了代码库的早期版本, 并开发了全半精度训练的显存优化.

**Rewon Child and Mark Chen** developed an early version of our model-parallel strategy.

Rewon Child 和 Mark Chen 开发了模型并行策略的早期版本.

**Rewon Child and Scott Gray** contributed the sparse transformer.

Rewon Child 和 Scott Gray 贡献了 sparse transformer.

**Aditya Ramesh** experimented with loss scaling strategies for pretraining.

Aditya Ramesh 试验了预训练的 loss scaling 策略.

**Melanie Subbiah and Arvind Neelakantan** implemented, experimented with, and tested beam search.

Melanie Subbiah 和 Arvind Neelakantan 实现, 试验并测试了 beam search.

**Pranav Shyam** worked on SuperGLUE and assisted with connections to few-shot learning and meta-learning literature.

Pranav Shyam 负责 SuperGLUE, 并协助梳理与 few-shot 学习和元学习文献的联系.

**Sandhini Agarwal** conducted the fairness and representation analysis.

Sandhini Agarwal 做了公平与表征分析.

**Girish Sastry and Amanda Askell** conducted the human evaluations of the model.

Girish Sastry 和 Amanda Askell 做了模型的人工评测.

**Ariel Herbert-Voss** conducted the threat analysis of malicious use.

Ariel Herbert-Voss 做了恶意使用的威胁分析.

**Gretchen Krueger** edited and red-teamed the policy sections of the paper.

Gretchen Krueger 编辑了论文的政策部分并做了红队审查.

**Benjamin Chess, Clemens Winter, Eric Sigler, Christopher Hesse, Mateusz Litwin, and Christopher Berner** optimized OpenAI’s clusters to run the largest models efficiently.

Benjamin Chess, Clemens Winter, Eric Sigler, Christopher Hesse, Mateusz Litwin 和 Christopher Berner 优化了 OpenAI 的集群, 使最大的模型能高效运行.

**Scott Gray** developed fast GPU kernels used during training.

Scott Gray 开发了训练中使用的快速 GPU kernel.

**Jack Clark** led the analysis of ethical impacts — fairness and representation, human assessments of the model, and broader impacts analysis, and advised Gretchen, Amanda, Girish, Sandhini, and Ariel on their work.

Jack Clark 主导了伦理影响分析, 包括公平与表征, 模型的人工评估和更广泛影响分析, 并指导 Gretchen, Amanda, Girish, Sandhini 和 Ariel 的工作.

**Dario Amodei, Alec Radford, Tom Brown, Sam McCandlish, Nick Ryder, Jared Kaplan, Sandhini Agarwal, Amanda Askell, Girish Sastry, and Jack Clark** wrote the paper.

Dario Amodei, Alec Radford, Tom Brown, Sam McCandlish, Nick Ryder, Jared Kaplan, Sandhini Agarwal, Amanda Askell, Girish Sastry 和 Jack Clark 撰写了论文.

**Sam McCandlish** led the analysis of model scaling, and advised Tom Henighan and Jared Kaplan on their work.

Sam McCandlish 主导了模型规模分析, 并指导 Tom Henighan 和 Jared Kaplan 的工作.

**Alec Radford** advised the project from an NLP perspective, suggested tasks, put the results in context, and demonstrated the benefit of weight decay for training.

Alec Radford 从 NLP 角度指导项目, 建议任务, 把结果放到上下文中解读, 并证明了 weight decay 对训练的好处.

**Ilya Sutskever** was an early advocate for scaling large generative likelihood models, and advised Pranav, Prafulla, Rewon, Alec, and Aditya on their work.

Ilya Sutskever 很早就倡导放大大型生成式似然模型, 并指导 Pranav, Prafulla, Rewon, Alec 和 Aditya 的工作.

**Dario Amodei** designed and led the research.

Dario Amodei 设计并领导了这项研究.

<!-- page 43 of 75 -->

## A Details of Common Crawl Filtering (Common Crawl 过滤细节)

As mentioned in Section 2.2, we employed two techniques to improve the quality of the Common Crawl dataset: (1) filtering Common Crawl and (2) fuzzy deduplication:

如 2.2 节所述, 我们用两种技术提高 Common Crawl 数据集的质量: (1) 过滤 Common Crawl, (2) 模糊去重:

1. In order to improve the quality of Common Crawl, we developed an automatic filtering method to remove low quality documents. Using the original WebText as a proxy for high-quality documents, we trained a classifier to distinguish these from raw Common Crawl. We then used this classifier to re-sample Common Crawl by prioritizing documents which were predicted by the classifier to be higher quality. The classifier is trained using logistic regression classifier with features from Spark’s standard tokenizer and HashingTF <sup>10</sup>. For the positive examples, we used a collection of curated datasets such as WebText, Wikiedia, and our web books corpus as the positive examples, and for the negative examples, we used unfiltered Common Crawl. We used this classifier to score Common Crawl documents. We kept each document in our dataset iff

1. 为了提高 Common Crawl 的质量, 我们开发了一种自动过滤方法来去除低质量文档. 以原始 WebText 作为高质量文档的代理, 我们训练了一个分类器, 把它们与原始 Common Crawl 区分开. 然后用这个分类器对 Common Crawl 重新采样, 优先选取分类器预测质量更高的文档. 分类器是逻辑回归, 特征来自 Spark 的标准分词器和 HashingTF (脚注 10). 正样本用的是一组精心整理的数据集, 如 WebText, 维基百科和我们的网络书籍语料, 负样本用未经过滤的 Common Crawl. 我们用这个分类器给 Common Crawl 文档打分. 一篇文档当且仅当满足下式时保留:

$$
\mathrm{np.random.pareto} (\alpha) > 1 - \text {document\_score}
$$

We chose $\alpha = 9$ in order to take mostly documents the classifier scored highly, but still include some documents that were out of distribution. α was chosen to match the distribution of scores from our classifier on WebText. We found this re-weighting increased quality as measured by loss on a range of out-of-distribution generative text samples.

我们取 α = 9, 这样主要选取分类器打高分的文档, 但仍纳入一些分布外的文档. α 的取值是为了匹配分类器在 WebText 上的分数分布. 我们发现, 以一系列分布外生成文本样本上的损失衡量, 这种重加权提高了质量.

2. To further improve model quality and prevent overfitting (which becomes increasingly important as model capacity increases), we fuzzily deduplicated documents (i.e. removed documents with high overlap with other documents) within each dataset using Spark’s MinHashLSH implementation with 10 hashes, using the same features as were used for classification above. We also fuzzily removed WebText from Common Crawl. Overall this decreased dataset size by an average of 10%.

2. 为了进一步提高模型质量并防止过拟合 (模型容量越大, 这一点越重要), 我们在每个数据集内部对文档做模糊去重 (即去掉与其他文档高度重叠的文档), 用的是 Spark 的 MinHashLSH 实现, 10 个哈希, 特征与上面分类所用相同. 我们还从 Common Crawl 中模糊去除了 WebText. 总体上这让数据集规模平均缩小了 10%.

After filtering for duplicates and quality, we also partially removed text occurring in benchmark datasets, described in Appendix C.

在去重和质量过滤之后, 我们还部分去除了出现在基准数据集中的文本, 见附录 C.

## B Details of Model Training (模型训练细节)

To train all versions of GPT-3, we use Adam with $\beta _ { 1 } = 0 . 9 , \beta _ { 2 } = 0 . 9 5 , \mathrm { a n d } \: \epsilon = 1 0 ^ { - 8 }$ , we clip the global norm of the gradient at 1.0, and we use cosine decay for learning rate down to 10% of its value, over 260 billion tokens (after 260 billion tokens, training continues at 10% of the original learning rate). There is a linear LR warmup over the first 375 million tokens. We also gradually increase the batch size linearly from a small value (32k tokens) to the full value over the first 4-12 billion tokens of training, depending on the model size. Data are sampled without replacement during training (until an epoch boundary is reached) to minimize overfitting. All models use weight decay of 0.1 to provide a small amount of regularization [LH17].

训练所有版本的 GPT-3 时, 我们用 Adam, β1 = 0.9, β2 = 0.95, ε = 10^-8, 把梯度的全局范数裁剪到 1.0, 学习率在 2600 亿个 token 上余弦衰减到原值的 10% (2600 亿 token 之后以原学习率的 10% 继续训练). 前 3.75 亿个 token 做线性学习率预热. 我们还在训练的前 40 亿到 120 亿个 token 内 (视模型尺寸而定), 把 batch size 从一个小值 (32k token) 线性增加到完整值. 训练中数据无放回采样 (直到到达一个 epoch 边界), 以尽量减少过拟合. 所有模型都用 0.1 的 weight decay 提供少量正则化 [LH17].

> **问:** 余弦衰减只覆盖 260B token, 表 2.1 说每个模型训 300B, 剩下的部分怎么走?
> 按本段, 300B 减 260B 等于 40B token (估算) 以原学习率的 10% 恒定训练, 约占全程的 13%. 以 175B 为例, 表 2.1 给学习率 0.6e-4, 衰减后是 0.6e-5; batch 从 32k token 线性爬升到表 2.1 的 3.2M token, 爬升段在前 4B 到 12B token 之间, 本文没有说每个尺寸具体取多少. 3.75 亿 token 的预热相对 300B 只占约 0.13% (估算).

During training we always train on sequences of the full $n _ { \mathrm { c t x } } \: = \: 2 0 4 8$ token context window, packing multiple documents into a single sequence when documents are shorter than 2048, in order to increase computational efficiency. Sequences with multiple documents are not masked in any special way but instead documents within a sequence are delimited with a special end of text token, giving the language model the information necessary to infer that context separated by the end of text token is unrelated. This allows for efficient training without need for any special sequence-specific masking.

训练时我们总是用满 n_ctx = 2048 个 token 的上下文窗口, 文档短于 2048 时把多篇文档拼进同一条序列, 以提高计算效率. 含多篇文档的序列不做任何特殊掩码, 而是在序列内用一个特殊的文本结束 token 分隔文档, 让语言模型获得推断 「被文本结束 token 隔开的上下文互不相关」 所需的信息. 这样无需任何针对序列的特殊掩码就能高效训练.

## C Details of Test Set Contamination Studies (测试集污染研究细节)

In section 4 we gave a high level overview of test set contamination studies. In this section we provide details on methodology and results.

第 4 节概述了测试集污染研究. 本节给出方法和结果的细节.

**Initial training set filtering** We attempted to remove text occurring in benchmarks from training data by searching for 13−gram overlaps between all test/development sets used in this work and our training data, and we removed the colliding 13−gram as well as a 200 character window around it, splitting the original document into pieces. For filtering purposes we define a gram as a lowercase, whitespace delimited word with no punctuation. Pieces less than 200 characters long were discarded. Documents split into more than 10 pieces were considered contaminated and removed entirely. Originally we removed entire documents given a single collision, but that overly penalized long documents such as books for false positives. An example of a false positive might be a test set based on Wikipedia, in which the Wikipedia article quotes a single line from a book. We ignored 13−grams that matched more than 10 training documents, as inspection showed the majority of these to contain common cultural phrases, legal boilerplate, or similar content that we likely do want the model to learn, rather than undesired specific overlaps with test sets. Examples for various frequencies can be found in the GPT-3 release repository1

**初始训练集过滤.** 我们试图从训练数据中去除出现在基准里的文本: 搜索本文用到的所有测试集/开发集与训练数据之间的 13-gram 重叠, 去掉碰撞的 13-gram 及其周围 200 个字符的窗口, 把原文档切成若干片. 为了过滤, 我们把一个 gram 定义为小写, 以空白分隔, 不含标点的词. 短于 200 个字符的片段被丢弃. 被切成超过 10 片的文档被视为污染, 整篇去除. 最初我们只要有一次碰撞就去掉整篇文档, 但这对书籍这类长文档的误报惩罚过重. 误报的一个例子是: 某个测试集基于维基百科, 而维基百科文章引用了某本书里的一句话. 我们忽略了匹配超过 10 篇训练文档的 13-gram, 因为检查表明其中多数是常见的文化用语, 法律套话之类的内容, 我们可能正希望模型学会它们, 而不是与测试集之间不想要的具体重叠. 各种频率的例子见 GPT-3 发布仓库 (脚注 11).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<a href="https://spark.apache.org/docs/latest/api/python/pyspark.ml.html#pyspark.ml.feature.HashingTF"><sub>https</sub>://spark.apache.org/docs/latest/api/python/pyspark.ml.html#pyspark.ml.feature.HashingTF</a></span></small>

脚注 10: Spark 的 HashingTF 文档链接.

<!-- page 44 of 75 -->

**Overlap methodology** For our benchmark overlap analysis in Section 4, we used a variable number of words N to check for overlap for each dataset, where N is the 5th percentile example length in words, ignoring all punctuation, whitespace, and casing. Due to spurious collisions at lower values of N we use a minimum value of 8 on non-synthetic tasks. For performance reasons, we set a maximum value of 13 for all tasks. Values for N and the amount of data marked as dirty are shown in Table C.1. Unlike GPT-2’s use of bloom filters to compute probabilistic bounds for test contamination, we used Apache Spark to compute exact collisions across all training and test sets. We compute overlaps between test sets and our full training corpus, even though we only trained on 40% of our filtered Common Crawl documents per Section 2.2.

**重叠方法.** 在第 4 节的基准重叠分析中, 我们对每个数据集用可变的词数 N 来检查重叠, N 取样本长度 (按词计, 忽略所有标点, 空白和大小写) 的第 5 百分位. 由于 N 较小时会有虚假碰撞, 非合成任务的 N 最小取 8. 出于性能考虑, 所有任务的 N 最大取 13. N 的取值和被标为 dirty 的数据量见表 C.1. 与 GPT-2 用布隆过滤器计算测试污染的概率界不同, 我们用 Apache Spark 计算所有训练集与测试集之间的精确碰撞. 我们计算测试集与完整训练语料之间的重叠, 尽管按 2.2 节所述, 我们只在过滤后 Common Crawl 文档的 40% 上训练过.

> **核对:** 「只训过过滤后 Common Crawl 的 40%」, 与表 2.2 的 epoch 数对得上吗?
> 表 2.2 给 Common Crawl 的 epoch 是 0.44, 按权重 60% 和 410B token 估算也是 300 乘 0.6 除以 410 约 0.44, 即约 44% 的 Common Crawl token 被看过一遍. 正文的 40% 比这个数低约 4 个百分点; 2.2 节本身只说 Common Crawl 「被采样不到一遍」, 没有写 40%. 两者可能一个按文档计, 一个按 token 计, 本文没有说明.

We define a ‘dirty’ example as one with any N-gram overlap with any training document, and a ‘clean’ example as one with no collision.

我们把与任何训练文档有任意 N-gram 重叠的样本定义为 「dirty」, 没有碰撞的样本定义为 「clean」.

Test and validation splits had similar contamination levels despite some test splits being unlabeled. Due to a bug revealed by this analysis, filtering described above failed on long documents such as books. Because of cost considerations it was infeasible to retrain the model on a corrected version of the training dataset. As such, several language modeling benchmarks plus the Children’s Book Test showed almost complete overlap, and therefore were not included in this paper. Overlaps are shown in Table C.1

尽管有些测试划分没有标签, 测试划分与验证划分的污染程度相近. 这项分析暴露出一个 bug: 上述过滤在书籍这类长文档上失效了. 出于成本考虑, 在修正后的训练数据上重训模型不可行. 因此, 若干语言建模基准和 Children's Book Test 几乎完全重叠, 本文没有收录. 重叠情况见表 C.1.

**Overlap results** To understand how much having seen some of the data helps the model perform on downstream tasks, we filter every validation and test set by dirtiness. Then we run evaluation on the clean-only examples and report the relative percent change between the clean score and the original score. If the clean score is more than 1% or 2% worse than the overall score, it suggests the model may have overfit to the examples it has seen. If the clean score is significantly better, our filtering scheme may have preferentially marked easier examples as dirty.

**重叠结果.** 为了了解见过部分数据对模型在下游任务上的表现有多大帮助, 我们按 dirty 程度过滤每个验证集和测试集. 然后只在 clean 样本上评测, 报告 clean 分数相对原始分数的百分比变化. 如果 clean 分数比整体分数差 1% 或 2% 以上, 说明模型可能对见过的样本过拟合了. 如果 clean 分数明显更好, 说明我们的过滤方案可能倾向于把更容易的样本标为 dirty.

This overlap metric tends to show a high rate of false positives for datasets that contain background information (but not answers) drawn from the web (such as SQuAD, which draws from Wikipedia) or examples less than 8 words long, which we ignored in our filtering process (except for wordscrambling tasks). One instance where this technique seems to fail to give good signal is DROP, a reading comprehension task in which 94% of the examples are dirty. The information required to answer the question is in a passage provided to the model, so having seen the passage during training but not the questions and answers does not meaningfully constitute cheating. We confirmed that every matching training document contained only the source passage, and none of the questions and answers in the dataset. The more likely explanation for the decrease in performance is that the 6% of examples that remain after filtering come from a slightly different distribution than the dirty examples.

对于包含取自网络的背景信息 (但不含答案) 的数据集 (比如取材于维基百科的 SQuAD), 或长度不足 8 个词, 在过滤中被我们忽略的样本 (单词打乱任务除外), 这个重叠指标往往误报率很高. 这一技术看来未能给出好信号的一个例子是 DROP, 这个阅读理解任务中 94% 的样本是 dirty 的. 回答问题所需的信息就在提供给模型的段落里, 所以训练中见过段落但没见过问答, 并不真正构成作弊. 我们确认了每篇匹配的训练文档只含原文段落, 不含数据集里的任何问答. 表现下降更可能的解释是, 过滤后剩下的 6% 样本与 dirty 样本分布略有不同.

> **确认:** DROP 「94% dirty, 剩 6%」, 表 C.1 是这个比例吗?
> 表 C.1 的 DROP 行: 总数 9536, Dirty Count 8898, Clean Count 638, Clean Percentage 7%. 638 除以 9536 约 6.7% (估算), 表里取整为 7%, 正文写 6%, 对应 dirty 约 93.3%, 正文写 94%. 干净子集 F1 29.5 对整体 36.5, 相对差 -21%, 与图 4.2 上 DROP 那个离群点一致.

Figure 4.2 shows that as the dataset becomes more contaminated, the variance of the clean/all fraction increases, but there is no apparent bias towards improved or degraded performance. This suggests that GPT-3 is relatively insensitive to contamination. See Section 4 for details on the datasets we flagged for further review.

图 4.2 显示, 数据集污染越重, clean/all 比值的方差越大, 但看不出偏向表现变好或变差. 这说明 GPT-3 对污染相对不敏感. 我们标出需要进一步审查的数据集见第 4 节.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">11<a href="https://github.com/openai/gpt-3/blob/master/overlap_frequency.md"><sub>https</sub>://github.com/openai/gpt-3/blob/master/overlap\_frequency.md</a></span></small>

脚注 11: GPT-3 仓库中 overlap_frequency.md 的链接.

<!-- page 45 of 75 -->

| Name | Split | Metric | N | Acc/F1/BLEU | Total Count | DirtyAcc/F1/BLEU | Dirty Count | CleanAcc/F1/BLEU | Clean Count | Clean Percentage | Relative Difference Clean vs All |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quac | dev | f1 | 13 | 44.3 | 7353 | 44.3 | 7315 | 54.1 | 38 | 1% | 20% |
| SQuADv2 | dev | f1 | 13 | 69.8 | 11873 | 69.9 | 11136 | 68.4 | 737 | 6% | -2% |
| DROP | dev | f1 | 13 | 36.5 | 9536 | 37.0 | 8898 | 29.5 | 638 | 7% | -21% |
| Symbol Insertion | dev | acc | 7 | 66.9 | 10000 | 66.8 | 8565 | 67.1 | 1435 | 14% | 0% |
| CoQa | dev | f1 | 13 | 86.0 | 7983 | 85.3 | 5107 | 87.1 | 2876 | 36% | 1% |
| ReCoRD | dev | acc | 13 | 89.5 | 10000 | 90.3 | 6110 | 88.2 | 3890 | 39% | -1% |
| Winograd | test | acc | 9 | 88.6 | 273 | 90.2 | 164 | 86.2 | 109 | 40% | -3% |
| BoolQ | dev | acc | 13 | 76.0 | 3270 | 75.8 | 1955 | 76.3 | 1315 | 40% | 0% |
| MultiRC | dev | acc | 13 | 74.2 | 953 | 73.4 | 558 | 75.3 | 395 | 41% | 1% |
| RACE-h | test | acc | 13 | 46.8 | 3498 | 47.0 | 1580 | 46.7 | 1918 | 55% | 0% |
| LAMBADA | test | acc | 13 | 86.4 | 5153 | 86.9 | 2209 | 86.0 | 2944 | 57% | 0% |
| LAMBADA (No Blanks) | test | acc | 13 | 77.8 | 5153 | 78.5 | 2209 | 77.2 | 2944 | 57% | -1% |
| WSC | dev | acc | 13 | 76.9 | 104 | 73.8 | 42 | 79.0 | 62 | 60% | 3% |
| PIQA | dev | acc | 8 | 82.3 | 1838 | 89.9 | 526 | 79.3 | 1312 | 71% | -4% |
| RACE-m | test | acc | 13 | 58.5 | 1436 | 53.0 | 366 | 60.4 | 1070 | 75% | 3% |
| De→En 16 | test | bleu-sb | 12 | 43.0 | 2999 | 47.4 | 739 | 40.8 | 2260 | 75% | -5% |
| En→De 16 | test | bleu-sb | 12 | 30.9 | 2999 | 32.6 | 739 | 29.9 | 2260 | 75% | -3% |
| En→Ro 16 | test | bleu-sb | 12 | 25.8 | 1999 | 24.9 | 423 | 26.1 | 1576 | 79% | 1% |
| Ro→En 16 | test | bleu-sb | 12 | 41.3 | 1999 | 40.4 | 423 | 41.6 | 1576 | 79% | 1% |
| WebQs | test | acc | 8 | 41.5 | 2032 | 41.6 | 428 | 41.5 | 1604 | 79% | 0% |
| ANLI R1 | test | acc | 13 | 36.8 | 1000 | 40.5 | 200 | 35.9 | 800 | 80% | -3% |
| ANLI R2 | test | acc | 13 | 34.0 | 1000 | 29.4 | 177 | 35.0 | 823 | 82% | 3% |
| TriviaQA | dev | acc | 10 | 71.2 | 7993 | 70.8 | 1390 | 71.3 | 6603 | 83% | 0% |
| ANLI R3 | test | acc | 13 | 40.2 | 1200 | 38.3 | 196 | 40.5 | 1004 | 84% | 1% |
| En→Fr 14 | test | bleu-sb | 13 | 39.9 | 3003 | 38.3 | 411 | 40.3 | 2592 | 86% | 1% |
| Fr→En 14 | test | bleu-sb | 13 | 41.4 | 3003 | 40.9 | 411 | 41.4 | 2592 | 86% | 0% |
| WiC | dev | acc | 13 | 51.4 | 638 | 53.1 | 49 | 51.3 | 589 | 92% | 0% |
| RTE | dev | acc | 13 | 71.5 | 277 | 71.4 | 21 | 71.5 | 256 | 92% | 0% |
| CB | dev | acc | 13 | 80.4 | 56 | 100.0 | 4 | 78.8 | 52 | 93% | -2% |
| Anagrams 2 | dev | acc | 2 | 40.2 | 10000 | 76.2 | 705 | 37.4 | 9295 | 93% | -7% |
| Reversed Words | dev | acc | 2 | 0.4 | 10000 | 1.5 | 660 | 0.3 | 9340 | 93% | -26% |
| OpenBookQA | test | acc | 8 | 65.4 | 500 | 58.1 | 31 | 65.9 | 469 | 94% | 1% |
| ARC (Easy) | test | acc | 11 | 70.1 | 2268 | 77.5 | 89 | 69.8 | 2179 | 96% | 0% |
| Anagrams 1 | dev | acc | 2 | 15.0 | 10000 | 49.8 | 327 | 13.8 | 9673 | 97% | -8% |
| COPA | dev | acc | 9 | 93.0 | 100 | 100.0 | 3 | 92.8 | 97 | 97% | 0% |
| ARC (Challenge) | test | acc | 12 | 51.6 | 1144 | 45.2 | 31 | 51.8 | 1113 | 97% | 0% |
| HellaSwag | dev | acc | 13 | 79.3 | 10042 | 86.2 | 152 | 79.2 | 9890 | 98% | 0% |
| NQs | test | acc | 11 | 29.9 | 3610 | 32.7 | 52 | 29.8 | 3558 | 99% | 0% |
| Cycled Letters | dev | acc | 2 | 38.6 | 10000 | 20.5 | 73 | 38.7 | 9927 | 99% | 0% |
| SAT Analogies | dev | acc | 9 | 65.8 | 374 | 100.0 | 2 | 65.6 | 372 | 99% | 0% |
| StoryCloze | test | acc | 13 | 87.7 | 1871 | 100.0 | 2 | 87.6 | 1869 | 100% | 0% |
| Winogrande | dev | acc | 13 | 77.7 | 1267 | - | 0 | 77.7 | 1267 | 100% | 0% |

Table C.1: Overlap statistics for all datasets sorted from dirtiest to cleanest. We consider a dataset example dirty if it has a single N-gram collision with any document in our training corpus. “Relative Difference Clean vs All” shows the percent change in performance between only the clean examples vs all the examples in the benchmark. “Count” shows the number of examples. “Clean percentage” is the percent of examples that are clean vs total. For “Acc/F1/BLEU” we use the metric specified in “Metric”. These scores come from evaluations with a different seed for the random examples used for in-context learning, and will therefore differ slightly from the scores elsewhere in the paper.

表 C.1: 所有数据集的重叠统计, 按从最脏到最干净排序. 只要一个数据集样本与训练语料中任一文档有一次 N-gram 碰撞, 我们就认为它是 dirty 的. 「Relative Difference Clean vs All」 是只看 clean 样本与看全部样本时表现的百分比变化. 「Count」 是样本数. 「Clean percentage」 是 clean 样本占总数的百分比. 「Acc/F1/BLEU」 使用 「Metric」 列指定的指标. 这些分数来自为 in-context learning 随机抽取示例时用了另一个种子的评测, 因此会与本文其他地方的分数略有不同.

> **再看:** 表 C.1 的总分与正文和表 H.1 差多少, 能全算在 「换了种子」 上吗?
> 大多是一两分的差: CoQA 86.0 对表 3.7 的 85.0, COPA 93.0 对表 H.1 few-shot 的 92.0, RTE 71.5 对 72.9, CB 80.4 对 82.1, BoolQ 76.0 对 77.5, WiC 51.4 对表 3.8 的 49.4, SAT 65.8 对正文 65.2. WSC 的 76.9 是 dev, 表 3.8 的 80.1 是 test, 这一格还混了划分差异. 另一类数与正文完全相同, 如 LAMBADA 86.4, TriviaQA 71.2, Winogrande 77.7, 说明这些任务的 few-shot 结果对种子不敏感, 或者正文就取自这一轮.

<!-- page 46 of 75 -->

## D Total Compute Used to Train Language Models (训练语言模型所用的总算力)

This appendix contains the calculations that were used to derive the approximate compute used to train the language models in Figure 2.2. As a simplifying assumption, we ignore the attention operation, as it typically uses less than 10% of the total compute for the models we are analyzing.

本附录给出推导图 2.2 中训练各语言模型所用近似算力的计算. 作为简化假设, 我们忽略注意力运算, 因为在我们分析的模型中它通常占总算力不到 10%.

Calculations can be seen in Table D.1 and are explained within the table caption.

计算见表 D.1, 表注中有解释.

|  | Total train compute | Total train compute | Params | Training tokens | Flops per param | Mult for | Fwd-pass flops per active param | Frac of params active for each |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Model | (PF-days) | (flops) | (M) | (billions) | per token | bwd pass | per token | token |
| T5-Small | 2.08E+00 | 1.80E+20 | 60 | 1,000 | 3 | 3 | 1 | 0.5 |
| T5-Base | 7.64E+00 | 6.60E+20 | 220 | 1,000 | 3 | 3 | 1 | 0.5 |
| T5-Large | 2.67E+01 | 2.31E+21 | 770 | 1,000 | 3 | 3 | 1 | 0.5 |
| T5-3B | 1.04E+02 | 9.00E+21 | 3,000 | 1,000 | 3 | 3 | 1 | 0.5 |
| T5-11B | 3.82E+02 | 3.30E+22 | 11,000 | 1,000 | 3 | 3 | 1 | 0.5 |
| BERT-Base | 1.89E+00 | 1.64E+20 | 109 | 250 | 6 | 3 | 2 | 1.0 |
| BERT-Large | 6.16E+00 | 5.33E+20 | 355 | 250 | 6 | 3 | 2 | 1.0 |
| RoBERTa-Base | 1.74E+01 | 1.50E+21 | 125 | 2,000 | 6 | 3 | 2 | 1.0 |
| RoBERTa-Large | 4.93E+01 | 4.26E+21 | 355 | 2,000 | 6 | 3 | 2 | 1.0 |
| GPT-3 Small | 2.60E+00 | 2.25E+20 | 125 | 300 | 6 | 3 | 2 | 1.0 |
| GPT-3 Medium | 7.42E+00 | 6.41E+20 | 356 | 300 | 6 | 3 | 2 | 1.0 |
| GPT-3 Large | 1.58E+01 | 1.37E+21 | 760 | 300 | 6 | 3 | 2 | 1.0 |
| GPT-3 XL | 2.75E+01 | 2.38E+21 | 1,320 | 300 | 6 | 3 | 2 | 1.0 |
| GPT-3 2.7B | 5.52E+01 | 4.77E+21 | 2,650 | 300 | 6 | 3 | 2 | 1.0 |
| GPT-3 6.7B | 1.39E+02 | 1.20E+22 | 6,660 | 300 | 6 | 3 | 2 | 1.0 |
| GPT-3 13B | 2.68E+02 | 2.31E+22 | 12,850 | 300 | 6 | 3 | 2 | 1.0 |
| GPT-3 175B | 3.64E+03 | 3.14E+23 | 174,600 | 300 | 6 | 3 | 2 | 1.0 |

Table D.1: Starting from the right hand side and moving left, we begin with the number of training tokens that each model was trained with. Next we note that since T5 uses an encoder-decoder model, only half of the parameters are active for each token during a forward or backwards pass. We then note that each token is involved in a single addition and a single multiply for each active parameter in the forward pass (ignoring attention). Then we add a multiplier of 3x to account for the backwards pass (as computing both $\frac { \bar { { \partial } p a r a m s } } { { \partial } l o s s }$ and $\frac { \partial a c t s } { \partial l o s s }$ use a similar amount of compute as the forwards pass. Combining the previous two numbers, we get the total flops per parameter per token. We multiply this value by the total training tokens and the total parameters to yield the number of total flops used during training. We report both flops and petaflop/s-day (each of which are 8.64e+19 flops).

表 D.1: 从右往左看, 先是每个模型训练所用的 token 数. 接着注意到 T5 是编码器-解码器模型, 每个 token 在前向或反向传播中只激活一半参数. 然后注意到在前向传播中, 每个 token 对每个激活参数参与一次加法和一次乘法 (忽略注意力). 再乘以 3 来计入反向传播 (因为计算 ∂params/∂loss 和 ∂acts/∂loss 的算力与前向传播相近). 把前两个数合起来, 得到每个参数每个 token 的总 flops. 用它乘以总训练 token 数和总参数量, 得到训练所用的总 flops. 我们同时报告 flops 和 petaflop/s-day (每个等于 8.64e+19 flops).

> **看表:** 用表 D.1 的列自己乘一遍, 175B 那行的 3.14E+23 和 3.64E+03 对得上吗?
> 对得上. 6 乘 174.6e9 参数乘 300e9 token 约 3.14e23 flops, 除以 8.64e19 约 3,637 PF-days (估算), 表里写 3.64E+03. 同法算 GPT-3 13B: 6 乘 12.85e9 乘 300e9 约 2.31e22, 与表一致. 注意这里的 174,600M 与表 2.1 的 175.0B 是同一个模型的两种写法; 各小档也都按 300B token 单独计算, 说明它们是分别训练的模型.

## E Human Quality Assessment of Synthetic News Articles (合成新闻文章的人工质量评估)

This appendix contains details on the experiments measuring human ability to distinguish GPT-3-generated synthetic news articles from real news articles. We first describe the experiments on the ∼ 200 word news articles, and then describe the preliminary investigation of ∼ 500 word news articles generated by GPT-3.

本附录给出测量人区分 GPT-3 生成的合成新闻文章与真实新闻文章能力的实验细节. 先介绍约 200 词新闻文章的实验, 再介绍对 GPT-3 生成的约 500 词新闻文章的初步考察.

Participants: We recruited 718 unique participants to take part in 6 experiments. 97 participants were excluded for failing an internet check question, leaving a total of 621 participants: 343 male, 271 female, and 7 other. Mean participant age was ∼ 38 years old. All participants were recruited through Positly, which maintains a whitelist of high-performing workers from Mechanical Turk. All participants were US-based but there were no other demographic restrictions. Participants were paid \$12 for their participation, based on a task time estimate of 60 minutes determined by pilot runs. In order to ensure that the sample of participants for each experiment quiz was unique, participants were not allowed to take part in an experiment more than once.

参与者: 我们招募了 718 名不重复的参与者参加 6 个实验. 97 名参与者因未通过网络检查题被排除, 剩下 621 人: 男性 343 人, 女性 271 人, 其他 7 人. 参与者平均年龄约 38 岁. 所有参与者都通过 Positly 招募, 它维护着一份 Mechanical Turk 上高绩效工人的白名单. 所有参与者都在美国, 此外没有其他人口统计限制. 根据试运行确定的 60 分钟任务时长估计, 每位参与者获得 12 美元报酬. 为确保每个实验测验的参与者样本不重复, 参与者不得多次参加实验.

> **拆开:** 718, 97, 621, 343:271:7 这组数, 能从表 E.1 逐行加出来吗?
> 只有 97 对得上. 表 E.1 九行的招募数相加是 713, 不是 718; 排除数相加正好 97, 于是剩余应为 616, 不是 621. 性别列里 Medium, Large, 6.7B, 13.0B 四行都印成 46:28:2, 这四行的合计 76 与各自 「招募减排除」 (73, 57, 71, 68) 都不符, 其余五行则都吻合; 九行性别相加是 367:274:10, 也与正文不同. 另外正文说 6 个实验, 表 E.1 却有 9 行.

Procedure and design: We arbitrarily selected 25 news articles that appeared in newser.com in early 2020. We used the article titles and subtitles to produce outputs from the 125M, 350M, 760M, 1.3B, 2.7B, 6.7B, 13.0B, and 200B (GPT-3) parameter language models. Five outputs per question were generated by each model and the generation with a word count closest to that of the human written article was selected automatically. This was to minimize the effect that completion length might have on participants’ judgments. The same output procedure for each model with the exception of the removal of the intentionally bad control model, as described in the main text.

流程与设计: 我们随意选了 2020 年初出现在 newser.com 上的 25 篇新闻文章. 用文章标题和副标题, 从 125M, 350M, 760M, 1.3B, 2.7B, 6.7B, 13.0B 和 200B (GPT-3) 参数的语言模型生成输出. 每个模型每道题生成五条输出, 自动选出词数最接近人写文章的那一条. 这是为了尽量减小补全长度对参与者判断的影响. 除了去掉故意做差的对照模型之外, 每个模型的输出流程都相同, 如正文所述.

<!-- page 47 of 75 -->

|  | Participants | Participants | Genders | Mean | Average Word Count |
| --- | --- | --- | --- | --- | --- |
| Model | Recruited | Excluded | (m:f:other) | Age | (human:model) |
| Control | 76 | 7 | 32:37:0 | 39 | 216:216 |
| GPT-3 Small | 80 | 7 | 41:31:1 | 40 | 216:188 |
| GPT-3 Medium | 80 | 7 | 46:28:2 | 39 | 216:202 |
| GPT-3 Large | 81 | 24 | 46:28:2 | 37 | 216:200 |
| GPT-3 XL | 79 | 14 | 32:32:1 | 38 | 216:199 |
| GPT-3 2.7B | 80 | 11 | 36:33:0 | 40 | 216:202 |
| GPT-3 6.7B | 76 | 5 | 46:28:2 | 37 | 216:195 |
| GPT-3 13.0B | 81 | 13 | 46:28:2 | 37 | 216:209 |
| GPT-3 175B | 80 | 9 | 42:29:0 | 37 | 216:216 |

Table E.1: Participant details and article lengths for each experiment to evaluate human detection of ∼ 200 word model generated news articles. Participants were excluded due to internet check fails.

表 E.1: 评估人识别约 200 词模型生成新闻文章的各实验的参与者细节和文章长度. 参与者因未通过网络检查而被排除.

Average time spent trying to detect model generated news article

试图识别模型生成新闻文章所花的平均时间 (图题).

![图E.1 参与者判断每篇文章所花时长随参数量变化, 横轴是参数量取对数, 纵轴是秒数, 八个点从125M约108秒升到175B约126秒, 1.3B和2.7B两点约119秒高于6.7B和13B, 黑线是对数尺度上的线性拟合带灰色95%置信带, 底部虚线是对照模型105秒](images/p47-figure-e-1-participants-spend-more-time-trying-to.png)

Figure E.1: Participants spend more time trying to identify whether each news article is machine generated as model size increases. Duration on the control model is indicated with the dashed line. Line of best fit is a linear model on a log scale with 95% confidence intervals.

图 E.1: 随着模型尺寸增大, 参与者花更多时间判断每篇新闻文章是否由机器生成. 对照模型上的时长用虚线表示. 最佳拟合线是对数尺度上的线性模型, 带 95% 置信区间.

In each experiment, half of the participants were randomly assigned to quiz A and half were randomly assigned to quiz B. Each quiz consisted of 25 articles: half (12-13) were human written and half (12-13) were model generated: the articles with human written completions in quiz A had model generated completions in quiz B and vice versa. The order of quiz question was shuffled for each participant. Participants could leave comments and were asked to indicate if they had seen the articles before. Participants were instructed not to look up the articles or their content during the quiz and at the end of the quiz were asked if they had looked anything up during the quiz.

每个实验中, 一半参与者随机分到测验 A, 一半随机分到测验 B. 每份测验有 25 篇文章: 一半 (12-13 篇) 是人写的, 一半 (12-13 篇) 是模型生成的; 测验 A 中配人写补全的文章, 在测验 B 中配模型生成的补全, 反之亦然. 每位参与者的题目顺序都被打乱. 参与者可以留言, 并被要求说明是否以前见过这些文章. 参与者被要求在测验期间不要查找文章或其内容, 测验结束时会被问到是否查过.

Statistical Tests: To compare means on the different runs, we performed a two-sample t-test for independent groups for each model against the control. This was implemented in Python using the scipy.stats.ttest\_ind function. When plotting a regression line in the graph of average participant accuracy vs model size, we fit a power law of the form $\stackrel { \star } { a }   x ^ { - b }$ . The 95% confidence intervals were estimated from the t-distribution of the sample mean.

统计检验: 为了比较不同批次的均值, 我们对每个模型与对照组做独立样本的双样本 t 检验. 实现上用 Python 的 scipy.stats.ttest_ind 函数. 在参与者平均准确率对模型尺寸的图中画回归线时, 我们拟合形如 a·x^(-b) 的幂律. 95% 置信区间由样本均值的 t 分布估计.

Duration statistics: In the main text, we discussed the finding that the ability of human participants to distinguish model and human generated news articles decreases as our models become larger. We have also found that the average time spent for a given set of questions increases as the model size increases, as shown in Figure E.1. Lower accuracy scores despite increased time investment from participants supports the finding that larger models generate harder-to-distinguish news articles.

时长统计: 正文讨论了一个发现: 随着模型变大, 人类参与者区分模型与人写新闻文章的能力下降. 我们还发现, 如图 E.1 所示, 在一组给定题目上花的平均时间随模型尺寸增大而增加. 参与者投入的时间增加, 准确率反而更低, 这支持了更大的模型生成的新闻文章更难区分这一发现.

<!-- page 48 of 75 -->

<table><tbody><tr><td rowspan="2"></td><td rowspan="2">Participants</td><td rowspan="2">Participants</td><td rowspan="2">Genders</td><td rowspan="2">Mean</td><td rowspan="2">Average Word Count</td></tr><tr></tr><tr><td>Model</td><td>Recruited</td><td>Excluded</td><td>(m:f:other)</td><td>Age</td><td>(human:model)</td></tr><tr><td>Control</td><td>79</td><td>17</td><td>32:37:0</td><td>39</td><td>569:464</td></tr><tr><td>GPT-3 175B</td><td>81</td><td>19</td><td>32:30:0</td><td>40</td><td>569:498</td></tr></tbody></table>

Table E.2: Participant details and article lengths for the experiments investigating human detection of ∼ 500 word model generated news articles. Participants were excluded due to internet check fails.

表 E.2: 考察人识别约 500 词模型生成新闻文章的实验的参与者细节和文章长度. 参与者因未通过网络检查而被排除.

Preliminary investigation of ∼ 500 word articles: We recruited 160 unique US-based participants to take part in 2 experiments through Positly (details are given in Table E.2). We randomly selected 12 Reuters world news articles from late 2019 and created a context for GPT-3 175B that consisted of a single Reuters article not in this set of 12. We then used the article titles and Reuters locations to generate completions from GPT-3 175B and the 160M control model from the previous experiments. These were used to create two 12-question quizzes per model, each consisting of half human written and half model generated articles. Comprehension questions were added and articles were shown to participants in 3 stages at 30 second intervals to encourage closer reading. Participants were paid \$12 for this task. Model generation selection methods, exclusion criteria, and statistical tests mirror those of the previous experiments.

约 500 词文章的初步考察: 我们通过 Positly 招募了 160 名不重复的美国参与者参加 2 个实验 (细节见表 E.2). 我们随机选了 12 篇 2019 年末的路透社国际新闻, 并为 GPT-3 175B 构造了一段上下文, 由一篇不在这 12 篇之内的路透社文章组成. 然后用文章标题和路透社的电头地点, 从 GPT-3 175B 和前面实验中的 160M 对照模型生成补全. 每个模型用这些补全做两份 12 题的测验, 每份一半是人写文章, 一半是模型生成文章. 我们加入了理解题, 文章分 3 个阶段, 每隔 30 秒展示给参与者, 以鼓励更仔细地阅读. 这项任务的报酬是 12 美元. 模型生成的选择方法, 排除标准和统计检验都与之前的实验相同.

## F Additional Samples from GPT-3 (GPT-3 的更多样本)

GPT-3 adapts well to many tasks other than the ones explored in the main body of the paper. As an example, in Figure F.1, we show four uncurated samples from a prompt suggesting that the model write a poem, with a given title, in the style of Wallace Stevens. We first experimented with a few prompts, then generated four samples with no additional editing or selection (sampling at temperature 1 using nucleus sampling [HBFC19] with P = 0.9). Completions were truncated when the model began to write a new title and author heading, or broke into prose commentary.

除了正文探索的任务, GPT-3 在许多其他任务上也适应得很好. 例如在图 F.1 中, 我们展示了四条未经挑选的样本, 提示要求模型以 Wallace Stevens 的风格写一首给定标题的诗. 我们先试了几个提示, 然后生成四条样本, 不做任何额外编辑或挑选 (温度 1, 用 nucleus sampling [HBFC19], P = 0.9). 当模型开始写新的标题和作者行, 或转入散文式评论时, 补全被截断.

<!-- page 49 of 75 -->

![图F.1 诗歌生成截图, 上方上下文列出Cavafy的The City和Ashbery的Some Trees两首诗的标题与作者, 诗文省略, 最后是题为Shadows on the Way, 署名Wallace Stevens的标题行, 下方分两栏排着模型续写的四首未经挑选的诗](images/p49-figure-f-1-four-uncurated-completions-from-a-context.png)

Figure F.1: Four uncurated completions from a context suggesting the model compose a poem in the style of Wallace Stevens with the title ‘Shadows on the Way’.

图 F.1: 在一段提示模型以 Wallace Stevens 风格写一首题为 「Shadows on the Way」 的诗的上下文下, 得到的四条未经挑选的补全.

<!-- page 50 of 75 -->

## G Details of Task Phrasing and Specifications (任务措辞与规格细节)

The following figures illustrate the formatting and phrasing of all the tasks included in the paper. All data comes from the ground truth datasets in this section, and no samples from GPT-3 are included here.

下面各图展示了本文收录的所有任务的格式和措辞. 本节所有数据都来自真实标注数据集, 这里不包含任何 GPT-3 的样本.

![图G.1 RACE-h格式示例截图, 一篇讲跨文化商务闲聊该谈什么不该谈什么的短文, 后接三组已作答的Q和A, 最后一问是作者认为政治和宗教属于什么, 正确答案taboo, 另列cheerful topics等三个错误选项](images/p50-a.png)

|  | A: |
| --- | --- |
| Correct Answer → | taboo |
| Incorrect Answer → | cheerful topics |
| Incorrect Answer → | rude topics |
| Incorrect Answer → | topics that can never be talked about |

Figure G.1: Formatted dataset example for RACE-h. When predicting, we normalize by the unconditional probability of each answer as described in 2.

图 G.1: RACE-h 的格式化数据示例. 做预测的时候, 我们按第 2 节所述用每个答案的无条件概率做归一化.

<!-- page 51 of 75 -->

```txt
Context → anli 2: anli 2: The Gold Coast Hotel & Casino is a hotel and casino located in Paradise, Nevada. This locals' casino is owned and operated by Boyd Gaming. The Gold Coast is located one mile (~ 1.6km) west of the Las Vegas Strip on West Flamingo Road. It is located across the street from the Palms Casino Resort and the Rio All Suite Hotel and Casino. Question: The Gold Coast is a budget-friendly casino. True, False, or Neither?

Correct Answer → Neither
Incorrect Answer → True
Incorrect Answer → False
```

上面代码块是 ANLI R2 示例: 一段关于 Gold Coast 酒店赌场的描述, 问它是否是一家平价赌场, 正确答案是 Neither.

Figure G.2: Formatted dataset example for ANLI R2

图 G.2: ANLI R2 的格式化数据示例.

![图G.3 RACE-m格式示例截图, 一篇讲Smith老师让学生在土豆上写下所恨之人名字的短文, 后接三组已作答的问答, 最后一问问学生在土豆上写什么, 正确答案names, 错误选项numbers, time, places](images/p51-figure-g-3-formatted-dataset-example-for-race-m-when.png)

Figure G.3: Formatted dataset example for RACE-m. When predicting, we normalize by the unconditional probability of each answer as described in 2.

图 G.3: RACE-m 的格式化数据示例. 做预测的时候, 我们按第 2 节所述用每个答案的无条件概率做归一化.

<!-- page 52 of 75 -->

```txt
Context → How to apply sealant to wood.
Correct Answer → Using a brush, brush on sealant onto wood until it is fully saturated with the sealant.
Incorrect Answer → Using a brush, drip on sealant onto wood until it is fully saturated with the sealant.
```

上面代码块是 PIQA 示例: 如何给木头涂密封剂, 正确答案用刷子刷上, 错误答案用刷子滴上.

Figure G.4: Formatted dataset example for PIQA

图 G.4: PIQA 的格式化数据示例.

```txt
Context → My body cast a shadow over the grass because

Correct Answer → the sun was rising.
Incorrect Answer → the grass was cut.

Figure G.5: Formatted dataset example for COPA

Context → (CNN) Yuval Rabin, whose father, Yitzhak Rabin, was assassinated while serving as Prime Minister of Israel, criticized Donald Trump for appealing to "Second Amendment people" in a speech and warned that the words that politicians use can incite violence and undermine democracy. "Trump's words are an incitement to the type of political violence that touched me personally," Rabin wrote in USAToday. He said that Trump's appeal to "Second Amendment people" to stop Hillary Clinton -- comments that were criticized as a call for violence against Clinton, something Trump denied -- "were a new level of ugliness in an ugly campaign season."
- The son of a former Israeli Prime Minister who was assassinated wrote an op ed about the consequence of violent political rhetoric.
- Warns of "parallels" between Israel of the 1990s and the U.S. today.

Correct Answer → - Referencing his father, who was shot and killed by an extremist amid political tension in Israel in 1995, Rabin condemned Donald Trump's aggressive rhetoric.
Correct Answer → - Referencing his father, who was shot and killed by an extremist amid political tension in Israel in 1995, Rabin condemned Trump's aggressive rhetoric.
Incorrect Answer → - Referencing his father, who was shot and killed by an extremist amid political tension in Israel in 1995, Rabin condemned Hillary Clinton's aggressive rhetoric.
Incorrect Answer → - Referencing his father, who was shot and killed by an extremist amid political tension in Israel in 1995, Rabin condemned U.S.'s aggressive rhetoric.
Incorrect Answer → - Referencing his father, who was shot and killed by an extremist amid political tension in Israel in 1995, Rabin condemned Yitzhak Rabin's aggressive rhetoric.
```

上面代码块里包含两个示例: 前半是 COPA, 问我的身体在草地上投下影子的原因, 正确答案是太阳正在升起, 其后一行是图 G.5 的图题 (COPA 的格式化数据示例); 后半是 ReCoRD, 一段 CNN 新闻加两条要点, 要在候选实体中补全第三条要点, 正确答案是 Donald Trump 或 Trump.

**Figure G.6:** Formatted dataset example for ReCoRD. We consider the context above to be a single ”problem” because this is how the task is presented in the ReCoRD dataset and scored in the ReCoRD evaluation script.

**图 G.6:** ReCoRD 的格式化数据示例. 我们把上面的上下文视为一道 「题」, 因为 ReCoRD 数据集就是这样呈现任务, ReCoRD 评测脚本也是这样打分.

![图G.7 ANLI R1格式示例截图, 一段介绍苏格兰议员Fulton James MacGregor的背景, 假设句说他是Shona Robison的联络官且对方是他最好的朋友, 问True, False, or Neither, 正确答案Neither](images/p52-figure-g-7-formatted-dataset-example-for-anli-r1.png)

Figure G.7: Formatted dataset example for ANLI R1

图 G.7: ANLI R1 的格式化数据示例.

<!-- page 53 of 75 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Context $\rightarrow$ Organisms require energy in order to do what?  
Correct Answer $\rightarrow$ mature and develop.  
Incorrect Answer $\rightarrow$ rest soundly.  
Incorrect Answer $\rightarrow$ absorb light.  
Incorrect Answer $\rightarrow$ take in nutrients.
</div>

上面是 OpenBookQA 示例: 问生物需要能量来做什么, 正确答案是成熟和发育.

Figure G.8: Formatted dataset example for OpenBookQA. When predicting, we normalize by the unconditional probability of each answer as described in 2.

图 G.8: OpenBookQA 的格式化数据示例. 做预测的时候, 我们按第 2 节所述用每个答案的无条件概率做归一化.

```txt
Context → Making a cake: Several cake pops are shown on a display. A woman and girl are shown making the cake pops in a kitchen. They

Correct Answer → bake them, then frost and decorate.
Incorrect Answer → taste them as they place them on plates.
Incorrect Answer → put the frosting on the cake as they pan it.
Incorrect Answer → come out and begin decorating the cake as well.
```

上面代码块是 HellaSwag 示例: 做蛋糕棒棒糖的场景描述, 要选出最合理的后续动作, 正确答案是先烤再糖霜装饰.

Figure G.9: Formatted dataset example for HellaSwag

图 G.9: HellaSwag 的格式化数据示例.

```txt
Context → anli 3: anli 3: We shut the loophole which has American workers actually subsidizing the loss of their own job. They just passed an expansion of that loophole in the last few days: \$43 billion of giveaways, including favors to the oil and gas industry and the people importing ceiling fans from China.
Question: The loophole is now gone True, False, or Neither?

Correct Answer → False
Incorrect Answer → True
Incorrect Answer → Neither
```

上面代码块是 ANLI R3 示例: 一段关于税收漏洞的政治发言, 问漏洞是否已经堵上, 正确答案是 False.

Figure G.10: Formatted dataset example for ANLI R3

图 G.10: ANLI R3 的格式化数据示例.

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Context $\rightarrow$ Question: George wants to warm his hands quickly by rubbing them. Which skin surface will produce the most heat? Answer: Correct Answer $\rightarrow$ dry palms Incorrect Answer $\rightarrow$ wet palms Incorrect Answer $\rightarrow$ palms covered with oil Incorrect Answer $\rightarrow$ palms covered with lotion
</div>

上面是 ARC (Challenge) 示例: 乔治搓手取暖, 问哪种皮肤表面产热最多, 正确答案是干燥的手掌.

Figure G.11: Formatted dataset example for ARC (Challenge). When predicting, we normalize by the unconditional probability of each answer as described in 2.

图 G.11: ARC (Challenge) 的格式化数据示例. 做预测的时候, 我们按第 2 节所述用每个答案的无条件概率做归一化.

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Context $\rightarrow$ lull is to trust as  
Correct Answer $\rightarrow$ cajole is to compliance  
Incorrect Answer $\rightarrow$ balk is to fortitude  
Incorrect Answer $\rightarrow$ betray is to loyalty  
Incorrect Answer $\rightarrow$ hinder is to destination  
Incorrect Answer $\rightarrow$ soothe is to passion
</div>

上面是 SAT 类比示例: lull 之于 trust, 正确答案是 cajole 之于 compliance.

Figure G.12: Formatted dataset example for SAT Analogies

图 G.12: SAT 类比题的格式化数据示例.

| Correct Context → | Grace was happy to trade me her sweater for my jacket. She thinks the sweater |
| --- | --- |
| Incorrect Context → | Grace was happy to trade me her sweater for my jacket. She thinks the jacket |
| Target Completion → | looks dowdy on her. |

Figure G.13: Formatted dataset example for Winograd. The ‘partial’ evaluation method we use compares the probability of the completion given a correct and incorrect context.

图 G.13: Winograd 的格式化数据示例. 我们使用的 「部分」 评估法, 比较在正确上下文和错误上下文下目标补全的概率.

<!-- page 54 of 75 -->

| Correct Context → | Johnny likes fruits more than vegetables in his new keto diet because the fruits |
| --- | --- |
| Incorrect Context → | Johnny likes fruits more than vegetables in his new keto diet because the vegetables |
| Target Completion → | are saccharine. |

Figure G.14: Formatted dataset example for Winogrande. The ‘partial’ evaluation method we use compares the probability of the completion given a correct and incorrect context.

图 G.14: Winogrande 的格式化数据示例. 我们使用的 「部分」 评估法, 比较在正确上下文和错误上下文下目标补全的概率.

```txt
Context → READING COMPREHENSION ANSWER KEY
While this process moved along, diplomacy continued its rounds. Direct pressure on the Taliban had proved unsuccessful. As one NSC staff note put it, "Under the Taliban, Afghanistan is not so much a state sponsor of terrorism as it is a state sponsored by terrorists." In early 2000, the United States began a high-level effort to persuade Pakistan to use its influence over the Taliban. In January 2000, Assistant Secretary of State Karl Inderfurth and the State Department's counterterrorism coordinator, Michael Sheehan, met with General Musharraf in Islamabad, dangling before him the possibility of a presidential visit in March as a reward for Pakistani cooperation. Such a visit was coveted by Musharraf, partly as a sign of his government's legitimacy. He told the two envoys that he would meet with Mullah Omar and press him on Bin Laden. They left, however, reporting to Washington that Pakistan was unlikely in fact to do anything," given what it sees as the benefits of Taliban control of Afghanistan." President Clinton was scheduled to travel to India. The State Department felt that he should not visit India without also visiting Pakistan. The Secret Service and the CIA, however, warned in the strongest terms that visiting Pakistan would risk the President's life. Counterterrorism officials also argued that Pakistan had not done enough to merit a presidential visit. But President Clinton insisted on including Pakistan in the itinerary for his trip to South Asia. His one-day stopover on March 25, 2000, was the first time a U.S. president had been there since 1969. At his meeting with Musharraf and others, President Clinton concentrated on tensions between Pakistan and India and the dangers of nuclear proliferation, but also discussed Bin Laden. President Clinton told us that when he pulled Musharraf aside for a brief, one-on-one meeting, he pleaded with the general for help regarding Bin Laden." I offered him the moon when I went to see him, in terms of better relations with the United States, if he'd help us get Bin Laden and deal with another issue or two." The U.S. effort continued.
Who did The State Department feel should visit both India and Pakistan?
Correct Answer → - [False] Bin Laden
Incorrect Answer → - [True] Bin Laden
```

上面代码块是 MultiRC 示例: 一段关于美国劝说巴基斯坦施压塔利班的长文, 问国务院认为谁应同时访问印度和巴基斯坦, 候选答案 「Bin Laden」 标为 False 才是正确判断.

Figure G.15: Formatted dataset example for MultiRC. There are three levels within MultiRC: (1) the passage, (2) the questions, and (3) the answers. During evaluation, accuracy is determined at the per-question level, with a question being considered correct if and only if all the answers within the question are labeled correctly. For this reason, we use K to refer to the number of questions shown within the context.

图 G.15: MultiRC 的格式化数据示例. MultiRC 有三个层级: (1) 段落, (2) 问题, (3) 答案. 评测中准确率按问题计算, 一道题当且仅当其中所有答案都标对才算对. 因此我们用 K 指上下文中展示的问题数.

<table><tbody><tr><td rowspan="2">Context →</td><td rowspan="2">Question: Which factor will most likely cause a person to develop a fever? Answer:</td></tr><tr></tr><tr><td>Correct Answer →</td><td>a bacterial population in the bloodstream</td></tr><tr><td>Incorrect Answer →</td><td>a leg muscle relaxing after exercise</td></tr><tr><td>Incorrect Answer →</td><td>several viral particles on the skin</td></tr><tr><td>Incorrect Answer →</td><td>carbohydrates being digested in the stomach</td></tr></tbody></table>

Figure G.16: Formatted dataset example for ARC (Easy). When predicting, we normalize by the unconditional probability of each answer as described in 2.

图 G.16: ARC (Easy) 的格式化数据示例. 做预测的时候, 我们按第 2 节所述用每个答案的无条件概率做归一化.

<!-- page 55 of 75 -->

| Context → | Bob went to the gas station to fill up his car. His tank was completely empty and so was his wallet. The cashier offered to pay for his gas if he came back later to pay. Bob felt grateful as he drove home. |
| --- | --- |
| Correct Answer → | Bob believed that there were good people in the world. |
| Incorrect Answer → | Bob contemplated how unfriendly the world was. |

Figure G.17: Formatted dataset example for StoryCloze

图 G.17: StoryCloze 的格式化数据示例.

![图G.18 CoQA格式示例截图, 两段介绍芬兰首都赫尔辛基的英文材料, 后接三组已作答的问答, 最后一问问都会区包括哪些城镇, 目标补全列出Helsinki, Espoo, Vantaa, Kauniainen等](images/p55-figure-g-18-formatted-dataset-example-for-coqa.png)

Figure G.18: Formatted dataset example for CoQA

图 G.18: CoQA 的格式化数据示例.

| Context → | Please unscramble the letters into a word, and write that word: asinoc = |
| --- | --- |
| Target Completion → | casino |

Figure G.19: Formatted dataset example for Cycled Letters

图 G.19: 字母循环移位任务的格式化数据示例.

<!-- page 56 of 75 -->

| Context → | Passage: Saint Jean de Brébeuf was a French Jesuit missionary who travelled to New France in 1625. There he worked primarily with the Huron for the rest of his life, except for a few years in France from 1629 to 1633. He learned their language and culture, writing extensively about each to aid other missionaries. In 1649, Brébeuf and another missionary were captured when an Iroquois raid took over a Huron village . Together with Huron captives, the missionaries were ritually tortured and killed on March 16, 1649. Brébeuf was beatified in 1925 and among eight Jesuit missionaries canonized as saints in the Roman Catholic Church in 1930.Question: How many years did Saint Jean de Brébeuf stay in New France before he went back to France for a few years?Answer: |
| --- | --- |
| Target Completion → | 4 |

Figure G.20: Formatted dataset example for DROP

图 G.20: DROP 的格式化数据示例.

![图G.21 LAMBADA格式示例截图, 以Fill in blank开头的一段举火把找台阶的叙事, 末句空出最后一个词, 目标补全是step](images/p56-figure-g-21-formatted-dataset-example-for-lambada.png)

Figure G.21: Formatted dataset example for LAMBADA

图 G.21: LAMBADA 的格式化数据示例.

| Context → | Please unscramble the letters into a word, and write that word: skicts = |
| --- | --- |
| Target Completion → | sticks |

Figure G.22: Formatted dataset example for Anagrams 1 (A1)

图 G.22: Anagrams 1 (A1) 的格式化数据示例.

| Context → | Please unscramble the letters into a word, and write that word: volwskagen = |
| --- | --- |
| Target Completion → | volkswagen |

Figure G.23: Formatted dataset example for Anagrams 2

图 G.23: Anagrams 2 的格式化数据示例.

| Context → | Q: Who played tess on touched by an angel? |
| --- | --- |
|  | A: |
| Target Completion → | Delloreese Patricia Early (July 6, 1931 { November 19, 2017), known professionally as Della Reese |

Figure G.24: Formatted dataset example for Natural Questions

图 G.24: Natural Questions 的格式化数据示例.

<!-- page 57 of 75 -->

![图G.25 QuAC格式示例截图, 标题是橄榄球运动员William Perry的职业生涯, 一大段传记后问他效力于哪支球队, 目标补全the Chicago Bears](images/p57-figure-g-25-formatted-dataset-example-for-quac.png)

Figure G.25: Formatted dataset example for QuAC

图 G.25: QuAC 的格式化数据示例.

| Context → | Please unscramble the letters into a word, and write that word: r e!c.i p r o.c a/l = |
| --- | --- |
| Target Completion → | reciprocal |

Figure G.26: Formatted dataset example for Symbol Insertion

图 G.26: 符号插入任务的格式化数据示例.

| Context → | Please unscramble the letters into a word, and write that word: taefed = |
| --- | --- |
| Target Completion → | defeat |

Figure G.27: Formatted dataset example for Reversed Words

图 G.27: 单词倒写任务的格式化数据示例.

<!-- page 58 of 75 -->

![图G.28 SQuADv2格式示例截图, 标题The Blitz, 背景讲1941年3月德国空军出动4000架次且只在月夜执行内陆任务, 先问架次答4,000, 再问何时执行内陆任务, 目标补全only on moonlit nights](images/p58-figure-g-28-formatted-dataset-example-for-squadv2.png)

Figure G.28: Formatted dataset example for SQuADv2

图 G.28: SQuADv2 的格式化数据示例.

![图G.29 BoolQ格式示例截图, 一段解释法向力与重力关系的物理说明, 问法向力是否等于重力, 目标补全yes](images/p58-figure-g-29-formatted-dataset-example-for-boolq.png)

Figure G.29: Formatted dataset example for BoolQ

图 G.29: BoolQ 的格式化数据示例.

![图G.30 CB格式示例截图, 一段关于纽约租金下降的新闻短文, 结尾说价格下降不等于曼哈顿变便宜, 问Manhattan comes cheap是true, false还是neither, 目标补全false](images/p58-figure-g-30-formatted-dataset-example-for-cb.png)

Figure G.30: Formatted dataset example for CB

图 G.30: CB 的格式化数据示例.

<!-- page 59 of 75 -->

| Context → | The bet, which won him dinner for four, was regarding the existence and mass of the top quark, an elementary particle discovered in 1995. question: The Top Quark is the last of six flavors of quarks predicted by the standard model theory of particle physics. True or False? |
| --- | --- |
| Target Completion → | answer: False |

Figure G.31: Formatted dataset example for RTE

图 G.31: RTE 的格式化数据示例.

| Context → | An outfitter provided everything needed for the safari. Before his first walking holiday, he went to a specialist outfitter to buy some boots. question: Is the word 'outfitter' used in the same way in the two sentences above? |
| --- | --- |
| Target Completion → | answer: no |

Figure G.32: Formatted dataset example for WiC

图 G.32: WiC 的格式化数据示例.

| Context → | Final Exam with Answer KeyInstructions: Please carefully read the following passages. For each passage, you must identify which noun the pronoun marked in *bold* refers to.====Passage: Mr. Moncrieff visited Chester's luxurious New York apartment, thinking that it belonged to his son Edward. The result was that Mr. Moncrieff has decided to cancel Edward's allowance on the ground that he no longer requires *his* financial support.Question: In the passage above, what does the pronoun "*his*" refer to? Answer: |
| --- | --- |
| Target Completion → | mr. moncrieff |

Figure G.33: Formatted dataset example for WSC

图 G.33: WSC 的格式化数据示例.

![图G.34 TriviaQA格式示例截图, 问Nude Descending A Staircase是哪位20世纪艺术家最著名的画作, 下方列出十几种都算正确的写法, 如MARCEL DUCHAMP, duchamp, R.Mutt, Henri-Robert-Marcel Duchamp](images/p59-figure-g-34-formatted-dataset-example-for-triviaqa.png)

Figure G.34: Formatted dataset example for TriviaQA. TriviaQA allows for multiple valid completions.

图 G.34: TriviaQA 的格式化数据示例. TriviaQA 允许多个有效补全.

<!-- page 60 of 75 -->

<table><tr><td colspan="2">Context → Q: What school did burne hogarth establish?</td></tr><tr><td></td><td>A:</td></tr><tr><td colspan="2">Target Completion → School of Visual Arts</td></tr></table>

Figure G.35: Formatted dataset example for WebQA

图 G.35: WebQA 的格式化数据示例.

| Context → | Keinesfalls d¨urfen diese f¨ur den kommerziellen Gebrauch verwendet werden.= |
| --- | --- |
| Target Completion → | In no case may they be used for commercial purposes. |

**Figure G.36:** Formatted dataset example for De→En. This is the format for one- and few-shot learning, for this and other langauge tasks, the format for zero-shot learning is “Q: What is the {language} translation of {sentence} A: {translation}.”

**图 G.36:** 德译英的格式化数据示例. 这是 one-shot 和 few-shot 学习的格式; 对这个和其他语言任务, zero-shot 学习的格式是 「Q: What is the {language} translation of {sentence} A: {translation}.」

| Context → | In no case may they be used for commercial purposes. = |
| --- | --- |
| Target Completion → | Keinesfalls d¨urfen diese f¨ur den kommerziellen Gebrauch verwendet werden. |

Figure G.37: Formatted dataset example for En→De

图 G.37: 英译德的格式化数据示例.

| Context → | Analysis of instar distributions of larval I. verticalis collected from a series of ponds also indicated that males were in more advanced instars than females. = |
| --- | --- |
| Target Completion → | L'analyse de la distribution de fr´equence des stades larvaires d'I. verticalis dans une s´erie d'´etangs a ´egalement d´emontr´e que les larves m^ales ´etaient `a des stades plus avanc´es que les larves femelles. |

Figure G.38: Formatted dataset example for En→Fr

图 G.38: 英译法的格式化数据示例.

| Context → | L'analyse de la distribution de fr´equence des stades larvaires d'I. verticalis dans une s´erie d'´etangs a ´egalement d´emontr´e que les larves m^ales ´etaient `a des stades plus avanc´es que les larves femelles. = |
| --- | --- |
| Target Completion → | Analysis of instar distributions of larval I. verticalis collected from a series of ponds also indicated that males were in more advanced instars than females. |

Figure G.39: Formatted dataset example for Fr→En

图 G.39: 法译英的格式化数据示例.

| Context → | The truth is that you want, at any price, and against the wishes of the peoples of Europe, to continue the negotiations for Turkey's accession to the European Union, despite Turkey's continuing refusal to recognise Cyprus and despite the fact that the democratic reforms are at a standstill. = |
| --- | --- |
| Target Completion → | Adev˘arul este c˘a v˘a dorit¸i, cu orice pret¸ ¸si ^ımpotriva dorint¸ei europenilor, s˘a continuat¸i negocierile de aderare a Turciei la Uniunea European˘a, ^ın ciuda refuzului continuu al Turciei de a recunoa¸ste Ciprul ¸si ^ın ciuda faptului c˘a reformele democratice au ajuns ^ıntr-un punct mort. |

Figure G.40: Formatted dataset example for En→Ro

图 G.40: 英译罗的格式化数据示例.

<!-- page 61 of 75 -->

| Context → | Adev˘arul este c˘a v˘a dorit¸i, cu orice pret¸ ¸si ^ımpotriva dorint¸ei europenilor, s˘a continuat¸i negocierile de aderare a Turciei la Uniunea European˘a, ^ın ciuda refuzului continuu al Turciei de a recunoa¸ste Ciprul ¸si ^ın ciuda faptului c˘a reformele democratice au ajuns ^ıntr-un punct mort.= |
| --- | --- |
| Target Completion → | The truth is that you want, at any price, and against the wishes of the peoples of Europe, to continue the negotiations for Turkey's accession to the European Union, despite Turkey's continuing refusal to recognise Cyprus and despite the fact that the democratic reforms are at a standstill. |

Figure G.41: Formatted dataset example for Ro→En

图 G.41: 罗译英的格式化数据示例.

| Context → | Q: What is (2 * 4) * 6? A: |
| --- | --- |
| Target Completion → | 48Figure G.42: Formatted dataset example for Arithmetic 1DC |
| Context → | Q: What is 17 minus 14? A: |
| Target Completion → | 3Figure G.43: Formatted dataset example for Arithmetic 2D- |
| Context → | Q: What is 98 plus 45? A: |
| Target Completion → | 143Figure G.44: Formatted dataset example for Arithmetic 2D+ |
| Context → | Q: What is 95 times 45? A: |
| Target Completion → | 4275Figure G.45: Formatted dataset example for Arithmetic 2Dx |
| Context → | Q: What is 509 minus 488? A: |
| Target Completion → | 21Figure G.46: Formatted dataset example for Arithmetic 3D- |
| Context → | Q: What is 556 plus 497? A: |
| Target Completion → | 1053Figure G.47: Formatted dataset example for Arithmetic 3D+ |
| Context → | Q: What is 6209 minus 3365? A: |
| Target Completion → | 2844 |

上表合并了七个算术示例, 每个目标补全后面紧跟下一张图的图题: 图 G.42 为一位数复合运算 1DC, 图 G.43 为两位数减法 2D-, 图 G.44 为两位数加法 2D+, 图 G.45 为两位数乘法 2Dx, 图 G.46 为三位数减法 3D-, 图 G.47 为三位数加法 3D+, 最后一行 6209 减 3365 对应下面的图 G.48.

Figure G.48: Formatted dataset example for Arithmetic 4D-

图 G.48: 算术四位数减法 (4D-) 的格式化数据示例.

<!-- page 62 of 75 -->

| Context → | Q: What is 9923 plus 617? A: |
| --- | --- |
| Target Completion → | 10540 |

Figure G.49: Formatted dataset example for Arithmetic 4D+

图 G.49: 算术四位数加法 (4D+) 的格式化数据示例.

| Context → | Q: What is 40649 minus 78746? A: |
| --- | --- |
| Target Completion → | -38097 |

Figure G.50: Formatted dataset example for Arithmetic 5D−

图 G.50: 算术五位数减法 (5D-) 的格式化数据示例.

| Context → | Q: What is 65360 plus 16204? A: |
| --- | --- |
| Target Completion → | 81564 |

Figure G.51: Formatted dataset example for Arithmetic 5D+

图 G.51: 算术五位数加法 (5D+) 的格式化数据示例.

<!-- page 63 of 75 -->

## H Results on All Tasks for All Model Sizes (所有模型尺寸在所有任务上的结果)

<table><tr><td rowspan="2">Name</td><td rowspan="2">Metric</td><td rowspan="2">Split</td><td colspan="3">Fine-tune</td><td colspan="7">Zero-Shot</td><td colspan="7">One-Shot</td><td colspan="7">Few-Shot</td><td>175B (test server)</td><td></td></tr><tr><td>SOTA</td><td>K</td><td>Small</td><td>Med</td><td>Large</td><td>XL</td><td>2.7B</td><td>6.7B</td><td>13B</td><td>175B</td><td>Small</td><td>Med</td><td>Large</td><td>XL</td><td>2.7B</td><td>6.7B</td><td>13B</td><td>175B</td><td>Small</td><td>Med</td><td>Large</td><td>XL</td><td>2.7B</td><td>6.7B</td><td>13B</td><td>175B</td></tr><tr><td>HellaSwag</td><td>acc</td><td>dev</td><td>85.6</td><td>20</td><td>33.7</td><td>43.6</td><td>51.0</td><td>54.7</td><td>62.8</td><td>67.4</td><td>70.9</td><td>78.9</td><td>33.0</td><td>42.9</td><td>50.5</td><td>53.5</td><td>61.9</td><td>66.5</td><td>70.0</td><td>78.1</td><td>33.5</td><td>43.1</td><td>51.3</td><td>54.9</td><td>62.9</td><td>67.3</td><td>71.3</td><td>79.3</td></tr><tr><td>LAMBADA</td><td>acc</td><td>test</td><td>68.0</td><td>15</td><td>42.7</td><td>54.3</td><td>60.4</td><td>63.6</td><td>67.1</td><td>70.3</td><td>72.5</td><td>76.2</td><td>22.0</td><td>47.1</td><td>52.6</td><td>58.3</td><td>61.1</td><td>65.4</td><td>69.0</td><td>72.5</td><td>22.0</td><td>40.4</td><td>63.2</td><td>57.0</td><td>78.1</td><td>79.1</td><td>81.3</td><td>86.4</td></tr><tr><td>LAMBADA</td><td>ppl</td><td>test</td><td>8.63</td><td>15</td><td>18.6</td><td>9.09</td><td>6.53</td><td>5.44</td><td>4.60</td><td>4.00</td><td>3.56</td><td>3.00</td><td>165.0</td><td>11.6</td><td>8.29</td><td>6.46</td><td>5.53</td><td>4.61</td><td>4.06</td><td>3.35</td><td>165.0</td><td>27.6</td><td>6.63</td><td>7.45</td><td>2.89</td><td>2.56</td><td>2.56</td><td>1.92</td></tr><tr><td>StoryCloze</td><td>acc</td><td>test</td><td>91.8</td><td>70</td><td>63.3</td><td>68.5</td><td>72.4</td><td>73.4</td><td>77.2</td><td>77.7</td><td>79.5</td><td>83.2</td><td>62.3</td><td>68.7</td><td>72.3</td><td>74.2</td><td>77.3</td><td>78.7</td><td>79.7</td><td>84.7</td><td>62.3</td><td>70.2</td><td>73.9</td><td>76.1</td><td>80.2</td><td>81.2</td><td>83.0</td><td>87.7</td></tr><tr><td>NQs</td><td>acc</td><td>test</td><td>44.5</td><td>64</td><td>0.64</td><td>1.75</td><td>2.71</td><td>4.40</td><td>6.01</td><td>5.79</td><td>7.84</td><td>14.6</td><td>1.19</td><td>3.07</td><td>4.79</td><td>5.43</td><td>8.73</td><td>9.78</td><td>13.7</td><td>23.0</td><td>1.72</td><td>4.46</td><td>7.89</td><td>9.72</td><td>13.2</td><td>17.0</td><td>21.0</td><td>29.9</td></tr><tr><td>TriviaQA</td><td>acc</td><td>dev</td><td>68.0</td><td>64</td><td>4.15</td><td>7.61</td><td>14.0</td><td>19.7</td><td>31.3</td><td>38.7</td><td>41.8</td><td>64.3</td><td>4.19</td><td>12.9</td><td>20.5</td><td>26.5</td><td>35.9</td><td>44.4</td><td>51.3</td><td>68.0</td><td>6.96</td><td>16.3</td><td>26.5</td><td>32.1</td><td>42.3</td><td>51.6</td><td>57.5</td><td>71.2</td></tr><tr><td>WebQs</td><td>acc</td><td>test</td><td>45.5</td><td>64</td><td>1.77</td><td>3.20</td><td>4.33</td><td>4.63</td><td>7.92</td><td>7.73</td><td>8.22</td><td>14.4</td><td>2.56</td><td>6.20</td><td>8.51</td><td>9.15</td><td>14.5</td><td>15.1</td><td>19.0</td><td>25.3</td><td>5.46</td><td>12.6</td><td>15.9</td><td>19.6</td><td>24.8</td><td>27.7</td><td>33.5</td><td>41.5</td></tr><tr><td>Ro→En 16</td><td>BLEU-mb</td><td>test</td><td>39.9</td><td>64</td><td>2.08</td><td>2.71</td><td>3.09</td><td>3.15</td><td>16.3</td><td>8.34</td><td>20.2</td><td>19.9</td><td>0.55</td><td>15.4</td><td>23.0</td><td>26.3</td><td>30.6</td><td>33.2</td><td>35.6</td><td>38.6</td><td>1.25</td><td>20.7</td><td>25.8</td><td>29.2</td><td>33.1</td><td>34.8</td><td>37.0</td><td>39.5</td></tr><tr><td>Ro→En 16</td><td>BLEU-sb</td><td>test</td><td></td><td>64</td><td>2.39</td><td>3.08</td><td>3.49</td><td>3.56</td><td>16.8</td><td>8.75</td><td>20.8</td><td>20.9</td><td>0.65</td><td>15.9</td><td>23.6</td><td>26.8</td><td>31.3</td><td>34.2</td><td>36.7</td><td>40.0</td><td>1.40</td><td>21.3</td><td>26.6</td><td>30.1</td><td>34.3</td><td>36.2</td><td>38.4</td><td>41.3</td></tr><tr><td>En→Ro 16</td><td>BLEU-mb</td><td>test</td><td>38.5</td><td>64</td><td>2.14</td><td>2.65</td><td>2.53</td><td>2.50</td><td>3.46</td><td>4.24</td><td>5.32</td><td>14.1</td><td>0.35</td><td>3.30</td><td>7.89</td><td>8.72</td><td>13.2</td><td>15.1</td><td>17.3</td><td>20.6</td><td>1.25</td><td>5.90</td><td>9.33</td><td>10.7</td><td>14.3</td><td>16.3</td><td>18.0</td><td>21.0</td></tr><tr><td>En→Ro 16</td><td>BLEU-sb</td><td>test</td><td></td><td>64</td><td>2.61</td><td>3.11</td><td>3.07</td><td>3.09</td><td>4.26</td><td>5.31</td><td>6.43</td><td>18.0</td><td>0.55</td><td>3.90</td><td>9.15</td><td>10.3</td><td>15.7</td><td>18.2</td><td>20.8</td><td>24.9</td><td>1.64</td><td>7.40</td><td>10.9</td><td>12.9</td><td>17.2</td><td>19.6</td><td>21.8</td><td>25.8</td></tr><tr><td>Fr→En 14</td><td>BLEU-mb</td><td>test</td><td>35.0</td><td>64</td><td>1.81</td><td>2.53</td><td>3.47</td><td>3.13</td><td>20.6</td><td>15.1</td><td>21.8</td><td>21.2</td><td>1.28</td><td>15.9</td><td>23.7</td><td>26.3</td><td>29.0</td><td>30.5</td><td>30.2</td><td>33.7</td><td>4.98</td><td>25.5</td><td>28.5</td><td>31.1</td><td>33.7</td><td>34.9</td><td>36.6</td><td>39.2</td></tr><tr><td>Fr→En 14</td><td>BLEU-mb</td><td>test</td><td></td><td>64</td><td>2.29</td><td>2.99</td><td>3.90</td><td>3.60</td><td>21.2</td><td>15.5</td><td>22.4</td><td>21.9</td><td>1.50</td><td>16.3</td><td>24.4</td><td>27.0</td><td>30.0</td><td>31.6</td><td>31.4</td><td>35.6</td><td>5.30</td><td>26.2</td><td>29.5</td><td>32.2</td><td>35.1</td><td>36.4</td><td>38.3</td><td>41.4</td></tr><tr><td>En→Fr 14</td><td>BLEU-mb</td><td>test</td><td>45.6</td><td>64</td><td>1.74</td><td>2.16</td><td>2.73</td><td>2.15</td><td>15.1</td><td>8.82</td><td>12.0</td><td>25.2</td><td>0.49</td><td>8.00</td><td>14.8</td><td>15.9</td><td>20.3</td><td>23.3</td><td>24.9</td><td>28.3</td><td>4.08</td><td>14.5</td><td>19.3</td><td>21.5</td><td>24.9</td><td>27.3</td><td>29.5</td><td>32.6</td></tr><tr><td>En→Fr 14</td><td>BLEU-mb</td><td>test</td><td>45.9</td><td>64</td><td>2.44</td><td>2.75</td><td>3.54</td><td>2.82</td><td>19.3</td><td>11.4</td><td>15.3</td><td>31.3</td><td>0.81</td><td>10.0</td><td>18.2</td><td>19.3</td><td>24.7</td><td>28.3</td><td>30.1</td><td>34.1</td><td>5.31</td><td>18.0</td><td>23.6</td><td>26.1</td><td>30.3</td><td>33.3</td><td>35.5</td><td>39.9</td></tr><tr><td>De→En 16</td><td>BLEU-mb</td><td>test</td><td>40.2</td><td>64</td><td>2.06</td><td>2.87</td><td>3.41</td><td>3.63</td><td>21.5</td><td>17.3</td><td>23.0</td><td>27.2</td><td>0.83</td><td>16.2</td><td>22.5</td><td>24.7</td><td>28.2</td><td>30.7</td><td>33.0</td><td>30.4</td><td>3.25</td><td>22.7</td><td>26.2</td><td>29.2</td><td>32.7</td><td>34.8</td><td>37.3</td><td>40.6</td></tr><tr><td>De→En 16</td><td>BLEU-mb</td><td>test</td><td></td><td>64</td><td>2.39</td><td>3.27</td><td>3.85</td><td>4.04</td><td>22.5</td><td>18.2</td><td>24.4</td><td>28.6</td><td>0.93</td><td>17.1</td><td>23.4</td><td>25.8</td><td>29.2</td><td>31.9</td><td>34.5</td><td>32.1</td><td>3.60</td><td>23.8</td><td>27.5</td><td>30.5</td><td>34.1</td><td>36.5</td><td>39.1</td><td>43.0</td></tr><tr><td>En→De 16</td><td>BLEU-mb</td><td>test</td><td>41.2</td><td>64</td><td>1.70</td><td>2.27</td><td>2.31</td><td>2.43</td><td>12.9</td><td>8.66</td><td>10.4</td><td>24.6</td><td>0.50</td><td>7.00</td><td>12.9</td><td>13.1</td><td>18.3</td><td>20.9</td><td>22.5</td><td>26.2</td><td>3.42</td><td>12.3</td><td>15.4</td><td>17.1</td><td>20.9</td><td>23.0</td><td>26.6</td><td>29.7</td></tr><tr><td>En→De 16</td><td>BLEU-mb</td><td>test</td><td>41.2</td><td>64</td><td>2.09</td><td>2.65</td><td>2.75</td><td>2.92</td><td>13.7</td><td>9.36</td><td>11.0</td><td>25.3</td><td>0.54</td><td>7.40</td><td>13.4</td><td>13.4</td><td>18.8</td><td>21.7</td><td>23.3</td><td>27.3</td><td>3.78</td><td>12.9</td><td>16.1</td><td>17.7</td><td>21.7</td><td>24.1</td><td>27.7</td><td>30.9</td></tr><tr><td>Winograd</td><td>acc</td><td>test</td><td>93.8</td><td>7</td><td>66.3</td><td>72.9</td><td>74.7</td><td>76.9</td><td>82.4</td><td>85.7</td><td>87.9</td><td>88.3</td><td>63.4</td><td>68.5</td><td>72.9</td><td>76.9</td><td>82.4</td><td>84.6</td><td>86.1</td><td>89.7</td><td>63.4</td><td>67.4</td><td>73.6</td><td>76.9</td><td>84.3</td><td>85.4</td><td>82.4</td><td>88.6</td></tr><tr><td>Winogrande</td><td>acc</td><td>dev</td><td>84.6</td><td>50</td><td>52.0</td><td>52.1</td><td>57.4</td><td>58.7</td><td>62.3</td><td>64.5</td><td>67.9</td><td>70.2</td><td>51.3</td><td>53.0</td><td>58.3</td><td>59.1</td><td>61.7</td><td>65.8</td><td>66.9</td><td>73.2</td><td>51.3</td><td>52.6</td><td>57.5</td><td>59.1</td><td>62.6</td><td>67.4</td><td>70.0</td><td>77.7</td></tr><tr><td>PIQA</td><td>acc</td><td>dev</td><td>77.1</td><td>50</td><td>64.6</td><td>70.2</td><td>72.9</td><td>75.1</td><td>75.6</td><td>78.0</td><td>78.5</td><td>81.0</td><td>64.3</td><td>69.3</td><td>71.8</td><td>74.4</td><td>74.3</td><td>76.3</td><td>77.8</td><td>80.5</td><td>64.3</td><td>69.4</td><td>72.0</td><td>74.3</td><td>75.4</td><td>77.8</td><td>79.9</td><td>82.3</td></tr><tr><td>ARC (Challenge)</td><td>acc</td><td>test</td><td>78.5</td><td>50</td><td>26.6</td><td>29.5</td><td>31.8</td><td>35.5</td><td>38.0</td><td>41.4</td><td>43.7</td><td>51.4</td><td>25.5</td><td>30.2</td><td>31.6</td><td>36.4</td><td>38.4</td><td>41.5</td><td>43.1</td><td>53.2</td><td>25.5</td><td>28.4</td><td>32.3</td><td>36.7</td><td>39.5</td><td>43.7</td><td>44.8</td><td>51.5</td></tr><tr><td>ARC (Easy)</td><td>acc</td><td>test</td><td>92.0</td><td>50</td><td>43.6</td><td>46.5</td><td>53.0</td><td>53.8</td><td>58.2</td><td>60.2</td><td>63.8</td><td>68.8</td><td>42.7</td><td>48.2</td><td>54.6</td><td>55.9</td><td>60.3</td><td>62.6</td><td>66.8</td><td>71.2</td><td>42.7</td><td>51.0</td><td>58.1</td><td>59.1</td><td>62.1</td><td>65.8</td><td>69.1</td><td>70.1</td></tr><tr><td>OpenBookQA</td><td>acc</td><td>test</td><td>87.2</td><td>100</td><td>35.6</td><td>43.2</td><td>45.2</td><td>46.8</td><td>53.0</td><td>50.4</td><td>55.6</td><td>57.6</td><td>37.0</td><td>39.8</td><td>46.2</td><td>46.4</td><td>53.4</td><td>53.0</td><td>55.8</td><td>58.8</td><td>37.0</td><td>43.6</td><td>48.0</td><td>50.6</td><td>55.6</td><td>55.2</td><td>60.8</td><td>65.4</td></tr><tr><td>Quac</td><td>fl</td><td>dev</td><td>74.4</td><td>5</td><td>21.2</td><td>26.8</td><td>31.0</td><td>30.1</td><td>34.7</td><td>36.1</td><td>38.4</td><td>41.5</td><td>21.1</td><td>26.9</td><td>31.9</td><td>32.3</td><td>37.4</td><td>39.0</td><td>40.6</td><td>43.4</td><td>21.6</td><td>27.6</td><td>32.9</td><td>34.2</td><td>38.2</td><td>39.9</td><td>40.9</td><td>44.3</td></tr><tr><td>RACE-h</td><td>acc</td><td>test</td><td>90.0</td><td>10</td><td>35.2</td><td>37.9</td><td>40.1</td><td>40.9</td><td>42.4</td><td>44.1</td><td>44.6</td><td>45.5</td><td>34.3</td><td>37.7</td><td>40.0</td><td>42.0</td><td>43.8</td><td>44.3</td><td>44.6</td><td>45.9</td><td>34.3</td><td>37.0</td><td>40.4</td><td>41.4</td><td>42.3</td><td>44.7</td><td>45.1</td><td>46.8</td></tr><tr><td>RACE-m</td><td>acc</td><td>test</td><td>93.1</td><td>10</td><td>42.1</td><td>47.2</td><td>52.1</td><td>52.3</td><td>54.7</td><td>54.4</td><td>56.7</td><td>58.4</td><td>42.3</td><td>47.3</td><td>51.7</td><td>55.2</td><td>56.1</td><td>54.7</td><td>56.9</td><td>57.4</td><td>42.3</td><td>47.0</td><td>52.7</td><td>53.0</td><td>55.6</td><td>55.4</td><td>58.1</td><td>58.1</td></tr><tr><td>SQuADv2</td><td>em</td><td>dev</td><td>90.7</td><td>16</td><td>22.6</td><td>32.8</td><td>33.9</td><td>43.1</td><td>43.6</td><td>45.4</td><td>49.0</td><td>52.6</td><td>25.1</td><td>37.5</td><td>37.9</td><td>47.9</td><td>47.9</td><td>51.1</td><td>56.0</td><td>60.1</td><td>27.5</td><td>40.5</td><td>39.2</td><td>53.5</td><td>50.0</td><td>56.6</td><td>62.6</td><td>64.9</td></tr><tr><td>SQuADv2</td><td>fl</td><td>dev</td><td>93.0</td><td>16</td><td>28.3</td><td>40.2</td><td>41.4</td><td>50.3</td><td>51.0</td><td>52.7</td><td>56.3</td><td>59.5</td><td>30.1</td><td>43.6</td><td>44.1</td><td>54.0</td><td>54.1</td><td>57.1</td><td>61.8</td><td>65.4</td><td>32.1</td><td>45.5</td><td>44.9</td><td>58.7</td><td>55.9</td><td>62.1</td><td>67.7</td><td>69.8</td></tr><tr><td>CoQA</td><td>fl</td><td>dev</td><td>90.7</td><td>5</td><td>34.5</td><td>55.0</td><td>61.8</td><td>65.3</td><td>71.1</td><td>72.8</td><td>76.3</td><td>81.5</td><td>30.6</td><td>52.1</td><td>61.6</td><td>66.1</td><td>71.8</td><td>75.1</td><td>77.9</td><td>84.0</td><td>31.1</td><td>52.0</td><td>62.7</td><td>66.8</td><td>73.2</td><td>77.3</td><td>79.9</td><td>85.0</td></tr><tr><td>DROP</td><td>fl</td><td>dev</td><td>89.1</td><td>20</td><td>9.40</td><td>13.6</td><td>14.4</td><td>16.4</td><td>19.7</td><td>17.0</td><td>24.0</td><td>23.6</td><td>11.7</td><td>18.1</td><td>20.9</td><td>23.0</td><td>26.4</td><td>27.3</td><td>29.2</td><td>34.3</td><td>12.9</td><td>18.7</td><td>24.0</td><td>25.6</td><td>29.7</td><td>29.7</td><td>32.3</td><td>36.5</td></tr><tr><td>BoolQ</td><td>acc</td><td>dev</td><td>91.0</td><td>32</td><td>49.7</td><td>60.3</td><td>58.9</td><td>62.4</td><td>67.1</td><td>65.4</td><td>66.2</td><td>60.5</td><td>52.6</td><td>61.7</td><td>60.4</td><td>63.7</td><td>68.4</td><td>68.7</td><td>69.0</td><td>76.7</td><td>43.1</td><td>60.6</td><td>62.0</td><td>64.1</td><td>70.3</td><td>70.0</td><td>70.2</td><td>77.5</td></tr><tr><td>CB</td><td>acc</td><td>dev</td><td>96.9</td><td>32</td><td>0.00</td><td>32.1</td><td>8.93</td><td>19.6</td><td>19.6</td><td>28.6</td><td>19.6</td><td>46.4</td><td>55.4</td><td>53.6</td><td>53.6</td><td>48.2</td><td>57.1</td><td>33.9</td><td>55.4</td><td>64.3</td><td>42.9</td><td>58.9</td><td>53.6</td><td>69.6</td><td>67.9</td><td>60.7</td><td>66.1</td><td>82.1</td></tr><tr><td>CB</td><td>fl</td><td>dev</td><td>93.9</td><td>32</td><td>0.00</td><td>29.3</td><td>11.4</td><td>17.4</td><td>22.4</td><td>25.1</td><td>20.3</td><td>42.8</td><td>60.1</td><td>39.8</td><td>45.6</td><td>37.5</td><td>45.7</td><td>28.5</td><td>44.6</td><td>52.5</td><td>26.1</td><td>40.4</td><td>32.6</td><td>48.3</td><td>45.7</td><td>44.6</td><td>46.0</td><td>57.2</td></tr><tr><td>Copa</td><td>acc</td><td>dev</td><td>94.8</td><td>32</td><td>66.0</td><td>68.0</td><td>73.0</td><td>77.0</td><td>76.0</td><td>80.0</td><td>84.0</td><td>91.0</td><td>62.0</td><td>64.0</td><td>66.0</td><td>74.0</td><td>76.0</td><td>82.0</td><td>86.0</td><td>87.0</td><td>67.0</td><td>64.0</td><td>72.0</td><td>77.0</td><td>83.0</td><td>83.0</td><td>86.0</td><td>92.0</td></tr><tr><td>RTE</td><td>acc</td><td>dev</td><td>92.5</td><td>32</td><td>47.7</td><td>49.8</td><td>48.4</td><td>56.0</td><td>46.6</td><td>55.2</td><td>62.8</td><td>63.5</td><td>53.1</td><td>47.3</td><td>49.5</td><td>49.5</td><td>54.9</td><td>54.9</td><td>56.3</td><td>70.4</td><td>52.3</td><td>48.4</td><td>46.9</td><td>50.9</td><td>56.3</td><td>49.5</td><td>60.6</td><td>72.9</td></tr><tr><td>WiC</td><td>acc</td><td>dev</td><td>76.1</td><td>32</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>50</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></table>

Table H.1: Scores for every task, setting and model that we investigate in this paper.

表 H.1: 本文研究的每个任务, 每种设定, 每个模型的分数.

> **回看:** 表 H.1 本身有没有印错或缺格的地方?
> 有几处. 翻译各两行中, Ro→En 和 En→Ro 的第二行标为 BLEU-sb, 而 Fr→En, En→Fr, De→En, En→De 的第二行仍标 BLEU-mb, 按表 C.1 用 bleu-sb 报 41.4, 39.9, 43.0, 30.9 来看, 这四行应是 SacreBLEU. WiC 行 zero-shot 八格全是 0.00 (与图 H.1 中 WiC 零样本线贴在 0 一致), one-shot 第一格写 50, 其后全空, SuperGLUE 其余的 MultiRC, ReCoRD, WSC 以及 ANLI, 算术等行在本版里都没有出现. 表头的 「175B (test server)」 一列也整列为空.

<!-- page 64 of 75 -->

![图H.1 SuperGLUE各子任务的11个小图, 依次为BoolQ, CB准确率, CB F1, COPA, RTE, WiC, WSC, MultiRC准确率, MultiRC F1a, ReCoRD准确率, ReCoRD F1, 每图三条线为zero-shot, one-shot和K等于32的few-shot, 并画出微调最好水平, BERT-Large和随机猜测参考线, WiC的zero-shot线贴在0](images/p64-figure-h-1-all-results-for-all-superglue-tasks.png)

Figure H.1: All results for all SuperGLUE tasks.

图 H.1: 所有 SuperGLUE 任务的全部结果.

![图H.2 SAT类比题准确率随参数量变化, 三条线为zero-shot, one-shot和K等于20的few-shot, 底部虚线是随机猜测20%, 13B及以下三条线交织在40到55之间, 175B处分开, few-shot约65](images/p64-figure-h-2-results-for-sat-task.png)

Figure H.2: Results for SAT task.

图 H.2: SAT 任务的结果.

![图H.3 Winograd类任务的两个小图, 左为few-shot取K等于50的Winogrande, 带人类, 微调最好水平, 微调RoBERTa-Large, 微调BERT-Large和随机猜测参考线, 右为few-shot取K等于7的Winograd, 带微调最好水平和随机猜测参考线, 13B的few-shot点低于6.7B](images/p64-figure-h-3-all-results-for-all-winograd-tasks.png)

Figure H.3: All results for all Winograd tasks.

图 H.3: 所有 Winograd 类任务的全部结果.

<!-- page 65 of 75 -->

![图H.5完形与补全任务的三个小图, 依次为HellaSwag, Lambada, Storycloze, 每图三条线为zero-shot, one-shot和few-shot, Lambada的few-shot在1.3B处下凹后在2.6B处跃升](images/p65-chart.png)

![图H.4 算术任务的11个小图, 第一个是十项任务的few-shot汇总, 其余十个分别为两位数加法, 两位数乘法, 两位数减法, 三位数加法, 三位数减法, 四位数加法, 四位数减法, 五位数加法, 五位数减法和一位数三项运算, 每图三条线的few-shot标为K等于50](images/p65-figure-h-4-all-results-for-all-arithmetic-tasks.png)

Figure H.4: All results for all Arithmetic tasks.

图 H.4: 所有算术任务的全部结果.

Figure H.5: All results for all Cloze and Completion tasks.

图 H.5: 所有完形填空与补全任务的全部结果.

<!-- page 66 of 75 -->

![PhysicalQA准确率随参数量变化的小图, 三条线为zero-shot, one-shot和few-shot, 带人类, 微调最好水平和随机猜测参考线](images/p66-chart.png)

![ARC Challenge准确率随参数量变化的小图, 三条线为zero-shot, one-shot和K等于50的few-shot, 几乎重合地从约26升到约52, 顶部虚线是微调最好水平约78](images/p66-chart-2.png)

![图H.6中的OpenBookQA小图, 准确率随参数量变化, few-shot线在175B处明显高于zero-shot和one-shot](images/p66-figure-h-6-all-results-for-all-common-sense-reasoning.png)

Figure H.6: All results for all Common Sense Reasoning tasks.

图 H.6: 所有常识推理任务的全部结果.

![Natural Questions准确率小图, 横轴按T5的划分标出参数量, 末端两档写作12.8B和174.6B, 三条线为zero-shot, one-shot和K等于64的few-shot, 顶部虚线为微调最好水平, 175B的few-shot约30](images/p66-chart-3.png)

![图H.7中的TriviaQA小图, 准确率随参数量平滑上升, 三条线为zero-shot, one-shot和K等于64的few-shot, 顶部虚线为微调最好水平约68, 175B的few-shot越过该线](images/p66-figure-h-7-all-results-for-all-qa-tasks.png)

Figure H.7: All results for all QA tasks.

图 H.7: 所有问答任务的全部结果.

![WebQS准确率随参数量变化的小图, 三条线为zero-shot, one-shot和few-shot, few-shot在大模型端上升最快](images/p66-chart-4.png)

![QuAC F1随参数量变化的小图, 三条线为zero-shot, one-shot和few-shot, 175B处约41到44, 远低于微调最好水平](images/p66-chart-5.png)

![RACE-h准确率随参数量变化的小图, 三条线几乎重合, 175B处约46](images/p66-chart-6.png)

![RACE-m准确率随参数量变化的小图, 三条线相互交错, 175B处约58](images/p66-chart-7.png)

![SQuADv2 F1随参数量变化的小图, few-shot在175B处约70, 高于zero-shot约60](images/p66-chart-8.png)

![CoQA F1随参数量变化的小图, 三条线为zero-shot, one-shot和few-shot, 175B的few-shot约85](images/p66-chart-9.png)

![图H.8中的DROP小图, F1随参数量上升, 175B的few-shot约37, 远低于微调最好水平](images/p66-figure-h-8-all-results-for-all-reading-comprehension.png)

Figure H.8: All results for all Reading Comprehension tasks.

图 H.8: 所有阅读理解任务的全部结果.

![ANLI第1轮准确率随参数量变化的小图, 三条线大多贴近三分之一的随机水平](images/p66-chart-10.png)

![图H.9中的ANLI第2轮小图, 三条线在随机水平附近波动](images/p66-figure-h-9-all-results-for-all-anli-rounds.png)

Figure H.9: All results for all ANLI rounds.

图 H.9: 所有 ANLI 轮次的全部结果.

![ANLI第3轮准确率随参数量变化的小图, 175B的few-shot升到约40, 其余尺寸贴近随机水平](images/p66-66.png)

<!-- page 67 of 75 -->

![图H.10 单词打乱类任务的6个小图, 依次为字母循环, 五项任务的few-shot汇总, 中间词打乱1, 中间词打乱2, 随机插入和单词倒写, 单项小图各有zero-shot, one-shot和K等于100的few-shot三条线, 单词倒写的纵轴上限只有0.5](images/p67-figure-h-10-all-results-for-all-scramble-tasks.png)

Figure H.10: All results for all Scramble tasks.

图 H.10: 所有打乱类任务的全部结果.

![图H.11 翻译任务的12个小图, 六个语言方向各有SacreBLEU和Multi-BLEU两版, 每图三条线为zero-shot, one-shot和few-shot, 译入英文的方向整体高于译出英文](images/p67-figure-h-11-all-results-for-all-translation-tasks.png)

Figure H.11: All results for all Translation tasks.

图 H.11: 所有翻译任务的全部结果.

<!-- page 68 of 75 -->

## References

参考文献条目保留原文, 按作者缩写排序.

[ADG+16] Marcin Andrychowicz, Misha Denil, Sergio Gomez, Matthew W Hoffman, David Pfau, Tom Schaul, Brendan Shillingford, and Nando De Freitas. Learning to learn by gradient descent by gradient descent. In Advances in neural information processing systems, pages 3981–3989, 2016.

[AI19] WeChat AI. Tr-mt (ensemble), December 2019.

[AJF19] Roee Aharoni, Melvin Johnson, and Orhan Firat. Massively multilingual neural machine translation. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), 2019.

[BBDIW20] Su Lin Blodgett, Solon Barocas, Hal Daume III, and Hanna Wallach. Language (technology) is power: ´ A critical survey of “bias” in nlp. arXiv preprint arXiv:2005.14050, 2020.

[BCFL13] Jonathan Berant, Andrew Chou, Roy Frostig, and Percy Liang. Semantic parsing on freebase from question-answer pairs. In Proceedings of the 2013 conference on empirical methods in natural language processing, pages 1533–1544, 2013.

[BDD+09] Luisa Bentivogli, Ido Dagan, Hoa Trang Dang, Danilo Giampiccolo, and Bernardo Magnini. The fifth PASCAL recognizing textual entailment challenge. 2009.

[BES10] Stefano Baccianella, Andrea Esuli, and Fabrizio Sebastiani. Sentiwordnet 3.0: an enhanced lexical resource for sentiment analysis and opinion mining. In Lrec, volume 10, pages 2200–2204, 2010.

[BHDD+06] Roy Bar Haim, Ido Dagan, Bill Dolan, Lisa Ferro, Danilo Giampiccolo, Bernardo Magnini, and Idan Szpektor. The second PASCAL recognising textual entailment challenge. 2006.

[BHT+20] Yonatan Bisk, Ari Holtzman, Jesse Thomason, Jacob Andreas, Yoshua Bengio, Joyce Chai, Mirella Lapata, Angeliki Lazaridou, Jonathan May, Aleksandr Nisnevich, et al. Experience grounds language. arXiv preprint arXiv:2004.10151, 2020.

[BLC13] Yoshua Bengio, Nicholas Leonard, and Aaron C. Courville. Estimating or propagating gradients through ´ stochastic neurons for conditional computation. Arxiv, 2013.

[BZB+19] Yonatan Bisk, Rowan Zellers, Ronan Le Bras, Jianfeng Gao, and Yejin Choi. Piqa: Reasoning about physical commonsense in natural language. arXiv preprint arXiv:1911.11641, 2019.

[Car97] Rich Caruana. Multitask learning. Machine learning, 28(1), 1997.

[CB78] Susan Carey and Elsa Bartlett. Acquiring a single new word. Proceedings of the Stanford Child Language Conference, 1978.

[CCE+18] Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. ArXiv, abs/1803.05457, 2018.

[CGRS19] Rewon Child, Scott Gray, Alec Radford, and Ilya Sutskever. Generating long sequences with sparse transformers, 2019.

[CHI+18] Eunsol Choi, He He, Mohit Iyyer, Mark Yatskar, Wen-tau Yih, Yejin Choi, Percy Liang, and Luke Zettlemoyer. Quac : Question answering in context. Arxiv, 2018.

[CLC+19] Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and Kristina Toutanova. BoolQ: Exploring the surprising difficulty of natural yes/no questions. arXiv preprint arXiv:1905.10044, 2019.

[CLY+19] Yen-Chun Chen, Linjie Li, Licheng Yu, Ahmed El Kholy, Faisal Ahmed, Zhe Gan, Yu Cheng, and Jingjing Liu. Uniter: Learning universal image-text representations. arXiv preprint arXiv:1909.11740, 2019.

[Cra17] Kate Crawford. The trouble with bias. NIPS 2017 Keynote, 2017.

[DCLT18] Jacob Devlin, Ming-Wei Chang, Kenton Lee, and Kristina Toutanova. BERT: Pre-training of deep bidirectional transformers for language understanding. arXiv preprint arXiv:1810.04805, 2018.

<!-- page 69 of 75 -->

[DGM06] Ido Dagan, Oren Glickman, and Bernardo Magnini. The PASCAL recognising textual entailment challenge. In Machine learning challenges. evaluating predictive uncertainty, visual object classification, and recognising textual entailment, pages 177–190. Springer, 2006.

[DGV+18] Mostafa Dehghani, Stephan Gouws, Oriol Vinyals, Jakob Uszkoreit, and Lukasz Kaiser. Universal transformers. Arxiv, 2018.

[DHKH14] Nadir Durrani, Barry Haddow, Philipp Koehn, and Kenneth Heafield. Edinburgh’s phrase-based machine translation systems for wmt-14. In Proceedings of the Ninth Workshop on Statistical Machine Translation, pages 97–104, 2014.

[DL15] Andrew M. Dai and Quoc V. Le. Semi-supervised sequence learning. In Advances in neural information processing systems, 2015.

[DMST19] Marie-Catherine De Marneffe, Mandy Simons, and Judith Tonhauser. The CommitmentBank: Investigating projection in naturally occurring discourse. 2019. To appear in proceedings of Sinn und Bedeutung 23. Data can be found at https://github.com/mcdm/CommitmentBank/.

[DSC+16] Yan Duan, John Schulman, Xi Chen, Peter L. Bartlett, Ilya Sutskever, and Pieter Abbeel. $\mathrm { { \bf R } l ^ { 2 } } ;$ Fast reinforcement learning via slow reinforcement learning. ArXiv, abs/1611.02779, 2016.

[DWD+19] Dheeru Dua, Yizhong Wang, Pradeep Dasigi, Gabriel Stanovsky, Sameer Singh, and Matt Gardner. Drop: A reading comprehension benchmark requiring discrete reasoning over paragraphs. arXiv preprint arXiv:1903.00161, 2019.

[DYY+19] Zihang Dai, Zhilin Yang, Yiming Yang, Jaime G. Carbonell, Quoc V. Le, and Ruslan Salakhutdinov. Transformer-xl: Attentive language models beyond a fixed-length context. Arxiv, 2019.

[EOAG18] Sergey Edunov, Myle Ott, Michael Auli, and David Grangier. Understanding back-translation at scale. arXiv preprint arXiv:1808.09381, 2018.

[FAL17] Chelsea Finn, Pieter Abbeel, and Sergey Levine. Model-agnostic meta-learning for fast adaptation of deep networks. ArXiv, abs/1703.03400, 2017.

[Fyo00] Yaroslav Fyodorov. A natural logic inference system, 2000.

[GG19] Hila Gonen and Yoav Goldberg. Lipstick on a pig: Debiasing methods cover up systematic gender biases in word embeddings but do not remove them. arXiv preprint arXiv:1903.03862, 2019.

[GLT+20] Kelvin Guu, Kenton Lee, Zora Tung, Panupong Pasupat, and Ming-Wei Chang. Realm: Retrievalaugmented language model pre-training. arXiv preprint arXiv:2002.08909, 2020.

[GMDD07] Danilo Giampiccolo, Bernardo Magnini, Ido Dagan, and Bill Dolan. The third PASCAL recognizing textual entailment challenge. In Proceedings of the ACL-PASCAL workshop on textual entailment and paraphrasing, pages 1–9. Association for Computational Linguistics, 2007.

[Gra16] Alex Graves. Adaptive computation time for recurrent neural networks. Arxiv, 2016.

[GSL+18] Suchin Gururangan, Swabha Swayamdipta, Omer Levy, Roy Schwartz, Samuel R Bowman, and Noah A Smith. Annotation artifacts in natural language inference data. arXiv preprint arXiv:1803.02324, 2018.

[GSR19] Sebastian Gehrmann, Hendrik Strobelt, and Alexander M. Rush. Gltr: Statistical detection and visualization of generated text. arXiv preprint arXiv: 1906.04043, 2019.

[GWC+18] Jiatao Gu, Yong Wang, Yun Chen, Kyunghyun Cho, and Victor OK Li. Meta-learning for low-resource neural machine translation. arXiv preprint arXiv:1808.08437, 2018.

[HB20] Daniel Hernandez and Tom Brown. Ai and efficiency, May 2020.

[HBFC19] Ari Holtzman, Jan Buys, Maxwell Forbes, and Yejin Choi. The curious case of neural text degeneration. CoRR, abs/1904.09751, 2019.

[HLW+20] Dan Hendrycks, Xiaoyuan Liu, Eric Wallace, Adam Dziedzic, Rishabh Krishnan, and Dawn Song. Pretrained transformers improve out of distribution robustness. arXiv preprint arXiv:2004.06100, 2020.

<!-- page 70 of 75 -->

[HNA+17] Joel Hestness, Sharan Narang, Newsha Ardalani, Gregory Diamos, Heewoo Jun, Hassan Kianinejad, Md. Mostofa Ali Patwary, Yang Yang, and Yanqi Zhou. Deep learning scaling is predictable, empirically. arXiv preprint arXiv:1712.00409, 2017.

[HR18] Jeremy Howard and Sebastian Ruder. Universal language model fine-tuning for text classification. arXiv preprint arXiv:1801.06146, 2018.

[HVD15] Geoffrey Hinton, Oriol Vinyals, and Jeff Dean. Distilling the knowledge in a neural network. arXiv preprint arXiv:1503.02531, 2015.

[HYC01] Sepp Hochreiter, A Steven Younger, and Peter R Conwell. Learning to Learn Using Gradient Descent. In International Conference on Artificial Neural Networks, pages 87–94. Springer, 2001.

[HZJ+19] Po-Sen Huang, Huan Zhang, Ray Jiang, Robert Stanforth, Johannes Welbl, Jack Rae, Vishal Maini, Dani Yogatama, and Pushmeet Kohli. Reducing sentiment bias in language models via counterfactual evaluation. arXiv preprint arXiv:1911.03064, 2019.

[IBGC+14] Mohit Iyyer, Jordan Boyd-Graber, Leonardo Claudino, Richard Socher, and Hal Daume III. A neural ´ network for factoid question answering over paragraphs. In Empirical Methods in Natural Language Processing, 2014.

[IDCBE19] Daphne Ippolito, Daniel Duckworth, Chris Callison-Burch, and Douglas Eck. Automatic detection of generated text is easiest when humans are fooled. arXiv preprint arXiv:1911.00650, 2019.

[JCWZ17] Mandar Joshi, Eunsol Choi, Daniel S. Weld, and Luke Zettlemoyer. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. arXiv preprint arXiv:1705.03551, 2017.

[JN20] Zheng Junyuan and Gamma Lab NYC. Numeric transformer - albert, March 2020.

[JVS+16] Rafal Jozefowicz, Oriol Vinyals, Mike Schuster, Noam Shazeer, and Yonghui Wu. Exploring the limits of language modeling. arXiv preprint arXiv:1602.02410, 2016.

[JYS+19] Xiaoqi Jiao, Yichun Yin, Lifeng Shang, Xin Jiang, Xiao Chen, Linlin Li, Fang Wang, and Qun Liu. TinyBERT: Distilling BERT for natural language understanding. arXiv preprint arXiv:1909.10351, 2019.

[JZC+19] Ying Ju, Fubang Zhao, Shijie Chen, Bowen Zheng, Xuefeng Yang, and Yunfeng Liu. Technical report on conversational question answering. arXiv preprint arXiv:1909.10772, 2019.

[KCR+18] Daniel Khashabi, Snigdha Chaturvedi, Michael Roth, Shyam Upadhyay, and Dan Roth. Looking beyond the surface: A challenge set for reading comprehension over multiple sentences. In Proceedings of North American Chapter of the Association for Computational Linguistics (NAACL), 2018.

[KKS+20] Daniel Khashabi, Tushar Khot, Ashish Sabharwal, Oyvind Tafjord, Peter Clark, and Hannaneh Hajishirzi. Unifiedqa: Crossing format boundaries with a single qa system. arXiv preprint arXiv:2005.00700, 2020.

[KMB20] Sarah E. Kreps, Miles McCain, and Miles Brundage. All the news that’s fit to fabricate: Ai-generated text as a tool of media misinformation, 2020.

[KMH+20] Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, and Dario Amodei. Scaling laws for neural language models, 2020.

[KPR+19] Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris Alberti, Danielle Epstein, Illia Polosukhin, Matthew Kelcey, Jacob Devlin, Kenton Lee, Kristina N. Toutanova, Llion Jones, Ming-Wei Chang, Andrew Dai, Jakob Uszkoreit, Quoc Le, and Slav Petrov. Natural questions: a benchmark for question answering research. Transactions of the Association of Computational Linguistics, 2019.

[KR16] Yoon Kim and Alexander M. Rush. Sequence-level knowledge distillation. Arxiv, 2016.

[LB02] Edward Loper and Steven Bird. Nltk: The natural language toolkit, 2002.

[LC19] Guillaume Lample and Alexis Conneau. Cross-lingual language model pretraining. arXiv preprint arXiv:1901.07291, 2019.

<!-- page 71 of 75 -->

[LCG+19] Zhenzhong Lan, Mingda Chen, Sebastian Goodman, Kevin Gimpel, Piyush Sharma, and Radu Soricut. ALBERT: A lite BERT for self-supervised learning of language representations. arXiv preprint arXiv:1909.11942, 2019.

[LCH+20] Xiaodong Liu, Hao Cheng, Pengcheng He, Weizhu Chen, Yu Wang, Hoifung Poon, and Jianfeng Gao. Adversarial training for large neural language models. arXiv preprint arXiv:2004.08994, 2020.

[LDL19] Zhongyang Li, Xiao Ding, and Ting Liu. Story ending prediction by transferable bert. arXiv preprint arXiv:1905.07504, 2019.

[LDM12] Hector Levesque, Ernest Davis, and Leora Morgenstern. The Winograd schema challenge. In Thirteenth International Conference on the Principles of Knowledge Representation and Reasoning, 2012.

[LGG+20] Yinhan Liu, Jiatao Gu, Naman Goyal, Xian Li, Sergey Edunov, Marjan Ghazvininejad, Mike Lewis, and Luke Zettlemoyer. Multilingual denoising pre-training for neural machine translation. arXiv preprint arXiv:2001.08210, 2020.

[LGH+15] Xiaodong Liu, Jianfeng Gao, Xiaodong He, Li Deng, Kevin Duh, and Ye-Yi Wang. Representation learning using multi-task deep neural networks for semantic classification and information retrieval. In Proceedings of the 2015 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, 2015.

[LH17] Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. arXiv preprint arXiv:1711.05101, 2017.

[LHCG19a] Xiaodong Liu, Pengcheng He, Weizhu Chen, and Jianfeng Gao. Improving multi-task deep neural networks via knowledge distillation for natural language understanding. arXiv preprint arXiv:1904.09482, 2019.

[LHCG19b] Xiaodong Liu, Pengcheng He, Weizhu Chen, and Jianfeng Gao. Multi-task deep neural networks for natural language understanding. arXiv preprint arXiv:1901.11504, 2019.

[Lin20] Tal Linzen. How can we accelerate progress towards human-like linguistic generalization? arXiv preprint arXiv:2005.00955, 2020.

[LLG+19] Mike Lewis, Yinhan Liu, Naman Goyal, Marjan Ghazvininejad, Abdelrahman Mohamed, Omer Levy, Ves Stoyanov, and Luke Zettlemoyer. Bart: Denoising sequence-to-sequence pre-training for natural language generation, translation, and comprehension. arXiv preprint arXiv:1910.13461, 2019.

[LM17] Ke Li and Jitendra Malik. Learning to optimize neural nets. arXiv preprint arXiv:1703.00441, 2017.

[LOG+19] Yinhan Liu, Myle Ott, Naman Goyal, Jingfei Du, Mandar Joshi, Danqi Chen, Omer Levy, Mike Lewis, Luke Zettlemoyer, and Veselin Stoyanov. RoBERTa: A robustly optimized BERT pretraining approach. arXiv preprint arXiv:1907.11692, 2019.

[LPP+20] Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Kuttler, Mike Lewis, Wen-tau Yih, Tim Rockt ¨ aschel, Sebastian Riedel, and Kiela Douwe. ¨ Retrieval-augmented generation for knowledge-intensive nlp tasks. arXiv preprint arXiv:2005.11401, 2020.

[LSP+18] Peter J. Liu, Mohammad Saleh, Etienne Pot, Ben Goodrich, Ryan Sepassi, Lukasz Kaiser, and Noam Shazeer. Generating Wikipedia by summarizing long sequences. arXiv preprint arXiv:1801.10198, 2018.

[LWS+20] Zhuohan Li, Eric Wallace, Sheng Shen, Kevin Lin, Kurt Keutzer, Dan Klein, and Joseph E. Gonzalez. Train large, then compress: Rethinking model size for efficient training and inference of transformers, 2020.

[LXL+17] Guokun Lai, Qizhe Xie, Hanxiao Liu, Yiming Yang, and Eduard Hovy. Race: Large-scale reading comprehension dataset from examinations. arXiv preprint arXiv:1704.04683, 2017.

[LYN+20] Sheng-Chieh Lin, Jheng-Hong Yang, Rodrigo Nogueira, Ming-Feng Tsai, Chuan-Ju Wang, and Jimmy Lin. Tttttackling winogrande schemas. arXiv preprint arXiv:2003.08380, 2020.

[Mac92] David. MacKay. Information-based objective functions for active data selection. Neural Computation, 1992.

<!-- page 72 of 75 -->

[MBXS17] Bryan McCann, James Bradbury, Caiming Xiong, and Richard Socher. Learned in translation: Contextualized word vectors. In Advances in Neural Information Processing Systems, pages 6294–6305, 2017.

[MCCD13] Tomas Mikolov, Kai Chen, Greg Corrado, and Jeffrey Dean. Efficient estimation of word representations in vector space. arXiv preprint arXiv:1301.3781, 2013.

[MCH+16] Nasrin Mostafazadeh, Nathanael Chambers, Xiaodong He, Devi Parikh, Dhruv Batra, Lucy Vanderwende, Pushmeet Kohli, and James Allen. A corpus and evaluation framework for deeper understanding of commonsense stories. arXiv preprint arXiv:1604.01696, 2016.

[MCKS18] Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. Can a suit of armor conduct electricity? a new dataset for open book question answering. ArXiv, abs/1809.02789, 2018.

[MKAT18] Sam McCandlish, Jared Kaplan, Dario Amodei, and OpenAI Dota Team. An empirical model of large-batch training, 2018.

[MKM+94] Mitchell Marcus, Grace Kim, Mary Ann Marcinkiewicz, Robert MacIntyre, Ann Bies, Mark Ferguson, Karen Katz, and Britta Schasberger. The penn treebank: annotating predicate argument structure. In Proceedings of the workshop on Human Language Technology, pages 114–119. Association for Computational Linguistics, 1994.

[MKXS18] Bryan McCann, Nitish Shirish Keskar, Caiming Xiong, and Richard Socher. The natural language decathlon: Multitask learning as question answering. arXiv preprint arXiv:1806.08730, 2018.

[MPL19] R Thomas McCoy, Ellie Pavlick, and Tal Linzen. Right for the wrong reasons: Diagnosing syntactic heuristics in natural language inference. arXiv preprint arXiv:1902.01007, 2019.

[MWZ+18] Margaret Mitchell, Simone Wu, Andrew Zaldivar, Parker Barnes, Lucy Vasserman, Ben Hutchinson, Elena Spitzer, Inioluwa Deborah Raji, and Timnit Gebru. Model cards for model reporting, 2018.

[NBR20] Moin Nadeem, Anna Bethke, and Siva Reddy. Stereoset: Measuring stereotypical bias in pretrained language models. arXiv preprint arXiv:2004.09456, 2020.

[NK19] Timothy Niven and Hung-Yu Kao. Probing neural network comprehension of natural language arguments. arXiv preprint arXiv:1907.07355, 2019.

[Nor09] Peter Norvig. Natural language corpus data, 2009.

[NvNvdG19] Malvina Nissim, Rik van Noord, and Rob van der Goot. Fair is better than sensational: Man is to doctor as woman is to doctor. arXiv preprint arXiv:1905.09866, 2019.

[NWD+19] Yixin Nie, Adina Williams, Emily Dinan, Mohit Bansal, Jason Weston, and Douwe Kiela. Adversarial nli: A new benchmark for natural language understanding. arXiv preprint arXiv:1910.14599, 2019.

[oR16] University of Regensburg. Fascha, 2016.

[PCC18] Mohammad Taher Pilehvar and Jose Camacho-Collados. WIC: 10,000 example pairs for evaluating context-sensitive representations. arXiv preprint arXiv:1808.09121, 2018.

[PFB18] Jason Phang, Thibault Fevry, and Samuel R. Bowman. Sentence encoders on STILTs: Supplementary ´ training on intermediate labeled-data tasks. arXiv preprint arXiv:1811.01088, 2018.

[PHR+18] Adam Poliak, Aparajita Haldar, Rachel Rudinger, J. Edward Hu, Ellie Pavlick, Aaron Steven White, and Benjamin Van Durme. Collecting diverse natural language inference problems for sentence representation evaluation. In Proceedings of EMNLP, 2018.

[PKL+16] Denis Paperno, German Kruszewski, Angeliki Lazaridou, Quan Ngoc Pham, Raffaella Bernardi, Sandro ´ Pezzelle, Marco Baroni, Gemma Boleda, and Raquel Fernandez. The lambada dataset: Word prediction ´ requiring a broad discourse context. arXiv preprint arXiv:1606.06031, 2016.

[PNZtY18] Matthew E. Peters, Mark Neumann, Luke Zettlemoyer, and Wen tau Yih. Dissecting contextual word embeddings: Architecture and representation, 2018.

[Pos18] Matt Post. A call for clarity in reporting BLEU scores. arXiv preprint arXiv:1804.08771, 2018.

<!-- page 73 of 75 -->

[PSM14] Jeffrey Pennington, Richard Socher, and Christopher Manning. GloVe: Global vectors for word representation. In Proceedings of the 2014 conference on empirical methods in natural language processing (EMNLP), 2014.

[QIA20] QIANXIN. Sa-net on albert (ensemble), April 2020.

[QMZH19] Yusu Qian, Urwa Muaz, Ben Zhang, and Jae Won Hyun. Reducing gender bias in word-level language models with a gender-equalizing loss function. arXiv preprint arXiv:1905.12801, 2019.

[RBG11] Melissa Roemmele, Cosmin Adrian Bejan, and Andrew S Gordon. Choice of plausible alternatives: An evaluation of commonsense causal reasoning. In 2011 AAAI Spring Symposium Series, 2011.

[RCM19] Siva Reddy, Danqi Chen, and Christopher D Manning. Coqa: A conversational question answering challenge. Transactions of the Association for Computational Linguistics, 7:249–266, 2019.

[RCP+17] Scott Reed, Yutian Chen, Thomas Paine, Aaron van den Oord, SM Eslami, Danilo Rezende, Oriol ¨ Vinyals, and Nando de Freitas. Few-shot autoregressive density estimation: Towards learning to learn distributions. arXiv preprint arXiv:1710.10304, 2017.

[RJL18] Pranav Rajpurkar, Robin Jia, and Percy Liang. Know what you don’t know: Unanswerable questions for squad. arXiv preprint arXiv:1806.03822, 2018.

[RL16] Sachin Ravi and Hugo Larochelle. Optimization as a model for few-shot learning. ICLR 2017 (oral), 2016.

[RLL+19] Qiu Ran, Yankai Lin, Peng Li, Jie Zhou, and Zhiyuan Liu. NumNet: Machine reading comprehension with numerical reasoning. In Proceedings of EMNLP, 2019.

[RNLVD18] Rachel Rudinger, Jason Naradowsky, Brian Leonard, and Benjamin Van Durme. Gender bias in coreference resolution. arXiv preprint arXiv:1804.09301, 2018.

[RNSS18] Alec Radford, Karthik Narasimhan, Tim Salimans, and Ilya Sutskever. Improving language understanding by generative pre-training, 2018.

[Ros12] R.S. Ross. Guide for conducting risk assessments. NIST Special Publication, 2012.

[RRBS19] Jonathan S. Rosenfeld, Amir Rosenfeld, Yonatan Belinkov, and Nir Shavit. A constructive prediction of the generalization error across scales, 2019.

[RRS20] Adam Roberts, Colin Raffel, and Noam Shazeer. How much knowledge can you pack into the parameters of a language model? arXiv preprint arXiv:2002.08910, 2020.

[RSR+19] Colin Raffel, Noam Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael Matena, Yanqi Zhou, Wei Li, and Peter J. Liu. Exploring the limits of transfer learning with a unified text-to-text transformer, 2019.

[RWC+19] Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, and Ilya Sutskever. Language models are unsupervised multitask learners, 2019.

[SBBC19] Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An adversarial winograd schema challenge at scale, 2019.

[SBC+19] Irene Solaiman, Miles Brundage, Jack Clark, Amanda Askell, Ariel Herbert-Voss, Jeff Wu, Alec Radford, Gretchen Krueger, Jong Wook Kim, Sarah Kreps, Miles McCain, Alex Newhouse, Jason Blazakis, Kris McGuffie, and Jasmine Wang. Release strategies and the social impacts of language models, 2019.

[SCNP19] Emily Sheng, Kai-Wei Chang, Premkumar Natarajan, and Nanyun Peng. The woman worked as a babysitter: On biases in language generation. arXiv preprint arXiv:1909.01326, 2019.

[SDCW19] Victor Sanh, Lysandre Debut, Julien Chaumond, and Thomas Wolf. DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter. arXiv preprint arXiv:1910.01108, 2019.

[SDSE19] Roy Schwartz, Jesse Dodge, Noah A. Smith, and Oren Etzioni. Green AI. CoRR, abs/1907.10597, 2019.

[SHB15] Rico Sennrich, Barry Haddow, and Alexandra Birch. Improving neural machine translation models with monolingual data. arXiv preprint arXiv:1511.06709, 2015.

<!-- page 74 of 75 -->

[SMM+17] Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton, and Jeff Dean. Outrageously large neural networks: The sparsely-gated mixture-of-experts layer. arXiv preprint arXiv:1701.06538, 2017.

[SPP+19] Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism, 2019.

[SS20] Timo Schick and Hinrich Schutze. Exploiting cloze questions for few-shot text classification and natural ¨ language inference. arXiv preprint arXiv:2001.07676, 2020.

[STQ+19] Kaitao Song, Xu Tan, Tao Qin, Jianfeng Lu, and Tie-Yan Liu. MASS: Masked sequence to sequence pre-training for language generation. arXiv preprint arXiv:1905.02450, 2019.

[TFR+17] Josh Tobin, Rachel Fong, Alex Ray, Jonas Schneider, Wojciech Zaremba, and Pieter Abbeel. Domain randomization for transferring deep neural networks from simulation to the real world. In 2017 IEEE/RSJ international conference on intelligent robots and systems (IROS), pages 23–30. IEEE, 2017.

[TL05] Peter D. Turney and Michael L. Littman. Corpus-based learning of analogies and semantic relations. CoRR, abs/cs/0508103, 2005.

[TL18] Trieu H. Trinh and Quoc V. Le. A simple method for commonsense reasoning. arXiv preprint arXiv:1806.02847, 2018.

[TLBS03] Peter D. Turney, Michael L. Littman, Jeffrey Bigham, and Victor Shnayder. Combining independent modules to solve multiple-choice synonym and analogy problems. CoRR, cs.CL/0309035, 2003.

[Tur20] Project Turing. Microsoft research blog, Feb 2020.

[VBL+16] Oriol Vinyals, Charles Blundell, Timothy Lillicrap, Daan Wierstra, et al. Matching Networks for One Shot Learning. In Advances in neural information processing systems, pages 3630–3638, 2016.

[VSP+17] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. In Advances in neural information processing systems, 2017.

[WPN+19] Alex Wang, Yada Pruksachatkun, Nikita Nangia, Amanpreet Singh, Julian Michael, Felix Hill, Omer Levy, and Samuel Bowman. Superglue: A stickier benchmark for general-purpose language understanding systems. In Advances in Neural Information Processing Systems, pages 3261–3275, 2019.

[WXH+18] Yiren Wang, Yingce Xia, Tianyu He, Fei Tian, Tao Qin, ChengXiang Zhai, and Tie-Yan Liu. Multi-agent dual learning. ICLR 2019, 2018.

[XDH+19] Qizhe Xie, Zihang Dai, Eduard Hovy, Minh-Thang Luong, and Quoc V. Le. Unsupervised data augmentation for consistency training, 2019.

[YdC+19] Dani Yogatama, Cyprien de Masson d’Autume, Jerome Connor, Tomas Kocisky, Mike Chrzanowski, Lingpeng Kong, Angeliki Lazaridou, Wang Ling, Lei Yu, Chris Dyer, et al. Learning and evaluating general linguistic intelligence. arXiv preprint arXiv:1901.11373, 2019.

[YDY+19] Zhilin Yang, Zihang Dai, Yiming Yang, Jaime Carbonell, Ruslan Salakhutdinov, and Quoc V. Le. XLNet: Generalized autoregressive pretraining for language understanding. arXiv preprint arXiv:1906.08237, 2019.

[ZHB+19] Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence? arXiv preprint arXiv:1905.07830, 2019.

[ZHR+19] Rowan Zellers, Ari Holtzman, Hannah Rashkin, Yonatan Bisk, Ali Farhadi, Franziska Roesner, and Yejin Choi. Defending against neural fake news. arXiv preprint arXiv:1905.12616, 2019.

[ZLL+18] Sheng Zhang, Xiaodong Liu, Jingjing Liu, Jianfeng Gao, Kevin Duh, and Benjamin Van Durme. ReCoRD: Bridging the gap between human and machine commonsense reading comprehension. arXiv preprint arXiv:1810.12885, 2018.

[ZSW+19a] Daniel M. Ziegler, Nisan Stiennon, Jeffrey Wu, Tom B. Brown, Alec Radford, Dario Amodei, Paul Christiano, and Geoffrey Irving. Fine-tuning language models from human preferences, 2019.

<!-- page 75 of 75 -->

[ZSW+19b] Daniel M. Ziegler, Nisan Stiennon, Jeffrey Wu, Tom B. Brown, Alec Radford, Dario Amodei, Paul Christiano, and Geoffrey Irving. Fine-tuning language models from human preferences. ArXiv, abs/1909.08593, 2019.
