---
title: "01 · GMPO：几何平均策略优化"
date: 2026-08-31
as_of: 2026-08-31
tags: [GMPO, GRPO, GSPO, RLHF, 几何平均]
---

# 01 GMPO：几何平均策略优化

GMPO（Geometric-Mean Policy Optimization）是 GRPO 的稳定化改法：同一条回答里，把 token 级重要性加权奖励的算术平均换成几何平均。Zhao et al. 写在 [2507.20673](https://arxiv.org/abs/2507.20673)，代码在 [callsys/GMPO](https://github.com/callsys/GMPO)。卡住的是 $\rho_t$ 离群把梯度拽歪，clip 窗又不敢开大。组内优势沿用 GRPO 的 $z$-score，公式在 [02-GRPO](../02-GRPO/02-GRPO.md)，本篇不重推 DeepSeekMath。邻居 [03-GSPO](../03-GSPO/03-GSPO.md) 也出现几何平均，那是序列级重要性比率 $s_i$ 再对 $s_i$ clip。**GSPO 不是 GMPO。**

## 1. 算术平均把离群比率放大

GRPO 已经把 Critic 换成同题 $G$ 条的相对分数。对每个问题 $q$，从旧策略 $\pi_{\theta_{\mathrm{old}}}$ 采 $\{o_1,\ldots,o_G\}$，奖励给出 $\{r_1,\ldots,r_G\}$。优势仍是组内标准化：

$$
\hat{A}_i=\frac{r_i-\mathrm{mean}(\{r_1,\ldots,r_G\})}{\mathrm{std}(\{r_1,\ldots,r_G\})} \tag{1}
$$

这就是 DeepSeekMath 的式，GMPO 原文 §2.2 原样写下。过程监督、迭代 RL、$G=64$ 那些设定都在 02，这里只把它当已知量。

重要性比率还是 token 级：

$$
\rho_{i,t}(\theta)=\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q,o_{i,<t})} \tag{2}
$$

去掉 clip 和 KL 之后，GRPO 目标就是 token 级加权奖励的算术平均（论文式 (2)）：

$$
\mathcal{J}^{*}_{\mathrm{GRPO}}(\pi_\theta)
=\mathbb{E}\left[
\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}
\rho_{i,t}(\theta)\,\hat{A}_i
\right] \tag{3}
$$

$\rho_{i,t}\hat{A}_i$ 被论文叫 token-level reward。算术平均对离群值敏感。某个 token 的 $\rho$ 冲到 8 或 0.05，整段目标跟着跳。重要性采样本来是为了「用旧策略采的样本，假装在当前策略下更新」。$\rho$ 离 1 太远，说明这两步策略已经不像同一条分布，这一项的无偏修正本身就不可信。PPO 用 clip 把不可信的步子砍掉。砍得太狠，策略动不了；砍得太松，离群 $\rho$ 继续主导算术平均。

论文 Figure 1 右侧把训练过程中 $\rho_t$ 的最大最小值画出来：GRPO 的区间一路变宽。为了压住它，实现里只好把 clip 窗收在 $(0.8,1.2)$ 附近。DAPO 后来说，窗太窄会早早把策略推成确定分布，探索没了。GMPO 想同时做两件事：目标对离群 $\rho\hat{A}$ 不那么过敏，于是窗可以开到 $e^{\pm 0.4}$，熵掉得慢一点。这是同一条设计，不是两个独立彩蛋。

GMPO 正文按 Dr. GRPO 的做法，把 $\mathrm{D}_{\mathrm{KL}}(\pi_\theta\Vert\pi_{\mathrm{ref}})$ 拿掉，省一份参考模型显存。不要把 DeepSeekMath 式 (4) 里 $\beta=0.04$ 的 KL 项默认安到 GMPO 头上。

## 2. 几何平均目标

论文式 (3) 把同一条里的 $|\rho_{i,t}\hat{A}_i|$ 做几何平均，再用符号把方向找回来：

