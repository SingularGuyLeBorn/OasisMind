---
title: "离散 copula：外挂 AR 补一步联合"
category: "04-联合依赖与结构设计"
tags:
  - DCD
  - copula
  - few-step
  - SEDD
  - I-projection
published: true
as_of: 2026-08-31
excerpt: "一步因子分解丢掉位置之间的联合。DCD 把扩散的单变量边际和 AR copula 的依赖用 I-投影合起来，两边都不微调。无条件 128 token：DCD 4 步的生成 PPL 对上 SEDD 中档 128 步，少 32 倍函数调用。尺度是 GPT-2 / SEDD，不是 LLaDA 8B。8–32× 对照的是扩散老师自己的多步，不是 AR 墙钟。每步更贵，墙钟不一定掉。"
---
# 离散 copula：外挂 AR 补一步联合

掩码扩散一次前向给出所有仍为 `[MASK]` 的边际。写成乘积，就是假定这些位置在给定当前噪声时条件独立。ParallelBench 把这件事收成条件总相关 $\mathcal{C}(Y\mid X)$；APD 用小 AR 去截断从左到右的草稿。Liu、Broadrick、Niepert、Van den Broeck 的 Discrete Copula Diffusion（ICLR 2025，arXiv:2410.01949）问得更早：少步为什么一直不行，是不是因为反向每一步根本没在建模联合。他们的补法不改权重。扩散继续出单变量边际，另挂一个生成模型专门管依赖，两边用 I-投影合成一步的采样分布。copula 在文里就是那个管依赖的模型，实验里实例化成 GPT-2 small。仓库 [liuanji/Copula-Diffusion](https://github.com/liuanji/Copula-Diffusion)。

摘要写「8 到 32 倍更少去噪步」。正文里钉死的 32 倍，是无条件、长度 128：DCD 用 4 步，生成困惑度对上 SEDD 中档自己用 128 步。对照物是**同一条扩散老师的多步**，评测器是 GPT-2 large，不是 LLaDA 8B，也不是相对自回归的墙钟。引言里「1024 token、1024 步大约 35 PPL、32 步大约 130」是另一段长度上的观察，不要和 128 token 那条 32 倍焊。每步还要跑 copula、还要估一组偏置，作者自己写了：步数少不等于总时间一定少。

## 1. 独立去噪在 ELBO 里留了一项

离散扩散把前向写成每个位置独立乘转移矩阵 $Q_t$。反向却被大多数实现写成

$$
p(\bm{x}_t\mid\bm{x}_{t+1})=\prod_i p(x_t^i\mid\bm{x}_{t+1}).
\tag{1}
$$

一步只改一格时，乘积伤害不大：联合误差被摊到后面很多步里慢慢修。少步时一步要同时改很多格，「alpine」和「skiing」各自边际都合理，合在一起却变成 alpine diving。图像侧少步还能靠连续空间的平滑；词表没有半个 the。从图像到离散那篇已经写过这句，本篇把它收成可证的下界。

总相关是联合相对其单变量乘积的 KL：

$$
\mathrm{D}_{\mathrm{TC}}(p(\mathbf{X})):=\sum_{\bm{x}}p(\bm{x})\log\Bigl(p(\bm{x})\Big/\prod_i p(x_i)\Bigr).
\tag{2}
$$

Proposition 1：只要反向分布逐步都完全因子分解，负 ELBO 就被数据熵加上一串条件总相关从下面顶住：

$$
-\mathrm{ELBO}\;\ge\;\mathrm{H}(p(\mathbf{X}_0))+\sum_{t=1}^{T}\mathrm{D}_{\mathrm{TC}}\bigl(q(\mathbf{X}_{t-1}\mid\mathbf{X}_t)\bigr).
\tag{3}
$$

前向 $q(\mathbf{X}_t\mid\mathbf{X}_{t-1})$ 按定义因子化，$\mathrm{D}_{\mathrm{TC}}$ 为零。反向 $q(\mathbf{X}_{t-1}\mid\mathbf{X}_t)$ 一般不因子化，除非数据本身各位置独立。加步数等于把每步要改的格子变少，这项变小，质量看起来随 $T$ 涨。少步想保住质量，只能放松「逐步完全因子分解」。改网络去直接出联合，文献里几乎没人把序列到序列解码器做成这件事。DCD 选择推理时外挂。

引言给的是 SEDD 生成 1024 个 token：1024 步大约 35 PPL，32 步大约 130。数字来自作者对已发表 SEDD 曲线的转述，不是本篇 Table 1。它只说明少步和步数强相关。真正拿来当「32 倍少步」证据的，是第 4 节 128 token 那条。

## 2. 边际来自扩散，依赖来自 copula

统计里 copula 管的是变量之间怎么连，不管各自边缘长什么样。连续变量有 Sklar：均匀边缘的联合再配上各边缘 CDF，就能还原完整分布。离散更拧，Geenens 2020 用优势比参数化离散 copula。文中 Figure 2 用两个二元变量把一张四格概率表拆开：四个边缘概率决定「哪句更常见」，优势比 $\omega=p_{00}p_{11}/(p_{01}p_{10})$ 决定「alpine skiing / scuba diving」这种搭配相对乱配有多尖。$\omega=125$ 时，模型知道这两对是短语；边缘再决定 skiing 比 diving 更常出现。扩散网络擅长给每个掩码格一张词表分布，不擅长记住 $\omega$。

目标分布 $p_{\mathrm{tar}}$ 假定能从两条通道看见：一组单变量边缘 $\{p_{\mathrm{tar}}(X_i)\}$，以及另一个生成模型给出的估计 $p_{\mathrm{est}}$。I-投影把 $p_{\mathrm{est}}$ 投到「边缘等于目标边缘」的集合上，得到 $\hat p$。信息几何里 I-投影是 $\arg\min_{q\in\mathcal{C}} D(q\|p_{\mathrm{est}})$，解落在指数族

$$
\hat p(\bm{x})\;\propto\;p_{\mathrm{est}}(\bm{x})\prod_i\exp\bigl(\mathbf{V}[i,x_i]\bigr).
\tag{4}
$$

Proposition（文中紧挨 Figure 2）：对任意 $\mathbf{V}$，式 (4) 这种重加权不改 $p_{\mathrm{est}}$ 的 copula，只改边缘。于是只要 $\mathbf{V}$ 选对，$\hat p$ 同时拿到扩散的边缘和 copula 的依赖。这比「用 GPT 直接采样」或「用 SEDD 直接逐步独立采样」都更接近 $p_{\mathrm{tar}}$，前提是两边各自没把那一块信息弄丢。

扩散这边 $p_{\mathrm{dm}}$ 给的是 $\{p_{\mathrm{dm}}(\tilde X_t^i\mid\bm{x}_{t+1})\}$。吸收态前向下，已揭开的位置 $J$ 保持原字，还掩着的位置 $I$ 才需要采样干净字 $\tilde{\bm{x}}_t$，再按前向后验决定这一步要不要真的写进 $\bm{x}_t$。copula 不需要再训一遍扩散目标。吸收态下，任意在干净数据 $p(\mathbf{X}_0)$ 上训过的生成模型，都可以条件在已观察的明文上，去逼近 $q(\tilde{\mathbf{X}}_t\mid\bm{x}_{t+1})$ 里的依赖。实验把 copula 实例化成自回归：

$$
p_{\mathrm{copula}}(\tilde{\bm{x}}_t\mid\bm{x}_{t+1}):=\prod_{i\in I}p_{\mathrm{copula}}(X_0^i=\tilde x_t^i\mid\mathbf{X}_0^{<i}=\tilde{\bm{x}}_t^{<i})\cdot\prod_{j\in J}\mathbbm{1}[\tilde x_t^j=x_{t+1}^j].
\tag{5}
$$

式 (5) 有偏：AR 看不见后面已经揭开的后缀。扩散看得见双向明文，却把 $I$ 里的字写成独立。I-投影把两份残缺焊回去。文中的 Switzerland 例子：后缀「in Switzerland」AR 条件不到，skiing 的边缘不会动；扩散看见 Switzerland 会把 $Y$ 的边缘推向 skiing；投影改边缘、保留 copula 里 alpine 和 skiing 的搭配，句子才变成 how about alpine skiing。

![离散 copula 将扩散边缘分布与自回归联合依赖通过 I 投影组合](./images/fig-dcd-copula-marginals.png)

> 图 1：左列是因子化反向在少步时把联合丢掉。右列 GPT-2 small 当 copula，扩散出边缘，I-投影合成 $\hat p$。底栏 32 倍少的是函数调用次数，尺度停在 GPT-2。

**图 1 解析**

- **L0–L1**：式 (1) 和式 (3)。总相关项不是实现 bug，是独立去噪假设写进 ELBO 的下界。
- **L2–L3**：少步等于一步很多编辑。1024 token 上 SEDD 32 步大约 130 PPL，是引言观察，不是 128 token 实验。
- **R0–R2**：copula 在干净数据上训；不微调扩散、不微调 GPT-2。
- **R3**：从 $\hat p$ 抽出干净草案，再按吸收态后验写回 $\bm{x}_t$。
- **F0**：4 步对 128 步是无条件 128 token。Table 1 是 WikiText-103 填空 MAUVE。不是 APD，也不是 8B。

能量模型当 copula 是同期另一条。Guo 等人 2024 本花园没有独立主表。[EDLM](./edlm.md) 是 Xu 等人 ICLR 2025：残差能量乘在 MDLM 提案上，49% 是 Table 3 GPT-2 2048 步。不要把残差能量和 I-投影写成同一算法。

## 3. I-投影落到一组 logit 偏置

精确求解式 (4) 的 $\mathbf{V}$ 是凸问题，目标写成

$$
\sum_{\tilde{\bm{x}}}p_{\mathrm{copula}}(\tilde{\bm{x}}\mid\bm{x}_{t+1})\prod_i\exp(\mathbf{V}[i,\tilde x^i])-\sum_{i,c}\mathbf{V}[i,c]\,p_{\mathrm{dm}}(\tilde X_t^i=c\mid\bm{x}_{t+1}).
\tag{6}
$$

逐行独立更新、其余行固定为零时，最优是

$$
\mathbf{V}[i,c]=\log p_{\mathrm{dm}}(c\mid\bm{x}_{t+1})-\log p_{\mathrm{copula}}(\tilde X_t^i=c\mid\bm{x}_{t+1}).
\tag{7}
$$

AR copula 给不出式 (7) 右边第二项：前面还有未观察位置，边缘要把它们积掉。作者用扩散自己估。给双向去噪器加上因果注意力掩码，得到只看见前缀明文的 $p_{\mathrm{dm}}(\cdot\mid\bm{x}_{t+1}^{<i})$，当作 copula 边缘的替身，于是实现里实际用的是

$$
\mathbf{V}[i,c]=\log p_{\mathrm{dm}}(c\mid\bm{x}_{t+1})-\log p_{\mathrm{dm}}(c\mid\bm{x}_{t+1}^{<i}).
\tag{8}
$$

式 (8) 不是定理等式，是「两边都接近数据分布」时的近似。扩散要跑两次前向：一次双向出目标边缘，一次因果出对照边缘。然后按 $\hat p\propto p_{\mathrm{copula}}\prod_i\exp(\mathbf{V}[i,\cdot])$ 采样。AR copula 采样时，每一步的 logit 加上对应位置的 $\mathbf{V}[i,\cdot]$，依赖仍由 GPT-2 的因式分解走，边缘被 $\mathbf{V}$ 拧到扩散给出的那张表上。

Algorithm 1 的骨架：从先验抽 $\bm{x}_T$；对 $t=T-1,\ldots,0$，算双向与因果两套扩散边缘，填 $\mathbf{V}$，从带偏置的 copula 抽 $\tilde{\bm{x}}_t$，再按 $q(\mathbf{X}_t\mid\tilde{\bm{x}}_t,\bm{x}_{t+1})$ 决定这一步哪些格真正从掩码变成明文。填空任务另外用「自回归揭开」变体：每步不只改分布，揭开顺序也沿 AR 走，Table 1 报的是这个变体。效率图（文中 Figure 5）用的也是自回归版 DCD。不要把「训练免费」理解成「每步只跑一个网络」。

逐步在实现里其实是两段。$\tilde{\bm{x}}_t$ 是「假如现在已经干净」的整句草案，词表里没有 `[MASK]`。吸收态前向知道：给定干净字和当前噪声水平，这一格是继续掩着还是写成草案，有闭式后验 $q(x_t^i\mid\tilde x_t^i,x_{t+1}^i)$。DCD 没有改这张后验，改的是草案从哪来。独立去噪用 $\prod_i p_{\mathrm{dm}}(\tilde x_t^i\mid\bm{x}_{t+1})$ 抽草案；DCD 用 $\hat p$ 抽草案。少步时草案一次要填几十格，独立抽样会把搭配拆开；$\hat p$ 里 copula 还在，搭配才有机会一起出现。remask 专文里的低置信重掩，是抽完之后再把不尖的格退回掩码。DCD 发生在抽样之前，两刀可以叠，原文实验没有叠。

因果对照那一次前向，不是为了让扩散变成 GPT。它只提供式 (7) 里 AR 给不出的边缘。双向 $p_{\mathrm{dm}}(\cdot\mid\bm{x}_{t+1})$ 看见后缀 Switzerland，skiing 的边缘会被抬高；因果 $p_{\mathrm{dm}}(\cdot\mid\bm{x}_{t+1}^{<i})$ 若 $i$ 还在 Switzerland 前面，这格的边缘里 skiing 不会被后缀拉动。两者取对数差，就是 $\mathbf{V}$：后缀信息以边缘修正的形式灌进 AR 的采样路径，AR 自己的 alpine–skiing 搭配不用重训。这和「把双向注意力焊进 GPT-2」不是一句。GPT-2 权重不动，动的是每格一张偏置表。

## 4. 无条件：4 步对上 128 步

协议：SEDD 中档当扩散老师，GPT-2 small 当 copula。样本长度 128。生成困惑度用 GPT-2 large 评，直接从模型抽样，不用 nucleus。每种设定 10,000 条。噪声日程跟 SEDD 原文的 log-linear。SEDD 扫 2 到 256 步，DCD 扫 2 到 32 步。数据是 WebText 或 OpenWebText 上训过的检查点。

曲线（文中 Figure 3 / 4，编号在 HTML 里打架，以正文句子为准）上，2 到 32 步这一段，DCD 同时好过同步数的 SEDD 中档，也好过单独的 GPT-2 small。作者写的可比工作点：**DCD 4 步的生成困惑度，对上 SEDD 中档 128 步**，函数调用少 32 倍。摘要里的 8 到 32 倍，覆盖的是「少步 DCD 对上多步扩散仍不差」这一整段，不是另一张 8B 表。图上的具体 PPL 点没有进表格，本篇不从曲线上读数。

这条 32 倍是 NFE，不是毫秒。SEDD 一步是一次双向 Transformer；DCD 一步至少还要因果对照、GPT-2 带偏置采样。Figure 5 把横轴换成采样时间，纵轴仍是生成 PPL，另加 MDLM 作扩散基线。作者的判断是：固定墙钟时 DCD 的 PPL 仍更好，到达同一 PPL 所需时间也更短。附录 F 才是效率全表。主文同时写了限制：每步更贵，**DCD 不保证总是加速**。把 32× 抄成「推理快 32 倍」，对照物就写错了。

样本长度 128，不要和引言 1024 token 那条 35 / 130 横减。评测器是 GPT-2 large 的生成 PPL，不是 MAUVE，也不是 WikiText 验证集的正向困惑度。正向似然 DCD 算不出来：推理合成的 $\hat p$ 没有闭式归一化常数，这不是 SEDD 那种可以报 NLL 上界的训练目标。

## 5. Table 1：填空 MAUVE，2 步已经不是两份垃圾的平均

条件生成：长度仍 128。WikiText-103 验证集抽 2,000 条，五种掩码方案，每种 prompt 生成 5 条，一共 10,000 条。MAUVE 用 `evaluate` 包默认超参（Pillutla 等人）。对照是 SSD-LM（100 步与 500 步）、GPT-2 small、SEDD 中档 2/4/8/16/32 步、DCD 同组步数。DCD 用第 3 节末尾的自回归揭开变体。

| 明文区间（其余掩） | GPT-2 | SEDD 2 / 32 | DCD 2 / 32 |
|---|---|---|---|
| $[0.1,0.2]$ 与 $[0.5,0.7]$ | 0.079 | 0.013 / 0.201 | 0.158 / 0.211 |
| $[0.25,0.75]$ | 0.188 | 0.027 / 0.278 | 0.249 / 0.314（16 步 0.314，32 步 0.298） |
| $[0.0,0.1]$ 与 $[0.4,0.6]$ 与 $[0.9,1.0]$ | 0.928 | 0.827 / 0.979 | 0.962 / 0.983 |
| $[0.4,0.5]$ 与 $[0.8,1.0]$ | 0.914 | 0.896 / 0.980 | 0.963 / 0.981 |
| $[0.2,0.3]$ 与 $[0.6,0.8]$ | 0.069 | 0.016 / 0.215 | 0.171 / 0.403 |

中间空洞、两端也空的那一行最能说明「不是两模型取平均」。GPT-2 small 只有 0.069，SEDD 2 步 0.016、32 步 0.215，DCD 2 步已经 0.171，32 步 0.403。SSD-LM 在这一行 100 步 0.041、500 步 0.054，连续嵌入扩散加半自回归，步数堆上去也救不了离散搭配。第一行两段中间空洞：SSD-LM 500 步 0.083，GPT-2 0.079，SEDD 32 步 0.201，DCD 2 步 0.158 已经超过两个非扩散对照，32 步 0.211 略过 SEDD 32 步。中间只留一半明文的第二行，DCD 16 步 0.314 是该行最高，32 步回落到 0.298，作者没有解释回落，本篇也不另编原因。前缀后缀都给得很多的两行，GPT-2 自己已经 0.9 以上，DCD 的空间只剩小数点后第三位，不能拿来当主证据。作者强调：固定 2 到 32 步，DCD 五列都超过两个基座；2 步 DCD 在 GPT-2 和 2 步 SEDD 都崩的任务上仍然能用。

MAUVE 对样本数和「同一 prompt 重复几条」敏感。换一套 500 条 prompt、各生成 1 条，数字会动。本篇只引用这一份 2000×5。不要和 ReMDM 相对 MDLM 的 15.62× MAUVE 横除，那是另一篇、另一对模型、另一套解码。SSD-LM 的 500 步也不是「连续扩散少步」的反例：它步数并不少，只是噪声在嵌入空间。DCD 对照它，是为了说明离散 copula 不是换一条连续噪声就能代替的。

## 6. 抗体填空只当旁证

蛋白不是本花园主线。Gruver 等人 2023 的离散扩散（表里写作 NOS-D）在 OAS 约 104K 条抗体序列上训过。作者再在同一数据上训一个 GPT 当 copula。10 条 paired OAS 种子，两个任务：三个重链 CDR 一起填，或重链与轻链的 CDR1 一起填。NOS-D 按原论文 64 步；DCD 4 步。指标是氨基酸恢复率。

| 方法 | 步数 | HCDR{1+2+3} | {H+L}CDR1 |
|---|---|---|---|
| GPT | — | 57.21 | 90.28 |
| NOS-D | 64 | 51.56 | 88.82 |
| DCD | 4 | 58.28 | 91.58 |

4 步 DCD 超过 64 步扩散，也超过单独的 GPT。它说明 I-投影不是语言词表上的魔术：只要边缘和依赖可以分开估，离散序列都能接。不要把 58.28 写成语言模型准确率，也不要和 LLaDA 的 HumanEval 放在一张表。

## 7. 和 APD、蒸馏、ParallelBench 不是同一刀

三家都在打「一步因子分解」。法律不同。

ParallelBench 给下界 $\mathcal{C}(Y\mid X)$，证明 Shuffle 这种任务即使用每步 2 个 token 也会随 $n$ 趋向 0。它不提供算法。DCD 的 $\mathrm{D}_{\mathrm{TC}}(q(\mathbf{X}_{t-1}\mid\mathbf{X}_t))$ 是去噪链上的总相关，ParallelBench 的 $\mathcal{C}$ 是数据条件总相关，记号别焊成一个 $\mathcal{C}$。

APD（Israel 等人）把揭开顺序钉成从左到右，Dream 7B 出边际草稿，同词表的 Qwen2.5 0.5B 管联合，乘性混合 $R$，有损。要微调吗？APD 训练免费，但必须有同词表小模型，LLaDA 那组实验没跑。DCD 的 copula 是 GPT-2 small，扩散是 SEDD 中档，合成规则是 I-投影而不是投机截断。尺度差两档。APD 专文的 80% GSM8K 和 3.46× SSD 搬不过来。

少步蒸馏（SDTT）改学生权重，让 32 步去拟合老师 1024 步之后的分布。DCD 不蒸、不改 $\theta$。SDTT 的 4× / 8× 是相对**带 KV 的 GPT-2** 的延迟，骨架约 1.3B 未训；DCD 的 32× 是相对 SEDD 自己的步数。FS-DFM 的 128× 对照同一条 DFM 老师。三套分母不能约分。

dParallel 用 certainty-forcing 让更多格在同一步里同时尖，改的是开源 8B 的 LoRA。DCD 发表时 8B 掩码扩散还没成为默认检查点。读 2025 年 ICLR 这篇，不要问它 GSM8K 多少；问的是少步联合谁来补。2026 年若有人把 I-投影接到 LLaDA，那是另一篇，本花园未找到一手表。

ReFusion 的槽间任意顺序、槽内因果，是把联合写进注意力图案：已完成槽排到掩码前面，RoPE 仍用原位置。DCD 不改图案，联合外挂在 GPT-2 里。ReFusion Table 1 平均 TPS 72.62 对 Qwen3-8B，硬件单卡 A100；DCD 没有 8B，没有 TPS 列。两篇都承认「一步里的格子不是独立的」，一个改骨架，一个改采样分布。

## 8. 墙钟、近似、多一个模型

限制写在结论，不是附录里的客气话。第一，必须另备 copula。语言实验捡现成 GPT-2 small；抗体要自己训。第二，I-投影在实现里是逐行独立的式 (8)，不是把式 (6) 凸优化解到停。保证「合成分布不差于任一边」的命题，对着的是精确 I-投影。第三，每步计算更重。双向扩散、因果对照、AR 采样三份前向叠在少步上，NFE 掉 32 倍时，墙钟可能只掉一点，也可能更慢。Figure 5 展示的是他们实现里「固定时间 PPL 仍更好」，不是一张对所有硬件成立的加速表。

训练免费有代价：合成分布没有新的似然上界可报。SEDD 的 1BW 上界 $\le 32.79$ 那种数，DCD 给不出。评测只能走生成 PPL、MAUVE、恢复率。想要少步且仍能报 NLL，走蒸馏或改参数化，不走这篇。

会 KV Cache 的人还要问：GPT-2 copula 是因果的，可以写 KV；扩散老师是双向的，逐步仍可能整段重算。DCD 没把 DualCache 叠进来。Eso-LM 65× 对照无缓存 MDLM，长度 8192、A6000；DCD 32× 对照 SEDD 步数，长度 128。缓存账和 copula 账分开写。Serving 专文的 dInfer 680 TPS 是 8×H800 上的 LLaDA-MoE；本篇一张 GPU 规格都没进主表，效率只存在 Figure 5 那种时间–PPL 曲线里。没有卡型号，就不要把曲线上的「更快到达同一 PPL」抄成 tok/s。

式 (8) 把 copula 边缘换成因果扩散，等于承认 GPT-2 small 的单格边缘不一定可信，可信的是它的搭配。若 GPT-2 的搭配本身是错的，I-投影只会把错误搭配配上更准的边缘。Table 1 里 GPT-2 已经 0.9 的两行，DCD 几乎走平，说明边缘已经不缺、依赖也不缺，合成没有新信息。崩的是空洞多的行：两边各自缺一块，合成才有用。这和 APD 里「扩散边际草稿碰上小 AR 联合」同一直觉，算法不是同一套拒绝采样。

## 9. 读完应留下的判断

少步离散扩散疼，不是因为网络不够大，是因为一步里的乘积假设。DCD 把边缘和依赖拆给两个冻住的模型，用 I-投影合成。4 步对上 128 步，发生在 SEDD 中档、128 token、GPT-2 large 当评测器。Table 1 的 0.403 发生在 WikiText 填空最难的那一行，对照 SEDD 32 步的 0.215。抗体 4 步超过 64 步扩散。尺度停在 GPT-2。不要把 32× 写成对 AR 的加速，不要把 8–32× 抄到 LLaDA 8B，不要和 APD 的同词表投机焊成一种「外挂小 AR」。图 1 左列是 ELBO 里那项总相关，右列才是可跑的算法。权重一行没动。多出来的是两次扩散前向、一个 GPT-2、以及承认每步更贵。

## 参考文献

- [Liu et al., Discrete Copula Diffusion, ICLR 2025](https://arxiv.org/abs/2410.01949)：Proposition 1；式 (5)(8)；无条件 4 步对 128 步；Table 1；抗体表。
- [Lou et al., SEDD, 2024](https://arxiv.org/abs/2310.16834)：扩散老师；1BW 上界不要和 DCD 生成 PPL 焊。
- [Sahoo et al., MDLM, 2024](https://arxiv.org/abs/2406.07524)：效率图里的扩散基线。
- [Israel et al., APD, 2025](https://arxiv.org/abs/2506.00413)：同词表小 AR 管联合，7B，有损投机。
- [Kang et al., ParallelBench, 2026](https://arxiv.org/abs/2510.04767)：$\mathcal{C}(Y\mid X)$ 下界。
- [Deschenaux & Gulcehre, SDTT, 2025](https://arxiv.org/abs/2410.21035)：少步蒸馏，改权重。
- [Li et al., ReFusion, 2025](https://arxiv.org/abs/2512.13586)：槽级联合写进注意力，8B，不是 I-投影。

## 相关

- [采样与调度](../02-mechanism/sampling.md)
- [少步蒸馏](./few-step-distill.md)
- [APD](./apd.md)
- [CoDD](./codd.md)
- [ReFusion](./refusion.md)
- [ParallelBench](./parallelbench.md)
- [Score entropy](./score-entropy.md)
- [推理加速](./inference-acceleration.md)
- [失效模式](./failure-modes.md)
- [EDLM](./edlm.md)
- [自适应采样](./adaptive-sampling.md)
