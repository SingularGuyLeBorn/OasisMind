---
title: "04 · PPO: 近端策略优化"
published: true
tags: ["PPO", "RLHF", "GAE", "Actor-Critic", "InstructGPT"]
excerpt: "PPO 用裁剪后的重要性比率代替 TRPO 的 KL 约束, 只用一阶优化就能在同一批样本上多次更新; InstructGPT 把它接到语言模型上, 形成策略, 价值, 奖励, 参考四个模型的 RLHF 流程."
---
# 04 PPO: 近端策略优化

> 相关阅读: [03-TRPO](../03-TRPO/03-TRPO.md) · [01-GRPO](../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) · [04-GSPO](../../4.5-GRPO家族与RLVR/04-GSPO/04-GSPO.md) · [05-RLOO](../05-RLOO-留一法基线/05-RLOO-留一法基线.md) · [4.4.0 强化学习的数学原理](../01-强化学习的数学原理/01-强化学习的数学原理.md) · [4.4.2 DPO](../../4.6-偏好优化/4.6.1-离线偏好优化/01-DPO/01-DPO.md)

## 1. 问题: 策略梯度的方差和样本效率

### 1.1 策略梯度

语言模型生成可以写成序贯决策. 状态 $s_t$ 是 prompt 加上已生成的 token, 动作 $a_t$ 是下一个 token, 策略 $\pi_\theta(a_t\mid s_t)$ 是模型在当前前缀上的下一个 token 分布. 转移是确定的: 写下 $a_t$ 后, 新状态就是把它拼到前缀后面. 一条轨迹 $\tau=(s_0,a_0,s_1,a_1,\ldots)$ 就是一次完整生成. 目标是

$$
J(\theta)=\mathbb{E}_{\tau\sim\pi_\theta}\bigl[R(\tau)\bigr],\qquad R(\tau)=\sum_{t=0}^{T-1}r_t. \tag{1}
$$

轨迹概率 $P(\tau\mid\theta)=p(s_0)\prod_t\pi_\theta(a_t\mid s_t)P(s_{t+1}\mid s_t,a_t)$. 对 $\theta$ 求导时初始分布和转移概率都与 $\theta$ 无关, 由对数导数技巧得到

$$
\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim\pi_\theta}\Bigl[R(\tau)\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Bigr]. \tag{2}
$$

### 1.2 三个问题

1. **方差大.** 式 (2) 用整条轨迹的回报给每一步加权. 前面一个好动作, 后面一个失误, 共用同一个 $R(\tau)$. 信用分配粗, 梯度估计方差大.
2. **样本只能用一次.** 式 (2) 要求样本来自当前 $\pi_\theta$. 参数一更新, 之前采的轨迹就不再服从当前策略. PPO 论文指出, 直接在同一批数据上对 $L^{PG}=\hat{\mathbb{E}}_t[\log\pi_\theta(a_t\mid s_t)\hat{A}_t]$ 做多步优化缺乏理论依据, 实践中常导致破坏性的大步更新.
3. **约束求解贵.** TRPO 用 KL 约束限制每步更新, 但求解要共轭梯度和线搜索, 而且不兼容带噪声的结构 (如 dropout) 或策略与价值共享参数的网络. 见 [03-TRPO](../03-TRPO/03-TRPO.md).

PPO 依次处理这三点: 用价值网络和 GAE 降方差, 用重要性比率复用样本, 用裁剪代替 KL 约束.

## 2. 优势函数与 GAE

### 2.1 优势

状态价值 $V^\pi(s)=\mathbb{E}[G_t\mid s_t=s]$, 动作价值 $Q^\pi(s,a)=\mathbb{E}[G_t\mid s_t=s,a_t=a]$, 其中 $G_t$ 是从 $t$ 起的 (折扣) 回报. 优势是

$$
A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s). \tag{3}
$$

把式 (2) 里的 $R(\tau)$ 换成优势, 期望不变 (对同一状态, 减去只依赖状态的 $V$ 不改变期望), 方差通常下降:

$$
\nabla_\theta J(\theta)=\mathbb{E}\bigl[A(s_t,a_t)\,\nabla_\theta\log\pi_\theta(a_t\mid s_t)\bigr]. \tag{4}
$$

价值网络 $V_\phi$ 近似 $V^\pi$. 一步 TD 残差

$$
\delta_t=r_t+\gamma V_\phi(s_{t+1})-V_\phi(s_t) \tag{5}
$$

是优势的一个估计. 它只看一步, 方差小, 但 $V_\phi$ 不准时偏差大. 用完整回报 $G_t-V_\phi(s_t)$ 偏差小, 方差大.

### 2.2 GAE

GAE (Schulman et al., arXiv:1506.02438) 用 $\lambda\in[0,1]$ 对多步残差做指数加权:

$$
\hat{A}_t^{\mathrm{GAE}(\gamma,\lambda)}=\sum_{l=0}^{\infty}(\gamma\lambda)^l\delta_{t+l}. \tag{6}
$$

$\lambda=0$ 时退回 $\delta_t$; $\lambda=1$ 时等于 $G_t-V(s_t)$. PPO 论文用的是截断到长度 $T$ 的版本, $\lambda=1$ 时退化为 A2C 的 $T$ 步估计. 实现从末端往回递推, 令 $A_T=0$:

$$
A_t=\delta_t+\gamma\lambda A_{t+1}. \tag{7}
$$

