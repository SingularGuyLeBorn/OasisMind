---
title: "10 · OPD：报告落地对照"
date: 2026-08-30
tags: [OPD, MOPD, On-Policy Distillation, Qwen3, DeepSeek-V4, Kimi-K3, GLM-5]
as_of: 2026-08-30
category: LLM 指南
---

# 10 OPD：报告落地对照

报告里的 on-policy distillation 不是同一道工序。Qwen3 用大号教师压小号学生；V4 用十几个领域专家合进一个权重，损失写全词表 reverse KL；K3 / MiMo-V2-Flash 把合版叫 **MOPD**，损失仍是逐 token 的 $\mathrm{sg}[\log\pi_T/\pi_\theta]$；GLM-5 的教师是自己流水线的旧 checkpoint。本篇是对照表 + 机制分叉，**不是**再推一遍 MiniLLM。记号沿用 [01-OPD基础原理](../01-OPD基础原理/01-OPD基础原理.md) 的 $\pi_\theta$、$\pi_T$；公式只写各报告自己写下的那一行。第 14 章 mineru / D2 **只链不改、不整段复制**。

---

## 1. 具体问题：同一个英文名，卡在三个不同槽里

[01](../01-OPD基础原理/01-OPD基础原理.md) 把 OPD 立成 Reverse KL + 学生自己采样。学术起点是 Gu et al. MiniLLM 与 GKD，厂商报告也引用它们。本篇不重推。落地之后名字开始打架：

- [4.6 节首页](../4.6-OPD.md) 把 OPD 写成 Online Preference/Policy Distillation，又「泛指」Online Self-Distillation。报告里的官方名是 **On-Policy Distillation**（同策略蒸馏）。自蒸馏是另一条线，见 [02-OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md)。
- 01 把 17,920 / 1,800 GPU hours、AIME 67.6→74.4 指回了 Qwen3 报告，但漏了分母：**Qwen3-8B、同一份 off-policy 蒸馏检查点、只做 math+code、括号里是 pass@64**。
- [5.2 的 V4 解读](../../../5-主流模型全解/5.2-国内大模型/DeepSeek深度求索/27-DeepSeek-V4技术解读.md) §5.5 把 1,800 写成 V4 四阶段合计，再拿 17,920 做分母宣称「V4 只要传统 RL 的 1/10」。**那两个格子是 Qwen3 Table 21 的，不要安到 V4。** 本篇只点名，不改那篇第 5 章文件。

要回答的问题因此很窄：每家官方叫什么、教师从哪来、损失写到词表还是采样 token、数字的分母是什么、第 14 章从哪进。

