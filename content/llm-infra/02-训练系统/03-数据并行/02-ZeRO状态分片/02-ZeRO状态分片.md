---
title: ZeRO 状态分片
description: 逐项计算参数、梯度与 Adam 状态，理解 ZeRO-1、2、3 的数据流和峰值
published: true
---
# ZeRO 状态分片

DDP 的每个 rank 都保存完整参数、梯度和 optimizer state。模型状态随数据并行规模保持不变，卡数增加只扩大 global batch 与计算吞吐。ZeRO 改变状态所有权：每份状态由数据并行组中的部分 rank 长期保存，需要消费时再规约、聚合或广播。

分片降低的是常驻 live set。参数参与矩阵乘时仍要以实现要求的形态出现，梯度更新前仍要汇聚全局信息，更新后的参数还要让下一次 forward 看见。因此 ZeRO 的每一级都要同时核算常驻字节、临时聚合峰值、collective 字节和等待位置。

![DDP、ZeRO 与 FSDP 的状态生命周期](../images/state-flow.svg)

*图 1：DDP、ZeRO-1/2 与全分片方案中，参数、梯度和优化器状态的常驻位置。作者绘制。*

## 1. 先拆开每参数字节数

设模型有 $\Psi$ 个可训练参数，计算参数为 BF16，梯度为 BF16；AdamW 使用 FP32 master parameter、first moment $m$ 和 second moment $v$。忽略 allocator 对齐、activation 与 workspace，每项为：

| 状态 | 每参数字节 | 总容量 |
| --- | ---: | ---: |
| BF16 计算参数 | 2 | $2\Psi$ |
| BF16 梯度 | 2 | $2\Psi$ |
| FP32 master parameter | 4 | $4\Psi$ |
| FP32 first moment | 4 | $4\Psi$ |
| FP32 second moment | 4 | $4\Psi$ |
| 合计 | 16 | $16\Psi$ |

“16 byte/parameter”只对这组假设成立。BF16 optimizer 省去 master copy、梯度使用 FP32、moment 量化、参数冻结或额外 EMA 都会改变账本。计算时应从实际 dtype 与 optimizer 实现重新列项。

取 $\Psi=7$B，完整模型状态为 112 GB，即约 104.3 GiB。这里尚未计 activation、通信 buffer、临时 unshard、CUDA context 和碎片；所以“两张 80 GB 卡的总容量超过 112 GB”不能直接推出配置可运行，状态必须按并行策略落到每张卡并加入峰值时间线。

## 2. ZeRO-1：只分 optimizer state

ZeRO-1 让每个 rank 长期保存完整 BF16 参数与完整梯度，FP32 master parameter、$m$、$v$ 按数据并行规模 $D$ 均分。每卡稳态模型状态近似为

$$
M_1=4\Psi+\frac{12\Psi}{D}\quad\text{byte}.
$$

式中的 $4\Psi$ 来自计算参数和梯度，$12\Psi/D$ 来自 master parameter 与两个 moment。对 7B、$D=8$，每卡约 $28+10.5=38.5$ GB，约 35.9 GiB。相较 DDP 的 112 GB，主要省掉了七份重复 optimizer state。

Backward 仍像 DDP 一样产生并规约完整梯度。更新阶段，每个 rank 只用自己负责的梯度片段更新本地 master parameter、$m$、$v$。更新后的低精度参数片段再通过 all-gather 或等价广播拼成每个 rank 的完整计算参数，供下一 step forward 使用。

若每 rank 更新的参数片段大小为 $2\Psi/D$ byte，参数同步的 ring all-gather 每 rank 发送量近似 $(D-1)2\Psi/D$。7B、$D=8$ 时约 12.25 GB/rank。梯度规约还保留 DDP 的 all-reduce 成本；因此 ZeRO-1 用参数同步换取 optimizer state 容量，并没有让通信自动减少。

## 3. ZeRO-2：梯度也归属于分片所有者

ZeRO-2 在 Stage 1 基础上分片梯度。Backward 生成的梯度通过 reduce-scatter 汇总，每个 rank 最终只保留自己负责参数的全局梯度分片。稳态模型状态近似为

$$
M_2=2\Psi+\frac{14\Psi}{D}\quad\text{byte},
$$

