---
title: "自适应采样：步数跟 DTC 走，不跟维数 d 走"
category: null
tags:
  - adaptive-sampling
  - DTC
  - tau-leaping
  - remasking
  - leave-one-out
published: true
as_of: 2026-08-31
excerpt: "Dmitriev、Huang、Wei（arXiv:2608.23554）证明：均匀与 remasking 扩散用 leave-one-out 一阶采样器时，离散化步数 N=O~(DTC(X0)/ε)，不是环境维 d。τ-leaping 的 O~(d/ε) 是采样器病，不是均匀前向本身。实验是结构化合成分布（二元马尔可夫链、k 分量稀疏混合），精确 LOO 分数，误差只剩离散化。N=20/30/40，T=8，δ=1e-5，7 次平均。不是 LLaDA 8B。DTC 不是 ParallelBench 的 C，也不是 DCD 的 D_TC ELBO 下界。"
---
# 自适应采样：步数跟 DTC 走

[采样与调度](../02-mechanism/sampling.md) 把步数写成测试时的旋钮：切得越细，离散化误差越小，前向越贵。[Score entropy](./score-entropy.md) 把离散反向写成状态比 $p_t(y)/p_t(x)$。[ParallelBench](./parallelbench.md) 问的是数据本身能不能并行。[离散 copula](./discrete-copula.md) 把因子化反向在 ELBO 里留下的总相关写成 $\mathrm{D}_{\mathrm{TC}}$。Dmitriev、Huang、Wei 的 *Provably adaptive sampling with uniform and remasking discrete diffusion models*（arXiv:2608.23554，2026-08-24）问的是另一件事：均匀前向配上常见的 $\tau$-leaping，已有下界随环境维 $d$ 线性涨。这线性是前向过程固有的，还是采样器写错了？

答案写在摘要里。leave-one-out 去噪器给出的一阶采样器，坐标更新可以并行。均匀和 remasking 两条前向都适用，掩码过程是 remasking 的特例。采样误差 $O(\varepsilon_{\mathrm{score}}+\varepsilon)$ 时，离散化步数只要

$$
N=\widetilde{O}\bigl(\mathrm{DTC}(X_0)/\varepsilon\bigr),
\tag{1}
$$

对数因子藏在 $\widetilde{O}$ 里。$\mathrm{DTC}$ 是对偶总相关，量的是「每个坐标在看见其余坐标之后还剩多少依赖」，不是坐标个数。实验全部是合成分布、精确 leave-one-out 分数，$\varepsilon_{\mathrm{score}}=0$，剩下的误差只来自把连续时间切成有限步。没有 LLaDA，没有 GSM8K，没有 tok/s。本篇数字停在 Section 5 的设定：时间地平 $T=8$，早停 $\delta=10^{-5}$，7 次平均。

同一组作者在 COLT 2026 写过掩码扩散的自适应保证，以及均匀过程配 $\tau$-leaping 的 $\widetilde{O}(d/\varepsilon)$ 下界（PMLR 336:2038–2104）。两篇不要焊。COLT 说：掩码可以跟结构走，$\tau$-leaping 在均匀上跟 $d$ 走。本篇说：换采样器，均匀和 remasking 也能跟结构走。

## 1. $\tau$-leaping 的线性 $d$ 从哪来

离散扩散的前向是词表 $[S]^d$ 上的连续时间马尔可夫链。反向速率矩阵需要 concrete score $s_t(y,x)=\Pr(X_t=y)/\Pr(X_t=x)$。实践里只在有限个时刻估 $\widehat{s}$，再在每个区间上拿这份估计去模拟。$\tau$-leaping 假定区间内各坐标独立跳，并且用区间起点的分数去评区间内部的转移。Campbell 等人 2022 已经写过：词表没有序结构时，这种构造要截断。Dmitriev 等人 COLT 证明，均匀前向下，标准 $\tau$-leaping 的复杂度紧到 $\widetilde{O}(d/\varepsilon)$，还有匹配的算法下界。

