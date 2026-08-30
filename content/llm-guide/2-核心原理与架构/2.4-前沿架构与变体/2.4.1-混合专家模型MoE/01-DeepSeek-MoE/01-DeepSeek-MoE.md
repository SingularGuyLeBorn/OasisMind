---
title: "01 · DeepSeek MoE：共享专家与细粒度路由"
date: 2026-08-30
as_of: 2026-08-30
tags: [MoE, DeepSeekMoE, 共享专家, 细粒度路由, aux-loss-free]
math: true
---

# 01 DeepSeek MoE：共享专家与细粒度路由

DeepSeekMoE 要解决的不是「再堆几个和稠密 FFN 一样宽的专家」，而是：**专家切细之后，通用知识和专用知识怎么拆开，路由分数怎么变成真正稀疏的门控。** 瓶颈是知识混杂（一个宽专家被迫装互不兼容的模式）和知识冗余（多个路由专家各自再学一遍通用变换）。V1（[arXiv:2401.06066](https://arxiv.org/abs/2401.06066)）定下共享专家 always-on + 细粒度切分，门控是**先 Softmax 再 Top-$K$**；V2 沿用这套公式并加上设备数上限；V3 把亲和度改成独立 Sigmoid，选中集合再归一化，负载靠 aux-loss-free 偏置而不是把 $f_i P_i$ 当主损失。

本篇是 2.4.1 的机制专文，只写 **MoE 层**。注意力侧的 MLA 不在这里推：[2.2.2/04 MLA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与解耦式注意力/04-MLA-低秩潜变量与解耦式注意力.md)。MTP 走 [2.4.6](../../2.4.6-多Token预测MTP深度解析.md)。EP / All-to-All 拓扑走 [07](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md) 与 [6.1.1](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.1-分布式训练/6.1.1-分布式训练.md)。总览里的 Token-Choice、Switch 辅助损失见 [2.4.1](../2.4.1-混合专家模型MoE.md)。

---

## 1. 常规 MoE 差在哪：混杂与冗余

标准 Decoder 块先做注意力，再把残差后的隐藏态送进 FFN。第 $l$ 层、长度 $T$、隐藏维 $d$：

$$
\mathbf{u}_{1:T}^{l}=\operatorname{Self\text{-}Att}(\mathbf{h}_{1:T}^{l-1})+\mathbf{h}_{1:T}^{l-1} \tag{1}
$$

$$
\mathbf{h}_{t}^{l}=\operatorname{FFN}(\mathbf{u}_{t}^{l})+\mathbf{u}_{t}^{l} \tag{2}
$$

层归一化在叙述里省略，与论文一致。MoE 的插槽就是式 (2) 里的 $\operatorname{FFN}(\cdot)$：注意力子层不动，把这一次逐 token 的前馈换成一组专家。GShard / Switch 一类做法是：准备 $N$ 个与标准 FFN **同宽** 的专家，每个 token 只进 Top-$K$（常取 $K=1$ 或 $2$）：

$$
\mathbf{h}_{t}^{l}=\sum_{i=1}^{N} g_{i,t}\,\operatorname{FFN}_{i}(\mathbf{u}_{t}^{l})+\mathbf{u}_{t}^{l} \tag{3}
$$

$$
g_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=1}^{N},K)\\
0, & \text{otherwise}
\end{cases} \tag{4}
$$

$$
s_{i,t}=\operatorname{Softmax}_{i}\bigl((\mathbf{u}_{t}^{l})^{\top}\mathbf{e}_{i}^{l}\bigr) \tag{5}
$$

$\mathbf{e}_{i}^{l}$ 是该层第 $i$ 个专家的可学习质心。$g_{i,t}$ 稀疏，所以算力按 $K/N$ 降，参数却按 $N$ 涨。