其中完整 BF16 参数占 $2\Psi$，梯度与三份 FP32 optimizer 相关状态共 $14\Psi/D$。7B、$D=8$ 时约 $14+12.25=26.25$ GB，约 24.4 GiB。

数据流是：forward 读取每卡完整参数；backward 按 bucket 产生梯度；reduce-scatter 在求和的同时把结果切给所有者；非所有者可以释放对应梯度；各 rank 更新本地参数分片；更新后的 BF16 参数分片 all-gather，恢复下一 step 所需的完整参数。

与“先 all-reduce 完整梯度、再丢掉七份”相比，reduce-scatter 避免完整全局梯度长期驻留。通信算法字节与 ring all-reduce 的 reduce-scatter 阶段相同，但后续不需要把梯度 all-gather 回所有 rank；真正需要 all-gather 的是更新后的参数。梯度峰值是否也接近 $2\Psi/D$，取决于实现能否在 bucket 规约后及时释放本地完整片段，以及梯度累积期间是否推迟 reduce-scatter。

## 4. ZeRO-3：参数在消费窗口内聚合

ZeRO-3 继续分片 BF16 参数，常驻模型状态理想值接近

$$
M_3=\frac{16\Psi}{D}\quad\text{byte}.
$$

7B、$D=8$ 的理想常驻量为 14 GB，约 13.0 GiB。但 forward 不能直接拿 $1/8$ 参数完成普通稠密矩阵乘。每个模块计算前必须 all-gather 该模块参数，形成完整逻辑视图；模块完成后按策略释放非本地分片。Backward 需要参数计算输入梯度和权重梯度，因此还会再次聚合，随后对梯度做 reduce-scatter。

设某 Transformer block 有 $\psi_l=200$M 参数，BF16 完整参数为 400 MB，本地分片仅 50 MB。若 forward prefetch 下一层，同时当前层计算结束但尚未 reshard，瞬时可能存在当前层 400 MB、下一层 400 MB 和其他常驻分片。峰值至少比理想 $16\Psi/D$ 多出约 800 MB，再加 all-gather buffer、alignment 与 allocator reserved。模块包裹过粗会抬高聚合峰值，包裹过细则增加 collective 次数与启动延迟。

## 5. 7B 模型在八卡上的横向账本

在相同 BF16+FP32 AdamW 假设下：

| 方案 | 每卡模型状态近似值 | 新增或保留的主要通信 |
| --- | ---: | --- |
| DDP | 112 GB | 梯度 all-reduce |
| ZeRO-1 | 38.5 GB | 梯度 all-reduce + 参数 all-gather |
| ZeRO-2 | 26.25 GB | 梯度 reduce-scatter + 参数 all-gather |
| ZeRO-3 | 14 GB 稳态下界 | 逐模块参数 all-gather + 梯度 reduce-scatter |

这张表只比较模型状态。若 micro-batch 的 activation 峰值为 30 GB，ZeRO-2 的总量已接近 56.25 GB，ZeRO-3 则要在约 44 GB 基础上叠加预取参数和通信 workspace。Stage 3 省下更多常驻状态，却把参数通信推进每个模块的关键路径；网络较慢、模块很碎或计算窗口太短时，节省的容量会转化为更高延迟。

## 6. Optimizer step 是一个有所有者的状态机

ZeRO 给参数空间建立稳定分区。参数 $\theta_j$ 的 owner 可以写成 $o(j)=j\bmod D$ 的抽象形式，真实实现通常按连续 flat buffer 切片以减少小对象和通信调用。Owner 长期保存对应 FP32 master、$m$、$v$；Stage 2/3 还保存全局梯度分片。其他 rank 只在计算需要时拥有低精度参数视图。

一次更新依次经历：所有相关梯度完成 reduce-scatter；overflow 检查与全局梯度范数获得一致结果；owner 对本地 master parameter 和 moments 执行 AdamW；master 转成目标计算 dtype；更新后的低精度分片进入参数同步。任何 rank 检测到 overflow 时，整个数据并行组都必须跳过这次更新和 scheduler step，否则参数版本会分叉。

