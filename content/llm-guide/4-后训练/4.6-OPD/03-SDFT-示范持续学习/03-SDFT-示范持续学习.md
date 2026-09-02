---
title: "03 · SDFT:示范持续学习"
date: 2026-05-16
tags: [SDFT, Self-Distillation, Continual Learning, OPD, 知识蒸馏, 后训练, IRL]
as_of: 2026-08-30
---

# 03 · SDFT:示范持续学习

## 1. 背景与核心痛点 (Background & Pain Points)

**家谱定位**: 本算法是 OPD(在线策略蒸馏)与 OPSD(在线自蒸馏)的自然延伸,它致力于将自蒸馏思想引入到一个极其恶劣且常见的真实工业场景--持续学习(Continual Learning). 

**前车之鉴**: 在上一篇<02-OPSD>中,我们证明了模型可以通过查看标准答案(开卷考)来教导未看答案的自己. 然而,在真实的工业迭代中,我们往往需要让一个已经部署的大语言模型**源源不断地学习新技能**(例如: 今天学医学问答,明天学外部 API 工具调用,后天学写特定的 SQL). 
如果你使用传统的监督微调(SFT)向模型持续灌输这些新知识,立刻就会遭遇深度学习领域最绝望的诅咒: **灾难性遗忘(Catastrophic Forgetting)** . 模型一旦在新任务上拟合,其原本的通用常识,长链条推理能力就会迅速崩溃. 更可怕的是,如果直接用过于简短的人工示范去微调一个带有思维链(CoT)的模型,SFT 会直接"压塌"模型的思考长度,使其退化为盲目抢答的复读机. 

**核心动机**: SDFT(Self-Distillation Fine-Tuning)的诞生,正是为了应对"新任务注入必然破坏旧有分布"的现实约束. 它提出了一个天才的设想: 如果我们只有极少量的示范数据(Demonstrations),且无法承担训练外部奖励模型(Reward Model)的高昂成本,能不能利用 OPSD 的自蒸馏机制,让模型在**不破坏自身原有推理风格的前提下,优雅地吸收新知识**?

## 2. 为什么重要 (Significance)

在<Self-Distillation Enables Continual Learning (arXiv: 2601.19897)>的实证中,SDFT 展现出了令人侧目的性能保全能力: 

当让模型按顺序连续学习 Tool Use(工具调用),Science Q&A(科学问答)和 Medical(医学)三个领域的技能时: 
- 传统的 SFT: 在学习 Tool Use 时,旧任务平均分从 65.5 暴跌到 56.0. 

- **SDFT**: Tool Use 新任务准确率达到 70.6%(甚至略超 SFT),**同时旧能力平均分死死咬住在 65.4%**,几乎完美抵御了遗忘. 

更令人震惊的是它对**推理模型(Reasoning Model)的保护**. 当在没有中间推理步骤标注的数据上训练时: 
- 基础模型的平均生成长度为 4612 tokens. 
- SFT 后,长度剧烈坍缩至 3273 tokens,准确率从 31.2% 跌穿至 23.5%(因为模型学会了直接吐出简短但错误的答案). 

- **SDFT 后,生成长度依然保持在 4180 tokens 的深度思考状态,准确率暴涨至 43.7%**. 

SDFT 证明了: 持续学习的解药,就藏在模型自身极其强大的上下文学习(In-Context Learning)能力之中. 

## 3. 直觉类比 (Intuition)

我们可以用**"武林高手学新招"**来直观感受 SFT 与 SDFT 的天壤之别. 

![灾难性遗忘与SDFT持续学习对比](./images/sdft_continual_learning.png)
*图: SFT 就像粗暴地替换大脑齿轮,导致旧齿轮脱落(遗忘); SDFT 则是由一个看过秘籍的高维全息自我,引导低维本体将新齿轮平滑咬合进原有系统. *

- **SFT (填鸭式硬背)** : 高手看到一本新剑谱(Demonstration),他不管自己以前练了十年的内功心法,强行照猫画虎地模仿剑谱上的动作. 结果动作是学会了,但一上场,因为内力和招式冲突,走火入魔,连最基础的出拳都不会了(推理链崩塌,灾难性遗忘). 

