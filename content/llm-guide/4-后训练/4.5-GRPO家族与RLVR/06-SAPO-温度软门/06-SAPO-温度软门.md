---
title: "06 · SAPO: 温度软门"
published: true
tags: ["SAPO", "GSPO", "GRPO", "RLHF", "软门", "Qwen"]
excerpt: "SAPO (Soft Adaptive Policy Optimization) 来自 Qwen 团队, 把 GRPO/GSPO 的硬裁剪换成温度控制的 sigmoid 门: 重要性比率等于 1 时梯度权重为 1, 偏离后平滑衰减; 负优势用更高的温度, 衰减更快. 在 Qwen3-30B-A3B-Base 冷启动的数学 RL 上, GSPO 和 GRPO-R2 早期崩溃, SAPO 保持稳定."
---

# SAPO: 温度软门

> 相关阅读: [01 GRPO](../01-GRPO/01-GRPO.md) · [04 GSPO](../04-GSPO/04-GSPO.md) · [05 GMPO](../05-GMPO/05-GMPO.md) · [03 CISPO](../03-CISPO-裁剪重要性权重/03-CISPO-裁剪重要性权重.md) · [04 PPO](../../4.4-强化学习基础/04-PPO/04-PPO.md)

材料是 Gao 等 (Qwen 团队) 的 *Soft Adaptive Policy Optimization* (arXiv:2511.20347). 问题是组相对策略优化里的硬裁剪: 带收紧则能算梯度的样本变少, 带放宽则离策略样本的噪声进来, 能否用一个连续的门换掉这把闸.

## 1. 硬裁剪卡在宽窄之间

### 1.1 GRPO 和 GSPO 的闸

GRPO 对每道题 $q$ 从旧策略 $\pi_{\theta_{\mathrm{old}}}$ 采 $G$ 条回答, 奖励在组内标准化, 再乘 token 级重要性比率:

$$
r_{i,t}(\theta)=\frac{\pi_\theta(y_{i,t}\mid q,y_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid q,y_{i,<t})},\qquad
\hat{A}_{i,t}=\hat{A}_i=\frac{R_i-\mathrm{mean}(\{R_j\}_{j=1}^{G})}{\mathrm{std}(\{R_j\}_{j=1}^{G})}
\tag{1}
$$

式 (1) 是论文式 (2). 优势在一条回答内所有 token 共用. GRPO 的目标对每个 token 取 $\min(r\hat{A},\mathrm{clip}(r,1-\varepsilon,1+\varepsilon)\hat{A})$; GSPO 把比率换成长度归一化的几何平均

$$
s_i(\theta)=\left(\frac{\pi_\theta(y_i\mid q)}{\pi_{\theta_{\mathrm{old}}}(y_i\mid q)}\right)^{1/|y_i|}=\exp\Bigl(\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\log r_{i,t}(\theta)\Bigr)
\tag{2}
$$

再对 $s_i$ 做同样的裁剪 (论文式 (3)(4)). 一个在 token 上判, 一个在整条回答上判, 判决都是二值的: 带内按未裁剪目标给梯度, 带外梯度为 0.

这道闸的来历要追到 PPO. Schulman 等 (2017) 把 TRPO 的 KL 约束换成对比率的裁剪, 理由是代理目标 $r\hat{A}$ 只在 $\pi_\theta$ 靠近 $\pi_{\theta_{\mathrm{old}}}$ 时才是真实目标的好近似; 比率走远以后, 沿代理目标继续上升可能让真实回报下降. 裁剪的作用是让比率出带后代理目标不再增长, 从而不再有把它继续推远的梯度. 这是一种二值的信赖域. SAPO 论文把自己的门称作连续信赖域 (continuous trust region): 目的相同, 都是限制离旧策略太远的更新, 区别只在于边界处是断开还是平滑过渡.

### 1.2 为什么比率会散

一批 rollout 通常切成几个 mini-batch 依次更新. 第一个 mini-batch 更新完, 后面的 mini-batch 面对的 $\pi_\theta$ 已经偏离采样时的 $\pi_{\theta_{\mathrm{old}}}$, $r_{i,t}$ 自然离开 1. 论文引言指出, token 级比率的方差在 MoE 模型上更高, 路由的异构和长回答会把各 token 的偏差放大. GSPO 论文给过一个量: 48 层的 Qwen3-30B-A3B-Base, 每次梯度更新后同一条 rollout 上约 10% 的激活专家与旧策略不同 (见 [04 GSPO](../04-GSPO/04-GSPO.md)).

论文对硬裁剪的判断是两头为难: 带收得过紧, 参与梯度计算的有效样本变少; 放得过松, 离策略样本带来的噪声梯度进来. 这里的困难出在「出带即归零」这一刀上, 调 $\varepsilon$ 只是在两种坏处之间挪位置. GSPO 的问题更集中. 几何平均让 $s_i$ 贴近 1, GSPO 论文用的带宽是左 $3\times10^{-4}$, 右 $4\times10^{-4}$; 一条回答里只要少数 token 偏得厉害, $s_i$ 就出带, 整条回答连同其中大量近 on-policy 的 token 一起没有梯度.

