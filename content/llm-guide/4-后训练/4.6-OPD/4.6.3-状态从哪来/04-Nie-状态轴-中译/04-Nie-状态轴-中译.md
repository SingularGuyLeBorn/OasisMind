---
title: "04 · 精译：后训练看的是状态，不是 token"
date: 2026-08-30
tags: [OPD, SFT, RL, 状态分布, 精译]
as_of: 2026-08-30
category: LLM 指南
---

# 后训练看的是状态，不是 token：SFT、RL 与 On-Policy Distillation 的状态分布视角

> 作者：Dong Nie（Independent Researcher, dongnie@cs.unc.edu）  
> arXiv：[2605.22731](https://arxiv.org/abs/2605.22731) v1，2026-05-21  
> PDF：[`../pdfs/2605.22731.pdf`](../pdfs/2605.22731.pdf) · [03 英文誊录](../03-Nie-状态轴-英文/03-Nie-状态轴-英文.md)  
> 结构保真中译。公式编号、Table 数字、参考文献条目未改。

## 摘要

大型语言模型的后训练方法，如监督微调（SFT）、强化学习（RL）和蒸馏，通常通过损失函数来分析：最大似然、策略梯度、forward KL、reverse KL，或相关的目标级变体。我们研究一个互补因素：监督施加其上的**状态分布**。对自回归策略而言，一个状态是 prompt 加上已生成前缀。SFT 在固定的数据集状态上训练，而 RL 和 on-policy distillation（OPD）在当前学习器诱导的状态上训练。我们把后训练形式化为状态分布塑形，并用 Qwen3-0.6B-Base 在 GSM8K 上做了一项受控小规模研究，以 TruthfulQA 和 MMLU 作保持评估。结果显示三种现象。第一，温和 SFT 提升 GSM8K 且几乎不遗忘，加压 SFT 则造成显著保持损失。第二，从退化 SFT 教师做 OPD，学生在 GSM8K、TruthfulQA 和 MMLU 上都超过该教师，尽管教师是其唯一监督来源。第三，一次轻量 on-policy RL 提升 GSM8K 同时保住保持。这些结果支持以后训练为中心的状态观点：训练状态的来源与局部性，可以和监督信号的形式同样重要。代码见 https://github.com/ginobilinie/unifyPostTraining。

## 1 引言

后训练是预训练语言模型变成一组面向人的行为的阶段。监督微调（SFT）教模型模仿示范，强化学习（RL）用奖励优化模型采样出的输出，蒸馏把行为从教师转到学生。这些方法不是实现细节：它们决定模型是否跟随指令、解推理题、拒绝不安全请求、保住事实知识，以及在训练数据的窄分布之外是否仍然稳健。

尽管实践上如此重要，几个基本后训练现象用通常词汇仍不好解释。SFT 简单、数据效率高，但在激进专项化下会造成灾难性遗忘或脆弱行为。RL 常常用稀疏或带噪奖励优化，却能给出出人意料的稳定改进。蒸馏通常被理解成复制教师，学生有时却能追平甚至超过教师。这些观察提出同一个问题：训练过程的什么性质，决定了后训练模型是局部改进，还是破坏性地漂移？

标准答案盯着目标。SFT 是示范上的最大似然；RL 是带策略梯度式更新的奖励最大化；蒸馏是教师与学生 token 分布之间的散度。目标级分析不可或缺，但它藏起另一根变化轴：**目标施加在哪里**。在自回归模型里，一次 token 预测总是条件于一个状态，即 prompt 加上已生成前缀。因此两个方法即便 token 级信号相似，只要训练状态分布不同，结果就可以不同。

这一区分对 SFT、RL 和 on-policy distillation（OPD）尤其锋利。SFT 在固定数据集前缀上施加稠密监督。这些前缀未必是当前模型会访问的状态，尤其在模型开始自己犯错之后。RL 则从当前策略采样轨迹，在模型实际访问的状态上施加由奖励导出的更新。OPD 把状态来源和信号来源拆开：学生采样状态，教师提供局部指导。从这个角度看，即便损失写成监督式师生目标，OPD 也更接近 RL，而不是离线蒸馏。

我们主张，这种状态来源上的区分有助于同时解释稳定性和师生反转。如果教师因为访问不良轨迹而全局行为差，当监督是在学生自己的状态上查询时，学生不必继承那些失败的全部。类似地，RL 可以稳定，不只因为 KL 惩罚或保守目标，而是因为它的更新天然局部于学习器当前的轨迹。核心问题不只是信号是标签、奖励还是 logit 分布；而是该信号与它所施加的状态分布之间的相互作用。

我们考察如下命题：

后训练行为由监督信号与训练状态分布的相互作用支配；on-policy 状态监督可以保住局部性，并允许学生超过退化教师。

我们在受控单 GPU 设定下用 Qwen3-0.6B-Base 检验这一命题。GSM8K 作目标任务，TruthfulQA 和 MMLU 测保持。实验有意做小，但对照是清楚的。温和 SFT 提升 GSM8K 且几乎不遗忘，说明 SFT 并非天生破坏。加压 SFT 则产出一个退化教师：目标准确率和保持都下降。从该退化教师做 OPD，学生在 GSM8K、TruthfulQA 和 MMLU 上都超过教师。最后，一次轻量 on-policy RL 提升 GSM8K 同时保住保持。这些结果不支持「一个标量漂移度量就能完全解释遗忘」的简单主张。它们支持更精确的状态中心主张：训练状态的来源、局部性、以及对学习器的依赖性，是后训练行为的中心。

我们做三点贡献：

1. 在自回归后训练的共同状态分布视角下形式化 SFT、RL 和 OPD。
2. 实现一条受控单 GPU 实验管线，测量目标准确率、保持、遗忘和 rollout 状态漂移。
3. 提供证据：OPD 可以超过退化 SFT 教师；on-policy RL 提升目标表现且几乎不损失保持。

## 2 状态分布视角

### 2.1 自回归状态

自回归语言模型定义策略

$$
\pi_{\theta}(y_{t}\mid x,y_{<t}). \tag{1}
$$

我们称

$$
s_{t}=(x,y_{<t}) \tag{2}
$$

为状态。下一个 token $y_{t}$ 是动作，一段生成答案是穿过状态的一条轨迹。令 $d^{\pi}(s)$ 表示策略 $\pi$ 在 prompt 分布上诱导的状态访问分布。

这个定义有意简单。状态不是隐层激活，不是一条训练样本，也不是孤立的单个 token 位置。它是 next-token 策略所作用的完整条件上下文。在 LLM 里，同一个目标 token 会因它所在的前缀状态而意义非常不同。例如，在正确推理链之后预测一个数字，和在自相矛盾的链之后预测同一个数字，是不同的策略更新，因为它们碰到不同的条件上下文。

给定 prompt 分布 $\rho(x)$，策略诱导一条轨迹

$$
\tau=(s_{1},y_{1},s_{2},y_{2},\ldots,s_{T},y_{T}), \tag{3}
$$

其中 $s_{t+1}=(x,y_{\leq t})$。诱导状态分布可以非正式写成

$$
d^{\pi}(s)=\mathbb{E}_{x\sim\rho,\,y_{<t}\sim\pi}\left[\frac{1}{T}\sum_{t=1}^{T}\mathbf{1}\{s_{t}=s\}\right]. \tag{4}
$$

实践中这个分布从未被精确观察到；我们用 rollout 和采样前缀来近似。重要的是：策略一变，$d^{\pi}$ 就变。因此后训练不只改变固定上下文上的 token 概率；它改变模型未来将访问的上下文。

### 2.2 两根轴：状态来源与信号来源

一个后训练方法可以分解成两个选择。第一是状态来源：上下文 $s$ 从哪来。第二是信号来源：在那些上下文上用什么目标、奖励或分布来更新策略。许多讨论把这两根轴压进算法名字里。例如 SFT 意味着数据集状态加人类或合成答案；RL 意味着策略状态加奖励；蒸馏意味着教师信号，但状态来源可以是教师 rollout、数据集 prompt、或学生 rollout。

把轴拆开，才能看清为什么目标看起来相似的方法行为可以不同。在教师生成的前缀上做师生 KL，是离线模仿问题。同一教师在学生生成的前缀上被查询，是 on-policy 校正问题。同样，黄金前缀上的 token 交叉熵，不等价于学习器诱导前缀上的 token 交叉熵，即便两种损失都是监督的。状态来源决定信号施加在策略空间的哪个区域。

### 2.3 SFT：Off-Policy 状态拟合

SFT 在数据集状态上最小化 token 损失：

$$
\mathcal{L}_{\mathrm{SFT}}(\theta)=-\mathbb{E}_{s\sim d_{\mathrm{data}}}\log\pi_{\theta}(y^{\star}\mid s). \tag{5}
$$

监督是稠密的，但状态是 off-policy 的。如果数据集轨迹离模型自己的 rollout 很远，更新可能作用在模型无法可靠到达或从中恢复的区域。这就是熟悉的暴露偏差，改写成状态分布错配。

SFT 的 off-policy 性质有两个后果。第一，当数据集状态接近有用的模型状态时，它可以非常高效：每个 token 提供稠密学习信号，模型可以不付昂贵采样就获得一项能力。这就是我们在温和 SFT run 里看到的。第二，当数据集轨迹分布很窄、或训练压力过高时，SFT 会脆。模型被反复推向在示范前缀上成立的行为，却没有被显式训练从自己的前缀里恢复。在激进专项化下，这可能以伤害无关能力、甚至伤害目标任务的方式修改策略。

在这个观点里，灾难性遗忘不是最大似然单独造成的。它出现在稠密 off-policy 更新把策略移到与模型自己未来状态分布相互作用很差的区域时。因此相关问题不只是 SFT 用的是 forward KL 还是 token 交叉熵，而是数据集状态是否与学习器诱导状态相容。

### 2.4 RL：On-Policy 局部改进

RL 从当前策略采样轨迹，用奖励更新模型：

$$
\max_{\theta}\mathbb{E}_{s\sim d^{\pi_{\theta}},y\sim\pi_{\theta}(\cdot|s)}[r(s,y)]. \tag{6}
$$

奖励可以稀疏，但状态是 on-policy 的。这使 RL 成为局部改进程序：它修改当前模型实际访问处的行为。

on-policy 性质给了 RL 一种与 SFT 不同的失效模式。RL 可以样本效率低，因为奖励可能稀疏且高方差，但其更新扎根于学习器自己的 rollout。如果模型经常进入某种推理模式，奖励反馈就打在那里。如果它从不访问数据集式的前缀，RL 不会直接把那个前缀按进策略。KL 惩罚、裁剪和参考模型可以进一步约束更新，但更基本的局部性来自状态来源本身。

这有助于解释为什么即便奖励弱于一份完整监督答案，RL 仍能保住能力。奖励信号也许只说一条轨迹成没成功，但轨迹是从当前模型采样的。更新因此作用在已经可达的状态上，使这次改变成为局部策略改进，而不是对外部分布的全局模仿。

### 2.5 OPD：教师引导的 On-Policy 学习

在 OPD 中，学生采样状态，教师提供监督：

$$
\mathcal{L}_{\mathrm{OPD}}(\theta)=\mathbb{E}_{s\sim d^{\pi_{S}}}\left[D(\pi_{T}(\cdot|s)\,\|\,\pi_{S}(\cdot|s))\right]. \tag{7}
$$

在我们最强的 OPD 变体里，教师从学生状态生成短续写，学生用交叉熵学习这些续写。这类似于 DAgger 式学习：学习器控制状态分布，类专家来源提供局部修复信号 [22]。

OPD 有用，是因为它把常常捆在一起的两个性质拆开。它保住蒸馏的稠密监督，但把状态来源从教师或数据集移到学生。这使得 OPD 在「学生决定哪些前缀需要指导」这个意义上是 on-policy 方法。教师不是被复制成完整轨迹生成器；它被查询为学生状态上的局部条件策略。

这一区分解释了学生如何能超过教师。教师的测得表现同时取决于其局部条件分布和它倾向于访问的状态。如果教师学会了有用的局部修复，但也访问差轨迹，OPD 学生可以从修复中受益，而不必完整继承教师的轨迹分布。学生实际上可以问：「给定我在哪，教师下一步会做什么？」而不是「教师会访问哪些状态来代替我？」

还有一条实践教训。一步 next-token KL 对推理任务可能太弱，因为它只在每个前缀上提供局部分布，并不教如何完成一条轨迹。我们的实验里，一步 OPD 坍缩了。基于续写的 OPD，由教师从学生状态提供短 rollout，给出更密的轨迹级监督，同时保住 on-policy 状态来源。

## 3 统一框架：作为状态条件监督的后训练

我们把后训练看成反复变换模型的状态分布：

$$
d_{k+1}(s)=\mathcal{T}\big(d_{k}(s),\mathrm{signal}\big). \tag{8}
$$

不同算法既在状态来源上变，也在信号来源上变。

更显式地，一步后训练可以写成三个操作：

$$
\begin{align}
s &\sim q_{k}(s), \tag{9} \\
z &\sim \mathcal{S}(s), \tag{10} \\
\theta_{k+1} &= \theta_{k}-\eta\nabla_{\theta}\ell\big(\pi_{\theta}(\cdot|s),z\big). \tag{11}
\end{align}
$$

其中 $q_{k}$ 是训练状态分布，$\mathcal{S}$ 是信号提供者，$z$ 是监督对象：一个 token、续写、奖励、偏好或分布。得到的策略 $\pi_{\theta_{k+1}}$ 再诱导新的 rollout 分布 $d^{\pi_{\theta_{k+1}}}$。因此 $q_{k}$ 的算法选择是中心。在 SFT 里，$q_{k}=d_{\mathrm{data}}$，不依赖当前学习器。在 RL 里，$q_{k}=d^{\pi_{\theta_{k}}}$。在 OPD 里，即便信号来自 $\pi_{T}$，$q_{k}=d^{\pi_{S,k}}$。

这一写法拆开四个常常被混在一起的问题：

| Method | Training state source | Supervision signal |
| --- | --- | --- |
| SFT | Dataset trajectories | Gold tokens |
| Offline KD | Teacher trajectories | Teacher logits/tokens |
| OPD | Student trajectories | Teacher logits/continuations |
| RL | Current policy trajectories | Reward |
| DAgger | Learner trajectories | Expert actions |

表 1：常见后训练方法的状态来源视角。

1. 更新打在哪里？由状态来源 $q_{k}$ 决定。
2. 提供了什么信息？由信号来源 $\mathcal{S}$ 决定。
3. 信号有多密？Token 标签和续写是稠密的；精确答案奖励是稀疏的。
4. 策略能走多远？由学习率、adapter 秩、KL 惩罚、裁剪和优化细节控制。

我们的主张主要关于第一个问题。目标设计重要，但若不指定目标在其上求值的状态分布，它就是不完整的。

这一观点预测：使用学习器诱导状态的方法，即便监督来源相似或更弱，也可以与 off-policy 模仿行为不同。特别是，如果教师的错误耦合于教师自己的状态分布，而不是完全编码在它对学生状态的局部响应里，学生就可以超过教师。

### 3.1 预测

框架给出若干定性预测。

#### P1：Off-policy 压力在加压下可以造成遗忘。

当稠密监督更新被反复施加在窄的外部状态分布上，模型可能离开通用行为。这并不意味着 SFT 总会遗忘；当数据集状态与基座策略相容时，温和 SFT 可以稳定。预测是条件的：遗忘应当出现在 off-policy 压力足够强、或足够错配时。

#### P2：On-policy 方法应当保住局部性。

RL 和 OPD 应当常常比加压 off-policy 训练更好地保住能力，因为它们在学习器诱导状态上施加更新。这不保证每个度量下标量漂移都低，但预测更新更可能与模型实际能到达并修复的状态相关。

#### P3：学生可以超过教师。

如果教师的失败部分是轨迹分布失败，那么在自己状态上训练的学生可以超过教师。当教师仍能提供有用的局部指导、但全局 rollout 行为已经退化时，OPD 应当最有效。

#### P4：标量漂移不够。

基座与后训练 rollout 之间的分布距离应当有用，但不能完全刻画训练动态。两个方法可以测得相似的漂移，却在哪些状态收到监督、以及这些状态对学习器有多可局部恢复上不同。因此漂移应当连同状态来源和信号密度一起解读。

## 4 实验设定

#### 模型与硬件。

全部实验使用 Qwen3-0.6B-Base 加 LoRA adapters [12]，单张 RTX 3090 24GB。因为模型是基座模型，我们用普通 GSM8K 风格 prompt，不用 chat 模板。

#### 目标与保持任务。

目标任务是 GSM8K [6]。保持用 TruthfulQA 选择题 [15] 和一份选定的 MMLU 子集 [10] 测量。基座分数为 GSM8K 0.448、TruthfulQA 0.300、MMLU 0.436。

#### 方法。

我们评估温和 SFT、加压 SFT、OPD 变体和轻量 on-policy RL。温和 SFT 使用 GSM8K SFT 数据，产出非退化教师。加压 SFT 使用五个 epoch、学习率 $5\times 10^{-4}$、LoRA rank 64、LoRA alpha 128，有意探测遗忘。OPD 采样学生状态，从教师续写训练。RL 在 GSM8K rollout 上使用组相对精确答案奖励。

#### 度量。

对保持任务，遗忘是

$$
F=\mathrm{Score}_{\mathrm{base}}-\mathrm{Score}_{\mathrm{post}}. \tag{12}
$$

保持比是 $\mathrm{Score}_{\mathrm{post}}/\mathrm{Score}_{\mathrm{base}}$。我们报告 TruthfulQA 和 MMLU 上的平均遗忘和平均保持。

#### 状态漂移。

对每个训练后的模型，我们在固定 prompt 集上采样 rollout，收集前缀状态 $s_{t}=(x,y_{<t})$。我们用轻量词汇特征表示嵌入状态，并报告带 RBF 核的最大均值差异（MMD）[9]。我们也计算质心距离、切片 Wasserstein 距离 [19] 和词汇 Jaccard 距离，但以 MMD 作为主标量漂移度量。

## 5 结果

### 5.1 SFT 可以温和，也可以破坏

表 2：主结果。GSM8K 是目标任务；TruthfulQA 和 MMLU 是保持任务。遗忘和保持在 TruthfulQA 和 MMLU 上平均。

| Run | GSM8K | TruthfulQA | MMLU | MMD | Forgetting | Retention |
| --- | --- | --- | --- | --- | --- | --- |
| Base | 0.448 | 0.300 | 0.436 | – | – | – |
| Mild SFT | 0.512 | 0.295 | 0.444 | 0.00956 | -0.0015 | 1.0008 |
| Stress SFT | 0.420 | 0.245 | 0.364 | 0.01093 | 0.0635 | 0.8258 |
| OPD from mild SFT | 0.512 | 0.290 | 0.434 | 0.01470 | 0.0060 | 0.9810 |
| OPD from stress SFT | 0.466 | 0.275 | 0.430 | 0.01092 | 0.0155 | 0.9515 |
| On-policy RL | 0.472 | 0.290 | 0.442 | 0.01098 | 0.0020 | 0.9902 |

温和 SFT 把 GSM8K 从 0.448 提到 0.512，保持几乎不损失。这是重要的阴性对照：在我们的设定里 SFT 并不必然遗忘。然而加压 SFT 造成显著保持退化：TruthfulQA 从 0.300 落到 0.245，MMLU 从 0.436 落到 0.364。其平均保持比是 0.8258。有意思的是，加压 SFT 也把 GSM8K 降到 0.420，表明过于激进的 off-policy 训练可以同时伤害通用行为和目标行为。

### 5.2 OPD 可以超过退化教师

最清楚的 OPD 结果用加压 SFT 模型当教师。教师是退化的：GSM8K 0.420，TruthfulQA 0.245，MMLU 0.364。从该教师做 OPD 得到 GSM8K 0.466、TruthfulQA 0.275、MMLU 0.430。因此尽管以该教师为唯一监督来源，学生在所有测得任务上都超过教师。

这支持如下主张：教师行为不是作为单个全局对象被转移的。学生在从自己策略采样的状态上收到局部指导。当这些状态不同于教师成问题的轨迹分布时，学生可以避免继承一部分教师失败。

### 5.3 RL 提供 On-Policy 奖励点

轻量 RL run 把 GSM8K 从 0.448 提到 0.472，同时保住 TruthfulQA 0.290 和 MMLU 0.442。其平均遗忘只有 0.0020。这与把 RL 看成 on-policy 局部改进方法的观点一致：它在策略采样状态处改变行为，并不要求大的 off-policy 移动。

### 5.4 漂移幅度不是全部故事

我们最初的假说是标量状态漂移会强烈解释遗忘。数据给出更细致的结论。加压 SFT 和从加压教师做的 OPD 有几乎相同的 MMD 漂移，0.01093 和 0.01092，但保持比非常不同，0.8258 和 0.9515。类似地，RL 有可比的 MMD 漂移 0.01098，遗忘却小得多。

因此，证据不支持本小设定里「更大 MMD 意味着更多遗忘」这种简单标量定律。它支持状态来源主张：训练状态的质量、局部性和对学习器的依赖性重要。只测 rollout 分布之间的距离，可能错过更新是否施加在学习器可局部恢复的状态上。

## 6 讨论

#### 目标级分析不完整。

加压 SFT 与从加压教师做的 OPD 之间的对照，很难只用监督来源来解释。两者最终都由同一退化教师 / 数据行为塑形，但 OPD 把监督施加在从学生采样的状态上。这改变了学习问题。

#### On-policy 稠密塑形。

成功的 OPD 变体用的是教师续写，而不是一步 logit 匹配。我们的 run 里一步 OPD 严重坍缩，GSM8K 到 0.040。基于续写的 OPD 恢复了目标表现。这提示一条实践配方：把 on-policy 采样和稠密的、轨迹级局部监督合在一起。

#### 局限。

本研究是小规模的：一个基座模型、一个目标数据集、LoRA adapters、有限的保持任务、轻量漂移估计器。RL 训练器是最小 on-policy GRPO 风格实现，而不是全规模 verl PPO 或 GRPO 设定。我们的漂移度量用词汇特征，而不是隐状态或编码器嵌入。因此结果应当读成对机制假说的证据，而不是基准主张。

## 7 相关工作

#### 后训练目标。

语言模型后训练通常通过所用优化目标来描述。SFT 典型地被写成指令示范上的最大似然学习。RLHF 及相关方法用学到的或可验证的奖励优化模型样本 [5, 27, 26, 18]。策略梯度后训练通常建立在 PPO 风格的保守策略优化上 [24]，近期推理系统也使用可验证奖励和组相对更新 [25]。DPO 这类偏好优化方法去掉显式在线 RL 环，把偏好学习写成监督目标 [20]；相关工作研究更广的偏好优化损失族 [2]。这种以目标为中心的观点澄清了许多算法权衡，但可能模糊目标施加其上的状态分布的作用。我们的工作让目标保持可见，但把训练状态来源当成单独一根轴。

#### 暴露偏差与模仿学习。

数据集状态与学习器诱导状态的区分，在模仿学习里有很长历史。行为克隆在专家轨迹上训练，当学习器访问示范中没有的状态时会受复合误差之苦。DAgger 通过收集学习器诱导状态并在那些状态上查询专家来处理这一点 [22]。序列预测中的暴露偏差捕捉相关错配：在黄金前缀上训练，在模型生成前缀上测试 [3, 21]。我们把这一视角改写到 LLM 后训练：SFT 类似于固定轨迹上的行为克隆，而 RL 和 OPD 在当前学习器诱导的状态上施加信号。

#### 知识蒸馏。

知识蒸馏通过软目标、logits 或生成数据把行为从教师转到学生 [4, 11]。序列级蒸馏和压缩语言模型蒸馏表明，生成的教师输出可以是有效训练数据 [13, 23]，综述按知识表示和所优化散度组织许多变体 [8]。我们的 OPD 实验隔离另一个因素：教师可以提供信号，但学生可以控制状态分布。这解释了学生何必继承退化教师的全部失败，尤其当教师监督是在学生状态上查询、而不是从教师轨迹复制时。

#### 灾难性遗忘与保持。

灾难性遗忘在持续学习里被研究为在新任务上训练时丢失先前能力 [17, 7, 14, 16]。在 LLM 后训练里，遗忘常常被测成专项化之后在宽保持任务上的退化。我们的实验沿这条经验传统，在 GSM8K 后训练之后测 TruthfulQA 和 MMLU。结果表明遗忘不只是更新幅度或数据集大小的事：激进 off-policy SFT 可以伤害保持，而 on-policy RL 和 OPD 在可比的目标任务压力下可以保住更多能力。

#### 状态漂移测量。

分布偏移常用嵌入距离、分类器双样本检验、MMD [9] 或 Wasserstein 风格度量来量化 [19, 1]。我们用 rollout 状态 MMD 作为状态漂移的紧凑代理，同时跟踪其他词汇分布统计。我们的结果显示这类标量度量的价值和限度：加压 SFT 和从加压教师做的 OPD 有几乎相同的 MMD 漂移，但保持非常不同。这推动更丰富的状态分布分析：不仅看模型 rollout 走了多远，还看哪些训练状态收到监督、以及它们对学习器是否局部可达。

## 8 结论

我们提出后训练的状态分布视角。在这个视角里，SFT 是 off-policy 状态拟合，RL 是 on-policy 奖励引导改进，OPD 是教师引导的 on-policy 学习。实验显示 OPD 可以超过退化 SFT 教师，on-policy RL 提升目标任务且几乎不损失保持。证据把原先的命题说得更准：后训练不只关于 token 目标或标量分布漂移；它关于监督施加在模型状态空间的哪里。

## 参考文献

- [1] M. Arjovsky, S. Chintala, and L. Bottou (2017) Wasserstein generative adversarial networks. In International conference on machine learning, pp. 214–223.
- [2] M. G. Azar, Z. D. Guo, B. Piot, R. Munos, M. Rowland, M. Valko, and D. Calandriello (2024) A general theoretical paradigm to understand learning from human preferences. In International Conference on Artificial Intelligence and Statistics, pp. 4447–4455.
- [3] S. Bengio, O. Vinyals, N. Jaitly, and N. Shazeer (2015) Scheduled sampling for sequence prediction with recurrent neural networks. Advances in neural information processing systems 28.
- [4] C. Buciluǎ, R. Caruana, and A. Niculescu-Mizil (2006) Model compression. In Proceedings of the 12th ACM SIGKDD international conference on Knowledge discovery and data mining, pp. 535–541.
- [5] P. F. Christiano, J. Leike, T. Brown, M. Martic, S. Legg, and D. Amodei (2017) Deep reinforcement learning from human preferences. Advances in neural information processing systems 30.
- [6] K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, et al. (2021) Training verifiers to solve math word problems. arXiv:2110.14168.
- [7] R. M. French (1999) Catastrophic forgetting in connectionist networks. Trends in cognitive sciences 3 (4), pp. 128–135.
- [8] J. Gou, B. Yu, S. J. Maybank, and D. Tao (2021) Knowledge distillation: A survey. International journal of computer vision 129 (6), pp. 1789–1819.
- [9] A. Gretton, K. M. Borgwardt, M. J. Rasch, B. Schölkopf, and A. Smola (2012) A kernel two-sample test. The journal of machine learning research 13 (1), pp. 723–773.
- [10] D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt (2020) Measuring massive multitask language understanding. arXiv:2009.03300.
- [11] G. Hinton, O. Vinyals, and J. Dean (2015) Distilling the knowledge in a neural network. arXiv:1503.02531.
- [12] E. J. Hu, Y. Shen, P. Wallis, Z. Allen-Zhu, Y. Li, S. Wang, L. Wang, W. Chen, et al. (2022) LoRA: Low-rank adaptation of large language models. ICLR.
- [13] Y. Kim and A. M. Rush (2016) Sequence-level knowledge distillation. In EMNLP, pp. 1317–1327.
- [14] J. Kirkpatrick et al. (2017) Overcoming catastrophic forgetting in neural networks. PNAS 114 (13), pp. 3521–3526.
- [15] S. Lin, J. Hilton, and O. Evans (2022) TruthfulQA: Measuring how models mimic human falsehoods. In ACL, pp. 3214–3252.
- [16] D. Lopez-Paz and M. Ranzato (2017) Gradient episodic memory for continual learning. NeurIPS 30.
- [17] M. McCloskey and N. J. Cohen (1989) Catastrophic interference in connectionist networks: The sequential learning problem. In Psychology of learning and motivation, Vol. 24, pp. 109–165.
- [18] L. Ouyang et al. (2022) Training language models to follow instructions with human feedback. NeurIPS 35, pp. 27730–27744.
- [19] J. Rabin, G. Peyré, J. Delon, and M. Bernot (2011) Wasserstein barycenter and its application to texture mixing. In SSVM, pp. 435–446.
- [20] R. Rafailov et al. (2023) Direct preference optimization: Your language model is secretly a reward model. NeurIPS 36, pp. 53728–53741.
- [21] M. Ranzato, S. Chopra, M. Auli, and W. Zaremba (2015) Sequence level training with recurrent neural networks. arXiv:1511.06732.
- [22] S. Ross, G. Gordon, and D. Bagnell (2011) A reduction of imitation learning and structured prediction to no-regret online learning. In AISTATS, pp. 627–635.
- [23] V. Sanh, L. Debut, J. Chaumond, and T. Wolf (2019) DistilBERT, a distilled version of BERT. arXiv:1910.01108.
- [24] J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov (2017) Proximal policy optimization algorithms. arXiv:1707.06347.
- [25] Z. Shao et al. (2024) DeepSeekMath: Pushing the limits of mathematical reasoning in open language models. arXiv:2402.03300.
- [26] N. Stiennon et al. (2020) Learning to summarize with human feedback. NeurIPS 33, pp. 3008–3021.
- [27] D. M. Ziegler et al. (2019) Fine-tuning language models from human preferences. arXiv:1909.08593.
