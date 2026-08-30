---
title: "09 · MOPD：多教师在线蒸馏"
date: 2026-08-30
tags: [MOPD, OPD, 多教师, On-Policy Distillation, DeepSeek-V4, Kimi K3, MiMo-V2-Flash]
as_of: 2026-08-30
category: LLM 指南
---

# 09 MOPD：多教师在线蒸馏

分域 RL 能把数学、代码、agent 各自推到峰值，交付却只要**一份**权重。多教师在线蒸馏做的事很窄：学生 $\pi_\theta$ **自己采样**，按题目找对应教师，用教师分布给学生稠密监督，把多份专家并进一个学生。本文是 [4.6 OPD](../4.6-OPD.md) 里「多教师合并」专文，记号沿用 [01-OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md) 的 reverse KL 与 on-policy 采样。**不是** 把三家合成一条「标准 MOPD」：DeepSeek-V4 报告仍叫 **OPD**（全词表 reverse KL）；Kimi K3 与 MiMo-V2-Flash 才用 **MOPD** 这个词，损失和裁剪也不一样。一手链接只记 inbox，正文链库内 mineru / 精译。

---

## 1. 具体问题：专家已经训好，合并会打回原形

2026 年几家开源报告走同一条流水线骨架：先 SFT 冷启动，再按域（有时再按 reasoning effort）各自做 RL，得到一排专家。剩下的问题不是「会不会 RL」，而是 **怎么并**：

1. **权重合并。** 省一次训练。MiMo-V2-Flash 报告点名它会和顺序训练一样做能力 trade-off。Xiaomi 另文《MOPD》（数字以该文 Table 2 为准，链接见 inbox）在 Qwen3-30B-A3B 上把线性平均的归一化分打到 **0.328**（Task Arithmetic 才回到 0.857）。这是权重空间融合，不是策略空间对齐。
2. **离线蒸馏 / 拿教师轨迹做 SFT。** 学生拟合的是教师写过的前缀。推理时它走自己的前缀——[01](../01-OPD基础原理/01-OPD基础原理.md) 里的暴露偏差。
3. **混合 RL / 级联 RL。** 多域奖励进同一条策略，或按域串着训。V4 写他们用 OPD **整段换掉** V3.2 的 mixed RL 合并；Xiaomi 另文把 Mix-RL、Cascade RL 当作对照，归一化分分别是 **0.882 / 0.775**，都低于他们的 MOPD **0.937**。

三家给出的合并手段，共同的只有半句：**轨迹从学生来（on-policy），监督从多个冻结教师来。** 损失怎么写、裁剪裁哪一项、一次前向看几个词表位置，必须分节读，不能共用一套超参。

