# content 缺失配图清单

正文曾引用、但仓库与本机原始仓库里都找不到原件的图。引用已从正文移除，图注与生成提示词记在这里；重绘时按 `.cursor/skills/academic-diagrams` 出图，放回原路径后把引用加回原文。

## `content/classic-papers/ilya-30/03-a-tutorial-introduction-to-the-minimum-description-length-principle.md`

- 原第 62 行 `images/01_three_sequences.png`：三条序列的压缩结果

## `content/classic-papers/ilya-30/09-multi-scale-context-aggregation-by-dilated-convolutions.md`

- 原第 76 行 `images/03_dilated_kernel.png`：空洞卷积采样模式
- 原第 141 行 `images/09_voc_results.png`：VOC 2012 实验结果

## `content/classic-papers/ilya-30/12-understanding-lstm-networks.md`

- 原第 48 行 `images/00_abstract.png`：LSTM 链条与传送带
- 原第 57 行 `images/01_rnn_loop_unrolled.png`：RNN 的环与展开
- 原第 66 行 `images/02_longterm_dependency.png`：两种依赖距离
- 原第 88 行 `images/04_notation_legend.png`：Olah 的统一图例
- 原第 97 行 `images/05_cell_state_conveyor.png`：cell state 传送带
- 原第 116 行 `images/06_forget_gate.png`：遗忘门
- 原第 148 行 `images/08_cell_update.png`：cell state 更新
- 原第 165 行 `images/09_output_gate.png`：输出门
- 原第 188 行 `images/10_variants.png`：三种变体对比

## `content/classic-papers/ilya-30/21-neural-message-passing-for-quantum-chemistry.md`

- 原第 51 行 `images/01_dft_cost.png`：DFT 成本与 MPNN 加速
- 原第 71 行 `images/03_eight_models.png`：战国时代的八个模型
- 原第 101 行 `images/04_mpnn_three_parts.png`：MPNN 三要素
- 原第 122 行 `images/05_unification_table.png`：统一对照表
- 原第 156 行 `images/08_qm9_results.png`：QM9 主表
- 原第 170 行 `images/10_limitations.png`：消息传递的盲区

## `content/classic-papers/ilya-30/24-gpipe-easy-scaling-with-micro-batch-pipeline-parallelism.md`

- 原第 42 行 `images/01_memory_wall.png`：显存墙的四本账
- 原第 56 行 `images/02_naive_model_parallel.png`：naive 模型并行的设备空转
- 原第 85 行 `images/03_pipeline_microbatch.png`：micro-batch 流水线时序图
- 原第 97 行 `images/04_bubble_math.png`：气泡开销与 M 的关系
- 原第 117 行 `images/05_rematerialization.png`：重计算的显存账
- 原第 143 行 `images/07_amoebanet_scaling.png`：AmoebaNet 的扩展阶梯
- 原第 151 行 `images/08_imagenet_transfer.png`：ImageNet 与迁移学习结果
- 原第 164 行 `images/09_multilingual_mt.png`：103 语言的翻译质量曲线
- 原第 178 行 `images/10_throughput_table.png`：归一化吞吐与 M, K 的关系

## `content/classic-papers/ilya-30/26-scaling-laws-for-neural-language-models.md`

- 原第 43 行 `images/00_abstract.png`：摘要: 三条幂律曲线
- 原第 57 行 `images/02_experiment_setup.png`：实验设置全景
- 原第 87 行 `images/03_three_power_laws.png`：三条幂律的指数
- 原第 101 行 `images/04_shape_independence.png`：形状无关性的证据
- 原第 125 行 `images/06_overfitting_equation.png`：过拟合的普适方程
- 原第 153 行 `images/07_bcrit.png`：临界 batch size 与损失的关系
- 原第 173 行 `images/08_compute_optimal.png`：计算预算的最优分配
- 原第 177 行 `images/09_stop_before_convergence.png`：停在收敛之前
- 原第 240 行 `images/11_series_map.png`：规模主题在清单中的收束

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1-深度学习基础组件.md`

- 原第 45 行 `images/redrawn-fig-perceptron-boundary.png`：感知机分类决策边界
  - 图注：图 1:二维感知机把平面一分为二.$\mathbf{w}$ 垂直于 $w^T x + b = 0$,$b$ 是原点到边界的偏移.
- 原第 935 行 `images/redrawn-fig-vector-rotation.png`：二维平面上向量旋转与维度衰减示意图
  - 图注：图 2:把一对维度看成平面向量,按位置转过 $\theta$;高频维转得快,低频维转得慢.

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU.md`

- 原第 37 行 `./images/fig-situ-glu-vs-swiglu.png`：SwiGLU 无界乘积 vs SiTU-GLU 有上界
  - 图注：图 1：左，SwiGLU 两支路都可以一直涨。右，每支路先 $\beta\tanh(x/\beta)$，乘积被压在 $\beta_1\beta_2$。图是示意，不是从论文描点。
  - 提示词：prompt: Schematic SwiGLU unbounded product vs SiTU-GLU tanh-capped branches approaching beta1*beta2. White academic background, no watermark, no logo, no copyright text, no stock-photo banner, no website URL.

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md`

- 原第 89 行 `./images/fig-situ-glu-vs-swiglu.png`：SwiGLU 无界乘积 vs SiTU-GLU 有上界
  - 图注：图 1：左，SwiGLU 两支路都可以一直涨。右，每支路先 $\beta\tanh(x/\beta)$，乘积被压在 $\beta_1\beta_2$。图是示意，**不是**从报告 Fig. 4 描点（Fig. 4 另有 $x\in[-10,100]$ 的坐标轴与原点插图）。
- 原第 184 行 `./images/fig-situ-glu-latentmoe-slot.png`：SiTU-GLU 插在 LatentMoE：先降到 ℓ，门控 FFN，再升回 d
  - 图注：图 2：一条 K3 层的 FFN 槽：上支共享专家满宽；下支 $d\to\ell\to$ Top-16/896 $\to$ SiTU-GLU $\to$ 加权和 $\to$ RMSNorm $\to d$。红框：$\ell\neq c^{KV}$。不是论文插图。
- 原第 211 行 `./images/fig-situ-glu-not-neighbors.png`：SiTU 不是 PowLU、不是 V4 硬 clamp、不是 G1 / Gated Residual
  - 图注：图 3：四张卡片只钉处方差，**没有假坐标曲线**。底栏：100 是坐标 $\ell_\infty$ 界，不是平均激活，不是梯度裁剪阈值。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/02-激活函数谱系-从饱和到软门/02-激活函数谱系-从饱和到软门.md`

- 原第 131 行 `./images/fig-act-sigmoid-relu-gelu-silu.png`
  - 图注：图 1：饱和 → 硬折 → 软门的四条示意曲线（不是论文描点）。左一 Sigmoid / Tanh 两端贴平；左二 ReLU 在原点折断、负轴恒零；右二 GELU 按 $\Phi(x)$ 软加权；右一 SiLU $=x\sigma(x)$，仍是单路。门控 FFN 见 [03](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md)。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md`

- 原第 90 行 `./images/fig-glu-family-two-vs-three-matrix.png`
  - 图注：图 1：两矩阵 FFN（左）与三矩阵 GLU（右）。示意，不是 Shazeer 论文插图。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md`

- 原第 62 行 `./images/fig-powlu-vs-swiglu-growth.png`：SwiGLU 正半轴趋近二次 vs PowLU 趋近线性
  - 图注：图 1：左：标量 SwiGLU 大正输入 $\approx x^{2}$。右：PowLU（$m=3$）趋近线性 $x$，曲线不压成水平帽。坐标无刻度，**不是**论文 Figure 1 的描点（论文 Fig. 1 还画了一阶导）。
- 原第 87 行 `./images/fig-powlu-in-ling-block.png`：PowLU 插在 Ling 块的专家 FFN，不插在注意力
  - 图注：图 2：一层 Ling 块里，GQA / QKNorm / Partial RoPE 走注意力残差；PowLU 只替换专家（含共享专家）升维与降维之间的非线性。不是论文插图。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/2.1.1-前馈网络FFN与激活函数.md`

- 原第 60 行 `./images/image_5.png`
  - 图注：图 6：标准 FFN 的数据流. 输入表示先从模型维度 $d$ 升到中间维度 $d_{ff}$，经过非线性筛选后，再压回 $d$，并且这一过程对每个 token 独立重复执行.
- 原第 104 行 `./images/fig-ffn-gated-updown.png`：FFN 升维、门控、降维
  - 图注：图 1：标准 FFN 单路 GELU；SwiGLU 先升到 $m\approx 8d/3$，SiLU 门与 value 支路逐元素乘，再压回 $d$。
- 原第 126 行 `./images/image_6.png`
  - 图注：图 7：FFN 的几何直觉. 升维先把纠缠特征拉开，激活函数再对这些方向做折叠、截断或门控选择，从而形成更强的可分离表示.
- 原第 146 行 `./images/fig-brain-vs-transformer.png`：Attention 调度 vs FFN 内化
  - 图注：图 2：左是全连接隐喻（注意力把远处连过来）；右是 Transformer 块里 FFN 的升维–降维夹在两段 Add & Norm 之间。
- 原第 197 行 `./images/image_7.png`
  - 图注：图 11：训练视角下的 FFN. 前向传播决定特征怎样被放大或抑制，反向传播决定梯度如何穿过激活与门控结构，而训练诊断通常就围绕这些关键节点展开.
- 原第 223 行 `./images/image_8.png`
  - 图注：图 12：MoE 为什么通常长在 FFN 上. 注意力结构保持共享，容量扩展主要发生在 FFN 专家池中，这样更符合「高容量变换器」的角色分工，也更容易获得稀疏计算收益.

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-激活函数/01-SiTU-GLU/01-SiTU-GLU.md`

- 原第 242 行 `./images/redrawn-fig-situ-glu-core-v2.png`：SiTU-GLU 专家内部双支路：同一门预激活分叉到 softcap 与 sigmoid，值支路 softcap 后与门因子逐元素相乘
  - 图注：图 2: SiTU-GLU 位于路由专家的 Gated FFN 内部。图只展开专家内部的门支路、值支路、softcap、sigmoid、逐元素乘积和输出投影；共享专家、路由聚合与 RMSNorm 见本节公式 (8)–(10)。
- 原第 272 行 `./images/redrawn-fig-situ-glu-method-boundaries-v2.png`：SiTU-GLU 与相近方法的机制与边界：作用对象、是否有界、作用位置和证据范围
  - 图注：图 3: SwiGLU、SiTU-GLU、PowLU、硬截断与梯度裁剪分别作用于不同对象。表格只列公式与已知性质，不把整体模型指标归因于任何单一机制。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-激活函数/02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md`

- 原第 89 行 `./images/redrawn-fig-glu-family-two-vs-three-matrix-v2.png`：两矩阵 FFN 与三矩阵 GLU：单路与双支路的真实数据流、逐元素乘法和保参宽度
  - 图注：图 1: 左侧是两矩阵单路 FFN；右侧是三矩阵 GLU。输入 $x$ 分别经 $W$ 和 $V$ 得到同宽门和值分支，门分支激活后与值分支逐元素相乘，再经 $W_2$ 降维。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-激活函数/03-PowLU-Ling对SwiGLU的稳定化改写/03-PowLU-Ling对SwiGLU的稳定化改写.md`

- 原第 114 行 `./images/redrawn-fig-powlu-asymptotic-properties-v2.png`：SwiGLU 与 PowLU 的正半轴大输入渐近性质：标量对照下前者趋近二次，后者趋近线性但仍无界
  - 图注：图 1: 在标量对照 $x_1=x_2=x$ 下，SwiGLU 的门因子趋近 $x$，乘积渐近 $x^2$；PowLU 的正半轴门函数趋近 1，乘积渐近 $x$。两者均无界。
- 原第 162 行 `./images/redrawn-fig-powlu-expert-ffn-v3.png`：PowLU 在专家 FFN 内的计算位置：两条升维支路、PowLU 门函数、逐元素乘法与下投影
  - 图注：图 2: 列向量约定下，输入 $x$ 经 $W_{\mathrm{up}}$ 与 $W_{\mathrm{gate}}$ 形成同宽值支路 $v$ 和门支路 $g$；PowLU 只替换门函数 $f(g)$，两支路逐元素相乘后由 $W_{\mathrm{down}}$ 降维。
- 原第 207 行 `./images/redrawn-fig-powlu-activation-measurement-v3.png`：专家激活动态范围的统计结构与比较条件：前向/反向分别记录 Min/Max、分位数范围与中位数
  - 图注：图 3: 用统计结构表说明如何读取专家激活动态范围。前向激活与反向梯度分别记录 Min/Max、P1/P99、P25/P75 与 Median；SwiGLU 与 PowLU 的比较须对齐训练步、专家线性层、精度和采样条件。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-激活函数/2.1.1-激活函数.md`

- 原第 150 行 `./images/redrawn-fig-activation-behavior-v2.png`：常见激活函数的行为对照：饱和、硬阈值、软门、精确零激活和单路/双支路边界
  - 图注：图 1: 五张行为卡对照饱和、硬阈值与软门的函数性质。它们不代替精确函数曲线或实现测试；Sigmoid/Tanh 的饱和、ReLU 的精确零激活，以及 GELU/SiLU 的单路软门关系见正文公式。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.2-归一化层/2.1.2-归一化层.md`

- 原第 36 行 `./images/redrawn-fig-ln-training-signal-v2.png`：归一化在训练信号中的局部作用：逐 token 统计和仿射变换进入子层与损失计算，参数更新由梯度信号驱动
  - 图注：图 1: 归一化直接变换中间表示的均值和尺度，并通过后续子层参与 loss 与梯度更新。图为单个训练步骤的机制示意，不表示任何模型的实测损失曲面。
- 原第 113 行 `./images/redrawn-image_3-v2.png`：Temporal BatchNorm 与 LayerNorm 的统计组：BN 在固定特征上聚合 batch 和序列位置，LN 只聚合同一 token 的最后特征维
  - 图注：图 2: 以逻辑 shape $[B,S,d]$ 示意。Temporal BatchNorm 在固定特征维上聚合 $B\times S$ 个单元；LayerNorm 对固定 $(b,s)$ 的 token 沿 $d$ 聚合。
- 原第 150 行 `./images/redrawn-image_4-v3.png`：LayerNorm 与 RMSNorm 的完整计算路径：中心化、缩放分母、epsilon 与可学习仿射参数均连接到真实消费者
  - 图注：图 3: 对单个 token 向量，LayerNorm 先计算均值并中心化，再计算缩放分母；RMSNorm 直接由输入计算均方根分母。两图的每个除法节点都显示分子、分母与仿射参数来源。
- 原第 180 行 `./images/redrawn-fig-preln-vs-postln-v2.png`：Post-LN 与 Pre-LN 单子层前向：原输入沿恒等捷径进入加法点，LayerNorm 分别位于加法后与子层前
  - 图注：图 4: Post-LN 对相加结果归一化，Pre-LN 只对子层输入归一化。两列均为单子层前向，采用等维恒等捷径；图中省略 dropout 与堆叠末端的最终归一化。残差展开见 [2.1.3](../2.1.3-残差连接/2.1.3-残差连接.md)。
- 原第 224 行 `./images/redrawn-fig-norm-diagnostics-v4.png`：归一化层诊断：记录输入、统计量、修正与输出，并在固定比较条件下检查精度和量化输出差异
  - 图注：图 5: 在同一输入位置记录 $x$、归一化统计量、$\Delta=F(\mathrm{Norm}(x))$ 与 $y=x+\Delta$。所有结果栏为待测，指标用于定位，不能单独证明因果。
- 原第 269 行 `./images/redrawn-fig-layernorm-vs-rmsnorm-v2.png`：LayerNorm 与 RMSNorm 的代码变量对应：中心化、分母标量与仿射参数均连接到真实消费者
  - 图注：图 6: 以一个长度为 $d$ 的 token 向量为例，把代码变量与计算步骤对齐。每个中间量、数值稳定项和可学习参数都连接到它实际参与的计算。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md`

- 原第 65 行 `./images/redrawn-fig-mhc-layer-slot-v3.png`：mHC 单层数据流: 读,单次子层计算,残差混合与逐流写回
  - 图注：图 1: 四条流经 $\mathcal{H}^{\mathrm{pre}}$ 收成一份输入,$\mathcal{F}$ 只计算一次;$\mathcal{H}^{\mathrm{post}}$ 生成四条更新,$\mathcal{H}^{\mathrm{res}}$ 并行生成四条残差向量,最后逐流相加.
- 原第 169 行 `./images/redrawn-fig-mhc-sinkhorn-v3.png`：mHC Sinkhorn-Knopp：先 exp，再按 column normalization、row normalization 完成一个 cycle，重复 20 次
  - 图注：图 2：每个 cycle 先执行 $C^{(t)}=T_c(M^{(t-1)})$，再执行 $M^{(t)}=T_r(C^{(t)})$。示例矩阵迭代 20 次后，最后一步保证 row sums 为 1，column sums 已收敛到 1 附近。
- 原第 181 行 `./images/redrawn-fig-mhc-stream-mix-v2.png`：Single stream、HC 与 mHC 的 residual operator：输入张量、混合矩阵、row/column gain 与输出
  - 图注：图 3：三条独立 residual operator 管道。Single stream 使用 $[1]$；HC 直接学习 full $H_{\mathrm{res}}$；mHC 先用 20 个 Sinkhorn cycles 投影，再与 $X_l$ 做矩阵乘。全图用矩阵与 gain 取代交叉连线。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/02-xHC-Expanded-Hyper-Connections.md`

- 原第 67 行 `./images/fig-xhc-dense-read-sparse-write.png`：xHC：密读全部流，稀写 k 条，MLP 后再做因果卷积增强写回
  - 图注：图 1：左列单流残差；中列 mHC 对全部 $N=4$ 做密混合；右列 xHC 从 16 条密读进 $\mathcal{F}$，只把 $k=4$ 条写回去。蓝色/橙色对应论文图注里的固定激活流 / 路由激活流。
  - 提示词：prompt: Technical educational diagram of Expanded Hyper-Connections (xHC). Three columns: Residual N=1; mHC N=4 dense; xHC N=16 k=4 dense read sparse write plus causal DWConv. White academic background, no watermark, no logo, no copyright text, no stock-photo banner, no website URL.

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md`

- 原第 77 行 `./images/redrawn-fig-xhc-expanded-streams-v2.png`：xHC Algorithm 1 的八阶段依赖：16 条流 dense read、单次子层计算、4 条 active streams 混合与写回、12 条 inactive streams 直通
  - 图注：图 1：xHC Algorithm 1 的依赖表。示例 active set 为 $\mathcal I=\{1,2,7,13\}$：两条 fixed streams 加 Top-2 routed streams；所有 16 条流参与 dense read，只有 4 条进入 residual mix 与 write，其他 12 条直接进入下一层。
- 原第 113 行 `./images/redrawn-fig-xhc-writeback-aug-v4.png`：xHC write-back：MLP 用三种因果 DWConv 与原始 out 形成四个正交写回分量，Attention 使用单分量；两路都由 H_post 与 p 写到 k 条 active streams
  - 图注：图 2：MLP lane 将 `out` 与 kernel sizes $\{4,8,12\}$ 的 causal DWConv 结果做 Modified Gram-Schmidt，形成 $K_r=4$ 的 write basis；Attention lane 取 $K_r=1$。两路都通过 $\mathcal H^{\mathrm{post}}$ 与 router weights $p$ 生成 $k=4$ 条更新。
- 原第 233 行 `./images/redrawn-fig-xhc-flash-block-v3.png`：xHC-Flash Algorithm 2 的十四阶段依赖：共享 routing/pre-mappings、Attention 稀写、精确 alpha 修正、MLP residual mix 与最终 Scatter
  - 图注：图 3：xHC-Flash Algorithm 2 的 dependency table。入口完整状态一次生成共享 router scores 与两套 sublayer-specific pre-mappings；Attention 与 MLP 复用同一个 $\mathcal I,p$，两份 dense read 都读取全部 $N$ 条流，最终 Scatter 只替换 $k$ 个 active slots。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md`

- 原第 72 行 `./images/redrawn-fig-gr-vs-mhc-hres-v3.png`：mHC 与 Gated Residual 的 dependency tables：read、single F、write、residual base 与 stream communication
  - 图注：图 1：mHC 与 GR 都只计算一次子层 $F$。mHC 将 $X$ 同时送入 read 与 $H_{\mathrm{res}}$ residual mix，最后合并 $R+U$；GR 从 $\tilde R$ 预测逐元素 read gates 与标量 write gates，并以原始 $R$ 为 residual base 写成 $R'=R+s y^T$。
- 原第 166 行 `./images/redrawn-fig-gated-residual-v3.png`：Gated Residual 完整数据流：原始四分支 residual bypass、per-branch RMSNorm、read/write gates、单次子层和三输入写回
  - 图注：图 2：完整 GR 数据流。原始 $R$ 一路 bypass 到最终 write，另一路经 per-branch RMSNorm 得到 $\tilde R$；read gates 生成 $G$，write gates 生成 $s$，唯一的 $y=F(x)$ 与 $R,s$ 在一个三输入写回节点汇合。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/2.1.3-残差连接.md`

- 原第 59 行 `./images/redrawn-fig-residual-direct-vs-skip-v2.png`：直接映射与等维恒等残差对照：原输入和残差变换分别进入同一加法点
  - 图注：图 1: 直接映射计算 $y=H(x)$；恒等残差计算 $y=x+F(x)$。图示输入、分支输出和最终输出同形状，加法后没有额外变换。
- 原第 100 行 `./images/redrawn-fig-residual-backbone-v3.png`：三个连续 Pre-Norm 子层：每层当前状态分别进入归一化分支和恒等捷径，再相加得到下一状态
  - 图注：图 2: 三个连续 Pre-Norm 子层的残差展开.每个 $x_l$ 沿恒等主干进入加法点,同时经 $\mathrm{Norm}\to F_l$ 产生 $\Delta_l$,因此深层状态是初始表示与历层修正的累加和.
- 原第 157 行 `./images/redrawn-fig-residual-diagnostics-v3.png`：残差诊断：按样本和 token 记录输入、修正与输出，比较幅值、方向、精度和输出量化误差
  - 图注：图 3: 在同一 Pre-Norm 子层记录 $x_l,\Delta_l,y_l$，其中 $y_l=x_{l+1}=x_l+\Delta_l$。指标按相同样本和 token 对齐，沿最后特征维计算；结果栏均为待测。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/01-RoPE本体-旋转位置编码.md`

