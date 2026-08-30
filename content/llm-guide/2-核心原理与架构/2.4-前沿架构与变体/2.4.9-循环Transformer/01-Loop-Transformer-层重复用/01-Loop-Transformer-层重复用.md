---
title: "01 · Loop Transformer：层重复用"
date: 2026-08-31
as_of: 2026-08-31
tags: [Loop Transformer, Universal Transformer, ALBERT, Huginn, DeepLoop, latent thoughts]
math: true
---

# 01 · Loop Transformer：层重复用

普通 Transformer 把深度和参数绑死：一层一套 $W_Q,W_K,W_V,W_O$ 和一套 FFN。想加深，就得再存一套。循环 Transformer 拆的是这条绑带。只存 $K$ 个物理块，同一套（或这 $K$ 套）转 $R$ 轮，展开深度 $N=KR$，参数只按 $K$ 付钱。

卡住的不是「层能不能更深」，是「更深必须更肥」。本篇钉深度维上的重复用：定义、$N=KR$、祖先、常深度可编程、合成推理上的 $k\otimes L$、Huginn 的 sandwich、残差缩放，以及和序列 RNN、CoT、MoE 的分界。多吐 thinking token 的正本在 [4.5](../../../../4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md)。

它**不是** [2.4.4](../../2.4.4-线性RNN与Griffin/2.4.4-线性RNN与Griffin.md) 沿 token 维递推的 RNN/RWKV，**不是** 4.5 里靠加长上下文换算力的 CoT / o1，**不是** [2.4.1](../../2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md) 的专家复用。Universal Transformer、Huginn、DeepLoop 也**不是**同一套超参，后面分开写。

---

## 1. 定义：K 块 × R 轮 = 展开深度 N=KR

先把记号钉死。一个物理块 $\phi_k$ 是标准 Transformer 层：因果自注意力加 FFN，外加残差和 Norm。普通模型有 $L$ 个互不共享的块，前向就是

$$
x_{\ell+1}=\mathrm{Block}(x_{\ell};\theta_{\ell}),\qquad \ell=0,\ldots,L-1. \tag{1}
$$

$\theta_{\ell}$ 各存一份。参数随 $L$ 涨，展开深度也是 $L$。

循环模型只存 $K$ 份物理参数 $\phi_1,\ldots,\phi_K$。第 $r$ 轮按固定顺序把这 $K$ 块再跑一遍：

$$
x^{(r)}_{k}=\mathrm{Block}\bigl(x^{(r)}_{k-1};\phi_{k}\bigr),\qquad
k=1,\ldots,K,\quad r=1,\ldots,R. \tag{2}
$$

一轮结束的输出接下一轮的输入。展开后经过的块次数是

$$
N=KR. \tag{3}
$$

参数只跟 $K$ 走。$R$ 加一，计算图变深，磁盘上的权重文件不变。每个块里还有注意力和 FFN 两个残差子层，展开后的子层访问次数是 $M=2N$。DeepLoop 后文用的就是这个 $M$。

$K=1$ 是「整网一套权重转 $R$ 圈」，Universal Transformer 的默认图像接近这条。$K>1$ 是「一小段栈当循环核」，Huginn 的 $(2,4,2)$ 把 $K=4$ 放在中间。两种都满足式 (3)，不要把 $K=1$ 当成循环的唯一定义。

![](./images/fig-loop-untied-vs-looped.png)

> 图 1：左栏四层四套权重；右栏两个物理块转两轮，展开深度 $N=4$，参数只存 $K=2$。

**图 1 解析**

- 两栏都从上往下走。不要把左栏读成从下往上。
- 左：Layer 1–4 各一种颜色，底下写「4 distinct weight tensors」。一次前向经过 4 层，也存 4 套。
- 右：标题写 $K=2,R=2,N=KR=4$。桃色两次都是 $\phi_1$，绿色两次都是 $\phi_2$。颜色重复就是权重重复。
- 右栏底下「2 stored tensors, reused」对的是参数，不是 FLOPs。右栏算力仍按 $N=4$ 走。
- 图要钉的零点：深度 $N$ 和参数 $K$ 可以脱钩。后面加 $R$、残差爆炸、测试时加循环，都建立在这个脱钩上。

朴素的观点上来说，循环像是「用浅模型假装深模型」。更准确的说法是：表达力沿展开深度走，记忆容量沿独立参数走。Saunshi 后文会把这条缝撕开：合成推理上，循环几乎能追上同 FLOPs 的不循环深网；语言建模的困惑度则仍更吃参数。

---

## 2. 不是序列 RNN，不是 CoT，不是 MoE

三条「不是」必须写进正文，不然后文的 sandwich 和 KV 会对错槽。