![三列对照：V4 全词表 reverse KL、K3 clip 对数比、MiMo 训练-推理重要性采样加 ORM](./images/fig-mopd-three-forks.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Three columns: V4 full-vocab reverse KL; K3 3x3 experts plus clip log-ratio; MiMo sampling vs train engine importance sampling plus ORM. -->

> 图 1：三家损失分叉。不是论文某一张 Figure 的临摹；公式以各报告原文为准。2026-08 自绘。

**图 1 解析**

- **左 · V4 仍叫 OPD。** 目标是加权 reverse KL，比较的是**整段词表**分布。报告批评把 KL 收成单个已采样 token 的 advantage。
- **中 · K3 叫 MOPD。** 九个 RL 专家（三域 × 三档 effort）。逐 token 奖励是对 $\log(\pi_T/\pi_\theta)$ 做 $\mathrm{clip}$。他们试过更细的 top-$k$ 蒸馏，报告写没有明显好处。
- **右 · MiMo-V2-Flash 也叫 MOPD。** 采样在推理引擎 $\mu_\theta$，梯度在训练引擎 $\pi_\theta$；裁剪的是重要性比，不是 K3 的 $R_{\max}$。默认再叠一层 ORM / GRPO 的结果优势。

---

## 2. DeepSeek-V4：名字仍是 OPD，式 (29) 是全词表 reverse KL

一手：库内 [V4 mineru-en §5.1.2](../../../14-主流开源模型全景解析与技术报告精读/14.1-DeepSeek/10-DeepSeek-V4/03-DeepSeek-V4-mineru-en.md)。后训练骨架沿 V3.2，但 **mixed RL 合并阶段整段换成 OPD**（引 MiniLLM；Thinking Machines Lab 的 on-policy distillation）。专家先分域 SFT + GRPO，再蒸进一个学生。这一阶段用了 **十余个**覆盖多域的教师。

给定专家集合 $\{\pi_{E_1},\ldots,\pi_{E_N}\}$，报告式 (29)：

$$
\mathcal{L}_{\mathrm{OPD}}(\boldsymbol{\theta})=\sum_{i=1}^{N} w_i\cdot\mathrm{D}_{\mathrm{KL}}\bigl(\pi_{\boldsymbol{\theta}}\parallel\pi_{E_i}\bigr). \tag{1}
$$

$w_i$ 是各专家权重，报告只写「通常按相对重要性」。reverse KL 的期望要在学生 $\pi_\theta$ 自己的轨迹上算，才保持 on-policy。同一段还写：统一策略会按**当前任务语境**对齐相应专家（数学题对数学专家、代码题对代码专家）。式 (1) 在纸面上是对 $i$ 求和；实现上 $w_i$ 在无关域可以是 0。报告**没有**再给一套路由公式，本篇不补。

### 2.1 他们批评的先前做法：token 级 advantage

先前工作常把全词表 KL 收成每个位置只看**已采样那一个** token，并复用 RL 框架，把

$$
\mathrm{sg}\Biggl[\log\frac{\pi_{E_i}(y_t\mid x,y_{<t})}{\pi_{\theta}(y_t\mid x,y_{<t})}\Biggr] \tag{2}
$$

当作逐 token advantage（$\mathrm{sg}$ 是 stop-gradient）。报告承认这样省资源，但 **梯度方差高、训练不稳**。V4 因此改用 **full-vocabulary logit distillation**：每个位置保留完整 logit，再算 reverse KL。

注意：式 (2) 的形状和下一节 K3 式 (15)、MiMo 的 $\hat A_{\mathrm{MOPD},t}$ 看起来像一家人。V4 的立场是——**这正是他们拒绝当主损失的那条路**。不要把 K3 / MiMo 的 clip 版本回填进 V4，当成「V4 其实也是这么算、只是没写 clip」。

### 2.2 工程：缓存教师 hidden，按教师索引排 batch

词表规模超过十万时，把十余个教师的整表 logit 物化出来（哪怕落到盘上）报告认为不可行。§5.2.2 的做法：

- 教师权重卸到集中式分布式存储，教师前向按需加载，ZeRO 式参数分片。
- 前向只把教师**最后一层 hidden** 打进集中缓冲；训练时再过对应 LM head，当场重建满词表 logit。
- 数据分发时按**教师索引排序**样本：每个 distinct 教师头每个 mini-batch 只加载一次，设备上同一时刻最多驻留一个教师头。
- 精确 KL 用 TileLang kernel，减少动态显存分配。

![教师权重卸载；只缓存末层 hidden；按教师索引排序后一次只加载一个 head](./images/fig-v4-teacher-hidden-cache.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Teacher offload, hidden-state cache, reconstruct logits, sort mini-batch by teacher index. -->

> 图 2：V4 §5.2.2 全词表 OPD 的调度。格子数是示意。2026-08 自绘。

**图 2 解析**

- **不存 logit 存 $h$。** 瓶颈是词表大小乘教师数，不是「再写一份学生 KV」。
- **排序不是负载均衡算法。** 目的是让教师 head 在 GPU 上串行出现，避免十余个 head 同时驻留。
- **QAT / MXFP4 不在本篇。** 报告把它写在 §5.2.1，和 OPD 调度并列、不是 OPD 公式的一部分。训推量化与稳定性见 [6.1.7](../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md)。**不要**为 V4-Flash / Flash-Lite 另开后训练目录。

V4 §5.1.2 **没有**给出「蒸馏前学生 / 教师 / 蒸馏后学生」对照表。能力数字在系列评测里，不能当成 OPD 消融。

---

## 3. Kimi K3：九个 RL 专家，式 (15) 是 clip 过的对数比

一手：K3 报告 HTML §4.1.3（公式以 HTML 为准）；库内 [架构精译 §8](../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md) 只作导航。流水线三阶段：SFT 冷启动 → 分域分 effort 的 RL → **MOPD** 合成一份权重。

三个域、每域三档 reasoning effort $\{\mathrm{low},\mathrm{high},\mathrm{max}\}$，共 **九个**专家：

| 域 | 报告写进这一域的子任务 |
|----|------------------------|
| 通用 | 体验、视觉、推理、忠实性、搜索、知识工作 |
| 通用 agent | 长程助手、深度研究、段落级写作 |
| coding agent | SWE、编码体验、kernel、Web 开发 |

训练时给定域 $d$ 和采样到的 effort $e$，只用对应的那一个教师 $\pi_{\mathrm{teacher}}^{(d,e)}$。报告式 (15)：

$$
r^{d}_{\mathrm{opd}}(y_t\mid e,x,y_{<t})=\mathrm{clip}\Biggl(\mathrm{sg}\Biggl(\log\frac{\pi_{\mathrm{teacher}}^{(d,e)}(y_t\mid x,y_{<t})}{\pi_{\theta}(y_t\mid e,x,y_{<t})}\Biggr),-R_{\max},R_{\max}\Biggr). \tag{3}
$$

$\mathrm{sg}$ 仍是 stop-gradient。$R_{\max}>0$ 用来夹住极端 advantage，稳定 RL。分母里学生带了条件 $e$——effort 不只是选哪位教师，也进了 $\pi_\theta$ 的条件。这条奖励是**稠密、逐 token** 的，报告写它可以直接塞进现有 RL 框架，于是长程任务上的 **partial rollout**（一批 $NK$ 条轨迹，完成比例 $\lambda$ 就开优化，暂停的下轮优先续）对蒸馏同样适用。

![3×3 专家网格，一条轨迹只连向当前域和 effort 的教师，奖励做 clip](./images/fig-k3-nine-experts.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. 3x3 teacher grid, student rollout, clipped log-ratio reward. -->

> 图 3：K3 九专家与式 (15)。2026-08 自绘。

**图 3 解析**

- **不是**「九个教师对同一条 $y$ 加权求和」。域 $d$ 和 effort $e$ 先定教师，再算 $r_{\mathrm{opd}}$。
- **clip 夹的是标量奖励**，不是 V4 那种整表 KL，也不是下一节 MiMo 的 $\pi_\theta/\mu_\theta$ 重要性比。
- **top-$k$。** 报告原句：试过更细的 top-$k$ 蒸馏目标，在他们的设定里收敛速度和最终性能都**没有明显优势**。不要改写成「top-$k$ 已被证伪」——这是 K3 自己的消融句。

K3 报告 **没有** 一张与 MiMo Table 7 同构的「MOPD 前 / 教师 / MOPD 后」数字表。本篇不编。量化感知训练写在他们的 §4.1.4，同样不在本篇展开，见 [6.1.7](../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md)。

---

## 4. MiMo-V2-Flash：也叫 MOPD，裁剪的是训推比，不是 $R_{\max}$

一手：库内 [MiMo-V2-Flash mineru-en §4.1 与 §4.4](../../../14-主流开源模型全景解析与技术报告精读/14.9-MiMo/02-MiMo-V2-Flash/03-MiMo-V2-Flash-mineru-en.md)。**不要**用上一节的 $\mathrm{clip}(\cdot,-R_{\max},R_{\max})$ 去填 Flash 公式里没写的空。

§4.1 把后训练写成三阶段（报告 Figure 3）：(1) 通用 SFT；(2) 分域 RL / SFT 得到教师——agentic（搜索、代码、通用工具）与 non-agentic（数学、通用推理、安全）；(3) MOPD：学生从自己正在演化的分布采样，用教师 logits 的 KL 奖励做 token 级监督，并可与可验证的结果奖励并用。教师可以是 RL 专家、另一个 SFT、甚至学生自己。

§4.4 把蒸馏写成 on-policy RL。$\pi_\theta$ 是训练引擎里要更新的学生，$\mu_\theta$ 是推理引擎里的采样学生，$\pi_{\mathrm{domain}_x}$ 是 prompt $x$ 所属域的教师。报告式 (5)：

$$
\mathcal{L}_{\mathrm{reverse\text{-}KL}}(\theta)=-\mathbb{E}_{x\sim\mathcal{D},\,y_t\sim\pi_{\theta}(\cdot\mid x,y_{<t})}\log\frac{\pi_{\mathrm{domain}_x}(y_t\mid x,y_{<t})}{\pi_{\theta}(y_t\mid x,y_{<t})}. \tag{4}
$$

梯度（报告式 (6)）把对数比乘在 $\nabla_\theta\log\pi_\theta$ 前面，形状就是 REINFORCE，对数比充当 advantage。真正拿去优化的是 surrogate（报告式 (7)(8)）：轨迹改从 $\mu_\theta$ 采样，并跟 Zhao et al. (2025) 做训练–推理重要性采样，**差异过大的 token 丢掉**：

$$
\mathcal{L}_{\mathrm{MOPD}}(\theta)=-\mathbb{E}_{x\sim\mathcal{D},\,y\sim\mu_{\theta}(\cdot\mid x)}\Biggl[\frac{1}{|y|}\sum_{t=1}^{|y|} w_t\,\hat A_{\mathrm{MOPD},t}\,\log\pi_{\theta}(y_t\mid x,y_{<t})\Biggr], \tag{5}
$$

$$
w_t(\theta)=\begin{cases}
\mathrm{sg}\bigl[\pi_{\theta}(y_t\mid x,y_{<t})/\mu_{\theta}(y_t\mid x,y_{<t})\bigr], & \epsilon_{\mathrm{low}}\le \pi_{\theta}/\mu_{\theta}\le\epsilon_{\mathrm{high}},\\
0, & \text{otherwise},
\end{cases}
\qquad
\hat A_{\mathrm{MOPD},t}=\mathrm{sg}\Biggl[\log\frac{\pi_{\mathrm{domain}_x}(y_t\mid x,y_{<t})}{\pi_{\theta}(y_t\mid x,y_{<t})}\Biggr]. \tag{6}
$$

默认再把 ORM（含 GRPO）的结果优势加进去（报告式 (9)）：

$$
\hat A_{\mathrm{MOPD},t}=\mathrm{sg}\Biggl[\log\frac{\pi_{\mathrm{domain}_x}(y_t\mid x,y_{<t})}{\pi_{\theta}(y_t\mid x,y_{<t})}\Biggr]+\alpha\,\hat A_{\mathrm{ORM}}. \tag{7}
$$

$\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}},\alpha$ 报告没有给出数值。本篇不编。训推两套引擎为什么不是同一个分布，见 [6.1.7](../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md)。

![prompt 按域路由到一名教师；mu 采样、pi 算梯度；w_t 丢离群 token；优势可加 ORM](./images/fig-mimo-is-orm.png)

<!-- GenerateImage Prompt: LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels. white academic background, no watermark, no logo, no copyright text, no website URL. Domain-routed teacher, sampling vs train engine, importance-sampling gate, ORM added to token advantage. -->

> 图 4：Flash §4.4 数据流。对应报告式 (5)–(9)。2026-08 自绘。

**图 4 解析**

- **一名 prompt 一名教师。** $\pi_{\mathrm{domain}_x}$ 按下标就是「这个 $x$ 的域」。多教师是在混合域 batch 上分别打分、梯度累到同一份 $\theta$，不是 V4 纸面那种 $\sum_i w_i D_{\mathrm{KL}}$ 写进单条样本。
- **$w_t$ 的 clip 在重要性比。** 超出 $[\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}}]$ 的 token 权重为 0。这和 K3 夹 $r_{\mathrm{opd}}$ 不是同一道闸。图上若写成 $\pi_{\mathrm{domain}}/\mu$，以式 (6) 的 $\pi_\theta/\mu_\theta$ 为准。
- **$\hat A_{\mathrm{MOPD},t}$ 本身没有 $R_{\max}$。** Flash 正文没写对 advantage 再做一次对称 clip。

