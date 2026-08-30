---
title: "10 · Stable LatentMoE 与 Quantile Balancing：瘦专家空间上的超稀疏路由"
date: 2026-08-30
as_of: 2026-08-31
tags: [LatentMoE, Quantile-Balancing, SiTU-GLU, MoE, Kimi-K3]
---

# Stable LatentMoE：专家不必吃满宽，负载也不靠 $\gamma$ 去拧

Top-$k$ 变大、专家池变大，本意是让专家更专。常规 MoE 里每个被选中的专家仍吃完整的 $d$ 维 token，于是 **All-to-All 通信和专家权重流量跟 $k$ 一起涨**。NVIDIA 等的 LatentMoE（[arXiv:2601.18089](https://arxiv.org/abs/2601.18089)）把路由计算搬进 $\ell<d$ 的潜空间：通信和专家参数按 $d/\ell$ 变便宜，省下来的预算用来加专家数、加 $k$。Kimi K3 报告 §2.3 把这套接到 **896 路由专家、每 token Top-16、稀疏度 56**，并补了三块稳定性——升维前 RMSNorm、专家内 [SiTU-GLU](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md)、以及替换 $\gamma\mathrm{sign}$ 的 **Quantile Balancing**。这才叫 **Stable LatentMoE**。LatentMoE 不是 K3 发明的；K3 发明的是「这一规模上还能训」的三件套。

本篇是机制主线的第三篇（01 → 03 → 10），不是系统优化专文。容量、aux-loss、z-loss 在 [2.4.1 第 4–5 节](../2.4.1-混合专家模型MoE.md)。卡怎么切、token 怎么 dispatch、Grouped GEMM 的 Tile 怎么填，正本在 [6.1.8 / 08](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/08-MoE系统优化综述/08-MoE系统优化综述.md)。这里只改专家看到的宽度，以及 bias 怎么用分位数拧负载。

**$\ell$ 是 FFN 路由专家的宽度，不是 MLA 里压缩 KV 的 $c^{KV}$。** 两个潜空间：一个在注意力缓存，一个在专家 MLP。混名就是把 MoE 通信账和 KV 字节账并成一笔。本篇只写宽度轴上的专家层；KDA 递推、Gated MLA 的低秩 KV 各回各的专文，这里不重推。

> 邻居：[2.4.1 MoE 总览](../2.4.1-混合专家模型MoE.md) · [01 DeepSeek-MoE](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) · [SiTU-GLU](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md) · [MLA 低秩 KV](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与解耦式注意力/04-MLA-低秩潜变量与解耦式注意力.md) · 模型捆：[Kimi K3](../../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md)

K3 Table 1 把宽度钉死（本篇数字只抄该表与 §2.3，不另推）：隐藏维 $d=7168$ 与 K2 相同；**Latent MoE Dimension $\ell=3584$（$0.5\times$）**；每专家中间维从 2048 升到 3072；路由专家 384→896；每 token 激活 8→16；共享专家 1→2。总参 2.78T、激活 104.2B。$\ell=d/2$ 不是「再压一档 cache」，是路由专家的输入输出宽度。

---

## 1. 满宽专家的账：通信量跟 $k$ 一起涨

条件计算的好处是：参数可以比激活大一个数量级。代价是被选中的专家仍按满宽 $d$ 收 token。令路由专家数为 $n$、每 token 选 $k$ 个。一次 dispatch 要把每个 token 的 $d$ 维表示送到 $k$ 个专家所在的 rank；combine 再把 $k$ 份 $d$ 维结果送回。专家矩阵本身也是 $\mathbb{R}^{d}\to\mathbb{R}^{d}$ 量级（中间维另计）。于是 **$k$ 加倍，通信体积和专家权重流量近似加倍**——这正是「专家更专」想加 $n$、加 $k$ 时最先撞上的墙。

K2 已经是 384 路由 / Top-8 / 1 共享。K3 要把路由池扩到 896、把 $k$ 扩到 16，稀疏度 $896/16=56$。若专家仍吃满 $d=7168$，All-to-All 和 group GEMM 的流量相对 K2 大约按 $k$ 的倍数涨，EP 侧很难把「更专」换成可训的步时。

LatentMoE 的拆法：共享专家保留满宽路径，处理所有 token 都要用的变换；路由专家改在宽度 $\ell$ 的潜空间里算。通信和路由专家参数按 $d/\ell$ 变便宜。K3 取 $\ell=d/2=3584$，省一半路由侧流量，把预算花在 896 和 Top-16 上。共享专家仍是 $\mathbb{R}^{d}\to\mathbb{R}^{d}$，所以「稀疏度 56」**不是**「只有 1/56 的参数在动」——两路共享专家每层、每个 token 都在。

![满宽路由专家吃完整 $d$；LatentMoE 先降到 $\ell$ 再升回去。共享专家仍满宽](./images/fig-latentmoe-shared-vs-routed-ell.png)

> 图 1：满宽路由专家 vs $\ell=d/2$ 的 LatentMoE（K3 Table 1：$\ell=3584$、896 路由、Top-16、2 共享）。红框：$\ell$ **不是** MLA 的 $c^{KV}$。

**图 1 解析**

- 左：每个被选中的专家矩阵宽度仍是 $d$，All-to-All 和专家参数都跟 $d$ 走；$k$ 涨，流量涨。
- 右上：共享专家 $E^{\mathrm{shared}}$ 从原始 token 进，宽度仍是 $d$，不经过 $\mathbf{W}^{\downarrow}$。
- 右下：$\mathbf{W}^{\downarrow}$ 把 token 收到 $\ell$，路由专家只在瘦空间里算，聚合后先 RMSNorm 再 $\mathbf{W}^{\uparrow}$ 升回。
- 路由专家画成矮块，是在强调 $\mathbb{R}^{\ell}\to\mathbb{R}^{\ell}$，不是「专家变少」。池子是 896，每 token 只点亮 16 个。
- 红框把两条潜空间拆开：本图的 $\ell$ 是专家 MLP 宽度；MLA 的 $c^{KV}$ 是注意力 KV 缓存里的低维向量，见 [04 MLA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与解耦式注意力/04-MLA-低秩潜变量与解耦式注意力.md)。

---

## 2. 两个潜空间：$\ell$ 不是 $c^{KV}$

「Latent」在 K3 里出现两次，必须分开记账。

| | 住在哪 | 压什么 | K3 用到的宽度 | 推理时干什么 |
|--|--------|--------|---------------|--------------|
| MLA 的 $c^{KV}$ | 注意力 | 要缓存的 Key/Value | 低秩 KV 维 $d_c$（MLA 专文的记号；**不是** $\ell$） | decode 持久化短向量，算分时再恢复 K/V |
| LatentMoE 的 $\ell$ | 专家 FFN | 路由专家看到的 token | **$\ell=3584=d/2$**（Table 1） | 每个被路由的 token 先降维、专家算完再升维；**不进 KV cache** |

MLA 卡住的是 **每 token 的 KV 字节**（长上下文 decode）。LatentMoE 卡住的是 **专家并行时的 All-to-All 与专家权重流量**（宽专家池、大 $k$）。两者都叫 latent，张量不是同一个，模块也不是同一个。Gated MLA 层里仍然有 $c^{KV}$；它后面那一层 Stable LatentMoE 另有 $\mathbf{W}^{\downarrow}$。不要把 $\mathbf{W}^{\downarrow}$ 写成 $W^{DKV}$。

K3 的隐藏维 $d=7168$ 与 K2 相同。K2 没有 Latent MoE Dimension 这一行；K3 才写出 3584（$0.5\times$）。若有人把 3584 说成「K3 的 KV 压缩维」，那是把 Table 1 两行读串了。

---

## 3. 整机插槽：93 层里 MoE 接在注意力后面

报告 Fig. 2：K3 沿三条轴放大信息流——序列上 Hybrid Attention，深度上 AttnRes，宽度上 Stable LatentMoE。宽度轴的落点很具体：**每一层注意力后面都跟一层 Stable LatentMoE**（Table 1 另有 1 层稠密 FFN，通常是首层，不走专家路由）。

块内注意力配比是 **3 层 KDA + 1 层 Gated MLA**。Table 1 的层组成是 69 KDA + 24 MLA，合计 93。KDA 的 delta 规则、衰减门、满秩输出门写在 [KDA 专文](../../../2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md)；Gated MLA 的低秩 KV 写在 [MLA](../../../2.3-高效与稀疏注意力/2.3.5-多头潜在注意力MLA/2.3.5-多头潜在注意力MLA.md)。本篇不重推这两套算子。插槽只需记住：注意力输出仍是 $\mathbb{R}^{d}$ 的残差流，下一算子是 FFN 槽位上的 Stable LatentMoE。

数据流按层是：

1. 残差流上的 $x\in\mathbb{R}^{d}$（$d=7168$）进注意力（KDA 或 Gated MLA）。
2. 注意力输出加回残差。
3. 同一层的 FFN 槽：共享专家直接吃 $x$；路由支路 $x\mapsto\mathbf{W}^{\downarrow}x\in\mathbb{R}^{\ell}$，Top-16 个路由专家在 $\ell$ 维里做 SiTU-GLU 门控 FFN，加权求和后 RMSNorm，再 $\mathbf{W}^{\uparrow}$ 回 $d$。
4. MoE 输出加回残差，进下一层。

Gated MLA 那一层同样跟 MoE，并不因为「这一层已经有 $c^{KV}$」就改用稠密 FFN。$c^{KV}$ 只影响该层注意力怎么存 KV；FFN 槽仍按 $\ell$ 走路由专家。

![93 层：每层注意力后接 Stable LatentMoE；$\ell$ 与 $c^{KV}$ 分属 FFN 与注意力](./images/fig-latentmoe-layer-slot.png)

> 图 2：一块内 3×KDA + 1×Gated MLA，每个注意力后接 Stable LatentMoE。红框再次钉死 $\ell\neq c^{KV}$。KDA 内部递推不在本图展开。

**图 2 解析**

- 顶栏 93 层：重复「3 KDA + 1 Gated MLA」；Table 1 写 69+24。首层稠密 FFN 不画进 MoE 槽。
- 紫色注意力盒只标名字。Gated MLA 的虚线注释：$c^{KV}$ 是 KV 潜向量，不是 $\ell$。
- 每个注意力下方的薄荷色盒是本篇的对象：橙条共享专家满宽 $d$；绿条 $\mathbf{W}^{\downarrow}\to\ell=3584\to$ Top-16 of 896 $\to$ SiTU-GLU $\to$ RMSNorm $\to\mathbf{W}^{\uparrow}$。
- 「+」是残差，不是第二条路由。
- 不要从图上的四个注意力盒推出「一块里只有一个 MoE」——报告原文是 *each attention layer paired with a Stable LatentMoE*。

专家中间维 Table 1 写作 **MoE Hidden Dimension per Expert = 3072**（K2 是 2048）。这是专家 FFN **内部** 的中间宽度，不是 $\ell$。$\ell=3584$ 是路由专家看到的输入 / 吐出的输出宽度；3072 是 SiTU-GLU 那两支线性层的中间维。两者同时出现在 Table 1，不要互相替代。

---

## 4. 公式：降维、专家 FFN、升维

层内沿用 DeepSeekMoE 的共享 / 路由分工，见 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md)。共享专家 $E_j^{\mathrm{shared}}:\mathbb{R}^{d}\to\mathbb{R}^{d}$ 处理所有 token；路由侧先投影再专家。对 $\bm{x}\in\mathbb{R}^{d}$，报告式 (11)：

