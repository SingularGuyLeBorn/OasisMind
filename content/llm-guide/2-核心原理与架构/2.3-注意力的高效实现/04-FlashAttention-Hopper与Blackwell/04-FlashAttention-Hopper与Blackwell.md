---
title: "04 · FlashAttention-3 与 FlashAttention-4:Hopper 与 Blackwell 上的流水设计"
category: "LLM 指南"
published: true
tags: ["FlashAttention-3", "FlashAttention-4", "Hopper", "Blackwell", "TMA", "WGMMA", "TMEM", "FP8", "Warp Specialization", "Triton"]
excerpt: "FlashAttention-2 在 H100 上只用到 35% 的峰值.FlashAttention-3 用 warp 专门化,矩阵乘与 softmax 重叠,FP8 块量化把 H100 前向推到 740 TFLOPs/s;FlashAttention-4 面对 Blackwell 上指数单元和共享内存跟不上 Tensor Core 的问题,用多项式模拟指数,条件重标度和 2-CTA MMA,在 B200 上达到 1613 TFLOPs/s."
---
# 04 FlashAttention-3 与 FlashAttention-4:Hopper 与 Blackwell 上的流水设计

## 1. 问题:Tensor Core 越来越快,其余部分跟不上

### 1.1 两代 GPU 的吞吐差距

[02 FlashAttention:IO 感知分块](../03-FlashAttention-IO感知分块/03-FlashAttention-IO感知分块.md) 介绍的 v1 和 v2 解决的是 HBM 搬运问题.到了 Hopper 和 Blackwell,瓶颈出现在 SM 内部.

**Hopper 的情况.** FlashAttention-3 论文给出 H100 SXM5 的数字:FP16 矩阵乘峰值 989 TFLOPs,而指数等特殊函数的吞吐只有 3.9 TFLOPs(每 SM 每周期 16 次,132 个 SM,1830MHz).头维度 $d=128$ 时,一个分数元素对应的矩阵乘运算量是指数运算量的 512 倍,但特殊函数吞吐比矩阵乘低 256 倍,所以指数运算可能占用矩阵乘时间的 50%.如果 softmax 和矩阵乘串行执行,Tensor Core 有相当一部分时间在等待.FA2 在 H100 上只达到峰值的 35%,而优化过的 GEMM 能达到 80% 到 90%.

**Blackwell 的情况.** FlashAttention-4 论文指出,B200 的 FP16/BF16 Tensor Core 吞吐为 2.25 PFLOPs,是 H100 的 1 PFLOPs 的两倍多,但共享内存带宽,指数单元和整数/浮点 ALU 增长很慢或没有增长.按每 SM 每周期计:BF16 矩阵乘从 Hopper 的 4096 次增加到 8192 次,指数单元(MUFU)仍是 16 次,共享内存读取仍是 128 字节.

对一个 $M\times N$ 的分数块,头维度 $d$,两次矩阵乘和指数运算的周期数分别为

$$
T_{\mathrm{MMA}}=\frac{4MNd}{8192},\qquad
T_{\exp}=\frac{MN}{16}. \tag{1}
$$

$M=N=d=128$ 时 $T_{\mathrm{MMA}}=1024$ 周期,$T_{\exp}=1024$ 周期,共享内存读取需要 768 周期.FA4 论文把这一现象总结为:非矩阵乘资源成了瓶颈,其耗时超出矩阵乘 25% 到 60%.

### 1.2 一个块在两代 GPU 上的周期数

把两篇论文的数字放到同一个块上比较.取 $M=N=d=128$ 的前向块,两次矩阵乘共 $4MNd=8{,}388{,}608$ 次浮点运算,需要计算 $MN=16{,}384$ 个指数.

H100 的 FP16 峰值 989 TFLOPs 分摊到 132 个 SM,1830MHz,约为每 SM 每周期 4096 次,与 FA4 论文给出的 Hopper 数字一致.矩阵乘需要 $8{,}388{,}608/4096=2048$ 周期,指数需要 $16{,}384/16=1024$ 周期,是矩阵乘的一半,对应 FA3 论文所说的「指数可能占矩阵乘周期的 50%」.换成 FP8,矩阵乘吞吐翻倍到 1024 周期,指数仍是 1024 周期,两者相等.

