---
title: "09 · RLVR 的局限性与探索边界"
published: true
tags: ["RLVR", "pass@k", "Yue", "DeepSeekMath", "ProRL", "探索边界"]
excerpt: "RLVR 训练后 pass@1 普遍上升, 但大 k 下的 pass@k 常被基座追上甚至反超. Yue 等用 pass@k 曲线, 集合差和困惑度说明数学上的 RLVR 主要在基座已会的题上提高采样效率; ProRL 在更长训练, 更杂任务和蒸馏起点上给出覆盖扩大的例子."
---
# 09 · RLVR 的局限性与探索边界

> 相关阅读: [4.6 偏好优化](../../4.6-偏好优化/4.6-偏好优化.md) · [01-GRPO](../01-GRPO/01-GRPO.md) · [4.4 ReMax](../../4.4-强化学习基础/06-ReMax-贪婪基线/06-ReMax-贪婪基线.md) · [02-Dr.GRPO](../02-DrGRPO-去标准差/02-DrGRPO-去标准差.md) · [08-JustRL](../08-JustRL-极简配方/08-JustRL-极简配方.md) · [4.8.3 SFT 与 RL 的融合](../../4.8-推理与Agent能力/4.8.3-SFT与RL的融合策略/4.8.3-SFT与RL的融合策略.md)

材料是三组一手实验: DeepSeekMath (arXiv:2402.03300) §5.2.2 的 Maj@K 与 Pass@K 对比, Yue 等 (arXiv:2504.13837) 在数学, 代码, 视觉上的大 $k$ pass@$k$ 测量, 以及 NVIDIA 的 ProRL (arXiv:2505.24864). 问题是可验证奖励的 RL (RLVR) 提高的是「已经会的题更常做对」, 还是「基座做不出的题也能做出来」.

## 1. 指标与早期观察

### 1.1 pass@1 与大 k 的 pass@k

RLVR 用可以自动判对错的奖励训练策略: 数学对最终答案, 代码跑单元测试. 记策略为 $\pi_\theta$, 校验器 $V(x,y)\in\{0,1\}$ 对题 $x$ 和回答 $y$ 给分, 训练目标是 $\mathbb{E}_{x}\mathbb{E}_{y\sim\pi_\theta}[V(x,y)]$, 即平均单次正确率.

pass@$k$ 的定义是: 对一道题采 $k$ 次, 只要有一次通过校验就记为 1, 再对题目求平均. 它问的是一道题是否还在模型能采到的范围内, 平均正确率问的是采一次做对的概率. Yue 等按 Chen 等 (2021) 的无偏估计计算: 每道题采 $n\ge k$ 次, 其中 $c$ 次正确,

$$
\widehat{\mathrm{pass@}k}=\mathbb{E}_{x}\left[1-\frac{\binom{n-c}{k}}{\binom{n}{k}}\right]. \tag{1}
$$

只用 $k$ 次采样直接算会有很大方差. Yue 等把 $n$ 取成曲线最右端的 $k$: MATH500, Minerva, GSM8K 用 $n=128$, AMC23 和 AIME24 用 $n=1024$.

单题上 pass@$k$ 与单次正确率 $p$ 的关系是 $1-(1-p)^k$. 这个式子说明了两类变化的不对称. 一道题 $p$ 从 0.3 升到 0.9, pass@1 涨 0.6, pass@256 几乎不变 (都接近 1). 另一道题 $p$ 从 0.01 降到 0, pass@1 只跌 0.01, pass@256 却从 $1-0.99^{256}\approx0.92$ 跌到 0. RL 若把概率质量从后一类题挪到前一类题上, 平均正确率会明显上升, 大 $k$ 覆盖反而下降.

Maj@K 是另一个指标: 采 $K$ 次后做多数投票, 看票数最多的答案是否正确. 它衡量的是在已有覆盖内能否稳定挑出正确答案, 与 pass@$k$ 衡量的覆盖范围不同.

### 1.2 DeepSeekMath 的早期观察

