---
title: Prefill 与 Decode：同一模型的两种系统形态
description: 从 shape、算术强度、KV 流量与服务指标推导两阶段的内核和调度
published: true
---
# Prefill 与 Decode：同一模型的两种系统形态

自回归模型前向公式没有在首 token 后突然改变，但硬件看到的工作负载变了。Prefill 一次接收整段 prompt，线性层是较大的矩阵乘，attention 同时处理许多 query；decode 每轮每请求只新增一个 token，矩阵变窄，历史 KV 读取随上下文增长。把二者平均成一个 token/s，会丢掉系统设计最关键的分界。

这里从统一 Transformer 层出发，推导两个阶段的 shape、FLOPs、字节和延迟，再讨论 chunked prefill、混合调度、模型并行与实际测量。所有数字都说明假设，不将硬件规格峰值当成实测。

## 1. 从一层 Transformer 的 shape 开始

设 batch 为 $B$，本轮 query token 数为 $T$，隐藏维度为 $H$，attention head 数为 $A$，每头维度 $D=H/A$，KV head 数为 $A_{kv}$。输入 shape 是 $X\in\mathbb{R}^{B\times T\times H}$。Q 投影输出 $[B,T,A,D]$，K/V 输出 $[B,T,A_{kv},D]$；GQA 让多个 query head 共享一个 KV head。

Prefill 时 $T=S_p$，即这一批实际处理的 prompt token（padding 或 packed 后口径需说明）。Decode 时每个序列本轮只有一个新 token，逻辑上 $T=1$；连续批处理将多个活动序列合并，线性层的矩阵行数约为活动 token 数 $B_a$。

一个 $H\to H_o$ 线性层 FLOPs 约为 $2BTHH_o$。QKV 与输出投影在 prefill 具有较大的 $BT$，权重可被很多行复用；decode 的 $BT$ 小，读取权重的字节难以摊薄。于是相同层在 prefill 可能偏计算受限，在小 batch decode 可能偏带宽受限。

### 1.1. Prefill 的计算与数据流

QK 计算对每个 head 形成 $T\times T$ score，FLOPs 约 $2BT^2H$；概率乘 V 再有近似相同量级。线性投影为 $O(BTH^2)$，attention 为 $O(BT^2H)$。当 $T$ 相对 $H$ 较小，投影仍可能占主导；上下文非常长时，二次项上升。

朴素实现若把 score/probability 写到 HBM，中间容量为 $BA T^2 w$，很快不可接受。FlashAttention 分块 Q、K、V，使用在线 softmax 保存每行最大值和归一化和，避免完整矩阵落到 HBM。它减少 I/O 与中间容量，不改变精确 attention 的二次算术量。

### 1.2. Prefill 并不只有一种 shape

离线 benchmark 常用等长 prompt，线上长度却高度不均。padding 到最大长度会执行无效 token；packing/ragged kernel 减少浪费，却需要 offsets、变长调度和边界处理。报告吞吐时应区分有效 token 与实际执行 token。若 1000 个有效 token padding 到 1600，硬件 token/s 很高也可能掩盖 37.5% 无效工作。

长 prompt 还可能超过单轮 token budget。Chunked prefill 将它切成多个块，已处理前缀写入 KV，下一块的 query attending 到旧 KV 与当前块。块大小决定 GEMM/attention 效率和调度粒度。大块吞吐好，却让 decode 请求等待更久；小块改善抢占，却增加 launch、页表访问和重复调度。

### 1.3. TTFT 由排队与 prefill 构成

TTFT 可拆为网关/tokenize、队列、prefill 执行、采样和发送。优化 prefill kernel 只能减少其中一段。当到达率接近容量时，吞吐提升会间接大幅降低排队；低负载时则主要反映设备时间。基准需同时给低并发固有时延和目标负载下的尾延迟。

多个 prompt 组成 batch 可以提高权重复用，但等待凑批会增加 queue delay。调度器可设置最大等待窗口和 token budget：到预算、到超时或有高优先级请求就发车。最优窗口取决于到达分布与 TTFT SLO。

## 2. Decode 的带宽模型

Decode 对每个活动请求只生成一个 token。以参数权重 $M_w$ byte、batch $B_a$ 粗略估算，若一轮近似读一遍权重，平均每 token 权重流量约 $M_w/B_a$。14 GB BF16 权重在 2 TB/s 理想 HBM 带宽下，仅权重读取下界为 7 ms/轮；batch=1 时约 143 token/s，batch=32 时同一轮产 32 token，聚合吞吐提高，但每请求 token 间隔仍受 7 ms 加其他成本约束。

实际 decode 还读 KV。单层单请求已有长度 $S_c$ 时，K/V 流量约 $2S_cA_{kv}Dw_{kv}$；全模型乘 $L$。随着上下文增长，每轮时间可能上升。GQA/MQA 减少 $A_{kv}$，直接减少 KV 容量与流量；但权重、MLP 和调度仍在，端到端不会同比缩短。