GSPO 放弃 token 级比率还有一个理由: 重要性采样要在许多样本上平均才能校正分布差异, 而 GRPO 在每个位置只有一个采样 token, 这个比率校正不了下一个 token 的分布差异, 只往梯度里加高方差噪声, 序列越长噪声越多. SAPO 没有接受这个结论, 比率仍按 token 算. 它的回应是 3.2 节的推导: 在小步, 低分散的条件下, token 门的平均本来就接近序列门; 条件不满足时, 逐 token 处理反而能区分好坏 token.

### 1.3 对照组 GRPO-R2 是什么

SAPO 的对照里, GRPO 带着 routing replay, 记作 GRPO-R2. routing replay 来自 GSPO 论文的讨论: MoE 在梯度更新前后激活的专家会变, 比率的分子和分母因此来自两套不同的子网络. 做法是缓存 $\pi_{\theta_{\mathrm{old}}}$ 激活的专家, 计算比率时让 $\pi_\theta$ 走同一套路由. GSPO 论文显示 GRPO 在 MoE 上不加它时训练奖励下降, 加上才能正常收敛; 代价是额外的显存和通信, 并且更新时模型容量被限制在旧路由上. GSPO 改用序列似然, 不需要 routing replay. SAPO 的受控实验沿用 GSPO 论文的超参, 那组超参里 GRPO 的裁剪是左 $0.2$, 右 $0.27$.

所以 SAPO 要回答的问题更具体: 不加 routing replay, 也不像 GSPO 那样整条丢弃, 只靠一个按 token 计算的门, 能否在 MoE 上训稳.

SAPO 保留组采样和式 (1) 的优势, 只换掉这把闸.

![硬裁剪出带归零, 软门在 r=1 处峰值后衰减](./images/fig-sapo-soft-gate.png)

> 图 1: 左栏是 GRPO/GSPO 的硬裁剪, 比率在 $[1-\varepsilon,1+\varepsilon]$ 内保留梯度, 出带则该项梯度为 0. 右栏是 SAPO 的 sigmoid 门 $f=(4/\tau)\sigma(\tau(r-1))$, $r=1$ 处梯度权重为 1, 偏离后平滑衰减.

**图 1 解析**

- 两栏都从比率 $r$ 出发, 只标闸门插在哪一步, 没有画 $r$ 对权重的坐标曲线. 论文 Figure 1 才是代理目标和 $w$ 关于 $r$ 的函数图.
- 左栏的虚线表示被排除的那一支, 出带 token 不进梯度.
- 右栏两条实线都进梯度: 靠近 1 的满权, 离 1 远的权重变小但仍大于 0.

## 2. 门的公式

### 2.1 目标和梯度

SAPO 最大化 (论文式 (5)(6))

$$
\mathcal{J}(\theta)=\mathbb{E}_{q\sim\mathcal{D},\,\{y_i\}_{i=1}^{G}\sim\pi_{\theta_{\mathrm{old}}}(\cdot\mid q)}\Biggl[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}f_{i,t}\bigl(r_{i,t}(\theta)\bigr)\hat{A}_{i,t}\Biggr]
\tag{3}
$$

$$
f_{i,t}(x)=\frac{4}{\tau_{i,t}}\,\sigma\bigl(\tau_{i,t}(x-1)\bigr),\qquad
\tau_{i,t}=\begin{cases}\tau_{\mathrm{pos}}, & \hat{A}_{i,t}>0\\ \tau_{\mathrm{neg}}, & \text{otherwise}\end{cases},\qquad \sigma(u)=\frac{1}{1+e^{-u}}
\tag{4}
$$

温度按优势的正负分两档. 对 $\theta$ 求导, 用 $\nabla_\theta r=r\,\nabla_\theta\log\pi_\theta$, 得到加权的对数策略梯度 (论文式 (7)(8)):

$$
\nabla_\theta\mathcal{J}(\theta)=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}w_{i,t}(\theta)\,r_{i,t}(\theta)\,\nabla_\theta\log\pi_\theta(y_{i,t}\mid q,y_{i,<t})\,\hat{A}_{i,t}\Biggr]
\tag{5}
$$

$$
w_{i,t}(\theta)=4\,p_{i,t}(\theta)\bigl(1-p_{i,t}(\theta)\bigr),\qquad p_{i,t}(\theta)=\sigma\bigl(\tau_{i,t}(r_{i,t}(\theta)-1)\bigr)
\tag{6}
$$

### 2.2 系数 $4/\tau$ 的来历

$p(1-p)$ 在 $p=1/2$ 时取最大值 $1/4$. $r=1$ 时 $p=\sigma(0)=1/2$, 与 $\tau$ 无关, 所以 $w=1$, 梯度等于未裁剪目标 $r\hat{A}$ 的梯度. 换个角度看: $\frac{\mathrm{d}}{\mathrm{d}x}\sigma(\tau(x-1))$ 在 $x=1$ 处等于 $\tau\sigma'(0)=\tau/4$, 乘上 $4/\tau$ 恰好为 1. 论文正是用这一点解释 $f$ 里的 $4/\tau$: 换温度只改变离开 1 之后衰减的快慢, 不改变 on-policy 点上的步长. 注意 $r=1$ 时 $f$ 本身的取值是 $2/\tau$, 这是代理目标的数值, 与梯度权重无关.

