---
title: "08 · CISPO：裁剪重要性权重"
date: 2026-08-31
as_of: 2026-08-31
tags: [CISPO, GRPO, DAPO, PPO, RLHF, MiniMax-M1, 重要性采样]
---

# 08 CISPO：裁剪重要性权重

CISPO（Clipped IS-weight Policy Optimization）clip 的是重要性权重 $r_t=\pi_\theta/\pi_{\mathrm{old}}$，再 **stop-gradient**：目标形如 $\mathrm{sg}(\hat r_{i,t}(\theta))\,\hat A_{i,t}\,\log\pi_\theta$。梯度走 $\log\pi$，出界 token **不**像 PPO / GRPO 的 $\min$ clip 那样被丢掉。一手是 MiniMax-M1 的 [arXiv:2506.13585](https://arxiv.org/abs/2506.13585) §3.1（HTML：[arxiv.org/html/2506.13585](https://arxiv.org/html/2506.13585)），2025 年 6 月。本篇钉这条算法。MiniMax-M1 那次完整 RL 用 512 张 H800、大约三周，那是 CISPO 落地的墙钟，不是 CISPO 公式；Lightning Attention 和 456B 总参只说明「这篇算法在哪次训练里用过」，不在这里展开整机。**不是** SAPO（温度 sigmoid 软门）。**不是** [03-GSPO](../03-GSPO/03-GSPO.md) 的序列几何平均。**不是** 把 hard-clip 换成平滑过渡区的课设故事。邻居：[02-GRPO](../02-GRPO/02-GRPO.md) 的组内 $z$-score、[04-PPO](../04-PPO/04-PPO.md) 的 $\min$ clip；家族对照在 [4.4.5](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md)。

## 1. 一批 rollout 要更新 16 轮，min-clip 先把分叉词抹掉

PPO 的代理目标按 token 写。旧策略 $\pi_{\theta_{\mathrm{old}}}$ 采出回答 $o$，当前策略 $\pi_\theta$ 再算每个位置的重要性权重

$$
r_{i,t}(\theta)=\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q,o_{i,<t})}. \tag{1}
$$

然后做 $\min\bigl(r_{i,t}\hat A_{i,t},\,\mathrm{clip}(r_{i,t},1-\varepsilon,1+\varepsilon)\hat A_{i,t}\bigr)$。论文把 PPO 目标写成（他们的式 (1)，KL 仍挂在里面）

$$
\mathcal{J}_{\mathrm{PPO}}(\theta)
=\mathbb{E}_{q\sim\mathcal{D},\,o_i\sim\pi_{\theta_{\mathrm{old}}}}
\Biggl[
\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}
\min\bigl(r_{i,t}(\theta)\hat A_{i,t},\;
\mathrm{clip}(r_{i,t}(\theta),1-\varepsilon,1+\varepsilon)\hat A_{i,t}\bigr)
-\beta\,D_{\mathrm{KL}}(\pi_\theta\Vert\pi_{\mathrm{ref}})
\Biggr]. \tag{2}
$$

$r_{i,t}$ 本来是 off-policy 校正：同一批轨迹要按 mini-batch 多步更新，$\pi_\theta$ 已经不是采样时的 $\pi_{\theta_{\mathrm{old}}}$。clip 的本意是挡「太旧的样本」。落到 $\min$ 这一层，挡法变成：比率一出带，这项代理目标锁成常数，这个 token 的梯度归零。

GRPO 把价值网络拿掉，优势改成同题 $G$ 条的相对分数（论文式 (2)）：

$$
\hat A_{i,t}=\frac{R_i-\mathrm{mean}(\{R_j\}_{j=1}^{G})}{\mathrm{std}(\{R_j\}_{j=1}^{G})}. \tag{3}
$$

$R_i$ 是整段奖励，规则验证器或奖励模型都可以。结果监督下一条里的 token 共用同一个 $\hat A$。clip 对象没变，仍是每个 $r_{i,t}$。组相对优势的机制在 [02-GRPO](../02-GRPO/02-GRPO.md)，本篇不重推 $z$-score。