B200 上矩阵乘吞吐再翻倍,BF16 就已经是 1024 周期,与指数相等.FA4 论文还算了 $M=256$ 的情形(两个 CTA 合作):共享内存 1536 周期,矩阵乘 2048 周期,指数 2048 周期,三者仍在同一量级.

由此可以看出两代优化的侧重点.Hopper 上指数约为矩阵乘的一半,只要两者并行执行,指数就能被矩阵乘时间覆盖,FA3 的重点是重叠.Blackwell 上两者已经相等,单纯重叠也只能做到两者中较大的那一个,FA4 必须减少指数单元本身的工作量.

可用来重叠的,是两代架构新加的异步硬件.Hopper 有 TMA(Tensor Memory Accelerator,按张量描述符异步搬运多维数据)和 WGMMA(由四个 warp 组成的 warpgroup 发起的异步矩阵乘,操作数可以直接取自共享内存).Blackwell 增加了每 SM 256KB 的 TMEM(Tensor Memory),矩阵乘结果直接写入 TMEM;单条 MMA 的块从 Hopper 的 $64\times N$ 扩大到 $128\times N$;还有 2-CTA MMA,让同一个 cluster 内的两个线程块合作完成一个更大的矩阵乘.Hopper 的 WGMMA 指令在 Blackwell 上没有前向兼容,FA3 不能直接在 B200 上运行.

### 1.3 已有做法

FA2 的设计面向 Ampere:同步的 `mma.sync` 指令,数据经寄存器搬运,softmax 和矩阵乘在同一个 warp 内顺序执行.把它直接编译到 H100 上能跑到 335 TFLOPs/s,但用不上 TMA 和 WGMMA 的异步能力.

在 FA3 发表时,NVIDIA cuDNN 已有针对 Hopper 的注意力实现,Triton 也能在 Hopper 上生成使用 WGMMA 的内核.FA3 论文的实验把这两者作为基线.在 Blackwell 上,FA4 论文对比的基线是 cuDNN 9.13 和 Triton 实现.

低精度方面,FP8 Tensor Core 的吞吐是 FP16 的两倍.但 E4M3 格式只有 3 位尾数,大语言模型的激活中常有离群值,如果整个张量共用一个缩放因子,大部分正常值会被量化得很粗.

## 2. FlashAttention-3 的思路

### 2.1 生产者与消费者 warp 专门化

FA3 中一个线程块仍负责一个 query 块 $Q_i$,但块内的 warp 分成两种角色.生产者 warp 用 TMA 把 $Q_i$ 和后续的 $K_j,V_j$ 载入共享内存的循环缓冲区;消费者 warpgroup 等待缓冲槽就绪后发起 WGMMA,用完释放槽位.缓冲区的状态由 barrier 协调:消费者只能读已经装载完成的槽,生产者不能覆盖仍在使用的槽.

生产者只需发 TMA 指令,用的寄存器很少.Hopper 的 `setmaxnreg` 指令允许在 warpgroup 之间重新分配寄存器,FA3 把生产者的寄存器配额让给消费者,后者需要保存分数块,softmax 统计量和输出累加器.

### 2.2 两个 warpgroup 的 pingpong 调度

每处理一个 KV 块,消费者要做三件事:$S_j=Q_iK_j^\top$,对 $S_j$ 做在线 softmax 得到 $P_j$,再累加 $P_jV_j$.其中第一和第三步在 Tensor Core 上,第二步在 CUDA Core 和特殊函数单元上.

FA3 让两个消费者 warpgroup 交替执行:warpgroup 1 做 softmax 时,warpgroup 2 做矩阵乘;下一阶段两者交换.用 `bar.sync` 强制这种先后关系,使一个 warpgroup 的 softmax 落在另一个 warpgroup 的矩阵乘时间段内.论文报告,在头维度 128,FP16 前向的设置下,pingpong 调度把吞吐从约 570 TFLOPs/s 提高到 620 到 640 TFLOPs/s.

### 2.3 单个 warpgroup 内的跨迭代流水