### 2.3 手算

4 步轨迹, $\gamma=0.99$, $\lambda=0.95$. 奖励 $r_0=r_1=r_2=1$, $r_3=5$, 终止后 $V(s_4)=0$; 价值网络给出 $V(s_0)=1.5$, $V(s_1)=2.0$, $V(s_2)=2.5$, $V(s_3)=3.0$.

$$
\begin{aligned}
\delta_3&=5+0.99\times0-3.0=2.0,\\
\delta_2&=1+0.99\times3.0-2.5=1.47,\\
\delta_1&=1+0.99\times2.5-2.0=1.475,\\
\delta_0&=1+0.99\times2.0-1.5=1.48.
\end{aligned}
$$

$\gamma\lambda=0.9405$. 回推: $A_3=2.0$; $A_2=1.47+0.9405\times2.0=3.351$; $A_1=1.475+0.9405\times3.351=4.627$; $A_0=1.48+0.9405\times4.627=5.831$. 价值目标 $R_t=A_t+V(s_t)$ 分别是 $7.331,6.627,5.851,5.0$.

$\lambda=0$ 时四个优势就是四个 $\delta$, 最后一步的 $+5$ 传不到开头, $A_0=1.48$. $\lambda=0.95$ 时 $A_0=5.831$, 终点奖励按 $(\gamma\lambda)^l$ 衰减后传回前面. 这组数字是演示用的构造例子.

### 2.4 句末奖励下的 GAE

RLHF 里的奖励形态更特殊: 除最后一个 token 外, 即时奖励只有 KL 罚. 先忽略 KL, 设 $\gamma=1$, 一条 4 个 token 的回答得分 1, 价值网络给出 $V(s_0..s_3)=(0.5,0.6,0.4,0.8)$, 终止价值 0. 则 $\delta_0=0.6-0.5=0.1$, $\delta_1=0.4-0.6=-0.2$, $\delta_2=0.8-0.4=0.4$, $\delta_3=1-0.8=0.2$.

- $\lambda=1$: $A_t=\sum_{l\ge0}\delta_{t+l}$, 中间的 $V$ 全部抵消, $A_t=1-V(s_t)$, 即 $(0.5,0.4,0.6,0.2)$. 优势只依赖 $V(s_t)$ 本身, 价值网络只起基线作用, 不会把自身误差带进别的位置.
- $\lambda=0.95$: $A_3=0.2$, $A_2=0.4+0.95\times0.2=0.59$, $A_1=-0.2+0.95\times0.59=0.3605$, $A_0=0.1+0.95\times0.3605=0.4425$. 和 $\lambda=1$ 相比, $A_1$ 从 0.4 降到 0.36, $A_2$ 从 0.6 降到 0.59. 差异来自后续位置 $V$ 的取值: $V$ 准确时差异是降方差的收益, $V$ 有偏时差异就是偏差.

句末奖励, 确定转移, 长回答这三个条件叠在一起时, 价值网络很难对中间前缀给出准确估计, 低 $\lambda$ 带进来的主要是偏差. §6.1 中 $\lambda=1$ 表现最好的实验结果与此一致.

## 3. 重要性比率与裁剪

### 3.1 代理目标

用旧策略 $\pi_{\theta_{\mathrm{old}}}$ 的样本估计新策略的目标, 引入概率比

$$
r_t(\theta)=\frac{\pi_\theta(a_t\mid s_t)}{\pi_{\theta_{\mathrm{old}}}(a_t\mid s_t)},\qquad L^{\mathrm{CPI}}(\theta)=\hat{\mathbb{E}}_t\bigl[r_t(\theta)\hat{A}_t\bigr]. \tag{8}
$$

$L^{\mathrm{CPI}}$ 来自保守策略迭代 (Kakade & Langford, 2002), TRPO 在 KL 约束下最大化它. 没有约束时, 最大化式 (8) 会让策略一步走得过远. PPO 的主目标是 (论文式 (7))

$$
L^{\mathrm{CLIP}}(\theta)=\hat{\mathbb{E}}_t\Bigl[\min\bigl(r_t(\theta)\hat{A}_t,\;\mathrm{clip}(r_t(\theta),1-\varepsilon,1+\varepsilon)\hat{A}_t\bigr)\Bigr]. \tag{9}
$$

论文给的例子是 $\varepsilon=0.2$. 在 $\theta=\theta_{\mathrm{old}}$ 处 ($r=1$), $L^{\mathrm{CLIP}}$ 与 $L^{\mathrm{CPI}}$ 一阶相同; 离开后, $L^{\mathrm{CLIP}}$ 是 $L^{\mathrm{CPI}}$ 的下界.

### 3.2 两种符号, 逐项看

$\hat{A}_t>0$: 式 (9) 是 $\min(r\hat{A},\mathrm{clip}(r)\hat{A})$. $r\le1+\varepsilon$ 时取 $r\hat{A}$, 梯度正常; $r>1+\varepsilon$ 时取 $(1+\varepsilon)\hat{A}$, 对 $\theta$ 的梯度为 0. $r<1-\varepsilon$ 时, $r\hat{A}<(1-\varepsilon)\hat{A}$, $\min$ 取未裁剪项, 梯度仍在, 会把概率往回拉.

