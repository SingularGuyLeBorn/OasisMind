---
title: "05 · Gemma-2 Logit Soft-Capping"
---

# Gemma-2 Logit Soft-Capping

> **[返回 Index](./05-Gemma-2-Index.md)** · 对应精译：[01-Gemma-2技术报告精译](./01-Gemma-2技术报告精译.md)
> 源：[arXiv:2408.00118](https://arxiv.org/abs/2408.00118) §2 Logit soft-capping；引用 Bello et al., 2016。Index 原列「FP8 混合精度场景」——**报告没有 FP8 消融表**，本节只写论文给出的公式与两个 cap，再说明它 *不能* 单独保证半精度 `exp` 不溢出。

---

## 1 动机：无界 logits 会把 softmax 推到极值

注意力分数和词表 logits 在深层、长序列里容易出现极端值。Softmax 对最大值极其敏感：一个过大的 logit 会把概率质量吸成近似 one-hot，梯度在其它类上接近 0。训练不稳定、推理量化时动态范围失控，往往是同一件事的两端。

Gemma-2 不引入新损失函数，只在 **每个注意力层** 和 **最终层** 把 logits 送进有界函数（论文：*We cap logits (Bello et al., 2016) in each attention layer and the final layer such that the value of the logits stays between $-\mathrm{soft\_cap}$ and $+\mathrm{soft\_cap}$*）。

---

## 2 公式

$$
\mathrm{logits} \leftarrow \mathrm{soft\_cap} \cdot \tanh\bigl(\mathrm{logits}/\mathrm{soft\_cap}\bigr)
$$

性质（直接从 $\tanh$ 来，不必另引用）：

- 输出严格落在 $(-\mathrm{soft\_cap},\,+\mathrm{soft\_cap})$；
- $0$ 附近近似恒等：$\tanh(x)\approx x$，小信号几乎不改；
- 大信号被压扁，梯度是 $\mathrm{sech}^2$，极端峰值处梯度变小——这是软裁剪，不是硬 `clip`。

论文给定的两个超参：

| 位置 | $\mathrm{soft\_cap}$ |
|---|---|
| 自注意力层 | $50.0$ |
| 最终层（词表） | $30.0$ |

注意力 cap 更松：还需要保留位置之间的相对差距。词表 cap 更紧：最终层更关心排序，动态范围可以更小。

![无界 logits 经 tanh 软限制到 ±soft_cap](./images/fig-gemma2-soft-cap.png)

> 图 1：左无界尖峰，中 $\mathrm{soft\_cap}\cdot\tanh(\cdot/\mathrm{soft\_cap})$（图中中间板若只画了 $\tanh(x)$，以本式为准），右压进虚线界。无数值刻度。2026-08 自绘。

---

## 3 和半精度 / FP8：报告没给数字

Index 要的「FP8 混合精度场景」在 2408.00118 **不存在**。不要把后面 Gemma-3 或社区量化博客倒灌进来冒充 Gemma-2 消融。

能从公式推、但不能当成实测的只有这一句：

- 注意力分数被压到 $(-50,50)$ 之后，**峰值被削了**，量化网格不再要覆盖偶然出现的 $10^3$ 级 outliers；
- **这仍不够单独保住 IEEE fp16 的 `exp`**。$\mathrm{e}^{50}\approx 5.2\times 10^{21}$，远超 fp16 最大有限值 $\approx 65504$。稳定实现仍然靠 FlashAttention 一类的 online softmax（对分数减最大值再 $\exp$），或在 cap 之前就把 $QK^\top$ 除过 $\sqrt{d}$。Soft-capping 是附加界，不是数值栈的全部。

最终层 cap $=30$ 对词表 softmax 同样：$\mathrm{e}^{30}$ 在 fp32 安全、在朴素 fp16 仍危险。Serving 路径若在 cap 之后做 softmax，要以 kernel 是否做 max-subtraction 为准。

因此：把 soft-capping 写成「为 FP8 设计的技术」是超论文。它是 Google 内部工程实践（精译也这么标），论文只给函数和两个常数。

---

## 4 失效与误读

- **不是梯度裁剪。** 它改的是前向 logits，不是 $\lVert g\rVert$。和 MuonClip / QK-Clip 不是一条轴。
- **不是温度。** 温度 $T$ 缩放的是 softmax 的锐度且不设硬界；$\tanh$ cap 设硬界且在 0 附近近线性。
- **与蒸馏的关系。** 2B/9B 用教师分布做 KD（见 [蒸馏专文](./05-Gemma-2-Knowledge-Distillation.md)）。教师 logits 若也经过 cap，学生学到的是压缩后的分布；报告没写教师是否 cap。不要默认「蒸馏目标 = 未 cap 的 27B」。
- **实现位置。** HF `Gemma2Config` 的 `attn_logit_softcapping` / `final_logit_softcapping` 应对上 50 / 30。若某推理引擎漏掉注意力 cap、只 cap 最终层，注意力极值仍在。

---

## 5 谱系

- Bello et al., 2016：神经网络里对 logits 做有界变换的早期用法（论文点名）。
- Gemini 系列：精译称内部也用；**Gemma-2 报告没有对比表**，本文不编 Gemini cap 值。

知识库同步位置：本库仅此一份。