在一个 warpgroup 内部,第 $j$ 块的 softmax 依赖第 $j$ 块的 $S_j$,第 $j$ 块的 $P_jV_j$ 依赖 softmax 结果,这三步本身无法重叠.但第 $j+1$ 块的 $S_{j+1}=Q_iK_{j+1}^\top$ 不依赖第 $j$ 块的 softmax.FA3 在对第 $j$ 块做 softmax 时,异步发起第 $j+1$ 块的 $QK^\top$:

$$
\underbrace{\operatorname{softmax}(S_j)}_{\text{CUDA Core}}\ \parallel\ \underbrace{S_{j+1}=Q_iK_{j+1}^\top}_{\text{Tensor Core}}. \tag{2}
$$

代价是需要同时保存 $S_j$ 和 $S_{j+1}$ 两份分数块,寄存器压力更大.论文也试过三阶段流水(同时重叠第 $j$ 块的 $PV$,第 $j+1$ 块的 softmax,第 $j+2$ 块的 $QK^\top$),结果比两阶段更慢:编译器没有按预期重叠指令,额外的中间量又迫使实现缩小块大小.

论文在批量 4,序列长度 8448,16 头,$d=128$ 的非因果 FP16 前向上做了消融:

| 配置 | 吞吐 | 耗时 |
|---|---|---|
| FA3 完整版 | 661 TFLOPs/s | 3.538ms |
| 去掉 GEMM 与 softmax 的流水 | 582 TFLOPs/s | 4.021ms |
| 去掉 warp 专门化 | 570 TFLOPs/s | 4.105ms |

两项技术各自贡献了约 14% 到 16% 的吞吐.

### 2.4 FP8:块量化与非相干处理

FA3 的 FP8 路径有两项误差控制措施.

第一是块量化.每个 $Q_i,K_j,V_j$ 块保存自己的缩放因子,不让一个离群值影响整个张量:

$$
s_X=\frac{\max|X|}{x_{\max}^{\mathrm{FP8}}},\qquad
\widehat X=\operatorname{round}_{\mathrm{FP8}}\!\left(\frac{X}{s_X}\right),\qquad
Q_iK_j^\top\approx s_{Q_i}s_{K_j}\,\widehat Q_i\widehat K_j^\top. \tag{3}
$$

块的划分与 FlashAttention 的分块一致,缩放因子可以在内核中直接乘进分数.

第二是非相干处理(incoherent processing).在量化之前,对 $Q$ 和 $K$ 的特征维乘同一个正交矩阵 $M$:

$$
Q'=QM,\qquad K'=KM,\qquad Q'K'^\top=QMM^\top K^\top=QK^\top. \tag{4}
$$

点积不变,但离群值被分散到多个维度上,每个块的最大绝对值下降,量化步长变小.FA3 取 $M$ 为随机 $\pm 1$ 对角阵与 Hadamard 矩阵的乘积,乘法可以用快速变换在 $O(d\log d)$ 时间内完成,并能与旋转位置编码融合.

FP8 Tensor Core 对操作数的内存布局要求与 FP16 不同,$V$ 需要在内核中转置,softmax 输出 $P$ 的寄存器布局也要调整,才能直接作为下一次 WGMMA 的输入.

论文用含离群值的合成数据测量了数值误差(输入为标准正态分布,其中 0.1% 的元素标准差为 10):

| 方法 | 均方根误差 |
|---|---|
| FP16 标准实现 | $3.2\times 10^{-4}$ |
| FP16 FlashAttention-2 | $1.9\times 10^{-4}$ |
| FP16 FlashAttention-3 | $1.9\times 10^{-4}$ |
| FP8 按张量缩放的基线 | $2.4\times 10^{-2}$ |
| FP8 FlashAttention-3 | $9.1\times 10^{-3}$ |
| FP8 FA3,去掉块量化 | $9.3\times 10^{-3}$ |
| FP8 FA3,去掉非相干处理 | $2.4\times 10^{-2}$ |

在这组数据上,误差的主要改善来自非相干处理:去掉它,误差回到基线水平;去掉块量化,误差只略有上升.完整 FA3 的 FP8 误差比基线低约 2.6 倍.

### 2.5 FA3 的反向