$\hat{A}_t<0$: $r\ge1-\varepsilon$ 时, 若 $r\le1+\varepsilon$ 两项相同; 若 $r>1+\varepsilon$, $r\hat{A}<(1+\varepsilon)\hat{A}$, 取未裁剪项, 梯度仍在. $r<1-\varepsilon$ 时, $(1-\varepsilon)\hat{A}<r\hat{A}$, 取裁剪项, 梯度为 0.

用 $\varepsilon=0.2$ 列一张表 (单项值, 梯度指对 $r$ 的导数):

| $\hat{A}$ | $r$ | $r\hat{A}$ | $\mathrm{clip}(r)\hat{A}$ | 取值 | 对 $r$ 的梯度 |
|-----------|-----|-----------|----------------------------|------|---------------|
| $+2$ | $0.7$ | $1.4$ | $1.6$ | $1.4$ | $2$ |
| $+2$ | $1.1$ | $2.2$ | $2.2$ | $2.2$ | $2$ |
| $+2$ | $1.3$ | $2.6$ | $2.4$ | $2.4$ | $0$ |
| $-2$ | $0.7$ | $-1.4$ | $-1.6$ | $-1.6$ | $0$ |
| $-2$ | $0.9$ | $-1.8$ | $-1.8$ | $-1.8$ | $-2$ |
| $-2$ | $1.3$ | $-2.6$ | $-2.4$ | $-2.6$ | $-2$ |

论文的说法是: 只在比率变化会让目标变好时忽略它, 在会让目标变差时保留它. 所以 clip 挡的是顺着优势方向的大步, 比率本身并不会被强制留在 $[1-\varepsilon,1+\varepsilon]$ 内. 实现时要先算两个乘过 $\hat{A}$ 的项再取 $\min$; 先把比率夹住再乘优势, 会在第 1 行和第 6 行丢掉本应存在的梯度.

![GAE 反向递推与 clip 比率门](./images/fig-ppo-gae-clip.png)

**图 1 解析**

- 上框标题「GAE $\lambda$」. 第一行四个蓝框是 $\delta_0$ 到 $\delta_3$, 最右写出 $\delta_3=r+\gamma V_4-V_3$. 每个 $\delta_t$ 向下进入对应的橙框 $A_t$.
- 橙框之间的虚线箭头从右指向左, 标 $\gamma\lambda$, 表示 $A_{t+1}$ 乘 $\gamma\lambda$ 后加进 $A_t$, 对应式 (7).
- 右侧两个绿框是两个端点: $\lambda=0$ 时 $A_t=\delta_t$ (TD); $\lambda=1$ 时为完整回报 (MC).
- 下框标题「clip $1\pm\varepsilon$」. 绿框是比率 $\eta=\pi_\theta/\pi_{\mathrm{old}}$, 即本文的 $r_t$; 黄框是 clip gate $[1-\varepsilon,1+\varepsilon]$, 注明 $\varepsilon=0.2\to[0.8,1.2]$. 黄框分两路: 粉框「$A>0$ lock at $1+\varepsilon$」, 紫框「$A<0$ lock at $1-\varepsilon$」, 两路汇入底部的 $L^{\mathrm{CLIP}}=E[\min(\eta A,\mathrm{clip}(\eta)A)]$.
- 底注: $\lambda$ 把 TD 残差向后混合; clip 是比率门, 图中没有画函数曲线.

下面的动画展示同一个裁剪带:

```viz
composition: PpoClip
title: PPO-Clip: 概率比与 [1−ε, 1+ε] 信任带
epsilon: 0.2
```

### 3.3 完整目标与算法

策略和价值共享参数时, 目标要合并价值损失, 再加熵奖励鼓励探索 (论文式 (9)):

$$
L^{\mathrm{CLIP+VF+S}}_t(\theta)=\hat{\mathbb{E}}_t\Bigl[L^{\mathrm{CLIP}}_t(\theta)-c_1\bigl(V_\theta(s_t)-V^{\mathrm{targ}}_t\bigr)^2+c_2S[\pi_\theta](../../4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/s_t)\Bigr]. \tag{10}
$$

论文 Algorithm 1: 每轮迭代, $N$ 个并行 actor 各用 $\pi_{\theta_{\mathrm{old}}}$ 跑 $T$ 步, 计算优势; 然后在这 $NT$ 个样本上用 mini-batch 大小 $M\le NT$ 优化 $K$ 个 epoch (通常用 Adam); 最后 $\theta_{\mathrm{old}}\leftarrow\theta$. 采样是 on-policy 的, 同一批上的多次更新带一点 off-policy, 由 clip 控制.

**为什么是下界.** TRPO 的理论 (见 [03-TRPO](../03-TRPO/03-TRPO.md)) 说明, 对所有状态取最大 KL 的罚项目标是策略真实性能的下界, 按罚项优化可以保证单调改进; 但单一的 $\beta$ 很难同时适用于不同问题和训练的不同阶段, 所以 TRPO 改用硬约束. PPO 论文还指出, 只用固定 $\beta$ 加 SGD 不足以复现 TRPO 的单调改进. 裁剪目标换了一种方式构造悲观估计: 它不显式计算 KL, 而是在比率偏离 1 并且对目标有利时截断收益. 论文 Figure 2 在 Hopper 上沿第一次 PPO 更新的方向插值, 更新后的策略与初始策略的 KL 约为 0.02, $L^{\mathrm{CLIP}}$ 恰好在这一点取最大, 而未裁剪的 $L^{\mathrm{CPI}}$ 仍在继续上升. 也就是说, 沿同一方向再走远, 未裁剪目标会继续鼓励, 裁剪目标则开始下降.

