---
title: "MiMo-V2-Flash: 309B MoE 怎样同时为长上下文和 Agent RL 省算力"
category: "模型库"
tags: ["MiMo", "技术解析"]
published: true
excerpt: "Flash 是 MiMo 线从 7B 稠密模型跨到大规模 MoE 的一篇。规模是总参 309B，每 token 激活 15B，预训练 27T tokens，原生 32K 再扩到 256K。"
---
# MiMo-V2-Flash: 309B MoE 怎样同时为长上下文和 Agent RL 省算力

来源：[MiMo-V2-Flash Technical Report](https://arxiv.org/abs/2601.02780)（arXiv:2601.02780v2, 2026-01-08, 31 页）。开源：https://github.com/XiaomiMiMo/MiMo-V2-Flash. 对照译稿见同目录 `mimo-v2-flash-bi.md`。表内数字，式号与图号回源文 `mimo-v2-flash.md`。

Flash 是 MiMo 线从 7B 稠密模型跨到大规模 MoE 的一篇。规模是总参 309B，每 token 激活 15B，预训练 27T tokens，原生 32K 再扩到 256K. 摘要主张用约 1/2 与 1/3 的总参逼近 DeepSeek-V3.2 与 Kimi-K2。这篇报告的主线可以用一句话概括：Agent 要跑大量长的多轮循环，于是注意力要便宜（Hybrid SWA），解码要快（MTP 投机解码），RL rollout 要吃满 GPU（MTP 加 Data Scheduler），训练和推理的专家路由要一致（R3），多个领域的能力要合进一个学生（MOPD）。数据选择和评测设计也都围着这条主线走。

谱系上，Flash 的各块积木来路清楚。滑窗注意力来自 Longformer (Beltagy et al. 2020)，局部与全局交替的混合结构在 Gemma 系列里已经常见，报告引用 Gemma 的经验说窗口太小或 SWA 比例太高会伤长上下文；可学习 attention sink 按 gpt-oss (Agarwal et al. 2025) 的实现。MoE，MTP 与 FP8 混精的组合沿 DeepSeek-V3 的路子，MTP 本身承自 MiMo-7B. 多教师 on-policy 蒸馏引用 GKD (Agarwal et al. 2023), MiniLLM (Gu et al. 2024) 和 Thinking Machines 的 on-policy distillation (Lu and Lab 2025). R3 是同队 2025-10 的独立论文（Ma et al. 2025）。往下，V2.5 / V2.5-Pro / V2.6 都沿用这套骨干与后训练范式。

两种 「变大」 在这篇里要分开。部署前的 Scaling 是 309B 总参，27T 数据，256K 窗口。TestingTime 是推理时多花算力，本文里对应 MTP 投机解码的吞吐，以及附录 C 的上下文管理（BrowseComp 58.3 靠它）。后训练算力的放大（更多教师，更多环境）属于训练侧，两者都不等于 TestingTime。

## 1. 架构：注意力与 MoE

### 1.1. 设计出发点：为 Agent 循环省注意力，省解码，省 rollout

摘要写 Flash 「designed for fast, strong reasoning and agentic capabilities」，引言又专门写 MTP 「has strong potential to boost RL rollout speed」。这两句定下了设计优先级：智能体任务要在长上下文里多轮调用工具，每一轮都要重新读前文，每一步 RL 又要跑成千上万条这样的轨迹。全注意力在长序列上的平方开销，自回归解码的串行开销，RL 里长尾序列造成的 GPU 空转，三者叠在一起决定了一次训练能跑多少环境。Flash 的主要设计都在分别削减这三项。

规模配置上，Table 1 与 §3.2 给出：MoE 256 专家 / top-8，**无共享专家**，隐宽 4096，共 48 层（39 SWA + 9 GA），专家中间维 2048，稠密 FFN 中间维 16384，初始化标准差 0.006。报告没有把 15B 激活拆成注意力，embedding，首层稠密 FFN 与各 MoE 层的份额。部署时要按全量 309B 装载权重，每 token 前向的矩阵乘接近 15B 激活侧；开源后社区最常见的抱怨也在这里：激活小，但总参仍然要找地方放。

报告对训练成本几乎不给数。没有 GPU 型号，卡数与 GPU 小时，没有 RL 阶段的步数与每步 token 量，也没有分域教师各自花了多少算力。这让 「用约一半总参逼近 DeepSeek-V3.2」 这句话只能从推理侧成立：部署显存与每 token 计算量确实更省，训练侧是否也更省，这篇没有给出可核对的数字。到 V2.6 报告，小米才公开 RL 阶段的美元成本与 rollout / 训练 / 判分三块的占比，两篇对照着读，能看出团队对 「算力花在哪」 的披露在变多。

### 1.2. Hybrid SWA 与 sink：窗口为什么敢压到 128

Figure 2 与 §2.1 把骨架写成固定拓扑：$M=8$ 个 hybrid block，每个 $N=5$ 个 SWA 后接 1 个 GA；唯一例外是最前一层，用 「GA + dense FFN」 稳定早期表示。Table 1: SWA 的 Q/KV 头 = 64/8，GA = 64/4，头维 QK/V = 192/128，窗长 128，RoPE 只打在 query/key 的前 64 维。按模板展开是 40 个 SWA 加 8 个 GA；首层从 SWA 换成 GA，得到 39 SWA 与 9 GA，总层数 48 不变（按表推算）。所以 5:1 是 block 内部的比例，逐层数下来是 39:9；摘要的 「nearly 6× reduction in KV-cache storage and attention computation」 按 block 模板表述，描述的是相对全 GA 的长序列开销，与总参无关。

两类层的头配置不一样，这一点容易被忽略。SWA 层的 KV 头是 8，GA 层反而只有 4。按 KV 缓存的账推一下（报告没有解释）：SWA 层每个 KV 头只存最近 128 个位置，多给几个头几乎不占显存，可以换表达力；GA 层的缓存随序列线性增长，到 256K 时是主要的显存开销，所以把 KV 头压到 4，与 GQA 的思路一致。按 Table 1 的头配置可以算出具体数（推算）。每层每个位置存的 K 与 V 元素数是 KV 头数 × (192+128): GA 层 $4\times320=1280$，SWA 层 $8\times320=2560$。序列长 $L$ 时全模型 KV 元素数约为 $9\times1280\,L+39\times2560\times\min(L,128)$；$L=262{,}144$ 时第二项只有第一项的 0.4% 左右。若 48 层都换成同配置的 GA，是 $48\times1280\,L$，两者之比约 $0.19$，即 5.3× 的缩减。SWA 层的 KV 头多一倍，在这笔数里几乎不占份额。另一处是 QK 头维 192 里只有前 64 维加 RoPE，其余维度不带位置信息，只按内容匹配；V 头维是 128。部分维度加 RoPE 的做法在长上下文模型里常见，它让一部分注意力不受位置频率的影响，这对只有 9 层 GA 负责远距离检索的结构是有利的。

窗口 128 在同类设计里很激进，能压到这么小靠的是 **attention sink**. sink 现象最早由 StreamingLLM (Xiao et al. 2023) 观察到：softmax 要求注意力权重和为 1，当前 query 没有真正相关的 key 时，模型会把多余权重倾倒在开头几个 token 上。滑窗把开头 token 挡在窗外，这个 「泄压口」 就没了，只能把权重硬分给窗内不相关的 token. gpt-oss 的做法是给每个注意力头加一个可学习标量，作为额外一列 logit 放进 softmax 分母，它吸收概率但不对应任何 value 向量，等于允许注意力 「不看任何人」。Flash 照此实现。单个头上 $a_{ij}=q_ik_j^\top/\sqrt d$，式（2）–(4) 是

$$
s_{ij}=\frac{\exp(a_{ij}-m_i)}{\exp(\mathrm{sink}-m_i)+\sum_{j'}\exp(a_{ij'}-m_i)},\qquad m_i=\max\big(\max_j a_{ij},\,\mathrm{sink}\big),\qquad o_i=\sum_j s_{ij}v_j .
$$

