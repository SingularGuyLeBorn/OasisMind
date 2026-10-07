---
title: "01 · MoE 专用硬件: FPGA, 近数据计算与存内计算"
published: true
tags: ["MoE", "硬件架构", "FPGA", "NDP", "PIM", "Edge-MoE", "UbiMoE", "MoNDE", "Duplex"]
excerpt: "MoE 推理时每个专家一步只分到几个 token, 运算强度约为 2t/b, 比 GPU 的 ridge point 低两个数量级, 权重又大到放不进片上或显存. 本篇从这两点出发, 讲 FPGA 加速器 (Edge-MoE, UbiMoE, FLAME), 近数据计算 (MoNDE, Fiddler), 存内计算 (Duplex, PIMoE) 与专家预测 (Pre-gated MoE) 各自怎样处理, 以及它们成立的条件."
---
# MoE 专用硬件: FPGA, 近数据计算与存内计算

MoE 的前向每次只用到少数专家, 用哪几个由输入决定. 按稠密 GEMM 排好的静态数据流碰上这种动态性, 会出现三种浪费: 部分计算单元空转, 片上缓冲装不下全部专家权重, 专家间的数据交换随路由变化. 推理时还有一个更根本的问题: 每个专家一步只处理很少的 token, 计算量相对于要读的权重太小, 延迟由搬权重的速度决定, 加算力没有用.

GPU 集群上的应对 (专家并行, All-to-All 调度, Grouped GEMM, 卸载与预取) 在 [6.1.8 MoE 系统与并行](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/6.1.8-MoE系统与并行.md). 这里讨论的是硬件可以改的情形: 为 MoE 设计数据流, 片上缓冲和存储层级, 或者把计算放到存权重的地方. 下面的工作多数是研究原型, 有些针对视觉 Transformer 上的 MoE, 规模比数据中心的 LLM 小, 但它们处理的瓶颈和 LLM 推理相同. 降低权重位宽是另一种减少搬运的办法, 见 [6.3.1/05 MoE 量化](../../../../6-训练与推理优化/6.3-模型压缩/6.3.1-量化/05-MoE模型量化技术综述/05-MoE模型量化技术综述.md).

## 1. MoE 层在硬件上的瓶颈

### 1.1 动态路由带来的三件事

第一, 计算不可预测. 这一步激活的专家集合和下一步不同, 每个专家分到的 token 数也不同, 按固定顺序排好的流水线会有一部分单元空转. 训练侧的负载均衡损失或无辅助损失偏置 (见 [2.6/03](../../../../2-核心原理与架构/2.6-MoE/03-MoE负载均衡与容量/03-MoE负载均衡与容量.md)) 能让专家被选中的分布平一些, 但做不到每一步都均匀, 硬件仍然要处理变长的 Grouped GEMM 和溢出的 token.

第二, 数据交换随路由变化. token 要送到哪个专家是门控的输出, 不是固定的网格拓扑. 在多卡上这表现为专家并行的 All-to-All, 它和注意力张量并行的 AllReduce 是两种通信模式, 前者的流量分布每一步都在变; 在单芯片上则表现为片上网络和缓冲区的访问模式不规则. 第三, 权重放在哪里. 专家多的时候, 全部专家常驻高速存储, 与只加载这一步用到的专家, 是两套完全不同的存储设计; 后者又引出了第 4.1 节的专家预测问题.

### 1.2 运算强度与带宽墙

运算强度 $I$ 是一个 kernel 的浮点运算次数除以从慢存储读入的字节数, 定义和 ridge point 见 [9.1.2 GPU 内存层次与 Roofline](../../9.1.2-GPU内存层次与Roofline/9.1.2-GPU内存层次与Roofline.md). 一个 SwiGLU 专家有三个 $d\times H$ 的矩阵, 一步分到 $t$ 个 token 时计算约 $2t\cdot3dH$ 次浮点运算, 权重读入约 $3dH\cdot b$ 字节 ($b$ 是每个权重的字节数). 激活的读写相对权重可以忽略时,

