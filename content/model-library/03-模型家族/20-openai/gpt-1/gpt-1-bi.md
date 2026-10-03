---
title: "GPT-1 · 对照译稿"
category: "模型库"
tags: ["OpenAI", "对照译稿"]
published: true
excerpt: "GPT-1 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
源文：Improving Language Understanding by Generative Pre-Training，Alec Radford，Karthik Narasimhan，Tim Salimans，Ilya Sutskever，OpenAI，12 页，3 张图（图 1 一张，图 2 左右两栏各一张）。源文没有印日期和 arXiv 编号，首页只标 「Preprint. Work in progress.」。英文段在前，中文意译紧跟。Abstract，Introduction，Conclusion，References 的节名不译，正文都附中文。单独的页码行已删去，跨页断开的半句已接回上一页。转 Markdown 时把起止 token 识别成 「(hsi, hei)」，把 3.3 节多选题拼接式里的分隔符 \$ 识别成 δ，这里按 PDF 文字层改回 ⟨s⟩，⟨e⟩ 和 \$。图 2 两栏的图片文件名和内容是反的：p07-chart.png 是左栏（迁移层数），p07-figure-2-left-... 是右栏（zero-shot 曲线）。

<!-- page 1 of 12 -->

# Improving Language Understanding by Generative Pre-Training（用生成式预训练提升语言理解）

**Alec Radford** OpenAI alec@openai.com

**Karthik Narasimhan** OpenAI karthikn@openai.com

**Tim Salimans** OpenAI tim@openai.com

**Ilya Sutskever** OpenAI ilyasu@openai.com

四位作者都来自 OpenAI: Alec Radford, Karthik Narasimhan, Tim Salimans, Ilya Sutskever。

## Abstract

Natural language understanding comprises a wide range of diverse tasks such as textual entailment, question answering, semantic similarity assessment, and document classification. Although large unlabeled text corpora are abundant, labeled data for learning these specific tasks is scarce, making it challenging for discriminatively trained models to perform adequately. We demonstrate that large gains on these tasks can be realized by generative pre-training of a language model on a diverse corpus of unlabeled text, followed by discriminative fine-tuning on each specific task. In contrast to previous approaches, we make use of task-aware input transformations during fine-tuning to achieve effective transfer while requiring minimal changes to the model architecture. We demonstrate the effectiveness of our approach on a wide range of benchmarks for natural language understanding. Our general task-agnostic model outperforms discriminatively trained models that use architectures specifically crafted for each task, significantly improving upon the state of the art in 9 out of the 12 tasks studied. For instance, we achieve absolute improvements of 8.9% on commonsense reasoning (Stories Cloze Test), 5.7% on question answering (RACE), and 1.5% on textual entailment (MultiNLI).

自然语言理解包含很多彼此不同的任务，例如文本蕴含，问答，语义相似度判断和文档分类。无标注的大规模文本语料很多，能用来学这些具体任务的标注数据却很少，判别式训练的模型因此很难做好。我们展示：先在多样的无标注文本上对语言模型做生成式预训练，再在每个具体任务上做判别式微调，就能在这些任务上拿到大幅提升。和以往做法不同，我们在微调时使用感知任务的输入变换，几乎不改模型架构就能有效迁移。我们在一系列自然语言理解基准上验证了这套方法。这个与任务无关的通用模型，胜过了为每个任务专门设计架构的判别式模型，在研究的 12 个任务中有 9 个显著刷新了 state of the art。例如常识推理（Stories Cloze Test）绝对提升 8.9%，问答（RACE）提升 5.7%，文本蕴含（MultiNLI）提升 1.5%。

> **想：** 既然叫 「task-agnostic」，微调时模型到底多了什么？
> 看第 4 页图 1 右栏：每个任务只在输入端换拼接格式（Start, Delim, Extract），输出端接一个 Linear。第 3 页 3.2 节末尾也写明新增参数只有 $W_y$ 和分隔 token 的嵌入，Transformer 主干一层不改。

## 1 Introduction

The ability to learn effectively from raw text is crucial to alleviating the dependence on supervised learning in natural language processing (NLP). Most deep learning methods require substantial amounts of manually labeled data, which restricts their applicability in many domains that suffer from a dearth of annotated resources [61]. In these situations, models that can leverage linguistic information from unlabeled data provide a valuable alternative to gathering more annotation, which can be time-consuming and expensive. Further, even in cases where considerable supervision is available, learning good representations in an unsupervised fashion can provide a significant performance boost. The most compelling evidence for this so far has been the extensive use of pre-trained word embeddings [10, 39, 42] to improve performance on a range of NLP tasks [8, 11, 26, 45].

能直接从原始文本里有效学习，是减轻 NLP 对监督学习依赖的关键。多数深度学习方法需要大量人工标注数据，这限制了它们在标注资源匮乏的领域里的用途 [61]。这种情况下，能从无标注数据中利用语言信息的模型，是收集更多标注之外的一条可行路，而标注往往又费时又贵。另外，即使监督信号相当充足，用无监督方式学到好的表示也能带来明显的性能提升。迄今最有力的证据，是预训练词向量 [10, 39, 42] 被广泛用来提升一系列 NLP 任务 [8, 11, 26, 45]。

Leveraging more than word-level information from unlabeled text, however, is challenging for two main reasons. First, it is unclear what type of optimization objectives are most effective at learning text representations that are useful for transfer. Recent research has looked at various objectives such as language modeling [44], machine translation [38], and discourse coherence [22], with each method outperforming the others on different tasks.<sup>1</sup> Second, there is no consensus on the most effective way to transfer these learned representations to the target task. Existing techniques involve a combination of making task-specific changes to the model architecture [43, 44], using intricate learning schemes [21] and adding auxiliary learning objectives [50]. These uncertainties have made it difficult to develop effective semi-supervised learning approaches for language processing.

但要从无标注文本中利用词级以上的信息，有两个主要难点。第一，什么样的优化目标最适合学出可迁移的文本表示，目前还不清楚。近期研究试过语言建模 [44]，机器翻译 [38]，篇章连贯性 [22] 等目标，每种方法都在不同任务上胜过其他方法。<sup>1</sup> 第二，怎样把学到的表示最有效地迁移到目标任务，也没有共识。现有技术是几种手段的组合：针对任务改模型架构 [43, 44]，用复杂的学习方案 [21]，加辅助学习目标 [50]。这些不确定因素让语言处理的半监督方法很难做好。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>https://gluebenchmark.com/leaderboard</span></small>

脚注 1: GLUE 排行榜网址。

Preprint. Work in progress.

预印本，工作仍在进行中。

<!-- page 2 of 12 -->

In this paper, we explore a semi-supervised approach for language understanding tasks using a combination of unsupervised pre-training and supervised fine-tuning. Our goal is to learn a universal representation that transfers with little adaptation to a wide range of tasks. We assume access to a large corpus of unlabeled text and several datasets with manually annotated training examples (target tasks). Our setup does not require these target tasks to be in the same domain as the unlabeled corpus. We employ a two-stage training procedure. First, we use a language modeling objective on the unlabeled data to learn the initial parameters of a neural network model. Subsequently, we adapt these parameters to a target task using the corresponding supervised objective.

本文探索一种面向语言理解任务的半监督方法：无监督预训练加监督微调。目标是学一个通用表示，只需少量适配就能迁移到各种任务。我们假设手上有一个大规模无标注语料，以及若干带人工标注训练样本的数据集（目标任务）。这套设定不要求目标任务和无标注语料属于同一领域。训练分两个阶段：先在无标注数据上用语言建模目标学出神经网络的初始参数；再用对应的监督目标把这些参数适配到目标任务。

For our model architecture, we use the Transformer [62], which has been shown to perform strongly on various tasks such as machine translation [62], document generation [34], and syntactic parsing [29]. This model choice provides us with a more structured memory for handling long-term dependencies in text, compared to alternatives like recurrent networks, resulting in robust transfer performance across diverse tasks. During transfer, we utilize task-specific input adaptations derived from traversal-style approaches [52], which process structured text input as a single contiguous sequence of tokens. As we demonstrate in our experiments, these adaptations enable us to fine-tune effectively with minimal changes to the architecture of the pre-trained model.

模型架构用 Transformer [62]。它已在机器翻译 [62]，文档生成 [34]，句法分析 [29] 等任务上表现很强。和循环网络等选择相比，这个架构为处理文本中的长程依赖提供了更有结构的记忆，因而在各种任务上迁移表现稳健。迁移时，我们借用 traversal-style 方法 [52] 做针对任务的输入适配：把结构化文本输入处理成一条连续的 token 序列。实验会说明，这些适配让我们几乎不改预训练模型的架构就能有效微调。

We evaluate our approach on four types of language understanding tasks – natural language inference, question answering, semantic similarity, and text classification. Our general task-agnostic model outperforms discriminatively trained models that employ architectures specifically crafted for each task, significantly improving upon the state of the art in 9 out of the 12 tasks studied. For instance, we achieve absolute improvements of 8.9% on commonsense reasoning (Stories Cloze Test) [40], 5.7% on question answering (RACE) [30], 1.5% on textual entailment (MultiNLI) [66] and 5.5% on the recently introduced GLUE multi-task benchmark [64]. We also analyzed zero-shot behaviors of the pre-trained model on four different settings and demonstrate that it acquires useful linguistic knowledge for downstream tasks.

