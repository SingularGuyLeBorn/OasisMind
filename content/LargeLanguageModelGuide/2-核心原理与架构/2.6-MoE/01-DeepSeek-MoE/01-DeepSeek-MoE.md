---
title: "01 · DeepSeek MoE: 共享专家与细粒度路由"
published: true
tags: ["MoE", "DeepSeekMoE", "共享专家", "细粒度路由", "aux-loss-free"]
excerpt: "DeepSeekMoE 把宽专家切成窄专家并隔离出常驻的共享专家; V2 加设备受限路由与三级均衡损失, V3 改用 Sigmoid 亲和度, 选中集合归一化和 aux-loss-free 偏置."
---
# 01 DeepSeek MoE: 共享专家与细粒度路由

## 1. 细粒度切分与共享专家

### 1.1 问题: 常规 MoE 的混杂与冗余

标准 Decoder 块先做注意力, 再把残差后的隐藏态送进 FFN. 第 $l$ 层, 序列长度 $T$, 隐藏维 $d$, 层归一化省略 (与论文写法一致):

$$
\mathbf{u}_{1:T}^{l}=\operatorname{Self\text{-}Att}(\mathbf{h}_{1:T}^{l-1})+\mathbf{h}_{1:T}^{l-1} \tag{1}
$$

$$
\mathbf{h}_{t}^{l}=\operatorname{FFN}(\mathbf{u}_{t}^{l})+\mathbf{u}_{t}^{l} \tag{2}
$$

其中 $\mathbf{u}_t^l\in\mathbb{R}^d$ 是第 $t$ 个位置在注意力子层之后的隐藏态. MoE 替换的是式 (2) 里的 $\operatorname{FFN}(\cdot)$, 注意力子层保持原样. GShard 与 Switch 一类做法准备 $N$ 个与标准 FFN 同宽的专家, 每个 token 只进入 Top-$K$ 个 ($K$ 常取 1 或 2):

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

$\mathbf{e}_{i}^{l}\in\mathbb{R}^d$ 是第 $l$ 层第 $i$ 个专家的可学习质心, $s_{i,t}$ 是 token 对专家的亲和度, $g_{i,t}$ 是门控. $g_{i,t}$ 只有 $K$ 个非零, 所以每 token 的专家计算量按 $K$ 计, 专家参数按 $N$ 计.

DeepSeekMoE 论文第 1 节把这条路的问题归成两类. 第一类是知识混杂: 专家数少 (常见 $N=8$ 或 16) 时, 分到同一专家的 token 覆盖多种模式, 一个宽 FFN 只能学这些模式的折中变换. 第二类是知识冗余: 不同专家都需要同一批通用变换, 于是各自的参数里重复存一份. 两者叠加的结果是, 稀疏度达到了, 专家之间的分工却不明显. 细粒度切分对应第一类问题, 共享专家隔离对应第二类问题.

### 1.2 细粒度切分: 参数与 FLOPs 不变, 组合数增加

保持专家参数总量和每 token 的专家 FLOPs 不变, 把每个宽专家沿 FFN 中间维切成 $m$ 个窄专家, 每个窄专家的中间维是原来的 $1/m$. 专家数变成 $mN$, 激活数同步变成 $mK$:

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

一个专家 FFN 的参数量与中间维成正比. 切分后单个专家参数变为 $1/m$, 专家数变为 $m$ 倍, 总量不变; 每 token 激活 $mK$ 个窄专家, 激活的中间维总和仍是 $K$ 个宽专家的中间维总和, 矩阵 FLOPs 也不变. 变化的是激活组合数. 论文给的例子是 $N=16$, Top-2 只有 $\binom{16}{2}=120$ 种组合; 取 $m=4$ 后有 64 个窄专家, 激活 8 个, 组合数为 $\binom{64}{8}=4{,}426{,}165{,}368$. 路由器可以从更大的组合空间里为每个 token 拼出专家集合, 单个窄专家也只需覆盖更窄的一类模式.

切分有代价. 专家中间维变窄后, 每次专家 GEMM 的 $N$ 维变小, 算术强度下降; 激活专家数变多后, 每 token 需要发送的副本数也变多. 前者影响 Tensor Core 利用率, 后者影响专家并行的 All-to-All 体积. 16B 模型把每个专家定在标准 FFN 的 $0.25\times$, 论文给出的理由是再细会损失计算效率. 145B 模型取 $0.125\times$.

