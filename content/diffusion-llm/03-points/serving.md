---
title: "Serving：vLLM 的调度器接不上扩散"
category: null
tags:
  - serving
  - dInfer
  - vLLM
  - TPS
  - LLaDA-MoE
published: true
as_of: 2026-08-31
excerpt: "vLLM 默认一步一个 token、KV 精确追加。扩散一步提交一个位置集合，下一步可能盖回，注意力是双向。dInfer 把推理拆成迭代器、解码器、缓存、模型四块。LLaDA-MoE 在 8×H800、batch 1、长度 1024 上，带 KV 的平均 TPS 680.71，对同节点 Fast-dLLM 无缓存 63.61 约 10 倍，对同节点 vLLM 上 Qwen2.5-3B 的 277.45 约 2.5 倍。1100 TPS 是 HumanEval 上的 TD 检查点，不是单卡、不是 LLaDA 8B 密模型。"
---
# Serving：vLLM 的调度器接不上扩散

会 LLM 的人，缺的往往不是 DualCache 的公式，是这句话：现成 serving 的调度器按「一步追加一个 token」写死了。vLLM、SGLang 的连续 batch、paged attention、投机解码，都围着因果前缀转。掩码扩散每一步要决定一个位置集合提交，下一步还可能把其中一些盖回去，注意力默认全双向。把 LLaDA 丢进 `vllm serve` 走默认 `generate()`，走的是因果解码，分布外。

加速专文写的是算法：阈值、DualCache、CAP。本篇写系统：同一组权重换运行时，TPS 可以差一个数量级。主锚是 dInfer（Ma 等人，arXiv:2510.08666），开源在 inclusionAI。测的是 LLaDA-MoE（激活约 1.4B），不是 Nie 的 8B 密模型。硬件是单节点 $8\times$ H800，batch 1，生成长度 1024，块长 64，PyTorch 2.9.0.dev、vLLM 0.10.1。数字会过期，协议必须跟着抄。

## 1. 调度器假设一步一个 token

AR 的一步：对最新位置算一次注意力，把 $K,V$ 追加进 cache，发出一个 token。连续 batch 把不同请求的「当前一步」拼成一张图。投机解码再猜一段草稿，验证器按因果顺序拒绝或接受。三件事共享同一条不变量：已经写出的前缀不再改，新计算只发生在最右端。

扩散打破这条不变量。当前块里仍有 `[MASK]`，前向要对整段（或整块加邻居）跑双向注意力。提交集合由阈值或 credit 当场决定，长度不固定。下一次前向，明文集合变了，$K,V$ 可能过期。paged attention 按「序列只增长」分配块，对「中间格子从掩码变成词、再可能变回掩码」没有现成页表。于是开源仓库长期停在 Python 循环、batch 1、逐步揭开。Fast-dLLM Table 1 在 A100 上 LLaDA-Instruct、GSM8K 长度 256 报到 54.4 tok/s，原版 6.7。那是算法层加速，内核仍不是 vLLM 那套编译图。

dInfer 的提案是：不要把扩散塞进因果调度器，把扩散推理自己拆成四块可插拔组件。模型前向、迭代器（下一块从哪开始、跨步怎么把表示平滑进去）、解码器（本步提交哪些格）、缓存管理（哪些 $K,V$ 复用、哪些刷新）。算法论文各自发明其中一块；serving 框架把四块焊成一条可测的管线，才能和 vLLM 比 TPS。

论文 Algorithm 1 把四块收成两层循环。外层问迭代器要下一块 $[start:end]$。内层只要这块里还有掩码：先问缓存要不要刷新，再对当前区域做一次模型前向，再把 logits 交给解码器，解码器改写 $X$ 和未定集合。块空了才出内层。这和 Fast-dLLM 的「外层扫块、内层揭阈值」同构，差别在四块都是可替换对象，而不是写死在一篇伪代码里。论文 Figure 3 把一次迭代画成：找当前块里的掩码 → 嵌入（可融上一步）→ TP/EP 前向 → 邻域未命中的 KV 复用 → 解码器落盘 → smoothing 留下加权嵌入给下一步。四块的接口在这一圈里各出现一次。

![](./images/fig-dinfer-vs-vllm.png)