我们在四类语言理解任务上评估：自然语言推理，问答，语义相似度，文本分类。这个与任务无关的通用模型胜过为每个任务专门设计架构的判别式模型，12 个任务中有 9 个显著刷新 state of the art。例如常识推理（Stories Cloze Test）[40] 绝对提升 8.9%，问答（RACE）[30] 5.7%，文本蕴含（MultiNLI）[66] 1.5%，新推出的 GLUE 多任务基准 [64] 5.5%。我们还在四种设定下分析了预训练模型的 zero-shot 行为，说明它学到了对下游任务有用的语言知识。

> **问：** GLUE 的 5.5% 和第 6 页正文，第 7 页表 4 对得上吗？
> 对不上。第 6 页正文和表 4 都印 72.8 对此前最好的 68.9 (Multi-task BiLSTM + ELMo + Attn)，差 3.9 个点；按相对涨幅算约 5.7%，也不是 5.5。表 4 的 GLUE 列里没有哪两个数相差 5.5。

## 2 Related Work（相关工作）

**Semi-supervised learning for NLP.** Our work broadly falls under the category of semi-supervised learning for natural language. This paradigm has attracted significant interest, with applications to tasks like sequence labeling [24, 33, 57] or text classification [41, 70]. The earliest approaches used unlabeled data to compute word-level or phrase-level statistics, which were then used as features in a supervised model [33]. Over the last few years, researchers have demonstrated the benefits of using word embeddings [11, 39, 42], which are trained on unlabeled corpora, to improve performance on a variety of tasks [8, 11, 26, 45]. These approaches, however, mainly transfer word-level information, whereas we aim to capture higher-level semantics.

**NLP 中的半监督学习。** 我们的工作大体属于自然语言的半监督学习。这一范式很受关注，已用于序列标注 [24, 33, 57] 和文本分类 [41, 70] 等任务。最早的做法用无标注数据统计词级或短语级特征，再交给监督模型使用 [33]。近几年，研究者展示了在无标注语料上训练的词向量 [11, 39, 42] 能提升多种任务 [8, 11, 26, 45]。但这些方法主要迁移词级信息，我们想抓住更高层的语义。

Recent approaches have investigated learning and utilizing more than word-level semantics from unlabeled data. Phrase-level or sentence-level embeddings, which can be trained using an unlabeled corpus, have been used to encode text into suitable vector representations for various target tasks [28, 32, 1, 36, 22, 12, 56, 31].

近期工作开始从无标注数据中学习并利用词级以上的语义。可以在无标注语料上训练的短语级或句子级向量，已被用来把文本编码成适合各种目标任务的向量表示 [28, 32, 1, 36, 22, 12, 56, 31]。

**Unsupervised pre-training.** Unsupervised pre-training is a special case of semi-supervised learning where the goal is to find a good initialization point instead of modifying the supervised learning objective. Early works explored the use of the technique in image classification [20, 49, 63] and regression tasks [3]. Subsequent research [15] demonstrated that pre-training acts as a regularization scheme, enabling better generalization in deep neural networks. In recent work, the method has been used to help train deep neural networks on various tasks like image classification [69], speech recognition [68], entity disambiguation [17] and machine translation [48].

**无监督预训练。** 无监督预训练是半监督学习的特例，目标是找一个好的初始化点，而不是修改监督学习目标。早期工作把它用在图像分类 [20, 49, 63] 和回归任务 [3] 上。后续研究 [15] 表明预训练起正则化作用，让深层神经网络泛化得更好。近期工作用它帮助训练图像分类 [69]，语音识别 [68]，实体消歧 [17] 和机器翻译 [48] 等任务上的深层网络。

The closest line of work to ours involves pre-training a neural network using a language modeling objective and then fine-tuning it on a target task with supervision. Dai et al. [13] and Howard and Ruder [21] follow this method to improve text classification. However, although the pre-training phase helps capture some linguistic information, their usage of LSTM models restricts their prediction ability to a short range. In contrast, our choice of transformer networks allows us to capture longerrange linguistic structure, as demonstrated in our experiments. Further, we also demonstrate the effectiveness of our model on a wider range of tasks including natural language inference, paraphrase detection and story completion. Other approaches [43, 44, 38] use hidden representations from a pre-trained language or machine translation model as auxiliary features while training a supervised model on the target task. This involves a substantial amount of new parameters for each separate target task, whereas we require minimal changes to our model architecture during transfer.

和我们最接近的一类工作，是先用语言建模目标预训练神经网络，再在目标任务上做监督微调。Dai et al. [13] 与 Howard and Ruder [21] 用这种方法改进文本分类。预训练阶段虽然能抓到一些语言信息，但他们用的是 LSTM，预测能力只覆盖较短的范围。我们选 Transformer 网络，能抓住更长程的语言结构，实验会说明这一点。此外，我们在更广的任务上验证了模型，包括自然语言推理，复述检测和故事补全。另一些方法 [43, 44, 38] 在目标任务上训练监督模型时，把预训练语言模型或机器翻译模型的隐藏表示当作辅助特征。这样每个目标任务都要新增大量参数，而我们迁移时几乎不改模型架构。

<!-- page 3 of 12 -->

**Auxiliary training objectives.** Adding auxiliary unsupervised training objectives is an alternative form of semi-supervised learning. Early work by Collobert and Weston [10] used a wide variety of auxiliary NLP tasks such as POS tagging, chunking, named entity recognition, and language modeling to improve semantic role labeling. More recently, Rei [50] added an auxiliary language modeling objective to their target task objective and demonstrated performance gains on sequence labeling tasks. Our experiments also use an auxiliary objective, but as we show, unsupervised pre-training already learns several linguistic aspects relevant to target tasks.

**辅助训练目标。** 加入辅助的无监督训练目标，是半监督学习的另一种形式。Collobert and Weston [10] 的早期工作用词性标注，组块分析，命名实体识别，语言建模等多种辅助 NLP 任务来改进语义角色标注。近期 Rei [50] 在目标任务的目标函数上加了辅助语言建模目标，在序列标注任务上取得提升。我们的实验也用了辅助目标，但后文会说明，无监督预训练本身已经学到了与目标任务相关的多种语言特性。

## 3 Framework（框架）

Our training procedure consists of two stages. The first stage is learning a high-capacity language model on a large corpus of text. This is followed by a fine-tuning stage, where we adapt the model to a discriminative task with labeled data.

训练分两个阶段。第一阶段在大规模文本语料上学一个高容量的语言模型；接着是微调阶段，用标注数据把模型适配到判别任务上。

## 3.1 Unsupervised pre-training（无监督预训练）

Given an unsupervised corpus of tokens $\mathcal { U } = \{ u _ { 1 } , \ldots , u _ { n } \}$ , we use a standard language modeling objective to maximize the following likelihood:

给定无标注的 token 语料 $\mathcal { U } = \{ u _ { 1 } , \ldots , u _ { n } \}$，我们用标准语言建模目标，最大化下面的似然：

$$
L _ {1} (\mathcal {U}) = \sum_ {i} \log P (u _ {i} | u _ {i - k}, \dots , u _ {i - 1}; \Theta)\tag{1}
$$

where k is the size of the context window, and the conditional probability $P$ is modeled using a neural network with parameters Θ. These parameters are trained using stochastic gradient descent [51].

其中 k 是上下文窗口大小，条件概率 $P$ 由参数为 Θ 的神经网络建模。这些参数用随机梯度下降 [51] 训练。

> **核对：** 式（1）的窗口 k 取多少？
> 本文没有单独印 k. 第 5 页 4.1 节只说预训练用 「contiguous sequences of 512 tokens」，所以一条序列里最靠后的 token 最多以前 511 个 token 为条件；式（2）下面的 $U = (u_{-k}, \ldots, u_{-1})$ 也没给 k 的数值。

In our experiments, we use a multi-layer Transformer decoder [34] for the language model, which is a variant of the transformer [62]. This model applies a multi-headed self-attention operation over the input context tokens followed by position-wise feedforward layers to produce an output distribution over target tokens:

实验中，语言模型用多层 Transformer decoder [34]，它是 Transformer [62] 的一个变体。模型先对输入的上下文 token 做多头自注意力，再接逐位置的前馈层，输出目标 token 上的分布：

$$
\left| \begin{array}{c} h _ {0} = U W _ {e} + W _ {p} \\ h _ {l} = \text {transformer\_block} (h _ {l - 1}) \forall i \in [ 1, n ] \\ P (u) = \text {softmax} (h _ {n} W _ {e} ^ {T}) \end{array} \right|\tag{2}
$$

where $U = ( u _ { - k } , \ldots , u _ { - 1 } )$ is the context vector of tokens, n is the number of layers, $W _ { e }$ is the token embedding matrix, and $W _ { p }$ is the position embedding matrix.

其中 $U = ( u _ { - k } , \ldots , u _ { - 1 } )$ 是上下文 token 向量，n 是层数，$W _ { e }$ 是 token 嵌入矩阵，$W _ { p }$ 是位置嵌入矩阵。

> **看表：** 式（2）第二行写 「∀i ∈ [1, n]」，下标却是 l；第三行输出层用的是 $W_e^T$。这两处是转写错还是原文如此？
> PDF 文字层同样是 「∀i ∈[1, n]」，是原文笔误，应读作对 l 从 1 到 n 逐层计算。第三行用 token 嵌入矩阵的转置做输出投影，等于输入嵌入和输出层共用同一个 $W_e$；本文正文没单独说这件事，只能从式（2）读出来。

## 3.2 Supervised fine-tuning（监督微调）

After training the model with the objective in Eq. 1, we adapt the parameters to the supervised target task. We assume a labeled dataset C, where each instance consists of a sequence of input tokens, $x ^ { 1 } , \ldots , x ^ { m }$ , along with a label y. The inputs are passed through our pre-trained model to obtain the final transformer block’s activation $h _ { l } ^ { m }$ , which is then fed into an added linear output layer with parameters $W _ { y }$ to predict $y ;$