路由器本身的开销也随 $m$ 变化. 式 (8) 需要为 $mN$ 个专家各存一个 $d$ 维质心, 路由参数为 $mNd$, 每 token 的打分计算为 $mNd$ 次乘加, Top-$mK$ 的排序对象也从 $N$ 个变为 $mN$ 个. 与专家 FFN 的参数相比这部分很小, 但它随专家数线性增长, 专家数到数百个时, 路由打分与排序在 kernel 层面需要单独优化.

2B 验证实验的设定是: 9 层, $d=1280$, 每个专家为标准 FFN 的 $0.25\times$, 总专家参数等于 16 个标准 FFN, 激活专家参数等于 2 个标准 FFN, 训练 100B token. Table 1 的 Pile loss 为: Dense 2.060, Hash Layer 1.932, Switch 1.881, GShard 1.867, DeepSeekMoE 1.808. 这一组对照中各 MoE 的总参数和激活参数对齐, 差别只来自路由与专家结构.

### 1.3 共享专家: 通用计算不经路由

细粒度切分之后, 冗余问题依然存在: 窄路由专家仍可能各自学一遍所有 token 都需要的变换. 做法是再划出 $K_s$ 个共享专家, 路由器不参与, 每个 token 都经过它们. 为保持计算量不变, 路由侧激活数减去 $K_s$, 从 $mK$ 变为 $mK-K_s$:

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

记号对照: 共享专家个数 $K_{s}$ (V2/V3 写作 $N_{s}$), 路由专家总数 $mN-K_{s}$ (写作 $N_{r}$), 非零路由门控个数 $mK-K_{s}$ (写作 $K_{r}$). 式 (9) 中共享专家没有乘门控, 系数恒为 1. DeepSpeed-MoE 里也有常驻专家, DeepSeekMoE 论文说明那是从工程角度设计的; DeepSeekMoE 的出发点是把公共知识集中到共享参数里, 减少路由专家之间的重复.

2B 规模的消融给出了几组可以直接对照的数字 (论文第 4 节):

- 在 GShard 结构上只隔离 1 个共享专家, 多数基准上升; 再把专家从 16 切到 32 ($1+31$) 再到 64 ($1+63$), 总体继续上升. 共享与细粒度各自带来增益, 可以叠加.
- Table 2 设了一个上界对照 Dense$\times16$: 16 个与标准 FFN 同宽的专家全部激活. 三组结果的 Pile loss 分别是 GShard$\times1.5$ 为 1.808, Dense$\times16$ 为 1.806, DeepSeekMoE 为 1.808; HellaSwag 分别是 54.4, 55.1, 54.8. GShard$\times1.5$ 的专家参数和计算量都是 GShard 的 1.5 倍, 才与 DeepSeekMoE 持平.
- 关掉共享专家并多激活一个路由专家 (计算量不变), Pile loss 从 1.808 升到 2.414. 共享支路学到的内容不能由多一个路由专家补上.
- 固定总专家数 64 和激活总数, 共享专家取 1, 2, 4 个时 Pile loss 分别为 1.808, 1.806, 1.811. 放大模型时, 论文把共享专家与激活路由专家之比定为 $1:3$, 16B 的 $2:6$ 即按此比例.

论文第 4.5 节用三组实验看专家特化. 第一组在推理阶段逐步禁用亲和度最高的若干路由专家, 改由排名靠后的专家替补. 对照组是 GShard$\times1.5$, 不禁用时两者 Pile loss 相同, 禁用以后 DeepSeekMoE 的 loss 上升更快. 冗余度高的模型里替补专家能完成相近的计算, loss 变化小; DeepSeekMoE 对禁用更敏感, 作者据此认为它的路由专家之间冗余更低. 第二组把激活的路由专家数在 3 到 7 之间变化, 只激活 4 个时 Pile loss 就与 GShard 持平. 第三组从头训练一个 1 个共享加 63 个路由专家, 只激活 3 个路由专家的模型, 激活的专家参数只有 GShard 的一半, Pile loss 仍低于 GShard (论文 Fig. 6).