[2401.06066](https://arxiv.org/html/2401.06066) §1 指出这条路有两处结构性缺陷。**知识混杂**：专家个数少（常见 $N=8$ 或 $16$）时，分到同一个专家的 token 覆盖多种互不兼容的模式，一个宽 FFN 只能学「平均化」的变换。**知识冗余**：不同专家仍需要同一套通用计算（规范化、常见句法），于是各专家参数里重复存一份。两者合在一起，稀疏度有了，专家特化没有。DeepSeekMoE 的两刀——细粒度切分、共享专家隔离——就是对着这两点来的，而不是对着通信拓扑来的。

---

## 2. 细粒度切分：参数总量不变，组合数爆炸

保持专家参数总量和每次前向的 FLOPs 不变，把每个宽专家沿 FFN 中间维切成 $m$ 个窄专家：中间隐层从原来的宽度变成 $1/m$。激活个数同步乘 $m$，从 $K$ 变成 $mK$：

$$
\mathbf{h}_{t}^{l}=\sum_{i=1}^{mN} g_{i,t}\,\operatorname{FFN}_{i}(\mathbf{u}_{t}^{l})+\mathbf{u}_{t}^{l} \tag{6}
$$

$$
g_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=1}^{mN},mK)\\
0, & \text{otherwise}
\end{cases} \tag{7}
$$

$$
s_{i,t}=\operatorname{Softmax}_{i}\bigl((\mathbf{u}_{t}^{l})^{\top}\mathbf{e}_{i}^{l}\bigr) \tag{8}
$$

非零门控个数从 $K$ 变成 $mK$，但每个专家更窄，乘积对应的矩阵 FLOPs 与切分前对齐。论文给的组合例子：$N=16$、Top-2 只有 $\binom{16}{2}=120$ 种激活组合；切 $m=4$ 之后变成 $64$ 个窄专家、激活 $8$ 个，$\binom{64}{8}=4{,}426{,}165{,}368$。组合空间变大，路由器才有机会把「这段是代码缩进、那段是中文虚词」拆到不同窄专家，而不是塞进同一个宽 FFN。

2B 验证实验里，每个专家相对标准 FFN 的尺寸是 $0.25$（即 $m=4$ 这一档），总专家参数仍等于 $16$ 个标准 FFN，激活专家参数等于 $2$ 个标准 FFN。

---

## 3. 共享专家：通用计算不再走路由

细切之后，冗余问题还在：每个窄路由专家仍可能各自学一遍「所有 token 都要的」变换。做法是再划出 $K_{s}$ 个专家当**共享专家**：路由器不参与，每个 token **必然**经过它们。为保持算力不变，路由侧激活数减 $K_{s}$，从 $mK$ 变成 $mK-K_{s}$：

$$
\mathbf{h}_{t}^{l}
=\sum_{i=1}^{K_{s}}\operatorname{FFN}_{i}(\mathbf{u}_{t}^{l})
+\sum_{i=K_{s}+1}^{mN} g_{i,t}\,\operatorname{FFN}_{i}(\mathbf{u}_{t}^{l})
+\mathbf{u}_{t}^{l} \tag{9}
$$

$$
g_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=K_{s}+1}^{mN},mK-K_{s})\\
0, & \text{otherwise}
\end{cases} \tag{10}
$$

$$
s_{i,t}=\operatorname{Softmax}_{i}\bigl((\mathbf{u}_{t}^{l})^{\top}\mathbf{e}_{i}^{l}\bigr) \tag{11}
$$

记号对照：共享专家个数 $K_{s}$（V2/V3 写作 $N_{s}$），路由专家总数 $mN-K_{s}$（写作 $N_{r}$），非零路由门控个数 $mK-K_{s}$（写作 $K_{r}$）。共享支路在式 (9) 里**没有**乘 $g_{i,t}$，等价于权重恒为 $1$。DeepSpeed-MoE（Rajbhandari et al., 2022）里出现过类似 always-on 专家，论文明确说那是工程视角；这里是算法视角：把公共知识压进共享参数，让路由专家不必再复制。