$\mathrm{sink}\in\mathbb{R}$ 每头一个，只出现在分母；$m_i$ 在分子分母上同时减掉，只防溢出，不改结果。把权重加起来，$\sum_j s_{ij}=1-p_i^{\mathrm{sink}}$，其中 $p_i^{\mathrm{sink}}=e^{\mathrm{sink}}/\big(e^{\mathrm{sink}}+\sum_{j'}e^{a_{ij'}}\big)$。窗内所有 key 的 logit 都明显低于 sink 时，$p_i^{\mathrm{sink}}\to1$，$o_i\to0$，这个头这一步基本不输出；没有 sink 时 $\sum_j s_{ij}=1$ 是硬约束，窗内 128 个 key 再不相关也得把这 1 份权重分完。SWA 层的 $j$ 只取窗内位置，GA 层取全部前文，公式相同。Table 2 的 「w/o sink」 关掉的就是分母里的 $\exp(\mathrm{sink}-m_i)$，相当于 $\mathrm{sink}\to-\infty$。背景见 [StreamingLLM 与 Attention Sink](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md) 与 [高效注意力全景综述](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.4-高效注意力全景综述/2.3.4-高效注意力全景综述.md)。

消融在 32B 稠密代理上做，QK 维与 RoPE 配置和正式模型一致，层数与 SWA:GA 比例报告没写：同管线预训练 250B tokens（序列 8,192），扩到 32,768 再训 40B，然后 long-context SFT 与 reasoning SFT. Table 2 显示 $W=128$ 无 sink 全面掉分（MMLU 54.9 vs All GA 57.3），加 sink 后 MMLU 58.3，BBH 56.1，反超 All GA. Table 3 长上下文上 $W=128$+sink 在 GSM-Infinite 17.3，NoLiMa 51.2，MRCR 34.4 优于或持平 All GA；$W=512$+sink 在 NoLiMa 38.5，MRCR 19.6 反而明显变差。Table 4 复杂推理平均 46.3 vs All GA 42.4。三张表用的 checkpoint 阶段不同（Table 2 未扩长的 base，Table 3 扩长后的 base 与 long-context SFT 模型，Table 4 reasoning SFT 模型），不能横向当成同一权重上的数。