**不是沿序列的 RNN。** [2.4.4](../../2.4.4-线性RNN与Griffin/2.4.4-线性RNN与Griffin.md) 的线性 RNN、RWKV、Griffin，状态沿 token 下标 $t$ 走：$h_t=f(h_{t-1},x_t)$。循环 Transformer 的状态沿深度下标 $r$ 走，同一时刻整段序列仍可并行做自注意力。Dehghani et al. (2018) 写得很干脆：Universal Transformer **不是**在序列位置上循环，而是对每个位置的向量表示做连续修订。序列长度 $T$ 可以不动，$R$ 照样加。

**不是多吐 token 的 CoT。** [4.5](../../../../4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md) 的 o1 路线，是把中间步骤写成新 token，上下文变长，KV 变长，注意力二次项跟着涨。循环可以在同一段残差状态上转 $R$ 圈，输出仍是下一个 token。Saunshi et al. (2025) 的定理把 $T$ 步 CoT 嵌进 $T$ 次 loop，那是表达力对照，不是「循环已经等于会写长思维链的模型」。

**不是 MoE。** MoE 稀疏的是**这一 token 激活哪些专家矩阵**。循环稀疏的是**独立参数的份数**，计算并不按专家关掉，而是同一份权重被访问 $R$ 次。Mixture-of-Recursions 后文会借用 Expert-Choice / Token-Choice 这套词，路由的对象是「这个 token 再进几轮」，不是 2.4.1 里的 FFN 专家。

还有第四条，属于写法纪律。不要把 Universal Transformer 的 ACT、Huginn 的 Poisson $r$、DeepLoop 的 $\alpha=(2N)^{1/2}$ 揉成一套可互换超参。共享方式、停机规则、残差缩放，三篇各写各的。

![](./images/fig-loop-not-three.png)

> 图 2：左栏沿深度转同一套块；中栏沿 token 时间步进；右栏把思维写成新 token。三条轴共用「循环」这个词，对象不是同一个。

**图 2 解析**

- 三栏都从上往下。不要把左栏的回边读成序列 RNN。
- 左：隐藏态进共享 $K$ 块栈，虚线回边标 $R$ rounds on DEPTH，底下 $N=KR$。这是本篇的轴。
- 中：三个时间步 $h_t\to h_{t+1}\to h_{t+2}$。状态跟 token 下标走，对应 [2.4.4](../../2.4.4-线性RNN与Griffin/2.4.4-线性RNN与Griffin.md)。
- 右：prompt → thinking tokens → answer。上下文被写长，对应 [4.5](../../../../4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md)。
- 图要钉的零点：深度维重复用、序列递推、多吐 token，三件事不要画成一张流程图。

---

## 3. 祖先：Universal Transformer，以及 ALBERT 的分叉

深度维循环不是 2025 才发明的。公开祖先是 Universal Transformer：一套权重沿深度转，外加按位置的停机。ALBERT 后来把跨层共享做成 BERT 的省参旋钮，但推理时并不把 $R$ 当旋钮拧。两条线共用「权重绑在深度上」，后面的 Huginn 才把加圈写成测试时算力。

### 3.1 深度维循环，外加 ACT

