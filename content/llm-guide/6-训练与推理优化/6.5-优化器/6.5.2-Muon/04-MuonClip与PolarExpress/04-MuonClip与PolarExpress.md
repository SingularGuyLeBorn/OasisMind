---
title: "04 · MuonClip 与 Polar Express: 注意力 logit 裁剪与极分解多项式"
published: true
tags: ["Muon", "MuonClip", "QK-Clip", "Polar Express", "Newton-Schulz", "Kimi K2", "优化器"]
excerpt: "Muon 放大到万亿参数 MoE 时有两处要补: 注意力 logit 会随 $W_q, W_k$ 的谱范数一起涨, 极分解的多项式迭代在少步数下要么慢要么不收敛. Kimi K2 的 QK-Clip 在每步更新后按头缩放 $W_q, W_k$; Polar Express 在每一步选一个极小化极大意义下最优的奇多项式."
---
# 04 · MuonClip 与 Polar Express: 注意力 logit 裁剪与极分解多项式

Muon 对二维权重的动量矩阵做极分解, 把奇异值全部换成 1, 再拿这个半正交矩阵当更新方向. 它为什么是谱范数下的最速下降, Newton–Schulz 迭代怎样只用矩阵乘法逼近极分解, 推导在 [01 篇](../01-Muon优化器专题/01-Muon优化器专题.md); 最速下降的范数视角在 [03 篇](../03-Muon优化器-从最速下降的本质出发/03-Muon优化器-从最速下降的本质出发.md). 这里接着往下写: Muon 从 GPT-2 规模的实验走到万亿参数 MoE 预训练时, 训练报告里补上的两件事.