> 图 1：左列 vLLM 因果调度，一步一个 token，KV 精确追加。右列 dInfer 四块：迭代器、解码器、邻域刷新、再报 TPS。同一节点 $8\times$ H800、batch 1、长度 1024。

**图 1 解析**

- **左列 L0→L3**：Qwen2.5-3B 在这篇协议下平均 TPS 277.45。TPF 恒为 1，因为 AR 一步只出一格。
- **右列 R0 iteration manager**：块长 64 的 blockwise 迭代，外加 iteration smoothing 把上一步的加权嵌入融进下一步。
- **R1 decoder**：无缓存设定用 credit；带缓存设定用阈值 0.8；TD 检查点用 hierarchical。
- **R2 vicinity refresh**：当前块邻域窗口 16 重算 $K,V$，块完成后再全量刷新。不是 DualCache 那种「后缀一直当掩码冻住」。
- **R3**：LLaDA-MoE 带 KV 平均 TPS 680.71，HumanEval 1011.12。脚注写清 10× 的分母是 Fast-dLLM 的 63.61，不是 Mercury。

## 2. 四块分别管什么

迭代器决定「下一块从哪到哪」。基线是固定块长从左到右，和采样专文的块解码器同族，块长这里取 64，不是 LLaDA 2.0 主评测的 32。smoothing 多做一件：常规解码每步只留下 $\arg\max$ 的那几个格子，其余位置的 logits 直接丢掉。IterSmooth 把还没揭开的位置上的整份分布变成期望嵌入，加回掩码嵌入里，让下一步前向看见「软猜测」而不是纯 `[MASK]`。附录 A.1 写的是

$$
p_t[i]=\mathrm{softmax}(z_t[i]),\quad
\Delta e_t[i]=p_t[i]\,W_{\mathrm{emb}},\quad
e_{t+1}[i]=e_{\mathrm{mask}}+\alpha_t\,\Delta e_t[i].
\tag{1}
$$

只改仍为掩码的位置，避免把已经落盘的词推离训练分布。$\alpha_t$ 从小值往预设上限长，早段保守、晚段多听分布。主实验的 `cont_weight=0.3` 是附录 D 写进配置表的混合权重。作者报这条能把单步揭开的 token 数抬 30%–40%，并减轻「上了 KV 缓存就掉点」。它不是改 $Q_t$，是改连续两次前向之间的表示接口。输入嵌入和输出投影这篇模型没有绑死，期望嵌入用的是输入矩阵 $W_{\mathrm{emb}}$。

解码器决定「本步哪些掩码落盘」。三档都训练免费。阈值解码从 Fast-dLLM 来，主实验阈值 0.8（Fast-dLLM 原文常用 0.9）。hierarchical 把还没揭开的 span 递归切开，每个子区间尽量至少揭一格，理想情况接近 $O(\log n)$ 次前向把一块填完；直觉是隔开相邻掩码、减轻因子分解。实现里解码阈值 0.92、下界 0.62。credit 给每个位置每个词攒一个历史分：

$$
C_t^{i,v}=\begin{cases}
\beta C_{t-1}^{i,v}+\bigl(p_\theta^i(v\mid x_t)\bigr)^\gamma & v=v^\ast,\\
\beta C_{t-1}^{i,v} & \text{otherwise.}
\end{cases}
\tag{2}
$$

$v^\ast$ 是当前步该位置的 $\arg\max$。$\beta\in(0,1)$ 衰减旧分，$\gamma<1$ 给中等置信度更大的相对加成。提交前把信用加到 logit 上：

$$
\tilde f_\theta(x_t)^{i}_{v}=f_\theta(x_t)^{i}_{v}+\alpha\log(1+C_t^{i,v}).
\tag{3}
$$

一直尖的格子提前过阈值；某一步偶然很尖、历史上乱跳的格子被压住。credit 默认只在当前块里更新，避免未来还全是掩码的位置污染历史。它不改采样策略本身，只换用来排序的分数，因此能和阈值、KV、编译叠在一起。

