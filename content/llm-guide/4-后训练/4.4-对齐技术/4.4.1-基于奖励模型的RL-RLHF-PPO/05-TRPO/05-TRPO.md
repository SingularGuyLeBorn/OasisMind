---
title: "05 · TRPO: 信任域策略优化"
published: true
tags: ["TRPO", "PPO", "信任域", "自然梯度", "共轭梯度", "策略梯度"]
excerpt: "TRPO 从性能差恒等式出发, 证明带 KL 罚的替代目标是真实回报的下界, 再把罚项改成平均 KL 约束, 用共轭梯度加线搜索求解. PPO 的裁剪目标是它的一阶近似."
---
# 05 TRPO: 信任域策略优化

> 相关阅读: [04-PPO](../04-PPO/04-PPO.md) · [02-GRPO](../02-GRPO/02-GRPO.md) · [4.4.0 强化学习的数学原理](../../4.4.0-强化学习的数学原理/4.4.0-强化学习的数学原理.md)

材料是 Schulman 等人的 TRPO 论文 (ICML 2015, arXiv:1502.05477), 以及 PPO 论文里与它对照的部分. 问题是策略梯度只给了方向, 一步该走多远; 步子太大, 基于旧数据的估计失效, 真实回报可能大幅下降.

## 1. 问题与替代目标

### 1.1 设定

无限时域折扣 MDP $(\mathcal{S},\mathcal{A},P,r,\rho_0,\gamma)$, 随机策略 $\pi$ 的性能是期望折扣回报

$$
\eta(\pi)=\mathbb{E}_{s_0,a_0,\ldots}\Bigl[\sum_{t=0}^{\infty}\gamma^t r(s_t)\Bigr],\qquad s_0\sim\rho_0,\;a_t\sim\pi(\cdot\mid s_t),\;s_{t+1}\sim P(\cdot\mid s_t,a_t). \tag{1}
$$

$Q_\pi$, $V_\pi$ 按标准定义, 优势 $A_\pi(s,a)=Q_\pi(s,a)-V_\pi(s)$.

### 1.2 三个难点

1. **方向有了, 步长没有.** 策略梯度是 $\eta$ 在当前参数处的一阶信息. 用固定学习率沿梯度走, 策略分布可能变化很大, 新策略访问的状态和旧数据完全不同.
2. **参数距离不等于策略距离.** 同样大小的 $\Delta\theta$, 在网络的不同位置对输出分布的影响差别很大. 用 $\|\Delta\theta\|_2$ 限步长 (即普通梯度上升) 不能反映策略实际改变了多少.
3. **无梯度方法在大策略上失效.** 论文引言提到, CEM, CMA 这类无梯度方法在许多问题上效果好, 也容易实现, 但样本复杂度随参数量上升, 难以处理几万参数的神经网络策略.

TRPO 的回答: 用 KL 散度度量策略之间的距离, 在 KL 不超过 $\delta$ 的范围内最大化一个可以用旧数据估计的目标.

### 1.3 性能差恒等式

Kakade 与 Langford (2002) 给出新旧策略的性能差 (TRPO 式 (1), 附录 A 有证明):

$$
\eta(\tilde\pi)=\eta(\pi)+\mathbb{E}_{s_0,a_0,\ldots\sim\tilde\pi}\Bigl[\sum_{t=0}^{\infty}\gamma^tA_\pi(s_t,a_t)\Bigr]. \tag{2}
$$

期望在新策略 $\tilde\pi$ 的轨迹上取, 优势却属于旧策略 $\pi$. 证明只用到 $A_\pi(s,a)=\mathbb{E}_{s'}[r(s)+\gamma V_\pi(s')-V_\pi(s)]$: 沿 $\tilde\pi$ 的轨迹把 $\gamma^tA_\pi(s_t,a_t)$ 加起来, $\gamma^{t+1}V_\pi(s_{t+1})$ 和下一项的 $-\gamma^{t+1}V_\pi(s_{t+1})$ 相消, 只剩 $-V_\pi(s_0)+\sum_t\gamma^tr(s_t)$, 对 $s_0$ 取期望就是 $\eta(\tilde\pi)-\eta(\pi)$.

记未归一化的折扣访问频率 $\rho_\pi(s)=\sum_{t\ge0}\gamma^tP(s_t=s\mid\pi)$, 式 (2) 改写为对状态求和:

$$
\eta(\tilde\pi)=\eta(\pi)+\sum_s\rho_{\tilde\pi}(s)\sum_a\tilde\pi(a\mid s)A_\pi(s,a). \tag{3}
$$

如果每个状态上 $\sum_a\tilde\pi(a\mid s)A_\pi(s,a)\ge0$, 则 $\eta$ 不降. 精确策略迭代取 $\tilde\pi(s)=\arg\max_aA_\pi(s,a)$, 就是这种情况. 近似场景下, 估计误差和函数近似误差使得总有一些状态的期望优势为负; 而且 $\rho_{\tilde\pi}$ 依赖于还没确定的 $\tilde\pi$, 式 (3) 无法直接优化.

### 1.4 替代目标

把 $\rho_{\tilde\pi}$ 换成 $\rho_\pi$ (TRPO 式 (3)):

$$
L_\pi(\tilde\pi)=\eta(\pi)+\sum_s\rho_\pi(s)\sum_a\tilde\pi(a\mid s)A_\pi(s,a). \tag{4}
$$

$L_\pi$ 忽略了策略变化引起的状态分布变化. 对参数化策略 $\pi_\theta$, 它与 $\eta$ 在当前点一阶相等 (TRPO 式 (4)):

