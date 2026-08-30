---
title: "提交之后还能不能改：三层 remask"
category: null
tags:
  - remask
  - ReMDM
  - GIDD
  - sampling
  - absorbing-state
published: true
as_of: 2026-08-31
excerpt: "LLaDA 的低置信 remask 只盖回本步尚未提交的掩码预测，不是改已经落盘的明文。吸收态后验把已揭开的位置焊死。ReMDM 改反向后验，预训练 MDLM 不必重训；OWT 上 T=4096 的 MAUVE 0.656 对 MDLM 的 0.035，对照物不是 AR 的 0.760。GIDD 在训练里混均匀噪声，模型才学会认出合法但错的词。Countdown 上 ReMDM 把 LLaDA Instruct 从 45.2 抬到 46.1，有显著但很小。"
---
# 提交之后还能不能改：三层 remask

采样专文把低置信 remask 画成四格置信度。规划器专文把「看见掩码才算脏」拆开。两篇之后还剩一刀，读者最容易焊错：已经写出的那个字，下一步还能不能改。口语里都叫 remask。法律上至少三层。第一层只盖回**本步刚预测、尚未提交**的掩码位，LLaDA 附录 Table 9 的 21.3 对 70.0 量的是这一层。第二层改反向后验，让已经是词的位置以 $\sigma_t$ 再变成 `[MASK]`，ReMDM（Wang、Schiff、Sahoo、Kuleshov，NeurIPS 2025，arXiv:2503.00307）把这一层写成可套在预训练 MDLM 上的采样器。第三层改前向：训练时看见过「合法但错的词」，GIDD（von Rütte 等人，arXiv:2503.04482）才让自纠正涨分。三层不要混名。

会 next-token 的人缺这一刀，因为 AR 写出去的前缀默认也不回头，除非另开投机验证。会 $1/t$ 的人更缺，因为并行揭开把搭配错误写进已经落盘的明文，而吸收态后验的默认动作是抄自己。本篇把三层分开写，数字能指回表格的才进正文。8B 上「ReMDM 全面翻盘」没有这张表。

## 1. 吸收态默认：明文抄自己

MDLM 的反向后验（他们式 (2)，ReMDM 文里原样引用）对未掩位置是确定性的。当前 $z_t$ 已经是某个词 $x$ 时，下一步 $z_s$ 只能还是 $x$。Wang 等人把这件事叫做 failure to remask：token 一旦揭开，整条反向轨迹里不许再动，哪怕它把「She sells」写成了「She sell」。这不是实现偷懒。吸收态前向规定干净词只会变成掩码、掩码不会自己变成另一个合法词，反向后验跟着这条边走，未掩位置的 carry-over 是解析出来的，不是启发式。MDLM 的 SUBS 再把「未掩位置抄输入、不要预测 `[MASK]`」焊进网络输出。训练和采样都在执行同一部法律。

五 token 的例子。目标是 `APPLE`。某一步网络已经提交 `APMLE`。四个字母看起来都合法，状态里没有 `[MASK]`。冻结规划器认为全净，采样结束。低置信 remask 若这一步已经没有待提交的掩码预测，同样结束。错误锁在第四位。想改成 `P`，必须有人允许「已经是词的格子再变脏」。吸收态默认采样不提供这个人。

并行揭开把锁死变得更常见。一步里两个掩码位按边际独立 argmax，可以同时选出「She」和「sell」。下一步双向注意力看见的是已经落盘的错搭配。阈值和解码器只能减少本步提交的格子数，不能给已经提交的格子开悔棋。这就是为什么「能不能改已经写出的字」要从采样启发式里单独抽出来。

![](./images/fig-three-remasks.png)

> 图 1：三列问的不是同一件事。左列只盖回本步尚未提交的预测；中列让已解码 token 以 $\sigma_t$ 再变 `[MASK]`；右列在训练里混均匀噪声，模型才见过乱词。

**图 1 解析**