均匀前向看起来「每个位置独立往均匀词表跳」，维数 $d$ 出现在下界里并不奇怪。掩码前向更友善：未掩的格单调提交，有效跳转集合随时间缩小，自适应保证已经有了。remasking 允许把已提交的格再送进 $\mathrm{REMASK}$，用来改早段错误，理论保证此前几乎空白。作者要证明的不是「均匀过程魔法般不依赖 $d$」，而是「依赖 $d$ 的是 $\tau$-leaping 这份近似，不是 $Q_t$」。

一阶采样器每步只查一次学到的模型。高阶方法每步多次前向（Ren 等人 2026）不在本篇主定理里。均匀化采样器每次只允许一格跳，理论漂亮，并行卖点没了。本篇盯的是「一步可以改许多格」的那一族。

## 2. DTC 量什么，和 $\mathcal{C}$、$\mathrm{D}_{\mathrm{TC}}$ 怎么分

对偶总相关

$$
\mathrm{DTC}(X)=\mathcal{H}(X)-\sum_{i=1}^{d}\mathcal{H}(X^i\mid X^{-i}).
\tag{2}
$$

每个坐标在看见所有别人之后，条件熵之和，再从联合熵里减掉。剩下的是「即便全看见了，坐标之间仍咬着」的那部分。平凡界：$\mathrm{DTC}(X)\le H(X)\le d\log S$。存在高维分布 DTC 根本不随 $d$ 涨。文中例子：均匀放在两条串 $0^d$ 和 $1^d$ 上，环境维任意大，不确定性只有 1 bit。掩码时看一格明文就知道整串；均匀时看腐坏序列里 0 和 1 的失衡，也能猜最初是哪条。恢复难度跟 $d$ 不是一回事。

ParallelBench 的 $\mathcal{C}(Y\mid X)$ 是**数据**上、条件在提示 $X$ 时答案各格的总相关，用来给一步 KL 下界。DCD 的 $\mathrm{D}_{\mathrm{TC}}(p(\mathbf{X}))$ 是联合相对单变量乘积的 KL，写进因子化反向的 ELBO 下界。本篇的 $\mathrm{DTC}(X_0)$ 是干净数据的对偶总相关，写进**均匀 / remasking** 采样器的离散化误差。三个符号都在说「格与格不独立」，出现的不等式、前向过程、是否条件在提示上，全不一样。不要把 $N=\widetilde{O}(\mathrm{DTC}/\varepsilon)$ 抄成「ParallelBench 的 $\mathcal{C}$ 小就能少步」，也不要抄成「DCD 4 步对 128 步的理论依据」。

定理还给出更细的信息论表示：离散化误差能写成前向过程不同时刻、不同坐标之间互信息的积分（Theorem 2）。这句对一般前向都成立，不先假定均匀。均匀和 remasking 上，这份互信息再被 DTC 控制住。分析技术用 Bayes 最优辅助过程：每个离散化节点上，假如你真有 leave-one-out 条件概率，辅助采样器把「切时间造成的错」和「分数估不准造成的错」拆开。前者只跟目标分布、前向、$\{t_k\}$ 有关；后者由 score entropy 损失管，Assumption 1 把各区间损失的加权和收成 $\varepsilon_{\mathrm{score}}$。

## 3. Leave-one-out：区间上拆成 $d$ 条一维链

关键对象不是 $\Pr(X_0^i=b\mid X_t=x)$，是 $\Pr(X_0^i=b\mid X_t^{-i}=x^{-i})$。少看自己当前这一格，条件在别人身上。Gourevitch 等人、Noguerales 等人 2026 从训练目标推出过同样的 leave-one-out / cavity 估计，经验上比普通去噪器好。本篇从 CTMC 反过程推：区间 $[u,\ell]$ 上把这份条件冻在区间起点，构造近似反向速率。得到的 $\widehat{Q}_t(x,x\odot_i b)$ **不依赖** $x^{-i}$。于是整条 $d$ 维链在该区间内分解成 $d$ 条独立的一维 CTMC，可以并行模拟。均匀过程上，这个采样器回到他们的 leave-one-out bridge plug-in；同一套写法覆盖 remasking，掩码是 $p_M=1$ 的退化。

