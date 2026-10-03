---
title: "02 · MQA 与 GQA: 让多个 Query 头共享 Key/Value"
published: true
tags: ["MQA", "GQA", "Multi-Query Attention", "Grouped-Query Attention", "KV-Cache"]
excerpt: "MQA 让所有 Query 头共用一组 Key/Value, 把每 token 每层的 KV Cache 从 $2Hd_h$ 降到 $2d_h$; GQA 把 $H$ 个 Query 头分成 $G$ 组, 每组共用一组 KV, 在 $G=H$ (MHA) 与 $G=1$ (MQA) 之间取中间值. 两者都只改缓存的份数, 不改每份的维度."
---
# 02 MQA 与 GQA: 让多个 Query 头共享 Key/Value

MQA (Multi-Query Attention) 让所有 Query 头共用同一组 Key 和 Value, GQA (Grouped-Query Attention) 把 Query 头分成 $G$ 组, 每组共用一组 Key 和 Value. 两者处理的是同一个瓶颈: Decode 每生成一个 token, 都要把整份 KV Cache 从显存读一遍, 而 MHA 的缓存里每个头各有一份. 本篇沿用 [01 MHA](../01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的记号: $H$ 个 Query 头, 每头维度 $d_h$, 隐藏维 $d$, 行向量写法 $xW$.

MQA 和 GQA 只改缓存的份数: MHA 存 $H$ 份, GQA 存 $G$ 份, MQA 存 1 份, 每份仍是完整的 $d_h$ 维. 把每份压到更低维度是 [03 MLA](../03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md) 的做法, 那是另一条轴.

## 太长不看版

- [Shazeer (2019)](https://arxiv.org/abs/1911.02150) 在 WMT14 英德翻译上把全部注意力换成 MQA: dev BLEU 从 26.7 到 26.5, 解码器每 token 的推理时间从 46 μs 降到 3.8 μs (TPUv2, batch 1024).
- 同样把 KV 缩到 128 维, 直接减头数或减 $d_k$ 的方案 BLEU 只有 25.8–26.2, MQA 保留 $H$ 个 Query 头, 是这几种里最好的.
- [Ainslie et al. (2023)](https://arxiv.org/abs/2305.13245) 提出 GQA 和 uptrain 配方: 把 MHA checkpoint 的 K/V 投影按组取平均, 再用原预训练 5% 的步数继续训练. T5-XXL 上 GQA-8 平均分 47.1, MHA 47.2, MQA 46.6; 每样本耗时 0.28 s, MHA 1.51 s, MQA 0.24 s.
- 从头训练时差距更大. DeepSeek-V2 附录 D.1 的 7B 稠密模型 (1.33T token) 上, MMLU: MHA 45.2, GQA-8 41.2, MQA 37.9.
- 每 token 每层缓存: MHA $2Hd_h$, GQA $2Gd_h$, MQA $2d_h$. Decode 时每读一个缓存元素做的乘加次数: MHA 1, GQA $H/G$, MQA $H$.

---

## 1. 问题: Decode 每步都在重读 K/V

01 篇第 8.3 节引过 Shazeer (2019) §2.4.1 的分析: batch 为 $b$, 生成 $n$ 个 token, 隐藏维 $d$, MHA 逐步解码的访存与计算之比是

$$
\Theta\!\left(\frac{n}{d}+\frac{1}{b}\right) \tag{1}
$$

$1/b$ 一项可以靠加大 batch 压低; $n/d$ 一项来自每步重读形状为 $[b, H, n, d_h]$ 的 $K$ 和 $V$, 共 $bnd$ 个元素. 序列长度 $n$ 接近 $d$ 时, 这一项接近 1, 加速器大部分时间在等数据.

压低 $n/d$ 有几种思路. 限制序列长度, 只看局部窗口, 或者压缩要看的位置数, 都是减少 $n$ 的一侧. Shazeer 提出的是正交的一条: $n$ 不动, 把 $K, V$ 张量的头维度去掉, Query 保留头维度. 去掉之后, $K, V$ 的形状变成 $[b, n, d_h]$, 每步读的数据量少了 $H$ 倍. 计算量没变: 每个 Query 头仍要和全部 $n$ 个 Key 打分, 所以访存与计算之比里 $n/d$ 一项被除以 $H$, 这正是式 (7) 的形式. 加速器在 Decode 时大部分时间花在搬数据上, 少搬 $H$ 倍数据, 时间就接近按比例下降.

---

## 2. MQA: 所有 Query 头共用一组 K/V

### 2.1 公式

MHA 的三个投影都带头下标 $h$. MQA 只保留 $W_Q^{(h)}$ 的头下标, $W_K$ 和 $W_V$ 只有一份:

$$
Q^{(h)} = XW_Q^{(h)},\quad K = XW_K,\quad V = XW_V,\qquad W_K, W_V\in\mathbb{R}^{d\times d_h} \tag{2}
$$

$$
\mathrm{head}^{(h)} = \mathrm{softmax}\!\left(\frac{Q^{(h)}K^\top}{\sqrt{d_h}}+M\right)V,\qquad
\mathrm{MQA}(X) = \mathrm{Concat}\big(\mathrm{head}^{(1)},\dots,\mathrm{head}^{(H)}\big)\,W_O \tag{3}
$$

与 01 篇式 (3)–(4) 相比, 式 (3) 里的 $K, V$ 不随 $h$ 变化. $H$ 个注意力矩阵仍然各不相同, 因为 $Q^{(h)}$ 不同; 它们乘的是同一个 $V$. Shazeer 论文里的描述是: 代码与 MHA 完全相同, 只是在 einsum 里把 $K, V, P_k, P_v$ 的 `h` 去掉.

### 2.2 坐标展开

Query 的第 $i$ 维仍按头计算, Key 和 Value 没有头下标:

$$
q_{t,i}^{(h)} = \sum_{p=1}^{d} x_{t,p}\, W^{(h)}_{Q,p,i},\qquad
k_{s,i} = \sum_{p=1}^{d} x_{s,p}\, W_{K,p,i},\qquad
v_{s,u} = \sum_{p=1}^{d} x_{s,p}\, W_{V,p,u} \tag{4}
$$

打分与 01 篇式 (7) 一样可以写成双线性型:

$$
S_{t,s}^{(h)} = \sum_{i=1}^{d_h} q_{t,i}^{(h)} k_{s,i}
= x_t \underbrace{W_Q^{(h)} W_K^\top}_{B^{(h)}} x_s^\top \tag{5}
$$

MHA 里 $B^{(h)}=W_Q^{(h)}(W_K^{(h)})^\top$, 两个因子都随头变化; MQA 里第二个因子固定, 所有 $B^{(h)}$ 的行空间都落在 $W_K$ 的 $d_h$ 维列空间里. 也就是说, 各头仍然可以有不同的打分函数, 但它们在 Key 一侧只能看到同一组 $d_h$ 个特征. 输出侧同理:

$$
o_{t,u}^{(h)} = \sum_{s\le t} \alpha_{t,s}^{(h)} v_{s,u}
= \sum_{p=1}^{d} W_{V,p,u}\left(\sum_{s\le t}\alpha_{t,s}^{(h)} x_{s,p}\right) \tag{6}
$$

各头取回的内容都在 $W_V$ 的同一个 $d_h$ 维子空间里, 头间差别只剩权重 $\alpha_{t,\cdot}^{(h)}$. $W_O$ 仍按头分块, 01 篇式 (11) 的 $y_t=\sum_h o_t^{(h)}W_O^{(h)}$ 不变; 不同头取回的同一子空间内容, 经过不同的 $W_O^{(h)}$ 写进残差流的不同方向.

### 2.3 Decode 时省下了什么

Shazeer 论文 §3.1 重新做了访存分析. 生成 $n$ 个 token 的总计算量仍是 $\Theta(bnd^2)$, 总访存变成 $\Theta(bnd + bn^2k + nd^2)$, 其中 $k=d_h=d/H$. 两者之比:

$$
\Theta\!\left(\frac{1}{d}+\frac{n}{dH}+\frac{1}{b}\right) \tag{7}
$$

与式 (1) 相比, 难压的 $n/d$ 一项小了 $H$ 倍. 换成单步看: 第 $t$ 步每层读 $t\times d_h$ 的 $K$ 和 $V$, $H$ 个头都用这份数据各做一遍打分和聚合. 每读一个缓存元素, 做 $H$ 次乘加, 而 MHA 只做 1 次. 计算量没变, 读的数据少了 $H$ 倍.

MQA 不减少 Query 侧的计算. 每步仍要算 $H$ 个 $q_t^{(h)}$, 仍要做 $H$ 份 softmax. Prefill 阶段计算是瓶颈, MQA 在这里只省下 $H-1$ 份 K/V 投影, 收益不大.

| 阶段 | MHA | MQA |
|---|---|---|
| Prefill 计算 | $H$ 份 Q, $H$ 份 K/V 投影 | $H$ 份 Q, 1 份 K/V 投影 |
| Prefill 写缓存 | 每 token $2Hd_h$ 个元素 | 每 token $2d_h$ 个元素 |
| Decode 每步读缓存 (每层) | $2tHd_h$ 个元素 | $2td_h$ 个元素 |
| Decode 每步注意力乘加 (每层) | $2tHd_h$ | $2tHd_h$, 不变 |

### 2.4 共享 K/V 丢了什么

从参数上看, MHA 的 $W_K, W_V$ 合计 $2d\cdot Hd_h=2d^2$ 个参数, MQA 只剩 $2d\cdot d_h=2d^2/H$. Shazeer 实验里把省下的参数加到前馈层, 就是为了让对比只反映结构差异.

从表达上看, 丢掉的是 Key 和 Value 两侧的子空间数量. MHA 一层有 $H$ 个互不相关的 $d_h$ 维 Key 子空间, 合起来可以覆盖整个 $d$ 维隐藏空间; MQA 只有一个 $d_h$ 维子空间, 隐藏状态里落在这个子空间之外的特征, 任何头都无法拿来打分. Value 一侧同理, 各头取回的内容都是同一个 $d_h$ 维向量的不同加权平均. 各头的差异只能通过 $W_Q^{(h)}$ 和 $W_O^{(h)}$ 体现: 前者决定在共享的 Key 特征上关注什么, 后者决定取回的内容写到残差流的哪里.

01 篇第 9 节引用的剪头研究说明, 训练好的 MHA 里有大量冗余的头, 这是 MQA 只掉一点质量的一个解释. 但剪头剪的是整个头, MQA 是强制所有头共享 Key/Value 特征, 两者的约束方式不同, 前者的结论不能直接推出后者的损失有多大.

---

## 3. Shazeer 2019 的实验

### 3.1 设置

WMT14 英德翻译, 6 层编码器-解码器 Transformer, $d_{model}=1024$, $d_{ff}=4096$, $H=8$, $d_k=d_v=128$, 2.11 亿参数. MQA 版本把编码器自注意力, 解码器自注意力, 编码器-解码器注意力全部换成共享 K/V; 去掉 K/V 头少了参数, 于是把前馈层从 4096 加宽到 5440, 让总参数量相同. 对照组还有另一种缩小 K/V 的办法: 直接减头数或减每头维度, 同样靠加宽前馈层补齐参数.

### 3.2 质量

Table 1 (WMT14 英德, dev 为 newstest2013, test 为 newstest2014):

| 注意力 | $H$ | $d_k,d_v$ | 每 token KV 宽度 | ln(PPL) dev | BLEU dev | BLEU test (beam 1 / 4) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| multi-head | 8 | 128 | $2\times1024$ | 1.424 | 26.7 | 27.7 / 28.4 |
| multi-query | 8 | 128 | $2\times128$ | 1.439 | 26.5 | 27.5 / 28.5 |
| multi-head | 1 | 128 | $2\times128$ | 1.518 | 25.8 | – |
| multi-head | 2 | 64 | $2\times128$ | 1.480 | 26.2 | 26.8 / 27.9 |
| multi-head | 4 | 32 | $2\times128$ | 1.488 | 26.1 | – |
| multi-head | 8 | 16 | $2\times128$ | 1.513 | 25.8 | – |

ln(PPL) 是 dev 集上每个子词的对数困惑度, 也就是交叉熵: 1.424 对应困惑度 4.15, 1.439 对应 4.22. 「每 token KV 宽度」一列是按 $2Hd_k$ 算出来的, 论文表里没有这一列. 加上这一列以后, 后五行的 KV 宽度完全相同, 都是 MHA 的 1/8. 在同样的缓存大小下, MQA 的 BLEU 是 26.5, 其余四种是 25.8–26.2. 差别在于 MQA 保留了 8 个 Query 头, 各头仍能算不同的权重; 减头数则连 Query 的多样性一起砍掉了. test 集上 beam 4 时 MQA 甚至略高 (28.5 对 28.4).

Billion-Word 语言建模 (6 层 decoder-only, $d_{model}=1024$, $d_{ff}=8192$) 上是同样的排序: dev 困惑度 MHA 29.9, MQA 30.2, 减头或减维的四种为 30.9–31.2.

### 3.3 速度

Table 2, TPUv2 (8 核) 上每个输出 token 的摊销时间, 单位 μs:

| 注意力 | 训练 | 推理 (编码器 + 解码器) | beam-4 (编码器 + 解码器) |
|---|:---:|:---:|:---:|
| multi-head | 13.2 | 1.7 + 46 | 2.0 + 203 |
| multi-query | 13.0 | 1.5 + 3.8 | 1.6 + 32 |

推理设置是 batch 1024 条序列, 源长和目标长都是 128. 训练几乎不变, 编码器几乎不变, 解码器逐步生成从 46 μs 降到 3.8 μs, 约 12 倍. 这组数字与第 2.3 节的分析一致: 训练和编码器是并行计算, 带宽不是瓶颈; 解码器逐 token 生成, 每步都要重读 K/V, 去掉 $H$ 倍的 K/V 后速度变化最大. beam search 时每条源序列要同时维护 4 个候选, 缓存翻 4 倍, MHA 的解码器耗时涨到 203 μs, MQA 是 32 μs.

### 3.4 MQA 与局部注意力可以叠加

论文还训练了「local」版本: 解码器自注意力只看当前位置和前 31 个位置, 其余注意力层不变. 局部窗口减少的是要看的位置数 $n$, MQA 减少的是每个位置存的宽度, 两者针对式 (1) 里 $n/d$ 的不同因子. 结果: multi-head local 的 dev BLEU 26.6, multi-query local 26.5, 质量与全局版本接近; 解码器耗时从 multi-head local 的 23 μs 降到 multi-query local 的 3.3 μs, beam-4 从 47 μs 降到 16 μs. 两种方法一起用, 速度收益基本可以相乘. 后来的滑动窗口注意力加 GQA 的组合, 依据的也是这种正交性.

---

## 4. MQA 的代价

Shazeer 的实验在 2.11 亿参数的模型上, 质量损失很小. 后来的工作在更大的模型上看到了三个问题.

**第一, 质量下降与训练不稳定.** GQA 论文附录 A 报告: 他们从头训练了多个 MQA 版本的 T5-Large, 预训练中频繁出现 loss 尖峰, 在长输入任务上微调时立即发散. 从 MHA checkpoint uptrain 得到的 MQA 稳定一些, 但方差仍大, 论文对不稳定任务报告的是三次微调的平均.

**第二, 大模型上压缩得过狠.** GQA 论文 §2.2 指出, 大模型通常靠增加头数加宽, 头数越多, MQA 把 $H$ 份压成 1 份的力度越大. 64 头的模型用 MQA, 缓存缩小 64 倍, 每份 K/V 要服务 64 个 Query 头. 同时, 每 token 的 KV Cache 与 $d$ 成正比, 而参数和计算与 $d^2$ 成正比, 所以大模型本来就没那么受带宽限制. 两头一算, 大模型上 MQA 的性价比在下降.

**第三, 张量并行时要复制.** 01 篇第 10 节讲过, MHA 在张量并行下按头切到 $P$ 张卡上, 每张卡只存自己那几个头的 K/V. MQA 只有一个 K/V 头, 切不开, 标准做法是在每张卡上复制一份 (GQA 论文引 [Pope et al., 2022](https://arxiv.org/abs/2211.05102)). 8 卡张量并行时, MQA 的 KV Cache 总量是 8 份, 显存上的收益被抵掉一大部分.

这三条都指向同一个调整: 不要压到 1 份, 保留几份.

---

## 5. GQA: 组数 $G$ 是一条连续的轴

### 5.1 公式

把 $H$ 个 Query 头均分成 $G$ 组 ($H$ 能被 $G$ 整除), 每组共用一组 K/V. 头 $h$ ($h=0,\dots,H-1$) 所属的组为

$$
g(h) = \left\lfloor \frac{h\,G}{H} \right\rfloor \tag{8}
$$

例如 $H=8$, $G=4$ 时, 头 0, 1 属于组 0, 头 2, 3 属于组 1, 依此类推. 投影与注意力为:

$$
Q^{(h)} = XW_Q^{(h)},\qquad K^{(g)} = XW_K^{(g)},\qquad V^{(g)} = XW_V^{(g)},\qquad g=0,\dots,G-1 \tag{9}
$$

$$
\mathrm{head}^{(h)} = \mathrm{softmax}\!\left(\frac{Q^{(h)}\big(K^{(g(h))}\big)^\top}{\sqrt{d_h}}+M\right)V^{(g(h))} \tag{10}
$$

输出投影与 MHA, MQA 相同. 式 (10) 与式 (3) 的唯一差别是把全局 $K, V$ 换成本组的 $K^{(g(h))}, V^{(g(h))}$.

### 5.2 两个端点

GQA 论文的记法是 GQA-$G$. 两个端点退化成已知方法:

- $G=H$: 每组一个头, $g(h)=h$, 就是 MHA;
- $G=1$: 所有头一组, 就是 MQA.

打分的双线性型 $B^{(h)}=W_Q^{(h)}\big(W_K^{(g(h))}\big)^\top$ 介于两者之间: 同组的头共享 Key 一侧的 $d_h$ 维子空间, 不同组看的是不同的子空间, 全层共有 $G$ 个 Key 子空间, 而 MHA 有 $H$ 个, MQA 有 1 个.

每 token 每层缓存 $2Gd_h$ 个元素, 是 MHA 的 $G/H$. Decode 时每份 K/V 被 $H/G$ 个头复用, 每读一个缓存元素做 $H/G$ 次乘加. 以 $H=32$, $G=8$ 为例, 缓存是 MHA 的 1/4, 每读一个元素做 4 次乘加; MQA 是 32 次. GQA 论文对 Figure 6 的解释是: 大模型受 KV Cache 带宽的限制本来就较小, 而头数多使得从 MHA 压到 MQA 的缩减幅度很大, 所以从 MQA 往上加组, 起初只带来不大的减速, 越接近 MHA 代价越大.

把第 10 节第二行的配置代进去可以看到这个规律. $T=4096$, batch 为 1 时, 每生成一个 token, MHA 要读 10 GiB 缓存, GQA-8 读 1.25 GiB, MQA 读 160 MiB, 而 FP16 权重约 140 GB 每步都要读一遍. 单条序列时权重读取占大头, GQA-8 和 MQA 的差别在总访存里只占 1% 左右. batch 加到 32, 权重读取量不变, 缓存读取乘以 32: MHA 是 320 GiB, 已经超过权重; GQA-8 是 40 GiB, MQA 是 5 GiB. 所以组数的影响要放在具体的 batch 和长度下看, 单条短序列上几乎看不出来. 张量并行时, 只要 $G\ge P$ 且 $G$ 能被 $P$ 整除, 每张卡分到 $G/P$ 组 K/V, 不需要复制; $G<P$ 时又回到 MQA 的复制问题.

### 5.3 RoPE

RoPE 作用在每组的 Key 上: 组 $g$ 的历史 Key 在写入缓存时旋转一次, 得到 $R_s k_s^{(g)}$; 每个 Query 头在当前位置旋转自己的 $q_t^{(h)}$:

$$
S_{t,s}^{(h)} = \big(R_t q_t^{(h)}\big)^\top \big(R_s k_s^{(g(h))}\big) = \big(q_t^{(h)}\big)^\top R_{s-t}\, k_s^{(g(h))} \tag{11}
$$

共享 K/V 对 RoPE 没有影响, 位置信息写在每组 Key 的相位里, 同组各头用各自的 Query 去读. MQA 是 $G=1$ 的特例, 全层只有一条旋转后的 Key 序列. MLA 遇到的 RoPE 冲突在这里不存在, 因为 MQA/GQA 的缓存里存的就是完整的 Key, 不需要再经过一个上投影矩阵.

### 5.4 怎么选 $G$

$G$ 受三个约束. 第一, $G$ 必须整除 $H$, 否则各组头数不等, 式 (8) 的连续分块不成立. 第二, 张量并行度为 $P$ 时, $G$ 最好是 $P$ 的整数倍, 每张卡分到整数个组, 不复制也不跨卡读 K/V; 单机 8 卡做张量并行时, $G=8$ 正好每卡一组. 第三, 质量和带宽的权衡: GQA 论文的 Figure 6 显示 $G$ 从 1 到 8 耗时增加不多, 再往上增长加快, 它据此选 8; 第 9 节的从头训练结果又说明, 在 decoder-only 模型上 $G=8$ 与 MHA 之间仍有可见的差距.

这三条里前两条是硬约束, 第三条依赖模型规模和任务, 没有通用的最优值. 实际发布的模型里, 64 头配 8 组 (Llama 2 70B, DeepSeek 67B) 是常见选择, 对应缓存为 MHA 的 1/8.

---

## 6. 手算: $H=4$, $G=2$

取 $d=4$, $d_h=2$, $T=3$, 保留 $\sqrt{d_h}=\sqrt{2}$ 缩放, 省略 RoPE. 头 0, 1 属于组 0, 头 2, 3 属于组 1. 输入:

$$
x_1=[1,0,0,0],\quad x_2=[0,1,0,0],\quad x_3=[1,1,0,0]
$$

两组 K/V 投影 (只写前两行, 后两行全为 0):

$$
W_K^{(0)}=\begin{bmatrix}1&0\\0&1\end{bmatrix},\quad
W_V^{(0)}=\begin{bmatrix}0&1\\1&0\end{bmatrix},\qquad
W_K^{(1)}=\begin{bmatrix}0&1\\1&0\end{bmatrix},\quad
W_V^{(1)}=\begin{bmatrix}1&0\\0&1\end{bmatrix}
$$

得到两组缓存:

| $s$ | $k_s^{(0)}$ | $v_s^{(0)}$ | $k_s^{(1)}$ | $v_s^{(1)}$ |
|:---:|:---:|:---:|:---:|:---:|
| 1 | $[1,0]$ | $[0,1]$ | $[0,1]$ | $[1,0]$ |
| 2 | $[0,1]$ | $[1,0]$ | $[1,0]$ | $[0,1]$ |
| 3 | $[1,1]$ | $[1,1]$ | $[1,1]$ | $[1,1]$ |

看位置 $t=3$, 可见 $s\in\{1,2,3\}$.

**头 0 (组 0).** 设 $q_3^{(0)}=[1,1]$. 分数 $q\cdot k_s^{(0)}=[1,1,2]$, 除以 $\sqrt{2}$ 得 $[0.7071,\ 0.7071,\ 1.4142]$, 指数为 $[2.0281,\ 2.0281,\ 4.1133]$, 和为 8.1695:

$$
\alpha^{(0)}_{3,\cdot}=[0.248,\ 0.248,\ 0.503],\qquad
o_3^{(0)} = 0.248\,[0,1]+0.248\,[1,0]+0.503\,[1,1]=[0.752,\ 0.752]
$$

**头 1 (组 0).** 设 $q_3^{(1)}=[0,1]$. 分数 $[0,1,1]$, 缩放后 $[0,\ 0.7071,\ 0.7071]$, 指数 $[1,\ 2.0281,\ 2.0281]$, 和为 5.0562:

$$
\alpha^{(1)}_{3,\cdot}=[0.198,\ 0.401,\ 0.401],\qquad
o_3^{(1)} = 0.198\,[0,1]+0.401\,[1,0]+0.401\,[1,1]=[0.802,\ 0.599]
$$

头 0 和头 1 读的是同一份 $k^{(0)}, v^{(0)}$, 因为 Query 不同, 权重和输出都不同.

**头 2 (组 1).** 设 $q_3^{(2)}=[1,0]$. 用组 1 的 Key: 分数 $[0,1,1]$, 权重与头 1 相同, 为 $[0.198,\ 0.401,\ 0.401]$, 但聚合的是组 1 的 Value:

$$
o_3^{(2)} = 0.198\,[1,0]+0.401\,[0,1]+0.401\,[1,1]=[0.599,\ 0.802]
$$

头 2 和头 1 的权重一样, 输出不同, 因为它们读的是不同组的 Value. 头 3 同理.

**缓存.** 每个 token 存 2 组 $(k, v)$, 共 $2\times2\times2=8$ 个元素. MHA 要存 4 组, 16 个元素; MQA 只存 1 组, 4 个元素, 此时头 2, 3 也只能读 $k^{(0)}, v^{(0)}$.

---

## 7. 从 MHA checkpoint 转换: mean pool 加 uptrain

GQA 论文的第一个贡献不是分组, 而是一个转换配方: 已经训练好的 MHA 模型, 不必从头训练一个 MQA/GQA 版本.

**第一步, 转换.** 组 $g$ 的 K/V 投影取组内原有各头投影的平均:

$$
W_K^{(g)} = \frac{G}{H}\sum_{h:\,g(h)=g} W_K^{(h)},\qquad
W_V^{(g)} = \frac{G}{H}\sum_{h:\,g(h)=g} W_V^{(h)} \tag{12}
$$

$G=1$ 时就是对全部 $H$ 个头取平均, 得到 MQA. $W_Q^{(h)}$ 和 $W_O$ 原样保留.

**第二步, uptrain.** 用原来的预训练配方和数据, 再训练原预训练步数的 $\alpha$ 倍. 主实验取 $\alpha=0.05$, 在 T5-XXL 上约 600 TPUv3 chip-days. 论文的出发点是: 为了推理快而单独从头训练一个模型往往不现实, 而已有的大量公开 checkpoint (T5, LLaMA) 都是 MHA. 用 5% 的预训练算力换一个推理更快的版本, 原来的 MHA checkpoint 也还在, 两者可以按场景分别部署.

几个消融结果:

- **初始化方式 (Figure 4, T5-Large 转 MQA, $\alpha=0.05$).** 平均池化最好, 取第一个头次之, 随机初始化最差. 论文的解释是排序与从预训练模型保留下来的信息量一致.
- **uptrain 比例 (Figure 5, T5-XXL).** GQA 转换后不训练就有不错的效果, MQA 必须 uptrain 才能用. 两者在 5% 时都有明显收益, 到 10% 收益递减.
- **组数 (Figure 6, T5-XXL, 输入 2048, 输出 512).** 从 1 组 (MQA) 加到 8 组, 每样本耗时只增加一点; 再往上加, 耗时随组数明显增长, 逐渐接近 MHA. 论文选了 8 组.

式 (12) 只在组内平均, 所以组的划分必须和 MHA checkpoint 里的头序一致. 用式 (8) 的连续分块, 就是假设相邻编号的头放在一组; 这只是约定, 论文没有讨论按头的相似度重新分组.

---

## 8. GQA 论文的主结果与它的范围

Table 1, T5.1.1 架构, uptrain 比例 5%. 平均分是 CNN/Daily Mail, arXiv, PubMed, MediaSum, MultiNews 五个摘要任务 (ROUGE-1), WMT 英德翻译 (BLEU), TriviaQA (F1) 七项的平均; $T_{infer}$ 是在 TPUv4 上每样本每芯片的时间:

| 模型 | $T_{infer}$ (s) | 平均 | CNN | arXiv | PubMed | MediaSum | MultiNews | WMT | TriviaQA |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| MHA-Large | 0.37 | 46.0 | 42.9 | 44.6 | 46.2 | 35.5 | 46.6 | 27.7 | 78.2 |
| MHA-XXL | 1.51 | 47.2 | 43.8 | 45.6 | 47.5 | 36.4 | 46.9 | 28.4 | 81.9 |
| MQA-XXL | 0.24 | 46.6 | 43.0 | 45.0 | 46.9 | 36.1 | 46.5 | 28.5 | 81.3 |
| GQA-8-XXL | 0.28 | 47.1 | 43.5 | 45.4 | 47.7 | 36.3 | 47.2 | 28.4 | 81.6 |

读这张表要看两组对比. MQA-XXL 比 MHA-Large 更快 (0.24 对 0.37) 而且更好 (46.6 对 46.0), 说明「大模型加 MQA」优于「小模型加 MHA」. GQA-8-XXL 比 MHA-XXL 只低 0.1, 每样本耗时只比 MQA 多 0.04 s, 是 MHA 的约 1/5.

这组结果有明确的范围. 第一, 实验全部在编码器-解码器模型上, MQA/GQA 只用在解码器自注意力和交叉注意力上, 编码器自注意力保持 MHA. 交叉注意力的 Key/Value 来自编码器输出, 生成过程中不变, 也要整段缓存; 摘要任务输入 2048 个 token, 输出 512 个, 这部分缓存比解码器自注意力的还大, 所以交叉注意力上的共享对速度贡献很大. 论文在局限部分写明没有在 decoder-only 模型上评估, 只是预期 GQA 相对 MQA 的优势会更大. 第二, 模型都是 uptrain 得到的, 论文也写明没有和从头训练的 GQA 模型比较. 第三, 摘要任务用 ROUGE 评估, 作者自己承认 ROUGE 不能完整反映质量, 而长序列生成正是 KV 带宽最重要的场景.

---

## 9. 从头训练时的差距

[DeepSeek-V2](https://arxiv.org/abs/2405.04434) 附录 D.1 给了一组从头训练的对照: 三个 7B 稠密模型, 都训练 1.33T token, 除注意力外架构相同, 通过调整层数把参数量对齐到 7B 左右. 在四个较难的基准上 (Table 8):

| 基准 | shot | MQA (7.1B) | GQA-8 (6.9B) | MHA (6.9B) |
|---|:---:|:---:|:---:|:---:|
| BBH (EM) | 3 | 33.2 | 35.6 | 37.0 |
| MMLU (Acc.) | 5 | 37.9 | 41.2 | 45.2 |
| C-Eval (Acc.) | 5 | 30.0 | 37.7 | 42.9 |
| CMMLU (Acc.) | 5 | 34.6 | 38.4 | 43.5 |

这里 GQA-8 和 MHA 的差距远大于 GQA 论文里的 0.1: MMLU 差 4.0, C-Eval 差 5.2. 两组实验在多处不同: decoder-only 对编码器-解码器, 从头训练对 uptrain, 知识和推理类选择题对摘要, 所以不能简单地说哪一组是对的. 能确定的是, 「GQA 质量接近 MHA」这个结论依赖设置, 在 DeepSeek 的设置下不成立. DeepSeek-V2 正是以这组结果为理由, 去找一种缓存比 GQA 还小而质量不低于 MHA 的方案, 也就是 MLA.

---

## 10. KV Cache 字节数

全模型 $N$ 层, batch $B$, 序列长 $T$, 每元素 $s$ 字节, 三种机制的缓存统一写成

$$
\text{KV Cache 字节数} = 2 \times N \times B \times T \times G \times d_h \times s,\qquad
G=\begin{cases} H & \text{MHA}\\ G & \text{GQA} \\ 1 & \text{MQA}\end{cases} \tag{13}
$$

两组配置的数值 ($B=1$, $T=4096$, FP16):

| 配置 | MHA | GQA | MQA |
|---|:---:|:---:|:---:|
| $N=32$, $H=32$, $d_h=128$, GQA 取 $G=8$ | 2 GiB | 512 MiB | 64 MiB |
| $N=80$, $H=64$, $d_h=128$, GQA 取 $G=8$ | 10 GiB | 1.25 GiB | 160 MiB |

第二行是 Llama 2 70B 的层数和头数. [Llama 2](https://arxiv.org/abs/2307.09288) 的 34B 和 70B 用的是 GQA, 7B 和 13B 仍是 MHA; [DeepSeek LLM](https://arxiv.org/abs/2401.02954) 67B 也用 GQA, 95 层, 64 个 Query 头配 8 个 KV 头, $d_h=128$, 每 token 缓存 $2\times8\times128\times95=194{,}560$ 个元素, FP16 下约 380 KiB. 这个数在 03 篇会再用到: DeepSeek-V2 报告的「KV Cache 减少 93.3%」就是相对它算的. 使用 MQA 的模型里, GQA 论文提到了 PaLM.

缓存小了, 同样显存能放下的序列数就多了. 第二行配置下, 每条 4096 长度的序列 MHA 要 10 GiB, GQA-8 只要 1.25 GiB, 同样的缓存预算能放下的序列条数是 MHA 的 8 倍. batch 变大又进一步摊薄了每步读权重的开销, 这是 GQA 在服务吞吐上的收益比单条延迟更明显的原因.

---

## 11. 实现: 不要把 K/V 复制 $H/G$ 份

最直接的实现是把 $G$ 组 K/V 沿头维度重复 $H/G$ 次, 变成 $H$ 份, 然后调用 MHA 的 kernel. 这在数学上正确, 但如果重复后的张量真的被写出来, Decode 每步读的数据量又回到了 MHA 的水平, GQA 在带宽上的收益就没了. 正确的做法是让 kernel 按组读: 每组 K/V 读一次, 在片上给 $H/G$ 个 Query 头用. 用 PyTorch 表达时, 可以把 Query 的头维度拆成 `[G, H/G]`, 让 K/V 的 `[G, 1]` 靠广播参与矩阵乘:

```python
import math
import torch
import torch.nn.functional as F

def gqa_decode_step(x, Wq, Wk, Wv, Wo, k_cache, v_cache, H, G):
    # x: [B, 1, d]; Wq: [d, H*dh]; Wk, Wv: [d, G*dh]; Wo: [H*dh, d]
    # k_cache, v_cache: [B, G, T_old, dh], 每组一份
    B, _, d = x.shape
    dh = Wk.shape[1] // G
    q = (x @ Wq).view(B, G, H // G, dh)                     # 头按组排列: 头 h 属于组 h // (H/G), 对应式 (8)
    k_new = (x @ Wk).view(B, G, 1, dh)
    v_new = (x @ Wv).view(B, G, 1, dh)
    k_cache = torch.cat([k_cache, k_new], dim=2)            # [B, G, T, dh], 只追加 G 份
    v_cache = torch.cat([v_cache, v_new], dim=2)
    # q: [B, G, H/G, dh] 与 k: [B, G, T, dh] 在 G 维对齐, 同组 H/G 个头共用一份 K
    scores = q @ k_cache.transpose(-2, -1) / math.sqrt(dh)  # [B, G, H/G, T], 式 (10)
    attn = F.softmax(scores.float(), dim=-1).to(q.dtype)
    o = attn @ v_cache                                      # [B, G, H/G, dh]
    y = o.reshape(B, 1, H * dh) @ Wo
    return y, k_cache, v_cache
```

这段代码说明两件事. 第一, 缓存形状是 `[B, G, T, dh]`, 每步只追加 $G$ 份 $k, v$; $G=1$ 就是 MQA, $G=H$ 就是 MHA, 代码不用改. 第二, Decode 时当前只有 1 个 token, 把同组 $H/G$ 个头的 Query 排成一个小矩阵去乘同一份 $K$, 每份 $K$ 的读取被 $H/G$ 个头分摊, 这就是第 5.1 节说的「每读一个元素做 $H/G$ 次乘加」在实现上的样子.

从 MHA checkpoint 转换时还要注意头的排列: 式 (12) 按式 (8) 的连续分块取平均, 加载权重时 $W_Q$ 的头序必须和转换时一致, 否则头 $h$ 会读到别的组的 K/V, 模型能跑但效果大幅下降, 而且不会报错.

---

## 12. 失效模式与边界

| 现象 | 原因 | 处理方向 |
|---|---|---|
| MHA 直接换成 MQA/GQA 不训练, 效果差 | 共享 K/V 是新结构, MQA 尤其需要适应 | 按式 (12) 平均池化后 uptrain, 约 5% 预训练步数 |
| 从头训练 MQA 出现 loss 尖峰或微调发散 | GQA 论文附录 A 观察到的不稳定 | 改用 GQA |
| 换成 GQA 后显存没省多少 | 实现里把 K/V 重复成 $H$ 份写进了缓存或显存 | 用按组读取的 kernel |
| 张量并行后 KV Cache 总量变大 | $G$ 小于并行度, 每卡复制 | 让 $G$ 不小于并行度并能整除 |
| GQA 在知识类基准上明显不如 MHA | 从头训练的 decoder-only 设置下差距可达数个点 (DeepSeek-V2 Table 8) | 加大 $G$, 或换 MLA |
| 换成 GQA 后 Prefill 几乎没变快 | Prefill 受计算限制, GQA 只省了部分 K/V 投影 | 符合预期, 收益在 Decode |
| batch 1 的短序列 Decode 提速很小 | 每步读权重的量远大于读缓存 (见第 5.1 节的数字) | 收益随 batch 和长度增大才显现 |

转换带 RoPE 的模型时, 式 (12) 对 $W_K$ 取平均不会和位置编码冲突. RoPE 在投影之后施加, 同一位置上所有头用同一个旋转矩阵 $R_j$, 旋转是线性的, 先对各头的 Key 取平均再旋转, 与先旋转再取平均结果相同. 所以只需平均投影矩阵, 不必改动 RoPE 的实现.

MQA 和 GQA 在同一条轴上: 份数从 $H$ 往 1 减, 缓存和带宽线性下降, 质量随之下降, 下降多少取决于模型规模, 训练方式和任务. 这条轴上不管选哪个 $G$, 每份 K/V 都是完整的 $d_h$ 维向量. [03 MLA](../03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md) 保留 $H$ 个头各自的 Key 和 Value, 改为只缓存一个低维潜变量, 在 DeepSeek-V2 的配置下缓存量相当于 2.25 组的 GQA. GQA/MQA 的 PyTorch 和 CUDA 源码对照见 [2.3.1 GQA 与 MQA 源码实现分析](../../../2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/03-GQA与MQA/01-GQA与MQA源码实现分析.md).

---

## 参考文献

1. Shazeer, N. (2019). [Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150). arXiv. §2.4, §3, Table 1–3.
2. Ainslie, J., Lee-Thorp, J., de Jong, M., Zemlyanskiy, Y., Lebrón, F., & Sanghai, S. (2023). [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245). EMNLP. §2, §3, Table 1, Figure 4–6, Appendix A.
3. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434). arXiv. Appendix D.1, Table 8.
4. Pope, R., et al. (2022). [Efficiently Scaling Transformer Inference](https://arxiv.org/abs/2211.05102). arXiv.
5. Touvron, H., et al. (2023). [Llama 2: Open Foundation and Fine-Tuned Chat Models](https://arxiv.org/abs/2307.09288). arXiv. §2.2.
6. DeepSeek-AI. (2024). [DeepSeek LLM: Scaling Open-Source Language Models with Longtermism](https://arxiv.org/abs/2401.02954). arXiv. Table 2.
7. Vaswani, A., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). NeurIPS.