### 4.1 报告有数字的表：Table 7

数字抄 mineru Table 7（与 PDF 同行）。老师类型是报告标注的 RL / SFT / Self（学生自己）。

| Benchmark | MOPD 前学生 | 最强教师 | MOPD 后学生 | 学生减教师 |
|-----------|------------:|---------:|-----------:|----------:|
| AIME 2025 | 89.3 | 93.9 (RL) | 94.1 | +0.2 |
| HMMT Feb. 2025 | 76.9 | 82.6 (RL) | 84.4 | +1.8 |
| LiveCodeBench | 77.5 | 82.6 (RL) | 83.2 | +0.6 |
| MMLU-Pro | 84.7 | 84.7 (Self) | 84.9 | +0.2 |
| GPQA-Diamond | 84.9 | 84.9 (Self) | 84.3 | −0.6 |
| HLE (w/o Tool) | 21.2 | 21.2 (Self) | 22.1 | +0.9 |
| Arena-Hard (Hard Prompt) | 50.0 | 50.0 (Self) | 54.1 | +4.1 |
| Arena-Hard (Creative Writing) | 90.1 | 90.1 (Self) | 86.2 | −3.9 |
| SWE-Bench Verified | 67.8 | 74.2 (RL) | 73.4 | −0.8 |
| Tau2-Bench | 75.9 | 79.6 (RL) | 80.3 | +0.7 |
| Tau2-Bench (Telecom) | 92.7 | 95.0 (RL) | 95.3 | +0.3 |
| BrowseComp | 42.5 | 51.7 (SFT) | 45.4 | −6.3 |

