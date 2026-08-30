---
title: "01 · Kimi K3：2.8T 开源旗舰把序列、深度、宽度三条轴一起放大"
date: 2026-08-30
as_of: 2026-08-30
tags: [Kimi-K3, KDA, AttnRes, LatentMoE, SiTU-GLU, Quantile-Balancing, MoonEP]
---

# Kimi K3：不是再叠一层 MLA，是把三条信息流一起放大

> **[返回 14.5-Kimi](../14.5-Kimi.md)** · 前代：[K2](../02-Kimi-K2/05-Kimi-K2-Architecture-Overview.md) · [K2.5](../03-Kimi-K2.5/05-Kimi-K2.5-Architecture-Overview.md) · [K2.6](../04-Kimi-K2.6/05-Kimi-K2.6-Architecture-Overview.md) · 积木：[KDA](../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md) · [AttnRes](../../../2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md) · [Stable LatentMoE / QB](../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) · [SiTU-GLU](../../../2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md) · [Muon](../../../6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md)

报告标题 *Kimi K3: Open Frontier Intelligence*（[arXiv:2607.24653](https://arxiv.org/abs/2607.24653)）。权重 [moonshotai/Kimi-K3](https://huggingface.co/moonshotai/Kimi-K3)，仓库协议写 **Kimi K3 License**（不要写成 MIT）。官方把它叫「第一个开源的 3T 档」。本篇只拆这次发布捆了什么；公式本体在体系章。

**材料类型**：独立技术报告 HTML（本会话读了 §1–8、式 (1)–(17) 与后训练式 (15)(16)、Table 1–5、附录 B/C 开头与附录 E）。**不把 PDF OCR 进 git。** 评测柱高以 README / 报告表为准，不从图里估像素。

摘要口径：总参数 **2.8T**、激活 **104B**、原生视觉、上下文 **1M**。Table 1 更细：总参数 **2.78T**、激活 **104.2B**。后文规格表两边都标，禁止合成第三个数。

相对 K2 的总句：架构 + 数据 + 配方一起，在 **held-out OOD 验证**上拟合出大约 **$2.5\times$ 的 scaling efficiency**（Fig. 7）。这是「同样算力换成更低 loss」的曲线比，不是墙钟、不是电费。

闭源对照栏出现 Claude Fable 5、GPT-5.6 Sol。公开材料精读见 [Fable 5](../../14.13-Claude/19-Claude-Fable-5/01-Claude-Fable-5-公开材料精读.md) / [GPT-5.6 Sol](../../14.12-OpenAI/26-GPT-5.6-Sol/01-GPT-5.6-Sol-公开材料精读.md)。本篇只抄 K3 报告自己的对照分，不把对照分当成已读对方 system card。

## 1. 这一次捆了哪些技术

官方自己用三句话：沿 **序列** 做混合注意力，沿 **深度** 做 AttnRes，沿 **宽度** 做 Stable LatentMoE。

![序列 KDA/MLA、深度 AttnRes、宽度 LatentMoE 三条轴](./images/fig-kimi-k3-token-depth-width.png)

> 图 1：三条轴不要收成「又一个更大的 MoE」。左：块内 3 层 KDA + 1 层 Gated MLA。中：对历史 **块摘要** 做深度维注意力。右：共享专家走满宽，路由专家走 $\ell=d/2$ 的潜空间。英文拼写以正文为准。

| 面 | 这次用了什么 | 本体 |
|----|----------------|------|
| 积木 | 3 KDA : 1 Gated MLA；K3 把 KDA 的 log-decay 改成有下界的 sigmoid，输出门改满秩；AttnRes 用 Block 版 | KDA / AttnRes 专文 |
| 架构 | 93 层；69 KDA + 24 Gated MLA；末尾再垫一层全局 MLA；Stable LatentMoE 896 路由 / Top-16 / 2 共享；MoonViT-V2 401M 从头训 | 下文 Table 1 |
| 数据 | 文本四域 Web / Code / Math / Knowledge + 视觉（caption、图文交错、OCR、感知、视频、视觉编码）；长文用清洗 + 上采样 + 打散拼接 | §3.1；**配比百分数与总 token 未公开** |
| 优化器 | 矩阵参数 **Muon**；注意力投影改 **Per-Head Muon**；沿用 K2 的 weight-clip；路由用 Quantile Balancing 不是 aux-loss | 6.5；QB 在 MoE 专文 |
| Infra | FlashKDA；KDA Context Parallelism（KCP）；MoonEP 完美均衡 EP；激活 FP8+offload；1M agentic RL 的 partial rollout + 可恢复 sandbox | §5；MoonEP 链 6.1 |
| 稳定性 | 路由支路爆炸 → RMSNorm + SiTU-GLU；896 专家上 aux-loss-free 的 $\gamma$ 步长撑不住 → QB；视觉塔从 SigLIP 初始化改成从头 NTP | SiTU / LatentMoE 专文 |
| 训推 | 后训练全程 QAT：专家 **MXFP4 权重 / MXFP8 激活**，非专家更高精度；rollout 与训练同一套量化；MTP 层微调成 EAGLE-3 draft，目标是 LK 接受率而不是 KL | §4.1.4；图 2、图 3 |

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

这个宽度上的「先瘦再专家化」在 2.8T 上会炸：下行、门控 FFN、上行几乎是连续四次矩阵乘。Stable LatentMoE 的三件套——聚合后 RMSNorm、SiTU-GLU、Quantile Balancing——本体在 [10 文](../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。

## 6. 视觉：MoonViT-V2 从头做 next-token

和 K2.5 的关键差别：视觉塔 **不再从 SigLIP 初始化**。报告说接上预训练编码器之后梯度范数又高又尖；从零用 NTP 训的 MoonViT-V2 更稳，视觉评测不输基线。结构仍接近 K2.5：27 层、约 0.4B、RMSNorm、线性/注意力投影去 bias；图和视频共享参数，空间注意力 + 时间注意力再时间池化；投影前 $2\times 2$ pixel-shuffle，视觉 token 减到 1/4，从而 **$3584\times 3584$** 仍塞得进 1M 上下文。

## 7. 预训练：报告写了什么、没写什么（§3）

### 7.1 数据面：能点名的域，抄不到的配比

§3.1 只给分类，**不给整数百分数、不给总 token**。本篇不编。`[OM-FREEPLAY]` 若日后 model card 补表再填。

**文本四域**：Web Text、Code、Mathematics、Knowledge。每域走规则启发 + 分类质量分 + 去重；采样率「由小模型消融决定」——决定了，但数字没公开。知识和数学沿用 K2 的改写配方：风格/视角多样 prompting、分块自回归生成、相对源文档做保真校验。

**视觉**：沿 K2.5 分类法——caption、图文交错文档、OCR、感知、视频、视觉编码。开源集合 + 内部过滤/合成/去重。坐标监督同时给绝对坐标和归一化 $[0,1]$。在「图+说明」之外，这次明确加了大量 **程序性多模态**：代码片段和它的渲染结果成对出现，格式包括 SVG、3D 资产、网页、游戏、CAD 图。

**长上下文数据**（§3.4）：自然来源的长文/长视频里大量近重复、二进制块、截断文件、无效日志。清洗是精确+模糊去重，视频再加帧级感知哈希，外加启发式/分类器过滤和结构校验。真正又长又连贯的样本相对短文本稀缺，cooldown 里 **上采样**，避免被短序列淹没。长度本身不训练长程能力：他们再把多模态文档和子任务 **打散拼接**，让题只能靠跨满窗信息做出来，防止注意力退化成局部模式。

### 7.2 Scaling law：那句 $2.5\times$ 到底比的是什么

§3.2：架构、数据、配方一起改了最优训练区，所以重新搜 batch、lr、tokens-per-parameter、模型形状。评测面是 **held-out OOD 验证 loss**（Fig. 7），不是公开榜、不是墙钟。拟合结果写成相对 K2 大约 **$2.5\times$ scaling efficiency**。

学习率日程：各自独立搜最优超参之后，**余弦优于 WSD**（同一最小 lr）。报告强调的是两套日程的最优 peak lr 和 batch **差得很远**，共用超参会不公平地偏向其中一套。不要把这句话说成「WSD 永远更差」。

**没写**：总训练 token、峰值 lr、batch size、TPP 的最终取值。本篇不从图 7 估横轴。

### 7.3 配方与扩窗

- 原生多模态：语言和视觉从训练一开始就在同一个 NTP 目标里交错，不是先训完语言模型再对齐视觉塔。
- 优化器：Per-Head Muon + K2 的 weight-clip；MoE 负载用 QB。余弦学习率，**1% 线性 warmup**，全程 weight decay **0.1**。
- 长度四段（§3.3–3.4）：预训练 $8\mathrm{K}\to 64\mathrm{K}$；cooldown $256\mathrm{K}\to 1\mathrm{M}$。贵计算压在总预算的一小段。位置编码是 NoPE + KDA，扩窗不改位置参数。

## 8. 后训练：九个专家再蒸回一个模型（§4）

三阶段：SFT 冷启动 → 三个域 × 三档 reasoning effort $\{\mathrm{low},\mathrm{high},\mathrm{max}\}$ 共 **九个 RL 专家** → **Multi-Teacher On-Policy Distillation (MOPD)** 合成一个权重。域是 (i) 通用（含视觉、搜索、知识工作）(ii) 通用 agent (iii) coding agent。算法骨架跟 K2.5。

SFT 用前代 Kimi 域专家合成轨迹，再多级校验 + 人工标注；序列化走 **XTML** 聊天模板（附录 F：`[open]` / `[sep]` / `[close]` 当结构边界，避免尖括号分词歧义）。QAT **从 SFT 就开始**，不是 RL 才量化。

### 8.1 RL：partial rollout、effort 课程、Agentic GRM

长尾延迟用 **partial rollout**：每轮 $N$ 个 prompt × $K$ 条补全，完成比例 $\lambda$ 就开优化，暂停的下轮优先续（sandbox 见 §10）。一条超长轨迹会跨多轮，数据陈旧；策略更新靠 **逐 token 正则** 把步长关在局部邻域里，报告说这套算法本身能扛极端 off-policy。

Reasoning effort：每个题 $x$ 有一个从冷启动估的预算 $b_0(x)$。轨迹总预算 $T(y)$ 超过 $\tau\cdot b_0(x)$ 则任务奖励改成 $-1$。通用题的 $T$ 数思考 token；agent 题的 $T$ 是累计输出（推理痕迹 + 工具参数）。先训较大 $\tau$ 的 max，再把 $\tau$ 退火得到 high / low；$\tau$ 按域、人工调。三档轨迹事后一起进 SFT 和 MOPD。

非可验证任务用 Agentic GRM，强制四步：读产物 → 写 rubric → 打分 → 记分板。灌水用长度阈值：超过 $\sigma\cdot\ell_0$ 的候选在二元比较里直接输。

### 8.2 MOPD：按域、按 effort 换老师

给定域 $d$ 和抽到的 effort $e$，老师是九个专家里对应的 $\pi_{\mathrm{teacher}}^{(d,e)}$。逐 token OPD 奖励（报告式 (15)）是停梯度后的 log 比，再 clip 到 $\pm R_{\max}$：

$$
r^{d}_{\mathrm{opd}}(y_t\mid e,x,y_{<t})=\mathrm{clip}\Bigl(\mathrm{sg}\bigl(\log\frac{\pi_{\mathrm{teacher}}^{(d,e)}(y_t\mid x,y_{<t})}{\pi_{\theta}(y_t\mid e,x,y_{<t})}\bigr),-R_{\max},R_{\max}\Bigr).
$$

稠密奖励直接接进同一套 RL，所以长程任务仍能走 partial rollout。他们试过更细的 top-$k$ 蒸馏目标，**收敛和终绩都没有明显优势**——这是报告自己的负结果，不是本库猜测。

### 8.3 QAT：专家 MXFP4 / MXFP8，训推同一套

专家权重主导参数显存，所以只把 **路由专家** 压到 MXFP4 权重、MXFP8 激活；注意力投影、latent 投影、**共享专家**、路由器留更高精度。QAT 覆盖整个后训练（SFT + RL）。RL 的 rollout 与训练 **同一套量化**，用来消训推不一致——不是先 BF16 训完再离线量化。

![QAT：专家 MXFP4/MXFP8，非专家更高精度，rollout 与训练同方案](./images/fig-kimi-k3-qat-mxfp.png)

> 图 2：K3 后训练的量化切面（报告 §4.1.4）。左：路由专家 MXFP4 权重 / MXFP8 激活。中：非专家模块更高精度。右：QAT 从 SFT 贯穿 RL。底条是这句话的工程含义——rollout 和训练不是两套精度。

**图 2 解析**

- 量化对象是 **路由专家张量**，不是整网一刀切。共享专家和路由器仍走高精度，和「稀疏度 56」那句一起读：每层仍有满宽共享支路。
- MXFP4 / MXFP8 是训期就在的格式（QAT），HF 卡也写 `MXFP4 weights / MXFP8 activations (quantization-aware training)`。
- 底条双向箭头才是后训练设计：RL 采样轨迹的模型，和算梯度的模型，精度方案相同。缺这一条，接受率、工具调用、长程 rollout 都会在「训练看见的分布」和「上线看见的分布」之间裂开。
- 图里不画假的精度–分数曲线。量化对榜分数的影响，报告 **没有单独消融表**。

### 8.4 MTP → EAGLE-3：优化接受率，不是 KL

预训练 MTP 层结构像一块 backbone。EAGLE-3 的 draft 也是单层解码器，形状对得上，于是把 MTP **微调成 EAGLE-3 风格 draft**：目标模型冻结，只更新 draft 层和特征融合投影。训练时按 EAGLE-3 的 training-time test 展开 **七步**；第一步之后 draft 吃自己的输出，对齐推理时的循环起草。

融合 AttnRes **第 1、第 4、最后一块** 的特征（低 / 中 / 高），拼起来再乘无偏置矩阵 $\mathbf{W}_{\mathrm{E3}}$，初始化成 $[\,\mathbf{0}\;\;\mathbf{0}\;\;\mathbf{I}\,]$：一开始融合结果等于预训练 MTP 见过的高阶特征 $\bm{h}_h$，微调节段再慢慢把低、中阶加进来。

无损投机的每 token 接受率是 $\sum_x\min(p,q)$。容量有限的 draft 上，压 KL **不保证** 这个量最大，所以直接优化接受率的负对数（报告式 (16)）：

$$
\mathcal{L}_{\mathrm{LK}}=-\log\sum_{x\in\mathcal{V}}\min\bigl(p(x),q(x)\bigr),
$$

温度 1，**不加** 额外真值 CE。Draft 微调同样走 QAT：专家 MXFP4 / 激活 MXFP8。

![MTP 微调成 EAGLE-3 draft，损失是 LK 不是 KL](./images/fig-kimi-k3-mtp-eagle3.png)

> 图 3：投机解码这条线在 K3 里怎么接（报告 §4.1.4）。左：目标冻结，从 AttnRes 三块抽特征。中：$\mathbf{W}_{\mathrm{E3}}$ 初值让融合等于高阶特征。右：预训练 MTP 当 draft，展开 7 步。底：$\mathcal{L}_{\mathrm{LK}}$，划掉 KL / 额外 CE。

**图 3 解析**

- 三条水平箭头不是「再训一遍 backbone」，是从冻结目标抽三档块摘要。块号写死：1 / 4 / last，和 §4 的 8 块划分对应。
- $[0\;0\;I]$ 是初始化约束：微调起步点必须落在 MTP 预训练过的高阶特征上，否则 draft 和目标一开始就不在同一个表示里。
- 展开 7 步是训练协议，不是对外承诺「推理永远草稿 7 token」。报告没给线上接受率整数。
- 底栏的划掉是设计选择：目标函数直接对准无损投机的 $\sum\min(p,q)$。不要把「MTP 层」和「EAGLE-3 论文里的独立 draft 从头训」混成一件事——K3 是 **把已有 MTP 改造成 draft**。

### 8.5 环境：可组合 harness，不是单一工具 schema

训练时如果只绑一种 agent harness，模型会过拟合那一套工具 schema / 系统提示 / 上下文管理。§4.2.1 把 harness 拆成可配置模块（工具、提示、上下文策略、skill、memory、子 agent），配置出来可以是 Kimi Code、Claude Code、Codex、OpenClaw、Hermes，也可以是新组合。不同任务组动态换配置。

其余任务族本篇当「后训练面」点名，不写成产品手册：

| 面（报告小节） | 这次实际在训什么 |
|----------------|-------------------|
| 知识图谱合成 §4.2.2 | 自扩展 DAG；粗节点种子 → agent 搜网扩叶子；采样节点当关键词，检索真实材料再合成题 |
| 可验证 agent 题 §4.2.3 | 多步搜索、投行/数据分析/法律沙盒交付、带 Python 沙盒的视觉推理（裁剪/缩放/验算，观察含生成图） |
| Kernel §4.2.4 | 单算子到融合 mega-kernel；CUDA / Triton / CuTe / Gluon / ThunderKittens / TileLang；BF16/FP8/FP4。对不上数值误差阈值奖励为 0；对齐专家实现给 0.5，靠近 roofline 往 1 走。反作弊点名 CUDA graph 重放、输入缓存、降精度 |
| 个人助理 mock §4.2.5 | Gmail / Notion / Slack / Canvas 语义级 mock；跨多日、数十事件；单条 rollout 可到数千工具调用和百万上下文 |
| AET §4.2.6 | 只给目标、约束、验证接口，不给示范轨迹；奖励看最终环境状态。公开验证器给诊断、隐藏验证器看 held-out；提交次数有限 |
| Web Dev §4.2.7 | 从一句话到多段规格；站点 / 游戏 / WebGL / 可视化 / SVG / 全栈。构建失败、运行报错、假实现则奖励清零 |

## 9. Infra：会改变理解的几句（§5）

并行组合（§5.2）：PP+VP、EP、ZeRO-1 DP、Pipeline ZeRO-2 梯度分片、KCP。共享专家在 EP rank 上复制；专家 dispatch/combine 的 all-to-all 和计算重叠。

### 9.1 训练侧：FlashKDA、KCP、MoonEP

1. **FlashKDA**：分块核，块内并行和块间状态传播重叠；训练和 prefill 共用，挂在 flash-linear-attention 后端。单卡超长 prefill 还有一层 **设备内 CP**（按段算转移再合并），和跨卡 KCP 不是同一件事。
2. **KCP**：softmax 的 CP 要换随长度涨的 KV；KDA 的 delta 规则让「从零算的局部状态」不能直接加。每段交出累积转移 $\mathbf{M}$ 和从零生成的 $\widetilde{\mathbf{S}}$，all-gather 之后 prefix scan。式 (17) 在报告 §5.1.2，实现注记写 FLA PR #691。
3. **MoonEP**（https://github.com/MoonshotAI/MoonEP）：每个 rank 收恰好 $S\times K$ 个 token。冗余专家上界 $E/R$（附录 E 证明这个上界几乎紧：存在路由输出使得 $M=\lceil E(R-1)/R^2\rceil$）。通信缓冲从 DeepEP 最坏 $S\times K\times R$ 收到固定 $S\times K$。形状静态，所以不用每层 host 同步。在线规划用近最优 GPU kernel，精确 ILP 只离线当参照。这是 EP **负载形状** 的系统解，不是又一种路由公式。指针写在 [6.1](../../../6-训练与推理优化/6.1-训练基础设施/6.1-训练基础设施.md)。
4. **显存**：激活统一后端（重计算 / 量化 / offload 当存储策略）；K3 上多数激活 **块级 FP8 + offload**。MoE 反传改写掉对 `output` 的依赖（SonicMoE 思路）。Block AttnRes 的块表示在边界层算一次，后续层共享；PP 只增量传新块。1F1B 下激活不均，用 Mooncake Transfer Engine 把激活远程卸到别的 PP rank。Muon 正交化用 P2P 只取本 rank 拥有的参数分片，不做整缓冲 all-gather。
5. **视觉编码器**：大图按 patch 做 encoder 侧 CP（gather-KV）；ViT 前向/反向尽量塞进 PP bubble（K2.5 的 DEP 再拆一刀），报告写「大部分 ViT 开销被气泡吃掉」。

### 9.2 1M agentic RL 与 sandbox（§5.3）

共置 RL，把单次 1M 实验压在「几百张 GPU」量级（报告原句 *a few hundred GPUs*，没有更细的整数）。Partial rollout 降尾延迟。前缀 KV 未命中在 1M 上极贵，所以 GPU 上只留活跃 decode 块，可复用空闲前缀 **写回 CPU DRAM 外部池**（淘汰时才写，不是 write-through）；KDA 状态和对应 MLA 块一起卸/预取。训练迭代结束后把权重和优化器状态卸到 NVMe，给外部池腾 DRAM；rollout 结束再释放池。

调度用运行时信号（活跃/排队请求数、KV 占用）自动节流，避免按「全程平均长度」估并发。非策略模型（如 reference）权重放 CPU，前向时借用策略模型的 FP32 梯度缓冲当槽位，chunk 流水prefetch。

Sandbox：容器、GPU sandbox、以及 **AgentENV**（Firecracker microVM，https://github.com/kvcache-ai/AgentENV）。报告给了三个可抄整数：增量 checkpoint / resume 延迟低至 **133 ms / 49 ms**；等待模型推理时可 pause，报告称这能占 sandbox 寿命的 **98%**；真实负载内存超卖到 **6.5×**。全程统计：**51,219,741** 个 sandbox、**1,505,678** 套镜像。

### 9.3 Serving（§5.4）

官方点名 vLLM / SGLang / TokenSpeed。API 模型名 `kimi-k3`。思考默认开，`reasoning_effort` 为 `low` / `high` / `max`（默认 max）。多轮必须把 `reasoning_content` 原样回传（preserved thinking）。

混合缓存：KDA 固定状态和 MLA 按 token 增长的 KV 必须在 **同一边界** 一起恢复才叫前缀命中。两者塞进同一分页池。哈希粒度（例 **512** token）和物理块（**1024–6144**）解耦，否则短请求永远无法复用。KDA checkpoint 只打在 MLA 哈希端点的稀疏子集上，通常对齐对话轮边界。

Decode 侧 KDA 在 MTP 投机下不能给每个草稿位存一份状态快照；他们缓存投影后的输入，在片上重放已接受 token 的状态（与并发工作 ReplaySSM 同类）。Block AttnRes prefill 用序列并行让块表示只在一个 rank 物化；decode 把块间核丢到旁路流。LatentMoE：下行投影和 router 融成一次 GEMM；decode 走 token-centric WarpDecode 变体。

集群：会话钉在持有其前缀缓存的集群；一致性哈希给每个会话备一个 **不含缓存** 的次集群，故障时重 prefill，负载摊开。准入按请求类切预算，避免百万级突发饿死短请求。

## 10. 评测：只抄能指回 README / 报告表的格子（§6）

全部是 **max effort、temperature 1.0**（GPT-5.5 用 xhigh）。单步题 top-p 0.95，agentic 题 top-p 1.0。Fable 5 分含 fallback；GPT-5.6 Sol 分含 potential cyberguards。不要把 Fig. 1 柱高估成第三套数字。

### 10.1 公开对照（README §3 = 报告 Table 2）

| 基准 | K3 (max) | Fable 5 | GPT-5.6 Sol | Opus 4.8 | GPT-5.5 | GLM-5.2 | 必须一起读的脚注 |
|------|----------|---------|-------------|----------|---------|---------|------------------|
| GPQA Diamond | 93.5 | 92.6 | 94.1 | 91.0 | 93.5 | 91.2 | 单步 |
| CritPt | 23.4 | 28.6 | 32.3 | 20.9 | 27.1 | 20.9 | AA，截至 2026-07-23 |
| AA-LCR | 74.7 | 70.0 | 73.7 | 67.7 | 74.3 | 71.3 | 同上 |
| HLE-Full | 43.5 / 56.0 | 53.3 / 63.0 | 44.5 / 58.0 | 49.8 / 57.9 | 41.4 / 52.2 | — | 无工具 / 有工具 |
| DeepSWE | 67.5 | 70.0 | 73.0 | 59.0 | 67.0 | 46.2 | Kimi Code；官方榜 mini-SWE-agent 为 **67.3**；v1.1 题 |
| ProgramBench | 77.8 | 76.8 | 77.6 | 71.9 | 70.8 | 63.7 | Kimi Code |
| Terminal-Bench 2.1 | 88.3 | 88.0 | 88.8 | 84.6 | 83.4 | 82.7 | K3 用 Kimi Code；别人是跨 harness 最好成绩 |
| FrontierSWE | 81.2 | 86.6 | 71.3 | 66.7 | 64.9 | 67.3 | 截至 2026-07-16 用官方脚本重算 dominance |
| SWE-Marathon | 42.0 | 35.0 | 39.0 | 40.0 | 14.0 | 13.0 | H20 校准分支，早于 v1.1；K3/Opus/Fable 用 Claude Code。Fable 5 在此次评测 **35%** 题打到 fallback |
| PostTrainBench | 36.6 | 41.4 | 34.6 | 34.1 | 28.4 | 34.3 | K3/Fable/Sol 用 Harbor，H20 上三跑平均（官方设定是 H100） |
| MLS-Bench-Lite | 48.3 | 49.9 | 46.2 | 42.8 | 35.5 | 40.4 | |
| SciCode | 58.7 | 60.2 | 56.1 | 53.5 | 56.1 | 50.5 | AA，截至 2026-07-23 |
| Kimi Code Bench 2.0 | 72.9 | 76.9 | 64.8 | 71.7 | 69.0 | 64.2 | **内部榜**；Kimi Code harness。Claude Code 上 K3 为 **73.7**。80 题里 Fable 13 fallback+1 拒答；Sol 10 次进 cyber guard；GPT-5.5 3 拒答 |
| BrowseComp | 91.2 | 88.0 | 90.4 | 84.3 | 84.4 | — | 300K 触发压缩；满 1M、不做上下文管理是 **90.4** |
| DeepSearchQA (F1) | 95.0 | 94.2 | — | 93.1 | — | — | |
| ResearchRubrics | 76.2 | — | 73.8 | 73.5 | 64.0 | 71.1 | |
| GDPval-AA v2 Elo | 1686 | 1747 | 1736 | 1593 | 1491 | 1510 | AA，截至 2026-07-23 |
| Toolathlon-Verified | 76.5 | 77.9 | 74.9 | 76.2 | 73.5 | 59.9 | 官方榜，截至 2026-07-24 |
| MCPMark-Verified | 94.5 | 87.4 | 92.9 | 76.4 | 92.9 | — | |
| MCP-Atlas | 84.2 | 84.7 | 83.6 | 83.6 | 82.8 | 82.6 | 500 题公开子集、100 轮上限，Gemini 3.1 Pro 当裁判 |
| AutomationBench | 30.8 | 29.1 | 29.7 | 27.2 | 22.7 | 12.9 | 600 题公开子集 |
| JobBench | 54.3 | 57.4 | 45.4 | 48.4 | 38.3 | 43.4 | 官方榜，截至 2026-07-24 |
| AA-Briefcase Elo | 1548 | 1583 | 1495 | 1354 | 1158 | 1260 | AA，截至 2026-07-23 |
| Agents' Last Exam | 28.3 | 25.7† | 29.6 | 27.0 | 26.6 | 20.4 | 官方榜主 pass-rate。† Fable 条目是 xhigh，40% 题标成 downgraded |
| APEX-Agents | 41.0 | 43.3 | 39.9 | 39.4 | 38.5 | 35.6 | |
| OfficeQA Pro | 63.3 | 69.9 | 63.2 | 63.9 | 60.9 | 41.4 | 语料全是 PDF 渲染成图，无机器可读文本 |
| SpreadsheetBench 2 | 34.8 | 34.7 | 32.4 | 31.6 | 29.1 | 28.1 | |
| OSWorld-Verified | 84.8 | 85.0 | 83.0 | 83.4 | 79.0 | — | |
| OSWorld 2.0 | 58.3 | 66.1 | 62.6 | 55.7 | 49.5 | — | |
| SaaS-Bench | 60.1 | — | 61.4 | 56.1 | 43.8 | — | |
| τ³-Banking | 33.4 | 26.8 | 33.0 | 27.6 | 31.3 | 26.8 | AA |
| Harvey Lab-AA | 94.6 | 93.6 | 87.2 | 91.1 | 86.3 | 91.0 | criterion pass rate |
| CorpFin v2 | 71.6 | 71.8 | 64.4 | 66.7 | 68.4 | 66.1 | Vals AI |
| Finance Agent v2 | 54.4 | 56.3 | 53.8 | 53.9 | 51.8 | 49.7 | Vals AI |
| Legal Research Bench | 44.2 | 49.5 | 48.1 | 43.8 | 40.4 | 31.3 | Vals AI |
| WorldVQA ForceAnswer | 51.0 | 56.7 | 41.8 | 39.1 | 38.5 | — | 各模型都拒答，他们用 prompt 强制作答 |
| OmniDocBench | 91.1 | 89.8 | 85.8 | 87.9 | 89.4 | — | |
| PerceptionBench | 58.5 | 57.2 | 59.7 | 47.2 | 55.8 | — | **内部**原子视觉尺子 |
| Video-MME (w. sub) | 90.0 | — | 89.5 | 86.0 | 89.3 | — | 三跑平均 |
| MMVU | 82.1 | — | 81.2 | 79.2 | 81.7 | — | |
| BabyVision w/ python | 85.7 | 90.5 | 88.9 | 81.2 | 83.6 | — | |
| MMMU-Pro | 81.6 / 83.4 | 81.2 / 86.5 | 83.0 / 84.6 | 78.9 / 82.7 | 81.2 / 83.2 | — | 无工具 / Python |
| CharXiv (RQ) | 84.8 / 91.3 | 88.9 / 93.5 | 84.6 / 89.1 | 80.5 / 89.9 | 84.1 / 89.0 | — | 无工具 / Python |
| MathVision | 94.3 / 97.8 | 94.8 / 98.6 | 95.8 / 97.8 | 86.7 / 97.1 | 92.2 / 96.8 | — | 无工具 / Python |
| ZeroBench (pass@5) | 23.0 / 41.0 | 23.0 / 46.0 | 17.0 / 35.0 | 17.0 / 34.0 | 22.0 / 41.0 | — | 官方设定跑五次 |

报告自己的读法（§6.1.4）：整体紧跟 Fable 5 和 GPT-5.6 Sol，稳定高于 Opus 4.8、GPT-5.5、GLM-5.2。研究级推理仍落后（HLE-Full、CritPt）。编码上 ProgramBench 77.8 最高，SWE-Marathon 42.0 比 Fable 5 高 7 分（对方 35% fallback），Terminal-Bench 88.3 vs Sol 88.8，FrontierSWE 81.2 仅次于 Fable 86.6。Agent 多套第一，但 Elo 知识工作（GDPval、Briefcase）和更难的电脑使用（OSWorld 2.0、SaaS-Bench）仍由闭源领跑。

### 10.2 第三方头条（报告 Table 5，截至 2026-07-23）

| 榜 | K3 | Fable 5 | GPT-5.6 Sol | Opus 4.8 | GPT-5.5 | GLM-5.2 |
|----|----|---------|-------------|----------|---------|---------|
| AA Intelligence Index v4.1（#4/580） | 57.1 | 59.9 | 58.9 | 55.7 | 55.0 | 51.1 |
| Vals Index（#2/39） | 74.7 | 75.1 | 73.1 | 70.4 | 68.0 | 65.0 |
| WebDev Arena Elo（#1/99） | 1,678 | 1,634 | 1,630 | 1,565 | 1,507 | 1,592 |
| Text Arena Elo（#8/200） | 1,486 | 1,507 | 1,485 | 1,484 | 1,482 | 1,469 |
| Agent Arena（#4/37） | 9.1 | 12.7 | 10.1 | 9.8 | 8.8 | 6.5 |

Elo 会随后续对局漂。WebDev Arena 报告写成「第一个登顶该榜的开源模型」。

### 10.3 内部尺子与成本（Table 3 / §6.4）

Table 3 是他们自己的编码体验 / 通用 agent / 对话体验榜，**不要拿去和公开榜比绝对值**。报告正文点名的几格：Swarm Bench **76.3**、Deep Research Bench **90.0**（这两项领先）；Kimi Webdev Bench 相对 Opus 4.8 盲评 overall Win−Lose **+31.0**（3D/WebGL/Shader **+59.1**）。落后面：Agent Behavior、MIRA、24/7 ClawBench 2.0、Agentic Vision、KWV。

成本只抄报告写进正文的数，不读 Fig. 13 散点：

- Kimi Code Bench 2.0：比 Fable 5 低 **4.0** 分，成本是对方的 **38%**；high effort 已对齐 Opus 4.8 的 max 分，成本大约三分之一。
- BrowseComp：**91.2%**，每题 **2.03 美元**；约为 GPT-5.6 Sol（90.4%）成本的一半，比 Claude max 低一个数量级。
- GDPval-AA v2：距 Sol 50 Elo 以内，成本低 **13%**；比 Fable 5 便宜 $2.6\times$。
- AA-Briefcase：第二，成本大约是 Fable 5 的一半。

### 10.4 案例数字（§7，正文里的，不是图）

- AttnRes 延迟 **283.6 ms → 114.4 ms**；DSA / KDA 运行时分别降 **55.1% / 73.6%**（独立沙盒、每任务最多 24 小时）。
- MiniTriton（https://github.com/MoonshotAI/minitriton）：L20 上 tensor-core matmul 大约到实测机顶的 **90%**；相对 fp64 参考，全模型梯度差不超过 torch 自己的 fp32 舍入（$10^{-4}$）。
- 纳米模型推理芯片原型（https://github.com/MoonshotAI/nano-kpu）：Nangate45，分析面积预算 **4 mm²**，**100 MHz** 时序闭合，RTL 模拟 decode **>8,700 token/s**；**1.46M** 标准单元、**0.277 MiB** SRAM。

## 11. 局限、失效、报告自己承认的缺口

报告结论段很短：仍落后最强闭源（点名 Fable 5 与 GPT-5.6 Sol），但开源侧新前沿。真正的缺口要回 §6.1.4 / §6.2：

| 现象 | 报告怎么说 |
|------|------------|
| 研究级推理 | HLE-Full 无/有工具 43.5 / 56.0，CritPt 23.4，明确写成「仍是改进方向」 |
| 知识工作 Elo、电脑使用 | GDPval / Briefcase 不是第一；OSWorld 2.0、SaaS-Bench 由 Fable 或 Sol 领跑 |
| 内部过程质量 | Agent Behavior / MIRA / 7×24 助理 / agentic vision 落后 |
| 预训练数据 | 总 token、域配比、peak lr、batch **未公开** |
| QAT / 投机 | 没有量化 vs 全精度的榜上消融；没有线上 draft 接受率整数 |
| $2.5\times$ | 只在 held-out OOD 验证曲线上成立 |

网络安全评测（§6.2.2）是报告自己的能力声明，不是攻击教程：内部 exploit 套件 36 题 K3 **14/36（38.9%）** vs GLM-5.2 **8/36（22.2%）**；UK AISI 与 NIST CAISI 联合评估写 K3 在 ExploitBench **32% vs 24%**，41 题任意代码执行 **0/41**。报告把这当成能力下界，并写清相对人类专家仍有缺口。

读者侧失效（写进笔记里就要避开的读法）：

- 把 2.8T 和 Table 1 的 2.78T 合成「约 2.9T」。
- 把 $2.5\times$ 写成训练天数或电费。
- 用 Kimi Linear 的 unbounded Softplus 门冒充 K3 的 KDA。
- 把 AttnRes 写成 mHC，或把 LatentMoE 的 $\ell$ 维说成「又一种 MLA」。
- 为云上 API SKU、coding 微调档再开空文件夹。
- 把 Fable 5 / GPT-5.6 Sol 的对照分当成已读官方 system card。
- 把内部 KCB / PerceptionBench 当公开榜绝对值。
- 把 MTP 微调说成「另训了一个 EAGLE-3」，或把 $\mathcal{L}_{\mathrm{LK}}$ 说成 KL。

## 本篇来源

- Kimi Team. *Kimi K3: Open Frontier Intelligence*. https://arxiv.org/abs/2607.24653 · HTML https://arxiv.org/html/2607.24653 （§1–8、式 (1)–(17)(15)(16)、Table 1–5、附录 E）
- GitHub README 规格表与评测表：https://github.com/MoonshotAI/Kimi-K3
- 官方博文：https://www.kimi.com/blog/kimi-k3
- 权重：https://huggingface.co/moonshotai/Kimi-K3
- LatentMoE 前作：https://arxiv.org/abs/2601.18089
- KDA 前作：https://arxiv.org/abs/2510.26692
- AttnRes 前作：https://arxiv.org/abs/2603.15031
- MoonEP：https://github.com/MoonshotAI/MoonEP
- AgentENV：https://github.com/kvcache-ai/AgentENV
- MiniTriton / nano-kpu：https://github.com/MoonshotAI/minitriton · https://github.com/MoonshotAI/nano-kpu