Shao 等在 DeepSeekMath §5.2.2 比较了 DeepSeekMath-Instruct 7B 和在它之上做 GRPO 得到的 DeepSeekMath-RL 7B. Figure 7 在 GSM8K 和 MATH 上画 Maj@K 和 Pass@K 曲线, 温度 0.7, 图注写的是「It was noted that RL enhances Maj@K but not Pass@K」. 论文的解释是 RL 让输出分布更稳健, 提升似乎来自把正确回答从 TopK 中提到更容易采到的位置, 而非基本能力的增强. Figure 7 只有曲线, 各 $K$ 的数值没有列成表.

论文给出的另一个原因是数据和采样方式: RL 只用了指令微调阶段的题, 采样用的是朴素的 nucleus sampling. 作者认为这可能是 RL 只提高 Maj@K 的原因, 并把分布外的题和基于树搜索的解码列为后续方向.

同一篇论文中有三组数字容易混在一起. 训练设置是每题采 64 条, 最长 1024 token, batch 1024, KL 系数 0.04, 这里的 64 是 GRPO 的组大小. Table 5 是单次解码的结果: Instruct 7B 在 GSM8K 和 MATH 上为 82.9% 和 46.8%, RL 7B 为 88.2% 和 51.7%. Figure 7 才是 Maj@K 和 Pass@K. 三者是不同的量.

## 2. Yue 等: 大 k 下基座反超

### 2.1 实验设置

Yue 等 *Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?* 把同样的问题推到更大的 $k$ 和更多模型族. Table 1 列出设置:

| 任务 | 起点 | RL 框架 | 基准 |
|------|------|---------|------|
| 数学 | LLaMA-3.1-8B, Qwen2.5-7B/14B/32B-Base, Qwen2.5-Math-7B | SimpleRLZoo, Oat-Zero, DAPO | GSM8K, MATH500, Minerva, Olympiad, AIME24, AMC23 |
| 代码 | Qwen2.5-7B-Instruct-1M, R1-Distill-Qwen-14B | Code-R1, DeepCoder | LiveCodeBench, HumanEval+, MBPP+ |
| 视觉 | Qwen2.5-VL-7B | EasyR1 | MathVista, MathVision |
| 深入分析 | Qwen2.5-7B-Base | VeRL (六种算法) | Omni-MATH-Rule, MATH500 |

数学主实验用 SimpleRLZoo 发布的 zero-RL 模型, 在 GSM8K 和 MATH 训练集上用 GRPO 训练, 只有正确性奖励, 没有格式奖励. 另外加入在 AIME24 上表现很强的 Oat-Zero-7B 和 DAPO-32B.

评测协议: 温度 0.6, top-p 0.95, 最长生成 16384 token. 基座评测通常加 few-shot 示例, Yue 等有意不加, 避免上下文示例影响推理. 基座与对应 RL 模型用相同的 prompt.

数学有「答案猜对但推理错」的风险. 论文按 Brown 等 (2024) 的做法人工检查: GSM8K 中平均正确率低于 5% 但大于 0 的题, 基座答出 25 题, 其中 24 题至少有一条正确 CoT; RL 模型答出 25 题, 其中 23 题有. AIME24 先做一步过滤: 让 Qwen2.5-7B-Base 不写 CoT 直接给答案, 多次采样, 能以低但非零的概率 (例如低于 5%) 猜中的题被视为可猜题并去掉, 30 题剩 18 题. 过滤后的 AIME24 上, 基座与 RL 模型的 pass@$k$ 曲线 (Figure 13) 与未过滤时趋势相同. 在剩下的题中, 平均正确率低于 5% 的, 基座答出 7 题, 6 题中有 5 题含正确 CoT (另 1 题推理步骤有跳跃, 对错难判); RL 模型答出 6 题, 其中 4 题有. Figure 20 和 21 还给出从 AIME24 最难题的 2048 次采样中人工挑出的基座正确 CoT, 篇幅长, 带反思.

### 2.2 数学, 代码, 视觉上的曲线

Figure 2 的趋势在所有数学基准上一致: $k$ 小 (包括 $k=1$) 时 RL 模型更高; $k$ 增大后基座曲线更陡, 最终追上并反超. 例如 32B 模型在 Minerva 上, $k=128$ 时基座比 RL 模型高约 9 个百分点, 相当于多解出约 9% 的题. Figure 11 中 Oat-Zero-7B 和 DAPO-32B 在 AIME24 上起点比基座高近 30 个百分点, 大 $k$ 时仍被基座追上.