- 原第 43 行 `./images/fig-rope-2d-rotation.png`：RoPE 最小单元：二维平面上的位置旋转
  - 图注：图 1: RoPE 的最小计算单元不是整条向量，而是每两维构成的一个二维平面旋转.
- 原第 113 行 `./images/fig-rope-relative-phase.png`：RoPE：绝对相位抵消后点积只剩相对相位差
  - 图注：图 2: RoPE 的关键不是“旋转过了”，而是点积里绝对相位被抵消，只留下相对相位差.
- 原第 149 行 `./images/fig-rope-vs-absolute-pe.png`：绝对位置编码绑定下标，RoPE 绑定相对位移
  - 图注：图 3: 绝对位置编码强调“你在第几位”，RoPE 强调“你和别人相隔多远”.

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/01-RoPE本体-旋转位置编码/01-RoPE本体-旋转位置编码.md`

- 原第 43 行 `./images/redrawn-fig-rope-2d-rotation-v3.png`：RoPE 最小单元：二维旋转、长度保持和 Query-Key 相对位移
  - 图注：图 1: RoPE 在每对相邻维度上按当前位置索引 $m$ 旋转 $m\theta_i$;相对位置不是 $m$ 本身,而是在 Query 与 Key 内积中由两个旋转角之差 $(n-m)\theta_i$ 产生.
- 原第 118 行 `./images/redrawn-fig-rope-relative-phase-v3.png`：RoPE 中 Query-Key 点积的相对相位：各自旋转后的位置项只依赖 n−m
  - 图注：图 2: Query 与 Key 分别按 $m\theta_i$,$n\theta_i$ 旋转后,位置旋转项合并为 $R((n-m)\theta_i)$.内容向量 $q_i,k_i$ 仍参与点积,因此这里说的“只剩相对位置”专指位置依赖项.
- 原第 160 行 `./images/redrawn-fig-rope-vs-absolute-pe-v2.png`：绝对位置编码随下标变化，RoPE 在 Query-Key 点积中以相对位移出现
  - 图注：图 3: 绝对位置编码使用随下标变化的位置向量；RoPE 在 Query-Key 点积中把位置依赖合并为相对位移。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md`

- 原第 84 行 `./images/redrawn-fig-rope-ntk-yarn-v3.png`：RoPE 长上下文扩展：直接外推、PI、NTK-aware 与 YaRN 分别改变位置、频谱或 attention logits 尺度
  - 图注：图 1: 四种长上下文策略改变的是位置索引,频率谱或 attention logits 尺度.图中只画变换关系,不包含性能排名或实测曲线.

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/02-RoPE扩展-长上下文、多模态与工程实现/02-RoPE扩展-长上下文、多模态与工程实现.md`

- 原第 81 行 `./images/fig-rope-ntk-yarn.png`：高频相位绕圈、NTK 调 base、YaRN 再加热、PI 压索引
  - 图注：图 1：长上下文补丁对照。不是论文损失曲线，不要把图里的圆弧当实测相位。公式以本节式 (1)–(4) 为准。

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/2.1.4-位置编码.md`

- 原第 202 行 `./images/redrawn-fig-pe-four-methods-v3.png`：绝对位置、相对 score bias、RoPE 与 ALiBi 分别在 Transformer 流程中的顺序注入位置
  - 图注：图 1:四种位置编码把"顺序"加在不同层.细节推导见 [01-RoPE 本体](./01-RoPE本体-旋转位置编码/01-RoPE本体-旋转位置编码.md).

## `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.5-前馈网络FFN/2.1.5-前馈网络FFN.md`

- 原第 61 行 `./images/redrawn-fig-ffn-residual-update-v3.png`：标准 FFN 的升维、非线性、降维与残差更新：原始输入和 FFN 更新同时进入加法点
- 原第 73 行 `./images/redrawn-fig-ffn-detector-writeback-v3.png`：标准 FFN 的单通道探测、非线性激活与写回分解：激活系数与写回方向作为独立输入汇入向量贡献
- 原第 89 行 `./images/redrawn-fig-ffn-width-budget-v3.png`：FFN 中间宽度与参数预算对齐：两矩阵基线和三矩阵 SwiGLU 的投影数量、参数量与 8d/3 条件
- 原第 135 行 `./images/redrawn-fig-ffn-gated-updown-v3.png`：标准 FFN 与 SwiGLU 的单路/双支路数据流：上投影、激活或门控、逐元素乘法和下投影
  - 图注：图 1: 标准 FFN 单路 GELU; SwiGLU 先升到 $m\approx 8d/3$, SiLU 门与值支路逐元素乘, 再压回 $d$.
- 原第 230 行 `./images/redrawn-fig-ffn-mechanism-diagnostics-moe-v3.png`：FFN、门控与稀疏 MoE 的机制与待测诊断：Dense FFN、SwiGLU、Top-k 专家与测量计划的边界
  - 图注：图 2: 从左到右统一四层概念: 标准 FFN 的升维--激活--降维与残差;Gate/Value 两支路的门控 FFN;激活稀疏率,极值分位数,门统计,梯度范数和量化误差等待测诊断点;以及 Router + Top-k 专家池的稀疏 MoE.

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2-基础注意力机制.md`

- 原第 191 行 `./images/redrawn-fig-ch22-attention-overview-v2.png`：第 2.2 章:自注意力流水线,多头家谱,KV 代价分叉
  - 图注：图 1:三块是这一章真正要记住的地图.单头计算见 [2.2.1](./2.2.1-自注意力机制/2.2.1-自注意力机制.md);头结构演化见 [2.2.2](./2.2.2-多头注意力变体/2.2.2-多头注意力变体.md).

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.1-自注意力机制/2.2.1-自注意力机制.md`

- 原第 41 行 `./images/redrawn-fig-self-attn-qkv-flow-v3.png`：单个 Query 的自注意力：Query 与全部 Key 形成分数行，经 softmax 得到权重后与独立 Value 矩阵聚合
  - 图注：图 1: 单个 Query $q_i$ 与全部 Key 矩阵 $K$ 计算缩放分数行 $s_i=q_iK^T/\sqrt{d_k}$，经 softmax 得到行向量 $\alpha_i$，再与独立 Value 矩阵 $V$ 相乘，得到 $o_i=\alpha_iV=\sum_j\alpha_{ij}v_j$。
- 原第 344 行 `./images/redrawn-fig-self-attn-row-niubi-v2.png`：单个 Query 的注意力权重：牛逼这一行的缩放分数、softmax 权重、权重和与 Value 聚合式
  - 图注：图 2: 仅展示 Query「牛逼」的一行。缩放分数 $[0.531,0.271,0.537,0.179]$ 经 softmax 后得到 $[0.287,0.222,0.289,0.202]$，四项之和为 1；输出是同一行权重对四个 Value 的加权和。
- 原第 399 行 `./images/redrawn-fig-self-attn-causal-mask-v2.png`：因果自注意力掩码：Query 行只保留过去与当前位置的 Key 列，上三角分数在 softmax 前掩蔽
  - 图注：图 3: 以 $T=4$ 的离散矩阵示意。行 $i$ 是 Query 位置，列 $j$ 是 Key 位置；仅 $j\le i$ 的下三角分数保留，$j>i$ 的上三角在 softmax 前置为 $-\infty$。

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md`

- 原第 39 行 `./images/redrawn-fig-scaled-dot-product-attention-v2.png`：Scaled Dot-Product Attention 的完整单头数据流：H 到 Q/K/V、两次双输入 MatMul、causal mask、row softmax 与输出 shape
  - 图注：图 1：Scaled Dot-Product Attention 的完整单头数据流。Q 与 K 只在 Score MatMul 汇合；mask 在 Row Softmax 前加入 logits；概率矩阵 A 与 V 只在 Value MatMul 汇合，输出 $O\in\mathbb R^{T\times d_v}$。
- 原第 173 行 `./images/redrawn-fig-multi-head-attention-v2.png`：Multi-Head Attention 的完整结构：QKV projection bundle、共享 causal mask、parallel heads、Concat、W^O 与 residual add
  - 图注：图 2：Multi-Head Attention 的完整结构。同一个 $X$ 生成 $H$ 组 $Q_h,K_h,V_h$；所有 heads 共享同一可见性规则但独立计算 $S_h,A_h,O_h$；输出只在 Concat 汇合，再经 $W^O$ 与 residual $X$ 相加。
- 原第 308 行 `./images/redrawn-fig-mha-gqa-mqa-kv-heads-v3.png`：Decode 单 Token 时 MHA、GQA、MQA 的 Query head 到持久化 KV group 映射，以及每 token、每层的 cache 宽度
  - 图注：图 4：三种机制都保留 $H=6$ 个 Query heads；MHA、GQA、MQA 分别映射到 6、3、1 个持久化 KV groups，因此每个 token、每层的 cache 宽度依次为 $2Hd_h$、$2Gd_h$ 与 $2d_h$。
- 原第 394 行 `./images/redrawn-fig-transformer-architecture-v3.png`：经典 Encoder–Decoder Transformer 中双栈、五条残差、Cross-Attention Q/K/V 来源、因果 mask 与词表概率的完整数据流
  - 图注：图 3：经典 Encoder–Decoder Transformer 数据流。Encoder 建立可双向访问的 source memory；Decoder 先执行因果 Self-Attention，再以 decoder state 为 Q、encoder top output 为 K/V 执行 Cross-Attention，最后经 Linear 与 Softmax 得到词表概率。

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/02-MQA-共享KeyValue的极致压缩/02-MQA-共享KeyValue的极致压缩.md`

- 原第 20 行 `./images/redrawn-fig-attention-mechanism-family-v3.png`：MHA、GQA、MQA 与 MLA 的 Query 组织、显式 KV group 和缓存表示对照
  - 图注：图 1：MHA / GQA / MQA 依次减少 explicit KV groups；MQA 保留 $H$ 个 Query heads，但只缓存一组 $K,V$。MLA 改变 cached representation，保存 joint latent $c^{KV}$ 与 decoupled RoPE key $k^R$。
- 原第 33 行 `./images/redrawn-fig-mha-to-mqa-weight-pool-v2.png`：MHA checkpoint 转换为 MQA：Q/O passthrough、K/V 分别 mean-pool、组装 checkpoint 后 joint uptraining
  - 图注：图 2：MHA checkpoint 的 $W_h^K,W_h^V$ 分别按同一 matrix coordinate 在 head 维求均值；$W_h^Q$ 与 $W^O$ 原样保留。四类权重组装成一个 MQA checkpoint 后，再统一 joint uptraining。
- 原第 48 行 `./images/redrawn-fig-mqa-shared-kv-structure-v2.png`：MQA Decode 完整数据流：多 Query projections、单份 shared KV cache、每头独立 attention、Concat 与输出投影
  - 图注：图 3：一个 MQA decode step。$x_t$ 产生 $H$ 个 $q_{t,h}$ 与一组 $k_t,v_t$；新 KV 只 append 到一份 shared cache。每个 head 用自己的 Query 读取同一 $K_{\le t},V_{\le t}$，最后经 Concat 与 $W^O$ 得到 $y_t$。
- 原第 297 行 `./images/redrawn-fig-mha-gqa-mqa-kv-heads-v2.png`：Decode KV cache 的通用字节公式、MHA/GQA/MQA tensor shapes、精确数值示例与长度缩放
  - 图注：图 4：Decode KV cache 的字节账。通用公式通过 $N_{\mathrm{KV\_heads}}$ 统一 MHA、GQA、MQA；数值例使用 80 层、长度 4096、$H=64,G=8,d_h=128$、FP16，并给出长度扩展到 8192 与 32768 的线性增长。

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/03-GQA-在性能与缓存之间折中/03-GQA-在性能与缓存之间折中.md`

- 原第 16 行 `./images/gqa-group-dataflow-v2.png`：GQA 的分组映射与单头计算路径
  - 图注：图 1：$H=8,G=4$ 时的分组映射，以及 $h=1$ 的完整 attention 数据流。
- 原第 26 行 `./images/gqa-paper-tradeoff-v2.png`：GQA 论文 Table 1 的速度与质量数据
  - 图注：图 2：论文 Table 1 的原始数值。GQA-8-XXL 接近 MHA-XXL 质量，速度接近 MQA-XXL。
- 原第 189 行 `./images/gqa-uptraining-v2.png`：MHA checkpoint 转换为 GQA 并继续预训练
  - 图注：图 3：每个 KV group 只汇聚对应组内的 K 或 V projections；转换后的完整 GQA checkpoint 再进入 uptraining。
- 原第 213 行 `./images/gqa-decode-cache-v2.png`：GQA Decode 阶段的 KV Cache 写入读取与字节数
  - 图注：图 4：$H=32,G=8,d_h=128$ 时，单步 decode 的 Q/K/V 数据流、KV Cache 读写与完整字节计算。

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与矩阵吸收/04-MLA-低秩潜变量与矩阵吸收.md`

- 原第 29 行 `./images/redrawn-fig-attention-cache-family-v2.png`：MHA、GQA、MQA、MLA 的 KV cache 持久化对象
  - 图注：图 1：四种注意力都保留多头 Query；MHA、GQA、MQA 减少或共享 K/V heads，MLA 则持久化联合 latent $c_j^{KV}$ 与共享位置键 $k_j^R$。
- 原第 39 行 `./images/redrawn-fig-mla-projection-cache-v2.png`：MLA 投影支路与持久化状态
  - 图注：图 2：一个输入 $h_t$ 分成 Query、联合 KV 内容、解耦位置键三条独立支路；只有 $c_t^{KV}$ 与 $k_t^R$ 写入 cache。
- 原第 47 行 `./images/redrawn-fig-mla-attention-assembly-v2.png`：MLA 每头打分、聚合与多头输出
  - 图注：图 3：每头先分别拼接内容与位置分量，再由 Q/K 产生分数；softmax 权重与 $v^C$ 在 Value 聚合处汇合，最后拼接各头输出并经过 $W^O$。
- 原第 55 行 `./images/redrawn-fig-deepseek-v2-metrics-v2.png`：DeepSeek-V2 训练成本与推理效率
  - 图注：图 4：DeepSeek-V2 论文 Figure 1(b) 的相对指标。表格避免用不同比例尺的柱长制造错误比较。
- 原第 327 行 `./images/redrawn-fig-mla-decode-score-v3.png`：MLA Decode 单步中吸收后的 content score 与共享 RoPE score 从当前 Query 和两类历史 cache 汇合为注意力权重
  - 图注：图 5：Decode 对每个 head $i$ 分别计算吸收后的 content score 与解耦 RoPE score；两项在同一历史位置 $j$ 上相加、缩放并施加 causal mask，再沿 $j$ 做 Softmax 得到 $\alpha_{t,j,i}$。
- 原第 337 行 `./images/redrawn-fig-mla-decode-value-v3.png`：MLA Decode 输出侧先在 latent 空间按每头 attention weights 聚合历史，再通过显式二输入 MatMul 与预合并矩阵映到模型维并跨头求和
  - 图注：图 6：Decode 输出侧先计算每头的 latent 加权聚合 $\bar c_{t,i}$，再把它与预合并参数 $B_i=W_i^{UV}W_i^O$ 一起送入 MatMul，最后对全部 head contribution 求和得到 $u_t$。
- 原第 362 行 `./images/redrawn-fig-mla-latent-kv-vs-mha-v3.png`：MHA 与 MLA 每个历史 token、每层的持久化 KV Cache 对象
  - 图注：图 7：MHA 持久化每头完整 K/V；MLA 仍做多头 attention，但只持久化联合 latent $c_j^{KV}$ 与共享解耦 RoPE key $k_j^R$，每头 $K^C/V^C$ 从 latent 恢复后直接参与计算，不写入 cache。
- 原第 410 行 `./images/redrawn-fig-mla-cache-fallback-v3.png`：Cache-native MLA 与 generic MHA fallback 的持久化 tensor、独立 cache write/read 路径和每 token 每层元素量
  - 图注：图 8：MLA 是否真正节省显存取决于持久化 cache 的表示。Cache-native 路径保存 $B\times L\times1\times512$ 的 $c^{KV}$ 与 $B\times L\times1\times64$ 的共享 $k^R$；generic MHA fallback 则可能展开并保存 $B\times L\times128\times192$ 的 K 与 $B\times L\times128\times128$ 的 V。

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与矩阵吸收/04.1-MLA工程实现/04.1-MLA工程实现.md`

- 原第 34 行 `./images/redrawn-fig-mla-v3-block-placement-v2.png`：DeepSeek-V3 单层中 MLA attention 与 MoE FFN 的 pre-norm 双残差数据流及正交资源分工
  - 图注：图 1：同一 pre-norm block 先执行 MLA attention，再执行 MoE FFN；两者各有独立 residual state。MLA 优化 attention/KV Cache，MoE 优化 FFN active FLOPs。
- 原第 46 行 `./images/redrawn-fig-deepseek-v2-mla-appendix-block-v2.png`：DeepSeek-V2 MLA 中 Q 低秩、联合 KV latent、解耦 RoPE、两类 cache 对象与每头 Attention 的完整数据流
  - 图注：图 2：同一 $h_t$ 分别生成 Query latent、联合 KV latent 与独立位置 key；生成阶段只缓存 $c^{KV}$ 与 $k^R$，读出后恢复 K/V 并完成每头 Attention。
- 原第 65 行 `./images/redrawn-fig-mla-nonabsorb-prefill-v2.png`：MLA Prefill 从 compact cache 显式 materialize Q、K、V bundle
  - 图注：图 3：Prefill 与 Decode 持久化同一份 $c^{KV}$ / $k^R$ cache；Prefill 读取完整历史后显式 materialize per-head $K^C$、$V^C$，再把 Q/K/V bundle 交给图 2 已说明的标准 Attention assembly。
- 原第 79 行 `./images/redrawn-fig-mla-absorb-decode-score-v2.png`：MLA Decode 当前 token 写入两类 latent cache，并通过 absorbed content score 与共享 RoPE score 生成注意力权重
  - 图注：图 4a：当前 token 生成并写入 $c_t^{KV}$ 与 $k_t^R$；历史端通过独立 SCORE READ 为 content 与 RoPE 两个打分分支供数，两项相加、缩放、施加 causal mask 后沿 $j$ 做 Softmax 得到 $\alpha_{t,j,i}$。
- 原第 89 行 `./images/redrawn-fig-mla-absorb-decode-value-v2.png`：MLA Decode 输出侧：α 从 score path 输入，与同一 latent cache 的历史 cKV 在每头做加权和，再经吸收矩阵映射并对所有 head 求和得到输出
  - 图注：图 4b：Decode 输出侧直接加权读取 latent cache；Value 与 Output 矩阵吸收为每头 $B_i$，因此无需物化历史 $V^C$。
- 原第 308 行 `./images/redrawn-fig-mla-flops-diff-prefill-v2.png`：固定 y=0 时归一化 MLA FLOPs 差 z=-768x² 的负二次曲线与两个复算锚点
  - 图注：图 5：纯 Prefill 的 $y=0$ 切片满足 $z=-768x^2$；$x=4096$ 与 $x=20000$ 时 $z/10^9$ 分别为 $-12.8849$ 与 $-307.2$，因此 non-absorbed / MHA mode FLOPs 更少。
- 原第 322 行 `./images/redrawn-fig-mla-flops-diff-decode-v2.png`：固定 x=1 时归一化 FLOPs 差 z 随缓存长度 y 严格线性上升及两个精确锚点
  - 图注：图 6：固定 Decode 查询长度 $x=1$ 后，$z=130304y-768$ 是直线；$y=4096$ 与 $y=20000$ 时 $z/10^9$ 分别为 $0.533724416$ 与 $2.606079232$。
- 原第 336 行 `./images/redrawn-fig-mla-flops-diff-prefix-cache-v2.png`：固定 y=20 时 MLA 两种模式的归一化 FLOPs 差与精确交叉点
  - 图注：图 7：固定 $y=20$，归一化差值 $z/10^6$ 在 $x^*=49.2733779477$ 处由正变负；左侧 absorbed 更省，右侧 non-absorbed 更省。
- 原第 350 行 `./images/redrawn-fig-mla-flops-regime-map-v2.png`：归一化 MLA FLOPs 差值在 query chunk length 与 cache length 平面上的模式选择边界
  - 图注：图 8：红线是 $z=0$ 的模式边界。边界上方 $z>0$，non-absorbed 更费 FLOPs；边界下方及 $x\ge170\frac23$ 的区域 $z<0$，absorbed 更费 FLOPs。

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与解耦式注意力/04-MLA-低秩潜变量与解耦式注意力.md`

