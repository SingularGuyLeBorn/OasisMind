---
title: "05 · RLOO: 留一法基线"
published: true
tags: ["RLOO", "REINFORCE", "RLHF", "PPO", "GRPO", "RAFT"]
excerpt: "RLOO 对同一 prompt 采 k 条回复, 第 i 条的基线取其余 k-1 条奖励的均值, 不训 Critic, 不除组内标准差. Ahmadian 等 2024 在 TL;DR 和 Anthropic-HH 上测得, RLOO k=4 的胜率比 PPO 高 10.3 到 32.1 个点."
---

# RLOO: 留一法基线

> 相关阅读: [04 PPO](../04-PPO/04-PPO.md) · [01 GRPO](../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) · [04 RAFT](../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md) · [02 序列级 REINFORCE](../02-REINFORCE-序列级策略梯度/02-REINFORCE-序列级策略梯度.md) · [ReMax](../06-ReMax-贪婪基线/06-ReMax-贪婪基线.md) · [Dr. GRPO](../../4.5-GRPO家族与RLVR/02-DrGRPO-去标准差/02-DrGRPO-去标准差.md)

材料是 Ahmadian 等的 *Back to Basics: Revisiting REINFORCE Style Optimization for Learning from Human Feedback in LLMs* (ACL 2024, arXiv:2402.14740). 问题是 RLHF 里 PPO 的价值网络, GAE 和比率裁剪是否必要, 以及同一 prompt 的多条样本能否直接充当基线.

## 1. PPO 在 RLHF 里有哪些部件用不上

### 1.1 第三段的目标和 PPO 的部件

RLHF 的常规流程分三段 (Ziegler 等): 先做 SFT; 再用人类偏好对训练奖励模型 $r_\phi(x,y)$; 最后让奖励模型在线打分, 优化策略. 第三段的目标是带 KL 罚的期望奖励, 等价于最大化 KL 塑形后的奖励 (论文式 (3)):

$$
R(x,y)=r_\phi(x,y)-\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}
\tag{1}
$$

$\pi_\theta$ 是正在训练的策略, $\pi_{\mathrm{ref}}$ 是参考策略, 一般取 SFT 模型, $\beta$ 控制策略能离参考策略多远. 论文说明这一项必须保留: 不加罚直接优化奖励模型, 生成的连贯性会变差.

第三段默认用 PPO. PPO 把每个生成的 token 看作一个动作, 把 prompt 加已生成的前缀看作状态, 折扣取 1. 奖励模型的分数只加在最后一个 token 上, 其余位置的逐步奖励只剩 KL 项. 优势用 GAE 估计, 需要一个价值网络 (Critic) 预测每个前缀的回报. 一次迭代通常要同时加载四个模型: 生成器, 计算 KL 用的参考模型, Critic, 奖励模型, 其中生成器和 Critic 都要训练. 7B 量级的策略配一个同规模的 Critic, 就多出一份权重, 梯度和优化器状态.

Ahmadian 等认为 PPO 的设计前提来自传统 Deep-RL: 策略从随机初始化开始, 离策略更新的步子一大, 学习就不稳, 所以 PPO 强调每一步更新要小而稳. RLHF 的起点是预训练加 SFT 后的语言模型, 条件差得很远. 论文从下面四个方面检查 PPO 的部件在这个设定里是否还必要.

### 1.2 四个方面的检查

**偏差和方差.** 价值网络和 GAE 用偏差换方差. GAE 的 $\lambda\in[0,1]$ 决定换多少: $\lambda$ 接近 0 时优势主要靠价值网络自举, 方差小, 偏差大; $\lambda=1$ 时优势退化成从当前 token 往后的完整回报减去基线, 偏差最小, 方差最大. $\lambda$ 取多少取决于环境: 随机性很强的环境里, 用偏差换方差是划算的; 环境本身稳定, 方差已经低时, 引入偏差没有必要. 论文在 Llama-7B 和 Anthropic-HH 上扫了 $\lambda\in\{0,0.5,0.95,1.0\}$ (Figure 1 左): $\lambda=1.0$ 的奖励最高, 随 $\lambda$ 变小单调下降. 作者据此判断, 这个环境本身的方差已经不高, 再用偏差去换方差没有收益.

