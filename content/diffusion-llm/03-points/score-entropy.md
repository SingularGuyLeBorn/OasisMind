---
title: "Score entropy：离散扩散在估比率"
category: null
tags:
  - SEDD
  - score-entropy
  - concrete-score
  - discrete-diffusion
published: true
as_of: 2026-08-31
excerpt: "连续扩散估 ∇log p_t。离散上状态之间的比率叫 concrete score。ℓ₂ 匹配不稳定，score entropy 用 −log 的 Bregman 把比率钉在正数上。SEDD Absorb 在 1BW 上界 ≤32.79，对照自回归精确似然 31.98、D3PM Absorb ≤77.50。摘要 25%–75% 对照先前离散扩散，不是 GPT-2。2025 年 7B–8B 默认仍是 1/t 加权交叉熵。"
---
# Score entropy：离散扩散在估比率

掩码扩散专文把损失收成加权交叉熵。任意顺序专文把吸收态再参数化成「干净条件乘时间系数」。两篇都默认网络输出的是词表分布。SEDD 问的是更早的问题：离散扩散的反向过程真正需要的量，是不是这份分布。Lou、Meng、Ermon（ICML 2024，arXiv:2310.16834）的答案是比率。当前状态 $x$ 跳到 $y$ 的反向速率，正比于 $p_t(y)/p_t(x)$。这个比率叫 concrete score。连续扩散里对应的是 $\nabla_x\log p_t$。直接搬 $\ell_2$ 去配比率会崩，因为比率必须为正，$\ell_2$ 不惩罚零和负数。他们把损失换成 score entropy。模型名 SEDD，是这条损失加上离散 CTMC，不是另一种 `[MASK]`。

会 DDPM 的人缺这一刀，因为图像侧 score matching 已经定型，语言侧 2025 年的开放权重却几乎不用它。会 $1/t$ 的人缺这一刀，因为读 SEDD 原文会撞上「降低困惑度 25%–75%」，那句话的对照物是先前离散扩散，不是 GPT-2。本篇把比率、损失、表格三件事钉死。数字停在 GPT-2 尺度。LLaDA 的损失函数不是 score entropy。

## 1. 反向过程要的是比率，不是填空

有限状态 $\{1,\ldots,N\}$ 上，前向是连续时间马尔可夫链，$\mathrm{d}p_t/\mathrm{d}t=Q_t p_t$。$Q_t$ 列和为零，非对角非负。小步长的跳转概率是 $\delta_{xy}+Q_t(y,x)\Delta t$。反向还有一张速率矩阵 $\overline Q_t$，Kelly 公式把它写成

$$
\overline Q_t(y,x)=\frac{p_t(y)}{p_t(x)}\,Q_t(x,y),\qquad y\neq x.
\tag{1}
$$

对角用负的行和补齐，保证反向仍是概率流。式 (1) 里未知的只有比率。Meng 等人把整组 $\bigl(p_t(y)/p_t(x)\bigr)_{y\neq x}$ 叫做 concrete score。连续扩散的 score $\nabla\log p_t$ 是密度的对数梯度；离散没有欧氏梯度，最近的亲戚就是这个比率。学到 $s_\theta(x,t)_y\approx p_t(y)/p_t(x)$，反向模拟就能跑。

D3PM / Campbell 走的是另一条：学 $p_{0|t}$，再绕回去算比率。Lou 等人说密度比一般正值难学，连续时间极限还要额外近似。Meng 的 concrete score matching 直接配比率，损失却是 Fisher 式的 $\ell_2$：

$$
\mathcal{L}_{\mathrm{CSM}}=\frac12\mathbb{E}_{x\sim p_t}\sum_{y\neq x}\Bigl(s_\theta(x,t)_y-\frac{p_t(y)}{p_t(x)}\Bigr)^2.
\tag{2}
$$

比率必须为正。$\ell_2$ 对 $s=0$ 或 $s<0$ 的惩罚不够，梯度会把网络推到非法区。附录 D 里这条路实证上挣扎。Ratio matching 更早，要专门架构，贵，也没赢过 mean prediction。2023 年以前离散扩散的似然竞赛，缺的不是再换一张 $Q_t$，是缺一个既承认正值、又能当似然界的损失。

