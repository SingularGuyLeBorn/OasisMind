---
title: "07 · RAFT: 奖励排序微调"
published: true
tags: ["RAFT", "RLHF", "SFT", "PPO", "RLOO", "HH-RLHF"]
excerpt: "RAFT 每轮对每个 prompt 采 K 条回复, 用奖励模型排序, 只保留最高分的一条做 SFT, 然后用新模型重新采样. LLaMA-7B 在 HH-RLHF 上, RAFT-K32 的测试奖励 2.294, 高于 PPO 的 2.077, 困惑度 4.031 也低于 PPO 的 4.156."
---

# RAFT: 奖励排序微调

> 相关阅读: [04 PPO](../04-PPO/04-PPO.md) · [06 RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md) · [Best-of-N 与奖励模型过优化](../../4.4.4-其他对齐技术/07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md) · [BOND](../../4.4.4-其他对齐技术/09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md) · [RRHF](../../4.4.4-其他对齐技术/02-RRHF-排序响应对齐/02-RRHF-排序响应对齐.md)

材料是 Dong 等的 *RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment* (TMLR 2023, arXiv:2304.06767). 问题是能否只用奖励模型筛选模型自己的样本, 再做 SFT, 来代替 RLHF 第三段的 PPO.

## 1. 问题: PPO 太重, 离线 SFT 不够

InstructGPT 的三段流程是 SFT, 训练奖励模型, 再用 PPO 优化策略. 论文指出第三段的两个问题. PPO 靠试错学习, 和监督学习比起来一般更不稳定, 效率更低 (Choshen 等 2019). 它还要同时加载四个模型: 正在训练的策略, 计算 KL 的参考模型, 奖励模型, Critic. 显存压力很大.

论文在 $8\times$A40 (48G), 600G 内存, bf16 上用 TRL 做 PPO 基线. 即使用半精度, 计算 attention 分数这类中间量时仍会显存不足, 所以 PPO 的所有实验都用 LoRA. 作者也想换一个更大的奖励模型来提高准确率, 但用 7B 奖励模型训练 PPO 时显存不足, 奖励模型最后用了 Open-LLaMA-3B.

SFT 稳定, 快, 超参少. 问题是在一份事先准备好的数据上做 SFT, 效果通常不如 PPO 对齐后的模型 (Ramamurthy 等 2022). 另请专家写一批新的高质量样本又贵. 论文的出发点是: 要对齐的模型自己就能生成大量样本, 奖励模型可以充当筛选标准. 把这两件事接起来, 训练形式就回到了 SFT.

## 2. 目标和最优解

记初始生成模型 $G_0=g(w_0,x)$, 参数为 $w_0$, 对输入 $x$ 按 $p^{1/\lambda}_{G_0}(y\mid w_0,x)$ 生成 $y$, $\lambda$ 是温度. 当前参数为 $w$ 时的条件分布记 $p_g(y\mid w,x)$, 训练 prompt 来自分布 $\mathcal{D}$. 目标是最大化期望奖励 (论文式 (1)):

$$
\max_{w}\ \mathbb{E}_{x\sim\mathcal{D},\ y\sim p_g(\cdot\mid w,x)}\ r(x,y)
\tag{1}
$$

假设模型容量足够大, 能对每个 $x$ 单独取最优, 那么最优策略在每个 prompt 上把全部概率放在奖励最高的回复上 (论文式 (2)):

$$
p_g(y\mid w^{*},x)=
\begin{cases}
1, & y=\arg\max_{y'\in\mathcal{Y}} r(x,y')\\
0, & \text{其他}
\end{cases}
\tag{2}
$$

在整个输出空间 $\mathcal{Y}$ 上找最大值做不到. 可以做的是从当前模型采 $K$ 条, 取其中奖励最高的那条, 作为式 (2) 的近似. 拿这些样本微调后, 模型离式 (2) 更近一步, 下一轮采出的 $K$ 条整体更好, 选出的最高分样本也更好. 这就是要迭代的原因.

## 3. 三步算法

每一轮 $t+1$ 分三步 (论文 §3.2).

**第 1 步, 采样.** 取一批 prompt $\mathcal{D}_t=\{x_1^t,\dots,x_b^t\}$. 对每个 $x_i^t$, 从当前模型独立采 $K$ 条回复 $y_1,\dots,y_K\sim p^{1/\lambda}_{G_t}(\cdot\mid w_t,x_i^t)$.