怎么读：有强 RL 教师的可验证域（AIME / HMMT / LiveCodeBench / Tau2）学生贴上甚至略超教师；BrowseComp 相对 SFT 教师掉 **6.3**，创意写作掉 **3.9**，SWE-Verified 相对 RL 教师掉 **0.8**。报告主张「保住各域最强教师的峰值」——表上是大多数域接近，不是零损失。Figure 6 另有 ORM / MOPD without ORM / MOPD 三条训练曲线，本篇不手绘假坐标，数字以 mineru 抽出的 step 表为准。

### 4.2 同团队另文：不要和 Flash 正文合成一套超参

Xiaomi 另文《MOPD》（inbox 记链接）把范式写成因式论文，主实验在 **Qwen3-30B-A3B**，并声称同一范式用在 Flash。那里的公式分叉必须单列：

- **PG 实现**（该文式 (4)）对 $\hat A_{\mathrm{MOPD},t}$ 做对称 clip $[-A_{\max},+A_{\max}]$。形状像 K3 式 (15)，**不是** Flash §4.4 写出的那一版；不要把 $A_{\max}$ 和 $R_{\max}$ 合成一个超参。
- **Top-$k$ 实现**（该文式 (5)）在教师 top-$k$ 集合上算带偏置修正的 reverse KL；他们取 $k=64$，归一化分 **0.909 vs PG 的 0.937**，认为同起源教师下两者差不多。这和 K3「top-$k$ 没有明显好处」是两条独立消融，不要并成一句行业结论。
- 同起源教师：把数学教师换成更强但分布更远的 Qwen3-235B-A22B，初始逐 token KL 大约 **0.19 vs 0.04**，PG 会掉点、top-$k$ 在他们的图上大约第 18 步发散。Flash 正文没写这组替换实验。
- Qwen3-30B-A3B 能力合并（该文 Table 2，归一化分定义见该文 §4.1）：