![](./images/fig-score-entropy.png)

> 图 1：左列连续 score 进反向 SDE。中列离散比率必须为正，$\ell_2$ 不够，score entropy 用 $-\log$ 的 Bregman 加上对数势垒。右列同一张吸收态 $Q$，SEDD 估比率，MDLM 估加权交叉熵；2025 年 7B 默认走右边那条损失。

**图 1 解析**

- **左列 $\nabla\log p_t$**：图像扩散的标准对象。Fisher / denoising score matching 已经定型。
- **中列 $p_t(y)/p_t(x)$**：concrete score。CSM 的 $\ell_2$ 不保住正数。score entropy 在 $s$ 靠近 0 时梯度发散，形成势垒。
- **右列虚线 not the same loss**：吸收态 $Q$ 可以共用，损失不能共用。SEDD 的 ELBO 从 Dynkin 公式来；MDLM 从 SUBS 参数化的连续时间 NELBO 来。
- **底栏 25–75%**：对照先前离散扩散。Table 3 里 D3PM Absorb $\leq 77.50$，SEDD Absorb $\leq 32.79$，大约 58% 相对下降，落在摘要区间里。
- **7B–8B default is MDLM $1/t$**：工程上交叉熵接现成工具链。SEDD 没有被证伪，也没有成为 LLaDA 的损失。

## 2. Score entropy：给正比率用的交叉熵亲戚

定义 3.1。对分布 $p$、非负权重 $w_{xy}$，

$$
\mathcal{L}_{\mathrm{SE}}=\mathbb{E}_{x\sim p}\sum_{y\neq x}w_{xy}\Bigl(s_\theta(x)_y-\frac{p(y)}{p(x)}\log s_\theta(x)_y+K\bigl(\tfrac{p(y)}{p(x)}\bigr)\Bigr),
\tag{3}
$$

其中 $K(a)=a(\log a-1)$ 让损失非负。这不是把 $s$ 当成概率再做交叉熵。$s$ 是任意正数，不必在单纯形上。几何上它是 $F=-\log$ 的 Bregman 散度。$w_{xy}=1$ 时，对 $s$ 的梯度等于 CSM 梯度除以 $s$ 本身：靠近零的预测被放大，正值势垒出现。最优解在样本和容量足够时收回真比率（Proposition 3.2）。

式 (3) 里仍有未知的 $p(y)/p(x)$。Implicit 形式（Proposition 3.3）消掉它，但每个 $x$ 要对所有 $y$ 再评一次 $s_\theta(y)_x$，词表五万时不可用。真正能训的是 denoising 形式（Theorem 3.4）：$p$ 若是干净数据经核 $p(\cdot\mid x_0)$ 扰动得到的，比率换成 $p(y\mid x_0)/p(x\mid x_0)$，蒙特卡洛只评当前 $s_\theta(x)$。离散扩散的 $p_t$ 恰好都是这种扰动，前向转移可以闭式写。训练循环于是变成：抽 $x_0$，按 $Q$ 腐蚀成 $x_t$，对 Hamming 距离为 1 的邻居算 denoising score entropy。

似然界跟着来。把学到的 $s_\theta$ 代进式 (1)，得到参数化的反向矩阵 $\overline Q_t^\theta$。Dynkin 公式给出 ELBO（Theorem 3.6）：$-\log p_0^\theta(x_0)$ 被 diffusion-weighted denoising score entropy 加上终点 KL 上界。权重正是前向 $Q_t(x,y)$。这条界让他们能报困惑度上界，和 AR 的精确 NLL 放在同一张表上。上界对精确值，SEDD 的格子永远带着 $\leq$。把 $\leq 32.79$ 减 AR 的 31.98，差在界的松紧，不一定差在模型。作者自己写：1BW 上「很可能已经对齐，因为我们只报上界」。

序列上 $Q_t$ 不能存 $N^d\times N^d$。他们让每个 token 独立被 $Q_t^{\mathrm{tok}}$ 扰动，于是只要建模 Hamming 距离 1 的比率。网络输出形状是 $d\times n$：$d$ 个位置，每个位置对词表 $n$ 个候选。GPT-2 词表 50257 时，稠密 $Q^{\mathrm{tok}}$ 约占 20GB，还算不了矩阵指数。可用的两张结构化矩阵仍是 D3PM 那两列：均匀全连接，以及加一个吸收态 `[MASK]`。SEDD Absorb 和 SEDD Uniform 是同一条损失、两张 $Q$。主表 Absorb 赢，和 D3PM 当年的结论同方向。