第一件是注意力 logit 爆炸. Kimi K2 的中等规模实验里, 用原版 Muon 训练的注意力最大 logit 很快超过 1000, 随后出现 loss spike 和偶发的发散 ([Kimi K2 技术报告](https://arxiv.org/abs/2507.20534) §2.1). K2 的对策是 QK-Clip: 每步权重更新之后, 按头检查这一步前向里出现过的最大 logit, 超过阈值就把该头的 $W_q, W_k$ 缩小. 第二件是极分解本身怎么算. Muon 只跑 5 步左右的多项式迭代, 经典 Newton–Schulz 在这个步数下对小奇异值几乎没有作用, 启发式调出来的系数又不收敛. [Polar Express](https://arxiv.org/abs/2505.16932) 把「每一步用哪个多项式」写成一个极小化极大问题, 证明逐步贪心求解就是全局最优.

两件事作用在不同的位置: QK-Clip 改的是注意力层的权重, 不碰优化器给出的方向; Polar Express 只替换「怎么从动量矩阵算出 $\mathrm{polar}(M)$」这一步, 不碰注意力. 下文第 1 节先把 Muon 的一步和 K2 在它外面加的工程层写清楚, 第 2, 3 节写 QK-Clip 和 K2 报告里的数字, 第 4, 5 节写 Polar Express 的构造, 收敛和实验.

## 1. Muon 的一步, 以及放大规模后的两个缺口

### 1.1. 动量, 极分解与 RMS 对齐

记二维权重 $W_t\in\mathbb{R}^{n\times m}$, 随机梯度 $G_t$. Polar Express 论文 §1.1 把 Muon 写成

$$
M_t=\beta M_{t-1}+(1-\beta)G_t,\qquad W_{t+1}=W_t-\lambda\,\mathrm{polar}(M_t), \tag{1}
$$

其中 $\beta$ 是动量系数 (默认 0.9), $\lambda$ 是学习率, $\mathrm{polar}(M):=UV^\top$, $M=U\Sigma V^\top$ 是奇异值分解. K2 报告的 Algorithm 1 写成 $M_t=\mu M_{t-1}+G_t$, 不乘 $(1-\beta)$. 两种写法在 $\beta=\mu$ 时只差一个常数倍 $(1-\beta)$, 而 $\mathrm{polar}(cM)=\mathrm{polar}(M)$ 对任意 $c>0$ 成立, 所以给出的更新方向完全一样. 普通动量 SGD 沿 $-M_t$ 走, Muon 沿 $-\mathrm{polar}(M_t)$ 走: 左右奇异向量保留, 奇异值全部换成 1.

直接用 $\mathrm{polar}(M_t)$ 做更新有一个尺度问题. Moonlight 论文 ([Liu et al., 2025](https://arxiv.org/abs/2502.16982) Lemma 1) 指出, 形状为 $A\times B$ 的满秩矩阵, 其 Muon 更新的 RMS 理论值是 $\sqrt{1/\max(A,B)}$. 这个数可以直接算出来: $\|UV^\top\|_F^2=\min(A,B)$, 除以元素个数 $AB$ 再开方, 就是 $\sqrt{1/\max(A,B)}$. 于是 MLP 里 $\max(A,B)$ 很大的矩阵更新偏小, 把每个 KV 头当成单独参数时更新又偏大. 同一篇论文观察到 AdamW 的更新 RMS 通常在 0.2 到 0.4 之间, 于是把 Muon 的更新乘上 $0.2\sqrt{\max(A,B)}$, 让 RMS 固定在 0.2 附近, 这样 Muon 管的矩阵参数和 AdamW 管的 Embedding, RMSNorm 参数可以共用同一组学习率和权重衰减. 同一篇论文还给 Muon 加上了 AdamW 式的解耦权重衰减: 800M 模型训 100B token 的对照里, 不加衰减的 Muon 前期收敛快, 后期部分权重涨得过大, 加衰减后同时好过原版 Muon 和 AdamW (Moonlight §2.2, Figure 2).

### 1.2. K2 的 MuonClip 算法与两个缺口

K2 把上面三样东西和 QK-Clip 合成一个优化器, 叫 MuonClip (K2 §2.1). Algorithm 1 的 Muon 部分是

$$
O_t=\mathrm{NewtonSchulz}(M_t)\cdot\sqrt{\max(n,m)}\cdot 0.2,\qquad W_t=W_{t-1}-\eta\,(O_t+\lambda W_{t-1}), \tag{2}
$$

$\eta$ 是学习率, $\lambda$ 是权重衰减系数, 第一式行尾的注释是「Match Adam RMS」. 这一步对每个二维权重独立做完以后, 再对每个注意力头执行 QK-Clip. MuonClip 等于 Muon, 权重衰减, RMS 对齐, QK-Clip 四者合在一起; 只拿其中一部分, 就和 K2 报告里的优化器对不上.

把 Muon 放到更大的模型上, 报告里先后暴露出两个缺口, 分别对应式 (2) 里的两个位置. 一个在式 (2) 之外: 更新方向本身没问题, 但它让注意力的 $W_q, W_k$ 的谱范数持续变大, 最大 logit 跟着变大. 另一个在 $\mathrm{NewtonSchulz}(M_t)$ 这个记号里面: 迭代步数有限, 多项式选得不好, 算出来的矩阵离 $UV^\top$ 还远. 下图把 AdamW, Muon, Polar Express, QK-Clip 四者的作用位置并排画出.

![AdamW 逐元素更新, Muon 对矩阵做极分解, Polar Express 替换计算极分解的多项式, QK-Clip 在更新后缩放注意力权重](../images/fig-muonclip-polar-express.png)

图 1 从左到右: AdamW 把矩阵拉平成一个个标量分别更新; Muon 对整个矩阵做 $\mathrm{polar}$; Polar Express 只替换「怎么算 $\mathrm{polar}$」; QK-Clip 只作用在注意力的 $W_q, W_k$ 上, 发生在权重更新之后. 图里没有画出 RMS 对齐和权重衰减, 它们属于 Muon 那一列; 也没有画 Embedding, RMSNorm 等一维或非线性映射参数, 这些参数在 K2, Moonlight 和 Polar Express 的 GPT-2 实验里都交给 AdamW.

## 2. 注意力 logit 爆炸与 QK-Clip

### 2.1. 现象: 中等规模 MoE 上最大 logit 超过 1000

K2 报告 §2.1 用一个激活 9B, 总参 53B 的 MoE 模型做原版 Muon 训练, 观察每个注意力头送进 softmax 的最大值. Figure 2 左图里, 这个最大 logit 很快越过 1000. 报告写到, 这个量级的 logit 通常伴随训练不稳定, 包括明显的 loss spike 和偶发的发散. 报告同时写到, 这种 logit 爆炸在他们的实验里 Muon 上更常见, AdamW 上较少.

现成的两种办法在 K2 的架构上都不够用. logit soft-cap 直接截断送进 softmax 的值, 但截断发生在点积之后, $q_i\cdot k_j$ 本身仍可以在截断之前无限增长. QK-Norm 在点积之前对 Query 和 Key 做归一化, 需要拿到完整的 Key 矩阵; K2 用的是 MLA, 推理时 Key 矩阵不完整物化, 这正是 MLA 压缩 KV cache 的方式, 所以 QK-Norm 用不上 (K2 §2.1). 后来的 DeepSeek-V4 换了注意力结构, 能直接对 Query 和 KV 条目做 RMSNorm, 报告明写因此不用 QK-Clip ([DeepSeek-V4 技术报告](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro) §2.4, 本库译稿见 [DeepSeek-V4](../../../../../model-library/03-模型家族/01-deepseek/deepseek-v4/deepseek-v4-bi.md)). 这说明 QK-Clip 解决的是「logit 需要约束, 但结构上做不了 QK 归一化」这一类情况.

### 2.2. 为什么 Muon 更容易出现

K2 附录 E 给了一个解释. 最大 logit 写成 $S_{\max}=\max_{i,j}q_i\cdot k_j$, 由 Cauchy–Schwarz 不等式和算子范数的定义,

$$
|q_i\cdot k_j|\le\|q_i\|\,\|k_j\|\le\|x_i\|\,\|x_j\|\,\|W_q\|\,\|W_k\|, \tag{3}
$$

$x_i, x_j$ 是注意力层的输入, 范数取谱范数. RMSNorm 让 $\|x_i\|\|x_j\|$ 有界, 所以 $S_{\max}$ 的增长主要来自 $W_q$ 或 $W_k$ 谱范数的增长. 式 (3) 右边是 $\|W_q\|$ 和 $\|W_k\|$ 的乘积, 两个矩阵的最大奇异值各涨一点, 乘起来就涨得更多; 附录 E 的说法是乘积 $W_qW_k^\top$ 把谱范数平方了.

接下来的问题是, 为什么 Muon 训练里谱范数涨得更快. 附录 E 的假设落在更新矩阵的奇异值分布上. Muon 的更新来自 $\mathrm{msign}$, 所有奇异值相等, 有效秩是满的; Adam 的更新矩阵通常是偏斜谱, 少数几个大奇异值占主导, 有效秩低. 报告提到在 16B 的 Moonlight 模型上验证过, Muon 训练出来的权重奇异值熵 (有效秩) 高于 Adam. 写成 SVD, 上一步权重 $W_{t-1}=\sum_i\sigma_iu_iv_i^\top$, 更新 $\Delta W_t=\sum_j\bar\sigma\,\bar u_j\bar v_j^\top$, 两者相加后, 如果某个 $u_iv_i^\top$ 和某个 $\bar u_j\bar v_j^\top$ 方向对齐, 对应的奇异值就会直接加上 $\bar\sigma$. 权重和更新的有效秩都高, 对齐的概率就高. 报告把这一段明确写成假设, 没有给出定量证明.

### 2.3. QK-Clip 的公式, 按头裁剪与 MLA 特例

对第 $h$ 个头, $Q^h=XW_q^h$, $K^h=XW_k^h$, 注意力输出是 $\mathrm{softmax}\big(\tfrac{1}{\sqrt d}Q^hK^{h\top}\big)V^h$. K2 定义每个头一个标量, 即这一批 $B$ 里 softmax 输入的最大值:

$$
S_{\max}^h=\frac{1}{\sqrt d}\max_{X\in B}\max_{i,j}Q_i^hK_j^{h\top}, \tag{4}
$$

$i,j$ 是同一个训练样本里不同 token 的下标. $S_{\max}^h$ 超过阈值 $\tau$ 时缩放 $W_q, W_k$. 朴素版本对所有头用同一个系数: 令 $S_{\max}=\max_hS_{\max}^h$, $\gamma=\min(1,\tau/S_{\max})$, 再按

$$
W_q^h\leftarrow\gamma^{\alpha}W_q^h,\qquad W_k^h\leftarrow\gamma^{1-\alpha}W_k^h \tag{5}
$$

缩放, $\alpha$ 一般取 0.5, 即 Query 和 Key 两侧各乘 $\sqrt\gamma$. 由于 logit 是 $W_q$ 和 $W_k$ 的双线性函数, 两侧各乘 $\sqrt\gamma$, 同一输入上的 logit 正好乘 $\gamma$; 若 $S_{\max}=2\tau$, 则 $\gamma=0.5$, 两个矩阵各乘 $0.707$. K2 观察到实际只有少数头的 logit 爆炸, 为了尽量少干预训练, 改用逐头的 $\gamma_h=\min(1,\tau/S_{\max}^h)$, 每个头只按自己的最大 logit 缩放.

MHA 里每个头的 $W_q^h, W_k^h$ 都是独立参数, 逐头缩放直接做即可. MLA 的 Key 分成两部分: 头专有的内容分量 $k^C$, 和所有头共享的旋转分量 $k^R$ (携带 RoPE 位置信息). 一个头的 logit 是 $q^C\cdot k^C+q^R\cdot k^R$. 如果缩放共享的 $k^R$, 一个头的裁剪会影响所有头. K2 的做法是只动头专有的分量:

- $q^C$ 和 $k^C$ 各乘 $\sqrt{\gamma_h}$, 内容项 $q^C\cdot k^C$ 乘 $\gamma_h$;
- 头专有的旋转 Query $q^R$ 乘 $\gamma_h$, 共享的 $k^R$ 不动, 旋转项 $q^R\cdot k^R$ 同样乘 $\gamma_h$.

两项都乘 $\gamma_h$, 整个 logit 也就乘 $\gamma_h$. K2 Algorithm 1 第 9 到 17 行把这件事写成: 对每层每个头, 取前向时已经算好的 $S_{\max}^h$, 若大于 $\tau$, 令 $\gamma\leftarrow\tau/S_{\max}^h$, 把 $W_{qc}^h, W_{kc}^h$ 乘 $\sqrt\gamma$, $W_{qr}^h$ 乘 $\gamma$.

缩放的时机在本步权重更新之后. 报告特别写明, 这个操作不改变当前步的前向和反向计算, 最大 logit 只是一个信号, 用来决定压多少. 所以 QK-Clip 和梯度裁剪是两回事: 梯度裁剪改的是这一步用来更新的梯度; QK-Clip 不碰梯度, 改的是更新完的权重. 它和 QK-Norm 也不同: QK-Norm 改变了注意力的计算公式, 每次前向都生效; QK-Clip 不改公式, 只在超过阈值时把权重缩回去, 没超过时什么也不做.

## 3. K2 报告里的数字

### 3.1. 预训练配方与最大 logit 的轨迹

K2 是总参 1T, 激活 32B 的 MoE 模型, 注意力用 MLA (K2 §2). 预训练配方见 §2.5: 上下文 4,096, 优化器为 MuonClip, 学习率用 WSD 调度, 共 15.5T token. 前 10T token 在 500 步 warmup 之后保持常数学习率 $2\times10^{-4}$, 后 5.5T token 按余弦从 $2\times10^{-4}$ 衰减到 $2\times10^{-5}$; 权重衰减全程 0.1, 全局 batch 67M token. 预训练末尾还有一段退火和长上下文阶段, 学习率从 $2\times10^{-5}$ 降到 $7\times10^{-6}$, 先在 4k 长度上训 400B token, 再在 32k 长度上训 60B token.

QK-Clip 的阈值取 $\tau=100$. Figure 2 右图是整个训练过程中的最大 logit: 开始阶段 logit 很快涨到 100 并被压在 100, 大约训练步数的 30% 之后才衰减到稳定区间, 全程没有调整过 $\tau$. Figure 3 是逐步的训练 loss 曲线, 不平滑也不下采样 (省略了最开始的一段), 全程没有 spike. 摘要的原话是 15.5T token 预训练「zero loss spike」.

### 3.2. 消融与自停用

QK-Clip 会不会损害模型质量, K2 附录 D 用小模型回答. 两个激活 0.5B, 总参 3B 的 MoE 模型, 一个用原版 Muon, 一个用 MuonClip 并把阈值压到很低的 $\tau=30$. Figure 12 里两条 loss 曲线几乎重合, 下游评测上也没有统计显著的退化. 这个实验选的是激进的阈值: 如果 $\tau=30$ 都不影响收敛, 正式训练用的 $\tau=100$ 介入得更少.

附录 D 还记录了 QK-Clip 在 K2 正式训练中的触发情况. 前 70,000 步里, 12.7% 的注意力头至少触发过一次, 被压在 $S_{\max}=100$; 70,000 步之后, 所有头的 $S_{\max}$ 都曾降到 100 以下, QK-Clip 不再生效. 报告把这叫作自停用: 训练稳定之后 QK-Clip 完全不起作用. 逐头而不逐层裁剪, 目的是避免对其它头过度正则化. 这两组数字和 Figure 2 右图一致: logit 被压在 100 的时期集中在训练前段.

### 3.3. 后续报告怎样处理同一问题

Kimi K3 沿用了 K2 的权重裁剪机制, 同时把注意力投影的 Muon 改成逐头版本 ([Kimi K3 技术报告](https://arxiv.org/abs/2607.24653) §2.5, §3.3). 做法是把 $Q, K, V$ 投影的动量矩阵沿头的维度切开, 每个头的块单独做 Newton–Schulz 正交化. 报告给出的理由是: 整矩阵正交化把所有头当成一个耦合块, 梯度或动量尺度大的头主导共享的更新方向, 尺度小的头得到的归一化不足; 逐头正交化让各头的更新尺度一致, 大规模训练更稳. 每个头的块是高瘦矩阵, 在上面做 Newton–Schulz 也比在整张投影矩阵上便宜一些. 逐头 Muon 改的是正交化的粒度, 不涉及多项式的选择, 也不替代 QK-Clip.

DeepSeek-V4 走了另一条路. 它的注意力结构允许直接对 Query 和 KV 条目做 RMSNorm, 报告写明因此不用 QK-Clip (§2.4). Step-3.5-Flash 在 MoE 专家投影上用了一种相近的权重裁剪: 若专家投影矩阵 $W$ 的最大激活范数 $\max_x\|Wx\|$ 超过阈值 $\tau$, 就把 $W$ 乘 $\tau/\max_x\|Wx\|$; 报告说这类似注意力里的 MuonClip, 区别是在 checkpoint 上离线做, 不在训练中逐步做 ([Step-3.5-Flash 技术报告](https://arxiv.org/abs/2602.10604), 本库译稿见 [Step 3.5 Flash](../../../../../model-library/03-模型家族/04-stepfun/step3-5-flash/step3-5-flash-bi.md)). 同一份报告的 Figure 4 显示, 专家上的权重裁剪只推迟了末几层的范数爆炸, 激活裁剪才把最大范数压住. 三份报告放在一起看, 约束 logit 或激活范数的手段跟着架构走: 能做 QK 归一化就做归一化, 做不了才在权重上裁剪.

## 4. Polar Express: 每一步选一个极小化极大最优的多项式

### 4.1. 动机: Newton–Schulz 系数的两难

只用矩阵乘法逼近 $\mathrm{polar}(M)$ 的办法, 是对奇异值反复套一个奇多项式. 对奇数次单项式有 $M^{2q+1}:=U\Sigma^{2q+1}V^\top=M(M^\top M)^q$, 所以奇多项式 $p(x)=a_0x+a_1x^3+\cdots$ 作用在矩阵上就是 $a_0M+a_1M(M^\top M)+\cdots$, 等价于对每个奇异值算 $p(\sigma_i)$. 只能用奇多项式, 原因是矩形矩阵不先做 SVD 就算不出奇异值的偶次幂 (Polar Express §2 脚注). 经典三次 Newton–Schulz 先归一化 $X_0=M/\|M\|_F$, 再迭代

$$
X_{t+1}=\tfrac32X_t-\tfrac12X_tX_t^\top X_t, \tag{6}
$$

对每个奇异值相当于 $p(x)=\tfrac32x-\tfrac12x^3$. 只要 $|x_0|\le1$, 标量迭代收敛到 $\mathrm{sign}(x_0)$, 矩阵迭代收敛到 $UV^\top$. 五次版本 $p(x)=(15x-10x^3+3x^5)/8$ 收敛更快. 这一族多项式由「在 $x=\pm1$ 处与 $\mathrm{sign}$ 函数的值和前几阶导数相等」决定, $2q+1$ 次的成员收敛阶是 $q+1$ (Polar Express 附录 B). 它们在 $X_t$ 已经接近 $\mathrm{polar}(M)$ 时收敛极快, 离得远时前几步几乎不动 (§1.2).

前几步慢的原因在 $x\to0$ 处的斜率. 三次式在 0 点的导数是 1.5, 五次式是 $15/8=1.875$. 一个 $10^{-3}$ 的奇异值每步大约只乘这么多, 用五次式要 $\ln1000/\ln1.875\approx11$ 步才能长到 1 附近, 用三次式要约 17 步. Muon 实际只跑 5 步上下, 不需要 16 位有效数字, 要的是少步数下的粗近似. Jordan 为此用启发式数值搜索调出一个固定的五次式 $p(x)=3.4445x-4.7750x^3+2.0315x^5$, 0 点斜率 3.4445, 前几步走得快; 代价是 $p(1)=0.701$, 1 不再是不动点, 迭代不收敛到 $\mathrm{polar}(M)$, 误差停在约 0.3. You 的方案依次用六个不同的多项式, 精度好于 Jordan 的, 仍不收敛 (§1.2). DeepSeek-V4 的混合 Newton–Schulz 处理的是同一个两难: 共 10 步, 前 8 步用 Jordan 的系数 $(3.4445,-4.7750,2.0315)$ 把奇异值快速推到 1 附近, 后 2 步换成 $(2,-1.5,0.5)$ 把奇异值稳定在 1 (DeepSeek-V4 §2.4). 可以验证 $2-1.5+0.5=1$, 且 $p'(1)=2-4.5+2.5=0$, 1 是这个多项式的超吸引不动点.

### 4.2. 极小化极大构造与「贪心即最优」

Polar Express 的出发点来自数值分析里的 Zolo-pd 一类方法 (Nakatsukasa & Freund, 2016): 不在 $x=1$ 附近逼近 $\mathrm{sign}$, 而在包含所有奇异值的整个区间 $[\ell,u]$ 上做最优逼近, 每步之后区间变了, 下一步就换一个多项式. Zolo-pd 用有理函数, 需要矩阵求逆或 QR 分解, 不适合 GPU 和低精度; Polar Express 把同样的思路限制在奇多项式上, 只用矩阵乘法. 给定奇异值的上下界 $\ell, u$, 奇数次数 $d$ 和迭代步数 $T$, 论文要找的是使最坏情况谱范数误差最小的多项式组合 (式 (5)), 由谱范数的酉不变性, 它等价于

$$
p^\star=\mathop{\arg\min}_{\substack{p=p_T\circ\cdots\circ p_1\\ p_t\in\mathbb{P}_d^{\mathrm{odd}}}}\ \max_{x\in[\ell,u]}|1-p(x)|, \tag{7}
$$

即在区间 $[\ell,u]$ 上用若干个奇多项式的复合去一致逼近常数 1. $\mathbb{P}_d^{\mathrm{odd}}$ 指次数不超过 $d$, 只含奇次项的多项式.

论文 Theorem 3.1 证明, 式 (7) 可以逐步贪心求解. 令 $\ell_1=\ell$, $u_1=u$, 第 $t$ 步取 $p_t$ 为 $[\ell_t,u_t]$ 上对常数 1 的最优一致逼近, 新区间是 $p_t$ 在 $[\ell_t,u_t]$ 上的值域. 定理给出三个结论: 贪心得到的复合 $p^\star=p_T\circ\cdots\circ p_1$ 就是式 (7) 的解; 新区间满足

$$
\ell_{t+1}=p_t(\ell_t),\qquad u_{t+1}=2-\ell_{t+1}; \tag{8}
$$

最终误差是 $1-\ell_{T+1}$. 式 (8) 的意思是最优多项式在区间上围绕 1 等幅振荡, 最低点在左端点, 振幅为 $1-\ell_{t+1}$. 有了式 (8), 只要给定初始的 $\ell, u$, 所有 $p_t$ 和区间都能提前算好. 单步的最优多项式由等振荡定理刻画, 一般可用 Remez 算法求; 论文对 $d=3$ 给出闭式解 (与 Chen & Chow 2014 的多项式在缩放意义下相同), 对 $d=5$ 给出一个与 Remez 等价, 更简单的算法 (Algorithm 2, §3.2).

### 4.3. 和 Newton–Schulz 的收敛对比

贪心最优意味着同次数下 Polar Express 至少和 Newton–Schulz 一样快. 论文 Theorem 3.3 由此给出收敛界: 若 $M$ 归一化后 $\sigma(M)\subset[\ell,1]$, $d=2q+1$, 则

$$
\|\mathrm{polar}(M)-X_T\|_2\le|1-\ell^2|^{(q+1)^T}, \tag{9}
$$

$d=3$ 时二次收敛, $d=5$ 时三次收敛. 正文还写到, 即使真实的最小奇异值小于 $\ell$, 方法也严格快于 Newton–Schulz; 当 $\sigma_{\min}=\ell$ 时大约快一倍. 区间收缩到 1 附近后, 最优多项式会趋向 Padé 型的 Newton–Schulz 多项式, 渐近收敛阶也就接了回来. 论文公开的 $d=5$ 系数表最终一项是 $(1.875,-1.25,0.375)$, 正好是五次 Newton–Schulz 的 $(15/8,-10/8,3/8)$.

§4.1 的数值实验用一个奇异值在 $10^{-6}$ 到 1 之间按对数均匀分布的随机矩阵, 比较几种五次方法. 五次 Newton–Schulz 收敛, 但前 17 步几乎没有进展; Jordan 的方法 11 步就到约 0.3 的误差, 之后不再下降; You 的方法只定义了 6 步, 速度和 Jordan 的相近. Polar Express 取 $\ell=\sigma_{\min}$ 时每一步都优于其它方法, 11 步达到很好的精度, 到达任一误差水平所需步数约为 Newton–Schulz 的一半. 即使 $\ell$ 设错两个数量级, 它仍有竞争力, 只是要到第 13, 14 步才超过 Jordan 的方法. 在 GPT-2 第四个 Transformer 块的真实梯度矩阵上, 调好 $\ell$ 的 Polar Express 同样最好, 把 $\ell$ 设得小很多个数量级则会推迟收敛.

用论文公开的系数可以手算一个 $10^{-3}$ 的奇异值在前 6 步的变化. 三种方法都从 $x_0=10^{-3}$ 出发, Polar Express 用带 1.01 安全因子的前 6 个多项式 (见 4.4 节), 结果如下:

| 步数 | Polar Express | Jordan 固定五次式 | 五次 Newton–Schulz |
|---|---|---|---|
| 1 | 0.0082 | 0.0034 | 0.0019 |
| 2 | 0.0334 | 0.0119 | 0.0035 |
| 3 | 0.1303 | 0.0409 | 0.0066 |
| 4 | 0.4229 | 0.1404 | 0.0124 |
| 5 | 0.8462 | 0.4705 | 0.0232 |
| 6 | 0.9944 | 1.1702 | 0.0434 |

Polar Express 前 5 个多项式在 0 点的斜率依次约为 8.21, 4.07, 3.91, 3.29, 2.28, 乘起来约 976, 所以一个 $10^{-3}$ 的奇异值 5 步后长到 0.85, 第 6 步到 0.99. 这正是 $\ell=10^{-3}$ 的设计目标: 不小于 $10^{-3}$ 的奇异值在五六步内接近 1. Jordan 式第 6 步越过 1 到 1.17, 之后会在 1 附近来回摆动而不收敛, 对应误差停在 0.3 左右. Newton–Schulz 6 步只把它推到 0.04, 和 4.1 节按斜率 1.875 估的「约 11 步」一致.

### 4.4. 有限精度与工程实现

奇异值的上界取 $\|M\|_F$: 先把 $M$ 除以 $\|M\|_F$, 令 $u=1$. 这个上界在最坏情况下可能很松, 但论文 §3.3 指出神经网络稠密层的梯度矩阵有效秩低, 实际只差一个小常数. 下界很难高效求得, 只能猜; 好在猜错的代价不大, 方法对任何 $\ell\in(0,u]$ 都收敛, 差一个数量级只推迟几步. 论文在 bfloat16 下工作, 取 $\epsilon_{\mathrm{mach}}=2^{-8}\approx3.91\times10^{-3}$, 设 $\ell=10^{-3}$. 所有输入矩阵共用这组上下界, 多项式只需离线算一次.

低精度下有两个问题要处理 (§3.4, 附录 G). 第一, 舍入可能让某个奇异值略大于当前上界 $u_t$, 而最优多项式在区间外可能把 $u_t+\epsilon$ 映射到大于 $u_{t+1}+\epsilon$ 的位置, 多次迭代后这个奇异值会发散. 修法是把每个 $p_t(x)$ 换成 $p_t(x/1.01)$, 相当于把上界放宽 1%. 代价是奇异值收敛到 0.999998 而不是 1, 最终一步可以去掉这个因子. 第二, 最优多项式在区间上反复振荡, 靠近 $u_t$ 的奇异值可能被映射到 $\ell_{t+1}$ 附近, 比值 $p_t(\sigma_i)/\sigma_i$ 过小会损失精度, 极端情况下 $p_t(\sigma_i)<0$, 奇异向量变号, 收敛到错误矩阵的极分解. 修法沿用 Chen & Chow 的建议: $\ell_t<u_t/10$ 时按 $\ell_t=u_t/10$ 选多项式, 这样能保证 $p_t(x)/x\ge0.236$, 收敛只慢一点点. 第三处改动照搬原版 Muon 的实现, 归一化时除以 $\|M\|_F+10^{-2}$ 而不是 $\|M\|_F$.

Algorithm 1 因此分成离线和在线两段. 离线段用 float64 预计算所有多项式系数; 在线段在 bfloat16 下逐步套用. 五次多项式 $p_t=ax+bx^3+cx^5$ 按 Horner 规则计算: $Y=X^\top X$, $X\leftarrow X\big(aI+Y(bI+cY)\big)$. 附录 A 的代码在矩形矩阵上先转置成「宽」的形状再算 $XX^\top$, 以减少 FLOPs, 每步是 3 次矩阵乘法, 和 Newton–Schulz 五次式相同. 第一个多项式的系数是 $(8.287,-23.596,17.300)$, 这是区间最宽时为抬高小奇异值而选的形状; 往后系数逐步接近 $(1.875,-1.25,0.375)$. 论文对深度学习推荐 $d=5$, $T=5$ 或 6, $\ell_1=10^{-3}$, 对 $M/(\|M\|_F+10^{-2})$ 套用这组多项式. 该方法已被 NanoGPT speedrun 采用 (§1.3).

## 5. Polar Express 的实验与大模型里的使用

### 5.1. GPT-2 实验

§4.2 在 GPT-2-Small (124M, $n_{\text{embd}}=768$, 12 层, 12 头) 和 GPT-2-Large (774M, $n_{\text{embd}}=1280$, 36 层, 20 头) 上比较 Muon 内部用不同极分解方法的效果. 数据是 FineWeb 的 1B token, 训一个 epoch, batch size 32, 上下文 1024, 4 张 H100, bfloat16 混合精度, 学习率前 40% 步数保持常数, 之后线性衰减. 所有极分解方法都在 bfloat16 下跑 5 步. 参数分配照 nano-gpt: 至少二维的参数走 Muon, Embedding, 输出层 (unembedding) 和位置编码除外, 这些和 RMSNorm 参数一起交给 AdamW.

各自最佳学习率下的最终验证损失如下. GPT-2-Large 不加权重衰减时, muon-You 3.399, muon-Jordan 3.398, muon-PolarExp 3.340, 三者最佳学习率都是 0.02 (Figure 1). GPT-2-Small 不加权重衰减时, AdamW 4.197, muon-Jordan 3.639, muon-You 3.629, muon-PolarExp 3.588 (Figure 4). 加 0.1 的权重衰减, GPT-2-Large 上是 3.390, 3.401, 3.344 (依次为 You, Jordan, PolarExp; 附录 H.2 Figure 12). 把训练量加到 10B token (对 GPT-2-Large 大致符合 Chinchilla 比例), GPT-2-Large 加权重衰减后是 Jordan 2.921, You 2.919, PolarExp 2.913, 差距缩小但方向不变 (Figure 6). 三种方法每步都是一个五次多项式, 代价相同, 所以按步数的优势也就是按墙钟时间的优势. 这些数字来自 774M 以下的模型和至多 10B token, 论文没有在更大规模上做这组对照.

§4.3 的消融说明了 Muon 为什么只跑五六步. GPT-2-Small 上把 Polar Express 的步数从 2 改到 30, 并加一组用 `torch.linalg.svd` 精确计算极分解的对照: 只跑 2 或 3 步时最终验证损失比 5, 6 步差; 超过 6 步, 甚至用 SVD 精确计算, 都不再改善 (Figure 5). 步数对 Muon 的总运行时间影响很小, 因为时间主要花在前向和反向上; SVD 则让每个训练步的时间翻倍. 附录 H.1 进一步检验了小奇异值的作用: 把小于 $\gamma\sigma_{\max}$ 的奇异值映射到 1, 0 或 $-1$ 三种处理做对照, 结果是小于 $10^{-4}\sigma_{\max}$ 的奇异值怎么处理都不影响性能, 小于 $10^{-3}\sigma_{\max}$ 的影响很小, 甚至在底部子空间反向更新也几乎不变差 (Figure 9). 五步 Polar Express 恰好把不小于 $10^{-3}$ 的奇异值推到接近 1, 把小于 $10^{-4}$ 的留在 0 附近. 另一组 CIFAR-10/100 上 ResNet-20/110 的图像分类实验里, 各种 Muon 变体表现相当, 甚至五次 Newton–Schulz 也一样好 (附录 H.3), 极分解方法的差别在这个设置里没有体现.

### 5.2. 大模型里的落地与边界

Step-3.5-Flash 在预训练中用 Polar Express 替换了 Newton–Schulz, 固定 $T=6$ 步; 报告写到, 早期实验里换用收敛更快的正交化近似, 带来温和而一致的 loss 下降 (Step-3.5-Flash §4.1.1). 训练中偶尔出现尖锐, 不可恢复的 loss spike, 即使用了论文推荐的安全缩放也会出现; spike 不确定, 从邻近的 checkpoint 重跑常常可以避开, 指向数值问题. 模拟显示, bfloat16 下的 Polar Express 在某些更新统计下, 会因累加误差产生极端的中间值. 他们只把 Polar Express 迭代的状态和中间量改成 float16, 其余训练保持混合精度, 之后 spike 不再出现. 报告没有给出改精度前后的 spike 次数, 也没有扫过别的 $T$. 1.01 安全因子和 $u_t/10$ 的缓冲处理的是论文分析过的两类舍入问题, Step 遇到的是更大规模下仍会出现的罕见数值事件.

极分解要看到完整的矩阵, 这一点在分布式训练里带来额外通信. ZeRO-1 把单个参数的梯度 reduce-scatter 到多个 DP rank 上, 和 Newton–Schulz 需要完整梯度冲突; Megatron-LM 的实现在 Muon 更新前用 FP32 all-reduce 拼回完整梯度, 通信量接近翻倍. Step-3.5-Flash 把整个参数分给单个 DP rank, 重排梯度缓冲区, 一次 reduce-scatter 就把完整梯度送到参数所有者; 由于向最大 rank 填充的开销随 DP 规模增长, 这个办法只用于专家参数, 端到端迭代时间相对朴素 all-reduce 约减少 5%, 额外显存不到 4GB. Kimi K3 的分布式优化器按 DP rank 均匀切分参数, 每个 rank 通过点对点通信只取回自己负责的参数分片再做正交化, 不必在每个 rank 上 all-gather 整个参数缓冲区 (K3 §5.2.2). 这些改动都是通信层面的, Polar Express 和 Newton–Schulz 在这里的要求一样. 本章 [6.1 训练基础设施](../../../6.1-训练基础设施/6.1-训练基础设施.md) 讨论了 Muon 与 ZeRO 的配合.

最终是适用范围. Polar Express 只让 $UV^\top$ 的近似在少步数下更准, 它不约束注意力 logit; 换上 Polar Express 之后 logit 爆炸仍要靠 QK-Clip, QK 归一化或别的权重约束处理. 反过来, QK-Clip 不影响 Muon 给出的方向, 它和用哪种多项式算极分解无关. 一维参数没有矩阵结构, Embedding 和输出层在 Moonlight, K2, DeepSeek-V4 和 Polar Express 的实验里都交给 AdamW; DeepSeek-V4 交给 AdamW 的还有 mHC 的静态偏置和门控系数与全部 RMSNorm 权重 (§2.4). Muon 和 AdamW 本身的对照, 以及 AdamW 超参在大模型报告里的取值, 见 [6.5.1](../../6.5.1-优化器综述-从SGD到AdamW/6.5.1-优化器综述-从SGD到AdamW.md).

**参考文献**

1. Amsel, N., Persson, D., Musco, C., & Gower, R. M. (2025). *The Polar Express: Optimal Matrix Sign Methods and Their Application to the Muon Algorithm*. https://arxiv.org/abs/2505.16932
2. Kimi Team (2025). *Kimi K2: Open Agentic Intelligence*. https://arxiv.org/abs/2507.20534
3. Liu, J., Su, J., Yao, X., et al. (2025). *Muon is Scalable for LLM Training*. https://arxiv.org/abs/2502.16982
4. Kimi Team (2026). *Kimi K3: Open Frontier Intelligence*. https://arxiv.org/abs/2607.24653
5. StepFun (2026). *Step 3.5 Flash* 技术报告. https://arxiv.org/abs/2602.10604
6. DeepSeek-AI (2026). *DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence*. https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
7. Jordan, K., Jin, Y., Boza, V., You, J., Cesista, F., Newhouse, L., & Bernstein, J. (2024). *Muon: An optimizer for hidden layers in neural networks*. https://kellerjordan.github.io/posts/muon/
8. Nakatsukasa, Y., & Freund, R. W. (2016). *Computing Fundamental Matrix Decompositions Accurately via the Matrix Sign Function in Two Iterations: The Power of Zolotarev's Functions*. SIAM Review, 58(3). https://doi.org/10.1137/140990334