代码方面, CodeR1-Zero 从 Qwen2.5-7B-Instruct-1M 出发, 用 12K 道 LeetCode 和 TACO 题训练 832 步; DeepCoder-14B 生成长度 32k. 在 LiveCodeBench v5 (2024 年 8 月至 2025 年 1 月, 共 279 题), HumanEval+ 和 MBPP+ 上曲线形状与数学相同. 代码靠单元测试判分, 几乎不可能猜中, 这组结果对「猜答案」质疑更有说服力.

视觉方面, EasyR1 在 Geometry3K 上训练 Qwen2.5-VL-7B, 评测在去掉选择题的 MathVista 和 MathVision 子集上进行, 同样是小 $k$ RL 高, 大 $k$ 基座反超. 人工检查平均正确率低于 5% 的题, 两个模型都是 8 题中 7 题至少有一条正确 CoT.

![RLVR 把质量堆到已知路径, 大 k 覆盖可能变窄](../images/fig-rlvr-passk-boundary.png)

> 图 1: 同一个 prompt $x$, 左边是基座, 右边是 RLVR 后的策略, 两边都采很多条 $y$. 基座采样更宽, 稀有的正确路径还在支撑集里; RLVR 把概率质量集中到已知的高奖励路径上. 实线汇入 pass@1, 虚线汇入大 $k$ 的 pass@$k$.

**图 1 解析**

- 顶部只有 Prompt $x$, 两条箭头都标「sample many $y$」, 比较的是相同采样预算下的分布形状.
- 左框 Base $\pi$: wide sampling, rare correct path still in support. 右框 RLVR $\pi$: peaked sampling, mass on known high-reward paths.
- 两框各有一条实线汇入左下的 pass@1 框, 标签分别是 coverage 和 efficiency, 框内写 RLVR higher.
- 虚线汇入右下的 pass@$k$ ($k=128/256$) 框, 左边的虚线标 still hits rare correct, 右边标 misses some base-solvable, 框内写 base often higher. 两条虚线对应第 2.3 节 Table 2 的集合差.

### 2.3 覆盖收缩的三种证据

**正确率直方图**. Figure 5 是 Qwen2.5-7B 在 Minerva 上逐题正确率的分布. RLVR 之后, 正确率接近 1.0 的题变多, 0.1, 0.2 一类的低正确率题变少; 但正确率恰好为 0 的题也变多了. 平均分的提升来自基座已能解的题上采样效率提高, 而不是解出了新题. 附录 Figure 14 给出其他 SimpleRLZoo 模型的直方图.

**集合差**. Table 2 按「基座能否解出」和「RL 模型能否解出」把题分成四类, AIME24 取 $k=1024$, MATH500 取 $k=128$:

| 类别 | AIME24 | MATH500 |
|------|-------:|--------:|
| 两者都能解 | 63.3% | 92.4% |
| 只有基座能解 | 13.3% | 3.6% |
| 只有 RL 能解 | 0.0% | 1.0% |
| 两者都不能解 | 23.3% | 3.0% |

AIME24 上没有一道题是只有 RL 模型能解的, MATH500 上这一类只占 1.0%; 只有基座能解的分别占 13.3% 和 3.6%. RL 模型能解的题几乎是基座能解的题的子集.

**困惑度**. 从 AIME24 随机取 2 道题, Qwen2.5-7B-Base 和 SimpleRL-Qwen2.5-7B-Base 各生成 16 条回答, 记为 $Y_{\mathrm{base}}$ 和 $Y_{\mathrm{RL}}$; OpenAI-o1 生成 8 条作为 $Y_{\mathrm{GT}}$. 用基座计算困惑度 $\mathrm{PPL}_{\mathrm{Base}}(Y\mid x)$. Figure 6 显示 $\mathrm{PPL}_{\mathrm{Base}}(Y_{\mathrm{RL}}\mid x)$ 的分布与 $\mathrm{PPL}_{\mathrm{Base}}(Y_{\mathrm{base}}\mid x)$ 分布的低端吻合, 即 RL 模型的回答正是基座本来就容易生成的那一部分. 附录 C.4 取训练早, 中, 末三个检查点, 每题采 32 条, 取 32 个困惑度的中位数, 再对前 10 道题求平均: $\mathrm{PPL}_{\mathrm{Base}}(Y_{\mathrm{RL}}\mid x)$ 随训练逐步下降. 论文据此认为 RLVR 主要在基座先验内部收紧分布.