三组实验度量的东西不同. 禁用实验是在训练好的模型上扰动路由, 模型没有针对替补路由重新训练, 结果反映的是对路由扰动的敏感度, 不能直接换算成训练效率. 第三组是重新训练的模型, 它说明在更少的激活参数下仍能获得同等质量, 这一点才与训练成本直接相关. 共享专家的作用只在 2B 与 16B 的消融中测过, V3 报告没有给出 256 路由专家规模下关掉共享专家的对照.

---

## 2. 层内数据流与各版本配置

### 2.1 层内数据流与插槽位置

按数据依赖, 一层 DeepSeekMoE 的前向分五步. 共享计算与路由计算都只依赖同一个 $\mathbf{u}_t$, 两者可以并行.

1. 位置 $t$ 的隐藏态经过注意力 (V1 为 MHA, V2/V3 为 MLA) 并加残差, 得到 $\mathbf{u}_t$, 对应式 (1).
2. 共享支路计算全部 $N_s$ 个 $\operatorname{FFN}^{(s)}_{i}(\mathbf{u}_t)$, 系数为 1, 相加得到 $\mathbf{y}_s$.
3. 路由支路用 $\mathbf{u}_t$ 与 $N_r$ 个质心打分, 按第 3.1 节或第 3.3 节的版本规则取出 $K_r$ 个专家及门控 $g_{i,t}$.
4. 把 $\mathbf{u}_t$ 派发到这 $K_r$ 个路由专家, 各自计算后乘门控, 求和得到 $\mathbf{y}_r$.
5. $\mathbf{h}'_t=\mathbf{u}_t+\mathbf{y}_s+\mathbf{y}_r$, 送入下一层注意力.

一个二维数值例子可以核对每个汇合点. 取 $\mathbf{u}_t=(1,2)$, 三个共享专家输出 $(1,0)$, $(0,1)$, $(0.5,0.5)$, 于是 $\mathbf{y}_s=(1.5,1.5)$. 路由侧五个专家的 Softmax 分数为 $(0.15,0.33,0.10,0.29,0.13)$, Top-2 选中专家 2 与 4, 门控沿用截断前的分数 $g_2=0.33$, $g_4=0.29$. 若两个专家输出为 $(2,0)$ 与 $(0,2)$, 则 $\mathbf{y}_r=0.33(2,0)+0.29(0,2)=(0.66,0.58)$, 最终 $\mathbf{h}'_t=(3.16,4.08)$. 这些数只用来核对加权与残差, 与训练好的模型无关.

在 V2/V3 的整机结构中, MLA 与 DeepSeekMoE 串联出现. MLA 改的是注意力的 KV 缓存形式, MoE 改的是残差之后的前馈计算, 两者位于同一层的不同子层. MLA 的推导见 [MLA: 低秩潜变量与解耦 RoPE](../../2.2-注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md).

哪些层换成 MoE 也属于结构配置. V1 16B, V2 与 V2-Lite 除第一层外全部 FFN 换成 MoE, 论文给出的原因是第一层的负载均衡收敛明显更慢; V3 除前三层外换成 MoE. 留下的稠密 FFN 仍按式 (2) 计算, 不参与路由.

### 2.2 配置表

V2 起统一用 $N_s,N_r,K_r$ 重写式 (9):

$$
\mathbf{h}'_{t}
=\mathbf{u}_{t}
+\sum_{i=1}^{N_{s}}\operatorname{FFN}^{(s)}_{i}(\mathbf{u}_{t})
+\sum_{i=1}^{N_{r}} g_{i,t}\,\operatorname{FFN}^{(r)}_{i}(\mathbf{u}_{t}) \tag{12}
$$

下表来自 DeepSeekMoE 第 5 节与 Table 7, DeepSeek-V2 第 3.1.2 节与附录 B, DeepSeek-V3 第 4.2 节.