$$
\bm{z}=\mathbf{W}^{\downarrow}\bm{x}\in\mathbb{R}^{\ell}
\tag{1}
$$

$$
\bm{u}=\sum_{i\in\mathcal{T}_{k}(\bm{x})} p_i\, E_i^{\mathrm{routed}}(\bm{z}),
\qquad
E_i^{\mathrm{routed}}:\mathbb{R}^{\ell}\to\mathbb{R}^{\ell}
\tag{2}
$$

$$
\bm{y}=\sum_{j=1}^{N_s} E_j^{\mathrm{shared}}(\bm{x})+\mathbf{W}^{\uparrow}\operatorname{RMSNorm}(\bm{u})
\tag{3}
$$

K3 固定 **$N_s=2$**（每层都是两个满宽共享专家），$\mathcal{T}_k$ 是 Top-16，$p_i$ 由下一节的 Quantile Balancing 规则给出（bias **不进** $p_i$）。$\bm{u}\in\mathbb{R}^{\ell}$ 是路由支路在潜空间里的加权和；$\mathbf{W}^{\uparrow}$ 把它送回 $\mathbb{R}^{d}$ 再与共享支路相加。

相对「原版 LatentMoE 直接 $\mathbf{W}^{\uparrow}\bm{u}$」：K3 在升维前插入 RMSNorm。路由聚合的尺度随选中的专家集合和 $p_i$ 变，不归一化就会把共享支路打飞。报告写：这不只是稳住训练，验证 loss 和下游也一致变好。