问题出在「出带就丢」和长 CoT 叠在一起。MiniMax 在 hybrid 架构、zero-RL 设定里跑 GRPO，训练上不去，长思维链也起不来。消融把锅判给 PPO / GRPO 那套 clip。具体症状：However、Recheck、Wait、Aha 这类反思词，基座里本来就稀、概率低。策略一更新，这些位置的 $r_{i,t}$ 容易飙高。第一次 on-policy 更新之后，它们就被 clip 出带，后面的 off-policy 步再也吃不到它们的梯度。

他们的训练设定是：**每一批生成，做 16 轮 off-policy 更新**。生成时冻结 $\pi_{\theta_{\mathrm{old}}}$，内层对同一批轨迹反复算 $r_{i,t}$、反传。第一轮还接近 on-policy，$r$ 多半在 $1$ 附近。反思词一旦被抬起来，$\pi_\theta$ 在这些位置变大，$\pi_{\theta_{\mathrm{old}}}$ 仍是采样时的小概率，后面十五轮的 $r$ 只可能更大。$\min$ clip 的上沿是固定的，越大越容易出带，出带就 $\nabla=0$。不是「偶尔丢几个 token」，而是越更新越把刚学会的分叉从梯度里清出去。一轮 clip 掉，后面十五轮继续空转。

DAPO 用 Clip-Higher 把 $\varepsilon$ 的上沿抬高，想让更多高比率 token 留在带里。同一套 16 轮设定下，他们觉得这招不够用。带宽加一点，只是把「第几轮开始丢」往后推，没有改「出带就常数代理」这件事。低概率 token 又偏偏是熵和可扩展 RL 里常被点名的那一类（论文引 Cui et al. 2025、Wang et al. 2025），当「分叉」用。min-clip 先把分叉掐掉，后面再谈探索，已经晚了。

信任域约束在 [04-PPO](../04-PPO/04-PPO.md) 里是故意的：更新太大就停。CISPO 的判断是，停的方式停错了。要稳的是重要性权重的数值，不是把这个 token 从梯度里开除。

## 2. clip 的是权重，梯度仍走 $\log\pi$

先回到不带 $\min$ 的 REINFORCE，只做分布校正。论文式 (3)：

$$
\mathcal{J}_{\mathrm{REINFORCE}}(\theta)
=\mathbb{E}
\Biggl[
\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}
\mathrm{sg}\bigl(r_{i,t}(\theta)\bigr)\,\hat A_{i,t}\,
\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})
\Biggr]. \tag{4}
$$

$\mathrm{sg}(\cdot)$ 是 stop-gradient，对应实现里的 `detach`。$r_{i,t}$ 当系数，不往回传；梯度只从 $\log\pi_\theta$ 走。没有 clip 时，这就是带重要性采样的策略梯度。

CISPO 不在 $\min(rA,\mathrm{clip}(r)A)$ 上做文章，而是先把 $r$ 本身 clip 住，再 $\mathrm{sg}$。clipped IS 权重（论文式 (5)）

$$
\hat r_{i,t}(\theta)=\mathrm{clip}\bigl(r_{i,t}(\theta),\,1-\varepsilon^{\mathrm{IS}}_{\mathrm{low}},\,1+\varepsilon^{\mathrm{IS}}_{\mathrm{high}}\bigr). \tag{5}
$$

目标沿用 GRPO 的组相对优势，损失改成 token 级分母（Liu et al. 2025b；Yu et al. 2025）。论文式 (4)：

$$
\mathcal{J}_{\mathrm{CISPO}}(\theta)
=\mathbb{E}_{(q,a)\sim\mathcal{D},\,\{o_i\}_{i=1}^{G}\sim\pi_{\theta_{\mathrm{old}}}(\cdot\mid q)}
\Biggl[
\frac{1}{\sum_{i=1}^{G}|o_i|}\sum_{i=1}^{G}\sum_{t=1}^{|o_i|}
\mathrm{sg}\bigl(\hat r_{i,t}(\theta)\bigr)\,\hat A_{i,t}\,
\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})
\Biggr]. \tag{6}
$$