作为对照, 蒸馏模型 DeepSeek-R1-Distill-Qwen-7B 的 pass@$k$ 曲线在所有 $k$ 上都高于 Qwen2.5-Math-7B 基座. 教师轨迹能把基座先验之外的推理模式写进模型, 这是 RLVR 在这组实验中没有做到的.

### 2.4 算法, 步数, 熵和规模

**六种算法**. Yue 等在 VeRL 中用同一套设置重新训练 PPO, GRPO, Reinforce++, RLOO, ReMax, DAPO: Qwen2.5-7B 基座, 去掉 KL, 学习率 $10^{-6}$ 恒定, prompt batch 256, 每题 8 条, 最长 8192 token, 温度 1.0, PPO mini-batch 256. 训练集是 Omni-MATH-Rule 的 2000 题, 域内测试 821 题, 域外用 MATH500. Table 3:

| 方法 | 训练 p@1 | 训练 p@256 | 测试 p@1 | 测试 p@256 | MATH500 p@1 | MATH500 p@256 |
|------|------:|------:|------:|------:|------:|------:|
| Base | 9.9 | 67.2 | 10.2 | 69.1 | 34.5 | 96.2 |
| GRPO | 26.1 | 66.3 | 25.1 | 68.3 | 74.4 | 97.2 |
| PPO | 27.2 | 65.8 | 26.8 | 69.2 | 75.2 | 97.2 |
| ReMax | 24.4 | 65.5 | 23.8 | 67.5 | 73.5 | 96.6 |
| RLOO | 28.6 | 66.4 | 28.1 | 69.2 | 75.0 | 97.4 |
| Reinforce++ | 28.2 | 67.7 | 28.0 | 69.7 | 75.4 | 96.8 |
| DAPO | 31.4 | 66.1 | 26.5 | 67.0 | 75.6 | 96.4 |

论文定义采样效率差距 $\Delta_{\mathrm{SE}}$ 为 RL 模型的 pass@1 与基座 pass@256 之差 (取绝对值, 越小越好):

$$
\Delta_{\mathrm{SE}}=\mathrm{pass@256}(\pi_{\mathrm{base}})-\mathrm{pass@1}(\pi_{\mathrm{RL}}). \tag{2}
$$

按 Table 3 的域内测试列计算, 基座 pass@256 为 69.1, 各方法的差距为: GRPO 44.0, PPO 42.3, ReMax 45.3, RLOO 41.0, Reinforce++ 41.1, DAPO 42.6. 最好的方法也差 41 个百分点. 换算法改变的是这个差距的一两个点, 改变不了量级. 各方法的 pass@256 与基座相差都在 2 个百分点以内, 有的略高有的略低.

**训练步数**. Table 4 是 GRPO 不同步数的检查点:

| 步数 | 训练 p@1 | 训练 p@256 | 测试 p@1 | 测试 p@256 | MATH500 p@1 | MATH500 p@256 |
|------|------:|------:|------:|------:|------:|------:|
| 150 | 26.1 | 66.3 | 25.1 | 68.3 | 74.4 | 97.2 |
| 300 | 33.6 | 65.3 | 27.1 | 66.6 | 75.4 | 96.0 |
| 450 | 42.5 | 64.3 | 28.3 | 63.9 | 76.3 | 95.4 |

训练集 pass@1 从 26.1 涨到 42.5, 同时三列 pass@256 都在下降. 测试集 pass@1 只从 25.1 涨到 28.3, 测试 pass@256 从 68.3 降到 63.9.

**其他因素**. 每题 rollout 数从 8 增到 32 时 pass@$k$ 略有改善, $n=32$ 的 pass@128 更高, 但这组只训了 220 步, 基座在大 $k$ 下仍然领先. 加入系数 0.001 的 KL 后, pass@1 与不加 KL 时相近, pass@128 低得多. RL 训练中输出熵通常下降 (Yu 等, 2025), 论文把 RL 模型的温度调高, 直到其输出熵与基座在 $T=0.6$ 时相当 (Figure 18): RL 模型在高温下的 pass@$k$ 比自己在 $T=0.6$ 时略好, 但仍低于基座. 熵下降是覆盖收缩的原因之一, 但单靠它解释不了全部. Figure 17 还显示基座在温度超过 1.0 后性能下降, RL 模型在不同温度下相对稳定, 所以正文统一用 0.6.