$\tau$ 越大, sigmoid 越陡, $w$ 作为 $r$ 的函数越窄, 衰减越快. 论文称这一衰减近似指数. 下表是按式 (6) 手算的几个点, 用来看形状, 论文没有这张表:

| $r$ | 0.5 | 0.8 | 1.2 | 1.5 | 2 | 3 | 5 |
|---|---|---|---|---|---|---|---|
| $w$, $\tau=1$ | 0.940 | 0.990 | 0.990 | 0.940 | 0.786 | 0.420 | 0.071 |
| $w$, $\tau=1.05$ | 0.934 | 0.989 | 0.989 | 0.934 | 0.768 | 0.389 | 0.058 |
| $w\cdot r$, $\tau=1$ | 0.470 | 0.792 | 1.188 | 1.410 | 1.573 | 1.260 | 0.353 |

$w$ 关于 $r=1$ 对称, 所以 $r=0.8$ 和 $r=1.2$ 的值相同. 真正乘在 $\nabla\log\pi\,\hat{A}$ 前面的是 $w\cdot r$. $\tau=1$ 时它在 $r\approx2.06$ 处达到最大约 $1.57$, 之后下降, $r=5$ 时只剩 $0.35$; $\tau=1.05$ 时最大约 $1.54$, 位置在 $r\approx1.99$. 有效系数有上界, 远离 1 的 token 最终被压到接近 0. 由此每个 token 的梯度范数不超过 $1.57\,|\hat{A}|\,\lVert\nabla_\theta\log\pi_\theta\rVert$. 未裁剪的 $r\hat{A}$ 没有这样的上界, $r$ 多大系数就多大. GRPO 取 $\varepsilon=0.2$ 时, 正优势 token 在 $r>1.2$ 后系数直接为 0; 同样的 $r=1.5$ 和 $r=2$, SAPO 仍给 $1.41$ 和 $1.57$.

两档默认温度 $\tau_{\mathrm{pos}}=1.0$, $\tau_{\mathrm{neg}}=1.05$ 相差很小, 表中两行的差别在第二位小数. 第 4 节的消融显示这点差别已经足以影响是否崩溃.

衰减的形状可以直接从式 (6) 读出. 记 $u=\tau(r-1)$, 则 $w=4\sigma(u)\sigma(-u)$. $|u|$ 较大时 $\sigma(-|u|)\approx e^{-|u|}$, $\sigma(|u|)\approx1$, 所以 $w\approx4e^{-\tau|r-1|}$, 这就是论文所说的近似指数衰减. 代入 $r=5$, $\tau=1$: $4e^{-4}\approx0.073$, 与表中精确值 $0.071$ 很接近.

反过来可以问: $w$ 降到某个值需要偏离多远. 令 $4p(1-p)=c$, 解出 $p=\tfrac12\bigl(1+\sqrt{1-c}\bigr)$, $|u|=\ln\frac{p}{1-p}$. $c=0.9$ 时 $|u|\approx0.655$, $c=0.5$ 时 $|u|\approx1.763$. 取 $\tau=1$, 就是 $|r-1|<0.655$ 内权重不低于 0.9, 偏离到 $1.76$ 才降到一半. GRPO 常用的 $\varepsilon=0.2$ 对应的位置上, SAPO 的权重仍有 0.99. 所以在默认温度下, SAPO 的「软带」比 GRPO 的硬带宽得多: 它在 1 附近几乎不干预, 主要压的是偏离很大的 token.

两个极限也能说明温度的作用. $\tau\to0$ 时, 一阶展开 $\sigma(\tau(x-1))\approx\tfrac12+\tfrac{\tau}{4}(x-1)$, 得 $f\approx\tfrac{2}{\tau}+(x-1)$, 常数项不影响梯度, 门退化为未裁剪的 $r\hat{A}$, 没有任何信赖域. $\tau\to\infty$ 时, $r\neq1$ 处 $w\to0$, 只有恰好 on-policy 的 token 有梯度, 策略几乎不动. 论文选的 1 附近介于两者之间.

### 2.3 实现

```python
import torch

def sapo_loss(logp, logp_old, adv, response_mask, tau_pos=1.0, tau_neg=1.05):
    # logp, logp_old: [B, T] 回答 token 的对数概率; adv: [B, T] 组内标准化优势
    r = torch.exp(logp - logp_old.detach())
    tau = torch.where(adv > 0, torch.full_like(adv, tau_pos), torch.full_like(adv, tau_neg))
    f = (4.0 / tau) * torch.sigmoid(tau * (r - 1.0))
    per_token = f * adv
    per_seq = (per_token * response_mask).sum(-1) / response_mask.sum(-1).clamp_min(1)
    return -per_seq.mean()
```

