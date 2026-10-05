---
title: FSDP 参数生命周期
description: 沿时间线追踪参数分片、聚合、释放与梯度规约，计算 FSDP 的显存峰值和通信窗口
published: true
---
# FSDP 参数生命周期

ZeRO-3 与 Fully Sharded Data Parallel（FSDP）解决的是同一类容量问题：参数、梯度和 optimizer state 都按数据并行组切分，算子需要完整参数时再临时聚合。显存和吞吐取决于每一时刻仍在 GPU 上的完整参数、下一组参数的预取进度、梯度 reduce-scatter 的时刻，以及这些动作能否藏进计算窗口。

一次训练迭代中，参数 shard 先被聚合成计算视图，forward 后按策略释放或保留，backward 再生成并分片梯度。设数据并行组大小为 $D$，一个 FSDP 单元管理 $\psi$ 个参数，参数和梯度均为 BF16，AdamW 使用 FP32 master parameter、first moment 与 second moment。忽略 activation 时，长期分片状态约为 $16\psi/D$ byte；forward 矩阵乘开始前，该单元还要临时得到 $2\psi$ byte 的完整 BF16 参数视图。

![DDP、ZeRO 与 FSDP 的状态生命周期](../images/state-flow.svg)

*图 1：FSDP 的常驻分片与计算期间的完整参数视图。作者绘制。*

## 1. FSDP1 与 FSDP2 管理参数的方式不同

PyTorch 的经典 `FullyShardedDataParallel`，本文称为 FSDP1。它把一个管理单元内的原始参数展平并拼接为 `FlatParameter`。本地长期保存的是 flat buffer 的一段 shard；unshard 时，all-gather 的结果写入带 padding 的完整 flat buffer，再按照原参数的形状、stride 和 offset 暴露视图。源码中的 `FlatParamHandle` 负责 shard 元数据、存储切换和视图管理。同一个逻辑参数在运行期可能指向本地 shard、低精度 shard 或完整 flat buffer，因此用户代码若长期缓存 `parameter.data` 的引用，可能拿到已经失效的旧存储。

`use_orig_params=True` 保留原始 `nn.Parameter` 对象，便于 optimizer 参数组和逐参数超参数，但这些对象的数据仍会在分片与完整视图之间切换。某个 rank 对一个原始参数可能只拥有部分元素，甚至拥有长度为零的本地片段；以为每个 rank 都能直接读取完整 `.data`，会得到错误的检查结果。需要查看完整权重时，应进入官方提供的完整参数上下文，并把读取动作放在上下文内部。

FSDP2 的入口是 `torch.distributed.fsdp.fully_shard`。它不再用一个 `FlatParameter` 取代参数集合，而是在初始化时把模块参数原地转换为按第 0 维分片的 DTensor。forward/backward 前的 hook 把参数 all-gather 成普通完整 Tensor，计算后释放完整存储，再让注册参数回到 DTensor。optimizer 必须基于这些 DTensor 参数初始化并更新本地 shard。参数全限定名保持不变，state dict 也以 DTensor 分片为主；需要完整权重时，可用 DTensor 或 Distributed Checkpoint 的接口重组。

两条路径都要把多个参数组织成通信组，否则数千个小 all-gather 的启动延迟会压过传输时间。FSDP1 主要通过 wrap 单元与 flat parameter 决定分组；FSDP2 按 `fully_shard()` 的调用形成组，官方要求自底向上调用：先处理 Transformer layer，再处理根模块剩余的 embedding、输出头等参数。下文的“FSDP 单元”同时指 FSDP1 的 handle 和 FSDP2 的参数组，涉及用户可见对象时再区分两者。

## 2. 一次 FULL_SHARD 迭代的完整时间线

假设模块 $L_k$ 的本地参数 shard 已常驻 GPU。进入 forward 前，pre-forward hook 发起 all-gather：每个 rank 提供约 $2\psi_k/D$ byte，收集成 $2\psi_k$ byte 的完整低精度参数。ring all-gather 中，每个 rank 的发送量近似为

$$
B_{ag}=\frac{D-1}{D}\cdot 2\psi_k.
$$

通信完成后，模块将完整 buffer 切成原参数视图并执行 forward。若采用 FULL_SHARD，post-forward hook 随后 reshard：保留本地 shard，释放完整参数存储。这个释放不需要 collective，只是切回 shard 视图并归还完整 buffer。