FA3 论文附录 B.1 的 Algorithm 3 给出了带 warp 专门化的反向.先用一个预处理内核算出每行的 $D=\operatorname{rowsum}(dO\circ O)$ 并写入 HBM.主内核的每个线程块固定一个 KV 块 $K_j,V_j$,在片上初始化 $dK_j,dV_j$,然后扫描所有 query 块.块内分三种角色:

- 生产者 warpgroup:先载入 $K_j,V_j$,再按循环缓冲区的节奏依次载入每个 $Q_i$ 和 $dO_i$.
- 消费者 warpgroup:对每个 $i$,计算 $S=Q_iK_j^\top$ 和 $dP=dO_iV_j^\top$,用保存的 logsumexp 恢复 $P=\exp(S-L_i)$,算 $dS=P\circ(dP-D_i)$,再把 $P^\top dO_i$ 和 $dS^\top Q_i$ 累加到 $dV_j$ 和 $dK_j$;最后算出局部的 $dQ_i=dS\,K_j$,写入共享内存.
- 一个专门的 $dQ$ 写回 warp:等局部 $dQ_i$ 就绪后,用 semaphore 控制,原子加到全局内存的 $dQ_i$ 上.

这样 $dQ$ 的原子加从消费者的关键路径上移走.FLOPs 的计数方式也在论文中说明:前向两次矩阵乘,反向因重算共五次,所以反向 FLOPs 取前向的 2.5 倍;因果掩码下大约只算一半元素,FLOPs 除以 2.

### 2.6 FA3 的实验结果

实验在 H100 SXM5 上进行,序列长度 512 到 16K,总 token 数 16K,隐藏维度 2048,头维度 64,128 和 256.对照为 FA2,Triton(3.0 nightly)和 cuDNN(9.1.1.17).

- FP16 前向比 FA2 快 1.5 到 2.0 倍,最高 740 TFLOPs/s,即峰值的 75%;反向比 FA2 快 1.5 到 1.75 倍.比标准实现快 3 到 16 倍.序列长度在 1K 及以上时,FP16 前向超过了针对 H100 优化的 cuDNN.
- 序列长度 4K 以上的测试点取 4224,8448,16896,使其能被 H100 SXM5 的 132 个 SM 整除,避免最后一轮线程块只占满部分 SM.
- FP8 前向接近 1.2 PFLOPs/s.H100 SXM5 的 FP8 稠密峰值约 1979 TFLOPs,按此算利用率约 61%,低于 FP16 路径的 75%.FP8 路径要在内核里转置 $V$ 并调整 $P$ 的布局,也没有用持久化内核,这些都会拉低利用率,论文没有给出各项占多少.头维度 64 时领先 cuDNN;头维度 128 和 256 时非因果持平,因果落后于 cuDNN.FP8 版本没有使用持久化内核,这是论文给出的原因之一.

## 3. FlashAttention-4 的思路

### 3.1 前向流水与 TMEM

FA4 的一个线程块同时处理两个 query 块.块内有四类 warpgroup:两个 softmax warpgroup 各负责一个 $128\times128$ 分数块;一个 correction warpgroup 负责对输出累加器做重标度;一个 warpgroup 驱动 Tensor Core 和 TMA.

每个 softmax warpgroup 有 128 个线程,每个线程处理分数块的一整行,这样求行最大值时不需要 warp 内的数据交换.对照 FA3 论文附录 B.2 给出的 SASS 片段,FA3 的消费者在求行最大值时要用 `FMNMX` 和 `SHFL.BFLY` 在线程之间交换部分结果,因为一行分散在多个线程里;FA4 改成一线程一行,这些洗牌指令和每个线程保存多份统计量的寄存器都省掉了.线程先把整行载入寄存器,求最大值,算指数,求和.与 FA3 一样,两个 softmax warpgroup 被显式同步,不让它们的指数计算阶段相互重叠.

$S$,$P$ 和输出累加器都放在 TMEM 中.因为 $P$ 通过 TMEM 交给下一次 MMA,不再经过寄存器,对旧输出乘缩放因子的操作可以交给单独的 correction warpgroup,从 softmax 的关键路径上移走.TMEM 中为两份输出累加器分配空间,剩余空间由 $S$ 和 $P$ 复用,并留出一部分用来把重标度统计量传给 correction warpgroup.

