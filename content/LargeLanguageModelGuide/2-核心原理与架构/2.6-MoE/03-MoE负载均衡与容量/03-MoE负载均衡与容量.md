---
title: "03 · MoE 负载均衡与容量: 辅助损失, z-loss, token drop 与 dropless"
published: true
tags: ["MoE", "负载均衡", "容量因子", "router z-loss", "MegaBlocks"]
excerpt: "Token-Choice 路由不约束每个专家收到多少 token. 容量因子与溢出, Switch 辅助损失, ST-MoE 的 router z-loss, 路由器精度与初始化, 从 token drop 到 MegaBlocks dropless, 再到只改排序的偏置均衡."
---
# 03 MoE 负载均衡与容量: 辅助损失, z-loss, token drop 与 dropless

## 1. 负载偏斜与容量

### 1.1 问题: 负载偏斜与专家坍塌

Token-Choice 路由让每个 token 自己挑 Top-$k$ 个专家 (路由公式见 [02](../02-MoE路由与Top-K可导性/02-MoE路由与Top-K可导性.md)), 每个专家收到多少 token 由路由结果决定. 一个例子: 16 个 token, 8 个专家, Top-1. token 1, 2 分别选专家 1, 2, token 3–12 都选专家 3, token 13–16 依次选专家 4–7, 专家 8 没有 token. 均匀情况下每个专家收到 $16/8=2$ 个 token, 专家 3 收到 10 个, 占 62.5%, 均匀比例是 12.5%.

单个 batch 的偏斜只影响这一步的速度. 问题在于偏斜会自我强化: 专家 3 收到的 token 多, 得到的梯度多, 它对这类输入的输出变好, 路由器又更倾向选它; 专家 8 没有 token, FFN 参数没有梯度, 路由器也很难通过主损失学到选它的好处 (离散选择项的梯度在常规训练中为 0, 见 [02](../02-MoE路由与Top-K可导性/02-MoE路由与Top-K可导性.md) 第 2.5 节). 长期下去, 少数专家处理大部分 token, 其余专家几乎不被使用, 这就是专家坍塌.

处理负载有两类手段. 一类是硬约束: 给每个专家固定容量, 超出就丢弃或改派 (第 1.2, 1.3 节与第 4.1 节). 另一类是软约束: 在训练目标里加惩罚偏斜的损失 (第 2 节), 或在排序分数上加偏置 (第 4.2 节). 两类通常同时使用.

### 1.2 容量与容量因子

固定形状的实现需要预先确定每个专家缓冲区的大小. 设本层一个 batch 有 $T$ 个 token, $N$ 个专家, 每个 token 最多派给 $k$ 个专家, 每个专家的槽数为

$$
C=\left\lceil\frac{T\cdot k}{N}\cdot\gamma\right\rceil \tag{1}
$$

$\gamma$ 是容量因子 (Switch 记作 CF). $\gamma=1$ 对应均匀分流的预算, 向上取整可能多出少量槽位. 路由不均时, 热门专家先满, 超出容量的 (token, 专家) 派遣被跳过. $\gamma>1$ 给负载波动留余量, 空槽用 padding 填满, 增加计算和通信. Switch 取 $k=1$.

GShard 在此基础上做了两点细化 (论文第 2.2 节). 第一是本地分组派遣: 把 batch 内 $T$ 个 token 均分成 $G$ 组, 每组 $S=T/G$ 个 token, 各组独立并行处理, 每组获得每个专家的一份容量 $2T/(G\cdot N)$ (GShard 为 top-2). 每组都不超过这份容量, 整体容量约束也就满足. 第二是溢出判定: GShard 为每个专家维护计数 $c_e$, 一个 token 的两个候选专家都已满, 才算溢出 token.

总槽数够并不等于不丢. $\gamma=1$ 时 $NC\ge Tk$, 总槽数足以容纳全部派遣, 但只要某个专家的选择数超过 $C$, 超出部分就被丢弃, 同时其他专家的槽空着. 记专家 $i$ 收到的选择数为 $n_i$, $\sum_i n_i=Tk$, 丢弃率与 padding 率分别为

$$
r_{\mathrm{drop}}=\frac{1}{Tk}\sum_{i=1}^{N}\max(0,\,n_i-C),\qquad
r_{\mathrm{pad}}=\frac{1}{NC}\sum_{i=1}^{N}\max(0,\,C-n_i) \tag{2}
$$