| 模型 | 总参 / 激活 | 层数 / $d$ | 稠密 FFN | $N_s$ | $N_{r}$ (激活 $K_r$) | 专家宽度 | 预训练 token |
|------|-------------|------------|----------|-------|----------------------|----------|--------------|
| DeepSeekMoE 2B | 约 2.0B / 0.3B | 9 / 1280 | 无 | 1 | 63 (7) | $0.25\times$ 标准 FFN | 100B |
| DeepSeekMoE 16B | 16.4B / 2.8B | 28 / 2048 | 第 1 层 | 2 | 64 (6) | $0.25\times$ 标准 FFN | 2T |
| DeepSeekMoE 145B | 144.6B / 22.2B | 62 / 4096 | 第 1 层 | 4 | 128 (12) | $0.125\times$ 标准 FFN | 245B |
| DeepSeek-V2-Lite | 15.7B / 2.4B | 27 / 2048 | 第 1 层 | 2 | 64 (6) | 中间维 1408 | 5.7T |
| DeepSeek-V2 | 236B / 21B | 60 / 5120 | 第 1 层 | 2 | 160 (6) | 中间维 1536 | 8.1T |
| DeepSeek-V3 | 671B / 37B | 61 / 7168 | 前 3 层 | 1 | 256 (8) | 中间维 2048 | 14.8T |

16B 的 $K_r$ 是 6, 论文原文为「2 个共享专家以及 64 个路由专家中的 6 个」. 每个专家是 $0.25\times$ 标准 FFN, 激活 $2+6=8$ 个, 合计等于 2 个标准 FFN 的计算量, 与 2B 的设定一致. 16B 与同语料训练的 DeepSeek 7B 相比, 每 4K token 的 FLOPs 为 74.4T 对 183.5T, 约 40.5% (论文 Table 3); 与 LLaMA2 7B 相比, 总参数是后者的 245%, 计算量只有 39.6%. 16B 可以部署在单张 40GB 显存的 GPU 上. 它的短板在多项选择题: 论文把原因归于注意力参数少, 16B 的注意力参数约 0.5B, DeepSeek 7B 约 2.5B. MoE 只放大了 FFN, 注意力的容量没有跟着变.

145B 的设定是 62 层, $d=4096$, 4 个共享专家加 128 个路由专家, 激活其中 12 个, 每个专家为标准 FFN 的 $0.125\times$, 训练 245B token. 对照组 GShard 137B 与它的隐藏维和层数相同, 145B 的总参数多出约 6%, 来自专家中间维按 64 的倍数对齐的取整. 这一规模用 4 台设备做专家并行, 设备级均衡系数取 0.05. 145B 的计算量约为 DeepSeek 67B 的 28.5%, 在多数基准上与 67B 相当. 论文还训练了一个半激活版本 142B, 共享专家 2 个, 激活路由专家 6 个 (仍是 128 个中选), 计算量只有 67B 的 18.2%, 结果仍与 67B 相当. 表中三档 DeepSeekMoE 的共享与激活路由之比依次为 $1:7$, $2:6$, $4:12$, 后两档符合第 1.3 节的 $1:3$.

论文附录 B 还在更大的对照组上验证了结构差别: 13.3B 的 DeepSeekMoE 与 GShard$\times1.2$ (15.9B) 和 GShard$\times1.5$ (19.8B) 比较, 后两者的专家参数分别是 GShard 的 1.2 倍和 1.5 倍, DeepSeekMoE 明显优于 GShard$\times1.5$. 参数更少的模型胜过参数更多的对照, 增益来自专家结构而非容量.

V2-Lite 与 V2 同属一代, 结构是 27 层, $d=2048$, 2 个共享专家加 64 个路由专家, 激活 6 个, 专家中间维 1408, 训练 5.7T token. 它用流水线并行把不同层放到不同设备上, 同一层的全部专家在同一台设备上, 所以只用 $\alpha_1=0.001$ 的专家级损失, 不用设备级和通信级损失. V3 报告 Table 5 的小模型消融就沿用 V2-Lite 的规模 (2.4B 激活, 15.7B 总参).

V3 报告第 4.2 节写的是每层 1 个共享专家加 256 个路由专家, $K_r=8$, 开源配置中的 `n_routed_experts=256` 与 `n_shared_experts=1` 一致. 部署章节里把共享专家当作一个总被选中的高负载路由专家, 所以每 token 选 9 个 (8 个路由加 1 个共享), 这是部署计数, 不改变 $N_r=256$.

---

## 3. 门控与均衡的版本演进

### 3.1 V1/V2: 先 Softmax 再 Top-$K$, 三级均衡损失