$$
\mathcal{J}^{*}_{\mathrm{GMPO}}(\pi_\theta)
=\mathbb{E}\left[
\frac{1}{G}\sum_{i=1}^{G}
\left(\prod_{t=1}^{|o_i|}\bigl|\rho_{i,t}(\theta)\hat{A}_i\bigr|\right)^{\frac{1}{|o_i|}}
\cdot\mathrm{sgn}(\hat{A}_i)
\right] \tag{4}
$$

$\mathrm{sgn}(\hat{A}_i)$ 在 $\hat{A}_i>0$ 时取 $+1$，否则取 $-1$。连乘不能直接吃带符号的数，$\hat{A}_i$ 一负，奇数个 token 会把符号翻乱。先取绝对值，最后把方向乘回去。

结果监督下整段共用同一个 $\hat{A}_i$，且 $\rho>0$，式 (4) 塌成

$$
\mathcal{J}^{*}_{\mathrm{GMPO}}
=\mathbb{E}\left[
\frac{1}{G}\sum_{i=1}^{G}
\hat{A}_i\left(\prod_{t=1}^{|o_i|}\rho_{i,t}(\theta)\right)^{\frac{1}{|o_i|}}
\right] \tag{5}
$$

看起来像「优势乘上比率的几何平均」。未 clip 时，它和后面要说的 GSPO 序列权重 $s_i\hat{A}_i$ 长得很像。分叉在 clip 插在哪，不在「有没有几何平均」六个字。

AM-GM 不等式给了一个范围结论（论文紧接式 (3)）：

$$
\bigl|\mathcal{J}^{*}_{\mathrm{GMPO}}\bigr|
\;\le\;
\bigl|\mathcal{J}^{*}_{\mathrm{GRPO}}\bigr| \tag{6}
$$

目标值域更窄，方差更小。这是稳定性的一个上界论证，不是「几何平均一定分更高」。

把 PPO 的 token 级 clip 嵌回去，得到完整目标（论文式 (4)）：

$$
\begin{aligned}
\mathcal{J}_{\mathrm{GMPO}}(\pi_\theta)
&=\mathbb{E}\Bigg[
\frac{1}{G}\sum_{i=1}^{G}
\Bigg\{
\prod_{t=1}^{|o_i|}
\Big|
\min\bigl[\rho_{i,t}\hat{A}_i,\;
\mathrm{clip}(\rho_{i,t},\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}})\hat{A}_i\bigr]
\Big|
\Bigg\}^{\frac{1}{|o_i|}}
\cdot\mathrm{sgn}(\hat{A}_i)
\Bigg]
\end{aligned} \tag{7}
$$

clip 发生在每个 token 的 $\rho_{i,t}$ 上，几何平均发生在 clip 之后。连乘和 clip 都在对数空间做，否则长序列下溢。

四个正优势 token，$\rho=(1.0,\,1.1,\,0.9,\,8.0)$，$\hat{A}=+1$。算术平均是 $2.75$，第四个 token 单独贡献 $2$。几何平均是 $(1.0\cdot 1.1\cdot 0.9\cdot 8.0)^{1/4}\approx 1.68$。把第四个先 clip 到 $e^{0.4}\approx 1.49$，几何平均掉到约 $1.10$。离群值还在，只是不再按自己的原值进梯度。

换一组负优势看符号。$\hat{A}=-1.2$，同一串 $\rho$。式 (4) 先对 $|\rho_t\hat{A}|=1.2\cdot\rho_t$ 做几何平均，再乘 $\mathrm{sgn}=-1$。未 clip 时共同权重约 $1.68\times 1.2\approx 2.02$，整段往下压。若有人把 $\hat{A}$ 直接丢进连乘，四个负数乘完是正的，梯度会反号。这就是绝对值加 $\mathrm{sgn}$ 的全部用处，不是装饰。

论文把 $\rho_t\hat{A}$ 叫 token-level reward，几何平均的对象是这个乘积，不是裸 $\rho$。结果监督下 $\hat{A}$ 提出连乘，两种说法重合。过程监督若给不同 $t$ 不同的 $A_{i,t}$，式 (4) 的 $|\rho_{i,t}A_{i,t}|$ 就不能再提出一个公共 $\hat{A}_i$。GMPO 正文实验走的是可验证 0/1，整段一个优势。TRL 实现也按序列标量 `advantage` 来写。不要把 02 里过程监督的逐步求和，默认套进式 (4)。