两者都只取决于 $n_i$ 相对 $C$ 的分布. 用第 1.1 节的例子: $T=16$, $N=8$, $k=1$, $\gamma=1$ 时 $C=2$, $n=(1,1,10,1,1,1,1,0)$. 专家 3 接收 2 个, 丢 8 个, $r_{\mathrm{drop}}=8/16=50\%$; 专家 1, 2, 4–7 各空 1 个槽, 专家 8 空 2 个槽, $r_{\mathrm{pad}}=8/16=50\%$. 把 $\gamma$ 提到 1.25, $C=\lceil2.5\rceil=3$, 专家 3 丢 7 个, $r_{\mathrm{drop}}\approx44\%$, 同时 padding 槽数从 8 增加到 15. 在这种偏斜下, 加大容量因子主要增加的是空槽, 丢弃率下降很慢. 偏斜要靠第 2 节与第 4.2 节的均衡手段降下来, 容量因子只负责吸收均衡之后剩余的波动.

Expert-Choice 的容量是另一个量. Zhou et al. 把每个专家取的 token 数写成 $k=n\cdot c/e$, $c$ 是每 token 平均使用的专家数, 每个专家恰好收 $k$ 个 token, 不会溢出, 也不需要辅助损失. $c$ 与 $\gamma$ 不能互相替换: 前者是平均专家数, 后者是均匀预算之上的缓冲倍数.

### 1.3 溢出 token 的去向

下面限定为 Top-1, 无共享专家, 溢出时跳过专家分支的实现. 若所选专家已满, 该 token 在本 MoE 子层的专家输出为 0, 残差保留原输入:

$$
h_t=u_t+m_t\,g_t\,E_{i_t}(u_t),\qquad m_t\in\{0,1\} \tag{3}
$$

$u_t$ 是子层输入, $i_t$ 是所选专家, $g_t$ 是门控, $m_t$ 表示该派遣是否被接收. 例如 $u_t=(1,2)$, $E_{i_t}(u_t)=(0.5,-0.25)$, $g_t=0.8$: 接收时 $h_t=(1.4,1.8)$, 被丢弃时 $h_t=(1,2)$. 被丢弃的 token 没有从序列中删除, 它继续进入下一层, 只是本层专家没有处理它. Top-$k$ 时还要看其他分支是否被接收, 有共享专家时共享分支始终执行.

同一个 token 是否被接收取决于同 batch 的其他 token 和派遣顺序. 按位置顺序占槽时, 序列靠后的 token 更容易被丢; V-MoE 的 Batch Prioritized Routing 改成按路由分数的优先级占槽 (见 [02](../02-MoE路由与Top-K可导性/02-MoE路由与Top-K可导性.md) 第 3.3 节). 这种依赖使模型输出与 batch 组成有关, 推理阶段尤其要留意.

Switch Table 1 把 $\gamma$ 当作速度与质量的取舍. 设定是 128 个专家, 隔层 MoE, 32 核 TPUv3, 100k step, 指标是负对数困惑度, 越大越好 ($-1.534$ 优于 $-1.731$):

| 模型 | $\gamma$ | 100k step 负对数困惑度 | 达到 $-1.50$ 的小时数 | examples/s |
|------|---------|------------------------|----------------------|------------|
| T5-Base | — | $-1.731$ | 未达到 | 1600 |
| MoE-Base (top-2) | 2.0 | $-1.547$ | 68.7 | 840 |
| MoE-Base (top-2) | 1.25 | $-1.559$ | 80.7 | 790 |
| MoE-Base (top-2) | 1.0 | $-1.572$ | 80.1 | 860 |
| Switch-Base | 2.0 | $-1.554$ | 72.8 | 860 |
| Switch-Base | 1.25 | $-1.553$ | 65.0 | 910 |
| Switch-Base | 1.0 | $-1.561$ | 62.8 | 1000 |
| Switch-Base+ | 1.0 | $-1.534$ | 67.6 | 780 |

Switch-Base 在 $\gamma=1.0$ 与 1.25 时质量与 $\gamma=2.0$ 相差很小, 达到目标质量的时间更短, 吞吐更高. Switch-Base+ 把模型加宽到与 MoE-Base (top-2) 速度相当, 质量最好. 论文还报告, 辅助损失系数足够时丢弃率通常低于 1%, 且没有观察到与专家数的依赖.

另外两种处理溢出的办法. GShard 的随机派遣: 第二专家的门控 $g_2$ 很小时, 它对输出贡献不大, 于是按与 $g_2$ 成比例的概率决定是否派给第二专家, 节省容量. Switch 试过 No-Token-Left-Behind: 溢出 token 改派给分数第二高的专家, 还溢出就继续往下改派, 可以迭代到几乎不丢. 实验没有带来质量收益, 论文的推测是网络学会 token 与专家的对应关系以后, 把 token 送到第二选择的专家反而改变了这一关联, 质量可能下降.