用式 1 的目标训完模型后，我们把参数适配到监督目标任务上。假设有标注数据集 C，每个样本是一串输入 token $x ^ { 1 } , \ldots , x ^ { m }$ 加一个标签 y. 输入经过预训练模型，取最后一个 transformer block 的激活 $h _ { l } ^ { m }$，送进新加的线性输出层（参数为 $W _ { y }$）来给出 y:

$$
P (y | x ^ {1}, \dots , x ^ {m}) = \operatorname{softmax} (h _ {l} ^ {m} W _ {y}).\tag{3}
$$

This gives us the following objective to maximize:

由此得到要最大化的目标：

$$
L _ {2} (\mathcal {C}) = \sum_ {(x, y)} \log P (y | x ^ {1}, \ldots , x ^ {m}).\tag{4}
$$

We additionally found that including language modeling as an auxiliary objective to the fine-tuning helped learning by (a) improving generalization of the supervised model, and (b) accelerating convergence. This is in line with prior work [50, 43], who also observed improved performance with such an auxiliary objective. Specifically, we optimize the following objective (with weight λ):

我们还发现，微调时把语言建模作为辅助目标有助于学习：（a）提升监督模型的泛化，（b）加快收敛。这和前人工作 [50, 43] 一致，他们也观察到这种辅助目标能提升表现。具体来说，我们优化下面的目标（权重为 λ）：

$$
L _ {3} (\mathcal {C}) = L _ {2} (\mathcal {C}) + \lambda * L _ {1} (\mathcal {C})\tag{5}
$$

Overall, the only extra parameters we require during fine-tuning are $W _ { y }$ , and embeddings for delimiter tokens (described below in Section 3.3).

总体上，微调时唯一新增的参数是 $W _ { y }$ 和分隔 token 的嵌入（见下文 3.3 节）。

> **拆开：** 式（3）用 $h_l^m$ 表示 「最后一个 block」，式（2）里最后一层却叫 $h_n$。两个下标说的是同一层吗？
> 是同一层。按式（2）下面 「n is the number of layers」 的定义，最后一层应写 $h_n$；式（3）的 l 指最后一层，上标 m 指第 m 个也就是最后一个输入 token。第 4 页图 1 右栏把 Linear 接在 Extract 位置之后，和 「取序列末端 token 的最后一层输出」 这一读法一致。

> **确认：** 式（5）的辅助项写的是 $L_1(\mathcal{C})$，不是 $L_1(\mathcal{U})$。语言建模损失算在哪份数据上？
> 算在标注数据集 C 的输入文本上，不回到 BooksCorpus。权重 λ 在第 5 页 4.1 节 「Fine-tuning details」 给出，取 0.5；这一项到底帮不帮忙，要看第 8 页表 5 的 「Transformer w/o aux LM」 一行。

<!-- page 4 of 12 -->

![图 1 左：12 层 Transformer 结构，自下而上为文本与位置嵌入，带掩码的多头自注意力，残差相加后 Layer Norm，前馈层，残差相加后 Layer Norm，顶部分出 Text Prediction 和 Task Classifier 两个头。图 1 右：四类任务的输入变换。分类为 Start，Text，Extract；蕴含为 Start，Premise，Delim，Hypothesis，Extract；相似度把 Text 1 和 Text 2 两种顺序各过一遍 Transformer，相加后进 Linear；多选题把 Context 和每个 Answer 拼成一条，各自过 Transformer 和 Linear，再汇总成答案分布](images/p04-figure-1-left-transformer-architecture-and-training.png)

Figure 1: (left) Transformer architecture and training objectives used in this work. (right) Input transformations for fine-tuning on different tasks. We convert all structured inputs into token sequences to be processed by our pre-trained model, followed by a linear+softmax layer.

图 1:（左）本文使用的 Transformer 架构和训练目标。（右）在不同任务上微调时的输入变换。所有结构化输入都转成 token 序列，交给预训练模型处理，最后接 linear+softmax 层。

> **回看：** 图 1 左栏里 Layer Norm 放在残差相加之后，这和 「largely follows the original transformer work」 一致吗？
> 一致。图 1 左栏两处都是 「+」 在下，Layer Norm 在上，即先做残差相加再归一化。第 5 页 4.1 节列出的改动只有 decoder-only，GELU 和学出来的位置嵌入三项，没提把 Layer Norm 挪到子层之前。

## 3.3 Task-specific input transformations（针对任务的输入变换）

For some tasks, like text classification, we can directly fine-tune our model as described above. Certain other tasks, like question answering or textual entailment, have structured inputs such as ordered sentence pairs, or triplets of document, question, and answers. Since our pre-trained model was trained on contiguous sequences of text, we require some modifications to apply it to these tasks. Previous work proposed learning task specific architectures on top of transferred representations [44]. Such an approach re-introduces a significant amount of task-specific customization and does not use transfer learning for these additional architectural components. Instead, we use a traversal-style approach [52], where we convert structured inputs into an ordered sequence that our pre-trained model can process. These input transformations allow us to avoid making extensive changes to the architecture across tasks. We provide a brief description of these input transformations below and Figure 1 provides a visual illustration. All transformations include adding randomly initialized start and end tokens (⟨s⟩, ⟨e⟩).

有些任务，比如文本分类，可以按上面的方式直接微调。另一些任务，比如问答或文本蕴含，输入是结构化的，例如有序的句子对，或文档，问题，答案组成的三元组。预训练模型是在连续文本序列上训的，要用到这些任务上就得做些修改。前人工作提出在迁移来的表示之上学针对任务的架构 [44]。这种做法又引回大量针对任务的定制，而且这些额外的架构组件用不上迁移学习。我们改用 traversal-style 方法 [52]，把结构化输入转成预训练模型能处理的有序序列。有了这些输入变换，就不必在不同任务之间大改架构。下面简述这些变换，图 1 给出直观示意。所有变换都加入随机初始化的起止 token (⟨s⟩, ⟨e⟩).

> **停一下：** 正文说起止 token 是 ⟨s⟩ 和 ⟨e⟩，图 1 右栏写的却是 Start, Delim, Extract。名字对得上吗？
> 对得上。图 1 里 Start 对应 ⟨s⟩，Extract 对应 ⟨e⟩，Delim 是下一段说的分隔 token (\$)。叫 Extract，是因为分类头从这个位置取表示。3.2 节说新增参数只有 $W_y$ 和 「delimiter tokens」 的嵌入，按图 1 看应把这三个特殊 token 都算进去（推测）。

**Textual entailment.** For entailment tasks, we concatenate the premise p and hypothesis h token sequences, with a delimiter token (\$) in between.

**文本蕴含。** 蕴含任务把前提 p 和假设 h 的 token 序列拼起来，中间放一个分隔 token (\$).

**Similarity.** For similarity tasks, there is no inherent ordering of the two sentences being compared. To reflect this, we modify the input sequence to contain both possible sentence orderings (with a delimiter in between) and process each independently to produce two sequence representations $h _ { l } ^ { m }$ which are added element-wise before being fed into the linear output layer.

**相似度。** 相似度任务里，被比较的两句话没有固有顺序。为体现这一点，我们让输入包含两种句子顺序（中间放分隔符），各自独立处理，得到两个序列表示 $h _ { l } ^ { m }$，按元素相加后再送进线性输出层。

> **再看：** 为什么只有相似度任务要把两种顺序各算一遍，蕴含不用？
> 蕴含里前提和假设角色不同，顺序本身就带信息；相似度是对称关系，而模型是只看左侧上下文的 decoder，只喂一种顺序会让结果依赖哪句在前。图 1 右栏 Similarity 那一行正是两条序列各过一次 Transformer，在 「+」 处相加后进 Linear。

**Question Answering and Commonsense Reasoning.** For these tasks, we are given a context document z, a question q, and a set of possible answers $\{ a _ { k } \}$ . We concatenate the document context and question with each possible answer, adding a delimiter token in between to get $[ z ; q ; \$ ; a _ { k } ]$ . Each of these sequences are processed independently with our model and then normalized via a softmax layer to produce an output distribution over possible answers.

**问答与常识推理。** 这类任务给定上下文文档 z，问题 q 和一组候选答案 $\{ a _ { k } \}$。我们把文档上下文和问题分别与每个候选答案拼接，中间加分隔 token，得到 $[ z ; q ; \$ ; a _ { k } ]$。每条序列由模型独立处理，再经 softmax 层归一化，得到候选答案上的输出分布。

## 4 Experiments（实验）

## 4.1 Setup（实验设置）

**Unsupervised pre-training.** We use the BooksCorpus dataset [71] for training the language model. It contains over 7,000 unique unpublished books from a variety of genres including Adventure, Fantasy, and Romance. Crucially, it contains long stretches of contiguous text, which allows the generative model to learn to condition on long-range information. An alternative dataset, the 1B Word Benchmark, which is used by a similar approach, ELMo [44], is approximately the same size but is shuffled at a sentence level - destroying long-range structure. Our language model achieves a very low token level perplexity of 18.4 on this corpus.

**无监督预训练。** 语言模型在 BooksCorpus 数据集 [71] 上训练。它含 7,000 多本互不重复的未出版图书，类型包括冒险，奇幻，言情等。关键在于它有大段连续文本，生成式模型能借此学会以长程信息为条件。另一个可选数据集是 1B Word Benchmark，同类方法 ELMo [44] 用的就是它，规模和 BooksCorpus 差不多，但在句子级别打乱过，长程结构被破坏。我们的语言模型在这个语料上取得很低的 token 级困惑度 18.4。