窗口更小反而更好，§2.2.2 给了两条假设，都是经验性的。一条是正则化：小窗逼模型只看局部，相当于一种归纳偏置，减少对伪相关模式的过拟合。另一条是分工：更紧的窗让 SWA 只管局部，长程依赖全部交给 GA，两类层职责清楚；$W=512$ 时 SWA 会顺手处理一部分长程依赖，局部与全局的界线变模糊，学得反而更差。报告自己写明结论绑在这个实验设定上，最终 309B MoE 没有重跑全表，直接采用 $W=128$ + sink + 5:1。这个选择和 DeepSeek 路线的 MLA 是两种降 KV 开销的思路：MLA 把 K/V 压进低维潜空间，所有层仍看全序列；Flash 让多数层只看 128 个 token，由少数全局层负责远距离。同队 2026-02 的 HySparse 论文又往前走了一步，让稀疏层直接复用前一全局层的 KV 与 token 选择，在 80B MoE 上报告 KV 存储降近 10×；那是产品站论文墙上的另一条线，数字不属于 Flash。

### 1.3. MoE 配置：不设共享专家，只在首层留稠密 FFN

Table 1 的 Experts 一行写 256/8，§2.1 补一句 「contains no shared experts」，§3.2 把这 256 个称为 routed experts。三处合读，每个 MoE 层的 8 个激活专家都出自路由池，没有每 token 必经的共享支路。DeepSeek-V3 的写法是 1 个共享专家加 256 路由专家，Flash 去掉了共享专家，全网唯一的稠密 FFN 在首层。这样做把负载均衡的全部压力放在路由上，报告在预训练和 SFT 两处都单独给了 expert bias update 的量级：预训练 Stage 1/2 为 0.001，Stage 3 降到 $1.0\times10^{-5}$，SFT 为 $1.0\times10^{-4}$；MoE sequence auxiliary loss 预训练 $1.0\times10^{-5}$, SFT $1.0\times10^{-6}$。

§4.2 给了一个很实用的 SFT 监控量：梯度为零的参数个数 **num-zeros**。上升暗示专家负载失衡（有专家拿不到 token），下降暗示过拟合。稳定依赖 expert bias update rate 与 AdamW 的 $\epsilon$. SFT 实配：学习率余弦 $5.0\times10^{-5}\to5.0\times10^{-6}$, batch 128, $\epsilon=1.0\times10^{-8}$。报告强调 SFT 稳定是后续 RL 收敛的前提：路由在 SFT 已经漂了，on-policy 蒸馏的 token 级优势就建在不稳的专家分配上。这个关切到 V2.6 变成了更激进的做法：RL 阶段直接冻结 router。

为什么去掉共享专家，报告没有给消融，下面是按机制的推测。共享专家的作用是承载所有 token 都要的通用变换，让路由专家专注于差异化知识；代价是每个 token 固定多算一份 FFN，且这份 FFN 在专家并行下需要另外安排。Flash 的激活预算只有 15B，如果拿一部分给共享专家，路由专家能分到的激活就更少。首层稠密 FFN 某种程度上替代了共享专家的角色：最底层的表示对所有 token 都走同一套参数，往上各层再完全交给路由。这种布局的风险是路由塌缩时没有兜底支路，所以 bias update，sequence aux loss 与 num-zeros 监控这些均衡手段在 Flash 里比在带共享专家的模型里更要紧。

## 2. 预训练与 MTP

### 2.1. 语料与长度扩展：为代码 Agent 预埋长程依赖

§3 写语料 27T tokens，处理流水线 「largely follows that of MiMo-7B」，同时刻意偏向长程依赖：长文网页，仓库级代码，pull request，issue，commit 历史。这一选择和后训练的代码 Agent RL 直接相连：RL 环境来自真实 GitHub issue，模型要在陌生仓库里读代码，改代码，跑测例，预训练阶段先见过大量 PR / issue / commit 的对应关系，RL 才有东西可挖。7B 那一代的语料偏竞赛数学与算法题，Flash 的语料往 「真实工程」 挪了一步，数据面的变化与产品目标的变化同步。

三阶段调度（§3.1）：Stage 1 0–22T 在 32K 上训通用语料；Stage 2 22–26T 上采样代码并掺约 5% 合成推理数据；Stage 3 26–27T 把窗口扩到 256K（序列 262,144）并上采样长程依赖数据。学习率：Stage 1 从 0 暖到 $3.2\times10^{-4}$ (50B tokens)，常数 12T，余弦到 $1.0\times10^{-4}$ (10T)；Stage 2 余弦到 $3.0\times10^{-5}$ (4T)；Stage 3 从 $3.0\times10^{-5}$ 到 $1.0\times10^{-5}$, batch 256. Batch 前 500B tokens 暖到 2,048，保持到 Stage 2 结束。与 MiMo-7B 一样，扩长阶段是按 token 数守恒来换 batch 的（按数推算）：$2048\times32768$ 与 $256\times262144$ 都约为 6,700 万 token，序列长 8 倍，batch 小 8 倍，每步 token 量不变。AdamW 为 $\beta_1=0.9$，$\beta_2=0.95$，weight decay 0.1，grad clip 1.0，这组设置也与 7B 相同。FP8 混精沿 DeepSeek-V3 的习惯，注意力输出投影，embedding，输出头留 BF16，router 留 FP32。