每批 rollout 的第一个 mini-batch 上 $\pi_\theta=\pi_{\theta_{\mathrm{old}}}$, 所有 $r=1$, $w=1$, SAPO 与 GRPO 给出完全相同的梯度; 两者的差别只出现在后续 mini-batch 上. 切分份数越多, 后面的 mini-batch 离策略越远, 门起作用的 token 越多. 计算上, 门只在每个 token 上多算一次 sigmoid, 不需要额外的前向, 也不需要价值网络.

走一个完整的小例子. 一组 $G=4$, 奖励为 $(1,1,0,0)$, 均值 $0.5$, 总体标准差 $0.5$, 前两条回答的优势为 $+1$, 后两条为 $-1$. 到第三个 mini-batch 时, 某个答对回答里的 token 比率为 $1.4$: GRPO ($\varepsilon=0.2$) 判它出带, 系数为 0; SAPO 用 $\tau_{\mathrm{pos}}=1.0$, $w\approx0.961$, 系数 $w\cdot r\approx1.35$. 某个答错回答里的 token 比率也是 $1.4$: GRPO 判它在带内, 系数为 $1.4$; SAPO 用 $\tau_{\mathrm{neg}}=1.05$, $w\approx0.957$, 系数约 $1.34$. 偏离只有 0.4 时, 两侧温度的差别很小, SAPO 与未裁剪目标几乎一样; 差别要到比率偏离 1 以上才明显.

$w=4p(1-p)$ 由反传从 $f$ 自动得到, 不需要再乘进损失. 按式 (3) 先在每条回答内对 token 求平均, 再对 $G$ 条回答求平均. 比率先算对数差再取指数, 避免概率直接相除时下溢. $\tau$ 按每个 token 所在回答的优势符号选取, 正负混用一个温度就退回 Figure 5 中间那一档.

### 2.4 负优势为什么用更高的温度

正负更新对 logits 的作用不对称. 记 $z$ 为词表 $\mathcal{V}$ 上的 logits, $\pi=\mathrm{softmax}(z)$, 论文式 (9) 给出

$$
\frac{\partial\,\log\pi_\theta(y_{i,t}\mid q,y_{i,<t})\,\hat{A}_{i,t}}{\partial z_v}=\begin{cases}\bigl(1-\pi_\theta(y_{i,t}\mid q,y_{i,<t})\bigr)\hat{A}_{i,t}, & v=y_{i,t}\\ -\pi_\theta(v\mid q,y_{i,<t})\,\hat{A}_{i,t}, & v\neq y_{i,t}\end{cases}
\tag{7}
$$

$\hat{A}>0$ 时, 采到的 token 的 logit 升高, 其余 logit 全部降低. $\hat{A}<0$ 时反过来, 采到的 token 被压低, 词表里大量没采到的 token 的 logit 被抬高. LLM 的词表常有几十万个 token, 某一状态下合适的动作却很少, 负梯度会扩散到许多不相干的 token 上. 论文认为这有一定正则作用, 同时带来不稳定, 在离策略的情形下更明显. 负样本对探索和防止过拟合仍然必要, 所以 SAPO 保留它们, 只让负侧的门更窄: 取 $\tau_{\mathrm{neg}}>\tau_{\mathrm{pos}}$, 负 token 的梯度离开 $r=1$ 后衰减得更快.

用式 (7) 算一个具体的例子. 设采到的 token 当前概率 $\pi(y)=0.6$, $\hat{A}=-1$. 它的 logit 梯度为 $(1-0.6)\times(-1)=-0.4$; 每个未采样 token $v$ 的梯度为 $+\pi(v)$, 加起来正好是 $+0.4$. 下降方向上, 采到的 token 被压低 $0.4$, 这 $0.4$ 按当前概率分给其余所有 token. 正优势时方向相反, 被抬高的只有采到的那一个, 目标明确; 负优势时被抬高的是一整片, 其中多数并不是合适的动作. 这就是式 (7) 所说的扩散.

![正优势与负优势两档温度](./images/fig-sapo-tau-pos-neg.png)

> 图 2: 比率 $r$ 先按 $\hat{A}$ 的符号分流. 正优势走 $\tau_{\mathrm{pos}}=1.0$, 衰减较慢; 负优势走 $\tau_{\mathrm{neg}}=1.05$, 衰减较快. 两路合成式 (5) 的带门梯度.

**图 2 解析**

- 顶部黄框是 $\mathrm{sign}(\hat{A})$, 只决定温度, 比率仍是同一个 $r$.
- 左右两组分别标出两档默认温度, 与论文 §5.1 一致.
- 底部汇合框对应式 (5) 的 $w\,r\,\nabla\log\pi\,\hat{A}$, 图中没有反馈环.

温度只按优势的符号分档, 与 token 本身的概率无关. 同为负优势, 当前概率很高的 token 和很低的 token 用同一个 $\tau_{\mathrm{neg}}$; 式 (7) 中扩散的总量 $(1-\pi(y))|\hat{A}|$ 在低概率 token 上更大, 但论文没有再按概率细分温度.