> **对一下：** 18.4 的困惑度是在哪部分数据上算的，训练集还是留出集？
> 本文没说。第 5 页只写 「on this corpus」，没给留出比例，表 1 到表 5 也都不含这个数；又因为 token 是 BPE 子词，这个数不能和按词计的困惑度直接比。

<!-- page 5 of 12 -->

Table 1: A list of the different tasks and datasets used in our experiments.

表 1：实验中用到的各项任务和数据集。自然语言推理：SNLI，MultiNLI，Question NLI，RTE，SciTail；问答：RACE，Story Cloze；句子相似度：MSR Paraphrase Corpus，Quora Question Pairs，STS Benchmark；分类：Stanford Sentiment Treebank-2, CoLA。合计 12 个数据集。

| Task | Datasets |
| --- | --- |
| Natural language inference | SNLI [5], MultiNLI [66], Question NLI [64], RTE [4], SciTail [25] |
| Question Answering | RACE [30], Story Cloze [40] |
| Sentence similarity | MSR Paraphrase Corpus [14], Quora Question Pairs [9], STS Benchmark [6] |
| Classification | Stanford Sentiment Treebank-2 [54], CoLA [65] |

**Model specifications.** Our model largely follows the original transformer work [62]. We trained a 12-layer decoder-only transformer with masked self-attention heads (768 dimensional states and 12 attention heads). For the position-wise feed-forward networks, we used 3072 dimensional inner states. We used the Adam optimization scheme [27] with a max learning rate of 2.5e-4. The learning rate was increased linearly from zero over the first 2000 updates and annealed to 0 using a cosine schedule. We train for 100 epochs on minibatches of 64 randomly sampled, contiguous sequences of 512 tokens. Since layernorm [2] is used extensively throughout the model, a simple weight initialization of N(0, 0.02) was sufficient. We used a bytepair encoding (BPE) vocabulary with 40,000 merges [53] and residual, embedding, and attention dropouts with a rate of 0.1 for regularization. We also employed a modified version of L2 regularization proposed in [37], with w = 0.01 on all non bias or gain weights. For the activation function, we used the Gaussian Error Linear Unit (GELU) [18]. We used learned position embeddings instead of the sinusoidal version proposed in the original work. We use the ftfy library<sup>2</sup>to clean the raw text in BooksCorpus, standardize some punctuation and whitespace, and use the spaCy tokenizer.<sup>3</sup>

**模型规格。** 模型大体沿用原始 Transformer 工作 [62]。我们训练了一个 12 层的 decoder-only Transformer，自注意力头带掩码（状态维度 768, 12 个注意力头）。逐位置前馈网络的内层维度为 3072。优化器用 Adam [27]，最大学习率 2.5e-4；学习率在前 2000 次更新里从 0 线性升高，之后按余弦曲线退火到 0。每个 minibatch 是 64 条随机采样的连续 512 token 序列，训练 100 个 epoch。由于模型里大量使用 layernorm [2]，简单的 N(0, 0.02) 权重初始化就够用。词表用 40,000 次合并的字节对编码（BPE）[53]；正则化方面，残差，嵌入和注意力都加 0.1 的 dropout。我们还用了 [37] 提出的改版 L2 正则，对所有非 bias，非 gain 的权重取 w = 0.01。激活函数用高斯误差线性单元（GELU）[18]。位置嵌入是学出来的，不用原论文的正弦版本。我们用 ftfy 库<sup>2</sup> 清洗 BooksCorpus 原文，统一部分标点和空白，再用 spaCy 分词器<sup>3</sup> 切分。

> **想：** 这一段给了层数，宽度，头数，FFN 维度，却没印参数量。能从这些数推出来吗？
> 只能粗估。每层注意力 $4 \cdot 768^2$ 加 FFN $2 \cdot 768 \cdot 3072$，合 $12 \cdot 768^2 \approx 7.1$M，12 层约 85M；token 嵌入按 40,000 行算约 30.7M，位置嵌入 $512 \cdot 768 \approx 0.4$M，合计约 116M（未计 bias，LayerNorm 以及合并之外的基础符号）。本文正文和表 1 到表 5 都没有参数量这一栏。

> **问：** 预训练一共看了多少 token?
> 一个 minibatch 是 64 × 512 = 32,768 个 token。本文只给了 100 个 epoch，没给总更新步数，也没给 BooksCorpus 的 token 数。第 7 页图 2 右栏横轴画到 $10^6$ 次更新，若训练恰好到 $10^6$ 步，总量约 $3.3 \times 10^{10}$ token，每个 epoch 约 $3.3 \times 10^8$ token。这和 「与 1B Word Benchmark 规模相近」 差了几倍，仅凭本文印的数判断不了是图 2 横轴没画到训练结束，还是规模的说法很粗。

**Fine-tuning details.** Unless specified, we reuse the hyperparameter settings from unsupervised pre-training. We add dropout to the classifier with a rate of 0.1. For most tasks, we use a learning rate of 6.25e-5 and a batchsize of 32. Our model finetunes quickly and 3 epochs of training was sufficient for most cases. We use a linear learning rate decay schedule with warmup over 0.2% of training. λ was set to 0.5.

**微调细节。** 除非另有说明，微调沿用无监督预训练的超参。分类器加 0.1 的 dropout。多数任务的学习率为 6.25e-5，batch size 为 32。模型微调很快，多数情况下训 3 个 epoch 就够。学习率线性衰减，前 0.2% 的训练做 warmup. λ 设为 0.5。

> **核对：** 「warmup over 0.2% of training」 落到步数是多少？
> 取决于数据集大小，本文没给。拿第 7 页提到的两端算：STS-B 约 5.7k 训练样本，batch 32, 3 个 epoch 约 530 步，0.2% 只有约 1 步；SNLI 约 550k 样本约 51,600 步，warmup 约 100 步。小数据集上这个 warmup 几乎等于没有。

## 4.2 Supervised fine-tuning（监督微调）

We perform experiments on a variety of supervised tasks including natural language inference, question answering, semantic similarity, and text classification. Some of these tasks are available as part of the recently released GLUE multi-task benchmark [64], which we make use of. Figure 1 provides an overview of all the tasks and datasets.

我们在多种监督任务上做实验，包括自然语言推理，问答，语义相似度和文本分类。其中一部分任务收在新发布的 GLUE 多任务基准 [64] 里，我们也直接用了它。图 1 概览了全部任务和数据集。

> **看表：** 「Figure 1 provides an overview of all the tasks and datasets」，可图 1 画的是架构和输入变换。任务清单在哪？
> 在第 5 页表 1。图 1 只画了四种输入格式，没有列任何数据集名；这句应是把 Table 1 误写成了 Figure 1。

**Natural Language Inference.** The task of natural language inference (NLI), also known as recognizing textual entailment, involves reading a pair of sentences and judging the relationship between them from one of entailment, contradiction or neutral. Although there has been a lot of recent interest [58, 35, 44], the task remains challenging due to the presence of a wide variety of phenomena like lexical entailment, coreference, and lexical and syntactic ambiguity. We evaluate on five datasets with diverse sources, including image captions (SNLI), transcribed speech, popular fiction, and government reports (MNLI), Wikipedia articles (QNLI), science exams (SciTail) or news articles (RTE).

**自然语言推理。** 自然语言推理（NLI）也叫识别文本蕴含：读一对句子，判断它们的关系属于蕴含，矛盾还是中立。近来关注很多 [58, 35, 44]，但这项任务涉及词汇蕴含，共指，词汇与句法歧义等各种现象，仍然很难。我们在五个来源各异的数据集上评估：图像描述（SNLI），转写语音，通俗小说和政府报告（MNLI），维基百科文章（QNLI），科学考试（SciTail），新闻文章（RTE）。

Table 2 details various results on the different NLI tasks for our model and previous state-of-the-art approaches. Our method significantly outperforms the baselines on four of the five datasets, achieving absolute improvements of upto 1.5% on MNLI, 5% on SciTail, 5.8% on QNLI and 0.6% on SNLI over the previous best results. This demonstrates our model’s ability to better reason over multiple sentences, and handle aspects of linguistic ambiguity. On RTE, one of the smaller datasets we evaluate on (2490 examples), we achieve an accuracy of 56%, which is below the 61.7% reported by a multi-task biLSTM model. Given the strong performance of our approach on larger NLI datasets, it is likely our model will benefit from multi-task training as well but we have not explored this currently.

表 2 列出本文模型和此前 state-of-the-art 方法在各 NLI 任务上的结果。五个数据集里有四个我们明显胜过基线，相对此前最好结果的绝对提升是：MNLI 最多 1.5%, SciTail 5%, QNLI 5.8%, SNLI 0.6%。这说明模型更擅长跨多个句子推理，也更能处理语言歧义。在我们评估的较小数据集之一 RTE（2490 个样本）上，准确率为 56%，低于多任务 biLSTM 模型报告的 61.7%。考虑到本方法在更大的 NLI 数据集上表现很强，多任务训练很可能也会让模型受益，但目前还没做这方面的探索。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://ftfy.readthedocs.io/en/latest/](https://ftfy.readthedocs.io/en/latest/)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>[https://spacy.io/](https://spacy.io/)</span></small>

脚注 2: ftfy 文档地址。脚注 3: spaCy 官网。

<!-- page 6 of 12 -->

Table 2: Experimental results on natural language inference tasks, comparing our model with current state-of-the-art methods. 5x indicates an ensemble of 5 models. All datasets use accuracy as the evaluation metric.