- **左列 LLaDA low-conf remask**：预测所有掩码格，按置信度盖回最平的，提交的位置从此抄自己。Table 9 的 70.0 对 21.3 只比较这一列。
- **中列 ReMDM sampler**：反向后验允许 unmasked $\to$ MASK。权重可以继续用 Sahoo 的 MDLM 检查点。loop 阶段把 $\alpha_t$ 冻住做纠错圈。OWT 上 $T=4096$ 的 MAUVE 是 0.656，MDLM 同设定是 0.035。
- **右列 GIDD train hybrid**：噪声可以把一个词换成另一个词。自纠正只在 $p_u>0$ 时涨；只掩码再做自纠正，GPT-4o 质量分会掉。
- **脚注**：只有右边两列能改已经写下去的 token。左列改的是还没落盘的预测。
- **没有跨列箭头**：三列付的账不同，不能画成一条流水线。

离散扩散专文里有一句过满的法律隐喻：改法律就要训练和采样一起改，只改采样器等于执行不存在的条文。ReMDM 是这条隐喻的例外，写在下一节。Seed 的编辑腐蚀仍走「改前向」那一列，不是例外。

## 2. LLaDA / MaskGIT：只盖本步还没落盘的预测

记当前掩码率 $t$，下一步更干净的水平 $s\in[0,t)$。网络对所有仍是 `[MASK]` 的位置给出词表分布。吸收态后验要求：期望意义上把 $\frac{s}{t}$ 比例的预测再掩回去，使 $x_s$ 的掩码率和前向在时间 $s$ 时一致。其余位置写入 $\arg\max$ 或抽样的 token。已经是明文的位置，这一公式里根本没有「再盖回去」的项。

低置信策略在「盖回哪些**预测**」上做启发式：按 $\max_v p_\theta(x^i=v\mid x_t)$ 排序，把最平的盖回去，留下已经尖的。LLaDA 写明这是 MaskGIT 式退火，不是 ELBO 最优规划。附录 Table 9，Instruct、相同生成长度：随机 remask 21.3，低置信 70.0（GSM8K）。随机更忠实于前向后验的比例，生成却差，因为校准在位置之间不均匀。采样专文的图 1 画的就是这一刀。

把 Table 9 读成「LLaDA 会改已经提交的字」，是把本步的预测集合和上一步的明文焊在一起。预测还在掩码位上，提交之后才变成明文。低置信盖回发生在提交之前。提交之后，SUBS 抄自己。Fast-dLLM 的阈值解码是同一层的另一面：先设阈值再决定揭几个，主实验默认揭开就不回头。允许回头时阈值可以略低；不允许回头时，0.9 这种高阈值是在用「少揭」换「少锁死」。两套采样器的分数不能画在同一根速度曲线上冒充帕累托。

块采样也不提供悔棋。块间从左到右，已经结束的块变成因果前缀，块内仍用低置信启发式。结束符被关在块边界里，这修的是 EOS 传播，不是第四位的 `M` 改 `P`。规划器专文的 DDPD 才允许把明文标脏，那是另训一个二分类头，约 2 NFE，数字停在 SEDD / GPT-2 尺度。8B 主表没有这颗头。

## 3. ReMDM：改反向后验，不必重训 MDLM

ReMDM 的起点是：给未掩位置一条新的后验，而不是给网络加一个脏净头。当前 $z_t$ 已经是干净词 $x$ 时，

$$
q(\mathbf{z}_{s}\mid\mathbf{z}_{t}=\mathbf{x},\mathbf{x})=(1-\sigma_{t})\mathbf{x}+\sigma_{t}\bm{m}.
\tag{1}
$$