$$
I\approx\frac{2t\cdot3dH}{3dH\cdot b}=\frac{2t}{b} \tag{1}
$$

BF16 下 $b=2$, $I\approx t$ FLOP/Byte. H100 FP16 稠密计算的 ridge point 约 295 FLOP/Byte, 也就是一个专家一步要分到约 300 个 token 才能离开带宽墙. decode 阶段远达不到: DeepSeek-V3 的 256 个路由专家选 8 个, batch 64 时平均每个专家分到 $64\times8/256=2$ 个 token; Mixtral 的 8 个专家选 2 个, 同样 batch 64 时每个专家 16 个 token. 两者都比 ridge point 低一到两个数量级.

Duplex 用 Op/B (每字节运算数) 衡量同一件事, 并实测了 GPU 上的后果: continuous batching 下 MoE 层的 Op/B 至少为 1, 随共享同一专家的请求数波动; decode 时 GPU 在 MoE 层的计算利用率不到 11%. 注意力层的情况类似: GQA 中每个 KV 元素读入一次, 被组内 $g$ 个 query 头各用一次, 每次 2 次浮点运算, BF16 下 $I=2g/2=g$, 常见的 $g$ 为 4 到 8. 式 (1) 也说明了降低权重位宽的作用: $b$ 从 2 降到 0.5 (4 bit), 同样的 $t$ 下运算强度提高 4 倍. 本篇各类设计的共同方向由此而来: 要么少搬权重 (剪枝, 压缩, 只搬会用到的专家), 要么把计算挪到权重旁边.

### 1.3 搬权重还是搬激活

专家权重放不进 GPU 显存时, 常规做法是卸载到主机内存, 用到时经 PCIe 搬到 GPU. 这样搬的是权重, 代价与专家大小成正比. 另一种做法是把激活送到存权重的地方就地计算, 搬的是 token. MoNDE 把这两种方式称为参数移动 (PMove) 和激活移动 (AMove). 对一个 SwiGLU 专家, 权重字节数为 $3dH\cdot b$; $t$ 个 token 的输入和输出激活共 $2td\cdot b_a$ 字节 ($b_a$ 是激活的字节数). 两者之比

$$
\frac{\text{PMove}}{\text{AMove}}=\frac{3dH\,b}{2td\,b_a}=\frac{3H}{2t}\cdot\frac{b}{b_a} \tag{2}
$$

与 $d$ 无关. 以 Mixtral 为例, $H=14336$, 权重和激活都是 BF16 时比值为 $21504/t$: 一个专家 352 MB, 一个 token 的输入加输出激活只有 16 KB, 要两万多个 token 路由到同一个专家, 搬激活才和搬权重一样多.

再看时间. PCIe Gen4 ×16 单向约 32 GB/s, 搬一个 Mixtral 专家约 11 ms; 同样 352 MB 从 H100 的 HBM (3.35 TB/s) 读一遍约 0.1 ms. 两者差两个数量级, 所以卸载推理里 PCIe 是瓶颈, 除非搬运能完全藏进上一层的计算. 按最坏情况估算一次 batch 1 的 decode: Mixtral 每层激活 2 个专家, 若都不在显存里, 每层要搬约 704 MB, 约 22 ms; 32 层累计约 0.7 s 才生成一个 token. 实际系统会让一部分专家常驻显存并利用相邻 token 的专家复用, 但只要命中不了, 每次未命中的代价就是十毫秒量级.

换成 DeepSeek-V3 的细粒度专家, 单个专家只有 88 MB, 式 (2) 的比值为 $3072/t$, 搬一个专家约 2.75 ms. 专家变小降低了单次搬运的代价, 但每层激活 8 个专家, 未命中的次数更多; 而冷门专家一步只分到个位数的 token, 搬激活与搬权重之比仍在几百倍以上. 细粒度专家没有改变式 (2) 的结论, 只是把权衡从「少数大专家」变成「很多小专家」. 式 (2) 给出的选择很直接: 某个专家这一步分到的 token 少, 就搬激活到存储侧计算; 分到的 token 多, 存储侧的弱计算单元算不过来, 再搬权重到 GPU. 第 3 节的 MoNDE, Fiddler 和 Duplex 都是这个选择在不同硬件上的实现.

