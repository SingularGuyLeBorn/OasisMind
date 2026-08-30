---
title: "02 · GRPO：组内相对优势"
date: 2026-08-31
as_of: 2026-08-31
tags: [GRPO, PPO, RLHF, DeepSeekMath, 组相对策略优化]
---

# 02 GRPO：组内相对优势

GRPO（Group Relative Policy Optimization）是 PPO 的变体：同一道题采 $G$ 条回答，用组内奖励的均值和标准差当基线，不再训一个和策略差不多大的价值网络。DeepSeekMath 把它写进 [2402.03300](https://arxiv.org/abs/2402.03300)；Instruct 7B 在 GSM8K 上从 82.9% 到 88.2%，MATH 从 46.8% 到 51.7%。本篇钉公式、走数值、对照结果监督和过程监督。邻居：[04-PPO](../04-PPO/04-PPO.md) 讲 Critic 和 GAE；[03-GSPO](../03-GSPO/03-GSPO.md) 把重要性采样从 token 提到序列；变体对照在 [4.4.5](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md)。**不是** DPO（离线偏好对、没有在线 rollout）。**不是** 留一法 RLOO（baseline 不含自己那一条）。

## 1. PPO 卡在哪

PPO 是演员–评论家。策略 $\pi_\theta$ 吐 token，价值网络 $V_\psi$ 估每个前缀的期望回报，优势 $A_t$ 走 GAE，再套 clip。InstructGPT 那一套还要把奖励模型的分数改成逐 token 的 $r_t$，并在奖励里扣 KL：

$$
r_t = r_\varphi(q, o_{\le t}) - \beta \log\frac{\pi_\theta(o_t\mid q,o_{<t})}{\pi_{\mathrm{ref}}(o_t\mid q,o_{<t})} \tag{1}
$$

工程上这套东西同时驻四份权重：Actor、Critic、Reward、Reference。Critic 往往和策略同量级。LLM 的奖励又几乎只打在最后一个 token 上，中间步的 $V$ 很难学准。显存翻一倍还只是账单的一半；另一半是价值估偏了，优势跟着偏，策略更新跟着歪。

组相对的想法很土：同一道 $q$，当场采 $G$ 条，用这 $G$ 个分数的均值去近似 $\mathbb{E}[r\mid q]$。基线不再是网络输出，而是同题对照。$G=1$ 时组内没有对照，均值就是自己，$z$-score 无定义，算法退化为不带 baseline 的 REINFORCE，方差会回去。DeepSeekMath 图 4 就是左右两套：左边 PPO 要 $V$，右边 GRPO 用组分数。

价值网络在 LLM 里难训，还有一层更具体的原因。GAE 假定每个前缀都有一个靠谱的 $V(s_t)$。对话短句还能凑合；数学 CoT 动辄几百 token，中间某步看起来像在推导，最终答案可能已经错了。$V$ 若按「当前前缀像不像好证明」来拟合，会把文风和正确性搅在一起。组内相对绕开「这个前缀值多少」，只问「这 $G$ 份答卷谁高谁低」。奖励模型本来也是同一题两条回答成对比较训的，和这个问法同构。

采样成本从「多一份 Critic 前向」换成「同题多 $G$ 倍生成」。推理模型反正要多采样，这笔账往往划得过来。显存账单则是少一份与策略同量级的 $V_\psi$，这是论文写 GRPO 的直接动机。

![PPO 四模型与 GRPO 无价值网络](./images/fig-grpo-vs-ppo.png)

> 图 1：左栏 PPO 用 Critic 做 GAE，KL 进奖励；右栏 GRPO 用组内 $z$-score，KL 进损失。中间那句是结构差：右边没有 $V$。

**图 1 解析**

- 两栏都从上往下。绿框是正在更新的策略。
- 左：Actor 分叉到 Critic（鲑肉色）和奖励模型（黄）。两者进橙色 GAE，$A=r-V$。紫框 $\pi_{\mathrm{ref}}$ 用虚线进 GAE，对应式 (1) 那种「KL 写进 $r_t$」。
- 右：Actor 先扩成一组 $o_1,\ldots,o_G$，再打分，再 $z$-score。紫框虚线进损失，不进 $A_i$。
- 读图时不要把右边的 Group 当成 MoE 专家。那只是同题多采样。

## 2. 组内相对优势，KL 改挂损失

优势要的是「相对好坏」，不是绝对打分。奖励模型本身也是拿同一题的两条回答做比较训出来的，组内 $z$-score 和它的比较本性一致。

对每个问题 $q$，从旧策略 $\pi_{\theta_{\mathrm{old}}}$ 采一组输出 $\{o_1,\ldots,o_G\}$，奖励（模型或规则）给出 $\mathbf{r}=\{r_1,\ldots,r_G\}$。结果监督下，整条回答共用一个归一化分数：

$$
\hat{A}_{i,t}=\widetilde{r}_i=\frac{r_i-\mathrm{mean}(\mathbf{r})}{\mathrm{std}(\mathbf{r})} \tag{2}
$$

所有 $t$ 都拿同一个 $\widetilde{r}_i$。没有 $V_\psi$。分母通常加 $\epsilon$，避免组内全对或全错时除零——后面第 6 节会说，这个 $\mathrm{std}$ 本身会引入难度偏差。

![组内采样、打分、$z$-score、广播到 token](./images/fig-grpo-group-advantage.png)

> 图 2：一道 $q$ 采 $G$ 条（图里画 4 条），打分后算组均值和标准差，得到 $A_i$，再整段广播。

**图 2 解析**

- 自上而下：蓝框 $q$ → 四条绿 $o_i$ → 四条黄 $r_i$ → 中间橙框算 mean/std → 粉框 $A_i$ → 底栏「一条里的 token 共用 $A_i$」。
- 左廊标注 sample $G$ / score / $z$-score / broadcast，对应四个计算阶段。
- 底栏是结果监督的定义，不是实现细节。过程监督会在步骤边界给不同的 $A_{i,t}$，见 §4.1。

第二条是 KL 的挂法。PPO 把 KL 扣进 $r_t$，会污染优势。GRPO 把 KL 直接加进目标，优势只由组内相对奖励决定。估计器用 Schulman 2020 那条无偏、恒非负的形式：

$$
\mathbb{D}_{\mathrm{KL}}[\pi_\theta\Vert\pi_{\mathrm{ref}}]=\frac{\pi_{\mathrm{ref}}(o_{i,t}\mid q,o_{i,<t})}{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}-\log\frac{\pi_{\mathrm{ref}}(o_{i,t}\mid q,o_{i,<t})}{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}-1 \tag{3}
$$

完整目标（论文式 (3)）是组内、逐 token 平均，再减 $\beta$ 倍 KL：

$$
\begin{aligned}
\mathcal{J}_{\mathrm{GRPO}}(\theta)
&=\mathbb{E}_{q\sim P(Q),\{o_i\}_{i=1}^{G}\sim\pi_{\theta_{\mathrm{old}}}}
\Bigg[
\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}
\Big(
\min\big(\eta_{i,t}\hat{A}_{i,t},\;
\mathrm{clip}(\eta_{i,t},1-\varepsilon,1+\varepsilon)\hat{A}_{i,t}\big)
-\beta\,\mathbb{D}_{\mathrm{KL}}[\pi_\theta\Vert\pi_{\mathrm{ref}}]
\Big)
\Bigg]
\end{aligned} \tag{4}
$$