$\sigma_t$ 直接就是「把已解码 token 再变成 `[MASK]`」的概率。$\sigma_t=0$ 时式 (1) 收回 MDLM 的确定性抄写。对仍是掩码的位置，他们另写一条，使得边缘 $q_\sigma(z_t\mid x)$ 与经典掩码扩散相同（Proposition 3.1）。边缘相同这件事值钱：ELBO 变成 MDLM 目标的重加权。$\sigma_t$ 变大，界变松；$\sigma_t=0$ 时界收回 MDLM，所以 MDLM 的 NELBO 更紧。实践建议因此很干脆：训练用 $\sigma_t=0$（就是普通 MDLM），推理换 $\sigma_t$，权重继续用 Sahoo 等人已经训好的检查点。附录 E.1 还报过用 ReMDM 目标从头训，测试困惑度和 MDLM 相当。主实验走的是「采样器套在预训练 MDLM 上」。

后验对整条轨迹不再是马尔可夫的，构造方式接近连续扩散里的 DDIM：先指定边缘，再指定反向条件。实现上仍是祖先采样，伪代码（他们 Algorithm 1）每步先跑去噪器得到 $\mathbf{x}_\theta(z_t)$，再按式 (1) 那组分段后验抽 $z_s$。$\sigma_t$ 有上界，否则后验不是合法分布：

$$
0\leq\sigma_t\leq\min\bigl\{1,(1-\alpha_s)/\alpha_t\bigr\}=:\sigma_t^{\max}.
\tag{2}
$$

日程有几档。max-capped 把再掩概率封到常数 $\eta_{\mathrm{cap}}$。rescaled 按比例打折 $\eta_{\mathrm{rescale}}\cdot\sigma_t^{\max}$。confidence-based 再按「该位置上次揭开时有多尖」把 $\sigma_t$ 分到各个 token 上，尖的少掩、平的多掩。loop 更特别：在 $[t_{\mathrm{on}},t_{\mathrm{off}})$ 里把 $\alpha_t$ 冻成 $\alpha(t_{\mathrm{on}})$，$\sigma_t$ 仍开着。生成分成三段。先按普通 MDLM 写出一份草稿（$\sigma_t=0$）；中间一段 SNR 不变，专门把一部分字盖回去再填，等于纠错圈；最后再把剩下的掩码填完。DFM 的 corrector 做不到冻 $\alpha$，因为那条路径不允许 $\alpha_s=\alpha_t$ 的区间（他们 Proposition 4.4）。FB corrector 是 ReMDM 在 $\sigma_t=(\alpha_s-\alpha_t)/\alpha_t$ 时的特例；DFM corrector 对应再乘一个 $\beta_t$。ReMDM 把这两家收成特例，又多出 loop 这一种 DFM 没有的工作点。

主指标用 MAUVE，不用生成困惑度。附录里可以把 corrector 拧到生成一串 `love love love`，生成 PPL 落到 1.5。PPL 被过大的 $\sigma_t$ 黑成「评委模型很喜欢的重复」，多样性没了。MAUVE 同时看质量和多样性。Table 1 复用 Sahoo 的 MDLM 检查点，OWT，GPT-2 词表，长度 1024，nucleus 采样标 $\dagger$。$T\geq L$ 用 $\eta_{\mathrm{cap}}=0.02$ 加 loop（$t_{\mathrm{on}}=0.55$，$t_{\mathrm{off}}=0.05$，$\alpha(t_{\mathrm{on}})=0.9$）。少步 $T<L$ 只用 $\eta_{\mathrm{cap}}=0.04$，不开 loop。

| 方法 | MAUVE $T=1024$ | $2048$ | $4096$ |
|---|---|---|---|
| AR（$T=1024$）$\dagger$ | 0.760 | — | — |
| SEDD absorb | 0.008 | 0.008 | 0.009 |
| MDLM $\dagger$ | 0.042 | 0.037 | 0.035 |
| MDLM+FB $\dagger$ | 0.133 | 0.197 | 0.243 |
| MDLM+DFM $\dagger$ | 0.254 | 0.294 | 0.269 |
| ReMDM $\dagger$ | 0.403 | 0.610 | **0.656** |