论文同时给出另一种做法, 自适应 KL 罚 (论文式 (8)): 目标为 $\hat{\mathbb{E}}_t[r_t\hat{A}_t-\beta\,\mathrm{KL}[\pi_{\theta_{\mathrm{old}}},\pi_\theta]]$, 每次更新后算平均 KL $d$, 若 $d<d_{\mathrm{targ}}/1.5$ 则 $\beta\leftarrow\beta/2$, 若 $d>1.5\,d_{\mathrm{targ}}$ 则 $\beta\leftarrow2\beta$. 论文说 1.5 和 2 是经验取值, 算法对它们不敏感.

### 3.4 论文的实验数字

**目标函数对比** (Table 1): 7 个 MuJoCo 任务, 各 1M 步, 每个设置 3 个种子, 共 21 次运行, 分数按「随机策略为 0, 最好结果为 1」归一化后平均. 网络是两层 64 单元的 MLP, 策略与价值不共享参数, 不用熵奖励.

| 设置 | 归一化平均分 |
|------|-------------|
| 不裁剪, 不加罚 | $-0.39$ |
| clip, $\varepsilon=0.1$ | $0.76$ |
| clip, $\varepsilon=0.2$ | $0.82$ |
| clip, $\varepsilon=0.3$ | $0.70$ |
| 自适应 KL, $d_{\mathrm{targ}}=0.003/0.01/0.03$ | $0.68/0.74/0.71$ |
| 固定 KL, $\beta=0.3/1/3/10$ | $0.62/0.71/0.72/0.69$ |

不裁剪时分数为负, 是因为 HalfCheetah 上得分比随机策略还低.

读这张表要注意三点. 第一, 每种方法都单独搜过超参, 表里比较的是各自较好的设置, clip 在 $0.1$ 到 $0.3$ 之间都不差于最好的 KL 罚变体. 第二, 自适应 KL 的三个目标值相差 10 倍, 分数只在 0.68 到 0.74 之间变化, 说明它对 $d_{\mathrm{targ}}$ 不敏感, 但上限低于 clip. 第三, 这些结论来自小型 MLP 和每任务 1M 步的连续控制, 搬到语言模型时, $\varepsilon$ 的最佳值和 clip 是否必要都要重新验证, §6.1 就是一个反例.

**超参数.** MuJoCo: $T=2048$, Adam 步长 $3\times10^{-4}$, 10 个 epoch, mini-batch 64, $\gamma=0.99$, $\lambda=0.95$. Atari: $T=128$, 3 个 epoch, 8 个 actor, $\varepsilon=0.1\times\alpha$, 其中 $\alpha$ 在训练中从 1 线性降到 0, $c_1=1$, $c_2=0.01$. 所以 $\varepsilon=0.2$ 是连续控制实验的取值, Atari 上用的是 0.1 并逐渐退火.

**Atari** (Table 2, 49 个游戏, 3 个种子平均): 按整个训练期间的平均回报, PPO 赢 30 个, ACER 18 个, A2C 1 个; 按最后 100 个 episode, ACER 28 个, PPO 19 个, A2C 1 个, 平局 1 个. PPO 学得快, 最终性能和 ACER 互有胜负.

## 4. InstructGPT 的 RLHF

### 4.1 数据与奖励模型

InstructGPT 在 GPT-3 架构上训练了 1.3B, 6B, 175B 三档策略. 约 40 名承包商负责写示范, 给模型输出排序和主评估. 三份数据: SFT 约 13k 个训练 prompt (来自 API 和标注员编写), RM 33k 个, PPO 31k 个 (只来自 API, 无人工标签). prompt 只取自 Playground, 不用生产环境客户数据. 用 langid.py 分类, 约 96% 的数据被判为英文.

SFT 训练 16 个 epoch, 余弦学习率, residual dropout 0.2. 论文观察到验证损失在 1 个 epoch 后就过拟合, 但继续训练对 RM 分数和人类偏好都有帮助.

奖励模型从去掉最后 unembedding 层的模型出发, 输出一个标量. 论文只用 6B RM: 省算力, 并且 175B RM 训练不稳定, 不适合当 RL 中价值函数的初始化. 标注员每次对 $K=4$ 到 $9$ 个回答排序, 每个 prompt 产生 $\binom{K}{2}$ 个比较对. 若把比较对打散成独立样本, 每个回答会参与 $K-1$ 次梯度更新, RM 一个 epoch 就过拟合; 所以同一 prompt 的全部比较对放在一个 batch 元素里. 损失是

$$
\mathrm{loss}(\theta)=-\frac{1}{\binom{K}{2}}\mathbb{E}_{(x,y_w,y_l)\sim D}\Bigl[\log\sigma\bigl(r_\theta(x,y_w)-r_\theta(x,y_l)\bigr)\Bigr]. \tag{11}
$$

损失对奖励整体平移不变, 论文在 RL 前加一个偏置, 让示范数据的平均奖励为 0.

### 4.2 PPO 阶段

论文把环境写成 bandit: 给一个 prompt, 期待一个回答, RM 打分后 episode 结束. 每个 token 上加对 SFT 模型的 KL 罚, 防止过度优化 RM. 价值函数从 RM 初始化. 加上预训练梯度后的目标为