表 2：自然语言推理任务上的实验结果，本文模型对比当时的 state-of-the-art 方法。5x 表示 5 个模型的集成。所有数据集都以准确率为指标。

| Method | MNLI-m | MNLI-mm | SNLI | SciTail | QNLI | RTE |
| --- | --- | --- | --- | --- | --- | --- |
| ESIM + ELMo [44] (5x) | - | - | 89.3 | - | - | - |
| CAFE [58] (5x) | 80.2 | 79.0 | 89.3 | - | - | - |
| Stochastic Answer Network [35] (3x) | 80.6 | 80.1 | - | - | - | - |
| CAFE [58] | 78.7 | 77.9 | 88.5 | 83.3 |  |  |
| GenSen [64] | 71.4 | 71.3 | - | - | 82.3 | 59.2 |
| Multi-task BiLSTM + Attn [64] | 72.2 | 72.1 | - | - | 82.1 | 61.7 |
| Finetuned Transformer LM (ours) | 82.1 | 81.4 | 89.9 | 88.3 | 88.1 | 56.0 |

> **拆开：** 摘要里 MultiNLI 的 1.5% 是和谁比的？
> 和表 2 的 Stochastic Answer Network (3x) 比：MNLI-m 82.1 对 80.6。这是 3 个模型的集成；和单模型 CAFE 的 78.7 比，差 3.4 个点。MNLI-mm 上 81.4 对 80.1，只高 1.3 个点。

> **确认：** RTE 上本文 56.0，输给 GenSen 的 59.2 和多任务 BiLSTM 的 61.7。这算在 「9 out of 12」 没赢的那一边吗？
> 算。12 个数据集就是表 1 列的 12 个；逐个对表 2 到表 4，没赢的是 RTE, SST-2（表 4: 91.3 对 93.2）和 MRPC（表 4: 82.3 对 86.0），其余 9 个都是本文最高。

Table 3: Results on question answering and commonsense reasoning, comparing our model with current state-of-the-art methods.. 9x means an ensemble of 9 models.

表 3：问答与常识推理结果，本文模型对比当时的 state-of-the-art 方法。9x 表示 9 个模型的集成。

| Method | Story Cloze | RACE-m | RACE-h | RACE |
| --- | --- | --- | --- | --- |
| val-LS-skip [55] | 76.5 | - | - | - |
| Hidden Coherence Model [7] | 77.6 | - | - | - |
| Dynamic Fusion Net [67] (9x) | - | 55.6 | 49.4 | 51.2 |
| BiAttention MRU [59] (9x) | - | 60.2 | 50.3 | 53.3 |
| Finetuned Transformer LM (ours) | 86.5 | 62.9 | 57.4 | 59.0 |

> **回看：** RACE 总分 59.0 夹在 RACE-m 62.9 和 RACE-h 57.4 之间，更靠近 RACE-h. 能反推两部分的题量比吗？
> 若总分按题数加权，本文一行算出 RACE-h 占比约（62.9 − 59.0）/ (62.9 − 57.4) ≈ 71%；表 3 的 Dynamic Fusion Net 一行约 71%，BiAttention MRU 一行约 70%。三行大体一致，说明 RACE 总分主要由高中题决定；表 3 本身没印题数。

**Question answering and commonsense reasoning.** Another task that requires aspects of single and multi-sentence reasoning is question answering. We use the recently released RACE dataset [30], consisting of English passages with associated questions from middle and high school exams. This corpus has been shown to contain more reasoning type questions that other datasets like CNN [19] or SQuaD [47], providing the perfect evaluation for our model which is trained to handle long-range contexts. In addition, we evaluate on the Story Cloze Test [40], which involves selecting the correct ending to multi-sentence stories from two options. On these tasks, our model again outperforms the previous best results by significant margins - up to 8.9% on Story Cloze, and 5.7% overall on RACE. This demonstrates the ability of our model to handle long-range contexts effectively.

**问答与常识推理。** 另一类需要单句和多句推理的任务是问答。我们用新发布的 RACE 数据集 [30]，它由英文文章和配套问题组成，题目来自初中和高中考试。已有研究表明，这个语料比 CNN [19] 或 SQuaD [47] 等数据集含有更多推理型问题，正好用来评估我们这个为处理长程上下文而训练的模型。此外我们还评估 Story Cloze Test [40]: 给一个多句故事，从两个选项里选出正确的结尾。在这些任务上，模型再次大幅超过此前最好结果：Story Cloze 最多高 8.9%，RACE 总分高 5.7%。这说明模型能有效处理长程上下文。

> **停一下：** Story Cloze 的 8.9% 和 RACE 的 5.7% 各对哪一行？
> 表 3: Story Cloze 86.5 对 Hidden Coherence Model 的 77.6，差 8.9；RACE 59.0 对 BiAttention MRU (9x) 的 53.3，差 5.7。两个都是百分点。分开看，RACE-h 上 57.4 对 50.3 差 7.1，RACE-m 上 62.9 对 60.2 只差 2.7。

**Semantic Similarity.** Semantic similarity (or paraphrase detection) tasks involve predicting whether two sentences are semantically equivalent or not. The challenges lie in recognizing rephrasing of concepts, understanding negation, and handling syntactic ambiguity. We use three datasets for this task – the Microsoft Paraphrase corpus (MRPC) [14] (collected from news sources), the Quora Question Pairs (QQP) dataset [9], and the Semantic Textual Similarity benchmark (STS-B) [6]. We obtain state-of-the-art results on two of the three semantic similarity tasks (Table 4) with a 1 point absolute gain on STS-B. The performance delta on QQP is significant, with a 4.2% absolute improvement over Single-task BiLSTM + ELMo + Attn.

**语义相似度。** 语义相似度（也叫复述检测）任务要判断两句话在语义上是否等价。难点在于识别概念的改写，理解否定，处理句法歧义。我们用三个数据集：微软复述语料 MRPC [14]（取自新闻），Quora Question Pairs (QQP) [9]，以及语义文本相似度基准 STS-B [6]。三个语义相似度任务里有两个取得 state-of-the-art（表 4），其中 STS-B 绝对提升 1 个点。QQP 上的差距很明显，比 Single-task BiLSTM + ELMo + Attn 绝对高 4.2%。

**Classification.** Finally, we also evaluate on two different text classification tasks. The Corpus of Linguistic Acceptability (CoLA) [65] contains expert judgements on whether a sentence is grammatical or not, and tests the innate linguistic bias of trained models. The Stanford Sentiment Treebank (SST-2) [54], on the other hand, is a standard binary classification task. Our model obtains an score of 45.4 on CoLA, which is an especially big jump over the previous best result of 35.0, showcasing the innate linguistic bias learned by our model. The model also achieves 91.3% accuracy on SST-2, which is competitive with the state-of-the-art results. We also achieve an overall score of 72.8 on the GLUE benchmark, which is significantly better than the previous best of 68.9.

**分类。** 最后，我们还在两个文本分类任务上评估。语言可接受性语料 CoLA [65] 由专家判断句子是否合乎语法，考察训练后模型的内在语言偏置。斯坦福情感树库 SST-2 [54] 则是标准的二分类任务。我们的模型在 CoLA 上得 45.4 分，比此前最好的 35.0 高出一大截，体现了模型学到的内在语言偏置。模型在 SST-2 上准确率 91.3%，与 state-of-the-art 相当。GLUE 基准总分 72.8，明显好于此前最好的 68.9。

<!-- page 7 of 12 -->

Table 4: Semantic similarity and classification results, comparing our model with current state-of-the-art methods. All task evaluations in this table were done using the GLUE benchmark. (mc= Mathews correlation, acc=Accuracy, pc=Pearson correlation)

表 4：语义相似度与分类结果，本文模型对比当时的 state-of-the-art 方法。表中所有任务都用 GLUE 基准评估。（mc = Matthews 相关系数，acc = 准确率，pc = Pearson 相关系数）

<table><tr><td rowspan="2">Method</td><td colspan="2">Classification</td><td colspan="3">Semantic Similarity</td><td rowspan="2">GLUE</td></tr><tr><td>CoLA (mc)</td><td>SST2 (acc)</td><td>MRPC (F1)</td><td>STSB (pc)</td><td>QQP (F1)</td></tr><tr><td>Sparse byte mLSTM [16]</td><td>-</td><td>93.2</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>TF-KLD [23]</td><td>-</td><td>-</td><td>86.0</td><td>-</td><td>-</td><td>-</td></tr><tr><td>ECNU (mixed ensemble) [60]</td><td>-</td><td>-</td><td>-</td><td>81.0</td><td>-</td><td>-</td></tr><tr><td>Single-task BiLSTM + ELMo + Attn [64]</td><td>35.0</td><td>90.2</td><td>80.2</td><td>55.5</td><td>66.1</td><td>64.8</td></tr><tr><td>Multi-task BiLSTM + ELMo + Attn [64]</td><td>18.9</td><td>91.6</td><td>83.5</td><td>72.8</td><td>63.3</td><td>68.9</td></tr><tr><td>Finetuned Transformer LM (ours)</td><td>45.4</td><td>91.3</td><td>82.3</td><td>82.0</td><td>70.3</td><td>72.8</td></tr></table>

> **再看：** QQP 的 4.2% 为什么拿 Single-task 比，不拿 Multi-task?
> 因为 QQP 上此前最好的就是 Single-task 那一行：表 4 里 66.1 高于 Multi-task 的 63.3. 70.3 − 66.1 = 4.2；若对 Multi-task，差距是 7.0。