第 $i$ 格在区间终点的抽样，正比于前向核 $\Pr(X_\ell^i\mid X_u^i=b)$ 乘上「到 $u$ 还没跳 / 跳过」两项。没跳的那项带着 leave-one-out 对干净字的预测，跳过的那项带着与数据无关的 $\nu(u,b)$。前向被作者叫作无结构：一格一旦跳，新值与它最初是什么独立。分析吃的就是这口。GIDD 那种「跳到乱词仍跟原词相关」的混合前向，不在主定理里。

$\tau$-leaping 评转移时用区间**起点**的状态去冒充区间内部，还暗用词表的序。截断版每格每步最多跳一次，减轻乱跳，仍不是 Bayes 最优。Figure 3 把三家放在均匀过程上比：本篇采样器最好。多出来的误差，作者写成 $\tau$-leaping 没有对准 Bayes 最优辅助过程，近似误差不是零。

几何网格 $t_{k+1}-t_k\le\kappa\min(1,T-t_{k+1})$ 是定理假设。$\kappa$ 既出现在网格里，也出现在误差 $\kappa\,\mathrm{DTC}(X_0)$ 里。切得越贪心（$\kappa$ 大），同样 $N$ 下离散化项越大。实验里均匀和 remasking 用 $\kappa\approx 1.3$ 的几何网格；掩码用等距网格 $(T-\delta)/N$。网格选错，定理保证还在，经验曲线会很难看。Figure 2 专门把两种网格并排：掩码吃等距，均匀吃几何，remasking 两种都能用。这和 Dmitriev 等人 COLT 对小 DTC 分布的观察一致，不是新的主表数字。

![](./images/fig-adaptive-sampling-dtc.png)

> 图 1：左列是 $\tau$-leaping 的 $d$ 下界、leave-one-out、区间拆成一维链。右列是 DTC 定义、$N$ 跟 DTC、两条合成分布。底栏钉合成实验设定，不是 8B。

**图 1 解析**

- **L0–L1**：线性 $d$ 是问句。COLT 下界对着 $\tau$-leaping。
- **L2**：条件是 $X_t^{-i}$，不是整段含自己。
- **L3**：并行来自区间内速率不看别人，不是来自「一步揭很多格所以快」。
- **R0–R1**：式 (2)(1)。$\widetilde{O}$ 藏 $d$、$S$、$1/\varepsilon$ 的对数。
- **R2**：$p=2/d$，期望大约三段同色块，DTC 是 $O(\log d)$。
- **R3**：$d=2000$ 的 $k$ 混合，DTC 是 $O(\log k)$。
- **R4**：实验用精确 LOO，不训网络。
- **F0**：$N=20/30/40$ 是图注，不是 8B 的采样步。

## 4. 主定理：三块误差

Theorem 1。网格满足上面的几何条件。均匀或 remasking。Assumption 1 成立。算法从噪声 $q_{\mathrm{noise}}$ 出发，输出 $p_{\mathrm{output}}$，

$$
\mathsf{KL}(q_{T-t_N}\Vert p_{\mathrm{output}})\;\lesssim\;\mathsf{KL}(q_T\Vert q_{\mathrm{noise}})+\varepsilon_{\mathrm{score}}+\kappa\,\mathrm{DTC}(X_0).
\tag{3}
$$

三块：初始化（时间地平 $T$ 不够大，终点边际还没混到噪声）、分数估计、离散化。取 $T=O(\log(\varepsilon^{-1}d\log S))$，均匀的噪声是词表均匀；remasking 的噪声是文中那个带 $e^{-T}$ 的混合。于是 $N=\widetilde{O}(\mathrm{DTC}(X_0)/\varepsilon)$ 就让总误差落到 $O(\varepsilon_{\mathrm{score}}+\varepsilon)$。