autograd 走到 $L_k$ 之前，pre-backward hook 必须再次 all-gather 同一组参数，因为权重梯度与输入梯度都依赖完整权重。计算反向后得到完整梯度，post-backward hook 对其执行 reduce-scatter：一边跨 rank 求和或平均，一边只把与本地参数 shard 对应的梯度区间交给当前 rank。若梯度采用 BF16，每 rank 的通信量与一次 ring reduce-scatter 的发送量近似为

$$
B_{rs}=\frac{D-1}{D}\cdot 2\psi_k.
$$

随后完整参数和完整梯度均可释放，optimizer 用本地梯度 shard 更新本地 master parameter 与 moments。FULL_SHARD 每步对该组参数通常包含 forward all-gather、backward all-gather 和梯度 reduce-scatter；总算法发送量约为 $3(D-1)2\psi_k/D$。这只是网络字节账本，forward gather 可与前一层计算重叠，backward gather 可由后一层反向计算遮住，reduce-scatter 也可与更早层的反向计算并行，最终暴露时间由 ready 顺序和计算窗口决定。

举例：一个单元含 400M 参数，BF16 完整参数为 800 MB，$D=8$。本地参数 shard 为 100 MB，每次 ring all-gather 或 reduce-scatter 每 rank 发送约 700 MB，三次共约 2.1 GB。若有效带宽为 100 GB/s，单次纯带宽下界约 7 ms。该单元 forward 计算只有 4 ms 时，下一单元的 7 ms 预取无法完全藏住；backward 计算若有 10 ms，则有机会遮住一轮 gather 或 reduce-scatter，但两种通信争用同一链路时不能分别按满带宽相加。

## 3. 三种 sharding strategy 的差别在释放时刻

`FULL_SHARD` 分片参数、梯度和 optimizer state，并在 forward 后释放完整参数。backward 前再次 all-gather，峰值较低，参数通信最多。它对应 ZeRO-3 的基本生命周期。

`SHARD_GRAD_OP` 仍分片梯度和 optimizer state，但训练 forward 后保留完整参数，直到 backward 结束再 reshard。这样省去 backward 前的一次参数 all-gather，代价是完整参数跨过 forward—backward 间隔继续驻留。FSDP1 源码把 `FULL_SHARD` 列入 forward 后 reshard 的策略，把 `SHARD_GRAD_OP` 列入不在 forward 后 reshard 的策略。官方文档还指出，使用 `use_orig_params=True` 时，`SHARD_GRAD_OP` 会在 forward 后继续暴露未分片参数。这一行为不能按 FULL_SHARD 的时间线估显存。

`NO_SHARD` 不切分参数、梯度或 optimizer state，行为接近把通信与同步封装进 FSDP 的复制式数据并行；每个 rank 长期保存完整模型状态。它不提供 ZeRO-3 式容量收益，PyTorch 文档也已将这一策略标为将弃用方向，普通复制训练直接使用 DDP 更清楚。

仍取 400M 参数单元、$D=8$。FULL_SHARD 在 forward 结束后可从 800 MB 完整参数退回 100 MB shard，随后 backward 再付一次 700 MB/rank 的 all-gather。SHARD_GRAD_OP 保留 800 MB，因此少一次 700 MB/rank 通信，却多占约 700 MB 显存。若连续包了 12 个 block，而且这些完整参数都等到各自 backward 才释放，驻留增量可接近 8.4 GB。选择策略时应比较整个活跃窗口，而非只看单层差值。

FSDP2 用 `reshard_after_forward` 表达相同取舍。设为 `True` 时，forward 后恢复 shard，backward 前重新聚合；设为 `False` 时，完整参数保留到 backward，减少一次聚合。当前接口还允许用整数把参数在 forward 后 reshard 到更小的 mesh，形成介于完全分片与完整复制之间的状态。这个选项改变的是 forward 与 backward 之间的参数布局，不能简单归进 FSDP1 的三个枚举名称。

## 4. 峰值显存由同时活跃的组决定

对 FULL_SHARD，单 rank 的模型状态下界仍可写成 $16\Psi/D$。运行峰值还要加 activation、当前完整参数、预取完整参数、完整梯度或 reduce-scatter buffer、通信 workspace 和 allocator 碎片：