> **对一下：** STS-B 的 「1 point absolute gain」 是对哪一行？
> 对表 4 的 ECNU (mixed ensemble): 82.0 对 81.0。那是混合集成模型，本文是单模型。对 GLUE 基线里 STS-B 最好的 Multi-task BiLSTM + ELMo + Attn (72.8)，差距是 9.2。

> **想：** SST-2 说 「competitive with the state-of-the-art」，实际差多少？
> 表 4: Sparse byte mLSTM 93.2，本文 91.3，低 1.9 个点；比 Multi-task BiLSTM + ELMo + Attn 的 91.6 也低 0.3. SST-2 和 MRPC（82.3 对 TF-KLD 的 86.0）一起，算在 12 个数据集里没赢的 3 个当中。

Overall, our approach achieves new state-of-the-art results in 9 out of the 12 datasets we evaluate on, outperforming ensembles in many cases. Our results also indicate that our approach works well across datasets of different sizes, from smaller datasets such as STS-B (≈5.7k training examples) – to the largest one – SNLI (≈550k training examples).

总体而言，我们的方法在评估的 12 个数据集中有 9 个取得新的 state-of-the-art，很多时候胜过集成模型。结果也表明，方法在不同规模的数据集上都表现良好，从较小的 STS-B（约 5.7k 训练样本）到最大的 SNLI（约 550k 训练样本）。

## 5 Analysis（分析）

**Impact of number of layers transferred.** We observed the impact of transferring a variable number of layers from unsupervised pre-training to the supervised target task. Figure 2(left) illustrates the performance of our approach on MultiNLI and RACE as a function of the number of layers transferred. We observe the standard result that transferring embeddings improves performance and that each transformer layer provides further benefits up to 9% for full transfer on MultiNLI. This indicates that each layer in the pre-trained model contains useful functionality for solving target tasks.

**迁移层数的影响。** 我们考察了把无监督预训练中不同数量的层迁移到监督目标任务上的效果。图 2（左）画出本方法在 MultiNLI 和 RACE 上的表现随迁移层数的变化。我们看到了常见结论：迁移嵌入能提升表现；每多迁移一个 transformer 层都会带来进一步收益，在 MultiNLI 上全部迁移时收益最多达 9%。这说明预训练模型的每一层都含有对解决目标任务有用的功能。

![图 2 左：横轴为迁移层数 0 到 12，左纵轴为 RACE 验证集准确率，右纵轴为 MultiNLI matched 验证集准确率；实线为验证集，虚线为训练集。RACE 验证集从约 40 升到约 60，MultiNLI 验证集从约 72 升到约 82，两条训练集虚线在迁移 12 层时分别接近 92 和 97](images/p07-chart.png)

![图 2 右：横轴为预训练更新次数，对数刻度 10^3 到 10^6，纵轴为相对任务表现 0 到 1；实线为 Transformer，虚线为 LSTM，四个任务是情感分析，Winograd 指代消解，语言可接受性和问答。训练末端 Transformer 四条线约为 0.68, 0.55, 0.43, 0.25，LSTM 普遍更低，问答一项的 LSTM 始终贴近 0](images/p07-figure-2-left-effect-of-transferring-increasing-number.png)

Figure 2: (left) Effect of transferring increasing number of layers from the pre-trained language model on RACE and MultiNLI. (right) Plot showing the evolution of zero-shot performance on different tasks as a function of LM pre-training updates. Performance per task is normalized between a random guess baseline and the current state-of-the-art with a single model.

图 2:（左）从预训练语言模型迁移的层数逐渐增加时，对 RACE 和 MultiNLI 的影响。（右）不同任务的 zero-shot 表现随语言模型预训练更新次数的变化。每个任务的表现都归一化到随机猜测基线与当前单模型 state-of-the-art 之间。

> **问：** 「up to 9% for full transfer on MultiNLI」 在图上怎么读？
> 看图 2 左栏橙色实线：迁移 0 层约 72，全部迁移约 82，目测差 9 到 10 个点。RACE 蓝色实线从约 40 到约 60，涨了约 20 个点，比 MultiNLI 还多，正文却只报了 MultiNLI 这一个数（都是目测估算）。横轴 0 到 12 共 13 个点，本文没说嵌入层算不算其中一格。

> **核对：** 图 2 左栏迁移 12 层时 RACE 验证集约 60，表 3 印的 RACE 是 59.0。两个数该一样吗？
> 不必一样。图 2 左栏纵轴写的是 Dev Accuracy，表 3 没注明 dev 还是 test；按惯例表 3 应是测试集，差 1 个点左右说得通。同理，图 2 左栏 MultiNLI 验证集末端约 82，和表 2 的 MNLI-m 82.1 也只是接近，不是同一个数。

**Zero-shot Behaviors.** We’d like to better understand why language model pre-training of transformers is effective. A hypothesis is that the underlying generative model learns to perform many of the tasks we evaluate on in order to improve its language modeling capability and that the more structured attentional memory of the transformer assists in transfer compared to LSTMs. We designed a series of heuristic solutions that use the underlying generative model to perform tasks without supervised finetuning. We visualize the effectiveness of these heuristic solutions over the course of generative pre-training in Fig 2(right). We observe the performance of these heuristics is stable and steadily increases over training suggesting that generative pretraining supports the learning of a wide variety of task relevant functionality. We also observe the LSTM exhibits higher variance in its zero-shot performance suggesting that the inductive bias of the Transformer architecture assists in transfer.

**Zero-shot 行为。** 我们想进一步弄清 Transformer 的语言模型预训练为什么有效。一个假设是：底层生成式模型为了提升语言建模能力，学会了执行我们评估的许多任务；而且和 LSTM 相比，Transformer 更有结构的注意力记忆有助于迁移。我们设计了一系列启发式办法，在不做监督微调的情况下，用底层生成式模型直接执行任务。图 2（右）画出这些启发式办法在生成式预训练过程中的效果。可以看到它们表现稳定，并随训练稳步上升，说明生成式预训练支撑了多种任务相关功能的学习。我们还观察到 LSTM 的 zero-shot 表现方差更大，说明 Transformer 架构的归纳偏置有助于迁移。

<!-- page 8 of 12 -->

Table 5: Analysis of various model ablations on different tasks. Avg. score is a unweighted average of all the results. (mc= Mathews correlation, acc=Accuracy, pc=Pearson correlation)

表 5：各种模型消融在不同任务上的分析。Avg. score 是所有结果的不加权平均。（mc = Matthews 相关系数，acc = 准确率，pc = Pearson 相关系数）

<table><tbody><tr><td rowspan="2">Method</td><td rowspan="2">Avg. Score</td><td rowspan="2">CoLA (mc)</td><td rowspan="2">SST2(acc)</td><td rowspan="2">MRPC(F1)</td><td rowspan="2">STSB (pc)</td><td rowspan="2">QQP(F1)</td><td rowspan="2">MNLI (acc)</td><td rowspan="2">QNLI (acc)</td><td rowspan="2">RTE (acc)</td></tr><tr></tr><tr><td>Transformer w/ aux LM (full)</td><td>74.7</td><td>45.4</td><td>91.3</td><td>82.3</td><td>82.0</td><td>70.3</td><td>81.8</td><td>88.1</td><td>56.0</td></tr><tr><td>Transformer w/o pre-training</td><td>59.9</td><td>18.9</td><td>84.0</td><td>79.4</td><td>30.9</td><td>65.5</td><td>75.7</td><td>71.2</td><td>53.8</td></tr><tr><td>Transformer w/o aux LM</td><td>75.0</td><td>47.9</td><td>92.0</td><td>84.9</td><td>83.2</td><td>69.8</td><td>81.1</td><td>86.9</td><td>54.4</td></tr><tr><td>LSTM w/ aux LM</td><td>69.1</td><td>30.3</td><td>90.5</td><td>83.2</td><td>71.8</td><td>68.1</td><td>73.7</td><td>81.1</td><td>54.6</td></tr></tbody></table>

> **看表：** 表 5 的 MNLI 写 81.8，表 2 的 MNLI-m 和 MNLI-mm 是 82.1 和 81.4. 81.8 从哪来？
> 表 5 没说明。82.1 和 81.4 的平均是 81.75，四舍五入正好 81.8，很可能取的是 matched 与 mismatched 的平均。full 一行其余七列（CoLA 45.4, SST2 91.3, MRPC 82.3, STSB 82.0, QQP 70.3, QNLI 88.1, RTE 56.0）和表 2，表 4 完全一致。

> **拆开：** Avg. Score 能从各列复算出来吗？
> 大体能。按表 5 的 8 列不加权平均复算：full 74.65, w/o pre-training 59.93, w/o aux LM 75.03, LSTM 69.16。前三行四舍五入后和表 5 的 74.7, 59.9, 75.0 一致；LSTM 一行复算得 69.2，表 5 印 69.1，差 0.1。

For CoLA (linguistic acceptability), examples are scored as the average token log-probability the generative model assigns and predictions are made by thresholding. For SST-2 (sentiment analysis), we append the token very to each example and restrict the language model’s output distribution to only the words positive and negative and guess the token it assigns higher probability to as the prediction. For RACE (question answering), we pick the answer the generative model assigns the highest average token log-probability when conditioned on the document and question. For DPRD [46] (winograd schemas), we replace the definite pronoun with the two possible referrents and predict the resolution that the generative model assigns higher average token log-probability to the rest of the sequence after the substitution.

CoLA（语言可接受性）：用生成式模型给样本的平均 token 对数概率打分，再按阈值判定。SST-2（情感分析）：在每个样本后接上 token 「very」，把语言模型的输出分布限制在 positive 和 negative 两个词上，取概率更高的那个作为结果。RACE（问答）：以文档和问题为条件，选生成式模型给出平均 token 对数概率最高的答案。DPRD [46] (Winograd schema)：把句中的定指代词分别换成两个可能的指代对象，看替换后生成式模型给剩余序列的平均 token 对数概率哪个更高，就选哪个作为指代结果。