2B 消融（论文 Figure 3）：在 GShard 上只隔离 $1$ 个共享专家，多数基准上升；再把专家从 $16$ 切到 $32$（$1+31$）再到 $64$（$1+63$），总体继续升。共享与细粒度不是互相替代的一刀。Table 2 把 MoE 容量上界做成「$16$ 个共享专家、每个与标准 FFN 同宽」的 Dense$\times 16$：Pile loss 同为 $1.808$，HellaSwag $54.8$ 对 $55.1$。在约 $2$B 参数、$100$B token 下，细粒度加共享已经贴近这个上界；同表里 GShard$\times 1.5$（专家参数与算力都乘 $1.5$）才刚追上 DeepSeekMoE。关掉共享专家、再多激活一个路由专家（算力不变），Pile loss 从 $1.808$ 升到 $2.414$：共享支路学到的不是路由专家能顶上的那份。固定总专家 $64$、激活总数不变时，$1/2/4$ 个共享的 Pile 分别为 $1.808/1.806/1.811$，放大时论文把共享与激活路由之比钉在 $1:3$（16B 的 $2:6$ 即此）。

![共享专家 always-on，路由专家 Top-K](./images/fig-deepseek-moe-shared-routed.png)

> 图 1：DeepSeekMoE 层。下为 $u_t$，左绿共享专家实线全开，右蓝路由专家经 Router / Top-$K_r$ 虚线选中后再乘门控。输出 $h'_t$。对应 [2401.06066](https://arxiv.org/html/2401.06066) Figure 2(c)。旧截图 `image_0.png`–`image_2.png` 仍在同夹，不再引用。

**图 1 解析**

自下而上读。

- **底部 $u_t$**：注意力残差之后、进入 FFN 插槽的隐藏向量，对应式 (1) 的 $\mathbf{u}_{t}^{l}$。每个 token 独立路由，序列维不在这里做注意力。
- **左列绿盒 $N_s$ 个共享专家**：实线从 $u_t$ 直连每个绿盒，再直连顶部求和。没有 Top-K，也没有虚线门控。实现上就是 $N_s$ 次（较窄的）SwiGLU-FFN，输出相加，对应式 (9) 第一项。
- **中列黄盒 Router**：算 $s_{i,t}=u_t^{\top}e_i$ 再按版本做 Softmax 或 Sigmoid。条形图是 Top-$K_r$ 的离散选择，不是注意力权重。
- **右列蓝盒 $N_r$ 个路由专家**：实线表示 $u_t$ 在逻辑上对所有路由专家可见，但只有被选中的几路在 $\times$ 处乘上 $g_{i,t}$（未选中为 $0$），对应式 (9) 第二项。
- **顶部 $+$ → $h'_t$**：共享输出 + 加权路由输出。残差 $u_t$ 写在式 (9) 末项，与稠密块式 (2) 的 skip 是同一件事，不是在 MoE 外面再加第二次。

浅色图已核：白底、深字、粉彩描边。不重画。同夹 `fig-mla-latent-cache.png` 是注意力 KV 压缩，本篇不引用，避免把 $c^{KV}$ 读成共享专家。

---

## 4. 整机插槽：替换 FFN，不是替换 MLA

DeepSeek-V2 / V3 的一张整机图上同时出现 MLA 和 DeepSeekMoE。分工必须钉死：**MLA 改的是注意力怎么缓存 KV；MoE 改的是残差后的前馈怎么条件计算。** 二者串联，不是互相替换。

![DeepSeekMoE 替换 FFN 插槽，注意力子层不动](./images/fig-deepseek-moe-ffn-slot.png)

> 图 2：浅色自绘。左栏稠密块的黄色 Dense FFN 被右栏绿色 DeepSeekMoE 层替换；蓝色 Self-Attention / MLA 保持原位。算法视角：残差后的 $u_t$ 派发到 $N_s$ 个共享专家与 $K_r$ 个路由专家再求和。

**图 2 解析**