少步侧 $T=128/256/512$：ReMDM 的 MAUVE 是 0.057 / 0.216 / 0.350，MDLM 是 0.015 / 0.023 / 0.031。论文自己写相对掩码扩散约 15.62 倍 MAUVE、相对带 corrector 约 2.23 倍。对一下格子：$0.656/0.042\approx 15.62$，分母是 MDLM 在 $T=1024$ 的 0.042，不是 AR；$0.656/0.294\approx 2.23$，分母是 MDLM+DFM 在 $T=2048$ 的 0.294。AR 那一格是 0.760。ReMDM 在 $T=4096$ 走到 0.656，缺口还在，只是掩码扩散自己从 0.035 抬上来了。不要把 15.62 倍抄成「已经超过 GPT-2」。MDLM 加大 $T$ 分数还略掉（0.042 到 0.035），corrector 在大 $T$ 饱和，ReMDM 随 $T$ 继续涨。这才是他们说的 inference-time scaling：步数预算可以花在纠错圈上，而不只是「再揭几个还没写的格子」。

LLaDA 8B Instruct 是另一张表，附录 D.4 写了采样器怎么改。最大掩码长度 32，先用原版 LLaDA 采样器揭开 28 个；进入 loop 32 步，每步按最低置信再掩固定个数（Countdown 1 个，TruthfulQA 4 个），再揭回同样个数；loop 结束之后把剩下的空隙填完。DFM 没有 loop，改成每步掩 1 个揭 2 个。原版 LLaDA 用贪心；为了报置信区间，ReMDM / DFM 开了随机采样。Countdown 4-shot、256 道合成题、每题 10 次算 pass@1；TruthfulQA 6-shot、817 题，报正确答案与似是而非的错误答案之间的 $\Delta$ROUGE。Table 3：

| | Countdown pass@1 | TruthfulQA $\Delta$ROUGE-1/2/L |
|---|---|---|
| LLaDA | $45.2\pm 0.2$ | $27.1\pm 0.4$ / $30.1\pm 0.4$ / $27.2\pm 0.4$ |
| LLaDA-DFM | $44.8\pm 0.2$ | $28.2$ / $31.1$ / $28.3$ |
| LLaDA-ReMDM | $46.1\pm 0.2$ | $29.5\pm 0.4$ / $31.8\pm 0.4$ / $29.5\pm 0.3$ |

有显著，很小。Countdown 加 0.9 个点，DFM 还略低于原版。这不是 8B 全面翻盘，也不是 Table 9 那种 50 个 GSM8K 点。协议还绑着长度 32、无半自回归、loop 里固定再掩个数。换 GSM8K、换块长 8，未找到一手来源，不要把 46.1 外推成 Instruct 主表。

分子那一侧，ReMDM 把 Schiff 等人的 D-CFG / D-CBG 接到预训练 MDLM 上，QM9 环数最大化时把新颖性-属性的帕累托往外推。本花园可控生成专文已经写过离散 CFG。这里只记一句：引导来晚了，吸收态若不能再脏，梯度或对数概率加权没有位置可动。ReMDM 给引导买的是「已经写出的 SMILES 字符还能被盖回去」。图像侧把同一采样器套在预训练 MaskGIT 上，ImageNet $256\times 256$、$T=64$ 时 FID 4.45 对 MaskGIT 的 4.85。语言花园不把 FID 当主锚，只说明 failure to remask 不是文本私有。

## 4. GIDD：训练时见过乱词，才会自纠正

ReMDM 假定去噪器仍然是「看见掩码就填、看见词就信」。GIDD 问的是更早的问题：训练分布里要不要出现「看起来合法、其实是噪声换来的词」。吸收态永远不会把 `cat` 前向成 `dog`。网络因此从未被要求在明文格子上出力。测试时你把一个错字留在画布上，请它改，它没有这种监督。