$$
\mathrm{objective}(\phi)=\mathbb{E}_{(x,y)\sim D_{\pi_\phi^{\mathrm{RL}}}}\Bigl[r_\theta(x,y)-\beta\log\frac{\pi_\phi^{\mathrm{RL}}(y\mid x)}{\pi^{\mathrm{SFT}}(y\mid x)}\Bigr]+\gamma\,\mathbb{E}_{x\sim D_{\mathrm{pretrain}}}\bigl[\log\pi_\phi^{\mathrm{RL}}(x)\bigr]. \tag{12}
$$

$\gamma=0$ 的模型叫 PPO, $\gamma>0$ 的叫 PPO-ptx. 论文中未特别说明时, InstructGPT 指 PPO-ptx. 这里的 $\gamma$ 是预训练损失系数, 与 GAE 的折扣因子是两个量.

附录给出的 PPO 设置:

| 项 | 取值 |
|----|------|
| KL 系数 $\beta$ | $0.02$ |
| 训练量 | 256k 个 episode, 约 31k 个去重 prompt |
| batch / mini-batch | 512 / 64, 即每批切 8 份, 只跑 1 个内层 epoch |
| GAE | 不打折扣 |
| clip | $0.2$ |
| rollout 温度 | $1$ |
| 权重 EMA | 衰减 $0.992$ |
| 价值网络 | 6B, 从 6B RM 初始化, 所有尺寸的策略共用 |
| 价值学习率 | 1.3B 与 6B 策略用 $9\times10^{-6}$, 175B 策略用 $5\times10^{-6}$ |
| PPO-ptx | 预训练样本数是 RL episode 数的 8 倍, $\gamma=27.8$ |

有两点和常见印象不同. 第一, 175B 的策略配的是 6B 的价值网络, 「策略和价值同尺寸」并非 InstructGPT 的做法; 论文这样设置是为了在不同策略尺寸间公平比较, 并控制算力. 第二, 每批只跑 1 个内层 epoch, 第一个 mini-batch 完全 on-policy, 后面 7 个也只偏离几步, PPO 用来复用样本的多 epoch 机制在这里基本没用上.

### 4.3 结果

- 在 API prompt 测试集上, 1.3B InstructGPT 的输出比 175B GPT-3 更受偏好, 参数少 100 多倍.
- 175B InstructGPT 对 175B GPT-3 的胜率 $85\pm3\%$, 对 few-shot 175B GPT-3 为 $71\pm4\%$.
- 闭域任务 (摘要, 闭域问答) 的编造率 21%, GPT-3 为 41%. TruthfulQA 上真实且有信息的回答约为 GPT-3 的两倍. 要求「尊重」时, RealToxicityPrompts 上有毒输出约少 25%. Winogender 和 CrowS-Pairs 上没有显著改善.
- 和在 FLAN, T0 上微调的 GPT-3 比较: InstructGPT 对 SFT 基线胜率 $73.4\pm2\%$, T0 和 FLAN 版本为 $26.8\pm2\%$ 和 $29.8\pm2\%$.
- 一致性: 训练标注员两两一致率 $72.6\pm1.5\%$, 留出标注员 $77.3\pm1.3\%$. 5 折交叉验证的 RM 对留出标注员组的准确率 $69.6\pm0.9\%$, 对训练组 $72.4\pm0.4\%$.

**对齐税.** 纯 PPO 在 SQuAD, DROP, HellaSwag, WMT15 法译英上比 GPT-3 退步. PPO-ptx 缓解了所有这些数据集上的退步, 在 HellaSwag 上超过 GPT-3, 但 DROP, SQuADv2 和翻译仍落后. 附录在 1.3B 模型上做了两组扫描: 预训练损失系数 $\ge20$ 时 SQuADv2 和 DROP 的退步可以恢复; 只加大 KL 系数则无法在恢复这两项的同时保住验证奖励. 训练到 512k 个 episode (默认的两倍) 时, DROP 和 SQuADv2 的退步又会出现.

RM 对留出标注员只有约 70% 的准确率, PPO 仍然提升了人类偏好. 一个合理的读法是策略主要利用了 RM 给出的相对排序信号; 同时这个信号有噪声, 过度优化会被利用, 所以 KL 罚和预训练混合都需要保留.

### 4.4 四个模型的数据流

![RLHF-PPO 的四个模型](./images/fig-ppo-four-models.png)

**图 2 解析**

- 自上而下. 蓝框 prompt $x$ 经 rollout 进入绿框 Actor $\pi_\theta$ (train), Actor 向右 sample 出黄框 response $y$.
- Actor 向下分出两路: 绿框 $\log\pi_\theta$ 和红框 Critic $V_\phi$ (train). response $y$ 向下分出三路: 进入 Critic, 黄框 Reward $r_\phi$ (frozen), 紫框 $\pi_{\mathrm{ref}}$ (frozen).
- 两条虚线标 KL, 分别从 $\log\pi_\theta$ 和 $\pi_{\mathrm{ref}}$ 指向中间的橙框 $r_t=r_\phi-\beta\,\mathrm{KL}$; RM 的 score 用实线进入同一个框.
- Critic 的 $V$ 和 $r_t$ 一起进入 $\mathrm{GAE}(\gamma,\lambda)$ 框, 输出 $A_t$ 和 $R_t=A_t+V$.
- $A_t$ 进入左下 $L^{\mathrm{CLIP}}\to\theta$, $R_t$ 进入右下 $L^{\mathrm{VF}}\to\phi$. 图中没有从损失回到模型的箭头, 更新写在底框里. 底注: 绿色和红色可训练, 黄色和紫色冻结, KL 在 GAE 之前进入奖励.