其中重要性比率

$$
\eta_{i,t}=\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q,o_{i,<t})} \tag{5}
$$

clip 仍是 PPO 那套，作用在 **token 级** 比率上。这和后面 GSPO 的序列级 $s_i$ 不是同一件事。附录在 $\pi_{\theta_{\mathrm{old}}}=\pi_\theta$ 时去掉 min/clip，梯度系数是 $\hat{A}_{i,t}+\beta(\pi_{\mathrm{ref}}/\pi_\theta-1)$ 乘在 $\nabla\log\pi_\theta$ 前面（论文式 (20)(21)）。

## 3. 目标函数怎么算：拆项、数字、代码

### 3.1 三项各管什么

式 (4) 里同时有三件东西，不要混成「一个 loss」。

第一项是 clip 代理。$\hat{A}_{i,t}>0$ 时想抬 $\eta_{i,t}$，但抬过 $1+\varepsilon$ 就不再加分；$\hat{A}_{i,t}<0$ 时想压 $\eta_{i,t}$，压过 $1-\varepsilon$ 也不再加罚。信任域还在，只是用一阶 clip 代替 TRPO 的 KL 约束。

第二项是 $1/|o_i|$。论文把每个回答先在自己的长度上平均，再对组平均。短回答的每个 token 会分到更大的权重。2025 年 Dr. GRPO 指出这会推「对的要短、错的要长」。DAPO 后来改成 batch 内 token 总数做分母。本篇先按 2402.03300 写；偏差见 §6。