![算术平均与几何平均两条聚合](./images/fig-gmpo-am-vs-gm.png)

> 图 1：左右共用组内 $z$-score $\hat{A}$。左栏对 $\rho_t\hat{A}$ 做算术平均，右栏对 $|\rho_t\hat{A}|$ 做几何平均再乘 $\mathrm{sgn}(\hat{A})$。鲑肉色那一格是离群 token。

**图 1 解析**

- 顶上紫框是式 (1)。虚线进两栏，表示优势算法没改。
- 左栏四格仍是 $\rho_t\hat{A}$，进橙色 $(1/|o|)\sum$，底栏 $J^{*}_{\mathrm{GRPO}}$ 对应式 (3)。
- 右栏四格改成绝对值，进青色几何平均，底栏 $J^{*}_{\mathrm{GMPO}}$ 对应式 (4)。
- 读图时不要把右栏的连乘当成「整段似然比再开方之后才 clip」。那是图 2 右栏的 GSPO。

## 3. 梯度里仍有比率

旧讲义常写成「GMPO 梯度里没有 $\pi_\theta/\pi_{\theta_{\mathrm{old}}}$」。论文附录 Lemma 3 不是这么推的。省略 clip 时，单条 $(q,o_i)$ 上（论文式 (5)(6)）：

$$
\nabla_\theta\mathcal{J}^{*}_{\mathrm{GRPO}}\Big|_{q,o_i}
=\frac{1}{G\cdot|o_i|}\sum_{t=1}^{|o_i|}
\rho_{i,t}(\theta)\,\hat{A}_i\,
\nabla_\theta\log\pi_\theta(o_{i,t}\mid q,o_{i,<t}) \tag{8}
$$

$$
\nabla_\theta\mathcal{J}^{*}_{\mathrm{GMPO}}\Big|_{q,o_i}
=\frac{1}{G\cdot|o_i|}\sum_{t=1}^{|o_i|}
\left(\prod_{k=1}^{|o_i|}\rho_{i,k}(\theta)\right)^{\frac{1}{|o_i|}}
\hat{A}_i\,
\nabla_\theta\log\pi_\theta(o_{i,t}\mid q,o_{i,<t}) \tag{9}
$$

两边都是策略梯度的加权和。$\hat{A}_i\nabla\log\pi_\theta$ 是 Sutton 1999 那一项。差别只在权重。

GRPO 的权重是这个 token 自己的 $\rho_{i,t}$。$\rho_{i,7}=8$ 时，第 7 个 token 的梯度被放大 8 倍，旁边规规矩矩的 token 不受影响，整段更新被这一格绑架。

GMPO 的权重是整段 $\rho$ 的几何平均，**每个 token 拿到同一个数**。$\rho_{i,7}=8$ 仍会把这个共同权重抬高一点，但被其余 $|o_i|-1$ 个接近 1 的比率按几何平均摁住。式 (9) 里没有「删掉比率」，有的是把逐 token 的比率换成序列内几何平均。

推导在附录。Lemma 1 先写 $\nabla_\theta\rho_{i,t}=\rho_{i,t}\nabla_\theta\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})$，这是重要性比率对参数的链式法则。Lemma 2 把它代进式 (3)，得到式 (8)。Lemma 3 先把式 (4) 在 $\rho>0$ 时写成 $(\prod_t\rho_{i,t})^{1/|o_i|}\hat{A}_i$，再对乘积求导。中间出现 $(\prod\rho)^{1/|o_i|-1}$ 乘上「去掉第 $k$ 项的乘积」，两项一合，每个 $k$ 前面只剩下整段几何平均。坐标展开到这里就够了，不必再写成双求和。

有的讲义把 GMPO 梯度写成只有 $\frac{1}{|o_i|}\sum\nabla\log\pi$ 乘 $\hat{A}$，比率项被拿掉。论文式 (6) 的权重就是 $(\prod_k\rho_{i,k})^{1/|o_i|}$，必须留在 $\nabla\log\pi$ 前面。漏抄这一项，会把 GMPO 读成「无重要性采样的 REINFORCE」，和原文不符。

