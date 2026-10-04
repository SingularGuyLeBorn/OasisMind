---
title: "mHC: 双随机约束下的超连接, 增益, 开销与实验口径"
category: "架构与算法"
tags: ["DeepSeek", "技术解析", "残差连接", "Hyper-Connections", "Sinkhorn-Knopp"]
published: true
excerpt: "mHC 把 Hyper-Connections 的残差混合矩阵投影到双随机矩阵上, 27B MoE 中复合映射的最大增益从约 3000 降到约 1.6, 最终 loss 比基线低 0.021; 融合内核, 分块重计算与改过的 DualPipe 把 $n=4$ 时的额外训练时间压到 6.7%."
---
# mHC: 双随机约束下的超连接, 增益, 开销与实验口径

材料是 DeepSeek-AI 的论文 *mHC: Manifold-Constrained Hyper-Connections* (arXiv 2512.24880, 2025 年 12 月, 正文加附录 19 页). 官方没有单独的 mHC 仓库, 训练用的内核收在 [deepseek-ai/TileKernels](https://github.com/deepseek-ai/TileKernels) 的 `tile_kernels/mhc/` 目录下, 同仓库的 `tile_kernels/torch/mhc.py` 是 PyTorch 参考实现; 下文对照的代码是 2026-09-30 的提交 66258df. 逐段译文见 [mHC 对照译稿](./mhc-bi.md).

论文要解决的问题是: Hyper-Connections (HC) 把残差流加宽到 $n$ 路, 在小模型上有收益, 但放到 27B 的 MoE 上, 残差混合矩阵连乘之后增益失控, 同时 $n$ 路残差让每层的读写量, 激活显存和流水线通信都涨到原来的 $n$ 倍左右. mHC 的回答分两半: 数学上把残差混合矩阵 $\mathcal{H}_l^{\mathrm{res}}$ 约束成双随机矩阵, 系统上用融合内核, 分块重计算和改造的 DualPipe 把开销压下去. HC 的结构, 双随机矩阵的性质证明和 Sinkhorn-Knopp 的手算例子已经写在 [Hyper-Connections 与 mHC](../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) 里, 下文只在需要时引用结论, 篇幅放在论文自己的设定, 实验数字的口径和代码实现上. V4 怎样使用 mHC 见 [DeepSeek-V4 解析](../../01-模型技术报告/deepseek-v4/deepseek-v4-analysis.md) 第 1.2 节, 另一条改进路线见 [xHC](../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md).

## 1. HC 在 27B 上哪里不稳

### 1.1. 三个映射与表 1 的组件消融

HC 把第 $l$ 层的残差状态从 $1\times C$ 扩成 $n\times C$ 的矩阵 $\mathbf{x}_l$, 层函数 $\mathcal{F}$ 内部仍按 $C$ 维计算. 三个映射各管一件事: $\mathcal{H}_l^{\mathrm{pre}}\in\mathbb{R}^{1\times n}$ 从 $n$ 路里加权读出层输入, $\mathcal{H}_l^{\mathrm{post}}\in\mathbb{R}^{1\times n}$ 把层输出按权重写回 $n$ 路, $\mathcal{H}_l^{\mathrm{res}}\in\mathbb{R}^{n\times n}$ 在 $n$ 路之间重新混合. 合起来就是式 (3):

$$
\mathbf{x}_{l+1}=\mathcal{H}_l^{\mathrm{res}}\mathbf{x}_l+\mathcal{H}_l^{\mathrm{post}\top}\mathcal{F}(\mathcal{H}_l^{\mathrm{pre}}\mathbf{x}_l,\mathcal{W}_l).
$$

把它从第 $l$ 层递推到第 $L$ 层得到式 (4), 第一项是 $\left(\prod_{i=1}^{L-l}\mathcal{H}_{L-i}^{\mathrm{res}}\right)\mathbf{x}_l$. 普通残差里这一项的系数恒为 $\mathbf{I}$, 浅层的信号原样送到深层, 这就是恒等映射性质. HC 把它换成了 $L-l$ 个可学习矩阵的连乘, 每个矩阵都由式 (5) 的「$\alpha\cdot\tanh(\cdot)+\mathbf{b}$」给出, 没有任何约束, 所以连乘的结果可以离 $\mathbf{I}$ 任意远.

表 1 拆了三个映射各自的贡献. 不启用的映射用固定值代替: pre 取均匀权重 $1/n$, post 取全 1, res 取单位阵. 只开 $\mathcal{H}^{\mathrm{res}}$ 时 loss 比基线低 0.022, 再加 pre 是 0.025, 三个全开是 0.027. 也就是说总收益的约 81% 来自残差混合矩阵, 而它恰好是连乘之后会失控的那一项. 表 1 用的模型规模和训练步数文中没有给出; 另外表里缺一行「pre 和 post 动态, res 固定为 $\mathbf{I}$」, 这一行对判断「残差流之间的信息交换是否必要」是关键对照, 第 6.3 节再回到这个缺口.

### 1.2. Amax Gain Magnitude 的定义与图 3

论文用两个指标量化连乘的放大程度: 复合矩阵各行之和的最大绝对值, 记作前向信号增益; 各列之和的最大绝对值, 记作反向梯度增益, 合称 Amax Gain Magnitude. 取行和的理由是: 若 $n$ 路残差携带同一个信号 $\mathbf{s}$, 即 $\mathbf{x}=\mathbf{1}_n\mathbf{s}$, 则 $\mathcal{H}\mathbf{x}=(\mathcal{H}\mathbf{1}_n)\mathbf{s}$, 第 $i$ 路得到的倍数正好是第 $i$ 行的行和. 反向时梯度经过 $\mathcal{H}^\top$, 同理对应列和. 这个指标只量了「各路相同」这一个方向上的放大, 不等于谱范数; 各路信号不同时, 正负元素可以相互抵消, 也可以叠加得更大. 图 3 的数值还对选定的一条序列里所有 token 取了平均.

![](images/p07-figure-2-training-instability-of-hyper-connections-hc-this.jpg)

图 3(a) 解析: 横轴把 27B 模型的 30 个 Transformer 块拆成注意力和 FFN 两个子层, 共 60 层; 纵轴是对数坐标的单层 $\mathcal{H}_l^{\mathrm{res}}$ 增益. 中间约 50 层的单层增益在 0.7 到 1.7 之间来回抖动, 前向和反向两条曲线基本重合. 异常集中在两端: 第 1 层前向约 18, 反向约 7; 第 55 层以后单层增益逐层抬到 1.5 到 2.7, 第 60 层前向约 22, 反向约 12.

![](images/p07-figure-3-propagation-instability-of-hyper-connections-hc-this.jpg)

图 3(b) 解析: 两条曲线的定义方向相反. 前向曲线在横坐标 $l$ 处是从第 1 层乘到第 $l$ 层的复合矩阵, 反向曲线在 $l$ 处是从第 $l$ 层乘到第 60 层的复合矩阵. 反向增益从第 1 层的约 250 一路上升, 在第 45 到 52 层附近达到约 3000 的峰值, 之后快速回落到第 60 层的约 12. 前向增益在中间段只有 5 到 10, 到第 60 层 (整条深度的连乘) 跳到约 500. 两端的数值可以和图 8 第一行最右的 60 层复合矩阵对上: 那个矩阵的最大绝对行和是 509.1, 最大绝对列和是 259.2. 峰值 3000 出现在只连乘最后十来层的位置, 结合图 3(a) 看, 主要是第 55 到 60 层的单层增益 (1.5 到 22) 乘出来的, 中间层的 0.7 到 1.7 互相抵消, 贡献不大.

### 1.3. 图 2 的 loss 偏离有多大

正文把 HC 的问题写成「在 12k step 左右出现意外的 loss surge」, 并说它与梯度范数的不稳定高度相关. 看图 2 的实际幅度, 这里的 surge 和通常说的 loss spike 不一样.

![](images/p07-a-absolute-training-loss-gap-vs-training-steps.jpg)

图 2(a) 解析: 纵轴是 HC 减去 mHC 的训练 loss, 以 mHC 为零线. 前 1 万步两者基本重合, 差值在 $\pm0.002$ 内; 从约 12k step 开始差值单调爬升, 17k step 前后到约 0.006, 之后在 0.005 到 0.007 之间维持, 50k step 结束时约 0.005. 曲线没有尖峰, 也没有回不来的发散, 是一次持续的抬升后停在新的水平上.

![](images/p07-b-gradient-norm-vs-training-steps.jpg)

图 2(b) 解析: 同期 HC 的梯度范数从 12k step 附近开始明显抖动, 在 0.12 到 0.18 之间起伏, mHC 则平稳下降. 40k step 处所有曲线一起向下跳一个台阶, 这对应附录表中学习率在总步数 0.8 倍处的阶梯衰减. 结合第 5.2 节的图 5(a), HC 最终仍比基线低约 0.016, 比 mHC 少的约 0.005 相当于 mHC 收益的四分之一. 所以在 27B, 50k step 这个设定下, HC 的「不稳」体现为收益被侵蚀, 而训练并没有崩. 更大规模或更长训练下会不会真的发散, 文中没有给出数据.

## 2. 流形约束: 双随机矩阵与 Sinkhorn-Knopp

### 2.1. 行和, 列和与双随机

式 (6) 要求 $\mathcal{H}_l^{\mathrm{res}}$ 非负, $\mathcal{H}_l^{\mathrm{res}}\mathbf{1}_n=\mathbf{1}_n$, $\mathbf{1}_n^\top\mathcal{H}_l^{\mathrm{res}}=\mathbf{1}_n^\top$. 对照第 1.2 节的指标, 行和为 1 就是前向增益为 1, 列和为 1 就是反向增益为 1. 列和为 1 还有一层含义: $\mathbf{1}_n^\top\mathcal{H}\mathbf{x}=\mathbf{1}_n^\top\mathbf{x}$, 即混合前后 $n$ 路之和不变, 各路的平均信号被原样传下去, 这正是普通残差恒等映射在多路情形下的推广. 非负性再保证这种守恒不是靠正负抵消凑出来的.

论文列了三条性质: 谱范数不超过 1, 对矩阵乘法封闭, 是置换矩阵的凸组合 (Birkhoff 多面体). 证明见 [Hyper-Connections 与 mHC](../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md). 对实验最要紧的是第二条: 单层约束成立, 任意层数的连乘就自动成立, 第 1.2 节那种 60 层累积出 3000 倍的路径被从结构上切断. $n=1$ 时双随机矩阵只能是标量 1, mHC 退回普通残差. $n=4$ 时 Birkhoff 多面体是 9 维 ($(n-1)^2$) 的凸集, 4 阶置换矩阵有 24 个顶点, 混合矩阵在这 9 个自由度里取值.

### 2.2. 参数化: 式 (7)(8) 相对 HC 改了三处

第一处是输入. HC 的式 (5) 对每一路分别做 RMSNorm, 用 $\theta^{\mathrm{res}}\in\mathbb{R}^{n\times C}$ 生成 $n\times n$ 的动态项, 每一路只看自己那一行. mHC 的式 (7) 先把 $n\times C$ 展平成 $1\times nC$, 整体做 RMSNorm, 再乘 $\varphi_l^{\mathrm{res}}\in\mathbb{R}^{nC\times n^2}$, 每个系数都能看到全部 $n$ 路. 代价是参数量: HC 每层的动态投影是 $(n+2)C$ 个参数, mHC 是 $nC\times(n^2+2n)=n^2(n+2)C$ 个, $n=4$ 时从 $6C$ 变成 $96C$, 多了 16 倍. 27B 的 $C=2560$, 60 个子层合计约 1470 万参数, 相对 27B 总参数仍可忽略.

第二处是激活函数. HC 用 $\tanh$, 系数可正可负; mHC 去掉 $\tanh$, 对 pre 用 $\sigma$, 对 post 用 $2\sigma$, 对 res 用 Sinkhorn-Knopp. 于是 pre 落在 $(0,1)$, post 落在 $(0,2)$, res 落在双随机矩阵上, 三者都非负. 正文对非负性的解释是防止「正负系数组合造成信号抵消」, 图 8 第一行的 HC 矩阵正好是反例: 60 层复合矩阵四行的行和是 $-475.3, -462.8, 509.1, -498.5$, 各路携带量级几百倍, 符号相反的信号, 层输入是靠它们相互抵消才落回正常量级.

第三处是 post 的系数 2. 动态项和偏置都为零时 $2\sigma(0)=1$, 写回权重从 1 起步, 与普通残差相同; 同时上限放到 2, 允许某一路多拿. pre 在零点是 $\sigma(0)=0.5$, $n=4$ 时四路之和为 2, 层输入的量级是各路平均值的 2 倍. 偏置 $\mathbf{b}$ 怎样初始化文中没有给出, 参考实现里也只看到前向计算. 门控 $\alpha$ 的初值沿用 HC 的 0.01 (附录表), 训练初期三组系数几乎由静态偏置决定.

### 2.3. Sinkhorn 的截断与官方代码

式 (9) 从 $\mathbf{M}^{(0)}=\exp(\tilde{\mathcal{H}}_l^{\mathrm{res}})$ 出发, 每轮先列归一再行归一, 正文和附录都写迭代 20 次. 有限次迭代只得到近似的双随机矩阵, 而且误差的位置是确定的: 最后一步是行归一, 所以行和精确为 1, 列和只是近似为 1. 第 1.2 节的定义里行和对应前向, 列和对应反向, 因此截断误差全部落在反向增益上. 这和图 7(a) 吻合, 前向增益是一条贴着 1 的直线, 反向在 1.0 到 1.06 之间.

TileKernels 的实现和正文有三处不同. 一是起点: 参考实现的 Sinkhorn 先对每行做 softmax 再加 $\epsilon=10^{-6}$, 然后除以列和, 再做 `repeat-1` 轮「行归一, 列归一」, 最后一步落在列归一. 二是方向: 代码里的混合矩阵 `comb` 在 `mhc_post_ref` 中以 einsum `'abmn,abmc->abnc'` 作用于残差流, 相当于用 `comb` 的转置去乘, 所以实际起作用的 $\mathcal{H}^{\mathrm{res}}$ 是 `comb` 的转置, 它的行和精确为 1, 结论与正文一致. 三是次数: 内核接口的默认值是 `repeat=10`, 不是 20. softmax 等价于先减去每行最大值再取指数, 只差一个逐行常数, Sinkhorn 的结果不变, 这一步是为了数值安全; $\epsilon$ 则给每个元素加了下限, 避免某个元素下溢成 0 后无法再被行列缩放拉回来. 论文没有提到这两处, 用正文的写法复现时, 若 $\tilde{\mathcal{H}}^{\mathrm{res}}$ 的元素差异很大, $\exp$ 之后可能出现极端病态的起点.

起点的病态程度可以从代码直接算. softmax 之后每个元素不超过 1, 加上 $\epsilon$ 之后不低于 $10^{-6}$, 同一行最大元与最小元之比被限制在约 $10^6$ 以内. 按正文的 $\exp$ 写法没有这个上限: $\tilde{\mathcal{H}}^{\mathrm{res}}$ 同一行两个元素差 30, 取指数后比值就是 $e^{30}\approx10^{13}$, 交替归一要把这样的矩阵拉到接近双随机, 需要的轮数远多于 20. 后续工作 mHC-lite (arXiv 2601.05732) 正是从这个收敛问题出发, 改成直接参数化置换矩阵的凸组合, 免去迭代. 正文对截断只说了一句「略微偏离 1」, 没有给出单层列和误差的分布, 也没有比较 10 次, 20 次和更多次迭代对 loss 的影响.

## 3. 每一项的计算与显存开销

### 3.1. 算力几乎不涨, 访存才是瓶颈

按式 (7), 每个子层每个 token 的系数计算是一次 $1\times nC$ 乘 $nC\times(n^2+2n)$ 的矩阵乘, 前向 $2nC(n^2+2n)$ FLOPs. 27B 取 $n=4$, $C=2560$, 每个子层约 49 万 FLOPs, 60 个子层约 2950 万. 27B 每 token 激活 4.14B 参数, 前向约 83 亿 FLOPs, mHC 系数计算占约 0.36%. 施加映射的部分 (pre 的加权求和, res 的 $4\times4$ 混合, post 的写回) 每个子层是 $O(n^2C)$ 量级, Sinkhorn 是 20 轮 $4\times4$ 的归一, 加起来仍在千分之几的量级. 所以论文第 3.2 节说 HC 的计算复杂度「可控」, 这一点成立.

问题在算术强度. 系数矩阵乘每读入 $\vec{\mathbf{x}}_l$ 的一个元素只做 $2(n^2+2n)=48$ 次浮点运算, bf16 下约每字节 24 FLOPs. 文中没有给出训练硬件; 以 H800 的 bf16 稠密算力约 989 TFLOPS, 显存带宽约 3.35 TB/s 算, 访存与计算的拐点约在每字节 295 FLOPs, mHC 的系数计算比拐点低一个数量级以上, 是纯粹的带宽受限操作. 后面所有工程优化都围着「少读几遍 $nC$ 维的残差流」展开.

### 3.2. 读写量: 表 2 与融合后的口径

表 2 逐项列了每个 token 在一个残差子层中由 $n$ 路设计引入的读写 (不含层函数 $\mathcal{F}$ 内部). 普通残差只有一次合并: 读 $\mathbf{x}_l$ 和层输出共 $2C$, 写 $C$. HC 有五步: 计算系数读 $nC$, 写 $n^2+2n$; 施加 pre 读 $nC+n$, 写 $C$; 施加 post 读 $C+n$, 写 $nC$; 施加 res 读 $nC+n^2$, 写 $nC$; 合并读 $2nC$, 写 $nC$. 合计读 $(5n+1)C+n^2+2n$, 写 $(3n+1)C+n^2+2n$. $n=4$ 时忽略常数项是读 $21C$, 写 $13C$, 共 $34C$, 是普通残差 $3C$ 的 11 倍多.

第 4.3.1 节只给了一个内核的融合效果: post, res 和残差合并合成一个内核后, 读从 $(3n+1)C$ 降到 $(n+1)C$, 写从 $3nC$ 降到 $nC$. 融合后的总量文中没有给出, 可以按内核划分推出来: 系数内核读 $nC$; pre 施加内核读 $nC$, 写 $C$; post-res 内核读 $\mathbf{x}_l$ 和层输出共 $(n+1)C$, 写 $nC$. 合计读 $(3n+1)C$, 写 $(n+1)C$, 总量 $(4n+2)C$, $n=4$ 时是 $18C$, 约为 HC 朴素实现的一半, 仍是普通残差的 6 倍. V4 报告给 V4 实现的激活访存是 $(4n+4)d$, 与这里的 $(4n+2)C$ 只差 $2C$, 两份材料都没有列逐项清单, 差额来自统计范围的不同.

### 3.3. 激活显存与分块重计算

表 3 列了反向需要的激活: 每层的层输出 $\mathcal{F}(\mathcal{H}_l^{\mathrm{pre}}\mathbf{x}_l,\mathcal{W}_l)$ 是 $C$, 始终保存; 每层的 $\mathbf{x}_l$ 是 $nC$, 以及 $\mathcal{H}_l^{\mathrm{pre}}\mathbf{x}_l$ 和它的 RMSNorm 各 $C$, 这三项在重计算块内只临时存在; 块首的 $\mathbf{x}_{l_0}$ 是 $nC$, 每 $L_r$ 层存一份. 系数本身每层只有 $n^2+2n$ 个数, 表 3 没有计入. 重计算只重跑 mHC 内核, 不重跑注意力和 FFN, 因为有了块首 $\mathbf{x}_{l_0}$ 和每层保存的层输出, 按式 (3) 就能逐层把 $\mathbf{x}_l$ 推回来.

式 (20) 对 $nC\lceil L/L_r\rceil+(n+2)CL_r$ 求最小, 忽略取整后求导得 $L_r^*=\sqrt{nL/(n+2)}$. $L$ 按块还是按子层计正文没有说明; 图 3 的横轴按子层计 60 层, 取 $L=60$, $n=4$ 得 $L_r^*\approx6.3$. 每 token 省下多少显存文中没有给出, 按表 3 的口径推算如下: 不重算时每个子层存 $\mathbf{x}_l$, $\mathcal{H}^{\mathrm{pre}}\mathbf{x}_l$, 其 RMSNorm 和层输出, 共 $(n+3)C=7C$, 60 层 $420C$; 取 $L_r=6$ 重算时, 常驻的是 60 份层输出 $60C$ 加 10 个块首 $40C$, 反向处理某一块时再临时多出 $6\times6C=36C$, 峰值约 $136C$, 约为不重算时的三分之一. 代价是反向多跑一遍 mHC 内核, 按第 3.1 节的量级, 这部分算力可以忽略, 多出来的主要是又一遍 $nC$ 维的读写.

正文最后把重计算块的边界对齐到流水线阶段, 理由是理论最优值「通常与每个流水阶段的层数相当」. 27B 和内部大模型的流水并行度文中都没有给出, 这句话无法从文中数字核对. 对齐的好处在第 4.3 节: 每个阶段的首个输入本来就在本地, 重计算不依赖跨阶段通信. TileKernels 的 `multilayer_recompute` 用一个内核跑完整块的逐层重算, 测试里的隐藏维取 1280, 2560, 4096, 7168, 前两个对应附录表的 3B 和 27B, 后两个与 V4-Flash 和 V4-Pro 的隐藏维相同.

## 4. 内核融合与流水线重叠

### 4.1. 式 (14) 到 (16): 把 RMSNorm 挪到矩阵乘之后

RMSNorm 对一个 token 是 $\vec{\mathbf{x}}'=(\vec{\mathbf{x}}/r)\odot\mathbf{g}$, 其中 $r=\|\vec{\mathbf{x}}\|_2/\sqrt{nC}$ 是标量, $\mathbf{g}$ 是逐维权重. 于是

$$
\vec{\mathbf{x}}'\varphi=\frac{1}{r}\,\vec{\mathbf{x}}\,\big(\mathrm{diag}(\mathbf{g})\,\varphi\big).
$$

逐维权重可以预先乘进 $\varphi$ 的行, 标量 $1/r$ 可以放到矩阵乘之后, 这就是式 (14) 到 (16) 的顺序: 先算 $\vec{\mathbf{x}}_l\varphi_l$ 和平方和, 再统一乘 $1/r$ 和 $\alpha$, 加偏置. 好处是 $\vec{\mathbf{x}}_l$ 只读一遍, 矩阵乘和平方和在同一次扫描里完成, 也不必先写出一份归一化后的 $nC$ 维张量. TileKernels 里 `norm_fn` 内核做的就是把 RMSNorm 权重并进投影矩阵, 参考实现 `mhc_pre_norm_fn_ref` 的归一化是 `rsqrt(sqrsum / K + eps)`, 比式 (15) 多一个 eps, 与常规 RMSNorm 相同.

精度按式 (10) 到 (13) 分配: $\varphi_l$ 用 tfloat32, $\vec{\mathbf{x}}_l$ 用 bfloat16, $\alpha$ 和偏置以及之后的系数全部 float32. 残差流本身是 bf16, 读的量最大; 系数只有 $n^2+2n=24$ 个, 用 float32 不增加带宽, 又保证 Sigmoid 和 Sinkhorn 的数值. 代码里这一步交给 DeepGEMM, 沿 $nC$ 维做 split-K, 每个分片同时输出部分乘积和部分平方和, 后面的内核再把分片归约. 正文说式 (14)(15) 不用 TileLang 实现, 与代码一致.

### 4.2. 正文的五个内核与 TileKernels 的实际切分

正文描述了五个内核: 式 (14)(15) 的矩阵乘加平方和, 式 (16) 到 (18) 的轻量系数运算, 式 (19) 的 Sinkhorn 及其自定义反向, 以及两个施加映射的内核 $\mathcal{F}_{\mathrm{pre}}$ 和 $\mathcal{F}_{\mathrm{post,res}}$. Sinkhorn 的反向在片上重算中间结果: 前向不保存 20 轮迭代的中间矩阵, 反向时在 shared memory 里把 $2\times$ 轮数个中间结果重算出来, 再逆序逐步求导. 一个 $4\times4$ 矩阵在 float32 下只有 64 字节, 全部迭代的中间结果放得进片上存储, 用重算换掉了全局显存的读写.

TileKernels 比正文融合得更彻底. `pre_big_fuse` 把 split-K 分片的归约, RMS 归一, pre 和 post 的 Sigmoid, Sinkhorn 和 pre 的施加放进同一个内核, 正文里分开的「轻量系数」「Sinkhorn」「$\mathcal{F}_{\mathrm{pre}}$」三个内核合成了一个. 另有几个正文没有提到的内核: `expand` 在网络入口把嵌入复制成 $n$ 路, `head_compute_mix` 在出口用 Sigmoid 权重把 $n$ 路合回一路, 公式与 pre 相同. 参考实现里 pre 的系数是 Sigmoid 加一个小的 `pre_eps`, post 是 Sigmoid 乘 2.0, 与式 (8) 一致. 仓库里每个内核还有一份 `_asc` 后缀的昇腾实现, 其中 `head_compute_mix` 的昇腾版本只支持 $n=4$.

### 4.3. DualPipe 的扩展与 6.7% 的口径

$n$ 路残差让流水阶段之间传递的激活变成原来的 $n$ 倍, 阶段边界上还要整块重算 mHC 内核, 这两项都会扩大流水线气泡. 第 4.3.3 节的处理方法是把 MLP 层的 $\mathcal{F}_{\mathrm{post,res}}$ 放到一条单独的高优先级计算流上, 注意力层的长时间操作不用 persistent kernel, 让被重叠的注意力计算可以被抢占.

![](images/p12-figure-4-communication-computation-overlapping-for-mhc-we-extend.jpg)

图 4 解析: 三条横线从上到下是普通计算流, 通信流和高优先级计算流. 通信流上依次是专家并行的 DISPATCH 与 COMBINE, 以及流水线的 PP Send Recv, 前向 (黄) 和反向 (绿) 交替. 普通计算流上排着 MLP 和 ATTN 的前向, 反向与权重梯度 (W), 中间插有一段橙色的 Whole Stage Recompute (B), 即阶段边界上对整块 mHC 内核的重算, 它和通信流上的 PP Send Recv 重叠. 高优先级流上只有 $\mathcal{F}^{\mathrm{M}}_{\mathrm{post,res}}$ 的前向和反向两个短块, 分别对齐在 COMBINE 结束和下一次通信开始的位置: MLP 的输出一回来就立即写回残差, 后续的发送不必等普通计算流上长时间运行的注意力内核. 图题说明各块长度只是示意, 不代表实际耗时.

摘要和第 4.3 节都说 $n=4$ 的 mHC 只带来 6.7% 的额外训练时间, 但没有写出对照的基准是什么: 是相对同等配置的普通残差, 还是相对没有优化的 HC, 用的是哪个模型规模和哪种并行配置, 正文都没有交代. V4 技术报告第 3.5.2 节给出的口径是「重叠 1F1B 流水阶段墙钟时间的 6.7%」, 即以一个重叠后的流水阶段为单位比较墙钟时间, 这说明数字来自 V4 的并行设定, 不一定适用于 27B 实验. 另外第 3.2 节的推算显示, 融合之后每层的残差相关读写仍是普通残差的约 6 倍, 6.7% 能成立, 说明这部分访存在整层时间里占比很小, 大部分被注意力和 MoE 的计算与通信盖住了.

## 5. 训练稳定性与下游实验的口径

### 5.1. 四个模型的配置与 token 数

附录表 A.1 给了四组配置, 全部是 DeepSeek-V3 风格的 MoE, 注意力用 MLA, 第一层是稠密层, 路由专家 64, 64, 72 个, 每 token 激活 6 个, 另有 2 个共享专家, 无辅助损失均衡. 3B, 9B, 27B 的层数是 12, 18, 30, 隐藏维 1280, 1920, 2560, 激活参数 612M, 1.66B, 4.14B. HC 和 mHC 的 $n$ 都是 4, 门控初值 $\alpha=0.01$, Sinkhorn 迭代 20 次. 基线是同一套配置的普通残差. 学习率用阶梯衰减, 在总步数的 0.8 倍和 0.9 倍处分别降到基础学习率的 0.316 倍和 0.1 倍, 27B 训练 50000 步, 衰减点在 40k 和 45k, 这就是图 2(b) 和图 5(b) 在 40k 处集体下跳的原因.

token 数可以用 batch, 步数和 4096 的序列长度核对: 27B 是 $1280\times50000\times4096\approx262$B, 3B 是 $320\times30000\times4096\approx39.3$B, 9B 是 $512\times50000\times4096\approx105$B, 3B-1T 是 $2560\times100000\times4096\approx1.05$T, 都与表中一致. 正文说前三个模型按「与参数量成比例」的数据训练, 实际比例是每个激活参数约 63 个 token (39.3B 除以 612M 是 64.2, 105B 除以 1.66B 是 63.3, 262B 除以 4.14B 是 63.3). 3B-1T 用的 token 是同尺寸 compute-optimal 配置的约 27 倍. 图 6 横轴的 FLOPs 与 $6\times$ 激活参数 $\times$ token 数基本对得上: 3B 约 $1.4\times10^{20}$, 9B 约 $1.0\times10^{21}$, 27B 约 $6.5\times10^{21}$, 3B-1T 约 $3.9\times10^{21}$.

### 5.2. 27B 的 loss 与梯度范数

![](images/p12-a-absolute-training-loss-gap-vs-training-steps.jpg)

图 5(a) 解析: 纵轴是 HC 和 mHC 各自减去基线的训练 loss. 两者在前 1 万步重合, 从约 $-0.06$ 快速收窄到 $-0.04$; 之后 HC 先一步向零线靠拢, 17k step 之后与 mHC 拉开约 0.005 的距离并一直保持. 50k step 时 mHC 约 $-0.021$, 与正文报告的 0.021 一致, HC 约 $-0.016$. 两条曲线在整个训练中都在向零线收窄, 优势在训练早期最大, 到结束时只剩早期的三分之一左右.

![](images/p12-figure-5-training-stability-of-manifold-constrained-hyper-connections.jpg)

图 5(b) 解析: HC 的梯度范数在 12k 到 40k 之间大幅抖动, 峰值接近 0.18. mHC 平滑下降, 但在 40k 之前一直高于基线, 大约是 0.08 对 0.06, 高出约 30%; 40k 学习率衰减之后三者都落到约 0.04, 差距消失. 基线在约 5k, 37k 和 49k 处各有一次冲出纵轴的尖峰, mHC 只有 30k 和 39k 附近的小幅突起. 正文说 mHC「保持了与基线相当的平稳曲线」, 看平滑度可以这样说, 看数值则 mHC 在衰减前一直偏高.

### 5.3. 表 4 的下游数字

表 4 是 27B 三个模型在八个基准上的结果. mHC 相对基线全部提升, 幅度从 HellaSwag 的 1.0 到 GSM8K 的 7.1 和 BBH 的 7.2; 相对 HC 七项领先, MATH 一项落后 (26.0 对 26.4). 正文说「BBH 提升 2.1%, DROP 提升 2.3%」, 对照表 4, BBH 从 48.9 到 51.0, DROP 从 51.6 到 53.9, 差值正好是 2.1 和 2.3, 所以这里的百分比是绝对分差, 换成相对提升是 4.3% 和 4.5%.

把增量拆开看, 从基线到 mHC 的提升里, 大部分 HC 已经拿到了: BBH 的 7.2 里 HC 占 5.1, GSM8K 的 7.1 里 HC 占 6.5, MMLU 的 4.4 里 HC 占 4.0. mHC 相对 HC 的差距里, GSM8K, HellaSwag, MMLU, PIQA 在 0.4 到 0.6 之间, 文中没有给出多次运行的方差或置信区间, 这几项无法判断是否超出评测噪声. 能确定的结论是, 在 27B 和 262B token 的设定下, 加约束没有损失 HC 的下游收益, 并在 BBH, DROP, TriviaQA 上多出 1.3 到 2.3 分.

### 5.4. 算力扩展与 token 扩展

![](images/p13-chart.jpg)

![](images/p13-a-compute-scaling-curve.jpg)

图 6(a) 解析: 两张小图是同一组三个点的两种画法, 上为绝对 loss 差, 下为 mHC 与基线 loss 之比. 3B, 9B, 27B 的绝对差约为 $-0.029$, $-0.023$, $-0.021$, 比值约为 98.5%, 98.7%, 98.65%. 由两者可以反推基线 loss 约 1.93, 1.77, 1.56. 绝对差随规模变小, 相对比值从 3B 到 9B 收窄后在 27B 基本持平, 正文据此说优势「只有轻微衰减」. 三个点跨了约 50 倍算力, 每个规模只有一次运行.

![](images/p13-chart-2.jpg)

![](images/p13-figure-6-scaling-properties-of-mhc-compared-to-the.jpg)

图 6(b) 解析: 3B-1T 一次训练中取 5 个检查点, 横轴是累计 FLOPs. 绝对差从约 $-0.024$ 单调缩到 $-0.015$, 比值从约 98.7% 单调升到 99.1%. 这条曲线的走向与图 5(a) 一致: 训练越久, mHC 相对基线的优势越小. 正文对图 6(b) 只说用来「考察单次训练内的动态」, 没有描述这个趋势, 也没有给出 1T token 之后是否继续收窄. 若这一趋势持续, mHC 的收益有一部分是更快收敛, 而不全是更低的最终 loss; 正文提到的内部大规模实验没有给出任何数字, 无法用来判断.

## 6. 传播增益, 映射可视化与几处存疑

### 6.1. 图 7: 只剩反向在动

![](images/p14-a-single-layer-mapping.jpg)

图 7(a) 解析: 60 个子层的单层映射, 前向增益是一条恰好为 1 的直线, 反向增益在 1.00 到 1.06 之间, 第 7 层和第 57 层附近略高. 与图 3(a) 相比, 两端那种 7 到 22 倍的单层增益不再出现.

![](images/p14-b-composite-mapping.jpg)

图 7(b) 解析: 复合映射的前向增益仍是 1, 反向增益从第 1 层的约 1.1 上升, 在第 20 层前后达到约 1.65, 之后单调回落到第 60 层的 1.0. 正文报告的「最大约 1.6」与此一致, 相对 HC 的约 3000 低了三个数量级.

这里的有界性比正文的论证更强. 迭代停在行归一上, 每个 $\mathcal{H}_l^{\mathrm{res}}$ 都是精确的行随机矩阵 (非负, 行和为 1), 行随机矩阵的乘积仍是行随机矩阵. 一个 $n\times n$ 的行随机矩阵所有元素之和等于 $n$, 元素又非负, 所以任意一列的列和都不超过 $n$. 于是不管 Sinkhorn 迭代几次, 哪怕只做一次行归一, 复合映射的反向增益也不会超过 $n=4$, 前向增益恒为 1. 列归一的作用是把这个上界从 4 进一步压到 1.6 左右. 换句话说, 防止 3000 倍爆炸的主要是「非负加精确行归一」, 双随机约束的另一半管的是各路梯度是否均衡.

### 6.2. 图 8: 深层复合趋向均匀平均

![](images/p14-figure-7-propagation-stability-of-manifold-constrained-hyper-connections.jpg)

图 8 解析: 上行是 HC, 下行是 mHC, 每行六个矩阵依次是第 1, 30, 60 层的单层映射, 以及第 1 到 30 层, 第 31 到 60 层, 第 1 到 60 层的复合映射, 纵轴旁标行和, 横轴下标列和. HC 的第 1 层行和是 18.73 和 $-15$ 左右, 第 60 层四行是 $-21.64$, $-20.22$, 22.50, $-21.59$, 60 层复合的行和是 $\pm500$ 量级且三负一正. mHC 的第 30 和第 60 层接近单位阵, 对角元 0.81 到 1.00; 第 1 层是一次真正的混合, 第 3, 4 路基本互换. 60 层复合的 16 个元素都在 0.21 到 0.29 之间, 接近 $1/4$; 后 30 层复合的列和是 0.41, 1.50, 1.50, 0.60.

这张图暴露了正文没有讨论的一面. 第 4.1 节把「反复施加会让混合单调增加」写成稳健的特征融合. 但 60 层复合接近 $\frac14\mathbf{1}\mathbf{1}^\top$ 意味着, 第 1 层进入残差流的信号到达最深层时已经被均匀摊到四路上, 原本各路之间的差异基本消失. 普通残差的恒等映射保证的是信号原样到达, mHC 只保证了「总量」原样到达 (列和与行和为 1), 方向上逐层趋向均匀. 后 30 层复合的列和 0.41 到 1.50 则说明, 即便总量守恒, 反向梯度在四路之间的分配可以相差 3.7 倍. 这些现象对模型能力是好是坏, 文中没有对应的实验.

### 6.3. 缺失的对照与可以追问的 claim

表 1 只有「res 单开」「res 加 pre」「三者全开」三行, 而 mHC 的核心主张是「残差流之间需要信息交换, 但要约束」. 要检验这一点, 最直接的对照是 pre 和 post 保持动态, $\mathcal{H}^{\mathrm{res}}$ 固定为 $\mathbf{I}$ 的多路模型: 它天然满足恒等映射, 没有任何连乘问题, 也不需要 Sinkhorn. 若它与 mHC 相当, 双随机约束的价值就只剩「比单位阵多一点混合」; 若明显更差, 才说明受约束的混合本身有用. 论文没有做这组实验, 后续的社区复现和改进工作也正是从这里提出质疑. 机制层面的其他改法, 例如放宽约束或换参数化, 见 [xHC](../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md).

其余可以追问的 claim 按章节列出:

- 第 3.1 节的「loss surge」: 图 2(a) 是 0.005 量级的持续偏离, 训练没有发散, HC 最终仍比基线低 0.016.
- 第 4.1 节与第 5.4 节的迭代次数: 正文和附录都写 20 次, 官方内核默认 10 次, 并有正文未提的 softmax 加 $\epsilon$.
- 第 4.3 节与摘要的 6.7%: 没有写对照基准, 模型规模和并行配置.
- 第 5.2 节的梯度范数「与基线相当」: 衰减前 mHC 高出约 30%.
- 第 5.3 节的扩展结论: 图 6(b) 中优势随 token 数单调收窄, 正文没有讨论; 内部大规模实验没有数字.

这些问题不影响论文最主要的结论: 在 27B 规模上, 双随机约束把复合映射的增益从三位数到四位数压到 2 以内, 训练曲线比 HC 平稳, 下游收益不低于 HC, 而融合内核与重计算让系统开销可控. V4 把 mHC 作为默认残差结构沿用下来, 后续的 V4.1-Flash 又在访存上继续压缩, 见 [DeepSeek-V4 解析](../../01-模型技术报告/deepseek-v4/deepseek-v4-analysis.md).

## 参考文献

- Z. Xie et al. mHC: Manifold-Constrained Hyper-Connections. arXiv:2512.24880, 2025. https://arxiv.org/abs/2512.24880
- D. Zhu et al. Hyper-Connections. arXiv:2409.19606, 2024. https://arxiv.org/abs/2409.19606
- R. Sinkhorn, P. Knopp. Concerning nonnegative matrices and doubly stochastic matrices. Pacific Journal of Mathematics, 21(2):343-348, 1967.
- DeepSeek-AI. TileKernels (mhc kernels), commit 66258df. https://github.com/deepseek-ai/TileKernels
- DeepSeek-AI. DeepSeek-V3 Technical Report. arXiv:2412.19437, 2024. https://arxiv.org/abs/2412.19437
- L. Wang et al. TileLang: A Composable Tiled Programming Model for AI Systems. arXiv:2504.17577, 2025. https://arxiv.org/abs/2504.17577
- mHC-lite. arXiv:2601.05732, 2026. https://arxiv.org/abs/2601.05732
