---
title: "03 · GSPO：序列级重要性采样"
date: 2026-08-31
as_of: 2026-08-31
tags: [GSPO, GRPO, PPO, RLHF, 序列级重要性采样, Qwen]
---

# 03 GSPO：序列级重要性采样

GSPO（Group Sequence Policy Optimization）把重要性采样从 token 提到整条回答。序列级比率是长度归一化的几何平均，clip 作用在这一个 $s_i$ 上，不是每个 $\eta_{i,t}$。一手是 Qwen 的 [arXiv:2507.18071](https://arxiv.org/abs/2507.18071)，2025 年 7 月。组内优势仍用奖励的 $z$-score，这一侧和 [02-GRPO](../02-GRPO/02-GRPO.md) 相同；GSPO 改的是 IS 粒度。**不是** GMPO（几何平均压离群 token 比率，专文在 [01-GMPO](../01-GMPO/01-GMPO.md)）。**不是** 把 GRPO 的组内标准化再改一版。邻居：[04-PPO](../04-PPO/04-PPO.md) 讲 Critic 和 GAE；家族对照在 [4.4.5](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md)。

## 1. 奖励打在整段，权重却按 token 算

PPO 和 GRPO 的代理目标都按 token 写。旧策略 $\pi_{\theta_{\mathrm{old}}}$ 采出 $y$，当前策略 $\pi_\theta$ 再算一遍每个位置的比率

$$
\eta_{i,t}=w_{i,t}(\theta)=\frac{\pi_\theta(y_{i,t}\mid x,y_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid x,y_{i,<t})} \tag{1}
$$

然后对每个 $t$ 做 $\min(\eta_{i,t}\hat{A}_{i,t},\,\mathrm{clip}(\eta_{i,t},1-\varepsilon,1+\varepsilon)\hat{A}_{i,t})$。奖励 $r(x,y)$ 却几乎总是整段一个数：规则对错、奖励模型通读全文、竞赛题的 Pass。信用分配和 off-policy 校正停在两层。

大模型 RL 还会把一大批 rollout 切成多个 mini-batch 做梯度。论文实验里一批切四份。切完之后，$y$ 来自 $\pi_{\theta_{\mathrm{old}}}$，正在更新的是 $\pi_\theta$，天然 off-policy。clip 本来是挡「太旧的样本」。Qwen 的判断是：挡的位置放错了。

重要性采样的本义是：目标分布下的期望，用行为分布的样本乘权重 $\pi_{\mathrm{tar}}(z)/\pi_{\mathrm{beh}}(z)$ 来估，且要在行为分布上对**多个**样本平均，$N\gg 1$ 权重才校正得动。GRPO 把式 (1) 套在每一个 $t$ 上。每个位置只抽到一个 $y_{i,t}$，这个权重起不到分布校正的作用，只是往梯度里塞高方差噪声。序列一长，噪声叠加；clip 再按 token 锁死，噪声被放大。论文写过，这种崩溃往往不可逆：回到旧 checkpoint、改 clip、加长生成、换题集，都不一定救得回来。

把噪声写成一个位置就够看清。设 $\hat{A}_i=+1$，某步 $\eta_{i,t}=1.8$，GRPO 的 $\varepsilon=0.2$，clip 上沿是 $1.2$。这一项的代理目标锁在 $1.2$，再抬这个 token 的概率不再加分；旁边一个 $\eta=0.95$ 的位置仍按 $0.95$ 加权。同一条「答对了」的轨迹里，梯度系数已经按位置拆开。奖励并没有按位置给。长 CoT 里这种拆开会密到每一步都在抖。

问题不在组内 $z$-score。GRPO 已经用同题 $G$ 条的相对分数代替了 $V_\psi$。GSPO 保留这条，只把「权重停在哪一层」改掉。奖励是序列级，off-policy 校正也应该是序列级。PPO 当年按 token 写，是因为对话短、还有 $V_\psi$ 给每个前缀估优势。LLM 推理把回答拉到几百上千 token，还把 $V$ 拿掉，token 级 IS 就没有那个借口了。

![GRPO 逐 token IS 与 GSPO 序列几何平均](./images/fig-gspo-seq-vs-token-is.png)

> 图 1：上栏 GRPO 把 $y$ 拆成 $\eta_1,\ldots,\eta_T$，每个 token 自己 clip，再进损失。下栏 GSPO 先合成一个 $s_i$（几何平均），clip 只作用在 $s_i$ 上。

**图 1 解析**

- 两栏都从左到右，起点都是绿框 `sequence $y$`。
- 上栏：四个黄框 $\eta_t$ 是 token 级比率。橙框写 `clip per token`。底注：奖励是序列级，权重是 token 级。
- 下栏：蓝框 `$s_i$ geometric mean` 是一个数。橙框写 `clip on $s_i$`。底注：整段共用一个权重。
- 读图时不要把黄框当成 MoE 专家。那只是同一条回答里的 token。

## 2. $s_i$ 是几何平均，不是算术平均

一条回答的似然是 token 条件概率的连乘：

$$
\pi_\theta(y\mid x)=\prod_{t=1}^{|y|}\pi_\theta(y_t\mid x,y_{<t}) \tag{2}
$$

序列级重要性权重的朴素写法是 $\pi_\theta(y\mid x)/\pi_{\theta_{\mathrm{old}}}(y\mid x)$。连乘对长度极敏感：同样「每个 token 略偏一点」，短句和长 CoT 的比值会差几个数量级，clip 区间没法共用。GSPO 在指数上除以长度，把这个比值拉回同一尺度：

$$
s_i(\theta)=\Bigl(\frac{\pi_\theta(y_i\mid x)}{\pi_{\theta_{\mathrm{old}}}(y_i\mid x)}\Bigr)^{1/|y_i|}
=\exp\Bigl(\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\log\eta_{i,t}\Bigr) \tag{3}
$$

式 (3) 右边是 $\log\eta_{i,t}$ 的均值再 $\exp$。这是 $\eta_{i,1},\ldots,\eta_{i,|y_i|}$ 的**几何平均**。不是 $\frac{1}{|y_i|}\sum_t\eta_{i,t}$。算术平均会让个别爆炸的 $\eta$ 把整段拉歪；几何平均在对数域平均，单个 token 的尖峰被压扁。序列似然比这个写法，论文指回 Zheng et al. 2023 的 Click（用序列似然做对比学习），不是 2025 年才发明的记号。

取三个位置 $\eta=(1.2,\,0.9,\,1.1)$，只为把两种平均看清，不是论文表。乘积 $1.2\times 0.9\times 1.1=1.188$。几何平均 $1.188^{1/3}\approx 1.059$。算术平均 $(1.2+0.9+1.1)/3\approx 1.067$。差得不大。换成三百个 token、每个 $\eta$ 仍在 $1.059$ 附近：不除长度的序列比大约是 $1.059^{300}\approx 3\times 10^{7}$；式 (3) 仍停在 $1.059$。clip 区间可以按「靠近 1 多少」来设，不必按长度分档。

没有长度归一化时，几个 token 的似然一跳，$s$ 就会炸；不同长度还要不同的 clip 宽。论文把长度归一化写成减方差、统一数值范围，不是装饰。

再看一个离群值。四个位置 $\eta=(1.05,\,1.04,\,1.03,\,8.0)$。算术平均 $(1.05+1.04+1.03+8)/4=2.78$，整段会被当成「离旧策略很远」。几何平均 $\exp(\mathrm{mean}\log\eta)\approx 1.73$，尖峰还在，但已经被对数域摊掉一截。GSPO 用的是后者。GMPO 也谈几何平均，但它压的是 token 级离群比率，目标仍按 token 写；本篇只认「改 IS 粒度」这一处。两篇不要并成一个算法。

实现时 $s_i$ 必须从 `mean(log_ratio)` 再 `exp`，不要先 `exp` 再对 $\eta$ 求均值。顺序反了就是算术平均，式 (3) 对不上，后面那套 $3\times 10^{-4}$ 的 clip 宽也会失去意义。

## 3. 目标、clip、梯度：对照 GRPO

组内优势沿用 GRPO。同一道 $x$ 采 $G$ 条，$r\in[0,1]$（验证器），

$$
\hat{A}_i=\frac{r(x,y_i)-\mathrm{mean}(\{r(x,y_j)\}_{j=1}^{G})}{\mathrm{std}(\{r(x,y_j)\}_{j=1}^{G})} \tag{4}
$$

一条里的 token 共用 $\hat{A}_i$。GSPO 没有改这个 $z$-score。改的是代理目标里乘的那个权重，以及 clip 作用在谁身上：

$$
\mathcal{J}_{\mathrm{GSPO}}(\theta)
=\mathbb{E}_{x\sim\mathcal{D},\,\{y_i\}\sim\pi_{\theta_{\mathrm{old}}}}
\Biggl[
\frac{1}{G}\sum_{i=1}^{G}
\min\bigl(s_i(\theta)\hat{A}_i,\;
\mathrm{clip}(s_i(\theta),1-\varepsilon,1+\varepsilon)\hat{A}_i\bigr)
\Biggr] \tag{5}
$$

没有对 $t$ 的内层求和。一条回答进不进梯度，由 $s_i$ 是否落在 $[1-\varepsilon,1+\varepsilon]$ 决定。整段留下，所有 token 共享同一个 $s_i$；整段丢掉，这条一个 token 都不更新。论文省略 KL，说不是本文重点。对照实现时不要默认 $\beta=0.04$ 已经写进 GSPO。

GRPO 的目标仍是论文式 (2) 那种「组平均 × 长度平均 × 逐 token clip」：

$$
\mathcal{J}_{\mathrm{GRPO}}(\theta)
=\mathbb{E}
\Biggl[
\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}
\min\bigl(\eta_{i,t}\hat{A}_{i,t},\;
\mathrm{clip}(\eta_{i,t},1-\varepsilon,1+\varepsilon)\hat{A}_{i,t}\bigr)
\Biggr] \tag{6}
$$