![clip 插槽与梯度权重](./images/fig-gmpo-clip-grad-slot.png)

> 图 2：三栏都从 $\rho_t$ 出发。GRPO 逐 token 加权；GMPO 先 token clip 再几何平均，同一条权重广播回每个 $\nabla\log\pi_t$；GSPO 先聚成 $s_i$ 再对 $s_i$ clip。右栏标题写明不是 GMPO。

**图 2 解析**

- 左栏：clip 在 token 上，权重仍是各 $\rho_t$，对应式 (8)。
- 中栏：clip 窗写成 $(e^{-0.4},e^{0.4})$，是论文选定的默认，不是图装饰。几何平均之后 $w$ 对所有 $t$ 相同，对应式 (9)。
- 右栏：先 $s_i=(\prod\rho)^{1/|y|}$，再 $\mathrm{clip}(s_i)$。这是 [2507.18071](https://arxiv.org/abs/2507.18071) 的 GSPO，不要并进中栏。
- 三栏之间没有横箭。clip 和聚合的先后是结构差，不是同一条流水线的两个旋钮。

## 4. 不是 GSPO

GSPO（Group Sequence Policy Optimization，Qwen，arXiv:2507.18071）的序列级重要性权重是

$$
s_i(\theta)
=\left(\frac{\pi_\theta(y_i\mid x)}{\pi_{\theta_{\mathrm{old}}}(y_i\mid x)}\right)^{1/|y_i|}
=\exp\left(\frac{1}{|y_i|}\sum_{t}\log\rho_{i,t}\right) \tag{10}
$$

目标是 $\min\bigl(s_i\hat{A}_i,\;\mathrm{clip}(s_i,1-\varepsilon,1+\varepsilon)\hat{A}_i\bigr)$。几何平均用来把整段似然比拉回可比较的尺度，clip 作用在已经聚好的 $s_i$ 上。Qwen 的问题是：奖励是序列级，token 级 IS 往梯度里灌噪声，MoE 路由一抖更明显。

GMPO 的问题是另一句：算术平均对 $\rho_t\hat{A}$ 的离群值过敏，想把 clip 窗开大又怕炸。它继续在 token 上 clip，只换聚合算子。

未 clip、$\hat{A}$ 整段共用时，式 (5) 和 $s_i\hat{A}_i$ 同型。一旦加上 clip，两条路就不再能互相代入。GMPO 是「先 clip 每个 $\rho_t$，再对 $|\,\mathrm{clip}(\rho)\hat{A}\,|$ 取几何平均」。GSPO 是「先取几何平均得到 $s_i$，再 clip $s_i$」。一个离群 token 在 GMPO 里先被自己的窗削掉，再进乘积；在 GSPO 里先参与整段 $s_i$，再看 $s_i$ 出不出窗。出窗则整段梯度一起停。

DeepSeek-R1 还有第三条：最大化 $(\prod_t\rho_{i,t})\hat{A}_i$，对乘积做序列级 clip，并且没有 $1/|o_i|$ 那个幂。GMPO 论文 §3 说，序列级 clip 一触发，整段 $\nabla\log\pi$ 全置零，中间还有信息的 token 也被扔掉。Figure 3 里 GMPO-seq-clip 的 $\rho$ 区间比 token clip 更宽。附录 C 画了正奖励轨迹的序列级比率：没有 $1/|o|$ 归一化时，回答一长，乘积可以大到没法看。Table 4 第 4 行去掉幂之后，Qwen2.5-Math-7B 五基准均分从 52.7 掉到 52.0。几何平均里的 $1/|o_i|$ 在这里是目标的一部分，不是 Dr. GRPO 那种「把长度分母删掉」的补丁。

名字都带 G，都从 GRPO 长出来，都在 2025 年 7 月前后出现。读公式比读缩写安全。Microsoft 的发布页把 GMPO 标成 ICLR 2026；GSPO 是 Qwen 的序列级方法，号是 2507.18071。两篇可以互相引用当对照，不能把一篇的 Figure 贴到另一篇的目标下面。

若只记住一句话：未 clip 时两者都可能写成「$\hat{A}$ 乘上比率的几何平均」；clip 之后，GMPO 的几何平均吃的是已经裁过的 token 项，GSPO 裁的是已经聚好的 $s_i$。图 2 中栏和右栏的橙色框不在同一层。

## 5. Token clip 和更宽的窗

论文把两个设计写成 GMPO 的配套，不是可选装饰。

第一，clip 放在 token 上。式 (7) 里 $\min$ 和 $\mathrm{clip}$ 的自变量是 $\rho_{i,t}$，不是 $\prod_t\rho_{i,t}$。Table 4 第 3 行（序列级 clip）均分 52.6，第 5 行（token clip）52.7，分数接近，Figure 3 显示序列级 clip 的比率区间更大。作者选 token clip，理由是稳，以及不要整段梯度清零。

第二，窗比 PPO/GRPO 常用的 $(0.8,1.2)$ 宽。默认写成 $(e^{-0.4},e^{0.4})\approx(0.670,1.492)$。DAPO 的 clip-higher 只是把上沿从 1.2 挪到 1.28，数量级还在旁边。GMPO 敢开这么大，是因为几何平均已经把离群 $\rho$ 的权重点平了一层。Table 5 是同一套 7B 训练、只改窗：

| $(\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}})$ | AIME24 | AMC | MATH500 | Minerva | Oly. | Avg. |
|---|---|---|---|---|---|---|
| $(e^{-0.2},e^{0.2})$ | 36.6 | 60.2 | 84.2 | 35.7 | 45.0 | 52.4 |
| $(e^{-0.4},e^{0.4})$ | 43.3 | 61.4 | 82.0 | 33.5 | 43.6 | 52.7 |
| $(e^{-0.8},e^{0.8})$ | 40.0 | 60.2 | 82.2 | 33.5 | 44.7 | 52.1 |
| $(-\infty,+\infty)$ | 40.0 | 63.9 | 80.6 | 33.5 | 43.7 | 52.3 |