**规模**. 大模型上难以单独分离 RLVR 的作用: o1 的基座不公开, Qwen3-235B 经过多阶段训练. DeepSeek-R1-Zero 没有公开 API, 自行部署后吞吐只有约每秒 50 token, 最长 32k, 做 pass@$k$ 评测不现实. 论文改用 Magistral-Medium-2506 API, 它从 Mistral-Medium-3-2505 起纯 RL 训练, 推理能力与 DeepSeek-R1 相当. Figure 9 中, $k=1$ 时 RL 模型在 AIME24 上约多解 7 题, AIME25 上约多解 8 题; $k$ 增大后差距缩小. 结论在接近前沿的规模上仍然成立, 只是这组实验的规模更大, 论文称之为初步结果.

## 3. 能否让 RL 扩大覆盖

### 3.1 直接优化 pass@k 的梯度

一个自然的想法是把训练目标从 pass@1 换成 pass@$k$:

$$
J_k(\theta)=\mathbb{E}_{x}\left[1-\big(1-p_\theta(x)\big)^{k}\right],\qquad p_\theta(x)=\mathbb{E}_{y\sim\pi_\theta(\cdot\mid x)}\big[V(x,y)\big]. \tag{3}
$$

对 $\theta$ 求导,

$$
\nabla_\theta J_k(\theta)=\mathbb{E}_{x}\left[k\big(1-p_\theta(x)\big)^{k-1}\,\nabla_\theta p_\theta(x)\right]. \tag{4}
$$

式 (4) 说明三件事. 第一, 对每道题, pass@$k$ 的梯度方向与 pass@1 的梯度 $\nabla_\theta p_\theta(x)$ 相同, 只是乘了一个非负系数, 没有引入新的方向; 变化的只是不同题之间的相对权重. 第二, 系数 $k(1-p)^{k-1}$ 随 $p$ 增大迅速变小: $k=8$ 时, $p=0.1$ 的题系数约 3.83, $p=0.5$ 的题只有 0.0625, 相差约 60 倍; 在 $p$ 接近 1 时趋于 0, $k=8$, $p=0.9$ 时只有 $8\times0.1^{7}=8\times10^{-7}$; 训练把一道题做熟之后, 这道题对 $J_k$ 几乎不再贡献梯度. 第三, $p$ 为 0 的题, 采样中没有任何正确回答, 用采样估计的 $\nabla_\theta p_\theta(x)$ 为 0, 乘任何系数都还是 0. 所以 pass@$k$ 目标可以让训练更偏向低正确率的题, 但对完全采不到正确解的题无能为力, 而覆盖扩大恰恰需要从这一类题中得到信号.

### 3.2 ProRL: 更长的训练和更杂的任务

Liu 等的 ProRL 认为 Yue 一类结论可能来自方法上的限制: 只在数学上评测, 而数学在预训练中已大量出现; RL 训练只有几百步就停. 他们的配方是 GRPO 加 KL 惩罚,

$$
L_{\mathrm{KL\text{-}RL}}(\theta)=L_{\mathrm{GRPO}}(\theta)-\beta\,D_{\mathrm{KL}}\big(\pi_\theta\,\|\,\pi_{\mathrm{ref}}\big), \tag{5}
$$