Stage 1/2 通常在 optimizer step 后 all-gather 更新过的参数分片，使每个 rank 恢复完整计算参数。Stage 3 不必在更新后立即聚合整个模型；本地分片保持新版本，下一次某模块 forward 前才 all-gather 该模块。延迟聚合减少完整模型瞬时出现的机会，也要求参数版本边界清晰：一个模块的 collective 不能混入不同 step 的分片。

设 8 卡上某参数 flat buffer 为 8 GiB，每个 owner 更新 1 GiB。Ring all-gather 每 rank 发送约 $7/8\times8=7$ GiB，接收其余七份后形成 8 GiB 完整视图。若有效带宽 200 GB/s，仅带宽下界约 37.6 ms。Stage 3 将这 8 GiB 拆到模块窗口，算法总字节未必减少，但通信可以预取并与前一模块计算重叠，峰值也由整模型变为少数活跃模块。

## 7. 连续 buffer、bucket 与参数持久化

大量独立 parameter tensor 会造成 allocator 元数据、对齐碎片和许多小 collective。Contiguous gradients 把相同 dtype 的梯度写入连续 flat buffer，每个参数的 `.grad` 或内部主梯度成为其中一段视图。Reduce-scatter 可直接处理连续 bucket，规约完成后复用或释放该区间。

Bucket 大小同时影响 ready 时刻、启动次数和临时容量。若 gradient bucket 为 500 MiB，Stage 2 在规约前可能短暂保留完整 500 MiB，本地输出分片约 62.5 MiB；通信实现若另分配输入/输出 workspace，峰值还要加上对应 buffer。四个 bucket 并发在不同 stream 排队时，账本不能只写单 bucket 大小，需要记录最多同时在途的数量。

Stage 3 的 prefetch bucket 控制提前聚合多少下一模块参数。当前模块完整参数为 600 MiB，下一模块为 700 MiB，本地分片分别为 75 与 87.5 MiB。若前一模块尚未 reshard 时预取下一模块，额外完整参数峰值约 1.3 GiB，而非两个本地分片之和 162.5 MiB。Prefetch 过浅会让计算等待 all-gather，过深则重新制造容量压力。

较小参数可通过 persistence threshold 保持完整驻留，避免每层都为 bias、norm weight 等小张量发起 collective。假设一层有 200 个 8 KiB 小参数，逐个聚合会产生 200 次启动；合计仅 1.56 MiB，常驻副本代价很小。Threshold 太高则会让许多中等参数跨层驻留，理论 $16\Psi/D$ 下界不再成立。报告显存时必须给出 persistent 参数总量。

## 8. CPU 与 NVMe offload 把瓶颈移到另一条总线

Optimizer offload 把 master parameter、$m$、$v$ 放在 CPU 内存，GPU 保留计算参数与梯度分片。更新前，梯度分片通过 PCIe 传到 owner 的主机内存；CPU 完成更新，新的低精度参数分片再回到 GPU。若每卡负责 7B/8 参数，三份 FP32 optimizer 相关状态约 10.5 GB 常驻主机，GPU 可少占同等容量。

PCIe 5.0 x16 的理论单向带宽约 64 GB/s，实际可持续值取决于平台。若每 step 必须传出 1.75 GB BF16 梯度并传回 1.75 GB BF16 参数，按 50 GB/s 有效带宽计算，仅数据传输下界为 70 ms；FP32 传输或额外 master copy 会更高。Pinned memory、异步 copy 与 CPU update 可以重叠一部分，但同一 PCIe root 下的 NIC、NVMe 和 GPU 还会争用上行。

Parameter offload 进一步把计算参数分片移到 CPU，需要在模块 all-gather 前先做 host-to-device。一个 400 MB block 从 CPU 经 50 GB/s PCIe 搬到 GPU，下界约 8 ms；若该 block 计算只有 4 ms，单层计算不足以隐藏搬运，除非更早预取并为多个在途 block 预留 GPU buffer。

NVMe offload 在主机内存也不足时把状态落盘。设每卡 optimizer state 为 10.5 GB，NVMe 可持续顺序读写各 7 GB/s，单次完整读加写的裸下界已约 3 s。实际实现通过分块、CPU cache 和 pipeline 避免每 step 全量往返；若工作集超过 cache 或访问退化成小随机 I/O，训练会由存储而非 GPU 控制。NVMe 容量解决了“放不下”，并不保证 step 延迟可接受。

