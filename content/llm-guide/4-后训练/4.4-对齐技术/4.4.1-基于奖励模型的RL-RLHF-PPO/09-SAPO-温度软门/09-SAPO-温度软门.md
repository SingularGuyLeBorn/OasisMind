---
title: "09 · SAPO：温度软门"
date: 2026-08-31
as_of: 2026-08-31
tags: [SAPO, GSPO, GRPO, RLHF, 软门, Qwen]
---

# 09 SAPO：温度软门

SAPO（Soft Adaptive Policy Optimization）把 GRPO / GSPO 的 hard clip 换成温度控制的 sigmoid 软门。门在重要性比率 $r=1$ 处峰值 1，偏离之后平滑衰减，不把梯度一刀切成 0。一手是 Qwen 的 Gao et al.，[arXiv:2511.20347](https://arxiv.org/abs/2511.20347)，2025 年 11 月。组内优势仍用奖励的 $z$-score，这一侧和 [02-GRPO](../02-GRPO/02-GRPO.md) 相同；序列级几何平均 $s_i$ 的 clip 在 [03-GSPO](../03-GSPO/03-GSPO.md)，本篇不重推。**不是** CISPO（clip 重要性权重再 stop-grad）。**不是** GMPO（几何平均压离群 token 比率）。**不是** 把 $\varepsilon$ 写成熵的滑动平均。

## 1. Hard clip 卡在宽窄之间

组相对这条流水线已经定了：一道题采 $G$ 条，$R_i$ 在组内标准化成 $\hat{A}_i$，再乘重要性比率去更新 $\pi_\theta$。比率仍是 token 级

$$
r_{i,t}(\theta)=\frac{\pi_\theta(y_{i,t}\mid q,y_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid q,y_{i,<t})},\qquad
\hat{A}_{i,t}=\hat{A}_i=\frac{R_i-\mathrm{mean}(\{R_j\})}{\mathrm{std}(\{R_j\})}. \tag{1}
$$

式 (1) 沿用 DeepSeekMath / GSPO 的写法。$\hat{A}$ 一条回答里共用；训练时一批 rollout 还会切成多个 mini-batch，$\pi_\theta$ 相对 $\pi_{\theta_{\mathrm{old}}}$ 已经 off-policy。$r_{i,t}$ 离 1 越远，这一项越不像「用旧策略的样本估当前策略」。MoE 上更明显：同一次更新之后专家路由会漂，token 比率的方差被再放大一档。GSPO 专文写过，48 层 Qwen3-30B-A3B-Base 一次更新大约 10% 专家对不齐。那是 03 的数，这里只借用「token 级 $r$ 会抖」这句话。

GRPO 的对策是逐 token hard clip。$r$ 落在 $[1-\varepsilon,1+\varepsilon]$ 里，梯度按未裁剪目标走；出带，这一项的代理梯度直接是 0。GSPO 把同一把闸挪到序列级 $s_i$ 上：整段留下或整段丢掉。闸本身干净。问题在宽窄。

收得太紧，进得了梯度的样本变少。放得太松，离 1 很远的 $r$ 仍按满权更新，噪声灌回来。论文把这写成 hard clipping 的脆性：稳和学，很难同时保住。GRPO 是 token 上全有或全无；GSPO 是整段全有或全无。两条都在「出带 = 梯度归零」这一刀上。GSPO 的带宽还特别窄，几何平均把 $s_i$ 钉在 1 附近，$3\times 10^{-4}$ 量级意味着稍微走偏整段就丢。那是 03 的超参，本篇只借用「闸一旦落下，旁边还干净的 token 也出不了校」这一层。

受控实验里一批 rollout 切四份再更新，和 GSPO 论文同一套。切完之后，正在更新的 $\pi_\theta$ 已经不是采样时的 $\pi_{\theta_{\mathrm{old}}}$，$r_{i,t}$ 天然会散。闸要挡的是这份散。挡在指示函数上，散得略过阈值就从 1 跳到 0；挡在 sigmoid 上，同一份散变成 $w$ 的连续下降。

SAPO 不换组、不换 $z$-score，只换这一刀。目标仍对 token 求和，但每个位置乘一个有界的、随 $r$ 连续变化的门，而不是 $\mathrm{clip}$ 的指示函数。

![hard clip 出带归零，软门在 r=1 处峰值后衰减](./images/fig-sapo-soft-gate.png)

> 图 1：左栏 GRPO / GSPO 的 hard clip。$r$ 进 $[1-\varepsilon,1+\varepsilon]$ 则保留梯度，出带则该项梯度为 0。右栏 SAPO 的 sigmoid 软门 $f=(4/\tau)\sigma(\tau(r-1))$，在 $r=1$ 处权重 $w=1$，偏离后平滑衰减，不画成坐标曲线。

**图 1 解析**

- 两栏都从浅蓝框 `ratio $r$` 往下，没有画 $r$ 对 $w$ 的假坐标。
- 左栏黄框是 clip 带。实线进绿框 `inside: keep gradient`；虚线进红框 `outside: gradient = 0`。虚线表示排除，不是第二条数据流。
- 右栏橙框写出式 (3) 的 $f$。实线进绿框：$r=1$ 时 $w=4p(1-p)=1$。虚线进紫框：离 1 远则平滑衰减。
- 读图时不要把右栏当成论文 Figure 1 的曲线翻拍。那张图是代理目标和 $w$ 对 $r$ 的函数图像；本图只标闸门插在哪。

## 2. 门的公式：$f$ 和 $w$

SAPO 最大化

$$
\mathcal{J}(\theta)
=\mathbb{E}_{q\sim\mathcal{D},\,\{y_i\}\sim\pi_{\theta_{\mathrm{old}}}}
\Biggl[
\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}
f_{i,t}\bigl(r_{i,t}(\theta)\bigr)\,\hat{A}_{i,t}
\Biggr]. \tag{2}
$$