- **SDFT (自我融会贯通)** : 高手先给自己倒杯茶,**仔细阅读并理解这本剑谱(Demonstration-Conditioned Teacher)** . 在这个"领悟"状态下,高手脑子里推演出了这套剑法该怎么打. 接着,他让**没有拿剑谱的本体(Student)** 在演武场上挥剑(On-Policy 采样). 每挥一剑,那个"领悟状态的自我"就会用心法去纠正他: "这一步你原本的内功运行是对的,只需要在出招角度上偏向剑谱三分即可. " 这样,新招式被完美融入了旧有的神经回路. 

## 4. 数学推导与公式对比: 隐式 IRL 的优美证明 (Mathematical Rigor)

SDFT 最惊艳的学术贡献,并不在于它设计了一个多么复杂的架构,而在于它通过极其严密的数学推导,证明了: **带有示范上下文的自蒸馏,在数学上等价于一种无需奖励模型的逆向强化学习(Implicit IRL)** . 

在讲解核心公式之前,我们先来看看 SDFT 是如何运作的: 
- **学生模型(Student)** : $\pi_\theta(\cdot|x)$,仅观察任务输入 $x$. 

- **教师模型(Teacher)** : $\pi_T(\cdot|x, d)$,同时观察输入 $x$ 和少量的高质量人工示范 $d$(Demonstrations). 

两者模型权重完全一致,教师只是因为多看了几个 Few-Shot 示例,被临时激发成了"高维形态". 
此时,学生去逼近教师,采用 **Reverse KL** 散度: 
$$
 \mathcal{L}_{SDFT} = \mathbb{E}_{x \sim \mathcal{D}} \left[ \underline{\mathbf{D_{KL}(\pi_\theta(\cdot|x) \| \pi_T(\cdot|x, d))}} \right] \tag{1}
$$

### 4.1 为什么要与 RL 对比?隐式 IRL 视角的引入
标准的基于信赖域(Trust-Region)的强化学习目标(如 PPO)包含两项: 最大化外部奖励,同时不偏离参考模型太远. 
我们来看标准 RL 的目标函数: 
$$
 \max_\theta \mathbb{E}_{y \sim \pi_\theta}[R(y)] - \beta \underline{\mathbf{D_{KL}(\pi_\theta(\cdot|x) \| \pi_{ref}(\cdot|x))}} \tag{2}
$$
- $R(y)$: 环境或外部 Reward Model 给出的奖励分数. 
- $\beta$: KL 惩罚系数. 

通过变分推断求导,这个 RL 目标的理论闭式最优解(Optimal Policy)是: 
$$
 \pi^*(y|x) \propto \pi_{ref}(y|x) \exp \left( \frac{R(y)}{\beta} \right) \tag{3}
$$

### 4.2 惊天替换: The In-Context Assumption
在持续学习中,我们**没有外部奖励模型 $R(y)$**,只有几个正确示范 $d$. 
SDFT 提出了一个大胆的假设(In-Context Assumption): 
**"一个极强的底层模型,在看到了正确的示范 $d$ 之后,它输出的概率分布 $\pi_T(y|x, d)$,就已经极其逼近那个我们梦寐以求的最优策略 $\pi^*(y|x)$. "**

即:  $\pi_T(y|x, d) \approx \pi^*(y|x)$. 

将这个假设代入上面那个 RL 最优解的等公公式子中,做对数变换,我们得到了一个令人拍案叫绝的结论--**隐式奖励函数(Implicit Reward)** : 

$$
 R_{implicit}(y) \approx \beta \cdot \left[ \underline{\mathbf{\log \pi_T(y|x, d)}} - \underline{\mathbf{\log \pi_{ref}(y|x)}} \right] \tag{4}
$$
**[公式物理意义详析]**: 
- **这是什么?** 这意味着,我们根本不需要去人工标注十万条偏好数据来训练一个 Reward Model. 

- **如何计算分数?** 任何一条轨迹 $y$ 的"奖励分数",可以直接用[看过示范的教师给它的打分 $\log \pi_T$]减去[无知状态下的基础模型给它的打分 $\log \pi_{ref}$]来计算!