分母是组内所有回答的 token 总数，不是先对每条做 $1/|o_i|$ 再对 $G$ 平均。短句不会因为长度小就每个 token 分到更大的权重。这是 DAPO / Dr. GRPO 那条线上已经改过的聚合方式，CISPO 直接采用，本篇不重推 DAPO。

不加权重 clip 时，式 (6) 退回普通策略梯度。实验里他们 **没有** 给 IS 权重设有效下界：把 $\varepsilon^{\mathrm{IS}}_{\mathrm{low}}$ 设得很大，$1-\varepsilon^{\mathrm{IS}}_{\mathrm{low}}$ 落到几乎不起作用的位置，只调 $\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$。小 $r$ 保持原值，不被抬到 $1-\varepsilon$；大 $r$ 被天花板截住，系数变成 $1+\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$ 这个常数。§3.1 没有写出 $\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$ 的数值，不要把 PPO 的 $0.2$ 或 GSPO 的 $4\times 10^{-4}$ 填进去。

权重 clip 会让式 (6) 的梯度略偏。论文自己承认这一点。换来的是：所有 token 都还在梯度里，尤其是长回答。方差下来，训练稳一些。另外两件从 DAPO 挪过来的工程：dynamic sampling，丢掉组内准确率 0% 或 100% 的题；length penalty，压超长。CISPO **没有 KL 项**，和 DAPO、Open-Reasoner-Zero 一类近期工作同一选择。

用一个数把两条对照看清。设 $\hat A=+1$，$\varepsilon=0.2$，某个反思 token 的 $r=1.8$。PPO / GRPO：未裁剪支 $1.8$，裁剪支 $1.2$，$\min$ 锁在 $1.2$。再抬这个位置的概率，代理目标不加分，这项对 $\theta$ 的导数是 $0$。CISPO：若天花板碰巧也是 $1.2$，则 $\hat r=1.2$，`detach` 之后系数是常数 $1.2$，目标仍是 $1.2\cdot\log\pi_\theta$，梯度 $1.2\,\nabla\log\pi_\theta$，token 还在。

负优势对称。设 $\hat A=-1$，$r=0.3$，$\varepsilon=0.2$。未裁剪支 $0.3\times(-1)=-0.3$，裁剪支 $0.8\times(-1)=-0.8$。最大化 $\min(-0.3,-0.8)$ 会选中常数 $-0.8$，这个位置同样不再提供 $\nabla\log\pi$。CISPO 若按下界几乎不设，$r=0.3$ 不被抬到 $0.8$，系数仍是 $0.3$，目标 $0.3\times(-1)\times\log\pi$，梯度还在，只是幅度按小权重缩小。数字 $1.8$ / $0.3$ / $0.2$ 是为了把「常数代理」和「常数系数乘 $\log\pi$」分开，不是论文表。

![PPO/GRPO 的 min-clip 丢掉梯度，CISPO 对 r clip 后 sg，梯度仍走 logπ](./images/fig-cispo-clip-is-weight.png)

> 图 1：上栏 PPO / GRPO 对 $r A$ 做 $\min$ clip，出带则该 token 梯度为零。下栏 CISPO 先把 $r$ clip 成 $\hat r$，再 $\mathrm{sg}(\hat r)$，目标是系数乘 $\log\pi_\theta$，所有 token 仍进梯度。

**图 1 解析**