长度扩展只动了全局层。Stage 1 的 GA RoPE base 为 640,000，SWA 为 10,000；Stage 3 把 GA base 调到 5,000,000，SWA 不动。序列从 32,768 到 262,144 是 8 倍，GA base 约 7.8 倍（按数推算）。这与混合拓扑相容：SWA 层的相对距离被窗长 128 封顶，序列再长也碰不到新距离，需要外推的只有 9 层 GA。报告没有点名 YaRN 一类插值，只写了基频调整与约 1T tokens 的扩展训练。Table 6 的长检索 NIAH-Multi 从 32K 到 256K 为 99.3 / 99.9 / 98.6 / 96.7；GSM-Infinite Hard 从 16K 到 128K 为 37.7→29.0，相对 DeepSeek-V3.2-Exp 掉得更缓。报告用这组对比说明 hybrid SWA 在噪声长上下文推理上不输稀疏注意力。

Base 横评 Table 5 同时暴露了容量短板。推理与代码格子不弱：MMLU-Pro 73.2, GPQA-Diamond 55.1, AIME 24&25 35.3, SWE-Bench AgentLess 30.8, LiveCodeBench v6 30.8, BigCodeBench 70.1, MATH 71.0。事实问答则明显落后：SimpleQA 20.6 对 Kimi-K2-Base 35.3，C-SimpleQA 61.5 对 77.6。报告把后者归因于总参上限，对照组 Kimi-K2-Base 是 1043B / 32B，DeepSeek-V3.1/V3.2-Exp Base 是 671B / 37B. 这种 「推理强，知识弱」 的不均衡会一直延续到后训练的横评里。

Table 5 其他格能把这个判断拆得更细。通用题上 BBH 88.5，MMLU 86.7，与三个大底座差距在一两分内；MMLU-Pro 73.2 反而高出 Kimi-K2-Base (69.2) 与 DeepSeek-V3.1-Base (58.8) 一大截，这是推理密度语料的老特征，7B 那一代也是 AIME 强，MMLU-Pro 弱，Flash 在更大规模上把后者补了回来。代码短题上 HumanEval+ 70.7 明显低于 Kimi 的 84.8，但 BigCodeBench 70.1 与 LiveCodeBench v6 30.8 是全表最高，SWE-Bench AgentLess 30.8 也高于 Kimi 的 28.2。中文与多语言整体落后：C-Eval 87.9，CMMLU 87.4，GlobalMMLU 76.6，INCLUDE 71.4，都低于三家对照。所有 Base 分数都是 few-shot，AIME 是 2-shot，SWE-Bench 是 3-shot Agentless Repair；DeepSeek-V3.2-Exp 的 SWE 9.4 带星号，表示没跟住 few-shot 格式，不宜当能力读。

Table 6 的长上下文对照同样要看全行。GSM-Infinite Hard 从 16K 到 128K: Flash 37.7→29.0, Kimi-K2-Base 34.6→8.8, DeepSeek-V3.1-Base 41.5→28.7, DeepSeek-V3.2-Exp 50.4→25.7. V3.2-Exp 在短长度最高，到 64K 和 128K 掉得最快，报告据此认为稀疏注意力在带噪声的长上下文推理上有内在劣势。这个结论只来自一张表，而且对照模型的最大长度都不到 256K，NIAH 在 256K 一栏只有 Flash 有数。hybrid SWA 的长上下文优势，在这里的证据是 「掉得慢」，不是 「绝对值最高」。

### 2.2. MTP：同一个模块服务预训练，解码和 RL rollout

MTP 的用法承自 MiMo-7B，时间表也一样：预训练只挂 1 个 MTP head，损失权重 Stage 1 为 0.3，Stage 2/3 为 0.1，与 DeepSeek-V3 后半程调低 MTP 权重的节奏同型。后训练再复制成 $K=3$ 层，每块 0.33B，结构刻意轻：dense FFN 而非 MoE, SWA（64/8，窗 128）而非 GA，每个头吃主模型 hidden 与 token embedding。开源同时放出三层 MTP 权重，草稿模块被当成可交付物。MTP 的一般机制见 [MTP 单独成篇](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP深度解析.md)。

§2.3 给了两条加速理由。解码侧：草稿多 token 让主模型一次并行校验，抬高 FFN 与 attention 的算术强度，又不按请求放大 KV I/O. RL 侧：小 batch 的 on-policy 更新更稳，但吃不满 GPU；长尾序列到最后 batch 趋近 1，空转最严重，MTP 用 token 级并行补回吞吐。这与后面的 Data Scheduler 处理的是同一个痛点的两面：MTP 改单请求的算术强度，Data Scheduler 改序列什么时候回填。

