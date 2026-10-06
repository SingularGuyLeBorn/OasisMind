---
title: "3FS 技术解析: CRAQ 链式复制, FoundationDB 元数据与 USRBIO 客户端"
category: "开源仓库"
tags: ["DeepSeek", "技术解析", "开源仓库", "3FS", "分布式文件系统", "CRAQ", "RDMA"]
published: true
excerpt: "按源码梳理 DeepSeek 3FS 的四组件分离架构, CRAQ 写读路径与 chunk 引擎, FoundationDB 元数据与链状态机, FUSE 与 USRBIO 的取舍, 并逐项核对 180 节点 6.6 TiB/s, GraySort 110.5 TiB 和 KVCache 40 GiB/s 三组数字的测量口径."
---

# 3FS 技术解析: CRAQ 链式复制, FoundationDB 元数据与 USRBIO 客户端

来源: [deepseek-ai/3FS](https://github.com/deepseek-ai/3FS), 2025-02-28 在 DeepSeek 开源周第五天发布 (仓库首个提交 `815e55e` 为 2025-02-27). 仓库没有打版本 tag, 最新提交是 `main` 分支 2026-05-07 的 `22fca04`, 共 113 个提交, 许可证 MIT. 3FS 是 Fire-Flyer 2 AI-HPC 集群的存储层, 论文里报告的同一套 180 节点存储 (360 块 200Gbps 网卡, 理论 9 TB/s, 实测 8 TB/s) 与集群网络, HFReduce 等内容见 [Fire-Flyer AI-HPC 解析](../../03-基础设施/fire-flyer/fire-flyer-analysis.md). README, 设计说明与 USRBIO API 参考的逐段对照见 [3FS 文档对照译稿](3fs-bi.md). 代码引用都给出 GitHub 链接.

## 1. 存储瓶颈与总体架构

### 1.1 四类负载对存储提出的要求

README 把 3FS 的用途列成四类: 数据准备, 训练数据加载, checkpoint, 推理 KVCache. 这四类负载的共同点是读多写少, 而且读的形态差异很大. 数据准备阶段的分析流水线产出大量中间文件, 需要原子地移动目录, 递归删除目录; 训练数据加载要在数千个计算节点上随机取样本, 单个样本几 KB 到几 MB, 在文件里通常不按 4K 对齐; checkpoint 是周期性的大块并行写和故障后的大块并行读; KVCache 是推理时按前缀命中后整块读回之前算好的 key/value.

设计说明给出的目标是「读写吞吐随 SSD 数量和客户端与存储之间的对分带宽线性扩展」, 并且应用不关心数据在哪台机器上. 训练数据加载因此可以不做预取, 也不必提前把数据集打乱再切片: 每个 rank 直接按随机下标从共享存储读样本. 这一点和 DeepSeek 的硬件部署相互印证: [DeepSeek-V3 硬件洞察](../../03-基础设施/deepseek-v3-insights/deepseek-v3-insights-analysis.md) 提到每台训练节点除 8 块 IB 网卡外还单独配一块 400Gbps RoCE 网卡接存储平面, 访问的正是 3FS; [DualPath](../../03-基础设施/dualpath/dualpath-analysis.md) 的实验集群把 3FS 当作 KVCache 后端, 写明集群级 3FS 没有内部 DRAM 缓存, 能跑满存储网卡的 400Gbps. [DeepSeek-V4](../../01-模型技术报告/deepseek-v4/deepseek-v4-analysis.md) 的沙箱平台 DSec 把只读镜像层放在 3FS 上按需拉取数据块.

### 1.2 四个组件与它们之间的数据流

3FS 由集群管理器 (mgmtd), 元数据服务 (meta), 存储服务 (storage) 和客户端四部分组成, 全部接在 InfiniBand 或 RoCE 的 RDMA 网络上. mgmtd 部署多个, 靠一条存放在 FoundationDB 里的租约选主, 默认租期 60 秒, 每 10 秒续一次, 逻辑在 [src/mgmtd/store/MgmtdStore.h](https://github.com/deepseek-ai/3FS/blob/main/src/mgmtd/store/MgmtdStore.h) 的 `extendLease` 和 [src/mgmtd/service/MgmtdConfig.h](https://github.com/deepseek-ai/3FS/blob/main/src/mgmtd/service/MgmtdConfig.h). 主 mgmtd 收各服务心跳, 维护链表和每个存储目标的状态, 把路由信息推给服务和客户端. meta 服务无状态, 所有 inode, 目录项, 文件会话都存在 FoundationDB 里, 客户端可以连任意一台 meta. storage 服务管理本机若干 SSD, 每块 SSD 上切出多个存储目标 (target), 不同 target 加入不同的复制链.

一次读文件的数据流是这样的: 客户端先经 meta 打开文件, 拿到 layout (链表 ID, chunk 大小, stripe 大小, 链范围和 shuffle 种子); 之后按偏移自己算出 chunk 序号和所在链, 查 mgmtd 下发的路由表找到链上的 target, 直接向存储服务发 RPC; 存储服务读盘后用 RDMA Write 把数据写进客户端注册过的内存. meta 只出现在打开, 关闭, 列目录, 改长度这些元数据操作里, 数据路径上没有它. FoundationDB 同时承担两种职责: 文件系统元数据和集群协调 (租约, 节点信息, 配置), 设计说明把这称为「少一个依赖」.

### 1.3 为什么选文件接口和 FUSE 内的原生客户端

设计说明解释了不用对象存储的理由: 对象存储能用带斜杠的键模拟目录, 但给不了原子 rename 目录和递归删除, 而 DeepSeek 内部常见的模式恰好是「先写临时目录, 再整体改名到最终位置」, 处理海量小文件时又离不开递归删除. 符号链接和硬链接被用来给追加式更新的数据集做轻量快照. 文件接口还有一个现实好处: CSV, Parquet 数据集和现有的数据加载器不用改就能读.

客户端没有做成内核 VFS 模块. 内核模块能避开 FUSE 的拷贝和锁争用, 但出错时可能整机宕机且不留日志, 升级要停掉所有使用该文件系统的进程, 否则只能重启. 3FS 的折中是在 FUSE 守护进程里再实现一套原生客户端: 元数据操作仍走 FUSE, 保持 POSIX 语义; 读写数据走共享内存环 (USRBIO), 绕开内核 FUSE 队列. 这个选择决定了后文的很多细节, 包括虚拟目录 `3fs-virt` 的存在, 以及 fd 注册这一步.

## 2. 数据面: 文件布局, CRAQ 复制与 chunk 引擎

### 2.1 文件到链的映射

文件按固定大小的 chunk 切分, chunk 大小和 stripe 大小按目录配置, 新文件继承父目录的 layout. 新建文件时, meta 从链表里按轮转选出连续的 stripe 条链, 再生成一个 shuffle 种子把它们打乱, 种子写进 inode. 客户端算第 $i$ 个 chunk 所在的链时, 先对链编号列表做一次确定性打乱, 再取下标 $i \bmod \text{stripe}$, 代码在 [src/fbs/meta/Schema.cc](https://github.com/deepseek-ai/3FS/blob/main/src/fbs/meta/Schema.cc) 的 `ChainRange::getChainIndexList` 与 `Layout::getChainOfChunk`. chunk 序号是 32 位整数, 超过上限时 `File::getChunkId` 返回 `kFileTooLarge`, 所以单个文件最多 $2^{32}$ 个 chunk.

`ChunkId` 比设计说明写的多一段: 8 字节 inode, 2 字节 track, 4 字节 chunk 序号, 三段都按大端序存, 见 [src/fbs/meta/Schema.h](https://github.com/deepseek-ai/3FS/blob/main/src/fbs/meta/Schema.h). 大端序让同一文件的 chunk 在存储端按序号连续排列, meta 在 close 或 fsync 时可以用一次范围查询找到每条链上的末尾 chunk, 由此算出精确文件长度. 打乱这一步后来成了兼容性问题: 最初用的是 `std::shuffle`, 而 libstdc++ 不同版本对同一种子给出的排列不同, g++10 与 g++11 编出的客户端和服务端会把同一个 chunk 算到不同的链上. 2025-12-26 的 [#369](https://github.com/deepseek-ai/3FS/pull/369) 改成可配置的确定性实现, 构建时必须用 `-DSHUFFLE_METHOD` 锁定与已有集群一致的算法, README 的构建说明因此加了一段 (见 [issue #368](https://github.com/deepseek-ai/3FS/issues/368)).

### 2.2 写路径: 链头串行化, 逐跳拉取, 尾部提交

CRAQ 的写请求只能从链头进入. [src/storage/service/StorageOperator.cc](https://github.com/deepseek-ai/3FS/blob/main/src/storage/service/StorageOperator.cc) 的 `handleUpdate` 先检查本节点的链头身份, 身份不符便返回 `kRoutingError`; 再取 chunk 锁, 拿锁之后重新核对链版本, 防止等锁期间链已经变化. `doUpdate` 用 `rdmaReadBatch` 从客户端 (或前驱) 的内存把写数据拉过来, 每块 IB 设备一个信号量限制并发的 RDMA Read. 数据进本地缓冲后写入存储引擎, 生成待定版本 $u = v + 1$, 然后 `reliableForwarding.forwardWithRetry` 把请求转给后继. 后继同样拉数据, 写盘, 再往后转; 链尾收到后直接提交, 返回确认, 确认沿链回传, 每一跳收到确认后提交本地待定版本并释放锁.

设计说明之外, 代码在写路径上还有两层保护. 第一层是 checksum 比对: 链头在本地写完后会拿自己的 checksum 和后继回传的 checksum 比较, 不一致返回 `kChecksumMismatch`. 第二层是幂等: [src/storage/service/ReliableUpdate.cc](https://github.com/deepseek-ai/3FS/blob/main/src/storage/service/ReliableUpdate.cc) 的 `ReliableUpdate::update` 按 (客户端, 链, channel) 记录最近一次请求的 seqnum, requestId 和结果, 更旧的 seqnum 返回 `kDuplicateUpdate`, 同一 seqnum 重发时直接回放缓存的结果, channel 被占用时返回 `kChannelIsLocked`. 客户端超时重发因此不会把同一次写应用两遍. 版本号冲突也被分成两类: `kChunkCommittedUpdate` 与 `kChunkStaleUpdate` 表示这次更新已经生效过, 按成功处理; `kChunkMissingUpdate` 与 `kChunkAdvanceUpdate` 表示中间缺了更新或版本跳了号, 作为错误返回.

### 2.3 读路径: 读任意副本与待定版本

CRAQ 允许读请求发给链上任一副本, 这是 3FS 能用满所有副本读带宽的前提. 客户端选副本的策略在 [src/client/storage/TargetSelection.h](https://github.com/deepseek-ai/3FS/blob/main/src/client/storage/TargetSelection.h), 有 Default, LoadBalance, RoundRobin, RandomTarget, TailTarget, HeadTarget 和手工模式, 另外可以按 `trafficZone` 偏向同一网络区域的 target. 存储端 `StorageOperator::batchRead` 拿一份 target 路由快照, 只接受处于 up-to-date 状态的 target, 把读请求按 `batch_read_job_split_size` 切成多个作业交给 AIO 线程池 (libaio 或 `io_uring`), 读完后一次性 RDMA Write 回客户端, 小数据也可以用 `SEND_DATA_INLINE` 随响应带回.

设计说明对「同时有已提交版本和待定版本」的处理是返回一个特殊状态码, 让客户端稍后重试或改发宽松读. 这只在旧的 C++ 存储路径上成立: [src/storage/store/ChunkReplica.cc](https://github.com/deepseek-ai/3FS/blob/main/src/storage/store/ChunkReplica.cc) 的 `aioPrepareRead` 在 commitVer 不等于 updateVer 时返回 `kChunkNotCommit`, 客户端 [src/client/storage/StorageClientImpl.cc](https://github.com/deepseek-ai/3FS/blob/main/src/client/storage/StorageClientImpl.cc) 把它和 `kRoutingVersionMismatch` 归为快速重试错误. Rust 引擎路径 [src/storage/store/ChunkEngine.cc](https://github.com/deepseek-ai/3FS/blob/main/src/storage/store/ChunkEngine.cc) 只读已提交的 chunk 元数据, 正在写的新 chunk 挂在引擎的 `writing_list` 里, 读请求看不到它, 直接拿到上一个已提交版本. 宽松读对应请求里的 `ALLOW_READ_UNCOMMITTED` 特性位. 2025 年 9 月和 10 月的两个提交 [#341](https://github.com/deepseek-ai/3FS/pull/341), [#346](https://github.com/deepseek-ai/3FS/pull/346) 又放宽了批量读对链版本和公开状态的检查, 换来的是故障切换期间少一些读失败.

Fire-Flyer 论文还描述了一个读侧的拥塞控制: 存储服务读完 SSD 后先向客户端申请发送许可, 客户端限制同时向它发数据的服务数, 拿到许可的服务才用 RDMA Write 加 RDMA Send 把数据送过去. 代码里对应 [src/common/net/RDMAControl.h](https://github.com/deepseek-ai/3FS/blob/main/src/common/net/RDMAControl.h) 的 `RDMAControlImpl`, 客户端默认 `max_concurrent_transmission` 为 64, 服务端在 [src/common/serde/CallContext.cc](https://github.com/deepseek-ai/3FS/blob/main/src/common/serde/CallContext.cc) 的 `RDMATransmission::applyTransmission` 里申请. 这一机制提高了端到端延迟, 换来的是数百台存储同时向一台客户端回数据时不出现 incast 拥塞.

### 2.4 chunk 引擎: 两套实现与 Rust 引擎的写法

C++路径使用 `ChunkStore` / `ChunkReplica`, 元数据默认放 LevelDB ([src/storage/store/PhysicalConfig.h](https://github.com/deepseek-ai/3FS/blob/main/src/storage/store/PhysicalConfig.h)).

Rust实现位于 [`src/storage/chunk_engine`](https://github.com/deepseek-ai/3FS/blob/main/src/storage/chunk_engine/README.md), 元数据放 RocksDB, 设计说明也覆盖该实现. 每个 target 用哪套由 `only_chunk_engine` 决定, 代码默认值是 `false`, 但官方部署脚本 [`deploy/data_placement/src/setup/gen_chain_table.py`](https://github.com/deepseek-ai/3FS/blob/main/deploy/data_placement/src/setup/gen_chain_table.py) 生成的建 target 命令都带 `--use-new-chunk-engine`, 按部署指南搭出的集群走 Rust 引擎. 社区文章里「元数据默认用 LevelDB」的说法对应的是旧路径.

Rust 引擎把物理空间分成 11 档, 从 64KiB 到 64MiB 按 2 的幂递增 ([`src/storage/chunk_engine/src/types/constants.rs`](https://github.com/deepseek-ai/3FS/blob/main/src/storage/chunk_engine/src/types/constants.rs)). 每档每块盘 256 个数据文件, 空间按 group 管理, 一个 group 256 个块, 用 256 位位图记录占用; 分配器优先在活跃 group 里找空位, 没有就取一个已分配的 group, 再没有才同步 `fallocate` 一段新空间. 后台 `allocate_thread` 预分配, `compact_thread` 把稀疏 group 里的块搬走以回收空间. RocksDB 里有三张映射: `chunk_id` 到 chunk 元数据, `group_id` 到 group 状态 (用 RocksDB 的 MergeOp 原子更新), 物理位置到 `chunk_id` (给压缩线程反查用).

写入流程在 [`src/storage/chunk_engine/src/core/engine.rs`](https://github.com/deepseek-ai/3FS/blob/main/src/storage/chunk_engine/src/core/engine.rs) 的 `update_chunk`: 先校验数据的 CRC32C, 比较链版本 (更低则 `ChainVersionMismatch`), 再比较更新版本号, 小于等于已提交版本返回 `ChunkCommittedUpdate`, 跳号返回 `ChunkMissingUpdate`. 若写入覆盖已有范围, 或追加后超过当前块的容量, 走 `copy_on_write`: 分配新块, 读旧数据, 合并新数据, 写到新块; 纯追加且块容量够时走 `safe_write`, 原地写到块尾. 新 chunk 先挂进 `writing_list` 并持久化一条「写中」记录, `commit_chunk` 时再用一个 WriteBatch 原子地更新 chunk 元数据和新旧块的占用状态, 刷新内存缓存. 进程重启时 `occupy_uncommitted_positions` 把写中记录对应的块重新占住并标记为中止, 避免空间泄漏. 代价是随机覆盖写会放大: 改 4KiB 要读写整个 chunk, 对读多写少的负载可以接受, 对小块随机更新不友好.

## 3. 控制面: 元数据, 成员管理与恢复

### 3.1 FoundationDB 上的 inode 与目录项

元数据只有两种核心记录. inode 的键是前缀 `INOD` 加 64 位 inode id, 值里存属主, 权限, 时间戳, 以及按类型不同的字段: 文件存长度, chunk 大小, 链范围和 shuffle 种子; 目录存父目录 id 和默认 layout; 符号链接存目标路径. 目录项的键是 `DENT` 加父目录 id 加名字, 值是目标 inode id 和类型, 同一目录下的条目在键空间里连续, 列目录就是一次范围读. 全部键前缀列在 [src/common/kv/KeyPrefix-def.h](https://github.com/deepseek-ai/3FS/blob/main/src/common/kv/KeyPrefix-def.h), 除这两种外还有 mgmtd 的节点信息, 链表, 配置, 以及 meta 的幂等记录 (IDEM) 和文件会话等.

inode id 单调递增, 键却按小端序编码 ([src/fbs/meta/Common.h](https://github.com/deepseek-ai/3FS/blob/main/src/fbs/meta/Common.h) 的 `InodeId::packKey`). FoundationDB 按键的字典序切分区间分给存储进程, 大端序下新分配的 inode 全落在同一区间, 写入集中在一台机器上; 小端序把变化最快的低位放在最前, 相邻 id 的键分散到整个键空间. 元数据操作全部包在 FoundationDB 的事务里: 只读事务服务 stat, lookup, listdir; 读写事务服务 create, link, unlink, rename. FoundationDB 用读写键集合做冲突检测, 冲突时 meta 自动重试, 所以多台 meta 可以并行处理请求. 目录 rename 要防止把目录移进自己的子树, meta 从目标目录一路向上查祖先, 默认目录深度上限 `max_directory_depth` 为 64 ([src/meta/base/Config.h](https://github.com/deepseek-ai/3FS/blob/main/src/meta/base/Config.h)).

### 3.2 文件会话, 文件长度与动态 stripe

本地文件系统删除一个打开中的文件时, 要等所有 fd 关闭才真正释放, 为此必须跟踪 fd. 训练作业启动时会一次打开大量文件, 若都登记会压垮 meta 和 FoundationDB, 所以 3FS 只给写方式打开的 fd 建会话, 只读 fd 不跟踪. 删除仍有写会话的文件时, meta 推迟删除到会话结束; 离线客户端留下的会话由 meta 定期检查存活后清理. 文件数据的回收交给后台 GC, 默认 `gc_file_delay` 为 5 分钟, 可用空间低于 5% 时取消延迟立即回收 ([src/meta/base/Config.h](https://github.com/deepseek-ai/3FS/blob/main/src/meta/base/Config.h)). README 的 KVCache 图里, GC 删除操作每隔一两分钟出现一次约 1 MIOPS 的尖峰, 就是这条回收路径.

文件长度采用延迟收敛. 写入时客户端定期把每个写打开文件的最大写入位置报给 meta, 位置超过 inode 里的长度且没有并发 truncate 时就更新长度; close 或 fsync 时 meta 向存储查每条链的末尾 chunk, 算出精确长度. 设计说明写的上报周期是 5 秒, 开源代码 FUSE 侧 `periodic_sync` 默认 30 秒, 每轮最多 1000 个 inode, 实际间隔再乘 0.7 到 1.3 的随机系数 ([src/fuse/FuseConfig.h](https://github.com/deepseek-ai/3FS/blob/main/src/fuse/FuseConfig.h)). 多台 meta 同时改同一文件长度会事务冲突, 所以长度更新任务按 inode id 分派给固定的一台 meta, 实现在 [src/meta/components/Distributor.cc](https://github.com/deepseek-ai/3FS/blob/main/src/meta/components/Distributor.cc) 的 `Distributor::getServer`, 用 `Weight::select` 在在线 meta 中按权重哈希选择.

精确长度要查每条链, 生产环境 stripe 为 200, 小文件也查 200 条链很浪费. 设计说明给出的优化是在 inode 里记一个「可能用到的链数」, 初值 16, 文件写到更多链时翻倍, 查长度和删除时只查这么多条. 开源配置里这个功能默认关闭: meta 端 `dynamic_stripe` 默认 `false`, 初值 16, 增长因子 2, [`configs/meta_main.toml`](https://github.com/deepseek-ai/3FS/blob/main/configs/meta_main.toml) 也写 `false`. 自建集群如果沿用大 stripe, 小文件的 close 与删除会比 DeepSeek 生产环境慢.

### 3.3 心跳, 租约与链状态机

故障检测靠心跳. mgmtd 在 `heartbeat_fail_interval` (默认 60 秒, 即设计说明里的 T) 内收不到某服务的心跳就宣布它故障; 服务一侧若 T/2 联系不上 mgmtd 就停止服务并退出. 这个不对称保证了被判死的服务一定已经自己停下, 不会出现 mgmtd 已把它移出链, 它还在接写请求的情况. 服务若发现自己某个 target 的公开状态是 lastsrv 或 offline, 也立即退出, 因为这说明它可能被网络分区隔开了.

每个 target 有本地状态 (up-to-date, online, offline, 由服务在心跳里上报) 和公开状态 (serving, syncing, waiting, lastsrv, offline, 随链表下发). mgmtd 定期扫描每条链, 按转移表计算新的公开状态, 实现是 [src/mgmtd/service/updateChain.cc](https://github.com/deepseek-ai/3FS/blob/main/src/mgmtd/service/updateChain.cc) 的 `generateNewChain`. 代码先按 SERVING, LASTSRV, SYNCING, WAITING, OFFLINE 的顺序重排链成员, 再做转移, 其中两条规则比设计说明的表更严: 只有「链上有 SERVING 且没有 SYNCING」时, 才把排在最前的一个 WAITING 或 OFFLINE 成员提升为 SYNCING, 所以一条链同一时刻最多一个成员在同步; 所有 SERVING 同时离线时, 只有排第一的变成 LASTSRV, 它是唯一可能持有最新数据的副本, 其余进 OFFLINE. 链有任何变化, 链版本加一, 写请求里的链版本对不上就被拒绝, 这是第 2.2 节写路径第一步检查的来源. 2026-05-07 的最新提交 [#413](https://github.com/deepseek-ai/3FS/pull/413) 修的正是「链表版本必须单调递增」.

### 3.4 数据恢复与恢复期间的流量均衡

target 重新上线后, 服务先等最新链表把它的所有 target 都标为 offline 才开始发心跳, 确保每个 target 都走一遍恢复. 恢复以「整 chunk 替换写」为单位: 前驱先发 dump-chunkmeta 拿到后继的全部 chunk 元数据 (id, 链版本, 已提交和待定版本号), 和本地比对后决定传哪些; 只在本地有的传, 只在远端有的删, 本地链版本更大的传, 链版本相同但本地已提交版本不等于远端待定版本的传. 传输时逐 chunk 加锁, 读出链版本, 版本号和内容, 发整 chunk 替换写, 再解锁, 全部传完发 sync-done. 同步期间新到的客户端写也被前驱改写成整 chunk 发给后继. 这套做法省掉了日志回放, 代价是恢复期间网络流量按 chunk 大小放大, 设计说明没有给出实测恢复速度.

恢复期间还有一个读负载问题. 链上一个副本故障后, 它的读流量转到同链其他副本上; 如果每块 SSD 只和固定的两块 SSD 组链 (设计说明第一张表, A 只和 B, C 同链), A 故障时 B, C 各多扛一半, 立刻成为全系统瓶颈, 而换盘加同步可能要几个小时. 解决办法是让每块 SSD 和尽可能多的 SSD 组过链, 设计说明把它表述为平衡不完全区组设计 (BIBD). 仓库的求解器在 [`deploy/data_placement/src/model/data_placement.py`](https://github.com/deepseek-ai/3FS/blob/main/deploy/data_placement/src/model/data_placement.py), 用 Pyomo 建整数规划, HiGHS 求解, 以任意两节点之间的「对等流量」上下界相等为目标. 设计说明的第二张示例表并没有做到均衡: 按表计算, A 故障时 D 接走 30%, E 只接 10%, 合格的设计应让每对节点恰好同链 $\lambda = r(k-1)/(v-1) = 5 \times 2 / 5 = 2$ 次.

$$
\lambda (v - 1) = r (k - 1), \quad b k = v r
$$

式中 $v$ 是节点 (或 SSD) 数, $b$ 是链数, $k$ 是每条链的副本数, $r$ 是每块 SSD 上的 target 数, $\lambda$ 是任意两块 SSD 同时出现的链数. 部署指南的例子是 5 节点, 3 副本, 每盘 6 个 target, 求解器输出 $b = 10$, 每对节点之间的对等流量都是 1.5. 恢复路径上也有已知问题: [issue #345](https://github.com/deepseek-ai/3FS/issues/345) 报告重同步中途再次离线的 target 不能自动回到 serving, 加上一条链只允许一个 SYNCING, 卡住的成员会挡住同链其他成员的恢复; 2026-03 的 [#403](https://github.com/deepseek-ai/3FS/pull/403) 修了同步期间 truncate 与 extend 操作的处理.

## 4. 客户端: FUSE 与 USRBIO 的取舍

### 4.1 FUSE 路径的三个上限

FUSE 客户端的门槛最低, 多数应用直接用挂载点读写. 它的第一个上限是请求速率: 内核 FUSE 把请求放进一个自旋锁保护的共享队列, 用户态守护进程从中取请求, 锁争用使吞吐不随线程数增长, 设计说明的实测是每秒约 40 万次 4KiB 读, 合 $400\text{K} \times 4\ \text{KiB} \approx 1.5\ \text{GiB/s}$, 不到一块 200Gbps 网卡的十分之一. 第二个上限是单次请求大小: 3FS 把 FUSE 连接的 `max_read` / `max_write` 设成 `io_bufs.max_buf_size`, 默认 1MB ([src/fuse/FuseConfig.h](https://github.com/deepseek-ai/3FS/blob/main/src/fuse/FuseConfig.h)). 第三个是写并发: Linux 5.x 的 FUSE 对同一文件的写持有 inode 锁, 同一文件不能并发写, 应用只能同时写多个文件来提高总吞吐.

FUSE 侧也做了一些弥补. 只读打开且启用读缓存时走内核页缓存, `max_readahead` 默认 16MB; 写入经守护进程里的写缓冲合并 (`write_buf_size` 1MB). 虚拟目录 `3fs-virt` 承载了文件系统接口表达不了的操作: 在 `3fs-virt/rm-rf/` 下建符号链接即请求 meta 递归删除目标目录, `get-conf` / `set-conf` 用来读写配置, `iovs/` 用于 USRBIO 的共享内存注册, 实现在 [src/fuse/FuseOps.cc](https://github.com/deepseek-ai/3FS/blob/main/src/fuse/FuseOps.cc). smallpond 删除中间目录时就用 `rm-rf` 这个入口.

### 4.2 USRBIO 的结构

USRBIO 的数据结构仿照 `io_uring`: Iov 是用户进程与 FUSE 守护进程共享的一大块内存, 由守护进程注册给 IB 网卡, 读出的数据直接被 RDMA 写进来, 要写的数据由存储服务直接从这里 RDMA 读走; Ior 是一个小的共享环, 用户进程放提交项, 守护进程放完成项. 共享内存的交接借用文件系统完成: [src/lib/api/UsrbIo.cc](https://github.com/deepseek-ai/3FS/blob/main/src/lib/api/UsrbIo.cc) 的 `hf3fs_iovcreate` 在 `/dev/shm` 建文件, 再在挂载点 `3fs-virt/iovs/` 下建一个符号链接, 链接名里编码共享内存 ID, block 大小, 读写方向, `io_depth`, 优先级和超时, 守护进程截获这次 `symlink` 调用后 mmap 同一块内存. 用户进程的 fd 由内核管理, 守护进程不知道它对应哪个 inode, 所以要先 `hf3fs_reg_fd`: 函数用 `statx` 取 inode, `dup` 一个新 fd 登记进表, 成功时返回 `-dupfd`, 失败返回正的错误码, 和其他函数的约定相反.

提交与完成由IPC信号量唤醒. 用户调 `hf3fs_submit_ios` 对信号量做一次 post, 守护进程的 watcher 线程等信号量 (带随机抖动的超时兜底) 后取提交项, 交给 `ioRingWorker` 协程查 inode, 查 Iov, 组成批量读写请求发往存储服务.

`io_depth`控制批大小. 取0时请求立即发送.

取正数时等待请求数达到设定值.

取负数时批量上限为$|io\_depth|$,等待超过`timeout`便发送 ([src/fuse/IoRing.cc](https://github.com/deepseek-ai/3FS/blob/main/src/fuse/IoRing.cc)). 2026-03-30 的 [#404](https://github.com/deepseek-ai/3FS/pull/404) 修正了这里的超时判断. 每轮请求数固定的数据加载器可设置正值. 请求数不确定时使用0或负值,防止末批长期等待.

### 4.3 两条路径怎么选

USRBIO 换来的收益集中在小块随机读和大块顺序读两端. 小块随机读不再经过内核 FUSE 队列, 请求在守护进程里攒批后合成少量 RPC; 大块读不受 1MB 单次上限, 一次请求可以是 32MiB 甚至更大 (API 文档的示例就是 1024 个 32MiB 块). 数据从网卡直接进用户可见的内存, 用户态与内核态之间没有拷贝. 社区文章引用过「比 FUSE 快 3 到 5 倍」的说法, 仓库没有给出这个对比的测试条件; README 的峰值吞吐测试要求用 fio 的 USRBIO 引擎 ([`benchmarks/fio_usrbio/README.md`](https://github.com/deepseek-ai/3FS/blob/main/benchmarks/fio_usrbio/README.md)), 说明官方数字都是零拷贝路径上的.

代价在接入成本和语义上. 应用要改代码: 管理 Iov 与 Ior 的生命周期, 注册 fd, 保证读写缓冲落在 Iov 内且不跨 block 边界, 一个环只能由一个线程提交, 一个线程收割. 元数据操作 (open, close, stat) 仍然经过 FUSE, 元数据密集的负载得不到加速. 存储节点内部也不是全程用户态: 存储服务读盘走内核 Direct IO, 没有用 SPDK 一类的用户态 NVMe 驱动, 零拷贝指的是客户端这一侧. 社区的 [open3fs/smallpond-3fs](https://github.com/open3fs/smallpond-3fs) 分支让 smallpond 的 DuckDB 引擎改走 USRBIO, 也从侧面说明上游 smallpond 只走 FUSE 挂载.

## 5. 性能数字的口径, 版本演进与局限

### 5.1 180 节点 6.6 TiB/s 读吞吐

README 的峰值吞吐测试用 180 台存储节点, 每台 2 块 200Gbps InfiniBand 网卡, 16 块 14TiB NVMe; 客户端 500 多台, 每台 1 块 200Gbps 网卡; 结果是「在训练作业背景流量存在的情况下」聚合读吞吐约 6.6 TiB/s. README 没有给出读块大小 (图注只写 large block), 副本数和压测持续多久, 也没有说 6.6 TiB/s 是否包含训练作业自己的那部分流量. 压测工具是仓库里的 fio USRBIO 引擎, 所以这是零拷贝客户端路径上的数字.

![](images/peak_throughput.jpg)

图注: 横轴是 07:30 到 07:40 的 10 分钟, 纵轴为 TiB/s, 浅色散点是采样值, 实线是平滑后的吞吐. 吞吐在开始后约半分钟爬到 6.6 TiB/s 上下, 之后在 6.5 到 6.9 TiB/s 之间波动, 后半段略高; 期间有四次明显下陷, 低点在 6.3 到 6.4 TiB/s, 每次持续十几秒.
图 1 解析: 横轴是 07:30 到 07:40 的 10 分钟, 纵轴为 TiB/s, 浅色散点是采样值, 实线是平滑后的吞吐. 吞吐在开始后约半分钟爬到 6.6 TiB/s 上下, 之后在 6.5 到 6.9 TiB/s 之间波动, 后半段略高; 期间有四次明显下陷, 低点在 6.3 到 6.4 TiB/s, 每次持续十几秒. 下陷的原因文档没有给出, 结合「有训练作业背景流量」这一说明, 较可能来自同时运行的作业 (例如 checkpoint 写入) 抢占了存储带宽.

把这个数字放回硬件上限里看. 存储侧网卡总量是 $360 \times 25\ \text{GB/s} = 9\ \text{TB/s}$, 6.6 TiB/s 合 7.26 TB/s, 约占 81%; 平均到每台存储节点约 37.5 GiB/s. 每台 16 块 PCIe 4.0 NVMe 的顺序读合计远超 50 GB/s, 磁盘不是瓶颈, 网络才是. 客户端侧 500 台合计 12.5 TB/s, 每台平均只用了不到六成. Fire-Flyer 论文对同一批硬件给的是理论 9 TB/s, 实测 8 TB/s, 两者差别在口径: 论文的 8 TB/s 是峰值, README 的 6.6 TiB/s 是带背景流量时的持续值, 而且单位一个是 TB 一个是 TiB. 论文还提到 2880 块 SSD 以镜像冗余提供 20 PiB 以上的空间, $2880 \times 14\ \text{TiB} \approx 39.4\ \text{PiB}$ 的裸容量除以 2 正好在 20 PiB 附近, 说明生产环境这批存储用的是两副本链, 设计说明里的三副本只是示例.

### 5.2 GraySort 110.5 TiB / 30 分 14 秒

GraySort 测试由 smallpond 驱动: 25 台存储节点 (每台 2 个 NUMA, 每个 NUMA 一个存储服务, 2 块 400Gbps 网卡), 50 台计算节点 (每台 192 物理核, 2.2 TiB 内存, 1 块 200Gbps 网卡), 110.5 TiB 数据排进 8192 个分区, 用时 30 分 14 秒, 平均 3.66 TiB/min. 算法分两阶段, 先按键的前缀位 shuffle 到分区, 再在分区内排序, 两阶段都读写 3FS. 脚本在 [`smallpond 的 benchmarks/gray_sort_benchmark.py`](https://github.com/deepseek-ai/smallpond/blob/main/benchmarks/gray_sort_benchmark.py), smallpond 侧的执行细节见 [smallpond 技术解析](../smallpond/smallpond-analysis.md).

![](images/gray_sort_server.png)

图注: 存储服务端每台的平均读 (蓝) 写 (橙) 吞吐, 单位 GiB/s, 四条红色竖虚线大约在 17:55, 18:01, 18:15, 18:31. 第一段只有写, 每台约 20 到 23 GiB/s, 形态是生成输入数据; 第二段 (18:01 到 18:15) 读写交替起伏, 对应 shuffle 阶段一边读输入一边写分区; 第三段 (18:15 到 18:31) 先有一阵读尖峰, 随后读写都稳定在 5 到 8 GiB/s, 对应分区内排序.
图 2 解析: 存储服务端每台的平均读 (蓝) 写 (橙) 吞吐, 单位 GiB/s, 四条红色竖虚线大约在 17:55, 18:01, 18:15, 18:31. 第一段只有写, 每台约 20 到 23 GiB/s, 形态是生成输入数据; 第二段 (18:01 到 18:15) 读写交替起伏, 对应 shuffle 阶段一边读输入一边写分区; 第三段 (18:15 到 18:31) 先有一阵读尖峰, 随后读写都稳定在 5 到 8 GiB/s, 对应分区内排序. 存储端写峰值约 22 GiB/s, 读峰值约 29 GiB/s, 都远低于每台 2×400Gbps 的网卡上限.

![](images/gray_sort_client.png)

图注: 计算节点 (客户端) 的读写吞吐, 虚线是峰值, 实线是平均. 生成阶段每台平均写约 8 GiB/s; shuffle 阶段读的峰值贴近 22 GiB/s, 接近 200Gbps 网卡的 23.3 GiB/s, 平均读写各在 3 到 6 GiB/s; 排序阶段平均读约 5 GiB/s, 平均写约 2 到 3 GiB/s.
图 3 解析: 计算节点 (客户端) 的读写吞吐, 虚线是峰值, 实线是平均. 生成阶段每台平均写约 8 GiB/s; shuffle 阶段读的峰值贴近 22 GiB/s, 接近 200Gbps 网卡的 23.3 GiB/s, 平均读写各在 3 到 6 GiB/s; 排序阶段平均读约 5 GiB/s, 平均写约 2 到 3 GiB/s. README 没有说 30m14s 是否含生成数据, 从图上数, 18:01 到 18:31 约 30 分钟, 与 30m14s 吻合, 生成阶段的约 6 分钟不在计时内.

用这几张图可以核对 3.66 TiB/min. $110.5 \times 1024 / 1814 \approx 62.4\ \text{GiB/s}$, 摊到 50 台计算节点每台每秒排序约 1.25 GiB 数据. 两阶段各读一遍, 写一遍, 客户端侧 IO 至少是数据量的 4 倍, 即 442 TiB, 平均每台客户端约 5 GiB/s, 约为网卡上限的 21%, 与图 3 的平均线一致. 社区有文章拿 62 GB/s 去比客户端网卡总量 1.25 TB/s 得出 5% 的利用率, 没有计入这 4 倍 IO. 以 sortbenchmark 的 Spark 2014 年记录作参照: 206 台 EC2 i2.8xlarge, 23 分钟排完 100 TB, 约 4.27 TB/min; 3FS 加 smallpond 的 110.5 TiB 合 121.5 TB, 30.2 分钟, 约 4.02 TB/min. 两者量级相同, 而后者用了更快的网络和更多的核, GraySort 本身说明不了 3FS 的优势, 它展示的是 smallpond 这种「每个分区一个 DuckDB 进程, 中间数据全落共享存储」的简单架构能在 3FS 上跑到这个量级.

### 5.3 KVCache 读吞吐与 GC

README 的 KVCache 图给的是所有 KVCache 客户端的读吞吐, 每台客户端 1 块 400Gbps 网卡, 峰值最高 40 GiB/s; 下图是同一时段 GC 删除操作的 IOPS. 网卡规格在 2025-03-03 的 [PR #58](https://github.com/deepseek-ai/3FS/pull/58) 才补进 README. 文档没有给出客户端台数, KV 块大小, 命中率和读取的 token 数.

![](images/kvcache_read_throughput.png)

图注: 09:00 到 09:30 的半小时, 纵轴 GiB/s. 虚线是各时刻所有客户端中的最高值, 多数时间在 35 到 41 GiB/s; 实线是客户端平均值, 只有 2 到 3 GiB/s; 背后的彩色散点是单台客户端的采样.
图 4 解析: 09:00 到 09:30 的半小时, 纵轴 GiB/s. 虚线是各时刻所有客户端中的最高值, 多数时间在 35 到 41 GiB/s; 实线是客户端平均值, 只有 2 到 3 GiB/s; 背后的彩色散点是单台客户端的采样. 峰值线接近 400Gbps 网卡的 $50\ \text{GB/s} \approx 46.6\ \text{GiB/s}$, 约 86%, 说明单台客户端可以把网卡读满; 平均值低一个数量级, 说明 KVCache 读取是突发的, 多数客户端多数时间在等计算.

![](images/kvcache_gc_iops.png)

图注: 同一时段 GC 删除操作的 IOPS, 单位百万次每秒. 删除以脉冲形式出现, 半小时内约 22 次, 平均间隔约 80 秒, 每次峰值 0.8 到 1.4 MIOPS, 两次脉冲之间接近 0.
图 5 解析: 同一时段 GC 删除操作的 IOPS, 单位百万次每秒. 删除以脉冲形式出现, 半小时内约 22 次, 平均间隔约 80 秒, 每次峰值 0.8 到 1.4 MIOPS, 两次脉冲之间接近 0. KVCache 的条目寿命短, 过期后成批删除, 这张图说明 meta 和存储的删除路径能承受百万级的批量删除而不拖累读.

把吞吐换成 token 数需要每个 token 的缓存大小, 文档没有给出. 若按 DeepSeek-V3 的 MLA 缓存推算 (见 [DeepSeek-V3 技术解析](../../01-模型技术报告/deepseek-v3/deepseek-v3-analysis.md)): 61 层, 每层每 token 存 512 维压缩 KV 加 64 维 RoPE key, 按 BF16 存放, 每 token $61 \times 576 \times 2 = 70272$ 字节, 约 68.6 KiB. 40 GiB/s 的峰值对应单台客户端每秒约 61 万 token 的前缀, 2.5 GiB/s 的平均值约 3.8 万 token. 这条推算只依赖模型结构, 实际存储格式 (是否 FP8, 是否按页对齐) 文档没有给出.

### 5.4 版本演进

仓库没有发版 tag, 演进只能看提交. 113 个提交大致分四段, 列在下面.

- 2025-02 到 2025-03: 开源后的头一个月以构建与平台适配为主, 包括 fio USRBIO 引擎 ([#62](https://github.com/deepseek-ai/3FS/pull/62)), arm64 / aarch64 支持, CentOS, openEuler, OpenCloudOS, TencentOS 的构建镜像, 以及 README 补充 KVCache 客户端网卡规格.
- 2025-04 到 2025-08: Rust chunk 引擎的一致性修复集中出现, 包括 meta 缓存与 meta 存储的写入顺序 ([#252](https://github.com/deepseek-ai/3FS/pull/252)), 批量删除越界与不一致 ([#256](https://github.com/deepseek-ai/3FS/pull/256), [#326](https://github.com/deepseek-ai/3FS/pull/326)), 删除与压缩的竞态导致元数据损坏 ([#322](https://github.com/deepseek-ai/3FS/pull/322)), 移动与提交 chunk 的不一致 ([#325](https://github.com/deepseek-ai/3FS/pull/325), [#329](https://github.com/deepseek-ai/3FS/pull/329)).
- 2025-09 到 2025-10: 放宽批量读对链版本和公开状态的检查 ([#341](https://github.com/deepseek-ai/3FS/pull/341), [#346](https://github.com/deepseek-ai/3FS/pull/346)), 修复一次性客户端造成的连接泄漏 ([#356](https://github.com/deepseek-ai/3FS/pull/356)).
- 2025-12 到 2026-05: 确定性 shuffle 与 `-DSHUFFLE_METHOD` ([#369](https://github.com/deepseek-ai/3FS/pull/369)), IoRing 批处理超时判断 ([#404](https://github.com/deepseek-ai/3FS/pull/404)), 同步期间 truncate 与 extend 的处理 ([#403](https://github.com/deepseek-ai/3FS/pull/403)), 链表版本单调递增 ([#413](https://github.com/deepseek-ai/3FS/pull/413)).

设计说明自发布后只改过错别字和格式, README 的性能数字从未更新. 2025 年 5 月补了指标文档 `docs/metrics.md` ([#282](https://github.com/deepseek-ai/3FS/pull/282)). 修复的分布说明, 开源时最不成熟的是 Rust chunk 引擎的并发与崩溃一致性, 而链复制协议和元数据层的改动很少.

### 5.5 局限与代码和文档的出入

3FS 的设计取向很明确: 读密集, 大文件, 有 RDMA 和全闪存硬件. 由此带来的局限主要有五条.

- 硬件门槛: 存储与客户端都要 RDMA 网卡, 存储节点要 NVMe 全闪, 公有云常规实例难以复现 README 的数字; 部署还要单独运维一套 FoundationDB.
- 写路径: 链式复制让写延迟随链长线性增加, 同一 chunk 的写在链头串行, Rust 引擎的覆盖写需要读改写整个 chunk, 小块随机更新代价高.
- 小文件与元数据: 元数据每次操作都是一次 FoundationDB 事务, 小文件的 close 和删除还要查多条链, 动态 stripe 在开源配置里默认关闭.
- 客户端: USRBIO 要改应用代码, 元数据操作仍经 FUSE; Linux 5.x 上 FUSE 不能对同一文件并发写.
- 恢复: 整 chunk 替换写简化了恢复, 代价是恢复流量放大, 而且一条链一次只能同步一个成员, 已有 issue 报告恢复卡住的情形.

代码与文档的出入集中在六处. 第一, 设计说明说读到同时有已提交和待定版本的 chunk 会返回特殊状态码, 这只在旧 C++ 存储路径成立, Rust 引擎直接返回已提交版本. 第二, 状态转移表允许多个成员同时 syncing, `generateNewChain` 限制每条链最多一个. 第三, 文件长度上报周期文档写 5 秒, FUSE 默认 30 秒. 第四, 动态 stripe 被写成生产做法, 开源 meta 默认关闭. 第五, 恢复期间流量均衡的示例表并不均衡, D 与 E 分到的流量相差三倍. 第六, 写路径的幂等去重 (channel 与 seqnum) 和链头 checksum 比对在文档里没有出现, 而 chunk ID 也比文档多了 2 字节 track 字段.

## 6. 从文件偏移到物理设备

文件$f$被切成固定大小chunk,每个chunk再映射到一条复制链. 设chunk大小为$C$,文件偏移$o$对应逻辑编号$i=\lfloor o/C\rfloor$与块内偏移$u=o\bmod C$. 元数据返回文件的chain table后,客户端由条带规则求出$i$所属链,再从成员列表选择读副本或链头写入. 数据面的大多数读取因此无需逐次询问元数据.

固定chunk让定位成为常数时间,代价是尾块内部碎片. 文件大小$F$的空间利用率为$F/(\lceil F/C\rceil C)$. 大checkpoint与训练数据几乎没有损失,大量小文件会浪费空间并放大元数据. 3FS面向大对象的取向由此落到布局层.

条带宽度$w$决定一个文件能同时利用多少条链. 顺序读的理想带宽上限为$\min(B_{client},\sum_{j=1}^{w}B_j)$;当$w=1$时大文件受单链限制,$w$很大时又增加连接、队列和故障暴露面. 动态stripe让文件增长时扩展宽度,但客户端必须正确处理不同区间采用不同映射版本.

物理放置还需跨故障域. 三副本若落在同一机架,交换机或电源故障会同时丢失;放置约束应按主机、机架与供电域分散. 性能均衡只看节点容量不够,还要避免同一热门文件的链头集中在少数机架上.

## 7. CRAQ 的版本与可见性

链复制把写入按head到tail的顺序传播. 对同一chunk,链头分配单调版本$v$,中间副本保存pending版本,尾部持久化后返回提交,提交消息再逆向传播. 读请求可打到任意副本;若副本只有已提交版本便直接返回,若存在更新的pending版本则需确认尾部状态或返回稳定版本.

这套协议的核心是单chunk写序. 两个客户端同时覆盖同一区间时,链头决定顺序,所有副本最终按同一版本序列执行. 不同chunk之间没有全局顺序,一个跨chunk写可能出现部分chunk已提交、另一部分尚未提交. 应用若要求整文件原子替换,需写新文件后通过元数据事务切换名字或版本指针.

读一致性还受文件长度影响. 数据已经写到chunk尾部而长度尚未上报时,其他客户端可能看不到新增区间;长度先可见而数据链尚未提交又会暴露空洞. 会话与close路径负责把数据提交和长度更新衔接起来. 周期性长度上报把崩溃损失窗口限制在配置周期,也使append的跨客户端可见性弱于同步close.

幂等请求用channel与seqnum识别重试. 客户端超时后不知道写是否已经生效,重发相同序号应返回原结果,不能再次分配版本. 去重状态若在崩溃后丢失,必须由版本与checksum阻止重复覆盖造成分叉.

## 8. 故障模型与状态转换

正常链可写可读;成员失联后控制面冻结旧配置,生成更高版本的新链,剩余副本继续服务或等待恢复. 租约保证任一时刻只有当前配置可接受写入. 若旧链head与控制面分区却仍能写,网络恢复后会出现双主,所以数据面必须检查租约期限和链版本.

单副本故障时,恢复节点从健康副本复制整个chunk,再进入syncing. 复制期间源chunk继续收到写入,系统需要先传基线快照,再追赶增量或在短窗口冻结写. 3FS整chunk替换简化状态,却会把少量修改放大为$C$字节恢复流量.

设损坏数据量$D$,可用恢复带宽$R$,前台为恢复保留比例$\gamma$,理想恢复时间下界是$D/(\gamma R)$. $\gamma$太小会拉长风险窗口,太大会抬高训练尾延迟. 应按剩余副本数提高优先级:只剩一份的数据先恢复,仍有两份的数据可以慢一些.

链版本必须单调. 成员短暂离线后带着旧版本返回,不能直接加入;它需要核对chunk清单与checksum,完成同步后由控制面发布新配置. 状态机测试应覆盖断电、进程崩溃、网络分区、消息重复与乱序,单纯kill进程不足以验证一致性.

多故障下,三副本只能容忍任意两个副本仍至少留一份数据,无法保证继续写. 若两个故障位于同链,服务能力与故障落点相关. 假设副本独立失效率$p$,三份同时不可用概率约$p^3$;机架相关故障会远高于该值,放置策略决定独立近似是否成立.

## 9. 元数据关键路径

目录遍历、inode创建、rename、unlink和chain table分配进入FoundationDB事务. FDB提供可串行化事务与有序键空间,适合用目录项键和inode键表达命名空间. 数据读写获得布局后直达存储节点,避免元数据服务承载每个I/O.

创建文件至少涉及分配inode、写父目录项、初始化属性与布局. rename需要在一个事务内删除旧目录项、增加新目录项并更新相关属性,否则崩溃会产生双名或丢名. FDB事务大小和冲突范围限制超大目录的并发更新;若所有目录项共享热点计数器,并发创建会在该键上冲突.

删除分两阶段更安全:元数据先使名字不可见并记录待回收对象,后台再删除各链chunk. 这样unlink延迟不随文件大小线性增长,代价是短期残留空间. GC必须幂等,重复删除已不存在chunk应视为成功,并用代际或版本避免误删同ID的新对象.

元数据缓存减少读取事务,却引入失效. 文件布局在链重配后改变,客户端携带旧版本访问时,存储节点应拒绝并迫使刷新;只靠TTL会在窗口内把请求发给错误成员. 版本化布局让缓存一致性由服务端检查兜底.

元数据尾延迟会集中影响小文件与open密集负载. 大文件流式读中一次open可摊到GiB数据,训练样本若由数百万小文件组成,每个样本都可能触发事务. 把样本打包为大shard既提高顺序带宽,也降低元数据操作/字节比.

## 10. 三副本与纠删码

3FS公开设计采用链式多副本. 三副本存储开销是$3D$,任意健康副本可读,修复只需复制一份完整数据. 写入需把数据依次传播到三处,网络与SSD写放大约3倍,链尾确认决定延迟.

$(k,m)$纠删码把$k$份数据编码为$k+m$片,容量开销为$(k+m)/k$. 例如$(8,2)$只需1.25倍容量,可容忍任意两片丢失. 正常读若片完整只取数据片,修复单片却需从多个节点读取并计算,小随机覆盖还会产生读改写.

训练checkpoint通常是大块顺序写、之后多次顺序读,适合冷数据纠删码;KV cache生命周期短、读延迟敏感、频繁删除,复制更直接. 分层策略可让新写与热点对象保持三副本,冷却后编码,但迁移期间需要双格式共存和原子切换.

可用性也不能只看容错片数. 三副本读取任一份即可,尾延迟可做hedged read;纠删码若一次读取必须等齐$k$片,完成时间接近第$k$个顺序统计量,慢节点更容易进入尾部. 多读冗余片能降低等待,会增加网络字节.

选择编码应联合计算容量成本、修复带宽、前台写放大与尾延迟. 只比较3倍和1.25倍空间会漏掉训练期间最重要的恢复干扰.

## 11. 训练数据访问模式

预训练数据通常被打成大shard,worker顺序读取样本并做shuffle. 单worker吞吐不高,数千worker的聚合读取形成主要压力. 若所有worker在epoch边界同时打开新shard,元数据和少数热门链会出现突发;随机化起始偏移与预取窗口能平滑负载.

严格全局shuffle需要产生中间分区并再次读取,GraySort展示的正是读写混合路径. 数据并行训练更常用分片级随机加样本缓冲,减少全局重排. 存储系统应分别评估纯顺序读、shuffle spill与小范围随机读,单个fio大块读无法代表全部训练阶段.

checkpoint写入具有周期性. 数千rank同时写时,瞬时流量可占满链头和元数据;完成后又长时间空闲. 若每rank直接创建许多小文件,目录与FDB事务成为瓶颈. 聚合checkpoint或异步写入能减少对象数,但延长故障后可恢复点的确认时间.

恢复训练时所有rank同时读取同一checkpoint,形成一次大规模fan-out. 副本选择应分散到不同成员,否则任意副本可读仍会因客户端一致选择第一成员而热点. 确定性shuffle需把rank、chunk和链版本映射均匀,并在成员变化后避免大面积同时迁移.

KV cache与训练数据不同:对象短命、按前缀读取、删除频繁、单客户端会短时打满网卡. 两类负载共用集群时,GC和checkpoint突发可能干扰KV尾延迟. 资源池、优先级或租户限速需要显式区分.

## 12. 带宽、IOPS 与尾延迟

大块顺序读由带宽限制,小块随机读由IOPS与时延限制. 块大小$q$,设备IOPS上限$I$,顺序带宽$B$时,单设备有效吞吐上界为$\min(B,qI)$. 当$q<B/I$时,继续增加网卡毫无作用;合并相邻请求可把系统拉回带宽区.

180节点6.6TiB/s相当于每节点约37.5GiB/s. 若每节点400Gbps网卡线速46.6GiB/s,有效利用率约80%. 这个结果说明大块读接近网卡上限,没有说明小块或混合写的表现.

聚合吞吐随节点数线性增长要求客户端、网络骨干、元数据与文件条带同时扩展. 文件只跨少量链时,增加存储节点不会提高单文件速度. 基准需说明文件数、stripe宽度、客户端数与读块大小,否则6.6TiB/s无法复现.

尾延迟取决于最慢参与者. 一个训练step等待全部rank读完,step I/O时间近似最大值$\max_iT_i$;rank数增大后,即使单rank分布不变,最大值也会上升. 报告平均带宽会掩盖straggler,应同时给出每rank P50/P99与step完成时间.

hedged read在超过阈值后向第二副本发请求,取先返回者. 它能削减设备抖动尾部,代价是额外流量. 阈值太低会把几乎所有请求复制,太高则来不及救尾. 可按近期延迟分位数自适应设置,并限制全局冗余比例.

## 13. 缓存层次

客户端页缓存、应用预取buffer、存储节点DRAM、NVMe控制器缓存与FDB缓存服务于不同对象. 训练数据重复epoch时客户端缓存容量远小于全集,但热shard或元数据仍可能命中. 基准若不清缓存,会把DRAM吞吐误认为SSD吞吐.

3FS KVCache图中客户端平均低、峰值高,本地缓存可以吸收重复前缀,也会改变SNIC流量形状. 缓存命中率$c$时后端读量约$(1-c)D$,但失效和容量竞争会使$c$随并发变化. 应报告重用距离分布,不能只给一个全局命中率.

存储节点缓存热门chunk可能导致内存热点,一致哈希放置无法自动均衡访问频率. 副本提供三个可选读点,客户端以队列长度与缓存状态选副本可以扩散热点. 缓存提示若过期,仍需由实际延迟反馈纠正.

写缓存必须区分已确认与未持久化. 若在链尾数据只进入易失DRAM就返回成功,整机掉电可能丢失已提交写. NVMe持久化语义、flush顺序与电容保护决定确认边界. 性能测试需说明是否使用fsync或等价持久化保证.

## 14. 容量与恢复手算

假设训练集10PiB,三副本需要30PiB原始空间. 每块NVMe 15.36TB,按十进制容量换算,仅数据约需2140块;再留20%空闲用于磨损、恢复和写放大,需要约2675块. 每节点16块则约168个存储节点,与公开180节点规模处于同一量级.

若一台节点16块盘全部失效,丢失待恢复副本约245TB. 集群给恢复流量1TiB/s时理想下界约4分钟,但源副本读取、目标写入和链分散会降低效率. 有效200GiB/s时约21分钟. 期间再失去相关副本的风险由放置与恢复顺序决定.

单盘故障约15TB,若目标盘持续写3GiB/s,单目标至少需约85分钟. 并行写多个目标能缩短,也扩大前台干扰. 整chunk恢复还会读取健康副本相同字节,网络总流量至少为恢复数据两倍,若跨机架还占骨干链路.

checkpoint例子:1万亿参数以BF16权重2TB,若再保存FP32 master、梯度和两份Adam状态,全量训练状态可达16TB量级. 三副本写入产生约48TB设备字节. 目标120秒完成时,客户端逻辑写需133GB/s,设备聚合写约400GB/s;容量不是问题,链头并发和尾部rank更可能决定完成时间.

## 15. 写放大与设备寿命

链复制产生副本写放大$r$,NVMe内部垃圾回收再乘设备写放大$w$. 应用写入$D$字节,介质实际写入约$Drw$. 三副本且$w=1.5$时是4.5D. checkpoint周期越短,设备日写入量越高,需要按DWPD核对寿命.

覆盖写若以chunk为单位读改写,小更新$a$面对chunk$C$会增加$C/a$级逻辑放大. 例如4KiB更新触发1MiB chunk替换,单副本就放大256倍. 3FS负载应尽量使用追加、大块写或新文件替换,避开原地小随机更新.

删除并不会立即抹除NAND,它更新元数据并使空间等待回收. KV cache周期GC形成删除脉冲,后续compaction可能把写压力延后. 同时观察删除IOPS、设备后台写和读尾延迟,才能判断GC是否真正无干扰.

空间利用率过高会降低SSD垃圾回收效率. 保留空闲比例既服务故障恢复,也稳定写尾延迟. 容量规划不能把标称空间全部分给用户;高水位应停止低优先级写入并提前触发清理.

## 16. 热点与副本选择

任意副本可读为负载均衡提供自由度. 最简单的随机选择在请求独立且副本同质时近似均匀;power-of-two choices从两个副本中选队列短者,通常能显著降低最大队列. 选择信息需要低成本更新,陈旧几毫秒通常仍优于固定首副本.

局部性与均衡存在冲突. 读取同机架副本节省骨干带宽,该副本拥塞时远端副本可能更快. 代价函数可用预计排队时间加跨域惩罚,而非硬编码本地优先. 训练step对尾部敏感,接近截止期的请求可更积极地跨域.

热门文件的三个副本最多提供三份设备带宽,大量worker同时读取时仍会饱和. 增加临时副本、客户端协作缓存或将数据重新打包到更多stripe都能扩展读点. 临时副本创建本身消耗网络,适合持续热点,不适合短脉冲.

链头承担同chunk写序,写热点无法由任意副本分散. checkpoint让每rank写独立文件可自然分散链头;所有rank追加同一文件会在少数chunk上串行. 文件组织因此直接影响并行性.

## 17. 元数据容量手算

设每个inode与属性合计$a$字节,目录项与键开销$b$字节,每个文件布局记录$c$字节,$N$个文件的逻辑元数据约$N(a+b+c)$. 若总计1KiB,十亿文件就是约1TiB,还未计FDB多版本、日志与三副本.

把每个训练样本做成文件,万亿样本会让元数据不可接受;将百万样本打成shard可把文件数降六个数量级. 打包代价是随机更新与单样本删除困难,但训练数据通常不可变,非常适合这种交换.

事务冲突率取决于键范围. 不同目录下创建互不冲突,同一目录若更新共享mtime或计数器会串行. 可以把统计异步聚合或分片计数,降低热点键. rename需要的原子键越多,事务重试成本越高.

FDB故障恢复与3FS数据恢复是两套机制. 元数据可用不代表chunk副本健康,chunk存在也不代表命名空间能找到. 灾备必须同时备份布局与数据,并验证恢复后的chain version不会倒退.

## 18. 校验、静默损坏与端到端完整性

NVMe、内存、NIC与软件都可能产生静默错误. 每个chunk应保存checksum,写入时由链头或客户端计算,副本落盘后验证. 读取可在客户端再次校验,形成端到端保护;只在存储节点校验无法发现DMA之后的损坏.

checksum覆盖范围要包含有效长度与版本,否则旧数据拼接或尾部残留可能通过校验. 元数据保存期望checksum时,更新顺序必须与数据提交一致:先发布新checksum却仍可读旧数据,会造成假损坏;反向则可能接受错误版本.

后台scrub按速率$s$扫描总数据$D$,完整周期为$D/s$. 30PiB物理数据以100GiB/s扫描约需3.6天;速率提高会抢占前台读. 对老化盘、错误计数升高和单副本风险chunk应提高优先级.

发现一个副本checksum错误时,从其他副本读取并多数校验. 三副本中两份一致可以修复第三份;若三份各异,仅靠多数也无法判断,需要上层内容哈希或重新生成. 故障注入应包含返回成功但翻转数据,因为超时与崩溃测试覆盖不到静默错误.

## 19. 小文件为何困难

小文件读取中,open、FDB查询、连接调度和RPC固定成本占比高. 文件4KiB、端到端固定延迟200微秒时,单流吞吐只有约20MiB/s,远低于400Gbps. 提高并发可填满链路,却增加元数据与CPU压力.

将小对象合并进容器文件,用独立索引记录偏移,可把大量元数据操作变为少量大读. 索引一致性成为新问题:容器数据提交后才能发布索引,删除只能留下空洞或周期压缩. 训练数据不可变时这些代价容易控制.

KV cache块可能介于小文件与大流之间. 每个token块单独建文件会压垮命名空间;按会话或固定大块聚合能减少对象数. 读取需要的前缀往往连续,聚合还提高顺序性;尾部未满产生的碎片相对可接受.

百万级删除峰值说明GC路径能高并发处理元数据,但删除成功不等于介质立即回收. 基准还应测删除风暴期间create、open和读P99,确认共享FDB键或后台compaction没有干扰.

## 20. 网络拓扑与割带宽

存储节点与计算节点之间的聚合吞吐受网络割面限制. 180节点各400Gbps给出8.4TiB/s左右端口总和,实测6.6TiB/s已接近该数量级;若上层交换机超卖,所有端口无法同时满速. 测试拓扑需要说明叶脊比与跨机架比例.

副本放置跨机架提高容错,也使写入逐跳跨越骨干. 链顺序可选择先同机架再跨机架或每跳跨域,影响链路流量与故障相关性. 最合理的顺序取决于交换拓扑,不能只随机排列成员.

RDMA依赖无损或拥塞控制. 大流训练读取与小延迟元数据RPC共网时,队头阻塞会抬高控制面尾部. 分流到不同traffic class或物理网络能隔离,但配置错误的PFC可能扩大拥塞. 应在incast和链路故障下测恢复.

客户端单卡只有400Gbps,40GiB/s已接近其物理上限. 想提高单任务吞吐需要多客户端或多网卡,增加存储节点无效. 集群总带宽和单客户端带宽必须分开表述.

## 21. 恢复流量调度

恢复任务从源副本读、向目标写,同时占两端设备与网络. 若简单均匀分配chunk,源节点可能集中,成为恢复热点. 调度应同时约束源读、目标写、机架出口和每条链并发.

可把每个待恢复chunk视为一条从健康副本集合到目标集合的流,目标最小化最大节点负载. 贪心选择当前源读负载最小的健康副本与目标写负载最小的节点,再检查故障域约束. 这比只均衡目标容量更接近实际完成时间.

前台流量随训练step周期变化. 恢复可在低谷加速,高峰降速,但频繁改变并发会产生抖动. 用滑动窗口测剩余带宽,保留固定安全余量,并给高风险chunk设置最低速率.

恢复完成的判据包括全量复制、追赶增量、checksum一致和控制面发布. 只看字节传完可能遗漏并发写. 新成员公开后,旧成员才能安全移除,否则会在切换窗口降低副本数.

## 22. 可证伪实验

实验一固定客户端与网络,把文件stripe从1逐步增到64. 单文件带宽应先近线性上升,随后在客户端网卡或网络割面形成平台. 若stripe=1已满客户端,增加宽度不应再提升.

实验二注入一个副本100毫秒尾延迟,比较固定副本、随机、副本二选一与hedged read. 平均吞吐可能接近,P99应按策略显著分化. 冗余字节同时报告,避免用无限双读换尾延迟.

实验三在持续训练读取时触发单盘和单节点恢复,扫描恢复限速. 读P99与恢复时间应形成Pareto曲线. 若限速下降却前台仍恶化,瓶颈可能在元数据或共享机架链路.

实验四制造链头、链中和链尾分别崩溃,并在pending写存在时重启. 校验可见版本、重复请求结果与副本checksum. 再加入消息重复和配置版本倒退,验证租约防止双主.

实验五用相同总字节构造大文件与百万小文件. 两者数据带宽差异应由元数据事务、RPC与IOPS解释. 打包小文件后若吞吐接近大文件,即可确认瓶颈位置.

实验六保持平均请求率,把到达改成checkpoint式同步突发. 平均带宽相同,尾延迟和队列峰值会不同. 预取错峰与租户限速应降低峰值,并保持总完成时间可接受.

实验七关闭客户端和节点缓存后测冷读,再逐级打开各缓存. 每一级的命中、后端字节与延迟变化应闭合. 若吞吐提升却后端字节未降,收益来自并发或预取,不能归给缓存命中.

实验八随机翻转介质数据但返回I/O成功. 端到端checksum应阻止错误进入训练,系统从健康副本修复. 若只在后台scrub发现,前台完整性边界不足.

## 23. 消融矩阵

数据布局轴包括chunk大小、stripe宽度和副本放置;协议轴包括链长、读副本策略、幂等与校验;客户端轴包括FUSE、USRBIO、队列深度和读块;控制面轴包括元数据缓存与GC批量;恢复轴包括并发和限速. 每次只改变一轴,否则端到端提升无法归因.

吞吐实验同时给逻辑字节、网络字节和设备字节. 三副本写的逻辑吞吐看起来可能很高,介质吞吐已接近极限. 读实验报告缓存命中后端字节,避免热缓存掩盖设备能力.

一致性实验不以吞吐为主,而以历史是否满足协议为准. 记录每个操作调用与返回时间、版本和结果,用线性化或会话语义检查器验证. 仅观察文件最终内容会漏掉中途读到未提交版本.

故障实验要重复足够次数并随机化注入时刻. 崩溃恰好落在写传播、tail提交、反向确认、长度上报和chain重配的不同窗口,结果可能完全不同. 覆盖状态转换比固定时间kill更有意义.

## 24. 适用边界

3FS适合大规模全闪、RDMA、读密集和大对象负载. 数据能被打包、客户端并发高、应用愿意使用USRBIO时,固定chunk与用户态路径能充分发挥带宽.

普通云实例、低速网络、少量HDD或小文件事务负载难以复制这些优势. 三副本成本高,链写对小随机覆盖不友好,FDB又增加独立运维面. 规模不大时,成熟对象存储或本地盘缓存可能更简单.

强跨文件事务也超出数据面设计. FDB能原子更新元数据,无法让多个大文件的数据写同时原子提交;应用需采用不可变对象加清单切换. 数据库式原地更新会遇到chunk写放大和链头串行.

公开性能主要证明特定硬件上的聚合顺序吞吐、GraySort与KVCache读. 它没有覆盖所有块大小、混合负载、长期故障和极端元数据规模. 部署判断应回到自己的对象大小、读写比、同步程度、故障域与成本.

## 25. 原理汇总

3FS把命名空间和布局放进FoundationDB,把大数据读写移出控制面;文件切成chunk并条带到多条CRAQ链,写由head排序、tail提交,读可利用任意健康副本. 这一分工让元数据获得事务语义,数据面获得横向带宽.

三副本换取简单读、快速修复与低解码成本,代价是容量和写放大. 固定chunk换取常数定位与整块替换,代价是小更新放大. FUSE提供兼容性,USRBIO绕开内核路径追求带宽. 每项设计都能在对应负载上找到收益和边界.

训练系统关注聚合带宽,也必须关注最慢rank;KV cache关注短时单客户端峰值和删除风暴;checkpoint关注同步写与恢复读. 同一文件系统面对三种不同时间结构,调度、缓存和恢复不能只围绕平均吞吐设计.

验证3FS的关键是让因果链闭合:布局应解释并行带宽,协议应解释可见版本,副本应解释故障恢复,资源计数应解释尾延迟. 当实验在预测边界处发生预测的性能变化或一致性结果,设计原理才得到可靠支撑.

## 26. 链复制的延迟模型

三成员链写入经过客户端到head、head到middle、middle到tail以及确认返回. 设单跳固定延迟$l_j$,数据大小$q$,链路有效带宽$b_j$,落盘时间$d_j(q)$,无流水的响应下界为

$$
T_w(q)\ge\sum_j\left(l_j+\frac{q}{b_j}ight)+\max_j d_j(q).
$$

连续大块写可在不同块间流水,稳态吞吐由最慢一跳决定,单块延迟仍累加多跳. 增加副本数主要增加延迟与网络字节,吞吐若每跳链路独立不必按副本数等比下降;多条链共享网卡时才会在节点割面相互竞争.

链头锁让同chunk更新串行. 设平均服务时间$S$,该chunk写入到达率$\lambda$,利用率$\rho=\lambda S$. 当$\rho$接近1,等待快速上升. 把文件条带到更多chunk能降低单锁到达率,但同一小区间的热点无法分散.

确认逆向传播允许上游副本把pending标为committed. 若客户端已收到成功而某个上游仍未收到确认,读取该副本时要向tail确认或返回已提交旧版. 这保证单副本读不会把未提交版本当成稳定数据,代价是异常窗口多一次RPC.

批量写把固定$l_j$摊薄,但扩大失败重试范围. 一批中部分chunk失败时,客户端需按chunk版本判断哪些已生效,不能盲目重放整个批. channel/seqnum与每操作结果共同维持幂等.

## 27. 文件会话与 truncate 竞态

客户端打开文件后建立会话,控制面据此跟踪写入者与长度. truncate把逻辑长度缩短,旧尾部chunk可能仍物理存在;随后extend若只修改长度,旧数据会重新暴露. 正确语义要求被截断区间在再次扩展时表现为空洞或零值,存储需记录截断代际.

周期长度上报与truncate并发时,旧写会话可能携带更大的最大偏移. 若它在truncate之后更新inode,文件会被错误拉长. 元数据必须比较会话或truncate版本,拒绝过期上报. 仓库后续对同步期间truncate/extend的修复正说明这一竞态是实现难点.

close计算精确长度需要查询各链末chunk. 条带越宽,查询扇出越大,尾延迟取最慢链. 可以并行查询并设置超时,但失败链会让精确长度无法确认. 强制close等待保证语义,异步close则需在之后open时完成恢复.

稀疏写在远偏移创建空洞时,文件逻辑长度很大,实际chunk少. 布局与长度不能通过“末尾连续chunk”简单推导;元数据需区分已分配区间. 训练文件通常顺序生成,但通用文件接口必须覆盖这一情况.

## 28. FUSE 与 USRBIO 的成本分解

FUSE路径包含系统调用、VFS、用户态切换、请求复制或映射以及守护进程调度. 大I/O下固定成本可摊薄,并发写限制和内核队列仍可能阻碍单文件扩展. 它的价值是兼容POSIX工具与现有训练代码.

USRBIO把数据I/O描述符写入共享内存环,守护进程批量处理,减少内核往返. 元数据仍通过文件接口,所以open密集小文件负载提升有限. 应分别测已打开大文件的纯数据面与包含open/close的端到端吞吐.

批深度$n$让一次唤醒处理多个请求. 固定提交成本$u$,每请求服务成本$s$,理想平均成本从$u+s$降为$u/n+s$. 等待凑批会增加低负载延迟,带超时的负数`io_depth`在吞吐与响应间折中.

共享内存Iov需要固定生命周期. 应用提交后在完成前修改或释放buffer会造成数据竞争;接口契约必须规定所有权转移. 守护进程崩溃时,应用还需识别在途请求并决定重试,同样依赖写幂等.

## 29. 训练 step 的尾部模型

数据并行有$n$个rank,每个rank读取时间分布为$F(t)$,假设独立时step I/O最大值的分布是$F(t)^n$. P99单rank延迟在数千rank下几乎必然出现,所以集群越大越需要关注高分位.

若每rank慢请求概率$p=10^{-4}$,4096个rank至少出现一个慢请求的概率为$1-(1-p)^{4096}\approx33.6\%$. 单请求看似极低的异常率会变成频繁step抖动. 副本选择、hedged read和预取主要价值常在这里,并非提高平均带宽.

预取深度$d$可隐藏读取时间,需要缓存$d$个batch. 数据增强与shuffle若到消费时才确定样本,预取空间受限;确定性采样能提前生成未来索引. 预取太深会读入最终未使用的数据,故障重启时浪费更多流量.

训练计算时间$T_c$为I/O提供隐藏窗口. 当batch读取P99低于$T_c$,存储波动大多不进入step关键路径;超过后直接形成GPU空泡. 评测应把裸I/O延迟与被计算隐藏后的stall分开报告.

## 30. Checkpoint 的原子发布

分布式checkpoint由多个rank分片组成. 每个分片写完不代表checkpoint可恢复,只有全部分片、优化器状态与清单一致时才能发布. 常用协议是写临时命名空间,各rank完成后由协调者在FDB事务中提交manifest指针.

协调者崩溃可能留下完整但未发布的数据,后台根据租约和年龄回收. 已发布manifest必须不可变,否则读者在恢复过程中可能看到分片列表变化. 新checkpoint通过写新manifest再原子替换“latest”指针上线.

校验应覆盖每个分片长度、checksum、模型step与并行拓扑. 恢复到不同并行度可能需要重分片,共享文件系统提供聚合读取,转换层仍需理解张量布局. 文件存在本身不能证明checkpoint语义完整.

写入期间三副本占用临时空间,旧checkpoint还未删除,容量峰值至少包含新旧两代. 若保留多个历史点,GC必须在新版本验证可恢复后执行. 容量水位不足时仓促删除旧点会缩短故障回退窗口.

## 31. KV cache 的对象模型

推理KV按会话前缀增长,天然适合不可变块. 块键可由模型版本、token前缀哈希、层范围与位置范围组成;内容寻址允许相同前缀共享,也便于校验. 哈希碰撞虽极低,仍应比较长度与强checksum.

读取通常需要完整前缀,可并行拉取多个块. 块过小增加元数据与IOPS,块过大使短前缀读取无关尾部并增加内部碎片. 最优大小由平均追加长度、读取并发和设备特性共同决定.

会话每轮追加后,旧块保持不变,只写新尾块. 若尾块未满又原地覆盖,链复制需要更新热点;采用封闭块加新块可保持不可变,但小追加会产生许多碎片. 可以在DRAM聚合到阈值后落盘,崩溃时未落盘部分需重算.

TTL删除适合按代际批处理. 大量对象同时过期会形成GC脉冲,控制面应限制每批键数并让数据删除异步. 若读取与删除竞态,打开的文件会话或对象引用需保证读完成前数据不被物理回收.

## 32. 复制链放置的组合约束

设存储节点集合$V$,故障域函数$r(v)$,链$c$的成员集合$M_c$. 容错约束要求$r(v)$在链内互异,容量约束要求每节点已用空间不超水位,性能目标则希望链头、链中与链尾角色均衡.

仅均衡总副本数可能让某节点承担过多链头,写请求先集中到它;角色计数应分别约束. 热度已知时还要按预计字节而非链数加权,一个热门链的负载可抵许多冷链.

节点扩容后若立即重平衡所有数据,会产生巨大迁移. 一致哈希或增量迁移减少移动量,但旧放置可能长期不均. 可只把新链偏向新节点,再用低优先级后台迁移最热或最满链.

机架容量不对称时,强制三个不同机架可能把副本压到小机架. 放置器需要同时解故障域和容量约束,无可行位置时应拒绝创建或降低策略并显式告警,不能静默把副本放在同域.

## 33. FoundationDB 事务边界

FDB事务提供读版本与提交冲突检测. 两个客户端同时在同目录创建同名文件,目录项键冲突,只有一个提交;创建不同名字若共同更新目录mtime,仍可能冲突. 热目录优化常需减少共享写键.

事务有大小与时长限制,无法把海量chunk状态一次写入. 大文件布局应使用紧凑规则或分批记录,再由一个小的发布键切换可见版本. 分批过程中崩溃留下的未发布记录由GC回收.

watch可通知链配置变化,但通知可能合并或断线. 客户端收到信号后重新读取当前版本,不应假设每次中间状态都能观察. 数据节点对版本的拒绝仍是最终保护.

FDB自身备份只保存元数据. 从旧备份恢复后,数据节点可能拥有更高链版本或新增chunk;直接启动会产生版本倒退. 灾难恢复流程需要扫描数据面、重建或核对布局,并设全局epoch隔离旧客户端.

## 34. 纠删码的修复放大

$(k,m)$编码中丢一片大小$x$,若无局部修复码,通常需读取$k x$数据重建$x$,修复读放大$k$. 三副本丢一份只需读取$x$,但容量多占. 故障频率高或恢复窗口严格时,副本的带宽优势可能抵消容量成本.

多片并发故障时,纠删码修复任务共享健康片,形成热点. 调度应选择不同stripe错开源节点. 编码计算也占CPU或GPU,训练集群繁忙时需要独立资源.

小对象编码效率差,元数据片数增加. 把多个对象组成大stripe能提高效率,任一对象更新都会牵涉整个stripe. 不可变冷checkpoint适合,短命KV不适合.

比较实验应固定可用容量或硬件成本. 三副本用更多盘,天然拥有更多聚合读带宽;若只在相同逻辑数据量下比较吞吐,其实也改变了设备数. 同成本比较才回答部署选择.

## 35. 故障注入矩阵

存储节点故障分为进程崩溃、整机断电、盘只读、盘慢、网络单向分区和返回坏数据. 控制面故障包括FDB事务超时、租约续期失败、成员管理重启和陈旧配置. 客户端故障包括请求超时重试、进程退出与旧版本长时间存活.

每类故障应落在写入接收前、链中转发后、tail持久化前后、确认返回途中、元数据发布前后. 观察客户端结果、可读版本、副本差异与恢复时间. 预期超时允许“已提交但客户端未知”,随后相同seqnum重试必须收敛到唯一结果.

慢故障比崩溃更难. 节点仍发心跳却把请求拖到数秒,成员管理不会立即摘除,训练step持续被尾部拖慢. 延迟感知副本选择可绕读,写链仍受慢成员限制,需要超时触发重配.

网络分区恢复后,旧成员携带pending版本回来. 它不能凭本地最大版本覆盖当前链,必须先读取控制面epoch并同步. 测试应保留磁盘状态重启,清空数据重启会绕过最危险的旧状态.

## 36. 性能验证的统计口径

吞吐曲线需要预热、稳态与排空区间. 缓存填充、连接建立和后台compaction会让短测试偏高或偏低. 长时间运行并标出阶段,才能判断设备热稳态.

每个配置多次运行,报告中位数与置信区间. 分布式系统受网络和SSD后台任务影响,几个百分点差异可能只是噪声. 随机化配置顺序,避免后跑的配置恰好遇到更热缓存.

延迟直方图应使用请求加权和字节加权两种口径. 大请求数量少却占主要带宽,请求P99可能由小请求决定;字节加权又会掩盖小RPC尾部. 两者一起才能解释用户体验与资源效率.

故障恢复报告同时给前台下降幅度、恢复完成时间与额外网络字节. 单追求最快恢复可能让训练完全停顿,单保护前台又让降冗余窗口过长.Pareto曲线比单点更有信息.

## 37. 最小观测面

数据节点应暴露每链读写字节、队列、pending版本数、checksum错误、设备延迟与空间水位. 客户端记录布局版本、所选副本、重试原因和各阶段时间. 元数据侧记录事务冲突、重试、watch延迟与GC积压.

指标标签不能直接包含inode或chunk ID,否则基数爆炸. 热点诊断可对少量对象采样,常规指标按节点、链角色与延迟桶聚合. 需要追踪具体请求时,用采样trace关联客户端、meta和存储跨度.

容量告警应看可用空间与恢复保留,而非仅看使用率. 某故障域剩余空间不足以接纳最大单节点数据时,即使全局还有大量空闲,也无法完成恢复.

一致性异常要有独立计数:旧版本拒绝、重复seqnum结果冲突、pending超时、长度回退和checksum不一致. 这些事件正常情况下应接近零,一旦出现比吞吐下降更值得优先调查.

## 38. 最终判断

3FS的高吞吐来自多层条件共同成立:大文件让固定开销可摊薄,条带让请求跨链并行,任意副本读扩展读点,RDMA与USRBIO降低客户端路径成本,全闪设备提供足够IOPS. 6.6TiB/s是这些条件的联合结果.

一致性依赖另一条链:chain version和租约阻止旧配置写入,head提供单chunk顺序,tail定义提交点,幂等序号处理未知结果,元数据事务原子发布命名空间. 任一实现细节缺失都可能在故障窗口产生分叉.

三副本、整chunk恢复和FDB控制面选择了易理解、易恢复的路径,同时承担容量、写放大和运维成本. 对训练与KV负载,用更多硬件换简单快速的数据面通常合理;对小规模通用存储,答案可能不同.

评估时应从对象大小、读写比、同步突发、缓存重用、故障域和恢复目标出发,分别计算数据、网络、元数据与尾延迟. 只用峰值带宽比较系统,会遗漏决定训练是否停卡和数据能否正确恢复的部分.

## 39. 混合负载的资源分配

设训练读取、checkpoint写入、KV读取和恢复流量分别为$x_1,x_2,x_3,x_4$,共享链路容量$B$,基本约束是$\sum_i x_i\le B$. 仅按先到先服务时,一次checkpoint突发可占满写链,KV的短请求尾延迟随之上升. 加权限速为每类负载保留最低份额$b_i$,空闲份额再由活跃队列借用.

最低份额之和应小于$B$,留下协议与故障余量. 恢复流量还需动态提高:正常三副本时低优先级,只剩单副本时越过训练读取,避免风险窗口继续扩大. 优先级依据数据安全状态变化,比固定“前台永远最高”更合理.

读写共享SSD时,顺序大写会触发内部垃圾回收,其影响可能在写结束后才出现在读P99. 调度器需要观察设备级延迟与后台写,不能只在网络层限速. 将checkpoint写分散到更长时间能降低峰值,会延迟可恢复点完成.

租户配额可按逻辑字节计费,资源控制却应按物理放大计量. 三副本写1GB消耗约3GB设备与网络,缓存命中读1GB可能几乎不碰SSD. 用相同逻辑配额会让写密集租户占据更多物理资源.

## 40. 表格化容量检查

部署前可为每类操作列出五个量:逻辑字节、复制后网络字节、设备字节、元数据事务数和最长同步参与者数. 顺序训练读约为$(D,D,D,O(1),n)$;三副本checkpoint写约为$(D,3D,3D,O(files),n)$;单副本恢复约为$(0,2D,2D,O(chunks),2)$.

最长同步参与者数决定尾部放大. 训练step等全部rank,checkpoint发布等全部分片,单chunk写只等链成员. 相同总字节下,同步扇出更大的操作更容易被慢节点拖住.

元数据事务数与文件组织直接相关. 一个1TB文件和一百万个1MB文件逻辑字节相同,后者需要约百万次创建、关闭和删除. 数据面带宽相同也无法抵消控制面固定成本. 容量表应把对象数与字节同时保留.

检查结果还要乘故障状态系数. 少一个副本时恢复流量加入读写,链重配增加元数据,客户端重试增加网络. 正常状态恰好满载的集群没有容纳故障的余量,可用容量必须按降级时仍满足核心SLO计算.

## 41. 一组边界推演

若所有文件仅一个chunk,增加stripe无效,吞吐由单链和客户端并发决定. 若单文件跨全部链,文件获得最大带宽,任何链慢都会影响完成尾部. 实际应选择足够宽但不覆盖整个集群的条带,让多个文件仍能相互均衡.

若读命中全在客户端DRAM,3FS数据面几乎不参与,测得训练无I/O等待不能证明后端足够. 若缓存完全冷,突发读直接落到NVMe,最能暴露设备与网络边界. 冷热两端都测,真实工作集落在其间.

若写入从不覆盖且文件关闭后不再修改,链复制和不可变发布最顺畅;若频繁4KiB原地更新,锁、读改写和设备放大会主导. 两种负载都叫文件I/O,却处于3FS设计空间的两端.

若故障永不发生,恢复设计只消耗保留容量;若节点持续抖动,链反复重配与同步可能比前台流量更大. 用平均年故障率无法代替故障簇测试,相关硬件批次或机架事件会造成短期集中失败.

这些边界给出清晰的验证方向:改变单一变量时,对应资源应按推导移动. 观察结果若相反,需要回查缓存、实现路径或指标口径,而非继续用峰值数字解释.

同一组实验还应固定缓存冷热、客户端并发、数据放置与后台恢复状态. 相同代码若工作集位置不同,吞吐差异可能来自DRAM命中或跨机架比例. 保存完整配置与随机种子,才能让后续版本沿同一坐标比较.

## 42. 复现顺序

复现应先验证语义,再追求带宽. 用三节点小集群完成创建、覆盖、truncate、rename、并发写与崩溃重试,记录版本和checksum;这些路径稳定后再扩大客户端与stripe. 在错误语义上跑出的高吞吐没有使用价值.

性能阶段先测单盘、单节点、单链和单客户端,得到设备、网卡与软件路径的独立上限. 随后增加链数和客户端,检查聚合曲线在哪个割面形成平台. 跳过单组件基线,看到平台时很难判断来自设备、CPU、网络还是客户端.

恢复阶段预先写入可校验数据,分别移除盘、节点和机架网络. 测量检测时间、重配时间、复制时间和重新达到三副本的时刻. 恢复总时长拆成四段后,才知道应该优化心跳、控制面还是数据搬运.

训练回放使用真实对象大小、rank同步和epoch访问顺序,KV回放保留前缀增长与GC脉冲.Checkpoint回放要包含临时文件、manifest发布和旧版本清理. 把三种流量混合后,再调整优先级与保留带宽.

验收线应同时包含正确性与性能:任何已确认写在允许故障数内可读,旧链无法提交新版本,checksum错误不会交给应用;正常与单故障状态下,吞吐、P99和恢复窗口分别达到目标. 还要连续运行多个checkpoint与GC周期,确认空间、设备写放大和尾延迟没有随时间恶化. 每次故障恢复后重新校验副本分布,防止容量恢复而故障域约束已经退化. 验收还应保留原始计数器与请求级样本,让峰值、均值和尾部都能追溯到设备、链、元数据事务或客户端等待. 硬件、chunk大小与副本策略变化后,使用同一回放负载重建基线,维持跨版本数字的可比性. 这样得到的是可运行系统边界,不只是一张峰值曲线.