并周期性地把参考策略 $\pi_{\mathrm{ref}}$ 重置为当前策略的快照, 同时重置优化器状态. 论文给出的理由是: KL 项把策略拉向参考策略, 随着训练进行, KL 项在损失中的比重会越来越大, 策略更新随之变小; 把参考策略换成较新的快照, 既保留了 KL 正则, 又让策略能继续远离基座. 重置的时机由一个从评测基准混合出的验证集决定, 验证集表现停滞或下降时就做一次硬重置. 附录 E 列出这个验证集的组成: AIME2024, Codeforces, GPQA-diamond, IFEval, 以及 Reasoning Gym 的 `graph_color`, 采样参数与正式评测相同, 只是上下文窗口与训练一致. 论文还提到, 每次硬重置也是调整超参数, 加入新训练数据和奖励塑形的时机. 第 1 段末期验证集表现出现不稳定和下降, 这是第 2 段重置的直接原因; 第 1 段中回答长度先短暂下降, 之后随验证分数上升而持续变长. 基座模型的序列长度是 128k, 第 1 段把回答长度限制在 8k 是为了避免过长的 rollout; 与 DeepScaleR 逐步加长最大长度的做法不同, ProRL 在第 2 段仍保持 8k, 理由是 8k 已经足够让验证分数继续上升. 其余采用 DAPO 的解耦 clip ($\varepsilon_{\mathrm{low}}=0.2$, $\varepsilon_{\mathrm{high}}=0.4$) 和动态采样. 起点是已经会长 CoT 的 DeepSeek-R1-Distill-Qwen-1.5B.

加 KL 的出发点是熵坍缩. 论文试过调高 rollout 温度, 发现这只能推迟熵坍缩, 熵仍随训练稳步下降; 高温仍然保留, 因为它抬高了初始熵. DAPO 的解耦 clip 和调温都能减缓熵下降, 论文认为显式的 KL 惩罚更强, 也更稳定.

训练设置: 每题 16 条 rollout, 上下文 8096, 温度 1.2, batch 256, mini-batch 64 (每步 4 次更新), 学习率 $2\times10^{-6}$ 恒定; 4 个节点各 8 张 H100, 约 16k GPU 小时; 136K 道题, 覆盖数学, 代码, STEM, 逻辑谜题, 指令遵循五个领域; 训练 2000 步以上. 训练分 8 段: 第 1 段四个任务, 8k 上下文; 第 2 段重置; 第 3 段加入指令遵循数据 (第 1 段没有用这类数据, 因为当时还拿不到); 第 4, 5 段对未正确结束的回答做奖励塑形; 第 6, 7 段 rollout 从 16 增到 32; 第 8 段上下文 16k, rollout 回到 16, 最终约 200 步用 16k.

结果相对起点: 摘要报 pass@1 数学 +14.7, 代码 +13.9, 逻辑谜题 +54.8, STEM +25.1, 指令遵循 +18.1; §3 给的是另一组, 数学 +15.7, 代码 +14.4, STEM +25.9, 指令遵循 +22.0, 逻辑谜题 +54.8. Figure 1 左图显示 pass@1 和 pass@16 都随训练上升, 中图显示 ProRL 模型回答的 creativity index 更高. Figure 8 是各段训练的 KL 曲线, 每次重置后参考策略就等于当时的策略, 所以 KL 从 0 重新起算, 再随训练逐渐变大. Table 1 数学平均从 44.45 到 60.14 (DeepScaleR 54.54, 7B 模型 63.19); Table 2 代码平均从 23.08 到 37.49 (DeepCoder 30.96). Table 3:

| 模型 | GPQA | IFEval | Reasoning Gym | acre | boxnet | game |
|------|-----:|-------:|--------------:|-----:|-------:|-----:|
| 起点 | 15.86 | 44.05 | 4.24 | 5.99 | 0.00 | 3.49 |
| ProRL | 41.78 | 66.02 | 59.06 | 58.57 | 7.91 | 52.29 |

acre, boxnet, `game_of_life_halting` 是分布外任务. 与领域专用模型比, ProRL 在数学上比 DeepScaleR-1.5B 高 4.6, 在代码上比 DeepCoder-1.5B 高 6.5 (pass@1). 论文还提到, 此前的工作往往过早拉长训练时的回答长度, 造成冗长的 overthinking; ProRL 大部分时间把回答长度限制在 8k, 在有限长度内做更深的探索. 评测用温度 0.6, `top_p` 0.95, 最长 32k; 数学, 代码, STEM 的 pass@1 由每题 16 个样本估计.

ProRL 的分析部分用 256 次采样估计 pass@$k$. Figure 3 显示起点模型 pass@128 与 RL 后的覆盖增益显著负相关: 起点已经做得好的任务, 增益很小甚至为负; 起点很差的任务, 增益最大. 他们用 DOLMA 语料计算起点回答的 creativity index, 增益小的那些数学和代码任务 creativity index 更低, 说明起点在预训练中见过大量相似数据.