## 9. 峰值显存要加入在途状态

ZeRO-3 的峰值可写成

$$
M_{peak}\approx M_{shard}+M_{act}+M_{persist}+M_{current}+M_{prefetch}+M_{grad\_bucket}+M_{workspace}+M_{frag}.
$$

$M_{shard}$ 接近 $16\Psi/D$ 的常驻下界；$M_{current}$ 与 $M_{prefetch}$ 是当前和预取模块的完整参数；$M_{persist}$ 是未 reshard 的小参数；其余项随实现与时间变化。只用 $16\Psi/D$ 判断能否运行，会漏掉 Stage 3 最常见的 OOM 来源。

仍取 7B、8 卡：常驻分片 14 GB，activation 30 GB，persistent 参数 1 GB，当前/预取模块各 0.8 GB，梯度 bucket 0.5 GB，workspace 3 GB，碎片和安全余量 5 GB，峰值估算为 55.1 GB。若换成粗粒度 wrap，让当前与预取模块各 4 GB，峰值升到 61.5 GB；常驻分片完全没变，OOM 风险却明显不同。

## 10. 失败模式先看所有权和时间线

某 rank 在 reduce-scatter 后保留完整梯度，显存会逐 step 或逐 bucket 高于账本。对比规约前后 allocated tensor，并检查梯度累积期间是否推迟释放。某模块 all-gather 时间突然增长，则比较各 rank 进入时刻；一个 rank 的 CPU offload copy 晚到，会让其他 rank 的等待看起来像网络变慢。

参数 checksum 在 step 后不一致时，检查 overflow 决策、owner update 和参数同步版本。只有某些层不一致，通常指向 bucket/partition 映射、动态参数注册或 persistent 参数未刷新。全部参数相差固定比例，则更可能是梯度平均、loss scaling 或 world-size 除法错误。

Offload 配置吞吐低时，分别测 GPU↔CPU、CPU update、NVMe↔CPU 和 collective 的独立基准，再对齐 step 时间线。PCIe 已饱和时增加 prefetch 只会扩大队列与 pinned memory；CPU update 占主导时，需要检查 NUMA 绑定、线程数和向量化；NVMe 出现长尾时则核对 cache 命中与 I/O 大小。把所有等待统称为“ZeRO 开销”无法定位修改位置。

## 11. ZeRO-Infinity：把一个 tile 的旅程排成流水线

当 GPU 与主机内存都放不下完整状态时，ZeRO-Infinity 把参数、梯度和 optimizer state 分层放在 GPU、CPU 内存与 NVMe 中。核心单位不再是整个模型，而是一个可以独立搬运和更新的 tile。对第 $k$ 个 tile，一次 optimizer step 至少包含 NVMe 读取、CPU 解包或计算、CPU 到 GPU 搬运、GPU 计算、结果回写等阶段。流水线稳定后，总时间近似由最慢阶段决定：

$$
T_{tile}\approx \max(T_{nvme},T_{pcie},T_{compute}),
$$

流水填充和排空都占用时间，处理 $N$ 个 tile 的耗时满足

$$
T_{step}\ge T_{fill}+(N-1)\max(T_{nvme},T_{pcie},T_{compute})+T_{drain}.
$$

假设每个 tile 含 512 MiB 状态，NVMe 有效读取带宽为 7 GiB/s，PCIe 有效带宽为 50 GiB/s，相关计算用时 40 ms。单 tile 的读取约 71.4 ms，PCIe 搬运约 10 ms，计算 40 ms，稳定节拍被 NVMe 的 71.4 ms 限制。即使计算与 PCIe 完全重叠，32 个 tile 仍至少花费约 $32\times71.4=2285$ ms，再加流水填充、写回与同步。此时把 tile 从 512 MiB 增到 1 GiB 不会改变带宽下界，只会减少 I/O 请求次数并加大 pinned buffer；若小请求开销才是主因，它才可能提高吞吐。