Proposition 2 把 KL 拆成各区间近似损失加离散化损失，对一般前向都写得出来。后面才用 Grönwall 把均匀 / remasking 的离散化项收成 DTC。证明素描：路径测度 KL 对 Bayes 最优辅助过程拆开；离散化项等于互信息的二阶偏导积分；再对两种 $Q$ 界。读者不需要把附录推一遍。要留下的是：想少步，先问数据的 DTC，再问采样器是不是 leave-one-out，最后才问网络估分准不准。三问顺序反了，就会以为「均匀扩散注定要 $d$ 步」。

掩码过程在本篇实验里当对照，不是新定理的对象。作者写：同样粗的网格上，均匀和 remasking 一直好过标准掩码，因为后两者能改早段错误。理论解释留作未来工作。不要把这句话抄成「掩码已经过时」：8B 开放权重仍是吸收态。本篇连 Transformer 都没训。

## 5. 合成实验：马尔可夫链和 $k$ 混合

两条目标分布都能精确算 leave-one-out，所以采样器吃的是真分数。误差只剩切时间。

二元马尔可夫链。长度 $d$ 的 $\{0,1\}$ 串，$a_1\sim\mathrm{Bern}(1/2)$，下一位以 $1-p$ 保持、以 $p$ 翻转。取 $p=2d^{-1}$，典型样本大约三段同色块（平均翻转两次）。简单计算给出 $\mathrm{DTC}(q_{\mathrm{data}})\le H(q_{\mathrm{data}})=O(\log d)$。环境维涨，DTC 只对数涨。Figure 1 用 $N=20$ 步对比掩码、remasking（$p_M=1/2$）、均匀。三条都随 $d$ 长得温和；均匀和 remasking 好过掩码。KL 用自回归模型拟合生成样本来估：1500 条拟合参数，2500 条估 KL。小维上和精确 KL 对过，作者说吻合。没有一张「$d=100$ 时 KL 等于多少」的主表，曲线在图里。本篇不从像素读数。

Figure 2 把网格拆开，$N=30$，同一条 $p=2/d$ 的链。掩码在等距上明显更好，均匀在几何上更好，remasking 两边都不崩。Figure 3 只盯均匀，$N=40$：$\tau$-leaping、每格每步最多一跳的截断版、本篇采样器。后两者把乱跳管住，本篇最好。多出来的缝是近似误差，不是 DTC 变了。

$k$ 条随机二进制串的均匀混合，再加 $\varepsilon=10^{-10}$ 的全空间均匀，避免支撑空。$\log k\ll d$ 时 $\mathrm{DTC}=O(\log k)$。Figure 4：$d=2000$，$N=20$，$k$ 从 80 扫到 5000，横轴对数。固定 20 步，估出来的 KL 随 $k$ 对数涨，对着 Theorem 1。KL 估法是下界：生成样本对不上 $k$ 条真串的，全部丢进第 $k+1$ 个桶，在 $k+1$ 元分布上算 KL。低维上这近似准，高维才用得动。不要把下界当成精确 KL 再去减 $\tau$-leaping 的数。

没有语言模型。没有「DTC 小所以 LLaDA 可以 20 步」。自然语言的 DTC 有多大，这篇没估。Cai 和 Li 2026 讨论过置信度揭开的次线性复杂度，Wainwright 2026 给过掩码的数据几何，那是别人的定理，本篇实验没用。二元链的 KL 估计器本身是自回归：用生成样本去拟合一个从左到右的模型，再在另一批样本上算 KL。小维上和精确值对过关，大维没有第二套精确器。混合实验把对不上原型串的样本并成一桶，等于把「写错了」的概率质量折叠，KL 只能当下限。图上看对数斜率，不看绝对高度。$d=2000$、$N=20$、$k$ 到 5000，是为了让 DTC 的对数涨和横轴对数对齐；换 $N=5$ 或 $N=200$，斜率还在不在，这篇没扫。时间地平 $T=8$ 对二元词表足够混匀；词表 $50$k 时同一 $T$ 会不会留初始化误差，定理要求 $T$ 随 $\log(d\log S)$ 涨，实验没换 $S$。

