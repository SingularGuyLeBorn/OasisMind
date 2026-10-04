---
title: "05 · MoE 系统:专家并行,All-to-All 与部署"
published: true
tags: ["MoE", "专家并行", "All-to-All", "DualPipe", "DeepEP", "DeepGEMM", "SonicMoE"]
excerpt: "MoE 的参数放不进一张卡,token 就必须跨卡去找专家.本篇从专家并行的数据流出发,整理 GShard 与 Switch 的切分,DeepSeek-V3 的训练并行与 DualPipe,IB/NVLink 两级 dispatch,prefill 与 decode 的部署,以及 grouped GEMM,DeepEP,SonicMoE,Tutel,SmartMoE 的做法."
---
# 05 MoE 系统:专家并行,All-to-All 与部署

## 1. 问题与并行维度

### 1.1 问题:参数放不下,token 要移动

一个 MoE 层的路由专家参数是 $N\cdot3dH$(门控 FFN 三个矩阵).DeepSeek-V3 每层 256 个路由专家,$d=7168$,$H=2048$,一层路由专家约 $256\times3\times7168\times2048\approx1.13\times10^{10}$ 个参数,BF16 下约 22.5 GB,58 个 MoE 层合计远超单卡显存.专家必须分布在多张卡上,这就是专家并行(EP).

专家固定在卡上以后,移动的只能是 token.EP 组有 $R$ 张卡,每卡持有 $N/R$ 个专家,本卡有 $t$ 个 token,每个 token 选 $k$ 个专家.路由均匀时,每张卡在一次 dispatch 中发出的数据量约为

$$
V_{\mathrm{dispatch}}=t\,k\,d\,b\cdot\frac{R-1}{R} \tag{1}
$$

字节,$b$ 是每个元素的字节数,$(R-1)/R$ 是目标专家不在本卡的比例.combine 方向数据量相同.式 (1) 与专家数 $N$ 无关,与 $k$,$d$ 成正比,这也是 [04](../04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md) 中 LatentMoE 把 $d$ 换成 $\ell$ 的出发点.

V3 的数字:$k=8$,$d=7168$.每 token 每层前向的路由专家计算为 $8\times2\times3\times7168\times2048\approx7.05\times10^8$ FLOPs.dispatch 以 FP8 发送,8 个副本共 $8\times7168=57344$ 字节;combine 以 BF16 返回,共 114688 字节.V3 报告的估计是,跨节点专家并行让训练中的计算与通信之比约为 1:1,不做重叠时通信会占去一半时间.

### 1.2 五种切法

| 维度 | 切什么 | 主要通信 |
|------|--------|----------|
| 数据并行(DP) | batch;ZeRO 进一步切优化器状态,梯度,参数 | 梯度 AllReduce 或 ReduceScatter |
| 张量并行(TP) | 单层内的矩阵 | 每层的 AllReduce |
| 流水并行(PP) | 层 | 相邻 stage 间的激活与梯度点对点传输 |
| 序列并行(SP) | 序列维度上的激活 | AllGather / ReduceScatter |
| 专家并行(EP) | 专家 | dispatch / combine 两次 All-to-All |

AllReduce 可以拆成 ReduceScatter 加 AllGather.ring 实现中,$R$ 张卡对 $n$ 字节数据做 AllReduce,每张卡发送

$$
V_{\mathrm{AR}}=2\cdot\frac{R-1}{R}\,n \tag{2}
$$

字节,两个阶段各占一半.拆开以后,中间的 ReduceScatter 结果是按序列切分的,可以在两个集合通信之间插入只需要局部数据的计算.K3 的 prefill 就是这样处理 Block AttnRes:把 TP 的 AllReduce 拆成 ReduceScatter 与 AllGather,块内 kernel 在两者之间按序列切分的隐藏状态上运行,避免在每个 TP rank 上物化全部 block 表示.

ZeRO 分三级:ZeRO-1 只切优化器状态,ZeRO-2 再切梯度,ZeRO-3 连参数也切,每级都用更多通信换显存.DeepSeek 的 V2 与 V3 都只用 ZeRO-1,参数与梯度在每个 DP rank 上完整保存.

EP 与 TP 的区别在于,TP 每层都要对完整激活做 AllReduce,通信量与 $d$ 和 token 数成正比,与 $k$ 无关;EP 只移动被路由的 token,且只有 MoE 层需要.注意力层通常用 DP 或小规模 TP,MoE 层用 EP,两者在同一批卡上共存.

