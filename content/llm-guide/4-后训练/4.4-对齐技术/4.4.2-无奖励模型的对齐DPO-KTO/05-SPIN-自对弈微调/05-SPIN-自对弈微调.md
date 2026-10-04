---
title: "05 · SPIN: 自对弈微调"
published: true
tags: ["SPIN", "自对弈", "DPO", "SFT", "无奖励模型"]
excerpt: "SPIN (Self-Play fIne-tuNing) 从已经 SFT 过的模型继续训练, 不新增人工标注: 主玩家区分人写的 y 和上一轮模型生成的 y', 对手就是上一轮的自己."
---
# 05 SPIN: 自对弈微调

Chen, Deng, Yuan, Ji, Gu 的 *Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models* ([arXiv:2401.01335](https://arxiv.org/abs/2401.01335), ICML 2024) 处理的问题是: 模型已经在一份 SFT 数据上训过, 不再新增人工或 AI 标注, 能否从同一份数据里继续提升. 公式和数字以 [arXiv HTML](https://arxiv.org/html/2401.01335) 为准, DPO 的推导见 [01-DPO](../01-DPO/01-DPO.md); 论文用 $\mathbf{x},\mathbf{y}$ 和 $\bm{\theta}$ 等粗体记号, 下文简写为 $x,y,\theta$.

## 1. SFT 之后还剩什么

### 1.1 SFT 的极限

监督微调把预训练模型推向人写回答的分布 $p_{\mathrm{data}}$. prompt $x$ 来自 $q(\cdot)$, 回答 $y$ 来自 $p_{\mathrm{data}}(\cdot\mid x)$, 负对数似然是

$$
L_{\mathrm{SFT}}(\theta)
=
-\mathbb{E}_{x\sim q(\cdot),\,y\sim p_{\mathrm{data}}(\cdot\mid x)}
\bigl[\log p_\theta(y\mid x)\bigr].
\tag{1}
$$

式 (1) 的最小值在 $p_\theta=p_{\mathrm{data}}$ 处取到. 论文的起点模型是 zephyr-7b-sft-full, 即 Mistral-7B 在 UltraChat200k 上 SFT 1 个 epoch 的结果. 论文指出, 在这样的模型上继续用同一份数据做式 (1), 不但无效, 还可能变差. 附录 Table 5 中, 再训 1 个 epoch 后平均分从 58.14 降到 57.23. Figure 5 的对照里, Mistral-7B 在 UltraChat200k 上 SFT 到第 2, 第 3 个 epoch, 相对第 1 个 epoch 的提升不到 1%.

### 1.2 差距仍在

SFT 数据里的信息并没有被模型完全学到. 论文 Figure 1 给了一个例子: 同一条关于南安普顿交通方式的 prompt, iter-0 的生成很流利, 却给各种交通方式编了具体的百分比, 很可能是幻觉; 人写回答只做了定性概括. iter-1 的生成改成了不带具体百分比的定性描述, 更接近人写回答, 还补充了细节.

这说明模型的生成分布和 $p_{\mathrm{data}}$ 之间还有可以利用的差距. 缺的是新的训练信号. 没有成对偏好, DPO 的 $(y_w,y_l)$ 凑不齐; 没有奖励模型, [PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md) 也跑不起来. SPIN 的办法是: 用模型自己的生成当反例, 人写回答当正例, 从同一份 SFT 数据里再造出对比信号.

## 2. 自对弈的两个玩家

### 2.1 主玩家

记第 $t$ 轮的对手为 $p_{\theta_t}$. 对 SFT 数据里的每条 $x$, 从 $p_{\theta_t}(\cdot\mid x)$ 采样得到 $y'$. 主玩家 $f_{t+1}$ 的任务是给人写回答 $y$ 打高分, 给生成回答 $y'$ 打低分. 论文从积分概率度量 (IPM) 出发, 先写成最大化期望差:

$$
f_{t+1}
=
\mathop{\mathrm{argmax}}_{f\in\mathcal{F}_t}
\mathbb{E}\bigl[f(x,y)-f(x,y')\bigr],
\tag{2}
$$

期望对 $x\sim q$, $y\sim p_{\mathrm{data}}$, $y'\sim p_{\theta_t}$ 取. 线性目标没有上界, 一直训练会把 $f(x,y')$ 推向负无穷. 换成单调递减的凸函数 $\ell$:

$$
f_{t+1}
=
\mathop{\mathrm{argmin}}_{f\in\mathcal{F}_t}
\mathbb{E}\bigl[\ell\bigl(f(x,y)-f(x,y')\bigr)\bigr].
\tag{3}
$$

SPIN 取 logistic 损失 $\ell(t)=\log(1+\exp(-t))$. 它非负, 光滑, $t\to\infty$ 时指数衰减到 0, 不会让分数无限增长.

### 2.2 对手

对手要生成让主玩家难以区分的回答, 同时不能离上一轮太远. 带 KL 的目标是

$$
\max_{p}\;
\mathbb{E}_{x\sim q,\,y\sim p(\cdot\mid x)}
\bigl[f_{t+1}(x,y)\bigr]
-
\lambda\,\mathbb{E}_{x\sim q}
\mathrm{KL}\bigl(p(\cdot\mid x)\,\Vert\,p_{\theta_t}(\cdot\mid x)\bigr).
\tag{4}
$$

$\lambda>0$ 控制离 $p_{\theta_t}$ 多远. 它和 RLHF 的 KL 约束形状相同, 区别在于参考分布是上一轮模型, 而非固定的 SFT 模型. 闭式解是

$$
\widehat p(y\mid x)
\propto
p_{\theta_t}(y\mid x)
\exp\bigl(\lambda^{-1}f_{t+1}(x,y)\bigr).
\tag{5}
$$

### 2.3 把主玩家限制在对数比里

希望 $\widehat p$ 仍然是一个语言模型. 反解式 (5), $f$ 只能是对数比的形式, 于是令主玩家的函数类为

$$
\mathcal{F}_t
=
\Bigl\{\lambda\log\frac{p_\theta(y\mid x)}{p_{\theta_t}(y\mid x)}\Bigm|\theta\in\Theta\Bigr\}.
\tag{6}
$$

优化式 (3) 得到的主玩家是

$$
f_{t+1}(x,y)
=
\lambda\log\frac{p_{\theta_{t+1}}(y\mid x)}{p_{\theta_t}(y\mid x)}.
\tag{7}
$$

代回式 (5) 得 $\widehat p=p_{\theta_{t+1}}$. 主玩家训练完成后, 它的权重直接成为下一轮的对手, 不需要单独训练一个判别器. 这是 SPIN 和 GAN 一类方法的主要区别: GAN, GAIL 每轮要分别训练判别器和生成器; SPIN 的两个角色都是同一个语言模型在相邻两轮的版本.

### 2.4 一轮的执行顺序

一轮分两步, 两个角色不同时更新. 第一步, 冻结 $p_{\theta_t}$, 对全部 $N$ 条 prompt 采样得到 $y'_i$. 第二步, 最小化式 (8) 的经验平均, 得到 $\theta_{t+1}$. 第二步中 $p_{\theta_t}$ 只提供参考对数概率, 不更新, 这和 DPO 冻结 $\pi_{\mathrm{ref}}$ 一样. 第一步和第二步交替进行.

iter-0 指第一次用 SFT 模型生成 $y'$ 并训练, 得到 $p_{\theta_1}$. 论文 Algorithm 1 的循环从 $t=0$ 开始, $t=0$ 时的对手就是 SFT 模型. iter-0 本身就带来了 2.66 的平均分提升.

## 3. 训练损失

### 3.1 损失函数

把式 (6) 代入式 (3):

$$
L_{\mathrm{SPIN}}(\theta,\theta_t)
=
\mathbb{E}
\Biggl[
\ell
\Biggl(
\lambda\log\frac{p_\theta(y\mid x)}{p_{\theta_t}(y\mid x)}
-
\lambda\log\frac{p_\theta(y'\mid x)}{p_{\theta_t}(y'\mid x)}
\Biggr)
\Biggr].
\tag{8}
$$

期望对 $(x,y)\sim p_{\mathrm{data}}$, $y'\sim p_{\theta_t}$ 取. 取 logistic 时 $\ell(\Delta)=-\log\sigma(\Delta)$, 式 (8) 和 DPO 的损失形式完全一样. 区别在三个位置的取值: 胜者是人写回答 $y$, 输者是上一轮生成 $y'$, 参考模型是上一轮的 $p_{\theta_t}$.

论文 §4.2 把 SPIN 和 DPO 的不同归纳为三点: SPIN 天然多轮迭代, DPO 默认一次; SPIN 不需要偏好对; SPIN 的 $\ell$ 可以换成其他满足假设的函数, logistic 只是一种选择.

### 3.2 手算

设 $\lambda=0.1$. 人写回答 $y$ 上 $\log p_\theta=-9$, $\log p_{\theta_t}=-11$; 生成回答 $y'$ 上 $\log p_\theta=-10$, $\log p_{\theta_t}=-10$. 成对差是 $0.1\bigl((-9+11)-(-10+10)\bigr)=0.20$, $\ell(0.20)=\log(1+e^{-0.20})\approx0.60$. 模型相对上一轮已经更偏向人写回答, 这条样本还在学, 更新不重.

若排反: $y$ 上 $\log p_\theta=-12$, $y'$ 上 $\log p_\theta=-9$. 差是 $0.1\bigl((-12+11)-(-9+10)\bigr)=-0.20$, $\ell(-0.20)\approx0.80$, 更新更重.

### 3.3 梯度与 SFT 的差别

记式 (8) 括号里的成对差为 $\Delta$. 取 logistic 损失, 对单条样本求梯度:

$$
\nabla_\theta\ell(\Delta)
=
-\lambda\,\sigma(-\Delta)
\bigl[
\nabla_\theta\log p_\theta(y\mid x)
-
\nabla_\theta\log p_\theta(y'\mid x)
\bigr].
\tag{9}
$$

和式 (1) 的 SFT 梯度 $-\nabla_\theta\log p_\theta(y\mid x)$ 比, 式 (9) 有三处不同.

第一, 多了一项 $+\nabla_\theta\log p_\theta(y'\mid x)$, 下降方向会压低模型自己生成的回答. SFT 只抬高人写回答, 对模型已经偏爱但数据里没有的回答 (例如 Figure 1 里编出来的百分比) 没有直接的压低作用.

第二, 权重 $\sigma(-\Delta)$ 随样本变化. 主玩家已经能区分的样本 ($\Delta$ 大) 权重趋于 0, 还分不清的样本权重接近 1. 第 3.2 节的两个例子里, $\Delta=0.20$ 时权重 $\sigma(-0.20)\approx0.45$, $\Delta=-0.20$ 时约 0.55. 若 $\Delta=3$, 权重降到约 0.047. SFT 对所有样本一视同仁.

第三, 若某条 prompt 上模型的生成恰好和人写回答相同, 即 $y'=y$, 括号里两项相等, 梯度为 0. 模型已学会的样本不再产生更新. 这和第 4 节的收敛结论一致: $p_{\theta_t}=p_{\mathrm{data}}$ 时, 从期望上看正负两项互相抵消.

代价在于反例来自模型自身. 生成质量很差时 $y'$ 很容易区分, $\Delta$ 很快变大, 权重降到接近 0, 该轮学不到多少东西; 生成质量已接近数据时, 正负两项方向接近, 有效梯度也小. 每轮的增量递减, 部分原因在这里.

### 3.4 单步实现

一条样本的损失只需要四个序列对数概率, 和 DPO 的实现完全一致:

```python
import torch.nn.functional as F

def spin_loss(logp_y, logp_yprime, ref_logp_y, ref_logp_yprime, lam=0.1):
    # logp_*: 当前模型在整段回答上的对数概率之和, 形状 [B]
    # ref_logp_*: 上一轮模型 p_{theta_t} 的同一量, 不求梯度
    delta = lam * ((logp_y - ref_logp_y) - (logp_yprime - ref_logp_yprime))
    return -F.logsigmoid(delta).mean()
```

`ref_logp_*` 在每轮开始前用 $p_{\theta_t}$ 算好即可, 训练时不必把参考模型常驻显存. 第一次调用时 $p_\theta=p_{\theta_t}$, $\Delta=0$, 损失等于 $\log2\approx0.693$; 训练日志里的初始损失偏离这个值, 通常说明参考模型和训练起点没对齐.

### 3.5 $\lambda$ 与实现里的 $\beta$

论文正文把 KL 系数记作 $\lambda$. 附录 B 的实现基于 Alignment Handbook 的 DPO 代码, 同一个系数在那里叫 $\beta$, 默认 0.1, 最后一轮 (iter-3) 调到 5.0. 论文给出的理由是最后一轮模型已接近收敛, 加大 $\beta$ 也就是加强 KL 约束, 让更新幅度变小.

论文的定理允许 $\ell$ 取 logistic 以外的凸递减函数. Assumption 5.1 列出的例子有 correlation 损失 $1-t$, hinge 损失 $\max(0,1-t)$, 指数损失 $\exp(-t)$ 和 logistic 损失. 只有 logistic 时式 (8) 才和 DPO 同形. 实验全部使用 logistic.

几种损失的差别可以用梯度权重看. correlation 损失的导数恒为 $-1$, 每条样本权重相同, 等价于回到式 (2) 的线性目标, 没有饱和, 已区分的样本仍会继续推高 $\Delta$. hinge 损失在 $\Delta\ge1$ 后梯度为 0, 截断很硬. 指数损失的权重是 $e^{-\Delta}$, $\Delta=-2$ 时达到 7.4, 对排反的样本反应过强, 对噪声敏感. logistic 的权重 $\sigma(-\Delta)$ 落在 $(0,1)$ 之间, 既会饱和又有上界.

![SPIN 自对弈迭代环](./images/fig-spin-self-play.png)

> 图 1: 人写的 $(x,y)$ 与对手 $p_{\theta_t}$ 生成的 $y'$ 进入主玩家损失, 得到 $p_{\theta_{t+1}}$, 虚线把权重拷贝成下一轮对手.

**图 1 解析**

- 顶部一行两个来源. 左边绿框是 SFT 人写数据, 底边引出实线 $y$; 右边灰框是上一轮对手, 底边引出实线 $y'$. 两条线汇入橙色损失框.
- 橙框写 prefer $y$ over $y'$, 向下的实线标 minimize, 进入浅蓝框 $p_{\theta_{t+1}}$.
- 最底部淡紫色虚线框表示拷贝权重, 方向单一. 下一轮开始时, 底部的 $p_{\theta_{t+1}}$ 就是顶部灰框里的新对手.

## 4. 收敛点就是 $p_{\mathrm{data}}$

### 4.1 全局最优与 logistic 下的更新方向

论文 Assumption 5.1 要求 $\ell$ 单调递减, $\ell'(0)<0$, 且为凸函数. Theorem 5.2 说: 若函数类里存在 $p_\theta=p_{\mathrm{data}}$, 则当 $p_{\theta_t}=p_{\mathrm{data}}$ 时, $\theta_t$ 是式 (8) 的全局最小点, 对任意 $\lambda\ge0$ 成立; 反过来, 若 $p_{\theta_t}\ne p_{\mathrm{data}}$, 总能找到某个 $\lambda$ 使 $\theta_t$ 不是全局最小. 训练停止的点, 就是生成分布等于数据分布的点.

Theorem 5.2 只说终点在哪, 没说每一轮怎么走. 取 logistic 损失时, Theorem 5.4 给出更具体的结论. 若 $p_{\theta_t}(p_{\mathrm{data}}/p_{\theta_t})^{1/\lambda}$ 仍在语言模型的函数类里, 且 $\theta_{t+1}$ 是全局最小, 则

$$
p_{\theta_{t+1}}(y\mid x)
\propto
p_{\theta_t}(y\mid x)
\Bigl(\frac{p_{\mathrm{data}}(y\mid x)}{p_{\theta_t}(y\mid x)}\Bigr)^{1/\lambda}.
\tag{10}
$$

在 $p_{\theta_t}<p_{\mathrm{data}}$ 的地方, 下一轮的概率上升; 在 $p_{\theta_t}>p_{\mathrm{data}}$ 的地方, 概率下降. $\lambda$ 越小, 调整幅度越大.

用一个两点分布手算式 (10). 只看两条回答 A 和 B. 设 $p_{\mathrm{data}}=(0.8,0.2)$, 当前模型 $p_{\theta_t}=(0.5,0.5)$. 取 $\lambda=1$: 比值是 $(1.6,0.4)$, 乘上 $p_{\theta_t}$ 得 $(0.8,0.2)$, 归一化后正好是 $p_{\mathrm{data}}$, 一步到位. 取 $\lambda=2$: 比值开方得 $(1.265,0.632)$, 乘上 $p_{\theta_t}$ 得 $(0.632,0.316)$, 归一化为 $(0.667,0.333)$, 只走了一部分. 再迭代一轮, 比值是 $(1.2,0.6)$, 开方 $(1.095,0.775)$, 乘上 $(0.667,0.333)$ 得 $(0.730,0.258)$, 归一化 $(0.739,0.261)$. 每轮都向 $p_{\mathrm{data}}$ 靠近, 步子随差距缩小而变小. 这和实验中每轮增量递减的趋势一致.

### 4.2 上限

论文的 Limitation 一节写明: 理论结果表明 SPIN 当且仅当模型分布对齐到 $p_{\mathrm{data}}$ 时收敛, 因此研究的是一个固定的目标分布, 这给微调后模型的表现设了上限. 要突破这个上限, 需要动态变化的目标分布, 论文把这列为未来方向, 设想借此让模型越过这个上限, 甚至达到超过人类的水平. 同一节列出的另一个方向是减少所需的合成数据量: 每一轮都要用上一轮模型为 50k 条 prompt 各生成一条完整回答, 生成本身就要占用大量资源. Impact Statement 另外提到, SPIN 生成的合成数据也可以拿去给其他语言模型做训练增强.

还要注意 $p_{\mathrm{data}}$ 是什么. UltraChat 本身是用 OpenAI Turbo API 生成的约 1.4M 段对话, UltraChat200k 是其中的高质量子集. SPIN 的上限是这份合成教学数据的分布.

函数类不够大时, 式 (10) 右边未必能被模型表示, 定理的前提不成立. 实验中 iter-2 到 iter-3 的平均分只增加 0.19, 已经接近饱和.

附录 A 把这个过程和课程学习 (curriculum learning) 对照: 早期 $y'$ 与人写回答差别大, 主玩家容易区分; 越往后 $y'$ 越像人写回答, 区分越难, 样本难度随对手变强而上升.

## 5. 实验与消融

### 5.1 设置

起点 zephyr-7b-sft-full. 从 UltraChat200k 随机取 50k 条 prompt. 多轮对话只取第一轮作为 $(x,y)$. iter-0 的合成数据是 50k 条; 之后每轮把上一轮的合成数据和本轮新生成的合并, 得到 100k 条. 每轮训 2 个 epoch.

训练基于 Alignment Handbook, DeepSpeed ZeRO-3, FlashAttention-2. 优化器 RMSProp, 无 weight decay, 全局 batch 64, 10% warmup, bfloat16. iter-0 和 iter-1 的峰值学习率 $5\times10^{-7}$, iter-2 和 iter-3 降到 $1\times10^{-7}$. 最大序列长度 2048. 提示模板是 Alpaca 风格的 `### Instruction: {prompt}\n\n### Response: `. 生成用 Accelerate 做多卡分布式推理, 全局 batch 64.

数据合并的作用: iter-1 的 100k 条里, 一半的反例来自 SFT 模型 (iter-0 生成), 一半来自 $p_{\theta_1}$. 模型在新反例上学习的同时, 仍要区分旧反例, 防止它回退到上一轮已经被压低的回答上. 代价是训练量翻倍.

成本: 8 张 A100 (80G) 上, 每 64 条样本生成约 6.69 秒, 训练约 10 秒. 每轮生成 50k 条约 1.45 小时; 训练 iter-0 约 4.32 小时, 之后数据翻倍, 每轮约 8.64 小时. 训练时间多于生成时间.

### 5.2 Open LLM Leaderboard (附录 Table 4)

评测用 Open LLM Leaderboard 的六项: Arc (25-shot), TruthfulQA (0-shot), Winogrande (5-shot), GSM8k (5-shot), HellaSwag (10-shot), MMLU (5-shot).

| 模型 | Arc | TruthfulQA | Winogrande | GSM8k | HellaSwag | MMLU | 平均 |
|------|----:|----------:|----------:|------:|----------:|-----:|-----:|
| zephyr-7b-sft-full | 60.41 | 43.73 | 74.19 | 26.76 | 82.85 | 60.92 | 58.14 |
| SPIN iter-0 | 63.40 | 49.18 | 72.69 | 35.10 | 84.38 | 60.03 | 60.80 |
| SPIN iter-1 | 65.19 | 55.17 | 72.30 | 35.78 | 84.96 | 59.34 | 62.12 |
| SPIN iter-2 | 65.96 | 54.91 | 73.56 | 38.06 | 85.41 | 59.93 | 62.97 |
| SPIN iter-3 | 65.87 | 54.90 | 73.72 | 38.97 | 85.54 | 59.99 | 63.16 |

平均分每轮的增量依次是 2.66, 1.32, 0.85, 0.19. iter-0 相对 SFT, TruthfulQA 从 43.73 到 49.18, GSM8k 从 26.76 到 35.10. 提升主要来自 Arc, TruthfulQA, GSM8k, HellaSwag. Winogrande 在 iter-0 从 74.19 降到 72.69, iter-3 回到 73.72, 仍低于 SFT; MMLU 全程低于 SFT 的 60.92. 平均分上升不等于每项都上升.

各项增量也在递减. Arc 依次增加 2.99, 1.79, 0.77, 最后一轮微降 0.09. TruthfulQA 的提升集中在前两轮 (5.45, 5.99), 之后小幅回落. GSM8k 在 iter-0 增加 8.34, iter-1 只增加 0.68, iter-2 再增加 2.28.

按四轮总量算, GSM8k 从 26.76 到 38.97, 增加 12.21 分, 相对提升约 46%, 是六项里最大的. TruthfulQA 增加 11.17 分, 排第二. 这两项恰好是起点分数最低的两项, 与第 4 节的结论一致: 模型与数据差距越大的地方, 自对弈能利用的信号越多. 起点分数本来就高的 HellaSwag 四轮只增加 2.69 分.

### 5.3 与 DPO 对比

zephyr-7b-beta (DPO, 62k 偏好) 的平均分是 61.31, 分项为 Arc 63.65, TruthfulQA 55.19, Winogrande 72.61, GSM8k 33.43, HellaSwag 84.44, MMLU 58.52. SPIN iter-0 平均 60.80, 与之相当; GSM8k 的 35.10 已经高于 DPO 的 33.43, TruthfulQA 的 49.18 低于 DPO 的 55.19. iter-1 平均 62.12 超过 DPO, TruthfulQA 55.17 与 DPO 持平. SPIN 全程没有使用这 62k 条偏好数据.

附录 B.3 在 iter-3 之后再用同一份 UltraFeedback Binarized 训 2 个 epoch 的 DPO, 平均分到 64.05, 比 iter-3 高 0.89. 分项为 Arc 66.47, TruthfulQA 60.07, Winogrande 78.06, GSM8k 37.98, HellaSwag 86.17, MMLU 59.68. Winogrande 从低于 SFT 升到 78.06, 是偏好数据补上了自对弈没提升的部分. SPIN 和 DPO 可以前后串联使用.

### 5.4 MT-Bench 与其他评测

MT-Bench (附录 Table 6): SFT 5.94, iter-0 6.46, iter-1 6.65, iter-2 6.78. 同期的 vicuna-13b-v1.5 是 6.57, 论文指出从 iter-1 起 SPIN 超过它.

Big-Bench Hard 部分任务: Causal Judgment 从 56.15 到 59.36, Formal Fallacies 从 49.6 到 51.2, Sports Understanding 从 96.0 降到 94.4. OpenBookQA 从 45.4 到 47.6.

### 5.5 多 epoch, 数据量与成本

Figure 4 在 iter-0 的 50k 合成数据上多训几个 epoch. 前两个 epoch 提升最多, 之后只有小幅增长, 到不了 iter-1 的水平. 对手还是 SFT 模型, 主玩家学会区分这批 $y'$ 之后, 同一批数据不再提供新信息. 只有换对手, 生成新的 $y'$, 才有新的对比信号.

数据量的消融指向同一点. Figure 5 在 iter-0 上用 14k, 26k, 50k 三种数据量 (大集合包含小集合), 各训 1 个 epoch. SPIN 的分数随数据量上升. 同图里 SFT 再训第 2, 第 3 个 epoch, 提升不到 1%. 同一份人写数据, 交叉熵已经用尽, 自对弈仍能从中取得信号.

换对手的代价是算力. 每轮都要先生成 50k 条回答, 从 iter-1 起训练数据翻倍, 训练时间也翻倍, 平均分的增量却从 2.66 降到 0.19. 这是第 4 节理论上限的实际体现: 越接近 $p_{\mathrm{data}}$, 可利用的差距越小.

Figure 4 还显示, iter-0 训练更多 epoch 时分数保持稳定, 没有下降. 所以多训几个 epoch 的代价只是算力, 不会损害模型; 但想继续提升, 只能进入下一轮.

### 5.6 最后一轮的 $\beta=5.0$

把第 4.1 节的两点例子换成 $\lambda=5$: 比值 $(1.6,0.4)$ 开 5 次方得 $(1.099,0.833)$, 乘上 $(0.5,0.5)$ 得 $(0.550,0.417)$, 归一化为 $(0.569,0.431)$. 同样的起点, $\lambda=1$ 一步走到 $(0.8,0.2)$, $\lambda=5$ 只把 A 的概率从 0.5 提到 0.569. 按式 (10), $\lambda$ 从 0.1 调到 5.0 后, 每轮朝 $p_{\mathrm{data}}$ 移动的幅度大幅缩小. 论文在 iter-3 这样设置, 同时学习率已降到 $1\times10^{-7}$, 最后一轮基本是小幅修正, 平均分只变动 0.19 也与此相符.

代价是, 若 iter-3 之前模型离 $p_{\mathrm{data}}$ 还远, 这样的设置会浪费一整轮的生成和训练. 要判断 5.0 是否必要, 需要补一组 iter-3 取 $\beta=0.1$ 的对照.

## 6. 相邻方法, 选型与失效

### 6.1 与相邻方法的分工

**DPO.** 需要 $(x,y_w,y_l)$. 论文的对照模型 zephyr-7b-beta 从同一个 zephyr-7b-sft-full 出发, 在约 62k 条 UltraFeedback Binarized 上训练, chosen 和 rejected 由 GPT-4 打分决定. SPIN 只用已有 SFT 数据: 从 UltraChat200k 随机取 50k 条 prompt, 由当前模型生成回答, 胜者是原来的人写回答.

**Self-Rewarding.** 让模型自己当裁判给回答打分, 构造偏好对再迭代 DPO, 见 [07-Self-Rewarding](../07-Self-Rewarding-自奖励/07-Self-Rewarding-自奖励.md). SPIN 没有打分这一步, 也没有显式的偏好标签, 对比信号只来自「人写还是模型写」.

**Iterative DPO.** 论文 §4.2 提到 Xu 等 (2023) 用 Pairwise Cringe Loss 做迭代偏好优化, 把 DPO 推广成迭代形式; 同期的 Self-Rewarding 也用迭代 DPO, 由模型自己提供偏好反馈. 论文的区分是: 这两种方法每轮都要有中间的奖励或偏好反馈来决定胜负, SPIN 的自我评估是隐式的, 胜负由「人写还是模型写」直接确定, 不需要任何中间打分.

**PPO, GRPO.** 在线从当前策略采样, 用奖励模型或规则打分. SPIN 训练中没有奖励, 没有组内归一化, 采样只在每轮开始时做一次, 采样时对手权重冻结.

**RAFT.** 每条 prompt 采多条, 用奖励模型打分, 只拿最高分那条做 SFT, 其余丢弃. SPIN 没有奖励模型, $y'$ 作为反例进入损失. 见 [07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md).

**其他自训练方法.** 论文提到 Singh 等的合成数据自训练仍需要二值反馈 (正确或错误), Burns 等的弱到强泛化需要弱模型和强模型同时在场. SPIN 只需要一个 SFT 过的模型和它的 SFT 数据.

| | 数据 | 参考 | 奖励模型 | 正例与反例 |
|--|------|------|---------|-----------|
| PPO | 在线 $y\sim\pi_\theta$ | 冻结 SFT | 要, 另加价值网络 | 奖励标量 |
| GRPO | 同题 $G$ 条 | 视实现 | 规则或 RM | 组内归一化优势 |
| RAFT | 在线 $K$ 条 | 不要 | 要 | 只克隆最高分 |
| DPO | $(x,y_w,y_l)$ | 冻结 SFT | 不要 | GPT-4 或人排序 |
| SPIN | SFT 的 $(x,y)$ 加自生成 $y'$ | 上一轮 $p_{\theta_t}$ | 不要 | 人写 $y$ 对 $y'$ |

![DPO 要成对偏好, SPIN 只用 SFT 人标对自生成](./images/fig-spin-vs-dpo.png)

> 图 2: 左列 DPO 使用 UltraFeedback 成对数据, 参考固定为 SFT; 右列 SPIN 只有 SFT 的 $y$ 对上一轮采样的 $y'$, $y$ 永远是胜者.

**图 2 解析**

- 两列从上往下, 中间竖线分开. 左列顶部黄框是约 62k 条 GPT-4 打分的三元组.
- 左列中部: 绿框可训 $\pi_\theta$, 灰框冻结 $\pi_{\mathrm{ref}}=\mathrm{SFT}$, 两路对数概率汇入蓝色 DPO 损失, $y_w$ 对 $y_l$.
- 右列顶部黄框只有 SFT 的 prompt, 没有新标注. 绿框是人写的 $y$, 灰框 $p_{\theta_t}$ 同时负责采样 $y'$ 和提供参考.
- 右列底部紫框是 SPIN 损失. 页脚写 winner always human $y$, 参考模型每轮更换.

### 6.2 什么时候用 SPIN

前提条件有两个. 一是手上有一份质量明显高于当前模型生成的 SFT 数据; 如果 SFT 数据本身就是用这个模型或同级模型生成的, $p_{\mathrm{data}}$ 和 $p_{\theta_0}$ 差别很小, 能利用的差距也小. 二是没有偏好数据, 或者偏好数据成本很高. 论文的对比显示, SPIN 两轮可以达到并超过 62k 条 GPT-4 偏好训练的 DPO.

已有偏好数据时, 附录 B.3 的结果给出了一种组合: 先做 SPIN, 用完 SFT 数据里的信号, 再用偏好数据做 DPO. 两者利用的信息不同. SPIN 学的是「像人写的回答」, 上限是 SFT 数据; DPO 学的是「标注者更偏好的回答」, 可以带来 SFT 数据里没有的偏好信息. 64.05 对 63.16 的差距, 以及 Winogrande 从 73.72 到 78.06 的跳升, 都来自后一部分.

不适合的场景: SFT 数据本身有系统性错误 (如事实错误, 格式不统一), SPIN 会把模型推得更像这些错误; 目标是超过 SFT 数据的能力, 例如数学推理要求比示范更高的正确率, 这时需要可验证奖励或偏好信号.

计算上, 每轮的成本是一次全量生成加一次 DPO 训练. 以论文设置估算, 四轮总计约 $4\times1.45+4.32+3\times8.64\approx36.0$ 小时 (8 张 A100), 其中 iter-0 约 5.8 小时就拿到全部增量 5.02 中的 2.66.

### 6.3 实现要点

数据准备: 每轮开始时, 用当前模型对所有 prompt 采样, 把 $(x,y,y')$ 写成 DPO 格式的 `prompt`, `chosen`, `rejected` 三个字段, chosen 填人写回答, rejected 填生成回答.

训练: 用 DPO trainer, 参考模型设为当前轮的起点模型 (上一轮训练结果), 而非最初的 SFT 模型. 每轮结束把训练结果保存, 作为下一轮的生成模型和参考模型.

模板: 采样和训练要用同一套提示模板. 论文用的是 Alpaca 模板, 和 Zephyr 自带的 chat template 不同, 混用会让对数概率在两套包装下比较.

超参: 学习率在后两轮降低, 最后一轮加大 $\beta$. 这两项都是为了在接近收敛时减小更新幅度.

### 6.4 失效模式

**上限固定.** 收敛点就是 $p_{\mathrm{data}}$, 想超过 SFT 数据本身的质量, 必须换数据或引入外部信号.

**收益递减.** 第四轮只增加 0.19, 成本却和第二轮一样高. 每多一轮之前, 先看上一轮的增量是否还值得一次完整的生成加训练.

**分项不一定都升.** Winogrande 和 MMLU 始终低于 SFT, BBH 的 Sports Understanding 下降. 只看平均分会掩盖这些退步.

**单轮多 epoch 不等于迭代.** 对手不换, 训练很快饱和.

**再做 SFT 有害.** 对已 SFT 的模型在同一数据上继续 SFT, 平均分会下降.

**多轮对话只用了第一轮.** 后续轮次的上下文更长, 论文没有测试.

**模板不一致.** 采样模板和训练模板不同, 会让 $y'$ 的分布和训练时的条件不一致.

**参考模型用错.** 直接套用 DPO 配置时, 参考模型容易一直停在最初的 SFT 模型. 这样做的话, 第 $t$ 轮的 $y'$ 来自 $p_{\theta_t}$, 对数比却以 $p_{\theta_0}$ 为基准, 式 (5) 到式 (7) 的推导不再成立, 训练目标也就和式 (8) 不同. 检查方法是看每轮第一个 step 的损失是否接近 $\log2$: 参考模型等于训练起点时, 所有样本的 $\Delta$ 都是 0.

**生成多样性不足.** 每条 prompt 只采一个 $y'$. 采样温度过低时, $y'$ 集中在少数高概率回答上, 主玩家压低的只是这几种回答.

带奖励的在线采样方法见 [04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md) 和 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md), AI 反馈见 [4.4.3-RLAIF](../../4.4.3-RLAIF/4.4.3-RLAIF.md).

## 参考文献

1. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML 2024*.
2. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS 2023*.
3. Tunstall, L., et al. (2023). [Zephyr: Direct Distillation of LM Alignment](https://arxiv.org/abs/2310.16944).
4. Ding, N., et al. (2023). [Enhancing Chat Language Models by Scaling High-quality Instructional Conversations](https://arxiv.org/abs/2305.14233).
5. Cui, G., et al. (2023). [UltraFeedback: Boosting Language Models with High-quality Feedback](https://arxiv.org/abs/2310.01377).
6. Jiang, A. Q., et al. (2023). [Mistral 7B](https://arxiv.org/abs/2310.06825).
7. Zheng, L., et al. (2023). [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685).
8. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767).
9. Yuan, W., et al. (2024). [Self-Rewarding Language Models](https://arxiv.org/abs/2401.10020).
10. Goodfellow, I., et al. (2014). [Generative Adversarial Networks](https://arxiv.org/abs/1406.2661).
11. Ho, J., & Ermon, S. (2016). [Generative Adversarial Imitation Learning](https://arxiv.org/abs/1606.03476). *NeurIPS 2016*.