实现上还有一条容易写错的数据流：路由器 $\mathbf{W}_r$ 仍看满宽 $\bm{x}$（下一节 $\bm{s}=\operatorname{Sigmoid}(\mathbf{W}_r\bm{x})$），**不是**看已经瘦过的 $\bm{z}$。降维只发生在被派发进专家的那条计算图上。dispatch 的对象是 $\bm{z}$，不是 $\bm{x}$——这才是通信按 $\ell$ 而不是按 $d$ 计的那一步。

通信体积可以按「每 token、每被选专家、一条向量」来数。满宽路由时 dispatch + combine 各搬 $k$ 份 $d$ 维；LatentMoE 各搬 $k$ 份 $\ell$ 维。K3 的 $d=7168$、$\ell=3584$、$k=16$，路由侧相对满宽是 $d/\ell=2$ 这一档。共享专家吃的是满宽 $\bm{x}$、每个 token 都走，**不进入**按 $\ell$ 计的 routed dispatch；省下的是路由专家流量，不是整层 FFN 都减半。专家权重同理：路由专家的输入输出宽是 $\ell$，中间维仍是 Table 1 的 3072；不要把「通信按 $\ell$」说成「专家中间维也变成 3584」。

---

## 5. 近四次连乘：RMSNorm 管尺度，SiTU-GLU 管爆炸