门是温度控制的 sigmoid，自变量是「离 on-policy 有多远」：

$$
f_{i,t}(x)=\frac{4}{\tau_{i,t}}\,\sigma\bigl(\tau_{i,t}(x-1)\bigr),\qquad
\tau_{i,t}=\begin{cases}
\tau_{\mathrm{pos}}, & \hat{A}_{i,t}>0,\\
\tau_{\mathrm{neg}}, & \text{otherwise,}
\end{cases}
\qquad \sigma(u)=\frac{1}{1+e^{-u}}. \tag{3}
$$

式 (3) 跟论文式 (6) 同一条。$\tau$ 按优势正负分档，不是一个全局常数。$\sigma$ 在 0 处取值 $1/2$，所以 $r=1$ 时 $f=2/\tau$。这是代理目标的数值，不是梯度权重。对 $\theta$ 求导之后，真正乘在 $\nabla\log\pi$ 前面的是另一项。

链式法则用 $\nabla_\theta r=r\nabla_\theta\log\pi$。式 (2) 对 $\theta$ 的梯度写成

$$
\nabla_\theta\mathcal{J}
=\mathbb{E}\Biggl[
\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}
w_{i,t}(\theta)\,r_{i,t}(\theta)\,
\nabla_\theta\log\pi_\theta(y_{i,t}\mid q,y_{i,<t})\,\hat{A}_{i,t}
\Biggr], \tag{4}
$$

其中

$$
w_{i,t}(\theta)=4\,p_{i,t}(1-p_{i,t}),\qquad
p_{i,t}=\sigma\bigl(\tau_{i,t}(r_{i,t}-1)\bigr). \tag{5}
$$

$p(1-p)$ 在 $p=1/2$ 时最大，值 $1/4$，乘 4 之后峰值恰好是 1。$r=1$ 时 $p=1/2$，与 $\tau$ 无关，$w=1$，再乘 $r=1$，软门梯度等于未裁剪目标 $r\hat{A}$。这就是 $4/\tau$ 写进 $f$ 里的原因：$\sigma'(0)=1/4$，$\frac{\mathrm{d}}{\mathrm{d}x}\sigma(\tau(x-1))$ 在 $x=1$ 处是 $\tau/4$，再乘 $4/\tau$，导数值钉在 1。换温度只改「离开 1 之后掉得多快」，不改 on-policy 点的步长。

