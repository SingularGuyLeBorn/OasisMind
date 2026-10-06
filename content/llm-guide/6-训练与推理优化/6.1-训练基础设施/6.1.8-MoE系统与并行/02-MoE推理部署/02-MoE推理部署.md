---
title: "02 · MoE 推理部署: Prefill, Decode 与动态负载"
published: true
tags: ["MoE", "推理部署", "专家并行", "冗余专家", "Tutel", "SmartMoE", "CUDA-Graph"]
excerpt: "同一个 MoE 层, prefill 时每个专家分到上千个 token, decode 时只剩几十个. 本篇按两个阶段分别算通信量与算术强度, 整理 DeepSeek-V3 的 prefill 与 decode 部署, 冗余专家, Tutel 与 SmartMoE 的运行时适配, CUDA Graph 下的 dispatch, 以及显存不够时的专家卸载."
---
# 02 MoE 推理部署: Prefill, Decode 与动态负载

训练时 EP 的规模和每个 micro-batch 的大小都由框架决定, 推理时这两样由请求决定. prefill 一次处理整段 prompt, 每个专家分到的 token 多, 形状接近训练; decode 每步每条序列只出一个 token, 每个专家只分到几十个, 计算量小到跑不满 Tensor Core, 读专家权重的时间反而成了主项. 线上请求的分布也和训练数据不同, 训练时均衡的专家, 部署时会有一部分持续过热.

本篇用的记号和通信量公式来自 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md): $T$ 是本卡一步的 token 数, $K$ 是每 token 激活的路由专家数, $E$ 是一层的路由专家数, $d$ 是模型宽度, $b$ 是每元素字节数. 专家 GEMM 的 kernel 与 Contiguous / Masked 两种布局在 [03](../03-MoE专家计算/03-MoE专家计算.md).

## 1. Prefill 与 Decode: 同一层, 两种形状

### 1.1 token 数决定通信形状

把 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 式 (1) 的 $(R-1)/R$ 取 1 作上界, 一层 dispatch 与 combine 来回的字节数约为

$$
V_{\mathrm{A2A}}\approx2\,T\,K\,d\,b. \tag{1}
$$

取 prefill 的 batch 8, 长度 4096, $T=32768$, 再取 $K=2$, $d=4096$, BF16 ($b=2$), 一层来回 $2\times32768\times2\times4096\times2=2^{30}$ 字节, 即 1 GiB. 换成 decode 的 batch 8, $T=8$, 同一公式只剩 256 KiB. 字节数降了 4096 倍, 每次 All-to-All 的启动延迟和跨节点的往返延迟却不变. prefill 的通信是带宽问题, 可以和大块计算重叠; decode 的通信是延迟问题, 消息小, 次数一样多. 这是 decode 的 EP 要么收在节点内, 要么像第 2.2 节那样换成直接点对点并用 IBGDA 去掉 CPU 参与的原因.