第三项是式 (3) 的 KL。$\beta$ 在 DeepSeekMath 的 GRPO 实验里取 0.04。它不进入 $\hat{A}$，所以组内相对好坏和「别离 SFT 太远」是两条绳。

### 3.2 一组四个分数

取 $G=4$，规则奖励对错为 1/0，$\mathbf{r}=(1,0,1,0)$。

均值 $\mathrm{mean}(\mathbf{r})=0.5$。若用总体标准差，$\mathrm{std}=\sqrt{0.25}=0.5$，于是

$$
\widetilde{r}=(1,-1,1,-1)
$$

结果监督下四条回答的每个 token 分别拿到 $+1,-1,+1,-1$。第一条里无论哪个 token，梯度方向都是「再提高这条轨迹的概率」；第二条整段往下压。

把重要性比率也写进同一张表。设 clip $\varepsilon=0.2$。某条正优势回答上，一个 token 的 $\eta=1.5$，已经超出 $1.2$，clip 分支生效，代理目标锁在 $1.2\times\hat{A}$，再加大 $\eta$ 不再加分。负优势回答上 $\eta=0.5$ 低于 $0.8$，同样被锁。这和 PPO 教科书里的图是同一件事，只是 $\hat{A}$ 来自组统计，不是 GAE。

全对或全错时 $\mathrm{std}\to 0$。实现里 clamp 一个 $\epsilon$。数值上 $\hat{A}$ 会被放得很大，而组内又几乎没有可比较的差异——这就是 §6.2 的难度偏差。论文训练时每题采 $G=64$，比这里的 4 稳定得多，但全 1 / 全 0 的组仍然会出现。

过程监督用同一套 $z$-score，粒度换成步骤。设 $G=2$，两条回答都拆成三步，六步奖励（未归一化）为

$$
(0.2,\;0.8,\;1.0),\qquad (0.1,\;0.1,\;0.0)
$$

全体六个数的均值约 $0.37$，标准差大约 $0.40$。归一化后第一条三步约为 $(-0.4,\;1.1,\;1.6)$，第二条约为 $(-0.7,\;-0.7,\;-0.9)$。按式 (6)，第一条第一步的 token 吃后面三步之和 $1.1+1.6-0.4$，末步只吃 $1.6$；第二条每步都是负的，越靠前累加越狠。这和结果监督「整段同一个 $\widetilde{r}$」不是同一张表。数字是为了把求和方向看清，不是论文表格。

### 3.3 一段可对照的 PyTorch

下面不是框架源码，只把式 (2) 和 masked 平均写清楚。形状约定：`token_level_rewards` 为 $(B,T)$，结果监督时通常只有最后一个有效 token 非零；$B$ 能被组数整除。