掩码、均匀、remasking 三条前向在 Figure 1 上都能「良性依赖维数」，前提仍是 $N=20$ 加精确分数。良性的意思是：KL 不随 $d$ 线性炸，不是 KL 已经小到能当语言模型。合成分布的熵本身只有 $O(\log d)$ 或 $O(\log k)$，任务比语言容易一个数量级以上。ParallelBench 的 Shuffle 随长度趋向零准确率，那种数据的 DTC 不会是 $O(\log d)$。定理给的是「结构好时均匀也可以少步」，不是「所有离散扩散都可以 20 步」。

## 6. 和花园里其他「少步」怎么分

少步蒸馏改权重，让学生几十步拟合老师上千步。本篇不训学生。DCD 4 步对 SEDD 128 步，尺度 GPT-2，改的是一步联合怎么合成。EDLM 的 $1.3\times$ 是墙钟，校正的是因子化提案。dParallel 的 $8.5\times$ 是 GSM8K 时延。SlowFast 的 $15.63\times$ 在 GPQA 长度 1024。这些倍数的分母里都有真实网络和真实任务。本篇的 $N=20$ 是合成链上「精确分数仍够用」的演示。把 20 步抄到聊天，等于把定理的 $N$ 当成产品延迟。

[提交之后还能不能改](./remask-revise.md) 写 ReMDM、GIDD、低置信 remask。本篇 remasking 是前向过程：坐标会经过 $\mathrm{REMASK}$ 辅助态，反向才有机会改字。$p_M=0.5$ 是 Figure 1 的设定，不是 LLaDA 推理时的置信阈值 $0.9$。低置信 remask 是冻结规划器；这里的 remasking 是 $Q_t$ 的定义。ReMDM 改的是反向后验、可以套预训练权重；GIDD 训练时就见乱词。本篇既不改后验公式，也不改训练目标，只改给定分数之后怎么在区间上模拟 CTMC。三篇都出现「改字」，改的层分别是采样启发式、前向 $Q$、以及离散化方案。

[EDLM](./edlm.md) 的重要性采样窗口 $w$ 决定哪些扩散时间做能量校正。本篇的 $\{t_k\}$ 决定连续时间切多碎。一个是提案上的重采样，一个是 CTMC 的离散化。都可以叫「少步」，账本不是同一页。窗口 $w=0.2$ 只校正 $t\in[0.8,1]$；几何网格 $\kappa\approx 1.3$ 让靠近终点的步更密。看起来都在「早段多花算力」，早段的定义相反：EDLM 的 $t$ 从 1 走到 0，早段是接近全掩；本篇反向时间从噪声走到数据，几何网格密的是靠近干净数据的一侧。两套时间箭头不要画在一张日程上。

coAR / NCE 要估配分或报上界；本篇实验不报 PPL，报的是对目标分布的 KL。合成分布的 KL 和 OpenWebText 的上界 PPL 不能减。

## 7. 失效：无结构前向、精确 LOO、没有 8B

定理吃「跳完与原值独立」。训练时若前向会跳到与原文相关的乱词，速率分解那一步要重写。吸收态 8B 的主流前向满足无结构，但 8B 没有精确 leave-one-out。实践里的去噪器估的是 $\Pr(X_0^i\mid X_t)$，不是 $\Pr(X_0^i\mid X_t^{-i})$。Assumption 1 把估分误差收成 $\varepsilon_{\mathrm{score}}$；这颗误差在真实网络上占多大，本篇没有表。实验把它设成零，是为了只看离散化。把 Figure 1 的「均匀好过掩码」搬到 LLaDA，等于假装 8B 也在吃精确腔估计。

KL 有两套估计器，都是近似。马尔可夫链靠拟合 AR；混合靠 $k+1$ 桶下界。曲线形状支持「随 $\log d$ / $\log k$ 走」，绝对值不要当定理常数。7 次平均，没有报标准差表。

$T=8$、$\delta=10^{-5}$ 是实验超参。定理里 $T$ 要大到终点边际接近噪声，对数依赖 $d$ 和 $S$。合成二元词表 $S=2$，和 GPT-2 的 $50$k 差三个数量级。$\widetilde{O}$ 里藏的 $\log S$ 在词表上会显出来，主定理没把这项写进 DTC。