- 原第 324 行 `./images/fig-mla-latent-kv-vs-mha.png`：MHA 高维 KV vs MLA 低秩 latent
  - 图注：图 4：左：MHA 存 $H$ 份 $d_h$ 维 K/V。右：只持久化 $c^{KV}$ 与解耦 RoPE $k^R$；多头 $K^C,V^C$ 算分时恢复、不写 cache。数字回 §14.2 与 Table 9，不另编压缩比。DeepSeek-V2 Figure 3 jpg 仍见图 1。

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/05-MLA矩阵吸收与非吸收双版本/05-MLA矩阵吸收与非吸收双版本.md`

- 原第 18 行 `./images/fig-mla-v3-block-placement.png`：DeepSeek-V3 层：MLA 替换 MHA，与 MoE 正交
  - 图注：图 1：MLA 在每层替换标准 MHA；MoE FFN 与注意力压缩正交。
- 原第 50 行 `./images/fig-mla-nonabsorb-prefill.png`：非吸收流图（MHA mode / Prefill）
  - 图注：图 3：Attention 在 **完整 head 维** $d_{qk}$ 上算；KV cache 后接上采样。
- 原第 71 行 `./images/fig-mla-absorb-decode.png`：吸收流图（MQA mode / Decode）
  - 图注：图 4：Attention 在 **latent 维** $d_c$ 上算（head 维 broadcast）；上采样拆到 Q/O 两侧。

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention/06-Gated-Attention.md`

- 原第 117 行 `./images/redrawn-fig-gated-attn-not-gated-residual-v2.png`：门控注意力作用于 SDPA 输出；门控残差以四分支读门、单次子层与逐分支写回实现
  - 图注：图 2:Gated Attention **不是** Gated Residual.左:Qiu et al. 的 $G_1$.右:[03-Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) 的 $n_r=4$ 逐元素读门.

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md`

- 原第 82 行 `./images/redrawn-fig-attnres-fixed-vs-depth-v2.png`：Pre-LN 固定深度累积与 Full AttnRes 可学习深度读取：source、pseudo-query、key、softmax 权重和当前层输入的完整关系
  - 图注：图 1：Pre-LN 将所有历史 sources 以权重 1 求和；Full AttnRes 用每层伪查询 $w_l$ 对 RMSNorm keys 打分，在 history source index $i$ 上做 softmax，再对原始 values $v_i$ 加权求和。
- 原第 317 行 `./images/redrawn-fig-attnres-block-partial-v2.png`：Block AttnRes 的 completed blocks、current partial、depth softmax、partial update 与 block promotion
  - 图注：图 2：Block entry 只读取 completed blocks；block 内后续层把 current partial 作为额外 source。当前层输出 $y_l$ 与旧 partial 相加，block boundary 才将完整和提升为新的 completed block。
- 原第 367 行 `./images/redrawn-fig-attnres-mechanism-axes-v2.png`：AttnRes、G1、mHC、Gated Residual 与 xHC 的 source set、controller、mixing axis 和输出路径
  - 图注：图 3：五种机制按真实张量管道并列。AttnRes 沿历史深度做 softmax；$G_1$ 门控当前 SDPA head outputs；mHC、GR 与 xHC 都沿当前深度的 residual stream set 读写。

## `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/2.2.2-多头注意力变体.md`

- 原第 31 行 `./images/redrawn-fig-attention-mechanism-family-overview.png`：MHA,MQA 与 GQA 的键值头共享关系对比
  - 图注：图 1:DeepSeek-V2 Figure 3 — MHA,GQA,MQA,MLA 的 KV 结构演进.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3-高效与稀疏注意力.md`

- 原第 102 行 `./images/redrawn-fig-ch23-efficient-attn-roadmap.png`：第 2.3 章:稠密代价,五条优化路线,Prefill/Decode/长上下文瓶颈
  - 图注：图:这一章按「哪一笔账」来分路线,而不是按论文发表顺序堆名词.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md`

- 原第 67 行 `./images/redrawn-fig-mea-lazy-softmax-stream.png`：标准注意力物化 n×n;lazy softmax 只留 v* 与 s*
  - 图注：图 1:左栏标准注意力物化 $S=QK^\top$ 再 softmax 再乘 $V$;右栏单 query 流式累加 $v^*,s^*$,最后相除.对应论文 §2 与式 (1).
- 原第 101 行 `./images/redrawn-fig-mea-running-max-renorm.png`：running max 重标度 v* 与 s*
  - 图注：图 2:§3 的数值稳定更新.$v^*$ 是 $d$ 维加权和,$s^*$ 是配分函数标量,$m^*$ 是 running max.底部警告对应正文「分数 $\ge 89$」.
- 原第 140 行 `./images/redrawn-fig-mea-tpu-two-level-chunks.png`：外层 scan query,内层 map KV,checkpoint 摘要
  - 图注：图 3:论文 Figure 1 的控制流.外层 `lax.scan` 写输出;内层 `lax.map` 得每块 $(V_j,w_j,m_j)$,再按全局 max 重标度.
- 原第 213 行 `./images/redrawn-fig-mea-vs-fa-vs-bpt.png`：MEA,FlashAttention,BPT 三列对照
  - 图注：图 4:三篇不是一篇.左 MEA(JAX/TPU,块摘要最后合并,$K$ 份临时输出,checkpoint 反向);中 FA(CUDA 融合核,SRAM 上增量更新**一份** $O$,打的是 HBM 访问次数);右 BPT(query 块上接着做 FFN,一层 $2bsh$,划掉设备环).
- 原第 233 行 `./images/redrawn-fig-mea-not-query-chunk-only.png`：不是只切 query,不是 Ring,不是 SP
  - 图注：图 5:三个「不是」.左:只切 query 且块 $\le 64$ 会慢(论文 Figure 5).中:Ring 在设备环上转 KV.右:序列并行按 rank 切序列.中间:MEA 在单设备上同时切 Q 和 K,不物化满 $n\times n$.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md`

- 原第 88 行 `./images/redrawn-fig-flashattention-gpu-memory-hierarchy.png`：FlashAttention 论文中的 A100 存储层次,分块循环与 GPT-2 运行时间
  - 图注：图 1:FlashAttention v1 论文图 1.图中的 A100 规格和 GPT-2 测量来自论文所用平台;算法部分显示外层遍历 $K,V$ 块,内层遍历 $Q$ 块.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/01-FlashAttention/02-FlashAttention-v1.md`

- 原第 18 行 `./images/redrawn-fig-flashattention-gpu-memory-hierarchy-v1.png`：FlashAttention 论文中的 A100 存储层次,Algorithm 1 循环顺序与 GPT-2 运行时间
  - 图注：图 1:FlashAttention v1 论文图 1.Algorithm 1 的外层循环遍历 $K_j,V_j$,内层循环遍历 $Q_i$;这个顺序决定了下文的 HBM 访问账本.
- 原第 136 行 `./images/redrawn-fig-flashattention-v1-runtime-memory.png`：FlashAttention v1 论文中的 FLOP,HBM 读写,运行时间,块大小与稀疏度实验
  - 图注：图 2:论文图 2.左表对应 GPT-2 medium,$N=1024$,$d=64$,16 头,批量 64,A100 的前向与反向测量:标准实现为 66.6 GFLOPs,40.3 GB HBM 读写,41.7 ms,FlashAttention 为 75.2 GFLOPs,4.4 GB,7.3 ms.中图与右图分别改变块大小和块稀疏度;这些数值只适用于图注所列协议.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/01-FlashAttention/03-FlashAttention-v2.md`

- 原第 31 行 `./images/redrawn-fig-fa-v2-mech-work-partition.png`：FlashAttention-1 与 FlashAttention-2 的循环和 Warp 划分
  - 图注：图 1:FlashAttention-2 让一个线程块持有一个 Query 行块,扫描全部 Key/Value 列块后再写回输出;Warp 也改为按 Query 行分工.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/01-FlashAttention/04-FlashAttention-v3.md`

- 原第 46 行 `./images/redrawn-fig-fa-v3-mech-pingpong.png`：FlashAttention-3 的双 Warpgroup pingpong 调度
  - 图注：图 1:两个消费者 Warpgroup 交替发起 WGMMA 与处理 softmax,生产者同时用 TMA 准备后续 Key/Value 分块.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/01-FlashAttention/05-FlashAttention-v4.md`

- 原第 29 行 `./images/redrawn-fig-fa-v4-mech-asymmetric.png`：FlashAttention-4 在 Blackwell 上的前向数据流
  - 图注：图 1:矩阵乘结果进入 TMEM;softmax 的指数计算由 MUFU 与 FMA 多项式两条路径共同承担,再把概率块交给 $PV$ 矩阵乘.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/01-FlashAttention/06-FlashAttention-Triton实现.md`

- 原第 29 行 `./images/redrawn-fig-fa-triton-tile-online-softmax.png`：Triton program 的 Query tile,Key/Value 内循环与在线 softmax 状态
  - 图注：图 1:一个 program 载入一次 Query 行块,在内循环中扫描 Key/Value 列块;在线 softmax 状态保留在片上,结束后写回一次输出.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/02-PagedAttention/01-PagedAttention与vLLM.md`

- 原第 174 行 `./images/fig-pagedattention-blocks.png`：逻辑 KV 块经 block table 映射到非连续等大物理块；连续预分配则留下预留与碎片

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/03-GQA与MQA/01-GQA与MQA源码实现分析.md`

- 原第 30 行 `./images/redrawn-fig-gqa-repeat-kv-group-map.png`：GQA 组映射与 SDPA 形状广播
  - 图注：图 1:左 $H_q=8$,$H_{kv}=2$,$g=4$,Q0–Q3 共享 KV0,Q4–Q7 共享 KV1.右:`[B, H_kv, S, D]` 经 `unsqueeze(2)` 得到 `[B, H_kv, 1, S, D]`,`expand` 到 `[B, H_kv, g, S, D]`,再 `reshape` 成 `[B, H_q, S, D]`.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/04-Attention实现方式对比/01-Attention实现方式全景对比.md`

- 原第 15 行 `./images/redrawn-fig-naive-vs-sdpa-fa-fused.png`：naive 物化 N×N 对比 SDPA/FA 融合核
  - 图注：图 1:左栏 eager 把 $S$,$A$ 两张 $N\times N$ 写回 HBM;右栏融合核只在 SRAM 上做 tile 级 online softmax,HBM 只进 $Q,K,V$,只出 $O$.底注:xFormers API 名 ≠ MEA 论文.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/2.3.1-硬件高效注意力.md`

- 原第 221 行 `./images/redrawn-fig-ch231-hw-efficient-attn.png`：硬件高效注意力:FlashAttention 数据流,PagedAttention 页表,MHA/MQA/GQA 的 KV 共享
  - 图注：图:左边是 IO 路径,中间是推理显存组织,右边是头结构对 KV 体积的影响.内存层次推导见 [9.1.2](../../../9-AI工程化与基础设施/9.1-硬件基础/9.1.2-GPU内存层次与Roofline.md).

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/01-MoBA架构深度解析/01-MoBA架构深度解析.md`

- 原第 63 行 `./images/redrawn-fig-moba-01-running-example.png`：MoBA 块路由运行示例(论文 Figure 1a)
  - 图注：图 1: MoBA 运行示例--两个 query 经门控各自选中不同 KV 块(论文 Figure 1a).
- 原第 133 行 `./images/redrawn-fig-moba-02-flash-integration.png`：MoBA 与 FlashAttention 集成(论文 Figure 1b)
  - 图注：图 2: MoBA 与 FlashAttention 的五步集成流水线(论文 Figure 1b).
- 原第 198 行 `./images/redrawn-fig-moba-05-scaling-law-lm-loss.png`：MoBA 与全注意力缩放定律(论文 Figure 3)
  - 图注：图 3: MoBA 与全注意力在 8K/32K 上的 LM 损失缩放对比(论文 Figure 3).
- 原第 216 行 `./images/redrawn-fig-moba-06-block-granularity-ablation.png`：MoBA 块粒度消融(论文 Figure 4)
  - 图注：图 4: 块粒度消融--细粒度分块显著降低验证损失(论文 Figure 4).
- 原第 237 行 `./images/redrawn-fig-moba-07-hybrid-training-loss.png`：MoBA/全注意力混合训练(论文 Figure 5a)
  - 图注：图 5: MoBA/Full 混合训练的位置级损失(论文 Figure 5a).
- 原第 249 行 `./images/redrawn-fig-moba-08-layerwise-hybrid-sft.png`：MoBA 分层混合 SFT(论文 Figure 5b/c)
  - 图注：图 6: 分层混合 SFT--末尾若干层切换全注意力(论文 Figure 5b/c).
- 原第 261 行 `./images/redrawn-fig-moba-09-continual-pretrain-sft.png`：持续预训练与 SFT 配方(论文 Figure 6)
  - 图注：图 7: Llama-8B-1M 持续预训练与 SFT 阶段配方(论文 Figure 6).
- 原第 288 行 `./images/redrawn-fig-moba-10-niah-1m-context.png`：Llama-8B-1M-MoBA NIAH 热力图(论文 Figure 7)
  - 图注：图 8: 1M 上下文 NIAH 热力图,prefill 用 MoBA(论文 Figure 7).
- 原第 306 行 `./images/redrawn-fig-moba-04-forward-speed-1m.png`：MoBA vs FlashAttention 前向耗时(论文 Figure 2)
  - 图注：图 9: MoBA 相对 FlashAttention 的前向耗时,亚二次复杂度(论文 Figure 2).

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md`

- 原第 69 行 `./images/redrawn-fig-nsa-three-branch.png`：NSA 三分支:压缩 / 选择 / 滑动窗口,再门控融合
  - 图注：图 1:NSA 三分支--窗管局部,压缩管全局粗扫,选择管细检索,门控 $g_t^c$ 加权融合.
- 原第 84 行 `./images/redrawn-fig-nsa-01-performance-efficiency.png`：NSA 相对 Full Attention 的性能与效率(论文 Figure 1)
  - 图注：图 2: NSA 相对 Full 的基准分数与 64K 三阶段加速(论文 Figure 1).
- 原第 171 行 `./images/redrawn-fig-nsa-03-kernel-design.png`：NSA Triton 内核设计(论文 Figure 3)
  - 图注：图 3: Triton 内核--按 GQA 组加载 query,按稀疏块取 KV(论文 Figure 3).
- 原第 219 行 `./images/redrawn-fig-nsa-06-triton-speedup.png`：NSA vs FlashAttention-2 内核延迟(论文 Figure 6)
  - 图注：图 4: NSA vs FlashAttention-2 内核延迟随序列长度变化(论文 Figure 6).
- 原第 241 行 `./images/redrawn-fig-nsa-04-pretrain-loss.png`：NSA 预训练损失曲线(论文 Figure 4)
  - 图注：图 5: 27B 预训练 loss--NSA 平滑且略优于 Full(论文 Figure 4).
- 原第 257 行 `./images/redrawn-fig-nsa-05-niah-results.png`：NSA 64K Needle-in-a-Haystack(论文 Figure 5)
  - 图注：图 6: 64K NIAH 全深度高召回热力图(论文 Figure 5).
- 原第 339 行 `./images/redrawn-fig-dsa-indexer-topk.png`：DSA:Lightning indexer 打分 → Top-K → MLA 主注意力只打选中 token
  - 图注：图 7:DSA 挂在 MLA 上--Lightning indexer 打分 → Top-K(默认 $k=2048$)→ 主注意力只算选中 token.全量 MLA KV 仍驻留. [DeepSeek-V3.2-Exp](https://github.com/deepseek-ai/DeepSeek-V3.2-Exp).

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/03-稀疏注意力综述/03-稀疏注意力综述.md`

- 原第 42 行 `./images/redrawn-fig-survey-memory-hierarchy.png`：GPU 存储层次与解码 Memory Bound(摘自 FlashAttention 论文)
  - 图注：图 1: GPU 内存金字塔(HBM→SRAM→寄存器);长序列 decode 算术强度极低,系统落在带宽受限区而非算力受限区.
- 原第 102 行 `./images/redrawn-fig-survey-nsa-framework.png`：NSA 三分支稀疏框架(论文 Figure 2)
  - 图注：图 2: NSA 的 cmp / slc / win 三支路并行,绿色为需计算区域;门控融合后等价于可训练的原生稀疏 attention.
- 原第 192 行 `./images/redrawn-fig-survey-moba-routing.png`：MoBA 块级动态路由(论文 Figure 1a)
  - 图注：图 3: MoBA 将历史切成块,query 与块均值 $\bar{K}_i$ 算亲和度后 top-k 选块;每 query 路由可不同(论文 Figure 1a).

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/04-RadialAttention稀疏注意力/04-RadialAttention稀疏注意力.md`

- 原第 13 行 `./images/redrawn-fig-radial-01-teaser-hunyuan-speedup.png`：Radial Attention 在 HunyuanVideo 上的加速与画质(论文 Figure 1)
  - 图注：图 1: 默认长度 1.9× 推理加速,4× 外推长度下 4.4× 降训练成本与 3.7× 推理加速(论文 Figure 1).
- 原第 41 行 `./images/redrawn-fig-radial-03-svg-vs-radial-pipeline.png`：SVG 动态 profiling vs Radial 静态统一掩码(论文 Figure 3)
  - 图注：图 2: SVG 每 head 二选一空间/时间稀疏;Radial 用单一静态 $O(n\log n)$ 掩码统一二者(论文 Figure 3).
- 原第 68 行 `./images/redrawn-fig-radial-04-spatiotemporal-energy-decay.png`：HunyuanVideo 上空间/时间 attention map 与衰减曲线(论文 Figure 4)
  - 图注：图 3: 空间 head 随时间距离快速衰减;时间 head 随空间距离衰减更明显(论文 Figure 4).
- 原第 107 行 `./images/redrawn-fig-radial-05-radial-mask-bands.png`：径向带,掩码与 HunyuanVideo 实例(论文 Figure 5)
  - 图注：图 4: 时间带密度减半 + 远帧空间对角线收窄;首帧 attention sink(论文 Figure 5).
- 原第 127 行 `./images/redrawn-fig-radial-02-complexity-9x-speedup.png`：长视频 attention 计算量与加速(论文 Figure 2)
  - 图注：图 5: 509 帧 720p HunyuanVideo 上 attention 计算约 **9×** 减少,3.7× 加速(论文 Figure 2).
- 原第 158 行 `./images/redrawn-fig-radial-06-wan21-video-quality.png`：Wan2.1 默认长度生成对比(论文 Figure 6)
  - 图注：图 6: Wan2.1-14B 上 Radial 与原版画质对齐(论文 Figure 6).
- 原第 168 行 `./images/redrawn-fig-radial-07-hunyuan-4x-extension.png`：HunyuanVideo 4× 长度外推视觉对比(论文 Figure 7)
  - 图注：图 7: 509 帧外推 — Radial+LoRA Vision Reward **≥** Dense+LoRA(论文 Figure 7).
- 原第 178 行 `./images/redrawn-fig-radial-08-lora-effectiveness-decay-fit.png`：LoRA 有效性 & 衰减曲线拟合(论文 Figure 8)
  - 图注：图 8: 长序列上 Radial+LoRA 可匹配全微调;$\exp(-ax+b)$ 拟合衰减 $R^2>0.985$(论文 Figure 8).

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/05-DCA-双块注意力/05-DCA-双块注意力.md`

- 原第 28 行 `./images/redrawn-fig-dca-intra-succ-inter.png`：DCA Intra / Successive / Inter 三段因果图
  - 图注：图 1:四块序列上 Intra(块内因果),Succ(邻块过渡),Inter(更远块的重映射相对位置).KV 形状不变.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/06-S2-Attn-移位稀疏注意力/06-S2-Attn-移位稀疏注意力.md`

- 原第 37 行 `./images/redrawn-fig-s2attn-shifted-sparse-pattern.png`：S²-Attn 分组与移位示意
  - 图注：图 1: S²-Attn 分组局部 attention + 半头移位形成跨组边(LongLoRA 论文).
- 原第 73 行 `./images/redrawn-fig-s2attn-longlora-overview.png`：LongLoRA 上下文扩展与训练配置
  - 图注：图 2: LongLoRA 将 4K 模型扩至 8K–100K 的训练/评测曲线(论文).

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md`

- 原第 28 行 `./images/redrawn-fig-v4-hybrid-architecture.png`：DeepSeek-V4 整体架构:CSA/HCA 与 MoE,mHC 的层间排布
  - 图注：图 1: DeepSeek-V4 层间排布--CSA/HCA 与 MoE,mHC 交错(论文 Figure 2).
- 原第 40 行 `./images/redrawn-fig-v4-benchmark-flops-kv.png`：V4 与同期模型的任务分对照(报告图,不是 FLOPs 曲线)
  - 图注：图 2: 下游任务对照.1M 上的效率数字 **不要**从这张任务分图读:V4 报告 Figure 1 **右侧**写明,1M 上下文下 V4-Pro 相对 V3.2 单 token FLOPs **≈ 27%**,KV Cache **≈ 10%**(等效 FP8 FLOPs);V4-Flash 约 **10% / 7%**.
- 原第 54 行 `./images/redrawn-fig-csa-core-architecture.png`：CSA 核心结构:块压缩,DSA 选块,滑动窗口与 MQA 核心注意力
  - 图注：图 3: CSA--块压缩,DSA top-k,滑动窗口与 MQA 核心 attention(论文 Figure 3).
