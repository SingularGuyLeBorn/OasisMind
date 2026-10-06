---
title: "08 · VLA-OPD: 把 OPD 搬到机器人策略上"
published: true
tags: ["OPD", "VLA", "具身智能", "Reverse KL", "OpenVLA-OFT", "SimpleVLA-RL"]
excerpt: "VLA-OPD 让学生 VLA 在仿真里自己执行, 由冻结的 SimpleVLA-RL 教师在每个访问到的状态上给 action token 打分, 奖励取负的采样 token log-ratio, 不做组内归一化. LIBERO 上 1 条演示 SFT 的学生从 48.9% 升到 87.4%, 接 GRPO 后 93.4%; RoboTwin2.0 四个双臂任务从 45.2% 升到 71.1%."
---
# VLA-OPD: 把 OPD 搬到机器人策略上

> 相关阅读: [01 OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md) · [03 SDFT](../03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md) · [05 G-OPD](../05-GOPD-散度光谱/05-GOPD-散度光谱.md) · [07 OPD 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md) · [4.9.3 状态分布视角](../../4.9.3-状态分布视角/4.9.3-状态分布视角.md)

本文的材料是 Zhong, Yan, Li, He, Zhang, Li (港科大广州) 的 *VLA-OPD: Bridging Offline SFT and Online RL for Vision-Language-Action Models via On-Policy Distillation* (arXiv:2603.26666), 以及它直接依赖的两项工作: 提供动作 token 化方案的 OpenVLA (arXiv:2406.09246) 和提供教师的 SimpleVLA-RL (arXiv:2509.09674). 要回答的问题是: 文本 OPD 的「学生采样, 教师逐 token 打分, reverse KL」能否原样用在机器人操作策略的后训练上, 用了之后和 SFT, GRPO 比各有什么得失.

## VLA 后训练的两条路

### SFT: 稠密但 off-policy

VLA (Vision-Language-Action) 模型把视觉编码器, 语言模型和动作输出放进同一个 Transformer. 预训练后的 VLA 在具体下游任务上执行精度不够, 需要后训练. 最常见的做法是行为克隆式的 SFT, 在专家演示 $\mathcal D_{\mathrm{demo}}$ 上最大化专家动作的似然:

$$
\mathcal L_{\mathrm{SFT}}(\theta)=-\mathbb E_{(s,a)\sim\mathcal D_{\mathrm{demo}}}\bigl[\log\pi_\theta(a\mid s)\bigr] \tag{1}
$$

