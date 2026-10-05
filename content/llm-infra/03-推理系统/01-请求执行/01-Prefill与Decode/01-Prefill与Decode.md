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

## 3. Decode 的带宽模型

Decode 对每个活动请求只生成一个 token。以参数权重 $M_w$ byte、batch $B_a$ 粗略估算，若一轮近似读一遍权重，平均每 token 权重流量约 $M_w/B_a$。14 GB BF16 权重在 2 TB/s 理想 HBM 带宽下，仅权重读取下界为 7 ms/轮；batch=1 时约 143 token/s，batch=32 时同一轮产 32 token，聚合吞吐提高，但每请求 token 间隔仍受 7 ms 加其他成本约束。

实际 decode 还读 KV。单层单请求已有长度 $S_c$ 时，K/V 流量约 $2S_cA_{kv}Dw_{kv}$；全模型乘 $L$。随着上下文增长，每轮时间可能上升。GQA/MQA 减少 $A_{kv}$，直接减少 KV 容量与流量；但权重、MLP 和调度仍在，端到端不会同比缩短。

### 3.1. 一个 KV 流量算例

取 $L=32,A_{kv}=8,D=128,S_c=4096,w_{kv}=2$，单请求本轮读取约

$$
2\times32\times4096\times8\times128\times2=536{,}870{,}912\ \text{byte},
$$

即 512 MiB。2 TB/s 下理想下界约 0.268 ms。batch=32 时有效 KV 约 16 GiB/轮，若长度相同、没有 cache 重用，理想带宽项约 8.6 ms。此时权重被 batch 摊薄，KV 可能接管瓶颈。

线上长度不同，paged attention 要根据每请求页表读取不同 block。最长序列不一定决定全部计算，kernel 可以按实际长度处理；但 batch 内工作分配不均、地址离散和 split-KV 归约会增加成本。只用平均上下文估算容易低估长尾。

### 3.2. 为什么 Decode kernel 不能照搬 Prefill

Prefill 有二维 Q tile，可让 K/V tile 被许多 query 复用；decode 每序列只有一个 query，并行度来自 batch、head 和沿 KV 的切分。上下文长而 batch 小时，单个 head 可沿 KV 分给多个 block，分别维护局部 softmax 状态，最后合并。拆分太多会增加中间写回与归约，所以阈值随长度和 batch 变化。

线性层同样需要针对窄 $M$。训练/Prefill 常用的 GEMM tile 在 $M=1$ 时大量空闲。持续 batching 把多个序列合成矩阵可改善，但请求数不足时，专用 GEMV、小矩阵 kernel 与权重量化更重要。

## 4. 同卡混合调度的矛盾

若引擎等待整个 prefill 完成再 decode，长 prompt 会造成已有流式请求 ITL 尖峰。若每轮只 decode，新的 prompt 无法进入系统。Chunked prefill 允许每轮先安排 decode token，再用剩余 token budget 放若干 prefill 块，实现 iteration-level scheduling。

设一轮目标最长 20 ms，当前 decode batch 预计 8 ms，可给 prefill 约 12 ms 预算。实际 kernel 时间受 shape 非线性影响，不能简单按 token 比例切。调度器需要从历史 profile 或在线模型估计不同长度块的时间，并为误差留余量。

混合批次还可能让算子 shape 复杂。某些引擎把 prefill 与 decode 分开执行但置于同一轮，减少 kernel 分支；另一些使用统一 ragged attention。前者有额外 launch，后者内核更难优化。比较应看整轮时间、decode deadline 和有效 token，不只看单个 attention kernel。

### 4.1. 抢占与重算

显存不足时，新高优先级请求可能抢占旧请求。若丢弃旧请求 KV，恢复时要重新 prefill 已生成上下文；换出到 CPU 则支付 D2H/H2D。对短上下文，重算可能比换出快；长上下文更适合保留或迁移。决策可比较预计重算 FLOPs/时间与 KV 字节/传输时间，同时考虑 CPU 缓冲是否有空间。

抢占需要公平性。总让短请求插队会饿死长请求；可按等待时间提升优先级，限制每租户在途 KV，或为不同 SLO 保留配额。吞吐最优策略未必满足任何一个租户的 p99。

### 4.2. PD 分离：让两种 shape 去不同设备池

Prefill/Decode 分离为两阶段独立批处理和扩缩容。Prefill 池偏好高计算能力和大 token batch，Decode 池偏好高带宽与足够 KV 容量。请求完成 prefill 后，将每层 KV 传给选定 decode worker，再开始流式生成。