![三列教师来源：Qwen3 大号教师压 8B；V4/K3/MiMo 多专家合版；GLM-5 用前阶段 checkpoint](./images/fig-opd-teacher-source.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Three columns: Qwen3 strong-to-weak; V4/K3/MiMo expert merge; GLM-5 previous-stage checkpoints. -->

> 图 1：教师从哪来。同一句 on-policy distillation，槽位不同。2026-08 自绘。

**图 1 解析**

- **左**：Qwen3 Strong-to-Weak 第二阶段。教师是同系列更大的指令模型（32B 或 235B-A22B），学生是轻量档。
- **中**：V4 / K3 / MiMo 把领域 RL 专家合进**旗舰统一学生**（图上不要读成 8B）。教师和学生可以同尺寸，目标是合版而不是压尺寸。
- **右**：GLM-5 的教师是 **同一条流水线更早阶段的最终 checkpoint**，学生是后一阶段的同一模型，用来把顺序 RL 冲掉的技能捞回来。

---

## 2. 对照表：每一家一行

数字只抄官方表的同行。空格表示报告没给、或本波不升格。

| 报告 | 官方叫什么 | 教师从哪来 | 损失形态 | 数字分母 | 第 14 章入口 |
|------|------------|------------|----------|----------|----------------|
| Qwen3 | On-policy Distillation（Strong-to-Weak 第二阶段；Table 21 **不写** OPD 缩写） | Qwen3-32B 或 Qwen3-235B-A22B。第一阶段先 off-policy：把教师 `/think` 与 `/no think` 输出拼起来做 response 蒸馏 | 学生自己生成 `/think` 或 `/no think` 序列，再把 student logits 对齐 teacher logits，最小化 KL。**报告未写正反向** | Table 21：Qwen3-**8B**、**同一** off-policy 蒸馏检查点、**只** math+code；GPU hours **17,920 vs 1,800**；括号 = pass@64 | [03-Qwen3-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/09-Qwen3/03-Qwen3-mineru-en.md) §4.5 / Table 21 |
| DeepSeek-V4 | multi-teacher **OPD**（混合 RL **整段换成** OPD 合版） | 各域先 SFT 再 GRPO，**十余个**领域教师 | 式 (29)：$\sum_i w_i\,\mathrm{D}_{\mathrm{KL}}(\pi_\theta\parallel\pi_{E_i})$，轨迹从学生采样。明确改用 **全词表 logit** reverse KL，反对把 KL 收成 token 级 $\mathrm{sg}[\log\pi_E/\pi_\theta]$ 当 advantage | **没有** 17,920 / 1,800。不要用 Qwen3 Table 21 给 V4 算 1/10 | [03-DeepSeek-V4-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.1-DeepSeek/10-DeepSeek-V4/03-DeepSeek-V4-mineru-en.md) §5.1.2 |
| Kimi K3 | **MOPD**（Multi-Teacher On-Policy Distillation） | 三域 × 三档 reasoning effort $\{\mathrm{low},\mathrm{high},\mathrm{max}\}$ = **九个** RL 专家 | 式 (15)：逐 token 奖励 $\mathrm{clip}(\mathrm{sg}(\log\pi_{\mathrm{teacher}}^{(d,e)}/\pi_\theta),-R_{\max},R_{\max})$。试过更细的 top-$k$ 蒸馏，报告写没有明显好处 | 无 Table 21 那种 GPU 小时对照。不要把九个专家合成 V4 的「十余个」超参 | [01-Kimi-K3-架构精译.md](../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md) §8；一手 [arXiv:2607.24653](https://arxiv.org/html/2607.24653) §4.1.3 |
| MiMo-V2-Flash | **MOPD**（三阶段**范式名**：SFT → 领域 RL/SFT 教师 → 合版） | 搜索 / 代码 / 数学 / 推理 / 安全等域教师；报告写也可以是另一个 SFT，或**学生自己** | 式 (5)–(9)：reverse KL 先写成采样 token 上的 log 比，再当 on-policy RL surrogate；默认可加 ORM/GRPO 优势 $\alpha\hat A_{\mathrm{ORM}}$ | Table 7：MOPD 前后 vs 最强教师（如 AIME 2025 89.3→94.1），**不是** GPU hours | [03-MiMo-V2-Flash-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.9-MiMo/02-MiMo-V2-Flash/03-MiMo-V2-Flash-mineru-en.md) §4.1 / §4.4 |
| GLM-5 | **on-policy cross-stage distillation** | 前面 SFT / Reasoning RL / General RL 的**最终 checkpoint**；prompt 从相应教师的 RL 训练集按比例混合 | 把 GRPO 式 (1) 的优势换成 $\mathrm{sg}[\log(\pi_{\theta_{\mathrm{teacher}}}^{\mathrm{infer}}/\pi_\theta^{\mathrm{train}})]$。组大小 **1**，batch **1024** | 组大小 1 是因为优势不再靠组内相对奖励。不是 17,920 | [01-GLM-5技术报告精译.md](../../../14-主流开源模型全景解析与技术报告精读/14.6-GLM/08-GLM-5/01-GLM-5技术报告精译.md) §3.5 |
| Step-3.5-Flash | “variants of on-policy distillation” | Limitations 里一句：要统一通才与领域专长 | **没有公式**。本篇不发明 | 无 | [03-Step-3.5-Flash-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.7-StepFun/03-Step-3.5-Flash/03-Step-3.5-Flash-mineru-en.md) Limitations |
| G-OPD / SCOPE | — | **本波不展开**（未核一手，不升格） | — | 不要用第 5 章那套 300 / 800 / 200 GPU 小时故事 | — |

V4 §5.2.1 的 QAT / MXFP4、K3 §4.1.4 的专家 MXFP4 写在后训练邻节，**不是** OPD 目标。量化与训推不一致见 [6.1.7](../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md)。禁止为 V4-Flash 另开目录。

---

## 3. 机制分叉：全词表 reverse KL，还是采样 token 上的 log 比

V4 式 (29) 把多教师写成加权 reverse KL，轨迹必须从学生 $\pi_\theta$ 采，否则就不是 on-policy：

$$
\mathcal{L}_{\mathrm{OPD}}(\boldsymbol{\theta})=\sum_{i=1}^{N} w_i\cdot\mathrm{D}_{\mathrm{KL}}\bigl(\pi_{\boldsymbol{\theta}}\parallel\pi_{E_i}\bigr). \tag{1}
$$

紧接着 V4 点名「先前工作」怎么偷懒：把全词表 KL 收成 **已经采样的那个** $y_t$ 上的

$$
\mathrm{sg}\Bigl[\log\frac{\pi_{E_i}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid x,y_{<t})}\Bigr], \tag{2}
$$

塞进 RL 的 per-token advantage。V4 写这条路方差大、训练不稳，所以改用全词表 logit 蒸馏。工程上他们缓存教师最后一层 hidden，训练时再过 lm_head 现场还原 logits，避免 $|V|>10^5$ 的显存爆炸（§5.2.2）。那是基础设施，不是另一套损失。

K3 式 (15) 走的就是 V4 说的那条「先前」路，只是加了 clip，并且官方把合版改名为 MOPD：

$$
r^{d}_{\mathrm{opd}}(y_t\mid e,x,y_{<t})=\mathrm{clip}\Bigl(\mathrm{sg}\Bigl(\log\frac{\pi_{\mathrm{teacher}}^{(d,e)}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid e,x,y_{<t})}\Bigr),-R_{\max},R_{\max}\Bigr). \tag{3}
$$