### 2.1. 一个 KV 流量算例

取 $L=32,A_{kv}=8,D=128,S_c=4096,w_{kv}=2$，单请求本轮读取约

$$
2\times32\times4096\times8\times128\times2=536{,}870{,}912\ \text{byte},
$$

即 512 MiB。2 TB/s 下理想下界约 0.268 ms。batch=32 时有效 KV 约 16 GiB/轮，若长度相同、没有 cache 重用，理想带宽项约 8.6 ms。此时权重被 batch 摊薄，KV 可能接管瓶颈。

线上长度不同，paged attention 要根据每请求页表读取不同 block。最长序列不一定决定全部计算，kernel 可以按实际长度处理；但 batch 内工作分配不均、地址离散和 split-KV 归约会增加成本。只用平均上下文估算容易低估长尾。

### 2.2. 为什么 Decode kernel 不能照搬 Prefill

Prefill 有二维 Q tile，可让 K/V tile 被许多 query 复用；decode 每序列只有一个 query，并行度来自 batch、head 和沿 KV 的切分。上下文长而 batch 小时，单个 head 可沿 KV 分给多个 block，分别维护局部 softmax 状态，再合并这些局部量。拆分太多会增加中间写回与归约，所以阈值随长度和 batch 变化。

线性层同样需要针对窄 $M$。训练/Prefill 常用的 GEMM tile 在 $M=1$ 时大量空闲。持续 batching 把多个序列合成矩阵可改善，但请求数不足时，专用 GEMV、小矩阵 kernel 与权重量化更重要。

## 3. 同卡混合调度的矛盾

若引擎等待整个 prefill 完成再 decode，长 prompt 会造成已有流式请求 ITL 尖峰。若每轮只 decode，新的 prompt 无法进入系统。Chunked prefill 允许每轮先安排 decode token，再用剩余 token budget 放若干 prefill 块，实现 iteration-level scheduling。

设一轮目标最长 20 ms，当前 decode batch 预计 8 ms，可给 prefill 约 12 ms 预算。实际 kernel 时间受 shape 非线性影响，不能简单按 token 比例切。调度器需要从历史 profile 或在线模型估计不同长度块的时间，并为误差留余量。

混合批次还可能让算子 shape 复杂。某些引擎把 prefill 与 decode 分开执行但置于同一轮，减少 kernel 分支；另一些使用统一 ragged attention。前者有额外 launch，后者内核更难优化。比较应看整轮时间、decode deadline 和有效 token，不只看单个 attention kernel。

### 3.1. 抢占与重算

显存不足时，新高优先级请求可能抢占旧请求。若丢弃旧请求 KV，恢复时要重新 prefill 已生成上下文；换出到 CPU 则支付 D2H/H2D。对短上下文，重算可能比换出快；长上下文更适合保留或迁移。决策可比较预计重算 FLOPs/时间与 KV 字节/传输时间，同时考虑 CPU 缓冲是否有空间。

抢占需要公平性。总让短请求插队会饿死长请求；可按等待时间提升优先级，限制每租户在途 KV，或为不同 SLO 保留配额。吞吐最优策略未必满足任何一个租户的 p99。

### 3.2. PD 分离：让两种 shape 去不同设备池

Prefill/Decode 分离为两阶段独立批处理和扩缩容。Prefill 池偏好高计算能力和大 token batch，Decode 池偏好高带宽与足够 KV 容量。请求完成 prefill 后，将每层 KV 传给选定 decode worker，再开始流式生成。

迁移字节就是该请求 KV 容量。前述 4096 token 配置约 512 MiB；若希望额外迁移不超过 20 ms，有效带宽至少约 25.6 GiB/s，尚未计协议和排队。多请求并发会共享 NIC。若 KV 传输在首 token 后进行会破坏 decode 连续性，通常要在交接前完成或分层流水。

分离减少不同阶段互相阻塞，却新增跨池路由、KV 生命周期、一致性和故障恢复。Decode worker 接收一半失败时，源端何时释放？模型/adapter 版本不同能否接收？目标显存不足怎么办？协议必须用 transfer id 和 manifest 描述层/块完成状态，直到目标确认接管后才释放源引用。

## 4. 多设备执行与测量

TP 将权重和计算切到多卡，但每层引入 collective。Prefill GEMM 大，通信较容易被计算摊薄；decode 小消息和逐层同步更敏感。增加 TP 可降低单卡权重流量、缩短计算，却可能让 collective latency 接管。测试应扫实际 batch/context，不可用训练 shape 推断。

PP 在推理中让 token 依次经过 stage。Prefill 可用 micro-batch 流水，Decode 的逐 token 依赖限制单请求并行，但多个请求可填流水。stage 不平衡决定节拍。对于低延迟服务，更多 PP stage 也增加逐 token 跳数和网络依赖。

副本并行避免单请求 collective，但每副本复制权重。低并发时单副本小 TP 可能更省延迟；高吞吐时多个副本有更好故障隔离。容量规划同时考虑每副本最小并行度、请求分布和可容纳 KV。