```python
import torch
import torch.nn.functional as F

def group_zscore_advantage(
    token_level_rewards: torch.Tensor,
    response_mask: torch.Tensor,
    group_size: int,
    eps: float = 1e-8,
) -> torch.Tensor:
    """结果监督：每条回答一个标量 r，组内 z-score，再广播到 token。"""
    B, T = token_level_rewards.shape
    assert B % group_size == 0
    n_groups = B // group_size
    r = (token_level_rewards * response_mask).sum(dim=-1)  # (B,)
    r = r.view(n_groups, group_size)
    mean = r.mean(dim=-1, keepdim=True)
    std = r.std(dim=-1, keepdim=True).clamp_min(eps)
    adv = (r - mean) / std  # (n_groups, group_size)
    adv = adv.reshape(B, 1).expand(-1, T) * response_mask
    return adv


def grpo_clip_and_kl(
    log_prob: torch.Tensor,
    old_log_prob: torch.Tensor,
    ref_log_prob: torch.Tensor,
    advantages: torch.Tensor,
    response_mask: torch.Tensor,
    clip_eps: float = 0.2,
    beta: float = 0.04,
) -> torch.Tensor:
    """式 (4) 的 token 平均：clip 代理减去 KL 估计。"""
    log_ratio = log_prob - old_log_prob
    eta = torch.exp(log_ratio)
    unclipped = eta * advantages
    clipped = torch.clamp(eta, 1.0 - clip_eps, 1.0 + clip_eps) * advantages
    policy = torch.minimum(unclipped, clipped)
    # 式 (3)：pi_ref / pi_theta - log(pi_ref / pi_theta) - 1
    ratio_ref = torch.exp(ref_log_prob - log_prob)
    kld = ratio_ref - (ref_log_prob - log_prob) - 1.0
    per_token = policy - beta * kld
    denom = response_mask.sum().clamp_min(1.0)
    return (per_token * response_mask).sum() / denom
```

`group_zscore_advantage` 里的 `std` 是样本标准差还是总体标准差，实现之间不一致。DeepSeekMath 正文写 $\mathrm{std}(\mathbf{r})$，没有写 Bessel 修正。verl 一类代码常用 `std` 再 `clamp_min`。对账时以你用的训练器为准，不要把两种 std 合成一个数。

`grpo_clip_and_kl` 的分母用了 batch 内有效 token 总数，更接近后文 DAPO 的 token-level 聚合，而不是论文式 (4) 那种先 $1/|o_i|$ 再对 $G$ 平均。对照论文时把最后一行改成「先按 mask 对每条求均值，再对 $B$ 平均」。两种分母会改变 §6.1 的长度偏差大小。

## 4. 结果监督、过程监督、迭代 RL

### 4.1 结果监督 vs 过程监督

结果监督（Outcome Supervision，论文 §4.1.2）：奖励只打在整段输出结束。归一化之后 $\hat{A}_{i,t}=\widetilde{r}_i$，整段同号。数学题对错分明时，这已经够用。短板是信用分配：中间某步写错、最后凑对了，整段仍吃正优势；中间全对、最后抄错答案，整段挨打。

过程监督（Process Supervision，§4.1.3）：跟 Wang et al. 2023b，在每个推理步骤结束给分。第 $i$ 条有 $K_i$ 步，第 $j$ 步结束下标是 $\mathrm{index}(j)$，得到

$$
\mathbf{R}=\big\{\{r_i^{\mathrm{index}(1)},\ldots,r_i^{\mathrm{index}(K_i)}\}\big\}_{i=1}^{G}
$$

全体步骤奖励一起做 $z$-score：

$$
\widetilde{r}_i^{\mathrm{index}(j)}=\frac{r_i^{\mathrm{index}(j)}-\mathrm{mean}(\mathbf{R})}{\mathrm{std}(\mathbf{R})}
$$

token $t$ 的优势是**后面所有步骤**归一化奖励之和：

$$
\hat{A}_{i,t}=\sum_{\mathrm{index}(j)\ge t}\widetilde{r}_i^{\mathrm{index}(j)} \tag{6}
$$

目标仍是式 (4)，只换 $\hat{A}_{i,t}$。论文在 1.3B Instruct 上看到 GRPO+PS 优于 GRPO+OS：梯度系数按步骤变细，比整段同一个 $z$-score 更对得上多步题。PRM 自己会标错。OpenAI PRM800K 的 issue 里大约 20% 标注不可靠。过程监督不是免费的细粒度，错标会沿式 (6) 往后累加。

### 4.2 迭代式强化学习

单轮 RL 用固定奖励模型盯正在变的策略，过一阵 $r_\varphi$ 就不够格。论文 Algorithm 1：外层迭代 $I$ 次；每次先令 $\pi_{\mathrm{ref}}\leftarrow\pi_\theta$，内层 $M$ 步采样、算组相对优势、最大化式 (4)（实现里他们写 Equation 21，指附录梯度系数那套），然后用策略新采样给奖励模型续训，replay 掺 10% 历史。实验做了两轮。图 6 显示迭代明显抬分，第一轮最陡。