$$
M_{peak}\approx \frac{16\Psi}{D}+M_{act}+M_{current}+M_{prefetch}+M_{grad}+M_{workspace}+M_{frag}.
$$

这里的 $M_{current}$ 按 FSDP 单元的完整 BF16 参数计，而不是本地 shard。若当前组 800 MB、下一预取组 1 GB，梯度 bucket 800 MB，那么仅三项瞬时状态就有 2.6 GB。wrap 越粗，collective 次数越少、带宽利用通常越高，但单次 unshard 峰值越大；wrap 越细，峰值下降，启动延迟、hook 数量和调度开销上升。

考虑 7B 模型、八卡 FULL_SHARD。BF16 参数和梯度、FP32 AdamW 的常驻状态下界为 14 GB/rank。假设 activation 32 GB，当前与预取单元各 1.2 GB，梯度完整 buffer 1.2 GB，workspace 3 GB，碎片及余量 6 GB，估算峰值为

$$
14+32+1.2+1.2+1.2+3+6=58.6\ \text{GB/rank}.
$$

若只在根模块包一次，7B 完整 BF16 参数约 14 GB，当前聚合项会从 1.2 GB 变成 14 GB；即使没有下一组预取，峰值也会升到约 70.2 GB，collective 还必须等整个根参数组 ready。按 Transformer block 包裹把峰值压低，并给通信—计算重叠提供多段窗口，这就是官方文档建议按层分组而非只包根模块的直接原因。

## 5. forward 与 backward 预取怎样改变时间线

forward prefetch 在 $L_k$ 计算期间发起 $L_{k+1}$ 的 all-gather。若 $L_k$ 计算为 12 ms，下一组聚合为 8 ms，理想情况下通信完全隐藏；如果下一组为 1.5 GB、链路有效带宽 100 GB/s，八卡 ring 发送约 1.3125 GB，下界为 13.1 ms，至少约 1.1 ms 会暴露。提前两层预取可能遮住这部分，却让两个未来完整组同时驻留，显存账本必须增加相应容量。

FSDP1 的 `forward_prefetch` 主要面向执行顺序固定的 CPU-bound 场景，它依据首次迭代记录的顺序提前发起下一次 all-gather；动态控制流若改变模块顺序，不能假定同样安全。`backward_prefetch` 则决定在当前模块反向计算前后，何时为下一个待反向模块预取参数。越早发起越容易重叠，也越可能让当前、下一完整参数和当前梯度同时存活。

`limit_all_gathers=True` 是 FSDP1 的显存节流器。它会在 CPU 线程侧限制过多 all-gather 提前排队，使 GPU 上通常不会出现超过预期数量的完整参数组。profiler 里可能看到 CPU 在 pre-forward 附近停顿，这并不必然表示 GPU 空闲；它可能是在等待先前聚合对应的 buffer 获得释放资格。关闭限制可能提高某些场景的排队深度，也可能让多个完整组同时落到显存里而 OOM。

## 6. 一个 13B 模型的 wrap 与带宽选择

设 13B 模型有 40 个近似等大的 Transformer block，BF16 单 block 参数约 $26/40=0.65$ GB；embedding 与输出头另计。八卡 FULL_SHARD 下，每个 block 的本地参数 shard 约 81.25 MB，一次 ring all-gather 每 rank 发送约 568.75 MB。有效带宽为 80 GB/s 时，下界约 7.1 ms。若单 block forward 为 9 ms，按 block wrap 可以用上一块计算遮住下一块聚合。

若把四个 block 合成一个 wrap 单元，完整参数变成 2.6 GB，一次聚合发送约 2.275 GB，下界约 28.4 ms；四块计算约 36 ms，仍有重叠空间，collective 次数从 40 次降到 10 次。代价是当前与预取组同时存在时，参数临时峰值从约 1.3 GB 增到 5.2 GB。若显存余量只有 3 GB，四层一组即使带宽效率更好也无法运行；两层一组的 2.6 GB 峰值更合适。

实际选择可以先记录每层参数字节与 forward/backward 时间，再把相邻层合并，直到“当前完整组 + 预取组 + 梯度 buffer”接近显存预算但仍留出 allocator 和通信 workspace 余量。随后用 profiler 验证 all-gather 是否落在预期计算窗口、reduce-scatter 是否与下一次 gather 争用，以及 rank 间是否有晚到者。仅凭参数量平均切组会忽略 embedding、MoE expert 或共享参数造成的极端大组。