一次迭代按图走: Actor 采完整回答并记录 $\log\pi_{\theta_{\mathrm{old}}}$; 参考模型算每个 token 的 $\log\pi_{\mathrm{ref}}$; RM 给完整 $(x,y)$ 一个分数; Critic 给每个前缀一个 $V$. 每个 token 的即时奖励是 $-\beta(\log\pi_{\theta_{\mathrm{old}}}-\log\pi_{\mathrm{ref}})$, 最后一个 token 再加上 RM 分数. 这些奖励和 $V$ 进入 GAE, 得到 $\hat{A}_t$ 和 $R_t$. 更新时只动 Actor 和 Critic.

### 4.5 逐 token KL 与序列 KL

式 (12) 里的 KL 项写在序列级: $\log\frac{\pi^{\mathrm{RL}}(y\mid x)}{\pi^{\mathrm{SFT}}(y\mid x)}$. 由式 (3) 的连乘分解, 按序列似然的连乘分解, 它等于逐 token 对数比之和:

$$
\log\frac{\pi^{\mathrm{RL}}(y\mid x)}{\pi^{\mathrm{SFT}}(y\mid x)}=\sum_{t=1}^{|y|}\Bigl(\log\pi^{\mathrm{RL}}(y_t\mid x,y_{<t})-\log\pi^{\mathrm{SFT}}(y_t\mid x,y_{<t})\Bigr). \tag{13}
$$

所以把 $-\beta$ 乘逐 token 对数比分摊到每个位置, 再在 $\gamma=1$ 下求和, 与在序列末尾一次扣除 $\beta$ 乘序列对数比完全相同. 分摊到 token 的好处是 GAE 能把 KL 罚分配给具体位置: 某个 token 偏离 SFT 越多, 它所在位置的即时奖励越低. 对 $y\sim\pi^{\mathrm{RL}}$ 取期望, 式 (13) 是 $\mathrm{KL}(\pi^{\mathrm{RL}}\|\pi^{\mathrm{SFT}})$ 的无偏估计, 但单个样本可以为负. GRPO 改用另一种恒非负的估计量并把它放进损失, 推导见 [01-GRPO](../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) §2.2.

### 4.6 显存的量级

InstructGPT 附录写明: 所有模型用 fp16 权重和激活, 并保留 fp32 主权重副本, 优化器为 Adam ($\beta_1=0.9$, $\beta_2=0.95$). 以 175B 策略为例, 按这一配置粗算参数相关的显存 (不含激活和 KV cache):

| 模型 | 参数 | 是否训练 | 估算 |
|------|------|---------|------|
| 策略 | 175B | 是 | fp16 权重与梯度 4 字节/参数, fp32 主权重和 Adam 两个矩 12 字节/参数, 共约 2.8 TB |
| SFT 参考 | 175B | 否 | fp16 权重约 350 GB |
| 奖励模型 | 6B | 否 | 约 12 GB |
| 价值网络 | 6B | 是 | 约 96 GB |

参考模型和策略同尺寸, 冻结也要占 350 GB 左右; 价值网络如果也做成 175B, 会再增加约 2.8 TB. InstructGPT 用 6B 价值网络, 把这部分压到百 GB 以内. 这张表按每参数字节数算出, 论文没有报告实际显存. 它说明了后续工作为什么优先去掉价值网络: 同尺寸的价值网络大约让可训练部分的显存翻倍.

## 5. 实现

### 5.1 奖励模型

```python
def reward_model_loss(rm, prompt, chosen, rejected):
    r_w = rm(prompt, chosen)          # [B]
    r_l = rm(prompt, rejected)        # [B]
    return -F.logsigmoid(r_w - r_l).mean()
```

这是式 (11) 在 $K=2$ 时的形式. $K>2$ 时按 InstructGPT 的做法, 一个 prompt 的 $K$ 个回答各前向一次, 在 batch 内展开全部 $\binom{K}{2}$ 对.

### 5.2 逐 token 奖励与 GAE

```python
def token_rewards(score, logp_old, logp_ref, mask, beta=0.02):
    kl = (logp_old - logp_ref) * mask                     # [B, T]
    rewards = -beta * kl
    last = mask.sum(dim=-1).long() - 1                    # 最后一个有效 token
    rewards[torch.arange(rewards.size(0)), last] += score
    return rewards

def gae(rewards, values, mask, gamma=1.0, lam=0.95):
    B, T = rewards.shape
    adv = torch.zeros_like(rewards)
    last_adv = torch.zeros(B, device=rewards.device)
    next_v = torch.zeros(B, device=rewards.device)
    for t in range(T - 1, -1, -1):
        delta = rewards[:, t] + gamma * next_v - values[:, t]
        last_adv = delta + gamma * lam * last_adv
        adv[:, t] = last_adv * mask[:, t]
        last_adv = last_adv * mask[:, t]
        next_v = values[:, t] * mask[:, t]
    returns = adv + values
    return adv, returns
```