- 原第 98 行 `./images/redrawn-fig-hca-core-architecture.png`：HCA 核心结构:更大压缩率 $m'$,无重叠,稠密 MQA
  - 图注：图 4: HCA--$m'=128$ 重度压缩后对全部压缩条目做稠密 attention(论文 Figure 4).

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/08-QSA-Qwen稀疏注意力/08-QSA-Qwen稀疏注意力.md`

- 原第 40 行 `./images/redrawn-fig-qsa-hybrid-slot.png`：每四层三层 GDN,一层 QSA;GR 包住每个子层
  - 图注：图 1:Qwen3.8-Next 的 token mixing 插槽.对应报告 Figure 1 的「三 GDN + 一 QSA」.GR 是残差读写,不是 mixer.$K_B=512$ 写在底栏,避免和专家数撞名.
- 原第 109 行 `./images/redrawn-fig-qsa-microblock-topk.png`：QSA:微块平均池化 → Top-$K_B$ 块 → 展开 token
  - 图注：图 2:indexer key 按 $r=4$ 平均池化成 $\bar k_b$,块因果 Top-$K_B$,再展开回 token 并截到 $K=2048$.不是 IndexPool 加权池化.
- 原第 132 行 `./images/redrawn-fig-qsa-block-causal-tail.png`：块因果:未完成块打不了分,所以尾巴一律进核心注意力
  - 图注：图 3:query 在 $i=13$,$r=4$ 时只能给 Block 0–2 打分;token 12,13 不在 $I_{ib}$ 里,靠式 (19) 硬留.示意图.
- 原第 173 行 `./images/redrawn-fig-qsa-two-stage-kl.png`：阶段 1 全块 KL;阶段 2 只在选中块上重归一化再 KL
  - 图注：图 4:式 (17)–(20).左:冻结主干,token 老师经 MaxPool+L1 对齐到块.右:Top-$K_B$ 之后老师在 $B_i$ 内重归一化.图上若把「重归一化」标成式 (19),以正文为准:式 (19) 是 Expand ∪ 尾巴,式 (20) 才是选中块 KL.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/09-IndexPool/09-IndexPool.md`

- 原第 15 行 `./images/redrawn-fig-indexpool-k4.png`：四条 indexer key 加权池化成一条,再交给 Top-K=2048
  - 图注：图:官方只保证「四键一池」.图里的方块是示意,不要当成报告插图.英文拼写以正文为准.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md`

- 原第 36 行 `./images/redrawn-fig-sllm-four-methods.png`：稠密,窗,重算窗,StreamingLLM 四种 KV 策略
  - 图注：图 1:论文 Figure 1 的四条路.(a) 稠密:cache 随 $T$ 涨;(b) 窗:踢掉起始 token;(c) 窗内重算;(d) 留下 sink + 滚动最近段.
- 原第 63 行 `./images/redrawn-fig-sllm-softmax-dump.png`：query 把质量倒进起始 sink;softmax 行和为 1
  - 图注：图 2:质量被迫加起来等于 1;对不上的部分停在起始若干 key 上.对应论文式 (1) 与 Figure 2.
- 原第 86 行 `./images/redrawn-fig-sllm-rolling-kv.png`：原文下标有洞;cache 内下标连续;RoPE 跟 cache
  - 图注：图 3:论文 Figure 4 的赋位.上排原文位置,下排 cache 槽.RoPE 跟下面那排.
- 原第 110 行 `./images/redrawn-fig-sllm-ppl-collapse.png`：窗在 cache 边界炸;稠密在预训练窗后爬;StreamingLLM 持平
  - 图注：图 4:对应论文 Figure 3 的定性形状,不是把表上的数字描成坐标.
- 原第 166 行 `./images/redrawn-fig-sllm-four-escapes.png`：四条逃逸阀:真实起始 KV,SoftMax1,标量 z',H2O 堆
  - 图注：图 5:四条「让注意力有地方去」的路.名字相近,实现不是同一个算子.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md`

- 原第 36 行 `./images/redrawn-fig-h2o-three-policies.png`：Full 全留,Local 只留最近窗,H2O 最近窗加内容相关 H2
  - 图注：图 1:三种 KV 策略.对应论文 Figure 1 上排示意.(a) 全量;(b) 只留最近;(c) 最近窗 + 散落的 $\mathsf{H_2}$.
- 原第 75 行 `./images/redrawn-fig-h2o-accum-evict.png`：当前 query 对 cache 打分,累积分最低的 key 被打叉
  - 图注：图 2:单步驱逐.分数是示意图,不是论文表.对应 Algorithm 1 与 Figure 3 的「按累积分数踢」.
- 原第 85 行 `./images/redrawn-fig-h2o-step-evict.png`：预算 k=3 时第四步踢掉 token 3,第五步 cache 仍是三条
  - 图注：图 3:论文 Figure 3.预算 $k=3$;第四步结束踢掉第 3 个 token 的 KV;后面再也读不到它.
- 原第 104 行 `./images/redrawn-fig-h2o-budget-split.png`：预算 k 对半分给 H2 和最近 token;总长约全量的 20%
  - 图注：图 4:预算切分.
- 原第 183 行 `./images/redrawn-fig-h2o-not-streamingllm.png`：StreamingLLM 固定前 4 个 sink;H2O 的 H2 可出现在任意位置
  - 图注：图 5:两条推理期 cache 策略.不要互换名字.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md`

- 原第 78 行 `./images/redrawn-fig-snapkv-obs-window.png`：观测窗在 prompt 末尾投票,选出的 prefix 簇与整段观测窗拼成压缩 cache
  - 图注：图 1:生成前压缩.对应论文 Figure 1:橙块是 **每个 head** 选出的成簇重要位置,青绿是观测窗;二者拼接后才拿去生成.
- 原第 89 行 `./images/redrawn-fig-snapkv-vote-pool.png`：从观测窗 query 到 per-head Top-k 再与观测窗拼接
  - 图注：图 2:Listing 1 的数据流.
- 原第 131 行 `./images/redrawn-fig-snapkv-hit-rate.png`：事后度量 H:A_cur 过阈值得到真重要掩码,与观测窗投票掩码做与
  - 图注：图 5:式 (4)–(8).$\mathbf{A}_{\mathrm{cur}}$ 是生成期当前 query 对 prefix 的分数;橙格是阈值掩码,青绿格是投票掩码;$H=\sum\mathbf{O}/\sum\mathbf{M}_{\mathrm{threshold\_cur}}$.对应论文 (4)–(8).格子是示意,不是某一层的真实 $\mathbf{A}_{\mathrm{cur}}$,也不是可读取的坐标曲线.
- 原第 148 行 `./images/redrawn-fig-snapkv-pooling-cluster.png`：naive Top-k 留下孤峰;1D pooling 后高峰的邻居一起留下
  - 图注：图 3:pooling 在选谁.对应 §4.3 与 Figure 8 的消融动机.格子数是示意图,不是 LongEval 表.
- 原第 164 行 `./images/redrawn-fig-snapkv-not-neighbors.png`：StreamingLLM 固定前 4+窗;H2O decode 逐步驱逐;SnapKV 生成前按观测窗选簇
  - 图注：图 4:三条推理期 KV 策略.不要互换名字.
- 原第 209 行 `./images/redrawn-fig-snapkv-instr-pos.png`：观测窗永远在 prompt 末尾:问题在文前则落在 prefix,问题在文末则落入窗内
  - 图注：图 6:观测窗位置.对应论文 Figure 5 的两种排版.黄块是问题 Q,青绿是 $L_{\mathrm{obs}}$,橙簇是投票选出的 prefix.不是 Figure 4/5 的层间曲线.
- 原第 302 行 `./images/redrawn-fig-snapkv-prefill-decode.png`：Prefill 仍全量注意力才能投票;decode 的 prompt KV 条数钉死
  - 图注：图 7:整机插槽.左 prefill 仍全量(及 FA 时另开 $\mathbf{W}_{\mathrm{obs}}$);右 decode 条数钉死,生成 KV 往后追加.图上若把观测窗标成 $W_{\mathrm{obs}}$ tokens,那是记号混用:窗长是 $L_{\mathrm{obs}}$,$\mathbf{W}_{\mathrm{obs}}$ 是注意力张量.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md`

- 原第 47 行 `./images/redrawn-fig-quest-not-eviction.png`：稠密全载,驱逐丢槽,Quest 全量驻留只载 Top-K 页
  - 图注：图 1:三种 decode 读 KV 的方式.对应论文 Figure 1 的 Dense / Query-agnostic / Query-aware.(c) 的格子都还在 GPU 上,橙页只表示这一步载入注意力.
- 原第 57 行 `./images/redrawn-fig-quest-query-depends.png`：同一条 B 在 query=D 时低分,在最后的 is 上变成高分
  - 图注：图 2:criticality 随 query 变.对应论文 Figure 2 的 "A is B. C is D. A is".左栏 0.05 是示意图,不是论文表.
- 原第 145 行 `./images/redrawn-fig-quest-page-minmax.png`：Query 与每页 min/max 做通道上界,再按分数取 Top-K 页
  - 图注：图 3:单页估计.对应 Algorithm 1 与 Figure 5 左半.右侧 2.1 / 0.4 / 1.7 / 0.9 是示意图.
- 原第 156 行 `./images/redrawn-fig-quest-two-stage.png`：两阶段:先扫元数据估分,再只把 Top-K 页送进注意力;全量 KV 仍驻 GPU
  - 图注：图 4:论文 Figure 5 的两阶段,加上「驻留 ≠ 这一步加载」.
- 原第 168 行 `./images/redrawn-fig-quest-algo1-insert.png`：新 token 写入时增量更新该页 min/max;盒子角点通常不是真实 Key
  - 图注：图 5:Algorithm 1 上半.左:新 $k$ 写入只更新该页 $m,M$.右:轴对齐盒子的角点不是页内任一条 Key.对应式 (2a).
- 原第 254 行 `./images/redrawn-fig-quest-page-collision.png`：PagedAttention 页表管碎片;Quest 页是 min/max 盒子,省的是 HBM→SM 带宽
  - 图注：图 6:同一个「页」字.左:页表把逻辑页映到物理块,管碎片.右:每页另存通道极值 $m,M$,这一步只把 Top-K 页搬进 SM;未选中的页仍在 HBM.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/14-PyramidKV-层间漏斗/14-PyramidKV-层间漏斗.md`

- 原第 36 行 `./images/redrawn-fig-pyramidkv-vs-uniform.png`：四种 KV 策略:全量,StreamingLLM,各层同宽的 SnapKV/H2O,层间漏斗的 PyramidKV
  - 图注：图 1:四种 KV 策略.对应论文 Figure 1.(a) 全量;(b) 起始位 + 最近窗;(c) 按分数选,**各层同宽**;(d) 浅层宽,深层窄.
- 原第 59 行 `./images/redrawn-fig-pyramidkv-funneling.png`：浅层均匀,中层文档内三角,深层 sink 竖条的注意力示意
  - 图注：图 2:漏斗观察.对应论文 Figure 2 的分层趋势.格子是示意图,不是某一条 LongBench 样本的真实热图.
- 原第 106 行 `./images/redrawn-fig-pyramidkv-budget-select.png`：等差层预算加观测窗投票再 Top-k
  - 图注：图 3:§4.2.1 预算 + §4.2.2 选人.公式以 v4 为准.
- 原第 146 行 `./images/redrawn-fig-pyramidkv-not-neighbors.png`：StreamingLLM,H2O,SnapKV 各层同宽;PyramidKV 浅层宽深层窄
  - 图注：图 4:四条推理期 KV 策略.第四列必须读成 **浅层(Layer 0,靠近输入)更宽**.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/15-FastGen-按头自适应/15-FastGen-按头自适应.md`

- 原第 59 行 `./images/redrawn-fig-fastgen-two-phase.png`：Prompt encoding 上按注意力图为每个头选定策略,生成期按该策略持续驱逐
  - 图注：图 1:双阶段.对应 Algorithm 1–2 与 §3.2.色块只区分「留下 / 丢掉」,不是论文里的注意力热力图.
- 原第 86 行 `./images/redrawn-fig-fastgen-five-structures.png`：五种 KV 策略:局部窗,特殊 token,标点,列稀疏高频,全量
  - 图注：图 2:五种结构与对应 cache.对应 §3.4 与论文 Figure 1 左.格子数是示意图.
- 原第 132 行 `./images/redrawn-fig-fastgen-greedy-hybrids.png`：贪心嵌套:special → 加标点 → 加高频 → 加局部 → 全量,按恢复比 T 停
  - 图注：图 3:式 (2) 的嵌套可行集.对应 §3.4 与 Appendix A.1.图上的格子是示意图.
- 原第 142 行 `./images/redrawn-fig-fastgen-per-head.png`：同一层:非自适应对照所有头同一套规则;FastGen 每个头自己的 C_i
  - 图注：图 4:为什么要按头自适应.左栏对应论文非自适应基线;右栏对应论文 Figure 1 右「同一层三个头」.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/16-ScissorHands-重要性持久/16-ScissorHands-重要性持久.md`

- 原第 46 行 `./images/redrawn-fig-scissorhands-repetitive-attn.png`：三个位置的注意力图在同一批 token 上出现深色格
  - 图注：图 1:重复注意力图案.对应论文 Figure 1.格子数与着色是示意图,不是把 PDF 描下来.
- 原第 84 行 `./images/redrawn-fig-scissorhands-persistence.png`：前半句的 pivotal 集合罩住后半句仍在看的那些 key
  - 图注：图 2:式 (2) 在画什么.对应 Figure 2 的含义,不是 persistence 曲线的描图.
- 原第 145 行 `./images/redrawn-fig-scissorhands-budget-compress.png`：预算 B 满了之后按历史窗计数丢掉非 pivotal,最近 r 条始终留下
  - 图注：图 3:Algorithm 1 / 2.$r=10$,$w=400$ 是论文实验默认;格子数是示意图.
- 原第 215 行 `./images/redrawn-fig-scissorhands-not-neighbors.png`：StreamingLLM 固定前 4;H2O decode 累积分数;Scissorhands 历史窗上的非重要计数加最近窗
  - 图注：图 4:三条推理期 KV 策略.不要互换名字.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/17-TOVA-注意力省略/17-TOVA-注意力省略.md`

- 原第 67 行 `./images/redrawn-fig-tova-msrnn-unbounded.png`：上排 KV 随 decode 无限增长;下排把状态数钉死为 2,每步丢掉一条
  - 图注：图 1:unbounded / bounded MSRNN.对应论文 Figure 1.青绿是还在的状态;下排红叉是这一步丢掉的那条.格子数是示意图.
- 原第 107 行 `./images/redrawn-fig-tova-drop-lowest.png`：当前 query 对 cache 打分,最低的那条被叉掉
  - 图注：图 2:单步 TOVA.对应论文 Figure 2 与 Algorithm 1.分数是示意图,不是表.
- 原第 118 行 `./images/redrawn-fig-tova-layer-mean.png`：每头各踢各的较差;层内平均后再踢一条更好
  - 图注：图 3:head 与 layer.对应 Appendix A / Table 3.
- 原第 211 行 `./images/redrawn-fig-tova-evict-before-question.png`：读 haystack 时当前 query 把 passkey 叉掉;问句到来后槽已空
  - 图注：图 4:当前步注意力误杀.场景对齐 Quest 单独成篇 Figure 2 / Table 1 的驱逐叙事;格子和 0.02 是示意图.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/2.3.2-稀疏与压缩注意力.md`

- 原第 398 行 `./images/redrawn-fig-ch232-sparse-attn.png`：稀疏与压缩注意力:块稀疏,MoBA 路由,NSA 三分支,训练时稀疏 vs 推理补丁
  - 图注：图:四块分别对应「算哪些块」「怎么选块」「NSA 三路」「训练期是否已经稀疏」.单独成篇仍在各子目录.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md`

- 原第 46 行 `./images/redrawn-fig-kda-channel-diag.png`：头级标量 α_t 整头同一遗忘;KDA 用对角 Diag(α_t) 让每个通道自己过期
  - 图注：图 1:遗忘门粒度.左:Gated DeltaNet 一头一个 $\alpha_t$,整份 $S_{t-1}$ 同一速度过期.右:KDA 的 $\mathrm{Diag}(\boldsymbol{\alpha}_t)$,一行一个 $\alpha_i$.两边的 rank-1 擦写仍是 $\mathbf{k}_t\mathbf{k}_t^\top$.K3 的 $g_{\min}=-5$ **不在这张图上**(见 §5).

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/2.3.3-线性注意力机制.md`

- 原第 129 行 `./images/redrawn-fig-ch233-linear-attn.png`：线性注意力:计算图,核特征映射,RWKV/Mamba 状态,混合架构路线
  - 图注：图 1:线性路线省掉的是显式 $QK^\top$,换来的是状态压缩.工业上常见的是混合,而不是纯替换.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.4-高效注意力全景综述/2.3.4-高效注意力全景综述.md`

- 原第 27 行 `images/redrawn-attention-landscape-infographic.png`：高效注意力机制技术演进与分类全景图
  - 图注：**图 1.1 高效注意力机制的技术演进与分类全景**
  - 图注：* **硬件高效层(MEA / FlashAttention / PagedAttention)**:不改 Softmax 注意力的数学定义,改 SRAM↔HBM 访问或 KV 分页.DeepSeek-V4 的 **HCA** 是 Heavily Compressed Attention(§6.2),不要和本层撞名.**不要**把 MEA 收进 FlashAttention 名下.
  - 图注：* **稀疏与窗口注意力(Sparse / Local Attention)**:限制 attention 作用范围, 舍弃远距离连接. 仅计算对角窗口或跨距块, 将计算复杂度从 $O(T^2)$ 降低到 $O(T \cdot w)$.
  - 图注：* **线性与核函数近似(Linear Attention)**:换核,随机特征或沿序列投影,使时间与 $T$ 近线性.Performer 才是近似 softmax;Katharopoulos 是换核;Linformer 还留着 softmax.
  - 图注：* **状态与维度压缩层(MQA / GQA / MLA 等)**:在头数或特征维压缩每 token 的 KV.CSA 按 V4 的 Compressed Sparse Attention 读,不是 Cross-Layer,见 §6.2.
- 原第 105 行 `./images/redrawn-fig-pagedattention-blocks.png`：PagedAttention:连续预分配留下预留/内部/外部碎片;分页后逻辑块经 block table 映射到等大物理块,浪费停在最后一块
- 原第 153 行 `./images/redrawn-fig-swa-rolling-buffer.png`：SWA:每层只看宽 W 的左窗,深度上信息最多走 W·k;右侧 rolling buffer 固定 W 槽,按 i mod W 覆盖
- 原第 208 行 `./images/redrawn-fig-dilated-sliding-window.png`：滑窗连续邻居 vs 空洞滑窗:连接数相同,一层跨度约 (w/2)·d
- 原第 231 行 `./images/redrawn-fig-bigbird-three-blocks.png`：BigBird:随机 r=2,滑窗 w=3,全局 g=2,以及三者并起来;不是空洞注意力
- 原第 262 行 `./images/redrawn-fig-star-transformer-ring-radial.png`：满连接 n×n;星形:环上卫星 + 中心中继 s;右侧是 BigBird 多全局 token,不是同一个更新规则
- 原第 301 行 `./images/redrawn-fig-star-attention-two-phase.png`：Phase 1:块前缀锚 c1,主机互不通信;Phase 2:query 广播,query-host 聚合 A_h 与 s_h;右侧不是 2019 那个中继编码器
- 原第 322 行 `./images/redrawn-fig-reformer-lsh-chunks.png`：满注意力 vs 哈希排序后近对角 vs 切块只看本块和前一块;底条可逆层
- 原第 358 行 `./images/redrawn-fig-routing-kmeans-clusters.png`：一半头局部窗;球面 k-means 学质心;按簇 gather 后只在块内做因果注意力.每个质心取 w=n/k 个 token,不是每个 query 选 k 个质心
- 原第 387 行 `./images/redrawn-fig-sinkhorn-block-sort.png`：局部块内 QK;Sinkhorn 把块置换后再做局部点积;SortCut 编码截段.mHC 的 Sinkhorn 作用在残差混合上,不是这篇
- 原第 418 行 `./images/redrawn-fig-linear-transformer-elu.png`：softmax 物化 n×n;线性注意力用同一个 ϕ=elu+1 累加 S 与 Z;因果时按 RNN 更新,每步代价对 N 常数
- 原第 449 行 `./images/redrawn-fig-rwkv4-wkv-rnn.png`：softmax 是 n×n 的 qᵀk;RWKV-4 用通道衰减 WKV;推理时维护 a,b 与 token shift,WKV 每步 O(d),投影仍是 O(d²)
- 原第 494 行 `./images/redrawn-fig-aft-pairwise-vs-rwkv.png`：softmax 物化 n×n;AFT 用 pairwise w 加权 K,V 再逐元素乘 sigmoid(Q);RWKV 把 w 换成通道衰减才能当 RNN
- 原第 538 行 `./images/redrawn-fig-synthesizer-dense-random.png`：Vanilla 用 QKᵀ;Dense 每个 token 独立 FFN 投到长度 N;Random 用全局 R,分解仍 softmax(N×N),不是 Linformer 的 n×k
- 原第 565 行 `./images/redrawn-fig-lightconv-dynamicconv.png`：自注意力物化 n×n;LightConv 用共享 softmax 核做 depthwise 窗;DynamicConv 的核只从当前 Xi 线性预测
- 原第 580 行 `./images/redrawn-fig-favor-plus-prf.png`：三角 RFF 可取负 vs FAVOR+ 正特征 exp(ωᵀx − ‖x‖²/2);线性重排 Φ(Q)(Φ(K)ᵀV)
- 原第 613 行 `./images/redrawn-fig-rfa-trig-gate.png`：RFA 用单位化 Q/K 加三角 RFF;因果时累加 S 与 z,可选 sigmoid 门做近因偏置.12× 是 2048 解码模拟
- 原第 632 行 `./images/redrawn-fig-linformer-seq-proj.png`：标准注意力物化 n×n 的 P;Linformer 沿序列把 K/V 投到 k,注意力图变成 n×k.E,F 形状含 n
- 原第 654 行 `./images/redrawn-fig-csa-cla-hca-names.png`：三套缩写:CLA 跨层复用 KV;CSA 压缩后稀疏;HCA 强压缩后仍稠密
- 原第 661 行 `images/redrawn-kv-cache-compression-comparison.png`：MHA, MQA, GQA, MLA 的每 Token KV Cache 显存占用与信息构成对比
  - 图注：**图 6.1 MHA,MQA,GQA 与 MLA 架构的 KV Cache 显存占用与信息构成对比分析**
  - 图注：* **MHA(Multi-Head Attention, 多头注意力)**:每个 Query 头 $Q^{(h)}$ 拥有各自独立的 Key 头 $K^{(h)}$ 和 Value 头 $V^{(h)}$. 对于 32 个头, 每一步解码生成都必须为 32 对 K/V 向量分配和读写 Cache.
  - 图注：* **MQA(Multi-Query Attention, 多查询注意力)**:所有的 Query 头共享唯一的一对 Key 头 $K$ 和 Value 头 $V$. KV Cache 显存开销降为 MHA 的 $1/H$(如 32 倍压缩), 但注意力表达能力大幅缩水, 易损失长文精度.
  - 图注：* **GQA(Grouped-Query Attention, 分组查询注意力)**:介于两者之间, 将 Query 分为 $G$ 个组(如 8 组), 每组内的 Query 头共享一对 K/V. KV Cache 显存开销为 GQA 组数比例, 兼顾了吞吐量与精度的帕累托最优.
  - 图注：* **MLA(Multi-Head Latent Attention, 多头潜在注意力)**:通过引入低秩压缩空间, 将 K/V 投影解耦. 所有头通过低秩隐空间矩阵进行动态映射和解压. 它在物理上只存储低维的 Latent 向量(达到 8 倍以上的 Cache 压缩比), 但在计算时能通过解压矩阵为每个注意力头还原出独有的完整维度, 完美融合了 MQA 的高吞吐量与 MHA 的高表达能力.

