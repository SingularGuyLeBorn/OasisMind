---
title: "05 · MuonClip 与 Polar Express：对照 AdamW 的稳定性与极分解"
date: 2026-08-30
as_of: 2026-08-30
tags: [Muon, MuonClip, QK-Clip, Polar Express, AdamW, 优化器]
---

# MuonClip 与 Polar Express：AdamW 对照轴上的两把刀

> 邻居：[01 Muon 专题](./01-Muon优化器专题.md)（Newton–Schulz 推导住在那里，本篇不重推）· [6.5.1 SGD→AdamW](../6.5.1-优化器综述：从SGD到AdamW/6.5.1-优化器综述：从SGD到AdamW.md) · 模型侧用法：[Kimi K2 正本 §2](../../../05-模型家族与选型/5.3-模型家族/kimi/kimi-k2/kimi-k2.md) · [Step 3.5 Flash](../../../05-模型家族与选型/5.3-模型家族/stepfun/step3-5-flash/step3-5-flash.md)

AdamW 把每个权重当成独立标量；Muon 把二维层当成矩阵，走谱范数意义下的最速下降。2025–2026 的训练报告里，真正把这套跑到万亿 MoE 上的，不是再发明一个「Muon 2」，而是两件更窄的事：

1. **极分解怎么算**——固定 Newton–Schulz 太慢起步、启发式多项式又不一定收敛；*Polar Express* 换了一组逐步最优的奇多项式。
2. **注意力 logit 怎么炸**——Muon 的满秩更新会把 $W_q W_k^\top$ 的谱范数平方放大；*QK-Clip* 在优化步之后按头缩放权重。Muon + 衰减 + RMS 对齐 + QK-Clip = **MuonClip**。

本篇只把这两件事放到第 6.5 章对照 AdamW。K2 / Step 报告里「这次捆了它」的叙事统一回到第 05 章对应版本正本，不在这里复制。

## 1. 先把三套更新写在同一张纸上

二维权重 $W_t\in\mathbb{R}^{n\times m}$，随机梯度 $G_t$，学习率 $\eta$。

