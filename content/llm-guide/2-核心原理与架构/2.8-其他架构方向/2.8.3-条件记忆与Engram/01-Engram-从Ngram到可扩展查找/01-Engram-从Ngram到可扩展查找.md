---
title: "01 · Engram: 从 n-gram 到可扩展查找"
published: true
tags: ["Engram", "条件记忆", "n-gram", "MoE", "Qwen3.8"]
excerpt: "标准 Transformer 没有原生的知识查找算子. Engram 用局部 N-gram 当钥匙做 O(1) 哈希查表, 经上下文门控并入残差, 与 MoE 分摊稀疏参数预算."
---
# · Engram: 从 n-gram 到可扩展查找

标准 Transformer 没有原生的知识查找算子. 像「Alexander the Great」这类**静态局部模式**, 早期层必须用 Attention 和 FFN 一层层把实体拼出来, 等于在运行时重建一张本该查出来的表, 把宝贵的深度花在套话上. Engram (Cheng et al., 2026, [arXiv: 2601.07372](https://arxiv.org/abs/2601.07372)) 把这条轴叫**条件记忆**: 用经典 $N$-gram 当钥匙, 对一张大嵌入表做 $\mathcal{O}(1)$ 哈希查找, 再经上下文门控并入残差.

条件计算 (MoE) 的路由与专家在 [2.6](../../../2.6-MoE/2.6-MoE.md). 下文先讲查表本身, 再把它插进整机: 和 Attention / FFN / MoE 怎么分工, 地址为何能 prefetch, 表为什么可以放 Host.

## 问题与来历

### 卡住的问题: 静态局部模式还要靠早期层重建

语言建模其实在同时做两件不同的事. 一件是组合式推理, 必须吃深度, 吃动态计算. 另一件是检索高度刻板的局部模式: 多 token 专名, 公式化短语, 成语. 后者在经典 $N$-gram 语言模型里本来就是**查频次表**. Transformer 把两件事都塞进同一套权重之后, 早期层被迫扮演「现场拼表」的角色.

论文 Table 3 借 PatchScope 复述了一个实体解析例子: 要在隐藏态里得到 "Diana, Princess of Wales", 模型对最终一个 token「Wales」的解读逐层变化: 第 1–2 层是「英国的一个国家」, 第 3 层是「欧洲的一个国家」, 第 4–5 层变成泛指的「Princess of Wales」头衔, 到第 6 层才拼出完整人物. 这几层 Attention 和 FFN 并没有在做长程推理, 只是在把相邻 token 攒成一个静态条目. Ghandeharioun et al. (2024) 与 Jin et al. (2025) 把这类现象写成「概念深度」: 浅层在做局部聚合, 深层才做难的事. Engram 的动机是, 局部聚合不该占用那么多层.

**MoE, kNN-LM 与 KV cache 为什么替代不了查表**

把局部聚合从早期层卸掉, MoE 帮不了这个忙. 路由器看的是当前隐藏态, 专家做的是矩阵乘: 它放大的是**条件计算**. 你仍然没有一张可以按 token 串直接索引的表.

kNN-LM 走另一条极端: 把训练语料的隐藏态整库存下来做近邻, 插值 next-token 分布. 那是非参数检索, 延迟随库长走, 查的是近邻, 做不到层内 $\mathcal{O}(1)$ 查行. KV cache 存的是**本序列已经算过的** Key/Value, 随生成长度涨, 与参数表里的静态短语记忆是两个对象.

**从 n-gram 到哈希表**

### 经典 n-gram: 条件概率就是一张表

Shannon (1948) 之后, 统计语言模型长期用局部历史预测下一个词. $n$ 阶 Markov 假设下, 下一个 token 的条件概率就是计数比:

$$
P(w_t \mid w_{t-n+1}^{t-1})
=
\frac{C(w_{t-n+1}^{t})}{C(w_{t-n+1}^{t-1})}
\tag{1}
$$

$C(\cdot)$ 是语料里该 $n$-gram 的出现次数. 表的键是离散符号串, 值是一个标量 (概率或平滑后的概率). Katz (1987), Kneser and Ney (1995) 处理的是稀疏: 多数 $n$-gram 从未出现, 必须回退, 插值. Brants et al. (2007) 把这种表做到机器翻译里仍然有用, 说明**局部共现本身就携带可查的信息**, 不必每次用深度网络重新发现.

FastText (Bojanowski et al., 2017) 把「查表」从标量概率换成向量: 子词 $n$-gram 各有一条嵌入, 词向量是它们的和. 键还是离散串, 值变成 $\mathbb{R}^{d}$. Engram 沿这条线走: 不再估计式 (1) 的概率, 而是把后缀 $N$-gram 当成钥匙, 取出一条可学习的嵌入, 再交给后面的门控决定用不用. Infini-gram (Liu et al., 2024b) 证明无界 $n$-gram 计数可以做到万亿 token; Engram 不走计数, 走**可训练的哈希嵌入表**, 并且把表插进 Transformer 层中间, 不只放在输入层.

**哈希: 组合爆炸改成 $\mathcal{O}(1)$ 查槽**

直接为每个可能的 $N$-gram 开一行参数, 词表 $V$ 上是 $V^{n}$ 行, 存不下. 128k 词表的 2-gram 已有 $1.6\times10^{10}$ 种组合, 3-gram 到 $2\times10^{15}$, 而语料里真正出现过的只占极小一部分. 所以表的行数必须与组合数脱钩, 只和预算挂钩: 给定 $M$ 行, 用一个确定的函数把任意键映到 $[0, M)$.

Tito Svenstrup et al. (2017, [arXiv: 1709.03933](https://arxiv.org/abs/1709.03933)) 的 hash embeddings 已经把「组合键 → 有限槽」写成哈希: 每个键用 $k$ 个哈希函数从共享向量池里取 $k$ 条向量, 再按可学习的重要性权重加权求和, 用多次探测降低两个键完全撞在一起的概率. Engram 保留「多次独立探测」这一点, 把加权求和换成拼接, 并在哈希之前加了一步 tokenizer 压缩, 让同一段文本的不同写法先落到同一个键上.

**Tokenizer 压缩**

子词分词器优先保证可逆, 不保证语义合一: `Apple` 和 `␣apple` 往往是两个 ID. Engram 预计算一个满射 $\mathcal{P}:V\to V'$, 按 NFKC 正规化, 小写等把等价文本压成规范 ID. 论文 Appendix C Table 6 给出的压缩率是 **23.43%** (128k 词表). 合并最多的五个规范 token: 空白 `␣` 吸收了 163 个原始 token (`\t`, `\n`, `\r`, 多个空格, `\n\n` 等); `a` 吸收 54 个 (`A`, `␣a`, `á`, `ä`, `ą` 等); `o` 吸收 40 个, `e` 35 个, `i` 30 个. 合并的主要是空白变体, 大小写, 前导空格和带变音符号的字母. 位置 $t$ 的原始 ID $x_t$ 变成

$$
x'_t = \mathcal{P}(x_t),\qquad
g_{t,n} = (x'_{t-n+1},\ldots,x'_t)
\tag{2}
$$

$g_{t,n}$ 是压缩后的后缀 $n$-gram. 压缩只改钥匙, 不改 Transformer 的输入嵌入; $V$ 上的 token embedding 与 LM head 保持不动.

### 多头哈希

对每个阶 $n$ 准备 $K$ 个独立哈希头. 头 $k$ 把 $g_{t,n}$ 映到素数大小 $M_{n,k}$ 的表 $E_{n,k}$ 上的一个下标 (素数是为了乘法哈希的周期更干净):

$$
z_{t,n,k} \triangleq \varphi_{n,k}(g_{t,n}),
\qquad
e_{t,n,k} = E_{n,k}[z_{t,n,k}]
\tag{3}
$$

$\varphi_{n,k}$ 是轻量 multiplicative-XOR, **只看 token ID, 不看隐藏态**. 最终记忆向量是各阶, 各头取出的行拼接:

$$
e_t \triangleq \big\|_{n=2}^{N}\big\|_{k=1}^{K} e_{t,n,k} \in \mathbb{R}^{d_{\mathrm{mem}}}
\tag{4}
$$

Engram-27B / 40B 取 $N=3$ (只用 2-gram 与 3-gram), $K=8$, $d_{\mathrm{mem}}=1280$. 消融里在固定 1.6B 预算下把容量分给 4-gram 略差, 论文猜测是稀释了更常见的 2/3-gram; 不排除更大表上高阶会有用.

碰撞不可避免: 不同 $n$-gram 可能落到同一行. 多头是在用 $K$ 次独立探测换「单次哈希全错」的概率. 这仍然是静态先验, 3.3 节用门控处理多义和撞车.

## 与 MoE 分预算, 经门控进主干

### 条件记忆 vs 条件计算

把稀疏预算拆成两堆, 记号跟论文 §3.1 走. 去掉词表嵌入和 LM head 之后:

- $P_{\mathrm{tot}}$: 可训练总参数.
- $P_{\mathrm{act}}$: 每 token 激活参数, 决定训练 FLOPs.
- $P_{\mathrm{sparse}} \triangleq P_{\mathrm{tot}}-P_{\mathrm{act}}$: 未激活的「免费」容量 (没选中的专家, 或没取到的嵌入行).

分配比 $\rho\in[0,1]$ 是把这笔免费容量划给 MoE 专家的比例:

$$
P_{\mathrm{MoE}}^{\mathrm{(sparse)}} = \rho\, P_{\mathrm{sparse}},
\qquad
P_{\mathrm{Engram}} = (1-\rho)\, P_{\mathrm{sparse}}
\tag{5}
$$

$\rho=1$ 是纯 MoE; $\rho$ 下降则减少路由专家, 把腾出来的参数做成 Engram 槽. MoE 侧 $P_{\mathrm{act}}$ 由 top-$k$ 专家决定; Engram 侧每 token 只取常数个槽, **加槽不加每 token FLOPs**.

这就是「条件记忆」和「条件计算」的正交性:

| | 条件计算 (MoE) | 条件记忆 (Engram) |
|--|-----------------|-------------------|
| 稀疏对象 | 专家里的矩阵乘 | 嵌入表里的行 |
| 地址从哪来 | 当前隐藏态 $h_t$ (要等层算到) | 输入 token ID (层前已知) |
| 每 token 成本 | $k$ 个专家的 FFN | $K\cdot(N-1)$ 次查行 + 一次小投影/门控 |
| 表能否放 Host | 路由依赖 $h_t$, 专家通常常驻 HBM | 可以 prefetch, 表可放 DRAM |

二者互补. $\rho\to 1$: 没有专用静态表, 还是得用深度重建套话. $\rho\to 0$: 条件计算不够, 动态推理会伤, 记忆替代不了计算.

### U 形分配曲线与无限记忆区间

实验协议 (论文 §3.1): 两个计算预算, 稀疏比 $P_{\mathrm{tot}}/P_{\mathrm{act}}$ 都保持在约 10.

| 预算 $C$ | $P_{\mathrm{tot}}$ | $P_{\mathrm{act}}$ | 纯 MoE ($\rho=1$) 专家总数 |
|---|---|---|---|
| $2\times 10^{20}$ FLOPs | 约 5.7B | 568M | 106 |
| $6\times 10^{20}$ FLOPs | 约 9.9B | 993M | 99 |

不同 $\rho$ 只改路由专家数和 Engram 槽数, 训练流程与优化超参完全相同. 验证损失随 $\rho$ 呈 **U 形**. 把 MoE 份额压到 $\rho\approx 40\%$ (5.7B 档只剩 46 个专家, 9.9B 档 43 个) 时, 损失仍与纯 MoE 相当. 最优大约把 **20%–25%** 的 $P_{\mathrm{sparse}}$ 给 Engram (即 $\rho\approx 75\%\text{–}80\%$). 10B 档 ($6\times 10^{20}$ FLOPs) 上, 纯 MoE 验证损失 1.7248, 最优点附近 $\rho\approx 80\%$ 降到 1.7109($\Delta=0.0139$). Engram-27B 落地用 $\rho=74.3\%$: 路由专家 $72\to 55$, 腾出 5.7B 做表.

**无限记忆区间 (论文 §3.2).** 另一组实验放开参数预算: 固定一个 $P_{\mathrm{tot}}\approx 3$B, $P_{\mathrm{act}}=568$M 的 MoE 骨干, 训 100B token, 在上面挂 Engram 表, 槽数 $M$ 从 $2.58\times10^{5}$ 扫到 $1.0\times10^{7}$, 最多增加约 13B 参数. 按每槽 $d_{\mathrm{mem}}=1280$ 维估算, $10^{7}\times 1280=1.28\times10^{10}$, 与「约 13B」一致. 验证损失随槽数在对数坐标下近似一条直线, 即幂律. 对照组 OverEncoding 把 $N$-gram 嵌入与词表嵌入取平均, 也随表变大而改善, 但同样的记忆预算下 Engram 降得更多. SCONE 需要额外的 f-gram 模型和训练 FLOPs, 不满足等计算约束, 没有纳入对照.

### 门控并入残差: 查到的先验怎么进主干

$e_t$ 是与上下文无关的先验. 哈希碰撞和多义词会把它变成噪声. Engram 用当前隐藏态 $h_t$ 当 Query (前面的 Attention 已经聚合过全局信息), 从 $e_t$ 生成 Key / Value:

$$
k_t = W_K e_t,\qquad v_t = W_V e_t
\tag{6}
$$

标量门 $\alpha_t\in(0,1)$ 是 RMSNorm 之后的缩放点积再过 sigmoid (论文式 (4)):

$$
\alpha_t
=
\sigma\!\left(
\frac{\mathrm{RMSNorm}(h_t)^{\top}\mathrm{RMSNorm}(k_t)}{\sqrt{d}}
\right)
\tag{7}
$$

Query 和 Key 先过 RMSNorm, 论文给的理由是梯度稳定, 引用的是 ViT-22B (Dehghani et al., 2023) 对注意力 logit 做归一化的做法. 门是一个标量, 对整条 $v_t$ 统一缩放, 不做逐维选择. $\tilde{v}_t=\alpha_t\cdot v_t$. $e_t$ 和 $h_t$ 语义对不上时, 门趋向 0. 随后做短的 depthwise 因果卷积: 核宽 $w=4$, 膨胀 $\delta=$ 最大 $N$-gram 阶, SiLU, 再残差回去:

$$
Y = \mathrm{SiLU}\big(\mathrm{Conv1D}(\mathrm{RMSNorm}(\tilde{V}))\big) + \tilde{V}
\tag{8}
$$

卷积零初始化, 训练起点是恒等. 并入方式是残差加法, 然后才是该层的 Attention 和 MoE:

$$
H^{(\ell)} \leftarrow H^{(\ell)} + Y
\quad\text{再}\quad
\mathrm{Attention}\ \to\ \mathrm{MoE}
\tag{9}
$$

默认骨干用 mHC, 残差流扩成 $M=4$ 条分支 (公式见 [01 mHC](../../../2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md)). 表 $E$ 和 $W_V$ **跨分支共享**, 每条分支自己的 $W_K^{(m)}$ 负责各门各的:

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

共享 $W_V$ 加 $M$ 个独立 $W_K^{(m)}$, 这 $M+1$ 个线性投影可以拼成一次稠密 FP8 矩阵乘, 论文把这作为参数共享方案的效率理由 (§2.4).

一层 $M=4$, 两处插入, 每个 token 会算出 8 个门. 论文 Figure 7 只展示和语义模式最相关的那路: 门在专名, 套话结束处升高 ("Alexander the Great", "the Milky Way", "By the way", "四大发明", "张仲景"). 因为查的是后缀 $N$-gram ($N=3$), 位置 $t$ 门值高, 表示以 $x_t$ 结尾的那段短语被当成了静态模式. 论文注明 8 个门里只有部分分支呈现可解释的模式.

## 整机插槽与系统

### 插在哪一层

Engram 只插在少数几层. 词表嵌入和 un-embedding 保持原样. 27B / 40B 实验: 30 层, 隐藏维 2560, MLA 32 头, mHC 扩张 4, Muon 训骨干; Engram 插在 **第 2 层和第 15 层**. 每层内部顺序按式 (9): **Engram → Attention → MoE**.

Appendix A Table 5 的其余设置: MoE 模型第 1 层是稠密层, 负载均衡用 loss-free 方法; RoPE $\theta=10000$; 序列长 4096, batch 1280 条, 共 50000 步, 合计 $4096\times1280\times50000\approx 2.62\times10^{11}$, 即 262B token. 骨干用 Muon, 基础学习率 4e-4, 阶梯衰减, weight decay 0.1. Engram 嵌入表单独用 Adam, 学习率乘 5, weight decay 为 0; 卷积零初始化. 表的槽数 Engram-27B 为 2,262,400, Engram-40B 为 7,239,680. 槽数乘 $d_{\mathrm{mem}}=1280$ 再乘两个插入层: $2262400\times1280\times2\approx 5.79\times10^{9}$, $7239680\times1280\times2\approx 1.85\times10^{10}$, 分别对应正文的 5.7B 和 18.5B.

第 2 层的位置要和第 0 层 (只在输入处加) 及更深的层比较. 12 层 3B MoE + 1.6B 表的层扫描 (论文 Figure 5) 给出权衡:

- 插太早 (第 1 层): 门控的 Query 还没有做过一轮 Attention, 全局上下文弱, 多流也还没分化.
- 插太深: 静态局部模式已经被前几层用计算重建过了, 查表来晚了, 深度节省没了.
- **单点最优是第 2 层** (Val Loss 1.770 vs 纯 MoE 1.808). 一轮 Attention 够给 $h_t$ 当 Query, 又足够早, 能替底层做局部聚合.
- 同一 1.6B 拆成两块 (做法是把每块的 $d_{\mathrm{mem}}$ 减半), 放在第 2 和第 6 层, 比单点第 2 层再好一点 (1.768). 大模型把第二块放到第 15 层, 兼顾早期卸载和中层再查.

这组消融的骨干是 12 层, 3B 总参, 0.56B 激活的 MoE, 训 100B token. 参考配置用 $\{2,3\}$-gram, 插第 2 和第 6 层, 验证损失 1.768, 比纯 MoE 的 1.808 低 0.04. 在参考配置上逐项去掉组件 (表预算不变), Figure 5 中回退最大的三项是: 多分支下按分支门控, 上下文门控, tokenizer 压缩. 其中「去掉多分支」的做法是保留 mHC 骨干, 只在 mHC 的 pre-mapping $\mathcal{H}^{\mathrm{pre}}$ 之后的隐藏态上做一次单路融合. 去掉 depthwise 卷积只带来轻微回退. 把预算分一部分给 4-gram 略差.

系统侧还有第二条约束: 插得越深, 前面层的计算窗口越长, 越容易把 Host→GPU 的 PCIe 传输藏进去. 建模想要早, 系统想要晚, 第 2 层是两边都能接受的折中: 第 1 层的 Attention/FFN 刚好挡住查表延迟.

**和邻居怎么分工, 以及表示层面的证据**

和相邻模块的分工可以写成三条数据流:

1. **Attention / MLA**: 管位置之间的动态对齐, 长程指代, 提示聚焦. 局部套话不再占用注意力头, 5.2 节的 NIAH 结果与此对应.
2. **MoE / FFN**: 管需要计算的变换. DeepSeekMoE 的共享专家 + 细粒度路由仍在每层跑; Engram-27B 只是把路由专家从 72 减到 55 (仍 top-6, 2 个共享专家), 把腾出的参数做成表, 激活量仍是 3.8B.
3. **Engram**: 只提供当前位置局部 token 串对应的表向量. 表向量与上下文不符时 $\alpha_t\to 0$, 这一路的残差增量接近 0.

LogitLens: 把每层隐藏态直接过最终 LM head, 算它与最终输出分布的 KL. Engram 两个变体的 KL 都系统性更低, 差距在前几层最大, 预测更早就绪.

CKA (论文 §6.1.2) 用线性核的 Gram 矩阵 $K=XX^{\top}$, $L=YY^{\top}$:

$$
\mathrm{CKA}(K,L)=\frac{\mathrm{HSIC}(K,L)}{\sqrt{\mathrm{HSIC}(K,K)\,\mathrm{HSIC}(L,L)}}
\tag{12}
$$

HSIC 用无偏的 minibatch 估计, 数据是 Few-NERD 中命名实体最终一个 token 的隐藏态. 得到 MoE 第 $i$ 层与 Engram 第 $j$ 层的相似度矩阵 $S$ 之后, 取与第 $j$ 层最相似的 top-$k$ ($k=5$) 个 MoE 层, 按相似度加权求层号重心:

$$
a_j=\frac{\sum_{i\in\mathcal{I}_j}S_{i,j}\cdot i}{\sum_{i\in\mathcal{I}_j}S_{i,j}},\qquad
\mathcal{I}_j=\operatorname{argtop}k_i\,(S_{i,j})
\tag{13}
$$

$a_j$ 是 Engram 第 $j$ 层对应的「等效 MoE 深度」. 热图上 $a_j>j$ 在大范围层上成立, 例如 Engram-27B 第 5 层最接近 MoE 约第 12 层. 论文据此认为查表增加了模型的有效深度. 关掉表做推理时, 事实类基准只剩 29–44% (TriviaQA 29%), 阅读理解还能留 81–93% (C3 93%). 表主要扛参数化事实; 读懂段落主要靠骨干注意力. 这个实验是推理时把 Engram 输出整个置零, 骨干不动, 会造成训练与推理不一致, 在混合能力的任务上噪声大, 所以论文 §6.3 只报告事实知识和阅读理解这两端.

**地址能 prefetch, 表能放 Host**

MoE 路由依赖 $h_t$, 专家权重的访问模式要等到该层前向算完才知道, 所以专家通常得常驻 HBM. Engram 的下标 $z_{t,n,k}$ **在看到第一个隐藏态之前就定了**. 训练和推理因此可以走完全不同的存储层次.

训练: 表按行切到各 GPU, All-to-All 只搜集本步用到的行, 反向再把梯度打回去. 表容量随卡数线性涨.

推理: 整张表放 Host DRAM. 根据 token ID 在 Host 上算地址, 经 PCIe 异步把行搬进 GPU, 和前面层的计算重叠. 论文把 100B 参数的 Engram 插进稠密骨干的**第 2 个 Transformer block**, 表全部在 DRAM 里, 用 nano-vLLM 原型在 H800 上测 (512 条序列, 长度 $\mathrm{Uniform}(100,1024)$). 选稠密骨干 (Dense-4B / 8B) 是为了避开 MoE 专家并行自身的通信, 得到干净的延迟基线; PCIe 传输与第 1 个 block 的计算重叠:

| 骨干 | 配置 | 吞吐 (tok/s) | 相对跌幅 |
|------|------|--------------|----------|
| 4B-Dense | Baseline | 9,031.62 | — |
| 4B-Dense | +100B Engram (CPU offload) | 8,858.28 | 1.9% |
| 8B-Dense | Baseline | 6,315.52 | — |
| 8B-Dense | +100B Engram (CPU offload) | 6,140.02 | **2.8%** |

正文口径: 100B 表 offload 到 host memory, 惩罚可忽略, 8B 骨干上到顶 **2.8%** (引言写 $<3\%$). 这是保守基线: 所有访问都走 PCIe, 没有把高频 $n$-gram 缓进 HBM. 通信体积跟**激活槽数**成正比, 跟表的总行数不成正比. $n$-gram 服从 Zipf, 论文因此还画了多层缓存: 热行可留 HBM/DRAM, 长尾可以落到 NVMe; Table 4 本身没有测 SSD.

OverEncoding, SCONE 一类把 $n$-gram 嵌在**输入层 (Layer 0)** 的做法, 会把访存和计算串起来, 藏不住延迟. Engram 把模块往里插, 第 1 层的计算才能与查表传输重叠.

### 实验

**27B 对照: 与等参等 FLOPs 的 MoE 比较**

四套模型, 同一 262B token 课表, DeepSeek-V3 词表 (约 128k / 表里写 129280), 激活都是 3.8B:

| | Dense-4B | MoE-27B | Engram-27B | Engram-40B |
|--|----------|---------|------------|------------|
| 总参 (不含 token embed) | 4.1B | 26.7B | 26.7B | 39.5B |
| 激活 | 3.8B | 3.8B | 3.8B | 3.8B |
| 专家 (共享+路由, top-$k$) | — | 2+72 (top-6) | 2+55 (top-6) | 2+55 (top-6) |
| Engram 参数 | — | — | 5.7B | 18.5B |
| 表槽 (Appendix Table 5) | — | — | 2,262,400 | 7,239,680 |
| 插入层 | — | — | [2, 15] | [2, 15] |

Table 1 节选如下. 摘要写 MMLU +3.4, Table 1 中是 60.4 对 57.4, 即 +3.0, 正文增量与表一致.

| 基准 | Dense-4B | MoE-27B | Engram-27B | Δ vs MoE |
|------|----------|---------|------------|----------|
| MMLU 5-shot | 48.6 | 57.4 | 60.4 | +3.0 (摘要写 +3.4) |
| CMMLU 5-shot | 47.9 | 57.9 | 61.9 | +4.0 |
| BBH 3-shot | 42.8 | 50.9 | 55.9 | +5.0 |
| ARC-Challenge 25-shot | 59.3 | 70.1 | 73.8 | +3.7 |
| HumanEval 0-shot | 26.8 | 37.8 | 40.8 | +3.0 |
| MATH 4-shot | 15.2 | 28.3 | 30.7 | +2.4 |
| DROP 1-shot | 41.6 | 55.7 | 59.0 | +3.3 |
| GSM8K 8-shot | 35.5 | 58.4 | 60.6 | +2.2 |
| Pile loss | 2.091 | 1.960 | 1.950 | −0.010 |
| 验证集 loss | 1.768 | 1.634 | 1.622 | −0.012 |
| MMLU-Pro 5-shot | 21.1 | 28.3 | 30.1 | +1.8 |
| CCPM 0-shot | 72.2 | 79.6 | 87.1 | +7.5 |
| TriviaQA 5-shot | 33.0 | 48.8 | 50.7 | +1.9 |
| PopQA 15-shot | 15.1 | 19.2 | 19.4 | +0.2 |
| C3 0-shot | 57.7 | 60.1 | 63.6 | +3.5 |
| MBPP 3-shot | 35.4 | 46.6 | 48.2 | +1.6 |

表中增幅最大的是中文古诗匹配 CCPM (+7.5). 事实问答 TriviaQA 和 PopQA 的增幅反而小于 BBH 和 ARC-Challenge. 知识类有收益, 推理和代码/数学的差更大. 论文解释: 早期层不再重建套话, 有效深度和注意力容量让出来了. Engram-40B 把表加到 18.5B, 多数基准继续涨, 但没有在每个任务上压过 27B (HumanEval 40B 反而是 38.4). 作者归因于 token 预算不够, 训练后期 40B 的 loss 缺口还在拉开.

40B 相对 27B 涨得多的几项: AGIEval 41.8 → 45.9, CruxEval-i 32.2 → 36.2, MGSM 49.4 → 52.4, ARC-Challenge 73.8 → 76.4. 回落的几项: HumanEval 40.8 → 38.4, MBPP 48.2 → 46.2, C3 63.6 → 61.8, MATH 30.7 → 30.6. 两档的验证集 loss 分别是 1.622 和 1.610, 语言建模指标上 40B 仍在改善.

### 长上下文: 局部查表把注意力还给全局

预训练之后用 YaRN 做 32k 上下文延续 (5k step / 30B token, 超参 $\mathrm{scale}=10$, $\alpha=1$, $\beta=32$, 缩放 $0.707$). Table 2 的 Multi-Query NIAH:

| 模型 (预训练步数, loss) | MQ NIAH | VT |
|--------------------------|---------|-----|
| MoE-27B (50k, 1.63) | 84.2 | 77.0 |
| Engram-27B (46k, 1.63) iso-loss | **97.0** | 87.2 |
| Engram-27B (50k, 1.62) iso-FLOPs | **97.0** | **89.0** |

摘要写的 $84.2\to 97.0$, 对应 iso-loss 与 iso-FLOPs 两行的 MQ 列. iso-loss 的意思是: Engram-27B 第 46k 步的预训练 loss 与满训 MoE-27B (50k) 相同, 用它做长上下文延续, 可以排除「底座更强」这个混杂因素. 论文观察到同一架构从 41k 到 50k, 长上下文分数随预训练进度单调上升, 所以只对齐步数不够, 要对齐 loss.

Table 2 其余列 (MoE-27B 对 Engram-27B 50k): LongPPL 的 Book 4.38 对 4.14, Paper 2.91 对 2.82, Code 2.49 对 2.44, 长 CoT 轨迹 14.16 对 13.41; RULER 的 FWE 73.0 对 99.3, QA 34.5 对 40.5; CWE 两者都只有个位数 (4.5 对 5.9). 41k 早停 (约 82% 预训练 FLOPs) 的 LongPPL 与满训 MoE 基本持平 (Book 4.37 对 4.38), RULER 的 MQ 仍有 89.5. 局部依赖交给查表之后, 注意力能更多用于针检索和变量追踪.

## 采用者, 相近机制与失效

### Qwen3.8-Flash-Next: 公开权重里的 51B 级 n-gram 表

Qwen3.8-Flash-Next (权重 2026-08-26) 把主干写成 **125B 总 / 6B 每 token 激活**, 另外加 **51B n-gram 嵌入**. 51B **不进入**每 token 激活 6B, 也不进矩阵乘预算. 官方 Hugging Face 卡片: 词表嵌入 248320; **N-gram Embedding 20,000,000 (bigram/trigram, 第 2 层)**; 48 层; 隐藏维 2560. 两个数对得上: $2\times10^7$ 行乘 2560 维是 $5.12\times10^{10}$, 即约 51B. 博文与报告口径一致: 表可放 Host, 地址预先算, 和计算异步 prefetch; **只在网络靠前放一层**.

三个数字含义不同: 125B 是主模型参数, 51B 是额外的 N-gram 表, 6B 是每 token 激活参数. 51B 仍占存储容量和 Host↔GPU 带宽, 只是通过分片, 缓存和预取移出了 GPU 常驻显存与主矩阵乘路径.

**有没有点名 2601.07372 / Engram.** 技术报告 PDF (*On the Design of Qwen3.8-Next Architecture*, 28 页) 正文写 `Cheng et al., 2026`, 参考文献条目是 Xin Cheng 等, 题目 *Conditional memory via scalable lookup: A new axis of sparsity for large language models*, 会议写成 ACL 2026, 即 2601.07372. PDF 正文没有出现字符串 `Engram` 或 `2601.07372`. 阿里云博文则写 "Inspired by Per-Layer Embedding in Gemma 3n and works such as **DeepSeek Engram**". 报告引用了该文 (Cheng 2026 / 条件记忆), 博文点名 Engram.

和 Engram-27B 的差别 (以 Qwen 报告为准):

- **一层 vs 两层.** Qwen Table 7 扫了第 1/2/3/4/10/15/25 层以及 2+15, 2+25. 单层第 2 层综合最好; 多层分摊同一预算没有稳定好处. 最终放 Layer 2, 让 prefetch 和第 1 层重叠, 和 Engram 层扫描的结论同方向.
- **固定总参下的 U 形.** Table 8 把 n-gram 槽加大同时减专家, loss 在 10× 词表 (约 25% 参数比) 最低, 报告写这与 Cheng et al. (2026) 的分配甜点一致; 下游分数却没有对 MoE-only 形成清晰优势. 于是他们改成 **MoE 预算固定, 表往上加** (Table 9).
- **Tokenizer 压缩.** 报告写尝试了 Cheng et al. (2026) 的 token normalization 等, **没有稳定收益**.
- **残差.** Qwen 用 Gated Residual($n_r=4$), 不是 mHC 的双随机混合. 查表仍是「加进靠前层的残差流」.

截至 2026-09-02 的公开模型, 论文和技术报告中, Qwen3.8-Flash-Next 是第一个明确把 Engram 类 N-gram 条件记忆放进 100B+ 主模型的模型; Qwen 官方把模块命名为 N-gram Embedding. Gemma 3n 的 Per-Layer Embedding, RWKV DeepEmbed 也用大表扩容, 但机制与 Engram 的哈希 N-gram 条件记忆不同.

型号配置见 [Qwen3.8-Flash-Next 型号页](../../../../../model-library/03-模型家族/03-qwen/qwen3-8-flash-next/qwen3-8-flash-next-bi.md).

### 其他采用者与相近机制

**出厂型号.** 截至 2026-08-30, 公开材料里把「确定性 $n$-gram 大表 + Host prefetch」捆进可下载权重的, 是 Qwen3.8-Flash-Next. DeepSeek 自己的 Engram-27B / 40B 是论文实验体, 代码在 [deepseek-ai/Engram](https://github.com/deepseek-ai/Engram), V3/V4 的发布权重里没有这个模块.

**DeepSeek-V4.** 技术报告把 Cheng et al. (2026) 写在未来工作: 将探索「更稀疏的嵌入模块」, 参考文献列出 2601.07372. 这是路线图, V4 本身没有使用 Engram.

**跟进论文.** Tiny-Engram ([arXiv: 2605.20309](https://arxiv.org/abs/2605.20309)) 把触发式概念表当 PEFT; *User as Engram* ([arXiv: 2606.19172](https://arxiv.org/abs/2606.19172)) 把人均记忆写成局部参数编辑; Memory Grafting ([arXiv: 2605.20948](https://arxiv.org/abs/2605.20948)) 用冻结模型的隐状态做离线 $n$-gram 记忆; CXL pooling ([arXiv: 2603.10087](https://arxiv.org/abs/2603.10087)) 讨论条件记忆的内存池. 它们引用 2601.07372, 没有构成第二个公开百 B 出厂件.

**Engram 相关工作点了名的.** PEER (He, 2024, [arXiv: 2407.04153](https://arxiv.org/abs/2407.04153)), PKM, RETRO, OverEncoding, SCONE, BLT, Gemma 3n PLE. 论文 §7 的归类是: SuperBPE 把多词表达合并成「超词」token, SCONE 用辅助编码模型处理高频模式, OverEncoding 和 BLT 分别在 token 级和字节级用哈希 $N$-gram 嵌入; PKM, PEER, UltraMem 属于参数化记忆, 把大规模稀疏键值存储放进层内; REALM, RETRO 属于非参数记忆, 外部库可编辑. 论文没有讨论 kNN-LM 与 Hash Layers, 下表这两行是按各自原文做的机制对比.

| 机制 | 一手 | 地址 | 取出来的东西 | 为何不是 Engram |
|------|------|------|--------------|-----------------|
| kNN-LM | Khandelwal et al., [1911.00172](https://arxiv.org/abs/1911.00172) | 当前隐藏态的近邻 | 邻居的 next-token 分布, 再 $\lambda$ 插值 | 非参数库, 检索不是 $\mathcal{O}(1)$ 哈希行; 通常不改残差流 |
| Hash Layers | Roller et al., [2106.04426](https://arxiv.org/abs/2106.04426) | token ID 的哈希 | **哪一个专家 FFN 来算** | 条件计算的无参路由; 算的是矩阵乘, 不是静态嵌入 |
| PEER | He, 2024, [2407.04153](https://arxiv.org/abs/2407.04153) | 隐藏态 product-key | 海量小专家 | 查询依赖 $h_t$, 不能层前 prefetch |
| RETRO / REALM | Borgeaud et al. 2022 等 | 块级检索 | 外部可编辑文本 | 非参数, 可换库; Engram 行是训练出来的参数 |
| OverEncoding / 输入层 $n$-gram | Huang et al. 2025 等 | 同样可哈希 | 加在 Layer 0 | Engram 强调插进深层才能重叠通信; 论文写 OverEncoding 在 MoE 骨干上没有公平设定下的收益 |

### 失效模式

| 现象 | 原因 | 说明 |
|------|------|------|
| 哈希碰撞 / 多义 | 不同短语共用一行 | 靠多头 + $\alpha_t$ 抑制; 不是无碰撞完美哈希 |
| $\rho$ 太小 | 专家太少 | U 形左支: 记忆替不了动态计算 |
| $\rho=1$ | 没有表 | U 形右支: 早期层继续重建套话 |
| 只插第 0 层 | 访存与计算串行 | 藏不住 PCIe; 也失去「第 1 层当缓冲」 |
| 插太深 | 局部模式已被算过 | Figure 5 层扫描: 越深越差 |
| 推理时关掉表 | 训练–推理不一致 | 事实类崩, 阅读理解还在; 不能当「表没用」 |
门控可视化只说明「有些分支在套话结束处升高」, 不证明每条记忆都可编辑, 可干预. 把 Engram 理解成可按 key 改写的知识库, 目前没有论文级支持.

节地图: [2.8.3 条件记忆与 Engram](../2.8.3-条件记忆与Engram.md). MoE 对照: [2.6](../../../2.6-MoE/2.6-MoE.md).

**参考文献**

1. Xin Cheng et al. (2026). [Conditional Memory via Scalable Lookup: A New Axis of Sparsity for Large Language Models](https://arxiv.org/abs/2601.07372). arXiv: 2601.07372. HTML: https://arxiv.org/html/2601.07372 . 代码: https://github.com/deepseek-ai/Engram . 公式 (3)–(11) 对应论文 (1)–(7), (12)–(13) 对应论文 (8)–(9); Table 1 / 2 / 4 / 5 / 6 数字取自对应表.
2. Qwen Team (2026). [*On the Design of Qwen3.8-Next Architecture*](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf) (引用 Cheng et al., 2026; 未写 Engram 三字). [阿里云博文](https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501) (点名 DeepSeek Engram). HF: https://huggingface.co/Qwen/Qwen3.8-Flash-Next .
3. Qwen Team (2026). Qwen3.8-Next 技术报告 https://arxiv.org/abs/2608.30320 ; 官方博客 https://qwen.ai/blog?id=qwen3.8-flash-next ; NVIDIA NeMo 架构说明 https://docs.nvidia.com/nemo/automodel/model-coverage/large-language-models/qwen/qwen3-8-flash-next .
4. DeepSeek-AI (2026). DeepSeek-V4 技术报告 (未来工作一节引用 Cheng et al. 2026).
5. kNN-LM: https://arxiv.org/abs/1911.00172 ; Hash Layers: https://arxiv.org/abs/2106.04426 ; PEER: https://arxiv.org/abs/2407.04153 .