两边都有 clip，锁的对象不同。GRPO 一个 token 出圈，只锁那个位置。GSPO 一个 $s_i$ 出圈，整条 $y_i$ 出局。

![clip 作用在序列级 $s_i$ 上](./images/fig-gspo-clip-on-si.png)

> 图 2：从左到右先算几何平均 $s_i$，再对 $s_i$ 做一次 clip。落在带内则整段保留、token 共用 $s_i$；出带则整段丢弃。底栏对照 GRPO：GRPO 是每个 $\eta_t$ 各 clip 一次。

**图 2 解析**

- 绿框 `response $y_i$` 是整条回答，不是单个 token。
- 蓝框写出 $s_i=\exp(\mathrm{mean}\log\eta)$，并标明不是算术平均。
- 橙框 `clip on $s_i$` 是唯一的裁剪点。
- 上岔实线进绿框 `inside band`：整段留下。再进红框代理损失 $\min(s_i\hat{A}_i,\mathrm{clip}(s_i)\hat{A}_i)$。
- 下岔虚线进紫框 `outside band`：整段丢，没有箭头再接到损失。虚线是「排除」，不是第二条数据流。

省略 clip 时，两种梯度差在重要性权重停在哪一层。现稿里这组对照是对的，写进主叙述。

GRPO 把 token 级比率留在对 $t$ 的求和里面。单个 $\eta_{i,t}$ 一跳，那一项的梯度就跟着跳：