## `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.5-多头潜在注意力MLA/2.3.5-多头潜在注意力MLA.md`

- 原第 26 行 `./images/fig-mla-kv-latent-cache.png`：MLA：只缓存潜向量 $c_{KV}$，注意力前再重建 K/V
  - 图注：图 1：缓存的是 $c_{KV}$，不是满秩 K/V。下投影 $W^{DKV}$、上投影 $W^{UK}/W^{UV}$ 的矩阵式见 [04 式与图 2](../../2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与解耦式注意力/04-MLA-低秩潜变量与解耦式注意力.md)。
- 原第 49 行 `./images/fig-mla-archive-analogy.png`：MHA、GQA 与 MLA 的归档类比
  - 图注：图 2：MHA 每头一座档案柜；GQA 分组共用；MLA 只留一罐 $c^{KV}$，用 $H$ 路上投影现场还原。

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/01-LLM-JEPA：联合嵌入预测架构与自监督表示学习.md`

- 原第 13 行 `./images/redrawn-fig-jepa-predict-repr.png`：左:Text 经 Enc 再 Pred;右:Code 经 Enc.余弦对齐表示.叉掉词表 softmax:那不是 MTP
  - 图注：图 1:论文式 (2) 的示意.生成能力仍靠 $\mathcal{L}_{\mathrm{LLM}}$;JEPA 项在嵌入空间.

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4-前沿架构与变体.md`

- 原第 22 行 `./images/redrawn-fig-24-four-lanes.png`：四条前沿:MoE / SSM / 线性 RNN / 扩散 LM
  - 图注：图 1:四格只标路线差别.MoE 改 FFN 激活;SSM/Mamba 线性扫描;Griffin 常尺寸循环;DLM 从噪声迭代出 token.查表见 2.4.8.深度维循环 $N=KR$ 见 2.4.9,不在这张四格里.细节各进 2.4.1–2.4.9.

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE.md`

- 原第 17 行 `./01-DeepSeek-MoE-images/fig-deepseek-moe-shared-routed.png`：共享专家 always-on，路由专家 Top-K
  - 图注：图 1：下为 $u_t$，左绿共享专家实线全开，右蓝路由专家经 Router / Top-$K_r$ 虚线选中后再加权。输出 $h'_t$。

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md`

- 原第 104 行 `./images/redrawn-fig-deepseek-moe-shared-routed-v2.png`：DeepSeekMoE共享专家、路由门控、加权求和与残差的完整前向数据流
  - 图注：图 1：单个 token 的 DeepSeekMoE 前向计算，示意配置为 $N_s=3,N_r=5,K_r=2$，省略 Norm。共享专家全部执行；路由侧选中专家 2、4。隐藏态、门控权重、各路输出和原始残差都保留明确的来源与汇合位置。实际模型配置见第 5 节。
- 原第 133 行 `./images/redrawn-fig-deepseek-moe-ffn-slot-v2.png`：DeepSeekMoE的FFN替换范围、两次残差与Router控制信号
  - 图注：图 2：固定同一注意力映射 $A$，比较 Dense FFN 与 DeepSeekMoE。红虚线框标记前馈映射 $F$ 的替换范围；每种结构都保留两次残差相加。$F_M(u^l)$ 汇合共享和加权路由输出，随后在框外与 $u^l$ 相加。
- 原第 287 行 `./images/redrawn-fig-deepseek-moe-v1-v3-gating-v2.png`：DeepSeekMoE专家选择与门控值的独立来源路径及数值对应
  - 图注：图 3：两种规则使用同一组四专家 logits。V1/V2 由全局 Softmax 产生 $p$，用 Top-K 的索引 $S$ 保留相应分量。V3 将原始 $s$ 与独立偏置 $b$ 相加来选择 $S$，再从旁路输入的原始 $s$ 计算门控。每条旁路都标明传递的变量。

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/03-MoE-Top-K运算可导性分析/03-MoE-Top-K运算可导性分析.md`

- 原第 75 行 `./images/redrawn-fig-moe-topk-values-indices-v2.png`：HardTopK返回values与indices、固定选集下的scatter梯度及并列边界
  - 图注：图 1：$x=[1,3,2,4],K=2,\texttt{sorted=True}$。`torch.topk` 直接返回 $v=[4,3]$ 和零基 indices $I=[3,1]$；$[0,3,0,4]$ 是随后按 $I$ scatter 回原坐标的表示。values 的上游梯度通过 $I$ scatter 回 $x$，整数 indices 不参与反向。
- 原第 120 行 `./images/redrawn-fig-moe-gate-gradients-v2.png`：同一Top2选集下全局Softmax子集Softmax与独立Sigmoid的准确Router梯度
  - 图注：图 2：$h=[1.2,0.3,0.1,-0.4]$，$S=\{1,2\}$，损失固定为 $L=2g_1-g_2$。三列使用同一 active set，只改变 gate 的构造和归一化范围；表中所有梯度均由对应公式和有限差分核对。
- 原第 159 行 `./images/redrawn-fig-moe-gate-order-v2.png`：同一组8维logits先Top3再子集Softmax与全局Softmax后截断的精确数值及二次归一化等价关系
  - 图注：图 3：同一组 $h=[2.1,1.3,-0.2,3.0,0.7,-1.1,1.8,-0.5]$，$K=3$。无并列时，Softmax 的单调性使两种顺序都选出 $S=\{4,1,7\}$；差别在于 Softmax 的归一化集合和截断后的 gate 总质量。
- 原第 255 行 `./images/redrawn-fig-moe-hard-topk-mechanism-v2.png`：HardTopK中原始向量与整数选集分路、两个专家计算及固定选集梯度边界
  - 图注：图 4A：Hard Top-K。原始 $x$ 与 $(S,g)$ 分别进入 Dispatch；只有 Expert 2、4 执行，gate 绕过 FFN 进入输出乘法。固定 $S$ 时沿 values／gate 使用分段 Jacobian，整数 indices 用于派遣与 scatter。
- 原第 259 行 `./images/redrawn-fig-moe-remoe-mechanism-v2.png`：ReMoE中原始向量派发、ReLUgate加权和自适应L1稀疏控制的独立路径
  - 图注：图 4B：ReMoE。$r=[-0.2,0.5,-0.1,0.3]$ 经 ReLU 得 $g=[0,0.5,0,0.3]$；原始 $x$ 只派给正 gate 专家，gate 单独进入乘法。训练控制使用批次／层上的 gate 集合计算 $L_{\mathrm{reg}}$ 和当前稀疏度 $S_i$，当前 $\lambda_i$ 同时参与本步正则与下一步系数更新。
- 原第 263 行 `./images/redrawn-fig-moe-softmoe-mechanism-v2.png`：SoftMoE的X与Phi打分、D列归一化、C行归一化、slot专家计算和CV重构
  - 图注：图 4C：Soft-MoE 的 $T=3,d=2,M=4$ 数值例子。$X$ 与 $\Phi$ 共同产生 $L$；$D$ 的每列和为 1，$C$ 的每行和为 1。$U=D^\top X$ 形成四个 slot，两个专家各处理两个 slot，按原顺序堆叠为 $V$，最后 $Y=CV$。
- 原第 327 行 `./images/redrawn-fig-moe-sparsemixer-comparison-v2.png`：常规TopKgateproxy、SparseMixer中点估计与SparseMixer-v2无放回采样Heun估计的完整稀疏前向
  - 图注：图 5：三列都只运行当前选中或采样专家。常规 Top-K 使用确定性 mask，计算 $\nabla_1$ 并令 $\nabla_0=0$；SparseMixer v1 的简化 Top-1 用中点二阶估计；SparseMixer-v2 用 MaskedSoftmax 无放回采样和 Heun 三阶修改反向。

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md`

- 原第 29 行 `./images/redrawn-fig-latentmoe-shared-vs-routed-ell-v2.png`：Stable LatentMoE 主计算图：Router 读取 $x$，路由专家处理 $z$，共享专家并行处理 $x$，两条分支在输出端相加
  - 图注：图 1a：Stable LatentMoE 主计算图。Router 始终读取满宽 $x$；$\mathbf W^{\downarrow}$ 只压缩路由专家的数据载荷；两个共享专家并行处理 $x$；共享输出 $s$ 与路由输出 $r$ 最后相加。
- 原第 33 行 `./images/redrawn-fig-latentmoe-routed-internals-v2.png`：Stable LatentMoE 路由专家内部计算：$z$ 与 indices $S$ 进入 Dispatch，门控权重 $p_i$ 直接参与逐专家加权，Combine 得到 $u$
  - 图注：图 1b：路由专家内部计算。Dispatch 只根据 $S$ 复制并分发 $z$；$p_i$ 不参与 Dispatch，而是在各专家输出上完成加权；Combine 汇总 $q_i=p_i\,\mathrm{Expert}_i(z)$。
- 原第 78 行 `./images/redrawn-fig-latentmoe-layer-slot-v2.png`：Kimi K3 的 93 层配对：23 个 3×KDA + 1×Gated MLA block，再加最终 Gated MLA；每个 Attention 后接 Stable LatentMoE
  - 图注：图 2：23 个完整 Hybrid Attention blocks 产生 92 层，额外的 Final Gated MLA 构成第 93 层；93 个 Attention 都各自配对一个 Stable LatentMoE。单层框同时标出 Block AttnRes 输入、Router 输入和两个潜变量的作用位置。
- 原第 201 行 `./images/redrawn-fig-quantile-balancing-qb-v2.png`：Quantile Balancing 的跨步因果关系：batch $t$ 同时执行当前路由并产生 margin，QB 只生成下一步使用的 bias
  - 图注：图 3a：QB 的训练时间线。Batch $t$ 用 $b^{(t)}$ 完成当前路由，同时从 $s^{(t)}$ 与 $\alpha^{(t)}$ 生成 $M^{(t)}$；只有 $M^{(t)}$ 进入 QB update，得到并存储供 batch $t+1$ 使用的 $b^{(t+1)}$。
- 原第 205 行 `./images/redrawn-fig-quantile-balancing-numeric-v2.png`：Quantile Balancing 数值核对：第 $q+1$ 大 margin 决定 raw bias，centering 后 bias 之和为零
  - 图注：图 3b：$m=8,n=4,k=1,q=2$ 的数值核对。Expert 1 的第 3 大 margin 为 $0.85$，所以 $\widehat b_1=-0.85$；严格不等式恰好留下 2 个 token。四个 raw bias 减去均值 $-0.085$ 后得到零和 bias。

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md`

- 原第 38 行 `./images/redrawn-fig-moe-dense-vs-sparse-v2.png`：Dense与Sparse前馈接口、独立隐藏态和gate路径及矩阵预算对照
  - 图注：图 1：两种前馈映射均接收 $x\in\mathbb R^d$ 并输出 $d$ 维向量。示例 Dense 中间维为 $2H$；Sparse 有 8 个中间维为 $H$ 的专家，每 token 选择 2 个，假定容量充足。两者的输出分别记为 $y_D,y_M$，并不要求数值相同。
- 原第 62 行 `./images/redrawn-fig-moe-router-top2-v2.png`：Top2路由中隐藏态x与选择索引及gate的独立路径
  - 图注：图 2：单 token 的 Token-Choice 前馈映射，$k=2$，假定所选专家容量充足。本例先对全部专家做 Softmax，再保留 Top-2 的原始分数：Expert 2 与 Expert 5 分别使用 $g_2=0.31,g_5=0.28$。图示输出 $y$ 是专家前馈结果，Transformer 子层的残差另行相加。
- 原第 119 行 `./images/redrawn-fig-switch-top1-v2.png`：SwitchTop1从logits到Softmaxgate的计算及独立隐藏态派发路径
  - 图注：图 3：单 token、容量充足的 Switch 前馈示例。Router 对八个专家计算 logits，经全局 Softmax 选中 Expert 5。整数索引用于派发原始 $x$，所选概率用于缩放专家结果。图示输出 $y$ 是前馈映射，外层残差另计。
- 原第 136 行 `./images/redrawn-fig-moe-expert-choice-v2.png`：Expert-Choice：评分矩阵、逐列选择、原始向量 Gather、专家计算与加权回写
  - 图注：图 4：自构的 $T=8,N=5,C=2$ 数值例子。评分与数据派遣是两条路径：Router 产生索引和 gate，Gather 按索引取得原始向量，专家结果再按 token 位置加权累加。图示输出 $Y$ 为 FFN 分支，残差另计。
- 原第 163 行 `./images/redrawn-fig-moe-load-imbalance-v2.png`：Top1索引的计数分支与原始向量分组派遣：16个token的完整负载与输出
  - 图注：图 5：八个专家按 1–8 编号，负载为 $(1,1,10,1,1,1,1,0)$，总数恰好为 16。为单独观察派遣分布，本例设 $C\ge10$，所有选择均被接收；容量溢出见图 8。
- 原第 229 行 `./images/redrawn-fig-moe-eng-aux-zloss-v2.png`：MoE三项损失的预测标签输入、计数概率双分支与单次系数加权
  - 图注：图 6：同一次模型前向给出词表 logits 与某个路由层的 logits。交叉熵同时接收预测和监督标签；Router logits 分出概率统计与 LogSumExp 两条路径。原始 $L_{\mathrm{balance}}$、$L_z$ 各乘一次系数后，与主损失相加。示例系数为 $\alpha=0.01,c_z=0.001$。
- 原第 246 行 `./images/redrawn-fig-moe-router-zloss-v2.png`：Router选择性FP32、原始隐藏态派发、整数索引与zloss训练分支
  - 图注：图 7：一种选择性精度实现，假定所选容量充足。原始 BF16 隐藏态直接进入 Dispatch；Router 的 FP32 路径只产生路由数值与索引。原始 logits 另行分支到 z-loss，得到标量正则。图示输出 $Y$ 是前馈映射，外层残差另计。
- 原第 287 行 `./images/redrawn-fig-moe-token-overflow-v2.png`：固定容量Top1的五个token、三个gate与残差相加及两条直通路径
  - 图注：图 8：Router 对五个 token 都选 Expert 1，示例 gate 为 $0.8$，容量为 $C=3$，按输入顺序接收 Token 1–3。三个 $E_1(u_i)$ 是同一组 FFN 参数对不同 token 的计算；Token 4、5 的专家分支被跳过。五个输入与五个输出的位置保持对应。
- 原第 319 行 `./images/redrawn-fig-moe-vram-sparse-vs-active-v2.png`：单层MoE的全部权重驻留、三条参数读取与完整隐藏态和gate计算路径
  - 图注：图 9：单个 MoE FFN 层，$N=8,K=2$，本层 Router 与全部专家权重驻留同一 GPU。存储块 $W_i$ 表示参数集合，$E_i$ 表示使用这些参数的计算；权重读取、隐藏态和路由记录使用不同连线。
- 原第 341 行 `./images/redrawn-fig-deepseekmoe-panels-v2.png`：相同专家预算下宽专家、细粒度与共享专家的完整路由及残差对照
  - 图注：图 10：采用 $N=4,K=2,m=2,N_s=1$ 的示意配置。宽专家激活 2 路；中间维减半后激活 4 路；加入共享专家后保持 1 路共享＋3 路路由。三种配置的总专家中间宽度均为 $4H$，每 token 激活中间宽度均为 $2H$。
- 原第 357 行 `./images/redrawn-fig-moe-upcycling-init-v2.png`：Upcycling参数初始化：沿用部分复制、四份独立专家副本、随机Router与全模型继续训练
  - 图注：图 11A：以一个选中层的两层 MLP 扩为四个专家为例，$d_{\mathrm{model}},d_{\mathrm{ff}}$ 对应后文的 $d,H$。箭头表示参数初值复制、随机初始化和训练流程；每个被改造的层使用自己对应的 Dense FFN 参数。具体模型的完整 FFN 参数组都要复制，包含 bias 或门控投影时也应一并处理。
- 原第 367 行 `./images/redrawn-fig-moe-upcycling-dense-block-v2.png`：原Dense block完整前向：Attention全段上下文、X与u_t的两次残差及FFN输入
  - 图注：图 11B：原 Dense block 的完整主干。Attention 读取整段 $X\in\mathbb R^{T\times d}$；图中展开第 $t$ 行的 FFN 与输出。第一次残差取原始 $X$，第二次取该行归一化前的 $u_t$。
- 原第 385 行 `./images/redrawn-fig-moe-upcycling-forward-v2.png`：Upcycling后MoE完整block主干与节点9的Router分发专家门控加权求和展开定义
  - 图注：图 11C：MoE block 保留两次残差，只将 FFN 位置替换成 $f_M=M(a_t)$。节点 9 的展开定义给出同一运算的完整内部路径，接口仍为 $a_t\in\mathbb R^d\mapsto f_M\in\mathbb R^d$；灰色关联线表示展开定义。四个专家、Top-2 是说明性配置。与图 11B 对照时使用同一输入和复制后的初值，两模型分别持有各自参数。
- 原第 417 行 `./images/redrawn-fig-vit-patches-v2.png`：ViT的16个patch行优先展平共享投影CLS拼接位置相加与17个Encoder输出位置
  - 图注：图 12：以带 CLS 的 ViT 入口为例。$4\times4$ 共 16 个 patch，前置一个可学习 CLS 后，Encoder 的序列长度为 17；其中 16 个位置仍对应 patch。$P$ 表示 patch 边长，$C$ 表示通道数，$D$ 表示 embedding 维度。
- 原第 431 行 `./images/redrawn-fig-vmoe-priority-v2.png`：V-MoE BPR的16条Router记录、Top1与Top2两轮排序、容量状态及完整加权回写
  - 图注：图 13：自构的完整 Top-2 数值例子。一个路由组含 $T=16$ 个 patch token、$E=4$ 个专家、$k=2$，容量比 $C=0.75$，所以每个专家的 buffer 容量为 6。绿色和红色分别表示该次派遣被接收或跳过，不表示 patch 的语义类别。
- 原第 462 行 `./images/redrawn-fig-soft-moe-v2.png`：SoftMoE同源打分的Dispatch列归一化、Combine行归一化与多slot专家路径
  - 图注：图 14：$T=3,N=2,p=2,M=4$ 的非因果前馈示例。三个 token 汇聚为四个 slot，每个专家处理两个 slot，再按原 slot 顺序堆叠输出，并混合回三个 token。$D$ 与 $C$ 来自同一打分矩阵，归一化方向不同。

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.2-状态空间模型SSM/2.4.2-状态空间模型SSM.md`

- 原第 47 行 `./images/redrawn-fig-ssm-continuous-discrete-kernel.png`：连续 SSM → ZOH 离散 → LTI 时的卷积核.B/C/Δ 一旦依赖 x_t,全局核就没了
  - 图注：图 1:本篇的度量零点.三块是同一套线性系统的三种写法;脚注是 Mamba 为什么必须放弃 FFT.

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.3-Mamba系列/2.4.3-Mamba系列.md`

- 原第 34 行 `./images/redrawn-fig-mamba-selection.png`：$\Delta_t,B_t,C_t$ 从 $x_t$ 来;大步长写入,小步长跳过
  - 图注：图 1:选择机制.公式在 2.4.2;本图只画「这一 token 写不写进状态」.

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.4-线性RNN与Griffin/2.4.4-线性RNN与Griffin.md`