平滑门函数在传统 RL 里已有人用过, 论文引用的是 Chen 等 (AAAI 2023) 的 soft clipping. SAPO 新加的两件事是: 在组相对范式里用 token 级软信赖域, 并由此在小步时得到序列级的一致性; 以及按正负优势拆开温度. 后一件由式 (7) 推动, 词表越大, 负梯度扩散的面越宽.

## 3. 统一视角与序列级极限

### 3.1 三种算法只差一个门函数

论文 §4 把三者写进同一个代理目标: 在式 (3) 中把 $f_{i,t}$ 换成各算法自己的门函数. GRPO 取 $f=\min(r,1+\varepsilon)$ ($\hat{A}>0$) 或 $\max(r,1-\varepsilon)$ ($\hat{A}\le0$); GSPO 把 $r$ 换成 $s_{i,t}=\mathrm{sg}[s_i]\cdot\pi_\theta/\mathrm{sg}[\pi_\theta]$, 门在一条回答内对所有 token 相同; SAPO 用式 (4). 求导后梯度统一为

$$
\nabla_\theta\mathcal{J}(\theta)=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}f'_{i,t}\bigl(r_{i,t}(\theta)\bigr)\,r_{i,t}(\theta)\,\nabla_\theta\log\pi_\theta(y_{i,t}\mid q,y_{i,<t})\,\hat{A}_i\Biggr]
\tag{8}
$$

差别全在 $f'$ 上. GRPO 的 $f'$ 是指示函数 (论文式 (24)): $\hat{A}>0$ 且 $r\le1+\varepsilon$ 时为 1, $r>1+\varepsilon$ 时为 0; $\hat{A}\le0$ 时以 $1-\varepsilon$ 为界对称. 这把闸是单侧的, 正优势 token 的比率跌到 $1-\varepsilon$ 以下照样满权. SAPO 用恒等式 $\sigma(x)(1-\sigma(x))=\tfrac14\mathrm{sech}^2(x/2)$ 得到

$$
f'^{\,\mathrm{SAPO}}_{i,t}(r)=\mathrm{sech}^2\Bigl(\frac{\tau_i}{2}(r-1)\Bigr)
\tag{9}
$$

同一个 $r$, GRPO 给 0 或 1, SAPO 给 $(0,1]$ 之间的连续值. 论文的概括是: 几种算法的主要区别在于怎样处理 $r$ 偏离 1 的离策略 token.

把式 (8) 里的 $f'$ 按优势符号和比率方向拆成四种情形, 取 GRPO 的 $\varepsilon=0.2$, SAPO 的默认温度, 系数是按式 (6) 和论文式 (24) 手算的:

| 情形 | 含义 | GRPO 的 $f'$ | SAPO 的 $f'$ |
|---|---|---|---|
| $\hat{A}>0$, $r=1.5$ | 好 token 已被抬高 | 0 (出带) | 0.940 |
| $\hat{A}>0$, $r=0.5$ | 好 token 反被压低 | 1 | 0.940 |
| $\hat{A}\le0$, $r=1.5$ | 坏 token 反被抬高 | 1 | 0.934 |
| $\hat{A}\le0$, $r=0.5$ | 坏 token 已被压低 | 0 (出带) | 0.934 |

GRPO 的门只在「已经朝目标方向走过头」时关闭, 另两种情形无论偏多远都满权. SAPO 的门关于 $r=1$ 对称, 四种情形一律按离 1 的距离衰减. 这意味着第二, 三行那种需要纠正的方向, SAPO 也会减弱梯度; 偏离不大时减弱很少 (仍有 0.93 以上), 偏离很大时同样被压低. 论文没有单独讨论这一差别, 但它由两式直接推出: SAPO 处理的是「离 on-policy 多远」, 不区分偏离的方向.

第三行还有一个容易忽略的后果. GRPO 在 $\hat{A}<0$, $r>1$ 时 $f'=1$, 乘在 $\nabla\log\pi$ 前面的系数就是 $r$ 本身, 没有上界. GSPO 论文也指出, 加裁剪后 GRPO 中参与梯度的 token 权重在 $\hat{A}>0$ 时落在 $(0,1+\varepsilon]$, 在 $\hat{A}<0$ 时落在 $[1-\varepsilon,+\infty)$. 负优势一侧恰好是式 (7) 说的易扩散的那一侧. SAPO 在这里的系数是 $w\cdot r$, 默认 $\tau_{\mathrm{neg}}=1.05$ 时最大约 $1.54$, 上界由门本身给出.

GSPO 的门在一条回答内对所有 token 取同一个值, 靠的是式中的 stop-gradient 写法. $s_{i,t}=\mathrm{sg}[s_i]\cdot\pi_\theta(y_{i,t})/\mathrm{sg}[\pi_\theta(y_{i,t})]$ 的数值等于 $s_i$, 对 $\theta$ 的梯度等于 $s_i\nabla_\theta\log\pi_\theta(y_{i,t})$. 门的判决因此按整条回答做出, 梯度仍按 token 回传. 论文特别指出: GSPO 的 $f$ 在序列内与 token 无关, SAPO 和 GRPO 的 $f$ 都随 token 变化.

