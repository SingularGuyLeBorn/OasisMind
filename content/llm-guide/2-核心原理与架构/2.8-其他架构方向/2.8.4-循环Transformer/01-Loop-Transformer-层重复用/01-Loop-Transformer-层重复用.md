---
title: "01 · Loop Transformer: 层重复用"
published: true
tags: ["Loop Transformer", "Universal Transformer", "ALBERT", "Huginn", "DeepLoop", "latent thoughts"]
excerpt: "普通 Transformer 的深度和参数绑定: 一层一套 W_Q, W_K, W_V, W_O 和一套 FFN. 循环 Transformer 只存 K 个物理块, 同一套块转 R 轮, 展开深度 N=KR."
---
# 01 · Loop Transformer: 层重复用

普通 Transformer 的深度和参数绑定在一起: 一层一套 $W_Q,W_K,W_V,W_O$ 和一套 FFN. 想加深, 就得再存一套. 循环 Transformer 把两者分开: 只存 $K$ 个物理块, 同一套 (或这 $K$ 套) 转 $R$ 轮, 展开深度 $N=KR$, 参数量只取决于 $K$.

要解决的问题是「更深必须更大」. 下文依次讲: 定义与 $N=KR$, 祖先, 常深度可编程, 合成推理上的 $k\otimes L$, Huginn 的 sandwich, 残差缩放, 以及和序列 RNN、CoT、MoE 的区别. 多吐 thinking token 的方法见 [4.8](../../../../4-后训练/4.8-推理与Agent能力/4.8-推理与Agent能力.md). Universal Transformer、Huginn、DeepLoop 的超参各不相同, 后面分开写.

## 1. 定义与位置

### 1.1 K 块 × R 轮 = 展开深度 N=KR

先定义记号. 一个物理块 $\phi_k$ 是标准 Transformer 层: 因果自注意力加 FFN, 外加残差和 Norm. 普通模型有 $L$ 个互不共享的块, 前向就是

$$
x_{\ell+1}=\mathrm{Block}(x_{\ell};\theta_{\ell}),\qquad \ell=0,\ldots,L-1. \tag{1}
$$

$\theta_{\ell}$ 各存一份. 参数随 $L$ 涨, 展开深度也是 $L$.

循环模型只存 $K$ 份物理参数 $\phi_1,\ldots,\phi_K$. 第 $r$ 轮按固定顺序把这 $K$ 块再跑一遍:

$$
x^{(r)}_{k}=\mathrm{Block}\bigl(x^{(r)}_{k-1};\phi_{k}\bigr),\qquad
k=1,\ldots,K,\quad r=1,\ldots,R. \tag{2}
$$

一轮结束的输出接下一轮的输入. 展开后经过的块次数是

$$
N=KR. \tag{3}
$$

参数只跟 $K$ 走. $R$ 加一, 计算图变深, 磁盘上的权重文件不变. 每个块里还有注意力和 FFN 两个残差子层, 展开后的子层访问次数是 $M=2N$. DeepLoop 后文用的就是这个 $M$.

$K=1$ 是「整网一套权重转 $R$ 圈」, Universal Transformer 的默认结构接近这条. $K>1$ 是「一小段栈当循环核」, Huginn 的 $(2,4,2)$ 把 $K=4$ 放在中间. 两种都满足式 (3). 例如 $K=2$, $R=2$ 时, 前向依次经过 $\phi_1,\phi_2,\phi_1,\phi_2$, 展开深度 $N=4$, 存储的只有 2 套参数, 计算量仍按 4 层算.

直观上, 循环是用浅模型做深计算. 更准确地说: 表达力沿展开深度走, 记忆容量沿独立参数走. 第 3 节 Saunshi 的结果显示, 合成推理上循环几乎能追上同 FLOPs 的不循环深网; 语言建模的困惑度则仍更依赖参数.

### 1.2 与序列 RNN、CoT、MoE 的区别

**序列 RNN.** [2.5.4](../../../2.5-线性注意力与状态空间模型/2.5.4-线性RNN与Griffin/2.5.4-线性RNN与Griffin.md) 的线性 RNN、RWKV、Griffin, 状态沿 token 下标 $t$ 走: $h_t=f(h_{t-1},x_t)$. 循环 Transformer 的状态沿深度下标 $r$ 走, 同一时刻整段序列仍可并行做自注意力. Dehghani et al. (2018) 的原话是: Universal Transformer 不在序列位置上循环, 而是对每个位置的向量表示做连续修订. 序列长度 $T$ 可以不动, $R$ 照样加.