$$
\nabla_\theta\mathcal{J}_{\mathrm{GRPO}}
\;\propto\;
\frac{1}{G}\sum_{i=1}^{G}\hat{A}_i\cdot\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}
\eta_{i,t}\,\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t}) \tag{7}
$$

GSPO 先把 $s_i$ 提出求和号。$s_i$ 对整段是一个数，再乘上平均后的 $\nabla\log\pi$：

$$
\nabla_\theta\mathcal{J}_{\mathrm{GSPO}}
\;\propto\;
\frac{1}{G}\sum_{i=1}^{G}
\hat{A}_i\,s_i(\theta)\cdot
\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}
\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t}) \tag{8}
$$

式 (8) 里每个 token 的对数似然梯度被同一条 $s_i$ 均权。论文的原话：差别在于「怎么给 token 的 $\nabla\log\pi$ 加权」。GRPO 的 $\eta_{i,t}$ 在 $\hat{A}_i>0$ 时落在 $(0,1+\varepsilon]$，在 $\hat{A}_i<0$ 时落在 $[1-\varepsilon,+\infty)$，这些不等权不可忽略，会随训练累积。GSPO 把一条里的 token 当成同样重。

$s_i(\theta)=\exp\bigl(\frac{1}{|y_i|}\sum_t\log\eta_{i,t}\bigr)$，再写一遍：几何平均，不是 $\frac{1}{|y_i|}\sum_t\eta_{i,t}$。