V2 把式 (10)–(11) 写成与式 (12) 配套的形式 (层上标省略):

$$
g_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=1}^{N_r},K_r)\\
0, & \text{otherwise}
\end{cases},
\qquad
s_{i,t}=\operatorname{Softmax}_{i}(\mathbf{u}_{t}^{\top}\mathbf{e}_{i}) \tag{13}
$$

这一写法先对全部 $N_r$ 个专家做 Softmax, 再截断 Top-$K_r$, 门控直接用截断前的 Softmax 值, 选中门控之和小于 1. 数值例子: $N_r=4$, $K_r=2$, logits $\mathbf{u}^{\top}\mathbf{e}=(2.0,0.5,1.0,-1.0)$. Softmax 分母 $e^{2}+e^{0.5}+e^{1}+e^{-1}\approx12.124$, 得 $s\approx(0.6095,0.1360,0.2242,0.0303)$. Top-2 留下专家 1 与 3, $g\approx(0.6095,0,0.2242,0)$, 和约 0.8337. 两种门控顺序的比较见 [02 路由与 Top-K](../02-MoE路由与Top-K可导性/02-MoE路由与Top-K可导性.md) 第 1.4 节.

负载方面, V1 用专家级辅助损失, V2 再加设备级与通信级. 点积形式 $f_iP_i$ 的梯度方向与统计范围的推导见 [03 负载均衡与容量](../03-MoE负载均衡与容量/03-MoE负载均衡与容量.md) 第 2 节, 这里只写 DeepSeek 的取法. 专家级损失把 $f_i$ 乘了 $N_r/K_r$, 均匀时 $f_i=1$, 损失前不再乘专家数:

$$
\mathcal{L}_{\mathrm{ExpBal}}=\alpha_{1}\sum_{i=1}^{N_r} f_{i}P_{i},\qquad
f_{i}=\frac{N_r}{K_r T}\sum_{t=1}^{T}\mathbb{1}(\text{token }t\text{ 选中专家 }i),\qquad
P_{i}=\frac{1}{T}\sum_{t=1}^{T}s_{i,t} \tag{14}
$$

V2 把 $N_r$ 个路由专家均分到 $D$ 台设备上, 第 $i$ 台设备上的专家集合记为 $\mathcal{E}_i$. 设备级损失先在设备内聚合, 再做点积; 通信级损失统计每台设备收到的 token 比例, 其中 $M$ 是第 3.2 节的设备上限:

$$
\mathcal{L}_{\mathrm{DevBal}}=\alpha_{2}\sum_{i=1}^{D} f'_{i}P'_{i},\qquad
f'_{i}=\frac{1}{|\mathcal{E}_i|}\sum_{j\in\mathcal{E}_i}f_j,\qquad
P'_{i}=\sum_{j\in\mathcal{E}_i}P_j \tag{15}
$$

$$
\mathcal{L}_{\mathrm{CommBal}}=\alpha_{3}\sum_{i=1}^{D} f''_{i}P''_{i},\qquad
f''_{i}=\frac{D}{MT}\sum_{t=1}^{T}\mathbb{1}(\text{token }t\text{ 发往设备 }i),\qquad
P''_{i}=\sum_{j\in\mathcal{E}_i}P_j \tag{16}
$$

三项约束的对象不同. 专家级要求各专家被选次数接近; 设备级要求各设备上的计算量接近, 专家数相等而设备间 token 数不均时它才给出惩罚; 通信级约束设备的接收量, 均匀时每台设备收到 $MT/D$ 个 token, $f''_i=1$. 系数随版本变化: V1 16B 的所有专家在同一台设备上, 只取 $\alpha_1=0.001$, 较大的值换不来计算收益, 反而影响效果; 145B 用 4 台设备做专家并行, 设备级系数为 0.05; V2 取 $D=8$, $\alpha_1=0.003$, $\alpha_2=0.05$, $\alpha_3=0.02$; V2-Lite 只用 $\alpha_1=0.001$.

辅助损失不能保证硬容量. V2 训练时按设备计算平均预算, 容量因子 1.0, 超出预算的 token 按亲和度从低到高丢弃, 并保证约 10% 的训练序列永不丢 token, 使推理阶段可以选择丢或不丢. 论文报告的评测结果都不丢 token.