**输出分布的集中程度.** 附录 A 统计了 HH 实验所用 Llama SFT 模型 (词表 32k) 每一步的输出分布. 生成第一个 token 之后, 概率质量明显集中: 每一步约 60% 落在 top-1 token 上, 超过 90% 落在 top-16 上, 扩到 top-32 和 top-64 增加很少. 归一化熵在第一个 token 之后降幅最大, 后面只小幅回升. 名义上每一步有 32k 个可选动作, 实际有机会被采到的只有十几个. 早期 NLP 文献 (Ranzato 等 2016, Bahdanau 等 2017, Ding 和 Soricut 2017, Korbak 等 2022 等) 报告 REINFORCE 方差高, 在大动作空间里会失败. 作者认为这些结论来自随机初始化或弱初始化的训练, 从强预训练模型出发时不成立.

**裁剪.** PPO 的比率裁剪限制 $\pi_\theta/\pi_{\mathrm{old}}$ 偏离 1 的幅度. 论文统计, 所有数据集和基座组合上, 每个 batch 平均被 clip 的损失项不到 5%. 训练基本是 on-policy 的, 相邻两次迭代之间策略变化很慢. 在 $\lambda=1$ 下关掉 clip (价值网络的 clip 也关掉; Engstrom 等 2020 观察到, 价值网络的 clip 在传统 Deep-RL 环境里对学习有明显影响), 再去掉比率 $\pi_\theta/\pi_{\mathrm{old}}$, PPO 的损失就退化成 Vanilla Policy Gradient. 这样改之后奖励没有下降, 还略有提升 (Figure 1 右). 作者的结论是, 大步长的离策略更新在这个设定里很少出现, 也不会像传统 Deep-RL 那样破坏学习.

**状态建模.** 奖励只在整段生成结束时出现, 中间 token 的逐步奖励只有 KL 项. 状态转移是确定的: 在 $s_t=\{y_{<t},x\}$ 写下 $y_t$, 下一个状态就是拼上 $y_t$ 的前缀, 转移概率恒为 1. 这样的 MDP 里有实际作用的只有两个状态: 由 prompt 决定的初始状态, 和生成结束后到达的终止状态. 论文因此把整段生成看作一个动作, 问题化为 contextual bandit, 这与 Kreutzer 等 2017, Nguyen 等 2017 在机器翻译上的做法一致.

四点合在一起, 要求的优化器是: 不对部分序列建模, 不训练价值网络, 不需要裁剪. 序列级 REINFORCE 满足这些条件. RLOO 在它的基础上换了一个更好的基线.

## 2. 从单样本 REINFORCE 到留一法

### 2.1 REINFORCE 和基线

把整段回复 $y$ 看作一个动作, REINFORCE (Williams 1992) 给出期望奖励的梯度 (论文式 (6)):

$$
\nabla_\theta\,\mathbb{E}_{y\sim\pi_\theta(\cdot\mid x)}\bigl[R(x,y)\bigr]
=\mathbb{E}_{x\sim\mathcal{D},\,y\sim\pi_\theta(\cdot\mid x)}\bigl[R(x,y)\,\nabla_\theta\log\pi_\theta(y\mid x)\bigr]
\tag{2}
$$

式 (2) 把 $R$ 看作一个标量. $\log\pi_\theta(y\mid x)=\sum_{t=1}^{T}\log\pi_\theta(y_t\mid x,y_{<t})$, 所以梯度仍然经过每个 token 的 logits, 只是每个 token 乘的是同一个数 $R(x,y)$.

单样本估计的方差大, 常见做法是减去一个基线 $b$ (论文式 (7)):

$$
\mathbb{E}_{x,\,y}\bigl[(R(x,y)-b)\,\nabla_\theta\log\pi_\theta(y\mid x)\bigr]
\tag{3}
$$

只要 $b$ 不依赖被求导的那条 $y$, 减掉它就不改变期望. 推导只有一行:

$$
\mathbb{E}_{y\sim\pi_\theta}\bigl[b\,\nabla_\theta\log\pi_\theta(y\mid x)\bigr]
=b\sum_{y}\pi_\theta(y\mid x)\frac{\nabla_\theta\pi_\theta(y\mid x)}{\pi_\theta(y\mid x)}
=b\,\nabla_\theta\sum_{y}\pi_\theta(y\mid x)
=b\,\nabla_\theta 1=0
\tag{4}
$$

$b$ 可以依赖 $x$, 也可以依赖其他独立采到的样本, 式 (4) 都成立. 论文的 REINFORCE 基线取训练过程中所有奖励的滑动平均 (论文式 (8)):

$$
b_{\mathrm{MA}}=\frac{1}{S}\sum_{s}R(x^{s},y^{s})
\tag{5}
$$

$S$ 是训练步数, $(x^s,y^s)$ 是第 $s$ 步的 prompt 和回复. $b_{\mathrm{MA}}$ 对所有 prompt 都是同一个数. 某个 prompt 天然容易拿高分时, 它的每条回复都会得到正优势; 难的 prompt 则相反. 这部分优势反映的是 prompt 的难度, 与回复好坏无关.