- 两栏都从左到右，起点都是绿框 `token $o_t$`。
- 上栏：黄框写出 $r_t=\pi_\theta/\pi_{\mathrm{old}}$。橙框是 $\min(rA,\mathrm{clip}(r)A)$。虚线进紫框 `out of band: drop token, $\nabla=0$`。虚线表示排除，不是第二条数据流。
- 下栏：黄框同样是 $r_t$。蓝框写出 $\hat r=\mathrm{clip}(r)$，然后 $\mathrm{sg}(\hat r)$。红框是 $\mathrm{sg}(\hat r)\,\hat A\log\pi_\theta$，并标明所有 token 保留 $\nabla\log\pi$。
- 读图时不要把紫框理解成「clip 掉奖励」。丢掉的是这个位置的策略梯度，奖励 $R_i$ 还在式 (3) 里。

## 3. 和 GRPO、DAPO、GSPO 不是同一层

三家都可以组内相对优势。分叉在 clip 作用在谁身上，以及出界 token 还在不在。

| 项 | GRPO | DAPO | CISPO |
|----|------|------|-------|
| clip 对象 | token 比率，进 $\min(\cdot)$ | 仍是 $\min$ clip；Clip-Higher 抬 $\varepsilon_{\mathrm{high}}$ | IS 权重 $r$ 本身，再 $\mathrm{sg}$ |
| 出界 token | 代理变常数，$\nabla=0$ | 新带之外仍丢 | 不丢，系数封顶后仍走 $\log\pi$ |
| 优势 | 组内 $z$-score | 同左 | 同左 |
| 损失分母 | 论文式先 $1/\|o_i\|$ 再对组平均 | token 级 | token 级 |
| KL | DeepSeekMath 挂损失，$\beta=0.04$ | 无 | 无 |
| 其它 | 无这三项配件 | 动态采样、长度惩罚 | 沿用这两项，不重推 |