$$
L_{\pi_{\theta_0}}(\pi_{\theta_0})=\eta(\pi_{\theta_0}),\qquad\nabla_\theta L_{\pi_{\theta_0}}(\pi_\theta)\big|_{\theta=\theta_0}=\nabla_\theta\eta(\pi_\theta)\big|_{\theta=\theta_0}. \tag{5}
$$

所以足够小的一步, 只要提高 $L$, 也会提高 $\eta$. 式 (5) 不告诉我们「足够小」是多小.

### 1.5 手算: $L$ 漏掉了什么

用一个两步的回合制例子 (取 $\gamma=1$, 恒等式在有限时域回合制下同样成立). 初始状态 $s_0$ 有两个动作: $a$ 进入 $s_1$, $b$ 进入 $s_2$. 在 $s_1$ 选 $x$ 得到奖励 1 并结束, 选 $y$ 得 0 并结束; $s_2$ 无论选什么都得 0 并结束.

旧策略 $\pi$: $\pi(a\mid s_0)=0.5$, $\pi(x\mid s_1)=0.5$. 于是 $V_\pi(s_1)=0.5$, $V_\pi(s_2)=0$, $V_\pi(s_0)=0.25=\eta(\pi)$. 优势: $A_\pi(s_0,a)=0.5-0.25=0.25$, $A_\pi(s_0,b)=-0.25$, $A_\pi(s_1,x)=0.5$, $A_\pi(s_1,y)=-0.5$. 旧策略的访问频率 $\rho_\pi(s_0)=1$, $\rho_\pi(s_1)=\rho_\pi(s_2)=0.5$.

新策略 $\tilde\pi$: $\tilde\pi(a\mid s_0)=0.8$, $\tilde\pi(x\mid s_1)=0.9$. 真实回报 $\eta(\tilde\pi)=0.8\times0.9=0.72$.

- $s_0$ 上的期望优势: $0.8\times0.25+0.2\times(-0.25)=0.15$.
- $s_1$ 上的期望优势: $0.9\times0.5+0.1\times(-0.5)=0.4$.
- 替代目标 (式 (4)): $L_\pi(\tilde\pi)=0.25+1\times0.15+0.5\times0.4=0.60$.
- 恒等式 (式 (3)) 用新策略的访问频率 $\rho_{\tilde\pi}(s_1)=0.8$: $0.25+0.15+0.8\times0.4=0.72$, 与真实回报一致.

差值 $0.12=(0.8-0.5)\times0.4$, 等于「$s_1$ 访问频率的变化」乘以「$s_1$ 上策略改进带来的期望优势」. 如果只改 $s_0$ ($\tilde\pi(x\mid s_1)$ 保持 0.5), $s_1$ 上期望优势为 0, $L=\eta=0.4$; 如果只改 $s_1$, 访问频率不变, $L=\eta$. 误差只在两处都变时出现, 是两个变化量的乘积, 这正是 §2 中误差项为 $\alpha^2$ 阶的直观来源.

### 1.6 保守策略迭代