## 2. FPGA 加速器

### 2.1 Edge-MoE: 逐专家重排

Edge-MoE (Sarkar et al., arXiv:[2305.18691](https://arxiv.org/abs/2305.18691)) 面向多任务视觉 Transformer M³ViT, 其中专家按任务稀疏激活, 每个 MoE 层有 16 个专家, 全部权重放不进 FPGA 的片上 BRAM. 如果逐 token 计算, 相邻 token 选的专家不同, 每个 token 都可能要重新从片外读一遍专家权重. Edge-MoE 改为逐专家计算: 每个专家维护一个 token 队列, 路由结果把 token 放进对应队列, 再用一个元队列记录哪些专家这一步有 token, 计算时按专家依次加载权重, 处理完它队列里的所有 token, 跳过没有 token 的专家. 每个专家的权重一步只读一次.

论文在 ZCU102 (300 MHz) 上做了逐项消融. 基线 650.3 ms, 加入专家重排后 433.4 ms (1.50 倍); 换成单遍 Softmax 近似后 353.4 ms (1.84 倍); 换成低成本 GELU 近似后 212.9 ms (3.05 倍), 原来的 Softmax 和 GELU 可能用掉一半以上的 LUT; 几乎所有线性层共用一个统一计算单元后 104.3 ms (6.23 倍); 再对注意力的 $QK^{\top}$ 和 $M'V$ 两步做重排, 让带宽需求与并行度无关, 最终 34.6 ms (18.77 倍). 专家重排只贡献了第一步的 1.5 倍, 其余收益来自非线性函数近似, 计算单元共享和注意力重排.

与通用处理器比, CPU 每帧 169.72 ms, 14.53 W, 2.466 J; A6000 GPU 为 13.73 ms, 82.24 W, 1.129 J; Edge-MoE 为 34.64 ms, 14.54 W, 0.504 J. GPU 的延迟更低, 但每帧能耗是 Edge-MoE 的 2.24 倍, CPU 是 4.90 倍. 输入为 128×256 的 Cityscapes 图像, 按 16×16 切 patch, 约 30 FPS. 这组数字说明了边缘场景的取舍: 功耗受限时比的是每帧焦耳数, 不是延迟.

### 2.2 UbiMoE: 两套核与参数搜索

UbiMoE (Dong et al., arXiv:[2502.05602](https://arxiv.org/abs/2502.05602)) 同样面向视觉 Transformer 上的 MoE, 思路是注意力和专家用不同的核. 注意力用延迟优化的流式核: 不同的 query 分给 $N_a$ 个处理单元, 同一个 key 广播给它们, key 只读一次; Softmax 融合进流水, 动态维护最大值, 中间结果不写回片外. 线性层 (包括专家) 用一个可复用的核, 在稠密层和专家之间切换. 两套核的并行度怎样分配, 用两阶段启发式搜索按 FPGA 的资源约束 (DSP, BRAM, LUT) 求解.

在有 HBM 的 Alveo U280 上, 布局也照顾到了专家: MoE 模块放在靠近 HBM 的 SLR0 上, 专家权重分散在多个 HBM 通道里, 不同专家可以并行读取. 相对此前最好的 FPGA 设计, UbiMoE 在 ZCU102 和 U280 上吞吐分别提高 1.34 倍和 3.35 倍, 能效分别提高 1.75 倍和 1.54 倍; U280 在 200 MHz 下能效为 7.451 GOPS/W, 对比设计为 4.83 GOPS/W. ZCU102 版本相对 GPU 基线速度为 1.77 倍, 能效为 7.85 倍. 两块板子的差别主要在片外存储: ZCU102 只有 DDR4, U280 有 HBM, UbiMoE 的参数搜索对两者给出不同的并行度配置, 同一套核在不同带宽下的最优形态并不相同.

### 2.3 FLAME: 剪枝与专家预取

FLAME (Lin et al., DAC 2024, [doi:10.1145/3649329.3656507](https://doi.org/10.1145/3649329.3656507)) 基于两点观察. 一是专家权重大, 但每个专家被访问的频率低, 适合做权重稀疏, 它对专家权重做 N:M 结构化剪枝, 减少要搬的字节. 二是各层的专家激活路径高度偏斜, 可以预测. 它的循环专家预测 (CEPR) 在路由结果确定之前, 把预测会用到的专家权重从片外预取到片上缓存; 剪枝感知的专家缓冲 (PA-BUF) 把权重稀疏和激活稀疏两种稀疏结合起来管理缓冲.

片上只放两个专家缓存时, 预测准确率为 84.4%, 相对 CPU 和 GPU 分别加速 4.12 倍和 1.49 倍. 剪枝和预取针对的是同一个量: 预取把搬运藏进前面的计算, 剪枝减少要藏的字节数, 两者叠加后, 预测错误时多搬一个专家的代价也更小. 预测不中的专家只能在路由确定后临时加载, 这部分延迟仍然在关键路径上, 第 4.1 节会和训练出来的预测器对比.

## 3. 近数据计算与存内计算

### 3.1 MoNDE: 冷门专家留在内存侧

MoNDE (Kim et al., DAC 2024, arXiv:[2405.18832](https://arxiv.org/abs/2405.18832)) 把专家参数放在带近数据处理 (NDP) 单元的 CXL 内存设备中, 稠密部分留在 GPU. 路由偏斜使少数热门专家处理大部分 token, 冷门专家一步只分到 0 到 7 个 token. 按式 (2), 冷门专家搬激活远比搬权重便宜, 所以 MoNDE 只把热门专家经 PCIe 搬到 GPU 计算, 冷门专家在设备内就地计算, GPU 只发送输入激活并取回结果. 设备参考商用 CXL 内存: LPDDR, 单芯片 16 Gb, 最高 8533 MT/s, 每个模块 32 颗芯片共 64 GB, 带宽 68 GB/s; 8 个通道共 512 GB, 约 512 GB/s. GPU 端为 A100, 经 PCIe Gen4 ×16 连接.

GPU 和设备之间怎样分配专家, MoNDE 用一个负载均衡条件. GPU 侧的时间主要是搬热门专家权重, $t_{\mathrm{PM}}\approx\mathrm{Expert}_{\mathrm{GPU}}/BW_{\mathrm{PCIe}}$; 设备侧的时间主要是读冷门专家权重, $t_{\mathrm{MD}}\approx\mathrm{Expert}_{\mathrm{MD}}/BW_{\mathrm{MD}}$. 令两者相等, 分给 GPU 的激活专家量为

$$
H=\alpha\cdot\frac{BW_{\mathrm{PCIe}}}{BW_{\mathrm{MD}}+BW_{\mathrm{PCIe}}}\cdot\mathrm{Expert}_{\mathrm{Activ}} \tag{3}
$$

$\alpha$ 是自动调节的修正系数, 吸收计算时间等未建模的部分. 按 PCIe Gen4 ×16 单向约 32 GB/s 和设备 512 GB/s 代入, 不计 $\alpha$ 时只有约 6% 的激活专家量适合搬到 GPU, 其余都应在设备内计算. 与把所有激活专家搬到 GPU 的做法 (GPU+PMove) 相比, MoNDE 在编码器 MoE 上平均加速 4.9 倍, 在解码器 MoE 上平均加速 1.5 倍.

### 3.2 Fiddler: 用 CPU 做同样的选择

Fiddler (Kamahori et al., arXiv:[2402.07033](https://arxiv.org/abs/2402.07033)) 在普通的 CPU 加 GPU 机器上做了同样的选择, 不需要新硬件. 专家权重不在显存里时, 它比较两种执行方式: 把权重从 CPU 内存搬到 GPU 再算, 或者把激活从 GPU 拷到 CPU, 在 CPU 上算完再拷回. 实测中前者的时间主要是搬权重, 与输入 token 数基本无关; 后者的时间随 token 数近似线性增长, 激活拷贝占总时间不到 1%. Fiddler 据此建立延迟模型, GPU 路径取常数, CPU 路径取与 token 数成正比, 常数在初始化时测得, 每个专家按这一步分到的 token 数选择更快的路径.

这个延迟模型就是式 (2) 的时间版本: token 少时 CPU 路径快, token 多时 GPU 路径快, 分界点由 PCIe 带宽和 CPU 算力决定. 相对不同的基线, Fiddler 在单 batch 推理上加速 1.26 倍, 长 prefill 上 1.30 倍, beam search 上 11.57 倍. 这些基线各自只针对单 batch 或长 prefill 中的一种场景做了优化, Fiddler 按 token 数逐专家选路径, 在三种场景下都不比它们差. MoNDE 和 Fiddler 的差别在存储侧的计算能力: CXL 设备里的 NDP 单元贴着 512 GB/s 的内存, CPU 通过 DDR 通道读内存, 带宽更低, 但不需要专门硬件.

### 3.3 Duplex: Logic-PIM 与协同处理

Duplex (Yun et al., arXiv:[2409.01141](https://arxiv.org/abs/2409.01141)) 从第 1.2 节的 Op/B 出发. 传统的存内计算 (PIM) 把计算单元放在 DRAM die 里, 只适合 Op/B 低于 1 的运算; 而 MoE 层的 Op/B 至少为 1, GQA 注意力为 4 到 8, 落在 GPU 和传统 PIM 之间的空档. Duplex 提出 Logic-PIM: 在 HBM3 堆叠的 logic die 上放更强的计算单元, 并增加 TSV 提高 die 间带宽 (论文按 22 μm 间距的工艺趋势估算), 面向 Op/B 在 1 到 32 之间的运算.

这个区间的选取与 continuous batching 有关. 请求随时加入和退出, 同一个专家这一步分到的 token 数在 1 到几十之间变化, MoE 层的 Op/B 随之波动; 注意力层的 Op/B 由 GQA 的组大小决定, 比较稳定. Duplex 实测 decode 时 GPU 在注意力上的计算利用率只有 2.06%, 在 MoE 层不到 11%, 两类层都落在 GPU 的带宽墙之下. 传统 PIM 的算力只够 Op/B 低于 1 的运算, 接不住这个区间; logic die 用逻辑工艺制造, 能放比 DRAM die 内更强的计算单元, 再配合更多 TSV 提供的带宽, 才能覆盖几十 FLOP/Byte 的区间.

一个 Duplex 设备组合了面向高 Op/B 的 xPU 和 Logic-PIM, 按每层的 Op/B 选择处理器. 专家协同处理: 分到很多 token 的专家交给 xPU, 其余交给 Logic-PIM; 注意力也做类似的协同. 为了让协同处理有效, Duplex 对专家用张量并行而不用专家并行, 因为专家并行下每张卡只有部分专家, 能在本卡内分给两种处理器的专家变少. 反过来, 如果负载完全均衡, 每个专家分到的 token 数接近, 协同处理的收益也会缩小. 相对 GPU 系统, 推理吞吐最高提高 2.67 倍, 延迟最多降低 2.57 倍, 能耗降低 42.03%.

### 3.4 PIMoE: NPU 与 PIM 的任务卸载

PIMoE (Wu et al., DAC 2025, [doi:10.1109/DAC63849.2025.11132528](https://doi.org/10.1109/DAC63849.2025.11132528)) 组合 NPU 与 PIM, 处理两个问题. 一是负载: PIM 的计算能力有限, 任务分多了会成为瓶颈, 它用节流感知的任务卸载在 NPU 与 PIM 之间分配专家计算, 保持两侧负载平衡. 二是数据布局: NPU 和 PIM 对稀疏数据的布局要求不一致, 它在内存控制器旁放一个数据压缩单元 (data condenser), 在两者之间转换布局, 提高传输效率.

相对 A100, PIMoE 加速 4.5 倍, 能效提高 13.7 倍; 相对已有的 MoE 专用平台加速 1.4 倍. 和 Duplex 相比, 两者都按运算强度在强计算单元和存储侧计算单元之间分工, 差别在 PIM 的位置: Duplex 放在 HBM 的 logic die 上, 适合 Op/B 稍高的运算; PIMoE 面向 NPU 系统, 额外处理了稀疏布局的转换开销.

## 4. 专家预测与适用条件

### 4.1 预测专家: 统计规律还是训练出来

只加载会用到的专家, 前提是在用到之前知道是哪几个. FLAME 的 CEPR 依据运行时观察到的激活路径偏斜做预测, 不改模型, 准确率受输入分布影响, 两个专家缓存下为 84.4%. Pre-gated MoE (Hwang et al., ISCA 2024, arXiv:[2308.12066](https://arxiv.org/abs/2308.12066)) 换成在模型里训练一个预测器: 第 $N$ 个 MoE 块的门控 (pre-gate) 不选本块的专家, 而选第 $N+1$ 块的专家. 第一个 MoE 块没有前一块替它选择, 所以有两个门控; 最终一块不需要门控. 这样下一块的专家在本块计算时就已确定, 权重搬运可以和本块计算重叠, 不存在预测错误.

代价在模型侧: pre-gate 要用本块的隐状态替下一块做选择, 和原来的门控职责不同, 需要在微调阶段训练, 预训练不变. 论文报告微调相同步数后精度没有明显下降; 专家权重卸载到 CPU 内存时, 端到端延迟只比全部参数放在 GPU 的理想方案高 23%, 峰值显存降低 4.2 倍. 两种预测各有适用面: CEPR 适合不能改模型的部署, Pre-gated MoE 适合能控制微调流程的场景; 前者要为预测错误留出缓冲和临时加载的余量, 后者把这部分成本转移到训练.

### 4.2 设计对照

| 工作 | 平台 | 处理瓶颈的方式 | 成立的前提 |
|---|---|---|---|
| Edge-MoE | FPGA (ZCU102) | 逐专家重排, 近似 Softmax 与 GELU, 统一线性单元 | 专家多于片上容量, 功耗受限 |
| UbiMoE | FPGA (ZCU102, U280) | 流式注意力核加可复用线性核, 按资源搜参数 | 两类层的计算模式可以分开优化 |
| FLAME | FPGA | N:M 剪枝, CEPR 预取, PA-BUF | 专家激活偏斜, 可以预测 |
| MoNDE / Fiddler | GPU 加 CXL-NDP / CPU | 冷门专家搬激活, 热门专家搬权重 | 冷门专家多, 激活远小于权重 |
| Duplex / PIMoE | xPU 加 Logic-PIM / NPU 加 PIM | 按运算强度在两种处理器间分工 | 不同专家, 不同层的运算强度差别大 |

最终一列是这张表要看的地方. 这些设计都没有改路由函数 (Pre-gated MoE 改的是门控的选择对象, 不改专家数和 Top-$k$), 它们依赖的是 MoE 在某种场景下的统计规律: 专家激活偏斜, 激活可以预测, 不同专家和不同层的运算强度不同. 规律成立时收益明显; 规律不成立时, 例如路由在不同输入间很分散, 预测命中率下降, 预取就变成多搬一次.

三类平台的分工也可以从式 (1) 和式 (2) 读出来. FPGA 方案处理的是片上容量不够时怎样减少重复读取 (逐专家重排, 剪枝, 预取), 运算强度没有变, 只是读得更少; 近数据计算按式 (2) 在搬权重和搬激活之间选择, 回避了 PCIe; 存内计算把式 (1) 的分母变成存储内部的带宽, 让低运算强度的专家在带宽更高的地方计算. 三者可以和权重量化叠加, 量化降低式 (1) 和式 (2) 里的 $b$.

### 4.3 失效条件

第一个失效条件是 batch 变大. 每个专家分到的 token 数 $t$ 随 batch 线性增长, 接近 ridge point 时专家计算回到算力受限, 放在存储旁边的弱计算单元反而成了瓶颈. 这就是 Duplex 和 MoNDE 都保留强计算单元的原因: 分到 token 多的专家, 以及 prefill 阶段的计算, 仍然交给 GPU 或 xPU. 同理, 式 (2) 的比值随 $t$ 下降, prefill 时上千个 token 进同一个专家, 搬激活的优势就不存在了, MoNDE 在解码器 MoE 上的加速 (1.5 倍) 比编码器 (4.9 倍) 小, 与此方向一致.

权重量化会移动这些分界点. 专家权重从 BF16 降到 4 bit, 式 (1) 的运算强度提高 4 倍, 离开带宽墙所需的 token 数从约 300 降到约 75; 式 (2) 的分界点从 Mixtral 的约 21500 个 token 降到约 5400 个. decode 时每个专家分到的 token 数仍远低于这两个值, 所以量化之后专家计算依然受带宽限制, 近数据计算的前提依然成立, 只是每次搬运的字节少了. 反过来, 若在 GPU 上已经把专家量化到 4 bit 而存储侧的计算单元只支持 BF16, 存储侧的带宽优势会被抵消一部分, 两侧的数值格式需要一起设计.

第二个失效条件是负载过于均衡或过于分散. 协同处理和冷热分离都依赖专家间 token 数的差异, 训练时负载均衡做得越好, 热门和冷门专家的区分越弱, Duplex 论文也指出完全均衡时协同收益会缩小. 第三个是从视觉模型外推到 LLM: Edge-MoE 和 UbiMoE 的专家数为十几个, 输入是固定数量的 patch, 而 LLM 每层的路由专家数从 8 个到近千个, decode 时 token 数由 batch 决定, 冷热分布和预测准确率都不能直接搬用. 这些原型给出的是瓶颈分析和设计方向, 不是 LLM 推理的加速比.

**参考文献**

1. Sarkar, R., Liang, H., Fan, Z., Wang, Z., & Hao, C. (2023). [Edge-MoE: Memory-Efficient Multi-Task Vision Transformer Architecture with Task-level Sparsity via Mixture-of-Experts](https://arxiv.org/abs/2305.18691).
2. Dong, J., et al. (2025). [UbiMoE: A Ubiquitous Mixture-of-Experts Vision Transformer Accelerator With Hybrid Computation Pattern on FPGA](https://arxiv.org/abs/2502.05602).
3. Lin, X., et al. (2024). FLAME: Fully Leveraging MoE Sparsity for Transformer on FPGA. DAC 2024. [doi:10.1145/3649329.3656507](https://doi.org/10.1145/3649329.3656507).
4. Kim, T., et al. (2024). [MoNDE: Mixture of Near-Data Experts for Large-Scale Sparse Models](https://arxiv.org/abs/2405.18832). DAC 2024.
5. Kamahori, K., Tang, T., Gu, Y., Zhu, K., & Kasikci, B. (2024). [Fiddler: CPU-GPU Orchestration for Fast Inference of Mixture-of-Experts Models](https://arxiv.org/abs/2402.07033).
6. Yun, S., et al. (2024). [Duplex: A Device for Large Language Models with Mixture of Experts, Grouped Query Attention, and Continuous Batching](https://arxiv.org/abs/2409.01141).
7. Wu, L., et al. (2025). PIMoE: Towards Efficient MoE Transformer Deployment on NPU-PIM System through Throttle-Aware Task Offloading. DAC 2025. [doi:10.1109/DAC63849.2025.11132528](https://doi.org/10.1109/DAC63849.2025.11132528).
8. Hwang, R., et al. (2024). [Pre-gated MoE: An Algorithm-System Co-Design for Fast and Scalable Mixture-of-Expert Inference](https://arxiv.org/abs/2308.12066). ISCA 2024.
9. NVIDIA. [H100 Tensor Core GPU](https://www.nvidia.com/en-us/data-center/h100/). H100 SXM 显存带宽 3.35 TB/s.