### 4.1. 指标与实验口径

离线吞吐测试固定一组 prompt/output 长度，将所有请求预先就绪，适合看引擎上限。在线测试按到达过程发送请求，适合看排队和 SLO。二者都要报告硬件、模型/量化、并行度、输入输出长度分布、并发和采样设置。

Prefill 吞吐用 input token/s，Decode 用 output token/s；若给总 token/s，需同时给两者比例。延迟至少报告 TTFT、TPOT/ITL 与端到端，并按长度桶分组。平均值可能被大量短请求主导，p99 也可能只是最长请求；分组后才能判断是系统抖动还是工作量差异。

设备 profile 将一次迭代拆成线性层、attention、collective、采样和空档。若 kernel 总时间远小于迭代时间，检查 CPU 调度、同步和 graph break；若 HBM 接近持续上限，优先减少字节或增大 batch；若 Tensor Core 利用低且矩阵很窄，检查 shape 与并行度。

### 4.2. 选择优化的顺序

优化目标由 TTFT、TPOT、吞吐和成本约束共同定义。真实负载的长度与到达分布给出 prefill/decode 占比，KV 容量则限定可维持的并发，由此判断分页、GQA、量化或换出的需求。Kernel、调度和集群拓扑的改动都应对应其中一项已测出的约束。

常见误区是把所有问题归给 attention。小 batch decode 可能主要读 MLP 权重；短 prompt prefill 可能由投影主导；高并发服务可能卡在队列和 KV 容量。一个优化改变 attention 2 倍，若它只占端到端 20%，总收益上限也有限。

**Prefill 和 Decode 的 shape 与状态生命周期不同，内核和调度约束也随之改变。** 从 $[B,T,H]$、权重字节与 KV 长度出发，可以继续推导内核选择、批处理和资源池设计。

**一层计算量的完整展开。**

以 decoder-only Transformer 为例，忽略 bias。Q 投影为 $2BTH^2$ FLOP；若 GQA 的 K/V 输出维度各为 $H_{kv}=A_{kv}D$，K/V 合计 $4BTHH_{kv}$；输出投影为 $2BTH^2$。SwiGLU 有两个 $H\to H_f$ 上投影和一个 $H_f\to H$ 下投影，矩阵乘合计约 $6BTHH_f$ FLOP。

Prefill self-attention 的 QK 与 PV 合计约 $4BT^2H$ FLOP（GQA 不改变 query head 的 score/output 主量级）。于是单层主项可写成

$$
F_{layer}\approx 4BTH^2+4BTHH_{kv}+6BTHH_f+4BT^2H.
$$

取 $B=1,T=4096,H=4096,H_f=11008,A=32,A_{kv}=8,D=128$。四类主项约为：Q/O 投影 274.9 GFLOP，K/V 68.7 GFLOP，MLP 1108.4 GFLOP，attention 两次矩阵乘 274.9 GFLOP，合计约 1.73 TFLOP/层。32 层约 55.3 TFLOP。这个例子中即便序列为 4096，MLP 仍是大主项；只优化 attention 不能等比例优化 prefill。

当 $T$ 增至 32768，线性项乘 8，attention 二次项乘 64，attention 占比显著上升。交叉点可从 $4T^2H$ 与线性层系数比较。不同 $H,H_f,GQA$ 配置交叉点不同，所以「长上下文一定 attention 主导」需要具体数字。

把各项写成带单位的时间下界，还要加入数据移动。设 BF16 元素宽度 $w=2$ byte，单层输入与输出至少各有 $BTHw$ byte；Q、K、V 是否写回 HBM 由融合边界决定。若投影与 attention 分开，Q 的写入和读取约为 $2BTHw$，K/V 合计约为 $4BTH_{kv}w$，完整 score 若被物化还会增加 $2BAT^2w$ 的写读。Score 写读项在 $B=1,A=32,T=4096$ 时已经达到 2 GiB，且还没有计算 probability 的副本。FlashAttention 避免这类二次 HBM 流量，但 QKV、输出和层间 activation 仍会穿过相应存储层级。

以前述 4096 token 算例为例，32 层主体约 55.3 TFLOP。若目标 GPU 在这些矩阵 shape 下实测可持续 120 TFLOP/s，纯计算下界约 461 ms；若实际 prefill 设备时间为 620 ms，不能直接把 159 ms 全部称作 kernel 效率损失。逐层时间线可能包含 RMSNorm、RoPE、残差、词表投影、TP collective 与 kernel 间空档。先把这些区间分开，再比较矩阵主体的 $F/P_{shape}$，才能判断应优化 attention I/O、MLP GEMM，还是减少调度空档。

有效 token 与实际执行 token 也会改变分子。四个 prompt 长度分别为 4096、3072、1024、512，若直接 padding 到 4096，执行 token 为 16384，有效 token 只有 8704，利用率约 53.1%。此时报告 40K input token/s，必须说明分子采用 16384 个执行 token 还是 8704 个有效 token；前者描述硬件处理速度，后者才对应用户工作。采用 packing 后无效计算减少，但序列边界 mask、offset 读取和不规则 tile 会引入新成本，不能把节省的 token 比例直接当成加速比例。

