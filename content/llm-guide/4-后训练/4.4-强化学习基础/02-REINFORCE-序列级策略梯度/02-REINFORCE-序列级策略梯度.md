---
title: "02 · REINFORCE: 序列级策略梯度"
published: true
tags: ["REINFORCE", "RLHF", "PPO", "RLOO", "RAFT", "Williams"]
excerpt: "序列级 REINFORCE 把整段回复当成一个动作, 用写完后才得到的奖励标量乘整段的 ∇log π, 再减去历史奖励的滑动平均做基线. Ahmadian 等 (ACL 2024) 在 TL;DR 和 Anthropic-HH 上发现, 这种不建价值网络的做法胜率不低于按 token 建模的 Vanilla PG, 并明显高于 PPO."
---

# REINFORCE: 序列级策略梯度

> 相关阅读: [04 PPO](../04-PPO/04-PPO.md) · [05 RLOO](../05-RLOO-留一法基线/05-RLOO-留一法基线.md) · [4.7.2 RAFT](../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md) · [4.5 GRPO](../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) · [ReMax](../06-ReMax-贪婪基线/06-ReMax-贪婪基线.md) · [4.7.1 RLAIF](../../4.7-AI反馈与奖励过优化/4.7.1-RLAIF/4.7.1-RLAIF.md)

材料是 Williams (1992) 的 REINFORCE 估计器, 以及 Ahmadian 等的 *Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs* (ACL 2024, arXiv:2402.14740) 中的序列级用法. 问题是 RLHF 的第三阶段能否把整段回复当成一个动作, 只用一个简单的基线, 不要价值网络.

## 1. 奖励只在写完时出现

### 1.1 KL 塑形的目标

RLHF 第三阶段最大化带 KL 惩罚的奖励. Ahmadian 等把塑形后的序列奖励写成

$$
R(x,y)=r_\phi(x,y)-\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}
\tag{1}
$$

$r_\phi$ 是奖励模型, $\beta$ 控制策略离参考模型多远. 没有这一项, 一味抬高 $r_\phi$ 会让生成失去连贯性. 各方法在目标上一致, 区别在怎样估计 $\nabla_\theta\mathbb{E}[R]$.

### 1.2 token 级 MDP 里大部分奖励是空的

PPO 把每个 token 当作动作, 把 prompt 加已生成部分 $s_t=\{y_{<t},x\}$ 当作状态, 优势用 GAE 估计, 需要一个价值网络. 论文指出, LLM 的 RLHF 中 $r(x,y)$ 只记在最后一个 token 上, 其余 token 的 $R_t$ 只由 $\log\frac{\pi(y_t\mid s_t)}{\pi_{\mathrm{ref}}(y_t\mid s_t)}$ 组成, 论文称之为没有意义的奖励.

环境转移也是确定的: $P(\{y_{<t+1},x\}\mid s_t,y_t)=1$, 写下 $y_t$ 之后下一个状态就是拼上这个 token. 论文据此把问题化为 bandit: MDP 只剩由 prompt 决定的初始状态和生成结束后必然到达的终止状态. 这种看法在神经机器翻译里已有先例 (Kreutzer 等 2017; Nguyen 等 2017). 论文还指出, RAFT 一类迭代微调方法先生成整段再用奖励模型过滤, 实际上也隐式地把整段当作一个动作.

PPO 的代价也在这里. 它需要训练中的策略, 估 KL 用的参考模型, 奖励模型, 再加一个价值网络; 价值网络通常和策略同规模. 论文摘要说 PPO 计算开销大, 超参数敏感, 而促成 PPO 设计的那些动机在 RLHF 里并不那么要紧.

### 1.3 PPO 的设计前提

论文 §2.1 写出 RLHF 中 PPO 的具体形式: 折扣 $\gamma=1$, 序列奖励拆成逐 token 的塑形奖励之和 $R(x,y)=\sum_{t=1}^{T}R_t(x,y_t)$, 其中只有最后一个 token 带奖励模型的分数, 其余只有 KL 项. 更新用 token 级的裁剪目标 $\min\bigl(f\hat{A}_\lambda,\ \mathrm{clip}_{1-\epsilon}^{1+\epsilon}(f)\hat{A}_\lambda\bigr)$, $f=\pi_\theta(y_t\mid s_t)/\pi_{\mathrm{old}}(y_t\mid s_t)$, $\hat{A}_\lambda$ 由 GAE 给出.

