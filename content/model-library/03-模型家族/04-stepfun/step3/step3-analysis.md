---
title: "Step-3：从 decode 成本倒推模型结构，MFA、MoE 稀疏度和 AFD 一起定"
category: "模型库"
tags: ["StepFun", "技术解析"]
published: true
excerpt: "引言交代了两条前史：阶跃从 2023 年末开始做 MoE，产物是 Step-2; 2024 年末发布了一种新注意力 MFA (Multi-Matrix Factorization Attention)."
---
# Step-3：从 decode 成本倒推模型结构，MFA、MoE 稀疏度和 AFD 一起定

来源：[Step-3 is Large yet Affordable: Model-system Co-design for Cost-effective Decoding](https://arxiv.org/abs/2507.19427)（arXiv:2507.19427v1, 2025-07-25，StepFun Inc.，18 页）。对照译稿见同目录 `step3-bi.md`，表内数字与公式以源文 `step3.md` 为准。

| 项目 | 数值 |
|---|---|
| 总参 | VLM 321B = LLM 316B + 视觉编码器 5B |
| 每 token 激活 | 38B（DeepSeek-V3 为 37B，Qwen3 MoE 为 22B） |
| 主干 | 61 层，hidden 7168 |
| 注意力（MFA） | query 先降到 2048 维再升到 64×256; 64 个 query 头共享 1 个 K 头和 1 个 V 头，头维 256 |
| FFN | 除前 4 层和最后 1 层外全部是 MoE，含 1 个 shared expert |
| 注意力 effective rank | 16,384（与 DSv3 相同，Qwen3 MoE 为 8,192） |
| 算术强度（KV 8-bit） | MFA 128，MLA 512，Qwen3 的 GQA 32 |
| 实测 decode | 50 ms TPOT 下每卡 4,039 tokens/s 峰值，3,910 长期平均（4K 上下文，FP8，无 MTP，32 卡） |

## 1. 背景与成本模型

### 1.1. 谱系：Step-2 的 MoE 和 MFA 汇到一起，目标定在 decode

引言交代了两条前史：阶跃从 2023 年末开始做 MoE，产物是 Step-2; 2024 年末发布了一种新注意力 **MFA** (Multi-Matrix Factorization Attention). Step-3 把两条线收进同一个模型，注意力用 MFA，FFN 用带 shared expert 的 MoE，服务端在已有的 prefill/decode 分离之上再把 attention 和 FFN 拆开部署（**AFD**）。同目录的 [Step-2 通稿](../step2/step2-bi.md) 只有「万亿参数 MoE」这一句结构信息，Step-3 是这个家族第一篇把层数、头数、专家布局写成表格的技术报告。

作者专攻 decode 给了四条理由：decode 的 MFU 低，每 token 比训练和 prefill 都贵；推理模型想得越久越聪明，固定预算下 decode 越便宜，能想的就越长，这正是 TestingTime 的算力来源；decode 更快也能加速 RL 训练；可优化的空间大。引言还点名了社区里两种常见的次优做法。一是注意力只顾压 KV，把算术强度推得太高，在弱一些的卡上跑不满，也挤掉了量化和投机解码的余量。二是 FFN 一味追求稀疏，不看算力、内存带宽和网络带宽接不接得住，纸面上激活很小，实际 MFU 很低。整篇报告就是对这两点的回应。

这篇报告只讲模型结构和推理系统。训练数据、预训练课表、后训练方法和能力评测，源文一处都没有；第 2 节末尾写明模型侧的更多细节「将来发布」。视觉编码器的 5B 也被明确说与 decode 无关，所有成本和吞吐都不算它。所以读 Step-3 只能回答「这个结构为什么便宜」，回答不了「这个模型有多强」。后来的 Step 3.5 Flash 报告引用 Step-3，说它的 MoE 训练中出现过 dead experts，这一点在本篇里也找不到，大概出自别的材料。

社区解读常把 Step-3 拆成两件事：模型层的 MFA，系统层的 AFD。这样讲好懂，但**论文的推导顺序是反过来的**。作者先假设 AFD 已经部署，于是 attention 和 FFN 可以分开算成本、分开选硬件；在这个前提下再问 attention 的算术强度该落在哪、FFN 能稀疏到什么程度。MFA 的 128 和 MoE 稀疏度的约 0.08，都是从这个系统假设和几款硬件的参数里倒推出来的。

报告的第一张图就是这个思路的结果。横轴是每 token 激活参数，纵轴是理论 decode 成本；每个模型都在 AFD 前提下，从 H800、H20、A800、910B 的任意组合里搜出最便宜的部署方式，再把最低成本画上去。深色区域是 GQA 模型的 Pareto 前沿，Step-3 落在前沿之外更低的位置，作者说上下文越长优势越大，只是图里没画。图注还补了一句，Step-3 的注意力 effective rank 与 DSv3 相同，是 Qwen3 MoE 和 Kimi K2 的两倍。所以这张图同时在说两件事：成本低，而且不是靠削减注意力表达力换来的。

### 1.2. 成本模型：为什么总参和激活参都不是好指标

§4 先统一量化口径，这是后面所有美元数的前提。MLA 族（DSv3, Kimi K2）和 Step-3 按全 FP8 计；GQA 族按 Qwen3 官方全 FP8，并推到 ERNIE 4.5 和 Pangu Pro MoE；混合线性注意力模型更保守，全注意力层 KV 用 BF16，MiniMax Lightning 的状态按官方 FP32。没有 FP8 的硬件假设 INT8 权重加 INT8 KV，访存量对齐。引用这些美元数时，量化假设要一起带上。

在 AFD 下，每个 decode token 的成本拆成两项：

$$
C_{\text{Attn}}(h) = \max\big(FLOP_{\text{Attn}}\,U_{FLOP}(h),\ Byte_{KV}\,U_{byte}(h)\big) + FLOP_{\text{Linear}}\,U_{FLOP}(h), \qquad C_{\text{FFN}}(h) = FLOP_{\text{FFN}}\,U_{FLOP}(h)
$$

$h$ 是硬件。$FLOP_{\text{Attn}}$ 是不含投影的 attention 核心运算量，$Byte_{KV}$ 是这一步要读的 KV（或线性注意力的状态）字节数，两者都随 batch 和上下文线性增长，取 max 就是 roofline 上「算得慢还是读得慢」取较慢者。$FLOP_{\text{Linear}}$ 是 attention 前后的 q/k/v/o 投影，假设 batch 够大、权重访存被摊薄，只按 FLOPs 计；FFN 同理只计激活部分的 FLOPs。同构部署的总价是 $C_{\text{Attn}}(h)+C_{\text{FFN}}(h)$，AFD 则是 $\min_h C_{\text{Attn}}(h) + \min_h C_{\text{FFN}}(h)$，两边各挑最便宜的卡。通信被假设能被多 batch 流水完全掩盖；embedding 和最终输出层占比不到 5%，略去。作者还承认 MLA 与 MFA 的 q/k/v 投影不好做 TP，在 H800 上未必凑得出计算受限所需的 batch，所以这两类在 H800 上被略微低估。硬件单价来自 Table 4–5: H800 每小时 \$2，roofline 591；H20 \$0.8，roofline 只有 74，但内存带宽更高；A800 \$0.75，roofline 156; 910B 按 FLOPs 相对 A800 的比例估出约 \$0.67, roofline 175。

把单价除以满载一小时的峰值，得到 Table 5 的两种单位成本，即 $U_{FLOP} = \dfrac{P_{\text{hour}}}{3600 \times \text{FLOPs}_{\text{peak}}}$, $U_{byte} = \dfrac{P_{\text{hour}}}{3600 \times \text{Bandwidth}}$（H800 按 FP8 峰值 $1.98\times10^{15}$，得 $2/(3600\times1.98\times10^{15}) \approx 2.80\times10^{-19}$）。这是理解 AFD 为什么要拼卡的关键。H800 每 FLOP 最便宜（2.80×10⁻¹⁹ 美元），每字节访存却不便宜（1.66×10⁻¹⁶）；H20 正好相反，每字节访存最便宜（5.56×10⁻¹⁷），每 FLOP 最贵（7.51×10⁻¹⁹）。decode 阶段的 attention 主要是读 KV，看字节单价；FFN 在 batch 够大时主要是矩阵乘，看 FLOP 单价。**同构部署只能二选一，AFD 让两部分各找最便宜的那张卡。**

算出来的结果有四条观察。第一，8K 上下文每百万 decode token，Step-3 用 H800 加 H20 的 AFD 组合约 \$0.055, DSv3 (EP, H800) \$0.068，Qwen3 MoE \$0.062; 32K 时分别是 \$0.129, \$0.211, \$0.193。第二，Qwen3 32B 总参最少、激活也略少，decode 成本却最高。第三，8K 时 attention 已经明显贵过 FFN，上下文越长差距越大，因为 FFN 成本与上下文无关。第四，MLA 离开 H800 就贵很多，GQA 离开 H20 就贵很多，MFA 在四种卡上差别最小。按作者的算法，Qwen3 MoE 总参少 65%、激活少 40%，理论 decode 成本只低约 10%；Step-3 激活最多，反而比两者省约 40%。

Table 6 按硬件拆开的 attention 成本最直观。8K 时 Step-3 在 H800、H20、A800、910B 上约为 0.048 / 0.040 / 0.040 / 0.043，几乎持平；DSv3 从 H800 的 0.054 跳到 H20 的 0.128；Qwen3 MoE 正相反，H20 0.054, H800 0.135。把 Table 2 的量代进上面的式子，能看到差别落在 max 的哪一边（与表对得上）。Step-3 在 H20 上，计算项 $3.27\times10^{10}\times7.51\times10^{-19}\approx2.46\times10^{-8}$，访存项 $2.56\times10^{8}\times5.56\times10^{-17}\approx1.42\times10^{-8}$，取计算项，加投影 $1.55\times10^{-8}$，合 $4.0\times10^{-8}$ 美元/token，即 0.040. DSv3 在 H20 上，计算项是 $1.47\times10^{11}\times7.51\times10^{-19}\approx1.10\times10^{-7}$，访存项只有 $1.60\times10^{-8}$，max 被计算项拉到访存项的约 7 倍，加投影后 0.128。同一张 H20，**两者读 KV 的钱只差约 10%，差价几乎全在 MLA 多出的约 4.5 倍核心运算上**。换到 H800，Step-3 变成访存项 $4.25\times10^{-8}$ 占优，总价 0.048. AFD 的价值在于允许 attention 放到 H20、FFN 放到 H800 这样拼：Step-3 取 attention 最低 0.040 加 FFN 最低 0.015 (H800)，得 Observation 1 的 0.055；DSv3 走 EP 只能同构 H800, 0.054 + 0.014 = 0.068。脚注 1 另外提醒，这套理论计算忽略了过度稀疏带来的额外网络开销，对过稀模型是偏宽松的，所以图上 Step-3 的优势算是保守估计。

同一张表的 FFN 列说明省钱不在 FFN。每百万 token 的 FFN 成本在 H800 上，Step-3 是 0.015，DSv3 0.014，Qwen3 MoE 0.008，Pangu Pro MoE 和 Llama 4 Maverick 都是 0.007，大致跟着激活参走（表注给的激活参：MiniMax M1 46B, ERNIE 4.5 47B, Pangu Pro MoE 16.5B）。Step-3 激活最多，FFN 自然不便宜；**它的总成本低，全靠 attention 一列。** 这也是作者说「attention 设计比激活参更要紧」的数据依据：8K 时 Step-3 attention 的最低价 0.040 已是 FFN 最低价的两倍多，32K 时差距拉到七倍以上。

## 2. 三处结构设计

### 2.1. MFA：算术强度放在 128，和硬件的 roofline 对齐

MFA 的具体矩阵分解在另一篇论文里，本篇只给与成本有关的规格：query 从 7168 维降到 2048 维，归一化后升到 64 个头 × 256 维，所有 query 头共享一个 K 头和一个 V 头。和 MLA 比，Step-3 每 token 的 KV 访存只少约 10%（8K 下 2.56×10⁸ 对 2.88×10⁸ 字节），attention 核心 FLOPs 却只有约四分之一（3.27×10¹⁰ 对 1.47×10¹¹）。32K 时 Step-3 的 KV 访存升到 1.02×10⁹，attention FLOPs 到 1.31×10¹¹，FFN FLOPs 仍是 5.33×10¹⁰，上下文只加在 attention 一侧。

KV 只少 10%，attention 成本却常常减半，关键在**算术强度**，也就是每读一个字节的 KV 要做多少次运算。这个数只取决于注意力结构，与 batch 和上下文无关。MFA 是 128 (KV 8-bit)，MLA 512，Qwen3 的 GQA 32。拿去和硬件的 roofline 比：MLA 的 512 贴近 H800 的 591，到了 H20 (74) 就严重算力不足；GQA 的 32 在 H20 上合适，到了 H800 就大量闲置算力。MFA 的 128 靠近 A800 (156) 和 910B (175)，离 H20 也不算太远。Fig. 5 把 8K 到 32K 的计算与访存轨迹画在各硬件斜率上：MFA 的计算约为 DSv3 的四分之一，访存约为 Qwen3 的三分之一（读图）。表达力没有因此降低，effective rank 仍是 16,384。

用这几个数可以粗算利用率（只看 attention 核心部分）。MFA 在 H800 上是 128 对 591，受带宽限制，算力只能用到约 22%；在 H20 上是 128 对 74，变成受算力限制，带宽用到约 58%. MLA 在 H20 上是 512 对 74，带宽只用到约 14%，大量 KV 带宽闲着等算力。GQA 在 H800 上是 32 对 591，算力只用到约 5%。两端都不理想时，离 roofline 更近的一方成本更低，这就是 Observation 4 的来历。Table 2 里其他模型的数字也能这样读：Qwen3 MoE 在 8K 下 KV 访存 7.89×10⁸ 字节，约为 Step-3 的三倍，attention FLOPs 却只有 2.52×10¹⁰；Kimi K2 的 KV 与 DSv3 相同（2.88×10⁸），attention FLOPs 约为 DSv3 的一半。机制背景见 [03-GQA-在性能与缓存之间折中](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/03-GQA-在性能与缓存之间折中/03-GQA-在性能与缓存之间折中.md) 与 [04-MLA-低秩潜变量与矩阵吸收](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与矩阵吸收/04-MLA-低秩潜变量与矩阵吸收.md)。

这三个数可以从结构直接推出来。decode 时，每个缓存下来的 K 或 V 元素读进来一次，就要和共享它的每个 query 头各做一次乘加，也就是 2 次运算；KV 按 8-bit 存，一个元素一个字节。所以**算术强度约等于「2 × 共享同一份缓存的 query 头数」**。MFA 是 64 个 query 头共享 1 组 KV，2 × 64 = 128；Qwen3 MoE 的 GQA 是 64 个 query 头配 4 个 KV 头，每组 16 个头共享，2 × 16 = 32；MLA 把 128 个头都接到同一个压缩后的潜变量上，矩阵吸收后这条潜变量既当 K 又当 V，读一次要被每个头用两遍，强度约为 4 × 128 = 512，与报告的数一致。换句话说，MFA 的做法是像 MQA 那样只存一组 KV 来压访存，同时用低秩分解把 query 头做多、做宽，靠头数把强度推到 128，又不像 MLA 那样推过头。MFA 自己的低秩分解细节在它的原论文里，Step-3 报告只引用了结论。

**128 比多数卡的 roofline 略低，是有意留的余量。** §5.2 讨论两种会抬高算术强度的技术：「低比特存、高比特算」（比如 4-bit KV 配 8-bit 计算）和 MTP，两者都能让强度翻倍甚至更多。作者逐个推演了「低比特存、高比特算」的影响：DSv3 的强度本就接近 H800 上限、远高于其他卡，这种量化不会带来效率提升；Qwen3 的 GQA 可能因此接近甚至超过 H20 的 roofline，在所有卡上都受益；Step-3 会略微越过 A800 和 910B 的 roofline，但不远，收益温和，在 roofline 高的 H800 上收益最大。存和算用同一格式的量化，作者认为不会改变各模型之间的相对趋势。MLA 已经贴着 H800 的上限，再抬也换不来效率；GQA 和 MFA 则还有空间。但 MTP 是全局性的：attention 可能变快，FFN 的计算量却不管草稿猜没猜中都会增加；在 AFD 已经让 FFN 跑到高 MFU 的前提下，乱开 MTP 可能净增成本。作者估计，在 H20 以外的卡上开 MTP，吞吐还能再涨约 50% 或更多，但报告里的实测都没有开。KV 量化和投机解码背景见 [6.3.1.2-KV缓存与向量量化](../../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1.2-KV缓存与向量量化.md) 与 [01-投机解码原理与应用](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/01-投机解码原理与应用.md)。

### 2.2. MoE 能稀疏到什么程度，由网络带宽说了算

§5.3–5.4 把 FFN 的稀疏度和硬件连起来，推导只有四步。第一步，FFN 一次矩阵乘的运算量是 $2\,N_{\text{token}}\,W_{\text{FFN}}$，$N_{\text{token}}$ 在 decode（不开 MTP）时就是进入 FFN 的 batch $B$，$W_{\text{FFN}}$ 是权重个数；权重按 8-bit 存，每字节权重对应 $2B$ 次运算。要进入计算受限区，这个比值至少追上 roofline:

$$
2\,B_{\text{dense}} \geq \frac{\text{FLOPs}}{\text{Bandwidth}}
$$

第二步，定义稀疏度 $S$ 为每 token 激活专家数占专家总数之比（8 选 2 则 $S=1/4$，256 选 8 加 1 个 shared 则 $S=9/256$）。所有专家都被激活时，每个专家只分到总 batch 的 $S$ 倍，所以 MoE 的总 batch 要放大到 $B_{\text{MoE}} = B_{\text{dense}}/S$，即 $B_{\text{MoE}} \geq \dfrac{\text{FLOPs}}{2\,S\,\text{Bandwidth}}$。第三步，每层要把 $B_{\text{MoE}}$ 个 hidden state 发给 FFN 再收回来，8-bit 分发、16-bit 回收，每个 token 合 $3H$ 字节；三级流水里通信一级累计 16.6 ms，分到 $L$ 层：

$$
\frac{3\,H\,B_{\text{MoE}}}{\text{Net}} \leq \frac{16.6\,\text{ms}}{L}
$$

$\text{Net}$ 是网卡带宽，与内存带宽 $\text{Bandwidth}$ 区分开。第四步，把 $B_{\text{MoE}}$ 的下界代进去，左边的 3 和分母的 2 合成 $3/2$，移到右边成 $16.6 \times 2/3 = 11.1$ ms，解出硬件能接受的最稀疏配置：

$$
S \geq \frac{H \times \text{FLOPs} \times L}{\text{Net} \times \text{Bandwidth} \times 11.1\,\text{ms}}
$$

分子里的 $\text{FLOPs}/\text{Bandwidth}$ 就是 roofline，所以 **roofline 越高的卡，要求的 S 越大**。代入 $H=7168$, $L=61$（与 DSv3 相同）和各卡网卡配置（H800/H20 为 400Gbps×8，A800/910B 为 200Gbps×8，脚注说上限由 PCIe 代际决定），Table 7 给出：H800 0.058, H20 0.007, A800 0.031, 910B 0.034。以 H800 为例，$7168\times591\times61 / (4\times10^{11}\,\text{B/s}\times 0.0111\,\text{s}) \approx 0.058$. H800 每 FLOP 最便宜，对极稀疏的 MoE 却最苛刻。

为了能用 H800，Step-3 的稀疏度不低于 0.058。用同一个阈值反推 DSv3：专家池算上 shared 共 257 个，达标要激活 $257\times0.058\approx15$ 个，再减去必选的 1 个 shared，即 $(256+1)\times0.058-1 = 14$ 个路由专家（脚注 6 说 +1 和 −1 都是为 shared expert），而官方配置是 8 个。作者的解读是，DSv3 多激活几个专家，decode 成本未必涨多少，等于把一部分模型性能白白放弃了。DeepEP 实测每张网卡约 40 GB/s 而不是 50 GB/s，按此修正，合适的稀疏度还要再抬约 25%，到约 0.073。综合下来 Step-3 选了约 0.08（含 shared expert）。Llama 4 Maverick 和 Kimi K2 更稀，在 H800 上离高 MFU 更远。

把中间量也代成具体数。要跟上 H800 的 591，$B_{\text{dense}}$ 至少约 296。稀疏度取 0.08，一次进入 FFN 的 batch 约为 296 / 0.08 ≈ 3,700；每层来回要搬 3 × 7168 × 3,700 ≈ 80 MB，400Gbps×8 的网卡合计约 400 GB/s，用时约 200 µs，落在每层 272 µs 的预算里。稀疏度换成 256 选 8 加 1 那样的约 0.035，batch 要约 8,400，每层约 180 MB，用时约 450 µs，超出预算。把稀疏度取在 Table 7 的 0.058，用时约 274 µs，正好卡在预算边上，与表中的阈值对得上。

过度稀疏有两种补救，§5.5 都讨论了。一是**大规模 EP**，服务器数超过每 token 激活的专家数，每台服务器的流量就降下来，DSv3 官方用十几台服务器的巨型 EP 属于这一类；二是**路由限制**，让一个 token 的专家集中在少数节点，局部不那么稀疏，代价是表达力。DSv3 两种都用；Kimi K2 用了大 EP 却去掉了路由限制，网络瓶颈可能更糟。Step-3 一开始就不进入过稀区，AFD 下可以用小规模的 TP、EP 或两者混合，也不需要路由限制。小规模 EP 下每个 FFN 实例的 S 和整模一样（EP=2 时 8-in-256 变成每实例 4-in-128），只有大 EP 或路由限制才会局部提高密度。共享专家的来历见 [01-DeepSeek-MoE](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md)，部署并行见 [07-MoE混合并行部署与通信优化图解](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md)。

### 2.3. AFD 与 StepMesh: attention 和 FFN 各用各的卡

拆开的理由来自两部分的负载差异。attention 层参数少，但每个 token 都要存 KV cache，推理时吃内存和带宽；FFN 层，尤其是 MoE，参数多得多，却不需要保存中间结果。现有服务系统把两者当成一个整体块调度，硬件利用率上不去。拆开之后还有一个分析上的好处：可以假设两部分各自都跑在理想硬件条件下、各自接近高 MFU，第 1.2 节的成本模型就建立在这个假设上。作者说这样做让理论上限和实测之间的差距更小，而纯 EP 架构把两部分耦合在一起，分析起来天然含糊。

AFD 的设计目标是 50 ms TPOT，也就是每秒至少 20 个 token. attention、FFN 和通信组成三级流水，各占约 16.6 ms（所有层累计）；分到每层，预算约为 16.6 ms / 61 ≈ 272 µs. 脚注另给了四级流水每级 12.5 ms 的方案。通信和计算在同一个量级，所以编排时必须把通信当成独立的一级，不能事后指望它被掩盖。前提是 prefill 和 decode 已经分离部署，AFD 只优化 decode。

和 DeepSeek 式大规模 EP 相比，作者列出 AFD 的几个好处：部署规模小（实测 decode 实例 32 卡，对比常说的 320 卡量级）；上下文变长时可以只加 attention 实例；可以用 TP 与 EP 混合处理负载不均；允许异构硬件。纯 EP 在长上下文下的问题是：attention 变重时，专家节点的配额是固定的，FFN 反而吃不饱。负载不均方面，DSv3 靠复制热门专家来平衡各卡负载，要多占显存，数据分布一变就不灵活；AFD 可以直接在 FFN 侧用 TP 与 EP 混合，在计算效率、通信量和负载均衡之间取折中。部署规模本身也是风险：规模一大，网络拥塞带来不可预测的延迟，直接威胁 SLA. Megascale-Infer 被承认是最早的 AFD 系统，但报告的延迟约 150 ms/token，主要做系统优化；Step-3 的区别在于用 AFD 反过来约束模型设计。作者也说 AFD 与 EP 是互补关系，Step-3 自己的 FFN 侧就用 TP-EP 混合。vLLM 社区后来也提出过 AFD 的设计提案，理由同样是 attention 受带宽限制、FFN 受算力限制，同构部署难以两头都顾到。服务系统背景见 [6.6.4-LLM-Serving与PagedAttention深度解析](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.4-LLM-Serving与PagedAttention深度解析.md) 与 [6.4.1-PagedAttention原理](../../../../llm-guide/6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)。

实现上，attention 实例基于 vLLM 小改，管 KV cache 和路由，embedding 与 LM head 也放在这一侧；FFN 实例用一个轻量 C++ 库加 PyTorch，可以纯 TP、纯 EP 或混合。去程用 FP8，回程用 BF16: attention 侧把上游归一化后的 BF16 激活量化成 FP8 广播给 FFN，FFN 用 BF16 返回，为的是保住残差的精度。FFN 跨多台机器做 EP 加 TP 时，attention 侧还要有一个归约模块，把各 FFN 节点的部分结果合起来；专家分布和 FP8 张量的 scale factor 这类元数据也随 hidden state 一起发过去，体积很小，开销可以忽略。多级流水按 D1/D2/D3 三个微批错开（Fig. 7），A→F 与 F→A 两个方向互不抢带宽。通信库 **StepMesh** 专为 272 µs 预算设计：基于 GPUDirect RDMA，通信操作全部在 CPU 上执行以避免占用 GPU 的 SM，线程按 NUMA 绑核；tensor 预先注册，FFN 侧可以直接切连续内存而不用拼接；后端接口可以接入 GPU 以外的加速器。网络侧配合 **Rail-Optimized RoCE**: attention 与 FFN 实例接到同一组 ToR 交换机，让任意一对实例之间的延迟一致，避免个别节点拖后腿；关掉拥塞控制，只靠 ToR 与网卡之间的 PFC 保持无丢包；每张 GPU 经两个做了链路聚合的网口出网，通信时在两个端口之间均衡流量。StepMesh 在一个已有通信库的基础上开发，对 attention 侧和 FFN 侧分别提供 AFTensorWorker 与 AFTensorServer 两套接口。作者承认仍能观察到 cudaEventSync 带来的抖动，计划尝试 IBGDA。

两类实例的分工再细一点看。attention 实例除了 attention 本身和 KV cache，还负责 MoE 里不属于专家的计算，比如 router，每张卡各处理一批独立请求（本地数据并行）。FFN 实例只做专家计算和它内部需要的多卡通信。以纯 TP 的 FFN 为例：收到各 attention 实例发来的 token 后，先在 TP 组内 all-gather 凑齐输入，算完再 reduce-scatter 把结果分回各卡，然后发回 attention 实例。单机内的 all-gather 和 reduce-scatter 用 NVLS 接口实现，能跑满 NVLink，而且 all-gather 完全不占 SM；关键路径上的 FP8 GEMM 和 Flash Attention 也做了定制 kernel。三个微批的流水里，D1 从 FFN 回来后 attention 就可以开始算它的下一层，不必等 D2、D3，这样每个请求的关键路径不被别的微批拖慢。

为什么要自己写通信库，报告给了三个理由。一是时间：三级流水下，FP8 token、scale、专家分布和回程的 BF16 激活要在 272 µs 内在所有 attention 与 FFN 实例之间传完，现有库难以稳定做到。二是资源：NCCL 和 DeepEP 都要占用一部分 GPU SM 来做通信，直接拖慢 attention 和 FFN 的计算。三是模式：AFD 的收发不是现成的集合通信，用 ncclSend/ncclRecv 拼凑能跑，但性能要打折扣。StepMesh 因此提供异步接口，收发各用独立线程，每个线程的 CPU 延迟都按预算设计；每对 attention 与 FFN 实例之间建两个 RDMA Queue Pair，分别走两个网口。StepMesh 已开源在 https://github.com/stepfun-ai/StepMesh.

## 3. 反例与硬件边界

### 3.1. 两类反例：混合线性注意力，和为训练优化的 MoE

§4.3 用 MiniMax M1 和 Llama 4 Maverick 说明混合线性注意力在推理系统里的陷阱。线性层再多，剩下的少数全注意力层按官方量化单独计算，KV 体积就已经大于 Step-3 整个模型；Fig. 3 显示，不论线性层省了多少、上下文多长，这类模型的总访存都高于 Step-3. MiniMax M1 是 70 层线性加 10 层 GQA 全注意力，Llama 4 的层日程类似。看 Table 2–3 的具体数：8K 时 Llama 4 Maverick 的 KV 访存 1.01×10⁹ 字节，MiniMax M1 9.23×10⁸，Step-3 2.56×10⁸; 32K 时分别是 2.21×10⁹, 1.93×10⁹, 1.02×10⁹。混合模型的 attention FLOPs 确实很低，但 decode 在弱卡上主要受带宽限制，FLOPs 省下来也换不成成本。作者承认，换成带宽更便宜的 H20 能把差距缩小很多，可 KV 总访存多于 Step-3 这一点改变不了。他们对这类模型没有用激进的 KV 量化，理由是全注意力层很少，可能对量化更敏感，所以沿用官方设置，这一项留给后续研究。文中这里说 MiniMax M1 只有 8 层全注意力，与前文的 10 层不一致，源文没有解释。第二个问题是层耗时不均：长上下文时全注意力层远慢于线性层，单机上或许可以忍，放进 AFD 流水就会出现空泡。作者建议混合模型别让全注意力残段吃掉线性侧省下的成本，并尽量让各层耗时均衡。线性注意力背景见 [2.3.3-线性注意力机制](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/2.3.3-线性注意力机制.md)。

Pangu Pro MoE 是另一类反例。它面向 910B 设计，激活只有 16.5B，不到 Step-3 的一半，但 Fig. 4 显示它在 910B 上的理论 decode 成本远高于 Step-3。按 100% MFU 粗估训练成本，Pangu Pro MoE 比 Step-3 便宜 50% 以上；脚注说换成更现实的 40% MFU，趋势也不变。训练成本大体跟着激活参走，decode 成本要另做模型和系统的协同设计；**说一个模型「对某硬件友好」，先要讲清是对训练友好还是对 decode 友好。** 硬件高效注意力的总览见 [2.3.1-硬件高效注意力](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/2.3.1-硬件高效注意力.md)。

### 3.2. 弱一些的卡能不能跑：L20 可以，L4 到头了

§6 用每层 272 µs 的预算推算非旗舰卡。attention 侧，MFA 在 H800 上本就受带宽限制，可以用四张 L20 以约 25% 的 batch 做数据并行来对齐一张 H800，网络带宽需求也只有 H800 服务器的约 25%（4×200Gbps 对 8×400Gbps）。一张 L20 在一层的时间窗内约能读 $864\,\text{GB/s}\times272\,\mu\text{s}\approx235$ MB，其中线性层权重约 67 MB（o_proj 用 TP=8，其余线性层在 8 卡上复制），留给 KV cache 的约 168 MB；每 token KV 512 字节，总上下文约 328K，平均 8K 时 batch 在约 41 以内即可。L4 的带宽只有 300 GB/s，大半窗口都花在读那 67 MB 线性权重上，基本不可用。

FFN 侧假设已进入计算受限、只用 50% 带宽：单张 L20 每层约能处理 $864\,\text{GB/s}\times50\%\times272\,\mu\text{s}\approx117$ MB 权重，61 层约 7.1 GB，一台 8 卡服务器约 56.8 GB. Step-3 的 FFN 权重约 300 GB，需要约 6 台服务器、48 张卡做 EP，仍远小于 DSv3 的部署规模。换成 L4 要约 144 张卡，专家负载不均和稳定性就开始成问题。**瓶颈在 FFN 的总参数量**，总参越大，对弱硬件越不友好；Step-3 的 316B LLM 在 L20 这一档刚好还能部署。

## 4. 实测与后续

### 4.1. 实测吞吐，以及「是不是只因为总参少」

Table 8 在相同 20 tokens/s SLA 下对比。DSv3 官方博客：平均上下文 4,989, 144 卡，每卡 1,850 tokens/s (TGS)；官方 profile：平均上下文 4,096, 128 卡，2,324 TGS. Step-3 在 Hopper 上，平均上下文 4,096，GEMM 用 FP8：长期平均 3,910 TGS，峰值分钟 4,039 TGS（FP8 attention，32 卡，2 个 attention 实例配 2 个 FFN 实例，记作 2A2F），约高 74%. attention 改用 BF16 时配置换成 3A2F，总 batch 6,048，得 3,321 TGS，仍明显高于 DSv3。平均 8K 上下文用 4A2F、48 卡，实测峰值 2,643（按比例外推值为 4,039×4/6 ≈ 2,693）。标准配置下总 batch 6,144，拆成三个 2,048 的微批填满三级流水；上下文变长主要加 attention 实例，作者举例 32K 用 16A2F，约 898 TGS。作者还说明 4K 加 Hopper 恰好是 Step-3 相对 DSv3 优势最小的场景。

这组对比有几处需要带着读。BF16 attention 那一档用了 40 卡，每个 attention 实例每个微批处理 6,048 / 3 / 3 = 672 个请求，吞吐比 FP8 attention 低约 18%，这说明 FP8 attention 本身贡献了一部分优势。8K 用 4A2F 时，总 batch 维持 6,144 不变，每个部件的延迟、MFU 和总网络流量都不变，所以 SLA 仍然满足，只是多出的两个 attention 实例摊薄了每卡吞吐；32K 的 898 是按同样方法推出来的，没有实测。DSv3 那边，脚注说知道有更高的公开数字，但它们不是在 20 tokens/s 的 SLA 下跑的，或者上下文更短，所以没有纳入；作者也承认 DSv3 还能靠更多量化、kernel 优化和更新的 Hopper 卡提速，只是认为同等优化下 Step-3 仍会明显领先。平均吞吐和峰值之间的差距，作者归到抖动，说还在处理。

Table 9 比较单层 attention 延迟（4 卡，batch 256，MFA/MLA 用数据并行，GQA 用 TP，attention 算子 BF16）。8K 时 MFA 在 H800、H20、A800 上为 281 / 438 / 531 µs，MLA 为 372 / 1,252（A800 无数据），GQA 为 382 / 812 / 791; 32K 时 MFA 为 791 / 1,452 / 1,484，MLA 为 1,125 / 4,817，GQA 为 1,391 / 3,042 / 3,010。这张表把第 2.1 节的算术强度分析变成了实测：MLA 在 H20 上最吃亏，MFA 在三种卡上最平。测法上，这里的「一层 attention」包含核心算子前后的线性投影；GEMM 在 Hopper 上用 FP8，在 A800 上用 INT8，attention 核心用 BF16；MFA 和 GQA 用 FA3 (Hopper) 或 FA2 (A800)，MLA 用 FlashMLA，后者没有官方的 A800 实现，所以那一格空着。由于只测 attention 层，这些数也就是 AFD 部署里一个 attention 实例的实际表现。

最后一组消融回答了一个自然的疑问：Step-3 的优势是不是只因为总参比 DSv3 少？作者设想把 Step-3 的 MoE FFN upcycle 到 600B 以上，与 DSv3 同级。FFN 翻倍，需要 4F 才能保持每 token 延迟；若每 token 激活不变，upcycle 后的模型也会变得过稀，400Gbps×8 的网络每个 FFN 实例只撑得住 3,072 的微批，最终方案是 3A4F 跑三个 3,072 的微批，TGS 3,291，比原版 4,039 低，原因正是过度稀疏。它仍高于 DSv3 的 2,324；若再像 DSv3 官方那样用 BF16 跑 attention，估计约 2,880 TGS。**稀疏度在这里表现为一个 decode 系统变量，并不是越稀越好。**

### 4.2. 这份报告没有写的，和后来的 Flash 改了什么

回到开头说的缺口。这份报告没有任何训练数据描述，没有预训练的 token 数、课表或优化器，没有 SFT 或 RL，也没有 MMLU、数学、代码或多模态的能力分数；连 MoE 的专家总数和 top-k 都没有给。它能证明的是：**在给定结构下，decode 在理论和实测上都很便宜**。至于这个结构在同等训练预算下能力如何，要靠别的材料。结论节把下一步写成开启 MTP 并评估增益、继续探索新的注意力变体，以及和硬件厂商合作设计更高带宽的互连域，有了足够的互连再追求更稀疏的 FFN，这与第 2.2 节「今天的网络限制了稀疏度」的判断一致。

约半年后的 [Step 3.5 Flash](../step3-5-flash/step3-5-flash-bi.md) 换了一种思路。它把激活从 38B 降到 11B，注意力改为滑动窗口与 GQA-8 的 3:1 混合，用 MTP-3 做投机解码，目标从每 token 单价换成 agent 多轮交互的墙上延迟；报告也补上了 Step-3 缺的训练数据、稳定性、后训练和评测。两篇放在一起看，共同点是先定部署场景和硬件约束，再倒推模型结构；不同点是 Step-3 关心的是吞吐和单价，Flash 更看重单条请求的延迟和本地可部署性。