迁移字节就是该请求 KV 容量。前述 4096 token 配置约 512 MiB；若希望额外迁移不超过 20 ms，有效带宽至少约 25.6 GiB/s，尚未计协议和排队。多请求并发会共享 NIC。若 KV 传输在首 token 后进行会破坏 decode 连续性，通常要在交接前完成或分层流水。

分离减少不同阶段互相阻塞，却新增跨池路由、KV 生命周期、一致性和故障恢复。Decode worker 接收一半失败时，源端何时释放？模型/adapter 版本不同能否接收？目标显存不足怎么办？协议必须用 transfer id 和 manifest 描述层/块完成状态，直到目标确认接管后才释放源引用。

## 6. 多设备执行与测量

TP 将权重和计算切到多卡，但每层引入 collective。Prefill GEMM 大，通信较容易被计算摊薄；decode 小消息和逐层同步更敏感。增加 TP 可降低单卡权重流量、缩短计算，却可能让 collective latency 接管。测试应扫实际 batch/context，不可用训练 shape 推断。

PP 在推理中让 token 依次经过 stage。Prefill 可用 micro-batch 流水，Decode 的逐 token 依赖限制单请求并行，但多个请求可填流水。stage 不平衡决定节拍。对于低延迟服务，更多 PP stage 也增加逐 token 跳数和网络依赖。

副本并行避免单请求 collective，但每副本复制权重。低并发时单副本小 TP 可能更省延迟；高吞吐时多个副本有更好故障隔离。容量规划同时考虑每副本最小并行度、请求分布和可容纳 KV。

### 6.1. 指标与实验口径

离线吞吐测试固定一组 prompt/output 长度，将所有请求预先就绪，适合看引擎上限。在线测试按到达过程发送请求，适合看排队和 SLO。二者都要报告硬件、模型/量化、并行度、输入输出长度分布、并发和采样设置。

Prefill 吞吐用 input token/s，Decode 用 output token/s；若给总 token/s，需同时给两者比例。延迟至少报告 TTFT、TPOT/ITL 与端到端，并按长度桶分组。平均值可能被大量短请求主导，p99 也可能只是最长请求；分组后才能判断是系统抖动还是工作量差异。

设备 profile 将一次迭代拆成线性层、attention、collective、采样和空档。若 kernel 总时间远小于迭代时间，检查 CPU 调度、同步和 graph break；若 HBM 接近持续上限，优先减少字节或增大 batch；若 Tensor Core 利用低且矩阵很窄，检查 shape 与并行度。

### 6.2. 选择优化的顺序

先决定业务目标：TTFT、TPOT、吞吐和成本的约束。然后用真实负载建立长度与到达分布，测出 prefill/decode 各自占比。第三步检查 KV 是否限制并发，确定分页、GQA/量化或换出需求。最后才在 kernel、调度和集群拓扑之间选择改动。

常见误区是把所有问题归给 attention。小 batch decode 可能主要读 MLP 权重；短 prompt prefill 可能由投影主导；高并发服务可能卡在队列和 KV 容量。一个优化改变 attention 2 倍，若它只占端到端 20%，总收益上限也有限。

**Prefill 和 Decode 的 shape 与状态生命周期不同，内核和调度约束也随之改变。** 从 $[B,T,H]$、权重字节与 KV 长度出发，可以继续推导内核选择、批处理和资源池设计。

### 6.3. 一层计算量的完整展开

以 decoder-only Transformer 为例，忽略 bias。Q 投影为 $2BTH^2$ FLOP；若 GQA 的 K/V 输出维度各为 $H_{kv}=A_{kv}D$，K/V 合计 $4BTHH_{kv}$；输出投影为 $2BTH^2$。SwiGLU 有两个 $H\to H_f$ 上投影和一个 $H_f\to H$ 下投影，矩阵乘合计约 $6BTHH_f$ FLOP。

Prefill self-attention 的 QK 与 PV 合计约 $4BT^2H$ FLOP（GQA 不改变 query head 的 score/output 主量级）。于是单层主项可写成

$$
F_{layer}\approx 4BTH^2+4BTHH_{kv}+6BTHH_f+4BT^2H.
$$