- **左栏自下而上**：$\mathbf{h}^{l-1}$ → 注意力 → 残差得 $\mathbf{u}^{l}$ → 稠密 FFN → 残差得 $\mathbf{h}^{l}$。红虚线框住的是**唯一被换掉的插槽**。
- **右栏**：注意力子层标注「MLA 是另一篇」，提醒不要在本页展开 $W^{DKV}$。绿盒吃的是注意力残差后的 $u_t$，吐出的 $h'_t$ 已含式 (12) 里的 $u_t$ 残差。
- **底部说明**：这里只画「派发给哪些专家」，不画 GPU 上的 All-to-All。通信次数随覆盖设备数涨，那是系统账，见 §6 末的指针。

**层内数据流（算法，逐步）**

1. 位置 $t$ 的隐藏态过注意力（V1 用 MHA，V2/V3 用 MLA），加残差，得到 $u_t$。
2. 共享专家：本地（或与通信重叠）计算全部 $N_s$ 路 $\operatorname{FFN}^{(s)}_{i}(u_t)$。
3. 路由：用 $u_t$ 与 $N_r$ 个质心打分，按 §5 / §7 的版本规则取出 $K_r$ 个专家及门控 $g_{i,t}$。
4. 把 $u_t$ **dispatch** 到这 $K_r$ 个路由专家；算完再 **combine** 加权求和。
5. 与共享输出、残差相加，得到本层 $h'_t$，送下一层注意力。

哪些层换、哪些层不换，也是插槽的一部分。V1 16B 与 V2：**除第一层外**全部 FFN 换成 MoE，因为第一层负载均衡收敛明显更慢。V3：**除前三层外**换成 MoE。留下的稠密 FFN 仍是式 (2)，不参与路由。

V2 训练里共享专家计算与专家并行的 All-to-All 重叠，那是把 always-on 支路变成通信掩盖，**不改变**式 (12)。真正的 EP 映射、节点内 NVLink / 跨节点 IB，见 [07](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md) 与 [6.1.1](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.1-分布式训练/6.1.1-分布式训练.md)，本篇不把通信拓扑当主叙事。

---

## 5. 配置表：只抄论文与报告

V2 起统一用 $N_s,N_r,K_r$ 重写式 (9)–(11)：

$$
\mathbf{h}'_{t}
=\mathbf{u}_{t}
+\sum_{i=1}^{N_{s}}\operatorname{FFN}^{(s)}_{i}(\mathbf{u}_{t})
+\sum_{i=1}^{N_{r}} g_{i,t}\,\operatorname{FFN}^{(r)}_{i}(\mathbf{u}_{t}) \tag{12}
$$

