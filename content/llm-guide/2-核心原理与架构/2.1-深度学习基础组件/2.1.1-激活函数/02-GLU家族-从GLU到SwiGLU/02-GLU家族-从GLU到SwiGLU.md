---
title: "02 · GLU 家族: 从 GLU 到 SwiGLU"
published: true
tags: ["GLU", "Bilinear", "ReGLU", "GEGLU", "SwiGLU", "FFN", "T5", "Shazeer"]
excerpt: "GLU 把 FFN 的第一层换成两个并列投影, 一路过激活当门, 一路保持线性, 逐坐标相乘. Shazeer 在 T5-base 上把门换成 ReLU, GELU, Swish, 内层宽度乘 2/3 保持参数量不变, 得到 ReGLU, GEGLU, SwiGLU, log-perplexity 比单路 FFN 低约 0.04. 本文推导门控为什么改变梯度路径和表达形式, 给出 Shazeer 的完整实验表, 以及参数配平和实现上的细节."
---
# 02 GLU 家族: 从 GLU 到 SwiGLU

现在主流的开源大模型, 从 Llama 到 Qwen3, DeepSeek-V3, Kimi K2, FFN 几乎都是 SwiGLU. 这个结构的论文只有四页, 作者在结论里说不解释它为什么有效. 本文回答四个问题:

1. GLU 最初为什么被提出, 它在梯度上和 Tanh, ReLU 有什么不同.
2. Shazeer 的几种变体怎样定义, 参数量怎样配平.
3. 门控在表达形式上改变了什么, 为什么不加激活的 Bilinear 也能工作.
4. 实验数字是多少, 实现时要注意什么.

单路激活函数 (ReLU, GELU, SiLU) 的性质见 [2.1.1 激活函数](../2.1.1-激活函数.md); FFN 的整体结构见 [2.1.5 前馈网络 FFN](../../2.1.5-前馈网络FFN/2.1.5-前馈网络FFN.md).

---

## 1. 从两矩阵 FFN 到 GLU

### 1.1 起点: 两矩阵 FFN

Transformer 的 FFN 对每个位置的隐藏向量 $x$ (行向量) 做两次线性变换, 中间夹 ReLU. Shazeer (2020) 的式 (1):

$$
\mathrm{FFN}(x,W_1,W_2,b_1,b_2)=\max(0,\,xW_1+b_1)\,W_2+b_2
\tag{1}
$$

论文沿用 T5 代码库的写法去掉偏置 (式 (2)):

$$
\mathrm{FFN}_{\mathrm{ReLU}}(x,W_1,W_2)=\max(xW_1,0)\,W_2
\tag{2}
$$

把 ReLU 换成 GELU 或 $\mathrm{Swish}_1$ (即 SiLU) 得到 $\mathrm{FFN}_{\mathrm{GELU}}$ 和 $\mathrm{FFN}_{\mathrm{Swish}}$ (Shazeer 式 (3)). 这三种都是两个矩阵, 一条激活路径.

实验用的是 T5-base: encoder 和 decoder 各 12 层, $d_{\text{model}}=768$, 注意力 $h=12$, $d_k=d_v=64$, FFN 内层 $d_{ff}=3072$. $W_1\in\mathbb{R}^{768\times3072}$, $W_2\in\mathbb{R}^{3072\times768}$, 每个 FFN 层 $2\times768\times3072=4{,}718{,}592$ 个参数.

FFN 在一层里占多少参数, 可以和注意力比一下. 注意力的 $Q, K, V$ 和输出投影是四个 $d\times d$ 矩阵 (多头只是把 $d$ 切成 $h$ 份, 总量不变), 共 $4d^2$; $d_{ff}=4d$ 的 FFN 是 $8d^2$. 代入 T5-base 可得注意力 $4\times768^2\approx2.36\times10^6$, FFN 约 $4.72\times10^6$, FFN 占一层参数的三分之二. 改 FFN 的结构, 改的是模型大部分的参数.

---

### 1.2 Dauphin 的 GLU: 给梯度留一条线性路径

Dauphin et al. (2017) 做的是卷积语言模型. 每层的输出是一个线性投影被另一个投影的 Sigmoid 逐元素调制 (原文式 (1)):

$$
h(X)=(X\ast W+b)\otimes\sigma(X\ast V+c)
\tag{3}
$$

$\ast$ 是卷积, $\otimes$ 是逐元素乘. 他们称之为 Gated Linear Unit. LSTM 用输入门和遗忘门控制一个独立的记忆单元, 让信息能沿很多个时间步传下去. GLU 与它不同, 只有输出门, 没有输入门和遗忘门; 作者的理由是卷积网络不像循环网络那样沿时间步反复变换, 实验里也不需要遗忘门.

### 1.3 梯度对比

同期 Oord et al. 用过一种 LSTM 风格的门 $\tanh(X\ast W+b)\otimes\sigma(X\ast V+c)$, Dauphin 称之为 GTU. 两者的梯度 (原文式 (2), (3), 记号简化为两路共用 $X$):