取 $B=1,T=4096,H=4096,H_f=11008,A=32,A_{kv}=8,D=128$。四类主项约为：Q/O 投影 274.9 GFLOP，K/V 68.7 GFLOP，MLP 1108.4 GFLOP，attention 两次矩阵乘 274.9 GFLOP，合计约 1.73 TFLOP/层。32 层约 55.3 TFLOP。这个例子中即便序列为 4096，MLP 仍是大主项；只优化 attention 不能等比例优化 prefill。

当 $T$ 增至 32768，线性项乘 8，attention 二次项乘 64，attention 占比显著上升。交叉点可从 $4T^2H$ 与线性层系数比较。不同 $H,H_f,GQA$ 配置交叉点不同，所以「长上下文一定 attention 主导」需要具体数字。

### 6.4. Decode 的权重与 KV Roofline

Decode 每层每请求 $T=1$。线性层 FLOPs 仍可由上式去掉 attention 的 $T^2$，但矩阵行数等于活动请求数。权重最少读取量近似是该层参数字节，KV 读取量为 $2BS_cA_{kv}Dw_{kv}$。对整模型，下界近似

$$
T_{decode}\ge \max\left(\frac{F}{P_{shape}},\frac{Q_w+Q_{kv}}{B_{HBM}}\right)+T_{comm}+T_{launch}.
$$

$P_{shape}$ 是小矩阵可持续算力，不是规格峰值；$Q_w$ 是否每轮完整从 HBM 读，取决于 cache 和模型大小，但大模型通常远超 L2。权重量化把 $Q_w$ 降低，KV 量化把随上下文增长的 $Q_{kv}$ 降低，两者适用区间不同。

取 7B 模型 BF16 权重约 14 GB，KV 配置仍为 32 层、8 KV head、128 维。batch=1、上下文 4096 时，权重约 14 GB，KV 约 0.5 GB，权重占主；batch=32 时，权重仍约 14 GB，KV 有效读取约 16 GB，KV 已可超过权重。连续 batching 提高权重摊销，却让 KV 成为下一瓶颈。

如果权重做 INT4 后含元数据约 4 GB，batch=1 明显受益；batch=32、长上下文下，KV 不变时总字节从约 30 GB 降到 20 GB，理论加速只有 1.5 倍而非 3.5 倍。再加反量化和通信，端到端更低。这就是工作量与资源模型比「位宽降低四倍」更可靠的原因。

### 6.5. Chunked Prefill 的等价性与成本

将长度 $S$ 分成块 $C_1,\ldots,C_n$。第 $i$ 块 query 需要 attend 到此前 $P_i=\sum_{j<i}C_j$ 个 KV 和块内 causal KV。若使用精确 attention、位置和 mask 一致，逐块输出应与整段 prefill 对应位置一致；数值归约顺序不同可能有小误差。

总 attention 算术量没有因切块消失：跨块矩形项加块内三角项合计仍与整段 causal attention 同阶。切块的系统收益是限制单轮执行时间、减少瞬时 workspace，并让 decode 插队；代价是更多 kernel/调度、页表访问，以及较小 tile 的效率下降。

假设 8192 token prompt 整段执行 160 ms，会令目标 TPOT 30 ms 的 decode 严重超时。切为 16 个 512-token 块，每块设备时间 13 ms（总计 208 ms），prefill 总工作反而慢 30%；若每块间插入 8 ms decode，一直在线的请求却能维持约 21 ms 间隔。吞吐与交互时延发生交换，不能只比较 prompt 完成时间。

块调度还要保留 KV。第 10 块开始前已有 4608 token，attention 读取量大于第 1 块。固定 512 token 的执行时间并不恒定；预测模型至少使用 chunk size 与 prefix length 两个变量。长前缀下可缩小块以守 deadline，或由 profile 选离散档位。

### 6.6. PD 分离的队列模型

Prefill 池服务率用 input token/s 更合适，Decode 池用 output token/s 和 KV 容量描述。若平均请求输入 $S_p$、输出 $S_o$，到达率 $\lambda$ 请求/s，两池需求分别约为 $\lambda S_p$ input token/s 和 $\lambda S_o$ output token/s。任一池利用率接近 1，队列都会快速上升。

池间还有在途 KV。假设 prefill 每秒完成 20 个请求，每请求平均 256 MiB KV，decode 接收/释放存在 0.5 s 交接窗口，中转平均至少承载约 $20\times0.5\times256=2560$ MiB；峰值由到达突发与传输尾延迟决定。没有在途上限时，decode 拥塞会把压力倒灌到 prefill 内存。

