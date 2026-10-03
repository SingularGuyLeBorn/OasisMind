源文: arXiv:2601.08584v1, Ministral 3, Mistral AI, 2026 年 1 月 13 日, 14 页, 6 张图. 英文段在前, 中文意译紧跟. Abstract, Introduction, Conclusion, References 的节名不译, References (第 12 至 14 页) 正文不译. 单独的页码行已删去, 第 2 页到第 3 页断开的半句已接回. 页首的 「MistralAl」 是转 Markdown 时把标志字样识别错了, PDF 文字层没有这一行, 这里按标志记作 Mistral AI. 算法 1 的标题 「Algorithm 1 Cascade Distillation.」 在 Markdown 里丢了, 按 PDF 文字层补回. 公式 $W_2(\mathrm{SiLU}(W_1 x) * W_3 x)$ 按 PDF 文字层校正.

<!-- page 1 of 14 -->

arXiv:2601.08584v1 [cs.CL] 13 Jan 2026

arXiv 编号 2601.08584v1, 分类 cs.CL, 日期 2026 年 1 月 13 日.

# Ministral 3

**Mistral AI**

作者署名: Mistral AI (页首标志).

## Abstract

We introduce the Ministral 3 series, a family of parameter-efficient dense language models designed for compute and memory constrained applications, available in three model sizes: 3B, 8B, and 14B parameters. For each model size, we release three variants: a pretrained base model for general-purpose use, an instruction finetuned, and a reasoning model for complex problem-solving. In addition, we present our recipe to derive the Ministral 3 models through Cascade Distillation, an iterative pruning and continued training with distillation technique. Each model comes with image understanding capabilities, all under the Apache 2.0 license.

本文介绍 Ministral 3 系列. 这是一组参数效率高的稠密语言模型, 面向算力和内存都受限的应用, 有 3B, 8B, 14B 三个尺寸. 每个尺寸发布三个变体: 通用的预训练基座模型, 指令微调模型, 以及用来解复杂问题的推理模型. 我们还给出得到 Ministral 3 的配方: Cascade Distillation (级联蒸馏), 一种迭代地剪枝, 再用蒸馏继续训练的技术. 每个模型都能理解图像, 全部采用 Apache 2.0 许可.

> **想:** 摘要说有 3B, 8B, 14B 三个尺寸, 每个尺寸页面到底印了哪些规格, 410M 的视觉编码器算不算在名字里?
> 规格只在第 2 页表 1: 14B 是 40 层, 潜变量维度 5120, FFN 16384; 8B 是 34 层, 4096, 14336; 3B 是 26 层, 3072, 9216; 三档都是 32/8 头, 词表 131K. 名字里的数含不含视觉编码器, 页面没说; 只算语言部分约 14.0B, 8.5B, 3.2B (假设每头维度 = 潜变量维度 / 32), 视觉编码器三档各 410M 另算. 激活参数: 三档本页都未印.