作者自己列的未来工作：为什么实验里均匀 / remasking 好过掩码，还没有定理；技术能否迁到别的离散扩散。8B、Dream、指令模型，摘要和实验都没写。嵌套 SMC 那篇把 Dream-7B / LLaDA 写在未来工作，至少点了名。本篇连点名都没有。

一阶与高阶不要混。Ren 等人的高阶格式每步多次查模型，本篇明确不比。Chen 和 Ying 的均匀化采样器消掉离散化误差，代价是步数再跟 $d$ 走、一步只跳一格。产品若已经在用低置信 remask 加块扩散，本篇不能告诉你该把 $N$ 设成 DTC 除以 $\varepsilon$：你没有 DTC 的估计器，也没有 leave-one-out 头。能用的是判断：看见有人把均匀扩散的慢归罪于 $Q_t$，先问他用的是不是 $\tau$-leaping。换采样器之前，不要先换前向。吸收态 8B 继续用掩码，不是因为本篇否定了均匀，是因为开放权重、工具链、任意顺序损失都焊在吸收态上。理论许可和工程默认是两件事。

## 8. 读完应留下的判断

均匀扩散配 $\tau$-leaping 要付线性 $d$，是采样器的病。leave-one-out 一阶采样器把区间拆成并行的一维链之后，步数跟 $\mathrm{DTC}(X_0)$ 走。二元马尔可夫 $p=2/d$ 时 DTC 是 $O(\log d)$；$k$ 混合时是 $O(\log k)$。图上 $N=20$ 已经能看见维数自适应，前提是分数精确、分布合成、$T=8$。自然语言有没有小 DTC，这篇没测。$\mathrm{DTC}$、ParallelBench 的 $\mathcal{C}$、DCD 的 $\mathrm{D}_{\mathrm{TC}}$ 三套符号不要焊。图 1 底栏写了 Not LLaDA 8B，正文就按这句读。读完应能指着式 (1) 说出步数跟谁走，指着式 (3) 说出三块误差，指着 Figure 1 的设定说出 $N=20$、$T=8$、7 次平均。指不出评测器时，不要把合成 KL 曲线抄进对照文的吞吐表。实验代码若公开，以论文 Section 5 的 $1500/2500$ 划分和 $k+1$ 桶为准。马尔可夫链与混合两条不要共用同一套 KL 估计器。公开仓库未当作事实源。

## 参考文献

- [Dmitriev, Huang, Wei. Provably adaptive sampling with uniform and remasking discrete diffusion models. arXiv:2608.23554](https://arxiv.org/abs/2608.23554)：式 (1)(2)(14)；Theorem 1–2；Section 5；Figure 1–4。
- Dmitriev, Huang, Wei. Efficient sampling with discrete diffusion models: sharp and adaptive guarantees. COLT 2026, PMLR 336:2038–2104。掩码自适应；均匀 $\tau$-leaping 的 $\widetilde{O}(d/\varepsilon)$ 下界。
- [Lou et al., SEDD](https://arxiv.org/abs/2310.16834)：score entropy，Assumption 1 用的损失。
- [Campbell et al., 2022](https://arxiv.org/abs/2205.14987)：CTMC 离散扩散；$\tau$-leaping。
- [Kang et al., ParallelBench](https://arxiv.org/abs/2510.04767)：$\mathcal{C}(Y\mid X)$，不要和 DTC 焊。
- [Liu et al., DCD](https://arxiv.org/abs/2410.01949)：$\mathrm{D}_{\mathrm{TC}}$ 进 ELBO，不要和 DTC 焊。

## 相关

- [采样与调度](../02-mechanism/sampling.md)
- [Score entropy](./score-entropy.md)
- [ParallelBench](./parallelbench.md)
- [离散 copula](./discrete-copula.md)
- [EDLM](./edlm.md)
- [提交之后还能不能改](./remask-revise.md)
- [少步蒸馏](./few-step-distill.md)
- [从图像到离散](../02-mechanism/from-image-diffusion.md)
- [离散扩散](../02-mechanism/discrete-diffusion.md)
- [失效模式](./failure-modes.md)
