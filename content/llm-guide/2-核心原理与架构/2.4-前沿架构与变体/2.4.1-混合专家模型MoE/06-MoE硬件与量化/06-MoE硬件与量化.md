---
title: "06 · MoE 量化与专用硬件:低比特专家,校准不均,近存计算"
published: true
tags: ["MoE", "量化", "QMoE", "MoEQuant", "EAQuant", "MXFP4", "FPGA", "PIM"]
excerpt: "MoE 的参数几乎都在专家里,decode 时专家计算受带宽限制.本篇整理 MoE 量化的特有问题(稀有专家校准不足,路由对扰动敏感),QMoE 的三值化与字典编码,MoEQuant 与 EAQuant 的专家感知校准,DeepSeek-V3 的 FP8 训练与 Kimi K3 的 MXFP4 量化感知训练,以及 FPGA,近数据计算与存内计算方向的专用硬件."
---
# 06 MoE 量化与专用硬件

## 太长不看版

- MoE 的参数集中在路由专家:Mixtral 约 97%,DeepSeek-V3 约 97%,Kimi K3 约 98%.压缩专家权重就是压缩模型的大部分显存,decode 阶段读权重的带宽也随之下降.
- MoE 量化比稠密模型多两个问题:校准集上冷门专家分到的 token 少,统计不足;路由 logits 被量化扰动后,选中的专家会变.
- QMoE 把 1.6T 参数的 SwitchTransformer-c2048 量化到三值,利用约 88.6% 的自然稀疏和字典编码压到 158.6 GB(整体 19.81 倍,约 0.807 bit/参数),在 4 张 A6000 上运行,相对理想的未压缩执行慢不到 5%.
- MoEQuant 用模型自采样构造专家均衡的校准集,并把门控权重 $c_i$ 写进量化误差与 Hessian;EAQuant 把各专家与路由器的平滑需求合成一个可融合的平滑向量,并用 KL 约束量化前后的路由分布.
- DeepSeek-V3 用 FP8 训练,激活按 1×128,权重按 128×128 分组缩放,每 128 个元素提升到 CUDA Core 做 FP32 累加.K3 后训练全程做 QAT,专家权重 MXFP4,激活 MXFP8,其余模块保持较高精度.
- 专用硬件主要处理「专家权重大但每次只用一小部分」:FPGA 上做专家预测与预取(FLAME),近数据计算把冷门专家留在 CXL 内存里算(MoNDE),存内计算按算术强度在 xPU 与 Logic-PIM 之间分工(Duplex).

---

## 1. 问题:参数在专家里,带宽也在专家里

模型权重的存储量为

$$
M=P\cdot\frac{w}{8} \tag{1}
$$

字节,$P$ 为参数量,$w$ 为每参数比特数.MoE 的 $P$ 大部分在专家里.按门控 FFN 每个专家 $3dH$ 个参数估算:

| 模型 | 每专家 $3dH$ | 路由专家合计 | 总参数 | 占比 |
|------|-------------|-------------|--------|------|
| Mixtral 8×7B($d=4096,H=14336$,32 层,8 专家) | $1.76\times10^8$ | 45.1B | 46.7B | 约 97% |
| DeepSeek-V3($d=7168,H=2048$,58 个 MoE 层,256 路由专家) | $4.40\times10^7$ | 654B | 671B | 约 97% |
| Kimi K3($\ell=3584,H=3072$,92 个 MoE 层,896 路由专家) | $3.30\times10^7$ | 约 2.72T | — | 约 98% |

Mixtral 的推导见 [03](../03-MoE负载均衡与容量/03-MoE负载均衡与容量.md) 第 9 节,K3 的推导见 [04](../04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md) 第 2.2 节(K3 的层数按 93 层中 1 层稠密估算).V3 按式 (1) 以 BF16 存储约 1.34 TB,4 bit 约 0.34 TB.