**Decode 的权重与 KV Roofline。**

Decode 每层每请求 $T=1$。线性层 FLOPs 仍可由上式去掉 attention 的 $T^2$，但矩阵行数等于活动请求数。权重最少读取量近似是该层参数字节，KV 读取量为 $2BS_cA_{kv}Dw_{kv}$。对整模型，下界近似

$$
T_{decode}\ge \max\left(\frac{F}{P_{shape}},\frac{Q_w+Q_{kv}}{B_{HBM}}\right)+T_{comm}+T_{launch}.
$$

$P_{shape}$ 是小矩阵可持续算力，不是规格峰值；$Q_w$ 是否每轮完整从 HBM 读，取决于 cache 和模型大小，但大模型通常远超 L2。权重量化把 $Q_w$ 降低，KV 量化把随上下文增长的 $Q_{kv}$ 降低，两者适用区间不同。

取 7B 模型 BF16 权重约 14 GB，KV 配置仍为 32 层、8 KV head、128 维。batch=1、上下文 4096 时，权重约 14 GB，KV 约 0.5 GB，权重占主；batch=32 时，权重仍约 14 GB，KV 有效读取约 16 GB，KV 已可超过权重。连续 batching 提高权重摊销，却让 KV 成为下一瓶颈。

如果权重做 INT4 后含元数据约 4 GB，batch=1 明显受益；batch=32、长上下文下，KV 不变时总字节从约 30 GB 降到 20 GB，理论加速只有 1.5 倍而非 3.5 倍。再加反量化和通信，端到端更低。这就是工作量与资源模型比「位宽降低四倍」更可靠的原因。

量纲检查能很快发现 decode 估算中的错误。$Q_w$ 与 $Q_{kv}$ 的单位是 byte/iteration，除以 byte/s 后得到 s/iteration；一轮若产生 $B_a$ 个 token，聚合吞吐是 $B_a/T_{iter}$ token/s，单请求的 token 间隔仍接近 $T_{iter}$。将 14 GB 权重除以 2 TB/s 得到 7 ms 后再除以 batch，只能得到每 token 分摊的设备工作，不能把单请求 TPOT 写成 $7/B_a$ ms。调度器每轮只为每个活动请求生成一个 token，用户仍需等待整轮完成。

更完整的例子取 14 GB 权重、32 个请求，其中 16 个上下文为 2K、8 个为 8K、8 个为 16K。沿用每个请求 4096 token 对应 512 MiB KV 读取的配置，本轮 KV 流量约为 $16\times256+8\times1024+8\times2048=28672$ MiB，即 28 GiB。权重与 KV 合计约 42 GB；若不规则 paged attention 的可持续带宽只有 1.4 TB/s，带宽下界约 30 ms。若 profiler 显示 HBM 实际读取 50 GB，则页表离散、cache miss、重复读取或中间张量至少带来约 8 GB 模型外流量。若读取量接近 42 GB但时间为 40 ms，应继续检查带宽利用、长序列负载不均和 split-KV 归约。

权重量化后的失效边界取决于瓶颈迁移。将权重从 14 GB 降到 4 GB 后，上例总流量由约 42 GB 降到 32 GB，带宽下界只从 30 ms 降到约 22.9 ms；若反量化和 scale 读取增加 2 ms，理论轮次收益约 5 ms。上下文继续增长时，KV 占比更高，权重量化的边际收益还会下降。相反，在 batch=1、短上下文下，权重占绝大多数，低比特 kernel 的 shape 支持与反量化吞吐才是主要验证对象。

**Chunked Prefill 的等价性与成本。**

将长度 $S$ 分成块 $C_1,\ldots,C_n$。第 $i$ 块 query 需要 attend 到此前 $P_i=\sum_{j<i}C_j$ 个 KV 和块内 causal KV。若使用精确 attention、位置和 mask 一致，逐块输出应与整段 prefill 对应位置一致；数值归约顺序不同可能有小误差。

总 attention 算术量没有因切块消失：跨块矩形项加块内三角项合计仍与整段 causal attention 同阶。切块的系统收益是限制单轮执行时间、减少瞬时 workspace，并让 decode 插队；代价是更多 kernel/调度、页表访问，以及较小 tile 的效率下降。

假设 8192 token prompt 整段执行 160 ms，会令目标 TPOT 30 ms 的 decode 严重超时。切为 16 个 512-token 块，每块设备时间 13 ms（总计 208 ms），prefill 总工作反而慢 30%；若每块间插入 8 ms decode，一直在线的请求却能维持约 21 ms 间隔。吞吐与交互时延发生交换，不能只比较 prompt 完成时间。

