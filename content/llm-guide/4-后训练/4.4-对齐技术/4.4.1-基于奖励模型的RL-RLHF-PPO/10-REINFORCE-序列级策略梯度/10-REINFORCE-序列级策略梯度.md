---
title: "10 · REINFORCE：序列级策略梯度"
date: 2026-08-31
as_of: 2026-08-31
tags: [REINFORCE, RLHF, PPO, RLOO, RAFT, Williams]
---

# 10 REINFORCE：序列级策略梯度

序列级 REINFORCE 把整段生成 $y$ 当成一个动作。奖励模型通常只在写完之后给一个标量，策略梯度就用这个标量去乘整段 $\nabla\log\pi_\theta(y\mid x)$。Williams 1992 年把这条估计器写成「回报增量跟着特征资格走」；Ahmadian 等 2024 年把它接回 LLM 对齐，发现 PPO 为 Deep-RL 准备的 clip、GAE 和价值自举，在已经预训练加 SFT 的语言模型上经常用不上。本篇落在 4.4.1，主体是序列级 REINFORCE 加无偏的滑动平均基线 $b_{\mathrm{MA}}$（论文式 (8)）。邻居 [04-PPO](../04-PPO/04-PPO.md) 讲 token 级 MDP 和四件套。多样本留一法 RLOO 用其余 $k-1$ 条当基线、通常不除 std，正本在 [06-RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)。不是 DPO：那边离线分类，没有在线 rollout。

## 1. 奖励只打在整段结束

InstructGPT 那条三阶段还在：SFT、奖励模型、再用奖励抬策略。第三阶段默认走 PPO。Schulman 等把 PPO 做成「小步、稳更新」的工具，前提是 off-policy 梯度会大到把学习扯散。传统控制基准大体活在这个区里。落到语言模型上，一次迭代常要同时加载四份权重：正在训的生成器、估 KL 的参考模型、奖励模型、以及跟策略差不多大的 Critic。生成器和 Critic 还交错更新。账单跟着模型尺寸走，几十亿参数时这份拷贝不再是边角。

优化上还有一层更别扭的错位。PPO 把每个 token 当动作、把部分序列当状态，折扣 $\gamma=1$。奖励模型只给完整 $(x,y)$ 一个标量；除终点外，逐步的 $R_t$ 几乎只剩 KL 项。环境转移是确定的：在 $s_t$ 写下 $y_t$，下一状态就是拼上这个 token。从 MDP 看，这就是以 prompt 为初态、以整段生成为唯一动作、写完即终止的 bandit。把中间 token 都建成状态，是为 GAE 和 Critic 准备的脚手架，不是奖励真正存在的地方。

GAE 用 $\lambda\in[0,1]$ 在方差和偏差之间滑动。$\lambda$ 靠近 $0$ 时多自举、偏差大；$\lambda=1$ 时退回整段回报，无偏、方差名义上更高。论文在 Llama-7B + Anthropic-HH 上扫 $\lambda$：$\lambda=1.0$（Vanilla Policy Gradient）奖励最高，然后随 $\lambda$ 下降单调变差。$\lambda=0$ 和 $\lambda=0.5$ 那两条把方差压下去的变体，奖励明显更差。RLHF 这边默认就不那么抖，再引入偏差是白付的。

clip 也很少合上。他们拆掉 clip 和损失归一，学习曲线几乎不动；全程每个 batch 里真正被 clip 到的 token 平均不到 $5\%$。$\lambda=1$ 时再关掉 clip、去掉比率 $\pi_\theta/\pi_{\mathrm{old}}$，PPO 损失直接退回 Vanilla PG。去掉夹子不但没垮，奖励还略升。学习已经贴着 on-policy 走，策略迭代之间变得很慢，为「防止一步跨太远」准备的夹子很少合上。

词表名义上几万维，看起来像巨大动作空间。附录用 Llama SFT、词表 32k 量过：第一个 token 之后，单步 top-1 大约收走 $60\%$ 的质量，top-16 超过 $90\%$。熵在第一步之后掉下去，后面只略回升。搜索空间看起来大，走得动的那一小块并不大。从随机策略训 Atari 时，REINFORCE 的方差是真病；从预训练加 SFT 的语言模型接着微调，这份病未必还在。