> **确认：** 图 2 右栏纵轴是 「Relative Task Performance」，情感分析的 0.68 换成准确率是多少？
> 换不回去。图 2 图注只说每个任务归一化到随机猜测（0）和当时单模型 state-of-the-art (1) 之间，本文既没印各任务 zero-shot 的原始分数，也没说作上限的 SOTA 是哪个数。只能说情感分析的 zero-shot 走完了随机到 SOTA 之间约三分之二的距离（读图）。

**Ablation studies.** We perform three different ablation studies (Table 5). First, we examine the performance of our method without the auxiliary LM objective during fine-tuning. We observe that the auxiliary objective helps on the NLI tasks and QQP. Overall, the trend suggests that larger datasets benefit from the auxiliary objective but smaller datasets do not. Second, we analyze the effect of the Transformer by comparing it with a single layer 2048 unit LSTM using the same framework. We observe a 5.6 average score drop when using the LSTM instead of the Transformer. The LSTM only outperforms the Transformer on one dataset – MRPC. Finally, we also compare with our transformer architecture directly trained on supervised target tasks, without pre-training. We observe that the lack of pre-training hurts performance across all the tasks, resulting in a 14.8% decrease compared to our full model.

**消融实验。** 我们做了三组消融（表 5）。第一，考察微调时去掉辅助 LM 目标的效果。辅助目标在 NLI 任务和 QQP 上有帮助。总体趋势是大数据集能从辅助目标获益，小数据集不能。第二，把 Transformer 换成同一框架下的单层 2048 单元 LSTM，考察 Transformer 的作用。换成 LSTM 后平均分下降 5.6. LSTM 只在一个数据集 MRPC 上胜过 Transformer。最后，我们还比较了不做预训练，直接在监督目标任务上训练同一 Transformer 架构的结果。缺少预训练在所有任务上都损害表现，比完整模型下降 14.8%。

> **回看：** 表 5 里 w/o aux LM 的平均分 75.0 反而高于 full 的 74.7。辅助目标到底加不加？
> 只看平均分，不加更好：去掉辅助目标后 CoLA，SST2，MRPC，STSB 四项上升，MNLI，QNLI，RTE，QQP 四项下降。「大数据集受益，小数据集不受益」 也有例外：RTE 只有 2490 个样本（第 5 页），去掉辅助目标却从 56.0 掉到 54.4。表 2 到表 4 的主结果用的是带辅助目标的 full 版本。

> **停一下：** 「resulting in a 14.8% decrease」 是百分点还是相对降幅？
> 表 5 平均分 74.7 − 59.9 = 14.8，是百分点；相对降幅约 19.8%。单项里 STSB 从 82.0 掉到 30.9，掉得最多；RTE 从 56.0 到 53.8，掉得最少。

> **再看：** LSTM 基线是单层 2048 单元，它和 12 层 Transformer 规模接近吗？
> 本文没给 LSTM 的参数量和输入维度，表 5 只列了名字。若输入按 768 维粗算，单层 LSTM 的门控权重约 4 × 2048 × (768 + 2048) ≈ 23M，远小于前面估的 Transformer 主干约 85M. 所以表 5 里 5.6 的平均分差距，混着架构和规模两种因素。

## 6 Conclusion

We introduced a framework for achieving strong natural language understanding with a single task-agnostic model through generative pre-training and discriminative fine-tuning. By pre-training on a diverse corpus with long stretches of contiguous text our model acquires significant world knowledge and ability to process long-range dependencies which are then successfully transferred to solving discriminative tasks such as question answering, semantic similarity assessment, entailment determination, and text classification, improving the state of the art on 9 of the 12 datasets we study. Using unsupervised (pre-)training to boost performance on discriminative tasks has long been an important goal of Machine Learning research. Our work suggests that achieving significant performance gains is indeed possible, and offers hints as to what models (Transformers) and data sets (text with long range dependencies) work best with this approach. We hope that this will help enable new research into unsupervised learning, for both natural language understanding and other domains, further improving our understanding of how and when unsupervised learning works.

我们提出一个框架：通过生成式预训练和判别式微调，用单个与任务无关的模型实现很强的自然语言理解。在含大段连续文本的多样语料上预训练后，模型获得了大量世界知识和处理长程依赖的能力，并成功迁移到问答，语义相似度判断，蕴含判断和文本分类等判别任务上，在研究的 12 个数据集中有 9 个刷新了 state of the art。用无监督（预）训练提升判别任务的表现，一直是机器学习研究的重要目标。我们的工作表明这确实能带来显著收益，也提示了哪些模型（Transformer）和数据集（带长程依赖的文本）最适合这种方法。希望这能推动无监督学习的新研究，无论在自然语言理解还是其他领域，进一步加深对无监督学习如何以及何时起作用的理解。

## References

[1] S. Arora, Y. Liang, and T. Ma. A simple but tough-to-beat baseline for sentence embeddings. 2016.

参考文献 [1] 原文照录，下同。

<!-- page 9 of 12 -->

[2] J. L. Ba, J. R. Kiros, and G. E. Hinton. Layer normalization. arXiv preprint arXiv:1607.06450, 2016.

[3] Y. Bengio, P. Lamblin, D. Popovici, and H. Larochelle. Greedy layer-wise training of deep networks. In Advances in neural information processing systems, pages 153–160, 2007.

[4] L. Bentivogli, P. Clark, I. Dagan, and D. Giampiccolo. The fifth pascal recognizing textual entailment challenge. In TAC, 2009.

[5] S. R. Bowman, G. Angeli, C. Potts, and C. D. Manning. A large annotated corpus for learning natural language inference. EMNLP, 2015.

[6] D. Cer, M. Diab, E. Agirre, I. Lopez-Gazpio, and L. Specia. Semeval-2017 task 1: Semantic textual similarity-multilingual and cross-lingual focused evaluation. arXiv preprint arXiv:1708.00055, 2017.

[7] S. Chaturvedi, H. Peng, and D. Roth. Story comprehension for predicting what happens next. In Proceedings of the 2017 Conference on Empirical Methods in Natural Language Processing, pages 1603–1614, 2017.

[8] D. Chen and C. Manning. A fast and accurate dependency parser using neural networks. In Proceedings of the 2014 conference on empirical methods in natural language processing (EMNLP), pages 740–750, 2014.

[9] Z. Chen, H. Zhang, X. Zhang, and L. Zhao. Quora question pairs. https://data.quora.com/First-Quora-Dataset-Release-Question-Pairs, 2018.

[10] R. Collobert and J. Weston. A unified architecture for natural language processing: Deep neural networks with multitask learning. In Proceedings of the 25th international conference on Machine learning, pages 160–167. ACM, 2008.

[11] R. Collobert, J. Weston, L. Bottou, M. Karlen, K. Kavukcuoglu, and P. Kuksa. Natural language processing (almost) from scratch. Journal of Machine Learning Research, 12(Aug):2493–2537, 2011.

[12] A. Conneau, D. Kiela, H. Schwenk, L. Barrault, and A. Bordes. Supervised learning of universal sentence representations from natural language inference data. EMNLP, 2017.

[13] A. M. Dai and Q. V. Le. Semi-supervised sequence learning. In Advances in Neural Information Processing Systems, pages 3079–3087, 2015.

[14] W. B. Dolan and C. Brockett. Automatically constructing a corpus of sentential paraphrases. In Proceedings of the Third International Workshop on Paraphrasing (IWP2005), 2005.

[15] D. Erhan, Y. Bengio, A. Courville, P.-A. Manzagol, P. Vincent, and S. Bengio. Why does unsupervised pre-training help deep learning? Journal of Machine Learning Research, 11(Feb):625–660, 2010.

[16] S. Gray, A. Radford, and K. P. Diederik. Gpu kernels for block-sparse weights. 2017.

[17] Z. He, S. Liu, M. Li, M. Zhou, L. Zhang, and H. Wang. Learning entity representation for entity disambiguation. In Proceedings of the 51st Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Papers), volume 2, pages 30–34, 2013.

[18] D. Hendrycks and K. Gimpel. Bridging nonlinearities and stochastic regularizers with gaussian error linear units. arXiv preprint arXiv:1606.08415, 2016.

[19] K. M. Hermann, T. Kocisky, E. Grefenstette, L. Espeholt, W. Kay, M. Suleyman, and P. Blunsom. Teaching machines to read and comprehend. In Advances in Neural Information Processing Systems, pages 1693–1701, 2015.

[20] G. E. Hinton, S. Osindero, and Y.-W. Teh. A fast learning algorithm for deep belief nets. Neural computation, 18(7):1527–1554, 2006.

[21] J. Howard and S. Ruder. Universal language model fine-tuning for text classification. Association for Computational Linguistics (ACL), 2018.

[22] Y. Jernite, S. R. Bowman, and D. Sontag. Discourse-based objectives for fast unsupervised sentence representation learning. arXiv preprint arXiv:1705.00557, 2017.

[23] Y. Ji and J. Eisenstein. Discriminative improvements to distributional sentence similarity. In Proceedings of the 2013 Conference on Empirical Methods in Natural Language Processing, pages 891–896, 2013.

本页为参考文献 [2] 至 [23]，原文照录。其中 [2] 是 layernorm，[18] 是 GELU，[21] 是用 LSTM 做语言模型微调的 ULMFiT，正文 4.1 节和 2 节都引到它们。