这套设计有两个前提. 一是方差: Actor-Critic 算法 (包括 PPO) 为降低轨迹回报估计的方差, 从状态价值函数自举, 代价是在估计器里引入偏差, 有优化有偏奖励的风险. 二是稳定: PPO 强调迭代之间的稳定, 以小而稳的更新为前提, 针对的是离策略梯度大到足以引起不稳定的情形. 论文认为这两种情形主导了传统 Deep-RL 基准 (Engstrom 等 2020; Schulman 等 2017), 而对预训练 LLM 做 RLHF 并不具备这些特征: 策略的初始化远离随机参数, 概率质量集中在少数 token 上, 传统 Deep-RL 那种强正则在这里不那么必要. 第 4.3 节是这两个判断的实验依据.

## 2. REINFORCE 估计器

### 2.1 对数导数

把整段 $y$ 当成一个动作, 目标是 $J(\theta)=\mathbb{E}_{y\sim\pi_\theta(\cdot\mid x)}[R(x,y)]$. 对离散的 $y$ 求和展开再求导, 用 $\nabla_\theta\pi_\theta=\pi_\theta\nabla_\theta\log\pi_\theta$:

$$
\nabla_\theta J(\theta)=\sum_y R(x,y)\,\nabla_\theta\pi_\theta(y\mid x)=\mathbb{E}_{y\sim\pi_\theta(\cdot\mid x)}\bigl[R(x,y)\,\nabla_\theta\log\pi_\theta(y\mid x)\bigr]
\tag{2}
$$

这里把 $R$ 当作与 $\theta$ 无关的量; 式 (1) 的 KL 项含 $\theta$, 实现中一般把塑形后的 $R$ 当常数, 只对 $\log\pi_\theta$ 求导. 式 (2) 是论文式 (6). 它不需要对 $R$ 求导, 奖励模型可以是任意黑盒, 也可以是不可微的规则. 用采样平均代替期望, 就得到一个无偏的 Monte-Carlo 估计.

Williams (1992) 给这类算法起的名字是一句话的首字母: REward Increment = Nonnegative Factor × Offset Reinforcement × Characteristic Eligibility. 特征资格 (characteristic eligibility) 是 $\nabla\log\pi$; 偏移强化 (offset reinforcement) 是 $R-b$; 非负因子是学习率一类的步长.

### 2.2 梯度仍流过每个 token

整段的对数概率是逐 token 求和:

$$
\log\pi_\theta(y\mid x)=\sum_{t=1}^{T}\log\pi_\theta(y_t\mid x,y_{<t})
\tag{3}
$$

所以式 (2) 的梯度会传到每个已生成 token 上, 整段不是不可微的黑盒. 与 token 级方法的区别在权重: 同一条 $y$ 上所有位置共用同一个标量 $R(x,y)$, 没有逐步的优势, 没有 $\lambda$, 也没有每个前缀的价值估计.

## 3. 基线

### 3.1 为什么减基线不改期望

单条样本的 $R\nabla\log\pi$ 方差很大. 减去一个与当前样本无关的 $b$ 可以降方差, 期望不变 (论文式 (7)):

$$
\mathbb{E}_{y\sim\pi_\theta}\bigl[(R(x,y)-b)\,\nabla_\theta\log\pi_\theta(y\mid x)\bigr]
\tag{4}
$$

理由是 $\mathbb{E}_{y\sim\pi_\theta}[\nabla_\theta\log\pi_\theta(y\mid x)]=\sum_y\nabla_\theta\pi_\theta(y\mid x)=\nabla_\theta\sum_y\pi_\theta(y\mid x)=\nabla_\theta1=0$, 只要 $b$ 不依赖当前这条 $y$, $\mathbb{E}[b\nabla\log\pi]=b\cdot0=0$. 论文的说法是选一个与随机梯度估计协方差高的 $b$ (Williams 1992; Mnih & Gregor 2014).

一个两选一的例子能看出基线的作用. 设只有两条可能回复, 用一个 logit 差 $\theta$ 参数化, 当前 $\pi(y_a)=\pi(y_b)=0.5$, 于是 $\nabla\log\pi(y_a)=0.5$, $\nabla\log\pi(y_b)=-0.5$. 奖励模型给 $R(y_a)=1.0$, $R(y_b)=0.8$, 两条都是正分. 不减基线时, 单样本梯度是 $0.5$ 或 $-0.4$, 均值 $0.05$, 方差 $(0.25+0.16)/2-0.05^2=0.2025$: 采到 $y_b$ 时也会把它往上推, 只是推得少一些. 减去 $b=0.9$ 后, 两种情况的单样本梯度都是 $0.05$, 方差为 0, 均值不变. 奖励整体偏正或偏负时, 不减基线的估计器主要在传递「整体水位」, 两条回复的相对好坏反而被淹没.