三人词表 $\{A,B,M\}$ 能把势垒说清楚。设真比率 $p(B)/p(A)=2$。CSM 在预测 $s=0.01$ 和 $s=-0.5$ 时，平方误差对负数并不特别狠；网络可以穿过零。score entropy 的项里有 $-\,2\log s$， $s\to 0^+$ 时损失炸掉，梯度把 $s$ 往回推。这就是「交叉熵亲戚」四个字的全部内容：交叉熵本来就讨厌零概率，这里讨厌的是零比率。实现上 $s_\theta$ 要经过软加或指数，保证输出为正。LLaDA 的 Softmax 自带单纯形约束；SEDD 约束的是正锥，不是概率单纯形。把 SEDD 的头改成 Softmax 再当 $1/t$ 用，几何变了，ELBO 证明对不上。

骨干是带时间条件的 DiT，RoPE，编码器全双向。时间条件让参数比同配置 Transformer 多约 5%–10%。噪声日程试过几何（$10^{-5}$ 插到 $20$）和 log-linear（累积噪声大约让 $td$ 个 token 被改）。Absorb 的困惑度更吃 log-linear。作者写没有系统扫日程和损失加权，生成质量大概还能再拧。训练用 sentence packing 拼成定长块，text8 例外：为了跟 D3PM 对齐，改抽连续子串。词表和数据划分跟对照实验同一套，避免「换了分词器看起来赢了」。这些是 GPT-2 尺度似然竞赛的纪律，不是 8B 下游表的纪律。

## 3. 表格：25%–75% 的对照物是谁

摘要第一句数字最容易被抄错。「降低困惑度 25%–75%」的原文是 beats existing language diffusion paradigms。对照列是 D3PM、Diffusion-LM、BERT-Mouth、DiffusionBERT、PLAID，不是 GPT-2。Table 3，One Billion Words，体量约 GPT-2 small：

| 方法 | 测试 PPL |
|---|---|
| Transformer（AR，精确似然） | 31.98 |
| D3PM Absorb | $\leq$ 77.50 |
| Diffusion-LM | $\leq$ 118.62 |
| BERT-Mouth | $\leq$ 142.89 |
| DiffusionBERT | $\leq$ 63.78 |
| SEDD Uniform | $\leq$ 40.25 |
| SEDD Absorb | $\leq$ 32.79 |

相对 D3PM Absorb，$32.79/77.50\approx 0.42$，下降约 58%，落在 50%–75% 那段。相对 AR，上界 32.79 对精确 31.98，差不到 1。作者写「至少 2 倍好于其它离散扩散」，$77.50/32.79\approx 2.36$，指的仍是扩散对扩散。Diffusion-LM 那格 $\leq 118.62$ 是连续嵌入路线在同一 1BW 协议上的对照，连续梯度的可控性换不来这里的似然。BERT-Mouth $\leq 142.89$ 说明「把 BERT 当生成模型」和「把吸收态 ELBO 训成生成模型」差很远。把 25%–75% 写成「SEDD 比 GPT-2 低四分之三」，摘要没有这句话。

Table 1 是另一张协议：OWT 上训，零样本无条件困惑度，无滑动窗口。无滑动窗口会让 GPT-2 的数字比原论文高，作者写明了。Small 档 SEDD Absorb：LAMBADA $\leq 50.92$（GPT-2 45.04，这里没赢）、WikiText2 $\leq 41.84$（42.43，赢了）、PTB $\leq 114.24$（138.43）、WikiText103 $\leq 40.62$（41.60）、1BW $\leq 79.29$（75.20，没赢）。「多数任务优于 GPT-2」是这一张重算表上的多数，不是官方 GPT-2 原文那张表。Uniform 全面差于 Absorb。PLAID、D3PM 作为先前扩散对照，Absorb 全面更好。Medium 档同结构：GPT-2 的 WikiText2 是 31.80，SEDD Absorb $\leq 31.04$；PTB 123.14 对 $\leq 87.12$；LAMBADA 仍是 GPT-2 低（35.66 对 $\leq 42.77$）。「多数任务优于他们重算的 GPT-2」在两档上都成立，且都带着无滑动窗口这条协议。LAMBADA 两档都没赢，说明不是全面碾压。这是「第一个非自回归模型在合理尺寸上贴近知名 AR 的困惑度」的宣称所在。尺度是 GPT-2 small / medium。不要换算成 LLaDA 8B 的 MMLU。