**Webpage:** [https://mistral.ai/news/mistral-3](https://mistral.ai/news/mistral-3)

**Models:** [https://huggingface.co/collections/mistralai/ministral-3](https://huggingface.co/collections/mistralai/ministral-3)

网页: https://mistral.ai/news/mistral-3. 模型: https://huggingface.co/collections/mistralai/ministral-3.

## 1 Introduction

In this work, we introduce Ministral 3, a family of dense models trained in a compute- and data-efficient manner through iterative shrinking and distillation from a parent pretrained model. Unlike popular pretrained models such as Qwen3 [Yang et al., 2025] or Llama3 [Dubey et al., 2024] that are trained on 36 trillion and 15 trillion tokens respectively, we are able to produce competitive models trained for between 1 and 3 trillion tokens by leveraging Mistral Small 3.1, a strong 24B-parameter parent model.

本文介绍 Ministral 3, 一组稠密模型. 它们从一个预训练好的父模型出发, 反复缩小再蒸馏, 训练时省算力也省数据. 流行的预训练模型如 Qwen3 [Yang et al., 2025] 和 Llama3 [Dubey et al., 2024] 分别训了 36 万亿和 15 万亿 token; 我们借助 24B 参数的强父模型 Mistral Small 3.1, 只训 1 到 3 万亿 token 就得到了有竞争力的模型.

> **问:** 「between 1 and 3 trillion tokens」 是哪个尺寸训了多少?
> 本页没分尺寸. 第 3 页说级联蒸馏 「goes through the data mix in a single run」, 图 2 横轴把一次训练切成三段: 14B 占 0 到 0.3, 8B 占 0.3 到 0.6, 3B 占 0.6 到 1.0 (读图). 如果横轴按 token 算, 3B 自己这一段反而最长. 1T 和 3T 各对应哪个尺寸, 含不含长上下文阶段, 页面都没写.

Available in three sizes: 3B, 8B, and 14B parameters, all Ministral 3 models are descendants of Mistral Small 3.1<sup>1</sup>, obtained via a Cascade Distillation approach. We present three variants for each model size: base, instruct, and reasoning, each with image understanding capabilities and context lengths up to 256k tokens (128k for reasoning models).

Ministral 3 有 3B, 8B, 14B 三个尺寸, 都是 Mistral Small 3.1<sup>1</sup> 的后代, 用级联蒸馏得到. 每个尺寸有三个变体: base, instruct, reasoning, 都能理解图像, 上下文最长 256k token (推理模型为 128k).

A key component of Ministral 3 is our Cascade Distillation training strategy, an iterative pruning and distillation method, which progressively transfers pretrained knowledge from a large parent model down to a family of compact children models. Our recipe allows us to achieve performance that is competitive with models which had a much larger training budget. For example, the Ministral 3 14B Base model closely matches Mistral Small 3.1 Base, while being more than 40% smaller and trained on a much shorter horizon.

Ministral 3 的关键是级联蒸馏这套训练策略. 它迭代地剪枝和蒸馏, 把预训练知识从大父模型一步步传给一组紧凑的子模型. 用这套配方, 我们的模型能和训练预算大得多的模型相比. 例如 Ministral 3 14B Base 与 Mistral Small 3.1 Base 相当接近, 体积却小了 40% 以上, 训练周期也短得多.

> **核对:** 14B Base 比 Mistral Small 3.1 「more than 40% smaller」, 对得上吗?
> 按名字算, 14/24 约 58.3%, 小约 41.7%, 对得上. 用表 1 估出的约 14.0B 算, 小约 41.5%. 24B 父模型含不含视觉编码器, 页面同样没说, 所以这个比例只是名字对名字.

After post-training, we achieve competitive results with similarly sized open weight models such as Gemma 3 [Kamath et al., 2025], Qwen 3 [Yang et al., 2025, Bai et al., 2025], and Mistral Small 3.2 2506.

后训练之后, 我们的模型和同尺寸的开放权重模型相比有竞争力, 如 Gemma 3 [Kamath et al., 2025], Qwen 3 [Yang et al., 2025, Bai et al., 2025] 和 Mistral Small 3.2 2506.

<sup>1</sup> [https://mistral.ai/news/mistral-small-3-1](https://mistral.ai/news/mistral-small-3-1)

脚注 1: Mistral Small 3.1 的发布页.

<!-- page 2 of 14 -->

![图 1 训练配方总览: 左栏 §3.1 Pretraining, 顶部橙色框 Mistral Small 3.1, 灰色虚线 (Pruning) 引出 14B Init., 灰色实线 (Distilled Training) 到 14B Short Ctx., 再到 Ministral 3 14B Base; 14B Short Ctx. 再经虚线剪出 8B Init., 8B Short Ctx. 剪出 3B Init., 每档同样两步到 Base; 红色点划线 (Distillation teacher) 从 Mistral Small 3.1 指向每个 Short Ctx. 和 Base. 右上栏 §3.2 Post-Training Instruction-following: 14B Base 经 SFT, ODPO 到 14B Instruct; 右下栏 §3.3 Post-Training Reasoning: 14B Base 经 SFT (w/ CoT), GRPO, ODPO 到 14B Reasoning; 后训练的框都画成三层叠放](images/p02-figure-1-overview-of-ministral-3-training-recipe.png)

Figure 1: Overview of Ministral 3 training recipe. Pretraining: We start from pruning the parent model, Mistral Small 3.1, into the largest child model (14B Init.). Next, we continue pretraining the child model with logit distillation from the parent model as the teacher to obtain the up-trained short context child model (14B Short Ctx.). From 14B Short Ctx., we perform another round of distillation with longer context window (see §3.1 for details) to obtain the final Ministral 3 14B Base model. In parallel, 14B Short Ctx. is pruned to initialize the next child model (8B Init.), from which we repeat the process to derive Ministral 3 8B Base model. We repeat the same process for the 3B version. Post-training: Each Base model is then post-trained into the instruction-following and reasoning variants. For instruction-following, our post-training recipe includes supervised fine-tuning (SFT) and Online Direct Preference Optimization (ODPO). For reasoning, the process involved supervised fine-tuning with chain-of-thought data (SFT w/ CoT), Group Relative Policy Optimization (GRPO; Shao et al. [2024]), and ODPO.

图 1: Ministral 3 训练配方总览. 预训练: 先把父模型 Mistral Small 3.1 剪成最大的子模型 (14B Init.). 然后以父模型为 teacher 做 logit 蒸馏, 继续预训练这个子模型, 得到训练过的短上下文子模型 (14B Short Ctx.). 从 14B Short Ctx. 出发, 用更长的上下文窗口再蒸馏一轮 (细节见 §3.1), 得到最终的 Ministral 3 14B Base. 与此同时, 14B Short Ctx. 被剪枝, 用来初始化下一个子模型 (8B Init.), 从它开始重复上述过程, 得到 Ministral 3 8B Base. 3B 版本也按同样过程得到. 后训练: 每个 Base 模型再分别后训练成指令遵循版和推理版. 指令遵循版的后训练包括 SFT 和在线直接偏好优化 (ODPO). 推理版依次做带 CoT 数据的 SFT (SFT w/ CoT), 组相对策略优化 (GRPO; Shao et al. [2024]) 和 ODPO.

> **看表:** 图 1 后训练两栏只画 14B, 8B 和 3B 走的是同一套吗?
> 后训练的框画成三层叠放, 意思是三个尺寸同一流程. 但第 6 页写着 3B 推理版的 SFT 改用 Magistral Small 1.2 做 logit 蒸馏, 图 1 的 「SFT (w/ CoT)」 箭头没有标出这个差别; 后训练 SFT 用哪个 teacher, 图里也没画.

The main contributions can be summarized as follows:

主要贡献可以归纳为以下几点:

- We introduce Ministral 3, a family of 9 dense language models - a pretrained, an instruction finetuned, and a reasoning model, each at the 14B, 8B, and 3B parameter scales. All Ministral 3 models (3 sizes × 3 variants) are open-weight under the Apache 2.0 license.
- We present a compute-efficient pretraining recipe, Cascade Distillation, with which these models have been pretrained at a fraction of the cost it would take to pretrain from scratch.
- We independently confirm findings from prior work that (a) there exists a "capacity gap" where a stronger teacher does not yield a stronger student model for pretraining, but post-training continues to benefit from a stronger teachers (b) distilling from a post-trained as opposed to a pretrained teacher when pretraining the student model results in better benchmark scores (c) distilling from a human preference optimized teacher is better than one that has only been post-trained with SFT.

- 推出 Ministral 3, 共 9 个稠密语言模型: 14B, 8B, 3B 三个规模各有一个预训练模型, 一个指令微调模型, 一个推理模型. 全部 9 个模型 (3 个尺寸 × 3 个变体) 以 Apache 2.0 许可开放权重.
- 给出一套省算力的预训练配方, 即级联蒸馏. 用它预训练这些模型, 成本只是从零预训练的一小部分.
- 独立验证了前人工作的几个发现: (a) 存在 「容量差距」, 预训练时更强的 teacher 并不能带出更强的学生, 但后训练仍能从更强的 teacher 获益; (b) 预训练学生时, 用后训练过的 teacher 蒸馏, 比用只做过预训练的 teacher 基准分更高; (c) 用做过人类偏好优化的 teacher 蒸馏, 比用只做过 SFT 的 teacher 更好.

> **拆开:** 贡献第三条列了 (a)(b)(c) 三个发现, 各自在正文哪里有证据?
> (a) 前半句对应第 8 页图 3, 只做了 14B 一个尺寸; 后半句 「post-training 仍受益于更强 teacher」 只有第 9 页一句话, 没有图表. (b) 对应第 9 页图 4, 只做了 3B. (c) 只有第 9 页一段文字, 没有数. 三条的证据要么只有一个尺寸, 要么没有数据.

## 2 Model Architecture (模型架构)

Table 1: Architectural specifications and hyperparameters for the Ministral 3 family. All models use a vocabulary size of 131K tokens.

表 1: Ministral 3 家族的架构规格和超参数. 所有模型的词表大小都是 131K token.

|  | Layers | Latent dim. | Q/KV heads | FFN dim. | Tied Embeddings | Context Length |
| --- | --- | --- | --- | --- | --- | --- |
| Ministral 3 14B | 40 | 5120 | 32 / 8 | 16384 | ✗ | 256k |
| Ministral 3 8B | 34 | 4096 | 32 / 8 | 14336 | ✗ | 256k |
| Ministral 3 3B | 26 | 3072 | 32 / 8 | 9216 | ✓ | 256k |

表头依次是: 层数, 潜变量维度, Q/KV 头数, FFN 维度, 输入输出嵌入是否共享, 上下文长度.

> **确认:** 表 1 三档都是 32 个 query 头, 8 个 KV 头, 每个头多宽?
> 本页未印每头维度. 如果等于潜变量维度除以 32, 三档分别是 160, 128, 96. 但第 4 页的剪枝只有层剪枝, 隐藏维度剪枝, FFN 剪枝三种, 没有剪注意力头或头宽, 头数三档也完全一样, 注意力内部宽度也可能是从父模型原样继承的. 两种情况下参数估算会差出几亿, 本页给不出答案.

The Ministral 3 family is based on the decoder-only transformer architecture [Vaswani et al., 2017]. All models share a common architectural foundation with size-specific scaling. As shown in Table 1, the family consists of three sizes: 3B, 8B, and 14B parameters, with 26, 34, and 40 layers respectively.

Ministral 3 家族基于 decoder-only 的 transformer 架构 [Vaswani et al., 2017]. 所有模型共用同一套架构底子, 只按尺寸调整规格. 如表 1 所示, 家族有 3B, 8B, 14B 三个尺寸, 层数分别是 26, 34, 40.

<!-- page 3 of 14 -->

Other architectural choices include Grouped Query Attention [Ainslie et al., 2023] with 32 query heads and 8 key-value heads, RoPE [Su et al., 2021] positional embeddings, SwiGLU activation [Shazeer, 2020], and RMSNorm [Zhang and Sennrich, 2019]. For long-context extension, we use YaRN [Peng et al., 2023] and position-based softmax temperature scaling in the attention layer [Nakanishi, 2025, MetaAI, 2025]. The 3B model uses tied input-output embeddings to avoid embedding parameters dominating the overall parameter count. All models use a vocabulary of 131K tokens and support context lengths up to 256K tokens.

其余架构选择包括: GQA [Ainslie et al., 2023], 32 个 query 头, 8 个 key-value 头; RoPE [Su et al., 2021] 位置编码; SwiGLU 激活 [Shazeer, 2020]; RMSNorm [Zhang and Sennrich, 2019]. 扩展长上下文时, 我们用 YaRN [Peng et al., 2023], 并在注意力层里按位置调节 softmax 温度 [Nakanishi, 2025, MetaAI, 2025]. 3B 模型的输入和输出嵌入共享权重, 免得嵌入参数在总参数里占大头. 所有模型的词表都是 131K token, 上下文最长支持 256K token.

> **回看:** 表 1 三档上下文都写 256k, 和别处说法一致吗?
> 不一致. 第 1 页引言写 「up to 256k tokens (128k for reasoning models)」, 第 11 页结论又写 「All models ... handle contexts up to 256K tokens」. 表 1 只分尺寸, 不分 base, instruct, reasoning, 推理版到底是 128k 还是 256k, 本页前后两说.

> **停一下:** 3B 共享输入输出嵌入, 理由是 「avoid embedding parameters dominating」, 嵌入到底占多少?
> 按 131K 取 131,072 算: 3B 的嵌入矩阵 131,072 × 3072 约 0.40B, 占约 3.2B 的 12.5% 左右; 如果不共享, 两份约 0.81B, 占比会到 22% 左右. 14B 不共享, 两份 131,072 × 5120 约 1.34B, 约占 9.6%; 8B 两份约 1.07B, 约占 12.6%. 「dominating」 说得重了些, 但 3B 共享确实省掉约 0.4B.

**Vision encoder.** All Ministral 3 models use a 410M parameter ViT as a vision encoder for image understanding that is copied from Mistral Small 3.1 Base and kept frozen, with the same architecture described in Pixtral [Agrawal et al., 2024]. We discard the pretrained projection layer from the ViT to language model's space and train a new projection for every model.

**视觉编码器.** 所有 Ministral 3 模型都用一个 410M 参数的 ViT 做视觉编码器来理解图像. 它从 Mistral Small 3.1 Base 原样拷来, 保持冻结, 架构与 Pixtral [Agrawal et al., 2024] 所述相同. 从 ViT 到语言模型空间的那层预训练投影被丢掉, 每个模型各自新训一个投影层.

> **再看:** 视觉编码器 「kept frozen」, 是全程冻结吗?
> 页面写了两处: 这里的预训练冻结, 第 5 页指令 SFT 写 「the vision encoder remains frozen while the adapter is trainable」. ODPO, 推理版的 SFT, GRPO 阶段本页没再提. 每个尺寸新训的投影层多大, 什么结构, 本页未印.

## 3 Training Recipe (训练配方)

Figure 1 illustrates the training pipeline of the Ministral 3 models, consisting of a pretraining followed by two distinct post-training phases to produce instruction finetuned and reasoning variants.

图 1 画出了 Ministral 3 的训练流程: 先预训练, 再分两条不同的后训练路线, 分别产出指令微调版和推理版.

### 3.1 Pretraining (预训练)

**Algorithm 1** Cascade Distillation.

**算法 1** 级联蒸馏.

```python
model = MS3 # Mistral Small 3.1
for model_size in [14B, 8B, 3B]:
    # pruning (see Algo. 2)
    model = prune(model, model_size)

    # short context distillation
    model = model.train(
        data=short_data,
        teacher_model=MS3,
    )

    # long context distillation
    final_model = model.train(
        data=long_data,
        teacher_model=MS3,
    )
    yield (model_size, final_model)
```

代码大意: 从 Mistral Small 3.1 (MS3) 出发, 依次对 14B, 8B, 3B 三个目标尺寸: 先剪枝 (见算法 2), 再以 MS3 为 teacher 用短上下文数据蒸馏, 然后以 MS3 为 teacher 用长上下文数据蒸馏, 产出该尺寸的最终模型. 下一轮剪枝接的是短上下文蒸馏后的 model, 不是 final_model.

![图 2 级联蒸馏示意: 纵轴 CE Loss (EMA), 对数刻度约 1 到 10; 横轴 Training Completion 从 0 到 1. 橙红线 14B Short-Ctx 从约 4.5 降到约 1.1; 在 0.3 处竖虚线标 Prune, 浅橙线 8B Short-Ctx 从约 7 降到约 1.3; 在 0.6 处再标 Prune, 淡黄线 3B Short-Ctx 从 10 以上降到约 1.55; 底部黑色点线 Teacher Model Loss 约 1.07](images/p03-figure-2-illustration-of-cascade-distillation.png)

Figure 2: Illustration of Cascade Distillation.

图 2: 级联蒸馏示意.

> **对一下:** 图 2 读得出什么?
> 纵轴是 CE loss (EMA), 对数刻度. 14B 从约 4.5 降到约 1.1; 0.3 处剪枝后 8B 跳到约 7, 再降到约 1.3; 0.6 处剪枝后 3B 跳到 10 以上, 最后约 1.55; teacher 虚线在约 1.07 (都是读图). 图里只有短上下文阶段, 长上下文阶段不在图上. 3B 分到 0.4 的进度, 另外两档各 0.3, 页面没解释为什么这样分.

**Cascade Distillation.** Pretraining of the Ministral 3 models starts from the Mistral Small 3.1 Base (MS3.1) model. We use Cascade Distillation, an iterative approach to prune and distill MS3.1 into the smaller successors. Cascade Distillation is a compute-efficient process for pretraining children models of decreasing target sizes, given a pre-trained larger parent model. As summarized in Algorithm 1, it relies on an iterative "prune-distill-repeat" approach:

**级联蒸馏.** Ministral 3 的预训练从 Mistral Small 3.1 Base (MS3.1) 开始. 我们用级联蒸馏把 MS3.1 迭代地剪枝, 蒸馏成更小的后继模型. 给定一个预训练好的大父模型, 级联蒸馏能省算力地预训练出一串目标尺寸递减的子模型. 如算法 1 所示, 它靠的是迭代的 「剪枝, 蒸馏, 重复」:

1. Prune: initialize the weights of a child model via pruning a larger pre-trained model.
2. Distill: up-train the freshly pruned model via distillation from the teacher model's logits.
3. Repeat: apply this strategy repeatedly to shrink the child model into something even smaller.

1. 剪枝: 剪一个更大的预训练模型, 用来初始化子模型的权重.
2. 蒸馏: 用 teacher 模型的 logits 蒸馏, 把刚剪完的模型训回来.
3. 重复: 反复使用这一策略, 把子模型缩得更小.

Model pruning at each stage follows a similar approach to Minitron and Wanda [Sun et al., 2023, Sreenivas et al., 2024, Muralidharan et al., 2024] with the distillation teacher being Mistral Small 3.1 for all variants. Details of pruning and distillation are provided in the following paragraphs.

每一阶段的剪枝做法与 Minitron 和 Wanda [Sun et al., 2023, Sreenivas et al., 2024, Muralidharan et al., 2024] 类似, 所有变体的蒸馏 teacher 都是 Mistral Small 3.1. 剪枝和蒸馏的细节见下面几段.

Compared to training each small model from scratch, Cascade Distillation produces a model that is significantly more FLOP efficient. It is also worth noting that the end-to-end process can be viewed as a form of continual pretraining of the parent model with weight pruning. As illustrated in Figure 2, data repetition is avoided throughout the process as Cascade Distillation goes through the data mix in a single run with pruning en route.

和每个小模型都从零训练相比, 级联蒸馏在 FLOP 上高效得多. 还要指出, 整个端到端过程可以看作父模型带权重剪枝的持续预训练. 如图 2 所示, 级联蒸馏一次跑完整份数据配比, 途中顺手剪枝, 全程没有重复使用数据.

> **想:** 「data repetition is avoided」, 那 3B 见过 14B 阶段的数据吗?
> 按图 2 的画法, 三个尺寸依次吃同一份数据的不同段, 3B 自己只训后 40% (读图), 前 60% 的数据只能通过继承的权重间接传下来. 每段的数据配比, 三段是否同分布, 页面都没给.

<!-- page 4 of 14 -->

**Pruning.** Similar to Minitron, our pruning strategies are designed to preserve the most critical components of the original model (over a validation dataset) while reducing its size. We employ following key pruning techniques:

**剪枝.** 与 Minitron 类似, 我们的剪枝策略是在缩小模型的同时, 保住原模型最关键的部件 (在一个验证集上衡量). 主要用了以下几种剪枝技术:

- **Layer Pruning:** Unlike Sreenivas et al. [2024], which relies on counterfactual downstream perplexities from removing individual layers, we find that the ratio of input to output activation norms provides a simpler yet strong proxy for layer importance.
- **Hidden Dimension Pruning:** Apply Principal Component Analysis (PCA) to concatenated activations from attention normalization and feed-forward normalization layers across all layers. This yields a single rotation matrix consistent across the entire network that projects the model to a lower-dimensional space while maximizing explained variance.
- **Feedforward Dimension Pruning:** For MLPs with gated-linear activation functions such as SwiGLU [Shazeer, 2020], expressed as $W_2(\mathrm{SiLU}(W_1 x) * W_3 x)$ given a very large batch x, we prune dimension of the matrices $W_1, W_2, W_3$. To determine the columns of $W_1, W_3$ to keep, we compute the importance score defined as the averaged absolute value of each dim of the expression above. We then keep only the corresponding rows of $W_2$ with the indices yielded above.

- **层剪枝:** Sreenivas et al. [2024] 靠逐层删掉后下游 perplexity 的反事实变化来判断层的重要性. 我们发现, 用输入与输出激活范数之比做层重要性的代理指标, 更简单, 效果也强.
- **隐藏维度剪枝:** 把所有层的注意力归一化和前馈归一化层的激活拼起来做主成分分析 (PCA). 这样得到一个全网统一的旋转矩阵, 把模型投到低维空间, 同时让解释方差最大.
- **FFN 维度剪枝:** 对 SwiGLU [Shazeer, 2020] 这类带门控线性激活的 MLP, 写成 $W_2(\mathrm{SiLU}(W_1 x) * W_3 x)$, 取一个很大的 batch x, 剪 $W_1, W_2, W_3$ 这几个矩阵的维度. 为决定 $W_1, W_3$ 保留哪些列, 我们对上式每一维取绝对值的平均, 作为重要度分数. 然后 $W_2$ 只保留相同下标的行.

> **问:** 层重要度到底是 「输入比输出」 还是 「输出比输入」?
> 正文写 「the ratio of input to output activation norms」, 算法 2 的代码却是 `(output_norm / input_norm).mean()`, 方向相反. 代码接着用 topk 保留得分最高的层, 按代码理解是保留输出范数相对输入放大最多的层. 以哪个为准, 页面没说.

Algorithm 2 provides more detail on our pruning strategy:

算法 2 给出了剪枝策略的更多细节:

**Algorithm 2** Pruning stage of Cascade Distillation. It takes as input a pre-trained model and target size configuration to prune to. We use input_x and output_x to refer to activations from a large calibration batch.

**算法 2** 级联蒸馏的剪枝阶段. 输入是一个预训练模型和要剪到的目标尺寸配置. input_x 和 output_x 指一个大校准 batch 上的激活.

```python
def prune(model, target_size):
    target_n_layers, target_dim, target_ffn_dim = get_config(target_size)
    # layer pruning
    scores = []
    for layer in model.layers:
        input_norm = layer.input_x.norm(dim=-1)
        output_norm = layer.output_x.norm(dim=-1)
        scores.append(
            (output_norm / input_norm).mean()
        )

    layers_to_keep = topk(scores, k=target_n_layers)
    model = remove_layers(model, layers_to_keep)

    # hidden dimension pruning
    norm_inputs = []
    for layer in model.layers:
        norm_inputs.extend([
            layer.attn_norm.input_x,
            layer.ffn_norm.input_x,
        ])

    rotation = PCA(norm_inputs, n_components=n_dims)
    model = apply_rotation(model, rotation, target_dim)

    # feedforward pruning
    for layer in model.layers:
        importance = abs(
            silu(layer.ffn.w1.output_x) * layer.ffn.w3.output_x
        ).mean(dim=(0,1))
        dims_to_keep = topk(importance, k=target_ffn_dim)
        layer.ffn = prune_hidden_dims(layer.ffn, dims_to_keep)

    return model
```

代码大意: 先按目标尺寸取出层数, 隐藏维度, FFN 维度. 层剪枝: 每层算输出与输入激活范数之比的均值, 保留得分最高的若干层. 隐藏维度剪枝: 收集每层注意力归一化和 FFN 归一化的输入, 做 PCA 得到旋转矩阵, 旋转后截到目标维度. FFN 剪枝: 每层按 $|\mathrm{SiLU}(W_1 x) \cdot W_3 x|$ 在 batch 和序列上的均值打分, 保留得分最高的若干维.

> **核对:** 算法 2 的代码能直接跑吗?
> 有两处对不上. `layers_to_keep` 被传给 `remove_layers`, 变量名和函数名意思相反; PCA 用的是 `n_components=n_dims`, 而 `n_dims` 在函数里没有定义, 第一行取出的是 `target_dim`. 这是伪代码, 意思看得懂, 不能照抄.

> **看表:** 每剪一次, 各维度剪掉多少?
> 14B 到 8B: 层数 40 到 34 (保留 85%), 潜变量维度 5120 到 4096 (80%), FFN 16384 到 14336 (87.5%). 8B 到 3B: 34 到 26 (约 76.5%), 4096 到 3072 (75%), 14336 到 9216 (约 64.3%). 第二刀明显更狠. 24B 父模型到 14B 这一刀, 父模型规格本页未印, 算不出.

**Distillation.** After weight initialization, each child model is trained on a mixture of text-only and interleaved text with image data with logit distillation from a teacher model. We find that training with just the forward KL distillation objective outperforms tuning the coefficients of an objective that weights the distillation objective and the next token prediction objective differently. For all stages and model sizes, we use the parent model as the teacher model (more details in §5.1).

**蒸馏.** 权重初始化之后, 每个子模型在纯文本和图文交错数据的混合上训练, 用 teacher 模型做 logit 蒸馏. 我们发现, 只用 forward KL 蒸馏目标, 效果好于把蒸馏目标和 next token 预测目标按不同系数加权再调系数. 所有阶段, 所有尺寸都用父模型做 teacher (更多细节见 §5.1).

> **拆开:** 只用 forward KL 比混合 next token 目标好, 证据在哪?
> 正文只有一句 「We find that ...」, 括号指向 §5.1, 但 §5.1 讲的是选哪个 teacher, 没有 KL 与混合目标的对比, 也没有数. 这一条本页只能当作者的结论记下.

The pretraining phase consists of a two-stages:

预训练分两个阶段:

(1) **Short context stage** with a context window of length 16,384. The output of this phase is the input to to the pruning phase of the next child model.

(1) **短上下文阶段**, 上下文窗口长 16,384. 这一阶段的产出, 是下一个子模型剪枝阶段的输入.

<!-- page 5 of 14 -->

(2) **Long context stage** to extend the context window from 16,384 to 262,144 using YaRN [Peng et al., 2023] and position-based temperature scaling [Nakanishi, 2025, MetaAI, 2025].

(2) **长上下文阶段**, 用 YaRN [Peng et al., 2023] 和按位置调节的温度 [Nakanishi, 2025, MetaAI, 2025], 把上下文窗口从 16,384 扩到 262,144.

> **确认:** 长上下文从 16,384 扩到 262,144, 每个尺寸都单独扩一次?
> 是. 算法 1 每一轮循环都有自己的 long context distillation, 产出 final_model, 但传给下一轮剪枝的是短上下文的 model. 所以三个尺寸各扩一次, 262,144 / 16,384 = 16 倍. 长上下文阶段用了多少 token, 本页未印.

### 3.2 Post-Training: Ministral Instruct (后训练: Ministral Instruct)

To impart instruction-following capabilities [Ouyang et al., 2022], pretrained models are fine-tuned using a curated dataset comprising high-quality multimodal and text-only instruction-following data. The fine-tuning phase also consists of two stages: Supervised Fine-Tuning (SFT) and Online Direct Preference Optimization (ODPO).

为了让模型学会遵循指令 [Ouyang et al., 2022], 我们用一份精选数据集微调预训练模型, 里面是高质量的多模态和纯文本指令遵循数据. 微调也分两个阶段: SFT 和在线直接偏好优化 (ODPO).

#### 3.2.1 Supervised Fine-tuning (SFT)

We run SFT with fp8 quantization, using a logit distillation loss from a strong teacher. Unlike pretraining, each model is distilled from Mistral Medium 3 model (more details in §5.1). Similar to the pretraining phase, the vision encoder remains frozen while the adapter is trainable.

SFT 用 fp8 量化来跑, 损失是来自一个强 teacher 的 logit 蒸馏损失. 和预训练不同, 这里每个模型都从 Mistral Medium 3 蒸馏 (更多细节见 §5.1). 和预训练一样, 视觉编码器保持冻结, 适配层可训练.

> **回看:** 指令 SFT 的 teacher 是 Mistral Medium 3 还是 3.1?
> 这里写 「distilled from Mistral Medium 3 model」, 第 9 页写 「benefit from distillation from the more capable Mistral Medium 3.1」, 脚注 3 的链接指向 mistral-medium-3-1-25-08, 第 11 页结论又写 「Mistral Small 3.1 and Medium 3」. 同一个 teacher 出现两个版本号, 本页没统一.

#### 3.2.2 Online Direct Preference Optimization stage (ODPO 阶段)

Direct Preference Optimization (DPO) [Rafailov et al., 2023] offers a lightweight framework for human preference optimization by learning directly from offline pairwise preferences. For the Ministral 3 models, we adopt its online variant, Online Direct Preference Optimization (ODPO) [Guo et al., 2024] where, for each example, we sample two candidate responses from the current policy with temperature T=0.7, and use a text-based reward model to rank the responses.

直接偏好优化 (DPO) [Rafailov et al., 2023] 直接从离线的成对偏好里学习, 是一套轻量的人类偏好优化框架. Ministral 3 用的是它的在线版, ODPO [Guo et al., 2024]: 对每个样本, 用温度 T=0.7 从当前策略采两条候选回答, 再用一个基于文本的奖励模型给它们排序.

This method relies on a Pairwise Reward Model (PWRM) to dynamically rank candidate responses. The PWRM is trained via supervised fine-tuning (SFT) on structured pairwise data: given a conversation history and two candidate responses, it predicts which response is preferred. In addition, we refine the classic DPO loss by incorporating the binomial probabilistic output of the PWRM, replacing hard winner/loser labels with a two-sided loss that weights each response by its probability of being preferred. We make two additional changes to stabilize the learning process: (1) we adjust the PWRM temperature to calibrate the win / loss probabilities; and (2) we employ a β-rescaling technique, allowing for a more beta-invariant rescaling of dpo loss.

这个方法靠成对奖励模型 (PWRM) 动态给候选回答排序. PWRM 在结构化的成对数据上用 SFT 训练: 给定对话历史和两条候选回答, 预测哪条更受偏好. 此外, 我们把 PWRM 的二项概率输出并进经典 DPO 损失, 不再用硬的胜/负标签, 而是用双边损失, 按每条回答被偏好的概率给它加权. 为了让学习更稳, 还做了两处改动: (1) 调 PWRM 的温度, 校准胜/负概率; (2) 用 β 重标定技巧, 让 DPO 损失的重标定对 β 更不敏感.

In practice, the online variant is particularly important for mitigating model-induced artifacts, such as infinite generations. This is also facilitated by some heuristics, such as automatically treating any response that exhibits an infinite loop during sample as "loser," preventing such behavior from being reinforced. Finally, we enable tool execution during generation, which improves the model's tool-use performance.

实践中, 在线版对压住模型自己造成的毛病特别重要, 比如无限生成. 一些启发式规则也有帮助, 比如采样中出现死循环的回答一律自动判为 「负」, 防止这种行为被强化. 最后, 我们在生成时允许执行工具, 这提升了模型的工具使用表现.

In summary, we found that using online preference optimization improves alignment with human preferences significantly over both the SFT and offline variants. We release the models resulting from this phase as Ministral 3-14B/8B/3B Instruct.

总之, 我们发现在线偏好优化在对齐人类偏好上, 明显好于 SFT 版和离线版. 这一阶段得到的模型以 Ministral 3-14B/8B/3B Instruct 的名字发布.

> **停一下:** ODPO 让指令版提升了多少?
> 没有数. 这里只说在线偏好优化比 SFT 版和离线版 「significantly」 更好. 这一节给了采样温度 T=0.7 和每题两条候选, 但 PWRM 温度取多少, β 重标定的公式, 本页都没写. 能看到的 ODPO 前后对比只有第 10 页图 6, 那是推理版.

### 3.3 Post-Training: Ministral Reasoning (后训练: Ministral Reasoning)

Post-training for reasoning models begins from the pre-trained checkpoint as opposed to the ODPO variant. We train the model for inference-time scaling using a three-stage pipeline composed of SFT, GRPO and ODPO, using the long-context pretrained checkpoint as the starting point. Models released after this reasoning-oriented fine-tuning stage are referred to as Ministral 3 14B/8B/3B Reasoning.

推理模型的后训练从预训练 checkpoint 开始, 而不是从 ODPO 版开始. 我们以长上下文预训练 checkpoint 为起点, 用 SFT, GRPO, ODPO 三阶段流程训练模型, 让它能用上推理时额外算力. 这一面向推理的微调之后发布的模型, 称为 Ministral 3 14B/8B/3B Reasoning.

#### 3.3.1 Reasoning Supervised Fine-Tuning (推理 SFT)

In this stage, the model is finetuned on a mixture of short and long CoT samples. The former is derived from our general SFT data mixture whereas the latter consists of reasoning traces which have been prefixed with a reasoning specific system prompt.

这一阶段在短 CoT 和长 CoT 样本的混合上微调. 短 CoT 来自通用 SFT 数据配比, 长 CoT 是推理轨迹, 前面加了专门用于推理的 system prompt.

The reasoning traces come from a diverse set of domains including mathematics, coding, general dialogue, instruction following, multilingual tasks, tool use, and visual reasoning. We apply lightweight filtering to remove examples that are poorly formatted, contain excessive repetition, or have undesirable language switching, ensuring that the model is exposed to clean and well-structured chains of thought.

推理轨迹覆盖的领域很广: 数学, 编程, 通用对话, 指令遵循, 多语言任务, 工具使用, 视觉推理. 我们做了轻量过滤, 去掉格式差, 重复过多, 或出现不该有的语言切换的样本, 保证模型看到的 CoT 干净, 结构清楚.

<!-- page 6 of 14 -->

**3B SFT:** For the 3B model, vanilla SFT led to a brittle, overly verbose model with lots of repetition and infinite generations in its output. To mitigate this, we did logit distillation with Magistral Small 1.2 as teacher. This helped reduce verbosity and stabilized subsequent RL training.

**3B SFT:** 对 3B 模型, 普通 SFT 得到的模型很脆, 话太多, 输出里大量重复和无限生成. 为此我们以 Magistral Small 1.2 为 teacher 做 logit 蒸馏. 这减少了啰嗦, 也让后面的 RL 训练更稳.

> **再看:** 推理版最长生成 80K, 放得进它的上下文吗?
> 下文把 RL 的最长生成从 32K 提到 80K, 是 2.5 倍. 按引言推理版上下文 128k, 80K 生成加上 prompt 仍在范围内; 按结论的 256K 更宽松. 截断占 「non-trivial proportion」, 具体多少, 提到 80K 后还剩多少截断, 本页未印.

#### 3.3.2 Reinforcement Learning (强化学习)

We perform GRPO [DeepSeek-AI et al., 2025] on top of the SFT checkpoint to refine the model's thinking and improve the performance further on reasoning tasks. The training is conducted in two stages:

我们在 SFT checkpoint 上做 GRPO [DeepSeek-AI et al., 2025], 打磨模型的思考过程, 进一步提高推理任务上的表现. 训练分两个阶段:

**STEM RL:** In the first stage, we train the model on math, code and visual-reasoning tasks. We collect question-answer pairs from a diverse set of open and proprietary sources. The samples are filtered and cleaned using a rigorous multi-step pipeline (detailed in Rastogi et al. [2025]) to remove invalid, incomplete and very easy/hard problems.

**STEM RL:** 第一阶段在数学, 代码和视觉推理任务上训练. 问答对从多种公开和自有来源收集, 经过一套严格的多步流程 (详见 Rastogi et al. [2025]) 过滤清洗, 去掉无效, 不完整, 太容易或太难的题.

**General RL:** In the second stage, we broaden the scope beyond STEM problems. We generate atomic grading rubrics for a diverse set of prompts including general chat, instruction-following, and open-ended reasoning tasks. During GRPO, an LLM judge evaluates each model rollout against these rubrics (e.g., faithfulness to the prompt, response quality) and the final reward is set to the fraction of satisfied heuristics. This stage improves the instruction following and general chat capabilities of the model while maintaining, and sometimes even improving, the performance on the STEM benchmarks.

**General RL:** 第二阶段把范围扩到 STEM 之外. 我们为各种 prompt 生成原子化的评分细则, 包括通用聊天, 指令遵循, 开放式推理任务. GRPO 过程中, 由一个 LLM 评委按这些细则 (比如是否忠于 prompt, 回答质量) 评判模型的每条 rollout, 最终奖励取满足的规则所占比例. 这一阶段提升了指令遵循和通用聊天能力, STEM 基准上的表现保持住了, 有时还有提高.

> **对一下:** General RL 的奖励是 「fraction of satisfied heuristics」, 和前面的 rubrics 是一回事吗?
> 同一段前半说 LLM 评委按 「atomic grading rubrics」 评每条 rollout, 后半说奖励等于满足的 「heuristics」 的比例, 两个词应当指同一批条目, 但页面没统一用词. 每个 prompt 有几条细则, 评委是哪个模型, 本页都未印.

For both stages, we follow the GRPO training recipe from Rastogi et al. [2025]. The maximum generation length is increased from 32K to 80K, since we observed a non-trivial proportion of truncated generations during RL. Allowing longer outputs allowed the model to finish its reasoning for the most challenging problems, resulting in additional performance gains.

两个阶段都沿用 Rastogi et al. [2025] 的 GRPO 训练配方. 最长生成长度从 32K 提到 80K, 因为我们在 RL 中看到相当一部分生成被截断. 允许更长的输出后, 模型在最难的题上能把推理做完, 表现又有提升.

#### 3.3.3 Online Direct Preference Optimization (ODPO)

Finally, we apply ODPO as a post-RL alignment stage to better align with user preferences and polish the model's conversational and instructional behavior. The overall procedure follows the same setup as used for our non-reasoning instruct models, with one modification – The thinking chunks are stripped from the model's generations before sending them to the reward model for scoring. Some additional experimental details are discussed in Section 5.3.

最后, 我们在 RL 之后加一个 ODPO 对齐阶段, 让模型更贴合用户偏好, 打磨对话和听指令的表现. 整体流程和非推理的指令模型相同, 只改了一处: 模型生成里的思考段先剥掉, 再送给奖励模型打分. 更多实验细节见第 5.3 节.

## 4 Results (结果)

In this section, we report the results of Ministral 3 models on a variety of benchmarks. We also compare Ministral 3 to other open-weight models on the same scale, namely the Qwen 3 family [Yang et al., 2025, Bai et al., 2025] and the Gemma 3 family [Kamath et al., 2025]. For external models, we re-run all benchmarks with our own evaluation pipeline for fair comparison.

本节报告 Ministral 3 在多种基准上的结果, 并和同规模的其他开放权重模型比较, 即 Qwen 3 家族 [Yang et al., 2025, Bai et al., 2025] 和 Gemma 3 家族 [Kamath et al., 2025]. 为了比较公平, 外部模型的所有基准都用我们自己的评测流程重跑.

> **想:** 引言说和 Mistral Small 3.2 2506 比, 数在哪?
> 找不到. 表 2 到表 5 里没有 Mistral Small 3.2, 这一节开头也只说和 Qwen 3, Gemma 3 比. 唯一沾边的是图 4 图例里的 「MS3.1 Instruct 2506」, 它和引言的 「Mistral Small 3.2 2506」 是不是同一个模型, 页面没说.

We evaluated on the following benchmarks: **General:** MMLU [Hendrycks et al., 2020], MMLU-Redux [Perez et al., 2024], ARC-Challenge [Clark et al., 2018], RACE High [Lai et al., 2017], TriviaQA [Joshi et al., 2017], NaturalQS [Kwiatkowski et al., 2019], and AGIEval [Zhong et al., 2023]. **Math & Code:** MATH [Hendrycks et al., 2021], GPQA Diamond [Rein et al., 2024], and MBPP [Austin et al., 2021]. **Multimodal:** MMMU [Yue et al., 2024] and MathVista [Lu et al., 2024]. **Post-training:** Arena Hard [Li et al., 2024], WildBench [Lin et al., 2024], MM MTBench<sup>2</sup>, AIME 2024/2025, HMMT 2025, PhyBench [Liu et al., 2025], and LiveCodeBench [Jain et al., 2024].

评测用的基准如下. **通用:** MMLU [Hendrycks et al., 2020], MMLU-Redux [Perez et al., 2024], ARC-Challenge [Clark et al., 2018], RACE High [Lai et al., 2017], TriviaQA [Joshi et al., 2017], NaturalQS [Kwiatkowski et al., 2019], AGIEval [Zhong et al., 2023]. **数学与代码:** MATH [Hendrycks et al., 2021], GPQA Diamond [Rein et al., 2024], MBPP [Austin et al., 2021]. **多模态:** MMMU [Yue et al., 2024], MathVista [Lu et al., 2024]. **后训练:** Arena Hard [Li et al., 2024], WildBench [Lin et al., 2024], MM MTBench<sup>2</sup>, AIME 2024/2025, HMMT 2025, PhyBench [Liu et al., 2025], LiveCodeBench [Jain et al., 2024].

### 4.1 Pretraining Results (预训练结果)

In Table 2, we compare Ministral 3 Base models against other open-weight models of similar size from the Gemma 3 family and the Qwen 3 family.

表 2 把 Ministral 3 Base 和 Gemma 3, Qwen 3 家族里尺寸相近的开放权重模型做比较.

At the 14B scale, Ministral 3 demonstrates strong performance, outperforming Qwen 3 14B on TriviaQA and MATH, while being competitive on other benchmarks. Our 14B model is also significantly better than Gemma 12B across all benchmarks. At the 8B scale, we observe a similar trend. It is also worth pointing out that Ministral 3 8B outperforms the larger Gemma 12B in most of the evaluations (except TrivaiQA), highlighting the strong parameter efficiency of Ministral 3 models.

在 14B 规模上, Ministral 3 表现强, TriviaQA 和 MATH 超过 Qwen 3 14B, 其他基准上也不相上下. 我们的 14B 模型在所有基准上都明显好于 Gemma 12B. 8B 规模上趋势类似. 值得一提的是, Ministral 3 8B 在大多数评测上 (TriviaQA 除外) 超过更大的 Gemma 12B, 说明 Ministral 3 的参数效率很高.

> **问:** 「significantly better than Gemma 12B across all benchmarks」 对得上表 2 吗?
> 对不上. 表 2 的 TriviaQA, Gemma 3 12B 是 78.8, Ministral 3 14B 是 74.9, 低 3.9. 其余四列 14B 确实都高: MMLU-Redux 高 5.4, MATH 高 18.9, AGIEval 高 6.1, 多语言 MMLU 高 5.2. 讲 8B 时作者自己写了 「except TriviaQA」, 讲 14B 这句漏了.

<sup>2</sup> https://huggingface.co/datasets/mistralai/MM-MT-Bench

脚注 2: MM MTBench 数据集在 HuggingFace 上的地址.

<!-- page 7 of 14 -->

Table 2: Comparing Ministral 3 Base models against the Gemma 3 base models and the Qwen 3 base models on pretraining benchmarks. All the results are reported after running the evaluations using our internal harness with identical configuration.

表 2: 在预训练基准上比较 Ministral 3 Base 与 Gemma 3, Qwen 3 的 base 模型. 所有结果都是用我们内部评测框架, 在完全相同的配置下跑出来的.

| Model | MMLU-Redux (5-shot) | TriviaQA (5-shot) | MATH (CoT 2-Shot) | AGIEval (5-shot) | Multilingual MMLU (5-Shot) |
| --- | --- | --- | --- | --- | --- |
| Qwen 3 14B | 83.7 | 70.3 | 62.0 | 66.1 | 75.4 |
| Ministral 3 14B | 82.0 | 74.9 | 67.6 | 64.8 | 74.2 |
| Gemma 3 12B | 76.6 | 78.8 | 48.7 | 58.7 | 69.0 |
| Qwen 3 8B | 79.4 | 63.9 | 57.6 | 59.6 | 70.0 |
| Ministral 3 8B | 79.3 | 68.1 | 62.6 | 59.1 | 70.6 |
| Gemma 3 4B | 62.6 | 64.0 | 29.4 | 43.0 | 51.6 |
| Qwen 3 4B | 75.9 | 53.0 | 40.5 | 57.0 | 67.7 |
| Ministral 3 3B | 73.5 | 59.2 | 60.1 | 51.1 | 65.2 |

> **核对:** 表 2 的 Multilingual MMLU 和表 3 的四项语言分数怎么对上?
> 表 3 的欧洲均值是 5 种语言的平均. 把它算 5 份, 中文, 日文, 韩文各 1 份, 共 8 种语言平均: 14B 约 74.3, 8B 约 70.7, 3B 约 65.1, 表 2 印的是 74.2, 70.6, 65.2, 差 0.1 以内, 可能就是 8 种语言的均值加取整误差. 页面没写表 2 这一列怎么算.

> **看表:** 表 2 里 3B 和谁比?
> 和 Gemma 3 4B, Qwen 3 4B 比, 对手都是 4B. 3B 对 Qwen 3 4B 两胜三负: TriviaQA 高 6.2, MATH 高 19.6; MMLU-Redux 低 2.4, AGIEval 低 5.9, 多语言 MMLU 低 2.5. 3B 对 Gemma 3 4B 四胜一负, TriviaQA 低 4.8. 下文 「gaps become more pronounced」 没说谁领先.

Table 3: Evaluation results of the Ministral 3 Base family compared to the teacher model Mistral Small 3.1 24B across general reasoning, math & code, multilingual, and multimodal benchmarks. Performance scales smoothly with model size, yet the pruned Ministral 3 variants retain a large fraction of the teacher's capability despite substantial parameter reductions.

表 3: Ministral 3 Base 家族与 teacher 模型 Mistral Small 3.1 24B 在通用推理, 数学与代码, 多语言, 多模态基准上的对比. 性能随模型尺寸平稳变化; 剪过的 Ministral 3 参数少了很多, 仍保住了 teacher 能力的一大部分.

| Evaluation | Mistral Small 24B | Ministral 3 14B | Ministral 3 8B | Ministral 3 3B |
| --- | --- | --- | --- | --- |
| General |  |  |  |  |
| MMLU (5-shot) | 81.0 | 79.4 | 76.1 | 70.7 |
| MMLU-Redux (5-shot) | 82.7 | 82.0 | 79.3 | 73.5 |
| ARC-Challenge | 91.6 | 89.9 | 88.0 | 85.5 |
| RACE High | 52.1 | 52.3 | 49.7 | 49.3 |
| TriviaQA (5-shot) | 79.3 | 74.9 | 68.1 | 59.2 |
| NaturalQS (5-shot) | 34.4 | 29.9 | 25.8 | 21.9 |
| Math & Code |  |  |  |  |
| MATH (CoT 2-Shot) | 55.8 | 67.6 | 62.6 | 60.1 |
| GPQA Diamond (0-shot) | 36.9 | 39.9 | 39.9 | 33.8 |
| MBPP (3-shot Pass@1) | 71.6 | 71.6 | 70.0 | 63.0 |
| Multilingual MMLU |  |  |  |  |
| European avg.<sup>†</sup> (5-shot) | 78.8 | 76.9 | 73.4 | 68.4 |
| Chinese (5-shot) | 75.7 | 75.1 | 71.3 | 64.1 |
| Japanese (5-shot) | 76.7 | 75.9 | 72.2 | 65.7 |
| Korean (5-shot) | 59.3 | 59.0 | 55.3 | 48.9 |
| Multimodal |  |  |  |  |
| MMMU (2-shot) | 59.1 | 59.9 | 55.1 | 52.4 |
| MathVista | 51.3 | 43.6 | 35.7 | 23.3 |

† Averaged over German, Spanish, French, Italian, and Portuguese.

† 德语, 西班牙语, 法语, 意大利语, 葡萄牙语的平均.

> **拆开:** 表 3 说性能 「scales smoothly with model size」, teacher 的 MATH 为什么最低?
> MATH (CoT 2-Shot) 一行 teacher 24B 是 55.8, 三个学生是 67.6, 62.6, 60.1, 全都更高; GPQA Diamond 14B 和 8B 都是 39.9, 也高于 teacher 的 36.9; RACE High 和 MMMU 的 14B 也略高于 teacher. 第 9 页说预训练用后训练过的 teacher 对 MATH 帮助很大, 可能是原因; 但第 3 页只写 teacher 是 「Mistral Small 3.1」, 预训练最终用的是 Base 还是 Instruct, 本页没说.

At the 3B scale, the same overall trend persists, but performance gaps between models become more pronounced. Additional pretraining evaluation results for Ministral 3 Base models along with the teacher model are provided in Table 3.

3B 规模上总体趋势不变, 只是模型之间的差距更明显. Ministral 3 Base 与 teacher 模型的更多预训练评测结果见表 3.

### 4.2 Post-training Results (后训练结果)

In Table 4, we compare Ministral 3 Instruct models against Instruct models from the Gemma 3 family and the Qwen 3 family. For Qwen 3, we report the results for the latest vision enabled instruct variants (Qwen3-VL).

表 4 把 Ministral 3 Instruct 和 Gemma 3, Qwen 3 家族的 Instruct 模型做比较. Qwen 3 报告的是最新的带视觉的指令版 (Qwen3-VL).

<!-- page 8 of 14 -->

Table 4: Performance comparison of Ministral 3 instruct models against instruction-tuned baselines from the Qwen 3 and Gemma 3 families. Models are grouped by size to facilitate like-for-like comparisons.

表 4: Ministral 3 指令模型与 Qwen 3, Gemma 3 家族指令微调基线的性能对比. 模型按尺寸分组, 方便同级比较.

| Model | Arena Hard | WildBench | MATH (maj@1) | MM MTBench |
| --- | --- | --- | --- | --- |
| Qwen3 14B (Non-Thinking) | 42.7 | 65.1 | 87.00 | N/A |
| Ministral 3 14B | 55.1 | 68.5 | 90.40 | 84.90 |
| Gemma3-12B-Instruct | 43.6 | 63.2 | 85.40 | 67.00 |
| Qwen3-VL-8B-Instruct | 52.8 | 66.3 | 94.60 | 80.00 |
| Ministral 3 8B | 50.9 | 66.8 | 87.60 | 80.80 |
| Gemma3-4B-Instruct | 31.8 | 49.1 | 75.90 | 52.30 |
| Qwen3-VL-4B-Instruct | 43.8 | 56.8 | 90.00 | 80.08 |
| Ministral 3 3B | 30.5 | 56.8 | 83.00 | 78.30 |
| Qwen3-VL-2B-Instruct | 16.3 | 42.2 | 78.60 | 63.60 |

> **确认:** 表 4 里 Qwen3-VL-4B-Instruct 的 MM MTBench 是 80.08, 其他格都是 x.x0, 是不是排版错?
> PDF 文字层同样是 80.08, 本页核对不了原值. 这一列除 N/A 外的其余 7 个数最后一位都是 0, 80.08 可能是 80.80 之误, 这里只能标疑点. MM MTBench 满分多少, 怎么打分, 本页也没写.

> **回看:** 表 4 的指令版在同尺寸里赢了几列?
> 14B 对 Qwen3 14B 和 Gemma3-12B 四列全赢 (Qwen3 14B 的 MM MTBench 是 N/A). 8B 对 Qwen3-VL-8B: Arena Hard 50.9 对 52.8, MATH 87.60 对 94.60 都输, WildBench 66.8 对 66.3, MM MTBench 80.80 对 80.00 小胜. 3B 对 Qwen3-VL-4B: Arena Hard 30.5 对 43.8, MATH 83.00 对 90.00, MM MTBench 78.30 对 80.08 都输, WildBench 同为 56.8; Arena Hard 还低于 Gemma3-4B 的 31.8.

Table 5: Comparison of Ministral 3 reasoning models with size-matched Qwen 3 reasoning counterparts on mathematics, science, and code benchmarks.

表 5: Ministral 3 推理模型与尺寸对应的 Qwen 3 推理模型在数学, 科学, 代码基准上的对比.

| Benchmark | Qwen 3 14B | Ministral 3 14B | Qwen3-VL 8B | Ministral 3 8B | Qwen3-VL 4B | Ministral 3 3B |
| --- | --- | --- | --- | --- | --- | --- |
| AIME 2024 | 83.7 | 89.8 | 86.0 | 86.0 | 72.9 | 77.5 |
| AIME 2025 | 73.7 | 85.0 | 79.8 | 78.7 | 69.7 | 72.1 |
| HMMT 2025 | 55.8 | 67.5 | 57.5 | 55.8 | 50.8 | 51.7 |
| GPQA Diamond | 66.3 | 71.2 | 67.1 | 66.8 | 60.1 | 53.4 |
| PhyBench | 22.0 | 26.0 | 22.0 | 20.0 | 9.0 | 15.0 |
| LiveCodeBench v6 | 59.3 | 64.6 | 58.0 | 61.6 | 51.3 | 54.8 |

> **停一下:** 表 5 里 8B 推理版对 Qwen3-VL 8B 战绩如何?
> 一胜一平四负: LiveCodeBench v6 61.6 对 58.0 胜; AIME 2024 同为 86.0; AIME 2025 低 1.1, HMMT 2025 低 1.7, GPQA Diamond 低 0.3, PhyBench 低 2.0. 14B 对 Qwen 3 14B 六列全胜; 3B 对 Qwen3-VL 4B 五胜一负, 只有 GPQA Diamond 53.4 对 60.1 输 6.7. 正文没有逐项评论.

In Table 5, we compare Ministral 3 Reasoning models against reasoning models from the Qwen 3 family. To ensure a fair comparison, all models are evaluated using the same evaluation pipeline. To reduce variance, we report pass@16 except LiveCodeBench which is evaluated using pass@5.

表 5 把 Ministral 3 Reasoning 和 Qwen 3 家族的推理模型做比较. 为保证公平, 所有模型都用同一套评测流程. 为了降低方差, 报告的是 pass@16, 只有 LiveCodeBench 用 pass@5.

> **再看:** 「To reduce variance, we report pass@16」, pass@16 是什么口径?
> 按通常定义, pass@16 是 16 次采样里至少一次答对, 它会抬高分数, 并不直接降低方差; 降方差的常见做法是 16 次取平均. 页面没给定义, 表 5 的数属于哪一种读不出来. PhyBench 一行全是整数 (22.0, 26.0, 9.0 等), 页面也没解释.

## 5 Discussions (讨论)

### 5.1 Choice of Teacher Model for Distillation (蒸馏 teacher 的选择)

![图 3 柱状图: 纵轴 Score 从 0.3 到 0.8, 横轴六个基准 MMLU REDUX (5-shot), HellaSwag, TriviaQA, MATH, AGI-EVAL, Winogrande; 每组两根柱, 深橙 MS3.1, 浅黄 MM3 (图例标题 Pretraining Teacher). 六组都是 MS3.1 略高, 差距最大的是 AGI-EVAL, 约 0.568 对 0.543; MATH 最低, 约 0.378 对 0.368](images/p08-figure-3-ministral-3-14b-pretraining-ablations.png)

Figure 3: Ministral 3 14B pretraining ablations comparing distillation from Mistral Small 3.1 and Mistral Medium 3 teachers. Despite Mistral Medium 3 being larger and more capable, distillation from Mistral Small 3.1 consistently yields stronger downstream performance across different benchmarks.

图 3: Ministral 3 14B 预训练消融, 比较以 Mistral Small 3.1 和 Mistral Medium 3 为 teacher 的蒸馏. Mistral Medium 3 更大, 能力更强, 但以 Mistral Small 3.1 为 teacher 在各个基准上都一致地带来更好的下游表现.

> **对一下:** 图 3 的 「consistently yields stronger」 差多少?
> 六组柱子 MS3.1 都略高, 但差距大多在 0.01 以内: MMLU Redux 约 0.770 对 0.765, HellaSwag 约 0.773 对 0.768, TriviaQA 约 0.555 对 0.548, MATH 约 0.378 对 0.368, Winogrande 约 0.732 对 0.730; 只有 AGI-EVAL 约 0.568 对 0.543, 差约 0.025 (都是读图). 图上没有误差线. HellaSwag 和 Winogrande 也不在第 6 页的基准清单里.

In selecting an appropriate teacher model for the distillation process, we identified several noteworthy observations that meaningfully influenced our design choices:

在给蒸馏挑 teacher 的过程中, 我们有几条值得记下的观察, 它们实实在在地影响了设计选择:

<!-- page 9 of 14 -->

**Stronger teacher does not lead to better results:** For pretraining, distilling from Mistral Small 3.1 outperformed distillation from the much stronger Mistral Medium 3<sup>3</sup> even in a non FLOP-matched setup, similar to observations in Busbridge et al. [2025] (Figure 3). However, during post-training, Ministral 3 models benefit from distillation from the more capable Mistral Medium 3.1.

**更强的 teacher 不带来更好的结果:** 预训练时, 从 Mistral Small 3.1 蒸馏, 效果好于从强得多的 Mistral Medium 3<sup>3</sup> 蒸馏, 即使两边 FLOP 没有对齐也是如此, 这与 Busbridge et al. [2025] 的观察相似 (图 3). 不过在后训练阶段, Ministral 3 从能力更强的 Mistral Medium 3.1 蒸馏会获益.

![图 4 柱状图: 纵轴 Score 从 0 到 0.7, 横轴六个基准 MMLU REDUX (5-shot), HellaSwag, TriviaQA (5-shot), MATH (maj@4), MBPP, MMMU (2-shot); 每组两根柱, 深橙 MS3.1 Base, 浅黄 MS3.1 Instruct 2506 (图例标题 Pretraining Teacher). MATH 组差距最大, 约 0.395 对 0.553; MBPP 约 0.565 对 0.592; MMMU 约 0.476 对 0.492; 其余三组几乎一样高](images/p09-figure-4-ministral-3-3b-pretraining-ablations-comparing.png)

Figure 4: Ministral 3 3B pretraining ablations comparing distillation from base and post-trained (instruct/reasoning) variants of Mistral Small 3.1. The instruct teacher yields stronger performance on STEM benchmarks, while achieving comparable results on knowledge and multimodal evaluations.

图 4: Ministral 3 3B 预训练消融, 比较以 Mistral Small 3.1 的 base 版和后训练版 (instruct/reasoning) 为 teacher 的蒸馏. 以 instruct 版为 teacher, STEM 基准更强, 知识类和多模态评测上结果相当.

> **想:** 图 4 的对照组是 「base 和 post-trained (instruct/reasoning)」, 图上有 reasoning 吗?
> 没有. 图例只有 「MS3.1 Base」 和 「MS3.1 Instruct 2506」 两组. 差距最大的是 MATH (maj@4), 约 0.395 对 0.553; MBPP 约 0.565 对 0.592, MMMU 约 0.476 对 0.492; MMLU Redux, HellaSwag, TriviaQA 几乎持平 (都是读图). 这和正文 「MATH 和代码影响大, 多模态小而一致, 知识类可以忽略」 对得上.

**The choice of teacher version (base / instruct) matters:** In line with Goyal et al. [2025], we find that distilling from a post-trained teacher as opposed to a pre-trained one during the pre-training stage results in a stronger model (Figure 4). In particular, this had a strong impact on maths (MATH) and code capabilities, a small but consistent impact on multimodal evaluations (e.g. MMMU), and a negligible impact on knowledge metrics (MMLU / Trivia-QA).

**teacher 用哪个版本 (base / instruct) 有影响:** 与 Goyal et al. [2025] 一致, 我们发现预训练阶段用后训练过的 teacher 蒸馏, 比用只预训练过的 teacher, 得到的模型更强 (图 4). 具体来说, 对数学 (MATH) 和代码能力影响很大, 对多模态评测 (如 MMMU) 影响小但一致, 对知识类指标 (MMLU / Trivia-QA) 几乎没有影响.

**Human Preference tuned models are better teachers:** Post We use two internal versions of Mistral Medium 3 to answer the question - is it better to distill from an SFT or a preference tuned checkpoint during SFT? We find that distilling from the preference tuned checkpoint is always substantially better. These gains persist even after the student model undergoes its own preference tuning phase.

**做过人类偏好调优的模型是更好的 teacher:** 我们用 Mistral Medium 3 的两个内部版本回答这个问题: SFT 时, 从 SFT checkpoint 蒸馏好, 还是从偏好调优过的 checkpoint 蒸馏好? 结果是从偏好调优过的 checkpoint 蒸馏总是好得多. 学生模型自己再做完偏好调优后, 这个优势仍在. (原文句首多出一个孤立的 「Post」, 不译.)

> **问:** 「Human Preference tuned models are better teachers」 有多少证据?
> 只有文字: 用两个内部版本的 Mistral Medium 3, 结论是偏好调优过的 checkpoint 「always substantially better」, 学生自己做完偏好调优后优势仍在. 没有图, 没有表, 连基准名都没有. 这里的 teacher 又写作 Mistral Medium 3, 与同页上一段的 Medium 3.1 不一致.

### 5.2 Model Verbosity (模型的啰嗦程度)

![图 5 散点图: 纵轴 GPQA Diamond Accuracy 从 25 到 60, 横轴 Number of output tokens 从 0 到约 25000; 左上角浅绿三角标 HIGH EFFICIENCY & LOW COST. Ministral3 14B Instruct 约 55.5 分, 约 1000 token; 8B Instruct 约 50.5 分, 约 1200 token; 3B Instruct 约 39 分, 约 1500 token; Gemma3 12B Instruct 约 40 分, Gemma3 4B Instruct 约 30 分, 都贴近纵轴; 右侧 Qwen3-VL 8B Instruct 约 51 分, 约 16500 token, Qwen3-VL 4B Instruct 约 46.5 分, 约 21000 token](images/p09-figure-5-verbosity-in-terms-of-number-of-output-tokens.png)

Figure 5: Verbosity (in terms of number of output tokens) v.s. accuracy on GPQA Diamond with Ministral 3 instruction-following and reasoning.

图 5: Ministral 3 指令版和推理版在 GPQA Diamond 上的啰嗦程度 (按输出 token 数计) 与准确率.

> **核对:** 图 5 画的是哪些模型, 各用了多少 token?
> 图注说 「instruction-following and reasoning」, 图上只有 Instruct 模型. 读图: Ministral3 14B Instruct 约 55.5 分, 约 1,000 token; Qwen3-VL 8B Instruct 约 51 分, 约 16,500 token. 14B 比后者高约 4.5 分, token 只有约 1/16. GPQA Diamond 全文出现三次: 表 3 的 base 14B 是 39.9, 图 5 的指令版 14B 约 55 (读图), 表 5 的推理版 14B 是 71.2.

Our post-training of Ministral 3 Instruct differs from Qwen 3 in that it does not do "Reasoning RL" before the "General RL" stage (see Fig. 1 of Yang et al. [2025]) this likely results in different model verbosity between the two models as illustrated in Figure 5.

Ministral 3 Instruct 的后训练和 Qwen 3 不同: 在 「General RL」 之前没有做 「Reasoning RL」 (见 Yang et al. [2025] 的图 1). 这很可能就是两者啰嗦程度不同的原因, 如图 5 所示.

<sup>3</sup> [https://docs.mistral.ai/models/mistral-medium-3-1-25-08](https://docs.mistral.ai/models/mistral-medium-3-1-25-08)

脚注 3: Mistral Medium 3.1 (25-08) 的文档页.

<!-- page 10 of 14 -->

In an experiment to try and get the Ministral 3 Instruct models to produce longer chains of thought, we investigated incorporating varying proportions of long chain-of-thought (CoT) reasoning traces, paired with carefully curated system prompts, into the SFT training data. Increasing the fraction of such Long CoT data improved the performance on STEM benchmarks; however, it also leads to excessive reflection, internal monologues and backtracking behavior (as shown below), which is undesirable and unnatural for a general-purpose chat model.

为了让 Ministral 3 Instruct 输出更长的 CoT, 我们做过一个实验: 往 SFT 训练数据里掺不同比例的长 CoT 推理轨迹, 配上精心挑选的 system prompt. 长 CoT 数据比例越高, STEM 基准越好; 但它也带来过度反思, 自言自语和反复回头的行为 (见下例). 对通用聊天模型来说, 这既不受欢迎, 也不自然.

**Reasoning Behavior in Instruct Model.**

**指令模型里的推理行为.**

```text
Okay, let's try to solve this problem step by step. The question is: Find the sum of all integer bases b > 9 for which 17_b is a divisor of 97_b. First, I need to recall how to convert numbers from base b to base 10. A number d_n d_{n-1} ... d_1 d_0 in base b is equal to d_n b^n + d_{n-1} b^{n-1} + ... + d_1 b + d_0 in base 10.
...
Wait, the problem states b > 9, so we need to check the divisors of 56 that are greater than 9 (since b = d - 7
...
Wait, but let's check another way. Instead of using the congruence, we can set up the equation 9b + 7 = k(b + 7) for some integer k >= 1
...
I think that's it. The key was to convert the numbers to base 10, set up the divisibility condition, and recognize that the base must be greater than 9, so we only consider divisors of 56 that make b > 9.
...
Thus, the valid bases are 21 and 49. The sum of these bases is:
21 + 49 = 70
Therefore, the answer is [70].
```

示例大意: 模型先说 「一步一步来」, 复述题目: 求所有满足 $b > 9$ 且 $17_b$ 整除 $97_b$ 的整数进制 $b$ 之和; 回忆进制换算公式. 中途两次 「Wait」: 一次提醒自己 $b > 9$, 要找 56 的因数 $d$ 且 $b = d - 7$; 一次换个办法, 设 $9b + 7 = k(b + 7)$. 然后总结关键步骤, 得出进制 21 和 49, 和为 70.

> **看表:** 示例里的答案 70 对吗?
> 对. $17_b = b + 7$, $97_b = 9b + 7 = 9(b + 7) - 56$, 所以 $b + 7$ 必须整除 56. $b > 9$ 即 $b + 7 > 16$, 56 的因数里只有 28 和 56 满足, 得 $b = 21, 49$, 和为 70. 示例想展示的是 「Wait, ...」 这类反复回头, 不是答错. 长 CoT 比例加到多少, STEM 提升了多少, 本页没给数.

### 5.3 ODPO for Ministral 3 Reasoning (Ministral 3 推理版的 ODPO)

![图 6 分组柱状图: 纵轴 Score 从 0 到约 65, 横轴 Model Size 为 14B, 8B, 3B, 每组三根柱 ArenaHard, EQBench, WildBench, 实心是 ODPO 前, 顶上斜线部分标 Δ after ODPO. 14B: ArenaHard 约 25 到 41, EQBench 约 12 到 43.5, WildBench 约 55 到 63.5; 8B: 约 20 到 39.5, 约 19.5 到 34, 约 56 到 63.5; 3B: ArenaHard 约 14.7 看不出增量, EQBench 约 14 到 16, WildBench 约 47 到 49](images/p10-figure-6-impact-of-odpo-on-chat-benchmarks-for.png)

Figure 6: Impact of ODPO on chat benchmarks for Ministral 3 reasoning models, applied on top of GRPO-trained checkpoints. ODPO delivers substantial gains across all benchmarks for the 14B and 8B variants.

图 6: 在 GRPO 训练后的 checkpoint 上加 ODPO, 对 Ministral 3 推理模型聊天基准的影响. 14B 和 8B 在所有基准上都有大幅提升.

Reasoning models, while being better at solving challenging problems, often lag in general conversational quality, a pattern we also observed with the Ministral 3 reasoning variants. To address this, we performed ODPO training on top of the RL-trained checkpoints. As shown in Figure 6, this significantly improved the 14B and 8B models on alignment benchmarks. The 3B model however, did not demonstrate significant improvements on public benchmarks after this stage<sup>4</sup>. The model nevertheless performed better in our internal human evaluations and so we selected the ODPO checkpoint as the release candidate.

推理模型解难题更强, 通用对话质量却常常落后, Ministral 3 的推理版也是这样. 为此我们在 RL 训练后的 checkpoint 上再做 ODPO. 如图 6 所示, 14B 和 8B 在对齐基准上明显提升. 3B 在这一阶段之后, 公开基准上没有明显提升<sup>4</sup>. 不过它在我们内部的人工评测里表现更好, 所以我们选了 ODPO 后的 checkpoint 作为发布版本.

> **拆开:** 图 6 里 ODPO 带来的提升, 三档差多少?
> 读图: 14B 的 EQBench 从约 12 升到约 43.5, 涨约 31, 是全图最大的增量; 8B 的 ArenaHard 涨约 19.5; 3B 的 ArenaHard 看不出增量, EQBench 只涨约 2, WildBench 涨约 2 (都是读图). EQBench 不在第 6 页的基准清单里, 只出现在图 6 和参考文献 Paech [2023]. 3B 最终靠 「internal human evaluations」 选了 ODPO 版, 这项人评本页没有数.

<sup>4</sup> We also found the 3B base more sensitive than 14B and 8B to hyper-parameter choice in fine-tuning

脚注 4: 我们还发现, 微调时 3B base 对超参数选择比 14B 和 8B 更敏感.

<!-- page 11 of 14 -->

## 6 Conclusion

We introduced Ministral 3, a family of efficient dense language models designed for resource-constrained environments. Through iterative distillation from larger teacher models (Mistral Small 3.1 and Medium 3), we created three model sizes (14B, 8B, 3B) each available in base, instruction-following, and reasoning-enhanced variants. All models support vision capabilities and handle contexts up to 256K tokens. Collectively, Ministral 3 models highlight Mistral's continued commitment to supporting and advancing open-source initiatives. We hope they will provide value to the community and contribute to a stronger, more vibrant open-source ecosystem.

我们推出了 Ministral 3, 一组面向资源受限环境的高效稠密语言模型. 通过从更大的 teacher 模型 (Mistral Small 3.1 和 Medium 3) 迭代蒸馏, 我们得到三个尺寸 (14B, 8B, 3B), 每个尺寸都有 base, 指令遵循和推理增强三个变体. 所有模型都有视觉能力, 能处理最长 256K token 的上下文. Ministral 3 体现了 Mistral 持续支持和推进开源的承诺. 我们希望它们能给社区带来价值, 让开源生态更强, 更有活力.

> **确认:** 结论和正文有哪些对不上?
> 两处. 结论只说从 「Mistral Small 3.1 and Medium 3」 蒸馏, 漏了 3B 推理 SFT 用的 Magistral Small 1.2; 结论说所有模型都支持 256K, 引言说推理版是 128k. 另外 「resource-constrained」 的部署数字 (显存, 延迟, 吞吐) 全文都没有.

## Core contributors (核心贡献者)

Alexander H. Liu, Kartik Khandelwal, Sandeep Subramanian, Victor Jouault

核心贡献者 4 人, 名单原样保留.

## Contributors (贡献者)

Abhinav Rastogi, Adrien Sadé, Alan Jeffares, Albert Jiang, Alexandre Cahill, Alexandre Gavaudan, Alexandre Sablayrolles, Amélie Héliou, Amos You, Andy Ehrenberg, Andy Lo, Anton Eliseev, Antonia Calvi, Avinash Sooriyarachchi, Baptiste Bout, Baptiste Rozière, Baudouin De Monicault, Clémence Lanfranchi, Corentin Barreau, Cyprien Courtot, Daniele Grattarola, Darius Dabert, Diego de las Casas, Elliot Chane-Sane, Faruk Ahmed, Gabrielle Berrada, Gaëtan Ecrepont, Gauthier Guinet, Georgii Novikov, Guillaume Kunsch, Guillaume Lample, Guillaume Martin, Gunshi Gupta, Jan Ludziejewski, Jason Rute, Joachim Studnia, Jonas Amar, Joséphine Delas, Josselin Somerville Roberts, Karmesh Yadav, Khyathi Chandu, Kush Jain, Laurence Aitchison, Laurent Fainsin, Léonard Blier, Lingxiao Zhao, Louis Martin, Lucile Saulnier, Luyu Gao, Maarten Buyl, Margaret Jennings, Marie Pellat, Mark Prins, Mathieu Poirée, Mathilde Guillaumin, Matthieu Dinot, Matthieu Futeral, Maxime Darrin, Maximilian Augustin, Mia Chiquier, Michel Schimpf, Nathan Grinsztajn, Neha Gupta, Nikhil Raghuraman, Olivier Bousquet, Olivier Duchenne, Patricia Wang, Patrick von Platen, Paul Jacob, Paul Wambergue, Paula Kurylowicz, Pavankumar Reddy Muddireddy, Philomène Chagniot, Pierre Stock, Pravesh Agrawal, Quentin Torroba, Romain Sauvestre, Roman Soletskyi, Rupert Menneer, Sagar Vaze, Samuel Barry, Sanchit Gandhi, Siddhant Waghjale, Siddharth Gandhi, Soham Ghosh, Srijan Mishra, Sumukh Aithal, Szymon Antoniak, Teven Le Scao, Théo Cachet, Theo Simon Sorg, Thibaut Lavril, Thiziri Nait Saada, Thomas Chabal, Thomas Foubert, Thomas Robert, Thomas Wang, Tim Lawson, Tom Bewley, Tom Bewley, Tom Edwards, Umar Jamil, Umberto Tomasini, Valeriia Nemychnikova, Van Phung, Vincent Maladière, Virgile Richard, Wassim Bouaziz, Wen-Ding Li, William Marshall, Xinghui Li, Xinyu Yang, Yassine El Ouahidi, Yihan Wang, Yunhao Tang, Zaccharie Ramzi

贡献者名单按名字字母排序, 原样保留, 从 Abhinav Rastogi 到 Zaccharie Ramzi.

> **回看:** 贡献者名单有什么问题?
> 「Tom Bewley」 连写了两次, PDF 文字层也是如此, 应是排版时重复. 名单里其余名字没有重复.

<!-- page 12 of 14 -->

## References

Pravesh Agrawal, Szymon Antoniak, Emma Bou Hanna, Baptiste Bout, Devendra Chaplot, Jessica Chudnovsky, Diogo Costa, Baudouin De Monicault, Saurabh Garg, Theophile Gervet, et al. Pixtral 12b. arXiv preprint arXiv:2410.07073, 2024.

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebrón, and Sumit Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv:2305.13245, 2023.

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

Shuai Bai et al. Qwen3-vl technical report, 2025. URL [https://arxiv.org/abs/2511.21631](https://arxiv.org/abs/2511.21631).

Dan Busbridge, Amitis Shidani, Floris Weers, Jason Ramapuram, Etai Littwin, and Russ Webb. Distillation scaling laws. arXiv preprint arXiv:2502.08606, 2025.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

DeepSeek-AI et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning, 2025. URL [https://arxiv.org/abs/2501.12948](https://arxiv.org/abs/2501.12948).

Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, et al. The llama 3 herd of models. arXiv e-prints, pages arXiv–2407, 2024.

Sachin Goyal, David Lopez-Paz, and Kartik Ahuja. Distilled pretraining: A modern lens of data, in-context learning and test-time scaling, 2025. URL [https://arxiv.org/abs/2509.01649](https://arxiv.org/abs/2509.01649).

Shangmin Guo, Biao Zhang, Tianlin Liu, Tianqi Liu, Misha Khalman, Felipe Llinares, Alexandre Rame, Thomas Mesnard, Yao Zhao, Bilal Piot, Johan Ferret, and Mathieu Blondel. Direct language model alignment from online ai feedback, 2024. URL [https://arxiv.org/abs/2402.04792](https://arxiv.org/abs/2402.04792).

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv:2009.03300, 2020.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv:2403.07974, 2024.

Mandar Joshi, Eunsol Choi, Daniel S Weld, and Luke Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. arXiv preprint arXiv:1705.03551, 2017.

Aishwarya Kamath, Johan Ferret, Shreya Pathak, et al. Gemma 3 technical report, 2025. URL [https://arxiv.org/abs/2503.19786](https://arxiv.org/abs/2503.19786).

Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, et al. Natural questions: a benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:453–466, 2019.

Guokun Lai, Qizhe Xie, Hanxiao Liu, Yiming Yang, and Eduard Hovy. Race: Large-scale reading comprehension dataset from examinations. In Proceedings of the 2017 Conference on Empirical Methods in Natural Language Processing, pages 785–794, 2017.

<!-- page 13 of 14 -->

Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Tianhao Wu, Banghua Zhu, Joseph E Gonzalez, and Ion Stoica. From crowdsourced data to high-quality benchmarks: Arena-hard and benchbuilder pipeline. arXiv preprint arXiv:2406.11939, 2024.

Bill Yuchen Lin, Yuntian Deng, Khyathi Chandu, Faeze Brahman, Abhilasha Ravichander, Valentina Pyatkin, Nouha Dziri, Ronan Le Bras, and Yejin Choi. Wildbench: Benchmarking llms with challenging tasks from real users in the wild. arXiv preprint arXiv:2406.04770, 2024.

Zihan Liu, Zijian Wang, Yue Zhang, Jianing Wang, Jian Tang, Xiang He, and Xiangyu Zhang. Phybench: Holistic evaluation of physical perception and reasoning in large language models. arXiv preprint arXiv:2504.16074, 2025.

Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. In International Conference on Learning Representations (ICLR), 2024.

MetaAI. The llama 4 herd: The beginning of a new era of natively multimodal ai innovation. [https://ai.meta.com/blog/llama-4-multimodal-intelligence/](https://ai.meta.com/blog/llama-4-multimodal-intelligence/), 2025.

Saurav Muralidharan, Sharath Turuvekere Sreenivas, Raviraj Joshi, Marcin Chochowski, Mostofa Patwary, Mohammad Shoeybi, Bryan Catanzaro, Jan Kautz, and Pavlo Molchanov. Compact language models via pruning and knowledge distillation. arXiv preprint arXiv:2407.14679, 2024.

Ken M Nakanishi. Scalable-softmax is superior for attention. arXiv preprint arXiv:2501.19399, 2025.

Long Ouyang, Jeffrey Wu, Xu Jiang, Diogo Almeida, Carroll Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, et al. Training language models to follow instructions with human feedback. Advances in neural information processing systems, 35:27730–27744, 2022.

Samuel J. Paech. Eq-bench: An emotional intelligence benchmark for large language models, 2023.

Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. Yarn: Efficient context window extension of large language models. arXiv preprint arXiv:2309.00071, 2023.

Aryo Perez, Tomasz Stanislawek, Andrzej Pohl, Kamil Dwojak, Dawid Jurkiewicz, Piotr Kobus, and Tomasz Trzcinski. Are we done with mmlu? arXiv preprint arXiv:2406.04127, 2024.

Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D. Manning, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. arXiv preprint arXiv:2305.18290, 2023.

Abhinav Rastogi, Albert Q. Jiang, Andy Lo, Gabrielle Berrada, Guillaume Lample, et al. Magistral. arXiv preprint arXiv:2506.10910, 2025.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An adversarial winograd schema challenge at scale. Communications of the ACM, 64(9):99–106, 2021.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models, 2024. URL [https://arxiv.org/abs/2402.03300](https://arxiv.org/abs/2402.03300).

Noam Shazeer. Glu variants improve transformer. arXiv preprint arXiv:2002.05202, 2020.

> **停一下:** 参考文献里有哪些正文文字没引用?
> Paech [2023] 的 EQ-bench, Sakaguchi 等 [2021] 的 Winogrande, 以及第 14 页 Zellers 等 [2019] 的 HellaSwag, 正文文字里都没有引用, 只对应图 3, 图 4, 图 6 里的基准名. 另外 GRPO 在图 1 引的是 Shao et al. [2024], 第 6 页引的是 DeepSeek-AI et al. [2025], 同一个方法两个出处.

<!-- page 14 of 14 -->

Sharath Turuvekere Sreenivas, Saurav Muralidharan, Raviraj Joshi, Marcin Chochowski, Ameya Sunil Mahabaleshwarkar, Gerald Shen, Jiaqi Zeng, Zijia Chen, Yoshi Suhara, Shizhe Diao, Chenhan Yu, Wei-Chun Chen, Hayley Ross, Oluwatobi Olabiyi, Ashwath Aithal, Oleksii Kuchaiev, Daniel Korzekwa, Pavlo Molchanov, Mostofa Patwary, Mohammad Shoeybi, Jan Kautz, and Bryan Catanzaro. Llm pruning and distillation in practice: The minitron approach. arXiv preprint arXiv:2408.11796, 2024.

Jianlin Su, Yu Lu, Shengfeng Pan, Ahmed Murtadha, Bo Wen, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. arXiv preprint arXiv:2104.09864, 2021.

Mingjie Sun, Zhuang Liu, Anna Bair, and J Zico Kolter. A simple and effective pruning approach for large language models. arXiv preprint arXiv:2306.11695, 2023.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

An Yang et al. Qwen3 technical report, 2025. URL [https://arxiv.org/abs/2505.09388](https://arxiv.org/abs/2505.09388).

Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, Cong Wei, Botao Yu, Ruibin Yuan, Renliang Sun, Ming Yin, Boyuan Zheng, Zhenzhu Yang, Yibo Liu, Wenhao Huang, Huan Sun, Yu Su, and Wenhu Chen. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proceedings of CVPR, 2024.

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence? arXiv preprint arXiv:1905.07830, 2019.

Biao Zhang and Rico Sennrich. Root mean square layer normalization. Advances in Neural Information Processing Systems, 32, 2019.

Wanjun Zhong, Ruixiang Cui, Yiduo Guo, Yaobo Liang, Shuai Lu, Yanlin Wang, Amin Saied, Weizhu Chen, and Nan Duan. Agieval: A human-centric benchmark for evaluating foundation models. arXiv preprint arXiv:2304.06364, 2023.