Figure 4 把任务分成三种: **Diminish**, 多见于数学, pass@1 上升而 pass@128 下降或不变, 这些任务起点 pass@128 本来就高, 论文认为 RL 只是收紧了输出分布, 与 Yue 等的观察一致; **Plateau**, pass@1 和 pass@128 都上升, 但增益主要在训练早期取得, 中间检查点与最终模型差别很小; **Sustained**, 多见于代码等更复杂的任务, 覆盖随训练延长持续扩大.

分布外的例子有两个. boxnet 上起点完全做不出, ProRL 模型能解 (Figure 5). `graph_color` 训练只用 10 个节点的图, 评测中把节点数加大, pass@1 和 pass@128 都随难度下降, 但延长训练的模型在所有规模上都高于起点和中间检查点 (Figure 6). Figure 7 中, codeforces 和 `family_relationships` 两个任务的逐题 pass@1 分布从集中在 0 附近移到 1 附近. 论文引用 Dang 等的上界

$$
\mathbb{E}_x\big[\mathrm{pass@}k\big]\le1-\Big(\big(1-\mathbb{E}_x[\rho_x]\big)^2+\mathrm{Var}_x(\rho_x)\Big)^{k/2}, \tag{6}
$$

$\rho_x$ 是题 $x$ 的 pass@1. 期望 pass@1 上升会抬高上界, 逐题 pass@1 的方差上升会压低上界. 分布从两头堆积变为整体右移时, 期望和方差的变化方向都有利于 pass@$k$. 代一组数看方差的作用: 期望 pass@1 都是 0.3, 若每道题的 pass@1 都是 0.3 (方差 0), $k=16$ 的上界是 $1-0.49^{8}\approx0.997$; 若 30% 的题必对, 70% 的题必错 (方差 0.21), 上界变成 $1-0.7^{8}\approx0.942$, 而实际的 pass@16 就是 0.3, 因为必错的题采多少次都不会对. 同样的平均正确率, 集中在少数题上时, 大 $k$ 的覆盖最差.

论文列出的局限: 算力需求大; 只在 1.5B 上做了实验; 参考策略的重置是硬重置; 任务范围有限.

## 4. 两组结论的对应与后续路线

### 4.1 两组结论如何对应

Yue 等和 ProRL 的结论在实验条件不同的情况下可以同时成立. 起点不同: Yue 等的数学主实验是从基座直接做 zero-RL; ProRL 从蒸馏模型出发, 而 Yue 等自己也发现蒸馏能把 pass@$k$ 整体抬高. 步数不同: Yue 等的 VeRL 实验在几百步内, ProRL 超过 2000 步. 任务不同: Yue 等以数学为主, ProRL 在数学上同样观察到 Diminish, 覆盖扩大主要出现在逻辑谜题, 代码和分布外任务上, 也就是起点 pass@128 低, 预训练见得少的任务. 合起来看, 在预训练充分覆盖的任务上, 现有 RLVR 主要提高采样效率; 在起点很弱的任务上, 足够长的训练加上维持探索的手段能扩大覆盖.

Yue 等在 Discussion 中给出解释. AlphaGo Zero 和 DQN 系列在围棋和 Atari 上可以持续提升, 没有明确的上限. 与这些传统 RL 相比, 语言模型的动作空间是指数级的 token 序列, 从零探索几乎拿不到奖励, 必须从预训练模型起步. 预训练先验让采样落在能拿到正奖励的区域, 但偏离先验的样本几乎都是无效输出, 得到负奖励. 策略梯度提高先验内正奖励回答的似然, 压低先验外负奖励回答的似然, 训练后的策略因此倾向于先验内已有的回答. 论文认为从蒸馏模型开始训练是一个暂时的办法, 因为蒸馏注入了更好的先验.

论文列出的后续方向有三个: 在更高层的抽象空间中探索, 例如 AlphaEvolve 在程序层面做自我演化; 用课程组织数据, 先提高简单子问题的成功率, 让困难的上层问题从接近 0 变为非零, RLVR 才能拿到有意义的奖励; 用过程奖励和更细的信用分配替代纯二元的结局奖励.

### 4.2 改变先验的路线