Universal Transformer（Dehghani et al., 2018, [arXiv:1807.03819](https://arxiv.org/abs/1807.03819)）是这条线的公开祖先。编码器从嵌入 $H^0\in\mathbb{R}^{m\times d}$ 出发，每一步对**所有位置并行**做多头自注意力，再过一套跨位置、跨步共享的转移函数，得到 $H^t$。残差、dropout、LayerNorm 包在外面。步数 $T$ 不由序列长度决定，由「每个符号的表示被修订几次」决定。

论文式 (4)(5) 把修订写成

$$
\begin{aligned}
A^{t}&=\mathrm{LayerNorm}\bigl((H^{t-1}+P^{t})+\mathrm{MHSA}(H^{t-1}+P^{t})\bigr),\\
H^{t}&=\mathrm{LayerNorm}\bigl(A^{t}+\mathrm{Transition}(A^{t})\bigr).
\end{aligned} \tag{4}
$$

$P^{t}$ 是位置和下标 $t$ 两套正弦编码的和，式 (6)(7) 把 $\sin(i/\cdot)$ 和 $\sin(t/\cdot)$ 加在同一维上。转移函数二选一：depthwise separable convolution，或按位置的两层 ReLU MLP。$W^Q,W^K,W^V,W^O$ 在步与步之间共享。这就是 $K=1$ 的循环核，外加一个随 $t$ 变的坐标，避免每一步在代数上完全同构。

自适应停机用的是 Graves (2016) 的 Adaptive Computation Time。每个位置自己出停机概率。停了就把状态复制到下一步，直到全体停，或碰到步数上限。这是按位置分配深度，不是按时间步做 RNN。

bAbI 上，需要三个支持事实的任务，平均 ponder time 是 $3.8\pm 2.2$；两个事实 $3.1\pm 1.1$；一个事实 $2.3\pm 0.8$。数字跟着任务难度走，不是一条固定 $R$。LAMBADA 上论文还报过固定 6 / 8 / 9 步和动态停机两套。机器翻译上动态停机略伤分。ACT 不是免费午餐。

解码器共用这套循环。自注意力之后，Query 来自解码器表示，Key / Value 来自编码器终态 $H^T$，再走一遍多头点积。修订仍在深度维，不是沿输出位置做 RNN。

理论侧，论文把 UT 写成某种条件下的 Turing 完备装置。那是「存在一种权重能模拟」，不是「预训练出来的 LLM 已经在跑通用机」。下一节 Giannou 会把这句再说硬一点。

### 3.2 ALBERT：共享省参数，不加推理轮次

ALBERT（Lan et al., 2020, [arXiv:1909.11942](https://arxiv.org/abs/1909.11942)）把跨层共享做成 BERT 的省参旋钮。默认**所有**层参数共享；也可以只共享注意力或只共享 FFN。BERT-large 334M，同宽度的 ALBERT-large 18M，大约 18 倍，训练快约 1.7 倍。

分叉在这里。ALBERT 的 $L$ 在训练和推理里是同一条展开深度。加层要重新训，不是测试时把 $R$ 从 12 拧到 32。论文 Table 13：ALBERT-xxlarge 的 12 层和 24 层，下游 Avg 一样。作者的结论是，全共享之后，没有必要再深过 12 层配置。共享把参数压住了，也把「再加深度还能学到新变换」这条路堵窄了。层与层的 L2 / 余弦在抖，不收敛到 Deep Equilibrium 那种不动点。

一句话：ALBERT 证明「深度维绑权重能瘦身」；Huginn 证明「同一套核可以在测试时多转几圈」。前者几乎不把 $R$ 当推理旋钮，后者把 $r$ 写成测试时算力。两篇都循环，旋钮不是同一个。

---

## 4. 常深度循环当可编程计算机

Giannou et al. (ICML 2023, [arXiv:2301.13196](https://arxiv.org/abs/2301.13196)) 把循环写成一台指令机。输入序列当穿孔卡片：一段指令、一段可读写内存、一段草稿。网络输出接回输入，像 CPU 周期。深度不跟程序行数走，只跟「执行一条指令要几层」走。

论文的单指令是 SUBLEQ 的放宽版 FLEQ：读两个地址，做指定函数，按符号跳转。Table 1 的构造尺寸是硬编码权重，不是训出来的：

| 功能 | 层数 | 头数 |
|------|------|------|
| SUBLEQ（一指令计算机） | 9 | 2 |
| 矩阵求逆 | 13 | 1 |
| 幂迭代 | 13 | 1 |
| 神经网络上的 SGD | 13 | 1 |

非正式定理写的是：存在层数小于 13 的 looped transformer，能模拟通用计算机、计算器、数值线性代数，以及上下文里的 SGD。SUBLEQ 那条更具体：9 层、2 头，宽度 $O(\log n+N)$，$n$ 是程序加内存长度，$N$ 是整数位数。

不要读成「已经等于 GPT」。作者自己打了补丁：这些构造和真实语言模型的训练方式没有相似之处；「GPT-3 内部也许在调子程序」只是猜想。循环给出的是**常深度 + 外循环**这条表达力上界，不是一张训好的通用权重。

没有外循环，层数就得按程序行数堆。有外循环，深度钉在单条指令上，总时间仍随指令条数走。这和「电路深度不能无代价压缩」是同一件事。

---

## 5. Latent thoughts：k 层循环 L 次 ≈ kL 层不循环

Saunshi et al. (2025, [arXiv:2502.17416](https://arxiv.org/abs/2502.17416)) 把循环从「能算」拉到「推理要深度，不一定要那么多独立参数」。记号 $(k\otimes L)$：一个 $k$ 层骨干循环 $L$ 次。参数与 $(k\otimes 1)$ 相同，FLOPs 与 $(kL\otimes 1)$ 相同。

### 5.1 合成任务，数字跟表走

加法（Table 1 左，$n$ 个加数）。基线 $(12\otimes 1)$ 在 $n=8,16,24,32$ 上都是 100.0。一层不循环 $(1\otimes 1)$ 在 $n=32$ 上是 0.0；同一层转 12 次 $(1\otimes 12)$ 是 99.6。两层不循环 $(2\otimes 1)$ 在 $n=32$ 上掉到 38.8；$(2\otimes 6)$ 回到 99.5。三层：$(3\otimes 1)$ 在 $n=32$ 上 60.7，$(3\otimes 4)$ 是 96.6。

$p$-hop induction（Table 1 右，字母表大小 4，序列长 256）。随机猜至少 25%。$(1\otimes 1)$ 在 $p=16/32$ 上是 48.9 / 49.0；$(1\otimes 6)$ 是 99.9 / 99.5。$(2\otimes 1)$ 是 68.8 / 59.4；$(2\otimes 3)$ 是 99.9 / 99.8。

符号 i-GSM（Table 2，模 7，图深度限制 4，随机猜约 14%）。$(8\otimes 1)$ 准确率 73.2。$(1\otimes 8)$ 也是 73.2。$(2\otimes 4)$ 是 73.6，略高于同 FLOPs 的八层不循环。$(1\otimes 1)$ 只有 24.5，$(2\otimes 1)$ 只有 54.0。

这三张表要一起读。循环不是「略好一点」，是浅层不循环在加长问题上塌掉，循环把深度补回来。论文的 Claim 1 说的就是这句话：许多推理问题要深度，不要那么多独立参数。

### 5.2 语言建模：困惑度更差，推理切片更近

同一工作在 Pile 上预训练 250B token，对照 24 层 1B。Table 3：不循环 24 层验证困惑度 7.40，推理原语 47.5，数学应用题 29.3。$(12\otimes 2)$ 困惑度 7.90，更差；数学应用题 34.3，推理原语 51.2，反而超过 24 层基线。$(4\otimes 6)$ 困惑度 8.79，推理原语 56.9；同参的 $(4\otimes 1)$ 推理原语只有 19.4。

闭卷 QA（记事实）上循环补不回参数缺口。开卷 QA 和数学词题上，%Gap 高得多。循环像是把算力拨向「多步组合」，不是拨向「多记一条事实」。

同一张表还有一行 Middle Loop $(4\otimes 1,4,1)$：首尾各 4 层不共享，中间 4 层循环。困惑度 7.81，比 $(12\otimes 2)$ 的 7.90 略好；推理原语 56.5。这已经接近 Huginn 后来写成 sandwich 的切法：两端当 prelude / coda，中间才是循环核。Saunshi 只把这行当作对照，没有展开训练稳定性。

### 5.3 循环可以模拟 T 步 CoT

Theorem 5.4：对固定输入长 $n$、CoT 步数 $m$ 的 $L$ 层不循环 Transformer，存在层数 $L+O(1)$、嵌入维多 $\Omega(\log(n+m))$、头数多常数的 looped transformer，在输入后面拼 $m$ 个占位符、循环 $m$ 次之后，输出与那 $m$ 步 CoT 相同。

直觉是：CoT 相当于每次循环只写出 1 个思维 token；循环可以在一次迭代里改一整段潜状态。这是存在性，不是 Huginn 或 Ouro 已经在发长思维链。

![](./images/fig-loop-latent-vs-cot.png)

> 图 3：上栏 CoT 把 thought token 写入上下文；下栏同一段残差状态转 $R$ 圈，序列长度不变。

**图 3 解析**

- 上栏从左到右：三个输入 token，三个粉色 thought，最后 answer。上下文被写长。
- 「new tokens written into context」标的是 KV 和二次注意力都会涨的那一段。
- 下栏三个 token 停在原处。绿色 shared block $R$ 和残差状态 $s$ 之间有一条回边，标注 loop $\times R$。
- 下栏出口仍是 next-token logits，没有多出来的 thought 格子。
- 图要钉的对照：CoT 花上下文，循环花深度。两条轴可以叠，也可以只开一条。双开算力见第 8 节。

---

## 6. Huginn：sandwich，以及测试时加循环

Geiping et al. (NeurIPS 2025, [arXiv:2502.05171](https://arxiv.org/abs/2502.05171)) 把循环做成可预训练的 decoder-only 语言模型 Huginn。主模型 3.5B 参数，800B token。形状写成三元组 $(l_P,l_R,l_C)=(2,4,2)$，隐宽 $h=5280$。8 个「真」层。循环核转 $r$ 次时，展开深度是

$$
2+4r+2. \tag{5}
$$

$r=32$ 时是 132 层。参数切分：prelude 和头大约 1.5B，循环核 1.5B，绑定的输入嵌入 0.5B。

### 6.1 插槽：哪些层进 loop，输出怎么出

标准块栈被切成三段。Prelude $P$ 把 token 嵌进潜空间，得到 $e=P(x)$。循环核 $R$ 吃当前状态 $s_{i-1}$ 和 $e$，吐 $s_i$。Coda $C$ 把最后状态解回词表。

$$
\begin{aligned}
e&=P(x),\\
s_0&\sim\mathcal{N}(0,\sigma^2 I),\\
s_i&=R(e,s_{i-1}),\qquad i=1,\ldots,r,\\
p&=C(s_r).
\end{aligned} \tag{6}
$$

$e$ **每一步都重新注入**。只在第一步喂一次 $e$，迭代算子对数据不再单调，路径会黏在初值上。适配器 $A:\mathbb{R}^{2h}\to\mathbb{R}^{h}$ 把 $[s;e]$ 拼起来再送进 4 层核；小模型上相加也行，这个尺度上拼接更好。

层内 Norm 不是普通 Pre-LN。论文的 sandwich 是

$$
\begin{aligned}
\hat x_l&=n_2\bigl(x_{l-1}+\mathrm{Attn}(n_1(x_{l-1}))\bigr),\\
x_l&=n_4\bigl(\hat x_l+\mathrm{MLP}(n_3(\hat x_l))\bigr).
\end{aligned} \tag{7}
$$

RoPE base $50000$，MLP 用 gated SiLU，RMSNorm。$n_3$ 按作者自己的话说技术上多余，主模型仍留着。第一次大规模训练如果改回普通 Pre-LN、又把学习率开到 $4\times 10^{-4}$，会出现 token 相关冲到 1、或学会忽略 $s$、加 $r$ 也不降困惑度。主运行把学习率收到 $4\times 10^{-5}$，并保住 sandwich。

训练时 $r$ 从对数正态 Poisson 抽样，均值 $\bar r=32$。反向只穿过最后 $k=8$ 次，内存不随 $r$ 涨，类似深度维上的截断 BPTT。Prelude 每步都注入 $e$，仍能收到梯度。

![](./images/fig-loop-huginn-sandwich.png)

> 图 4：token 经 prelude 得 $e$，适配器拼接 $s$ 与 $e$，4 层核循环 $r$ 次，coda 出 logits。

**图 4 解析**

- 自上而下：tokens $x$ → Prelude $P$（2 层）→ $e=P(x)$ → Adapter → Recurrent core $R$（4 层）→ $s_i$ → Coda $C$（2 层）→ $p=C(s_r)$。
- 左侧 $s_0\sim\mathcal{N}(0,\sigma^2)$ 只在第一步进适配器。后面的 $s$ 来自核的输出。
- 右侧回边：$s_i=R(e,s_{i-1})$，转 $r$ 次。这是深度维反馈，不是序列维 RNN。
- $e$ 写在 prelude 出口上，并注明 injected every step。核每转一圈都还能看见输入嵌入。
- 页脚 shape $(2,4,2)$、8 stored layers、unfold $2+4r+2$，对应式 (5)。

### 6.2 「相当于 50B」这句话的原文口径

摘要写：模型可以在推理基准上提升，有时很明显，**直到计算负载相当于 50B 参数**。正文更长：预训练时嚼掉的 FLOPs 接近一台 32B 固定深度 Transformer；测试时加循环，可以一直涨到 **与标准 50B 固定深度 Transformer 相当的 FLOP 预算**。

不要读成「3.5B 等于 50B 参数的模型」。参数仍是 3.5B。变的是展开深度和 FLOPs。记事实的容量和 50B 稠密模型不是一回事。Ouro 后文也测过：循环几乎不增加每参数的知识存储（大约 2 bit），增益来自知识组合。

公开评测表（800B token，lm-eval）随 $r$ 涨：

| $r$ | ARC-E | ARC-C | HellaSwag | MMLU | OBQA |
|-----|-------|-------|-----------|------|------|
| 4 | 49.07 | 27.99 | 43.46 | 23.39 | 28.20 |
| 8 | 65.11 | 35.15 | 58.54 | 25.29 | 35.40 |
| 16 | 69.49 | 37.71 | 64.67 | 31.25 | 37.60 |
| 32 | 69.91 | 38.23 | 65.21 | 31.38 | 38.80 |

ARC-E 从 $r=4$ 的 49.07 到 $r=32$ 的 69.91。$r=16$ 之后多数项只剩小数点。加循环不是单调无限涨。Table 2：带系统提示、$r=32$ 的 GSM8K CoT 是 34.80 / 42.08（strict / flexible）。Table 4：同一套数据训到 180B token 时，固定深度对照的 GSM8K CoT 只有 1.82 / 2.20，循环核 $r=32$ 已经是 9.02 / 10.24；$r=1$ 评 800B 检查点，GSM8K 是 0.00。OpenBookQA 一类题更早收敛，GSM8k 一类更吃额外圈数。这是论文 Figure 1 的定性结论，不是「所有基准都随 $r$ 线性涨」。EMA 再把 $r=64$ 的 GSM8K flexible 收到 47.23%（strict 38.59%）。

### 6.3 KV：论文怎么说

循环核共用一套 $W_K,W_V$。不同 $r$ 写出来的 KV，投影矩阵相同，论文称为「match」。

逐 token 早停时，后面的 token 可能对着「还没算到那么深」的历史 KV。Huginn 的做法是：attend **缓存里最后、也最深的那份** KV，不回头补算缺失深度。Remark 6.1 写的就是这条。

另一条是零样本 KV 共享。给循环核设预算 $k$，第 $i$ 步读写槽 $i\bmod k$。第 17 步覆盖第 1 步。MTBench 上预算 4 的分数是 5.86，和标准设置同一附录表，作者说没有掉下去。

Prelude / coda 是独立层，按常规各写各的 KV。论文没有把「prelude 的 KV 是否与循环核混用」写成一条独立实验。[OM-FREEPLAY] 未写明处按「三段各用各的投影，循环核内部才做 match / $i\bmod k$」理解，不要发明第四种共享。

循环核还可以当自带的草稿模型。少跑 $N$ 圈起草下一段 token，再用 $M>N$ 圈验收。草稿阶段算过的状态能留下，验收不用从零开始。这是论文第 6 节的 (self)-speculative decoding，不另训草稿头，也不靠跳层去凑草稿质量。

---

## 7. 残差不稳：Fully Looped 与 DeepLoop

循环把计算图拉深，残差主干会先出问题。两条近期工作处理的是**残差缩放和接线**，不是新的注意力核。残差本身见 [2.1.3](../../../2.1-深度学习基础组件/2.1.3-残差连接/2.1.3-残差连接.md)。

### 7.1 Fully Looped：残差爆炸，梯度振荡

*Simply Stabilizing the Loop via Fully Looped Transformer*（[arXiv:2605.18797](https://arxiv.org/abs/2605.18797)）对照写了两档：Small 127M、6 层；Base 318M、12 层。诊断窗口是前 2000 步。两种病：早期梯度振荡；循环次数高时残差范数持续变大。12 圈的普通 LT 会塌：损失停在高平台，残差范数还在爬。9 圈不一定塌，但训练损失已经明显高于 6 圈。Base 档原 LT 在 9 圈直接标成塌、没有评测分。

Fully Looped Architecture 改接线。普通 LT 上一圈的输出只进下一圈的**第一层**。后面的层要穿过一长串变换才看得到循环状态。FLA 让上一圈输出 $h_L^{(t-1)}$ 对当前圈**每一层**可见：

$$
h_l^{(t)}=f_\theta^{(l)}\bigl(h_{l-1}^{(t)},\,h_L^{(t-1)}\bigr). \tag{8}
$$

Attention Injection 规定怎么融合。第一圈 $t=1$ 仍是普通自注意力。$t>1$ 改成交叉注意力：上一圈末态当 Query，当前层前级输出 $z_l^{(t)}$ 当 Key / Value，投影矩阵还是那套 $W_Q,W_K,W_V$：

$$
a_l^{(t)}=\mathrm{Attention}\bigl(W_Q h_L^{(t-1)},\,W_K z_l^{(t)},\,W_V z_l^{(t)}\bigr). \tag{9}
$$

Softmax 之后，注入量由当前 Value 流决定，上一圈的范数不能直接加进残差。第一层的 $z$ 直接用输入嵌入 $x$，作用接近先前工作里的 Input Injection，但走注意力而不是相加。刻意走 $Q$ 而不是 $K/V$，是为了让 KV 缓存仍按标准注意力写。只做 FLA、把上一圈直接加进残差的 FLTres，在消融里照样塌。

12 圈设定下，除 FLT 以外的对照都塌了。Base 尺寸、6 圈时，FLT 比原 LT 高 4.82 个绝对点，相对约 13.2%。这是下游平均，不是「循环越多一定越好」的许可证。原 LT 在 Base、9 圈已经塌；FLT 在 9 圈平均到 41.72，才继续吃得下加圈。

### 7.2 DeepLoop：按展开深度 N 改 α、β

DeepLoop（[arXiv:2607.13491](https://arxiv.org/abs/2607.13491)）留在 Post-LN DeepNorm 骨架上，只改缩放。DeepNorm 对不绑深度的 $N$ 层、 $M=2N$ 次子层访问，取

$$
\alpha=(2N)^{1/4},\qquad \beta=(8N)^{-1/4}. \tag{10}
$$

$\beta$ 是残差分支矩阵的**初始化增益**，不是前向再乘一次的运行时系数。一阶稳定条件写成 $M(\beta/\alpha)^2=O(1)$。

循环打破「每次访问各有一份独立更新」。同一 $\phi_j$ 被访问 $R$ 次，梯度先按访问求和，再被这 $R$ 次前向读回去。visit-alignment $\kappa_R$ 量的是各轮梯度是否同向，$0\le\kappa_R\le R$。访问近乎正交时 $\kappa_R=O(1)$，回到 DeepNorm 的 $p=1/4$。访问对齐、且 $K$ 固定 $R$ 在涨时，$\kappa_R=\Theta(R)$，指数要从 $1/4$ 提到 $1/2$：

$$
\alpha=(2N)^{1/2},\qquad \beta=(8N)^{-1/2}. \tag{11}
$$

此时 $\beta/\alpha=1/(4N)$。稳定条件改成 $M\kappa_R(\beta/\alpha)^2=O(1)$。$R=1$ 时没有重复访问，谈不上对齐惩罚。论文 Table 1：FineWeb-Edu 50B token、步数 100000。GPT-2 small 骨干上 $R=1$ 的 $\Delta$ 是 $+0.0004$ nats；$R=3/5/7$ 分别是 $-0.0160$、$-0.0231$、$-0.0186$。medium 骨干（隐宽 768→1024，层数 12→24）上 $R=1$ 是 $+0.0011$；$R=7$ 拉到 $-0.0278$。下游八任务平均在 $R=1$ 基本打平，medium 的 1-shot 在 $R=7$ 收到 55.20%。单次种子，论文自己写了还要多 seed 才能定量方差。

![](./images/fig-deeploop-residual-scale.png)

> 图 5：$K=2$ 存一份，展开 $N=6$（$R=3$），$M=12$ 次子层访问；右侧对照 DeepNorm 的 $p=1/4$ 与 DeepLoop 的 $p=1/2$。

**图 5 解析**

- 左栏两个物理块 $\phi_1,\phi_2$，标注 stored once。
- 中栏六格按 $\phi_1,\phi_2$ 交替，对应 $R=3$。桃色始终是 $\phi_1$。
- $M=2N=12$ 数的是注意力和 FFN 两次残差，不是又发明了一层。
- 右栏先写 $x_{i+1}=\mathrm{Norm}(\alpha x_i+f_j)$，再并列两套 $(\alpha,\beta)$。没有假坐标曲线。
- 页脚写明 $\beta$ 是初始化增益。不要把 DeepLoop 读成新注意力公式。

---

## 8. 邻居、整机槽位、失效

循环核插进整机之后，还可以按 token 选深度（MoR），或在预训练里学停机（Ouro）。下面只钉和本篇公式的接口，不把那两篇写成第二份专文。失效表对着前面已经出现过的病：残差、$R$ 加了不动、KV、和 CoT 双花。

### 8.1 Mixture-of-Recursions

Bae et al. (NeurIPS 2025, [arXiv:2507.10524](https://arxiv.org/abs/2507.10524)) 在循环核上加**按 token 的深度路由**。参数共享仍在，但每个 token 不必跑满 $N_r$ 轮。尺度写的是 135M 到 1.7B（这是基座尺寸，MoR 因共享会更瘦）。

共享顺序有 Cycle 和 Sequence，以及保住首尾层、只共享中间层的 Middle 变体。$L=9$、$N_r=3$ 时，Cycle 展开成 $[(0,1,2),(0,1,2),(0,1,2)]$，Sequence 成 $[(0,0,0),(1,1,1),(2,2,2)]$。展开层数相同，访问顺序不同。

路由两套。Expert-Choice：每一深度当一个「专家」，Top-$k$ 留下还要继续转的 token，并且只允许上一轮留下的 token 进入下一轮。Token-Choice：一开始就为每个 token 选定总轮数。为了把两种路由的算力对齐，$N_r=3$ 且负载均匀时，三轮处理的 token 比例写成 $3/3,2/3,1/3$。Expert-Choice 的 $k$ 按这个分数递降。KV 也有两套：recursion-wise 只缓存本轮仍活跃的 token；recursive sharing 在第一轮缓存全部，后面轮次复用。这和 Huginn 的 $i\bmod k$ 不是同一条实现，不要混用符号。

MoR 借用了 MoE 的词，对象仍是「这个 token 再进几轮循环核」。专家矩阵那条轴还在 2.4.1。

### 8.2 Ouro

一手在 Zhu et al. (2025, [arXiv:2510.25741](https://arxiv.org/abs/2510.25741))。Ouro 是预训练的 LoopLM：共享栈反复套，潜空间迭代，熵正则学深度分配，语料 7.7T token。Table 2：Ouro 1.4B 为 24 层、隐宽 2048；Ouro 2.6B 为 48 层、隐宽 2048；注意力 MHA，FFN 为 SwiGLU，位置为 RoPE，词表 49152。公开材料把默认循环步数写成 4（R4）。

摘要说 1.4B / 2.6B「match the results of up to 12B SOTA LLMs」。正文 Figure 2 把 Thinking 变体写成：1.4B-Thinking R4 和 4B 可比，2.6B-Thinking R4 对齐或超过 8B。两套口径都出自同一篇，不要只留「等于 12B」或只留「等于 4B/8B」。受控实验的结论是：循环几乎不增加知识存储（looped / 非 looped 都大约 2 bit/参数），增益在事实组合和多跳。

早停用退出门加均匀先验上的熵正则，避免塌到总用 $T_{\max}$。这和 UT 的 ACT、Huginn 的 Poisson $r$ 是三条停机设计，超参不能对搬。

### 8.3 失效

| 现象 | 原因 | 说明 |
|------|------|------|
| 残差爆炸 / 训练塌 | 展开深度变大，残差每圈轻微放大，或梯度在共享块上振荡 | 12 圈普通 LT 会塌（2605.18797）。DeepNorm 的 $p=1/4$ 在访问对齐时不够 |
| $R$ 加了，分数不动 | 模型学会忽略状态 $s$，或任务根本不吃深度 | Huginn 失败 run 2：1 圈和 32 圈验证困惑度一样。Table 上 $r=16\to 32$ 多数项只剩小数点 |
| KV 重复或对不齐 | 早停造成缺失槽；或循环核每步各写一份，显存按 $r$ 涨 | Huginn：看最深可用槽，或 $i\bmod k$。MoR 另有 recursion-wise / sharing。未写明的混用不要编 |
| 与 CoT 双花算力 | 潜空间已经转了 $R$ 圈，外面再吐一长串 thought | 两条轴正交，不是自动互补。预算要分开算 |
| 共享当测试旋钮 | 把 ALBERT 式全共享理解成「推理时随便加 $R$」 | ALBERT-xxlarge 12 层和 24 层 Avg 一样。加深度要另训，或像 Huginn 那样在训练里就抽样 $r$ |
| 记事实不涨 | 循环几乎不增加每参数知识容量 | Saunshi 闭卷 QA 补不回参数缺口；Ouro 约 2 bit/参数 |

整机里循环核通常插在中段。Prelude 负责把子词嵌成可迭代的概念，coda 负责解回词表，中间那 $K$ 层才是可以加 $R$ 的核。不要把 embedding 和 LM head 也圈进共享循环，除非论文写明（ALBERT 的 embedding 分解是另一件事，不是循环核）。

没有两全。省参数就在 $K$ 上付钱，要深度就在 $R$ 上付钱，要稳就在残差缩放或 Attention Injection 上付钱。循环不是把三笔账合成一笔。

## 参考文献

1. Dehghani, M., Gouws, S., Vinyals, O., Uszkoreit, J., & Kaiser, Ł. (2018). [Universal Transformers](https://arxiv.org/abs/1807.03819). *ICLR 2019*.
2. Lan, Z., Chen, M., Goodman, S., Gimpel, K., Sharma, P., & Soricut, R. (2020). [ALBERT: A Lite BERT for Self-supervised Learning of Language Representations](https://arxiv.org/abs/1909.11942). *ICLR 2020*.
3. Giannou, A., Rajput, S., Sohn, J., et al. (2023). [Looped Transformers as Programmable Computers](https://arxiv.org/abs/2301.13196). *ICML 2023*.
4. Saunshi, N., et al. (2025). [Reasoning with Latent Thoughts: On the Power of Looped Transformers](https://arxiv.org/abs/2502.17416).
5. Geiping, J., et al. (2025). [Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach](https://arxiv.org/abs/2502.05171). *NeurIPS 2025*.
6. Bae, S., Kim, Y., Bayat, R., et al. (2025). [Mixture-of-Recursions: Learning Dynamic Recursive Depths for Adaptive Token-Level Computation](https://arxiv.org/abs/2507.10524). *NeurIPS 2025*.
7. Zhu, R.-J., et al. (2025). [Scaling Latent Reasoning via Looped Language Models](https://arxiv.org/abs/2510.25741).
8. [Simply Stabilizing the Loop via Fully Looped Transformer](https://arxiv.org/abs/2605.18797) (2026).
9. Li, S., Zhang, Y., Guo, J., Gu, Q., & Wang, M. (2026). [DeepLoop: Depth Scaling for Looped Transformers](https://arxiv.org/abs/2607.13491).