### 2.2 留一法估计器

留一法估计器来自 Kool, van Hoof 和 Welling 2019 年的工作坊论文, Ahmadian 等把它用到 RLHF 上. RLOO 对每个 prompt 独立采 $k$ 条回复 $y_{(1)},\dots,y_{(k)}\sim\pi_\theta(\cdot\mid x)$, 每条回复用其余 $k-1$ 条的平均奖励作基线:

$$
b_i=\frac{1}{k-1}\sum_{j\ne i}R(x,y_{(j)})
\tag{6}
$$

梯度估计是 $k$ 条单样本估计的平均 (论文 §2.3, 原文未编号):

$$
\hat g=\frac{1}{k}\sum_{i=1}^{k}\bigl[R(x,y_{(i)})-b_i\bigr]\,\nabla_\theta\log\pi_\theta(y_{(i)}\mid x)
\tag{7}
$$

$k$ 条回复独立同分布, $b_i$ 和 $y_{(i)}$ 独立, 由式 (4), 式 (7) 是无偏估计. 论文把 $b_i$ 称作每一步现场估计, 不带参数的价值函数.

降方差来自两处. 第一处是 $k$ 条估计取平均. 第二处是基线贴近当前 prompt 的期望奖励 $V(x)=\mathbb{E}_{y}[R(x,y)]$. 只看乘在 $\nabla\log\pi$ 前面的那个标量, 可以算出两种基线的差别. 用常数 $c$ 作基线时:

$$
\mathbb{E}\bigl[(R-c)^2\mid x\bigr]=\mathrm{Var}(R\mid x)+\bigl(V(x)-c\bigr)^2
\tag{8}
$$

用留一均值作基线时, $b_i$ 是 $k-1$ 个独立样本的均值, 与 $R_i$ 独立:

$$
\mathbb{E}\bigl[(R_i-b_i)^2\mid x\bigr]=\mathrm{Var}(R\mid x)+\frac{\mathrm{Var}(R\mid x)}{k-1}
\tag{9}
$$

式 (8) 的第二项是 prompt 之间难度差带来的, prompt 越杂越大; 式 (9) 把它换成 $\mathrm{Var}(R\mid x)/(k-1)$, 随 $k$ 增大而减小. $k=2$ 时第二项等于 $\mathrm{Var}(R\mid x)$, $k=4$ 时是它的三分之一.

### 2.3 一个四样本的例子

设某个 prompt 采了 4 条回复, KL 塑形后的奖励分别是 $2.0,\ 0.5,\ 1.5,\ -0.5$, 和为 $3.5$, 组均值 $\bar R=0.875$.

| $i$ | $R_i$ | $b_i$ (其余三条均值) | RLOO 优势 $R_i-b_i$ | 组内去均值 $R_i-\bar R$ | GRPO $z$ 分 |
|---|---|---|---|---|---|
| 1 | $2.0$ | $0.500$ | $+1.500$ | $+1.125$ | $+1.172$ |
| 2 | $0.5$ | $1.000$ | $-0.500$ | $-0.375$ | $-0.391$ |
| 3 | $1.5$ | $0.667$ | $+0.833$ | $+0.625$ | $+0.651$ |
| 4 | $-0.5$ | $1.333$ | $-1.833$ | $-1.375$ | $-1.432$ |

GRPO 一列用总体标准差 $0.960$. 三点可以从表里读出来.

第一, RLOO 优势之和为 0: $1.5-0.5+0.833-1.833=0$. 这对任意一组奖励都成立.

第二, RLOO 优势和组内去均值只差一个常数倍. 把式 (6) 代进去:

$$
R_i-b_i=R_i-\frac{\sum_j R_j-R_i}{k-1}=\frac{kR_i-\sum_j R_j}{k-1}=\frac{k}{k-1}\bigl(R_i-\bar R\bigr)
\tag{10}
$$

$k=4$ 时倍数是 $4/3$, 表里 $1.125\times 4/3=1.5$. 所以「组内减均值, 均值里含自己」的写法在期望上等于 RLOO 梯度乘 $(k-1)/k$, 方向一致, 只是整体缩小; 这个倍数可以并进学习率.

第三, GRPO 再除以组内标准差, 而标准差由 4 条奖励共同决定, 其中包括 $R_i$ 本身. 这一步之后系数和 $y_{(i)}$ 不再独立, 式 (4) 的条件不满足, 估计有偏. 它的效果是把每个 prompt 的优势拉到同一尺度, 奖励差异很小的 prompt 会被放大. RLOO 不做这一步, 优势保持 KL 塑形奖励的原始单位.