传输可按层流水：Prefill 完成第若干层就发送，对整个 prompt 完成后目标已有部分 KV。但同一模型前向层间依赖意味着上游产生节奏与网络并发需谨慎；传输还可能争用 TP/服务网络。衡量的是交接完成时间和 prefill kernel 是否被拖慢，不是单独链路吞吐。

### 6.7. 多卡 Decode 的通信下界

TP decode 在每层常有两次 activation collective。设完整 activation 为 $B_aH w$ byte，ring all-reduce 每 rank 算法流量约 $2(p_t-1)B_aHw/p_t$。消息往往只有数百 KiB 到数 MiB，固定延迟显著；80 层乘 160 次 collective，单次多 5 µs 就累计 0.8 ms。

以 $B_a=64,H=8192,w=2,p_t=8$，完整 activation 为 1 MiB，ring 每 rank 流量约 1.75 MiB。若单次 20 µs、每层两次、80 层，通信串行量为 3.2 ms。目标 TPOT 若 20 ms，这已占 16%。增加 TP 降低每卡权重读取，却可能增加 collective 延迟，存在最优点。

Pipeline decode 的 stage 节拍由最慢 stage 决定。多个请求/token micro-batch 可填流水，但单请求 token $t+1$ 依赖 token $t$ 采样，不能无限并行。低并发追求单请求时延时，过多 PP stage 增加 hop；高并发可提高总吞吐。测试必须对应目标并发。

### 6.8. 从 Profile 到优化决策

一次迭代先分 CPU 调度、H2D/元数据、模型 kernel、collective、采样和输出。模型 kernel 再按线性、attention、normalization 分类。若 GPU 时间 15 ms、CPU gap 4 ms，优化 attention 10% 最多省 GPU 中对应占比，而 CUDA Graph/调度可能更直接。

对 Prefill 记录有效/padding token、每个 prompt 长度、chunk/prefix、GEMM 与 attention 时间；对 Decode 记录活动序列、上下文长度和 KV 字节。只保存 batch size 无法重现实验。跨版本比较使用同一请求集合或同一开环到达 trace。

优化顺序从瓶颈与目标出发：TTFT 排队高，先扩容量或调 batching；Prefill 设备高，分析 MLP/attention 与 padding；TPOT 随上下文升高，查 KV；小 batch 固定高，查权重带宽、launch 和 collective。每一步都能由前述公式给预期上限，再用实测判断差额。

### 6.9. 长度分布怎样改变容量

平均长度不能直接用于排队与 KV 容量。假设一半请求 prompt/output 为 512/128，四成是 4096/512，一成是 32768/2048。平均输入约 5529 token，但最长 10% 消耗的 prefill 与 KV 远超其请求占比；若调度只按平均预留，突发几个长请求就会挤满缓存。

容量模拟按 trace 推进时间：请求到达时加入 prompt，prefill 完成后占 $S_p$ KV，decode 每轮加一，完成后释放。记录 token 水位分位数与分配失败。对同样平均到达率，长度相关性和突发会显著改变峰值。真实规划使用 p99 水位和安全区，而不是平均并发×平均长度。

Prefill 池也受长尾支配。若所有请求 FCFS，一个 32K prompt 可阻塞多个 512 prompt；长度分桶或 chunking 改善短请求，长请求完成时间可能变差。按长度桶报告 TTFT 与 goodput，避免用大量短请求稀释长请求体验。

### 6.10. 采样与输出并非零成本

模型得到 logits 后还需 temperature、penalty、top-k/top-p、约束 mask 和随机采样。词表 128K、batch 很小时，读写 logits、排序/选择和多次 kernel launch 可占明显比例。若每请求采样参数不同，融合路径会分支或拆批。

Top-k 可用局部选择而非完整排序，top-p 需要累积概率到阈值；实现通常先取候选再精确处理。约束解码可能构造词表 mask，CPU 生成 mask 或 H2D 成为间隙。Profile 将 sampling 独立列出，不把它算进 decode attention。

输出 token 还需 detokenize、停止串检测与网络发送。UTF-8/byte token 的停止串可跨 token 边界；错误的提前停止或重复输出属于正确性问题。慢客户端形成 backpressure 时暂停该请求，防止输出队列无界增长。

### 6.11. 冷启动与稳定态

首个请求可能触发权重分页、kernel JIT、autotune、CUDA Graph 捕获和 cache 冷启动。稳定态 benchmark 先预热能测上限，但生产扩容关心从实例启动到可接流量的时间。两种指标分开报告。