附录 Table 4–6 把三档解码器和「有没有 KV、是不是 TD」交叉打过。无缓存时 credit 平均分 54.33、TPF 4.29，压过阈值 54.01 / 3.67 和 hierarchical 53.68 / 3.89，所以无 KV 主表用 credit。带 KV 时阈值 53.96 / 3.87 最好，credit 掉到 51.56，hierarchical 的 TPF 反而降到 3.15。TD 检查点上 hierarchical 52.72 / 5.67，阈值掉到 49.56，credit 48.89。解码器不是「越新越好」：缓存一开，历史分和过期 $K,V$ 会打架；蒸馏过的模型更吃空间切开。主表三行用了三套解码器，对照时要把这一行一起抄。

缓存管理面对的是加速专文已经写过的过期问题。DualCache 把提示和仍为掩码的后缀冻住，块内多步读旧 $K,V$。dInfer 认为这份静默缓存会掉点，改成 vicinity refresh：去噪时重算当前掩码格和左右各 16 个邻居的 $K,V$；一块全部揭开之后再全量刷新。warmup 4 步。窗口是超参，不是定理。ReMDM 那种「已落盘再 MASK」会让邻域假设更碎，这篇主实验没有开 ReMDM。

模型层借 vLLM 后端做张量并行和专家并行。MoE 的专家并行在 AR 里通常要大 batch 才能喂饱专家。扩散每一步前向已经是整段序列，batch 1 也有足够的 token 去路由，作者写 TP+EP 叠上推理效率提高一倍以上。再加 `torch.compile` 和 CUDA Graph，在已经开 TP+EP 时再提高两倍以上。迭代之间的 CUDA stream 气泡用 loop unrolling 填，大约 5%–10%。解码器实现去掉控制流、不把 tensor 拷回 Python，就是为了让展开循环真能连发 kernel。块内一旦出现结束符，后面的块全部填 EOS 提前停，作者写效率再抬 15%–40%。算法倍数、编译倍数、早停会乘在同一条 TPS 曲线上。报「dInfer 快 10 倍」时，里面既有 credit / 邻域刷新，也有八卡并行和编译图。拆不开就整段抄协议。

## 3. Table 1：680 对 63，对 277

六个任务要先点名。代码四项：CRUX-O、LiveCodeBench v6、MBPP、HumanEval；数学一项 GSM8K；指令一项 IFEval。这不是 LLaDA-MoE 原论文 Table 3 那组（那边有 MMLU、MATH、BFCL）。Table 1 第一行 54.83 是 LLaDA-MoE 在**这六个任务**上的原分数平均，GSM8K 82.41、HumanEval 61.59、IFEval 59.33、MBPP 70.02 和 MoE 论文 Instruct 列对得上，另加 CRUX-O 42.38、LCB v6 13.27。Qwen2.5-3B 在同一六项上平均 54.44。激活参数量接近（MoE 1.4B 对 3B 密），质量接近，才有资格比速度。

TPS、TPF 都是 **per sequence**。论文式子：对数据集 $D$ 里每条样本 $i$，令 $T_i$ 为第一个 EOS 之前生成的 token 数，$F_i$ 为这条上跑过的扩散迭代次数，$t_i$ 为墙钟。$\mathrm{TPF}=\frac1N\sum T_i/F_i$，$\mathrm{TPS}=\frac1N\sum T_i/t_i$。AR 的 TPF 恒为 1。报吞吐时若有人把 batch 内多条请求的 token 加总再除时间，口径已经换了。

无 KV。Fast-dLLM 阈值 0.9：平均 53.52 分，TPS 63.61，TPF 2.82。dInfer 开 credit 加 smoothing：54.33 分，TPS 407.36，TPF 4.29。这一档大约 6.5 倍于 Fast-dLLM（407/64），质量略高。HumanEval 上 dInfer 已经 606.85 TPS。

有 KV。Fast-dLLM DualCache：52.15 分，TPS 110.98，分数掉了。dInfer 阈值 0.8 + smoothing + vicinity：53.96 分，TPS 680.71，TPF 3.87。HumanEval TPS 1011.12。摘要里「相对 Fast-dLLM 约 10 倍、质量相近」用的是 680.71 / 63.61，分母是**无缓存**的 Fast-dLLM，不是 DualCache 的 110.98。680/111 大约 6 倍，作者正文也写了这一档。10 倍和 6 倍都对，对照列不同。10 倍的分母是无缓存 Fast-dLLM，不是 DualCache。