报告把极端稀疏下的第一类病态写得很具体：路由支路把 $\mathbf{W}^{\downarrow}$、门控多支路专家 FFN、$\mathbf{W}^{\uparrow}$ 接成 **几乎连续四次矩阵乘**。2.78T 加上这条病态链，路由支路内部激活会炸。

四次怎么数：$\mathbf{W}^{\downarrow}$（$d\to\ell$）一次；专家里 SiTU-GLU 的门支路与 up 支路各一次线性（中间维 3072）；$\mathbf{W}^{\uparrow}$（$\ell\to d$）一次。共享支路不走这条链，所以爆炸集中在路由侧。RMSNorm 加在聚合 $\bm{u}$ 与 $\mathbf{W}^{\uparrow}$ 之间，管的是 **进入升维之前的尺度**；它不管专家内部两个大坐标相乘。内部相乘要靠把 SwiGLU 换成有界的 SiTU-GLU。

K2 的激活是 SwiGLU；K3 Table 1 改成 SiTU-GLU。动机不是「再搜一个更好看的曲线」，而是这条近四次链在低精度里会出 activation outlier。SiTU-GLU 用 $\beta\tanh(x/\beta)$ 给门、up 两条乘子都加上光滑上界；K3 取 $\beta_1=4$、$\beta_2=25$，坐标 $\ell_\infty$ 界 $\beta_1\beta_2=100$。公式、原点附近与 SwiGLU 同阶、以及为什么不用 hard clamp，全部在 [01-SiTU-GLU](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md)。本篇不重推激活，只钉插槽：**SiTU-GLU 出现在路由专家 $E_i^{\mathrm{routed}}$ 内部**，共享专家同样是这个激活（Table 1 是整模型一列，没有「共享仍 SwiGLU」的分叉）。

三件套的分工可以记成一句话：RMSNorm 让路由和与共享支路尺度可加；SiTU-GLU 让专家内部乘积有界；QB 让 896 个专家的 token 数对准目标 $q$。缺哪一件都不是「同一层的另一个超参」。

---

## 6. aux-loss-free 的 $\gamma$ 步长，在 896 专家上不够用

负载均衡的旧路是训练目标里加 $f_i P_i$ 一类辅助损失（Switch 同族，见 [总览](../2.4.1-混合专家模型MoE.md)）。DeepSeek-V3 改成 **auxiliary-loss-free**：给每个专家一个只影响 dispatch、不影响混合权重的 bias。K3 沿这条路，不用 aux-loss。

对 token $\bm{x}_i$，路由器算 sigmoid 分数，Top-$k$ 看分数加 bias，混合权重 **不算 bias**。报告式 (13)：