**第 2 步, 排序.** 用奖励模型给这 $K$ 条打分, 只保留最高分的一条:

$$
y^{\star}(x)=\arg\max_{y_j\in\{y_1,\dots,y_K\}} r(x,y_j)
\tag{3}
$$

$b$ 个 prompt 处理完, 得到大小为 $b$ 的过滤集 $\mathcal{B}$.

**第 3 步, 微调.** 在 $\mathcal{B}$ 上对当前模型做标准 SFT, 得到 $G_{t+1}$:

$$
\mathcal{L}_{\mathrm{RAFT}}(w)=-\mathbb{E}_{(x,\,y^{\star})\sim\mathcal{B}}\ \log p_g(y^{\star}\mid w,x)
\tag{4}
$$

三步交替执行, 直到奖励收敛. 论文 Table 1 列出的超参只有四个:

| 超参 | 含义 | 影响 |
|---|---|---|
| $b$ | 每轮的 prompt 数 | 用于并行 |
| $1/K$ | 接受率 | $K$ 越大, 留下的样本奖励越高 |
| $\lambda$ | 采样温度 | $\lambda$ 越大, 生成越多样 |
| $\beta$ | KL 系数 (可选) | 控制模型离初始模型多远, 见第 4 节 |

排序只在同一个 prompt 的 $K$ 条之间做. 奖励模型是用同一 prompt 下的成对比较训练的, 不同 prompt 之间的绝对分数没有可比性. 排序只看相对大小, 所以 RAFT 对奖励的尺度和平移不敏感. 论文据此提出一个假设: RAFT 对奖励噪声也比 PPO 稳 (附录 A.3, 见 7.2 节).

论文给的解释是: RAFT 在反复学习当前模型诱导出的 best-of-$K$ 策略. best-of-$K$ 在推理阶段采 $K$ 条取奖励最高的一条输出, Nakano 等 (WebGPT) 和 Cobbe 等都用过, 效果能和 RLHF 基线相当, 代价是每次回答都要生成 $K$ 次. RAFT 把这部分推理成本移到训练里, 部署时只生成一次.

![同一 prompt 采 K 条: RAFT 只留 top-1, 对照路径把 K 条全用](./images/fig-raft-keep-top1-vs-all.png)

**图 1 解析**

- 同一 prompt 采 4 条回复并打分. 上栏是 RAFT: 只有奖励最高的那条进入排序框后的交叉熵, 其余三条用虚线连到「discard K-1」, 它们参与了排序, 不参与更新.
- 下栏把 4 条全部送入更新, 对应 RLOO 一类方法.
- 两栏用的是同样的采样预算, 区别只在更新时用几条样本, 以及是否用到奖励的数值.

用 RLOO 一文里的同一组奖励 $(2.0,\ 0.5,\ 1.5,\ -0.5)$ 对照两种更新:

| $i$ | $r_i$ | RAFT | RLOO 留一优势 |
|---|---|---|---|
| 1 | $2.0$ | 进入 SFT, 权重 1 | $+1.500$ |
| 2 | $0.5$ | 丢弃 | $-0.500$ |
| 3 | $1.5$ | 丢弃 | $+0.833$ |
| 4 | $-0.5$ | 丢弃 | $-1.833$ |

RAFT 的梯度里只有 $y_1$. 第 3 条的奖励 1.5 和第 1 条只差 0.5, 和第 4 条一样被丢掉; 第 4 条明显很差, 也不会被压低概率. 如果奖励模型把第 1 条和第 3 条的分数排反了, RAFT 学的就是另一条. RLOO 则按奖励差给每条加权, 两条分数接近时, 排反了影响也小.

### 3.1 $K$ 的收益上界

$K$ 越大, 选出的样本奖励越高. 论文给出的界是 (§3.2):

$$
\mathbb{E}_{y\sim p_g}\,r(x,y)\ \le\ \mathbb{E}_{y_1,\dots,y_K\sim p_g}\,\max_{i\le K} r(x,y_i)\ \le\ \mathbb{E}_{y\sim p_g}\,r(x,y)+\sqrt{\frac{B^{2}}{2}\log K}
\tag{5}
$$

