---
title: "03 · GQA:在性能与 KV Cache 之间折中"
published: true
excerpt: "Grouped-Query Attention（GQA）由 Ainslie et al."
---
# GQA:在性能与 KV Cache 之间折中

Grouped-Query Attention（GQA）由 Ainslie et al.（2023）系统化：将 $H$ 个 Query heads 划分为 $G$ 组，每组共享一组 Key/Value heads，在 MHA 的表达能力与 MQA 的缓存效率之间取折中。Llama 2 70B、Llama 3 与 Mistral 等模型采用了 GQA。

本文沿用 [MHA](../01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 与 [MQA](../02-MQA-共享KeyValue的极致压缩/02-MQA-共享KeyValue的极致压缩.md) 记号,给出矩阵式,坐标展开,双求和,**组映射 $g(h)$**,完整数值走查,RoPE,uptrain 与 KV Cache 字节估算.**公式本体在本篇**;[2.3.1/03-GQA与MQA](../../../2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/03-GQA与MQA/01-GQA与MQA源码实现分析.md) 只做 PyTorch/CUDA **源码对照**,不在那边再推一遍 $G=H$ / $G=1$.

---

## 1. 结构直觉:$G$ 在 MHA 与 MQA 之间插值

![GQA 的分组映射与单头计算路径](./images/gqa-group-dataflow-v2.png)

> 图 1：$H=8,G=4$ 时的分组映射，以及 $h=1$ 的完整 attention 数据流。

**图 1 解析**

上半部分用容器表示组成员关系，不用箭头冒充 tensor 流。组 $g$ 内的 Query heads 共享同一对 $K_g,V_g$。下半部分展开 $h=1$：$Q_1$ 与 $K_0^\top$ 同时进入第一个 MatMul，Attention weights 再与 $V_0$ 同时进入第二个 MatMul。Key 与 Value 是两个并列输入，不存在 $K\to V$ 的计算边。

与 MHA（$G=H$）和 MQA（$G=1$）相比，GQA 在 cache 体积 $2Gd_h$ 与 KV 子空间数量 $G$ 之间折中。

![GQA 论文 Table 1 的速度与质量数据](./images/gqa-paper-tradeoff-v2.png)

> 图 2：论文 Table 1 的原始数值。GQA-8-XXL 接近 MHA-XXL 质量，速度接近 MQA-XXL。

**图 2 解析**

横轴是 **Time per sample（s）**，纵轴是七个任务的平均 dev performance。图中坐标直接来自论文 Table 1，而非概念性位置：

- **MHA-XXL**：$(1.51,47.2)$。
- **MHA-Large**：$(0.37,46.0)$。
- **MQA-XXL**：$(0.24,46.6)$。
- **GQA-8-XXL**：$(0.28,47.1)$；相对 MHA-XXL 只低 $0.1$，相对 MQA-XXL 每样本只多 $0.04\,\mathrm{s}$。

参数化边界仍是 $G=H\Rightarrow$ MHA、$G=1\Rightarrow$ MQA。增大 $G$ 保留更多 KV 子空间，但 cache 也随之增大。

---

## 2. 矩阵形式

设 $H$ 个 Query 头,$G$ 个 KV 组,$H/G \in \mathbb{N}$.组索引(常用实现):

$$
g(h) = \left\lfloor \frac{h \cdot G}{H} \right\rfloor,\quad h = 0,\ldots,H-1 \tag{1}
$$

例如 $H=8, G=4$:头 $0,1 \mapsto g=0$;$2,3 \mapsto g=1$;...

$$
Q_h = X W^Q_h \in \mathbb{R}^{L \times d_h} \tag{2}
$$

$$
K_g = X W^K_g \in \mathbb{R}^{L \times d_k},\quad
V_g = X W^V_g \in \mathbb{R}^{L \times d_v},\quad g = 0,\ldots,G-1 \tag{3}
$$

$$
\mathrm{head}_h = \mathrm{softmax}\left(\frac{Q_h K_{g(h)}^\top}{\sqrt{d_k}}\right) V_{g(h)},\quad
\mathrm{GQA}(X) = \mathrm{Concat}(\mathrm{head}_0,\ldots,\mathrm{head}_{H-1})\, W^O \tag{4}
$$

式 (4) 与 MQA 式 (3) 相同,只是把全局 $K,V$ 换成 $K_{g(h)}, V_{g(h)}$.

---

## 3. 隐藏维坐标展开

$$
q_{t,h,i} = \sum_{m=1}^{d_{\mathrm{model}}} x_{t,m}\, W^Q_{h,i,m} \tag{5}
$$

$$
k_{t,g,j} = \sum_{m=1}^{d_{\mathrm{model}}} x_{t,m}\, W^K_{g,j,m},\quad
v_{t,g,j} = \sum_{m=1}^{d_{\mathrm{model}}} x_{t,m}\, W^V_{g,j,m} \tag{6}
$$

记 $g = g(h)$:

$$
e_{t,s,h} = \frac{1}{\sqrt{d_k}} \sum_{i=1}^{d_k} q_{t,h,i}\, k_{s,g,i} \tag{7}
$$

$$
\alpha_{t,s,h} = \frac{\exp(e_{t,s,h})}{\sum_{s'} \exp(e_{t,s',h})},\quad
o_{t,h,j} = \sum_{s} \alpha_{t,s,h}\, v_{s,g,j} \tag{8}
$$