$$
\bm{s}_i=\operatorname{Sigmoid}(\mathbf{W}_r\bm{x}_i),\qquad
\mathcal{T}_i=\operatorname{argtop}_k(\bm{s}_i+\bm{b}),
\qquad
p_{i,j}=\frac{s_{i,j}}{\sum_{r\in\mathcal{T}_i}s_{i,r}}\quad(j\in\mathcal{T}_i)
\tag{4}
$$

这是 **先 Top-$k$（在 $s+b$ 上）再按 $s$ 归一化**，不是 $\mathrm{softmax}(s+b)$。$b$ 改的是谁被选中；梯度仍走 $s$ 上的 $p$。V3 类实现把 bias 更新写成固定步长

$$
b_j\leftarrow b_j+\gamma\operatorname{sign}(\bar{\ell}-\ell_j)
\tag{5}
$$

这里的 $\ell_j$ 是专家 $j$ 的 **负载计数**，与 LatentMoE 的宽度 $\ell$ 同名不同物。$\gamma$ 太小跟不上负载漂移，太大就在过载 / 欠载之间振荡。专家数到近 $10^3$（K3 每层 896 路由），这根弹簧不再好用：报告原文是 *exceeds the regime in which existing auxiliary-loss-free bias updates remain well behaved*。负载不均会拖慢 EP，也可能让一部分专家几乎吃不到 token、训不起来。

---

## 7. Quantile Balancing：用分位数一次定 bias

QB 的目标负载是算术，不是超参。训练一步里 $m$ 个 token、 $n$ 个路由专家、每 token Top-$k$，则每专家应服务

$$
q:=\frac{mk}{n}
\tag{6}
$$

个 token（假定整除）。K3 的路由数字代入：$n=896$、$k=16$，故 $q/m=k/n=16/896=1/56$。每个专家应拿到全 batch 里 $1/56$ 的 token 份额（按「被选中次数」计，一个 token 贡献 $k$ 次）。

算法在一次前向里同时做两件事。实际路由仍是 Top-$k$；为了得到门槛，把选择改成 **Top-$(k{+}1)$**（在当前 $\bm{s}_i+\bm{b}^{(t)}$ 上）。前 $k$ 名是真正走的专家；第 $(k{+}1)$ 名的分数当作门槛 $\alpha_i^{(t)}$——专家要挤进 token $i$ 的 Top-$k$，必须超过这个截止。用 Top-$(k{+}1)$ 取出 $\alpha_i$，token 侧就不必另算一遍分位数。

固定这组截止，候选 bias $\widehat{b}_j$ 会让专家 $j$ 收到的 token 数为

$$
\sum_{i=1}^{m}\mathbf{1}\bigl[s_{i,j}+\widehat{b}_j>\alpha_i^{(t)}\bigr]
\tag{7}
$$

它对阈值 $-\widehat{b}_j$ 单调下降。无并列时，令计数等于 $q$，则 $-\widehat{b}_j$ 恰是 margin $s_{i,j}-\alpha_i^{(t)}$ 的第 $(q{+}1)$ 大，也就是这组 margin 的 $(1-k/n)$-分位数。报告式 (14)：

$$
\widehat{b}_j^{(t+1)}\leftarrow -\operatorname{quantile}_{1-k/n}\bigl(\bm{s}_{:,j}-\bm{\alpha}^{(t)}\bigr)
\tag{8}
$$

$$
\bm{b}^{(t+1)}\leftarrow\widehat{\bm{b}}^{(t+1)}-\operatorname{mean}\bigl(\widehat{\bm{b}}^{(t+1)}\bigr)\mathbf{1}
\tag{9}
$$

减均值不改 Top-$k$（公共偏移加在所有专家上，排序不变）。margin 用的是 **裸分数 $s$ 减当前截止 $\alpha$**：旧 bias 只通过 $\alpha$（它来自 $s+b^{(t)}$ 的 Top-$(k{+}1)$）进入更新，不会在 $p_i$ 里再出现一次。

两条实现约束报告写死了：

- **因果**：本 batch 算出的 $\bm{b}^{(t+1)}$ 只用于下一步。禁止用自己的路由定义自己的负载再回头路由同一 batch。
- **推理**：bias **冻结**。部署时就是带固定 $\bm{b}$ 的 Top-$k$，不再算分位数。