更大的块带来寄存器压力.一行 128 个 BF16 分数需要 128 个寄存器作为输入,还要为指数结果等中间量预留空间.FA4 分阶段写出 $P$,避免同时持有全部中间值.

### 3.2 用 FMA 模拟一部分指数

式 (1) 表明指数单元和 Tensor Core 已经同样慢.FA4 的做法是让一部分元素的指数改用普通 FMA 单元计算,与 MUFU 并行.

先把 $e^y$ 换成 $2^x$,$x=y\log_2 e$.硬件的 MUFU.EX2 指令本来就计算 $2^x$,FA3 附录中的 SASS 片段 `FFMA.FTZ R24, R24, UR9, -R6` 显示,实现把 $\log_2 e$ 和 $1/\sqrt d$ 合成一个常数放在统一寄存器 `UR9` 中,与减去行最大值合成一条 FFMA.所以改用 $2^x$ 不增加额外运算.在每个分数元素上,softmax 至少要做这条 FFMA,一次 $2^x$ 和一次加法(求行和),FA4 的多项式路径在此基础上再加三次 FMA 和若干位运算,这些都落在 FMA 单元上,与 MUFU 互不争用.用 Cody-Waite 范围缩减把 $x$ 拆成整数部分和小数部分:

$$
2^x=2^{\lfloor x\rfloor}\cdot 2^{r},\qquad r=x-\lfloor x\rfloor\in[0,1). \tag{5}
$$

$2^{\lfloor x\rfloor}$ 通过直接写 IEEE 754 浮点数的指数位得到.$2^{r}$ 用多项式逼近,按 Horner 形式求值:

$$
2^{r}\approx p_0+r\Bigl(p_1+r\bigl(p_2+r\,p_3\bigr)\Bigr). \tag{6}
$$

三次多项式只需三次 FMA.论文给出的最大相对误差为:

| 方法 | FP32 最大相对误差 | 舍入到 BF16 后最大相对误差 |
|---|---|---|
| 3 次多项式 | $8.77\times 10^{-5}$ | $3.90\times 10^{-3}$ |
| 4 次多项式 | $3.05\times 10^{-6}$ | - |
| 5 次多项式 | $1.44\times 10^{-7}$ | - |
| 硬件 MUFU.EX2 | $1.41\times 10^{-7}$ | $3.89\times 10^{-3}$ |

3 次多项式的 FP32 误差比硬件大很多,但 softmax 结果最终要舍入到 BF16 给下一次矩阵乘使用,BF16 的舍入误差约为 $3.9\times 10^{-3}$,远大于多项式误差.舍入后两者几乎相同,99% 的结果与硬件路径相差不超过 1 个 BF16 ULP.

全部改用多项式会增加寄存器压力,可能引起溢出.FA4 只对每行 10% 到 25% 的元素使用多项式,其余仍走 MUFU.EX2,具体比例按块配置下矩阵乘与指数的吞吐比调节.

### 3.3 条件重标度

在线 softmax 每遇到更大的行最大值,就要把整行输出累加器乘一次 $e^{m_{\mathrm{old}}-m_{\mathrm{new}}}$.FA4 观察到,在实数运算中,用于缩放的参考值不一定是真实的最大值,只要指数不溢出,任何参考值都能在最后归一化时约掉.

记 $a_{j-1}$ 为当前参考值,$c_j=\max(a_{j-1},\operatorname{rowmax}(S_j))$ 为候选的新最大值.FA4 只在涨幅超过阈值 $\tau$ 时才更新:

$$
a_j=\begin{cases}c_j, & c_j-a_{j-1}>\tau,\\ a_{j-1}, & \text{其他情况},\end{cases} \tag{7}
$$

$$
\widetilde O_j=e^{a_{j-1}-a_j}\widetilde O_{j-1}+e^{S_j-a_j}V_j,\qquad
\ell_j=e^{a_{j-1}-a_j}\ell_{j-1}+\operatorname{rowsum}\!\left(e^{S_j-a_j}\right). \tag{8}
$$