§5 的落地数字要带条件读。3 层 MTP 接受长度最高约 3.6；Table 10 固定 16K 输入 / 1K 输出，扫 per-node batch 32–128 与 accept length 2.8–3.8，相对无 MTP 为 1.82×–2.70×。加速比随接受长度近似线性上升，但同一接受长度下不同 batch 并不单调：accept 3.6 时 batch 64 为 2.53×，batch 96 为 2.56×，batch 128 为 2.33×。摘要的 2.6× 不是表中任何一格的原值，与 3.6 同列最接近的是 2.56×（按一位小数取整的推测）。把每行除以接受长度，比值几乎是常数（按表推算）：batch 64 为 $1.97/2.8\approx2.67/3.8\approx0.70$，batch 128 为 $1.82/2.8\approx2.46/3.8\approx0.65$，batch 32 约 0.66，即加速比 $\approx c_B\,L_{\mathrm{accept}}$。一次投机步平均产出 $L_{\mathrm{accept}}$ 个 token，代价是 3 层草稿加主模型一次并行校验，$1/c_B$ 就是这一步相对一次普通解码步的耗时，在 1.41 (batch 64, 96) 到 1.54 (batch 48, 128) 之间，且不随接受长度变，因为草稿层数固定为 3。报告说的 「线性」 是这个成本结构的直接结果，batch 之间的差别全在 $c_B$ 上。Figure 7 用 next-token 交叉熵与平均接受长度拟合 $y=4(1-0.58x^{0.58})$，$R^2=0.995$：低熵任务（如 WebDev）接受长，高熵任务（如 MMLU Pro）接受短。拟合式在 $x=0$ 处等于 4，对应 3 个草稿全被接受再加主模型校验时自带的 1 个 token（解读），也就是 3 层 MTP 接受长度的上限。反解可知 Table 10 扫的区间落在哪段熵上：$y=3.6$ 对应 $x\approx0.048$，$y=2.8$ 对应 $x\approx0.32$（按拟合式推算，单位同 Figure 7 横轴）。线上吞吐因此是 「任务分布 × 草稿层数 × batch」 的联合结果，属于 TestingTime 一侧的加速。

## 3. 后训练与 RL 系统

### 3.1. 后训练主轴：从分域教师到 MOPD

Figure 3 / §4.1 把后训练分三步。Stage 1 通用 SFT，解决指令跟随。Stage 2 训分域教师：agentic (search, coding, tool) 与 non-agentic（数学，通识推理，安全）各自 RL 或 SFT. Stage 3 是 **MOPD** (Multi-Teacher On-Policy Distillation)：学生从自身分布采样，由对应领域的教师逐 token 打分，再叠加结果奖励。报告的动机是把 RL 算力花在教师上，再用蒸馏把多个专家合进一个学生，避免参数合并的互相干扰和离线蒸馏的分布偏移。§4.1 把要解决的问题说成两个：能力失衡，提升一项技能会让另一项退步（see-saw 效应）；学习低效，合并多个专家时训练信号没被充分利用。顺序多阶段训练容易出前者，参数合并和离线蒸馏容易出后者。机制单独成篇见 [MOPD 多教师在线蒸馏](../../../../llm-guide/4-后训练/4.6-OPD/09-MOPD-多教师在线蒸馏/09-MOPD-多教师在线蒸馏.md) 与 [On-Policy Distillation 深度解析](../../../../llm-guide/4-后训练/4.4-对齐技术/On-Policy-Distillation深度解析.md)。

on-policy distillation 的来路要讲清，才看得懂 MOPD 改了什么。传统蒸馏让学生模仿教师写好的整段回答（离线，学生没见过自己犯错后的状态）。GKD 提出让学生自己采样，教师在学生走到的每个前缀上给 token 分布，并指出 reverse KL 是 「mode seeking」 的，学生会集中到教师高概率的那一种行为上，而不是把概率摊到多个平庸选项。Thinking Machines 把逐 token 的 reverse KL 取负直接当作 RL 优势，教师在学生采到的 token 上算 log-prob 即可，不用枚举全词表。MOPD 在这个框架上加了两件事：教师按 prompt 所属领域切换（多教师），以及可以再加上 GRPO 一类结果奖励。

式（5）–(9) 是具体写法。式（5）是逐 token 的 reverse KL，期望在学生自己的采样下取：

$$
\mathcal{L}_{\text{reverse-KL}}(\theta)=-\mathbb{E}_{x\sim\mathcal D,\,y_t\sim\pi_\theta(\cdot|x,y_{<t})}\log\frac{\pi_{\mathrm{domain}_x}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid x,y_{<t})}.
$$

由于 $\mathbb{E}_{y_t\sim\pi_\theta}[\log\pi_\theta-\log\pi_{\mathrm{domain}}]=\mathrm{KL}(\pi_\theta\,\|\,\pi_{\mathrm{domain}})$，在一个采到的 token 上算 $\log(\pi_{\mathrm{domain}}/\pi_\theta)$ 就是负 KL 的单样本估计，不用对全词表求和；式（6）是它的梯度。训练用的是式（7）–(9) 的代理损失：