左边的不等号是平凡的: 最大值不小于任意一个样本. 右边可以这样得到. 设奖励落在一个宽度为 $B$ 的区间里. 由 Hoeffding 引理, 有界变量减去均值后是方差代理为 $B^2/4$ 的亚高斯变量. $K$ 个方差代理为 $\sigma^2$ 的亚高斯变量, 其最大值的期望不超过均值加 $\sigma\sqrt{2\log K}$ (对 $\exp(s\max_i)$ 用 Jensen 不等式, 再把最大值放大成求和, 对 $s$ 取最优即可). 代入 $\sigma=B/2$:

$$
\frac{B}{2}\sqrt{2\log K}=\sqrt{\frac{B^2}{4}\cdot 2\log K}=\sqrt{\frac{B^{2}}{2}\log K}
\tag{6}
$$

这个界随 $\sqrt{\log K}$ 增长. $K$ 从 8 增加到 32, 生成量变成 4 倍, $\sqrt{\log K}$ 只从 $1.44$ 增加到 $1.86$, 涨约 29%. 论文据此说明单轮加大 $K$ 收益递减很快, 要靠迭代: 每一轮模型本身变好, 式 (5) 左右两端一起往上移.

### 3.2 实现

三步之间只通过文件或内存里的样本列表交换数据, 每一步都可以换成现成的工具: 采样用推理引擎, 打分用奖励模型的批量前向, 微调用普通 SFT 训练脚本.

```python
def raft_round(policy, reward_model, prompts, K, temperature):
    """一轮 RAFT, 返回过滤集 B. 三个阶段可以分别加载模型."""
    # 第 1 步: 每个 prompt 采 K 条
    samples = {x: policy.generate(x, n=K, temperature=temperature) for x in prompts}
    # 第 2 步: 组内排序, 只留最高分
    filtered = []
    for x, ys in samples.items():
        scores = [reward_model.score(x, y) for y in ys]
        best = max(range(K), key=lambda j: scores[j])
        filtered.append((x, ys[best]))
    return filtered

# 第 3 步: 在 filtered 上做标准 SFT, 得到下一轮的 policy
```

`policy.generate` 和 `reward_model.score` 在第 1, 2 步之后就可以从显存卸掉. 论文的 KL 版本只改第 2 步的打分: 用式 (9) 的 $\tilde r$ 代替 $r$, 需要当前模型和初始模型对每条回复各算一次序列 log 概率. 第 3 步的 SFT 和普通指令微调没有区别, 学习率, epoch 数和调度沿用 SFT 的设置即可; 论文每轮 2 个 epoch, 学习率 $2\times10^{-5}$, 线性衰减.

过滤集是普通的 (prompt, 回复) 数据, 可以在进入第 3 步之前做检查和清洗. 8.1 节的奖励投机就是在这一步发现的.

![RAFT 迭代三步: 采样, 排序, SFT, 再把新模型送回下一轮](./images/fig-raft-iter-loop.png)

**图 2 解析**

- 从左到右是一轮: $G_t$ 对每个 prompt 采 $K$ 条, 按奖励取 $\arg\max$, 得到大小为 $b$ 的过滤集 $\mathcal{B}$, 再做 SFT. $\mathcal{B}$ 的大小是 $b$, 生成量是 $bK$.
- 第 2 步只有一个选择操作 $\arg\max$, 没有均值和标准差.
- 底部唯一的回边标着「$G_{t+1}$ becomes $G_t$」, 表示下一轮从新模型重新采样.

## 4. 可选的 KL 正则

只优化奖励, 流畅性和多样性往往会下降, 文献里称为对齐税 (alignment tax). 论文给目标加一个正则项 $Q(w)$ (论文式 (3)):

$$
\max_{w}\ \Bigl[\mathbb{E}_{x\sim\mathcal{D},\ y\sim p_g(\cdot\mid w,x)}\ r(x,y)-\beta\,Q(w)\Bigr]
\tag{7}
$$

$Q$ 取到初始模型 $G_0$ 的 KL (论文式 (4)):

$$
Q(w)=\mathbb{E}_{x\sim\mathcal{D}}\ \mathrm{KL}\bigl(p_g(\cdot\mid w,x)\ \|\ p_{G_0}(\cdot\mid w_0,x)\bigr)
\tag{8}
$$