用式 (3) 的尺度走一遍 clip。设 $s_i=1.0005$，GSPO 右沿 $1+4\times 10^{-4}=1.0004$，已经出带，整段 $\hat{A}_i$ 不再进梯度。设 $s_i=1.0002$，落在带内，式 (5) 的未裁剪支和裁剪支在这个点几乎重合，整段 token 都按约 $1.0002$ 加权。换 GRPO：$1.0005$ 对 $\varepsilon=0.2$ 根本碰不到 clip，每个 $\eta_{i,t}$ 各自乘 $\hat{A}_i$。同一条轨迹，两种算法决定「要不要更新」的粒度差了一层。

clip 宽度也不是同一数量级。论文 §5.1：GSPO 左右 clip 取 $3\times 10^{-4}$ 和 $4\times 10^{-4}$，对应式 (5) 的区间大约 $[1-3\times 10^{-4},\,1+4\times 10^{-4}]$；GRPO 取 $0.2$ 和 $0.27$，对应 $[0.8,\,1.27]$。几何平均把 $s_i$ 钉在 $1$ 附近，带宽必须窄。把 GRPO 的 $0.2$ 抄到 GSPO 上，clip 几乎不触发；把 $3\times 10^{-4}$ 抄到 GRPO 上，几乎每条都锁死。论文自己写：两种算法的 clip 范围因比率定义不同，通常差一个数量级。

## 4. GSPO-token：数值仍是 $s_i$，优势可以按 token 改

多轮对话、逐步奖励，有时希望 $\hat{A}_{i,t}$ 随 $t$ 变。GSPO-token 不把 $s_i$ 拆回 token 级比率，只把 $s_i$ 的**数值**广播到每个位置，梯度用 stop-gradient 挡回去：

$$
s_{i,t}(\theta)=\mathrm{sg}[s_i(\theta)]\cdot\frac{\pi_\theta(y_{i,t}\mid x,y_{i,<t})}{\mathrm{sg}[\pi_\theta(y_{i,t}\mid x,y_{i,<t})]} \tag{9}
$$

$\mathrm{sg}[\cdot]$ 对应 PyTorch 的 `detach`。后一项数值恒为 $1$，所以 $s_{i,t}$ 和 $s_i$ **数值相等**。clip 仍然看这个数，不是看 $\eta_{i,t}$。目标写成对 $t$ 平均：

$$
\mathcal{J}_{\mathrm{GSPO\text{-}token}}(\theta)
=\mathbb{E}
\Biggl[
\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}
\min\bigl(s_{i,t}(\theta)\hat{A}_{i,t},\;
\mathrm{clip}(s_{i,t}(\theta),1-\varepsilon,1+\varepsilon)\hat{A}_{i,t}\bigr)
\Biggr] \tag{10}
$$

省略 clip 后的梯度：

$$
\nabla_\theta\mathcal{J}_{\mathrm{GSPO\text{-}token}}
\;\propto\;
\frac{1}{G}\sum_{i=1}^{G}s_i(\theta)\cdot\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}
\hat{A}_{i,t}\,\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t}) \tag{11}
$$

当 $\hat{A}_{i,t}=\hat{A}_i$ 时，式 (5) 与式 (10)、式 (8) 与式 (11) 在目标、clip 条件、理论梯度上相同。需要逐步奖励时，只改 $\hat{A}_{i,t}$，不要把 $s_{i,t}$ 换成 $\eta_{i,t}$。换成 $\eta$ 就退回 GRPO。