### 3.2 最优常数基线

对单个分量 $s_k=\partial_{\theta_k}\log\pi_\theta(y\mid x)$, 估计量 $g_k=(R-b)s_k$ 的方差为 $\mathbb{E}[(R-b)^2s_k^2]-(\mathbb{E}[Rs_k])^2$, 后一项与 $b$ 无关. 对 $b$ 求导令其为 0, 得

$$
b_k^{*}=\frac{\mathbb{E}\bigl[R\,s_k^2\bigr]}{\mathbb{E}\bigl[s_k^2\bigr]}
\tag{5}
$$

这是 Greensmith 等 (2004) 讨论过的方差最优常数基线: 按梯度平方加权的平均奖励. 梯度大小与奖励无关时, 它退化成平均奖励 $\mathbb{E}[R]$. 实践中很少有人估式 (5), 通常直接用平均奖励或它的某种估计, 下面的滑动平均就是一种.

### 3.3 滑动平均基线

论文用的无参基线是训练过程中所有奖励的滑动平均 (论文式 (8)):

$$
b_{\mathrm{MA}}=\frac{1}{S}\sum_{s}R(x^{s},y^{s})
\tag{6}
$$

$S$ 是训练步数, $(x^s,y^s)$ 是第 $s$ 步的 prompt 与回复. 论文说它实现简单, 计算便宜, 并把它称为强的无参选择. 它的对照范围跨 prompt, 跨时间: 估的是到目前为止的整体平均分, 不知道「这道题现在值多少」.

全程算术平均还有滞后. 设训练中平均奖励每步线性上涨 $\delta$, 第 $S$ 步的奖励水平为 $R_S$, 前 $S$ 步的算术平均是 $R_S-\frac{(S-1)\delta}{2}$, 落后量随步数线性增长. 训练 600 步, 每步涨 $0.002$, 第 600 步时基线比当前水平低约 $0.6$, 几乎所有样本的优势都偏正. 式 (6) 仍然无偏, 只是降方差的效果打了折扣. 实现中常改用指数滑动平均, 让基线只记近期的奖励, 这已偏离论文式 (8) 的写法.

手算四步. 塑形后的奖励依次是 $1.2$, $0.8$, $1.5$, $0.4$, 此时 $b_{\mathrm{MA}}=(1.2+0.8+1.5+0.4)/4=0.975$. 新来一条 $R=1.4$, 优势 $0.425$, 这条回复的每个 token 都乘 $+0.425$. 若下一条只有 $0.3$, 优势 $-0.675$, 整段被压低.

```python
def ma_baseline_and_adv(history: list[float], r_new: float) -> tuple[float, float]:
    """式 (6): 历史奖励的算术平均作 b_MA, 当前样本不进平均."""
    b = sum(history) / max(len(history), 1)
    return b, r_new - b


b, a = ma_baseline_and_adv([1.2, 0.8, 1.5, 0.4], 1.4)
assert abs(b - 0.975) < 1e-9 and abs(a - 0.425) < 1e-9
```

放进训练循环, 一步更新只需三件事: 采样一条回复, 算出式 (1) 的 $R$ 并当作常数, 再把 $(R-b_{\mathrm{MA}})$ 乘到回复所有 token 的对数概率之和上取负作为损失. 回复 token 用 mask 选出, prompt 部分不进求和. 损失对 token 求和, 与式 (3) 对应; 若改成平均, 等于给每条回复乘 $1/T$, 长回复的梯度被缩小, 估计器变成另一种加权. 更新完再把这一步的 $R$ 加入历史, 供下一步计算 $b_{\mathrm{MA}}$.

当前样本不能进平均. 设前面已有 $S-1$ 个奖励, 和为 $P$; 若把当前 $R$ 也算进去, 优势变成 $R-\frac{P+R}{S}=\frac{S-1}{S}\bigl(R-\frac{P}{S-1}\bigr)$. 结果是相对其余样本均值的优势再乘 $(S-1)/S$: 基线依赖了当前样本, 式 (4) 的推导不再成立, 梯度期望被缩小 $1/S$. $S$ 很大时影响很小, 同一 prompt 只采几条时就不能忽略, RLOO 正是为此用其余样本的平均.