论文说明选这个方向的原因: 要让式 (8) 小, 当前模型就不能在初始模型概率很小的回复上放太多概率; 某条回复在初始模型下几乎不可能出现, 这一项也会阻止更新后的模型生成它. 对称的 JS 散度和反方向的 KL 都没有这个性质. 把式 (8) 并入逐条奖励 (论文式 (5)):

$$
\tilde r(x,y)=r(x,y)-\beta\log\frac{p_g(y\mid w,x)}{p_{G_0}(y\mid w_0,x)}
\tag{9}
$$

$\beta>0$ 时, 第 2 步改用 $\tilde r$ 排序. 打分阶段多算两次前向: 当前模型和初始模型各一次. 第 3 步的 SFT 不变.

这一项只改变谁被选中, 不进入损失. PPO 的 KL 罚直接改写逐 token 奖励, 再经优势进入梯度; RAFT 这里没有比率, 没有 $1\pm\epsilon$ 的裁剪区间, 也没有逐 token 的奖励分配.

实验上, 论文发现即使不加 KL ($\beta=0$), RAFT 对齐后的困惑度和多样性也比较稳定. 在 $K=8$, 温度 1.0 下扫 $\beta\in\{0,0.005,0.01,0.1\}$ (Table 7, Figure 3): $\beta$ 越大, 离初始模型的 KL 越小, 测试奖励也随之下降, 分别为 2.143, 2.087, 2.038, 2.029. 困惑度和多样性在各档 $\beta$ 之间变化不大. PPO 的情况不同, 加大 KL 罚能明显改善困惑度; 作为对照, PPO-KL-0.05 的测试奖励 2.16, 困惑度 4.469. 论文的结论是 RAFT 里 KL 的作用主要是控制离初始模型多远.

## 5. 计算上的特点

### 5.1 一次只加载一个模型

数据收集和模型更新完全分开. 采样阶段的计算不需要为后面的反向传播保留. 三步可以分别执行, 每一步只加载需要的那个模型: 采样时加载生成模型, 打分时加载奖励模型, 微调时再加载生成模型. 只要硬件能对某个尺寸的模型做 SFT, 就能用 RAFT 对齐它. 采样阶段还可以用批量推理和模型并行加速.

on-policy 的 PPO 每一步都要拿到当前策略的 log 概率, 参考模型的 KL, Critic 的价值估计和奖励模型的分数, 四个模型需要同时在显存里.

奖励的平移对 RAFT 没有影响. 附录里为了让 PPO 的初始奖励接近 0, 给 3B 奖励模型的分数减了 4.82, 给 13B 奖励模型减了 14.4. 线性变换不改变 $\arg\max$, RAFT 不需要这一步. 附录 Figure 7 还报告了 Open-LLaMA-13B 奖励模型在 6K 验证样本上的准确率 81.73%, 比主实验的 3B 模型高. 正文已经说明, 奖励模型换到 7B 时 PPO 在这套硬件上就显存不足; RAFT 的打分阶段单独加载奖励模型, 不受这个限制.

### 5.2 墙钟时间

论文按「连续三轮奖励在同一水平附近振荡」判定收敛, 训练不早停. 温度 1.0 下, 三次运行的平均墙钟时间是: $K=8$ 约 5 小时, $K=16$ 约 6.05 小时, $K=32$ 约 7.05 小时. 时间增加主要来自推理. $K=16$ 和 $32$ 一般 10 到 12 轮收敛, $K=8$ 要 15 到 18 轮, 收敛更快抵消了一部分额外的生成开销, 也减少了在三个阶段之间切换时反复加载模型的开销. 最快的 PPO 配置 (KL 0.01, LoRA) 约 8.7 小时收敛, 比所有全参数的 RAFT 实验都慢.

因为采样和训练分开, 只加速推理的技术可以直接用在第 1 步. 论文提到推测解码 (Leviathan 等 2023) 能带来 2 到 3 倍的推理加速.

### 5.3 采样模型和训练模型可以不同

论文用 LLaMA-7B-SFT 作教师 ($K=32$, $\lambda=0.85$) 生成并筛选样本, 拿来微调 GPT-Neo-2.7B (Table 8). 学生的测试奖励从 $-1.23$ 升到 0.739; 只用学生自己生成的样本做 RAFT, 只到 0.210. 学生的困惑度也比起点低. 作者推测是因为 GPT-Neo-2.7B 没有先在 HH-RLHF 上做 SFT, 起点对这个数据集了解不足.

