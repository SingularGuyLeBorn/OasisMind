---
title: "02 · OPSD: 在线自蒸馏 — 当模型成为自己的神明"
date: 2026-05-16
tags: [OPSD, Self-Distillation, On-Policy, OPD, 知识蒸馏, 后训练]
as_of: 2026-08-30
category: LLM 指南
---

# 02 · OPSD: 在线自蒸馏 — 当模型成为自己的神明

## 1. 背景与核心痛点 (Background & Pain Points)

**家谱定位**: 本算法属于 OPD(在线策略蒸馏)家族的核心演进变体. 

在上一篇《01-OPD基础原理》中，我们见证了 OPD 如何利用逐 Token 的密集监督(Dense Supervision)对 RL 实现了降维打击. 
**前车之鉴**: 然而，基础 OPD 有一个致命的物理约束: **它需要一个极其强大的外部教师模型(External Teacher)驻留在显存中**. 如果你正在训练一个 7B 的模型，你可以用 72B 当老师; 但如果你正在训练世界上最强的万亿参数 SOTA 模型呢？谁来当它的老师？

**核心动机**: OPSD(On-Policy Self-Distillation，在线自蒸馏)正是为了解决“无外部教师”的约束而提出的. 它的核心哲学极其疯狂: 既然找不到比自己更聪明的大脑，那可不可以通过**赋予当前的自己“特权信息”(Privileged Context)** ，强行制造出一个高维的“神明视角”来教导低维的自己？

## 2. 为什么重要 (Significance)

在《Self-Distilled Reasoner (arXiv: 2601.18734)》的实验中，OPSD 展现出了极其恐怖的算力经济学: 
- 传统的 GRPO(如 DeepSeek-R1-Zero 所用)每个问题需要采样 8-16 条轨迹进行探索，更新数百步. 

- **OPSD 只需要 1 条探索轨迹**，在 AIME 竞赛数学题上，仅用 100 步训练，单步采样预算不到 GRPO 的 1/125. 

- **能力跃迁**: 它能把 Qwen3-1.7B 的 AIME25 分数从 37.1 暴拉到 43.4，甚至超越了经过复杂 RL 训练的版本. 它证明了“左脚踩右脚上天”在逻辑推理模型中是完全可行的. 

## 3. 直觉类比 (Intuition)

我们可以用**“开卷考 vs 闭卷考”**来完美类比 OPSD 的工作原理. 

![OPSD 闭卷与开卷考类比](./images/opsd_open_book.png)
*图: 虽然权重完全相同，但拥有标准答案的“开卷考”版本具有绝对的上帝视角，能够为“闭卷考”版本提供极其准确的 Token 级指导. *

假设你(学生模型)和另外一个平行宇宙的你(教师模型)，脑容量和智商完全一样(**共享完全相同的模型权重**). 
现在要解一道极难的奥数题(Prompt). 

- **学生宇宙(闭卷考)** : 只给你题目，让你自己硬算(生成轨迹). 

- **教师宇宙(开卷考/特权上下文)** : 不仅给你题目，还**把这道题的标准答案(Golden Answer)直接放在你桌子上**. 

因为教师宇宙的你看到了标准答案，你的推理逻辑和自信心会瞬间爆棚. 
OPSD 就是让“闭卷考的你”在写下每一个算符时，去向“开卷考的你”请教: “喂，兄弟，这道题我已经写到第三步了，你看着标准答案告诉我，第四步我写什么比较稳？”

## 4. 数学推导与公式对比 (Mathematical Rigor)

在 OPSD 中，教师分布 $\pi_T$ 和学生分布 $\pi_\theta$ 是**完全同一个参数化模型**，唯一的区别是输入条件的概率分布. 

### 4.1 教师与学生的条件概率定义
- **学生分布** $\pi_\theta(\cdot | x, y_{<t})$: 只看见问题 $x$ 和自己之前生成的轨迹 $y_{<t}$. 

- **教师分布** $\pi_T(\cdot | x, \underline{\mathbf{y^*}}, y_{<t})$: 不仅看见问题和轨迹，**[高亮差异项]** 还额外看见了**标准答案 $y^*$(Privileged Context)** . 

### 4.2 为什么回归了 Forward KL？
在基础 OPD 中，我们极力推崇 Reverse KL，因为它能防止学生在面对不确定的教师时瞎猜(防幻觉). 
**但在 OPSD 中，作者惊人地发现: 必须改用 Forward KL！**