只压缩专家时,总存储为专家部分与其余部分之和.以 V3 为例,路由专家按式 (2) 的 MXFP4(4.25 bit)存储约 $654\times10^9\times4.25/8\approx347$ GB,其余约 17B 参数保持 BF16 约 34 GB,合计约 381 GB,是全 BF16 的 28%.其余部分只占参数的 3%,却占了压缩后存储的 9%;位宽继续降低时,未压缩部分的占比还会上升.K3 的路由专家按 MXFP4 约 $2.72\times10^{12}\times4.25/8\approx1.45$ TB,BF16 则需约 5.44 TB.

另一方面,decode 时每个专家只处理少量 token,专家 GEMM 的算术强度约为 $2n/b$(见 [05](../05-MoE系统-并行通信与部署/05-MoE系统-并行通信与部署.md) 式 (7)),受显存带宽限制.权重比特数减半,读权重的时间也近似减半.以 V3 的单个路由专家为例,$4.40\times10^7$ 个参数在 BF16 下约 88 MB,MXFP4 下约 23.4 MB;按 H100 SXM 约 3.35 TB/s 的显存带宽,读一遍分别约 26 μs 与 7 μs.decode 时每个 MoE 层每张卡要读的专家数取决于本卡上被激活的专家,读权重的时间按这个比例累加.所以 MoE 量化同时解决放不下和读得慢两个问题.

MoE 量化的特有困难有三类.一是校准不均:训练后量化(PTQ)用一小批校准数据估计每层的统计量,而路由让每个专家只看到分给它的 token,冷门专家的样本可能很少.二是路由敏感:路由器的 logits 被量化误差扰动后,Top-$k$ 集合会变,下游所有计算都换了专家.三是规模:专家数以百计乃至上千,逐个专家调用稠密模型的量化流程,GPU 利用率低.

![专家级混合精度示意](./images/fig-moe-quant-expert-mixprec.png)

**图 1 解析**

- 路由器保持较高精度,各专家按重要性取不同位宽(INT8,INT4,三值).这对应 MoE 量化的常见做法:参数主要在专家里,压缩集中在专家上;路由器参数少且对扰动敏感,保持高精度.
- 图中路由器有一条边指向共享专家.共享专家处理所有 token,不经过路由选择(见 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) 第 3 节),这条边应去掉.
- 图中把 QMoE 标在单个专家 E3 上.QMoE 对所有专家统一做三值化,不是逐专家的混合精度;逐专家选位宽是另一类方法.K3 的做法也是全部路由专家统一 MXFP4.

---

## 2. 低比特格式

### 2.1 分组缩放

低比特整数量化通常按组共享缩放因子:一组 $g$ 个权重共享一个缩放 $s$,$\hat w=s\cdot\mathrm{round}(w/s)$.组越小,缩放越能适应局部的数值范围,额外存储越多.每参数的有效比特数为 $w+w_s/g$,$w_s$ 是缩放因子的比特数.

OCP 的 Microscaling(MX)格式把这个思路标准化:每 32 个元素共享一个 8 bit 的 2 的幂缩放(E8M0).MXFP4 的元素是 4 bit 浮点(E2M1),有效比特数为

$$
w_{\mathrm{eff}}=4+\frac{8}{32}=4.25 \tag{2}
$$

MXFP8 的元素是 8 bit 浮点,有效比特数 8.25.缩放取 2 的幂,反量化只需要调整指数.

E2M1 能表示的绝对值只有 0,0.5,1,1.5,2,3,4,6 八个,加上符号共 15 个不同的值(正负零重合).这些值在 0 附近密,在大值处稀,与权重近似正态分布,大部分值集中在 0 附近的形状相符;INT4 的 16 个值是等间距的.作为对照,INT4 每 128 个元素共享一个 FP16 缩放时有效比特数为 $4+16/128=4.125$,比 MXFP4 少,但缩放的粒度粗 4 倍,同一组内的离群值会影响更多的元素.MX 的缩放只能取 2 的幂,块内最大值映射到 6 附近时会有最多约一倍的余量浪费;块只有 32 个元素,这个损失被更细的粒度抵消了一部分.