Kakade 与 Langford 的保守策略迭代给出了显式下界. 令 $\pi'=\arg\max_{\pi'}L_{\pi_{\mathrm{old}}}(\pi')$, 新策略取混合

$$
\pi_{\mathrm{new}}(a\mid s)=(1-\alpha)\pi_{\mathrm{old}}(a\mid s)+\alpha\pi'(a\mid s), \tag{6}
$$

则 $\eta(\pi_{\mathrm{new}})\ge L_{\pi_{\mathrm{old}}}(\pi_{\mathrm{new}})-\frac{2\epsilon\gamma}{(1-\gamma)^2}\alpha^2$, 其中 $\epsilon=\max_s|\mathbb{E}_{a\sim\pi'}[A_\pi(s,a)]|$. 这个界只对混合策略成立. 神经网络策略是参数的非线性函数, 一般写不成两个分布的凸组合, 所以需要把界推广到任意随机策略.

## 2. 一般策略的单调改进保证

### 2.1 定理 1

TRPO 把混合系数 $\alpha$ 换成两个策略之间的最大总变差 $D_{\mathrm{TV}}^{\max}(\pi,\tilde\pi)=\max_sD_{\mathrm{TV}}(\pi(\cdot\mid s)\|\tilde\pi(\cdot\mid s))$, 其中 $D_{\mathrm{TV}}(p\|q)=\frac12\sum_i|p_i-q_i|$.

**定理 1.** 令 $\alpha=D_{\mathrm{TV}}^{\max}(\pi_{\mathrm{old}},\pi_{\mathrm{new}})$, $\epsilon=\max_{s,a}|A_\pi(s,a)|$, 则

$$
\eta(\pi_{\mathrm{new}})\ge L_{\pi_{\mathrm{old}}}(\pi_{\mathrm{new}})-\frac{4\epsilon\gamma}{(1-\gamma)^2}\alpha^2. \tag{7}
$$

附录 A 的证明思路: 总变差为 $\alpha$ 的两个分布可以耦合成一对随机变量, 以概率 $1-\alpha$ 取相同值. 把两个策略这样耦合后, $L$ 只计入两者第一次选不同动作时带来的优势; $\eta$ 与 $L$ 的差来自两次及以上的分歧, 所以误差是 $O(\alpha^2)$. 具体地, 第 $t$ 步之前出现过分歧的概率不超过 $1-(1-\alpha)^t$, 每步期望优势的差不超过 $4\alpha(1-(1-\alpha)^t)\epsilon$, 对 $t$ 加权求和得到

$$
|\eta(\tilde\pi)-L_\pi(\tilde\pi)|\le\frac{4\alpha^2\gamma\epsilon}{(1-\gamma)(1-\gamma(1-\alpha))}\le\frac{4\alpha^2\gamma\epsilon}{(1-\gamma)^2}. \tag{8}
$$

附录 B 还给了一个基于扰动理论的证明, 结论相同.

与 §1.6 的保守策略迭代界对比, 有两处变化. 系数从 $2\epsilon\gamma$ 变成 $4\epsilon\gamma$; $\epsilon$ 的定义从「每个状态上按 $\pi'$ 取期望后的优势绝对值的最大值」放宽为「所有状态–动作对上优势绝对值的最大值」, 后者不小于前者. 换来的是适用范围: 定理 1 对任意两个随机策略成立, 不要求新策略是混合策略. 对混合策略 $(1-\alpha)\pi+\alpha\pi'$, 每个状态上的总变差不超过 $\alpha$, 定理 1 直接覆盖这种情况.

### 2.2 换成 KL

利用 $D_{\mathrm{TV}}(p\|q)^2\le D_{\mathrm{KL}}(p\|q)$ (Pollard, 2000), 记 $D_{\mathrm{KL}}^{\max}(\pi,\tilde\pi)=\max_sD_{\mathrm{KL}}(\pi(\cdot\mid s)\|\tilde\pi(\cdot\mid s))$, 得到 TRPO 式 (9):

$$
\eta(\tilde\pi)\ge L_\pi(\tilde\pi)-C\,D_{\mathrm{KL}}^{\max}(\pi,\tilde\pi),\qquad C=\frac{4\epsilon\gamma}{(1-\gamma)^2}. \tag{9}
$$

### 2.3 MM 算法与理论系数

论文 Algorithm 1: 每轮计算全部优势值, 求解 $\pi_{i+1}=\arg\max_\pi M_i(\pi)$, 其中 $M_i(\pi)=L_{\pi_i}(\pi)-C\,D_{\mathrm{KL}}^{\max}(\pi_i,\pi)$. 由式 (9), $\eta(\pi_{i+1})\ge M_i(\pi_{i+1})$; 又 $\eta(\pi_i)=M_i(\pi_i)$. 两式相减:

$$
\eta(\pi_{i+1})-\eta(\pi_i)\ge M_i(\pi_{i+1})-M_i(\pi_i)\ge0. \tag{10}
$$

最后一个不等号成立是因为 $\pi_{i+1}$ 是 $M_i$ 的最大值点, 至少不比 $\pi_i$ 差. 这是一种 minorization-maximization 算法, EM 也属于这一类: $M_i$ 处处不高于 $\eta$, 并在 $\pi_i$ 处相等. 这里假设优势值精确已知.

**手算: 理论系数有多大.** 取 $\gamma=0.99$, 优势的最大绝对值 $\epsilon=1$. $C=4\times1\times0.99/(0.01)^2=39600$. 若新旧策略的最大 KL 是 $0.01$, 罚项为 $396$. 在优势绝对值不超过 1 的问题里, $L$ 的提升量 $\sum_s\rho_\pi(s)\sum_a\tilde\pi(a\mid s)A_\pi(s,a)$ 的量级受 $\frac{1}{1-\gamma}=100$ 限制, 一次小幅更新带来的提升远小于 396. 要让 $M_i$ 上升, KL 必须小到 $10^{-5}$ 量级, 策略几乎不动. 这就是论文说的「按理论推荐的罚系数, 步长会很小」.

## 3. 实用算法

### 3.1 罚项改约束, 最大 KL 改平均 KL

罚系数 $C$ 太大, 而且很难在不同问题间稳定地选一个系数. TRPO 改用 KL 约束 (信任域), 先写成最大 KL 形式 (TRPO 式 (11)):

$$
\max_\theta L_{\theta_{\mathrm{old}}}(\theta)\quad\text{s.t.}\quad D_{\mathrm{KL}}^{\max}(\theta_{\mathrm{old}},\theta)\le\delta. \tag{11}
$$

这要求每个状态都满足约束, 约束条数等于状态数, 数值上不可解. 论文改用在旧策略访问分布上平均的 KL:

$$
\overline{D}_{\mathrm{KL}}^{\rho}(\theta_1,\theta_2)=\mathbb{E}_{s\sim\rho}\bigl[D_{\mathrm{KL}}(\pi_{\theta_1}(\cdot\mid s)\|\pi_{\theta_2}(\cdot\mid s))\bigr], \tag{12}
$$

实际求解的问题是 (TRPO 式 (12))

$$
\max_\theta L_{\theta_{\mathrm{old}}}(\theta)\quad\text{s.t.}\quad\overline{D}_{\mathrm{KL}}^{\rho_{\theta_{\mathrm{old}}}}(\theta_{\mathrm{old}},\theta)\le\delta. \tag{13}
$$

平均 KL 是启发式近似. 论文在 Cart-pole 上实现了最大 KL 版本作对照, 它学得稍慢 (约束更严), 但整体效果接近, 说明平均约束与理论上的最大约束作用相似. 注意 KL 的方向: 旧策略在前, $D_{\mathrm{KL}}(\pi_{\mathrm{old}}\|\pi_\theta)$, 实现时不要写反.

### 3.2 用样本估计

把式 (13) 展开: 先把 $\sum_s\rho_{\theta_{\mathrm{old}}}(s)[\cdot]$ 换成 $\frac{1}{1-\gamma}\mathbb{E}_{s\sim\rho_{\theta_{\mathrm{old}}}}[\cdot]$; 再把 $A_{\theta_{\mathrm{old}}}$ 换成 $Q_{\theta_{\mathrm{old}}}$, 这只让目标差一个常数, 因为 $\sum_a\pi_\theta(a\mid s)V(s)=V(s)$ 与 $\theta$ 无关; 最后用重要性采样替换对动作的求和, 采样分布记为 $q$. 得到 TRPO 式 (14):

$$
\max_\theta\;\mathbb{E}_{s\sim\rho_{\theta_{\mathrm{old}}},\,a\sim q}\Bigl[\frac{\pi_\theta(a\mid s)}{q(a\mid s)}Q_{\theta_{\mathrm{old}}}(s,a)\Bigr]\quad\text{s.t.}\quad\mathbb{E}_{s\sim\rho_{\theta_{\mathrm{old}}}}\bigl[D_{\mathrm{KL}}(\pi_{\theta_{\mathrm{old}}}(\cdot\mid s)\|\pi_\theta(\cdot\mid s))\bigr]\le\delta. \tag{14}
$$

### 3.3 Single path 与 vine

**Single path.** 从 $s_0\sim\rho_0$ 出发, 用 $\pi_{\theta_{\mathrm{old}}}$ 跑轨迹, 所以 $q=\pi_{\theta_{\mathrm{old}}}$. 每个 $(s_t,a_t)$ 的 $Q$ 用这条轨迹之后的折扣回报估计. 不需要把环境重置到任意状态, 可以直接在实体系统上采样.

**Vine.** 先跑一批「主干」轨迹, 从中选 $N$ 个状态作为 rollout 集合. 每个状态 $s_n$ 采 $K$ 个动作 $a_{n,k}\sim q(\cdot\mid s_n)$, 每个动作接一段短 rollout 估计 $\hat{Q}(s_n,a_{n,k})$. 同一状态的 $K$ 条 rollout 使用相同的随机数序列 (common random numbers), 降低 $Q$ 值之差的方差. 论文发现连续控制上 $q=\pi_{\theta_i}$ 效果好, Atari 上均匀分布有时探索更好. 动作空间小时可以对每个动作都做 rollout:

$$
L_n(\theta)=\sum_{k=1}^{K}\pi_\theta(a_k\mid s_n)\hat{Q}(s_n,a_k). \tag{15}
$$

动作空间大或连续时, 用自归一化重要性采样:

$$
L_n(\theta)=\frac{\sum_{k=1}^{K}\frac{\pi_\theta(a_{n,k}\mid s_n)}{\pi_{\theta_{\mathrm{old}}}(a_{n,k}\mid s_n)}\hat{Q}(s_n,a_{n,k})}{\sum_{k=1}^{K}\frac{\pi_\theta(a_{n,k}\mid s_n)}{\pi_{\theta_{\mathrm{old}}}(a_{n,k}\mid s_n)}}. \tag{16}
$$

自归一化让 $Q$ 值不需要减基线: $Q$ 整体加一个常数, 式 (16) 也只加同一个常数, 梯度不变.

Vine 的优势估计方差低得多, 代价是模拟器调用次数多, 并且必须能把系统重置到指定状态, 一般只能在仿真里用. 对 LLM 而言, 状态是前缀, 从任意前缀重新采样在技术上可行 (把前缀重新喂给模型即可), 但每个分支都是一次完整生成, 成本和 vine 在仿真里的模拟器调用相当.

### 3.4 一轮迭代的步骤与仿真量

论文 §6 把实用算法归纳为反复执行三步:

1. 用 single path 或 vine 采集一批状态–动作对, 并用蒙特卡洛方法估计它们的 $Q$ 值.
2. 对样本求平均, 构造式 (14) 的目标和约束的估计.
3. 近似求解这个约束优化问题, 更新策略参数 $\theta$. 求解方法是 §4 的共轭梯度加线搜索.

论文同时列出了实用算法与理论之间的三处差距: 用 KL 约束代替罚项, 理由是罚系数 $C$ 会导致过小的步长; 用平均 KL 代替难以优化和估计的最大 KL; 忽略优势函数的估计误差. 第三处在 Kakade 与 Langford 的原始推导里有所处理, 论文为简单起见没有加入.

**手算: 一次实验要多少仿真.** 按 §5.3 表格的 Hopper 设置, 每轮 1M 仿真步, 200 轮共 $2\times10^8$ 步. vine 每轮 14 分钟, 200 轮约 $14\times200/60\approx47$ 小时; single path 每轮 35 分钟, 约 117 小时. Walker 的 single path 每轮 100 分钟, 200 轮约 333 小时. Atari 的 vine 每轮约 400K 步, 500 轮约 $2\times10^8$ 步, 论文报告 16 核机器上约 30 小时. 这些耗时针对的是 2015 年的 CPU 实现, 用来说明样本量的级别: TRPO 每轮都丢弃旧数据重新采样, 总样本量与迭代次数成正比.

## 4. 共轭梯度与线搜索

### 4.1 近似问题

目标在 $\theta_{\mathrm{old}}$ 处一阶展开, $g=\nabla_\theta L$; 平均 KL 二阶展开, 一阶项为 0 (KL 在 $\theta=\theta_{\mathrm{old}}$ 处取最小值 0):

$$
\overline{D}_{\mathrm{KL}}(\theta_{\mathrm{old}},\theta)\approx\frac12(\theta-\theta_{\mathrm{old}})^\top A(\theta-\theta_{\mathrm{old}}),\qquad A_{ij}=\frac{\partial^2}{\partial\theta_i\partial\theta_j}\overline{D}_{\mathrm{KL}}(\theta_{\mathrm{old}},\theta)\Big|_{\theta=\theta_{\mathrm{old}}}. \tag{17}
$$

$A$ 就是 Fisher 信息矩阵. 问题变为 $\max_s g^\top s$, s.t. $\frac12s^\top As\le\delta$. 由拉格朗日条件, 解的方向是 $s\propto A^{-1}g$. 令 $\theta=\theta_{\mathrm{old}}+\beta s$, 代入约束取等号, $\delta=\frac12\beta^2s^\top As$, 得最大步长

$$
\beta=\sqrt{\frac{2\delta}{s^\top As}}. \tag{18}
$$

### 4.2 只用 Fisher–向量积

网络参数多时, $A$ 存不下, 更不能求逆. 共轭梯度法只需要能计算 $y\mapsto Ay$, 就能近似求解 $Ax=g$. 附录 C.1 给出高效算法: 策略先把输入映射到分布参数 $\mu_\theta(x)$, KL 写成 $\mathrm{kl}(\mu_\theta(x),\mu_{\mathrm{old}})$. 对 $\theta$ 求二阶导时, 含 $\mu$ 二阶导数的那一项在 $\theta=\theta_{\mathrm{old}}$ 处为 0 (因为此时 KL 对 $\mu$ 的一阶导为 0), 只剩

$$
A=J^\top MJ,\qquad J=\frac{\partial\mu}{\partial\theta},\quad M=\frac{\partial^2\mathrm{kl}}{\partial\mu\,\partial\mu}. \tag{19}
$$

$Jy$ 和 $J^\top z$ 分别是前向和反向自动微分, $M$ 对常见分布有简单的闭式. 也可以直接用通用的 Hessian–向量积对 $\overline{D}_{\mathrm{KL}}$ 求二阶, 实现更省事, 只是多算了那一项, 略慢.

论文还说明了 Fisher 矩阵的估计方式: 对每个采样状态的 KL 求解析 Hessian 再平均, 而不是用 $\nabla\log\pi$ 外积的经验 Fisher. 解析估计在每个状态上对动作积分, 与那个状态实际采到的动作无关; 大规模时不用存稠密 Hessian, 也不用存整批的策略梯度. 实验里两种估计的策略改进速度相近.

**代价.** 一次 Fisher–向量积的开销与算一次梯度相当. 论文取 CG 迭代 $k=10$, 更大的 $k$ 不会让策略改进更快. 朴素实现会把 90% 以上的计算花在 Fisher–向量积上. 由于 Fisher 矩阵只充当度量, 可以只在 10% 的数据上计算, 这样全部 Hessian–向量积的总开销约等于一次梯度. 论文的说法是, 共轭梯度加线搜索总体只比算一次梯度略贵.

### 4.3 两类策略的 $M$

附录 D 给出了实验用的两种策略参数化. 连续控制用高斯策略: 网络输出均值 $\mu_\theta(s)$, 标准差 $\sigma=\exp(r)$, $r$ 是与状态无关的参数向量. 单个维度上两个高斯的 KL 为

$$
D_{\mathrm{KL}}\bigl(\mathcal{N}(\mu_0,\sigma_0^2)\|\mathcal{N}(\mu,\sigma^2)\bigr)=\ln\frac{\sigma}{\sigma_0}+\frac{\sigma_0^2+(\mu_0-\mu)^2}{2\sigma^2}-\frac12. \tag{20}
$$

在 $\mu=\mu_0$, $\sigma=\sigma_0$ 处对 $\mu$ 求二阶导得 $1/\sigma_0^2$, 对 $\log\sigma$ 求二阶导得 2, 交叉项为 0. 所以式 (19) 里的 $M$ 是对角阵, 均值方向的权重是 $1/\sigma^2$: 探索噪声越小, 同样的均值移动对应的 KL 越大, 允许的步长越小. Atari 用分类分布 (factored categorical), 以概率向量 $p$ 为分布参数时 $M=\mathrm{diag}(1/p)$, 概率小的动作上同样的概率变化代价更高. 两种情况下 $M$ 都可以逐样本闭式计算, Fisher–向量积的主要开销是 $J$ 和 $J^\top$ 的两次自动微分.

### 4.4 线搜索与实现

二阶近似不精确. 线搜索在非线性目标 $L_{\theta_{\mathrm{old}}}(\theta)-\mathcal{X}[\overline{D}_{\mathrm{KL}}(\theta_{\mathrm{old}},\theta)\le\delta]$ 上进行, $\mathcal{X}[\cdot]$ 在条件成立时为 0, 不成立时为 $+\infty$. 从式 (18) 的 $\beta$ 开始按指数缩小, 直到目标上升. 附录 C 写明, 不做线搜索时, 算法偶尔会迈出导致性能灾难性下降的大步. 线搜索只缩短步长, 方向保持 CG 给出的 $s$.

**实现.**

```python
def conjugate_gradient(fvp, g, iters=10, tol=1e-10):
    x = torch.zeros_like(g)
    r = g.clone()                 # 残差 g - A x, 初始 x = 0
    p = g.clone()
    rr = r @ r
    for _ in range(iters):
        Ap = fvp(p)
        alpha = rr / (p @ Ap)
        x += alpha * p
        r -= alpha * Ap
        rr_new = r @ r
        if rr_new < tol:
            break
        p = r + (rr_new / rr) * p
        rr = rr_new
    return x

def trpo_step(params, surrogate, mean_kl, fvp, delta=0.01, backtrack=0.5, max_tries=10):
    g = flat_grad(surrogate(), params)
    s = conjugate_gradient(fvp, g)
    beta = torch.sqrt(2 * delta / (s @ fvp(s)))
    old = flat_params(params)
    L_old = surrogate().item()
    for i in range(max_tries):
        set_flat_params(params, old + (backtrack ** i) * beta * s)
        if mean_kl().item() <= delta and surrogate().item() > L_old:
            return True
    set_flat_params(params, old)
    return False
```

`fvp(v)` 计算 $Av$: 可以先算 `kl = mean_kl()`, 求 `grad_kl = autograd.grad(kl, params, create_graph=True)`, 再对 `(grad_kl * v).sum()` 求一次梯度, 这就是通用 Hessian–向量积的写法. 实践中常给 $A$ 加一个小的阻尼项 $\lambda I$ 保证数值稳定, 这一项论文正文没有提. `fvp` 只在一部分状态上计算即可, 对应 §4.2 的 10% 子采样.

![共轭梯度求方向, 再线搜索收步长](./images/fig-trpo-cg-linesearch.png)

**图 1 解析**

- 主链从左到右七个框: 黄框 `theta_old` 与优势 $A$; 蓝框 linearize $L$, 写 $g=\mathrm{grad}\,L$; 绿框 quadratic KL: Fisher $F$; 橙框 conjugate gradient: solve $Fx=g$; 青框 candidate direction $x$; 橙框 line search: shrink until mean KL $\le\delta$ and $L$ improves; 粉框 `theta_new`.
- 线搜索框向下连到紫框 if KL too big: smaller alpha, 表示线搜索内部的回退, 数据流仍然走主链.
- 图中的 $F$ 即本文的 $A$ (平均 KL 的 Hessian), 图中的 $x$ 即本文的 $s$. 图里没有 Adam 和 clip.

## 5. 示意图与实验

### 5.1 两个示意图

![无约束一步与平均 KL 信任域](./images/fig-trpo-trust-region.png)

**图 2 解析**

- 左列标题 Unconstrained PG: 蓝框 $\pi_{\mathrm{old}}$, 经标注 unconstrained 的箭头到橙框 $\Delta\theta=\alpha\nabla\eta$, 再到深橙框 $\pi_{\mathrm{far}}$, 最后一段虚线标 approx fails, 指向红框 $\eta$ drops.
- 右列标题 TRPO: 蓝框 $\pi_{\mathrm{old}}$ 到黄框 maximize $L$, 经标注 s.t. 的箭头到青框 mean $KL\le\delta$, 再到绿框 $\pi_{\mathrm{new}}$ inside.
- 底注: 实际约束是平均 KL, 不是最大 KL.
- 图中没有坐标曲线, 学习曲线见论文 Figure 4 (运动控制) 和附录 F 的 Figure 5 (Atari).

![替代目标 L, 真实回报 η 与平均 KL 球](./images/fig-trpo-eta-l-kl-ball.png)

**图 3 解析**

- 上排从左到右: 黄框 Kakade identity, 写式 (2); 箭头标 replace $\rho$, 进入绿框 Surrogate $L$, 注明 $L_\pi(\tilde\pi)$ 用 $\rho_\pi$ 而非 $\rho_{\tilde\pi}$, 对应式 (4); 再到黄框 First-order match, 即式 (5); 一条标 $O(\alpha^2)$ gap 的虚线指向橙框 True $\eta$, 注明步子太大时可能下降, 对应式 (8) 的误差项.
- 下排: 蓝框 $\pi_{\mathrm{old}}$ 向上连到 Kakade 框 (标 old policy), 向右以 center 连到紫框 Average KL ball $D^{\rho}_{KL}(\pi_{\mathrm{old}},\pi)\le\delta$, 即式 (13); 再以 feasible 连到右下橙框 $\theta_{\mathrm{new}}$ stays inside ball.
- 右侧一条虚线从 True $\eta$ 向下指到 $\theta_{\mathrm{new}}$, 标 safe only inside ball.

### 5.2 手算: $\delta=0.01$ 有多紧

两动作的策略, 旧策略 $(0.6,0.4)$. 新策略为 $(0.7,0.3)$ 时

$$
D_{\mathrm{KL}}(\pi_{\mathrm{old}}\|\pi)=0.6\ln\frac{0.6}{0.7}+0.4\ln\frac{0.4}{0.3}\approx-0.0925+0.1151=0.0226,
$$

超过 $0.01$, 线搜索会继续缩步长. 新策略为 $(0.65,0.35)$ 时, KL $\approx0.6\times(-0.0800)+0.4\times0.1335=0.0054$, 在约束内. 也就是说, 在这个状态上, 一次更新大约只能把某个动作的概率改变 5 到 7 个百分点.

用 §4.1 的二阶近似可以直接解出这个上限. 两动作分布把概率改动 $\Delta$ 时, $D_{\mathrm{KL}}\approx\frac12\sum_a\frac{(\Delta p_a)^2}{p_a}=\frac{\Delta^2}{2}\Bigl(\frac{1}{0.6}+\frac{1}{0.4}\Bigr)\approx2.083\,\Delta^2$. $\Delta=0.1$ 时近似值 0.0208, 精确值 0.0226; $\Delta=0.05$ 时 0.0052 对 0.0054. 令 $2.083\,\Delta^2\le0.01$, 得 $\Delta\le0.069$, 与上面的 5 到 7 个百分点一致. 旧策略越偏 (某个 $p_a$ 越小), 允许的改动越小. 旧策略为 $(0.9,0.1)$ 时系数为 $\frac12(1/0.9+1/0.1)\approx5.56$, $\Delta\le0.042$; 为 $(0.99,0.01)$ 时系数约 50.5, $\Delta\le0.014$, 那个只有 1% 的动作一次最多升到约 2.4%. 所以在单个状态上, KL 约束对小概率动作的绝对改动卡得最紧. 按倍数看则反过来: 0.01 升到 0.024 约是 2.4 倍, 0.6 升到 0.669 只有 1.12 倍, 这与 PPO 对每个样本统一限制比率 $[1-\varepsilon,1+\varepsilon]$ 的做法不同. 平均 KL 约束允许某些状态改得多一些, 另一些少一些, 只要平均值不超过 $\delta$.

### 5.3 实验: 运动控制

MuJoCo 上的三个机器人, 状态是广义位置和速度, 控制是关节力矩:

| 项 | Swimmer | Hopper | Walker |
|----|---------|--------|--------|
| 状态维度 | 10 | 12 | 正文 18, 附录 Table 2 为 20 |
| 策略参数 | 364 | 4806 | 8206 |
| 隐层宽度 | 30 | 50 | 50 |
| 每轮仿真步数 | 50K | 1M | 1M |
| 策略迭代次数 | 200 | 200 | 200 |
| vine 每轮耗时 (分钟) | 2 | 14 | 40 |
| single path 路径数 | 50 | 1000 | 10000 |
| single path 每轮耗时 (分钟) | 5 | 35 | 100 |

奖励: Swimmer 为 $r(x,u)=v_x-10^{-5}\|u\|^2$; Hopper 相同, 另加非终止状态每步 $+1$, 机器人摔倒即结束 episode; Walker 加了脚部着地冲击的惩罚, 鼓励平稳行走而非跳跃. 共同设置 $\delta=0.01$, $\gamma=0.99$. vine 每个状态 4 条 rollout, 主干 rollout 长度 1000. 策略是全连接网络输出高斯均值, 对数标准差是与状态无关的独立参数. 另有 Cart-pole, 按 Barto 等 (1983) 的设定, 用 6 个参数的线性策略, 这个规模下无梯度方法也能优化.

对照方法: CEM, CMA (无梯度); 自然梯度 (与 single path 的唯一区别是用固定罚系数代替 KL 约束, 步长按 3 倍间隔扫描, 取最终表现最好的一档); 经验 Fisher (用梯度协方差估计 Fisher); 最大 KL (只在 Cart-pole 上可解). 每种方法 5 次随机初始化, 曲线取平均.

结果: single path 和 vine 解决了全部问题, 效果最好. 自然梯度在两个较容易的任务上表现不错, 但在 Hopper 和 Walker 上学不出向前移动的步态. 这两个任务不前进也能拿到 $-1$ 分 (纵轴为 cost), 对应只学会保持站立. CEM 和 CMA 在较大问题上表现差. 论文认为这说明约束 KL 比固定罚系数更稳健. TRPO 使用通用网络和简单奖励就学会了这些步态, 而之前的运动控制方法大多依赖手工设计的、显式编码平衡和迈步的策略结构.

### 5.4 实验: Atari

与 Mnih et al. (2013) 相同的 7 个游戏和图像预处理. 策略网络: 两个 16 通道, 步长 2 的卷积层, 一个 20 单元全连接层, 共 33500 参数. 每轮 vine 约 400K 仿真步, single path 约 100K, 500 次迭代, 16 核机器上约 30 小时. 结果 (论文 Table 1, 每个任务只跑一次; 论文说明不同随机初始化之间差异很大, 由于时间限制没有误差统计):

| | B. Rider | Breakout | Enduro | Pong | Q*bert | Seaquest | S. Invaders |
|--|--|--|--|--|--|--|--|
| Random | 354 | 1.2 | 0 | $-20.4$ | 157 | 110 | 179 |
| Human | 7456 | 31.0 | 368 | $-3.0$ | 18900 | 28010 | 3690 |
| DQN | 4092 | 168.0 | 470 | 20.0 | 1952 | 1705 | 581 |
| UCC-I | 5702 | 380 | 741 | 21 | 20025 | 2995 | 692 |
| TRPO single path | 1425.2 | 10.8 | 534.6 | 20.9 | 1973.5 | 1908.6 | 568.4 |
| TRPO vine | 859.5 | 34.2 | 430.8 | 20.9 | 7732.5 | 788.4 | 450.2 |

TRPO 在 Enduro (single path 534.6 对 DQN 470), Pong, Q*bert (vine 7732.5 对 DQN 1952), Seaquest (single path 1908.6 对 1705) 上超过 DQN, 在 Beam Rider, Breakout, Space Invaders 上落后. UCC-I 结合了蒙特卡洛树搜索与监督训练. 论文的结论是, TRPO 只在部分游戏上胜过之前的方法, 但每个游戏都取得了合理的分数, 而且这是一个没有针对 Atari 专门设计的通用策略搜索方法. 附录 F 的 Atari 学习曲线纵轴是 cost (负回报).

## 6. 关系与边界

### 6.1 与其他方法的关系

论文 §7 把几种更新写成同一个模板的特例:

| 方法 | 目标 | 约束或步长 |
|------|------|-----------|
| 普通策略梯度 | $L$ 的一阶近似 | $\frac12\lVert\theta-\theta_{\mathrm{old}}\rVert^2\le\delta$ |
| 自然策略梯度 (Kakade, 2002) | $L$ 的一阶近似 | KL 二阶近似, 固定步长 $\frac1\lambda$: $\theta_{\mathrm{new}}=\theta_{\mathrm{old}}+\frac1\lambda A^{-1}\nabla L$ |
| TRPO | $L$ (线搜索时用非线性形式) | 每步强制平均 KL $\le\delta$ |
| 策略迭代 | $L$ | 无约束 |
| REPS (Peters et al., 2010) | 类似 | 约束状态–动作联合分布 $p(s,a)$, 内层要解非线性优化 |

TRPO 与自然梯度的区别看起来很小: 方向相同 ($A^{-1}g$), 一个固定步长系数, 一个每步按 $\delta$ 定步长并做线搜索. §5.3 的实验显示这个区别在 Hopper 和 Walker 上决定了能否学会行走.

与 PPO 的关系见 [04-PPO](../04-PPO/04-PPO.md). PPO 论文指出 TRPO 实现相对复杂, 且不兼容带噪声的结构 (如 dropout) 以及策略与价值共享参数的网络. PPO 保留了 $L^{\mathrm{CPI}}=\hat{\mathbb{E}}_t[r_t\hat{A}_t]$ 这个替代目标, 用比率裁剪构造悲观下界, 只需一阶优化. 两者的超参含义不同: PPO 的 $\varepsilon$ 限制每个样本的概率比, TRPO 的 $\delta$ 限制状态平均的 KL. PPO 论文也试过把 KL 作为罚项, 按目标值 $d_{\mathrm{targ}}$ (取 0.003, 0.01, 0.03) 自适应调整罚系数, 这相当于 §2.3 的罚项形式加上自动调系数; 在其连续控制对比中, 这一变体不如裁剪目标.

在 LLM 上, TRPO 的平均 KL 要在每个前缀上对整个词表计算, 再乘 10 次 CG 迭代的 Fisher–向量积和若干次线搜索前向, 成本远高于 PPO 的「同一批数据, 几个 epoch, Adam」. InstructGPT 和之后的 GRPO, GSPO 都在 PPO 这一侧.

### 6.2 失效模式与边界

| 现象 | 原因 | 说明或处理 |
|------|------|-----------|
| 按理论罚系数更新几乎不动 | $C=4\epsilon\gamma/(1-\gamma)^2$ 随 $\gamma\to1$ 急剧增大 | 改用硬约束 $\delta$, 单调改进从定理变成经验现象 |
| 个别状态上策略变化很大 | 约束的是平均 KL | 最大 KL 只在小问题上可解 |
| 线搜索连续失败 | 二阶近似在当前点很差, 或 $L$ 的样本估计噪声大 | 本轮不更新; 增大 batch 或减小 $\delta$ |
| 更新方向错误 | 优势估计有偏, 理论部分假设优势精确 | CG 解得再准, 也是沿着错误梯度的方向 |
| Fisher 矩阵病态 | 某些参数方向上 KL 几乎不变 | 加阻尼 $\lambda I$ |
| KL 方向写反 | $D_{\mathrm{KL}}(\pi_\theta\|\pi_{\mathrm{old}})$ 与论文不同 | 按式 (12) 旧策略在前 |
| 把 $\delta$ 当学习率调 | $\delta$ 的单位是 nats (平均 KL) | 与 Adam 学习率不可比 |
| vine 无法用于实体系统 | 需要从指定状态重新采样 | 只能用 single path |
| 样本只能用一次 | on-policy, 式 (14) 的期望在 $\rho_{\theta_{\mathrm{old}}}$ 下 | 每轮重新采样 |

论文在讨论中写道: 尽管实用算法偏离了理论, TRPO 往往仍给出单调改进, 超参数也很少需要调. 这句话是实验观察, 不是式 (9) 的推论; 理论保证针对的是带最大 KL 罚项的 Algorithm 1. GAE (arXiv:1506.02438) 是同一批作者之后的工作, 这篇 TRPO 用蒙特卡洛回报估计 $Q$.

## 参考文献

1. Schulman, J., Levine, S., Moritz, P., Jordan, M. I., & Abbeel, P. (2015). *Trust Region Policy Optimization*. ICML 2015. arXiv:1502.05477. https://arxiv.org/abs/1502.05477
2. Kakade, S., & Langford, J. (2002). *Approximately Optimal Approximate Reinforcement Learning*. ICML 2002.
3. Kakade, S. (2002). *A Natural Policy Gradient*. NeurIPS 2002.
4. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347. https://arxiv.org/abs/1707.06347
5. Schulman, J., Moritz, P., Levine, S., Jordan, M., & Abbeel, P. (2016). *High-Dimensional Continuous Control Using Generalized Advantage Estimation*. ICLR 2016. arXiv:1506.02438. https://arxiv.org/abs/1506.02438
6. Peters, J., Mülling, K., & Altun, Y. (2010). *Relative Entropy Policy Search*. AAAI 2010.
7. Mnih, V., et al. (2013). *Playing Atari with Deep Reinforcement Learning*. arXiv:1312.5602. https://arxiv.org/abs/1312.5602
8. Hunter, D. R., & Lange, K. (2004). *A Tutorial on MM Algorithms*. The American Statistician, 58(1), 30–37.