分层 offload 通常准备双缓冲：GPU 计算 tile $k$ 时预取 $k+1$，同时把 $k-1$ 的结果向下层写回。双缓冲的代价也必须入账。512 MiB tile 若在 CPU 与 GPU 两侧各保留读、写两个 buffer，仅 staging 区就可能占用约 2 GiB CPU 内存与 1 GiB GPU 显存。预取距离继续增大，会把更多 tile 变成在途状态；只有当慢设备的长尾能因此被遮住时，这部分容量才值得。

流水线还需要反压：写回队列占满后，计算端必须停在仍有可回收 buffer 的边界，不能继续覆盖尚未落盘的 tile。假设准备四个 512 MiB CPU 写回槽，NVMe 持续写入只有 4 GiB/s，而每 50 ms 产生一个结果，生产速率约 10 GiB/s。队列容量 2 GiB 只能吸收约 $2/(10-4)=0.33$ 秒的差速，此后计算仍会等待存储。短时间 profiler 可能只看到队列增长，长时间稳态测试才会暴露真实吞吐。

## 12. 持久化阈值改变的是“小参数是否反复上车”

Stage 3 会为模块参数建立全量视图。LayerNorm、bias、门控标量等张量很小，逐个 all-gather 时，延迟成本往往大于传输成本。参数持久化阈值允许小于阈值的张量在使用后继续完整驻留，下一层或下一次迭代直接复用。它优化的是 collective 数量与小消息延迟，并不会免费增加带宽。

设模型有 4000 个 16 KiB 小参数，总量约 62.5 MiB。若每次 collective 固定启动延迟为 $8\ \mu s$，不做聚合或持久化时，仅启动时间就是 $4000\times8\ \mu s=32$ ms；实际传输 62.5 MiB 在 200 GiB/s 下只需约 0.31 ms。把它们完整持久化到每个 rank，八卡相对理想分片额外占用约

$$
62.5\times\left(1-\frac18\right)=54.7\ \text{MiB/rank},
$$

却可消掉大量小 collective。若阈值扩大到把 200 个 8 MiB 的投影矩阵也纳入持久化，额外副本立刻增加约 1.37 GiB/rank。调参时应画“被持久化总字节—collective 次数”曲线，在拐点附近选值，而不是只抄框架默认值。

模块粒度也会影响这个判断。若一个 block 被整体 wrap，其中的小参数可并入同一个扁平分区和大 collective；若每个子层独立 wrap，同样的参数可能形成更多 gather 边界。观察 profiler 中小消息数量后，应先确认 wrap 与 flat buffer 是否合理，再提高持久化阈值。

## 13. 初始化、保存与加载都可能越过 gather 边界

Stage 3 训练时没有任何 rank 长期拥有完整模型，初始化也不能默认先在每张 GPU 上构造全量权重再切分。以 70B BF16 参数为例，仅计算参数就约 140 GB；如果八张 80 GB GPU 各自先实例化完整模型，切分动作发生前已经 OOM。分片初始化应在参数创建时就决定 owner，只为本地分片分配真实存储；非本地参数使用占位元数据，随后按确定性规则生成或从 checkpoint 读取对应范围。

随机初始化还要保证并行布局改变后语义明确。若每个 rank 用相同种子独立生成“自己的顺序”，改变 world size 会改变参数与随机数流的对应关系。更稳妥的做法是按全局参数名与区间确定随机流，或者只在一个逻辑完整视图上初始化后立即 scatter。可以用小模型验证：相同 seed 下，单卡参数与八卡分片重新 gather 后逐元素一致；若只保证分布相同而不保证位级一致，也要在复现实验说明中写清楚。

保存 checkpoint 有两种边界。完整 checkpoint 先 gather 全模型再由指定 rank 写出，格式简单，却会在保存瞬间制造至少 $2\Psi$ 字节的 BF16 聚合峰值；70B 即约 140 GB，单卡无法承受。分片 checkpoint 让每个 rank 写本地 shard，并附上全局形状、dtype、分区范围、参数名映射和 world size。它避免全量聚合，但加载到不同 world size 时必须 reshard。

