---
title: "ParallelBench：GSM8K 测不出并行诅咒"
category: null
tags:
  - ParallelBench
  - parallel-decoding
  - total-correlation
  - sampling
  - Mercury
published: true
as_of: 2026-08-31
excerpt: "一步里同时揭开的格子被写成条件独立。理想模型的 KL 下界仍是条件总相关 C(Y|X)。Copy 的 C=0，Shuffle 的 C 随 n 发散，即便每步只揭 2 个 token，准确率也随 n 趋向 0。GSM8K / HumanEval 落在谱的左边。LLaDA 1.5 微调修不好 C>0。CoT 能缓，输出大约 8 倍 token。PrefixCache 在这套任务上普遍掉分。"
---
# ParallelBench：GSM8K 测不出并行诅咒

采样专文把并行诅咒写成：一步提交两个位置，它们在给定 $x_t$ 时被当成条件独立。失效模式专文把括号不配、标识符对不上列进清单。Kang、Galim、Oh 等人的 ParallelBench（ICLR 2026，arXiv:2510.04767）把这句话收成可算的下界，再做成 17 个对人和自回归都简单、对并行扩散却可以崩掉的任务。仓库在 [furiosa-ai/ParallelBench](https://github.com/furiosa-ai/ParallelBench)。

D2F、Fast-dLLM、APD 的主表几乎都在 GSM8K / HumanEval / MBPP 上报「并行了还不掉分」。本篇的判断是：那些任务的条件总相关不够大，测不出因式分解误差。Shuffle 和 W2S-hard 在谱的右边。读加速论文之前，先问评测落在这条轴的哪一段。

## 1. 一步因子分解，KL 下界就是 $\mathcal{C}$

掩码扩散每步对还没揭开的位置给出边际。集合 $S_t$ 里的字被写成

$$
P_\theta(S_t\mid X,S_{<t})=\prod_{y_i\in S_t}P_\theta(y_i\mid X,S_{<t}).
\tag{1}
$$

一步生成（$T=1$）时，Huang 等人 2022 已经证过：理想因子模型相对真分布的 KL，下界是条件总相关

$$
\min_\theta\mathcal{D}_{\mathrm{KL}}\bigl(P_{\mathrm{data}}(Y\mid X)\;\|\;P_\theta(Y\mid X)\bigr)\ge\mathcal{C}(Y\mid X),
\tag{2}
$$

$$
\mathcal{C}(Y\mid X)=-H_{\mathrm{data}}(Y\mid X)+\sum_{y_i\in Y}H_{\mathrm{data}}(y_i\mid X).
\tag{3}
$$

$\mathcal{C}$ 度量的是「各位置自己好猜」和「整句一起好猜」之间的缺口。边际都对，联合可以全错。图 1 里的「New City」就是这件事：New York 和 Mexico City 各自高频，一步独立 argmax 会拼出不存在的城。

$T$ 步时，把 $Y$ 切成 $S_1\cup\cdots\cup S_T$，每步仍因子分解。Theorem 1：

$$
\min_\theta\mathcal{D}_{\mathrm{KL}}\ge\mathcal{L}_T\bigl(\{S_i\}\bigr)=\sum_{i=1}^{T}\mathbb{E}_{S_{<i}\sim P_{\mathrm{data}}}\bigl[\mathcal{C}(S_i\mid X,S_{<i})\bigr].
\tag{4}
$$

等式在每一步的边际都等于真条件边际时取到。$T=1$ 时 $\mathcal{L}_1=\mathcal{C}(Y\mid X)$。$T=|Y|$、每步一格时每一项的 $\mathcal{C}$ 都是 0，$\mathcal{L}_{|Y|}=0$。Theorem 2：在所有 $T$ 步划分上取最优，$\mathcal{L}^*_T$ 随 $T$ 单调不增。步数越少，下界越松，不是实现没调好。真实语料上 $\mathcal{C}$ 算不出，Huang 用训好的 Transformer 近似过。ParallelBench 先用解析任务把 $\mathcal{C}$ 写成闭式，再把同一套难度搬进客服队列和造句。

半自回归（semi-AR）把序列切成块，块间从左到右、块内仍并行，是式 (4) 的一种划分。块扩散、D2F 的块内一步多揭，吃的是同一条界。块边界只把 $\mathcal{C}$ 关在块里，不把 $\mathcal{C}$ 变成 0。Theorem 2 说的单调，是「最优划分」上的：多给一步，可以把原来某一步里相关最强的那两格拆开，下界只降不升。随便切不一定降。Left-to-Right Top-k 是一种很差的划分，当依赖是全局排列时；Confidence Top-k 是另一种启发式划分，当 $\mathcal{C}=0$ 而模型校准不齐时反而更好。界是数据的，划分是解码器的，两件事不要焊成一句「步数多就一定好」。

GSM8K 的最终答案往往是一个数，中间 CoT 虽长，位置之间的硬约束没有「全排列不能重复」那么紧。HumanEval 的局部句法有括号配对，但评测看的是跑通，很多函数体可以一步填一片还碰巧能过。这就是 Figure 7 把它们放在左边的原因：不是这两项简单，是并行掉分这项指标对它们不敏感。加速论文只报这两列，等于在 $\mathcal{L}_T$ 已经接近 0 的区域刷 TPS。

![](./images/fig-parallelbench-ct.png)

> 图 1：左列 Copy 的 $\mathcal{C}=0$，理想模型可以一步全揭；中列 Shuffle 的 $\mathcal{C}$ 随 $n$ 发散，每步 2 个 token 准确率仍趋向 0；右列 17 任务把 GSM8K 放在 Shuffle 左边。底栏：微调修不好 $\mathcal{C}>0$，CoT 用大约 8 倍 token 换缓降。

**图 1 解析**

- **L0–L3**：Copy 和 Replace Index 每个输出格由 $X$ 单独钉死。并行不引入分布误差。
- **M0–M2**：Shuffle 是随机排列。$\mathcal{C}=n\log_2 n-\log_2(n!)$，极限无穷。$k=2$ 时界仍发散。
- **M3**：阈值 $\gamma>0.5$ 在 Shuffle 上会退化成逐步揭开，准确率 1。看起来「阈值很稳」，其实没并行。
- **R1**：Waiting Line 十条、Text 五条（含 W2S 三档）、Sudoku（$\mathcal{C}=0$）对 Latin Square（$\mathcal{C}>0$）。
- **R2–R3**：GSM8K 落在谱左。Mercury 在 Reverse 上近满分，Shuffle 随 $n$ 崩，和 AR 的难易刚好反着。
- **F0**：式 (4) 的和。CoT 把依赖写进中间步，最终答案的 $\mathcal{C}$ 变小，账单是更长的 $Y$。

## 2. 四条列表运算：$\mathcal{C}$ 能写成公式

输入长度 $n$ 的列表，例如 `[A, B, C, D, E]`。

Copy 与 Replace Index。后者按给定下标把一项换成 F，看起来更难。对 $\mathcal{C}$ 来说两者相同：每个 $y_i$ 由 $X$ 单独决定，$\mathcal{C}(Y\mid X)=0$。理想模型可以一步揭开全部格子，没有分布误差。LLaDA 1.5 没微调时 Reverse / Replace Index 会因能力不够掉分，那是模型容量，不是 $\mathcal{C}$。

Replace Random。随机挑一项换成 F，其余保持。恰好换一个，位置之间互相约束：

$$
\mathcal{C}(Y\mid X)=(n-1)\bigl[\log_2 n-\log_2(n-1)\bigr],\qquad\lim_{n\to\infty}\mathcal{C}=\log_2 e\approx 1.44.
\tag{5}
$$

并行难度有上界，不会随 $n$ 爆炸，但一步全揭已经不是无误差。

Shuffle。输出是随机排列。一个位置坐下某项，其它位置不能再出现它：

$$
\mathcal{C}(Y\mid X)=n\log_2 n-\log_2(n!),\qquad\lim_{n\to\infty}\mathcal{C}=\infty.
\tag{6}
$$

$T$ 步、第 $t$ 步揭 $|S_t|$ 格时，$\mathcal{L}_T=\sum_t |S_t|\log_2 k_t-\log_2(n!)$，$k_t$ 是还没填的剩余长度。$T=n/2$（每步 2 个 token）时，$\mathcal{L}_{n/2}=\log_2\frac{n!!}{(n-1)!!}$，极限仍是无穷。并行度拧到 2，诅咒也不消失。

揭开策略把同一份 $\mathcal{C}$ 变成不同的准确率。作者假定无偏理想模型：logits 等于任务决定的理想值加零均值噪声。Table 1 收成四句话。

Copy / Replace Index：Top-k 与阈值，贪心准确率都是 1。

Replace Random，贪心 Top-k：$k=2$ 时 Acc$=0.5$；$k>2$ 时 Acc$=0$。温度 1、一步全揭：Acc$=((n-1)/n)^{n-1}\to 1/e$。

Replace Random，贪心阈值：$n>2$ 时每个位置第一步更想保留原词，置信度 $(n-1)/n$。若 $\gamma<(n-1)/n$，一步全揭、一次都没换成，Acc$=0$。若 $\gamma\ge(n-1)/n$，阈值永远达不到，退化成逐步揭开，最后一格置信度 1，Acc$=1$。

Shuffle，Top-k：

$$
\mathrm{Acc}(k)=\prod_{i=1}^{n/k}\frac{P\bigl(n-(i-1)k,\,k\bigr)}{\bigl(n-(i-1)k\bigr)^k}.
\tag{7}
$$

$k=n$ 时 $n!/n^n\to 0$；$k=2$ 时 $(n-1)!!/n!!\to 0$；$k=1$ 时恒为 1。贪心和温度 1 同一极限。

Shuffle，阈值 $\gamma>0.5$：剩余 $m\ge 2$ 格时每格置信度 $1/m\le 0.5<\gamma$，一步只能揭最尖的一格，Acc$=1$。阈值看起来救了 Shuffle，并行度掉回 1。

同一套 $\gamma$ 救不了两个任务。Shuffle 要 $\gamma>0.5$ 才稳，Replace Random 要 $\gamma\ge(n-1)/n$ 才稳；中间那一档，Shuffle 逐步成功、Replace Random 一步全错。没有对所有任务最优的揭开器。经验验证把 LLaDA 1.5 微调到每条列表任务上，只填列表项、格式格预填。Figure 2 与式 (7) 同方向：$k>1$ 时 Shuffle 随 $n$ 掉到 0；$k=n$ 掉得比 $k=2$ 快。Replace Random 一步加温度贴近 $1/e$，贪心 $k=2$ 贴近 0.5。

## 3. 17 个任务：把 $\mathcal{C}$ 搬进客服和造句

Waiting Line 十条。把列表运算写成客服队列：`["Susan Fox", "Philip Gray", ...]`，做 Copy、Reverse、Replace Index、Replace Random、Shuffle，以及 Insert / Remove 一类变体。人数 $n$ 是难度旋钮。LLaDA 1.5 主文用 $n\in\{3,4,5,6\}$，先排除「模型根本不会排队」这种能力问题。Mercury 和 AR 对照把 $n$ 拉到 $[5,20]$。Insert / Remove Random 和 Replace Random 同族：必须恰好动一个位置，其余冻结，$\mathcal{C}$ 有界但大于 0。附录微调写明 Shuffle 和 Insert/Remove/Replace Random 都修不好。Copy 只是把队列抄下来，人名之间没有互斥，所以 Figure 3(a) 几乎是一条平线。

人名比字母列表更伤 tokenizer。`Susan Fox` 可能切成多个 token，理想分析里「一个位置一项」在真实词表上不成立。作者用 infill、预填格式格，把变量限制在列表项上，就是为了少踩分词。产品若要从自然语言里自己写出方括号，分词把一项拆开，块内并行会在姓和名之间再引入一层 $\mathcal{C}$。本篇公式按「一项一格」讲，部署时格子是 subword。

Text Writing 五条。摘要用 SAMSum，改写用公开 paraphrase 集，再加上自造的 Words-to-Sentence（W2S）三档：给定 $n$ 个词造一句。easy 词相关，medium 松散，hard 互不相关。摘要和改写的输入上下文密，$\mathcal{C}$ 小。W2S 输入极稀，每个位置强烈影响其它位置。评分用 grammar（Morris 2025），因为 ROUGE 看不出「词选对了、句法已经散」。grammar 盯的是主谓、冠词、一致关系，这些恰是一步独立 argmax 最容易拆开的局部约束。加速论文若只用 ROUGE 或最终数字对错，会把句法散了但仍含关键词的句子算对。W2S-hard 把互不相关的词硬塞进一句，合法句法空间更大、互相排斥也更狠，掉分最陡是设计出来的，不是模型碰巧不会写作。

Puzzles 两条。Sudoku 不论难度都是唯一解，$\mathcal{C}(Y\mid X)=0$。Latin Square 结构像数独，合法解很多，$\mathcal{C}>0$。Ye 等人用数独展示扩散规划优于 AR；ParallelBench 把它和拉丁方并排放，看 $\mathcal{C}$ 会不会把并行优势吃掉。唯一解意味着每个格子在给定 $X$ 时没有自由：理想模型的边际如果校准好，一步全揭也对。多解意味着格子之间有「选了这行就不能再选这列」的互斥，一步独立采样会写出两行同一个符号。Dream 7B 在 Sudoku 上相对 AR 的优势（Dream 专文 Table 1 的 81.0 对 21.0）是规划能力，不是并行能力。把那一格抄进「扩散并行又快又准」，ParallelBench 的拉丁方会打回。规划器专文的低置信 remask 是冻结顺序；这里的 $\mathcal{C}$ 是数据，顺序再聪明，一步里两格仍然看不见对方的最终取值。

对照模型：Llama 3.1 8B、Llama 3.2 3B、Qwen2.5 3B/7B、Qwen3 4B、Claude 3.5 Haiku；扩散侧 LLaDA 8B、LLaDA 1.5、Dream 7B、DiffuCoder、闭源 Mercury。揭开：Top-k 的 Random / Confidence / Left-to-Right / Margin / Entropy；阈值 Confidence，$\gamma\in\{0.5,0.6,\ldots,1.0\}$；外加 Fast-dLLM 的 factor-based，以及 semi-AR。主文 Figure 3 盯 LLaDA 1.5 四条揭开曲线。

Copy 几乎不随并行度掉。Reverse 随揭开器起伏，作者归到容量，因为 $\mathcal{C}=0$。Replace Index 逐步揭开不到 50%，并行仍稳；Replace Random 逐步近满分，一并行所有揭开器都陡降。和 §2 的 $\mathcal{C}$ 对得上。Shuffle 从近满分掉到 0，比 Replace Random 更陡。Text：逐步揭开 grammar 都近满分，并行之后掉速按 Paraphrasing、W2S-easy、W2S-hard 变陡。数独逐步揭开难于拉丁方，并行之后两者贴在一起：拉丁方的 $\mathcal{C}>0$ 把逐步时的优势吃掉。

阈值在保守档优于 Top-k，激进档会一次揭太多，曲线比静态 Top-k 好看，仍远不是 oracle。作者按样本挑能答对的最优阈值，得到一条 oracle 曲线：同样准确率下明显更快。现有自适应揭开还没有按样本难度调并行度。Fast-dLLM 的 factor-based 揭开也在评测列表里，主文叙事仍以 Confidence 阈值和 Top-k 为主。factor 想用「这一步还能揭几格」的标量去挡不可搭配的集合，和 EB-Sampler 的联合熵上界是同一方向的补丁，不是把式 (1) 改成联合。semi-AR 的块长也没有对所有任务最优：Text 的局部句法依赖，小块强制从左到右会伤 grammar；Waiting Line 的约束散落在列表项之间，从左到右反而有利于先拿住格式格。Figure 5 两条任务的块长趋势反着。采样专文 Table 9 里低置信 remask 把 GSM8K 从随机 remask 的 21.3 拉到 70.0，那是 $\mathcal{C}$ 不大时校准启发式的红利。Shuffle 上同一启发式会变成「阈值很高、一步一格」，红利变成放弃并行。

仓库把汇总分数写成 PBx：平均准确率至少 $x\%$ 时还能维持的最大 tokens/step。主文给的是曲线和定性排序，精确的 PB80 格子未在 HTML 全文里找到。`[OM-FREEPLAY]` 读 Figure 3、7 看趋势，不要把「PB80=某数」写进对照表。

## 4. Mercury 觉得 Shuffle 难，AR 觉得 Reverse 难

Figure 4，$n\in[5,20]$。人直觉上 Reverse 要精确倒序，Shuffle 只要任意排列，AR（Haiku、Qwen2.5 3B/7B、Qwen3 4B）在 Shuffle 上更高。Mercury 反着：Reverse 近满分，Shuffle 随 $n$ 掉。闭源扩散若内部走了高并行，就会在 $\mathcal{C}\to\infty$ 的任务上露出式 (6)。产品页上的四位数 tok/s 没有说 Shuffle。把 Mercury Mini 的 1109 tok/s 和「质量已对齐 AR」写在同一句，缺的就是这条轴。

Figure 7 把 GSM8K、HumanEval 嵌进同一张「并行掉分 × 是否受益于从左到右」平面。Waiting Line 里 $\mathcal{C}=0$ 的任务在 GSM8K 左边，$\mathcal{C}>0$ 的往右走，Shuffle 在最右。Text 里改写、摘要在 HumanEval 左边，W2S 在右边。标准数学代码基准落在谱左，自适应并行策略在那上面显得很聪明。

PrefixCache（Fast-dLLM）在 ParallelBench 上普遍掉分。附录 Figure 13、25：趋势仍是「并行升、分降」，整体比无缓存更差。加速专文 GSM8K 上 PrefixCache 几乎不掉，是因为那列 $\mathcal{C}$ 小、表示漂移也小。队列任务上格式格和列表项耦合紧，冻住的前缀 KV 更容易过期。报 DualCache「质量无损」必须写任务。D2F 的真 KV 写在已提交块上，和 PrefixCache 冻掩码后缀不是同一近似；本篇没有测 D2F 检查点，不把 52.5 TPS 抄进来当 ParallelBench 分数。

## 5. 微调、CoT、ReMDM：三条补丁各补一块

Waiting Line 上对 LLaDA 1.5 逐任务微调：每任务 2 万条训练、5 千条验证，10 个 epoch，AdamW，batch 32，学习率 $10^{-5}$，warmup 0.05，余弦。LoRA $r=128$、$\alpha=256$，只动 q/k/v，dropout 0.05。单卡 A100 约两小时。逐步揭开之后所有任务近 100%，Replace Index 从低于 50% 拉上来。并行时 Replace Index 仍高，符合 $\mathcal{C}=0$ 时可学。Replace Random 和 Shuffle 照样随并行掉。理想模型都挡不住式 (5)(6)，LoRA 更挡不住。D2F 那种 12 小时脏前缀蒸馏，改的是块间条件，改不了块内一步多格的 $\mathcal{C}$。

CoT：one-shot 由 GPT-4.1 Mini 写，提示要求逐步想、最后写 `The answer is:`。输出上限从 32 提到 256。并行掉分变缓，因为中间推理把「该换哪一项」写成明文，最终列表的条件相关变小。代价是大约 8 倍输出 token。吞吐若按 tok/s 算会涨，按「一道题的墙钟」算不一定涨。不能当并行诅咒的解，只能当把 $\mathcal{C}$ 从答案挪到草稿。

ReMDM 和 RCR 在 Waiting Line 上没有带来提升。提交之后再 MASK 专文写过：低置信 remask 不改已落盘明文；ReMDM 改反向后验。训练免费的悔棋，救不了「一步里两格的联合根本没被建模」。作者还从 SEDD 微调吸收态与均匀跳转，均匀扩散理论上步步都能改已经写出的字。附录 F.4 是小模型实验，不是 8B 主表。均匀路线的纠正能力，score entropy 专文有机制，本篇不把 F.4 的小图升格成 Mercury 级结论。

DiffuCoder 的 AR-ness 与本篇正交：AR-ness 高表示揭开顺序像从左到右，本篇的 $\mathcal{C}$ 是数据里的依赖，不是顺序像不像 AR。代码专文的 HumanEval 仍可能落在 Figure 7 左边。APD 用小 AR 管联合，等于在式 (1) 外面加了一层非因子验证；有损，且要同词表。ParallelBench 没有把 APD 画进 Figure 3。SSD 无损自验证会把并行度收回到「验证器允许的 $k$」，理论上能把 Acc 从式 (7) 的 $k>1$ 极限拉回来，墙钟含验证。两套验证器都还没有 ParallelBench 主表。

任意顺序专文写过：$1/t$ 损失是对所有生成顺序求期望。那是训练。推理一步提交 $|S_t|>1$ 时，式 (1) 把该步内部的顺序期望直接丢掉，换成独立边际。所以「任意顺序」救的是 $T=|Y|$ 时先揭哪一格，「并行」伤的是 $T\ll|Y|$ 时一格看不见另一格。两件事先问 $T$，再问 $\mathcal{C}$。

## 6. 失效：短输出、闭源内部、以及「阈值很稳」的错觉

作者自己写：17 任务覆盖仍窄；主分析是短输出，长序列可能换形状；$n$ 可调，长生成要另测。把 Shuffle 的 $n=6$ 曲线抄进 2k token 聊天，外推无效。长 CoT 会把 $\mathcal{C}$ 摊到更多位置上，每步的 $|S_t|$ 若跟着长度线性涨，式 (4) 的和不一定降。这是局限，不是「短任务已经代表聊天」。

阈值 $\gamma>0.5$ 在 Shuffle 上 Acc$=1$，是因为并行度被阈值掐死。产品若同时报「阈值 0.9、质量不掉、TPS 很高」，在 $\mathcal{C}$ 高的任务上这三句话不能同时真：要么质量掉，要么退化成逐步，TPS 回到 AR 附近。D2F 的 $\tau_{\mathrm{conf}}=0.9$ 是同一类开关。GSM8K 上 77.3 对 77.4，推不出 Shuffle 上同样稳。

闭源 Mercury 的并行度不可观测。Figure 4 只能从 Shuffle 崩、Reverse 不崩反推它没有按 $\mathcal{C}$ 自适应降并行。内部若已做块扩散或验证器，本篇看不见。Dream 7B、DiffuCoder 的全曲线在附录，主文叙事以 LLaDA 1.5 为代表，不把附录某一格的偶然持平写成「Dream 已经克服 $\mathcal{C}$」。

评测格式格预填时，列表项才是变量。产品生成要从提示词自己写出方括号和逗号，格式依赖会再抬一截 $\mathcal{C}$。微调实验的 infill 设定比真实客服回复更友好。

batch、卡、引擎：本篇是准确率–并行曲线，几乎不报 TPS。不要和 dInfer 的 680、D2F 的 52.5、d3LLM 的 288.9 减。tokens/step 才是横轴。墙钟另测。PBx 若以后仓库放出格子，分母仍是平均准确率门槛，不是某张卡上的 tok/s。

## 7. 读完应留下的判断

要报并行不掉分，先问任务的 $\mathcal{C}$。Copy、数独、Replace Index、以及多数 GSM8K 列，落在左边。Shuffle、Replace Random、W2S-hard、拉丁方，落在右边。左边证明不了右边。

要选揭开器，承认没有全局最优。$\mathcal{C}=0$ 且模型不完美时，Confidence Top-k 优于 Random；$\mathcal{C}>0$ 时反过来。阈值在 Shuffle 和 Replace Random 上的好 $\gamma$ 区间是空的。oracle 曲线说明按样本调阈值仍有空间，现有方法没有把这件事做成算法。

要加速，CoT 和微调各补一块：CoT 挪 $\mathcal{C}$、加 token；微调修好 $\mathcal{C}=0$ 的容量缺口，修不好 $\mathcal{C}>0$ 的界。PrefixCache 在这套任务上还掉分。真 KV（块已提交）和冻掩码后缀，对照物不是同一近似。

图 1 左列是可以并行的任务。中列是定理不允许并行的任务。右列是评测轴。底栏是补丁的账单。三块齐，再去读 D2F 的 52.9× 和 Mercury 的四位数吞吐，才知道那些数字站在轴的哪一侧。轴的刻度是 $\mathcal{C}$ 和 $T$，不是模型名。

## 参考文献

- [Kang et al., ParallelBench, 2025](https://arxiv.org/abs/2510.04767) — 式 (1)–(5)；Theorem 1–2；Table 1；Figure 3–8；附录 PrefixCache / 微调 / CoT。
- [Huang et al., On the learning of non-autoregressive transformers, 2022](https://proceedings.mlr.press/v162/huang22d.html) — 一步因子模型的 KL 下界即 $\mathcal{C}(Y\mid X)$。
- [Wu et al., Fast-dLLM, 2025](https://arxiv.org/abs/2505.22618) — 条件独立假设与阈值揭开；PrefixCache 在本基准上掉分。
- [Inception Labs et al., Mercury, 2025](https://arxiv.org/abs/2506.17298) — Figure 4 的闭源对照；Reverse 稳、Shuffle 不稳。
- [Nie et al., LLaDA, 2025](https://arxiv.org/abs/2502.09992) — 低置信 remask；GSM8K 列不够当并行压力测试。

## 相关

- [采样与调度](../02-mechanism/sampling.md)
- [失效模式](./failure-modes.md)
- [D2F](./d2f.md)
- [推理加速](./inference-acceleration.md)
- [APD](./apd.md)
- [谁决定揭开哪一格](./plan-denoise.md)
- [提交之后还能不能改](./remask-revise.md)
- [任意顺序](./any-order.md)
- [块扩散](./block-diffusion.md)
- [Dream、Mercury、Seed](../03-models/dream-mercury-seed.md)
- [LLaDA 专文](../03-models/llada-frontier.md)
- [代码向扩散](./code-dllm.md)