| 方法 | AIME25 | AIME26 | IFBench | IFEval | SWE-bench Verified | Norm. |
|------|-------:|-------:|--------:|-------:|-------------------:|------:|
| Student (SFT-only) | 45.42 | 54.48 | 42.69 | 84.17 | 35.80 | 0.0000 |
| RL Teacher | 54.79 | 63.65 | 78.40 | 95.50 | 51.20 | 1.0000 |
| Mix-RL | 52.71 | 63.75 | 75.00 | 94.58 | 48.80 | 0.8818 |
| Cascade RL | 48.54 | 61.88 | 77.11 | 95.80 | 47.80 | 0.7752 |
| Off-Policy Finetune | 51.56 | 63.44 | 80.95 | 93.35 | 45.80 | 0.8241 |
| Param-Merge (Avg.) | 47.81 | 59.58 | 53.74 | 88.79 | 39.60 | 0.3280 |
| Param-Merge (Task Arith.) | 49.38 | 63.96 | 78.23 | 95.81 | 48.80 | 0.8574 |
| MOPD | 51.46 | 65.31 | 77.89 | 93.84 | 50.40 | 0.9373 |

Flash Table 7 与该文 Table 3 对 Flash 的列不完全同一套基准（该文 Table 3 写「全部教师为 RL」；Flash Table 7 含 Self / SFT 标签）。对 Flash 数字以 Table 7 为准。