---

## 2. 辅助负载损失

### 2.1 Switch 的点积形式

对一个 batch 中参与统计的 $T$ 个 token, 令 $p_i(x)$ 为容量截断前对全部专家计算的路由 Softmax 概率. Top-1 选择频率与平均概率分别为

$$
f_i=\frac{1}{T}\sum_{x\in\mathcal{B}}\mathbb{1}\bigl\{\arg\max p(x)=i\bigr\},\qquad
P_i=\frac{1}{T}\sum_{x\in\mathcal{B}} p_i(x) \tag{4}
$$

$\sum_i f_i=\sum_i P_i=1$. $f_i$ 统计的是选择结果, 不能用容量截断后的存活数替代. $P_i$ 用完整的概率 $p$, 与乘到专家输出上的门控区分开. 负载损失定义为

$$
L_{\mathrm{balance}}=N\sum_{i=1}^{N} f_i P_i \tag{5}
$$

$$
L_{\mathrm{total}}=L_{\mathrm{main}}+\alpha L_{\mathrm{balance}} \tag{6}
$$

$f_i=P_i=1/N$ 时 $L_{\mathrm{balance}}=1$. Switch 取 $\alpha=10^{-2}$, 论文在 $10^{-1}$ 到 $10^{-5}$ 之间扫过, 这个量级能较快拉平负载, 又不压过交叉熵. $L_{\mathrm{balance}}$ 只加在训练损失上, 推理不计算.

$f_i$ 里的指示函数不可导, 梯度只经过 $P_i$. 把 $f$ 当作常量, 对第 $t$ 个 token 的路由 logit $\ell_{t,j}$ 有

$$
\frac{\partial L_{\mathrm{balance}}}{\partial\ell_{t,j}}
=\frac{N}{T}\,p_{t,j}\Bigl(f_j-\sum_i f_i p_{t,i}\Bigr) \tag{7}
$$

括号内是专家 $j$ 的选择频率减去该 token 概率加权的平均频率. $f_j$ 高于平均的专家, 其 logit 收到正梯度, 梯度下降后概率降低; $f_j$ 低于平均的专家概率升高. 损失调节的是路由器给热门专家的概率, 选中集合仍按 Top-K 离散变化.

数值检查: 四个 token 的路由概率依次为 $(0.6,0.3,0.1)$, $(0.5,0.4,0.1)$, $(0.2,0.3,0.5)$, $(0.4,0.35,0.25)$. Top-1 选择为 $(1,1,3,1)$, $f=(0.75,0,0.25)$, $P=(0.425,0.3375,0.2375)$, 按式 (5) $L_{\mathrm{balance}}=3\times(0.75\times0.425+0.25\times0.2375)=1.134375$. 乘 $\alpha=0.01$ 后贡献 0.01134375, 可以用来检查实现是否重复乘了 $N$ 或 $\alpha$.

### 2.2 为什么用点积

式 (5) 的最小值并不出现在均匀分布上. 固定 $f$ 时, $\sum_i f_iP_i$ 在单纯形上关于 $P$ 是线性的, 最小值在 $f_i$ 最小的那个顶点: 把全部概率放到最冷的专家上. 所以它不是一个以均匀为极小点的目标函数, 它提供的是梯度方向: 式 (7) 把概率从 $f_j$ 高于平均的专家移向低于平均的专家.

均匀成为稳定点, 依靠的是 $f$ 与 $P$ 的耦合. 路由器概率变化后, 下一步的选择频率也跟着变化; 两者大致一致 ($P\approx f$) 时, 损失近似为 $N\sum_i f_i^2$. 由 Cauchy–Schwarz 不等式

$$
N\sum_{i=1}^{N} f_i^2\;\ge\;\Bigl(\sum_{i=1}^{N} f_i\Bigr)^2=1 \tag{8}
$$

等号当且仅当 $f_i=1/N$. 因此在 $P$ 跟随 $f$ 的动态下, 损失的下界 1 只在均匀时达到. 这也说明了系数不宜过大: 主损失的梯度要求概率集中到合适的专家上, 负载损失的梯度要求概率分散, $\alpha$ 过大时后者压过前者, 路由器的选择就接近与输入无关的均匀分配.