## 4. token 级还是序列级

### 4.1 Vanilla PG 的写法

论文把两种 REINFORCE 区分开. Vanilla PG 是 GAE 中 $\lambda=1$ 的极端, 仍按 token 展开, 每个位置用从该位置起的轨迹回报, 减一个学出来的基线 (论文式 (9)):

$$
\sum_{i=t}^{T}\gamma^{T-i-1}R_t(x,y_t)-b_\phi(s_t)
\tag{7}
$$

$b_\phi(s_t)$ 用平方误差拟合从 $t$ 起的回报, 作用与价值网络相同.

两种写法都无偏, 原因可以从式 (3) 看出. 把式 (2) 的 $\nabla\log\pi(y\mid x)$ 拆成 $\sum_t\nabla\log\pi(y_t\mid s_t)$, 序列级写法给每一项乘整段回报 $\sum_iR_i$. 对第 $t$ 项来说, 在 $t$ 之前已经发生的奖励 $R_i$ ($i<t$) 只取决于更早的 token, 给定 $s_t$ 后它们与 $y_t$ 无关, 于是 $\mathbb{E}[R_i\nabla\log\pi(y_t\mid s_t)]=0$, 去掉它们不改期望, 剩下的就是从 $t$ 起的回报. 基线 $b_\phi(s_t)$ 只依赖 $s_t$, 同样不改期望. 所以 Vanilla PG 是对序列级估计器的一个降方差改写, 代价是要学 $b_\phi$. 在 RLHF 里, 被去掉的早期奖励只有几步 KL 项, 降方差的空间本来就小. 论文说两者的关键区别是: Vanilla PG 把 REINFORCE 估计器用在「prompt 加部分回复」开始的回报上; 序列级 REINFORCE 用在整条轨迹的回报上.

### 4.2 一组算术

$\gamma=1$, 奖励只在末尾出现时, 两种权重差得不多. 设 $T=3$, 每步 KL 罚为 $0.1$ (按惩罚记为负), 奖励模型在结束时给 $1.8$. 逐步奖励是 $-0.1$, $-0.1$, $1.8-0.1=1.7$, 从各位置往后的回报是 $1.5$, $1.6$, $1.7$. 序列级写法给三个 token 同一个 $R=1.8-0.3=1.5$. 差别只在前面几步少算的 KL. 为这点差别, token 级写法要多养一个 $b_\phi$ 或价值网络. 再把 $\lambda$ 调小, GAE 就开始用 $V(s_{t+1})$ 代替后面真实的回报, 而中间状态上并没有来自 $r_\phi$ 的信号可供自举, 偏差由此进入.

![每个 token 当动作对照整段 y 当动作](./images/fig-reinforce-token-vs-seq.png)

> 图 1: 左列每个 token 是一个动作, Critic 给 $V_\phi(s_t)$, GAE 用 $\lambda$ 自举出逐步 $A_t$; 右列整段 $y$ 是一个动作, 结束时的 $R(x,y)$ 减滑动平均 $b_{\mathrm{MA}}$, 同一个标量乘整段的 $\nabla\log\pi(y\mid x)$.

**图 1 解析**

- 左列底部写的是 Vanilla PG / PPO: 两者都建模部分序列, Vanilla PG 是 $\lambda=1$ 的情形, 用学出来的基线.
- 左列 Critic 用虚线接入 GAE, 表示自举依赖一个额外的模型; 右列 $b_{\mathrm{MA}}$ 也用虚线接入, 但它只是一个标量平均, 没有参数.
- 右列黄框标明 $R(x,y)$ 只在 EOS 处出现, 粉框写明同一权重 (shared weight) 用于整段.

### 4.3 方差在 RLHF 里没那么大

传统 Deep-RL 不爱用 REINFORCE, 原因是单样本 Monte-Carlo 估计方差大. 论文列了一批 NLP 文献 (Ranzato 等 2016; Bahdanau 等 2017; Ding & Soricut 2017; Korbak 等 2022 等) 报告它在大动作空间里失败, 同时指出这些结论来自从随机或弱初始化开始训练的场景. RLHF 的策略从预训练加 SFT 的模型出发, 再加上 prompt 的条件化, 每一步的概率质量集中在少数 token 上.