$\tau$ 越大，sigmoid 越陡，$w$ 作为 $r$ 的函数越窄。同一处 $r=1.8$，$\tau=1$ 时 $p=\sigma(0.8)\approx 0.69$，$w\approx 0.86$；$\tau=1.05$ 时 $p=\sigma(0.84)\approx 0.70$，$w$ 略小。差在小数上。论文默认 $\tau_{\mathrm{pos}}=1.0$、$\tau_{\mathrm{neg}}=1.05$，本来就不是两个差很远的数。方向对：负侧更陡一点。幅度不要自行改成 $2$ 和 $8$。Figure 5 证明这 0.05 的差已经够改变崩溃与否；再把 $\tau$ 拉到 2 以上，门会窄到几乎只承认 $r=1$，论文没有这样的消融。

用 $\tau=1$ 走几个点，只为看衰减形状，不是论文表。$r=1$，$w=1$。$r=1.5$，$p=\sigma(0.5)\approx 0.62$，$w\approx 0.94$。$r=2$，$p=\sigma(1)\approx 0.73$，$w\approx 0.79$。$r=3$，$p=\sigma(2)\approx 0.88$，$w\approx 0.42$。hard clip 若 $\varepsilon=0.2$，这四个点里后三个在 GRPO 正优势侧已经出带，梯度是 0。SAPO 仍给一个小于 1 的权。出带的学习信号没有被闸死，只是被压扁。

实现时 $p$ 用 `sigmoid(tau * (r - 1))`，$w=4*p*(1-p)$。$\tau$ 按 $\hat{A}$ 的符号广播成和 $r$ 同形的张量。最大化式 (2) 时损失取 $-f\cdot\hat{A}$ 再按 mask 平均。不要把 $w$ 再乘进代理目标里：$w$ 是 $f$ 对 $r$ 的导数，反传会自己长出来。

```python
tau = torch.where(adv > 0, tau_pos, tau_neg)
p = torch.sigmoid(tau * (r - 1.0))
f = (4.0 / tau) * p
policy_loss = -(f * adv * response_mask).sum() / response_mask.sum().clamp_min(1)
```

$w=4p(1-p)$ 由反传从 $f$ 长出，不要再乘进损失。`tau_pos=1.0`、`tau_neg=1.05` 是论文 §5.1 的默认。mask 只含回答 token。prompt 位没有优势，混进平均会把 $f$ 往 $r=1$ 的取值拉。

## 3. 负优势为什么要更热

正更新和负更新对 logits 的推法不对称。记 $z$ 为词表上的 logits，$\pi=\mathrm{softmax}(z)$。把 $\log\pi(y_{i,t})\hat{A}$ 对某个词 $v$ 的 logit 求导，论文式 (9) 得到

$$
\frac{\partial\log\pi(y_{i,t})\,\hat{A}}{\partial z_v}
=\begin{cases}
(1-\pi(y_{i,t}))\,\hat{A}, & v=y_{i,t},\\
-\pi(v)\,\hat{A}, & v\neq y_{i,t}.
\end{cases} \tag{6}
$$

$\hat{A}>0$ 时，采样到的那个 token 的 logit 被抬高，其余词被压低。$\hat{A}<0$ 时反过来：采样到的词被压，**没采到的那一大片** logit 被抬起来。LLM 词表常是十几万到几十万，某一步真正该走的词很少。负梯度会扩散到大量不相干的 token 上。论文把这写成：负更新比正更新更容易引入不稳，尤其在已经 off-policy 的时候。

于是 $\tau_{\mathrm{neg}}>\tau_{\mathrm{pos}}$。$\tau$ 更大，门更窄，负侧的 $w$ 离开 $r=1$ 掉得更快。正侧留宽一点，让「答对了、比率还靠近 1」的 token 多走几步。负样本仍要：没有它们，策略容易过拟合、探索没了。只是权重要先收。

