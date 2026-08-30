---
title: "SlowFast：慢探索，快揭开"
category: null
tags:
  - SlowFast
  - sampling
  - dLLM-Cache
  - LLaDA
  - training-free
published: true
as_of: 2026-08-31
excerpt: "训练免费的动态采样器。慢阶段松探索、预测 span 终点；窗口方差低于阈值再进快阶段，span 内揭高置信格。15.63× 在 GPQA、长度 1024、8-shot：原版 LLaDA Base 1.60 TPS 到 25.00。叠 dLLM-Cache 到 54.75 TPS（34.22×），分从 31.47 掉到 28.79。GSM8K 那张 4090 表只是 4.55 到 14.57（3.20×）。硬件 RTX 4090。"
---
# SlowFast：慢探索，快揭开

加速专文的 DualCache 冻前缀和掩码后缀，阈值决定每步揭几格。低置信 remask 每步按日程揭固定份额。半自回归按块从左到右。三条都是静态：速度和选位置的规则不随「这句话现在稳不稳」改。Wei、Zhang、Liu 等人的 SlowFast Sampling（ICLR 2026，arXiv:2506.10848）加了一层状态机。慢阶段先探，快阶段在已经收敛的 span 里并行揭。权重不动。仓库 [LiangrunFlora/Slow-Fast-Sampling](https://github.com/LiangrunFlora/Slow-Fast-Sampling)。主表硬件一律 RTX 4090。

摘要「最多 15.63×」钉在 GPQA、8-shot、生成长度 1024、LLaDA 8B Base。原版 1.60 TPS 到 SlowFast 的 25.00。叠 dLLM-Cache（$K_p=500,K_r=30$）到 54.75 TPS，34.22×，分数 31.47 掉到 28.79。Table 1 的 GSM8K 是另一套长度：4.55 到 14.57，3.20×，分 69.83 到 69.59。两张表的原版 GPQA 也不一样，Table 1 是 3.31 TPS，Table 4 是 1.60。长度把分母压下去，倍数才会看起来像 15。

## 1. 三条观察，不是三条损失

论文把采样器要利用的经验写成三条原则。确定性：置信度高的格更早该揭，后面更少被改。收敛：身份和置信度会进平台，平台上的格不必每步重估。位置：高置信、早收敛的格往往挤在连续 span 里，不是均匀撒在整句。第三条给缓存留了门：span 外面的预测可以冻一会儿。

置信度仍是式 (5) 那种边际最大值 $c_i=P_\theta(\hat r_{0,i}^{(k)}\mid \mathbf{c},\mathbf{y}^{(k)})$。已揭开的位置 $c_i=1$。和 Fast-dLLM 的 0.9 阈值、LLaDA 低置信 remask 用的是同一类标量。SlowFast 多出来的是：这个标量既用来揭格，也用来猜「当前能看多远」，再对「能看多远」做方差检验。标量没有变成联合。ParallelBench 的 $\mathcal{C}$ 仍在 span 内部生效。

采样专文写过 LLaDA 的两种静态 $S$。随机 remask：未掩位置抄自己，掩码格以 $1-(k-1)/k$ 揭开，期望掩码数跟日程走。低置信 remask：目标揭开数 $n_{\mathrm{un}}=\lfloor L(1-t_{k-1})\rfloor=\lfloor L(1-(k-1)/N)\rfloor$，只留置信度最高的 $n_{\mathrm{un}}$ 个。半自回归把句子切块，块间左到右，块内再套上面两种。SlowFast 不改 $P_\theta$，改的是 $S$。$n_{\mathrm{un}}$ 不再由 $t$ 单独决定，而由「这一段方差过没过」决定。步数 $N$ 仍在，外层循环还是从 $k=N$ 走到 $0$。少掉的是把计算浪费在已经平台化的格上。

论文 Figure 1 在 LLaDA Base、GSM8K、256 步上画过置信度地图：深红（高置信）逐渐成团，而不是每步在整句上均匀变尖。第 12 个 token 可以收敛到 0.98，第 1 个停在 0.25。收敛不是「所有格都变尖」，是「有的格尖死、有的格认命」。快阶段冲的是已经尖死的团，不是把 0.25 那一格一并揭开。示意里的 0.98 / 0.25 不要写成超参。默认仍是 0.1 / 0.85。

会 next-token 的人容易把「快阶段」听成投机解码的草稿。不是。草稿仍是扩散自己的边际 argmax，验证器不是外挂小 AR。会 DualCache 的人容易把它听成又一种 KV 近似。也不是。慢快切换改的是揭开策略；dLLM-Cache 另算，可以叠，主表分开展示。

![](./images/fig-slowfast-explore-sprint.png)

> 图 1：左列三条原则。右列一个周期：慢阶段预测 $e_{\mathrm{cand}}$，窗口方差过关后进快阶段，span 内揭 $\tau_{\mathrm{high\_conf}}$，不够一格就退回 top-$k$。底栏把 15.63× 钉在 GPQA 长度 1024，不是 Table 1 的 GSM8K 3.20×。

**图 1 解析**

- **L1 Certainty**：尖的格先揭。和阈值并行同一直觉。
- **L2 Convergence**：身份和 $c_i$ 进平台，才敢把一段交给快阶段。
- **L3 Positional**：尖的格成团，才有 span 可冲。
- **R1**：慢阶段在 $[s_{\mathrm{cycle}},L]$ 里保守揭 top-$k_{\mathrm{slow}}$，同时用 $\tau_{\mathrm{min\_conf}}$ 估终点 $e_{\mathrm{cand}}$。
- **R2**：最近 $W_{\mathrm{hist}}$ 个终点的方差低于 $\sigma^2_{\mathrm{stable}}$，或探满 $K_{\max}$ 步，慢阶段结束。
- **R3–R4**：快阶段在 $[s_{\mathrm{cycle}},e_{\mathrm{cycle}}]$ 里并行揭过 $\tau_{\mathrm{high\_conf}}$ 的掩码格；一格都不过就 top-$k_{\mathrm{fast}}$。
- **F0**：15.63× $=25.00/1.60$。34.22× $=54.75/1.60$。分母是 Table 4 的原版 1.60，不是 Table 1 的 3.31，也不是 GSM8K 的 4.55。

## 2. 慢阶段：把终点稳住再冲

从 $s_{\mathrm{cycle}}$ 看到全长 $L$。每一步两件同时做。

保守揭开。在探索窗 $[s_{\mathrm{cycle}},L]$ 里取置信度最高的若干格揭开。论文写成 top-$k_{\mathrm{slow}}$。默认 $k_{\mathrm{slow}}$ 主表没有单独一列，只把 $\tau_{\mathrm{min\_conf}}=0.1$、$\tau_{\mathrm{high\_conf}}=0.85$、$K_{\max}=8$、$W_{\mathrm{hist}}=2$、$\sigma^2_{\mathrm{stable}}=1.0$ 写成默认。实现仓库里的 $k$ 不要和 $K_{\max}$ 焊成一个符号：$K_{\max}$ 是慢阶段最多走几步。

终点预测。当前步里，探索窗中置信度仍高于 $\tau_{\mathrm{min\_conf}}$ 的最远下标记成 $e_{\mathrm{cand}}^{(k)}$：

$$
e_{\mathrm{cand}}^{(k)}=\max\{i\mid i\in[s_{\mathrm{cycle}},L]\land P_{\theta}(\hat r_{0,i}^{(k)}\mid\mathbf{c},\mathbf{y}^{(k)})>\tau_{\mathrm{min\_conf}}\}.
\tag{7}
$$

$\tau_{\mathrm{min\_conf}}=0.1$ 很松。它不是「可以落盘」的门槛，是「这一步模型还愿意往右看多远」的门槛。消融 Figure 4：再低，终点乱跳；再高，span 缩得太短，快阶段没东西可冲。0.1 是扫出来的工作点。

稳定检验。把最近 $W_{\mathrm{hist}}$ 个 $e_{\mathrm{cand}}$ 放进窗口 $H_W$。方差低于 $\sigma^2_{\mathrm{stable}}$ 且已经至少看了 $W_{\mathrm{hist}}$ 步，慢阶段结束。否则一直探到 $K_{\max}$：

$$
k_{\mathrm{final}}=\min\bigl(\{k_s\mid W_{\mathrm{hist}}\le k_s\le K_{\max}\land\mathrm{Var}(H_W(k_s))<\sigma^2_{\mathrm{stable}}\}\cup\{K_{\max}\}\bigr).
\tag{8}
$$

周期终点取窗口均值：

$$
e_{\mathrm{cycle}}=\mathrm{Mean}(H_W(k_{\mathrm{final}})).
\tag{9}
$$

正文后半有一句写成「取最后一次记录的 $e_{\mathrm{cand}}$」。编号公式是均值。读实现以仓库为准，读论文以式 (9) 为准。$W_{\mathrm{hist}}=2$ 很短。作者写：终点变化来得快，窗口不必长。$\sigma^2_{\mathrm{stable}}=1.0$ 看起来松，下标是位置整数，差几个格子方差就会过 1。$K_{\max}=8$ 是「最多允许慢这么久」，不是每周期都走满 8 步。

## 3. 快阶段：span 里冲，span 外可冻

span 定为 $[s_{\mathrm{cycle}},e_{\mathrm{cycle}}]$。span 右侧、置信度仍低于 $\tau_{\mathrm{min\_conf}}$ 的格，这一步算出的预测可以缓存，后面只要还在活动 span 外面就复用。这是位置原则换成的计算节省，和 DualCache 冻「整段掩码后缀 KV」不是同一层：这里冻的是预测，加速专文冻的是 $K,V$。

span 里面，所有仍为 `[MASK]` 且 $c_i>\tau_{\mathrm{high\_conf}}$ 的格一起揭开。$\tau_{\mathrm{high\_conf}}=0.85$，略低于 Fast-dLLM 主文默认 0.9，高于「一个都不过也揭最尖那个」里的被动揭开。一格都不过 0.85，退回在 span 内取 top-$k_{\mathrm{fast}}$。退回保证周期不会零进展。快阶段结束，$s_{\mathrm{cycle}}\leftarrow e_{\mathrm{cycle}}$，下一轮慢阶段从新的起点再探。整句填完才停。

论文 Figure 4 用一道小学算术把交替画出来：慢阶段先落下主语、动词、标点当锚，快阶段一次揭出「she has 9 - 4 = 5 yuan left」这种已经尖的跨度。这是示意，不是 HumanEval。括号密集的代码里，span 内同时揭仍是边际乘积。阈值 0.85 只是把还平的格留到下一轮。

一个周期结束之后起点前移，整句被切成一串动态 span。和块扩散的差别在于：块长训练时就钉死，推理块长往往是训练块长的整数倍；这里的 $e_{\mathrm{cycle}}$ 每周期从置信度地图里长出来，同一个检查点、同一道题，span 切法可以不同。作者没有把「平均每个周期揭多少 token」写成主表列。TPS 已经把周期开销摊进去。慢阶段若经常走满 $K_{\max}=8$ 还没收敛，快阶段几乎接不上，吞吐会退回接近低置信 remask。消融把 $K_{\max}$ 写进 Figure 5：8 是「够探、又不把时间都耗在慢阶段」的点。

和半自回归的差别：半自回归的块长写死，块间左到右。SlowFast 的 $e_{\mathrm{cycle}}$ 每周期重估，块边界跟置信度地图走。和 ReFusion 的差别：ReFusion 改架构、槽内 AR、要微调 1.22B token。SlowFast 不改注意力图案，KV 仍是双向过期的那一套，只改「揭哪一段」。和 D2F 的差别：D2F 训练见脏前缀，后一块可以在前一块未完时开工。SlowFast 的快阶段仍在同一条去噪轨迹上选格，没有块级 teacher forcing。规划器专文的 DDPD 另训脏净头，问「这一格还脏吗」。SlowFast 问「这一段终点还跳不跳」。8B 上没有把 DDPD 接到 SlowFast 的表。

## 4. Table 1：4090 上的 3.20×，不是 15.63×

协议：LLaDA 8B Base、Dream 7B Base，RTX 4090。默认超参如上。Table 1 还把 Fast-dLLM 的并行档放在同一张卡上，方便比采样器，不便和 Fast-dLLM 原文的 A100 DualCache 主表横减。

| 任务 | LLaDA 原版 TPS / 分 | +SlowFast TPS / 分 | 倍数 |
|---|---|---|---|
| GSM8K | 4.55 / 69.83 | 14.57 / 69.59 | 3.20× |
| GPQA | 3.31 / 31.47 | 16.36 / 31.91 | 4.94× |
| MATH | 5.14 / 30.16 | 11.27 / 29.64 | 2.19× |
| MMLU-Pro | 9.16 / 23.30 | 23.14 / 23.85 | 2.53× |
| MMLU | 5.02 / 62.11 | 16.81 / 66.56 | 3.35× |
| BBH | 4.04 / 44.97 | 21.19 / 44.60 | 5.24× |
| MBPP | 4.98 / 40.80 | 13.32 / 41.00 | 2.67× |
| HumanEval | 11.24 / 31.71 | 35.46 / 33.54 | 3.15× |

GSM8K 掉 0.24 分，倍数 3.20。BBH 倍数最高，5.24×，分几乎贴着。MMLU 从 62.11 到 66.56，涨 4.45 点。作者写成多数任务无损。MMLU 这一列涨得不像噪声那么小，协议和 Nie Table 1 的 Base MMLU 65.9 不是同一套，不能拿 66.56 去减 65.9。HumanEval 31.71 也不是 Nie 的 35.4。

同表 Fast-dLLM（只开并行、不开缓存）在 LLaDA GSM8K 上 7.45 TPS / 69.60 分，1.64×。SlowFast 的 14.57 快一截，分贴着。GPQA 上 Fast-dLLM 并行 11.72 / 32.13（3.54×），SlowFast 16.36 / 31.91（4.94×）。MATH 上 Fast-dLLM 8.94 / 30.52，SlowFast 11.27 / 29.64，Fast-dLLM 略赢分、输吞吐。BBH 上 SlowFast 21.19 对 Fast-dLLM 的 10.73。

Dream 侧 GSM8K：原版 8.16 / 77.02，SlowFast 17.15 / 76.50（2.10×），Fast-dLLM 并行 12.72 / 73.09。GPQA：原版 5.43 / 35.93，SlowFast 16.56 / 35.94，Fast-dLLM 15.88 / 31.01，并行档在 Dream 上掉了将近 5 分。MMLU：原版 72.61，SlowFast 75.13，Fast-dLLM 并行 64.59，掉 8 点。MBPP：原版 54.20，SlowFast 54.60，Fast-dLLM 49.40。HumanEval 原版 34.15，SlowFast 35.36，Fast-dLLM 32.92。Dream 原版已经比 LLaDA 快，倍数普遍更小；同一套 Fast-dLLM 并行接到 Dream 上，知识列和代码列掉分比接到 LLaDA 上更明显。这是 4090、本篇再实现，不是 Wu 原文 A100 DualCache 主表。

Table 1 没写每列的生成长度。Table 4 单独把 GPQA 钉成 1024，原版从 3.31 掉到 1.60，大约 2× 的分母差。若 Table 1 的 GPQA 更短，15.63× 里大约一半来自「把画布垫长」。加速专文的 27.6× 也吃过这口。报倍数时长度是第一纪律。

## 5. Table 4：15.63× 的分母是 1.60 TPS

Figure 2 和 Table 4 换成 GPQA、8-shot、长度 1024。原版掉到 1.60 TPS，分仍是 31.47。长度把逐步揭开的分母压下去，这是加速论文常见的放大器。Fast-dLLM 的 27.6× 也用过长度 1024。两套 1024 仍不能减：一块 A100、一块 4090；一份 Instruct DualCache，一份 Base SlowFast。

| 方法 | TPS | 相对原版 | GPQA 分 |
|---|---|---|---|
| LLaMA3 8B | 33.79 | 21.12× | 31.92 |
| LLaDA Base | 1.60 | 1.00× | 31.47 |
| + SlowFast | 25.00 | 15.63× | 31.47 |
| + SlowFast + Cache（$K_p=100,K_r=5$） | 48.80 | 30.50× | 30.13 |
| + SlowFast + Cache（$K_p=500,K_r=30$） | 54.75 | 34.22× | 28.79 |

$K_p$ 是提示缓存间隔，$K_r$ 是回答缓存间隔，来自 dLLM-Cache。间隔拉长，吞吐涨、分掉。34.22× 那一格相对原版掉 3.13 分，相对 LLaMA3 的 31.92 也低。摘要「几乎不掉分」更贴 15.63× 那一行：25.00 TPS，分仍 31.47。报 34.22× 必须同时报 28.79。LLaMA3 在这张表上 33.79 TPS，相对原版 LLaDA 是 21.12×，慢于 54.75，快于 25.00。只开 SlowFast、不开缓存，还没有赢过这张表上的 LLaMA3 吞吐。赢 AR 吞吐的那一句，叠了缓存，并且付了 3.13 分。33.79 对 31.92 分，25.00 对 31.47 分：SlowFast 单独已经贴着 LLaMA3 的 GPQA 分，吞吐仍落后约 8.8 TPS。缓存把吞吐缺口补上，把分数缺口打开。帕累托上没有免费的第四象限。

Table 2 回到 Table 1 的长度设定，只是再叠缓存。LLaDA GSM8K：SlowFast+Cache 26.99 TPS / 69.60 分，5.93×。分母仍是 4.55，不是 1.60。GPQA：29.06 / 33.48，8.78×，分还涨了 2.01。MATH：26.50 / 29.42，5.16×。MMLU-Pro：33.38 / 25.53，3.64×。MMLU：38.42 / 61.20，7.65×，分掉 0.91。BBH：36.04 / 44.81，8.92×。MBPP：27.26 / 39.00，5.47×，分掉 1.80。HumanEval：41.14 / 31.10，3.66×。

同一张表上 Fast-dLLM 并行加缓存：GSM8K 15.50 / 68.77（3.41×），GPQA 30.21 / 33.03（9.13×），MATH 21.50 / 28.34，MMLU 32.36 / 61.45，BBH 22.56 / 45.35，MBPP 22.18 / 38.20，HumanEval 26.25 / 29.88。GPQA 这一列 Fast-dLLM+Cache 比 SlowFast+Cache 还快一点。GSM8K、MMLU、BBH、HumanEval 上 SlowFast+Cache 更快。Dream 叠缓存之后 BBH 能到 70.20 TPS（10.13×），分从 51.83 掉到 48.24；GSM8K 46.17 / 72.10，掉 4.92 分。MATH 56.44 / 37.10（6.66×）。MMLU 44.18 / 71.57。HumanEval 47.86 / 35.36。Fast-dLLM+Cache 在 Dream GSM8K 上 31.07 / 69.45，掉 7.57 分，比 SlowFast+Cache 的 4.92 更狠。Dream 侧缓存加速更明显，掉分也更常见。LLaDA 侧多数列还能贴着原版。采样器和缓存谁主谁辅，按任务会翻。不要把 Table 4 的 34.22× 抄成「任何任务叠缓存都是 34 倍」。

dLLM-Cache 自己的故事是：提示变得慢，回答变得快，所以提示长间隔缓存、回答短间隔缓存，再用 V-verify 决定哪些动态 token 要刷新。SlowFast 的 span 外预测缓存，和这份 KV 缓存叠在不同层。间隔 $K_p,K_r$ 拉大，刷新变少，过期变多。Table 4 用两档把账单写出来：温和档 30.50× 掉到 30.13，狠档 34.22× 掉到 28.79。Table 2 没写用的是哪一档间隔，只写「+ Cache」。读 Table 2 的 5.93× 时，不要假定已经是 $K_p=500$。

## 6. Table 3：GSM8K 上四种静态对照

分数 69.83、原版 TPS 4.55，对得上 Table 1 的 GSM8K，对不上 Table 4 的 GPQA。

| 采样器 | TPS | 分 |
|---|---|---|
| 自回归（左到右） | 5.25 | 60.80 |
| 扩散（低置信 remask） | 4.55 | 69.83 |
| 半自回归 | 5.44 | 66.41 |
| SlowFast | 9.87 | 69.59 |

左到右在扩散权重上硬跑，分掉到 60.80，吞吐只到 5.25。半自回归把块关死，吞吐 5.44，分 66.41。SlowFast 9.87 / 69.59，比静态扩散快一倍出头，分几乎贴着。这张表没有 Fast-dLLM。Fast-dLLM 在 Table 1 同任务是 7.45 / 69.60，介于 4.55 与 14.57 之间。Table 3 的 9.87 也不是 Table 1 的 14.57：同一任务两张表的 SlowFast TPS 对不上，未找到一手来源说明 9.87 是否换了长度或是否平均了多列。`[OM-FREEPLAY]` 读 Table 3 只拿它当「四种静态对照」用，倍数用 Table 1 的 3.20× 和 Table 4 的 15.63×。

消融：$\tau_{\mathrm{min\_conf}}$ 管探索半径，$\tau_{\mathrm{high\_conf}}$ 管快阶段敢揭多尖。作者选 0.1 / 0.85，在 GSM8K 上接近分数峰值且吞吐仍在。$K_{\max}=8$、$W_{\mathrm{hist}}=2$、$\sigma^2_{\mathrm{stable}}=1.0$ 是另一组扫出来的点。把 0.85 拧到接近 1，快阶段经常退回 top-$k$，吞吐掉。把 0.1 拧到 0，终点乱，span 不可信。

## 7. 和 DualCache、D2F、ReFusion 各比一刀

DualCache 冻 KV，阈值冻揭开集合。SlowFast 改揭开集合的时间结构，KV 照旧双向过期。叠 dLLM-Cache 才进入「少算注意力」那一层。dLLM-Cache 的 V-verify 会选择性刷新动态 token，和 DualCache 的「块内整段后缀冻住」不是同一实现。加速专文的 27.6× 分母是 A100 上原版 Instruct、长度 1024；本篇 15.63× 分母是 4090 上原版 Base、GPQA 长度 1024。硬件、是否 Instruct、采样器三套都不一样。Wu 原文 GSM8K 长度 256 能到 54.4 tok/s；本篇 Table 1 同一方法只开并行、4090，LLaDA GSM8K 只有 7.45。再实现把缓存关了、卡换了、长度可能也换了，7.45 不能拿去打 54.4。本篇 Table 1 的 Fast-dLLM 列只证明「在这份 4090 脚本里，SlowFast 比只开并行的 Fast-dLLM 快」。它不证明 SlowFast 已经赢过 DualCache 主设定。

D2F 的 52.9× 在 MBPP，分母是原版 0.9 TPS，骨架是 LoRA 过的 Instruct，卡是 A100。SlowFast Table 1 的 MBPP 是 4.98 到 13.32，分母已经快得多。两套减不出谁快。D2F 改训练；SlowFast 不改权重。

ReFusion 槽内 AR、真 KV，A100 上 GSM8K 81.24 TPS。SlowFast 在 4090 上同任务 14.57，叠缓存 26.99。卡不同，权重不同，ReFusion 还付了 1.22B 微调。训练免费和改编不是一张榜。产品若不能改权重，SlowFast 是采样器旋钮；若能改注意力和目标，ReFusion / D2F / Eso-LM 走另一条账单。

少步蒸馏把 1024 步蒸成 32 步，改的是步数。SlowFast 的 $N$ 仍由外层去噪循环决定，它改变的是每步揭哪一段。可以叠：学生已经少步，每步再按慢快选格。8B 上没有把 SDTT 和 SlowFast 打开再报 GSM8K 的表。规划器每步 2 NFE，和「快阶段少前向」打架。纠错优先还是吞吐优先，先选一个。

APD 用小 AR 管联合，有损。SlowFast 不管联合，只选更尖的边际团。SSD 3.46× 在 MBPP，对照 Dream-Instruct 自验证。本篇 MBPP 是 Base、4090、13.32 TPS。两套减不出「谁的并行更安全」。Eso-LM 改注意力换精确 KV，对照无缓存 MDLM。SlowFast 留着双向，精确 KV 这条门没开。产品若能改掩码图案，Eso-LM / 块扩散 / ReFusion 比调 $\tau_{\mathrm{high\_conf}}$ 更根本；若权重冻结，SlowFast 是便宜旋钮。

## 8. 失效：两套长度、Base、静态对照对不上

Table 1 和 Table 4 不要焊。报 15.63× 写 GPQA、1024、8-shot、1.60→25.00。报 3.20× 写 GSM8K、Table 1、4.55→14.57。报 5.93× 写 Table 2 的 GSM8K 叠缓存。三个分母三个分子。

原版逐步揭开慢，是因为每一步对整段 $L$ 做双向前向，再按日程只揭几格。长度 1024 时，提示 8-shot 再垫满画布，每步的 $L^2$ 注意力最疼。SlowFast 不能把双向变成因果，它能做的是：认定一段已经平台化之后，少在那段上犹豫。分母 1.60 已经把「原版有多浪费」写进去了。换成已经阈值并行的 Fast-dLLM 当分母，倍数会掉到 Table 1 那种 2–5×。产品若对照物是「已经开了 0.9 阈值的 LLaDA」，15.63× 不适用。

主表是 Base。Instruct 块长 8 的 Nie GSM8K 78.6、本园 LLaDA 专文的 70.3，都不是 69.83。把 SlowFast 接到 Instruct 检查点上，本篇没有那张表。`[OM-FREEPLAY]` 若要在 Instruct 上用，对照必须是同一检查点的原版采样，不要拿 15.63× 当服务指标。

快阶段仍因子分解。span 选对了，只说明「这一段边际已经尖」，不说明联合已经建模。Shuffle 类高 $\mathcal{C}$ 任务上，位置原则可能把互斥的两格收进同一 span。主表没有 ParallelBench。确定性原则在校准差的模型上会骗人：边际尖、联合错，Fast-dLLM 已经在代码列上见过。SlowFast 的 0.85 比 0.9 更松，校准更差时锁死得更早。

dLLM-Cache 间隔过大，过期 KV 和过期预测一起出现。$K_p=500$ 那一格已经掉 3.13 分。vicinity 刷新、DualCache 块结束刷新，本篇主实验走的是 dLLM-Cache 自己的间隔，不是 dInfer 的邻域 16。开 ReMDM loop 会把已落盘再掩回去，span 外缓存和「后缀一直是掩码」一起碎。主表没有 ReMDM。

batch 1、4090。连续 batch、H800、vLLM 调度器，主表都没有。serving 专文的 680 TPS 是另一套编译器。SlowFast 的 54.75 是 Python 循环加缓存的 4090 数字。

Table 3 的 9.87 和 Table 1 的 14.57 对不上，上面已经打标。不要把 9.87/4.55 算成第三套「2.17×」对外讲。三条原则是观察，不是从 ELBO 推出来的定理。换骨架、换长度、换是否 Instruct，置信度地图的成团性要重画。Dream 在 Table 1 的 MMLU-Pro 上 SlowFast 还略慢于原版倍数（1.52×），位置原则不是处处成立。

## 9. 读完应留下的判断

要训练免费的动态揭开，问的是「这一段是否已经收敛」，不是「这一格是否超过 0.9」。阈值并行是慢快里快阶段的特例；半自回归是把 span 写成常数。SlowFast 把 span 变成检验过的随机变量。

要报快，先问哪张表。15.63× 对 GPQA 长度 1024 的原版 1.60。3.20× 对 GSM8K Table 1 的 4.55。34.22× 叠了最狠的缓存间隔，分掉到 28.79。赢 LLaMA3 的 33.79 TPS，用的是 54.75 那一格。

要报质量，先看 Table 1 多数列贴着原版，再看 MMLU +4.45 和 Table 4 缓存档 -3.13 不是同一件事。HumanEval 33.54 减不了 Nie 的 35.4。

图 1 左列是为什么敢冲。右列是何时冲、冲哪一段。底栏是分母。三块齐，15.63 才不会跑到 GSM8K 上去。

4090、batch 1、Base、Python 循环。这四条任一改掉，表都要重跑。A100 DualCache、H800 dInfer、H20 ReFusion，各是各的分母。SlowFast 贡献的是动态 $S$，不是新的 $Q_t$，也不是新的注意力图案。读完采样专文再读本篇，缺的那一刀就是：静态阈值把「尖」当成时刻，SlowFast 把「尖」当成一段已经不再跳的地图。地图还在跳，就继续慢；地图停了，才允许快。方差检验是这句的实现，不是装饰。窗口只有两步，检验很脆，所以 $K_{\max}$ 还在备用。

## 参考文献

- [Wei et al., SlowFast Sampling, ICLR 2026](https://arxiv.org/abs/2506.10848) — Table 1–4；式 (7)–(10)；默认 $\tau_{\mathrm{min\_conf}}=0.1$、$\tau_{\mathrm{high\_conf}}=0.85$；4090。
- [Liu et al., dLLM-Cache, 2025](https://github.com/maomaocun/dLLM-cache) — $K_p$、$K_r$；与 SlowFast 正交。
- [Wu et al., Fast-dLLM, 2025](https://arxiv.org/abs/2505.22618) — 同卡对照在本篇 Table 1–2；27.6× 是另一块 A100 表。
- [Nie et al., LLaDA, 2025](https://arxiv.org/abs/2502.09992) — 本篇主表是 Base，不要和 Instruct 块长 8 焊。

## 相关

- [采样与调度](../02-mechanism/sampling.md)
- [推理加速](./inference-acceleration.md)
- [谁决定揭开哪一格](./plan-denoise.md)
- [D2F](./d2f.md)
- [ReFusion](./refusion.md)
- [Serving](./serving.md)
- [ParallelBench](./parallelbench.md)
- [少步蒸馏](./few-step-distill.md)
- [dParallel](./dparallel.md)
- [LLaDA：8B 从头训到 100B 改编](../03-models/llada-frontier.md)