GIDD 把掩码和均匀跳按比例混。$p_u$ 是均匀分量。$p_u=0$ 时 ELBO 退回 MDM：small 模型验证 PPL 24.36，他们对 MDM 的重实现是 24.37。理论等价在数字上对得上。真正涨似然的是重加权（GIDD+）：small、262B token、$p_u=0$ 时验证 PPL 22.29，对照 Sahoo 报的 MDLM 23.21、自己的 MDM 重实现 23.36。这是 OWT、DiT、GPT-2 词表、上下文 512 的竞赛。不要抄到 LLaDA 8B。

自纠正是生成之后的不动点迭代。模型给每个位置打分，挑它认为最该换的格子，一次换一个，避免并行再引入新的搭配错误。早停看 self-accuracy（有多少位置已经是模型自己的 $\arg\max$），patience 32。base（约 320M）$p_u=0.2$：生成 PPL 从 214 降到 93.3（评委是 Gemma 2 9B），self-accuracy 从 62.0% 升到 73.5%。摘要写样本质量最多改善约 55%，指的是这条生成 PPL 曲线，不是 8B 下游。mask-only（$p_u=0$）换同样多的 token，生成 PPL 和 self-accuracy 不涨。MDM 重实现上做自纠正还会变差。作者解释：数值稳定起见 $p_u$ 没真的置零，每 batch 大约 10 个随机 token（分母 262144），于是 GIDD 的「纯掩码」仍见过极少乱词；真·MDM 没有。

GPT-4o 打分把「乱词监督缺了就不能改」写死。Table 4，1–10 分。$p_u=0$ 再做自纠正：清晰度 2.51 到 1.99（$-20.9\%$），语法、事实、文风、创意全掉，多数超过 $5\sigma$。$p_u=0.2$、温度 $0.5$：清晰度 2.49 到 2.90（$+16.5\%$），语法 $+16.6\%$，事实 $+8.5\%$。只掩码再做自纠正会伤质量分。混合噪声才涨。small 模型上 $p_u=0.1$ 比 $0.2$ 更稳，均匀分量不是越大越好，和宽度有关。

GIDD 付的是预训练账：噪声法律变了，损失不能只写在 `[MASK]` 上，未掩但被均匀跳污染的位置也要预测。ReMDM 付的是采样账：权重可以是现成的 MDLM。两篇文章标题都带纠正，账单差一级。把 GIDD 的 55% 生成 PPL 改善抄到 LLaDA 8B 的 GSM8K 上，中间缺尺度、缺词表、缺评测协议，也缺「8B 是否用混合噪声训过」这一问。开放权重的 7B–8B 默认仍是纯吸收态。未找到一手来源证明 LLaDA 8B 换 GIDD 前向之后下游如何。

## 5. 四条邻居，付账不同

规划器、编辑腐蚀、均匀扩散、流匹配 corrector，都会在文献里说「可以改已经写出的字」。问的是同一句口语，走的不是同一条法律。

DDPD 另训脏净头。去噪器可以是现成的 SEDD。规划器允许把明文标脏，采样时钟可以往回拨。代价约 2 NFE，尺度是 GPT-2 / SEDD。它不改 $Q_t$，改的是「谁算噪声」这块规划。和 ReMDM 的差别：ReMDM 用 $\sigma_t$ 随机再掩，没有二分类头；DDPD 用 $p(\mathrm{N})$ 决定动哪一格。尖的位置也可能是自信的错字，规划器存在的理由是这一句。ReMDM 的 confidence-based $\sigma_t$ 仍从去噪器的尖度来，会跟自信的错字共谋。

Seed Diffusion 前 80% 标准掩码，后 20% 按 Levenshtein 做插删改。他们故意不用 carry-over。这是改前向的一部分，采样才能改已经揭开的 token。主过程仍是掩码，不是回到均匀 $Q_t$。产品吞吐写在 H20 的 2146 token/s 上，和 ReMDM 的 MAUVE 表不是同一张卡。

UDLM 全程均匀噪声，理论上每一步都可以把词换成另一个词。Schiff 等人强调吸收态揭开后引导没有位置可动，均匀更容得下「先写错再扳回来」。词表五万时，反向要在每个看起来合法的词上保持怀疑，似然竞赛上均匀长期落后。GIDD 走的是折中：大部分时间仍是掩码，掺一截均匀，专门为了让明文格子上出现监督。