### 5.4 扩散模型

同样的三步也用在了 Stable Diffusion v1.5 上. SD-1.5 在 $256\times256$ 分辨率下生成质量很差, 论文用 CLIP 美学评分作奖励, CIFAR-10 的十个类名作 prompt, 用 RAFT 恢复这个分辨率下的生成能力, CIFAR-100 类名这类域外 prompt 也有提升 (Table 9). 和扩散模型对齐方法 DDPO (Black 等 2023) 比, 两者指标相近, DDPO 的计算开销约为 RAFT 的 50 倍. DDPO 把去噪过程建成 MDP; RAFT 把整张图当作 contextual bandit 的一个动作.

## 6. 与相邻方法的分界

**RRHF.** Yuan 等同期独立提出的 RRHF 也是筛选高奖励样本再微调, 但数据来自多种来源. RAFT 的主路径用当前模型自己在线生成的样本, 收集数据的行为策略随模型一起改进, 和 RL 的设定一致.

**Self-Instruct.** Wang 等 2022 也用模型自己的输出提升模型, 场景是指令微调, 筛选主要靠启发式规则: 指令太长或太短, 输出重复了输入, 指令和已有指令太像. RLHF 里已有从比较数据训出来的偏好奖励, RAFT 用它来筛选.

**PPO.** 按 token 建模动作, 用 Critic 和 GAE 估优势, 用比率裁剪限制步长. 论文的 PPO 基线: 裁剪 0.2, GAE $\lambda=0.95$, 折扣 1, KL 系数在 $\{0.01,0.05,0.1\}$ 里搜 (主表取 0.1), 学习率在 $\{5\times10^{-6},10^{-5}\}$ 里搜, LoRA 秩 16, $\alpha$ 32, dropout 0.05, KL 系数按 Ziegler 等的做法动态调整 (TRL 默认).

**RLOO.** 同样每个 prompt 采 $k$ 条, 但 $k$ 条都进入梯度, 第 $i$ 条的基线是其余 $k-1$ 条奖励的均值. RLOO 用到了奖励的数值, 低于基线的回复会被压低概率. RAFT 只用排序, 也没有负样本. Ahmadian 等在 TL;DR 和 HH 上把两者放在同一设定里比较 (RLOO 论文 Table 1): $k=4$ 时 GPT-4 胜率 RLOO 为 77.9, 43.7, 64.1, RAFT 为 73.2, 42.1, 63.3; $k=2$ 时 RLOO 为 74.2, 47.6, 62.2, RAFT 为 72.1, 37.7, 58.4. 那篇论文还发现, KL 系数调大到 $\beta\in\{0.25,0.5,1.0\}$ 时, RAFT 的奖励比 RLOO 低, 离参考策略也更远.

**GRPO.** 去掉了 Critic, 组内减均值再除标准差, 保留 PPO 式裁剪. 组内奖励几乎相同时, 除以标准差会把很小的差别放大. RAFT 在这种情况下只是随机留下一条, 损失还是普通 SFT.

**DPO.** 不训练单独的奖励模型, 也不在线采样, 偏好对直接进损失. RAFT 需要奖励模型和在线采样. 只有奖励模型, 没有成对偏好数据时, DPO 无法直接用, RAFT 可以.

**Best-of-N 与 BOND.** 推理阶段的 best-of-$N$ 不更新参数. BOND 把 best-of-$N$ 分布用 Jeffreys 散度蒸馏回策略. RAFT 用交叉熵学每轮的最高分样本, 每轮的目标分布随模型变化.

| | PPO | GRPO | RLOO | RAFT |
|---|---|---|---|---|
| 进入更新的样本 | 当前 rollout | 组内 $G$ 条 | $k$ 条 | 每组 1 条 |
| 基线 | Critic + GAE | 组均值 (含自己), 除标准差 | 其余 $k-1$ 条均值 | 无, 只用排名 |
| 用到奖励数值 | 是 | 是 | 是 | 只用相对大小 |
| 裁剪 | 有 | 有 | 无 | 无 |
| 额外训练的网络 | Critic | 无 | 无 | 无 |
| 同时加载的模型 | 4 个 | 策略, 奖励, 参考 | 策略, 奖励, 参考 | 1 个 |
| 损失形式 | 裁剪代理目标 | 裁剪代理目标 | 加权 log 似然 | 交叉熵 |