块调度还要保留 KV。第 10 块开始前已有 4608 token，attention 读取量大于第 1 块。固定 512 token 的执行时间并不恒定；预测模型至少使用 chunk size 与 prefix length 两个变量。长前缀下可缩小块以守 deadline，或由 profile 选离散档位。

精确等价还依赖位置编码、mask 和数值状态。RoPE 的位置必须使用全局 token 下标；滑动窗口 attention 要在块边界应用同一可见范围；prefix-LM 或任意稀疏 mask 需要保证跨块连接与整段执行一致。在线 softmax 合并不同 KV 分段时，若每段保存局部最大值 $m_j$、指数和 $l_j$ 与局部输出 $o_j$，全局最大值为 $m=\max_jm_j$，归一化和为 $l=\sum_je^{m_j-m}l_j$，输出按相同权重合并。只拼接各块独立 softmax 的结果会改变概率分布。

验证 chunked prefill 应同时检查数值和服务行为。选取覆盖块边界、超长前缀、不同 mask 与多种 dtype 的固定 token 序列，对比分块和整段执行的 logits、首 token 与 KV 内容；容差按累加精度设定，不能只比最终生成文本，因为采样可能掩盖小的 logits 偏差。性能侧记录每块的 prefix length、chunk size、设备时间、decode 插入间隔和调度空档。总 prefill 时间变长但 TPOT 达标可能是预期交换；logits 超出容差则属于正确性失败，不能用吞吐收益抵消。

**PD 分离的队列模型。**

Prefill 池服务率用 input token/s 更合适，Decode 池用 output token/s 和 KV 容量描述。若平均请求输入 $S_p$、输出 $S_o$，到达率 $\lambda$ 请求/s，两池需求分别约为 $\lambda S_p$ input token/s 和 $\lambda S_o$ output token/s。任一池利用率接近 1，队列都会快速上升。

池间还有在途 KV。假设 prefill 每秒完成 20 个请求，每请求平均 256 MiB KV，decode 接收/释放存在 0.5 s 交接窗口，中转平均至少承载约 $20\times0.5\times256=2560$ MiB；峰值由到达突发与传输尾延迟决定。没有在途上限时，decode 拥塞会把压力倒灌到 prefill 内存。

传输可按层流水：Prefill 完成第若干层就发送，对整个 prompt 完成后目标已有部分 KV。但同一模型前向层间依赖意味着上游产生节奏与网络并发需谨慎；传输还可能争用 TP/服务网络。衡量的是交接完成时间和 prefill kernel 是否被拖慢，不是单独链路吞吐。

容量规划可从守恒关系开始。设 prefill 池有 $n_p$ 个副本，每副本有效吞吐 $r_p$ input token/s；decode 池有 $n_d$ 个副本，每副本有效吞吐 $r_d$ output token/s。稳定运行至少满足 $n_pr_p>\lambda E[S_p]$ 与 $n_dr_d>\lambda E[S_o]$，但均值只保证长期工作量不发散，不能保证尾延迟。prompt/output 的长尾、到达突发、失败重试和副本维护都会要求额外余量。实际规划应从 trace 重放得到各池队列的 p95/p99，并在拿掉一个副本后仍检查目标 SLO。

KV 交接还受带宽与目标显存双重约束。若请求 $i$ 的 KV 大小为 $M_i$，链路有效吞吐为 $B_n$，并发传输集合为 $\mathcal C$，理想传输下界至少为 $\sum_{i\in\mathcal C}M_i/B_n$；若不同流共享 NIC，单请求时间不能继续使用独占带宽。目标 decode worker 在接收前要预留完整容量或明确的分段额度，否则传到一半才发现空间不足会浪费链路并延长源端持有时间。源与目标同时保留 KV 的交接窗口还会使集群瞬时占用增加，容量模型应把这部分双份驻留单列。

一种可验证的协议是先由目标返回 reservation id 和可接收的块清单，源按层或页发送并附带模型版本、adapter、token 范围、dtype 与校验信息；目标全部校验后提交所有权，源收到确认才释放。超时发生在提交前，目标清理未提交块，源继续服务或选择其他目标；提交确认丢失时，通过 transfer id 查询状态，不能让两端同时认为对方持有唯一副本。这个边界会增加少量控制消息，却能避免压力场景下出现悬空 KV 或重复释放。

**多卡 Decode 的通信下界。**

TP decode 在每层常有两次 activation collective。设完整 activation 为 $B_aH w$ byte，ring all-reduce 每 rank 算法流量约 $2(p_t-1)B_aHw/p_t$。消息往往只有数百 KiB 到数 MiB，固定延迟显著；80 层乘 160 次 collective，单次多 5 µs 就累计 0.8 ms。

以 $B_a=64,H=8192,w=2,p_t=8$，完整 activation 为 1 MiB，ring 每 rank 流量约 1.75 MiB。若单次 20 µs、每层两次、80 层，通信串行量为 3.2 ms。目标 TPOT 若 20 ms，这已占 16%。增加 TP 降低每卡权重读取，却可能增加 collective 延迟，存在最优点。