### 2.4 $k=2$ 时的对比形式

$k=2$ 时, 记两条回复中奖励较高的为 $y_+$, 较低的为 $y_-$. 两条的优势分别是 $R(y_+)-R(y_-)$ 和 $R(y_-)-R(y_+)$, 代入式 (7) 并改写成损失 (论文式 (11), $1/k$ 的系数并入学习率):

$$
\mathcal{L}^{k=2}_{\mathrm{RLOO}}=\frac{R(y_+)-R(y_-)}{2}\Bigl(-\log\pi_\theta(y_+\mid x)+\log\pi_\theta(y_-\mid x)\Bigr)
\tag{11}
$$

形式上是一个对比损失: 提高好回复的似然, 压低差回复的似然, 力度和两者的奖励差成正比. 两条奖励相同时这组样本不产生梯度. 论文附录 B 把它和 SLiC-HF (Zhao 等 2023), RRHF (Yuan 等 2023) 一类迭代微调里的对比损失放在一起讨论: 对比损失只知道哪条更好, RLOO 还用上了好多少.

### 2.5 两种 prompt 上的数值对照

式 (8) 和式 (9) 的差别, 用两个 prompt 代入就能看出来. 设 prompt A 很容易, 期望奖励 $V=+2$; prompt B 很难, $V=-2$; 两者的组内方差都是 $\mathrm{Var}(R\mid x)=1$. 训练中两类 prompt 各占一半, 滑动平均基线会收敛到 $c\approx0$.

- 用 $b_{\mathrm{MA}}$: 每个 prompt 的系数二阶矩是 $1+(\pm2-0)^2=5$, 其中 4 来自 prompt 的难度. A 的回复不论好坏都被推高, B 的回复都被压低.
- 用 $k=4$ 的留一基线: 系数二阶矩是 $1+1/3\approx1.33$, 和 prompt 的难度无关.

再看另一种极端: 某个 prompt 的 4 条回复奖励几乎相同, 分别是 $1.00,\ 1.01,\ 0.99,\ 1.00$. 组均值 $1.00$, 总体标准差约 $0.0071$.

| $i$ | $R_i$ | RLOO 优势 | GRPO $z$ 分 |
|---|---|---|---|
| 1 | $1.00$ | $0$ | $0$ |
| 2 | $1.01$ | $+0.0133$ | $+1.414$ |
| 3 | $0.99$ | $-0.0133$ | $-1.414$ |
| 4 | $1.00$ | $0$ | $0$ |

RLOO 给出的优势只有百分之一量级, 这个 prompt 对梯度几乎没有贡献. GRPO 除以标准差后, 这组 $0.01$ 的差别被放大成 $\pm1.41$, 和 2.3 节那组差别明显的奖励拿到同样量级的权重. 奖励模型的分数在 $0.01$ 上的差别常常是噪声, 这时 RLOO 的做法更保守; 反过来, 如果奖励尺度在不同 prompt 之间本来就差得很多 (例如某类 prompt 的奖励整体被压缩), RLOO 会让这类 prompt 学得很慢.

### 2.6 KL 项放在哪里

式 (1) 里的 KL 项是对整段回复算的, 实现中把它拆成 token 级的和:

$$
\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}=\sum_{t=1}^{T}\Bigl[\log\pi_\theta(y_t\mid x,y_{<t})-\log\pi_{\mathrm{ref}}(y_t\mid x,y_{<t})\Bigr]
\tag{12}
$$

每条回复只需要一次策略前向和一次参考模型前向, 得到两列 token log 概率, 相减求和, 乘 $\beta$, 再从奖励模型分数里减掉, 就是这条回复的 $R(x,y)$. 之后的留一基线和优势都在这个标量上算. 这样 KL 罚和奖励一起进入留一比较: 两条回复奖励模型分数相同时, 离参考策略更远的那条优势更低.

PPO 的做法是把 KL 项留在每个 token 的逐步奖励里, 再经 GAE 分配到各个位置. 序列级的写法里没有逐步分配, 所有 token 共享同一个优势. 两者在期望上优化同一个目标式 (1), 只是信用分配的粒度不同. 论文 Figure 2 的对比说明, 在只有终点奖励的 RLHF 设定下, 这种更粗的粒度没有损害效果.

### 2.7 实现

序列级 log 概率是 token 级 log 概率在回复范围内的和. 优势只算一次, 不参与求导:

```python
import torch

def rloo_advantage(rewards: torch.Tensor) -> torch.Tensor:
    """rewards: [B, k], 每行是同一 prompt 的 k 条回复的 KL 塑形奖励."""
    k = rewards.shape[1]
    assert k >= 2
    loo_mean = (rewards.sum(dim=1, keepdim=True) - rewards) / (k - 1)
    return rewards - loo_mean

def rloo_loss(rewards: torch.Tensor, seq_logprob: torch.Tensor) -> torch.Tensor:
    """seq_logprob: [B, k], 每条回复 token log 概率之和, 带梯度."""
    adv = rloo_advantage(rewards).detach()
    return -(adv * seq_logprob).mean()

r = torch.tensor([[2.0, 0.5, 1.5, -0.5]])
adv = rloo_advantage(r)
assert torch.allclose(adv, torch.tensor([[1.5, -0.5, 0.8333, -1.8333]]), atol=1e-4)
assert torch.allclose(adv, 4 / 3 * (r - r.mean(dim=1, keepdim=True)))
```

两条断言对应 2.3 节的表和式 (10).

![RLOO 留一法基线示意](./images/fig-rloo-loo-baseline.png)

**图 1 解析**

- 同一 prompt 进入策略, 采出 4 条回复 $y_1,\dots,y_4$, 各自得到奖励 $R_1,\dots,R_4$. 图中高亮的是第 2 条.
- $R_1,R_3,R_4$ 用虚线连向基线框, $R_2$ 没有箭头连向基线, 对应式 (6) 里 $j\ne i$ 的求和范围.
- 粉色框是 $A_2=R_2-b_2$, 绿色框是 $\nabla\log\pi_\theta(y_2\mid x)$, 两者相乘就是式 (7) 求和里的第 2 项. 图注写明不除组内标准差.

## 3. 与 PPO, GRPO, RAFT 的分界

### 3.1 部件对照

![RLOO 与 PPO, GRPO 的对照](./images/fig-rloo-not-ppo-grpo.png)

**图 2 解析**

- 左列 PPO: Actor, Critic, GAE, clip 四个部件都在, 优势按 token 计算.
- 中列 GRPO: 去掉 Critic, 组内减均值再除标准差, 均值和标准差都包含被打分的那条回复.
- 右列 RLOO: 基线是留一均值, 不除标准差. 中列和右列的差别只在基线是否含自己, 以及是否做标准化.

| | PPO | RLOO | GRPO | RAFT |
|---|---|---|---|---|
| 动作粒度 | token | 整段回复 | 整段回复的优势, 广播到每个 token | 整段回复 |
| 基线 | 价值网络 + GAE | 其余 $k-1$ 条均值 | 组均值 (含自己) | 无, 只保留组内最高分 |
| 标准化 | 无 | 无 | 除组内标准差 | 无 |
| 裁剪 | 有 | 无 | 有 | 无 |
| 训练中的模型 | 策略, Critic | 策略 | 策略 | 策略 |
| 每个 prompt 的样本 | 通常 1 条 | $k$ 条 | $G$ 条 | $k$ 条, 只用 1 条 |
| 无偏性 | GAE 有偏 | 无偏 | 标准化后有偏 | 优化的不是原目标 |

### 3.2 多样本基线的几种用法与开销

表里后三列都为同一 prompt 采多条样本, 区别在样本怎么用. GRPO (Shao 等, arXiv:2402.03300) 与 RLOO 论文都在 2024 年 2 月公开, 两者都用同一 prompt 的多条样本代替 Critic. GRPO 保留了 PPO 的比率裁剪和 token 级损失, 优势用组内 $z$ 分; RLOO 去掉裁剪, 基线只用其余样本. 后来 Dr. GRPO 针对的标准差偏置和长度偏置, 在 RLOO 里不出现, 因为 RLOO 既不除标准差, 也不按 token 数归一.

RAFT (Dong 等 2023) 同样每个 prompt 采 $k$ 条, 保留奖励最高的一条做 SFT, 其余 $k-1$ 条丢弃. 它只用到排序, 不用奖励的大小, 也没有负样本. RLOO 每条样本都进梯度, 高于留一均值的被推高, 低于的被压低.

显存和计算上的差别可以按模型份数来数. PPO 训练时要放四份: 策略 (训练), Critic (训练), 参考模型 (只前向), 奖励模型 (只前向). Vanilla PG 去掉了裁剪和比率, 仍保留学出来的 token 级基线, 也是四份. REINFORCE 和 RLOO 只剩三份, 其中只有策略需要梯度和优化器状态. 省下的是一个与策略同规模的可训练模型; 用 Adam 训练时, 每个可训练参数除权重外还要存梯度和两个动量, 省掉 Critic 节省的显存远多于一份权重. RLOO 多出的开销在生成侧: 每个 prompt 生成 $k$ 次, 奖励模型和参考模型的前向也是 $k$ 倍. 生成可以批量并行, 显存压力比训练一个 Critic 小.

