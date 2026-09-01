---
title: "Engram：从 n-gram 到可扩展查找"
date: 2026-08-30
as_of: 2026-08-30
tags: [Engram, 条件记忆, n-gram, MoE, Qwen3.8]
math: true
---

# Engram：从 n-gram 到可扩展查找

标准 Transformer 没有原生的知识查找算子。像 “Alexander the Great” 这类**静态局部模式**，早期层必须用 Attention 和 FFN 一层层把实体拼出来——等于在运行时重建一张本该查出来的表，把宝贵的深度花在套话上。Engram（Cheng et al., 2026, [arXiv:2601.07372](https://arxiv.org/abs/2601.07372)）把这条轴叫**条件记忆**：用经典 $N$-gram 当钥匙，对一张大嵌入表做 $\mathcal{O}(1)$ 哈希查找，再经上下文门控并入残差。

本篇是 2.4.8 的机制专文。条件计算（MoE）的路由与专家仍在 [2.4.1](../../2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)。它**不是** MoE（稀疏的是计算不是表行）、**不是** kNN-LM（不是隐藏态近邻库）、**不是** KV cache（不是随序列变长的 K/V）。后面把查表插进整机：和 Attention / FFN / MoE 怎么分工、地址为何能 prefetch、表为什么可以放 Host。

---

## 1. 卡住的问题：静态局部模式还要靠早期层重建

语言建模其实在同时做两件不同的事。一件是组合式推理，必须吃深度、吃动态计算。另一件是检索高度刻板的局部模式：多 token 专名、公式化短语、成语。后者在经典 $N$-gram 语言模型里本来就是**查频次表**。Transformer 把两件事都塞进同一套权重之后，早期层被迫扮演「现场拼表」的角色。

论文 Table 3 借 PatchScope 复述了一个实体解析例子：要在隐藏态里得到 “Diana, Princess of Wales”，模型从第 1–2 层的「Wales = 国家」走到第 6 层才拼出完整人物。这几层 Attention 和 FFN 并没有在做长程推理，只是在把相邻 token 攒成一个静态条目。Ghandeharioun et al. (2024) 与 Jin et al. (2025) 把这类现象写成「概念深度」：浅层在做局部聚合，深层才做难的事。Engram 的动机是——局部聚合不该占用那么多层。

MoE 帮不了这个忙。路由器看的是当前隐藏态，专家做的是矩阵乘：它放大的是**条件计算**。你仍然没有一张可以按 token 串直接索引的表。kNN-LM 走另一条极端：把训练语料的隐藏态整库存下来做近邻，插值 next-token 分布。那是非参数检索，延迟随库长走，也不是层内 $\mathcal{O}(1)$ 查行。KV cache 存的是**本序列已经算过的** Key/Value，随生成长度涨，跟「参数表里的静态短语记忆」不是同一个对象。

---

## 2. 经典 n-gram：条件概率就是一张表

Shannon (1948) 之后，统计语言模型长期用局部历史预测下一个词。$n$ 阶 Markov 假设下，下一个 token 的条件概率就是计数比：

$$
P(w_t \mid w_{t-n+1}^{t-1})
=
\frac{C(w_{t-n+1}^{t})}{C(w_{t-n+1}^{t-1})}
\tag{1}
$$

$C(\cdot)$ 是语料里该 $n$-gram 的出现次数。表的键是离散符号串，值是一个标量（概率或平滑后的概率）。Katz (1987)、Kneser and Ney (1995) 处理的是稀疏：多数 $n$-gram 从未出现，必须回退、插值。Brants et al. (2007) 把这种表做到机器翻译里仍然有用，说明**局部共现本身就携带可查的信息**，不必每次用深度网络重新发现。

FastText（Bojanowski et al., 2017）把「查表」从标量概率换成向量：子词 $n$-gram 各有一条嵌入，词向量是它们的和。键还是离散串，值变成 $\mathbb{R}^{d}$。Engram 沿这条线走：不再估计式 (1) 的概率，而是把后缀 $N$-gram 当成钥匙，取出一条可学习的嵌入，再交给后面的门控决定用不用。Infini-gram（Liu et al., 2024b）证明无界 $n$-gram 计数可以做到万亿 token；Engram 不走计数，走**可训练的哈希嵌入表**，并且把表插进 Transformer 层中间，而不是只当输入层的加料。

---

## 3. 哈希：组合爆炸改成 $\mathcal{O}(1)$ 查槽

直接为每个可能的 $N$-gram 开一行参数，词表 $V$ 上是 $V^{n}$ 行，存不下。Tito Svenstrup et al. (2017) 的 hash embeddings 已经把「组合键 → 有限槽」写成哈希。Engram 在此之上加了 tokenizer 压缩和多头哈希。

### 3.1 Tokenizer 压缩

子词分词器优先保证可逆，不保证语义合一：`Apple` 和 `␣apple` 往往是两个 ID。Engram 预计算一个满射 $\mathcal{P}:V\to V'$，按 NFKC 正规化、小写等把等价文本压成规范 ID。论文 Appendix C：128k 词表上有效词表约降 **23%**。位置 $t$ 的原始 ID $x_t$ 变成

$$
x'_t = \mathcal{P}(x_t),\qquad
g_{t,n} = (x'_{t-n+1},\ldots,x'_t)
\tag{2}
$$

$g_{t,n}$ 是压缩后的后缀 $n$-gram。压缩只改钥匙，不改 Transformer 的输入嵌入；$V$ 上的 token embedding 与 LM head 保持不动。

### 3.2 多头哈希

对每个阶 $n$ 准备 $K$ 个独立哈希头。头 $k$ 把 $g_{t,n}$ 映到素数大小 $M_{n,k}$ 的表 $E_{n,k}$ 上的一个下标（素数是为了乘法哈希的周期更干净）：

$$
z_{t,n,k} \triangleq \varphi_{n,k}(g_{t,n}),
\qquad
e_{t,n,k} = E_{n,k}[z_{t,n,k}]
\tag{3}
$$

$\varphi_{n,k}$ 是轻量 multiplicative-XOR，**只看 token ID，不看隐藏态**。最终记忆向量是各阶、各头取出的行拼接：

$$
e_t \triangleq \big\|_{n=2}^{N}\big\|_{k=1}^{K} e_{t,n,k} \in \mathbb{R}^{d_{\mathrm{mem}}}
\tag{4}
$$

Engram-27B / 40B 取 $N=3$（只用 2-gram 与 3-gram）、$K=8$、$d_{\mathrm{mem}}=1280$。消融里在固定 1.6B 预算下把容量分给 4-gram 略差，论文猜测是稀释了更常见的 2/3-gram；不排除更大表上高阶会有用。

碰撞不可避免：不同 $n$-gram 可能落到同一行。多头是在用 $K$ 次独立探测换「单次哈希全错」的概率。这仍然是静态先验，下一节用门控处理多义和撞车。

![n-gram 经压缩与多头哈希查表，拼接成 e_t](./images/fig-engram-ngram-hash.png)

> 图 1：后缀 2-gram / 3-gram 经 multiplicative-XOR 多头哈希，索引素数大小的表 $E_{n,k}$，再拼接为 $e_t$。

**图 1 解析**

- 底栏 token 只提供离散 ID。地址在进任何 Transformer 层之前就能算出来。
- $\mathcal{P}$ 把大小写、兼容字符折成同一把钥匙，降低表的语义碎片。
- 每个阶、每个头查**一行**，不是扫全表。复杂度对表长是 $\mathcal{O}(1)$。
- 表用素数行数 $M_{n,k}$，降低乘法哈希的格子周期性。
- 拼出来的 $e_t$ 还没有见过当前句的全局上下文，所以不能直接当层输出。

---

## 4. 条件记忆 vs 条件计算

把稀疏预算拆成两堆，记号跟论文 §3.1 走。去掉词表嵌入和 LM head 之后：

- $P_{\mathrm{tot}}$：可训练总参数。
- $P_{\mathrm{act}}$：每 token 激活参数，决定训练 FLOPs。
- $P_{\mathrm{sparse}} \triangleq P_{\mathrm{tot}}-P_{\mathrm{act}}$：未激活的「免费」容量（没选中的专家，或没取到的嵌入行）。

分配比 $\rho\in[0,1]$ 是把这笔免费容量划给 MoE 专家的比例：

$$
P_{\mathrm{MoE}}^{\mathrm{(sparse)}} = \rho\, P_{\mathrm{sparse}},
\qquad
P_{\mathrm{Engram}} = (1-\rho)\, P_{\mathrm{sparse}}
\tag{5}
$$

$\rho=1$ 是纯 MoE；$\rho$ 下降则减少路由专家、把腾出来的参数做成 Engram 槽。MoE 侧 $P_{\mathrm{act}}$ 由 top-$k$ 专家决定；Engram 侧每 token 只取常数个槽，**加槽不加每 token FLOPs**。

这就是「条件记忆」和「条件计算」的正交性：

| | 条件计算（MoE） | 条件记忆（Engram） |
|--|-----------------|-------------------|
| 稀疏对象 | 专家里的矩阵乘 | 嵌入表里的行 |
| 地址从哪来 | 当前隐藏态 $h_t$（要等层算到） | 输入 token ID（层前已知） |
| 每 token 成本 | $k$ 个专家的 FFN | $K\cdot(N-1)$ 次查行 + 一次小投影/门控 |
| 表能否放 Host | 路由依赖 $h_t$，专家通常常驻 HBM | 可以 prefetch，表可放 DRAM |

二者互补，不是互相替代。$\rho\to 1$：没有专用静态表，还是得用深度重建套话。$\rho\to 0$：条件计算不够，动态推理会伤。论文在两个计算预算上扫 $\rho$，验证损失呈 **U 形**。最优大约把 **20%–25%** 的 $P_{\mathrm{sparse}}$ 给 Engram（即 $\rho\approx 75\%\text{–}80\%$）。10B 档（$6\times 10^{20}$ FLOPs）上，纯 MoE 验证损失 1.7248，最优点附近 $\rho\approx 80\%$ 降到 1.7109（$\Delta=0.0139$）。Engram-27B 落地用 $\rho=74.3\%$：路由专家 $72\to 55$，腾出 5.7B 做表。禁止把 Figure 3 的 U 形用手绘假曲线代替；数字以论文正文和 Table 为准。

---

## 5. 门控并入残差：查到的先验怎么进主干

$e_t$ 是与上下文无关的先验。哈希碰撞和多义词会把它变成噪声。Engram 用当前隐藏态 $h_t$ 当 Query（前面的 Attention 已经聚合过全局信息），从 $e_t$ 生成 Key / Value：

$$
k_t = W_K e_t,\qquad v_t = W_V e_t
\tag{6}
$$

标量门 $\alpha_t\in(0,1)$ 是 RMSNorm 之后的缩放点积再过 sigmoid（论文式 (4)）：

$$
\alpha_t
=
\sigma\!\left(
\frac{\mathrm{RMSNorm}(h_t)^{\top}\mathrm{RMSNorm}(k_t)}{\sqrt{d}}
\right)
\tag{7}
$$

$\tilde{v}_t=\alpha_t\cdot v_t$。$e_t$ 和 $h_t$ 语义对不上时，门趋向 0。随后做短的 depthwise 因果卷积：核宽 $w=4$，膨胀 $\delta=$ 最大 $N$-gram 阶，SiLU，再残差回去：

$$
Y = \mathrm{SiLU}\big(\mathrm{Conv1D}(\mathrm{RMSNorm}(\tilde{V}))\big) + \tilde{V}
\tag{8}
$$

卷积零初始化，训练起点是恒等。并入方式是残差加法，然后才是该层的 Attention 和 MoE：

$$
H^{(\ell)} \leftarrow H^{(\ell)} + Y
\quad\text{再}\quad
\mathrm{Attention}\ \to\ \mathrm{MoE}
\tag{9}
$$

默认骨干不是单流残差，而是 mHC，$M=4$ 条分支（公式在 [01 mHC](../../../2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md)，本篇不重推 Sinkhorn）。表 $E$ 和 $W_V$ **跨分支共享**，每条分支自己的 $W_K^{(m)}$ 负责各门各的：

$$
\alpha_t^{(m)}
=
\sigma\!\left(
\frac{\mathrm{RMSNorm}(h_t^{(m)})^{\top}\mathrm{RMSNorm}(W_K^{(m)} e_t)}{\sqrt{d}}
\right)
\tag{10}
$$

$$
u_t^{(m)} = \alpha_t^{(m)}\cdot (W_V e_t)
\tag{11}
$$

一层 $M=4$、两处插入，每个 token 会算出 8 个门。论文 Figure 7 只展示和语义模式最相关的那路：门在专名、套话结束处升高（“Alexander the Great”、“四大发明”、“张仲景”）。不是每条分支都可解释。

![门控融合后写入 mHC 残差，再进 Attention 与 MoE](./images/fig-engram-gate-residual.png)

> 图 2：检索向量 $e_t$ 投影为 $k_t,v_t$；$h_t$ 当 Query 得到 $\alpha_t$；短卷积后加进 $M=4$ 残差，随后才是 Attention 与 MoE。

**图 2 解析**

- 查找相位不读 $h_t$；门控相位才读 $h_t$。这是「能 prefetch」和「能按上下文关掉噪声」同时成立的原因。
- $W_V$ 共享、$W_K^{(m)}$ 分家：论文写这样可以融成一次稠密 FP8 矩阵乘。
- $Y$ 加在 Attention **之前**。查表先改残差，注意力看到的已经是「带静态先验」的流。
- MoE 仍按 $h_t$ 路由专家。静态短语尽量别再占用专家容量。
- 卷积是局部非线性，消融里去掉它损失只轻微变差；门控、多分支融合、tokenizer 压缩去掉才是大头。

---

## 6. 整机插槽：插在哪一层、和邻居怎么分工

Engram **不是每层都插**。词表嵌入和 un-embedding 保持原样。27B / 40B 实验：30 层、隐藏维 2560、MLA 32 头、mHC 扩张 4、Muon 训骨干；Engram 插在 **第 2 层和第 15 层**。每层内部顺序按式 (9)：**Engram → Attention → MoE**。

为什么是第 2 层，而不是第 0 层（纯输入加料）或最深层？12 层 3B MoE + 1.6B 表的层扫描（论文 Figure 5）给出权衡：

- 插太早（第 1 层）：门控的 Query 还没有做过一轮 Attention，全局上下文弱，多流也还没分化。
- 插太深：静态局部模式已经被前几层用计算重建过了，查表来晚了，深度节省没了。
- **单点最优是第 2 层**（Val Loss 1.770 vs 纯 MoE 1.808）。一轮 Attention 够给 $h_t$ 当 Query，又足够早，能替底层做局部聚合。
- 同一 1.6B 拆成两块、放在第 2 和第 6 层，比单点第 2 层再好一点（1.768）。大模型把第二块放到第 15 层，兼顾早期卸载和中层再查。

系统侧还有第二条约束：插得越深，前面层的计算窗口越长，越容易把 Host→GPU 的 PCIe 传输藏进去。建模想要早、系统想要晚，第 2 层是两边都能接受的折中：第 1 层的 Attention/FFN 刚好挡住查表延迟。

和邻居积木的分工可以写成三条数据流：

1. **Attention / MLA**：管位置之间的动态对齐、长程指代、提示聚焦。局部套话不该再占注意力头。长上下文节会看到 NIAH 因此变好。
2. **MoE / FFN**：管需要计算的变换。DeepSeekMoE 的共享专家 + 细粒度路由仍在每层跑；Engram-27B 只是把路由专家从 72 减到 55（仍 top-6，2 个共享专家），把腾出的参数做成表，激活量仍是 3.8B。
3. **Engram**：只管「这串局部 token 像不像一张记得的卡片」。卡片不对就 $\alpha_t\to 0$，残差当没这回事。

LogitLens：Engram 变体早期层的 KL（中间态投影到词表 vs 最终分布）更低，预测更早就绪。CKA：Engram 第 5 层的表示最接近纯 MoE 大约第 12 层——有效深度被「买」出来了。关掉表做推理时，事实类基准只剩 29–44%（TriviaQA 29%），阅读理解还能留 81–93%（C3 93%）。表主要扛参数化事实；读懂段落还是骨干注意力的事。

---

## 7. 地址能 prefetch、表能放 Host

MoE 路由依赖 $h_t$，专家权重的访问模式要等到该层前向算完才知道，所以专家通常得常驻 HBM。Engram 的下标 $z_{t,n,k}$ **在看到第一个隐藏态之前就定了**。训练和推理因此可以走完全不同的存储层次。

训练：表按行切到各 GPU，All-to-All 只搜集本步用到的行，反向再把梯度打回去。表容量随卡数线性涨。

推理：整张表放 Host DRAM。根据 token ID 在 Host 上算地址、经 PCIe 异步把行搬进 GPU，和前面层的计算重叠。论文把 100B 参数的 Engram 插进稠密骨干的**第 2 个 Transformer block**，表全部在 DRAM 里，用 nano-vLLM 原型在 H800 上测（512 条序列，长度 $\mathrm{Uniform}(100,1024)$）：

| 骨干 | 配置 | 吞吐 (tok/s) | 相对跌幅 |
|------|------|--------------|----------|
| 4B-Dense | Baseline | 9,031.62 | — |
| 4B-Dense | +100B Engram（CPU offload） | 8,858.28 | 1.9% |
| 8B-Dense | Baseline | 6,315.52 | — |
| 8B-Dense | +100B Engram（CPU offload） | 6,140.02 | **2.8%** |

正文口径：100B 表 offload 到 host memory，惩罚可忽略，8B 骨干上到顶 **2.8%**（引言写 $<3\%$）。这是保守基线：所有访问都走 PCIe，没有把高频 $n$-gram 缓进 HBM。通信体积跟**激活槽数**成正比，跟表的总行数不成正比。$n$-gram 服从 Zipf，论文因此还画了多层缓存：热行可留 HBM/DRAM，长尾可以落到 NVMe；Table 4 本身没有测 SSD。

![训练 All-to-All 切表；推理表在 Host，PCIe 与第 1 层计算重叠](./images/fig-engram-host-prefetch.png)

> 图 3：左栏训练期表分片 + All-to-All；右栏推理期 100B 表在 Host DRAM，地址预先算好，prefetch 与 Layer 1 重叠。

**图 3 解析**

- 训练必须把梯度写回表行，所以表仍以 GPU 分片为主；推理没有这条约束，可以整表下放。
- 「第 2 层才融合」给了第 1 层一整块计算当缓冲。没有这块缓冲，PCIe 会变成气泡。
- MoE 专家不能同样下放：路由器要等本层 $h_t$。这是条件记忆相对条件计算的系统差。
- 有效搬运是「每 token 几行」，不是「每 token 100B」。
- Zipf 多层缓存是论文的系统设计，Table 4 测的是更狠的「全走 Host」；不要把 2.8% 读成已经含 SSD 命中。

OverEncoding、SCONE 一类把 $n$-gram 嵌在**输入层（Layer 0）**的做法，会把访存和计算串起来，藏不住延迟。Engram 把模块往里插，图 3 才成立。

---

## 8. 27B 对照：等参等 FLOPs 的 MoE 不是上界

四套模型，同一 262B token 课表，DeepSeek-V3 词表（约 128k / 表里写 129280），激活都是 3.8B：

| | Dense-4B | MoE-27B | Engram-27B | Engram-40B |
|--|----------|---------|------------|------------|
| 总参（不含 token embed） | 4.1B | 26.7B | 26.7B | 39.5B |
| 激活 | 3.8B | 3.8B | 3.8B | 3.8B |
| 专家（共享+路由, top-$k$） | — | 2+72 (top-6) | 2+55 (top-6) | 2+55 (top-6) |
| Engram 参数 | — | — | 5.7B | 18.5B |
| 表槽（Appendix Table 5） | — | — | 2,262,400 | 7,239,680 |
| 插入层 | — | — | [2, 15] | [2, 15] |

Table 1 同行（只列专文用得到的）。摘要写 MMLU +3.4，**Table 1 是 60.4 vs 57.4 = +3.0**，以表为准；正文增量与表一致。其余用户点名的差，表都能对上。

| 基准 | Dense-4B | MoE-27B | Engram-27B | Δ vs MoE |
|------|----------|---------|------------|----------|
| MMLU 5-shot | 48.6 | 57.4 | 60.4 | +3.0（摘要写 +3.4） |
| CMMLU 5-shot | 47.9 | 57.9 | 61.9 | +4.0 |
| BBH 3-shot | 42.8 | 50.9 | 55.9 | +5.0 |
| ARC-Challenge 25-shot | 59.3 | 70.1 | 73.8 | +3.7 |
| HumanEval 0-shot | 26.8 | 37.8 | 40.8 | +3.0 |
| MATH 4-shot | 15.2 | 28.3 | 30.7 | +2.4 |
| DROP 1-shot | 41.6 | 55.7 | 59.0 | +3.3 |
| GSM8K 8-shot | 35.5 | 58.4 | 60.6 | +2.2 |

知识类有收益，推理和代码/数学的差更大。论文解释：早期层不再重建套话，有效深度和注意力容量让出来了。Engram-40B 把表加到 18.5B，多数基准继续涨，但没有在每个任务上压过 27B（HumanEval 40B 反而是 38.4）。作者归因于 token 预算不够，训练后期 40B 的 loss 缺口还在拉开。

---

## 9. 长上下文：局部查表把注意力还给全局

预训练之后用 YaRN 做 32k 上下文延续（5k step / 30B token，超参 $\mathrm{scale}=10$，$\alpha=1$，$\beta=32$，缩放 $0.707$）。Table 2 的 Multi-Query NIAH：

| 模型（预训练步数, loss） | MQ NIAH | VT |
|--------------------------|---------|-----|
| MoE-27B (50k, 1.63) | 84.2 | 77.0 |
| Engram-27B (46k, 1.63) iso-loss | **97.0** | 87.2 |
| Engram-27B (50k, 1.62) iso-FLOPs | **97.0** | **89.0** |

摘要写的 $84.2\to 97.0$，对应 iso-loss 与 iso-FLOPs 两行的 MQ 列。41k 早停（约 82% 预训练 FLOPs）在 LongPPL 上已能贴住满训 MoE，RULER 仍更高。局部依赖交给查表之后，注意力更像在管针和变量追踪，而不是在记「Princess of Wales」这种短语。

---

## 10. Qwen3.8-Flash-Next：公开权重里的 51B 级 n-gram 表

Qwen3.8-Flash-Next（权重 2026-08-26）把主干写成 **125B 总 / 6B 每 token 激活**，另外加 **51B n-gram 嵌入**。51B **不进入**每 token 激活 6B，也不进矩阵乘预算。官方 Hugging Face 卡片：词表嵌入 248320；**N-gram Embedding 20,000,000（bigram/trigram，第 2 层）**；48 层；隐藏维 2560。博文与报告口径一致：表可放 Host，地址预先算，和计算异步 prefetch；**只在网络靠前放一层**。

**有没有点名 2601.07372 / Engram。** 技术报告 PDF（*On the Design of Qwen3.8-Next Architecture*，28 页）正文写 `Cheng et al., 2026`，参考文献条目是 Xin Cheng 等，题目 *Conditional memory via scalable lookup: A new axis of sparsity for large language models*，会议写成 ACL 2026。这就是 2601.07372。PDF 正文**没有**出现字符串 `Engram` 或 `2601.07372`。阿里云博文则写 “Inspired by Per-Layer Embedding in Gemma 3n and works such as **DeepSeek Engram**”。结论：报告**点名了该文**（Cheng 2026 / 条件记忆），博文点名 Engram；不要说「完全没引用」。

和 Engram-27B 的差别（以 Qwen 报告为准，不把 NVIDIA NeMo 实现细节升格成官方超参）：

- **一层 vs 两层。** Qwen Table 7 扫了第 1/2/3/4/10/15/25 层以及 2+15、2+25。单层第 2 层综合最好；多层分摊同一预算没有稳定好处。最终放 Layer 2，让 prefetch 和第 1 层重叠——和 Engram 层扫描的结论同方向。
- **固定总参下的 U 形。** Table 8 把 n-gram 槽加大同时减专家，loss 在 10× 词表（约 25% 参数比）最低，报告写这与 Cheng et al. (2026) 的分配甜点一致；下游分数却没有对 MoE-only 形成清晰优势。于是他们改成 **MoE 预算固定、表往上加**（Table 9）。
- **Tokenizer 压缩。** 报告写尝试了 Cheng et al. (2026) 的 token normalization 等，**没有稳定收益**。不要默认 Qwen 表用了 Engram 那套 $\mathcal{P}$。
- **残差。** Qwen 用 Gated Residual（$n_r=4$），不是 mHC 的双随机混合。查表仍是「加进靠前层的残差流」。

不要把「第一个 Engram 级别百 B」写进正文：没有一手把这个头衔授给 Qwen。能写的是——**公开权重里出现了 51B 级 n-gram 表的百 B 档**（125B 主干 + 51B 表，激活仍按 6B 计）。Gemma 3n 的 Per-Layer Embedding、RWKV DeepEmbed 是同族「大表扩容」，不是这篇 Engram 的哈希 $N$-gram 门控模块。

第 05 章型号正本只记发布配方，公式仍以本篇为准：[Qwen3.8-Flash-Next 正本](../../../../05-模型家族与选型/5.3-模型家族/qwen/qwen3-8-flash-next/qwen3-8-flash-next.md)。

---

## 11. 还有谁用；以及「不是」表

**出厂型号。** 到 2026-08-30，公开材料里把「确定性 $n$-gram 大表 + Host prefetch」捆进可下载权重的，是 Qwen3.8-Flash-Next。DeepSeek 自己的 Engram-27B / 40B 是论文实验体，代码在 [deepseek-ai/Engram](https://github.com/deepseek-ai/Engram)，不是 V3/V4 的发布权重。

**DeepSeek-V4。** 技术报告把 Cheng et al. (2026) 写在未来工作：将探索「更稀疏的嵌入模块」，参考文献列出 2601.07372。这是路线图，**不是 V4 已经上 Engram**。知乎侧「V4 报告里没有 Engram」和 mineru 译文一致，当口碑线索，不当事实源。

**跟进论文（不是产品）。** Tiny-Engram（[arXiv:2605.20309](https://arxiv.org/abs/2605.20309)）把触发式概念表当 PEFT；*User as Engram*（[arXiv:2606.19172](https://arxiv.org/abs/2606.19172)）把人均记忆写成局部参数编辑；Memory Grafting（[arXiv:2605.20948](https://arxiv.org/abs/2605.20948)）用冻结模型的隐状态做离线 $n$-gram 记忆；CXL pooling（[arXiv:2603.10087](https://arxiv.org/abs/2603.10087)）讨论条件记忆的内存池。它们引用 2601.07372，没有构成第二个公开百 B 出厂件。

**Engram 相关工作点了名的。** PEER（He, 2024, [arXiv:2407.04153](https://arxiv.org/abs/2407.04153)）、PKM、RETRO、OverEncoding、SCONE、BLT、Gemma 3n PLE。**没点名** kNN-LM 与 Hash Layers。下面对照表用各自一手；kNN / Hash Layers 两行是机制对比，不是「Engram 论文点名批评了它们」。

| 机制 | 一手 | 地址 | 取出来的东西 | 为何不是 Engram |
|------|------|------|--------------|-----------------|
| kNN-LM | Khandelwal et al., [1911.00172](https://arxiv.org/abs/1911.00172) | 当前隐藏态的近邻 | 邻居的 next-token 分布，再 $\lambda$ 插值 | 非参数库，检索不是 $\mathcal{O}(1)$ 哈希行；通常不改残差流 |
| Hash Layers | Roller et al., [2106.04426](https://arxiv.org/abs/2106.04426) | token ID 的哈希 | **哪一个专家 FFN 来算** | 条件计算的无参路由；算的是矩阵乘，不是静态嵌入 |
| PEER | He, 2024, [2407.04153](https://arxiv.org/abs/2407.04153) | 隐藏态 product-key | 海量小专家 | 查询依赖 $h_t$，不能层前 prefetch |
| RETRO / REALM | Borgeaud et al. 2022 等 | 块级检索 | 外部可编辑文本 | 非参数、可换库；Engram 行是训练出来的参数 |
| OverEncoding / 输入层 $n$-gram | Huang et al. 2025 等 | 同样可哈希 | 加在 Layer 0 | Engram 强调插进深层才能重叠通信；论文写 OverEncoding 在 MoE 骨干上没有公平设定下的收益 |

未找到其它公开权重型号把 Engram 模块写成出厂架构。`[OM-FREEPLAY]` 若 2026-08 之后有第二家卡，补进本节，不要把 V4 路线图算进去。

---

## 12. 失效模式

| 现象 | 原因 | 说明 |
|------|------|------|
| 哈希碰撞 / 多义 | 不同短语共用一行 | 靠多头 + $\alpha_t$ 抑制；不是无碰撞完美哈希 |
| $\rho$ 太小 | 专家太少 | U 形右支：记忆替不了动态计算 |
| $\rho=1$ | 没有表 | U 形左支：早期层继续重建套话 |
| 只插第 0 层 | 访存与计算串行 | 藏不住 PCIe；也失去「第 1 层当缓冲」 |
| 插太深 | 局部模式已被算过 | Figure 5 层扫描：越深越差 |
| 推理时关掉表 | 训练–推理不一致 | 事实类崩、阅读理解还在；不能当「表没用」 |
| 把 51B 算进 6B | 记账错误 | 查表行不进每 token 矩阵乘 |
| 把 V4 写成已上 Engram | 把未来工作当出厂 | mineru：Cheng 2026 在路线图 |
| 手绘 U 形 / scaling 曲线 | 冒充论文 Figure | 用 Table 数字；曲线看原文 |

门控可视化只说明「有些分支在套话结束处升高」，不证明每条记忆都可编辑、可干预。把 Engram 理解成可按 key 改写的知识库，目前没有论文级支持。

节地图：[2.4.8 条件记忆与 Engram](../2.4.8-条件记忆与Engram.md)。MoE 对照：[2.4.1](../../2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)。

## 参考文献

1. Xin Cheng et al. (2026). [Conditional Memory via Scalable Lookup: A New Axis of Sparsity for Large Language Models](https://arxiv.org/abs/2601.07372). arXiv:2601.07372. HTML: https://arxiv.org/html/2601.07372 。代码：https://github.com/deepseek-ai/Engram 。公式 (3)–(11) 对应论文 (1)–(7)；Table 1 / 2 / 4 数字抄 PDF 同行。
2. Qwen Team (2026). *On the Design of Qwen3.8-Next Architecture*. https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf （引用 Cheng et al., 2026；未写 Engram 三字）。博文：https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501 （点名 DeepSeek Engram）。HF：https://huggingface.co/Qwen/Qwen3.8-Flash-Next 。
3. DeepSeek-V4 mineru：Cheng et al. 2026 出现在未来路线，不是出厂模块。
4. kNN-LM: https://arxiv.org/abs/1911.00172 ；Hash Layers: https://arxiv.org/abs/2106.04426 ；PEER: https://arxiv.org/abs/2407.04153 。
5. 知乎只学讲法，数字仍以上述一手为准（URL 记在 inbox `engram-248.md`）。