最宽的那一行不是最高。无 clip 时 Figure 3 的 $\rho$ 区间剧烈晃，均分 52.3，比默认低 0.4。窗不是越大越好。$e^{\pm 0.4}$ 是这张表上的折中，不是普遍常数。

实现上，clip 在对数空间、并且带着 $\mathrm{sgn}(\hat{A})$ 做单侧限制，等价于 PPO 那种「只砍对目标有利的那一侧」。论文 Algorithm 1 写成：

```python
def gmpo_loss(new_log_p, old_log_p, mask, advantage, epsilon=0.4):
    """论文 Algorithm 1：对数空间 token clip，再取几何平均。"""
    sgn = 1.0 if advantage > 0 else -1.0
    signed = sgn * (new_log_p - old_log_p)
    clipped = signed.clamp(-epsilon, epsilon)
    # PPO 单侧：取对目标更保守的那个
    signed_min = torch.minimum(signed, clipped)
    log_rho = sgn * signed_min
    geo = torch.exp((log_rho * mask).sum() / mask.sum().clamp_min(1.0))
    return -advantage * geo
```

`epsilon=0.4` 是对数域。对应比率上下沿是 $\mathrm{e}^{\pm 0.4}$，不要再套一层 $1\pm 0.4$。`geo` 就是式 (7) 里那条序列的几何平均权重。Hugging Face TRL 的 `GMPOTrainer` 也按这个次序：先 token 级对数 clip，再 `exp(mean)`。

单侧限制要跟优势的符号绑在一起。$\hat{A}>0$ 时，只砍「再增大 $\rho$ 还能加分」的那一侧，下沿 $e^{-0.4}$ 不拦；$\hat{A}<0$ 时反过来，只砍「再减小 $\rho$ 还能加罚」的那一侧。这是 PPO 教科书里 $\min(\rho A,\mathrm{clip}(\rho)A)$ 的对数写法。Algorithm 1 先把 $\log\rho$ 乘上 $\mathrm{sgn}(\hat{A})$，再 `clamp` 到 $[-0.4,0.4]$，再和未裁的值取 $\min$，最后乘回符号。少乘一次符号，负优势序列会按正优势的窗去砍，目标方向就反了。