## 7. mixed precision 会产生哪几份参数

FSDP 的参数计算 dtype、梯度规约 dtype 与 buffer dtype 可以分别设置。常见配置让 forward/backward 使用 BF16 参数，reduce-scatter 也用 BF16，而 optimizer 保留 FP32 master state。本地长期状态依旧可以按“BF16 参数 shard + BF16 梯度 shard + 三份 FP32 optimizer 相关状态”估成 16 byte/parameter；unshard 的完整参数 buffer 则按 BF16 的 2 byte/parameter计算。

如果把梯度规约改成 FP32，400M 参数单元的完整梯度通信输入从 800 MB 增到 1.6 GB。八卡 ring reduce-scatter 每 rank 的发送量由 700 MB 增到 1.4 GB；100 GB/s 的带宽下界从 7 ms 增到 14 ms，gradient buffer 峰值也相应翻倍。这样做可能改善数值稳定性，却不能沿用 BF16 的通信账本。`keep_low_precision_grads` 等配置还会影响 optimizer 看到的梯度 dtype，应在更新前直接记录本地 shard 的 dtype 与字节数。

参数混合精度还存在两类完整 buffer。训练计算用的 unsharded buffer 可以是 BF16；在某些训练外操作中召回完整参数，框架可能需要全精度完整 buffer。7B 模型的 BF16 全量为 14 GB，FP32 全量为 28 GB。若保存或检查代码意外请求全精度完整参数，原本按 14 GB 预留的空间会立刻少 14 GB。完整参数上下文是否把结果移到 CPU、是否只在 rank 0 保留，以及退出时能否立即释放，都会改变峰值位置。

buffer 通常不参与分片，BatchNorm 的 running statistics 或用户注册的大型 persistent buffer 会在每个 rank 上复制。假设模型参数分片后每卡 14 GB，却另有 3 GB 未分片 buffer，那么模型相关常驻量是 17 GB，而非公式中的 14 GB。对模型逐项统计 parameter 与 buffer，才能发现这类账外副本。

## 8. 共享参数和嵌套单元需要唯一所有者

输入 embedding 与输出 projection 经常共享权重。这个张量只能归属于一个 FSDP 单元；两个嵌套单元各自 flatten 或分片同一存储，会造成重复 all-gather、更新两次或视图失效。FSDP1 的 flat parameter 元数据会为共享参数记录 primary owner，其他引用在 unflatten 时恢复到同一完整视图。设计 wrap policy 时，权重共享的两个模块最好落在能够统一管理该参数的边界内，或者明确忽略并由外层管理。

可以做一个数值检查：共享矩阵含 100M BF16 参数，完整大小 200 MB。正确归属下，八卡本地 shard 合计仍为 200 MB，每次聚合每 rank 发送约 175 MB。若 profiler 显示两个不同 FSDP 单元各发起一次 175 MB 聚合，而且 optimizer 中出现两个对应状态条目，应检查共享关系是否在包装或模型改写中被打断。保存并加载后还要验证两个模块的参数对象或底层存储继续共享，否则训练语义会在 checkpoint 边界改变。

嵌套 FSDP 的执行顺序也决定峰值。外层根单元只应管理未被内层单元领取的参数。自底向上包装时，40 个 block 各有自己的通信组，根单元再管理 embedding 与输出头；若反过来先让根单元领取整个参数树，内层就失去独立分组的意义。FSDP2 官方文档把这种“先 layer、后 root”的顺序写进用户约定，因为一次 `fully_shard()` 会排除已经由子模块分组的参数。

## 9. 从 profiler 事件还原一层参数的旅程

一次可解释的 profile 至少需要 CUDA kernel、collective、CPU hook 和显存曲线。选择一个 FSDP 单元，为 forward pre-hook、模块计算、post-forward、pre-backward、反向计算和 post-backward 标出时间区间，再把 all-gather 与 reduce-scatter 对齐。FULL_SHARD 正常顺序应出现：forward all-gather、forward compute、释放；backward all-gather、backward compute、reduce-scatter、释放。少一次 backward gather 可能是 `SHARD_GRAD_OP` 或关闭了 forward 后 reshard，并不一定是优化器漏通信。

