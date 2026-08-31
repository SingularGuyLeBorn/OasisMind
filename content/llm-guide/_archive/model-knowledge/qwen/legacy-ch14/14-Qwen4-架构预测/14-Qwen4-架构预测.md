---
title: "Qwen4 预测：Flash-Next 早鸟捆了什么"
date: 2026-08-30
as_of: 2026-08-30
tags: [Qwen4, Qwen3.8-Flash-Next, QSA, Gated-Residual, Muon, MoE, n-gram]
---

# Qwen4 现在能预测什么

> [返回 14.2-Qwen](../14.2-Qwen.md) · [Flash-Next 架构精译](../../../../../_sources/model-reports/qwen/qwen3-8-flash-next/01-Qwen3.8-Flash-Next-架构精译.md) · [QSA](../../../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/08-QSA-Qwen稀疏注意力/08-QSA-Qwen稀疏注意力.md) · [GR](../../../../../2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) · [n-gram / Engram](../../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.8-条件记忆与Engram/01-Engram-从Ngram到可扩展查找/01-Engram-从Ngram到可扩展查找.md) · [Muon](../../../../../6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md) · [KDA / GDN](../../../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md)

Qwen4 还没有出厂技术报告，也没有权重。2026-08-26 开源的是 Qwen3.8-Flash-Next。官方 README、阿里云博文和 HF 卡片都把它写成「会 underpin Qwen4 的架构」的早鸟，角色对标当年 [Qwen3-Next](https://qwen.ai/blog?id=qwen3-next) 之于 Qwen3.5：积木先放到社区里检验。

所以下面只谈这只已经公开的鸟。报告怎么捆、卡片上有哪些整数、哪三本参数账不能加在一起。Qwen4-Max 的层数、专家池、发布日，没有材料就不写。

云上的 `qwen3.8-flash`（默认 1M、带工具）是产品名，不是另一套架构，第 14 章也不单独给它开目录。

检查点 `config.json` 里 `model_type` 是 `qwen4_exp`，类名是 `Qwen4ExpForConditionalGeneration`。这是 Flash-Next 这一只的代码名，不是 Qwen4 已经发报告。

## 1. 官方说会 underpin Qwen4 的，是四条轴

报告标题是 *On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability*（Qwen Team，2026-08-26，28 页）。摘要把设计目标写死：用更小的激活量和大约九分之一的训练 FLOPs，去追上一世代 397B-A17B（Qwen3.7-Plus）的预训练质量。四条轴各自对一个瓶颈：

| 轴 | Flash-Next 这次捆什么 | 官方怎么说它和 Qwen4 的关系 | 详见 |
|----|------------------------|------------------------------|------|
| Attention | 3 GDN : 1 全局；CPT 后全局换成 **QSA**；MTP 的全注意力同样换成 QSA | 混合日程从 Qwen3-Next 沿用到 3.5–3.8；这一次改的是**全局那一层** | [QSA](../../../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/08-QSA-Qwen稀疏注意力/08-QSA-Qwen稀疏注意力.md) |
| Residual | **GR**，$n_r=4$，丢掉 $H_{\mathrm{res}}$ | 加宽残差流 + 逐元素读门；博文写残差态可 FP8 | [GR](../../../../../2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) |
| Embedding | 靠前 **一层** n-gram 表，+51B，Host prefetch | 报告点名 Cheng et al. 2026；PDF **没有**字符串 `Engram` | [2.4.8](../../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.8-条件记忆与Engram/01-Engram-从Ngram到可扩展查找/01-Engram-从Ngram到可扩展查找.md) |
| Optimization | 2D 线性走 **Muon**；Embedding / Router / GR 低秩走 **AdamW** | 为新架构重拟合 scaling law；取消 batch-size warmup | [6.5 Muon](../../../../../6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md) |

可以合理预测的，是 Qwen4 家族会继续用这四条轴当骨架——官方自己把 Flash-Next 的角色写成「Qwen3-Next 之于 3.5」的再一次。不能预测的，是旗舰会不会仍是 48 层、会不会仍是 512 专家、MTP 头会不会仍是 4B。那些整数下面都会钉成 **Flash-Next 这一只** 的来源，不升格成「Qwen4 一定」。

HF 卡片还写明这是带视觉编码器的因果语言模型（`Causal Language Model with Vision Encoder`）。视觉塔数字（`vision_config.depth=27` 等）同样只属于这只鸟，本篇不把它写成 Qwen4-VL 规格。

## 2. 三套参数账必须分开写

报告摘要与 §1 用同一句话给主干记账：**125B 总参数、每 token 激活 6B，另有 51B n-gram 嵌入表放在加速器之外**。HF 卡片在主干那一行后面再加一句：**plus 51B n-gram embedding and 4B MTP**。三本账的分母不一样，禁止加总后再叫「6B」。

| 账本 | 数字 | 进每 token 矩阵乘 / 6B 激活？ | 一手来源 |
|------|------|-------------------------------|----------|
| A 主干 MoE | 125B 总 / **6B 激活** | 6B 就是这本账的激活栏 | 报告摘要、§1、Tab. 11；HF 卡片「125B with 6B activated」 |
| B n-gram 表 | **51B** | **否**。确定性寻址，不进每 token 矩阵乘预算 | 报告摘要；Tab. 11 单列 `# N-gram Embedding Params`；博文「可放 Host、异步 prefetch」 |
| C MTP 头 | **4B** | **否**。训练 / 投机解码用；不要加进 6B | **只在 HF 卡片**写成 4B。报告讨论 MTP 模块与 QSA 复用 top-k，**没有**给出 4B 这个整数 |

HF 页面另有一处 Safetensors「Model size **180B** params」。那是把 A+B+C 加在磁盘上的存盘口径（$125+51+4=180$），不是激活量。本篇引用它只为说明「存盘」和「每 token 算」不是同一列；**仍然禁止**把 180B 或 51B 写进 6B。

查表位置：报告 §2.3.1 与 Table 7 扫了第 1/2/3/4/10/15/25 层以及 2+15、2+25。单层第 2 层综合最好；同一预算拆到多层没有稳定好处。最终放 **Layer 2**，让 Host prefetch 和第 1 层计算重叠。HF 卡片写成「20,000,000（bigrams/trigrams at layer 2）」；`config.json` 的 `ple_layer_ids: [2]`、`ngram_vocab_size_base: 20000000`、`ngram_size: 3` 与卡片一致。

博文原句级口径：查找位置可预先确定，表可放 Host Memory，与主干计算异步重叠，不必长期占 GPU。报告同一意思：deterministic addressing enables host-memory offloading and asynchronous prefetching。

![三本参数账：6B 激活、51B Host 表、4B MTP 头](images/fig-qwen4-param-ledgers.png)

> 图 1：三本账并排，51B 或 4B 不要加进 6B。查表只在 Layer 2，地址可 prefetch。

**图 1 解析**

- 左本（账 A）：125B 总参数里，前向每个 token 只激活约 6B。这是 Tab. 11 拿来和 397B-A17B、27B 稠密对照的那一列。
- 中本（账 B）：51B 是 Host 上的查找表。红色禁止符针对的就是「把 51B 加进 6B」这种合成。
- 右本（账 C）：4B 来自 HF 卡片的 MTP 头，单独成行。报告没有这个 4B。
- 虚线 prefetch：键在看到隐藏态之前就能定（当前 token + 前面若干 token），所以可以和第 1 层计算重叠。这是查表能进 Host 的原因；MoE 专家路由要等 $h_t$，不能同一套卸法。
- 图底「只在 Layer 2」：不是每层都插一张表。Engram-27B 插两层是另一篇实验，见 [2.4.8](../../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.8-条件记忆与Engram/01-Engram-从Ngram到可扩展查找/01-Engram-从Ngram到可扩展查找.md)，不要默认 Qwen 抄了那套层位。

报告 Table 8 / Table 9 还写了一条和「把表当免费容量」相反的观察：固定总参、拿专家去换 n-gram 槽时，loss 在约 10× 词表（约 25% 参数比）最低，下游分数却没有对 MoE-only 形成清晰优势；改成 MoE 预算固定、表往上加之后，loss 随词表单调下降，下游在部分基准上饱和。结论写在报告里：n-gram 与 MoE 专家扩的不是同一类容量。预测 Qwen4 时，不要把「再加一张更大的 Host 表」自动翻译成「激活 6B 也能再涨一档」。

## 3. 混合日程：3 GDN : 1 全局，CPT 后全局变成 QSA

Qwen3-Next 带进 3.5 系列的骨架是 **三层 Gated DeltaNet + 一层全局注意力**。Flash-Next 没有改这个 3:1 比例，改的是全局那一层在续预训练（CPT）之后变成 QSA。HF 卡片把 48 层写成

$$
12 \times \bigl(3\times(\text{Gated DeltaNet}\to\mathrm{MoE})\ \to\ 1\times(\text{QSA}\to\mathrm{MoE})\bigr).
$$

`config.json` 的 `layer_types` 与 `full_attention_interval: 4` 逐层印证：每四个元素里三个 `linear_attention`、一个 `full_attention`（CPT 后实现为 QSA）。这是 **Flash-Next 48 层** 的排法，不是「Qwen4 旗舰一定 48 层」。

GDN 这一侧：报告 §2.1.1 用头级衰减 $\alpha_t$ 与写入 $\beta_t$ 做 gated delta 更新（报告式 (1)–(11)）。它和 Kimi 把遗忘拆到通道对角的差别，见 [KDA](../../../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md)，本篇不重推。消融分母是 28 层 25B-A3B、先 400B@4K 再 80B@32K：Table 1 上 GDN hybrid 九项均值 53.81，优于全注意力 49.87 与窗口 128 的 SWA hybrid 51.15。SWA 在 MMLU、EvalPlus 上略高，所以 3:1 不是「线性层全面胜利」，是长程检索仍要留一层全局。

QSA 这一侧：DSA 的 indexer 仍是 token 级 $O(n^2)$。QSA 先把 indexer key 收成 $r$ 长的微块，块上打分再展开回 token。公式、块因果、两阶段蒸馏（约 2B + 200B token）全部在 [QSA 专文式 (12)–(20)](../../../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/08-QSA-Qwen稀疏注意力/08-QSA-Qwen稀疏注意力.md)。本篇只保留报告 Implementation 那组落地整数：$H=4$ 个 indexer 查询头、共享 1 个 key 头、$K=2048$、$r=4$，于是块预算 $K_B=\lceil K/r\rceil=512$。最后一个不完整块里的 token一律保留。

CPT 时序（报告 §2.1.2）：序列长 256K。Stage 1 只训 indexer，1000 step，lr $1\times 10^{-3}$，每步 8 条 256K，约 2B token。Stage 2 主干与 indexer 联合 8000 step，lr $2.5\times 10^{-5}$，每步 96 条 256K，约 200B token。Fig. 4：这一阶段与全注意力的 LM loss 差大约 $10^{-4}$。Table 2 短基准平均 75.9→76.8；Table 3 上 RULER 在 >512K 从 90.08 到 93.00。

MTP 也换 QSA。报告写骨干和 MTP 模块里的全注意力层都换成 QSA，并按 GLM-5 的做法在投机步之间复用 top-k。Table 4：四步投机下平均接受长度 4.06→4.07，没有实质变化。HF 卡片：MTP **1 layer, trained with multi-steps**；`config.json` 的 `mtp.num_hidden_layers: 1`、`mtp.hybrid: true`。4B 那一列仍然只来自卡片，不要从「1 层」反推成报告数字。

原生上下文：**262,144**（HF 卡片、`max_position_embeddings`、博文）。YaRN 扩到 **1,000,000** 写在博文与 HF 卡片；**报告 PDF 全文没有字符串 `YaRN` 或 `262144`**。长上下文外推以卡片/博文为准，不要说「报告规定了 1M」。

![一个宏块：三层 GDN+MoE，一层 QSA+MoE，外包 GR](images/fig-qwen4-gdn-qsa-stack.png)

> 图 2：48 层里的 1/12 个宏块。三层 GDN 压缩历史，一层 QSA 做稀疏全局检索；每层后面都是 MoE；四层外包 $n_r=4$ 的 GR。底注：CPT 后全局注意力换成 QSA，MTP 同样换。

**图 2 解析**

- 左括号「1 of 12」：HF 的 `12 × (3 GDN → 1 QSA)`。乘起来 36 层 GDN + 12 层 QSA = 48。
- 绿块 GDN：固定大小循环状态，decode 侧访存不跟 $n$ 线性涨。报告把 decode 瓶颈写成内存流量，所以 GDN 保固定状态、GR 丢掉 $H_{\mathrm{res}}$、残差态允许 FP8。
- 蓝块 QSA：只出现在宏块的第四层。不要把 48 层都画成稀疏注意力。
- 橙块 MoE：每一层都有专家 FFN，和注意力类型正交。专家池大小见下一节，和图上的「512 块」无关。
- 浅黄外包 GR：报告 Figure 1 的画法是每个子层都经 GR 读/写。$n_r=4$ 与 HF `hc_count: 4`、`hc_lowrank: 320` 对齐（瓶颈秩 320 $=2560/8$，与 GR 专文 $r=d/8$ 一致）。
- 底注 CPT / MTP：预训练早期全局层仍是全注意力；QSA 是续预训练才灌进去的。把「一上来就稀疏」写成 Qwen4 默认，是把 CPT 日程读丢了。

## 4. 512 块 $\neq$ 512 专家

这是本篇最容易写错的一行，所以单独成节。

**Indexer 块预算（QSA Implementation，报告 §2.1.2）：** $r=4$，$K=2048$，每条 query 最多 **512 个完整块**（$K_B=\lceil 2048/4\rceil$），再加上尾巴。HF 卡片把同一件事写成 Budget: **512 blocks or 2048 tokens**；`config.json` 是 `indexer_budget: 2048`、`indexer_compress_ratio: 4`。512 在这里是**块数**，不是专家数。

**专家池（报告正文没有公开整数 $n$、$K$）：** 报告只在 Muon 节提到 routed **and** shared experts 的 fc1/fc2 走 Muon，没有写专家总数、每 token 路由几个。整数出现在 **HF 卡片** 与 **HF `config.json`**，不是报告摘要：

| 字段 | 值 | 来源 |
|------|----|------|
| Number of Experts / `num_experts` | **512** | HF 卡片；`config.json` |
| Activated | **10 routed + 1 shared** | HF 卡片（`num_experts_per_tok: 10`；`shared_expert_intermediate_size: 640` 表明有共享专家，宽度与 routed 的 `moe_intermediate_size: 640` 相同） |
| Expert intermediate | 640 | HF 卡片 |

博文「其它架构优化」用文字描述同一设计：全局负载均衡下，固定激活专家数、加大专家池，loss 稳定下降，因此采用**大专家池 + 每 token 少量 routed + 一个共享专家**。博文仍然**没有**写出 512 和 10。13 文写「报告未找到公开整数」——本篇核对后维持这句话：**$n$、$K$ 的整数来自 HF 卡片（由 `config.json` 印证），不是报告表。** 并且这是 **Flash-Next 这一只**，不是「Qwen4 旗舰一定 512 专家」。

两个 512 撞在一起，是因为 $2048/4=512$ 恰好等于专家池大小。相乘除法相等不构成「专家数由 indexer 预算决定」。写 Qwen4 预测时，宁可各写一行来源，不要合成一个「512」。

HF 卡片其它只属于这只鸟的整数，供对照、不外推旗舰：隐藏维 2560；词表 248320（padded）；QSA 核心注意力 24 个 Q 头、2 个 KV 头、头维 256、RoPE 维 64；GDN 48 个 V 头、16 个 QK 头、头维 128。

## 5. GR、n-gram、Muon 怎么捆进这只鸟

**GR。** 报告 §2.2：残差流加宽到 $n_r=4$，读是逐元素、数据依赖的 sigmoid 门，写是每分支一个标量，**丢掉混合算子 $H_{\mathrm{res}}$**。公式与「为何丢掉」在 [GR 专文式 (29)–(34)](../../../../../2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md)。本篇只保留报告的设计句：一旦读和写够表达，再加 $n_r\times n_r$ 混合没有显著收益。探针（简化 AltUp）在 25B-A3B、400B token 上把 loss 降约 0.01，说明「变宽」本身值钱；完整 GR 的门是 $n_r\times d$，不要把探针的每分支标量读当成线上实现。推理侧：稀疏只读最高门控的两支，预训练几乎无伤、后训练明显变差，所以没采用——报告把这写成「只看预训练会做错决定」的例子。残差态 FP8 能减半访存，门把写入幅度卡住，低精度才匹配。

**n-gram / Engram 点名关系。** 报告 §2.3 引用 Google DeepMind 2025 与 **Cheng et al., 2026**（参考文献条目题目 *Conditional memory via scalable lookup…*，即 [arXiv:2601.07372](https://arxiv.org/abs/2601.07372)）。用 PyMuPDF 抽 28 页全文，**零次**出现字符串 `Engram`。阿里云博文则写 inspired by Gemma 3n Per-Layer Embedding **and works such as DeepSeek Engram**。哈希、多头、上下文门控的公式在 [2.4.8](../../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.8-条件记忆与Engram/01-Engram-从Ngram到可扩展查找/01-Engram-从Ngram到可扩展查找.md)，本篇不重推。报告还写：试了 Cheng 的 token normalization 等压缩，**没有稳定收益**——不要默认 Flash-Next 表用了 Engram 那套 $\mathcal{P}$。`config.json` 里的 `heads_per_ngram: 8`、`ple_conv_kernel_size: 4` 是这只检查点的实现字段，当作「旋钮在配置里」，不要在第 14 章展开哈希。

**Muon。** 报告 §3.1：Muon 打在「真正充当二维线性映射」的权重上——注意力 q/k/v 与输出、GDN 输入与输出、routed **和** shared 专家的 fc1/fc2、n-gram 层的 key/value 投影。留在 AdamW 上的：输入嵌入、输出头、MoE router、GR 的两个低秩投影。n-gram **表**走 Adam 且关掉 weight decay。Router 用 Muon 会放大训练早期波动；GR 低秩矩阵太瘦长，正交化不占优。融合存储的 QKV / SwiGLU fc1 / GDN 输入投影，先按独立线性算子拆开再 Newton–Schulz，否则奇异方向会在无关子块之间混合，$\gamma(A,B)$ 也会用错形状。NS 步数取 8，系数日程用 Polar Express；实现上用 Canzona 按正交化 FLOPs 重切 DP、跨 TP All-to-All 拼回完整矩阵，拆完的小 kernel 整步打进 CUDA graph。细节链 [6.5](../../../../../6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md)。

![Muon 打哪些矩阵、AdamW 留哪些](images/fig-qwen4-muon-adamw.png)

> 图 3：报告 §3.1 的参数分工。左栏 2D 线性走 Muon；右栏 Embedding / Router / GR 低秩 / 输出门走 AdamW；n-gram 表走无衰减 Adam。中间：融合矩阵先拆再正交化。

**图 3 解析**

- 左栏：能写成 $A\times B$ 矩阵、语义上是线性映射的，才进 Muon。专家的 fc1/fc2 包含共享专家，和「router 本身」不是同一组参数。
- 右栏 Router：每个输出维对应一个专家分数，维与维之间缺少共享的线性结构，正交化捞不到便宜。
- 右栏 GR：$W_d,W_u,W_w$ 是瘦长低秩，报告明确写 AdamW 更好。
- 中轴「先拆」：Megatron 把 QKV、SwiGLU 的 gate/up、GDN 输入融成一张大矩阵。对整张做 NS = 用错算子形状。GDN 的 decay / $\beta$ 投影是每头一个标量，正交化无意义，应排除。
- 不要把这张图读成「Qwen4 将全面废弃 AdamW」。官方配方是分工，不是替换。

超参：为新架构 + Muon 重拟合后，最优 batch 与 lr 上移。小模型 4T token 上，$B=25.2\mathrm{M}$ 优于旧配方 $12.6\mathrm{M}$（末 20B token 上 loss 差 $7.2\times 10^{-3}$）。从 6.3M 爬到 25.2M 的 warmup **不比一开始就用目标 batch 更好**，却多 **18.8%** 的 optimizer step（Fig. 8b）。生产 run 取消 warmup。压力测试（28 层 25B-A3B，恒定 lr 拉到最优的 2×/4×）：AdamW + 旧结构在 4× 上每 10k step 尖峰 183 次；Muon + GR 零次过 clip、零次 loss spike。全尺寸训练报告写：没有一次 loss spike，也没有靠 qk-clip / SwiGLU-clip。

## 6. 两套加速比，分母不是同一个

| 口径 | 数字 | 分子 / 分母 | 一手 |
|------|------|-------------|------|
| Kernel，1M 上下文 | Prefill **7.6×** / Decode **4.9×** | QSA 注意力模块（含 indexer）vs FlashInfer **paged GQA** | 报告 Fig. 6(c)(d) 与正文。Chunked prefill：最后 16K、BS=1；decode：BS=4、`next_n=4`（三个 MTP 步） |
| Indexer 自身，$r=4$ vs $r=1$ | Prefill **3.8×** / Decode **4.4×** | 压缩 indexer vs 不压缩 indexer | 报告 Fig. 6(a)(b)，同一页，不要和 7.6/4.9 混 |
| 服务吞吐，1M | Prefill **8.6×** | Flash-Next vs **Qwen3.7-Plus**；实验设定 **90% Prefix Cache 命中** | **博文**（阿里云镜像与官方知乎专栏同句）。报告 Fig. 6 **没有** 8.6 这个对照 |

7.6 / 4.9 是注意力 kernel 相对稠密 paged GQA。8.6 是整模型 Prefill 吞吐相对上一世代 Plus，还叠了前缀缓存命中。分子分母、是否含 MLP/MoE、是否含缓存，全部不同。写成「大约 8 倍」就是合成。

博文把 7.6× / 4.9× 和 8.6× 写在**同一段**里：先讲 QSA Attention Kernel 在 1M 上的 Prefill/Decode，紧接着讲 90% 前缀缓存命中时相对 3.7-Plus 的 Prefill 吞吐。读者很容易当成三次测量的同一分母。报告 Fig. 6 的箭头标的是 1M 处相对 GQA 的 kernel 延迟比；8.6 只出现在博文的 serving 句，PDF 全文检索不到「8.6× 相对 Plus」。预测 Qwen4 服务成本时，kernel 比告诉你稀疏注意力本身省多少；8.6× 告诉你在高缓存命中的代理工作负载里，相对旧旗舰整段 Prefill 能到哪——两句话都要留，但不要平均。

FlashQLA（报告 §2.1.1）：GDN 的 TileLang 融合核，相对 FLA Triton 前向 2–3×、反向约 2×。这是**训练**核，不是 Fig. 6 的推理核，也不能拿来解释 8.6×。仓库：https://github.com/QwenLM/FlashQLA 。SGLang / vLLM 示例上下文 262144 写在 README，那是开源权重的默认服务长度；云上 `qwen3.8-flash` 默认 1M 是 SKU 行为，不是另一套架构。

## 7. 报告怎么验收这只鸟（Tab. 11），以及其它沿用件

Table 11 是预训练 **Base** 对照，不是后训练 agent 表。Flash-Next-Base：125B / 6B 激活 / 另列 51B n-gram。对照 Qwen3.8-27B-Base（27B 全激活）与 Qwen3.7-Plus-Base（397B / 17B）。十四项里 Flash-Next 赢 8 项，其余最多落后 2.6 分（摘要）；激活约 1/3、token 约 1/3、训练 FLOPs 约 1/9。摘几行避免把整表再抄一遍：

| 基准 | Flash-Next-Base | 3.8-27B-Base | 3.7-Plus-Base |
|------|-----------------|--------------|---------------|
| MMLU-Pro | **73.23** | 68.60 | 70.90 |
| SuperGPQA | **51.36** | 44.86 | 48.42 |
| BBH | **90.87** | 89.56 | 89.41 |
| GSM8K | **93.29** | 93.18 | 92.95 |
| SWEBench-Pretrain | **50.99** | 41.66 | 49.24 |
| MMLU | 90.36 | 87.51 | **90.43** |
| MATH | 72.78 | 60.54 | **74.38** |
| MultiPL-E | 79.09 | 74.50 | **81.68** |

落后最大的一档落在 MultiPL-E（79.09 vs 81.68，差 2.59），与摘要「至多 2.6」对齐。51B 在表头单独成行，27B 与 Plus 是「–」。后训练评测（SWE-bench Pro、CoWorkBench 等）在 HF 卡片，口径与 Base 的 Tab. 11 不是同一张表，不要拼成「预训练已经打过 Opus」。

博文「其它架构优化」里还有三件沿用 Qwen3-Next、报告正文没有单独开节的设计，预测 Qwen4 时当作**仍可能在的默认件**，但不要补报告没有的超参：

1. **极致稀疏 MoE** + 全局负载均衡（Qiu et al., 2025a *Demons in the Detail*）。文字描述见博文；整数 $n$、$K$ 仍只在 HF 卡片。
2. **MTP 多步**，训练与推理一致，提高投机接受率；注意力换成 QSA（报告 Table 4 有接受长度，博文有动机）。
3. **稳定性套件**：零中心 RMSNorm 并对 norm 权重做 decay、注意力输出门、归一化 MoE router 初始化。报告 §3.3 用压力测试说明 GR 门提供 rescaling，全尺寸 run 不靠 qk-clip。

服务：开源权重走 Hugging Face / ModelScope；推理框架博文与 README 点名 SGLang、vLLM、TokenSpeed，示例上下文 262144。云上 API 名是 `qwen3.8-flash`，定价写在博文（约 $0.16 / $0.47 per M tokens），那是产品定价，不是架构数字。

## 8. 怎样把这篇预测写坏

| 写法 | 为什么失效 |
|------|------------|
| 把 51B 加进 6B，或把 180B 存盘叫激活 | 报告 / Tab. 11 / 博文反复把 n-gram 排除在每 token 矩阵乘之外 |
| 把 QSA 的 512 块写成 512 专家 | 一块是 $K_B$，一块是 HF 的 `num_experts`；报告根本没写专家整数 |
| 用二手媒体补 $n$、$K$ | 整数只接受 HF 卡片 / `config.json`；报告仍无 |
| 假装 Qwen4 已经发报告，或编发布日、旗舰层数 | 官方只承诺 Flash-Next 是早鸟；`qwen4_exp` 是检查点代码名 |
| 把 7.6× 与 8.6× 合成一个加速比 | 分母分别是 paged GQA kernel 与 3.7-Plus + 90% 前缀缓存 |
| 在本篇重推 QSA (12)–(20)、GR (29)–(34)、Engram 哈希 | 第 14 章只写捆法；公式在第 2 / 6 章 |
| 为云上 `qwen3.8-flash` 再开一章 | 那是产品名，不是另一套架构 |
| 说报告点名了字符串 Engram | PDF 无此词；点名的是 Cheng et al. 2026。Engram 三字在博文 |

细节仍以 [Flash-Next 架构精译](../../../../../_sources/model-reports/qwen/qwen3-8-flash-next/01-Qwen3.8-Flash-Next-架构精译.md) 为准。真有 Qwen4 出厂报告之前，这里不会改成规格书。

## 参考文献

1. Qwen Team. (2026-08-26). *On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability*. 技术报告 PDF：https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf （28 页）。
2. Qwen Team. README：https://github.com/QwenLM/Qwen3.8-Flash-Next
3. Qwen Team. 博文镜像：https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501 ；官方入口：https://qwen.ai/blog?id=qwen3.8-flash-next
4. Hugging Face 卡片：https://huggingface.co/Qwen/Qwen3.8-Flash-Next ；`config.json`：https://huggingface.co/Qwen/Qwen3.8-Flash-Next/raw/main/config.json
5. Cheng et al. (2026). *Conditional memory via scalable lookup…* [arXiv:2601.07372](https://arxiv.org/abs/2601.07372)（报告点名；公式在 2.4.8）。
6. 讲法参考（不当数字源）：https://zhuanlan.zhihu.com/p/2076052218705461635 （千问大模型专栏，与博文同构）；https://www.zhihu.com/question/2075957645354033219/answer/2076286824494928858 （512 块 vs 展开 2048 token 的拆法）。