相对 vLLM 上的 Qwen2.5-3B：680.71 / 277.45 $\approx$ 2.45，作者写成 2.5 倍，摘要写成 2–3 倍。这是「开源扩散 MoE + 专用栈」对「同节点已经编译好的 3B AR」。不是对 LLaMA3 8B，不是对 Mercury Mini 的 1109 tok/s。Mercury 是 H100 上 Artificial Analysis 的商业栈，单卡口径。dInfer 是八卡 H800、batch 1、作者自己测。两套 1100 不能减。

任务列把「尖的代码、平的指令」写成可核对的格子。带 KV 的 dInfer：HumanEval TPS 1011.12、分 62.2，对 Qwen 的 294.05 / 60.37；GSM8K TPS 682.9、分 80.97，对 Qwen 的 294.15 / 86.28；IFEval TPS 444.51、分 58.78，对 Qwen 的 296.7 / 58.2；LCB v6 TPS 422.88、分 13.0，对 Qwen 的 200.12 / 9.2。指令遵循的置信度更平，每步少揭，并行红利缩小。HumanEval 局部语法尖，吞吐最高。GSM8K 上扩散这边质量仍低于有 RL 的 3B AR，速度却已经拉开。读平均 680 之前先看任务列。加速专文写过同一句话：数学竞赛逐步推导往往不尖，代码局部很尖。这里用六列 TPS 把那句话钉在同一张协议上。

| 设定 | 框架 | 平均分 | 平均 TPS | HumanEval TPS | IFEval TPS |
|---|---|---|---|---|---|
| Qwen2.5-3B | vLLM | 54.44 | 277.45 | 294.05 | 296.7 |
| 无 KV | Fast-dLLM 阈值 0.9 | 53.52 | 63.61 | 90.8 | 60.25 |
| 无 KV | dInfer credit+smoothing | 54.33 | 407.36 | 606.85 | 285.49 |
| 有 KV | Fast-dLLM DualCache | 52.15 | 110.98 | 143.9 | 95.23 |
| 有 KV | dInfer 阈值+smoothing+vicinity | 53.96 | 680.71 | 1011.12 | 444.51 |

## 4. 轨迹蒸馏把 TPF 再抬一截

Table 2 的 LLaDA-MoE-TD 不是另一张 $Q_t$。附录 C.1 叫 Trajectory Compression。先用预训练扩散模型在领域数据上采很多条去噪轨迹，用外部验证器（数学题用判对）留下正确的黄金轨迹，再随机抽同一条轨迹上的两个时刻 $i>j$，让网络从较早的 $s_i$ 一次预测到较晚的 $s_j$ 里那些新揭开的格子。损失是这些 $\Delta_{i\to j}$ 位置上的负对数似然。Seed Diffusion 也强调「在高质量生成路径上再训」。和 SDTT 的差别：SDTT 蒸的是老师再走 $m/k$ 步之后的分布，骨架可以是 GPT-2 尺度 MDLM；这里蒸的是「自己的正确轨迹上一次跳多格」，检查点是已经训好的 7B-A1.4B。少步蒸馏专文的 4× / 8× 对照带 KV 的 GPT-2 骨架，不能和 Table 2 的 847 TPS 焊。

TD 检查点在 dInfer 最优组合（dual-cache、hierarchical、vicinity、smoothing）下：平均 52.72 分，TPS 847.22，TPF 5.67。HumanEval TPS 1125.67，这才是摘要「超过 1100」那一格。平均超过 800 也是这一行 847.22。质量相对原版 MoE 在这六项上的 54.83 掉了约 2 个点。吞吐换质量，账单写在明面上。作者另报 TPF 在数学推理上可涨 99.8%，其它领域平均 45.3%。那是蒸馏本身的 TPF 增益，叠上 serving 之后才变成 847。Table 2 里 GSM8K 已经 1011.22 TPS，IFEval 仍只有 496.92：蒸馏没有把指令任务变成 HumanEval。