### 3.2 小步时平均门收成序列级门

论文 §4.1 证明, 满足两条假设时 SAPO 的平均行为接近一个连续版的 GSPO.

- (A1) 小步, 近 on-policy: $r_{i,t}\approx1$, 于是 $\log r_{i,t}\approx r_{i,t}-1$.
- (A2) 序列内分散度低: 记 $z_{i,t}=\log r_{i,t}$, $\mu_i=\frac{1}{|y_i|}\sum_t z_{i,t}=\log s_i$, 方差 $\mathrm{Var}_i=\frac{1}{|y_i|}\sum_t(z_{i,t}-\mu_i)^2$ 对多数序列很小.

A1 下式 (9) 近似为 $g_\tau(z)=\mathrm{sech}^2(\tau z/2)$. 把 $g_\tau$ 在 $\mu_i$ 处二阶展开, 对 token 取平均时一次项因 $\sum_t(z_{i,t}-\mu_i)=0$ 消失, 剩下二阶余项. 记 $\alpha=\tau/2$, 直接计算得 $g''_\tau(z)=\alpha^2(4\,\mathrm{sech}^2(\alpha z)-6\,\mathrm{sech}^4(\alpha z))$, 其绝对值上确界在 $z=0$ 处取到, 为 $2\alpha^2=\tau^2/2$. 于是

$$
D_i=\Bigl|\frac{1}{|y_i|}\sum_t g_{\tau_i}(z_{i,t})-g_{\tau_i}(\log s_i)\Bigr|\le\frac{\tau_i^2}{4}\,\mathrm{Var}_i
\tag{10}
$$

再用 A1 去掉式 (8) 中的 $r$, 平均门换成序列门, 梯度成为

$$
\nabla_\theta\mathcal{J}_{\mathrm{SAPO}}\approx\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}\mathrm{sech}^2\Bigl(\frac{\tau_i}{2}\log s_i\Bigr)\,\nabla_\theta\log s_i\,\hat{A}_i\Biggr]
\tag{11}
$$

式 (11) 与 GSPO 结构相同, 只是 GSPO 在 $s_i$ 出带时把整条回答的梯度关掉, 这里随 $s_i$ 偏离 1 连续变小. 论文称之为 sequence-coherent.

两条假设在真实训练里是否成立, 论文用统计看过. Figure 2 和 Figure 3 分别统计 MoE 模型 (Qwen3-30B-A3B 的冷启动 checkpoint) 和稠密模型 (Qwen3-4B 的冷启动 checkpoint), 样本取自离策略 mini-batch, 超过 $10^5$ 条序列, $10^9$ 个 token. 观察到 $r_{i,t}$ 高度集中在 1 附近, $\mathrm{Var}_i$ 通常低于 $0.02$; MoE 的分布更宽, 论文推测与专家路由带来的异构有关, 稠密模型更集中. 代入式 (10), $\tau=1$, $\mathrm{Var}_i=0.02$ 时 $D_i\le0.005$, 平均门与序列门之差不到千分之五. 方差 $0.02$ 对应的标准差约 $0.14$, 也就是同一条回答里 token 的对数比率大多落在均值上下 $0.14$ 以内, 换成比率约为 $e^{\pm0.14}$, 即 $0.87$ 到 $1.15$ 倍. 这些统计以直方图和散点图给出, 正文没有另列数值表.

### 3.3 假设不成立时

假设破的时候 SAPO 与 GSPO 的差别才显出来. 手算一条四个 token 的回答, $r=(1.02,1.01,0.99,2.5)$: 对数均值 $\mu\approx0.234$, $s\approx1.26$, $\mathrm{Var}\approx0.155$. GSPO 的右沿 $1+4\times10^{-4}$ 早已被越过, 正优势时四个 token 的梯度一起归零. SAPO 取 $\tau=1$, 前三个 token 的 $w$ 都在 $0.999$ 以上; 第四个 $p=\sigma(1.5)\approx0.82$, $w\approx0.60$. 三个近 on-policy 的 token 照常更新, 只有偏离的那个被压低. 这组数也能验证式 (10): 按 $g_\tau$ 算平均门约 $0.954$, 序列门 $g_\tau(\mu)\approx0.986$, 差 $0.032$, 界 $\mathrm{Var}/4\approx0.039$, 不等式成立, 但差已经不可忽略. 论文把这种行为叫做 token-adaptive: 同一条回答里, 少数离群 token 不会连累其余 token 的梯度.

GSPO 论文自己报告过, 它被裁掉的 token 比例比 GRPO 高约两个数量级, 训练效率却更好. 这说明整条丢弃的代价在 GSPO 的设置下可以接受. SAPO 的论点是这部分代价仍可以拿回来: 被丢的回答里多数 token 本来是近 on-policy 的, 用软门只压离群的少数, 就不必把它们一起舍掉.

所以「连续版 GSPO」只在 A1, A2 成立时成立. 两条假设不满足时, SAPO 就是逐 token 的软门.

### 3.4 和邻居的区别