下表数字来自 [2401.06066](https://arxiv.org/html/2401.06066) §5.1.2 / Table 7、[2405.04434](https://arxiv.org/html/2405.04434) §3.1.2、[2412.19437](https://arxiv.org/html/2412.19437) §4.2，不另编。

| 模型 | 总参 / 激活 | 层数 / $d$ | 稠密 FFN | $N_s$ | $N_{r}$（激活 $K_r$） | 专家中间维或相对宽度 | 预训练 token |
|------|-------------|------------|----------|-------|----------------------|------------------------|--------------|
| DeepSeekMoE 2B（验证） | $\approx 2.0$B / $0.3$B | $9$ / $1280$ | 全部 MoE | $1$ | $63$（$7$） | $0.25\times$ 标准 FFN | $100$B |
| DeepSeekMoE 16B | $16.4$B / $2.8$B | $28$ / $2048$ | 第 $1$ 层稠密 | $2$ | $64$（$6$） | $0.25\times$ 标准 FFN | $2$T |
| DeepSeekMoE 145B | $144.6$B / $22.2$B | $62$ / $4096$ | 第 $1$ 层稠密 | $4$ | $128$（$12$） | $0.125\times$ 标准 FFN | $245$B |
| DeepSeek-V2 | $236$B / $21$B | $60$ / $5120$ | 第 $1$ 层稠密 | $2$ | $160$（$6$） | 中间维 $1536$ | $8.1$T |
| DeepSeek-V3 | $671$B / $37$B | $61$ / $7168$ | 前 $3$ 层稠密 | $1$ | $256$（$8$） | 中间维 $2048$ | $14.8$T |

16B 的 $K_r$ 是 **$6$**，不是 $4$。论文原文：「$2$ 个共享专家以及 $64$ 个路由专家中的 $6$ 个」。每专家 $0.25\times$ FFN，激活 $2+6=8$ 路，恰好 $2$ 倍标准 FFN 算力，与 2B 设定对齐。

**$256$ 与 $258$ 的口径。** V3 报告 §4.2 写的是每层 **$1$ 个共享 + $256$ 个路由**，$K_r=8$。开源 `config.json` 的 `n_routed_experts=256`、`n_shared_experts=1` 与之一致。有的材料写 $258$，对不上报告表：常见误加是把 V2 的 $N_s=2$ 叠到 V3 的 $256$ 上，或把推理部署里的**冗余专家副本**算进架构。Decode 时报告把共享专家看成「永远被选中的重载路由专家」，于是每 token 选 $9$ 路（$8$ 路由 + $1$ 共享），那是部署计数，不是 $N_r=258$。本篇以 $N_r=256$ 为准。

V2-Lite（附录）：$15.7$B 总参 / $2.4$B 激活，结构同族，不另开表。16B 与同语料 DeepSeek 7B 比：每 $4$K token 的 FLOPs 为 $74.4$T vs $183.5$T，约 **$40.5\%$ 算力**对齐 7B 表现（论文 Table 3）。

---

## 6. V1 / V2 门控：先 Softmax，再 Top-$K$

V2 把式 (10)–(11) 写成与式 (12) 配套的门控（层上标省略）：

$$
g_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=1}^{N_r},K_r)\\
0, & \text{otherwise}
\end{cases} \tag{13}
$$

$$
s_{i,t}=\operatorname{Softmax}_{i}(\mathbf{u}_{t}^{\top}\mathbf{e}_{i}) \tag{14}
$$

这是 **先对全部 $N_r$ 个专家 Softmax，再截断 Top-$K_r$，截断后的 $g$ 直接用 Softmax 值**。被选中的 $K_r$ 个门控之和 **小于 $1$**（剩下的质量在被丢掉的专家上）。[2.4.1 总览](../2.4.1-混合专家模型MoE.md) 写过另一条实现：先 Top-$K$ 再在选中集合上 Softmax，选中门控之和为 $1$——Qwen 系常用后一条。DeepSeek V1–V2 明确走前一条。

**数值走查**（示意，非训练所得）。$N_r=4$，$K_r=2$，logits $(u^{\top}e)=(2.0,\,0.5,\,1.0,\,-1.0)$。

Softmax 分母 $e^{2}+e^{0.5}+e^{1}+e^{-1}\approx 12.124$，得

$$
s\approx(0.609,\,0.136,\,0.224,\,0.030)
$$

Top-2 留下专家 $1$ 与 $3$，$g=(0.609,\,0,\,0.224,\,0)$，和为 $0.833\neq 1$。共享专家仍按权重 $1$ 相加，所以共享支路与路由支路的输出尺度本来就不在同一个单纯形上——这是读 V1 公式时必须接受的事实，不是漏写归一化。

负载方面，V1 用专家级辅助损失（Switch 同族），V2 再加设备级、通信级。专家级：

$$
\mathcal{L}_{\mathrm{ExpBal}}=\alpha_{1}\sum_{i=1}^{N_r} f_{i}P_{i} \tag{15}
$$

$$
f_{i}=\frac{N_r}{K_r T}\sum_{t=1}^{T}\mathbb{1}(\text{token }t\text{ 选中专家 }i),\qquad
P_{i}=\frac{1}{T}\sum_{t=1}^{T}s_{i,t} \tag{16}
$$

