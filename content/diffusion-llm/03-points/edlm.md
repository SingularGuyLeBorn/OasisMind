---
title: "EDLM：残差能量校正因子化去噪"
category: null
tags:
  - EDLM
  - energy-based
  - importance-sampling
  - MDLM
  - GPT-2
published: true
as_of: 2026-08-31
excerpt: "Xu、Geffner、Kreis 等人（ICLR 2025，arXiv:2410.21357）给 MDLM 的因子化去噪核乘一项残差能量。骨干是 12 层 GPT-2 small 尺度，不是 LLaDA 8B。Table 3 无条件、w=1：GPT-2 评测器、2048 步，MDLM Gen PPL 34.9 对 EDLM-NCE 17.7，约 49%。1.3× 是单条 1024 token、对齐 AR 的 35.7 Gen PPL 时约 13s 对 17s，k=2、w=0.2。Text8 BPC ≤1.24 对 MD4 ≤1.37。OWT 上界 PPL：EDLM-coAR 17.58 对 AR 17.56。不是 DCD 的 32× NFE，不是 CoDD 的 +5.00。"
---
# EDLM：残差能量校正因子化去噪

[离散 copula](./discrete-copula.md) 把一步联合拆成「扩散出边缘、AR 管搭配、I-投影合成」。[CoDD](./codd.md) 冻住 8B，在 logits 上接可算 HMM。[CRoCoDiL](./crocodil.md) 把长程先写进连续草稿。Xu、Geffner、Kreis、Nie、Xu、Leskovec、Ermon、Vahdat 的 Energy-based Diffusion Language Model（ICLR 2025，arXiv:2410.21357）走第四条：不去改边缘怎么估，也不另训回路，而是在已经训好的因子化去噪核上乘一项序列级能量，再靠并行重要性采样从提案里挑。仓库 [MinkaiXu/Energy-Diffusion-LLM](https://github.com/MinkaiXu/Energy-Diffusion-LLM)。

尺度钉死。骨干是 12 层 Transformer，规格对齐 GPT-2 small：OpenWebText 实验隐维 768、12 头；Text8 实验隐维 784（跟 Austin 等人 D3PM 的 Text8 设定）。扩散提案 $p_\theta$ 一律是预训练 MDLM。不是 LLaDA 8B，不是 Dream-7B，主表没有 GSM8K。摘要里两句最容易抄错：最多 49% 的生成困惑度增益，以及大约 $1.3\times$ 采样加速。49% 来自 Table 3、GPT-2 当评测器、2048 步、MDLM $34.9$ 对 EDLM-NCE $17.7$。$1.3\times$ 来自 Figure 1(a)：单条长度 $1024$、对齐 AR 基线 Gen PPL $35.7$ 时，EDLM 大约 $13$ 秒、MDLM 大约 $17$ 秒，重要性采样 $k=2$、窗口 $w=0.2$。DCD 的 $32\times$ 是 128 token 上 4 步对 SEDD 128 步的函数调用。CoDD 的 $+5.00$ 是 LLaDA 低置信 MATH500 256 步。三套分母不能减。

DCD 结论里点过「能量当 copula」是同期另一条（Guo 等人 2024）。那条在本花园没有独立主表。本篇只写 EDLM 自己的公式和表。不要把残差能量和 I-投影写成同一算法。

## 1. 训练看见联合，采样按格独立抽

吸收态扩散的反向，给定当前噪声序列 $\mathbf{x}_t$，理论上要的是整段干净 $\mathbf{x}_0$ 的后验 $q(\mathbf{x}_0\mid\mathbf{x}_t)$。实现里去噪器写成乘积

$$
p_\theta(\mathbf{x}_0\mid\mathbf{x}_t)=\prod_i \mu_\theta^i(\mathbf{x}_t,t).
\tag{1}
$$

已揭开的格直接抄过来，仍为掩码的格各自 softmax。训练损失按格交叉熵，对乘积是对的：期望对数似然在独立假设下正好拆开。采样却一次抽出许多格。一步里「alpine」和「skiing」各自边际都可以尖，合在一起变成 alpine diving。步数少时，后面没有足够多的步把搭配修回来。作者把这件事写成训练分布和采样分布的错位：网络学的是联合的边际切片，用的时候当联合。

[五条性质](./discreteness.md) 把同一条缝叫 L2：格对了，句可以是假的。[ParallelBench](./parallelbench.md) 把下界写成 $\mathcal{C}(Y\mid X)$。EDLM 不换任务、不换骨干尺寸，只问：每一步去噪核能不能不再是乘积。

能量模型直接写 $p(\mathbf{x})\propto\exp(-E(\mathbf{x}))$，配分在词表约 $50$k、长度 $1024$ 上是 $50000^{1024}$ 量级，最大似然要 MCMC，这条路走不通。残差写法把提案留给已经训好的扩散：

$$
p_{\theta,\phi}(\mathbf{x}_0\mid\mathbf{x}_t)=\mu_\theta(\mathbf{x}_0\mid\mathbf{x}_t)\frac{\exp(-E_\phi(\mathbf{x}_0,\mathbf{x}_t,t))}{Z_\phi(\mathbf{x}_t)}.
\tag{2}
$$

$\mu_\theta$ 冻住。能量只负责乘积没写进去的相关。$Z_\phi$ 仍不可精确求，但训练可以躲开它，采样可以用提案上的重要性权重近似。

## 2. 能量从哪来：现成 AR，或 NCE 微调双向头

吸收态有一条便宜性质：未掩的格在反向里原样带走。干净序列 $\mathbf{x}_0$ 和噪声 $\mathbf{x}_t$ 的差别，就是若干位置被换成了掩码。于是条件在已观察明文上的 AR 后验满足

$$
p_{\mathrm{AR}}(\mathbf{x}_0\mid\mathbf{x}_t)\propto p_{\mathrm{AR}}(\mathbf{x}_0).
\tag{3}
$$

比例系数里有一项 $p_{\mathrm{AR}}(\bar{\mathbf{x}}_0)$，对采样是常数。把 $p_{\mathrm{AR}}(\mathbf{x}_0\mid\mathbf{x}_t)$ 当成对真后验的代理，最优残差能量就是

$$
E_\phi(\mathbf{x}_0,\mathbf{x}_t)\approx -\log p_{\mathrm{AR}}(\mathbf{x}_0)+\log p_\theta(\mathbf{x}_0\mid\mathbf{x}_t).
\tag{4}
$$

EDLM-AR 不另训能量网络：预训练自回归模型并行算整句对数似然，减去扩散提案的对数概率。作者的读法是：扩散当提案，AR 当目标，重要性采样是在用并行提案去抽一份本来要从左到右写的分布。

Carry-over（coAR）再把未掩格的条件概率钉成指示函数：这些格不是「AR 再预测一遍」，是直接从 $\mathbf{x}_t$ 抄。此时 $p_{\mathrm{coAR}}(\bar{\mathbf{x}}_0)=1$，去噪核自归一，似然可以报精确 ELBO，不必估 $Z_\phi$。Table 2 里 OWT 那一格 $17.58$，靠的就是这个。

NCE 那条不借用 AR。正样本是真后验：给定 $\mathbf{x}_t$ 和干净 $\mathbf{x}_0$，正例就是把真句收回来。负样本从因子化 $p_\theta(\hat{\mathbf{x}}_0\mid\mathbf{x}_t)$ 抽。残差形式让对数几率塌成 $-E_\phi$，目标变成二分类：真句能量低，提案句能量高。实现是把预训练 MDLM 接一层：最后一层嵌入做 mean-pool，投到标量。Text8 上 NCE 微调大约 $10{,}000$ 步就收敛；MDLM 自己先训了 $1$M 步、batch $512$、长度 $256$。OWT 同样 $1$M 步再短微调，长度 $1024$，词表约 $50$k，AdamW 学习率 $3\times 10^{-4}$。能量网络是双向的，作者预期它比因果 AR 更能看见后缀搭配。Table 3 上 EDLM-NCE 和 EDLM-AR 几乎贴着走，这个预期没有变成「NCE 全面碾 AR」。

Gibbs 在大词表上不可用。采样改成自归一重要性采样。当前步若落在窗口里：从 $p_\theta$ 并行抽 $k$ 条完整 $\mathbf{x}_0$ 草案，能量网络一次打完分，按 $\propto\exp(-E)$ 重采样一条，再代入吸收态后验 $q(\mathbf{x}_s\mid\mathbf{x}_t,\mathbf{x}_0)$ 决定哪些格真正揭开。窗口外退回普通 MDLM 抽一条。Algorithm 1 的窗口 $\mathrm{w}$ 表示只在 $t\in[1-\mathrm{w},1]$ 做重要性采样。时间从 $1$ 走到 $0$，早段接近全掩，独立预测错得最凶，短窗口已经能捞回大部分生成质量。

一步里真正写进序列的，仍是吸收态后验，不是把草案整段提交。草案是「假如现在已经干净」的假想 $\mathbf{x}_0$；后验再按当前 $t$ 决定哪些格继续掩着。能量校正发生在抽草案这一层。低置信 remask 发生在提交之后，把不尖的格盖回去。两刀可以叠，原文实验没有叠。论文伪代码里后验条件的下标有一处笔误，实现应对齐吸收态后验 $q(\mathbf{x}_s\mid\mathbf{x}_t,\mathbf{x}_0)$，不要写成自己条件自己。

图像侧 Lezama 等人 2023 也训过校正网络去修独立解码，校正要串行跑，时间往上加。EDLM 的 $k$ 条草案一次前向打分，校正和提案并行。Deng 等人 2020 用能量管 AR 的曝光偏差，目标仍是从左到右的模型。EDLM 的能量管的是扩散每一步的联合去噪核。名字都叫能量，插槽不是同一个。

Table 3 为了看满血能力，把 $\mathrm{w}=1$，每步都做重要性采样。墙钟实验改成 $k=2$、$\mathrm{w}=0.2$，只在 $t\in[0.8,1]$ 校正。两套超参不要焊进同一句话。附录 C.1 把训练预算写全：Text8 跟 D3PM 的切分，余弦学习率，线性热身 $2000$ 步，channel dropout $0.05$，AdamW $3\times 10^{-4}$。OWT 热身改成 $2500$ 步，dropout $0.1$，序列首尾加 EOS。词嵌入输入输出不绑定。NCE 头是 pooling 加标量，不是另起一座 12 层。

![](./images/fig-edlm-residual-energy.png)

> 图 1：左列是因子化去噪、残差能量、AR 能量的定义。右列是 NCE、并行重要性采样、窗口 $0.2$、GPT-2 尺度。底栏把 49%、$1.3\times$、Text8 BPC、OWT PPL 钉在各自的表上。

**图 1 解析**

- **L0–L1**：式 (1)。训练按格、采样按乘积，错位写在实现里，不是没训够。
- **L2**：式 (2)。$\mu_\theta$ 是 MDLM，能量只乘相关。
- **L3**：式 (4)。EDLM-AR 不训新网。
- **R0**：NCE 把 MDLM 的 pooled 嵌入投成标量，约一万步。
- **R1–R2**：$k$ 条提案并行打分。$\mathrm{w}=0.2$ 只校正早段。
- **R3**：12 层。OWT 隐维 768。不是 8B。
- **R4**：49% 是 Table 3 GPT-2 列 2048 步，$(34.9-17.7)/34.9$。
- **F0**：$1.3\times$ 是约 $13$s 对 $17$s，对齐 AR 的 $35.7$，单条 $1024$，不是 DualCache 的 $27.6\times$。

## 3. 似然怎么报：上界、精确 ELBO、生成 PPL

评测器三套，口径不同。BPC / PPL 是模型给测试集真句打的似然。扩散报的是上界，AR 报的是精确值。Gen PPL 是另找一个 oracle（Llama-2、Llama-3、GPT-2）给模型生成的句子打分，测的是写出来像不像话，不是模型自己认不认得真句。Table 3 每档生成 $2048$ 条、长度 $1024$。

残差能量让连续时间 NELBO 多出 $-E_\phi-\log Z_\phi$ 两项。$\log Z_\phi=\log\mathbb{E}_{p_\theta}\exp(-E_\phi)$ 仍要蒙特卡洛。Theorem 1 给出 $n$ 个提案样本上 $\log\mathcal{Z}_n$ 的渐近夹逼，实践用 leave-one-out 估 $\mathcal{Z}_{n-1}$ 降方差。夹逼只在 $n$ 足够大时成立。Table 2 里 EDLM-NCE 和 EDLM-AR 的数字因此是上界。EDLM-coAR 自归一，报精确 ELBO：$17.58$ 才能和 AR 的 $17.56$ 放在同一格里比「贴没贴上」。把三行都当成精确 PPL 再宣布「扩散已经追平」，少读了那句 upper bound。

离散时间损失把每步 KL 写成 $(\alpha_t-\alpha_s)/(1-\alpha_t)$ 乘上 $\log p_\theta-E_\phi-\log Z$。连续极限用 $\alpha_t'/(1-\alpha_t)$ 做积分，界更紧，且对噪声日程不变。评测 Table 2 走的是这条积分形式的估计，不是把采样步数 $T$ 代进训练损失再报一个数。采样步数 256 到 2048 只出现在 Table 3 和墙钟图。似然数字与生成步数不要横着对。oracle 换成 Llama-2 或 Llama-3，同一份生成样本的 Gen PPL 会整表平移，49% 只对 GPT-2 列成立。Llama-3 列 2048 步是 MDLM $37.6$ 对 EDLM-NCE $20.7$，相对降幅约 $45\%$，仍不要写成 49。

## 4. Text8 与 OpenWebText

Text8 是字符级、词表 $28$（26 个小写字母、空格、掩码），块长 $256$。Table 1 只报 BPC，生成指标在这个长度和词表上作者觉得没有可分信号。

| 方法 | BPC $\downarrow$ |
|---|---|
| Transformer AR | 1.23 |
| AR Discrete Flow | 1.23 |
| ARDM | $\le$ 1.43 |
| MAC | $\le$ 1.40 |
| Plaid | $\le$ 1.48 |
| BFN | $\le$ 1.41 |
| D3PM Absorb | $\le$ 1.45 |
| SEDD Absorb | $\le$ 1.41 |
| MDLM | $\le$ 1.40 |
| MD4 | $\le$ 1.37 |
| EDLM | $\le$ 1.24 |

EDLM-AR 与 EDLM-NCE 在这张小表上分不出差别，只报一格。$\le 1.24$ 贴上 AR 的 $1.23$，仍带上界符号。MD4 的 $\le 1.37$ 是先前离散扩散里最好的一档。任意顺序 AR（ARDM / MAC）也在 $1.40$ 一带。连续扩散 Plaid / BFN 更松。不要把 $1.24$ 抄到 OWT 的 token PPL 上。Table 1 还列了 IAF/SCF $1.88$、AR Argmax Flow $1.39$、Multinomial Diffusion $\le 1.72$、D3PM Uniform $\le 1.61$。流模型和均匀离散扩散在字符级已经落后一截，本篇主叙述只盯吸收态这一列。任意顺序模型和掩码扩散的训练目标亲戚更近，[任意顺序](./any-order.md) 专文写 $1/t$ 是对所有排列求期望；EDLM 没有改这条期望，只改反向采样时乘积核上面的能量。Text8 上「接近 AR」不能外推成 OWT 上 NCE 也接近 $17.56$：NCE 那一行是 $21.52$。

OpenWebText 跟 Sahoo 等人的划分：最后 $100$k 文档当验证。零样本列借自 MDLM 原文的基线数字。表头写作 MLDM，就是 MDLM。

| | OWT | PTB | Wikitext | LM1B | Lambada | AG News | Pubmed | Arxiv |
|---|---|---|---|---|---|---|---|---|
| AR | 17.56 | 82.05 | 25.75 | 51.25 | 51.28 | 52.09 | 49.01 | 41.73 |
| SEDD | 24.56 | 100.09 | 34.28 | 68.20 | 49.86 | 62.09 | 44.53 | 38.48 |
| MDLM | 23.83 | 95.26 | 32.83 | 67.01 | 47.52 | 61.15 | 41.89 | 37.37 |
| EDLM-NCE | 21.52 | 93.21 | 30.77 | 63.19 | 46.92 | 60.02 | 41.80 | 36.63 |
| EDLM-AR | 20.49 | 89.67 | 29.24 | 60.80 | 49.70 | 57.27 | 45.90 | 38.38 |
| EDLM-coAR | 17.58 | 89.73 | 28.31 | 60.23 | 50.04 | 57.94 | 46.31 | 39.02 |

域内 OWT：coAR $17.58$ 对 AR $17.56$，差 $0.02$，这是「精确 ELBO 贴上自回归」那一句的出处。NCE $21.52$、AR 能量 $20.49$，仍明显好过 MDLM $23.83$，但不是贴平。零样本不要只抄 OWT 列。Lambada / Pubmed / Arxiv 上 coAR 比 MDLM 差（$50.04$ 对 $47.52$，$46.31$ 对 $41.89$，$39.02$ 对 $37.37$）。NCE 在这三列仍略好或持平。carry-over 把未掩格钉死，域内似然更紧，换领域不一定更稳。SEDD 的 $24.56$ 是另一份上界，不要和 coAR 的精确值横减完再宣布胜负。PTB 列所有扩散都在 $89$ 以上，AR 自己也是 $82.05$，这列更像域移诊断，不是「能量失效」。Wikitext 上 coAR $28.31$ 对 AR $25.75$，缝还在，只是比 MDLM 的 $32.83$ 窄。AG News 上 NCE $60.02$、AR 能量 $57.27$，都好过 MDLM $61.15$，新闻短文本对搭配校正更友好。零样本七列没有统一的赢家。

## 5. 生成质量：49% 在 2048 步，1.3× 在 13 秒对 17 秒

Table 3 无条件。$\mathrm{w}=1$。SUNDAE / Ssd-LM 的数字借自 Gat 等人。Data 一行是真实语料被三个 oracle 打的分，不是模型。

| 方法 | 步数 | Llama2 | Llama3 | GPT-2 | Entropy |
|---|---|---|---|---|---|
| Data | — | 7.0 | 9.4 | 14.7 | 7.7 |
| AR | 1024 | 22.9 | 40.3 | 35.7 | 8.1 |
| SUNDAE | 200 | 29.5 | 45.1 | 34.7 | 5.2 |
| Ssd-LM | $>10000$ | 73.3 | 203.1 | 99.2 | 4.8 |
| D3PM Absorb | 1024 | 692.3 | 754.9 | 842.3 | 7.6 |
| SEDD | 256 / 512 / 1024 / 2048 | 36.1 / 32.5 / 27.3 / 23.1 | 65.0 / 54.3 / 43.7 / 36.2 | 64.8 / 52.2 / 41.5 / 33.7 | 7.8 / 7.7 / 7.6 / 7.5 |
| MDLM | 256 / 512 / 1024 / 2048 | 37.2 / 30.6 / 27.6 / 23.9 | 66.8 / 52.6 / 44.6 / 37.6 | 66.8 / 52.4 / 42.6 / 34.9 | 7.9 / 7.8 / 7.6 / 7.5 |
| EDLM-AR | 256 / 512 / 1024 / 2048 | 34.7 / 26.8 / 19.6 / 14.6 | 62.2 / 44.4 / 28.8 / 20.8 | 62.1 / 42.0 / 25.5 / 17.9 | 7.9 / 7.6 / 7.2 / 6.9 |
| EDLM-NCE | 256 / 512 / 1024 / 2048 | 35.7 / 26.3 / 19.0 / 14.6 | 62.9 / 44.1 / 28.8 / 20.7 | 61.7 / 42.5 / 25.5 / 17.7 | 7.9 / 7.6 / 7.3 / 6.9 |

摘要 49% 对的是 GPT-2 列、2048 步：MDLM $34.9$，EDLM-NCE $17.7$，$(34.9-17.7)/34.9\approx 49\%$。1024 步同一列是 $42.6$ 对 $25.5$，约 $40\%$，不到 49。Llama-2 列 2048 步是 $23.9$ 对 $14.6$，约 $39\%$。报 49% 时评测器、步数、分子分母都要在。熵在 2048 步掉到 $6.9$，对照数据 $7.7$、MDLM $7.5$：生成更「像」oracle 的同时，多样性略收。作者写：拿 EDLM 512 步对 MDLM 1024 步，Gen PPL 和熵大致同一带，步数少一半。这是「质量换步数」，还不是墙钟。512 步 GPT-2 列：MDLM $52.4$，EDLM-NCE $42.5$，EDLM-AR $42.0$。少步时能量校正也在，只是 49% 那一档要走到 2048 步才出现。D3PM Absorb 1024 步 GPT-2 Gen PPL $842.3$，和 MDLM 的 $42.6$ 不在一个数量级，说明吸收态加权交叉熵本身已经把早期离散扩散拉开；EDLM 是在 MDLM 这一档上再修联合，不是从 D3PM 起步。SUNDAE 熵 $5.2$、Ssd-LM 熵 $4.8$，Gen PPL 好看或难看都伴着多样性塌缩。EDLM 256 步熵仍是 $7.9$，和 MDLM 同一格，校正没有靠把句子写成几句套话。

墙钟在 Figure 1(a)(b)。横轴是生成**一条**长度 $1024$ 的时间，纵轴 GPT-2 Gen PPL 或熵。扫 $[512,768,1024]$ 步。$k=2$，$\mathrm{w}=0.2$。对齐 AR 的 $35.7$ 时，图上读到 EDLM 大约 $13$ 秒、MDLM 大约 $17$ 秒，大约 $1.3\times$。波浪号是原文就有的。硬件型号主文没进表，不要抄成 H100 tok/s。消融 Figure 1(c) 钉 $1024$ 步：重要性样本数 $k<16$ 时质量不敏感，再大显存炸；$w=0$ 退回 MDLM，GPT-2 Gen PPL $42.6$；$w=0.2$ 已经降到大约 $30$，再加长窗口收益变薄。早段校正够用，这才敢在加速实验里把窗口收成 $0.2$。

$1.3\times$ 不是 DualCache 相对原版 LLaDA 的 $27.6\times$，不是 DCD 的 $32\times$ NFE，不是 dParallel 的 GSM8K $8.5\times$ 时延。对照物是同一颗 MDLM、同一条 $1024$ token、同一档 Gen PPL。

## 6. 和 DCD、CoDD、嵌套 SMC 不是同一刀

法律都是「乘积不够」，接口不同。

DCD：两边冻住，I-投影改边缘、保留 GPT-2 的 copula。似然上界给不出。32× 是 128 token、4 步对 SEDD 128 步。EDLM：提案是 MDLM，能量是 AR 似然差或 NCE 标量，合成规则是 $\mu_\theta\exp(-E)/Z$。可以报上界（NCE / AR）或精确 ELBO（coAR）。长度 $1024$。不要把 Table 3 的 $17.7$ 和 DCD 曲线上没进表的 PPL 点减。

CoDD：冻 LLaDA / Dream，训 HMM，主表是 MATH500 / GSM8K。EDLM 没有这两张卷。CoDD 相关工作把能量模型和 AR 辅助算进「额外深度生成模型，开销大」。EDLM 每步要跑 $k$ 次提案再打能量，开销确实在；作者用窗口把开销收在早段。没有 8B 对打表。

嵌套 SMC：训练免费，拧的是序列级奖励 $r(x_0)$，骨干也是 12 层 MDLM，任务是稀有事件毒性探针。EDLM 拧的是去噪核本身更接近真后验，任务是语言模型似然和 Gen PPL。粒子权重和残差能量不要焊成一种「推理期标量」。

CRoCoDiL：8B demasker 加句级连续草稿，无条件 Python，NFE $512\to 40$ 约 $13\times$。EDLM 不训草稿，不碰 8B。五条性质把能量模型写成补 L2 的举例，没有给 7B 新表。本篇就是那条例子在 GPT-2 尺度上的一张表。

APD 用同词表小 AR 截断从左到右的草稿，有损，主表在 7B。EDLM-AR 也借用 AR，但是打分再重采样，不是投机拒绝。SDTT 改学生权重去拟合老师多步；EDLM 不蒸 MDLM。少步蒸馏专文里 32 步约 $4\times$ 于带 KV 的 GPT-2，骨架大约 863M，对照的是延迟。EDLM 的 $1.3\times$ 对照 MDLM 墙钟，骨架 12 层。两句都出现 GPT-2 尺度，分母一个是 KV 缓存后的 AR，一个是无缓存的掩码扩散循环。

[Score entropy](./score-entropy.md) 改的是训练损失：concrete score 的 Bregman 散度，SEDD Absorb 在 1BW 上界 $\le 32.79$。EDLM 的 $p_\theta$ 仍是 MDLM 的 $1/t$ 交叉熵，能量是额外的序列打分。同一张 12 层可以先按 SEDD 训再挂能量，原文没做。Table 2 的 SEDD $24.56$ 和 EDLM-NCE $21.52$ 都是 OWT 上界，可以并排读，不能说 EDLM 取代了 score entropy。均匀过程上的 $\tau$-leaping 步数理论见[自适应采样](./adaptive-sampling.md)，和本篇的重要性采样窗口不是同一条旋钮。

## 7. 失效：尺度、配分、多样性、零样本

没有 8B。把 $17.58$ 抄到 Nie Table 1 的 GSM8K，或把 $1.3\times$ 抄到聊天 tok/s，都是分母写错。未来若有人把残差能量接到 LLaDA，那是另一篇，本花园未找到一手表。

配分在 NCE / AR 两条上仍在。上界松紧会改 Table 2 的绝对数字。只有 coAR 逃掉估 $Z$。Theorem 1 的夹逼是渐近的，$n$ 不够时不要把上界当精确值。

重要性采样 $k\to\infty$ 才恢复联合模型的精确样本。实践 $k=2$ 已经够用，是经验，不是定理。窗口 $w<1$ 时，晚段仍走因子化，联合校正不完整。这是加速换来的偏。

2048 步熵掉到 $6.9$，oracle Gen PPL 很好看的同时，句子可能更「像训练集里的高频腔」。Ssd-LM 熵 $4.8$ 更极端，作者把它当反例：质量指标可以靠塌缩刷。EDLM 没塌成那一档，但仍低于数据的 $7.7$。

零样本：coAR 域内贴 AR，Lambada / 科学论文列会回退。NCE 更稳一点，域内又贴不上 $17.56$。没有「一条能量同时赢所有列」。

Text8 隐维 $784$、OWT 隐维 $768$，不要写成同一张架构超参抄到复现脚本里。batch $512$、$1$M 步是两套实验共用的训练预算量级，硬件主文没写卡名。NCE 一万步是「收敛很快」的观察，不是一张学习率扫描表。换更长序列、换更大词表，这一万步还够不够，没有第二张表。

能量打的是整句配置，对局部语法错误敏感，对「整段在说什么」未必比句级潜变量更强。CRoCoDiL 把草稿放在 $1024\times K$ 的连续寄存器里，EDLM 的标量 $E$ 没有空间维。互补：一个管搭配，一个管素描。原文没有把 NCE 头换成寄存器条件。

可控生成那篇把分类器引导写成连续侧枝。EDLM 的能量也可以看成每步对草案打分，但打分器是语言模型似然或 NCE 头，不是属性分类器。嵌套 SMC 的毒性分类器才是属性奖励。把 EDLM 抄成「开源 8B 上的 CFG」，既没有 8B，也没有属性标签。

## 8. 读完应留下的判断

因子化去噪核在少步时把搭配丢掉。EDLM 给核乘一项序列级能量，提案仍是 MDLM。能量可以是现成 AR 的负对数似然，也可以是一万步 NCE 训出来的标量。采样是并行重要性采样，不是 Gibbs。数字停在 GPT-2 small。49% 是 Table 3 GPT-2、2048 步、$34.9\to 17.7$。$1.3\times$ 是一条 $1024$ token 上大约 $13$ 秒对 $17$ 秒，对齐 AR 的 $35.7$，$k=2$、$w=0.2$。Text8 $\le 1.24$ 对 MD4 $\le 1.37$。OWT coAR $17.58$ 对 AR $17.56$，那一格是精确 ELBO。零样本有的列 coAR 会输给 MDLM。不是 8B，不是 DCD 的步数倍数，不是 CoDD 的数学分。图 1 底栏把这几句拆开，正文按拆开的读。读完应能指着 Table 3 说出 49% 的分子分母，指着 Figure 1 说出 $13$ 秒和 $17$ 秒对齐的是哪一档 Gen PPL，指着 Table 2 说出哪一行是上界、哪一行是精确 ELBO。格子对不上，增益就会被抄到聊天吞吐上。仓库 README 与附录 C 对训练超参的写法以论文为准。复现时 Text8 用隐维 784，OWT 用 768，两套热身步数也不要混。

## 参考文献

- [Xu, Geffner, Kreis, Nie, Xu, Leskovec, Ermon, Vahdat. EDLM, ICLR 2025](https://arxiv.org/abs/2410.21357)：式 (1)(7)(9)(10)；Algorithm 1；Table 1–3；Figure 1；$w=0.2$；$k=2$。
- [Sahoo et al., MDLM, NeurIPS 2024](https://arxiv.org/abs/2406.07524)：提案 $p_\theta$；Table 2 零样本基线出借处。
- [Shi et al., MD4](https://arxiv.org/abs/2406.04329)：Text8 $\le 1.37$。
- [Lou et al., SEDD](https://arxiv.org/abs/2310.16834)：Table 2 / Table 3 对照。
- [Liu et al., DCD, ICLR 2025](https://arxiv.org/abs/2410.01949)：同期 I-投影 copula；点名能量路线。
- [Li et al., CoDD](https://arxiv.org/abs/2603.00045)：可算联合层，8B 主表。

## 相关

- [离散 copula](./discrete-copula.md)
- [CoDD](./codd.md)
- [五条性质](./discreteness.md)
- [ParallelBench](./parallelbench.md)
- [嵌套 SMC](./nested-smc.md)
- [CRoCoDiL](./crocodil.md)
- [Score entropy](./score-entropy.md)
- [从图像到离散](../02-mechanism/from-image-diffusion.md)
- [采样与调度](../02-mechanism/sampling.md)
- [少步蒸馏](./few-step-distill.md)
- [APD](./apd.md)
- [掩码扩散](../02-mechanism/masked-diffusion.md)
- [自适应采样](./adaptive-sampling.md)