过程监督那套「后面步骤的归一化奖励往前累加」可以接到 $\hat{A}_{i,t}$ 上，公式在 GRPO 专文式 (6)。GSPO-token 只保证权重仍是序列级 $s_i$；步骤边界怎么切、PRM 标错会不会沿步往后传，那些问题原样在。多轮对话里更常见的是：某一轮该奖、某一轮该罚，整段一个 $\hat{A}_i$ 不够用，于是才需要式 (9)。clip 判决仍然是「这条轨迹作为整体离旧策略有多远」，不会因为某一步的 $\hat{A}$ 变号就对那个 token 单独改带宽。

一段可对照的写法。`log_prob`、`old_log_prob` 形状 $[B,T]$，mask 同形。

```python
seq_len = response_mask.sum(dim=-1).clamp(min=1)
log_s = ((log_prob - old_log_prob) * response_mask).sum(dim=-1) / seq_len
s = torch.exp(log_s)  # [B]，几何平均
adv_seq = (advantages * response_mask).sum(dim=-1) / seq_len
unclipped = s * adv_seq
clipped = torch.clamp(s, 1 - eps_low, 1 + eps_high) * adv_seq
policy_loss = -torch.minimum(unclipped, clipped).mean()
```

`eps_low=3e-4`、`eps_high=4e-4` 是论文 GSPO 实验值，不要默写成 $0.2$。GSPO-token 若要反传到各个 token，把 `s.detach()` 乘回 `log_prob - log_prob.detach()`，让数值走序列级、梯度落到 token。完整组 $z$-score 见 [02-GRPO](../02-GRPO/02-GRPO.md) §3.3。

| 项 | GRPO | GSPO | GSPO-token |
|----|------|------|------------|
| 权重 | $\eta_{i,t}$，形状 $[B,T]$ | $s_i$，形状 $[B]$ | 数值等于 $s_i$，按 $t$ 广播 |
| clip | 每个 token | 整段 $s_i$ | 仍看 $s_i$ 的数值 |
| 优势 | 结果监督下整段同一 $\hat{A}_i$ | 同左 | 允许 $\hat{A}_{i,t}$ 不同 |
| 和奖励粒度 | 奖励序列级，权重 token 级 | 同级 | 权重仍序列级 |

## 5. MoE 路由一跳，token 比率先坏

稠密模型上，token 级噪声已经够烦。MoE 再加一层：同一次 rollout、同一条 $y$，梯度更新之后激活的专家会变。论文给的数：48 层 Qwen3-30B-A3B-Base，每次 RL 更新后，同一条样本上大约 **10%** 的专家与 $\pi_{\theta_{\mathrm{old}}}$ 不同。更深的 MoE 更明显。式 (1) 的 $\eta_{i,t}$ 比较的是两套可能已经不是同一子网络的条件概率，波动被再放大一档。§3 说的「token 级 IS 无效」在这里变成训练直接不收敛。

Qwen 先前的补丁叫 Routing Replay：缓存 $\pi_{\theta_{\mathrm{old}}}$ 激活的专家，算 $w_{i,t}$ 时在 $\pi_\theta$ 上重放同一套路由。新旧策略对每个 token 走同一激活网络，token 比率才重新有定义。论文 Figure 3 画的是 GRPO 有无 Replay：没有 Replay，训练奖励掉下去。Replay 有代价：多占显存和通信，并且把 MoE 的容量钉在旧路由上。

GSPO 不算每个 token 的 $\eta_{i,t}$ 当权重，只看 $\pi_\theta(y_i\mid x)$。论文的写法：模型只要还保有语言建模能力，序列似然不会像单个 token 那样剧抖，因此可以按常规算 $s_i$，不必 Replay，也能收敛。Figure 1 的 GSPO 曲线就是在没有 Routing Replay 的设定下画的。这不是「序列级对路由不敏感」的口号，而是：单个专家换了，$t$ 上的 $\eta$ 可以跳；连乘再开 $|y|$ 次方之后，$s_i$ 仍在 $1$ 附近的窄带里。

10% 这个数不要读成「每层换十分之一专家」。论文写的是：48 层、同一样本、一次梯度之后，新旧策略激活集合的差异大约一成。某一层可能几乎没动，另一层可能换得更多。token 级比率对「这一步走了哪几个专家」敏感；序列似然对「整段还像不像同一条中文/代码」敏感。Replay 强行对齐前者，GSPO 选择相信后者够稳，用来做 clip 判决。代价是：若某次更新把整段似然也推飞，$s_i$ 会整段出带，这条样本从梯度里消失，而不是只修几个 token。