**同组多头**(如 $h=0,1$ 且 $g=0$):共享 $\{k_{s,0}, v_{s,0}\}$,但 $\alpha_{t,s,0} \neq \alpha_{t,s,1}$(因 $W^Q_0 \neq W^Q_1$).

### 3.1 输出投影

$$
y_{t,r} = \sum_{h=1}^{H} \sum_{j=1}^{d_v} o_{t,h,j}\, W_{O,\,(h-1)d_v + j,\, r} \tag{9}
$$

与 MHA/MQA 相同;GQA 的改动仅在 cache 的 KV **组数** $G$.

---

## 4. 双求和形式

$$
e_{t,s,h} = \sum_{m,n} x_{t,m}\, x_{s,n}
\underbrace{\left(\frac{1}{\sqrt{d_k}} \sum_i W^Q_{h,i,m} W^K_{g(h),i,n}\right)}_{B_{h,m,n}} \tag{10}
$$

- MHA:$g(h)=h$,$G=H$,每头独立 $W^K_h$.
- MQA:$G=1$,所有 $g(h)=0$.
- GQA:$1 < G < H$,$W^K$ 有 $G$ 套,比 MQA 多 $G-1$ 套 Key 子空间.

---

## 5. 因果掩码

对每个头 $h$ 使用同一条因果规则：

$$
M_{t,s}=\begin{cases}0,&s\le t\\-\infty,&s>t\end{cases},\qquad
\alpha_{t,:,h}=\operatorname{softmax}(e_{t,:,h}+M_{t,:}).
$$

组共享只改变该头读取哪一组 $K,V$，不改变 mask 语义。

---

## 6. 完整数值走查:$H=4,\, G=2,\, d_h=2,\, L=3$

$d_{\mathrm{model}}=4$;头 $0,1 \to g=0$;头 $2,3 \to g=1$.

$$
x_1=[1,0,0,0],\ x_2=[0,1,0,0],\ x_3=[1,1,0,0]
$$

**组 0**:$W^K_0 = W^V_0$ 取 $W^K$(MHA 篇数值例同款)→ $k_{s,0}, v_{s,0}$ 与 MQA 表相同.  
**组 1**:$W^K_1$ 交换 $W^K$ 两列 → 另一套 $k_{s,1}, v_{s,1}$.

**头 0**($g=0$):$W^Q_0 = W^K_0$,$t=3$ 时 $q_{3,0}=[1,1]^\top$,

