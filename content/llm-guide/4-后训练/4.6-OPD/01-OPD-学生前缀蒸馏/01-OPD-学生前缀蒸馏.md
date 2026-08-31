---
title: "01 · OPD：学生前缀蒸馏"
date: 2026-05-16
tags: [OPD, On-Policy Distillation, Reverse KL, MiniLLM, GKD, 知识蒸馏, 后训练]
as_of: 2026-08-30
---

# 01 · OPD：学生前缀蒸馏

本库 OPD 的全称是 **On-Policy Distillation**：学生按当前策略自己采样轨迹，教师只在这些学生前缀上给逐 token 的密集监督。卡住的瓶颈是 off-policy 蒸馏只在教师/数据集前缀上教、推理却走学生自己的前缀（暴露偏差），而 RL 虽然 on-policy，监督却往往稀到整条轨迹一个标量。本篇是 [4.6-OPD](../4.6-OPD.md) 的地基专文；Qwen3 的数字只引用 Table 21，厂商捆法见第 14 章，不在这里再抄一遍。**不是** Online Preference Distillation，也不是把 DPO 换个名字。

> 2026-08：§1–§9 是 2026-05 现稿，**不删**。名字、Table 21 分母、MiniLLM / GKD 指针、以及「没有外部教师时这套不成立」见文末 [2026-08 修订](#2026-08-修订)。

## 1. 背景与核心痛点 (Background & Pain Points)

当今大模型的后训练长久以来被夹在两座冰山之间. 左边是**监督微调(SFT)** ，模型在海量的“学霸满分试卷”上逐字模仿. 但一旦到了真实的测试环境，如果模型自己走错了一步(产生了与训练集不同的前缀)，它就完全不知道该如何挽救，只能“一步错，步步错”，这在学术界被称为**暴露偏差(Exposure Bias)** 与复合误差. 

右边是**强化学习**，模型被允许自己去探索解题空间(On-Policy). 但在探索完长达几千个 token 的推理链后，它只能得到一个干瘪的最终得分(+1 或 -1). 这导致了臭名昭著的**奖励稀疏(Sparse Reward)** 与信用分配问题(Credit Assignment)：模型根本不知道自己到底是哪一步做对了，哪一步做错了. 

**家谱定位**：On-Policy Distillation(OPD，在线策略蒸馏)正是站在这两座冰山中间的“第三极”. 它是整个 OPD 算法家族(包括后来的 OPSD、SDFT、SCOPE 等)的地基. 
**核心动机**：OPD 的诞生，正是为了应对 SFT 的 Exposure Bias 和 RL 的极低数据效率. 它试图在**学生模型自己采样的轨迹上**(On-Policy，解决 Exposure Bias)，利用**教师模型的密集分布信号**(Dense Supervision，解决奖励稀疏)，实现一种前所未有的高效后训练范式. 

## 2. 为什么重要 (Significance)

在《Qwen3 Technical Report》中，研究团队披露了一个震撼业界的数据：
从一个经过基础训练的 Checkpoint 出发，如果使用传统的 RL(强化学习)来提升数学推理能力(AIME'24 数据集)，需要耗费高达 **17,920 个 GPU 小时** 才能将准确率提升到 67.6%. 
而使用 OPD，仅需约 150 个 steps(约 77K prompts)，耗费 **1,800 个 GPU 小时**，就将分数一举推高到了 **74.4%**. 

**OPD 用大约十分之一的 RL 算力，做到了比 RL 显著更高的上限分数. ** 这种在算力经济学上的降维打击，使得 OPD 成为近两年(2025-2026)所有闭源/开源大厂后训练 pipeline 中不可或缺的核心组件. 

## 3. 直觉类比 (Intuition)

我们可以用“驾校学车”来类比三种不同的训练方式：

![SFT vs RL vs OPD 驾校类比](./images/opd_driving_analogy.png)
*图：SFT 就像看教练开车(不动手)，RL 就像蒙眼盲开(纯试错)，而 OPD 则是自己在赛道上开，教练在旁边做密集指导. *

- **SFT (Off-Policy)** ：教练(Teacher)在副驾驶握着方向盘跑完一整圈，你坐在旁边看着记. 一上路，如果你不小心把车开偏了 10 厘米，因为你从来没有学习过“在偏离路线时如何修正”，你大概率会直接把车开进沟里(暴露偏差). 

- **RL (On-Policy)** ：教练把你蒙上眼睛扔进车里，你自己瞎开(Rollout). 如果你撞树了，教练在结束时打你一顿(Score: -1); 如果你奇迹般地开到了终点，教练给你一块糖(Score: +1). 你要挨无数次打，才能慢慢试出哪条路是对的(奖励极度稀疏). 

- **OPD (在线蒸馏)** ：**你自己握着方向盘，亲自在赛道上开(On-Policy)** . 但在你踩下油门、打方向盘的**每一个瞬间(Every Token)** ，坐在副驾驶的教练都会大声告诉你：“如果你现在往左打死，生还概率是 90%; 如果往右打死，概率是 2%. ”(Dense Distribution Supervision). 你是在自己的驾驶轨迹上，接受教练最密集的纠偏指导. 

## 4. 数学推导与公式对比 (Mathematical Rigor)

OPD 的核心在于目标函数的根本性转变. 让我们直接对比 SFT 和 OPD 的损失函数. 

### 4.1 SFT 隐含的 Forward KL

在标准的 SFT 或 Off-Policy Distillation 中，学生模型 $\pi_\theta$ 试图最小化负对数似然损失：

$$
\mathcal{L}_{SFT} = \mathbb{E}_{s_t \sim \pi_T} \bigl[ -\log \pi_\theta(a_t \mid s_t) \bigr] \tag{1}
$$

- $\mathbb{E}_{s_t \sim \pi_T}$：期望的采样来自教师模型 $\pi_T$（或人类演示数据集）。状态 $s_t$ 是预设的。
- $\log \pi_\theta(a_t \mid s_t)$：学生模型在给定教师状态下，生成正确动作 $a_t$ 的对数概率。

这在数学上等价于最小化 **Forward KL（前向 KL 散度）** $D_{\mathrm{KL}}(\pi_T \Vert \pi_\theta)$。
Forward KL 的致命特点是 **Mean-Seeking(求均值)** 或 **Mass-Covering**. 如果老师会三种解法，学生为了把 KL 散度降到最低，会被迫将概率质量平均分配给这三种解法. 当学生能力有限时，它很容易在三种解法中产生四不像的“幻觉”. 

### 4.2 OPD 的 Reverse KL

OPD 逆转了这一过程，使用的是 **Reverse KL (逆向 KL 散度)** . 同族算法(如 GRPO, PPO)通常基于优势函数(Advantage)，而 **OPD 的核心是直接对分布的差异求期望**：

$$
\mathcal{L}_{OPD} = \mathbb{E}_{s_t \sim \pi_\theta} \bigl[ D_{\mathrm{KL}}\bigl(\pi_\theta(\cdot \mid s_t) \Vert \pi_T(\cdot \mid s_t)\bigr) \bigr] \tag{2}
$$

让我们拆解这个极其优美的公式：

- $\mathbb{E}_{s_t \sim \pi_\theta}$：**采样源。** 注意期望的下标！现在的状态 $s_t$ 是由学生模型 $\pi_\theta$ 自己生成的（On-Policy）。这解决了 Exposure Bias，因为学生在训练时看到的就是它在推理时会遇到的状态。
- $D_{\mathrm{KL}}(\pi_\theta \Vert \pi_T)$：**散度方向。** 这是 Reverse KL。展开即

$$
\sum_{a} \pi_\theta(a \mid s_t) \bigl[ \log \pi_\theta(a \mid s_t) - \log \pi_T(a \mid s_t) \bigr] \tag{3}
$$

- $\pi_\theta(a \mid s_t)$：权重项。学生自己觉得概率很低的 token，哪怕老师觉得很重要，损失的权重也极小。这意味着 Reverse KL 是 Mode-Seeking（寻模态）的。
- $\log \pi_\theta - \log \pi_T$：对数概率的差值，作为优化的梯度信号。

学生不再强求学会老师所有的技能(Mass-covering). 只要在自己生成的轨迹上，挑一个自己最擅长、且老师也认可的方向(高概率对齐)，就能把 Loss 降下来. 这极大程度地避免了幻觉. 

## 5. 数值走查 (Numerical Example)

为了彻底理解 Forward KL 和 Reverse KL 对行为的影响，我们来看一个极其简化的 2-token 词表：$\mathcal{V}=\lbrace A,\,B\rbrace$。

假设在一个特定的状态下，**教师(Teacher)** 的认知是模糊的，给出的真实分布为 $P_T = [0.5, 0.5]$(既可以选 A 也可以选 B). 
由于能力限制，**学生(Student)** 只能是极端的，只能输出 $P_S = [1.0, 0.0]$(死磕 A)或者 $P_S = [0.0, 1.0]$(死磕 B). 

**场景 1：如果强制使用 Forward KL (SFT 范式)**

$$
D_{\mathrm{KL}}(P_T \Vert P_S) = \sum P_T \log \frac{P_T}{P_S} \tag{4}
$$

- 若学生选 $P_S = [1.0, 0.0]$，计算 $B$ 的 KL：$0.5 \log(0.5 / 0) \to +\infty$。
- 结果：Loss 爆炸！Forward KL 强迫学生必须学会 B，即便学生没这个能力，最终导致崩溃. 

**场景 2：如果使用 Reverse KL (OPD 范式)**

$$
D_{\mathrm{KL}}(P_S \Vert P_T) = \sum P_S \log \frac{P_S}{P_T} \tag{5}
$$
- 学生选 $P_S = [1.0, 0.0]$，此时只计算 $A$ 的项，因为当 $P_S(B)=0$ 时权重为 0. 
- 计算：$1.0 \times \log(1.0 / 0.5) = 1.0 \times 0.693 = 0.693$. 
- 结果：Loss 是一个非常小且稳定的标量. OPD 宽容了学生的偏科，允许学生“只挑自己会的且老师不反对的”那条路走. 

## 6. 简化实现 (PyTorch Code)

以下是单次 OPD 训练步(Step)的 50 行简化核心逻辑. 

```python
import torch
import torch.nn.functional as F

def opd_train_step(student_model, teacher_model, prompts, temperature=1.0):
    """
    在线策略蒸馏 (OPD) 核心训练逻辑
    prompts: list[str], 初始的问题输入
    """
    
    # 步骤 1: On-Policy 采样
    # 对应数学公式: s_t \sim \pi_\theta
    # 学生利用自己的参数进行自回归生成，获得轨迹 (Trajectories)
    student_model.eval() # 采样阶段不更新梯度
    with torch.no_grad():
        trajectories = student_model.generate(prompts, max_new_tokens=512)
    
    # 步骤 2: 计算学生在自己轨迹上的对数概率
    # 对应数学公式: \log \pi_\theta(a|s_t)
    student_model.train() # 切回训练模式
    student_logits = student_model(trajectories).logits
    student_logprobs = F.log_softmax(student_logits / temperature, dim=-1)
    
    # 步骤 3: 教师进行 Dense 评估
    # 对应数学公式: \log \pi_T(a|s_t)
    # 注意：教师的参数是冻结的，不传播梯度
    teacher_model.eval()
    with torch.no_grad():
        teacher_logits = teacher_model(trajectories).logits
        # 我们需要的是教师的概率分布作为 Target
        teacher_probs = F.softmax(teacher_logits / temperature, dim=-1)
    
    # 步骤 4: 计算 Reverse KL 损失
    # 对应数学公式: D_{KL}( \pi_\theta || \pi_T )
    # 在 PyTorch 中，kl_div 的输入是 (log_input, target) -> (log S, T)
    # 注意 reduction='batchmean' 是在全轨迹的 token 上求均值
    loss_kl = F.kl_div(
        input=student_logprobs,   # 学生的 log 概率
        target=teacher_probs,     # 教师的真实概率分布
        reduction='batchmean'
    ) * (temperature ** 2) # 温度缩放修正
    
    # 步骤 5: 反向传播与参数更新
    loss_kl.backward()
    # optimizer.step() 
    
    return loss_kl.item()
```

> **注释对应**：代码中的 `student_model.generate` 严格对应了公式中的 $\mathbb{E}_{s_t \sim \pi_\theta}$，这正是“On-Policy”物理意义的直接体现. 而 `kl_div` 的参数顺序明确了这是一个 Reverse KL 操作. 

## 7. 局限性与边界条件 (Limitations & Boundary Conditions)

世界上没有包治百病的算法，基础 OPD 同样面临严峻的工程挑战和数学边界：

1. **强教师依赖 (Teacher Dependency)** ：
   - **前置环境要求**：你需要一个显着强于当前学生模型的 Teacher 驻留在显存中. 这在预训练千亿参数模型时是几乎不可能的(因为你找不到比自己大一个代差且还能跑得动的开源模型). 

2. **状态崩塌 (Degeneration under High Entropy)** ：
   - **失效区域**：当教师的分布在某个状态极度平滑(High Entropy，即没有一个选项具有明显统治力，所有 token 概率都在 5% 左右)时，Reverse KL 的 Mode-seeking 特性会导致灾难. 学生会“强行捏造”一个极端的概率尖峰(比如 $P_S(A)=99\%$)，因为这样能让 Reverse KL Loss 变得极小，但这种“盲目自信”其实是错误的. 

- **物理根因**：Reverse KL 的公式 $\sum Q \log \frac{Q}{P}$，只要 $Q$ 集中在 $P$ 不是零的任意一个点，即便 $P$ 很平坦，散度也会非常小. 

## 8. 演进与承上启下 (Evolution & Segue)

针对基础 OPD 极度依赖外部“强教师”(Teacher Dependency)这一最大痛点，研究界开始了激烈的自救与演进. 

如果在实际工程中，我们根本掏不出多余的几百 GB 显存去跑一个 GPT-4 级别的 Teacher 模型怎么办？既然基础 OPD 的本质是“在同一条轨迹上，用高维的认知降维打击低维的生成”，**我们可不可以使用模型自己，通过赋予更长时间或更优越的上下文，来充当自己的 Teacher 呢？**

这自然催生了 OPD 家族中极具革命性的下一个核心算法——**OPSD(在线自蒸馏，Online Self-Distillation)** . 在没有外援的情况下，模型如何做到“左脚踩右脚上天”？请见下一篇技术剖析. 

## 9. 总结与参考文献 (References)

1. **On-Policy 采样**：通过让模型在自己生成的轨迹上训练，彻底消灭了 SFT 固有的 Exposure Bias. 

2. **Dense Supervision**：每个 Token 都有教师提供的稠密概率信号，极大地降低了强化学习中 Sparse Reward 的方差，使得训练成本降低了一个数量级. 

3. **Reverse KL 目标**：采用寻找众数(Mode-seeking)的散度衡量方式，允许模型只学习教师高概率且自己也擅长的部分，避免了强行覆盖未知空间而造成的幻觉. 

**参考文献：**
- MiniLLM: Knowledge Distillation of Large Language Models (arXiv: 2306.08543). URL: https://arxiv.org/abs/2306.08543
- GKD: Generalized Knowledge Distillation (arXiv: 2306.13649). URL: https://arxiv.org/abs/2306.13649
- Qwen3 Technical Report (Alibaba Group).

---

## 2026-08 修订

上面 §1–§9 按 2026-05 原文原样留下。这一节只做三件事：把名字钉死、把 Qwen3 Table 21 的分母钉死、把 MiniLLM / GKD 当成地基而不是口号。对照专文 [4.4 On-Policy Distillation 深度解析](../../4.4-对齐技术/On-Policy-Distillation深度解析.md) 可只读；本篇不跟它文末的知乎来源。

### 10.1 名字：On-Policy Distillation，不是 Online Preference

综述 [A Survey of On-Policy Distillation for Large Language Models](https://arxiv.org/abs/2604.00626)（Song & Zheng，HTML 已开）把 OPD 写成：训练数据来自学生**当前**策略 $p_\theta$，而不是固定语料或教师生成分布。形式是

$$
\min_{\theta}\mathbb{E}_{x\sim\mathcal{D}}\,\mathbb{E}_{y\sim p_{\theta}(\cdot \mid x)}\bigl[\mathcal{L}(y,x;\theta,T)\bigr]. \tag{6}
$$

$\mathcal{L}$ 可以是散度、奖励或混合；关键是外层期望在学生自己的生成上。这和 DPO 不是一条路：DPO 优化的是成对偏好、不必在学生前缀上查教师全词表 logits。黑盒设定里可以拿 pairwise preference 当教师信号，那是 OPD 的一种**降级接口**，不是把 OPD 定义成 preference optimization。

现稿标题和 §1 把 OPD 译成「在线策略蒸馏」，方向对。错的是把缩写扩成 **Online Preference Distillation**，或把 DPO 当同义词。节首页 4.6 仍写过 “Online Preference/Policy Distillation”——本切片**不改**节首页；读者以本篇为准。

### 10.2 采样从哪来：off-policy 抄教师前缀，on-policy 在自己的前缀上挨打

Off-policy KD / SeqKD：轨迹来自数据集或教师，$y_{\lt t}$ 几乎总是「标准解前缀」。学生推理时前缀是自己刚写出的 token，一步偏了后面全是没练过的状态。GKD 把这叫 train–inference mismatch；MiniLLM 用 ExAccErr 量暴露偏差。On-policy distillation 换的是**状态从哪来**：先让 $\pi_\theta$ 自己生成，再让教师在这些前缀上给 dense 监督。

![Off-policy KD trains on teacher prefixes; OPD trains on student prefixes with teacher logits](./images/fig-on-policy-vs-off-policy-sampling.png)

> 图 1：采样从哪来。左：off-policy KD，学生只在教师（或数据集）前缀上匹配。右：OPD，学生自己采样，教师在学生前缀上给密集 logits / KL。红标 **NOT**：不是 DPO，不是 Online Preference。

**图 1 解析**

- **左，青格**：token 由教师（或固定语料）写出。学生在这些前缀上做 NLL 或 $D_{\mathrm{KL}}(p_T \Vert p_S)$。推理时一旦自己写偏，就离开了训练状态。
- **右，橙格**：token 由学生写出。教师不再重写一条满分答案，而是对同一条学生轨迹上的每个前缀打 logits。这就是「dense on student states」。
- **红标**：偏好对 $(y^+,y^-)$ 没有这条「教师在学生前缀上给分布」的结构。不要把 OPD 读成 Online Preference Distillation。
- §3 驾校类比（自己握方向盘、教练每个瞬间给分布）**讲的就是右图**。类比可留；错的是把它叫成 Online Preference，以及把「每个瞬间」理解成必须 reverse KL（见 §10.3）。

### 10.3 地基：MiniLLM 与 GKD 不是同一条梯度

两篇都是 2023-06、ICLR 2024。都叫 on-policy distillation，**on-policy 钉在不同位置**。

**MiniLLM**（[arXiv:2306.08543](https://arxiv.org/abs/2306.08543)，HTML 标题现作 *MiniLLM: On-Policy Distillation of Large Language Models*）把目标换成 reverse KL，再对 $y\sim q_\theta$ 做 on-policy 优化：

$$
\theta=\arg\min_{\theta}\operatorname{KL}[q_{\theta}\Vert p]
=\arg\min_{\theta}\Bigl[-\mathbb{E}_{x\sim p_x,\,y\sim q_{\theta}}\log\frac{p(y \mid x)}{q_{\theta}(y \mid x)}\Bigr]. \tag{7}
$$

梯度走 Policy Gradient（论文式 (2)）。$r_{t}=\log(p(y_t \mid \cdot)/q_\theta(y_t \mid \cdot))$，回报 $R_t$ 是从 $t$ 往后累加。为了稳，他们还加了：单步分解降方差、教师混合采样 $\tilde p=\alpha p+(1-\alpha)q_\theta$（文中 $\alpha=0.2$）、长度归一化（否则 $R_t$ 偏爱短句、学生会输出空回复）、以及预训练 LM 辅助损失。这是 **action on-policy**：被采样的 token 自己进 REINFORCE。

**GKD**（Agarwal et al.，[arXiv:2306.13649](https://arxiv.org/abs/2306.13649)，*On-policy Distillation of Language Models: Learning from Self-Generated Mistakes*）把自回归蒸馏看成带交互专家的模仿学习。纯 on-policy 一项是

$$
L_{\mathrm{OD}}(\theta)=\mathbb{E}_{x\sim X}\Bigl[\mathbb{E}_{y\sim p_{\mathrm{S}}(\cdot \mid x)}\bigl[\mathcal{D}_{\mathrm{KL}}\bigl(p_{\mathrm{T}}\Vert p_{\mathrm{S}}^{\theta}\bigr)(y \mid x)\bigr]\Bigr], \tag{8}
$$

其中 $\mathcal{D}_{\mathrm{KL}}(p_T \Vert p_S)(y \mid x)$ 是沿序列对 **token 级** $D_{\mathrm{KL}}(p_T(\cdot \mid y_{\lt n},x)\Vert p_S(\cdot \mid y_{\lt n},x))$ 取平均（论文式 (2)(4)）。注意两点：

1. 论文默认写出的 $D_{\mathrm{KL}}(p_T \Vert p_S)$ 是 **forward KL**（教师在前）。散度本身可选 reverse KL / $\mathrm{JSD}(\beta)$；哪一种更好，他们写成 **task-dependent**（摘要任务温度采样偏 mode-seeking，指令跟随 held-out 上 reverse KL 更好）。
2. **不对采样路径反传**（stop-gradient）。$y\sim p_S$ 只负责制造学生会走到的前缀；loss 仍是这些前缀上的全词表匹配。这是 **state on-policy**。

统一写法把 off-policy 数据按 $\lambda$ 混进来：

$$
L_{\mathrm{GKD}}(\theta)=(1-\lambda)\,\mathbb{E}_{(x,y)\sim(X,Y)}\bigl[\mathcal{D}(p_T\Vert p_S^{\theta})(y \mid x)\bigr]
+\lambda\,\mathbb{E}_{x\sim X}\Bigl[\mathbb{E}_{y\sim p_S}\bigl[\mathcal{D}(p_T\Vert p_S^{\theta})(y \mid x)\bigr]\Bigr]. \tag{9}
$$

$\lambda=0$ 退回监督 KD，$\lambda=1$ 纯学生轨迹。实验从已经 SFT 过的学生起步，不是随机初始化。

因此 §4.2「OPD 的核心是 reverse KL、同族算法如 GRPO/PPO」需要拆开：reverse KL 是 MiniLLM 的目标，不是 OPD 的定义；GKD 的 on-policy 性在状态分布，梯度更像带 stop-grad 的监督 KD。Qwen3 只写 “aligning its logits … to minimize the KL divergence”，**未点名** forward 还是 reverse。

§6 的 `F.kl_div(input=student_logprobs, target=teacher_probs)`：PyTorch 这条是 $\mathrm{KL}(\texttt{target}\Vert\exp(\texttt{input}))$，即 $\mathrm{KL}(p_T \Vert p_S)$，是 **forward KL**。注释写成 Reverse KL，与公式 (2) 也不一致。代码可当「学生轨迹 + 教师分布」的示意，不要当 MiniLLM 实现。

### 10.4 Qwen3 Table 21：分母必须写全

数字以 [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388) Table 21 为准（官方 HTML 与本库 [03-Qwen3-mineru-en.md](../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/09-Qwen3/03-Qwen3-mineru-en.md) 同行一致；中文表见 [04-Qwen3-mineru-zh.md](../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/09-Qwen3/04-Qwen3-mineru-zh.md)）。第 14 章只链不抄。

相邻段原文钉死的分母：

- 模型：**Qwen3-8B**
- 起点：同一个 **off-policy distilled 8B checkpoint**（不是「经过基础训练的」任意 checkpoint）
- 任务：正文写 **只比 math + code-related queries**（*For simplicity, we focus solely on math and code-related queries in this comparison.*）
- 括号里是 **pass@64**
- 教师（Strong-to-Weak 阶段）：Qwen3-32B 或 Qwen3-235B-A22B；学生在 `/think` 或 `/no_think` 下自己生成，再对齐教师 logits

| Method | AIME'24 | AIME'25 | MATH-500 | LiveCodeBench v5 | MMLU-Redux | GPQA-Diamond | GPU Hours |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Off-policy Distillation | 55.0 (90.0) | 42.8 (83.3) | 92.4 | 42.0 | 86.4 | 55.6 | — |
| + Reinforcement Learning | 67.6 (90.0) | 55.5 (83.3) | 94.8 | 52.9 | 86.9 | 61.3 | 17,920 |
| + On-policy Distillation | 74.4 (93.3) | 65.5 (86.7) | 97.0 | 60.3 | 88.3 | 63.3 | 1,800 |

1800 / 17920 ≈ 1/10 GPU hours，是**这一行对照**的算术，不是「所有后训练任务都用 1/10 算力超过 RL」。AIME'24：OPD **74.4**（pass@64 **93.3**）对 RL **67.6**（**90.0**）。报告还写：蒸馏后 AIME'24 / AIME'25 的 pass@64 相对起点升高，RL **没有**改善 pass@64。Off-policy 行的 GPU Hours 是 **破折号**，不是 0。

**未找到**：现稿 §2「约 150 个 steps（约 77K prompts）」在 Table 21 及紧邻段落里没有。不当金句，也不从别的表猜进来。

§2 其余需要点名的句子：

> 「从一个经过基础训练的 Checkpoint 出发」→ 错。表 caption 与相邻段都是 off-policy distilled 8B。
>
> 「OPD 用大约十分之一的 RL 算力，做到了比 RL 显著更高的上限分数。这种在算力经济学上的降维打击，使得 OPD 成为近两年(2025-2026)所有闭源/开源大厂后训练 pipeline 中不可或缺的核心组件。」→ 前半只在 Table 21 的 math+code、Qwen3-8B 对照上成立；后半是宣传句，本篇不采用。

### 10.5 失效：没有外部教师，这套不成立

基础 OPD 预设一个**可查询的教师**：至少能在学生前缀上给出 token 分布或 logprob。没有这名教师（训练自己已经是 frontier、掏不出更强开源模型、或不愿把教师常驻显存），式 (6)–(9) 没有监督源。那是另一条线——用特权上下文或自博弈当教师，见 [02-OPSD-参考解自蒸馏](../02-OPSD-参考解自蒸馏/02-OPSD-参考解自蒸馏.md)。本切片不改 02。

其它边界（论文里有、现稿 §7 只写了一部分）：

| 现象 | 原因 | 说明 |
| --- | --- | --- |
| 学生还不会说话 | GKD 假定学生已经 SFT，能给出教师评得了的序列 | 随机初始化上做纯 on-policy，教师反馈会落在垃圾前缀上 |
| 空回复 / 复读 | MiniLLM：未归一化的 $R_t$ 偏爱短句；小学生 reward hacking | 他们用 length norm、teacher-mixed sampling、clip |
| 教师在学生胡写的前缀上也不准 | 综述对 DAgger 界的限定：专家要在学习者状态上仍接近最优 | 前缀严重 OOD 时，强迫对齐教师条件分布可能更不稳 |
| Reverse KL 在高熵处捏尖峰 | 现稿 §7.2 方向对 | 这是 MiniLLM 目标的失效，不是 GKD 选 forward KL / JSD 时的同一件事 |
| 把 Table 21 套到通用 RL | 表只含 math + code-related queries | 指令遵循 / Agent 那条线 Qwen3 另有 Stage 4，不是这张表 |

下一篇（无外部教师）：[02-OPSD](../02-OPSD-参考解自蒸馏/02-OPSD-参考解自蒸馏.md)。

## 参考文献

1. Gu, Dong, Wei, Huang. *MiniLLM*（[arXiv:2306.08543](https://arxiv.org/abs/2306.08543) / [HTML](https://arxiv.org/html/2306.08543)）。reverse KL 式 (1)、on-policy 梯度式 (2)、teacher-mixed sampling、Algorithm 1。
2. Agarwal, Vieillard, Zhou, Stanczyk, Ramos, Geist, Bachem. *On-policy Distillation of Language Models: Learning from Self-Generated Mistakes*（GKD；[arXiv:2306.13649](https://arxiv.org/abs/2306.13649) / [HTML](https://arxiv.org/html/2306.13649)）。$L_{\mathrm{OD}}$ 式 (4)、$L_{\mathrm{GKD}}$、$\lambda$、不对采样反传。
3. Yang et al. *Qwen3 Technical Report*（[arXiv:2505.09388](https://arxiv.org/abs/2505.09388) / [HTML](https://arxiv.org/html/2505.09388)）。§4.5 Strong-to-Weak；Discussion 中 On-Policy Distillation 段 + **Table 21**。本库 mineru：[en](../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/09-Qwen3/03-Qwen3-mineru-en.md) / [zh](../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/09-Qwen3/04-Qwen3-mineru-zh.md)。
4. Song & Zheng. *A Survey of On-Policy Distillation for Large Language Models*（[arXiv:2604.00626](https://arxiv.org/abs/2604.00626) / [HTML](https://arxiv.org/html/2604.00626v3)）。式 (1) 的 on-policy 定义；teacher-free 指向 OPSD。

数字以 Table 21 与两篇地基论文公式为准。图 1 是示意图。§2 的 150 steps / 77K prompts：未找到一手。