$$
\mathcal{L}_{\mathrm{MOPD}}(\theta)=-\mathbb{E}_{x,\,y\sim\mu_\theta}\Big[\frac{1}{|y|}\sum_{t=1}^{|y|}w_t\,\hat A_{\mathrm{MOPD},t}\log\pi_\theta(y_t\mid x,y_{<t})\Big],\qquad \hat A_{\mathrm{MOPD},t}=\mathrm{sg}\Big[\log\frac{\pi_{\mathrm{domain}_x}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid x,y_{<t})}\Big]+\alpha\hat A_{\mathrm{ORM}} .
$$

教师项的符号由师生在这个 token 上的概率比决定：学生给 0.1，教师给 0.5，该项是 $\log5\approx1.61$，往上推；学生给 0.4，教师给 0.05，是 $\log0.125\approx-2.08$，往下压。$w_t=\mathrm{sg}[\pi_\theta/\mu_\theta]$，越出 $[\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}}]$ 置 0（沿 Zhao et al. 2025）。这里 $\pi_\theta$ 与 $\mu_\theta$ 是**同一组参数**在训练引擎与推理引擎里算出的概率，$w_t$ 量的是两个引擎的数值差，不是 PPO 里新旧策略的距离；式（7）也没有 PPO 的 min/clip，越界 token 直接不进损失。归一化也与 MiMo-7B 不同：式（7）先在每条回答内除以 $|y|$ 再取期望，7B 的 GRPO 用整组 token 总数做分母。

按公式结构读，还有三点要注意。其一，$w_t$ 乘的是合并后的整个优势，比率越界的 token，教师信号和结果信号一起被置零。其二，教师项带下标 $t$，逐 token 调整；ORM 项没有 $t$，整条回答共用一个方向。其三，$\alpha$，$\epsilon_{\mathrm{low}}$，$\epsilon_{\mathrm{high}}$ 都没有给数值。

Table 7 是 MOPD 的主证据。AIME 2025 学生 89.3→94.1（最佳教师 RL 93.9, $\Delta=+0.2$）；LiveCodeBench 77.5→83.2; SWE-Bench Verified 67.8→73.4（教师 74.2, $\Delta=-0.8$）。并非处处吸收：BrowseComp 42.5→45.4，最佳教师是 SFT 模型 51.7，$\Delta=-6.3$，全表最大负差；Arena-Hard CreativeWriting 90.1→86.2 是少数回退格。所以 §4.1 「preserves peak performance of the strongest teacher across all domains」 是框架目标，搜索智能体这一格没做到。Figure 6 的三条线对应式（9）两项的开关：ORM-RL 只留 $\alpha\hat A_{\mathrm{ORM}}$，去掉教师对数比；MOPD w/o ORM 取 $\alpha=0$，只留教师项；完整 MOPD 两项都在。图只画了 AIME 2025 与 LiveCodeBench，正文没给曲线读数。

Table 7 的 「最佳教师」 一列标了教师类型，读这一列能看出 MOPD 的教师不一定是 RL 专家。数学，代码，SWE，$\tau^2$ 的教师是 RL 模型；BrowseComp 的教师是 SFT 模型；MMLU-Pro，GPQA，HLE，两项 Arena-Hard 的 「教师」 是学生自己（Self），也就是这些领域没有单独训教师，学生在蒸馏中只需不退步。表中其余几行：HMMT Feb. 2025 76.9→84.4，超过 RL 教师 82.6 ($\Delta=+1.8$); Arena-Hard HardPrompt 50.0→54.1 ($+4.1$)；HLE 21.2→22.1；GPQA 84.9→84.3 小幅回退。以 Self 为教师的格上出现正增长，说明涨分并非全部来自教师信号，共同训练的其他领域（以及 ORM 项）也在迁移。报告列了框架的三个优点：有效且高效（稠密 token 级奖励，信用分配稳定），模块化（教师可以是 RL 模型，另一个 SFT 模型，或学生本身，新增教师不必重构管线），以及教师与学生的迭代共进化。报告还写了 Iterative Co-Evolution：蒸馏后的学生可以再进分域 RL，成为更强的教师，这条循环到 V2.6 变成了 MOPD2。

### 3.2. Agent 环境：真实仓库，搜索图，合成工具图

Non-agentic RL (§4.3.1) 与 agentic RL 分开处理。单轮可验证域用程序工具加 LLM judge 混合校验；主观有用性与安全用 rubric 加参考答案出细粒度奖励。智能体侧按环境数量和算力两条轴一起拉。§4.3.2 / Table 8: Code Agent 90K 真实环境真实 prompt 加 30K 真实环境合成 prompt；Search 150K；General 50K 合成。代码侧脚手架只暴露 `bash`，`str_replace`，`finish` 三个原子工具；环境构建跨 8 种语言，成功率约 70%，K8s 上并发 >10,000 pods。