不触发阈值时 $a_j=a_{j-1}$,旧累加器的缩放因子为 1,可以跳过.FA4 在以 2 为底的指数表示下取 $\tau=\log_2 256=8$,即允许 $e^{S_j-a_j}$ 中的元素最大达到 256,这在 FP32 累加器中不会溢出.最终输出仍为 $\widetilde O_T/\ell_T$,logsumexp 为 $a_T+\log\ell_T$.为避免 warp 内分支发散,只要一个线程需要重标度,整个 warp 一起执行.

可以按这个阈值估一下数值余量.每个 $e^{S_j-a_j}$ 不超过 256,32K 长度下行和 $\ell$ 最多约 $32768\times256\approx8.4\times10^6$,FP32 的上限约 $3.4\times10^{38}$,余量很大.$P$ 舍入到 BF16 后取值可以大于 1,但 BF16 的指数位和 FP32 一样是 8 位,相对精度只看尾数,和值落在 $[0,1]$ 还是 $[1,256]$ 无关.所以把阈值放到 8 不会让 $P$ 的舍入误差变大.这段是按论文给出的阈值推算的.

### 3.4 反向:共享内存成为瓶颈

反向每轮有五次矩阵乘:重算 $S$,以及计算 $dP,dV,dQ,dK$.论文按 $M=N=d=128$ 估算,矩阵乘需要 2560 周期,指数 1024 周期,单 CTA 方案的共享内存流量需要 3328 周期.反向的瓶颈从指数变成了共享内存.

FA4 用 Blackwell 的 2-CTA MMA 解决这个问题.一对 CTA 共同完成 $M=256,N=K=128$ 的矩阵乘:累加器沿 $M$ 维分给两个 CTA,操作数 $B$ 沿 $N$ 维分成两半,每个 CTA 只在自己的共享内存中准备一半,硬件把两半合起来使用.这样操作数 $B$ 的共享内存流量减半,共享内存周期从 3328 降到 2688,接近 2560 的矩阵乘周期.少掉的 640 周期约占原来的 19%,剩下的 2688 只比矩阵乘多 5%,反向的瓶颈又回到了矩阵乘附近.

$dQ$ 需要沿 KV 维规约,与 2-CTA 的划分方向不一致.两个 CTA 通过分布式共享内存(DSMEM)交换一半 $dS$,使每个 CTA 得到一个 $\frac{M}{2}\times 2N$ 的操作数,规约维长度翻倍.每个 CTA 最后只写一半 $dQ$,写回全局内存的原子加次数也减半.

### 3.5 确定性模式,调度与 CuTe-DSL 实现

原子加的执行顺序不固定,浮点求和结果每次可能不同.强化学习等场景需要可复现的训练,FA4 提供确定性模式:用 semaphore 规定写同一个 $dQ$ 块的 CTA 顺序,并在头和批维度上重排 CTA 以减少等待.论文报告确定性模式最高可达非确定性模式速度的 75%.

因果掩码下不同 query 块的工作量不同,对角线附近的块要处理的 KV 块少.FA4 采用最长处理时间优先(LPT)的调度:按批为最外层,把头分成不超出 L2 缓存容量的若干段,在段内按头遍历,query 块按逆序处理.对 MQA 和 GQA,先遍历共享同一 KV 头的所有 query 头.论文在头维度 128 的 BF16 设置下报告,LPT 调度对 MHA 提高 4% 到 8% 的吞吐,对 MQA(8 个 query 头共享 1 个 KV 头)提高 7% 到 14%.

这些调度逻辑和前面的流水都写在 CuTe-DSL 里.FA4 完全用嵌入 Python 的 CuTe-DSL 编写,没有 CUDA C++ 部分.编译器把 Python 源码降到 PTX,再由 `ptxas` 生成机器码,需要时可以插入自定义 PTX.论文报告的编译时间:FA3 的 C++ 模板实现前向 55 秒,反向 45 秒;FA4 前向 2.5 秒,反向 1.4 秒,快 20 到 30 倍(前向 $55/2.5=22$ 倍,反向 $45/1.4\approx32$ 倍).改一处内核后几秒就能重新编译,调块大小和流水深度时可以多试几组.这是编译时间,不涉及运行速度.

### 3.6 FA4 的实验结果

实验在 B200 上以 BF16 进行,序列长度 1K 到 32K,总 token 数 32K,头维度 64,128,以及 query/key 维度 192,value 维度 128 的组合.