统计范围也影响损失的效果. 式 (4) 的 $f_i$ 与 $P_i$ 在哪些 token 上求平均, 决定了约束的粒度: 在单条序列上统计, 要求每条序列内部均衡; 在 micro-batch 上统计, 允许序列之间互补; 在整个 global batch 上统计, 约束最松, 但需要跨数据并行 rank 汇总计数. 实现中常见的做法是在每个 rank 的 micro-batch 上计算, 这时 rank 数与 micro-batch 大小会改变损失的实际含义. 比较不同实现的系数时, 除了 $N$ 的尺度, 还要对齐统计范围. 第 4.3 节给出统计范围影响模型质量的对照.

### 2.3 GShard 的分组形式与 DeepSeek 的尺度

GShard 在每个分组内计算 $\ell_{\mathrm{aux}}=\frac{1}{E}\sum_{e=1}^{E}\frac{c_e}{S}\,m_e$, $c_e/S$ 是组内派往专家 $e$ 的比例, $m_e$ 是组内专家 $e$ 的平均门控, 总损失为 $\mathcal{L}=\ell_{\mathrm{nll}}+k\cdot\ell_{\mathrm{aux}}$ ($k$ 是系数). 论文说明原本想最小化 $(c_e/S)^2$ 的均方, 但 $c_e$ 来自 top-2 计数不可导, 于是用可导的 $m_e$ 替代其中一个因子.

DeepSeek 的写法把 $f_i$ 乘了 $N/K$, 均匀时各分量为 1, 对应的损失前不再乘 $N$. 两种尺度数值上相差常数倍, 比较不同论文的系数时要先统一. DeepSeek V2 还把专家聚合到设备层面计算设备级与通信级损失, 各版本的系数见 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) 第 3.1 节.

---

## 3. 路由器的数值稳定

### 3.1 Router z-loss

路由器 Softmax 里的指数对舍入误差敏感. ST-MoE (Zoph et al., 2022) 提出 router z-loss, 约束路由 logits 的 log-partition. 令 $\ell_{t,i}$ 为第 $t$ 个 token 对专家 $i$ 的原始 logit:

$$
L_z=\frac{1}{T}\sum_{t=1}^{T}\Bigl(\log\sum_{i=1}^{N}e^{\ell_{t,i}}\Bigr)^2 \tag{9}
$$

$$
L_{\mathrm{total}}=L_{\mathrm{main}}+\alpha L_{\mathrm{balance}}+c_z L_z \tag{10}
$$

ST-MoE 取 $c_z=0.001$. 记 $\log Z_t=\operatorname{LogSumExp}(\ell_t)$, 梯度为

$$
\frac{\partial L_z}{\partial\ell_{t,i}}=\frac{2}{T}\log Z_t\;p_{t,i} \tag{11}
$$

z-loss 观察的是 log-partition, 而 Softmax 概率对所有 logits 加同一常数不变. 取 $p=(0.5,0.3,0.2)$, $\ell=\log p$:

| logits | Softmax 概率 | LogSumExp | 单 token z-loss |
| --- | --- | --- | --- |
| $\log p$ | $p$ | 0 | 0 |
| $\log p+2\mathbf{1}$ | $p$ | 2 | 4 |
| $\log p-2\mathbf{1}$ | $p$ | $-2$ | 4 |

三行的路由概率完全相同, z-loss 不同, 所以只看路由概率无法判断 z-loss 的大小. 它也不同于逐 logit 的 L2: $(0,-100,-100)$ 的 LogSumExp 接近 0, z-loss 也接近 0, 尽管有分量绝对值很大. 实现时 z-loss 要读原始 logits; 若误接到 `log_softmax` 的输出, 其 LogSumExp 精确等于 0, 正则失效.

z-loss 针对 log-partition 的原因与低精度有关. bfloat16 有 8 位指数和 7 位显式尾数, 相对舍入误差约为 $2^{-8}$ 量级, 且与数值大小成正比. logits 绝对值越大, $e^{\ell}$ 与求和的绝对误差越大, Softmax 结果越容易因舍入改变排序, 进而改变 Top-K 的选中集合. 式 (11) 的梯度与 $\log Z_t$ 成正比: log-partition 偏离 0 越远, 把 logits 整体拉回的力越大; $\log Z_t=0$ 时梯度为 0. 它不改变各专家之间的相对分数, 对路由决策的直接影响小, 主要作用是把 logits 保持在数值误差较小的范围内.

ST-MoE Table 4 比较了三种稳定化方法 (每种 3–6 次运行): 基线 4/6 次稳定, 质量 $-1.755\pm0.02$; 把 Adafactor 的 update clipping 收紧到 0.1, 3/3 稳定, 但质量降到 $-4.206\pm0.17$; 加 z-loss, 3/3 稳定, 质量 $-1.741\pm0.02$. 收紧 update clipping 作用在优化器更新上, z-loss 作用在训练目标上, 两者的效果需要分别解释.