## 7. 实验

### 7.1 设定

**数据和模型.** LLaMA-7B, HH-RLHF (112K 训练, 12.5K 测试), 每条样本是一个 prompt 加 chosen 和 rejected 两条回复. 先在 chosen 回复上做 1 个 epoch 的 SFT, 得到 LLaMA-7B-SFT, 作为 RAFT 和 PPO 的共同起点. 奖励模型用 Bradley-Terry 成对损失训练, 底座 Open-LLaMA-3B, 正文报告验证准确率 75.48%, 公开的 GPT-J-6B 奖励模型为 68%. 训练奖励模型时还用了测试集的前 6275 对, 其余测试数据留作评估. prompt 截在 256 token, 超长的丢弃, prompt 集从 112K 降到 82147 条.

**训练.** RAFT 每轮 $b=2048$, SFT 学习率 $2\times10^{-5}$, 每轮训练 2 个 epoch, 线性衰减. 生成最多 128 个新 token. PPO 的生成配置沿用 TRL, 没有调, 论文的理由是生成配置复杂时 KL 估计可能出错.

**评估.** 所有方法用同一套测试配置, 在 4608 条留出样本上算平均奖励; 困惑度在 6K 条留出样本的 chosen 回复上算. 多样性指标用 GEM-metrics: MSTTR, Distinct-1/2, Unique-1/2.

### 7.2 主结果

| 模型 | 奖励 | 困惑度 | MSTTR-100 | Distinct-2 | 长度 |
|---|---|---|---|---|---|
| HH-RLHF rejected | 0.156 | 无 | 0.623 | 0.284 | 144.3 |
| HH-RLHF chosen | 1.873 | 无 | 0.624 | 0.282 | 154.2 |
| LLaMA-7B | $-0.435$ | 4.781 | 0.579 | 0.258 | 119.9 |
| LLaMA-7B + SFT | 0.772 | 3.781 | 0.597 | 0.250 | 145.4 |
| SFT + PPO | 2.077 | 4.156 | 0.597 | 0.262 | 127.8 |
| SFT + RAFT-K32 ($\lambda=1.0$) | **2.294** | 4.031 | 0.611 | 0.258 | 156.2 |

上表摘自 Table 3. SFT 把奖励从 $-0.435$ 提到 0.772, 仍低于数据集里 chosen 回复的 1.873. PPO 和 RAFT 都超过了这条线. RAFT-K32 奖励最高, 困惑度低于 PPO, 平均回复更长. 温度 1.0 的 RAFT 在多样性指标上始终高于 SFT 模型. 表中没列的 Unique-2 (不重复 2-gram 的个数) 差别更明显: RAFT-K32 为 123576, SFT 为 110759, PPO 为 102437, PPO 比它的起点 SFT 还少. Distinct-1 三者接近, RAFT-K32 为 0.032, PPO 为 0.033, SFT 为 0.031, 比例指标看不出这个差别.

论文 Figure 1 右图按困惑度画测试奖励: 奖励超过 1.85 以后, 同样的困惑度下 RAFT 的奖励更高. Figure 1 左图是 $K=8$, $\lambda=0.85$ 的训练曲线, RAFT 模型和它的 best-of-8 策略一起上升, 困惑度在训练中比较平稳; PPO 的困惑度随奖励上升变差得快.

**GPT-4 和人工评估 (Table 4).** 从测试集随机取 100 个 prompt, 温度 1.0. GPT-4-0613 对每对回复交换顺序评两次, 两次结果合成最终判定 (两次都胜, 或一胜一平, 记为胜; 一胜一负记为平). 人工评估由 7 名专家在看不到模型标签的情况下完成.

| 模型 A | 模型 B | GPT-4 胜/负/平 | 人工 胜/负/平 |
|---|---|---|---|
| RAFT-K32 | PPO $\beta=0.1$ | 65 / 32 / 3 | 66 / 14 / 20 |
| RAFT-K32 | PPO $\beta=0.05$ | 69 / 28 / 3 | 44 / 32 / 24 |
| RAFT-K32 | RAFT-K8 | 48 / 37 / 15 | 40 / 24 / 36 |