- 最高 1613 TFLOPs/s,即峰值的 71%.按 2.25 PFLOPs 的 BF16 峰值验算是 71.7%;FA3 的 740 对 H100 的 989 是 74.8%,FA2 的 335 是 33.9%.H100 特殊函数单元的 3.9 TFLOPs 也可以验算:$16\times132\times1.83\times10^9\approx3.87\times10^{12}$.
- 比 cuDNN 9.13 快 1.1 到 1.3 倍,比 Triton 快 2.1 到 2.7 倍.论文说明,之后的 cuDNN 版本吸收了这些技术,性能已经与 FA4 相当.
- 论文没有在 B200 上运行 FA3,因为 FA3 使用的 Hopper 指令在 Blackwell 上不可用,所以不能从图表直接得到 FA4 相对 FA3 的倍数.

### 3.7 四代 FlashAttention 的瓶颈与对策

| 版本 | 目标硬件 | 主要瓶颈 | 主要对策 | 论文报告的峰值利用率 |
|---|---|---|---|---|
| v1 | A100 | $S,P$ 的 HBM 读写 | 分块,在线 softmax,反向重算 | 前向 30% 到 50% |
| v2 | A100 | 非矩阵乘运算,并行度,warp 间通信 | 推迟归一化,query 外层,按 query 切 warp | 前向最高 73% |
| v3 | H100 | 同步执行,指数占矩阵乘一半时间,FP8 误差 | warp 专门化,pingpong,跨迭代流水,块量化与 Hadamard 变换 | FP16 前向最高 75% |
| v4 | B200 | 指数与共享内存和矩阵乘一样慢 | FMA 模拟指数,条件重标度,TMEM,2-CTA MMA | BF16 最高 71% |

四代计算的都是精确注意力,只有 FP8 路径引入了量化误差.变化的只是在给定硬件上如何安排数据搬运和各类运算单元.每一代解决的瓶颈,都来自上一代硬件中某个部件相对其他部件的增速差异.

## 4. 用 Triton 写分块注意力与边界

### 4.1 用 Triton 写分块注意力

Triton 官方的 fused attention 教程实现了 FA2 风格的前向:每个 program 负责一个 query 块,内循环扫描 KV 块.下面是去掉步长,边界掩码和自动调优配置后的骨架,用来对照前面的公式,不能直接运行.

```python
@triton.jit
def attention_fwd(Q, K, V, Out, LSE, n_ctx, scale,
                  BLOCK_M: tl.constexpr, BLOCK_N: tl.constexpr,
                  HEAD_DIM: tl.constexpr):
    block_m = tl.program_id(0)
    rows = block_m * BLOCK_M + tl.arange(0, BLOCK_M)
    cols = tl.arange(0, BLOCK_N)
    q = tl.load(...)                                   # [BLOCK_M, HEAD_DIM]
    m_i = tl.full([BLOCK_M], -float("inf"), tl.float32)
    l_i = tl.zeros([BLOCK_M], tl.float32)
    acc = tl.zeros([BLOCK_M, HEAD_DIM], tl.float32)

    end_n = min(n_ctx, (block_m + 1) * BLOCK_M)        # 因果:跳过右侧的块
    for start_n in range(0, end_n, BLOCK_N):
        k = tl.load(...)
        v = tl.load(...)
        s = tl.dot(q, tl.trans(k)) * scale
        s = tl.where(rows[:, None] >= start_n + cols[None, :], s, -float("inf"))
        m_new = tl.maximum(m_i, tl.max(s, axis=1))
        alpha = tl.exp(m_i - m_new)
        p = tl.exp(s - m_new[:, None])
        l_i = alpha * l_i + tl.sum(p, axis=1)
        acc = alpha[:, None] * acc + tl.dot(p.to(q.dtype), v)
        m_i = m_new

    tl.store(..., acc / l_i[:, None])
    tl.store(..., m_i + tl.log(l_i))                   # 供反向使用的 logsumexp
```

循环体与 FA2 的在线 softmax 一一对应.`end_n` 让因果内核跳过对角线右侧的 KV 块,`tl.where` 只在对角块上起作用.