这里的 20 µs 必须对应相同消息大小、rank 数和拓扑。用大消息带宽基准估计 1 MiB collective 会忽略启动延迟；用单机 NVLink 结果推断跨节点 TP 又会忽略 NIC 与交换层。常用近似为 $T_{coll}=\alpha R+Q/B_{eff}$，$R$ 是算法轮数，$\alpha$ 是每轮固定成本，$Q$ 是每 rank 算法字节。小 decode activation 中第一项可能占主导，因此把 TP 从 4 增到 8 即使每卡权重减半，也可能因轮数、参与者和同步次数增加而变慢。

测量时同时记录各 rank 到达 collective 的时间。若 NCCL kernel 本身持续 20 µs，但最早 rank 等最晚 rank 另外花了 30 µs，优化网络只能影响前者。慢 rank 可能承担更长 KV、发生 page miss，或前一层 kernel 选择不同。把等待时间并入“通信耗时”会误导拓扑调整。对照实验可以固定相同长度、交换 rank 到 GPU 的映射，并运行同消息大小 collective 基准，从而分开到达偏差、链路能力和应用内争用。

Pipeline decode 的 stage 节拍由最慢 stage 决定。多个请求/token micro-batch 可填流水，但单请求 token $t+1$ 依赖 token $t$ 采样，不能无限并行。低并发追求单请求时延时，过多 PP stage 增加 hop；高并发可提高总吞吐。测试必须对应目标并发。

**从 Profile 到优化决策。**

一次迭代先分 CPU 调度、H2D/元数据、模型 kernel、collective、采样和输出。模型 kernel 再按线性、attention、normalization 分类。若 GPU 时间 15 ms、CPU gap 4 ms，优化 attention 10% 最多省 GPU 中对应占比，而 CUDA Graph/调度可能更直接。

对 Prefill 记录有效/padding token、每个 prompt 长度、chunk/prefix、GEMM 与 attention 时间；对 Decode 记录活动序列、上下文长度和 KV 字节。只保存 batch size 无法重现实验。跨版本比较使用同一请求集合或同一开环到达 trace。

优化顺序从瓶颈与目标出发：TTFT 排队高，先扩容量或调 batching；Prefill 设备高，分析 MLP/attention 与 padding；TPOT 随上下文升高，查 KV；小 batch 固定高，查权重带宽、launch 和 collective。每一步都能由前述公式给预期上限，再用实测判断差额。

**长度分布怎样改变容量。**

平均长度不能直接用于排队与 KV 容量。假设一半请求 prompt/output 为 512/128，四成是 4096/512，一成是 32768/2048。平均输入约 5529 token，但最长 10% 消耗的 prefill 与 KV 远超其请求占比；若调度只按平均预留，突发几个长请求就会挤满缓存。

容量模拟按 trace 推进时间：请求到达时加入 prompt，prefill 完成后占 $S_p$ KV，decode 每轮加一，完成后释放。记录 token 水位分位数与分配失败。对同样平均到达率，长度相关性和突发会显著改变峰值。真实规划使用 p99 水位和安全区，而不是平均并发×平均长度。

Prefill 池也受长尾支配。若所有请求 FCFS，一个 32K prompt 可阻塞多个 512 prompt；长度分桶或 chunking 改善短请求，长请求完成时间可能变差。按长度桶报告 TTFT 与 goodput，避免用大量短请求稀释长请求体验。

**采样与输出的成本。**

模型得到 logits 后还需 temperature、penalty、top-k/top-p、约束 mask 和随机采样。词表 128K、batch 很小时，读写 logits、排序/选择和多次 kernel launch 可占明显比例。若每请求采样参数不同，融合路径会分支或拆批。

Top-k 可用局部选择而非完整排序，top-p 需要累积概率到阈值；实现通常先取候选再精确处理。约束解码可能构造词表 mask，CPU 生成 mask 或 H2D 成为间隙。Profile 将 sampling 独立列出，不把它算进 decode attention。

输出 token 还需 detokenize、停止串检测与网络发送。UTF-8/byte token 的停止串可跨 token 边界；错误的提前停止或重复输出属于正确性问题。慢客户端形成 backpressure 时暂停该请求，防止输出队列无界增长。

**冷启动与稳定态。**

首个请求可能触发权重分页、kernel JIT、autotune、CUDA Graph 捕获和 cache 冷启动。稳定态 benchmark 先预热能测上限，但生产扩容关心从实例启动到可接流量的时间。两种指标分开报告。

权重 14 GB 从本地 SSD 20 GB/s 读取理论 0.7 s，从远端 2 GB/s 则 7 s，还要反序列化与 H2D。多副本同时启动会争用后端，使单副本微基准失效。节点缓存与分层分发减少惊群，但版本校验必须先完成。

预编译常见 shape 可缩短首请求，编译 cache 与 GPU 架构、驱动、编译器版本绑定。Cache miss 安全回退 eager，同时实例在后台准备；在 readiness 前完成关键 warmup，避免把真实用户当预热流量。

