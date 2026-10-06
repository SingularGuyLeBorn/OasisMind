---
title: "01 · OAIF: 在线 AI 反馈"
published: true
tags: ["OAIF", "DPO", "IPO", "SLiC", "在线偏好", "RLAIF", "PaLM 2"]
excerpt: "OAIF (Online AI Feedback) 保留 DPO, IPO, SLiC 的损失, 只换数据来源: 每步从当前策略采两条回答, 让一个 LLM 当场判出胜负, 再算损失."
---
# OAIF: 在线 AI 反馈

Guo, Zhang, Liu 等的 *Direct Language Model Alignment from Online AI Feedback* ([arXiv:2402.04792](https://arxiv.org/abs/2402.04792)) 处理的问题是: DPO 一类方法用的偏好对是训练前采好的, 来自别的模型, 训练中策略拿不到对自己新回答的反馈. 公式和表以 [arXiv HTML](https://arxiv.org/html/2402.04792) 为准, 隐式奖励的推导见 [01-DPO](../../4.6.1-离线偏好优化/01-DPO/01-DPO.md).

## 离线偏好对的问题

### 偏好数据怎么来

标准流程是: prompt $x$ 从 $p_{\mathcal{X}}$ 抽取, 两条回答 $y^1,y^2$ 从某个已有模型 $\rho$ 独立采样, 由人或 AI 排成 $y^+,y^-$, 汇总成

$$
\mathbb{D}=\{(x_i,y_i^+,y_i^-)\}_{i=1}^N.
\tag{1}
$$

DAP (direct alignment from preferences) 方法直接在这份数据上定义损失 $\ell(x,y^+,y^-,\theta)$, 不另训奖励模型. 论文指出 DAP 的一个优点是梯度可以精确高效地计算. RLHF 的目标对回答空间求期望, 通常用策略梯度做无偏估计, 再用价值函数降方差, 显存里要多放一个模型.

**两种错位**

论文附录 A 区分了两个概念.

离线和在线: 如果 $(y^+,y^-)=f(x,y^1,y^2)$, 其中 $f$ 是训练中随时可以调用的偏好函数 (人, RM 或 LLM), 且 $y^1,y^2\sim\pi_{\theta^t}(\cdot\mid x)$, 学习就是在线的; 数据在训练前已经采好, 就是离线的. 人工标注成本高, 训练时通常没有人在环里, 所以 $\mathbb{D}$ 一般在训练前收集完毕并固定.

off-policy 和 on-policy: 偏好对来自当前 $\pi_{\theta^t}$ 是 on-policy, 来自别的 $\rho$ 是 off-policy. 即使先 SFT 使 $\pi_{\theta^0}\approx\rho$, 对齐过程中 $\pi_{\theta^t}$ 也会离开 $\pi_{\theta^0}$. 论文 Figure 2 把两段错位画在一起: 初始的 $\rho\ne\pi_{\theta^0}$, 以及训练中逐渐出现的 $\pi_{\theta^0}\ne\pi_{\theta^t}$.

附录 B 用 Stiennon 等的 Stylistic-Continuation 数据验证了这个差距. 该数据由 GPT-2 Large 生成, 论文把 GPT-2 Large 当作策略, 于是数据里的 $y^+,y^-$ 都是 on-policy; 再用 PaLM 2-S 合成一条 off-policy 回答 $\bar y$. GPT-2 Large 给自己生成的回答的对数概率明显高于 $\bar y$. Figure 8 画的是三者在 GPT-2 Large 下的对数概率: $y^+$ 和 $y^-$ 两组分布接近, $\bar y$ 一组整体落在更低的位置, 和前两组之间有清楚的间隔. 也就是说, 只要偏好数据来自别的模型, 策略面对的就是一批自己很少会生成的回答.

**用 RM 打伪标签也不够**

一种在线化方案是用奖励模型给当前生成打标签. RSO (Liu 等) 用 RM 做拒绝采样, Iterative DPO (Xu 等) 和 West-of-N (Pace 等) 用 RM 给 $\pi_{\theta^t}$ 的生成打伪标签. 这些方法做到了在线和 on-policy, 但 RM 本身仍在 $\mathbb{D}\sim\rho$ 上训练. 附录 A.3 写道: 只有 $\rho=\pi_{\theta^t}$ 时 RM 标注的才是分布内样本, 而 RLHF 的常见做法里 $\rho\ne\pi_{\theta^t}$, RM 面对的是分布外样本.

论文 Table 1 用三列对比: 是否不需要 RM, 是否 on-policy 生成, 是否在线反馈. 离线 DPO, IPO, SLiC 只满足第一列; RSO 和 Iterative DPO 满足后两列; OAIF 三列都满足. 同期的 Swamy 等也强调在线偏好, 但仍依赖 RM.

OAIF 用 LLM 替代 RM 的依据是: 标注 LLM 没有在 $\mathbb{D}$ 上专门拟合, 它的判断能力来自预训练和指令微调, 面对 $\pi_{\theta^t}$ 的新回答时, 不存在「训练分布是 $\rho$」这一层错位. 这个依据也有边界. LLM 标注器同样有自己的偏好和盲区, 只是这些偏差与 $\rho$ 无关. 第 3 节的一致率数据给出了它的实际水平: 约七成与人一致.

**算法**

### 四步循环

Algorithm 1 按 batch size 1 书写. 输入是 prompt 集 $\mathbb{D}_{\mathcal{X}}$ (从原偏好数据中只取 $x$), SFT 模型 $\pi_{\theta^0}$, 一个 LLM 标注器, 以及任意可微的 DAP 损失. 对 $t=0,\dots,T$:

1. 抽取 $x\sim\mathbb{D}_{\mathcal{X}}$.
2. 从 $\pi_{\theta^t}(\cdot\mid x)$ 独立采样 $y^1,y^2$.
3. 用 LLM 标注器得到 $y^+,y^-$.
4. 用 $\nabla_\theta\ell(x,y^+,y^-,\theta^t)$ 更新得到 $\theta^{t+1}$.

第 2 步保证 on-policy, 第 3 步保证在线. 损失可以是任意 DAP 损失.

**三种损失**

DPO (论文式 (1)):

$$
\ell_{\mathrm{DPO}}
=
-\log\sigma\Biggl(\beta\log\frac{\pi_\theta(y^+\mid x)\,\pi_{\theta^0}(y^-\mid x)}{\pi_{\theta^0}(y^+\mid x)\,\pi_\theta(y^-\mid x)}\Biggr).
\tag{2}
$$

IPO (论文式 (2)) 把同一个对数比之差回归到常数:

$$
\ell_{\mathrm{IPO}}
=
\Biggl(\log\frac{\pi_\theta(y^+\mid x)\,\pi_{\theta^0}(y^-\mid x)}{\pi_\theta(y^-\mid x)\,\pi_{\theta^0}(y^+\mid x)}-\frac{1}{2\beta}\Biggr)^2.
\tag{3}
$$

SLiC (论文式 (3)) 是 hinge 形式:

$$
\ell_{\mathrm{SLiC}}
=
\max\Biggl(0,\,1-\beta\log\frac{\pi_\theta(y^+\mid x)\,\pi_{\theta^0}(y^-\mid x)}{\pi_\theta(y^-\mid x)\,\pi_{\theta^0}(y^+\mid x)}\Biggr).
\tag{4}
$$

三式共用一个量: 对数比之差 $h=\log\frac{\pi_\theta(y^+)}{\pi_{\theta^0}(y^+)}-\log\frac{\pi_\theta(y^-)}{\pi_{\theta^0}(y^-)}$. 区别在怎样惩罚它. DPO 对 $\beta h$ 做 logistic, 没有目标值, $h$ 越大损失越小; IPO 把 $h$ 拉向 $1/(2\beta)$, 超过也受罚; SLiC 在 $\beta h\ge1$ 后不再更新. 三个 $\beta$ 的含义因此不同: 实验中 DPO 取 0.1, IPO 取 1.0 (目标值 $h=0.5$), SLiC 取 0.002 (需要 $h\ge500$ 才停止更新). IPO 的原文 (Azar 等) 把正则系数记作 $\tau$, 见 [02-IPO](../../4.6.1-离线偏好优化/02-IPO-身份偏好优化/02-IPO-身份偏好优化.md). SLiC-HF 原文还带一项对参考回答的交叉熵, OAIF 只用 hinge 部分, 见 [06-SLiC](../../4.6.1-离线偏好优化/06-SLiC-序列似然校准/06-SLiC-序列似然校准.md).

**手算与梯度**

取 $\beta=0.1$. $y^+$ 上 $\log\pi_\theta=-8$, $\log\pi_{\theta^0}=-10$; $y^-$ 上 $\log\pi_\theta=-11$, $\log\pi_{\theta^0}=-9$. 则 $h=(-8+10)-(-11+9)=4$.

- DPO: $\beta h=0.40$, $\sigma(0.40)\approx0.60$, 损失 $\approx0.51$.
- IPO ($\beta=1.0$): $(4-0.5)^2=12.25$, 梯度方向是减小 $h$. 排序已经正确, IPO 仍认为差距过大.
- SLiC ($\beta=0.002$): $1-0.008=0.992$, 损失接近 1, 几乎没有饱和.

同一个偏好对, 三种损失的更新方向和力度可能完全不同. OAIF 不改变这一点, 它只改变 $(y^+,y^-)$ 从哪来.

把三种损失对 $h$ 求导, 差别更清楚:

$$
\frac{\partial\ell_{\mathrm{DPO}}}{\partial h}=-\beta\,\sigma(-\beta h),\qquad
\frac{\partial\ell_{\mathrm{IPO}}}{\partial h}=2\Bigl(h-\frac{1}{2\beta}\Bigr),\qquad
\frac{\partial\ell_{\mathrm{SLiC}}}{\partial h}=-\beta\,\mathbb{1}[\beta h<1].
\tag{5}
$$

在 $h=0$ 处 (新采的两条回答, 策略对它们还没有偏向), 三者分别是 $-0.05$, $-1$ 和 $-0.002$. 在线训练时, 每步的 $y^1,y^2$ 都是当前策略刚采出来的, 训练初期 $h$ 多在 0 附近, 三种损失都处于梯度最大的区间. 离线数据训练久了, 同一批偏好对的 $h$ 越来越大: DPO 的权重 $\sigma(-\beta h)$ 趋于 0, IPO 在超过目标值后开始反向拉回, SLiC 一直以常数梯度推动. 第 4.2 节中离线 IPO 的 quality 最低 (2.93), 式 (5) 给出的三种饱和方式, 可以作为理解这一结果的一个方向.

式 (5) 只是对 $h$ 的导数, 再往 $\theta$ 求时还要处理采样这一步. $\theta$ 同时出现在采样和损失中. $y^+,y^-$ 还经过标注器, 原则上也是 $\theta$ 的函数. 论文只用 $\nabla_\theta\ell(x,y^+,y^-,\theta)$, 相当于在采样和标注两步都加 `stop_gradient`. 离散 token 本来就无法直接反传, 这样处理之后, 每一步的计算和离线 DAP 相同: 对已经生成的序列求对数概率. 实现上是把序列逐 token 的 $\log\pi(y_t\mid x,y_{<t})$ 相加, 并屏蔽 prompt token.

**标注提示**

标注沿用 Lee 等的 Detailed 0-shot 提示. 成对提问「1 还是 2 更好」, 对生成 token「1」和「2」的对数概率做 softmax, 作为偏好分数. 为避免位置偏差, 两种顺序各算一次, 取平均. 附录 E 列出了 TL;DR, Helpfulness, Harmlessness 的完整提示.

手算一次. 顺序「A 在前, B 在后」时, 标注器给「1」的概率是 0.70, 即 A 更好的概率 0.70. 调换为「B 在前, A 在后」后, 给「1」(此时指 B) 的概率是 0.60, 即 A 更好的概率 0.40. 平均得 $(0.70+0.40)/2=0.55$, A 记为 $y^+$. 只看第一种顺序会得到 0.70 的强偏好, 只看第二种顺序结论反而相反; 两种顺序的差距 $0.70-0.40=0.30$ 就是这对样本上的位置偏差. 平均之后 0.55 接近 0.5, 表示这对回答差别不大, 它产生的训练信号本来就应该弱. 论文按分数直接取胜者, 不对接近 0.5 的偏好对做额外过滤.

### 一步的实现

```python
def oaif_step(policy, ref, annotator, prompts, loss_fn):
    # 采样与标注都在 no_grad 下完成, 对应论文的 stop_gradient
    y1, y2 = policy.sample(prompts, n=2, temperature=0.9)
    p = 0.5 * (annotator.prefer_first(prompts, y1, y2)
               + 1 - annotator.prefer_first(prompts, y2, y1))
    y_pos = where(p >= 0.5, y1, y2)
    y_neg = where(p >= 0.5, y2, y1)
    # 以下与离线 DAP 完全相同
    h = (policy.logp(prompts, y_pos) - ref.logp(prompts, y_pos)) \
        - (policy.logp(prompts, y_neg) - ref.logp(prompts, y_neg))
    loss = loss_fn(h).mean()
    loss.backward()
```

和离线 DPO 的训练循环比, 只多出前四行. 参考模型 `ref` 固定为 $\pi_{\theta^0}$, 不随训练更新.

![OAIF 单步: 当前策略采两条, LLM 标完再进 DAP 损失](./images/fig-oaif-online-loop.png)

> 图 1: prompt $x$ 进入当前 $\pi_{\theta^t}$, 采出 $y^1,y^2$, 冻结的 LLM 标注器给出 $y^+,y^-$, 再进入 DPO, IPO 或 SLiC 损失.

**图 1 解析**

- 从左到右六个框, 一条单向实线. 奶油色框是 prompt $x$, 箭头指向薄荷绿的当前策略, 框内标 trainable.
- 冰蓝色框是两条回答 $y^1,y^2$, 连线标 sample.
- 淡紫框是 PaLM 2-L 标注器, 标 frozen. 之后是标好的 $y^+,y^-$, 最终进入橙色 DAP 损失框.
- 页脚写 online + on-policy, Not a new loss. 图中没有回环箭头: 更新后的权重在下一步成为新的 $\pi_{\theta^t}$, 这发生在两步之间.

## 实验设置

### 任务与超参

任务三个: TL;DR (Stiennon 等), Anthropic Helpfulness, Anthropic Harmlessness (Bai 等). prompt 集从各自偏好数据中抽取 $x$.

策略默认是 SFT 后的 PaLM 2-XS, 标注器默认 PaLM 2-L. 训练采样温度 0.9. 优化器 Adafactor, batch 128, 学习率 $5\times10^{-7}$, warmup 150 步, 三种 DAP 共用这组优化超参, 只换 $\beta$.

### 裁判与人评

自动评测用 Gemini Pro 当裁判, 降低策略过拟合标注器和 reward hacking 的风险. 附录 Table 4 给出两种 LLM 与人工标注的一致率 (Detailed 0-shot):

| 设置 | TL;DR | Helpfulness | Harmlessness |
|------|------:|------------:|-------------:|
| Gemini Pro vs Human | 69.33% | 72.04% | 69.27% |
| PaLM 2-L vs Human | 73.23% | 69.11% | 69.83% |

平均一致率 Gemini Pro 为 70.21%, PaLM 2-L 为 70.72%, 两者相当. 用 Gemini Pro 当裁判的依据就在这里. 两者都只在约 70% 的样本上与人一致, 每 10 条约有 3 条与人工判断相反, 这是 OAIF 训练信号自带的噪声水平.

人评: 三位评审看到一组策略的输出, 各自给每条回答打 1 到 5 分的 quality (5 最好), 并选出最好的一条. win / tie / loss 来自「选最好」的票, quality 是 1 到 5 分的平均, 两者口径不同.

RLAIF 和 RLHF 的对照尽量对齐: RLAIF 的 AI 反馈模型同样是 PaLM 2-L; RLHF 在同一份预先收集的偏好数据上训 RM. 训练流程沿用 Lee 等.

## 结果

### 在线对离线 (Figure 3, Table 2)

Figure 3 在 TL;DR 上用 Gemini Pro 计算对 SFT 的胜率. 在线和离线 DPO 都有提升. 离线 DPO 的曲线在约 3,500 步处急剧下降, 论文的解释是它很快过拟合了 $\mathbb{D}$ 中离线且 off-policy 的偏好; 在线 DPO 的胜率持续上升, 4,000 步后超过离线. 附录 D 换成 PaLM 2-L 当裁判, 结论相同. 对离线 DPO 来说, 多训几个 epoch 只会加重过拟合, 因为数据本身没有变化.

从式 (2) 可以看出过拟合的去向. 固定偏好对上, 降低 DPO 损失最直接的办法是不断压低 $\pi_\theta(y^-\mid x)$, 让 $h$ 持续增大. 这些 $y^-$ 来自 $\rho$, 策略本来就很少生成它们, 压得再低也不改变策略实际会写出的回答, 却可能连带改变相近回答的概率. 在线时, 每步的 $y^1,y^2$ 都是策略当下会写的回答, 被压低的 $y^-$ 正是策略当下的典型错误, 每一次更新都作用在策略真正会访问的区域上.

Table 2 是在线 DPO 对离线 DPO 的人评. 两种模型都按开发集上 Gemini Pro 对 SFT 的胜率加人工检查选出最好的 checkpoint. 论文表格中离线行的 tie 栏为空, 成对比较里平局是同一个数, 下表补齐.

| 任务 | 方法 | Win | Tie | Loss | Quality |
|------|------|----:|----:|-----:|--------:|
| TL;DR | Online DPO | 63.74% | 28.57% | 7.69% | 3.95 |
| | Offline DPO | 7.69% | 28.57% | 63.74% | 3.46 |
| Helpfulness | Online DPO | 58.60% | 21.20% | 20.20% | 4.08 |
| | Offline DPO | 20.20% | 21.20% | 58.60% | 3.44 |
| Harmlessness | Online DPO | 60.26% | 35.90% | 3.84% | 4.41 |
| | Offline DPO | 3.84% | 35.90% | 60.26% | 3.57 |

三项任务的 quality 都是在线更高. Harmlessness 的 loss 只有 3.84%; Helpfulness 的 loss 为 20.20%, 是三项中差距最小的.

**换损失 (Table 3)**

Table 3 在 TL;DR 上把 IPO 和 SLiC 也做了在线对离线的人评.

| 方法 | Win | Tie | Loss | Quality |
|------|----:|----:|-----:|--------:|
| Online DPO | 63.74% | 28.57% | 7.69% | 3.95 |
| Offline DPO | 7.69% | 28.57% | 63.74% | 3.46 |
| Online IPO | 64.81% | 31.48% | 3.71% | 3.84 |
| Offline IPO | 3.71% | 31.48% | 64.81% | 2.93 |
| Online SLiC | 71.43% | 26.98% | 1.59% | 3.85 |
| Offline SLiC | 1.59% | 26.98% | 71.43% | 3.23 |

胜率范围约 64% 到 71%. 摘要报告的在线相对离线平均胜率约 66%, 与三行 win 的均值 $(63.74+64.81+71.43)/3\approx66.66$ 一致. Online SLiC 胜率最高, quality 3.85 与 Online IPO 的 3.84 接近, 都低于 Online DPO 的 3.95. Offline IPO 的 quality 只有 2.93, 是表中最低值. 换了损失, 在线相对离线的优势仍在.

**对 RLHF 和 RLAIF (§4.4)**

TL;DR 上做四路人评 (在线 DPO, 离线 DPO, RLAIF, RLHF), 在线 DPO 在 58.00% 的情况下被选为最好. 正文没有给出其余三者的拆分比例.

论文强调, RLAIF 和 RLHF 的 RM 通常在策略训练中不更新, 策略分布变化后, RM 的判断能力不一定能泛化. 为验证这一点, 作者用 RLAIF 的同一个 RM 给在线 DPO 打标签. 它胜过 RLAIF, 但对 OAIF (LLM 当场标注) 的胜率低于 30% (Gemini Pro 判定). 同样是在线 DPO, 标注源从固定 RM 换成 LLM, 结果差距很大.

OAIF 的回答明显更长. 人和 LLM 裁判都偏好长回答, 即 Singhal 等所说的 length bias. Figure 4(b) 把回答按长度分成六个桶, 画出每个桶的平均 quality 和标准误差. 在固定长度下, 在线 DPO 仍高于其他方法, 说明优势不全来自长度.

**标注器尺寸 (§4.5, §4.7)**

§4.5 把标注器换成 PaLM 2-XS 和 PaLM 2-S, 策略仍是 XS, 任务 TL;DR. Figure 5 显示标注器越大, 在线 DPO 的胜率越高; 三种尺寸相对 SFT 都有提升. 用 XS 自己做标注器时, 人评 quality 为 3.41, 略高于 RLHF 的 3.38, 与离线 DPO 的 3.46 相当.

§4.7 把策略换成 PaLM 2-S, 标注器一个是更弱的 XS, 一个是更强的 L, 在 Helpfulness 上比较. 弱标注器也能提升 S 对 SFT 和离线 DPO 的胜率, 强标注器效果更好. 论文的解释是标注偏好是判别任务, 比生成回答容易, 所以小模型也能给大模型提供有用的反馈.

论文把这和 Burns 等的弱到强泛化对照. 那项工作里老师和学生做的是同一种监督任务, 难度相同; 这里老师只做判别, 学生要做生成, 难度不对称. 作者认为这种分工更接近 GAN 的生成器和判别器, 区别是 OAIF 不训练专门的判别器, 标注器始终冻结.

两组结果合起来看: 标注器尺寸决定提升幅度, 但不是提升的前提. 同尺寸 (XS 标 XS) 已经能达到 RLHF 的水平, 而 RLHF 用的是人工偏好训出的 RM. 不过 3.41 对 3.46 的差距说明, 同尺寸标注还追不上离线人工偏好训出的 DPO.

### 用标注 prompt 控制行为, 成本与选择

**压短回答**

Helpfulness 上, 只要求 helpful 的在线 DPO 平均回答长度约 120 token. 把标注提示改为 helpful and short 和 helpful and very short (附录 Table 8), 平均长度分别降到约 90 和约 40 token. 人评 quality 从 4.08 降到 3.72 和 3.26, 仍高于 SFT 的 3.19. Gemini Pro 对 SFT 的胜率也随之下降, 但仍高于 SFT.

长度从约 120 降到约 90 时, quality 降 0.36; 从约 90 降到约 40 时, 再降 0.46. 长度每减少一个 token, 第一段约降 0.012 分, 第二段约降 0.009 分, 两段的单位代价接近. 长度和 quality 在这个区间里大致是线性交换的关系, 要压多少长度, 就要准备付出相应的质量.

论文 §4.6 给出做这组实验的理由: 对齐到什么目标仍有争议, 人的期望因地区和文化而不同, 也会随时间变化, 所以人工偏好标注可能需要频繁大幅修改. 在 RLHF 里, 改目标通常意味着重新标注数据, 重新训练 RM. OAIF 只需要改标注器看到的几句话. 代价也很明确: 回答更短, 有帮助程度跟着下降.

**其他提示改动与样本量**

压长度之外, 提示还能用来压掉具体的坏行为. 附录 Table 6 的 Helpfulness 提示里还加了一段话, 用来抑制一种行为: 初期实验中, 模型会以 `Human: That's very helpful, thank you!` 这类内容自行续写对话. 加上这段提示后问题消失. 作者认为这进一步说明 LLM 给出的奖励信号可以由文本控制. 这段话只在训练标注中使用, 用 Gemini Pro 打分时不加.

Harmlessness 的训练标注提示要求选出既有帮助又无害的回答, 并说明无害优先于有帮助.

§5 Discussion 还提到, §4.2 的实验中约 2,000 步就能看到行为明显变化, 对应约 256,000 条样本 ($2000\times128=256000$). 对单个用户的个性化来说, 这个数据量仍然太大. LoRA 可以提高样本效率, 但对齐到具体个人还需要更多基础进展.

**每步成本**

每个训练步要完成三件事: 策略对 128 条 prompt 各采两条回答; 标注器对每对回答做两次前向 (正反两种顺序); 策略和参考模型各算一次对数概率并反传. 相比离线 DPO, 多出来的是采样和标注两部分. 标注器是 PaLM 2-L 时, 标注的计算量远大于策略本身的训练.

以 2,000 步计, 一共要采 $2000\times128\times2=512{,}000$ 条回答, 做 $2000\times128\times2=512{,}000$ 次标注前向. 离线 DPO 的数据成本在训练前一次付清, 而 OAIF 把它摊到每一步, 训练多久就付多久.

收益是不需要人工标注, 不需要训练和维护 RM, 也不需要价值网络. 和 RLHF 比, 显存里少了 RM 和 Critic, 但多了一个常驻或可远程调用的标注 LLM.

### 什么时候用 OAIF

选择时可以按三个问题判断. 第一, 有没有一个与人工判断一致率足够高的标注 LLM. 论文中的一致率约 70%, 低于这个水平时, 在线标注的噪声会更大. 第二, 能否负担每步的标注调用. 标注器比策略大很多时, 训练成本主要由标注决定. 第三, 目标是否会变. 若对齐目标需要经常调整 (长度, 语气, 安全优先级), 改标注提示的成本远低于重新收集人工偏好和重训 RM.

三个问题的答案都偏向否定时, 离线 DPO 加一份质量可靠的人工偏好数据仍是更省事的选择; 只有第三个问题答是, 可以先离线训练, 再用 OAIF 做目标调整.

## 相邻方法与失效模式

### 与相邻方法的分工

**RLAIF (Lee 等).** 同样用 LLM 标偏好, 但流程是: AI 标注, 训练奖励模型, 再用强化学习优化策略. OAIF 中间没有奖励模型, 也没有策略梯度. 见 [4.7.1-RLAIF](../../../4.7-AI反馈与奖励过优化/4.7.1-RLAIF/4.7.1-RLAIF.md).

**SPIN.** 损失和 DPO 同形, 但胜者固定为 SFT 数据里的人写回答, 输者是上一轮模型的生成, 不需要任何偏好标注. OAIF 的两条回答都来自当前策略, 胜负由标注器判定. 见 [04-SPIN](../04-SPIN-自对弈微调/04-SPIN-自对弈微调.md).

**Self-Rewarding.** 正在训练的模型自己给自己打分. 论文 Discussion 认为这条路可行, 因为生成和判别是两种任务; 缺点是标注器的架构和尺寸必须与策略相同. OAIF 的标注器可以是任意 LLM, 包括比策略更强的. 见 [05-Self-Rewarding](../05-Self-Rewarding-自奖励/05-Self-Rewarding-自奖励.md).

**Nash-MD.** 也在线采样偏好, 但对手是当前策略与参考策略的几何混合, 目标是偏好博弈的 Nash 均衡. 见 [03-Nash-MD](../03-Nash-MD-纳什镜像下降/03-Nash-MD-纳什镜像下降.md).

| | 采样 | 标注 | 独立 RM | 优化 |
|--|------|------|---------|------|
| 离线 DPO | $\rho$, 预先采好 | 人, 固定在 $\mathbb{D}$ | 不要 | DAP 损失 |
| RLAIF | 当前 $\pi$ | LLM 标注后训 RM | 要 | 强化学习 |
| SPIN | 上一轮生成 $y'$ | 无, 胜者是人写回答 | 不要 | logistic 成对差 |
| Nash-MD | 在线 | 偏好模型 | 不要, 但有偏好模型 | 镜像下降 |
| OAIF | 当前 $\pi_{\theta^t}$ 两条 | LLM 当场标注 | 不要 | 任意 DAP 损失 |

![左列离线 DAP 吃固定数据集, 右列 OAIF 当场采当场标](./images/fig-oaif-vs-offline.png)

> 图 2: 左列离线 DAP 使用固定的 $\mathcal{D}$ (来自 $\rho$, 常是 off-policy), 参考冻结为 SFT; 右列 OAIF 由当前 $\pi_{\theta^t}$ 采 $y^1,y^2$, LLM 当场标注, 再代入同一种 DAP 损失.

**图 2 解析**

- 两列都从上往下读, 中间竖线分开. 左列顶部黄框是固定数据集 $\mathcal{D}$, 箭头标 old $(y^+,y^-)$.
- 左列中部并排: 绿框是可训练的 $\pi_\theta$, 灰框是冻结的 $\pi_{\mathrm{ref}}=\mathrm{SFT}$. 两路对数概率进入蓝色 DAP 损失. 页脚 often off-policy.
- 右列顶部薄荷绿框是当前 $\pi_{\theta^t}$ 当场采样, 淡紫框是冻结的 PaLM 2-L. 底部橙色框写 same DAP loss, 更新 $\theta$.
- 右列没有独立 RM, 也没有固定的偏好文件. 页脚 on-policy + online.

### 失效模式

**标注器噪声.** LLM 与人工标注的一致率约 70%. 约三成偏好对的方向与人相反, 这些错误会通过在线训练持续写入策略.

**长度偏好.** OAIF 让回答变长. 按长度分桶后在线 DPO 仍占优, 但实际部署时仍要监控长度.

**标注提示改错.** 标注 prompt 写错, 错误的目标会被在线训练放大. 压短实验说明, 提示的一点改动就能显著改变策略行为.

**prompt 分布.** Limitations 一节指出, 论文只研究了回答分布 $\rho(y\mid x)$ 与 $\pi_{\theta^t}(y\mid x)$ 的错位. prompt 分布 $p_{\mathcal{X}}$ 和人类价值函数也会变化. 修改标注 prompt 可能缓解后者, 但前者仍是问题. prompt 来自给定偏好数据, 评测是分布内的, 没有测分布外 prompt.

**规模.** 实验里被对齐的策略始终是 PaLM 2-XS (§4.7 的 S 除外). Bai 等指出回答质量越高越难区分, 策略更大时标注器还能否给出可靠偏好, 尚待验证.

**两条回答过于相似.** 若采样温度太低, $y^1$ 和 $y^2$ 可能几乎相同. 极端情况下 $y^1=y^2$, 式 (2) 中 $y^+$ 和 $y^-$ 的对数概率梯度互相抵消, 这一对样本完全不产生更新, 却照样付出了一次标注成本. 论文的训练采样温度是 0.9, 让两条回答有足够差异. 反过来, 温度过高会采到明显劣质的回答, 标注器很容易判断, 但这类偏好对告诉策略的多是它本来就不常犯的错误.

**标注器被迎合.** 在线训练中, 策略会朝标注器偏好的方向移动. 标注器有系统性偏好 (长度, 特定措辞, 礼貌套话) 时, 策略会学到这些偏好, 而它们未必是人想要的. Helpfulness 提示里需要专门压制「Human: That's very helpful」式续写, 就是一个例子.

**裁判与标注器相关.** 自动评测用 Gemini Pro 而非训练标注用的 PaLM 2-L, 用来减少策略迎合标注器带来的虚高. 用标注器本身当裁判时, 胜率会混入这种迎合.

**标注器能否换成策略自己.** Discussion 一节讨论了这种做法: 反馈也可以来自第 $t$ 步正在训练的 $\pi_{\theta^t}$, 即 Yuan 等 (2024) 的 Self-Rewarding. 作者认为这条路有前景, 因为生成回答是生成任务, 标注偏好是判别任务, 两者能力不同; 缺点是标注器的架构和尺寸只能和策略一样. OAIF 的标注器可以是任意模型, §4.5 用了比策略更大的标注器, §4.7 又说明更小的标注器也能带来提升.

已有高质量的离线人工偏好、只想做一次离线训练时, [01-DPO](../../4.6.1-离线偏好优化/01-DPO/01-DPO.md) 更简单. 用训练好的偏好模型在线打分的方法见 [02-Online-IPO](../02-Online-IPO-在线偏好/02-Online-IPO-在线偏好.md), 把 Best-of-$N$ 蒸馏回策略的方法见 [02-BOND](../../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/02-BOND-Best-of-N蒸馏/02-BOND-Best-of-N蒸馏.md).

**参考文献**

1. Guo, S., Zhang, B., Liu, T., Liu, T., Khalman, M., Llinares, F., Ramé, A., Mesnard, T., Zhao, Y., Piot, B., Ferret, J., & Blondel, M. (2024). [Direct Language Model Alignment from Online AI Feedback](https://arxiv.org/abs/2402.04792).
2. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS 2023*.
3. Azar, M. G., Rowland, M., Piot, B., Guo, D., Calandriello, D., Valko, M., & Munos, R. (2023). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036).
4. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
5. Lee, H., Phatale, S., Mansoor, H., et al. (2023). [RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback](https://arxiv.org/abs/2309.00267).
6. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML 2024*.
7. Yuan, W., Pang, R. Y., Cho, K., Sukhbaatar, S., Xu, J., & Weston, J. (2024). [Self-Rewarding Language Models](https://arxiv.org/abs/2401.10020).
8. Munos, R., Valko, M., Calandriello, D., et al. (2024). [Nash Learning from Human Feedback](https://arxiv.org/abs/2312.00886). *ICML 2024*.
9. Liu, T., Zhao, Y., Joshi, R., Khalman, M., Saleh, M., Liu, P. J., & Liu, J. (2023). [Statistical Rejection Sampling Improves Preference Optimization](https://arxiv.org/abs/2309.06657).
10. Anil, R., et al. (2023). [PaLM 2 Technical Report](https://arxiv.org/abs/2305.10403).
11. Gemini Team (2023). [Gemini: A Family of Highly Capable Multimodal Models](https://arxiv.org/abs/2312.11805).
12. Stiennon, N., et al. (2020). [Learning to Summarize with Human Feedback](https://arxiv.org/abs/2009.01325). *NeurIPS 2020*.
13. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).
14. Singhal, P., Goyal, T., Xu, J., & Durrett, G. (2023). [A Long Way to Go: Investigating Length Correlations in RLHF](https://arxiv.org/abs/2310.03716).
15. Burns, C., et al. (2023). [Weak-to-Strong Generalization: Eliciting Strong Capabilities with Weak Supervision](https://arxiv.org/abs/2312.09390).
16. Swamy, G., Dann, C., Kidambi, R., Wu, Z. S., & Agarwal, A. (2024). [A Minimaximalist Approach to Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2401.04056).