mask 必须只含回答 token。prompt 上的 $\rho$ 没有优势，混进 `mean` 会把几何平均往 1 拉。pad 位同理。`mask.sum()` 就是 $|o_i|$，也是式 (4) 那个幂。TRL 把这一步写成 `(clipped_log_ratio * seq_mask).sum(-1) / seq_mask.sum(-1)`，和论文伪代码同一条。

## 6. 表上的数字

语言侧跟 Dr. GRPO 对齐：7B 以下用 MATH Levels 3–5，8523 题；每题 8 条 rollout，最长 3000 token；每轮旧策略吐 1024 条，当前策略更新 8 次，batch 128。奖励是可验证的 1/0。评测五份卷：AIME24（30 题）、AMC（83）、MATH500（500）、Minerva（272）、OlympiadBench（675）。温度 0.0，每题一条，报 Pass@1。8×A800。不要把 DeepSeekMath 那套 $G=64$、最大长度 1024 抄过来冒充 GMPO 超参。

Table 1 三档底座：

| 模型 | AIME24 | AMC | MATH500 | Minerva | Oly. | Avg. |
|---|---|---|---|---|---|---|
| GRPO-1.5B | 23.3 | 49.4 | 75.2 | 25.7 | 39.0 | 42.5 |
| GMPO-1.5B | 20.0 | 53.0 | 77.6 | 30.1 | 38.7 | 43.9 |
| GRPO-7B | 40.0 | 59.0 | 83.4 | 32.4 | 41.3 | 51.2 |
| GMPO-7B | 43.3 | 61.4 | 82.0 | 33.5 | 43.6 | 52.7 |
| GRPO-7B (R1-Distill) | 43.3 | 67.5 | 89.0 | 39.7 | 56.7 | 59.3 |
| GMPO-7B (R1-Distill) | 46.6 | 78.3 | 91.4 | 37.9 | 62.5 | 63.4 |

摘要里那句「平均 Pass@1 高 4.1%」指最后两行：63.4 对 59.3。拆开看，AMC $+10.8$，OlympiadBench $+5.8$，MATH500 $+2.4$，AIME24 $+3.3$。Minerva 是 37.9 对 39.7，GMPO 低了 1.8。均分赢、单卷不必张张赢。1.5B 的 AIME24 也是 20.0 对 23.3，均分仍高 1.4，靠的是 AMC / MATH500 / Minerva。

Table 2 另外两格。Qwen2.5-VL-Instruct-7B 在 Geometry3K 上，GRPO 53.3，GMPO 54.7，差 1.4。多模态设定跟 EasyR1，温度 0.5，每题 16 条。Qwen3-32B MoE（128 专家 / 激活 8）在 MATH500 上，GRPO 94.6，GMPO 96.7，差 2.1。MoE 训练数据换成 DeepScaleR，batch 128 / mini-batch 64，细节在论文附录 Table 6。

Table 3 把 7B 放到同一年一堆 Zero / PRIME / OpenReasoner / GPG / Oat-Zero 旁边。Qwen2.5-Math-7B 底座上 GMPO 均分 52.7，Oat-Zero-7B 是 51.4（Table 3 把它和 Dr. GRPO 那条线对齐）。R1-Distill 底座上 GMPO 63.4，Oat-Zero 61.5。这些是同表对照，不是「换了聚合算子就超过所有后训练方法」。

Table 4 把目标本身拆开，底座仍是 Qwen2.5-Math-7B，Pre-RL 均分 26.5：

| 行 | 目标 | Avg. |
|---|---|---|
| 1 | GRPO 算术平均 + token clip | 51.2 |
| 2 | 几何平均、无 clip | 52.3 |
| 3 | 几何平均 + 序列级 clip | 52.6 |
| 4 | 几何平均、去掉 $1/\|o\|$ | 52.0 |
| 5 | 几何平均 + token clip（GMPO） | 52.7 |

从 51.2 到 52.7 是这张消融里「换聚合」的幅度。第 2、3、4 行说明 clip 位置和长度幂都动得分，但没有哪一行单独吃掉全部增益。