**CISPO.** MiniMax-M1 (arXiv:2506.13585) 的 CISPO 裁剪重要性权重本身, 并对裁剪后的权重做 stop-gradient, 梯度只经过 $\log\pi_\theta$, 出带 token 的系数被冻在区间边界上 (见 [03 CISPO](../03-CISPO-裁剪重要性权重/03-CISPO-裁剪重要性权重.md)). SAPO 没有 stop-gradient, 门是 $r$ 的可微函数, 系数 $w\cdot r$ 随 $r$ 先升后降, 远处趋于 0. CISPO 对 $r$ 很大的 token 仍给满额的上界系数, SAPO 会把它压掉.

**GMPO.** [05 GMPO](../05-GMPO/05-GMPO.md) 把 token 级目标的算术平均换成几何平均, 裁剪仍作用于每个 token 的比率, 窗口为 $(e^{-0.4},e^{0.4})$. 它改的是聚合方式, SAPO 改的是出带之后的权重形状.

**GSPO.** 3.2 节的结论只说明小步时 SAPO 的平均行为像连续的 GSPO. 两者的超参不能互换: GSPO 的带宽在 $10^{-4}$ 量级, 作用在 $s_i$ 上; SAPO 的 $\tau$ 在 1 附近, 作用在 token 比率上.

| 算法 | 门作用的对象 | 比率偏离之后 |
|---|---|---|
| GRPO | 每个 $r_{i,t}$, 硬裁剪 | 该 token 梯度为 0 |
| GSPO | 序列 $s_i$, 硬裁剪 | 整条回答梯度为 0 |
| CISPO | 裁剪后的 IS 权重, stop-gradient | 系数固定在边界, 梯度仍经 $\log\pi$ |
| GMPO | 每个 token 比率裁剪后取几何平均 | 离群比率被窗口截断 |
| SAPO | 每个 $r_{i,t}$, sigmoid 软门 | 权重连续衰减, 负优势衰减更快 |

## 4. 实验

### 4.1 受控实验与温度消融

底座是 Qwen3-30B-A3B-Base 的冷启动模型, 在数学推理题上做 RL. 每批 rollout 切成 4 个 mini-batch 做梯度更新. SAPO 取 $\tau_{\mathrm{pos}}=1.0$, $\tau_{\mathrm{neg}}=1.05$; 对照是 GSPO 和 GRPO-R2 (GRPO 加 routing replay), 超参与 GSPO 论文一致. 验证集是 AIME25, HMMT25, BeyondAIME, 指标是 16 次采样的平均 Pass@1: 每道题采 16 个回答, 分别判对错, 取正确率的平均. 它衡量的仍是单次采样答对的概率, 多次采样只为降低评测方差, 与「16 次里至少对一次」的 Pass@16 是两回事. AIME 这类题集只有几十道题, 单次采样的估计波动很大, 所以要多采几次.

Figure 4 的结果: GSPO 和 GRPO-R2 都在训练早期崩溃, SAPO 训练动态稳定, 最终表现更高. SAPO 不依赖 routing replay 来稳定训练或取得好成绩, 论文认为这改善了探索, 也减少了 RL 系统的工程开销. 三个基准的终点数值只画在曲线上, 正文没有列表.

稳定性里有多少来自正负两档温度, 由 Figure 5 单独检验: 同一底座只改温度, 比较三档: $\tau_{\mathrm{neg}}=1.05>\tau_{\mathrm{pos}}=1.0$, $\tau_{\mathrm{neg}}=\tau_{\mathrm{pos}}=1.0$, $\tau_{\mathrm{neg}}=0.95<\tau_{\mathrm{pos}}=1.0$. 第一档最稳, 第三档最不稳. 论文据此认为负 token 的梯度对训练不稳定的贡献更大, 非对称温度能缓解这一点.

### 4.2 Qwen3-VL

SAPO 用于训练 Qwen3-VL 系列, 论文称在不同尺寸, MoE 和稠密架构上都带来提升. 训练数据混合文本和多模态任务, 包括数学, 代码和逻辑推理. 为支持多任务, 每个 batch 内各任务的采样比例固定; batch 较大, 每批 rollout 切成 2 个 mini-batch, 保证每个 mini-batch 对所有任务都有足够的学习信号. 对照实验从 Qwen3-VL-30B-A3B 的一个初步冷启动 checkpoint 出发, 比较 SAPO, GSPO, GRPO-R2, 验证四个基准: AIME25 (Pass@1, 32 次采样), LiveCodeBench v6 (Pass@1, 8 次采样), ZebraLogic, MathVision. Figure 6 显示在相同算力下 SAPO 持续提升并高于两条基线, 数值同样只在图上.

| 项 | 论文设定 |
|---|---|
| 受控底座 | Qwen3-30B-A3B-Base 冷启动, 数学推理 |
| 对照 | GSPO; GRPO-R2 (routing replay) |
| 温度 | $\tau_{\mathrm{pos}}=1.0$, $\tau_{\mathrm{neg}}=1.05$ |
| mini-batch 切分 | 受控 4 份; Qwen3-VL 2 份 |
| 受控验证 | AIME25 / HMMT25 / BeyondAIME, 16 次采样平均 Pass@1 |
| 假设统计 | $>10^5$ 序列, $10^9$ token, $\mathrm{Var}_i$ 通常 $<0.02$ |
| VL 验证 | AIME25 @32, LiveCodeBench v6 @8, ZebraLogic, MathVision |