d3LLM（Qian 等人，ICML 2026，arXiv:2601.07568）走伪轨迹：老师揭开顺序当监督，不必老师最终答案正确。评测用 AUP，把准确率和 TPF 收成一条带惩罚的曲线面积。它改权重，也改多块解码。dInfer 的 TD 改权重；credit / hierarchical 不改权重。三句话的对照物分别是：dInfer Table 2 的 847 TPS（八卡、MoE-TD），d3LLM 相对原版 LLaDA/Dream 的约 10×（另一套硬件与 TPF 定义），SDTT 相对带 KV 的 GPT-2 的 4×。分母三套，不能直接相减。

LLaDA 2.0 用 dInfer 对 SGLang 上的文内 AR：flash-CAP 535 TPS 对 256 / 237，约 2.1 倍。那是 100B MoE 转换模型，阈值 0.95、块长 32。和 Table 1 的 680 不是同一张卡。2.0 证明「改编出来的大 MoE 也能接这套调度器」。Table 1 证明「从零训的 7B-A1.4B 在八卡上可以超过同节点 vLLM 的 3B」。两句都要，焊成「扩散已经 1100 TPS」就丢了模型、卡数、是否 TD。dInfer 论文自己列的模型支持是 LLaDA-MoE、LLaDA-1.5、LLaDA-Instruct；2.0 是后来那篇报告接进来的。读「已支持」时以各自论文为准。

## 5. TPF 不是 TPS

TPF 是一次前向提交多少 token。AR 恒为 1。Table 1 里 dInfer 带 KV 平均 TPF 3.87，无 KV 4.29。有缓存时 TPF 略降、TPS 却从 407 跳到 681：每步更便宜，总吞吐仍涨。只报 TPF 会让人以为无缓存更快。只报 TPS 会让人以为算法揭开了更多格子。两列都要。

d3LLM 强调 AUP，正是因为阈值一拧，TPF 上去、准确率下来，单点 TPS 会挑最漂亮的工作点。dInfer Table 1 在固定协议下报六个任务，已经比单点好，仍不是一条完整的准确率-并行曲线。产品若允许掉 2 个点换 847 TPS，选 TD；不允许，选 680 那一档 53.96 分。没有免费的 1100。

batch 1 是这篇的产品设定，也是 MoE 专家并行能喂饱的原因。线上若把 batch 拉到 8，AR 的连续 batch 会更值钱：不同请求的「当前一步」可以拼成一张图，每张图仍只追加一个 token。扩散每一步已经是满序列前向，再把多条请求拼进去，算力账单按序列长度乘 batch 涨，调度器还要处理各条请求块进度不同、掩码集合不同。作者没有给大 batch 主表。`[OM-FREEPLAY]` 聊天服务的 SLA 应当重测 batch 与长度，不要把 680 写进单卡聊天的承诺。投机解码那条 AR 补丁也抄不过来：草稿-验证依赖「前缀已定、只猜后缀」。扩散一步提交的是散落位置，验证器按因果顺序回滚没有现成语义。APD、SSD 要另计延迟，不能算进 Table 1 的 680。

早停和生成长度绑在一起。协议把画布垫到 1024。模型若在第 200 格写出 EOS，后面的块可以全填结束符，墙钟变短，TPS 分子只计 EOS 之前的 token。短回答任务会看起来更快，不是解码器突然更尖。HumanEval 函数体往往够长，IFEval 指令有的很短，两列 TPS 的差里混了长度分布。对比时长度 1024 是画布上限，不是每条样本都写满 1024。

## 6. 失效：卡数、分母、生态仍薄

$8\times$ H800 不是一张消费卡。把 1011 HumanEval TPS 抄进「笔记本也能」没有一手来源。张量并行把一层线性拆到八卡，单卡延迟和八卡吞吐是两件事。Mercury Mini 1109 写的是单卡 H100 第三方评测。dInfer 写的是作者节点上的每序列 TPS。硬件、评测方、是否含 prefill，三项有一项对不上就不能减。

10 倍的分母是 Fast-dLLM 无缓存 63.61。Fast-dLLM 原论文在 A100、LLaDA-Instruct 上可以到 54 tok/s（另一模型、另一卡、另一长度）。两篇 Fast-dLLM 数字不能互当基线。dInfer 为了公平，在同一节点、同一 LLaDA-MoE、同一长度 1024 上重跑 Fast-dLLM。公平基线是 63.61 和 DualCache 的 110.98，不是加速专文 Table 1 的 54.4。