- **本质机理**: 如果一个 Token 在加上示范后,被老师极其看好($\log \pi_T$ 暴涨),而基础模型原本不看好它,说明这个 Token 抓住了示范的精髓,它将获得极高的 Implicit Reward; 反之,如果一个 Token 原本是模型就爱说的废话,加上示范后依然是废话(两者打分不变),Reward 将趋近于 0. 

这从根本上解释了为什么 SDFT 能够抵御灾难性遗忘: 因为它在数学本质上,是一种用旧有模型作为 $\pi_{ref}$ 锚点,用 Demonstration 提取相对奖励的强化学习算法. 

## 5. 数值走查 (Numerical Example)

让我们用真实数值走查一遍这个"隐式奖励"是如何产生的. 

假设用户输入 $x=$ `计算 35+12`. 没有给推理示范. 
- 基础状态下,模型想直接抢答,下一个 Token `47` 的初始概率 $\log \pi_{ref}(47 | x) = -0.5$. 而老老实实写推理步骤的 Token `拆分` 的概率 $\log \pi_{ref}(拆分 | x) = -2.3$. 

现在,我们给教师模型加上极其严谨的 CoT 示范 $d$(如"计算 13+15,拆分为..."). 
- 教师模型看到了 $d$,变得严谨了. 它给直接抢答 `47` 打出的概率暴跌: $\log \pi_T(47 | x, d) = -4.0$. 
- 它给老实推理的 `拆分` 打出的概率暴涨: $\log \pi_T(拆分 | x, d) = -0.2$. 

计算隐式奖励 $R_{implicit}(y)$: 
- 对于抢答 `47`: $R \propto (-4.0) - (-0.5) = \mathbf{-3.5}$ (严重负奖励,惩罚!)
- 对于推理 `拆分`: $R \propto (-0.2) - (-2.3) = \mathbf{+2.1}$ (高额正奖励,鼓励!)

通过自蒸馏的 KL 散度下降,这套隐式的正负反馈被直接写入了学生模型的权重中,从而完美矫正了 SFT 那种不管三七二十一"只看绝对值硬背"的恶习. 

## 6. 简化实现 (PyTorch Code)

在 SDFT 的工程实现中,最重要的一环是**教师模型必须使用 EMA(指数滑动平均)更新**,如果教师和学生完全实时同步更新,会导致严重的崩溃(由于没有外部锚点,左脚踩右脚极容易双脚腾空摔倒). 

```python
import torch
import torch.nn.functional as F

def sdft_train_step(student_model, teacher_ema_model, task_input_x, demonstration_d, beta=1.0):
    """
    SDFT 核心训练步: 利用带示范的 EMA 教师指导学生
    """
    
    # 步骤 1: 学生 (无示范) 自由探索,进行 On-Policy 采样
    student_model.eval()
    with torch.no_grad():
        # 学生根据题目 x 生成轨迹 y
        y_trajectories = student_model.generate(task_input_x, max_new_tokens=1024)
        
    # 步骤 2: 计算学生分布
    student_model.train()
    # 学生的上下文仅有 x
    student_logits = student_model(torch.cat([task_input_x, y_trajectories], dim=-1)).logits
    student_logprobs = F.log_softmax(student_logits, dim=-1)
    
    # 步骤 3: 教师进行评估 (带示范的上帝视角)
    # 教师模型是 EMA 冻结的,不参与本次反向传播
    teacher_ema_model.eval()
    with torch.no_grad():
        # 教师的上下文是 d + x
        teacher_context = torch.cat([demonstration_d, task_input_x], dim=-1)
        teacher_logits = teacher_ema_model(torch.cat([teacher_context, y_trajectories], dim=-1)).logits
        teacher_probs = F.softmax(teacher_logits, dim=-1)
        
    # 步骤 4: 计算 Reverse KL 散度
    # 数学本质等价于隐式 IRL,强制学生逼近教师的示范后分布
    loss_kl = F.kl_div(
        input=student_logprobs, 
        target=teacher_probs, 
        reduction='batchmean'
    )
    
    # 反向传播
    loss_kl.backward()
    # optimizer.step()
    
    return loss_kl.item()

def update_teacher_ema(student_model, teacher_ema_model, alpha=0.99):
    """
    训练步结束后的 EMA 动量更新,保证教师比学生演进得更平滑,稳定
    """
    with torch.no_grad():
        for param_s, param_t in zip(student_model.parameters(), teacher_ema_model.parameters()):
            param_t.data.mul_(alpha).add_(param_s.data, alpha=1 - alpha)
```