**CoT.** [4.8](../../../../4-后训练/4.8-推理与Agent能力/4.8-推理与Agent能力.md) 的 o1 路线把中间步骤写成新 token, 上下文变长, KV 变长, 注意力二次项跟着涨. 循环可以在同一段残差状态上转 $R$ 圈, 输出仍是下一个 token. Saunshi et al. (2025) 的定理把 $T$ 步 CoT 嵌进 $T$ 次 loop, 那是表达力上的对照, 不说明循环模型已经会写长 CoT.

**MoE.** MoE 稀疏的是**这一 token 激活哪些专家矩阵**. 循环减少的是**独立参数的份数**, 计算并不按专家关掉; 同一份权重被访问 $R$ 次. Mixture-of-Recursions 借用了 Expert-Choice / Token-Choice 这套词, 路由的对象是「这个 token 再进几轮」, 与 2.4.1 里的 FFN 专家无关.

## 2. 祖先与表达力: Universal Transformer, ALBERT, 可编程构造

### 2.1 深度维循环, 外加 ACT

深度维循环不是 2025 年才出现的. Universal Transformer (Dehghani et al., 2018, [arXiv: 1807.03819](https://arxiv.org/abs/1807.03819)) 是这条线的公开祖先: 一套权重沿深度转, 外加按位置的停机. 编码器从嵌入 $H^0\in\mathbb{R}^{m\times d}$ 出发, 每一步对**所有位置并行**做多头自注意力, 再过一套跨位置、跨步共享的转移函数, 得到 $H^t$. 残差、dropout、LayerNorm 包在外面. 步数 $T$ 不由序列长度决定, 由「每个符号的表示被修订几次」决定.

论文式 (4)(5) 把修订写成

$$
\begin{aligned}
A^{t}&=\mathrm{LayerNorm}\bigl((H^{t-1}+P^{t})+\mathrm{MHSA}(H^{t-1}+P^{t})\bigr),\\
H^{t}&=\mathrm{LayerNorm}\bigl(A^{t}+\mathrm{Transition}(A^{t})\bigr).
\end{aligned} \tag{4}
$$

$P^{t}$ 是位置和下标 $t$ 两套正弦编码的和, 论文式 (6)(7) 把 $\sin(i/\cdot)$ 和 $\sin(t/\cdot)$ 加在同一维上. 转移函数二选一: depthwise separable convolution, 或按位置的两层 ReLU MLP. $W^Q,W^K,W^V,W^O$ 在步与步之间共享. 这就是 $K=1$ 的循环核, 外加一个随 $t$ 变的坐标, 避免每一步在代数上完全同构.

自适应停机用的是 Graves (2016) 的 Adaptive Computation Time. 每个位置自己出停机概率. 停了就把状态复制到下一步, 直到全体停, 或碰到步数上限. 这是按位置分配深度, 不是按时间步做 RNN.

bAbI 上, 需要三个支持事实的任务, 平均 ponder time 是 $3.8\pm 2.2$; 两个事实 $3.1\pm 1.1$; 一个事实 $2.3\pm 0.8$. 步数随任务难度变化, 没有固定的 $R$. LAMBADA 上论文还报过固定 6 / 8 / 9 步和动态停机两套. 机器翻译上动态停机略伤分, ACT 也有代价.

解码器共用这套循环. 自注意力之后, Query 来自解码器表示, Key / Value 来自编码器终态 $H^T$, 再走一遍多头点积. 修订仍在深度维, 不沿输出位置递推.

理论侧, 论文证明 UT 在一定条件下 Turing 完备. 这是「存在一组权重能模拟」, 与「预训练出来的 LLM 在执行通用计算」是两回事. 2.3 节 Giannou 的结果给出更具体的构造.

### 2.2 ALBERT: 共享省参数, 不加推理轮次

ALBERT (Lan et al., 2020, [arXiv: 1909.11942](https://arxiv.org/abs/1909.11942)) 把跨层共享做成 BERT 的省参手段. 默认**所有**层参数共享; 也可以只共享注意力或只共享 FFN. BERT-large 334M, 同宽度的 ALBERT-large 18M, 大约 18 倍, 训练快约 1.7 倍.

分叉在这里. ALBERT 的 $L$ 在训练和推理里是同一条展开深度. 加层要重新训练, 推理阶段不能把 $R$ 从 12 调到 32. 论文 Table 13: ALBERT-xxlarge 的 12 层和 24 层, 下游 Avg 一样. 作者的结论是, 全共享之后, 没有必要再深过 12 层配置. 共享压住了参数, 也限制了继续加深带来的收益. 层与层之间的 L2 距离和余弦相似度在波动, 不收敛到 Deep Equilibrium 那种不动点.

UT 和 ALBERT 都把权重绑在深度上, 区别在用途: UT 用 ACT 按位置分配步数, ALBERT 只拿共享来省参数. ALBERT 说明深度维共享权重能减少参数; 第 4 节的 Huginn 说明同一套核可以在推理阶段多转几圈. 前者几乎不把 $R$ 当推理时的可调参数, 后者把 $r$ 用作推理阶段的算力.

### 2.3 常深度循环当可编程计算机

Giannou et al. (ICML 2023, [arXiv: 2301.13196](https://arxiv.org/abs/2301.13196)) 把循环 Transformer 构造成一台指令机. 输入序列分成三段: 指令, 可读写内存, 草稿区. 网络输出接回输入, 每轮执行一条指令. 深度不随程序行数增长, 只取决于执行一条指令要几层.

论文的单指令是 SUBLEQ 的放宽版 FLEQ: 读两个地址, 做指定函数, 按符号跳转. Table 1 的构造尺寸是手工设定的权重, 不是训练出来的:

| 功能 | 层数 | 头数 |
|------|------|------|
| SUBLEQ (一指令计算机) | 9 | 2 |
| 矩阵求逆 | 13 | 1 |
| 幂迭代 | 13 | 1 |
| 神经网络上的 SGD | 13 | 1 |

非正式定理写的是: 存在层数小于 13 的 looped transformer, 能模拟通用计算机、计算器、数值线性代数, 以及上下文里的 SGD. SUBLEQ 那条更具体: 9 层, 2 头, 宽度 $O(\log n+N)$, $n$ 是程序加内存长度, $N$ 是整数位数.

作者也指出, 这些构造和真实语言模型的训练方式没有相似之处; 「GPT-3 内部也许在调用子程序」只是猜想. 循环给出的是**常深度 + 外循环**这条表达力上界, 不是一组训练好的通用权重.

没有外循环, 层数就得按程序行数堆. 有外循环, 深度固定为执行单条指令所需的层数, 总时间仍随指令条数增长. 这与电路深度不能无代价压缩是同一件事.

## 3. Latent thoughts: k 层循环 L 次 ≈ kL 层不循环

### 3.1 记号与合成任务

Saunshi et al. (2025, [arXiv: 2502.17416](https://arxiv.org/abs/2502.17416)) 研究的问题是: 推理需要深度, 是否也需要那么多独立参数. 记号 $(k\otimes L)$: 一个 $k$ 层骨干循环 $L$ 次. 参数与 $(k\otimes 1)$ 相同, FLOPs 与 $(kL\otimes 1)$ 相同. 这里的 $L$ 是循环次数, 对应第 1 节的 $R$; $k$ 对应 $K$.

加法 (Table 1 左, $n$ 个加数). 基线 $(12\otimes 1)$ 在 $n=8,16,24,32$ 上都是 100.0. 一层不循环 $(1\otimes 1)$ 在 $n=32$ 上是 0.0; 同一层转 12 次 $(1\otimes 12)$ 是 99.6. 两层不循环 $(2\otimes 1)$ 在 $n=32$ 上掉到 38.8; $(2\otimes 6)$ 回到 99.5. 三层: $(3\otimes 1)$ 在 $n=32$ 上 60.7, $(3\otimes 4)$ 是 96.6.

$p$-hop induction (Table 1 右, 字母表大小 4, 序列长 256). 随机猜至少 25%. $(1\otimes 1)$ 在 $p=16/32$ 上是 48.9 / 49.0; $(1\otimes 6)$ 是 99.9 / 99.5. $(2\otimes 1)$ 是 68.8 / 59.4; $(2\otimes 3)$ 是 99.9 / 99.8.

符号 i-GSM (Table 2, 模 7, 图深度限制 4, 随机猜约 14%). $(8\otimes 1)$ 准确率 73.2. $(1\otimes 8)$ 也是 73.2. $(2\otimes 4)$ 是 73.6, 略高于同 FLOPs 的八层不循环. $(1\otimes 1)$ 只有 24.5, $(2\otimes 1)$ 只有 54.0.

三张表的共同点: 浅层不循环在加长问题上失效, 循环把深度补了回来, 差距远不止几个点. 论文的 Claim 1 就是: 许多推理问题需要深度, 不需要那么多独立参数.

### 3.2 语言建模: 困惑度更差, 推理切片更近

同一工作在 Pile 上预训练 250B token, 对照 24 层 1B. Table 3: 不循环 24 层验证困惑度 7.40, 推理原语 47.5, 数学应用题 29.3. $(12\otimes 2)$ 困惑度 7.90, 更差; 数学应用题 34.3, 推理原语 51.2, 反而超过 24 层基线. $(4\otimes 6)$ 困惑度 8.79, 推理原语 56.9; 同参的 $(4\otimes 1)$ 推理原语只有 19.4.

闭卷 QA (记事实) 上循环补不回参数缺口. 开卷 QA 和数学应用题上, %Gap 高得多. 循环的收益集中在多步组合, 不在记忆事实.

同一张表还有一行 Middle Loop $(4\otimes 1,4,1)$: 首尾各 4 层不共享, 中间 4 层循环. 困惑度 7.81, 比 $(12\otimes 2)$ 的 7.90 略好; 推理原语 56.5. 这已经接近 Huginn 后来的 sandwich 切法: 两端当 prelude / coda, 中间才是循环核. Saunshi 只把这行当作对照, 没有展开训练稳定性.

### 3.3 循环可以模拟 T 步 CoT

Theorem 5.4: 对固定输入长 $n$, CoT 步数 $m$ 的 $L$ 层不循环 Transformer, 存在层数 $L+O(1)$, 嵌入维多 $\Omega(\log(n+m))$, 头数多常数的 looped transformer, 在输入后面拼 $m$ 个占位符, 循环 $m$ 次之后, 输出与那 $m$ 步 CoT 相同.

CoT 每生成一步只往上下文写 1 个 token; 循环在一次迭代里可以修改一整段潜状态. 这是存在性结果, 不说明 Huginn 或 Ouro 在潜空间里执行了 CoT. 两条轴可以叠加: CoT 消耗上下文长度, 循环消耗深度.

### 3.4 循环启发的正则: 不共享参数, 只让相邻块相近

3.2 节的循环模型推理分高、困惑度差. Saunshi 第 4 节试图两头都要: 保留 $L$ 层各自的参数, 只在训练里把相邻的 $k$ 层块往一起拉. 把 $L$ 层模型写成 $f_0\circ f_1\circ\cdots\circ f_{L/k-1}$, 每个 $f_i$ 含 $k$ 层. 对每个参数组 $G$ (如 Attn-Q、FFN-W2), 正则项是相邻块对应层权重的余弦相似度均值:

$$
\mathcal{R}_G(k)=\frac{1}{L-k}\sum_{i=0}^{L/k-2}\sum_{j=0}^{k-1}\mathrm{Cosine}\bigl(\theta_G^{(ik+j)},\,\theta_G^{((i+1)k+j)}\bigr) \tag{5}
$$

总损失按原文式 (4) 写成

$$
\mathcal{L}=\mathcal{L}_{\mathrm{xent}}+\lambda_{\mathrm{reg}}\,|\mathcal{G}|^{-1}\sum_{G\in\mathcal{G}}\mathcal{R}_G(k) \tag{6}
$$

求和项共 $(L/k-1)\cdot k=L-k$ 个余弦, 所以前面除以 $L-k$. 原文的目标是提高相邻块的相似度, 照此在实现中应当最大化式 (5), 式 (6) 里这一项按文字含义取负号. $\lambda_{\mathrm{reg}}=0$ 退回普通训练, $\lambda_{\mathrm{reg}}\to\infty$ 收敛到完全循环. 作者试过 $\ell_2$ 距离, 余弦更稳. 训练结束时 $k=4$, $\lambda_{\mathrm{reg}}=10$ 的各参数组块间余弦都在 0.98 左右或更高, 不加正则的基线余弦很低.

Table 4 (24 层 1B, 与 3.2 节同一设定):

| 设定 | 困惑度 | 闭卷 QA | 开卷 QA | 数学应用题 | 推理原语 |
|------|--------|---------|---------|------------|----------|
| 基线 | 7.40 | 11.2 | 33.9 | 29.3 | 47.5 |
| $k=4$, $\lambda_{\mathrm{reg}}=1$ | 7.41 | 11.2 | 34.8 | 31.6 | 42.5 |
| $k=4$, $\lambda_{\mathrm{reg}}=10$ | 7.38 | 12.5 | 36.2 | 36.4 | 57.2 |
| $k=12$, $\lambda_{\mathrm{reg}}=10$ | 7.51 | 10.1 | 34.1 | 32.3 | 50.7 |

$k=4$, $\lambda_{\mathrm{reg}}=10$ 对应 $(4\otimes 6)$: 困惑度 7.38 与基线持平, 数学应用题从 29.3 到 36.4, 推理原语从 47.5 到 57.2, 比真正循环的 $(4\otimes 6)$ (困惑度 8.79, 推理原语 56.9) 困惑度好得多. 正则太弱 ($\lambda_{\mathrm{reg}}=1$) 时推理原语反而降到 42.5.

## 4. Huginn: sandwich, 以及推理阶段加循环

Geiping et al. (NeurIPS 2025, [arXiv: 2502.05171](https://arxiv.org/abs/2502.05171)) 把循环做成可预训练的 decoder-only 语言模型 Huginn. 主模型 3.5B 参数, 800B token. 形状写成三元组 $(l_P,l_R,l_C)=(2,4,2)$, 隐宽 $h=5280$, 存储的层共 8 个. 循环核转 $r$ 次时, 展开深度是

$$
2+4r+2. \tag{7}
$$

$r=32$ 时是 132 层. 参数切分: prelude 和头大约 1.5B, 循环核 1.5B, 绑定的输入嵌入 0.5B.

### 4.1 结构: 哪些层进 loop, 输出怎么出

标准块栈被切成三段. Prelude $P$ 把 token 嵌进潜空间, 得到 $e=P(x)$. 循环核 $R$ 接收当前状态 $s_{i-1}$ 和 $e$, 输出 $s_i$. Coda $C$ 把最后状态解回词表.

$$
\begin{aligned}
e&=P(x),\\
s_0&\sim\mathcal{N}(0,\sigma^2 I),\\
s_i&=R(e,s_{i-1}),\qquad i=1,\ldots,r,\\
p&=C(s_r).
\end{aligned} \tag{8}
$$

$e$ **每一步都重新注入**. 如果只在第一步喂一次 $e$, 迭代算子对数据不再单调, 路径会停在初值附近. 适配器 $A:\mathbb{R}^{2h}\to\mathbb{R}^{h}$ 把 $[s;e]$ 拼起来再送进 4 层核; 小模型上相加也行, 这个尺度上拼接更好.

层内 Norm 不是普通 Pre-LN. 论文的 sandwich 是

$$
\begin{aligned}
\hat x_l&=n_2\bigl(x_{l-1}+\mathrm{Attn}(n_1(x_{l-1}))\bigr),\\
x_l&=n_4\bigl(\hat x_l+\mathrm{MLP}(n_3(\hat x_l))\bigr).
\end{aligned} \tag{9}
$$

RoPE base $50000$, MLP 用 gated SiLU, RMSNorm. 作者说 $n_3$ 技术上多余, 主模型仍保留. 第一次大规模训练如果改回普通 Pre-LN, 又把学习率开到 $4\times 10^{-4}$, 会出现 token 表示之间的相关系数升到 1, 或模型学会忽略 $s$, 加 $r$ 也不降困惑度. 主运行把学习率降到 $4\times 10^{-5}$, 并保留 sandwich.

训练时 $r$ 从对数正态 Poisson 分布抽样, 均值 $\bar r=32$. 反向只穿过最后 $k=8$ 次迭代, 内存不随 $r$ 增长, 类似深度维上的截断 BPTT. Prelude 的输出每步都注入, 仍能收到梯度.

### 4.2 「相当于 50B」的原文口径

摘要写: 模型可以在推理基准上提升, 有时很明显, **直到计算负载相当于 50B 参数**. 正文更具体: 预训练消耗的 FLOPs 接近一台 32B 固定深度 Transformer; 推理阶段加循环, 可以一直涨到 **与标准 50B 固定深度 Transformer 相当的 FLOP 预算**.

参数仍是 3.5B, 变的是展开深度和 FLOPs. 记事实的容量和 50B 稠密模型不同. Ouro 也测过: 循环几乎不增加每参数的知识存储 (大约 2 bit), 增益来自知识组合.

公开评测表 (800B token, lm-eval) 随 $r$ 变化:

| $r$ | ARC-E | ARC-C | HellaSwag | MMLU | OBQA |
|-----|-------|-------|-----------|------|------|
| 4 | 49.07 | 27.99 | 43.46 | 23.39 | 28.20 |
| 8 | 65.11 | 35.15 | 58.54 | 25.29 | 35.40 |
| 16 | 69.49 | 37.71 | 64.67 | 31.25 | 37.60 |
| 32 | 69.91 | 38.23 | 65.21 | 31.38 | 38.80 |

ARC-E 从 $r=4$ 的 49.07 到 $r=32$ 的 69.91. $r=16$ 之后多数项只在小数位上变化, 加循环的收益会饱和. Table 2: 带系统提示, $r=32$ 的 GSM8K CoT 是 34.80 / 42.08 (strict / flexible). Table 4: 同一套数据训到 180B token 时, 固定深度对照的 GSM8K CoT 只有 1.82 / 2.20, 循环核 $r=32$ 已经是 9.02 / 10.24; $r=1$ 评 800B 检查点, GSM8K 是 0.00. OpenBookQA 一类题更早收敛, GSM8K 一类需要更多圈数, 这是论文 Figure 1 的定性结论. EMA 再把 $r=64$ 的 GSM8K flexible 提到 47.23% (strict 38.59%).

### 4.3 KV 缓存

循环核共用一套 $W_K,W_V$. 不同 $r$ 写出来的 KV, 投影矩阵相同, 论文称为「match」.

逐 token 早停时, 后面的 token 可能遇到「还没算到那么深」的历史 KV. Huginn 的做法是: attend **缓存里最后、也最深的那份** KV, 不回头补算缺失深度, 见 Remark 6.1.

另一条是零样本 KV 共享. 给循环核设预算 $k$, 第 $i$ 步读写槽 $i\bmod k$. 例如 $k=16$ 时第 17 步覆盖第 1 步. MTBench 上预算 4 的分数是 5.86, 与标准设置列在同一附录表, 作者说没有下降.

Prelude / coda 是独立层, 按常规各写各的 KV.

循环核还可以当自带的草稿模型. 少跑 $N$ 圈起草下一段 token, 再用 $M>N$ 圈验收. 草稿阶段算过的状态能留下, 验收不用从零开始. 这是论文第 6 节的 (self)-speculative decoding, 不另训草稿头, 也不靠跳层生成草稿.

## 5. 残差不稳: Fully Looped 与 DeepLoop

### 5.1 Fully Looped: 残差爆炸, 梯度振荡

循环把计算图拉深, 残差主干会先出问题. Fully Looped 和 5.2 的 DeepLoop 这两条近期工作处理的是**残差缩放和接线**, 没有改注意力核. 残差本身见 [2.1.3](../../../2.1-深度学习基础组件/2.1.3-残差连接/2.1.3-残差连接.md). *Simply Stabilizing the Loop via Fully Looped Transformer* ([arXiv: 2605.18797](https://arxiv.org/abs/2605.18797)) 对照了两档: Small 127M, 6 层; Base 318M, 12 层. 诊断窗口是前 2000 步. 两种问题: 早期梯度振荡; 循环次数高时残差范数持续变大. 12 圈的普通 LT 会训练失败: 损失停在高平台, 残差范数还在增长. 9 圈不一定失败, 但训练损失已经明显高于 6 圈. Base 档原 LT 在 9 圈直接标为失败, 没有评测分.

Fully Looped Architecture 改接线. 普通 LT 上一圈的输出只进下一圈的**第一层**. 后面的层要经过一长串变换才看得到循环状态. FLA 让上一圈输出 $h_L^{(t-1)}$ 对当前圈**每一层**可见:

$$
h_l^{(t)}=f_\theta^{(l)}\bigl(h_{l-1}^{(t)},\,h_L^{(t-1)}\bigr). \tag{10}
$$

Attention Injection 规定怎么融合. 第一圈 $t=1$ 仍是普通自注意力. $t>1$ 改成交叉注意力: 上一圈末态当 Query, 当前层前级输出 $z_l^{(t)}$ 当 Key / Value, 投影矩阵还是那套 $W_Q,W_K,W_V$:

$$
a_l^{(t)}=\mathrm{Attention}\bigl(W_Q h_L^{(t-1)},\,W_K z_l^{(t)},\,W_V z_l^{(t)}\bigr). \tag{11}
$$

Softmax 之后, 注入量由当前 Value 流决定, 上一圈的范数不能直接加进残差. 第一层的 $z$ 直接用输入嵌入 $x$, 作用接近先前工作里的 Input Injection, 但走注意力, 不做相加. 上一圈状态放在 $Q$ 上, 不放在 $K/V$ 上, 是为了让 KV 缓存仍按标准注意力写. 只做 FLA、把上一圈直接加进残差的 FLTres, 在消融里同样训练失败.

12 圈设定下, 除 FLT 以外的对照都失败了. Base 尺寸, 6 圈时, FLT 比原 LT 的下游平均分高 4.82 个绝对点, 相对约 13.2%. 原 LT 在 Base、9 圈已经失败; FLT 在 9 圈平均到 41.72, 仍能继续加圈.

### 5.2 DeepLoop: 按展开深度 N 改 α, β

DeepLoop ([arXiv: 2607.13491](https://arxiv.org/abs/2607.13491)) 沿用 Post-LN DeepNorm 骨架, 只改缩放. DeepNorm 对不共享权重的 $N$ 层, $M=2N$ 次子层访问, 取

$$
\alpha=(2N)^{1/4},\qquad \beta=(8N)^{-1/4}. \tag{12}
$$

$\beta$ 是残差分支矩阵的**初始化增益**, 不是前向再乘一次的运行时系数. 一阶稳定条件写成 $M(\beta/\alpha)^2=O(1)$.

循环打破了「每次访问各有一份独立更新」. 同一 $\phi_j$ 被访问 $R$ 次, 梯度先按访问求和, 再被这 $R$ 次前向读回去. visit-alignment $\kappa_R$ 衡量各轮梯度是否同向, $0\le\kappa_R\le R$. 访问近乎正交时 $\kappa_R=O(1)$, 回到 DeepNorm 的 $p=1/4$. 访问对齐, 且 $K$ 固定 $R$ 在增长时, $\kappa_R=\Theta(R)$, 指数要从 $1/4$ 提到 $1/2$:

$$
\alpha=(2N)^{1/2},\qquad \beta=(8N)^{-1/2}. \tag{13}
$$

此时 $\beta/\alpha=1/(4N)$. 稳定条件改成 $M\kappa_R(\beta/\alpha)^2=O(1)$. 代入 $M=2N$, $\kappa_R=R$: $2N\cdot R\cdot\frac{1}{16N^2}=\frac{R}{8N}=\frac{1}{8K}$, 与 $R$ 无关, 所以 $R$ 增大时条件仍满足. $R=1$ 时没有重复访问, 不存在对齐惩罚.

论文 Table 1: FineWeb-Edu 50B token, 步数 100000. GPT-2 small 骨干上 $R=1$ 的 $\Delta$ 是 $+0.0004$ nats; $R=3/5/7$ 分别是 $-0.0160$, $-0.0231$, $-0.0186$. medium 骨干 (隐宽 768→1024, 层数 12→24) 上 $R=1$ 是 $+0.0011$; $R=7$ 为 $-0.0278$. 下游八任务平均在 $R=1$ 基本打平, medium 的 1-shot 在 $R=7$ 为 55.20%. 结果为单次种子, 论文写明还需要多个种子才能定量方差.

## 6. 相关工作, 整机位置, 失效

### 6.1 Mixture-of-Recursions

循环核插进整机之后, 还可以按 token 选深度 (MoR), 或在预训练里学停机 (6.2 的 Ouro). 两者都在回答 UT 的 ACT 当年回答过的问题: 每个 token 该走多深. MoR 用 Top-$k$ 路由器决定谁继续转, Ouro 用退出门加熵正则决定何时停, 它们的接口都落在式 (2) 的轮次下标 $r$ 上. Bae et al. (NeurIPS 2025, [arXiv: 2507.10524](https://arxiv.org/abs/2507.10524)) 在循环核上加**按 token 的深度路由**. 参数共享仍在, 但每个 token 不必跑满 $N_r$ 轮. 规模为 135M 到 1.7B (这是基座尺寸, MoR 因共享参数更少).

共享顺序有 Cycle 和 Sequence, 以及保留首尾层、只共享中间层的 Middle 变体. $L=9$, $N_r=3$ 时, Cycle 展开成 $[(0,1,2),(0,1,2),(0,1,2)]$, Sequence 成 $[(0,0,0),(1,1,1),(2,2,2)]$. 展开层数相同, 访问顺序不同.

路由有两种. Expert-Choice: 每一深度当一个「专家」, Top-$k$ 留下还要继续转的 token, 并且只允许上一轮留下的 token 进入下一轮. Token-Choice: 一开始就为每个 token 选定总轮数. 为了对齐两种路由的算力, $N_r=3$ 且负载均匀时, 三轮处理的 token 比例为 $3/3,2/3,1/3$, Expert-Choice 的 $k$ 按这个比例递降. KV 也有两种: recursion-wise 只缓存本轮仍活跃的 token; recursive sharing 在第一轮缓存全部, 后面轮次复用. 这和 Huginn 的 $i\bmod k$ 是不同的实现.

结果 (Table 3, FineWeb-Edu). 训练预算固定为 $16.5\times10^{18}$ FLOPs 时, Expert-Choice、$N_r=2$ 的 MoR 参数量约为普通 Transformer 的一半, few-shot 平均 43.1% 对 42.3%, 验证损失也更低; 原因是每 token 算得更少, 同样 FLOPs 能多训 token. 训练 token 固定为 20B 时, $N_r=2$ 的 MoR 训练 FLOPs 少 25%, 训练时间少 19%, 峰值显存少 25%. 推理侧, 共享参数允许连续深度批处理 (不同深度的 token 拼进同一批), 360M 档 MoR-4 在最大批量下吞吐最高达普通模型的 2.06 倍, 代价是似然略降.

MoR 借用了 MoE 的术语, 路由对象是「这个 token 再进几轮循环核」. 专家矩阵的稀疏见 2.4.1.

### 6.2 Ouro

Zhu et al. (2025, [arXiv: 2510.25741](https://arxiv.org/abs/2510.25741)). Ouro 是预训练的 LoopLM: 共享栈反复迭代, 熵正则学习深度分配, 语料 7.7T token. Table 2: Ouro 1.4B 为 24 层, 隐宽 2048; Ouro 2.6B 为 48 层, 隐宽 2048; 注意力 MHA, FFN 为 SwiGLU, 位置为 RoPE, 词表 49152. 公开材料把默认循环步数写成 4 (R4).

摘要说 1.4B / 2.6B「match the results of up to 12B SOTA LLMs」. 正文 Figure 2 把 Thinking 变体写成: 1.4B-Thinking R4 和 4B 可比, 2.6B-Thinking R4 持平或超过 8B. 两种口径出自同一篇论文. 受控实验的结论是: 循环几乎不增加知识存储 (looped / 非 looped 都大约 2 bit/参数), 增益在事实组合和多跳推理.

早停用退出门加均匀先验上的熵正则, 避免总是用到 $T_{\max}$. 这和 UT 的 ACT、Huginn 的 Poisson $r$ 是三种停机设计, 超参不能互相套用.

### 6.3 失效

| 现象 | 原因 | 说明 |
|------|------|------|
| 残差爆炸 / 训练失败 | 展开深度变大, 残差每圈轻微放大, 或梯度在共享块上振荡 | 12 圈普通 LT 会失败 (2605.18797). DeepNorm 的 $p=1/4$ 在访问对齐时不够 |
| 加 $R$ 分数不动 | 模型学会忽略状态 $s$, 或任务不需要深度 | Huginn 失败的第 2 次运行: 1 圈和 32 圈验证困惑度一样. 表中 $r=16\to 32$ 多数项只在小数位变化 |
| KV 重复或对不齐 | 早停造成缺失槽; 或循环核每步各写一份, 显存按 $r$ 增长 | Huginn: 用最深可用槽, 或 $i\bmod k$. MoR 另有 recursion-wise / sharing |
| 与 CoT 叠加算力 | 潜空间已经转了 $R$ 圈, 外面再生成一长串 thought | 两条轴正交, 预算要分开算 |
| 把共享当推理时可调参数 | 把 ALBERT 式全共享理解成「推理时随便加 $R$」 | ALBERT-xxlarge 12 层和 24 层 Avg 一样. 加深度要另训, 或像 Huginn 那样在训练里就抽样 $r$ |
| 记事实不涨 | 循环几乎不增加每参数知识容量 | Saunshi 闭卷 QA 补不回参数缺口; Ouro 约 2 bit/参数 |

整机里循环核通常放在中段. Prelude 负责把子词嵌入潜空间, coda 负责解回词表, 中间那 $K$ 层才是可以加 $R$ 的核.

参数量由 $K$ 决定, 深度和计算量由 $R$ 决定, 训练稳定性要靠残差缩放或 Attention Injection 单独处理.

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