一份 profile 显示某层 all-gather 自身耗时 8 ms，计算流在进入该层前又等待 5 ms。前一层只有 3 ms 计算窗口，说明这 5 ms 来自通信没有被遮住。另一份记录中，前一层计算持续 12 ms，all-gather 却到末尾才发起，此时应检查 hook 顺序、CPU 调度或预取配置。若通信已提前发起，耗时仍从 8 ms 膨胀到 20 ms，排查范围转向同链路的 TP 通信、reduce-scatter 和 rank 晚到。

显存则在六个采样点记录：迭代开始、当前组 unshard 后、下一组 prefetch 后、forward reshard 后、backward unshard 后、reduce-scatter 后。当前完整组增加 800 MB、预取后再增 1 GB，符合账本；post-forward 后仍保留 1.8 GB，说明策略未 reshard、参数被外部引用，或 allocator 只把存储计入 reserved 而没有归还驱动。此时同时查看 allocated 与 reserved：allocated 下降而 reserved 不降属于缓存行为，二者都不降才说明活跃张量仍在。

rank 间到达时间也要分开记录。七个 rank 在 10 ms 时进入 collective，一个 rank 在 25 ms 才进入，其余 rank 显示的 15 ms 等待来源是慢 rank 上游计算或数据输入。只看 NCCL 区间容易把它误判为网络带宽不足。固定输入并分别屏蔽数据加载、activation checkpoint 与 CPU offload，可以逐项缩小晚到来源。

## 10. state dict 的三种视图对应不同边界

FSDP1 的完整、分片与本地 state dict 处理的是同一组训练状态，却服务于不同消费方。完整 state dict 把原始参数名对应的完整 Tensor 恢复出来，适合导出、单卡推理或交给不了解 FSDP 的工具。它需要聚合参数，70B BF16 模型的完整权重约 140 GB；若所有 rank 都在 GPU 上保留一份，保存过程会先因显存耗尽而失败。

`FullStateDictConfig(offload_to_cpu=True, rank0_only=True)` 把完整结果卸到 CPU，且只让 rank 0 返回非空结果，避免每个 rank 都复制 140 GB。不过 rank 0 的主机内存仍要容纳完整权重，参数从各 rank 汇入 CPU 的时间也不能省略。若机器只有 128 GB 可用内存，70B BF16 加上 Python 对象、序列化缓冲和 optimizer state 仍可能越界。rank0-only 解决重复副本，不会压缩单份 checkpoint。

分片 state dict 让每个 rank 输出全局 Tensor 的一部分，并携带分片元数据，适合 Distributed Checkpoint 并行写入和变更 world size 后重分片。八卡保存 70B BF16 时，理想值约 17.5 GB/rank；写入总量仍是 140 GB，但网络与文件系统负载可分散。本地 state dict 更贴近运行时 local shard，常含 flat parameter 的本地表示，对当前进程布局恢复很快，却与 wrap policy、world size 和实现版本绑定更紧，不宜当成通用交换格式。

保存边界还包括 buffer 与额外状态。只保存 parameter 而漏掉 BatchNorm buffer、随机数生成器、loss scaler、scheduler 和数据采样位置，恢复后即使权重逐元素一致，下一步也可能不同。最小恢复测试应在第 $k$ 步保存，重新创建进程组与 optimizer，加载后执行第 $k+1$ 步，再和不中断运行比较 loss、参数 shard 与 optimizer step。

## 11. optimizer state 必须随参数布局一起转换

AdamW 的状态通常比 BF16 参数大：FP32 master、$m$ 与 $v$ 共 12 byte/parameter。7B 模型约 84 GB，不能先在每个 rank 上生成完整 optimizer state 再切分。FSDP1 提供 optimizer state dict 的转换接口，把 flat parameter 键映射回原参数名，或把待加载的完整/分片状态重新映射到当前 flat shard。optimizer 必须在 FSDP 包装或 `fully_shard` 完成后基于最终参数对象创建，否则参数引用与状态所有者可能错位。

改变 wrap policy 也会改变 flat parameter 的分组。旧 checkpoint 按四层一组保存，新训练按一层一组恢复时，不能按旧 flat key 直接赋值；转换要依赖原始 FQN、形状和全局 offset。可用一个小模型做断点验证：连续训练四步得到参数 $\theta_4$；另一条路径训练三步、保存参数和 optimizer state、换 wrap policy 加载后再走一步，最终参数与 $\theta_4$ 在容差内一致。只比较加载瞬间参数无法发现 $m,v$ 错位。