附录 A 用 HH 实验里的 Llama SFT 模型 (词表 32k) 验证这一点: 生成第一个 token 之后, 单步约 60% 的概率质量落在最可能的那一个 token 上, 前 16 个 token 拿走约 90% 以上. 归一化熵 $\hat{H}=H/H_{\max}$ ($H_{\max}$ 是词表上均匀分布的熵) 在第一个 token 之后降幅最大, 此后只略有回升, 始终很低. 论文由此认为生成的第一步条件化影响最大, 这也支持把整段当作一个动作.

论文的两个消融支持这个判断, 都画在 Figure 1 上, 设定是基于 Llama-7B 的模型加 HH 数据集. 其一, 在 PPO 里扫 GAE 的 $\lambda$: $\lambda=1.0$ (即 Vanilla PG) 奖励最高, 随 $\lambda$ 减小单调下降. 论文的解释是, $\lambda$ 的合适取值取决于环境, 高随机性的环境里可以用偏差换方差, 方差本来就低的环境里引入偏差没有必要. $\lambda$ 越接近 1 方差越高, 而 Figure 1 中方差最高, 没有偏差的 $\lambda=1.0$ 反而最好; $\lambda=0$ 与 $\lambda=0.5$ 两个偏重降方差的变体都更差. 其二, 裁剪很少触发: 在所有数据集与基座组合上, 每个 batch 平均不到 5% 的 token 被裁剪; 关掉裁剪对学习几乎没有影响. 这组实验连价值网络的裁剪也一并关掉, 因为 Engstrom 等 (2020) 观察到它在传统 Deep-RL 里对学习有明显影响; Figure 1 右图还显示去掉损失归一化同样不降性能. 在 $\lambda=1$ 时再去掉比率 $\pi_\theta/\pi_{\mathrm{old}}$, PPO 损失就退化为 Vanilla PG, 性能反而略有提升. 论文据此认为学习过程接近 on-policy, 策略在迭代之间变化很慢.

## 5. 实验

### 5.1 设定

数据是 TL;DR Summarize 和 Anthropic-HH. TL;DR 训练集有 116k 条人写的指令和 93k 对人工标注的偏好; 预处理后的 HH 有 112k 对训练偏好. 基座是 Pythia-6.9B; HH 上另用 Llama-7B 考察预训练质量的影响. SFT 与奖励模型的上下文都是 512 token; 为减少不含 EOS 的生成, 过滤掉长于 448 (TL;DR) 和 348 (HH) token 的 prompt. 奖励模型和策略都从对应的 SFT 初始化. HH 没有单独的 SFT 集, 用偏好对中被选中的回复做 SFT.

偏好训练阶段, TL;DR 训 600 步, rollout batch 512, 更新 batch 256, $\beta=0.03$; HH 上 Pythia 训 393 步, batch 设置相同; Llama 按 RAFT 论文的设置, rollout 与更新 batch 都是 2048, 共 2 个 epoch; HH 实验默认 $\beta=0.10$. 学习率恒为 $1\times10^{-6}$, 线性 warmup 占总步数的 3%. RAFT 和 RLOO 在 $\{10^{-6},10^{-5},2\times10^{-5}\}$ 中选学习率, PPO 和 Vanilla PG 在 $\{10^{-6},10^{-5}\}$ 中选. 所有算法每个 batch 做 2 个梯度步.

前两个阶段的设置见附录 C. SFT: Pythia 训 2 个 epoch, 初始学习率 $2\times10^{-5}$; Llama 训 1 个 epoch 就够. 奖励模型训 1 个 epoch, 初始学习率 $1\times10^{-5}$. 两者都用余弦衰减, warmup 比例 0.03. 也就是说, 所有方法共享同一个 SFT 起点和同一个奖励模型, 测试奖励可以直接横向比较.

评测有两项. 一是用训练时的奖励模型在 1000 条测试样本上算平均奖励; 二是按 AlpacaFarm 框架以 GPT-4 代替人评算胜率, TL;DR 对比 SFT 参考摘要, HH 对比偏好对中被选中的回复, 默认贪心解码. 表中取测试奖励最高的 checkpoint.

### 5.2 胜率

论文 Table 1 中与本节相关的几行:

| 方法 | TL;DR | HH (Pythia) | HH (Llama) |
|---|---:|---:|---:|
| RLOO ($k=4$) | 77.9 | 43.7 | 64.1 |
| REINFORCE + 滑动平均基线 | 70.7 | 37.9 | 55.3 |
| Vanilla PG | 70.4 | 36.4 | 52.3 |
| PPO | 67.6 | 29.2 | 32.0 |
| DPO | 66.6 | 39.0 | 61.9 |