$\gamma=1$ 对应 InstructGPT 的「不打折扣」. `mask` 让 padding 位置的优势和下一步价值都为 0. 旧对数概率必须在 rollout 时记下; 更新阶段用新权重重算会得到 $r_t\equiv1$, clip 失去作用.

### 5.3 更新

```python
def ppo_update(policy, critic, batch, clip_eps=0.2, c1=0.5):
    logp = policy.log_prob(batch.ids, batch.mask)                 # [B, T]
    ratio = torch.exp(logp - batch.logp_old)
    surr1 = ratio * batch.adv
    surr2 = torch.clamp(ratio, 1 - clip_eps, 1 + clip_eps) * batch.adv
    pg_loss = -(torch.minimum(surr1, surr2) * batch.mask).sum() / batch.mask.sum()
    v = critic(batch.ids, batch.mask)
    vf_loss = ((v - batch.returns) ** 2 * batch.mask).sum() / batch.mask.sum()
    clipfrac = (((ratio - 1).abs() > clip_eps).float() * batch.mask).sum() / batch.mask.sum()
    return pg_loss + c1 * vf_loss, clipfrac
```

策略与价值不共享参数时, $c_1$ 只影响两个损失的相对尺度, 两个网络也可以各用自己的优化器和学习率. InstructGPT 正是这样: 价值网络用固定学习率. 很多实现会在 batch 内把 $\hat{A}$ 标准化 (减均值除标准差), 这是工程习惯, PPO 论文正文没有要求.

### 5.4 一次迭代要做哪些计算

按 InstructGPT 的设置数一遍. 每次迭代取 512 个 prompt:

1. 策略自回归生成 512 条回答, 同时记下每个 token 的 $\log\pi_{\theta_{\mathrm{old}}}$. 这一步是逐 token 解码, 其余步骤都是对已知序列做一次前向.
2. 参考模型对 512 条回答前向一次, 得到 $\log\pi_{\mathrm{ref}}$.
3. 奖励模型对 512 个 $(x,y)$ 前向一次, 得到分数.
4. 价值网络对 512 条回答前向一次, 得到每个前缀的 $V$. 随后在 CPU 或 GPU 上算逐 token 奖励和 GAE, 计算量可以忽略.
5. 把 512 条切成 8 个 64 条的 mini-batch, 每个 mini-batch 上策略和价值各做一次前向加反向, 共 8 次参数更新.

256k 个 episode 除以每批 512, 是 500 次迭代, 合计 4000 次策略参数更新. PPO-ptx 还要在每个 mini-batch 上额外算一次预训练梯度并累加, 预训练样本总数是 episode 数的 8 倍. 从这张清单可以看出去掉价值网络能省什么: 第 4 步里价值网络的前向, 第 5 步里价值网络的前向和反向, 以及它的优化器状态. 去掉参考模型 (例如 DAPO 不加 KL) 则省掉第 2 步.

### 5.5 训练中看什么

训练过程中常盯下面五个指标, 每个指标对应一类异常和处理办法:

| 指标 | 含义 | 异常时的处理 |
|------|------|-------------|
| 策略对参考模型的 KL | 偏离 SFT 的程度 | 长期上升: 加大 $\beta$ 或降学习率 |
| RM 平均分 | 对 RM 的优化程度 | 只说明在迎合 RM, 需要配合人工或其他评估 |
| `clipfrac` | 被裁剪的 token 比例 | 长期很高: 降学习率或减小 $\varepsilon$, 减少 epoch 数 |
| 价值损失与 explained variance | 价值网络是否跟得上 | 价值长期拟合不了回报: 优势不可信, 先查价值学习率 |
| 回答长度 | 是否在利用长度偏好 | 长度单调上涨且 RM 分同步上涨: 检查 RM 的长度偏差 |

## 6. 组件检验, 失效模式与相邻算法

### 6.1 RLHF 里 PPO 的组件有多少在起作用

Ahmadian et al. (2024, arXiv:2402.14740) 用 Pythia-6.9B 和 Llama-7B 在 Anthropic-HH 和 TL;DR 上重新检查 PPO:

1. **GAE 的 $\lambda$.** 在 Llama-7B + HH 上比较 $\lambda=0,0.5,0.95,1.0$, $\lambda=1.0$ (无偏, 方差最大, 即 Vanilla PG) 的训练奖励最高, 降方差但引入偏差的低 $\lambda$ 反而更差.
2. **裁剪.** 每个 batch 中损失被 clip 的比例平均低于 5%. 关闭 clip (包括价值网络的 clip), 再在 $\lambda=1$ 下去掉比率 $\pi_\theta/\pi_{\mathrm{old}}$, PPO 退化为 Vanilla PG, 奖励没有下降, 甚至略有提升.
3. **建模粒度.** 把整段回答当作一个动作的 REINFORCE 和 RLOO, 在所有数据集和模型上都优于把每个 token 当作动作的 PPO 和 Vanilla PG. Vanilla PG 的胜率比 PPO 高 3.2% 到 20.3%.
4. **最终胜率** (表 1, GPT-4 模拟评估, 对比数据集原回答). TL;DR, HH (Pythia), HH (Llama) 三组上, PPO 为 67.6, 29.2, 32.0, 两组 HH 上都是全表最低, RLOO ($k=4$) 为 77.9, 43.7, 64.1, 分别高 10.3, 14.5, 32.1 个点. 生成长度也差得多 (HH 表 2): PPO 平均只有 16.5 个 token, 困惑度 40.4, 在各方法中最高, 逐 token 建模的 Vanilla PG 为 39.0, 排第二; RLOO ($k=4$) 为 60.6 个 token, 困惑度 27.6. 同样每题采 $k$ 条时, RLOO 也胜过只拿最高分那条做交叉熵的 RAFT, 三组平均胜率 $k=2$ 时 61.3 对 56.1, $k=4$ 时 61.9 对 59.5. DPO 的回答最长, 平均 104.4 个 token.