论文 Figure 4 还画了熵、KL、梯度范数、验证分。GMPO 的 token 熵掉得比 GRPO 慢，相对预训练底座的 KL 更小，梯度范数更稳。GRPO 把 clip 窗临时开大，熵会抬一会儿，随后仍往下掉。作者引用 Cui et al. 2025b 的判断：推理模型的 RL 经常拿熵换短线分数，熵塌早了，后面分数就平台。算术平均对离群 $\rho\hat{A}$ 过敏，一次过猛更新就能把分布拧窄；几何平均把这次拧的幅度按整段比率摊平。Figure 4 (a)(b) 分别是 MATH L3–L5 和更难的 DeepScaleR，两条训练线上 GMPO 的平均 token 熵都更高。这些是论文自己的训练曲线，本篇不重绘坐标。

附录 Figure 5 把同一对照搬到 MoE。CountDown 是用给定数字加减乘除凑到目标的谜题，底座是从 Qwen2.5 改出来的 200M 小 MoE（8 专家 / 激活 1），batch 256 / mini-batch 128。图上 GRPO 大约 250 step 之后验证分塌掉，KL 和梯度范数同时变差；GMPO 的 KL 更低、梯度更稳，验证分停在更高的位置。DeepScaleR 那一组底座才是 Qwen3-32B，熵更高、梯度更稳、MATH500 验证分也更高。纵轴刻度以原文图为准。小 MoE 上塌、大 MoE 上只报一个 MATH500，两边不要合成「GMPO 治好了所有专家路由噪声」。GSPO 才把 MoE 路由抖动写成 token 级 IS 的主诉。

## 7. 失效和边界

组内 $\mathrm{std}$ 还在。全对或全错时分母趋近 0，难度偏差从 GRPO 原样继承过来。8 条 rollout 比 DeepSeekMath 实验里的 64 条更容易撞上全 1 / 全 0。实现里对 $\mathrm{std}$ 做 `clamp_min`，数值上 $\hat{A}$ 会被放得很大，组内又几乎没有可比较的差异。DAPO 的动态采样直接丢掉准确率 0% 或 100% 的组；Dr. GRPO 选择去掉 $\mathrm{std}$。GMPO 目标里两件事都没改。换聚合算子压的是 $\rho$，不是 $z$-score 本身。

插进 4.4.1 这条流水线，位置很窄。采样、打分、式 (1) 的组统计，和 02 完全相同。改动从「有了 $\rho_{i,t}$ 和 $\hat{A}_i$ 之后怎么聚成一个标量目标」开始，到 $\nabla\log\pi$ 前面的权重为止。奖励模型或规则函数不用换。参考策略在 GMPO 正文里常常不驻，因为 KL 项被拿掉了；若要沿用 DeepSeekMath 那种 $\beta\mathrm{D}_{\mathrm{KL}}$，得自己加回损失，论文没有给这一项的系数。

几何平均对「接近 0 的 $\rho$」同样敏感，方向反过来。一个 token 的比率掉到 $10^{-3}$，整段共同权重会被拖下去。clip 下沿 $e^{-0.4}\approx 0.67$ 能挡住一部分，挡不住已经发生的下溢；所以实现必须走 $\exp(\mathrm{mean}(\log\rho))$，不要先连乘再开方。

长度偏差没有被「天然消灭」。式 (8)(9) 外面都有 $1/(G\cdot|o_i|)$。GMPO 多出来的 $1/|o_i|$ 在指数上，Table 4 说它有用，这和 Dr. GRPO 删掉算术平均分母不是同一件事。短的正确答案、长的错误答案，信用怎么摊，仍要自己看分母。

Minerva 在 R1-Distill 7B 上是退步。研究生难度、多步计算，几何平均把离群 token 压住，也可能把少数高信息 token 的更新一起削平。论文没有单独拆这条。

CountDown 上 GRPO 会塌，说明「算术平均 + 宽探索」在小 MoE、谜题奖励上更脆。这是附录里的对照，不是 GMPO 在所有 MoE 上的通行证。Qwen3-32B 那一格只有 MATH500 一个数。