Vanilla PG 在三组上都高于 PPO, 表内差值分别是 $2.8$, $7.2$, $20.3$. 序列级 REINFORCE 与 Vanilla PG 在 Pythia 上基本持平 ($70.7$ 对 $70.4$, $37.9$ 对 $36.4$), 在 HH + Llama 上更高 ($55.3$ 对 $52.3$). 论文的结论是: 只建模整段生成, 不建模部分回复, 即使不用多样本也足够有效. 测试奖励曲线 (Figure 2) 方向一致: RLOO 始终最好, Vanilla PG 始终高于 PPO.

DPO 在 HH 上高于单样本的两种 REINFORCE, 在 TL;DR 上最低. 多样本的 RLOO ($k=4$) 比 PPO 分别高 $10.3$, $14.5$, $32.1$, 在 HH (Pythia) 上 $k=2$ 的胜率更高, 那是 [05 RLOO](../05-RLOO-留一法基线/05-RLOO-留一法基线.md) 的内容.

### 5.3 流畅度, 多样性与奖励方差

Table 2 在 HH 上报告长度, 困惑度, $n$-gram 多样性和奖励方差:

| 方法 | 长度 | PPL | Diversity-1 | Diversity-2 | 奖励方差 |
|---|---:|---:|---:|---:|---:|
| REINFORCE + 滑动平均基线 | 47.2 | 27.2 | 0.13 | 0.50 | 2.7 |
| Vanilla PG | 39.1 | 39.0 | 0.15 | 0.54 | 3.7 |
| PPO | 16.5 | 40.4 | 0.34 | 0.60 | 2.3 |
| DPO | 104.4 | 33.8 | 0.08 | 0.39 | N/A |

困惑度上, RLOO, RAFT 和带滑动平均基线的 REINFORCE 彼此接近, 都明显低于 PPO 和 Vanilla PG. Vanilla PG 的奖励方差最高; 带基线的 REINFORCE 奖励方差低 27%, 奖励和胜率还不低于 Vanilla PG. 论文认为低奖励方差对安全, 无害这类「生成一次低分样本就有风险」的应用更重要. PPO 的生成最短 (平均 16 token 左右), DPO 最长 (约 104 token), 显得啰嗦. Diversity-1 在 RLOO, RAFT, 带基线的 REINFORCE 和 Vanilla PG 之间相近; Diversity-2 在奖励优化得更好的方法上略低, 论文认为这与它们的生成长度差异较大有关. PPO 的 Diversity-1 达到 0.34, 与它的回复只有十几个 token 分不开, 不能直接读成更好的多样性. 长度也提醒读表时要谨慎: 带基线的 REINFORCE 比 Vanilla PG 平均长 8 个 token, 困惑度却低得多, 两者的差别不能只归到估计器上, 论文没有做长度控制的对照.

## 6. 与相邻方法的区别和适用边界

### 6.1 每个 prompt 多采样的方法: RLOO, ReMax, RAFT

![REINFORCE, RLOO, PPO, RAFT 四列对照](./images/fig-reinforce-four-col.png)

> 图 2: 同一 prompt 分出四列. REINFORCE 采一条, 减 $b_{\mathrm{MA}}$; RLOO 采 $k$ 条, 每条减其余 $k-1$ 条的均值; PPO 走 token 级的 Critic, GAE 和裁剪; RAFT 采 $k$ 条, 只对奖励最高的一条做交叉熵.

**图 2 解析**

- 四列之间没有箭头, 只共享顶部的 prompt. 前两列最后都进入序列级策略梯度, 区别只在基线来源.
- RLOO 列明确写了 no std, 它不做组内标准化, 与 GRPO 不同.
- PPO 列列出四个模型 (Actor, Critic, RM, Ref); RAFT 列的虚线指向被丢弃的 $k-1$ 条, 最后一步是交叉熵而非策略梯度.

**RLOO.** 同一 prompt 采 $k$ 条, 每条用其余 $k-1$ 条的平均奖励作基线, 来自 Kool 等 (2019). 论文说它是比 $b_{\mathrm{MA}}$ 有效得多的基线, 因为它针对每条样本, 在每个训练步现场构造; 代价是训练时要多采样. 多样本带来两处降方差: 每条样本的奖励给其余样本当基线; 更新用 $k$ 个梯度估计的平均, 是多样本的 Monte-Carlo 估计. 论文也提到, 用额外采样降方差的想法同期还有 Li 等 (2023), 即下面的 ReMax. 序列级 REINFORCE 是 RLOO 的单样本版本; $k=1$ 时没有「其余样本」, 只能退回 $b_{\mathrm{MA}}$ 这类跨 prompt 的基线.

