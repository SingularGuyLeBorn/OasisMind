---
title: "05 · MoE 量化: 专家参数, 冷门专家校准与专家混合精度"
published: true
tags: ["MoE", "量化", "QMoE", "MoEQuant", "EAQuant", "MiLo", "混合精度", "MXFP4"]
excerpt: "MoE 的参数约 97% 在路由专家里, 校准数据却按路由分给各个专家, 冷门专家分到的 token 可能少于输入维度. 本篇讲 MoE 量化特有的三件事: 专家参数占比与带宽, 冷门专家的校准与专家间分布差异, 专家粒度的混合精度, 并给出 QMoE, MoEQuant, EAQuant, MiLo, MC-MoE, DynaMo, MxMoE 的做法与数字."
---
# MoE 量化: 专家参数, 冷门专家校准与专家混合精度

稠密模型的训练后量化 (PTQ) 有一个默认前提: 一层权重对应一份校准激活, 校准集里的每个 token 都会经过每一层. MoE 打破了这个前提. 路由器把每个 token 只送进 Top-$k$ 个专家, 一个专家的校准激活只包含分给它的那部分 token, 冷门专家分到的样本可能连输入维度都不够. 同时, MoE 的参数几乎全在路由专家里, 压缩的收益和风险都集中在这些校准最不充分的矩阵上.

通用的量化方法不在这里重复. GPTQ 的逐列补偿推导见 [01 权重量化](../01-权重量化/01-权重量化.md) 第 3.1 节, AWQ 和 SmoothQuant 见同篇第 3.2, 3.3 节, 旋转类方法见 [04](../04-三大量化技术流派-旋转缩放与激活感知/04-三大量化技术流派-旋转缩放与激活感知.md). MX 格式的编码细节在 [6.1.2/03 MXFP4 与 NVFP4](../../../6.1-训练基础设施/6.1.2-混合精度训练/03-MXFP4与NVFP4/03-MXFP4与NVFP4.md), FP8 训练在 [6.1.2/02](../../../6.1-训练基础设施/6.1.2-混合精度训练/02-FP8混合精度训练详解/02-FP8混合精度训练详解.md). 下面只讨论这些方法用到 MoE 上时多出来的问题.

## 1. 参数, 带宽与专家间的差异

### 1.1 参数几乎都在路由专家里

模型权重的存储量为

$$
M=P\cdot\frac{w}{8} \tag{1}
$$

字节, $P$ 是参数量, $w$ 是每个参数的比特数. 门控 FFN 的每个专家有 $3dH$ 个参数 ($d$ 是隐藏维度, $H$ 是专家的中间维度), 按这个口径估算三个模型:

| 模型 | 每专家 $3dH$ | 路由专家合计 | 总参数 | 占比 |
|------|-------------|-------------|--------|------|
| Mixtral 8×7B ($d=4096, H=14336$, 32 层, 8 专家) | $1.76\times10^8$ | 45.1B | 46.7B | 约 97% |
| DeepSeek-V3 ($d=7168, H=2048$, 58 个 MoE 层, 256 路由专家) | $4.40\times10^7$ | 654B | 671B | 约 97% |
| Kimi K3 ($\ell=3584, H=3072$, 92 个 MoE 层, 896 路由专家) | $3.30\times10^7$ | 约 2.72T | 未公开 | 约 98% |

K3 的专家输入是 LatentMoE 投影后的 $\ell$ 维, 不是 $d$ 维, 结构见 [Kimi K3 模型页](../../../../../model-library/03-模型家族/02-kimi/kimi-k3/kimi-k3-bi.md). MC-MoE 对 Mixtral 给出的口径与此一致: 专家参数占全部权重的 96% 以上, 是注意力参数的 33 倍.

这个占比决定了 MoE 量化的基本算术. 只压缩路由专家时, 总存储是专家部分与其余部分之和. 以 V3 为例, BF16 全量约 1.34 TB; 路由专家按 MXFP4 的 4.25 bit 存储约 $654\times10^9\times4.25/8\approx347$ GB, 其余约 17B 参数保持 BF16 约 34 GB, 合计约 381 GB, 是全 BF16 的 28%. 其余部分只占参数的 3%, 在压缩后的存储里却占 9%; 专家位宽再往下降, 这个比例还会上升. K3 的路由专家按 MXFP4 约 $2.72\times10^{12}\times4.25/8\approx1.45$ TB, BF16 则需约 5.44 TB.

### 1.2 decode 时读的也是专家权重