$$
e_{3,s,0} = \frac{1}{\sqrt{2}} q_{3,0}\cdot k_{s,0}
\Rightarrow \alpha_{3,\cdot,0} \approx [0.157, 0.157, 0.686]
$$

**头 1**(仍 $g=0$):设 $W^Q_1$ 使 $q_{3,1}=[0,1]^\top$,

$$
e_{3,1,1}=0,\ e_{3,2,1}=\frac{1}{\sqrt{2}},\ e_{3,3,1}=\frac{1}{\sqrt{2}}
\Rightarrow \alpha_{3,\cdot,1} \approx [0.211, 0.394, 0.394]
$$

**同一** $v_{s,0}$,不同 $\alpha$ → $o_{3,0} \neq o_{3,1}$.

**头 2**($g=1$):用 $k_{s,1}, v_{s,1}$,独立 softmax;与头 0/1 的 cache **不共享**.

**Cache**:存组 0,组 1 各一份 $(k,v)$ → **2 组**;MHA 需 4 组;MQA 需 1 组.

---

## 7. RoPE 与 GQA

每组共享一条 RoPE 后的 Key 序列 $\tilde{k}_{s,g}$;Query 仍 per-head 旋转:

$$
e_{t,s,h} = \frac{1}{\sqrt{d_k}} \bigl(R_t q_{t,h}\bigr)^\top \bigl(R_s k_{s,g(h)}\bigr) \tag{11}
$$

$G$ 组即 $G$ 条独立的 RoPE Key 轨迹;比 MQA 多 $(G-1)$ 条,比 MHA 少 $(H-G)$ 条.

---

## 8. 从 MHA checkpoint 构造 GQA

**划分**:将头 $0..H-1$ 均分为 $G$ 块,块 $g$ 含 $H/G$ 个头.

**Mean pool**(块内):

$$
W^K_g = \frac{G}{H} \sum_{h \in \mathrm{group}_g} W^K_h
= \frac{1}{H/G}\sum_{h \in \mathrm{group}_g} W^K_h \tag{12}
$$

$W^V_g$ 同理.$W^Q_h, W^O$ 继承 MHA.

![MHA checkpoint 转换为 GQA 并继续预训练](./images/gqa-uptraining-v2.png)

> 图 3：每个 KV group 只汇聚对应组内的 K 或 V projections；转换后的完整 GQA checkpoint 再进入 uptraining。

**图 3 解析**

- $W^Q_0,\ldots,W^Q_7$ 与 $W^O$ 直接继承，绕过 Mean Pool。
- 每个绿色 Mean 节点只接收本组的两个 $W^K_h$；每个橙色 Mean 节点只接收本组的两个 $W^V_h$。
- 所有继承和 pooled 参数共同组成 **Converted GQA**，这是继续预训练箭头的唯一输入。

论文以原预训练步数的比例 $\alpha$ 继续训练；主实验取 $\alpha=0.05$。Figure 6 显示组数从 1 增到 8 时延迟增幅温和，继续增加则逐渐接近 MHA 成本。

---

## 9. KV Cache 量级

| 机制 | 维度 / token / layer | 相对 MHA |
|------|----------------------|----------|
| MHA | $2 H d_h$ | $1$ |
| GQA | $2 G d_h$ | $G/H$ |
| MQA | $2 d_h$ | $1/H$ |

相对倍数就是表里的 $G/H$ 或 $1/H$,不要另编.

![GQA Decode 阶段的 KV Cache 写入读取与字节数](./images/gqa-decode-cache-v2.png)

> 图 4：$H=32,G=8,d_h=128$ 时，单步 decode 的 Q/K/V 数据流、KV Cache 读写与完整字节计算。

**图 4 解析**

- 当前 token 的 $Q_t\in\mathbb{R}^{32\times128}$ 只参与本步计算，不写入 cache。
- $K_t,V_t\in\mathbb{R}^{8\times128}$ 分别 append 到各自 cache；写入边和历史读取边是两组不同的单向边。
- 每个 KV group 被 4 个 Query heads 读取。Grouped Attention 的输入是当前 $Q_t$ 与历史 $K_{\text{cache}},V_{\text{cache}}$。