两种评估和自动指标方向一致. 人工评审给「平」更多, GPT-4 的判断更果断.

### 7.3 $K$ 和温度

**$K$ (Table 5, $\lambda=0.85$).** $K=8, 16, 32$ 的测试奖励为 2.180, 2.251, 2.329, 困惑度都是 3.953. $K=32$ 的多样性指标不低于 $K=8$ 和 $16$. 论文建议在算力允许的范围内取最大的 $K$.

**温度 (Table 6, $K=8$).**

| $\lambda$ | 测试奖励 | 初始 best-of-$K$ 奖励 |
|---|---|---|
| 0.7 | 2.198 | 3.41 |
| 0.85 | 2.180 | 2.91 |
| 1.0 | 2.143 | 2.48 |
| 1.0 ($K=32$) | 2.294 | 3.43 |

温度越高, 初始模型的 best-of-8 奖励越低, 学习目标变低, 最终测试奖励略降. 温度的影响小于 $K$. $\lambda=0.7$ 时测试奖励比训练奖励低得多, 论文认为高温度有助于泛化. $\lambda=1.0$ 的多样性最好 (MSTTR-100 0.605, Distinct-2 0.263). 温度再往上加, LLaMA-7B-SFT 会生成带随机怪异符号的回复, 学习变得不稳. 论文的建议是先检查初始 SFT 模型筛出的样本, 在生成质量还正常的范围内取最大的温度, 再用更大的 $K$ 补回奖励, 表的最后一行就是这种做法.

## 8. 奖励模型的缺陷

### 8.1 奖励投机

论文早期版本的实验里, 奖励模型错误地偏好含 emoji 和 `#` 的回复. 模型的输出分布很快塌缩, 在回复的随机位置插入 emoji 和 `#`. 这是通过过滤集的多样性指标快速下降发现的. 处理办法是对过滤集再做一次清洗, 删掉或修正这些样本. 这依赖 RAFT 的一个特点: 每轮要学的数据是一个可以直接检查的数据集. PPO 的奖励直接进入优势和梯度, 没有这样一个中间产物.

### 8.2 奖励噪声 (附录 A.3)

论文用 RAFT-K32 ($\lambda=1.0$) 和 PPO 比较三种噪声, 都不对奖励做中心化:

1. 所有样本: $\tilde r(x,y)=r(x,y)+\mathcal{N}(0,1)$.
2. 按 prompt: 每个 prompt 以 0.2 的概率从 $\{-0.75,-0.25,0.5,1\}$ 抽一个偏置 $a(x)$, 该 prompt 下所有回复都加 $\mathcal{N}(a(x),1)$.
3. 按样本: 每个 $(x,y)$ 以 0.2 的概率抽偏置 $a(x,y)$, 加 $\mathcal{N}(a(x,y),1)$.

结果 (Figure 9): 噪声让 PPO 收敛慢很多, 真实奖励下降; 噪声带偏置时, PPO 最后收敛到另一个模型. 论文的解释是任何对奖励的扰动都会进入 Critic 和 Actor 的训练. RAFT 和无噪声时相比变化不大: 噪声只在部分情况下让次优样本进入训练集, 训练集的整体奖励仍远高于当前模型. 第 2 种噪声的偏置只依赖 prompt, 对同一 prompt 的所有回复是同一个平移, 不改变组内排序, RAFT 不受影响.

这和 Ahmadian 等 (RLOO 论文) 的结论可以放在一起读. 那边的噪声是每条样本独立的 $\mathcal{N}(0,\sigma^2)$, $\sigma$ 取到 3 和 5, 对照组是 RLOO. 强噪声下组内排序被打乱, RAFT 的奖励下降比 RLOO 多. 两篇的结论并不矛盾: 和要训练 Critic 的 PPO 比, RAFT 更稳; 和同样用多样本但按奖励差加权的 RLOO 比, RAFT 更依赖排序的准确性.

### 8.3 奖励过优化