decode 阶段每个专家一步只分到少量 token, 专家 GEMM 的运算强度约为 $2t/b$ ($t$ 是该专家这一步的 token 数, $b$ 是每个权重的字节数, 推导见 [9.1.5/01](../../../../9-AI工程化与基础设施/9.1-硬件基础/9.1.5-MoE硬件与加速/01-MoE硬件架构研究综述/01-MoE硬件架构研究综述.md) 第 1.2 节), 远低于 GPU 的 ridge point, 延迟由读权重的速度决定. 权重比特数减半, 读权重的时间也近似减半. 以 V3 的单个路由专家为例, $4.40\times10^7$ 个参数在 BF16 下约 88 MB, MXFP4 下约 23.4 MB; 按 H100 SXM 约 3.35 TB/s 的显存带宽, 读一遍分别约 26 μs 与 7 μs. 一个 MoE 层在一张卡上要读多少个专家, 取决于这一步本卡上有多少专家被激活, 读权重的时间按个数累加.

所以 MoE 量化同时处理两个问题: 模型放不下, 以及 decode 读得慢. 第二个问题还给位宽分配引入了硬件维度. 运算强度公式里的 $b$ 就是位宽, W4A16 把 $b$ 从 2 降到 0.5, 同样的 $t$ 下运算强度提高 4 倍; 一个专家分到的 token 越少, 降权重位宽越划算, 分到的 token 越多, 降激活位宽以使用低精度 Tensor Core 越划算. 第 3.3 节的 MxMoE 把这一点写进了分配目标.

### 1.3 专家之间的分布差异

稠密模型里, 同一层的统计量只有一份. MoE 的同一层有几十到几百个专家, 它们之间至少在三个方面不同. 一是使用频率: MiLo 统计 DeepSeek-MoE 同一层内最常用的专家比最少用的专家多被激活 11.7 倍, MxMoE 在 DeepSeek-V2-Lite 上也观察到超过 10 倍的频率差. 二是权重分布: MiLo 的表 2 中, Mixtral 注意力权重的峰度为 1.57, 专家权重为 $-0.53$; DeepSeek-MoE 的注意力, 共享专家和路由专家分别为 0.016, 0.32 和 $-0.89$. 峰度越高, 离群值越多, 量化残差的结构也不同, 同一表里 Mixtral 注意力和专家的残差秩分别为 514 和 1730.

三是专家重要性随数据变化. DynaMo 论文图 3 给出的例子里, 同一个专家 (第 28 号) 在 WikiText2 上的重要性得分超过 0.5, 在 C4 上低于 0.1. 也就是说, 按某一个校准集排出来的「重要专家」换一个数据集就可能不成立. 这三点分别对应后面几节: 频率差带来校准不均 (第 2 节), 分布和频率差是专家混合精度的依据 (第 3 节), 而重要性随数据漂移限制了离线分配的可靠性 (第 3.2 节的 DynaMo 在运行时切换).

## 2. 冷门专家的校准

### 2.1 逐层目标与 $\mathbf H_E$ 的秩

多数 PTQ 方法逐层求解

$$
\hat{\mathbf W}=\arg\min_{\hat{\mathbf W}}\bigl\|\mathbf W\mathbf X-\hat{\mathbf W}\mathbf X\bigr\|_F^2 \tag{2}
$$

$\mathbf X\in\mathbb R^{d\times n}$ 是该层在校准数据上的输入, 每列一个 token. GPTQ 用 Hessian $\mathbf H=2\mathbf X\mathbf X^{\top}$ 逐列量化并把舍入误差按 $\mathbf H^{-1}$ 分摊到未量化的列上, 为保证可逆在对角线上加阻尼 (默认取对角线均值的 1%), 推导见 [01](../01-权重量化/01-权重量化.md) 第 3.1 节. 这里只用到 $\mathbf H$ 的一个性质: 它的秩不超过 $\mathbf X$ 的列数.

用到 MoE 上, 专家 $E$ 的 $\mathbf X_E$ 只包含被路由到 $E$ 的 $n_E$ 个 token, 于是 $\mathrm{rank}(\mathbf H_E)\le n_E$. 当 $n_E<d$ 时 $\mathbf H_E$ 必然奇异, 求逆只能靠阻尼项, 误差补偿的方向在零空间里主要由阻尼决定, 和数据无关. 做一个估算: 校准集取常见的 128 条长度 2048 的序列, 共 262144 个 token, 按 V3 的 Top-8 / 256 平均每个专家约 $262144\times8/256=8192$ 个 token, 只比 $d=7168$ 略多; 一个使用频率为平均值十分之一的冷门专家只分到约 819 个 token, 远少于 $d$. 按第 1.3 节 10 倍以上的频率差, 这样的专家在每层都存在.

式 (2) 还有一个与 MoE 不匹配的地方: 它对每个 token 一视同仁, 而专家输出要乘上门控权重 $c_i$ 才进入残差流, 门控权重小的 token 上的误差对模型输出影响也小. 处理办法分三类: 增加冷门专家的样本 (MoEQuant 的 EBSS, EAQuant 的校准均衡), 按门控权重给 token 加权 (MoEQuant 的 AGQ), 或者干脆不用校准数据 (MiLo).