$$
\nabla\bigl[\tanh(X)\otimes\sigma(X)\bigr]=\tanh'(X)\nabla X\otimes\sigma(X)+\sigma'(X)\nabla X\otimes\tanh(X)
\tag{4}
$$

$$
\nabla\bigl[X\otimes\sigma(X)\bigr]=\nabla X\otimes\sigma(X)+X\otimes\sigma'(X)\nabla X
\tag{5}
$$

式 (4) 的两项都带着 $\tanh'$ 或 $\sigma'$, 这两个导数分别不超过 1 和 $1/4$, 层数一多梯度逐渐消失. 式 (5) 的第一项 $\nabla X\otimes\sigma(X)$ 不含任何导数, 门打开时 ($\sigma\approx1$) 梯度原样通过. 作者把它看成一种乘性的跳连.

代入 $X=2$ 可得: 式 (4) 的系数是 $\tanh'(2)\sigma(2)+\sigma'(2)\tanh(2)\approx0.0707\times0.881+0.105\times0.964\approx0.164$; 式 (5) 的系数是 $\sigma(2)+2\sigma'(2)\approx0.881+0.210\approx1.091$. 代入 $X=4$, 前者降到约 0.019, 后者约 1.053. 若每层都乘上 $X=2$ 时的系数, 10 层之后 GTU 剩 $0.164^{10}\approx1.4\times10^{-8}$, GLU 不衰减. 实际网络里每层的 $X$ 不同, 还有权重矩阵参与, 这个连乘只说明激活函数这一项的趋势.

### 1.4 Dauphin 的实验结论

在 WikiText-103 上, GLU 收敛到的 perplexity 低于 GTU, ReLU, Tanh. 作者的解读: ReLU 和 GLU 都有让梯度通过激活单元的线性路径, 所以收敛都快; Tanh 和 GTU 没有, 因而受梯度消失影响, GTU 里输入和门都可能在饱和时切断梯度. ReLU 可以看成 $X\otimes(X>0)$, 门由输入的符号决定, GLU 仍然比它好. 在 Google Billion Word 上, 100 小时的固定训练时间内 GLU 和 ReLU 相差约 5 个 perplexity.

和循环网络的整体对比也在同一篇论文里. WikiText-103 上, 14 层的 GCNN 测试 perplexity 是 37.2, 8 层是 44.9, 作为对照的 LSTM-1024 是 48.7; Google Billion Word 上, 单卡训练的 GCNN-13 是 38.1, 同为单卡训练的两层 LSTM-2048 是 39.8. 卷积没有沿时间步的串行依赖, 一个句子里所有位置可以并行算, 作者据此强调它的延迟低于循环网络. 这组对比里 GLU 只是其中一个部件, 分数差不能全算在门控头上.

他们还比较了非线性的程度: 纯线性的卷积网络, 去掉 Sigmoid 的 Bilinear 层 $(X\ast W+b)\otimes(X\ast V+c)$ (出自 Mnih & Hinton, 2007), 以及 GLU. 在 Google Billion Word 上, 线性模型的 perplexity 是 115, 比 Kneser-Ney 5-gram 的 67.6 还差; Bilinear 降到 61, 比线性好 40 多; GLU 在此基础上再好约 20. 只是两路相乘, 不加任何激活函数, 就带来了大部分的提升. 第 3 节会从表达形式解释这一点.

这些结果是在一个和 Transformer 很不一样的模型上得到的: 每个 GLU 层外面包着 pre-activation 残差块, 块内是最多 5 层的瓶颈结构, 输出层用 adaptive softmax. 训练上用了 weight normalization 和梯度裁剪, 作者报告 weight normalization 让收敛快了两倍以上, 部分原因是学习率可以从 0.01 提到 1. 所以 Dauphin 的结论只说明门控在卷积语言模型里有效; 它在 Transformer FFN 里是否有效, 要等 Shazeer 的实验.

---

## 2. Shazeer 的变体

### 2.1 定义

Shazeer (2020) 把式 (3) 写成向量形式 (原文式 (4)):

$$
\mathrm{GLU}(x,W,V,b,c)=\sigma(xW+b)\otimes(xV+c),\qquad
\mathrm{Bilinear}(x,W,V,b,c)=(xW+b)\otimes(xV+c)
\tag{6}
$$

注意记号与 Dauphin 不同: 这里过 Sigmoid 的是 $W$ 那一路. 把 Sigmoid 换成其他激活函数, 得到 (原文式 (5)):

$$
\begin{aligned}
\mathrm{ReGLU}(x,W,V,b,c)&=\max(0,\,xW+b)\otimes(xV+c)\\
\mathrm{GEGLU}(x,W,V,b,c)&=\mathrm{GELU}(xW+b)\otimes(xV+c)\\
\mathrm{SwiGLU}(x,W,V,b,c,\beta)&=\mathrm{Swish}_\beta(xW+b)\otimes(xV+c)
\end{aligned}
\tag{7}
$$

### 2.2 放进 FFN