z-loss 之前, ST-MoE 还测了另外两类稳定手段, 基线相同 (4/6 稳定, $-1.755\pm0.02$), 结果都是稳定性换质量. 一类是去掉乘法交互 (Table 2): 把 GEGLU 换成 FLOPs 与参数相同的 Dense-ReLU-Dense, 3/3 稳定, 质量 $-1.849\pm0.02$; 去掉 RMSNorm 的可学习缩放参数 $g$, 3/3 稳定, 质量 $-2.020\pm0.06$. 论文指出这些缩放参数对质量的贡献远高于同等数量的 FFN 参数. 另一类是注入噪声 (Table 3): Switch 的 input jitter 把路由器输入乘以 $[1-10^{-2},1+10^{-2}]$ 上的均匀随机数, 3/3 稳定, 质量 $-1.777\pm0.03$; 全模型 dropout 0.1, 3/3 稳定, 质量 $-1.822\pm0.11$. input jitter 在 XL 规模上降低质量, ST-MoE 的模型中去掉了它. 对照这些数字, z-loss 是 Table 2–4 中唯一既 3/3 稳定又不降质量的方法. ST-MoE 最终配方是 top-2, 训练容量因子 1.25, 269B 参数.

### 3.2 路由器的精度与初始化

Switch Table 2 比较了路由器的数值精度:

| 配置 | 负对数困惑度 | examples/s |
|------|--------------|------------|
| 全 float32 | $-1.718$ | 1160 |
| 全 bfloat16 | $-3.780$ (发散) | 1390 |
| 选择性精度 (路由器局部 float32) | $-1.716$ | 1390 |

选择性精度只把路由器内部的计算 (logits, Softmax) 转成 float32, 派遣与合并的张量仍是 bfloat16, 通信量不变. 结果质量与全 float32 相当, 速度与全 bfloat16 相同. $-3.780$ 是发散后的质量. ST-MoE 指出, 到他们最大的规模, 选择性精度单独使用仍不够, 需要配合 z-loss. 选择性精度只影响路由器内部算术的精度, 输入在转成 bfloat16 之前已经丢失的信息无法恢复.

初始化方面, Switch 把截断正态初始化的缩放系数缩小到原来的 1/10. Table 3 中, 缩小后质量为 $-2.72\pm0.01$, 默认缩放为 $-3.60\pm0.68$, 方差也大得多. 小初始化与 z-loss 的作用方向一致. 路由矩阵的初值越小, 初始 logits 越接近 0, Softmax 越接近均匀, $\log Z_t$ 接近 $\log N$, 各专家在训练初期都有机会被选中; 同时 logits 的绝对值小, 低精度舍入误差也小. 初值大时, 少数专家在训练开始就获得明显更高的分数, 先得到梯度, 后续更难纠正.

微调阶段, Switch 对专家层使用更高的 dropout (0.4), 非专家层保持较低的 dropout, 以减轻专家参数多, 微调数据少带来的过拟合. ST-MoE 在 C4 上预训练 500B token 的 Dense-L 与 ST-MoE-L 上扫了微调的 batch 大小与学习率, 稀疏模型在所有设置下都优于稠密模型, 但更适合较小的 batch 和较大的学习率; 直接沿用稠密模型的微调超参数, 可能掩盖稀疏模型在预训练中取得的优势.

---

## 4. 不丢 token 与不用辅助损失

### 4.1 token drop 与 dropless

token drop 是 GShard 与 Switch 的默认做法: 形状固定, 溢出走残差. 丢多少会影响质量, 但影响程度与训练阶段有关. ST-MoE Table 5 在 SuperGLUE 微调上比较了丢弃率:

| 训练 $\gamma$ | 评估 $\gamma$ | 辅助损失 | 峰值丢弃率 | SuperGLUE |
|------|------|------|------|------|
| 0.75 | 2.0 | 开 | 10.6% | $86.5\pm0.21$ |
| 1.25 | 2.0 | 开 | 0.3% | 86.7 |
| 0.75 | 2.0 | 关 | 15.6% | 85.7 |

微调时丢 10% 左右的 token, 分数与几乎不丢相差 0.2; 关掉辅助损失, 丢弃率升到 15.6%, 分数降到 85.7. 结论是微调对丢弃不敏感, 辅助损失在微调中仍有用. 评估时容量因子可以与训练时不同, 论文的评估用 $\gamma=2.0$, 训练与评估的容量配置要分别报告.