$$
 \mathcal{L}_{OPSD} = \mathbb{E}_{x, y^*} \mathbb{E}_{y \sim \pi_\theta} \left[ \frac{1}{T} \sum_{t=1}^T \underline{\mathbf{D_{KL}(\pi_T \| \pi_\theta)}} \right] \tag{1}
$$

**物理层面的根因剖析**: 
- 在基础 OPD 中，Teacher 是凭空猜题，它的分布可能是平坦的(High Entropy). 
- 但在 OPSD 中，Teacher 面前放着标准答案 $y^*$！它的思路极其清晰，概率质量会**高度集中在向正确答案逼近的 Token 上**. 
- 此时，教师分布 $\pi_T$ 是一个极其高质量的、确定性极强的“软分布(Soft Labels)”. 

- **[对比项: 散度方向]** 如果用 Reverse KL($D_{KL}(\pi_\theta \| \pi_T)$)，公式为 $\sum \pi_\theta \log(\pi_\theta / \pi_T)$，由学生加权. 学生只要在错误道路上极度自信，Loss 就会变得很小(陷入局部最优). 
- 但使用 **Forward KL($D_{KL}(\pi_T \| \pi_\theta)$)** ，公式为 $\sum \pi_T \log(\pi_T / \pi_\theta)$，是由**教师加权**的！教师说哪个 token 对解题有帮助，学生就必须把该 token 的概率提上来. 实验证明，Forward KL 的效果(41.1分)完爆了 Reverse KL(35.0分). 

## 5. 数值走查 (Numerical Example)

为什么 Forward KL 能够传递“解题思路”？我们来看一个具体数字. 

在推理到某一步时，标准解 $y^*$ 提示接下来应该用“勾股定理”. 
- 教师模型看到了 $y^*$，它给出的 Token 预测概率是: `{"平方": 0.8, "开根号": 0.15, "除以": 0.05}`. 这代表着一种软性的推理倾向. 
- 学生模型在瞎蒙，给出的概率是: `{"除以": 0.9, "平方": 0.1}`. 

计算 **Forward KL**: $\sum P_T \log(P_T / P_S)$
- 对于“平方”这个 Token: $0.8 \times \log(0.8 / 0.1) = 0.8 \times 2.079 = 1.66$. 
- 对于“除以”这个 Token: $0.05 \times \log(0.05 / 0.9) = 0.05 \times (-2.89) = -0.14$. 
巨大的惩罚项 $1.66$ 会沿着反向传播，强行拉高学生网络预测“平方”的 logits，从而把“看过标准答案的潜意识”完美注入到学生权重中. 

## 6. 简化实现 (PyTorch Code)

OPSD 有一个极其关键的工程实现技巧: **Pointwise Clipping(逐词裁剪)** . 
因为文本中包含大量“嗯、然后、所以”等无意义的风格词汇，这些词会产生巨大的无效 KL 梯度. 必须对其裁剪. 

```python
import torch
import torch.nn.functional as F

def opsd_train_step(model, question_tokens, golden_answer_tokens, tau_clip=10.0):
    """
    OPSD: 同一个模型，双路上下文计算 Forward KL
    """
    
    # 步骤 1: On-Policy 采样 (闭卷考)
    # 学生利用纯题目生成轨迹
    model.eval()
    with torch.no_grad():
        student_trajectories = model.generate(question_tokens, max_new_tokens=512)
    
    # 构建教师的开卷考输入: 题目 + 标准解 + 学生生成的轨迹
    # 这样教师就能在评估学生的每一步时，随时偷看标准解
    teacher_input = torch.cat([question_tokens, golden_answer_tokens, student_trajectories], dim=-1)
    # 对齐维度逻辑: 此处简化演示，实际实现需通过 Attention Mask 让教师预测 student_trajectories 部分
    
    # 步骤 2: 学生分布 (闭卷考)
    model.train()
    student_logits = model(torch.cat([question_tokens, student_trajectories], dim=-1)).logits
    student_logprobs = F.log_softmax(student_logits, dim=-1)
    
    # 步骤 3: 教师分布 (开卷考) - 冻结梯度
    with torch.no_grad():
        teacher_logits = model(teacher_input).logits
        teacher_probs = F.softmax(teacher_logits, dim=-1)
    
    # 步骤 4: 计算 Forward KL: D_KL(Teacher || Student)
    # PyTorch 的 kl_div 默认是 KL(target || input)，所以输入是对齐的
    # 公式对应: \pi_T * ( \log \pi_T - \log \pi_\theta )
    pointwise_kl = F.kl_div(
        input=student_logprobs, 
        target=teacher_probs, 
        reduction='none' # 不要求和，以便进行后续的 Clipping
    ).sum(dim=-1) # 对词表维度求和，保留 sequence 维度
    
    # 步骤 5: 核心工程技巧 Pointwise Clipping
    # 防止无意义的风格词汇(如语气词)产生巨大的 KL 梯度
    clipped_kl = torch.clamp(pointwise_kl, min=0.0, max=tau_clip)
    
    loss = clipped_kl.mean()
    loss.backward()
    
    return loss.item()
```
> **注释对应**: `teacher_input` 中强制塞入 `golden_answer_tokens` 就是构造 Privileged Context 的核心操作. 而 `torch.clamp` 则是工程上保证模型不被风格噪声带偏的关键. 