**ReMax.** 用当前策略对同一 prompt 贪心解码得到的回复的奖励作基线, 也只多一次生成, 不需要价值网络, 见 [ReMax](../06-ReMax-贪婪基线/06-ReMax-贪婪基线.md).

**RAFT.** 与 RLOO 同样每个 prompt 采 $k$ 条, 但只对奖励最高的一条做监督微调, 其余丢掉. 论文指出, 这种用奖励筛选样本再接监督学习目标的做法也叫 bandit-to-supervised conversion, 在 LLM 的 RLHF 出现之前, 已在大动作空间的 NLP 离线 RL 里取得过效果 (Lawrence & Riezler 2018; Kreutzer 等 2018). 论文在相同采样预算下比较两者, RLOO 胜率更高, 并且对 KL 系数和奖励噪声更稳, 见 [4.7.2 RAFT](../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md).

### 6.2 换掉基线或不做 RL: GRPO, DPO, RLAIF

**GRPO.** DeepSeekMath 中的 GRPO 与 Ahmadian 等的论文同在 2024 年 2 月挂上 arXiv, 都去掉了价值网络. GRPO 用含自身的组内均值和标准差做标准化, 并保留 PPO 式的比率裁剪; 序列级 REINFORCE 的 $b_{\mathrm{MA}}$ 跨 prompt 混合, 没有标准化, 也没有裁剪, 见 [4.5 GRPO](../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md). 标准化与否决定优势的单位: GRPO 的优势是无量纲的 $z$ 分数, 奖励模型整体放大一倍, 更新不变; $b_{\mathrm{MA}}$ 下的优势保留奖励的原单位, 奖励放大一倍, 等效学习率也放大一倍, 所以换奖励模型后学习率和 $\beta$ 要重新调.

**DPO.** 跳过在线采样和独立的奖励模型, 直接把偏好对放进分类损失. Ahmadian 等把它作为不做 RL 的对照.

**RLAIF 附录 E 的 REINFORCE.** Lee 等的 RLAIF 也用 REINFORCE, 基线却是学出来的价值网络. 他们把语言模型写成确定性的有限时域 MDP, 奖励只在最后一个 token 给出, 其余位置为 0, 取 $\gamma=1$, 所以每个位置的回报都是 $Z_t=R_T$. 策略损失和价值损失为

$$
\mathcal{L}_{\mathrm{PG}}(\theta)=-\sum_t\log\pi_\theta(A_t\mid X_t)\,\overline{\bigl(Z_t-V^\pi_\psi(X_t)\bigr)},\qquad
\mathcal{L}_V(\psi)=\sum_t\bigl(Z_t-V^\pi_\psi(X_t)\bigr)^2
\tag{8}
$$

上划线表示优势项不回传梯度. 策略和价值模型都从 SFT 初始化. RL 阶段采样温度 0.9 以鼓励探索, batch 128, 学习率 $10^{-5}$, 训 8 个 epoch, KL 系数 $\beta=0.05$; 目标写成 $(1-\beta)r_\phi-\beta D_{\mathrm{KL}}$. 式 (8) 每个位置的回报相同, 但基线 $V_\psi(X_t)$ 随前缀变化, 所以仍是 token 级的写法, 多一个与策略同初始化的价值模型. Ahmadian 等的 $b_{\mathrm{MA}}$ 是零参数的标量. 两者都叫 REINFORCE, 基线完全不同.

| | 序列级 REINFORCE | Vanilla PG | PPO | RAFT | GRPO |
|---|---|---|---|---|---|
| 动作 | 整段 $y$ | 每个 token | 每个 token | 整段, 只留最高分 | token 级比率, 优势按整段共用 |
| 基线 | $b_{\mathrm{MA}}$, 无参数 | 学出来的 $b_\phi(s_t)$ | 价值网络 + GAE | 无, 排序只用于筛选 | 组内均值 (含自身) |
| 尺度 | 奖励原单位 | 前缀回报 | GAE 优势 | 交叉熵 | 除以组内标准差 |
| 裁剪 | 无 | 无 | 比率裁剪 | 无 | 比率裁剪 |
| 额外网络 | 无 | 基线网络 | 价值网络 | 无 | 无 |