![专家并行的 dispatch 与 combine All-to-All](./images/fig-moe-ep-alltoall.png)

**图 1 解析**

- 左侧是各卡上的 token,右侧是各卡持有的专家(每卡两个).Top-$k$ 路由器决定每个 token 去哪个专家,实线是 dispatch,虚线是 combine.
- 图中每张卡的 token 只画了一条通向同号卡的箭头.实际的 All-to-All 中每张卡都可能向所有卡发送数据,GPU 0 上的 token 若选中 E2,就要发往 GPU 1;式 (1) 的 $(R-1)/R$ 就是这部分跨卡流量.
- dispatch 与 combine 的数据量相同,方向相反.combine 回来以后,各专家输出按门控权重在源卡上加权求和.

### 1.3 GShard 与 Switch 的切分

GShard(Lepikhin et al.,[arXiv:2006.16668](https://arxiv.org/abs/2006.16668))在 Transformer 中每隔一个 FFN 换成 MoE 层.专家沿设备切分,每个设备持有一部分专家,其余层在设备间复制;注意力沿 batch 维度切分.MoE 层前后用 AllToAll 在「按 batch 切」与「按专家切」两种分片之间转换.用户只需给少量张量写分片标注,SPMD 分区器生成每个设备上的程序,编译时间与设备数无关($O(1)$).论文在 2048 个 TPU v3 核上用 4 天训练了 600B 参数的多语言翻译模型,合计 22 TPU 核年,权重与激活都用 float32.GShard 的容量分组见 [03](../03-MoE负载均衡与容量/03-MoE负载均衡与容量.md) 第 1.2 节.

Switch Transformer(Fedus et al.,[arXiv:2101.03961](https://arxiv.org/abs/2101.03961))在 Mesh-TensorFlow 上组合数据,模型与专家三种并行.论文第 5 节用 $n$ 个核的网格说明各自切什么:纯数据并行时每个核持有完整权重,只切 batch,只有梯度汇总需要通信;纯模型并行时每个核持有 FFN 中间维的一段,所有核处理同一批 token,每层前后都要通信;专家并行时每个核持有不同的专家,token 按路由在核之间交换.三者可以叠加,例如在数据并行的维度上同时切专家,在模型并行的维度上再切单个专家的中间维.Switch-XXL(395B 参数,64 个专家)同时用三种;Switch-C(1571B 参数,2048 个专家)只用专家并行,不用模型并行.专家数足够多时,每个设备放一个或几个专家,单个专家的矩阵不需要再切,TP 的每层 AllReduce 也就省掉了.

---

## 2. DeepSeek-V2 与 V3 的训练并行

### 2.1 V2:设备受限路由与共享专家重叠

DeepSeek-V2(DeepSeek-AI,[arXiv:2405.04434](https://arxiv.org/abs/2405.04434))在 H800 集群上用 16 路 zero-bubble 流水并行,8 路专家并行和 ZeRO-1 数据并行.激活参数只有 21B,部分算子在反向时重算以节省激活显存,因此不需要张量并行,省去 TP 的通信.每层的路由专家均匀放在 8 个设备上($D=8$),设备受限路由让每个 token 最多发往 3 个设备($M=3$),设备级与通信级的均衡损失见 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) 第 3.1 节.

V2 的一个系统细节是把共享专家的计算与专家并行的 All-to-All 重叠.共享专家处理本卡所有 token,不依赖 dispatch 的结果,可以在 token 在网络上传输时先算;路由专家必须等 dispatch 完成.共享专家越大,能掩盖的通信越多.V2 还为通信,路由算法和跨专家的融合线性计算写了专用 CUDA kernel.K3 推理侧把共享专家 GEMM 放在单独 stream 上与其他 kernel 重叠,是同一思路.

### 2.2 V3 的配置与 DualPipe

V3 报告(DeepSeek-AI,[arXiv:2412.19437](https://arxiv.org/abs/2412.19437))第 3 节:训练集群 2048 张 H800,每节点 8 卡,节点内 NVLink 与 NVSwitch,节点间 InfiniBand.并行方式是 16 路 PP,跨 8 个节点的 64 路 EP,ZeRO-1 DP,不使用 TP.按这一配置,每层 256 个路由专家分到 64 张卡,每卡 4 个,每节点 32 个,一层的专家占满 8 个节点;节点受限路由允许每个 token 去其中的至多 4 个节点.省掉 TP 依赖显存优化:RMSNorm 与 MLA 上投影在反向时重算,EMA 参数放 CPU,MTP 模块与主模型共享 embedding 和输出头(DualPipe 把最浅层与最深层放在同一个 PP rank 上,共享参数在物理上只存一份).

DualPipe 把每个 chunk 拆成注意力,all-to-all dispatch,MLP,all-to-all combine 四部分;反向 chunk 的注意力与 MLP 再按 ZeroBubble 的做法拆成「对输入求梯度」与「对权重求梯度」两段,另有 PP 通信.对一对前向与反向 chunk,重新排列这些部分,并手动调整计算与通信各占的 SM 比例,使 all-to-all 与 PP 通信都被计算掩盖.整体调度是双向流水:micro-batch 同时从流水线两端送入.

报告 Table 2 比较了三种流水的气泡.$F$ 是前向 chunk 时间,$B$ 是完整反向 chunk 时间,$W$ 是「对权重求梯度」的时间,$F\&B$ 是一对互相重叠的前向与反向 chunk 的时间:

$$
\mathrm{Bubble}_{\mathrm{1F1B}}=(PP-1)(F+B) \tag{3}
$$

$$
\mathrm{Bubble}_{\mathrm{ZB1P}}=(PP-1)(F+B-2W) \tag{4}
$$

$$
\mathrm{Bubble}_{\mathrm{DualPipe}}=\Bigl(\frac{PP}{2}-1\Bigr)(F\&B+B-3W) \tag{5}
$$

V3 的 $PP=16$ 代入,1F1B 为 $15(F+B)$,ZB1P 为 $15(F+B-2W)$,DualPipe 为 $7(F\&B+B-3W)$,系数从 15 降到 7.代价是参数存两份,峰值激活从 $PP$ 份增加到 $PP+1$ 份.V3 的 EP 规模大,每卡上的专家参数少,存两份对显存影响不大.与 Chimera 相比,DualPipe 只要求 stage 数和 micro-batch 数能被 2 整除,不要求 micro-batch 数能被 stage 数整除;micro-batch 增多时气泡与激活都不增长.

### 2.3 两级 dispatch 与低精度通信

集群中节点间 IB 为 50 GB/s,节点内 NVLink 为 160 GB/s,约 3.2 倍.V3 的节点受限路由让每个 token 最多去 4 个节点(门控见 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) 第 3.2 节).token 的路由决定后,先经 IB 发送到各目标节点上与源卡同号的 GPU,到达后立即经 NVLink 转发到持有目标专家的 GPU,不被后到的 token 阻塞.这样 IB 与 NVLink 的传输完全重叠.

两级转发改变了式 (1) 的跨节点部分:同一 token 发往同一节点的多个专家时,IB 上只传一份.每 token 的 IB 数据量上限是 4 个节点各一份,FP8 下为 $4\times7168=28672$ 字节,是 8 个副本直接发送的一半.按 50 GB/s 算,每 token 每层单向的 IB 传输上限约 0.57 μs;若一张卡在一个 micro-batch 里有 4096 个 token,单向 dispatch 的 IB 部分约 2.35 ms,combine 以 BF16 返回再翻倍.这类量级需要被计算掩盖,DualPipe 与通信 kernel 的设计都围绕这一点.报告的估算是,在不增加 NVLink 开销的前提下每个 token 平均可以在每个节点选 3.2 个专家,所以同样的通信代价最多能支持 $4\times3.2\approx13$ 个专家,V3 实际只用 8 个.

通信 kernel 用 warp specialization 把 20 个 SM 分成 10 个通信通道.dispatch 中 IB 发送,IB 到 NVLink 的转发,NVLink 接收分别由不同的 warp 处理;combine 中 NVLink 发送,NVLink 到 IB 的转发与累加,IB 接收与累加同样分开.各任务的 warp 数按实际负载动态调整.kernel 使用定制的 PTX 指令并自动调节通信块大小,减少对 L2 cache 的占用和对其他计算 SM 的干扰.报告称 20 个 SM 就能跑满 IB 与 NVLink 带宽.

**低精度通信.** MoE 上投影之前的激活先量化为 FP8 再 dispatch,与上投影的 FP8 前向计算衔接;缩放因子取 2 的整数次幂.MoE 下投影之前的激活梯度也用同样做法.前向与反向的 combine 都保留 BF16,以保护训练精度.dispatch 用 FP8 让式 (1) 中的 $b$ 从 2 降到 1(另加少量缩放因子).

**对通信硬件的建议.** V3 报告第 3.5.1 节指出了这套方案的代价:通信靠 SM 执行,H800 的 132 个 SM 中有 20 个分给通信,约占 15%,这部分 SM 上的 Tensor Core 完全闲置.这些 SM 做的事有四类:在 IB 与 NVLink 两个域之间转发数据,并把发往同一节点多张卡的 IB 流量汇聚到一张卡上发出;在 RDMA 缓冲区与输入输出缓冲区之间搬运数据;执行 combine 中的归约;按专家分块传输时管理细粒度的内存布局.报告希望硬件厂商把这些任务从 SM 上卸载到 GPU 协处理器或网络协处理器上(例如 NVIDIA SHARP),并在计算单元看来统一 IB(scale-out)与 NVLink(scale-up)两套网络,让计算单元用读,写,多播,归约等简单原语在整个统一域内提交通信请求.第 4.2 节 DeepEP 至今仍需占用 SM,不支持零 SM 的 RDMA EP,对应的就是这一限制.

---

## 3. 推理部署

### 3.1 prefill

V3 的 prefill 最小部署单元是 4 个节点 32 张卡.注意力用 TP4 加 SP,再加 DP8;TP 只有 4 路,TP 通信开销有限.MoE 部分用 EP32,保证每个专家处理的 batch 足够大.All-to-All 与训练相同,先跨节点走 IB,再在节点内走 NVLink.浅层的稠密 MLP 用 1 路 TP,省去 TP 通信.

推理时的负载由线上请求决定,训练期的均衡不能保证部署时的均衡.V3 报告在讨论 batch 级负载均衡时列了两个效率隐患:一是个别序列或小 batch 内部的不均衡,二是推理时领域变化引起的不均衡.前者由训练框架解决,大规模 EP 与 DP 保证每个 micro-batch 足够大,batch 内的统计接近整体;后者无法在训练中消除,只能在部署侧处理.V3 用冗余专家:根据线上统计找出高负载专家,复制后多处部署,并定期调整(报告举例为每 10 分钟).确定冗余集合后,在节点内按观测负载重新排布专家,尽量均衡各卡负载且不增加跨节点 All-to-All.prefill 设 32 个冗余专家,每张卡除原有的 8 个专家外再放 1 个冗余专家.为了掩盖 All-to-All 和 TP 通信,prefill 同时处理两个计算量相近的 micro-batch,一个做注意力和 MoE 计算时,另一个做 dispatch 与 combine.

### 3.2 decode

decode 时共享专家被当作一个总会被选中的高负载路由专家,每个 token 选 9 个专家.最小部署单元是 40 个节点 320 张卡:注意力用 TP4 加 SP,再加 DP80;MoE 用 EP320,每张卡只放 1 个专家,其中 64 张卡负责冗余专家和共享专家.dispatch 与 combine 直接经 IB 点对点传输以降低延迟,并用 IBGDA 进一步减少延迟.冗余专家集合同样定期按线上统计更新,但每卡只有一个专家,不需要重新排布.

decode 阶段每个专家的 batch 通常在 256 个 token 以内,瓶颈是显存访问而不是计算.MoE 部分每卡只读一个专家的参数,访存量小,分给 dispatch,MoE 计算与 combine 的 SM 少一些对整体影响不大.这一判断可以用算术强度核对.专家的一个 $d\times H$ 矩阵处理 $n$ 个 token,计算 $2ndH$ FLOPs,读取权重 $dH\,b$ 字节(token 激活远小于权重时忽略),算术强度为

$$
I=\frac{2ndH}{dH\,b}=\frac{2n}{b} \tag{7}
$$

FLOPs/字节,与矩阵形状无关.H100 SXM 数据手册的 BF16 稠密算力约 989 TFLOPS(标称 1979 为结构化稀疏值),HBM 带宽 3.35 TB/s,平衡点约为 295 FLOPs/字节.BF16 权重($b=2$)要 $n\approx295$ 个 token 才能跑到算力上限;FP8 权重与 FP8 计算时算力和 $b$ 同时翻倍,平衡点仍约为 295 个 token.decode 中每专家 256 个以内的 token 处在受带宽限制的一侧,与 V3 报告的判断一致.这也是 decode 用 EP320,每卡一个专家的原因之一:每卡要读的权重只有一个专家.

报告正在尝试 decode 的双 micro-batch 重叠:decode 中注意力耗时占比更大,所以用一个 micro-batch 的注意力去重叠另一个的 dispatch,MoE 与 combine.

![节点内 TP 的注意力与跨专家的 EP](./images/fig-moe-tp-ep-dispatch.png)

**图 2 解析**

- 五个阶段依次是输入,TP 切分的注意力(两个 TP rank 之间 AllReduce),dispatch All-to-All,各专家计算,combine All-to-All.
- 图中注意力放在 rank 0–1,专家放在 rank 2–5,两组卡互不重叠.V3 的 prefill 与 decode 都是同一批卡既算注意力又持有专家(例如 decode 的 320 卡上注意力为 TP4×DP80,MoE 为 EP320),图中的分离画法只是为了区分两种并行.
- 图中每个专家只连一个输入方向,实际每个专家都接收来自所有数据并行分片的 token,combine 再把结果送回各自的源分片.

---

## 4. 专家计算的 kernel

### 4.1 grouped GEMM 与对齐

dispatch 之后,每张卡上有若干个专家,每个专家收到的 token 数不同.逐个专家调用 GEMM 会产生大量小 kernel;grouped GEMM 在一次启动中完成所有专家的矩阵乘.

DeepGEMM(DeepSeek,[GitHub](https://github.com/deepseek-ai/DeepGEMM))的 grouped GEMM 只在 M 维分组,N 与 K 固定,对应 MoE 中各专家形状相同的情形.训练前向和推理 prefill 中,各专家的 token 拼成一个张量,称为 contiguous 布局,每个专家的片段必须对齐到 GEMM 的 M 块大小;权重反向另有按 K 维分组的接口.decode 阶段开启 CUDA graph 时,CPU 不知道每个专家收到多少 token,改用 masked 布局:给定 mask 张量,kernel 只计算有效部分,DeepEP 低延迟 kernel 的输出可以直接作为输入.

对齐带来填充.专家 $i$ 收到 $n_i$ 个 token,M 块大小为 $b_M$,实际计算的行数是 $b_M\lceil n_i/b_M\rceil$,每卡的填充行数

$$
P=\sum_{i}\Bigl(b_M\Bigl\lceil\frac{n_i}{b_M}\Bigr\rceil-n_i\Bigr)<E_{\mathrm{local}}\,b_M \tag{6}
$$

$E_{\mathrm{local}}$ 是本卡专家数.算例:V3 训练时每卡 4 个专家,取 $b_M=128$,填充少于 512 行;若每卡每个 micro-batch 有 4096 个 token,$k=8$,均匀路由下每卡收到约 32768 行,填充不到 1.6%.若每个专家只有 100 个 token,单个专家就要补 28 行,占 28%.专家越细,每个专家的 $n_i$ 越小,同样的上界占实际计算的比例越大.这与 [03](../03-MoE负载均衡与容量/03-MoE负载均衡与容量.md) 第 4.1 节 MegaBlocks 的 block-sparse 填充上界是同一回事.

### 4.2 DeepEP

DeepEP(DeepSeek,[GitHub](https://github.com/deepseek-ai/DeepEP))是 V3 通信 kernel 的开源实现,提供高吞吐和低延迟两类 EP All-to-All kernel,包括 FP8 dispatch.当前版本把两类接口统一为 `EPBuffer`,训练,prefill,decode 使用同一套 dispatch / combine API;输出采用为 grouped GEMM 准备的展开布局,对齐值取 DeepGEMM contiguous 布局要求的 M 对齐.dispatch 与 combine 可以异步发起,在专家计算需要结果的位置再等待,中间插入其他计算.训练保存前向的 handle 供反向使用,反向可以复用已保存的布局,省去再次的 CPU 同步.

DeepEP 的通信需要占用 GPU SM,不支持零 SM 的 RDMA EP.它还提供冗余专家的两个原语:专家计算前经 NVLink 把原专家的权重与量化缩放因子预取到冗余槽,反向时把冗余专家的 FP32 梯度经 NVLink 累加回原专家.复制方案,token 改派与专家 GEMM 由调用方负责;README 提到 Kimi K3 的 MoonEP 与 UltraEP 采用这种按专家复制的做法(MoonEP 的规划与 $E/R$ 上界见 [04](../04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md) 第 5.1 节).

### 4.3 SonicMoE

SonicMoE(Guo, Mishra, Cheng, Stoica, Dao,[arXiv:2512.14080](https://arxiv.org/abs/2512.14080))针对两个趋势:专家越细(中间维越小),越稀疏(激活专家数不变,总专家数增加).论文列出三个代价:反向需要缓存的激活随激活专家数线性增长;小专家的 GEMM 算术强度低,访存占比上升;稀疏 MoE 中每专家 token 少,grouped GEMM 的 tile 填充浪费计算.

对第一点,论文分析了粒度对前向与反向的影响:FLOPs 不变时粒度增加,反向所需激活显存线性增加.SonicMoE 重新安排计算图,不再为路由器梯度的计算缓存激活,数学上与原始 MoE 等价,每层激活显存不随粒度增长,细粒度 7B MoE 在 H100 上每层激活显存最多降低 45%.对第二点,Hopper 与 Blackwell 的 GEMM 采用生产者 / 消费者模式,生产者 warpgroup 从 HBM 搬 tile 到共享内存,消费者 warpgroup 做矩阵乘;SonicMoE 利用这种异步性把访存与计算重叠.对第三点,token rounding 把每个专家的 token 数取整到 grouped GEMM tile 大小(例如 128)的倍数,尽量保留原 Top-$K$ 指派,每个专家与原结果的偏差不超过一个 tile,token 总数的期望不变,从而消除式 (6) 的填充.

论文报告的数字:细粒度 7B MoE 在 Hopper 上的计算吞吐是 ScatterMoE BF16 kernel 的 1.86 倍;64 张 H100 每天训练 213B token,ScatterMoE 用 96 张 H100 为 225B(FSDP-2,lm-engine 框架).H100 上前向 TFLOPS 比 DeepGEMM 高 43%,反向比 ScatterMoE 高 83%,比 MoMoE 高 115%;B300 上对 OLMoE 规模的 7B MoE,前向与反向分别比 DeepGEMM 快 25% 与 15%.在 30B MoE 基础上把专家数扩大 4 倍时,token rounding 比普通 token-choice 快 16%,下游效果相近.

---

## 5. 动态并行与失效模式

### 5.1 动态并行:Tutel 与 SmartMoE

MoE 的负载随训练变化,固定的并行方式不一定一直最优.Tutel(Hwang et al.,MLSys 2023,[arXiv:2206.03382](https://arxiv.org/abs/2206.03382))在运行时切换并行方式和流水深度,论文称切换零开销.通信侧提供 Flexible All-to-All 和 2DH All-to-All.2DH 是两级 All-to-All:设 $R$ 张卡分布在若干节点上,每节点 $G$ 张卡,直接 All-to-All 时每对卡之间的消息约为每卡发送量的 $1/R$,规模大时消息很小,跨节点链路的效率低;先在节点内交换,把发往同一远端节点的数据汇聚到一张卡上,跨节点消息就变成原来的 $G$ 倍左右.V3 的「先 IB 到同号 GPU,再 NVLink 转发」方向相反(先跨节点,后节点内),目的同样是减少跨节点的重复传输.报告的负载变化幅度最高 4.38 倍;单层 MoE 在 16 张与 2048 张 A100 上分别加速 4.96 倍与 5.75 倍;SwinV2-MoE 的训练与推理相对 Fairseq 分别加速 1.55 倍与 2.11 倍.

SmartMoE(Zhai et al.,USENIX ATC 2023)把并行策略的选择分成两步:离线根据模型与集群构造候选策略池,在线按当前负载从池中选择.相对 FasterMoE 最高加速 1.88 倍,实验规模最多 64 张 GPU.

这两种方法和 V3 的冗余专家,K3 的 MoonEP 都在处理负载随时间变化的问题,手段不同:Tutel 与 SmartMoE 改并行方式,V3 定期复制热门专家,MoonEP 每步规划冗余专家使每卡 token 数严格相等.

### 5.2 失效模式

下表的问题大多来自通信与计算的比例.第 1,3,4 行是 dispatch 的通信量和 SM 占用,对应第 1.1 节的式 (1) 和第 2.3 节;第 2 行和第 11 行是专家变细后 kernel 的填充与算术强度,见第 4.1 节和第 3.2 节;第 5 行和第 10 行是训练调度,见第 2.1 节和第 2.2 节;第 6,7 行是负载在训练与部署之间的差异;第 8 行是 decode 的张量布局,见第 3.2 节;第 9 行是低精度通信,见第 2.3 节;最后两行是并行方式的选择,见第 1.2 节.

| 现象 | 原因 | 处理 |
|------|------|------|
| 增加 $k$ 后步时明显变长 | 式 (1) 与 $k$ 成正比 | 节点受限路由,两级 dispatch,或缩小路由宽度(LatentMoE) |
| 增加专家数后通信没有变化却变慢 | 每专家 token 变少,式 (6) 的填充比例上升 | token rounding,或按 tile 对齐的路由 |
| IB 带宽跑满,NVLink 空闲 | 同一 token 向同一节点的多个专家重复发送 | 先 IB 到同号 GPU,再 NVLink 转发 |
| 通信 kernel 拖慢计算 | 通信占用 SM 和 L2 | 限制通信 SM 数(V3 为 20),warp specialization,调节块大小 |
| 流水气泡大 | 1F1B 的气泡系数为 $PP-1$ | DualPipe 或 ZeroBubble 类调度 |
| 训练时均衡,部署时某些卡过热 | 线上请求分布与训练不同 | 冗余专家,定期按统计更新 |
| 小 batch 训练时负载波动大 | batch 内统计偏离整体 | 增大每个 micro-batch(V3 依靠大规模 EP 与 DP) |
| decode 用 contiguous 布局导致 CPU 同步 | CPU 需要知道每个专家的 token 数 | masked 布局配合 CUDA graph |
| combine 也用 FP8 后精度下降 | 加权求和对误差敏感 | V3 的 combine 保留 BF16 |
| 共享专家与路由专家串行执行 | 共享专家等 dispatch 完成才开始 | 共享专家不依赖 dispatch,在通信期间先算(V2 的做法) |
| decode 加大 SM 给 MoE 仍不见提速 | 每专家 token 少,式 (7) 的算术强度低,受带宽限制 | 减少每卡专家数,或用权重流式读取的 decode kernel |
| 显存不足时直接上 ZeRO-3 | 参数也切以后,每层计算前都要 AllGather 参数 | 先看大规模 EP 加 ZeRO-1 能否放下 |
| 把 EP 当作 TP 的替代全面使用 | 注意力层没有专家 | 注意力用 DP 或小 TP,MoE 用 EP |

---

## 参考文献

1. Lepikhin, D., et al. (2020). [GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding](https://arxiv.org/abs/2006.16668).
2. Fedus, W., Zoph, B., & Shazeer, N. (2021). [Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity](https://arxiv.org/abs/2101.03961). 第 5 节并行方式.
3. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). §3.1–3.4,Table 2.
4. Moonshot AI. (2026). [Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653). §5.2.1 MoonEP,推理 kernel 一节.
5. DeepSeek. [DeepGEMM](https://github.com/deepseek-ai/DeepGEMM). README:grouped GEMM 的 contiguous 与 masked 布局.
6. DeepSeek. [DeepEP](https://github.com/deepseek-ai/DeepEP). README:`EPBuffer`,FP8 dispatch,冗余专家原语.
7. Guo, W., Mishra, M., Cheng, X., Stoica, I., & Dao, T. (2025). [SonicMoE: Accelerating MoE with IO and Tile-aware Optimizations](https://arxiv.org/abs/2512.14080).
8. Hwang, C., et al. (2023). [Tutel: Adaptive Mixture-of-Experts at Scale](https://arxiv.org/abs/2206.03382). MLSys 2023.
9. Zhai, M., et al. (2023). SmartMoE: Efficiently Training Sparsely-Activated Models through Combining Offline and Online Parallelization. USENIX ATC 2023.
10. Patarasuk, P., & Yuan, X. (2009). Bandwidth Optimal All-reduce Algorithms for Clusters of Workstations. *Journal of Parallel and Distributed Computing*, 69(2).
11. Elango, V., et al. (2026). [LatentMoE](https://arxiv.org/abs/2601.18089).
12. NVIDIA. [H100 Tensor Core GPU Datasheet](https://www.nvidia.com/en-us/data-center/h100/). SXM 版 BF16 算力与 HBM 带宽.
13. Rajbhandari, S., Rasley, J., Ruwase, O., & He, Y. (2020). [ZeRO: Memory Optimizations Toward Training Trillion Parameter Models](https://arxiv.org/abs/1910.02054). SC20.
14. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434). §3.1.3 Infrastructures.