EP 度的选择还要看一张卡放不放得下 $E/R$ 份专家. Mixtral 8x7B 每层 8 个专家, Top-2, $d=4096$, 专家中间维 14336, 32 层 ([Jiang et al., 2024](https://arxiv.org/abs/2401.04088)). 一个专家 $3\times4096\times14336\approx1.76\times10^8$ 个参数, BF16 约 352 MB, 一层 8 个约 2.8 GB, 32 层约 90 GB. EP 取 8 时每卡每层一个专家, 专家权重约 11 GB, dispatch 的目的卡几乎等于专家编号, 跨卡流量最多; EP 取 2 时每卡每层四个专家, 约 45 GB, All-to-All 只在两张卡之间, 其余在本卡 grouped GEMM 里完成. 细粒度到 $E=256$, $K=8$ 时, 每卡一个专家要 256 张卡两两通信, 所以 V3 先用节点受限路由把目的地收到 4 个节点, 再谈部署.

### 1.2 算术强度: decode 为什么受带宽限制

decode 的瓶颈可以用算术强度核对. 专家的一个 $d\times H$ 矩阵处理 $n$ 个 token, 计算 $2ndH$ FLOPs, 读取权重 $dH\,b$ 字节 (token 激活远小于权重时忽略), 算术强度为

$$
I=\frac{2ndH}{dH\,b}=\frac{2n}{b} \tag{2}
$$

FLOPs/字节, 与矩阵形状无关. H100 SXM 数据手册的 BF16 稠密算力约 989 TFLOPS (标称 1979 是结构化稀疏值), HBM 带宽 3.35 TB/s, 平衡点约 295 FLOPs/字节. BF16 权重 ($b=2$) 要 $n\approx295$ 个 token 才能跑到算力上限; FP8 权重配 FP8 计算时算力和 $1/b$ 同时翻倍, 平衡点仍约 295 个 token. 每个专家分到的 token 数是 $TK/E$: Mixtral 在 decode batch 64 时每个专家约 16 个 token, 离 295 差一个数量级.

式 (2) 只算了权重, 把激活的读写也算进去, 就得到 [03](../03-MoE专家计算/03-MoE专家计算.md) 第 3.1 节 SonicMoE 给出的完整式子, 它在 token 很少时退化成式 (2). decode 时提高专家 GEMM 效率的办法只有两类: 让每个专家一次多拿 token (更大的 batch, 更少的专家副本), 或者让每张卡少读权重 (每卡少放专家, 降位宽). 下一节 V3 的 decode 部署两样都用了.

## 2. DeepSeek-V3 的推理部署

### 2.1 prefill: 32 卡

V3 报告 ([DeepSeek-AI, 2024](https://arxiv.org/abs/2412.19437)) §3.4 把 prefill 与 decode 分开部署. prefill 的最小部署单元是 4 个节点 32 张卡. 注意力用 TP4 加 SP, 再加 DP8; TP 只有 4 路, 通信开销有限. MoE 部分用 EP32, 保证每个专家处理的 batch 足够大. All-to-All 与训练相同, 先跨节点走 IB, 再在节点内走 NVLink. 浅层的稠密 MLP 用 1 路 TP, 省去 TP 通信.

prefill 设 32 个冗余专家, 每张卡除原有的 8 个专家外再放 1 个冗余专家 (冗余专家怎么选见第 2.3 节). 为了掩盖 All-to-All 和 TP 通信, prefill 同时处理两个计算量相近的 micro-batch, 一个做注意力和 MoE 计算时, 另一个做 dispatch 与 combine. 报告还提到在探索动态冗余: 每张卡放 16 个专家, 每步只激活其中 9 个, 在每层 All-to-All 开始前按全局最优路由方案临时决定激活哪些.

### 2.2 decode: 320 卡

decode 时共享专家被当作一个总会被选中的高负载路由专家, 每个 token 选 9 个专家. 最小部署单元是 40 个节点 320 张卡: 注意力用 TP4 加 SP, 再加 DP80; MoE 用 EP320, 每张卡只放 1 个专家, 其中 64 张卡负责冗余专家和共享专家. dispatch 与 combine 直接经 IB 点对点传输以降低延迟, 并用 IBGDA (GPU 直接发起 RDMA, 不经 CPU 代理) 进一步减少延迟. 冗余专家集合同样定期按线上统计更新, 每卡只有一个专家, 不需要重新排布.

报告给的判断是: decode 中每个专家的 batch 通常在 256 个 token 以内, 瓶颈是显存访问; MoE 部分每卡只读一个专家的参数, 访存量小, 分给 dispatch, MoE 计算与 combine 的 SM 少一些对整体影响不大. 用式 (2) 核对: FP8 权重 $b=1$, 256 个 token 的算术强度是 $2\times256/1=512$ FLOPs/字节; H100 的 FP8 稠密算力约 1979 TFLOPS, 平衡点约 590 FLOPs/字节, 256 个 token 仍处在受带宽限制的一侧. 一个 V3 路由专家有 $3\times7168\times2048\approx4.4\times10^7$ 个参数, FP8 下约 44 MB, 按 3.35 TB/s 读一遍约 13 μs; 这是每卡每层每步的固定开销, 和分到多少 token 无关. 每卡只放一个专家, 就是把这个开销压到最小.

和读权重的 13 μs 相比, decode 的通信更重. 按报告给的上限, 一张卡这一步收到 256 个 token, FP8 dispatch 每个 token $7168$ 字节 (缩放因子的约 3% 忽略), 共约 1.8 MB; combine 用 BF16, 约 3.7 MB. 按 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 第 3.3 节的 IB 带宽 50 GB/s 计算, dispatch 约 37 μs, combine 约 73 μs, 都比专家计算本身的访存长. 这还是带宽项, 小消息的启动与往返延迟另算. decode 的一层 MoE 里, 通信比计算更值得优化, 这也是下面要用注意力去重叠通信的原因. 报告还在尝试 decode 的双 micro-batch 重叠: decode 中注意力耗时占比更大, 所以用一个 micro-batch 的注意力去重叠另一个的 dispatch, MoE 与 combine.

### 2.3 训练均衡与部署均衡

V3 报告 §4.5.3 在讨论 batch 级负载均衡时列了两个效率隐患: 一是个别序列或小 batch 内部的不均衡, 二是推理时领域变化引起的不均衡. 前者由训练框架解决, 大规模 EP 与 DP 保证每个 micro-batch 足够大, batch 内的统计接近整体; 后者训练中消除不了, 只能在部署侧处理. 训练用的负载均衡损失或无辅助损失偏置 (见 [DeepSeek-MoE](../../../../2-核心原理与架构/2.6-MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md)) 管的是训练数据上的选择频率, 管不到线上流量.

V3 的部署侧办法是冗余专家: 根据线上统计找出高负载专家, 复制后多处部署, 并定期调整 (报告举例为每 10 分钟). 确定冗余集合后, 在节点内按观测负载重新排布专家, 尽量均衡各卡负载且不增加跨节点 All-to-All. 冗余的显存代价可以按 prefill 的配置算: 每卡每层多放一个 FP8 路由专家约 44 MB (第 2.2 节), 58 个 MoE 层合计约 2.6 GB, 换来的是 32 个最热专家各有两份副本, 这些专家的 token 可以分给两张卡.

[DeepEP](https://github.com/deepseek-ai/DeepEP) 为这种按专家复制的做法提供两个原语: 专家计算前经 NVLink 把原专家的权重与量化缩放因子预取到冗余槽 (`lb_prefetch_weights`), 反向时把冗余专家的 FP32 梯度经 NVLink 累加回原专家 (`lb_reduce_grads`). 复制方案, token 改派与专家 GEMM 由调用方负责; README 提到 Kimi K3 的 MoonEP 与 UltraEP 采用这种做法. MoonEP 每步规划冗余专家, 让每张卡收到的 token 数严格相等, 它管的是卡与卡之间的 token 数, 和 [Quantile Balancing](../../../../2-核心原理与架构/2.6-MoE/04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md) 管的专家间被选次数在两层.

## 3. 动态负载与运行时适配

### 3.1 Tutel: 运行时切换并行方式

冗余专家改的是专家放在哪, Tutel ([Hwang et al., 2023](https://arxiv.org/abs/2206.03382)) 改的是并行方式本身. 论文用容量描述每个专家的负载:

$$
C=k\cdot f\cdot\frac{T}{E}, \tag{3}
$$

$T$ 是一个 batch 的 token 数, $f\ge1$ 是容量因子, $f=1$ 对应完全均匀的分配, $f$ 越大说明路由越不均, 最忙的专家要处理的 token 越多. 多数框架把 $f$ 固定在一个上界, 每步的计算量因此固定, 上界设小了会丢 token, 设大了白算填充. Tutel 每步取不丢 token 的最小 $f$, 计算量跟着负载变. 论文在 SwinV2-MoE 的训练中测到, 同一层所需的容量在训练过程中最多变化 4.38 倍, 不同层的负载也不同. 负载变了, 最优并行方式也跟着变: 在 FFN 隐藏维 16K, 通道 2048, batch 4 的设定下, EP+DP 与 EP+MP 两种组合的吞吐随容量因子和 Top-$k$ 互有胜负, 差距在 7.39% 到 27.76% 之间. 论文还指出加大负载均衡损失的权重能压低容量需求, 但在 ImageNet-22K 上会掉精度, 所以不把它当作系统问题的解法.

Tutel 的关键设计是让 MoE 参数和输入数据只用一套分布布局 (identical layout), 这套布局能覆盖所有可能最优的并行策略. 普通实现里 DP 把同一份专家复制到每张卡, EP 把不同专家放到不同卡, 两套放置不相通, 切换就要搬权重; Tutel 下 DP 和 EP 只是对同一套切分的两种读法, 切换时不搬张量, 也不改前向的数学结果, 所以能每个 iteration 切一次. 流水侧同理: All-to-All 用 Linear 还是 2DH (见 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 第 2.2 节), 切成几段与计算流水, 也按当前配置在运行时选. 论文报告自适应并行切换让单个 MoE 层加速 1.35 到 14.57 倍; 所有优化合起来, 单个 MoE 层相对 Fairseq 在 16, 128, 2048 张 A100 上分别加速 4.96, 3.11, 5.75 倍; SwinV2-MoE 端到端训练与推理相对 Fairseq 最多加速 1.55 倍和 2.11 倍. 这些数字的分母是 2022 年前后的 Fairseq MoE 实现, 任务是视觉模型, 不能直接搬到今天的 LLM decode 上.

### 3.2 SmartMoE: 离线策略池加在线选择

SmartMoE ([Zhai et al., 2023](https://www.usenix.org/conference/atc23/presentation/zhai), USENIX ATC 2023) 把并行策略的选择分成两步: 离线根据模型与集群构造候选策略池, 池里的策略之间可以低成本互转, 并用负载感知的性能模型给它们打分; 在线按当前负载用轻量搜索从池中挑专家放置. 端到端相对 FasterMoE 最多加速 1.88 倍, 实验最多 64 张 GPU. 1.88 倍的分母是另一个 MoE 训练系统, 与 Tutel 的 Fairseq 分母不同, 两者的倍数不能互相比较.

这几种方法处理的都是负载随时间变化的问题, 手段不同. Tutel 与 SmartMoE 改并行方式或专家放置, 对象是训练中逐步漂移的负载; V3 的冗余专家定期复制热门专家, 对象是部署时稳定偏向某些领域的流量; MoonEP 每步规划冗余, 对象是单步内卡与卡之间的 token 数. 前两者付出的是策略搜索与切换的开销, 后两者付出的是多放专家副本的显存. 在 V3 那种每卡一个专家的 decode 部署里, 并行方式已经没有可切换的余地, 剩下能调的只有冗余专家的数量与位置.

## 4. 静态形状与 CUDA Graph

### 4.1 CUDA Graph 下的 dispatch

decode 每步都很短, kernel 启动和 CPU 调度的开销占比高, 通常用 CUDA Graph 把一步的 kernel 序列录下来重放. 图要求形状固定, MoE 的 dispatch 偏偏每步都变: 每个专家收到多少 token 只有路由跑完才知道, 而且是在 GPU 上知道. [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 第 1.4 节列了三种处理变长 All-to-All 的办法, decode 能用的是不需要 CPU 读计数的那两种. DeepEP 的 dispatch 有 `do_cpu_sync` 选项: 设为 True 时拿到精确的输出大小和 CPU 侧的各专家计数, 用于训练和 prefill; decode 设为 False, 输出按配置的容量分配, 后面的专家 GEMM 用 handle 里的 GPU 侧累计计数 (`psum_num_recv_tokens_per_expert`) 找到每个专家的有效区间. DeepGEMM 的 Masked 布局就是为接这种输出设计的, 见 [03](../03-MoE专家计算/03-MoE专家计算.md) 第 2.2 节.

DeepEP 这种做法的代价在显存: 输出按容量分配, 容量要按最坏情况设, 空槽占着显存但不参与计算. 新的路由决定需要重新 dispatch; 同一批 token 的路由不变时, 保存下来的 handle 可以重放展开布局, 不必再同步一次计数. 训练侧也用这一点, 反向复用前向的 handle, 见 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 第 4.2 节.

### 4.2 MetaShuffling: padding, slicing 与 shuffling

MetaShuffling ([PyTorch Blog, 2025](https://pytorch.org/blog/metashuffling-accelerating-llama-4-moe-inference/)) 是 Meta 为 Llama 4 写的 MoE 推理方案. Llama 4 Scout 与 Maverick 每层一个共享专家, 分别有 16 和 128 个路由专家, dropless token-choice, Top-1. 博客比较了单卡上处理变长的三种办法: padding 把每个专家的激活补到最大长度后跑一次 batched 矩阵乘, 多占显存也多算填充; slicing 按真实长度切开逐专家调 GEMM, 小形状效率低, 还要频繁的主机设备同步, 与 CUDA Graph 和 `torch.compile` 不兼容; shuffling 直接把 token 按专家编号排序, 同一专家的 token 存在一起, 交给支持 M 维动态形状的 GroupedGEMM, 张量形状静态且没有填充. 上了 EP 以后, 它在 eager 模式用稠密张量加动态形状, 省网络流量; 在图模式用填充后的静态形状, 多传填充换取可捕获.

padding, slicing, shuffling 三种办法和 [03](../03-MoE专家计算/03-MoE专家计算.md) 里 kernel 一侧的三条路线一一对应: padding 是固定容量加 batched GEMM, slicing 是逐专家调用, shuffling 是排序后交给 grouped GEMM. MetaShuffling 还把共享专家和路由专家放在两条 stream 上并行, 最终用一个 ScatterAdd kernel 把路由专家的输出按原位置直接加到共享专家的输出上, 不物化一份还原顺序的中间张量. Llama 4 的 Top-1 让这个问题更突出. 按 $TK/E$ 算, Maverick 在 decode batch 64 时 $T=64$, $K=1$, $E=128$, 平均每个专家只分到 0.5 个 token, 多数专家这一步收到 0 个或 1 个. padding 到统一长度时, 绝大部分计算花在填充上; 排序后交给 grouped GEMM, 空专家不产生计算. 同一个式子也说明 $K=1$ 时式 (1) 的通信量是 $K=2$ 的一半. 博客提到 TP 也可以和 EP 互换来提高 GEMM 效率, 代价是路由不均的风险变大; 这和第 1.1 节 Mixtral 的 EP 取舍是同一个问题.

## 5. 卸载与部署失效

### 5.1 显存不够: 专家卸载与 CPU 执行

前面的部署都假定所有专家常驻 HBM. 卡少时另一条路是卸载: 一部分专家放到 CPU 内存或 NVMe, 用到时再处理. 它改的是存储层级, 路由公式不变. 代价是 PCIe 比 HBM 和 NVLink 慢得多: PCIe 5.0 ×16 单向理论带宽约 64 GB/s, 一个 200 MB 的专家权重搬一次约 3 ms, 而同尺寸的 BF16 专家 GEMM 在 H100 上通常在亚毫秒量级. 没有预取, 每层现用现搬, 延迟就是一次 PCIe 拷贝.

Fiddler ([Kamahori et al., 2024](https://arxiv.org/abs/2402.07033)) 把专家不在 GPU 上时的执行方式分成两种: 把权重从 CPU 拷到 GPU 再算, 或者把激活从 GPU 拷到 CPU, 在 CPU 上算完再把输出拷回. 以 Mixtral 8x7B 为例, 一个专家的三个 $4096\times14336$ 矩阵在 16 位下超过 300 MB, 而 $n$ 个 token 的激活只有 $n\times4096\times2$ 字节, 一个 token 8 KiB. CPU 上算专家的延迟随 token 数近似线性增长, GPU 上的延迟几乎不随 token 数变化, 但要先付一次权重拷贝. 所以 token 少时在 CPU 上算更快, token 多时搬权重更快, Fiddler 按每个专家这一步收到的 token 数用延迟模型在两者之间选.

论文附录的微基准给出了这个延迟模型的依据: 在 GPU 上执行时, 把一个专家的权重从 CPU 拷到 GPU 的时间是实际计算时间的 2 到 5 倍, 计算时间基本不随 batch 变化; 在 CPU 上执行时, 延迟随输入 token 数近似线性增长, 拷贝激活的时间不到单 token 计算延迟的 1%. 于是两条路径的延迟可以写成

$$
t_{\mathrm{GPU}}=t_{\mathrm{copy}}+t_{\mathrm{g}},\qquad t_{\mathrm{CPU}}(n)=\alpha\,n, \tag{4}
$$

$t_{\mathrm{copy}}$ 是一次权重拷贝, $t_{\mathrm{g}}$ 是 GPU 上的专家计算, $\alpha$ 是 CPU 上每个 token 的计算时间. $n<(t_{\mathrm{copy}}+t_{\mathrm{g}})/\alpha$ 时留在 CPU 上算. decode 时每个专家分到的 token 少, 多数走 CPU; 长 prefill 时 $n$ 上千, 走 GPU. 单卡运行 16 位 Mixtral 8x7B (超过 90 GB 参数) 时, 论文报告相对不同基线在单 batch 推理, 长 prefill, beam search 上平均加速 1.26, 1.30, 11.57 倍.

### 5.2 预取与 Pre-gated MoE

搬权重的另一种处理是预取: 在当前层专家 GEMM 进行的同时, 提前把下一层会用到的专家异步搬进 HBM. 困难在于下一层用哪些专家要等下一层的路由器算完才知道, 预取只能靠猜, 猜错了就停下等 PCIe. Pre-gated MoE ([Hwang et al., 2024](https://arxiv.org/abs/2308.12066), ISCA 2024) 从模型这一侧去掉这个依赖: 第 $N$ 个 MoE 块的门控函数改为选第 $N+1$ 个块要激活的专家 (称为 pre-gate), 训练时就按这种错开一层的方式学. 选择提前了一层, 系统就能在第 $N$ 块执行时确定地预取第 $N+1$ 块的专家, 拷贝与专家计算重叠. 论文报告精度与原模型持平或更高, 端到端延迟只比把全部参数放进 GPU 的方案多 23%.

两种预取的差别在于改不改模型. 按历史频率或启发式预测下一层专家, 模型不动, 拿来就能用, 但命中率取决于路由的可预测程度, 没命中的那部分仍要现搬. Pre-gating 改了门控的语义, 必须按这种结构训练或微调, 换来的是选择确定, 预取不会落空. 第一个 MoE 块之前没有上一块替它选专家, 这一块要另外处理. 对已经训练好, 不打算再动的模型, 能用的只有前一种.

卸载适合冷专家多, 路由稳定的模型, 热专家仍应常驻 HBM. 量化处理的是同一种冷热差异, 手段是降位宽而不是换层级, 见 [MoE 模型量化技术综述](../../../6.3-模型压缩/6.3.1-量化/05-MoE模型量化技术综述/05-MoE模型量化技术综述.md); 预取藏不住拷贝时, 把冷专家量化后留在 HBM 往往比卸载更划算. 从近存计算出发绕开这次搬运的硬件设计在 [9.1.5 MoE 硬件与加速](../../../../9-AI工程化与基础设施/9.1-硬件基础/9.1.5-MoE硬件与加速/9.1.5-MoE硬件与加速.md).

### 5.3 部署侧的常见失效

下表的问题大多来自同一个原因: 把训练或 prefill 的形状套到 decode 上, 或者把训练数据上的均衡当成线上的均衡.

| 现象 | 原因 | 处理 |
|------|------|------|
| decode 开跨节点大 EP 后延迟反升 | 式 (1) 里 $T$ 很小, 启动与往返延迟占主导 | 节点内 EP, 或直接点对点加 IBGDA |
| decode 加大 SM 给 MoE 仍不见提速 | 每专家 token 少, 式 (2) 的算术强度低 | 每卡少放专家, 降低权重位宽 |
| 训练时均衡, 部署时某些卡过热 | 线上请求分布与训练不同 | 冗余专家, 定期按统计更新 |
| decode 用 contiguous 布局导致 CPU 同步 | CPU 需要知道每个专家的 token 数 | GPU 侧计数加 masked 布局, 配合 CUDA Graph |
| 卸载后每层停顿数毫秒 | PCIe 拷贝没被预取藏住 | 提高预取命中率, 或量化冷专家留在 HBM |

前两行是同一组数字在通信和计算两侧的表现: decode 的 $T$ 小, 通信变成延迟问题, 专家 GEMM 变成带宽问题, 两边加资源都不起作用, 要改的是部署形状. 第三行对应第 2.3 节, 训练里能做到的只是让每个 micro-batch 足够大, 线上的偏移只能靠冗余专家这类部署手段. 第四行对应第 4.1 节, CUDA Graph 的前提是形状静态, 动态的只能是 GPU 上的计数. 最终一行对应第 5.1 和 5.2 节.

这几行的处理都有代价. 冗余专家多占显存, 每卡少放专家要更多的卡, 填充成静态形状多传数据, 预取多占 PCIe 带宽. 选哪一种, 要先用式 (1) 和式 (2) 算清楚当前部署卡在通信, 计算还是访存上, 再看哪一种代价付得起. 比如 decode 的时间主要花在第 2.2 节算出的几十微秒通信上时, 多放冗余专家换不回延迟, 应先缩小 All-to-All 的范围, 或者用另一个 micro-batch 的注意力把它重叠掉.

**参考文献**

1. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). §3.4 推理与部署, §4.5.3 batch 级负载均衡.
2. Hwang, C., et al. (2023). [Tutel: Adaptive Mixture-of-Experts at Scale](https://arxiv.org/abs/2206.03382). MLSys 2023.
3. Zhai, M., et al. (2023). [SmartMoE: Efficiently Training Sparsely-Activated Models through Combining Offline and Online Parallelization](https://www.usenix.org/conference/atc23/presentation/zhai). USENIX ATC 2023.
4. DeepSeek. [DeepEP](https://github.com/deepseek-ai/DeepEP). README: `do_cpu_sync`, 冗余专家原语.
5. Meta. (2025). [MetaShuffling: Accelerating Llama 4 MoE Inference](https://pytorch.org/blog/metashuffling-accelerating-llama-4-moe-inference/). PyTorch Blog.
6. Jiang, A. Q., et al. (2024). [Mixtral of Experts](https://arxiv.org/abs/2401.04088). Table 1 配置.
7. NVIDIA. [H100 Tensor Core GPU Datasheet](https://www.nvidia.com/en-us/data-center/h100/). SXM 版 BF16 算力与 HBM 带宽.
8. Moonshot AI. (2026). [Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653). §5.2.1 MoonEP.
9. Kamahori, K., Tang, T., Gu, Y., Zhu, K., & Kasikci, B. (2024). [Fiddler: CPU-GPU Orchestration for Fast Inference of Mixture-of-Experts Models](https://arxiv.org/abs/2402.07033).
10. Hwang, R., Wei, J., Cao, S., et al. (2024). [Pre-gated MoE: An Algorithm-System Co-Design for Fast and Scalable Mixture-of-Expert Inference](https://arxiv.org/abs/2308.12066). ISCA 2024.