text8 的 BPC 上界：SEDD Absorb $\leq 1.39$，D3PM Absorb $\leq 1.45$，自回归 1.23，Discrete Flow（AR 做骨干）1.23。NAR 里 Absorb 最好，仍落后真正的 AR 一条缝。Uniform $\leq 1.47$，甚至略差于 D3PM Absorb。均匀 $Q$ 在小词表 text8 上已经不占优，大词表只会更差。离散扩散专文写过：五万词时均匀跳是开卷考试且卷面不标哪题被改过。SEDD 换了损失，没有推翻这列 $Q$ 的排序。

生成侧，作者用大模型当评委算生成困惑度，样本不做温度退火。相对同样未退火的 GPT-2，生成 PPL 约好 6–8 倍；把步数减到 32 分之一，质量仍可接近。这是 Figure 1 的曲线语言，不是 8B 的 tok/s。评委 PPL 能被重复句子黑掉，ReMDM 专文已经用 MAUVE 挡过这件事。SEDD 这篇的主锚仍是似然上界，生成那条当作「少步仍像样」的存在性，不要和 Mercury 的 1109 tok/s 焊。

填空。concrete score 是概率的函数，贝叶斯规则可以直接灌条件：任意位置当提示，其余位置当要填的格，不必另训 FIM。作者报 MAUVE 与带 nucleus 的 AR 可比。机制上这和掩码扩散的「空位保持 `[MASK]`」看起来像，对象不同：SEDD 改的是比率场，掩码扩散改的是被掩位置的词表分布。产品上都叫 infilling，公式不要并。

## 4. 采样：τ-leaping、Tweedie、任意位置提示

反向模拟最朴素的是 $\tau$-leaping：一小步里假定各 token 独立跳，跳转率用式 (1) 乘 $\Delta t$。它不利用「$s_\theta$ 已经是整组比率」这件事。Lou 等人写了一条离散 Tweedie（Theorem 4.1）：若真知道所有状态之间的比率，最优去噪器可以闭式写出来，类似连续扩散里用 score 还原 $x_0$。实践上网络只给出 Hamming 距离 1 的比率，于是他们做成 Tweedie 版的 $\tau$-leaping（式 (19)）：每个位置用 $\exp(-\sigma\Delta t Q)\,s_\theta$ 再乘回 $\exp(\sigma\Delta t Q)$。Theorem 4.2 说，在「各 token 同时独立更新」这个限制下，这条更新对真反向过程的 KL 最小。完美 $s_\theta$ 时，它是该类采样器里最优的。不完美时，仍是启发式，只是比盲目 Euler 更吃网络输出。

少步质量来自这里。Figure 1 把步数当横轴、生成 PPL 当纵轴，SEDD 可以从「很密的步」走到「32 倍更少的网络评估仍接近」。32× 的对照物是他们自己更密的 SEDD 采样，以及未退火 GPT-2 的生成 PPL，不是 LLaDA 原版 Python 循环。少步蒸馏专文里 SDTT 的 32× 是把老师 1024 步蒸进学生；SEDD 这篇的 32× 是同一组权重少跑前向。两句都叫 32×，账单不同。

任意位置提示用贝叶斯把无条件比率变成条件比率（式 (22)）。$\overline\Omega$ 是已填下标，$\Omega$ 是空位。条件比率等于把提示拼回去之后的无条件比率。于是无条件训出来的 $s_\theta$ 可以直接做左到右、中段填空、两边夹中间。$\tau$-leaping 只改 $\Omega$ 上的坐标。AR 要做同样的事，得靠 FIM 模板或改写提示。掩码扩散用 `[MASK]` 占空位，提示是干净 token，法律来自吸收态。SEDD 的空位不必是掩码符号：均匀 $Q$ 下空位仍是一个合法词，条件是「这些下标冻住」。Absorb 实验里空位常常恰好是掩码，看起来又像 BERT。读到 infilling 时先问冻住的是下标还是符号。