$f_i$ 是离散选择频率（相对均匀值的倍数），$P_i$ 是平均门控分数。最小化乘积，是在惩罚「流量和分数都堆在同一批专家」。$T$ 在公式里是一条序列的 token 数。V1 16B 把 $\alpha_1$ 设得很小（$0.001$），因为专家都在同一设备上，再加大 $\alpha_1$ 换不来算力，只会伤效果。V2 在 $D=8$ 台设备上均分路由专家，$\alpha_1=0.003$，$\alpha_2=0.05$，$\alpha_3=0.02$。设备级把 $f,P$ 先在设备内的专家集合上聚合再点乘；通信级则罚「发到设备 $j$ 的 token 比例」与「该设备上专家分数和」的乘积。辅助损失**不能**保证硬容量，V2 训练还按设备平均预算丢弃亲和度最低的 token（容量因子 $1.0$），约 $10\%$ 的序列永不丢，以便推理时可选择丢或不丢。评测不丢 token。

---

## 7. V2 设备受限路由（算法约束，不是通信综述）

细粒度之后 $K_r$ 变大，一个 token 的目标专家容易散落在很多设备上。通信次数与覆盖设备数成正比，不是与 $K_r$ 自动成正比。V2 在 Top-$K_r$ 之外加硬约束：每个 token 的目标专家最多落在 $M$ 台设备上。步骤：

1. 按设备聚合其上专家的亲和度，选出总分最高的 $M$ 台；
2. **只在这 $M$ 台内部的专家里**再做 Top-$K_r$。

论文写 $M\geqslant 3$ 时，与无约束 Top-$K$ 大致对齐。V2 取 $M=3$。这是路由可行集的缩小，不是 All-to-All 实现细节。V3 改成**节点**受限：每 token 最多 $M=4$ 个节点，节点按其上最高 $K_r/M$ 个亲和度之和来挑。系统如何用 IB 先到对端同号 GPU、再 NVLink 转发，见 [07](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md)。

---

## 8. V3：Sigmoid、选中后再归一化、无辅助损失偏置

V3 仍用式 (12) 的共享 + 路由求和，但亲和度与门控改了三条。

$$
s_{i,t}=\operatorname{Sigmoid}(\mathbf{u}_{t}^{\top}\mathbf{e}_{i}) \tag{17}
$$

$$
g'_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=1}^{N_r},K_r)\\
0, & \text{otherwise}
\end{cases} \tag{18}
$$

$$
g_{i,t}=\frac{g'_{i,t}}{\sum_{j=1}^{N_r}g'_{j,t}} \tag{19}
$$

Sigmoid 按专家独立映到 $(0,1)$，**不再**在 $N_r$ 维单纯形上互斥。Top-$K_r$ 之后，只在选中集合上把 $g'$ 归一化，于是 $\sum_{i:g_{i,t}>0}g_{i,t}=1$。报告原文：「与 V2 略有不同，V3 用 sigmoid 算亲和度，并在全部选中的亲和度上做归一化。」

接上节同一组 logits。$\sigma(2)\approx 0.881$，$\sigma(0.5)\approx 0.622$，$\sigma(1)\approx 0.731$，$\sigma(-1)\approx 0.269$。Top-2 仍是专家 $1$ 与 $3$，归一化后

$$
g\approx(0.547,\,0,\,0.453,\,0),\qquad \text{和}=1
$$

与 V1 的 $(0.609,\,0.224)$ 相比：相对比例不同，选中集合的门控现在是凸组合系数。

**aux-loss-free 偏置。** 过大的 $\mathcal{L}_{\mathrm{ExpBal}}$ 会伤主任务（Wang et al., 2024a；V3 报告引用）。V3 给每个路由专家一个偏置 $b_i$，**只加在排序用的分数上**：

$$
g'_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}+b_{i}\in\operatorname{Topk}(\{s_{j,t}+b_{j}\}_{j=1}^{N_r},K_r)\\
0, & \text{otherwise}
\end{cases} \tag{20}
$$

