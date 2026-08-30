---
title: "15 · FastGen：按头自适应"
date: 2026-08-30
tags: [FastGen, KV Cache, Adaptive Compression, Ge, ICLR 2024]
as_of: 2026-08-30
category: LLM 指南
---

# 15 FastGen：按头自适应

自回归 decode 要把历史 $K,V$ 留下来。模型变大、生成变长，这份 cache 先把 GPU 撑满，再被赶到 CPU/NVMe，PCIe 又把延迟送上去。Ge、Zhang、Liu（共一作）、Minjia Zhang、Han、Gao 在 [Model Tells You What to Discard: Adaptive KV Cache Compression for LLMs](https://arxiv.org/abs/2310.01801)（[ICLR 2024 Oral](https://iclr.cc/virtual/2024/oral/19718)，Honorable Mention；会场论文 hash `639a9a172c044fbb64175b5fad42e9a5`）里不改权重、不换注意力公式，只换 **每个 head 用哪套驱逐**。做法分两段：**prompt encoding** 上做一次 profiling，认出该头更像局部窗、特殊 token、标点、列稀疏高频、还是必须全量；**token generation** 再按选定策略管 cache。plug-and-play，不微调。

本文是 [2.3.2 稀疏与压缩注意力](../2.3.2-稀疏与压缩注意力.md) 里「推理时稀疏」的专文。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与行归一化 softmax。[12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md) 写 FastGen「会在 prompt 上做 profiling，但驱逐仍发生在生成期」——这句对，证明在 §3.2 与 Algorithm 1–2。**不是** [11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)（所有头共用累积 Heavy Hitter）、SnapKV（各头同一套观测窗 Top-$k$，生成前一次性压 prompt）、[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)（不驱逐）、[10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)、ScissorHands（pivotal / 重要性持久）、TOVA（当前步最低分踢掉）、PyramidKV（层间预算金字塔）。**也不是** DeepSpeed-FastGen 那套 Dynamic SplitFuse 推理引擎——只是同名。

---

## 1. 具体问题：KV 线性涨，而且不是每个 head 都在看全体 token

§3.1 把生成推理拆成两步。**Prompt encoding**：算第 $i$ 个 token 时，注意力要看见前 $i-1$ 个位置的 $K,V$；算过的向量进 cache，免得后面每步重算。**Token generation**：每产出一个新 token，就把它的 KV **追加**进 cache。于是 cache 条数随生成长度线性涨。显存不够就 offload（论文引 DeepSpeed-Inference、FlexGen）；PCIe 带宽有限，这条路本身也贵。

要回答的问题因此很窄：已经训好的 decoder，能不能在 **不微调** 的前提下少存 KV，而生成质量不要崩？

论文的切入点不是「再发明一种全头共用的打分」，而是论文 Figure 1：同一层里三个 head 的注意力图长得不像。引言写 not all attention modules need to attend to all tokens。直觉是：先认出每个头的结构，再决定丢什么。他们把这条路叫 **diagnose-before-compress**。

---

## 2. 已有做法差在哪：一条驱逐规则打所有头

三条常见路，打的不是同一个靶：

1. **硬件精确注意力。** FlashAttention / MEA 把二次工作集压下去，cache 条数仍随序列涨。见 [00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md) 与 [FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)。
2. **所有头同一套 KV 压缩。** 论文把 $C_{\mathrm{local}}$、$C_{\mathrm{frequent}}$、以及 $C_{\mathrm{local+frequent}}$ 当成非自适应基线；并写 $C_{\mathrm{local+frequent}}$ **identical to** H2O 与 ScissorHands。论文 Figure 2：30B 上 FastGen **50% cache compressed** 超过这些固定方法在 **15% compressed** 时的表现。数字出在图上，本篇不把柱高估成表。
3. **学着压 prompt（Gisting 一类）。** Related Work：要重训，生成时当额外开销。

Related Work 原句把本文的位置钉死：不是再研究「某一种」驱逐，而是 **协同多种驱逐，去对齐不同头的属性**。

实验刻意不用 Llama 2-chat：因为它走 grouped-query attention。正文只用 Llama 1 的 **MHA**，GQA 留给 future work（§6）。指令跟随实验是他们用 LIMA + Open Assistant 微调过的 Llama 1，评 AlpacaEval（805 条，GPT-4 两两对比 Full Cache）。

---

## 3. 双阶段：profiling 在 prompt encoding，驱逐在 token generation

§3.2：FastGen 是 **dual-phase**。prompt encoding 阶段做 model profiling，给每个注意力头选最合适的压缩策略；token generation 阶段 **不再无差别追加** 新 KV，而是按已选策略管理 cache。

这就是 SnapKV 专文那句话的出处。不要读成「prompt 那段 KV 原封不动」：Algorithm 1 第 5 步已经对 prompt 的 $K,V$ 做了 $f(\cdot,C^{i})$，初始 cache 就是压缩过的；Algorithm 2 只是同一套 $C^{i}$ 在生成期继续跑。profiling 选策略、驱逐执行策略，两件事不要并成一步。

**Algorithm 1（Prompt Encoding）。** 可行策略集合 $\mathcal{C}$ 与整段 prompt 进，自适应 cache 出。对每个头 $H_{i}$：

1. $K^{i},Q^{i},V^{i}\leftarrow H_{i}(\mathrm{Prompt})$
2. $A^{i}\leftarrow\mathrm{softmax}(Q^{i}(K^{i})^{\top})$
3. $C^{i}\leftarrow$ 对 $A^{i}$ 解式 (1)（最优策略）
4. $K^{i}_{C^{i}},V^{i}_{C^{i}}\leftarrow f(K^{i},V^{i},C^{i})$，再写成运行时的 $\hat K^{i},\hat V^{i}$

返回 $\{C^{i},\hat K^{i},\hat V^{i}\}$。

**Algorithm 2（Token Generation）。** 从 prompt 最后一个 token 起，每步对每个头：用已压缩 cache 算当前 $K,Q,V$，再跑一次 $f(\cdot,C^{i})$ 更新 $\hat K,\hat V$，然后采样。策略 $C^{i}$ **不再搜索**。

§3.3 把假设写死：一个头的注意力结构在生成过程中 **稳定**，所以 **只靠 encoded prompt 选一次策略就够**。他们引 H2O / ScissorHands 作理论旁证，自己的实证是 §4.2 / 论文 Figure 4：Llama 1 65B、GSM8k 随机样本，同一头在 prompt encoding 第 1 步以及 decode 第 10 / 20 / 30 步的累积注意力图案相对稳定。Layer 33 Head 0、Layer 23 Head 2 几乎只看 special token；Layer 23 Head 0 吃 locality 与 punctuation；Layer 23 Head 3 有超过 **10%** 的分数落在 others，适合 $C_{\mathrm{full}}$。

![Prompt encoding 上按注意力图为每个头选定策略，生成期按该策略持续驱逐](./images/fig-fastgen-two-phase.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Two panels: Algorithm 1 Prompt Encoding profiling; Algorithm 2 Token Generation eviction. Arrow: profile once then evict every step. -->

> 图 1：双阶段。对应 Algorithm 1–2 与 §3.2。色块只区分「留下 / 丢掉」，不是论文里的注意力热力图。2026-08 自绘。

**图 1 解析**

- **左 Algorithm 1**：先对 **完整 prompt** 算 $A^{i}$（prefill 仍是稠密注意力），再按式 (1) 把头派进某个 $C^{i}$，最后 $f$ 把 prompt KV 压成初始 $\hat K,\hat V$。官方仓库 README 把这一步写成 prefilling **末尾** 对注意力矩阵做 profiling。
- **右 Algorithm 2**：$C^{i}$ 已钉死。新 token 进来之后，局部头滑窗、高频头按累积分踢人、特殊/标点头只收同类 token。红叉是生成期驱逐，不是第二次 profiling。
- **中间箭头 profile once then evict every step**：对应 §3.3「只用 encoded prompt 选策略」。Table 3 把 profiling 计时写成 decoding 起点，但算法正文是 prompt encoding；时长在 65B 上恒为 **0.11 s**、与生成长度无关，更像 prefill 末尾一次性搜策略。

---

## 4. 五种注意力结构，五种 cache 策略

引言写 FastGen **recognizes five fundamental attention structures**。论文 Figure 1 左图画的是 **四种常见结构**（caption 原句），§3.4 把账算清：在常规 **全量 KV** 之外，另外考虑 **四种**压缩策略。合在一起就是五种。不要少写一种，也不要发明第六种。

四种压缩策略原文如下。

- **Special Tokens** $C_{\mathrm{special}}$。只留特殊 token，例如句首 `<s>`、指令标记 `[INST]`。
- **Punctuation** $C_{\mathrm{punct.}}$。只留标点，如 `.`、`:`、`?`。
- **Locality** $C_{\mathrm{local}}$。丢掉远程上下文。当前 token 与某条历史的相对距离超过阈值，就驱逐那条 KV。阈值由预算比 $r_{l}$ 决定：$r_{l}$ = 局部上下文长度预算 / 输入序列长度。实验默认 $r_{l}=0.3$。
- **Frequency (Heavy Hitter)** $C_{\mathrm{frequent}}$。对每个 token 监视注意力分数的累积和，当频率，只留最频繁的那些。长度预算比 $r_{f}$，实验默认 $r_{f}=0.3$。论文点名这条与 Sheng et al. 2023、H2O、ScissorHands 同类，但 FastGen 只把它当 **其中一个头** 的选项，不是所有头的唯一规则。

第五种是 **Full KV** $C_{\mathrm{full}}$：该头对全体 token 都看，标准 cache，一条不丢。

列稀疏对应的是 $C_{\mathrm{frequent}}$：注意力图沿列很空，低频列可以踢。局部头对应 $C_{\mathrm{local}}$。special / punct 是两类「几乎只盯某一种表面形式」的头，§3.4 拆开写，引言「tokens/punctuations」那句不要读成一种。

![五种 KV 策略：局部窗、特殊 token、标点、列稀疏高频、全量](./images/fig-fastgen-five-structures.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Five rows C_local, C_special, C_punct, C_frequent, C_full. -->

> 图 2：五种结构与对应 cache。对应 §3.4 与论文 Figure 1 左。格子数是示意图。2026-08 自绘。

**图 2 解析**

- **(a) $C_{\mathrm{local}}$**：只有最近一段青绿。远程灰格在生成期会随窗滑动继续被踢。
- **(b) $C_{\mathrm{special}}$**：黄格是 `<s>` / `[INST]` 这类。§3.4 写一句话里通常 **不到 5 个** special token，所以几乎不占预算。
- **(c) $C_{\mathrm{punct.}}$**：橙格是标点。同样「个数少、内存便宜」，常被嵌进混合策略。
- **(d) $C_{\mathrm{frequent}}$**：列稀疏高频。橙格可以出现在序列任意位置，由累积注意力决定，不是固定第 0 位。
- **(e) $C_{\mathrm{full}}$**：全体留下。§4.1 / 论文 Figure 3：首层和末层更多头被派到这一档；中间层更多头的累积分数已经有 **>0.95** 落在 special tokens 上。

---

## 5. 公式：恢复比 $T$ 下选最省内存的策略

对策略 $C$，压缩写 $K_{C},V_{C}=f(K,V,C)$。注意力图 $A=\mathrm{softmax}(QK^{\top})$。在能把 $A$ 恢复到比例 $T$ 的策略里，挑内存最便宜的：

$$
C^{*}=\arg\min_{C\in\mathcal{C}}\;\mathrm{CacheMemoryCost}(C)
\quad\text{s.t.}\quad
\bigl|A-\mathrm{softmax}(QK_{C}^{\top})\bigr|\le 1-T.
\tag{1}
$$

$T$ 是超参：越大越苛刻，越容易落到 $C_{\mathrm{full}}$。论文没把 $|\cdot|$ 写成 Frobenius 还是逐元和，实现以「注意力图恢复比」为准，不要补一个未出现的范数名字。约束只写了用压缩后的 $K_{C}$ 重建注意力；$V$ 与 $K$ 走同一套下标，一起被 $f$ 丢掉。

混合策略的全集是 $2^{4}$ 量级，他们用贪心嵌套收成 **五个** 可行策略（式 (2)）。「两个策略相加」= 各自留下的 KV 做 **并集**：

$$
\mathcal{C}=\bigl\{
C_{\mathrm{special}},\;
C_{\mathrm{special+punct.}},\;
C_{\mathrm{special+punct.+frequent}},\;
C_{\mathrm{special+punct.+frequent+local}},\;
C_{\mathrm{full}}
\bigr\}.
\tag{2}
$$

$C_{\mathrm{special}}$ 出现在除「纯标点消融」以外的所有混合里：§3.4 给了两条理由——special 上的注意力质量通常很高（§4 也看到「很大一部分分数打在 special 上」），以及 special 个数少、几乎不加内存。$C_{\mathrm{punct.}}$ 因为同样省，也常被嵌进去。

Appendix A.1 把式 (1) 在这条链上的搜法写成：固定 $T$，从最省的 $C_{\mathrm{special}}$ 起，不够恢复就并上下一档，直到命中 $T$。这和「在式 (2) 五个里挑满足约束且 $\mathrm{CacheMemoryCost}$ 最小的」是同一条链，不是另开第六种结构。

主实验只改 $T$ 来控制剪枝比例，$r_{l}=r_{f}=0.3$ 不动。生成用 nucleus，$T=0.6$、$p=0.9$（这里的 $T$ 是采样温度，不要和恢复比 $T$ 混）。质量实验在 8×A100 80GB。

![贪心嵌套：special → 加标点 → 加高频 → 加局部 → 全量，按恢复比 T 停](./images/fig-fastgen-greedy-hybrids.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Nested hybrid chain of five policies with recover ratio T. -->

> 图 3：式 (2) 的嵌套可行集。对应 §3.4 与 Appendix A.1。图上的格子是示意图。2026-08 自绘。

**图 3 解析**

- **从左到右覆盖变大**：$C_{\mathrm{special}}\subset C_{\mathrm{special+punct.}}\subset\cdots\subset C_{\mathrm{full}}$。左边最省，右边最保真。
- **顶上的 $T$**：式 (1) 的恢复比，**不是**剪枝百分比。$T=0.98$ 比 $T=0.91$ 更难满足，cache 更大。
- **选最左边仍满足约束的盒子**：就是 $\arg\min$ 内存。Appendix Table 5：顺序改成 special → frequent → local → punct 会多剪一点（36.40% vs 36.04%），win rate 从 **49.75%** 掉到 **47.64%**。默认顺序以式 (2) 为准。

![同一层：非自适应对照所有头同一套规则；FastGen 每个头自己的 C_i](./images/fig-fastgen-per-head.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Left fixed policy all heads; right FastGen per head. -->

> 图 4：为什么要按头自适应。左栏对应论文非自适应基线；右栏对应论文 Figure 1 右「同一层三个头」。2026-08 自绘。

**图 4 解析**

- **左 Fixed**：所有头同一套窗。这是 $C_{\mathrm{local}}$ / $C_{\mathrm{frequent}}$ / $C_{\mathrm{local+frequent}}$ 打全体头。论文拿它当 H2O / ScissorHands 的对照，**不要**在这张图上展开那两篇的公式。
- **右 FastGen**：Head A 只留 special，Head B 局部，Head C 全量。策略来自该头自己的 $A^{i}$，不是层内广播。
- **黄格在右栏三行都出现**：因为式 (2) 把 $C_{\mathrm{special}}$ 嵌进混合策略；全量头也会看见 special，只是它还看见别的。

---

## 6. 数字跟表：摘要里的 negligible 以 win rate $>45\%$ 那几行为准

摘要写 substantial GPU memory reduction、negligible generation quality loss。引言另一句：recover over **95%** of attention scores with **35%** cache compressed；30B 上 FastGen **50%** compressed 超过固定方法 **15%** compressed。这些句子的分母、任务、模型对不齐。**跟表，弃摘要。**

质量口径先钉死。AlpacaEval 上 FastGen 与 **同一模型 Full Cache** 成对交给 GPT-4，win rate **约 50%** = 无损。§5.2 自己把 **win rate over 45%** 写成 little-to-no quality regression。Table 1 是微调 Llama 1、batch **16**、序列 **512**、权重 fp16 的 **KV 显存**（不是整模）。

Table 1：

| 模型 | Full | FastGen | Pruned ratio | $T$ | Win rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| 7B | 4.3Gb | 1.9Gb | 56.6% | 91% | 30.8% |
| 7B | | 2.6Gb | 39.8% | 95% | 37.7% |
| 7B | | 3.6Gb | 16.9% | 98% | **47.4%** |
| 13B | 6.7Gb | 3.1Gb | 53.4% | 91% | 32.0% |
| 13B | | 4.1Gb | 39.0% | 95% | 39.9% |
| 13B | | 5.5Gb | 18.3% | 98% | **48.7%** |
| 30B | 13.1Gb | 5.7Gb | 56.7% | 93% | 37.0% |
| 30B | | 6.7Gb | 48.8% | 95% | 42.5% |
| 30B | | 9.5Gb | 27.4% | 98% | **47.5%** |
| 65B | 21.5Gb | 9.4Gb | 56.3% | 93% | 40.9% |
| 65B | | 11.8Gb | 44.9% | 95% | 44.2% |
| 65B | | 13.8Gb | 36.0% | 98% | **49.8%** |

加粗行才过他们自己的 45% 线。对应剪枝：7B **16.9%**、13B **18.3%**、30B **27.4%**、65B **36.0%**。§5.2 把这四档写成「约 20% / 20% / 30% / 40%」——40% 是对 36.0% 的约数；**不要**用 §5.1「65B、45% win、44.9% pruned」那句，那句对应的表行是 44.9% pruned、win **44.2%**，没过 45%。引言「35% compressed、恢复 95%」也对不齐：65B、$T=95\%$ 的剪枝是 **44.9%**，$T=98\%$ 才是 **36.0%**。

$T=91\%$ 把 7B 剪到 56.6% 时 win rate 只有 **30.8%**，这不是 negligible。高压缩比和「几乎不掉点」不能写在同一行。

基座 Llama 1 的 HumanEval / GSM8k / NQ / TQA 只有论文 Figure 5 的曲线（F1 或 Pass@1，相对 KV budget 从 30% 到 100%），**没有**可抄的表。本篇不估柱。

端到端延迟是 **Llama 1-7B、V100**。计时从 prompt encoding 起到生成结束。HF = Hugging Face Accelerate；DS = DeepSpeed；FastGen 的核是在 DeepSpeed 上加 KV 稀疏。单位秒。

Table 2 按 batch 拆开抄。batch 1：

| [prompt, gen] | HF | DS | FastGen | vs HF | vs DS |
| --- | ---: | ---: | ---: | ---: | ---: |
| [32, 512] | 13.35 | 11.58 | 11.21 | 16.03% | 3.20% |
| [32, 2048] | 57.37 | 47.12 | 44.6 | 22.30% | 5.35% |
| [32, 8192] | 299 | 201.23 | 179.43 | 40.00% | 10.83% |
| [32, 16384] | 799.14 | 435.74 | 359.83 | **55.00%** | 17.42% |

batch 2：

| [prompt, gen] | HF | DS | FastGen | vs HF | vs DS |
| --- | ---: | ---: | ---: | ---: | ---: |
| [512, 32] | 1.12 | 0.79 | 0.73 | 34.80% | 7.59% |
| [512, 512] | 19.16 | 10.45 | 9.71 | 49.30% | 7.08% |
| [4096, 4096] | 167.64 | 91.04 | 76.93 | 54.10% | 15.50% |

batch 8：`[512,512]` HF 23.44 / DS 12.93 / FastGen 10.57（vs HF 54.90%，vs DS 18.25%）；`[4096,4096]` HF **OOM**，DS 127.94，FastGen 82.16（vs DS **35.78%**）。batch 16、`[512,512]` 三家都 **OOM**。

正文写「相对 HF 最少 16.04%、最好 55.0%」。表里短生成是 **16.03%**（$(13.35-11.21)/13.35$），跟表。相对加速随生成长度变大：batch 1 从 512 到 16k，16.03% → 55.00%。

Table 3，Llama 1-65B，profiling 时长恒 **0.11 s**，每 token decode **0.10 s**：

| 生成长度 | 总时长 s | Profiling s | Profiling / Overall |
| ---: | ---: | ---: | ---: |
| 128 | 30.98 | 0.11 | 0.35% |
| 256 | 50.1 | 0.11 | 0.21% |
| 512 | 94.98 | 0.11 | 0.12% |
| 1024 | 157.43 | 0.11 | 0.07% |

$C_{\mathrm{frequent}}$ 额外存累积注意力，形状少一维 `hidden_dimension`。论文取 hidden_dimension $=128$，额外内存 $1/128=0.78\%$。

Table 4（微调 65B、AlpacaEval、$T=0.98$）看「拿掉某一种策略」：完整 $\mathcal{C}$ 剪 **36.04%**、win **49.75%**。去掉 frequent：剪 21.26%、win **46.08%**（掉 3.67 个点）。去掉 special：剪 31.16%、win **47.64%**（掉 2.11 个点）。论文把 $C_{\mathrm{frequent}}$ 与 $C_{\mathrm{special}}$ 写成最重要的两档；$C_{\mathrm{frequent}}$ 与 $C_{\mathrm{local}}$ 剪得更多，但 **单独、非自适应** 地打所有头，论文 Figure 2 已经差一截。

---

## 7. 「不是」：同一套分数打所有头，或生成前一次性钉死 prompt

图 4 左栏已经是非自适应对照。和邻居专文的差，一句够：

| 名字 | FastGen 不是它的理由 |
| --- | --- |
| StreamingLLM | 固定起始位 + 滚动窗，与内容无关；专文 [10](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md) |
| H2O | 所有头共用累积 Heavy Hitter + 最近窗；专文 [11](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md) |
| SnapKV | 各头同一套观测窗 Top-$k$，生成前一次性压 prompt；专文 [12](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md) |
| Quest | 全量 KV 留 GPU，按当前 $q$ 选页，不驱逐；专文 [13](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md) |
| ScissorHands / TOVA / PyramidKV | 论文把 ScissorHands 并进「全体头 $C_{\mathrm{local+frequent}}$」对照；TOVA、PyramidKV 不是本算法。不在这里展开。 |
| FlashAttention / MEA | 精确全注意力，不丢中间 token |
| DeepSpeed-FastGen | 另一套推理系统（SplitFuse），只是产品同名 |

FastGen 的 $C_{\mathrm{frequent}}$ **可以**看起来像 H2O 的 Heavy Hitter，但只作用在被 profiling 派到这一档（或混合档）的头上，并且 special / punct / local / full 仍在同一模型里并存。

---

## 8. 失效模式

**结构在生成中途改了，策略不会改。** §3.3 的稳定性假设被论文 Figure 4 的 30 步解码托住，不是定理。话题跳到 prompt 里从未被该头策略罩住的段落，丢掉的 KV 后面永远看不见——和所有驱逐算法同类。

**Win rate 过 45% 时，大模型也只剪大约三分之一。** Table 1 65B、$T=98\%$：36.0% pruned、49.8% win。把摘要的「大幅减内存、几乎不掉点」套到 $T=91\%$ 那一行（56.6% / 30.8%），是错的。

**不加速、不压缩 prefill 的二次注意力。** Algorithm 1 要完整 $A^{i}$。省的是选定策略之后的 cache 条数，以及 decode 期少算的 KV。TTFT 仍被 prefill 卡住。

**没有接到 GQA。** 结论明确留给 future work。生产期 Llama-2/3 式分组 KV，不能直接把本篇 Table 1 的 Gb 数抄过去。

**官方仓库几乎是空的。** 论文与 ICLR 摘要写代码在 [machilusZ/FastGen](https://github.com/machilusZ/FastGen)。2026-08-30 打开：只有 LICENSE 与 README，没有算法实现，也没有摘要承诺的 CUDA kernel。README 把社区复现指到 AnswerDotAI/cold-compress，并把 Microsoft MInference 写成 close implementation（prefilling 末尾按头选 special / local / topk 混合）。数字与公式仍以本论文表为准，不把第三方仓库当一手结果。Issue #1 / #3 仍在问代码。

**生产路径不一定读得到 $N\times N$ 分数。** Profiling 要用 $A^{i}$。走 FlashAttention 且分数不落 HBM 时，这一步要另开计算路径——这是部署约束，不是 2310.01801 的定理。

---

## 9. 下一篇

- Decode 累积分数、最多踢 1 条：[11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。
- 生成前观测窗、一次性压 prompt：[12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)。
- 固定起始位、不看内容：[10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- 不驱逐、按当前 query 选 page：[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)。
- 硬件上仍算精确注意力：[00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)、[FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)。

---

## 本篇来源

1. Ge, Zhang, Liu（共一作）, Minjia Zhang, Han, Gao. *Model Tells You What to Discard: Adaptive KV Cache Compression for LLMs*. [arXiv:2310.01801](https://arxiv.org/abs/2310.01801) / [HTML](https://arxiv.org/html/2310.01801)（v4 [HTML](https://arxiv.org/html/2310.01801v4)），[ICLR 2024 摘要页](https://proceedings.iclr.cc/paper_files/paper/2024/hash/639a9a172c044fbb64175b5fad42e9a5-Abstract-Conference.html)（hash `639a9a172c044fbb64175b5fad42e9a5`），[会场 Oral](https://iclr.cc/virtual/2024/oral/19718)（Honorable Mention；[Orals 日程](https://iclr.cc/virtual/2024/events/oral) May 7, Halle A 2）。Algorithm 1–2、式 (1)(2)、§3.2–3.4、§4、Table 1–5、Figure 1–6。作者单位以 ICLR PDF 为准：UIUC + Microsoft。
2. 论文声明的代码仓：[machilusZ/FastGen](https://github.com/machilusZ/FastGen)。README 写明仓内尚无实现，并指向 cold-compress / MInference 为复现线索；**不以第三方仓库的数字替换 Table 1**。
3. 微软研究页：[Model Tells You What to Discard](https://www.microsoft.com/en-us/research/publication/model-tells-you-what-to-discard-adaptive-kv-cache-compression-for-llms/)（ICLR 2024 Oral, May 2024）。

数字以打开的表和 §5.2 的 45% 线为准。摘要「negligible」与 §5.1「65B 45% win / 44.9% pruned」让给 Table 1 同行。图 1–4 的格子数是示意图。