**可复现的基准清单。**

基准固定模型权重/量化、tokenizer、引擎版本、GPU/驱动、TP/PP、副本数、KV dtype/block、chunk、scheduler 与采样。请求集保存 token ids 或不可变生成规则，报告输入/输出长度直方图和到达模型。

低并发测固有 TTFT/TPOT，高并发 open-loop 扫到过载。设备指标给有效 input/output token/s、padding、HBM byte、主要 kernel 和 collective；服务指标给排队、TTFT、TPOT、E2E、拒绝与取消。成本按满足 SLO 的 token/request，而非峰值裸吞吐。

每次优化都先预测减少多少 FLOPs、byte、launch 或排队时间，以及理论最多能节省多少时间。实测若超出预测，寻找额外消除项；低于预测，查找争用与非目标占比。预测与实测的差额能阻止单个漂亮 kernel 数字替代系统结论。

微基准先使用设备 event 测量 kernel 或一组 kernel，预热到 JIT、autotune 和 cache 状态稳定，并在计时区间末尾同步。服务基准从客户端或网关记录到达、首 token、各 token 与完成时间，包含排队和网络。两类时间不能混用：设备 event 得到的 12 ms decode 轮次，无法直接证明客户端 TPOT 为 12 ms；客户端 40 ms TPOT 也不能说明 GPU kernel 花了 40 ms。二者通过同一 request/iteration id 与 trace span 对齐，差额才能分给调度、排队、输出和网络。

重复测量应保留分布。固定 shape 的 kernel 可报告中位数与 p95，并注明预热次数、重复次数、时钟和功耗；开放到达的服务测试报告每个长度桶的请求数、TTFT/TPOT 分位数、拒绝率和 goodput。若基线 TPOT 为 $30.0\pm0.4$ ms，新版本为 $29.8\pm0.5$ ms，这个差距不足以支撑上线判断。若预测会减少 5 ms 而实测几乎不变，应先验证目标 kernel 是否命中、实际 HBM byte 是否下降，以及收益是否被更小 batch 或新同步抵消。

失效边界也要进入基准矩阵。至少覆盖 batch=1 与高并发、短/中/长上下文、整齐与 ragged 长度、支持与不支持 CUDA Graph 的 shape、KV 接近水位、一个 rank 降速以及 PD 传输超时。优化只在 4K 等长 batch 上成立，可以作为受限快路径，但调度器必须识别条件并选择通用路径。若切换路径会改变容量或时延，监控应记录实际选择，避免把回退后的退化误判成随机抖动。

**失效边界与安全回退。**

Chunked prefill 遇到不支持的 mask/layout 时，回退整段或通用 ragged kernel；调度器据新预测缩小并发，不能沿用快路径预算。量化 decode 不支持某 head dimension 时回退高精度，提前确认额外 KV/权重容量可用。

PD 交接超时保留源端所有权，目标丢弃未提交 KV；源已释放而目标未确认是协议禁止状态。TP/PP 某 rank 失败，整个模型副本从路由移除，等待请求重派；已流式输出请求从最近确认的 token 重算，避免重复发送。

性能退化也需要自动回退。若 chunk 预测误差持续使 TPOT 超标，暂时收紧 prefill budget；若投机/量化让确认 token/s 下降，关闭该路径。回退条件带滞回和版本标记，避免每轮抖动。

**从公式到日常监控。**

将模型里的变量直接变成指标：$B,T,S,H,A_{kv}$ 来自批次 metadata，$Q_w,Q_{kv}$ 由配置估算并用 profiler 抽样校正，$T_{queue},T_{prefill},T_{decode},T_{comm},T_{sched}$ 来自 trace span。每次发布后比较同长度桶的系数，而不是只看总平均。

若 TPOT 随 $\sum S_i$ 线性上升且 HBM 接近上限，KV 模型成立；若有固定高截距，查权重、launch/collective；若离散跳变，查 kernel 阈值或 graph fallback。TTFT 随 prompt token 正常但排队非线性上升，则容量接近饱和。

监控保留少量可复算样本：完整 batch shape、阶段时间、所选 kernel/图、版本和预测值。这样异常可以离线重放，无需记录用户文本；同一组公式也用于持续检验线上系统行为。

**一个端到端决策例子。**

某服务 TTFT p99 目标 800 ms、TPOT p99 40 ms。Trace 显示长 prompt 请求排队 420 ms、prefill 300 ms，尚在目标内；decode 每轮 46 ms 超标，其中模型 kernel 35 ms、TP collective 6 ms、CPU gap 5 ms。继续优化 prefill 不会解决主要违约。

下界估算显示 decode 35 ms 中权重/KV HBM 下界约 28 ms，先尝试提高连续 batch 的权重摊销或量化；collective 6 ms 随层数累积，检查 TP degree 与节点内映射；CPU 5 ms 可用 graph/批量 metadata。若量化把模型段降至 27 ms，总计约 38 ms，才可能守住目标。