GMPO 不是去 Critic 的发明。没有价值网络这一条是 GRPO 的。它也不是序列级 IS 的发明。那条是 GSPO 的。它改的是：token 级加权奖励用哪种平均，clip 能不能因此开宽一点。

和 DAPO 也不要并成一种「开窗」方法。DAPO 的 clip-higher 仍建立在算术平均上，上沿只挪到 1.28，另外还改动态采样、token 级损失分母、超长惩罚。GMPO Table 3 没有把 DAPO 整系统拉进来对打，只在正文里借用「窗太窄会早确定」这句话。要对 DAPO 的四件套，去 4.4.5 和 2503.14476，不要从本篇的 $e^{\pm 0.4}$ 反推 DAPO。

复现时还有两处容易和 02 的代码对不上。第一，GMPO 实验每题 8 条，DeepSeekMath 的 GRPO 实验每题 64 条，组统计的方差不是一个数量级。第二，02 里那段 `grpo_clip_and_kl` 的分母用了 batch 内有效 token 总数，更接近后文 DAPO；GMPO 式 (4) 是每条先在自己的 $|o_i|$ 上取几何平均，再对 $G$ 做算术平均。两条回答长度差一倍，两种分母会给出不同的步长。对账以你用的训练器为准。

## 8. 怎么选

可验证奖励、已经在跑 GRPO、训练日志里 $\rho_t$ 的最大最小值越拉越开、一开窗熵就塌：优先改聚合，不要先上序列级 $s_i$。式 (1) 不用动，损失换成式 (7)，clip 的 $\varepsilon$ 改到对数域 0.4。

MoE 上 token 级 IS 和路由抖动缠在一起、整段奖励对不上逐 token 权重：那是 GSPO 的主场。先读 03，不要把本篇的 $e^{\pm 0.4}$ 填进 $s_i$ 的 clip。

还要 GAE、还要过程中的 $V$：回 [04-PPO](../04-PPO/04-PPO.md)。静态偏好对、不跑在线 rollout：那是 DPO，不在这条夹。

组太小（$G=2$）时式 (1) 的均值晃，几何平均救不了。GMPO 实验用 8，比 02 里数学实验的 64 窄，日志里更要看 $\rho$ 的区间，不要只看均分。全 0 / 全 1 的组在 $G=8$ 上更常见，先确认 $\mathrm{std}$ 的平滑项，再谈把窗开到 $e^{\pm 0.4}$。窗宽救不了没有对照的组。

## 9. 收束

GMPO 把式 (3) 的 $\frac{1}{|o|}\sum\rho_t\hat{A}$ 换成式 (4) 的几何平均，clip 仍在 token 上，默认窗 $(e^{-0.4},e^{0.4})$。梯度权重从「每个 token 自己的 $\rho_t$」换成「整段 $\rho$ 的几何平均」。DeepSeek-R1-Distill-Qwen-7B 五份数学卷均分 63.4 对 GRPO 的 59.3，差 4.1；Geometry3K 54.7 对 53.3；Qwen3-32B MATH500 96.7 对 94.6。优势算法没变，要看 $z$-score 回 02。要看序列级 $s_i$ 进 03。家族对照在 [4.4.5](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md)。

## 参考文献

1. Zhao, Y., Liu, Y., Liu, J., Chen, J., Wu, X., Hao, Y., Lv, T., Huang, S., Cui, L., Ye, Q., Wan, F., & Wei, F. (2025). *Geometric-Mean Policy Optimization*. arXiv:2507.20673. https://arxiv.org/abs/2507.20673
2. Shao, Z., et al. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300. https://arxiv.org/abs/2402.03300
3. Zheng, C., et al. (2025). *Group Sequence Policy Optimization*. arXiv:2507.18071. https://arxiv.org/abs/2507.18071
4. Liu, Z., et al. (2025). *Understanding R1-Zero-like Training: A Critical Perspective*. arXiv:2503.20783.
5. Yu, Q., et al. (2025). *DAPO: An Open-Source LLM Reinforcement Learning System at Scale*. arXiv:2503.14476.
6. Schulman, J., et al. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347.
7. Guo, D., et al. (2025). *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*. arXiv:2501.12948.
8. GMPO code. https://github.com/callsys/GMPO