全模型($N$ 层,$B$,$L$,元素 $s$ 字节):

$$
\text{KV}_{\mathrm{GQA}} = 2 \cdot N \cdot B \cdot L \cdot G \cdot d_h \cdot s \tag{13}
$$

**例**:$H=32,\ G=8,\ d_h=128,\ N=32,\ L=4096,\ B=1,\ s=2$:

- MHA：$2\,\mathrm{GiB}$。
- GQA：$512\,\mathrm{MiB}$，为 MHA 的 $1/4$。
- MQA：$64\,\mathrm{MiB}$，为 MHA 的 $1/32$。

---

## 10. Prefill 与 Decoding

| 阶段 | 行为 |
|------|------|
| Prefill | 算 $H$ 路 $Q$ + **$G$ 路** $K,V$;写入 $G$ 组 cache |
| Decode | 每步生成并 append $G$ 个 $k_{t,g}$ 与 $G$ 个 $v_{t,g}$；随后读取截至位置 $t$ 的两份 cache |

相对 MQA,Decode 每步多写 $(G-1) \times 2 d_h$ 元素;相对 MHA 少写 $(H-G) \times 2 d_h$.

---

## 11. 为何 GQA 常优于「直接 MQA」

式 (10) 中 $G>1$ 允许多个独立的 Key 子空间 $\mathrm{span}(W^K_g)$,比 MQA 单空间更贴近 MHA 的 $H$ 路 KV 分工.图 2 显示 GQA-XXL **质量接近 MHA-XXL** 而 **延迟接近 MQA**--这是 LLaMA-3 等选 $G=8$ 而非 $G=1$ 的主因.

---

## 12. 实现伪代码

```python
def g(h, H, G):
    return h * G // H

Q = einsum("bld,hde->bhle", X, W_Q)           # [B,H,L,d_h]
K = einsum("bld,gde->bgle", X, W_K)           # [B,G,L,d_h]
V = einsum("bld,gde->bgle", X, W_V)           # [B,G,L,d_h]

outs = []
for h in range(H):
    gh = g(h, H, G)
    scores = einsum("btd,bsd->bts", Q[:, h], K[:, gh]) / sqrt(d_h)
    scores = scores + causal_mask
    attn = softmax(scores, dim=-1)
    outs.append(einsum("bts,bsd->btd", attn, V[:, gh]))
# cache: K_cache[g], V_cache[g] each [B,T,d_h]
```

向量化实现常把 $h$ 按组 batched,避免 Python for.

---

## 13. 训练与失效模式

| 现象 | 说明 |
|------|------|
| $G$ 过小，perplexity 上升 | 试增大 $G$ 或延长 uptraining |
| $G$ 过大吞吐差 | 接近 MHA cache,失去 GQA 意义 |
| 组划分与 checkpoint 不对齐 |  pool 时应按**训练时头序**分块 |

---

## 14. 小结

GQA 用式 (1) 的 $g(h)$ 把 MHA/MQA 连成一条轴:$G=H$  MHA,$G=1$  MQA.式 (7)–(10) 与 MHA 同构;§6 展示**同组共享 KV,异 $\alpha$**;§9 给出 cache 定量.更激进压缩见 [MLA](../04-MLA-低秩潜变量与矩阵吸收/04-MLA-低秩潜变量与矩阵吸收.md).实现细节回 [2.3.1 源码对照](../../../2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/03-GQA与MQA/01-GQA与MQA源码实现分析.md).

---

## 参考文献

1. Ainslie, J. et al. (2023). *GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints.* arXiv:2305.13245.
2. Dai, D. et al. (2024). *DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model.* arXiv:2405.04434.
3. Shazeer, N. (2019). *Fast Transformer Decoding: One Write-Head is All You Need.* arXiv:1911.02150.
4. Vaswani, A. et al. (2017). *Attention Is All You Need.* NeurIPS.