- 原第 46 行 `./images/redrawn-fig-rwkv-wkv-state.png`：token-shift → r,k,v → 状态 a,b → $W_o(\sigma(r)\odot wkv)$.状态不随生成长度涨
  - 图注：图 1:RWKV-4 推理单元.对照 [2.3.4 的三栏图](../../2.3-高效与稀疏注意力/2.3.4-高效注意力全景综述/2.3.4-高效注意力全景综述.md)(softmax 网格 vs 通道衰减 vs RNN).

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.5-新兴架构与混合模型/2.4.5-新兴架构与混合模型.md`

- 原第 11 行 `./images/redrawn-fig-hybrid-linear-sparse-attn.png`：多数层走线性 / SSM / GLRU;少数层保留 softmax,KV 只在这些层涨
  - 图注：图 1:混合的最小图画.左注针对绿层:状态 $O(d)$,不随已生成长度涨;橙层仍有 KV,只是层数少.

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP深度解析.md`

- 原第 34 行 `./images/redrawn-fig-mtp-predict-d-tokens.png`：主模型预测 $t_{i+1}$;MTP 模块吃 $h_i$ 与 $t_{i+1}$ 的嵌入再预测 $t_{i+2}$.不是 Meta 的并行头
  - 图注：图 1:顺序 MTP.$h_i$ 从主模型 **最后一块** 引出(V3 的 $\mathbf{h}_i^0$).灰叉:独立多头方案.底注:V3/V4 保留这套;EAGLE-3 微调是 K3.

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.7-扩散语言模型DLM指针.md`

- 原第 29 行 `./images/redrawn-fig-dlm-mask-vs-ar.png`：左:自回归一位一位填;右:从全 MASK 反向同时揭开多处
  - 图注：图 1:掩码扩散 vs 自回归.脚注:MTP 仍是左到右;DLM 换的是生成过程.

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.8-条件记忆与Engram/01-Engram-从Ngram到可扩展查找/01-Engram-从Ngram到可扩展查找.md`

- 原第 96 行 `./images/redrawn-fig-engram-ngram-hash-v2.png`：当前时刻的 2-gram 与 3-gram 后缀经 tokenizer compression、多头哈希和 O(1) row lookup，拼接为 $e_t$
  - 图注：图 1：位置 $t$ 只形成一个 2-gram key 与一个 3-gram key；每个 key 经 $K$ 个独立 hash heads 得到 index，各自读取对应表的一行，最后拼接为 $e_t\in\mathbb R^{d_{\mathrm{mem}}}$。
- 原第 196 行 `./images/redrawn-fig-engram-gate-residual-v2.png`：Engram memory prior 与四路 mHC hidden states 计算 branch-specific gates，经局部卷积后逐分支注入 residual
  - 图注：图 2：一次 Engram insertion 中，$e_t$ 生成跨分支共享的 $v_t$ 与四个 branch-specific $k_t^{(m)}$；每路 $h_t^{(m)}$ 产生自己的 $\alpha_t^{(m)}$，局部卷积后的 $Y^{(m)}$ 再逐分支加回 mHC streams。
- 原第 250 行 `./images/redrawn-fig-engram-host-prefetch-v2.png`：Engram 训练期 row-sharded table 的 forward 与 backward 单向通信，以及推理期 Host gather、异步 H2D 与 Layer 1 compute overlap
  - 图注：图 3：训练期将 requested indices、active rows 与 row gradients 分成三段单向通信；推理期地址在 Host 侧提前确定，active rows 经 PCIe 异步进入 GPU staging，并与 Layer 1 Attention + MoE 重叠。

## `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.9-循环Transformer/01-Loop-Transformer-层重复用/01-Loop-Transformer-层重复用.md`

- 原第 44 行 `./images/redrawn-fig-loop-untied-vs-looped.png`
  - 图注：图 1:左栏四层四套权重;右栏两个物理块转两轮,展开深度 $N=4$,参数只存 $K=2$.
- 原第 72 行 `./images/redrawn-fig-loop-not-three.png`
  - 图注：图 2:左栏沿深度转同一套块;中栏沿 token 时间步进;右栏把思维写成新 token.三条轴共用「循环」这个词,对象不是同一个.
- 原第 172 行 `./images/redrawn-fig-loop-latent-vs-cot.png`
  - 图注：图 3:上栏 CoT 把 thought token 写入上下文;下栏同一段残差状态转 $R$ 圈,序列长度不变.
- 原第 224 行 `./images/redrawn-fig-loop-huginn-sandwich.png`
  - 图注：图 4:token 经 prelude 得 $e$,适配器拼接 $s$ 与 $e$,4 层核循环 $r$ 次,coda 出 logits.
- 原第 309 行 `./images/redrawn-fig-deeploop-residual-scale.png`
  - 图注：图 5:$K=2$ 存一份,展开 $N=6$($R=3$),$M=12$ 次子层访问;右侧对照 DeepNorm 的 $p=1/4$ 与 DeepLoop 的 $p=1/2$.

## `content/llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/01-位置编码与外推.md`

- 原第 200 行 `images/redrawn-ape_vs_rope_comparison.png`：绝对位置编码 (APE) 与旋转位置编码 (RoPE) 的对比
  - 图注：**图 3.1 绝对位置编码 (APE) 与旋转位置编码 (RoPE) 的物理机制对比**
  - 图注：* **左侧(绝对位置编码 APE)**:每个 Token 的位置信息被映射为坐标空间中一个固定的绝对坐标点(如公式 3 和 4 所示). 当序列长度超出训练的最大区间 $L_{train}$ 时, 新位置点(如 $p_{10000}$)在向量空间中表现为无规律的随机噪点(虚线表示的未知区域), 导致模型失去方向感.
  - 图注：* **右侧(旋转位置编码 RoPE)**:位置信息通过在多个二维复平面上的逆时针旋转来表达(如同心圆拨盘所示). 对于任意两个位置 $m$ 与 $n$, 它们被旋转了各自角度($m\theta_i$ 与 $n\theta_i$). 它们的相对位置关系体现在旋转的角度差值 $(m-n)\theta_i$ 上. 由于角度差与绝对位置无关, 因此即使外推到未知区间, 相对距离的数学结构依然完好(如公式 22 所示).
- 原第 398 行 `images/redrawn-rope_high_dim_rotation.png`：RoPE 的高维旋转分解机制示意图
  - 图注：**图 3.2 RoPE 的高维空间正交二维子空间分解与旋转点积机制**
  - 图注：* **左侧(高维向量的 2D 平面切分)**:根据公式 24, 一个 $d$ 维输入向量在物理上被拆分为 $d/2$ 个相互正交的二维子空间(平面). 每个平面对应一个独特的频率分量 $\theta_i$.
  - 图注：* **高频平面 0(最上方)**:基准转速 $\theta_0$ 较大, 代表局部细节. 随着位置递增, 向量在该平面上旋转的角度变化剧烈(圆弧较长).
  - 图注：* **低频平面 $d/2-1$(最下方)**:基准转速 $\theta_{d/2-1}$ 极慢(接近 $1/10000$), 代表全局趋势. 向量在该平面上旋转缓慢(圆弧极短).
  - 图注：* **右侧(点积的夹角不变性)**:当计算位置 $m$ 的 Query 与位置 $n$ 的 Key 的内积时, 这相当于计算它们在每个二维子空间上的内积之和(如公式 31 所示). 在每个二维平面上, 旋转后的向量夹角恰好是它们的相对旋转角度差 $(m-n)\theta_i$. 因为两向量点积的值只取决于它们的长度和相对夹角, 所以最终累加的注意力打分只受到相对位置 $m-n$ 的约束, 实现了高维空间中优雅的相对位置感知.
- 原第 1127 行 `images/redrawn-rope_frequency_scaling.png`：RoPE 频率缩放方案对比双对数坐标图
  - 图注：**图 5.1 RoPE 不同长度外推方案的频率缩放曲线对比(双对数坐标系)**
  - 图注：* **X 轴(维度组索引 $i$)**:从 $i=0$ 到 $d/2$. 代表向量的频带分布, 左侧为高频(局部特征), 右侧为低频(全局特征).
  - 图注：* **Y 轴(旋转频率 $\theta_i$)**:对应的旋转频率(对数尺度).
  - 图注：* **三条频率曲线对比**:
  - 图注：* **原始 RoPE 频率(Original, 上方直线)**:呈现指数衰减规律(如公式 23 所示, 在对数坐标中表现为斜向下的直线).
  - 图注：* **线性插值频率(Linear Interpolation, 下方平行线)**:整体乘以常数 $1/s$(如公式 36 所示), 在对数坐标中表现为原直线平行下移. 高频和低频被等比例压缩, 导致高频部分局部信息混淆.
  - 图注：* **NTK-Aware 频率(NTK-Aware, 中部弯曲曲线)**:根据公式 68 计算得出. 在高频部分($i \to 0$), 曲线与原始 RoPE 频率完全重合, 表明高频未被压缩, 保留了局部位置的敏锐度; 在低频部分($i \to d/2$), 曲线逐渐向下弯曲并贴合线性插值曲线, 保证了低频的线性拓展以支持更长的总上下文窗口.

## `content/llm-guide/3-预训练/3.1-预训练数据/3.1-预训练数据.md`

- 原第 46 行 `./images/fig-data-sources-spectrum-v2.png`：预训练数据来源与信号
  - 图注：图 1:五类来源指向不同能力.示意,不是量化雷达图.
- 原第 84 行 `./images/fig-data-cleaning-pipeline-v2.png`：清洗流水线
  - 图注：图 2:清洗顺序示意.
- 原第 119 行 `./images/fig-tokenization-vocab-v2.png`：词表大小与切分
  - 图注：图 3:小词表 vs 大词表的切分示意,不是某一条句子的官方 tokenize 输出.
- 原第 132 行 `./images/fig-data-governance-v2.png`：风险与治理
  - 图注：图 4:来源风险与治理动作.后训练对齐是下游盾,不是清洗的替代.

## `content/llm-guide/3-预训练/3.1-预训练数据/3.1.1-预训练数据收集/3.1.1-预训练数据收集.md`

- 原第 13 行 `./images/fig-grokking-schematic-v2.png`
  - 图注：图 1:Grokking 示意(记忆平台 → 陡升 → 泛化).任务是模运算一类小问题,不是网页语料收集.
- 原第 19 行 `./images/fig-data-collection-pipeline-v2.png`
  - 图注：图 2:收集之后的标准顺序.
- 原第 41 行 `./images/fig-opencsg-chinese-corpus-v2.png`
  - 图注：图 3:三条构造路径示意.

## `content/llm-guide/3-预训练/3.1-预训练数据/3.1.2-数据蒸馏/3.1.2-数据蒸馏.md`

- 原第 20 行 `./images/fig-teacher-synthetic-corpus-v2.png`
  - 图注：图 1:语料蒸馏主路径.
- 原第 38 行 `./images/fig-kd-three-paradigms-v2.png`
  - 图注：图 2:离线(教师已训完),在线(师生同训),自蒸馏(同一套网).Gou et al., 2021 综述口径.

## `content/llm-guide/3-预训练/3.1-预训练数据/3.1.3-数据处理/3.1.3-数据处理.md`

- 原第 11 行 `./images/fig-data-processing-levers-v2.png`
  - 图注：图 1:配比 / 合成 / 质量.图内公式是示意权重,不是某一篇论文的编号式.

## `content/llm-guide/3-预训练/3.2-预训练全流程/3.2.4-预训练策略/3.2.4-预训练策略.md`

- 原第 30 行 `./images/fig-lr-cosine-wsd-v2.png`
  - 图注：图 1:余弦(warmup 后立刻进入长衰减)vs WSD(平台期后再衰减).示意,不是论文坐标描摹.

## `content/llm-guide/3-预训练/3.2-预训练全流程/3.2.7-继续预训练/3.2.7-继续预训练.md`

- 原第 32 行 `./images/fig-cpt-vs-sft-v2.png`
  - 图注：图 1:CPT 对序列所有位置做 next-token;SFT 通常 mask 掉 prompt,只在回答上计损失.二者都可以用 AdamW,数据与掩码不同.

## `content/llm-guide/3-预训练/3.4-预训练评估/3.4.1-困惑度-PPL/3.4.1-困惑度-PPL.md`

- 原第 13 行 `./images/fig-ppl-candidate-set-v2.png`：PPL 是评估集合上的平均不确定度；均匀分布下的十个等可能候选只是直觉例子
  - 图注：图 1:均匀近似下,PPL 可理解为等效候选集大小.示意图,不是某次 softmax 的实测柱.

## `content/llm-guide/3-预训练/3.4-预训练评估/3.4.3-大海捞针测试/3.4.3-大海捞针测试.md`

- 原第 23 行 `./images/fig-niah-protocol-v2.png`：NIAH 协议：将唯一事实插入不同深度的长上下文，询问事实内容并按答案匹配评分
  - 图注：图 1:NIAH 是插入事实,提问,二分打分.不是准确率热力图,纵轴也没有伪造的 0–100%.(协议示意)

## `content/llm-guide/3-预训练/3.4-预训练评估/3.4.4-特定能力评估/3.4.4-特定能力评估.md`

- 原第 28 行 `./images/fig-pass-at-k-v2.png`
  - 图注：图 1:$n$ 个样本里 $c$ 个过单测,再对 $k$ 做组合修正.Chen et al. (2021) 式 (1).不是模型分数条.

## `content/llm-guide/4-后训练/4.6-OPD/01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md`

- 原第 34 行 `./images/opd_signal_paths-v3.png`：SFT、RL 与 OPD 在状态来源、奖励密度、教师分布和梯度消费者上的数据流差异
  - 图注：*图：SFT 使用固定/教师前缀；RL 使用学生 rollout 但通常只有轨迹级标量；OPD 在学生自己的前缀上查询冻结教师的逐 token 分布，只更新学生。*
- 原第 218 行 `./images/fig-on-policy-vs-off-policy-sampling-v2.png`：离策略蒸馏使用固定的教师或数据轨迹，OPD 则在学生实际访问的前缀上由冻结教师提供逐 token 全词表监督
  - 图注：图 1:训练状态从哪来.左:off-policy KD,学生在教师或数据集给出的固定前缀上匹配.右:OPD,学生自己采样,冻结教师在同一学生前缀上给密集 logits / KL,梯度只更新学生.

## `content/llm-guide/4-后训练/4.6-OPD/01-OPD基础原理/01-OPD基础原理.md`

- 原第 210 行 `./images/fig-on-policy-vs-off-policy-sampling.png`：Off-policy KD trains on teacher prefixes; OPD trains on student prefixes with teacher logits
  - 图注：图 1：采样从哪来。左：off-policy KD，学生只在教师（或数据集）前缀上匹配。右：OPD，学生自己采样，教师在学生前缀上给密集 logits / KL。红标 **NOT**：不是 DPO，不是 Online Preference。2026-08 自绘；示意，不是论文 Figure。

## `content/llm-guide/4-后训练/4.6-OPD/02-OPSD-参考解自蒸馏/02-OPSD-参考解自蒸馏.md`

- 原第 32 行 `./images/opsd_open_book-v3.png`：OPSD 特权上下文自蒸馏：学生唯一采样，冻结教师在同一学生前缀上 prefill，Forward KL 只更新学生
  - 图注：*图：Student 只看问题并生成 on-policy rollout；冻结在 $\theta_{\mathrm{init}}$ 的 Teacher 额外读取参考解，但只在同一学生前缀上 prefill，Forward KL 的梯度仅回传 Student。*
- 原第 253 行 `./images/fig-opsd-open-closed-v2.png`：学生仅凭题目采样一次在线轨迹，冻结的初始教师在同一前缀上结合参考解做 prefill，前向 KL 的梯度只更新学生
  - 图注：图 1:开卷教师 vs 闭卷学生.对应论文 Figure 1.
- 原第 294 行 `./images/fig-opsd-algorithm-v2.png`：OPSD Algorithm 1：学生唯一采样、同一学生前缀双路前向、全词表 Forward KL 逐项裁剪后仅更新学生
  - 图注：图 2：在每个学生前缀位置，冻结 Teacher 与可训练 Student 产生整张词表分布；Teacher 加权的 Forward-KL 贡献先按 $(n,v)$ pointwise clip，再聚合并只更新 Student。

## `content/llm-guide/4-后训练/4.6-OPD/02-OPSD-自蒸馏/02-OPSD-自蒸馏.md`

- 原第 253 行 `./images/fig-opsd-open-closed.png`：同一套权重：闭卷学生只看题生成，开卷教师看参考解却只做 prefill，散度只沿学生轨迹回传
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Two-column OPSD: student p_S(x) closed-book generates y-hat; teacher p_T(x,y*) open-book prefill only; D(p_T || p_S); gradient only through student.
- 原第 296 行 `./images/fig-opsd-algorithm.png`：Algorithm 1：学生采样、双路前向、全词表散度、词表维 clip、只更新学生且教师冻在 theta init
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Five-box Algorithm 1: sample y-hat; dual forward; full-vocab D; pointwise clip; update student, freeze teacher.

## `content/llm-guide/4-后训练/4.6-OPD/03-SDFT-示范持续学习/03-SDFT-示范持续学习.md`

- 原第 39 行 `./images/sdft_continual_learning-v4.png`：SDFT 学生唯一采样、示范只进 EMA Teacher、逐 token 蒸馏、Student 更新与 EMA 参数回路
  - 图注：*图：Student 只看 $x$ 与自己的前缀；EMA Teacher 额外读取 demonstration $d$。$p_T$ stop-gradient，Student 更新后的 $\theta_{\mathrm{new}}$ 与 previous $\phi$ 共同产生下一步 Teacher $\phi_{\mathrm{next}}$；能力探针只评估。*
- 原第 286 行 `./images/fig-sdft-student-teacher-v2.png`：学生只看问题采样一次轨迹，同一前缀分别由学生和带示范上下文的 EMA 教师评分，蒸馏梯度只更新学生
  - 图注：图 1:示范条件化教师 vs 闭卷学生.对应论文 Figure 2(左).
- 原第 321 行 `./images/fig-sdft-algorithm-v2.png`：SDFT 算法数据流：学生单次采样，同一前缀双路评分，逐 token 全词表蒸馏只更新学生，再用新学生参数更新 EMA 教师
  - 图注：图 2:Algorithm 1 数据流.Box 3 的 $D$ 左右以式 (R3) 的 $D(\pi_\theta\|\pi_T)$ 为准;实践可换成 Forward.

## `content/llm-guide/4-后训练/4.6-OPD/03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md`

- 原第 286 行 `./images/fig-sdft-student-teacher.png`：学生只看 x 采样，EMA 教师看 x 和示范 d 只做 prefill，散度只沿学生回传
  - 提示词：Prompt: LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels, NEVER inverted colors. white academic background, no watermark, no logo, no copyright text, no website URL. Two-column SDFT: student p(y|x) samples y; EMA teacher pi(·|x,d) prefill only; reverse-KL on student prefix; gradient only through student.
- 原第 323 行 `./images/fig-sdft-algorithm.png`：Algorithm 1：学生采样、双路前向、词表 KL、只更新学生、EMA 教师
  - 提示词：Prompt: LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels, NEVER inverted colors. white academic background, no watermark, no logo, no copyright text, no website URL. Five-box Algorithm 1: sample y from student; dual forward with EMA teacher on (x,d); analytic per-token KL; update student; EMA phi.

## `content/llm-guide/4-后训练/4.6-OPD/04-SDPO-环境反馈蒸馏/04-SDPO-环境反馈蒸馏.md`

- 原第 42 行 `./images/sdpo_rich_feedback-v4.png`：SDPO 单次 rollout、环境 rich feedback、同权重双角色重算与只回学生的 token-level 分布指导
  - 图注：*图：模型只采样一次 $y$；环境返回 $f$ 后，同一 $y$ 分别由不看 $f$ 的 Student 与看见 $f$ 的 self-teacher 重算，$p_T$ stop-gradient，梯度只更新 Student。*
- 原第 197 行 `./images/fig-sdpo-rlvr-vs-rlrf-v2.png`：RLVR 用环境标量奖励驱动策略梯度，SDPO 则复用学生轨迹与环境反馈，让冻结自教师给出逐 token 全词表分布并只更新学生
  - 图注：图 6:RLVR 对 RLRF.对应论文 Figure 2 的信息瓶颈,加上 Figure 4 / 9 的逐位置同意–反对.
- 原第 241 行 `./images/fig-sdpo-self-teacher-loop-v2.png`：SDPO Algorithm 1：单次 rollout、环境反馈、同一上下文双前向和仅更新学生的数据流
  - 图注：图 7：同一 $x/y$ 前缀分别进入 Student 与 feedback-conditioned self-teacher；环境只提供 $f$，Teacher 输出 stop-gradient，KL/JS 的梯度只更新 Student。第三步不重新采样。

## `content/llm-guide/4-后训练/4.6-OPD/04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md`

- 原第 197 行 `./images/fig-sdpo-rlvr-vs-rlrf.png`：RLVR 整条轨迹共用一个标量优势，SDPO 用自教师按 token 同意或反对
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Two columns: RLVR same A for all tokens vs RLRF self-teacher logit-level A.
- 原第 243 行 `./images/fig-sdpo-self-teacher-loop.png`：采样、环境反馈、同权重重算 log-prob、KL 蒸馏四步
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Four-box Algorithm 1 pipeline.

## `content/llm-guide/4-后训练/4.6-OPD/05-GOPD-散度光谱/05-GOPD-散度光谱.md`

- 原第 27 行 `images/opd_family_tree-v3.png`：OPD、OPSD、SDFT、SDPO 与 G-OPD 在状态来源、教师上下文、反馈、散度和目标构造上的横向坐标比较
  - 图注：**图 5.1 OPD 方法坐标（横向比较，不作谱系断言）**
  - 图注：表格把五种方法放在相同维度下比较.OPSD 使用冻结初始自教师和特权参考;SDFT 使用带示范的 EMA 教师;SDPO 使用环境 rich feedback 条件化的自教师;G-OPD 则用教师先验与reward构造增强目标并选择 f-散度.这些是机制坐标,不是“第几代”或相互派生关系.
  - 图注：下方只展示本文明确给出的 G-OPD 构造:教师先验、reward 与 $\lambda$ 形成 $q_\lambda$,再用选定散度匹配学生.$\lambda\to\infty$ 的均匀目标极限与显式reward驱动的纯RL保持分开.