基础设施还有一句。训练引擎（Megatron）和推理引擎（SGLang、vLLM）的似然对不齐时，旧做法是用训练引擎把 $\pi_{\theta_{\mathrm{old}}}$ 的 token 似然重算一遍。GSPO 只用序列级似然，对精度差更宽容。论文认为可以直接吃推理引擎返回的序列似然，省掉重算。对 partial rollout、多轮 RL、训推分离更有用。这是「有可能简化」，正文没有给省了多少百分比。

## 6. 论文实际写了哪些数

实验主体是从 Qwen3-30B-A3B-Base 冷启动微调的策略。报告训练奖励曲线，以及三条下游曲线：AIME'24（32 次采样的平均 Pass@1）、LiveCodeBench 202410–202502（8 次采样的平均 Pass@1）、CodeForces（Elo）。正文**没有**把这三条的终点写成表格数字。曲线在 Figure 1。本篇不从曲线上估坐标。

写进正文、能对账的只有这些：

| 项 | 论文写法 |
|----|----------|
| 算法全称 | Group Sequence Policy Optimization |
| 投稿 | arXiv:2507.18071，2025-07 |
| 起点模型 | Qwen3-30B-A3B-Base 冷启动 |
| rollout 切分 | 一批切 **4** 个 mini-batch |
| GSPO clip | 左 $3\times 10^{-4}$，右 $4\times 10^{-4}$ |
| GRPO clip | 左 $0.2$，右 $0.27$（论文写经过仔细调） |
| MoE 专家漂移 | 48 层、同一样本、每次更新约 **10%** 专家不同 |
| 被 clip 的 token 比例 | GSPO 比 GRPO 高约 **两个数量级**（Figure 2；改 clip 宽不改变数量级差距） |
| GRPO + MoE | 需要 Routing Replay 才能正常收敛 |
| GSPO + MoE | 不需要 Replay |
| 下游用法 | 已用到当时最新的 Qwen3；博文点名 Instruct / Coder / Thinking |

Figure 2 的观察需要单独说。GSPO 按整段丢样本，被 clip 掉的 token 比例比 GRPO 高两个数量级，用来估梯度的 token 反而更少，训练效率仍高于 GRPO。论文把这读成：GRPO 的 token 级梯度本身噪、样本利用差；序列级信号更干净。不要把「clip 掉更多所以更好」推广成调参口诀。带宽是按 $s_i$ 的尺度定的，不是越大越好。

同等计算和同等题量下，论文写 GSPO 的训练准确率和基准曲线高于仔细调过的 GRPO。加计算、定期换题集、加长生成，GSPO 还能继续涨。这些句子都挂在 Figure 1 上，没有表内百分数可抄。AIME 的 32 次平均、LiveCodeBench 的 8 次平均，是评测解码设定，不要和训练时每题采样的组大小 $G$ 混成一个数。正文也没写 $G$ 取多少；组相对优势的机制仍按式 (4)，具体组宽以训练配置为准。

博文把卖点收成三条：训练效率、MoE 上稳定、对精度差更宽容。机制上分别对应 Figure 1 的对照、去掉 Routing Replay、序列似然少一次训练引擎重算。三条都没有另给一张数字表。引用时写「论文 Figure / 正文超参」，不要写成「AIME 提高了若干个百分点」。

## 7. 失效和边界

GSPO 不是万能的。序列级均权把中间写错、最后凑对的 CoT 整段抬上去，也把最后抄错答案的整段压下去。信用分配比过程监督的 GRPO 更粗。逐步奖励要走 GSPO-token 换 $\hat{A}_{i,t}$，clip 仍看 $s_i$。奖励若真是逐步、且各步独立，序列级 $s_i$ 会把不该捆在一起的步捆死。

组内 $z$-score 的旧病还在。长度分母、全对全错时 $\mathrm{std}\to 0$，这些是 [02-GRPO](../02-GRPO/02-GRPO.md) §6 的事。GSPO 没改式 (4)，Dr. GRPO / DAPO 冲的是另一侧。不要指望换了 IS 粒度，难度偏差就消失。