Triton 源码与硬件指令之间的对应不是固定的.`tl.dot` 在 Ampere 上可能编译成 `mma.sync`,在 Hopper 上可能使用 WGMMA,取决于 Triton 版本,数据类型,块形状,`num_warps` 和 `num_stages`.普通指针形式的 `tl.load` 不会自动变成 TMA.`tl.exp` 也不会自动采用 FA4 那样的 MUFU 与多项式分流.FA3 和 FA4 的论文实验中,Triton 实现都明显慢于专门实现,原因之一就是这些硬件特性需要在内核里显式组织.

块大小 `BLOCK_M`,`BLOCK_N` 越大,循环次数越少,矩阵乘越饱满,但分数块和累加器占用的寄存器越多,超出后会溢出到本地内存.`num_stages` 控制软件流水深度,越深越能覆盖加载延迟,也要同时保存更多块.这些参数需要按 GPU 和头维度自动调优.

### 4.2 边界

**硬件绑定.** FA3 的生产者消费者结构依赖 TMA,WGMMA 和 `setmaxnreg`,FA4 依赖 TMEM 和 2-CTA MMA.官方仓库中 FA3 目前仍标为 beta,需要 H100 或 H800,CUDA 12.3 以上(推荐 12.8).FA4 以 CuTe-DSL 包的形式发布,通过 `from flash_attn.cute import flash_attn_func` 调用,面向 Hopper 和 Blackwell;在 H100 上运行时走的是适合 Hopper 的数据路径,不能套用 B200 上的性能分析.

**FP8 的适用范围.** FA3 的 FP8 误差实验基于构造的含离群值分布,不能直接推出任意模型用 FP8 注意力训练都没有精度损失.因果掩码和较大头维度下,FA3 的 FP8 前向还没有超过 cuDNN.

**多项式指数的精度假设.** FA4 的 3 次多项式能用,前提是结果马上舍入到 BF16.需要 FP32 精度的场景要用更高次的多项式或硬件指令.

**流水深度不是越深越好.** FA3 的三阶段流水比两阶段慢,FA4 也要在寄存器容量和并发度之间权衡.

**周期估算只是上界分析.** 第 1.2 节的周期数按峰值吞吐计算,没有计入同步,寄存器溢出和 wave 量化.实际利用率要看论文中的实测曲线,FA3 最高 75%,FA4 最高 71%,都离峰值有距离.

**基准形状.** 两篇论文都固定总 token 数,改变序列长度,测的是长序列的训练前向和反向.单 token 解码的瓶颈在读取 KV cache,需要沿 KV 维切分的方法,见 [6.6.3 Flash-Decoding](../../../6-训练与推理优化/6.6-推理框架与高级优化/6.6.3-Flash-Decoding原理与实现/6.6.3-Flash-Decoding原理与实现.md).

**软件版本变化快.** cuDNN 后续版本已追平 FA4 的性能,论文中的倍数只代表论文发表时的软件版本.部署时应按 GPU 架构,掩码,头维度,前向或反向,以及是否需要确定性分别测量.

## 参考文献

1. Jay Shah, Ganesh Bikshandi, Ying Zhang, Vijay Thakkar, Pradeep Ramani, Tri Dao. (2024). [FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision](https://arxiv.org/abs/2407.08608). NeurIPS 2024.
2. Ted Zadouri et al. (2026). [FlashAttention-4: Algorithm and Kernel Pipelining Co-Design for Asymmetric Hardware Scaling](https://arxiv.org/abs/2603.05451). arXiv:2603.05451.
3. Tri Dao. (2023). [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691). ICLR 2024.
4. Dao-AILab. [flash-attention](https://github.com/Dao-AILab/flash-attention). 官方仓库.
5. Triton Project. [Fused Attention Tutorial](https://triton-lang.org/main/getting-started/tutorials/06-fused-attention.html).
6. Philippe Tillet, H. T. Kung, David Cox. (2019). [Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations](https://dl.acm.org/doi/10.1145/3315508.3329973). MAPL 2019.
7. NVIDIA. [CuTe DSL Documentation](https://docs.nvidia.com/cutlass/media/docs/pythonDSL/cute_dsl_general/dsl_introduction.html).
