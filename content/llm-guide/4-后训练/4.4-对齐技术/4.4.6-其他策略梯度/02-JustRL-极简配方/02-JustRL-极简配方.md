---
title: "02 · JustRL：1.5B 数学 RL 的极简配方"
date: 2026-08-31
as_of: 2026-08-31
tags: [JustRL, GRPO, DAPO, RLVR, clip-higher, 1.5B]
---

# 02 JustRL：极简配方

JustRL 没有提出新的策略梯度。He 等 *JustRL: Scaling a 1.5B LLM with a Simple RL Recipe*（[arXiv:2512.16649](https://arxiv.org/abs/2512.16649)，THU / UIUC / Shanghai AI Lab）把 veRL 默认的 GRPO 配上 DAPO 的轻量规则验证器，单阶段、固定超参，把两个已经蒸馏过的 1.5B 再抬一截。摘要里的 54.9% 和 64.3% 是九项数学基准的平均，不是 AIME 单列。精确到百分位：JustRL-DeepSeek 九项平均 **54.87%**，对照 ProRL-V2 的 **53.08%**；JustRL-Nemotron **64.32%**，对照 QuestA 的 **63.81%**。邻居 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 钉组内 $z$-score；[03-Dr.GRPO](../03-DrGRPO-去标准差/03-DrGRPO-去标准差.md) 钉两项都删，7B AIME 2024 43.3% 不要抄进本篇九项平均；变体地图在 [4.4.5](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md)。本篇钉配方：同一套超参、一条 16k、不算力换调度。不是新算法替代 GRPO。不是 Dr.GRPO。不是「所有规模、所有任务都该拆掉调度」。

## 1. 小模型 RL 把调度堆成了默认动作

o1 和 DeepSeek-R1 把可验证奖励的强化学习（RLVR）做成了大模型推理的主路径。1.5B 这一档，工业界更爱蒸馏：用更大老师的轨迹做监督微调，稳、快、立刻涨分。Qwen3 的强到弱蒸馏、DeepSeek-R1 的 distill 系列都走这条。问题在天花板。老师更新慢，学生再堆数据也过不去老师当时的水平。蒸馏饱和之后，RL 才是还能往上拱的那一截。

社区给小模型 RL 的名声是不稳。过去一年的做法几乎同构：多阶段拉长上下文、动态调温、长度惩罚、参考模型重置、在线滤题、课程学习。Table 1 把技巧收成九列：熵控制、扫超参、改训练 prompt、重置 KL 参考、长度控制、自适应温度、rollout 抢救、动态采样、拆训练阶段。STILL-3 扫超参并重置参考。DeepScaleR 三阶段 $8\mathrm{k}\to 16\mathrm{k}\to 24\mathrm{k}$。FastCuRL 五阶段，长短思维链来回切。ProRL 八阶段加长度惩罚，ProRL-V2 继续加到九阶段，上下文还从 8k 拉到 16k 再收回 8k。BroRL 在 ProRL-V2 之后把每题 rollout 加到 512。Nemotron 骨干上 QuestA 用大模型轨迹当部分思维链提示，按难度分阶段。Qwen3-1.7B 上 POLARIS、e3 同样是多阶段加动态采样。

每一篇都报告自己解决了某种不稳：奖励塌、熵漂、长度爆炸。基线本身已经叠了前一篇的调度，新技巧加在已经很复杂的栈上。分不清新方法是在解决 RL 的病，还是在补偿上一层调度制造的病。JustRL 问的就是这句话：复杂度是不是必要的。Table 1 把 JustRL 两行标成 Nov '25，九列技巧只勾熵控制，其余八列空。

骨干只选两条，都是蒸馏过的 1.5B。DeepSeek-R1-Distill-Qwen-1.5B 训 4380 步，得到 JustRL-DeepSeek。OpenMath-Nemotron-1.5B 训 3440 步，得到 JustRL-Nemotron。各 32×A800-80GB，大约 15 天。同一套超参，不按模型重扫。论文把「换骨干不改旋钮」写成稳健性，不是只对某一个初始化有效。代码和权重在 [thunlp/JustRL](https://github.com/thunlp/JustRL)，模型集在 Hugging Face `hbx/justrl`。

## 2. 配方：veRL 默认 GRPO 加二元奖励

算法主干不是新目标。veRL 里的 GRPO 默认实现，外加二元 outcome 奖励。同一道题采 $G=8$ 条，组内做 $z$-score，再套 PPO 式 clip。记号沿用 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 的式 (2)：

$$
\hat{A}_{i}=\frac{r_i-\mathrm{mean}(\mathbf{r})}{\mathrm{std}(\mathbf{r})}. \tag{1}
$$

$r_i$ 来自 DAPO 那套轻量规则验证器，对错二值，**不用 SymPy**。论文写 binary outcome。训练曲线上 mean reward 从约 $-0.6$ 爬到 $+0.4$，纵轴不像 $[0,1]$ 准确率，更接近把对错编成有正有负的标量。不要把 Figure 2(b) 的 $0.4$ 读成「四成答对」。奖励只打在整段结局上，没有过程监督。[02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) §4.1 那种按步骤给分、优势向后累加，这里不用。规则验证器看的是 `\boxed{}` 里的最终答案。不用 SymPy 的理由论文写得很干：符号库会加开销。假阴性留给评测阶段的 CompassVerifier-3B 去补，不往训练环里塞更重的判定。

JustRL 把 GRPO 原文里挂在目标上的 KL 关掉。Table 2 两行写死：Use KL Loss = No，Use Entropy Regularization = No。目标剩组内 clip，不扣参考模型，不加熵奖励：

$$
\mathcal{J}(\theta)=\mathbb{E}\Bigg[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t}\min\big(\eta_{i,t}\hat{A}_{i},\;\mathrm{clip}(\eta_{i,t},\,0.8,\,1.28)\,\hat{A}_{i}\big)\Bigg]. \tag{2}
$$

$\eta_{i,t}=\pi_\theta(o_{i,t}\mid q,o_{i,<t})/\pi_{\theta_{\mathrm{old}}}(\cdot)$。普通 GRPO 的对称窗是 $[1-\varepsilon,1+\varepsilon]$，$\varepsilon=0.2$ 就是 $[0.8,1.2]$。这里上沿改成 $1.28$，也就是 DAPO 说的 clip higher：$\varepsilon_{\mathrm{low}}=0.2$，$\varepsilon_{\mathrm{high}}=0.28$。对称 clip 时，$\eta>1.2$ 的增量被切掉。对的轨迹里那些一开始概率很低的 token，正优势也涨不动，探索被上沿掐死，熵往下走。上沿放到 1.28，正优势多留一点空间；负优势仍用 0.8，错的轨迹不会被放得太狠。JustRL 没有另加熵奖励，靠的就是这扇不对称窗。作者把这一条当成 baseline 的一部分，不当「新方法」。Table 1 给 JustRL 的熵控制打了勾，和 Table 2「不用熵正则」并不打架：勾的是 clip 上沿，不是损失里再加一项 $\lambda\mathcal{H}[\pi]$。

保持简单的五条，论文 §3.1 列得很死。单阶段，不换上下文、不切课程、不在中途切参考。超参固定，不调温、不改 batch、不重置 KL 参考。数据用 DAPO-Math-17k，没有离线难度过滤，没有在线动态采样。后缀 prompt 不扫：「Please reason step by step, and put your final answer within `\boxed{}`」。长度不管惩罚项，只把最大上下文钉在 16k（prompt 上限 1k，response 上限 15k）。

不做动态采样，代价写在式 (1) 上。八条全对或全错，$r_i$ 相同，$\hat{A}_i$ 全是 0，这道题这一拍没有梯度。POLARIS 和 ProRL 把这种题滤掉再补采，论文按 50% filter 估它们的 token。JustRL 留下这些零优势组，不补采。步数可以堆到 4380，每步仍是 $N=8$，token 仍只有 ProRL-V2 的一半。这不是「有效更新更多」，是承认一部分 batch 在空转，用更瘦的每步去换调度。Train BS 256 切成 PPO mini 64，一轮 rollout 里大约四次内层更新；Micro/GPU=1 是 32 卡上的显存钉子，不是新算法。

Table 2 是配方的全部旋钮，两条骨干共用：

| 项 | 值 |
|----|----|
| Advantage | GRPO |
| Use KL Loss | No |
| Use Entropy Regularization | No |
| Train BS | 256 |
| Max Prompt | 1k |
| Max Response | 15k |
| PPO Mini | 64 |
| Micro/GPU | 1 |
| Clip Ratio | $[0.8,\,1.28]$（clip higher） |
| lr | $1\times 10^{-6}$ constant |
| Temperature | 1.0 |
| Rollout $N$ | 8 |
| Reward | DAPO 规则验证器 |

评测另是一套。九项：AIME 2024 / 2025、AMC 2023、MATH-500、Minerva、OlympiadBench、HMMT Feb 2025、CMIMC 2025、BRUMO 2025。脚本跟 POLARIS。Pass@1；MATH / Minerva / Olympiad 每题 4 次，其余 32 次。温度 0.7、top-p 0.9、生成最长 32k。训练环温度 1.0、最长 16k，两套数不要混。评测再挂 CompassVerifier-3B，专门补规则验证器的假阴性。训练环不用这个 3B，也不用 DeepScaleR 那套更「宽」的验证器。§7 的消融说明，评测补假阴和训练补假阴不是同一件事。

![JustRL 单阶段：数据、rollout、验证器、clip 更新](./images/fig-justrl-single-stage.png)

> 图 1：左到右四步。DAPO-Math-17k 进 GRPO rollout（$N=8$，温度 1.0），DAPO 规则验证器打二元分，再按 $\mathrm{clip}[0.8,1.28]$、学习率 $1\times 10^{-6}$ 更新策略。虚线框标单阶段、16k、固定超参。

**图 1 解析**

- 奶油框是数据。17k 题，不做离线过滤。箭头从右缘中点出去，标签 sample。
- 青绿框采 8 条。这是 GRPO 的组，不是 MoE 专家。
- 冰蓝框是冻结的规则验证器。0/1，无 SymPy。标签 score。
- 鲑粉框做 clip-higher 更新。没有 KL 项，没有熵奖励。
- 底注写两条骨干共用超参。图里没有坐标轴，训练曲线的数字在 §6 的表里。

直觉上，这是把 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 的组内相对，接到 DAPO 的不对称 clip，再把调度卸掉。本夹 [01-ReMax](../01-ReMax-贪婪基线/01-ReMax-贪婪基线.md) 减的是 greedy 奖励，没有组、没有 clip。JustRL 有组、有 clip、没有 Critic，走的仍是 GRPO 那条，只是配方极瘦。

## 3. 上排换阶段，下排一条 16k

多阶段的共同动作是中途改规则。DeepScaleR 按 8k、16k、24k 三次抬上下文。ProRL 系把训练切成八到九段，长度惩罚、rollout 数、上下文来回改。QuestA 还要大模型写好的部分思维链当提示，等于额外造一份课程数据。JustRL 把这些并成一条直通：16k 从第一天钉到最后一天。

![多阶段流水线对照 JustRL 16k 直通](./images/fig-justrl-vs-multistage.png)

> 图 2：上排多阶段，下排一条 16k 直通。DeepScaleR 三格从 8k 接到 16k 再接到 24k；右侧单独一格是 ProRL 九阶段，没有从 24k 连过去。下排 DAPO-Math-17k 进固定 16k 的 GRPO，同一套超参走完两条骨干。

**图 2 解析**

- 上带浅橙，是对照，不是 JustRL 的数据流。三格之间的实线只表示 DeepScaleR 自己的上下文上调。
- 紫格 ProRL 是并列的另一种调度，不是第四跳。不要读成 $24\mathrm{k}\to$ 九阶段。
- 下带浅薄荷。中间格写死「16k max throughout / no stage switch」。
- 两带之间没有竖箭。上下是对照，不是先后工序。
- 底注把三件事并排：DeepScaleR 三跳、ProRL 九段、JustRL 一份 16k 预算。

算力按 token budget 比，不按「训了多少天」比。动态采样的模型按 POLARIS 估 50% filter。就算把 filter 当成 0，JustRL 仍然不更亏，论文说这是保守估。滤掉的题往往是 8/8 或 0/8，正好是式 (1) 给不出优势的那些。

DeepSeek 骨干这条线，Table 4：

| 模型 | 动态采样 | 步数 | BS | $N$ | 上下文 | Token budget |
|------|----------|-----:|---:|----:|--------|--------------|
| DeepScaleR | 否 | 1750 | 128 | 8 | $8\mathrm{k}\to 16\mathrm{k}\to 24\mathrm{k}$ | $2.2\times 10^{6}\mathrm{k}$ |
| ProRL-V1 | 是 | 2450 | 256 | $16\to 32\to 16$ | $8\mathrm{k}\to 16\mathrm{k}$ | $2.1\times 10^{8}\mathrm{k}$ |
| ProRL-V2 | 是 | +1000 | 256 | 同上 | $8\mathrm{k}\to 16\mathrm{k}\to 8\mathrm{k}$ | $2.8\times 10^{8}\mathrm{k}$ |
| BroRL | 是 | +191 | 128 | 512 | 16k | $6.8\times 10^{8}\mathrm{k}$ |
| JustRL-DeepSeek | 否 | 4380 | 256 | 8 | 16k | $1.4\times 10^{8}\mathrm{k}$ |

JustRL-DeepSeek 的 $1.4\times 10^{8}\mathrm{k}$ 大约是 ProRL-V2 $2.8\times 10^{8}\mathrm{k}$ 的一半。步数更多（4380 对 ProRL-V1+V2 合计 3450），每步更瘦：$N=8$ 对 $16/32$，没有 50% 滤题后再补采。ProRL-V2 的 +1000 是接在 ProRL-V1 的 2450 步后面，BroRL 的 +191 再接在 V2 后面，三条是同一条加长链，不是三个从零开始的实验。BroRL 把 $N$ 加到 512，budget 到 $6.8\times 10^{8}\mathrm{k}$，大约 4.9 倍。Nemotron 线 Table 6：QuestA 2000 步、BS 128、$N=16$、32k、带动态采样，budget $2.6\times 10^{8}\mathrm{k}$；JustRL-Nemotron 3440 步、16k、$N=8$，budget $1.1\times 10^{8}\mathrm{k}$，大约少 2.4 倍。DeepScaleR 的 $2.2\times 10^{6}\mathrm{k}$ 比后面几个少两个数量级，那是早期三阶段、BS 128、$N=8$ 的短跑，和 4000 步的长训不是同一张账单。

步数多、每步省，净预算仍低。这是「简单」能站住的前提。把 4380 步理解成「他们训得更久所以该赢」，账对不上。

## 4. DeepSeek 骨干：九项平均 54.87，不是曲线上的 58

Figure 1a 是 AIME 2024 的 avg@32 训练曲线。骨干大约 28%，JustRL-DeepSeek 训到大约 58%。那是监控曲线，不是 Table 3 的评测格。Table 3 用统一协议复测，JustRL-DeepSeek 的 AIME24 是 **52.60**，骨干是 **29.90**。论文自己把「从 28% 到 58%」写在图注里，把 52.60 写在表里。两套数并存，引用时要说清来源。九项平均才是和 ProRL-V2 比的那一列：54.87 对 53.08。

Table 3（MATH / Minerva / Olympiad 为 @4，其余 @32）：

| 模型 | AIME24 | AIME25 | AMC23 | MATH | Minerva | Olympiad | HMMT | BRUMO | CMIMC | 平均 |
|------|--------:|--------:|--------:|------:|---------|----------:|------:|--------:|------:|
| Backbone | 29.90 | 22.40 | 63.82 | 84.90 | 34.65 | 45.95 | 13.44 | 30.94 | 12.89 | 37.65 |
| DeepScaleR | 40.21 | 28.65 | 73.83 | 89.30 | 39.34 | 52.79 | 18.96 | 40.00 | 21.00 | 44.88 |
| ProRL-V2 | 51.87 | 35.73 | 88.75 | 92.00 | 49.03 | 67.84 | 19.38 | 47.29 | 25.86 | 53.08 |
| BroRL\* | 57.50 | 36.88 | — | 92.14 | 49.08 | 61.54 | — | — | — | — |
| JustRL-DeepSeek | 52.60 | 38.75 | 91.02 | 91.65 | 51.47 | 67.99 | 21.98 | 52.71 | 25.63 | 54.87 |

六项领先：AIME25、AMC23、Minerva、Olympiad、HMMT、BRUMO。MATH-500 上 ProRL-V2 的 92.00 略高，CMIMC 上 ProRL-V2 的 25.86 略高。AIME24 单列 BroRL 的 57.50 更高，但带星号：官方报了分，模型没放，若干基准空着，平均算不出来。不要用 BroRL 的 AIME24 去打 JustRL 的九项平均。

相对骨干，平均从 37.65 到 54.87，大约 +17.2 个点。DeepScaleR 已经先吃掉一截（44.88），ProRL-V2 再吃到 53.08。JustRL 用一半 token、零阶段切换，平均再高 1.79。差距不大。论文要的不是「碾压九阶段」，是「瘦配方够用」。

Figure 1a 的 58% 和 Table 3 的 52.60 不要互相填。曲线是训练过程里的 AIME24 avg@32 监控，表是 POLARIS 脚本加 CompassVerifier-3B 的终局复测。监控器和终局表不是同一把尺，差几个点不奇怪。横向引用只拿表。

Takeaway 1 的原话更冲：单阶段固定超参，用大约一半算力超过更复杂的做法；4000 多步的曲线没有逼出人工干预。这是 1.5B、数学、这条骨干上的观察，不是一般定理。

## 5. Nemotron 骨干：平均略高，AIME24 单列略低

同一套 Table 2，换 OpenMath-Nemotron-1.5B，3440 步。Figure 1b 的 AIME24 曲线训到 70% 以上。那仍是 AIME24 监控曲线，不是九项平均。九项平均在 Table 5：骨干 56.74，QuestA 63.81，JustRL-Nemotron **64.32**。

| 模型 | AIME24 | AIME25 | AMC23 | MATH | Minerva | Olympiad | HMMT | BRUMO | CMIMC | 平均 |
|------|--------:|--------:|--------:|------:|---------|----------:|------:|--------:|------:|
| Backbone | 58.75 | 48.44 | 90.55 | 92.40 | 26.93 | 71.70 | 30.10 | 61.67 | 30.08 | 56.74 |
| QuestA | 71.56 | 62.08 | 93.44 | 92.95 | 32.08 | 72.28 | 40.94 | 67.50 | 41.48 | 63.81 |
| JustRL-Nemotron | 69.69 | 62.92 | 96.02 | 94.15 | 30.24 | 76.59 | 40.63 | 66.88 | 41.72 | 64.32 |

五项领先：AIME25、AMC23、MATH、Olympiad、CMIMC。AIME24 上 QuestA 的 71.56 高于 JustRL 的 69.69。Minerva、HMMT、BRUMO 也是 QuestA 略高。平均 JustRL 高 0.51。把「64.3%」说成 AIME 分数，错。把 JustRL 说成九项全胜，也错。

QuestA 的课程不是免费的。题干要拼上大模型写好的部分思维链，按难度分阶段，除了标准问答对还要完整轨迹。JustRL 只用 DAPO-Math-17k 的问答对。论文写得很明白：不贬低 question augmentation，只说明这条 1.5B 线上，不造课程也能把平均咬到同一档，token 大约少 2.4 倍。

两条骨干起点差一截。DeepSeek 蒸馏体九项 37.65，Nemotron 已经 56.74。配方不改，两边都涨。这是论文用来挡「只对某一个初始化有效」的证据。挡不住的是规模和任务：没有 7B，没有代码，没有通用问答。

## 6. 训练动态：熵还在晃，长度自己往回收

复杂技巧的口头动机，常常是三条病：熵塌或熵漂、奖励平台、长度爆炸。JustRL-DeepSeek 的 Figure 2 给了大约 4000 步的三条监控。这里不把手绘曲线冒充论文图，数字进表。

| 监控 | 论文 Figure 2 的读法 |
|------|----------------------|
| 熵 | 全程大约在 1.2–1.4 振荡；后期大约 1.0–1.6。没有单边上漂，也没有提前钉死。 |
| mean reward | 从约 $-0.6$ 升到约 $+0.4$。噪，但趋势向上。没有长平台、没有逼人切阶段的骤降。 |
| 响应长度 | 起步大约 7000–8000 token，大约 1000 步收到 4000–5000，之后稳住。没有显式长度惩罚。 |

熵能晃着，作者归到 clip higher。没有 KL 锚、没有熵奖励，策略仍没有在 4000 步里把探索关掉。这和「必须重置参考模型」那类叙事对着干：ProRL、STILL 把 KL 过大当成要干预的信号，干预本身会把更新上限卡住。JustRL 选择不挂 KL。

评测允许生成 32k，训练 response 上限 15k。测试比训练长一截。POLARIS 把「训短测长」写成技巧；JustRL 只在评测协议里放开 32k，正文不当成一项方法。不要把 32k 评测长度写进 Table 2 的 Max Response。

长度自己往回收，和「必须上 overlong penalty」对着干。起步啰嗦，16k 上限在，梯度却把平均长度压到 4k–5k。论文引用 DLER 那条线：显式长度惩罚会造对抗压力，模型学会钻惩罚的空子。这里没有惩罚项，压缩是学到「短一点也能对」之后的自然结果。

这些平滑曲线证明不了「简单永远更稳」。隔离不了是超参、数据、验证器还是三者耦合在干活。对比仍然扎眼：最小配方走出的动态，没有逼出那些已经成为默认动作的干预。

## 7. 消融：标准技巧加进去，平台更低

从 JustRL-DeepSeek 的配方出发，DeepSeek 骨干再训 3000 多步，加两样「看起来该加」的东西。

第一档：DAPO 那种 overlong penalty，打在最后 4k token 上。第二档：惩罚还在，再换 DeepScaleR 的 robust verifier，少记一些假阴性。

Figure 3 是 AIME24 和熵。大约 2000 步之后三条线才分开。基线平台大约 **55%**。加上 overlong penalty，平台大约 **50%**。两样都加，平台大约 **45%**。熵从健康振荡的 1.2–1.4 掉到 0.5–0.6。前期看起来都在涨，加技巧的伤害是后半段才露出来。不要只看前 1500 步就下结论。

| 配方 | AIME24 平台（约） | 熵（约） |
|------|------------------:|----------|
| JustRL 基线 | 55% | 1.2–1.4 |
| + overlong penalty | 50% | 0.5–0.6 |
| + penalty + robust verifier | 45% | 0.5–0.6 |

长度惩罚的原意是逼模型早收。结果是探索先被掐死，短回复在还没搜到能打分的推理之前就成了主模式。robust verifier 的原意是正确答案少被规则误杀。换了之后仍然更差。论文给了两个猜测。宽验证器让「满分」变多，组内相对的区分变钝；严验证器逼模型把格式和计算做干净，宽验证器把格式错误在外部抹掉，内部压力没了。奖励尺度他们做过归一，不是简单的分数量纲问题。

DAPO 自己的设定里 overlong penalty 是能用的。换到这条 1.5B、16k、无 KL 的配方里，它和目标打架。标准技巧不迁移。更烦人的是：瘦基线不好「再改进」。两档合理修改都往下走，说明当前平衡脆，不是还没加够模块。

消融只打了这两枪。课程、自适应温度、参考重置、别的验证器、数据增强，都没做。论文不说「加技巧永远有害」，只说要先看到具体的病，再加针对那一病的药。

## 8. 不是新算法，也不是该拆掉一切调度

和 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 的关系：JustRL 用的就是组内 $z$-score 加 clip。改了三处工程选择：KL 从目标里拿掉、clip 上沿到 1.28、奖励换成 DAPO 规则分。没有新的优势定义。把重要性采样提到序列级的是 GSPO，地图在 [4.4.5](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md)。不要把 JustRL 写成「替代 GRPO 的新估计器」。

和 [01-ReMax](../01-ReMax-贪婪基线/01-ReMax-贪婪基线.md) 的关系：两边都想瘦。ReMax 瘦掉 Critic，减 greedy。JustRL 瘦掉调度，保留组。ReMax 的主实验是 7B 对话 RM；JustRL 是 1.5B 数学规则分。基线不是同一种东西。

和 [03-Dr.GRPO](../03-DrGRPO-去标准差/03-DrGRPO-去标准差.md) 的关系：JustRL 保留组内 $z$-score，改的是调度和 clip 上沿。Dr.GRPO 两项都删（$1/|o_i|$ 与组 $\mathrm{std}$），clip 仍对称 $\varepsilon=0.2$。Oat-Zero-7B 的 AIME 2024 43.3% 不是本篇九项平均 54.87%/64.32%。

失效写在 Limitations 里，不要替论文圆。只做了 1.5B 数学。代码、通用问答、更大尺寸，没有数。隔离不了超参、验证器、DAPO-Math-17k 谁是主因。相对 ProRL / QuestA 更省，对卡不够的人仍然贵：32×A800，两条线各约 15 天。更长 horizon、是否终究要加回技巧，没做。

Discussion 里留了复杂度可能有用的窗口：算力极端紧、遇到本配方没碰到的病、要顶当前天花板、奖励更噪的域。方法论建议是先把瘦基线跑稳，再针对观测到的病加模块。不是道德上的「简单正义」。

工程上能直接抄走的是 Table 2，不是摘要里的「SOTA」两个字。九项平均 54.87 / 64.32 绑死在这两条 1.5B 蒸馏骨干、DAPO-Math-17k、CompassVerifier 评测协议上。换验证器、换采样次数、把 Figure 1 的 58% 和 70+% 写进横向对比，数字会漂。AIME24 单列尤其漂：Nemotron 线上 QuestA 反而更高。

没有两全其美。拆掉调度，换来的是这条线上的稳定和更低 token；付出的是「不知道哪一块真正关键」，以及一张只覆盖 1.5B 数学的成绩单。瘦配方能赢九阶段，说明 2025 年小模型数学 RL 的默认动作里，有一批可能在打自己。同夹的减数问题在 [01-ReMax](../01-ReMax-贪婪基线/01-ReMax-贪婪基线.md)：那边减 greedy，这边减调度。

## 参考文献

1. He, B., Qu, Z., Liu, Z., Chen, Y., Zuo, Y., Qian, C., Zhang, K., Chen, W., Xiao, C., Cui, G., Ding, N., & Liu, Z. (2025). [JustRL: Scaling a 1.5B LLM with a Simple RL Recipe](https://arxiv.org/abs/2512.16649). ICLR 2026 Blogpost Track. HTML：[arXiv HTML](https://arxiv.org/html/2512.16649)。代码：[thunlp/JustRL](https://github.com/thunlp/JustRL)。
2. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).（GRPO；正本在 4.4.1/02）
3. Yu, Q., et al. (2025). [DAPO: An Open-Source LLM Reinforcement Learning System at Scale](https://arxiv.org/abs/2503.14476).（规则验证器、clip higher、DAPO-Math-17k）
4. Sheng, G., et al. (2025). HybridFlow: A Flexible and Efficient RLHF Framework. *EuroSys*.（veRL）
5. Luo, M., et al. (2025). [DeepScaleR: Surpassing O1-Preview with a 1.5B Model by Scaling RL](https://pretty-radio-b75.notion.site/DeepScaleR-Surpassing-O1-Preview-with-a-1-5B-Model-by-Scaling-RL-19681902c1468005bed8ca303013a4e2).
6. Liu, M., et al. (2025). [ProRL: Prolonged Reinforcement Learning Expands Reasoning Boundaries in Large Language Models](https://arxiv.org/abs/2505.24864).
7. Hu, J., et al. (2025). [ProRL v2: Prolonged Training Validates RL Scaling Laws](https://developer.nvidia.com/blog/scaling-llm-reinforcement-learning-with-prolonged-training-using-prorl-v2/).（JustRL 注 First published on Notion；NVIDIA 技术博客为公开入口）
8. Hu, J., et al. (2025). [BroRL: Scaling Reinforcement Learning via Broadened Exploration](https://arxiv.org/abs/2510.01180).
9. Li, J., et al. (2025). [QuestA: Expanding Reasoning Capacity in LLMs via Question Augmentation](https://arxiv.org/abs/2507.13266).
10. An, C., et al. (2025). [POLARIS: A Post-Training Recipe for Scaling Reinforcement Learning on Advanced Reasoning Models](https://hkunlp.github.io/blog/2025/Polaris).（评测脚本；JustRL 按该文估动态采样 50% filter。无独立 arXiv 号）
11. Liu, S., et al. (2025). CompassVerifier: A Unified and Robust Verifier for Large Language Models.（评测假阴性）
12. Liu, Z., et al. (2025). [Part I: Tricks or Traps? A Deep Dive into RL for LLM Reasoning](https://arxiv.org/abs/2508.08221).