DAPO 全称是 Decoupled Clip and Dynamic sAmpling Policy Optimization。Clip-Higher、动态采样、token 级损失、超长惩罚，公式以 [arXiv:2503.14476](https://arxiv.org/abs/2503.14476) 为准。CISPO 把后三项当配件，主改动仍是「clip 权重 + stop-gradient」。不要把 CISPO 写成 DAPO 换了个名字。

![GRPO、DAPO、CISPO 三列：clip 对象、是否丢 token、优势来源](./images/fig-cispo-vs-grpo-dapo.png)

> 图 2：三列对照 clip 对象、出界是否丢 token、优势从哪来。CISPO 与 GRPO / DAPO 同属组相对，不画训练曲线。

**图 2 解析**

- 三列各自从上到下，列与列之间没有箭头。
- 左列 GRPO：clip 在 $\min$ 里的 token 比率；出界丢；组内 $z$-score，KL 在损失里。
- 中列 DAPO：仍是 $\min$ clip，只把上沿抬高；出界仍可能丢；优势仍是组相对，另加 token 级损失、动态采样、长度惩罚。
- 右列 CISPO：clip 的是 $r$ 再 $\mathrm{sg}$；不丢 token；优势仍是 GRPO 组相对，token 级分母，无 KL。
- 底注写明这不是成绩曲线。AIME 对照只存在论文 Figure 2，本页不临摹坐标。

GSPO 把重要性采样从 token 提到整条回答，序列级比率是长度归一化的几何平均 $s_i$，clip 作用在这一个 $s_i$ 上。CISPO 的 $r_{i,t}$ 仍是 token 级，改的是「系数要不要 `detach`、出界要不要把 $\nabla\log\pi$ 抹掉」。一条回答里，GSPO 可能因为 $s_i$ 出带整段出局；CISPO 每个 token 都还在，只是过大的 $r$ 被封顶。两边都不是 sigmoid。

SAPO（Soft Adaptive Policy Optimization，Gao、Zheng 等，[arXiv:2511.20347](https://arxiv.org/abs/2511.20347)）用温度控制的 sigmoid 软门替代 hard clip，正负优势可以不同温度 $\tau_{\mathrm{pos}}$ / $\tau_{\mathrm{neg}}$。CISPO 的 clip 是硬截断加 stop-gradient，没有平滑过渡区，也没有把 $\varepsilon$ 写成熵的滑动平均。课设里常见的「hard-clip 太硬，改成中间一段斜坡」和这两篇都对不上：斜坡仍让出界梯度按门控衰减到接近零，CISPO 则把系数钉死、$\log\pi$ 照常反传。

## 4. 统一式里的 mask：想丢 token 才乘零

论文还写了一个带 token 掩码的统一目标（式 (6)(7)），用来把「丢不丢」收成超参，而不是另起一套损失：

$$
\mathcal{J}_{\mathrm{unify}}(\theta)
=\mathbb{E}
\Biggl[
\frac{1}{\sum_{i=1}^{G}|o_i|}\sum_{i=1}^{G}\sum_{t=1}^{|o_i|}
\mathrm{sg}\bigl(\hat r_{i,t}(\theta)\bigr)\,\hat A_{i,t}\,
\log\pi_\theta(o_{i,t}\mid\cdot)\,M_{i,t}
\Biggr]. \tag{7}
$$

$M_{i,t}$ 等价于 PPO 信任域里隐式的那张掩码：

$$
M_{i,t}=
\begin{cases}
0 & \text{if }\hat A_{i,t}>0\text{ and }r_{i,t}(\theta)>1+\varepsilon_{\mathrm{high}},\\
0 & \text{if }\hat A_{i,t}<0\text{ and }r_{i,t}(\theta)<1-\varepsilon_{\mathrm{low}},\\
1 & \text{otherwise.}
\end{cases} \tag{8}
$$

$M=0$ 的两个分支，就是「正优势还继续抬、已经超出上沿」和「负优势还继续压、已经低于下沿」。CISPO 实验走的是 **所有 $M_{i,t}=1$**：掩码不起作用，出界只改 $\hat r$ 的数值，不改这个位置还在不在。把式 (8) 打开，统一式可以回到 PPO 那种丢 token 的行为。实现时不要默认「写了 CISPO 就一定带这张掩码」。

正优势且 $r>1+\varepsilon_{\mathrm{high}}$ 时，PPO 的 $\min$ 选中常数支，梯度没了。CISPO 若 $M=1$，同一位置仍有 $\hat r_{\mathrm{clip}}\cdot\hat A\cdot\nabla\log\pi$。负优势且 $r<1-\varepsilon_{\mathrm{low}}$ 时同理。他们实验里下界几乎不设，后一个分支更少被权重 clip 碰到；真正常触发的是上沿。

$\mathrm{sg}$ 不能省的理由也在梯度里。$\hat r$ 是 $\pi_\theta/\pi_{\mathrm{old}}$ 的函数，若不 `detach`，反传会同时打到分子上的 $\log\pi$ 和比率本身，等价于对重要性权重再乘一层 $\nabla r$。那既不是式 (4) 的 REINFORCE 校正，也不是 PPO 的 $\min$ 代理。clip 再叠上去，出界处 $\mathrm{clip}$ 的局部导数是 $0$，未出界处又变成对 $r$ 的额外缩放，系数含义乱掉。论文写的路径只有一条：把 $\hat r$ 当常数，$A$ 当常数，唯一的 $\theta$ 通道是 $\log\pi_\theta$。

## 5. 对照实验写了哪些数

算法对账用的是 controlled study，不是 MiniMax-M1 的全量成绩单。设定：Qwen2.5-32B-base，题集用 Yu et al. 2025 的数学推理数据（DAPO-Math 那条），评测 AIME 2024。zero-RL，直接在 base 上做 RL。论文 Figure 2：同样训练步数，CISPO 高于 GRPO 和 DAPO；大约 **50% 步数** 追上 DAPO。引言把同一观察写成相对 DAPO 约 **2×** 的速度。正文没有把 Figure 2 的终点写成表格百分数。本篇不从曲线上估坐标。

能钉住的只有这些：

| 项 | 论文写法 |
|----|----------|
| 算法全称 | Clipped IS-weight Policy Optimization |
| 出处 | MiniMax-M1 §3.1，arXiv:2506.13585 |
| clip 对象 | IS 权重 $r_{i,t}$，再 $\mathrm{sg}$ |
| 下界 | $\varepsilon^{\mathrm{IS}}_{\mathrm{low}}$ 很大，等于不卡下界 |
| 上界 | 只调 $\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$；§3.1 未给具体数字 |
| 优势 | GRPO 组内相对 |
| 损失 | token 级分母 |
| KL | 无 |
| 配件 | DAPO 的动态采样与长度惩罚 |
| 每批 off-policy | **16** 轮更新 / 一次生成 |
| 对照骨干 | Qwen2.5-32B-base |
| 对照数据 | DAPO 数学题集 |
| 对照基准 | AIME 2024 |
| Figure 2 | 同步数优于 GRPO / DAPO；约一半步数追上 DAPO |

MiniMax-M1 自己的 RL：512 张 H800，完整一轮大约三周，租卡费用正文写约 $0.53\mathrm{M}$ 美元（摘要里 $534{,}700$）。这是 CISPO 加 hybrid 注意力一起跑完的墙钟，不要写成「CISPO 公式等于三周」。M1-80k 在 AIME 2024 上 86.0%（32 次采样平均 pass rate）是整次发版的评测，分母里还有持续预训练、SFT、混合数据和 80K 思维预算，不能当成 §3.1 那张 Qwen2.5-32B 对照的终点。

把生成长度从 40K 拉到 80K 时，他们在每个长度窗口后期碰到过模式崩：后半段胡写，困惑度涨。归因写的是负样本变长更快、GRPO 式归一化加 token 级损失让后半段负梯度堆起来。处理里有一条直接碰到 CISPO 超参：同时减小梯度裁剪阈值和 $\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$。上沿不是越大越「不丢 token」就越好；封顶太松，系数仍可能把更新拉飞。这是调 $\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$ 的工程边界，不是另发明一套算法。

## 6. 实现时分母、detach 和配件

形状约定：`log_prob`、`old_log_prob`、`advantages`、`response_mask` 都是 $[B,T]$。结果监督下 `advantages` 通常是式 (3) 广播到 token。下面不是框架源码，只把式 (5)(6) 写成可对账的几行。

```python
log_ratio = log_prob - old_log_prob
ratio = torch.exp(log_ratio)
# 论文：下界几乎不设，只卡上沿；eps_low 取很大时 1-eps_low 不起作用
hat_r = torch.clamp(ratio, 1.0 - eps_low, 1.0 + eps_high)
# stop-gradient：系数当常数，梯度走 log π
per_token = hat_r.detach() * advantages * log_prob
denom = response_mask.sum().clamp_min(1.0)
loss = -(per_token * response_mask).sum() / denom
```

最大化式 (6)，损失取负。`detach` 不能省：省掉就变成对 $r$ 和 $\log\pi$ 同时反传，和「clip 权重、梯度走 $\log\pi$」对不上，也不是 PPO 的 $\min$。`eps_high` 用他们调过的值；不要默写成 $0.2$，也不要抄 GSPO 的 $4\times 10^{-4}$。`eps_low` 若按论文「很大」，实现上可以让下界 $\le 0$，再靠 `clamp` 把比率留在正侧，效果是小 $r$ 不被抬高。

分母用 batch 内有效 token 总数，对应式 (6) 的 $\sum_i|o_i|$。取一个只有两条的组：一条 100 token、$\hat A=+1$，一条 400 token、$\hat A=-1$，且暂令 $\hat r=1$。按条平均再对组平均时，短句每个 token 分到 $1/100$，长句每个 token 分到 $1/400$，正优势短句更「值钱」。token 级分母是 $500$，每个有效位置权重相同。若改回「先按条平均再对 $B$ 平均」，长度偏差会回到 [02-GRPO](../02-GRPO/02-GRPO.md) §6.1 说的那种。组内 $z$-score 仍要处理 $\mathrm{std}\to 0$；动态采样的做法是把准确率 0 或 1 的组丢掉，保证留下的组里 $\hat A$ 不是全零。长度惩罚按 DAPO 的软区间，不要写成「超长直接把奖励改成 0」。这三项都不是 CISPO 新推的公式，漏实现会让「复现 CISPO」和论文 Figure 2 的设定对不上，但不要在本篇把 DAPO 再讲一遍。

`float16` 下长序列的 `log_ratio` 可能溢出。比率在指数域算，clip 之前至少用 `float32`。mask 和 EOS 不一致时，$|o_i|$ 会错，token 级分母跟着错。这些不是论文表格，是式 (1) 和式 (6) 在代码里会踩的坑。

## 7. 失效和边界

CISPO 不是万能的。权重 clip 仍然引入偏差：过大的 $r$ 被钉在天花板上，重要性采样不再无偏。论文认为这笔偏差换「token 不丢」划得来，没有承诺系数封顶之后还能当精确的 off-policy 校正。16 轮更新把 $\pi_\theta$ 推得很远时，$\hat r$ 大量顶在上沿，系数几乎变成同一个常数，IS 校正名存实亡，只剩下「所有 token 都还在 $\nabla\log\pi$ 里」这一层。

组内 $z$-score 的旧病还在。全对全错时 $\mathrm{std}\to 0$，简单题和难题的「差一点」被放成同类。CISPO 没改式 (3)。动态采样能丢掉无信息组，组太小（$G=2$）时均值仍会晃；$G=1$ 没有对照，退回不带 baseline 的 REINFORCE。这些是组相对的边界，不是 clip 权重新引入的。

信用分配仍然粗。结果监督下一条回答一个 $\hat A$，中间写错、最后凑对，整段仍吃正优势。CISPO 保证的是这个 $\hat A$ 能乘到每一个 token 的 $\log\pi$ 上，包括那些 $r$ 已经很大的反思词。它不把优势拆成逐步奖励。需要逐步 $\hat A_{i,t}$ 时，公式仍在 GRPO 的过程监督一侧；CISPO 只规定系数怎么 clip。

和邻居的错位。clip 区间按 token 比率的 $0.2$ 量级去抄，可能根本不是他们调 $\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$ 时用的尺度；§3.1 没给数，只能以自己的验证曲线为准。把 CISPO 做成「$\min$ 外面套一层 sigmoid」，那是 SAPO 的结构，不是式 (5)(6)。把 $r_{i,t}$ 先做成几何平均再 clip，那是 GSPO 的 $s_i$。MoE 上 token 级 IS 方差炸掉、要靠序列似然判决整段去留，走 [03-GSPO](../03-GSPO/03-GSPO.md)，不要指望 CISPO 的 `detach` 自动消化专家漂移。

M1 把思维预算拉到 80K 时，负样本先顶满窗口，后半段负梯度过猛。CISPO 解决的是「高 $r$ token 被 $\min$ 丢掉」，不解决「负样本更长所以后半段更亏」。他们写了三条补丁：连续高概率 token 早停，避免复读占满窗口；sample 级损失和 token 级归一化掺在一起，减轻正负样本长度差；同时减小梯度裁剪阈值和 $\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$。复现长 CoT 时，只抄式 (6) 不够。

| 现象 | 原因 | 说明 |
|------|------|------|
| 反思词冒头后分数不动 | 内层多 epoch 仍用 $\min$ clip | 换 CISPO 的 $\mathrm{sg}(\hat r)$，不要只抬 $\varepsilon_{\mathrm{high}}$ |
| 上沿一松就炸 | $\hat r$ 封顶太宽，系数仍很大 | 80K 阶段他们把 $\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$ 再收紧 |
| 组内全对或全错 | 式 (3) 的 $\mathrm{std}\to 0$ | 动态采样丢掉；CISPO 不改 $z$-score |
| 后半段胡写 | 负样本更长，token 级损失堆负梯度 | 早停复读、掺 sample 级损失，不是 clip 权重能单独修 |

熵这一侧，CISPO 的承诺比「加一项熵奖励」更窄。论文的说法是：不丢掉大更新对应的 token，熵会自然留在一个还能探索的区间。没有单独报熵曲线的表。Cui 等把熵崩和策略过早确定连在一起，Wang 等强调高熵少数 token 对推理 RL 更关键。CISPO 的设计对准的是后一类位置不被 $\min$ 开除，不是另训一个熵头。若训练后期熵已经塌完，再换成 CISPO 救不回来；它防的是「刚冒头就被 clip」。

怎么选。可验证奖励、组内可比较、愿意用采样宽度换 Critic：先看 GRPO。同一批轨迹要多 epoch 更新，且发现 Wait / However 一类 token 刚冒头就被 clip 掉：换 CISPO。MoE 上 token 比率已经没有定义：GSPO。离线偏好对：DPO，本篇不展开。要平滑门而不是硬截断系数：SAPO，不是把式 (5) 的 `clamp` 改成 `sigmoid` 就算完。

## 8. 收束

CISPO 留下 GRPO 的组内相对优势和 DAPO 的 token 级分母、动态采样、长度惩罚，把 PPO 式 $\min$ clip 换成「先 clip $r$，再 $\mathrm{sg}$，梯度走 $\log\pi$」。实验里不卡 IS 下界，只调上沿，无 KL。Qwen2.5-32B-base 在 DAPO-Math 上、AIME 2024 的 Figure 2：同样步数高于 GRPO / DAPO，大约一半步数追上 DAPO。16 轮 off-policy 是这条对照成立的背景。512 张 H800、约三周是 M1 整次 RL 的墙钟。没有两全其美：token 都留下，重要性权重就不再无偏；上沿太松，封顶等于没封。下一篇要看组统计进 [02-GRPO](../02-GRPO/02-GRPO.md)；要看序列级 IS 进 [03-GSPO](../03-GSPO/03-GSPO.md)；要看 Critic 和 GAE 进 [04-PPO](../04-PPO/04-PPO.md)；要看家族对照进 [4.4.5](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md)。

## 参考文献

1. MiniMax. (2025). *MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention*. arXiv:2506.13585. https://arxiv.org/abs/2506.13585 · HTML: https://arxiv.org/html/2506.13585 （§3.1 CISPO；式 (1)–(7)；Figure 2；512 H800、约三周）
2. Shao, Z., et al. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300. https://arxiv.org/abs/2402.03300
3. Yu, Q., et al. (2025). *DAPO: An Open-Source LLM Reinforcement Learning System at Scale*. arXiv:2503.14476. https://arxiv.org/abs/2503.14476
4. Liu, Z., et al. (2025). *Understanding R1-Zero-like Training: A Critical Perspective*. arXiv:2503.20783. https://arxiv.org/abs/2503.20783 （token 级损失）
5. Schulman, J., et al. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347.
6. Zheng, C., et al. (2025). *Group Sequence Policy Optimization*. arXiv:2507.18071. https://arxiv.org/abs/2507.18071
7. Gao, C., Zheng, C., Chen, X.-H., et al. (2025). *Soft Adaptive Policy Optimization*. arXiv:2511.20347. https://arxiv.org/abs/2511.20347 （温度 sigmoid 软门；与 CISPO 不是同一机制）
8. Hu, J., et al. (2025). *Open-Reasoner-Zero: An Open Source Approach to Scaling Up Reinforcement Learning on the Base Model*. arXiv:2503.24290. https://arxiv.org/abs/2503.24290
9. Cui, G., et al. (2025). *The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models*. arXiv:2505.22617.
10. Wang, S., et al. (2025). *Beyond the 80/20 Rule: High-Entropy Minority Tokens Drive Effective Reinforcement Learning for LLM Reasoning*. arXiv:2506.01939.
11. Qwen, et al. (2025). *Qwen2.5 Technical Report*. arXiv:2412.15115.
