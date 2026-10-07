---
title: "Olmo-core 3: 为 MoE 重写的训练栈, 从 FSDP 换到 DDP 加专家并行"
category: "模型库"
tags: ["OLMo", "技术解析"]
published: true
excerpt: "Olmo-core 3 把 MoE 训练从全重分片 FSDP 换到 DDP, 再叠加分布式优化器, rowwise 专家并行, 流水线并行与 MXFP8, 让吞吐几乎不随专家数下降. 报告同时给出路由容量, 负载均衡损失被模型绕开的反例, 以及几种试过但没采用的重叠方案."
---

# Olmo-core 3: 为 MoE 重写的训练栈, 从 FSDP 换到 DDP 加专家并行

来源: 同目录 [对照译稿](01-olmo-core-3-bi.md) ([Supercharging Olmo-core for Efficient and Scalable MoE Training](https://allenai.org/papers/olmocore3), Ai2, 2026-10, 168 页). 这是一份训练系统报告, 没有发布新模型. 代码在 [allenai/OLMo-core](https://github.com/allenai/OLMo-core), MoE 部分集中在 `src/olmo_core/nn/moe/v2/`. 同期博客 [Olmo-core 3](https://huggingface.co/blog/allenai/olmocore3) 给了几组对外数字. 直接前作是 [Olmo 3 解读](../1.5-olmo-3/02-olmo-3-analysis.md) 里的稠密 FSDP 训练栈; 同一家族的架构实验见 [Olmo Hybrid 解读](../1.8-olmo-hybrid/02-olmo-hybrid-analysis.md).

一句话身份: Olmo-core 3 是 Ai2 为 MoE 预训练重写的执行路径. 它以 **DDP** 为数据并行底座, 叠加 **分布式优化器**, **专家并行 (EP)** 和 **流水线并行 (PP)**, token 搬运改用基于 NVSHMEM 对称内存的 **rowwise EP**, 并去掉了前向路径上的 host 同步. 在 8 张 B300 上, 激活 3.2B 的模型从 4.6B 总参数扩到 47B, 吞吐从 54.5K 降到 52K token/s/GPU; 最大配置 1.2T 总参数, 58B 激活, 在 512 张 B300 上随机路由跑到每卡 858 TFLOP/s. MoE 的基础推导见 [2.6 MoE](../../../llm-guide/2-核心原理与架构/2.6-MoE/2.6-MoE.md), 系统侧背景见 [6.1.8 MoE 系统与并行](../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/6.1.8-MoE系统与并行.md).

## 1. MoE 让稠密训练栈多付两种成本

### 1.2. 总参数和激活参数分开以后

一个 MoE 层对 token $t$ 的输出是 $y_t=\sum_{e\in S_t}p_{t,e}f_e(x_t)$ (eq. 1). 这里 $x_t$ 是进入该层的隐状态, $f_e$ 是第 $e$ 个专家 (一个 FFN), router 给出概率 $p_{t,e}$, 再选出 $K$ 个专家组成集合 $S_t$, 而总专家数 $N$ 远大于 $K$. 设每个专家有 $P_{expert}$ 个参数, attention, 嵌入, 共享专家这些每个 token 都要经过的部分合计 $P_{always}$, 那么 $P_{total}=P_{always}+NP_{expert}$, $P_{active}=P_{always}+KP_{expert}$ (eq. 2). 报告定义两个比值: 专家激活率 $\alpha_E=K/N$, 参数激活率 $\alpha_P=P_{active}/P_{total}$ (eq. 3).

Table 1 列出的近期模型里, $\alpha_P$ 一路往下走. DeepSeek-V3 是 671B 总参数 37B 激活, 5.51%; DeepSeek-V4-Pro 是 1.60T 与 49B, 3.06%; Qwen3-235B-A22B 是 9.36%, Qwen3.5-397B-A17B 降到 4.28%; Kimi K3 用 896 个路由专家选 16 个, 2.80T 总参数, 104B 激活, 3.71%. 计算量跟 $P_{active}$ 走, 显存和要搬的状态却跟 $P_{total}$ 走, 这两条曲线越拉越开. 报告把算法收益写成 $\rho_H=(F_{MoE}/F_{dense})(R_{dense}/R_{MoE})$ (eq. 4), 其中 $F$ 是到达同一质量所需的每 token FLOPs, $R$ 是实际每秒处理的 token 数. 第一个因子是模型侧的省算力, 第二个因子是系统侧的吞吐损失; 系统做不好, 第二个因子会把第一个吃掉. Fig. 3 的示意算例里, 同样 2 倍的 FLOP 优势, MoE 步长是稠密的 1.85 倍时墙钟只快 $2/1.85\approx1.08$ 倍, 压到 1.2 倍时快 $2/1.2\approx1.67$ 倍.

单卡上的 GEMM 也会受影响. 附录 A 的 roofline 模型固定 token 数 $T$, 输入宽度 $d$ 和有用 FLOPs: 稠密 FFN 的隐藏宽度是 $Kh$, MoE 有 $E$ 个 (即前文的 $N$) 宽 $h$ 的专家, 每个 token 选 $K$ 个, 两者一对 up/gate 与 down 投影都是 $6TKdh$ FLOPs (eq. 92). Table 43 数 HBM 读写: 权重读取稠密是 $6Kdh$ 字节, MoE 是 $6Edh$, 多出 $E/K$ 倍; 均衡路由下每个专家只分到 $M_e=TK/E$ 行, 一次专家投影的算术强度约等于 $M_e$ FLOP/字节 (eq. 90). 取 $E=64$, $K=4$, 权重读取是稠密的 16 倍, 每份权重只被 $T/16$ 个 token 复用. batch 小时 MoE 的 GEMM 更早撞上带宽上限, batch 足够大后两者都能到计算上限. 这是一个只算两次 GEMM, 假设无缓存复用的上界模型, 不包括通信和反向.

### 1.2. capacity tax 和 runtime tax

报告把 MoE 一步的时间拆成 $T_{step}=T_{model}+T_{tax}$ (eq. 5). $T_{model}$ 是激活参数本身的计算, $T_{tax}$ 是 MoE 多出来的部分, 又分两类. **capacity tax** 来自 $P_{total}$: 权重, 梯度, 优化器状态, checkpoint, 以及 FSDP 下反复 all-gather 的权重, 规模由容量差 $\Gamma_{capacity}=P_{total}/P_{active}=1/\alpha_P$ (eq. 6) 决定. **runtime tax** 来自路由: router 计算, token 发往专家所在 rank 的 dispatch 与回收的 combine, 按专家重排, 变长的专家 GEMM, 以及为了知道每个专家收到多少行而产生的 host 同步.

两类成本要用不同手段处理. capacity tax 靠切分状态, 也就是让每张卡只存一部分参数和优化器状态; runtime tax 靠改执行路径, 也就是让 dispatch 不经过多次重排, 让 CPU 不用等 GPU 回传计数. 报告后面的章节基本按这两条线展开: §3 到 §7 处理状态放在哪, §5 的 rowwise EP 和 §8, §9 的无同步路径处理每步执行.

![](images/p14-figure-4-throughput-as-total-expert-capacity-grows-at.jpg)

> 图 1: 总专家容量增长时, 旧 FSDP 栈与新 DDP + EP 栈的单卡吞吐变化, 横轴为总参数量, 纵轴为 token/s/GPU.

**图 1 解析** (报告 Figure 4): 8 层模型, top-4, 8 张 B300, 随机路由, 激活参数固定 3.2B, 横轴是总参数. 旧 FSDP 栈从 4.6B 的 50.5K token/s/GPU 一路掉到 47B 的 19.4K; 新栈 (DDP + EP8) 从 54.5K 只降到 52K, 降幅约 4.6%. 稠密基线从 61K 到 63K, 说明新旧之差主要来自 MoE 路径. 博客里 「47B 下快约 2.7 倍」 就是 52K 对 19.4K. 这张图比较的是两套完整系统, 并没有单独隔离 FSDP 与 DDP 的作用, 单独对照在 Fig. 8.

**在 Olmo 谱系里的位置。**

[Olmo 3](../1.5-olmo-3/02-olmo-3-analysis.md) 的稠密模型用 OLMo-core 的 FSDP 栈训练, 在 H100 上 7B 每卡 7700 token/s, 32B 每卡 1960 token/s, 约 43% 与 41% MFU. 稠密模型每个参数在每个 token 上都参与计算, 每次 all-gather 来的权重都会被完整用到, FSDP 的通信能摊开. MoE 下每个 token 只用到 $K/N$ 的专家权重, 但 FSDP 仍要把整层专家权重 gather 回来, 这部分通信随 $P_{total}$ 增长, 有效计算只随 $P_{active}$ 增长, 这就是 Fig. 4 中旧栈掉速的来源.

Olmo-core 3 于是另起了一条 MoE 路径, 代码里的 EP 后端由 [`ep_config.py`](https://github.com/allenai/OLMo-core/blob/main/src/olmo_core/nn/moe/v2/ep_config.py) 里的 `ExpertParallelPath` 选择: `sync_1d` 是带同步的 all-to-all, `rowwise_nvshmem` 是生产用的 rowwise 路径, `deepep_v2` 用于跨节点, `rowwise_wave` 标注为实验性, 不建议训练使用. 博客说下一代 Olmo 模型会采用 MoE, 并且会是 Olmo 系列数据最多, 上下文最长的一代, 但没有给出规模数字.

### 1.1. 并行: DDP 打底, 分布式优化器, EP 和 PP 各切一份状态

**FSDP 每个 microbatch 搬一次权重, DDP 每步同步一次。**

记一张卡上的参数量为 $P_{local}$, 一个优化器步含 $m$ 个 microbatch, 每个 microbatch 有 $b$ 个 token. 有效计算是 $W_{useful}\propto mbP_{active}$ (eq. 7). DDP 在 microbatch 之间只在本地累积梯度, 每步做一次梯度归约, 通信量 $\propto P_{local}$; 采用全重分片的 FSDP 在每个 microbatch 的前向和反向都要 all-gather 权重, 用完释放, 通信量 $\propto mP_{local}$. 稠密模型里 $P_{local}$ 与 $P_{active}$ 差不多, FSDP 的通信可以被计算盖住; MoE 里 $P_{local}$ 跟着 $P_{total}$ 涨, 而 $mbP_{active}$ 不变, 两者之比会变差.

Fig. 8a 关掉 EP 做了对照: 48 个专家, 约 3.2B 激活, 19B 总参数, 全局 batch 从 128Ki 扩到 4Mi token. DDP 的 MFU 从 25.2% 升到 41.4%, FSDP 只从 26.4% 升到 29.8%, 因为 batch 变大时 FSDP 的 microbatch 数 $m$ 也变多, 每个 microbatch 都要再 gather 一遍. Fig. 8b 固定 batch, 把总容量从 4.6B 扩到 47B: 不带 EP 的 DDP 在 64 和 128 个专家时显存溢出, FSDP 的 MFU 随容量持续下降, DDP + EP8 保持在 42% 到 44%. 报告脚注提到 FSDP2 可以设置为在梯度累积窗口内不重分片, 这样会接近 DDP 加分片优化器的行为, 正文的对照用的是全重分片, 两者的差距因此是这个配置下的差距.

**每个参数 18 字节怎么切。**

![](images/p26-figure-9-the-distributed-optimizer-and-ep-reduce-different.jpg)

> 图 2: DDP, 分布式优化器与 EP 对权重, 梯度和 AdamW 状态采用不同切分轴后的单参数显存组成.

**图 2 解析** (报告 Figure 9): 朴素 DDP 每个参数存 BF16 权重 2 字节, FP32 梯度 4 字节, FP32 主权重 4 字节, AdamW 两个 FP32 矩 8 字节, 共 18 字节. 分布式优化器把后三项按数据并行度 $D$ 切开, 变成 $6+12/D$ 字节. 再叠加 EP, 专家的 BF16 权重和 FP32 梯度按专家并行度 $M_E$ 切开, 专家参数变成 $6/M_E+12/D$ 字节. 图中例子 $D=8$, $M_E=4$, 专家参数每个只要 $1.5+1.5=3$ 字节.

分布式优化器按张量切分 (per-tensor), 每个张量在 $D$ 个 rank 上各拿一段; 太小或者元素数不能被复制组大小整除的张量保持复制, 这会少省一些显存. Megatron-LM 的 DistributedOptimizer 按桶切, 一段区间可能从某个参数中间切开, 需要额外把桶片段映射回参数片段; 逐张量切时映射只在一个张量内部, 更新, 重建和 checkpoint 视图都可以直接定位. 梯度通过 post-accumulate hook 写进 FP32 的桶视图, 归约也在 FP32 里做. 实现类是 `MultiGroupDistributedDataParallel`: 稠密参数和专家参数的复制组不同 (专家只在 EP-DP 组内复制), 所以每个参数挂在自己的复制组上, 桶只在复制组和数据类型都相同的参数之间组建. 末项 microbatch 结束时按固定顺序发起剩余的桶归约, 窗口前段出现过, 末段没被路由到的专家, 梯度也会保留. 集合通信和权重重建放在被编译的优化器更新之外. AdamW 的两个矩保持 FP32, 而 DeepSeek-V3 和 Megatron 用 BF16 矩, 这一项上 Olmo-core 3 的矩显存是后者的两倍.

MXFP8 开启时还多一份派生状态: `FP8WeightStore` 维护前向和 dgrad 用的两份 MXFP8 权重缓存, 在优化器更新后刷新, 不进入 checkpoint, 大小见 5.1.

**EP 的两个组, 以及 PP 怎么摆。**

EP 把数据并行组再拆成两维: $\mathcal G_{DP}=\mathcal A_{EP\text{-}MP}\times\mathcal A_{EP\text{-}DP}$ (eq. 8), 也就是 $D=M_ED_E$. EP-MP 组内 $M_E$ 个 rank 各持有一部分专家, token 在组内 dispatch 和 combine; EP-DP 组内 $D_E$ 个 rank 持有同一批专家的副本, 做梯度归约. 每个 rank 的专家权重和梯度约为 $P_E/M_E$ (eq. 9), $P_E$ 是专家参数总量. 每个 rank 要处理的路由行数约为 $TK$ ($T$ 为本 rank 的 token 数), 和 $M_E$ 无关, 因为发出去多少行, 平均就收回多少行. Table 6 在 8 张卡上对比: 不开 EP 时 53,512 token/s/GPU, 峰值显存 129.3 GiB; 用 block all-to-all 的 EP8 时 54,063 token/s/GPU, 77.85 GiB, 显存少了 51.45 GiB, 吞吐没有损失.

PP 再按层切: 每个 stage 的参数约为 $P_{local}\approx\frac1P(P_{dense}+P_E/M_E)$, $P$ 为流水线并行度. 调度用 interleaved 1F1B, 反向不拆成 dgrad 和 wgrad 两段, 便于 `torch.compile`; DualPipe 和 zero-bubble 一类调度没有采用. 1F1B-V 把 stage $r$ 和 $2P-1-r$ 放在同一个 rank 上. Table 10 在 PP4, 8 个 microbatch 下对比: 环形放置时四个 rank 上活跃的激活份数是 11, 9, 7, 5, V 形放置时每个 rank 都是 6; 代价是 bubble 从 15.8% 升到 23.8%. 末项 stage 少放一个 block (32 个里放 31 个), 用来抵消 LM head 的计算.

这些份数是调度上的峰值计数, 报告特意注明它们不是 GiB: 不同 stage 保留的激活大小不同, 开重算后留下的值也会变.

硬件映射上, 设备网格顺序是 PP, DP, CP, MoE 视图再把 DP 拆成 EP-DP × EP-MP, EP-MP 放在最内层. 以 8 卡节点为例, EP-MP 组是 [0,1], [2,3], …, EP-DP 组是 [0,2], …, PP 组是 [0,4], …. 开上下文并行 (CP) 时, 稠密层把每个 stage 的 rank 看成 $D\times C$ ($C$ 为 CP 度), MoE 层把同一批 rank 重新折叠成 $D_E\times M_E$, 满足 $DC=D_EM_E$ (附录 F, 即 Megatron-Core 的 MoE parallel folding). 例如 4 张卡在稠密视图里是 $D=2$, $C=2$, 在 MoE 视图里可以是 $D_E=1$, $M_E=4$, 不必为每个 CP 坐标再配一组 4 卡的专家组. CP 用 Ulysses 形式, attention 前后各做一次 all-to-all, 在序列切分和按头切分之间转换布局, 这部分通信折叠后仍然存在. B300 节点内 8 卡走 NVLink, 节点间每卡一条 800G XDR InfiniBand. EP8 刚好落在 NVLink 域里; EP 超过 8 就要跨节点, payload 走 GPUDirect RDMA, 并用 IBGDA 让 GPU 直接提交传输, 这一段由 DeepEP v2 承担.

放置优先级按通信频率定 (Table 11). DDP 的梯度归约单次字节数可能最大, 但每个优化器步只做一次, 多个 microbatch 分摊; EP-MP 的 dispatch 和 combine 在每个 MoE 层, 每个 microbatch 的前向和反向都要做, 对延迟和小消息敏感, 所以放在最内层; PP 的激活传递发生在每个 stage 边界. 四类通信用的库也不同: DDP 和 EP-DP 归约用 NCCL 集合通信, PP 用 NCCL 点对点, block all-to-all 用 NCCL all-to-all, rowwise EP-MP 用 NVSHMEM. 报告提醒, NVL72 机柜能把更大的模型并行组留在 NVLink 内, 与这里的 NVL8 结果不能直接对比; 反过来, 这批节点每卡一条 XDR 网卡的配置偏宽裕, 可能让跨节点方法显得比在普通集群上更好. 加 microbatch 能摊薄 DDP 的步边界通信, 却不减少 EP 和 PP 的通信次数, 改一个 batch 参数可能缓解一个通信轴, 同时让另一个更频繁.

## 2. token 怎么搬, 以及怎样不让 CPU 等 GPU

**block all-to-all 的重排和 host 计数?**

EP 的基线路径用 `all_to_all_single`. 这个集合通信要求发给每个 peer 的数据在内存里是连续的一块, 因此 dispatch 前要先把路由行按目标 rank 排好 (local permute), 交换后再按本地专家顺序排一遍 (global permute), combine 时反过来再做两次. 一个 MoE 层的前向最多有四次显式的布局转换. 另外, `all_to_all_single` 需要 host 端的 split 列表, 也就是发给每个 peer 多少行, 而这个数只有 GPU 上的 router 算完才知道, CPU 必须先把计数拷回来.

报告 Table 7 给了一个 trace 实例. block 路径的 dispatch 是 local permute 0.351 ms, all-to-all 1.960 ms, global permute 0.532 ms; combine 是 global unpermute 0.712 ms, all-to-all 1.970 ms, local unpermute + merge 0.391 ms; 两侧合计 5.916 ms, 中间的 grouped GEMM 是 3.630 ms. rowwise 路径的 dispatch (含 route map 构建) 是 2.298 ms, combine (含加权归约) 是 2.423 ms, 合计 4.721 ms, 比 block 路径少约 20%. 报告注明两条 trace 采自不同节点, 只能当机制证据, 不算受控对比; 而且 block 路径的数字里没算 host 等待 split 列表的时间.

### 2.2. rowwise EP: GPU 上的路由表和单边读写

![](images/p36-figure-16-rowwise-ep-targets-remote-expert-rows-without.jpg)

> 图 3: Rowwise EP 根据 router 输出把 token 行直接写入远端专家容量槽, 再由 grouped GEMM 处理各专家收到的行.

**图 3 解析** (报告 Figure 16): 两个 rank, 各 5 个 token, top-2, 4 个专家 (W0, W1 在 rank 0, W2, W3 在 rank 1). router 输出的专家下标和权重留在 GPU 上, rowwise kernel 直接把每一行写进目标 rank 上按专家排好的容量槽, grouped GEMM 不再需要第二次重排. 图里的 rank 容量是 $1.2\times5\times2=12$ 行, 由所有来源 rank 共享. 「AllToAll」 只表示逻辑上的 rank 交换, 实现是逐行的单边读写, 没有调用 NCCL 集合通信.

具体做法是先在 GPU 上为每个路由构建两张表 `dst_ranks[T,K]` 和 `dst_rows[T,K]`: 第 $t$ 个 token 的第 $k$ 个路由去哪个 rank, 写到那个 rank 容量缓冲区的哪一行; 负值表示这条路由无效或被丢弃. 有了目标地址, 就需要能直接寻址远端显存. NVSHMEM 的对称堆让 EP-MP 组内每个 rank 以相同顺序分配形状相同的缓冲区, 本地偏移加 peer 编号就能定位远端对应的行. 每个 EP-MP 进程组就是 rowwise kernel 使用的 NVSHMEM bootstrap world.

读写方向按 Table 8 固定: 前向 dispatch 用 PUT (源 rank 把行写到远端专家槽), 前向 combine 用 GET (源 rank 把专家输出读回到自己的 token 位置), 反向时方向对调, combine 的反向用 PUT, dispatch 的反向用 GET. 一个 token 的 $K$ 个副本要发往多个 rank, 由源端发起 PUT 可以在一个 kernel 里完成扇出. 直接放置还有一个好处: dispatch 时可以就地量化成 MXFP8, grouped GEMM 直接读量化数据和 scale, 中间不必再还原成 BF16.

**缓冲区复用和 lease。**

容量缓冲区按最大容量分配, 每次只有前缀的若干行是有效数据, 尾部可能留着上一次的旧值, 下游 kernel 只读有效前缀. grouped GEMM 直接在 dispatch 缓冲区上读输入, 而 Wgrad (权重梯度) 在反向时还要再读一次同样的输入, 所以 dispatch 缓冲区要一直活到这个 block 的 Wgrad 结束; 专家输出缓冲区只在 combine 之前有用, 可以当临时区. 如果所有 block 共用一块 dispatch 缓冲区, 前向按 block 1, 2, 3 的顺序写, 反向按 3, 2, 1 的顺序读, block 1 的 Wgrad 读到的就是 block 3 写进去的数据.

Olmo-core 3 用 **lease** 解决这个问题: 每个 block 前向时从缓冲池里领一个槽, 由 autograd 持有, 直到对应的反向用完才归还. 代码在 [`ep_no_sync_buffers.py`](https://github.com/allenai/OLMo-core/blob/main/src/olmo_core/nn/moe/v2/ep_no_sync_buffers.py) 的 `_NoSyncSymmLeasePool`. PP 下多个 microbatch 同时在途, 池子大小由 $H_s=\max_t(F_s-B_s)$ 决定, 其中 $F_s$ 和 $B_s$ 是 stage $s$ 到时刻 $t$ 为止已完成的前向数和反向数, 差值就是同时活着的前向数. 报告记录过一次 PP 与 EP 组合下的复用错误: BF16 训练时梯度仍是有限值, 只是错了, 没有任何报错; 换成 MXFP8 后才以梯度范数为无穷大的形式暴露出来.

**D2H 同步为什么会排空 GPU 队列。**

CPU 提交 kernel, GPU 执行 kernel, 两者通过 CUDA 队列解耦. 只要 CPU 跑在 GPU 前面, 队列里就有存货, 报告称这段余量为 submission headroom. 提交一个 microbatch 的时间约为 $T_{submit}\approx N_{launch}t_{launch}+T_{framework}+T_{bookkeeping}$ (eq. 11), 即 kernel 数乘单次 launch 开销, 加上 Python 和框架开销, 再加上路由簿记. GPU 执行时间 $T_{device}$ 随 microbatch 的 token 数 $b$ 增长, 而 $T_{submit}$ 基本不随 $b$ 变, 两者相等的位置是临界 microbatch 大小 $b_{crit}$ (eq. 12). $b<b_{crit}$ 时 GPU 等 CPU. GPU 越快, $T_{device}$ 曲线越低, $b_{crit}$ 越往右移, 从 H100 换到 B300 后, 原来够用的 microbatch 可能就不够了.

一次 D2H (device to host) 同步会让 CPU 停下, 等 GPU 把前面所有工作做完, 队列里的存货清空, 之后 GPU 要等 CPU 重新提交. Table 13 列出几种常见写法: `.item()`, `.cpu()`, `nonzero`, 以及 `torch.empty([int(x)])` 这种用 GPU 上的数决定张量形状的写法. 旧 MoE 路径每层有两次这样的等待: 一次取每个 peer 的行数给 all-to-all, 一次取每个专家的行数给旧版 grouped GEMM.

Table 14 列出去掉它们的三个改动: 路由元数据留在 GPU 上; 缓冲区按容量预分配形状, 用有效前缀表示实际行数; grouped GEMM 的累积偏移在 GPU 上算, 直接传给 kernel. 每个专家的行数在 EP-MP 组内用一次 all-gather 交换, 结果也留在 GPU 上. 这条路径没有用 CUDA Graph 捕获.

这三项各有代价, Table 14 也列了出来: 每个 MoE 层每个 microbatch 都要多跑几个元数据 kernel; 按容量预留的缓冲占显存, 超容量时要丢路由; grouped GEMM 后端必须接受 GPU 端偏移. 容量尾部虽然不进 GEMM, 但仍可能被逐元素 kernel 碰到, 报告为此写了只处理有效前缀的 SwiGLU kernel. 动态路由本身并不要求 host 同步, 要求同步的是把 GPU 结果交给 Python 解释的接口; 设备上的 index, gather, scatter 只要下标和形状都留在 GPU 上, 就不会阻塞. 共享专家的计算可以排在 host 等待之前提交, 让 GPU 在等待期间有活干, 但这只是把空泡盖住, all-to-all 仍要等计数到达 CPU 才能发起. 附录 B.5 截取的单 rank timeline 里, 8 层 BF16 EP8 带共享专家的开发模型在稳态没有出现 host 等待, 报告也说明这只是一个实例, 不覆盖初始化, 编译和预热阶段. PyTorch 的 `grouped_mm` 只有在 SM90 和 SM100 上接受 GPU 端偏移, 其他架构会退回 `offs.cpu()`, 重新引入一次同步.

**grouped GEMM 的形状和效率。**

SwiGLU 专家是 $f_e(x)=W_{down}(\mathrm{SiLU}(W_{gate}x)\odot W_{up}x)$ (eq. 13), 一个 rank 上 $N_{local}$ 个专家各收到 $M_e$ 行. 一种做法是把每个专家填充到同一容量 $C$ 后用批量矩阵乘 (BMM), 填充比例是 $\rho_{pad}=1-\sum_eM_e/(N_{local}C)$ (eq. 14); 报告取 $C=8\lceil\lfloor c\bar M\rfloor/8\rceil$ (eq. 16), $\bar M$ 是平均行数, $c$ 是容量系数, 取 8 的倍数. 另一种是 grouped GEMM, 用偏移数组描述每组的行数, 不填充. 三种矩阵乘的形状不同 (eq. 15, Table 15): 前向和 dgrad 中 $M_e$ 是输出行数, Wgrad 中 $M_e$ 是累加维长度, 某个专家行数少时 Wgrad 会更吃亏.

![](images/p65-figure-38-grouped-gemm-and-capacity-padded-bmm-across.jpg)

> 图 4: 不同路由行数下 grouped GEMM 与 capacity-padded BMM 的耗时比, 阴影区标出中大型模型常见工作范围.

**图 4 解析** (报告 Figure 38): $d=h=4096$, 16 个本地专家, 纵轴是 BMM 时间除以 grouped GEMM 时间, 大于 1 表示 grouped GEMM 更快. 总行数在 4K 到 8K 之间 (每专家 256 到 512 行) 两者打平, 更少时 BMM 更快. 曲线并不单调, 约 6K 处到 1.19 后在 16K 回落到 1.11, 再缓慢升到 128K 的 1.29, 即 BMM 慢 28.9%. 阴影是中大型模型的工作区间, 每 rank 16K 到 96K 路由行.

$d=h=2048$ 时 (Fig. 71) 打平点在 8K 到 16K, 128K 时 BMM 慢 15.4%. Fig. 39 把 $8192\times81920$ 的矩阵乘拆成若干组, 与同尺寸稠密 GEMM 比: 每组 $T\le128$ 行时只有稠密的约 60%, 256 行时到 96%, 行数很大时反而降到 83% 到 88%. 附录 A.12 把后一段归因于功耗限制: SM 时钟从 1174 降到 960 MHz, 吞吐从 1366 降到 1163 TFLOP/s, 而每 MHz 的吞吐稳定在 1.16 到 1.19 TFLOP/s.

负载不均也会拖慢 grouped GEMM. 报告用 $I_H=1-H(p)/\log N_{local}$ (eq. 18) 衡量集中程度, $p$ 是各本地专家分到的行数占比, $H(p)$ 是它的熵; 行数完全均匀时 $I_H=0$, 全部落到一个专家时 $I_H=1$. Fig. 40 在总计算量固定的 100 个负载直方图上测量, $I_H$ 与 grouped GEMM 吞吐的 Spearman 相关系数为 −0.86, bootstrap 95% 区间 [−0.90, −0.80], 中位归一化吞吐从最分散一档的约 96% 降到最集中一档的 89%. 报告也说明单点并不单调, 熵相近的直方图吞吐仍可能不同. GEMM 时间还依赖矩阵里的具体数值, 见 6.3.

**DeepEP v2, 以及重叠为什么可能更慢。**

EP 超过 8 卡就要跨节点. rowwise 路径逐行发送, 行数多而每行小, 会先耗尽网卡的消息速率, 所以跨节点时改用 DeepEP v2. 它是按块组织的, 元数据同样留在 GPU 上, 代码在 [`ep_deepep_v2.py`](https://github.com/allenai/OLMo-core/blob/main/src/olmo_core/nn/moe/v2/ep_deepep_v2.py). MXFP8 模式下只有前向 dispatch 用 FP8 传输, 其余三个方向仍是 BF16.

通信和计算重叠的收益条件是 $T_{overlap}<T_{comm}+T_{gemm}$ (eq. 10). 两者同时跑时争抢 SM, 显存带宽和 L2. Table 9 在 2 节点 16 卡, EP-MP 为 16, 每 rank 16,384 token, top-8, $d=h=6144$ 下测量: grouped GEMM 单独跑 4.645 到 4.679 ms, 与 rowwise dispatch 同时跑时变成 5.736 到 5.874 ms, 慢 22.9% 到 26.0%, 与 combine 同时跑慢 23.0% 到 27.0%; 把通信的 launch 宽度降到 1 个 block 也躲不开这个减速, 只会让通信本身慢一个数量级. 在 128 block 的 launch 下, dispatch 加 GEMM 的总耗时从串行的 7.768 ms 降到重叠的 5.833 ms, combine 一侧从 7.560 降到 5.868 ms, 缩短 22% 到 25%.

![](images/p44-figure-24-no-wave-execution-is-fastest-after-tuning.jpg)

> 图 5: 两组跨节点 EP 配置中, wave overlap 与无重叠执行在不同通信 SM 预算下的耗时对照.

**图 5 解析** (报告 Figure 24): 左图是 2 节点, EP-MP 为 16, 128 个专家, top-8, $d=h=8192$, BF16; 四段 wave 重叠在每个通信 SM 预算下都比不重叠慢, 不重叠在 32 个 SM 时最快. 右图是另一组 4 节点, EP-MP 为 32, 256 个专家的配置; 只给 8 个 SM 时通信成为瓶颈, wave 胜出, 但全图最快点仍是 32 个 SM 下的不重叠执行. 两组都是 Nsight 下的单独开发测量, 每组 5 次计时取最慢 rank 的中位数, 不是多次训练运行.

由此报告保留阶段串行作为参考实现, 并给出替换条件: wave 后端必须在相同形状和拓扑下快过调好的不重叠配置. 单个 kernel 对能重叠, 不等于整步变快; §15 的 two-batch overlap (TBO) 是整步上的例子, 见 5.5.

### 2.1. 路由, 容量和负载均衡

**请求的路由和保留的路由。**

设一个 MoE 层有 $N$ 个全局专家, 源 rank $s$ 上有 $T_s$ 个 token, token $t$ 选出的专家集合是 $S_{s,t}$, 每一对 (token, 被选专家) 叫一条路由. 源 rank $s$ 向专家 $i$ 请求的路由数是 $C^{req}_{s,i}=\sum_{t=1}^{T_s}\mathbf 1\{i\in S_{s,t}\}$, 对 $i$ 求和等于 $KT_s$ (eq. 19). 记 $\rho(i)$ 为持有专家 $i$ 的 rank, 目标 rank $q$ 收到的总需求是 $R^{req}_q=\sum_{i:\rho(i)=q}C^{req}_i$ (eq. 20). 容量策略保留其中 $C^{keep}_{s,i}$ 条, 丢掉 $D_{s,i}=C^{req}_{s,i}-C^{keep}_{s,i}$ 条; 专家 $i$ 实际收到的行数 $M_i=C^{keep}_i$, rank $q$ 的实际负载是 $R^{keep}_q$ (eq. 21). 没有丢弃时两套计数相同, 有丢弃时它们是两回事.

负载均衡损失 (LBL) 和后面的 bias 控制器读的是请求计数 $C^{req}$, dispatch 和 grouped GEMM 用的是保留计数 $C^{keep}$. 报告用 $I_{max}(x)=\max_jx_j/(\frac1n\sum_jx_j)$ (eq. 22) 衡量不均衡, 并强调要在四个对象上分别看: 专家上的请求计数反映 router 想要什么训练信号, 专家上的保留计数决定 grouped GEMM 的形状, rank 上的请求总量决定容量压力和丢弃风险, rank 上的保留总量决定哪张卡会拖慢别人. 两层可以不一致: 一个 rank 的总量可能均衡而全部集中在一个本地专家上, 也可能几个本地专家都偏热, 让整个 rank 变慢.

**rank 级共享容量。**

rowwise 无同步路径给每个目标 rank 预留 $C_{rank}=\max(1,\lceil cT_{route}\rceil)$ 行 (eq. 23), $T_{route}=KT_s$ 是一个源 rank 产生的路由数, $c$ 是容量系数. 均衡时每个目标 rank 平均收到 $T_{route}$ 行: 有 $M_E$ 个源, 每个源以 $1/M_E$ 的概率选中它, 两个因子相消. 这个额度由该 rank 的所有本地专家共享, 单个专家最多能吃到均值的约 $cN_{local}$ 倍 (eq. 24). 传统的逐专家容量给每个专家 $C_{expert}\approx\lceil cT_{route}/N_{local}\rceil$ (eq. 25), 热专家溢出时, 旁边冷专家的空行用不上. 代码里 $c$ 的默认值是 1.25 ([`ep_config.py`](https://github.com/allenai/OLMo-core/blob/main/src/olmo_core/nn/moe/v2/ep_config.py) 的 `capacity_factor`), 计算在 `compute_ep_no_sync_rank_capacity`.

总额相同时, 共享额度丢掉的路由不会更多. 设 rank 总额 $B$, 逐专家额度 $b_j$ 满足 $\sum_jb_j=B$, 则 $D^{rank}=[\sum_jC^{req}_j-B]_+$, $D^{expert}=\sum_j[C^{req}_j-b_j]_+$ (eq. 28), $[z]_+=\max(z,0)$. 由 $[\sum_jz_j]_+\le\sum_j[z_j]_+$ 得 $D^{rank}\le D^{expert}$ (eq. 29). Fig. 41 的例子是每 rank 6 行: 逐专家各 3 行时 $E_0$ 丢 2 条, $E_1$ 有 2 行空着; 共享 6 行时全部收下. 代价是放弃了单个专家的负载上界. 每次前向, EP 组内各 rank all-gather 请求计数, 各自算出同一个 keep 矩阵: 对每个目标 rank 先按本地专家, 再按源 rank 展开, 累加到 $C_{rank}$ 为止, 每个 (源, 专家) 分段保留前缀. 这个规则确定且可复现, 但顺序会影响哪些 token 幸存. 丢弃比例 $\delta_{route}=\sum D_{s,i}/\sum_sKT_s$ (eq. 27) 是路由级的, $K>1$ 时它不等于丢掉全部 $K$ 个专家的 token 比例, 报告建议分开报告这两个数.

**LBL 的标量实际在量什么。**

在一个均衡批次 (balance batch) 的 $T$ 个 token 上, 定义 $f_i=C^{req}_i/(KT)$ 为专家 $i$ 拿到的请求路由占比, $P_i=\frac1T\sum_tp_{t,i}$ 为它的平均 router 得分 ($p_{t,i}$ 在专家维上归一化). Switch 式的 LBL 是 $\mathcal L_{LBL}=N\sum_if_iP_i=N\boldsymbol f^\top\boldsymbol P$ (eq. 30), $f$ 不传梯度, 梯度只经过 $P$. sigmoid 路由时 Olmo 先把得分归一化再算这一项, 代码在 [`router.py`](https://github.com/allenai/OLMo-core/blob/main/src/olmo_core/nn/moe/v2/router.py) 的 `compute_aux_loss`. 如果 $P=f$, 就有 $\mathcal L=N\|f\|^2=1+N\|f-u\|^2$ (eq. 40), $u$ 是均匀分布, 这时均匀负载是唯一最小点, 通常的解读就来自这里. 但 top-K 只要求每个 token 被选中的专家得分高于未选中的, 并不要求 $P=f$.

记 $u=(1/N,\dots,1/N)$. 因为 $f-u$ 和 $P-u$ 各自求和为零, 把 $f=(f-u)+u$, $P=(P-u)+u$ 代入展开:

$$
N\boldsymbol f^\top\boldsymbol P=N\big[(\boldsymbol f-\boldsymbol u)^\top(\boldsymbol P-\boldsymbol u)+\boldsymbol u^\top(\boldsymbol P-\boldsymbol u)+(\boldsymbol f-\boldsymbol u)^\top\boldsymbol u+\boldsymbol u^\top\boldsymbol u\big]=1+N(\boldsymbol f-\boldsymbol u)^\top(\boldsymbol P-\boldsymbol u).
$$

中间两项都等于 $\frac1N$ 乘一个和为零的向量之和, 为 0; $u^\top u=1/N$, 乘 $N$ 得 1. 这就是 eq. 41. **LBL 只约束了硬分配偏差和软得分偏差的内积**, 并不约束任何一个偏差的大小. 两者同向时 $\mathcal L>1$, 正交或任一为均匀时 $\mathcal L=1$, 反向时 $\mathcal L<1$. 特别地, 只要 $P=u$, 无论 $f$ 多么集中都有 $\mathcal L=1$ (eq. 42), 和完全均衡同分.

**Token Gerrymandering: 从六个 token 到几十个死专家。**

报告把这种失败叫 **Token Gerrymandering**: 被频繁选中的专家靠小幅领先赢下大量 token, 很少或从不被选中的专家吸走软得分却赢不了. 最小例子是 2 个专家, top-1, 6 个 token, 得分矩阵 (eq. 43) 前两行是 (1.0, 0.0), 后四行是 (0.4, 0.6). 专家 1 赢 2 个, 专家 2 赢 4 个, $f=(1/3,2/3)$, $P=(3/5,2/5)$ (eq. 44), 请求不均衡度 $I^{req}_{max}=4/3$, 而 $\mathcal L=2(\frac13\cdot\frac35+\frac23\cdot\frac25)=\frac{14}{15}\approx0.933<1$ (eq. 45). 负载更偏了, 损失反而比完全均衡的 1 低.

这不是孤立的数值巧合. 2 专家 top-1 时设少的那一方占比 $f=(x,1-x)$, $0\le x\le1/2$, 单个 token 对专家 1 的得分为 $q$, 它对 $f^\top p_t$ 的贡献是 $xq+(1-x)(1-q)=(1-x)+(2x-1)q$ (eq. 47), 随 $q$ 增大而减小. 选中专家 1 的 token 让 $q\to1$, 贡献 $x$; 选中专家 2 的 token 要求 $q<1/2$, 取 $q\to1/2$, 贡献 $1/2$. 于是固定 $x$ 时 $\inf\mathcal L(x)=2[x\cdot x+(1-x)\cdot\frac12]=1-x+2x^2$ (eq. 48), 在 $x=1/4$ 取最小值 $7/8$ (eq. 49), 对应 1:3 的分配; 六 token 例子固定在 2:4 时下确界是 $1-\frac13+\frac29=\frac89$.

专家多时差距更大. 取 $A$ 个活跃专家, 其余 $D=N-A$ 个从不被选中. token 均匀分给活跃专家; 路由到专家 $j$ 的 token 得分为 $p_{t,j}=(1+D\epsilon)/(D+1)$, 每个死专家 $(1-\epsilon)/(D+1)$, 其他活跃专家趋于 0 (eq. 50). 专家 $j$ 只领先 $\epsilon$, 软得分几乎全被死专家拿走. 令 $\epsilon\to0^+$, $P_j\to1/(A(D+1))$, 得 $\mathcal L\to N/(A(N-A+1))$ (eq. 51). $N=64$, $A=16$ 时 $\mathcal L\to64/(16\cdot49)\approx0.0816$, 而 48 个专家已死, $I^{req}_{max}=N/A=4$. 取 $A\approx\sqrt N$ 时 $\mathcal L=O(N^{-1/2})$ 趋于 0, 不均衡度却以 $\Theta(N^{1/2})$ 发散. top-K 的版本是 $\mathcal L\to NK/(A(N-A+K))$ (eq. 52). 换更大的均衡范围也救不回来, 只要 $f$ 和 $P$ 在同一批 token 上归一化, eq. 41 就照样成立.

**训练里能走到这一步吗。**

这些构造只说明目标函数允许这种解, 不说明 SGD 会走到. 对 top-1 softmax 的 logit $z_{t,i}$, 在分配不变的区域内 $\partial\mathcal L/\partial z_{t,i}=\frac NTp_{t,i}(f_i-f^\top p_t)$ (eq. 53), 梯度把软得分推向负载低于加权平均的专家, 这是本来想要的均衡压力; 但被偏好的专家只要以极小差距保持领先, 软得分转移到冷专家就能降低 $\mathcal L$, 硬分配却不变. 把系数放回总目标 $\mathcal L_{train}=\mathcal L_{CE}+\lambda_{LBL}\mathcal L_{LBL}+\mathcal L_{other}$ (eq. 54), 一次让交叉熵变差 ($\Delta\mathcal L_{CE}>0$) 而 LBL 下降的路由变化, 只要满足 $\lambda_{LBL}(-\Delta\mathcal L_{LBL})>\Delta\mathcal L_{CE}+\Delta\mathcal L_{other}$ (eq. 56), 总目标就会下降.

![](images/p76-figure-42-the-load-balancing-loss-falls-while-load.jpg)

> 图 6: 调低 LBL 系数前后, 辅助损失与实际专家负载不均衡度出现相反变化的训练曲线.

**图 6 解析** (报告 Figure 42): 48 层模型 (第 0 层稠密, 其余 47 层各 64 专家, top-4, sigmoid, dropless), instance 级 LBL. 橙线 $\lambda_{LBL}=0.05$; 蓝线在第 17,000 步 (71.3B token) 载入同一个 checkpoint, 只把系数改成 0.005. 左图是 47 层未加权 LBL 之和, 橙线从约 47 掉到 41 附近; 右图是所有层和 rank 中最差的 max/mean 专家计数, 橙线从约 2.7 升到 6.6 左右, 蓝线一直平稳.

Table 20 取两个窗口的中位数: 高系数一支 CE 从 2.473 升到 2.523 (+2.0%), LBL 从 46.864 降到 41.278 (−11.9%), 最差不均衡度从 2.748 升到 6.317 (+129.9%); 低系数分支 CE 从 2.469 降到 2.358 (−4.5%), 不均衡度从 2.655 降到 2.544 (−4.2%). 加权后的 LBL 贡献从 2.343 降到 2.064, 足以让重建的总目标从 4.820 降到 4.591 (−4.8%), 尽管 CE 在变差. 附录 B.7 交代了条件: 这组运行用的是生产预训练栈的 HSDP 和 BF16, 不走本报告的 EP 路径; 学习率 $3\times10^{-5}$; 只有一对分支. 存档指标里没有同一范围的 $f$ 和 $P$ 向量, 所以无法直接验证 eq. 41 中的反向内积.

均衡范围 (Table 19) 也是训练目标的一部分. 报告列了五种: instance (每条序列) 和 `local_batch` (本 rank 当前 microbatch) 已实现; 同步当前 microbatch, 跨梯度累积的在线全局, 以及精确的优化器批次版本只是设计或未实现. 不过 GitHub main 上的 `router.py` 已经有 `global_load_balancing` 开关 (默认关), 每层每个 microbatch 对计数做一次 all-reduce, 代码注释里的 代码注释写明这是一次小而同步的集合通信. 另一类均衡手段是 DeepSeek 式的无辅助损失 bias: 选专家用 $a_{t,i}+b_i$, 混合权重仍用不带 bias 的亲和度 (eq. 35), 每个训练批次结束后按 $b_i\leftarrow b_i+\gamma\,\mathrm{sign}(\bar C-C_i)$ (eq. 37) 更新, $\bar C$ 是平均请求计数, 实现是 `router.py` 里的 `post_batch`. 计数归约默认用 WORLD 进程组, PP 下会把不同层的计数混在一起, 必须显式配置 stage 内的均衡组. 报告对这个控制器的模型质量不做任何结论.

### 2.2. 精度, 显存和实测工作点

**MXFP8 的格式和代价。**

MXFP8 每 32 个值共享一个 E8M0 scale (只有指数, 无符号无尾数), 每个值本身是 1 字节 E4M3, Blackwell 上由 `tcgen05.mma` 的 `block_scale` 模式原生支持. 一个块的存储是 $B_{MXFP8}=1+1/32=33/32$ 字节每值 (eq. 57), 替换 BF16 的 2 字节省 $1-33/64\approx48.4\%$. 量化是 $q=\mathrm{E4M3}(x/s)$, 还原是 $\hat x=sq$ (eq. 58), $s$ 是 2 的幂; GEMM 要求的 scale 排布还要再做一次 swizzle. B300 的 BF16 稠密峰值是 2250 TFLOP/s, FP8 是 4500, 正好 2 倍, 但这只是 Tensor Core 上限, 量化, 反量化, swizzle 和小 GEMM 都会吃掉一部分. 背景推导见 [MXFP4 与 NVFP4](../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.2-混合精度训练/03-MXFP4与NVFP4/03-MXFP4与NVFP4.md).

线性层的前向是 $Y=XW^\top$, dgrad 是 $\nabla_X=\nabla_YW$, Wgrad 是 $\nabla_W=\nabla_Y^\top X$ (eq. 60). 前向和 dgrad 用同一个权重的两个方向, 每个方向要一份自己的量化数据和 scale 排布, 所以每个权重有两份缓存, 合计 $2\times33/32=2.0625$ 字节, 比一份 BF16 权重还多 3.125%. **MXFP8 不减少常驻训练状态**, FP32 主权重和优化器状态照旧, 只是 BF16 计算权重换成了两份缓存. scale 怎么选也影响训练: OCP 的 floor 规则先把块最大值 $a$ 向下取到 2 的幂再除以 $2^8$, NVIDIA 的 rceil 规则取 $e=\lceil\log_2(a/448)\rceil$, 448 是 E4M3 的最大值. 以 $a=500$ 为例, floor 选 $s=1$, 超过 448 的值被截断; rceil 选 $s=2$, 不截断. 代码里的默认值是 rceil ([`mxfp8_config.py`](https://github.com/allenai/OLMo-core/blob/main/src/olmo_core/mxfp8_config.py) 读环境变量 `OLMO_MXFP8_SCALE_MODE`, 缺省为 `rceil`).

MXFP8 是否更快取决于形状. Table 22 在单张 B300 上扫描: 4096→4096 的投影, 预量化的 MXFP8 GEMM 从 $M=4096$ 行开始快过 BF16, 把激活的逐次量化算进去后要到 $M=16384$; 长方形投影分别是 2048 和 8192; 1024→1024 与 2048→2048 在算上激活量化后整个扫描范围内都没有反超. Table 23 中 OLMoE 尺寸的 1536→1536 路由专家, 算上激活量化后只有 BF16 速度的 0.55 倍. 小专家, 细粒度 MoE 用 MXFP8 并不自动划算.

**MoE 里的 MXFP8 配方和实测。**

![](images/p94-figure-57-routed-expert-mxfp8-forward-and-backward-forward.jpg)

> 图 7: 路由专家在前向和反向中的 MXFP8 数据流, 标出量化, dispatch, grouped GEMM, combine 与权重缓存的位置.

**图 7 解析** (报告 Figure 57): 上半是前向, dispatch 时把 BF16 行量化成 qdata 和 scale 发到目标专家, up/gate 和 down 两次 grouped GEMM 用 MXFP8, SwiGLU 和量化融合成一个 kernel, down 输出 BF16 后再量化用于 combine 传输. 下半是反向, dgrad 用两份缓存中对应方向的一份, combine 的反向把路由权重乘法和梯度量化融合; 路由专家的 Wgrad 先反量化再走 BF16 grouped GEMM, 结果累加进 FP32 梯度桶.

Wgrad 没用 MXFP8 是测出来的. Wgrad 的累加维是 token 维, 前向产生的 scale 沿隐藏维分块, 方向对不上. Table 33 对比了保持原排布的 MXFP8 Wgrad 原型和反量化后 BF16 grouped GEMM: $K=N=2048, 4096, 8192$ 时前者分别用 0.380, 1.449, 5.522 ms, 后者 0.118, 0.334, 1.232 ms. attention 部分, QKV 投影的 Wgrad 输入存成 MXFP8, 输出投影的输入保持 BF16, 因为 attention 图本来就留着那份 BF16 激活, 再加一份 MXFP8 只会多占显存.

scale 规则的影响用 checkpoint 分支检验 (Fig. 56): 31 层, 8.36B 激活, 166.72B 总参数, 128 个路由专家加 1 个共享专家, top-4. 公共起点是用 floor 规则从头训了约 56B token 的第 6000 步, 之后分 BF16, rceil, floor 三支续训到第 7179 步 (约 67B token), 共约 11B token. 末尾 50 步内, rceil 与 BF16 的平均 loss 差 +0.00048, 梯度范数差 −1.9%; floor 差 +0.02200 和 +51.1%. 吞吐用另一组受控实验 (Table 26, Fig. 59): 8 层, 3.172B 激活, 13.037B 总参数, 32 个专家 top-4 加 1 个共享专家, 4 张 B300, EP4, 每步 524,288 token 分 8 个 microbatch, 均匀路由, 每种模式跑 3 个独立作业. BF16 基线 54.74K token/s/GPU, 峰值显存 103.4 GiB; attention 加 MLP 和 EP 全开 MXFP8 时吞吐约 +21%, rowwise EP 的固定缓冲从 5.00 GiB 降到 2.836 GiB. 新增的量化, swizzle 和反量化 kernel 在三种模式下分别占 BF16 kernel 时间之和的 3.0%, 8.0% 和 10.3%. 报告正文说组合模式的峰值显存最低, 具体数字在图里; 博客写的是 103 GiB 降到 95 GiB.

**拓扑无关的 checkpoint 和逐层重算。**

checkpoint 只存 FP32 主权重, 两个 FP32 矩和少量元数据, 即每参数 12 字节, 166.7B 的模型是 1,863.33 GiB. 张量按全局身份保存, 与 DP, EP, PP 的切法无关, 换并行度重启时在加载阶段重新切分. 专家张量用一个只供 checkpoint 使用的扁平视图写出, 它直接别名到优化器存储, 记录 EP-MP 分片顺序和 EP-DP 的切分或复制, 不需要先在 GPU 上 gather 成完整张量. 在一次 FP8 开发运行里, 保存期间的 allocated 和 reserved 峰值显存停在保存前的 93.1 和 121.4 GiB. MXFP8 缓存和 BF16 视图都是派生量, 不写进 checkpoint, 加载后重建.

![](images/p102-figure-62-block-recompute-removes-nearly-two-thirds-of.jpg)

> 图 8: Block recompute 开关对单卡吞吐与峰值显存的影响, 并把常驻状态和可重算激活分开统计.

**图 8 解析** (报告 Figure 62): 1 个稠密 block 加 7 个 MoE block, $d_{model}=4096$, 32 个专家 top-4 加 1 个共享专家, 4 张 B300, EP4, 均匀路由无丢弃, BF16, 每种模式 3 个独立进程. 左图是吞吐, 逐层重算从 54.68K 降到 43.22K token/s/GPU, 精确值 −20.95%. 右图是峰值显存, 从 103.03 降到 76.90 GiB (−26.13 GiB, −25.36%); 常驻部分 62.2 GiB 两边相同, 减少的全部来自激活, 从 40.8 降到 14.7 GiB, 约 −64%.

逐层重算 (Table 29) 让每个 block 的前向在反向前再跑一遍, trace 中 block 前向的次数从 64 (8 个 block 乘 8 个 microbatch) 变成 128, GEMM 与 attention 的 kernel 时长之和 +24.8%, 单位有效工作的耗时 +26.5%. 常驻部分是参数, 梯度桶, 优化器状态和常驻缓冲, 重算动不了它; 在 Ultra 这一档, 是分片的优化器状态, MXFP8 存储和逐层重算三者一起才把模型装进显存. MoE 下重算有两个特别之处: 重算会再做一次 dispatch 和 combine, 通信量也重复; 路由指标只在原始前向里累计, 重算时不重复记. router 的 FP32 输入用 output-discard checkpoint 保存, 代码在 [`output_discard_checkpoint.py`](https://github.com/allenai/OLMo-core/blob/main/src/olmo_core/nn/moe/v2/output_discard_checkpoint.py).

**生产工作点。**

Table 30 的条件是: 随机路由, 序列长 8192, top-4, 1 个共享专家, B300, 每节点 8 卡; 每个配置取多次运行中观测到的最高速率. MFU 一律以 BF16 稠密峰值 2250 TFLOP/s 为分母 (eq. 95), MXFP8 行也一样.

| 配置 | 激活 / 总参数 | 全局 batch | EP / PP | 精度, 重算 | TFLOP/s/GPU | MFU |
|---|---|---|---|---|---|---|
| Tiny-64E (16 卡) | 1.59B / 12.91B | 8Mi | 1 / 1 | BF16 | 903 | 40.1% |
| Small-64E (128 卡) | 4.29B / 40.86B | 24Mi | 8 / 1 | BF16 | 841 | 37.4% |
| Medium-128E (128 卡) | 7.38B / 137.27B | 24Mi | 8 / 4 | BF16 | 843 | 37.5% |
| Large-128E (512 卡) | 15.14B / 295.99B | 32Mi | 8 / 4 | BF16 | 768 | 34.1% |
| Ultra-128E (512 卡) | 58.36B / 1.200T | 64Mi | 8 / 8 | MXFP8, 重算 | 858 | 38.1% |
| Ultra-256E (512 卡) | 58.41B / 2.380T | 64Mi | 32 / 8 | MXFP8, 重算, DeepEP | 689 | 30.6% |

表里省去了 Medium-64E (70.22B, 853) 和 Medium-96E (103.75B, 855). 三个 Medium 激活参数相同, 总参数从 70B 到 137B, 吞吐落在 843 到 855 之间, 但 batch 和 PP 不完全一致, 不能拿来单独衡量加专家的代价. Ultra-256E 只跑了 9 步, 只说明这个配置能跑起来. 附录 B.10 的学习路由对照中, Tiny 是 895 对 903, 差约 1%; Small 是 768 对 841, 差约 9%, 随机路由的数字是偏乐观的参考. Ultra-128E 用了 MXFP8 却没比 BF16 点快多少, 因为逐层重算加了前向工作, batch 和 PP 也和 Large 不同.

与 Olmo 3 对照要注意口径: Olmo 3 是 H100 上的稠密模型, MFU 约 41% 到 43%; 这里是 B300 上的 MoE, 分母是 2250 TFLOP/s. 两组百分比接近, 但硬件, 模型类型和计算 FLOPs 的方式都不同.

**试过但没采用的方案。**

**CPU 激活卸载**受限于 PCIe. 条件是 $B_{D2H}\ge A/t_f$, $A$ 是一层前向产生的待卸载字节, $t_f$ 是这层前向时间 (eq. 61). Table 32 在 $T=16384$, $d=h=4096$, top-4, BF16 下算出一个路由 block 的候选激活为 $29.5Td$, 约 3.96 GB, 前向 10.3 ms, 需要约 384 GB/s; PCIe 规格 63 GB/s, 实测 53 GB/s (H100 主机上的 pinned 拷贝), 需求与供给之比 $\rho$ 为 6.1 到 7.2, 最多只能卸载约 1/6. 反向时 H2D 也要 180 GB/s; 即使摊到整个 295 ms 的 microbatch 上, 每个方向仍需 104 GB/s, 而双向同时拷贝时实测速率还会再掉 15% 到 25%. 按 1/6 算, 每个 block 能卸约 0.65 GB, 一个 microbatch 约 5 GB, 不到逐层重算省下的 26 GB 的五分之一. 8 张卡同时卸载需要约 3 TB/s 的主机内存带宽, 超过双路 DDR5 主机能吸收的量; 换 PCIe Gen6 能让 $\rho$ 减半, 但 GPU 产出速度和主机内存的上限仍在. B300 主机链路本身没测, 换到 Hopper 时 $\rho$ 约为 3 是按峰值算力比例推出来的估计.

**two-batch overlap (TBO)** 把 batch 拆成两半在相邻 MoE block 间交错. EP 通信占 span 的 14.8%, 完全隐藏的理想收益约为 $1/(1-0.148)-1\approx17\%$, 实测只有 1% (54.68K 到 55.22K token/s/GPU), 峰值显存从 103.03 降到 101.57 GiB. profile 里 TBO 确实重叠了 503.6 ms 的通信和计算, 占 EP 传输区间的 72.2%, 但与此同时 EP 传输时长之和 +98.9%, GEMM +20.4%, attention +16.5%, 取区间并集后 GPU 跨度只缩短 0.9%, 与 3.6 中 Table 9 的争用现象一致. rowwise NVSHMEM 的 PUT 和 GET 是跑在 SM 上的 kernel, 用的是 GEMM 也要用的调度和访存资源, 不是不占 SM 的 DMA 传输. 拆成两条 lane 还让 kernel launch 增加 89.8%, CUDA API 调用增加 126.4%, 10 µs 以上的空闲间隙出现频次变为 2.09 倍; 这次 microbatch 足够大, CPU 仍然领先, microbatch 再小就会逼近 launch 瓶颈. 这 1% 是在不开 PP 的配置下测的, 与 PP 调度组合还要额外协调, 所以没有采用.

其余几项: MegaMoE megakernel 把 dispatch, 专家调度, 两次专家线性层, 激活和加权 combine 放进一个持久 CUDA kernel, 但在有生产级反向和跨节点传输之前, 它已经变成横跨 Python, C++, CUDA 和分布式运行时的工程; 静态 CUDA Graph 要求地址固定, 和 PP 下多个 microbatch 同时在途冲突, 安全的暂存要额外拷贝和显存, 报告引 Megatron 的数据是约 10% 加速换约 7 GB 显存. 这几项都是现有实现下的结论, 报告给出了各自重新考虑的前提.

## 3. 训练配方, 后训练和同类系统

### 3.2. batch 变大时学习率怎么跟

§16 从梯度噪声出发. $B$ 个样本的平均梯度 $\hat G_B$ 期望为真实梯度 $G$, 协方差为 $\Sigma/B$ (eq. 64). 对损失做二阶展开, 一步 SGD 的期望改进是 $\eta\|G\|^2-\frac{\eta^2}2(G^\top HG+\mathrm{tr}(H\Sigma)/B)$ (eq. 65), $H$ 是 Hessian. 无噪声时最优步长 $\eta_{max}=\|G\|^2/(G^\top HG)$ (eq. 66), 噪声尺度 $\mathcal B_{simple}=\mathrm{tr}(\Sigma)/\|G\|^2$ (eq. 67) 给出临界 batch 的量级: batch 远小于它时加倍 batch 近似等于加倍步数, 远大于它时收益递减. 报告实际用 Merrill 等人的经验定义: 第 $k$ 倍 batch 的损失不比任何更小倍数差超过 $\varepsilon$ 时, 取最大的 $k$ (eq. 68).

Adam 下没有统一的指数. 报告把学习率写成 $\eta(B)=\eta_\infty/(1+B_{turn}/B)^\alpha$ (eq. 69), 局部指数 $\alpha_{eff}=\alpha B_{turn}/(B+B_{turn})$ (eq. 70) 随 batch 增大而减小. 对角近似下 Adam 的步长约为 $\mathrm{sign}(E[G_i])/\sqrt{1+s_i/E[G_i]^2}$ (eq. 72), $s_i$ 是该坐标的梯度方差, 若 $s_i\propto1/B$ 就得到平方根规则; 但 $\beta_2$ 接近 1 时二阶矩跟得慢, McCandlish 等人据此认为实际指数会从 0.5 偏向 SGD 的 1. 实验是 3.21B 激活, 23.10B 总参数, 24 层 48 专家 top-4 的模型, batch 依次取 1, 2, 3, 6, 9, 15, 24Mi, 共约 2.07T token (Fig. 66). 按平方根缩放学习率时, 后几次加 batch 处损失曲线的曲率有可见变化; 报告称多次内部调参后取 $\alpha=0.53$ 更稳, batch 加倍时学习率只比平方根规则多 $2^{0.03}-1\approx2.1\%$. 这个值来自未公开的内部运行, 报告自己也只把它当作 Olmo 的配方.

### 3.2. 专家学习率和 upcycling

§17 检验了一个直觉: 每个专家只看到 $K/N$ 的 token, 学习率是否该乘 $\sqrt{K/N}$ (eq. 73), top-4 of 64 时就是 1/4. 实验模型 0.43B 激活, 2.51B 总参数, 每个点训练 150B token, 两组各扫 9 个主学习率. 最好的统一学习率在 $8\times10^{-4}$ 处得到 C4 验证损失 2.873, 专家缩放组最好是 $2\times10^{-3}$ 处的 2.878. 每个点只跑一次, 0.005 的差距只能当方向参考; 报告的默认做法是专家和其他参数用同一学习率, 除非目标模型上有匹配的扫描支持别的选择.

§18 解释为什么不从稠密 checkpoint upcycle. 依据是 OLMoE 的已发表对照: 把训了 2T token 的 OLMo-1B 转成 top-2 of 8 的 MoE 继续训练, 起初领先, 从头训练的稀疏模型约 500B token 追平, 约 600B 反超. OLMoE 的目标配方是 5T token, 远长于 upcycle 的领先区间. 报告也说明这个结论有条件: 已有合适的稠密 checkpoint, 续训又短时, upcycling 仍可能划算. 代码里保留了把稠密 MLP 拷进路由或共享分支的原型转换路径.

**GEMM 时间取决于矩阵里的数值。**

§19 来自一次基准事故. 对比 rowwise EP 和 DeepEP v2 时, 两边的专家 GEMM 时间不同, 后来发现一边用正态初始化的权重, 另一边用 `torch.empty()` 得到的未初始化存储; 统一初始化后, rowwise 的表面优势消失了. 报告在单张 B300 上脱离 MoE 复现 (Table 34): grouped GEMM 为 8 组, 每组 16,384 行, 权重 $8192\times16384$, BF16. 正态随机权重 31.059 ms, 全零 18.896 ms (−39%), 常数填充 20.606 ms (−34%), 固定幅值随机符号 25.979 ms (−16%); 同尺寸的稠密 GEMM 全零时 19.424 ms (比正态的 24.724 ms 少 21%), 常数填充却几乎不变.

报告没有确定机制. 一个解释是数据相关的翻转活动改变动态功耗, 处于功耗上限的 GPU 降频, 同一条指令流耗时就变了; 3.5 中 A.12 的降频数据与此相符, 但那组实验改的是形状不是数值, 原始运行也没记录功耗和时钟. 结论是一条基准规范: 后端对比要用相同的权重, 或者相同的初始化方法, 种子, 尺度和排布; 只对齐矩阵尺寸不够.

**共享专家和合并系数。**

§20 证明多个无门控共享专家等价于一个更宽的共享专家. 第 $j$ 个共享专家 $E_j(x)=[\mathrm{SiLU}(xW_g^{(j)})\odot(xW_u^{(j)})]W_d^{(j)}$ (eq. 74), 中间宽度 $m_j$. 把各个 gate 和 up 投影按列拼接, down 投影按行堆叠 (eq. 75), 因为 SiLU 和逐元素乘沿中间维各自独立, 得到 $E_\star(x)=\sum_jE_j(x)$, 宽度 $\sum_jm_j$ (eq. 76). 固定系数可以吸收进 down 投影, 整体共享一个门控也一样 (eq. 77); 只有各专家系数随输入或任务变化时才不能合并 (eq. 78). 所以真正的容量变量是总宽度 $m_s=\sum_jm_j$ (eq. 79), Olmo-core 最多只支持一个共享专家, 宽度与路由专家宽度独立选择.

§21 讨论路由分支和共享分支怎样相加: $y=\sum_{i\in S(x)}r_i(x)f_i(x)+s(x)g(x)$ (eq. 80). 以稠密 SwiGLU 为参照, 把中间维切成 $K$ 块宽 $d_r$ 和一块宽 $d_s$, 系数全为 1 时就等于稠密 MLP (eq. 81); 实验取 $K=4$, $d_r=2560$, $d_s=1280$, 对应稠密宽度 $4\times2560+1280=11520$ (eq. 82). Olmo-core 取 $r_i=Kp_i$, $s=1$ (eq. 83), $p_i$ 是选中专家 L1 归一化后的概率, 均匀时每个系数都是 1. 初始化时输出方差比约为 $R_{var}\approx(d_rK^2\sum_ip_i^2+d_s)/(Kd_r+d_s)$ (eq. 86). 实测 $E[\sum_ip_i^2]=0.2589$, 比均匀 top-4 的 0.25 略高, 代入预测 1.032, 与测量吻合; 共享与路由分支的 RMS 比是 0.7082, 接近 $\sqrt{1280/2560}=0.7071$. 如果改用 $r_i=p_i$ (路由系数和为 1), 路由专家 down 投影的梯度 RMS 只有 Olmo 规则的 0.25 倍, 相当于对这组参数换了学习率. 代码中对应 `router.py` 的 `restore_weight_scale`, 把专家权重乘以 `top_k`.

**后训练复用和同类系统对照。**

§22 只是设计映射, 没有 MoE 后训练的实测. SFT 只改 label 张量和损失分母 (prompt 位置标为 −100), 但被 mask 的位置照样经过 router, dispatch 和专家 GEMM, 在 EP 下照样占用互联带宽, 所以后训练吞吐要按监督 token 重新统计. DPO 一个样本变成 chosen 和 rejected 两条序列, 共享前缀的路由计算会做两次, 参考模型要么常驻要么预先算好 log-prob. RLVR 还需要 rollout 推理, 校验和权重同步, 这些在报告的测量之外; 拓扑无关 checkpoint 可以作为权重传输的基础, 但延迟没测.

§23 Table 39 按四个维度对比同类系统. Megatron-Core 用分布式优化器常驻本地权重, dispatch 作为可选后端, 矩用 BF16, 重叠依赖足够的独立工作并划出专门的 SM; PyTorch FSDP 全重分片时每次前向反向前 gather 权重; DeepSpeed-MoE 结合 ZeRO 与 EP; DeepSeek-V3 和 DeepEP 用 ZeRO-1 保留完整本地权重, 主权重和累积梯度 FP32, AdamW 矩 BF16, 显式分配通信 SM. Olmo-core 3 的组合是常驻本地权重, 固定容量的路由索引式逐行搬运, FP32 主权重和优化器状态为权威, 默认阶段串行. 报告也承认, 现有测量没有把常驻权重和专家放置的作用分开, 不能据此说它在墙钟或显存上普遍优于全重分片 FSDP. 更完整的系统分类见 [6.1.8 MoE 系统与并行](../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/6.1.8-MoE系统与并行.md), 容量与负载均衡的通用推导见 [MoE 负载均衡与容量](../../../llm-guide/2-核心原理与架构/2.6-MoE/03-MoE负载均衡与容量/03-MoE负载均衡与容量.md).

### 3.1. 从模型规格反推一组能运行的并行配置

**先算常驻状态, 再谈算力利用率。**

一组 MoE 配置能否启动, 先由每张卡的常驻状态决定. 设稠密参数为 $P_D$, 路由专家参数为 $P_E$, 数据并行度为 $D$, 专家模型并行度为 $M_E$, 流水线并行度为 $P$, 每张卡可用于模型的显存预算为 $M_{GPU}$. 暂时假设所有张量都能整除相应并行度, 每个流水线 stage 层数相同, 则第 2.2 节的逐参数字节数可以合成

$$
M_{persistent}\approx \frac{1}{P}\left[P_D\left(6+\frac{12}{D}\right)+P_E\left(\frac{6}{M_E}+\frac{12}{D_EM_E}\right)\right]+M_{cache}+M_{buffer}. \tag{87}
$$

这里 $D=D_EM_E$; 6 字节由 BF16 计算权重和 FP32 梯度组成, 12 字节是 FP32 主权重与 AdamW 两个矩. $M_{cache}$ 包括 MXFP8 派生权重, $M_{buffer}$ 包括通信缓冲, 梯度桶和框架常驻区. 式 (87) 没算激活, 因而只是「能不能装下参数状态」的第一道筛选. 它揭示了两个不对称关系: 增大 $D$ 只能继续压缩优化器侧的 12 字节, 不能压缩每个副本持有的计算权重; 增大 $M_E$ 同时压缩专家计算权重和专家梯度, 却会把 token 交换扩到更多 rank. 前者遇到显存下限, 后者遇到通信下限.

以报告 Ultra-128E 的 58.36B 激活参数和 1.200T 总参数为例, 不能直接用 $1.2\times10^{12}\times18$ 字节再除以 512, 因为稠密参数, 专家参数和优化器状态沿不同轴切分. 朴素的 18 字节估算约为 21.6 TB 十进制字节; 即使平均除到 512 张卡也只是约 42.2 GB/卡, 这个数掩盖了计算权重必须按 EP 与 PP 放置、激活在流水线中同时存活、对称缓冲按容量预留等约束. 「总字节除以总卡数」只给理论平均值, 不保证任何一个 rank 的峰值低于显存容量.

更稳妥的做法是把显存写成

$$
M_{peak}=M_{persistent}+H_sM_{act}^{(s)}+L_sM_{lease}^{(s)}+M_{temp}^{(s)}, \tag{88}
$$

$H_s$ 是 stage $s$ 在调度中同时存活的激活份数, $L_s$ 是 rowwise dispatch lease 的高水位, $M_{temp}^{(s)}$ 是算子临时区. 1F1B-V 把各 rank 的激活份数从 11, 9, 7, 5 拉到相同的 6, 影响的是式 (88) 第二项; EP 和分布式优化器主要改第一项; 重算主要改第二项; MXFP8 同时改第一项中的派生缓存、第二项的保存激活以及第三项的传输载荷. 这些技术不能用一个「节省百分比」相加, 因为它们碰到的是相互重叠的字节集合.

一个反例能说明这种重叠. 假设峰值由 62 GiB 常驻状态和 41 GiB 激活构成, 总计 103 GiB. 重算把激活压到 15 GiB, 峰值成为 77 GiB. 若某种低精度方案把原始激活再减半, 不能在 77 GiB 上继续减去 $41/2=20.5$ GiB; 它只能处理重算后仍保存的那 15 GiB 中可量化的部分. 报告 Figure 62 的 62.2 GiB 常驻区几乎不受 block recompute 影响, 正好给出了这个分解的实测版本.

**四条并行轴分别约束什么。**

把世界大小写成 $W=PDC=P D_EM_E$, 仍然不够, 因为同一个乘积分解可以对应完全不同的瓶颈. 对每张卡的局部 token 数记为 $T$, hidden size 为 $d$, top-$K$ 路由, 元素字节数为 $b_a$. 忽略协议常数时, 四条轴的主要流量可以写成:

$$
V_{DDP}\sim \frac{2(D-1)}{D}\frac{P_{grad}}{P},\qquad
V_{EP}\sim 2TKd\,b_a,\qquad
V_{PP}\sim 2T d\,b_a,\qquad
V_{CP}\sim c_{attn}Td\,b_a. \tag{89}
$$

第一式是一次优化器步的梯度 reduce-scatter 与权重重建的量级, 会被多个 microbatch 摊薄; EP 的系数 2 对应 dispatch 与 combine, 每个 MoE block、每个 microbatch、前后向都会出现; PP 在 stage 边界搬隐藏状态; CP 的常数取决于注意力实现与 all-to-all 的次数. 式 (89) 区分了「每步一次」和「每层每微批一次」. 若一个优化器步累积 $m$ 个 microbatch, 每 token 分摊的 DDP 流量大致随 $1/m$ 下降, EP 流量不会因此下降.

由此可以解释硬件放置顺序. EP-MP 组放在 NVLink 域内, 因为它的消息频繁且位于每个路由 block 的关键路径; DDP 可以跨较慢链路, 因为梯度桶只在步边界归约, 还能和反向后段重叠. 但这条经验有边界: 若模型的稠密参数极大、累积步数很少, DDP 梯度通信也可能成为主项; 若 top-$K$ 很小且本地 token 很多, EP 的每次消息更接近大带宽传输, 对延迟的敏感度会降低. 配置应由式 (89) 中的频率和载荷共同决定, 不能只按单次字节数排序.

EP 度也不是越大越好. 均匀路由下, 每个本地专家收到的行数约为

$$
M_e\approx \frac{TKM_E}{N}, \tag{90}
$$

其中 $N$ 是全局路由专家数, 每个 rank 持有 $N/M_E$ 个专家. 增大 $M_E$ 会减少每卡持有的专家数, 却不一定减少单个专家的行数: rank 收到来自 $M_E$ 个源的 token, 两个效应在均匀情形下抵消. 真正变化的是远端比例、通信参与者数量和每卡专家权重. 若 $N$ 固定而 $M_E$ 增大, 本地命中概率大致从较高值降向 $1/M_E$; 权重显存下降, 跨卡路线增加. 这正是 EP 用容量换 token 搬运的含义.

**从 batch 约束得到 microbatch。**

设全局 batch 为 $B_{global}$ token, 数据并行副本数为 $D$, 梯度累积 microbatch 数为 $m$, 每个副本每个 microbatch 的 token 数为 $T$. 在没有序列打包损失时,

$$
B_{global}=D m T. \tag{91}
$$

因此固定 $B_{global}$ 和 $D$ 后, 增加 $m$ 会让 $T$ 反比下降. PP 希望 $m$ 足够大来填满流水线, grouped GEMM 和 attention 希望 $T$ 足够大来跨过效率拐点, host 提交也希望单次工作不要太碎. 这三个要求通过式 (91) 正面冲突. 以 $P$ 个物理 stage 的普通 1F1B 粗略估算, bubble 比例约为

$$
\beta_{pipe}\approx \frac{P-1}{m+P-1}. \tag{92}
$$

把 $m$ 从 $P$ 增到 $4P$ 可以显著降低 bubble, 但 $T$ 同时缩成四分之一. 若专家 GEMM 原本恰好在算术强度的转折点, 后者可能吃掉全部流水线收益. 报告选择 interleaved 1F1B 并给末项 stage 少放一层, 本质上是在调整式 (92) 未表示的 stage 不均衡项, 而非追求符号上的零 bubble.

完整的每步时间可以写成

$$
T_{step}\approx (1+\beta_{pipe})\max_s T_s(m,T)+T_{DDP}(m)+T_{unhidden}, \tag{93}
$$

$T_s$ 包含该 stage 的 attention、专家 GEMM、EP 通信和重算, $T_{unhidden}$ 是由于资源争用、host 空洞和依赖关系没有被隐藏的部分. two-batch overlap 的实验表明, 把通信 kernel 摆到计算旁边并不保证 $T_{unhidden}$ 下降: 当两者争用 SM、HBM 或网络注入资源时, 各自的执行时间会变长. 只看时间线里彩色区块的重叠面积会高估收益, 应比较整个 GPU busy 区间的并集和端到端 token 速率.

## 4. 路由目标怎样变成实际执行的 token

### 4.1. soft score、hard route 与容量裁剪是三张不同的图

router 对 token $t$ 产生 logits $z_{t,e}$, 经 softmax 得到 $p_{t,e}$. top-$K$ 指示量记为 $a_{t,e}\in\{0,1\}$, 满足 $\sum_ea_{t,e}=K$. 若容量策略丢掉一条路线, 再引入接受量 $q_{t,e}\in\{0,1\}$, 且 $q_{t,e}\le a_{t,e}$. 真正进入专家 $e$ 的 token 数是

$$
n_e=\sum_tq_{t,e}, \tag{94}
$$

而 router 请求的 hard load 是 $\tilde n_e=\sum_ta_{t,e}$, soft mass 是 $m_e=\sum_tp_{t,e}$. 三者回答不同问题: $m_e$ 对 logits 可导, $\tilde n_e$ 描述 router 的离散选择, $n_e$ 决定 grouped GEMM 和通信的实际工作. 如果容量裁剪发生在请求之后, 即使 $n_e$ 很均匀, $\tilde n_e$ 仍可能严重拥挤, 丢弃率也可能很高.

常见负载均衡损失把 hard fraction 与 soft fraction 相乘. 令 token 数为 $T$, 则

$$
f_e=\frac{1}{TK}\sum_ta_{t,e},\qquad
P_e=\frac1T\sum_tp_{t,e},\qquad
L_{LBL}=N\sum_{e=1}^N f_eP_e. \tag{95}
$$

均匀时 $f_e=P_e=1/N$, 所以 $L_{LBL}=1$. 容易误读的一点是: 标量等于 1 不足以证明两组边际各自均匀. 写成中心化形式,

$$
L_{LBL}=1+N\sum_e\left(f_e-\frac1N\right)\left(P_e-\frac1N\right). \tag{96}
$$

它惩罚的是 hard load 偏差与 soft mass 偏差的正相关. 如果一个专家的 hard load 偏高, 模型可以把它的 soft mass 压低; 另一个专家 hard load 偏低, soft mass反而抬高, 交叉项就可能互相抵消. 这就是 Token Gerrymandering 的代数核心. 目标看到的是两个边际的内积, 系统承受的是 hard route 的最大值和直方图.

### 4.2. 六个 token 的反例为什么能扩展

考虑 $N=3$, top-1, 六个 token. hard fraction 取

$$
f=\left(\frac12,\frac13,\frac16\right), \tag{97}
$$

明显偏离均匀分配. 只要构造一个合法的平均 soft mass $P$ 使 $(f-\frac13\mathbf1)^\top(P-\frac13\mathbf1)=0$, 式 (96) 仍给出 $L_{LBL}=1$. 例如令偏差 $u=f-\frac13\mathbf1=(\frac16,0,-\frac16)$, 选择与它正交且和为零的 $v=(a,-2a,a)$, 取足够小的 $a$ 保证 $P=\frac13\mathbf1+v$ 非负. 此时第一与第三个专家拥有相同 soft mass, hard load 却相差三倍, LBL 的交叉项仍为零.

这个构造不依赖三个专家. 对 $N>2$, 满足元素和为零的偏差空间有 $N-1$ 维; 给定非零 hard 偏差 $u$, 与它正交的 soft 偏差仍有至少 $N-2$ 维. 专家越多, 能让内积保持不变的方向越多. 扩大统计 scope 会降低小样本噪声, 却不改变式 (96) 只约束一个内积的事实. 因而把 LBL 从 microbatch 统计改成全局 batch 统计, 可以稳定估计, 不能从数学上消除代理目标的退化方向.

为什么梯度还能把模型带到这种状态? 对一个 token 的 logit $z_{t,j}$,

$$
\frac{\partial P_e}{\partial z_{t,j}}=\frac1T p_{t,e}(\mathbf1[e=j]-p_{t,j}), \tag{98}
$$

在 top-$K$ 选择不跨边界的小邻域内, $f_e$ 被当作常数, 因此

$$
\frac{\partial L_{LBL}}{\partial z_{t,j}}
=\frac{N}{T}p_{t,j}\left(f_j-\sum_ep_{t,e}f_e\right). \tag{99}
$$

若专家 $j$ 的 hard fraction 高于该 token 概率加权的平均 hard fraction, 梯度下降会压低 $p_{t,j}$. 但只要 $j$ 仍留在 top-$K$ 内, hard 选择暂时不变, 于是出现「概率下降而路线没换」的区间. 很多 token 同时处在这个区间时, soft mass 已经补偿了 LBL, hard load 尚未搬走. top-$K$ 的不连续边界让 soft 控制器与执行负载之间出现迟滞.

**容量是安全阀, 不是平衡器。**

若每个 rank 的本地 token 数为 $T$, top-$K$, rank 级容量因子为 $c$, 则该 rank 给所有本地专家预留的总行数可写为

$$
C_{rank}=\lceil cTK\rceil. \tag{100}
$$

专家级容量则常写成 $C_e=\lceil cTK/N_{local}\rceil$, 总和约等于 $C_{rank}$. 两者预算相近, 接受集合却不同. 专家级容量给每个专家固定份额, 一个专家空着的槽不能借给另一个热点专家; rank 级共享容量允许热点专家占用空闲槽, 所以在相同总预算下不会比逐专家匹配预算丢掉更多路线. 代价是 grouped GEMM 的各专家行数更不规则, 最大专家负载仍可能很高.

容量因子存在两端失效. $c$ 太小, 路由丢弃使某些 token 少走专家, 模型输出的有效 top-$K$ 变成可变值, router 梯度和主任务梯度也会改变; $c$ 太大, 固定缓冲按最坏情况膨胀, 显存和对称内存占用上升, 尾部空槽浪费. 若训练使用丢弃, 评估却提高容量到几乎不丢, 两个阶段执行的是不同函数. 若训练完全不丢, 最坏负载又可能让某个 rank 成为拖尾者. 容量需要和丢弃率、最大负载、每专家行数分布一起记录.

**无辅助损失控制器与 LBL 的差别。**

偏置式控制器在路由选择前给专家 $e$ 加一个偏置 $b_e$, 根据观察到的 hard load 更新它. 一个简化写法是

$$
\hat z_{t,e}=z_{t,e}+b_e,\qquad
b_e\leftarrow b_e-\eta_b\left(\frac{\tilde n_e}{TK}-\frac1N\right). \tag{101}
$$

这里偏置影响 top-$K$ 选择, 但主模型输出的混合权重仍可由原始 $z$ 计算. 它与 LBL 的差别在控制信号: 式 (101) 直接看 hard count, LBL 通过可导 soft mass 把梯度传回 router 参数. 前者能对执行负载闭环, 后者把均衡偏好纳入训练目标. 偏置控制器也有超参数: $\eta_b$ 太小会追不上路由漂移, 太大会在专家之间振荡; 统计窗口太短受 batch 噪声影响, 太长又反应迟缓.

两者可以组合, 但不能假定效果相加. LBL 改变表征学习和 router logits, 偏置又改变 hard 路线; 当 LBL 已让 soft score接近某种补偿结构, 偏置更新可能不断跨越 top-$K$ 边界. 报告的价值在于把 hard histogram、soft mass、请求路线、保留路线和实际 kernel 行数分开记录. 只盯一个 LBL 标量, 连故障发生在哪一层都无法定位.

### 4.1. 精度系统: 权威状态、派生状态与误差传播

**为什么 FP32 主权重仍是更新的中心。**

混合精度训练需要区分三类对象: 用于优化器更新的 FP32 主权重 $w^{32}$, 用于常规计算的 BF16 权重 $w^{16}$, 用于 MXFP8 GEMM 的量化权重 $(q,s)$. 一次 AdamW 更新可以写成

$$
m_t=\beta_1m_{t-1}+(1-\beta_1)g_t,
\quad
v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^2, \tag{102}
$$

$$
w_t^{32}=(1-\eta\lambda)w_{t-1}^{32}
-\eta\frac{\hat m_t}{\sqrt{\hat v_t}+\epsilon},
\quad
w_t^{16}=\operatorname{cast}_{BF16}(w_t^{32}),
\quad
(q_t,s_t)=Q_{MXFP8}(w_t^{32}). \tag{103}
$$

后两份都是从第一份重建的派生表示. 若直接把低精度权重作为连续更新的唯一状态, 小于该格式量化间隔的增量可能反复舍入为零; FP32 主权重可以积累这些小更新, 到足够大时再反映到计算副本. checkpoint 只保存权威状态和优化器矩, 加载后重建 BF16 与 MXFP8, 因而既减少文件内容, 也允许换并行拓扑.

分布式优化器给这一过程增加了集合关系. 每个 rank 只拥有 $w^{32}$ 的一段和对应的 $m,v$, 完成本地更新后必须重建各计算副本所需的完整 BF16 权重. 专家权重的复制组与稠密权重不同, 所以重建集合不能统一假设为全局 DP 组. `MultiGroupDistributedDataParallel` 按参数绑定复制组, 防止专家梯度在错误的 rank 集合上归约. 一旦组定义错了, 数值仍可能有限、loss 也可能下降, 但不同副本会悄悄更新成不同模型; 这类错误比立刻出现 NaN 更难发现.

**MXFP8 块缩放的误差从哪里来。**

对一个含 32 个元素的块 $x$, MXFP8 用共享尺度 $s$ 和 E4M3 元素 $q_i$ 表示

$$
q_i=\operatorname{clip}_{E4M3}\left(\operatorname{round}_{E4M3}(x_i/s)\right),
\qquad \hat x_i=sq_i. \tag{104}
$$

共享尺度让 scale 元数据只占每 32 元素一份, 也让同一块中的离群值支配其他元素的有效精度. 若块最大绝对值是 $a$, rceil 规则选择足够大的 2 的幂尺度避免 $a$ 超过 448; floor 规则可能选择小一档尺度, 让最大值截断. 取 $a=500$, floor 的 $s=1$ 使 500 被截为 448, 单点绝对误差至少 52; rceil 的 $s=2$ 可覆盖到 896, 最大值不截断, 但其余小值的量化步距随尺度变粗. 两者是在「离群点截断」和「主体分辨率」之间取舍.

量化误差进入线性层时, 令 $\hat X=X+\Delta X$, $\hat W=W+\Delta W$, 则

$$
\hat X\hat W-XW=X\Delta W+\Delta XW+\Delta X\Delta W. \tag{105}
$$

前两项是一阶误差, 末尾一项通常较小, 但训练中它们会经过非线性、残差与反向累计. 只看单次 GEMM 的相对误差不能推出长程优化是否稳定. 报告用同一 checkpoint 分叉 BF16、rceil 和 floor, 让三支共享此前的训练轨迹, 观察后续约 11B token 的 loss 与梯度范数. rceil 与 BF16 接近, floor 的 loss 差和梯度范数偏差明显更大, 说明尺度规则属于训练配方, 并非等价的实现细节.

为什么 Wgrad 仍走 BF16? 前向把激活沿适合 Tensor Core 的维度分成 32 元素块, Wgrad 计算 $X^\top dY$ 时归约维变成 token 维, 原 scale 排布无法直接匹配新的矩阵方向. 若为了 Wgrad 重新 swizzle 和重新量化, 转换成本会落在每个 block 的反向关键路径. Table 33 的对照显示, 保持不合适排布的 MXFP8 Wgrad 比反量化后 BF16 grouped GEMM 慢数倍. 「格式位宽更低」只减少理论载荷; 排布和转换不匹配时, 低精度可以更慢.

**归一化与初始化在这份报告里的真实位置。**

Olmo-core 3 没有提出新的 Transformer 归一化层, 也没有发布一套随系统报告训练完成的新模型架构. 它讨论的「尺度」主要落在三个接口: 主权重到 BF16/MXFP8 派生权重的转换, 共享专家与路由专家输出的合并, 以及 batch 改变时学习率的调整. 因而不能从这份报告推出 RMSNorm、QK-Norm 或某种残差缩放优于其他方案.

报告确实给出一个初始化尺度推导. 设每个路由专家中间宽度为 $d_r$, 共享专家宽度为 $d_s$, 选中 $K$ 个专家, 路由权重 $p_i$ 在选中集合上和为 1. 若各分支近似独立、单个中间单元贡献方差相同, Olmo 的 $Kp_i$ 恢复系数下, 路由与共享输出总方差比例由

$$
R_{var}\approx\frac{d_rK^2\sum_{i=1}^Kp_i^2+d_s}{Kd_r+d_s} \tag{106}
$$

控制. 均匀路由 $p_i=1/K$ 时, 分子成为 $d_rK+d_s$, 恰好与分母相同, $R_{var}=1$. 这说明恢复系数把均匀 top-$K$ 的初始尺度对齐到把稠密中间层切成 $K$ 份的参照. 若权重集中到一个专家, $\sum_i p_i^2$ 接近 1, 路由项放大约 $K$ 倍; 所以等价只在初始化附近和相应独立假设下成立, 训练后的相关性会改变方差.

反向尺度也随系数改变. 对路由专家输出 $f_i(x)$,

$$
\frac{\partial y}{\partial f_i}=Kp_i. \tag{107}
$$

均匀时该系数为 1; 若直接使用和为 1 的 $p_i$, 均匀 top-4 的系数是 0.25, down projection 梯度随之缩小四倍. 这个选择和有效学习率直接耦合. 将系数从 $p_i$ 改为 $Kp_i$ 后仍沿用同一学习率, 等于恢复了分块稠密 MLP 的梯度尺度参照.

**学习率随 batch 扩展的局部推导。**

设单样本梯度均值为 $G$, 协方差为 $\Sigma$, batch 平均梯度为 $\hat G_B$. 有 $E[\hat G_B]=G$ 与 $\operatorname{Cov}(\hat G_B)=\Sigma/B$. 在当前位置对损失做二阶展开,

$$
E[L(\theta-\eta\hat G_B)]\approx L(\theta)-\eta\lVert G\rVert^2
+\frac{\eta^2}{2}\left(G^\top HG+\frac{\operatorname{tr}(H\Sigma)}{B}\right). \tag{108}
$$

对 $\eta$ 求导并令零, 得到局部最优步长

$$
\eta_B^*=\frac{\lVert G\rVert^2}{G^\top HG+\operatorname{tr}(H\Sigma)/B}. \tag{109}
$$

小 batch 时分母中的噪声项占主导, $\eta_B^*$ 近似正比于 $B$; 大 batch 时曲率项占主导, 步长趋于上限. 所以线性规则和饱和规则分别是两端近似. Adam 又对每个坐标用历史二阶矩归一化, 常见的平方根缩放也只是某一统计区间的近似. 报告采用指数 0.53, 是特定模型和 batch 日程下使过渡更平滑的经验值, 并非由式 (109) 唯一推出.

专家只看到部分 token, 也不意味着专家学习率必须乘 $\sqrt{K/N}$. 一个专家的更新频率下降, 但被选中时收到的梯度条件分布、router 的选择偏差、Adam 矩的时间尺度都会改变. 若稀疏出现频率为 $r$, 简化成独立 Bernoulli mask $I_t$, 梯度是 $I_tg_t$, 则一阶矩期望随 $r$ 缩小, 二阶矩期望也随 $r$ 缩小; Adam 的比值在稳态下近似带有 $\sqrt r$ 与 $r$ 的抵消, 不能照搬 SGD 的缩放. 报告扫参没有观察到 $\sqrt{K/N}$ 规则获益, 与这个推断一致.

### 4.2. 长上下文、上下文并行与训练阶段的关系

**序列变长时, MoE 与 attention 的缩放方向不同。**

设序列长度为 $S$, microbatch 中序列条数为 $B_s$, 则 token 数 $T=B_sS$. 一个标准 attention block 的主要算术量含 $O(B_sS^2d)$ 项, MoE 专家 MLP 约为 $O(TKdh)=O(B_sSKdh)$. 序列从 $S$ 增至 $rS$, 若保持序列条数不变, attention 的二次项放大 $r^2$, 专家计算和 EP token 载荷约放大 $r$; 若为了显存把 $B_s$ 降成原来的 $1/r$, 保持 $T$ 不变, 专家工作近似不变, attention 二次项仍放大 $r$.

因此「下一代 Olmo 上下文更长」不能只靠 MoE 栈的吞吐结果外推. 长序列先把压力推向 attention 激活和计算; CP 用序列切分缓解单卡激活, 但会引入 attention 前后的通信. MoE 看到的仍是 token 行, 对序列边界本身不敏感, 可是 CP 与 EP 争用同一批 rank 和网络. Olmo-core 3 用 parallel folding 把稠密视图的 $D\times C$ 重新解释为 MoE 视图的 $D_E\times M_E$, 满足

$$
DC=D_EM_E. \tag{110}
$$

它在 attention 与 MoE block 之间改变同一组 rank 的逻辑坐标, 总卡数没有增加. 稠密 attention 阶段按 CP 交换序列片段, 到 MoE 阶段再按 EP 交换 token 行.

**parallel folding 的一个四卡手算。**

取一个 stage 内四张卡. attention 视图选择 $D=2,C=2$: rank 0、1 构成第一个 DP 副本的两个 CP 分片, rank 2、3 构成第二个. 进入 MoE block 后改成 $D_E=1,M_E=4$, 四张卡共同持有一套专家分片. 式 (110) 两边都是 4. 此时没有专家副本, 专家梯度无需在 EP-DP 维归约, 但每个 token 可能发往四张卡中的任意一张.

若改成 $D_E=2,M_E=2$, 则每两张卡构成一套专家模型分片, 两套之间是专家数据并行副本. 专家权重每卡比 $M_E=4$ 多一倍, token 交换组从四卡缩到两卡, 随后专家梯度要在两个副本间归约. 两种分解的总卡数相同, 前者偏向显存容量, 后者偏向较小的 EP 通信域. 最优点取决于专家参数能否放下、节点拓扑和本地 token 数.

folding 也有布局成本. attention 输出按 CP 的序列分片留在各 rank, MoE router 在每个 rank 的本地 token 上工作, rowwise dispatch 可以直接从这些局部行出发; 不需要先把完整序列 gather 回来. 但下一层 attention 仍要求正确的 CP 视图, combine 必须把每个源 rank 的 token 行送回原位置. route map 因而不仅记录专家, 还承担了从 MoE 视图回到原 token 布局的逆映射. 丢失或错误复用这份元数据会破坏梯度的转置路径.

**上下文扩展会改变 microbatch 临界点。**

固定每卡 token 数 $T$ 时, 序列越长, 序列条数越少. attention kernel 的形状变长, 可能提高某些大矩阵的效率, 也会增加二次 attention 的占比; 专家 grouped GEMM 只看路由后的总行数与直方图, 对 token 来自几条序列不敏感. host 提交路径的 kernel 数量更多取决于 block 数、专家数和 microbatch 次数. 因此长上下文可能让 GPU 单次工作变重, 缓解 CPU 提交落后, 同时又把显存推到需要更小 $T$ 或更多重算的位置.

设显存允许的每卡 token 上限近似为

$$
T_{max}(S)\approx \frac{M_{free}}{a_0+a_1S}, \tag{111}
$$

$a_0T$ 表示 MLP、残差和路由相关的线性激活, $a_1TS$ 表示未采用更省内存 attention 时的二次保存量. 当 $S$ 增大, $T_{max}$ 下降, grouped GEMM 的每专家行数 $TK/N$ 也下降, 可能从计算受限区退到带宽或启动受限区. CP 和重算降低式 (111) 的有效系数, 代价分别是通信和重复计算. 长上下文配方需要重新测 grouped GEMM 交叉点, 不能沿用短序列下的 microbatch.

**训练阶段改变时, 系统口径也要改变。**

预训练通常以所有输入 token 的 loss 为主, 监督微调只在回复 token 上计损失. 设一批总 token 为 $T$, 有监督标签的 token 为 $T_y$, 则训练系统仍为 $T$ 个 token 执行 attention、router、dispatch 和专家 GEMM, 有效监督吞吐却是

$$
R_{sup}=R_{token}\frac{T_y}{T}. \tag{112}
$$

两个系统若总 token 吞吐相同, prompt 更长、回复更短的那一个 $T_y/T$ 更小, 每秒完成的监督目标更少. 这解释了为什么预训练的 token/s 不能直接代表 SFT 数据处理效率.

DPO 把 chosen 和 rejected 都送入策略模型, 还需要参考 log-prob. 若不复用公共前缀, 两条序列的 prompt 部分会重复执行路由和专家计算. 预先离线计算参考模型 log-prob 能省参考模型前向, 不能省策略模型的两条分支. RLVR 再加入生成侧与训练侧的异步差异: rollout 关注 decode 延迟和 KV cache, learner 关注大 batch 前反向与专家并行. Olmo-core 3 的训练栈可承担 learner, 但报告中的预训练吞吐没有覆盖生成、验证器、样本过滤和权重同步.

upcycling 也是阶段选择. 从稠密 checkpoint 复制出多个专家, 初始时专家高度相似, router 分化需要时间; 好处是复用稠密训练形成的表征. 从头训练让专家分化贯穿整个预训练, 初期 loss 可能落后, 长配方里可能追平并反超. OLMoE 的对照在约 500B token 追平、600B 左右反超, 只支持目标训练远长于这一交叉点时的选择. 若剩余预算只有几十或几百 B token, 已有稠密 checkpoint 仍可能更经济.

## 5. 怎样阅读这些实验数字

### 5.1. 吞吐、TFLOP/s 与 MFU 各自省略了什么

token/s/GPU 是端到端速率, 能直接反映一次运行在给定 batch、序列和拓扑下处理数据的速度, 但不同激活参数量的模型不能只凭 token/s 比训练效率. TFLOP/s/GPU 需要先定义「模型 FLOPs」: MoE 通常只数被激活专家的 GEMM, router、通信、量化和布局转换未必计入分子. MFU 再除以硬件理论峰值,

$$
\operatorname{MFU}=\frac{F_{model/token}\,R_{token/GPU}}{F_{peak/GPU}}. \tag{113}
$$

若 MXFP8 运行仍用 BF16 峰值 2250 TFLOP/s 作分母, 得到的是统一 BF16 口径下的利用率, 不是 FP8 Tensor Core 峰值的占用比例. 它便于表内比较, 却不能说明硬件 FP8 单元用了百分之多少. 同样, 重算增加的第二次前向若不计入「有用模型 FLOPs」, MFU 会下降; 若把所有实际执行 FLOPs 都计入, 又可能掩盖为了省显存重复计算的代价.

因此应至少同时看三列: token/s/GPU 说明墙钟速率, 峰值显存说明可行性, 模型规模与激活规模说明每 token 做了多少目标计算. kernel 级 TFLOP/s 用于诊断矩阵效率, 不能代替端到端吞吐. 报告把 1.2T/58B Ultra-128E 的 858 TFLOP/s 与较小模型放在同一表中, 这组数据表示「各自工作点可达到的实测范围」, 不能当作严格的规模扩展曲线, 因为 batch、PP、精度和重算同时变化.

### 5.2. 消融必须固定哪些变量

要判断某个后端是否更快, 至少要固定模型形状、路由直方图、输入与权重数值分布、精度、warmup、编译状态、并行拓扑和计时区间. 第 6.3 节的 GEMM 事故说明「形状相同」还不够: 全零、常数和正态权重在同一硬件上出现显著时间差. 若一个实现用已初始化权重, 另一个读 `torch.empty()` 的残留值, 速度差可能来自功耗和频率状态, 与算法无关.

路由后端还要固定请求路线和容量策略. 随机均匀路由给每个专家接近相同行数, grouped GEMM 形状规整, 也减少拖尾; 学习后的 router 会产生偏斜与时间变化. 报告 production 表中的随机路由适合测系统上限和可运行规模, B.10 的学习路由对照显示 Small 配置可从 841 降到 768 TFLOP/s/GPU, 约 9%. 因而随机路由结果不能直接当作完整训练配方的持续吞吐.

FSDP 与 DDP 的对照同样受配置限定. 报告里的 FSDP 使用 full reshard, 每个 microbatch 都重新 gather; FSDP2 若在梯度累积窗口内保留权重, 行为会接近「常驻计算权重加分片优化器」. Figure 8 证明的是报告所测配置中, full-reshard FSDP 随专家容量增长出现额外通信, 不足以推出所有 FSDP 配置都劣于 DDP.

**局部优化为什么常在完整步里消失。**

设原始一步由计算 $C$、通信 $N$、host 空洞 $H$ 和其他开销 $O$ 组成. 某优化把可见通信中的比例 $r$ 与计算重叠, 理想时间是

$$
T_{ideal}=C+(1-r)N+H+O. \tag{114}
$$

实际重叠会让计算和通信分别膨胀 $\delta_C,\delta_N$, 还可能增加启动开销 $\delta_H$, 则

$$
T_{real}=(1+\delta_C)C+(1-r)(1+\delta_N)N+H+\delta_H+O. \tag{115}
$$

只有 $rN>\delta_CC+(1-r)\delta_NN+\delta_H$ 才有净收益. two-batch overlap 虽覆盖了大量通信区间, EP 传输时长几乎翻倍, GEMM 与 attention 也变慢, 最终只快约 1%. 式 (115) 右侧的资源争用超过了被藏住的时间.

同理, CPU activation offload 的局部目标是减少 GPU 激活显存, 完整约束却包含 D2H/H2D 带宽、主机内存带宽和回传时机. 如果一层在 10.3 ms 内产生 3.96 GB 候选数据, 要完全隐藏 D2H 就需要约 384 GB/s; 实测链路约 53 GB/s 时, 最多只能转移一小部分. 省下来的 GPU 字节若换来关键路径等待, 配置虽然能装下, 墙钟可能失去实用性.

**开放产物为什么影响结论的可迁移性。**

这份报告把论文、对照译稿、代码路径、实验配置和指标定义放在同一条证据链上. 论文给出算法和测量, OLMo-core 仓库给出复制组、rowwise 后端、lease 池、MXFP8 缓存与 checkpoint 视图的具体接口. 对系统论文来说, 代码并非附属品: 诸如「默认 rceil」「wave 后端标为实验性」「派生 FP8 权重不写 checkpoint」都由实现决定, 只读吞吐表无法恢复这些条件.

开放仍不自动等于可复现. 报告的主要硬件是 B300、NVL8 与每卡一条 800G XDR InfiniBand, 部分软件依赖特定 CUDA、NVSHMEM、DeepEP 和编译器版本; 生产表还选取多次运行中的最高速率. 换到 H100、PCIe 节点或较弱的跨节点网络, grouped GEMM 交叉点、EP 后端选择和 offload 上限都会变化. 可迁移的是分解方法: 先分 capacity tax 与 runtime tax, 再按状态、频率、拓扑和调度测量; 具体工作点需要在目标硬件重新取得.

**Olmo-core 3 的开放产物提供了一套能逐项追问的系统边界: 哪份状态由谁持有, 哪条路线实际执行, 哪个数留在 GPU, 哪段通信按什么频率重复, 哪种精度表示才是权威状态.** 这些问题一旦都有可检查的对象, 1.2T 参数的结果才能被拆开复算.

**5.1. 从前向路由到反向梯度: 一条路线的完整生命周期**

**dispatch 与 combine 必须互为转置。**

把一个 microbatch 的 token 矩阵写成 $X\in\mathbb R^{T\times d}$. top-$K$ 路由展开后共有至多 $R=TK$ 条路线. 用稀疏二元矩阵 $A\in\{0,1\}^{R\times T}$ 表示复制与排列: $A$ 的每一行只在来源 token 的位置取 1. 容量裁剪删除某些行后得到 $A_q$. dispatch 可以抽象为

$$
X_E=A_qX, \tag{116}
$$

$X_E$ 已按目标专家的容量槽排列. 专家网络逐段作用得到 $Y_E=F(X_E;W)$, combine 再用路线权重对同一来源 token 求和. 令 $R_p$ 是以选中概率为非零值的稀疏矩阵, 则

$$
Y=R_p^\top Y_E. \tag{117}
$$

反向传播严格要求

$$
\nabla_{Y_E}L=R_p\nabla_YL,
\qquad
\nabla_XL=A_q^\top\nabla_{X_E}L. \tag{118}
$$

因此前向 combine 的反向是按路线把 token 梯度再次发往专家, 前向 dispatch 的反向是把专家输入梯度送回来源 token 并累加. Table 8 的 PUT/GET 方向交换正是式 (118) 的物理实现. 前向 dispatch 由来源 rank PUT 到专家 rank, 其反向由来源 rank GET 回对应行; 前向 combine 由来源 rank GET 专家输出, 其反向由来源 rank PUT 输出梯度.

route map 必须在整个 autograd 生命周期中保持一致. 若重算时重新执行 router, 浮点扰动或随机性让 top-$K$ 路线变化, 反向使用的新 $A_q$ 就不再是原前向的线性算子, 式 (118) 失效. 报告的实现保存路线元数据, 并让路由指标只在原始前向累计. 重算负责恢复可重算的张量值, 不应重新定义已经执行过的离散路线.

**router 权重的梯度来自哪里。**

对 token $t$, 先忽略容量丢弃, 输出为

$$
y_t=\sum_{i\in S_t}r_{t,i}f_i(x_t). \tag{119}
$$

上游梯度记为 $g_t=\partial L/\partial y_t$, 则混合权重的梯度是

$$
\frac{\partial L}{\partial r_{t,i}}=g_t^\top f_i(x_t). \tag{120}
$$

这解释了为什么 combine 的 autograd 除了 route map, 还要能取得各条被接受路线的专家输出. 只保存最终求和后的 $y_t$ 不够: 不同专家输出在求和中混在一起, 无法由一个向量恢复每个 $g_t^\top f_i(x_t)$. rowwise 路径在 token 来源 rank 单独捕获用于 router 梯度的 gather 结果, 专家输出主缓冲则可在 combine 完成后复用.

若选中权重由 top-$K$ 后的 L1 归一化得到,

$$
r_i=K\frac{p_i}{\sum_{j\in S}p_j},\quad i\in S, \tag{121}
$$

那么对选中集合内的 $p_j$,

$$
\frac{\partial r_i}{\partial p_j}
=\frac{K}{Z}\left(\mathbf1[i=j]-\frac{p_i}{Z}\right),
\qquad Z=\sum_{k\in S}p_k. \tag{122}
$$

式 (122) 表明选中专家之间存在竞争: 提高一个 $p_j$ 会抬高自己的系数并压低其他系数, 且所有 $r_i$ 之和固定为 $K$. top-$K$ 集合之外的专家在这个局部区域没有主任务混合梯度, 只可能通过 softmax 的完整 logits 关系或辅助路由目标获得信号. 当某个专家长期选不中时, 主任务很难直接把它拉回来, 这也是负载控制需要观察 hard route 的原因.

容量丢弃进一步改变梯度. 若路线 $i$ 被拒绝, 它不进入式 (119), 主任务对该路线的专家输出和混合权重梯度均为零; router 仍可能通过 LBL 收到梯度. 训练目标此时包含一条隐含的不连续反馈: 越拥挤的专家越可能丢路线, 被丢 token 的主任务梯度又无法通过该专家更新. 提高容量因子会减少这种截断, 同时增大缓冲和最坏工作量.

### lease 解决的是值的生命周期。

对第 $\ell$ 个 MoE block 和第 $u$ 个 microbatch, 记其 dispatch 缓冲为 $B_{\ell,u}$. 前向专家 up projection 读取它, Wgrad 在对应反向中还要用输入重建权重梯度:

$$
\nabla_WL=X_E^\top\nabla_{X_EW}L. \tag{123}
$$

所以 $X_E$ 不能在前向 GEMM 启动后立刻释放. 普通张量由 autograd 引用计数维持生命周期; 对称内存缓冲却来自跨 rank 共同分配的池, 地址固定且容量有限, 需要显式 lease 把「这个槽仍被某次反向持有」编码进分配器.

设调度时刻 $\tau$ 之前, stage $s$ 已完成 $F_s(\tau)$ 次前向和 $B_s(\tau)$ 次相应反向, 至少需要的 dispatch 槽数下界为

$$
L_s^{min}=\max_\tau\left(F_s(\tau)-B_s(\tau)\right). \tag{124}
$$

GPipe 先跑完所有前向再反向, $L_s^{min}$ 接近 microbatch 数; 1F1B 在预热后交替前反向, 高水位较低; virtual stage 的放置会改变每个物理 rank 上多个 stage 的高水位之和. 因而 lease 池大小是流水线调度的函数, 并非单个 MoE block 的常数.

专家输出缓冲的生命周期较短. 前向 combine 已把专家结果取回来源 rank, 反向 combine 依靠保存的 route map 和 token 梯度重新构造专家输出梯度; router 权重梯度需要的专家输出另有捕获. 主专家输出对称缓冲完成传输后即可归还. 把 dispatch 与专家输出一概按最长生命周期保留会浪费显存, 一概立即复用又会破坏式 (123).

一个容易漏掉的故障发生在异常路线数为零时. 某个本地专家在当前 microbatch 没收到 token, 它的 grouped GEMM 区间为空, 但参数仍属于训练图和 DDP 桶. 若实现直接跳过参数的 autograd 路径, 该 rank 可能不产生对应梯度 hook, 集合通信参与顺序便与其他 rank 不同. Olmo-core 在末项 microbatch 以固定顺序发起剩余桶归约, 并保留窗口前段出现过的专家梯度, 使「本批没路由到」不会变成分布式死锁或悄然漏归约.

**一次失败应当从哪组观测量定位。**

训练 loss 突然上升时, 至少有四类互相独立的原因. 第一类是模型目标变化, 可看主任务 loss、LBL、router z-loss 与梯度范数; 第二类是执行路线变化, 可看每专家请求数、保留数、丢弃率、最大负载和 soft mass; 第三类是数值表示变化, 可看量化饱和率、scale 分布、BF16 分支差值和非有限值; 第四类是系统时序变化, 可看 GPU 空洞、host 同步、各 stage 时长、通信区间与 lease 高水位.

这些指标需要按因果顺序对齐. 假设 LBL 下降而最大 hard load 上升, 式 (96) 提示 router 可能进入交叉项抵消结构; 若请求负载平稳、保留路线骤降, 更可能是容量或 route map 问题; 若路线统计不变而梯度范数在切换 floor scale 后抬升, 应先查量化截断; 若数值与路线都稳定、token/s 周期性下降, 再查 PP stage 拖尾和 host 队列.

吞吐下降也能用相同分层处理. grouped GEMM 时间变长时先核对行数直方图和操作数分布; dispatch 变长时看远端比例、载荷字节数和网络路径; GPU 出现空白时区分 CPU 提交不足与 device-to-host 同步; 某个 stage 持续最慢时再看层分配、LM head、重算和路由偏斜. 直接把所有下降归因于「通信」会错过形状、功耗降频和 host 提交这三类来源.

路由系统的最低验收集合可以写成一个守恒关系. 对所有 token 的请求路线总数,

$$
\sum_e\tilde n_e=TK,\qquad
\sum_en_e=TK-N_{drop}. \tag{125}
$$

dispatch 发送行数、专家端有效行数与 combine 接受行数都应等于第二式右侧; 每个来源 token 的 combine 权重只对被接受路线求和. 若三处计数不相等, 问题位于 route map、容量裁剪或通信, 尚未进入模型质量层面. 这类守恒检查比只等待 loss 异常更早暴露错误.

**5.2. checkpoint 如何跨拓扑保持同一个模型**

**参数身份不能由当前 rank 决定。**

训练时的本地张量只是全局参数的一张视图. 设全局专家权重为 $W\in\mathbb R^{N\times d\times h}$, 当前运行使用 $M_E$ 路专家并行和 $D_E$ 路专家数据并行. 某 rank 可能只持有连续的 $N/M_E$ 个专家, 其 FP32 主权重又沿元素轴被 $D_E$ 个副本切分. 若 checkpoint 直接以「rank 17 的本地内存」命名, 改成另一组 $M_E',D_E'$ 后便不知道这一段属于哪个专家、哪个元素区间.

拓扑无关保存给每个张量一个稳定的全局身份, 并记录本地 shard 到全局坐标的映射. 对专家 $e$ 的权重, 可以把局部片段抽象为

$$
W_e[a:b,\,:]\longleftrightarrow
(\text{name},e,[a,b),\text{dtype}). \tag{126}
$$

保存器按全局坐标写入; 加载到新拓扑时, 每个 rank 根据新的专家区间与优化器分片区间读取交集. 旧运行的 rank 编号不进入参数语义. PP 改变时同样如此: 某层从 stage 2 搬到 stage 5, 层名与参数坐标没变, 只改变加载它的 rank 集合.

低显存在线转换的关键是避免先 gather 完整专家张量. 若一个专家矩阵有 $Q$ 个元素, 在单 rank 上聚合完整 FP32 主权重需要额外 $4Q$ 字节; 多个大专家同时聚合会抹掉分片优化器节省的显存. Olmo-core 让 checkpoint 扁平视图别名到现有优化器存储, 各 shard 直接写自己的全局区间. 「视图」在这里没有复制数值, 只是提供 checkpoint 所需的连续索引解释.

这种方案依赖一个严格条件: 所有 shard 对同一参数的全局形状、顺序和 dtype 元数据必须一致. 若专家编号在某次启动中由配置文件顺序决定, 另一次由字典遍历顺序决定, 文件仍能读满, 专家身份却会交换. 若共享专家被误计入路由专家编号, shape 也可能吻合而语义错误. 因而恢复检查除了字节完整性, 还要比较参数名、全局 shape、专家 ID、切片覆盖和重复区间.

**优化器状态决定能否真正续训。**

只加载模型权重可以继续前向, 不等于恢复同一条训练轨迹. AdamW 的下一步依赖 $m_t,v_t$ 和步数 $t$. 若只保留 $w_t$ 而把两个矩清零, 下一步近似变成重新预热的优化器; bias correction 中的 $1-\beta_1^t$ 与 $1-\beta_2^t$ 也会改变. 拓扑转换必须让主权重、两个矩和每参数步数使用相同的全局切片映射.

对第 $i$ 个参数坐标, 完整可续训状态可写为

$$
S_i=(w_i^{32},m_i,v_i,t,\mathcal H), \tag{127}
$$

$\mathcal H$ 还包括学习率日程位置、全局 token 计数、随机数状态和数据迭代位置. 报告的拓扑无关 tensor 解决 $w,m,v$ 的摆放; 精确复现实验还依赖其余训练元数据. 若 global batch 或 world size 随拓扑一起变化, 即使状态完整, 后续样本顺序和梯度平均也可能不同. 「能从 checkpoint 启动」与「逐位复现原轨迹」是两个验收级别.

MXFP8 权重缓存不属于式 (127) 的权威状态. 加载后从 $w^{32}$ 重新量化, 结果由 scale 规则和量化实现决定. 若保存前使用 floor、加载后默认变成 rceil, 模型第一步的计算副本已经变化; 主权重完全相同也无法维持数值连续. checkpoint 元数据应记录量化配方版本, 或由训练配置锁定重建方式.

**从小规模验证到大规模恢复。**

跨拓扑恢复可以用守恒检查逐层验证. 第一层是覆盖: 每个全局参数坐标恰好由预期数量的 shard 覆盖, 无空洞、无重叠. 第二层是值: 在小模型上把旧拓扑 shard 聚合成 CPU 参考张量, 与新拓扑重新聚合后的张量逐元素比较. 第三层是计算: 固定同一输入与随机状态, 比较一次前向输出、loss 和梯度. 第四层是更新: 两边各跑一步优化器, 再比较 FP32 主权重与矩.

MoE 还要固定路线. 若比较时 router 存在随机扰动或容量丢弃依赖 rank 内 token 顺序, 两个拓扑可能选择不同专家, 从而把路由变化误判为 checkpoint 错误. 可以先用固定 route map 检查专家参数映射, 再打开真实 router 检查端到端等价. PP 切分变化则要确保 dropout RNG 按全局层和 token 派生, 否则同一层换 rank 后会取得不同随机序列.

一次成功的单步比较仍不足以覆盖流水线与缓冲生命周期. 新拓扑应跑过至少一个完整的预热、稳态、收尾和 checkpoint 再保存周期, 让每个虚拟 stage、每类专家副本组和空专家路径都出现. 随后再从新 checkpoint 加载一次, 验证转换不是单向的. 这套过程比直接启动长训练便宜, 能在损失曲线出现迟发分叉之前发现映射错误.

大规模作业还应保留一份参数清单摘要: 每个全局张量的元素数、分片数、覆盖区间哈希与恢复后的数值摘要. 总元素数相等只能排除缺失, 不能排除两个等长分片互换; 全局校验和相等也可能掩盖排列错误. 按参数身份分别计算摘要, 再对少量坐标做确定性抽查, 才能把「文件完整」推进到「模型语义完整」. 对 1.2T 参数配置而言, 这种元数据检查远比训练数百步后凭 loss 判断便宜.

## 6. 参考文献

- Ai2. *Supercharging Olmo-core for Efficient and Scalable MoE Training*. 2026. <https://allenai.org/papers/olmocore3>
- Ai2. *Olmo-core 3* (博客). 2026. <https://huggingface.co/blog/allenai/olmocore3> (同文: <https://allenai.org/blog/olmocore3>)
- allenai/OLMo-core. <https://github.com/allenai/OLMo-core>
- Shazeer et al. *Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer*. 2017. <https://arxiv.org/abs/1701.06538>
- Lepikhin et al. *GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding*. 2020. <https://arxiv.org/abs/2006.16668>
- Fedus, Zoph, Shazeer. *Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity*. 2021. <https://arxiv.org/abs/2101.03961>
- Rajbhandari et al. *ZeRO: Memory Optimizations Toward Training Trillion Parameter Models*. 2019. <https://arxiv.org/abs/1910.02054>
- Zhao et al. *PyTorch FSDP: Experiences on Scaling Fully Sharded Data Parallel*. 2023. <https://arxiv.org/abs/2304.11277>
- Rajbhandari et al. *DeepSpeed-MoE: Advancing Mixture-of-Experts Inference and Training*. 2022. <https://arxiv.org/abs/2201.05596>
- Narayanan et al. *Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM*. 2021. <https://arxiv.org/abs/2104.04473>
- Qi et al. *Zero Bubble Pipeline Parallelism*. 2024. <https://arxiv.org/abs/2401.10241>
- DeepSeek-AI. *DeepSeek-V3 Technical Report*. 2024. <https://arxiv.org/abs/2412.19437>
- Wang et al. *Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts*. 2024. <https://arxiv.org/abs/2408.15664>
- Rouhani et al. *Microscaling Data Formats for Deep Learning*. 2023. <https://arxiv.org/abs/2310.10537>
- Mishra et al. *Recipes for Pre-training LLMs with MXFP8*. 2025. <https://arxiv.org/abs/2506.08027>
- McCandlish et al. *An Empirical Model of Large-Batch Training*. 2018. <https://arxiv.org/abs/1812.06162>
- Jacobs et al. *DeepSpeed Ulysses: System Optimizations for Enabling Training of Extreme Long Sequence Transformer Models*. 2023. <https://arxiv.org/abs/2309.14509>
- Liu et al. *MoE Parallel Folding: Heterogeneous Parallelism Mappings for Efficient Large-Scale MoE Model Training with Megatron Core*. 2025. <https://arxiv.org/abs/2504.14960>
- Merrill et al. *Critical Batch Size Revisited: A Simple Empirical Approach to Large-Batch Language Model Training*. 2025. <https://arxiv.org/abs/2505.23971>
- Muennighoff et al. *OLMoE: Open Mixture-of-Experts Language Models*. 2024. <https://arxiv.org/abs/2409.02060>
- Komatsuzaki et al. *Sparse Upcycling: Training Mixture-of-Experts from Dense Checkpoints*. 2022. <https://arxiv.org/abs/2212.05055>