用式 (6), (7) 替换式 (2) 的第一个线性层和激活函数, 去掉偏置, 再接 $W_2$ (原文式 (6)):

$$
\begin{aligned}
\mathrm{FFN}_{\mathrm{GLU}}&=\bigl(\sigma(xW)\otimes xV\bigr)W_2 &
\mathrm{FFN}_{\mathrm{Bilinear}}&=\bigl(xW\otimes xV\bigr)W_2\\
\mathrm{FFN}_{\mathrm{ReGLU}}&=\bigl(\max(0,xW)\otimes xV\bigr)W_2 &
\mathrm{FFN}_{\mathrm{GEGLU}}&=\bigl(\mathrm{GELU}(xW)\otimes xV\bigr)W_2\\
\mathrm{FFN}_{\mathrm{SwiGLU}}&=\bigl(\mathrm{Swish}_1(xW)\otimes xV\bigr)W_2
\end{aligned}
\tag{8}
$$

$W$ 那一路叫门控支路 (实现里常叫 gate), $V$ 那一路叫线性支路 (常叫 up), $W_2$ 是降维 (常叫 down). SwiGLU 固定 $\beta=1$, 门控支路就是 SiLU. 式 (7) 的定义里保留了 $\beta$, 但 Shazeer 的实验和后续主流模型都只用 $\beta=1$; Ramachandran et al. 那种可训练 $\beta$ 的做法没有进入门控 FFN.

### 2.3 与注意力里的门控对照

同样「Sigmoid 门乘线性值」的结构也出现在注意力里. Kimi K3 的 KDA 层输出是 $W_o\bigl[\sigma(W_gx_t)\odot\mathrm{RMSNorm}(\tilde o_t)\bigr]$ (K3 报告式 (6)), 对注意力的输出做逐坐标门控, 形式上就是 GLU, 门的上界是 1. FFN 里流行的却是门无上界的 SwiGLU. 两处的结构差别是: 注意力里被门控的输出先过 RMSNorm, 门的上界是 1; FFN 里两路都是原始投影, SwiGLU 的门没有上界, 也贡献幅度, 因此才有第 3 节的二次型. 注意力输出门控见 [06 Gated Attention](../../../2.2-注意力机制/2.2.2-多头注意力变体/05-Gated-Attention-SDPA输出门控/05-Gated-Attention-SDPA输出门控.md).

---

## 3. 门控改变了什么

### 3.1 输出的符号由线性支路决定

记 $a=xW$, $b=xV$, 第 $i$ 个隐藏单元输出 $h_i=\phi(a_i)\,b_i$. 对单路 FFN, $h_i=\phi(a_i)$, 输出的取值范围就是 $\phi$ 的值域: ReLU 只能非负, GELU 和 SiLU 最小也只到 $-0.17$ 和 $-0.28$. 对门控 FFN, $b_i$ 可正可负, 可大可小, $\phi(a_i)$ 决定放行多少.

代入一组数: $a_i=2$, $b_i=-3$. ReLU 单路只看 $a_i$, 输出 2; SwiGLU 输出 $2\sigma(2)\times(-3)\approx1.762\times(-3)\approx-5.29$. 门控的输出可以取任意符号, 幅度由两路共同决定. 单路 FFN 的 $h$ 之后还要乘 $W_2$, 最终输出的符号可以被 $W_2$ 翻转, 但每个隐藏单元自身的取值范围始终受 $\phi$ 的值域限制.

### 3.2 Bilinear 是二次型

不加激活时, 第 $i$ 个隐藏单元是

$$
h_i=(x\,w_i)(x\,v_i)=x\,\bigl(w_iv_i^{\top}\bigr)\,x^{\top}
\tag{9}
$$

$w_i$, $v_i$ 是 $W$, $V$ 的第 $i$ 列. 这是 $x$ 的一个秩 1 二次型. 式 (2) 的单路 FFN 在激活前对 $x$ 是线性的, 非线性只来自逐坐标的 ReLU 截断; Bilinear 的每个隐藏单元直接计算输入两个方向投影的乘积, 能表示坐标之间的二阶交互. 这解释了 Dauphin 实验里 Bilinear 比线性模型好 40 多个 perplexity, 也解释了下面 Shazeer 的 Table 1 里 Bilinear (1.648) 比 ReLU (1.677) 好.

门控变体在 $a_i$ 很大时 $\phi(a_i)\approx a_i$ (ReLU, GELU, SiLU 都是如此), 退化为式 (9) 的二次型; $a_i$ 为负时, 门把输出压向 0. 所以 ReGLU, GEGLU, SwiGLU 可以看成「带开关的二次型」: 正半轴保留二阶交互, 负半轴关闭.