## 7. 局限性与边界条件 (Limitations & Boundary Conditions)

世界上没有包治百病的算法. OPSD 存在着严格的边界要求: 

1. **底座模型的基础能力边界**: 
   - OPSD **绝对无效**的场景: 如果底座模型本身极度愚蠢，即使你把标准答案放在它面前，它也看不懂(比如你给一个纯英文 1B 模型看高等数学的解题过程). 

- **物理根因**: 开卷考的前提是你得能看懂书. 如果 Teacher 在带有 `golden_answer` 时仍然生成混乱的 $\pi_T$ 分布，那么 Forward KL 就会变成把垃圾灌入学生脑子里的毒药. 

2. **捷径学习 (Shortcut Learning)** : 
   - 当标准答案非常简短(如只给出一个最终数字)时，教师模型可能会因为看到了最终答案而产生“过度自信”，在前面推导步骤中瞎写，导致蒸馏出来的学生也学会了“跳步猜答案”. 

## 8. 演进与承上启下 (Evolution & Segue)

尽管 OPSD 极其优雅地解决了“无需外部教师”的问题，但在真实的工业级大模型训练中，需求变得越来越贪婪. 
我们不仅希望模型能够自我迭代，还希望模型在每次吸收新知识、新题型时，**不要忘记以前学过的旧知识**(防止灾难性遗忘，Catastrophic Forgetting). 

如果我们把 OPSD 的“特权上下文”从“标准答案”换成“高质量的专家示范(Demonstration)”，并引入持续学习(Continual Learning)机制，会发生什么化学反应？这自然引出了 OPD 家族的下一位悍将: **SDFT(自蒸馏持续学习)** . 请进入下一章. 

## 9. 总结与参考文献 (References)

1. **同源双模态**: 完全放弃外部教师，利用同一模型在有/无答案两种上下文下的差异形成 Dense 训练信号. 

2. **Forward KL 胜出**: 当参考分布(带标准解的教师)质量极高且确定性强时，使用教师加权的 Forward KL 效果远超 Mode-seeking 的 Reverse KL. 

3. **极低的算力需求**: 单次 Rollout 即可完成梯度更新，将强化学习级别的复杂优化问题转化为简单的有监督分类问题. 

**参考文献: **
- Self-Distilled Reasoner. arXiv: 2601.18734. URL: https://arxiv.org/abs/2601.18734
- OpenThoughts: Data Recipes for Reasoning Models.

---

## 2026-08 修订（不删上文）

