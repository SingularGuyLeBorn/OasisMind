---
title: "DeepEP: 节点受限路由下的 MoE all-to-all, 从 NVLink/RDMA 转发到 IBGDA 与 hook 重叠"
category: "开源仓库"
tags: ["DeepSeek", "技术解析", "开源仓库", "MoE", "专家并行", "DeepEP"]
published: true
excerpt: "以代码为准拆解 DeepEP: 节点受限路由为什么能把跨节点流量压到四份以内, normal kernel 怎样先 RDMA 到同号卡再经 NVLink 分发, layout 与 notify 怎样算出每个 channel 的偏移, low-latency kernel 怎样用 IBGDA 与 recv hook 把传输阶段从 SM 上拿掉, README 里带宽与延迟数字的真实口径, 以及 V2.5 换成 NCCL Gin 之后的部署约束与昇腾版对比."
---

# DeepEP: 节点受限路由下的 MoE all-to-all, 从 NVLink/RDMA 转发到 IBGDA 与 hook 重叠

DeepEP 仓库 ([github.com/deepseek-ai/DeepEP](https://github.com/deepseek-ai/DeepEP)) 的首个提交 `ebfe47e` 日期为 2025-02-24, 项目在 DeepSeek 开源周第二天发布, 作者包括 Chenggang Zhao、Shangyan Zhou、Liyue Zhang 等, 采用 MIT 许可证. main 分支的 `93eb6eb` (2026-09-30) 对应 2026-09-29 发布的 V2.5 (提交 `def8651`); 仓库唯一的 tag 是 `v1.2.1` (2025-09-15). V2.5 删除了 V1 的全部代码与文档, normal kernel、low-latency kernel、IBGDA 与 hook 重叠则都属于 V1. 因此 V1 的机制对应提交 `567632d` (2026-02-03, V1 最后一个完整状态), V2 与 V2.5 对应 main 分支. 文档的逐段对照见同目录的 `deepep-bi.md`, 昇腾实现见 [DeepEP-Ascend](https://github.com/deepseek-ai/DeepEP-Ascend).

DeepEP 做的事情可以用一句话概括: 把 MoE 层里「按路由把 token 发给专家, 再把专家输出收回来求和」这一对 all-to-all (dispatch 与 combine) 写成专用 GPU kernel. 通用的 NCCL all-to-all 不知道一个 token 会被复制给多少个专家, 也不知道这些专家分布在哪些节点, 只能按 rank 两两交换缓冲区. DeepEP 的出发点是 DeepSeek-V3 的路由约束: 每个 token 最多去 4 个节点. 有了这个约束, 跨节点那一段的字节数有了上界, 节点内的 NVLink 又比网卡快约 3.2 倍, kernel 就可以按「先跨节点, 再节点内分发」的两级路径组织. 训练与 prefill 使用 normal kernel 追求吞吐, decode 使用 low-latency kernel 控制时延; 两者的数据路径和资源分配方式不同.

## 1. 它解决的瓶颈: 节点受限路由与非对称带宽

### 1.1. DeepSeek-V3 的 EP 形状与 all-to-all 负载

DeepSeek-V3 的 MoE 层有 1 个共享专家和 256 个路由专家, 每个 token 激活 8 个路由专家, hidden 为 7168 (模型结构见 [DeepSeek-V3 解析](../../01-模型技术报告/deepseek-v3/deepseek-v3-analysis.md)). 训练时 MoE 用 64 路专家并行, 跨 8 个节点, 每节点 8 张 H800, 每卡放 4 个专家. 这样一来, 每个 token 的 8 个专家副本大多落在别的节点上. 专家并行的一般做法与 all-to-all 的通信量推导见 [MoE 专家并行与 All-to-All 通信](../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md), 这里只算 DeepEP 关心的那部分.

一个 FP8 token 的载荷是 $7168 \times (1 + 4/128) = 7392$ 字节: 每个元素 1 字节, 每 128 个元素一个 4 字节的 FP32 scale. 一张卡在一个 micro-batch 里处理 4096 个 token, 如果每个副本单独发送, dispatch 一次要发 $4096 \times 8 \times 7392 \approx 242$ MB. 报告给出的计算与通信时间比约为 1:1, 也就是说, 不把这部分通信藏起来, 训练时间会接近翻倍. DeepEP 要解决的就是两件事: 让跨节点的字节数尽可能少, 让剩下的通信尽可能和计算重叠.

### 1.2. 为什么限制每 token 的节点数

V3 的门控先把 256 个专家按节点分成 8 组, 每组取亲和度最高的 2 个求和作为组分, 选出得分最高的 4 个节点, 再在这 4 个节点的 128 个专家里取 top-8. DeepEP 的测试脚本用的是简化版本: [`tests/test_internode.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/tests/test_internode.py) 取每组的最大分数作为组分, `num_topk_groups` 默认为 `min(num_nodes, 4)`. 限制的效果可以直接算. 设专家数为 $E$, 分成 $G$ 组, 一个 token 在均匀路由下从 $E$ 个专家里无放回地选 $k$ 个, 它命中的组数期望为

$$
\mathbb{E}[\text{命中组数}] = G\left(1 - \binom{E - E/G}{k} \Big/ \binom{E}{k}\right).
$$

不加限制时 $E=256, G=8, k=8$, 期望命中 5.30 个节点, 最坏 8 个; 限到 4 个节点后, 相当于 $E=128, G=4, k=8$, 期望降到 3.63 个, 最坏 4 个. 去掉本节点 (概率 $1/8$) 之后, 每个 token 过网卡的份数从 4.63 降到 3.18, 少了约 31%. 更关键的是上界: 最坏情况从 7 份变成 3 到 4 份, 发送缓冲区和 RDMA 队列可以按这个上界预留. V3 报告还给了另一个角度: 节点内 NVLink 约 160 GB/s, 网卡约 50 GB/s, 比值约 3.2, 所以一个 token 进入目标节点之后, 平均可以在那里分给 3.2 个专家而不让 NVLink 成为瓶颈; 4 个节点合计最多 13 个专家, 当前的 top-8 还有余量.

同一个公式也出现在 V2 的代码里. [`deep_ep/buffers/ep.py`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/buffers/ep.py) 的 `get_theoretical_num_sms` 内部定义了 `get_expected_topk(num_groups)`, 写法就是 `num_groups * (1 - comb(num_experts - num_experts // num_groups, num_topk) / comb(num_experts, num_topk))`, 用它估算每个 token 期望命中的 scale-out 与 scale-up rank 数, 再推出 RDMA 与 NVLink 两侧的流量比例. 也就是说, 均匀路由下的期望命中数是 DeepEP 两代实现共同的流量模型, V1 把它用在默认配置的调参上, V2 把它写进了 SM 数的解析公式.

### 1.3. 非对称域带宽转发: 先 RDMA 到同号卡, 再 NVLink 分发

两级路径的具体走法是: 源卡 $(n_s, g)$ 上的 token 要发给节点 $n_d$ 上的若干张卡时, 先经 RDMA 发给 $n_d$ 上同号的卡 $(n_d, g)$, 一个节点只发一份; 这张卡收到后, 再经 NVLink 转发给本节点里真正持有目标专家的那几张卡. 这样每张卡只和其他节点的同号卡建立 RDMA 连接, 一个 8 卡节点里的 8 张卡各自走自己的网卡, 不同号之间的流量不会挤到同一块网卡上. 文档把这称为非对称域带宽转发 (asymmetric-domain bandwidth forwarding): RDMA 域与 NVLink 域带宽不同, 转发把字节数大的那一段放到快的 NVLink 上.

转发的代价是 NVLink 上的字节数. 跨节点到达的每一份都要再走一跳 NVLink, 节点内的分发份数接近 token 的专家副本数. 按 1.2 节的数字, RDMA 上每个 token 约 3.18 份, NVLink 上接近 8 份, 两者的比值与带宽比 3.2 大致相当, 两段可以同时跑满. 这也是 normal kernel 必须让 SM 全程参与的原因: NVLink 转发是内存语义的拷贝, 要由 SM 一个字节一个字节地搬, 不能交给网卡. V3 报告里「20 个 SM 用于通信」指的就是这部分开销.

## 2. normal kernel: layout 计算, 通知与转发流水

### 2.1. `get_dispatch_layout`: 四个描述路由的张量

normal dispatch 一次调用要跑三个 kernel: `get_dispatch_layout`, `notify_dispatch` 与 `dispatch` 本身. 第一个在 [`csrc/kernels/layout.cu`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/kernels/layout.cu) 里, 输入是形状 `[num_tokens, num_topk]` 的 `topk_idx`, 输出四个张量: `num_tokens_per_rank` (发往每个 rank 的 token 数), `num_tokens_per_rdma_rank` (发往每个节点的 token 数), `num_tokens_per_expert` (发往每个专家的 token 数), 以及布尔矩阵 `is_token_in_rank` (形状 `[num_tokens, num_ranks]`, 表示第 $i$ 个 token 要不要发给第 $r$ 个 rank). 这里的计数都按 token 去重: 一个 token 选中同一个 rank 上的两个专家, 只算一次.

kernel 的分工按 SM 切开. 模板参数是 `kNumThreads=256, kNumExpertsPerSM=4, kNumRanksPerSM=8`: 前 $\lceil E/4 \rceil$ 个 SM 每个负责 4 个专家, 256 个线程分段扫 `topk_idx`, 在 shared memory 里按线程累加再归约, 得到 `num_tokens_per_expert`; 后面的 SM 每个负责 8 个 rank, 也就是一个节点, 同样扫一遍 `topk_idx`, 对每个 token 判断它落在这 8 个 rank 里的哪几个, 写 `is_token_in_rank`, 同时累加 rank 级与节点级的计数. 256 个专家, EP64 时 grid 是 $64 + 8 = 72$ 个 SM. 这一步不涉及通信, 计算量很小, 后面两步都以它的输出为输入.

### 2.2. `notify_dispatch`: 交换计数, 前缀和与 CPU 等待

第二步要解决「接收方事先不知道自己会收多少 token」的问题. [`csrc/kernels/internode.cu`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/kernels/internode.cu) 的 `notify_dispatch` 里, SM 0 负责全局同步与计数交换: 先做一次节点内 barrier 与同号卡之间的跨节点同步, 把本卡发往每个节点, 每个 rank, 每个专家的 token 数用 `nvshmemi_ibgda_put_nbi_warp` 写到对端的对称缓冲区, 再经节点内的 NVLink 缓冲区汇总, 最后算出本卡总共要收多少 token, 写进一块 pinned host 内存 `moe_recv_counter_mapped`. 其余 SM 并行计算按 channel 划分的前缀和矩阵 `rdma_channel_prefix_matrix` 与 `gbl_channel_prefix_matrix`: 一个 channel 处理 token 序列中连续的一段, 前缀和给出每个 channel 在每个目标 rank 的接收缓冲区里从第几个位置开始写. 有了这两张表, 后面各个 channel 可以无锁地并行写入, 写出来的顺序与源 token 顺序一致.

主机侧在 [`csrc/deep_ep.cpp`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/deep_ep.cpp) 里自旋读 `moe_recv_counter_mapped`, 直到 GPU 写入有效值, 超时上限 `NUM_CPU_TIMEOUT_SECS` 为 100 秒 (定义在 [`csrc/kernels/configs.cuh`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/kernels/configs.cuh)). 拿到数字之后, CPU 才能按准确大小分配 `recv_x` 等输出张量, 再 launch 真正的 dispatch kernel. 这一次 GPU 到 CPU 的同步是 normal kernel 不能被 CUDA graph 捕获的原因. 绕开的办法是 `num_worst_tokens`: 调用方给出最坏情况下的接收 token 数, 输出按这个容量分配, 跳过 CPU 等待. V1 文档的示例注释写「this flag is for intranode only」, 但在 `567632d` 的代码里 `internode_dispatch` 也接受 `num_worst_tokens`, 对应 2025-11-05 的提交 `92fe2de` (Enable CUDA Graph for internode dispatch), 文档没有跟着更新.

### 2.3. channel, warp 角色与环形队列

真正的 dispatch kernel 以 channel 为单位组织, 一个 channel 占两个 SM. 节点内版本 ([`csrc/kernels/intranode.cu`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/kernels/intranode.cu)) 最简单: `sm_id % 2 == 0` 的 SM 是发送方, 奇数 SM 是接收方, `num_channels = num_sms / 2`, 每个 channel 负责 token 序列的一段, 对每个目标 rank 有一条 NVLink 环形队列, 发送方写 tail, 接收方推进 head. 跨节点版本把两个 SM 分成转发 SM 与非转发 SM (`is_forwarder = sm_id % 2 == 0`), 在 warp 级别再细分角色. 非转发 SM 上有 7 个 `kRDMASender` warp, 把 token 打包写进发往各节点的 RDMA 发送缓冲区; 1 个 `kRDMASenderCoordinator` warp, 负责按 chunk 提交 RDMA 写并推进远端的 tail; 其余 8 个 `kNVLReceivers` warp, 每个对应一个 NVLink 对端, 从 NVLink 队列里取出 token 写进最终的 `recv_x`. 转发 SM 的前 8 个 warp 是 `kRDMAAndNVLForwarder`, 后面的 warp 被标成 `kForwarderCoordinator`, 但只有第一个干活, 其余直接返回: 前者从 RDMA 接收缓冲区读出别的节点发来的 token, 按 token 附带的目标位图转发到本节点各卡的 NVLink 队列, 后者回收已消费的 RDMA 缓冲区并把新的 head 告诉发送方.

token 在两段之间带着一个 `SourceMeta` 结构, 字段只有两个: `src_rdma_rank` (来自哪个节点) 与 `is_token_in_nvl_rank_bits` (一个 8 位的位图, 第 $j$ 位表示要不要转发给本节点第 $j$ 张卡). 一个 8 卡节点正好用一个字节描述 NVLink 分发, 这也是 `NUM_MAX_NVL_PEERS` 取 8 的原因. 发送顺序上有一个细节: RDMA sender 遍历目标节点时用 `dst_rdma_rank = (i + channel_id + rdma_rank) % kNumRDMARanks`, 不同 channel, 不同源节点的起点错开, 避免所有卡在同一时刻都往同一个节点写造成 incast. 环形队列省显存, 但也带来了复杂度: 生产者与消费者之间靠 head 与 tail 两个计数器同步, 一方超时就会整体卡住, 所以每个等待循环都带 `NUM_TIMEOUT_CYCLES` 的超时打印. V1 文档自己也承认这一点, 建议重写的人改用按最大容量预分配的定长缓冲区 (issue 39).

### 2.4. combine 的反向路径, 缓存模式与 SM 数

combine 走的是 dispatch 的反向路径: NVLink 发送方把专家输出写回转发卡, 转发卡在本节点内先把发往同一源 token 的多份输出加起来, 再经 RDMA 发回源节点, 源卡最后做一次归约. 跨节点版本的角色换成 `kNVLSender`, `kNVLAndRDMAForwarder`, `kRDMAReceiver` 与 `kCoordinator`, 转发 SM 变成奇数号 (`is_forwarder_sm = sm_id % 2 == 1`). 节点内先归约, 意味着 RDMA 上回传的是每个 (token, 节点) 一份, 字节数与 dispatch 对称. combine 不需要 layout 与 notify: dispatch 返回的 `handle` 里保存了前缀和矩阵与 `send_head` 等位置信息, combine 直接复用. 训练反向时也一样, dispatch 的反向就是 combine, combine 的反向就是带 `handle` 的缓存模式 dispatch, 不再做 CPU 同步.

SM 数由 `Buffer.set_num_sms` 控制, 文档示例用 24, 即 12 个 channel. 每个 channel 内部的 chunk 大小由 `Config` 决定, 共四个参数: NVLink 与 RDMA 两侧的「一次最多发多少 token」与「接收缓冲区能放多少 token」. [`deep_ep/buffer.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/deep_ep/buffer.py) 里 `get_dispatch_config` 与 `get_combine_config` 为 EP2 到 EP160 各给了一组在 DeepSeek 内部集群上调好的值, 比如 EP32 dispatch 是 `Config(Buffer.num_sms, 32, 288, 8, 128)`. 文档建议在自己的集群上跑测试脚本重新搜索: [`tests/test_internode.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/tests/test_internode.py) 对 NVLink chunk 在 4 到 44, RDMA chunk 在 4 到 32 之间按步长 4 做网格搜索. SM 少了, 带宽上不去; SM 多了, 计算可用的 SM 就少. 这组参数要靠实测, 这正是 V2 想用解析公式取代的部分.

## 3. low-latency kernel: IBGDA 与 recv hook

### 3.1. 消息格式与按专家排布的接收区

decode 阶段每张卡一次只有几十到一百多个 token, 每个 token 仍要发给 8 个专家. 这时瓶颈从带宽变成了延迟: normal kernel 的三个 kernel, 一次 CPU 同步, 两级转发, 每一步都要付固定开销. low-latency kernel 的做法是把所有这些步骤合进一个 kernel, 并且不做转发: 每个 (token, 专家) 副本直接经 RDMA 发到持有该专家的卡, 每个副本一条消息. 消息格式在 [`csrc/kernels/internode_ll.cu`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/kernels/internode_ll.cu) 的 `dispatch` 里定义: 先是一个 `int4` 的头 (源 token 序号加 3 个保留字段), 然后是 hidden 数据, FP8 模式下再跟 `hidden / 128` 个 FP32 scale. hidden 为 7168 时, FP8 消息 7408 字节, BF16 消息 14352 字节.

接收区按专家排布, 不按源 rank 排布. 目标地址的算法是 `dst_expert_local_idx * num_ranks * num_max_dispatch_tokens_per_rank * num_bytes_per_msg + rank * num_max_dispatch_tokens_per_rank * num_bytes_per_msg + slot_idx * num_bytes_per_msg`: 每个本地专家有一块区域, 区域里每个源 rank 有 `num_max_dispatch_tokens_per_rank` 个槽位, 发送方对目标专家做一次 `atomicAdd` 拿到槽位号. 接收阶段把这些消息解包成形状 `[num_local_experts, num_ranks * num_max_dispatch_tokens_per_rank, hidden]` 的 `packed_recv_x`, 另给 `packed_recv_count` (每个专家实际收了多少) 与 `packed_recv_layout_range` (每个源 rank 在其中的起点与长度). 这个三维布局里大部分行是空的, 但它的形状只取决于配置, 与路由结果无关, 专家 GEMM 可以按 `packed_recv_count` 做 masked grouped GEMM, 整个 decode 步骤也就能被 CUDA graph 捕获.

预留按最坏情况算. [`csrc/config.hpp`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/config.hpp) 的 `LowLatencyLayout` 分配奇偶两套对称缓冲区, 每套含发送区, 接收区与信号区. 接收区大小是 `num_experts * num_max_dispatch_tokens_per_rank * num_bytes_per_msg`, 与 EP 规模无关, 只与专家总数和每卡最大 token 数有关. 取 128 个 token, hidden 7168, 256 个专家, 单套接收区约 455 MiB, 两套加上发送区共约 1.78 GiB. 这就是文档建议 `num_max_dispatch_tokens_per_rank` 小于 256 的原因. 奇偶两套缓冲区轮流使用, 所以文档同时警告: 同一时刻最多只能持有两次 low-latency 调用的结果张量.

### 3.2. IBGDA: GPU 直接敲网卡门铃

发送路径上的 FP8 转换在 kernel 内完成. 除最后一个 warp 外, 其余 warp 每次处理一个 token: 读 BF16 数据, 每 128 个元素用 `warp_reduce_max<16>` 求出 amax, 算 scale, 转成 E4M3 写进发送缓冲区; `round_scale` 把 scale 取整到 2 的幂, `use_ue8m0` 把 scale 存成 UE8M0 格式, 两者都是为了配合下游 GEMM 对 scale 格式的要求. 转换完成后, 每个 top-k 槽位对应的 warp 调 `nvshmemi_ibgda_put_nbi_warp`, 由 GPU 线程自己组装 RDMA 写请求, 写进网卡的发送队列, 再敲门铃. 最后一个 warp 统计本卡发往每个专家的 token 数, 等该专家的所有消息都提交之后 (计数器到达 `FINISHED_SUM_TAG * 2`), 用 `nvshmemi_ibgda_amo_nonfetch_add` 把 `-num_tokens_sent - 1` 原子加到接收方的计数槽位里. 取负再减一是为了让 0 保留给「还没到」: 接收方自旋读这个槽位, 读到非零就知道数据已经完整到达, 并从中解出 token 数.

IBGDA (InfiniBand GPUDirect Async) 与 NVSHMEM 默认的 IBRC 传输的区别在于谁来操作网卡. IBRC 下 GPU 把请求交给 CPU 上的代理线程, 由 CPU 提交 RDMA 操作; IBGDA 下 GPU 直接写网卡的工作队列与门铃寄存器, 省掉了 GPU 到 CPU 的往返. decode 时一次 dispatch 要发 $128 \times 8 = 1024$ 条约 7.4 KB 的消息, 几十到一百多微秒内全部发完, CPU 代理的提交速率跟不上. 这也是 V1 要求在驱动里打开 `PeerMappingOverride` 与 `NVreg_EnableStreamMemOPs` 的原因: GPU 要能直接映射网卡的寄存器与队列. 每个本地专家用一个独立的 QP: 文档要求 `num_qps_per_rank` 等于本地专家数, SM 0 上负责计数的那个 warp 会断言 `num_rc_per_pe >= num_local_experts`, 发送时把 `dst_expert_local_idx` 作为 QP 编号传入. 发往不同专家的消息走不同的 QP, 互不排队. 另一个约束在 [`deep_ep/buffer.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/deep_ep/buffer.py) 里: `NVSHMEM_QP_DEPTH` 默认 1024, 且必须不小于 `(num_max_dispatch_tokens_per_rank + 1) * 2`.

### 3.3. hook: 把发送与接收拆成两次 launch

low-latency kernel 内部按 phase 分成两段: `LOW_LATENCY_SEND_PHASE` 做转换, 提交 RDMA 写与计数原子; `LOW_LATENCY_RECV_PHASE` 自旋等计数, 把接收区的消息解包成 `packed_recv_x`. 两段都执行时, 中间用一次 `cg::this_grid().sync()` 保证发送侧的计数清零对接收侧可见. [`csrc/deep_ep.cpp`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/deep_ep.cpp) 在 `return_recv_hook=true` 时只 launch 发送段, 然后返回一个 lambda `recv_hook = [=]() { launcher(LOW_LATENCY_RECV_PHASE); }`. 调用方拿到 hook 后可以先去做别的计算, 需要数据时再调 hook, 这时才 launch 接收段.

这就是「不占 SM 的重叠」的确切含义. 发送段要占满所有 SM, 但只持续几微秒, 发完 kernel 就退出; 之后数据在网卡与网络上传输, 这段时间 GPU 上没有任何通信 kernel 驻留, SM 全部留给计算; 接收段被调起时数据通常已经到达, 只剩解包. 作者在 [issue 179](https://github.com/deepseek-ai/DeepEP/issues/179) 里给出的说法与此一致: 发起阶段占 SM, 传输阶段不占. 文档里的双 micro-batch 图是这样用的: micro-batch A 做 attention 时, B 的 dispatch 在网络上传输; A 做 MoE 时, B 的 combine 在传输, 依此交替. 能这样拆的前提是 RDMA 是消息语义, 网卡在 kernel 退出后继续搬运; NVLink 拷贝是内存语义, 必须由 SM 执行. [issue 95](https://github.com/deepseek-ai/DeepEP/issues/95) 里作者解释早期 low-latency 不走 NVLink 时, 给的正是这条理由. 2025-05-23 的提交 `aae9fa9` 把 `allow_nvlink_for_low_latency_mode` 的默认值改成了允许, 同节点的副本由发送段的 warp 直接拷过去; 参数文档仍写着这个选项「与 hook 式重叠有些不兼容」, 因为同节点那部分的传输时间算在了发送段里.

### 3.4. combine 的权重归约, LogFMT 与 zero-copy

low-latency combine 的方向相反: 每张卡把每个本地专家处理过的 token 输出按 `packed_recv_src_info` 记录的源位置发回源卡, 源卡收齐之后, 按 `topk_weights` 加权求和得到最终输出. 加权在接收方做, 意味着专家侧只需发回未加权的 BF16 输出, 每个副本 $7168 \times 2 = 14336$ 字节, 比 dispatch 的 FP8 消息大将近一倍, 这也是低延迟表里 combine 延迟普遍比 dispatch 高的直接原因. combine 同样支持 `return_recv_hook`, 拆法与 dispatch 相同.

combine 还有两个降开销的选项. 一是 `use_logfmt`: 2025-07 到 08 月的提交 `1cf85fb` 与 `c5facf5` 加入了 10 位的 LogFMT 格式: 每组通道求出 amax 与 amin, 在对数域上均匀量化成 10 位, 每组附带一对 BF16 的 amax/amin 作元数据. 测试脚本按 `hidden * 10 / 8 + hidden / 128 * 4` 计字节, 每元素约 1.28 字节, 比 BF16 少约 36%. kernel 只在这一组的 $\log_2 \text{amax} < 0$ 且 amin 严格小于 amax 时转换, 否则这一组仍按 BF16 发送. 分组粒度上, 参数文档写的是「per-64-channel」, 而 kernel 的注释是「Reduce per 128 channels」, 测试脚本的元数据项也按 128 计. 二是 `zero_copy`: 调用方用 `get_next_low_latency_combine_buffer` 拿到下一次 combine 的 RDMA 发送缓冲区, 让专家 GEMM 直接把输出写进去, combine kernel 就省掉一次从 PyTorch 张量到通信缓冲区的拷贝. 后者对应 2025-03-18 合入的 PR 79.

## 4. 性能数字的口径与版本演进

### 4.1. normal kernel 表: 「瓶颈带宽」是怎么算的

V1 文档的 normal kernel 表测试条件是: H800, NVLink 最大约 160 GB/s; 每卡一块 CX7 InfiniBand 400 Gb/s 网卡, 最大约 50 GB/s; 每批 4096 个 token, hidden 7168, top-4 组, top-8 专家, FP8 dispatch, BF16 combine. 数字是节点内 EP8 dispatch 153 GB/s, combine 158 GB/s (NVLink); 跨节点 EP16 为 43/43, EP32 为 58/57, EP64 为 51/50 GB/s (RDMA). 这些数字由 [`tests/test_internode.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/tests/test_internode.py) 打印: RDMA 一栏的分子是 `num_rdma_token_sent * hidden * 2`, 再乘 FP8 系数 `(1 + 4 / 128) / 2`, 其中 `num_rdma_token_sent` 是按节点去重后的 (token, 节点) 对数, 本节点也计入; 分母是 CUDA event 测出的 kernel 时间, 50 次热身, 50 次取平均, 测量前用 256 MB 的写操作冲刷 L2. 所以「瓶颈带宽」是逻辑带宽: 它把本节点那一份也算成了 RDMA 字节. 文档没有说明这一点, V2 的 README 在表注里补上了「logical bandwidth, 含本地 rank 流量」.

有两处口径值得对照代码看. 第一, 文档写「top-4 groups」, 但测试脚本的 `num_topk_groups` 默认是 `min(num_nodes, 4)`: EP16 只有 2 个节点, 实际是 top-2 组; EP32 有 4 个节点, top-4 组等于不加限制. 只有 EP64 (8 节点) 的那一行对应 V3 的 4 节点限制. 第二, 初版 README (提交 `ebfe47e`) 的跨节点数字是 EP16 43/43, EP32 44/47, EP64 46/45 GB/s, 后来 EP32 与 EP64 分别提到 58/57 与 51/50. 提升来自 2025-04-22 合入的 PR 130 (腾讯网络平台部的多 QP 方案, 原先 IBRC 下两卡之间只有一个 QP, 双口网卡与 RoCE 场景受限) 以及随后「normal kernel 一律用 IBGDA」的提交 `3e54b78`.

### 4.2. low-latency 表: 延迟与带宽能互相推出来

low-latency 表的条件是每批 128 个 token, hidden 7168, top-8 专家, FP8 dispatch, BF16 combine, 同样是 H800 加 CX7. [`tests/test_low_latency.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/tests/test_low_latency.py) 的带宽算法是: 对每个 token 的每个有效 top-k 选择, dispatch 记 `hidden + hidden / 128 * 4 + 16` 字节, combine 记 `hidden * 2` 字节 (LogFMT 时另算), 求和后除以时间. 也就是说表里的带宽等于 $128 \times 8 \times \text{消息字节} / \text{延迟}$. 用 EP64 那一行验证: $128 \times 8 \times 7408 / 173\,\mu\text{s} \approx 43.9$ GB/s, 表里写 43 GB/s; EP8 是 $7.59\,\text{MB} / 77\,\mu\text{s} \approx 98.5$ GB/s, 表里写 98 GB/s. 对得上, 说明带宽一栏不是另外测的, 是由延迟换算出来的.

由此可以读出两件事. 其一, EP8 的 98 GB/s 与 combine 的 127 GB/s 超过了网卡上限, 原因是 EP8 时八张卡在同一节点内, 提交 `aae9fa9` 之后这些副本走 NVLink 拷贝, 而测试脚本照样计入. 初版 README 的 EP8 是 163 us 与 46 GB/s, 当时全走 RDMA. 其二, EP 越大, 同节点的比例越低, 带宽收敛到 39 到 40 GB/s, 约为网卡上限的 80%; 延迟从 EP64 的 173 us 涨到 EP256 的 194 us, 几乎不再增加, 因为每卡发出的字节数固定为约 7.6 MB, 时间主要由网卡带宽决定, 而不是由对端数量决定. 测试脚本默认 `num_experts=288` (256 个路由专家加 32 个冗余专家), 文档没有写出专家总数, 但带宽算法只看每个 token 的选择数, 不受影响.

### 4.3. 版本演进: 从 NVSHMEM 补丁到 NCCL Gin

V1 的演进集中在 2025 年. 2025-03 加入 low-latency combine 的 zero-copy; 4 月合入多 QP, normal kernel 改用 IBGDA; 5 月 28 日的提交 `9fe9021` 让整个库只用 IBGDA, 5 月 23 日放开 low-latency 的 NVLink; 6 月支持 Ampere (只限节点内), 节点内 normal kernel 支持 CUDA graph, 节点内 kernel 的 LD/ST 换成 TMA; 7 月跨节点 dispatch, combine 与 low-latency combine 发送也陆续换成 TMA, 并加入 10 位 LogFMT. 依赖上, 早期 DeepEP 需要给 NVSHMEM 打补丁 (`third-party/nvshmem.patch`), 2025-07 的一组提交改为兼容上游 NVSHMEM 3.3.9, 加入 CPU 协助的 IBGDA 与非 bond 双口网卡支持. 2025-09-15 打了唯一的 tag `v1.2.1`, 9 月 25 日合入弹性 EP (PR 370, 可以在运行时屏蔽故障 rank), 11 月跨节点 dispatch 也支持了 CUDA graph.

2026-04-30 的提交 `b306af0` 发布 V2, 是一次完整重构: 通信后端从 NVSHMEM 换成 NCCL 的 Gin (GPU-initiated networking) 设备 API, 缓冲区注册成 NCCL 的对称内存窗口, kernel 改由 DeepJIT 在运行时编译; 高吞吐与低延迟两套接口合并成 `ElasticBuffer`, 支持 hybrid (先 scale-out 再 scale-up 的两级路径, 与 V1 normal kernel 同构) 与 direct (每个副本直接发往目标 rank, 与 V1 low-latency 同构) 两种模式, 同时加入 Engram, PP 与 bucket 集合通信等实验特性. 2026-09-29 的 V2.5 (提交 `def8651`) 把 `ElasticBuffer` 拆成 `EPBuffer`, `EngramBuffer`, `PPBuffer` 与 `BucketBuffer`, 加入冗余专家的权重预取与梯度归约, 并删除 V1 的全部代码, NVSHMEM 不再是依赖. V2 时期的 README 写过「up to EP2048」, V2.5 的 README 不再出现这个数字.

### 4.4. V2 的解析式 SM 数与新性能表

V2 用 [`deep_ep/buffers/ep.py`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/buffers/ep.py) 的 `get_theoretical_num_sms` 取代 V1 的手调表. 它用 1.2 节的期望命中公式分别算出 scale-out 与 scale-up 的期望命中数, 再按每个 token 估算四个量: SM 读字节, SM 写字节, RDMA 流量与 NVLink 流量. 带宽来自 [`deep_ep/utils/envs.py`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/utils/envs.py): 每 SM 读带宽 `get_sm_read_gbs()` 默认 180 GB/s, 写带宽 `get_sm_write_gbs()` 默认 45 GB/s, NVLink 带宽由 `nvidia-smi nvlink -s` 探测后乘 0.9, RDMA 带宽由 `ibstat` 探测. 先比较 RDMA 与 NVLink 哪一侧耗时长, 把那一侧定为瓶颈, 然后要求 SM 的读写速度跟得上瓶颈链路, 解出所需 SM 数, 再乘 1.3 的余量, 向上对齐到 4 的倍数, 下限 4, 上限为设备 SM 数. `prefer_overlap_with_compute=False` 时下限提到 64. QP 数由 `get_theoretical_num_qps` 给出: direct 模式取 `min(num_sms, 9)`, 减少门铃开销; hybrid 模式取 `num_sms * 16 + 1`, 让每个 channel 有独立 QP, 多出的 1 个给 notify warp.

V2 发布时的性能表 (提交 `a56d615` 的 README) 换了一套条件: 每批 8K 个 token, hidden 7168, top-8, FP8 dispatch, BF16 combine. SM90 加 CX7, EP 8×2 为 90/81 GB/s 用 12 个 SM, EP 8×4 为 61/61 GB/s 用 6 个 SM; SM100 节点内 EP8 在 64 个 SM 时达到 726/740 GB/s (NVLink), 24 个 SM 时 643/675 GB/s. README 给出的对比结论是「峰值性能最高 1.3 倍, SM 数最多省 4 倍」, 以及「V3 式训练的 SM 用量从 24 降到 4 到 6」. 这张表与 V1 的表不宜直接相除: token 数从 4096 变成 8K, V2 的测试脚本 [`tests/ep/test_ep.py`](https://github.com/deepseek-ai/DeepEP/blob/main/tests/ep/test_ep.py) 按每 token 的实际字节 (含 top-k 索引与权重) 计数, 拓扑写法也从「EP16」变成「EP 8×2」. V2.5 的 README 删掉了这张表, 当前 main 上没有官方性能数字.

## 5. 部署约束, 局限与昇腾版

### 5.1. V1 的 NVSHMEM 依赖与网络配置

V1 的跨节点与 low-latency kernel 都建立在 NVSHMEM 之上: 所有 RDMA 缓冲区是 NVSHMEM 的对称内存, 每个 rank 分配同样大小, 远端地址可以用本地偏移直接算出; GPU 侧的 `nvshmemi_ibgda_put_nbi_warp` 与 `nvshmemi_ibgda_amo_nonfetch_add` 是 NVSHMEM IBGDA 传输的设备函数. 不设 `NVSHMEM_DIR` 编译时, [`setup.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/setup.py) 会去掉 `internode.cu` 与 `internode_ll.cu`, 只剩节点内 kernel. `docs/nvshmem.md` 列出的部署前提是: NVSHMEM 3.3.9 或更新; 节点内 NVLink, 节点间 GPUDirect RDMA; IBGDA 可用. 打开 IBGDA 有两种办法, 一是在 `/etc/modprobe.d/nvidia.conf` 里设 `NVreg_EnableStreamMemOPs=1` 与 `PeerMappingOverride=1` 后重建 initramfs 并重启, 二是装 GDRCopy 走 CPU 协助的 IBGDA, 性能略低, 适合不能改驱动的环境.

运行时, [`deep_ep/buffer.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/deep_ep/buffer.py) 在构造 `Buffer` 时替用户设好一组 NVSHMEM 环境变量: `NVSHMEM_IB_ENABLE_IBGDA=1`, `NVSHMEM_IBGDA_NUM_RC_PER_PE` 等于 `num_qps_per_rank`, `NVSHMEM_QP_DEPTH` 默认 1024, `NVSHMEM_MAX_TEAMS=7`, `NVSHMEM_CUMEM_GRANULARITY` 为 $2^{29}$, 并按 `allow_nvlink_for_low_latency_mode` 设置 `NVSHMEM_DISABLE_P2P`. 这意味着同一进程里的其他 NVSHMEM 用户会受到影响. 网络侧的建议是用 InfiniBand 虚拟通道把 normal, low-latency 与其他流量分开, 经 `NVSHMEM_IB_SL` 选服务等级; 自适应路由在重载时打开, 轻载时用静态路由; 拥塞控制关闭. 还有一处平台相关的风险: 为了读 volatile 数据, V1 用了只读指令 `ld.global.nc.L1::no_allocate.L2::256B`, 这在 PTX 规范里是未定义行为, 只在 Hopper 上实测正确; 目标架构不是 `9.0` 时 `setup.py` 强制关闭它. `DISABLE_SM90_FEATURES=1` 面向 A100 一类的 SM80 设备, 会同时关掉 FP8, TMA 与全部 NVSHMEM 功能, 所以 A100 上的 V1 只有节点内 normal kernel.

### 5.2. V2.5 的依赖与适用条件

V2.5 把部署前提换了一遍. 依赖是 Linux, Python 3.10 及以上, Hopper 或更新的 GPU, CUDA Toolkit 13.1 及以上, 支持 `std::format` 的 C++20 编译器, PyTorch 2.10 及以上, NCCL 2.32.3 及以上. 安装只构建主机侧扩展, kernel 由 DeepJIT 在首次使用时针对当前设备编译, 所以运行环境里必须保留 CUDA toolkit 与主机编译器. PyTorch 与 DeepEP 必须加载同一个 NCCL 共享库, 默认还会复用 PyTorch 进程组的 NCCL communicator (`EP_REUSE_NCCL_COMM=1`). 网卡侧不再需要改驱动注册键, 但带宽探测依赖 `nvidia-smi` 与 `ibstat` 能正常输出; README 另外建议用 `mlxconfig` 把网卡的 `PCI_ATOMIC_MODE` 设为 4, 改善 RDMA 原子操作的性能, 这与 `check_fast_rdma_atomic_support` 决定 hybrid 模式分配 65 还是 129 个 QP 是同一件事.

适用条件可以归纳成几条. 第一, SM 数的解析公式假设路由均匀, 真实负载偏斜时瓶颈 rank 的流量会高于期望值, 公式里乘 1.3 的余量就是为此留的, 偏斜更严重时要手动传 `num_sms` 覆盖. 第二, 所有 rank 必须对 `num_max_tokens_per_rank` 取同一个值, 训练, prefill 与 decode 共用一个 buffer 时要按最大的批来预留. 第三, 通信必须占 SM, README 明确写着不支持零 SM 的 RDMA EP; 把 SM 从 RDMA 路径上拿掉的工作 (Normal-SMFree, Hybrid-EP 等) 都在实验分支里. 第四, 网络只在 InfiniBand 上做过完整测试, RoCE 只是理论兼容; AMD GPU 与 EFA 等网卡要用 Mori-EP, uccl-ep 这类分支或社区实现.

### 5.3. V1 设计的局限

V1 的 normal kernel 在通信期间始终占着 SM, 这是 NVLink 转发与环形队列带来的: 转发需要 SM 搬数据, 队列需要 SM 推进 head 与 tail. V3 报告在硬件建议一节里把这一点列为通信方面的第一条, 希望由专门的协处理器承担 IB 与 NVLink 之间的转发与 combine 归约. 第二个局限是 CPU 同步: 接收计数要回到主机才能分配输出, 每层 dispatch 都有一次 GPU 到 CPU 的往返, 在 CUDA graph 下只能改用 `num_worst_tokens` 按最坏情况分配. 第三是调参: `Config` 表与 SM 数都是在 DeepSeek 内部集群上调出的, 换一个集群就要重新搜索.

low-latency kernel 的局限在显存与 QP. 接收区按 `num_experts * num_max_dispatch_tokens_per_rank` 预留, 256 个专家, 128 个 token 时两套缓冲区合计约 1.78 GiB, 专家数或批大小再翻倍就要翻倍显存. QP 数要等于本地专家数, QP 深度要不小于 `(num_max_dispatch_tokens_per_rank + 1) * 2`, 这两条把每卡专家数与最大批大小绑在了网卡资源上. hook 重叠需要框架自己排双 micro-batch 的流水, 四段 (attention, dispatch, MoE, combine) 时间不均时还要手工调整分段, DeepEP 只提供拆分点, 不负责调度. 放开 NVLink 之后, 同节点副本的拷贝时间算进发送段, hook 能藏住的只剩跨节点那部分.

### 5.4. DeepEP-Ascend: 同一套 API, 不同的通信栈

[DeepEP-Ascend](https://github.com/deepseek-ai/DeepEP-Ascend) 目前只有一个提交 `3b25377` (2026-09-29), 与 V2.5 同时发布. 它的 Python 包名同为 `deep_ep`, 公开接口对齐 V2.5 的 `EPBuffer`, `PPBuffer`, `EngramBuffer`, `BucketBuffer` 与 `BufferAllocator`, kernel 用 Ascend C 编写, 同样经 DeepJIT 运行时编译; 通信走 HCCL/HCOMM, UBMEM 与 URMA, 而不是 NCCL Gin. 硬件要求是带 UBMEM 互联与 `UBC_CTP`/URMA 通道的 Ascend 950 (A5), 参与通信的 rank 数必须为偶数, 验证过的软件栈是 CANN 9.2.0, Python 3.12, PyTorch 2.13.0 与 `torch_npu` 2.13.0rc1. 测试结果依赖一个提供给 DeepSeek 的 PoC 固件与手工配置, README 建议用户等华为计划在 2026 年 10 月中旬发布的 Atlas 850E 商用 HDK.

接口层面有几处差异. EP 只支持 `do_expand=True` 与 `allow_multiple_reduction=True`, `do_handle_copy` 必须为 `False`; `topk_idx_t` 固定为 int64; 不支持显式指定 RDMA 服务等级与 QP 数; `num_sms` 参数在昇腾上选择的是 AI core 数. hybrid 模式, CPU 侧的 Engram 存储与图捕获都不支持, bucket 只实现了 all-gather, 冗余专家的权重预取与梯度归约只有接口, kernel 尚未实现. 性能表的条件是每 rank 16384 个 token 的容量, hidden 7168, 256 个专家里取 top-6, 32 个 AI core (64 个 AIV), 专家对齐 128, FP8 dispatch (行优先 scale), BF16 combine, 全部经超节点外部的 Clos 网络 (netlayer 1). 结果是 EP8 dispatch 373 到 375 GB/s, combine 345 到 347 GB/s, 到 EP128 降到 313 到 320 与 272 到 278 GB/s; 计时包含发起与排空, 不含最后的 epilogue. 这组数字的 top-k 是 6 而不是 8, token 容量是 V2 表的两倍, 与 NVIDIA 版的表不能直接比较. README 自己的说法是 EP32 以内 dispatch 达到物理载荷带宽上限的 90% 到 95%, combine 因为本地归约与 URMA 的 HBM 争用仍在优化.

### 5.5. 文档与代码对不上的地方

对照文档与 `567632d` 的代码, V1 有几处文档没有跟上代码. `DISABLE_SM90_FEATURES` 的说明写成「SM90 设备或 CUDA 11 需要」, 而 `setup.py` 里这个开关面向 SM80, 并会断言关闭 NVSHMEM. normal dispatch 示例的注释说 `num_worst_tokens` 只适用于节点内, 但 `internode_dispatch` 早已支持它. normal kernel 性能表写「top-4 groups」, 测试脚本的默认值却是 `min(num_nodes, 4)`, EP16 与 EP32 两行实际不受 4 节点限制约束. 两张性能表都是含本节点流量的逻辑带宽, V1 文档没有说明. LogFMT 的参数文档写按 64 通道分组, kernel 注释与测试字节公式都是 128.

跨版本的变化也有几处没有交代原因. `allow_nvlink_for_low_latency_mode` 的默认值在 2025-05 从禁止改为允许, 参数文档保留了「与 hook 式重叠有些不兼容」的警告, 但示例里的注释仍写 hook 「without any SM occupation」. 自适应路由的建议从「重载开, 轻载关」变成「所有负载都开」, 拥塞控制从「生产环境没观察到拥塞所以关」变成「验证网络配置后再关」. V2 的 README 写过「up to EP2048」, V2.5 删掉了这句, 同时删掉了整张性能表. low-latency 测试脚本默认 `num_experts=288`, 文档只写了 top-8. 这些都不影响 kernel 的正确性, 但读性能数字与部署建议时要以代码为准.

## 参考资料

- DeepEP 仓库: <https://github.com/deepseek-ai/DeepEP>, V1 最后状态见提交 [567632d](https://github.com/deepseek-ai/DeepEP/tree/567632d), V1 文档见提交 [a56d615](https://github.com/deepseek-ai/DeepEP/tree/a56d615/docs)
- DeepEP-Ascend 仓库: <https://github.com/deepseek-ai/DeepEP-Ascend>
- DeepEP issue 179, normal 与 low-latency kernel 的 SM 占用: <https://github.com/deepseek-ai/DeepEP/issues/179>
- DeepEP issue 95, low-latency dispatch 为什么只用 IBGDA: <https://github.com/deepseek-ai/DeepEP/issues/95>
- cyhdmjzzy, DeepEP 代码注释与分析 (知乎): <https://zhuanlan.zhihu.com/p/2010804354895062050>, 配套仓库 <https://github.com/cyhdmjzzy/DeepEP-Code-Analysis>
- zartbot, 分析一下 EP 并行和 DeepSeek 开源的 DeepEP 代码: <https://community.aijishu.com/a/1060000000500689>
- CQzhangyu, Deepseek 的 All-to-all 通信: DeepEP 代码解读: <https://www.cnblogs.com/CQzhangyu/p/18741625>
- KIDGINBROOK, DeepSeek DeepEP 学习 (一) normal notify dispatch: <https://deepseek.csdn.net/67cd35953b685529b707b2df.html>
- Arganzheng, MoE 的通信: all-to-all, DeepEP 与 GPU 发起的通信: <https://arganzheng.life/moe-communication-all-to-all-deepep-and-gpu-initiated.html>