### 3.2 设备受限与节点受限路由

细粒度之后 $K_r$ 变大, 一个 token 的目标专家容易散落在很多设备上, 而专家并行的发送量取决于 token 要去几台设备. V2 在 Top-$K_r$ 之前加一步: 先按每台设备上专家的最高亲和度选出得分最高的 $M$ 台设备, 再只在这 $M$ 台设备的专家里做 Top-$K_r$. 论文报告 $M\ge3$ 时效果与不受限的 Top-$K$ 大致相当, V2 取 $M=3$. V3 把设备换成节点, 每个 token 最多发往 $M=4$ 个节点, 节点得分是其上亲和度最高的 $K_r/M=2$ 个专家之和. 这条规则只缩小路由器的可选集合, 专家函数仍是式 (12) 中的窄 FFN.

设备上限是硬约束, 式 (16) 是软约束. 前者保证单个 token 的目标设备数不超过 $M$, 后者让各设备的接收量接近均匀; 只有前者时, 大量 token 仍可能挤向同一组设备. 发送量上限怎样换算成跨节点与节点内的带宽, 以及两级 dispatch 的实现, 见 [6.1.8 MoE 系统与并行](../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/6.1.8-MoE系统与并行.md).

### 3.3 V3: Sigmoid, 选中集合归一化, aux-loss-free 偏置

V3 仍用式 (12) 的共享加路由结构, 亲和度与门控改了三处:

$$
s_{i,t}=\operatorname{Sigmoid}(\mathbf{u}_{t}^{\top}\mathbf{e}_{i}) \tag{17}
$$

$$
g'_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}+b_{i}\in\operatorname{Topk}(\{s_{j,t}+b_{j}\}_{j=1}^{N_r},K_r)\\
0, & \text{otherwise}
\end{cases} \tag{18}
$$

$$
g_{i,t}=\frac{g'_{i,t}}{\sum_{j=1}^{N_r}g'_{j,t}} \tag{19}
$$

Sigmoid 对每个专家独立映射到 $(0,1)$, 专家之间不再通过 Softmax 分母相互耦合; Top-$K_r$ 之后只在选中集合上归一化, 选中门控之和为 1. $b_i$ 只加在排序用的分数上, 乘到专家输出上的仍是不含 $b_i$ 的 $s_{i,t}$. 固定选中集合时, 落选专家的 logit 不在门控路径上, 三种门控构造的梯度对照见 [02](../02-MoE路由与Top-K可导性/02-MoE路由与Top-K可导性.md) 第 2.4 节. $K_r=8$, $N_r=256$ 时, Softmax 的分母由 256 项共同决定, 单个选中专家的门控值偏小; 改用 Sigmoid 加选中集合归一化后, 门控只取决于 8 个选中专家的相对分数. 报告没有单独给出这一改动的消融.

沿用第 3.1 节的 logits: $\sigma(2)\approx0.881$, $\sigma(0.5)\approx0.622$, $\sigma(1)\approx0.731$, $\sigma(-1)\approx0.269$. $b=0$ 时 Top-2 仍是专家 1 与 3, 归一化后 $g\approx(0.5464,0,0.4536,0)$. 若 $b=(0,0,0,2.0)$, 排序分数变成 $(0.881,0.622,0.731,2.269)$, Top-2 改为专家 4 与 1, 门控按原始分数归一化: $s_1+s_4\approx1.150$, $g\approx(0.766,0,0,0.234)$. 偏置改变的是选中集合, 门控数值仍来自 $s$.

偏置的更新规则出自 Wang et al., 一般形式与更新速度的对照见 [03](../03-MoE负载均衡与容量/03-MoE负载均衡与容量.md) 第 4.2 节. V3 的取值是: 每个 step 结束时统计整个 batch 上各专家的负载, 过载专家的 $b_i$ 减 $\gamma$, 欠载专家加 $\gamma$; 预训练前 14.3T token 取 $\gamma=0.001$, 最终 500B token 取 $\gamma=0$. 主均衡交给偏置后, V3 仍保留一个系数极小的序列级均衡损失, 防止单条序列内的极端偏斜:

$$
\mathcal{L}_{\mathrm{Bal}}=\alpha\sum_{i=1}^{N_r}f_{i}P_{i},\qquad
f_i=\frac{N_r}{K_rT}\sum_{t=1}^{T}\mathbb{1}\bigl(s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\},K_r)\bigr),\qquad
P_{i}=\frac{1}{T}\sum_{t=1}^{T}\frac{s_{i,t}}{\sum_{j}s_{j,t}} \tag{20}
$$

这里 $T$ 是一条序列的 token 数, $P_i$ 先把 Sigmoid 分数在每个 token 上归一化再取平均, 因为 Sigmoid 分数本身不满足 $\sum_i s_{i,t}=1$. V3 取 $\alpha=0.0001$, 比 V2 的 $\alpha_1=0.003$ 小 30 倍. 负载稳定后, V3 训练和推理都不丢 token.

报告 Table 5 在 Sigmoid 加选中集合归一化的前提下比较两种均衡方式, 基线的辅助损失强度沿用 V2-Lite 和 V2. 小模型 2.4B 激活, 15.7B 总参, 训练 1.33T token, Pile 测试集的 BPB 从 0.727 降到 0.724; 大模型 20.9B 激活, 228.7B 总参, 训练 578B token, BPB 从 0.656 降到 0.652. 大模型的下游结果多数变好, HumanEval Pass@1 从 40.2 到 46.3, GSM8K 从 70.7 到 74.5, MATH 从 37.2 到 39.6; 也有变差的, MMLU 从 68.3 降到 67.2. 序列级与 batch 级统计的对照, 以及专家按领域分工的现象, 与具体模型无关, 放在 03 第 4.2 节.

Kimi K3 在 896 个路由专家的规模上认为定步长偏置不够用, 改为 Quantile Balancing, 见 [04 Stable LatentMoE 与 Quantile Balancing](../04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md).

---

## 4. 对照与失效模式

### 4.1 对照: 从稠密 checkpoint 构造 MoE