奖励模型总有缺陷, 优化过头会出现 Gao 等描述的过优化: 代理奖励上升, 真实奖励下降. 论文另训两个奖励模型作代理, 底座分别是 GPT-2 (124M) 和 GPT-Neo-1.3B, 用 Open-LLaMA-3B 奖励模型近似真实奖励. 三者的测试准确率是 0.642, 0.698, 0.756 (Table 11). 用代理奖励训练 RAFT 和 PPO, 同时记录真实奖励: 两种方法都出现了过优化. 论文建议早停. 换用 RAFT 这种训练方式, 并不能消除奖励模型本身的缺陷.

## 9. 失效模式与适用边界

| 现象 | 原因 | 处理 |
|---|---|---|
| 排序出错时直接学错 | 只用 $\arg\max$ 一条 | 提高奖励模型准确率; 强噪声场景考虑 RLOO |
| 组内奖励几乎相同 | 选出的样本接近随机 | 换更有区分度的 prompt, 或增大 $K$ |
| 差回复的概率不会被主动压低 | 没有负样本 | 需要显式惩罚时改用带基线的策略梯度 |
| 代理奖励上升, 真实奖励下降 | 奖励模型过优化 | 早停, 用独立的评估模型监控 |
| 过滤集多样性骤降 | 奖励投机 | 检查并清洗过滤集 |
| 温度过高时样本出现乱码 | 模型容量有限 | 先检查初始过滤集, 再定温度 |
| $K=1$ | 没有可排序的对象 | 退化为在自己的样本上做 SFT |
| 用全局排序 | 不同 prompt 的奖励不可比 | 论文主实验用组内排序 |

**全局排序.** 附录给出一个变体: 每个 prompt 只采 1 条, 在整个 batch 里取奖励最高的 $1/K$ 作训练集. 它更省样本, 但 HH-RLHF 的奖励模型是按同一 prompt 的比较训练的, prompt 本身对奖励影响很大, 跨 prompt 比较没有意义, 所以论文主要用组内排序. 奖励在不同 prompt 之间可比时, 全局排序可以用.

**长度.** 第 3 步对整条 $y^{\star}$ 做 token 级交叉熵, 长回复包含更多 token, 在损失中权重更大. Table 3 里 RAFT 的平均长度是 156.2, PPO 是 127.8. 如果奖励模型偏好长回复, 筛选和交叉熵会一起推动回复变长.

## 参考文献

1. Dong, H., Xiong, W., Goyal, D., Zhang, Y., Chow, W., Pan, R., Diao, S., Zhang, J., Shum, K., Zhang, T. *RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment*. TMLR, 2023. arXiv:2304.06767. OpenReview: m7p5O7zblY.
2. Ahmadian, A. 等. *Back to Basics: Revisiting REINFORCE Style Optimization for Learning from Human Feedback in LLMs*. ACL 2024. arXiv:2402.14740.
3. Ouyang, L. 等. *Training Language Models to Follow Instructions with Human Feedback*. NeurIPS 2022. arXiv:2203.02155.
4. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., Klimov, O. *Proximal Policy Optimization Algorithms*. arXiv:1707.06347, 2017.
5. Ziegler, D. M. 等. *Fine-Tuning Language Models from Human Preferences*. arXiv:1909.08593, 2019.
6. Bai, Y. 等. *Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback*. arXiv:2204.05862, 2022.
7. Nakano, R. 等. *WebGPT: Browser-Assisted Question-Answering with Human Feedback*. arXiv:2112.09332, 2021.
8. Cobbe, K. 等. *Training Verifiers to Solve Math Word Problems*. arXiv:2110.14168, 2021.
9. Gao, L., Schulman, J., Hilton, J. *Scaling Laws for Reward Model Overoptimization*. ICML 2023. arXiv:2210.10760.
10. Yuan, Z. 等. *RRHF: Rank Responses to Align Language Models with Human Feedback without Tears*. arXiv:2304.05302, 2023.
11. Black, K. 等. *Training Diffusion Models with Reinforcement Learning*. arXiv:2305.13301, 2023.
12. Leviathan, Y., Kalman, M., Matias, Y. *Fast Inference from Transformers via Speculative Decoding*. ICML 2023.
13. Ramamurthy, R. 等. *Is Reinforcement Learning (Not) for Natural Language Processing: Benchmarks, Baselines, and Building Blocks for Natural Language Policy Optimization*. arXiv:2210.01241, 2022.
14. Hu, E. J. 等. *LoRA: Low-Rank Adaptation of Large Language Models*. arXiv:2106.09685, 2021.