例如旧 checkpoint 用 8 份保存，每份 17.5 GB BF16 参数；恢复到 16 卡时，目标分片是 8.75 GB。若简单让前八个 rank 各读一份再点对点拆半，读盘与网络会集中在八个 rank；若所有 rank 按全局 offset 直接读取自己需要的区间，文件系统必须支持高并发范围读取。两种方案参数字节相同，I/O 拓扑不同。optimizer state 还要同步重分区，遗漏 step 计数、loss scaler 或 scheduler 状态会让“参数成功加载”的训练在下一步发生语义漂移。

保存前临时 gather 的上下文必须覆盖真正访问完整权重的语句。只在创建 state dict 时 gather、离开上下文后才序列化，引用可能已经重新变成 shard 或释放。反过来，把整个评估与保存过程放在 gather 区域，又会让完整参数停留太久。检查峰值时要在进入、生成 state dict、写盘和退出四个位置分别记录 allocated 与 reserved memory。

## 14. 与张量并行组合时，先写清两个通信组

ZeRO 沿数据并行维度分片状态，tensor parallel（TP）沿算子维度分割矩阵。若总 GPU 数为 $W=D\times T$，数据并行组大小为 $D$，张量并行组大小为 $T$。一个参数已经被 TP 切成 $1/T$ 后，ZeRO 再在对应的数据并行组内切成 $1/D$；理想常驻模型状态仍约为 $16\Psi/(DT)$，但 TP 与 ZeRO 的 collective 发生在不同通信组，不能把 world size $W$ 直接代入每次通信公式。

以 64 卡训练 70B 为例，取 $T=8,D=8$。每个 TP rank 的逻辑参数量为 8.75B，Stage 3 常驻模型状态下界约

$$
\frac{16\times70\text{B}}{8\times8}=17.5\ \text{GB/rank}.
$$

若某层原始 BF16 权重为 2 GiB，TP 后每个 rank 负责 256 MiB；ZeRO all-gather 在八卡 DP 组内恢复的是这份 256 MiB TP shard，而不是原始 2 GiB 矩阵。ring all-gather 每 rank 发送约 $7/8\times256=224$ MiB。随后该层的 TP all-reduce 或 reduce-scatter 仍在八卡 TP 组中发生。若 DP 与 TP 都跨越低带宽链路，两套通信会相互争用；常见拓扑安排是让高频 TP 通信留在单机高速互联内，让 DP/ZeRO 跨节点。

参数 owner 必须由“TP 坐标、DP 坐标、参数区间”共同确定。仅按全局 rank 取模，在并行度变化或进程映射变化后可能把 shard 配给错误的 TP 切片。诊断时给每个通信事件标注 group id，并验证 DP collective 的参与者拥有相同 TP 坐标、TP collective 的参与者拥有相同 DP 坐标；否则 collective 即使形状碰巧一致，也可能安静地产生错误结果。

## 15. 语义单测要证明“省内存没有改训练”

最小测试使用两层 MLP、小词表和固定 batch，分别运行单卡基线、DDP、ZeRO-1/2/3。关闭 dropout 或固定其随机流，使用相同初始参数与 loss scaling。每一步比较 loss、完整 gather 后的参数、梯度范数以及 optimizer 的 $m,v$。BF16 下不宜要求所有值位级相同，可为参数和 loss 设绝对、相对误差，并单独检查 NaN/Inf 与更新是否跳过。

一项关键不变量是数据并行平均语义。设两卡局部梯度为 $g_0,g_1$，基线使用合并 batch 时梯度应为 $(g_0+g_1)/2$。测试可故意令两张卡看到不同样本，手工计算一层线性模型的梯度，再检查 reduce-scatter 后 owner shard 是否等于全局平均对应区间。若得到 $g_0+g_1$，学习率语义会随 DP size 改变；若又在 optimizer 前除一次 $D$，梯度会缩小为正确值的 $1/D$。

还应覆盖梯度累积、overflow 和未使用参数。连续两个 micro-batch 的 ZeRO 更新应与等价大 batch 基线一致；只让一个 rank 制造 Inf，所有 rank 都必须跳过同一 optimizer step；条件分支令部分参数本步未使用时，各 rank 的 collective 次序仍要一致。checkpoint 回归则训练三步、保存、换 world size 加载，再运行第四步，与不中断基线比较。这样能同时发现分区映射、step 状态与随机数恢复错误。

## 16. 一套端到端容量与带宽复算