新代码更适合采用 Distributed Checkpoint 与统一的 distributed state-dict 接口，尤其是 FSDP2 的 DTensor 参数。旧的 FSDP1 `state_dict_type` 上下文仍常见于已有工程，但迁移时要记录 PyTorch 版本与产生 checkpoint 的 API；不要在同一恢复路径里凭文件名猜测 full、sharded 或 local 格式。

## 12. meta device 初始化避免“分片前先爆一次”

大模型可以先在 meta device 上创建只有形状、没有真实存储的参数，再由 FSDP 的 `param_init_fn` 在目标设备 materialize。初始化函数应只初始化传入模块自己的参数，递归初始化整个子树可能让同一参数重复分配或重复随机化。初始化完成后立刻分片，GPU 无须出现一份完整的 70B 权重。

若只让 rank 0 从普通 checkpoint 加载参数，其他 rank 用空参数启动，可以启用 `sync_module_states=True` 广播 rank 0 的参数与 buffer。官方文档要求该同步走 GPU 通信，因此模块必须已在 GPU 上，或通过 `device_id` 指定 CUDA 设备。以 7B BF16 为例，广播的全模型字节约 14 GB；它节省的是各 rank 重复读盘，并未消除初始化通信。每个 rank 独立从共享文件系统读取分片时，则要比较存储并发带宽与一次广播的代价。

随机初始化路径也要测试确定性。单卡完整初始化后切八份，与八卡 meta 初始化后重组的参数应该满足项目定义的复现标准。若初始化随机流按 rank 前进，world size 从 8 改为 16 时，即使 seed 不变也会生成另一组参数。按参数 FQN 与全局 offset 派生随机流，可以让分片布局变化时仍对应同一逻辑权重。

## 13. DeviceMesh 把 FSDP 与 TP 放到二维坐标

在二维 DeviceMesh 中，一维负责复制或分片数据并行，另一维负责 tensor parallel（TP）。设总卡数 $W=D\times T$。原始参数先按 TP 切成 $1/T$ 的算子 shard，再由 FSDP 在具有相同 TP 坐标的 $D$ 个 rank 之间切分。每 rank 的理想常驻模型状态约为 $16\Psi/(DT)$，FSDP all-gather 恢复的是本 rank 的完整 TP shard，不是原始完整矩阵。

64 卡训练 70B，$D=8,T=8$ 时，模型状态下界约 17.5 GB/rank。一个原始 2 GiB 权重经 TP 后为 256 MiB，FSDP 八卡 all-gather 每 rank 发送约 224 MiB。若误把 64 当作 FSDP group size，会算出约 1.97 GiB 的发送量，差近九倍。profile 中每个 collective 都应标注 mesh dimension，确认 DP 组成员拥有相同 TP 坐标。

FSDP2 的二维 mesh 可表示 replicated 与 sharded placement；当前文档还允许 `reshard_after_forward` 使用整数，把 forward 后参数 reshard 到较小 mesh。部署前要锁定实际 PyTorch 版本，因为 FSDP2 仍在快速演进，构造参数与 state-dict 能力可能变化。教程中的主干语义可以沿用，实验配置则应保存完整 API 参数。

## 14. compile 与 activation checkpoint 都会改 hook 边界

FSDP1 与 `torch.compile` 组合时，官方文档要求 `use_orig_params=True`。编译捕获的图、参数视图切换和 FSDP hook 必须按受支持顺序发生；直接调用 `module.forward()` 还可能绕过框架注册在 `__call__` 上的 pre-forward hook。FSDP2 文档同样提醒调用模块对象；自定义 forward 入口需要注册为 FSDP forward method，或者显式 `unshard()`。

Activation checkpoint 在 backward 重算 forward。它与 FSDP 单元边界不一致时，重算可能触发额外参数 all-gather，或者让完整参数存活时间超过预期。一个 block 的正常 FULL_SHARD 每步有两次参数 gather；profile 显示三次或更多时，应把重算区间与 FSDP hook 对齐。对同一 block 同时做细粒度 FSDP wrap 与更粗的 checkpoint，可能用较低 activation 换来更多通信。