DFM 的 corrector 保证再脏之后样本仍来自 $p_t$。ReMDM 证明它是 $\sigma_t=\beta_t(\alpha_s-\alpha_t)/\alpha_t$ 时的特例。loop 冻 $\alpha$ 是 ReMDM 多出来的。Table 1 里 MDLM+DFM 在 $T=4096$ 的 MAUVE 是 0.269，ReMDM 是 0.656。同一检查点、同一 OWT，差在采样器能不能把步数预算花在纠错圈上。

| 路径 | 改什么 | 要不要重训 8B | 8B 上能核对的数 |
|---|---|---|---|
| 低置信 remask | 本步提交子集 | 否 | Table 9：21.3 / 70.0 |
| ReMDM | 反向后验 $\sigma_t$ | 否（套 MDLM / LLaDA 权重） | Instruct Countdown 45.2→46.1 |
| GIDD | 前向混均匀 | 要 | 无 8B 表；OWT 110M/320M |
| DDPD | 另训规划器 | 去噪器可不训 | 无 8B 表；SEDD 尺度 |
| Seed 编辑腐蚀 | 前向后 20% | 要 | 吞吐卡，不是 GSM8K |
| UDLM | $Q_t$ 用均匀 | 要 | 可控生成，不是 8B 主表 |
| DFM corrector | 采样器特例 | 否 | Table 1 的 0.269；Countdown 44.8 |

`[OM-FREEPLAY]` 实践顺序仍是：先锁 Table 9 那种低置信或阈值，崩了再换 ReMDM 这种不改权重的后验，仍不够再问要不要付前向账（编辑腐蚀 / GIDD）。不要一上来重训 8B 的 $Q_t$。

## 6. 失效：指标、尺度、缓存前提

生成 PPL 不能当 ReMDM 的主指标。$\sigma_t$ 过大，采样器会把句子拧成评委语言模型喜欢的重复，PPL 好看，MAUVE 会揭穿。GIDD 用 Gemma 2 9B 当生成 PPL 的评委，和 ReMDM 用 MAUVE，是两种防黑法。跨论文减 PPL 没有共同评委。

8B 上 ReMDM 只动了 Countdown 和 TruthfulQA，长度 32，loop 里固定再掩 1 个或 4 个。GSM8K 70.3、HumanEval 35.4 那张主表没有 ReMDM 列。加 0.9 个 Countdown 点，证明「failure to remask 在 8B Instruct 上不是零」，不证明「换采样器就能补上 BBH 相对 LLaMA3 的 12.4 个点」。

近似缓存和「已提交仍可改」打架。Fast-dLLM DualCache 假定后缀一直是掩码、相邻步 $K,V$ 很像。ReMDM 的 loop 把已经揭开的位置再盖回去，Key 会变。Seed 的编辑腐蚀明确站在「后缀一直是掩码」对面。把 27.6× 贴到可编辑扩散上，没有论文支持。Eso-LM 的精确 KV 依赖因果前缀不再回头；再掩已经写进前缀的字，缓存同样作废。纠错权和缓存权是同一枚硬币的两面。产品若已经靠 DualCache 把前向次数压下去，再开 loop，加速比会吐回去。先问质量缺口来自锁死还是来自每步太贵。

置信度当再掩分数，会跟自信的错字共谋。Table 9 证明尖的格子更该提交；ReMDM-conf 证明平的已解码格子更该盖回。两句话用的是同一个 $\max p$，方向相反，作用对象也相反：一个作用在尚未提交的掩码预测上，一个作用在已经落盘的明文上。实现时不要共用一个「最低置信集合」而不写清集合从哪来。Countdown 实验每步只再掩 1 个最低置信明文，等于把第二层启发式小心翼翼地接到第一层权重上。这是 46.1 那么小的原因之一：改动预算被人为掐死，避免 $\sigma_t$ 把对的中间量也盖掉。