### 2.2 DeepSeek-V3 的 FP8 训练

V3(DeepSeek-AI,[arXiv:2412.19437](https://arxiv.org/abs/2412.19437))第 3.3 节用 FP8 做大规模预训练.FP8 的动态范围窄,按整个张量的最大绝对值缩放时,少数离群值会让其余元素的有效精度下降.V3 改为细粒度缩放:激活按 1×128 的 tile 分组(每个 token 每 128 个通道一个缩放),权重按 128×128 的块分组.缩放因子在线计算,不使用依赖历史最大值的延迟量化.分组之后所有张量都用 E4M3,不再在反向使用 E5M2.

第二个问题是累加精度.报告测得 H800 上 FP8 GEMM 的 Tensor Core 累加只保留约 14 bit,$K=4096$ 的随机矩阵乘最大相对误差接近 2%.V3 每累加 $N_C=128$ 个元素(相当于 4 次 WGMMA)就把部分和复制到 CUDA Core 的 FP32 寄存器中累加,分组缩放因子也在这一步乘上.两个 warpgroup 交替做提升与 MMA,Tensor Core 利用率基本不受影响.

与 MoE 直接相关的是通信:MoE 上投影之前的激活量化为 FP8 再 dispatch,combine 保留 BF16(见 [05](../05-MoE系统-并行通信与部署/05-MoE系统-并行通信与部署.md) 第 3.5 节).

### 2.3 Kimi K3 的 MXFP4 量化感知训练

K3(Moonshot AI,[arXiv:2607.24653](https://arxiv.org/abs/2607.24653))为降低部署显存与成本,把 MoE 专家权重量化到 MXFP4,激活用 MXFP8 计算;注意力投影,LatentMoE 的上下投影,共享专家与路由器保持较高精度.与 PTQ 不同,K3 在整个后训练阶段(SFT 与 RL)做量化感知训练(QAT),让模型适应量化误差;RL 中 rollout 与训练使用同一量化方案,消除训练与推理的不一致.按第 1 节的占比,只量化路由专家已经覆盖约 98% 的参数.保持高精度的几类模块都是每个 token 必经的:路由器决定选哪些专家,扰动会改变 Top-$k$;共享专家与注意力处理所有 token;LatentMoE 的上下投影把 $d$ 维隐状态映射到 $\ell$ 维后才进入专家,误差会传给所有路由专家.这几部分参数少,保留高精度的存储代价小.

---

## 3. 逐层量化的目标

多数 PTQ 方法逐层求解

$$
\hat{\mathbf W}=\arg\min_{\hat{\mathbf W}}\bigl\|\mathbf W\mathbf X-\hat{\mathbf W}\mathbf X\bigr\|_F^2 \tag{3}
$$

$\mathbf X$ 是该层在校准数据上的输入.式 (3) 对 $\hat{\mathbf W}$ 的每一行独立,所以逐行求解.GPTQ 用二阶信息求解,所需的 Hessian 为 $\mathbf H=2\mathbf X\mathbf X^{\top}$,按固定顺序逐列量化.量化第 $q$ 列时,把该列的舍入误差按 $\mathbf H^{-1}$ 分摊到尚未量化的列上:

$$
\boldsymbol\delta=-\frac{w_q-\mathrm{quant}(w_q)}{[\mathbf H^{-1}]_{qq}}\,(\mathbf H^{-1})_{:,q} \tag{4}
$$

$w_q$ 是当前行第 $q$ 个权重,$\boldsymbol\delta$ 加到这一行剩余的权重上.$\mathbf H$ 对同一层的所有行相同,只需求一次逆(实际实现用 Cholesky 分解).为保证可逆,GPTQ 在对角线上加阻尼,默认取对角线均值的 1%.AWQ 根据激活分布选择缩放,保护对输出影响大的权重通道.

用到 MoE 上,专家 $E$ 的 $\mathbf X$ 只包含被路由到 $E$ 的 token,设为 $n_E$ 个,则 $\mathrm{rank}(\mathbf H_E)\le n_E$.输入维度为 $d$ 时,$n_E<d$ 意味着 $\mathbf H_E$ 必然奇异,只能靠阻尼项求逆,式 (4) 的补偿方向主要由阻尼决定.做一个估算:校准集 128 条长度 2048 的序列共 262144 个 token,按 V3 的 Top-8 / 256 平均每个专家约 8192 个 token,只比 $d=7168$ 略多;一个使用频率为平均值十分之一的冷门专家只分到约 819 个 token,远少于 $d$.

式 (3) 也把每个 token 一视同仁,而专家输出要乘门控权重 $c_i$ 后才进入残差流.后面几种方法分别处理这几点.

---

## 4. QMoE:三值化与字典编码

### 4.1 规模问题

QMoE(Frantar & Alistarh,[arXiv:2310.16795](https://arxiv.org/abs/2310.16795))的对象是 SwitchTransformer-c2048:1.6T 参数,BF16 下 3.2 TB.逐层 GPTQ 需要保存海量中间激活,逐专家运行时 GPU 利用率低.QMoE 的系统设计包括:激活与权重放在 CPU 内存,每次只把一个专家和它的输入 token 取到 GPU,算完写回;权重大到 CPU 内存也放不下,按需从磁盘懒加载;把多个专家的 $\mathbf X_E$,$\mathbf H_E$,$\mathbf W_E$ 堆成三维张量做批量 GPTQ,16 个专家一组时比逐专家快约 6 倍.整个压缩在单张 GPU 上不到一天完成;校准样本默认 128 专家模型 10K 条,2048 专家模型 160K 条.

### 4.2 自然稀疏

量化网格按行取最小值与最大值,三值即 $\{w_{\min},0,w_{\max}\}$.网格宽,而权重近似正态分布,量化后大量权重落在 0 上.论文 Table 4 的自然稀疏(各层平均):

| 模型 | 2-bit | 三值 |
|------|-------|------|
| base128 | 72.2% | 85.7% |
| large128 | 73.1% | 86.4% |
| c2048 | 76.5% | 88.6% |

模型越大,稀疏越高.直接存稀疏格式不划算:标记非零位置的 bitmask 就要每权重 1 bit,改存非零元素的列索引则每个非零元素要十几 bit.QMoE 改为利用低熵做编码.设三值权重近似独立,零的概率为 $p_0$,两个非零值各占一半,每权重的熵为

$$
\mathcal H=-p_0\log_2p_0-(1-p_0)\log_2\frac{1-p_0}{2} \tag{5}
$$

论文举例取 $p_0=0.885$.代入式 (5):第一项 $-0.885\log_20.885\approx0.885\times0.176\approx0.156$,每个非零值的概率为 $0.0575$,第二项 $-0.115\log_20.0575\approx0.115\times4.12\approx0.474$,合计 $\mathcal H\approx0.63$ bit,相对 16 bit 的理论压缩率约 25 倍.作为对照,不利用稀疏而直接存三值需要 $\log_23\approx1.58$ bit,实际按 2 bit 打包;存 2-bit 量化结果需要 2 bit.熵编码能把每权重压到 1 bit 以下,前提是零的比例足够高.

### 4.3 字典编码与 GPU 解码

Huffman 一类变长码压缩率高,但 GPU 解码困难:第 $i$ 个符号要等前面所有符号的长度确定;同一个 32 位字里解出的符号数不同,warp 内线程执行不齐;变长解码需要大量移位;MoE 的单个矩阵不大,难以切成足够多的独立段.QMoE 改用定长码字对应变长符号序列的字典码(与 LZW 同类):把相邻两个三值权重组成一对,按概率生成 $2^{16}$ 个最常见的序列,每个序列最多 14 对;码字正好是 UINT16,每个码字映射到两个 UINT32,存最多 7 对值(每个三值 2 bit)和对数.每个 warp 负责权重矩阵的一行,各行独立编码,一个 warp 一次处理一个码字.字典在多个矩阵之间共享,本身的存储开销可以忽略.

真实 c2048 三值模型上的压缩率为 20.07 倍,从式 (5) 的分布直接采样的矩阵为 21.11 倍,差约 5%,说明独立性假设对大模型接近成立;与理论压缩率相差约 20%.Table 7 中 c2048 只算 MoE 部分为 20.07 倍,含未压缩的稠密层与元数据整体为 19.81 倍,即约 0.807 bit/参数,检查点从 3142 GB 降到 158.6 GB.压缩后的模型可以在 4 张 A6000 或 8 张 RTX 3090 上完整运行,不需要卸载,相对理想的未压缩执行慢不到 5%.

---

## 5. 专家感知的校准

### 5.1 MoEQuant

MoEQuant(arXiv:[2505.03804](https://arxiv.org/abs/2505.03804))把 MoE 的问题归为两种不均.专家间不均:校准样本在专家之间分布不均,冷门专家校准不足且有偏.专家内不均:同一专家收到的 token 与它的关联程度不同,门控权重 $c_i$ 有大有小,而式 (3) 平等对待.

对专家间不均,EBSS(Expert-Balanced Self-Sampling)不用外部数据集,而用模型自采样生成校准序列,目标是困惑度低(与模型自身分布一致)且专家使用频率的标准差 $\sigma$ 小:

$$
\mathcal D^{*}=\arg\min_{\mathcal D}\Bigl\{\mathrm{PPL}(\mathcal M,\mathcal D)\cdot\exp\Bigl(\frac{\sigma(\mathcal M,\mathcal D)}{\tau}\Bigr)\Bigr\} \tag{6}
$$

$\tau$ 控制均衡项的权重.直接求解是 NP 难的子集选择问题.EBSS 保留 $w$ 条分支做束搜索,每步按「平均负对数概率 $+\sigma/\tau$」打分,舍弃低概率的分支,复杂度从 $O(m^n)$ 降到 $O(wn)$.专家分布的计算推迟到分支层面,避免对词表中每个候选 token 都跑一遍路由.

对专家内不均,AGQ(Affinity-Guided Quantization)把门控权重写进量化误差:

$$
\mathcal L(\hat{\mathbf W})=\sum_i c_i\,\bigl\|\mathbf W\mathbf x_i-\hat{\mathbf W}\mathbf x_i\bigr\|_F^2 \tag{7}
$$

论文的依据是专家输出 $c_iE(\mathbf x_i)$ 中的 $c_i$ 可以近似移到专家内部任一线性层上,因此每个 token 对该层权重的影响按 $c_i$ 缩放.对 GPTQ,Hessian 相应改为

$$
\mathbf H=(\mathbf X\sqrt{\mathbf c})(\mathbf X\sqrt{\mathbf c})^{\top}=(\mathbf X\cdot\mathbf c)\mathbf X^{\top} \tag{8}
$$

门控权重高的 token 在误差中占比更大.论文 Table 1(4 bit 权重量化)中,Mixtral-8x7B 的 GSM8K 从 GPTQ 的 57.92 提高到 MoEQuant++ 的 61.79,平均精度从 53.42 提高到 55.58(全精度 56.80);DeepSeek-MoE-16B 的 HumanEval 从 22.56 提高到 25.00(全精度 26.83);Qwen-MoE-14B 的 GSM8K 从 AWQ 的 36.77 提高到 42.22.摘要中报告 DeepSeek-MoE-16B 在 4 bit 下 HumanEval 提高超过 10 个点,对比对象与上面的 GPTQ 基线不同.

两种不均的处理位置不同.EBSS 改变的是 $\mathbf X$ 本身,让冷门专家的 $n_E$ 增大,针对第 3 节的秩问题;AGQ 改变的是 token 在式 (3) 里的权重,不改变 $n_E$.两者可以叠加.式 (8) 把 $\sqrt{c_i}$ 乘到每个 token 的输入列上,GPTQ 的其余流程(式 (4) 的逐列补偿)不需要修改.

### 5.2 EAQuant

EAQuant(arXiv:[2506.13329](https://arxiv.org/abs/2506.13329))面向权重与激活同时量化(W4A4,W3A4,W3A3,W2A4),处理三个问题.

激活离群值:SmoothQuant 一类方法按通道计算平滑向量 $s_j=\max|x_j|^{\alpha}/\max|W_j|^{1-\alpha}$,把激活的数值范围转移到权重上,再把 $\mathrm{diag}^{-1}(s)$ 融合进前面的归一化层.MoE 中若每个专家各算一个平滑向量,它们无法同时融合进同一个归一化层.EAQuant 先算各专家的需求,再与路由器的需求合并:

$$
\bar s_j=\max\Bigl(\mathbb A_{i}\Bigl(\frac{\max|x^{i}_j|^{\alpha}}{\max|W^{i}_j|^{1-\alpha}}\Bigr),\;\frac{\max|x_j|^{\alpha}}{\max|W^{\mathrm{gate}}_j|^{1-\alpha}}\Bigr) \tag{9}
$$

$\mathbb A$ 是对各专家的聚合,路由器项保证路由器的输入也被平滑.统一向量融合进归一化层,路由器与各专家的计算都与原来等价.

路由敏感:低位宽下各专家收到的 token 数差异放大.EAQuant 用 KL 散度对齐量化前后的路由 logits 分布;消融显示只对 Top-$k$ 个被选专家计算 KL(KL-Top)效果最好,OLMoE-7B 在 W4A4 下平均精度从 DuQuant 的 66.69 提高到 67.97.

校准不均:冷门专家的样本不足,缩放因子会拟合到噪声上,EAQuant 对校准数据做专家层面的均衡.

在 W4A4 下,EAQuant 在 OLMoE-7B,DeepSeek-MoE-16B,Mixtral-8x7B 上的平均精度比 DuQuant 分别高 1.37%,1.15%,1.15%;在三种模型与各种极低位设置下,平均精度提升范围为 1.15%–13.81%.

### 5.3 其他方向

MiLo(arXiv:[2504.02658](https://arxiv.org/abs/2504.02658))采用先量化后补偿:用不依赖校准数据的方法把专家量化到 INT3,再为量化残差加一组低秩补偿矩阵,秩按各权重矩阵的特性自适应选择,量化与补偿迭代联合优化;它还写了适配 Tensor Core 的 INT3 kernel.不依赖校准数据,也就避开了第 3 节的校准不均.MoQa(arXiv:[2503.21135](https://arxiv.org/abs/2503.21135))把数据与模型的分布分成多个阶段分析(稀疏激活,数据到参数的映射,专家间相关性),据此判断专家与参数的重要性,做细粒度的混合精度.

---

## 6. 专用硬件

### 6.1 FPGA

MoE 在 FPGA 上的难点是片上存储小,而专家权重大且每次只用其中几个.

Edge-MoE(arXiv:[2305.18691](https://arxiv.org/abs/2305.18691))面向多任务 ViT 模型 M³ViT,其中专家按任务稀疏激活.通用部分包括:自注意力的重排使带宽需求与并行度无关;单遍 softmax 近似;低成本 GELU 近似;几乎所有层共享的统一计算单元.MoE 部分用 patch 重排消除专家带来的额外访存.在 ZCU102 上实测,能效是 A6000 GPU 的 2.24 倍,Xeon 6226R CPU 的 4.90 倍.

UbiMoE(arXiv:[2502.05602](https://arxiv.org/abs/2502.05602))同样面向 MoE-ViT:注意力用延迟优化的流式 kernel,线性层用资源复用的 kernel,再用两阶段启发式搜索按 FPGA 资源约束调硬件参数.相对已有 FPGA 设计,在 ZCU102 与 Alveo U280 上吞吐分别提高 1.34 倍与 3.35 倍,能效提高 1.75 倍与 1.54 倍.

FLAME(Lin et al.,DAC 2024,[doi:10.1145/3649329.3656507](https://doi.org/10.1145/3649329.3656507))基于两点观察:专家权重大但访问冷,适合做权重稀疏;各层的专家激活路径高度偏斜,可以预测.它对专家权重做 N:M 剪枝;用循环专家预测(CEPR)在路由结果确定前把预测的专家权重从外存预取到片上缓存;剪枝感知的专家缓冲(PA-BUF)把两种稀疏结合起来.片上只有两个专家缓存时预测准确率为 84.4%,相对 CPU 与 GPU 分别加速 4.12 倍与 1.49 倍.

### 6.2 近数据计算与存内计算

专家参数放不进 GPU 时,常规做法是卸载到主机内存,用到时再搬到 GPU.搬参数的代价与专家大小成正比,而 token 激活小得多.以 Mixtral 为例,一个专家 $1.76\times10^8$ 个参数在 BF16 下约 352 MB,一个 token 的输入激活只有 $4096\times2$ 字节,即 8 KB;即便一批里有上千个 token 路由到这个专家,激活也只有几 MB,比参数小两个数量级.

MoNDE(Kim et al.,DAC 2024,arXiv:[2405.18832](https://arxiv.org/abs/2405.18832))把专家参数存放在带近数据处理(NDP)单元的 CXL 内存设备中.路由偏斜使少数热门专家处理大部分 token,MoNDE 只把热门专家搬到 GPU,冷门专家在内存设备内就地计算,GPU 只把注意力输出等激活发过去,再取回结果,即用激活移动替代参数移动,并在 GPU 与 MoNDE 之间做负载均衡.设备内存参考商用 CXL 内存:LPDDR,单芯片 16 Gb,最高 8533 MT/s,每个模块 32 颗芯片,64 GB,68 GB/s,8 个通道共 512 GB.

Duplex(arXiv:[2409.01141](https://arxiv.org/abs/2409.01141))从算术强度(Op/B)出发.continuous batching 下 MoE 层的 Op/B 至少为 1,并随 batch 中共享同一专家的请求数波动;GQA 注意力为 4–8.传统 PIM 把计算单元放在 DRAM die 内,只适合 Op/B 低于 1 的运算.Logic-PIM 增加 TSV,在 logic die 上放更强的计算单元,适合 Op/B 在几到几十之间的运算.Duplex 在一个设备里组合面向高 Op/B 的 xPU 与 Logic-PIM,按每层的 Op/B 选择处理器,并让专家与注意力协同处理.相对 GPU 系统,推理吞吐最高提高 2.67 倍,能耗降低 42.0%.

PIMoE(Wu et al.,DAC 2025,[doi:10.1109/DAC63849.2025.11132528](https://doi.org/10.1109/DAC63849.2025.11132528))组合 NPU 与 PIM.节流感知的任务卸载在 NPU 与 PIM 之间分配任务以平衡负载;内存控制器旁的数据压缩单元解决两者稀疏数据布局不一致的问题,提高传输效率.相对 A100 加速 4.5 倍,能效提高 13.7 倍,相对已有 MoE 平台加速 1.4 倍.

这几项工作的共同出发点是 MoE 层的低算术强度与专家访问的偏斜:前者让带宽比算力更重要,后者让「热门专家放近处,冷门专家就地算」成为可行的分工.

---

## 7. 失效模式

| 现象 | 原因 | 处理 |
|------|------|------|
| 量化后某些专家质量下降明显 | 冷门专家校准样本少,$\mathbf H$ 估计不准 | 专家均衡的校准集(MoEQuant 的 EBSS),或不依赖校准的方法(MiLo) |
| 量化后路由结果变化 | 路由 logits 被扰动 | 路由器保持高精度,或用 KL 对齐量化前后的路由分布(EAQuant) |
| 逐专家平滑后无法融合 | 各专家的平滑向量不同,共用一个归一化层 | 合并为统一平滑向量,见式 (9) |
| 冷门专家的 $\mathbf H_E$ 奇异 | $n_E$ 小于输入维度 $d$ | 增大校准集或做专家均衡采样;阻尼只能保证可逆 |
| 三值化后直接存稀疏格式,压缩率不升 | 位置元数据每权重至少 1 bit | 利用低熵做编码,如 QMoE 的字典码 |
| 变长码解码慢 | 顺序依赖,warp 分歧,移位多 | 定长码字对应变长序列,每 warp 一行 |
| 逐专家跑 GPTQ 太慢 | 专家矩阵小,数量多 | 多个专家堆成批量 GPTQ |
| FP8 训练损失偏离 | 张量级缩放受离群值影响,Tensor Core 累加精度不足 | 1×128 / 128×128 分组缩放,每 128 个元素提升到 FP32 累加 |
| PTQ 低位宽下 RL 训练与推理不一致 | rollout 与训练精度不同 | 后训练全程 QAT,rollout 与训练同一量化方案(K3) |
| 卸载推理时 PCIe 成为瓶颈 | 每次搬整个专家的参数 | 热门专家常驻 GPU,冷门专家在内存侧计算(MoNDE) |

---

## 参考文献

1. Frantar, E., & Alistarh, D. (2023). [QMoE: Practical Sub-1-Bit Compression of Trillion-Parameter Models](https://arxiv.org/abs/2310.16795). Table 4,Table 7.
2. MoEQuant: Enhancing Quantization for Mixture-of-Experts Large Language Models via Expert-Balanced Sampling and Affinity Guidance. (2025). [arXiv:2505.03804](https://arxiv.org/abs/2505.03804). Table 1.
3. EAQuant: Enhancing Post-Training Quantization for MoE Models via Expert-Aware Optimization. (2025). [arXiv:2506.13329](https://arxiv.org/abs/2506.13329).
4. MiLo: Efficient Quantized MoE Inference with Mixture of Low-Rank Compensators. (2025). [arXiv:2504.02658](https://arxiv.org/abs/2504.02658).
5. (2025). [MoQa: Rethinking MoE Quantization with Multi-stage Data-model Distribution Awareness](https://arxiv.org/abs/2503.21135).
6. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). §3.3 FP8 训练.
7. Moonshot AI. (2026). [Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653). MXFP4 量化感知后训练.
8. Open Compute Project. (2023). OCP Microscaling Formats (MX) Specification v1.0.
9. Frantar, E., Ashkboos, S., Hoefler, T., & Alistarh, D. (2022). [GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323).
10. Xiao, G., et al. (2023). [SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models](https://arxiv.org/abs/2211.10438).
11. (2023). [Edge-MoE: Memory-Efficient Multi-Task Vision Transformer Architecture with Task-level Sparsity via Mixture-of-Experts](https://arxiv.org/abs/2305.18691).
12. [UbiMoE: A Ubiquitous Mixture-of-Experts Vision Transformer Accelerator With Hybrid Computation Pattern on FPGA](https://arxiv.org/abs/2502.05602). (2025).
13. Lin, X., et al. (2024). FLAME: Fully Leveraging MoE Sparsity for Transformer on FPGA. DAC 2024.
14. Kim, T., et al. (2024). [MoNDE: Mixture of Near-Data Experts for Large-Scale Sparse Models](https://arxiv.org/abs/2405.18832). DAC 2024.
15. [Duplex: A Device for Large Language Models with Mixture of Experts, Grouped Query Attention, and Continuous Batching](https://arxiv.org/abs/2409.01141). (2024).
16. Wu, L., et al. (2025). PIMoE: Towards Efficient MoE Transformer Deployment on NPU-PIM System through Throttle-Aware Task Offloading. DAC 2025.
17. NVIDIA. [H100 Tensor Core GPU Datasheet](https://www.nvidia.com/en-us/data-center/h100/). H100 SXM 显存带宽 3.35 TB/s.