乘到 FFN 输出上的仍然是**未加 $b_i$ 的** $s_{i,t}$（再经式 (19)）。每个训练 step 看整 batch 的专家负载：过载则 $b_i\leftarrow b_i-\gamma$，欠载则 $b_i\leftarrow b_i+\gamma$。V3 预训练前 $14.3$T token 取 $\gamma=0.001$，最后 $500$B 把 $\gamma$ 置 $0$。偏置是路由决策的控制器，不是另一套门控。

若 $b=(0,0,0,2.0)$，排序分数变成 $s+b\approx(0.881,0.622,0.731,2.269)$，Top-2 改为专家 $4$ 与 $1$；门控仍从原始 sigmoid 来，再归一化。这就是「偏置改谁被选中，不改选中之后的相对权重从哪来」。

![V1/V2 先 Softmax 再 Top-K，对比 V3 Sigmoid + 排序偏置](./images/fig-deepseek-moe-v1-v3-gating.png)

> 图 3：浅色自绘。左栏 V1/V2：全局 Softmax → Top-$K_r$ → 分数直接当 $g$（和不为 $1$）。右栏 V3：逐专家 Sigmoid → $b_i$ 仅用于排序 → Top-$K_r$ → 用原始 $s$ 在选中集合上归一化。中间标注：不是 Qwen 的「先 Top-K 再 Softmax」。

**图 3 解析**

- **两栏第一步相同**：logits $u_t^{\top}e_i$。分叉从激活函数开始，不是从质心参数开始。
- **左栏绿盒**：Softmax 值既排序也当门控；黄盒不出现，因为没有单独的负载偏置通道。
- **右栏黄盒**：$\mathrm{Top}K(s_i+b_i)$ 只决定集合；绿盒里的 $g$ 回到 $s_i$ 再归一化。图例「黄 = 只排序、绿 = 进加权和」对应式 (20) 与式 (19) 的拆分。
- **与 Qwen 的关系**：Qwen 是先截断再 Softmax，选中和为 $1$，但截断前没有全局 Softmax，也没有 Sigmoid。三条实现不要合成一句「都是 Top-K 门控」。

**序列级互补损失。** 主负载靠 $b_i$，但仍用极小的序列级均衡防止**单条**序列把流量打穿少数专家：

$$
\mathcal{L}_{\mathrm{Bal}}=\alpha\sum_{i=1}^{N_r}f_{i}P_{i},\qquad
s'_{i,t}=\frac{s_{i,t}}{\sum_{j}s_{j,t}},\qquad
P_{i}=\frac{1}{T}\sum_{t=1}^{T}s'_{i,t} \tag{21}
$$

$f_i$ 仍按该序列上的 Top-$K$ 指示函数计。V3 取 $\alpha=0.0001$。报告消融（Table 5）：同样用 sigmoid + 选中归一化的前提下，去掉大辅助损失、改 aux-loss-free，小模型（$15.7$B / $2.4$B，训练 $1.33$T）与大模型（$228.7$B / $20.9$B，训练 $578$B）在多数基准上更好，例如大模型 HumanEval Pass@1 $40.2\to 46.3$，GSM8K $70.7\to 74.5$。进一步比较表明：batch 级均衡（aux-loss-free 或 batch 级辅助损失）比**每条序列都挤均匀**更利于按领域特化；1B 验证损失 $2.258$（序列级）对 $2.253$（aux-loss-free 与 batch 级）。代价是单序列和小 batch 仍可能偏科，以及推理域移。V3 用大规模 EP/DP 把 micro-batch 做大来缓解前者，用冗余专家部署缓解后者。因为负载已经稳，V3 **训练和推理都不丢 token**，与 V2 的 token-drop 不同。