旧标题「神明」和 §2「暴拉 / 1/125 / 100 步」是 2025 稿修辞，**机制与数字以本节为准**。对象钉死 Zhao、Xie、Liu、Huang、Pang、Chen、Grover 的 [Self-Distilled Reasoner](https://arxiv.org/abs/2601.18734)（打开的是 [HTML](https://arxiv.org/html/2601.18734)）。**OPSD = On-Policy Self-Distillation**：没有更强外部教师时，把特权上下文 $y^{\star}$（参考解，可含 CoT）条件进教师前向；学生仍按自己的 on-policy 轨迹 $\hat y$ 学。教师和学生是**同一套权重的两种条件**，不是另雇一个 72B。本文是 [4.6 OPD](../4.6-OPD.md) 里「自教师」这一格，记号跟论文 $p_S,p_T,\hat y,y^{\star}$。**不是** [01](../01-OPD基础原理/01-OPD基础原理.md) 的外部教师 logits，**不是** [04 SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) 的环境 rich feedback，**不是** 把 OPD 塞进 DPO。G-OPD / SCOPE 本波不升格。

### 1. 旧稿数字对回 Table 2 / Table 6

摘要与表冲突时**弃摘要、跟表**。37.1 和 43.4 **不是** AIME25 单集。

Table 2 分母：Qwen3 instruct、OpenThoughts 数学子集最多 30K 题解对、评测 **Avg@12**（温度 1.0、最长 38912、Thinking Mode 开，Table 8）、OPSD 每 20 步评一次、**100 步内最好**；GRPO 报 500 步内峰值；SFT 与 OPSD **同样本数**。

| 模型 | 方法 | AIME24 | AIME25 | HMMT25 | Average |
| --- | --- | ---: | ---: | ---: | ---: |
| Qwen3-1.7B | Base (Instruct) | 51.5 | 36.7 | 23.1 | **37.1** |
| Qwen3-1.7B | + SFT | 48.4 | 36.3 | 22.7 | 35.8 |
| Qwen3-1.7B | + GRPO | 51.1 | 38.3 | 23.7 | 37.7 |
| Qwen3-1.7B | + OPSD | 57.2 | **43.9** | 29.2 | **43.4** |
| Qwen3-4B | Base | 74.9 | 66.4 | 42.2 | 61.2 |
| Qwen3-4B | + OPSD | 76.4 | 68.3 | 46.1 | 63.6 |
| Qwen3-8B | Base | 75.8 | 65.6 | 43.9 | 61.8 |
| Qwen3-8B | + GRPO | 76.4 | 68.9 | 46.7 | 64.0 |
| Qwen3-8B | + OPSD | 77.8 | 70.8 | 45.8 | 64.8 |

读法：旧稿「AIME25 从 37.1 到 43.4」应改成 **三集平均 37.1→43.4**；AIME25 单列是 **36.7→43.9**（仍是 1.7B、Avg@12、100 步内最好）。8B 的 HMMT25 上 GRPO 46.7 略高于 OPSD 45.8，不要写成「三集全面碾压 GRPO」。SFT 三集都掉，论文归因于参考解写得短、测时生成变短；OPSD 把短解当成特权信息做合理化，而不是照抄。

「1/125」跟 Table 6 的**每题每步上限 token**，不是神秘算力折扣：

| | GRPO | OPSD |
| --- | ---: | ---: |
| 每题采样条数 | 8 | 1 |
| 训练期最长补全 | 16000 | 1024 |
| 有效 batch | 32 | 32 |
| LoRA $r/\alpha$ | 64 / 128 | 64 / 128 |
| 训练步数 | 500 | 100 |
| 学习率 | $5\times 10^{-6}$ | $5\times 10^{-6}$ |

$8\times 16000\big/(1\times 1024)=125$。所以「单条探索、100 步、1/125」可以留，但分母必须写成：**1 条 × 1024 token vs GRPO 8 条 × 16k**，再加「OPSD 100 步、GRPO 500 步」。打开的 HTML 摘要只写 superior token efficiency，**没有** 4–8× 这个可对表的数；不要用二次转述补。Figure 3 还写：同样 100 步里，GRPO 超过一半 batch 的组内奖励标准差为零（全对或全错），梯度没了；OPSD 用稠密蒸馏，不受这条约束。

旧稿 §4 把 Forward KL 的 41.1 和 Reverse KL 的 35.0 当成主结果。那是 Table 3 **第 100 步**，不是峰值。Table 3 分母：AIME25、Qwen3-1.7B、Avg@12、同一套 pointwise clipping。

| 散度 | Base | Step 50 | Step 100 |
| --- | ---: | ---: | ---: |
| Forward KL $\mathrm{KL}(p_T\parallel p_S)$ | 36.7 | **43.9** | 41.1 |
| Reverse KL $\mathrm{KL}(p_S\parallel p_T)$ | 36.7 | 37.5 | 35.0 |
| JSD ($\beta=0.5$) | 36.7 | 36.9 | 39.0 |

主实验采用 Forward KL，因为这条在表上最好。Algorithm 1 的 $D$ 举例写的是 $\mathrm{JSD}_\beta$，**不是**「论文规定必须 JSD」。

### 2. 特权信息当自己的教师

数据集 $\mathcal{S}=\{(x_i,y_i^{\star})\}_{i=1}^{N}$。$y^{\star}$ 是参考解，**可以带思维链**，不是必须只有一个最终数字。同一语言模型 $p_\theta$ 切成两种条件：

$$
p_T(\cdot\mid x,y^{\star})\;\triangleq\; p_\theta(\cdot\mid x,y^{\star}),\qquad
p_S(\cdot\mid x)\;\triangleq\; p_\theta(\cdot\mid x). \tag{R1}
$$

学生只看见题，采样自己的轨迹

$$
\hat y=(\hat y_1,\ldots,\hat y_{|\hat y|})\sim p_S(\cdot\mid x). \tag{R2}
$$

教师**不生成**。Figure 2 的教师提示是：题 + 参考解 +「看过参考解后请用自己的方式再解一遍」。然后只在学生已经写出的前缀上做一次 prefill，得到逐步分布 $p_T(\cdot\mid x,y^{\star},\hat y_{<n})$。论文原话：rationalization is done implicitly through one forward pass.

两边都对着**同一条学生轨迹**打分。位置 $n$ 上的全词表散度（式 (6)）再对轨迹取平均：

$$
D(p_T\|p_S)(\hat y\mid x)
=\frac{1}{|\hat y|}\sum_{n=1}^{|\hat y|}
D\Bigl(p_T(\cdot\mid x,y^{\star},\hat y_{<n})\;\Big\|\; p_S(\cdot\mid x,\hat y_{<n})\Bigr). \tag{R3}
$$

训练目标（式 (8)，与开篇式 (1) 同一件事；式 (1) 写成求和，实现跟 Algorithm 1 的平均）：

$$
\mathcal{L}(\theta)
=\mathbb{E}_{(x,y^{\star})\sim\mathcal{S}}
\Bigl[\mathbb{E}_{\hat y\sim p_S(\cdot\mid x)}\bigl[D(p_T\|p_S)(\hat y\mid x)\bigr]\Bigr]. \tag{R4}
$$

梯度**只走学生 logits**。§4.1 实验还把教师**钉在初始策略** $\theta_{\mathrm{init}}$，不跟当前正在更新的学生走，当作隐式正则，防止自蒸馏把分布拽飞。所以「同一套权重」指的是**开局同一份 $p_\theta$、靠上下文分饰两角**；跑起来之后教师冻结、学生 LoRA 更新，两套条件会分开。旧稿 §6 把 `golden_answer` 直接 `cat` 进 `teacher_input` 方向对，但缺 Figure 2 那句引导、也没写冻结教师。

![同一套权重：闭卷学生只看题生成，开卷教师看参考解却只做 prefill，散度只沿学生轨迹回传](./images/fig-opsd-open-closed.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Two-column OPSD: student p_S(x) closed-book generates y-hat; teacher p_T(x,y*) open-book prefill only; D(p_T || p_S); gradient only through student. -->

> 图 1：开卷教师 vs 闭卷学生。对应论文 Figure 1。旧图 `opsd_open_book.png` 不删，本节改引这张。2026-08 自绘。

**图 1 解析**

- **左（青）**：学生只吃 $x$，自回归写出 $\hat y$。这是 on-policy 的唯一采样源。
- **右（琥珀）**：教师多吃 $y^{\star}$。虚线框「prefill only」：教师不写卷，只阅卷。
- **中下**：逐步比较 $p_S(\cdot\mid x,\hat y_{<n})$ 与 $p_T(\cdot\mid x,y^{\star},\hat y_{<n})$。对齐的是学生自己的前缀，不是专家轨迹——这就是和 SFT / 式 (2) 监督蒸馏的差。
- **红箭头**：损失对 $p_T$ stop-grad。没有第二条 72B 驻留。

Algorithm 1：抽 minibatch → 每题学生采样一条 $\hat y$ → 按 (R3) 算 $\ell$ → batch 平均后更新 $\theta$。旧稿「只需 1 条探索轨迹」对应 Table 6 的 Number of Generations = 1，不是「整个训练只 roll 一次」。

### 3. 全词表 Forward KL + 词表维裁剪

主路径是 **full-vocabulary logit distillation**（GKD 那类：每个位置对整个 $\mathcal{V}$ 做 softmax 再算 $D$），不是只在抽到的那个 token 上算优势。备选式 (9) 才是 sampled-token：把 $A_n=\log p_T(\hat y_n\mid\ldots)-\log p_S(\hat y_n\mid\ldots)$ 当常数，再乘 $\log p_S$。Table 4 分母换成了 **Qwen3-4B、蒸馏生成长 2048、pass@8**（不要和 Table 2 的 Avg@12 混）：全词表 AIME25 **84.1** / HMMT25 **60.0**，sampled-token 82.1 / 57.3。全词表更贵（每步存一份词表 logits）。

$D$ 可以是 Forward KL、Reverse KL 或 $\operatorname{JSD}_\beta$（式 (7)）。表上 Forward KL 赢，见上节 Table 3。旧稿「必须改用 Forward KL」降调成：**在这份特权教师比较尖的设置里，教师加权的 Forward KL 更好**；不要写成 OPD 家族定理。旧稿勾股定理那组 0.8 / 0.1 是示意图，论文表里没有，当数值例即可。

Table 5 解释为什么要 clip。按 token 分成 style / math / other，10 道题平均。主实验配的是 **学生 TM-off、教师 TM-on**（数学词上的 KL 最大）：

| Student | Teacher | 1.7B Style | 1.7B Math | 1.7B Other |
| --- | --- | ---: | ---: | ---: |
| TM-off | TM-off | 0.68 | 0.12 | 0.11 |
| TM-on | TM-off | 0.51 | 0.10 | 0.17 |
| TM-on | TM-on | 0.51 | 0.09 | 0.08 |
| **TM-off** | **TM-on** | **0.85** | **0.14** | **0.25** |

style 列比 math 列高一个数量级。不加处理，梯度会去学「therefore / okay」，不学「14」。论文在**词表项**上做 pointwise clip，不是旧稿 §6 那种对已经求和的 KL 做 `clamp(0, 10)`。对 $f$-散度的逐项贡献

$$
\ell_{n,v}^{(f)}=p_T(v\mid\cdot)\,f\!\left(\frac{p_S(v\mid\cdot)}{p_T(v\mid\cdot)}\right), \tag{R5}
$$

$$
D_{\mathrm{clip}}^{(f)}(p_T\|p_S)
=\frac{1}{|\hat y|}\sum_{n=1}^{|\hat y|}\sum_{v\in\mathcal{V}}\min\bigl(\ell_{n,v}^{(f)},\tau\bigr). \tag{R6}
$$

Appendix B：他们**没有**扫 $\tau$。Figure 4：1.7B、AIME24，clip 能挡住崩溃。评测时 Thinking Mode 是开的（Table 8），和训练时学生 TM-off 不是同一档——训练省生成、评测按 Qwen3 博客建议拉满。

![Algorithm 1：学生采样、双路前向、全词表散度、词表维 clip、只更新学生且教师冻在 theta init](./images/fig-opsd-algorithm.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Five-box Algorithm 1: sample y-hat; dual forward; full-vocab D; pointwise clip; update student, freeze teacher. -->

> 图 2：Algorithm 1 数据流。Box 3 若把 $D$ 的左右写反，以式 (R3) 的 $D(p_T\|p_S)$ 为准。2026-08 自绘。

**图 2 解析**

- **Box 1**：只从 $p_S(\cdot\mid x)$ 采样。对错都留着，不对最终答案做拒绝采样（那是 STaR，见附录 D）。
- **Box 2**：学生条件 $(x,\hat y_{<n})$；教师条件 $(x,y^{\star},\hat y_{<n})$。图上教师标 $\theta_{\mathrm{init}}$ 对应 §4.1，不是另装一个模型。
- **Box 3–4**：散度在整张词表上；clip 切的是 $(n,v)$ 格子，不是整句 KL。
- **Box 5**：学生 LoRA 更新；教师冻结。

式 (9) 可以读成逐步稠密奖励的 policy gradient，附录 D 用来对照 STaR：STaR 的 $R=\mathbf{1}(y=y^{\star})$ 是句级的，全错就没梯度；OPSD 每个位置都有 $r_n$，终局错了也还能学。这是论文自己的对照，**不要**把 OPSD 写成「STaR 换个名」。

### 4. 不是什么

| 名字 | 它在做什么 | OPSD 不是它的理由 |
| --- | --- | --- |
| 基础 OPD / GKD 式 on-policy distillation | 学生自己采样，**另一个**教师给逐步分布 | 本篇教师是 $p_\theta(\cdot\mid x,y^{\star})$，不是 72B |
| SFT / 式 (2) | 在专家轨迹 $y^{\star}$ 上模仿 | 监督前缀来自 $\hat y\sim p_S$，不是 $y^{\star}$ |
| GRPO | 组内 8 条、句级 0/1 | Table 1：稀疏、采样贵；本篇稠密、每题 1 条 |
| SDPO | 环境 rich feedback 当自教师 | 邻居 [04](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md)；特权信息不是报错回注 |
| 把 OPD 塞进 DPO | 偏好对上的分类损失 | 式 (R4) 是逐步 $D(p_T\|p_S)$，没有 chosen/rejected 对 |
| Context distillation (Snell et al.) | 同一模型、教师有特权上下文，但对学生做 **SFT 硬标签** | 论文 Related Work：off-policy、离散 token；本篇是 on-policy 软分布 |
| STaR / ReST | 生成→按对错过滤→SFT | 句级奖励；全错则无更新 |
| G-OPD / SCOPE | 后文变体 | 本波不升格，不当金科玉律 |
| SDFT | 持续学习、示范当特权上下文 | 下一篇 [03](../03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md)；本篇不写遗忘实验 |

### 5. 失效：没有特权上下文时怎么办

OPSD 吃的是 $\mathcal{S}$ 里成对的 $(x,y^{\star})$。**没有 $y^{\star}$**（开放生成、没有参考解的对话、只有对错没有过程）就变不回自教师：式 (R1) 的 $p_T$ 退化成 $p_S$，散度是 0，学不到东西。这时只能退回 [01](../01-OPD基础原理/01-OPD基础原理.md) 的外部教师，或 GRPO 那种可验证奖励——本算法不负责凭空造特权信息。

即使有 $y^{\star}$，Appendix A 写得很死：题目难过模型的理解阈值，教师「开卷」也讲不明白，监督是噪声。他们只做到 **8B**，再大未测。旧稿「底座太蠢则开卷也看不懂」方向对，来源是这篇附录，不是发挥。

其它边界：

| 现象 | 原因 | 说明 |
| --- | --- | --- |
| 捷径 / 跳步 | $y^{\star}$ 过短时教师过度自信 | 旧稿 §7.2 可留；论文自己更强调 SFT 会被短解压短思维，OPSD 用合理化把短解变成逐步软标签，**不是**保证不跳步 |
| 风格词主导 | Table 5 style ≫ math | 必须词表维 clip；旧代码对句级 KL 做 clamp 对不上 (R6) |
| 生成加长无增益 | Figure 5：1.7B 上 1024 vs 4096 | 后段对教师已可预测，惩罚变小；主实验锁 1024 |
| 教师跟着学生更新 | §4.1 发现不稳 | 实验冻 $\theta_{\mathrm{init}}$；若实现成「每步师生同一份当前权重」，不是论文主设置 |
| 只测数学 | AIME24/25、HMMT25 | 代码、多步 agent 未在此文 |

没有特权上下文、又没有外部教师：这篇给不出替代损失。不要把「左脚踩右脚」读成无数据永动机。

下一篇只链 [03-SDFT](../03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md)：把特权上下文从参考解换成示范、并讨论遗忘。本篇不预写 SDFT 数字。

### 本篇来源（2026-08 核对）

1. Zhao, Xie, Liu, Huang, Pang, Chen, Grover. *Self-Distilled Reasoner: On-Policy Self-Distillation for Large Language Models*. [arXiv:2601.18734](https://arxiv.org/abs/2601.18734) / [HTML](https://arxiv.org/html/2601.18734)。Table 1–8、Figure 1–5、Algorithm 1、式 (1)(6)(7)(8)(9)、§4.1 冻结初始教师、Appendix A/B/D。
2. 官方代码：[siyan-zhao/OPSD](https://github.com/siyan-zhao/OPSD)。
3. 训练数据声明：OpenThoughts 数学子集（Guha et al., 2025），本篇数字仍以 2601.18734 的表为准。

图 1–2 是示意。勾股定理 0.8/0.1 不是论文表。知乎只学「教师阅卷不做题」的拆法，数字全部回表。