用一个二维的例子看差别. 设 $x=(x_1,x_2)$, 取 $w_i=(1,1)^{\top}$, $v_i=(1,-1)^{\top}$, 由式 (9) 可得 $h_i=(x_1+x_2)(x_1-x_2)=x_1^2-x_2^2$. 一个 Bilinear 单元就精确算出了这个二次函数. 单路 ReLU 单元只能拼分段线性函数. 以一维的 $x^2$ 在 $[0,1]$ 上为例, 用 $k$ 段等宽的折线插值, 每段长 $1/k$, 最大误差是 $\frac14(1/k)^2$: 要误差小于 0.0025 需要 $k=10$ 段, 也就是十个左右的 ReLU 单元. 表达二阶交互时, 门控结构用的单元数少得多. 这是一个构造性的例子, 说明两种结构擅长的函数不同, 不是对语言模型实际学到的函数的描述.

### 3.3 梯度在两路之间交叉

对 $h_i=\phi(a_i)\,b_i$ 求导:

$$
\frac{\partial h_i}{\partial b_i}=\phi(a_i),\qquad
\frac{\partial h_i}{\partial a_i}=\phi'(a_i)\,b_i
\tag{10}
$$

线性支路的梯度乘的是门的输出值, 不是任何导数, 这正是式 (5) 的第一项. 门控支路的梯度乘的是线性支路的值. 两路的梯度互相以对方的前向值为系数: 门开得越大, 线性支路学得越快; 线性支路的值越大, 门学得越快. 单路 FFN 里一个隐藏单元的梯度只取决于它自己的预激活.

接着第 3.1 节的数代入式 (10): $a_i=2$, $b_i=-3$ 时, $\partial h_i/\partial b_i=\mathrm{SiLU}(2)\approx1.762$; $\mathrm{SiLU}'(2)=\sigma(2)+2\sigma(2)(1-\sigma(2))\approx1.091$, 所以 $\partial h_i/\partial a_i\approx1.091\times(-3)\approx-3.27$. 同样的 $a_i=2$ 放在单路 SiLU FFN 里, 梯度系数只有 1.091. 门控支路收到的梯度被线性支路的值放大了三倍, 符号也由它决定.

式 (10) 还能看出 ReGLU 和 SwiGLU 的一个差别. ReGLU 的门是 ReLU: $a_i<0$ 时 $\phi(a_i)=0$, $\phi'(a_i)=0$, 两个偏导同时为 0, 这个单元在这个 token 上完全不更新, 与单路 ReLU 的 dead ReLU 是同一个问题. 若 $a_i$ 关于 0 对称分布, 每个 token 上约一半的 ReGLU 单元整个停更; 只要换个 token 符号翻过来, 单元还能学, 只有对几乎所有输入都为负的单元才会永久失效. SwiGLU 和 GEGLU 的门在负半轴有小的非零值和非零导数: 代入 $a_i=-2$, SiLU 的值约 $-0.238$, 导数约 $-0.091$, 两路都还能收到梯度. Table 1 里 ReGLU (1.645) 略差于 SwiGLU 和 GEGLU, 但差距只有约 0.01, 不能确定是这个原因.

同一个式子也说明了正半轴的风险. $a_i$, $b_i$ 都大时, $h_i\approx a_ib_i$, 前向按平方增长; 两个偏导分别约为 $a_i$ 和 $b_i$, 反向也没有上界. 这是 [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) 和 [03 PowLU](../03-PowLU-Ling对SwiGLU的稳定化改写/03-PowLU-Ling对SwiGLU的稳定化改写.md) 要处理的问题.

---

## 4. 保参与 Shazeer 的实验

### 4.1 内层宽度乘 $2/3$: 参数量与计算量

式 (8) 的每个变体有三个矩阵 $W, V\in\mathbb{R}^{d\times d_{ff}'}$, $W_2\in\mathbb{R}^{d_{ff}'\times d}$. 要与两矩阵 FFN 的参数量相同:

$$
2\,d\,d_{ff}=3\,d\,d_{ff}'\;\Longrightarrow\;d_{ff}'=\frac23\,d_{ff}
\tag{11}
$$

每个 token 的矩阵乘计算量是参数量的 2 倍 (每个参数一次乘一次加), 所以参数量对齐后计算量也对齐:

$$
2\times3\,d\,d_{ff}'=2\times2\,d\,d_{ff}=4\,d\,d_{ff}
\tag{12}
$$

代入 T5-base 可得: $d_{ff}'=\frac23\times3072=2048$, 参数 $3\times768\times2048=4{,}718{,}592$, 与第 1.1 节的两矩阵 FFN 完全相等. 代入 $d_{ff}=4d$ 可得 $d_{ff}'=8d/3$, 每个 token 计算量 $16d^2$.

Shazeer 的原话是: 为了保持参数量和计算量不变, 与原两矩阵版本比较时, 把隐藏单元数 $d_{ff}$ 乘 $2/3$. 他的结论里还说这些结构没有明显的计算缺点.

### 4.2 后续模型不一定守这个比例

$8d/3$ 是「与 $4d$ 两矩阵 FFN 等参数」的推论, 不是门控结构的要求. 几个公开模型:

- LLaMA (Touvron et al., 2023) 用 SwiGLU 替换 ReLU, 论文写明维度取 $\frac23\cdot4d$, 而不是 PaLM 的 $4d$. 也就是说 PaLM 用 SwiGLU 时没有缩小内层, FFN 是 $3\times d\times4d=12d^2$, 比两矩阵 FFN 的 $8d^2$ 多出一半. 代入 LLaMA-7B 的 $d=4096$ 可得 $\frac83d\approx10922.7$, 不是整数; 转换到 HF 格式的配置里中间维是 11008, 等于向上取整到 256 的倍数 ($256\times43$). 取整的代价很小: 两矩阵 $4d$ FFN 是 $8d^2=134{,}217{,}728$ 个参数, 中间维 11008 的 SwiGLU 是 $3\times4096\times11008=135{,}266{,}304$ 个, 只多 0.8%.
- Llama 3 8B: $d=4096$, 中间维 14336, 比值 3.5, 比 LLaMA-7B 的 11008 宽了三成; FFN 参数 $3\times4096\times14336\approx1.76\times10^8$ 每层.
- Qwen3-4B: $d=2560$, 中间维 9728, 比值 3.8; Qwen3-8B: $d=4096$, 中间维 12288, 比值 3.0 (见各自 `config.json` 的 `hidden_size` 与 `intermediate_size`). 两者都大于 $8/3\approx2.67$.
- Kimi K2 的路由专家: $d=7168$, 每个专家中间维 2048; Kimi K3 的路由专家在 3584 维潜空间里, 中间维 3072 (Kimi K3 报告 Table 1). MoE 专家的中间维由专家数和激活数决定, 与 $8d/3$ 没有关系.

实践里中间维还常被取整到 64 或 256 的倍数, 便于矩阵乘的分块. 所以读模型配置时, 中间维和 $d$ 的比值落在 2.5 到 4 之间都正常.

---

### 4.3 实验设置与预训练结果

与 Raffel et al. 的 T5-base 设置相同: 在 C4 上做 span-filling 预训练 524,288 步; 每个 batch 128 个样本, 每个样本输入 512 个 token, 输出 114 个 token; Adafactor 优化器, 学习率按逆平方根衰减, 最后 10% 的步数线性降到 0. 唯一的改动是预训练不用 dropout, 作者发现这样效果更好. 每一步在 32 核 TPUv2 上约 0.15 秒. 指标是 C4 留出分片上训练目标的 log-perplexity. 每种结构另外用 65,536 步训练 4 次, 估计运行间波动.

Shazeer Table 1 (越低越好, 括号内为 4 次运行的标准差):

| FFN | 65,536 步 | 524,288 步 |
|---|---|---|
| ReLU (基线) | 1.997 (0.005) | 1.677 |
| GELU | 1.983 (0.005) | 1.679 |
| Swish | 1.994 (0.003) | 1.683 |
| GLU | 1.982 (0.006) | 1.663 |
| Bilinear | 1.960 (0.005) | 1.648 |
| GEGLU | 1.942 (0.004) | **1.633** |
| SwiGLU | 1.944 (0.010) | 1.636 |
| ReGLU | 1.953 (0.003) | 1.645 |

从表里可以读出四点:

1. 三种单路 FFN 在 524,288 步时相差不到 0.006, 与运行间标准差 (0.003 到 0.005) 同一量级, 排名不可靠.
2. 门控变体全部好于单路. 最差的 GLU (1.663) 也比最好的单路 ReLU (1.677) 低 0.014.
3. Bilinear 不含任何激活函数, 却比 GLU 好 0.015. Sigmoid 门的上界是 1, 失去了正半轴的线性增长; 这与 Dauphin 实验里 Bilinear 的强表现一致.
4. GEGLU 和 SwiGLU 相差 0.003, 而 SwiGLU 在 65,536 步时的标准差是 0.010, 两者分不出高下. 它们比 ReLU 低约 0.04.
5. 差距不随训练变长而消失. ReLU 与 GEGLU 之差在 65,536 步时是 0.055, 524,288 步时是 0.044; ReLU 与 SwiGLU 之差从 0.053 变成 0.041. 训练长了 8 倍, 差距只缩小约五分之一.

log-perplexity 的 0.044 换成 perplexity 是 $e^{1.677}\approx5.35$ 对 $e^{1.633}\approx5.12$, 低约 4.3%. 这个提升不需要增加任何参数或计算, 只是换了 FFN 的形状.

### 4.4 下游微调结果

每个预训练模型在 SQuAD, GLUE, SuperGLUE 的混合上微调一次, 131,072 步, 学习率 $10^{-3}$, 每步的输入序列合计约 65,536 个 token, dropout 0.1 (加在各层输出, FFN 隐藏层和注意力权重上), 嵌入矩阵固定. 这里和 Raffel et al. 不同, 是在所有任务的混合上只微调一次, 而不是每个任务分别微调. 报告的是开发集上所有 checkpoint 中的最好分数:

| FFN | GLUE 平均 | SuperGLUE 平均 | SQuAD EM | SQuAD F1 |
|---|---|---|---|---|
| ReLU | 83.80 | 72.76 | 83.18 | 90.87 |
| GELU | 83.86 | 72.98 | 83.09 | 90.79 |
| Swish | 83.60 | 72.40 | 83.25 | 90.76 |
| GLU | 84.20 | 73.95 | 82.88 | 90.69 |
| GEGLU | 84.12 | 73.96 | 83.55 | 91.12 |
| Bilinear | 83.79 | 73.81 | **83.82** | 91.06 |
| SwiGLU | 84.36 | **74.56** | 83.42 | 91.03 |
| ReGLU | **84.67** | 73.66 | 83.53 | **91.18** |
| Raffel et al. (2019) | 83.28 | 71.36 | 80.88 | 88.81 |
| Raffel et al. 的标准差 | 0.235 | 0.416 | 0.343 | 0.226 |

最好的分数分散在不同的门控变体上: GLUE 是 ReGLU, SuperGLUE 是 SwiGLU, SQuAD EM 是 Bilinear, F1 是 ReGLU. 作者自己也说结果有噪声, 只能说门控变体在大多数任务上最好. 单次微调, 加上一个标准差 0.2 到 0.4 的量级, 不足以在门控变体之间分出排名. 最后一行 Raffel et al. 的模型与这里的 ReLU 结构相同, 分数明显更低, 作者认为原因是他们在预训练时用了 dropout.

GLUE 的子任务里也有可读的信号. ReGLU 的 CoLA (MCC) 是 56.16, ReLU 是 51.32; GLU 的 RTE 是 84.12, ReLU 是 80.14. 但 CoLA 和 RTE 恰恰是 Raffel et al. 给出的标准差最大的两项 (1.111 和 1.393), 单个子任务的差距更不能当真.

反过来, 看标准差小的子任务更有参考价值. 按 Raffel et al. 的标准差折算 (他们的设置与这里不完全相同, 只能作量级参考):

| 子任务 (标准差) | ReLU | SwiGLU | 差 / 标准差 |
|---|---|---|---|
| MNLI-m 准确率 (0.291) | 85.83 | 86.45 | 2.1 |
| QQP 准确率 (0.070) | 91.75 | 91.87 | 1.7 |
| BoolQ 准确率 (0.365) | 80.15 | 81.19 | 2.8 |
| ReCoRD F1 (0.370) | 73.73 | 75.35 | 4.4 |

这几项上 SwiGLU 都高于 ReLU, 幅度在 1.7 到 4.4 个标准差之间. 与平均分相比, 这组数字更能说明门控在下游任务上确有提升.

还有一点容易忽略: 门控 FFN 的隐藏单元数是 2048, 单路是 3072. 每个门控单元要占 $3d$ 个参数, 单路单元只占 $2d$. 少三分之一的单元, 结果反而更好, 说明提升来自单元的形式, 不是数量.

### 4.5 作者怎么解释

论文结论的原话是: 我们不解释这些结构为什么似乎有效, 把它们的成功和其他一切一样归功于神的恩典 (divine benevolence). 作者确实没有给理论分析. 第 3 节的二次型和梯度交叉是从公式能直接读出的性质, 它们说明门控与单路在结构上不同, 但不能定量预测 0.04 的差距.

实验本身也有范围. 所有结果都来自 T5-base 这一个规模 (encoder-decoder, 约 2.2 亿参数), 一个预训练目标 (span-filling), 一个数据集 (C4). 论文没有做跨规模的对照, 也没有测 decoder-only 的语言模型. PaLM, LLaMA 等 decoder-only 模型后来直接采用了 SwiGLU, 门控结构由此成为大语言模型 FFN 的默认选择. PaLM 论文 (Chowdhery et al., 2022) 给的理由仍是 Shazeer 这组实验: SwiGLU 的 MLP 要做三次矩阵乘而不是两次, 但在计算量对齐 (ReLU 版本相应加宽) 的比较里质量明显更好. PaLM 自己没有重做这个对照, 也没有按 $2/3$ 缩小内层.

---

## 5. 后续采用, 实现与失效模式

### 5.1 后续模型的采用

| 模型 | FFN | 内层宽度 | 出处 |
|---|---|---|---|
| T5-base (原始) | ReLU, 两矩阵 | 3072 ($4d$) | Raffel et al. |
| PaLM | SwiGLU | $4d$, 不缩小 | LLaMA 论文的描述 |
| LLaMA | SwiGLU | $\frac23\cdot4d$ | Touvron et al., 2023 |
| Qwen3-4B / 8B | SwiGLU (`hidden_act: silu`) | 9728 / 12288 | 模型 `config.json` |
| DeepSeek-V3 | SwiGLU (`hidden_act: silu`) | 前 3 层稠密 18432, 路由专家每个 2048 | 模型 `config.json` |
| Kimi K2 | SwiGLU | 每专家 2048 | Kimi K3 报告 Table 1 |
| Kimi K3 | SiTU-GLU | 每专家 3072 | Kimi K3 报告 Table 1 |
| Ling 2.0 | SwiGLU | 256 个路由专家每 token 选 8 个, 另有 1 个共享专家 | Ling 2.0 技术报告 |