## 5. 和 $1/t$、RADD、MDLM 怎么嵌

吸收态上，RADD 证明 concrete score 解析上等于干净数据的条件分布乘一个只含 $t$ 的系数。网络若直接输出那个条件，时间可以不当输入。SEDD Absorb 估的仍是比率，时间条件还在 DiT 的 adaLN 里。两条路摸到同一几何：吸收态真正要学的，随 $t$ 变的部分可以提出去。MDLM / LLaDA 走得更工程：SUBS 把未掩位置抄输入，损失只写在掩码格上，线性日程下权重变成 $1/t$，看起来就是 MLM。三篇 2024 的论文（SEDD、RADD、MDLM）从比率、再参数化、加权交叉熵三个方向收敛到吸收态。开放权重 2025 年选了交叉熵，因为数据加载、混合精度、SFT「只掩回答」全部现成。

同一张吸收态 $Q$，SEDD 和 MDLM 不是同一台机器。SEDD 的网络输出 $d\times n$ 的正比率，采样走 $\tau$-leaping 或他们基于 Tweedie 类公式的最优去噪。MDLM 的网络输出词表 Softmax，采样走揭开 / remask。把 SEDD 检查点接到 LLaDA 的低置信 remask 上，接口对不上：remask 要的是 $p(x_0^i\mid x_t)$，SEDD 给的是 $p_t(y)/p_t(x)$。RADD 可以把后者译成前者。没有这篇翻译层，不要把 SEDD 权重当掩码扩散用。

DDPD 冻结 SEDD-small / medium 当去噪器，另训 90M 规划器。规划器专文的数字停在这里：去噪器是 SEDD，不是 LLaDA 8B。score entropy 把似然竞赛推到能跟 GPT-2 比的位置，规划器才能在这份去噪器上谈 2 NFE。8B 去噪器已经很强，不自动推出「8B 也该换 score entropy」。没做那张表。

Eso-LM、SDTT 蒸的是 MDLM 族。ReMDM 套的是 Sahoo 的 MDLM 检查点。2025 年采样器插件几乎都焊在加权交叉熵上。SEDD 作为老师检查点，公开的少步蒸馏主表未找到。`[OM-FREEPLAY]` 实践上若已经有 MDLM / LLaDA 权重，先动 remask 和缓存，不要为了「更物理的 score」重训 8B。

规划器专文里 DDPD 的 2 NFE，去噪器就是这里的 SEDD。读到「冻结 SEDD-small」时，参数量在 GPT-2 small 附近，不是 8B。把 OWT 生成 PPL 的规划收益抄到 Nie Table 1，中间缺两级尺度。score entropy 把似然推到能跟 GPT-2 比，规划器才有一张够强的去噪器可冻。8B 交叉熵去噪器已经强，缺的往往不是再换损失，是采样器锁死和缓存。换损失要付预训练账。没付之前，SEDD 停在本章：目标函数竞赛的赢家，不是规模竞赛的默认。

## 6. 失效：上界、尺度、没有成为默认损失

SEDD 报的是 PPL 上界。AR 报的是精确 NLL。Table 3 差 0.81，可能是模型差，也可能是界没贴紧。LLaDA 主表几乎不报 PPL，就是为了躲开这种不可比。失效模式专文写过：不同 ELBO 写法要的蒙特卡洛次数能差一个数量级。跨论文减 PPL，先问估计器。SEDD 用 DWDSE；MDLM 用 SUBS NELBO；AR 用 teacher forcing。三格不能横减完再宣布胜负。

时间条件让参数量比同配置 Transformer 多约 5%–10%。作者按层数、隐维、头数对齐先前工作，仍不是逐参数对齐。GPT-2 零样本无滑动窗口，官方数字不能直接贴过来。复现 Table 1 必须跟他们的无窗口协议。

