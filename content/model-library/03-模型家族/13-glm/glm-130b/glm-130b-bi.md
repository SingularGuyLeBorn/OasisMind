---
title: "GLM-130B · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-130B 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 56 -->

arXiv:2210.02414v2 [cs.CL] 25 Oct 2023

Published as a conference paper at ICLR 2023

ICLR 2023 会议论文. arXiv 编号 2210.02414v2, 分类 cs.CL, 这一版的日期是 2023 年 10 月 25 日.

# GLM-130B: AN OPEN BILINGUAL PRE-TRAINED MODEL GLM-130B: 一个开放的双语预训练模型

**Aohan Zeng**⋄<sup>†∗</sup>**, Xiao Liu**⋄<sup>†∗</sup>**, Zhengxiao Du**⋄<sup>†</sup>**, Zihan Wang**⋄**, Hanyu Lai**⋄**, Ming Ding**⋄, **Zhuoyi Yang**⋄**, Yifan Xu**⋄**, Wendi Zheng**⋄**, Xiao Xia**⋄**, Weng Lam Tam**⋄§**, Zixuan Ma**⋄, **Yufei Xue**§**, Jidong Zhai**⋄**, Wenguang Chen**⋄**, Peng Zhang**§**, Yuxiao Dong**⋄<sup>‡</sup>**, Jie Tang**⋄<sup>‡</sup>

Tsinghua University⋄ Zhipu.AI§

作者共 18 位, 姓名保留上面的英文拼写. 单位: ⋄ 清华大学, § 智谱 AI (Zhipu.AI). ∗, †, ‡ 三个记号的含义见本页脚注.

## ABSTRACT

We introduce GLM-130B, a bilingual (English and Chinese) pre-trained language model with 130 billion parameters. It is an attempt to open-source a 100B-scale model at least as good as GPT-3 (davinci) and unveil how models of such a scale can be successfully pre-trained. Over the course of this effort, we face numerous unexpected technical and engineering challenges, particularly on loss spikes and divergence. In this paper, we introduce the training process of GLM-130B including its design choices, training strategies for both efficiency and stability, and engineering efforts. The resultant GLM-130B model offers significant outperformance over GPT-3 175B (davinci) on a wide range of popular English benchmarks while the performance advantage is not observed in OPT-175B and BLOOM-176B. It also consistently and significantly outperforms ERNIE TITAN 3.0 260B—the largest Chinese language model—across related benchmarks. Finally, we leverage a unique scaling property of GLM-130B to reach INT4 quantization without post training, with almost no performance loss, making it the first among 100B-scale models and more importantly, allowing its effective inference on 4×RTX 3090 (24G) or 8×RTX 2080 Ti (11G) GPUs, the most affordable GPUs required for using 100B-scale models. The GLM-130B model weights are publicly accessible and its code, training logs, related toolkit, and lessons learned are open-sourced at [https://github.com/THUDM/GLM-130B/](https://github.com/THUDM/GLM-130B/).

我们介绍 GLM-130B, 一个有 1300 亿参数的中英双语预训练语言模型. 它尝试开源一个至少和 GPT-3 (davinci) 一样好的千亿级模型, 并公开这种规模的模型怎样才能预训练成功. 在这个过程中, 我们遇到了大量意料之外的技术和工程难题, 尤其是 loss 尖峰和发散. 本文介绍 GLM-130B 的训练过程, 包括设计选择, 兼顾效率和稳定性的训练策略, 以及工程上的投入. 训练出来的 GLM-130B 在一系列常用英文基准上明显超过 GPT-3 175B (davinci), 而在 OPT-175B 和 BLOOM-176B 身上没有观察到这种优势. 在相关基准上, 它也稳定而明显地超过目前最大的中文语言模型 ERNIE TITAN 3.0 260B. 最后, 我们利用 GLM-130B 一种独特的规模性质 (scaling property), 不经后训练就做到了 INT4 量化, 性能几乎不掉. 这在千亿级模型里是第一个; 更重要的是, 它因此能在 4 张 RTX 3090 (24G) 或 8 张 RTX 2080 Ti (11G) 上有效推理, 这是使用千亿级模型所需的最便宜的 GPU. GLM-130B 的模型权重可以公开获取, 代码, 训练日志, 相关工具包和经验教训开源在 https://github.com/THUDM/GLM-130B/ .

> **想:** 摘要说 GLM-130B 在 「一系列常用英文基准上」 明显超过 GPT-3 175B. 这个优势是不是每一行都成立?
> 不是每一行都成立. 汇总分数上成立, 逐项拆开有不少反例. 第 39 页表 13 的 Pile 18 个子集里, GLM-130B 在 ubuntu_irc (0.977 对 0.946), books3 (源 md 抽成 books33, 0.803 对 0.802), pile_cc (0.771 对 0.698), philpapers (0.766 对 0.723), nih_exporter (0.614 对 0.612) 这 5 个上 BPB 比 GPT-3 高, 也就是更差. 第 43 页表 17 的 Winograd273, GPT-3 是 88.3, GLM-130B 是 84.3; 表 18 的 Natural Questions, GPT-3 是 14.6, GLM-130B 是 11.7. 第 50 页表 14 的 BIG-bench-lite 24 个任务, 零样本下 GPT-3 在 8 个任务上更高, 另有 2 个打平. 摘要里的 「wide range」 说的是各基准的汇总分数, 读成逐项全胜就过头了.

## 1 INTRODUCTION

Large language models (LLMs), particularly those with over 100 billion (100B) parameters (Brown et al., 2020; Thoppilan et al., 2022; Rae et al., 2021; Chowdhery et al., 2022; Wang et al., 2021), have presented attractive scaling laws (Wei et al., 2022b), where emergent zero-shot and few-shot capabilities suddenly arose. Among them, GPT-3 (Brown et al., 2020) with 175B parameters pioneers the study of 100B-scale LLMs by strikingly generating better performance with 32 labeled examples than the fully-supervised BERT-Large model on a variety of benchmarks. However, both GPT-3 (and many other closed-sourced 100B-scale ones)—the model itself—and how it can be trained, have been thus far intransparent to the public. It is of critical value to train a high-quality LLM of such scale with both the model and training process shared with everyone.

大语言模型 (LLM), 尤其是参数超过 1000 亿 (100B) 的那些 (Brown et al., 2020; Thoppilan et al., 2022; Rae et al., 2021; Chowdhery et al., 2022; Wang et al., 2021), 表现出诱人的规模定律 (Wei et al., 2022b): 零样本和少样本能力会突然涌现. 其中 1750 亿参数的 GPT-3 (Brown et al., 2020) 开了千亿级 LLM 研究的先河: 在多种基准上, 它只用 32 个带标注的样例, 成绩就超过了全监督的 BERT-Large. 但无论是 GPT-3 (以及许多其他闭源的千亿级模型) 模型本身, 还是它怎样训练出来, 至今都对公众不透明. 训练一个这种规模的高质量 LLM, 并把模型和训练过程都分享给所有人, 有关键的价值.

We thus aim to pre-train an open and highly-accurate 100B-scale model with ethical concerns in mind. Over the course of our attempt, we have come to realize that pre-training a dense LLM at such a scale raises numerous unexpected technical and engineering challenges compared to training 10B-scale models, in terms of pre-training efficiency, stability, and convergence. Similar difficulties have also been concurrently observed in training OPT-175B (Zhang et al., 2022) and BLOOM-176B (Scao et al., 2022), further demonstrating the significance of GPT-3 as a pioneer study.

因此, 我们的目标是在顾及伦理问题的前提下, 预训练一个开放而高精度的千亿级模型. 在尝试过程中我们逐渐意识到, 和训练百亿级模型相比, 在这种规模上预训练稠密 LLM 会在预训练效率, 稳定性和收敛三方面带来大量意料之外的技术和工程难题. 训练 OPT-175B (Zhang et al., 2022) 和 BLOOM-176B (Scao et al., 2022) 时也同期观察到了类似的困难, 这进一步说明了 GPT-3 作为先驱研究的分量.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>\*</sup>The two lead authors AZ and XL contributed equally ({zengaohan,shawliu9}@gmail.com)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>†</sup>Work partially done when AZ, XL, and ZD interned at Zhipu.AI.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>‡</sup>Team leads: YD and JT. Corresponding author: JT (jietang@tsinghua.edu.cn)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">For detailed author contributions, please refer to Appendix E.</span></small>

脚注: ∗ 两位第一作者 AZ 和 XL 贡献相同 (邮箱见上). † AZ, XL 和 ZD 的部分工作是在智谱 AI 实习期间完成的. ‡ 团队负责人是 YD 和 JT; 通讯作者是 JT (jietang@tsinghua.edu.cn). 详细的作者贡献见附录 E.

<!-- page 2 of 56 -->

![Chart block](images/p02-figure-1-a-summary-of-the-performance-evaluation-and.png)

Figure 1: A summary of the performance evaluation and ethical studies.

图 1: 性能评测与伦理研究的汇总.

(图: 左半部分标题 Language Ability Evaluation, 三组柱状图. LAMBADA (0-shot): GLM 80.2, PaLM 77.9, GPT-3 76.2, OPT 74.7. BIG-bench-lite (0-shot): GLM 13.3, PaLM 8.1, GPT-3 4.3. MMLU (5-shot): GLM 44.8, GPT-3 43.9, BLOOM 32.1, 这一组没有 OPT 和 PaLM. 右半部分标题 Bias & Toxicity Evaluation: StereoSet (ICAT, 越高越好) GLM 73.5, GPT-3 60.8, OPT 60.0; CrowS-Pairs (PLL, 越低越好) OPT 69.5, GPT-3 67.2, GLM 65.8; 最右一张小折线图是 RealToxicityPrompts, 横轴是 0 到 1 的提示毒性, 纵轴 TPC 越低越好, GLM 的橙线几乎全程低于 GPT-3 的蓝线. 图例颜色: 橙色 GLM-130B, 蓝色 GPT-3 175B, 紫色 OPT-175B, 红色 BLOOM 176B, 绿色 PaLM 540B.)

Table 1: A comparison between GLM-130B and other 100B-scale LLMs and PaLM 540B. (LN: layer norm.; FPF: floating-point format; MIP: multi-task instruction pre-training; CN : Chinese)

<table><tr><td rowspan="2">Model</td><td rowspan="2">Open-source</td><td colspan="3">Architecture &amp; Data</td><td colspan="2">Training</td><td colspan="2">Inference</td></tr><tr><td>Objective</td><td>LN</td><td>Major Lang.</td><td>FPF</td><td>Stabilization</td><td>Quantization</td><td>GPU Needed</td></tr><tr><td>GPT-3 175B</td><td>×</td><td></td><td></td><td>English</td><td>FP16</td><td>undisclosed</td><td>undisclosed</td><td>undisclosed</td></tr><tr><td>OPT-175B</td><td>✓</td><td>GPT</td><td>Pre-LN</td><td>English</td><td>FP16</td><td>Manual Adjusting</td><td>INT8</td><td> $8 \times 3090$ </td></tr><tr><td>BLOOM-176B</td><td>✓</td><td></td><td></td><td>Multi-lingual</td><td>BF16</td><td>Embedding Norm</td><td>INT8</td><td> $8 \times 3090$ </td></tr><tr><td>PaLM 540B</td><td>×</td><td>GPT</td><td>Pre-LN</td><td>English</td><td>BF16</td><td>Manual Adjusting</td><td>undisclosed</td><td>undisclosed</td></tr><tr><td>GLM-130B</td><td>✓</td><td>GLM (Blank Infilling &amp; MIP)</td><td>Deep-Norm</td><td>Bilingual (EN &amp; CN)</td><td>FP16</td><td>Embedding Gradient Shrink</td><td>INT4</td><td> $4 \times 3090$  or  $8 \times 1080$  Ti</td></tr></table>

表 1: GLM-130B 与其他千亿级 LLM 以及 PaLM 540B 的对比. (LN: 层归一化; FPF: 浮点格式; MIP: 多任务指令预训练; CN: 中文)

| 模型 | 开源 | 训练目标 | LN | 主要语言 | FPF | 稳定手段 | 量化 | 所需 GPU |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-3 175B | × | GPT (三行合并格) | Pre-LN (三行合并格) | 英文 | FP16 | 未公开 | 未公开 | 未公开 |
| OPT-175B | ✓ | 同上 | 同上 | 英文 | FP16 | 手动调整 | INT8 | 8 × 3090 |
| BLOOM-176B | ✓ | 同上 | 同上 | 多语言 | BF16 | Embedding Norm | INT8 | 8 × 3090 |
| PaLM 540B | × | GPT | Pre-LN | 英文 | BF16 | 手动调整 | 未公开 | 未公开 |
| GLM-130B | ✓ | GLM (空白填充 & MIP) | DeepNorm | 双语 (中 & 英) | FP16 | 嵌入层梯度收缩 | INT4 | 4 × 3090 或 8 × 1080 Ti |

(源 md 把 「GPT」 和 「Pre-LN」 抽到了 OPT 那一行, PDF 里这两格是 GPT-3, OPT, BLOOM 三行共用的合并格.)

> **核对:** 表 1 最后一格写 GLM-130B 需要 「8 × 1080 Ti」, 和摘要说的 2080 Ti 对不上, 哪个对?
> 以 2080 Ti 为准. 摘要, 本页最后一段, 第 6 页第 4 节的标题和第 7 页正文都写 8 × RTX 2080 Ti (11G), 表 2 右半的推理速度也是在 8 × RTX 2080 Ti (11G) 上测的. 1080 Ti 全文只在表 1 出现这一次, PDF 原表也是这样印的, 不是 MinerU 抽错. 另有一处小出入: 第 7 页表 2 右写 「4 × RTX 3090 (24G)」, 同页正文写 「4 × RTX 3090 Ti (24G)」, 两者显存都按 24G 算, 不影响 70GB 能否装下的结论.

In this work, we introduce the pre-training of a 100B-scale model—GLM-130B, in terms of engineering efforts, model design choices, training strategies for efficiency and stability, and quantization for affordable inference. As it has been widely realized that it is computationally unaffordable to empirically enumerate all possible designs for training 100B-scale LLMs, we present not only the successful part for training GLM-130B but also many of the failed options and lessons learned. Particularly, the training stability is the decisive factor in the success of training models of such a scale. Different from practices such as manually adjusting learning rates in OPT-175B and using embedding norm in the sacrifice of performance in BLOOM-176B, we experiment with various options and find the strategy of embedding gradient shrink can significantly stabilize the training of GLM-130B.

本文介绍千亿级模型 GLM-130B 的预训练, 内容涵盖工程投入, 模型设计选择, 兼顾效率和稳定性的训练策略, 以及让推理变便宜的量化. 大家已经普遍认识到, 为训练千亿级 LLM 而把所有可能的设计逐个试一遍, 在算力上负担不起. 所以我们不仅介绍训练 GLM-130B 成功的部分, 也介绍许多失败的选项和从中得到的经验. 尤其是训练稳定性, 它是这种规模的模型能否训练成功的决定性因素. OPT-175B 的做法是手动调学习率, BLOOM-176B 的做法是以牺牲性能为代价使用 embedding norm; 与它们不同, 我们试验了多种方案, 发现嵌入层梯度收缩 (embedding gradient shrink) 这一策略能显著稳定 GLM-130B 的训练.

Specifically, GLM-130B is a bilingual (English and Chinese) bidirectional dense model with 130 billion parameters, pre-trained over 400 billion tokens on a cluster of 96 NVIDIA DGX-A100 (8×40G) GPU nodes between May 6 and July 3, 2022. Instead of using the GPT-style architecture, we adopt the General Language Model (GLM) algorithm (Du et al., 2022) to leverage its bidirectional attention advantage and autoregressive blank infilling objective. Table 1 summarizes the comparison between GLM-130B, GPT-3 and another two open-source efforts—OPT-175B and BLOOM-176B, as well as PaLM 540B (Chowdhery et al., 2022)—a 4× larger model—as a reference.

具体来说, GLM-130B 是一个中英双语的双向稠密模型, 有 1300 亿参数, 2022 年 5 月 6 日到 7 月 3 日在由 96 个 NVIDIA DGX-A100 (8×40G) GPU 节点组成的集群上预训练了超过 4000 亿 token. 我们没有用 GPT 式架构, 而是采用 General Language Model (GLM) 算法 (Du et al., 2022), 以利用它的双向注意力优势和自回归空白填充目标. 表 1 汇总了 GLM-130B 与 GPT-3, 另外两个开源项目 OPT-175B 和 BLOOM-176B 的对比, 并把大 4 倍的 PaLM 540B (Chowdhery et al., 2022) 列作参照.

Altogether, the conceptual uniqueness and engineering efforts enable GLM-130B to exhibit performance that surpasses the level of GPT-3 on a wide range of benchmarks (in total 112 tasks) and also outperforms PaLM 540B in many cases, while outperformance over GPT-3 has not been observed in OPT-175B and BLOOM-176B (Cf. Figure 1 left). For zero-shot performance, GLM-130B is better than GPT-3 175B (+5.0%), OPT-175B (+6.5%), and BLOOM-176B (+13.0%) on LAMBADA (Paperno et al., 2016), and achieves 3× better performance than GPT-3 on Big-bench-lite (Srivastava et al., 2022). For the 5-shot MMLU (Hendrycks et al., 2021) tasks, it is better than GPT-3 175B (+0.9%) and BLOOM-176B (+12.7%). As a bilingual LLM also in Chinese, it offers significantly better results than ERNIE TITAN 3.0 260B (Wang et al., 2021)—the largest Chinese LLM—on 7 zero-shot CLUE (Xu et al., 2020) datasets (+24.26%) and 5 zero-shot FewCLUE (Xu et al., 2021) ones (+12.75%). Importantly, as summarized in Figure 1 right, GLM-130B as an open model is associated with significantly less bias and generation toxicity than its 100B-scale counterparts.

总之, 概念上的独特性加上工程投入, 让 GLM-130B 在大量基准 (共 112 个任务) 上的表现超过 GPT-3 的水平, 很多情况下也超过 PaLM 540B; 而 OPT-175B 和 BLOOM-176B 没有表现出超过 GPT-3 的情况 (参见图 1 左). 零样本方面, 在 LAMBADA (Paperno et al., 2016) 上 GLM-130B 好于 GPT-3 175B (+5.0%), OPT-175B (+6.5%) 和 BLOOM-176B (+13.0%); 在 Big-bench-lite (Srivastava et al., 2022) 上成绩是 GPT-3 的 3 倍. 在 5-shot 的 MMLU (Hendrycks et al., 2021) 任务上, 它好于 GPT-3 175B (+0.9%) 和 BLOOM-176B (+12.7%). 作为同时覆盖中文的双语 LLM, 在 7 个零样本 CLUE (Xu et al., 2020) 数据集 (+24.26%) 和 5 个零样本 FewCLUE (Xu et al., 2021) 数据集 (+12.75%) 上, 它明显好于最大的中文 LLM ERNIE TITAN 3.0 260B (Wang et al., 2021). 重要的是, 如图 1 右所示, 作为开放模型, GLM-130B 的偏见和生成毒性明显低于同为千亿级的其他模型.

> **拆开:** 这一段说零样本 LAMBADA 上 GLM-130B 比 GPT-3 175B 高 5.0%, 比 OPT-175B 高 6.5%, 比 BLOOM-176B 高 13.0%. 这三个数是怎么算的?
> 拿第 3 页图 2 的柱高算: GLM-130B 80.2, GPT-3 76.2, OPT 74.7, BLOOM 67.2. 绝对差是 4.0, 5.5, 13.0 个百分点; 相对提升是 5.2%, 7.4%, 19.3%. 只有 BLOOM 的 13.0 对得上 (绝对差). GPT-3 的 5.0 接近相对提升 5.2%, OPT 的 6.5 两种算法都对不上. 同段 MMLU 的 +0.9 和 +12.7 是绝对差 (44.8 减 43.9, 44.8 减 32.1, 数据见第 8 页), 中文的 +24.26% 和 +12.75% 也是平均分的绝对差 (见第 9 页的疑问). 论文没说 LAMBADA 这三个数用的是哪种口径, 引用时以图 2 的原始准确率为准.

Finally, we design GLM-130B to empower as many people as possible to conduct 100B-scale LLM studies. First, instead of using 175B+ parameters as OPT and BLOOM, the 130B size is decided because such a size supports inference on a single A100 (8×40G) server. Second, to further lower the GPU requirements, we quantize GLM-130B into INT4 precision without post training while OPT and BLOOM can only reach INT8. Due to a unique property of the GLM architecture, GLM-130B’s INT4 quantization introduces negligible performance degradation, e.g., -0.74% on LAMBADA and even +0.05% on MMLU, making it still better than the uncompressed GPT-3. This enables GLM-130B’s fast inference with performance guarantee on a server of 4×RTX 3090 (24G) or 8×RTX 2080 Ti (11G), the most affordable GPU required for using 100B-scale LLMs to date.

最后, 我们设计 GLM-130B 时希望让尽可能多的人能做千亿级 LLM 的研究. 第一, 我们没有像 OPT 和 BLOOM 那样用 1750 亿以上的参数, 而是定为 1300 亿, 因为这个大小能在单台 A100 (8×40G) 服务器上推理. 第二, 为了进一步降低 GPU 要求, 我们不经后训练就把 GLM-130B 量化到了 INT4 精度, 而 OPT 和 BLOOM 只能做到 INT8. 由于 GLM 架构的一种独特性质, GLM-130B 的 INT4 量化带来的性能下降可以忽略, 例如 LAMBADA 上 -0.74%, MMLU 上甚至 +0.05%, 仍然好于未压缩的 GPT-3. 这让 GLM-130B 能在 4×RTX 3090 (24G) 或 8×RTX 2080 Ti (11G) 的服务器上快速推理且保证性能, 这是迄今使用千亿级 LLM 所需的最便宜的 GPU.

> **问:** 文中一直拿 130B 和 175B, 176B 比, 这几个参数量是不是同一口径? 130B 这个数是怎么来的?
> 参数量的算法是同一类: 都是稠密模型的全部参数, 没有稀疏激活. 130B 的上限来自第 5 页: FP16 下要装进单台 8×40G, 130B × 2 字节 = 260GB, 在 320GB 以内. 第 48 页表 11 给了配置: hidden_size 12288 (第 5 页说取自 GPT-3), num_layers 70, ffn_hidden_size 32768, 注意力头 96. 32768 恰好是 12288 的 8/3; 第 25 页说 GeGLU 多了一个矩阵 V, 所以把 FFN 宽度从 4 倍降到 8/3 倍, 参数和普通 FFN 持平. 这样每层约 12 × 12288² ≈ 18.1 亿, 70 层约 1268 亿; 词表按第 24 页只用文本部分的 130000 个, 再按表 11 的 make_vocab_size_divisible_by 768 补齐到 130560, 一份嵌入约 16 亿, 合计约 1284 亿; 输出层如果不和输入嵌入共享, 再加约 16 亿, 就到 1300 亿左右 (论文没写是否共享). 但 「同一口径」 只到参数这一步. 训练数据量不同: 第 5 页说 GLM-130B 共 4000 亿 token, 中英各约 2000 亿, 第 44 页也承认英文只看了约 2000 亿 token. 对手的数字来源也不统一: 第 39 页 C.3 说 GPT-3 的结果大多取自文献, 一部分是自己调 OpenAI Davinci API 得到的. 拿 130B 和 175B 比成绩时, 这几层差别要一起算上.

<!-- page 3 of 56 -->

![Chart block](images/p03-chart.png)

![Chart block](images/p03-a-more-than-30-failed-preliminary-trials-at-100b-scale.png)

(a) More than 30 failed preliminary trials at 100B-scale (b) Final decisive trials: Sandwich-LN v.s. DeepNorm

Figure 3: Trials on different LayerNorms for GLM-130B training. It turns out that DeepNorm is the most stable one, as it has small gradient norm and does not spike in the early stage training.

(a) 在千亿规模上 30 多次失败的前期试验; (b) 最终的决定性试验: Sandwich-LN 对 DeepNorm.

图 3: GLM-130B 训练中对不同 LayerNorm 的试验. 结果表明 DeepNorm 最稳定, 它的梯度范数小, 训练早期也不出现尖峰.

(图: 第一张图纵轴 Gradient Norm (0 到 12), 横轴步数 0 到 3k, 十几条不同颜色的曲线, 很多在 1.5k 到 3k 步之间突然冲到图顶, 有一条在 2.3k 附近跳到 6 左右后变平. 第二张图只有两条线: 蓝线 Sandwich-LN (GLM-130B) 从 10 以上缓慢降到 1 以下, 在约 2700 步处突然竖直冲高; 黄线 Post-LN with DeepNorm (GLM-130B) 在 200 步后就降到 1 左右并一直平稳到 2900 步.)

> **回看:** 这页两张图的文件名一个叫 p03-chart.png, 一个叫 p03-a-more-than-30-failed-preliminary-trials..., 名字和子图对得上吗?
> 对不上. 名字里带 「a-more-than-30-failed」 的那张只有两条曲线, 图例是 Sandwich-LN (GLM-130B) 和 Post-LN with DeepNorm (GLM-130B), 它是子图 (b). 叫 p03-chart.png 的那张画着十几条彩色的梯度范数曲线, 才是子图 (a) 的 30 多次失败试验. MinerU 把 (a) 的说明文字挂到了第二张图的文件名上. 另外图 3 排在图 2 前面, 这是 PDF 的排版顺序, 正文先引用的是图 2.

We open-source the model checkpoints, code, training logs, related toolkits, and lessons learned.

我们开源了模型 checkpoint, 代码, 训练日志, 相关工具包和经验教训.

## 2 THE DESIGN CHOICES OF GLM-130B GLM-130B 的设计选择

The architecture of a machine learning model defines its inductive bias. However, it has been realized that it is computationally unaffordable to explore various architectural designs for LLMs. We introduce and explain the unique design choices of GLM-130B.

机器学习模型的架构决定了它的归纳偏置. 然而大家已经认识到, 为 LLM 探索各种架构设计在算力上负担不起. 下面介绍并解释 GLM-130B 独有的设计选择.

## 2.1 GLM-130B’S ARCHITECTURE GLM-130B 的架构

**GLM as Backbone.** Most recent 100B-scale LLMs, such as GPT-3, PaLM, OPT, and BLOOM, follow the traditional GPT-style (Radford et al., 2019) architecture of decoder-only autoregressive language modeling. In GLM-130B, we instead make an attempt to explore the potential of a bidirectional GLM—General Language Model (Du et al., 2022)—as its backbone.

**以 GLM 为骨干.** 近来的千亿级 LLM, 例如 GPT-3, PaLM, OPT 和 BLOOM, 都沿用传统的 GPT 式 (Radford et al., 2019) 架构, 即只有解码器的自回归语言建模. GLM-130B 则尝试探索双向 GLM (General Language Model, Du et al., 2022) 作为骨干的潜力.

GLM is a transformer-based language model that leverages autoregressive blank infilling as its training objective. Briefly, for a text sequence $\pmb { x } = [ x _ { 1 } , \cdots , x _ { n } ]$ , text spans $\{ \boldsymbol { s } _ { 1 } , \cdots , \boldsymbol { s } _ { m } \}$ are sampled from it, each of which $s _ { i }$ denotes a span of consecutive tokens $[ s _ { i , 1 } , \cdots , s _ { i , l _ { i } } ]$ and is replaced (i.e., corrupted) with a single mask token to form $x _ { \mathrm { c o r m p t } } .$ The model is asked to recover them autoregressively. To allow interactions between corrupted spans, their visibility to each other is decided by a randomly sampled permutation on their order.

GLM 是一种基于 transformer 的语言模型, 训练目标是自回归空白填充. 简单说, 对一个文本序列 x = [x_1, ..., x_n], 从中采样若干文本片段 {s_1, ..., s_m}, 每个 s_i 是一段连续 token [s_{i,1}, ..., s_{i,l_i}], 并被替换 (即破坏) 成单个 mask token, 得到 x_corrupt (源 md 抽成了 x_cormpt). 模型要自回归地把这些片段恢复出来. 为了让被破坏的片段之间能够交互, 它们彼此的可见性由一个随机采样的片段顺序排列决定.

GLM’s bidirectional attention over unmasked (i.e., uncorrupted) contexts distinguishes GLM-130B from GPT-style LLMs in which the unidirectional attention is used. To support both understanding and generation, it mixes two corruption objectives, each indicated by a special mask token:

GLM 在未被 mask (即未被破坏) 的上下文上使用双向注意力, 这一点把 GLM-130B 和使用单向注意力的 GPT 式 LLM 区分开. 为了同时支持理解和生成, 它混合了两种破坏目标, 各用一个特殊的 mask token 标记:

• **[MASK]**: short blanks in sentences whose lengths add up to a certain portion of the input.

• **[gMASK]**: random-length long blanks at the end of sentences with prefix contexts provided.

- **[MASK]**: 句子里的短空白, 总长度加起来占输入的一定比例.
- **[gMASK]**: 句子末尾长度随机的长空白, 前面给出前缀上下文.

Conceptually, the blank infilling objective with bidirectional attention enables a more effective comprehension of contexts than GPT-style models: when using [MASK], GLM-130B behaves as BERT (Devlin et al., 2019) and T5 (Raffel et al., 2020); when using [gMASK], GLM-130B behaves similarly to Pre-fixLM (Liu et al., 2018; Dong et al., 2019).

从概念上讲, 带双向注意力的空白填充目标比 GPT 式模型更能有效理解上下文: 用 [MASK] 时, GLM-130B 的行为像 BERT (Devlin et al., 2019) 和 T5 (Raffel et al., 2020); 用 [gMASK] 时, GLM-130B 的行为类似 PrefixLM (Liu et al., 2018; Dong et al., 2019).

Empirically, GLM-130B offers a record-high accuracy of 80.2% on zero-shot LAMBADA by outperforming both GPT-3 and PaLM 540B in Figure 2. By setting the attention mask, GLM-130B’s unidirectional variant is comparable to GPT-3 and OPT-175B. Our observations are in line with existing findings (Liu et al., 2018; Dong et al., 2019).

实验上, 如图 2 所示, GLM-130B 在零样本 LAMBADA 上取得 80.2% 的创纪录准确率, 超过了 GPT-3 和 PaLM 540B. 通过设置注意力 mask, GLM-130B 的单向变体与 GPT-3 和 OPT-175B 相当. 这些观察和已有发现 (Liu et al., 2018; Dong et al., 2019) 一致.

![Chart block](images/p03-figure-2-glm-130b-and-llms-of-similar-scale-on-zero.png)

Figure 2: GLM-130B and LLMs of similar scale on zero-shot LAMBADA language modeling. Details on GLM’s bidirectional attention are provided in Du et al. (2022).

图 2: GLM-130B 与同规模 LLM 在零样本 LAMBADA 语言建模上的对比. GLM 双向注意力的细节见 Du et al. (2022).

(图: 左侧柱状图标题 Zero-shot LAMBADA, 纵轴 Accuracy 64 到 82. GPT-3 (175B) 76.2, OPT (175B) 74.7, BLOOM (176B) 67.2, GLM-130B-bi 80.2, GLM-130B-uni 75.3; 一条灰色虚线标 SOTA (PaLM 540B), 位置在 78 附近. 右侧两个 6×6 的注意力 mask 示意: 上面是 Bidirectional Attention (e.g., GLM), 蓝色 Context 区域彼此全可见, 黄色和绿色是 Mask(s); 下面是 Unidirectional Attention (e.g., GPT-3, PaLM), 上三角全部打叉.)

**Layer Normalization (LN, Ba et al. (2016)).** Training instability is one major challenge for training LLMs (Zhang et al., 2022; Scao et al., 2022; Chowdhery et al., 2022) (Cf. Figure 10 in Appendix for collapses in training several 100B-scale models). A proper choice of LNs can help stabilize the training of LLMs. We experiment with existing practices, e.g., Pre-LN (Xiong et al., 2020),

(本段跨到下一页, 整段译文放在下一页.)

<!-- page 4 of 56 -->

Post-LN (Ba et al., 2016), Sandwich-LN (Ding et al., 2021), which are unfortunately incapable of stabilizing our GLM-130B test runs (Cf. Figure 3 (a) and Appendix B.2 for details).

**层归一化 (LN, Ba et al. (2016)).** 训练不稳定是训练 LLM 的一大挑战 (Zhang et al., 2022; Scao et al., 2022; Chowdhery et al., 2022) (几个千亿级模型训练崩溃的情况见附录图 10). 合适的 LN 选择有助于稳定 LLM 的训练. 我们试验了已有的做法, 例如 Pre-LN (Xiong et al., 2020), Post-LN (Ba et al., 2016), Sandwich-LN (Ding et al., 2021), 可惜它们都没能稳定我们的 GLM-130B 试跑 (细节见图 3 (a) 和附录 B.2).

Our search is later focused on Post-LN due to its favorable downstream results in preliminary experiments though it does not stabilize GLM-130B. Fortunately, one of the attempts on Post-LN initialized with the newly-proposed DeepNorm (Wang et al., 2022b) generates promising training stability. Specifically, given the number of GLM-130B’s layers N, we adopt DeepNorm(x) = LayerNorm(α · x + Network(x)), where $\alpha   =   ( 2 N ) ^ { \frac { 1 } { 2 } }$ , and apply the Xavier normal initialization with the scaling factor of (2N)− 2 to ffn, v\_proj and out\_proj. Additionally, all bias terms are initialized to zero. Figure 3 shows it significantly benefits the training stability of GLM-130B.

后来我们把搜索集中在 Post-LN 上, 因为它在前期实验里下游结果更好, 尽管它本身稳定不住 GLM-130B. 幸运的是, 在 Post-LN 上的一次尝试用新提出的 DeepNorm (Wang et al., 2022b) 做初始化, 得到了不错的训练稳定性. 具体地, 设 GLM-130B 的层数为 N, 我们采用 DeepNorm(x) = LayerNorm(α · x + Network(x)), 其中 α = (2N)^(1/2), 并对 ffn, v_proj 和 out_proj 使用缩放因子为 (2N)^(-1/2) 的 Xavier normal 初始化 (源 md 把这个指数抽成了 「(2N)− 2」, PDF 是 -1/2). 此外, 所有偏置项都初始化为零. 图 3 表明它明显改善了 GLM-130B 的训练稳定性.

**Positional Encoding and FFNs.** We empirically test different options for positional encoding (PE) and FFN improvements in terms of both training stability and downstream performance (Cf. Appendix B.3 for details). For PEs in GLM-130B, we adopt Rotary Positional Encoding (RoPE, Su et al. (2021)) rather than ALiBi (Press et al., 2021). To improve FFNs in Transformer, we pick GLU with the GeLU (Hendrycks & Gimpel, 2016) activation as the replacement.

**位置编码与 FFN.** 我们从训练稳定性和下游性能两方面, 实验比较了位置编码 (PE) 和 FFN 改进的不同选项 (细节见附录 B.3). GLM-130B 的 PE 采用旋转位置编码 (RoPE, Su et al. (2021)), 没有用 ALiBi (Press et al., 2021). 为了改进 Transformer 的 FFN, 我们选用带 GeLU (Hendrycks & Gimpel, 2016) 激活的 GLU 作为替换.

## 2.2 GLM-130B’S PRE-TRAINING SETUP GLM-130B 的预训练设置

Inspired by recent works (Aribandi et al., 2022; Wei et al., 2022a; Sanh et al., 2022), the GLM-130B pre-training objective includes not only the self-supervised GLM autoregressive blank infilling) but also multi-task learning for a small portion of tokens. This is expected to help boost its downstream zero-shot performance.

受近期工作 (Aribandi et al., 2022; Wei et al., 2022a; Sanh et al., 2022) 启发, GLM-130B 的预训练目标不仅包括自监督的 GLM 自回归空白填充, 还在一小部分 token 上做多任务学习. 预期这能帮助提升它的下游零样本性能.

**Self-Supervised Blank Infilling (95% tokens).** Recall that GLM-130B uses both [MASK] and [gMASK] for this task. Each training sequence is applied with one of them independently at a time. Specifically, [MASK] is used to mask consecutive spans in 30% of training sequences for blank infilling. The lengths of spans follow a Poisson distribution (λ = 3) and add up to 15% of the input. For the other 70% sequences, the prefix of each sequence is kept as context and [gMASK] is used to mask the rest of it. The masked length is sampled from the Uniform distribution.

**自监督空白填充 (占 95% 的 token).** 前面说过, GLM-130B 在这个任务里同时使用 [MASK] 和 [gMASK]. 每条训练序列每次独立地只用其中一种. 具体地, 30% 的训练序列用 [MASK] 遮住若干连续片段做空白填充; 片段长度服从泊松分布 (λ = 3), 加起来占输入的 15%. 另外 70% 的序列保留前缀作为上下文, 用 [gMASK] 遮住其余部分; 被遮住的长度从均匀分布中采样.

The pre-training data includes 1.2T Pile (train split) (Gao et al., 2020) English, 1.0T Chinese Wudao-Corpora (Yuan et al., 2021), and 250G Chinese corpora (including online forums, encyclopedia, and QA) we crawl from the web, which form a balanced composition of English and Chinese contents.

预训练数据包括 1.2T 的英文 Pile (训练集部分) (Gao et al., 2020), 1.0T 的中文悟道语料 (WuDaoCorpora, Yuan et al., 2021), 以及我们从网上爬取的 250G 中文语料 (包括网络论坛, 百科和问答), 中英文内容的构成比较均衡.

**Multi-Task Instruction Pre-Training (MIP, 5% tokens).** T5 (Raffel et al., 2020) and ExT5 (Aribandi et al., 2022) suggest that multi-task learning in pre-training can be more helpful than fine-tuning, we thus propose to include a variety of instruction prompted datasets including language understanding, generation, and information extraction in GLM-130B’s pre-training.

**多任务指令预训练 (MIP, 占 5% 的 token).** T5 (Raffel et al., 2020) 和 ExT5 (Aribandi et al., 2022) 表明, 在预训练阶段做多任务学习可能比微调更有帮助. 因此我们提出在 GLM-130B 的预训练中加入多种带指令提示的数据集, 覆盖语言理解, 生成和信息抽取.

Compared to recent works (Wei et al., 2022a; Sanh et al., 2022) that leverage multi-task prompted fine-tuning to improve zero-shot task transfer, MIP only accounts for 5% tokens and is set in the pre-training stage to prevent spoiling LLMs’ other general ability, e.g., unconditional free generation. Specifically, we include 74 prompted datasets from (Sanh et al., 2022; Wang et al., 2022a), listed in Appendix C and Table 12. GLM-130B users are suggested to avoid evaluating its zero-shot and few-shot capabilities on these datasets according to the criterion illustrated in Section 5.

近期一些工作 (Wei et al., 2022a; Sanh et al., 2022) 用多任务提示微调来改善零样本任务迁移; 与它们相比, MIP 只占 5% 的 token, 并且放在预训练阶段, 以免损害 LLM 的其他通用能力, 例如无条件的自由生成. 具体地, 我们纳入了来自 (Sanh et al., 2022; Wang et al., 2022a) 的 74 个提示数据集, 列在附录 C 和表 12 中. 建议 GLM-130B 的使用者按第 5 节给出的准则, 避免在这些数据集上评测它的零样本和少样本能力.

## 2.3 PLATFORM-AWARE PARALLEL STRATEGIES AND MODEL CONFIGURATIONS 面向平台的并行策略与模型配置

GLM-130B is trained on a cluster of 96 DGX-A100 GPU (8×40G) servers with a 60-day access. The goal is to pass through as many tokens as possible, as a recent study (Hoffmann et al., 2022) suggests that most existing LLMs are largely under-trained.

GLM-130B 在一个由 96 台 DGX-A100 GPU (8×40G) 服务器组成的集群上训练, 使用期是 60 天. 目标是让模型过尽可能多的 token, 因为近期研究 (Hoffmann et al., 2022) 表明, 现有 LLM 大多训练得远远不够.

**The 3D Parallel Strategy.** The data parallelism (Valiant, 1990) and tensor model parallelism (Shoeybi et al., 2019) are the de facto practices for training billion-scale models (Wang & Komatsuzaki, 2021; Du et al., 2022). To further handle the huge GPU memory requirement and the decrease in overall GPU utilization resulted from applying tensor parallel between nodes—as 40G rather than 80G A100s are used for training GLM-130B, we combine the pipeline model parallelism with the other two strategies to form a 3D parallel strategy.

**3D 并行策略.** 数据并行 (Valiant, 1990) 和张量模型并行 (Shoeybi et al., 2019) 是训练数十亿参数模型的事实标准做法 (Wang & Komatsuzaki, 2021; Du et al., 2022). 训练 GLM-130B 用的是 40G 而不是 80G 的 A100, 显存需求巨大, 而且在节点之间做张量并行会拉低整体 GPU 利用率; 为了应对这两点, 我们把流水线模型并行和另外两种策略结合起来, 构成 3D 并行策略.

The pipeline parallelism divides the model into sequential stages for each parallel group, and to further minimize bubbles introduced by pipeline, we leverage the PipeDream-Flush (Narayanan et al., 2021) implementation from DeepSpeed (Rasley et al., 2020) to train GLM-130B with a relative

(这句跨到下一页, 译文放在下一页该段结尾.)

<!-- page 5 of 56 -->

big global batch size (4,224) to reduce time and GPU memory wasting. Through both numerical and empirical examinations, we adopt 4-way tensor parallelism and 8-way pipeline parallelism (Cf. Appendix B.4 for details). Following the calculation in (Chowdhery et al., 2022), we report hardware FLOPs utilization (HFU) of 43.3% and model FLOPs utilization (MFU) of 32.5% due to re-materialization.

流水线并行把模型按顺序切成若干阶段, 分给每个并行组. 为了进一步减少流水线带来的气泡, 我们用 DeepSpeed (Rasley et al., 2020) 里的 PipeDream-Flush (Narayanan et al., 2021) 实现来训练 GLM-130B, 并使用较大的全局 batch size (4224), 以减少时间和显存的浪费. 经过数值分析和实验检验, 我们采用 4 路张量并行和 8 路流水线并行 (细节见附录 B.4). 按 (Chowdhery et al., 2022) 的算法, 我们报告的硬件 FLOPs 利用率 (HFU) 是 43.3%; 由于重计算 (re-materialization), 模型 FLOPs 利用率 (MFU) 是 32.5%.

**GLM-130B Configurations.** We aim to enable our 100B-scale LLM to run a single DGX-A100 (40G) node in FP16 precision. Based on the hidden state dimension of 12,288 we adopt from GPT-3, the resultant model size has to be no more than 130B parameters, thus GLM-130B. To maximize GPU utilization, we configure the model based on the platform and its corresponding parallel strategy. To avoid insufficient memory utilization in the middle stages due to the additional word embedding at both ends, we balance the pipeline partition by removing one layer from them, making 9×8-2=70 transformer layers in GLM-130B.

**GLM-130B 的配置.** 我们的目标是让这个千亿级 LLM 能以 FP16 精度跑在单个 DGX-A100 (40G) 节点上. 在沿用 GPT-3 的 12288 隐藏维度的前提下, 模型规模不能超过 1300 亿参数, 于是有了 GLM-130B. 为了最大化 GPU 利用率, 我们根据平台和对应的并行策略来配置模型. 流水线两端各多一份词嵌入, 会让中间阶段的显存利用不足; 为了避免这一点, 我们从两端各去掉一层来平衡流水线划分, 于是 GLM-130B 有 9×8-2=70 个 transformer 层.

During the 60-day access to the cluster, we manage to train GLM-130B for 400 billion tokens (roughly 200 billion each for Chinese and English) with a fixed sequence length of 2,048 per sample. For the [gMASK] training objective, we use a context window of 2,048 tokens. For the [MASK] and multi-task objectives, we use a context window of 512 and concatenate four samples together to cater the 2,048-sequence-length. We warm-up the batch size from 192 to 4224 over the first 2.5% samples. We use AdamW (Loshchilov & Hutter, 2019) as our optimizer with $\beta _ { 1 }$ and $\beta _ { 2 }$ set to 0.9 and 0.95, and a weight decay value of 0.1. We warm up the learning rate from $1 0 ^ { - 7 } \; \mathrm { t o } \; 8 \times 1 0 ^ { - 5 }$ over the first 0.5% samples, then decay it by a 10× cosine schedule. We use a dropout rate of 0.1 and clip gradients using a clipping value of 1.0 (Cf. Table 11 for the full configurations).

在 60 天的集群使用期内, 我们把 GLM-130B 训练了 4000 亿 token (中英文各约 2000 亿), 每个样本的序列长度固定为 2048. 对 [gMASK] 训练目标, 上下文窗口是 2048 个 token. 对 [MASK] 和多任务目标, 上下文窗口是 512, 把四个样本拼接起来凑成 2048 的序列长度. 在前 2.5% 的样本里, batch size 从 192 逐步升到 4224. 优化器用 AdamW (Loshchilov & Hutter, 2019), β1 和 β2 设为 0.9 和 0.95, weight decay 为 0.1. 学习率在前 0.5% 的样本里从 10^-7 预热到 8×10^-5, 然后按 10 倍的余弦调度衰减. dropout 率为 0.1, 梯度裁剪值为 1.0 (完整配置见表 11).

## 3 THE TRAINING STABILITY OF GLM-130B GLM-130B 的训练稳定性

The training stability is the decisive factor in GLM-130B’s quality, which is also largely impacted by the number of tokens it passes through (Hoffmann et al., 2022). Thus, given the computing usage constraint, there has to be a trade-off between efficiency and stability with regard to floatingpoint (FP) formats: low-precision FP formats (e.g., 16-bit precision—FP16) improve computing efficiency but are prone to overflow and underflow errors, resulting in training collapses.

训练稳定性是决定 GLM-130B 质量的关键因素, 质量也在很大程度上取决于它过了多少 token (Hoffmann et al., 2022). 因此, 在算力用量受限的条件下, 浮点 (FP) 格式必须在效率和稳定性之间取舍: 低精度 FP 格式 (例如 16 位精度的 FP16) 提高计算效率, 但容易上溢和下溢, 导致训练崩溃.

**Mixed-Precision.** We follow the common practice of a mixedprecision (Micikevicius et al., 2018) strategy (Apex O2), i.e., FP16 for forwards and backwards and FP32 for optimizer states and master weights, to reduce the GPU memory usage and improve training efficiency. Similar to OPT-175B and BLOOM-176B (C.f. Figure 10 in Appendix), the training of GLM-130B faces frequent loss spikes resulted from this choice, which tends to become increasingly frequent as the training goes on. The precision related spikes are often without clear reasons: some recover on their own; others come with a portent of suddenly soaring gradient norm and eventually a spike or even NaN in loss. OPT-175B attempted to fix by manually skipping data and adjusting hyper-parameters; BLOOM-176B did so via the embedding norm technique (Dettmers et al., 2021). We spent months to empirically investigate the spikes and realize that a few issues emerge when transformers scale up:

**混合精度.** 我们沿用常见的混合精度 (Micikevicius et al., 2018) 策略 (Apex O2), 即前向和反向用 FP16, 优化器状态和主权重用 FP32, 以减少显存占用, 提高训练效率. 和 OPT-175B, BLOOM-176B 类似 (见附录图 10), 这个选择让 GLM-130B 的训练频繁出现 loss 尖峰, 而且训练越往后越频繁. 这类和精度相关的尖峰往往没有明确原因: 有的会自己恢复; 有的先有预兆, 梯度范数突然飙升, 最后 loss 出现尖峰甚至变成 NaN. OPT-175B 试图靠手动跳过数据和调整超参数来解决; BLOOM-176B 则用 embedding norm 技术 (Dettmers et al., 2021). 我们花了几个月实验研究这些尖峰, 认识到 transformer 规模变大时会出现几个问题:

First, the transformer main branch’s value scale can be extremely large in deeper layers if using Pre-LN. This is addressed in GLM-130B by using DeepNorm based Post-LN (Cf. Section 2.1), which makes the value scale always bounded.

第一, 如果用 Pre-LN, transformer 主干的数值尺度在较深的层里可能变得非常大. GLM-130B 用基于 DeepNorm 的 Post-LN (见 2.1 节) 解决这一点, 它让数值尺度始终有界.

![Chart block](images/p05-a-gradient-norm-with-egs-0-1.png)

(a) Gradient norm with EGS α = 0.1

(a) 使用 EGS (α = 0.1) 时的梯度范数.

(图: 纵轴 Gradient Norm 0 到 1.5, 横轴步数 0 到 8000. 四条线: 深红 Embedding layer, 深绿 Transformer layer, 浅红 Embedding layer (α=0.1), 浅绿 Transformer layer 0 (α=0.1). 两条嵌入层曲线在最初几百步冲到 1.5 以上, 之后在 0.2 到 0.7 之间剧烈抖动并缓慢下降, 浅红线整体略低于深红线; 两条 transformer 层曲线一直贴在 0.05 附近.)

![Chart block](images/p05-figure-4-egs-reduces-gradient-scale-and-variance-to.png)

Figure 4: EGS reduces gradient scale and variance to stabilize LLMs’ pre-training.

(b) 40B 规模测试中的 EGS (这行子图标题印在图片里).

图 4: EGS 降低梯度的尺度和方差, 从而稳定 LLM 的预训练.

(图: 纵轴 Pre-training loss 4 到 9.5, 横轴步数 0 到 6000. 蓝线 w/o shrink (GLM-40B) 在约 2100 步处出现一次冲到 8 以上的尖峰, 随后回落; 在约 4900 步处跳到 6.7 左右不再回来. 黄线 shrink α=0.1 (GLM-40B) 一路平稳下降到 3.8 左右.)

> **确认:** 图 4 (b) 证明 EGS 有效, 可这张图是在多大的模型上做的?
> 是 400 亿参数的 GLM-40B, 不是 GLM-130B. 图例写的是 「w/o shrink (GLM-40B)」 和 「shrink α=0.1 (GLM-40B)」, 子图标题是 「EGS in 40B-scale testing」. 图 4 (a) 没标模型规模. 在 130B 上的证据来自文字: 第 6 页说最终训练只遇到三次后期发散, 第 23 页图 10 (d) 给了 GLM-130B 真实训练的 loss 曲线, 表 11 的 shrink_embedding_gradient_alpha 是 0.1. 130B 上带不带 EGS 的对照曲线, 论文里没有.

Second, the attention scores grow so large that they exceed FP16’s

range, as the model scales up. There are a few options to overcome this issue in LLMs. In CogView (Ding et al., 2021), PB-Relax is proposed to remove bias terms and deduct extremum value in attention computation to avoid the problem, which unfortunately does not help avoid disconvergence in GLM-130B. In BLOOM-176B, the BF16 format is used instead of FP16, due to its wide range of values on NVIDIA Ampere GPUs (i.e., A100). However, BF16 consumes ∼15% more run-time GPU memory than FP16 in our experiments due to its conversion to FP32 in gradi-

(本段跨到下一页, 整段译文放在下一页.)

<!-- page 6 of 56 -->

ent accumulation, and more importantly it is not supported on other GPU platforms (e.g., NVIDIA Tesla V100), limiting the accessibility of produced LLMs. Another option from BLOOM-176B is to apply embedding norm with BF16, but in sacrifice of a significant penalty on model performance, as they notice that embedding norm can harm model’s zero-shot learning (Cf. Section 4.3 in (Scao et al., 2022)).

第二, 随着模型规模变大, 注意力分数会大到超出 FP16 的表示范围. LLM 里有几种办法应对这个问题. CogView (Ding et al., 2021) 提出了 PB-Relax, 去掉偏置项, 并在注意力计算中减去极值来避免这个问题, 可惜它没能帮 GLM-130B 避免不收敛. BLOOM-176B 用 BF16 代替 FP16, 因为 BF16 在 NVIDIA Ampere GPU (即 A100) 上数值范围宽. 但在我们的实验里, BF16 在梯度累积时要转成 FP32, 运行时显存比 FP16 多约 15%; 更重要的是, 其他 GPU 平台 (例如 NVIDIA Tesla V100) 不支持 BF16, 这会限制训练出来的 LLM 的可用性. BLOOM-176B 的另一个办法是在 BF16 上加 embedding norm, 但代价是模型性能明显受损, 他们注意到 embedding norm 会伤害模型的零样本学习 (见 (Scao et al., 2022) 的 4.3 节).

**Embedding Layer Gradient Shrink (EGS).** Our empirical search identifies that the gradient norm can serve as an informative indicator of training collapses. Specifically, we find that a training collapse usually lags behind a “spike” in gradient norm by a few training steps. Such spikes are usually caused by the embedding layer’s abnormal gradients, as we observe that its gradient norm is often several magnitude larger that those of other layers in GLM-130B’s early stage training (Cf. Figure 4 (a)). In addition, it tends to fluctuate dramatically in the early training. The problem is handled in vision models (Chen et al., 2021) via freezing the patch projection layer. Unfortunately, we cannot freeze the training of the embedding layer in language models.

**嵌入层梯度收缩 (EGS).** 实验搜索发现, 梯度范数可以作为训练崩溃的一个有用指标. 具体地, 训练崩溃通常比梯度范数的 「尖峰」 晚几步出现. 这类尖峰通常由嵌入层的异常梯度引起: 我们观察到, 在 GLM-130B 训练早期, 嵌入层的梯度范数常常比其他层大几个数量级 (见图 4 (a)), 而且在训练早期剧烈波动. 视觉模型 (Chen et al., 2021) 通过冻结 patch 投影层来处理这个问题. 可惜语言模型的嵌入层不能冻结不训.

Finally, we find the gradient shrink on embedding layers could overcome loss spikes and thus stabilize GLM-130B’s training. It is first used in the multi-modal transformer CogView (Ding et al., 2021). Let α be the shrinking factor, the strategy can be easily implemented via word\_embedding = word\_embedding ∗ α + word\_embedding.detach() ∗ (1 − α). Figure 4 (b) suggests that empirically, setting α = 0.1 wipes out most spikes we would have met, with negligible latency.

最终我们发现, 对嵌入层做梯度收缩能克服 loss 尖峰, 从而稳定 GLM-130B 的训练. 这个方法最早用在多模态 transformer CogView (Ding et al., 2021) 里. 设 α 为收缩因子, 这个策略很容易实现: word_embedding = word_embedding ∗ α + word_embedding.detach() ∗ (1 − α). 图 4 (b) 表明, 实验上把 α 设为 0.1 能消除我们本会遇到的大部分尖峰, 带来的延迟可以忽略.

In fact, the final GLM-130B training run only experiences three late-stage loss divergence cases, though it fails numerous times due to hardware failures. For the three unexpected spikes, it turns out further shrinking the embedding gradient can still help stabilize the GLM-130B training. See the training notes and Tensorboard logs in our code repository for details.

实际上, 虽然因为硬件故障失败了无数次, GLM-130B 的最终训练只遇到了三次后期 loss 发散. 对这三次意外尖峰, 结果表明进一步收缩嵌入层梯度仍然有助于稳定 GLM-130B 的训练. 详情见代码仓库里的训练笔记和 Tensorboard 日志.

> **核对:** 这里说 α = 0.1 消除了大部分尖峰, 后期三次尖峰靠 「进一步收缩」 解决. 最终训练是不是一开始就用 α = 0.1?
> 论文前后说法不完全一致. 第 54 页图 21 时间线 2022.5-6 一条写的是: 训练后期遇到少数尖峰, 处理办法之一是 「把梯度收缩因子从 1 降到 0.1: 有用」. α = 1 等于不收缩, 照这条读, 最终训练的前段可能没开 EGS, 是后期才降到 0.1 的. 可本页又说后期是在 0.1 基础上 「further shrinking」. 第 48 页表 11 只给了最终值 shrink_embedding_gradient_alpha = 0.1, 看不出过程. 论文没有把这两处对齐, 能确定的只有终态是 0.1.

> **再看:** 第二个问题是注意力分数超出 FP16 范围, 文中列了 PB-Relax, BF16, embedding norm 三个办法都不行, 最后 GLM-130B 用什么解决了这个问题?
> 正文第 3 节没有直接说. 答案在附录: 第 54 页时间线 2022.5-6 写着 「Sandwich-LN 仍然不收敛, 换成 DeepNorm 仍然不收敛」, 下一条是 「在注意力的 softmax 里用 FP32 => 成功」, 再下一条说 FP32 softmax 下 PB-Relax 没必要, 还拖慢训练. 第 48 页表 11 也有 attention_softmax_in_fp32 = True. 所以稳定住 GLM-130B 的是三件事一起: DeepNorm 管主干数值尺度, softmax 用 FP32 管注意力分数溢出, EGS 管嵌入层梯度尖峰. 摘要和第 3 节只突出了 EGS.

## 4 GLM-130B INFERENCE ON RTX 2080 TI 在 RTX 2080 Ti 上推理 GLM-130B

One of the major goals of GLM-130B is to lower the hardware requirements for accessing 100Bscale LLMs without efficiency and effectiveness disadvantages.

GLM-130B 的主要目标之一, 是在效率和效果都不吃亏的前提下, 降低使用千亿级 LLM 的硬件门槛.

As mentioned, the model size of 130B is determined for running the full GLM-130B model on a single A100 (40G×8) server, rather than the high-end A100 (80G×8) machine required by OPT-175B and BLOOM-176B. To accelerate GLM-130B inference, we also leverage FasterTransformer (Timonin et al., 2022) to implement GLM-130B in C++. Compared to the PyTorch implementation of BLOOM-176B in Huggingface, GLM-130B’s decoding inference is 7-8.4× faster on the same single A100 server. (Cf. Appendix B.5 for details).

前面说过, 1300 亿这个模型规模, 是为了让完整的 GLM-130B 能在单台 A100 (40G×8) 服务器上运行而定的, 而 OPT-175B 和 BLOOM-176B 需要高端的 A100 (80G×8) 机器. 为了加速 GLM-130B 的推理, 我们还借助 FasterTransformer (Timonin et al., 2022) 用 C++ 实现了 GLM-130B. 在同一台 A100 服务器上, 和 Huggingface 里 BLOOM-176B 的 PyTorch 实现相比, GLM-130B 的解码推理快 7 到 8.4 倍 (细节见附录 B.5).

**INT4 Quantization for RTX 3090s/2080s.** To further support popularized GPUs, we attempt to compress GLM-130B as much as possible while maintaining performance superiority, particularly via quantization (Zafrir et al., 2019; Shen et al., 2020; Tao et al., 2022), which introduces little task-agnostic performance drops for generative language models.

**面向 RTX 3090 / 2080 的 INT4 量化.** 为了进一步支持普及型 GPU, 我们尝试在保持性能优势的同时尽量压缩 GLM-130B, 主要手段是量化 (Zafrir et al., 2019; Shen et al., 2020; Tao et al., 2022). 对生成式语言模型, 量化带来的与任务无关的性能下降很小.

Typically, the practice is to quantize both model weights and activations to INT8. However, our analysis in Appendix B.6 suggests that LLMs’ activations may contain extreme outliers. Concurrently, the emergent outliers in OPT-175B and BLOOM-176B are also discovered (Dettmers et al., 2022), which influence only about 0.1% feature dimensions and are thus solved by matrix multiplication decomposition for the outlying dimensions. Differently, there exist about 30% outliers in GLM-130B’s activations, making the technique above far less efficient. Thus, we decide to focus on the quantization of model weights (i.e., mostly linear layers) while keeping the FP16 precision f i i . Th i d d l i d i ll converted to FP16 precision at runtime, in- or act vat ons e quant ze mo e s ynam ca y t d i ll t ti l h d b t tl reducing the GPU memory usage for storing ro uc ng a sma compu a ona over ea u grea y model weights.

常规做法是把模型权重和激活都量化到 INT8. 但附录 B.6 的分析表明, LLM 的激活可能含有极端离群值. 同期工作 (Dettmers et al., 2022) 也在 OPT-175B 和 BLOOM-176B 中发现了涌现的离群值, 它们只影响约 0.1% 的特征维度, 所以可以对离群维度做矩阵乘法分解来处理. 不同的是, GLM-130B 的激活里约有 30% 是离群值, 上面的技术效率就低得多. 因此我们决定只量化模型权重 (主要是线性层), 激活保持 FP16 精度. 量化后的模型在运行时动态地转回 FP16 精度, 引入少量计算开销, 但大大减少了存放模型权重所需的显存. (源 md 这一段后半截被两栏文字交错抽乱了, 译文按 PDF 原句.)

> **对一下:** 这里说 GLM-130B 做到了 INT4, 而 OPT 和 BLOOM 只做到 INT8. 两边的 「INT4」 和 「INT8」 是同一种量化吗?
> 不是. 本页说得很清楚, OPT 和 BLOOM 的 INT8 走的是 Dettmers et al. (2022) 的路子, 权重和激活都量化, 离群维度用矩阵乘法分解单独算高精度; GLM-130B 的 INT4 只量化线性层的权重, 激活保持 FP16, 运行时把权重反量化回 FP16 再算 (第 28 页 B.8 也这么写). 所以 INT4 是权重的存储格式, 计算仍是 FP16 矩阵乘. 显存上的优势是实打实的, 权重占用减半再减半; 但它和 W8A8 式的 INT8 不在同一条线上比, 「只能做到 INT8」 这句比较的是能否不掉点地压缩权重, 不是同一种量化方案的位宽.

![Chart block](images/p06-chart.png)

![Chart block](images/p06-figure-5-left-attn-dense-and-mathrm-w-2-circ-mathrm-s.png)

Figure 5: (Left) attn-dense and $\mathrm { w } 2   ^ { \circ } \mathrm { s }$ weight distributions; (Right) GLM-130B’s INT4 weight quantization scaling law.

图 5: (左) attn-dense 和 w2 的权重分布; (右) GLM-130B 的 INT4 权重量化规模定律. (源 md 把 「w2's」 抽成了一串公式符号.)

(图: 左图是 2×2 的直方图, 纵轴对数刻度. 上排标 「Attn-dense: Layer 0 & 1」, 下排标 「w2: Layer 0 & 1」; 橙色 GLM-130B 的分布窄而高, 集中在 0 附近, 蓝色 BLOOM-176B 的分布宽得多, w2 的蓝色尾巴伸到 -2 附近. 右图纵轴 LAMBADA (0-shot), 横轴 Effective Parameter Count (10^8 到 10^11, 对数). 四条线: GLM 16-bit (橙圆点虚线) 从约 29 升到约 80; GLM INT4 (橙星) 在 10^8 处只有 3 左右, 到 10^9 以上几乎和 16-bit 重合; BLOOM 16-bit (蓝圆点) 从约 31 升到约 64; BLOOM INT4 (蓝星) 从约 12 升到约 48, 和 16-bit 的差距没有缩小.)

<!-- page 7 of 56 -->

Table 2: Left: Quantized GLM-130B’s performance on several benchmarks; Right: INT4 quantized GLM-130B’s inference speed (encode and decode) with FasterTransformer.

<table><tr><td rowspan="2">Model Precision</td><td colspan="3">GLM-130B</td><td>GPT-3</td></tr><tr><td>FP16</td><td>INT8</td><td>INT4</td><td>FP16</td></tr><tr><td>MMLU (acc, ↑)</td><td>44.75</td><td>44.71</td><td>44.80</td><td>43.9</td></tr><tr><td>LAMBADA (acc, ↑)</td><td>80.21</td><td>80.21</td><td>79.47</td><td>76.2</td></tr><tr><td>Pile (a part, BPB, ↓)</td><td>0.634</td><td>0.638</td><td>0.641</td><td>0.74</td></tr></table>

| GPU Type | 128 Enc./Dec. 512 En | c./Dec, |
| --- | --- | --- |
| 8 × A100 (40G) | 0.15s 4.29s 0.18s | 17.7s |
| 8 × V100 (32G) | 0.31s 6.97s 0.67s | 28.1s |
| 4 × RTX 3090 (24G) | 0.37s 8.16s 1.30s | 32.3s |
| 8 × RTX 2080 Ti (11G | ) 0.39s 6.77s 1.04s | 27.3s |

表 2: 左: 量化后的 GLM-130B 在几个基准上的表现; 右: 用 FasterTransformer 运行 INT4 量化的 GLM-130B 时的推理速度 (编码和解码).

| 精度 | GLM-130B FP16 | GLM-130B INT8 | GLM-130B INT4 | GPT-3 FP16 |
| --- | --- | --- | --- | --- |
| MMLU (准确率, 越高越好) | 44.75 | 44.71 | 44.80 | 43.9 |
| LAMBADA (准确率, 越高越好) | 80.21 | 80.21 | 79.47 | 76.2 |
| Pile (部分子集, BPB, 越低越好) | 0.634 | 0.638 | 0.641 | 0.74 |

| GPU 配置 | 128 token 编码 | 128 token 解码 | 512 token 编码 | 512 token 解码 |
| --- | --- | --- | --- | --- |
| 8 × A100 (40G) | 0.15s | 4.29s | 0.18s | 17.7s |
| 8 × V100 (32G) | 0.31s | 6.97s | 0.67s | 28.1s |
| 4 × RTX 3090 (24G) | 0.37s | 8.16s | 1.30s | 32.3s |
| 8 × RTX 2080 Ti (11G) | 0.39s | 6.77s | 1.04s | 27.3s |

(右表在源 md 里列被切歪了, 上面按 PDF 的数字顺序重排. 8 张 2080 Ti 的解码比 4 张 3090 还快一点.)

Excitingly, we manage to reach the INT4 weight quantization for GLM-130B while existing successes have thus far only come to the INT8. Memory-wise, by comparing to INT8, the INT4 version helps additionally save half of the required GPU memory to 70GB, thus allowing GLM-130B inference on 4 × RTX 3090 Ti (24G) or 8 × RTX 2080 Ti (11G). Performance-wise, Table 2 left indicates that without post-training at all, the INT4-version GLM-130B experiences almost no performance degradation, thus maintaining the performance advantages over GPT-3 on common benchmarks.

令人振奋的是, 我们为 GLM-130B 做到了 INT4 权重量化, 而此前成功的例子都只到 INT8. 显存方面, 和 INT8 相比, INT4 版本又把所需显存省掉一半, 降到 70GB, 于是 GLM-130B 可以在 4 × RTX 3090 Ti (24G) 或 8 × RTX 2080 Ti (11G) 上推理. 性能方面, 表 2 左表明, 完全不做后训练, INT4 版 GLM-130B 的性能也几乎没有下降, 因此在常见基准上保持了对 GPT-3 的优势.

> **问:** 「完全不做后训练」 是真的吗? 量化之后有没有校准, 微调之类的步骤?
> 按论文的描述, 没有. 第 28 页 B.8 交代了做法: 只量化占参数大头的线性层, 输入/输出嵌入, 层归一化和偏置项保持不变; 用 absmax 对称量化, 两个 INT4 权重压进一个 INT8 存; 推理时显存里只放量化后的权重, 线性层的 FP16 权重在运行时反量化. absmax 的缩放因子只由权重本身的最大绝对值算出 (第 28 页式 7, 8), 不需要校准数据, 也没有提到量化感知训练或量化后微调. 第 29 页表 10 里 GLM-130B 的 「Absmax INT4, row-wise」 是 79.47%, 正好等于表 2 的 INT4 LAMBADA, 说明表 2 用的就是这种逐行 absmax. 第 53 到 55 页附录 F 又说了一遍 「INT4 version ... without post training」. 显存也对得上: 130B 个参数每个 0.5 字节约 65GB, 加上保留为 FP16 的嵌入等部分, 约 70GB, 是 FP16 版 260GB 的四分之一左右, 附录 F 写的正是 「只占未压缩版本 25% 的显存」.

**GLM’s INT4 Weight Quantization Scaling Law.** We examine the underlying mechanism of this unique INT4 weight quantization scaling law exhibited in Figure 5 right. We plot the weight value distributions in Figure 5 left, which turns out to directly impact the quantization quality. Specifically, a wider-distributed linear layer needs to be quantized with larger bins, leading to more precision loss. Thus the wide-distributed attn-dense and w2 matrices explain the INT4 quantization failure for GPT-style BLOOM. Conversely, GLMs tend to have much narrower distributions than those of similar-sized GPTs, and the gap between INT4 and FP16 versions keeps further decreasing as the GLM model size scales up (Cf. Figure 15 in Appendix for details).

**GLM 的 INT4 权重量化规模定律.** 我们考察图 5 右展示的这一独特的 INT4 权重量化规模定律背后的机制. 我们在图 5 左画出了权重值的分布, 结果发现它直接影响量化质量. 具体地, 分布越宽的线性层, 量化时需要越大的区间, 精度损失也就越大. 因此, 分布很宽的 attn-dense 和 w2 矩阵解释了 GPT 式的 BLOOM 为什么 INT4 量化失败. 相反, GLM 的分布往往比同尺寸 GPT 的窄得多, 而且随着 GLM 模型规模增大, INT4 和 FP16 版本之间的差距还在继续缩小 (细节见附录图 15).

> **看表:** 图 5 右的 GLM INT4 和 BLOOM INT4 两条线, 用的是同一种量化设置吗?
> 不是. 拿第 29 页表 10 逐点对: GLM INT4 那条线是 3.26, 38.25, 62.62, 71.03, 79.47, 对应 「Absmax INT4, row-wise」; BLOOM INT4 那条线是 11.51, 26.51, 41.65, 46.63, 48.26, 对应 「Zeropoint INT4, col-wise」. 而表 10 里 BLOOM 的逐行量化在小模型上更好 (560M: absmax 逐行 21.37, zeropoint 逐行 24.95, 都高于 11.51), 只是在 176B 上逐行量化得到 NaN. 另外第 28 页 B.8.1 承认 110M 到 10B 的 GLM 来自原始 GLM 论文, 架构和 GLM-130B 不同. 所以这张 「规模定律」 图比的是两个家族各自挑出来的一种设置, 不是同一设置下的对照; 趋势本身 (GLM 越大 INT4 越接近 FP16) 在表 10 的 GLM 行里是成立的.

## 5 THE RESULTS 结果

We follow the common settings in LLMs such as GPT-3 and PaLM to evaluate GLM-130B for English <sup>1</sup>. As a bilingual LLM with Chinese, GLM-130B is also evaluated on Chinese benchmarks.

我们沿用 GPT-3 和 PaLM 等 LLM 的常见设置来评测 GLM-130B 的英文能力 (脚注 1). 作为包含中文的双语 LLM, GLM-130B 也在中文基准上接受评测.

**Discussion on the Scope of Zero-Shot Learning in GLM-130B.** Since GLM-130B has been trained with MIP, here we clarify its scope of zero-shot evaluation. In fact, “zero-shot” seems to have controversial interpretations without a consensus in the community. We follow one of the influential related surveys (Xian et al., 2018), which says “At test time, in zero-shot learning setting, the aim is to assign a test image to an unseen class label” where involving unseen class labels is a key. Therefore, we derive our criterion to pick GLM-130B’s zero-shot (and few-shot) datasets as:

**关于 GLM-130B 零样本学习范围的讨论.** 由于 GLM-130B 训练时用过 MIP, 这里说明它的零样本评测范围. 实际上, 「零样本」 在社区里似乎有争议, 没有共识. 我们采用一篇有影响力的相关综述 (Xian et al., 2018) 的说法: 「在零样本学习设定下, 评测阶段的目标是把一张测试图像分到一个没见过的类别标签上」, 关键在于涉及没见过的类别标签. 据此, 我们给出挑选 GLM-130B 零样本 (及少样本) 数据集的准则:

• **English**: 1) For tasks with fixed labels (e.g., natural language inference): no datasets in such tasks should be evaluated on; 2) For tasks without fixed labels (e.g., (multiple-choice) QA, topic classification): only datasets with an obvious domain transfer from those in MIP should be considered.

• **Chinese**: All datasets can be evaluated as there exists a zero-shot cross-lingual transfer.

- **英文**: 1) 对标签固定的任务 (例如自然语言推理), 这类任务里的数据集都不评测; 2) 对标签不固定的任务 (例如 (多选) 问答, 主题分类), 只考虑与 MIP 中的数据集有明显领域迁移的数据集.
- **中文**: 所有数据集都可以评测, 因为这里存在零样本的跨语言迁移.

**Filtering Test Datasets.** Following prior practices (Brown et al., 2020; Rae et al., 2021) and our criterion mentioned above, we filter and refrain to report potentially contaminated datasets’ evaluation results. For LAMBADA and CLUE, we find minimal overlap under the 13-gram setting. Pile, MMLU, and BIG-bench are either held-out or released later than the crawling of corpora.

**过滤测试数据集.** 按照已有做法 (Brown et al., 2020; Rae et al., 2021) 和上面的准则, 我们过滤掉可能被污染的数据集, 不报告它们的评测结果. 在 13-gram 设定下, LAMBADA 和 CLUE 的重叠很少. Pile, MMLU 和 BIG-bench 要么是留出集, 要么发布时间晚于语料爬取时间.

> **停一下:** GLM-130B 的 「零样本」 和 GPT-3 的零样本, 是同一个意思吗?
> 不完全是. GPT-3 的零样本是预训练完直接用提示做题, 训练里没有指令数据. GLM-130B 预训练时混了 5% 的 MIP, 74 个带提示的数据集 (第 49 页表 12) 覆盖问答, 情感, 摘要, 共指, 自然语言推理等任务类型. 本页的准则只排除 「标签固定且 MIP 见过同类任务」 的数据集, 标签不固定的任务只要求有 「明显领域迁移」. 这个差别有多大, 附录自己给了一个例子: 第 44 页表 20, 6 个 MIP 没见过但同类任务见过的 NLI 数据集上, GLM-130B 的 mnli 是 85.7, BLOOM 是 35.5, OPT 是 36.0, 论文也加了免责声明说这 「不同于现有的标准零样本设定」. 所以读零样本对比表时, GLM-130B 这一列带着 MIP 的任务格式经验.

## 5.1 LANGUAGE MODELING 语言建模

**LAMBADA.** LAMBADA (Paperno et al., 2016) is a dataset to test the last word language modeling capability. The results previously shown in Figure 2 suggest GLM-130B achieves a zero-shot accuracy of 80.2 with its bidirectional attention, setting up a new record on LAMBADA.

**LAMBADA.** LAMBADA (Paperno et al., 2016) 是测试末词语言建模能力的数据集. 前面图 2 的结果表明, GLM-130B 借助双向注意力取得 80.2 的零样本准确率, 创下 LAMBADA 的新纪录.

**Pile.** The Pile test-set (Gao et al., 2020) includes a series of benchmarks for language modeling. On average, GLM-130B performs the best on its 18 shared test sets in terms of weighted BPB when compared to GPT-3 and Jurassic-1 (Lieber et al., 2021) whose results are directly adopted

**Pile.** Pile 测试集 (Gao et al., 2020) 包含一系列语言建模基准. 在 18 个共同测试集上按加权 BPB 平均, GLM-130B 的表现好于 GPT-3 和 Jurassic-1 (Lieber et al., 2021), 后两者的结果直接取自 Jurassic-1 的报告, 这说明了它很强的语言能力 (细节见附录 C.4). (源 md 这句只抽到 「directly adopted」, 后半句 「from the latter, demonstrating its strong language capability (Cf. Appendix C.4 for details)」 在 PDF 里, 被 MinerU 漏掉了.)

Table 3: GLM-130B’s average BPB on Pile evaluation (18 sub-datasets).

|  | Jurassic-1 | GPT-3 | GLM-130B |
| --- | --- | --- | --- |
| Avg. BPB | 0.650 | 0.742 | 0.634 |

表 3: GLM-130B 在 Pile 评测 (18 个子数据集) 上的平均 BPB.

| | Jurassic-1 | GPT-3 | GLM-130B |
| --- | --- | --- | --- |
| 平均 BPB | 0.650 | 0.742 | 0.634 |

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Results in OPT-175B’s paper are reported as applications to access it have not been approved for months.</span></small>

脚注 1: OPT-175B 的结果取自它的论文, 因为我们申请使用它, 几个月都没获批.

<!-- page 8 of 56 -->

![Chart block](images/p08-figure-6-glm-130b-on-mmlu-57-tasks-along-training-steps.png)

Figure 6: GLM-130B on MMLU (57 tasks) along training steps.

图 6: GLM-130B 在 MMLU (57 个任务) 上随训练步数的变化.

(图: 横轴 Trained Tokens (Billion), 从 60 到 400; 纵轴 30 到 46. 蓝线 GLM-130B (5-shot) 从 60B 处的约 30 一路上升, 在 160B 到 170B 间有一次跌到约 36 的回落, 290B 附近又跌到约 40, 之后在 300B 左右越过 43; 在 300B 到 400B 之间于 43 到 45.4 之间起伏, 最高点在约 385B, 终点约 44.8. 橙点 GPT-3 175B (5-shot) 在 300B 处, 值约 43.9; 绿点 BLOOM 176B (5-shot) 在约 365B 处, 值约 32.)

![Chart block](images/p08-0-shot-1-shot-3-shot.png)

| 0-shot | 1-shot 3-shot |
| --- | --- |
| GPT-3 2.6B 0.60 | 0.71 1.83 |
| GPT-3 6.7B -0.06 | 2.93 5.40 |
| GPT-3 13B 1.77 | 5.43 7.95 |
| GPT-3 175B 4.35 | 11.34 13.18 |
| PaLM 540B 8.05 | 37.77 - |
| GLM-130B 13.31 | 14.91 15.12 |

Figure 7: BIG-bench-lite evalua- Table 4: Details on BIG-tion (24 tasks) across scales. bench-lite (24 tasks).

图 7: BIG-bench-lite (24 个任务) 在不同规模上的评测. 表 4: BIG-bench-lite (24 个任务) 的细节. (源 md 把并排的两个标题交错抽成了一行.)

(图: 横轴 Effective Parameter Count (10^8 到约 5×10^11, 对数), 纵轴 0 到 16. GPT-3 三条虚线: 0-shot (橙) 最低, 175B 处约 4.35; 1-shot (绿) 到 11.3; 3-shot (红) 到 13.2. PaLM 0-shot 紫线三点, 约 2.4, 8, 8. GLM-130B 三颗星挤在 1.3×10^11 处: 0-shot 橙星约 13.3, 1-shot 蓝星和 3-shot 黄星约 15.)

| | 0-shot | 1-shot | 3-shot |
| --- | --- | --- | --- |
| GPT-3 2.6B | 0.60 | 0.71 | 1.83 |
| GPT-3 6.7B | -0.06 | 2.93 | 5.40 |
| GPT-3 13B | 1.77 | 5.43 | 7.95 |
| GPT-3 175B | 4.35 | 11.34 | 13.18 |
| PaLM 540B | 8.05 | 37.77 | - |
| GLM-130B | 13.31 | 14.91 | 15.12 |

## 5.2 MASSIVE MULTITASK LANGUAGE UNDERSTANDING (MMLU) 大规模多任务语言理解 (MMLU)

MMLU (Hendrycks et al., 2021) is a diverse benchmark including 57 multi-choice question answering tasks concerning human knowledge ranging from high-school-level to expert-level. It is released after the crawling of Pile and serves as an ideal test-bed for LLMs’ few-shot learning. The GPT-3 result is adopted from MMLU and BLOOM-176B is tested by using the same prompts as GLM-130B’s (Cf. Appendix C.6 and Table 15 for details).

MMLU (Hendrycks et al., 2021) 是一个多样化的基准, 包含 57 个关于人类知识的多选问答任务, 难度从高中水平到专家水平. 它发布于 Pile 爬取之后, 是检验 LLM 少样本学习的理想试验场. GPT-3 的结果取自 MMLU 论文, BLOOM-176B 则用和 GLM-130B 相同的提示测试 (细节见附录 C.6 和表 15).

GLM-130B’s few-shot (5-shot) performance on MMLU approaches GPT-3 (43.9) after viewing about 300B tokens in Figure 6. It continues moving up as the training proceeds, achieving an accuracy of 44.8 when the training has to end (i.e., viewing 400B tokens in total). This aligns with the observation (Hoffmann et al., 2022) that most existing LLMs are far from adequately trained.

如图 6 所示, GLM-130B 在 MMLU 上的少样本 (5-shot) 成绩在看过约 3000 亿 token 后接近 GPT-3 (43.9). 随着训练继续, 成绩还在上升, 到训练不得不结束时 (即总共看过 4000 亿 token) 准确率达到 44.8. 这和 (Hoffmann et al., 2022) 的观察一致: 现有 LLM 大多远没有训练充分.

> **回看:** MMLU 上 44.8 对 43.9, 只高 0.9. 这个领先稳不稳?
> 要看取哪个 checkpoint. 图 6 的曲线在 300B 附近第一次越过 43.9 之后并不单调: 300B 到 330B 之间有几段落在 43.3 左右, 低于 GPT-3 的点; 最高到约 45.4 (约 385B), 最后停在 44.8. 也就是说, 0.9 的领先比曲线自身的起伏还小. 另外两边的数据来源不同: GPT-3 的 43.9 取自 MMLU 论文, BLOOM 是作者用 GLM 的提示自己测的 (本页), 第 51 页表 15 的标题还说, 没有文献报告过 GPT-3 175B 各学科的具体准确率, 所以 57 个学科逐项和 GPT-3 比是做不到的.

## 5.3 BEYOND THE IMITATION GAME BENCHMARK (BIG-BENCH) 超越模仿游戏基准 (BIG-bench)

BIG-bench (Srivastava et al., 2022) benchmarks challenging tasks concerning models’ ability on reasoning, knowledge, and commonsense. Given evaluating on its 150 tasks is time-consuming for LLMs, we report the BIG-bench-lite—an official 24-task sub-collection—for now. Observed from Figure 7 and Table 4, GLM-130B outperforms GPT-3 175B and even PaLM 540B (4× larger) in zero-shot setting. This is probably owing to GLM-130B’s bidirectional context attention and MIP, which has been proved to improve zero-shot results in unseen tasks (Wei et al., 2022a; Sanh et al., 2022). As the number of shots increases, GLM-130B’s performance keeps going up, maintaining its outperformance over GPT-3 (Cf. Appendix C.5 and Table 14 for details on each model and task).

BIG-bench (Srivastava et al., 2022) 收录考察模型推理, 知识和常识能力的高难度任务. 在它的 150 个任务上评测 LLM 太耗时, 所以目前我们报告 BIG-bench-lite, 即官方的 24 个任务子集. 从图 7 和表 4 看, 零样本设定下 GLM-130B 超过了 GPT-3 175B, 甚至超过大 4 倍的 PaLM 540B. 这可能得益于 GLM-130B 的双向上下文注意力和 MIP, 后者已被证明能改善在没见过的任务上的零样本结果 (Wei et al., 2022a; Sanh et al., 2022). 随着样本数增加, GLM-130B 的成绩持续上升, 保持对 GPT-3 的领先 (各模型各任务的细节见附录 C.5 和表 14).

> **看表:** 表 4 说 GLM-130B 的 BIG-bench-lite 是 0-shot 13.31, 1-shot 14.91, 3-shot 15.12. 把第 50 页表 14 的 24 个任务自己平均一下, 对得上吗?
> 0-shot 对得上, 另外两列对不上. 表 14 的 GLM-130B 三列平均是 13.31, 15.12, 15.00: 1-shot 的平均恰好是表 4 写的 3-shot 值, 3-shot 的平均反而比 1-shot 低一点. GPT-3 三列平均是 4.35, 11.34, 13.18, 和表 4 完全一致. PaLM 540B 两列平均是 8.24 和 39.29, 表 4 写的是 8.05 和 37.77. 我用 PDF 原文核过表 14 的数字, 不是 MinerU 抽错. 所以本段 「随着样本数增加成绩持续上升」 按表 14 算并不成立, 1-shot 到 3-shot 是持平略降. 还有一点: 表 4 里 PaLM 的 1-shot 是 37.77, 远高于 GLM-130B 的任何一列, 「甚至超过 PaLM」 只在零样本这一列成立.

> **拆开:** 零样本 13.31 对 4.35, 差了三倍. 这个差距是均匀地摊在 24 个任务上, 还是集中在少数几个?
> 相当集中. 按第 50 页表 14 数, 零样本下 GLM-130B 赢 14 个任务, 输 8 个 (code_line_description, conlang_translation, formal_fallacies, known_unknowns, novel_concepts, operators, play_dialog, winowhy), 平 2 个 (linguistics_puzzles 和 repeat_copy_logic 都是 0). 单是 vitaminc_fact_verification 一项, GLM-130B 71.87, GPT-3 -31.55, 相差 103.4 分, 除以 24 就给平均分贡献了 4.3 分, 差不多是总差距 8.96 的一半. 去掉这一项, 剩下 23 个任务的平均是 GLM-130B 10.76 对 GPT-3 5.91, 仍然领先, 但只有 1.8 倍. 1-shot 下 GLM-130B 赢 11 个输 10 个, 3-shot 下赢 12 个输 10 个, 几乎是一半一半.

**Limitations and Discussions.** In the experiments above, we observe that GLM-130B’s performance growth (13.31 to 15.12) with the increase of few-shot samples is not as significant as GPT-3’s (4.35 to 13.18). Here is our intuitive attempt to understand the phenomenon.

**局限与讨论.** 在上面的实验里我们观察到, 随着少样本样例增多, GLM-130B 的成绩增长 (13.31 到 15.12) 不如 GPT-3 (4.35 到 13.18) 明显. 下面是我们对这一现象的直观理解尝试.

First, the bidirectional nature of GLM-130B could lead to strong zero-shot performance (as is indicated in zero-shot language modeling), thus getting closer to the few-shot “upper-bound” for models of similar scale (i.e., 100B-scale) than unidirectional LLMs. Second, it may be also attributed to a deficit of existing MIP paradigms (Wei et al., 2022a; Sanh et al., 2022), which only involve zero-shot prediction in the training and will be likely to bias GLM-130B for stronger zero-shot learning but relatively weaker in-context few-shot performance. To correct the bias, a potential solution we came up with would be to employ MIP with varied shots of in-context samples rather than only zero-shot samples.

第一, GLM-130B 的双向特性可能带来很强的零样本表现 (零样本语言建模的结果就是这样), 因此比单向 LLM 更接近同规模 (即千亿级) 模型的少样本 「上限」. 第二, 这也可能归因于现有 MIP 范式 (Wei et al., 2022a; Sanh et al., 2022) 的一个缺陷: 训练中只有零样本预测, 很可能让 GLM-130B 偏向更强的零样本学习, 而上下文少样本能力相对较弱. 为了纠正这种偏差, 我们想到的一个可能办法是在 MIP 中使用带不同数量上下文样例的样本, 而不只是零样本样本.

Finally, despite almost the same GPT architecture as GPT-3, PaLM 540B’s relative growth with fewshot in-context learning is substantially more significant than GPT-3’s. We conjecture this further acceleration in performance growth is a source of PaLM’s high-quality and diverse private-collected training corpora. By combining our experiences with (Hoffmann et al., 2022)’s insights, we came to realize that better architectures, better data, and more training FLOPS should be further invested.

最后, 尽管 PaLM 540B 和 GPT-3 的 GPT 架构几乎一样, 它在少样本上下文学习上的相对增长却比 GPT-3 明显得多. 我们推测, 这种性能增长的进一步加速来自 PaLM 高质量, 多样化的私有训练语料. 结合我们的经验和 (Hoffmann et al., 2022) 的见解, 我们认识到应当在更好的架构, 更好的数据和更多的训练 FLOPS 上继续投入.

## 5.4 CHINESE LANGUAGE UNDERSTANDING EVALUATION (CLUE) 中文语言理解评测 (CLUE)

We evaluate GLM-130B’s Chinese zero-shot performance on established Chinese NLP benchmarks, CLUE (Xu et al., 2020) and FewCLUE (Xu et al., 2021).Note that we do not include any Chinese downstream tasks in MIP. To date, we have finished testing on part of the two benchmarks, including

(本段跨到下一页, 整段译文放在下一页.)

<!-- page 9 of 56 -->

![Chart block](images/p09-figure-8-glm-130b-and-ernie-titan-3-0-260b-evaluated-on.png)

Figure 8: GLM-130B and ERNIE Titan 3.0 260B evaluated on zero-shot CLUE and FewCLUE.

图 8: GLM-130B 与 ERNIE Titan 3.0 260B 在零样本 CLUE 和 FewCLUE 上的评测.

(图: 12 组柱, 纵轴 Acc. or EM. 黄柱 GLM-130B, 蓝柱 ERNIE 3.0 Titan-260B. 依次是 EPRSTMT 92.5 / 88.8, OCNLI-FC 73.8 / 53.8, BUSTM 77.5 / 64.4, CHID-FC 90.1 / 87.1, CLUEWSC-FC 77.4 / 53.5, C3 77.5 / 54.9, WSC1.1 83.9 / 81.1, CMNLI 77.0 / 51.7, DRCD 77.1 / 29.5, OCNLI_50K 74.7 / 44.6, AFQMC 71.2 / 69.0, CMRC2018 55.7 / 16.6. 每一组都是黄柱更高.)

7 CLUE and 5 FewCLUE datasets (Cf. Appendix C.7 for details). We compare GLM-130B to the largest existing Chinese monolingual language model—the 260B ERNIE Titan 3.0 (Wang et al., 2021). We follow its setting to report zero-shot results on dev datasets. GLM-130B consistently outperforms ERNIE Titan 3.0 across 12 tasks (Cf. Figure 8). Interestingly, GLM-130B performs at least 260% better than ERNIE on two abstractive MRC datasets (DRCD and CMRC2018), possibly due to GLM-130B’s pre-training objective that naturally resonates to abstractive MRC’s form.

我们在成熟的中文 NLP 基准 CLUE (Xu et al., 2020) 和 FewCLUE (Xu et al., 2021) 上评测 GLM-130B 的中文零样本表现. 注意 MIP 里没有放任何中文下游任务. 到目前为止, 我们完成了两个基准的一部分, 包括 7 个 CLUE 和 5 个 FewCLUE 数据集 (细节见附录 C.7). 我们把 GLM-130B 和现有最大的中文单语语言模型, 2600 亿参数的 ERNIE Titan 3.0 (Wang et al., 2021) 作比较. 按照它的设置, 我们报告在 dev 集上的零样本结果. GLM-130B 在 12 个任务上一致超过 ERNIE Titan 3.0 (见图 8). 有意思的是, 在两个生成式阅读理解 (MRC) 数据集 (DRCD 和 CMRC2018) 上, GLM-130B 至少比 ERNIE 好 260%, 这可能是因为 GLM-130B 的预训练目标天然契合生成式 MRC 的形式.

> **对一下:** 引言说 7 个 CLUE 数据集上 「+24.26%」, 5 个 FewCLUE 上 「+12.75%」, 这里又说 DRCD 和 CMRC2018 上 「至少好 260%」. 用图 8 的柱高能算出来吗?
> 前两个能, 第三个的说法要改一下. 带 -FC 后缀的 4 个加上 EPRSTMT, BUSTM 是 FewCLUE, 平均 GLM-130B 82.26, ERNIE 69.52, 差 12.74 个百分点; 其余 7 个是 CLUE, 平均 73.87 对 49.63, 差 24.24 个百分点 (图上数字只保留一位小数, 和 24.26, 12.75 的出入在舍入范围内). 所以这两个 「%」 是平均分的绝对差, 不是相对提升. DRCD 是 77.1 对 29.5, 比值 2.61; CMRC2018 是 55.7 对 16.6, 比值 3.36. 「至少 260%」 对应的是 「是 ERNIE 的 2.6 倍」, 换成 「好多少」 应是至少 161%.

## 6 RELATED WORK 相关工作

In this section, we review related work to GLM-130B on topics of pre-training, transferring, and inference of pre-trained LLMs (Qiu et al., 2020; Bommasani et al., 2021).

本节从预训练, 迁移和推理三个方面回顾与 GLM-130B 相关的预训练 LLM 工作 (Qiu et al., 2020; Bommasani et al., 2021).

**Pre-Training.** Vanilla language modeling refers to decoder-only autoregressive models (e.g., GPT (Radford et al., 2018)), but it also recognizes any forms of self-supervised objectives on texts. Recently, transformer-based (Vaswani et al., 2017) language models present a fascinating scaling law: new abilities (Wei et al., 2022b) arise as models scale up, from 1.5B (Radford et al., 2019), 10B-scale language models (Raffel et al., 2020; Shoeybi et al., 2019; Black et al., 2022), to 100Bscale GPT-3 (Brown et al., 2020). Later, despite many 100B-scale LLMs (Lieber et al., 2021; Thoppilan et al., 2022; Rae et al., 2021; Smith et al., 2022; Chowdhery et al., 2022; Wu et al., 2021; Zeng et al., 2021; Wang et al., 2021) in both English and Chinese, they are not available to public or only accessible via limited APIs. The closeness of LLMs severely stymies its development. GLM-130B’s efforts, along with recent ElutherAI, OPT-175B (Zhang et al., 2022), and BLOOM-176B (Scao et al., 2022), aim to offer high-quality open-sourced LLMs to our community.

**预训练.** 普通的语言建模指只有解码器的自回归模型 (例如 GPT (Radford et al., 2018)), 但也泛指文本上任何形式的自监督目标. 近年来, 基于 transformer (Vaswani et al., 2017) 的语言模型呈现出迷人的规模定律: 随着模型从 15 亿 (Radford et al., 2019), 百亿级 (Raffel et al., 2020; Shoeybi et al., 2019; Black et al., 2022) 扩大到千亿级的 GPT-3 (Brown et al., 2020), 会出现新的能力 (Wei et al., 2022b). 之后虽然有许多中英文千亿级 LLM (Lieber et al., 2021; Thoppilan et al., 2022; Rae et al., 2021; Smith et al., 2022; Chowdhery et al., 2022; Wu et al., 2021; Zeng et al., 2021; Wang et al., 2021), 但它们不对公众开放, 或者只能通过受限的 API 访问. LLM 的封闭严重阻碍了它的发展. GLM-130B 的工作, 和近期的 EleutherAI (源文拼作 ElutherAI), OPT-175B (Zhang et al., 2022), BLOOM-176B (Scao et al., 2022) 一样, 目的是为社区提供高质量的开源 LLM.

**Transferring.** Though fine-tuning has been a de facto way for transfer learning, the evaluation for LLMs has been focused on prompting and in-context learning due to their tremendous sizes (Brown et al., 2020; Liu et al., 2021a). Nevertheless, some recent attempts has been on parameter-efficient learning on language models (Houlsby et al., 2019) and prompt tuning (i.e., P-tuning, Li & Liang (2021); Liu et al. (2021b); Lester et al. (2021); Liu et al. (2022)). For now we do not focus on them and will leave the comprehensive testing of them on GLM-130B in future study.

**迁移.** 虽然微调一直是迁移学习的事实标准, 但由于 LLM 体量巨大, 对它的评测集中在提示和上下文学习上 (Brown et al., 2020; Liu et al., 2021a). 不过, 近期也有一些工作尝试语言模型上的参数高效学习 (Houlsby et al., 2019) 和提示微调 (即 P-tuning, Li & Liang (2021); Liu et al. (2021b); Lester et al. (2021); Liu et al. (2022)). 目前我们不聚焦于这些方法, 把它们在 GLM-130B 上的全面测试留给以后的研究.

**Inference.** Most public-accessible LLMs nowadays are providing their services via limited APIs.In this work, an important part of our endeavor has been on LLMs’ efficient and fast inference. Related work may include distillation (Sanh et al., 2019; Jiao et al., 2020; Wang et al., 2020), quantization (Zafrir et al., 2019; Shen et al., 2020; Tao et al., 2022), and pruning (Michel et al., 2019; Fan et al., 2019). Very recent work (Dettmers et al., 2022) shows that LLMs such as OPT-175B and BLOOM-176B can be quantized to 8 bit due to special distribution of outlier dimensions. In this work, we demonstrate GLM’s scaling law for INT4 weight quantization, which allows GLM-130B to inference on as few as 4×RTX 3090 (24G) GPUs or 8×RTX 2080 Ti (11G) GPUs.

**推理.** 如今大多数可公开访问的 LLM 都通过受限的 API 提供服务. 本工作的一个重要部分放在 LLM 高效, 快速的推理上. 相关工作包括蒸馏 (Sanh et al., 2019; Jiao et al., 2020; Wang et al., 2020), 量化 (Zafrir et al., 2019; Shen et al., 2020; Tao et al., 2022) 和剪枝 (Michel et al., 2019; Fan et al., 2019). 最近的工作 (Dettmers et al., 2022) 表明, 由于离群维度的特殊分布, OPT-175B 和 BLOOM-176B 这样的 LLM 可以量化到 8 位. 本工作展示了 GLM 在 INT4 权重量化上的规模定律, 它让 GLM-130B 只用 4×RTX 3090 (24G) 或 8×RTX 2080 Ti (11G) GPU 就能推理.

## 7 CONCLUSION AND LESSONS 结论与经验

We introduce GLM-130B, a bilingual pre-trained language model that aims to facilitate open and inclusive LLM research. GLM-130B’s technical and engineering undertakings generate insight into LLMs’ architectures, pre-training objectives, training stability and efficiency, and affordable inference. Altogether, it contributes to the high quality of GLM-130B in terms of both language performance on 112 tasks and ethical results on bias and toxicity benchmarks. Our experiences of both success and failure are condensed into the lessons for training 100B-scale LLMs, attached in the Appendix B.10.

我们介绍了 GLM-130B, 一个旨在推动开放, 包容的 LLM 研究的双语预训练语言模型. GLM-130B 在技术和工程上的投入, 为理解 LLM 的架构, 预训练目标, 训练稳定性与效率, 以及低成本推理提供了洞见. 这些合在一起, 造就了 GLM-130B 的高质量, 既体现在 112 个任务上的语言表现, 也体现在偏见和毒性基准上的伦理结果. 我们把成功和失败的经验浓缩成训练千亿级 LLM 的教训, 附在附录 B.10.

<!-- page 10 of 56 -->

## ACKNOWLEDGEMENT 致谢

This research was supported by Natural Science Foundation of China (NSFC) 61825602, 62276148 and Zhipu.AI. We thank all our collaborators and partners from the Knowledge Engineering Group (KEG), Parallel Architecture & Compiler technology of Mobile, Accelerated, and Networked systems Group (PACMAN), Natural Language Processing Group (THUNLP) at Tsinghua University, and Zhipu.AI.

本研究得到国家自然科学基金 (NSFC) 61825602, 62276148 和智谱 AI 的支持. 感谢清华大学知识工程研究室 (KEG), 移动, 加速与网络系统并行架构与编译技术研究组 (PACMAN), 自然语言处理实验室 (THUNLP) 以及智谱 AI 的所有合作者和伙伴.

## ETHICS STATEMENT 伦理声明

We hereby acknowledge that all of the co-authors of this work are aware of the provided ICLR Code of Ethics and honor the code of conduct. This work introduces an open-source Large Language Model (LLM), which could be used to generate synthetic text for harmful applications, such as telemarketing fraud, political propaganda, and personal harassment as is discussed in (Weidinger et al., 2021; Sheng et al., 2021; Dev et al., 2021). We do not anticipate any hazardous outputs, especially towards vulnerable and historically disadvantaged groups of peoples, after using the model.

我们在此声明, 本文所有合著者都知悉 ICLR 伦理准则并遵守其行为规范. 本工作介绍一个开源大语言模型 (LLM), 它可能被用来生成合成文本用于有害用途, 例如电信诈骗, 政治宣传和人身骚扰, (Weidinger et al., 2021; Sheng et al., 2021; Dev et al., 2021) 对此有讨论. 我们预计使用该模型不会产生危险输出, 尤其不会针对弱势群体和历史上处于不利地位的群体.

And to better collaborate with our community to prevent and ultimately eliminate the risks technically, we make the following crucial open efforts in this work:

为了更好地与社区合作, 从技术上预防并最终消除这些风险, 我们在本工作中做了下面几项关键的开放努力:

**Open-Sourced LLMs for Ethical Risk Study.** While some people think that restricting the access of LLMs can prevent such harmful applications, we argue that promoting LLM inclusivity can lead to better defense against potential harms caused by LLMs. Currently, only governments and large corporations can afford the considerable costs of pre-training LLMs. There is no guarantee that organizations having the the substantial financial resources will not do harm using a LLM. Without access to such LLMs, individuals cannot even realize the role of LLMs in the harm.

**开源 LLM 以研究伦理风险.** 有人认为限制对 LLM 的访问可以防止这类有害应用, 我们则认为, 提升 LLM 的包容性才能更好地防御 LLM 可能造成的危害. 目前只有政府和大公司负担得起预训练 LLM 的可观成本. 没有任何保证说财力雄厚的机构不会用 LLM 作恶. 接触不到这样的 LLM, 个人连 LLM 在危害中扮演什么角色都意识不到.

Conversely, releasing an open LLM can provide access and transparency to all the researchers and promote the research to reduce the potential harm of LLMs, like algorithms to identify the synthetic text Gehrmann et al. (2019). Also, it is known that LLMs can suffer from problems in fairness, bias, privacy, and truthfulness Zhang et al. (2021); Lin et al. (2022); Liang et al. (2021); Bender et al. (2021). An open LLM can reveal the model parameters and internal states corresponding to specific inputs instead of providing APIs to black-box models. In conclusion, researchers can conduct analysis of LLMs’ flaws in depth and propose improved algorithms to solve the problems.

反过来, 发布一个开放的 LLM, 能让所有研究者都能接触到它, 了解它, 并推动减少 LLM 潜在危害的研究, 例如识别合成文本的算法 Gehrmann et al. (2019). 此外, 已知 LLM 可能存在公平性, 偏见, 隐私和真实性方面的问题 Zhang et al. (2021); Lin et al. (2022); Liang et al. (2021); Bender et al. (2021). 开放的 LLM 可以展示模型参数以及特定输入对应的内部状态, 而不是只提供黑盒模型的 API. 总之, 研究者可以深入分析 LLM 的缺陷, 并提出改进算法来解决这些问题.

**Ethical Evaluation and Improvements.** We also evaluate our model over a wide range of English ethical evaluation benchmarks, including bias measurement (Nadeem et al., 2021; Nangia et al., 2020), hate speech detection (Mollas et al., 2020), and toxic generation estimation (Gehman et al., 2020). Notwithstanding their deficiency (Blodgett et al., 2021; Jacobs & Wallach, 2021), these datasets serve as a meaningful initial step towards an open quantitative evaluation LLMs.

**伦理评测与改进.** 我们还在大量英文伦理评测基准上评测了模型, 包括偏见测量 (Nadeem et al., 2021; Nangia et al., 2020), 仇恨言论检测 (Mollas et al., 2020) 和有毒生成估计 (Gehman et al., 2020). 尽管这些数据集各有不足 (Blodgett et al., 2021; Jacobs & Wallach, 2021), 它们仍是对 LLM 做开放定量评测的有意义的第一步.

Our evaluation implies that our algorithm designs, especially the bilingual pre-training of a LLM, can significantly mitigate the biases and toxicity an LLM may present while keeping its strong language performance compared to other LLMs (Brown et al., 2020; Zhang et al., 2022) trained with monolingual English corpora (Cf. Appendix A for more details).

我们的评测表明, 与其他用单语英文语料训练的 LLM (Brown et al., 2020; Zhang et al., 2022) 相比, 我们的算法设计, 尤其是 LLM 的双语预训练, 能在保持强语言表现的同时, 明显减轻 LLM 可能呈现的偏见和毒性 (更多细节见附录 A).

## REPRODUCIBILITY 可复现性

Compared to mainstream closed-sourced LLMs including GPT-3 175B(Brown et al., 2020), PaLM 540B (Chowdhery et al., 2022), Gopher (Rae et al., 2021), Chinchilla (Hoffmann et al., 2022), LaMDA (Thoppilan et al., 2022), FLAN (Wei et al., 2022a), and many others, GLM-130B is open-sourced and devotes to promote openness and inclusivity in LLM research from the very beginning.

与主流闭源 LLM 相比, 包括 GPT-3 175B (Brown et al., 2020), PaLM 540B (Chowdhery et al., 2022), Gopher (Rae et al., 2021), Chinchilla (Hoffmann et al., 2022), LaMDA (Thoppilan et al., 2022), FLAN (Wei et al., 2022a) 等等, GLM-130B 是开源的, 从一开始就致力于推动 LLM 研究的开放和包容.

We have paid great effort to ensure the reproducibility of our evaluation. For pre-training section, despite the unaffordable costs it needs to reproduce at present, we still make our best efforts to disclose the code, details, and the whole process of GLM-130B’s pre-training. Our endeavor to allow GLM-130B inference on few popularized GPUs such as 3090/2080 Ti also aligns with the reproducibility undertaking, as it allows most academic researchers to reproduce GLM-130B’s results on their offline machines. We also provide free APIs for individual users to test GLM-130B’s ability.

我们下了很大力气保证评测的可复现性. 预训练部分虽然目前复现成本高得负担不起, 我们仍尽力公开 GLM-130B 预训练的代码, 细节和全过程. 我们让 GLM-130B 能在少量普及型 GPU (如 3090/2080 Ti) 上推理, 这也符合可复现的目标, 因为它让大多数学术研究者能在自己的离线机器上复现 GLM-130B 的结果. 我们还为个人用户提供免费 API 来测试 GLM-130B 的能力.

<!-- page 11 of 56 -->

**Pre-Training.** We provide the complete training notes, Tensorboard logs, and code for our pre-training in our repository (Cf. Abstract). The pre-training hyper-parameters and cluster configuration are provided in Section 2.3 and Table 11. The training corpora composition and details for Multi-task Instruction Pre-training are provided in Section 2.2 and Appendix C.1 and C.2.

**预训练.** 我们在仓库里提供完整的训练笔记, Tensorboard 日志和预训练代码 (见摘要). 预训练超参数和集群配置见 2.3 节和表 11. 训练语料构成和多任务指令预训练的细节见 2.2 节以及附录 C.1 和 C.2.

**Evaluation.** We organize all the evaluation, including language benchmarks (LAMBADA, Pile, MMLU, BIG-bench, CLUE, and FewCLUE) and ethical benchmarks (CrowS-Pairs, StereoSet, ETHOS, RealToxicPrompts), into one-command-to-run bash scripts in our code repository. Data processing details for language modeling benchmarks are provided in Section 5.1 and Appendix C.4, for MMLU are provided in Section 5.2 and Appendix C.6, for BIG-bench are provided in Section 5.3 and Appendix C.5, for CLUE and FewCLUE are provided in 5.4. For all ethical evaluation, please refer to Appendix A for details.

**评测.** 我们把所有评测, 包括语言基准 (LAMBADA, Pile, MMLU, BIG-bench, CLUE 和 FewCLUE) 和伦理基准 (CrowS-Pairs, StereoSet, ETHOS, RealToxicPrompts), 整理成代码仓库里一条命令就能运行的 bash 脚本. 语言建模基准的数据处理细节见 5.1 节和附录 C.4, MMLU 见 5.2 节和附录 C.6, BIG-bench 见 5.3 节和附录 C.5, CLUE 和 FewCLUE 见 5.4 节. 所有伦理评测的细节见附录 A.

## REFERENCES 参考文献

(以下参考文献条目保留英文原样, 与源 md 一致.)

Oshin Agarwal, Heming Ge, Siamak Shakeri, and Rami Al-Rfou. Knowledge graph based synthetic corpus generation for knowledge-enhanced language model pre-training. In Proceedings of the 2021 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pp. 3554–3565, 2021.

Vamsi Aribandi, Yi Tay, Tal Schuster, Jinfeng Rao, Huaixiu Steven Zheng, Sanket Vaibhav Mehta, Honglei Zhuang, Vinh Q Tran, Dara Bahri, Jianmo Ni, et al. Ext5: Towards extreme multi-task scaling for transfer learning. In International Conference on Learning Representations, 2022.

Mikel Artetxe, Shruti Bhosale, Naman Goyal, Todor Mihaylov, Myle Ott, Sam Shleifer, Xi Victoria Lin, Jingfei Du, Srinivasan Iyer, Ramakanth Pasunuru, et al. Efficient large scale language modeling with mixtures of experts. arXiv preprint arXiv:2112.10684, 2021.

Jimmy Lei Ba, Jamie Ryan Kiros, and Geoffrey E Hinton. Layer normalization. arXiv preprint arXiv:1607.06450, 2016.

Stephen Bach, Victor Sanh, Zheng Xin Yong, Albert Webson, Colin Raffel, Nihal V Nayak, Abheesht Sharma, Taewoon Kim, M Saiful Bari, Thibault Févry, et al. Promptsource: An integrated development environment and repository for natural language prompts. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics: System Demonstrations, pp. 93–104, 2022.

Emily M. Bender, Timnit Gebru, Angelina McMillan-Major, and Shmargaret Shmitchell. On the dangers of stochastic parrots: Can language models be too big? In FAccT ’21: 2021 ACM Conference on Fairness, Accountability, and Transparency, Virtual Event / Toronto, Canada, March 3-10, 2021, pp. 610–623. ACM, 2021.

Jonathan Berant, Andrew Chou, Roy Frostig, and Percy Liang. Semantic parsing on freebase from question-answer pairs. In Proceedings of the 2013 conference on empirical methods in natural language processing, pp. 1533–1544, 2013.

Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi, et al. Piqa: Reasoning about physical commonsense in natural language. In Proceedings of the AAAI conference on artificial intelligence, volume 34, pp. 7432–7439, 2020.

Sidney Black, Stella Biderman, Eric Hallahan, Quentin Anthony, Leo Gao, Laurence Golding, Horace He, Connor Leahy, Kyle McDonell, Jason Phang, et al. Gpt-neox-20b: An open-source autoregressive language model. In Proceedings of BigScience Episode\# 5–Workshop on Challenges & Perspectives in Creating Large Language Models, pp. 95–136, 2022.

Su Lin Blodgett, Gilsinia Lopez, Alexandra Olteanu, Robert Sim, and Hanna Wallach. Stereotyping norwegian salmon: An inventory of pitfalls in fairness benchmark datasets. In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers), pp. 1004–1015, 2021.

<!-- page 12 of 56 -->

Rishi Bommasani, Drew A Hudson, Ehsan Adeli, Russ Altman, Simran Arora, Sydney von Arx, Michael S Bernstein, Jeannette Bohg, Antoine Bosselut, Emma Brunskill, et al. On the opportunities and risks of foundation models. arXiv preprint arXiv:2108.07258, 2021.

(参考文献续, 条目保留英文原样.)

Tom Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared D Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, et al. Language models are few-shot learners. Advances in neural information processing systems, 33:1877–1901, 2020.

Nicola De Cao, Wilker Aziz, and Ivan Titov. Editing factual knowledge in language models. In Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, EMNLP 2021, Virtual Event / Punta Cana, Dominican Republic, 7-11 November, 2021, pp. 6491–6506. Association for Computational Linguistics, 2021.

Xavier Carreras and Lluís Màrquez. Introduction to the conll-2005 shared task: Semantic role labeling. In CoNLL, pp. 152–164, 2005.

Thiago Castro Ferreira, Claire Gardent, Nikolai Ilinykh, Chris van der Lee, Simon Mille, Diego Moussallem, and Anastasia Shimorina. The 2020 bilingual, bi-directional WebNLG+ shared task: Overview and evaluation results (WebNLG+ 2020). In Proceedings of the 3rd International Workshop on Natural Language Generation from the Semantic Web (WebNLG+), pp. 55–76, Dublin, Ireland (Virtual), 12 2020. Association for Computational Linguistics. URL [https://aclanthology.org/2020.webnlg-1.7](https://aclanthology.org/2020.webnlg-1.7).

Xinlei Chen, Saining Xie, and Kaiming He. An empirical study of training self-supervised vision transformers. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pp. 9640–9649, 2021.

Ke-Li Chiu and Rohan Alexander. Detecting hate speech with gpt-3. arXiv preprint arXiv:2103.12407, 2021.

Aakanksha Chowdhery, Sharan Narang, Jacob Devlin, Maarten Bosma, Gaurav Mishra, Adam Roberts, Paul Barham, Hyung Won Chung, Charles Sutton, Sebastian Gehrmann, et al. Palm: Scaling language modeling with pathways. arXiv preprint arXiv:2204.02311, 2022.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

Zihang Dai, Zhilin Yang, Yiming Yang, Jaime G Carbonell, Quoc Le, and Ruslan Salakhutdinov. Transformer-xl: Attentive language models beyond a fixed-length context. In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pp. 2978–2988, 2019.

Tim Dettmers, Mike Lewis, Sam Shleifer, and Luke Zettlemoyer. 8-bit optimizers via block-wise quantization. arXiv preprint arXiv:2110.02861, 2021.

Tim Dettmers, Mike Lewis, Younes Belkada, and Luke Zettlemoyer. Llm. int8 (): 8-bit matrix multiplication for transformers at scale. arXiv preprint arXiv:2208.07339, 2022.

Sunipa Dev, Masoud Monajatipoor, Anaelia Ovalle, Arjun Subramonian, J. M. Phillips, and Kai Wei Chang. Harms of gender exclusivity and challenges in non-binary representation in language technologies. ArXiv, abs/2108.12084, 2021.

Jacob Devlin, Ming-Wei Chang, Kenton Lee, and Kristina Toutanova. Bert: Pre-training of deep bidirectional transformers for language understanding. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pp. 4171–4186, 2019.

Ming Ding, Zhuoyi Yang, Wenyi Hong, Wendi Zheng, Chang Zhou, Da Yin, Junyang Lin, Xu Zou, Zhou Shao, Hongxia Yang, et al. Cogview: Mastering text-to-image generation via transformers. Advances in Neural Information Processing Systems, 34:19822–19835, 2021.

Li Dong, Nan Yang, Wenhui Wang, Furu Wei, Xiaodong Liu, Yu Wang, Jianfeng Gao, Ming Zhou, and Hsiao-Wuen Hon. Unified language model pre-training for natural language understanding and generation. Advances in Neural Information Processing Systems, 32, 2019.

<!-- page 13 of 56 -->

Zhengxiao Du, Yujie Qian, Xiao Liu, Ming Ding, Jiezhong Qiu, Zhilin Yang, and Jie Tang. Glm: General language model pretraining with autoregressive blank infilling. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 320–335, 2022.

(参考文献续, 条目保留英文原样.)

Ondřej Dušek, David M. Howcroft, and Verena Rieser. Semantic noise matters for neural natural language generation. In Proceedings of the 12th International Conference on Natural Language Generation, pp. 421–426, Tokyo, Japan, October–November 2019. Association for Computational Linguistics. doi: 10.18653/v1/W19-8652. URL [https://aclanthology.org/W19-8652](https://aclanthology.org/W19-8652).

Hady Elsahar, Pavlos Vougiouklis, Arslen Remaci, Christophe Gravier, Jonathon Hare, Frederique Laforest, and Elena Simperl. T-rex: A large scale alignment of natural language with knowledge base triples. In Proceedings of the Eleventh International Conference on Language Resources and Evaluation (LREC 2018), 2018.

Mihail Eric, Rahul Goel, Shachi Paul, Abhishek Sethi, Sanchit Agarwal, Shuyang Gao, Adarsh Kumar, Anuj Kumar Goyal, Peter Ku, and Dilek Hakkani-Tür. Multiwoz 2.1: A consolidated multi-domain dialogue dataset with state corrections and state tracking baselines. In LREC, 2020.

Angela Fan, Edouard Grave, and Armand Joulin. Reducing transformer depth on demand with structured dropout. arXiv preprint arXiv:1909.11556, 2019.

Leo Gao, Stella Biderman, Sid Black, Laurence Golding, Travis Hoppe, Charles Foster, Jason Phang, Horace He, Anish Thite, Noa Nabeshima, et al. The pile: An 800gb dataset of diverse text for language modeling. arXiv preprint arXiv:2101.00027, 2020.

Samuel Gehman, Suchin Gururangan, Maarten Sap, Yejin Choi, and Noah A. Smith. Realtoxicityprompts: Evaluating Neural Toxic Degeneration in Language Models. dblp://journals/dblp, 2020.

Sebastian Gehrmann, Hendrik Strobelt, and Alexander Rush. GLTR: Statistical detection and visualization of generated text. In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics: System Demonstrations, pp. 111–116, Florence, Italy, July 2019. Association for Computational Linguistics.

Sebastian Gehrmann, Tosin Adewumi, Karmanya Aggarwal, Pawan Sasanka Ammanamanchi, Aremu Anuoluwapo, Antoine Bosselut, Khyathi Raghavi Chandu, Miruna Clinciu, Dipanjan Das, Kaustubh D Dhole, et al. The gem benchmark: Natural language generation, its evaluation and metrics. GEM 2021, pp. 96, 2021.

Mor Geva, Daniel Khashabi, Elad Segal, Tushar Khot, Dan Roth, and Jonathan Berant. Did aristotle use a laptop? a question answering benchmark with implicit reasoning strategies. Transactions of the Association for Computational Linguistics, 9:346–361, 2021.

Peter Hase, Mona T. Diab, Asli Celikyilmaz, Xian Li, Zornitsa Kozareva, Veselin Stoyanov, Mohit Bansal, and Srinivasan Iyer. Do language models have beliefs? methods for detecting, updating, and visualizing model beliefs. CoRR, abs/2111.13654, 2021.

Ruining He, Anirudh Ravula, Bhargav Kanagal, and Joshua Ainslie. Realformer: Transformer likes residual attention. In Findings of the Association for Computational Linguistics: ACL-IJCNLP 2021, pp. 929–943, 2021.

Dan Hendrycks and Kevin Gimpel. Gaussian error linear units (gelus). arXiv preprint arXiv:1606.08415, 2016.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In International Conference on Learning Representations, 2021.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, et al. Training compute-optimal large language models. arXiv preprint arXiv:2203.15556, 2022.

<!-- page 14 of 56 -->

Wenyi Hong, Ming Ding, Wendi Zheng, Xinghan Liu, and Jie Tang. Cogvideo: Large-scale pre-training for text-to-video generation via transformers. arXiv preprint arXiv:2205.15868, 2022.

(参考文献续, 条目保留英文原样.)

Neil Houlsby, Andrei Giurgiu, Stanislaw Jastrzebski, Bruna Morrone, Quentin De Laroussilhe, Andrea Gesmundo, Mona Attariyan, and Sylvain Gelly. Parameter-efficient transfer learning for nlp. In International Conference on Machine Learning, pp. 2790–2799. PMLR, 2019.

Yanping Huang, Youlong Cheng, Ankur Bapna, Orhan Firat, Dehao Chen, Mia Chen, HyoukJoong Lee, Jiquan Ngiam, Quoc V Le, Yonghui Wu, et al. Gpipe: Efficient training of giant neural networks using pipeline parallelism. Advances in neural information processing systems, 32, 2019.

Abigail Z Jacobs and Hanna Wallach. Measurement and fairness. In Proceedings of the 2021 ACM conference on fairness, accountability, and transparency, pp. 375–385, 2021.

Xiaoqi Jiao, Yichun Yin, Lifeng Shang, Xin Jiang, Xiao Chen, Linlin Li, Fang Wang, and Qun Liu. Tinybert: Distilling bert for natural language understanding. In Findings of the Association for Computational Linguistics: EMNLP 2020, pp. 4163–4174, 2020.

Mandar Joshi, Eunsol Choi, Daniel S Weld, and Luke Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. In Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 1601–1611, 2017.

Paul R Kingsbury and Martha Palmer. From treebank to propbank. Citeseer.

Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, et al. Natural questions: a benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:453–466, 2019.

Alexandre Lacoste, Alexandra Luccioni, Victor Schmidt, and Thomas Dandres. Quantifying the carbon emissions of machine learning. CoRR, abs/1910.09700, 2019.

Brian Lester, Rami Al-Rfou, and Noah Constant. The power of scale for parameter-efficient prompt tuning. In Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, pp. 3045–3059, 2021.

Hector Levesque, Ernest Davis, and Leora Morgenstern. The winograd schema challenge. In Thirteenth international conference on the principles of knowledge representation and reasoning, 2012.

Xiang Lisa Li and Percy Liang. Prefix-tuning: Optimizing continuous prompts for generation. In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers), pp. 4582–4597, 2021.

Xiangyang Li, Yu Xia, Xiang Long, Zheng Li, and Sujian Li. Exploring text-transformers in aaai 2021 shared task: Covid-19 fake news detection in english. In CONSTRAINT@AAAI, 2021.

Paul Pu Liang, Chiyu Wu, Louis-Philippe Morency, and Ruslan Salakhutdinov. Towards understanding and mitigating social biases in language models. In Proceedings of the 38th International Conference on Machine Learning, ICML 2021, 18-24 July 2021, Virtual Event, volume 139 of Proceedings of Machine Learning Research, pp. 6565–6576. PMLR, 2021.

Opher Lieber, Or Sharir, Barak Lenz, and Yoav Shoham. Jurassic-1: Technical details and evaluation. White Paper. AI21 Labs, 2021.

Chin-Yew Lin. ROUGE: A package for automatic evaluation of summaries. In Text Summarization Branches Out, pp. 74–81, Barcelona, Spain, July 2004. Association for Computational Linguistics. URL [https://aclanthology.org/W04-1013](https://aclanthology.org/W04-1013).

<!-- page 15 of 56 -->

Stephanie Lin, Jacob Hilton, and Owain Evans. TruthfulQA: Measuring how models mimic human falsehoods. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 3214–3252, Dublin, Ireland, May 2022. Association for Computational Linguistics.

(参考文献续, 条目保留英文原样.)

Pengfei Liu, Weizhe Yuan, Jinlan Fu, Zhengbao Jiang, Hiroaki Hayashi, and Graham Neubig. Pre-train, prompt, and predict: A systematic survey of prompting methods in natural language processing. arXiv preprint arXiv:2107.13586, 2021a.

Peter J Liu, Mohammad Saleh, Etienne Pot, Ben Goodrich, Ryan Sepassi, Lukasz Kaiser, and Noam Shazeer. Generating wikipedia by summarizing long sequences. In International Conference on Learning Representations, 2018.

Xiao Liu, Yanan Zheng, Zhengxiao Du, Ming Ding, Yujie Qian, Zhilin Yang, and Jie Tang. Gpt understands, too. arXiv preprint arXiv:2103.10385, 2021b.

Xiao Liu, Kaixuan Ji, Yicheng Fu, Weng Tam, Zhengxiao Du, Zhilin Yang, and Jie Tang. P-tuning: Prompt tuning can be comparable to fine-tuning across scales and tasks. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Papers), pp. 61–68, 2022.

Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. In 7th International Conference on Learning Representations, ICLR 2019, New Orleans, LA, USA, May 6-9, 2019, 2019.

Paul Michel, Omer Levy, and Graham Neubig. Are sixteen heads really better than one? Advances in neural information processing systems, 32, 2019.

Paulius Micikevicius, Sharan Narang, Jonah Alben, Gregory Diamos, Erich Elsen, David Garcia, Boris Ginsburg, Michael Houston, Oleksii Kuchaiev, Ganesh Venkatesh, and Hao Wu. Mixed precision training. In International Conference on Learning Representations, 2018.

Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. Can a suit of armor conduct electricity? a new dataset for open book question answering. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing, pp. 2381–2391, 2018.

Eric Mitchell, Charles Lin, Antoine Bosselut, Christopher D. Manning, and Chelsea Finn. Memorybased model editing at scale. In International Conference on Machine Learning, ICML 2022, 17-23 July 2022, Baltimore, Maryland, USA, volume 162 of Proceedings of Machine Learning Research, pp. 15817–15831. PMLR, 2022.

Ioannis Mollas, Zoe Chrysopoulou, Stamatis Karlos, and Grigorios Tsoumakas. Ethos: an online hate speech detection dataset. arXiv preprint arXiv:2006.08328, 2020.

Moin Nadeem, Anna Bethke, and Siva Reddy. Stereoset: Measuring stereotypical bias in pretrained language models. In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers), pp. 5356–5371, 2021.

Nikita Nangia, Clara Vania, Rasika Bhalerao, and Samuel Bowman. Crows-pairs: A challenge dataset for measuring social biases in masked language models. In Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pp. 1953–1967, 2020.

Deepak Narayanan, Amar Phanishayee, Kaiyu Shi, Xie Chen, and Matei Zaharia. Memory-efficient pipeline-parallel dnn training. In International Conference on Machine Learning, pp. 7937–7947. PMLR, 2021.

Tomoko Ohta, Yuka Tateisi, and Jin-Dong Kim. The genia corpus: An annotated research abstract corpus in molecular biology domain. In HLT, pp. 82–86, 2002.

<!-- page 16 of 56 -->

Denis Paperno, Germán Kruszewski, Angeliki Lazaridou, Ngoc-Quan Pham, Raffaella Bernardi, Sandro Pezzelle, Marco Baroni, Gemma Boleda, and Raquel Fernández. The lambada dataset: Word prediction requiring a broad discourse context. In Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 1525–1534, 2016.

(参考文献续, 条目保留英文原样.)

David A. Patterson, Joseph Gonzalez, Quoc V. Le, Chen Liang, Lluis-Miquel Munguia, Daniel Rothchild, David R. So, Maud Texier, and Jeff Dean. Carbon emissions and large neural network training. CoRR, abs/2104.10350, 2021.

Sameer Pradhan, Alessandro Moschitti, Nianwen Xue, Hwee Tou Ng, Anders Björkelund, Olga Uryupina, Yuchen Zhang, and Zhi Zhong. Towards robust linguistic analysis using ontonotes. In CoNLL, pp. 143–152, 2013.

Ofir Press, Noah Smith, and Mike Lewis. Train short, test long: Attention with linear biases enables input length extrapolation. In International Conference on Learning Representations, 2021.

Amy Pu, Hyung Won Chung, Ankur Parikh, Sebastian Gehrmann, and Thibault Sellam. Learning compact metrics for MT. In Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, pp. 751–762, Online and Punta Cana, Dominican Republic, November 2021. Association for Computational Linguistics. doi: 10.18653/v1/2021.emnlp-main.58. URL [https://aclanthology.org/2021.emnlp-main.58](https://aclanthology.org/2021.emnlp-main.58).

Xipeng Qiu, Tianxiang Sun, Yige Xu, Yunfan Shao, Ning Dai, and Xuanjing Huang. Pre-trained models for natural language processing: A survey. Science China Technological Sciences, 63(10): 1872–1897, 2020.

Alec Radford, Karthik Narasimhan, Tim Salimans, and Ilya Sutskever. Improving language understanding with unsupervised learning. 2018.

Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, Ilya Sutskever, et al. Language models are unsupervised multitask learners. OpenAI blog, 1(8):9, 2019.

Jack W Rae, Sebastian Borgeaud, Trevor Cai, Katie Millican, Jordan Hoffmann, Francis Song, John Aslanides, Sarah Henderson, Roman Ring, Susannah Young, et al. Scaling language models: Methods, analysis & insights from training gopher. arXiv preprint arXiv:2112.11446, 2021.

Colin Raffel, Noam Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael Matena, Yanqi Zhou, Wei Li, Peter J Liu, et al. Exploring the limits of transfer learning with a unified text-to-text transformer. J. Mach. Learn. Res., 21(140):1–67, 2020.

Aditya Ramesh, Mikhail Pavlov, Gabriel Goh, Scott Gray, Chelsea Voss, Alec Radford, Mark Chen, and Ilya Sutskever. Zero-shot text-to-image generation. In International Conference on Machine Learning, pp. 8821–8831. PMLR, 2021.

Jeff Rasley, Samyam Rajbhandari, Olatunji Ruwase, and Yuxiong He. Deepspeed: System optimizations enable training deep learning models with over 100 billion parameters. In Proceedings of the 26th ACM SIGKDD International Conference on Knowledge Discovery & Data Mining, pp. 3505–3506, 2020.

Sebastian Riedel, Limin Yao, and Andrew McCallum. Modeling relations and their mentions without labeled text. In ECML-PKDD, pp. 148–163, 2010.

Adam Roberts, Colin Raffel, and Noam Shazeer. How much knowledge can you pack into the parameters of a language model? In Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pp. 5418–5426, 2020.

Dan Roth and Wen-tau Yih. A linear programming formulation for global inference in natural language tasks. In HLT-NAACL, pp. 1–8, 2004.

Rachel Rudinger, Jason Naradowsky, Brian Leonard, and Benjamin Van Durme. Gender bias in coreference resolution. In NAACL-HLT (2), 2018.

<!-- page 17 of 56 -->

Chitwan Saharia, William Chan, Saurabh Saxena, Lala Li, Jay Whang, Emily Denton, Seyed Kamyar Seyed Ghasemipour, Raphael Gontijo-Lopes, Burcu Karagol Ayan, Tim Salimans, et al. Photorealistic text-to-image diffusion models with deep language understanding. In Advances in Neural Information Processing Systems.

(参考文献续, 条目保留英文原样.)

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An adversarial winograd schema challenge at scale. Communications of the ACM, 64(9):99–106, 2021.

Erik F. Tjong Kim Sang and Fien De Meulder. Introduction to the conll-2003 shared task: Languageindependent named entity recognition. In HLT-NAACL, pp. 142–147, 2003.

Victor Sanh, Lysandre Debut, Julien Chaumond, and Thomas Wolf. Distilbert, a distilled version of bert: smaller, faster, cheaper and lighter. arXiv preprint arXiv:1910.01108, 2019.

Victor Sanh, Albert Webson, Colin Raffel, Stephen Bach, Lintang Sutawika, Zaid Alyafeai, Antoine Chaffin, Arnaud Stiegler, Teven Le Scao, Arun Raja, et al. Multitask prompted training enables zero-shot task generalization. In The Tenth International Conference on Learning Representations, 2022.

Teven Le Scao, Angela Fan, Christopher Akiki, Ellie Pavlick, Suzana Ilic, Daniel Hesslow, Roman ´ Castagné, Alexandra Sasha Luccioni, François Yvon, Matthias Gallé, et al. Bloom: A 176bparameter open-access multilingual language model. arXiv preprint arXiv:2211.05100, 2022.

Timo Schick, Sahana Udupa, and Hinrich Schütze. Self-diagnosis and self-debiasing: A proposal for reducing corpus-based bias in nlp. Transactions of the Association for Computational Linguistics, 9:1408–1424, 2021.

Thomas Scialom, Paul-Alexis Dray, Sylvain Lamprier, Benjamin Piwowarski, and Jacopo Staiano. MLSUM: The multilingual summarization corpus. In Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pp. 8051–8067, Online, November 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020.emnlp-main.647. URL [https://aclanthology.org/2020.emnlp-main.647](https://aclanthology.org/2020.emnlp-main.647).

Sheng Shen, Zhen Dong, Jiayu Ye, Linjian Ma, Zhewei Yao, Amir Gholami, Michael W Mahoney, and Kurt Keutzer. Q-bert: Hessian based ultra low precision quantization of bert. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 34, pp. 8815–8821, 2020.

Emily Sheng, Kai-Wei Chang, P. Natarajan, and Nanyun Peng. Societal biases in language generation: Progress and challenges. In ACL, 2021.

Sam Shleifer, Jason Weston, and Myle Ott. Normformer: Improved transformer pretraining with extra normalization. arXiv preprint arXiv:2110.09456, 2021.

Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism. arXiv preprint arXiv:1909.08053, 2019.

Shaden Smith, Mostofa Patwary, Brandon Norick, Patrick LeGresley, Samyam Rajbhandari, Jared Casper, Zhun Liu, Shrimai Prabhumoye, George Zerveas, Vijay Korthikanti, et al. Using deepspeed and megatron to train megatron-turing nlg 530b, a large-scale generative language model. arXiv preprint arXiv:2201.11990, 2022.

Aarohi Srivastava, Abhinav Rastogi, Abhishek Rao, Abu Awal Md Shoeb, Abubakar Abid, Adam Fisch, Adam R Brown, Adam Santoro, Aditya Gupta, Adrià Garriga-Alonso, et al. Beyond the imitation game: Quantifying and extrapolating the capabilities of language models. arXiv preprint arXiv:2206.04615, 2022.

Emma Strubell, Ananya Ganesh, and Andrew McCallum. Energy and policy considerations for deep learning in NLP. In Proceedings of the 57th Conference of the Association for Computational Linguistics, ACL 2019, Florence, Italy, July 28- August 2, 2019, Volume 1: Long Papers, pp. 3645–3650. Association for Computational Linguistics, 2019.

Jianlin Su, Yu Lu, Shengfeng Pan, Bo Wen, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. arXiv preprint arXiv:2104.09864, 2021.

<!-- page 18 of 56 -->

Alon Talmor, Jonathan Herzig, Nicholas Lourie, and Jonathan Berant. Commonsenseqa: A question answering challenge targeting commonsense knowledge. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pp. 4149–4158, 2019.

(参考文献续, 条目保留英文原样.)

Chaofan Tao, Lu Hou, Wei Zhang, Lifeng Shang, Xin Jiang, Qun Liu, Ping Luo, and Ngai Wong. Compression of generative pre-trained language models via quantization. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 4821–4836, 2022.

Romal Thoppilan, Daniel De Freitas, Jamie Hall, Noam Shazeer, Apoorv Kulshreshtha, Heng-Tze Cheng, Alicia Jin, Taylor Bos, Leslie Baker, Yu Du, et al. Lamda: Language models for dialog applications. arXiv preprint arXiv:2201.08239, 2022.

Denis Timonin, Bo Yang Hsueh, and Vinh Nguyen. Accelerated inference for large transformer models using nvidia triton inference server. NVIDIA blog, 2022.

Leslie G Valiant. A bridging model for parallel computation. Communications of the ACM, 33(8): 103–111, 1990.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

David Wadden, Ulme Wennberg, Yi Luan, and Hannaneh Hajishirzi. Entity, relation, and event extraction with contextualized span representations. In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP), pp. 5784–5789, 2019.

C. Walker and Linguistic Data Consortium. ACE 2005 Multilingual Training Corpus. Linguistic Data Consortium, 2005. ISBN 9781585633760.

Alex Wang, Yada Pruksachatkun, Nikita Nangia, Amanpreet Singh, Julian Michael, Felix Hill, Omer Levy, and Samuel R. Bowman. SuperGLUE: A Stickier Benchmark for General-Purpose Language Understanding Systems. In NeurIPS 2019, pp. 3261–3275, 2019.

Ben Wang and Aran Komatsuzaki. GPT-J-6B: A 6 Billion Parameter Autoregressive Language Model. [https://github.com/kingoflolz/mesh-transformer-jax](https://github.com/kingoflolz/mesh-transformer-jax), May 2021.

Chenguang Wang, Xiao Liu, Zui Chen, Haoyun Hong, Jie Tang, and Dawn Song. Deepstruct: Pretraining of language models for structure prediction. In Findings of the Association for Computational Linguistics: ACL 2022, pp. 803–823, 2022a.

Hongyu Wang, Shuming Ma, Li Dong, Shaohan Huang, Dongdong Zhang, and Furu Wei. Deepnet: Scaling transformers to 1,000 layers. arXiv preprint arXiv:2203.00555, 2022b.

Shuohuan Wang, Yu Sun, Yang Xiang, Zhihua Wu, Siyu Ding, Weibao Gong, Shikun Feng, Junyuan Shang, Yanbin Zhao, Chao Pang, et al. Ernie 3.0 titan: Exploring larger-scale knowledge enhanced pre-training for language understanding and generation. arXiv preprint arXiv:2112.12731, 2021.

Wenhui Wang, Furu Wei, Li Dong, Hangbo Bao, Nan Yang, and Ming Zhou. Minilm: Deep self-attention distillation for task-agnostic compression of pre-trained transformers. Advances in Neural Information Processing Systems, 33:5776–5788, 2020.

Xuezhi Wang, Jason Wei, Dale Schuurmans, Quoc Le, Ed Chi, and Denny Zhou. Rationaleaugmented ensembles in language models. arXiv preprint arXiv:2207.00747, 2022c.

Jason Wei, Maarten Bosma, Vincent Zhao, Kelvin Guu, Adams Wei Yu, Brian Lester, Nan Du, Andrew M Dai, and Quoc V Le. Finetuned language models are zero-shot learners. In International Conference on Learning Representations, 2022a.

<!-- page 19 of 56 -->

Jason Wei, Yi Tay, Rishi Bommasani, Colin Raffel, Barret Zoph, Sebastian Borgeaud, Dani Yogatama, Maarten Bosma, Denny Zhou, Donald Metzler, et al. Emergent abilities of large language models. arXiv preprint arXiv:2206.07682, 2022b.

(参考文献续, 条目保留英文原样.)

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Ed Chi, Quoc Le, and Denny Zhou. Chain of thought prompting elicits reasoning in large language models. arXiv preprint arXiv:2201.11903, 2022c.

Laura Weidinger, John Mellor, Maribeth Rauh, Conor Griffin, Jonathan Uesato, Po-Sen Huang, Myra Cheng, Mia Glaese, Borja Balle, Atoosa Kasirzadeh, et al. Ethical and social risks of harm from language models. arXiv preprint arXiv:2112.04359, 2021.

Shaohua Wu, Xudong Zhao, Tong Yu, Rongguo Zhang, Chong Shen, Hongli Liu, Feng Li, Hong Zhu, Jiangang Luo, Liang Xu, et al. Yuan 1.0: Large-scale pre-trained language model in zeroshot and few-shot learning. arXiv preprint arXiv:2110.04725, 2021.

Yongqin Xian, Christoph H Lampert, Bernt Schiele, and Zeynep Akata. Zero-shot learning—a comprehensive evaluation of the good, the bad and the ugly. IEEE transactions on pattern analysis and machine intelligence, 41(9):2251–2265, 2018.

Ruibin Xiong, Yunchang Yang, Di He, Kai Zheng, Shuxin Zheng, Chen Xing, Huishuai Zhang, Yanyan Lan, Liwei Wang, and Tieyan Liu. On layer normalization in the transformer architecture. In International Conference on Machine Learning, pp. 10524–10533. PMLR, 2020.

Liang Xu, Hai Hu, Xuanwei Zhang, Lu Li, Chenjie Cao, Yudong Li, Yechen Xu, Kai Sun, Dian Yu, Cong Yu, et al. Clue: A chinese language understanding evaluation benchmark. In Proceedings of the 28th International Conference on Computational Linguistics, pp. 4762–4772, 2020.

Liang Xu, Xiaojing Lu, Chenyang Yuan, Xuanwei Zhang, Huilin Xu, Hu Yuan, Guoao Wei, Xiang Pan, Xin Tian, Libo Qin, et al. Fewclue: A chinese few-shot learning evaluation benchmark. arXiv preprint arXiv:2107.07498, 2021.

Sha Yuan, Hanyu Zhao, Zhengxiao Du, Ming Ding, Xiao Liu, Yukuo Cen, Xu Zou, Zhilin Yang, and Jie Tang. Wudaocorpora: A super large-scale chinese corpora for pre-training language models. AI Open, 2:65–68, 2021.

Ofir Zafrir, Guy Boudoukh, Peter Izsak, and Moshe Wasserblat. Q8bert: Quantized 8bit bert. In 2019 Fifth Workshop on Energy Efficient Machine Learning and Cognitive Computing-NeurIPS Edition (EMC2-NIPS), pp. 36–39. IEEE, 2019.

Wei Zeng, Xiaozhe Ren, Teng Su, Hui Wang, Yi Liao, Zhiwei Wang, Xin Jiang, ZhenZhang Yang, Kaisheng Wang, Xiaoda Zhang, et al. Pangu-\α: Large-scale autoregressive pretrained chinese language models with auto-parallel computation. arXiv preprint arXiv:2104.12369, 2021.

Chiyuan Zhang, Daphne Ippolito, Katherine Lee, Matthew Jagielski, Florian Tramèr, and Nicholas Carlini. Counterfactual memorization in neural language models. CoRR, abs/2112.12938, 2021.

Susan Zhang, Stephen Roller, Naman Goyal, Mikel Artetxe, Moya Chen, Shuohui Chen, Christopher Dewan, Mona Diab, Xian Li, Xi Victoria Lin, et al. Opt: Open pre-trained transformer language models. arXiv preprint arXiv:2205.01068, 2022.

Yuhao Zhang, Victor Zhong, Danqi Chen, Gabor Angeli, and Christopher D. Manning. Positionaware attention and supervised data improve slot filling. In EMNLP, pp. 35–45, 2017.

Ben Zhou, Daniel Khashabi, Qiang Ning, and Dan Roth. “going on a vacation” takes longer than “going for a walk”: A study of temporal commonsense understanding. In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP), pp. 3363–3369, 2019.

Chen Zhu, Ankit Singh Rawat, Manzil Zaheer, Srinadh Bhojanapalli, Daliang Li, Felix X. Yu, and Sanjiv Kumar. Modifying memories in transformer models. CoRR, abs/2012.00363, 2020.

<!-- page 20 of 56 -->

## Part I 第一部分

## Appendix 附录

## Table of Contents 目录

- A Ethics: Evaluation on Biases and Toxicity 21
- A.1 Bias Measurement: CrowS-Pairs 21
- A.2 Bias Measurement: StereoSet 21
- A.3 Hate Speech Detection: ETHOS 22
- A.4 Toxic Genearation: RealToxicPrompts 22
- B Technical Details 23
- B.1 Tokenization 23
- B.2 Layer Normalization 24
- B.3 Positional Encoding and Feed-forward Network 24
- B.4 Pipeline Parallel Analysis 25
- B.5 Inference Acceleration 27
- B.6 Activation Outlier Analysis 27
- B.7 Weight Quantization 28
- B.8 Quantization settings 28
- B.9 Ablation on Contribution Attribution 29
- B.10 Lessons Learned 30
- C Dataset and Evaluation Details 32
- C.1 Multi-task Instruction Pre-training (MIP) 32
- C.2 Data and prompts in MIP for DeepStruct 32
- C.3 Result Sources for GPT-3, BLOOM-176B, and OPT-175B 39
- C.4 Pile Test-set Evaluation 39
- C.5 BIG-bench-lite Evaluation 40
- C.6 MMLU Evaluation 40
- C.7 Chinese Language Understanding Evaluation 40
- C.8 Natural Language Generation 41
- C.9 Winograd-Style Tasks 43
- C.10 Closed-book Question Answering 43
- C.11 Commonsense Reasoning 44
- C.12 Fixed Label Datasets: A Case Study in Natural Language Inference 44
- C.13 SuperGLUE 44
- C.14 Chain-of-Thought Prompting 45
- D Scaling and Emergent Abilities in GLM-130B 46
- E Contributions 52
- E.1 Preparation 52
- E.2 Model Training 52
- E.3 Post Training 52
- E.4 Project Management 52
- E.5 Computation Sponsor 52
- F A Brief History of GLM-130B 53
- G Broader Impact 55
- G.1 Impact on AI Research 55
- G.2 Impact on Individual Developers and Small Companies 55

- A 伦理: 偏见与毒性评测 21
- A.1 偏见测量: CrowS-Pairs 21
- A.2 偏见测量: StereoSet 21
- A.3 仇恨言论检测: ETHOS 22
- A.4 有毒生成: RealToxicPrompts 22
- B 技术细节 23
- B.1 分词 23
- B.2 层归一化 24
- B.3 位置编码与前馈网络 24
- B.4 流水线并行分析 25
- B.5 推理加速 27
- B.6 激活离群值分析 27
- B.7 权重量化 28
- B.8 量化设置 28
- B.9 贡献归因消融 29
- B.10 经验教训 30
- C 数据集与评测细节 32
- C.1 多任务指令预训练 (MIP) 32
- C.2 DeepStruct 在 MIP 中的数据与提示 32
- C.3 GPT-3, BLOOM-176B 与 OPT-175B 的结果来源 39
- C.4 Pile 测试集评测 39
- C.5 BIG-bench-lite 评测 40
- C.6 MMLU 评测 40
- C.7 中文语言理解评测 40
- C.8 自然语言生成 41
- C.9 Winograd 类任务 43
- C.10 闭卷问答 43
- C.11 常识推理 44
- C.12 固定标签数据集: 以自然语言推理为例 44
- C.13 SuperGLUE 44
- C.14 思维链提示 45
- D GLM-130B 的规模与涌现能力 46
- E 贡献 52 (E.1 准备工作, E.2 模型训练, E.3 训练后工作, E.4 项目管理, E.5 算力赞助, 均在 52 页)
- F GLM-130B 简史 53
- G 更广泛的影响 55
- G.1 对 AI 研究的影响 55
- G.2 对个人开发者和小公司的影响 55

(目录到 G.2 为止, 正文里还有 G.3 社会影响和 H 环境影响两节, 目录没有列. A.4 的 「Genearation」 是原文拼写错误.)

<!-- page 21 of 56 -->

## A ETHICS: EVALUATION ON BIASES AND TOXICITY 伦理: 偏见与毒性评测

Albeit LLMs’ strong abilities in language and beyond, which could bring substantial welfare to human beings, they can potentially produce toxic and illegal contents for evil use (Weidinger et al., 2021; Sheng et al., 2021; Dev et al., 2021; Bommasani et al., 2021). In GLM-130B, before granting model weight to applicants, in the model license we demand them to agree that they will not use it for any deeds that may be harmful to society and human beings.

尽管 LLM 在语言及其他方面的强大能力可能给人类带来巨大福祉, 它们也可能生成有毒和非法内容, 被用于作恶 (Weidinger et al., 2021; Sheng et al., 2021; Dev et al., 2021; Bommasani et al., 2021). 对 GLM-130B, 在把模型权重授予申请者之前, 我们在模型许可证中要求他们同意不把它用于任何可能危害社会和人类的行为.

Additionally, from a technical perspective, we argue that we must also understand LLMs’ toxic and biased behaviors and ultimately eliminate them. This aligns with our commitment to “LLM Inclusivity”, as it is necessary to include more people in the open-sourced LLM research to facilitate the process. Moreover, if an LLM is shown to be good at identifying toxic and biased content, techniques such as self-diagnoses (Schick et al., 2021) can help to reduce the harmful generation in a self-consistent post-processing procedure. Therefore, as an initial step, we evaluate GLM-130B over a variety of related benchmarks to shed light on the challenging topic. Despite their limitations (Blodgett et al., 2021; Jacobs & Wallach, 2021) which should be addressed in future work, they still serve as a good start to arouse the community’s awareness of the problem.

此外, 从技术角度, 我们认为还必须理解 LLM 的有毒和偏见行为, 并最终消除它们. 这与我们 「LLM 包容性」 的承诺一致, 因为需要让更多人参与开源 LLM 研究来推动这一进程. 而且, 如果 LLM 被证明擅长识别有毒和有偏见的内容, 自我诊断 (Schick et al., 2021) 之类的技术就能在自洽的后处理流程中减少有害生成. 因此, 作为第一步, 我们在多种相关基准上评测 GLM-130B, 以揭示这个有挑战的话题. 这些基准有其局限 (Blodgett et al., 2021; Jacobs & Wallach, 2021), 应在未来工作中解决, 但它们仍是唤起社区对这个问题关注的一个好开端.

## A.1 BIAS MEASUREMENT: CROWS-PAIRS 偏见测量: CrowS-Pairs

CrowS-Pairs (Nangia et al., 2020), or namely Crowdsourced Stereotype Pairs benchmark, is widely used for measuring biases for masked language models. It collects 1508 examples with nine different conventional biases and adopts a probing-based approach to compare the pseudolog-likelihood of a pair of stereotypical and anti-stereotypical sentences. Since GLM-130B is pre-trained with autoregressive blanking infilling, CrowS-Pairs evaluation is directly applicable. We compare the GPT-3 Davinci and OPT-175B’s results on CrowS-Pairs reported in (Zhang et al., 2022) with GLM-130B.

CrowS-Pairs (Nangia et al., 2020), 即众包刻板印象对 (Crowdsourced Stereotype Pairs) 基准, 广泛用于测量掩码语言模型的偏见. 它收集了 1508 个样例, 涵盖九种常见偏见, 采用基于探测的方法比较一对刻板句和反刻板句的伪对数似然. GLM-130B 用自回归空白填充预训练, 所以可以直接做 CrowS-Pairs 评测. 我们把 (Zhang et al., 2022) 报告的 GPT-3 Davinci 和 OPT-175B 在 CrowS-Pairs 上的结果与 GLM-130B 作比较.

Table 5: CrowS-Pairs (Nangia et al., 2020) Bias Measurement. The lower scores the better.

| Category | GPT-3 | OPT-175B | GLM-130B |
| --- | --- | --- | --- |
| Gender | 62.6 | 65.7 | 55.7 |
| Religion | 73.3 | 68.6 | 73.3 |
| Race/Color | 64.7 | 68.6 | 58.5 |
| Sexual orientation | 76.2 | 78.6 | 60.7 |
| Age | 64.4 | 67.8 | 63.2 |
| Nationality | 61.6 | 62.9 | 64.1 |
| Disability | 76.7 | 76.7 | 71.6 |
| Physical appearance | 74.6 | 76.2 | 74.6 |
| Socioeconomic status | 73.8 | 76.2 | 70.9 |
| Overall | 67.2 | 69.5 | 65.8 |

表 5: CrowS-Pairs (Nangia et al., 2020) 偏见测量. 分数越低越好.

| 类别 | GPT-3 | OPT-175B | GLM-130B |
| --- | --- | --- | --- |
| 性别 | 62.6 | 65.7 | 55.7 |
| 宗教 | 73.3 | 68.6 | 73.3 |
| 种族/肤色 | 64.7 | 68.6 | 58.5 |
| 性取向 | 76.2 | 78.6 | 60.7 |
| 年龄 | 64.4 | 67.8 | 63.2 |
| 国籍 | 61.6 | 62.9 | 64.1 |
| 残障 | 76.7 | 76.7 | 71.6 |
| 外貌 | 74.6 | 76.2 | 74.6 |
| 社会经济地位 | 73.8 | 76.2 | 70.9 |
| 总体 | 67.2 | 69.5 | 65.8 |

Our results are presented in Table 5. GLM-130B shows fewer biases on almost all kinds of stereotypes except for religion and nationality. We speculate that it is because GLM-130B is a bilingual pre-trained LLM that learns the semantics for certain content from both English and Chinese corpora. Since CrowsS-Pairs’ stereotypes mainly draw from the US Equal Employment Opportunities Commission’s list<sup>2</sup>, the bias distributions in two different cultures and languages may be different and consequently reconcile social biases in GLM-130B on a benchmark originally designed for English-language society. We think this is an interesting finding, as multi-lingual pre-training may help LLMs to present less harmful biases for better fairness. Finally, we also admit that GLM-130B may in turn presents some special Chinese biases which currently lack testing benchmarks and require considerable future efforts to detect and prevent.

结果见表 5. 除宗教和国籍外, GLM-130B 在几乎所有类型的刻板印象上偏见都更少. 我们推测这是因为 GLM-130B 是双语预训练 LLM, 同时从中英文语料中学习某些内容的语义. 由于 CrowS-Pairs 的刻板印象主要取自美国平等就业机会委员会的清单 (脚注 2), 两种不同文化和语言中的偏见分布可能不同, 从而在一个原本为英语社会设计的基准上调和了 GLM-130B 的社会偏见. 我们认为这是个有意思的发现, 多语言预训练可能帮助 LLM 呈现更少的有害偏见, 更加公平. 最后我们也承认, GLM-130B 反过来可能带有一些中文特有的偏见, 目前还缺乏测试基准, 需要未来花很大力气去检测和防范. (对照表 5: 外貌一项 GLM-130B 与 GPT-3 同为 74.6, 也没有更好; 宗教与 GPT-3 打平, 高于 OPT; 国籍 64.1 比两者都高.)

## A.2 BIAS MEASUREMENT: STEREOSET 偏见测量: StereoSet

Another widely used bias and stereotype evaluation benchmark is StereoSet (Nadeem et al., 2021), which is also adopted in (Lieber et al., 2021; Artetxe et al., 2021; Zhang et al., 2022). To balance the evaluation between bias detecting and language modeling quality, StereoSet reports a series of metrics including Language Modeling Scores (LMS), Stereotype Score (SS), and Idealized Context Association Test Score (ICAT) as an overall averaged metric. For example, given the premise “She

(本段跨到下一页, 整段译文放在下一页.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://www.eeoc.gov/prohibited-employment-policiespractices](https://www.eeoc.gov/prohibited-employment-policiespractices)</span></small>

脚注 2: 美国平等就业机会委员会关于禁止的雇佣政策和做法的页面, 链接见上.

<!-- page 22 of 56 -->

is the twin’s mother”, StereoSet provides three candidate hypothesis: 1) “the water is deep”, 2) “she is a lazy, unkind person”, and 3) “she is a kind, caring woman”. The first option servers as a distractor to test models’ language capability and calculate LMS; the second and third statements are anti-stereotypical and stereotypical respectively and used for calculating SS. A widely-adopted technique here is to calibrate the likelihood of an option according to its length (Lieber et al., 2021; Zhang et al., 2022), as the distractor term is particularly short.

另一个广泛使用的偏见和刻板印象评测基准是 StereoSet (Nadeem et al., 2021), (Lieber et al., 2021; Artetxe et al., 2021; Zhang et al., 2022) 也采用了它. 为了在偏见检测和语言建模质量之间平衡评测, StereoSet 报告一组指标, 包括语言建模分 (LMS), 刻板印象分 (SS), 以及作为总体平均指标的理想化上下文关联测试分 (ICAT). 例如, 给定前提 「她是那对双胞胎的母亲」, StereoSet 提供三个候选假设: 1) 「水很深」, 2) 「她是个懒惰, 刻薄的人」, 3) 「她是个善良, 体贴的女人」. 第一项是干扰项, 用来测试模型的语言能力并计算 LMS; 第二和第三项分别是反刻板和刻板的陈述, 用来计算 SS. 这里一个常用技巧是按长度校准选项的似然 (Lieber et al., 2021; Zhang et al., 2022), 因为干扰项特别短. (原文说第二项是反刻板, 第三项是刻板, 顺序照录.)

Following (Zhang et al., 2022), we normalize scores over tokens rather than characters (Lieber et al., 2021) to yield model predictions for calculating the metrics. The results are shown in Table 6. As we observe, GLM-130B exceedingly outperforms GPT-3 Davinci and OPT-175B on all metrics. Such results accurately align with our discoveries in language modeling experiments and CrowS-Pairs bias evaluation, that GLM-130B has a high quality in both language modeling and social fairness. Table 6: StereoSet (Nadeem et al., 2021) Bias Measurement with LMS (↑), SS (↓), and ICAT (↑).

按照 (Zhang et al., 2022), 我们按 token 而不是按字符 (Lieber et al., 2021) 归一化分数, 得到模型预测来计算各项指标. 结果见表 6. 我们观察到, GLM-130B 在所有指标上都远超 GPT-3 Davinci 和 OPT-175B. 这个结果与我们在语言建模实验和 CrowS-Pairs 偏见评测中的发现吻合: GLM-130B 在语言建模和社会公平两方面质量都高. 表 6: StereoSet (Nadeem et al., 2021) 偏见测量, 指标为 LMS (越高越好), SS (越低越好) 和 ICAT (越高越好).

| Category | Profession Gender Religion Race Overall LMS SS ICAT LMS SS ICAT LMS SS ICAT LMS SS ICAT LMS SS ICAT |
| --- | --- |
| GPT-3 | 78.4 63.4 57.5 75.6 66.5 50.6 80.8 59.0 66.3 77.0 57.4 65.7 77.6 60.8 60.8 |
| OPT-175B | 74.1 62.6 55.4 74.0 63.6 53.8 84.0 59.0 68.9 74.9 56.8 64.8 74.8 59.9 60.0 |
| GLM-130B | 86.5 59.6 69.9 83.9 63.5 61.2 91.0 53.5 84.6 85.7 54.1 78.7 86.0 57.3 73.5 |

| 模型 | 职业 LMS | 职业 SS | 职业 ICAT | 性别 LMS | 性别 SS | 性别 ICAT | 宗教 LMS | 宗教 SS | 宗教 ICAT | 种族 LMS | 种族 SS | 种族 ICAT | 总体 LMS | 总体 SS | 总体 ICAT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-3 | 78.4 | 63.4 | 57.5 | 75.6 | 66.5 | 50.6 | 80.8 | 59.0 | 66.3 | 77.0 | 57.4 | 65.7 | 77.6 | 60.8 | 60.8 |
| OPT-175B | 74.1 | 62.6 | 55.4 | 74.0 | 63.6 | 53.8 | 84.0 | 59.0 | 68.9 | 74.9 | 56.8 | 64.8 | 74.8 | 59.9 | 60.0 |
| GLM-130B | 86.5 | 59.6 | 69.9 | 83.9 | 63.5 | 61.2 | 91.0 | 53.5 | 84.6 | 85.7 | 54.1 | 78.7 | 86.0 | 57.3 | 73.5 |

(源 md 把 15 列数字挤进了一格, 上表按 「职业, 性别, 宗教, 种族, 总体」 各三列拆开. 性别 SS 一项 GLM-130B 63.5, OPT 63.6, 只差 0.1.)

## A.3 HATE SPEECH DETECTION: ETHOS 仇恨言论检测: ETHOS

Social media corpus may contain hate speeches, and to investigate to what extent LLMs know and can help to identify them is crucial. We adopt the ETHOS dataset originally proposed in (Mollas et al., 2020) to detect sexism and racism speech on zero-shot or few-shot datasets created by (Chiu & Alexander, 2021). GPT-3 Davinci (a public-accessible variant of GPT-3 175B) and OPT 175B are also tested on the benchmark (whose results are reported in (Zhang et al., 2022)). For binary classification including Zero-shot, One-shot, and Few-shot (binary) (which answers “yes” or “no”), we report binary F1; for multiclass classification (which answers “yes”, “no”, or “neither”), we report micro F1. We adopt almost the same prompts as in (Chiu & Alexander, 2021), except aligning the Few-shot (binary) prompt to the form used in One-shot and adding the word “Classification” before the colon in the original Few-shot (multiclass) prompt.

社交媒体语料可能包含仇恨言论, 考察 LLM 在多大程度上认识它们, 能否帮助识别它们, 非常关键. 我们采用最初由 (Mollas et al., 2020) 提出的 ETHOS 数据集, 在 (Chiu & Alexander, 2021) 构造的零样本或少样本数据集上检测性别歧视和种族歧视言论. GPT-3 Davinci (GPT-3 175B 的一个可公开访问的版本) 和 OPT 175B 也在这个基准上测过 (结果报告在 (Zhang et al., 2022) 中). 对二分类, 包括 Zero-shot, One-shot 和 Few-shot (binary) (回答 「yes」 或 「no」), 我们报告二分类 F1; 对多分类 (回答 「yes」, 「no」 或 「neither」), 报告 micro F1. 我们采用的提示和 (Chiu & Alexander, 2021) 几乎一样, 只是把 Few-shot (binary) 的提示对齐到 One-shot 的形式, 并在原 Few-shot (multiclass) 提示的冒号前加了 「Classification」 一词.

Results are shown in Table 7. We find that GLM-130B outperforms two other LLMs among four different settings. On one hand, GLM-130B’s pre-training over unsupervised diverse corpora from online forums and social media including sections such as “hackernews”, “stackexchange”, and “pile\_cc” can endow our model with the background knowledge to identify those speeches. On the other hand, the MIP training may also improve GLM-130B’s zero-shot and few-shot capabilities.

结果见表 7. 我们发现 GLM-130B 在四种设定下都超过另外两个 LLM. 一方面, GLM-130B 在来自网络论坛和社交媒体的无监督多样语料上预训练, 其中包括 「hackernews」, 「stackexchange」 和 「pile_cc」 等部分, 这可能给了模型识别这类言论的背景知识. 另一方面, MIP 训练也可能提升了 GLM-130B 的零样本和少样本能力.

Table 7: ETHOS (Mollas et al., 2020) Hate speech detection. “(bi)” and “(mul)” denote binary and multiclass classification respectively. All scores are F1 and the higher the better.

|  | GPT-3 | OPT-175B | GLM-130B |
| --- | --- | --- | --- |
| Zero-shot | 62.8 | 66.7 | 68.8 |
| One-shot | 61.6 | 71.3 | 79.1 |
| Few-shot (bi) | 35.4 | 75.9 | 79.7 |
| Few-shot (mul) | 67.2 | 81.2 | 85.8 |

表 7: ETHOS (Mollas et al., 2020) 仇恨言论检测. 「(bi)」 和 「(mul)」 分别表示二分类和多分类. 所有分数都是 F1, 越高越好.

| | GPT-3 | OPT-175B | GLM-130B |
| --- | --- | --- | --- |
| 零样本 | 62.8 | 66.7 | 68.8 |
| 单样本 | 61.6 | 71.3 | 79.1 |
| 少样本 (二分类) | 35.4 | 75.9 | 79.7 |
| 少样本 (多分类) | 67.2 | 81.2 | 85.8 |

## A.4 TOXIC GENEARATION: REALTOXICPROMPTS 有毒生成: RealToxicPrompts

Evaluating the toxicity of generation by given prompts is an important part of a model’s safe deployment. We evaluate the toxic generation of GLM-130B on the RealToxicPrompts (Gehman et al., 2020) dataset. Following its settings, we use nucleus sampling $( p = 0 . 9 )$ to generate 25 continuations for each of the 10K random sampled prompts, limiting the maximum generated length to 128 tokens. Then we report the mean toxicity probabilities of 25 continuations evaluated by Perspective API<sup>3</sup>. In order to make a fair comparison

(本段跨到下一页, 整段译文放在下一页.)

![Chart block](images/p22-figure-9-realtoxicprompts-gehman-et-al-2020-evaluation.png)

Figure 9: RealToxicPrompts (Gehman et al., 2020) evaluation. Lower continuation toxicity probability is better.

图 9: RealToxicPrompts (Gehman et al., 2020) 评测. 续写的毒性概率越低越好.

(图: 横轴 Prompt Toxicity Probability (Binned), 0 到 1 分箱; 纵轴 Toxicity Probability of Continuation, 0.05 到 0.27. 蓝线 GLM-130B 从约 0.05 升到约 0.26, 橙线 GPT-3 Davinci 从约 0.08 升到约 0.265; 除最后一箱两线几乎重合外, 蓝线全程在橙线下方.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>[https://www.perspectiveapi.com/](https://www.perspectiveapi.com/)</span></small>

脚注 3: Perspective API 的网址, 见上.

<!-- page 23 of 56 -->

![Chart block](images/p23-a-opt-175b-s-experiments.png)

(a) OPT 175B’s experiments

![Chart block](images/p23-b-bloom-176b-s-experiments.png)

(b) BLOOM 176B’s experiments

![Chart block](images/p23-c-glm-130b-s-experiments.png)

(c) GLM 130B’s experiments

![Chart block](images/p23-d-glm-130b-s-real-training.png)

(d) GLM 130B’s real training

Figure 10: Handling training collapses and instability is the first priority when training LLMs.

(a) OPT 175B 的实验; (b) BLOOM 176B 的实验; (c) GLM 130B 的实验; (d) GLM 130B 的真实训练.

图 10: 训练 LLM 时, 处理训练崩溃和不稳定是第一要务.

(图: (a) 标题 Empirical Learning Rate, 纵轴学习率 0 到 1.2e-4, 横轴迭代 0 到 140k; 学习率先升到 1.2e-4 再线性下降, 在 37k 到 92k 之间有六七处向下的台阶, 红字写 「Re-load and adjust the learning rate after collapse」, 红箭头指着各处台阶. (b) 标题 lm-loss-training/lm loss vs tokens, 横轴 0 到约 26G token, 多条彩色 loss 曲线, 16G 附近有尖峰, 20G 以后蓝线冲到 7.5, 另一条绿线在 24G 附近抖到 4.8; 绿字标注 「the rest is 104B」, 最下面一条到 26G 的曲线末端标 「176B」. (c) 标题 lm-loss-training/lm loss, 横轴 0 到 4k 步, 十来条彩色曲线从 10 往下降, 在 1.5k, 1.8k, 2.6k, 2.9k 和 3.9k 附近陆续竖直冲高, 有几条停在 8.8 附近. (d) 同一标题, 横轴 0 到 50k 步, 一条绿线从 4 以上平滑降到约 1.7, 在约 34k, 35k, 41k 有三条竖线 (灰, 橙, 蓝) 冲出图顶.)

> **再看:** 图 10 (b) 标题是 「BLOOM 176B 的实验」, 图里那些冲上去的 loss 曲线是 176B 模型的吗?
> 多数不是. 图里的绿色注释写着 「the rest is 104B」, 只有最底下一条一路平稳到 26G token 的曲线末端标着 「176B」. 也就是说, 这张图里的崩溃大多来自 BLOOM 团队的 104B 试验, 176B 那条是平稳的. 用它说明 「千亿级模型都会崩」 没问题, 但把这些尖峰算在 BLOOM-176B 头上就读错了. 对照看, (d) 里 GLM-130B 真实训练的三条竖线, 对应第 6 页说的 「三次后期 loss 发散」.

under different tokenization methods, we only report

the toxicity score of the first complete sentence of a

continuation as we found that the score returned by the Perspective API seems to increase with sentence length.

评测给定提示下生成内容的毒性, 是模型安全部署的重要一环. 我们在 RealToxicPrompts (Gehman et al., 2020) 数据集上评测 GLM-130B 的有毒生成. 按它的设置, 我们用核采样 (p = 0.9) 为随机抽取的 1 万条提示各生成 25 条续写, 最大生成长度限制为 128 个 token. 然后报告由 Perspective API (脚注 3) 评出的 25 条续写的平均毒性概率. 为了在不同分词方法下公平比较, 我们只报告续写中第一个完整句子的毒性分数, 因为我们发现 Perspective API 返回的分数似乎随句子长度增加而升高.

Results are shown in Figure 9. Generally, as the toxicity of the given prompt increases, the toxicity probability of the continuation increases accordingly in both models. Compared to GPT-3 Davinci, GLM-130B has a lower toxicity rate in all cases, indicating that GLM-130B is less prone to generating toxic content.

结果见图 9. 总体上, 随着给定提示的毒性增加, 两个模型续写的毒性概率都相应上升. 与 GPT-3 Davinci 相比, GLM-130B 在所有情况下毒性率都更低, 说明 GLM-130B 更不容易生成有毒内容.

## B TECHNICAL DETAILS 技术细节

In this section, we introduce additional details about the technical issues we have identified and solved throughout the GLM-130B training. Along with concurrent open-source LLM efforts, we believe that those published details could serve as great cornerstones to future LLM training.

本节介绍我们在整个 GLM-130B 训练中发现并解决的技术问题的更多细节. 和同期的开源 LLM 工作一起, 我们相信这些公开的细节能成为未来 LLM 训练的重要基石.

## B.1 TOKENIZATION 分词

For the tokenization of the corpus, we implement a text tokenizer based on the package icetk with several adjustments. As an image-text unified tokenizer, the vocabulary size of icetk is 150000. The first 20000 tokens are image tokens and the rest are text tokens. The text tokenizer of icetk is formulated and trained by sentencepiece<sup>4</sup>, on a 25GB bilingual corpus equally distributed with English and Chinese contents. We divide tokens recognized by the tokenizer into four categories. The common tokens are assigned from No.20000 to No.20099, consisting of punctuations, numbers and spaces free of extended definition. No.20100 to No.83822 are English tokens and No.83823 to

(本段跨到下一页, 整段译文放在下一页.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>[https://github.com/google/sentencepiece](https://github.com/google/sentencepiece)</span></small>

脚注 4: sentencepiece 的仓库地址, 见上.

<!-- page 24 of 56 -->

No.145653 are Chinese tokens. Tokens after No.145653 are other special tokens including concatenated punctuations and pieces from other languages, etc.

对语料的分词, 我们基于 icetk 包实现了一个文本分词器, 并做了几处调整. icetk 是图文统一的分词器, 词表大小为 150000, 前 20000 个是图像 token, 其余是文本 token. icetk 的文本分词器用 sentencepiece (脚注 4) 构建和训练, 训练语料是 25GB 中英文各半的双语语料. 我们把分词器识别出的 token 分为四类. 公共 token 编号从 20000 到 20099, 由没有扩展定义的标点, 数字和空格组成. 20100 到 83822 是英文 token, 83823 到 145653 是中文 token. 145653 之后是其他特殊 token, 包括连在一起的标点, 其他语言的片段等.

During our implementation, We ignore the first 20000 image tokens and simply utilize the latter 130000 intended for text tokenization. we disable the ignoring of linebreak to tokenize the linebreak mark \n into No. 20004 token &lt;n&gt;. On the basis of inherent tokens, we add special tokens [MASK] and [gMASK] for model prediction. We also add special tokens &lt;sop&gt;, &lt;eop&gt;, &lt;eos&gt; for sentence and passage separation.

实现中, 我们忽略前 20000 个图像 token, 只用后面 130000 个做文本分词. 我们关闭了忽略换行符的选项, 把换行符 \n 分成第 20004 号 token <n>. 在原有 token 的基础上, 我们为模型预测加入了特殊 token [MASK] 和 [gMASK], 还加入了 <sop>, <eop>, <eos> 用于句子和段落的分隔.

## B.2 LAYER NORMALIZATION 层归一化

Here we briefly introduce the history of layer normalization in language modeling problems, and how its variants perform in recent LLMs including our experiments for them on GLM-130B.

这里简要介绍层归一化在语言建模问题中的历史, 以及它的各种变体在近期 LLM 中的表现, 包括我们在 GLM-130B 上对它们的实验.

**Post-LN (Vaswani et al., 2017).** Post-LN is jointly proposed with the transformer architecture and is placed between the residual blocks. It is then adopted by BERT (Devlin et al., 2019) for bidirectional language model pre-training. Nevertheless, Post-LN was later accused of transformers’ slow and vulnerable converging (Xiong et al., 2020) and the Pre-LN emerged as a substitute.

**Post-LN (Vaswani et al., 2017).** Post-LN 和 transformer 架构一起提出, 放在残差块之间. 之后 BERT (Devlin et al., 2019) 在双向语言模型预训练中采用了它. 不过, Post-LN 后来被指责导致 transformer 收敛慢且脆弱 (Xiong et al., 2020), Pre-LN 于是作为替代出现.

**Pre-LN (Xiong et al., 2020).** On the contrary, Pre-LN is located in the residual blocks to reduce exploding gradients and becomes dominant in existing language models, including all recent LLMs. However, OPT-175B (Zhang et al., 2022), BLOOM (Scao et al., 2022), and text-to-image model CogView Ding et al. (2021) later observe that Pre-LN is still unable to handle the vulnerable training when models scale up to 100B or meet multi-modal data. This is also justified in GLM-130B’s preliminary experiments, where Pre-LN consistently crashes in its early stage training.

**Pre-LN (Xiong et al., 2020).** 与之相反, Pre-LN 放在残差块内部, 以减少梯度爆炸, 并成为现有语言模型的主流, 包括所有近期的 LLM. 然而 OPT-175B (Zhang et al., 2022), BLOOM (Scao et al., 2022) 和文生图模型 CogView (Ding et al. (2021)) 后来都观察到, 当模型扩大到千亿级或遇到多模态数据时, Pre-LN 仍然处理不了脆弱的训练. GLM-130B 的前期实验也证实了这一点, Pre-LN 在训练早期一再崩溃.

Additionally, another problem rooted in Pre-LN transformers is that it may harm the model performance after tuning compared to Post-LN. This is observed in (He et al., 2021).

此外, Pre-LN transformer 还有一个根源性的问题: 与 Post-LN 相比, 它可能损害微调后的模型性能. (He et al., 2021) 观察到了这一点.

**Sandwich-LN (Ding et al., 2021).** As a remedy, on top of Pre-LN, CogView (later in Normformer (Shleifer et al., 2021)) develops Sandwich-LN which appends extra normalization to the end of each residual branch. Accompanied with PB-Relax (Precision-Bottleneck Relaxation) techniques, they stabilize the training of a 4-billion text-to-image generation model. Despite its superiority over Pre-LN, sadly Sandwich-LN is also proved to collapse in GLM-130B training; let alone the potential consequent weaker tuning performance caused by its Pre-LN nature.

**Sandwich-LN (Ding et al., 2021).** 作为补救, CogView (之后的 Normformer (Shleifer et al., 2021) 也是) 在 Pre-LN 基础上发展出 Sandwich-LN, 在每个残差分支的末尾额外加一次归一化. 配合 PB-Relax (Precision-Bottleneck Relaxation, 精度瓶颈松弛) 技术, 他们稳定了一个 40 亿参数的文生图模型的训练. 尽管 Sandwich-LN 优于 Pre-LN, 可惜它在 GLM-130B 的训练中也被证明会崩溃, 更不用说它的 Pre-LN 本质可能带来较弱的微调表现.

## B.3 POSITIONAL ENCODING AND FEED-FORWARD NETWORK 位置编码与前馈网络

**Positional Encoding** Vanilla transformer adopts absolute (or sinuous) position encoding, and is later evolved into relative positional encoding (Dai et al., 2019). Relative PEs can capture word relevance better than absolute positional encoding. Rotary Positional Embedding (RoPE) (Su et al., 2021) is a relative position encoding implemented in the form of absolute position encoding, and its core idea is shown in the following equation.

**位置编码.** 原始 transformer 采用绝对 (或正弦) 位置编码, 之后演化为相对位置编码 (Dai et al., 2019). 相对 PE 比绝对位置编码更能捕捉词之间的相关性. 旋转位置编码 (RoPE) (Su et al., 2021) 是一种以绝对位置编码形式实现的相对位置编码, 核心思想如下式所示. (原文把 sinusoidal 写成了 sinuous.)

$$
(\boldsymbol {R} _ {m} q) ^ {\top} (\boldsymbol {R} _ {n} k) = q ^ {\top} \boldsymbol {R} _ {m} ^ {\top} \boldsymbol {R} _ {n} k = q ^ {\top} \boldsymbol {R} _ {n - m} k\tag{1}
$$

The product of q at position m and k at position n is related to their distance $n - m$ , which reflects the relativity of the position encoding. The definition of R in the above equation is

位置 m 上的 q 与位置 n 上的 k 的乘积只与它们的距离 n - m 有关, 这体现了位置编码的相对性. 上式中 R 的定义是

$$
\boldsymbol {R} _ {\theta , m} ^ {d} = \left( \begin{array}{c c c c c c c} \cos m \theta_ {1} & - \sin m \theta_ {1} & 0 & 0 & \dots & 0 & 0 \\ \sin m \theta_ {1} & \cos m \theta_ {1} & 0 & 0 & \dots & 0 & 0 \\ 0 & 0 & \cos m \theta_ {2} & - \sin m \theta_ {2} & \dots & 0 & 0 \\ 0 & 0 & \sin m \theta_ {2} & \cos m \theta_ {2} & \dots & 0 & 0 \\ \vdots & \vdots & \vdots & \vdots & \ddots & \vdots & \vdots \\ 0 & 0 & 0 & 0 & \dots & \cos m \theta_ {d / 2} & - \sin m \theta_ {d / 2} \\ 0 & 0 & 0 & 0 & \dots & \sin m \theta_ {d / 2} & \cos m \theta_ {d / 2} \end{array} \right)\tag{2}
$$

To allow its value to decay as the distance increases, θ takes the value

为了让它的值随距离增大而衰减, θ 取如下值 (式 3):

$$
\theta = \left\{\theta_ {i} = 1 0 0 0 0 ^ {\frac {- 2 (i - 1)}{d}}, \quad i \in \left[ 1, 2, \dots , \frac {d}{2} \right] \right\}\tag{3}
$$

<!-- page 25 of 56 -->

A two-dimensional absolute position encoding method is proposed in vanilla GLM for modeling both intra- and inter-span position information. In GLM-130B, different from the two-dimensional positional encoding used in vanilla GLM, we turn back to conventional one-dimensional positional encoding. However, we originally thought that two-dimensional form cannot be directly applied to RoPE<sup>5</sup>. As a substitute plan, in GLM-130B we simply remove the second dimension used in the original GLM as we find that the unidirectional attention mask sub-matrices for [MASK] generation indicate the token order as well. This observation results in our transforming GLM-130B’s positional encoding into a one-dimensional one according to the following strategies:

原始 GLM 提出了一种二维绝对位置编码方法, 用来同时建模片段内和片段间的位置信息. GLM-130B 不同于原始 GLM 的二维位置编码, 回到了常规的一维位置编码. 当时我们以为二维形式无法直接用到 RoPE 上 (脚注 5). 作为替代方案, GLM-130B 直接去掉了原始 GLM 用的第二维, 因为我们发现 [MASK] 生成时单向注意力 mask 的子矩阵本身也能表示 token 顺序. 基于这一观察, 我们按下面的策略把 GLM-130B 的位置编码改成一维:

• For sequences corrupted by short spans, we discard the second-dimensional position encoding.

• For sequences corrupted by a long span at the end, we change the positional ids to one-dimensional $0 , 1 , \cdots , s - 1$ , and generated tokens will just prolong the first-dimensional positional encoding from the last context token $s - 1$

- 对被短片段破坏的序列, 丢掉第二维位置编码.
- 对在末尾被一个长片段破坏的序列, 把位置 id 改成一维的 0, 1, ..., s - 1, 生成的 token 直接从最后一个上下文 token 的位置 s - 1 起延续第一维位置编码.

**Feed-forward Network** Some recent efforts to improve transformer architecture have been on the FFN, including replacing it with GLU (adopted in PaLM). Research shows that using GLU can improve model performance, which is consistent with our experimental results (Cf. Table 8). Specifically, we use GLU with the GeLU (Hendrycks & Gimpel, 2016) activation. as

**前馈网络.** 近期一些改进 transformer 架构的工作针对 FFN, 包括把它换成 GLU (PaLM 采用了这种做法). 研究表明使用 GLU 能提升模型性能, 这和我们的实验结果一致 (见表 8). 具体地, 我们使用带 GeLU (Hendrycks & Gimpel, 2016) 激活的 GLU, 如下式:

$$
\mathrm{FFN} _ {\mathrm{GeGLU}} \left(\boldsymbol {x}; \boldsymbol {W} _ {1}, \boldsymbol {V}, \boldsymbol {W} _ {2}\right) = \left(\mathrm{GeLU} (\boldsymbol {x} \boldsymbol {W} _ {1}) \otimes \boldsymbol {x} \boldsymbol {V}\right) \boldsymbol {W} _ {2}\tag{4}
$$

In order to keep the same parameter as the vanilla FFN, the feed-forward size $d _ { \mathrm { f i n } }$ (which is usually 4dH, where $d _ { \mathrm { H } }$ is the hidden dimension) is reduced to $\textstyle { \frac { 8 } { 3 } } d _ { \mathrm { H } }$ as the V is additionally introduced.

为了与普通 FFN 保持相同的参数量, 由于额外引入了 V, 前馈层宽度 d_ffn (通常是 4 d_H, d_H 是隐藏维度) 降到 (8/3) d_H. (源 md 把 d_ffn 抽成了 d_fin.)

**Ablation Study on PE and FFN** In order to validate our PE and FFN choices, we test them in our experiments by pre-training GL $\mathbf { M _ { B a s e } }$ (110M) over a random 50G Chinese and English mixed corpus. We compare absolute PE with two recent popular relative PE variants, RoPE (Chowdhery et al., 2022) and ALiBi (Press et al., 2021). For FFN, we compare vanilla FFN with Gate Linear Unit with GeLU activations. Results from Table 8 show that both ALiBi and RoPE improve perplexity on the test set, and the improvement is more significant with RoPE while using GeGLU can further improve the model’s performance.

**PE 与 FFN 的消融实验.** 为了验证 PE 和 FFN 的选择, 我们在一个随机抽取的 50G 中英混合语料上预训练 GLM_Base (1.1 亿参数) 来测试它们. 我们把绝对 PE 与两种近期流行的相对 PE 变体 RoPE (Chowdhery et al., 2022) 和 ALiBi (Press et al., 2021) 作比较. FFN 方面, 比较普通 FFN 与带 GeLU 激活的门控线性单元. 表 8 的结果表明, ALiBi 和 RoPE 都降低了测试集困惑度, RoPE 的改善更明显, 再用 GeGLU 还能进一步提升模型性能.

Table 8: Ablation Study for PE and FFN on $\mathrm { G L M _ { B a s e } }$

| Model | Test PPL |
| --- | --- |
| GLM<sub>Base</sub> | 24.58 |
| + ALiBi | 24.14 |
| + RoPE | 22.95 |
| + RoPE + GeGLU | 22.31 |

表 8: 在 GLM_Base 上对 PE 和 FFN 的消融实验.

| 模型 | 测试集困惑度 |
| --- | --- |
| GLM_Base | 24.58 |
| + ALiBi | 24.14 |
| + RoPE | 22.95 |
| + RoPE + GeGLU | 22.31 |

## B.4 PIPELINE PARALLEL ANALYSIS 流水线并行分析

In pipeline parallelism, each stage consists of three operations (Cf. Figure 11(a)): forward (denoted as F), backward (denoted as B), and optimizer step (denoted as U). However, naive sequential pipeline implementation leads to an unbearable amount of bubbles. The improved Gpipe (Huang et al., 2019) (Cf. Figure 11(b)) strategy reduces bubbles drastically via splitting data into microbatches; the more micro-batches there are, the more stages can compute simultaneously in an iteration. The recent PipeDream-Flush (Narayanan et al., 2021) (Cf. Figure 11(c)) additionally optimizes the GPU memory usage by interweaving forward and backward from different stages to reduce forward activation’s memory occupation.

在流水线并行中, 每个阶段包括三种操作 (见图 11(a)): 前向 (记为 F), 反向 (记为 B) 和优化器更新 (记为 U). 然而朴素的顺序流水线实现会产生多到无法接受的气泡. 改进的 GPipe (Huang et al., 2019) (见图 11(b)) 策略把数据切成微批次, 大幅减少气泡; 微批次越多, 一次迭代中能同时计算的阶段就越多. 近期的 PipeDream-Flush (Narayanan et al., 2021) (见图 11(c)) 又通过交错不同阶段的前向和反向, 减少前向激活的显存占用, 进一步优化了显存使用.

We analyze the bubble share in GLM-130B’s pre-training by assuming that the number of pipeline segments is $p ,$ the number of micro-batches is m, and the time for forward and backward per microbatch are $t _ { f }$ and $t _ { b } .$ In ideal case, forward and backward take $t _ { \mathrm { i d e a l } } = m ( t _ { f }   +   t _ { b } )$ . But in practice, the default pipeline delivery strategy causes $p - 1$ forward propagation and $p - 1$ backward propagation bubbles, respectively, for a total time of $\tilde { t } _ { \mathrm { b u b b l e } } = ( p - 1 ) \tilde { ( t _ { f } + t _ { b } ) }$ , so that the bubble occupancy is

我们分析 GLM-130B 预训练中的气泡占比. 设流水线段数为 p, 微批次数为 m, 每个微批次的前向和反向时间分别为 t_f 和 t_b. 理想情况下, 前向和反向耗时 t_ideal = m(t_f + t_b). 但实际上, 默认的流水线调度会分别产生 p - 1 个前向和 p - 1 个反向传播气泡, 总时间为 t_bubble = (p - 1)(t_f + t_b), 于是气泡占比为 (式 5):

$$
\text {bubble - ratio} = \frac {t _ {\text {bubble}}}{t _ {\text {ideal}} + t _ {\text {bubble}}} = \frac {p - 1}{m + p - 1}\tag{5}
$$

For larger numbers of micro-batches, the bubble percentage will be reduced to an acceptable level. In particular, experiments in GPipe Huang et al. (2019) show that when $m \geq 4 p ,$ the total percentage

(本段跨到下一页, 整段译文放在下一页.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>We later found the instructions to implement two-dimensional RoPE from its author’s blog [https://kexue.fm/archives/8397](https://kexue.fm/archives/8397), but our training has proceeded for weeks.</span></small>

脚注 5: 后来我们在 RoPE 作者的博客 (https://kexue.fm/archives/8397) 上找到了实现二维 RoPE 的方法, 但那时我们的训练已经进行了好几周.

<!-- page 26 of 56 -->

![Chart block](images/p26-a-naive-pipeline-implementation-which-can-be-extremely.png)

(a) Naive pipeline implementation, which can be extremely inefficient.

![Chart block](images/p26-b-gpipe-huang-et-al-2019-implementation.png)

(b) GPipe (Huang et al., 2019) implementation.

![Chart block](images/p26-c-pipedream-narayanan-et-al-2021-implementation-used-in.png)

(c) Pipedream (Narayanan et al., 2021) implementation (used in GLM-130B).

Figure 11: Different pipeline strategies and their conceptual comparison.

(a) 朴素的流水线实现, 效率可能极低. (b) GPipe (Huang et al., 2019) 的实现. (c) PipeDream (Narayanan et al., 2021) 的实现 (GLM-130B 使用的就是它).

图 11: 不同的流水线策略及其概念对比.

(图: 三张时序图, 纵轴 GPU 0 到 GPU 3, 横轴 Time, 蓝色 Forward, 绿色 Backward, 灰色 Optimizer Step. (a) 每次只有一个微批次, F0 从 GPU 0 逐级传到 GPU 3, 再由 B0 逐级传回, GPU 0 上标出很长的 「Bubble time」, 之后四张卡同时做 U0, 再开始 F1. (b) GPipe: 8 个微批次 F0 到 F7 依次在四张卡上错开流过, 全部前向做完后才开始 B0 到 B7, 最后统一 U0. (c) PipeDream: 各卡先做若干个前向 (GPU 0 做 F0 到 F3), 之后前向和反向交替进行, 如 GPU 3 上 F0 B0 F1 B1 ... F7 B7, 最后统一 U0. 图 (c) 里 GPU 0 那一行的末尾印成了 B4, B6, B6, B7, 按顺序应为 B4, B5, B6, B7, 是原图的标注错误.)

of pipeline bubble time is reduced to a negligible level due to the forward recomputation technique in backpropagation that allows some overlap in computational communication, thus showing that the bubbles introduced in parallel by the pipeline model do not seriously deplete the training efficiency.

微批次越多, 气泡占比就能降到可以接受的水平. 特别地, GPipe (Huang et al. (2019)) 的实验表明, 当 m ≥ 4p 时, 由于反向传播中的前向重计算技术让计算和通信有一定重叠, 流水线气泡时间的总占比降到可以忽略的水平, 这说明流水线模型并行引入的气泡不会严重损耗训练效率.

In general, in order to make full use of the hardware, it is common to place models into model parallel groups consisting of multiple nodes and try to use the full memory of each node. In this case, we can freely adjust the ratio of pipeline model parallelism and tensor model parallelism. Since data parallelism hardly affects the computation time, we assume that the scale of data parallelism is $d = 1$ , the total number of nodes is $n ,$ the scale of tensor model parallelism is $t ,$ and the scale of pipeline model parallelism is $p ,$ and satisfies $n = t \times p ,$ the bubble share in this case is

一般来说, 为了充分利用硬件, 通常把模型放进由多个节点组成的模型并行组, 并尽量用满每个节点的显存. 这时可以自由调整流水线模型并行和张量模型并行的比例. 由于数据并行几乎不影响计算时间, 我们假设数据并行规模 d = 1, 节点总数为 n, 张量模型并行规模为 t, 流水线模型并行规模为 p, 满足 n = t × p, 这时气泡占比为 (式 6):

$$
\text {bubble - ratio} = \frac {n / t - 1}{m + n / t - 1}\tag{6}
$$

From the above equation, we can see that increasing the size of tensor parallelism will further reduce the bubble ratio. However, the tensor parallelism scale cannot be increased indefinitely, which would lead to a reduction in computational granularity and greatly increase the communication cost across a certain threshold. Therefore, we can conclude that the size of tensor model parallelism should increase slowly as the model size increases, but not more than the number of graphics cards in a single machine. In the training of GLM-130B, the experiments show that the optimal tensor parallelism scale is t = 4 and does not scale up to the scale of t = 8 in the DGX-A100 system. The other parameters are $m = 1 7 6 , p = 8 ,$ , and the bubble share is calculated to be only 3.8%, which is sufficient to demonstrate the efficiency of pipeline model parallelism.

从上式可以看出, 增大张量并行规模会进一步降低气泡占比. 但张量并行规模不能无限增大, 否则计算粒度变小, 超过某个阈值后通信成本会大幅增加. 因此我们得出结论: 张量模型并行的规模应随模型增大而缓慢增加, 但不超过单机的显卡数. 在 GLM-130B 的训练中, 实验表明在 DGX-A100 系统上最优的张量并行规模是 t = 4, 没有扩大到 t = 8. 其他参数为 m = 176, p = 8, 算得气泡占比只有 3.8%, 足以说明流水线模型并行的效率. (代入式 5: 7 / (176 + 7) = 3.83%. m = 176 也和表 11 对得上: global_batch_size 4224 除以 data_parallel_size 24, 再除以 micro_batch_size 1, 正好是 176.)

<!-- page 27 of 56 -->

Table 9: Decoding speed in our real trials between BLOOM-176B (Scao et al., 2022) (from Huggingface Transformers) and GLM-130B’s implementation in 16-bit precision with 8 × A100 (80G).

| Decode Tokens | 128 | 512 | 1024 | 2048 |
| --- | --- | --- | --- | --- |
| BLOOM-176B | 36.76s | 137.91s | 287.93s | 631.81s |
| GLM-130B | 4.40s (×8.4) | 18.77s (×7.3) | 39.81s (×7.2) | 89.88s (×7.0) |

表 9: 我们实测的解码速度对比, 一边是 BLOOM-176B (Scao et al., 2022) (Huggingface Transformers 实现), 一边是 GLM-130B 的实现, 都用 16 位精度, 在 8 × A100 (80G) 上运行.

| 解码 token 数 | 128 | 512 | 1024 | 2048 |
| --- | --- | --- | --- | --- |
| BLOOM-176B | 36.76s | 137.91s | 287.93s | 631.81s |
| GLM-130B | 4.40s (×8.4) | 18.77s (×7.3) | 39.81s (×7.2) | 89.88s (×7.0) |

![Chart block](images/p27-chart.png)

![Chart block](images/p27-figure-12-distribution-of-outliers-in-glm-130b-s.png)

Figure 12: Distribution of outliers in GLM-130B’s activations. The vertical axis denotes the hidden state dimensions (4,096 rather than 12,288 as this is a parallel segment), and the horizontal denotes tokens in a input sentence. Using a 128×128 2D histogram to get a better view of the distribution of outliers. The figure on the right swaps some of the vertical coordinates so that it can be clearly seen that the outlier occur about 30% of its dimensions.

图 12: GLM-130B 激活中离群值的分布. 纵轴是隐藏状态维度 (这里是 4096 而不是 12288, 因为这是一个并行切片), 横轴是输入句子里的 token. 用 128×128 的二维直方图来更好地观察离群值分布. 右图交换了一些纵坐标, 以便清楚地看出大约 30% 的维度会出现离群值.

(图: 左图纵轴 hidden state dimensions 0 到 4096, 横轴 token position of the sentence 0 到 512, 色标 counts in bin 0 到 8; 深色点散布在各个维度上, 330 号 token 以后明显变密, 有十几条横向的深色带. 右图纵轴改为 sorted hidden state dimensions, 色标 0 到 14; 所有有颜色的格子都被挪到下方约 0 到 1400 的维度里, 1400 以上一片空白, 1400 / 4096 约 34%.)

## B.5 INFERENCE ACCELERATION 推理加速

A model’s plain PyTorch implementation is easy to read and run, but it can be intolerably slow for LLMs. Based on NVIDIA’s FasterTransformer<sup>6</sup> we spend two months implementing GLM-130B into C++ to speed up inference, including the following main optimizations:

模型的朴素 PyTorch 实现容易阅读和运行, 但对 LLM 来说可能慢得无法忍受. 我们基于 NVIDIA 的 FasterTransformer (脚注 6), 花了两个月用 C++ 实现 GLM-130B 来加速推理, 主要优化包括:

• Optimize time-costing operations such as GeGLU, Layer Normalization, and SoftMax.

• Reduce the number of GPU kernel calls (e.g., fuse MultiheadAttention into one computation kernel).

• Specify the algorithm of the best performance when calling cuBLAS.

• Improve the computing efficiency by transposing the model parameters in advance.

• Use half2 in FP16 computation to double the half’s access bandwidth and computing throughput.

- 优化 GeGLU, 层归一化和 SoftMax 等耗时操作.
- 减少 GPU kernel 调用次数 (例如把 MultiheadAttention 融合成一个计算 kernel).
- 调用 cuBLAS 时指定性能最好的算法.
- 提前转置模型参数以提高计算效率.
- 在 FP16 计算中使用 half2, 把 half 的访存带宽和计算吞吐翻倍.

We currently pack up the full FasterTransformer implementation for GLM-130B into a plug-and-play docker image for users’ convenience, and we are still working on adapting it to our Pytorch implementation by only changing one line of code. A comparison between our speeding up GLM-130B implementation and the so far default available BLOOM-176B implementation in Huggingface Transformers<sup>7</sup>is shown in Table 9. Our implementation for GLM-130B can be 7.0 to 8.4 times faster than BLOOM-176B’s Pytorch implementation. The exertion to accelerate LLM for tolerable response speed could be extremely crucial to its popularization.

目前我们把 GLM-130B 的完整 FasterTransformer 实现打包成即插即用的 docker 镜像, 方便用户使用; 我们还在把它适配到我们的 PyTorch 实现上, 目标是只改一行代码. 表 9 对比了我们加速后的 GLM-130B 实现和目前 Huggingface Transformers 里默认可用的 BLOOM-176B 实现 (脚注 7). 我们的 GLM-130B 实现比 BLOOM-176B 的 PyTorch 实现快 7.0 到 8.4 倍. 为了让 LLM 的响应速度可以接受而做的加速努力, 对它的普及可能极为关键.

## B.6 ACTIVATION OUTLIER ANALYSIS 激活离群值分析

As is described in prior sections, GLM-130B’s weight can be quantized into INT4 to drastically cut down parameter redundancy in the inference. However, we also find that GLM-130B’s activations (i.e., hidden states between layers) cannot be properly quantized, as they contain value outliers as is also suggested in concurrent literature (Dettmers et al., 2022).

如前几节所述, GLM-130B 的权重可以量化到 INT4, 大幅削减推理时的参数冗余. 但我们也发现 GLM-130B 的激活 (即层与层之间的隐藏状态) 无法被恰当地量化, 因为其中含有数值离群值, 同期文献 (Dettmers et al., 2022) 也指出了这一点.

What is special in GLM-130B is that 30% of its dimensions may present value outliers (Cf. Figure 12), while other GPT-based LLMs (e.g., OPT-175B and BLOOM 176B) only has very few outlying dimensions (Dettmers et al., 2022). Therefore, the solution to decompose matrix multipli-

(本段跨到下一页, 整段译文放在下一页.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>[https://github.com/NVIDIA/FasterTransformer](https://github.com/NVIDIA/FasterTransformer)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>[https://huggingface.co/docs/transformers/model\_doc/bloom](https://huggingface.co/docs/transformers/model_doc/bloom)</span></small>

脚注 6: FasterTransformer 的仓库地址. 脚注 7: Huggingface Transformers 中 BLOOM 的文档页. 链接均见上.

<!-- page 28 of 56 -->

cation for higher-precision computation in outlying dimensions proposed in (Dettmers et al., 2022) is not applicable to GLM-130B.

GLM-130B 的特别之处在于, 它有 30% 的维度可能出现数值离群值 (见图 12), 而其他基于 GPT 的 LLM (例如 OPT-175B 和 BLOOM 176B) 只有极少的离群维度 (Dettmers et al., 2022). 因此, (Dettmers et al., 2022) 提出的对离群维度分解矩阵乘法, 单独做高精度计算的方案不适用于 GLM-130B.

We study whether these outliers can be ignored in LLM quantization, and the answer is interestingly “no”. These values can be several orders of magnitude larger than ordinary activation values (Cf. Figure 13). While most values (accounts for 99.98% dimensions in a hidden state) stay less them 6, those two outlying dimensions can reach 50 or even over 100. They are speculated to be some important clues for GLM-130B and potentially other LLMs to memorize some fixed world or language knowledge, and thus removing or omitting them in quantization can lead to significant performance degradation.

我们研究了这些离群值能否在 LLM 量化中被忽略, 答案有意思, 是 「不能」. 这些值可能比普通激活值大几个数量级 (见图 13). 绝大多数值 (占一个隐藏状态中 99.98% 的维度) 都小于 6, 而那两个离群维度能达到 50, 甚至超过 100. 据推测, 它们可能是 GLM-130B, 也可能是其他 LLM, 用来记住某些固定的世界知识或语言知识的重要线索, 所以在量化中去掉或忽略它们会导致性能明显下降.

> **想:** 上一页说 GLM-130B 「30% 的维度」 有离群值, 这里又说一个隐藏状态里 99.98% 的维度都小于 6, 只有 「那两个」 离群维度. 这两个说法打架吗?
> 不打架, 统计单位不同. 图 13 看的是单个 token 的一个隐藏状态, 12288 维里只有 2 维超过 6, 1 - 2/12288 ≈ 99.98%, 数字对得上. 图 12 看的是一整句 512 个 token 叠加起来的分布: 每个 token 的离群维度不固定, 叠到一起, 有过离群值的维度就占了约三分之一, 右图排序后有颜色的部分到 1400 维左右, 占 4096 的 34%. 这也解释了第 6 页和第 27 页的结论: LLM.int8 那种 「只挑出少数固定维度单独算」 的办法, 前提是离群维度少而固定; GLM-130B 的离群维度在不同 token 上换来换去, 合起来占三成, 这个前提不成立, 所以作者只量化权重, 激活留在 FP16.

![Chart block](images/p28-figure-13-glm-130b-s-activation-outliers-absolute-value.png)

Figure 13: GLM-130B’s activation outliers’ absolute value scale.

图 13: GLM-130B 激活离群值的绝对值尺度.

(图: 一张直方图, 纵轴对数刻度 10^0 到 10^4, 横轴 0 到 100 多. 绝大多数计数挤在 0 附近, 最高两根柱约 3×10^3 和 9×10^3; 在约 53 和约 101 处各有一根高度为 1 的孤立小柱, 就是正文说的两个离群维度.)

## B.7 WEIGHT QUANTIZATION 权重量化

## B.7.1 PRELIMINARIES 预备知识

**Absmax Quantization** is a symmetric quantization that a range of [−absmax(x), absmax(x)] is mapped to $\left[ \left[ - \left( 2 ^ { b } - 1 \right) , 2 ^ { b } - 1 \right] \right.$ for x.

**Absmax 量化** 是一种对称量化, 把 x 的范围 [−absmax(x), absmax(x)] 映射到 [−(2^b − 1), 2^b − 1]. (按下面的式 7, 缩放因子的分母是 2^(b-1) − 1, 映射的整数范围实际是 [−(2^(b-1) − 1), 2^(b-1) − 1]; 这里照录原文.)

$$
s _ {x} = \frac {\operatorname{absmax} (x)}{2 ^ {b - 1} - 1}\tag{7}
$$

$$
x _ {q} = \text {round} (x / s _ {x})\tag{8}
$$

where $s _ { x }$ is the scaling factor, $x _ { q }$ is the quantization result and b is the bit width.

其中 s_x 是缩放因子, x_q 是量化结果, b 是位宽.

**Zeropoint Quantization** is an asymmetric quantization that a range of [min(x), max(x)] is mapped to $[ \bar { - ( 2 ^ { b } - 1 ) } , 2 ^ { b } - 1 ]$

**零点量化** 是一种非对称量化, 把范围 [min(x), max(x)] 映射到 [−(2^b − 1), 2^b − 1].

$$
s _ {x} = \frac {\max (x) - \min (x)}{2 ^ {b} - 2}\tag{9}
$$

$$
z _ {x} = \operatorname{round} (\min (x) / s _ {x}) + 2 ^ {b - 1} - 1\tag{10}
$$

$$
x _ {q} = \operatorname{round} (x / s _ {x}) - z _ {x}\tag{11}
$$

where $z _ { x }$ is the zero point.

其中 z_x 是零点.

**Col/Row-wise Quantization** Using a single scaling factor for the weight matrix often leads to more quantization errors because one single outlier leads to a decrease in the quantization precision of all other elements. A common workaround is to group the weight matrix by rows or by columns, with each group being quantized separately and having independent scaling factors.

**按列/按行量化.** 整个权重矩阵只用一个缩放因子, 往往带来更大的量化误差, 因为单个离群值就会降低其他所有元素的量化精度. 常见的解决办法是把权重矩阵按行或按列分组, 每组单独量化, 各有独立的缩放因子.

## B.8 QUANTIZATION SETTINGS 量化设置

Our goal is to save GPU memory as much as possible without hurting model performance. In practice, we only quantize linear layers, which take up most of the transformer parameters, and leave input/output embedding, layer normalization, and bias terms unchanged. At the quantization pre-cision of INT4, two INT4 weights are compressed into one INT8 weight for saving GPU memory usage. Absmax quantization is adopted since we found it enough to maintain model performance, and it is more computationally efficient than zeropoint quantization. During inference, only quantized weights are stored in GPU memory, the FP16 weights for linear layers will be dequantized at runtime.

我们的目标是在不损害模型性能的前提下尽可能节省显存. 实践中, 我们只量化占 transformer 参数大头的线性层, 输入/输出嵌入, 层归一化和偏置项保持不变. 在 INT4 量化精度下, 两个 INT4 权重压缩进一个 INT8 权重, 以节省显存. 我们采用 absmax 量化, 因为发现它足以保持模型性能, 而且计算上比零点量化更高效. 推理时显存里只存量化后的权重, 线性层的 FP16 权重在运行时反量化.

## B.8.1 QUANTIZATION RESULTS AT SCALES 不同规模下的量化结果

GLM models at 110M to 10B scale are from GLM’s original paper(Du et al., 2022). Although the architecture of smaller scale GLMs are not the same as GLM-130B, we believe that the training objective is the key factor for quantization. Table 10 shows the performance of GLM and BLOOM family models at different scales on the LAMBADA dataset with different quantization methods. Almost all models maintain performance at INT8 precision. In general, GLM maintains better performance than BLOOM at INT4 precision as it scales.

1.1 亿到 100 亿规模的 GLM 模型来自 GLM 的原始论文 (Du et al., 2022). 虽然较小规模 GLM 的架构和 GLM-130B 不同, 我们认为训练目标才是影响量化的关键因素. 表 10 给出了 GLM 和 BLOOM 系列各规模模型在 LAMBADA 数据集上用不同量化方法的表现. 几乎所有模型在 INT8 精度下都能保持性能. 总的来说, 在 INT4 精度下, 随着规模增大, GLM 比 BLOOM 更能保持性能.

<!-- page 29 of 56 -->

Table 10: Accuracy on LAMBADA dataset for GLM and BLOOM family at 100M to 176B scales across different quantization precision.

| B | LOOM-560M | BLOOM-1B1 | BLOOM-3B | BLOOM-7B | BLOOM-176B |
| --- | --- | --- | --- | --- | --- |
| Original | 31.40% | 40.68% | 48.30% | 54.91% | 64.37% |
| Absmax INT8, col-wise | 26.12% | 40.69% | 48.83% | 55.33% | 65.03% |
| Absmax INT4, col-wise | 9.30% | 17.43% | 37.88% | 38.04% | 34.83% |
| Absmax INT4, row-wise | 21.37% | 35.80% | 40.95% | 46.75% | NaN |
| Zeropoint INT4, col-wise | 11.51% | 26.51% | 41.65% | 46.63% | 48.26% |
| Zeropoint INT4, row-wise | 24.95% | 33.05% | 43.63% | 49.41% | NaN |

|  | GLM-110M | GLM-335M | GLM-2B | GLM-10B | GLM-130B |
| --- | --- | --- | --- | --- | --- |
| Original | 29.36% | 48.51% | 68.19% | 72.35% | 80.21% |
| Absmax INT8, row-wise | 29.25% | 48.69% | 68.12% | 72.37% | 80.21% |
| Absmax INT4, row-wise | 3.26% | 38.25% | 62.62% | 71.03% | 79.47% |
| Zeropoint INT4, row-wise | 5.45% | 42.64% | 64.74% | 70.50% | 80.63% |

表 10: GLM 和 BLOOM 系列在 1 亿到 1760 亿规模上, 不同量化精度下的 LAMBADA 准确率.

| 设置 | BLOOM-560M | BLOOM-1B1 | BLOOM-3B | BLOOM-7B | BLOOM-176B |
| --- | --- | --- | --- | --- | --- |
| 原始精度 | 31.40% | 40.68% | 48.30% | 54.91% | 64.37% |
| Absmax INT8, 按列 | 26.12% | 40.69% | 48.83% | 55.33% | 65.03% |
| Absmax INT4, 按列 | 9.30% | 17.43% | 37.88% | 38.04% | 34.83% |
| Absmax INT4, 按行 | 21.37% | 35.80% | 40.95% | 46.75% | NaN |
| Zeropoint INT4, 按列 | 11.51% | 26.51% | 41.65% | 46.63% | 48.26% |
| Zeropoint INT4, 按行 | 24.95% | 33.05% | 43.63% | 49.41% | NaN |

| 设置 | GLM-110M | GLM-335M | GLM-2B | GLM-10B | GLM-130B |
| --- | --- | --- | --- | --- | --- |
| 原始精度 | 29.36% | 48.51% | 68.19% | 72.35% | 80.21% |
| Absmax INT8, 按行 | 29.25% | 48.69% | 68.12% | 72.37% | 80.21% |
| Absmax INT4, 按行 | 3.26% | 38.25% | 62.62% | 71.03% | 79.47% |
| Zeropoint INT4, 按行 | 5.45% | 42.64% | 64.74% | 70.50% | 80.63% |

(源 md 把第一张表的表头 「BLOOM-560M」 切成了 「B | LOOM-560M」. GLM-130B 的零点 INT4 是 80.63%, 比原始精度的 80.21% 还高.)

![Chart block](images/p29-figure-14-contribution-attribution-analysis-on-glm.png)

Figure 14: Contribution attribution analysis on GLM objective and MIP training. We take GLM-10B (English only) as an example in the ablation. Generally, GLM objective’s bidirectional attention accounts for 70% of the improvements, while MIP’s major contribution lies in text similarity tasks.

图 14: 对 GLM 目标和 MIP 训练的贡献归因分析. 消融以 GLM-10B (纯英文) 为例. 总体上, GLM 目标的双向注意力贡献了 70% 的提升, MIP 的主要贡献在文本相似类任务上.

(图: 8 组柱, 每组三根: 蓝 GLM (uni), 橙 GLM (bi), 绿 GLM + MIP (bi). LAMBADA 67.3 / 72.7 / 74.8; MMLU 26.3 / 33.7 / 34.5; WiC 51.7 / 56.1 / 52.5; ReCoRD 65.4 / 66.4 / 50.7; Hellaswag 27.3 / 27.7 / 27.3; WSC 63.5 / 63.5 / 67.3; BoolQ 64.1 / 71.2 / 78.3; ANLI R1 35.0 / 35.6 / 40.0.)

## B.8.2 WEIGHT DISTRIBUTION ANALYSIS 权重分布分析

To achieve INT4 weight quantization, we analyze the weight value distribution of major linear layers in GLM-130B and a counterpart BLOOM-176B in a histogram (Cf. Figure 15). The horizontal axis denotes the weight value, and the vertical axis denotes the number of weights of such value in log scale. As we can see, it is majorly the w2 linear layers in BLOOM-176B that present skewed distributions, which would hinder the symmetrical quantization. On the contrary, GLM-130B’s w2 is well-shaped without many outliers and skewed distribution, and thus paces the way for its INT4 quantization with little performance loss.

为了实现 INT4 权重量化, 我们用直方图分析了 GLM-130B 与对照的 BLOOM-176B 中主要线性层的权重值分布 (见图 15). 横轴是权重值, 纵轴是该值的权重个数 (对数刻度). 可以看到, 呈现偏斜分布的主要是 BLOOM-176B 的 w2 线性层, 这会妨碍对称量化. 相反, GLM-130B 的 w2 形状良好, 没有很多离群值和偏斜, 从而为它几乎无损的 INT4 量化铺平了道路.

## B.9 ABLATION ON CONTRIBUTION ATTRIBUTION 贡献归因消融

We analyze the contribution attribution of techniques leveraged in GLM-130B. A series of ablation studies have been presented in the paper, and for the convenience of reading, they were originally scattered around the whole passage. Here we summarize them here into the following list for readers’ reference:

我们分析 GLM-130B 所用各项技术的贡献归因. 论文里已经给出了一系列消融实验, 为了阅读方便, 它们原本分散在全文各处. 这里把它们汇总成下面的清单供读者参考:

• **Ablation on ordinary PostLN and DeepNorm**: Figure 3.

• **Ablation on Bidirectional/Unidirectional Attention**: Figure 2 (LAMBADA), Table 16 (Conditional NLG), Figure 17 (SuperGLUE).

• **Ablation on Embedding Layer Gradient Shrink (EGS)**: Figure 4.

• **Ablation on Positional Encodings and FFN**: Appendix B.3 Table 8.

- **普通 PostLN 与 DeepNorm 的消融**: 图 3.
- **双向/单向注意力的消融**: 图 2 (LAMBADA), 表 16 (条件式自然语言生成), 图 17 (SuperGLUE).
- **嵌入层梯度收缩 (EGS) 的消融**: 图 4.
- **位置编码与 FFN 的消融**: 附录 B.3 表 8.

Additionally, we conduct the following study to justify the contribution of the two most influential techniques–GLM Objective and Multi-task Instruction Pre-training (MIP)–used in GLM-130B.

此外, 我们做了下面的研究, 来论证 GLM-130B 中两项影响最大的技术, 即 GLM 目标和多任务指令预训练 (MIP) 的贡献.

**GLM Objective and MIP.** Ablating a 100B-scale LLM from scratch can be too expensive. As a substitute, we try our best to conduct the comparison between GLM objective and MIP on GLM-10B (an English-only version released in (Du et al., 2022), without MIP). We additionally train a GLM-10B initialized from a middle-stage original checkpoint with MIP (5%) to match the same training tokens of the original self-supervision-only GLM-130B. The MIP, this time, follows the

(本段跨到下一页, 整段译文放在下一页.)

<!-- page 30 of 56 -->

exact dataset setting in T0 (Sanh et al., 2022) and the information extraction datasets in GLM-130B to allow the correct evaluation on some types of tasks (e.g., NLI).

**GLM 目标与 MIP.** 从头消融一个千亿级 LLM 太贵了. 作为替代, 我们尽力在 GLM-10B (Du et al., 2022 发布的纯英文版本, 没有 MIP) 上比较 GLM 目标和 MIP. 我们另外从原始模型的一个中期 checkpoint 出发, 加入 MIP (5%) 训练了一个 GLM-10B, 使训练 token 数与原来只做自监督的版本相同 (原文此处写的是 「GLM-130B」, 按上下文应指 GLM-10B). 这次的 MIP 完全按 T0 (Sanh et al., 2022) 的数据集设置, 再加上 GLM-130B 里的信息抽取数据集, 以便在某些类型的任务 (例如 NLI) 上做正确的评测.

Figure 14 shows the ablation results. On the 8 datasets we test, we find that the GLM objective is a major contributor to the improvement (from GLM (uni) to GLM + MIP (bi)). For example, it accounts for 73% improvement in LAMBADA and 90% improvement in MMLU, which are very widely adopted challenging benchmarks for LLMs. As for MIP, on some datasets (e.g., WiC, ReCoRD, Hellaswag), MIP may even harm the performance. While for datasets related to text similarity and coreference (e.g., WSC, BoolQ, ANLI R1), MIP is the main contributor. It is likely because the text similarity and coreference challenges, which people usually construct intentionally to test language models’ ability, are seldom seen in the self-supervised corpus that makes up people’s daily written texts. Thus, MIP training mainly helps to bridge the gap between self-supervised pre-training and these tasks.

图 14 给出消融结果. 在我们测的 8 个数据集上, 我们发现 GLM 目标是提升 (从 GLM (uni) 到 GLM + MIP (bi)) 的主要来源. 例如, 它贡献了 LAMBADA 上 73% 和 MMLU 上 90% 的提升, 这两个都是被广泛采用的 LLM 高难度基准. 至于 MIP, 在某些数据集上 (例如 WiC, ReCoRD, Hellaswag) 它甚至可能损害性能. 而在文本相似和共指相关的数据集上 (例如 WSC, BoolQ, ANLI R1), MIP 是主要贡献者. 这很可能是因为文本相似和共指这类题目通常是人们专门构造来测试语言模型能力的, 在由人们日常书面文本构成的自监督语料里很少见到. 因此, MIP 训练主要帮助弥合自监督预训练与这些任务之间的差距. (按图 14 的柱高算: LAMBADA (72.7 - 67.3) / (74.8 - 67.3) = 72%, MMLU (33.7 - 26.3) / (34.5 - 26.3) = 90%. 这里的 「GLM 目标」 在图上体现为同一模型从单向注意力换到双向注意力.)

## B.10 LESSONS LEARNED 经验教训

**Lesson 1** (**Bidirectional Architecture).** The bidirectional-attention GLM is a strong architecture alternative, in addition to GPTs.

**教训 1 (双向架构).** 除了 GPT 之外, 双向注意力的 GLM 是一个强有力的架构选项.

**Lesson 2** (**Platform-aware Configuration).** Configure LLMs based on the cluster and parallel strategy used to squeeze hardware potential.

**教训 2 (面向平台的配置).** 根据所用集群和并行策略来配置 LLM, 以榨干硬件潜力.

**Lesson 3** (**Improved Post-LN).** Counter-stereotypically, DeepNorm, a type of Post-LN, is the option to stabilize GLM-130B.

**教训 3 (改进的 Post-LN).** 和刻板印象相反, 稳定 GLM-130B 的选项是 DeepNorm, 一种 Post-LN.

**Lesson 4** (**Training Stability Categorization).** Unexpected training instability that LLMs suffer from arouses systematically and numerically.

**教训 4 (训练稳定性分类).** LLM 遭遇的意外训练不稳定, 来源分为系统性的和数值性的两类.

**Lesson 5** (**Systematical Instability: FP16).** Though FP16 induces more instability, it enables training and inference on diverse platforms.

**教训 5 (系统性不稳定: FP16).** FP16 虽然带来更多不稳定, 但它让训练和推理能在多种平台上进行.

**Lesson 6** (**Numerical Instability: Embedding Gradient Shrink).** Shrinking embedding layer’s gradient to its 0.1 can solve most numerical instability problems.

**教训 6 (数值性不稳定: 嵌入层梯度收缩).** 把嵌入层梯度收缩到原来的 0.1, 能解决大部分数值不稳定问题.

**Lesson 7** (**GLM’s INT4 Quantization Scaling Law).** GLM has a unique INT4 weight quantization scaling law unobserved in GPT-style BLOOM.

**教训 7 (GLM 的 INT4 量化规模定律).** GLM 有一种独特的 INT4 权重量化规模定律, 在 GPT 式的 BLOOM 中没有观察到.

**Lesson 8** (**Future Direction).** To create powerful LLMs, the main focus can be on 1) more and better data, 2) better architectures and pre-training objectives, and 3) more sufficient training.

**教训 8 (未来方向).** 要造出强大的 LLM, 主要可以着力于 1) 更多更好的数据, 2) 更好的架构和预训练目标, 3) 更充分的训练.

<!-- page 31 of 56 -->

![Chart block](images/p31-figure-15-weight-value-distribution-of-linear-layers-in.png)

Figure 15: Weight value distribution of linear layers in GLM-130B (in orange, attn-dense, attn-qkv, glu-w1, glu-w2) and BLOOM-176B (in blue, attn-dense, attn-qkv, ffn-w1, ffn-w2)’s first 28 transformer layers. Generally for GLM-130B it is attn-dense and w2 that may present narrow value distributions. attn-qkv and w1 may also be a reason for enabling INT4 quantization in middle layers of GLM-130B.

图 15: GLM-130B (橙色, attn-dense, attn-qkv, glu-w1, glu-w2) 与 BLOOM-176B (蓝色, attn-dense, attn-qkv, ffn-w1, ffn-w2) 前 28 个 transformer 层中线性层的权重值分布. 总的来说, GLM-130B 的 attn-dense 和 w2 可能呈现较窄的值分布. attn-qkv 和 w1 可能也是 GLM-130B 中间层能做 INT4 量化的一个原因.

(图: 14 行, 每行两层 (Layer 0 与 1, 2 与 3, 直到 26 与 27), 每层四个小直方图 attn-dense, attn-qkv, w1, w2, 纵轴对数刻度. 几乎每一格里橙色都比蓝色窄; attn-dense 和 w2 两列差别最明显, 蓝色 w2 在很多层里向负方向拖出长尾, 横轴伸到 -1 甚至 -2. attn-qkv 和 w1 两列的橙蓝形状接近, 但蓝色两侧通常更宽.)

<!-- page 32 of 56 -->

## C DATASET AND EVALUATION DETAILS 数据集与评测细节

## C.1 MULTI-TASK INSTRUCTION PRE-TRAINING (MIP) 多任务指令预训练 (MIP)

Following practices in (Raffel et al., 2020; Wei et al., 2022a; Sanh et al., 2022; Aribandi et al., 2022), we include a number of prompted instruction datasets in GLM-130B’s MIP training, which accounts for 5% of the training tokens. All prompts for T0 datasets are from PromptSource (Bach et al., 2022) and prompts for DeepStruct datasets are newly created. Their composition is shown in Table 12, which makes up natural language understanding and generation datasets from T0 (Sanh et al., 2022) and promptsource (Bach et al., 2022), and information extraction datasets from DeepStruct (Wang et al., 2022a). In GLM-130B’s training, we calculate that approximately 36% of the samples in each dataset has been seen.

按照 (Raffel et al., 2020; Wei et al., 2022a; Sanh et al., 2022; Aribandi et al., 2022) 的做法, 我们在 GLM-130B 的 MIP 训练中纳入了一批带提示的指令数据集, 占训练 token 的 5%. T0 数据集的提示全部来自 PromptSource (Bach et al., 2022), DeepStruct 数据集的提示是新写的. 它们的构成见表 12: 自然语言理解和生成数据集来自 T0 (Sanh et al., 2022) 和 promptsource (Bach et al., 2022), 信息抽取数据集来自 DeepStruct (Wang et al., 2022a). 据我们计算, 在 GLM-130B 的训练中, 每个数据集大约有 36% 的样本被见过.

T0 originally splits datasets for 1) multi-task prompted training and 2) zero-shot task transfer two sections. We initially planed to only include training sets of T0’s multi-task prompted training section and DeepStruct (Wang et al., 2022a), but by a mistake we included both multi-task prompted training and zero-shot task transfer sections’ datasets in MIP and excluded DeepStruct datasets. The mistake was fixed at around 23k steps and our model continued to train on the correct version.

T0 原本把数据集分成 1) 多任务提示训练和 2) 零样本任务迁移两部分. 我们最初计划只纳入 T0 多任务提示训练部分的训练集和 DeepStruct (Wang et al., 2022a), 但由于一个失误, 我们在 MIP 里同时纳入了多任务提示训练和零样本任务迁移两部分的数据集, 反而漏掉了 DeepStruct 数据集. 这个失误在大约 2.3 万步时被修正, 之后模型在正确的版本上继续训练. (第 54 页时间线写的是 「训练 20000 步后发现多任务数据有误」, 和这里的 2.3 万步略有出入.)

**Natural Language Understanding and Generation.** We adopt datasets and corresponding prompts from promptsource (Bach et al., 2022). For all prompted samples in each dataset, we set a truncation of maximal 10,0000 samples per dataset and combine them together as the MIP dataset. Details of the prompted samples and datasets are provided in promptsource’s GitHub repository<sup>8</sup>.

**自然语言理解与生成.** 我们采用 promptsource (Bach et al., 2022) 的数据集和对应提示. 对每个数据集的所有提示样本, 我们设定每个数据集最多截取 100000 个样本 (原文写作 「10,0000」), 再合在一起作为 MIP 数据集. 提示样本和数据集的细节见 promptsource 的 GitHub 仓库 (脚注 8).

**Information Extraction.** Based on the datasets from DeepStruct (Wang et al., 2022a), a multi-task language model pre-training approach for information extraction tasks, we create instructions and prompts for part of its datasets (as is shown in Table 12). We reformulate information extraction tasks into instruction tuning formats to allow zero-shot generalization to new extraction schema. For all prompted samples in each dataset, we set a truncation of maximal 20,0000 samples per dataset as there are fewer information extraction datasets than common language understanding and generation ones. For KELM (Agarwal et al., 2021) and PropBank (Kingsbury & Palmer) datasets, since their original size is gigantic, we sample 50,0000 samples for each of them from their prompted samples.

**信息抽取.** 基于 DeepStruct (Wang et al., 2022a), 一种面向信息抽取任务的多任务语言模型预训练方法, 的数据集, 我们为其中一部分数据集编写了指令和提示 (见表 12). 我们把信息抽取任务改写成指令微调的格式, 以便零样本泛化到新的抽取模式. 由于信息抽取数据集比普通的语言理解和生成数据集少, 对每个数据集的提示样本, 我们设定每个数据集最多截取 200000 个样本 (原文写作 「20,0000」). KELM (Agarwal et al., 2021) 和 PropBank (Kingsbury & Palmer) 两个数据集原始规模巨大, 我们从它们的提示样本中各抽 500000 个 (原文写作 「50,0000」).

## C.2 DATA AND PROMPTS IN MIP FOR DEEPSTRUCT DeepStruct 在 MIP 中的数据与提示

Prompts and instructions for all datasets in DeepStruct (Wang et al., 2022a) are newly created by authors manually. The introduction, task description, and full prompts for each dataset are attached in the following sections. To allow template infilling, all prompts are written into Jinja<sup>9</sup>templates. When a dataset sample is provided in our format, Joinja engine will render it into a prompted sample with instruction.

DeepStruct (Wang et al., 2022a) 所有数据集的提示和指令都由作者手工新写. 每个数据集的介绍, 任务描述和完整提示附在下面各节. 为了支持模板填充, 所有提示都写成 Jinja (脚注 9) 模板. 当一个数据集样本按我们的格式给出时, Jinja 引擎 (原文拼作 Joinja) 会把它渲染成带指令的提示样本.

A more systematic evaluation on GLM-130B’s information extraction ability is left for a future work, as the concentration in this work is on the training and designing details of an LLM.

对 GLM-130B 信息抽取能力更系统的评测留待以后的工作, 因为本文的重点是 LLM 的训练和设计细节.

## C.2.1 DIALOGUE STATE TRACKING 对话状态追踪

We adopt Multiwoz 2.1 (Eric et al., 2020) dialogue state tracking dataset. The dataset is reformulated into two tasks, each with one prompt correspondingly:

我们采用 Multiwoz 2.1 (Eric et al., 2020) 对话状态追踪数据集. 数据集被改写成两个任务, 各对应一个提示:

• **Dialogue state tracking**: which asks the model to extract information from dialogues given a list of certain slots, e.g., taxi\_arrival\_time and destination.

• **Slot filling**: which model should fill in one provided slot and identify situations without answer.

- **对话状态追踪**: 给定一组槽位 (例如 taxi_arrival_time 和 destination), 要求模型从对话中抽取相关信息.
- **槽位填充**: 模型要填出给定的一个槽位, 并识别没有答案的情况.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>[https://github.com/bigscience-workshop/promptsource](https://github.com/bigscience-workshop/promptsource)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>[https://github.com/pallets/jinja](https://github.com/pallets/jinja)</span></small>

脚注 8: promptsource 的仓库地址. 脚注 9: Jinja 的仓库地址. 链接均见上.

<!-- page 33 of 56 -->

```txt
(Dialogue State Tracking, Prompt 0)
Read the dialogues between "[User]" and "[Agent]",
{{text}}
identify and extract the information related to the following categories
(from top to down):
- {{allowed_relations | join("\n- ")}}
in the form of "([User]; Y; Z)": ||| {{format_triple(relations,
allowed_relations) | join(" ")}}
```

(对话状态追踪, 提示 0) 大意: 阅读 「[User]」 和 「[Agent]」 之间的对话 {{text}}, 按从上到下的顺序识别并抽取与下列类别有关的信息 (类别逐行列出), 写成 「([User]; Y; Z)」 的形式. 「|||」 之后是目标输出, 即按允许的关系格式化后的三元组.

```jinja
(Slot Filling, Prompt 0)
Given the following dialogue:
{{text}}

please answer the question: has "[User]" mentioned "{{allowed_relations[ relation_idx].split(': ') | join(""s ")}}" ? If yes, please write down the answer from the dialogue; if not, please answer "not given".
Answer: ||| {% if filter_relation(relations, allowed_relations[ relation_idx]).len__() > 0 %}{{filter_relation(relations, allowed_relations[relation_idx])[0]['tail']}}{% else %}not given{% endif %}
```

(槽位填充, 提示 0) 大意: 给定对话 {{text}}, 回答问题: 「[User]」 有没有提到某个槽位 (由 allowed_relations 中的一项拼出)? 如果提到, 写出对话里的答案; 如果没有, 回答 「not given」. 目标输出是该槽位的尾实体, 找不到时为 「not given」.

## C.2.2 EVENT EXTRACTION 事件抽取

We adopt ACE05 (Walker & Consortium, 2005) event extraction datasets following the setting in (Wadden et al., 2019). The dataset is reformulated into two tasks with three prompts as follows:

我们按 (Wadden et al., 2019) 的设置采用 ACE05 (Walker & Consortium, 2005) 事件抽取数据集. 数据集被改写成两个任务, 共三个提示:

• **Event Argument Extraction**: given a trigger in text and a list of its argument roles, the model is asked to extract the arguments from the provided text.

• **Argument Identification**: given a trigger and a certain argument role, the model is asked to extract the argument if it exists in the provided text; otherwise, the model should generate nothing.

- **事件论元抽取**: 给定文本中的一个触发词及其论元角色列表, 要求模型从文本中抽取论元.
- **论元识别**: 给定一个触发词和某个论元角色, 如果文本里有这个论元就抽出来, 否则什么都不生成.

```txt
(Event Argument Extraction, Prompt 0)
For the task of "Event Extraction", given a trigger one should extract its related arguments conditioned on a list of potential roles.
Given the following list of roles:
- {{shuffle(allowed_arguments[trigger['event_type']].values()) | join("\n- ")}}
extract related arguments of the trigger "{{trigger['text']}} ({{ allowed_triggers[trigger['event_type']]}})" in the following sentence:
{{text}}
Extractions: ||| {{format_triple(relations, "") | join(" ")}}
```

(事件论元抽取, 提示 0) 大意: 在 「事件抽取」 任务中, 给定一个触发词, 要在一组潜在角色的条件下抽取与它相关的论元. 先列出打乱顺序的角色列表, 再要求抽取下面句子里触发词 「{{trigger['text']}} (事件类型)」 的相关论元. 目标输出是格式化的三元组.

<!-- page 34 of 56 -->

```txt
(Event Argument Extraction, Prompt 1)
TEST
Event Extraction) {{text}}
Please write down ALL event arguments related to the trigger "{{trigger['text']}} ({{allowed_triggers[trigger['event_type']]})" marked with "[]", given the following categories:
- {{shuffle(allowed_arguments[trigger['event_type']].values()) | join("\n- ")}}
Answer: ||| {{format_triple(relations, "") | join(" ")}}
```

(事件论元抽取, 提示 1) 大意: 以 「TEST」 和 「Event Extraction)」 开头, 给出文本, 要求写出与用 「[]」 标出的触发词相关的全部事件论元, 类别列表逐行给出. 目标输出同上.

```txt
(Argument Identification, Prompt 0)
Let extract event related arguments!

In the following passage, an argument with the type "{{query_arg}}" is related to the event trigger "{{trigger['text']}} ({{allowed_triggers[trigger['event_type']]})":"

{{text}}

The argument should be (copy from the context if you find it; if not, do not generate): ||| {{filter_type(relations, query_arg) | join(" ")}}
```

(论元识别, 提示 0) 大意: 「我们来抽取事件相关的论元!」 在下面的段落里, 有一个类型为 「{{query_arg}}」 的论元和事件触发词相关; 找到就从上下文里原样复制出来, 找不到就不生成. 目标输出是该类型的论元.

## C.2.3 JOINT ENTITY AND RELATION EXTRACTION 实体与关系联合抽取

Joint entity and relation extraction aims to recognize named entities in a piece of text and judge the relationships between them. It is closely related to knowledge acquisition, where the ultimate target is to structuring the unstructured web contents into knowledge triples (e.g., (London, capital\_of, Britain)). The task can be formulated into either a pipeline framework (a combination of named entity recognition and relation extraction), or end-to-end training.

实体与关系联合抽取的目标是识别一段文本中的命名实体, 并判断它们之间的关系. 它和知识获取密切相关, 后者的终极目标是把网上的非结构化内容整理成知识三元组 (例如 (London, capital_of, Britain)). 这个任务可以写成流水线框架 (命名实体识别加关系抽取的组合), 也可以端到端训练.

In this work, we adopt three classical joint entity and relation extraction datasets: CoNLL04 (Roth & Yih, 2004), NYT (Riedel et al., 2010), and ACE2005 (Walker & Consortium, 2005). In GLM-130B, we follow (Wang et al., 2022a) to formulate such challenges into sequence-to-sequence generation, where our inputs are raw texts and outputs are triples. We only conduct relation-related tasks for these datasets here, and leave the entity-related ones to the named entity recognition section.

本工作采用三个经典的实体与关系联合抽取数据集: CoNLL04 (Roth & Yih, 2004), NYT (Riedel et al., 2010) 和 ACE2005 (Walker & Consortium, 2005). 在 GLM-130B 中, 我们按 (Wang et al., 2022a) 把这类问题写成序列到序列的生成, 输入是原始文本, 输出是三元组. 这里只对这些数据集做与关系有关的任务, 与实体有关的任务放到命名实体识别一节.

• **Relation Extraction**: here we extract knowledge triples consisting of “head entity”, “relation”, and “tail entity”, given a list of relation candidates. For example, given the input “In Kunming the 800-some faculty and student established the National Southwestern Associated University.”, the model output could be (National Southwestern Associated University, location of formation, Kunming).

• **Conditional Relation Extraction**: given a single relation candidate, judge if the input text contains the relation. If so, extraction all related triples; if not, do not generate.

• **Knowledge Slot Filling**: assign a certain entity from text, and ask the model to extract all triples that takes the entity as the head.

• **Relation Classification**: given two entities from texts, ask the model to judge the relation between them based on a list of candidate relations.

- **关系抽取**: 给定关系候选列表, 抽取由 「头实体」, 「关系」, 「尾实体」 组成的知识三元组. 例如输入 「In Kunming the 800-some faculty and student established the National Southwestern Associated University.」 (在昆明, 800 多名师生建立了西南联合大学.), 模型输出可以是 (National Southwestern Associated University, location of formation, Kunming).
- **条件式关系抽取**: 给定单个关系候选, 判断输入文本是否包含这个关系. 如果包含, 抽出所有相关三元组; 如果不包含, 不生成.
- **知识槽位填充**: 指定文本中的某个实体, 要求模型抽出以该实体为头的所有三元组.
- **关系分类**: 给定文本中的两个实体, 要求模型根据候选关系列表判断它们之间的关系.

<!-- page 35 of 56 -->

```txt
(Relation Extraction, Prompt 0)
Can you figure out all triples regarding the relations of "{{shuffle(allowed_relations) | join('", '')}}" from the sentence? List them in the shape of "( X ; Y ; Z )":
{{text}} => ||| {{format_triple(relations, allowed_relations) | join("")}}
```

(关系抽取, 提示 0) 大意: 你能从句子里找出所有涉及这些关系 (打乱顺序列出) 的三元组吗? 按 「( X ; Y ; Z )」 的形式列出. 目标输出是格式化的三元组.

```txt
(Conditional Relation Extraction, Prompt 0)
Conditioned on the relation "{{allowed_relations[relation_idx]}", what knowledge triples can be extracted from:
{{text}}
Please write them down here: ||| {{format_triple(relations, [ allowed_relations[relation_idx]]) | join(" ")}}
```

(条件式关系抽取, 提示 0) 大意: 在关系 「{{allowed_relations[relation_idx]}}」 的条件下, 能从下面的文本里抽出哪些知识三元组? 请写在这里. 目标输出是该关系下的三元组.

```jinja
(Knowledge Slot Filling, Prompt 0)
{% if entity_types.__len__() > 0 %}
In the sentence

{{text}}

the X = "{{entities[entity_idx]}}" is an entity of the type "{{entity_types[entity_idx]}". Extract all possible triples contains "{{entities[entity_idx]}}" in the form of ( X ; Y ; Z ), given the following candidate properties Y:

{% for r in allowed_relations %}- {{r}}
{% endfor %}
Answer: ||| {% for r in relations %}{% if r['head'][0] == entities[entity_idx] %}{format_triple([r], allowed_relations) | join(" ")}}{% endif %}{% endfor %}
{% endif %}
```

(知识槽位填充, 提示 0) 大意: 句子里 X = 「某实体」 是类型为 「某类型」 的实体. 在给定的候选属性 Y 列表下, 以 ( X ; Y ; Z ) 的形式抽出所有包含该实体的三元组. 目标输出是以该实体为头的三元组. (模板里有几处花括号不配对, 如 「{format_triple」, 是原文如此.)

```handlebars
(Relation Classification, Prompt 0)
QUIZ
Given the candidate relations:
- {{shuffle(allowed_relations) | join("\n- ")}}
what is the relation between "{{relations[triple_idx]['head'][0]}}" and "{{relations[triple_idx]['tail'][0]}}" in the following sentence?
{{text}}
Answer: ||| {{relations[triple_idx]['relation']}}
```

(关系分类, 提示 0) 大意: 以 「QUIZ」 开头, 给出候选关系列表, 问下面句子中 「头实体」 和 「尾实体」 之间是什么关系. 目标输出是关系名.

Nevertheless, existing joint entity and relation extraction datasets have very limited relation schema. For example, CoNLL04 only contains five different relations; the most diverse NYT dataset contains 24 Freebase predicates. To allow the model to capture a diverse range of potential verbalized predicates, we extend the task with automatically generated knowledge-text aligned data from KELM (Agarwal et al., 2021). We do not include other distantly supervised dataset (e.g., T-Rex (Elsahar et al., 2018)) since they can be extremely noisy.

不过, 现有实体与关系联合抽取数据集的关系模式非常有限. 例如 CoNLL04 只有五种关系; 最多样的 NYT 数据集也只有 24 个 Freebase 谓词. 为了让模型掌握更多样的潜在谓词说法, 我们用 KELM (Agarwal et al., 2021) 自动生成的知识-文本对齐数据扩展了这个任务. 我们没有纳入其他远程监督数据集 (例如 T-Rex (Elsahar et al., 2018)), 因为它们可能噪声极大.

For KELM data, since it is based on the full Wikidata schema (which contains too many relations to be enumerated), we create two KELM-specific prompts for the task of **Relation Extraction** and **Knowledge Slot Filling**:

KELM 数据基于完整的 Wikidata 模式 (关系多到无法逐一列举), 所以我们为 **关系抽取** 和 **知识槽位填充** 两个任务写了两个 KELM 专用的提示:

<!-- page 36 of 56 -->

```txt
(Relation Extraction, Prompt 1, KELM ONLY)
{# kelm #}
Can you figure out all knowledge triples regarding whole Wikidata properties from the sentence? List them in the shape of "( X ; Y ; Z )":
{{text}} => ||| {{format_triple(relations, "") | join(" ")}}
```

(关系抽取, 提示 1, 仅用于 KELM) 大意: 你能从句子里找出涉及全部 Wikidata 属性的所有知识三元组吗? 按 「( X ; Y ; Z )」 的形式列出.

```jinja
(Knowledge Slot Filling, Prompt 1, KELM ONLY)
{# kelm #}
Given the entity "{{entities[entity_idx]}}" marked with "[" and "]" in the context:
{{text}}

please list all triples related to it (do not generate if there is no answer): ||| {% for r in relations %}{% if r['head'][0] == entities[entity_idx] %}{format_triple([r], "") | join(" ")}}{% endif %}{% endfor %}
```

(知识槽位填充, 提示 1, 仅用于 KELM) 大意: 给定上下文中用 「[」 和 「]」 标出的实体, 列出与它相关的所有三元组, 没有答案就不生成.

## C.2.4 NAMED ENTITY RECOGNITION 命名实体识别

Named entity recognition is a task which targets identifying named entities from raw text corpus and assign them with proper entity types. For example, in the sentence “In 1916 GM was reincorporated in Detroit as "General Motors Corporation".”, General Motors Corporation could be of entity type organization. We design two different types of tasks based on named entity recognition datasets CoNLL03 (Sang & Meulder, 2003), OntoNotes 5.0 (Pradhan et al., 2013), and GENIA (Ohta et al., 2002). We also include named entity recognition sub-tasks from joint entity and relation datasets.

命名实体识别的任务是从原始文本中识别命名实体, 并给它们分配合适的实体类型. 例如在句子 「In 1916 GM was reincorporated in Detroit as 」General Motors Corporation「.」 (1916 年, GM 在底特律重组为 「通用汽车公司」.) 中, General Motors Corporation 的实体类型可以是组织. 我们基于命名实体识别数据集 CoNLL03 (Sang & Meulder, 2003), OntoNotes 5.0 (Pradhan et al., 2013) 和 GENIA (Ohta et al., 2002) 设计了两类任务. 我们也纳入了实体与关系联合数据集里的命名实体识别子任务.

• **Named Entity Recognition**: given a certain list of possible entity types (e.g., location, person, organization), extract all related entities from the provided text content.

• **Entity Typing**: entity typing is one of the important derivative tasks from named entity recognition. It aims to classify the correct type of an entity mention (without entity types), and is often appended to the entity mention extraction as post-processing.

- **命名实体识别**: 给定一组可能的实体类型 (例如地点, 人物, 组织), 从给定文本中抽出所有相关实体.
- **实体分类**: 实体分类是命名实体识别的重要衍生任务之一. 它的目标是为一个实体提及 (不带实体类型) 判定正确的类型, 常作为后处理接在实体提及抽取之后.

```jinja
(Named Entity Recognition, Prompt 0)
Given the following list of entity types:
Z = {{shuffle(allowed_types) | join(", ")}}
please extract all mentioned entities from left to right in the sentence, in the form of "( X ; instance of ; Z )".
{{text}} => ||| {% for entity, type in zip(entities, entity_types) %}( {{entity}} ; instance of ; {{type}} ) {% endfor %}
```

(命名实体识别, 提示 0) 大意: 给定实体类型列表 Z, 请从左到右抽出句子里提到的所有实体, 写成 「( X ; instance of ; Z )」 的形式.

```jinja
(Entity Typing, Prompt 0)
Extract all entity mentioned in the sentence with entity type "{{ allowed_types[type_idx]}}" in the form of "( X ; instance of ; {{ allowed_types[type_idx]}} )"
{{text}} => ||| {% for entity, type in zip(entities, entity_types) %}{% if type == allowed_types[type_idx] %}( {{entity}} ; instance of ; {{type}} ) {% endif %}{% endfor %}
```

(实体分类, 提示 0) 大意: 抽出句子里所有类型为 「某类型」 的实体, 写成 「( X ; instance of ; 该类型 )」 的形式.

<!-- page 37 of 56 -->

```txt
(Entity Typing, Prompt 1)
List all "{{allowed_types[type_idx]}}" entities appeared in the following passage, joined by " | ":
{{text}} => ||| {{filter_type(zip(entities, entity_types), allowed_types[type_idx]) | join(" | ")}}
```

(实体分类, 提示 1) 大意: 列出下面段落里出现的所有 「某类型」 实体, 用 「 | 」 连接.

```jinja
(Entity Typing, Prompt 2)
{% if entity_types.__len__() > 0 %}
Based on the list of potential entity types and ignore their order:
- {{shuffle(allowed_types) | join("\n- ")}}

the entity "{{entities[entity_idx]}}" marked with "[" and "]" in the following sentence:
{{text}}

belongs to ||| {{entity_types[entity_idx]}}
{% endif %}
```

(实体分类, 提示 2) 大意: 参照潜在实体类型列表 (忽略顺序), 下面句子中用 「[」 和 「]」 标出的实体属于哪一类. 目标输出是实体类型.

## C.2.5 RELATION CLASSIFICATION 关系分类

Relation classification is a fundamental task in information extraction, which identifies the relationships from a list of candidates between two given entities. The problem is a long standing one as it suffers from outrageous cost of data labeling, since manual labeling on knowledge-intensive tasks requires educated annotators that charges high. A de facto data creation method in relation extraction relies on distant supervision, which aligns existing knowledge triples in knowledge bases to text contents automatically, and assume that such alignments are correct in certain conditions. Here we only include TacRED (Zhang et al., 2017) dataset and create several different tasks based on it.

关系分类是信息抽取的基础任务, 从候选列表中识别两个给定实体之间的关系. 这个问题由来已久, 因为数据标注成本高得离谱: 知识密集型任务的人工标注需要受过教育的标注员, 收费很高. 关系抽取中事实上的数据构造方法依赖远程监督, 即把知识库中已有的知识三元组自动对齐到文本内容上, 并假设在一定条件下这种对齐是正确的. 这里我们只纳入 TacRED (Zhang et al., 2017) 数据集, 并基于它构造了几个不同的任务.

• **Relation Classification**: the most traditional task formulation. Given two entities from text and classify their relation from a list of candidates. The form can be either answering the relation directly or in the form of a triple (similar to relation extraction).

• **Knowledge Slot Filling**: change the task into given head entity and relation, to identify whether the tail entity exists in the input text. If not, generate nothing.

• **Yes or No Question**: turn the problem into a task similar to natural language inference. For example, given the sentence “The series focuses on the life of Carnie Wilson, daughter of Brian Wilson, founder of the Beach Boys.”, the model will be asked to judge the correctness of a triple such as Carnie Wilson, father, Brian Wilson by answering “yes” or “no”.

- **关系分类**: 最传统的任务形式. 给定文本中的两个实体, 从候选列表中给它们的关系分类. 形式可以是直接回答关系, 也可以是三元组形式 (类似关系抽取).
- **知识槽位填充**: 把任务改成给定头实体和关系, 判断尾实体是否出现在输入文本中; 不出现就不生成.
- **是非题**: 把问题变成类似自然语言推理的任务. 例如给定句子 「The series focuses on the life of Carnie Wilson, daughter of Brian Wilson, founder of the Beach Boys.」 (这部剧聚焦 Carnie Wilson 的生活, 她是海滩男孩创始人 Brian Wilson 的女儿.), 要求模型对三元组 (Carnie Wilson, father, Brian Wilson) 回答 「yes」 或 「no」, 判断它是否正确.

```jinja
(Relation Classification, Prompt 0)
{% if entity_types.__len__() > 0 %}
Given the following categories of relations:
- {{shuffle(allowed_relations.values()) | join("\n- ")}}
predict the relation between "{{relations[0]['head']}}" and "{{relations[0]['tail']}}" in the following sentence:
{{text}}
The relation should be : ||| {{allowed_relations[relations[0]['relation']]}}
{% endif %}
```

(关系分类, 提示 0) 大意: 给定关系类别列表, 预测下面句子中 「头实体」 和 「尾实体」 之间的关系, 答案写在 「The relation should be :」 之后.

<!-- page 38 of 56 -->

```txt
(Relation Classification, Prompt 1)
(Relation Extraction) Answer the relation between entities in the form of "( X ; Y ; Z )":
{{text}}
The relation between "{{relations[0]['head']}}" and "{{relations[0]['tail']}}" is: ||| ( {{relations[0]['head']}} ; {{allowed_relations[relations[0]['relation']}}} ; {{relations[0]['tail']}} )
```

(关系分类, 提示 1) 大意: 以 「(Relation Extraction)」 开头, 要求以 「( X ; Y ; Z )」 的形式回答实体间的关系; 目标输出是 (头实体 ; 关系 ; 尾实体).

```handlebars
(Knowledge Slot Filling, Prompt 0)
Based on the sentence provided below, infer the missing argument asked by the question:
{{text}}
Question: What/Who/Where is "{{relations[0]['head']}}" {{{allowed_relations[relations[0]['relation']]}} ?
Answer: ||| {{relations[0]['tail']}}
```

(知识槽位填充, 提示 0) 大意: 根据下面的句子, 推断问题所问的缺失论元. 问题形如 「头实体」 的某关系 是 What/Who/Where? 目标输出是尾实体.

## C.2.6 SEMANTIC ROLE LABELING 语义角色标注

Semantic role labeling is a long-standing information task that wants to identify the semantic arguments related to a given predicate in a sentence. For example, in the sentence “Grant was employed at IBM for 21 years where she held several executive positions.” and the predicate “employed” in it, semantic role labeling identifies the Grant as the subject and IBM as the second object.

语义角色标注是一个由来已久的信息任务, 目标是识别句子中与给定谓词相关的语义论元. 例如在句子 「Grant was employed at IBM for 21 years where she held several executive positions.」 (Grant 在 IBM 工作了 21 年, 担任过几个高管职位.) 中, 对谓词 「employed」, 语义角色标注识别出 Grant 是主语, IBM 是第二宾语.

We create two different tasks based on semantic role labelling datasets CoNLL05 (Carreras & Màrquez, 2005), CoNLL12 (Pradhan et al., 2013), and PropBank (Kingsbury & Palmer).

我们基于语义角色标注数据集 CoNLL05 (Carreras & Màrquez, 2005), CoNLL12 (Pradhan et al., 2013) 和 PropBank (Kingsbury & Palmer) 构造了两类不同的任务. (原文说 「两类」, 下面列了三项.)

• **Semantic Role Labeling**: the traditional task form, where a verb (i.e., predicate) is annotated in text and the model is asked to generate related semantic roles.

• **Semantic Role Filling**: given a verb and and a potential semantic role, the model is asked to judge whether the role exists in the sentence and generate it.

• **Predicate Recognition**: given a segment of a sentence and its corresponding semantic role, identify which verb it is related to.

- **语义角色标注**: 传统的任务形式, 文本中标出一个动词 (即谓词), 要求模型生成相关的语义角色.
- **语义角色填充**: 给定一个动词和一个可能的语义角色, 要求模型判断句中是否存在该角色并把它生成出来.
- **谓词识别**: 给定句子的一个片段及其对应的语义角色, 识别它和哪个动词相关.

```jinja
(Semantic Role Labeling, Prompt 0)
Provided with the target verb "{{verb}}" marked with "[" and "]" in the following sentence, find out its "{{allowed_types[type_idx]}":"{{text}} => ||| {% for entity, type in zip(entities, entity_types) %}{% if type == allowed_types[type_idx] %}{{entity}}{% endif %}{% endfor %}
```

(语义角色标注, 提示 0) 大意: 给定下面句子中用 「[」 和 「]」 标出的目标动词 「{{verb}}」, 找出它的 「某角色」. 目标输出是该角色对应的文本.

```jinja
(Semantic Role Filling, Prompt 0)
Given the following list of argument types:
Z = {{allowed_types | join(", ")}}
find out all arguments related to verb "{{verb}}" mentioned in the following sentence from left to right, in the form of "( X ; instance of ; Z )".
{{text}} => ||| {% for entity, type in zip(entities, entity_types) %}({entity}} ; argument type ; {{type}} ) {% endfor %}
```

(语义角色填充, 提示 0) 大意: 给定论元类型列表 Z, 从左到右找出下面句子中与动词 「{{verb}}」 相关的所有论元, 写成 「( X ; instance of ; Z )」 的形式.

<!-- page 39 of 56 -->

```txt
(Predicate Recognition, Prompt 0)
FINAL EXAM
1. Based on the fact that "{{entities[entity_idx]}}" is a "{{ entity_types[entity_idx]}}, which verb in the following sentence should it related to?
{{text}}
Answer: ||| {{verb}}
```

(谓词识别, 提示 0) 大意: 以 「FINAL EXAM」 开头. 既然 「某片段」 是一个 「某角色」, 它应该和下面句子里的哪个动词相关? 目标输出是动词.

## C.3 RESULT SOURCES FOR GPT-3, BLOOM-176B, AND OPT-175B GPT-3, BLOOM-176B 与 OPT-175B 的结果来源

Here we describe the result sources for GPT-3, BLOOM-176B, and OPT-175B. Other LLMs we may compare are mostly completely closed-sourced; thus, their results are all taken from existing preprints, publications, or the results stored in BIG-bench repository<sup>10</sup>.

这里说明 GPT-3, BLOOM-176B 和 OPT-175B 的结果来源. 我们可能比较的其他 LLM 大多完全闭源, 所以它们的结果都取自已有的预印本, 论文, 或 BIG-bench 仓库里存储的结果 (脚注 10).

For GPT-3, while most of its results in this paper are taken from existing literature if not specified, the rest were acquired via our own requesting OpenAI Danvici API are explicitly mentioned. For BLOOM-176B and OPT-175B, if without specific annotation, their results are:

对 GPT-3, 如无特别说明, 本文的大部分结果取自已有文献, 其余通过我们自己请求 OpenAI Davinci API (原文拼作 Danvici) 得到的结果会明确注明. 对 BLOOM-176B 和 OPT-175B, 如无特别标注, 它们的结果:

• Taken from the OPT paper (Zhang et al., 2022).

• Taken from the EAI-Eval BigScience Arch&Scale - Google Sheet<sup>11</sup>.

• Taken from BigScience evaluation results repository in Huggingface Datasets<sup>12</sup>.

- 取自 OPT 论文 (Zhang et al., 2022).
- 取自 EAI-Eval BigScience Arch&Scale 的 Google 表格 (脚注 11).
- 取自 Huggingface Datasets 上的 BigScience 评测结果仓库 (脚注 12).

Specifically, we cannot evaluate OPT-175B by ourselves as we are still not officially granted the checkpoint, though we have sent several applications in the past few months.

特别地, 我们无法自己评测 OPT-175B, 因为虽然过去几个月里我们多次申请, 至今仍没有正式获得它的 checkpoint.

## C.4 PILE TEST-SET EVALUATION Pile 测试集评测

Pile evalution (Gao et al., 2020) is a comprehensive language modeling benchmark which originally includes 22 different text datasets from diverse domains. We report our results over a part of 18 datasets with previously reported baseline results (Lieber et al., 2021). Different from traditional language modeling benchmarks, Pile evaluation report the BPB (bits-per-byte) perplexity to avoid the mismatch comparison between models with different vocabularies. Because in general, language models with a larger vocabulary will be favored in perplexity comparison if not restricted. In the evaluation, we strictly follow the setting in (Gao et al., 2020), leveraging [gMASK] and a context-length of 1,024 with bidirectional attention, and the rest 1024 tokens to calculate BPB in an autoregressive manner. The weighted average BPB are calculated based on each shared dataset’s ratio in Pile training-set (Gao et al., 2020).

Pile 评测 (Gao et al., 2020) 是一个综合性的语言建模基准, 原本包含来自不同领域的 22 个文本数据集. 我们报告其中 18 个数据集上的结果, 这些数据集此前有报告过的基线结果 (Lieber et al., 2021). 与传统语言建模基准不同, Pile 评测报告 BPB (每字节比特数) 困惑度, 以避免词表不同的模型之间比较失配; 因为一般来说, 不加限制的话, 词表更大的模型在困惑度比较中占便宜. 评测中我们严格按 (Gao et al., 2020) 的设置, 用 [gMASK] 和 1024 长度的上下文做双向注意力, 再对其余 1024 个 token 以自回归方式计算 BPB. 加权平均 BPB 按各共同数据集在 Pile 训练集中的占比 (Gao et al., 2020) 计算.

Table 13: GLM-130B and its similar-sized LLMs’ BPB results on Pile test-set.

|  | Jurassic-1 | GPT-3 | GLM-130B |
| --- | --- | --- | --- |
| dm_mathematics | 1.040 | 1.370 | 0.786 |
| ubuntu_irc | 0.857 | 0.946 | 0.977 |
| opensubtitles | 0.879 | 0.932 | 0.889 |
| hackernews | 0.869 | 0.975 | 0.873 |
| books33 | 0.835 | 0.802 | 0.803 |
| pile_cc | 0.669 | 0.698 | 0.771 |
| philpapers | 0.741 | 0.723 | 0.766 |
| gutenberg_pg_19 | 0.890 | 1.160 | 0.821 |
| arxiv | 0.680 | 0.838 | 0.570 |
| stackexchange | 0.655 | 0.773 | 0.611 |
| nih_exporter | 0.590 | 0.612 | 0.614 |
| pubmed_abstracts | 0.587 | 0.625 | 0.610 |
| uspto_backgrounds | 0.537 | 0.566 | 0.537 |
| pubmed_central | 0.579 | 0.690 | 0.510 |
| freelaw | 0.514 | 0.612 | 0.499 |
| github | 0.358 | 0.645 | 0.329 |
| enron_emails | 0.621 | 0.958 | 0.604 |
| youtube_subtitles | 0.825 | 0.815 | 0.746 |
| Weighted Avg. | 0.650 | 0.742 | 0.634 |

表 13: GLM-130B 及同规模 LLM 在 Pile 测试集上的 BPB 结果 (越低越好).

| 子集 | Jurassic-1 | GPT-3 | GLM-130B |
| --- | --- | --- | --- |
| dm_mathematics | 1.040 | 1.370 | 0.786 |
| ubuntu_irc | 0.857 | 0.946 | 0.977 |
| opensubtitles | 0.879 | 0.932 | 0.889 |
| hackernews | 0.869 | 0.975 | 0.873 |
| books3 (源 md 作 books33) | 0.835 | 0.802 | 0.803 |
| pile_cc | 0.669 | 0.698 | 0.771 |
| philpapers | 0.741 | 0.723 | 0.766 |
| gutenberg_pg_19 | 0.890 | 1.160 | 0.821 |
| arxiv | 0.680 | 0.838 | 0.570 |
| stackexchange | 0.655 | 0.773 | 0.611 |
| nih_exporter | 0.590 | 0.612 | 0.614 |
| pubmed_abstracts | 0.587 | 0.625 | 0.610 |
| uspto_backgrounds | 0.537 | 0.566 | 0.537 |
| pubmed_central | 0.579 | 0.690 | 0.510 |
| freelaw | 0.514 | 0.612 | 0.499 |
| github | 0.358 | 0.645 | 0.329 |
| enron_emails | 0.621 | 0.958 | 0.604 |
| youtube_subtitles | 0.825 | 0.815 | 0.746 |
| 加权平均 | 0.650 | 0.742 | 0.634 |

The detailed metrics on Pile test-set are reported in Table 13. We observe that compared to GPT-3, GLM-130B has a noticeable weaker performance on phil\_papers and pile\_cc, which is likely because of GLM-130B’s bilingual natural and lack of more diverse and high-quality private collected corpora.

Pile 测试集上的详细指标见表 13. 我们观察到, 与 GPT-3 相比, GLM-130B 在 phil_papers 和 pile_cc 上明显较弱, 这可能是因为 GLM-130B 的双语性质 (原文把 nature 误作 natural), 以及缺少更多样, 高质量的私有语料.

> **问:** Pile 上 GLM-130B 平均 BPB 0.634, 好于 GPT-3 的 0.742. 这两个数站在同一起跑线上吗?
> 不太一样. 第 4 页写明, GLM-130B 的预训练数据里有 1.2T 的 Pile 训练集部分, 这里测的是 Pile 测试集, 对 GLM-130B 来说是同分布的留出数据; 第 7 页 「过滤测试数据集」 一段把 Pile 算作 「held-out」, 只排除了样本重复, 没有讨论分布优势. GPT-3 和 Jurassic-1 的数字直接取自 Jurassic-1 的报告 (第 7 页), 论文没说它们训练时是否用过 Pile. 再看逐项: 18 个子集里 GLM-130B 有 5 个比 GPT-3 差 (ubuntu_irc, books3, pile_cc, philpapers, nih_exporter), 本页正文只提了 philpapers 和 pile_cc 两个. 平均分的优势主要来自 dm_mathematics (0.786 对 1.370), github (0.329 对 0.645), enron_emails (0.604 对 0.958), gutenberg_pg_19 (0.821 对 1.160) 这几个差距很大的子集.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<a href="https://github.com/google/BIG-bench"><sub>https</sub>://github.com/google/BIG-bench</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">11<a href="https://docs.google.com/spreadsheets/d/1CI8Q9RCblLRzUOPJ6ViqBmo284-8ojluQ-CmaEuhuv0"><sub>https</sub>://docs.google.com/spreadsheets/d/1CI8Q9RCblLRzUOPJ6ViqBmo284-8oj luQ-CmaEuhuv0</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">12<a href="https://huggingface.co/datasets/bigscience/evaluation-results/tree/main/bloom/bloomzeval/transformers/evaluation_val"><sub>https</sub>://huggingface.co/datasets/bigscience/evaluation-results/tree/ma in/bloom/bloomzeval/transformers/evaluation\_val</a></span></small>

脚注 10: BIG-bench 仓库地址. 脚注 11: EAI-Eval 的 Google 表格地址. 脚注 12: Huggingface 上 BigScience 评测结果仓库中 BLOOM 的目录地址. 链接均见上.

<!-- page 40 of 56 -->

## C.5 BIG-BENCH-LITE EVALUATION BIG-bench-lite 评测

Recent works (Wei et al., 2022c; Wang et al., 2022c) reveal that LLMs are capable to do reasoning beyond conventional language tasks. As a response, BIG-bench (Srivastava et al., 2022) is recently set up by crowdsourcing new types of tasks from global researchers to test LLMs unexplored abilities. For economical consideration, we evaluate GLM-130B on an official subset of original 150- task BIG-bench, the BIG-bench-lite with 24 tasks. These tasks can be categorized into two types: one is based on multiple-choice question answering with answer options, and another is direct generation without options. For the first category, we assess the probability of each option’s full content and pick the largest one as the answer; for the second one, we generate the answer using greedy decoding. All evaluations done in BIG-bench are based on [MASK], since answers here are usually short pieces of texts. All results on 24 BIG-bench-lite (Srivastava et al., 2022) datasets of three LLMs are shown in Table 14 and

(本段被图 16 隔开, 整段译文放在图后该段结尾.)

![Chart block](images/p40-figure-16-a-full-scope-of-big-benchlite-24-tasks.png)

Figure 16: A full scope of BIG-benchlite (24 tasks) evaluation.

图 16: BIG-bench-lite (24 个任务) 评测全貌.

(图: 在图 7 的基础上加了一条棕色的 PaLM 1-shot 线, 纵轴扩到 -5 到 40, 纵轴标签 Aggregate Normalized Performance. 棕线三点约 6.7, 17, 38, 一路高于其他所有线; GLM-130B 的三颗星在 13 到 15 之间, 位于 GPT-3 各线之上, 棕线之下. GPT-3 0-shot 线在最左端约 -4.3.)

Figure 16. We just adopt the original prompts from BIG-bench and use the official implementation to generate priming examples for few-shot evaluation and to calculate the final scores.

近期工作 (Wei et al., 2022c; Wang et al., 2022c) 表明, LLM 能做超出常规语言任务的推理. 作为回应, BIG-bench (Srivastava et al., 2022) 最近通过向全球研究者众包新型任务建立起来, 用来测试 LLM 尚未被探索的能力. 出于经济考虑, 我们在原始 150 个任务的 BIG-bench 的一个官方子集, 即 24 个任务的 BIG-bench-lite 上评测 GLM-130B. 这些任务可以分为两类: 一类是带答案选项的多选问答, 另一类是不带选项的直接生成. 对第一类, 我们评估每个选项完整内容的概率, 取最大者作为答案; 对第二类, 用贪心解码生成答案. BIG-bench 上的所有评测都基于 [MASK], 因为这里的答案通常是很短的文本. 三个 LLM 在 24 个 BIG-bench-lite (Srivastava et al., 2022) 数据集上的全部结果见表 14 和图 16. 我们直接采用 BIG-bench 的原始提示, 并用官方实现生成少样本评测的示范样例, 计算最终分数.

## C.6 MMLU EVALUATION MMLU 评测

All results on 57 MMLU (Hendrycks et al., 2021) datasets of GLM-130B and BLOOM 176B are shown in Table 15. In Section 5.2, we report weighted average accuracy (i.e., accuracy average per sample, rather than by discipline) of GLM-130B, GPT-3 175B, and BLOOM 176B.

GLM-130B 和 BLOOM 176B 在 57 个 MMLU (Hendrycks et al., 2021) 数据集上的全部结果见表 15. 在 5.2 节中, 我们报告的是 GLM-130B, GPT-3 175B 和 BLOOM 176B 的加权平均准确率 (即按样本平均, 而不是按学科平均).

Below is a prompted example with 1-shot priming. We predict the probability on [’A’, ’B’,’C’, ’D’] at the next token, and take the one with the maximal probability as the answer.

下面是一个带 1-shot 示范的提示样例. 我们在下一个 token 上预测 ['A', 'B', 'C', 'D'] 的概率, 取概率最大的作为答案.

```txt
(MMLU 1-shot Example)
The following are multiple choice questions about philosophy.
According to d'Holbach, people always act according to _. (A) free choices (B) dictates of the soul (C) necessary natural laws (D) undetermined will Answer: (C) necessary natural laws
Epicurus holds that philosophy is:
(A) not suitable for the young. (B) not suitable for the old. (C) important, but unpleasant. (D) none of the above.
Answer: (
```

(MMLU 1-shot 样例) 大意: 以下是关于哲学的多选题. 示范题: 「按照霍尔巴赫的观点, 人总是按照 _ 行事. (A) 自由选择 (B) 灵魂的指令 (C) 必然的自然规律 (D) 未被决定的意志 答案: (C) 必然的自然规律」. 待答题: 「伊壁鸠鲁认为哲学: (A) 不适合年轻人. (B) 不适合老年人. (C) 重要, 但令人不快. (D) 以上都不是. 答案: (」 模型接着在括号后预测选项字母.

## C.7 CHINESE LANGUAGE UNDERSTANDING EVALUATION 中文语言理解评测

Here we elaborate the prompts we use for CLUE (Xu et al., 2020) and FewCLUE (Xu et al., 2021) evaluation. On Chinese datasets, prompting meets some challenges as Chinese texts are organized by single characters rather than words, leading to unequal length of verbalizers in many cases. Albeit dataset-specific calibration (Wang et al., 2021; Wu et al., 2021) can help to mitigate the issue, the too specified technique can be complicated in implementation. Our evaluation in this paper adopts a more easy to solve method leveraging GLM-130B’s unique features. As GLM-130B is a bilingual LLM with English MIP, we adopt English prompts and verbalizers from similar tasks in (Bach et al., 2022) for Chinese dataset evaluation and find such strategies to be quite effective. In terms of evaluation metrics, except for DRCD and CMRC2018 two question answering datasets which reports EM, other datasets report accuracy.

这里详细说明 CLUE (Xu et al., 2020) 和 FewCLUE (Xu et al., 2021) 评测所用的提示. 在中文数据集上, 提示会遇到一些困难, 因为中文文本以单字而不是单词组织, 很多情况下 verbalizer (标签词) 长度不等. 虽然针对数据集的校准 (Wang et al., 2021; Wu et al., 2021) 能缓解这个问题, 但这种过于专门的技术实现起来可能很复杂. 本文的评测采用一种更容易的办法, 利用 GLM-130B 的独特之处: GLM-130B 是一个带英文 MIP 的双语 LLM, 我们在中文数据集评测中采用 (Bach et al., 2022) 里相似任务的英文提示和 verbalizer, 发现这种策略相当有效. 评测指标方面, 除 DRCD 和 CMRC2018 两个问答数据集报告 EM 外, 其他数据集都报告准确率.

<!-- page 41 of 56 -->

## C.8 NATURAL LANGUAGE GENERATION 自然语言生成

Natural language generation, or conditional natural language generation here, refers to tasks that require generating text based on the given information, such as tables and documents. We evaluate GLM-130B on data-to-text and summarization tasks. The datasets include WebNLG 2020 (Castro Ferreira et al., 2020), Clean E2E NLG (Dušek et al., 2019) and WikiLingua (Scialom et al., 2020) from GEM generation benchmark (Gehrmann et al., 2021). We select full WebNLG 2020 and the Clean E2E NLG in the test set and randomly select 5000 test examples from WikiLingua following the practice in (Chowdhery et al., 2022). Following the settings in PaLM, the prompt used for the Summarization tasks is “Summarize the following article:” and the prompt used for the Data-to-Text tasks is “Verbalize:”. An exception is E2E, where we process the data using the prompt “generate-gramatically-correct-text from” provided in promptsource for GLM-130B and GPT-3 175B (Davinci). All evaluations are one-shot, and the demonstration samples are randomly sampled from the training set. We report the F-measure of ROUGE-2, ROUGE-L (Lin, 2004) and BLEURT-20 (Pu et al., 2021). We compare our model with LaMDA, GPT-3 175B (Davinci), and PaLM, where the results of LaMDA and PaLM are reported by (Chowdhery et al., 2022), and we evaluate GPT-3 175B (Davinci) through OpenAI API.<sup>13</sup>

自然语言生成, 这里指条件式自然语言生成, 是需要根据给定信息 (如表格和文档) 生成文本的任务. 我们在数据到文本和摘要任务上评测 GLM-130B. 数据集包括 GEM 生成基准 (Gehrmann et al., 2021) 中的 WebNLG 2020 (Castro Ferreira et al., 2020), Clean E2E NLG (Dušek et al., 2019) 和 WikiLingua (Scialom et al., 2020). 按照 (Chowdhery et al., 2022) 的做法, 我们选用测试集中的全部 WebNLG 2020 和 Clean E2E NLG, 并从 WikiLingua 中随机选 5000 个测试样例. 按照 PaLM 的设置, 摘要任务的提示是 「Summarize the following article:」, 数据到文本任务的提示是 「Verbalize:」. 例外是 E2E, 对 GLM-130B 和 GPT-3 175B (Davinci) 我们用 promptsource 提供的 「generate-gramatically-correct-text from」 提示处理数据. 所有评测都是单样本, 示范样本从训练集中随机抽取. 我们报告 ROUGE-2, ROUGE-L (Lin, 2004) 的 F 值和 BLEURT-20 (Pu et al., 2021). 我们把模型与 LaMDA, GPT-3 175B (Davinci) 和 PaLM 比较, 其中 LaMDA 和 PaLM 的结果由 (Chowdhery et al., 2022) 报告, GPT-3 175B (Davinci) 由我们通过 OpenAI API 评测 (脚注 13).

Our results are presented in Table 16. It shows that GLM-130B has better performances than LaMDA and GPT-3 (Davinci) on all tasks. In the Data-to-text task, GLM-130B performs slightly worse than PaLM-540B, while in the summary task, GLM-130B has even higher ROUGE results. We also ablate GLM-130B to unidirectional to demonstrate the advantage of bidirectional attention. Unidirectional GLM-130B underperforms GPT-3 175B in all three datasets, but when it shifts to bidirectional attention, there is an instant boost, making GLM-130B even comparable to PaLM-540B in a few cases. It indicates that bidirectional attention over the provided context (i.e., prefix) can also be beneficial for text generation missions.

结果见表 16. 它表明 GLM-130B 在所有任务上都好于 LaMDA 和 GPT-3 (Davinci). 在数据到文本任务上, GLM-130B 比 PaLM-540B 稍差; 在摘要任务上, GLM-130B 的 ROUGE 甚至更高. 我们还把 GLM-130B 消融成单向版本, 以展示双向注意力的优势. 单向的 GLM-130B 在三个数据集上都不如 GPT-3 175B, 但换成双向注意力后立刻大幅提升, 在少数情况下甚至和 PaLM-540B 相当. 这说明对给定上下文 (即前缀) 的双向注意力对文本生成任务也有益.

Table 16: 1-shot GEM English natural language generation tasks (WebNLG, E2E, and WikiLingua). We compare two versions of GLM-130B (uni: unidirectional attention, bi: bidirectional attention), showing that bidirectional attention can also improve conditional generation’s performance.

| Task Dataset | Metric | LaMDA137B | GPT-3 175B (Davinci) | GLM uni | -130Bbi | PaLM-540B |
| --- | --- | --- | --- | --- | --- | --- |
| WebNLG | ROUGE-2ROUGE-L | 30.5- | 29.941.2 | 25.336.7 | 38.549.3 | 44.453.8 |
| Data | BLEURT-20 | - | 59.0 | 53.2 | 67.7 | 73.9 |
| to |  |  |  |  |  |  |
| Text | ROUGE-2 | 29.2 | 30.3 | 30.9 | 33.9 | 35.2 |
| E2E | ROUGE-LBLEURT-20 | -- | 39.264.5 | 40.065.0 | 42.668.1 | 43.969.7 |
| Summary WikiLingua | ROUGE-2ROUGE-LBLEURT-20 | 5.4-- | 7.218.941.2 | 5.816.439.4 | 10.423.445.0 | 9.920.647.7 |

表 16: 单样本 GEM 英文自然语言生成任务 (WebNLG, E2E 和 WikiLingua). 我们比较两个版本的 GLM-130B (uni: 单向注意力, bi: 双向注意力), 表明双向注意力也能提升条件生成的表现.

| 任务 | 数据集 | 指标 | LaMDA 137B | GPT-3 175B (Davinci) | GLM-130B uni | GLM-130B bi | PaLM-540B |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 数据到文本 | WebNLG | ROUGE-2 | 30.5 | 29.9 | 25.3 | 38.5 | 44.4 |
| 数据到文本 | WebNLG | ROUGE-L | - | 41.2 | 36.7 | 49.3 | 53.8 |
| 数据到文本 | WebNLG | BLEURT-20 | - | 59.0 | 53.2 | 67.7 | 73.9 |
| 数据到文本 | E2E | ROUGE-2 | 29.2 | 30.3 | 30.9 | 33.9 | 35.2 |
| 数据到文本 | E2E | ROUGE-L | - | 39.2 | 40.0 | 42.6 | 43.9 |
| 数据到文本 | E2E | BLEURT-20 | - | 64.5 | 65.0 | 68.1 | 69.7 |
| 摘要 | WikiLingua | ROUGE-2 | 5.4 | 7.2 | 5.8 | 10.4 | 9.9 |
| 摘要 | WikiLingua | ROUGE-L | - | 18.9 | 16.4 | 23.4 | 20.6 |
| 摘要 | WikiLingua | BLEURT-20 | - | 41.2 | 39.4 | 45.0 | 47.7 |

(源 md 把同一格里的多行数字粘在了一起, 如 「29.941.2」, 上表按指标拆开. 按拆开的数字看, E2E 上单向 GLM-130B 的三个指标都略高于 GPT-3, 正文 「单向版本在三个数据集上都不如 GPT-3」 只在 WebNLG 和 WikiLingua 上成立. 摘要任务上 GLM-130B 的 BLEURT-20 是 45.0, 低于 PaLM 的 47.7, 「ROUGE 更高」 只说了 ROUGE.)

## (E2E Example, without demonstration sample) (E2E 示例, 不带示范样本)

```txt
Aleksandr_Prudnikov , height , 185.0 (centimetres).FC_Spartak_Moscow , ground , Otkrytiye_Arena.Aleksandr_Prudnikov , club , FC_Spartak_Moscow.Verbalize:
```

(输入是三条三元组: Aleksandr_Prudnikov 身高 185.0 厘米; 斯巴达克莫斯科足球俱乐部的主场是 Otkrytiye Arena; Aleksandr_Prudnikov 效力于斯巴达克莫斯科. 末尾接提示 「Verbalize:」. 这条用的是 「Verbalize:」 提示, 输入是三元组, 形式上更像 WebNLG 样例, 标题写的是 E2E.)

**Groundtruth:** 185 centimetre tall Aleksandr Prudnikov played for the Otkrytiye Arena based FC Spartak, Moscow.

**GPT-3 175B (Davinci):** Aleksandr Prudnikov is a midfielder for FC Spartak Moscow, a football (soccer) club based in Moscow, Russia.

**GLM-130B:** Aleksandr Prudnikov is 185.0 cm tall and plays for FC Spartak Moscow.

**参考答案:** 身高 185 厘米的 Aleksandr Prudnikov 曾效力于以 Otkrytiye Arena 为主场的莫斯科斯巴达克队.

**GPT-3 175B (Davinci):** Aleksandr Prudnikov 是莫斯科斯巴达克足球俱乐部的中场球员, 这是一家位于俄罗斯莫斯科的足球俱乐部. (身高没有提到, 「中场」 是输入里没有的信息.)

**GLM-130B:** Aleksandr Prudnikov 身高 185.0 厘米, 效力于莫斯科斯巴达克队. (漏掉了主场这一条.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">13<sub>We</sub> use ROUGE implementation at [https://github.com/google-research/google-research/tree/master/rouge](https://github.com/google-research/google-research/tree/master/rouge)and BLEURT-20 implementation at [https://github.com/google-research/google-research/tree/master/rouge](https://github.com/google-research/google-research/tree/master/rouge),whose checkpoint is available at [https://storage.googleapis.com/bleurt-oss-21/BLEURT-20.zip](https://storage.googleapis.com/bleurt-oss-21/BLEURT-20.zip)</span></small>

脚注 13: ROUGE 用的是 google-research 仓库里的实现, BLEURT-20 的 checkpoint 可从上面的 storage.googleapis.com 链接下载. (原文给 BLEURT-20 实现的链接和 ROUGE 的链接是同一个 rouge 目录, 疑似复制错误.)

<!-- page 42 of 56 -->

**(E2E Example, without demonstration sample)**

**(E2E 示例, 不带示范样本)**

```txt
Combine all of the following data into a concise and grammatically correct text:
name : Blue Spice
eatType : coffee shop
area : riverside
```

(提示大意: 把下面这些数据合成一段简洁且语法正确的文本: 名称 Blue Spice, 类型咖啡店, 区域河边.)

**Groundtruth:** At the riverside, there is a coffee shop called The Blue Spice.

**GPT-3 175B (Davinci):** Blue Spice is a riverside coffee shop which is located on the corner of River Street and Riverbank Street.

**GLM-130B:** There’s a coffee shop that serves coffee in the riverside area, Blue Spice.

**参考答案:** 河边有一家叫 The Blue Spice 的咖啡店.

**GPT-3 175B (Davinci):** Blue Spice 是一家河边的咖啡店, 位于 River Street 和 Riverbank Street 的街角. (街道名是编出来的.)

**GLM-130B:** 河边区域有一家卖咖啡的咖啡店, Blue Spice.

**(WikiLingua Example, without demonstration sample)**

**(WikiLingua 示例, 不带示范样本)**

```txt
The majority of your customers will search for you online, so it's essential to have a user-friendly website. At the very least, your website should include information about your business and your history in the moving industry, details about the quoting process, contact information, and a description of the services you offer. If possible, allow customers to schedule quotes online, view your availability, or read testimonials from other customers. One of the easiest ways to start your business is by helping people you already know with their moves. You can be on the lookout for any announcements related to moving that your friends make on social media. Once you have provided good service to friends, they are likely to recommend you to others. In order to spread the word about your business, have some professional looking promotional materials printed and distribute them around your community. You can distribute business cards at public events, tuck them into local bulletin boards, or even print them in directories, yearbooks, and other local print media. Flyers can be mailed, posted in public places, or distributed to businesses that might be able to refer customers to like you, such as furniture stores. Make sure you have a professional, recognizable logo that is consistent across all of your marketing materials. Another way to get your business's name out there is to make yourself visible. Whether it's by working with partners at local events, volunteering, or using your vehicle for an ad campaign, visibility is key for driving business. Build relationships with influential people in your community. Realtors are a great source of referrals to movers, as are the owners of local furniture stores or the office staff at a large apartment complex. You can use directory sites like Craigslist to advertise your services to people in your local community for free. Social media is also a great way to spread the word about your business. There are many options for advertising, depending on your budget and your target market. Consider options like PPC advertising, television and radio commercials, newspaper ads, direct mail flyers, or memberships with referral services. The best thing you can do to grow your business is to provide excellent service to your customers. Be sure to always be on time, be friendly, be respectful of your customers' belongings, and offer accurate price quotes. Be sure to ask your happy customers to post reviews about you online. New customers will see these reviews and will have more faith in you as a reputable company if they see that others have had a good experience. You will inevitably end up having to deal with an unhappy customer at some point, but do your best to resolve the problem to the customer's satisfaction. The last thing you want is negative reviews about your business circulating the internet! Summarize the article:
```

(文章大意: 这是一篇教人开搬家公司的指南. 大多数顾客会上网找你, 所以要有易用的网站, 至少写明业务介绍, 从业经历, 报价流程, 联系方式和服务内容, 最好支持在线预约报价, 查看档期, 阅读评价. 起步最容易的办法是帮熟人搬家, 留意朋友在社交媒体上发的搬家消息, 服务好了他们会推荐你. 印一些专业的宣传品在社区里发: 在公共活动上发名片, 贴到本地公告栏, 或者登在黄页, 年鉴等本地印刷媒体上; 传单可以邮寄, 张贴, 或者放到家具店这类可能转介客户的商家. 所有宣传品要用统一, 好认的专业标志. 让自己被看见: 和伙伴一起参加本地活动, 做志愿者, 或者用车辆做广告. 和社区里有影响力的人建立关系, 房产经纪, 本地家具店老板, 大型公寓的办公室员工都是很好的客源. 可以用 Craigslist 之类的分类信息网站免费向本地人做广告, 社交媒体也是宣传的好办法. 根据预算和目标市场, 可以考虑按点击付费广告, 电视和电台广告, 报纸广告, 直邮传单或加入转介服务. 发展生意最好的办法是给顾客提供优质服务: 守时, 友善, 爱惜顾客的物品, 报价准确. 请满意的顾客在网上写评价, 新顾客看到后会更信任你. 难免会遇到不满意的顾客, 要尽力把问题解决到对方满意, 你最不想看到的就是网上流传关于你的差评! 末尾接提示 「Summarize the article:」.)

**Groundtruth:** Create a website. Start with friends. Distribute business cards and flyers. Network for promotion. Seek out free advertising opportunities. Consider paid advertising. Gain a good reputation.

**GPT-3 175B (Davinci):** Market yourself online. Look for opportunities to market your services offline.

**GLM-130B:** Have a user-friendly website. Promote your business through social media. Build relationships with influential people in your community. Use directory sites like Craigslist to advertise your services.

**参考答案:** 建一个网站. 从朋友开始. 发名片和传单. 拓展人脉做推广. 寻找免费的广告机会. 考虑付费广告. 积累好口碑.

**GPT-3 175B (Davinci):** 在网上推销自己. 寻找在线下推销服务的机会.

**GLM-130B:** 要有一个易用的网站. 通过社交媒体推广你的生意. 和社区里有影响力的人建立关系. 用 Craigslist 之类的分类信息网站为你的服务做广告.

<!-- page 43 of 56 -->

Table 17: Winograd-style tasks evaluation (Winogender and Winograd273). All scores are accuracy. K refers to number of shots. <sup>∗</sup>PaLM 540B did not report the exact 0-shot Winogender result, so we have to estimate a value from its plotted diagram.

| K | GPT-3(Davinci) | OPT175B | BLOOM176B | PaLM540B | Chinchilla | Gopher280B | GLM-130B |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 64.2 | 54.8 | 49.1 | 75.0∗ | 78.3 | 71.4 | 79.7 |
| Winogender |  |  |  |  |  |  |  |
| 1 | 62.6 | - | 53.1 | 79.4 | - | - | 80.7 |
| Winograd273 0 | 88.3 | 52.9 | 49.1 | 90.1 | - | - | 84.3 |

表 17: Winograd 类任务评测 (Winogender 和 Winograd273). 所有分数都是准确率. K 是样本数. ∗ PaLM 540B 没有报告零样本 Winogender 的确切结果, 所以我们只能从它的图上估一个值.

| 任务 | K | GPT-3 (Davinci) | OPT 175B | BLOOM 176B | PaLM 540B | Chinchilla | Gopher 280B | GLM-130B |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Winogender | 0 | 64.2 | 54.8 | 49.1 | 75.0∗ | 78.3 | 71.4 | 79.7 |
| Winogender | 1 | 62.6 | - | 53.1 | 79.4 | - | - | 80.7 |
| Winograd273 | 0 | 88.3 | 52.9 | 49.1 | 90.1 | - | - | 84.3 |

Table 18: Closed-book question answering (Natural Questions, StrategyQA).

|  | GPT-3 (Davinci) | BLOOM 176B | PaLM 540B | Chinchilla | Gopher 280B | GLM-130B |
| --- | --- | --- | --- | --- | --- | --- |
| Natural Questions (EM) | 14.6 | 13.1 | 21.2 | 16.6 | 10.1 | 11.7 |
| StrategyQA (Acc) | 52.3 | 49.8 | 64.0 | - | - | 60.6 |

表 18: 闭卷问答 (Natural Questions, StrategyQA).

| | GPT-3 (Davinci) | BLOOM 176B | PaLM 540B | Chinchilla | Gopher 280B | GLM-130B |
| --- | --- | --- | --- | --- | --- | --- |
| Natural Questions (EM) | 14.6 | 13.1 | 21.2 | 16.6 | 10.1 | 11.7 |
| StrategyQA (准确率) | 52.3 | 49.8 | 64.0 | - | - | 60.6 |

Table 19: Commonsense reasoning (Commonsense QA, MC-TACO). K refers to number of shots.

| K | GPT-3 (Davinci) | OPT 175B | BLOOM 176B | GLM-130B |
| --- | --- | --- | --- | --- |
| 0 | 57.2 | - | 42.8 | 61.6 |
| Commonsense QA (Acc) |  |  |  |  |
| 1 | 61.2 | - | - | 62.2 |
| MC-TACO (EM) 0 | - | 12.4 | 13.1 | 13.6 |

表 19: 常识推理 (Commonsense QA, MC-TACO). K 是样本数.

| 任务 | K | GPT-3 (Davinci) | OPT 175B | BLOOM 176B | GLM-130B |
| --- | --- | --- | --- | --- | --- |
| Commonsense QA (准确率) | 0 | 57.2 | - | 42.8 | 61.6 |
| Commonsense QA (准确率) | 1 | 61.2 | - | - | 62.2 |
| MC-TACO (EM) | 0 | - | 12.4 | 13.1 | 13.6 |

(MC-TACO 一行有 OPT 的 12.4, 可正文 C.11 说 「OPT 的结果没有列入」, 两处不一致.)

## C.9 WINOGRAD-STYLE TASKS Winograd 类任务

We include the evaluation on Winograd-style tasks, which derives from the classical Winograd Schemas Challenge (Levesque et al., 2012) that aims to test coreference resolution in an ambiguous context for the machine to understand. Since in MIP, we have included the Winogrande (Sakaguchi et al., 2021) and SuperGLUE WSC (Wang et al., 2019), here we test on Winogender (Rudinger et al., 2018) and Winograd273 (Levesque et al., 2012). For Winogender, GPT-3’s results are acquired from OpenAI API, and BLOOM’s 1-shot result is evaluated by ourselves. For Winograd273, since existing works (Brown et al., 2020; Chowdhery et al., 2022) show that 1-shot learning brings almost no improvement, we only test the zero-shot result. Another thing to notice is that, despite GPT-style models (e.g., GPT-3, PaLM) adopting the “partial evaluation” described in (Radford et al., 2019), we find the prompt “&lt;sentence&gt; The "&lt;pronoun&gt;" refers to [MASK]” is better for GLM-130B and adopt it in the evaluation.

我们纳入了 Winograd 类任务的评测, 它们源自经典的 Winograd 模式挑战 (Levesque et al., 2012), 目标是测试机器在有歧义的上下文中理解共指消解的能力. 由于 MIP 里已经包含 Winogrande (Sakaguchi et al., 2021) 和 SuperGLUE WSC (Wang et al., 2019), 这里我们在 Winogender (Rudinger et al., 2018) 和 Winograd273 (Levesque et al., 2012) 上测试. 对 Winogender, GPT-3 的结果通过 OpenAI API 获得, BLOOM 的单样本结果由我们自己评测. 对 Winograd273, 由于已有工作 (Brown et al., 2020; Chowdhery et al., 2022) 表明单样本学习几乎没有提升, 我们只测零样本结果. 另外要注意, 尽管 GPT 式模型 (例如 GPT-3, PaLM) 采用 (Radford et al., 2019) 描述的 「部分评估」, 我们发现提示 「<sentence> The 」<pronoun>「 refers to [MASK]」 对 GLM-130B 更好, 评测中采用了它.

The results are presented in Table 17. GLM-130B performs the best across all evaluated LLM on Winogender, and marginally poorer than GPT-3 and PaLM on Winograd273.

结果见表 17. 在 Winogender 上, GLM-130B 是所有被评测 LLM 中最好的; 在 Winograd273 上, 比 GPT-3 和 PaLM 略差.

## C.10 CLOSED-BOOK QUESTION ANSWERING 闭卷问答

Closed-book question answering (CBQA) (Roberts et al., 2020) is a widely adopted task to evaluate language models’ memorization of factual knowledge, on contrary to the traditional “open-book” evaluation. As we have included TriviaQA (Joshi et al., 2017) and WebQuestions (Berant et al., 2013) in the MIP training, here we choose Natural Questions (Kwiatkowski et al., 2019) and StrategyQA (Geva et al., 2021) as the evaluation datasets for CBQA.

闭卷问答 (CBQA) (Roberts et al., 2020) 是一个广泛采用的任务, 用来评估语言模型对事实知识的记忆, 与传统的 「开卷」 评测相对. 由于我们在 MIP 训练中纳入了 TriviaQA (Joshi et al., 2017) 和 WebQuestions (Berant et al., 2013), 这里选择 Natural Questions (Kwiatkowski et al., 2019) 和 StrategyQA (Geva et al., 2021) 作为 CBQA 的评测数据集.

The results are presented in Table 18. GLM-130B performs relatively poorer on Natural Questions and performs well on StrategyQA. GLM-130B’s underperformance on Natural Questions, we speculate, potentially derives from the insufficiency fitting on English corpora, as it roughly only viewed

(本段跨到下一页, 整段译文放在下一页.)

<!-- page 44 of 56 -->

200B English tokens and thus does not memorize the detailed knowledge very well. Since CBQA seems to be a task that especially stresses memorization, as is indicated by Chinchilla (Hoffmann et al., 2022)’s a strong performance, we think with sufficient training later, GLM-130B can perform better.

结果见表 18. GLM-130B 在 Natural Questions 上表现相对较差, 在 StrategyQA 上表现不错. 我们推测, GLM-130B 在 Natural Questions 上表现不佳, 可能源于对英文语料拟合不足, 因为它大约只看了 2000 亿英文 token, 因而没有很好地记住细节知识. 从 Chinchilla (Hoffmann et al., 2022) 的强劲表现看, CBQA 似乎是特别考验记忆的任务, 我们认为经过后续充分的训练, GLM-130B 能做得更好.

## C.11 COMMONSENSE REASONING 常识推理

Here we evaluate GLM-130B and some other LLMs on commonsense reasoning abilities. As we have included PIQA (Bisk et al., 2020), ARC (Clark et al., 2018), and OpenbookQA (Mihaylov et al., 2018) in the MIP training, we select another two widely adopted commonsense reasoning datasets in our evaluation: Commonsense QA (Talmor et al., 2019) and Multiple-choice Temporal Commonsense (MC-TACO, Zhou et al. (2019)). For Commonsense QA, we test the GPT-3 via OpenAI Davinci API, BLOOM-176B via its Huggingface Implementation, and GLM-130B using the prompt “answer\_given\_question\_without\_options” from promptsource (Bach et al., 2022). For StrategyQA, we follow the EM computation method provided in (Zhou et al., 2019).

这里我们评测 GLM-130B 和其他一些 LLM 的常识推理能力. 由于 MIP 训练中已经纳入了 PIQA (Bisk et al., 2020), ARC (Clark et al., 2018) 和 OpenbookQA (Mihaylov et al., 2018), 我们选择另外两个广泛采用的常识推理数据集: Commonsense QA (Talmor et al., 2019) 和多选时间常识 (MC-TACO, Zhou et al. (2019)). 对 Commonsense QA, GPT-3 通过 OpenAI Davinci API 测试, BLOOM-176B 通过它的 Huggingface 实现测试, GLM-130B 使用 promptsource (Bach et al., 2022) 里的提示 「answer_given_question_without_options」. 对 StrategyQA, 我们按 (Zhou et al., 2019) 提供的方法计算 EM. (Zhou et al., 2019) 是 MC-TACO 的论文, 这里的 「StrategyQA」 应当是 MC-TACO 的笔误.

The results are shown in Table 19. As we can see, GLM-130B performs the best on both Commonsense QA and MC-TACO across evaluated LLMs, demonstrating that GLM-130B has a good grasp of commonsense knowledge. OPT’s results are not included due to the reason described in Appendix C.3.

结果见表 19. 可以看到, 在 Commonsense QA 和 MC-TACO 上, GLM-130B 都是被评测 LLM 中最好的, 说明 GLM-130B 对常识知识掌握得不错. 由于附录 C.3 所述的原因, 没有列入 OPT 的结果.

## C.12 FIXED LABEL DATASETS: A CASE STUDY IN NATURAL LANGUAGE INFERENCE 固定标签数据集: 以自然语言推理为例

As is discussed in Section 5, we adopt a rather strict criterion for selecting datasets for zero/few-shot learning in GLM-130B’s evaluation due to the use of MIP. Nevertheless, the criterion significantly reduces the dataset we could currently evaluate, and especially some readers have doubted whether the restriction of not evaluating on MIP-seen fixed-label datasets is necessary (e.g., natural language inference (NLI)), and suggest that we may report them in an independent section to avoid confusion.

如第 5 节所讨论, 由于使用了 MIP, 我们在 GLM-130B 的评测中为零样本/少样本学习挑选数据集时采用了相当严格的准则. 然而这个准则大大减少了我们目前能评测的数据集, 尤其是一些读者质疑, 不在 MIP 见过的固定标签数据集 (例如自然语言推理 (NLI)) 上评测的限制是否必要, 并建议我们可以把它们单独成节报告, 以免混淆.

Frankly speaking, in such a setting GLM-130B’s zero/few-shot learning could be quite advantageous. Below, we take NLI as a typical example to show GLM-130B’s outperformance in the scenarios. We include 6 widely-used NLI datasets–which are not incorporated in GLM-130B’s MIP training, as the benchmarks. The results are presented in Table 20, which shows that GLM-130B’s “zero-shot” performance could be much better due to the seen task type.

坦白说, 在这种设定下, GLM-130B 的零样本/少样本学习可能相当有优势. 下面以 NLI 为典型例子, 展示 GLM-130B 在这类场景中的领先. 我们选用 6 个广泛使用, 但没有纳入 GLM-130B MIP 训练的 NLI 数据集作为基准. 结果见表 20, 它表明由于见过这类任务, GLM-130B 的 「零样本」 表现可以好得多.

Table 20: “Zero-shot” results of GLM-130B on 6 typical natural language inference (NLI) datasets. ∗DISCLAIMER: Despite the datasets are never seen, some other NLI datasets have been included in GLM-130B’s MIP, making it different from the existing standard zero-shot setting.

|  | BLOOM 176B | OPT 175B | GLM-130B<sup>∗</sup> |
| --- | --- | --- | --- |
| qnli (valid, median of 5 prompts) | 50.9 | 55.4 | 86.7 |
| mnli (valid, median of 15 prompts) | 35.5 | 36.0 | 85.7 |
| mnli_mismatched (valid, median of 15 prompts) | 35.5 | 36.0 | 84.6 |
| wnli (valid, median of 5 prompts) | 57.7 | 53.5 | 67.6 |
| glue/cola (valid, median of 5 prompts) | 39.0 | 44.4 | 57.6 |
| glue/mrpc (valid, median of 5 prompts) | 31.6 | 44.6 | 87.3 |

表 20: GLM-130B 在 6 个典型自然语言推理 (NLI) 数据集上的 「零样本」 结果. ∗免责声明: 尽管这些数据集从未见过, 但 GLM-130B 的 MIP 里包含了其他一些 NLI 数据集, 这使它不同于现有的标准零样本设定.

| 数据集 | BLOOM 176B | OPT 175B | GLM-130B∗ |
| --- | --- | --- | --- |
| qnli (验证集, 5 个提示的中位数) | 50.9 | 55.4 | 86.7 |
| mnli (验证集, 15 个提示的中位数) | 35.5 | 36.0 | 85.7 |
| mnli_mismatched (验证集, 15 个提示的中位数) | 35.5 | 36.0 | 84.6 |
| wnli (验证集, 5 个提示的中位数) | 57.7 | 53.5 | 67.6 |
| glue/cola (验证集, 5 个提示的中位数) | 39.0 | 44.4 | 57.6 |
| glue/mrpc (验证集, 5 个提示的中位数) | 31.6 | 44.6 | 87.3 |

(第 49 页表 12 的 「释义识别」 一栏列有 glue/mrpc, 也就是说表 20 的最后一行其实是 MIP 训练过的数据集, 和本节 「没有纳入 MIP」 的说法冲突; cola 是语法可接受性判断, mrpc 是释义识别, 严格说都不属于 NLI.)

## C.13 SUPERGLUE SuperGLUE 评测

We also report our evaluation of GLM-130B on the SuperGLUE (Wang et al., 2019) benchmark, which consists 8 different natural language understanding challenges. Noted that these results are neither zero/few-shot nor fine-tuned results, because 7 out of 8 tasks’ training sets have been included in GLM-130B’s MIP training (except for ReCoRD) together with other 67 multi-task datasets; however, GLM-130B is also not individually fine-tuned on any of them. Therefore, these results are not for relative comparison for any other models’, but only for readers’ reference on GLM-130B’s absolute ability.

我们还报告了 GLM-130B 在 SuperGLUE (Wang et al., 2019) 基准上的评测, 它由 8 个不同的自然语言理解任务组成. 注意这些结果既不是零样本/少样本结果, 也不是微调结果, 因为 8 个任务中有 7 个的训练集 (ReCoRD 除外) 和另外 67 个多任务数据集一起纳入了 GLM-130B 的 MIP 训练; 但 GLM-130B 也没有在其中任何一个上单独微调过. 因此, 这些结果不用于和其他任何模型作相对比较, 只供读者参考 GLM-130B 的绝对能力.

> **核对:** 这里说 SuperGLUE 8 个任务里只有 ReCoRD 的训练集没进 MIP. 拿第 49 页表 12 对一下, 是这样吗?
> 对不上. 表 12 的 「Extractive QA」 一栏明确列着 super_glue/record, 此外还有 super_glue/wsc.fixed, super_glue/cb, super_glue/rte, super_glue/boolq, super_glue/multirc, super_glue/wic, super_glue/copa, 8 个 SuperGLUE 任务全在. 数量上也说明问题: 本页说 7 个加 「另外 67 个」 共 74 个, 表 12 正好 74 行, 其中就包括 record; 如果 ReCoRD 真不在, 表 12 应只有 73 个. 第 29 页图 14 的消融里, 加 MIP 后 ReCoRD 从 66.4 掉到 50.7, 那次消融用的是 T0 的数据设置, 和 GLM-130B 的 MIP 不完全相同, 不能拿来反推. 按表 12 读, ReCoRD 也进了 MIP, 图 17 里 record 的结果同样带着 MIP 的影响. 第 32 页 C.1 交代的数据事故可以解释这个出入: 原计划只放 T0 的多任务训练部分, 结果误把 T0 的零样本迁移部分也放进了 MIP, 约 23k 步才修正, 表 12 列的可能是出事时的那份清单.

<!-- page 45 of 56 -->

![Chart block](images/p45-figure-17-glm-130b-uni-and-bi-s-untuned-results-on.png)

Figure 17: GLM-130B (uni and bi)’s untuned results on SuperGLUE development set, using promptsource (Bach et al., 2022) prompts and task formulation. DISCLAIMER: Noted that some of the SuperGLUE training sets have been included in the MIP training. We report the results here only for readers’ reference.

图 17: GLM-130B (uni 和 bi) 在 SuperGLUE 开发集上未经微调的结果, 使用 promptsource (Bach et al., 2022) 的提示和任务形式. 免责声明: 注意部分 SuperGLUE 训练集已纳入 MIP 训练. 这里的结果只供读者参考.

(图: 8 列散点, 每个点是一个提示的结果. 蓝点 GLM-130B (uni) 散得很开, 例如 cb 从约 9 到 61, record 分成约 17 和约 65 两团, boolq 从约 38 到 67; 橙点 GLM-130B (bi) 聚得紧而且更高: cb 约 83 到 92, multirc 和 rte 约 85 到 89, copa 约 87 到 96, boolq 约 86, wic 约 60 到 65, wsc 约 61 到 76, record 分成约 29, 49, 67 三团.)

![Chart block](images/p45-figure-18-chain-of-thought-prompting-can-also-improve.png)

Figure 18: Chain-of-thought prompting can also improve GLM-130B’s performance on reasoning tasks compared to standard prompting.

图 18: 与标准提示相比, 思维链提示也能提升 GLM-130B 在推理任务上的表现.

(图: 6 组柱, 蓝柱 Standard Prompting, 黄柱 Chain-of-Thoughts. Sports 54.0 / 73.7, LLC 1.0 / 13.4, Coin Flip 84.5 / 95.0, Coin Flip (OOD: 3) 47.9 / 58.6, Reverse List 53.1 / 68.3, Date 15.7 / 27.9.)

<table><tbody><tr><td colspan="2">BoolQ</td><td>CB</td><td>COPA</td><td>MultiRC</td><td>ReCoRD</td><td>RTE</td><td>WiC</td><td>WSC</td></tr><tr><td>GLM-130B</td><td>89.69</td><td>98.21</td><td>100</td><td>89.32</td><td>92.11</td><td>94.22</td><td>76.96</td><td>88.5</td></tr></tbody></table>

Table 21: The results of GLM-130B on the SuperGLUE dataset obtained using the P-tuning v2 (Liu et al., 2022). We report the Accuracy metric for all datasets except for MultiRC (F1a) and ReCoRD (F1).

表 21: 用 P-tuning v2 (Liu et al., 2022) 得到的 GLM-130B 在 SuperGLUE 数据集上的结果. 除 MultiRC (F1a) 和 ReCoRD (F1) 外, 所有数据集都报告准确率.

| | BoolQ | CB | COPA | MultiRC | ReCoRD | RTE | WiC | WSC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GLM-130B | 89.69 | 98.21 | 100 | 89.32 | 92.11 | 94.22 | 76.96 | 88.5 |

The results are presented in Figure 17. We ablate the unidirectional and bidirectional GLM-130B to justify the usefulness of GLM objective in boosting LLMs’ ability to understand. Each point in the figure refers to a prompt-specific result, for which the prompt is from the promptsource (Bach et al., 2022) repository. We adopt the task formulation from promptsource, too. As we can observe, GLM (bi) has much fewer variances and higher performances on all tasks. For some of the tasks (such as CB, MultiRC, RTE, COPA, and BoolQ), GLM-130B can even achieve over 80% accuracy.

结果见图 17. 我们消融单向和双向的 GLM-130B, 以论证 GLM 目标对提升 LLM 理解能力的作用. 图中每个点对应一个提示的结果, 提示来自 promptsource (Bach et al., 2022) 仓库. 任务形式也采用 promptsource 的. 可以看到, GLM (bi) 在所有任务上方差都小得多, 成绩也更高. 在部分任务上 (如 CB, MultiRC, RTE, COPA 和 BoolQ), GLM-130B 甚至能达到 80% 以上的准确率.

We also attempted to fine-tune GLM-130B on the SuperGLUE dataset. However, we encountered the issue of rapid overfitting within a single epoch when we used full parameter fine-tuning on downstream tasks. This resulted in poor performance on the validation set. To address this issue, we explored the use of efficient parameter fine-tuning methods, which tune only a small number of parameters and are less prone to overfitting. After experimenting with several methods, we use P-Tuning v2 (Liu et al., 2022), which demonstrated comparable results to full parameter fine-tuning in GLM-130B, but with only 0.1% to 3% of tuned parameters. The results of our experiments with P-Tuning v2 are presented in Table 21.

我们也尝试过在 SuperGLUE 数据集上微调 GLM-130B. 但对下游任务做全参数微调时, 我们遇到了在一个 epoch 内就迅速过拟合的问题, 导致验证集上表现很差. 为了解决这个问题, 我们探索了参数高效的微调方法, 它们只调很少的参数, 不容易过拟合. 试了几种方法后, 我们选用 P-Tuning v2 (Liu et al., 2022), 它在 GLM-130B 上取得了和全参数微调相当的结果, 而只需调 0.1% 到 3% 的参数. P-Tuning v2 的实验结果见表 21.

## C.14 CHAIN-OF-THOUGHT PROMPTING 思维链提示

We evaluate the chain-of-thought prompting performance on **Last letter concatenation** (LLC), **Coin Flip**, **Reverse List**, and two tasks from BIG-bench Srivastava et al. (2022) **Sports** understanding, and **Date** understanding, following the setting in Wei et al. (2022c). The results are shown in Figure 17. We find that chain-of-thought prompting can improve GLM-130B’s performance on symbolic reasoning and commonsense reasoning.

按照 Wei et al. (2022c) 的设置, 我们在 **末字母拼接** (LLC), **抛硬币**, **列表反转** 以及 BIG-bench (Srivastava et al. (2022)) 里的两个任务 **体育** 理解和 **日期** 理解上评测思维链提示的表现. 结果见图 17 (按内容应为图 18). 我们发现思维链提示能提升 GLM-130B 在符号推理和常识推理上的表现.

<!-- page 46 of 56 -->

![Chart block](images/p46-figure-19-log-scaling-ability-tasks-of-glm-130b-these.png)

Figure 19: Log-scaling ability tasks of GLM-130B. These tasks’ performance grows logarithmically with the amount of GLM parameters. Most of traditional NLP tasks fall into the same pattern.

图 19: GLM-130B 的对数增长型能力任务. 这些任务的表现随 GLM 参数量呈对数增长. 大多数传统 NLP 任务都属于这种模式.

(图: 四个小图, 横轴都是参数量 10^8 到 10^11. LAMBADA 准确率从约 29 升到约 80; Wikitext-103, Wikitext-2 和 PTB 的纵轴是困惑度, 刻度倒置 (越往上越低), 分别从约 17.6 降到约 10.7, 从约 20.4 降到约 10.9, 从约 67 降到约 19.)

**Last letter concatenation (LLC)**. The task asks the model to concatenate the last letters of words in a name (e.g., "Elon Musk" -> "nk"). We generate full names by randomly concatenating the top 1000 first and last names from name census data<sup>14</sup>.

**末字母拼接 (LLC).** 这个任务要求模型把一个名字里各个单词的最后一个字母拼起来 (例如 「Elon Musk」 -> 「nk」). 我们从姓名普查数据 (脚注 14) 中取排名前 1000 的名和姓随机组合, 生成全名.

**Coin flip**. This task asks the model to answer whether a coin is still heads up after people either flip or don’t flip it beginning from being heads up. $( \mathrm { e . g . ,   A }$ coin is heads up. Phoebe flips the coin. Osvaldo does not flip the coin. Is the coin still heads up $)?  \rightarrow   no$ . We additionally evaluate on the scenario where the number of people in the query examples is larger than that in the in-context examples, i.e. the out-of-distribution (OOD) setting.

**抛硬币.** 这个任务要求模型回答: 一枚硬币开始时正面朝上, 几个人各自翻或不翻它之后, 是否仍然正面朝上. (例如: 一枚硬币正面朝上. Phoebe 翻了硬币. Osvaldo 没有翻硬币. 硬币还是正面朝上吗? -> 否.) 我们还评测了查询样例中的人数多于上下文样例中人数的情形, 即分布外 (OOD) 设定.

**Reverse List**. This task asks the model to reverse the order of a list of everyday objects (e.g., "cigar, umbrella, key, gum, alarm" -> "alarm, gum, key, umbrella, cigar"). We generate the lists by randomly sampling from the vocabulary of everyday objects<sup>15</sup>.

**列表反转.** 这个任务要求模型把一串日常物品的顺序倒过来 (例如 「cigar, umbrella, key, gum, alarm」 -> 「alarm, gum, key, umbrella, cigar」). 列表从日常物品词表 (脚注 15) 中随机抽样生成.

**Sports**. This task asks the model to judge the truthfulness of a statement about a sports player (e.g., "Joao Moutinho caught the screen pass in the NFC championship" -> "false").

**体育.** 这个任务要求模型判断一条关于运动员的陈述是否属实 (例如 「Joao Moutinho caught the screen pass in the NFC championship」 -> 「false」).

**Date**. This task asks the model to infer the data from a given context (e.g., "2015 is coming in 36 hours. What is the date one week from today in MM/DD/YYYY?" -> "01/05/2015").

**日期.** 这个任务要求模型根据给定上下文推断日期 (原文把 date 误作 data) (例如 「2015 年还有 36 小时就到了. 从今天起一周后是哪天, 按 MM/DD/YYYY 写?」 -> 「01/05/2015」).

We use the same examples and chains as Wei et al. (2022c). For each task, we try two different formats of prompts and both unidirectional and bidirectional attention mechanism and report the best performance. The first format is "Question: {context} Answer: {target}". The second one is to add serial numbers before examples in the first format of prompts. The results are presented in Figure 18.

我们使用和 Wei et al. (2022c) 相同的样例和推理链. 对每个任务, 我们尝试两种提示格式, 以及单向和双向两种注意力机制, 报告其中最好的结果. 第一种格式是 「Question: {context} Answer: {target}」. 第二种是在第一种格式的样例前加序号. 结果见图 18.

## D SCALING AND EMERGENT ABILITIES IN GLM-130B GLM-130B 的规模与涌现能力

Scaling up pre-trained language models has been proven to boost downstream performance on a wide range of tasks continually. His, emergent abilities which are unpredictable from smaller scales. To illustrate this, we conducted extensive experiments to explore the scaling property and emergent abilities. Following prior literature (Wei et al., 2022b), we categorize the NLP tasks into two types based on our observations.

扩大预训练语言模型的规模, 已被证明能在大量任务上持续提升下游表现. 此外 (原文 「His,」 疑为 「Also,」 的笔误), 还有从较小规模无法预测的涌现能力. 为了说明这一点, 我们做了大量实验, 探索规模性质和涌现能力. 按照已有文献 (Wei et al., 2022b), 我们根据观察把 NLP 任务分成两类.

• **Log-scaling Ability Tasks (Cf. Figure 19)**: where the task performance grows logarithmically with the number of model parameters. Typical tasks and datasets include LAMBADA, Wikitext-103, Wikitext-2, Penn Tree Bank.

- **对数增长型能力任务 (见图 19)**: 任务表现随模型参数量呈对数增长. 典型的任务和数据集包括 LAMBADA, Wikitext-103, Wikitext-2 和 Penn Tree Bank.

• **Emergent Ability Tasks (Cf. Figure 20)**: where the task performance only soars up when the amount of model parameters reaches a certain threshold. Typical tasks and datasets include:

- **涌现型能力任务 (见图 20)**: 只有当模型参数量达到某个阈值时, 任务表现才会陡然上升. 典型的任务和数据集包括: (列表在下一页接续.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">14<a href="https://namecensus.com"><sub>https</sub>://namecensus.com</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">15<a href="https://www.vocabulary.com/lists/189583"><sub>https</sub>://www.vocabulary.com/lists/189583</a></span></small>

脚注 14: 姓名普查网站 namecensus.com. 脚注 15: vocabulary.com 上的日常物品词表. 链接均见上.

<!-- page 47 of 56 -->

![Chart block](images/p47-figure-20-emergent-ability-tasks-of-glm-130b-these.png)

Figure 20: Emergent ability tasks of GLM-130B. These tasks’ performance does not grow much until the model size reaches a certain threshold (e.g., 100B or 10B). After reaching the threshold, the model performance soars up quickly. The BIG-bench (Srivastava et al., 2022) benchmark collects many of these challenges.

图 20: GLM-130B 的涌现型能力任务. 这些任务的表现在模型规模达到某个阈值 (例如 1000 亿或 100 亿) 之前不怎么增长, 达到阈值后迅速上升. BIG-bench (Srivastava et al., 2022) 基准收集了很多这类挑战.

(图: 8 个小图, 横轴参数量 10^8 到 10^11. MMLU 在 10^9 以前约 23 到 25, 10^10 约 33.7, 130B 约 44.8; hindu_knowledge 在 10^9 附近约 22, 10^10 约 32, 130B 约 49; crass_ai 从约 16 升到约 59; implicatures 在 10^10 以前都在 50 左右, 130B 跳到约 78; understanding_fables 在 10^9 附近约 19, 130B 约 43; modified_arithmetic 在 10^10 以前都是 0 左右, 130B 约 17.7; implicit_relations 从约 5 升到约 36; gre_RC 在 10^10 处约 19, 130B 约 38.)

MMLU, hindu\_knowledge, crass\_ai, implicatures, understanding\_fables, modified\_arithmetic, implicit\_relations, and gre\_reading\_comprehension from BIG-bench (Srivastava et al., 2022).

MMLU, 以及 BIG-bench (Srivastava et al., 2022) 里的 hindu_knowledge, crass_ai, implicatures, understanding_fables, modified_arithmetic, implicit_relations 和 gre_reading_comprehension.

In line with the observation in (Wei et al., 2022b), we show that GLM-130B also presents the two similar scaling behaviors to other LLMs such as GPT-3, LaMDA, and PaLM. Though why and how LLMs present these intriguing properties remain unclear, GLM-130B provides open opportunities for all researchers to test and understand the reason behind them.

与 (Wei et al., 2022b) 的观察一致, 我们展示了 GLM-130B 也呈现出和 GPT-3, LaMDA, PaLM 等其他 LLM 类似的两种规模行为. 虽然 LLM 为什么以及如何呈现这些有趣的性质仍不清楚, 但 GLM-130B 为所有研究者提供了测试和理解背后原因的开放机会.

<!-- page 48 of 56 -->

Table 11: Full configurations for GLM-130B training

| Configuration Key | Value |
| --- | --- |
| adam_beta1 | 0.9 |
| adam_beta2 | 0.95 |
| adam_eps | 1e-08 |
| aggregated_samples_per_sequence | 4 |
| attention_dropout | 0.1 |
| attention_softmax_in_fp32 | True |
| average_block_length | 3 |
| bias_dropout_fusion | True |
| checkpoint_activations | True |
| checkpoint_in_cpu | False |
| checkpoint_num_layers | 1 |
| clip_grad | 1.0 |
| contigious_checkpointing | False |
| cpu_optimizer | False |
| data_parallel_size | 24 |
| deepnorm | True |
| distributed_backend | nccl |
| eval_interval | 1000 |
| eval_iters | 3 |
| ffn_hidden_size | 32768 |
| fp16 | True |
| global_batch_size | 4224 |
| glu_activation | geglu |
| gpt_prob | 0.7 |
| hidden_dropout | 0.1 |
| hidden_size | 12288 |
| hysteresis | 2 |
| init_method_std | 0.0052 |
| init_method_xavier_uniform | False |
| initial_loss_scale | 65536 |
| layernorm_epsilon | 1E-05 |
| learnable_rotary_embedding | False |
| length_per_sample | 2000 |
| log_interval | 1 |
| loss_scale | 0 |
| loss_scale_window | 2000 |
| lr | 8e-05 |
| lr_decay_iters | None |
| lr_decay_samples | 197753905 |
| lr_decay_style | cosine |
| lr_warmup_samples | 1098632 |
| make_vocab_size_divisible_by | 768 |
| mask_prob | 0.15 |
| masked_softmax_fusion | True |
| micro_batch_size | 1 |
| min_gmask_ratio | 0.2 |
| min_loss_scale | 1.0 |
| min_lr | 8e-06 |
| multitask_ratio | 0.05 |
| num_attention_heads | 96 |
| num_layers | 70 |
| onnx_safe | None |
| optimizer | adam |
| partition_activations | True |
| pipeline_model_parallel_size | 8 |
| position_embedding_type | rotary |
| rampup_batch_size | 192, 24, 5493164 |
| save_interval | 250 |
| seed | 1234 |
| seq_length | 2048 |
| short_seq_prob | 0.02 |
| shrink_embedding_gradient_alpha | 0.1 |
| single_span_prob | 0.02 |
| split | 949,50,1 |
| tensor_model_parallel_size | 4 |
| tokenizer_type | IceTokenizer |
| weight_decay | 0.1 |
| zero_contigious_gradients | False |
| zero_reduce_bucket_size | 500000000 |
| zero_reduce_scatter | False |
| zero_stage | 1 |
| zero-optimization.allgather_bucket_size | 500000000 |
| tokenizer_type | IceTokenizer |
| weight_decay | 0.1 |
| world_size | 768 |
| zero_contigious_gradients | FALSE |
| zero_reduce_bucket_size | 500000000 |
| zero_reduce_scatter | FALSE |
| zero_stage | 1 |
| zero-optimization.allgather_bucket_size | 500000000 |

表 11: GLM-130B 训练的完整配置.

主要配置项的中文说明 (数值同上表):

| 配置项 | 值 | 说明 |
| --- | --- | --- |
| hidden_size / ffn_hidden_size | 12288 / 32768 | 隐藏维度和 FFN 宽度, 32768 = 12288 × 8/3 |
| num_layers / num_attention_heads | 70 / 96 | 层数和注意力头数 |
| seq_length / length_per_sample | 2048 / 2000 | 序列长度 2048; 每个样本长度一项写的是 2000 |
| global_batch_size / micro_batch_size | 4224 / 1 | 全局 batch 和微批次大小 |
| rampup_batch_size | 192, 24, 5493164 | batch 从 192 起, 每次加 24, 在 5493164 个样本内升到 4224 |
| tensor / pipeline / data 并行 | 4 / 8 / 24 | 4 × 8 × 24 = 768 = world_size, 即 96 台 × 8 卡 |
| lr / min_lr / lr_decay_style | 8e-05 / 8e-06 / cosine | 余弦衰减到峰值的十分之一 |
| lr_warmup_samples / lr_decay_samples | 1098632 / 197753905 | 预热样本约占总衰减样本的 0.56% |
| adam_beta1 / adam_beta2 / adam_eps | 0.9 / 0.95 / 1e-08 | AdamW 参数 |
| weight_decay / clip_grad | 0.1 / 1.0 | 权重衰减和梯度裁剪 |
| attention_dropout / hidden_dropout | 0.1 / 0.1 | dropout |
| fp16 / attention_softmax_in_fp32 | True / True | FP16 训练, 注意力 softmax 用 FP32 |
| deepnorm / glu_activation / position_embedding_type | True / geglu / rotary | DeepNorm, GeGLU, RoPE |
| shrink_embedding_gradient_alpha | 0.1 | EGS 的收缩因子 α |
| gpt_prob / mask_prob / average_block_length | 0.7 / 0.15 / 3 | 70% 序列用 [gMASK]; [MASK] 遮 15%, 平均片段长 3 |
| multitask_ratio | 0.05 | MIP 占 5% |
| initial_loss_scale / min_loss_scale / loss_scale_window | 65536 / 1.0 / 2000 | 动态 loss scaling 参数 |
| zero_stage | 1 | ZeRO 第 1 阶段 |
| tokenizer_type / make_vocab_size_divisible_by | IceTokenizer / 768 | icetk 分词器, 词表补齐到 768 的倍数 |

(源表末尾有 tokenizer_type, weight_decay, zero_contigious_gradients, zero_reduce_bucket_size, zero_reduce_scatter, zero_stage, zero-optimization.allgather_bucket_size 这几项重复出现了两次, 第二次的布尔值写成大写 FALSE, 值相同, 是 PDF 原表排版时重复的; 源表也把 contiguous 拼成了 contigious.)

<!-- page 49 of 56 -->

Table 12: The 74 datasets involved in Multi-task Instruction Pre-training (MIP). Datasets from T0- PromptSource (Sanh et al., 2022; Bach et al., 2022) are named in their Hugging Face datasets identifiers. Datasets from DeepStruct (Wang et al., 2022a) are described in Appendix C.2.

| Task | Dataset | Task | Dataset |
| --- | --- | --- | --- |
| Coreference Resolution | super_glue/wsc.fixed | Multi-choice QA | cos_e/v1.11 |
| Coreference Resolution | winogrande/winogrande_xl | Multi-choice QA | cosmos_qa |
| Natural Language Inference | super_glue/cb | Multi-choice QA | dream |
| Natural Language Inference | super_glue/rte | Multi-choice QA | openbookqa/main |
| Natural Language Inference | anli | Multi-choice QA | qasc |
| Paraphrase Identification | glue/mrpc | Multi-choice QA | quail |
| Paraphrase Identification | glue/qqp | Multi-choice QA | quarel |
| Paraphrase Identification | paws/labeled_final | Multi-choice QA | quartz |
| Closed-Book QA | ai2_arc/ARC_Challenge | Multi-choice QA | race/high |
| Closed-Book QA | ai2_arc/ARC_Easy | Multi-choice QA | race/middle |
| Closed-Book QA | kilt_tasks/hoptpotqa | Multi-choice QA | sciq |
| Closed-Book QA | trivia_qa/unfiltered | Multi-choice QA | social_i_qa |
| Closed-Book QA | web_questions | Multi-choice QA | super_glue/boolq |
| Closed-Book QA | wiki_qa | Multi-choice QA | super_glue/multirc |
| Extractive QA | adversarial_qa/dbidaf | Multi-choice QA | wiki_hop/original |
| Extractive QA | adversarial_qa/dbert | Multi-choice QA | wiqa |
| Extractive QA | adversarial_qa/droberta | Multi-choice QA | piqa |
| Extractive QA | duorc/SelfRC | Topic Classification | ag_news |
| Extractive QA | duorc/ParaphraseRC | Topic Classification | dbpedia_14 |
| Extractive QA | ropes | Topic Classification | trec |
| Extractive QA | squad_v2 | Word Sense Disambiguation | super_glue/wic |
| Extractive QA | super_glue/record | Dialogue State Tracking | multiwoz_2.1 |
| Extractive QA | quoref | Event Extraction | ace05 |
| Sentiment | amazon_polarity | Named Entity Recognition | conll03 |
| Sentiment | app_reviews | Named Entity Recognition | genia |
| Sentiment | imdb | Named Entity Recognition | ontonotes5.0 |
| Sentiment | rotten_tomatoes | Named Entity Recognition | ace2005 |
| Sentiment | yelp_review_full | Named Entity Recognition | conll04 |
| Sentence Completion | super_glue/copa | Named Entity Recognition | nyt29 |
| Sentence Completion | hellaswag | Relation Extraction | conll04 |
| Structure-to-Text | common_gen | Relation Extraction | nyt29 |
| Structure-to-Text | wiki_bio | Relation Extraction | ace2005 |
| Summarization | cnn_dailymail/3.0.0 | Relation Extraction | kelm |
| Summarization | gigaword | Relation Classification | tacred |
| Summarization | multi_news | Semantic Role Labeling | conll05 |
| Summarization | samsum | Semantic Role Labeling | conll12 |
| Summarization | xsum | Semantic Role Labeling | propbank |

表 12: 多任务指令预训练 (MIP) 涉及的 74 个数据集. 来自 T0-PromptSource (Sanh et al., 2022; Bach et al., 2022) 的数据集用它们在 Hugging Face datasets 中的标识符命名. 来自 DeepStruct (Wang et al., 2022a) 的数据集见附录 C.2.

表中任务类别的中文对照: Coreference Resolution 共指消解, Natural Language Inference 自然语言推理, Paraphrase Identification 释义识别, Closed-Book QA 闭卷问答, Extractive QA 抽取式问答, Sentiment 情感, Sentence Completion 句子补全, Structure-to-Text 结构到文本, Summarization 摘要, Multi-choice QA 多选问答, Topic Classification 主题分类, Word Sense Disambiguation 词义消歧, Dialogue State Tracking 对话状态追踪, Event Extraction 事件抽取, Named Entity Recognition 命名实体识别, Relation Extraction 关系抽取, Relation Classification 关系分类, Semantic Role Labeling 语义角色标注.

(按表数: 左栏 37 个, 右栏 37 个, 共 74 个. 从 multiwoz_2.1 起到 propbank 的 16 个来自 DeepStruct, 其余 58 个来自 T0/PromptSource. kilt_tasks/hoptpotqa 是原文拼写, 应为 hotpotqa.)

<!-- page 50 of 56 -->

Table 14: Details results of GLM-130B, GPT-3 175B (Brown et al., 2020), and PaLM 540B (Chowdhery et al., 2022) on BIG-bench-lite in 0, 1, and 3-shots. “Normalized preferred metric” is reported for each task. GPT-3 and PaLM’s results are reported in BIG-bench’s GitHub repository, and PaLM 540B’s 3-shot results are not found.

<table><tbody><tr><td rowspan="2"></td><td colspan="3">GLM-130B</td><td colspan="3">GPT-3 175B</td><td colspan="2">PaLM 540B</td></tr><tr><td>0</td><td>1</td><td>3</td><td>0</td><td>1</td><td>3</td><td>0</td><td>1</td></tr><tr><td>auto_debugging</td><td>11.76</td><td>20.59</td><td>23.53</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>38.23</td></tr><tr><td>bbq_lite_json</td><td>22.26</td><td>37.50</td><td>59.73</td><td>-8.33</td><td>40.75</td><td>61.21</td><td>-4.39</td><td>77.73</td></tr><tr><td>code_line_description</td><td>0.22</td><td>9.09</td><td>-8.64</td><td>9.09</td><td>9.09</td><td>9.09</td><td>0.22</td><td>49.00</td></tr><tr><td>conceptual_combinations</td><td>37.51</td><td>31.33</td><td>27.86</td><td>2.37</td><td>3.70</td><td>14.33</td><td>45.68</td><td>73.36</td></tr><tr><td>conlang_translation</td><td>34.72</td><td>38.01</td><td>33.88</td><td>46.82</td><td>47.07</td><td>51.60</td><td>36.88</td><td>61.92</td></tr><tr><td>emoji_movie</td><td>1.25</td><td>4.88</td><td>3.75</td><td>-10.00</td><td>-2.49</td><td>-1.24</td><td>17.50</td><td>88.75</td></tr><tr><td>formal_fallacies_syllogisms_negation</td><td>0.83</td><td>1.46</td><td>0.35</td><td>1.00</td><td>6.80</td><td>5.60</td><td>-0.20</td><td>4.40</td></tr><tr><td>hindu_knowledge</td><td>32.23</td><td>37.56</td><td>34.52</td><td>10.15</td><td>40.61</td><td>44.42</td><td>41.37</td><td>93.15</td></tr><tr><td>known_unknowns</td><td>-4.35</td><td>0.00</td><td>4.35</td><td>21.74</td><td>4.35</td><td>0.00</td><td>13.04</td><td>34.78</td></tr><tr><td>language_identification</td><td>9.62</td><td>1.97</td><td>1.90</td><td>7.49</td><td>3.20</td><td>1.98</td><td>12.11</td><td>31.03</td></tr><tr><td>linguistics_puzzles</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.10</td></tr><tr><td>logic_grid_puzzle</td><td>9.88</td><td>13.66</td><td>5.24</td><td>0.16</td><td>3.35</td><td>0.01</td><td>1.47</td><td>16.12</td></tr><tr><td>logical_deduction</td><td>24.18</td><td>22.20</td><td>20.35</td><td>2.22</td><td>10.80</td><td>14.71</td><td>2.17</td><td>15.34</td></tr><tr><td>misconceptions_russian</td><td>-26.53</td><td>-46.94</td><td>-26.53</td><td>-34.70</td><td>-34.70</td><td>-30.61</td><td>-42.86</td><td>-30.61</td></tr><tr><td>novel_concepts</td><td>6.25</td><td>21.87</td><td>25.78</td><td>33.59</td><td>33.59</td><td>45.31</td><td>33.59</td><td>49.22</td></tr><tr><td>operators</td><td>14.76</td><td>18.10</td><td>18.10</td><td>30.0</td><td>34.29</td><td>33.33</td><td>30.48</td><td>56.19</td></tr><tr><td>parsinlu_reading_comprehension</td><td>7.14</td><td>7.72</td><td>11.58</td><td>0.00</td><td>0.00</td><td>0.00</td><td>9.46</td><td>44.40</td></tr><tr><td>play_dialog_same_or_different</td><td>2.88</td><td>5.33</td><td>3.80</td><td>8.00</td><td>0.80</td><td>-5.40</td><td>-33.0</td><td>0.10</td></tr><tr><td>repeat_copy_logic</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>37.5</td></tr><tr><td>strange_stories</td><td>43.86</td><td>51.76</td><td>42.31</td><td>8.27</td><td>25.68</td><td>12.93</td><td>39.25</td><td>74.46</td></tr><tr><td>strategyqa</td><td>21.10</td><td>18.74</td><td>16.82</td><td>4.60</td><td>13.20</td><td>14.20</td><td>28.00</td><td>38.00</td></tr><tr><td>symbol_interpretation</td><td>1.39</td><td>1.89</td><td>1.77</td><td>0.51</td><td>-0.63</td><td>2.77</td><td>0.76</td><td>2.40</td></tr><tr><td>vitaminc_fact_verification</td><td>71.87</td><td>60.72</td><td>56.55</td><td>-31.55</td><td>22.15</td><td>29.05</td><td>-28.85</td><td>55.60</td></tr><tr><td>winowhy</td><td>-3.49</td><td>5.38</td><td>3.0</td><td>3.0</td><td>10.60</td><td>13.00</td><td>-5.0</td><td>31.80</td></tr></tbody></table>

表 14: GLM-130B, GPT-3 175B (Brown et al., 2020) 和 PaLM 540B (Chowdhery et al., 2022) 在 BIG-bench-lite 上 0, 1, 3-shot 的详细结果. 每个任务报告 「归一化首选指标」. GPT-3 和 PaLM 的结果取自 BIG-bench 的 GitHub 仓库, 没有找到 PaLM 540B 的 3-shot 结果.

(表头: 第一列是任务名, 之后依次是 GLM-130B 的 0/1/3-shot, GPT-3 175B 的 0/1/3-shot, PaLM 540B 的 0/1-shot. 24 个任务逐列平均: GLM-130B 13.31, 15.12, 15.00; GPT-3 175B 4.35, 11.34, 13.18; PaLM 540B 8.24, 39.29. GPT-3 三列和表 4 一致, GLM-130B 后两列和 PaLM 两列与表 4 有出入, 见第 8 页的疑问. 零样本下 GPT-3 高于 GLM-130B 的 8 个任务是 code_line_description, conlang_translation, formal_fallacies_syllogisms_negation, known_unknowns, novel_concepts, operators, play_dialog_same_or_different, winowhy; linguistics_puzzles 和 repeat_copy_logic 两者都是 0. 1-shot 下 PaLM 540B 在 24 个任务中有 21 个高于 GLM-130B.)

<!-- page 51 of 56 -->

Table 15: Detailed results of GLM-130B and BLOOM 176B (Scao et al., 2022) on MMLU (Hendrycks et al., 2021). We find that no existing literature has reported GPT-3 175B’s numerical accuracy. BLOOM is evaluated using Huggingface Transformer implementation.

|  | Discipline | GLM-130B | BLOOM 176B |
| --- | --- | --- | --- |
| STEM | abstract_algebraanatomy astronomycolledge_biologycollege_chemistrycolledge_computer_sciencecolledge_mathematciscolledge_physicscomputer_securityconceptual_physicselectrical_engineeringelementary_mathematicshigh_school_biologyhigh_school_chemistryhigh_school_computer_sciencehigh_school_mathematicshigh_school_physicshigh_school_statisticsmachine_learning | 24.0048.9048.0347.2234.0044.0027.0030.3961.0038.7245.5231.7551.2934.9853.0028.1529.8038.4340.18 | 24.0038.5234.8737.5019.001.0031.0024.5040.0031.4932.4129.6327.4227.0930.0025.9330.4626.3929.46 |
| Social Science | econometricshigh_school_geographyhigh_school_government_and_politicshigh_school_macroeconomicshigh_school_microeconomicshigh_school_psychologyhuman_sexualityprofessional_psychologypublic_relationssecurity_studiessociologyus_foreign_policy | 26.3253.5462.1842.5645.8054.1351.1542.4855.4644.9051.7461.00 | 26.3236.3640.4130.7726.8939.2735.1131.5433.6434.2931.8446.00 |
| Humanities | formal_logichigh_school_european_historyhigh_school_us_historyhigh_school_world_historyinternational_lawjurisprudencelogical_fallaciesmoral_disputesmoral_scenariosphilosophy prehistoryprofessional_lawworld_religions | 27.7858.1858.3367.0956.2043.5257.0647.1124.2545.3450.9337.9455.56 | 23.0235.7640.6932.0742.1535.1931.2936.7124.3635.3740.4329.5342.11 |
| Other | business_ethicsclinical_knowledgecolledge_medicineglocal_factshuman_agingmanagement marketingmedical_geneticsmiscellaneous nutritionprofessional_accountingprofessional_medicinevirology | 51.0048.6843.3535.0045.2956.3167.5248.0061.1850.6535.4643.3839.16 | 34.0035.8528.9023.0032.2927.1839.7445.0040.2332.3528.7218.0128.31 |

表 15: GLM-130B 和 BLOOM 176B (Scao et al., 2022) 在 MMLU (Hendrycks et al., 2021) 上的详细结果. 我们发现没有已有文献报告过 GPT-3 175B 的具体数值准确率. BLOOM 用 Huggingface Transformer 实现评测.

(表按 STEM, 社会科学, 人文, 其他四个大类分组, 每组第二列是学科名, 第三列是 GLM-130B 的准确率, 第四列是 BLOOM 176B 的准确率. 源 md 把同一大类的学科名和数字全粘在了一格里, 例如 STEM 一格从 abstract_algebra 的 24.00 开始. 按顺序拆开: STEM 19 个学科, 社会科学 12 个, 人文 13 个, 其他 13 个, 共 57 个. 除了 abstract_algebra (24.00 对 24.00), econometrics (26.32 对 26.32) 打平, college_mathematics (27.00 对 31.00), high_school_physics (29.80 对 30.46), moral_scenarios (24.25 对 24.36) 三个低于 BLOOM 以外, 其余 52 个学科 GLM-130B 都更高. BLOOM 的 college_computer_science 只有 1.00, 远低于随机猜的 25, 疑似 BLOOM 那次评测本身有问题. 学科名里的 colledge, mathematcis, glocal_facts 等是原文拼写.)

<!-- page 52 of 56 -->

## E CONTRIBUTIONS 贡献

The GLM-130B project was conceived in Dec. 2021 with its pre-training part completed in July 3rd, 2022 and its evaluation and applications still ongoing. Over the course, we have experienced various technical and engineering challenges (Cf. Appendix F and Figure 21 for details). It would not be possible to reach its current status if without the collaboration of multiple teams—the Knowledge Engineering Group (KEG), Parallel Architecture & Compiler technology of Mobile, Accelerated, and Networked systems Group (PACMAN), and Natural Language Processing Group (THUNLP) at Tsinghua University, as well as Zhipu.AI. The detailed contributions are listed below.

GLM-130B 项目构想于 2021 年 12 月, 预训练部分于 2022 年 7 月 3 日完成, 评测和应用仍在进行中. 这期间我们经历了各种技术和工程挑战 (详见附录 F 和图 21). 如果没有多个团队的合作, 即清华大学知识工程研究室 (KEG), 移动, 加速与网络系统并行架构与编译技术研究组 (PACMAN), 自然语言处理实验室 (THUNLP), 以及智谱 AI, 项目不可能走到今天. 详细贡献列在下面.

## E.1 PREPARATION 准备工作

• **Model Implementation:** Aohan Zeng, Zhengxiao Du

• **Self-Supervised Data Processing:** Ming Ding, Wendi Zheng

• **Multitask Data Processing:** Xiao Liu, Xiao Xia

• **Model Architecture:** Aohan Zeng, Xiao Liu, Zhengxiao Du, Hanyu Lai

• **Training Stability:** Aohan Zeng, Xiao Liu, Ming Ding

• **3D-Parallelism and Training Efficiency:** Aohan Zeng, Zixuan Ma, Jiaao He, Zhenbo Sun

- **模型实现:** Aohan Zeng, Zhengxiao Du
- **自监督数据处理:** Ming Ding, Wendi Zheng
- **多任务数据处理:** Xiao Liu, Xiao Xia
- **模型架构:** Aohan Zeng, Xiao Liu, Zhengxiao Du, Hanyu Lai
- **训练稳定性:** Aohan Zeng, Xiao Liu, Ming Ding
- **3D 并行与训练效率:** Aohan Zeng, Zixuan Ma, Jiaao He, Zhenbo Sun

## E.2 MODEL TRAINING 模型训练

• **Large-Scale Training & Monitoring:** Aohan Zeng, Xiao Liu

• **Model Performance Validation:** Aohan Zeng

- **大规模训练与监控:** Aohan Zeng, Xiao Liu
- **模型性能验证:** Aohan Zeng

## E.3 POST TRAINING 训练后工作

• **Evaluation Framework:** Aohan Zeng, Zhengxiao Du

• **Language Modeling Evaluation:** Aohan Zeng

• **MMLU & BIG-Bench Evaluation:** Aohan Zeng

• **CLUE & FewCLUE Evaluation:** Xiao Liu, Aohan Zeng

• **Ethical Evaluation:** Yifan Xu, Aohan Zeng, Xiao Liu, Zihan Wang

• **Baseline Evaluation:** Xiao Liu, Jifan Yu, Weng Lam Tam

• **INT4 Quantization:** Aohan Zeng, Zihan Wang, Xiao Liu, Hanyu Lai

• **Inference Acceleration:** Zihan Wang, Aohan Zeng

• **Low-Resource Inference:** Gouyang Zeng, Xu Han, Weilin Zhao, Zhiyuan Liu

• **Demo and API:** Hanyu Lai, Jifan Yu, Xiaohan Zhang, Yufei Xue, Shan Wang, Jiecai Shan, Haohan Jiang, Zhengang Guo

• **Manuscript Writing:** Xiao Liu, Yuxiao Dong, and Jie Tang wrote the main paper, and Xiao Liu, Aohan Zeng, and Zhengxiao Du wrote the Appendix.

- **评测框架:** Aohan Zeng, Zhengxiao Du
- **语言建模评测:** Aohan Zeng
- **MMLU 与 BIG-Bench 评测:** Aohan Zeng
- **CLUE 与 FewCLUE 评测:** Xiao Liu, Aohan Zeng
- **伦理评测:** Yifan Xu, Aohan Zeng, Xiao Liu, Zihan Wang
- **基线评测:** Xiao Liu, Jifan Yu, Weng Lam Tam
- **INT4 量化:** Aohan Zeng, Zihan Wang, Xiao Liu, Hanyu Lai
- **推理加速:** Zihan Wang, Aohan Zeng
- **低资源推理:** Gouyang Zeng, Xu Han, Weilin Zhao, Zhiyuan Liu
- **演示与 API:** Hanyu Lai, Jifan Yu, Xiaohan Zhang, Yufei Xue, Shan Wang, Jiecai Shan, Haohan Jiang, Zhengang Guo
- **论文写作:** 正文由 Xiao Liu, Yuxiao Dong 和 Jie Tang 撰写, 附录由 Xiao Liu, Aohan Zeng 和 Zhengxiao Du 撰写.

(这一节的标题 「Post Training」 指模型训练完成之后的评测, 量化, 部署等工作, 不是量化意义上的 「后训练」; INT4 量化列在这里, 也不说明量化后又训练过.)

## E.4 PROJECT MANAGEMENT 项目管理

• **Student Leaders:** Aohan Zeng, Xiao Liu

• **Technical Advisors:** Yuxiao Dong, Jidong Zhai, Wenguang Chen, Zhiyuan Liu, Peng Zhang, Jie Tang

• **Project Leader:** Jie Tang

- **学生负责人:** Aohan Zeng, Xiao Liu
- **技术顾问:** Yuxiao Dong, Jidong Zhai, Wenguang Chen, Zhiyuan Liu, Peng Zhang, Jie Tang
- **项目负责人:** Jie Tang

## E.5 COMPUTATION SPONSOR 算力赞助

• **GPU Sponsor:** Zhipu.AI

- **GPU 赞助:** 智谱 AI (Zhipu.AI)

<!-- page 53 of 56 -->

## F A BRIEF HISTORY OF GLM-130B GLM-130B 简史

The GLM-130B project<sup>16</sup> was conceived in Dec. 2021 in a brainstorming meeting at Tsinghua KEG. We firmly believe that it is of value to pre-train a highly accurate language model, in particular for both Chinese and English. Though GPT-3 (Brown et al., 2020) is the pioneer for this effort, it is not available to most people in the world. In addition, it supports English only. We therefore decide to initialize the project GLM-130B. Please note that the WuDao 1.75T model we built last year is a sparse model with 480 mixture-of-experts (MoE), rather than a dense one as GPT-3. Our goal then is to train a bilingual pre-trained dense model with high accuracy on downstream tasks, and to make it open to everyone in the world-anyone, anywhere can download it and use it on a single server with appropriate GPUs.

GLM-130B 项目 (脚注 16) 于 2021 年 12 月在清华 KEG 的一次头脑风暴会上构想出来. 我们坚信, 预训练一个高精度的语言模型, 尤其是同时面向中文和英文的, 是有价值的. 虽然 GPT-3 (Brown et al., 2020) 是这方面的先驱, 但世界上大多数人用不到它, 而且它只支持英文. 因此我们决定启动 GLM-130B 项目. 请注意, 我们去年构建的悟道 1.75T 模型是一个带 480 个 MoE 专家的稀疏模型, 不是像 GPT-3 那样的稠密模型. 我们当时的目标是训练一个在下游任务上精度高的双语预训练稠密模型, 并向全世界开放, 任何人在任何地方都能下载, 在一台配有合适 GPU 的服务器上使用.

The ambitious project soon faced several important challenges:

这个雄心勃勃的项目很快遇到了几个重要挑战:

• **Lack of computational resources**: No organization is willing to sponsor such a big project and freely make it public.

• **Lack of a robust pre-training algorithm**: Despite GPT-3’s success on English corpus, it is unclear how to train a high-accurate bilingual model for both English and Chinese.

• **Lack of fast inference solutions**: Since the goal is to have the model public to everyone, we need to design fast inference solutions with low resource requirements to run the model.

- **缺少算力资源**: 没有机构愿意赞助这么大的项目并免费公开.
- **缺少鲁棒的预训练算法**: 尽管 GPT-3 在英文语料上成功了, 怎样训练一个中英文都高精度的双语模型仍不清楚.
- **缺少快速推理方案**: 既然目标是向所有人公开模型, 就需要设计资源需求低的快速推理方案来运行模型.

For the pre-training algorithm, we finally chose GLM (Du et al., 2022) due to its high performance in practice. We eventually decided to train a GLM model of 130 billion parameters after several rounds of discussions and exploration, because such a size makes it possible to run the inference on a single A100 (40G \* 8) server.

预训练算法方面, 我们最终选择了 GLM (Du et al., 2022), 因为它在实践中性能高. 经过几轮讨论和探索, 我们最终决定训练一个 1300 亿参数的 GLM 模型, 因为这个规模可以在单台 A100 (40G × 8) 服务器上推理.

Our first attempt at training the model was in January 2022, shortly after we received a small sponsor of GPUs for test running. However, we soon realized that we had significantly underestimated the technical difficulties of pre-training a model at such a scale (>100B). It seems that pre-training a highly accurate 100B-scale model is quite different from training a 10B-scale one. Due to frequent random hardware failures, model gradients exploding, unexpected excessive memory usage in the algorithm, debug for the 3D pipeline in the new Megatron and DeepSpeed frameworks, inability to recover from optimizer states, blocked TCP responses between processes, and many many unexpected “bugs”, the project was delayed for many times. The Tsinghua PACMAN team gave us a hand at this difficult time and together we successfully fixed most of the “bugs”.

我们第一次尝试训练模型是在 2022 年 1 月, 刚拿到一小笔用于试跑的 GPU 赞助不久. 但我们很快意识到, 自己严重低估了预训练这种规模 (>100B) 模型的技术难度. 预训练一个高精度的千亿级模型, 似乎和训练百亿级模型很不一样. 由于频繁的随机硬件故障, 模型梯度爆炸, 算法中意外的过量显存占用, 在新版 Megatron 和 DeepSpeed 框架里调试 3D 流水线, 无法从优化器状态恢复, 进程间 TCP 响应阻塞, 以及许许多多意外的 「bug」, 项目一再延期. 在这个困难时期, 清华 PACMAN 团队伸出援手, 我们一起成功修复了大部分 「bug」.

By March, we were still short on computational resources, but fortunately got a chance to try test runs on several other platforms, including Ascend 910, Hygon DCU, NVIDIA, and Sunway. The immediate challenge was for us to adapt our training code to these different platforms, as the underlying operators are quite different. Also, it introduced many new issues: the element-wise operators not supporting fast computation for large-dimension vectors, various issues that hindered convergence—the large gradient norms of input embeddings, native Post-LN, Pre-LN, and Sandwich-LN, dataloader state seeds, and computation precision choices in Softmax and Attention — as well as numerous mistakes we ourselves made. With tremendous help from all of our generous partners, we finally succeeded in making our pre-training algorithms runnable across all the platforms—frankly, a surprising achievement for this project. The timeline of GLM-130B in Figure 21 covers most of the issues we have encountered and addressed as of this writing.

到 3 月, 我们仍然缺算力, 但幸运地获得了在其他几个平台上试跑的机会, 包括昇腾 910, 海光 DCU, NVIDIA 和神威. 眼前的挑战是把训练代码适配到这些不同的平台上, 因为底层算子差别很大. 这也带来了许多新问题: 逐元素算子不支持大维度向量的快速计算, 以及各种妨碍收敛的问题, 包括输入嵌入的大梯度范数, 原生 Post-LN, Pre-LN 和 Sandwich-LN, dataloader 状态种子, Softmax 和 Attention 中的计算精度选择, 还有我们自己犯的无数错误. 在所有慷慨伙伴的大力帮助下, 我们最终让预训练算法在所有平台上都能跑起来, 坦白说, 这对本项目是个出人意料的成就. 图 21 中 GLM-130B 的时间线涵盖了截至本文写作时我们遇到并解决的大部分问题.

On April 26th, we received a generous computing sponsorship from Zhipu.AI — an AI startup that aims to teach machines to think like humans. After another week of testing, we finally kicked off the training of the GLM-130B model on its 96 A100 (40G \* 8) servers on May 6th. Additionally, Zhipu.AI also sent a team to help evaluate the pre-trained model and build a demonstration website.

4 月 26 日, 我们获得了智谱 AI 慷慨的算力赞助, 这是一家致力于教机器像人一样思考的 AI 创业公司. 又测试了一周后, 我们终于在 5 月 6 日用它的 96 台 A100 (40G × 8) 服务器启动了 GLM-130B 模型的训练. 此外, 智谱 AI 还派了一个团队帮忙评测预训练模型, 搭建演示网站.

The training period spanned two months, during which we began developing a toolkit to allow GLM-130B’s inference in low-resource setting with swapping technique and quantization. Though it is already the most accessible model of its scale, together with our partner from Tsinghua NLP, we have been exploring the limit of popularized hardware platforms, which would truly make the 100B-scale model accessible to as many people as possible. To date, we managed to reach the INT4 weight quantization for GLM-130B. Importantly, the INT4 version of GLM-130B without post training

(本段跨到下一页, 整段译文放在下一页.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">16<sub>This</sub> section is largely extracted and updated from the blog introduction of GLM-130B at [http://keg.cs.tsinghua.edu.cn/glm-130b/](http://keg.cs.tsinghua.edu.cn/glm-130b/) (Posted date: August 4, 2022).</span></small>

脚注 16: 本节主要摘自并更新自 GLM-130B 的博客介绍 (http://keg.cs.tsinghua.edu.cn/glm-130b/, 发布日期 2022 年 8 月 4 日).

<!-- page 54 of 56 -->

![Image block](images/p54-major-issues-encountered-for-training-glm-130b.png)

(图: 一个蓝色圆形标志, 里面是一只深蓝色的大象剪影. 这是时间线图顶部的装饰图标, 不含数据. MinerU 用紧跟其后的标题 「Major Issues Encountered for Training GLM-130B」 给它起了文件名.)

## Major Issues Encountered for Training GLM-130B 训练 GLM-130B 时遇到的主要问题

## O 2021.12 2021 年 12 月

标题里的 「O」 是时间线圆点被 MinerU 识别成的字母, 后面几个带 「O」 的标题同理.

• The “千亿 ” (100B) project towards an open dense pre-trained GLM at 100B scale is conceived

• Survey pre-training strategies of existing models of similar scale, such as GPT-3, Gopher => Limited public info about how they were trained and issues they met

• Search for possible GPU clusters & sponsors

2021 年 12 月:
- 构想面向千亿规模开放稠密 GLM 预训练的 「千亿」 (100B) 项目.
- 调研已有同规模模型 (如 GPT-3, Gopher) 的预训练策略 => 关于它们怎么训练, 遇到过什么问题, 公开信息很少.
- 寻找可能的 GPU 集群和赞助方.

## 2022.1 2022 年 1 月

• Test the performance of FP16/FP32 at 100B scale on one testing cluster

• Unexpected excessive memory usage in GLM => Torch is better with fixed length input sequences

• Inability to converge and try tricks from CogView and ViT => Use Sandwich-LN

• Frequent random hardware failures => Have to run HCPG test before each run

2022 年 1 月:
- 在一个测试集群上测试 FP16/FP32 在千亿规模上的性能.
- GLM 中出现意外的过量显存占用 => Torch 对固定长度的输入序列更友好.
- 无法收敛, 尝试 CogView 和 ViT 的技巧 => 使用 Sandwich-LN.
- 频繁的随机硬件故障 => 每次运行前都得跑 HCPG 测试.

## O 2022.2 2022 年 2 月

• Very slow training speed than previously calculated => Optimize kernels and fuse operators => Find the input shape is critical to kernel performance

• Collect pre-training corpora and tokenize => Use icetk: the sentence piece is set to the unigram mode

• Debug the 3D pipeline parallel in the newly-released Megatron and DeepSpeed

2022 年 2 月:
- 训练速度比之前估算的慢很多 => 优化 kernel, 融合算子 => 发现输入形状对 kernel 性能至关重要.
- 收集预训练语料并分词 => 使用 icetk: sentencepiece 设为 unigram 模式.
- 在新发布的 Megatron 和 DeepSpeed 中调试 3D 流水线并行.

## O 2022.3 2022 年 3 月

• It can’t recover perfectly from checkpoints => Our customized dataloader do not save its state seed properly in distributed training

• The memory per processor is too small => Require too many pipeline stages => Batch size is too large (up to 12,000) => Harm the model’s convergency

• It can’t launch more than 2,000 computing nodes => Overcome this and support 6,000-node training by tuning Linux kernel TCP parameters

• Collect data for multi-task instruction pre-training

• Receive opportunities to test trainings on several other clusters

• Very slow training speed than expected => The underlying element-wise operators don’t support fast computation on large-dimension vectors.

2022 年 3 月:
- 无法从 checkpoint 完美恢复 => 我们定制的 dataloader 在分布式训练中没有正确保存状态种子.
- 每个处理器的显存太小 => 需要太多流水线阶段 => batch size 太大 (高达 12000) => 损害模型收敛.
- 无法启动超过 2000 个计算节点 => 通过调整 Linux 内核 TCP 参数克服这一点, 支持 6000 节点训练.
- 收集多任务指令预训练的数据.
- 获得在其他几个集群上试训的机会.
- 训练速度比预期慢很多 => 底层逐元素算子不支持大维度向量的快速计算.

![Image block](images/p54-2022-4.png)

(图: 一个蓝色空心小圆点, 时间线上 2022.4 节点的标记, 不含文字和数据.)

## 2022.4 2022 年 4 月

• Optimize A100 kernel’s computing efficiency => A100 kernels prefer square-shaped inputs, and seq\_len=2,048 is optimal for our hidden-state dimension (12,288)

• Inability to converge due to large gradient norms (170+) of input embeddings => Try embedding norm and gradient shrink, which turn out to be almost equivalent

• Naïve post-LN or pre-LN disconverges after several thousands of steps => Try Sandwich-LN with PB-Relax

• It still disconverges after one week’s trial => The dataloader state seeds are not unified for different pipeline stages, resulting in a mismatch of input data and labels.

• Test two positional encodings: RoPE and Alibi => Alibi can be slower as it requires element-wise manipulation on attention matrices---changing num\_heads \*2,048 \* 2,048 scalars per layer

• Test GeGLU and GAU => GAU converges faster with relatively poor performance on fine-tuned SuperGLUE

• Abnormal GPU memory usage of newly-added functions and classes => DeepSpeed hardcodes the function names for checkpoint activation

• Decide to train GLM with 130 billion parameters => allow inference on a DGX-A100 40G node

2022 年 4 月:
- 优化 A100 kernel 的计算效率 => A100 kernel 偏好方形输入, 对我们的隐藏维度 (12288) 来说 seq_len=2048 最优.
- 输入嵌入的梯度范数过大 (170 以上) 导致无法收敛 => 尝试 embedding norm 和梯度收缩, 结果两者几乎等效.
- 朴素的 post-LN 或 pre-LN 在几千步后不收敛 => 尝试 Sandwich-LN 加 PB-Relax.
- 试了一周仍不收敛 => 不同流水线阶段的 dataloader 状态种子没有统一, 导致输入数据和标签错位.
- 测试两种位置编码 RoPE 和 Alibi => Alibi 可能更慢, 因为它要对注意力矩阵做逐元素操作, 每层要改 num_heads × 2048 × 2048 个标量.
- 测试 GeGLU 和 GAU => GAU 收敛更快, 但在微调后的 SuperGLUE 上表现相对较差.
- 新加的函数和类显存占用异常 => DeepSpeed 对激活 checkpoint 的函数名是硬编码的.
- 决定训练 1300 亿参数的 GLM => 可以在一个 DGX-A100 40G 节点上推理.

(这里 「embedding norm 和梯度收缩几乎等效」 一条, 和正文第 6 页说 BLOOM 的 embedding norm 会伤害零样本性能, 放在一起读时要注意: 前者说的是稳定训练的效果, 后者说的是对性能的影响.)

![Image block](images/p54-2022-5-6.png)

(图: 同样是一个蓝色空心小圆点, 标记 2022.5-6 节点.)

## 2022.5-6 2022 年 5 月至 6 月

• Implement a RoPE cuda operator in C++ => See unexpected precision errors and finally have it abandoned

• Sandwich-LN still disconverges => 1) Reducing learning rate does not help; 2) Using Hinge cross-entropy becomes slower and harms performance; 3) Shifting to DeepNorm still disconverges

• Use FP32 in softmax of attention => Success

• Find PB-Relax unnecessary for FP32 softmax => It also slows down training as it needs to manipulate the whole attention score matrices

• Experience few spikes in later training => 1) Reduce gradient shrink factor from 1 to 0.1: useful; 2) Reduce the learning rate: sometimes useful; 3) Jump the noisy data batches: sometimes useful

• Find a mistake in multi-task data after training for 20,000 steps => Use the correct data but it does not forget

2022 年 5 月至 6 月:
- 用 C++ 实现 RoPE 的 cuda 算子 => 出现意外的精度误差, 最终放弃.
- Sandwich-LN 仍然不收敛 => 1) 降低学习率没用; 2) 用 Hinge 交叉熵变慢且损害性能; 3) 换成 DeepNorm 仍然不收敛.
- 在注意力的 softmax 中使用 FP32 => 成功.
- 发现 FP32 softmax 下不需要 PB-Relax => 它还会拖慢训练, 因为要操作整个注意力分数矩阵.
- 训练后期遇到少数尖峰 => 1) 把梯度收缩因子从 1 降到 0.1: 有用; 2) 降低学习率: 有时有用; 3) 跳过有噪声的数据 batch: 有时有用.
- 训练 20000 步后发现多任务数据有误 => 改用正确的数据, 模型没有遗忘.

![Image block](images/p54-2022-6-7.png)

(图: 蓝色小圆点, 中间有一段竖线穿过, 标记 2022.6-7 节点.)

## 2022.6-7 2022 年 6 月至 7 月

• Adapt the pipeline parallel checkpoints to ordinary parallel checkpoints for efficient inference on a single A100

• Work on evaluation scripts on datasets: MMLU, Big-bench, CLUE, SuperCLUE, etc.

• Implement P-Tuning and P-Tuning v2 for parameter-efficient tuning on GLM-130B for tuning on SuperGLUE

• Work with BMInf on adapting GLM-130B to perform inference on a single V100 or 3090 => Use pipeline-style asynchronous swapping between main memory and GPU memory

• Try to fine-tune GLM-130B with fewer A100 nodes (i.e., 12-16 nodes) => Pipeline-style fails due to too many pipeline stages => Find that data parallel can not be introduced for fine-tuning => Use 32-way model parallel for fine-tuning with reasonable performance

2022 年 6 月至 7 月:
- 把流水线并行的 checkpoint 转成普通并行的 checkpoint, 以便在单台 A100 上高效推理.
- 编写 MMLU, Big-bench, CLUE, SuperCLUE 等数据集的评测脚本.
- 实现 P-Tuning 和 P-Tuning v2, 在 GLM-130B 上做参数高效微调, 用于 SuperGLUE.
- 与 BMInf 合作, 让 GLM-130B 能在单张 V100 或 3090 上推理 => 在主存和显存之间做流水线式的异步换入换出.
- 尝试用更少的 A100 节点 (即 12 到 16 个节点) 微调 GLM-130B => 流水线方式因流水线阶段太多而失败 => 发现微调时无法引入数据并行 => 用 32 路模型并行微调, 性能尚可.

Figure 21: The timeline of major issues that training GLM-130B encountered and addressed, as of July 31st, 2022.

图 21: 截至 2022 年 7 月 31 日, GLM-130B 训练中遇到并解决的主要问题时间线.

<!-- page 55 of 56 -->

faces negligible performance degradation compared to its uncompressed original, while it consumes only 25% of the GPU memory required by the uncompressed version, thus supporting its effective inference on 4 × RTX 3090 Ti (24G) or 8 × RTX 2080 Ti (11G). We will attempt to further reduce the resource requirements and keep the community updated on this important working item.

训练持续了两个月, 这期间我们开始开发一个工具包, 借助换入换出技术和量化, 让 GLM-130B 能在低资源环境下推理. 虽然它已经是同规模中最容易获得的模型, 我们仍和清华 NLP 的伙伴一起, 探索普及型硬件平台的极限, 好让千亿级模型真正为尽可能多的人所用. 迄今为止, 我们为 GLM-130B 做到了 INT4 权重量化. 重要的是, 不经后训练的 INT4 版 GLM-130B, 与未压缩的原版相比性能下降可以忽略, 而显存只需未压缩版本的 25%, 因此能在 4 × RTX 3090 Ti (24G) 或 8 × RTX 2080 Ti (11G) 上有效推理. 我们会继续尝试降低资源需求, 并就这项重要工作向社区通报进展.

## G BROADER IMPACT 更广泛的影响

This paper introduces an open bilingual pre-trained language model with 130 billion parameters. Currently most pre-trained language models with over 100 billion parameters are privately owned by governments and large corporations (Brown et al., 2020; Thoppilan et al., 2022; Rae et al., 2021; Chowdhery et al., 2022; Wang et al., 2021). A few of them (Brown et al., 2020; Lieber et al., 2021) provide limited inference APIs with fees. In contrast, the weights and code of GLM-130B are open to anyone who is interested in LLMs. Moreover, we significantly lower the hardware requirements for inference by speed-up implementation and INT4 quantization. The paper can have a broader impact on the research community, individual developers and small companies, and society.

本文介绍一个有 1300 亿参数的开放双语预训练语言模型. 目前大多数参数超过千亿的预训练语言模型为政府和大公司私有 (Brown et al., 2020; Thoppilan et al., 2022; Rae et al., 2021; Chowdhery et al., 2022; Wang et al., 2021). 其中少数 (Brown et al., 2020; Lieber et al., 2021) 提供收费的有限推理 API. 相比之下, GLM-130B 的权重和代码向所有对 LLM 感兴趣的人开放. 此外, 我们通过加速实现和 INT4 量化大幅降低了推理的硬件要求. 本文可能对研究社区, 个人开发者和小公司以及社会产生更广泛的影响.

## G.1 IMPACT ON AI RESEARCH 对 AI 研究的影响

Most research institutions cannot afford the substantial cost of pretraining large language models. As a result, most researchers, except employees of governments and large corporations, only have access to the limited inference APIs with fees. With the inference APIs, researchers can only analyze the outputs of models as black boxes, which limits the scope of potential work. With GLM-130B, researchers can analyze the model parameters and internal states corresponding to specific inputs, leading to in-depth studies of LLMs’ theory, capacity, and flaws. Researchers can also modify the model architecture and weights, to validate the proposed algorithms to improve LLMs Zhu et al. (2020); Cao et al. (2021); Hase et al. (2021); Mitchell et al. (2022).

大多数研究机构负担不起预训练大语言模型的高昂成本. 因此, 除了政府和大公司的员工, 大多数研究者只能使用收费的有限推理 API. 借助推理 API, 研究者只能把模型当黑盒分析输出, 这限制了潜在工作的范围. 有了 GLM-130B, 研究者可以分析模型参数和特定输入对应的内部状态, 从而深入研究 LLM 的理论, 能力和缺陷. 研究者还可以修改模型架构和权重, 验证为改进 LLM 而提出的算法 Zhu et al. (2020); Cao et al. (2021); Hase et al. (2021); Mitchell et al. (2022).

With INT4 quantization, GLM-130B can perform inference on popularized GPUs such as 4 × RTX 3090 or 8 × RTX 2080 Ti, which can be easily accessed from cloud service. As a result, researchers who cannot afford powerful data-center GPU servers like DGX-A100 can also utilize GLM-130B.

借助 INT4 量化, GLM-130B 能在 4 × RTX 3090 或 8 × RTX 2080 Ti 这样的普及型 GPU 上推理, 这些 GPU 很容易从云服务获得. 因此, 买不起 DGX-A100 这类强大数据中心 GPU 服务器的研究者, 也能使用 GLM-130B.

## G.2 IMPACT ON INDIVIDUAL DEVELOPERS AND SMALL COMPANIES 对个人开发者和小公司的影响

Currently, individual developers and small companies who want to integrate LLMs into their business can only choose paid inference APIs. The increased cost can hinder their attempts. Instead, GLM-130B can be deployed on popularized hardware that they own or can access via cloud service to reduce the cost. Furthermore, they can utilize distillation techniques Sanh et al. (2019); Jiao et al. (2020) to obtain smaller models that preserve comparable performance on their specific tasks. While some developers may lack the ability to complete deployment and distillation on their own, we believe with GLM-130B and more open LLMs in the future, the corresponding toolkits and service providers will become more available.

目前, 想把 LLM 集成进业务的个人开发者和小公司只能选择付费推理 API. 增加的成本可能阻碍他们的尝试. 而 GLM-130B 可以部署在他们自有或可通过云服务获得的普及型硬件上, 降低成本. 此外, 他们可以用蒸馏技术 Sanh et al. (2019); Jiao et al. (2020) 得到更小的模型, 在他们的特定任务上保持相当的性能. 虽然有些开发者可能没有能力独立完成部署和蒸馏, 但我们相信, 随着 GLM-130B 和未来更多开放 LLM 的出现, 相应的工具包和服务商会越来越多.

We also note that currently most applications of LLMs are based on prompt engineering, partly due to the limitation of inference APIs. In downstream scenarios such as online customer service, the companies accumulate huge amounts of human-generated data that contain domain knowledge. With the open-source weights and code, developers can finetune GLM-130B on their own data to mitigate the gap of domain knowledge.

我们还注意到, 目前 LLM 的大多数应用基于提示工程, 部分原因是推理 API 的限制. 在在线客服这类下游场景中, 公司积累了大量包含领域知识的人工生成数据. 有了开源的权重和代码, 开发者可以在自己的数据上微调 GLM-130B, 以弥补领域知识的差距.

## G.3 SOCIAL IMPACT 社会影响

Large language models, together with other machine learning models in different modalities (e.g., Image (Ramesh et al., 2021; Ding et al., 2021; Saharia et al.) and Video (Hong et al., 2022)), could be used to generate synthetic text for harmful applications, such as telemarketing fraud, political propaganda, and personal harassment as is discussed in (Weidinger et al., 2021; Sheng et al., 2021; Dev et al., 2021). We do not anticipate any hazardous outputs, especially towards vulnerable and historically disadvantaged groups of people, after using the model.

大语言模型, 连同其他模态的机器学习模型 (例如图像 (Ramesh et al., 2021; Ding et al., 2021; Saharia et al.) 和视频 (Hong et al., 2022)), 可能被用来生成合成文本用于有害用途, 例如电信诈骗, 政治宣传和人身骚扰, (Weidinger et al., 2021; Sheng et al., 2021; Dev et al., 2021) 对此有讨论. 我们预计使用该模型不会产生危险输出, 尤其不会针对弱势群体和历史上处于不利地位的群体.

While some people think that restricting access to LLMs can prevent such harmful applications, we argue that promoting LLM inclusivity can lead to better defense against potential harm caused by

(本段跨到下一页, 整段译文放在下一页.)

<!-- page 56 of 56 -->

LLMs. Currently, only governments and large corporations can afford the considerable costs of pre-training LLMs. There is no guarantee that organizations having the substantial financial resources to pretrain an LLM will not do harm with it. Without access to such LLMs, individuals cannot even realize the role of LLMs in harm. Conversely, releasing an open LLM can provide access and transparency to all the researchers and promote the research to reduce the potential harm of LLMs, like algorithms to identify the synthetic text Gehrmann et al. (2019) or detect fake news Li et al. (2021).

有人认为限制对 LLM 的访问可以防止这类有害应用, 我们则认为, 提升 LLM 的包容性能更好地防御 LLM 可能造成的危害. 目前只有政府和大公司负担得起预训练 LLM 的可观成本. 没有任何保证说有足够财力预训练 LLM 的机构不会用它作恶. 接触不到这样的 LLM, 个人连 LLM 在危害中扮演什么角色都意识不到. 反过来, 发布开放的 LLM, 能让所有研究者接触和了解它, 推动减少 LLM 潜在危害的研究, 例如识别合成文本的算法 Gehrmann et al. (2019), 或检测假新闻的算法 Li et al. (2021).

Also, it is known that LLMs can suffer from problems in fairness, bias, privacy, and truthfulness Zhang et al. (2021); Lin et al. (2022); Liang et al. (2021); Bender et al. (2021). An open LLM can reveal the model parameters and internal states corresponding to specific inputs instead of providing APIs to black-box models. In conclusion, researchers can conduct analysis of LLMs flaws in depth and propose improved algorithms to solve the problems.

此外, 已知 LLM 可能存在公平性, 偏见, 隐私和真实性方面的问题 Zhang et al. (2021); Lin et al. (2022); Liang et al. (2021); Bender et al. (2021). 开放的 LLM 可以展示模型参数以及特定输入对应的内部状态, 而不是只提供黑盒模型的 API. 总之, 研究者可以深入分析 LLM 的缺陷, 并提出改进算法来解决这些问题.

## H ENVIRONMENTAL IMPACT 环境影响

One of the major concerns about large language models is their huge energy usage and associated carbon emissions Strubell et al. (2019); Lacoste et al. (2019); Patterson et al. (2021); Bender et al. (2021). GPT-3 was estimated to use 500 tons of carbon emissions footprint (CO2eq) Patterson et al. (2021). We consumed a total of 442.4MWh of electricity over the 60-day course of training. Given the 0.5810 kg/kWh carbon efficiency of local power grid, the pre-training released 257.01 metric tons of $\mathrm { C O _ { 2 } } .$ This is around half of GPT-3’s carbon footprint, probably due to the efficient parallel strategies and NVIDIA’s hardware improvements. The carbon emission is roughly the equivalent of the yearly emissions of 18 average Americans. However, we believe that with GLM-130B released, more carbon emissions for reproducing 100B-scale LLMs can be saved.

人们对大语言模型的主要担忧之一, 是它们巨大的能耗和随之而来的碳排放 Strubell et al. (2019); Lacoste et al. (2019); Patterson et al. (2021); Bender et al. (2021). 据估计, GPT-3 的碳排放足迹为 500 吨 (CO2 当量) Patterson et al. (2021). 在 60 天的训练过程中, 我们总共消耗了 442.4 兆瓦时的电. 按当地电网 0.5810 kg/kWh 的碳效率计算, 预训练排放了 257.01 吨 CO2. 这大约是 GPT-3 碳足迹的一半, 可能要归功于高效的并行策略和 NVIDIA 的硬件改进. 这些碳排放大致相当于 18 个普通美国人一年的排放量. 不过我们相信, 随着 GLM-130B 的发布, 可以省下更多复现千亿级 LLM 的碳排放. (按文中两个数相乘, 442.4 × 0.5810 = 257.03 吨, 和 257.01 差 0.02 吨, 在四舍五入范围内.)