### 2.2 MoEQuant: 专家均衡采样与门控加权

MoEQuant (arXiv:[2505.03804](https://arxiv.org/abs/2505.03804)) 把问题分成专家间不均和专家内不均. 对专家间不均, EBSS (Expert-Balanced Self-Sampling) 不用外部数据集, 而让模型自己采样生成校准序列, 目标是困惑度低 (贴近模型自身的分布) 且各专家使用频率的标准差 $\sigma$ 小:

$$
\mathcal D^{*}=\arg\min_{\mathcal D}\Bigl\{\mathrm{PPL}(\mathcal M,\mathcal D)\cdot\exp\Bigl(\frac{\sigma(\mathcal M,\mathcal D)}{\tau}\Bigr)\Bigr\} \tag{3}
$$

$\tau$ 控制均衡项的权重. 直接求解是组合爆炸的子集选择, 长度 $n$, 每步 $m$ 个候选时复杂度为 $O(m^n)$. EBSS 保留 $w$ 条分支做束搜索, 每步按「平均负对数概率加 $\sigma/\tau$」给分支打分, 复杂度降到 $O(wn)$; 专家分布只在分支层面计算, 不对词表里每个候选 token 都跑一遍路由. 论文消融中 $\tau=1.2$, $w=4$ 最好.

对专家内不均, AGQ (Affinity-Guided Quantization) 把门控权重写进误差:

$$
\mathcal L(\hat{\mathbf W})=\sum_i c_i\,\bigl\|\mathbf W\mathbf x_i-\hat{\mathbf W}\mathbf x_i\bigr\|_2^2 \tag{4}
$$

依据是专家输出 $c_iE(\mathbf x_i)$ 中的标量 $c_i$ 可以近似移到专家内部的 gate, up, down 任一线性层上, 每个 token 对该层权重的影响随之按 $c_i$ 缩放. 对 GPTQ, Hessian 相应改为

$$
\mathbf H=(\mathbf X\sqrt{\mathbf c})(\mathbf X\sqrt{\mathbf c})^{\top}=(\mathbf X\cdot\mathbf c)\mathbf X^{\top} \tag{5}
$$

即把 $\sqrt{c_i}$ 乘到每个 token 的输入列上, 其余流程不变. EBSS 改变的是 $\mathbf X_E$ 本身, 让冷门专家的 $n_E$ 增大, 针对第 2.1 节的秩问题; AGQ 改变的是 token 的权重, 不改变 $n_E$. 两者可以叠加, 论文里叠加在 AWQ 上记作 MoEQuant$^{+}$, 叠加在 GPTQ 上记作 MoEQuant$^{++}$.

论文表 1 是 4 bit 逐通道对称权重量化, 基线在 WikiText2 上校准. Mixtral-8x7B 的 GSM8K 从 GPTQ 的 57.92 提高到 MoEQuant$^{++}$ 的 61.79, 平均精度从 53.42 提高到 55.58 (全精度 56.80); DeepSeek-MoE-16B 的 HumanEval 从 GPTQ 的 22.56 提高到 25.00 (全精度 26.83); Qwen-MoE-14B 的 GSM8K 从 AWQ 的 36.77 提高到 42.22. 摘要中「DeepSeek-MoE-16B 在 4 bit 下 HumanEval 提高超过 10 个点」的对比对象是另一组基线, 与上面 GPTQ 的 2.44 个点不是同一个比较.

两种方法的作用对象也决定了它们能叠加在哪些量化器上. AGQ 只改动式 (2) 里 token 的权重, 凡是以逐层重建误差为目标的方法都能用, 所以论文同时给出了 AWQ 和 GPTQ 两个版本; EBSS 只改动校准集, 和量化器无关. 代价落在校准阶段: EBSS 要让模型自回归生成校准序列, 束宽 $w$ 越大越接近式 (3) 的最优, 生成开销也按 $w$ 线性增加.

### 2.3 EAQuant: 统一平滑, 路由对齐与校准均衡

EAQuant (arXiv:[2506.13329](https://arxiv.org/abs/2506.13329)) 面向权重和激活同时量化 (W4A4, W3A4, W3A3, W2A4), 处理三个问题. 第一个是激活平滑. SmoothQuant 一类方法按通道计算平滑向量, 把激活的范围转移到权重上, 再把 $\mathrm{diag}^{-1}(\mathbf s)$ 吸收进前面的 RMSNorm. MoE 的各专家共用同一个 RMSNorm 的输出, 若每个专家各算一个平滑向量, RMSNorm 只能吸收其中一个, 其余要在运行时做 $O(kd)$ 的动态缩放. EAQuant 把各专家的需求聚合, 再与路由器的需求合并:

$$
\bar s_j=\max\Bigl(\mathbb A_{i}\Bigl(\frac{\max|x^{i}_j|^{\alpha}}{\max|W^{i}_j|^{1-\alpha}}\Bigr),\;\frac{\max|x_j|^{\alpha}}{\max|W^{\mathrm{gate}}_j|^{1-\alpha}}\Bigr) \tag{6}
$$

$\mathbb A$ 是对专家 $i$ 的聚合, 第二项保证路由器的输入也被平滑. 统一向量吸收进 RMSNorm 的缩放 ($\boldsymbol\gamma\oslash\bar{\mathbf s}$), 路由器和各专家的计算与原来等价, 推理时没有额外开销.

第二个是路由对齐. 量化误差会扰动路由 logits, Top-$k$ 集合一变, 后面算的就是另一组专家. EAQuant 的路由校准损失是量化前后 logits 的均方误差加一项 KL 散度, KL 不在全部 $n$ 个专家上算, 而只在 Top-$k$ 专家再加上排名其后的 $\alpha(n-k)$ 个专家上算 (KL-Top). 这样损失集中在决定选择结果的那一段分布上, 不被大量概率接近零的尾部专家稀释. 路由器本身按 W8A8 量化. 表 4 中 OLMoE 在 W4A4 下只加路由对齐, 平均精度就从 DuQuant 的 66.69 提高到 67.97.

第三个是校准均衡. 以 128 条长度 4096 的 WikiText2 序列为基础, 若某个专家分到的 token 少于 $r\cdot kN/n$ ($N$ 是校准 token 总数, $kN/n$ 是均匀路由下每个专家的期望数), 就从训练集补采样本给它. 表 5 中 $r$ 取 0, 1, 2, 4, 8 时平均精度为 66.69, 67.10, 67.78, 67.47, 67.32, $r=2$ 最好, 阈值继续提高后精度回落.

W4A4 下, EAQuant 在 OLMoE-7B, DeepSeek-MoE-16B, Mixtral-8x7B 上的平均精度比 DuQuant 分别高 1.37, 1.15, 1.15 个点 (例如 OLMoE 从 66.69 到 68.06, Mixtral 从 73.06 到 74.21); W3A4 下最多高 2.28 个点; W2A4 下差距最大, Mixtral 从 39.59 到 53.40, 高 13.81 个点, 而 DuQuant 在 OLMoE 上 W2A4 的困惑度达到 8279.52. 所以全部设置下的提升范围是 1.15 到 13.81 个点. OLMoE 的 W3A4 消融里三个组件单独使用分别提升 2.12 (平滑), 1.90 (路由对齐), 0.35 (校准均衡), 合用提升 2.28, 三者有重叠, 平滑和路由对齐贡献最大.

### 2.4 MiLo: 不用校准数据

MiLo (arXiv:[2504.02658](https://arxiv.org/abs/2504.02658)) 换了一条路: 量化本身不依赖校准数据, 也就避开了冷门专家样本少的问题. 它用 HQQ 把权重量化到 INT3: 固定缩放 $s$, 只优化零点 $z$, 误差用 $l_p$ ($p<1$) 范数衡量以降低离群值的影响, 用半二次分裂求解. 量化残差 $\mathbf W-\hat{\mathbf W}$ 再用一组低秩矩阵补偿, 低秩部分取残差的截断 SVD. 两步交替: 给定当前的低秩补偿, 量化扣除补偿后的权重; 给定量化结果, 重新对残差做截断 SVD; 最多迭代 20 次提前停止. 补偿矩阵本身也量化到 INT3.

秩的分配用到了第 1.3 节的差异. 论文发现注意力等稠密层对秩最敏感, 应该给更高的秩; 路由专家之间, Mixtral 的专家使用比较均衡, 按峰度分配秩效果好, DeepSeek-MoE 的使用频率差异大, 按频率分配效果好. 表 3 (W3A16, 组大小 64) 中, Mixtral 的 WikiText2 困惑度 GPTQ 为 4.7304, HQQ 为 4.6119, MiLo 两档设置为 4.0335 (20.8 GB) 和 3.9076 (21.0 GB); DeepSeek-MoE 从 GPTQ 的 6.8234 降到 6.2605. 摘要的口径是在 22% 的压缩比下恢复了 WikiText2 困惑度损失的 87% 以上.

MiLo 的另一半工作是 kernel. INT3 不是 2 的幂, 它把 32 个 INT3 打包进 3 个 INT32, 没有填充位浪费, 并写了适配 Tensor Core 的 W3A16 GEMM. 端到端相对 FP16 最多快 3 倍, 相对 MARLIN 的 INT4 kernel 在 batch 1 和 batch 大于 1 时分别快 1.2 倍和 1.26 倍.

## 3. 专家混合精度

![专家级混合精度示意](images/fig-moe-quant-expert-mixprec.png)

**图 1 解析**

- 路由器和共享专家保持 BF16, 四个路由专家按重要性取不同位宽 (INT8, INT4, INT4, INT2). 参数主要在路由专家里, 压缩集中在它们身上; 路由器参数少且对扰动敏感, 保持高精度.
- token 分两路: 一路直接进共享专家, 一路进路由器, 由 Top-$k$ 选出路由专家. 共享专家处理所有 token, 不经过路由选择, 所以图中路由器和共享专家之间没有连线. 两路输出在 $\Sigma$ 处相加.
- 图里画的是逐专家选位宽这一类方法. 第 4 节的 QMoE 和 K3 属于另一类, 对全部路由专家用同一种格式.

### 3.1 按模块分配: QuantMoE-Bench

QuantMoE-Bench (Li et al., arXiv:[2406.08155](https://arxiv.org/abs/2406.08155)) 先问一个基础问题: 位宽在 MoE 的哪些模块上最值钱. 它在 Mixtral 和 DeepSeek-MoE-16B (64 个路由专家选 6 个, 外加 2 个共享专家) 上用 GPTQ 做实验, 每个模块只在 2 bit 和 4 bit 之间选. 结论有三条: 注意力层比 FFN 更需要位宽, 给注意力多分比特带来超过 5% 的平均精度提升; 共享专家每个 token 都要经过, 给 4 bit 明显好于 2 bit; 前几个 MoE 块比后面的块更敏感, DeepSeek-MoE 的最终两块也敏感.

在路由专家之间, 论文比较了几种启发式, 按激活频率分配位宽的效果「相当不错」, 混合方案的平均精度为 65.35%, 统一 GPTQ 为 64.30%. 这些结论和第 1.1 节的占比一起看: 注意力和共享专家参数少, 多给比特对总存储影响小, 收益却大; 真正需要压缩的是路由专家, 而它们内部的分配依据是使用频率.

### 3.2 按专家分配: MC-MoE 与 DynaMo

MC-MoE (Huang et al., arXiv:[2410.06270](https://arxiv.org/abs/2410.06270)) 把专家位宽分配写成整数规划. 专家 $i$ 的重要性取 $\phi_i^{\alpha}w_i^{\beta}$, $\phi_i$ 是激活频率, $w_i$ 是平均路由权重; $\epsilon_{i,j}$ 是专家 $i$ 量化到第 $j$ 种位宽时的 Frobenius 范数误差. 用 $x_{i,j}\in\{0,1\}$ 表示是否选这种位宽, 位宽集合为 $\{1,2,3\}$:

$$
\min_{x}\sum_{i}\sum_{j}x_{i,j}\,\phi_i^{\alpha}w_i^{\beta}\,\epsilon_{i,j}\quad\text{s.t.}\quad\sum_j x_{i,j}=1,\quad\frac1n\sum_i\sum_j x_{i,j}\,b_j=k \tag{7}
$$

$b_j$ 是第 $j$ 种位宽, $k$ 是目标平均位宽, 另外要求每层至少有一个 3 bit 和一个 2 bit 专家. 规模只有每层几个到几十个专家, 求解约 1 秒. 非专家部分统一 4 bit, 摊到全部参数上不到 0.05 bit.

在 Mixtral 上 (C4 校准, 128 条长度 2048), 全精度平均精度 71.29; 统一 3 bit 下降 2.2%, 统一 2 bit 下降 28.6%; 按式 (7) 分配到平均 2.54 bit 得 67.50, 只降 3.8%, 把重要性换成基于 Hessian 的指标得 67.18, 略低于式 (7). 2 bit 和 3 bit 之间的精度断崖说明, 平均位宽接近 2 时, 哪些专家拿到 3 bit 比平均位宽本身更重要. MC-MoE 还在推理时动态剪掉 15% 的激活参数 (保护 2% 的重要 token), 精度损失小于 0.6%.

DynaMo (Zheng et al., arXiv:[2503.21135](https://arxiv.org/abs/2503.21135), 第一版题为 MoQa) 针对第 1.3 节的第三点: 专家重要性随数据变化. 它按多个数据集上的重要性用模糊 c 均值把专家聚成 4 类, 分别对应 INT2, INT4, INT6, INT8; 落在类别交界处的专家优先给低位宽. 运行时换了数据分布, 它不重新量化, 而是在通道粒度切换: 每个专家约 1% 最动态的通道额外缓存一份 FP16, 一个 7B MoE 的缓存为 152.8 MB, 占模型的 1.02%. 在约 3 bit 下, 相对 GPTQ 和 MoE 专用 PTQ 基线, 困惑度降低 2.78 到 4.54, 精度提高 1.85% 到 3.77%; 例如 Qwen1.5-MoE 的平均困惑度从 GPTQ 3 bit 的 15.92 降到 3.05 bit 的 11.38. 相对 FP16 加速 2.91 到 3.08 倍.

### 3.3 按硬件分配: MxMoE

MxMoE (Duanmu et al., arXiv:[2505.05799](https://arxiv.org/abs/2505.05799)) 指出前两节的分配只看精度, 不看速度, 而第 1.2 节说明不同专家的最优格式还取决于它这一步分到多少 token. 对一个 $[m,n,k]$ 的 GEMM, $n,k\gg m$ 时运算强度近似为 $m$, 也就是 token 数. 在 RTX 4090 上按 roofline 计算, $m<83$ 时 W4A16 比 W8A8 快, $m<42$ 时 W2A16 比 W4A4 快. 热门专家分到的 token 多, 适合降激活位宽用低精度 Tensor Core; 冷门专家 token 少, 读权重是瓶颈, 适合降权重位宽.

MxMoE 的分配粒度比专家更细, 到专家内部的线性块, 论文表明这比整专家分配更好. 它在显存预算下用整数线性规划同时优化精度损失和 roofline 估计的耗时, 再为分配结果自动生成混合精度的 Group-GEMM kernel. 2.25 bit 下 WikiText-2 困惑度比 GPTQ 低 2.4; 相对全精度最多快 3.4 倍; W5A5 下比统一位宽快 29.4%; W4.25A15.5 的配置在 Qwen1.5-MoE 上 512 token 的访存受限场景下吞吐最多提高 25%.

## 4. 极低比特与低比特训练

### 4.1 QMoE: 三值化与字典编码

QMoE (Frantar & Alistarh, arXiv:[2310.16795](https://arxiv.org/abs/2310.16795)) 的对象是 SwitchTransformer-c2048: 1.6T 参数, BF16 下 3.2 TB. 规模本身就是问题: 逐层 GPTQ 要保存海量中间激活, 逐专家运行时矩阵太小, GPU 利用率低. QMoE 把激活与权重放在 CPU 内存, 每次只把一个专家和它的输入 token 取到 GPU; 权重大到 CPU 内存也放不下时按需从磁盘懒加载; 把多个专家的 $\mathbf X_E$, $\mathbf H_E$, $\mathbf W_E$ 堆成三维张量做批量 GPTQ, 16 个专家一组时比逐专家快约 6 倍. 整个压缩在单张 GPU 上不到一天完成, 校准样本对 128 专家模型取 10K 条, 对 2048 专家模型取 160K 条, 专家数增加 16 倍, 样本也增加 16 倍, 每个专家平均分到的 token 数大致不变.

量化网格按行取最小值和最大值, 三值即 $\{w_{\min},0,w_{\max}\}$. 网格宽而权重近似正态, 大量权重落在 0 上. 论文表 4 的平均稀疏度在 base128, large128, c2048 上分别为: 2 bit 72.2%, 73.1%, 76.5%; 三值 85.7%, 86.4%, 88.6%, 模型越大越稀疏. 直接存稀疏格式不划算, 光标记非零位置的 bitmask 就要每权重 1 bit. QMoE 改用低熵编码. 设三值权重独立, 零的概率为 $p_0$, 两个非零值各占一半, 每权重的熵为

$$
\mathcal H=-p_0\log_2p_0-(1-p_0)\log_2\frac{1-p_0}{2} \tag{8}
$$

取论文的例子 $p_0=0.885$: 第一项约 $0.885\times0.176\approx0.156$; 每个非零值概率 $0.0575$, 第二项约 $0.115\times4.12\approx0.474$; 合计约 0.63 bit, 相对 16 bit 的理论压缩率为 25.40 倍. 不利用稀疏直接存三值要 $\log_23\approx1.58$ bit, 实际按 2 bit 打包.

Huffman 一类变长码在 GPU 上难解码: 第 $i$ 个符号要等前面所有符号的长度确定, warp 内线程每次解出的符号数不同. QMoE 用定长码字对应变长序列的字典码: 相邻两个三值组成一对, 生成 $2^{16}$ 个最常见的序列, 每个码字是 UINT16, 映射到两个 UINT32, 存最多 7 对值和对数; 每个 warp 负责一行, 字典小到能放进 L2. c2048 只算 MoE 部分压缩 20.07 倍, 按式 (8) 的分布独立采样的矩阵为 21.11 倍, 差约 5%, 说明独立性假设对大模型接近成立; 含稠密层与元数据整体为 19.81 倍, 约 0.807 bit 每参数, 检查点从 3142 GB 降到 158.6 GB, 能在 4 张 A6000 或 8 张 RTX 3090 上运行, 比理想的未压缩执行慢不到 5%.

精度方面, 论文表 5 用 C4 验证集上的掩码语言建模损失评估. c2048 的 BF16 为 1.18, QMoE 2 bit 为 1.20, 三值为 1.26, 直接四舍五入 (RTN) 到三值为 2.15; base128 的三值从 1.73 到 1.99, 增加约 15%. 模型越大, 三值化的相对损失越小, 这和稀疏度随规模上升是一致的. 表 3 还发现 GPTQ 的「按激活大小重排列」在 base128 三值化上把损失从 1.99 升到 2.23, 极低位宽下先量化最敏感的列会让整个矩阵大幅变动, 过拟合校准数据.

### 4.2 FP8 与 MXFP4: DeepSeek-V3 和 Kimi K3

DeepSeek-V3 (arXiv:[2412.19437](https://arxiv.org/abs/2412.19437)) 用 FP8 做预训练, 细粒度缩放与累加精度的处理见 [6.1.2/02](../../../6.1-训练基础设施/6.1.2-混合精度训练/02-FP8混合精度训练详解/02-FP8混合精度训练详解.md) 第 5 节. 与 MoE 直接相关的是通信: 专家并行的 dispatch 要把激活发给持有专家的卡, V3 在 MoE 上投影之前把激活量化为 FP8 再 dispatch, 通信量减半; combine 保留 BF16, 因为它是各专家输出按门控权重的加权和, 直接进残差流. 这个不对称说明 MoE 的量化不只是权重的事, 专家并行的通信也是精度分配的对象.

Kimi K3 (arXiv:[2607.24653](https://arxiv.org/abs/2607.24653) 第 4.1.4 节) 把 MoE 专家权重量化到 MXFP4, 激活用 MXFP8 计算; 注意力投影, LatentMoE 的上下投影, 共享专家与路由器保持较高精度. 它不做 PTQ, 而在整个后训练阶段 (SFT 与 RL) 做量化感知训练 (QAT), RL 的 rollout 与训练使用同一量化方案, 避免推理端的量化误差让 rollout 分布和训练端不一致. 按第 1.1 节的占比, 只量化路由专家已覆盖约 98% 的参数. 保持高精度的几类模块都是每个 token 必经的: 路由器的扰动会改变 Top-$k$, 共享专家与注意力处理所有 token, LatentMoE 的投影误差会传给所有路由专家. 它们参数少, 保留高精度的存储代价小, 这和第 3.1 节 QuantMoE-Bench 的结论一致.

MXFP4 每 32 个元素共享一个 8 bit 的 2 的幂缩放, 有效位宽 $4+8/32=4.25$ bit, 格式细节见 [6.1.2/03](../../../6.1-训练基础设施/6.1.2-混合精度训练/03-MXFP4与NVFP4/03-MXFP4与NVFP4.md). 对 MoE 来说, 这类块缩放格式的好处是每个专家的每 32 个元素都有自己的缩放, 专家之间的分布差异 (第 1.3 节) 被块缩放吸收了一部分, 不需要逐专家调参. 代价是它只能做全体专家统一的位宽, 第 3 节的混合精度在这里退化成「专家 MXFP4, 其余高精度」两档.

## 5. 方法对照与失效模式

### 5.1 方法对照

| 方法 | 位宽 | 处理的 MoE 问题 | 是否用校准数据 | 代表结果 |
|------|------|----------------|---------------|---------|
| QMoE | 三值, 约 0.8 bit | 规模, 极低比特存储 | 是, 10K 到 160K 条 | c2048 压缩 19.81 倍 |
| MoEQuant | W4 | 冷门专家样本少, 门控权重 | 自采样 | Mixtral GSM8K 57.92 到 61.79 |
| EAQuant | W4A4 到 W2A4 | 平滑向量不能融合, 路由扰动, 校准不均 | 是, 加均衡补采 | Mixtral W2A4 提高 13.81 个点 |
| MiLo | W3 加低秩补偿 | 回避校准不均, 专家间分布差异 | 否 | Mixtral 困惑度 4.73 到 3.91 |
| MC-MoE / DynaMo / MxMoE | 混合 1 到 8 bit | 专家重要性与频率差异 | 是 | MC-MoE 2.54 bit 只降 3.8% |

表中的方法分成两组. 前四行处理的是「同一位宽下怎样让误差小」, 校准数据的使用方式是区分它们的主线: QMoE 靠加大样本量, MoEQuant 靠自采样, EAQuant 靠补采, MiLo 不用. 最终一行处理的是「位宽怎么分」, 分配依据从频率和误差 (MC-MoE), 到跨数据集的重要性 (DynaMo), 再到硬件耗时 (MxMoE). 两组可以叠加, 例如在混合精度分配之后, 每个专家内部仍然用 GPTQ 或 AWQ 求解, 第 2 节的校准问题照样存在.

位宽一列也说明了方法适用的区间. W4 附近, 统一位宽加专家感知的校准已经接近全精度, 混合精度的收益有限; 平均位宽降到 3 以下, 2 bit 和 3 bit 的精度差变成断崖 (MC-MoE 的 2.2% 对 28.6%), 这时哪些专家拿到高位宽决定了结果, 混合精度成为必要条件. 低比特训练 (K3) 不在表中, 它把量化误差交给训练去适应, 与 PTQ 的各种校准技巧是两个层面的选择.

### 5.2 失效模式

| 现象 | 原因 | 处理 |
|------|------|------|
| 量化后某些专家质量下降明显 | 冷门专家样本少, $\mathbf H_E$ 奇异或估计不准 | 专家均衡的校准集 (EBSS, 均衡补采), 或不依赖校准的方法 (MiLo) |
| 量化后路由结果变化 | 路由 logits 被扰动, Top-$k$ 集合改变 | 路由器保持高精度, 或对齐量化前后的路由分布 (KL-Top) |
| 逐专家平滑后无法融合 | 各专家共用一个 RMSNorm, 只能吸收一个平滑向量 | 合并为统一平滑向量, 见式 (6) |
| 低位宽下换数据集精度掉得多 | 专家重要性随数据变化, 离线分配失配 | 多数据集联合估计重要性, 运行时通道级切换 (DynaMo) |
| 混合精度省了显存却没变快 | 分配只看精度, 没有对应的高效 kernel | 按 roofline 分配并生成混合精度 Group-GEMM (MxMoE) |

前三行在第 2 节已有推导, 共同点是 PTQ 的单层假设在 MoE 上失效: 一层不再只有一份激活统计, 路由器也不再是可以忽略的小模块. 第一行的处理有一个边界: 阻尼只能保证 $\mathbf H_E$ 可逆, 不能补上缺失的方向, 所以单纯调大阻尼不是对策, 要么增加样本, 要么换不依赖 $\mathbf H$ 的方法.

后两行是混合精度特有的. 第四行的风险来自校准集与部署分布不同, 在混合精度下比统一位宽更严重, 因为错分到 2 bit 的重要专家损失远大于错分到 4 bit. 第五行在 GPU 上很常见: 每个专家位宽不同, 原本一次 Grouped GEMM 能算完的专家要拆成多次调用, 或者退回逐专家的小 kernel, 第 1.2 节读权重省下的时间被调度开销吃掉. 位宽方案和 kernel 要一起设计, 这也是 MxMoE 把耗时写进优化目标的原因.

**参考文献**

1. Frantar, E., & Alistarh, D. (2023). [QMoE: Practical Sub-1-Bit Compression of Trillion-Parameter Models](https://arxiv.org/abs/2310.16795). Table 3, 4, 5, 7.
2. Hu, X., et al. (2025). [MoEQuant: Enhancing Quantization for Mixture-of-Experts Large Language Models via Expert-Balanced Sampling and Affinity Guidance](https://arxiv.org/abs/2505.03804). Table 1.
3. (2025). [EAQuant: Enhancing Post-Training Quantization for MoE Models via Expert-Aware Optimization](https://arxiv.org/abs/2506.13329). Table 1, 4, 5.
4. (2025). [MiLo: Efficient Quantized MoE Inference with Mixture of Low-Rank Compensators](https://arxiv.org/abs/2504.02658). Table 2, 3.
5. Zheng, Z., et al. (2025). [DynaMo: Runtime Switchable Quantization for MoE with Cross-Dataset Adaptation](https://arxiv.org/abs/2503.21135).
6. Huang, W., et al. (2024). [Mixture Compressor for Mixture-of-Experts LLMs Gains More](https://arxiv.org/abs/2410.06270).
7. Li, P., Jin, X., Tan, Z., Cheng, Y., & Chen, T. (2024). [Examining Post-Training Quantization for Mixture-of-Experts: A Benchmark](https://arxiv.org/abs/2406.08155).
8. Duanmu, H., et al. (2025). [MxMoE: Mixed-precision Quantization for MoE with Accuracy and Performance Co-Design](https://arxiv.org/abs/2505.05799). ICML 2025.
9. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). §3.3.
10. Moonshot AI. (2026). [Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653). §4.1.4.
11. Frantar, E., Ashkboos, S., Hoefler, T., & Alistarh, D. (2022). [GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323).
12. Xiao, G., et al. (2023). [SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models](https://arxiv.org/abs/2211.10438).
13. Lin, H., et al. (2024). [DuQuant: Distributing Outliers via Dual Transformation Makes Stronger Quantized LLMs](https://arxiv.org/abs/2406.01721).
14. NVIDIA. [H100 Tensor Core GPU](https://www.nvidia.com/en-us/data-center/h100/). H100 SXM 显存带宽 3.35 TB/s.