Uniform 在 Table 1 / Table 3 全面落后 Absorb，却仍比早期均匀扩散好看。score entropy 救的是损失，不是 $Q$。想全程改词，均匀或 GIDD 混合才给监督；想 scale 到 8B，开放权重继续用吸收态加交叉熵。两条需求不要焊进「SEDD Uniform 已经可改字且可 scale」。Uniform 检查点在 GPT-2 尺度上存在，7B 上未找到一手来源。

生成 PPL 的 6–8 倍对照未退火 GPT-2。nucleus / 温度一开，AR 的生成观感会跳一截。作者在 MAUVE 上把 SEDD 和带 nucleus 的 AR 比过填空，那是另一张图。把未退火生成 PPL 抄成「SEDD 写得比 GPT-2 好 8 倍」，漏了退火这一档。

Hamming 距离 1 的因式分解，和掩码扩散一步多揭的因子分解是亲戚。$\tau$-leaping 假定各位置同时独立跳。括号配对、标识符声明，正好是「两个位置的跳转不独立」。Tweedie 更新在独立限制下最优，没有取消这条限制。并行诅咒不是 MaskGIT 私有，比率场同样有。缓解仍是少步时少跳、或吸收态让多数位置处于掩码从而跳转集合变小。Absorb 主表更强，部分原因是考试范围被 `[MASK]` 标出来了，不只是损失更巧。

## 7. 读完应留下的判断

离散反向过程要的是状态之间的正比率。$\ell_2$ 配这个比率不稳定。score entropy 把交叉熵从单纯形推广到正数，ELBO 能报上界。SEDD Absorb 在 1BW 上界 $\leq 32.79$，AR 精确 31.98，D3PM $\leq 77.50$。25%–75% 减的是先前扩散，减完之后才轮到和 GPT-2 比接近。吸收态 $Q$ 仍优于均匀。2025 年能叫 LLM 的开放权重，损失是 $1/t$ 交叉熵，不是 score entropy。

会图像扩散的人，把 $\nabla\log p$ 换成 $p(y)/p(x)$，再换损失。会掩码扩散的人，记住同一张 $Q$ 可以配两种目标，8B 选了好接工具链的那种。会任意顺序的人，RADD 已经把吸收态的比率译回干净条件；SEDD 停在比率这一层，没有把 8B 的训练循环改掉。三句分开，SEDD 就不会变成「另一种 BERT」或「已经取代 LLaDA 的损失」。

图 1 右列虚线是本篇要留下的那一笔。噪声法律可以相同，训练目标仍是一刀。年表把 SEDD 和 MDLM 写成两条河，河的名字是损失，不是 $Q_t$。读完应能指着 Table 3 说出 32.79、31.98、77.50 各自是上界还是精确值，指着摘要说出 25%–75% 减的是谁。格子对不上，25% 就会被抄到 GPT-2 头上。本篇写出来，就是为了挡住这一抄。

## 参考文献

- [Lou, Meng, Ermon, SEDD, ICML 2024](https://arxiv.org/abs/2310.16834) — 式 (1)(3)(5)(7)(9)；Table 1–3；摘要 25%–75% 对照先前离散扩散。
- [Meng et al., Concrete Score Matching, 2022](https://arxiv.org/abs/2206.09914) — 比率对象；$\ell_2$ 在离散上的问题由 SEDD 接着写。
- [Austin et al., D3PM, NeurIPS 2021](https://arxiv.org/abs/2107.03006) — 被 Table 3 对照的吸收态基线。
- [Sahoo et al., MDLM, NeurIPS 2024](https://arxiv.org/abs/2406.07524) — 同一张吸收态 $Q$ 上的加权交叉熵。
- [Ou et al., RADD](https://arxiv.org/abs/2406.03736) — 吸收态 concrete score 等于干净条件乘时间系数。
- [Liu et al., DDPD, ICLR 2025](https://arxiv.org/abs/2410.06264) — 去噪器是 SEDD，不是 8B。

## 相关

- [离散扩散](../02-mechanism/discrete-diffusion.md)
- [掩码扩散](../02-mechanism/masked-diffusion.md)
- [任意顺序](./any-order.md)
- [谁决定揭开哪一格](./plan-denoise.md)
- [代表性年表](../03-models/representative-models.md)
- [失效模式](./failure-modes.md)
- [离散流匹配](./discrete-flow.md)