![不均衡 Top-k、分位数定 bias、均衡负载三步（报告 Fig. 5 玩具尺寸）](./images/fig-quantile-balancing-qb.png)

> 图 3：报告 Fig. 5 的示意重绘（$m=8,n=4,k=1$，目标 $q=2$）。不要把示意图里的 8 个点当成 K3 的真实 batch。QB 公式以 §2.3.3 为准。

**图 3 解析**

- (a) 普通 Top-$k$：负载 $(4,3,1,0)$。$E_1$ 过热，$E_4$ 虚线濒死。
- (b) 每列是该专家对所有 token 的 margin；红虚线标在第 $(q{+}1)$ 大处，用来定 $\widehat{b}_j$。$p_i$ 仍只用 $s$，不含 $b$。
- (c) 调整后每专家两人。珊瑚色边是被 QB 改派的边，不是又一种 $p_i$ 公式。
- 脚注：下一步才生效；推理冻 $b$。玩具图的 $n=4$ 与 K3 的 $n=896$ 不是同一量级，只借来看「分位数对准 $q$」这件事。

附录 C 从最大权均衡分配出发：每个 token 选恰好 $k$ 个专家、每个专家服务恰好 $mk/n$ 个 token。松弛成二分 $b$-matching 后，token 侧乘子是 $\alpha_i$、专家侧乘子是 $\beta_j$（bias $b=-\beta$）。最优时 $x_{i,j}=1$ 当且仅当 $s_{i,j}-\alpha_i-\beta_j>0$，再加 token 侧「恰好 $k$ 个」，选中的就是 $\bm{s}_i-\bm{\beta}$ 的 Top-$k$。因此 **推理只需要专家阈值 $\bm{\beta}$（即冻住的 $\bm{b}$）**；$\bm{\alpha}$ 绑在训练 batch 上，是中间量，部署丢掉。这就是「推理不再跑分位数」的代数原因，不是额外开关。

和 $\gamma\mathrm{sign}$ 的差别不在「要不要 bias」，而在 **更新算子**。$\gamma\mathrm{sign}$ 只保留负载误差的方向，步长另调；QB 直接跳到使计数等于 $q$ 的那个阈值，没有学习率式的 $\gamma$。同一对偶目标上，$\gamma\mathrm{sign}$ 是 SignSGD，QB 是该坐标的精确一维最小化。本篇不把线性规划对偶推一遍；需要对偶式时回报告附录 C 式 (20)–(27)。

和 Expert Threshold routing 的差别：后者维护 EMA 阈值，允许每 token 选中的专家个数变化。QB 仍是固定 Top-$k$（K3 为 16），变的只是 bias。

---

## 8. 直方图：百万级 margin 不能 gather

式 (8) 的分位数跨整个 global batch：margin 数量级是「百万 token × 896 专家」，还被切在数据并行 rank 和梯度累积步上。把 $O(mn)$ 个 margin gather 到一处做精确分位数，训练循环里做不到。

实践是 **每专家一份直方图**。附录 D 直方图化的是 $r_{i,j}:=\alpha_i-s_{i,j}$（把专家 $j$ 刚好放到 token $i$ 截止处所需的 bias）；取负之后顺序反转，式 (8) 的 $\widehat{b}_j$ 等于 $r_{:,j}$ 的 $(k/n)$-分位数。$s_{i,j}\in(0,1)$（sigmoid），$\alpha_i$ 来自某个专家的 $s+b$，故 $r$ 落在 $[b_{\min}-1,\,b_{\max}+1]$。把该区间均分成 $B$ 桶；K3 写 **$B=1000$ 在实践中够用**，每步按当前 $b_{\min},b_{\max}$ 重算区间，桶宽跟着 bias 的散布走。

前向里每个 rank 把本地 $r_{i,j}$ 散加进计数矩阵 $\mathbf{H}\in\mathbb{N}^{n\times B}$，微批之间只累加、不通信。一步结束做一次整数 all-reduce，得到全局直方图。设专家 $j$ 选中桶 $\beta_j$，该桶之前累计 $c_j$、桶内计数 $h_j$，桶宽 $w=(b_{\max}-b_{\min}+2)/B$，附录 D 的插值为

$$
\widehat{b}_j=b_{\min}-1+\Bigl(\beta_j+\operatorname{clip}\bigl(\tfrac{q-c_j}{h_j},0,1\bigr)\Bigr)w
\tag{10}
$$