Algorithm 1 按时间展开是这样：$\pi_\theta\leftarrow\pi_{\mathrm{init}}$。外层 $i=1\ldots I$：把当前策略拷成参考 $\pi_{\mathrm{ref}}\leftarrow\pi_\theta$；内层 $m=1\ldots M$ 从题集抽 batch，令 $\pi_{\theta_{\mathrm{old}}}\leftarrow\pi_\theta$，对每道题采 $G$ 条，跑 $r_\varphi$ 得 $\{r_i\}$，按 §4.1 算 $\hat{A}_{i,t}$，再对 $\mu$ 步最大化式 (4)。内层结束后用新采样给 $r_\varphi$ 续训，replay 里留 10% 旧数据。外层一圈走完，参考模型已经是上一圈的策略，奖励模型也跟着策略挪了位置。

内层还有一个实现选择：DeepSeekMath 的 GRPO 每次探索之后策略只更新一次，于是 $\pi_{\theta_{\mathrm{old}}}\approx\pi_\theta$，clip 几乎不触发。后来 R1 一类训练会提高 $\mu$（同一批经验上多 epoch），clip 才重新成为主约束。不要把「论文实验 $\mu=1$」写成「GRPO 没有 clip」。

组大小在论文 GRPO 实验里是每题 64 条，最大长度 1024，policy 学习率 $10^{-6}$，batch 1024。这是 7B 数学 RL 的配置，不是 R1 的长 CoT 配置。抄超参要带模型档。

### 4.3 在谱系里的位置

论文把 SFT、RFT、DPO、Online RFT、PPO、GRPO 收进同一张表（Table 10）：数据从哪来、奖励是规则还是模型、梯度系数怎么从奖励变成 $\nabla\log\pi$。

| 方法 | 采样 | 奖励 | 梯度系数 |
|------|------|------|----------|
| SFT | 离线示范 | 无（似然） | 正例 token 均匀 |
| RFT | 离线，过滤正确 | 规则 0/1 | 只抬对的，不打错的 |
| DPO | 离线偏好对 | 隐含在 $(y_w,y_l)$ | 成对 logistic |
| Online RFT | 在线 | 规则 | 对的均匀抬，错的不打 |
| PPO | 在线 | 模型 + GAE | $A_t$（要 $V$） |
| GRPO | 在线 | 模型或规则 | 组内 $\hat{A}_{i,t}$，无 $V$ |

图 5 在 Instruct 1.3B 上：Online RFT 后期明显超过离线 RFT，在线采样赢在策略已经离开 SFT 之后。GRPO 再超过 Online RFT，因为梯度系数按奖励幅度分正负，不是「对了就同样抬一把」。附录把几家方法写成同一个梯度模具：$\nabla\theta$ 正比于梯度系数 $GC$ 乘 $\nabla\log\pi_\theta(o_t\mid q,o_{<t})$。SFT / RFT 的 $GC$ 是 0/1 开关；Online RFT 在线但仍不按分数幅度分档；PPO 的 $GC$ 是 GAE 的 $A_t$；GRPO 的 $GC$ 是 $\hat{A}_{i,t}+\beta(\pi_{\mathrm{ref}}/\pi_\theta-1)$（论文式 (21)）。差别全在 $GC$ 怎么从奖励变出来，不在「还算不算强化学习」。

GRPO 仍是策略梯度，没有把 RL 改写成分类。DPO 在这张表里是离线、成对、无 rollout；和 GRPO 分工，不是谁取代谁。通用偏好对齐仍常见 DPO；数学和代码这类可验证奖励，组相对更省事。

式 (3) 为什么恒非负：令 $x=\pi_{\mathrm{ref}}/\pi_\theta>0$，则 $x-\log x-1$。$f(x)=x-\log x-1$ 在 $x=1$ 取 0，二阶导数 $1/x^2>0$，是凸函数，最小值就是 0。策略和参考重合时 KL 项不出力；偏离时永远往回拉，不会像 $\log(\pi_\theta/\pi_{\mathrm{ref}})$ 那样在某些区间变号。这是把它从奖励里挪到损失里之后，优势不再被一个可正可负的 KL 搅浑的原因。

## 5. DeepSeekMath 里实际看到什么