![正优势 τ_pos 与负优势 τ_neg 两条门](./images/fig-sapo-tau-pos-neg.png)

> 图 2：重要性比率 $r$ 先看 $\hat{A}$ 的符号。正优势走 $\tau_{\mathrm{pos}}=1.0$，衰减更慢；负优势走 $\tau_{\mathrm{neg}}=1.05$，衰减更快。两路再合成带门的策略梯度。

**图 2 解析**

- 顶上蓝框是 $r$，黄框是 $\mathrm{sign}(\hat{A})$，不是第二套比率。
- 左栏虚线组：$\hat{A}>0$，$\tau_{\mathrm{pos}}=1.0$，绿框写 slower decay。
- 右栏虚线组：$\hat{A}\le 0$，$\tau_{\mathrm{neg}}=1.05$，橙框写 faster decay。
- 底栏紫框是式 (4) 那种 $w\,r\,\nabla\log\pi\,\hat{A}$。两条实线都进它，没有反馈环。
- $\tau$ 的两个默认值写在框里，和 §5.1 一致，不是图装饰。

Chen et al. 2023 在传统 RL 里讨论过 soft clipping。SAPO 把它接到 LLM 的组相对范式上，并加上「token 级软信赖域」和「正负温度拆开」两件。不要把 2023 那篇 AAAI 的超参抄到这里当 $\tau_{\mathrm{pos}}$。传统控制里动作维往往是连续向量；这里动作是词表上的离散选择，负梯度的扩散面积差了几个数量级，所以才单独给负侧加温。词表越大，这件事越刺耳。

## 4. 小步时，平均门像连续版 GSPO

GSPO 的序列比率是长度归一化几何平均 $s_i=\exp(\mathrm{mean}_t\log r_{i,t})$，clip 打在 $s_i$ 上。公式和窄带 $3\times 10^{-4}/4\times 10^{-4}$ 在 [03-GSPO](../03-GSPO/03-GSPO.md)，这里不重推。SAPO 的门仍按 token 算。论文 §4.1 给了一个极限：小步、且一条里 $\log r$ 的方差不大时，token 门的平均会收成序列级的 $\mathrm{sech}^2$ 门。

对式 (3) 求导，用 $\sigma(1-\sigma)=\tfrac14\mathrm{sech}^2(\cdot/2)$，

$$
f'_{i,t}(r)=\mathrm{sech}^2\Bigl(\frac{\tau_{i,t}}{2}(r-1)\Bigr). \tag{7}
$$

两条常用假设。**(A1)** 小步 / 近 on-policy：$r_{i,t}\approx 1$，于是 $\log r\approx r-1$。**(A2)** 序列内分散低：记 $z_{i,t}=\log r_{i,t}$，$\mu_i=\mathrm{mean}_t z_{i,t}=\log s_i$，方差 $\mathrm{Var}_i=\mathrm{mean}_t(z_{i,t}-\mu_i)^2$ 对多数序列很小。A1 之下式 (7) 换成 $g_\tau(z)=\mathrm{sech}^2(\tau z/2)$。再把 $g_\tau$ 在 $\mu_i$ 处做二阶展开，对 $t$ 平均后一次项消失，余项被 $\sup|g''|=\tau^2/2$ 控制：

$$
D_i=\Bigl|\mathrm{mean}_t\,g_{\tau}(z_{i,t})-g_{\tau}(\log s_i)\Bigr|
\le \frac{\tau^2}{4}\,\mathrm{Var}_i. \tag{8}
$$

$\mathrm{Var}_i$ 小，$D_i$ 小，平均 token 门就贴近

$$
g_\tau(\log s_i)=\mathrm{sech}^2\Bigl(\frac{\tau}{2}\log s_i\Bigr). \tag{9}
$$

式 (9) 是连续的序列级门。GSPO 在 $s_i$ 出带时把整段梯度关掉；这里 $s_i$ 离 1 时门连续往下掉，没有断点。论文把这叫做 sequence-coherent：奖励是序列级的，平均更新在小步时也像序列级。