预训练阶段丢弃的代价更明显. MegaBlocks (Gale et al., [arXiv:2211.15841](https://arxiv.org/abs/2211.15841)) 在 The Pile 上用 64 个专家, top-1, 与 Transformer-Small 对照: $\gamma=1$ 的丢弃模型验证损失下降 0.15, 不丢弃的配置下降 0.26, 约为前者的 1.73 倍. 论文同时引用 Tutel 的观察: 为了不丢 token 而动态调高容量因子时, 有的 MoE 需要容量因子高达 11, MoE 层的计算量增加 2 倍以上.

MegaBlocks 的做法是把 MoE 层写成 block-sparse 矩阵乘, 专家 batch 的长度跟实际派遣数走, 只补齐到块大小 (128×128), 不再按全局 $C$ 填空槽. 相对 Tutel 的 padding 式 dropless MoE, 端到端训练加速 1.38 倍 (XS), 2.0 倍 (Small), 4.35 倍 (Medium); 相对容量因子调到最佳的 Tutel token-dropping MoE, 加速 1.38 倍, 1.37 倍, 1.18 倍; 相对 Megatron-LM 稠密 Transformer, 达到相同验证损失的训练加速 1.8–2.4 倍.

两种实现的浪费可以直接比较. 固定容量实现的浪费是式 (2) 的 padding 槽, 共 $\sum_i\max(0,C-n_i)$ 行, 加上被丢弃的 $\sum_i\max(0,n_i-C)$ 条派遣 (它们没有被计算, 但损失了质量). block-sparse 实现把专家 $i$ 的 $n_i$ 行补齐到块大小 $b$ 的整数倍, 每个专家最多浪费 $b-1$ 行, 总浪费不超过 $N(b-1)$, 与偏斜程度无关, 也没有丢弃. $b=128$, $N=64$ 时上限是 8128 行; 同一层若 $T=16384$, $k=1$, $\gamma=1.25$, 容量实现的槽数为 $64\times320=20480$, 至少 4096 行是 padding. dropless 消除了丢弃, 不消除负载不均: 最长的专家段仍决定这一层的完成时间, 辅助损失或偏置在 dropless 实现中仍然需要.

### 4.2 偏置替代辅助损失

辅助损失的系数需要折中: 太小拉不平负载, 太大损害主任务. Wang et al. (DeepSeek-AI, [arXiv:2408.15664](https://arxiv.org/abs/2408.15664)) 的 Loss-Free Balancing 给每个路由专家一个偏置 $b_i$, 只加在 Top-K 的排序分数上, 门控数值仍用不含偏置的分数. 每步结束时按上一个 batch 的负载更新:

$$
b_i\leftarrow b_i+u\operatorname{sign}(e_i),\qquad e_i=\overline{\mathrm{Load}}-\mathrm{Load}_i \tag{12}
$$

过载专家 $e_i<0$, 偏置减小; 欠载专家偏置增大. 本 batch 的路由使用历史统计, 一个 token 的选择不依赖同 batch 中其他 token 的路由结果, 不违反语言模型的因果约束. 偏置不在损失里, 不产生梯度, 论文称之为没有干扰梯度. DeepSeek-V3 采用了这一方案, 版本取值见 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) 第 3.3 节. 负载用 MaxVio 度量:

$$
\mathrm{MaxVio}=\frac{\max_i \mathrm{Load}_i-\overline{\mathrm{Load}}}{\overline{\mathrm{Load}}} \tag{13}
$$

$\mathrm{Load}_i$ 是专家 $i$ 收到的 token 数, $\overline{\mathrm{Load}}$ 是完全均衡时的期望负载. MaxVio 只看最忙的专家, 与专家并行中最慢的设备决定完成时间这一点对应. 第 1.1 节的例子中最忙专家收到 10 个, 期望 2 个, MaxVio 为 4. 论文区分两种统计: $\mathrm{MaxVio}_{\mathrm{global}}$ 在整个验证集上计数, 反映 batch 很大时的均衡上限; $\mathrm{MaxVio}_{\mathrm{batch}}$ 在每个训练 batch 上计数, 与训练效率更相关.

实验用 DeepSeekMoE 结构, 1B 模型训练 100B token, 3B 模型训练 200B token, 门控用 Sigmoid (论文报告 Sigmoid 基线优于 Softmax 基线). 基线的辅助损失系数取 0.001. 论文 Table 2 的结果:

| 规模 | 均衡方式 | 验证困惑度 | $\mathrm{MaxVio}_{\mathrm{global}}$ |
|------|----------|-----------|-----------|
| 1B | 辅助损失 | 9.56 | 0.72 |
| 1B | 偏置 | 9.50 | 0.04 |
| 3B | 辅助损失 | 7.97 | 0.52 |
| 3B | 偏置 | 7.92 | 0.04 |

偏置方法在两种规模上困惑度都更低, 全局负载的最大偏离从 0.5 到 0.7 降到 0.04. 更新速度 $u=0.0001$ 时训练前期收敛慢, $u=0.01$ 时训练后期偏置波动, 负载变差, $u=0.001$ 两者兼顾, 这也是 V3 的取值. 更新规则也做过对照: 按符号更新 ($u=0.001$) 困惑度 9.50, MaxVio 0.044; 按误差比例更新 $b_i\leftarrow b_i+ue_i$ ($u=0.01$) 负载更均衡 (MaxVio 0.028), 困惑度略差 (9.53); 乘性偏置 (初值为 1) 的困惑度在 9.52 到 9.54 之间, 均衡没有明显改善. 门控换成 Softmax 时, 一个专家的分数差受其他专家分数影响, 符号更新难以调节, 论文改用比例更新, 困惑度 9.599 对辅助损失的 9.604, MaxVio 0.027 对 0.937.

### 4.3 统计范围与领域分工

均衡约束在多大范围上统计, 会影响模型质量. DeepSeek-V3 报告对照了三种做法: 在单条序列上统计的辅助损失, 在一个训练 batch 上统计的辅助损失, 以及偏置方法. 1B 模型的验证损失分别为 2.258, 2.253, 2.253; 3B 模型分别为 2.085, 2.080, 2.080. batch 级辅助损失与偏置方法达到相近的 batch 级均衡时, 质量也相近. 报告的解释是序列级约束要求每条序列内部均衡, batch 级约束允许不同序列互补, 专家可以按领域分工. 在 Pile 测试集的三个领域上统计 16B 模型的专家负载, 偏置方法的模型呈现更明显的领域特化.

batch 级均衡也有代价. 单条序列和小 batch 内的负载仍可能偏斜; 推理阶段的领域分布变化也会造成负载不均. V3 用大规模专家并行和数据并行保证每个 micro-batch 足够大来处理前者, 用冗余专家部署处理后者. Wang et al. 的观察与此一致: 偏置方法的计算 batch 越大, 计算 batch 内的 MaxVio 越低, 辅助损失方法在 batch 很大时基本停在一个常数水平. 专家并行会成倍增加每个专家实际处理的计算 batch, 所以偏置方法在大规模训练里的均衡更好.

Expert-Choice 按构造均衡, 但它的选择依赖同组后续 token, 用于语言模型会泄露未来信息, Wang et al. 因此没有把它纳入对照, 泄露量的推导见 [02](../02-MoE路由与Top-K可导性/02-MoE路由与Top-K可导性.md) 第 1.3 节. Kimi K3 在 896 个路由专家的规模上把式 (12) 的定步长更新换成按分位数直接求解偏置 (Quantile Balancing), 见 [04](../04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md).

---

## 5. 参数量与失效模式

### 5.1 驻留参数与激活参数

稀疏激活按 token 和层计: 一个 token 在当前层调用 $k$ 个专家, 同一 batch 的不同 token 可以选不同专家, 合起来可能覆盖全部 $N$ 个. 全量驻留 GPU 的部署中, 未被当前 token 使用的权重仍占显存. 读 MoE 的配置因此要分开三个数: 总参数, 每 token 激活参数, 以及只算路由专家池的稀疏度 $N/k$.

设每个专家有 $P_E$ 个参数, 路由器有 $P_R$ 个参数, 一层的驻留参数为 $P_R+NP_E$, 每 token 激活参数为 $P_R+kP_E$. 无 bias 的 SwiGLU 专家有三块矩阵, $P_E=3dH$ ($H$ 是专家中间维), 路由矩阵 $N\times d$ 给出 $P_R=Nd$. Mixtral 8×7B 的[官方发布说明](https://mistral.ai/news/mixtral-of-experts/)给出约 46.7B 总参数, 每 token 约 12.9B 激活参数, 总参数不是 $8\times7$B, 因为注意力等非专家参数在各专家之间共享. 用 Mixtral 论文 Table 1 的结构参数可以核对: $d=4096$, $H=14336$, 32 层, $N=8$, $k=2$. 每个专家 $P_E=3\times4096\times14336\approx1.76\times10^8$, 一层 8 个专家约 1.41B, 32 层约 45.1B, 占总参数的 97% 左右; 每 token 每层激活 2 个专家, 32 层约 11.3B. 两者之差约 33.8B, 与 46.7B 和 12.9B 之差一致, 剩余约 1.6B 是注意力, embedding 与输出层等共享参数.

同样的算法用于 DeepSeek-V3 (671B 总参, 37B 激活). 61 层中前 3 层是稠密 FFN, 其余 58 层是 MoE, 每层 256 个路由专家, $d=7168$, $H=2048$. 每个路由专家 $3\times7168\times2048\approx4.40\times10^7$, 一层 256 个约 11.27B, 58 层约 653.9B, 占 671B 的 97.4%. 每 token 激活 8 个路由专家和 1 个共享专家, 58 层合计约 $58\times9\times4.40\times10^7\approx23.0$B, 剩下约 14B 来自 MLA, 前 3 层的稠密 FFN, embedding 与输出层. Kimi K3 是 2.78T 总参, 104.2B 激活, 每层 896 个路由专家选 16 个, 稀疏度 $896/16=56$, 整模型的激活比例却是 $104.2/2780\approx3.7\%$, 路由专家约占总参数的 98%, 逐项估算见 [04](../04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md) 第 1.3 节.

这份参数估算不含 KV cache, 激活, 工作区, 也不含训练时的梯度与优化器状态. 激活参数量也不能直接当作显存流量或端到端耗时. 权重放不下时, 专家并行把专家分到多卡, 系统实现见 [6.1.8 MoE 系统与并行](../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/6.1.8-MoE系统与并行.md); 路由专家占参数的绝大部分, 这也是 MoE 量化通常只压专家权重的原因, 见 [MoE 模型量化技术综述](../../../6-训练与推理优化/6.3-模型压缩/6.3.1-量化/05-MoE模型量化技术综述/05-MoE模型量化技术综述.md).

### 5.2 失效模式

下表只列正文之外的排查要点.

| 现象 | 原因 | 处理 |
|------|------|------|
| $\gamma=1$ 仍大量丢弃 | 局部溢出, 热门专家先满 | 先看 $f_i$ 的偏斜, 再考虑加大 $\gamma$ |
| 路由分布突然翻转, 损失尖峰 | logits 过大, 低精度 Softmax | 监控 $\log Z_t$ 的分布, 加 z-loss, 路由器用 float32 |
| z-loss 没有效果 | 接到了 `log_softmax` 的输出 | z-loss 读原始 logits |
| 只看平均负载判断均衡 | 平均值掩盖最忙专家 | 用式 (13) 的 MaxVio, 并分开 global 与 batch 两种统计 |
| 不同实现的辅助损失系数对不上 | $N$ 的尺度或统计范围不同 | 先统一 $f_i$ 的归一化和统计的 token 范围 |

$\log Z_t$ 与 MaxVio 都是可以直接记录的训练指标. $\log Z_t$ 的绝对值变大, 说明 logits 在整体变大, 低精度 Softmax 的舍入误差随之变大, 这正是 z-loss 约束的量. MaxVio 分 global 与 batch 记录, 能区分专家总体不均与单步不均, 两者对应的处理不同, 前者调均衡强度, 后者调统计范围或 batch 大小.

---

**参考文献**

1. Lepikhin, D., et al. (2020). [GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding](https://arxiv.org/abs/2006.16668). 第 2.2 节容量, 分组派遣, 辅助损失与随机派遣.
2. Fedus, W., Zoph, B., & Shazeer, N. (2021). [Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity](https://arxiv.org/abs/2101.03961). 第 2.2 节, Table 1–3, 附录 No-Token-Left-Behind.
3. Zoph, B., et al. (2022). [ST-MoE: Designing Stable and Transferable Sparse Expert Models](https://arxiv.org/abs/2202.08906). 第 3.3 节 z-loss, Table 2–5.
4. Zhou, Y., et al. (2022). [Mixture-of-Experts with Expert Choice Routing](https://arxiv.org/abs/2202.09368).
5. Gale, T., Narayanan, D., Young, C., & Zaharia, M. (2022). [MegaBlocks: Efficient Sparse Training with Mixture-of-Experts](https://arxiv.org/abs/2211.15841).
6. Hwang, C., et al. (2022). [Tutel: Adaptive Mixture-of-Experts at Scale](https://arxiv.org/abs/2206.03382).
7. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). 第 2.1.2 节, 第 4.2 节配置, 第 4.5.3 节 batch 级与序列级均衡, Fig. 9.
8. Wang, L., Gao, H., Zhao, C., Sun, X., & Dai, D. (2024). [Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts](https://arxiv.org/abs/2408.15664). Algorithm 1, 式 (4) MaxVio, Table 2–4, 附录 C.
9. Jiang, A. Q., et al. (2024). [Mixtral of Experts](https://arxiv.org/abs/2401.04088). Table 1 结构参数.
