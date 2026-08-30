---
title: "07 · Best-of-N：奖励模型过优化"
date: 2026-08-31
tags: [Best-of-N, BoN, 过优化, Goodhart, 奖励模型, RLHF, PPO]
as_of: 2026-08-31
math: true
---

# 07 Best-of-N：奖励模型过优化

Best-of-$n$（BoN）对同一条 prompt 采 $n$ 条回复，用**代理奖励模型**挑分数最高的那条。它本身**不是训练损失**：没有反向传播，策略参数可以一动不动。Gao、Schulman、Hilton 的 *Scaling Laws for Reward Model Overoptimization*（[arXiv:2210.10760](https://arxiv.org/abs/2210.10760)，ICML 2023，PMLR 202:10835–10866）拿 BoN 和强化学习两条路，量的是把代理 RM 拧得太紧时，金标 RM 怎么掉。数字和公式跟 HTML：[arxiv.org/html/2210.10760](https://arxiv.org/html/2210.10760)。

这不是新的策略梯度，也不是 [DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)。不是 [RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)：RAFT 把 RM 的 top-1 **写进训练**做 SFT；BoN 可以只在解码时选。本篇主线是过优化标度，不是「怎么微调」。不是 [GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 的组内 $z$-score。

## 1. 代理分还能涨，金标已经掉头

Goodhart 那句老话：度量一旦变成目标，它就不再是好度量。RLHF 里人偏好贵，奖励模型是学来的代理。对着这份静态代理优化，拧过某个点，真正想要的东西会往下走。论文把这叫做 overoptimization。现象早就有人看见，缺的是标度：金标分随「拧了多少」怎么掉，系数怎么随 RM 大小、数据量、策略大小变。

人标太贵，标度实验要很多次测量。论文改用合成设定：固定一个大的「金标」RM 当「人」，用它给成对回复打硬标签，再训一堆更小的代理 RM。优化只看见代理分。评测时把同一批回复再拿金标 RM 打一遍。代理还在涨、金标先涨后掉，这条分叉就是要拟合的对象。

优化有两条路。一条是 BoN：解码时采 $n$ 条、按代理分取 $\arg\max$。另一条是 [PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)，KL 惩罚默认关掉。两条路都会过优化。函数形状不一样。更麻烦的是，**KL 不能拿来比较 BoN 和 RL「优化了多少」**：RL 在 KL 上更慢，但代理分对金标分的曲线更像。这句话在 §3.5 和讨论 §4.1，正文后面会钉死。

## 2. 采 $n$ 条、代理 RM 取最高，没有反传

BoN 也叫拒绝采样或 reranking。对一条 prompt $x$，从当前策略 $\pi$ 独立采 $n$ 条 $y_1,\ldots,y_n$，用冻结的代理 RM 打分，留下

$$
y^{\star}(x)=\arg\max_{j\le n}\,r_{\mathrm{proxy}}(x,y_j).
\tag{1}
$$

没有优势、没有比率、没有 clip。$n-1$ 条低分样本参与了比较，不改任何权重。部署时每次回答都要付 $n$ 次采样，这是推理成本，不是训练损失。

![同一 prompt 采 n 条，代理 RM 打分后取 argmax；解码选择，无反向传播](./images/fig-bon-select-max.png)

> 图 1：同一 prompt 采 $n$ 条，代理 RM 给每条打分，取 $\arg\max$。虚线框标明这是解码期选择，没有反向传播。

**图 1 解析**

- 主方向从左到右：`prompt x` → 从 $\pi$ 采 $n$ 条 → 候选 $y_1,\ldots,y_n$ → 代理 RM 打分 → $\arg\max$ → 留下的 $y^{\star}$。
- 候选框是一次画出的 $n$ 条，不是迭代微调。没有 $G_t\to G_{t+1}$ 回边。
- $\arg\max$ 下面的虚线进「decode-time only / no backprop」。选择发生在解码，计算图在这里停。
- 没有 Critic，没有交叉熵框。那是 PPO 或 RAFT 的吃法，不要画进来。

和 RAFT 的分界就在这张图停下来的地方。RAFT 也是「采 $K$、取最高」，但它把冠军写进交叉熵，下一轮生成器带着新参数再采。BoN 可以永远停在图 1：参数还是 SFT 检查点，只是回答前多采几次。WebGPT、Stiennon 的摘要模型早就把推理期 best-of-$n$ 当强基线。Gao 等要的不是把这套蒸馏回权重，是把它当成一条可解析的优化路径，去量过优化。

BoN 相对初始策略的 KL 有闭式。Stiennon 等（2020）附录 G.3：

$$
\mathrm{KL}_{\mathrm{bon}}=\log n-\frac{n-1}{n}.
\tag{2}
$$

$n=1$ 时为 $0$。大 $n$ 时大约是 $\log n-1$，单位是 nat。论文用 $n=1000$ 对应 $\mathrm{KL}\approx 6$ nat，$n=60{,}000$ 对应 $\approx 10$ nat，和式 (2) 对得上。中间那些 $n$ 的金标分、代理分，不用「有放回再抽一遍、再取 max」那种朴素估计。已经采好一个大池之后，朴素做法会对每个中间 $n$ 做有放回抽样、取最大值、再平均：同一条回复可能被抽中多次，方差大，也浪费。论文用 Nakano 等（2021）附录 I 的无偏估计，直接走顺序统计量，不必为每个中间 $n$ 重抽一组。

| $n$ | $\mathrm{KL}_{\mathrm{bon}}$（式 (2)，nat） |
|----:|------------------------------------------:|
| 1 | $0$ |
| 4 | $\log 4-3/4\approx 0.636$ |
| 16 | $\log 16-15/16\approx 1.83$ |
| 1000 | $\approx 5.91$（文中写作 $\approx 6$） |
| 60{,}000 | $\approx 10.0$ |

RL 这边没有闭式。PPO 每步改的是上一步的策略，没有 KL 惩罚时，$\mathrm{KL}_{\mathrm{RL}}$ 随步数近似二次涨（Figure 14、16）。同一把 KL 尺子，BoN 和 RL 花得完全不是一个速度。

## 3. 金标是 InstructGPT 的 6B RM，策略默认 1.2B

环境跟 InstructGPT 同一套：prompt 来自各式自然语言指令，策略写回复，RM 给标量分。初始策略是 GPT-3 系列检查点，在 InstructGPT 的人类示范上做了 2 个 epoch 的 SFT。RM 也是 GPT-3 架构，加一个标量头。RL 用 PPO。附录 C Table 1：RM batch 64，学习率乘数 $1.67\times 10^{-2}$；RL batch 256，学习率乘数 $4\times 10^{-3}$，clip $0.2$，每次 rollout 256 步，每 epoch 128 个 minibatch，GAE $\lambda=0.95$。除了 §3.6 那组，**其余 RL 实验的 KL 惩罚都设成 0**。超参大多沿用默认，换一组超参，趋势可能变。

合成设定写在 §2.1。金标 RM 固定为 Ouyang 等（2022）InstructGPT 的 **6B** 奖励模型，扮演「人」。代理 RM 从 **3M 到 3B**。小于 3M 的两只接近随机、偏离趋势，已经剔除。合成比较 **100{,}000** 条，留 **10%** 做验证，训练侧就是 90{,}000。标签规则是硬阈值：同一 prompt 下，金标分高的那条永远赢，不是按 $\sigma(\Delta r)$ 采样。作者试过按置信度采样，结果更噪。

Figure 1 扫 RM 大小时，**策略固定 1.2B**。§3.4 另做了 6B 对 1.2B 的策略对照，RM 先固定 12M，再在 3B RM 上复核过一轮。没有 1.5B 这一档。

RM 分平移不变。为了跨模型可比，每只 RM 都 recenter：初始策略的平均奖励为 0。金标分还做了方差单位化（作者后来说这一步没必要，但没改）。硬阈值标签不含金标的置信度，代理 RM 因此是未校准的。实验做完之后，用软标签验证集把代理 logits 再缩一次，去极小化交叉熵。这套后处理完全不影响 BoN 的 $\arg\max$；对 RL，Adam 对损失尺度不敏感，作者认为大概也没影响。

$R(0)=0$ 由此而来：还没优化时，相对初始策略的平均奖励就是 0。后面所有金标曲线从原点起。

## 4. 两条 $R(d)$：二次项对 $\log d$

KL 本身是平方型距离（Bai 等 2022 §4.3）。论文定义

$$
d:=\sqrt{D_{\mathrm{KL}}(\pi\Vert\pi_{\mathrm{init}})},
\tag{3}
$$

函数写成 $d$ 的式子，而不是裸 KL。BoN 的 $d$ 由式 (2) 直接开方；RL 的 $d$ 从训练过程里估。

经验拟合（引言框公式，§3.1 验证）是

$$
R_{\mathrm{bon}}(d)=d\bigl(\alpha_{\mathrm{bon}}-\beta_{\mathrm{bon}}d\bigr),
\tag{4}
$$

$$
R_{\mathrm{RL}}(d)=d\bigl(\alpha_{\mathrm{RL}}-\beta_{\mathrm{RL}}\log d\bigr).
\tag{5}
$$

$R(0):=0$ 由定义。$\alpha,\beta$ 可以随代理 RM 参数数、数据量等变。式 (4) 是 $d$ 的开口向下抛物线，峰值落在 $d=\alpha_{\mathrm{bon}}/(2\beta_{\mathrm{bon}})$。Figure 12 用这条闭式去预测不同 RM 大小的峰值金标分。式 (5) 在原点斜率无穷，附录 B 承认这一点。他们试过 $d(\alpha-\beta\log(1+d))$ 和幂律 $d(\alpha-\beta d^{\gamma})$，原点斜率有限，外推更差；小 $\gamma$ 的幂律又逼近 $\log$。所以正文仍用式 (5)。

BoN 的函数形状是看着 $n\le 1000$（$\mathrm{KL}\approx 6$ nat）的数据猜的。猜完之后才跑 $n=60{,}000$（$\mathrm{KL}\approx 10$ nat）。这是真的事前预测，不是事后贴合。代理分没有同样干净的拟合。BoN 的代理分看起来接近过原点的直线 $d\alpha_{\mathrm{bon}}$，Figure 20 说线性拟合并不好。外推到更大 KL 时，BoN 和 RL 的代理分都被低估，后期大致随 $\sqrt{\mathrm{KL}}$ 线性涨，和 Bai 等（2022）看到的差不多。

## 5. Figure 1：横轴是平方根尺度

Figure 1 把策略钉在 1.2B，数据钉在 90{,}000，只扫代理 RM 大小。横轴是平方根尺度。注意 BoN 子图和 RL 子图的横轴范围不同，不要叠在同一把尺子上读「谁走得远」。

现象很硬：代理 RM 分继续涨时，金标先涨后掉。更大的代理 RM，金标峰值更高、掉头更晚。$\alpha_{\mathrm{bon}}$、$\beta_{\mathrm{bon}}$ 随 RM 参数数平滑变，接近对数。RL 可以把 $\alpha_{\mathrm{RL}}$ 在所有 RM 大小上当成常数，只让 $\beta_{\mathrm{RL}}$ 随参数数走；脚注 2 写 $\alpha_{\mathrm{RL}}$ 几乎不随 RM 大小变。用同一函数去套代理分，$\beta$ 会小得多：代理曲线更接近单调升，金标才是那条会弯下来的。

![BoN 与 RL 两条过优化路径：代理单调升、金标先升后降，函数形状不同](./images/fig-bon-vs-rl-overopt.png)

> 图 2：横轴进度是 $d=\sqrt{\mathrm{KL}}$。上栏 BoN、下栏 RL。代理分沿途一直升，金标经过峰值后下降。BoN 收成 $d(\alpha-\beta d)$，RL 收成 $d(\alpha-\beta\log d)$。示意，没有拟合点。

**图 2 解析**

- 两栏都从 $d=0,\,R=0$ 出发，这是 recenter 之后的原点。
- 浅蓝框：代理和金标一起升。RL 栏多写了「在 KL 上更慢」，对应 §3.5：同一金标涨幅，RL 要花掉更多 KL。
- 桃色框是金标峰值。代理分在这里还没停。
- 浅红框：代理继续升，金标掉头。这就是过优化。
- 右端公式框不是同一条曲线。上栏二次型，下栏带 $\log d$。不要把两栏画成平移关系。
- 底廊虚线只声明横轴是 $\sqrt{\mathrm{KL}}$ 尺度、两条函数不同。没有具体 $\alpha,\beta$ 数值。

Manheim 与 Garrabrant 把 Goodhart 分成回归、极端、因果、对抗四类。论文把 $\alpha$ 读成回归型：代理分大致随 $\sqrt{\mathrm{KL}}$ 线性涨，金标的线性部分比代理坡更缓，差额就是在选噪声。只有回归型时，金标必须随代理单调升；Figure 8 已经非单调，所以还有别的。非单调主要算在极端型上：优化把样本推到 RM 训练分布外面，长度之类在分布内总是好信号，分布外就不再是。$\beta$ 在极限下会让效用无界地掉。RM 变大，$\beta$ 平滑变小，读成鲁棒性在涨。对抗型（策略主动骗代理）这批模型还做不到；外推到更强系统时，这些标度可能先破。

## 6. KL 不能拿来比较 BoN 和 RL 拧了多少

先验上，PPO 和 BoN 的优化方式差很远。论文问的是：过优化长得像不像。

**RL 在 KL 上远没有 BoN 那么「省」。** 把 KL 当成要花的预算，RL 无论是把代理分拧上去，还是把金标拧穿，都更费 KL。BoN 只在初始策略附近搜，$d$ 随 $\sqrt{\log n}$ 走。RL 每一步改的是上一步，没有 KL 惩罚时 KL 随步数近似二次涨。正交于奖励的扰动也能抬 KL，却不一定抬代理分或金标分；极小但瞄准奖励的扰动，可以在很小的 KL 预算里把行为改掉。

所以：**KL 不能拿来比较 BoN 和 RL「优化了多少」。** 固定某一种方法内部，KL 仍然好用：§3.2 的系数标度干净，§3.4 里不同策略大小的金标峰值几乎落在同一 KL。换方法，这把尺子就失效。

改用代理分当「拧了多少」的度量，BoN 和 RL 看起来像得多。Figure 8 把横轴换成代理分：两条都是金标先升后降。RL 起手的代理–金标缺口更大，后来金标峰值可以高过 BoN。论文把 RL 曲线截到代理分 $1.6$，图才读得下去。

## 7. KL 惩罚像早停，不治过优化

§3.6 扫 PPO 的显式 KL 惩罚。策略 1.2B，RM 1.2B。金标分几乎只取决于当时的 $\mathrm{KL}_{\mathrm{RL}}$。加大惩罚，曲线更早收敛，**不改善** gold–KL 前沿。效果像早停（Figure 9、14）。惩罚组的代理–金标缺口还更大。因为这个，论文其余 RL 实验把 KL 惩罚设为 0。

不要写成「KL 惩罚能治过优化」。它提高的是给定 KL 下的**代理**分，金标那条前沿没被抬起来。作者也写了：这条结果可能对超参特别敏感。

PPO 的代理目标里本来就有一项对着近期策略 $\pi_{\mathrm{old}}$ 的隐式 KL，不是对着 $\pi_{\mathrm{init}}$。它把策略改动的速度按住，间接让 $D_{\mathrm{KL}}(\pi\Vert\pi_{\mathrm{init}})$ 涨得更慢。为什么这种间接效果看起来比显式 KL 惩罚更少过优化，论文说不知道。

§4.3 在「多轮换新 RM」的简化假设下算过一笔。假定 $\alpha_{\mathrm{RL}},\beta_{\mathrm{RL}}$ 跨轮不变，且 $d$ 可加（Figure 14 里 KL 近似随步数涨）。$k$ 轮、每轮走 $d/k$，终局是

$$
R_{\mathrm{RL}}(d)=d\bigl(\alpha_{\mathrm{RL}}-\beta_{\mathrm{RL}}\log d+\beta_{\mathrm{RL}}\log k\bigr).
\tag{6}
$$

比一轮走完同一个 $d$，多出来的是 $\beta_{\mathrm{RL}}d\log k$。$\alpha$ 那截（回归型）搬不走。$k$ 有上限，$d$ 太小标度也会破。这是讨论，不是主实验。

## 8. 数据有门槛，策略变大并不更早过优化

数据扫把 RM 钉在 12M（BoN 实际扫过 RM 大小 × 数据量的网格）。更多独特比较，金标更好、Goodhart 更轻。$\alpha,\beta$ 随数据量的变化没有随 RM 参数数那么干净。

硬门槛在大约 **2000** 条比较。少过这个数，验证损失接近随机，优化之后金标几乎不涨。门槛过了，更大的 RM 涨得更快，但「从哪条数据量开始不再随机」并没有明显提前。四个 epoch 刷同一份小数据，金标分几乎不动；一份四倍大的数据只跑一个 epoch，金标明显更好（Figure 13）。验证损失也站在这一边：1×2000 是 $0.686$，4×2000 是 $0.684$，1×8000 是 $0.655$。步数凑够了没用，要的是没见过的比较。

策略对照把 RM 钉在 12M，比 1.2B 和 6B。6B 策略从 RM 优化里「多捞到的金标」更少：起点已经高，初始分到峰值分的落差更小，BoN 子图最明显。直觉会以为更大策略会更快把 RM 拧穿。结果相反：**过优化峰值几乎落在同一 KL**；代理–金标缺口几乎一样（Figure 24）。3B RM 上复核过，同方向。6B 策略在同样 RL 步数下的 KL 甚至更低（Figure 15），不是「更大模型每步走得更远」。论文的读法：更大 SFT 策略把示范分布建得更准，并不自动等于对同一只 RM 施加了更强的优化压力。

## 9. 不是 RAFT，不是 DPO，不是 GRPO

同一笔「每 prompt 采 $n$ 条、按 RM 取最高」的预算，RAFT 把冠军送进 SFT，BoN 可以不更新。Dong 等（[2304.06767](https://arxiv.org/abs/2304.06767)）要拆的是 PPO 四件套太重；主数字是 LLaMA-7B + HH-RLHF 上的测试奖励。Gao 等的主数字是合成金标下的 $R(d)$。RAFT 附录里用弱代理 RM 对 3B 金标，也看见过代理还在涨、金标掉头；那是 RAFT 文对这篇的引用，不是这篇的主表。要看「只训 top-1」怎么写成可跑的三步，回 [07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)。本篇不把 BoN 写成微调算法。

DPO 连独立奖励模型都跳过，离线成对分类，隐式奖励。这边代理 RM 必须在，优化显式对着它的标量分。没有偏好对、只有一只 RM 时，DPO 没有输入；BoN 和 PPO 都能跑。标签来源若换成现成 LLM，那是 [RLAIF](../../4.4.3-RLAIF/4.4.3-RLAIF.md) 的问题，不是这篇的合成 6B 金标。

GRPO 把组内奖励做 $z$-score，目标里还留着 PPO 式 clip。BoN 不过组均值，不除组标准差，不 clip。组内几乎同分时，GRPO 的分母趋近 0；BoN 只是「这 $n$ 条里谁分高留谁」，策略梯度根本没有。

后作把 BoN 再蒸馏回策略，正本在 [09-BOND](../09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md)（[arXiv:2407.14622](https://arxiv.org/abs/2407.14622)，不要写成 2407.14608）。那篇更新权重、推理只采 1；本篇可以永远停在解码选择，去量 $R(d)$。不要把蒸馏后的训练损失，读回 Gao 等这条「解码选择 + 过优化标度」。

| | BoN（本篇） | RAFT | PPO | GRPO | DPO |
|--|------------|------|-----|------|-----|
| RM | 代理 RM 打分 | 冻结 $r$ 排序 | 标量 $r$ 进优势 | 组内奖励 | 无独立 RM |
| 更新 | 可以没有 | 只对 $\arg\max$ 做 SFT | clip + GAE | 组内 $z$-score + clip | 离线分类 |
| 过优化主问题 | $R(d)$ 标度 | 过滤器再干净也是 $r$ | 同一代理 | 不是这篇 | 不优化显式 RM |

## 10. 失效与边界

合成金标盖不住「标签和人真正想要的东西」那一层错位。标注员选看起来对的选项、机器人手看起来抓住球，一直到偏好是否可识别，这篇都没量。相关工作把递归奖励建模当成补这一层的方向，同时指出它有理论限制。合成设定里大小 RM 可能共享相关误差，迁到真人偏好时系数不必原样成立。作者在 WebGPT 环境里看过外形相似的曲线，主文仍只有 InstructGPT 这一套。

| 现象 | 原因 | 说明 |
|------|------|------|
| 代理分涨、金标掉 | 静态代理被拧过分布 | Figure 1 的主现象；早停或换新 RM，治不好回归型那截 |
| 用 KL 比 BoN 和 RL | 两种方法花 KL 的速度不同 | §3.5 / §4.1；代理–金标平面更像 |
| 加大 KL 惩罚当「治过优化」 | 惩罚抬的是给定 KL 下的代理分 | 金标–KL 前沿不变，像早停 |
| 比较少于约 2000 条 | 代理 RM 近随机 | 金标几乎不涨；4 epoch ≠ 4 倍独特数据 |
| 策略换成 6B 仍在同一 KL 掉头 | 过优化峰值对策略大小不敏感 | 多捞到的金标更少，缺口几乎一样 |
| 外推到会骗 RM 的策略 | 对抗型 Goodhart 不在这批模型里 | 标度可能先破 |
| 把 BoN 当训练损失 | 式 (1) 可以没有梯度 | 要蒸馏回权重是后作，不是本篇 |

BoN 的函数形状在 $\mathrm{KL}\approx 6$ 猜、在 $\approx 10$ 验过；RL 形式在原点的无穷斜率是已知瑕疵。代理分仍没有同样能外推的闭式。策略大小只比了两档。这些都是论文自己划的边。

邻居链：策略梯度与 clip 在 [04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)；只训 top-1 在 [07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)；组内 $z$-score 在 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md)；离线分类在 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)。蒸馏 $\pi_{\mathrm{BoN}}$、推理采 1，在 [09-BOND](../09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md)。本夹上一篇是 [06-Nash-MD](../06-Nash-MD-纳什镜像下降/06-Nash-MD-纳什镜像下降.md)，求的是偏好博弈的 Nash，不是对着标量 RM 做 BoN。

## 参考文献

1. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760). HTML：[arxiv.org/html/2210.10760](https://arxiv.org/html/2210.10760). *ICML 2023*，PMLR 202:10835–10866.
2. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.（金标 6B RM；环境与 SFT 示范）
3. Stiennon, N., et al. (2020). [Learning to summarize from human feedback](https://arxiv.org/abs/2009.01325).（附录 G.3：$\mathrm{KL}_{\mathrm{bon}}=\log n-(n-1)/n$）
4. Nakano, R., et al. (2021). [WebGPT: Browser-assisted question-answering with human feedback](https://arxiv.org/abs/2112.09332).（附录 I：中间 $n$ 的无偏估计）
5. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
6. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).（KL 为平方型距离；代理分随 $\sqrt{\mathrm{KL}}$ 近线性）
7. Brown, T. B., et al. (2020). [Language models are few-shot learners](https://arxiv.org/abs/2005.14165).（GPT-3 初始检查点）
8. Manheim, D., & Garrabrant, S. (2018). [Categorizing Variants of Goodhart's Law](https://arxiv.org/abs/1803.04585).
9. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767).（「不是 RAFT」：top-1 写进 SFT）
10. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290).（「不是 DPO」）
11. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).（GRPO 组内 $z$-score，对照用）
12. Sessa, P. G., et al. (2024/2025). [BOND: Aligning LLMs with Best-of-N Distillation](https://arxiv.org/abs/2407.14622). *ICLR 2025*。（蒸馏回策略；论文号不是 2407.14608；正本在 [09-BOND](../09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md)）