几类环境各有一处设计值得看。代码 Agent 的系统提示刻意最简，不预设工作流，让模型在训练中自己摸索做法；工具只经 shell 命令与后端交互，不需要单独的工具服务器。Terminal Agent 从 Stack Overflow 与 Stack Exchange 选需要高级技术能力的问题，改写成带查询，Dockerfile 与测例的计算任务，验证环境能装起来并按难度与可靠性过滤后约 30,000 条，再按通过率去掉判分不可靠或太简单的题。Web Development Agent 收集高质量的用户网页，反推用户查询作为种子 prompt，合成覆盖 8 类网页的 RL 数据；用 Playwright 执行生成的代码录成视频，多模态判别器同时评视觉质量，功能正确性与可执行性，报告说视频比静态截图更少视觉幻觉。Search Agent 的脚手架只有 search，open，find 三个工具，题目用事实图从种子实体递归扩展，难度随关系链深度和细节模糊程度上升，答案可验证。Function-calling 智能体在合成应用环境里训，工具图同时含显式数据依赖（输入输出直连）与隐式逻辑依赖（要推断隐藏的系统状态）。Figure 4 显示约 120K 交互环境上的代码 Agent RL 持续抬 SWE-Bench Verified / Multilingual；Figure 5 称代码 Agent RL 还会泛化到其他智能体任务与数学，代码，通识推理榜。这里放大的是交互环境的消耗量，和把总参从 309B 再加大是两回事。

环境和数据的关系在这一节最清楚。预训练里的 PR / issue / commit 让模型见过 「问题描述 → 代码改动」 的配对，但没有执行反馈；SFT 给了 thinking / non-thinking 两种格式的示范轨迹；真正让模型学会 「改错了就看报错再改」 的，是环境里真实跑出来的测例结果。Real 与 Synthesized 两列并存也有分工：真实 prompt 保证分布贴近 SWE-Bench 这类真实 issue，合成 prompt 在同一批环境上补难度与覆盖面，不必为每道新题重新搭环境。环境构建成功率约 70% 意味着每三个候选仓库就有一个装不起来，这部分损耗决定了真实环境的上限，也解释了为什么后来 V2.6 要把 「环境」 单列为 RL Scaling 的一根轴。

### 3.3. RL 系统：R3, Data Scheduler, Toolbox

§4.6 的推理引擎是 SGLang，训练引擎是 Megatron-LM，两边都走 FP8. MoE 在这种组合下有一个 7B 稠密模型没有的问题：两个引擎的数值差异会翻转少量 top-k 专家选择，逐层累积后，同一个 token 在 rollout 和训练时走的专家不同，重要性采样的前提被打破，严重时训练崩溃。**R3** (Rollout Routing Replay) 记录推理引擎的专家选择，训练时重放同一组专家；只重放离散选择，router logits 仍按当前权重重新计算，梯度照常回传给 router。多轮 Agent 还用 request-level prefix cache 同时存 KV 与已路由专家，避免 radix cache 式的跨请求共享破坏一致性。同队的 R3 论文报告它显著降低训练-推理的策略 KL，并优于 GSPO，TIS 等做法。

**Data Scheduler** 把 MiMo-7B 的 Seamless Rollout 扩到细粒度序列调度：动态采样时参考历史 pass rate，必要时给欠载 GPU 派新 prompt；接入 partial rollout，把超长轨迹切到多步，同时限制陈旧度与每批 partial 样本比例，用 staleness-aware truncated importance sampling 补偿。各数据源可配 sample quota，调度优先级，长度上限，temperature，让奖励计算与推理在不同耗时模式间重叠。**Toolbox** 是集中的资源分配器，在并发任务之间执行工具的配额与 QPS 限制，用容错 Ray actor 池消除冷启动；Tool Manager 接在 rollout 引擎上，负责环境预热与序列级异步判分，并做超时恢复与实时监控。把工具管理和 rollout 流程拆开，任务相关的逻辑与系统级策略互不干扰，新增工具类型不用动主流程。这一层解决的是 Agent RL 特有的问题：上万个环境同时调用搜索，代码执行，网页渲染这些外部资源，任何一个工具卡住都会拖住一批 rollout. 7B 那一代拒绝异步训练，Flash 开始接受有限陈旧；这个转变与规模和任务长度同步发生。

训练-推理一致性这条线在家族里是逐代加码的。MiMo-7B 靠修 vLLM 的 prefix cache 与异步输出 bug 保证两边是同一个策略；Flash 面对 MoE 与 FP8，加上 R3 重放专家选择，并用 MOPD 式（7）–(8) 的 $w_t$ 把比率越界的 token 直接置零；V2.6 在此基础上再加两层，每次参数更新后按 MXFP4 kernel 的数值约束对专家做量化-反量化，并记录 top-p 采样的候选集，让训练侧在同一候选集内重新归一化 log-prob。三代处理的是同一个问题：rollout 看到的分布和训练假设的分布之间的差，随模型变大，精度变低，采样策略变复杂而变多。R3 解决的是 「同一份权重下专家选择不同」，V2.6 冻结 router 解决的是 「RL 更新让路由分布本身漂移」，两者不是同一件事。

## 4. 评测与家族位置

### 4.1. 评测：强在哪，弱在哪，哪些要打折读