### 5.1 训练设定和数字

RL 数据只用 SFT 里 GSM8K、MATH 的 CoT 题，大约 144K 道，故意不喂其它 SFT 题，好观察「没在 RL 里见过的基准」会不会动。初始奖励模型从 DeepSeekMath-Base 7B 训，学习率 $2\times 10^{-5}$。策略从 Instruct 7B 出发。

表 5：CoT 设定下 GSM8K 88.2%、MATH 51.7%，盖过当时 7B–70B 开源和多数闭源。起点是 Instruct 的 82.9% / 46.8%。领域外中文 CMATH 84.6% → 88.8%。RL 题集很窄，基准却普涨——论文把没出现在 RL 集里的基准都叫 out-of-domain。摘要里另一条 64 样本自一致性 MATH 60.9%，那是解码时的 majority vote，不是 GRPO 目标函数里的组大小 $G$，不要把两个 64 合成一件事。奖励模型学习率 $2\times 10^{-5}$、策略 $10^{-6}$，差一个数量级：RM 先拟合比较数据，策略只在组相对优势上小步挪。

预训练侧两句不要安到 GRPO 头上，但和「为什么这套 RL 有东西可挖」有关：代码训练对有工具和无工具的数学都有帮助；单纯堆 arXiv 对解题帮助不大。形式上看起来像数学的数据，不等于会做题。

预训练侧两句不要安到 GRPO 头上，但和「为什么这套 RL 有东西可挖」有关：代码训练对有工具和无工具的数学都有帮助；单纯堆 arXiv 对解题帮助不大。形式上看起来像数学的数据，不等于会做题。

### 5.2 为什么 RL 有效

图 7：Instruct 和 RL 两个 7B，温度 0.7，画 Maj@K 和 Pass@K。RL 抬的是 Maj@K，Pass@K 几乎不动。论文的判断：输出分布更稳了，正确回答从 Top-K 里被抬到更常被采到的位置，不是基础能力又上了一层。这和后来「RLVR 抬 pass@1、pass@K 不动」是同一类观察，细节在 [4.4-RLVR 边界](../../4.4-RLVR的局限性与探索边界分析.md)。

论文自己给的后续方向也按那三个零件拆：数据源（OOD 题、树搜索解码、更快的推理引擎）、算法（奖励噪声下别全信 GC；PRM 会标错）、奖励（结果不够就加过程，过程不够就想办法自动标）。不要把这段读成「GRPO 已经解决推理」。它解决的是：在可验证或可比较的组内分数上，去掉 Critic 也能做 PPO 式更新。

## 6. 长度偏差和难度偏差

2025 年初对式 (4) 分母和 $\mathrm{std}$ 的分析指出两个系统性偏差，后面 Dr. GRPO、DAPO 都冲着它们改。本篇只把机制钉清，变体公式以各专文和 [4.4.5](../../4.4.5-GxPO家族/01-GxPO结构扩展/01-GxPO结构扩展.md) 为准。

### 6.1 响应长度偏差

$\frac{1}{|o_i|}$ 让同样大小的 $\hat{A}_i$ 摊在不同长度上。正优势短回答：每个 token 梯度更大，策略更爱短的正确写法。负优势长回答：惩罚被摊薄，长的错解压不干净。优势按整段算，更新按 token 均摊，两套粒度拧着。

不少 PPO 实现也按 mask 长度做均值，预训练时 pad 到固定上下文、用上下文长度归一化，迁移到变长 RL 时把习惯带过来。这不是 GRPO 独有，但组相对把问题暴露得更干净，因为没有 Critic 把长度相关的价值偏置再抹一层。

### 6.2 问题难度偏差

$\mathrm{std}(\mathbf{r})$ 在组内几乎全 1 或全 0 时趋近 0，微小差异被放大成极端 $\hat{A}$。简单题和难题的「差一点」统计意义不同，梯度里却被放成同类。DAPO 的动态采样直接丢掉准确率 0% 或 100% 的组；Dr. GRPO 选择去掉 $\mathrm{std}$ 归一化。

### 6.3 代码里的分母

