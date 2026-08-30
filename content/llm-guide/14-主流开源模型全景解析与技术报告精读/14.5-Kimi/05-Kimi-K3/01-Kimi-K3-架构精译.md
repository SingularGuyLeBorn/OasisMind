---
title: "01 · Kimi K3：2.8T 开源旗舰把序列、深度、宽度三条轴一起放大"
date: 2026-08-30
as_of: 2026-08-30
tags: [Kimi-K3, KDA, AttnRes, LatentMoE, SiTU-GLU, Quantile-Balancing, MoonEP]
---

# Kimi K3：不是再叠一层 MLA，是把三条信息流一起放大

> **[返回 14.5-Kimi](../14.5-Kimi.md)** · 前代：[K2](../02-Kimi-K2/05-Kimi-K2-Architecture-Overview.md) · [K2.5](../03-Kimi-K2.5/05-Kimi-K2.5-Architecture-Overview.md) · [K2.6](../04-Kimi-K2.6/05-Kimi-K2.6-Architecture-Overview.md) · 积木：[KDA](../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA.md) · [AttnRes](../../../2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md) · [Stable LatentMoE / QB](../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing.md) · [SiTU-GLU](../../../2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU.md) · [Muon](../../../6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md)

报告标题 *Kimi K3: Open Frontier Intelligence*（[arXiv:2607.24653](https://arxiv.org/abs/2607.24653)）。权重 [moonshotai/Kimi-K3](https://huggingface.co/moonshotai/Kimi-K3)，仓库协议写 **Kimi K3 License**（不要写成 MIT）。官方把它叫「第一个开源的 3T 档」。本篇只拆这次发布捆了什么；公式本体在体系章。

**材料类型**：独立技术报告 HTML（本会话读了 §1–5.2、式 (1)–(17)、Table 1、附录 B/C 开头；评测图柱高以 README 表为准，不从图里估像素）。**不把 PDF OCR 进 git。**

摘要口径：总参数 **2.8T**、激活 **104B**、原生视觉、上下文 **1M**。Table 1 更细：总参数 **2.78T**、激活 **104.2B**。后文规格表两边都标，禁止合成第三个数。

相对 K2 的总句：架构 + 数据 + 配方一起，在 held-out OOD 验证上拟合出大约 **$2.5\times$ 的 scaling efficiency**（Fig. 7）。这是「同样算力换成更低 loss」的曲线比，不是墙钟、不是电费。

## 1. 这一次捆了哪些技术

官方自己用三句话：沿 **序列** 做混合注意力，沿 **深度** 做 AttnRes，沿 **宽度** 做 Stable LatentMoE。

![序列 KDA/MLA、深度 AttnRes、宽度 LatentMoE 三条轴](./images/fig-kimi-k3-token-depth-width.png)

> 图 1：三条轴不要收成「又一个更大的 MoE」。左：块内 3 层 KDA + 1 层 Gated MLA。中：对历史 **块摘要** 做深度维注意力。右：共享专家走满宽，路由专家走 $\ell=d/2$ 的潜空间。英文拼写以正文为准。

<!-- GenerateImage prompt: Three axes of Kimi K3: sequence hybrid KDA/MLA, depth AttnRes over block summaries, width LatentMoE with shared full-width and routed latent experts. White academic background, no watermark, no logo, no copyright text, no stock-photo banner, no website URL. -->

| 面 | 这次用了什么 | 本体 |
|----|----------------|------|
| 积木 | 3 KDA : 1 Gated MLA；K3 把 KDA 的 log-decay 改成有下界的 sigmoid，输出门改满秩；AttnRes 用 Block 版 | KDA / AttnRes 专文 |
| 架构 | 93 层；69 KDA + 24 Gated MLA；末尾再垫一层全局 MLA；Stable LatentMoE 896 路由 / Top-16 / 2 共享；MoonViT-V2 401M 从头训 | 下文 Table 1 |
| 数据 | 文本四域 Web / Code / Math / Knowledge + 视觉（caption、图文交错、OCR、感知、视频、视觉编码）；长文用清洗 + 上采样 + 打散拼接 | §3.1；配比表未公开整数 |
| 优化器 | 矩阵参数 **Muon**；注意力投影改 **Per-Head Muon**；沿用 K2 的 weight-clip；路由用 Quantile Balancing 不是 aux-loss | 6.5；QB 在 MoE 专文 |
| Infra | FlashKDA；KDA Context Parallelism（KCP）；MoonEP 完美均衡 EP；激活 FP8+offload；1M agentic RL 的 partial rollout + 可恢复 sandbox | §5；MoonEP 链 6.1 |
| 稳定性 | 路由支路爆炸 → RMSNorm + SiTU-GLU；896 专家上 aux-loss-free 的 $\gamma$ 步长撑不住 → QB；视觉塔从 SigLIP 初始化改成从头 NTP | SiTU / LatentMoE 专文 |
| 训推 | 后训练全程 QAT：专家 **MXFP4 权重 / MXFP8 激活**，非专家更高精度；rollout 与训练同一套量化；MTP 层微调成 EAGLE-3 draft，目标是 LK 接受率而不是 KL | §4.1.4 |

## 2. 和 K2 差在哪（Table 1）

数字全部来自报告 Table 1。Hidden 仍是 7168，变的是深度、专家池、注意力种类、激活函数、上下文。

| | Kimi K2 | Kimi K3 |
|--|---------|---------|
| 层数 | 61 | **93**（↑52%） |
| 总参数 | 1.04T | **2.78T**（摘要/README 写 2.8T） |
| 激活 | 32.6B | **104.2B**（README 写 104B） |
| Hidden | 7,168 | 7,168 |
| Latent MoE 维 $\ell$ | — | **3,584（$0.5\times d$）** |
| 每专家中间维 | 2,048 | 3,072 |
| 路由专家 | 384 | **896** |
| 每 token 激活 | 8 | **16** |
| 共享专家 | 1 | **2** |
| 注意力头 | 64 | 96 |
| 稠密层 | 1 | 1 |
| 词表 | 160K | 160K |
| 训练上下文 | 128K | **1M** |
| 注意力 | 全 MLA | **Hybrid KDA–MLA** |
| 激活 | SwiGLU | **SiTU-GLU** |
| 层组成 | 61 MLA | **69 KDA + 24 MLA** |
| MTP | 1 层 | 1 层 |
| ViT | — | 401M / 27 层 / patch 14 / 12 头 |

稀疏度报告写成 **56**（$896/16$）。不要把它说成「只有 1/56 的 FFN 在算」——共享专家仍是满宽、每层都跑。

层数和 3:1 对得上：23 个「3 KDA + 1 MLA」块给出 69+23，**骨干末尾再加一层 Gated MLA** 凑成 24 层全局，合计 93。

## 3. 序列轴：KDA 在 K3 里改了两处，不是另起一套

块内仍是 Kimi Linear 的 **3 层 KDA + 1 层全局**。全局层这次叫 **Gated MLA**：MLA 的低维 KV 缓存还在，外面加了和 KDA 同构的满秩输出门

$$
\bm{y}_t=\mathbf{W}_o\bigl[\operatorname{Sigmoid}(\mathbf{W}_g\bm{x}_t)\odot\tilde{\bm{o}}_t\bigr].
$$

所有 MLA 层都是 **NoPE**。位置感交给 KDA 的衰减；扩到 1M 时不用改 RoPE base、也不走 YaRN。K2 / K2.5 的全 MLA+RoPE 线到这里断了。

KDA 状态更新仍是 *Kimi Linear* 的式 (1)（通道对角遗忘 + delta 擦写），**不要在本目录再推一遍**。K3 相对 2510.26692 只改了两处，写在 KDA 专文 §6：

1. **有下界的 log-decay**。Kimi Linear 用 $-e^{A}\mathrm{Softplus}(z)$，累积倒数会爆 BF16。K3 改成 $g=g_{\min}\operatorname{Sigmoid}(e^{A}z)$，$g_{\min}=-5$，于是 $\alpha>e^{-5}\approx 6.7\times 10^{-3}$，16 token 小块的累积 log-decay 落在 $(-80,0)$，对角块也能走 Tensor Core 稠密乘。
2. **满秩输出门**（式 (6)），不再用 Linear 里的低秩门。

Flash Attention 的偏置舍入（报告引 [98]）：训练时注意力输出留 **FP32**，kernel 用 KV staging 去扛加倍的 on-chip 输出块。

## 4. 深度轴：Block AttnRes，不是残差加宽

AttnRes 把「固定残差加法」换成对历史层的 softmax（伪查询 $\bm{w}_l$，key/value 是 embedding 和前层输出）。全量形式 $O(L^2 d)$ 算力在 $L<100$ 还能接受，真正贵的是 **把所有层输出留着** 的 $O(Ld)$ 显存和 PP 通信。

K3 用论文里的 **Block Attention Residuals**：层划成块，块内求和成一条摘要，块间做注意力。报告写经验上 $N\approx 8$ 就收回大部分收益；K3 的划法是 **8 个约 12 层的块，最后一块不满，加上 embedding 源一共 9 个可查询对象**。公式在 [AttnRes 专文](../../../2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md)，这里不抄 (8)–(10)。

这和 mHC/xHC/GR **不是一个旋钮**。AttnRes 改深度维聚合；超连接改残差流条数。

## 5. 宽度轴：为什么 896×16 还训练得动

常规 MoE 每个被选中的专家都吃满 $d$ 维，通信和专家权重流量跟 Top-$k$ 一起涨。LatentMoE（[arXiv:2601.18089](https://arxiv.org/abs/2601.18089)）把路由专家丢进 $\ell$ 维；K3 取 $\ell=d/2=3584$。共享专家仍走满宽，$N_s=2$。

这个宽度上的「先瘦再专家化」在 2.8T 上会炸：下行、门控 FFN、上行几乎是连续四次矩阵乘。Stable LatentMoE 的三件套——聚合后 RMSNorm、SiTU-GLU、Quantile Balancing——本体在 [10 文](../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing.md)。

## 6. 视觉：MoonViT-V2 从头做 next-token

和 K2.5 的关键差别：视觉塔 **不再从 SigLIP 初始化**。报告说接上预训练编码器之后梯度范数又高又尖；从零用 NTP 训的 MoonViT-V2 更稳，视觉评测不输基线。结构仍接近 K2.5：27 层、约 0.4B、RMSNorm、线性/注意力投影去 bias；图和视频共享参数，空间注意力 + 时间注意力再时间池化；投影前 $2\times 2$ pixel-shuffle，视觉 token 减到 1/4，从而 **$3584\times 3584$** 仍塞得进 1M 上下文。

## 7. 预训练配方（报告写了什么、没写什么）

- **优化器**：Per-Head Muon + K2 的 weight-clip；MoE 负载用 QB。余弦学习率，**1% 线性 warmup**，全程 weight decay **0.1**。
- **日程**：scaling-law 对照里，各自搜最优超参之后，**余弦优于 WSD**（同一最小 lr）。不要把这句话说成「WSD 永远更差」——报告强调的是超参不能共用。
- **长度**：预训练从 8K 拉到 64K；cooldown 再 256K → 1M。长序列的贵计算被压在总预算的一小段。
- **位置**：NoPE + KDA，扩窗不改位置编码参数。
- **没写**：总 token 数、各域配比百分数、峰值 lr、batch。本篇不编。

## 8. 后训练：九个专家再蒸回一个模型

三阶段：SFT 冷启动 → 三个域 × 三档 reasoning effort $\{\mathrm{low},\mathrm{high},\mathrm{max}\}$ 共 **九个 RL 专家** → **Multi-Teacher On-Policy Distillation (MOPD)** 合成一个权重。域是 (i) 通用（含视觉、搜索、知识工作）(ii) 通用 agent (iii) coding agent。算法骨架跟 K2.5；长尾用 **partial rollout**（一批 $NK$ 条轨迹，完成比例 $\lambda$ 就开优化，暂停的下轮优先续）。非可验证任务用 Agentic GRM，强制读产物 → 写 rubric → 打分 → 记分板，并用长度阈值打压灌水。

QAT 从 SFT 就开始：专家 MXFP4 / MXFP8，其余更高精度。RL 的 rollout 与训练 **同一套量化**，用来消训推不一致。

投机：预训练 MTP 层结构像一块 backbone，微调成 EAGLE-3 风格 draft（目标冻结）。融合 AttnRes 第 1、第 4、最后一块的特征；损失是接受率的负对数 $\mathcal{L}_{\mathrm{LK}}=-\log\sum_x\min(p,q)$，温度 1，**不加**额外真值 CE。

Agent 环境刻意做成 **可组合 harness**（Kimi Code / Claude Code / Codex / OpenClaw / Hermes 都能配出来），避免只过拟合一种工具 schema。其余任务族（知识图谱合成、kernel、个人助理 mock 应用、AET、Web Dev）本篇当「后训练面」点名，不展开成产品手册。

## 9. Infra 只记会改变理解的三句

1. **FlashKDA**：分块核，块内并行和块间状态传播重叠；训练和 prefill 共用，挂在 flash-linear-attention 后端。
2. **KCP**：softmax 的 CP 要换随长度涨的 KV；KDA 的 delta 规则让「从零算的局部状态」不能直接加。每段交出累积转移 $\mathbf{M}$ 和从零生成的 $\widetilde{\mathbf{S}}$，all-gather 之后 prefix scan。式 (17) 在报告 §5.1.2，实现注记写 FLA PR #691。
3. **MoonEP**（https://github.com/MoonshotAI/MoonEP）：每个 rank 收恰好 $S\times K$ 个 token，冗余专家上界 $E/R$，通信缓冲从 $S\times K\times R$ 收到 $S\times K$，形状静态所以不用每层 host 同步。这是 EP 负载问题的系统解，不是又一种路由公式。指针写在 [6.1 修订](../../../6-训练与推理优化/6.1-训练基础设施/6.1-训练基础设施.md)。

Serving：官方点名 vLLM / SGLang / TokenSpeed。API 模型名 `kimi-k3`。思考默认开，`reasoning_effort` 为 `low` / `high` / `max`（默认 max）。多轮必须把 `reasoning_content` 原样回传（preserved thinking）。

## 10. 评测：只抄能指回 README 的格子

全部是 **max effort、temperature 1.0**。单步题 top-p 0.95，agentic 题 top-p 1.0。对照栏出现 Claude Fable 5、GPT-5.6 Sol——这是 **K3 报告自己的闭源对照名**；本库尚未打开对应官方页，**不建目录、不把它们写进第 1.3 时间线当已核实产品**。

| 基准 | K3 (max) | 必须一起读的脚注 |
|------|----------|------------------|
| GPQA Diamond | 93.5 | 单步设定 |
| DeepSWE | 67.5 | Kimi Code harness；同一套官方榜上 mini-SWE-agent 为 67.3 |
| Terminal-Bench 2.1 | 88.3 | 自家 harness；别人的分数是跨 harness 最好成绩 |
| SWE-Marathon | 42.0 | H20 校准分支，早于 v1.1；Claude Code harness |
| BrowseComp | 91.2 | 300K 触发压缩；满 1M、不做上下文管理是 **90.4** |
| GDPval-AA v2 Elo | 1686 | Artificial Analysis，截至 2026-07-23 |

不要把 Fig. 1 柱高估成第三套数字。内部基准（Kimi Code Bench 2.0、PerceptionBench）当「他们自己的尺子」，不拿去和公开榜直接比绝对值。

## 11. 失效条件

- 把 2.8T 和 Table 1 的 2.78T 合成「约 2.9T」。
- 把 $2.5\times$ 写成训练天数或电费。
- 用 Kimi Linear 的 unbounded Softplus 门冒充 K3 的 KDA。
- 把 AttnRes 写成 mHC，或把 LatentMoE 的 $\ell$ 维说成「又一种 MLA」。
- 为云上 API SKU、coding 微调档再开空文件夹。
- 把 Fable 5 / GPT-5.6 Sol 的对照分当成已读官方 system card。

## 本篇来源

- Kimi Team. *Kimi K3: Open Frontier Intelligence*. https://arxiv.org/html/2607.24653 （§1–5.2、式 (1)–(17)、Table 1、附录 B 式 (18)–(19)、附录 C 开头）
- GitHub README 规格表与评测表：https://github.com/MoonshotAI/Kimi-K3
- 官方博文：https://www.kimi.com/blog/kimi-k3
- 权重：https://huggingface.co/moonshotai/Kimi-K3
- LatentMoE 前作：https://arxiv.org/abs/2601.18089
- KDA 前作：https://arxiv.org/abs/2510.26692
- AttnRes 前作：https://arxiv.org/abs/2603.15031
- MoonEP：https://github.com/MoonshotAI/MoonEP