DeepSeekMoE 各版本都从头训练. 另一条构造路线是 Sparse Upcycling (Komatsuzaki et al., [arXiv:2212.05055](https://arxiv.org/abs/2212.05055)): 复用已训练的稠密 checkpoint 作为 MoE 的初值, 再继续训练. 注意力, LayerNorm, embedding, 输出层和未替换的 FFN 从 checkpoint 复制; 被替换的 FFN 复制成 $E$ 份作为各专家的初值, $\theta_i^{(0)}=\theta_F^*$; 路由器随机初始化. 复制后的专家初值相同, 存储独立, 继续训练时接收不同的梯度.

论文的语言实验用 T5 Base, Large, XL: 从第二层起每隔一层换成 32 个专家的 MoE, 路由器按均值 0, 标准差 0.02 的正态分布初始化, 路由组最大 4096 个 token, 解码器的 Top-2 路由加系数 0.01 的辅助损失, 接着原 checkpoint 的逆平方根学习率调度继续训练. 额外花费约为原稠密预训练成本的 50% 时, 升级后的模型在 SuperGLUE 上明显优于继续训练同样时长的稠密模型; 视觉侧的 ViT Base 与 Large 在 ImageNet 上结论相同. T5 Base 规模下, 从头训练的 MoE 要用到原稠密预训练约 120% 的计算量才追上升级后的模型. 论文据此给出分界: 额外预算低于原稠密预训练成本时升级更划算, 预算更大时从头训练会追上. 视觉消融还显示 MoE 层数并不是越多越好, B/16 上把 40% 到 50% 的层换成 MoE 最划算.

复制初值能否保持原函数, 取决于门控的归一化. 记 $\mathbf{a}_t$ 为进入 FFN 的输入, $\mathcal{S}_t$ 为选中集合, 所有专家参数相同且关闭 dropout 时

$$
\sum_{i\in \mathcal{S}_t}g_{t,i}\operatorname{FFN}(\mathbf{a}_t;\theta_i^{(0)})
=\Bigl(\sum_{i\in \mathcal{S}_t}g_{t,i}\Bigr)\operatorname{FFN}(\mathbf{a}_t;\theta_F^*) \tag{21}
$$

只有选中门控之和为 1 时, MoE 子层才与原稠密 FFN 输出相同. 数值例子: 4 个专家的全局概率 $p=(0.42,0.18,0.28,0.12)$, Top-2 选中专家 1 与 3. 按式 (13) 的先 Softmax 后截断, 门控和为 $0.42+0.28=0.70$, FFN 分支的输出被缩到原来的 0.70 倍; 在选中集合上归一化后门控为 $0.42/0.70=0.6$ 与 $0.28/0.70=0.4$, 和为 1, 输出等于原 FFN. 若某个 token 的派遣全部因容量被丢弃, 该 token 的 FFN 分支为 0, 只剩残差.

式 (21) 还给出初值处路由器的梯度. 门控和恒为 1 时, 式 (21) 的右侧不含路由参数, 对路由 logit $h_j$ 求导得 $\sum_{i\in\mathcal{S}_t}(\partial g_{t,i}/\partial h_j)\operatorname{FFN}(\mathbf{a}_t;\theta_F^*)=\bigl(\partial\sum_i g_{t,i}/\partial h_j\bigr)\operatorname{FFN}=0$. 主损失对路由器的梯度在初值处为 0, 只调路由器不改变输出, 路由器的初始信号来自辅助损失, 等专家参数分开以后主损失的梯度才出现. 门控和小于 1 时这项导数不为 0, 但它只能整体放大或缩小 FFN 分支, 不区分专家.

这条路线与细粒度切分的关系也需要分开看. 细粒度专家的中间维是原 FFN 的 $1/m$, 把训练好的宽 FFN 沿中间维切成 $m$ 段, 每段单独并不等于原 FFN, 只有 $m$ 段全部激活且门控都为 1 时求和才复原原函数. Upcycling 的函数保持性质针对的是同宽复制, 不能直接推广到细粒度结构.

### 4.2 失效模式

下表只列正文没有展开的排查方法. 均衡系数, 部署计数和门控归一化的定义分别在第 3.1, 2.2, 4.1 节.

| 现象 | 原因 | 处理 |
|------|------|------|
| 少数专家吃满, 其余专家几乎无 token | V1/V2 的 $\alpha_1$ 过小, 或 V3 的 $\gamma$ 跟不上负载变化, 或统计用的 batch 过小 | 先按层统计 $f_i$, 定位是哪几层偏斜, 再调对应的系数或统计窗口 |
| 第一层 (V3 为前三层) 负载抖动 | 浅层表示尚不稳定, 均衡收敛慢 | 保留稠密 FFN |
| 专家过窄, 吞吐下降 | 专家 GEMM 的中间维太小, 算术强度低 | 切分粒度先在目标硬件上测 kernel 效率 |
| 从 V1/V2 写法迁移到 V3 写法后输出尺度变化 | 门控和从小于 1 变为等于 1 | 迁移时重新核对学习率与初始化 |
| Upcycling 初期路由器只朝均衡方向变化 | 初值处主损失对路由器的梯度为 0 | 继续训练时保留辅助损失, 等专家参数分开 |

失效表里的处理是排查顺序, 不是论文的配置要求. 第一行的按层统计最常用: DeepSeekMoE 与 V2 都报告第一层的均衡收敛明显更慢, 偏斜可能集中在少数层, 全模型平均的负载指标会把它掩盖.

---

**参考文献**

1. Dai, D., et al. (2024). [DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models](https://arxiv.org/abs/2401.06066). 第 3 节式 (1)–(11), 第 4 节消融, 第 4.5 节专家特化, 第 5–6 节 16B 与 145B, Table 1–3, Table 7, 附录 B.
2. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434). 第 2.2 节设备受限路由与三级均衡损失, 第 3.1.2 节配置, 附录 B V2-Lite.
3. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). 第 2.1.2 节式 (12)–(20), 第 4.2 节配置, Table 5.
4. Wang, L., Gao, H., Zhao, C., Sun, X., & Dai, D. (2024). [Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts](https://arxiv.org/abs/2408.15664).
5. Lepikhin, D., et al. (2020). [GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding](https://arxiv.org/abs/2006.16668).
6. Fedus, W., Zoph, B., & Shazeer, N. (2021). [Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity](https://arxiv.org/abs/2101.03961).
7. Komatsuzaki, A., et al. (2022). [Sparse Upcycling: Training Mixture-of-Experts from Dense Checkpoints](https://arxiv.org/abs/2212.05055). 第 3 节初始化与继续训练.