可以用计数单测守住边界：固定两层模型和一次迭代，记录每个 FSDP 组的 all-gather、reduce-scatter 次数；分别开启 compile 与 checkpoint，确认 loss/参数更新一致，并把新增 collective 解释到具体重算。图编译成功只说明程序能运行，不保证通信次数和 eager 路径相同。

## 15. 生命周期检查表与故障注入

| 时刻 | 参数视图 | 梯度视图 | 主要动作 | 预期检查 |
| --- | --- | --- | --- | --- |
| step 开始 | 本地 shard | 空 | optimizer 已更新 | 各 rank 参数版本一致 |
| pre-forward | 完整组 | 空 | all-gather | 字节与组大小相符 |
| post-forward | shard 或完整组 | 空 | 按策略 reshard | FULL_SHARD 已释放完整 buffer |
| pre-backward | 完整组 | 空 | backward all-gather/prefetch | 顺序与 autograd 对齐 |
| post-backward | shard | 本地 shard | reduce-scatter | 平均因子只应用一次 |
| optimizer step | 新参数 shard | 本地 shard | 更新 $m,v$ | overflow 决策全组一致 |

单 rank 出现 Inf 时，整个通信组必须得到相同 overflow 决策并共同跳过更新。这项测试检查 loss scaling 的控制流是否经过全局规约。

跨规模恢复测试在四卡保存、八卡加载，随后比较完整 gather 后的参数与下一步更新。它覆盖 checkpoint 元数据、reshard 和 optimizer state 转换三条路径。

还可在 optimizer step 后计算每个 shard 的校验和，再通过 all-gather 组成全局摘要。某一层从第 $k$ 步开始分叉，结合该层 gather/reduce-scatter 次数，可以定位参数所有权、梯度平均或 checkpoint 恢复错误。校验和只用于发现差异；浮点规约顺序可能带来微小数值偏差，最终仍应使用带容差的逐元素比较和 loss 轨迹判断。

## 16. 当前 API 迁移时保留两套心智模型

已有 FSDP1 工程仍需理解 FlatParameter、wrap policy、sharding strategy 和 state-dict 上下文；新工程评估 FSDP2 时，应转向 DTensor 参数、bottom-up `fully_shard()`、`reshard_after_forward` 和 Distributed Checkpoint。迁移不是把构造函数名字替换掉：optimizer 创建时刻、完整参数访问方式、state dict 格式、混合精度对象和 prefetch 配置都要逐项映射。

迁移基线可用同一小模型与 batch 分别运行 FSDP1、FSDP2，比较 loss、一步更新、参数 FQN、checkpoint 恢复和 collective 次数。语义一致后，把真实模型的一层放大测试峰值，再扩大 world size。API 迁移造成的差异由小规模测试暴露，大规模阶段便可集中检查网络与内存。

## 17. 官方来源对应表

| 主题 | 官方依据 | 本文使用位置 |
| --- | --- | --- |
| FSDP1 分片策略与参数 | `FullyShardedDataParallel` 文档 | FULL_SHARD、SHARD_GRAD_OP、`limit_all_gathers` |
| FlatParameter 存储切换 | `_flat_param.py` | shard、完整 flat buffer 与原参数视图 |
| hook 与预取顺序 | `_runtime_utils.py` | forward/backward 生命周期 |
| FSDP2 DTensor 契约 | `fully_shard` 文档 | bottom-up 分组、reshard 与 optimizer |
| 分布式保存 | Distributed Checkpoint 文档 | 分片 state dict 与跨规模加载 |
| 二维并行 | DeviceMesh/DTensor 文档 | FSDP 与 TP 通信组 |

## 参考资料

- [PyTorch FSDP2 `fully_shard` 官方文档](https://docs.pytorch.org/docs/stable/distributed.fsdp.fully_shard.html)
- [PyTorch FSDP1 官方文档](https://docs.pytorch.org/docs/stable/fsdp.html)
- [PyTorch `FlatParameter` 源码](https://github.com/pytorch/pytorch/blob/main/torch/distributed/fsdp/_flat_param.py)
- [PyTorch FSDP 运行时源码](https://github.com/pytorch/pytorch/blob/main/torch/distributed/fsdp/_runtime_utils.py)
- [PyTorch Distributed Checkpoint 官方文档](https://docs.pytorch.org/docs/stable/distributed.checkpoint.html)
- [PyTorch DeviceMesh 官方文档](https://docs.pytorch.org/docs/stable/distributed.html#devicemesh)