clip 带宽极窄。$3\times 10^{-4}$ 量级意味着 $s_i$ 稍离 $1$ 整段就丢。题难、策略更新猛、组内方差大时，留下的样本可能很少。论文 Figure 2 认为少而干净优于多而噪；实现里若收敛不动，先核对比率是不是几何平均、clip 是不是套在 $s_i$ 上，再考虑动带宽。不要先把 $\varepsilon$ 改回 $0.2$。

Routing Replay 从 GSPO 路径上拿掉，不等于 MoE RL 没有别的坑。负载不均、专家塌缩、容量和通信，还在第 2 章 MoE 那些专文里。GSPO 只说：不必为了让 token 级 $\eta$ 有定义，去冻结旧路由。

崩溃一旦发生，论文对 GRPO 的经验是不可逆。GSPO 把这条路径堵在 IS 粒度上，没有承诺「换了 GSPO 就不会崩」。奖励黑客、验证器噪声、题集泄漏，都不在 2507.18071 的修复范围。

还有两件实现上的错位。训练引擎重算了 token 似然、推理引擎另给一套，若仍按 token 做 $\eta_{i,t}$，精度差会进每个位置；GSPO 把差吃进 $s_i$ 的几何平均里，通常更耐看，但若两套引擎对 EOS 或 ignore_index 的 mask 不一致，长度 $|y_i|$ 都会错，式 (3) 的分母先坏。另一件：$s_i$ 用 `float16` 在长序列上累加 `log_ratio` 可能下溢，累加应走 `float32`，最后再 `exp`。这些不是论文表格，是式 (3) 在代码里会踩的坑。

怎么选。可验证奖励、组内可比较、愿意用采样宽度换 Critic：先看 GRPO。MoE 上 token 级 IS 方差炸掉、或者训推似然对不齐想少一次重算：换 GSPO。要逐步优势：GSPO-token，不要退回 $\eta_{i,t}$。离线偏好对：DPO，本篇不展开。几何平均若指的是压 token 离群值而不是改 IS 粒度：那是 GMPO，不是本篇。组太小（$G=2$）时式 (4) 的均值仍会晃，这和换不换 $s_i$ 无关。$G=1$ 时组内没有对照，算法退回不带 baseline 的 REINFORCE，方差会回去。这是组相对的旧边界，不是 GSPO 新引入的限制。

## 8. 收束

GSPO 留下 GRPO 的组内相对优势，把重要性权重改成式 (3) 的几何平均 $s_i$，clip 从每个 $\eta_{i,t}$ 挪到 $s_i$。梯度上，一条回答里的 token 均权。Qwen 用 Qwen3-30B-A3B-Base 冷启动做了对照：clip 宽 $3\mathrm{e}{-4}/4\mathrm{e}{-4}$，一批切四份，MoE 上不再靠 Routing Replay。正文能钉住的是机制和这些超参，不是 Figure 1 曲线上的百分数。没有两全其美：序列级干净，信用分配就粗；clip 掉两个数量级的 token，留下的样本更少。下一篇要看 Critic 和 GAE 进 [04-PPO](../04-PPO/04-PPO.md)；要看家族对照进 [4.4.5](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md)。

## 参考文献

1. Zheng, C., Liu, S., Li, M., Chen, X.-H., Yu, B., Gao, C., Dang, K., Liu, Y., Men, R., Yang, A., Zhou, J., & Lin, J. (2025). *Group Sequence Policy Optimization*. arXiv:2507.18071. https://arxiv.org/abs/2507.18071
2. Qwen Team. (2025). *GSPO: Towards Scalable Reinforcement Learning for Language Models*. https://qwenlm.github.io/blog/gspo/
3. Shao, Z., et al. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300. https://arxiv.org/abs/2402.03300
4. Schulman, J., et al. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347.
5. Zheng, C., Ke, P., Zhang, Z., & Huang, M. (2023). *CLICK: Controllable Text Generation with Sequence Likelihood Contrastive Learning*. Findings of ACL 2023. https://aclanthology.org/2023.findings-acl.65/
6. Team Qwen. (2025). *Qwen3 Technical Report*. arXiv:2505.09388.