> **代码注释印证**: 注意 `teacher_context` 中拼接了 `demonstration_d`,这就是激活 Teacher "领悟状态"的唯一开关. EMA 更新机制 `update_teacher_ema` 则构成了持续学习中防止遗忘的物理防波堤. 

## 7. 局限性与边界条件 (Limitations & Boundary Conditions)

SDFT 虽然在数学上极度优雅,并在抵御灾难性遗忘上立下奇功,但它同样存在严酷的生死边界: 

1. **ICL(上下文学习)能力的铁律**: 
   - **失效区域**: 如果你的底座模型非常小(如参数规模 < 3B),它根本不具备从 Few-shot 示范中快速顿悟的 In-Context Learning 能力. 

- **数学根因**: 还记得前文的公式 $\pi_T(y|x, d) \approx \pi^*(y|x)$ 吗?这叫 In-Context Assumption. 如果模型太笨,哪怕你给了示范 $d$,它输出的 $\pi_T$ 也是一团乱麻,根本无法逼近最优策略 $\pi^*$. 此时的 SDFT 不仅不能防遗忘,反而会因为教师信号极度嘈杂,导致效果远不如简单暴力的 SFT. 

2. **对隐式奖励上限的妥协**: 
   - **退化场景**: SDFT 的隐式奖励完全来自于模型自身的泛化先验. 如果面临的全新任务(比如让模型学习量子物理的高阶张量推导)超出了底座模型预训练时见过的一切知识盲区,无论你怎么给 Demonstration,模型都无法内部涌现出正确的 $\log \pi_T$. 这种情况下,你必须引入外部的,真实世界的编译器反馈或人类反馈来提供绝对的 Ground Truth. 

## 8. 演进与承上启下 (Evolution & Segue)

SDFT 利用 Demonstration 让模型自己教自己,完美解决了"无外部奖励模型情况下的持续学习"痛点. 
然而,上述提到的第二点局限性却像乌云一样笼罩在工程界: **如果我们真的遇到了一种极难的任务,仅靠模型内部的泛化(In-Context)已经失效了,我们该怎么办?**

如果在写代码,解方程时,我们虽然没有昂贵的 Reward Model,但我们有一个免费且绝对正确的"环境"--代码编译器(Compiler)或 Python 解释器. 
我们能不能把这种来自真实环境绝对零容忍的反馈(Execution Feedback),融合进自蒸馏的框架中,让模型在真实的撞墙中学习,而不是仅仅在想象中推演?

这就是将隐式 IRL 与真实环境反馈结合的终极形态,它在数学上摒弃了单纯的 KL 散度,将自蒸馏推向了策略优化的高度--欢迎进入 OPD 家族的重火力区: **SDPO(自蒸馏策略优化)** ,请阅读下一篇章. 

## 9. 总结与参考文献 (References)

1. **破除灾难性遗忘**: SDFT 证实了将 Demonstration 作为条件输入给教师,让学生去 On-Policy 蒸馏,能够完美融合新知识并保护旧能力(特别是长程推理思考的风格). 

2. **隐式 IRL 证明**: 无需显式的 Reward Model,带示范的对数概率本身就在数学上构成了一个完美的,防越界的强化学习奖励信号. 

3. **EMA 工程支撑**: 通过冻结并缓慢平滑更新的教师模型,构建了连续学习中的知识锚点. 

**参考文献: **
- Self-Distillation Enables Continual Learning. arXiv: 2601.19897. URL: https://arxiv.org/abs/2601.19897
- ToolAlpaca & SciKnowEval benchmark analysis papers.

---

## 2026-08 修订(不删上文)