这里状态 $s$ 由视觉观测和语言指令组成, 动作 $a$ 是机械臂的控制量. 每个动作都有监督, 优化稳定, 收敛快. 问题在于训练状态来自专家, 部署时学生却在自己走出来的状态上做决策. 机械臂一步执行偏差, 下一帧画面就是专家数据里没有的样子, 偏差会累积. 论文还把灾难性遗忘归到 SFT 头上: 在固定的, 与预训练分布不相交的数据集上做大幅参数更新, 会覆盖掉预训练时学到的通用能力 (论文 §1 引用了 Chu 等 2025 的「SFT 记忆, RL 泛化」与 Shenfeld 等 2025 的「RL's Razor」).

**GRPO: on-policy 但稀疏**

另一条路是在线 RL. VLA 上目前主流的是 GRPO, 原因是它用组内相对归一化算优势, 不需要价值网络, 省掉了在 7B 骨干上再挂一个 critic 的显存. 对一个初始状态, 策略采样 $G$ 条轨迹, 目标是

$$
\mathcal J_{\mathrm{RL}}(\theta)=\mathbb E\Bigl[\frac1G\sum_{i=1}^{G}\min\Bigl(\frac{\pi_\theta(\tau_i)}{\pi_{\theta_{\mathrm{old}}}(\tau_i)}\hat A_i,\ \mathrm{clip}\Bigl(\frac{\pi_\theta(\tau_i)}{\pi_{\theta_{\mathrm{old}}}(\tau_i)},1-\epsilon,1+\epsilon\Bigr)\hat A_i\Bigr)\Bigr] \tag{2}
$$

$\hat A_i$ 由二值结果奖励 $R(\tau)\in\{0,1\}$ 相对组均值算出. 机器人任务一般只在结束时告诉你成没成, 一条几百步的轨迹只有一个比特的反馈, 优化方差大, 样本效率低.

SimpleVLA-RL 是这条路的代表, 也是 VLA-OPD 的教师. 它在 OpenVLA-OFT 上做 GRPO, 奖励就是任务成功记 1, 失败记 0, 均匀分给轨迹里所有 action token. 为了让探索够用, 它做了三处改动: 动态采样, 只保留组内有成有败的组 ($0<$ 成功条数 $<G$), 否则组内优势全为 0; 裁剪上界从 1.2 放宽到 1.28; rollout 温度从 1.0 提到 1.6. 同时去掉了对参考模型的 KL 惩罚. 硬件是 8 张 A800, 学习率 $5\times10^{-6}$, batch 64, 每题采 8 条.

### 稀疏奖励的门槛

SimpleVLA-RL 自己在 §6.2 报告了这条路的失败条件. 在 RoboTwin2.0 的五个任务上, 它比较了三种起点: 不做任务 SFT 的 OpenVLA-OFT, 每任务 100 条演示 SFT, 每任务 1,000 条演示 SFT, 之后都在 1,000 个训练场景上做 RL.

| 起点 | Move Can Pot | Place A2B Left | Place A2B Right | Place Phone Stand | Pick Dual Bottles | 平均 |
|------|-------------|---------------|----------------|------------------|------------------|-----|
| 0 条 SFT | 0 | 0 | 0 | 0 | 0 | 0 |
| + RL | 0 | 0 | 0 | 0 | 0 | 0 |
| 100 条 SFT | 9.4 | 7.8 | 7.8 | 10.1 | 1.2 | 7.3 |
| + RL | 51.6 | 25.0 | 27.2 | 18.8 | 4.3 | 25.4 |
| 1000 条 SFT | 28.1 | 37.5 | 28.7 | 17.1 | 29.7 | 28.2 |
| + RL | 61.2 | 45.3 | 37.5 | 39.6 | 68.3 | 50.4 |

起点为 0 时, 采样里没有一条成功轨迹, 每条轨迹奖励都是 0, 组内优势全为 0, RL 一步也动不了. 起点很低时也只有边际收益: Pick Dual Bottles 从 1.2% 只升到 4.3%, 而从 29.7% 出发能升到 68.3%. SimpleVLA-RL 的结论是 RL 有一个初始能力门槛, 低于门槛探索无效.

OPD 的奖励式 (5) 不看任务成没成, 只看学生与教师在每个 action token 上的概率差, 一条完全失败的轨迹也能给出逐 token 的信号. 从式子上看, 稀疏奖励的这个门槛不约束 OPD. VLA-OPD 的实验都从 1 条或 1,000 条演示 SFT 的学生出发, 没有测试零成功率起点.

SimpleVLA-RL 还报告了一个现象, 它称为 pushcut: RoboTwin2.0 的 Move Can Pot 任务里, 所有演示都是「抓起, 移动, 放下」, RL 之后模型学会了直接把罐子推到目标位置; Place A2B 任务里也出现了把物体 A 推到 B 旁边的做法. 结果奖励对抓和推一视同仁, 演示里没有的策略才有机会被强化. VLA-OPD 用这样的模型当教师, 学生在 on-policy 状态上拟合的是教师的动作分布, 不受演示里只有「抓」的限制. VLA-OPD 没有单独分析学生是否学到了 pushcut.

### VLA-OPD 想要的组合

论文 Table 1 用五个维度对比三种范式:

| 范式 | 采样 | 信号 | 少量演示 | 收敛 | 抗遗忘 | 鲁棒性 |
|------|-----|------|---------|------|-------|-------|
| 离线 SFT | off-policy | 稠密 | 否 | 快 | 否 | 否 |
| 在线 RL | on-policy | 稀疏 | 是 | 慢 | 是 | 是 |
| VLA-OPD | on-policy | 稠密 | 是 | 快 | 是 | 是 |

在 on-policy 状态上做 SFT 并不新, DAgger 一类交互式模仿学习就是让专家在学生走到的状态上标注动作. 论文的论点是这类方法选的对齐目标不对: 用专家的 argmax 动作做交叉熵 (论文称 Hard-CE) 会让学生熵过早坍缩, 用专家的软分布做 forward KL 会让学生在教师拿不准的状态上跟着变得犹豫. VLA-OPD 的改动集中在目标函数上, 换成 reverse KL.

论文 §1 还给了另一层动机: 把 RL 的探索和学生的优化拆开. 探索的成本由训练教师的那一次 RL 承担, 之后要换新的学生骨干, 升级模型, 或把多个单任务教师并进一个通用学生, 都只需要跑蒸馏, 不必在每个新学生上从头做稀疏奖励 RL. 论文的实验里学生与教师是同一种 OpenVLA-OFT, 这个跨骨干迁移的用法停留在动机层面.

## 动作怎么变成 token

### OpenVLA 的分桶

文本 OPD 的 reverse KL 能直接算, 是因为学生和教师在每个位置都输出同一个词表上的 categorical 分布. 机器人动作是连续量, 要先交代 VLA-OPD 里的「动作分布」是什么, 这要从 OpenVLA 的离散化说起.

OpenVLA 在 Prismatic-7B (SigLIP 与 DINOv2 双视觉编码器, 2 层 MLP 投影, Llama 2 7B) 上训练, 用了 Open X-Embodiment 的 970k 条机器人轨迹. 它沿用 RT-2 的做法, 把每个动作维度单独离散成 256 个桶: 桶宽取训练数据里该维度第 1 到第 99 百分位之间的区间均分. 用分位数而不用最小最大值, 是为了让少数离群动作不把区间撑大, 降低有效分辨率. 一个 $N$ 维动作因此变成 $N$ 个 $[0,255]$ 内的整数. Llama 的分词器只预留了 100 个特殊 token, 不够 256 个, OpenVLA 直接覆盖词表中最少使用的 256 个 token (即最终 256 个), 然后按普通的下一个 token 预测训练, 交叉熵只算在动作 token 上.

以末端位移的一维为例, 若训练数据的 1% 与 99% 分位分别是 $-1$ 与 $1$ (已归一化), 桶宽为 $2/256\approx0.0078$. 学生在这一维上的「动作分布」就是 256 个桶上的 softmax.

**SimpleVLA-RL 的 OpenVLA-OFT 变体**

OpenVLA-OFT 在 OpenVLA 上加了动作分块 (action chunking) 与并行解码, 官方版本用 MLP 输出连续动作, 以 L1 回归训练. SimpleVLA-RL 指出 VLA 的动作解码有三类: 像 LLM 一样输出动作 token 分布, 在隐状态上做扩散去噪, 用 MLP 做确定性回归; 其中只有 token 方式自然提供随机采样和策略梯度需要的概率. 所以 SimpleVLA-RL 改用 LLaMA2 的输出头生成动作 token, 以交叉熵训练, 只用单视角图像, 语言指令和本体状态 (LIBERO 上不用本体状态), 并从头重做了 SFT. 动作 token 共 256 个, 动作块长度在 LIBERO 上是 8, 在 RoboTwin 上是 25. 按 SimpleVLA-RL §2.2 的记法, 动作 $a_t\in\mathbb R^d$ 一般是末端增量或关节目标, 典型的 $d=7$ (6 自由度位姿加夹爪). rollout 时模型一次输出长为 $k$ 的动作块, 机器人依次执行完, 环境按物理动力学给出新观测, 模型再以新观测为输入生成下一块, 直到任务完成或达到最大步数.

VLA-OPD 的学生和教师都是这种 token 化的 OpenVLA-OFT. 于是每个动作 token 上, 学生 $\pi_\theta(\cdot\mid s_t)$ 与教师 $\pi_{\mathrm{tea}}(\cdot\mid s_t)$ 都是 256 个桶上的离散分布, 文本 OPD 的式子可以逐项照搬. 扩散策略与流匹配策略 (如 $\pi_0$) 没有逐 token 的显式概率, 不在这套方法的适用范围内.

**方法**

### 三个阶段

论文 Algorithm 1 的循环如下. 学生 $\pi_\theta$ 从 1 条演示的 SFT 初始化, 教师 $\pi_{\mathrm{tea}}$ 冻结.

1. **学生采样**. 对 batch 里每个任务指令, 用当前学生在环境中执行出 $G$ 条轨迹. 状态按学生诱导的分布 $d^{\pi_{\theta_k}}$ 产生:
   $$
   \mathcal D_k=\{\tau=(s_0,a_0,s_1,a_1,\dots,s_T)\},\quad a_t\sim\pi_{\theta_k}(\cdot\mid s_t),\ s_{t+1}\sim\mathcal P(\cdot\mid s_t,a_t) \tag{3}
   $$
   初始化的学生只看过一条演示, 很快就会偏离专家路径, 这些偏离后的状态正是要采集的.
2. **教师打标**. 对学生访问过的每个状态, 查询教师的动作 logits, $q_t(a)=\pi_{\mathrm{tea}}(a\mid s_t)$. 教师只打分, 不在环境里执行.
3. **学生更新**. 按下面的奖励做策略梯度.

算法开头说明的初始化之后, 静态演示数据就不再使用.

**目标, 奖励与每步开销**

在学生访问的状态上最大化负 reverse KL:

$$
\max_\theta\mathcal J(\theta)=\mathbb E_{s\sim\pi_\theta}\bigl[-D_{\mathrm{KL}}(\pi_\theta(\cdot\mid s)\,\|\,\pi_{\mathrm{tea}}(\cdot\mid s))\bigr] \tag{4}
$$

逐 token 的内在奖励是负的采样 token log-ratio:

$$
r_t^{\mathrm{OPD}}(s_t,a_t)=-\bigl(\log\pi_\theta(a_t\mid s_t)-\log\pi_{\mathrm{tea}}(a_t\mid s_t)\bigr) \tag{5}
$$

学生给采样到的桶的概率与教师越接近, 奖励越接近 0; 学生比教师自信得多时, 奖励是大的负数. 计算梯度时, 奖励里学生的 log 概率不回传梯度 (论文写作 `stop_gradient`). 梯度在组内平均:

$$
\nabla_\theta\mathcal J(\theta)\approx\frac1G\sum_{i=1}^{G}\sum_{t=0}^{T}\nabla_\theta\log\pi_\theta(a_{t,i}\mid s_{t,i})\cdot r_t^{\mathrm{OPD}}(s_{t,i},a_{t,i}) \tag{6}
$$

与式 (2) 相比有三处不同. 奖励从轨迹级的 0/1 变成每个 action token 一个实数; 不做组内的均值方差归一化, 直接拿原始的 reverse KL 奖励当优势; 式 (6) 里没有重要性比和裁剪, 是纯 on-policy 的 REINFORCE 形式. 分组的作用只剩下用 $G$ 条轨迹平均环境随机性, 降低梯度方差.

不归一化有一个直接的理由. 在单个状态上, 对学生采样的动作取期望, 并利用 $\mathbb E_{a\sim\pi_\theta}[\nabla_\theta\log\pi_\theta(a\mid s)]=0$, 有

$$
\mathbb E_{a\sim\pi_\theta}\bigl[\nabla_\theta\log\pi_\theta(a\mid s)\,r^{\mathrm{OPD}}(s,a)\bigr]=-\nabla_\theta D_{\mathrm{KL}}\bigl(\pi_\theta(\cdot\mid s)\,\|\,\pi_{\mathrm{tea}}(\cdot\mid s)\bigr) \tag{7}
$$

即式 (6) 是 reverse KL 梯度的无偏估计 (只差状态分布随 $\theta$ 变化的那一项). 减去组内均值相当于加基线, 不改变期望; 再除以组内标准差就会按组改变步长, KL 已经很小的组反而被放大. 论文的说法是用原始奖励当优势, 保证一致地收敛到教师的主模式.

这一套与 [01](../01-OPD基础原理/01-OPD基础原理.md) 里文本 OPD 的 sampled-token 版本是同一个式子, 区别只在 rollout: 文本 OPD 的下一个状态由学生自己生成的 token 决定, VLA-OPD 的下一个状态由仿真器的物理动力学决定, 采样要等环境一步一步执行.

环境要逐步执行, 开销就值得算一笔. 用 SimpleVLA-RL 的超参可以估一下一个训练步要做多少次前向. batch 64, 每题 8 条, 一步共 512 条轨迹. LIBERO 的最大环境步数是 512, 动作块长度 8, 一条轨迹最多调用学生 $512/8=64$ 次; OpenVLA-OFT 并行解码, 一次前向给出整个动作块的 token. 教师打分只需要在已采样的状态上各做一次前向, 不必自回归, 次数与学生相同, 也可以在 rollout 结束后批量做. 所以 VLA-OPD 相对 GRPO 多出来的成本是同等次数的教师前向, 环境交互次数不变. 两者的差别在于每次交互换来的信号: GRPO 一条轨迹一个 0/1, VLA-OPD 每个 action token 一个实数.

**三种对齐目标**

论文 §3.4 比较了 on-policy 设定下的三种目标. 记某个状态上学生分布为 $p$, 教师分布为 $q$, 桶下标为 $k$.

- **Forward KL** $D_{\mathrm{KL}}(q\|p)$: 论文称为 teacher-forced, 状态仍来自学生, 但动作上的期望在教师分布下取, 学生要覆盖教师所有有质量的桶. 论文的说法是, 在学生走到的 OOD 状态上教师分布平而高熵, forward KL 让学生模仿这种犹豫, 熵爆炸.
- **Hard-CE**: 对教师的 top-1 桶做交叉熵, 即标准 DAgger 的做法. 丢掉了教师的软概率. 在多个动作都可行的决策边界上, 教师的 argmax 会来回跳, 学生被迫跟着硬目标跑, 熵过早坍缩, 失去探索需要的多样性.
- **Reverse KL** $D_{\mathrm{KL}}(p\|q)$: 只要学生选的桶落在教师认可的质量里, 不会因为忽略其他可行动作而受罚. 论文称之为有界的 mode-seeking.

### 一个四桶的例子

论文没有给数值, 下面用一个四桶的状态把三种目标对学生 logits 的梯度算出来. 设教师在一个 OOD 状态上拿不准, 学生已经很自信:

$$
q=(0.30,\ 0.30,\ 0.20,\ 0.20),\qquad p=(0.85,\ 0.05,\ 0.05,\ 0.05)
$$

教师熵 $H(q)\approx1.366$ nats, 学生熵 $H(p)\approx0.588$ nats. 两个方向的 KL:

$$
D_{\mathrm{KL}}(p\|q)=0.85\ln\tfrac{0.85}{0.30}+0.05\ln\tfrac{0.05}{0.30}+2\times0.05\ln\tfrac{0.05}{0.20}\approx0.885-0.090-0.139=0.657
$$

$$
D_{\mathrm{KL}}(q\|p)=0.30\ln\tfrac{0.30}{0.85}+0.30\ln\tfrac{0.30}{0.05}+2\times0.20\ln\tfrac{0.20}{0.05}\approx-0.312+0.538+0.555=0.780
$$

对 softmax logits $z_k$ 求梯度. Forward KL 的梯度是 $\partial D_{\mathrm{KL}}(q\|p)/\partial z_k=p_k-q_k$; reverse KL 的梯度是 $\partial D_{\mathrm{KL}}(p\|q)/\partial z_k=p_k\bigl(\ln\frac{p_k}{q_k}-D_{\mathrm{KL}}(p\|q)\bigr)$; 对教师 argmax 的 Hard-CE 梯度是 $p_k-\mathbf 1[k=k^*]$.

| 桶 | $p_k$ | $q_k$ | forward KL | reverse KL | Hard-CE ($k^*=1$) | Hard-CE ($k^*=2$) |
|----|------|------|-----------|-----------|------------------|------------------|
| 1 | 0.85 | 0.30 | +0.550 | +0.327 | −0.150 | +0.850 |
| 2 | 0.05 | 0.30 | −0.250 | −0.122 | +0.050 | −0.950 |
| 3 | 0.05 | 0.20 | −0.150 | −0.102 | +0.050 | +0.050 |
| 4 | 0.05 | 0.20 | −0.150 | −0.102 | +0.050 | +0.050 |

梯度下降取负方向. 读这张表有三点:

1. **单个状态上两种 KL 的终点相同**. 学生分布可以任意取时, 两个方向的最小点都是 $p=q$, 都会把学生熵往 1.366 推. 区别在路径和受限情形.
2. **reverse KL 的推力按学生自己的概率缩放**. 对学生几乎不选的桶 2-4, reverse KL 的梯度乘了 $p_k=0.05$, 幅度约为 forward KL 的一半到三分之二; 实际训练里用的是式 (5) 的 sampled-token 版本, 学生没采到的桶这一步根本没有信号. 学生参数在各个状态之间共享, 不能在每个状态上都精确等于教师时, 这种缩放决定了学生把质量留在哪里: forward KL 要求凡是 $q_k>0$ 的桶都分到质量, reverse KL 允许学生在教师的低质量尾部保持接近 0. 论文说的「过滤教师的尾部不确定性」指的就是这一点.
3. **Hard-CE 的目标不连续**. 桶 1 和桶 2 在教师下并列第一. argmax 取 1 时学生被继续推向桶 1, 取 2 时被推向桶 2, 两种情况下的目标都是 one-hot, 学生熵都往 0 走. 教师在两个桶之间稍有波动, 学生的目标就整块换掉.

## 实验

### 设置

- **LIBERO**: 单臂操作, 用 Spatial, Object, Goal, Long 四个套件, 每个套件 10 个任务. 学生用每个任务 1 条演示做 SFT (即每个套件 10 条), 模拟极度缺数据.
- **RoboTwin2.0**: 双臂协作, 选四个任务, 按 SimpleVLA-RL 的划分属于短, 中, 长三档 (Pick Dual Bottles 127 步, Place Empty Cup 174 步, Handover Block 283 步, Stack Bowls Two 313 步). 学生用每个任务 1,000 条演示做单任务 SFT.
- 两个基准的细节按 SimpleVLA-RL §4.1: LIBERO 每个任务在 50 个留出场景上算成功率; RoboTwin2.0 共 50 个双臂任务, 731 个物体实例, 对杂物, 光照, 背景, 桌面高度和语言指令做域随机化, 用 Agilex Piper 机械臂, 每个任务在 100 个留出场景上评测. 评测用贪心解码.
- **教师**: SimpleVLA-RL. **基线**: SFT 初始化的学生 (下界), 稀疏奖励的 GRPO, 在全量演示上 SFT 的模型.
- 主实验按 SimpleVLA-RL 设 batch 64, $G=8$. 两种变体: Distill 只做蒸馏, Distill + GRPO 在蒸馏后的模型上再做 GRPO.

两个基准的起点并不对称. LIBERO 上学生每任务只看 1 条演示, 初始化后的成功率 (48.9%) 与 SimpleVLA-RL Table 5 的 One-Trajectory SFT 一致; RoboTwin2.0 上用 1,000 条演示, 初始化数字与 SimpleVLA-RL Table 4 一致. 前者测的是演示极少时蒸馏能补多少, 后者从 1.3 节表里「1000 条 SFT」那一档出发, 与 SimpleVLA-RL 的 RL 结果直接可比. 两边都没有从零成功率出发, 所以 1.3 节说的稀疏奖励门槛, 在这组实验里没有被正面检验.

**LIBERO: 收敛速度与成功率 (Figure 2, Table 2)**

Figure 2 对比训练曲线. LIBERO-Object 上蒸馏在 10 步内超过 90% 成功率, GRPO 是逐步爬升; LIBERO-Long 上蒸馏 50 步达到接近 80%, 与 GRPO 150 步以上的水平相当, 论文称为 3 倍加速. GRPO 的曲线在 LIBERO-Long 上来回震荡, 蒸馏曲线平滑. 蒸馏之后再接 GRPO, Object 超过 95%, Long 超过 90%. 最终成功率见 Table 2:

| 方法 | 数据 | Spatial | Object | Goal | Long | 平均 |
|------|-----|---------|--------|------|------|-----|
| SimpleVLA-RL (教师) | | 94.2 | 96.1 | 94.6 | 90.7 | 93.9 |
| Octo | 每任务 50 条 | 78.9 | 85.7 | 84.6 | 51.1 | 75.1 |
| OpenVLA | 每任务 50 条 | 84.7 | 88.4 | 79.2 | 53.7 | 76.5 |
| Nora | 每任务 50 条 | 92.2 | 95.4 | 89.4 | 74.6 | 87.9 |
| $\pi_0$ + FAST | 每任务 50 条 | 96.4 | 96.8 | 88.6 | 60.2 | 85.5 |
| OpenVLA-OFT (学生初始化) | 每任务 1 条 | 63.6 | 54.9 | 59.6 | 17.3 | 48.9 |
| VLA-OPD (Distill) | 每任务 1 条 | 84.3 | 93.8 | 92.5 | 78.9 | 87.4 |
| VLA-OPD (Distill + GRPO) | 每任务 1 条 | 93.4 | 95.3 | 94.5 | 90.2 | 93.4 |

只蒸馏就把平均成功率从 48.9% 拉到 87.4%, 高于用 50 倍数据 SFT 的 Octo 和 OpenVLA, 与 Nora 相近. 涨幅最大的是 LIBERO-Long, 17.3% 到 78.9%, 长任务里偏离专家路径的机会最多, on-policy 状态上的纠正最有用. 再接 GRPO 到 93.4%, 离教师 0.5 个点.

这张表可以和 SimpleVLA-RL 原文对照. 学生初始化那一行 (63.6, 54.9, 59.6, 17.3, 48.9) 与 SimpleVLA-RL Table 5 的 One-Trajectory SFT 完全一致. SimpleVLA-RL 原文里, 同样从 1 条演示 SFT 出发直接做 GRPO, 平均是 96.9%; 从全量演示 SFT 出发做 GRPO, 平均是 99.1%. VLA-OPD 表中教师一行的 93.9% 低于这两个数, 论文没有说明教师用的是哪个检查点, 也没有说明评测设置是否与 SimpleVLA-RL 相同. 所以「接近教师」这个结论是相对 VLA-OPD 自己评测的教师而言.

把两篇的数字放在同一起点上看: 从 1 条演示 SFT 的 48.9% 出发, SimpleVLA-RL 直接做 GRPO 到 96.9%, VLA-OPD 先蒸馏再 GRPO 到 93.4%. 两者的训练步数与评测口径不同, 不能直接比最终精度. VLA-OPD 主张的是训练步数上的优势 (Figure 2 的 3 倍), 不是最终成功率超过 RL. 它的 Distill 一行只用了教师信号, 没有环境奖励, 这一行和学生初始化的差距 (平均 +38.5) 才是蒸馏本身的贡献.

### RoboTwin2.0 结果 (Table 3)

| 方法 | Pick Dual Bottles | Place Empty Cup | Handover Block | Stack Bowls Two | 平均 |
|------|------------------|----------------|---------------|----------------|-----|
| SimpleVLA-RL (教师) | 68.3 | 94.2 | 57.8 | 75.8 | 74.0 |
| $\pi_0$ | 50.0 | 60.0 | 39.0 | 53.0 | 50.5 |
| RDT | 18.0 | 42.0 | 26.0 | 42.0 | 32.0 |
| OpenVLA-OFT (学生初始化) | 29.7 | 77.3 | 33.1 | 40.6 | 45.2 |
| VLA-OPD (Distill) | 66.4 | 90.6 | 52.3 | 75.0 | 71.1 |

这里教师和学生初始化的数字都与 SimpleVLA-RL Table 4 的对应任务一致. 蒸馏后平均 71.1%, 离教师 2.9 个点. 两个长任务上提升最多: Stack Bowls Two 从 40.6% 到 75.0%, Handover Block 从 33.1% 到 52.3%.

**遗忘 (Figure 3)**

在目标 (seen) 任务上微调, 在四个留出的 unseen 任务 (两个 Object, 两个 Spatial) 上评测, 每个检查点画一个点, 横轴 seen 成功率, 纵轴 unseen 成功率. 离线 SFT 的 seen 成功率越高, unseen 越差, Object 的两个 unseen 任务掉到接近 0, Spatial 也明显下降. 用 on-policy 数据的 RL 和 VLA-OPD 基本没有这种塌陷; VLA-OPD 在 Object 任务 1 上保留得最好, 在 Object 任务 2 上与 RL 相当, 在 Spatial 任务上保留程度与 RL 接近.

SimpleVLA-RL §5.2 做过设置相近的实验, 可以作为 RL 一侧的参照: 在 Spatial, Object, Goal 三个套件上各留一个任务不训, 从 1 条演示 SFT 的模型出发, SFT 一路用 9 个可见任务的全部 450 条演示继续训, RL 一路做 SimpleVLA-RL. 两路在可见任务上都超过 90%. LIBERO-Goal 的三个 unseen 任务上 SFT 训练一开始就掉到 0%, RL 反而涨了 5% 到 15%; LIBERO-Spatial 的 unseen 任务 1 上 SFT 掉 10 个点, RL 从 43.3% 升到 71.8%. VLA-OPD 的结果说明, 把稀疏奖励换成教师的逐 token 信号后, on-policy 数据带来的这一部分好处还在.

论文的解释是梯度只在学生自己会访问的轨迹上计算, 更新留在学生当前行为的邻域里. 这与 [03 SDFT](../03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md) 讨论的 on-policy 数据减少遗忘是同一类现象.

### 消融

消融固定 batch 32.

**对齐目标** (Figure 4, RoboTwin2.0 的 Beat Block Hammer 任务). reverse KL 的成功率稳步上升. forward KL 训练早期成功率下跌超过 50%, 论文称为 performance valley; 同期 actor 熵暴涨. Hard-CE 恢复不起来, 停在三者中最低的水平, 熵过早坍缩. reverse KL 的熵保持在两者之间.

**组大小** (Figure 5, LIBERO-Object, $G\in\{2,4,8\}$). $G=8$ 最平滑, 最终约 89%; $G=2$ 也稳定升到 80% 以上, 没有崩. 环境 rollout 和教师推理是主要开销, $G$ 小一些能明显省时间.

## 与文本 OPD 的对应及局限

### 与文本 OPD 的对应

| | 文本 OPD | VLA-OPD |
|---|---------|---------|
| 状态 $s_t$ | 提示加已生成的 token 前缀 | 当前图像, 语言指令 (加本体状态) |
| 动作 | 词表上的一个 token | 一个动作维度上 256 个桶之一, 按动作块输出 |
| 状态转移 | 把学生 token 拼到前缀后 | 仿真器执行动作块后的新观测 |
| 教师输入 | 与学生相同的前缀 | 与学生相同的状态 |
| 奖励 | $\log\pi_T(y_t)-\log\pi_\theta(y_t)$ | 式 (5), 同形 |
| 梯度 | 常见实现带 PPO 裁剪 | 式 (6), 无重要性比, 无裁剪, 无组内归一化 |
| 主要成本 | 教师前向 | 环境 rollout 加教师前向 |

教师与学生看到的输入相同, 两者都是 token 化的 OpenVLA-OFT. VLA-OPD 的贡献不在把 KL 推广到连续分布, 而在验证文本 OPD 的配方在离散化后的机器人动作上照样成立, 并且在 on-policy 模仿学习里, 目标函数的方向会决定训练会不会塌.

### 局限

方法层面的限制来自教师和动作表示. VLA-OPD 需要一个已经训好的教师, 而教师 SimpleVLA-RL 本身就是用稀疏奖励 RL 训出来的, 训练教师的探索成本并没有消失, 只是从学生身上挪走了. 论文的立场是强教师越来越容易拿到 (开源检查点, API, 单任务策略), 并把减少对特定教师的依赖列为后续工作. 实验里教师与学生同构, 两边都是 token 化的 OpenVLA-OFT, 共享动作分桶; 换成不同骨干的学生时, 两边的动作 token 必须对齐到同一套桶上, 式 (5) 才有意义, 论文没有做跨骨干的实验. 扩散和流匹配动作头没有逐 token 概率, 式 (5) 算不出来, 这类策略不在适用范围内.

实验层面的限制在覆盖面和口径. LIBERO 与 RoboTwin2.0 都是仿真基准, 没有真机实验, rollout 在真机上的时间成本会让 on-policy 采样贵得多. 第 4.2 节提到, LIBERO 上教师一行与 SimpleVLA-RL 原文的数字不一致, 论文没有交代原因. RoboTwin2.0 的 Table 3 没有 Distill + GRPO 一行, 双臂任务上蒸馏后再接 RL 能否追平教师没有数据. 消融范围也小: 对齐目标只在一个 RoboTwin 任务上比较, 组大小只在 LIBERO-Object 上扫, 遗忘分析只用了四个 unseen 任务.

**参考文献**

1. Zhong, Z., Yan, H., Li, J., He, J., Zhang, T., & Li, H. (2026). [VLA-OPD: Bridging Offline SFT and Online RL for Vision-Language-Action Models via On-Policy Distillation.](https://arxiv.org/abs/2603.26666) *arXiv:2603.26666*. §2-4, Algorithm 1, Table 1-3, Figure 2-5. 项目页: [irpn-lab.github.io/VLA-OPD](https://irpn-lab.github.io/VLA-OPD/).
2. Li, H., Zuo, Y., Yu, J., et al. (2025). [SimpleVLA-RL: Scaling VLA Training via Reinforcement Learning.](https://arxiv.org/abs/2509.09674) *arXiv:2509.09674*. §3, §4.1, Table 1, 4, 5.
3. Kim, M. J., Pertsch, K., Karamcheti, S., et al. (2024). [OpenVLA: An Open-Source Vision-Language-Action Model.](https://arxiv.org/abs/2406.09246) *arXiv:2406.09246*. §3.2 动作离散化.
4. Kim, M. J., Finn, C., & Liang, P. (2025). [Fine-Tuning Vision-Language-Action Models: Optimizing Speed and Success.](https://arxiv.org/abs/2502.19645) *arXiv:2502.19645*.
5. Zitkovich, B., Yu, T., Xu, S., et al. (2023). [RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control.](https://arxiv.org/abs/2307.15818) *CoRL*.
6. Liu, B., Zhu, Y., Gao, C., et al. (2023). [LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning.](https://arxiv.org/abs/2306.03310) *NeurIPS*.
7. Chen, T., Chen, Z., Chen, B., et al. (2025). [RoboTwin 2.0: A Scalable Data Generator and Benchmark with Strong Domain Randomization for Robust Bimanual Robotic Manipulation.](https://arxiv.org/abs/2506.18088) *arXiv:2506.18088*.
8. Kelly, M., Sidrane, C., Driggs-Campbell, K., & Kochenderfer, M. J. (2019). HG-DAgger: Interactive Imitation Learning with Human Experts. *ICRA*.
9. Gu, Y., Dong, L., Wei, F., & Huang, M. (2024). [MiniLLM: Knowledge Distillation of Large Language Models.](https://arxiv.org/abs/2306.08543) *ICLR*.
10. Shenfeld, I., Pari, J., & Agrawal, P. (2025). [RL's Razor: Why Online Reinforcement Learning Forgets Less.](https://arxiv.org/abs/2509.04259) *arXiv:2509.04259*.