<!-- page 10 of 12 -->

[24] F. Jiao, S. Wang, C.-H. Lee, R. Greiner, and D. Schuurmans. Semi-supervised conditional random fields for improved sequence segmentation and labeling. In Proceedings of the 21st International Conference on Computational Linguistics and the 44th annual meeting of the Association for Computational Linguistics, pages 209–216. Association for Computational Linguistics, 2006.

[25] T. Khot, A. Sabharwal, and P. Clark. Scitail: A textual entailment dataset from science question answering. In Proceedings of AAAI, 2018.

[26] Y. Kim. Convolutional neural networks for sentence classification. EMNLP, 2014.

[27] D. P. Kingma and J. Ba. Adam: A method for stochastic optimization. arXiv preprint arXiv:1412.6980, 2014.

[28] R. Kiros, Y. Zhu, R. R. Salakhutdinov, R. Zemel, R. Urtasun, A. Torralba, and S. Fidler. Skip-thought vectors. In Advances in neural information processing systems, pages 3294–3302, 2015.

[29] N. Kitaev and D. Klein. Constituency parsing with a self-attentive encoder. ACL, 2018.

[30] G. Lai, Q. Xie, H. Liu, Y. Yang, and E. Hovy. Race: Large-scale reading comprehension dataset from examinations. EMNLP, 2017.

[31] G. Lample, L. Denoyer, and M. Ranzato. Unsupervised machine translation using monolingual corpora only. ICLR, 2018.

[32] Q. Le and T. Mikolov. Distributed representations of sentences and documents. In International Conference on Machine Learning, pages 1188–1196, 2014.

[33] P. Liang. Semi-supervised learning for natural language. PhD thesis, Massachusetts Institute of Technology, 2005.

[34] P. J. Liu, M. Saleh, E. Pot, B. Goodrich, R. Sepassi, L. Kaiser, and N. Shazeer. Generating wikipedia by summarizing long sequences. ICLR, 2018.

[35] X. Liu, K. Duh, and J. Gao. Stochastic answer networks for natural language inference. arXiv preprint arXiv:1804.07888, 2018.

[36] L. Logeswaran and H. Lee. An efficient framework for learning sentence representations. ICLR, 2018.

[37] I. Loshchilov and F. Hutter. Fixing weight decay regularization in adam. arXiv preprint arXiv:1711.05101, 2017.

[38] B. McCann, J. Bradbury, C. Xiong, and R. Socher. Learned in translation: Contextualized word vectors. In Advances in Neural Information Processing Systems, pages 6297–6308, 2017.

[39] T. Mikolov, I. Sutskever, K. Chen, G. S. Corrado, and J. Dean. Distributed representations of words and phrases and their compositionality. In Advances in neural information processing systems, pages 3111–3119, 2013.

[40] N. Mostafazadeh, M. Roth, A. Louis, N. Chambers, and J. Allen. Lsdsem 2017 shared task: The story cloze test. In Proceedings of the 2nd Workshop on Linking Models of Lexical, Sentential and Discourse-level Semantics, pages 46–51, 2017.

[41] K. Nigam, A. McCallum, and T. Mitchell. Semi-supervised text classification using em. Semi-Supervised Learning, pages 33–56, 2006.

[42] J. Pennington, R. Socher, and C. Manning. Glove: Global vectors for word representation. In Proceedings of the 2014 conference on empirical methods in natural language processing (EMNLP), pages 1532–1543, 2014.

[43] M. E. Peters, W. Ammar, C. Bhagavatula, and R. Power. Semi-supervised sequence tagging with bidirectional language models. ACL, 2017.

[44] M. E. Peters, M. Neumann, M. Iyyer, M. Gardner, C. Clark, K. Lee, and L. Zettlemoyer. Deep contextualized word representations. NAACL, 2018.

[45] Y. Qi, D. S. Sachan, M. Felix, S. J. Padmanabhan, and G. Neubig. When and why are pre-trained word embeddings useful for neural machine translation? NAACL, 2018.

本页为参考文献 [24] 至 [45]，原文照录。[34] 是正文说的 Transformer decoder 来源，[37] 是改版 L2 正则，[44] 是 ELMo。

<!-- page 11 of 12 -->

[46] A. Rahman and V. Ng. Resolving complex cases of definite pronouns: the winograd schema challenge. In Proceedings of the 2012 Joint Conference on Empirical Methods in Natural Language Processing and Computational Natural Language Learning, pages 777–789. Association for Computational Linguistics, 2012.

[47] P. Rajpurkar, J. Zhang, K. Lopyrev, and P. Liang. Squad: 100,000+ questions for machine comprehension of text. EMNLP, 2016.

[48] P. Ramachandran, P. J. Liu, and Q. V. Le. Unsupervised pretraining for sequence to sequence learning. arXiv preprint arXiv:1611.02683, 2016.

[49] M. Ranzato, C. Poultney, S. Chopra, and Y. LeCun. Efficient learning of sparse representations with an energy-based model. In Advances in neural information processing systems, pages 1137–1144, 2007.

[50] M. Rei. Semi-supervised multitask learning for sequence labeling. ACL, 2017.

[51] H. Robbins and S. Monro. A stochastic approximation method. The annals of mathematical statistics, pages 400–407, 1951.

[52] T. Rocktäschel, E. Grefenstette, K. M. Hermann, T. Kocisk ˇ y, and P. Blunsom. Reasoning about entailment \` with neural attention. arXiv preprint arXiv:1509.06664, 2015.

[53] R. Sennrich, B. Haddow, and A. Birch. Neural machine translation of rare words with subword units. arXiv preprint arXiv:1508.07909, 2015.

[54] R. Socher, A. Perelygin, J. Wu, J. Chuang, C. D. Manning, A. Ng, and C. Potts. Recursive deep models for semantic compositionality over a sentiment treebank. In Proceedings of the 2013 conference on empirical methods in natural language processing, pages 1631–1642, 2013.

[55] S. Srinivasan, R. Arora, and M. Riedl. A simple and effective approach to the story cloze test. arXiv preprint arXiv:1803.05547, 2018.

[56] S. Subramanian, A. Trischler, Y. Bengio, and C. J. Pal. Learning general purpose distributed sentence representations via large scale multi-task learning. arXiv preprint arXiv:1804.00079, 2018.

[57] J. Suzuki and H. Isozaki. Semi-supervised sequential labeling and segmentation using giga-word scale unlabeled data. Proceedings of ACL-08: HLT, pages 665–673, 2008.

[58] Y. Tay, L. A. Tuan, and S. C. Hui. A compare-propagate architecture with alignment factorization for natural language inference. arXiv preprint arXiv:1801.00102, 2017.

[59] Y. Tay, L. A. Tuan, and S. C. Hui. Multi-range reasoning for machine comprehension. arXiv preprint arXiv:1803.09074, 2018.

[60] J. Tian, Z. Zhou, M. Lan, and Y. Wu. Ecnu at semeval-2017 task 1: Leverage kernel-based traditional nlp features and neural networks to build a universal model for multilingual and cross-lingual semantic textual similarity. In Proceedings of the 11th International Workshop on Semantic Evaluation (SemEval-2017), pages 191–197, 2017.

[61] Y. Tsvetkov. Opportunities and challenges in working with low-resource languages. CMU, 2017.

[62] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin. Attention is all you need. In Advances in Neural Information Processing Systems, pages 6000–6010, 2017.

[63] P. Vincent, H. Larochelle, Y. Bengio, and P.-A. Manzagol. Extracting and composing robust features with denoising autoencoders. In Proceedings of the 25th international conference on Machine learning, pages 1096–1103. ACM, 2008.

[64] A. Wang, A. Singh, J. Michael, F. Hill, O. Levy, and S. R. Bowman. Glue: A multi-task benchmark and analysis platform for natural language understanding. arXiv preprint arXiv:1804.07461, 2018.

[65] A. Warstadt, A. Singh, and S. R. Bowman. Corpus of linguistic acceptability. http://nyu-mll.github.io/cola,2018.

[66] A. Williams, N. Nangia, and S. R. Bowman. A broad-coverage challenge corpus for sentence understanding through inference. NAACL, 2018.

[67] Y. Xu, J. Liu, J. Gao, Y. Shen, and X. Liu. Towards human-level machine reading comprehension: Reasoning and inference with multiple strategies. arXiv preprint arXiv:1711.04964, 2017.

本页为参考文献 [46] 至 [67]，原文照录。[52] 是 traversal-style 输入变换的出处，[53] 是 BPE，[62] 是原始 Transformer，[64] 是 GLUE。

<!-- page 12 of 12 -->

[68] D. Yu, L. Deng, and G. Dahl. Roles of pre-training and fine-tuning in context-dependent dbn-hmms for real-world speech recognition. In Proc. NIPS Workshop on Deep Learning and Unsupervised Feature Learning, 2010.

[69] R. Zhang, P. Isola, and A. A. Efros. Split-brain autoencoders: Unsupervised learning by cross-channel prediction. In CVPR, volume 1, page 6, 2017.

[71] Y. Zhu, R. Kiros, R. Zemel, R. Salakhutdinov, R. Urtasun, A. Torralba, and S. Fidler. Aligning books and movies: Towards story-like visual explanations by watching movies and reading books. In Proceedings of the IEEE international conference on computer vision, pages 19–27, 2015.

[70] X. Zhu. Semi-supervised learning literature survey. 2005.

本页为参考文献 [68] 至 [71]，原文照录；原排版里 [71] 印在 [70] 之前，这里保持原顺序。[71] 是预训练所用 BooksCorpus 的出处。