---

## 5. 不是：单教师 OPD、特权上下文、rich feedback、跨阶段收尾

| 对象 | 差在哪 | 去哪篇 |
|------|--------|--------|
| MiniLLM / GKD 式单教师 on-policy | 一个 $\pi_T$，没有「按域派教师再并进一份权重」 | [01-OPD](../01-OPD基础原理/01-OPD基础原理.md) |
| OPSD 特权上下文 | 教师和学生**同一份权重**，差在输入里塞不塞标准答案 | [02-OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md) |
| SDPO rich feedback | 监督来自编译器/验证器的富反馈，不是多份冻结专家的 logits | [04-SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) |
| GLM-5 跨阶段 OPD | 顺序 RL 之后用蒸馏收尾，打的是遗忘/阶段切换，不是「十余或九个并行专家」这套捆法 | 对照见 [10-OPD-报告落地对照](../10-OPD-报告落地对照/10-OPD-报告落地对照.md) |

V4 / K3 / MiMo 引用的共同祖先仍是 MiniLLM 与 Thinking Machines 的 on-policy distillation：学生采样、教师打分、常用 reverse KL。本篇只把「教师从 1 变成一排、损失各家怎么裁」钉死。

---

## 6. 失效模式

| 现象 | 报告里是谁说的 | 说明 |
|------|----------------|------|
| token 级 $\mathrm{sg}[\log\pi_T/\pi_\theta]$ 当 advantage，方差大 | V4 §5.1.2 | V4 因此改全词表；K3 / MiMo Flash 仍走 token 级信号，另用 clip 或丢掉离群 token |
| 全词表 logit 物化爆内存 | V4 §5.2.2 | 不缓存 $h$、不按教师索引排序，十余教师乘超大词表会卡死 |
| 教师–学生不同源 | Xiaomi 另文 §4.4.2 | 更强但更远的外部教师，KL 抬大约 5×，优化可以塌甚至发散 |
| 复杂搜索 / 创意写作贴不住教师 | Flash Table 7 | BrowseComp −6.3、Creative Writing −3.9；不是「MOPD 万能无损合并」 |
| top-$k$ 更细未必更强 | K3 §4.1.3；Xiaomi 另文 $k=64$ | 两家各自写「没有明显好处 / 差不多」；不要合成一个 $k$ |
| 把三家超参抄进同一份配置 | 本篇 | $w_i$、$R_{\max}$、$(\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}},\alpha)$、$A_{\max}$、$k$ 从未在同一张表里出现过 |

下一篇：[10-OPD-报告落地对照](../10-OPD-报告落地对照/10-OPD-报告落地对照.md)（GLM-5 跨阶段等发布捆法）。QAT / 训推量化不在本篇，见 [6.1.7](../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md)。

---

## 本篇来源

1. DeepSeek-AI. (2026). DeepSeek-V4 技术报告。§5.1.2 式 (29)、§5.2.2 教师调度。库内：[03-DeepSeek-V4-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.1-DeepSeek/10-DeepSeek-V4/03-DeepSeek-V4-mineru-en.md)。
2. Moonshot AI. (2026). Kimi K3 技术报告。§4.1.3 式 (15)。公式以 HTML 为准。导航：[01-Kimi-K3-架构精译.md](../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md)。
3. Xiaomi LLM-Core. (2026). MiMo-V2-Flash 技术报告。§4.1、§4.4 式 (5)–(9)、Table 7。库内：[03-MiMo-V2-Flash-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.9-MiMo/02-MiMo-V2-Flash/03-MiMo-V2-Flash-mineru-en.md)。
4. Ma et al. (2026). 《MOPD》因式论文。Qwen3-30B-A3B Table 2；与 Flash 正文公式分列，不合并超参。链接只在 inbox。
5. MiniLLM；Agarwal et al. on-policy distillation / GKD；Lu and Thinking Machines Lab (2025) On-Policy Distillation——三家报告共同引用的单教师祖先，细节在 [01](../01-OPD基础原理/01-OPD基础原理.md)。

知乎只学讲法（「一个 prompt 派一名域教师，梯度在 batch 上合成」），数字与公式不以专栏为准。