从第 4.1 节看, 扩大覆盖的一条路是改变模型采样的分布, 让先验外的正确轨迹出现在训练数据里. 蒸馏是其中一种. 另一种是在 RL 过程中混入外部示范, [4.8.3](../../4.8-推理与Agent能力/4.8.3-SFT与RL的融合策略/4.8.3-SFT与RL的融合策略.md) 中的方法都属于这一类.

Prefix-RFT (arXiv:2507.01679) 在一组 on-policy 回答中混入一条以示范前缀开头, 由模型续写的轨迹. 它的 Table 7 报 Pass@2048: AIME24 上基座 86.67, Prefix-RFT 96.67 (+10.0), 纯 RFT 和 LUFFY 都是 90.00; AIME25 上基座 70.00, Prefix-RFT 76.67 (+6.67). 在 $k=2048$ 这个量级上, 混入示范的方法高于基座, 与 Yue 等「大 $k$ 下基座反超」的结果方向相反. 两者的差别在于, Prefix-RFT 的训练混入了外部示范数据, 训练分布里出现了基座自己采不到的轨迹; Yue 等测的 RLVR 只用策略自己的采样.

LUFFY (arXiv:2504.14945) 报告了纯 on-policy 训练的两种失败: on-policy 训练的熵约 200 步后趋近 0; Llama 在难题集上的 on-policy 奖励塌到 0, 即采不到正确解时 RL 无从学习. 第 3.1 节的式 (4) 给出了同一结论的梯度形式. 混入示范后, 难题上至少有一条正确轨迹进入梯度计算.

### 4.3 评测上的做法

只报 pass@1 区分不了「提高采样效率」与「扩大覆盖」. Yue 等和 ProRL 的做法给出了一套基本组合: 一条 pass@$k$ 曲线, 最右端 $k$ 在 128 到 1024 之间, 用式 (1) 的无偏估计, 每题采样数 $n$ 至少要等于曲线上最大的 $k$, 评测开销随之线性增长; 一张逐题正确率直方图, 看正确率为 0 的题是增是减; 一组「只有基座能解 / 只有 RL 能解」的集合差; 训练过程中的熵曲线. 训练集 pass@1 上升而 pass@256 下降 (Table 4) 是覆盖收缩的直接信号.

数学基准上还要防止猜答案. 代码的单元测试和去掉选择题的视觉基准受这一问题影响小; 数学上需要人工检查低正确率题的 CoT, 或像 Yue 等对 AIME24 那样先去掉不写 CoT 也能猜中的题. ProRL 的负相关结果提示, 在起点 pass@128 已经很高的任务上延长训练, 覆盖很难再扩大; 起点接近 0 的任务才是检验覆盖能否扩大的地方.

**参考文献**

1. Yue, Y., et al. (2025). [Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?](https://arxiv.org/abs/2504.13837). 项目页 <https://limit-of-RLVR.github.io>.
2. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).
3. Liu, M., et al. (2025). [ProRL: Prolonged Reinforcement Learning Expands Reasoning Boundaries in Large Language Models](https://arxiv.org/abs/2505.24864).
4. Brown, B., et al. (2024). [Large Language Monkeys: Scaling Inference Compute with Repeated Sampling](https://arxiv.org/abs/2407.21787).
5. Chen, M., et al. (2021). [Evaluating Large Language Models Trained on Code](https://arxiv.org/abs/2107.03374).
6. Sheng, G., et al. (2024). [HybridFlow: A Flexible and Efficient RLHF Framework](https://arxiv.org/abs/2409.19256).
7. Yu, Q., et al. (2025). [DAPO: An Open-Source LLM Reinforcement Learning System at Scale](https://arxiv.org/abs/2503.14476).
8. Rastogi, A., et al. (2025). [Magistral](https://arxiv.org/abs/2506.10910).
9. Novikov, A., et al. (2025). [AlphaEvolve: A Coding Agent for Scientific and Algorithmic Discovery](https://arxiv.org/abs/2506.13131).
10. Huang, Z., et al. (2025). [Blending Supervised and Reinforcement Fine-Tuning with Prefix Sampling](https://arxiv.org/abs/2507.01679).
11. Yan, J., et al. (2025). [Learning to Reason under Off-Policy Guidance](https://arxiv.org/abs/2504.14945).