## 2. 整段生成当成一个动作

RLHF 第三阶段仍最大化带 KL 塑形的期望奖励。论文把塑形后的标量写成

$$
R(x,y)=r_{\phi}(x,y)-\beta\log\frac{\pi_{\theta}(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}. \tag{1}
$$

$\beta$ 管离参考策略有多远。无惩罚地抬 $r_{\phi}$ 会把连贯性掏空，这一项不能省。差别在怎么估 $\nabla_{\theta}\mathbb{E}[R]$。

Williams（1992）的 REINFORCE 不经过价值网络。轨迹概率对参数求导之后，环境转移消掉，只剩对数策略乘回报。把整段 $y$ 当成一个动作，估计器就是

$$
\mathbb{E}_{x\sim\mathcal{D},\,y\sim\pi_{\theta}(\cdot\mid x)}\bigl[R(y,x)\,\nabla_{\theta}\log\pi_{\theta}(y\mid x)\bigr]. \tag{2}
$$

名字来自那句拆写：REward Increment = Nonnegative Factor $\times$ Offset Reinforcement $\times$ Characteristic Eligibility。特征资格是 $\nabla\log\pi$，偏移强化是 $r-b$，非负因子是学习率一类步长。没有 Actor-Critic，没有 TD 目标。

整段 $y=(y_1,\ldots,y_T)$ 的对数概率仍是逐步相加

$$
\log\pi_{\theta}(y\mid x)=\sum_{t=1}^{T}\log\pi_{\theta}(y_t\mid x,y_{<t}). \tag{3}
$$

式 (2) 的 $\nabla_{\theta}\log\pi_{\theta}(y\mid x)$ 因此会流过每一个已生成 token，并不是把整句当成不可微的黑盒。变的是**权重**：同一条 $y$ 上所有 $t$ 共享同一个 $R(x,y)$，没有逐步 TD，没有 $\lambda$。PPO / Vanilla PG 按部分序列估回报，中间那些只有 KL、没有 $r_{\phi}$ 的状态都要单独建一个 $V$。序列级 REINFORCE 不建这些状态。

$\gamma=1$、奖励又稀的时候，两条权重其实很近。设 $T=3$，逐步 KL 罚都是 $0.1$，奖励模型只在结束给 $1.8$。PPO 那套逐步塑形就是 $R_1=0.1$、$R_2=0.1$、$R_3=1.9$。从每个前缀往右加，剩余回报分别是 $2.1$、$2.0$、$1.9$。三个数几乎一样，差的只是前面那两小截 KL。序列级式 (1) 若把 KL 写在整段上，三个 token 会拿到同一个 $R$。差一截 KL 碎屑，换来一份 Critic 和一套 GAE 回扫，账不算太划算。$\lambda$ 再往下调，GAE 开始拿 $V(s_{t+1})$ 冒充后面的 $1.8$，偏差就进估计器了。Llama-HH 上 $\lambda$ 越小奖励越差，和这组算术是同一件事：终点那一笔才是真的，中间没有真实 $r_{\phi}$ 可自举。

![每个 token 当动作对照整段 y 当动作](./images/fig-reinforce-token-vs-seq.png)

> 图 1：左列每个 token 是动作，Critic 出 $V$，GAE 用 $\lambda$ 自举出逐步 $A_t$；右列整段 $y$ 是一个动作，终局 $R$ 减滑动平均 $b_{\mathrm{MA}}$，同一标量乘整段 $\nabla\log\pi(y\mid x)$。

**图 1 解析**

- 两栏都从上往下，中间没有箭头。左侧是 token 级 MDP，右侧是序列 bandit。
- 左：蓝框 prompt 进三条绿 token。鲑肉色 Critic 用虚线进橙色 GAE，对应「拷贝 $V$ 来自举」。粉框是逐步权重 $A_t\nabla\log\pi(y_t\mid s_t)$。
- 右：蓝框同一条 prompt 进一块绿 $y=(y_1,\ldots,y_T)$。黄框 $R(x,y)$ 只在结束时出现。金色 $b_{\mathrm{MA}}$ 用虚线进粉框，粉框写的是 $(R-b_{\mathrm{MA}})$，不是 clip。
- 底栏左脚是 token MDP + GAE，右脚是序列 bandit + 无偏 $b_{\mathrm{MA}}$。不要把右边的粉框读成 PPO。

从纯 RL 看，转移核 $P(\{y_{<t+1},x\}\mid s_t,y_t)=1$，环境按写出的 token 确定地往前走。MDP 塌成「初态是 prompt、终态是写完」的 bandit。Kreutzer 等 2017、Nguyen 等 2017 在神经机器翻译里已经这么用过；Ahmadian 等是把它写进 LLM 偏好训练，并拿 Vanilla PG / PPO 做对照。迭代微调（RAFT 一类）其实也是先生成整段再过滤，只是更新改成了交叉熵。

## 3. 无偏基线：滑动平均 $b_{\mathrm{MA}}$

式 (2) 无偏，但单条样本的 $R\nabla\log\pi$ 会抖。减一个与梯度协方差高、自身不依赖当前这条样本的 baseline $b$，方差降、期望不变：

$$
\mathbb{E}\bigl[(R(y,x)-b)\,\nabla_{\theta}\log\pi_{\theta}(y\mid x)\bigr]. \tag{4}
$$

$b$ 只要不由当前这条 $y$ 决定（或对动作是常数），$\mathbb{E}[b\nabla\log\pi]=\mathbb{E}[b]\,\mathbb{E}[\nabla\log\pi]=0$。Williams 原文里的偏移强化就是这一项。最省事的无参选择是训练过程里所有奖励的滑动平均

$$
b_{\mathrm{MA}}=\frac{1}{S}\sum_{s}R(x^{s},y^{s}). \tag{5}
$$

$S$ 是步数。它跨 prompt、跨时间，对「这一条 $x$ 现在值多少」反应慢。Williams 允许把 $b$ 做成可学习的网络；Ahmadian 等故意停在无参平均，就是为了不再养一份和策略同级的权重。实现上常做成指数滑动，系数接近 $1/S$ 的慢更新；论文式 (8) 写成对历史步的算术平均。记号跟论文走。

手算四步。塑形后的奖励依次是 $1.2$、$0.8$、$1.5$、$0.4$。第四步结束时

$$
b_{\mathrm{MA}}=(1.2+0.8+1.5+0.4)/4=0.975.
$$

新来一条 $R=1.4$，优势 $1.4-0.975=0.425$。这条 $y$ 里每个 token 都乘 $+0.425$ 再反传 $\nabla\log\pi$。若下一条掉到 $0.3$，优势 $-0.675$，整段往下压。没有 $V_{\phi}$，没有 GAE 回扫。

```python
def ma_baseline_and_adv(history: list[float], r_new: float) -> tuple[float, float]:
    """式 (5)：历史奖励的算术平均当 b_MA，再减出无偏优势。"""
    b = sum(history) / max(len(history), 1)
    return b, r_new - b


b, a = ma_baseline_and_adv([1.2, 0.8, 1.5, 0.4], 1.4)
assert abs(b - 0.975) < 1e-9 and abs(a - 0.425) < 1e-9
```

若把当前这条 $R$ 自己加进平均再减，基线和样本不再独立，$\mathbb{E}[b\nabla\log\pi]$ 那条拆不开。有限样本上这等于把优势按 $(S-1)/S$ 缩小一圈，排序还在，尺度变了。GRPO 的组均值含自己，再除 std，走的是另一条尺度。$b_{\mathrm{MA}}$ 用的是**过去**的步，当前 $y$ 不进式 (5) 的求和，独立性保住。实现若改成「当前 mini-batch 的均值」，无偏性要另证，那就已经不是论文式 (8)。

论文把 Vanilla PG 和这条序列级 REINFORCE 拆开比。Vanilla PG 仍按 token 展开轨迹回报，并从部分序列学一个 $b_{\phi}(s_t)$：

$$
\sum_{i=t}^{T}\gamma^{T-i-1}R_{t}(x,y_{t})-b_{\phi}(s_{t}). \tag{6}
$$

$b_{\phi}$ 用平方误差拟合从 $t$ 起的回报，像价值网络那样占一份与策略同级的拷贝。$\lambda=1$ 时 PPO 的 GAE 退回式 (6) 这种「从每个前缀看整段剩余」，仍是 token 级动作。序列级 REINFORCE 只在整段 $R(x,y)$ 上减 $b_{\mathrm{MA}}$，少一份模型。Win-rate 上两条都比 PPO 高。TL;DR 上 REINFORCE 带滑动平均是 $70.7$，Vanilla PG 是 $70.4$，PPO 是 $67.6$。HH + Llama 上三者是 $55.3$、$52.3$、$32.0$。HH + Llama 这一格，序列级已经明显高于「按部分序列估回报」的 Vanilla PG。中间那些只有 KL 的状态，值不值得单独建一个 $V$，答案是不值得。

滑动平均解决不了「同一 prompt 上几条回复谁高谁低」。它混的是不同 $x$、不同时刻的分数。要这块对照，就得在同一次 rollout 里对同一个 $x$ 多采几条。那是 RLOO：其余 $k-1$ 条当基线、通常不除 std。公式和 Win-rate 正本在 [06-RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)。

## 4. 不是 clip，不是 top-1，不是组内 $z$-score

四条更新路径共享「在线采、用奖励」，吃法完全不同。图 2 按列钉住。

![REINFORCE、RLOO、PPO、RAFT 四列对照](./images/fig-reinforce-four-col.png)

> 图 2：同一 prompt 分出四列。REINFORCE 用一条样本减 $b_{\mathrm{MA}}$；RLOO 用其余 $k-1$ 条均值；PPO 走 token 级 GAE 加 clip；RAFT 只对 $\arg\max$ 做交叉熵。

**图 2 解析**

- 顶栏 `same prompt x` 分叉进四列，列内自上而下，列之间没有箭头。
- 第一列粉框是 $(R-b_{\mathrm{MA}})$。金色滑动平均用虚线进这个粉框。脚注 `1 sample, unbiased MA`。
- 第二列粉框是 $A_i=R_i-b_i$，基线写明其余 $k-1$、no std。脚注 `LOO baseline, not z-score`。
- 第三列粉框才是 `clip times A_GAE`。Critic 是鲑肉色，不是粉框。四模型写在黄框里。不要把第一列、第二列的粉框读成 PPO。
- 第四列没有粉框。虚线进灰色 `discard k-1`，紫色交叉熵只吃冠军。脚注 `top-1 CE, not PG`。

PPO 的 clip 锁的是重要性比率 $\pi_\theta/\pi_{\mathrm{old}}$，价值网络估每个前缀的 $V$，GAE 用 $\lambda$ 自举。本篇的序列级 REINFORCE 主路径没有这三件。clip 在他们的模型–数据对上触发率不到 $5\%$，拆掉之后奖励不降。公式和四件套在 [04-PPO](../04-PPO/04-PPO.md)。

RAFT 和序列级方法共享「每 prompt 采 $k$ 条」的预算，更新完全不同。RAFT 按 $R(x,y)$ 排序，只对最高的那条做交叉熵，其余 $k-1$ 条丢掉。REINFORCE 一条样本也要把整段对数概率乘上 $(R-b_{\mathrm{MA}})$；RLOO 更是 $k$ 条全进梯度。同一预算下，一个吃冠军，一个吃相对位置。采、排、只训 top-1 的正本在 [07-RAFT](../07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)。

DPO 连第三阶段的在线 RL 都跳过：偏好对直接进分类损失，不训独立奖励模型，也不做 rollout。序列级 REINFORCE 仍走 Ziegler 那条三阶段：SFT、BT 奖励模型、再用 $r_{\phi}$ 在线打分。论文拿 DPO 当「RL-free」对照，不是把 REINFORCE 写成 DPO 的变体。

GRPO 和这篇同月挂出，都是「一组样本当基线、拆掉 Critic」。分叉在估计器：GRPO 是含自己的组均值和标准差，再接 PPO 式 clip；序列级 REINFORCE 的 $b_{\mathrm{MA}}$ 跨 prompt 混合，不含「这一组里的自己」。组内 $z$-score 的写法见 [02-GRPO](../02-GRPO/02-GRPO.md)。不要把 $b_{\mathrm{MA}}$ 写成 GRPO 的退化。

还要和 [4.4.3-RLAIF](../../4.4.3-RLAIF/4.4.3-RLAIF.md) 的附录 E 拆开。Lee 等也用 REINFORCE，基线却是**学出来的价值网络** $V_{\psi}$。奖励仍只打在最后一个 token，$\gamma=1$，回报就是终局 $R_T$。策略损失写成

$$
\mathcal{L}_{\mathrm{PG}}(\theta)=-\sum_{t}\log\pi_{\theta}(A_t\mid X_t)\,\overline{(R_T-V_{\psi}(X_t))},
$$

横杠表示优势不反传。价值网络自己拟合 $\sum_t(R_T-V_{\psi}(X_t))^2$。Williams 的 $b$ 在那里就是 $V_{\psi}$。没有 GAE 的 $\lambda$，没有 clip，但多了一份与策略同初始化的 $V$。Ahmadian 的 $b_{\mathrm{MA}}$ 是历史奖励的标量平均，零额外网络。两套都叫 REINFORCE，基线不是同一件东西。人评胜率、标注成本在 4.4.3，和 $b_{\mathrm{MA}}$ 不是同一套实验。

| | 序列 REINFORCE | Vanilla PG | PPO | RAFT | GRPO |
|--|----------------|------------|-----|------|------|
| 动作 | 整段 $y$ | 逐步 token | 逐步 token | 整段，只留 top-1 | 常把整段优势广播到 token |
| 基线 | $b_{\mathrm{MA}}$，无参 | 学出来的 $b_{\phi}(s_t)$ | $V_{\phi}$ + GAE | 无优势，排序当过滤 | 组均值（含自己） |
| 尺度 | 回报原单位 | 前缀回报量纲 | 经 GAE | 交叉熵 | 除组内 std |
| 信任域 | 主估计器无 clip | 无 clip | clip $1\pm\varepsilon$ | 无 | 对称 clip 仍在 |
| 额外网络 | 无 Critic | 一份 baseline 网络 | Critic，约略与 Actor 同规模 | 无（一次加载一个） | 无 |

## 5. 一手数字：Vanilla PG 对 PPO，序列级再高一截

实验落在两个偏好集、两个基座上。TL;DR Summarize 训练集含 116k 条人类写的指令和 93k 条偏好对；预处理后的 Anthropic-HH 含 112k 条训练偏好对。基座是 Pythia-6.9B；HH 上再加 Llama-7B 做预训练质量消融。SFT 与 RM 上下文 512。过长 prompt 滤掉：TL;DR 超 448 token、HH 超 348 token。RM 和策略都从对应 SFT 初始化。偏好阶段 TL;DR 跑 600 step，rollout batch 512、更新 batch 256，$\beta=0.03$；HH 上 Pythia 跑 393 step，同 batch；Llama 跟 RAFT 文的设定，rollout 与 step batch 都是 2048，两 epoch，$\beta=0.10$。学习率常数 $1\times 10^{-6}$，每批两个梯度步。评测用训练 RM 在 1000 条测试 prompt 上算平均奖励；Win-rate 按 AlpacaFarm，GPT-4 当人类代理，TL;DR 对 SFT 参考摘要、HH 对偏好对里更好的那条，解码默认 greedy。表中数字取测试奖励最高的那个 checkpoint。

要对的是「要不要建部分序列」和「无偏 $b_{\mathrm{MA}}$ 够不够」。论文 Table 1 里这三行是：

| 方法 | TL;DR | HH (Pythia) | HH (Llama) |
|------|------:|------------:|-----------:|
| REINFORCE + 滑动平均 | 70.7 | 37.9 | 55.3 |
| Vanilla PG | 70.4 | 36.4 | 52.3 |
| PPO | 67.6 | 29.2 | 32.0 |

论文把 Vanilla PG REINFORCE 相对 PPO 的胜率增益概括成 **3.2%–20.3%**，分母是全部数据集与基座配对。表上沿对得上：HH + Llama，Vanilla PG $52.3$、PPO $32.0$，相差 $20.3$ 个点。TL;DR 上 REINFORCE 带滑动平均 $70.7$、PPO $67.6$，差 $3.1$ 个点，和概括里的 $3.2\%$ 贴在同一量级。三条设定上 Vanilla PG 都压过 PPO；序列级再带 $b_{\mathrm{MA}}$，TL;DR 与 Vanilla PG 几乎打平（$70.7$ 对 $70.4$），HH + Llama 拉开到 $55.3$ 对 $52.3$。不建部分序列，没有把胜率送回去。

测试奖励和学习曲线跟 Win-rate 同向。同一份训练 RM、同一千条测试 prompt 上，不建部分序列的 REINFORCE 和 RLOO 压过 Vanilla PG 与 PPO；Vanilla PG 又压过 PPO。少一份价值网络，优化目标还更高。这不是「简单方法碰巧不差」，是逐步自举在这个奖励密度下引入了用不上的偏差。奖励曲线全程同向，不是某一个 checkpoint 上的抖动。

RLOO 是这条估计器的多样本扩展。他们的设定里 RLOO 超过 PPO、DPO、RAFT。Table 1 上 RLOO $k=4$ 的 Win-rate 是 $77.9$、$43.7$、$64.1$，对应 PPO 的 $67.6$、$29.2$、$32.0$。采样效率、噪声和 KL 敏感性见 [06-RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)。

对齐税用 HH + Llama 的长度、PPL、多样性看。REINFORCE 带滑动平均：平均长度 $47.2$，PPL $27.2$，Diversity-1 / Diversity-2 为 $0.13$ / $0.50$，奖励方差 $2.7$。Vanilla PG 是 $39.1$、$39.0$、$0.15$、$0.54$、$3.7$。文中写滑动平均把奖励方差压低约 $27\%$，Win-rate 还略高。PPO 平均只有 $16.5$ token，PPL $40.4$，Diversity-1 冲到 $0.34$：短才显得「多样」，不是更好的语言。DPO 冲到 $104.4$ token，PPL $33.8$，Diversity-1 掉到 $0.08$，偏冗。安全、无害这类「低分样本代价大」的场景，方差本身就是指标。$b_{\mathrm{MA}}$ 在这里不只是为了好看的学习曲线。

论文把结论写得很硬：LLM 偏好训练里，建模部分 completion 是多余的工作；改成整段动作之后，RL 阶段更简单，学得也更快。PPO 那份 Critic 不只贵，还在用一个没有真实逐步奖励的 MDP。这一档数字只对这篇的模型–数据对负责，换到过程奖励或更猛的探索，估计器要不要再拆，是另一篇的事。

SFT 学习率 Pythia 为 $2\times 10^{-5}$、两 epoch，Llama 上一 epoch 就够；RM 一 epoch、$1\times 10^{-5}$，余弦衰减、warmup 比例 $0.03$。偏好阶段在 $\{10^{-6},10^{-5},2\times 10^{-5}\}$ 里扫过学习率，各算法最后都落到 $1\times 10^{-6}$。这些是复现用的超参，不是估计器本身。

## 6. 失效与边界

滑动平均把对照范围摊到「到目前为止见过的所有分数」。它不看当前这条 prompt 上几条回复谁高谁低，也不学前缀价值。下面这些情况它帮不上，或者会换一种坏法。

| 现象 | 原因 | 说明 |
|------|------|------|
| 同 prompt 内相对好坏 | $b_{\mathrm{MA}}$ 跨题混合 | 要当场对照就换 RLOO 的其余 $k-1$ 条，见 06 |
| 奖励尺度漂移 | 历史平均滞后 | 学习前期 $R$ 往上走时，$b_{\mathrm{MA}}$ 会系统性偏低，优势偏正。指数滑动能跟上，论文写的是算术平均 |
| 逐步过程奖励 | 本文设定奖励只在整段 | 局限节写了：没把估计器接到「部分序列 + 中间奖励」上。过程监督是另一条奖励密度问题 |
| 代理奖励和金奖励分叉 | 未做 Gao 等说的 RM over-optimization | 局限节写明，RAFT 同类方法同样缺这一笔 |
| Win-rate 是 GPT-4 代理 | 没有最终人类偏好相关 | 表 1 是模拟胜率，不是人评 |
| clip 几乎用不上 | 该论文的模型–数据对上策略变得慢 | 换到更猛的探索或 MoE 路由抖动时，序列级 IS 和 clip 可能重新变得必要，那是 GSPO 的问题，不是式 (2) 的问题 |
| 短回复梯度更大 | $(R-b)$ 乘整段 $\nabla\log\pi$，逐步展开后每个 token 分到同一标量 | 短的每一步梯度更大。论文主文没有把长度偏差当成主病来修 |

$k=1$ 时留一法的分母是 $0$，退回的就是这条滑动平均。单样本是本篇的默认设定，不是实现漏了多样本。论文还没拿 ROUGE、BLEU 这类生成指标当奖励扫过。单样本 REINFORCE 的方差上限仍在：一条 $y$ 的 $R$ 既当分数又当权重，极端高分会把更新带走。$b_{\mathrm{MA}}$ 只减掉全局水位，减不掉「这一条 $x$ 上运气好」。要压这一层，采样条数得加上去，那就离开单样本主体，进 06。

要 GAE 与四模型怎么咬合，读 [04-PPO](../04-PPO/04-PPO.md)；要留一法多样本，读 [06-RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)；要只训冠军，读 [07-RAFT](../07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)；要学出来的价值基线而不是滑动平均，读 [4.4.3-RLAIF](../../4.4.3-RLAIF/4.4.3-RLAIF.md) 附录 E。序列级 REINFORCE 的估计器停在式 (2) 和式 (5)：整段一个动作，基线是历史奖励的平均。

## 参考文献

1. Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine Learning*, 8(3–4), 229–256.
2. Ahmadian, A., Cremer, C., Gallé, M., Fadaee, M., Kreutzer, J., Pietquin, O., Üstün, A., & Hooker, S. (2024). [Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs](https://arxiv.org/abs/2402.14740). In *Proceedings of the 62nd ACL (Volume 1: Long Papers)*, pp. 12248–12267. HTML：[arxiv.org/html/2402.14740](https://arxiv.org/html/2402.14740). Anthology：[2024.acl-long.662](https://aclanthology.org/2024.acl-long.662/).
3. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
4. Schulman, J., Moritz, P., Levine, S., Jordan, M., & Abbeel, P. (2018). [High-Dimensional Continuous Control Using Generalized Advantage Estimation](https://arxiv.org/abs/1506.02438).
5. Sutton, R. S., & Barto, A. G. (2020). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press.（Vanilla Policy Gradient）
6. Kool, W., van Hoof, H., & Welling, M. (2019). [Buy 4 REINFORCE samples, get a baseline for free!](https://api.semanticscholar.org/CorpusID:198489118). *DeepRLStructPred @ ICLR*.
7. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767).
8. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290).
9. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).（GRPO 组内 $z$-score，对照用）
10. Lee, H., et al. (2023). [RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback](https://arxiv.org/abs/2309.00267).（附录 E：REINFORCE + 学习价值网络，与 $b_{\mathrm{MA}}$ 不是同一套基线）
11. Stiennon, N., et al. (2020). [Learning to Summarize from Human Feedback](https://arxiv.org/abs/2009.01325).（TL;DR 数据）
12. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).（Anthropic-HH）
13. Kreutzer, J., Sokolov, A., & Riezler, S. (2017). [Bandit structured prediction for neural sequence-to-sequence learning](https://aclanthology.org/P17-1138). *ACL*.
14. Ziegler, D. M., et al. (2020). [Fine-tuning Language Models from Human Preferences](https://arxiv.org/abs/1909.08593).
15. Gao, L., Schulman, J., & Hilton, J. (2022). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760).
