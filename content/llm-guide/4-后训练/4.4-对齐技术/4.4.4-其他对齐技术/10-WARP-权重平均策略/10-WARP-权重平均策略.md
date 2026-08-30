---
title: "10 · WARP：权重平均策略"
date: 2026-08-31
tags: [WARP, WARM, EMA, SLERP, LITI, RLHF, Gemma, 权重平均]
as_of: 2026-08-31
math: true
---

# 10 WARP：权重平均策略

WARP 在权重空间做三次平均，优化的是 KL–reward Pareto。推理只保留一份合并后的策略，不再付 $N$ 次采样。论文是 Ramé 等 *WARP: On the Benefits of Weight Averaged Rewarded Policies*（[arXiv:2406.16768](https://arxiv.org/abs/2406.16768)，HTML：[arxiv.org/html/2406.16768](https://arxiv.org/html/2406.16768)）。数字跟 HTML。

三次平均必须分开写，不要缩成「就是 EMA」。第一段：策略的指数滑动平均当 KL 正则的动态锚点。第二段：独立微调的多份策略做球面插值（slerp）。第三段：再与初始化线性插值，把预训练特征捞回来。算力够，就把这一轮终局当下一轮初始化，整段再跑。实验主体是 Gemma `"7B"`。

这不是 WARM。WARM 平均的是奖励模型，同一作者组的另一篇 ICML（[arXiv:2401.12187](https://arxiv.org/abs/2401.12187)）。这边平均的是被奖励推过的策略。也不是 [09 BOND](../09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md) 的主算法：J-BOND 的 EMA 锚点只是 WARP 的同族操作之一，WARP 还有球面插值和往初始化回插。不要把 09 的 $-\log 16$ 抄过来。不是 [07 Best-of-N](../07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md) 那种解码 $\arg\max$，也不是 [RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md) 只训 top-1。

## 1. 锚钉在 SFT 上，奖励就拧不动

标准 KL 正则 RLHF 把奖励拧在参考策略附近。HTML 式 (1) 写成

$$
\operatorname*{argmax}_{\theta}\,\mathbb{E}_{{\bm{x}}\in\mathcal{X}}\Bigl[\mathbb{E}_{{\bm{y}}\sim\pi_{\theta}(\cdot\mid{\bm{x}})}\,r({\bm{x}},{\bm{y}})-\beta\,\mathrm{KL}\bigl(\pi_{\theta}(\cdot\mid{\bm{x}})\big\Vert\pi_{\theta_{\mathrm{anchor}}}(\cdot\mid{\bm{x}})\bigr)\Bigr].
\tag{1}
$$

默认 $\theta_{\mathrm{anchor}}\leftarrow\theta_{\mathrm{sft}}$。$\beta$ 大，KL 低，奖励也低；$\beta$ 小，奖励涨得快，遗忘、奖励黑客、生成多样性塌掉会一起来。HTML §2 把这三件事并列：对齐税、对不完美 RM 的黑客、policy collapse。比策略的正确尺子不是终局奖励，是 KL–reward 平面左上角那条前沿。

调过的奖励是

$$
r_{\beta}({\bm{x}},{\bm{y}})=r({\bm{x}},{\bm{y}})-\beta\log\frac{\pi_{\theta}({\bm{y}}\mid{\bm{x}})}{\pi_{\theta_{\mathrm{anchor}}}({\bm{y}}\mid{\bm{x}})}.
\tag{2}
$$

基线优化器是 REINFORCE 变体，不是 PPO 四件套。HTML §2 写，在 KL–reward Pareto 上 REINFORCE 打过更复杂的 PPO，也打过离线的 DPO、IPO、RAFT。序列级 REINFORCE 本身在 [10-REINFORCE](../../4.4.1-基于奖励模型的RL-RLHF-PPO/10-REINFORCE-序列级策略梯度/10-REINFORCE-序列级策略梯度.md)。WARP 改的不是这条梯度公式，是锚点放哪、多份权重怎么并、并完往哪插。

工程上常见做法是早停：沿一条 REINFORCE 轨迹，按自己的 KL 预算切一个点。WARP 要的是把同一条预算上的点往上抬，并且推理时只加载一份权重。

## 2. 三次平均，不要缩成「就是 EMA」

WARP 把权重平均接到对齐流程的三个不同位置，理由也不一样。HTML §3 写得很硬：三种变体、三个阶段、三件不同的事。算法骨架是 Algorithm 1。外层 $I$ 轮迭代，每轮并行 $M$ 次 RL，每次 $T$ 步。

一次迭代内部顺序如下。

从共享初始化 $\theta_{\mathrm{init}}$ 出发（第一轮就是 $\theta_{\mathrm{sft}}$）。并行 $M$ 条 REINFORCE。每条自己维护一份 EMA，KL 对着这份 EMA 算，不是对着冻结的 SFT。跑完 $T$ 步，得到 $\{\theta^{m}\}_{m=1}^{M}$。

把这 $M$ 份相对 $\theta_{\mathrm{init}}$ 的任务向量做球面插值，得到 $\theta_{\mathrm{slerp}}$。$\lambda=1/M$。

再把 $\theta_{\mathrm{slerp}}$ 往 $\theta_{\mathrm{init}}$ 线性插回去：

$$
\theta_{\mathrm{init}}\leftarrow(1-\eta)\cdot\theta_{\mathrm{init}}+\eta\cdot\theta_{\mathrm{slerp}}.
\tag{3}
$$

这一份当作下一轮初始化。全部 $I$ 轮结束后，还可以对着最初的 $\theta_{\mathrm{sft}}$ 再扫一遍 $\eta$，得到一族 Pareto 权重

$$
\bigl\{(1-\eta)\cdot\theta_{\mathrm{sft}}+\eta\cdot\theta_{\mathrm{slerp}}^{I}\mid 0\le\eta\le 1\bigr\}.
\tag{4}
$$

HTML 把式 (3) 写进循环里更新 $\theta_{\mathrm{init}}$；把式 (4) 写成交付物。两处 $\eta$ 字母相同，语义不同：循环里通常钉死一个 $\eta$（实验默认 $0.3$），用来产下一轮初始化；交付时再把 $\eta$ 从 $1$ 滑到 $0$，用来读整条前沿。不要并成一个旋钮。

![一次迭代：EMA 锚住两条独立 REINFORCE，SLERP 合并任务向量，LITI 插回初始化](./images/fig-warp-three-stages.png)

> 图 1：一次 WARP 迭代。$\theta_{\mathrm{init}}$ 分出两条 REINFORCE。每条下方是自己的 EMA，$\mu=0.01$，虚线是权重复制。两条策略实线进 SLERP（$\lambda=1/M$）。LITI 吃 $\theta_{\mathrm{slerp}}$，虚线从初始化进来，按 $\eta=0.3$ 交出下一轮 $\theta_{\mathrm{init}}'$。

**图 1 解析**

- 左栏是 Stage 1。KL 写在策略框里，对着 $\pi_{\mathrm{ema}}$，不是对着 SFT。虚线单向：策略复制进 EMA，没有互相反传。
- 中栏是 Stage 2。进 SLERP 的是 $\theta^{1}$、$\theta^{2}$ 本身，EMA 不进合并。
- 右栏是 Stage 3。实线是合并结果，虚线是往初始化回插。$\eta=0.3$ 标在 LITI 出口，对应实验默认，不是把 $\eta$ 扫完。
- 没有 KL–reward 坐标轴，没有 Gemma 散点。

训练要付 $M$ 份并行 RL，每轮还可能再迭代。推理账单不变：一份权重、采 1 条。HTML §6 把多出来的训练算力写成「feature rather than a bug」：对齐阶段把算力变成能力，而不是部署时再堆 agent。

## 3. Stage 1：策略 EMA 当动态 KL 锚

冻结 SFT 当锚，正则强度是死的。控制任务里更新锚点很常见。WARP 把锚换成策略自己的指数滑动平均。每步

$$
\theta_{\mathrm{ema}}\leftarrow(1-\mu)\cdot\theta_{\mathrm{ema}}+\mu\cdot\theta_{\mathrm{policy}}.
\tag{5}
$$

HTML §3.1 写 $\mu=0.01$。Setup 段和附录 D.2 也说主实验钉的是 $\mu=0.01$、$\beta=0.1$。§4.1 写 Figure 3 那条 EMA 轨迹时给了 $\mu=0.1$。同一份 HTML 两处不一致。附录 D.2 说这两个数项目一开始就钉死，后面没改；Figure 15 才另扫 $\mu=0.005$ 和 $\beta=0.2$。读 Figure 3 时不要把 $\mu=0.1$ 当成全篇默认。

Observation 1：EMA 锚带来两件事。KL 正则会自动退火；策略同时在从一个动态 mean teacher 里蒸馏。开始时 EMA 还贴着 SFT，更新被按住。EMA 跟着走，约束慢慢松，后期步子可以更猛，奖励更高。EMA 本身是慢权重：它比纯 SFT 强，有时比终局策略还强。KL 对着它算，等于把这份更稳的预测当教师。

这和 J-BOND 的 EMA 是同一类操作，不是同一套算法。09 那篇的式 (13) 用 $\eta=0.02$ 把策略权重复制进锚点，服务的是 Best-of-2 蒸馏。这边 $\mu=0.01$ 服务的是式 (1) 里的 KL 项。后面还有 SLERP 和 LITI，09 没有。

Figure 3(a)(b) 把这条动态锚和「锚死在 SFT、只拧 $\beta$」对照。评估每 100 步一次，训练 $T=9k$，策略 KL 到 $200$ 就停。$\beta=0.0$ 大约 $T=1k$ 就撞上这条 KL 墙，奖励涨得快，HTML 读成黑客。SFT 锚、$\beta=0.1$ 太紧，奖励很快停在大约 $-0.62$。$\beta=0.01$ 在低 KL 区能跟上 EMA 锚，然后停在大约 $-0.46$。EMA 锚的 Pareto 在图里更靠左上。结论不是「EMA 能抬任意终局奖励」，是固定算力下，同一 KL 预算上奖励更好。

附录 Figure 14 把各变体的在线 EMA 和底座策略放在一起：SFT 锚那些跑，EMA 版本的 Pareto 不差于底座。HTML 把 Stage 1 的一部分好处读成：教师本身就比正在更新的策略稳。

Figure 15 把 $\mu$ 降到 $0.005$、或把 $\beta$ 升到 $0.2$，行为相近：前沿略好，训练变慢。主文没把这两档设成默认。

## 4. Stage 2：独立微调再球面插值

单条轨迹上的检查点太像。DiWA 那条文献已经写过：多样性不够，平均帮不上忙。Stage 2 换一批独立 RL，每条自己带 EMA 锚。多样性来源很朴素：打乱 prompt 顺序。HTML 说这就够用。Figure 18(c) 另试过不同奖励目标，那是附录，不是主设定。

合并用球面线性插值，不是算术平均。$M=2$ 时

$$
\operatorname{slerp}(\theta_{\mathrm{init}},\theta^{1},\theta^{2},\lambda)=\theta_{\mathrm{init}}+\frac{\sin[(1-\lambda)\Omega]}{\sin\Omega}\,\delta^{1}+\frac{\sin[\lambda\Omega]}{\sin\Omega}\,\delta^{2}.
\tag{6}
$$

$\delta^{m}=\theta^{m}-\theta_{\mathrm{init}}$ 是任务向量。$\Omega$ 是两条任务向量的夹角。$\lambda$ 是插值系数。SLERP 按层做。Gemma `"7B"` 有 28 层，每层自己的 $\Omega$。

$M>2$ 时式 (6) 没有直接定义。附录 B.3 用迭代：先合并前 $M-1$ 份，再和第 $M$ 份按 $\lambda=1/M$ 做一次 slerp。运算不结合律。Figure 4(b) 的阴影是 5 次实验的标准差，HTML 说偏差小。

和 LERP 的差别不要靠语感。任务向量等范数 $l$ 时（Assumption 1），附录 Lemma 1 给出 SLERP 保范数

$$
\lVert\delta_{\mathrm{slerp}}^{\lambda}\rVert=l,
\tag{7}
$$

LERP 缩范数

$$
\lVert\delta_{\mathrm{lerp}}^{\lambda}\rVert=l\sqrt{1-2(1-\cos\Omega)(\lambda-\lambda^{2})}.
\tag{8}
$$

$\lambda=0.5$ 时缩得最厉害。Observation 2：SLERP 抬奖励，KL 略升。Observation 3：LERP 降 KL，对奖励帮助小。Observation 4：任务向量接近正交，$\Omega\approx 90^{\circ}$；完整权重几乎共线，$\omega\approx 0^{\circ}$。正交时式 (8) 的缩范特别明显，所以 LERP 会把合并结果往初始化拽。

不要对完整权重做 SLERP。$\omega\approx 0^{\circ}$ 时 $\sin x\approx x$，球面系数退化成 $\lambda$，结果看起来就像 LERP。Figure 9(c) 确认了这件事。HTML 写 SLERP 作用在任务向量上，不是作用在 $\theta$ 上。

Figure 3(c) 扫 $\lambda$，奖励在 SLERP、$\lambda=0.5$、$T=9k$ 处最高。两端 $\lambda=0$ 和 $\lambda=1$ 回到原来的两份策略。这是线性模式连通在 RL 微调上的版本：插值点比端点好。SLERP 的奖励曲线整体在 LERP 上面。KL 要到附录 Figure 8 才分开：LERP 明显降 KL，SLERP 略升。合到一张 Pareto 上，两件事占的是不同区域。高奖励、高 KL 走 SLERP；低 KL 走 LERP。WARP 主路径选 SLERP，再把降 KL 的工作交给 Stage 3 的 $\eta$。

Model Stock 那条 $\eta\to 2\cos\Omega/(1+\cos\Omega)$ 在这里不能用。$\Omega\approx 90^{\circ}$ 会把 $\eta$ 打到 $0$，更新被删掉。HTML §5 写他们试过，失败。监督微调里 $\Omega$ 常在 $40^{\circ}$ 到 $80^{\circ}$；这边是 RL，策略吃自己的生成，任务向量更正交。

## 5. Stage 3：往初始化线性插回去

SLERP 之后奖励高了，KL 也略高。第三段做成 WiSE-FT 那种往初始化回插：

$$
\theta^{\eta}\leftarrow(1-\eta)\cdot\theta_{\mathrm{init}}+\eta\cdot\theta_{\mathrm{slerp}}.
\tag{9}
$$

$\eta=1$ 是合并结果，高奖励、高 KL。$\eta=0$ 回到初始化，KL 最小、奖励也最小。中间档把新行为留一部分，把预训练特征捞回来一部分。HTML 的观察是：往下拧 $\eta$，KL 掉得比奖励快。于是 LITI 扫出来的前沿在「对角线」上面，也在底座 RL 轨迹上面。这是 Observation 5。

附录在线性区（一阶 Taylor）里把 KL 的凸性写成式 (21)：LITI 的 KL 不超过 $\eta$ 倍终局 KL。奖励凹性是 Assumption 3，依据是 Figure 8(e)，不是定理。两条合在一起，LITI 的点落在对角线左上（Lemma 5）。不要把附录的 $\approx$ 读成部署保证。权重还得离得近，NTK 那套展开才说得通。

Figure 4(a) 先 SLERP 两份策略（$\lambda=0.5$），再扫 $\eta\in\{0,0.1,0.3,0.5,0.8,1.0\}$。这些点组成的前沿压在两条独立 REINFORCE 轨迹上面。训得更久，高 KL 更好；把 $\eta$ 拧小，低 KL 也能吃到这份更长的微调。Figure 4(b) 把 $M$ 加到 5。LITI 前沿仍在 RL 轨迹上面；$M$ 越大越好。阴影是 5 次实验的标准差。HTML 把加大 $M$ 写成一条 scaling 方向。

只做 $M=1$ 再 LITI，奖励增益比先合并再插小得多。附录 Figure 13 还试过沿单条轨迹做滑动平均（$\{6k,7k,8k,9k\}$ 检查点）再 LITI，没有变好。Stage 2 的独立微调不是装饰。

$\eta$ 太大，下一轮从高 KL 区起步，短算力时高 KL 更好；$\eta$ 太小，留在低 KL，后面还有轮次才能摸到高奖励。Figure 16 把第二轮初始化的 $\eta=0.3$ 和 $0.5$ 对照：$\eta=0.5$ 在高 KL 更好，$\eta=0.3$ 在 $\mathrm{KL}<65$ 更好。HTML 把 $\eta$ 读成外层学习率。算力少、只能跑一轮多一点，用更大的 $\eta$；后面还要迭代，用 $0.3$。默认钉 $0.3$。

附录 D.4：插向本轮初始化，还是插向最初的 SFT，两条 Pareto 差不多。迭代实验选本轮初始化，这样每轮都能用同一个 $\eta$，往高 KL 走得平滑。Figure 1(b) 那条「WARP: 1st iteration」是插向 SFT；Figure 4(c) 是插向本轮初始化。读图时不要混。

## 6. 迭代：这一轮终局当下一轮初始化

三阶段扫出更好的前沿之后，点还可以拿来当下一轮 $\theta_{\mathrm{init}}$。这是 model recycling。Observation 6：迭代会把结果往上推，并收敛到一条更好的 Pareto。不是每轮都等幅涨。

Figure 4(c) 跑 $I=5$ 轮。每轮 $M=2$。第一轮 $T=9k$，第 2、3 轮 $T=7k$，再往后 $T=5k$，HTML 写的理由是算力。LITI 曲线对着自己的初始化画。每轮的 LITI 都在该轮 RL 轨迹上面。一轮比一轮好，几轮之后回报变小。

侧写对照在 Table 1。每条策略在一份 held-out prompt 上生成，按 Gemma 报告那套 side-by-side，分数跟 Gemini 1.5：much better / better / slightly better 分别记 $\pm 1.5$、$\pm 1$、$\pm 0.5$，平局 $0$。正分表示更好。数字从 HTML Table 1 原样抄。

| 方法 | Mistral 7B v1 | Mistral 7B v2 | Mixtral 8x7B |
|------|--------------:|--------------:|-------------:|
| Gemma `"7B"` 1.0 | $0.24$ | $-0.01$ | $-0.08$ |
| Gemma `"7B"` 1.1 | $0.37$ | $0.16$ | $0.08$ |
| REINFORCE EMA anchor | $0.37$ | $0.16$ | $0.07$ |
| WARP: 1st iter | $0.42$ | $0.23$ | $0.13$ |
| WARP: 2nd iter | $0.45$ | $0.25$ | $0.16$ |
| WARP: 3rd iter | $0.45$ | $0.26$ | $0.18$ |
| WARP: 4th iter | $0.45$ | $0.25$ | $0.16$ |
| WARP: 5th iter | $0.45$ | $0.24$ | $0.17$ |

对 Mixtral 8x7B，第三轮 $0.18$ 是表里最高，第四轮回到 $0.16$，第五轮 $0.17$。对两个 Mistral 7B，第三轮之后停在 $0.45$。HTML 正文写：第三轮之后结果停滞。不要把 $I=5$ 读成「轮数越多越好」。

![左栏 WARP 迭代策略并推理采 1；右栏 WARM 平均的是奖励模型](./images/fig-warp-iterate-not-warm.png)

> 图 2：左栏是 WARP 迭代。SFT 进「$M$ 份 REINFORCE + EMA」，SLERP 出 $\theta_{\mathrm{slerp}}$，LITI $\eta=0.3$ 交出下一轮初始化。虚线 recycle 从「next iteration init」回到迭代框，单向。底框是推理采 1。右栏是 WARM：共享 RM 初始化，两路 RM 微调，线性平均权重，得到的仍是一个 $r$。中间虚线只分栏。

**图 2 解析**

- 左栏五步都在改策略。推理框写 sample 1，对应「不再付 $N$ 次采样」。
- 右栏没有策略更新框。平均对象是 RM 权重。不要把右栏读成 WARP 的第四阶段。
- recycle 虚线只有一个箭头头，指向迭代框。不是策略和初始化互相反传。
- 没有 KL–reward 散点，没有临摹 Table 1。

零样本基准是 HTML Table 2，WARP 取第三轮，对照 Gemma `"7B"` 1.1。

| 方法 | MBPP | MMLU | GSM8K | MATH | HumanEval | BBH |
|------|-----:|-----:|------:|-----:|----------:|----:|
| Gemma `"7B"` 1.1 | $39.0$ | $56.4$ | $55.6$ | $25.6$ | $46.9$ | $53.1$ |
| WARP | $45.4$ | $57.6$ | $66.8$ | $31.0$ | $50.0$ | $58.8$ |

数学两列涨得最多：GSM8K $55.6\to 66.8$，MATH $25.6\to 31.0$。MMLU 只从 $56.4$ 到 $57.6$。HTML 读成分析能力更强。评测是 zero-shot。不要把这张表读成「WARP 取代了 Gemma 1.1 的全部后训练配方」；它是这篇对齐程序相对 1.1 发布点的对照。

Setup 数字也跟 HTML §4。对话 prompt 集 $\mathcal{X}$。温度 $0.9$，batch $128$，Adam，学习率 $10^{-6}$，warmup $100$ 步。除另行声明，$T=9k$，$\beta=0.1$，$\mu=0.01$，$M=2$，$\lambda=0.5$，$\eta=0.3$。RM 用手头最大的那只，因此没有 Gao 等、WARM 文里那种 oracle / control RM。低 KL 区这篇 RM 还像人偏好；离 SFT 远了会被黑。所以主文后半不用 RM 分单独报喜，改走 side-by-side 和基准。

## 7. 长度会涨，多样性和 KL 绑在一起

迭代会把回复写长。附录 Figure 18(a)：同一 KL 下，第三轮比第一轮更长。RM 偏好长回复，这是已知的长度偏置，不是 WARP 独有。缓解办法是在奖励里加长度惩罚 $-0.0005\times\mathrm{len}(y)$。带惩罚的那条轨迹明显更短。把它和一条不带惩罚的策略做 SLERP，长度被拉开，Pareto 也更好。HTML 把这读成：不同目标训出来的权更多样，合并有好处。和 Rewarded Soups 那条多目标插值是亲戚，不是同一篇算法。

附录 F 用 BLEURT 量同一策略、温度 $0.9$ 下两条生成的相似度。KL 相对 SFT 越大，两条生成越像。RLHF 掉多样性这件事，Kirk 等已经写过。WARP 没有把多样性单独优化进去；它优化的是奖励对 KL。KL 这边管住了，多样性作为预训练留下来的东西，会被 LITI 部分捞回。这是相关现象，不是新损失。

## 8. 不是 WARM，不是 J-BOND，不是解码 BoN

同一句「权重平均」，四件事不要混。

WARM 平均奖励模型。多份 RM 从共享预训练出发，超参和数据顺序不同，再线性插权重，推理仍是一个 $r$。目标是少被黑客、分布偏移更稳。WARP 文把自己写成对 WARM 的回应：合并用来学策略，WARM 用来做奖励。平均的对象不同。WARM 自己的胜率数字在那篇 ICML，不要抄进本篇 Table 1。

J-BOND 用 EMA 锚点，符号是 $\eta=0.02$。服务的是 Best-of-2 蒸馏：每 prompt 1 条策略样本加 2 条锚点，Jeffreys 混合前向 SFT 和二值分位数奖励。主文在 [09](../09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md)。WARP 的 EMA 是式 (1) 的动态 KL 锚。后面还有 SLERP 和 LITI，J-BOND 没有。09 的 $-\log 16$ 是两条锚点、中位数校准出来的，和这边无关。

解码 Best-of-$N$ 可以不更新权重。Gao、Schulman、Hilton 要的是代理 RM 过优化标度 $R(d)$。每次查询付 $N$ 次采样。过优化那条线在 [07](../07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md)。WARP 更新策略，推理采 1。它甚至不是在蒸馏 $\pi_{\mathrm{BoN}}$。目标分布匹配是 BOND 的事。

RAFT 更新，但只对 RM 的 $\arg\max$ 做 SFT，吃前向 KL。WARP 的底座是带 KL 的 REINFORCE，合并发生在权重空间，不在样本空间里挑冠军。

附近还有几篇也动权重平均，HTML §5 点名了区别。Noukhovitch 等把 EMA 当下一轮初始化，没有 SLERP，也没有把 EMA 写进 KL 锚。Gorbatovski 等、Nash-MD 把 EMA 当参考，用在直接偏好优化上。Rewarded Soups 用 LERP 拼多目标。Lin 等、Fu 等用合并减对齐税，但训练期没有 EMA 锚，没有合并多份被奖励推过的策略，也不迭代。HTML 的口径是：这些工作谁都没把「KL 当遗忘度量 + EMA 当 KL 锚 + SLERP + LITI 当下轮初始化」捆在一起。

| | 解码 BoN | RAFT | J-BOND | WARM | WARP |
|--|----------|------|--------|------|------|
| 平均什么 | 不平均 | 不平均 | 策略 EMA（锚点） | RM 权重 | 策略：EMA + SLERP + LITI |
| 更新策略 | 可以没有 | 只对 $\arg\max$ 做 SFT | 前向 SFT + 反向二值奖励 | 不直接更新 $\pi$ | REINFORCE + 三次合并 |
| 推理采样 | $N$ | $1$ | $1$ | 仍要策略自己采 | $1$ |
| 锚点 | 无 | 无 | EMA $\eta=0.02$ | 无（RM 侧） | EMA $\mu=0.01$ 当 KL 锚 |
| 球面插值 | 无 | 无 | 无 | 无（线性平均 RM） | 有，按层，任务向量 |

底座对照是 REINFORCE，不是 PPO。IPO、DPO、RAFT 在 HTML §2 里是「Pareto 上打不过 REINFORCE」的离线对照，不是本算法的组成模块。

## 9. 失效与边界

RM 在低 KL 区才像人偏好。离 SFT 远，代理分会撒谎。WARP 没有 oracle RM，Gao 那条金标掉头没有在这篇里复测。Table 1 / Table 2 是为了不把故事停在代理分上。代理 Pareto 好看，不等于金标也好看。

训练贵。每轮 $M$ 份 RL，还要迭代。HTML §3 自己写：test time 没有额外显存和延迟，训练很贵。§6 把这写成可并行的内层优化，类比 DiLoCo：Stage 1 是 worker 上的 inner step，Stage 2 合并，Stage 3 是学习率为 $\eta$ 的 outer SGD。开放协作、联邦、各留各的数据和 RM，只交换权重，这是讨论，不是实验。

第三轮之后 side-by-side 停滞。再加第 4、5 轮，Table 1 没有单调变好。回报递减写在 Observation 6 旁边，不是附录里才承认。

$\mu$ 太快，锚点贴着策略，动态教师和退火都变弱；太慢，策略被锁在旧锚附近。主文只系统跑了 $\mu=0.01$，附录另给 $0.005$。$\beta$ 与 $\mu$ 在 Figure 15 里可以互相替代一部分，不是正交的两维。

SLERP 对完整权重几乎没用。任务向量正交是前提。从零训练、不同架构，线性模式连通不成立，Git Re-Basin 那套不在本篇实验里。

长度惩罚系数 $-0.0005$ 是跟 Singhal 等的引用走的，不是扫出来的最优。不加权惩罚，迭代会把同一 KL 下的回复写得更长。

Gemma 实验的 prompt 集大小、RM 结构、训练步数以外的超参，HTML §4 没有给一张可复现的全表。Table 1 是偏好分数，不是胜率百分比。Table 2 是 zero-shot 点值，没有区间。

| 现象 | 原因 | 说明 |
|------|------|------|
| 把 WARP 写成 WARM | 字母差一个，都是 Ramé 组、都做权重平均 | 平均对象：策略 vs RM |
| 把 WARP 写成 J-BOND | 都有 EMA 锚点 | J-BOND 停在 EMA；WARP 还有 SLERP 和 LITI |
| 把 $-\log 16$ 抄进 WARP | 09 的中位数校准 | 本篇奖励是 $r_{\beta}$，没有这条二值 |
| 把三次平均缩成 EMA | Stage 1 最好写 | 没有 SLERP / LITI 就不是这篇算法 |
| 对完整 $\theta$ 做 SLERP | $\omega\approx 0^{\circ}$ | 退化为 LERP；要做任务向量 |
| 用 Model Stock 的 $\eta$ 公式 | $\Omega\approx 90^{\circ}$ | 更新被删成 $0$ |
| 先钉死 $\beta$ 再和 WARP 比终局奖励 | 尺子是 Pareto | Figure 3(b) / 4 比的是整条前沿 |
| $I=5$ 一定最好 | Table 1 第三轮后停滞 | 侧写在第 3 轮封顶 |
| 临摹 KL–reward 坐标 | 论文 Figure 1(b)、3、4 是训练曲线 | 本篇只抄表，不手绘假轴 |
| 把推理写成 Best-of-$N$ | 解码 BoN 在邻居 07 | 合并后采 1 |

邻居链：解码 BoN 与 $R(d)$ 在 [07-Best-of-N](../07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md)；蒸馏 $\pi_{\mathrm{BoN}}$、Jeffreys、J-BOND 的 $-\log 16$ 在 [09-BOND](../09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md)；只训 top-1 在 [07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)；序列级策略梯度在 [10-REINFORCE](../../4.4.1-基于奖励模型的RL-RLHF-PPO/10-REINFORCE-序列级策略梯度/10-REINFORCE-序列级策略梯度.md)。

## 参考文献

1. Ramé, A., Ferret, J., Vieillard, N., Dadashi, R., Hussenot, L., Cedoz, P.-L., Sessa, P. G., Girgin, S., Douillard, A., & Bachem, O. (2024). [WARP: On the Benefits of Weight Averaged Rewarded Policies](https://arxiv.org/abs/2406.16768). HTML：[arxiv.org/html/2406.16768](https://arxiv.org/html/2406.16768).
2. Ramé, A., Vieillard, N., Hussenot, L., Dadashi, R., Cideron, G., Bachem, O., & Ferret, J. (2024). [WARM: On the Benefits of Weight Averaged Reward Models](https://arxiv.org/abs/2401.12187). *ICML*. PMLR 235:42048–42073.（平均 RM；不是本算法）
3. Sessa, P. G., et al. (2024/2025). [BOND: Aligning LLMs with Best-of-N Distillation](https://arxiv.org/abs/2407.14622). *ICLR 2025*.（J-BOND 的 EMA 锚点同族；主算法不同）
4. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760). *ICML*.（解码 BoN 与 $R(d)$）
5. Dong, H., et al. (2023). [RAFT: Reward Ranked Finetuning](https://arxiv.org/abs/2304.06767). *TMLR*.（只训 top-1）
6. Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning.（REINFORCE）
7. Ahmadian, A., et al. (2024). [Back to Basics: Revisiting REINFORCE-style Optimization for RLHF](https://arxiv.org/abs/2402.14740).
8. Gemma Team. (2024). [Gemma: Open Models Based on Gemini Research and Technology](https://arxiv.org/abs/2403.08295).
9. Shoemake, K. (1985). Animating rotation with quaternion curves. *SIGGRAPH*.（SLERP）
10. Ilharco, G., et al. (2023). [Editing models with task arithmetic](https://arxiv.org/abs/2212.04089). *ICLR*.（任务向量）
11. Wortsman, M., et al. (2022). [Robust fine-tuning of zero-shot models](https://arxiv.org/abs/2109.01903). *CVPR*.（WiSE-FT / LITI）
12. Wortsman, M., et al. (2022). [Model soups](https://arxiv.org/abs/2203.05482). *ICML*.
13. Tarvainen, A., & Valpola, H. (2017). Mean teachers are better role models. *NeurIPS*.
14. Douillard, A., et al. (2023). [DiLoCo: Distributed Low-Communication Training of Language Models](https://arxiv.org/abs/2311.08105).（讨论中的内层/外层类比）
15. Ramé, A., et al. (2023). [Rewarded Soups](https://arxiv.org/abs/2306.04488). *NeurIPS*.（多目标 LERP；对照）
16. Lin, Y., et al. (2024). [Mitigating the Alignment Tax of RLHF](https://arxiv.org/abs/2309.06256).（LITI 减对齐税；无 EMA 锚）
17. Kirk, R., et al. (2024). Understanding the effects of RLHF on LLM generalisation and diversity. *ICLR*.
18. Singhal, P., et al. (2023). [A Long Way to Go: Investigating Length Correlations in RLHF](https://arxiv.org/abs/2310.03716).（长度惩罚 $-0.0005\times\mathrm{len}(y)$ 的出处）