域 $d$、effort $e$ 选出九个专家之一。报告仍把这个标量叫 **OPD reward**。试过 top-$k$ 蒸馏，没有明显好处——不要把 V4 的全词表说成 K3 也做了。

MiMo-V2-Flash 同样把合版叫 MOPD，但伞更大：SFT 和领域 RL 都算进「MOPD 范式」。式 (7)–(9) 把式 (2) 那类 log 比写成 $\hat A_{\mathrm{MOPD},t}$，再乘训练–推理重要性权重 $w_t$，默认可加 ORM。Table 7 的格子是「学生蒸馏前 / 最强教师 / 蒸馏后」，例如 AIME 2025：89.3 → 教师 93.9 (RL) → 学生 94.1。那不是 GPU 小时。

GLM-5 把同一类 log 比塞回 GRPO。推理 RL 时组大小 32；cross-stage 阶段组大小改成 **1**，因为优势不再从组内相对奖励估，而从师生 log 比来：

$$
\hat A_{i,t}=\mathrm{sg}\Bigl[\log\frac{\pi_{\theta_{\mathrm{teacher}}}^{\mathrm{infer}}(y_{i,t}\mid x,y_{i,<t})}{\pi_\theta^{\mathrm{train}}(y_{i,t}\mid x,y_{i,<t})}\Bigr]. \tag{4}
$$

教师 logits 目前走推理引擎。这是 **跨阶段恢复**，不是领域专家合版。