- 原第 79 行 `images/gopd_assumptions-v2.png`：基础 OPD 到 G-OPD 的三项变化：固定教师目标改为 reward 增强目标，固定 Reverse KL 改为可选 f-散度，并由 λ 控制增强目标温度
  - 图注：**图 5.2 基础 OPD 与 G-OPD 的目标、散度和温度对比**
  - 图注：基础 OPD 直接匹配冻结教师分布,通常使用固定的 Reverse KL,没有增强目标温度.G-OPD 则先用教师先验与reward构造 $q_\lambda$,再用选定的 f-散度匹配学生分布.$\lambda$ 控制的是 $q_\lambda$ 的温度:较小值使目标更尖锐,较大值使目标更平坦.
  - 图注：在教师概率为正且reward固定有界时,$\lambda\to\infty$ 令 $q_\lambda$ 趋于均匀;要还原基础 OPD,还需 $\lambda=1$、$R=0$ 并选择 Reverse KL.这些结论本身不推出多教师冲突处理、学生必然超越教师或纯RL.
- 原第 126 行 `images/gopd_timeline-v2.png`：从固定教师 Reverse KL 到 reward 增强目标、f-散度选择，再到监控门控与反馈扩展的方法设计逻辑；不作年代、优先权或机构采用断言
  - 图注：**图 2.2 G-OPD 的方法演进逻辑（非年代断言）**
  - 图注：这张图只表示可组合的设计步骤:先在学生在线状态上匹配冻结教师,再把reward纳入增强目标,随后选择 f-散度,最后补充验证监控、失败门控或额外反馈机制.箭头表示设计依赖,不代表论文优先权、发布日期或机构采用.
  - 图注：$\lambda$ 在本文构造中控制增强目标温度;$\lambda\to\infty$ 只使 $q_\lambda$ 趋于均匀,不单独推出纯RL.
- 原第 159 行 `images/gopd_dashboard-v2.png`：基础 OPD 与 G-OPD 的可控量和可观测量：教师先验与奖励构造增强目标，学生分布与目标进入选定散度，梯度只更新学生
  - 图注：**图 3.1 从基础 OPD 到 G-OPD 的数据流与控制面板**
  - 图注：左侧基础 OPD 在学生在线状态上匹配冻结教师,固定使用 Reverse KL.右侧 G-OPD 增加逐 token reward、增强目标 $q_\lambda$、温度 $\lambda$ 和散度选择 $f$;教师与目标路径停止梯度,损失只更新学生.
  - 图注：可控参数必须与可观测信号配套:目标/学生熵、学生—目标散度、reward/KL、输出长度、梯度范数与异常率.还原基础 OPD 需要 $\lambda=1$、$R=0$ 且选择 Reverse KL;$\lambda\to\infty$ 本身只推出均匀目标.
- 原第 309 行 `images/f_divergences_plot-v2.png`：以教师为 P、学生为 Q 的五种 f-散度生成函数：公式、尾部行为与无数值刻度的凸性示意
  - 图注：**图 4.1 f-散度生成函数的公式与尾部行为**
  - 图注：图中固定 $P=\pi_T$、$Q=\pi_\theta$、$u=P/Q$.Forward KL 对应 $D_{KL}(P\|Q)$;Reverse KL 对应 $D_{KL}(Q\|P)$.所有曲线都采用不改变散度的居中等价形式,在 $u=1$ 取最小值0.右侧曲线只示意凸性和尾部方向,不表示数值比例.
  - 图注：标准 JS 生成函数包含 $1/2$ 归一化,其散度上界为 $\log2$;TV 散度上界为1.二者的散度有界,但图示生成函数随 $u\to\infty$ 仍可无界增长.
- 原第 364 行 `images/equation_transition-v2.png`：基础 OPD 到 G-OPD 的两项推广：可选 f-散度，以及由冻结教师先验和奖励构造增强目标；散度梯度只更新学生
  - 图注：**图 4.2 基础 OPD 到 G-OPD 目标函数公式演进对比**
  - 图注：* **基础 OPD 目标(左侧红色框)**:
  - 图注：* 目标公式:$\mathcal{L}_{OPD} = \mathbb{E} [ D_{KL}(\pi_\theta \| \pi_T) ]$
  - 图注：* 限制性元素:硬编码的 $D_{KL}$(仅能使用 Reverse KL 散度进行对齐,易发生高熵病态偏离)与唯一的静态教师分布 $\pi_T$.
  - 图注：* **数学转换步骤(中间紫色箭头)**:
  - 图注：* **步骤一:散度泛化(Divergence Generalization)**:将单一的 KL 散度扩展为更通用的 f-散度族 $D_f$,允许选择 JS,TV 或 $\chi^2$ 散度.
  - 图注：* **步骤二:奖励注入与 $\lambda$ 缩放(Reward Shaping & λ-scaling)**:在对数概率空间中将教师先验与标量 Reward $R(a,s)$ 以逆温度 $1/\lambda$ 为权重进行几何加权融合.
  - 图注：* 融合后构成**增强教师**(Augmented Teacher):$\pi_T^{(\lambda)} \propto \pi_T^{1/\lambda} \cdot e^{R/\lambda}$.
  - 图注：* **G-OPD 广义目标(右侧绿色框)**:
  - 图注：* 目标公式:$\mathcal{L}_{G\text{-}OPD} = \mathbb{E} [ D_f(\pi_\theta \| \pi_T^{(\lambda)}) ]$
  - 图注：* 优势:通过调节 $\lambda \in (0, +\infty)$,学生模型可在"保守模仿"与"超越教师的奖励探索"之间平滑切换.
- 原第 491 行 `images/gopd_phase_transition-v2.png`：G-OPD 温度参数连续谱：六个 λ 锚点展示增强教师分布从尖锐到均匀的变化，并区分均匀目标极限与纯 RL
  - 图注：**图 4.3 $\lambda$ 连续相变温度谱与增强教师概率分布变化**
  - 图注：* **横轴与相变区域**:
  - 图注：* ** 固态/冻结区($\lambda < 1$ 冰蓝色区域)**:约束强度极高. 教师和奖励的最优方向被极度放大. 对应的概率分布柱状图(如 $\lambda=0.1$ 和 $\lambda=0.5$)显示,绝大部分概率质量均集中在最优动作 A 上,低先验或零奖励的动作(B,C)基本被冻结出局.
  - 图注：* ** 液态/平衡区($\lambda \approx 1$ 绿色区域)**:这是教师先验与环境奖励的自然温度融合.数值卡在 $\lambda=1.0$ 时给出 A/B/C 约为 $0.662/0.241/0.097$;有非零reward时这是增强目标,只有 $R=0$ 时才还原原教师.
  - 图注：* ** 气态/探索区($\lambda > 1$ 橙黄色区域)**:教师先验和奖励差异都被温度缩小.数值卡(如 $\lambda=5.0$ 和 $\lambda \to \infty$)显示分布逐渐变平,最终趋于均匀分布 $[0.33, 0.33, 0.33]$.这只证明增强目标的均匀极限;纯奖励驱动还需要另设显式reward目标与权重调度.
- 原第 601 行 `images/gopd_funnels-v2.png`：固定教师先验与奖励下，G-OPD 增强目标随 λ 从尖锐分布逐渐变为均匀分布；该示意不代表真实优化损失地形
  - 图注：**图 4.4 G-OPD 增强目标分布的温度直觉**
  - 图注：四张卡片只示意 $q_\lambda\propto\exp((\log\pi_T+R)/\lambda)$ 的分布形状:较小 $\lambda$ 使联合高分 token 更集中;$\lambda=1$ 是自然温度融合,只有 $R=0$ 时才还原原教师;$\lambda>1$ 逐渐拉平;在有限词表、教师全支撑且reward固定有界时,$\lambda\to\infty$ 趋于均匀.
  - 图注：这不能解释为损失曲率自动变平,也不能单凭该极限推出纯RL.纯RL还需要另设显式reward目标,并调度蒸馏项的权重.
- 原第 794 行 `images/stacked_probability_plot-v3.png`：教师分布 0.5/0.3/0.2 与奖励 1/0.5/0 下，五个 λ 锚点的增强目标精确概率卡
  - 图注：**图 5.3 增强目标概率随 $\lambda$ 的离散数值走查**
  - 图注：五张100%条带直接列出复算值:$\lambda=0.5$ 时为 $[0.866,0.115,0.019]$;$\lambda=1$ 时为 $[0.662,0.241,0.097]$;$\lambda=2$ 时为 $[0.503,0.304,0.193]$;$\lambda=5$ 时为 $[0.400,0.327,0.273]$;极限为 $[1/3,1/3,1/3]$.三位小数独立舍入时总和可能显示为0.999.
  - 图注：$\lambda=1$ 且reward非零时不等于原教师;$\lambda\to\infty$ 得到均匀增强目标,不等于纯RL.
- 原第 1022 行 `images/gopd_code_flow-v2.png`：G-OPD 训练数据流：学生在线采样，同一轨迹分别得到学生分布和冻结教师分布，教师分布与奖励构造增强目标，散度梯度只更新学生
  - 图注：**图 6.1 G-OPD PyTorch 训练流水线流程图**
  - 图注：* **输入阶段(左侧列)**:
  - 图注：* **Student Model $\pi_\theta$(蓝色框)**:提供当前模型的采样和梯度更新参数(代码行号:Line 713).
  - 图注：* **Teacher Model $\pi_T$(灰色框)**:提供静态教师的原始 logits(代码行号:Line 722).
  - 图注：* **Reward Vector $R(a,s)$(橙色框)**:代表环境或规则的即时奖励向量(代码行号:Line 723).
  - 图注：* **处理步骤(中间列)**:
  - 图注：* **步骤一:On-Policy 采样(蓝色路径)**:使用学生模型自身参数生成轨迹 $s_t \sim \pi_\theta$,解决 Exposure Bias 难题(代码行号:Line 732-740).
  - 图注：* **步骤二:动态构建增强教师(橙色路径)**:融合教师先验与奖励信号,生成对齐目标 $\pi_T^{(\lambda)} \propto \pi_T^{1/\lambda} \cdot e^{R/\lambda}$(代码行号:Line 747-754).
  - 图注：* **步骤三:计算广义散度损失(紫色框)**:计算学生分布与增强教师之间的 f-散度损失 $L = D_f(\pi_\theta \| \pi_T^{(\lambda)})$,可自适应选择 KL/JS/TV 等度量(代码行号:Line 756-760).
  - 图注：* **输出阶段(右侧列,绿色框)**:
  - 图注：* **Loss & Gradients**:输出对齐损失值并执行反向传播 `loss.backward()` 计算梯度(代码行号:Line 763).
- 原第 1103 行 `images/gopd_risk_map-v2.png`：G-OPD 的 λ 风险监控：较小 λ 使增强目标变尖，较大 λ 使其变平；选择参数应依据验证指标、熵、长度、reward/KL 与梯度
  - 图注：**图 7.1 G-OPD 的 $\lambda$ 温度风险与监控信号**
  - 图注：这是一张**定性检查表**,不是已知的风险函数,也不存在跨任务通用的“最优 $\lambda$ 区间”.较小 $\lambda$ 会放大 $\log \pi_T+R$ 的差异,使增强目标过尖;较大 $\lambda$ 会把增强目标拉平,蒸馏项可能偏向高熵.两端的实际风险都取决于教师、reward 标度、散度选择、数据和优化器.
  - 图注：调参时应同时看验证集任务指标、目标与学生熵、support/最小概率、生成长度、reward/KL、梯度范数和异常率.对式 (13)/(23),$\lambda\to\infty$ 只推出增强目标趋于均匀;reward hacking 或纯 RL 行为只有在另设显式reward目标时才成立.
- 原第 1148 行 `images/gopd_roadmap-v2.png`：G-OPD 工程验证路线：先复现基线，再做目标、散度和 λ 消融，随后建立安全门控，最后独立验证扩展假设
  - 图注：**图 8.1 G-OPD 工程验证路线（不含时间承诺）**
  - 图注：路线按证据强度推进:先锁定教师、学生初始检查点、数据切分和预算以复现基线;再分别消融目标构造、散度与 $\lambda$;随后用熵、长度、reward/KL、梯度和异常率建立失败门控;最后才测试 SCOPE、SDPO、多教师或路由等扩展假设.
  - 图注：每一步都要有独立对照与验收门槛.扩展机制不能沿用 G-OPD 的结论代替验证,未通过门控的配置不进入生产.

## `content/llm-guide/4-后训练/4.6-OPD/08-VLA-OPD-具身蒸馏/08-VLA-OPD-具身蒸馏.md`

- 原第 238 行 `images/vla_teacher_student-v2.png`：VLA-OPD 同一学生轨迹的双视图评分：部署观测形成学生分布，训练期特权观测形成冻结教师分布，蒸馏梯度只更新学生
  - 图注：**图 4.6.8.1 VLA-OPD:一条学生轨迹,两种评分视图**
  - 图注：学生以部署时真实可用的 $o_S$ 产生唯一在线动作轨迹.同一 prefix 分别送入学生动作分布和冻结教师动作分布;教师分支可使用训练期额外的 depth/3D 或其他特权状态,但只评分且停止梯度.两种分布进入连续动作蒸馏,梯度只更新学生.
  - 图注：特权信息不进入部署学生.低KL也不自动保证碰撞、关节、速度或力矩安全,这些约束需要独立验证.
- 原第 659 行 `images/vla_info_bottleneck-v2.png`：VLA 蒸馏的信息差：同一状态产生训练期教师观测和部署期学生观测，两种动作分布在同一动作空间蒸馏，但观测不可凭空恢复
  - 图注：**图 4.6.8.2 VLA 蒸馏中的信息差与动作空间匹配**
  - 图注：教师和学生观测来自同一物理状态,但 $o_S$ 不必是 $o_T$ 的可逆投影.两端输出定义在同一动作变量上的分布,因此可以计算 $KL(p_S\|p_T)$;梯度只更新学生.
  - 图注：可传递的是教师在动作空间的偏好与分布结构,不可保证的是从 $o_S$ 唯一恢复 $o_T$、逐样本协方差的固定偏序,或低KL等于任务安全.应以 paired-state 对齐、NLL/校准、mode coverage 和分层任务指标验证.
- 原第 763 行 `images/vla_uncertainty-v2.png`：VLA 动作不确定性的来源、证据与可干预项：区分数据条件随机性和模型/数据知识不足，并给出联合审计方法
  - 图注：**图 4.6.8.3 VLA 动作不确定性:来源、证据与可干预项**
  - 图注：Aleatoric 描述给定条件下的数据随机性,Epistemic 描述模型与数据覆盖不足;二者的“可约/不可约”都依赖你固定了哪些条件、允许哪些干预.蒸馏可能帮助降低后者,但不是保证.
  - 图注：应同时检查 NLL 与校准、同状态重复试验、数据/模型多次重训,以及 OOD、遮挡和新物体切片.不要用一条预设下降曲线替代测量.
- 原第 1408 行 `images/vla_radar-v2.png`：VLA-OPD 的四个工程验证门槛：观测与特权信息、动作分布、物理安全、时序信用分配
  - 图注：**图 4.6.8.4 VLA-OPD 的四个验证门槛**
  - 图注：这不是带通用百分比的“成熟度雷达”.每个门槛都要给出问题、证据、失败信号与缓解措施:部署观测是否足以解释教师动作;动作头是否覆盖多模态;低KL动作是否仍满足物理约束;逐步蒸馏是否支持长期任务成功.
  - 图注：进入真实机器人前,四项都应有数据、阈值、失败回滚和独立复现.动作分布蒸馏本身不会自动解决特权信息缺失、物理安全或长期信用分配.

## `content/llm-guide/4-后训练/4.6-OPD/09-MOPD-多教师在线蒸馏/09-MOPD-多教师在线蒸馏.md`

- 原第 24 行 `./images/fig-mopd-three-forks.png`：三列对照：V4 全词表 reverse KL、K3 clip 对数比、MiMo 训练-推理重要性采样加 ORM
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Three columns: V4 full-vocab reverse KL; K3 3x3 experts plus clip log-ratio; MiMo sampling vs train engine importance sampling plus ORM.
- 原第 71 行 `./images/fig-v4-teacher-hidden-cache.png`：教师权重卸载；只缓存末层 hidden；按教师索引排序后一次只加载一个 head
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Teacher offload, hidden-state cache, reconstruct logits, sort mini-batch by teacher index.
- 原第 107 行 `./images/fig-k3-nine-experts.png`：3×3 专家网格，一条轨迹只连向当前域和 effort 的教师，奖励做 clip
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. 3x3 teacher grid, student rollout, clipped log-ratio reward.
- 原第 158 行 `./images/fig-mimo-is-orm.png`：prompt 按域路由到一名教师；mu 采样、pi 算梯度；w_t 丢离群 token；优势可加 ORM
  - 提示词：Prompt: LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels. white academic background, no watermark, no logo, no copyright text, no website URL. Domain-routed teacher, sampling vs train engine, importance-sampling gate, ORM added to token advantage.

## `content/llm-guide/4-后训练/4.6-OPD/09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md`

- 原第 24 行 `./images/fig-mopd-three-forks-v2.png`：多教师在线蒸馏的三种损失分叉：V4 全词表加权 Reverse KL、K3 逐 token clipped log-ratio、MiMo 训推重要性门与可选 ORM
  - 图注：图 1:三家损失分叉.
- 原第 69 行 `./images/fig-v4-teacher-hidden-cache-v2.png`：mini-batch 按教师索引分组后一次加载一个冻结教师，只缓存末层 hidden 并按需用当前 head 重建全词表 logits，精确 Reverse KL 仅更新学生
  - 图注：图 2:V4 §5.2.2 全词表 OPD 的调度.格子数是示意.
- 原第 103 行 `./images/fig-k3-nine-experts-v2.png`：K3 先由 domain 与 effort 选定九宫格中的一名冻结教师，学生产生唯一在线轨迹，再把已采样 token 的停止梯度对数比裁剪为逐 token 奖励
  - 图注：图 3:K3 九专家与式 (15).
- 原第 152 行 `./images/fig-mimo-is-orm-v2.png`：MiMo MOPD 中 μθ 采样、πθ 重算同一轨迹，πθ/μθ 形成训推门控，域教师产生停止梯度 advantage，再与可选 ORM 汇入学生策略梯度
  - 图注：图 4:Flash §4.4 数据流.对应报告式 (5)–(9).

## `content/llm-guide/4-后训练/4.6-OPD/10-OPD-各家报告对照/10-OPD-各家报告对照.md`

- 原第 24 行 `./images/fig-opd-teacher-source-v2.png`：三类 on-policy distillation 教师槽位：Qwen3 大教师监督 8B 自有 rollout，V4/K3/MiMo 用领域专家合并能力，GLM-5 用同流水线较早 checkpoint 做跨阶段恢复
  - 图注：图 1:教师从哪来.同一句 on-policy distillation,槽位不同.
- 原第 88 行 `./images/fig-opd-loss-fork-v2.png`：全词表与已采样 token 两类 on-policy distillation 损失分叉：V4 逐位置做整词表 Reverse KL，K3、MiMo 与 GLM-5 共享 log-ratio 形状但后处理不同
  - 图注：图 2:损失分叉.左是 V4 §5.1.2;右是 K3 式 (15) / MiMo 式 (8) / GLM-5 式 (2) 这一族.
- 原第 116 行 `./images/fig-qwen3-table21-denominator-v2.png`：Qwen3 Table 21 的精确比较边界：同一 off-policy 蒸馏检查点上的 8B、math+code、AIME’24 与 GPU Hours 三行数据，以及不可外推范围
  - 图注：图 3:分母.17,920 与 1,800 是 Qwen3 Table 21 的格子.

## `content/llm-guide/4-后训练/4.6-OPD/10-OPD-报告落地对照/10-OPD-报告落地对照.md`

- 原第 24 行 `./images/fig-opd-teacher-source.png`：三列教师来源：Qwen3 大号教师压 8B；V4/K3/MiMo 多专家合版；GLM-5 用前阶段 checkpoint
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Three columns: Qwen3 strong-to-weak; V4/K3/MiMo expert merge; GLM-5 previous-stage checkpoints.
- 原第 90 行 `./images/fig-opd-loss-fork.png`：左：每步对整张词表做 reverse KL；右：只在采样 token 上写 sg log 比
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Left: full-vocab reverse KL. Right: token-level sg log ratio with clip.
- 原第 120 行 `./images/fig-qwen3-table21-denominator.png`：17920 与 1800 锁在 Qwen3 Table 21 框内；右侧 V4 框打叉
  - 提示词：Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Qwen3 Table 21 box vs do-not-attach-to-V4.

## `content/llm-guide/4-后训练/4.6-OPD/4.6.2-OPD综述/01-OPD综述/01-OPD综述.md`

- 原第 22 行 `./images/fig-opd-survey-off-vs-on.png`：Off-policy KD trains on teacher prefixes; OPD trains on student prefixes with teacher logits
  - 图注：图 1：采样从哪来。左：off-policy KD，学生只在教师（或数据集）前缀上匹配。右：OPD，学生自己采样，教师在学生前缀上给密集 logits / KL。红标 **NOT**：不是 DPO，不是 Online Preference。底栏：DAgger 把复合从 $O(\epsilon T^{2})$ 收到 $O(\epsilon T)$ 的资格条件见 §2。