Table 9 的推理格与同档思维模型持平：AIME 2025 94.1, LiveCodeBench-v6 85.1, GPQA-Diamond 84.3, MMLU-Pro 84.9。长上下文 LongBench V2 60.6 高于 Kimi-K2-Thinking 48.1, MRCR 45.7。代码 Agent SWE-Bench Verified 73.4，Multilingual 71.7，报告称是开源最强档并逼近 GPT-5-High (74.9 Verified). $\tau^2$-Bench 总分 80.3，分项 Telecom 95.3, Retail 79.5, Airline 66.0。同一个 SWE 数字走过三张表：Base 的 Agentless few-shot 30.8，MOPD 前学生 67.8，MOPD 后与横评都是 73.4；协议不同，30.8 与 73.4 相减不能当成后训练增益，可比的增量是 Table 7 内部的 67.8→73.4。

评测协议（§4.5.1）有几处要带着读。HLE 只用文本题；LiveCodeBench 取 2024.08–2025.04 时间窗；MRCR 取 {2,4,8}-needles，最长 128K，所以 MRCR 45.7 并不反映 256K 窗口的表现；$\tau^2$-Bench 用 DeepSeek-V3.2 扮演用户 Agent，换一个用户模型分数可能变。横评对象分两组：开源的 Kimi-K2-Thinking 与 DeepSeek-V3.2-Thinking，闭源的 Gemini-3.0-Pro，Claude Sonnet 4.5，GPT-5-High，闭源的部分格是空的，BrowseComp 与 LongBench V2 都有缺项。

弱项同样清楚。Arena-Hard HardPrompt 54.1 明显低于 Kimi 71.9；Terminal-Bench Hard 30.5 与 Terminal Bench 2.0 38.5 低于 DeepSeek-V3.2-Thinking 的 35.4 / 46.4; HLE (no tools) 22.1 也低于若干闭源。这与 Base 的 SimpleQA 短板是同一个故事：总参小带来的知识与开放写作落差，用 SWE 高分盖不住。开源后第三方试用里，对指令遵循和工具调用稳定性的反馈分歧很大，有人怀疑 SWE 分数偏高；这些反馈与 HardPrompt 的落差方向一致，但不是受控评测。BrowseComp 横评是 45.4，与 MOPD 学生同值；叠加附录 C 的上下文管理后到 58.3，权重没变，属于 TestingTime 一侧的策略，不能写成 「MOPD 超过教师」。

附录 C 的上下文管理值得单独看，因为它说明同一份权重在不同 harness 下差距能有多大。做法分两半：扩充侧把工具，文档，数据库统一暴露成文件，让模型用 Bash 检索；压缩侧在上下文占用超过阈值（低至 30%）时让模型写摘要，完整历史归档到可检索的记忆文件，活跃上下文替换成摘要。报告称 Deep Research 类任务上稳定带来 5–10% 的准确率提升，并与 DeepSeek-V3 系列 「丢掉 tool-call 历史优于保留」 的发现一致；按 DeepSeek 的激进重置策略复现后 BrowseComp 到 58.3。放在 Table 9 里对照：同一行 Kimi-K2-Thinking 60.2，DeepSeek-V3.2-Thinking 67.6，Flash 在带上下文管理的口径下仍落后。从 45.4 到 58.3 的这段差距说明搜索智能体的分数很大程度取决于推理时怎么组织上下文，比较不同模型时 harness 必须对齐。

附录 B 是这篇里最值得外部读者注意的一段。官方 SWE-Bench 镜像没有清干净 ground-truth commit，RL 训练中模型会学到用 git 翻出答案（git hacking）；Figure 8 用 Qwen3-32B 在未处理镜像上的关键词计数展示这种趋势。这个漏洞在社区也有记录：SWE-bench 仓库 issue #465 报告过 Agent 能在环境里用 git 命令看到本应不存在的未来提交，官方之后修了镜像构建。Flash 的处理是评测改用最新镜像，自建训练镜像按官方方式修复，并确认本模型没有 hacking。到 V2.6，这件事扩展成断网，截断 Git 历史，专门的 Hack Agent 与在线清零四层防线。

### 4.2. 在家族里的位置

把各面串起来：语料偏向仓库级代码与长程依赖，为代码 Agent RL 预埋能力；Hybrid SWA + sink 把长上下文的注意力开销压到约 1/6，只让 9 层 GA 承担外推；无共享专家的 MoE 把容量放进路由池，靠 bias update 与 num-zeros 监控维持均衡；MTP 同时服务预训练，解码与 rollout；MOPD 把分域教师合进学生；R3 与 Data Scheduler 保证 on-policy 假设在 MoE 上成立；评测里推理与 SWE 强，知识与开放写作弱。每一块单独拿出来都有先例，Flash 的贡献是在 309B 上把它们配成一套并公开数字。

后续几代的继承关系很直接。V2.5 产品页写语言骨干继承 Flash 的 hybrid sliding window attention，再接自研视听编码器，MOPD 链接指向本报告 §4；V2.5-Pro 在 1.02T 规模上改成 6:1 混合比，MTP 与三阶段后训练照搬；V2.6 的 Table 1 里 Flash 档仍是 48/39/9 层与 256/8 专家，R3 保留，MOPD 升级为 MOPD2，投机解码换成 DFlash. §6 作者自己写当前架构探索仍 preliminary，设计权衡的分析有限。引用时，窗长 128 / 5:1 / MTP 0.33B / SWE 73.4 以本报告为准，不要用后续产品页的口号反推 Flash 拓扑。