旧标题「逆向强化学习视角的破局」和 §2「暴跌 / 死死咬住 / 暴涨」是 2025 稿修辞,**机制与数字以本节为准**.对象钉死 Shenfeld,Damani,Hübotter,Agrawal 的 [Self-Distillation Enables Continual Learning](https://arxiv.org/abs/2601.19897)(打开的是 [HTML](https://arxiv.org/html/2601.19897)).**SDFT = Self-Distillation Fine-Tuning**:持续学习设定下,教师条件里多塞示范 $d$(论文符号 $c$;数据集里每条 $x$ 配一条 demonstration,可很少),学生仍按 $\pi_\theta(\cdot\mid x)$ on-policy 采样,逐步贴教师 $\pi(\cdot\mid x,d)$,用来注入新技能同时抗灾难性遗忘.示范 ≈ [02-OPSD](../02-OPSD-参考解自蒸馏/02-OPSD-参考解自蒸馏.md) 的特权上下文,只是把本题参考解 $y^{\star}$ 换成示范.本文是 [4.6 OPD](../4.6-OPD.md) 里「自教师 + 持续学习」这一格.**不是** [04-SDPO](../04-SDPO-环境反馈蒸馏/04-SDPO-环境反馈蒸馏.md) 的环境 rich feedback,**不是** [09-MOPD](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) 的多教师合版,也不是另雇外部 72B.G-OPD / SCOPE 本波不升格.

### 1. 问题:SFT 是 off-policy,顺序学就会忘

没有可查询的奖励时,从示范学新技能的默认做法是 SFT.论文把这定性为 **off-policy**:监督前缀来自专家轨迹,不是学生自己的状态分布.Ross et al. 那条 compounding error 在这里变成两件事--新任务泛化差,以及旧能力被参数拽走.On-policy RL 能少忘,但要显式 $r(y)$;工业里常常只有几条 demonstration.SDFT 要回答的就是:**只有 $d$,没有 RM 时,怎么拿到 on-policy 的逐步监督.**

顺序学 Tool Use / Science Q&A / Medical 和一组 65.5→56.0,70.6%,65.4% 写在同一段会造成混淆.**后一组对得上表,但不是顺序实验.** 顺序三任务是 Figure 3:纵轴把每项任务线性归一化成 0 = 底座,1 = 两种算法里的最高分,**没有** 70.6 这种点值.65.5 / 56.0 / 70.6 / 65.4 来自 Table 5 的 **单任务 Tool Use** 面板.

Table 5 分母:底座 **Qwen2.5-7B-Instruct**;新任务 = 该技能 held-out 准确率;Previous Tasks 平均 = HellaSwag,HumanEval,IFEval,MMLU,TruthfulQA,Winogrande 六项(论文 §4.1 / Appendix B.2,greedy,温度 0);超参在验证集上扫完再报测试集(Table 3 扫 LR / epoch / batch;SDFT 另扫 EMA $\alpha\in\{0.01,0.02,0.05\}$,最长生成 2048).摘要没有这些点值,**跟表**.

| 设定 | 方法 | 新任务 | Previous Avg |
| --- | --- | ---: | ---: |
| Tool Use(Table 5 中栏) | Base | 42.9 | **65.5** |
| | SFT | 63.2 | **56.0** |
| | SDFT | **70.6** | **65.4** |
| Science Q&A | Base | 32.1 | 65.5 |
| | SFT | 66.2 | 53.4 |
| | SDFT | 70.2 | 64.5 |
| Medical | Base | 30.1 | 65.5 |
| | SFT | 35.5 | 60.2 |
| | SDFT | 40.2 | 65.4 |

读法:「SFT 旧任务均分 65.5→56.0」只对 **Tool Use 单任务**;Science 上 SFT 旧能力掉到 53.4,Medical 掉到 60.2,不要三任务共用 56.0.「SDFT 新任务 70.6%,旧能力 65.4%」同样只对 Tool Use;Science 是 70.2 / 64.5,Medical 新任务只有 40.2.相对 SFT,Tool Use 新任务是 70.6 vs 63.2,不是「略超」.

顺序实验(Figure 3)只主张:SDFT 学下一项时前一项不塌;SFT 一换任务就振荡.**不要**把 Table 5 点值填进 Figure 3.

推理模型 Table 2 分母:**Olmo-3-7B-Think**,HuatuoGPT-o1 医学,训练数据 **没有** 中间推理标注,报准确率 + 平均生成 token 数.这组 **对得上表**:

| | Accuracy | Avg. # tokens |
| --- | ---: | ---: |
| Olmo-3-7B-Think | 31.2 | 4612 |
| + SFT | 23.5 | 3273 |
| + SDFT | 43.7 | 4180 |

SFT 把长思维压短;SDFT 教师是示范条件化后的同一推理模型,目标分布还带着原来的推理风格.这是论文 §4.5 自己的对照,不是发挥.

知识注入 Table 1(同一底座,2025 自然灾害维基约 200K token 生成的 QA):SDFT 严格 89 / 宽松 100 / OOD 98,SFT 80 / 95 / 80,CPT 9 / 37 / 7.这张表单独列出以免和技能表混.

### 2. 公式:教师 $p(\cdot\mid x,d)$,学生 $p(\cdot\mid x)$,梯度只走学生

数据集 $\mathcal{D}=\{(x_i,d_i)\}$.论文把示范写成 $c$,本文用 $d$.同一套架构切成两种条件:

$$
\pi_T(\cdot\mid x,d)\;\triangleq\;\pi_\phi(\cdot\mid x,d),\qquad
\pi_\theta(\cdot\mid x)\;\triangleq\;\text{学生}. \tag{R1}
$$

$\phi$ 开局等于 $\theta$(Algorithm 1 第 1 步),之后是学生的 EMA,**不是**训练全程「师生同一份当前权重」.教师提示(论文 §3)大致是:题 →「这是一个回答示范」→ $d$ →「现在用你自己的方式作答,包含思考过程」.目的是拦住逐字复读 $d$.教师 **不采样**,只在学生已经写出的前缀上做前向.

学生采样

$$
y\sim\pi_\theta(\cdot\mid x). \tag{R2}
$$

理论目标是 **Reverse KL**(论文式 (1)):

$$
\mathcal{L}(\theta)=D_{\mathrm{KL}}\bigl(\pi_\theta(\cdot\mid x)\;\big\|\;\pi(\cdot\mid x,d)\bigr)
=\mathbb{E}_{y\sim\pi_\theta}\Bigl[\log\frac{\pi_\theta(y\mid x)}{\pi(y\mid x,d)}\Bigr]. \tag{R3}
$$

自回归拆开后,对词表求和,梯度只对 $\theta$(论文式 (2);教师分布当常数):

$$
\nabla_\theta\mathcal{L}
=\mathbb{E}_{y\sim\pi_\theta}\Biggl[\sum_t\sum_{y_t\in\mathcal{V}}
\pi_\theta(y_t\mid y_{<t},x)
\log\frac{\pi_\theta(y_t\mid y_{<t},x)}{\pi(y_t\mid y_{<t},x,d)}
\nabla_\theta\log\pi_\theta(y_t\mid y_{<t},x)\Biggr]. \tag{R4}
$$

主实验用的是 Appendix A.1 的 **analytic per-token** 估计器(逐步对整张词表求 KL,再沿学生回传).token-level 偏置大,Rao–Blackwell 更贵但他们没测到好处;每条 prompt **一条** rollout.

**实现分叉(必须写):** 理论钉 Reverse KL,正文却写 "we found in practice that Forward KL yields the best performance".式 (1) 只写 Reverse,方向跟理论,**不是**「论文主实验规定必须 Reverse」.§6 的 `F.kl_div(student_logprobs, teacher_probs)` 在 PyTorch 里其实是 $\mathrm{KL}(\text{teacher}\|\text{student})$,注释写 Reverse,代码更接近实践的 Forward--不要把那段代码当论文公式.

![学生只看 x 采样,EMA 教师看 x 和示范 d 只做 prefill,散度只沿学生回传](./images/fig-sdft-student-teacher.png)

> 图 1:示范条件化教师 vs 闭卷学生.对应论文 Figure 2(左).

**图 1 解析**

- **左(青)**:学生只吃 $x$,采样 $y$.这是 on-policy 的唯一采样源.
- **右(琥珀)**:教师多吃 $d$.虚线:prefill only,教师不写卷.权重是 EMA $\phi$,不是冻结的 $\theta_{\mathrm{init}}$(那是邻居 02 的主设置).
- **中**:逐步比较的是学生自己的前缀 $y_{<t}$,不是专家轨迹--这就是和 SFT 的差.
- **红箭头**:损失对教师 stop-grad.

§3.1 把 Reverse KL 读成隐式奖励

$$
r(y,x,d)=\log\pi(y\mid x,d)-\log\pi_k(y\mid x), \tag{R5}
$$

再拆成 token 级 $r_t=\log\pi(y_t\mid y_{<t},x,d)-\log\pi_k(y_t\mid y_{<t},x)$.论文自己的标题是 **Self-Distillation as Inverse RL**,原话是 *can also be interpreted*,*mathematically equivalent to maximizing an implicit reward*;同时 §1 写 **rather than inferring an explicit reward function**.**这是 reverse-KL 目标的一种 IRL 解读,不是另训 RM,也不是实践里一定在优化 (R5).** §5 那组 `47` / `拆分` 的 −3.5 / +2.1 **论文表里没有**,当数值例即可.

In-Context Assumption(论文式 (4)):

$$
\pi_{k+1}^{*}(y\mid x)\approx\pi(y\mid x,d). \tag{R6}
$$

§3.2 把它拆成两条可测的:教师奖励要接近最优;教师相对当前策略的 KL 要小(trust-region 要的是「能完成任务里离 $\pi_k$ 最近的那一个」).ToolAlpaca,Qwen2.5-7B-Instruct:无示范底座约 **42%**,加上对应 $d$ 教师 **100%**;相对底座的 KL,SFT 模型 1.26 nats,示范教师 0.68 nats(Figure 2 右).小模型 / 无 ICL 时这条假设碎,见 §4.

EMA(Appendix A.3,论文有写,不是发挥):冻底座当教师稳但跟不上学习;师生共用当前 $\theta$ 会把 token 噪声放大到散度环里崩掉.默认

$$
\phi\leftarrow\alpha\theta+(1-\alpha)\phi,\quad \alpha\in\{0.01,0.02,0.05\}. \tag{R7}
$$

注意:有的实现把 `alpha=0.99` 当衰减系数写,和式 (R7) 的 $\alpha=0.01$ 是同一档,符号不要混.TRL 文档把默认教师写成冻结 base「matching the paper」--跟论文正文不符,本篇跟 A.3.

![Algorithm 1:学生采样,双路前向,词表 KL,只更新学生,EMA 教师](./images/fig-sdft-algorithm.png)

> 图 2:Algorithm 1 数据流.Box 3 的 $D$ 左右以式 (R3) 的 $D(\pi_\theta\|\pi_T)$ 为准;实践可换成 Forward.

**图 2 解析**

- **Box 1**:只从 $\pi_\theta(\cdot\mid x)$ 采样.
- **Box 2**:学生条件 $(x,y_{<t})$;教师条件 $(x,d,y_{<t})$,权重 $\phi$.
- **Box 3–4**:analytic per-token;只更新学生.
- **Box 5**:EMA,不是 02 那种冻 $\theta_{\mathrm{init}}$.

### 3. 不是什么

| 名字 | 它在做什么 | SDFT 不是它的理由 |
| --- | --- | --- |
| SFT | 在专家轨迹 $d$ 上模仿 | off-policy;Table 5 / Figure 3 忘得更狠 |
| 基础 OPD | 另一个外部教师给逐步分布 | 本篇教师是 $\pi(\cdot\mid x,d)$,同一架构 |
| [02-OPSD](../02-OPSD-参考解自蒸馏/02-OPSD-参考解自蒸馏.md) | 特权信息是本题参考解 $y^{\star}$,教师冻在 $\theta_{\mathrm{init}}$ | 本篇特权信息是示范 $d$;教师 EMA;论文 Related Work 把 Zhao et al. 当并行互补,不是同一实验 |
| [04-SDPO](../04-SDPO-环境反馈蒸馏/04-SDPO-环境反馈蒸馏.md) | 环境 rich feedback(堆栈,失败单测)条件化自教师 | 本篇没有编译器/验证器奖励;只有 $d$ |
| [09-MOPD](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) | 多个 RL 专家 logits 合成一份学生 | 本篇一个自教师,没有九专家 / $R_{\max}$ |
| Context distillation (Snell et al.) | 教师有额外上下文,但对学生做 **离线** 蒸馏 | 论文 Related Work:本篇 on-policy,且 $d$ 是逐条 query 的示范不是固定前缀 |
| 显式 IRL / RLHF | 先学 $r$ 再 on-policy RL | 论文明确不推断显式奖励;式 (R5) 只是解读 |
| DFT / Re-invoke | 重要性采样或 SFT 后再蒸回底座 | Table 5 的对照,不是 SDFT |
| ACL 2024 另一篇也叫 SDFT(Yang et al. / sail-sg) | 用模型自己生成的数据做 SFT,填任务分布和底座分布的缝 | **同名不同文**,不要把仓库或数字并进来 |

离线用同一教师再蒸一遍:Figure 6,Tool Use 上不如 on-policy.好处不能只归到「教师质量」.

### 4. 失效:ICL 假设碎了就没有教师

SDFT 吃的是 $\mathcal{D}$ 里成对的 $(x,d)$.**没有 $d$**(也没有可检索的示范)教师退化成学生,散度为 0.底座 **ICL 太弱** 时,有 $d$ 也不够:Figure 5 左,Qwen2.5 **3B** 在 Science Q&A 上 SDFT 落后 SFT;7B 相对 SFT 大约 +4 分,14B 大约 +7 分(正文叙述,没有单独的分点表).「< 3B 则教师嘈杂」方向对,来源是 §4.4 / Figure 5,不要写成硬阈值定理.

其它边界(论文 §5):

| 现象 | 原因 | 说明 |
| --- | --- | --- |
| 3B 上不如 SFT | In-Context Assumption 失败 | 教师信号是噪声;此时不要用 SDFT 硬扛 |
| 非推理模型硬改成 CoT | 要改的是生成模式本身 | 论文写 struggled;示范条件化给不出这种大偏移 |
| 「Based on the text...」口癖 | 教师提示里有示范,学生没看见却学会了开场白 | 他们 mask 前几个 token,启发式,不是定理 |
| 师生共用当前 $\theta$ | A.3 正反馈 | 主设置是 EMA |
| 仍会掉一点旧能力 | on-policy 减遗忘,不是零遗忘 | Figure 4:SDFT 在 Pareto 右上,不是旧分绝对不动 |
| 计算 | 相对 SFT 约 2.5× FLOPs,4× 墙钟 | 要和「SFT + Re-invoke 两段」比总成本 |
| 只有最终答案的推理数据 | SFT 压短思维 | Table 2 说明 SDFT 能保住长度;不是保证任意任务都涨分 |

没有示范,又没有外部教师或可验证奖励:这篇给不出替代损失.不要把「武林高手看剑谱」读成无数据永动机.下一篇只链 [04-SDPO](../04-SDPO-环境反馈蒸馏/04-SDPO-环境反馈蒸馏.md):示范换成环境 rich feedback.本篇不预写 SDPO 数字.

### 参考文献

1. Shenfeld, Damani, Hübotter, Agrawal. *Self-Distillation Enables Continual Learning*. [arXiv:2601.19897](https://arxiv.org/abs/2601.19897) / [HTML](https://arxiv.org/html/2601.19897).式 (1)(2)(4)(5),Algorithm 1,Table 1–5,Figure 2–8,Appendix A.1–A.3.
2. 官方代码:[idanshen/Self-Distillation](https://github.com/idanshen/Self-Distillation).项目页声明见论文摘要 `idanshenfeld.com/SDFT`.
3. 论文 Related Work 点名的并行自蒸馏:Zhao et al. OPSD(2601.18734),Hübotter et al.(2601.20802,本库 04).数字仍以 2601.19897 的表为准.

图 1–2 是示意.§5 的 −3.5 / +2.1 不是论文表.知乎只学「示范当特权上下文,教师不写卷」的拆法;有的转述把 Table 1 的 CPT 37 和 Figure 7 的 75/89 搅在一起,**数字全部回表**.