Kimi K3 在更大规模上认为 $\gamma\mathrm{sign}$ 步长不够，改 Quantile Balancing，并把路由专家放进 $\ell=d/2$ 的 LatentMoE——那是另一篇：[10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。$\ell$ 不是 MLA 的 $c^{KV}$。

---

## 9. 和邻居的「不是」

| 对象 | 本层在做什么 | 不要写成 |
|------|----------------|----------|
| MLA | 注意力 KV 低秩缓存 | 共享专家、或 MoE 的 latent |
| MTP | 主模型旁的多 token 训练目标 / 推测解码 | 路由或专家 |
| Mixtral 8× | 少量与稠密 FFN 同宽的专家、Top-2 | 细粒度 $N_r=64/160/256$ |
| Switch Top-1 | 一个宽专家吃全部激活 | 共享 + 多窄专家 |
| 本篇 | FFN 插槽的条件计算 | EP 通信综述 |

MLA 公式链回 [04](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与解耦式注意力/04-MLA-低秩潜变量与解耦式注意力.md)；KV 字节参照系是 [01 MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md)。MTP 见 [2.4.6](../../2.4.6-多Token预测MTP深度解析.md)。工程容量、z-loss、drop 策略的实现清单见 [02](../02-MoE的工程实践/02-MoE的工程实践.md)。

---

## 10. 失效模式

| 现象 | 原因 | 说明 |
|------|------|------|
| 路由崩塌，少数专家吃满 | $b_i$ 或 $\alpha$ 失效、过小 batch | V1 用 $f_i P_i$；V3 用 $\gamma$ 更新 $b_i$，序列级 $\alpha$ 只防极端 |
| 第一层（或前三层）负载抖 | 浅层表示还不稳定 | 所以留下稠密 FFN，不是「忘了换成 MoE」 |
| 细切过头，专家中间维过窄 | Tensor Core 利用率掉下去 | 16B 停在 $0.25\times$，论文写再细会伤效率 |
| 选中门控和不为 $1$（V1/V2） | 先 Softmax 再截断 | 不是 bug；V3 才在选中集合上归一化 |
| 推理域移导致专家偏科 | batch 级均衡不约束单域 | V3 用冗余专家；K3 另走分位数 |
| 把通信当模型结构 | 把 $M$ 台设备约束写成 MoE 定义 | $M$ 是可行集，专家函数仍是窄 FFN |

---

## 11. 本节小结

DeepSeekMoE 的计算链可以收成一句：**注意力残差得到 $u_t$ → 全部共享专家 always-on → 路由专家按版本规则取 Top-$K_r$ 并加权 → 与残差相加**（式 (12)）。细粒度把宽 FFN 切成窄专家并提高组合数（式 (6)–(8)）；共享专家把通用计算从路由里拿走（式 (9)）。门控分叉必须写清：V1/V2 先 Softmax 再截断（式 (13)–(14)），V3 先 Sigmoid 再截断再归一化，且 $b_i$ 只参与排序（式 (17)–(20)）。配置只认论文表：$16.4$B/$2.8$B 是 $2+64$、$K_r=6$；$236$B/$21$B 是 $2+160$、$K_r=6$；$671$B/$37$B 是 $1+256$、$K_r=8$。下一篇 [02 工程实践](../02-MoE的工程实践/02-MoE的工程实践.md) 从容量因子与实现约束接着写，不重复推共享专家公式。

---

## 本篇来源

1. Dai et al. (2024). [DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models](https://arxiv.org/abs/2401.06066)（[HTML](https://arxiv.org/html/2401.06066)）. §2–3 公式 (1)–(17)，§5.1.2 与 Table 7 的 16B 配置，Figure 2–3。
2. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434)（[HTML](https://arxiv.org/html/2405.04434)）. §2.2 式 (20)–(31)，§3.1.2 的 $236$B/$21$B、$N_s=2$、$N_r=160$、$K_r=6$、$M=3$。
3. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437)（[HTML](https://arxiv.org/html/2412.19437)）. §2.1.2 式 (12)–(20)，§4.2 的 $671$B/$37$B、$N_s=1$、$N_r=256$、$K_r=8$，Table 5 消融。
4. Lepikhin et al. (2021). [GShard](https://arxiv.org/abs/2006.16668). 对照用的宽专家 Top-2。
5. Fedus, Zoph, Shazeer. (2021). [Switch Transformers](https://arxiv.org/abs/2101.03961). $f_i P_i$ 辅助损失同族。