考虑 70B、BF16 参数与梯度、FP32 AdamW，64 张 80 GB GPU，$T=8,D=8$，使用 ZeRO-3。常驻模型状态下界为 17.5 GB/rank。再假设 activation 28 GB、当前 TP shard 的完整模块参数 2 GB、预取模块 2 GB、gradient bucket 1 GB、workspace 5 GB、碎片与安全余量 8 GB，峰值约

$$
17.5+28+2+2+1+5+8=63.5\ \text{GB/rank}.
$$

容量上可以进入 80 GB，但只剩 16.5 GB 余量；若 activation 因序列长度翻倍到 50 GB，Stage 3 本身不会挽救 OOM，需要 activation checkpoint、减小 micro-batch 或 sequence parallel。

再看一层 2 GB 原始权重。TP=8 后，每个 DP 组聚合 250 MB。八卡 ring all-gather 每 rank 发送约 218.75 MB。若跨节点有效带宽为 25 GB/s，纯带宽下界约 8.75 ms；该层计算为 12 ms，则及时 prefetch 理论上可以遮住大部分通信。若网络拥塞后只有 10 GB/s，下界升至 21.9 ms，至少约 9.9 ms 暴露在关键路径。模型有 80 层且每层都出现同样缺口，仅 forward 就可能多出约 0.79 s，backward 再聚合与规约还会继续增加。

如果改用 CPU parameter offload，每层还需把 250 MB TP shard 经 PCIe 搬到 GPU。50 GB/s 下约 5 ms，与 DP all-gather 串行时总准备时间接近 13.75 ms，已经略高于 12 ms 计算；用双缓冲让 PCIe 与网络流水重叠后，下界取二者最大值，约 8.75 ms，但会多占至少两个 250 MB staging buffer。这个例子说明方案评估必须同时写容量、链路与 overlap 窗口：显存低于 80 GB 只证明可能运行，不能证明训练吞吐可接受。

## 17. 官方实现中的术语对应

| 本文概念 | 官方资料中的对应项 | 核对时关注什么 |
| --- | --- | --- |
| optimizer state 分片 | ZeRO Stage 1 / DeepSpeed distributed optimizer | master weight 与 moments 的 owner、更新后参数同步 |
| 梯度分片 | ZeRO Stage 2、reduce-scatter | 是否保留完整梯度、平均因子放在哪一步 |
| 参数按需聚合 | ZeRO Stage 3、FSDP all-gather/reshard | forward 与 backward 的 gather 次数、释放边界 |
| 小参数常驻 | `param_persistence_threshold` | 常驻总字节与小 collective 数量 |
| 预取窗口 | prefetch bucket、forward/backward prefetch | 当前与下一模块同时存活的峰值 |
| CPU/NVMe 分层 | ZeRO-Offload、ZeRO-Infinity | pinned buffer、tile 大小、PCIe 与存储节拍 |
| 分片 checkpoint | distributed checkpoint / sharded state dict | 元数据、不同 world size 的 reshard 与 optimizer 状态 |

术语相同不代表默认行为相同。框架版本可能改变 bucket 默认值、是否保留原始参数、checkpoint 格式与预取方向。落地时应把实际配置、框架版本和 profiler 事件写进实验记录，再用本文公式复算数量级；公式负责暴露不可能的结果，运行时记录负责解释剩余差异。

## 参考资料

- [ZeRO: Memory Optimizations Toward Training Trillion Parameter Models](https://arxiv.org/abs/1910.02054)
- [DeepSpeed ZeRO documentation](https://deepspeed.readthedocs.io/en/latest/zero3.html)
- [DeepSpeed ZeRO-Offload](https://www.deepspeed.ai/tutorials/zero-offload/)
- [Megatron Core Distributed Optimizer](https://docs.nvidia.com/megatron-core/developer-guide/latest/api-guide/dist_optimizer.html)
- [ZeRO-Infinity: Breaking the GPU Memory Wall for Extreme Scale Deep Learning](https://arxiv.org/abs/2104.07857)
- [PyTorch FullyShardedDataParallel](https://pytorch.org/docs/stable/fsdp.html)
- [PyTorch Distributed Checkpoint](https://pytorch.org/docs/stable/distributed.checkpoint.html)