ReMax (Li 等 2023) 也为基线多采样本: 它用贪婪解码回复的奖励作基线. Ahmadian 等在相关工作里把它列为同期的「额外采样」类方法. 两者的区别是: ReMax 的那条贪婪回复只用来算基线, 不进梯度; RLOO 的 $k$ 条回复既当别人的基线, 又贡献自己的梯度.

## 4. 实验

### 4.1 设定

**数据.** TL;DR 摘要 (Stiennon 等 2020): 116k 条人写摘要用于 SFT, 93k 对人工偏好用于训练奖励模型. Anthropic-HH (Bai 等 2022): 112k 条训练偏好对. HH 没有单独的 SFT 集, SFT 用偏好对里被选中的回复, 与 Yuan 等, Dong 等, Rafailov 等的做法一致. 偏好训练阶段的 rollout 沿用 SFT 阶段的 prompt.

**模型.** 两个任务都用 Pythia-6.9B 作基座; HH 上另跑 Llama-7B, 这组的 SFT 和奖励模型沿用 Dong 等 2023 (RAFT 论文) 的检查点. 上下文长度 512; 过滤掉 prompt 超过 448 token (TL;DR) 和 348 token (HH) 的样本, 给生成留出空间.

**训练.** Pythia 的 SFT 训 2 个 epoch, 学习率 $2\times10^{-5}$; Llama 的 SFT 训 1 个 epoch. 奖励模型训 1 个 epoch, 学习率 $10^{-5}$. 两者都用余弦衰减, 前 3% 线性预热. 偏好训练阶段:

| 设置 | TL;DR (Pythia) | HH (Pythia) | HH (Llama) |
|---|---|---|---|
| 训练步数 | 600 | 393 | 2 个 epoch |
| rollout batch / step batch | 512 / 256 | 512 / 256 | 2048 / 2048 |
| KL 系数 $\beta$ | 0.03 | 0.10 | 0.10 |

学习率固定, 前 3% 线性预热. 学习率在 $\{10^{-6},10^{-5},2\times10^{-5}\}$ (RAFT, RLOO) 和 $\{10^{-6},10^{-5}\}$ (PPO, Vanilla PG) 中扫, 最终各方法都取 $10^{-6}$. 每个 batch 做 2 步梯度更新.

**评估.** 用测试集 1000 条样本上的平均奖励 (训练用的同一个奖励模型) 和模拟胜率. 胜率用 AlpacaFarm 框架, GPT-4 作裁判: TL;DR 和 SFT 时用的参考摘要比, HH 和偏好数据里被选中的回复比. 生成用贪婪解码. 每个方法取测试奖励最高的检查点.

### 4.2 胜率

| 方法 | TL;DR | HH (Pythia) | HH (Llama) |
|---|---|---|---|
| RLOO $k=4$ | **77.9** | 43.7 | **64.1** |
| RAFT $k=4$ | 73.2 | 42.1 | 63.3 |
| RLOO $k=2$ | 74.2 | **47.6** | 62.2 |
| RAFT $k=2$ | 72.1 | 37.7 | 58.4 |
| REINFORCE w/ baseline | 70.7 | 37.9 | 55.3 |
| Vanilla PG | 70.4 | 36.4 | 52.3 |
| PPO | 67.6 | 29.2 | 32.0 |
| DPO | 66.6 | 39.0 | 61.9 |

上表来自论文 Table 1, 数字是对参考回复的胜率 (%). 几处对比:

- RLOO $k=4$ 比 PPO 高 10.3, 14.5, 32.1 个点. PPO 在三组里都排末尾或接近末尾; 在 HH (Llama) 上只有 32.0, 低于所有 REINFORCE 系方法.
- 同一 $k$ 下 RLOO 都高于 RAFT. 三组取平均, RLOO $k=2$ 和 $k=4$ 为 61.3 和 61.9, RAFT 为 56.1 和 59.5. 单组差距最大的是 HH (Pythia) 的 $k=2$, 47.6 对 37.7, 差 9.9 个点.
- 一般 $k=4$ 好于 $k=2$. 唯一例外是 HH (Pythia), $k=2$ 的 RLOO 是这一列最高.
- DPO 在 TL;DR 上是全表最低, 66.6; 在 HH (Llama) 上为 61.9, 和 RLOO $k=2$ 接近.