假设经常成立。论文 Figure 2、3 用冷启动的 Qwen3-30B-A3B（MoE）和 Qwen3-4B（稠密），统计超过 $10^{5}$ 条序列、$10^{9}$ 个 token，样本来自 off-policy mini-batch。观察是：$r_{i,t}$ 尖峰集中在 1 附近；$\mathrm{Var}_i$ 通常低于 $0.02$。MoE 的方差分布更宽（路由异构），稠密模型更尖。这些是直方图和散点上的说法，正文没有另给一张均值表。不要把 $0.02$ 写成「所有序列的方差等于 0.02」。

假设破的时候，SAPO 和 GSPO 的差别才尖锐。个别 token 的 $r$ 飞出去，会把 $s_i$ 拽出 GSPO 的窄带，**整段** $\nabla\log\pi$ 被 clip 掉，旁边那些仍靠近 1 的 token 一起退学。SAPO 只压那些离群位置的 $w$，近 on-policy 的 token 还在贡献梯度。论文把这写成 token-adaptive，并用来解释样本效率：同一条里，坏 token 不必绑架好 token。

用四个位置把这层差看清，不是论文表。设 $r=(1.02,\,1.01,\,0.99,\,2.5)$。对数均值 $\mathrm{mean}\log r\approx 0.234$，几何平均 $s\approx 1.26$。GSPO 右沿 $1+4\times 10^{-4}=1.0004$，$s$ 早已出带，四个位置的梯度一起停。SAPO 取 $\tau=1$：前三个 $r$ 离 1 不到 $0.03$，$w$ 仍接近 1；第四个 $p=\sigma(1.5)\approx 0.82$，$w=4\times 0.82\times 0.18\approx 0.59$。三个近 on-policy 的 token 还在更新，只有飞掉的那一个被压。这就是「连续版 GSPO」这句话的边界：平均门可以像序列级，判决却不必整段执行。

这不是「SAPO 等于 GSPO 再把 clip 抹圆」。未满足 A1/A2 时，它就是逐 token 软门；满足时，平均行为像连续版 GSPO。两条都要，缺一条就读成别的算法。

## 5. 不是 CISPO，不是 GMPO，不是滑动 $\varepsilon$

邻居很容易并成「又一个改 clip 的」。插槽不同。

