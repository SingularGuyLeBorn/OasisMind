---
title: "01 · LLM-JEPA:联合嵌入预测,不是下一 token"
date: 2026-08-30
as_of: 2026-08-30
tags: [JEPA, LLM-JEPA, 表示学习, 联合嵌入]
---

# LLM-JEPA:预测的是另一视图的表示,不是下一个 token

MTP([2.4.6](./2.4.6-多Token预测MTP深度解析.md))仍在词表上做交叉熵.JEPA(Joint Embedding Predictive Architecture)在 **嵌入空间** 里让一个视图预测另一个视图.LLM-JEPA(Huang, LeCun, Balestriero, [arXiv:2509.14252](https://arxiv.org/abs/2509.14252))把这件事接到生成式 LLM 上:**保留 $\mathcal{L}_{\mathrm{LLM}}$,再加一项表示预测**.它不是 BERT 式 span masking 的换皮.

典型视图:自然语言描述 vs 正则 / SQL / 代码 diff--同一件知识的两种写法,不是「把句子遮掉 30% 再回归隐状态」.

![左:Text 经 Enc 再 Pred;右:Code 经 Enc.余弦对齐表示.叉掉词表 softmax:那不是 MTP](./images/redrawn-fig-jepa-predict-repr.png)

> 图 1:论文式 (2) 的示意.生成能力仍靠 $\mathcal{L}_{\mathrm{LLM}}$;JEPA 项在嵌入空间.

**图 1 解析**

- 两个视图各自编码;预测器把 $Enc(\mathrm{Text})$ 映射到 $Enc(\mathrm{Code})$ 所在空间.
- 距离用余弦(论文默认);消融里 $\ell_2$ 会垮,MSE 尚可,InfoNCE 更差(Table 3).
- 底下划掉的 token softmax 是在说:**这条 JEPA 支路不是 MTP**.总损失里生成项仍然在.

## 1. 损失:生成 + 嵌入预测

论文式 (1) 是普通 next-token 交叉熵 $\mathcal{L}_{\mathrm{LLM}}$.式 (2):

$$
\mathcal{L}_{\mathrm{LLM\text{-}JEPA}}
=\sum_{\ell=2}^{L}\mathcal{L}_{\mathrm{LLM}}(\mathrm{Text}_{1:\ell-1},\mathrm{Text}_\ell)
+\lambda\, d\bigl(\mathrm{Pred}(\mathrm{Enc}(\mathrm{Text})),\,\mathrm{Enc}(\mathrm{Code})\bigr). \tag{1}
$$

$Enc$ 取 **最后一层,最后一个 token** 的隐状态(常见 probing 做法).$Pred$:在输入末尾追加 $k$ 个 `[PRED]` token,用最后一个的嵌入当 $\mathrm{Pred}(\mathrm{Enc}(\cdot))$;$k=0$ 时预测器是恒等.两个视图打进同一上下文窗口,用分块因果 mask 让它们 **互不看见**,从而一次(相对朴素三次)前向拿到两边表示.

## 2. 为什么还要加这一项

论文 Figure 3:只训 $\mathcal{L}_{\mathrm{LLM}}$ **并不会** 顺带把 JEPA 距离压下去;加上 JEPA 项之后,next-token 损失曲线几乎重叠,准确率却上去.NL-RX-SYNTH 上 Llama-3.2-1B-Instruct 微调:基线约 $57.29\pm 5.32$,LLM-JEPA 约 $71.46\pm 1.34$(Table 3 同设置).预训练从随机初始化:同一数据上 $54.38\pm 1.70$ → $60.59\pm 1.01$(Table 2).这些是论文表,不是本库复现.

表示上:JEPA 把 $Enc(\mathrm{Text})-Enc(\mathrm{Code})$ 的奇异值压低,t-SNE 出现成对结构;普通 NTP 微调反而把结构打散(Figure 4).

## 3. 和 I-JEPA,对比学习,MTP 的边界

| | LLM-JEPA | 不是 |
|--|----------|------|
| 目标 | 视图 A 的表示预测视图 B | 下一 token(MTP) |
| 视图 | 数据集里成对的 Text/Code(或 paraphrase 链) | 随机 span mask 当第二视图--论文没这么做 |
| 坍塌 | 靠预测任务 + tied 预测器;消融里 InfoNCE 更差 | 必须上 EMA teacher 才能跑--那是 I-JEPA / BYOL 谱系,本篇公式没有 Target Encoder EMA |
| 代价 | 训练要多拿一边表示(约额外前向);推理不增加 | 「免费的表示学习」 |

I-JEPA(Assran et al., CVPR 2023)是视觉里预测被遮块的表示,带 EMA 目标编码器.LLM-JEPA 明确说自己是把 **视觉 JEPA 目标接到 LLM**,实现上用 `[PRED]` 和分块 mask,**不是** 把 I-JEPA 的双编码器流程图搬进 Transformer.LeCun 2022 的立场论文给概念,不给 LLM 超参.

没有自然语言里那种「非平凡第二视图」时,论文自己把这当成未解决问题(需要类似视觉 data augmentation 的机制).不要在任意语料上假装已经有 JEPA 预训练配方.

## 4. 失效

- 把 LLM-JEPA 写成 MTP 或多 token 头.
- 用 MSE / $\ell_2$ 替换余弦却还报论文的 71%(Table 3:$\ell_2$ 掉到约 2%).
- 把训练 2–3× 前向开销说成推理延迟.
- 从知乎抄 span masking + EMA 代码当 2509.14252.

## 参考文献

1. Huang, LeCun, Balestriero (2025). *LLM-JEPA*. https://arxiv.org/abs/2509.14252 (式 (1)(2),Table 2–3,Figure 3–4;代码 https://github.com/rbalestr-lab/llm-jepa )
2. Assran et al. (2023). I-JEPA. CVPR. 概念对照,不是本篇实现
3. MTP:[2.4.6](./2.4.6-多Token预测MTP深度解析.md)