### 6.3 失效与边界

| 现象 | 原因 | 处理 |
|---|---|---|
| 分不出同一 prompt 下几条回复谁好 | $b_{\mathrm{MA}}$ 跨 prompt 混合 | 多采几条, 用 RLOO 的留一基线 |
| 训练前期优势系统性偏正 | 奖励上涨时, 历史平均滞后 | 改用只看近期的平均, 或换成按 prompt 的基线 |
| 当前样本进了基线 | 基线依赖当前样本, 梯度期望缩小 $1/S$ | 只用历史样本或其余样本 |
| 有过程奖励 | 序列级写法只用整段一个标量 | 需要 token 级建模, 论文没有研究 |
| 长回复的梯度更大 | 损失对 token 求和, 同一个 $(R-b)$ 乘 $T$ 项 | 论文没有分析长度效应; 需要时监控平均长度 |
| 胜率只是代理 | GPT-4 模拟胜率, 没测与人评的相关性 | 结论限于论文的评测方式 |

论文 §7 列了三条局限: 没有研究奖励模型过优化, 即代理奖励与「金标准」奖励在优化中分叉 (Gao 等 2022), RAFT 一类迭代微调方法同样缺这方面的研究; 没有在「建模部分序列并给中间奖励」的单 token 动作框架下研究留一基线; 只用 LLM 模拟胜率, 没有测量与最终人评偏好的相关性, 也没有用 ROUGE, BLEU 等 NLP 指标作奖励训练.

还要补两点. 第一, 结论的前提是强初始化: 策略从预训练加 SFT 的模型出发, 概率质量已经集中. 从弱初始化开始训练, 或者奖励稀疏到大多数样本都拿同一个分, 单样本 REINFORCE 的方差仍是实际问题. 第二, 裁剪不到 5% 的统计来自论文的模型与数据. 一批 rollout 要更新多轮, 或策略变化快的场景 (例如长 CoT 的推理 RL), 比率会离 1 更远, 这时裁剪或软门是否必要要重新判断, 可参考 [4.5 CISPO](../../4.5-GRPO家族与RLVR/03-CISPO-裁剪重要性权重/03-CISPO-裁剪重要性权重.md) 和 [4.5 SAPO](../../4.5-GRPO家族与RLVR/06-SAPO-温度软门/06-SAPO-温度软门.md).

## 参考文献

1. Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine Learning*, 8(3–4), 229–256.
2. Ahmadian, A., Cremer, C., Gallé, M., Fadaee, M., Kreutzer, J., Pietquin, O., Üstün, A., & Hooker, S. (2024). *Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs*. ACL 2024. arXiv:2402.14740. https://arxiv.org/abs/2402.14740
3. Greensmith, E., Bartlett, P. L., & Baxter, J. (2004). Variance reduction techniques for gradient estimates in reinforcement learning. *Journal of Machine Learning Research*, 5, 1471–1530.
4. Kool, W., van Hoof, H., & Welling, M. (2019). Buy 4 REINFORCE samples, get a baseline for free! *DeepRLStructPred Workshop @ ICLR 2019*.
5. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347.
6. Schulman, J., Moritz, P., Levine, S., Jordan, M., & Abbeel, P. (2016). *High-Dimensional Continuous Control Using Generalized Advantage Estimation*. ICLR 2016. arXiv:1506.02438.
7. Kreutzer, J., Sokolov, A., & Riezler, S. (2017). Bandit structured prediction for neural sequence-to-sequence learning. *ACL 2017*. https://aclanthology.org/P17-1138
8. Nguyen, K., Daumé III, H., & Boyd-Graber, J. (2017). Reinforcement learning for bandit neural machine translation with simulated human feedback. *EMNLP 2017*.
9. Lee, H., et al. (2023). *RLAIF vs. RLHF: Scaling Reinforcement Learning from Human Feedback with AI Feedback*. arXiv:2309.00267.
10. Dong, H., et al. (2023). *RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment*. arXiv:2304.06767.
11. Shao, Z., et al. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300.
12. Rafailov, R., et al. (2023). *Direct Preference Optimization: Your Language Model is Secretly a Reward Model*. arXiv:2305.18290.
13. Gao, L., Schulman, J., & Hilton, J. (2022). *Scaling Laws for Reward Model Overoptimization*. arXiv:2210.10760.
14. Mnih, A., & Gregor, K. (2014). Neural variational inference and learning in belief networks. *ICML 2014*.