## 5. 失效与边界

### 5.1 失效情形

论文在摘要后的引言里写明: 所有方法最终都可能出现不稳定的迹象, SAPO 能让有效学习持续更久, 在发散前达到更高的 Pass@1. 它延长的是稳定段, 没有给出不会崩溃的保证.

| 情形 | 表现 | 原因 | 处理 |
|---|---|---|---|
| 极端离策略 token | 系数很小但不为 0 | $w$ 处处大于 0 | 依赖 $w\cdot r$ 远处趋于 0; 离策略过重时减少 mini-batch 切分 |
| $\tau_{\mathrm{neg}}<\tau_{\mathrm{pos}}$ | 训练明显不稳 (Figure 5) | 负梯度的门更宽, 扩散到大量未采样 token | 保持 $\tau_{\mathrm{neg}}>\tau_{\mathrm{pos}}$ |
| 正负共用一个温度 | 能跑, 稳定性居中 | 失去非对称衰减 | 按优势符号选 $\tau$ |
| 组内奖励全同 | 优势为 0 或分母为 0 | 式 (1) 的组标准化未改 | 按 GRPO 系的办法处理, 见 [01 GRPO](../01-GRPO/01-GRPO.md) 与 [Dr. GRPO](../02-DrGRPO-去标准差/02-DrGRPO-去标准差.md) |
| MoE 上序列内分散度高 | 平均门偏离序列门, 3.2 节的近似变差 | 路由异构使 $\mathrm{Var}_i$ 分布更宽 (Figure 2) | 退回逐 token 软门的理解, 关注离群 token 的占比 |
| 把 GSPO 带宽填进 $\tau$ | 门极宽或极窄, 行为失常 | 两者作用对象和量级不同 | $\tau$ 取 1 附近 |

### 5.2 实验没覆盖的条件与选择

表里的情形都有论文的实验或推导支撑, 另有几处条件实验没有覆盖. 第一, 论文的 $\tau$ 只在 0.95 到 1.05 之间做了消融, 更大或更小的温度没有实验. 从式 (6) 看, $\tau$ 很小时门几乎不衰减, 接近未裁剪的 $r\hat{A}$; $\tau$ 很大时门缩成 $r=1$ 附近的尖峰. 第二, 实验里优势在整条回答内共用, 属于结果监督; 换成过程奖励时, 变化发生在 $\hat{A}_{i,t}$ 上, 门仍只看 $r_{i,t}$, 信用分配不归 SAPO 管. 第三, SAPO 在 MoE 上去掉了 routing replay, 但专家负载均衡和路由塌缩等问题仍在 MoE 训练本身, 论文没有讨论. 第四, 受控实验的对比只有 GSPO 和 GRPO-R2 两条基线, 没有与 CISPO, DAPO 这类同样改裁剪方式的方法直接比较; 评测数值也只以曲线给出, 要判断提升幅度只能看图.

选择上可以按问题来源判断. 日志里大量 token 因出带失去梯度, 又不想改优势或采样: SAPO 只换门函数, 改动最小. MoE 上比率波动大, 想彻底避开 token 级比率: 看 [04 GSPO](../04-GSPO/04-GSPO.md). 想保住出带 token 的梯度, 同时让系数有明确上界并冻结权重: 看 [03 CISPO](../03-CISPO-裁剪重要性权重/03-CISPO-裁剪重要性权重.md). 需要价值网络和 GAE: 回到 [04 PPO](../../4.4-强化学习基础/04-PPO/04-PPO.md).

## 参考文献

1. Gao, C., Zheng, C., Chen, X.-H., Dang, K., Liu, S., Yu, B., Yang, A., Bai, S., Zhou, J., & Lin, J. (2025). *Soft Adaptive Policy Optimization*. arXiv:2511.20347. https://arxiv.org/abs/2511.20347
2. Zheng, C., Liu, S., Li, M., Chen, X.-H., Yu, B., Gao, C., Dang, K., Liu, Y., Men, R., Yang, A., et al. (2025). *Group Sequence Policy Optimization*. arXiv:2507.18071. https://arxiv.org/abs/2507.18071
3. Shao, Z., et al. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300. https://arxiv.org/abs/2402.03300
4. MiniMax. (2025). *MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention*. arXiv:2506.13585. https://arxiv.org/abs/2506.13585
5. Zhao, Y., et al. (2025). *Geometric-Mean Policy Optimization*. arXiv:2507.20673. https://arxiv.org/abs/2507.20673
6. Chen, X., Diao, D., Chen, H., Yao, H., Piao, H., Sun, Z., Yang, Z., Goebel, R., Jiang, B., & Chang, Y. (2023). *The Sufficiency of Off-Policyness and Soft Clipping: PPO Is Still Insufficient According to an Off-Policy Measure*. AAAI 2023.