训练过程中的测试奖励 (Figure 2) 给出相近的排序. RLOO 全程最高; Vanilla PG 始终高于 PPO; 不对部分序列建模的 REINFORCE 和 RLOO, 又都高于把每个 token 当动作的 Vanilla PG 和 PPO. Vanilla PG 仍用一个学出来的 token 级基线 $b_\phi(s_t)$, 所以它和 PPO 一样要多加载一份模型. 论文把这组对比当作「在 RLHF 里对部分序列建模没有必要」的证据.

上面 RLOO 高于 RAFT 的几行还可以按样本数来比, 因为两者每个 prompt 用的在线样本数相同. Figure 3 和 Figure 4 按样本数画测试奖励: 同样的 $k$, RLOO 在整个训练过程中都高于 RAFT; $k=2$ 的 RLOO 追平或超过 $k=4$ 的 RAFT, 也就是只用一半的在线样本. 论文的解释是 RAFT 每组只保留最高分的一条, 其余样本的信息被丢弃; RLOO 用上了全部 $k$ 条, 也用上了奖励的数值大小.

### 4.3 对齐代价

偏好训练常伴随生成多样性下降, 论文用 HH (Llama) 的测试生成统计了长度, 困惑度, 1-gram 和 2-gram 多样性, 以及奖励方差 (Table 2):

| 方法 | 长度 | 困惑度 | Div-1 | Div-2 | 奖励方差 |
|---|---|---|---|---|---|
| RLOO $k=4$ | 60.6 | 27.6 | 0.10 | 0.43 | 3.1 |
| RAFT $k=4$ | 62.4 | 30.1 | 0.10 | 0.43 | 3.2 |
| RLOO $k=2$ | 58.6 | 29.2 | 0.11 | 0.44 | 3.0 |
| RAFT $k=2$ | 52.8 | 28.9 | 0.12 | 0.47 | 3.1 |
| REINFORCE | 47.2 | 27.2 | 0.13 | 0.50 | 2.7 |
| Vanilla PG | 39.1 | 39.0 | 0.15 | 0.54 | 3.7 |
| PPO | 16.5 | 40.4 | 0.34 | 0.60 | 2.3 |
| DPO | 104.4 | 33.8 | 0.08 | 0.39 | 无 |

RLOO 和 RAFT 的多样性指标基本一样, RLOO 困惑度略低. PPO 的多样性最高, 但平均长度只有 16.5, 困惑度也最高. REINFORCE 的奖励方差比 Vanilla PG 低 27% (2.7 对 3.7), 胜率也更高, 论文把这归于基线降方差的作用. DPO 的生成最长, 多样性最低.

### 4.4 对 KL 系数和奖励噪声的鲁棒性

论文鲁棒性实验的出发点是 RAFT 只用排名第一的样本: 凡是会让「哪条最好」判断出错的因素, 都会直接影响 RAFT 的学习. 作者用两类因素检验这一点.

**KL 系数.** 在 HH (Pythia) 上取 $k=2$, 比较默认的 $\beta=0.1$ 和更大的 $\beta\in\{0.25,0.5,1.0\}$ (Figure 5). $\beta=0.1$ 时两者到达的 KL 相近, RLOO 的奖励更高. $\beta$ 调大以后, RAFT 优化奖励更差, 离参考策略也更远. 式 (1) 里 KL 项是奖励的一部分, $\beta$ 越大, 排序越受 KL 项左右.

**奖励噪声.** 奖励模型本身是人类偏好的有噪声代理. 论文对每个 prompt, 往奖励模型二分类器的输出 logit 上加高斯噪声 $\epsilon\sim\mathcal{N}(0,\sigma^2)$, $\sigma\in\{1,3,5\}$ (Figure 6). 两种方法的训练奖励都下降, $\sigma=3$ 和 $5$ 时 RAFT 下降得多得多. 论文的解释是噪声打乱了组内的相对排名; RLOO 用奖励的差值加权全部样本, 排名错一位的影响小得多.

### 4.5 $k$ 取多大

Table 1 里 $k$ 从 2 增加到 4, RLOO 在 TL;DR 上涨 3.7 个点 (74.2 到 77.9), 在 HH (Llama) 上涨 1.9 个点 (62.2 到 64.1), 在 HH (Pythia) 上反而跌 3.9 个点 (47.6 到 43.7). RAFT 三组都随 $k$ 上涨, 涨幅是 1.1, 4.4, 4.9 个点. 每个 prompt 的生成次数随 $k$ 线性增加, $k=4$ 的生成量是 $k=2$ 的两倍.