- 原第 88 行 `./images/fig-opd-survey-three-axes.png`：Three design axes of OPD: objective, signal source, dynamics
  - 图注：图 2：综述三轴地图。轴 1 优化什么（固定 $f$ / 逐 token 自适应 / RL 增强）。轴 2 信号从哪来（白盒 logits / 黑盒 API / 无外教师）。轴 3 怎么稳定（$\pi_{\mathrm{mix}}$ 与 off-policy 热身、log 比裁剪、全词表 vs 采样 token）。格子里的 01 / 02 / 04 是本库单独成篇，不是综述原文编号。

## `content/llm-guide/4-后训练/4.6-OPD/4.6.3-状态分布视角/05-状态分布精读/05-状态分布精读.md`

- 原第 42 行 `./images/fig-state-signal-two-axes.png`：SFT uses dataset prefixes and gold tokens; OPD uses student prefixes and teacher continuations; RL uses student prefixes and sparse reward
  - 图注：图 1：三列从左到右是 SFT、OPD、RL。上格是状态从哪来，下格是信号从哪来。竖箭只在同一列里从上格底边进到下格顶边。红标：不是同一套交叉熵打在不同前缀上就还是同一个学习问题。
- 原第 80 行 `./images/fig-opd-query-student-state.png`：Student samples prefix s; frozen teacher is queried only at s and returns a short continuation; student learns that continuation
  - 图注：图 2：学生自己 rollout 出前缀 $s$。冻结的教师只在这个 $s$ 上被查询，给出短续写。学生用交叉熵学续写。虚线是教师自己的轨迹，这条路径不进损失。

## `content/rl/01-基础/01.01-概率与mdp/01.01-概率与mdp.md`

- 原第 138 行 `./images/redrawn-probability_space.png`：概率空间示意图
  - 图注：*图注: 蓝色大椭圆为样本空间 $\Omega$,绿色和橙色圆圈为事件 $A$ 和 $B$,交集为 $A \cap B$. $\omega_1, \omega_2, \omega_3$ 为具体的样本点. *
- 原第 152 行 `./images/redrawn-probability-measure.png`：概率测度将事件映射到概率值，并满足规范性与可加性
- 原第 221 行 `./images/redrawn-random_variable-v2.png`：随机变量映射
  - 图注：*图注: 左边是样本空间 $\Omega$,包含4个样本点 $\omega_1, \omega_2, \omega_3, \omega_4$. 右边是实数轴 $\mathbb{R}$. 蓝色箭头表示随机变量 $X$ 将每个样本点映射到一个实数. 注意 $\omega_2$ 和 $\omega_3$ 都被映射到了同一个值1. *

## `content/rl/01-基础/01.02-贝尔曼方程/01.02-贝尔曼方程.md`

- 原第 128 行 `./images/redrawn-mdp_loop.png`：智能体-环境交互循环
  - 图注：*图注: 智能体观察状态 $s_t$,选择动作 $a_t$,环境返回奖励 $r_{t+1}$ 和下一个状态 $s_{t+1}$. 绿色箭头表示状态和奖励从环境流向智能体,蓝色箭头表示动作从智能体流向环境. *
- 原第 152 行 `./images/redrawn-policy-return-value.png`：策略、回报与价值函数关系
- 原第 268 行 `./images/redrawn-bellman_backup.png`：贝尔曼备份图
  - 图注：*图注: 从状态 $s$(顶部白色圆圈)出发,根据策略 $\pi(a|s)$ 选择动作 $a_1, a_2, a_3$(黑色圆点). 每个动作根据转移概率 $P(s'|s,a)$ 转移到下一状态 $s'$(底部白色圆圈). 信息从底部($V(s')$ 或 $r$)向上"备份"到 $V(s)$. *

## `content/rl/01-基础/01.03-策略梯度/01.03-策略梯度.md`

- 原第 238 行 `./images/redrawn-policy_gradient_flow.png`：策略梯度更新流程
  - 图注：*图注: 策略梯度算法的流程. (1) 策略网络 $\pi_\theta$ 输出动作概率; (2) 采样动作 $a$; (3) 与环境交互; (4) 获得奖励 $r$; (5) 计算梯度 $\nabla_\theta \log \pi_\theta(a|s) \cdot R$; (6) 更新参数 $\theta$. *
- 原第 266 行 `./images/redrawn-baseline-variance-v2.png`：固定状态下 baseline 降低策略梯度估计方差
- 原第 325 行 `./images/redrawn-advantage_baseline.png`：优势函数与基线
  - 图注：*图注: 横轴表示优势值 $A$. 基线 $b(s) = V(s)$ 位于0点. $A > 0$ 表示"好动作",应增大其概率(绿色向上箭头); $A < 0$ 表示"坏动作",应减小其概率(红色向下箭头). *

## `content/rl/01-基础/01.04-reinforce/01.04-reinforce.md`

- 原第 125 行 `./images/redrawn-return-recursion.png`：REINFORCE回报递推
- 原第 155 行 `./images/redrawn-episode-update.png`：REINFORCE算法流程
  - 图注：*图注: REINFORCE算法的主循环. (1) 初始化策略; (2) 收集一个完整回合的轨迹; (3) 计算每一步的回报 $G_t$; (4) 计算策略梯度; (5) 更新参数; (6) 重复. *
- 原第 219 行 `./images/redrawn-discounted-return.png`：折扣回报与时间权重
- 原第 316 行 `./images/redrawn-baseline-v2.png`：固定状态下 baseline 降低策略梯度估计方差

## `content/rl/01-基础/01.05-actor-critic/01.05-actor-critic.md`

- 原第 31 行 `./images/redrawn-td-error-v2.png`：Actor-Critic TD 单步更新算例
- 原第 80 行 `./images/redrawn-mc-td-tradeoff-v2.png`：n-step return 的偏差方差权衡
- 原第 151 行 `./images/redrawn-gae-v2.png`：GAE 三步数值递推
- 原第 173 行 `./images/redrawn-a2c-a3c-v2.png`：A2C 与 A3C 架构
- 原第 205 行 `./images/redrawn-joint-loss-v2.png`：Actor-Critic 联合损失

## `content/rl/01-基础/01.06-trpo/01.06-trpo.md`

- 原第 56 行 `./images/redrawn-surrogate-objective-v3.png`：TRPO 代理目标的可计算近似与接受条件
- 原第 75 行 `./images/redrawn-kl-trust-region-v3.png`：TRPO 的平均 KL 约束与候选步接受条件
- 原第 114 行 `./images/redrawn-natural-gradient-v2.png`：TRPO自然梯度推导（离散卡）
- 原第 126 行 `./images/redrawn-conjugate-gradient-v3.png`：TRPO 共轭梯度与 Fisher-vector product
- 原第 140 行 `./images/redrawn-training-iteration-v3.png`：TRPO 完整一次迭代

## `content/rl/01-基础/01.07-ppo/01.07-ppo.md`

- 原第 112 行 `./images/redrawn-importance-sampling-v2.png`：PPO重要性采样数据流
- 原第 222 行 `./images/redrawn-training-iteration-v2.png`：PPO完整训练迭代
- 原第 246 行 `./images/redrawn-transition-contribution-v3.png`：单个 Transition 的目标贡献（离散计算）
- 原第 264 行 `./images/redrawn-clipped-objective-v2.png`：PPO裁剪目标函数（离散情形）

## `content/rl/02-偏好优化/02.02-直接偏好优化/01-DPO/01-DPO.md`

- 原第 66 行 `./images/redrawn-dpo-pipeline-v2.png`：DPO 从偏好数据到损失
- 原第 271 行 `./images/redrawn-dpo-batch-v2.png`：DPO一个 Batch 的训练流程

## `content/rl/02-偏好优化/02.02-直接偏好优化/02-IPO/02-IPO.md`

- 原第 32 行 `./images/redrawn-ipo-computation-v3.png`：IPO偏好对的前向计算与平方损失
- 原第 89 行 `./images/redrawn-ipo-identity-policy-v3.png`：Identity均匀参考下不同beta的解析策略
- 原第 133 行 `./images/redrawn-ipo-finite-target-v3.png`：IPO有限目标的离散更新方向与DPO对比

## `content/rl/02-偏好优化/02.02-直接偏好优化/03-ORPO/03-ORPO.md`

- 原第 122 行 `./images/redrawn-odds-ratio-v2.png`：ORPO 从长度平均分数计算 odds 偏好损失，并与 chosen NLL 加权合成总目标

## `content/rl/02-偏好优化/02.02-直接偏好优化/04-SimPO/04-SimPO.md`

- 原第 76 行 `./images/redrawn-length-normalization-v2.png`：SimPO 长度归一化（离散数值卡）
- 原第 90 行 `./images/redrawn-target-margin-v2.png`：SimPO Target Margin（离散数值卡）

## `content/rl/02-偏好优化/02.02-直接偏好优化/05-KTO/05-KTO.md`

- 原第 46 行 `./images/redrawn-kto-loss-flow-v2.png`：KTO 非成对反馈、参考点与双分支损失
  - 图注：图 1: 每条训练记录都是独立的 $(x,y,label)$.策略与参考模型先给出同一响应的序列 log-prob,形成 $r_\theta$;随后 $r_\theta$ 与停止梯度的 $z_0$ 共同生成 desirable / undesirable 两个方向相反的 margin,再按 label 选择对应损失.
- 原第 62 行 `./images/redrawn-kto-reference-geometry-v2.png`：KTO KL 参考点两侧的价值与梯度性质
  - 图注：图 2: 令 $\delta=r_\theta-z_0$.desirable 价值随 $\delta$ 增大而上升,undesirable 价值随 $\delta$ 增大而下降;两侧的 sigmoid 都会在远离参考点时饱和,使更新幅度衰减.
- 原第 83 行 `./images/redrawn-kto-kl-estimator-v2.png`：KTO 使用 microbatch 循环错配估计共享 KL 参考点
  - 图注：图 3: 对 microbatch 输出执行循环移位,$j=(i+1)\bmod m$,得到 $(x_1,y_2),\ldots,(x_m,y_1)$.Policy 与 Reference 在同一个错配对上计算 log-prob 差,求均值并 clamp 后停止梯度;本 microbatch 的全部 KTO 样本共享该参考点.

## `content/rl/03-推理强化/03.01.01-grpo/03.01.01-grpo.md`

- 原第 140 行 `./images/group_sampling-v3.png`：GRPO 从单个 prompt 组采样、逐条评分到共享统计量广播并计算每路优势的数据流

## `content/rl/03-推理强化/03.04.01-rlvr/03.04.01-rlvr.md`

- 原第 12 行 `./images/redrawn-rlvr-reward-flow.png`：RLVR 的生成、验证、reward contract 与策略更新流程
  - 图注：图 1：同一 prompt 的输出先经过解析与任务检查，得到 correctness、原始得分和 status，再按固定 reward contract 映射为数值奖励向量。训练器消费整组奖励与策略概率并更新参数；错误日志独立保留。
- 原第 24 行 `./images/redrawn-rlvr-verifier-audit.png`：RLVR verifier 的正确性、可重复性、异常隔离与训练监测
  - 图注：图 2：正确性覆盖、重复运行一致性和异常处理分开验收。图中全部结果为待测项；两种 reward/独立正确率趋势是诊断情形，不是实验曲线。
- 原第 35 行 `./images/redrawn-r1-training-lineage.png`：R1-Zero 直接 RL 与 R1 多阶段训练的参数及数据来源
  - 图注：图 3：实线表示模型参数训练路径，紫色虚线表示样本生成、过滤与数据使用。R1-Zero 是独立的直接 RL 实验；R1 的第一阶段 RL checkpoint 为 rejection sampling 提供生成策略，约 600K reasoning 样本与约 200K non-reasoning 样本合并用于第二次 SFT。
- 原第 47 行 `./images/redrawn-r1zero-grpo-reward.png`：R1-Zero 的规则奖励、组优势与 GRPO 参数更新回路
  - 图注：图 4：此图按 DeepSeek-R1 报告 v2 的 R1-Zero 设置展示：accuracy 与 format 等权相加，组内 reward 计算 advantage，GRPO 最大化 clipped surrogate 减 KL 正则项。Base 只用于初始化；参数更新后的 policy 进入下一轮 rollout。

## `content/rl/03-推理强化/03.04.02-oreo/03.04.02-oreo.md`

- 原第 36 行 `./images/redrawn-oreo-soft-bellman.png`：OREO token-level MDP,稀疏终局奖励与 soft Bellman telescoping
  - 图注：图 1: 离线轨迹把 prompt 加已生成前缀定义为 $s_t$,下一个 token 定义为 $a_t$.只有终局 $r_{T-1}=R$ 非零时,所有 $0\le t\le T-1$ 的 suffix return 都是 $R_t=R$,而 $R_T=0$.逐步 soft Bellman 等式沿 suffix 求和后,中间 value 项相消.
- 原第 52 行 `./images/redrawn-oreo-joint-losses.png`：OREO policy 与 value 的 soft Bellman residual 联合学习
  - 图注：图 2: Value lane 用停止梯度的 $R_t-\beta\sum_{i\ge t}\ell_i$ 作为 target,只通过 $V_\phi(s_t)$ 更新 $\phi$;Policy lane 将当前步 $\ell_t$ 保持可导,把 $V_\phi(s_t)$,$R_t$ 与未来 suffix $\sum_{i>t}\ell_i$ 视为常量,并加入当前状态上的 KL regularizer 更新 $\theta$.
- 原第 62 行 `./images/redrawn-oreo-value-search.png`：OREO learned value 引导 math beam search 与 embodied best-of-K
  - 图注：图 3: 数学 step-level beam search 每步保留 $B$ 个父轨迹,每个父轨迹生成 $B$ 个后继,对 $B^2$ 个候选调用 $V_\phi$ 并保留 Top-B;环境交互任务每步采样 $K$ 个 action,按 value 选择一个执行.两者都增加 test-time compute.

## `content/rl/03-推理强化/03.01.02-rloo/03.01.02-rloo.md`

- 原第 106 行 `./images/redrawn-leave_one_out.png`：RLOO Leave-One-Out
- 原第 117 行 `./images/redrawn-rloo-group-workflow.png`：RLOO 组采样与并行优势计算
- 原第 125 行 `./images/redrawn-rloo-policy-kl.png`：RLOO Policy Objective 与 KL Regularization
- 原第 127 行 `./images/redrawn-rloo-parallel-baseline.png`：RLOO 并行 baseline 与梯度聚合

## `content/rl/03-推理强化/03.02.01-dapo/03.02.01-dapo.md`

- 原第 114 行 `./images/decoupled_clipping-v3.png`：PPO 与 DAPO Clip-Higher 的 advantage-signed surrogate 分段曲线

## `content/rl/03-推理强化/03.02.02-gspo/03.02.02-gspo.md`

- 原第 83 行 `./images/sequence_vs_token-v3.png`：GRPO 逐 token surrogate 与 GSPO 单一序列比率的数据流对比
  - 图注：*图注：GRPO 对每个有效 token 的 ratio 分别裁剪后再做 masked 聚合；GSPO 先对有效 token 的 log-ratio 做 masked mean，指数化为每条回答唯一的 sequence ratio，再进行整回答裁剪。*

## `content/rl/03-推理强化/03.02.03-gmpo/03.02.03-gmpo.md`

- 原第 34 行 `./images/redrawn-gmpo-token-aggregation-v2.png`：GMPO奖励组与所选rollout沿独立路径产生advantage及token比率后汇合聚合
  - 图注：图 1: 同一 prompt 的 rollout 奖励仍按 GRPO 计算标量 $\hat A_i$.变化发生在 rollout 内部:GRPO 对有效 token 的 $\rho_{i,t}\hat A_i$ 做算术平均;GMPO 对其绝对值做几何平均,再用 $\operatorname{sgn}(\hat A_i)$ 恢复方向.padding 不参与分母或聚合.
- 原第 65 行 `./images/redrawn-gmpo-gradient-weights-v2.png`：GMPO使用old-policy比率构造共享权重并改变合成梯度
  - 图注：图 2: GRPO 的每个 token gradient 分别乘自己的 $\rho_{i,t}$;GMPO 先将整条序列的 ratio 聚合成 $\rho_{\mathrm{geo}}$,再让所有有效 token gradient 共用这个序列级权重.离群 ratio 仍有影响,但先以 $1/T$ 系数进入 $\operatorname{mean}(\log\rho)$.
- 原第 88 行 `./images/redrawn-gmpo-logspace-clipping-v2.png`：GMPO双输入min裁剪、正负advantage数值路径与masked聚合
  - 图注：图 3: Algorithm 1 先令 $d_t=\log\rho_t$,$s=\operatorname{sgn}(\hat A)$,在 $u_t=sd_t$ 空间执行相同的 `clamp` 与 `min`;再映射回 $d$ 空间,只对 mask=1 的 token 求均值并指数化,最后得到 $L_i=-\hat A\rho_{\mathrm{geo}}$.

## `content/rl/03-推理强化/03.02.04-gdpo/03.02.04-gdpo.md`

- 原第 30 行 `./images/redrawn-gdpo-reward-collapse.png`：GDPO 数值例子:不同 reward 组合在 GRPO 中坍缩为同一 advantage
  - 图注：图 1: 两个 rollout,两个 binary reward 的论文例子.场景 A 的总奖励为 $[0,1]$,场景 B 为 $[0,2]$;GRPO 先求和再用样本标准差归一化,两者都得到 $[-0.7071,+0.7071]$.GDPO 逐列归一化后再相加,场景 B 保留第二个 reward 的额外贡献,得到 $[-1.4142,+1.4142]$.
- 原第 81 行 `./images/redrawn-gdpo-two-level-normalization.png`：GDPO 完整两级归一化:per-reward group normalization 与 batch-wise normalization
  - 图注：图 2: 输入 reward tensor 的形状为 $[B,G,K]$.第一层对每个固定 prompt $i$ 和 reward $k$ 只沿 rollout 轴 $j$ 归一化;随后跨 reward 聚合;第二层再对训练 batch 中全部 $B\times G$ 个 rollout advantage 归一化,最后送入带 token importance ratio 的策略目标.
- 原第 96 行 `./images/redrawn-gdpo-priority-design.png`：GDPO 中 reward weight 与 conditioned reward 的优先级作用
  - 图注：图 3: reward weight 在 per-reward normalization 之后缩放贡献;conditioned reward 在归一化之前通过阈值决定辅助反馈是否可用.两者可以组合:先用条件机制编码粗粒度顺序,再用权重微调可用 reward 的相对强度.

## `content/rl/03-推理强化/03.03.01-ghpo/03.03.01-ghpo.md`

- 原第 24 行 `./images/redrawn-ghpo-difficulty-routing.png`：GHPO 通过同一 prompt 的 group reward 动态检测当前策略难度
  - 图注：图 1: 当前/old policy 对同一 prompt $q$ 采样 $G$ 条 rollout,verifier 给出 binary reward.若 $S(q)=\sum_i r_i>0$,保留原始 prompt 做 on-policy group-relative RL;若 $S(q)=0$,组内 advantage 全零,该 prompt 被路由到 ground-truth hint refinement,而不是直接丢弃.
- 原第 62 行 `./images/redrawn-ghpo-multistage-guidance.png`：GHPO 使用三阶段 ground-truth prefix 逐步调整 hint ratio
  - 图注：图 2: 论文 recipe 使用 $\omega\in\{0.25,0.50,0.75\}$.每个 stage 都先在原始 prompt 上重新检测:出现成功 rollout 就继续无 hint 的 on-policy RL;全部失败才构造 $q_s^*=q+\operatorname{Prefix}(h_{f,q},\omega_s)$ 并在 guided prompt 上重新采样.
- 原第 81 行 `./images/redrawn-ghpo-training-eval-boundary.png`：GHPO cold-start,hybrid training 与 no-hint evaluation 的隔离协议
  - 图注：图 3: 论文前 $N=20$ 个 optimization step 可选用原始 GRPO cold-start;随后 Phase 1 按 group reward 在原始 on-policy 路径和 training-only guided 路径之间动态分流.两条路径只在策略参数更新处汇合;Phase 2 的 validation/test 只接收原始 prompt,完全不读取 solution trace 或 hint stage.

## `content/rl/03-推理强化/03.03.02-justrl/03.03.02-justrl.md`

- 原第 28 行 `./images/redrawn-justrl-fixed-recipe.png`：JustRL 单阶段固定超参数的 veRL GRPO 配方
  - 图注：图 1: 两个 1.5B backbone 共用同一条单阶段管线:DAPO-Math-17k,固定 prompt suffix,$N=8$ rollout,binary rule reward,veRL 默认 GRPO 与 $[0.8,1.28]$ clip-higher.学习率,上下文上限和 batch 配置从训练开始到结束保持不变.
- 原第 38 行 `./images/redrawn-justrl-clipped-grpo.png`：JustRL 从 binary verifier reward 到 clip-higher GRPO 更新
  - 图注：图 2: old policy 以温度 1.0 为同一 prompt 采样 8 条 rollout,DAPO rule verifier 给出 $R_i\in\{0,1\}$;组内均值和标准差产生 response-level $\hat A_i$,当前/old policy 的 token log-prob 形成 $\rho_{i,t}$,再进入 $[0.8,1.28]$ clipped surrogate.
- 原第 55 行 `./images/redrawn-justrl-train-eval-protocol.png`：JustRL 训练 reward 与九基准 evaluation protocol 的隔离
  - 图注：图 3: 训练阶段使用 DAPO lightweight rule verifier 产生 binary policy reward;评测阶段使用最终 checkpoint,温度 0.7,top-p 0.9 与 32K generation limit,并用 rule judge + CompassVerifier-3B 处理 false negatives.两类日志必须分开保存.