上线后若 TTFT 因吞吐提高降到 650 ms、TPOT p99 39 ms，收益符合预测；若 TPOT 仍 45 ms，按新时间线查量化反解码或 batch 变化，而不是宣称 kernel 微基准成功就结束。

容量、吞吐和延迟可以落到同一组数字上。假设单副本由 8 张 80 GiB GPU 组成，权重与运行时常驻每卡 28 GiB，预留 8 GiB 给临时 workspace、通信和波动，KV 可用空间约 44 GiB。若每个 4096 token 请求的 KV 在张量并行切分后每卡占 64 MiB，忽略碎片时可容纳约 704 个等长请求；采用 16-token block，平均尾块浪费 7.5 token，只会带来较小修正。但线上有 10% 请求达到 32K，上述请求数就失去意义。容量应直接按当前各请求已提交 token 求和，再乘每 token、每卡的 KV 字节，并加入预留但尚未写满的 block。

设目标到达率为 40 请求/s，平均输入 2048 token、输出 512 token，则整个服务每秒需要处理约 81,920 个 input token 和 20,480 个 output token。若单个 prefill 副本在满足 TTFT 的 batch 下稳定提供 30K input token/s，至少需要三个副本，利用率约 91%；这个余量很难吸收长 prompt 突发或副本维护。配置四个副本后名义利用率约 68%，排队尾部更安全。Decode 副本若各自只能在 TPOT 目标内提供 6K output token/s，同样需要四个副本。这里的副本数来自满足 SLO 的 goodput，不能用不受延迟约束的离线峰值替换。

请求从 prefill 池转入 decode 池时，输入 2048 token 对应的 KV 若全局为 256 MiB，40 请求/s 会产生约 10 GiB/s 的平均迁移载荷。双路 100 Gb/s 网络的线速约为 25 GB/s，但协议、拓扑共享和并发流使可持续吞吐低于线速；若实测只有 16 GB/s，平均载荷仍可承受，突发与尾延迟却需要队列和在途容量。假设某一分钟内到达率短暂翻倍，KV 产生速率接近 20 GiB/s，传输队列会增长。此时 admission 应根据在途 byte 和预计完成时间限流，避免 prefill 继续产出无法及时接管的 KV。

测量这套配置时，先用固定 token ids 的请求集建立低并发基线：记录每个 prompt 的有效 token、每层 prefill 时间、KV 生成字节和首 token 设备完成时间。再用开放到达 trace 扫描 20、30、40、50 请求/s，保持长度分布不变，记录各池队列、迁移在途量、TTFT/TPOT 与拒绝率。若 40 请求/s 时 prefill GPU 只有 65% 忙而 TTFT 队列已经上升，应检查凑批窗口、路由不均或 KV 交接反压；若 GPU 接近可持续上限且各副本队列同步增长，才说明确实需要容量。

优化后的复验使用完全相同的 token ids 和到达时间。权重量化若使 decode 模型段从 35 ms 降至 27 ms，但活动 batch 因吞吐提高从 32 增至 48，KV 读取也随之增加；最终 TPOT 可能只降到 39 ms。这不表示 8 ms 的 kernel 收益消失了，而是系统接受了更多并发工作。应同时报告每轮设备时间、每轮完成 token、上下文 token 总数和请求分位数。若只报告 TPOT，会忽略容量提高；若只报告 output token/s，又会忽略单请求已经接近 SLO 边缘。

公式的失效边界可以通过残差识别。预测时间 $T_{pred}$ 由计算、HBM、通信与固定开销组成，观测时间为 $T_{obs}$，残差 $R=T_{obs}-T_{pred}$。若 $R$ 随 batch 基本恒定，可能漏了 launch 或同步；随上下文 token 总数线性增长，可能低估 KV 流量或有效带宽；只在某些长度突增，通常对应 kernel 阈值、页表层级或 graph 回退；随并发上升呈非线性，则应检查排队和共享资源争用。残差模式用于提出下一项测量，不宜直接拟合成没有物理含义的多项式。

模型更新、adapter 切换和 KV dtype 变化都会让旧测量失效。权重版本改变层数、head 或词表后，FLOPs、KV 字节和采样成本需要重新计算；只换 kernel 或驱动，也要复测 $P_{shape}$、有效 HBM 带宽和 collective 延迟。线上监控给每个样本附上模型、引擎、kernel、量化与调度版本，异常发生时才能判断是负载变化还是执行路径变化。缺少这些版本字段的历史曲线只能说明「系统变慢了」，无法支持可复算的版本验证。

只有输入、预测、执行路径和观测值能够互相对应，性能结论才具有可迁移性。

## 参考资料

- [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135)
- [Orca: A Distributed Serving System for Transformer-Based Generative Models](https://www.usenix.org/conference/osdi22/presentation/yu)
- [DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving](https://arxiv.org/abs/2401.09670)
- [Sarathi-Serve: Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve](https://arxiv.org/abs/2403.02310)
- [vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention](https://arxiv.org/abs/2309.06180)