```python
def masked_mean(tensor, mask, dim):
    return (tensor * mask).sum(axis=dim) / mask.sum(axis=dim)  # 按真实长度，有偏

# Dr. GRPO 一类改法：固定常数（生成预算）
# return (tensor * mask).sum(axis=-1) / MAX_TOKENS
```

分母用 `mask.sum` 还是 `MAX_TOKENS`，就是 §6.1 在代码里的开关。改分母前先确认你要复现的是 2402.03300、Dr. GRPO 还是 DAPO。

## 7. 变体只作索引

2025–2026 的名字很多，本夹 01 / 03 和 4.4.5 是正本。这里只留「相对 GRPO 改了哪一侧」，避免再写一套互相打架的公式。

| 算法 | 时间 | 相对 GRPO 改什么 | 正本 |
|------|------|------------------|------|
| GRPO | 2024.2 | 组内 $z$-score 替代 $V$ | 本篇 |
| Dr. GRPO | 2025.3 | 去掉长度分母和 $\mathrm{std}$ | 4.4.5 可选对照 |
| DAPO | 2025.3 | Clip-Higher、动态采样、token 级损失、超长惩罚 | 4.4.5；arXiv:2503.14476 |
| GSPO | 2025.7 | 序列级几何平均重要性比率 | [03-GSPO](../03-GSPO/03-GSPO.md)；2507.18071 |
| GMPO | 2025 | 几何平均压离群比率 | [01-GMPO](../01-GMPO/01-GMPO.md) |

DAPO 全称是 Decoupled Clip and Dynamic sAmpling Policy Optimization，不要写成别的扩写。GSPO 的序列级比率是长度归一化的几何平均

$$
s_i(\theta)=\Big(\frac{\pi_\theta(y_i\mid x)}{\pi_{\theta_{\mathrm{old}}}(y_i\mid x)}\Big)^{1/|y_i|}
$$

不是 token 比率的算术平均。本篇 §2 的 $\eta_{i,t}$ 仍是 token 级，那正是 Qwen 说 GRPO 和奖励粒度不匹配的地方。

LitePPO、GFPO 等名字在社区笔记里常见，本篇不展开；没有一手数字就不要写成「减 40%～80%」这类口口相传的幅度。

## 8. 怎么选

PPO：要 GAE、要过程中的价值、safety 在线探索仍常见。显存按四模型估。

GRPO：可验证奖励或组内可比较打分，愿意用采样宽度换 Critic 显存。组太小（$G=2$）均值晃；论文数学实验用到 64。

GSPO：MoE 上 token 级 IS 方差炸掉时，换序列级。公式和代码在 03。

DPO：静态偏好对、不跑在线 RL。和 GRPO 叠在同一条后训练流水线里很常见，不是二选一。

RLOO：同样多采样去 Critic，但第 $i$ 条的 baseline 是其余 $K-1$ 条的均值，不含自己，也通常不做 $\mathrm{std}$ 归一化。和本篇的组内 $z$-score 不是同一条基线。

## 9. 收束

GRPO 把 PPO 的 clip 留下，把 $V_\psi$ 换成同题 $G$ 条的相对分数，KL 从奖励里挪到损失里。DeepSeekMath 用窄题集做出 GSM8K / MATH 的那两跳，并写明 Maj@K 动、Pass@K 不动。长度分母和 $\mathrm{std}$ 是后文变体的入口，不是本算法的彩蛋。下一篇要看序列级 IS 就进 GSPO；要看几何平均进 GMPO；要看家族对照进 4.4.5。

## 参考文献

1. Shao, Z., et al. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300. https://arxiv.org/abs/2402.03300
2. Schulman, J., et al. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347.
3. Schulman, J. (2020). *Approximating KL Divergence*. http://joschu.net/blog/kl-approx.html
4. Ouyang, L., et al. (2022). *Training language models to follow instructions with human feedback*. NeurIPS.
5. Guo, D., et al. (2025). *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*. arXiv:2501.12948.
6. Yu, Q., et al. (2025). *DAPO: An Open-Source LLM Reinforcement Learning System at Scale*. arXiv:2503.14476.
7. Zheng, C., et al. (2025). *Group Sequence Policy Optimization*. arXiv:2507.18071.
8. Wang, P., et al. (2023). *Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations*. arXiv:2312.08935.