论文的解释是: 预训练加 SFT 的初始化很强, 在 prompt 条件下, 每一步的概率质量集中在少数几个 token 上, 环境转移又是确定的, 所以传统深度强化学习里用来压方差和防大步的组件在这里很少被触发. 这和 §4.2 中 InstructGPT 每批只跑 1 个内层 epoch 的设置一致. 详细的序列级推导和 RLOO 见 [05-RLOO](../05-RLOO-留一法基线/05-RLOO-留一法基线.md).

这不等于 PPO 在 LLM 上无用. 推理任务的回答长, 一批 rollout 常切成多个 mini-batch 更新多次, off-policy 程度更高, clip 触发更频繁, 这正是 [04-GSPO](../../4.5-GRPO家族与RLVR/04-GSPO/04-GSPO.md) 讨论的场景. 需要逐 token 价值估计 (例如过程奖励) 时, 价值网络也仍有用.

### 6.2 失效模式

| 现象 | 常见原因 | 处理 |
|------|----------|------|
| KL 持续上升, 输出变得不可读 | $\beta$ 太小或学习率太大 | 加大 $\beta$, 降学习率, 减少 epoch |
| RM 分上涨, 人评下降 | 奖励投机 | 检查 RM 覆盖面, 保留 KL 罚, 混预训练梯度 |
| `clipfrac` 长期很高 | 新旧策略差太多 | 降学习率, 减小 $\varepsilon$, 减少同批更新次数 |
| 中间 token 的 $V$ 抖动大 | 奖励只在句末, 价值网络缺监督 | 提高 $\lambda$; 或改用组相对 / 留一法基线 |
| 公开基准退步 | 对齐税 | PPO-ptx 混入预训练梯度; 只加大 KL 不够 |
| 训练越久某些基准越差 | 过度优化 | InstructGPT 在 512k episode 时复现了退步, 控制训练量 |
| 优势被 padding 污染 | mask 漏掉 | GAE 和损失都按 mask 计算 |
| 比率恒为 1 | 旧 logprob 在更新阶段重算 | rollout 时记录并保存 |

价值网络的初始化也会影响前期稳定性. InstructGPT 从 RM 初始化价值网络: 在完整回答上, RM 的输出就是这条回答的得分, 也就是最后一个位置价值的目标, 所以训练开始时价值网络至少在末端位置有合理的估计. 随机初始化的价值头在训练初期给出的优势接近噪声, 这段时间里策略更新的方向不可靠, 一种做法是先只训练价值网络一段时间, 等价值损失下降后再放开策略更新.

### 6.3 与相邻算法的关系

| 算法 | 优势从哪来 | 比率与裁剪 | 价值网络 | 在线采样 |
|------|-----------|-----------|----------|---------|
| PPO | GAE, 依赖 $V_\phi$ | token 级, 式 (9) | 有 | 是 |
| TRPO | 同 PPO | KL 硬约束, 共轭梯度 | 有 | 是 |
| GRPO | 同题 $G$ 条的 $z$-score | token 级 clip, KL 进损失 | 无 | 是 |
| GSPO | 同 GRPO | 序列级几何平均比率 | 无 | 是 |
| RLOO | 留一法基线 | 无 | 无 | 是 |
| DPO | 无显式优势 | 无 | 无 | 否, 离线偏好对 |

选 PPO 的典型理由: 需要逐 token 的价值估计, 奖励不是简单的对错, 并且能承担价值网络的显存和训练成本. 只有序列级可验证奖励时, 先考虑 [01-GRPO](../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) 或 RLOO.

## 参考文献

1. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347. https://arxiv.org/abs/1707.06347
2. Ouyang, L., et al. (2022). *Training Language Models to Follow Instructions with Human Feedback*. NeurIPS 2022. arXiv:2203.02155. https://arxiv.org/abs/2203.02155
3. Schulman, J., Moritz, P., Levine, S., Jordan, M., & Abbeel, P. (2016). *High-Dimensional Continuous Control Using Generalized Advantage Estimation*. ICLR 2016. arXiv:1506.02438. https://arxiv.org/abs/1506.02438
4. Schulman, J., Levine, S., Moritz, P., Jordan, M., & Abbeel, P. (2015). *Trust Region Policy Optimization*. ICML 2015. arXiv:1502.05477. https://arxiv.org/abs/1502.05477
5. Ahmadian, A., et al. (2024). *Back to Basics: Revisiting REINFORCE Style Optimization for Learning from Human Feedback in LLMs*. ACL 2024. arXiv:2402.14740. https://arxiv.org/abs/2402.14740
6. Kakade, S., & Langford, J. (2002). *Approximately Optimal Approximate Reinforcement Learning*. ICML 2002.
7. Stiennon, N., et al. (2020). *Learning to Summarize from Human Feedback*. NeurIPS 2020. arXiv:2009.01325. https://arxiv.org/abs/2009.01325