DeepSeek-V3 的 $d=7168$, 稠密层中间维 18432, 比值约 2.57, 略小于 $8/3$; 路由专家 256 个, 每 token 选 8 个, 另有 1 个共享专家, 每个专家中间维 2048. 同一个模型里稠密层和专家的宽度相差九倍, 但都用同一种 SwiGLU 结构.

按配置可以估算 SwiGLU 专家占了多少参数. 每个专家是 $3\times7168\times2048\approx4.40\times10^7$ 个参数; 61 层里前 3 层稠密, 其余 58 层每层 257 个专家 (256 路由加 1 共享), 合计约 $58\times257\times4.40\times10^7\approx6.56\times10^{11}$, 也就是约 656B, 占 DeepSeek-V3 公开总参数 671B 的约 98%. 每个 token 每层用 9 个专家, 58 层约 23B, 占激活参数 37B 的六成左右. 门控 FFN 的形状在 MoE 模型里几乎决定了全部参数.

从这张表看, 2023 年以后公开的主流大模型里, 单路 FFN 几乎消失了. 变化发生在两个方向: 一是 FFN 被切成大量小专家, 每个专家仍是 SwiGLU; 二是 K3 这样的模型开始改门控函数本身, 处理低精度训练中的数值范围.

HF 配置里的 `hidden_act: silu` 指门控支路用 SiLU, 结构本身是三矩阵门控, 不是单路 SiLU FFN. 判断一个模型是不是门控 FFN, 要看权重里有没有 `gate_proj` 和 `up_proj` 两个矩阵 (或合并后的 `gate_up_proj`).

---

### 5.2 合并投影与权重布局

```python
import torch
import torch.nn.functional as F

class SwiGLUFFN(torch.nn.Module):
    def __init__(self, d: int, d_ff: int):
        super().__init__()
        self.gate_up = torch.nn.Linear(d, 2 * d_ff, bias=False)  # [W | V]
        self.down = torch.nn.Linear(d_ff, d, bias=False)         # W_2

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        a, b = self.gate_up(x).chunk(2, dim=-1)
        return self.down(F.silu(a) * b)

ffn = SwiGLUFFN(d=768, d_ff=2048)
print(sum(p.numel() for p in ffn.parameters()))  # 4718592
```

$W$ 和 $V$ 合成一个 $d\times2d_{ff}'$ 的矩阵, 一次矩阵乘得到两路, 再切开. 打印的参数量与第 4.1 节手算一致.

合并后两路怎么排是约定, 各家不同. 上面的写法是前一半门控, 后一半线性. gpt-oss 官方实现的 `swiglu` 函数取 `x[..., ::2]` 为门控, `x[..., 1::2]` 为线性, 两路交错存放. 在不同框架之间转换 checkpoint 时, 切错的结果是门控和线性对调, 模型照样能跑, 输出却完全不对.

### 5.3 张量并行与反向要保存什么

Megatron-LM 把 FFN 第一层按列切, 每张卡在本地算激活, 不需要在激活前同步. 门控 FFN 同理, 但 $W$ 和 $V$ 必须按相同的列下标切, 让第 $i$ 个门控单元和第 $i$ 个线性单元在同一张卡上. 若把合并后的 $[W\,|\,V]$ 直接按列平均切成两份, 第一张卡拿到的全是门控, 第二张卡全是线性, 逐坐标相乘就无法在本地完成.