权重 14 GB 从本地 SSD 20 GB/s 读取理论 0.7 s，从远端 2 GB/s 则 7 s，还要反序列化与 H2D。多副本同时启动会争用后端，使单副本微基准失效。节点缓存与分层分发减少惊群，但版本校验必须先完成。

预编译常见 shape 可缩短首请求，编译 cache 与 GPU 架构、驱动、编译器版本绑定。Cache miss 安全回退 eager，同时实例在后台准备；在 readiness 前完成关键 warmup，避免把真实用户当预热流量。

### 6.12. 结果可复现的基准清单

基准固定模型权重/量化、tokenizer、引擎版本、GPU/驱动、TP/PP、副本数、KV dtype/block、chunk、scheduler 与采样。请求集保存 token ids 或不可变生成规则，报告输入/输出长度直方图和到达模型。

低并发测固有 TTFT/TPOT，高并发 open-loop 扫到过载。设备指标给有效 input/output token/s、padding、HBM byte、主要 kernel 和 collective；服务指标给排队、TTFT、TPOT、E2E、拒绝与取消。成本按满足 SLO 的 token/request，而非峰值裸吞吐。

每次优化写预测：减少多少 FLOPs/byte/launch/排队，理论最多省多少时间。实测若超出预测，寻找额外消除项；低于预测，找争用与非目标占比。这个闭环能阻止单个漂亮 kernel 数字替代系统结论。

### 6.13. 失效边界与安全回退

Chunked prefill 遇到不支持的 mask/layout 时，回退整段或通用 ragged kernel；调度器据新预测缩小并发，不能沿用快路径预算。量化 decode 不支持某 head dimension 时回退高精度，提前确认额外 KV/权重容量可用。

PD 交接超时保留源端所有权，目标丢弃未提交 KV；源已释放而目标未确认是协议禁止状态。TP/PP 某 rank 失败，整个模型副本从路由移除，等待请求重派；已流式输出请求从最后确认 token 重算，避免重复发送。

性能退化也需要自动回退。若 chunk 预测误差持续使 TPOT 超标，暂时收紧 prefill budget；若投机/量化让确认 token/s 下降，关闭该路径。回退条件带滞回和版本标记，避免每轮抖动。

### 6.14. 从公式到日常监控

将模型里的变量直接变成指标：$B,T,S,H,A_{kv}$ 来自批次 metadata，$Q_w,Q_{kv}$ 由配置估算并用 profiler 抽样校正，$T_{queue},T_{prefill},T_{decode},T_{comm},T_{sched}$ 来自 trace span。每次发布后比较同长度桶的系数，而不是只看总平均。

若 TPOT 随 $\sum S_i$ 线性上升且 HBM 接近上限，KV 模型成立；若有固定高截距，查权重、launch/collective；若离散跳变，查 kernel 阈值或 graph fallback。TTFT 随 prompt token 正常但排队非线性上升，则容量接近饱和。

监控保留少量可复算样本：完整 batch shape、阶段时间、所选 kernel/图、版本和预测值。这样异常可以离线重放，无需记录用户文本；同一组公式也用于持续检验线上系统行为。

### 6.15. 一个端到端决策例子

某服务 TTFT p99 目标 800 ms、TPOT p99 40 ms。Trace 显示长 prompt 请求排队 420 ms、prefill 300 ms，尚在目标内；decode 每轮 46 ms 超标，其中模型 kernel 35 ms、TP collective 6 ms、CPU gap 5 ms。继续优化 prefill 不会解决主要违约。

下界估算显示 decode 35 ms 中权重/KV HBM 下界约 28 ms，先尝试提高连续 batch 的权重摊销或量化；collective 6 ms 随层数累积，检查 TP degree 与节点内映射；CPU 5 ms 可用 graph/批量 metadata。若量化把模型段降至 27 ms，总计约 38 ms，才可能守住目标。

上线后若 TTFT 因吞吐提高降到 650 ms、TPOT p99 39 ms，收益符合预测；若 TPOT 仍 45 ms，按新时间线查量化反解码或 batch 变化，而不是宣称 kernel 微基准成功就结束。

## 参考资料

- [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135)
- [Orca: A Distributed Serving System for Transformer-Based Generative Models](https://www.usenix.org/conference/osdi22/presentation/yu)
- [DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving](https://arxiv.org/abs/2401.09670)
- [Sarathi-Serve: Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve](https://arxiv.org/abs/2403.02310)
- [vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention](https://arxiv.org/abs/2309.06180)