均匀分量不是免费的纠错开关。GIDD Table 3，$p_u$ 从 0 加到 0.2，未做重加权时验证 PPL 从 24.36 走到 28.22。动态权重把 0.2 那一档救回 24.64，再加衰减到 24.38，仍略差于纯掩码的 GIDD+。似然和自纠正不是同一方向。要填空、要理解基准，纯掩码更干净；要生成之后还能改自己的错，才付均匀税。8B 的主任务是 GSM8K / MMLU，开放权重选择纯吸收态，和这张小模型表不矛盾。

## 7. 读完应留下的判断

看见 remask，先问改的是哪一层。本步尚未提交的预测，走 Table 9，便宜，8B 上值 50 个 GSM8K 点。已经落盘的明文，吸收态默认不许改；ReMDM 用 $\sigma_t$ 打开这扇门，OWT 上 MAUVE 从 0.035 走到 0.656，8B Instruct 上 Countdown 从 45.2 走到 46.1。训练时见没见过乱词，走 GIDD，$p_u=0$ 的自纠正会伤 GPT-4o 分。三句话的尺度分别是 8B 下游、169M 级 MDLM 检查点、110M/320M DiT。不要合成一张「大模型已经会改自己写过的字」。

会采样的人，把 Table 9 和 ReMDM Table 1 分成两列旋钮。会加速的人，记住 loop 会打碎「后缀一直是掩码」的缓存前提。会离散扩散的人，记住 ReMDM 是「只改采样器、边缘仍是掩码扩散」的那条例外；Seed 和 GIDD 仍要改前向。三问分开，「可以改」才不会变成空话。

图 1 左列解决的是「这一步盖回哪些预测」。中列解决的是「已经写下去的 token 还能否变回掩码」。右列解决的是「网络有没有见过合法的错字」。读论文标题里的 remask / corrector / self-correction，对一下落在哪一列。对不上，数字再好看也是另一台机器的分数。

## 参考文献

- [Wang, Schiff, Sahoo, Kuleshov, ReMDM, NeurIPS 2025](https://arxiv.org/abs/2503.00307) — 式 (4)(6)(9)；Table 1 OWT MAUVE；Table 3 LLaDA Instruct；附录 D.4 的 28/32 + loop。
- [Nie et al., LLaDA, 2025](https://arxiv.org/abs/2502.09992) — Table 9：随机 21.3 / 低置信 70.0。那一刀不是改已提交明文。
- [von Rütte et al., GIDD, 2025](https://arxiv.org/abs/2503.04482) — $p_u=0$ 收回 MDM；GIDD+ 22.29；自纠正 214→93.3；Table 4 mask-only 自纠正伤分。
- [Sahoo et al., MDLM, NeurIPS 2024](https://arxiv.org/abs/2406.07524) — 被 ReMDM 套用的检查点族；failure to remask 的后验来源。
- [Liu et al., DDPD, ICLR 2025](https://arxiv.org/abs/2410.06264) — 规划器把明文标脏；约 2 NFE。
- [Gat et al., Discrete Flow Matching, 2024](https://arxiv.org/abs/2407.15595) — corrector 是 ReMDM 特例；不能冻 $\alpha$ 做 loop。
- [Chang et al., MaskGIT, 2022](https://arxiv.org/abs/2202.04200) — 低置信揭开的图像祖先；本身仍受 failure to remask 限制。

## 相关

- [采样与调度](../02-mechanism/sampling.md)
- [谁决定揭开哪一格](./plan-denoise.md)
- [离散扩散](../02-mechanism/discrete-diffusion.md)
- [离散流匹配](./discrete-flow.md)
- [可控生成与引导](./controllable-generation.md)
- [失效模式](./failure-modes.md)
- [Dream、Mercury、Seed](../03-models/dream-mercury-seed.md)
- [推理加速](./inference-acceleration.md)