可以这样读这组数字: RLOO 在 $k=2$ 时已经用上了两条样本的全部信息, 再加样本主要是降低基线的方差, 式 (9) 的第二项从 $\mathrm{Var}(R\mid x)$ 降到三分之一; RAFT 的 $k$ 决定最高分样本能有多好, $k$ 越大, 被选中的样本奖励越高, 收益更直接. 论文只测了 $k=2$ 和 $k=4$, 没有给出更大 $k$ 的结果. DeepSeekMath 的 GRPO 每题采 64 条, 那是可验证奖励的数学题, 设定不同.

## 5. 失效模式与适用边界

### 5.1 现象和监控量

| 现象 | 原因 | 处理 |
|---|---|---|
| 多数 prompt 的 $k$ 条回复奖励几乎相同, 有效 batch 变小 | 留一优势接近 0 | 换难度更合适的 prompt, 或增大 $k$ |
| 不同 prompt 的更新幅度差很多 | 不除标准差, 奖励方差大的 prompt 权重大 | 这是 RLOO 的有意选择; 需要统一尺度时改用 batch 级标准化, 接受偏差 |
| 显存省下, 生成时间变长 | 每个 prompt 生成 $k$ 次 | 用 vLLM 一类推理引擎做 rollout, 和训练分离 |
| 一次 rollout 做多步更新时不稳 | 估计器假设 on-policy, 没有比率修正 | 保持每个 batch 少量更新; 论文的设定是 2 步 |
| 中间步骤有奖励时难以利用 | 整段回复是一个动作, 只用总奖励 | 论文第 7 节列为未来工作 |

训练时可以盯住几个直接由式 (6) 和式 (7) 推出的量. 第一个是组内奖励的标准差: 它在 batch 里的分布反映有多少 prompt 还在提供信号, 大部分 prompt 的标准差趋近 0 时, 有效梯度会变小, 和学习率调低的效果相似. 第二个是式 (12) 算出的序列 KL 的均值: RLOO 没有比率裁剪, 策略离参考模型多远只受 $\beta$ 约束, 这一项持续上升而奖励模型分数停滞, 是开始利用奖励模型漏洞的信号. 第三个是回复长度: Table 2 里各方法的平均长度差了六倍多 (PPO 16.5, DPO 104.4), 长度往一个方向持续漂移时, 先检查奖励模型是否偏好长度.

### 5.2 论文没有覆盖的部分

论文在第 7 节写明了几处没有覆盖的内容: 没有研究奖励模型过优化 (策略在代理奖励上得分上升, 真实效用下降) 在 REINFORCE 系方法上的表现; 没有在有中间奖励的设定里测试留一法; 胜率只用 GPT-4 模拟, 没有人工评估; 也没有试验 ROUGE, BLEU 这类规则型奖励. 实验规模停在 7B, 数据只有 TL;DR 和 HH 两个.

奖励模型过优化的一般现象, 可以对照 [Best-of-N 与奖励模型过优化](../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/01-Best-of-N-奖励模型过优化/01-Best-of-N-奖励模型过优化.md); RLOO 与 GRPO 后续变体的关系见 [4.5 GRPO 家族与 RLVR](../../4.5-GRPO家族与RLVR/4.5-GRPO家族与RLVR.md).

## 参考文献

1. Ahmadian, A., Cremer, C., Gallé, M., Fadaee, M., Kreutzer, J., Pietquin, O., Üstün, A., Hooker, S. *Back to Basics: Revisiting REINFORCE Style Optimization for Learning from Human Feedback in LLMs*. ACL 2024. arXiv:2402.14740.
2. Kool, W., van Hoof, H., Welling, M. *Buy 4 REINFORCE Samples, Get a Baseline for Free!* ICLR 2019 Workshop on Deep Reinforcement Learning Meets Structured Prediction.
3. Williams, R. J. *Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning*. Machine Learning, 8, 229–256, 1992.
4. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., Klimov, O. *Proximal Policy Optimization Algorithms*. arXiv:1707.06347, 2017.
5. Shao, Z. 等. *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300, 2024.
6. Dong, H. 等. *RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment*. TMLR, 2023. arXiv:2304.06767.
7. Li, Z. 等. *ReMax: A Simple, Effective, and Efficient Reinforcement Learning Method for Aligning Large Language Models*. arXiv:2310.10505, 2023.
8. Ziegler, D. M. 等. *Fine-Tuning Language Models from Human Preferences*. arXiv:1909.08593, 2019.
9. Stiennon, N. 等. *Learning to Summarize from Human Feedback*. NeurIPS 2020.
10. Bai, Y. 等. *Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback*. arXiv:2204.05862, 2022.
