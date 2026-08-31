---
title: "ReFusion：槽级规划，槽内自回归"
category: "04-联合依赖与结构设计"
tags:
  - ReFusion
  - slot
  - plan-and-infill
  - KV-cache
  - Qwen3
published: true
as_of: 2026-08-31
excerpt: "邻近 token 的条件独立最容易破。ReFusion 把并行从格子抬到槽：槽间任意顺序，槽内从左到右。因果注意力加原位置 RoPE，已完成槽的 KV 真复用。摘要 18× 对照 LLaDA / Dream 原版吞吐，不是对照 Qwen3。2.33× 是相对 Qwen3-8B 的逐任务 TPS 均值。34% 相对增益是 LLaDA 平均 48.51 到 65.31。单卡 A100、batch 1。"
---
# ReFusion：槽级规划，槽内自回归

块扩散把并行关进块内：块间因果、块内双向。D2F 再让后一块在前一块未完成时动手。两条河都还在用双向填块，邻近格子仍可能一步同时落盘。Li、Guan、Wu、Li 的 ReFusion（arXiv:2512.13586，人民大学高瓴 + 蚂蚁）把并行从格子抬到槽。槽是定长连续子序列。槽与槽之间仍可任意顺序，槽里面改成自回归。邻近依赖用因果连乘接住，隔得远的槽才并行。仓库 [ML-GSAI/ReFusion](https://github.com/ML-GSAI/ReFusion)，检查点 [GSAI-ML/ReFusion](https://huggingface.co/GSAI-ML/ReFusion)。

ParallelBench 写过：一步因子分解的 KL 下界是 $\mathcal{C}(Y|X)$，近邻相关最伤。ReFusion 的试点在 GSM8K 上量过同一件事：揭开位置 $j$ 之后，位置 $i$ 的预测分布 JS 散度随距离衰减，掩码率越低衰减越快。于是他们不在块内并行揭近邻，改成槽内从左到右。

## 1. 槽不是块

BD3-LM / Fast-dLLM v2 的块：块间左到右，块内双向并行。KV 只在块边界成真。D2F 的块还允许脏前缀。Eso-LM 把已揭开的 token 挪到掩码前面，换精确 KV，排列空间是 token 级 $L!$。ReFusion 的槽反过来：槽内因果，槽间任意顺序。已完成的槽排到掩码槽前面，整段走因果注意力，每个已解码 token 的 KV 都可以复用。位置编码仍用原序列下标做 RoPE，缓冲区打乱之后相对距离还对。

论文在 GSM8K 测试集上做试点：随机揭开一个掩码格 $j$，看其它掩码格 $i$ 的预测分布 $p(x_0^i\mid x_t)$ 与 $p(x_0^i\mid x_t,x_0^j)$ 的 JS 散度。LLaDA 和 Dream 上都是距离越远散度越小，掩码率 $t$ 越低衰减越快。上下文已经密的时候，近邻几乎决定了你，远邻几乎不管。块扩散把近邻放进同一块里并行揭，正好打在 JS 最高的那一段。ReFusion 把近邻串行化，并行发生在槽与槽之间。

推理还套了一层半自回归：输出先切成块长 $b$ 的大块，大块之间从左到右；每个大块内部再跑 plan-and-infill。$b$ 按任务扫，GSM8K / HumanEval / MBPP 用 128，ARC-C 用 8。槽长 $k$ 是规划粒度，块长 $b$ 是外层串行窗口。两个数不要焊成一个「块」。Figure 1 还有一条 ReFusion left-to-right 消融：强制串行填槽，用同一套权重。落点仍比原版 MDM 快，但到不了红点那一格。任意槽序不是装饰，吞吐差在这一刀。

## 2. 规划一步，填槽一步

从全掩码出发，切成 $K$ 个长度为 $k$ 的槽。每轮两步。

规划。输入把已经完成的槽按生成顺序排在前面，未完成的槽按原位置排在后面。这一刀就是 KV 能复用的原因。模型对每个掩码槽打分，默认用该槽第一个位置的最大概率 $\mathcal{C}(\tilde S_t^i)$。超过 $\tau_{\mathrm{slot}}$ 的槽进本轮；一个都不过就只取最尖的那个。选中的槽再按边际采样一版草稿，给后面的投机验证用。相关工作里还有熵、top-2 间隔、位置加权。作者选槽首 max $p$，实现省，校准不必另训头。槽首尖、槽尾糊，整槽仍可能进草稿，后面靠 $\tau_{\mathrm{token}}$ 截。

填槽。先把草稿按原位置拼成一条，做一次前向，找最长前缀，前缀上每个 token 的条件概率都高于 $\tau_{\mathrm{token}}$。前缀够覆盖整槽，就整槽收下，立刻开下一轮规划。前缀不够一槽，改成槽内各自迭代：留下合法前缀，后缀重新掩上，用 MDM 能力补。槽填完之后，KV 直接拼到历史后面。并行槽之间没有互相条件。Table 4：重算 KV 平均更慢 1.16–1.33 倍，GSM8K 84.38 对默认 84.91，HumanEval 77.44 对 78.66。Table 4 的其余列也钉一下。重算 KV：MMLU-Pro 45.56 / 42.80，ARC-C 89.76 / 28.03，MATH 54.18 / 69.20，GPQA 35.49 / 48.51，MBPP 68.20 / 74.45。默认拼接：同四列 45.94 / 52.74、89.76 / 32.46、54.22 / 81.77、35.49 / 64.11、68.20 / 92.09。分数几乎贴着，吞吐每列都慢一截。作者猜少看彼此的错误草稿相当于正则。这是七项上的观察，不是定理。

![ReFusion 先规划多个槽位再在每个槽内自回归填充的生成结构](./images/fig-refusion-plan-infill.png)

> 图 1：左列训练，干净槽做 AR 损失、掩码槽做去噪损失，干净槽洗到前面。右列推理，规划用槽首置信度，填槽先全局验证再槽内补。底栏把 18× 钉在 LLaDA / Dream 原版吞吐，把 2.33× 钉在相对 Qwen3-8B 的逐任务均值。

**图 1 解析**

- **L1–L2**：序列切槽。随机掩一部分槽，干净槽打乱顺序再接到掩码槽前面。
- **L3**：式 (1) 的 $\mathcal{L}_{\mathrm{ARM}}$ 监督干净槽从第 2 个 token 起；式 (2) 的 $\mathcal{L}_{\mathrm{MDM}}$ 监督掩码槽全部 $k$ 格。$\lambda=1$ 相加。
- **L4**：Qwen3-8B 起步，4 个 epoch，3.7M 条约 1.22B token，16 节点 × 8 张 H20，约 10.68K H20 小时。
- **R1**：因果注意力。RoPE 吃原下标，不是缓冲区下标。
- **R2–R3**：$\tau_{\mathrm{slot}}$ 管一次并行几槽，$\tau_{\mathrm{token}}$ 管草稿能收多长。
- **R4**：填完的槽挪到掩码前面。最后按原槽序还原成回答。
- **F0**：18× 不是对 Qwen3。2.33× 是七列 TPS 比的算术平均。ARC-C 上 ReFusion 32.46 慢于 Qwen3 的 42.78，这一列会把均值往下拉。

训练模仿推理。回答切槽，$t\sim U(0,1)$ 决定掩多少槽。干净槽随机排列，掩码槽保持相对位置，再拼成「干净在前、掩码在后」。ARM 损失只加在干净槽内部的 next-token，MDM 损失加在掩码槽。传统掩码扩散干净位置不当监督；这里每个 token 都进梯度。初始化是现成 AR，作者点名 Dream / DiffuLLaMA 那条改编河。槽长训练时从 $\{4,8,16,32\}$ 里随机抽。短序列用 padding，padding 不进损失。推理见到 EOS 就把目标长度截到该位置，后面的高下标不再解码。

干净槽上的 next-token 写成式 (1)。$v_t^{i,j}$ 是第 $i$ 个干净槽的第 $j$ 个字，条件停在该槽内部已经看见的前缀。分母 $(k-1)\cdot|\bm{S}_t^{\mathrm{clean}}|$ 把槽首那一格剔掉，槽首没有左邻居可预测：

$$
\mathcal{L}_{\mathrm{ARM}}=-\mathbb{E}\Biggl[\frac{1}{(k-1)\cdot|\bm{S}_{t}^{\mathrm{clean}}|}\sum_{i}\sum_{j=2}^{k}\log P_{\theta}\bigl(v_{t}^{i,j}\mid p_{0},\bm{S}_{t,<(i,j)}^{\mathrm{clean}}\bigr)\Biggr].
\tag{1}
$$

掩码槽写成式 (2)。监督是原回答里对应位置的干净字 $v_0^{i,j}$，条件看见全部干净槽，再看见本槽已经揭开的前缀。分母是 $k\cdot|\bm{S}_t^{\mathrm{masked}}|$，槽内 $k$ 格全进损失：

$$
\mathcal{L}_{\mathrm{MDM}}=-\mathbb{E}\Biggl[\frac{1}{k\cdot|\bm{S}_{t}^{\mathrm{masked}}|}\sum_{i}\sum_{j=1}^{k}\log P_{\theta}\bigl(v_{0}^{i,j}\mid p_{0},\bm{S}_{t}^{\mathrm{clean}},\bm{S}_{t,\leqslant(i,j)}^{\mathrm{masked}}\bigr)\Biggr].
\tag{2}
$$

总损失式 (3)：$\mathcal{L}=\mathcal{L}_{\mathrm{ARM}}+\lambda\mathcal{L}_{\mathrm{MDM}}$，$\lambda=1$。位置 ID 全程用原回答下标，RoPE 算的是逻辑距离，不是缓冲区下标。因果注意力看见的「左边」是生成顺序上的左边，不是原句的左边。两套坐标不要焊。

训练数据来自 MAmmoTH、OpenMathInstruct-2（开源 1M，去掉超过 1024 token 的题）、OpenCoder、SmolLM 2、Tulu 3，合计 3.7M 条。全局 batch 512，最大长度 4096，学习率 $2\times 10^{-5}$。DeepSpeed ZeRO-2 加 FlashAttention-2。这不是 2.3T 从头训，也不是 Dream 的 580B 改编。1.22B token 只够把槽规划接到已经会写的 Qwen3 上。知识列仍会输给付过万亿 token 的基座，Table 1 的 MMLU-Pro 已经写着。附录 Figure 7 把训练集从 120K 扩到 14M（多出来的质量更差），只训一个 epoch。MBPP 吞吐大约从 51 TPS 走到超过 81。草稿接受率变高，迭代变少。GSM8K 分数在 2M 处见顶，3.7M 略回。主表用的是 3.7M、4 epoch，不是 14M 那条曲线。数据变多不等于同一超参下分数单调涨。作者写：若把 epoch 预算也加上去，分数大概还会走。那是猜想，主表没有 14M × 4 epoch。120K 对照已经证明架构差不靠这份专料的体量；14M 只说明吞吐对数据量更敏感，分数另说。

Table 5 把三种复杂度写在一起。LLaDA 全序列双向，掩码图案约 $2^L$。BD3-LM 块内仍 $2^k$，块间左到右。ReFusion 槽级排列大约 $\lfloor(L/k)!\cdot e\rfloor-1$。$L=4096$、$k=8$ 时这个数已经小于 $2^L$。学的是「先填哪几个槽」，不是「一步同时猜哪些格子」。Eso-LM 的排列在 token 上，空间是 $L!$，作者认为 8B 训不动，才改成槽。

## 3. Table 1：18× 的分母是原版扩散，2.33× 的分母是 Qwen3

协议：零样本，单卡 A100，batch 1。上排准确率 / pass@1，下排 TPS。列是 MMLU-Pro、ARC-C、GSM8K、MATH、GPQA、HumanEval、MBPP，最后一列平均。

| 模型 | GSM8K | HumanEval | MBPP | 平均分 | 平均 TPS |
|---|---|---|---|---|---|
| Llama-3-8B-Instruct | 75.13 / 42.81 | 46.34 / 42.26 | 53.00 / 41.68 | 49.63 | 37.81 |
| Qwen3-8B | 81.96 / 31.20 | 87.80 / 30.95 | 63.80 / 30.07 | 73.36 | 32.42 |
| LLaDA-8B-Instruct | 76.35 / 27.35 | 45.12 / 12.42 | 25.60 / 2.97 | 48.51 | 12.41 |
| LLaDA + Fast-dLLM | 76.27 / 73.07 | 37.80 / 62.52 | 24.80 / 37.19 | 46.24 | 40.46 |
| LLaDA + D2F | 39.04 / 82.59 | 36.59 / 96.90 | 35.20 / 53.85 | 38.96 | 52.13 |
| Dream-7B-Instruct | 76.42 / 20.30 | 56.71 / 3.51 | 50.40 / 1.23 | 55.55 | 8.84 |
| Dream + D2F | 41.62 / 79.20 | 50.00 / 69.15 | 51.60 / 65.59 | 44.72 | 66.22 |
| ReFusion | 84.91 / 81.24 | 78.66 / 103.90 | 68.20 / 92.09 | 65.31 | 72.62 |

格子写成「分数 / TPS」。LLaDA 原版平均 TPS 12.41，Dream 8.84，ReFusion 72.62。摘要「超过 18×」是相对这两份原版逐步揭开的平均加速叙事；ARC-C 上 LLaDA 只有 0.03 TPS，单列倍数会炸，不能拿那一列当 18× 的定义。相对增益 34% 对得上 LLaDA 平均 48.51 到 65.31，$(65.31-48.51)/48.51\approx 34\%$。对 Dream 的 55.55 只有约 18% 相对增益。报 34% 必须写对照物是 LLaDA 平均分。Llama-3-8B-Instruct 平均分 49.63、平均 TPS 37.81：MATH 只有 25.48，HumanEval 46.34。ReFusion 平均分和吞吐都高于这一行，对照物仍是同表的 Llama-3 Instruct，不是 LLaMA3 Base，也不是 Nie Table 1。

其余四列也要抄。MMLU-Pro：Qwen3 67.25 / 31.42，LLaDA 35.80 / 18.21，Dream 40.05 / 15.98，ReFusion 45.94 / 52.74。ARC-C：Qwen3 90.36 / 42.78，LLaDA 85.58 / 0.03，Dream 88.31 / 0.06，ReFusion 89.76 / 32.46。MATH：Qwen3 83.28 / 30.11，LLaDA 38.78 / 23.93，Dream 46.60 / 18.99，ReFusion 54.22 / 81.77。GPQA：Qwen3 39.06 / 30.43，LLaDA 32.37 / 1.99，Dream 30.36 / 1.81，ReFusion 35.49 / 64.11。知识与竞赛数学仍是 AR 基座的地盘；代码和小学算术是槽并行的地盘。相对 LLaDA / Dream，四列分数和吞吐都涨；相对 Qwen3，MMLU-Pro 和 MATH 仍差一截。七列不能收成「全面超过 Qwen3」。

ARC-C 上 LLaDA 0.03 TPS、Dream 0.06 TPS，几乎是逐步揭开把画布垫满再空转。ReFusion 同一列 32.46，仍慢于 Qwen3 的 42.78。18× 若拿 ARC-C 单列当定义，分母接近零，倍数没有产品意义。摘要把 18× 写成七列平均叙事，正文必须把 0.03 那一列单独钉住。

Fast-dLLM 在 LLaDA 上 GSM8K 73.07 TPS、分 76.27，几乎不掉分；HumanEval 却从 45.12 掉到 37.80。MMLU-Pro 35.02 / 39.81，ARC-C 吞吐只有 0.86，MATH 38.58 / 52.23。Dream 接 Fast-dLLM：平均分 48.25 低于原版 55.55，MBPP 掉到 10.60 / 19.55。阈值并行在知识列能保分，在代码列会拆搭配。D2F 接在这张评测框架里分数掉得更狠：LLaDA+D2F 平均 38.96，MMLU-Pro 22.84，MATH 23.68；Dream+D2F 平均 44.72，GSM8K 41.62。加速专文和 D2F 专文用的是作者自己的超参表，和这里不是同一套解码器。抄吞吐可以，抄「D2F 把 GSM8K 打到 39」必须写明是 ReFusion 文的再实现。Dream+D2F 的 MBPP 65.59 TPS 是次快的 MDM 行，ReFusion 的 92.09 相对它约 1.4×，分母是这张表上的 Dream+D2F，不是原版 1.23。

对 Qwen3-8B 的 2.33× 是七列 TPS 比的算术平均，不是 $72.62/32.42\approx 2.24$。GSM8K $81.24/31.20\approx 2.60$，MBPP $92.09/30.07\approx 3.06$，HumanEval $103.90/30.95\approx 3.36$，ARC-C $32.46/42.78\approx 0.76$。平均能到 2.33，因为代码列把 ARC-C 的慢抵掉。摘要「GSM8K 和 MBPP 高 3.68 绝对点」是这两列分差的平均，不是七列都赢。

Figure 5 用 MBPP 一道 Python 题把规划画出来：$k=4$、$\tau_{\mathrm{slot}}=0.6$、$\tau_{\mathrm{token}}=0.3$、$b=16$。第 8 轮同时填四个槽；槽内一次投机收下四个 token。生成顺序不是左到右：先搭 `for` 循环骨架，再回头写 `sum = 1`。槽间任意顺序在代码上就是「先结构后局部变量」。附录 D.1 把基线在同一题上的轨迹放在旁边，本篇不抄图。

## 4. 对照实验：不是数据赢的

Table 2 从 3.7M 里抽 120K，Qwen3-8B、LLaDA、BD3-LM、ReFusion 都从 Qwen3-8B 初始化，各训 10 个 epoch，各用自己的目标。块扩散块长 8，对齐 ReFusion 实验里用过的最小槽。LLaDA 崩掉，平均分 14.43、平均 TPS 0.41：MMLU-Pro 5.12，MATH 1.38，GPQA 0.00。120K 不够把双向掩码目标接到已经训满的因果骨干上。BD3-LM 52.88 分 / 12.11 TPS，GSM8K 还能到 83.55，HumanEval 59.15。Qwen3 再训之后平均分 63.27 / 30.16 TPS，GSM8K 87.57 甚至高于原版 81.96，HumanEval 却从 87.80 掉到 53.66。数据变小会伤已经训满的 AR，伤的位置不均。ReFusion 59.93 分 / 53.34 TPS，HumanEval 70.12 对再训 Qwen3 的 53.66，文称约 1.9× 更快。平均分仍低于再训 Qwen3 的 63.27，差在 MMLU-Pro 42.14 对 52.71、ARC-C 84.81 对 88.65。架构差在 120K 上仍在，不是 1.22B 专料的红利。

Table 3 把 ReFusion 接到 Dream 的 Qwen2.5-7B 骨干，只做 3.7M 微调，没有 Dream 那 580B 预训练。平均分 57.78 对 Dream-Instruct 的 55.55，平均 TPS 97.71 对 8.84，约 11.05×。GSM8K 80.21 / 107.83 TPS，HumanEval 68.90 / 106.89，MBPP 61.60 / 98.04。MATH 这一列 TPS 到 139.55，是整张表最高的单列吞吐之一。知识向 MMLU-Pro 35.25 / 76.02 低于 Dream 的 40.05 / 15.98，ARC-C 83.11 低于 88.31。作者写成没付预训练知识税。跨骨干仍然快，知识列仍会输给付过万亿 token 的改编。2.23% 平均增益是 57.78 减 55.55，不是七列都赢。

超参 Figure 4 在 MBPP 0-shot 上扫。默认 $\tau_{\mathrm{slot}}=0.9$、$\tau_{\mathrm{token}}=0.3$、$k=32$。$\tau_{\mathrm{slot}}$ 升高，分数涨，吞吐不一定单调：并行槽变少，槽内同步开销也可能降。$\tau_{\mathrm{token}}$ 升高，每步收下的草稿变短，吞吐降；过严会反复截断，分数也会掉。$k$ 变大，槽内连贯、一次验证能整槽收下，分数和速度可以一起涨。作者标的甜区：$\tau_{\mathrm{slot}}\in[0.5,1.0]$，$\tau_{\mathrm{token}}\in[0.1,0.9]$，$k\in\{8,32\}$。主表按任务改，附录 Table 6：生成长度一律 512。MMLU-Pro 用 $k=16$、$b=128$、$\tau_{\mathrm{slot}}=0.9$、$\tau_{\mathrm{token}}=0.4$。GSM8K / HumanEval 用 $k=32$、$b=128$。MBPP 同槽长，把 $\tau_{\mathrm{token}}$ 收到 0.3。MATH 用 $k=32$、$b=64$、$\tau_{\mathrm{token}}=0.6$。GPQA 用 $k=8$、$b=16$。ARC-C 用 $k=8$、$b=8$、$\tau_{\mathrm{token}}=0.1$。约束 $b\geqslant k$，外层块装不下槽就不合法。附录还写 $b\in[32,128]$ 时相对 Qwen3 的 MBPP 能同时赢分和吞吐；$b$ 从 32 收到 512，pass@1 相对峰值只掉约 0.2%。

附录 Figure 6 用 TPF（每步揭多少 token）画帕累托，把系统开销从算法里拆出去。LLaDA 和 Dream 随 TPF 升高分数掉得陡。ReFusion 更平。作者把它写成：槽内串行之后，并行选中的对象更接近条件独立。TPF 不是 TPS。主表仍报 TPS。

附录 Table 7 把 ReFusion 的 98 TPS、HumanEval 78.66、MBPP 68.20 放进闭源表。Mercury Coder Mini 1109 TPS、Gemini Diffusion 1479、Seed Diffusion 1600，都带系统优化勾。ReFusion 那一行系统优化是叉，单卡 A100、batch 1。1109 和 72.62 减不出「ReFusion 慢 15 倍」这种产品句，硬件、batch、是否编译过都不一样。serving 专文的 dInfer 才是编译过的扩散吞吐。

相关工作把高效 MDM 收成三条。近似缓存：dLLM-Cache、sparse-dLLM，注意力仍双向，$K,V$ 过期。块混合：BD3-LM / Fast-dLLM 块间左到右换真 KV，块内双向并行。纯因果：Eso-LM 把已揭开的 token 挪到掩码前面。ReFusion 走第三条，但排列粒度从 token 抬到槽。解码策略也是两条河：用自身边际当置信度（top-$p$、熵、top-2 间隔），或者外挂小 AR / 奖励模型做验证。ReFusion 的规划用槽首 max $p$，验证用自己的条件概率截前缀，外挂模型这一条没走。投机解码的草稿来自 MDM 边际，验证器是同一套权重的 AR 头，不是另开 0.5B。

D2F 从双向 LLaDA / Dream LoRA 12 小时，训练见脏前缀。ReFusion 从 Qwen3 微调约 1.22B token，训练见槽排列。D2F 块内仍扩散并行；ReFusion 槽内 AR。D2F 的 52.9× 分母是 MBPP 上原版 0.9 TPS；ReFusion 的 92.09 TPS 分母是同一张 A100 表上的 Qwen3 30.07。两套分母减不出谁快。

Eso-LM 也把已生成 token 挪到掩码前面换精确 KV，排列在 token 上。ReFusion 认为 token 级排列训不动 8B，改成槽级。65× 那篇对照无缓存 MDLM、尺度不是 8B。本篇 18× 对照 8B 原版 LLaDA / Dream 的 Python 循环。

APD 用小 AR 管扩散的联合，要同词表，有损。ReFusion 把 AR 写进同一套权重的槽内损失，验证器不是外挂 0.5B。全局验证那一步像投机解码的前缀接受，草稿来自自己的 MDM 边际。SSD 无损自验证仍是另一条河。

SDAR 先付 AR 的 NLL 再转块扩散，块内仍是扩散。ReFusion 转完之后槽内已经是 AR。同是改编，双向半径和并行粒度反着。产品若要槽外任意 infill，ReFusion 的槽间任意顺序还在；槽内从后往前补，结构上弱于 Dream。

规划器用槽首一个概率当 $\mathcal{C}$，和低置信 remask 用整格 max $p$ 不是同一个头。槽首尖、槽尾糊，整槽仍可能进草稿，后面靠 $\tau_{\mathrm{token}}$ 截。截不干净就槽内重掩。规划器专文的 DDPD 问的是「这一格还脏吗」；这里问的是「这一槽可不可以开」。8B 上没有把 DDPD 接到 ReFusion 的表。

## 6. 失效：外层块、知识列、并行槽互不见

外层半自回归块长 $b$ 把全局任意顺序收成「大块内任意、大块间左到右」。$b=128$ 时任意顺序的半径是 128，不是全句。ARC-C 用 $b=8$，几乎退回短块串行，吞吐 32.46 低于 Qwen3 的 42.78。报「任意顺序还在」必须写 $b$。附录 Figure 8：$b$ 变大，分数和吞吐都不是单调。更大的 $b$ 一次能规划更长的语义单元，同时要在任意顺序里生成更大的块，建模更难；画布上尚未生成的位置仍占着前向，单步变贵。吞吐先涨后掉，和「块越大越并行」的口号对不上。

定长画布是掩码扩散的老毛病。已有 MDM 即使早早写出 EOS，仍会继续解更高下标。ReFusion 训练时短序列 pad、pad 不进损失；推理见到 EOS 就把目标长度截到该位置，后面的高下标不再解码。可变长省的是空转，不是把任意顺序半径拉回全句。截断之后，$b$ 窗口里剩下的槽仍按 plan-and-infill 走。

Qwen3-8B 平均分仍高一截。ReFusion 的 1.22B 微调补的是规划与填槽，补不了基座没见过的竞赛数学和知识。Table 3 在 Dream 骨干上已经把知识列的缺口写出来了。MATH 54.22 对 Qwen3 83.28，和「扩散已经全面超过 Qwen3-8B」对不上。

并行填槽时槽与槽之间互不看见最终取值。Table 4 说重算 KV 几乎不涨分，那是这七项上的观察。ParallelBench 的 Shuffle 会把槽间互斥写进 $\mathcal{C}$。主表没有 ParallelBench。`[OM-FREEPLAY]` 槽间并行在高 $\mathcal{C}$ 任务上要重测，不要把 MBPP 的 92.09 TPS 抄进排列约束产品。

batch 1、生成长度 512。连续 batch、更长画布、H20 训练卡上的推理，主表都没有。10.68K H20 小时是训练账单，不是推理。和 dInfer 八卡 680、D2F 的 A100 集群句，硬件三套。

## 7. 读完应留下的判断

要并行又不想近邻因子分解，问并行粒度是格子、块还是槽。格子是 LLaDA；块内双向是 BD3-LM / D2F；槽内 AR、槽间任意是 ReFusion。

要报快，先问分母。18× 对原版 LLaDA / Dream 逐步揭开。2.33× 对 Qwen3-8B 的逐任务 TPS 均值，ARC-C 那列是负数贡献。11.05× 对 Dream 原版 8.84 TPS，骨干换成 Qwen2.5-7B。三套分母减不出一张总榜。

要报质量，先看平均分 65.31 仍低于 Qwen3 的 73.36，再看 GSM8K 84.91、MBPP 68.20 这两列赢了。34% 只相对 LLaDA 平均分。HumanEval 78.66 减不了 Nie 的 35.4，采样器和是否 Instruct 都不同。

图 1 左列是训练多出来的槽排列。右列是推理多出来的规划 / 验证。底栏是分母纪律。三块齐，18× 和 2.33× 才有地方放。

## 参考文献

- [Li et al., ReFusion, 2025](https://arxiv.org/abs/2512.13586) — Table 1–6；式 (1)–(3)；plan-and-infill；10.68K H20 小时。
- [Sahoo et al., Eso-LM, 2025](https://arxiv.org/abs/2506.01928) — token 级重排换精确 KV，对照尺度不同。
- [Wang et al., D2F, 2025](https://arxiv.org/abs/2508.09192) — 块内仍扩散；Table 1 协议不是本篇。
- [Arriola et al., BD3-LM, 2025](https://arxiv.org/abs/2503.09573) — 块间 AR、块内扩散，槽的反面。
- [Nie et al., LLaDA, 2025](https://arxiv.org/abs/2502.09992) — 本篇 18× 的分母之一。

## 相关

- [块扩散](./block-diffusion.md)
- [D2F](./d2f.md)
- [Eso-LM](./eso-lm.md)
- [从自回归改编](./ar-to-diffusion.md)
- [SDAR](./sdar.md)
- [APD](./apd.md)
- [ParallelBench](./parallelbench.md)
- [推理加速](./inference-acceleration.md)
- [Serving](./serving.md)
- [采样与调度](../02-mechanism/sampling.md)
- [Dream、Mercury、Seed](../03-models/dream-mercury-seed.md)