![左：每步对整张词表做 reverse KL；右：只在采样 token 上写 sg log 比](./images/fig-opd-loss-fork.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Left: full-vocab reverse KL. Right: token-level sg log ratio with clip. -->

> 图 2：损失分叉。左是 V4 §5.1.2；右是 K3 式 (15) / MiMo 式 (8) / GLM-5 式 (2) 这一族。2026-08 自绘。

**图 2 解析**

- **左**：每个位置都要对教师整张 next-token 分布算 reverse KL。梯度更稳，词表一开就贵。V4 认为合版该走这条。
- **右**：只在学生已经吐出的 $y_t$ 上算 $\log\pi_T/\pi_\theta$，当奖励或优势，省显存、好塞进现成 RL 栈。K3 加 clip；MiMo 加 $w_t$ 与 ORM；GLM-5 把组大小打到 1。
- **不要合成一套超参。** $R_{\max}$、$\alpha$、组大小 1、十余个教师、九个专家，都是各报告自己的格子。

Step-3.5-Flash 只写正在推进 variants of on-policy distillation。**到此为止。**

---

## 4. Qwen3 Table 21：1/10 GPU hours 的分母钉死在 8B

Qwen3 对轻量档走 Strong-to-Weak：先 off-policy 打底，再 on-policy 对齐 logits。Table 21 的比较更窄——**同一份** off-policy 蒸馏过的 **8B** 检查点出发，只看 math+code，一边加 RL，一边做 on-policy distillation：

| Method | AIME'24 | AIME'25 | MATH500 | LiveCodeBench v5 | MMLU-Redux | GPQA-Diamond | GPU Hours |
|--------|---------|---------|---------|------------------|------------|--------------|-----------|
| Off-policy Distillation | 55.0 (90.0) | 42.8 (83.3) | 92.4 | 42.0 | 86.4 | 55.6 | — |
| + Reinforcement Learning | 67.6 (90.0) | 55.5 (83.3) | 94.8 | 52.9 | 86.9 | 61.3 | 17,920 |
| + On-policy Distillation | 74.4 (93.3) | 65.5 (86.7) | 97.0 | 60.3 | 88.3 | 63.3 | 1,800 |

括号是 pass@64。RL 把 AIME'24 从 55.0 拉到 67.6，**pass@64 仍停在 90.0**；on-policy distillation 到 74.4，pass@64 到 **93.3**。正文把 1,800 / 17,920 说成大约 1/10 GPU hours。这是 **8B、math+code、同一检查点** 的对照，不是旗舰四阶段 RL 的总账，也不是 V4。

01 写「从一个经过基础训练的 Checkpoint」过宽：Table 21 的起点已经是 **off-policy 蒸馏后的 8B**，不是预训练基座。01 另写的「约 150 steps / 77K prompts」在 mineru Table 21 节里 **没有**，本篇不跟。

![17920 与 1800 锁在 Qwen3 Table 21 框内；右侧 V4 框打叉](./images/fig-qwen3-table21-denominator.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Qwen3 Table 21 box vs do-not-attach-to-V4. -->

> 图 3：分母。17,920 与 1,800 是 Qwen3 Table 21 的格子。2026-08 自绘。

**图 3 解析**

- **框内**：8B、同一 off-policy 检查点、math+code、括号 pass@64。1/10 只在这组条件下成立。
- **右侧打叉**：[27-DeepSeek-V4技术解读.md](../../../5-主流模型全解/5.2-国内大模型/DeepSeek深度求索/27-DeepSeek-V4技术解读.md) §5.5 把 1,800 当成 V4 四阶段（SFT / G-OPD / GRPO / SCOPE）合计，再除 17,920。分子分母都是 Qwen3 的格子；V4 mineru **没有**这组 GPU hours。本篇不改第 5 章。
- **G-OPD / SCOPE**：表里「本波不展开」。不要把第 5 章那套 300 / 800 / 200 GPU 小时当成 V4 报告数字。

---

## 5. V4 的 OPD 不是 K3 的 MOPD

库内已经搅过一次：4.6 节首页把 V4 式 (29) 和 K3 式 (15) 前后脚写进同一条「多教师 OPD」演进。名字和损失要对齐成两行。

| | V4 | K3 |
|---|----|----|
| 官方名 | OPD（合版阶段替换混合 RL） | **MOPD**（九个专家合成一个权重） |
| 教师个数 | 十余个领域教师 | 3 域 × 3 档 = 9 |
| 损失 | 全词表 reverse KL | 逐 token clip 过的 log 比，当 RL 奖励 |
| 报告自己怎么说另一条路 | token 级 sg log 比方差大，不用 | 试过更细 top-$k$ 蒸馏，没有明显好处 |
| QAT / MXFP4 | 邻节 §5.2.1，不是式 (29) | 邻节 §4.1.4，从 SFT 就开始；不是式 (15) |

MiMo-V2-Flash 也叫 MOPD，**不要**和 K3 合成一套。MiMo 的 MOPD 是三阶段伞（SFT + 领域教师 + 合版），损失是 RL surrogate，默认可加 ORM；K3 的 MOPD 是九专家合版的那一步，奖励是 clip 后的 OPD reward。两边都引用 MiniLLM 与 Thinking Machines Lab 的 on-policy distillation 博文，引用相同 ≠ 超参相同。

GLM-5 连 MOPD / OPD 缩写都不打，官方名是 on-policy **cross-stage** distillation。教师不是并行训练的领域专家，是时间上更早的自己。

---

## 6. 失效模式：对照表会读错的地方

| 现象 | 原因 | 说明 |
|------|------|------|
| 把 1/10 GPU hours 讲成「OPD 普遍比 RL 便宜一个数量级」 | 分母是 Qwen3 Table 21 的 8B math+code | 旗舰四阶段 RL、V4 合版、K3 九专家都没有这组小时 |
| 把 V4 写成 MOPD，或把 K3 写成全词表 OPD | 英文都有 On-Policy Distillation | V4 反对的正是 K3/MiMo/GLM-5 仍在用的 token 级估计 |
| 把 GLM-5 当成多教师合版 | 教师是前阶段 checkpoint | 解决的是顺序 RL 的能力回退，不是 see-saw 合专家 |
| 把 Step 补成公式 | Limitations 只有一句 | 未找到一手公式就停 |
| 把 QAT/MXFP4 写进 OPD | 后训练邻节挨着写 | 目标函数里没有量化项；见 6.1.7 |
| 把 01 的 Reverse KL 套到 Qwen3 Table 21 | Qwen3 只写 minimize the KL divergence | 正反向以各报告为准；V4 / MiMo 写了 reverse，Qwen3 没写 |
| 把 G-OPD / SCOPE 当 V4 官方阶段 | 第 5 章自由发挥 | 本波不展开 |

---

## 7. 下一篇

- Reverse KL 与 on-policy 采样的教材推导：[01-OPD基础原理](../01-OPD基础原理/01-OPD基础原理.md)。本篇数字以第 14 章表为准，01 里未出现在 Table 21 的步数不跟。
- 自蒸馏（同一权重、不同上下文）：[02-OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md)。
- 厂商精读只走第 14 章入口，见 §2 表最后一列。**不要**在第 5 章再抄一套 D2。

---

## 本篇来源

1. Qwen Team. *Qwen3 Technical Report*. [arXiv:2505.09388](https://arxiv.org/abs/2505.09388)。库内 [03-Qwen3-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/09-Qwen3/03-Qwen3-mineru-en.md) §4.5 Strong-to-Weak、Discussion 中 Table 21（8B、同一 off-policy 检查点、math+code、括号 pass@64、17,920 vs 1,800）。
2. DeepSeek-AI. *DeepSeek-V4*. [HuggingFace PDF](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf)。库内 [03-DeepSeek-V4-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.1-DeepSeek/10-DeepSeek-V4/03-DeepSeek-V4-mineru-en.md) §5.1.2 式 (29)、全词表 vs token-level sg log 比、§5.2.2 教师调度。QAT/MXFP4 在 §5.2.1，不写入本篇 OPD 目标。
3. Kimi Team. *Kimi K3: Open Frontier Intelligence*. [arXiv:2607.24653 HTML](https://arxiv.org/html/2607.24653) §4.1.3 式 (15)、九专家、top-$k$ 蒸馏无明益。精译入口 [01-Kimi-K3-架构精译.md](../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md)。
4. Xiaomi LLM-Core. *MiMo-V2-Flash Technical Report*. [arXiv:2601.02780](https://arxiv.org/abs/2601.02780)。库内 [03-MiMo-V2-Flash-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.9-MiMo/02-MiMo-V2-Flash/03-MiMo-V2-Flash-mineru-en.md) §4.1 三阶段、Table 7、§4.4 式 (5)–(9)。
5. GLM-5 Team. *GLM-5: from Vibe Coding to Agentic Engineering*. [arXiv:2602.15763](https://arxiv.org/abs/2602.15763)。库内 [01-GLM-5技术报告精译.md](../../../14-主流开源模型全景解析与技术报告精读/14.6-GLM/08-GLM-5/01-GLM-5技术报告精译.md) §3.5：cross-stage、sg log 比替换 GRPO 优势、组大小 1。
6. StepFun. *Step 3.5 Flash*. [arXiv:2602.10604](https://arxiv.org/abs/2602.10604)。库内 [03-Step-3.5-Flash-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.7-StepFun/03-Step-3.5-Flash/03-Step-3.5-Flash-mineru-en.md) Limitations：「variants of on-policy distillation」一句。
7. 报告共同引用、本篇不重推：Gu et al. MiniLLM [arXiv:2306.08543](https://arxiv.org/abs/2306.08543)；Agarwal et al. GKD [arXiv:2306.13649](https://arxiv.org/abs/2306.13649)；Lu and Lab, Thinking Machines Lab, [On-policy distillation](https://thinkingmachines.ai/blog/on-policy-distillation)（2025）。

第 14 章 mineru / 精译只读。图 1–3 是示意图，数字以 Table 21 / Table 7 / 各报告公式编号为准。