vicinity 刷新假定邻域语义局部。超长提示、块边界上的括号跨块，窗口 16 可能不够。块完成后的全量刷新把一致性买回来，延迟账单含在 TPS 里。开 ReMDM loop 或 Seed 编辑腐蚀时，已写位置会再脏，邻域假设更差。主表没有这些采样器。缓存专文的 27.6× 对照原版逐步揭开的 LLaDA，分母极慢；本篇对照已经编译的 vLLM，分母快得多，倍数掉到 2.5。两篇同时正确。

生态观察会过期。dInfer 论文写明支持 LLaDA-MoE、LLaDA-1.5、LLaDA-Instruct。LLaDA 2.0 在自己的报告里用这套框架对 SGLang。vLLM 默认路径 2026 年 8 月仍是因果。两年后若 vLLM 原生接块扩散，本篇的「调度器接不上」要改成「默认路径接上了」，ELBO 和因子分解不必改。对照专文把这一维标成工程现状，不是机制必然。本篇提供 2026-08 能核对的一帧。

Credit 会和自信的错字共谋，规划器专文写过同一句。一直尖的错误中间量会提前落盘。hierarchical 用空间切开缓解局部依赖，不检查对错。验证器（[APD](./apd.md)、SSD）仍要另计延迟。serving 把启发式跑快，没有把联合分布写回来。SDAR 在 H200、LMDeploy、8B、大 batch 上的 6600 TGS 是另一张卡，见[SDAR](./sdar.md)，不能减本篇 680。带 KV 时 credit 平均分掉到 51.56，说明「历史分」和过期缓存叠在一起可以比 DualCache 的 52.15 还差。消融表存在的理由就是挡住「四块全开一定最好」。

## 7. 读完应留下的判断

接现有聊天栈，问的是块间能不能真缓存，不是标题里有没有 diffusion。接 dInfer，问的是四块怎么组合、卡数、是否 TD。报速度，先写硬件和分母：63.61、277.45、680.71、847.22、1011、1125 六个数对应六种对照。会加速算法的人，把 DualCache 和 vicinity 当成两种过期策略，不要并成「有 KV 就行」。会 MoE 的人，记住扩散的专家并行在 batch 1 就喂得饱，这是整段前向送的礼，不是稀疏本身变快。

图 1 左列是已经会的 vLLM。右列四块是扩散多出来的调度。读完应能指着 Table 1 说出：10 倍减的是谁，2.5 倍减的是谁，1100 出现在哪一列。指不出分母，TPS 就还是口号。

## 参考文献

- [Ma et al., dInfer, 2025](https://arxiv.org/abs/2510.08666) — Table 1–2、4–6；四模块；8×H800；credit / hierarchical / vicinity；附录 A.1 / C.1 / D。
- [Wu et al., Fast-dLLM, 2025](https://arxiv.org/abs/2505.22618) — 被同一节点重跑的无缓存 / DualCache 基线。
- [Zhu et al., LLaDA-MoE, 2025](https://arxiv.org/abs/2509.24389) — 被 serve 的 7B-A1.4B 权重。
- [Bie et al., LLaDA 2.0, 2025](https://arxiv.org/abs/2512.15745) — 同一框架上的 535 TPS 对 SGLang AR。
- [Qian et al., d3LLM, 2026](https://arxiv.org/abs/2601.07568) — 伪轨迹与 AUP；10.3× 对照 HF 上原版 LLaDA 27.9 TPS，专文见[d3LLM](./d3llm.md)。不是本篇 Table 1。

## 相关

- [推理加速](./inference-acceleration.md)
- [块扩散](./block-diffusion.md)
- [少步蒸馏](./few-step-distill.md)
- [d3LLM](./d3llm.md)
- [谁决定揭开哪一格](./plan-denoise.md)
- [LLaDA-MoE](../03-models/llada-moe.md)
- [LLaDA 专文](../03-models/llada-frontier.md)
- [扩散 vs 自回归](../04-comparison/diffusion-vs-autoregressive.md)
- [失效模式](./failure-modes.md)
- [Dream、Mercury、Seed](../03-models/dream-mercury-seed.md)
- [SDAR](./sdar.md)
- [APD](./apd.md)
- [D2F](./d2f.md)
- [ParallelBench](./parallelbench.md)