随后按式 (9) 减均值。误差上界是桶宽；报告写 $B=1000$ 时大约 $10^{-3}$ 量级，观测不到可测的残余负载不均。通信是每层每步 $nB$ 个整数，与 $m$ 无关，相对「每微批交换原始 margin」不到 1%。因为计数可加，估计的是 **整 batch 的分位数**，不是各 rank 分位数再平均——后者一般不等于前者。

可选再对估计出的分位数做跨步 EMA，压 batch 间采样噪声。推理仍不跑直方图：冻住的是 $\bm{b}$ 本身。

---

## 9. 路由均衡不是卡间算力均衡

| | 调什么 | 不调什么 |
|--|--------|----------|
| Switch 类 aux-loss | 训练目标里加负载项 | 推理图；$p_i$ 的定义仍来自门控 |
| V3 类 bias + $\gamma\mathrm{sign}$ | 只改 dispatch，不改 $p_i$ | 仍要手调 $\gamma$ |
| **QB** | 用分位数一次性对准目标 $q$ | 不改 $p_i$；不把 bias 写进梯度；推理冻 $b$ |
| **MoonEP**（K3 §5.2.1） | EP 上每张卡算同样多 token（冗余专家迁移） | 不是又一种 $p_i$ 公式 |

MoonEP 要求每个 rank 收到恰好 $S\times K$ 个 token，使计算形状静态、通信缓冲固定为 $S\times K$。它解决的是 **卡间 token 数**；QB 解决的是 **专家间被选次数**。路由已经均衡时，专家若仍按「主 rank 持有」放置，卡间仍可能不均，需要冗余专家把过热专家的计算迁到空闲卡。两层不要并成「K3 的负载均衡就是 QB」。系统侧图解见 [08 系统优化](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/08-MoE系统优化综述/08-MoE系统优化综述.md)；本篇不重推 $E/R$ 冗余上界（报告附录 E）。

预训练配方 §3.3 把 QB 和 Per-Head Muon、K2 的 weight-clipping 写在同一段：负载均衡走 QB，不是训练后再贴一个平衡器。学习率是 cosine（1% 线性 warmup），weight decay $0.1$。这些是训练侧配套，不改变式 (3)–(9) 的前向图。

---

## 10. 失效条件

- 把 LatentMoE 的 $\ell$ 说成 MLA 的 $c^{KV}$。一个是 FFN 路由专家宽度（K3 为 3584），一个是注意力 KV 潜向量。图 1、图 2 的红框就是这条。
- 把 Table 1 的 3072（每专家中间维）写成 $\ell$，或把 3584 写成 KV 压缩维。
- 把稀疏度 56 写成「只有 1/56 的参数参与」——共享专家满宽，$N_s=2$，每层每个 token 都走。
- 把 $p_i$ 写成 $\mathrm{softmax}(s+b)$。K3 是 $s+b$ 上 Top-$k$，归一化只用 $s$。
- 用本 batch 的直方图 bias 再路由同一 batch。报告明确因果：下一步才生效。
- 推理时继续跑分位数 / 直方图。部署冻 $b$。
- 把 QB 和 MoonEP 当成同一种均衡。一个对专家，一个对 EP rank。
- 在本夹重推 KDA 的 delta 规则或 SiTU-GLU 的泰勒展开。注意力回 KDA / MLA 专文；激活回 [SiTU-GLU](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md)。

下一篇若写量化或 EP 核，从「冻住的 $b$ + 按 $\ell$ 计的 dispatch」接着，不要从满宽专家的通信模型重开。

## 参考文献

1. Moonshot AI. *Kimi K3 Technical Report*. §2.3、式 (11)–(14)、Fig. 2 / Fig. 5、Table 1、附录 C–D。[arXiv:2607.24653](https://arxiv.org/abs/2607.24653)（HTML：[2607.24653](https://arxiv.org/html/2607.24653)）
2. Elango et al. *LatentMoE*. [arXiv:2601.18089](https://arxiv.org/abs/2601.18089)（$\ell$ 控制通信，$d/\ell$ 用来加 $N$ 和 $k$；本篇不把硬件模型全文重推）
3. aux-loss-free bias：DeepSeek-V3 报告（K3 引 [27]）；$\gamma\mathrm{sign}$ 规则的表述以 K3 §2.3.3 为准