由式 (10), 反向需要 $a$ (算 $\phi(a)$ 和 $\phi'(a)$) 和 $b$, 每个 token 共 $2d_{ff}'$ 个数. 单路 FFN 只需保存一份 $d_{ff}$ 宽的预激活. 代入 $d_{ff}'=\frac23d_{ff}$ 可得门控 FFN 要保存 $\frac43d_{ff}$ 个数, 比单路多三分之一. 参数和计算对齐了, 激活显存没有对齐.

### 5.4 推理时的激活稀疏与逐元素访存

单路 ReLU FFN 有一个推理上的便利: $h_i=0$ 时, $W_2$ 的第 $i$ 行对输出没有贡献, 可以跳过不读. ReGLU 同样如此, 只要 $a_i<0$, $h_i=0$, $V$ 的第 $i$ 列和 $W_2$ 的第 $i$ 行都可以跳过. SwiGLU 的门是 SiLU, 负半轴只是很小, 不是精确的 0, 这种跳过就不再严格成立, 只能按阈值近似. 解码阶段 FFN 的开销主要是读权重, 能跳过多少行直接决定省下多少带宽. 利用激活稀疏加速推理, 以及把 SiLU 模型改回 ReLU 的做法, 见 Mirzadeh et al. (2023).

按第 5.2 节的写法不做融合, 一个 token 要把 $2d_{ff}'$ 个数的 $[a\,|\,b]$ 写回显存, 再读出来算 $\mathrm{SiLU}(a)\odot b$, 写回 $d_{ff}'$ 个数的 $h$, 再读给 $W_2$. 代入 T5-base 的 $d_{ff}'=2048$ 可得: 写 $[a\,|\,b]$ 和读回各 4096 个数, 写 $h$ 和读回各 2048 个数, 共 12,288 次. 把激活和乘法放进第一次矩阵乘的收尾阶段 (epilogue) 完成, 只写出 $h$ 再读回, 降到 4096 次, 省掉三分之二. 逐元素运算本身的计算量与 $3d\,d_{ff}'$ 量级的矩阵乘相比可以忽略, 瓶颈只在访存.

---

### 5.5 失效模式

| 现象 | 原因 | 怎么查 |
|---|---|---|
| 换成 SwiGLU 后参数量多出一半 | 内层宽度没有乘 $2/3$ | 按式 (11) 核算 |
| 转换 checkpoint 后输出乱码, 但不报错 | 门控与线性的拼接 / 交错布局搞错 | 对照原实现, 用一个小输入比较中间张量 |
| 张量并行后结果与单卡不一致 | $W$ 和 $V$ 的切分下标不对应 | 检查每张卡上门控与线性是否一一对应 |
| 把 `hidden_act: silu` 当成单路 SiLU 实现 | 配置名只说门控支路的激活 | 看权重里有没有两个升维矩阵 |
| FP8 训练中 FFN 输出出现离群值, loss 跳高 | 门控乘积正半轴平方增长 | 记录 $a$, $b$, $h$ 的最大值; 改法见 01 和 03 |
| 门控变体之间的小差距当成结论 | 单次微调, 噪声与差距同量级 | 看运行间标准差 |
| 想用 ReLU 稀疏跳过权重, 换成 SwiGLU 后加速消失 | SiLU 门不产生精确的 0 | 见第 5.4 节, 改用 ReGLU 或按阈值近似 |
| 激活显存比预期高 | 门控要存 $a$, $b$ 两份 | 按第 5.3 节估算, 或对 FFN 做重计算 |

---

## 参考文献

1. Shazeer, N. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). *arXiv:2002.05202*. 式 (1) 至 (6), Table 1 至 Table 4, §4 Conclusions.
2. Dauphin, Y. N., Fan, A., Auli, M., & Grangier, D. (2017). [Language Modeling with Gated Convolutional Networks](https://arxiv.org/abs/1612.08083). *ICML*. 式 (1) 至 (3), §5.2, §5.3.
3. Mnih, A., & Hinton, G. (2007). Three New Graphical Models for Statistical Language Modelling. *ICML*. Bilinear 层.
4. Vaswani, A., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS*.
5. Raffel, C., et al. (2020). [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://arxiv.org/abs/1910.10683). *JMLR*. T5-base 配置与运行间标准差.
6. Touvron, H., et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971). *arXiv:2302.13971*. SwiGLU, $\frac23\cdot4d$. 7B 的 HF 格式配置见 [huggyllama/llama-7b](https://huggingface.co/huggyllama/llama-7b/blob/main/config.json).
7. Yang, A., et al. (2025). [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388). *arXiv:2505.09388*. 配置见 [Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B/blob/main/config.json) 与 [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json).
8. Shoeybi, M., et al. (2019). [Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism](https://arxiv.org/abs/1909.08053). *arXiv:1909.08053*.
9. Kimi Team. (2026). [Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653). *arXiv:2607.24653*. Table 1.
10. OpenAI. (2025). [gpt-oss 官方 PyTorch 实现](https://github.com/openai/gpt-oss/blob/main/gpt_oss/torch/model.py). `swiglu` 函数的交错布局.
11. Ling Team. (2025). [Every Activation Boosted: Scaling General Reasoner to 1 Trillion Open Language Foundation](https://arxiv.org/abs/2510.22115). *arXiv:2510.22115*. Ling 2.0 使用 SwiGLU.
12. Mirzadeh, I., et al. (2023). [ReLU Strikes Back: Exploiting Activation Sparsity in Large Language Models](https://arxiv.org/abs/2310.04564). *arXiv:2310.04564*.
13. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). *arXiv:2412.19437*. 671B 总参数, 37B 激活; 配置见 [config.json](https://huggingface.co/deepseek-ai/DeepSeek-V3/blob/main/config.json).
14. Chowdhery, A., et al. (2022). [PaLM: Scaling Language Modeling with Pathways](https://arxiv.org/abs/2204.02311). *arXiv:2204.02311*. §2 SwiGLU.
15. Grattafiori, A., et al. (2024). [The Llama 3 Herd of Models](https://arxiv.org/abs/2407.21783). *arXiv:2407.21783*. 8B 配置见 [config.json](https://huggingface.co/meta-llama/Meta-Llama-3-8B/blob/main/config.json).

---

上一篇: [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) · 下一篇: [03 PowLU](../03-PowLU-Ling对SwiGLU的稳定化改写/03-PowLU-Ling对SwiGLU的稳定化改写.md)