**AdamW**（元素独立，解耦衰减；[Loshchilov & Hutter, ICLR 2019](https://arxiv.org/abs/1711.05101)）对每个标量 $i$ 维护 $m_t,v_t$，更新形如

$$
\theta_{t+1}^{(i)}=\theta_t^{(i)}-\eta\left(\frac{\hat m_t^{(i)}}{\sqrt{\hat v_t^{(i)}}+\epsilon}+\lambda\theta_t^{(i)}\right).
$$

它不问 $W$ 是不是矩阵。二阶矩 $v_t$ 是对角预条件，更新矩阵的有效秩通常偏低——少数大奇异值吃掉步长。这不是 bug，是它的几何。

**Muon**（Keller Jordan 等；名字就是 MomentUm Orthogonalized by Newton–Schulz）先做动量，再把动量换成离它最近的半正交矩阵。Polar Express 论文把规则写成（[arXiv:2505.16932](https://arxiv.org/abs/2505.16932) 式，默认 $\beta=0.9$）

$$
M_t=\beta M_{t-1}+(1-\beta)G_t,\qquad
W_{t+1}=W_t-\lambda\,\mathrm{polar}(M_t).
$$

若 $M=U\Sigma V^\top$，则 $\mathrm{polar}(M):=UV^\top$。这是矩形矩阵上的符号函数：左右奇异向量留下，奇异值全部拉成 1。几何上，$-\mathrm{polar}(M)$ 是 **谱范数** 意义下的最速下降方向，不是 Frobenius 范数下的 $-M$。完整的 Newton–Schulz 如何逼近 $UV^\top$，见 [01 §4](./01-Muon优化器专题.md)。

**MuonClip** 不是另一种极分解。Kimi K2 报告（[arXiv:2507.20534](https://arxiv.org/abs/2507.20534) Algorithm 1）在 Muon 外包了三层工程：

$$
O_t=\mathrm{Newton\text{-}Schulz}(M_t)\cdot\sqrt{\max(n,m)}\cdot 0.2,
\qquad
W_t=W_{t-1}-\eta(O_t+\lambda W_{t-1}),
$$

然后对每个注意力头看本步前向已经算过的最大 logit $S_{\max}^h$，超阈值就缩放 $W_q,W_k$。$0.2\sqrt{\max(n,m)}$ 是为了让更新的 RMS 和 Adam 习惯的量级对齐（报告写 consistent RMS matching，前作 Moonlight）。没有这一层，直接换学习率表会对不齐。

![AdamW 逐元素、Muon 极分解、Polar Express 换多项式、QK-Clip 更新后缩放](./images/fig-muonclip-polar-express.png)

> 图 1：四件事不要混成一个名词。左起：AdamW 拍扁成标量；Muon 对矩阵做 $\mathrm{polar}$；Polar Express 只替换「怎么算 polar」；QK-Clip 只在注意力权重上做更新后缩放。

谁管哪一层：

| 层 | 解决什么 | 不解决什么 |
|----|----------|------------|
| AdamW | 标量自适应步长、解耦衰减 | 矩阵几何、谱范数最速下降 |
| Muon / $\mathrm{polar}$ | 二维层各向同性更新 | 注意力 logit 上界；1D 参数（embed / 路由）仍常走 AdamW |
| Polar Express | 少步数、还能收敛的 polar 近似 | logit 爆炸；BF16 下的加法病理（见 §3） |
| QK-Clip | 把 $S_{\max}^h$ 按头压回 $\tau$ | 优化器本身的收敛阶；不要当成梯度裁剪 |

2026-08 常见配方不是「全面替换 AdamW」，而是 **2D 线性层 Muon（或 MuonClip），其余 AdamW**。Qwen3.8-Flash-Next 官方博文写明：2D 线性走 Muon，Embedding / Router / Gated Residual 低秩走 AdamW（https://qwen.ai/blog?id=qwen3.8-flash-next）。

### 1.1 Per-Head Muon（K3）

Kimi K3 仍对矩阵参数用 Muon，并沿用 K2 的 weight-clip（报告 §2.5、§3.3）。注意力的 $Q,K,V$ 投影不再对整张矩阵做 Newton–Schulz：把动量 **按头切开**，每头单独正交化。直觉：整矩阵 polar 时，梯度/动量大的头会主导共享更新方向，小头归一化不足。按头做完，头与头之间的更新尺度更齐，大规模更稳；高瘦的每头块做 NS 也比整张投影便宜一点。这不是新的极分解多项式，也不是 QK-Clip。

来源：K3 §2.5。他们还写 P2P 只收集本 rank 拥有的参数碎片再正交化，避免对整缓冲 all-gather（§5.2.2）——那是 ZeRO/Muon 通信，不是优化器公式。

## 2. Polar Express：换的是 polar 的多项式，不是优化器名字

### 2.1 固定 Newton–Schulz 的脾气

经典三次 Newton–Schulz（Higham 教材里的多项式极分解；Muon 最初用的就是这个家族）在把 $X_0=M/\|M\|_F$ 归一化之后做

$$
X_{t+1}=\frac{3}{2}X_t-\frac{1}{2}X_t X_t^\top X_t,
$$

等价于对每个奇异值套 $p(x)=\frac{3}{2}x-\frac{1}{2}x^3$。靠近 $1$ 时二次收敛很快；**离 $1$ 很远时前几步几乎不走**。五次 Padé 多项式 $(15x-10x^3+3x^5)/8$ 同样偏爱「已经快正交」的矩阵。

Muon 实际只跑大约 5 步，要的是粗近似而不是 16 位精度。于是出现了两条启发式：Jordan 的固定五次式 $3.4445x-4.7750x^3+2.0315x^5$（前几步快，但误差大约停在 $0.3$，**不收敛到** $\mathrm{polar}$）；You 的六段不同多项式（更准，仍然不保证收敛）。数字来自 Polar Express 论文 §1.2，不是本库重测。

### 2.2 每一步换一个最优奇多项式

Polar Express 的想法来自 zolo-pd 那套「区间 $[\ell,u]$ 上对 $\mathrm{sign}$ 做极小极大逼近」，但只用 **奇多项式**，避免求逆和 QR，才能在 GPU 上纯 GEMM。

记当前奇异值落在 $[\ell_t,u_t]$。选 $p_t\in\mathbb{P}_d^{\mathrm{odd}}$，使得合成 $p_t\circ\cdots\circ p_1$ 在该区间上对 $\mathrm{sign}$ 的 $L^\infty$ 误差最小（论文 Theorem 4.1）。区间大时先拼命抬小奇异值；缩到 $1$ 附近后多项式自动靠近 Padé，把渐近阶接回来。五次 Horner 一步是

$$
X\leftarrow aX+bX(X^\top X)+cX(X^\top X)^2,
$$

也就是代码里的 $aX+bX^3+cX^5$。系数 **离线算一次** 存表；在线阶段只做矩阵乘。论文 Algorithm 1 用 $\ell=10^{-3}$、$u=1$（bfloat16 的 $\epsilon_{\mathrm{mach}}=2^{-7}$，他们猜 $\ell\approx 10^{-3}$），并给出一串预计算三元组。

### 2.3 半精度：安全因子 $1.01$，以及 Step 的 float16 事故

§4.4：最优多项式可能把 $1+\epsilon$ 映射到区间外，或把中间奇异值打到接近 0。他们把 $p_t(x)$ 换成 $p_t(x/1.01)$（最后一次迭代可以去掉），让舍入后的谱仍落在设计区间里。奇异值会收敛到约 $0.999998$ 而不是精确的 $1$——对 Muon 这种粗 polar 足够。

这 **不等于** BF16 已经安全。Step-3.5-Flash 技术报告写：采用 Polar Express、固定 $T=6$；即使用了论文推荐的安全缩放，仍偶尔出现 **尖锐、不可恢复的 loss spike**，且非确定性（从邻近 checkpoint 重跑有时避开）。模拟指向 bfloat16 下 Polar Express **加法累积** 产生极端中间值。对策不是改回 Newton–Schulz，而是 **只把 Polar Express 的状态和中间量转到 float16**，其余训练保持混合精度；之后尖峰不再复发。数字与叙事以 Step 报告为准，见本库精译，不要把「$T=6$」写成宇宙常数。

Polar Express 论文自己的 GPT-2 Large（774M）/ FineWeb 1B token / 4×H100 对照（Figure 1，五步、bfloat16 符号迭代）：最佳学习率下验证损失 AdamW $4.172$（$lr=10^{-4}$），muon-You $3.400$，muon-Jordan $3.398$，muon-PolarExp $3.340$（后三者 $lr=0.02$）。这是 **小模型、短数据** 的对照，不能外推成「K2 换 Polar Express 会掉 0.06」。

## 3. QK-Clip：满秩更新之后，注意力在平方谱范数

### 3.1 为什么 AdamW 较少碰到、Muon 会碰到

注意力分数

$$
S_{ij}^h=\frac{1}{\sqrt{d}}(x_i W_q^h)(x_j W_k^h)^\top.
$$

Muon 的 $\mathrm{polar}$ 产生近似 **满秩** 的更新。K2 附录 E 的对照是：Adam 的更新更接近低秩，奇异向量不容易对齐着叠；Muon 更容易让 $W_q W_k^\top$ 的谱范数被平方放大。中等规模消融（9B 激活 / 53B 总参 MoE，vanilla Muon）里，最大 logit 会到 **1000 量级**，跟着就是 spike 乃至发散（K2 Figure 2 左、正文 §2.1）。

现成补丁不够用：

- **logit soft-cap** 卡的是送进 softmax 的值，点积在 cap 之前仍可疯长。
- **QK-Norm** 要物化完整的 $K$。MLA 推理时 Key 并不完整物化（这是它压 KV 的原因），所以 K2 明确写 QK-Norm **不能** 直接用在 MLA 上。

### 3.2 更新后缩放，不改本步前向/反向

定义本 batch 该头 softmax 输入的最大值

$$
S_{\max}^h=\frac{1}{\sqrt{d}}\max_{X\in B}\max_{i,j} Q_i^h (K_j^h)^\top.
$$

超过阈值 $\tau$ 时令 $\gamma_h=\min(1,\tau/S_{\max}^h)$。朴素做法对所有头用同一个 $\gamma$、再按 $\alpha$ 拆给 $Q$ 和 $K$：

$$
W_q^h\leftarrow\gamma^\alpha W_q^h,\qquad W_k^h\leftarrow\gamma^{1-\alpha}W_k^h,
$$

报告取 $\alpha=0.5$，即两侧都乘 $\sqrt{\gamma}$。实际只有少数头爆炸，所以改成 **按头** 的 $\gamma_h$，避免把正常头一并按下去。

MLA 不能动共享的旋转 Key。K2 Algorithm 1 的落地是：

- 头专有的 $q^C,k^C$：各乘 $\sqrt{\gamma_h}$
- 头专有的旋转 $q^R$：乘 $\gamma_h$（只动 Q 侧，补偿 $\sqrt{\gamma}\cdot\sqrt{\gamma}$）
- 共享旋转 $k^R$：**不动**，以免一个头的裁剪泄漏到所有头

关键约束：缩放发生在 **本步权重更新之后**。当前 step 的前向/反向已经用旧权重算完，$S_{\max}^h$ 只当传感器。所以这不是梯度裁剪，也不是改注意力公式。旧第 5 章曾把它误读为「梯度裁剪」，该稿已归档；正确口径见 [Kimi K2 正本](../../../05-模型家族与选型/5.3-模型家族/kimi/kimi-k2/kimi-k2.md)。

### 3.3 自停用，以及 $\tau$ 不是魔法数

K2 预训练：$\tau=100$，15.5T token，报告称 **零 loss spike**。前 70,000 步约 **12.7%** 的头至少触发过一次；之后所有头的 $S_{\max}$ 都进过阈值以下，QK-Clip 失效。小模型消融 $\tau=30$ 时损失曲线与 vanilla Muon 几乎重合，下游无统计显著变差（附录 D）。不要把 $\tau=100$ 抄到你的 1B 模型上当默认；阈值跟宽度、精度、数据都绑在一起。

MuonClip = Muon + 权重衰减 + RMS 对齐 + QK-Clip。少写任何一块，都不是 K2 那份优化器。

## 4. 和 ZeRO、精度、层类型的边界

- **分片**：Newton–Schulz / Polar Express 要看到完整的梯度矩阵。ZeRO 把参数和梯度切开时，Muon 需要对 2D 层做「受限 ZeRO + 收集」一类补丁。DeepSeek-V4 的写法见 [6.1](../../6.1-训练基础设施/6.1-训练基础设施.md) 的 Muon×ZeRO 段，本篇不重讲背包算法。
- **不是所有参数都是矩阵**：Embedding、部分 Router、某些低秩残差分支，2026 报告里仍常见 AdamW。强行 polar 一维向量没有几何。
- **Polar Express ≠ 更稳的注意力**。它只让 $UV^\top$ 的近似更像样。logit 爆炸仍要 QK-Clip 或别的权重约束。Step 还对 MoE 专家投影做 **离线** 权重范数裁剪，报告写「类似 MuonClip，但是 checkpoint 上做、不是逐步 on-the-fly」。
- **精度**：论文 Algorithm 1 默认把 $G$ 转到 bfloat16 再迭代；Step 的事故说明在真实大模型上可能要把 **这一段** 提到 float16。未找到一手来源的「必须 FP32 polar」不要写。

## 5. 失效条件

- 把 FineWeb 1B 上 Polar Express 相对 Jordan 的 $0.058$ 验证损失差，说成你的万亿 MoE 会稳赚。
- 把 QK-Clip 当梯度 clip 或当 QK-Norm 的别名。
- 在 MLA 上对共享 $k^R$ 做按头缩放。
- 只换 Polar Express、不处理 logit，然后抱怨「Muon 不稳」。
- 在 ZeRO-3 切片上对半个矩阵做 5 步多项式，还当它是 $UV^\top$。
- 把 Per-Head Muon 说成 QK-Clip，或说成 Polar Express 的新多项式。

## 6. 知识库同步

- Newton–Schulz 逐步推导：[01](./01-Muon优化器专题.md)
- SGD→AdamW 速览（2025 原文 + 修订指针）：[6.5.1](../6.5.1-优化器综述：从SGD到AdamW/6.5.1-优化器综述：从SGD到AdamW.md)
- K2 报告里的 Algorithm 1 与 MLA 特例：[Kimi K2 正本](../../../05-模型家族与选型/5.3-模型家族/kimi/kimi-k2/kimi-k2.md)，不在本篇展开 MoE
- 残差主干 xHC 与 Muon 正交（xHC 论文的实验声明）：[02-xHC](../../../2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md)

## 参考文献

1. Amsel, N., Persson, D., Musco, C., & Gower, R. M. (2025). *The Polar Express: Optimal Matrix Sign Methods and Their Application to the Muon Algorithm*. https://arxiv.org/abs/2505.16932 （本篇打开 HTML：摘要、§1–1.3、§2 多项式对照、§4.4 有限精度、Figure 1 数字、Algorithm 1）
2. Moonshot AI. *Kimi K2: Open Agentic Intelligence*. https://arxiv.org/abs/2507.20534 （MuonClip / QK-Clip / Algorithm 1 / 附录 D；本库导航见 [Kimi K2 正本](../../../05-模型家族与选型/5.3-模型家族/kimi/kimi-k2/kimi-k2.md)）
3. Loshchilov, I., & Hutter, F. (2019). *Decoupled Weight Decay Regularization*. https://arxiv.org/abs/1711.05101
4. StepFun. Step-3.5-Flash 技术报告（本库 mineru-en：Polar Express $T=6$，BF16 spike → 迭代转 float16）
5. Qwen. *Qwen3.8-Flash-Next* 官方博文：https://qwen.ai/blog?id=qwen3.8-flash-next （2D Muon + 其余 AdamW；技术报告 PDF 本篇未读）
6. Kimi K3 Per-Head Muon 与 P2P 正交化：https://arxiv.org/html/2607.24653 §2.5、§5.2.2