**不是 CISPO。** MiniMax-M1（[arXiv:2506.13585](https://arxiv.org/abs/2506.13585)）的 CISPO 是 Clipped IS-weight Policy Optimization：把 clip 加在重要性权重上，再 $\mathrm{sg}(\mathrm{clip}(r))$，梯度从 $\log\pi_\theta$ 走。出带的 token 不会像 GRPO 那样被 $\min$ 掉、梯度归零；权重当常数系数。SAPO 没有 stop-grad 这一层，门是 $r$ 的可微函数，$w=4p(1-p)$ 会随 $r$ 变。不要把 sigmoid 软门说成 CISPO，也不要把 CISPO 说成「soft clip」。

**不是 GMPO。** [01-GMPO](../01-GMPO/01-GMPO.md) 把 token 级加权奖励的算术平均换成几何平均，clip 仍打在每个 $\rho_t$ 上，默认窗 $(e^{-0.4},e^{0.4})$。它压的是离群比率对**算术平均**的过敏。SAPO 不换聚合算子，换的是「出带之后权重是 0 还是平滑掉下来」。未 clip 时 GMPO 看起来也像「$\hat{A}$ 乘几何平均」，那是另一篇的式；本篇的 $f(r)$ 不是几何平均。

**不是** 「$\varepsilon$ 随熵的滑动平均变大变小」。有的课设会把 clip 宽写成策略熵的函数，训练前期松、后期紧。SAPO 的 $\tau$ 是正负两档超参，论文默认钉死 $1.0$ 和 $1.05$，消融也只动这两档的相对大小，没有把 $\tau$ 写成 $\bar{H}$ 的滑动平均。Figure 5 的三组是 $(\tau_{\mathrm{neg}},\tau_{\mathrm{pos}})=(1.05,1.0)$、$(1.0,1.0)$、$(0.95,1.0)$，不是一条随时间滑动的 $\varepsilon(t)$。

**不是 GSPO 的替换实现。** GSPO 只作对照。序列几何平均、对 $s_i$ hard clip、MoE 上可不做 routing replay，那些机制以 03 为准。SAPO 在小步极限下**像**连续 GSPO；个别 token 离群时它并不整段 clip。超参也不共用：不要把 GSPO 的 $3\times 10^{-4}$ 填进 $\tau$，也不要把 $\tau=1.05$ 填进 $s_i$ 的带宽。

GRPO 的 hard 门在论文式 (24) 里是指示函数：正优势且 $r\le 1+\varepsilon$ 时 $f'=1$，否则在出带侧 $f'=0$（负优势对称）。SAPO 把这个 $0/1$ 换成式 (7) 的 $\mathrm{sech}^2$。同一 $r$，GRPO 要么满权要么零，SAPO 给一个介于 0 和 1 之间的数。

| 算法 | 闸门打在哪 | 出界之后 |
|------|------------|----------|
| GRPO | 每个 $r_{i,t}$ hard clip | 该项梯度 0 |
| GSPO | 序列 $s_i$ hard clip | 整段梯度 0 |
| CISPO | clip 后的 IS 权重 + stop-grad | 权重冻结，梯度仍走 $\log\pi$ |
| GMPO | 每个 $\rho_t$ clip，再几何平均 | 离群被窗削，仍按 token 聚合 |
| SAPO | 每个 $r_{i,t}$ 的 sigmoid 门 | $w$ 连续衰减；负侧 $\tau$ 更大 |

## 6. 实验：协议能对账，曲线终点不要估

受控实验从 **Qwen3-30B-A3B-Base** 冷启动，数学推理题上做 RL。对照是 GSPO，以及 GRPO-R2（GRPO 加上 routing replay）。SAPO 默认 $\tau_{\mathrm{pos}}=1.0$、$\tau_{\mathrm{neg}}=1.05$。一批 rollout 切成 **4** 个 mini-batch 做梯度更新，超参配置与 GSPO 论文 Zheng et al. 2025 对齐。验证报的是 AIME25、HMMT25、BeyondAIME 上 **16 次采样的平均 Pass@1**（average Pass@1 over 16 samples）。

论文 Figure 4 画训练奖励和这三条验证曲线。正文的判断是：SAPO 更稳、最终表现更高；GSPO 与 GRPO-R2 出现早期训练崩溃。SAPO **不依赖** routing replay 来稳住或拉分。这些句子挂在 Figure 4 上。HTML / PDF **没有**把三条基准的终点 Pass@1 写成表格数字。本篇不从曲线上估坐标，也不编「提高了若干个百分点」。分母要写清：这里是 avg Pass@1 @16，不要和 GSPO 专文里 AIME'24 的 32 次平均、LiveCodeBench 的 8 次平均混成一个评测设定。

温度消融是 Figure 5，同一冷启动底座，只改 $\tau$。三档：$\tau_{\mathrm{neg}}=1.05>\tau_{\mathrm{pos}}=1.0$（最稳），$\tau_{\mathrm{neg}}=\tau_{\mathrm{pos}}=1.0$，以及 $\tau_{\mathrm{neg}}=0.95<\tau_{\mathrm{pos}}=1.0$（明显不稳）。结论写在正文：负 token 的梯度对崩溃贡献更大，$\tau_{\mathrm{neg}}>\tau_{\mathrm{pos}}$ 能压这件事。同样没有表内百分数。实现里若把负侧温度设得比正侧更小，是在对着 Figure 5 最差的那条走。

Qwen3-VL 是另一组大规模实验。论文写：SAPO 用在 Qwen3-VL 系列上，跨尺寸、跨 MoE / 稠密，文理混合（数学、代码、逻辑）。多任务时每个 batch 里各任务采样比固定，避免某一任务在 mini-batch 里消失；大批次，一批 rollout 切成 **2** 个 mini-batch，让每个 mini-batch 对所有任务都还能提供学习信号。切 2 份而不是受控实验的 4 份，是多任务设定下的选择，不要把两个切分抄成同一个超参。为了和 GSPO、GRPO-R2 对照，他们从 Qwen3-VL-30B-A3B 的一份初步冷启动 checkpoint 再训。验证四条：AIME25（Pass@1，**32** 次采样）、LiveCodeBench v6（Pass@1，**8** 次采样）、ZebraLogic、MathVision。Figure 6 的判断是：同等算力下 SAPO 持续上涨，并高于两条基线。四条的终点数字同样只在图上，正文没有抄成表。引用时写「Figure 6 / 评测分母」，不要写成具体 Pass@1。ZebraLogic 与 MathVision 的采样次数正文没单列，不要把 32 或 8 自动安到这两条上。

摘要和结论还说：所有方法最终都可能出现不稳的迹象；SAPO 能把可学习的时间拉长，在发散之前走到更高的 Pass@1。这是曲线形状上的说法，不是一张「永不崩溃」的保证。

| 项 | 论文写法 |
|----|----------|
| 全称 | Soft Adaptive Policy Optimization |
| 来源 | arXiv:2511.20347，Qwen Team，2025-11 |
| 受控起点 | Qwen3-30B-A3B-Base 冷启动 |
| 对照 | GSPO；GRPO-R2（routing replay） |
| $\tau$ 默认 | $\tau_{\mathrm{pos}}=1.0$，$\tau_{\mathrm{neg}}=1.05$ |
| 受控切分 | 一批切 4 个 mini-batch |
| 受控验证 | AIME25 / HMMT25 / BeyondAIME，avg Pass@1 @16 |
| 假设统计 | $>10^{5}$ 序列、$10^{9}$ token；$\mathrm{Var}_i$ 通常 $<0.02$ |
| VL 对照起点 | Qwen3-VL-30B-A3B 初步冷启动 |
| VL 切分 | 一批切 2 个 mini-batch |
| VL 验证 | AIME25 Pass@1 @32；LCB v6 Pass@1 @8；ZebraLogic；MathVision |

## 7. 失效和边界

软门不是万能的。$w$ 在 $r$ 很远时仍是正的，极端 off-policy token 不会像 hard clip 那样被清零。残差噪声还在。$\tau$ 若设得过小，门几乎不衰减，退回未裁剪的 $r\hat{A}$；过大，门缩成 $r=1$ 附近的尖峰，策略几乎不更新。论文没给一张「$\tau$ 扫到 0.1 和 10」的表，默认只在 $1.0$ 附近动小数。

组内 $z$-score 的旧病原样继承。全对全错时 $\mathrm{std}\to 0$，难度偏差、长度分母，都是 02 的事。SAPO 没改式 (1) 的 $\hat{A}$。Dr. GRPO / DAPO 冲的是另一侧。不要指望换了门，组统计就干净了。

$\hat{A}_{i,t}$ 在论文实验里整段共用。式 (2) 虽然写成 $\hat{A}_{i,t}$，受控设定与 GRPO 一样是结果监督。逐步奖励、过程监督要把不同 $t$ 的优势接进来，公式位置在 $\hat{A}_{i,t}$，门仍看 $r_{i,t}$。信用怎么沿 CoT 分配，SAPO 不管。GSPO-token 那种「数值广播 $s_i$、梯度 detach」是 03 的装置，不要和式 (3) 的 $f(r)$ 焊在一起。

负侧温度设反了，Figure 5 已经画过结局。$\tau_{\mathrm{neg}}<\tau_{\mathrm{pos}}$ 让负梯度在离 1 较远时仍保有较宽的门，词表上那一大片未采样 logit 会被推得更狠。论文用同一冷启动底座做了三档，最不稳的就是 $0.95<1.0$ 那条。调参时若只记得「温度越大越平滑」而把正侧加温、负侧降温，方向反了。更大的 $\tau$ 是更窄的门，不是更软的更新。

MoE 上 SAPO 声称不必靠 routing replay。这不等于专家负载、塌缩、容量通信被它修掉。那些仍在第 2 章 MoE。Replay 从这条路径拿掉，只说明 token 软门加序列相干，够论文里的冷启动 MoE 跑完 Figure 4；换更深的 MoE、更长的 CoT，没有另给失败案例表。

崩溃仍可能发生。论文自己写 all methods may ultimately exhibit signs of instability。软门拉长的是稳定段，不是消除奖励黑客、验证器噪声、题集泄漏。那些不在 2511.20347 的修复范围。

实现上还有两处和公式错位。第一，$\tau$ 必须按当前 token 的 $\hat{A}$ 选，不能整 batch 一个温度。正负混用同一个 $\tau=1$，对应 Figure 5 中间那档，能跑，但不是论文推荐。第二，$r$ 要用 $\exp(\log\pi-\log\pi_{\mathrm{old}})$，先减后 $\mathrm{exp}$，并在 float32 上算；$f$ 里的 $4/\tau$ 对 $\tau$ 接近 0 会炸，所以 $\tau$ 不要当成可学习到负数的参数。

怎么选。已经在跑 GRPO，日志里 token 比率出带就整段信号被闸死、又觉得 GSPO 整段 clip 太亏：优先试 SAPO 的门，组统计不用动。MoE 上 token IS 方差炸掉、只想改 IS 粒度：先读 03，不要把 $\tau$ 填进 $s_i$。算术平均被离群 $\rho$ 绑架、想把窗开到 $e^{\pm 0.4}$：那是 01。IS 权重 clip 再 stop-grad、要对齐 MiniMax-M1：那是 CISPO，公式见第 5 节对照表。还要 Critic / GAE：回 [04-PPO](../04-PPO/04-PPO.md)。

## 8. 收束

SAPO 留下 GRPO 的组内相对优势，把 hard clip 换成式 (3) 的温度 sigmoid。梯度权重是式 (5) 的 $w=4p(1-p)$，在 $r=1$ 处为 1；负优势默认更热，$\tau_{\mathrm{neg}}=1.05>\tau_{\mathrm{pos}}=1.0$。小步且序列内 $\log r$ 方差低时，平均门收成 $\mathrm{sech}^2$ 的序列级形状，像连续版 GSPO；个别 token 离群时只压那些位置。受控实验从 Qwen3-30B-A3B-Base 冷启动，对照 GSPO 与 GRPO-R2，验证是 avg Pass@1 @16；同一套门后来用在 Qwen3-VL。正文能钉住的是机制、超参和评测分母，不是 Figure 4/6 曲线上的百分数。没有两全其美：软门保住出带附近的信号，极端 $r$ 也就不会被清零。序列级 $s_i$ 回 [03-GSPO](../03-GSPO/03-GSPO.md)；几何平均压离群比率回 [01-GMPO](../01-GMPO/01-GMPO.md)。

## 参考文献

1. Gao, C., Zheng, C., Chen, X.-H., Dang, K., Liu, S., Yu, B., Yang, A., Bai, S., Zhou, J., & Lin, J. (2025). *Soft Adaptive Policy Optimization*. arXiv:2511.20347. https://arxiv.org/abs/2511.20347
2. Zheng, C., et al. (2025). *Group Sequence Policy Optimization*. arXiv:2507.18071. https://arxiv.org/abs/2507.18071
3. Shao, Z., et al. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300. https://arxiv.org/abs/2402.03300
4. MiniMax. (2025). *MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention*. arXiv:2506.13585. https://arxiv.org/abs/2506.13585 （CISPO：clip IS 权重 + stop-gradient）
5. Zhao, Y., et al. (2025). *Geometric-Mean Policy Optimization*. arXiv:2507.20673. https://arxiv.org/abs/2507.20673
6. Chen, X., et al. (2023). *The Sufficiency of Off-Policyness and Soft Clipping: PPO Is Still Insufficient According to an Off-Policy Measure*. AAAI 2023.
7. Team Qwen. (2025). *Qwen3 Technical Report*. arXiv:2505.09388.
8. Schulman, J., et al. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347.
