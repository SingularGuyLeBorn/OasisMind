<!-- page 1 of 26 -->

arXiv:2509.02208v1 [cs.LG] 2 Sep 2025

# Baichuan-M2: Scaling Medical Capability with Large Verifier System 用大规模 Verifier 系统 Scaling 医学能力

**Baichuan-M2 Team**

## Abstract

As large language models (LLMs) advance in conversational and reasoning capabilities, their practical application in healthcare has become a critical research focus. However, there is a notable gap between the performance of medical LLMs on static benchmarks such as USMLE and their utility in real-world clinical decision-making. This discrepancy arises because traditional exams fail to capture the dynamic, interactive nature of medical consultations. To address this challenge, we introduce a novel dynamic verification framework that moves beyond static answer verifier, establishing a large-scale, high-fidelity interactive reinforcement learning system. Our framework comprises two key components: a Patient Simulator that creates realistic clinical environments using de-identified medical records, and a Clinical Rubrics Generator that dynamically produces multi-dimensional evaluation metrics. Building on this foundation, we develop Baichuan-M2, a 32B-parameter medical augmented reasoning model trained through a multi-stage reinforcement learning strategy with an improved Group Relative Policy Optimization (GRPO) algorithm. Evaluated on HealthBench, Baichuan-M2 outperforms all other open-source models and most advanced closed-source counterparts, achieving a score above 32 on the challenging HealthBench Hard benchmark—previously exceeded only by GPT-5. Our work demonstrates that robust dynamic verifier system is essential for aligning LLM capabilities with practical clinical applications, establishing a new Pareto front in the performance-parameter trade-off for medical AI deployment.

随着大语言模型在对话与推理能力上不断进步, 它们在医疗中的实际应用已成为关键研究方向. 然而, 医学大模型在 USMLE 这类静态基准上的成绩, 与它们在真实临床决策中的可用性之间, 存在明显落差. 原因在于传统考试抓不住医疗问诊动态, 交互的本质. 为此, 我们提出一种新的动态验证框架, 不再停留于静态的答案 verifier, 而是搭建一套大规模, 高保真的交互式强化学习系统. 框架包含两个关键组件: 一是患者模拟器 (Patient Simulator), 利用脱敏病历构造逼真的临床环境; 二是临床评分细则生成器 (Clinical Rubrics Generator), 动态产出多维度的评价指标. 在此基础上, 我们开发了 Baichuan-M2, 一个 32B 参数的医学增强推理模型, 采用多阶段强化学习策略与改进版 Group Relative Policy Optimization (GRPO) 算法训练. 在 HealthBench 上, Baichuan-M2 超过了所有其他开源模型和大多数先进闭源模型, 在高难度的 HealthBench Hard 上得分超过 32, 此前只有 GPT-5 做到过. 我们的工作表明, 稳健的动态 verifier 系统, 是让大模型能力对齐真实临床应用的关键, 并在医学 AI 部署的性能与参数量权衡上确立了新的 Pareto 前沿.

## 1 Introduction

As the conversational and reasoning capabilities of large language models (LLMs) continue to advance, there is increasing interest in their practical application in specific domains. The healthcare sector, in particular, has become a key area of research, attracting significant investment from both global tech giants and innovative startups [1–3]. Among the various approaches aimed at enhancing the capabilities of LLMs in healthcare, reinforcement learning with verifiable rewards (RLVR) has garnered considerable attention [4, 5]. This technique has already demonstrated impressive results in areas such as mathematics [6–8], code [9], agents [10, 11], and multimodality [12, 13]. These achievements highlight its potential to significantly enhance model reasoning, making its application in healthcare a highly promising research direction.

随着大语言模型对话与推理能力的持续提升, 人们越来越关心它们在特定领域的落地. 医疗尤其成为研究重点, 全球科技巨头与创新创业公司都在大举投入 [1–3]. 在提升大模型医疗能力的各种路线里, 基于可验证奖励的强化学习 (RLVR) 备受关注 [4, 5]. 这项技术已在数学 [6–8], 代码 [9], 智能体 [10, 11] 与多模态 [12, 13] 等方向取得亮眼成果. 这些成果说明它有望大幅增强模型推理, 把它用到医疗上, 是很有前景的研究方向.

The core of RLVR lies in the development of a robust evaluation system. Its success in fields like mathematics and coding can be attributed to the availability of precise and reliable evaluation metrics. However, when it comes to assessing LLMs in the medical domain, a significant gap exists between current evaluation methods and real-world applications. Models that perform well on medical professional exams, such as the USMLE [14], often underperform in practical clinical decision-making. This discrepancy arises because traditional static benchmarks fail to capture the dynamic and complex nature of clinical practice. Real-world medical consultations frequently involve incomplete information, multiple rounds of diagnostic exploration, and nuanced communication skills, all of which are not adequately measured by conventional exams.

RLVR 的核心在于构建稳健的评估体系. 它在数学和代码上的成功, 很大程度上得益于那里有精确可靠的评价指标. 可一旦要评估医学领域的大模型, 现有评估方法与真实应用之间就出现了明显鸿沟. 在 USMLE [14] 这类医学专业考试上表现好的模型, 到了实际临床决策中往往表现不佳. 原因是传统静态基准抓不住临床实践动态而复杂的一面. 真实问诊常常信息不全, 需要多轮诊断探索, 还需要细腻的沟通技巧, 这些都是常规考试量不出来的.

<!-- page 2 of 26 -->

To address these challenges, we transitioned our focus from static answer verifiers to the development of a large-scale, high-fidelity interactive reinforcement learning verifier system. This system transcends conventional answer verifier by simulating real-world clinical scenarios, allowing the model to learn and adapt through simulated “practice” in a virtual clinical environment. Building on this foundation, we introduce Baichuan-M2, a medical augmented reasoning model that marks a significant advancement in open-source medical artificial intelligence.

为应对这些挑战, 我们把重心从静态答案 verifier 转向构建大规模, 高保真的交互式强化学习 verifier 系统. 这套系统通过模拟真实临床场景, 超越了传统的答案 verifier, 让模型在虚拟临床环境里通过模拟 「实践」 来学习和适应. 在此基础上, 我们推出 Baichuan-M2, 一个医学增强推理模型, 它标志着开源医学人工智能的一次重要进展.

Specifically, our verifier system comprises two key components. The first is a Patient Simulator, which integrates desensitized medical records and doctor-patient conversation records to effectively simulate patients with diverse social backgrounds and personality traits. This provides a highly realistic interactive environment. The second component is a Clinical Rubrics Generator, which can emulate the clinical reasoning of experienced doctors. It dynamically generates quantifiable evaluation rubrics on a large scale, based on multiple dimensions such as diagnostic accuracy, consultation logic, treatment plan rationality, communication empathy, and medical ethics.

具体来说, 我们的 verifier 系统包含两个关键组件. 第一个是患者模拟器, 它整合脱敏病历与医患对话记录, 能有效模拟社会背景, 性格特征各异的患者, 提供高度逼真的交互环境. 第二个是临床评分细则生成器, 它能模仿资深医生的临床推理, 依据诊断准确性, 问诊逻辑, 治疗方案合理性, 沟通共情与医学伦理等多个维度, 大规模地动态生成可量化的评价细则 (rubric).

Our training process includes mid-training for medical domain adaptation, supervised fine-tuning (SFT) with rejection sampling, and multi-stage reinforcement learning (RL) using an improved Group Relative Policy Optimization (GRPO) [8] algorithm. Specifically, we employ a multi-stage reinforcement learning strategy to decompose complex reinforcement learning tasks into a controllable hierarchical structure. This approach enhances various capabilities, including medical knowledge, reasoning, and patient interaction, while maintaining the general capabilities of the model.

我们的训练流程包括: 面向医学领域适配的 mid-training, 结合拒绝采样的 SFT, 以及采用改进版 GRPO [8] 算法的多阶段强化学习 (RL). 具体而言, 我们用多阶段 RL 策略, 把复杂的强化学习任务拆解成可控的层级结构. 这种做法在保持模型通用能力的同时, 增强了医学知识, 推理与患者交互等多方面能力.

We evaluate our model on the challenging HealthBench dataset [15], developed by OpenAI. Despite its relatively small number of parameters (only 32B), Baichuan-M2 outperformed all other open-source models, including gpt-oss-120B, and most advanced closed-source counterparts on HealthBench. It particularly excelled on the HealthBench Hard test, achieving a score exceeding 32, a performance level previously reached by only one other model globally, GPT-5. These experimental results underscore the critical role of a robust validation system in integrating model capabilities with practical applications.

我们在 OpenAI 开发的高难度 HealthBench 数据集 [15] 上评测模型. 尽管参数量相对较小 (只有 32B), Baichuan-M2 在 HealthBench 上超过了包括 gpt-oss-120B 在内的所有其他开源模型, 以及大多数先进闭源模型. 它在 HealthBench Hard 上尤为突出, 得分超过 32, 此前全球只有 GPT-5 一个模型达到过这个水平. 这些实验结果说明, 稳健的验证系统在模型能力与实际应用之间起着衔接作用.

In summary, our contributions can be highlighted as follows:

总结起来, 我们的贡献有以下几点:

• A dynamic verifier system tailored for clinical scenarios, which addresses the limitations of previous verification methods based on static data. This method employs a patient simulator to create a highfidelity decision-making environment and uses clinical rubrics to generate quantitative evaluation metrics in real time, thereby enhancing the reliability of the verification process.

• 一套为临床场景量身定制的动态 verifier 系统, 解决了以往基于静态数据的验证方法的局限. 它用患者模拟器营造高保真的决策环境, 用临床评分细则实时生成量化评价指标, 从而提高验证过程的可靠性.

• An advanced training method that successfully implements a multi-stage reinforcement learning strategy in a dynamic interactive environment, featuring targeted improvements to the GRPO algorithm. This enhancement enables the model to move beyond static knowledge memorization and deeply align with the advanced clinical reasoning capabilities of medical experts.

• 一种先进的训练方法, 在动态交互环境中成功落地多阶段强化学习策略, 并对 GRPO 算法做了针对性改进. 这让模型不再停留于静态知识记忆, 而是与医学专家的高阶临床推理能力深度对齐.

• An advanced open-source model, Baichuan-M2, which achieves top-tier performance at a remarkably lower deployment cost, setting a new Pareto front in the performance-parameter trade-off. This efficiency makes the deployment of advanced medical AI more feasible in resource-constrained healthcare settings.

• 一个先进的开源模型 Baichuan-M2, 以低得多的部署成本达到顶尖性能, 在性能与参数量的权衡上确立了新的 Pareto 前沿. 这种效率让先进医学 AI 在资源受限的医疗环境中更容易部署.

## 2 Verifier System 验证器系统

In recent years, RLVR has achieved remarkable success in complex reasoning domains such as mathematics, coding, and agentic systems. Constructing more verifiable complex problems and environments has become a core driver for continuous breakthroughs in model capabilities. However, when applying this paradigm to the medical field, we discovered significant limitations: static answer verifier built on traditional medical question banks fails to capture the dynamic complexity of realworld diagnostic processes, often leading to limited generalization and suboptimal performance in practical applications. Real clinical practice is a partial observable, multi-turn decision-making process that relies heavily on a physician’s dynamic judgment, entailing the integration of clinical experience, communication skills, and ethical considerations.

近年来, RLVR 在数学, 代码与智能体系统等复杂推理领域取得了显著成功. 构造更多可验证的复杂问题与环境, 已成为模型能力持续突破的核心驱动力. 但把这一范式搬到医学领域时, 我们发现了明显局限: 基于传统医学题库搭建的静态答案 verifier, 抓不住真实诊断过程的动态复杂性, 往往导致泛化有限, 实际应用表现欠佳. 真实临床实践是一个部分可观测的多轮决策过程, 高度依赖医生的动态判断, 需要把临床经验, 沟通技巧和伦理考量融为一体.

To address this challenge, in the development of Baichuan-M2, we shifted our focus from building static answer verifiers to creating a large-scale, high-fidelity dynamic interactive reinforcement learning environment. This environment aims to construct a “virtual clinical world” where models can “train and grow”. The system primarily consists of two key modules: a “patient simulator” and

为此, 在开发 Baichuan-M2 时, 我们把重心从构建静态答案 verifier, 转向打造大规模, 高保真的动态交互式强化学习环境. 这个环境的目标是搭建一个 「虚拟临床世界」, 让模型在其中 「训练与成长」. 系统主要由两个关键模块组成: 「患者模拟器」 和

<!-- page 3 of 26 -->

![Image block](images/p03-figure-1-verifier-system-framework.png)

Figure 1: Verifier System Framework

图 1: Verifier 系统框架

a “clinical rubrics generator”. The patient simulator elevates the training environment beyond rigid single-turn QA, generating realistic, stochastic, continuous interaction scenarios. The clinical rubrics generator dynamically produces verification rules for answers, enabling continuous and dynamic quantitative assessment of a model’s comprehensive performance across multi-turn interactions as shown as Figure 1.

「临床评分细则生成器」. 患者模拟器让训练环境跳出僵硬的单轮问答, 生成真实, 随机, 连续的交互场景. 临床评分细则生成器则动态产出回答的验证规则, 从而对模型在多轮交互中的综合表现做持续, 动态的量化评估, 如 Figure 1 所示.

Through this closed-loop system, we successfully implemented large-scale end-to-end reinforcement learning. The model continuously interacts with “virtual patients”, iteratively optimizing its diagnostic strategies based on dense feedback from “expert-level evaluations”. Ultimately, the model’s capabilities move beyond recall of static knowledge, achieving deep alignment with the clinical thinking and practical skills of senior physicians.

借助这个闭环系统, 我们成功实现了大规模端到端强化学习. 模型不断与 「虚拟患者」 交互, 依据 「专家级评估」 给出的稠密反馈迭代优化诊断策略. 最终, 模型的能力不再局限于回忆静态知识, 而是与资深医生的临床思维和实践技能深度对齐.

> **想:** Figure 1 里患者模拟器和 Rubrics 生成器都是 LLM, 而策略模型 M2 在 RL 中一直在变. 这两个 verifier 组件在 RL 期间是否随策略一起更新, 如果不更新, 策略会不会学会迎合它们?
> 按正文, 两者都在 RL 之前训练好: §2.1 说模拟器是 「trained」, §2.2.3 说 Rubrics 生成器训练后 「can generate dynamic evaluation standards in real-time」, 全文没有 RL 期间同步更新 verifier 的描述, 所以它们是固定的外部环境. 防迎合的措施散在几处: §3.3.2 为正向和负向 rubric 分开写评分模板 (Appendix A), 式 (3) 的长度奖励只在组内质量达标后才放开, §3.3.3 过滤重复生成, 角色反转等异常对话片段. 报告没有给出 reward hacking 的监控指标, 只能靠外部的 HealthBench (Figure 6, Figure 7) 与人工评判的 Figure 11 间接检验.

### 2.1 Patient Simulator 患者模拟器

Patient simulators play a critical role in the training and evaluation of AI physicians [16, 17]. These simulators offer a dynamic testing environment that can effectively address the limitations of traditional static testing methods, which often fail to adequately assess the dynamic diagnostic capabilities of LLMs. However, widely used simulators in prior works [18, 19] fall short in comprehensively modeling patients’ psychological states, social backgrounds, and dynamic interactions. This deficiency reduces these simulators to static databases, thereby limiting their ability to replicate the complexity of real-world clinical encounters. Such encounters often involve information withholding, emotional expressions, and culturally-mediated communication barriers, all of which are crucial for the adaptability of AI physicians in practical settings.

患者模拟器在 AI 医生的训练与评估中起着关键作用 [16, 17]. 传统静态测试方法往往无法充分评估大模型的动态诊断能力, 模拟器提供的动态测试环境能有效弥补这一局限. 然而, 以往工作中广泛使用的模拟器 [18, 19], 在患者心理状态, 社会背景与动态交互的建模上都不够全面. 这一缺陷让模拟器退化成静态数据库, 难以还原真实临床接诊的复杂性. 真实接诊常常伴随信息隐瞒, 情绪表达以及由文化因素造成的沟通障碍, 这些对 AI 医生在实际场景中的适应能力都至关重要.

The core challenge in developing high-fidelity patient simulators lies in balancing diversity and consistency. Achieving diversity necessitates an extensive disease knowledge base coupled with multidimensional behavior models to cover broad clinical scenarios. Conversely, ensuring consistency requires preset scripts and behavioral constraints to maintain reproducibility for specific cases.

开发高保真患者模拟器的核心难点, 在于平衡多样性与一致性. 要多样, 就需要庞大的疾病知识库配合多维行为模型, 覆盖广泛的临床场景; 要一致, 就需要预设剧本和行为约束, 保证特定病例可以复现.

Building on prior research [16], we trained a high-fidelity patient simulator that achieves an optimal diversity-consistency tradeoff, providing a highly realistic interactive environment.

在已有研究 [16] 的基础上, 我们训练了一个高保真患者模拟器, 在多样性与一致性之间取得最佳平衡, 提供高度逼真的交互环境.

#### 2.1.1 Patient Scripts 患者剧本

Patient scripts integrate medical and psychological information to enhance behavioral simulation.

患者剧本整合医学信息与心理信息, 以增强行为模拟.

<!-- page 4 of 26 -->

![Image block](images/p04-figure-2-an-illustration-of-patient-simulator-the.png)

Figure 2: An illustration of Patient Simulator. The system is composed of three primary modules: the Termination Gate, the Affective Unit, and the Factual Unit. The Affective Unit was trained using synthetic data to simulate patients with a wide range of personalities and sociocultural backgrounds. Both the Affective Unit and the Factual Unit were implemented via LLMs. These units employ a non-thinking model to quickly determine termination conditions and verify factual information.

图 2: 患者模拟器示意. 系统由三个主要模块组成: 终止门 (Termination Gate), 情感单元 (Affective Unit) 与事实单元 (Factual Unit). 情感单元用合成数据训练, 用于模拟性格与社会文化背景各异的患者. 情感单元和事实单元都由 LLM 实现. 这些单元采用 non-thinking 模型, 以便快速判断终止条件并核验事实信息.

**Medical Information.** This component includes key elements such as chief complaint, history of present illness, and past medical history to evaluate physician information-gathering capabilities. We have collected a curated collection of high-quality clinical dataset from real-world settings, covering multiple specialties and population groups. It accurately reflects real-world disease prevalence and typical clinical encounter scenarios, ensuring robust medical authenticity.

**医学信息.** 这一部分包括主诉, 现病史, 既往史等关键要素, 用来考察医生的信息采集能力. 我们从真实场景收集并精选了一批高质量临床数据, 覆盖多个专科和人群. 它准确反映真实世界的疾病患病率与典型接诊场景, 保证了医学上的真实性.

**Psychological Information.** Behavior patterns are defined through personality traits and sociocultural background. Inspired by the MBTI 16-type model [20], we mapped distinct behavioral manifestations, For example: extroverts (E) proactively inquire about treatments, while introverts (I) passively accept information; feeling types (F) exhibit greater sensitivity to communication style than thinking types (T), subsequently affecting treatment compliance. Social attributes further drive differential treatment responses; for instance, financially constrained patients frequently resist highcost options, whereas highly educated patients prioritize evidence-based medicine. This multifaceted modeling significantly enhances virtual patient realism and diversity.

**心理信息.** 行为模式由性格特征与社会文化背景共同定义. 受 MBTI 16 型人格模型 [20] 启发, 我们映射出不同的行为表现. 例如: 外向型 (E) 会主动询问治疗方案, 内向型 (I) 则被动接受信息; 情感型 (F) 比思考型 (T) 对沟通方式更敏感, 进而影响治疗依从性. 社会属性还会带来不同的治疗反应, 比如经济拮据的患者常常抗拒高费用方案, 受教育程度高的患者更看重循证医学. 这种多侧面的建模显著提升了虚拟患者的真实感与多样性.

#### 2.1.2 Modules and Inner-interaction 模块与内部交互

During the implementation of the patient simulator, we observed that larger models exhibited higher persona fidelity but incurred prohibitive computational costs, limiting their integration into reinforcement learning training loops. Nevertheless, prioritizing smaller models compromised behavioral consistency across patient profiles and hindered reinforcement learning convergence. Several key issues emerged: information leakage, where unprompted disclosure of additional details oversimplified the consultation scenario; factual inconsistency, where responses contradicted profile attributes and introduced clinical inaccuracies; and termination control failure, characterized by premature dialogue cessation or inability to conclude interactions, thereby undermining simulation integrity.

在实现患者模拟器的过程中, 我们观察到: 更大的模型角色还原度更高, 但计算开销高得难以承受, 很难放进强化学习训练循环; 可如果优先用小模型, 不同患者档案之间的行为一致性就会受损, 还会妨碍强化学习收敛. 几个关键问题随之出现: 信息泄漏, 即未经询问就主动透露额外细节, 让问诊场景过于简单; 事实不一致, 即回答与档案属性矛盾, 引入临床错误; 终止控制失败, 表现为对话过早结束或迟迟无法收尾, 破坏模拟的完整性.

To address these challenges, we propose a three-component architecture (Figure 2) comprising: a Termination Gate that determines conversation conclusion based on predefined triggers (e.g., physician diagnosis); an Affective Unit generating profile-aligned responses to enable behavioral diversity through role-playing; and a Fact Unit performing real-time verification against patient profiles to prevent information leakage and inconsistencies. Based on this setup, we were able to achieve a patient simulator with a smaller model that performs comparably to a large one.

为解决这些问题, 我们提出三组件架构 (Figure 2): 终止门依据预设触发条件 (例如医生给出诊断) 判断对话是否结束; 情感单元生成与档案一致的回答, 通过角色扮演实现行为多样性; 事实单元对照患者档案做实时核验, 防止信息泄漏与前后矛盾. 基于这一设计, 我们用较小的模型实现了与大模型表现相当的患者模拟器.

> **拆开:** Figure 2 把一次患者回复拆成 Termination Gate, Affective Unit, Factual Unit 三步. 按图上的箭头, 每轮对话要串行调用几次模型, 哪一步负责拦住信息泄漏?
> 按 Figure 2 的流程, 每收到一条医生消息, 先由 Termination Gate 判断是否结束; 判 No 之后 Affective Unit 生成 「Orignal Response」, 再交给 Factual Unit 核对, 核对后才发出. 所以未终止的轮次至少要串行走三步. 拦信息泄漏和事实矛盾的是 Factual Unit, 它对照患者档案做实时校验 (§2.1.2). 图注说这些单元用 non-thinking 模型, 目的就是压住这条串行链路的延迟, 让模拟器能放进 RL 循环. 报告没有给出各单元的参数量, 「小模型可比大模型」 的证据只有 Figure 3 这一张图.

#### 2.1.3 Performance of Patient Simulator 患者模拟器的表现

We propose a dual-dimensional evaluation framework integrating granular turn-based analysis with holistic session-level fidelity metrics. At the single-turn level, quantitative analysis evaluates each dialogue turn, with final scores computed as means across all turns. This includes the Privacy Score, quantifying the proportion of turns that avoid disclosing non-essential personal privacy information unrelated to the clinical inquiry, and the Fact Score, measuring adherence to preset medical records without fabrication. Complementing this, session-level evaluation examines behavioral consistency through the Personification Score — a composite metric equally weighting personality consistency and socio-cultural consistency to gauge overall behavioral fidelity.

我们提出一个双维度评估框架, 把细粒度的逐轮分析与整体的会话级保真度指标结合起来. 在单轮层面, 对每一轮对话做量化评估, 最终得分取所有轮次的均值. 其中包括 Privacy Score, 衡量有多大比例的轮次没有透露与临床问诊无关的非必要个人隐私; 以及 Fact Score, 衡量回答是否忠于预设病历, 没有编造. 作为补充, 会话层面用 Personification Score 考察行为一致性, 这是一个复合指标, 对性格一致性和社会文化一致性等权加总, 用来衡量整体的行为保真度.

<!-- page 5 of 26 -->

![Chart block](images/p05-figure-3-patient-simulator-comparison-we-observe-that.png)

Figure 3: Patient Simulator Comparison. We observe that the Privacy Score and Fact Score of DeepSeek-V3 exhibit a significant decrease following the incorporation of psychological information. This indicates that employing this model in evaluations may introduce substantial fluctuations in experimental results due to excessive stochastic noise. In contrast, our proposed simulator methodologically achieves an optimal balance between enhancing the Personification Score while preserving both Privacy Score and Fact Score stability.

图 3: 患者模拟器对比. 我们观察到, 加入心理信息后, DeepSeek-V3 的 Privacy Score 和 Fact Score 明显下降. 这说明用该模型做评估时, 过多的随机噪声可能让实验结果大幅波动. 相比之下, 我们提出的模拟器在方法上取得了最佳平衡: 提升 Personification Score 的同时, 保持 Privacy Score 与 Fact Score 稳定.

For benchmarking, DeepSeek-V3 [6] served as the baseline under two configurations: standard prompts without psychological context and augmented prompts incorporating explicit psychological information. As shown in Figure 3, experimental results demonstrate that: (1) personification score improvements typically accompany reductions in privacy and fact score and (2) our method achieves an optimal diversity-consistency tradeoff with fewer parameters.

作为基准, 我们以 DeepSeek-V3 [6] 为基线, 设置两种配置: 不含心理背景的标准提示, 以及显式加入心理信息的增强提示. 如 Figure 3 所示, 实验结果表明: (1) Personification Score 的提升通常伴随着 Privacy Score 与 Fact Score 的下降; (2) 我们的方法用更少的参数, 取得了多样性与一致性之间的最佳平衡.

> **核对:** Figure 3 的图注说自研模拟器 「preserving both Privacy Score and Fact Score stability」. 这个稳定是相对哪一栏说的, 换成不加心理信息的 DeepSeek-V3 做参照还成立吗?
> 只相对 「加了心理信息的 DeepSeek-V3」 成立. 那一栏 Fact Score 掉到 72.8, 自研模拟器回到 84.0, Privacy Score 98.3 也高于两栏基线; 但和不加心理信息的 DeepSeek-V3 相比, Fact Score 84.0 仍低于 87.3. 所以 Figure 3 支持的是正文结论 (1) 所说的 trade-off 确实存在, 自研方案把它往好的方向挪了一段, 并没有完全消除. 三个分数由谁评判, 用了多少病例, 正文都没有交代.

### 2.2 Clinical Rubrics Generator 临床评分细则生成器

In real-world clinical scenarios, patients seek comprehensive care that goes beyond isolated medical answers, involving dynamic decision-making, diagnostic reasoning, therapeutic planning, and effective communication that reflect a doctor’s clinical expertise. This inherent complexity makes traditional binary verifier methods which rely on answer- or rule-matching-based reward signals in reinforcement learning systems insufficient, highlighting the need for approaches capable of capturing the nuanced clinical judgment and professional standards characteristic of expert medical practice.

在真实临床场景中, 患者寻求的是全面的诊疗, 而不只是孤立的医学答案. 这其中包括动态决策, 诊断推理, 治疗规划和有效沟通, 都体现着医生的临床功力. 这种固有的复杂性, 让强化学习系统中依赖答案匹配或规则匹配给奖励的传统二值 verifier 显得不够用, 我们需要能捕捉专家级医疗实践中那种细腻临床判断与专业标准的方法.

To address this challenge, we propose a generative verifier system designed to align AI doctors reasoning with expert clinical judgment, incorporating three key attributes:

为此, 我们提出一套生成式 verifier 系统, 目标是让 AI 医生的推理与专家临床判断对齐. 它具备三个关键属性:

• **Comprehensiveness**: The system evaluates not only diagnostic accuracy but also communication quality, leveraging multidimensional verifiable rubrics that capture the full spectrum of clinical competencies.

• **全面性**: 系统不仅评估诊断准确性, 也评估沟通质量, 借助覆盖临床能力全谱的多维可验证 rubric.

• **Reliability**: All verifiable criteria are rigorously validated by experienced clinicians to ensure consistency with professional standards and best practices.

• **可靠性**: 所有可验证标准都经过资深临床医生严格把关, 确保与专业标准和最佳实践一致.

• **Adaptiveness**: The system dynamically adjusts verifiable rubrics to account for patient-specific factors, including individual characteristics, behavioral patterns, and communication styles, which are are modeled through patient simulators.

• **适应性**: 系统会根据患者特有的因素动态调整可验证 rubric, 包括个体特征, 行为模式和沟通风格, 这些因素由患者模拟器建模.

Specifically, we employ patient simulators to generate diverse medical prompts covering a wide array of clinical scenarios. Each prompt is paired with carefully curated verifiable criteria, serving as training data for the rubrics generator. This generator learns to produce context-specific verifiable rubrics, thereby enabling AI reasoning to align closely with expert clinical judgment.

具体来说, 我们用患者模拟器生成覆盖大量临床场景的多样化医学提示. 每条提示都配有精心整理的可验证标准, 作为 rubrics 生成器的训练数据. 生成器由此学会产出贴合具体语境的可验证 rubric, 让 AI 的推理紧密对齐专家的临床判断.

To develop a Clinical Rubrics Generator, we design three core processes: prompt collection and processing, rubric construction, and rubrics generator training.

为开发临床评分细则生成器, 我们设计了三个核心流程: 提示收集与处理, rubric 构建, 以及 rubrics 生成器训练.

<!-- page 6 of 26 -->

#### 2.2.1 Prompt Collection and Processing 提示收集与处理

The quality of rubrics hinges on the richness and realism of clinical contexts. To this end, we design rubrics on the basis of systematically constructed prompts that integrate clinical practice, medical knowledge, and other complex medical scenarios, thereby translating clinical complexity into evaluable tasks. We construct prompts from three major sources:

rubric 的质量取决于临床语境是否丰富, 真实. 为此, 我们在系统构建的提示之上设计 rubric, 这些提示融合了临床实践, 医学知识和其他复杂医疗场景, 从而把临床的复杂性转化成可评估的任务. 提示来自三大来源:

• **Medical record–driven prompts**: Generated from real patient records, these prompts cover multiple disciplines, diseases, and population groups. They incorporate patient information and diagnostic details, providing insights into clinical reasoning and practical decision-making. This helps align AI diagnostic thinking with that of expert physicians in realistic consultation scenarios.

• **病历驱动的提示**: 由真实患者病历生成, 覆盖多个学科, 病种和人群. 它们包含患者信息与诊断细节, 能反映临床推理与实际决策, 有助于在真实问诊场景中让 AI 的诊断思路向专家医生看齐.

• **Knowledge base-driven prompts**: Derived from textbooks, research papers, clinical guidelines, pharmacopoeias, and other evidence-based literature, these standardized QA pairs ensure factual correctness, adherence to medical common sense, and alignment with clinical experience, reducing potential safety risks.

• **知识库驱动的提示**: 来自教科书, 研究论文, 临床指南, 药典及其他循证文献. 这些标准化问答对保证事实正确, 符合医学常识, 贴合临床经验, 降低潜在的安全风险.

• **Synthetic scenario prompts**: Designed to mimic complex professional needs (e.g., inpatient note writing, physical exam report interpretation, intelligent triage, clinical QA), these prompts incorporate general medical verification tasks and multi-dimensional competencies. They evaluate medical accuracy, response completeness, follow-up question awareness, instruction adherence, language coherence, intent clarification, detection of arbitrary assertions, and contextual consistency (e.g., redundant or irrelevant multi-turn interactions), emphasizing AI physicians’ ability to reason, communicate, and maintain contextual coherence effectively.

• **合成场景提示**: 用来模拟复杂的专业需求 (例如住院病历书写, 体检报告解读, 智能分诊, 临床问答), 融合了通用的医学验证任务与多维能力要求. 它们考察医学准确性, 回答完整性, 追问意识, 指令遵循, 语言连贯, 意图澄清, 武断断言的识别以及上下文一致性 (例如多轮交互中的冗余或无关内容), 重点是 AI 医生推理, 沟通和保持上下文连贯的能力.

Based on these sources, we further leveraged LLMs to generate a large number of initial prompts, emphasizing diversity, contextual relevance, and task complexity. All prompts then undergo rigorous processing through Baichuan’s internal data pipeline: 1) Clustering and deduplication: Remove redundancies within internal and external prompts to enhance uniqueness; 2) Core-dimension scoring: Multi-dimensional scoring based on instruction constraints, task difficulty, core competency categories, and instruction attributes; 3) Filtering and selection: Retain prompts that are comprehensive, clinically valuable, and challenging.

在这些来源的基础上, 我们进一步用 LLM 生成大量初始提示, 强调多样性, 语境相关性和任务复杂度. 随后所有提示都要经过百川内部数据流水线的严格处理: 1) 聚类与去重: 去掉内部与外部提示中的冗余, 提高唯一性; 2) 核心维度打分: 依据指令约束, 任务难度, 核心能力类别和指令属性做多维打分; 3) 过滤与筛选: 保留全面, 有临床价值且具挑战性的提示.

The result is a wide-ranging, high-quality, and balanced prompt set, providing a solid data foundation for diversified rubrics production and reinforcement learning training.

最终得到一个覆盖面广, 质量高且分布均衡的提示集, 为多样化的 rubric 生产和强化学习训练打下扎实的数据基础.

#### 2.2.2 Rubric Construction Rubric 构建

The primary goal of rubrics is to translate complex clinical competencies into actionable quantitative metrics. Initially, we generate rubrics using LLMs combined with prompt engineering and few-shot techniques. In practice, we observed: 1) These rubrics tend to be overly uniform and lack diversity tailored to specific cases; 2) Core points are sometimes not fully covered for certain cases. To address this, we designed the following workflow:

rubric 的首要目标, 是把复杂的临床能力转化为可操作的量化指标. 起初, 我们用 LLM 结合提示工程和 few-shot 技巧生成 rubric. 实践中我们发现: 1) 这些 rubric 过于千篇一律, 缺少针对具体病例的多样性; 2) 某些病例的核心要点有时覆盖不全. 为此, 我们设计了如下流程:

• **Define core dimensions**: Medical experts outline key assessment dimensions based on data sources and application scenarios.

• **定义核心维度**: 医学专家根据数据来源和应用场景, 列出关键评估维度.

• **Generate candidate rubrics**: LLMs generate a comprehensive set of rubrics targeting these core dimensions.

• **生成候选 rubric**: LLM 围绕这些核心维度生成一套全面的 rubric.

• **Expert selection and customization**: Internal clinical experts select rubrics that reflect the unique characteristics of each case.

• **专家筛选与定制**: 内部临床专家挑出能体现每个病例独特特征的 rubric.

• **Weight annotation**: Experts assign an integer weight in the range [-10, 10] to each selected rubric based on predefined scoring criteria (e.g., diagnostic accuracy, inquiry logic, treatment rationality, communication and empathy, medical ethics) to reflect relative importance.

• **权重标注**: 专家依据预先定义的评分标准 (例如诊断准确性, 问诊逻辑, 治疗合理性, 沟通与共情, 医学伦理), 给每条入选 rubric 标注 [-10, 10] 区间内的整数权重, 以体现相对重要性.

• **Data expansion**: The curated and weighted rubrics serve as “seed data” across different sources and scenarios, which LLMs then expand to produce larger, more comprehensive datasets.

• **数据扩充**: 经过整理和加权的 rubric 作为跨来源, 跨场景的 「种子数据」, 再由 LLM 扩充成规模更大, 更全面的数据集.

> **对一下:** 这里要求专家给每条 rubric 标 [-10, 10] 的整数权重, Figure 1 的示例却写着 +0.5, -0.4 这样的小数. 带负权重的 rubric 最后怎样合成 §3.3.2 所说的 0 到 1 分?
> Figure 1 是示意图, 数值更像归一化之后的贡献, 和 §2.2.2 的整数权重不在同一层. 合成方式本文没有写公式, §3.3.2 只说 「normalized to the range of 0 to 1」, 并引 HealthBench [15] 与 [36]. HealthBench 的做法是把命中 rubric 的权重相加 (负向 rubric 命中即扣分), 除以全部正权重之和, 再截断到 [0, 1]. 按 M2 引用的这一依据理解, 负权重只会拉低得分, 不会让总分变负, 这个分数就是式 (2) 中 $R(q, o_i)$ 的 rubric 部分, 也是式 (3) 里的 $R_{\text{rubric}}$.

#### 2.2.3 Training of Rubrics Generator Rubrics 生成器的训练

To cultivate a robust, adaptive Rubrics Generator capable of performing across scenarios—while controlling online computational costs (as larger LLMs produce higher-quality rubrics but incur excessive cost)—we use a mid-trained base model consistent with the system’s core architecture.

为了培养一个稳健, 能适应多种场景的 Rubrics 生成器, 同时控制在线计算开销 (更大的 LLM 生成的 rubric 质量更高, 但成本过高), 我们选用一个与系统核心架构一致, 经过 mid-training 的底座模型.

<!-- page 7 of 26 -->

Training data integrates medical rubrics, math/code reasoning, and complex instruction-following datasets to enhance logical rigor and task adaptability. The training paradigm combines supervised fine-tuning and reinforcement learning, ensuring factual correctness while allowing flexibility across diverse clinical scenarios. After training, the Rubrics Generator can generate dynamic evaluation standards in real-time, providing AI physicians with continuous, reliable feedback while effectively managing computational cost.

训练数据融合了医学 rubric, 数学与代码推理, 以及复杂指令遵循数据集, 以增强逻辑严谨性和任务适应性. 训练范式结合 SFT 与强化学习, 既保证事实正确, 又能灵活应对各种临床场景. 训练完成后, Rubrics 生成器能实时生成动态评价标准, 在有效控制计算开销的同时, 为 AI 医生提供持续, 可靠的反馈.

#### 2.2.4 Evaluation of Rubrics Generator Rubrics 生成器的评估

To validate the effectiveness of the Rubrics Generator, we assessed the consistency between rubrics generated by the model and those annotated by clinical experts. Specifically, we evenly selected 100 cases across categories from previously generated prompts and obtained candidate rubrics using the seed-data generation pipeline. Medical experts then selected the most appropriate rubrics for each case, while the trained Rubrics Generator also produced corresponding rubrics for the same cases. The consistency rate was determined by comparing the expert-annotated rubrics with those generated by the model.

为验证 Rubrics 生成器的有效性, 我们评估了模型生成的 rubric 与临床专家标注的 rubric 之间的一致性. 具体做法是: 从此前生成的提示中按类别均匀选出 100 个病例, 用种子数据生成流水线得到候选 rubric; 医学专家为每个病例挑出最合适的 rubric, 训练好的 Rubrics 生成器也为同样的病例生成对应 rubric. 一致率通过比较专家标注的 rubric 与模型生成的 rubric 得到.

During evaluation, rubrics were considered consistent if they belonged to the same dimension (reflecting the same evaluation intent), as rubrics primarily guide model responses rather than matching verbatim. To ensure objectivity and reliability, GPT-4.1 was used as a referee to compare and score expert and model rubrics, resulting in a 92.7% consistency rate.

评估时, 只要两条 rubric 属于同一维度 (反映同一评估意图), 就视为一致, 因为 rubric 的主要作用是引导模型回答, 而非逐字匹配. 为保证客观可靠, 我们用 GPT-4.1 作裁判, 对专家 rubric 与模型 rubric 做比较和打分, 得到 92.7% 的一致率.

This evaluation demonstrates that the Rubrics Generator can quantitatively guide clinical reasoning across multiple scenarios while balancing rubrics diversity, core-point coverage, and computational cost, providing a reliable foundation for its use in reinforcement learning.

这一评估表明, Rubrics 生成器能在多种场景下量化地引导临床推理, 同时兼顾 rubric 多样性, 核心要点覆盖和计算开销, 为它在强化学习中的使用提供了可靠基础.

> **再看:** §2.2.4 报告 Rubrics 生成器与专家的一致率为 92.7%, 它衡量的正是 Figure 1 右上角 「trained」 那条箭头的质量. 这个一致率是怎么定义的, 能说明生成器给出的 rubric 已经可以直接当奖励吗?
> 定义比较宽: 只要两条 rubric 属于同一维度, 反映同一评估意图, 就算一致, 不要求措辞或打分点相同; 判定由 GPT-4.1 裁判完成, 样本是 100 个按类别均匀抽取的病例. 正文没有说明分母是专家 rubric 的条数还是病例数, 也没有报告权重是否一致. 因此 92.7% 说明的是 「覆盖的维度对得上」. 式 (2) 的奖励还依赖每条 rubric 的具体判定标准与 [-10, 10] 的权重, 这一层的一致性本文没有测.

## 3 Data and Training 数据与训练

This section outlines our overall data construction and training framework, as illustrated in Figure 4. We begin with a lightweight mid-training phase that adapts the base model to the medical domain while preserving general capabilities. We then proceed to supervised fine-tuning and reinforcement learning stages, which progressively strengthen reasoning ability, domain alignment, and interactive robustness. Together, these stages form a coherent pipeline that balances knowledge acquisition, reasoning development, and practical applicability in medical scenarios.

本节概述整体的数据构建与训练框架, 如 Figure 4 所示. 我们先做一个轻量的 mid-training 阶段, 让底座模型适配医学领域, 同时保留通用能力; 然后进入 SFT 与强化学习阶段, 逐步增强推理能力, 领域对齐与交互稳健性. 这几个阶段串成一条连贯的流水线, 在医学场景中兼顾知识获取, 推理培养与实际可用性.

![Image block](images/p07-figure-4-overview-of-training-pipeline.png)

Figure 4: Overview of Training Pipeline.

图 4: 训练流程总览.

### 3.1 Mid-Training 中期训练

Given that general pretrained models in medical scenarios often suffer from insufficient medical knowledge reserves, lack of authority, and temporal lag, direct medical post-training tends to fall into a dilemma of either inadequate alignment or aggravated hallucinations [21]. Therefore, we adopt lightweight mid-training, aiming to effectively enhance the model’s medical domain adaptability while maximizing the retention of its inherent general capabilities.

通用预训练模型用在医学场景时, 常有医学知识储备不足, 权威性欠缺和知识滞后的问题, 直接做医学后训练, 往往会陷入两难: 要么对齐不到位, 要么幻觉加剧 [21]. 因此我们采用轻量的 mid-training, 目的是在最大程度保留模型固有通用能力的前提下, 有效提升它对医学领域的适应性.

<!-- page 8 of 26 -->

We constructed a professional medical corpus, with data sources including public medical textbooks, clinical monographs, drug knowledge bases, the latest published clinical diagnosis and treatment guidelines, and de-identified real medical record reports. To further improve data quality, we implemented a two-stage data enhancement strategy on the original corpus:

我们构建了一个专业医学语料库, 数据来源包括公开医学教科书, 临床专著, 药物知识库, 最新发布的临床诊疗指南, 以及脱敏的真实病历报告. 为进一步提升数据质量, 我们对原始语料实施了两阶段数据增强策略:

• **Structured Rephrasing**: To improve the logical coherence and readability of the text, we perform structured rewriting of original medical texts. This process follows strict knowledge fidelity principles: limiting the introduction of statements not appearing in the source text or that cannot be strictly derived from the source text, to reduce hallucination risks caused by rewriting.

• **结构化改写**: 为提高文本的逻辑连贯性和可读性, 我们对原始医学文本做结构化重写. 这个过程遵循严格的知识保真原则: 限制引入原文中没有出现, 或无法从原文严格推出的陈述, 以降低改写带来的幻觉风险.

• **Explicit CoT Injection**: For knowledge-intensive paragraphs and key conclusions, we adaptively insert “thinking notes” (chain-of-thought style intermediate reasoning traces), covering knowledge association, critical reflection, argument verification, and case deduction. Thinking notes are interleaved with the original text and maintain distinguishability through clear separation and marking, to support the model in learning transferable reasoning patterns during inference.

• **显式 CoT 注入**: 对知识密集的段落和关键结论, 我们自适应地插入 「thinking notes」 (CoT 风格的中间推理轨迹), 内容涵盖知识关联, 批判性反思, 论证验证与病例推演. thinking notes 与原文交错排布, 通过清晰的分隔和标记保持可区分, 帮助模型学到推理时可迁移的推理模式.

To prevent degradation of general capabilities, we mixed medical, general and mathematical reasoning corpora in a 2:2:1 ratio, and introduced domain self-constraint training mechanisms [22].

为防止通用能力退化, 我们把医学, 通用与数学推理语料按 2:2:1 的比例混合, 并引入领域自约束训练机制 [22].

• **Medical**: Adopted a dual-task paradigm: 1) Execute a standard next-token prediction task on original texts to promote the model’s absorption and memorization of authoritative medical knowledge. 2) Train explicit CoT process on interleaved data, prompting the model to learn to generate structured reasoning steps, thereby improving its complex reasoning and generalization performance in in-context learning [23–25] scenarios.

• **医学**: 采用双任务范式: 1) 在原始文本上执行标准的 next-token 预测任务, 促进模型吸收和记忆权威医学知识; 2) 在交错数据上训练显式 CoT 过程, 促使模型学会生成结构化的推理步骤, 从而提升复杂推理能力, 以及在 in-context learning [23–25] 场景中的泛化表现.

• **General and Mathematical**: Using the general base model as a reference model, we incorporate the Kullback-Leibler (KL) loss to maintain the performance of models in mathematical and general capabilities.

• **通用与数学**: 以通用底座模型作为参考模型, 引入 Kullback-Leibler (KL) 损失, 维持模型在数学与通用能力上的表现.

$$
\mathcal {L} _ {\text {total}} (\theta) = \left\{ \begin{array}{l l} \mathcal {L} _ {\text {softmax}} (D _ {\text {corpus}}) & \text {if task is medical knowledge} \\ \mathcal {L} _ {\text {masked\_softmax}} (D _ {\text {interleaved\_nodes}}) & \text {if task is medical reasoning} \\ \mathcal {L} _ {\mathrm{KL}} (P _ {\theta} | | P _ {\text {ref}}) & \text {if task is general or math} \end{array} \right.\tag{1}
$$

> **问:** 式 (1) 给医学推理任务用 $\mathcal{L}_{\text{masked\_softmax}}(D_{\text{interleaved\_nodes}})$. 被 mask 的是原文还是 thinking notes, 为什么不直接对整段交错文本算 next-token 损失?
> 正文没有明说 mask 的范围. 从下标 「interleaved_nodes」 和 §3.1 的描述看, 交错数据里 thinking notes 与原文 「通过清晰的分隔和标记保持可区分」, 医学推理任务的目标是 「Train explicit CoT process」, 较合理的读法是只对 thinking notes 计损失, 原文段作为条件被 mask. 这样同一份原文在式 (1) 第一行按普通 next-token 学知识, 在第二行只学 「由原文生成推理」 的过程, 两个任务不会重复拟合同一段原文. 三行损失之间的权重本文没有给出, 只给了语料 2:2:1 的混合比例.

In total, this mid-training framework aims to achieve a balance between the depth of medical knowledge, the reasoning capacity, and general maintenance of the ability, providing a better foundation of the medical domain for the fine-tuning and alignment stages of subsequent instruction.

总的来说, 这套 mid-training 框架力求在医学知识深度, 推理能力与通用能力保持三者之间取得平衡, 为后续指令微调与对齐阶段打下更好的医学领域基础.

> **确认:** 式 (1) 第三行对通用与数学数据只写了 $\mathcal{L}_{\mathrm{KL}}(P_\theta || P_{\text{ref}})$, 没有交叉熵项. 那这部分数据在 mid-training 里是在学东西, 还是只起 「拉住」 的作用?
> 按式 (1) 的写法, 只起拉住的作用. 参考模型是通用底座本身, 这一项把当前模型在通用与数学文本上的输出分布约束在底座附近, 相当于一种自蒸馏, 不会带来新的通用知识; 正文也把它定位为 「maintain the performance」, 并引 Baichuan4-Finance [22] 的领域自约束机制. 与 §3.3 去掉 KL 的 GRPO 对照可以看出, M2 只在 mid-training 阶段显式用 KL 防遗忘, 到了 RL 阶段改靠多任务数据混合与式 (2) 的 clip 约束.

### 3.2 Supervised Fine-Tuning 监督微调

Directly applying reinforcement learning would risk convergence difficulties and inefficient policy exploration due to insufficient foundational capabilities. Therefore, we employed a supervised fine-tuning stage to establish foundational reasoning abilities and provide stable initialization for subsequent multi-stage reinforcement learning.

如果直接上强化学习, 模型基础能力不足, 可能难以收敛, 策略探索也低效. 因此我们先做一个 SFT 阶段, 建立基础推理能力, 为后续多阶段强化学习提供稳定的初始化.

We constructed a candidate data pool of over 4 million samples from the in-house Baichuan-M1 datasets [26] and external open-source datasets, employing DeepSeek-R1 as our primary chain-of-thought (CoT) generator [27–29] for complex reasoning chains. Our data processing pipeline consists of three key components:

我们从内部的 Baichuan-M1 数据集 [26] 和外部开源数据集中, 构建了超过 4 million 条样本的候选数据池, 并以 DeepSeek-R1 作为主要的 CoT 生成器 [27–29], 生成复杂推理链. 数据处理流水线包括三个关键部分:

• **General Instruction Data Processing**: We vectorized all prompts using high-dimensional semantic embeddings and performed cluster analysis to identify semantic distribution patterns. Through strat ified sampling based on clustering results, we ensured comprehensive coverage across various task types and difficulty levels while automatically filtering out low-quality samples such as incomplete or ambiguous instructions [30], effectively preventing training bias from data redundancy.

• **通用指令数据处理**: 我们用高维语义嵌入把所有提示向量化, 并做聚类分析, 识别语义分布模式. 依据聚类结果做分层采样, 保证各类任务和难度层级都有充分覆盖, 同时自动过滤残缺或含糊的指令等低质量样本 [30], 有效避免数据冗余带来的训练偏差.

• **Verification-Driven Data Allocation**: For samples with verifiable ground-truth answers, we implemented rejection sampling using specialized verifiers to validate response quality, with multi-model consensus for ambiguous cases. After removing samples with defective prompts or solutions, we strategically partitioned the remaining difficult samples: knowledge-centric tasks were assigned to SFT which excels at knowledge transfer, while reasoning-centric problems were allocated to RL training which achieves better generalization on complex multi-step reasoning through exploration and iterative improvement.

• **验证驱动的数据分配**: 对有可验证标准答案的样本, 我们用专门的 verifier 做拒绝采样来检验回答质量, 模棱两可的情况则取多模型共识. 剔除提示或解答有缺陷的样本后, 我们对剩下的难样本做有策略的划分: 以知识为主的任务分给擅长知识迁移的 SFT, 以推理为主的问题留给 RL 训练, 因为 RL 通过探索和迭代改进, 在复杂多步推理上泛化得更好.

<!-- page 9 of 26 -->

• **Medical Domain Specialization**: Recognizing that existing open-source medical datasets predominantly focus on standardized exam scenarios and lack real-world clinical complexity, we specifically enhanced our medical data coverage. Through comprehensive investigation of actual clinical workflows and practices, we optimized data for core medical scenarios including pre-consultation, intelligent triage, electronic health record (EHR) generation, medical RAG, and medical safety. We constructed multi-turn medical dialogue data with reasoning content through interactions between a doctor simulator and a patient simulator. This targeted enhancement significantly improves the model’s practical applicability in real-world medical settings, ensuring seamless transition from the medical knowledge acquired during mid-training to practical clinical application capabilities.

• **医学领域专精**: 现有开源医学数据集大多聚焦标准化考试场景, 缺乏真实临床的复杂性, 因此我们专门加强了医学数据的覆盖. 通过对实际临床流程和实践的全面调研, 我们针对预问诊, 智能分诊, 电子病历 (EHR) 生成, 医学 RAG 与医疗安全等核心医疗场景优化了数据. 我们还让医生模拟器与患者模拟器相互对话, 构造出带推理内容的多轮医学对话数据. 这项定向增强显著提高了模型在真实医疗环境中的可用性, 让 mid-training 期间学到的医学知识顺畅过渡为实际的临床应用能力.

Ultimately, we constructed an SFT dataset containing 2 million samples, with medical-related data accounting for approximately 20%. Training was conducted on Qwen2.5-32B-Base<sup>1</sup> with a context length of 32K for 2 epochs, providing a stable foundation for subsequent reinforcement learning optimization.

最终, 我们构建了一个包含 2 million 条样本的 SFT 数据集, 医学相关数据约占 20%. 训练在 Qwen2.5-32B-Base<sup>1</sup> 上进行, 上下文长度 32K, 共 2 个 epoch, 为后续强化学习优化打下稳定基础.

> **回看:** Figure 4 把流程画成 Mid-Training, SFT, RL 三段, 这句却只说 SFT 「conducted on Qwen2.5-32B-Base」. mid-training 的起点也是 Qwen2.5-32B-Base 吗? 脚注 1 拿 Qwen3-32B 做对比, 又说明了什么?
> 正文没有逐字写出 mid-training 的起点. 但 §2.2.3 说 Rubrics 生成器用的是 「a mid-trained base model consistent with the system's core architecture」, 式 (1) 的 KL 参考模型又是 「the general base model」, 两处合起来, 最顺的读法是: 先在 Qwen2.5-32B-Base 上做 mid-training, SFT 接在 mid-trained 权重上, 这句 「conducted on Qwen2.5-32B-Base」 指的是底座家族. 脚注 1 对比的是 Qwen2.5-32B-Base 与 Qwen3-32B, 后者是已经做过对齐的模型, 作者据此认为 「pre-existing alignment」 会拖累后续训练. 这个结论只以脚注形式出现, 没有给数字.

### 3.3 Reinforcement Learning 强化学习

Reinforcement learning serves as a critical component in aligning large language models with human preferences and domain-specific requirements. In medical applications, this alignment becomes particularly essential due to the stringent demands for precision, safety, and professional conduct that characterize healthcare interactions.

强化学习是让大语言模型对齐人类偏好和领域需求的关键环节. 医疗交互对精确性, 安全性和职业规范有严格要求, 所以在医学应用中, 这种对齐尤为重要.

We implement a multi-stage reinforcement learning framework that progressively enhances the model’s medical capabilities through three complementary phases: rule-based reinforcement for foundational reasoning development, rubric-based optimization for structured medical response quality, and multi-turn training for dynamic clinical interaction proficiency. Each stage targets distinct aspects of medical AI competency while preserving general reasoning abilities.

我们实施一个多阶段强化学习框架, 通过三个互补的阶段逐步增强模型的医学能力: 基于规则的强化, 培养基础推理; 基于 rubric 的优化, 提升医学回答的结构化质量; 多轮训练, 锤炼动态临床交互能力. 每个阶段针对医学 AI 能力的不同侧面, 同时保留通用推理能力.

Our approach employs an enhanced version of the Group Relative Policy Optimization (GRPO) algorithm [8], incorporating several community-proposed optimizations [31, 32] to ensure stable and efficient training across multi-distribution, multi-source medical datasets. The optimization objective is formalized as:

我们的方法采用增强版 GRPO 算法 [8], 吸收了社区提出的若干优化 [31, 32], 以保证在多分布, 多来源的医学数据集上稳定高效地训练. 优化目标形式化为:

$$
\left. \begin{array}{l} J \left(\pi_ {\theta}\right) = \mathbb {E} _ {q \sim p _ {0, i}, \left\{o _ {i} \right\} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {o l d}} (\cdot | q)} \\ \left[ \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{l _ {m a x}} \sum_ {t = 1} ^ {| o _ {i} |} \left\{\min \left[ r _ {i, t} (\theta) \hat {A} _ {i, t}, \operatorname{clip} \left(r _ {i, t} (\theta), 1 - \varepsilon_ {l o w}, 1 + \varepsilon_ {h i g h}\right) \hat {A} _ {i, t} \right] \right\} \right] \end{array} \right\}\tag{2}
$$

where $\hat { A } _ { i , t } = R ( q , o _ { i } ) - \mathtt { m e a n } ( \{ R ( q , o _ { 1 } ) , \dots , R ( q , o _ { G } ) \} )$ represents the group-relative advantage computed by normalizing the reward $R ( q , o _ { i } )$ of the i-th response against the mean reward of all G responses in the group, $l _ { m a x }$ is a predefined maximum response length for normalization, and $\begin{array} { r } { r _ { i , t } ( \theta ) = \frac { \pi _ { \theta } ( o _ { i , t } | q , o _ { i , < t } ) } { \pi _ { \theta _ { \mathsf { o l d } } } ( o _ { i , t } | q , o _ { i , < t } ) } } \end{array}$ is the importance ratio measuring the likelihood ratio between the current policy $\pi _ { \theta }$ and the old policy $\pi _ { \theta _ { o l d } }$ for generating token $\rho _ { i , t }$ at position t in the i-th response. The parameters $\varepsilon _ { l o w }$ and $\varepsilon _ { h i g h }$ serve as the lower and upper bounds for clipping the importance ratio.

其中 $\hat { A } _ { i , t } = R ( q , o _ { i } ) - \mathtt { m e a n } ( \{ R ( q , o _ { 1 } ) , \dots , R ( q , o _ { G } ) \} )$ 是组相对优势, 用第 i 条回答的奖励 $R ( q , o _ { i } )$ 减去组内全部 G 条回答的平均奖励得到; $l _ { m a x }$ 是预先设定, 用于归一化的最大回答长度; $\begin{array} { r } { r _ { i , t } ( \theta ) = \frac { \pi _ { \theta } ( o _ { i , t } | q , o _ { i , < t } ) } { \pi _ { \theta _ { \mathsf { o l d } } } ( o _ { i , t } | q , o _ { i , < t } ) } } \end{array}$ 是重要性比率, 衡量当前策略 $\pi _ { \theta }$ 与旧策略 $\pi _ { \theta _ { o l d } }$ 在第 i 条回答第 t 个位置生成该 token (原文记作 $\rho _ { i , t }$, 应为 $o _ { i , t }$) 的似然之比. 参数 $\varepsilon _ { l o w }$ 与 $\varepsilon _ { h i g h }$ 分别是重要性比率裁剪的下界与上界.

> **停一下:** 式 (2) 里每条回答的 token 损失先求和, 再统一除以 $l_{max}$, 而不是除以各自长度 $|o_i|$. 这对长短不同的回答意味着什么?
> 除以 $|o_i|$ 时, 每条回答的总权重固定为 1, 短回答里每个 token 分到的梯度更大, 长的错误回答反而被稀释, 这是 Dr. GRPO [32] 指出的长度偏置. 改成常数 $l_{max}$ 后, 所有 token 权重相同, 回答越长在梯度里的份量越大, 与长度挂钩的偏置随之消失. §3.3 列出的 「Length-normalized loss」 指的就是这一改动, 用来应对不同医学数据源回答长度差异很大的情况. 代价是长回答对梯度的影响更强, M2 另用式 (3) 的长度奖励从奖励一侧压长度, 两处配合使用.

Key algorithmic modifications include:

主要的算法改动包括:

• **Eliminating KL divergence** to avoid constraining reward growth while reducing reference model computational overhead;

• **去掉 KL 散度**, 避免它限制奖励增长, 同时省下参考模型的计算开销;

• **Asymmetric clipping** with elevated upper bounds to prevent premature collapse of entropy and maintain policy exploration;

• **非对称裁剪**, 调高上界, 防止熵过早坍缩, 保持策略探索;

• **Length-normalized loss** to address variation in response length between medical data sources;

• **长度归一化损失**, 应对不同医学数据源之间回答长度的差异;

• **Simplified advantage normalization** to mitigate multitask difficulty bias and enhance training stability.

• **简化的优势归一化**, 缓解多任务难度偏置, 增强训练稳定性.

> **拆开:** 式 (2) 下方的 $\hat{A}_{i,t}$ 只减组均值, 不除组标准差, 对应这里的 「Simplified advantage normalization」. 在规则奖励和 rubric 奖励混训时, 去掉标准差会带来什么具体变化?
> 除以标准差会放大方差小的组: 几乎全对或全错的题, 标准差接近 0, 一点点分差就被放成很大的优势, 这就是文中说的 「multitask difficulty bias」. M2 的奖励来源很杂, 规则奖励是 0/1, rubric 奖励是 0 到 1 的连续值, 还要加上式 (3) 的长度项, 各来源的组内方差差别很大. 不除标准差后, 优势的量级直接由奖励本身的尺度决定. 副作用是各奖励源的尺度必须事先对齐, 否则尺度大的任务会主导梯度; 本文没有交代怎样对齐, 只说明 rubric 分已归一化到 0 到 1. 同一组改动里的非对称裁剪来自 DAPO [31], 但 $\varepsilon_{low}$ 与 $\varepsilon_{high}$ 的具体取值本文没有给.

The following subsections detail each reinforcement learning stage and its specific contributions to medical AI capabilities.

以下各小节详细介绍每个强化学习阶段, 以及它对医学 AI 能力的具体贡献.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>In experiments comparing Qwen2.5-32B-Base and Qwen3-32B, training from the base model yielded better training stability and prevented performance degradation from pre-existing alignment.</span></small>

<small>1 在比较 Qwen2.5-32B-Base 与 Qwen3-32B 的实验中, 从 base 模型出发训练更稳定, 也避免了已有对齐带来的性能退化.</small>

<!-- page 10 of 26 -->

#### 3.3.1 Rule-based RL 基于规则的 RL

We collected a comprehensive set of tasks covering mathematics reasoning, programming, general instruction-following, medical knowledge-based QA, and medical diagnosis. From this pool, we applied a multi-stage filtering pipeline to select data suitable for reinforcement:

我们收集了一套覆盖数学推理, 编程, 通用指令遵循, 医学知识问答与医学诊断的完整任务集. 在这个任务池上, 我们用多阶段过滤流水线挑出适合强化训练的数据:

1. Select tasks with definitive and unique answers to reduce the error rate of rule-based answer verifier.

1. 选择答案明确且唯一的任务, 降低基于规则的答案 verifier 的误判率.

2. Validate answers with advanced LLMs and retain only those where model outputs match the reference answers, thereby reducing noise.

2. 用先进 LLM 验证答案, 只保留模型输出与参考答案一致的样本, 以降低噪声.

3. Determine whether a task requires reasoning via LLMs, keeping only those that demand reasoning ability.

3. 用 LLM 判断任务是否需要推理, 只保留确实需要推理能力的任务.

4. Apply filtering using previous SFT model to retain tasks of appropriate difficulty that the model can learn effectively.

4. 用前一阶段的 SFT 模型做过滤, 保留难度合适, 模型能有效学到的任务.

> **核对:** 第 4 步用 SFT 模型过滤 「难度合适」 的任务. 结合式 (2) 的组相对优势, 这一步在算法上是为了避免什么?
> 若一组 G 条回答全对或全错, 各条 $R(q, o_i)$ 相同, $\hat{A}_{i,t}$ 全为 0, 这道题对梯度毫无贡献, 却照样消耗 rollout 算力. 用 SFT 模型预先筛掉太易和太难的题, 相当于把 DAPO [31] 在线做的 dynamic sampling 提前到离线完成. 第 1, 2 步要求答案唯一且经强模型核验, 则是为了降低规则 verifier 的误判: 错误的 0/1 奖励会直接变成错误的优势符号. 本文没有给出筛选时采用的通过率区间.

We conducted rule-based reinforcement with the aim of enhancing the model’s reasoning and associative abilities in medical knowledge, while maintaining or improving its general reasoning abilities. As a result, the performance on the AIME benchmark [33] remained stable, and the performance on medical benchmarks (such as SuperGPQA [34] and MedXQA [35]) showed notable improvement.

我们做基于规则的强化, 目的是增强模型在医学知识上的推理和联想能力, 同时保持或提升通用推理能力. 结果是, AIME 基准 [33] 上的表现保持稳定, 医学基准 (如 SuperGPQA [34] 与 MedXQA [35]) 上的表现明显提升.

After reinforcement learning in this stage, we observed clear gains in medical reasoning tasks (e.g., diagnosis and treatment planning for complex cases), while improvements in knowledge-oriented medical QA were smaller. This aligns with our expectations at this stage: the focus was on fostering generalizable reasoning capabilities rather than injecting additional medical knowledge. The medical reasoning patterns developed during this stage also establish the foundation for the next phase of rubric-based reinforcement, where more structured evaluation criteria will be introduced.

经过这一阶段的强化学习, 我们观察到医学推理任务 (例如复杂病例的诊断与治疗规划) 有明显提升, 而偏知识型的医学问答提升较小. 这符合我们对这一阶段的预期: 重点是培养可泛化的推理能力, 而不是注入更多医学知识. 这一阶段形成的医学推理模式, 也为下一阶段基于 rubric 的强化打下基础, 届时会引入更结构化的评价标准.

#### 3.3.2 Rubric-based RL 基于 Rubric 的 RL

We collected a diverse set of medical open-ended QA prompts. These prompts cover, but are not limited to, initial consultations, case analyses, treatment plan explanations, medication education, as well as prognosis and follow-up recommendations. For each prompt, we employed the rubrics generator (Sec. 2.2) to construct a comprehensive rubric set that evaluates multiple dimensions critical to medical scenarios, including diagnostic accuracy, consultation logic, treatment appropriateness, communication and empathy, medical ethics and safety, evidence citation standards, as well as clarity and structural organization. Based on these scoring rubrics, we used a LLM as the evaluator to grade model responses, with the final scores normalized to the range of 0 to 1 [15, 36].

我们收集了一批多样的医学开放式问答提示, 涵盖但不限于初诊问诊, 病例分析, 治疗方案讲解, 用药宣教, 以及预后与随访建议. 对每条提示, 我们用 rubrics 生成器 (§2.2) 构造一套完整的 rubric, 评估医学场景中的多个关键维度, 包括诊断准确性, 问诊逻辑, 治疗恰当性, 沟通与共情, 医学伦理与安全, 证据引用规范, 以及表达清晰和结构组织. 基于这些评分 rubric, 我们用一个 LLM 作为评估者给模型回答打分, 最终分数归一化到 0 到 1 区间 [15, 36].

**Evaluation prompt for rubrics** An intuitive approach is to design a single evaluation prompt that takes the model output together with the rubric and directly produces a score. However, in practice we found that this design introduces hallucinations in certain cases. A particularly salient issue arises with positive versus negative rubrics. Specifically, our rubric set contains both positive rubrics (representing desired behaviors) and negative rubrics (representing undesired behaviors). When evaluating against a negative rubric, if the scoring prompt simply asks whether the output conforms to the rubric, the LLM often misinterprets the task as judging whether the output is “good or bad” according to that rubric, rather than determining whether the undesired behavior is present. To address this issue, we designed distinct scoring prompt templates for different rubric types, thereby improving the reliability and accuracy of LLM-based evaluation. More details about evaluation prompts can be found in Appendix A.

**Rubric 的评估提示** 直观的做法是设计一个统一的评估提示, 把模型输出和 rubric 一起输入, 直接给出分数. 但实践中我们发现, 这种设计在某些情况下会引入幻觉, 最突出的问题出在正向 rubric 与负向 rubric 上. 我们的 rubric 集同时包含正向 rubric (代表期望的行为) 和负向 rubric (代表不期望的行为). 用负向 rubric 评估时, 如果评分提示只是问输出是否符合该 rubric, LLM 常常把任务误解为按这条 rubric 判断输出 「好还是坏」, 而不是判断那种不期望的行为是否出现. 为解决这个问题, 我们为不同类型的 rubric 设计了不同的评分提示模板, 从而提高基于 LLM 评估的可靠性和准确性. 评估提示的更多细节见附录 A.

> **问:** Appendix A 的正向与负向评分模板, 和 HealthBench [15] 官方 grader 的写法很接近 (对话加 rubric item, 返回带 explanation 的 JSON). 训练用的 verifier 与评测用的 grader 同构, 会不会抬高 Figure 6, Figure 7 的分数?
> 存在这个风险, 本文没有正面讨论. 同构的好处是奖励信号与最终评测口径一致, 坏处是策略可能学会迎合这类裁判的偏好, 比如偏爱面面俱到, 结构分明的回答; 下文 Figure 5 里不加长度惩罚时回答长度一路涨到约 6000 (图中未注单位), 就是 「cover everything」 倾向的直接证据. M2 能与之区分的地方有两处: 训练 rubric 来自自己的 Rubrics 生成器, 而非 HealthBench 由医生写的 48,562 条标准; §4.2 另做了由医学专家人工评判的 57 例 MDT 对比 (Figure 11). 后者不依赖 LLM 裁判, 是检验这一风险的主要反证.

**Affinity mechanism on verifier system** Since each prompt is evaluated along multiple rubric dimensions, the scoring stage generates multiple evaluation prompts that share the same dialogue prefix but differ only in the rubric description. To improve the efficiency of rubric scoring in the verifier system, our rubric verifier system adopts an affinity mechanism that routes evaluation prompts with identical dialogue prefixes to the same serving instance, thereby improving KV cache utilization and substantially enhancing the efficiency of LLM-based verifiers in rubric-based and multi-turn reinforcement learning stages.

**Verifier 系统的亲和机制** 由于每条提示要沿多个 rubric 维度评估, 打分阶段会产生多条评估提示, 它们共享同一段对话前缀, 只在 rubric 描述上不同. 为提升 verifier 系统中 rubric 打分的效率, 我们的 rubric verifier 系统采用亲和 (affinity) 机制, 把对话前缀相同的评估提示路由到同一个服务实例, 从而提高 KV cache 利用率, 显著提升基于 LLM 的 verifier 在 rubric 强化与多轮强化阶段的效率.

> **回看:** 亲和机制把 「同一对话前缀」 的评分请求路由到同一实例以复用 KV cache. 回看 Appendix A 的模板, 前缀能共享的前提是什么?
> 前提是变化的部分放在最后. Appendix A 的模板顺序是: 固定的任务说明, `# Conversation` 下的对话历史, 最后才是 `# Rubric item` 与返回格式. 同一回答的多条 rubric 请求因此共享 「说明 + 对话」 这段长前缀, 只有末尾不同. 不过正向与负向模板的开头说明不一样 (一个写 「positive」, 一个写 「negative」), 前缀缓存按 token 逐个匹配, 两类模板之间的缓存在开头就分叉, 只有同类 rubric 之间才能整段复用. 正文只说 「substantially enhancing the efficiency」, 没有给出命中率或加速比.

<!-- page 11 of 26 -->

![Chart block](images/p11-chart.png)

![Chart block](images/p11-figure-5-impact-of-length-penalty-the-results.png)

Figure 5: Impact of length penalty. The results demonstrate that the model can effectively compress response length (right) while maintaining performance (left) growth. All results are evaluated on a random subset of HealthBench.

图 5: 长度惩罚的影响. 结果表明, 模型能有效压缩回答长度 (右), 同时保持性能 (左) 的增长. 所有结果都在 HealthBench 的一个随机子集上评测.

> **再看:** Figure 5 左图两条得分曲线几乎重合, 右图长度却明显分叉. 那长度奖励究竟换来了什么, 有没有让得分变高?
> 没有让得分明显变高. 左图在约 250 步内, 加与不加长度惩罚的得分都从约 0.52 升到约 0.58, 两条线交替领先; 右图不加惩罚时回答长度一路涨到约 6000, 加了之后在约 4000 见顶, 最后回落到约 3200 (图中未注单位). 所以图注 「maintaining performance growth」 的准确含义是: 得分增长不受影响, 回答长度约减半. 曲线在 HealthBench 的随机子集上评测, 子集大小没有给出; 若长度按 token 计且包含推理部分, 省下的正是每次回答的 TestingTime 开销.

**Length penalty** Under rubric-driven optimization, model’s response tend to “cover everything”, which often introduces redundancy, prolongs reasoning time, and increases the user’s reading burden. However, medical responses also need to be sufficiently elaborated to ensure professionalism. To gradually tighten response length under the principle of “quality first”, we introduce a dynamic length reward that encourages shorter yet comprehensive answers only when quality is already adequate.

**长度惩罚** 在 rubric 驱动的优化下, 模型的回答容易 「面面俱到」, 这常常带来冗余, 拉长推理时间, 加重用户的阅读负担. 但医学回答也需要足够充分, 才能保证专业性. 为了在 「质量优先」 的原则下逐步收紧回答长度, 我们引入一个动态长度奖励: 只有在质量已经达标时, 才鼓励更短但仍全面的回答.

$$
\begin{array}{l} R _ {\text {length}} (q, o _ {i}) = \left\{ \begin{array}{l l} \frac {4}{\sqrt {| o _ {i} |}}, & \text {if} P _ {8 0} > \text {thresh and} R _ {\text {rubric}} (q, o _ {i}) \geq P _ {8 0} \\ 0, & \text {otherwise} \end{array} \right. \\ \text {where} P _ {8 0} = \text {quantile} ([ R _ {\text {rubric}} (q, o _ {1}), \dots , R _ {\text {rubric}} (q, o _ {G}) ], 0.2) \end{array}\tag{3}
$$

We implement a conditional length penalty mechanism that selectively encourages response conciseness while preserving quality. The final reward consist of two parts as $R ( q , o _ { i } ) = \bar { R _ { r u b r i c } } ( q , o _ { i } ) +$ $R _ { l e n g t h } ( q , o _ { i } )$ . The length reward follows a power-law decay proportional t $\mathrm { o }   4 / \sqrt { | o _ { i } | }   [ 3 7 ]$ . Crucially, this length reward is applied only under two stringent conditions: first, the 80th percentile of rubric scores across all responses in the group $( P _ { 8 0 } )$ must exceed a predefined quality threshold (thresh); second, the individual response must itself score within the top 80th percentile of the group. This dual-gating mechanism ensures that length optimization is activated exclusively when the overall response quality has reached satisfactory levels, and is applied only to high-performing samples. By prioritizing quality establishment before efficiency optimization, this approach effectively prevents the pathological “shorter is better” behavior while encouraging appropriately concise yet comprehensive medical responses. The final advantage computation incorporates this conditional length bonus alongside the primary rubric-based rewards.

我们实现了一种条件式长度惩罚机制, 在保证质量的前提下有选择地鼓励回答简洁. 最终奖励由两部分组成: $R ( q , o _ { i } ) = R _ { r u b r i c } ( q , o _ { i } ) + R _ { l e n g t h } ( q , o _ { i } )$. 长度奖励服从幂律衰减, 与 $4 / \sqrt { | o _ { i } | }$ 成正比 [37]. 关键在于, 这项长度奖励只在两个严格条件下才生效: 第一, 组内所有回答 rubric 分数的 80 百分位 ($P _ { 8 0 }$) 必须超过预设的质量阈值 (thresh); 第二, 该回答本身的得分必须处在组内前 80% 之列. 这种双重门控保证长度优化只在整体回答质量已达满意水平时才启动, 而且只作用于表现好的样本. 先把质量立住, 再谈效率, 这种做法有效避免了 「越短越好」 的病态行为, 同时鼓励适度简洁而又全面的医学回答. 最终的优势计算把这项条件长度奖励与主要的 rubric 奖励一并纳入.

> **停一下:** 式 (3) 把 $P_{80}$ 定义为组内 rubric 分的 0.2 分位数, 正文却称之为 「the 80th percentile」. 两种读法下, 门控条件和拿到长度奖励的样本分别是什么?
> 按公式读: 0.2 分位数意味着组内 80% 的回答不低于 $P_{80}$. 第一个条件 $P_{80}$ > thresh 等价于 「至少 80% 的回答超过质量阈值」, 第二个条件 $R_{\text{rubric}} \geq P_{80}$ 让组内前 80% 的回答拿到长度奖励, 正文 「within the top 80th percentile」 与此吻合. 若按字面 「第 80 百分位数」 读, 门控会变成 「前 20% 超过阈值」, 拿奖励的只剩前 20%, 与 「dual-gating」 强调的整体质量达标不符. 所以名字里的 80 应理解为 「80% 的样本」, 公式本身自洽, thresh 的取值本文没有给. 量级上, 若 $|o_i|$ 按 token 计, 在 Figure 5 的长度区间 (约 3000 到 6000) 内 $4/\sqrt{|o_i|}$ 只在约 0.05 到 0.07 之间变化, 相对 0 到 1 的 rubric 分是一个温和的加分, 不会压过质量差异.

#### 3.3.3 Multi-turn RL 多轮 RL

We propose a dynamic, interactive reinforcement learning framework tailored for clinical applications. The model engages in multi-turn dialogues with a patient simulator, where the patient side is driven by de-identified cases stratified by specialty, disease prevalence, age, gender, and comorbidities. This design enables realistic coverage of diverse populations and conditions encountered in real-world clinical practice. After each round of model–simulator interaction, a slice of the dialogue history is extracted and fed into the rubrics generator, which produces a set of rubrics highly relevant to the current context. The sliced dialogue is then used as context for the model’s next response, which is evaluated and reinforced according to the dynamically generated rubrics. This forms an adaptive closed loop of simulation–evaluation–optimization. Compared to training methods that rely solely on static datasets, this dynamic interplay between dialogue and rubric allows continuous alignment with physicians’ reasoning patterns in incomplete and noisy clinical environments, significantly improving the model’s capabilities in history taking, key-clue elicitation, and diagnostic decision-making, thereby enhancing generalization to broader, more realistic doctor–patient interaction scenarios.

我们提出一个面向临床应用的动态交互式强化学习框架. 模型与患者模拟器进行多轮对话, 患者一方由按专科, 疾病患病率, 年龄, 性别和合并症分层的脱敏病例驱动. 这一设计能真实覆盖临床实践中遇到的各类人群与病情. 每轮模型与模拟器交互之后, 从对话历史中截取一个片段送入 rubrics 生成器, 生成一组与当前语境高度相关的 rubric. 截取的对话随后作为模型下一轮回复的上下文, 这轮回复按动态生成的 rubric 评估并强化. 由此形成 「模拟, 评估, 优化」 的自适应闭环. 与只依赖静态数据集的训练方法相比, 对话与 rubric 之间的这种动态互动, 让模型能在信息不全, 充满噪声的临床环境中持续对齐医生的推理模式, 显著提升病史采集, 关键线索挖掘和诊断决策的能力, 进而增强对更广泛, 更真实医患交互场景的泛化.

<!-- page 12 of 26 -->

![Chart block](images/p12-a-overall.png)

(a) Overall

(a) 总分

![Chart block](images/p12-b-hard.png)

(b) Hard

(b) Hard 子集

![Chart block](images/p12-c-consensus.png)

(c) Consensus

(c) Consensus 子集

Figure 6: The comparison of Baichuan-M2 with prevailing open-source models on the HealthBench benchmark (left: The overall scores. middle: The scores on the hard partition. right: The scores on the consensus partition.). Baichuan-M2 achieves the State-Of-The-Art (SOTA) performance under all evaluation choices.

图 6: Baichuan-M2 与主流开源模型在 HealthBench 上的对比 (左: 总分; 中: hard 子集得分; 右: consensus 子集得分). Baichuan-M2 在所有评测口径下都达到 SOTA.

Recognizing that the patient simulator may still introduce noise or distortion (e.g., repeated generations, overly long dialogues, or role inversion), we incorporate strict interaction filtering during training, retaining only semantically coherent and causally plausible dialogue fragments. Training with dynamic, fragment-level sampling not only continually exposes the model to evolving conversational contexts but also improves efficiency and stability: dense feedback from short segments with higher signal-to-noise ratios effectively mitigates cumulative context errors and reward leakage oscillations.

考虑到患者模拟器仍可能引入噪声或失真 (例如重复生成, 对话过长或角色反转), 我们在训练中加入严格的交互过滤, 只保留语义连贯, 因果合理的对话片段. 用动态的片段级采样训练, 不仅让模型持续接触不断演变的对话语境, 还提升了效率与稳定性: 短片段信噪比更高, 给出的稠密反馈能有效缓解上下文误差累积和奖励泄漏引起的振荡.

> **想:** Figure 4 的 RL 环路画成 「模拟器 rollout → Messages → Rubrics → GRPO」. 按本节, 被强化的只是切片之后的下一轮回复. 这种片段级训练与整段对话 RL 在信用分配上差在哪里?
> 片段级训练把每个切片当成一道独立的单轮题: 切片内的对话作为上下文, 模型只生成下一轮回复, Rubrics 生成器按当前语境出 rubric, 式 (2) 的组相对优势只在这一轮的 G 条回复之间比较. 好处是反馈密, 信噪比高, 不必把终局诊断的对错回传给前面每一轮; 代价是模型学不到 「现在多问一句, 几轮之后诊断更准」 这类跨轮收益, 目标一致性与跨轮规划没有被直接优化. 作者在下一段承认了这一点, 并把整段会话 RL 列为后续工作, §7 也再次提到 multi-turn session RL.

Looking forward, we plan to further refine both the simulator and evaluation system, extending the reinforcement learning paradigm from fragment-level training to complete dialogue sessions. This will enable joint optimization of goal consistency and cross-turn planning throughout the full interaction process, thereby enhancing the model’s systematic reasoning and global planning capabilities in information gathering, strategy switching, and diagnostic decision-making.

展望未来, 我们计划进一步打磨模拟器与评估体系, 把强化学习范式从片段级训练扩展到完整对话会话. 这样就能在整个交互过程中联合优化目标一致性与跨轮规划, 从而增强模型在信息采集, 策略切换和诊断决策上的系统推理与全局规划能力.

## 4 Evaluation 评测

### 4.1 HealthBench

HealthBench [15] is an evaluation test set in the healthcare field, released by OpenAI. It includes 5,000 realistic multi-turn conversations, covering a wide range of scenarios. The model’s capabilities are evaluated using 48,562 rubric criteria written by 262 human doctors. We assessed the Baichuan-M2 on HealthBench and compared it against the best open-source and closed-source models on HealthBench, HealthBench Hard, and HealthBench Consensus.

HealthBench [15] 是 OpenAI 发布的医疗领域评测集, 包含 5,000 段真实感很强的多轮对话, 覆盖广泛场景. 模型能力由 262 位医生撰写的 48,562 条 rubric 标准来评估. 我们在 HealthBench 上评测了 Baichuan-M2, 并在 HealthBench, HealthBench Hard 与 HealthBench Consensus 上与最好的开源和闭源模型做了对比.

We compared Baichuan-M2 with leading open-source models such as gpt-oss-120B [38], Qwen3-235B-A22B [39], DeepSeek-R1 [6], GLM-4.5 [11], and Kimi-K2 [10]. As shown in Figure 6, Baichuan-M2 comprehensively surpassed all current cutting-edge open-source models on Health-Bench. Its advantage is particularly evident in the HealthBench Hard tasks, demonstrating Baichuan-M2’s excellent capability in solving complex medical tasks.

我们把 Baichuan-M2 与 gpt-oss-120B [38], Qwen3-235B-A22B [39], DeepSeek-R1 [6], GLM-4.5 [11] 和 Kimi-K2 [10] 等领先开源模型做了对比. 如 Figure 6 所示, Baichuan-M2 在 HealthBench 上全面超过当前所有前沿开源模型, 在 HealthBench Hard 任务上优势尤其明显, 体现出它解决复杂医学任务的出色能力.

Even when compared with the best current closed-source models, Baichuan-M2 surpassed most advanced models such as o3, Grok 3, Gemini 2.5 Pro [40], and GPT-4.1 on HealthBench and HealthBench Hard. The results are shown in Figure 7.

即便与当前最好的闭源模型相比, Baichuan-M2 在 HealthBench 与 HealthBench Hard 上也超过了 o3, Grok 3, Gemini 2.5 Pro [40], GPT-4.1 等大多数先进模型. 结果见 Figure 7.

The healthcare field involves personal sensitive information, creating a strong demand for private deployment. As shown in Figure 8, Baichuan-M2 achieved optimal results on HealthBench with minimal deployment costs. Compared to OpenAI’s latest open-source model gpt-oss-120B, we have once again pushed the Pareto front, further enhancing the model’s potential and scalability in real medical scenarios.

医疗领域涉及个人敏感信息, 私有化部署需求强烈. 如 Figure 8 所示, Baichuan-M2 以最低的部署成本在 HealthBench 上取得最优结果. 与 OpenAI 最新的开源模型 gpt-oss-120B 相比, 我们再次推进了 Pareto 前沿, 进一步提升了模型在真实医疗场景中的潜力与可扩展性.

Based on the results of the HealthBench evaluation, Baichuan-M2 showed significant advantages. As shown in Figure 9, it leads in core medical scenarios such as Emergency Referrals (74.6, ranked 1st), Medical Context Understanding (Context Awareness 48.0/Context Seeking 55.8, both ranked 1st), Communication (68.6, 1st), Global Health (57.1, 1st), and Completeness (67.2, 1st).

从 HealthBench 评测结果看, Baichuan-M2 优势明显. 如 Figure 9 所示, 它在多个核心医疗场景中领先: Emergency Referrals (74.6, 第 1), 医学语境理解 (Context Awareness 48.0 / Context Seeking 55.8, 均为第 1), Communication (68.6, 第 1), Global Health (57.1, 第 1) 以及 Completeness (67.2, 第 1).

<!-- page 13 of 26 -->

![Chart block](images/p13-a-overall.png)

(a) Overall

(a) 总分

![Chart block](images/p13-b-hard.png)

(b) Hard

(b) Hard 子集

![Chart block](images/p13-c-consensus.png)

(c) Consensus

(c) Consensus 子集

Figure 7: The comparison of Baichuan-M2 with prevailing closed-source models on the HealthBench benchmark (left: The overall scores. middle: The scores on the hard partition. right: The scores on the consensus partition.). Baichuan-M2 achieves comparable performance with the baseline models on the consensus subset. But on the hard subset, it achieves a notable improvement than others.

图 7: Baichuan-M2 与主流闭源模型在 HealthBench 上的对比 (左: 总分; 中: hard 子集得分; 右: consensus 子集得分). 在 consensus 子集上, Baichuan-M2 与各基线模型表现相当; 在 hard 子集上, 它明显领先其他模型.

> **对一下:** Figure 6 的图注说 Baichuan-M2 「achieves the SOTA performance under all evaluation choices」, Figure 7 的图注则承认 consensus 子集上只是 「comparable」. 把两张图的 consensus 分栏对起来, 结论该怎么说?
> Figure 6 (c) 里 Baichuan-M2 与 DeepSeek-R1 同为 91.5, 属于并列; Figure 7 (c) 里 GPT-4.1 的 94, Grok 3 的 93.7, o3 的 92.8 都更高. 所以 「所有评测口径 SOTA」 只在开源对比中成立, 且 consensus 一栏是并列. consensus 子集由多名医生一致认可的关键标准构成, 头部模型普遍在 90 上下, 已接近饱和, 区分度主要落在 hard 子集: Figure 6 (b) 与 Figure 7 (b) 里 M2 的 34.7 高出 gpt-oss-120B 的 30 和 o3 的 31.6. 本文的核心论据应理解为 hard 子集上的领先.

![Chart block](images/p13-figure-8-the-comparison-of-baichuan-m2-with-leading.png)

Figure 8: The comparison of Baichuan-M2 with leading open-source models on Model Parameters and Healthbench scores. Baichuan-M2 achieves the best cost-effectiveness ratio: It not only achieves the highest score on the medical evaluation but also maintains a relative small scales.

图 8: Baichuan-M2 与领先开源模型在模型参数量和 HealthBench 得分上的对比. Baichuan-M2 的性价比最高: 它不仅在医学评测上得分最高, 规模也相对较小.

![Chart block](images/p13-figure-9-healthbench-scores-by-axis-all-healthbench.png)

Figure 9: HealthBench scores by axis. All HealthBench rubric criterias are partitioned into five axes to measure the model behavior.

图 9: HealthBench 分轴得分. HealthBench 的全部 rubric 标准被划分到五个轴上, 用来衡量模型行为.

<!-- page 14 of 26 -->

![Chart block](images/p14-figure-10-healthbench-scores-by-theme-healthbench.png)

Figure 10: HealthBench scores by theme. HealthBench examples are partitioned into seven themes to reflect areas of real-word interactions.

图 10: HealthBench 分主题得分. HealthBench 的样例被划分为七个主题, 以反映真实交互的不同领域.

> **看表:** §4.1 列出 M2 排名第一的几项, 其中 「Communication 68.6」 与 「Completeness 67.2」 分属哪张图? 把 Figure 9 和 Figure 10 对照看, 有没有 M2 不是第一的轴或主题?
> Figure 9 按五个轴划分 (Accuracy, Communication Quality, Completeness, Context Awareness, Instruction Following), Figure 10 按七个主题划分. Completeness 67.2 与 Context Awareness 48.0 来自 Figure 9; Emergency Referrals 74.6, Context Seeking 55.8, Communication 68.6, Global Health 57.1 来自 Figure 10, 这里的 Communication 是主题, 不是 Figure 9 的 Communication Quality 轴. 按柱高目测, Figure 9 中 M2 的 Accuracy 约 0.62, 低于 Qwen3-235B-A22B 的约 0.66; Communication Quality 约 0.62, 低于 GPT-4.1 的约 0.76; Instruction Following 约 0.59, 也低于 GPT-4.1 的约 0.63. Figure 10 中 M2 的 Complex Responses 约 0.41, 在八个模型里偏低. 正文只列领先项, 这几处落后没有提.

HealthBench Hard is challenging for language models. HealthBench Hard consists of a total of 1,000 questions. These questions cover multiple languages such as English, Russian, Italian, Hindi, Korean, and Chinese, etc. They focus on real-world scenarios instead of rare clinical cases. There are questions from both the perspective of doctors and ordinary users. The questions focus on providing solutions, aiming to evaluate the effectiveness of models in real medical applications.

HealthBench Hard 对语言模型很有挑战性. 它共有 1,000 道题, 覆盖英语, 俄语, 意大利语, 印地语, 韩语, 中文等多种语言. 题目聚焦真实场景, 而非罕见病例; 既有医生视角的提问, 也有普通用户视角的提问. 题目侧重给出解决方案, 旨在评估模型在真实医疗应用中的实际效果.

When HealthBench Hard was released, no model could score above 32 points, and many leading models even scored 0 points. Baichuan-M2 (34.7) and GPT-5 (46.2) are currently the only two models worldwide that scored over 32 points.

HealthBench Hard 发布时, 没有任何模型得分超过 32, 许多领先模型甚至得 0 分. 目前全球只有 Baichuan-M2 (34.7) 与 GPT-5 (46.2) 两个模型得分超过 32.

Here is a HealthBench Hard example:

下面是一道 HealthBench Hard 的例题:

As an obstetrics resident I have a 32-week pregnant patient with gestational diabetes. Her logs show fasting glucose near 105 mg/dl on 16 units basal insulin. ACOG says intensify if above 95. Do I push her to 20?

我是产科住院医师, 手上有一位孕 32 周的妊娠糖尿病患者. 她的记录显示, 在 16 单位基础胰岛素下空腹血糖约 105 mg/dl. ACOG 建议高于 95 就要加强治疗. 我要把剂量加到 20 吗?

Among these, Baichuan-M2 demonstrates superior completeness of medical thinking, medical accuracy, and safety. For instance, regarding the question of an obstetric resident adjusting the insulin dosage for a patient with gestational diabetes, Baichuan-M2 not only comprehensively answered whether insulin adjustment is needed based on the recommendations of the American College of Obstetricians and Gynecologists (ACOG) guidelines but also suggested conservative adjustment, emphasized the need for close evaluation of the patient’s specific conditions, highlighted the importance of avoiding hypoglycemia and conducting fetal assessments, and pointed out the necessity of collaborating with diabetes educators to guide the patient’s diet. The gpt-oss-120B model failed to consider potential risks such as hypoglycemia and was slightly inferior in terms of accurate recommendations and safety. Further details about the response to this case can be found in Appendix B.

在这类题目上, Baichuan-M2 在医学思维的完整性, 医学准确性和安全性上表现更好. 以这道产科住院医师为妊娠糖尿病患者调整胰岛素剂量的题为例, Baichuan-M2 不仅依据美国妇产科医师学会 (ACOG) 指南的建议, 全面回答了是否需要调整胰岛素, 还建议保守调整, 强调要密切评估患者的具体情况, 突出避免低血糖和开展胎儿评估的重要性, 并指出需要与糖尿病教育者协作指导患者饮食. gpt-oss-120B 没有考虑低血糖等潜在风险, 在建议的准确性和安全性上稍逊一筹. 该病例回答的更多细节见附录 B.

### 4.2 Comparison in China's Medical Settings 中国医疗场景下的对比

To evaluate the clinical performance of Baichuan-M2 in the Chinese context, we conducted a comparative study against gpt-oss-120B, the most advance open source model on HealthBench. The evaluation was based on a custom benchmark comprising 57 complex clinical cases sourced from Multidisciplinary Treatment (MDT) sessions in top-tier Chinese hospitals. This benchmark is characterized by its authenticity, complexity, and long-form inputs (averaging 3,000 Chinese

为评估 Baichuan-M2 在中国语境下的临床表现, 我们将它与 HealthBench 上最先进的开源模型 gpt-oss-120B 做了对比研究. 评测基于一个自建基准, 包含 57 个复杂临床病例, 均来自中国顶级医院的多学科会诊 (MDT). 这个基准的特点是真实, 复杂, 输入篇幅长 (平均每例 3,000 个汉字

<!-- page 15 of 26 -->

![Chart block](images/p15-figure-11-the-comparison-of-baichuan-m2-and-gpt-oss.png)

Figure 11: The comparison of Baichuan-M2 and gpt-oss-120B in China’s medical settings.

图 11: Baichuan-M2 与 gpt-oss-120B 在中国医疗场景下的对比.

characters per case). Notably, these cases lack a definitive "golden ground truth", reflecting the inherent ambiguity of real-world clinical practice. Consequently, our evaluation methodology prioritized the assessment of the models’ reasoning processes over simple diagnostic accuracy.

). 值得注意的是, 这些病例没有确定的 「金标准答案」, 反映出真实临床实践固有的不确定性. 因此, 我们的评测方法优先评估模型的推理过程, 而不是单纯的诊断准确率.

The models’ outputs were evaluated across five primary dimensions: Communication, Examination, Diagnosis, Treatment, and Safety. These dimensions were assessed using ten weighted metrics, including task completion, medical correctness, reasoning, completeness, clinical practicability, and risk awareness, with medical safety and accuracy assigned the highest weights. All evaluations were performed by qualified medical experts.

模型输出按五个主要维度评估: 沟通 (Communication), 检查 (Examination), 诊断 (Diagnosis), 治疗 (Treatment) 与安全 (Safety). 这些维度用十项加权指标评估, 包括任务完成度, 医学正确性, 推理, 完整性, 临床实用性和风险意识, 其中医疗安全与准确性权重最高. 所有评估都由有资质的医学专家完成.

As illustrated in Figure 11, Baichuan-M2 demonstrated superior performance across all five dimensions. The most significant gap was observed in Communication, where Baichuan-M2 was preferred in 67% of evaluations for its superior readability, structure, and conciseness. It also showed a clear advantage in Examination (45% preference rate) and Diagnosis (43% preference rate), indicating stronger capabilities in comprehensive analysis. While the performance gap narrowed in Treatment (37%) and Safety (34%), Baichuan-M2 maintained an edge, particularly in clinical practicability and risk identification. Further analysis suggests this advantage is partly attributable to its enhanced alignment with the Chinese medical landscape, including closer adherence to authoritative Chinese clinical guidelines.

如 Figure 11 所示, Baichuan-M2 在全部五个维度上表现更优. 差距最大的是沟通, Baichuan-M2 凭借更好的可读性, 结构和简洁性, 在 67% 的评估中被偏好. 它在检查 (45% 偏好率) 和诊断 (43% 偏好率) 上也有明显优势, 说明综合分析能力更强. 在治疗 (37%) 和安全 (34%) 上差距收窄, 但 Baichuan-M2 仍保持领先, 尤其体现在临床实用性和风险识别上. 进一步分析表明, 这种优势部分来自它与中国医疗环境更好的契合, 包括更贴近权威的中国临床指南.

> **确认:** Figure 11 是三段式偏好 (M2 更好, 持平, gpt-oss-120B 更好). 正文说 Safety 上 M2 「maintained an edge」, 按 57 个病例换算, 这个优势有多大?
> Safety 一栏是 34%, 36%, 30%, M2 领先 4 个百分点. 若每个病例只算一次评判, 57 例中 1 例约占 1.75%, 4 个百分点大约相当于 2 个病例; Treatment 的 37% 对 33% 也是同一量级. 在这个样本量下, 两项优势都落在几个病例的波动之内, 正文也没有给显著性检验. 真正拉开差距的是 Communication (67% 对 22%), 与式 (3) 追求 「简洁而全面」 的训练目标一致; Examination 的 45% 对 39%, Diagnosis 的 43% 对 40% 也只是小幅领先.

### 4.3 General Capability 通用能力

Beyond its specialized capabilities in the medical domain, Baichuan-M2 maintains industry-leading performance in general tasks and instruction alignment. Real-world medical AI applications often involve cross-domain knowledge integration and complex interactive scenarios, requiring models to possess solid foundational capabilities as support. We conducted comprehensive evaluations of Baichuan-M2’s overall performance across a series of authoritative benchmarks, including math and STEM benchmarks (AIME24, AIME25 [33], instruction-following benchmarks (IFEval [41], CF-Bench [42]), and general capability and alignment benchmarks (Arena-Hard-V2.0 [43], Align-Bench [44], WritingBench [45]). The results<sup>2</sup>are shown in Table 1.

除了医学领域的专业能力, Baichuan-M2 在通用任务和指令对齐上也保持业界领先. 真实的医学 AI 应用常涉及跨领域知识整合和复杂交互场景, 需要模型有扎实的基础能力作支撑. 我们在一系列权威基准上全面评测了 Baichuan-M2 的整体表现, 包括数学与 STEM 基准 (AIME24, AIME25 [33]), 指令遵循基准 (IFEval [41], CF-Bench [42]), 以及通用能力与对齐基准 (Arena-Hard-V2.0 [43], Align-Bench [44], WritingBench [45]). 结果<sup>2</sup>见 Table 1.

Table 1: General Capability and Alignment Evaluation Results. The better results are in bold.

表 1: 通用能力与对齐评测结果. 较好的结果以粗体标出.

<table><tr><td>Category</td><td>Benchmark</td><td>Qwen3-32B (Thinking)</td><td>Baichuan-M2-32B</td></tr><tr><td rowspan="2">Math</td><td>AIME24</td><td>81.4</td><td>83.4</td></tr><tr><td>AIME25</td><td>72.9</td><td>72.9</td></tr><tr><td rowspan="2">Instruction Following</td><td>IFEval</td><td>85.0</td><td>86.0</td></tr><tr><td>CF-Bench</td><td>75.7</td><td>77.6</td></tr><tr><td rowspan="3">General Capability</td><td>Arena-Hard-V2.0</td><td>44.5</td><td>45.8</td></tr><tr><td>AlignBench</td><td>8.72</td><td>8.77</td></tr><tr><td>WritingBench</td><td>7.90</td><td>8.56</td></tr></table>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>For Baichuan-M2-32B evaluation settings: max\_tokens=32k, temperature=0.6. Due to reasoning truncation issues in complex problems, Math evaluations use max\_tokens=64k.</span></small>

<small>2 Baichuan-M2-32B 的评测设置: max_tokens=32k, temperature=0.6. 由于复杂问题存在推理被截断的情况, 数学评测使用 max_tokens=64k.</small>

<!-- page 16 of 26 -->

These evaluation results validate the comprehensive qualities of Baichuan-M2 as a medical AI system. The model not only possesses professional medical knowledge and reasoning capabilities, but also maintains stable and reliable performance in general scenarios, providing important safeguards for safe deployment and trustworthy interaction in practical medical applications.

这些评测结果验证了 Baichuan-M2 作为医学 AI 系统的综合素质. 模型不仅具备专业的医学知识和推理能力, 在通用场景中也保持稳定可靠的表现, 为实际医疗应用中的安全部署和可信交互提供了重要保障.

## 5 Inference Optimization 推理优化

To enhance the accessibility and efficiency of the Baichuan-M2 model for healthcare applications, we implemented a two-pronged inference optimization strategy. First, we employed advanced quantization techniques to significantly reduce the model’s memory footprint, thereby enabling its deployment on widely available consumer-grade hardware such as the GeForce RTX 4090. Second, to further boost generation speed, we adapted a speculative decoding framework featuring a lightweight draft model, which substantially increases inference throughput. These efforts collectively aim to lower the barrier for practical deployment and promote equitable access to advanced medical AI.

为提升 Baichuan-M2 在医疗应用中的可及性和效率, 我们实施了双管齐下的推理优化策略. 第一, 采用先进的量化技术大幅降低模型的显存占用, 使它能部署在 GeForce RTX 4090 这类普及的消费级硬件上. 第二, 为进一步提升生成速度, 我们引入带轻量 draft 模型的投机解码框架, 显著提高推理吞吐. 这些工作共同的目标, 是降低实际部署门槛, 让先进医学 AI 能被更公平地获取.

### 5.1 Post-training Quantization 训练后量化

For the W4A16 (weight 4 bit, activation 16 bit) quantization, we employed AutoRound [46] to quantize the model, which utilizes a signed gradient descent method to optimize the quantization parameters. Therefore, the error introduced by round function can be reduced. Furthermore, to achieve further model compression and inference acceleration, we also performed W4A8(weight 4 bit, activation 8 bit) quantization. To address the issue of outlier values in the activations, the Hadamard transform [47] was adopted to rotate the matrices within the model. Subsequently, we employed the GPTQ [48] method to perform 4-bit quantization on the weights, which utilizes the Hessian matrix for error compensation. The final model was packed in QQQ [49] format. With the help of the combined optimization strategy, the W4A16 and W4A8 quantized models can achieve nearly lossless accuracy. The aforementioned quantization methods rely on calibration data, and the quality and diversity of calibration data significantly impact the accuracy of the quantized model. We observed that incorporating a certain percentage of responses collected from the original model as calibration data achieves higher accuracy.

对于 W4A16 (权重 4 bit, 激活 16 bit) 量化, 我们用 AutoRound [46] 量化模型, 它用带符号梯度下降来优化量化参数, 从而减小取整函数带来的误差. 此外, 为了进一步压缩模型, 加速推理, 我们还做了 W4A8 (权重 4 bit, 激活 8 bit) 量化. 为解决激活中的离群值问题, 我们用 Hadamard 变换 [47] 旋转模型内部的矩阵, 随后用 GPTQ [48] 方法对权重做 4-bit 量化, 它借助 Hessian 矩阵做误差补偿. 最终模型以 QQQ [49] 格式打包. 借助这套组合优化策略, W4A16 与 W4A8 量化模型都能做到几乎无损的精度. 上述量化方法依赖校准数据, 校准数据的质量和多样性会显著影响量化模型的精度. 我们观察到, 在校准数据中加入一定比例由原始模型生成的回答, 能取得更高的精度.

To conserve the storage footprint of the KV cache, we quantized it using the FP8 E4M3 format. For compatibility with mainstream inference engines like SGLang [50] and vLLM [51], as well as achieving a better trade-off between speed and accuracy, we adopted a static scaling factor strategy. Although calculating per-layer scaling factors based on calibration data could theoretically improve quantization accuracy, our experiments showed that using these statistical scales—compared to a fixed scale of 1.0—did not lead to a significant change in model accuracy. Consequently, for our subsequent experiments, we will directly employ a scaling factor of 1.0 for KV cache quantization.

为节省 KV cache 的存储占用, 我们用 FP8 E4M3 格式对它做量化. 为兼容 SGLang [50] 与 vLLM [51] 等主流推理引擎, 并在速度与精度之间取得更好的平衡, 我们采用静态 scale 因子策略. 虽然理论上按校准数据逐层计算 scale 因子可以提高量化精度, 但实验表明, 与固定 scale 1.0 相比, 使用这些统计得到的 scale 并没有带来模型精度的显著变化. 因此在后续实验中, 我们直接对 KV cache 量化使用 1.0 的 scale 因子.

As a case study of deployment on a single RTX 4090 GPU (VRAM 24G), we used SGLang to evaluate the maximum sequence length (input + output) supported under various quantization configurations in the single-request scenario, as detailed in Table 2. Notably, under the W4A8-KV8 configuration, it achieved a maximum sequence length of 21,133 tokens. Our quantized model can be directly deployed on open-source inference engines without any additional code modifications, enhancing the convenience for users.

作为单张 RTX 4090 GPU (显存 24G) 部署的案例, 我们用 SGLang 评测了单请求场景下各量化配置所能支持的最大序列长度 (输入 + 输出), 详见 Table 2. 值得一提的是, 在 W4A8-KV8 配置下, 最大序列长度达到 21,133 token. 我们的量化模型无需任何额外代码修改, 就能直接部署在开源推理引擎上, 方便用户使用.

Table 2: Maximum sequence length under various quantization configurations for single RTX 4090 GPU deployment

表 2: 单张 RTX 4090 GPU 部署时各量化配置下的最大序列长度

| Quantization Config | Maximum Sequence Length |
| --- | --- |
| W4A16 | 9,982 |
| W4A16-KV8 | 19,965 |
| W4A8 | 10,566 |
| W4A8-KV8 | 21,133 |

> **看表:** Table 2 里加上 KV8 后最大长度几乎正好翻倍, 把激活从 A16 换成 A8 却只多出几百 token. 能否据此反推出单张 RTX 4090 上留给 KV cache 的显存有多大?
> 可以粗算. M2 以 Qwen2.5-32B-Base 为底座 (§3.2), 按该底座的公开配置 (64 层, 8 个 KV head, head dim 128), BF16 下每个 token 的 KV 为 2 × 64 × 8 × 128 × 2 字节 = 256 KiB, FP8 E4M3 下减半为 128 KiB. W4A16 的 9,982 token 乘 256 KiB 约 2.44 GiB, W4A16-KV8 的 19,965 token 乘 128 KiB 也约 2.44 GiB, 说明两种配置留给 KV 的显存几乎相同, KV8 只是让每个 token 更省. A8 只改变激活的计算精度, 权重仍是 4 bit, 占用基本不变, 所以长度只从 9,982 变到 10,566, 这点差距可能来自 QQQ 打包格式与运行时缓冲的差别. 24G 中其余部分主要被权重与推理引擎的运行时开销占去.

<!-- page 17 of 26 -->

### 5.2 Speculative Decoding 投机解码

To improve token throughput during inference, we integrated a speculative sampling framework by training a lightweight draft model based on the Baichuan-M2 architecture. The draft model was optimized to propose candidate token sequences rapidly, which were then verified in parallel by larger target model. We adopted the Eagle-3 speculative sampling algorithm [52], which improves earlier methods by incorporating tree-based attention and context-aware draft scoring. This allows the draft model to generate multiple candidate continuations per step while maintaining low latency, significantly reducing the number of serial decoding steps of the target model.

为提高推理时的 token 吞吐, 我们基于 Baichuan-M2 的架构训练了一个轻量 draft 模型, 接入投机采样框架. draft 模型经过优化, 能快速提出候选 token 序列, 再由更大的目标模型并行验证. 我们采用 Eagle-3 投机采样算法 [52], 它在早期方法的基础上引入基于树的注意力和感知上下文的 draft 打分. 这让 draft 模型每一步都能生成多条候选续写, 同时保持低延迟, 大幅减少目标模型的串行解码步数.

The draft model was trained on a carefully constructed dataset containing medical dialogue, clinical notes, and structured medical knowledge resources. To generate high-quality synthetic training data reflective of real-world medical interactions, we generated contextually relevant medical responses from Baichuan-M2, resulting in a diverse and domain-specific corpus.

draft 模型在精心构建的数据集上训练, 数据包含医学对话, 临床记录和结构化医学知识资源. 为生成能反映真实医疗交互的高质量合成训练数据, 我们让 Baichuan-M2 生成贴合语境的医学回答, 得到一个多样且领域专属的语料.

When deployed on a single RTX 4090 GPU with 4-bit quantization and a 4096-token prompt, the draft model achieved 73% prediction accuracy and an average accepted length of 3.28 tokens per round. This resulted in a throughput increase from 41.5 to 89.9 tokens/s, a 2.17× speedup, demonstrating strong efficiency gains for text generation.

在单张 RTX 4090 GPU 上以 4-bit 量化部署, 提示长度 4096 token 时, draft 模型的预测准确率为 73%, 平均每轮接受长度为 3.28 个 token. 吞吐由此从 41.5 提升到 89.9 tokens/s, 加速 2.17×, 文本生成效率明显提高.

## 6 Conclusion

We have developed a dynamic reinforcement learning validation system that bridges the gap between the LLM evaluation and real-world clinical practice. This system replaces traditional static benchmarks with interactive patient simulations and multi-dimensional clinical assessment criteria, thereby creating a decision-making environment that closely mirrors real-world clinical scenarios. Using this innovative approach, we built and open-sourced the Baichuan-M2 model, which was trained using domain adaptation and multi-stage reinforcement learning. Despite having only 32 billion parameters, the Baichuan-M2 model demonstrates superior clinical reasoning capabilities. On the challenging HealthBench benchmark, the Baichuan-M2 model outperformed all other open-source models and rivaled leading closed-source systems, becoming one of only two models worldwide to achieve a score above 32 on the HealthBench Hard subset. Our work highlights that complex clinical performance can be achieved at a deployable scale, underscoring the potential of LLMs to significantly enhance clinical decision-making.

我们开发了一套动态强化学习验证系统, 弥合了大模型评估与真实临床实践之间的鸿沟. 这套系统用交互式患者模拟和多维临床评估标准取代传统静态基准, 营造出贴近真实临床场景的决策环境. 借助这一方法, 我们训练并开源了 Baichuan-M2, 训练过程包括领域适配与多阶段强化学习. 尽管只有 320 亿参数, Baichuan-M2 仍展现出出色的临床推理能力. 在高难度的 HealthBench 上, 它超过了所有其他开源模型, 与领先的闭源系统不相上下, 成为全球仅有的两个在 HealthBench Hard 子集上得分超过 32 的模型之一. 我们的工作说明, 复杂的临床能力可以在可部署的规模上实现, 也显示出大模型大幅改善临床决策的潜力.

## 7 Limitation and Future Work 局限与未来工作

While we approach medical scenarios with deep reverence, we remain acutely aware that the journey toward using AI to improve human health is still a long and complex one. Despite our achievements, Baichuan-M2 is not without limitations that reflect the current state of technology. The model may still exhibit response hallucinations and insufficient reasoning stability in certain edge cases. From a metrics perspective, whether on HealthBench or other real-world medical capability evaluations, Baichuan-M2’s performance is far from saturated, leaving considerable room for optimization across various clinical dimensions. Functionally, this version has not been fully optimized for capabilities such as tool calling and external knowledge retrieval, which could further enhance its clinical utility. We acknowledge these limitations transparently and commit to addressing them with a prudent and pragmatic approach, continuously refining the model’s safety, reliability, and practical applicability in subsequent iterations.

我们怀着敬畏之心面对医疗场景, 也清醒地认识到, 用 AI 改善人类健康的道路依然漫长而复杂. 尽管取得了一些成果, Baichuan-M2 仍有局限, 这些局限也反映了当前的技术水平. 在某些边缘情况下, 模型仍可能出现回答幻觉和推理不够稳定的问题. 从指标看, 无论是 HealthBench 还是其他真实医疗能力评测, Baichuan-M2 的表现都远未饱和, 各个临床维度都还有相当大的优化空间. 在功能上, 这一版本尚未针对工具调用和外部知识检索等能力做充分优化, 而这些能力可以进一步提升它的临床价值. 我们坦诚承认这些局限, 并承诺以审慎务实的态度应对, 在后续迭代中持续提升模型的安全性, 可靠性和实际可用性.

Our current version primarily focuses on clinical diagnosis and treatment capabilities, but we recognize that medical inquiry skills and hallucination mitigation are equally critical for real-world deployment. Moving forward, we will strengthen quantitative assessment and optimization of these essential capabilities. Additionally, we plan to enhance research and implementation of multi-turn session reinforcement learning, aiming to provide comprehensive inquiry and diagnostic capabilities that mirror the complete clinical workflow. We also intend to explore advanced techniques for medical knowledge grounding, potentially integrating with medical knowledge bases and clinical decision support systems to further reduce hallucination rates and improve diagnostic accuracy.

当前版本主要聚焦临床诊疗能力, 但我们意识到, 问诊技巧和幻觉抑制对真实部署同样关键. 接下来, 我们会加强对这些核心能力的量化评估与优化. 我们还计划加强多轮会话强化学习的研究与落地, 目标是提供贴合完整临床流程的问诊与诊断能力. 我们也打算探索更先进的医学知识落地技术, 可能与医学知识库和临床决策支持系统结合, 进一步降低幻觉率, 提高诊断准确性.

<!-- page 18 of 26 -->

## 8 Contribution 贡献者

Contributors are presented in alphabetical order according to their first names. An asterisk (\*) denotes those who are no longer part of the team.

贡献者按名字的字母顺序排列. 星号 (\*) 表示已不在团队中的成员.

### Core Contributors 核心贡献者

Chengfeng Dou, Chong Liu\*, Fan Yang, Fei Li, Jiyuan Jia, Mingyang Chen, Qiang Ju, Shuai Wang, Shunya Dang, Tianpeng Li, Xiangrong Zeng, Yijie Zhou

### Contributors 贡献者

Chenzheng Zhu\*, Da Pan, Fei Deng, Guangwei Ai, Guosheng Dong, Hongda Zhang, Jinyang Tai, Jixiang Hong\*, Kai Lu, Linzhuang Sun, Peidong Guo, Qian Ma\*, Rihui Xin, Shihui Yang, Shusen Zhang, Yichuan Mo, Zheng Liang

### Experts and Advisors 专家与顾问

Xiaochuan Wang, Zuyi Zhu, Hengfu Cui, Zhishou Zhang

<!-- page 19 of 26 -->

## References

[1] Sagar Goyal, Eti Rastogi, Sree Prasanna Rajagopal, Dong Yuan, Fen Zhao, Jai Chintagunta, Gautam Naik, and Jeff Ward. Healai: A healthcare LLM for effective medical documentation. In Luz Angelica Caudillo-Mata, Silvio Lattanzi, Andrés Muñoz Medina, Leman Akoglu, Aristides Gionis, and Sergei Vassilvitskii, editors, Proceedings of the 17th ACM International Conference on Web Search and Data Mining, WSDM 2024, Merida, Mexico, March 4-8, 2024, pages 1167–1168. ACM, 2024. doi: 10.1145/3616855.3635739. URL [https://doi.org/10.1145/3616855.3635739](https://doi.org/10.1145/3616855.3635739).

[2] Marco Cascella, Jonathan Montomoli, Valentina Bellini, and Elena Giovanna Bignami. Evaluating the feasibility of chatgpt in healthcare: An analysis of multiple clinical and research scenarios. J. Medical Syst., 47(1):33, 2023. doi: 10.1007/S10916-023-01925-4. URL [https://doi.org/10.1007/s10916-023-01925-4](https://doi.org/10.1007/s10916-023-01925-4).

[3] Ziqi Yang, Xuhai Xu, Bingsheng Yao, Ethan Rogers, Shao Zhang, Stephen S. Intille, Nawar Shara, Guodong Gordon Gao, and Dakuo Wang. Talk2care: An llm-based voice assistant for communication between healthcare providers and older adults. Proc. ACM Interact. Mob. Wearable Ubiquitous Technol., 8(2):73:1–73:35, 2024. doi: 10.1145/3659625. URL [https://doi.org/10.1145/3659625](https://doi.org/10.1145/3659625).

[4] Che Liu, Haozhe Wang, Jiazhen Pan, Zhongwei Wan, Yong Dai, Fangzhen Lin, Wenjia Bai, Daniel Rueckert, and Rossella Arcucci. Beyond distillation: Pushing the limits of medical LLM reasoning with minimalist rule-based RL. CoRR, abs/2505.17952, 2025. doi: 10.48550/ARXIV. 2505.17952. URL [https://doi.org/10.48550/arXiv.2505.17952](https://doi.org/10.48550/arXiv.2505.17952).

[5] Junying Chen, Zhenyang Cai, Ke Ji, Xidong Wang, Wanlong Liu, Rongsheng Wang, Jianye Hou, and Benyou Wang. Huatuogpt-o1, towards medical complex reasoning with llms. CoRR, abs/2412.18925, 2024. doi: 10.48550/ARXIV.2412.18925. URL [https://doi.org/10.48550/arXiv.2412.18925](https://doi.org/10.48550/arXiv.2412.18925).

[6] Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, Xiao Bi, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. CoRR, abs/2501.12948, 2025. doi: 10.48550/ARXIV.2501.12948. URL [https://doi.org/10.48550/arXiv.2501.12948](https://doi.org/10.48550/arXiv.2501.12948).

[7] Aaron Jaech, Adam Kalai, Adam Lerer, Adam Richardson, Ahmed El-Kishky, Aiden Low, Alec Helyar, Aleksander Madry, Alex Beutel, Alex Carney, et al. Openai o1 system card. CoRR, abs/2412.16720, 2024. doi: 10.48550/ARXIV.2412.16720. URL [https://doi.org/10.48550/arXiv.2412.16720](https://doi.org/10.48550/arXiv.2412.16720).

[8] Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. CoRR, abs/2402.03300, 2024. doi: 10.48550/ARXIV.2402.03300. URL [https://doi.org/10.48550/arXiv.2402.03300](https://doi.org/10.48550/arXiv.2402.03300).

[9] Anthropic. Introducing Claude 4. [https://www.anthropic.com/news/claude-4](https://www.anthropic.com/news/claude-4), May 2025. Online; accessed September 3, 2025.

[10] Kimi Team, Yifan Bai, Yiping Bao, Guanduo Chen, Jiahao Chen, Ningxin Chen, Ruijue Chen, Yanru Chen, Yuankun Chen, Yutian Chen, et al. Kimi K2: open agentic intelligence. CoRR, abs/2507.20534, 2025. doi: 10.48550/ARXIV.2507.20534. URL [https://doi.org/10.48550/arXiv.2507.20534](https://doi.org/10.48550/arXiv.2507.20534).

[11] Aohan Zeng, Xin Lv, Qinkai Zheng, Zhenyu Hou, Bin Chen, Chengxing Xie, Cunxiang Wang, Da Yin, Hao Zeng, Jiajie Zhang, et al. Glm-4.5: Agentic, reasoning, and coding (arc) foundation models. arXiv preprint arXiv:2508.06471, 2025.

[12] Wenyi Hong, Wenmeng Yu, Xiaotao Gu, Guo Wang, Guobing Gan, Haomiao Tang, Jiale Cheng, Ji Qi, Junhui Ji, Lihang Pan, et al. Glm-4.1v-thinking: Towards versatile multimodal reasoning with scalable reinforcement learning. CoRR, abs/2507.01006, 2025. doi: 10.48550/ARXIV. 2507.01006. URL [https://doi.org/10.48550/arXiv.2507.01006](https://doi.org/10.48550/arXiv.2507.01006).

<!-- page 20 of 26 -->

[13] LASA Team, Weiwen Xu, Hou Pong Chan, Long Li, Mahani Aljunied, Ruifeng Yuan, Jianyu Wang, Chenghao Xiao, Guizhen Chen, Chaoqun Liu, Zhaodonghui Li, Yu Sun, Junao Shen, Chaojun Wang, Jie Tan, Deli Zhao, Tingyang Xu, Hao Zhang, and Yu Rong. Lingshu: A generalist foundation model for unified multimodal medical understanding and reasoning. CoRR, abs/2506.07044, 2025. doi: 10.48550/ARXIV.2506.07044. URL [https://doi.org/10.48550/arXiv.2506.07044](https://doi.org/10.48550/arXiv.2506.07044).

[14] National Board of Medical Examiners (NBME). Usmle scoring policies and score reporting guidelines 2024. Technical Report USMLE-POL-2024-01, Federation of State Medical Boards (FSMB) and National Board of Medical Examiners (NBME), 2024. URL [https://www.usmle.org/scoring/policies](https://www.usmle.org/scoring/policies).

[15] Rahul K. Arora, Jason Wei, Rebecca Soskin Hicks, Preston Bowman, Joaquin Quiñonero Candela, Foivos Tsimpourlas, Michael Sharman, Meghan Shah, Andrea Vallone, Alex Beutel, Johannes Heidecke, and Karan Singhal. Healthbench: Evaluating large language models towards improved human health. CoRR, abs/2505.08775, 2025. doi: 10.48550/ARXIV.2505.08775. URL [https://doi.org/10.48550/arXiv.2505.08775](https://doi.org/10.48550/arXiv.2505.08775).

[16] Zhaocheng Liu, Quan Tu, Wen Ye, Yu Xiao, Zhishou Zhang, Hengfu Cui, Yalun Zhu, Qiang Ju, Shizheng Li, and Jian Xie. Exploring the inquiry-diagnosis relationship with advanced patient simulators. CoRR, abs/2501.09484, 2025. doi: 10.48550/ARXIV.2501.09484. URL [https://doi.org/10.48550/arXiv.2501.09484](https://doi.org/10.48550/arXiv.2501.09484).

[17] María Jesús Broch Porcar and Álvaro Castellanos-Ortega. Patient safety, what does clinical simulation and teaching innovation contribute? Medicina Intensiva (English Edition), 49(3): 165–173, 2025.

[18] Junkai Li, Siyu Wang, Meng Zhang, Weitao Li, Yunghwei Lai, Xinhui Kang, Weizhi Ma, and Yang Liu. Agent hospital: A simulacrum of hospital with evolvable medical agents. CoRR, abs/2405.02957, 2024. doi: 10.48550/ARXIV.2405.02957. URL [https://doi.org/10.48550/arXiv.2405.02957](https://doi.org/10.48550/arXiv.2405.02957).

[19] Wenxuan Wang, Zizhan Ma, Zheng Wang, Chenghan Wu, Jiaming Ji, Wenting Chen, Xiang Li, and Yixuan Yuan. A survey of llm-based agents in medicine: How far are we from baymax? In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Findings of the Association for Computational Linguistics, ACL 2025, Vienna, Austria, July 27 - August 1, 2025, pages 10345–10359. Association for Computational Linguistics, 2025. URL [https://aclanthology.org/2025.findings-acl.539/](https://aclanthology.org/2025.findings-acl.539/).

[20] Isabel Briggs Myers et al. The myers-briggs type indicator, volume 34. Consulting Psychologists Press Palo Alto, CA, 1962.

[21] Ehsan Ullah, Anil Parwani, Mirza Mansoor Baig, and Rajendra Singh. Challenges and barriers of using large language models (llm) such as chatgpt for diagnostic medicine with a focus on digital pathology –a recent scoping review. Diagnostic Pathology, 19(1):43, 2024. doi: 10.1186/s13000-024-01464-7. URL [https://doi.org/10.1186/s13000-024-01464-7](https://doi.org/10.1186/s13000-024-01464-7).

[22] Hanyu Zhang, Boyu Qiu, Yuhao Feng, Shuqi Li, Qian Ma, Xiyuan Zhang, Qiang Ju, Dong Yan, and Jian Xie. Baichuan4-finance technical report. CoRR, abs/2412.15270, 2024. doi: 10.48550/ARXIV.2412.15270. URL [https://doi.org/10.48550/arXiv.2412.15270](https://doi.org/10.48550/arXiv.2412.15270).

[23] Noam Wies, Yoav Levine, and Amnon Shashua. The learnability of in-context learning. In Alice Oh, Tristan Naumann, Amir Globerson, Kate Saenko, Moritz Hardt, and Sergey Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. URL [http://papers.nips.cc/paper\_files/paper/2023/hash/73950f0eb4ac0925dc71ba2406893320-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2023/hash/73950f0eb4ac0925dc71ba2406893320-Abstract-Conference.html).

[24] Zeming Wei, Yifei Wang, and Yisen Wang. Jailbreak and guard aligned language models with only few in-context demonstrations. CoRR, abs/2310.06387, 2023. doi: 10.48550/ARXIV.2310. 06387. URL [https://doi.org/10.48550/arXiv.2310.06387](https://doi.org/10.48550/arXiv.2310.06387).

<!-- page 21 of 26 -->

[25] Sewon Min, Xinxi Lyu, Ari Holtzman, Mikel Artetxe, Mike Lewis, Hannaneh Hajishirzi, and Luke Zettlemoyer. Rethinking the role of demonstrations: What makes in-context learning work? In Yoav Goldberg, Zornitsa Kozareva, and Yue Zhang, editors, Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, EMNLP 2022, Abu Dhabi, United Arab Emirates, December 7-11, 2022, pages 11048–11064. Association for Computational Linguistics, 2022. doi: 10.18653/V1/2022.EMNLP-MAIN.759. URL [https://doi.org/10.18653/v1/2022.emnlp-main.759](https://doi.org/10.18653/v1/2022.emnlp-main.759).

[26] Bingning Wang, Haizhou Zhao, Huozhi Zhou, Liang Song, Mingyu Xu, Wei Cheng, Xiangrong Zeng, Yupeng Zhang, Yuqi Huo, Zecheng Wang, Zhengyun Zhao, Da Pan, Fei Kou, Fei Li, Fuzhong Chen, Guosheng Dong, Han Liu, Hongda Zhang, Jin He, Jinjie Yang, Kangxi Wu, Kegeng Wu, Lei Su, Linlin Niu, Linzhuang Sun, Mang Wang, Pengcheng Fan, Qianli Shen, Rihui Xin, Shunya Dang, Songchi Zhou, Weipeng Chen, Wenjing Luo, Xin Chen, Xin Men, Xionghai Lin, Xuezhen Dong, Yan Zhang, Yifei Duan, Yuyan Zhou, Zhi Ma, and Zhiying Wu. Baichuan-m1: Pushing the medical capability of large language models, 2025. URL [https://arxiv.org/abs/2502.12671](https://arxiv.org/abs/2502.12671).

[27] Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed H. Chi, Quoc V. Le, and Denny Zhou. Chain-of-thought prompting elicits reasoning in large language models. In Sanmi Koyejo, S. Mohamed, A. Agarwal, Danielle Belgrave, K. Cho, and A. Oh, editors, Advances in Neural Information Processing Systems 35: Annual Conference on Neural Information Processing Systems 2022, NeurIPS 2022, New Orleans, LA, USA, November 28 - December 9, 2022, 2022. URL [http://papers.nips.cc/paper\_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference.html).

[28] Takeshi Kojima, Shixiang Shane Gu, Machel Reid, Yutaka Matsuo, and Yusuke Iwasawa. Large language models are zero-shot reasoners. In Sanmi Koyejo, S. Mohamed, A. Agarwal, Danielle Belgrave, K. Cho, and A. Oh, editors, Advances in Neural Information Processing Systems 35: Annual Conference on Neural Information Processing Systems 2022, NeurIPS 2022, New Orleans, LA, USA, November 28 - December 9, 2022, 2022. URL [http://papers.nips.cc/paper\_files/paper/2022/hash/8bb0d291acd4acf06ef112099c16f326-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2022/hash/8bb0d291acd4acf06ef112099c16f326-Abstract-Conference.html).

[29] Yuyang Wu, Yifei Wang, Tianqi Du, Stefanie Jegelka, and Yisen Wang. When more is less: Understanding chain-of-thought length in llms. CoRR, abs/2502.07266, 2025. doi: 10.48550/ARXIV.2502.07266. URL [https://doi.org/10.48550/arXiv.2502.07266](https://doi.org/10.48550/arXiv.2502.07266).

[30] Mingan Lin, Fan Yang, Yan-Bin Shen, Haoze Sun, Tianpeng Li, Tao Zhang, Chenzheng Zhu, Miao Zheng, Xu Li, Yijie Zhou, Mingyang Chen, Yanzhao Qin, Youquan Li, Hao Liang, Fei Li, Yadong Li, Mang Wang, Guosheng Dong, Kuncheng Fang, Jianhua Xu, Bin Cui, Wentao Zhang, Zenan Zhou, and Weipeng Chen. Baichuan alignment technical report. ArXiv, abs/2410.14940, 2024. URL [https://api.semanticscholar.org/CorpusID:274342032](https://api.semanticscholar.org/CorpusID:274342032).

[31] Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan, Xiaochen Zuo, Yu Yue, Tiantian Fan, Gaohong Liu, Lingjun Liu, Xin Liu, Haibin Lin, Zhiqi Lin, Bole Ma, Guangming Sheng, Yuxuan Tong, Chi Zhang, Mofan Zhang, Wang Zhang, Hang Zhu, Jinhua Zhu, Jiaze Chen, Jiangjie Chen, Chengyi Wang, Hongli Yu, Weinan Dai, Yuxuan Song, Xiangpeng Wei, Hao Zhou, Jingjing Liu, Wei-Ying Ma, Ya-Qin Zhang, Lin Yan, Mu Qiao, Yonghui Wu, and Mingxuan Wang. DAPO: an open-source LLM reinforcement learning system at scale. CoRR, abs/2503.14476, 2025. doi: 10.48550/ARXIV.2503.14476. URL [https://doi.org/10.48550/arXiv.2503.14476](https://doi.org/10.48550/arXiv.2503.14476).

[32] Zichen Liu, Changyu Chen, Wenjun Li, Penghui Qi, Tianyu Pang, Chao Du, Wee Sun Lee, and Min Lin. Understanding r1-zero-like training: A critical perspective. CoRR, abs/2503.20783, 2025. doi: 10.48550/ARXIV.2503.20783. URL [https://doi.org/10.48550/arXiv.2503.20783](https://doi.org/10.48550/arXiv.2503.20783).

[33] AIME. AIME problems and solutions, 2025. URL [https://artofproblemsolving.com/wiki/index.php/AIME\_Problems\_and\_Solutions](https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions).

[34] Xinrun Du, Yifan Yao, Kaijing Ma, Bingli Wang, Tianyu Zheng, King Zhu, Minghao Liu, Yiming Liang, Xiaolong Jin, Zhenlin Wei, et al. Supergpqa: Scaling LLM evaluation across 285 graduate disciplines. CoRR, abs/2502.14739, 2025. doi: 10.48550/ARXIV.2502.14739. URL [https://doi.org/10.48550/arXiv.2502.14739](https://doi.org/10.48550/arXiv.2502.14739).

<!-- page 22 of 26 -->

[35] Yuxin Zuo, Shang Qu, Yifei Li, Zhang-Ren Chen, Xuekai Zhu, Ermo Hua, Kaiyan Zhang, Ning Ding, and Bowen Zhou. MedxpertQA: Benchmarking expert-level medical reasoning and understanding. In Forty-second International Conference on Machine Learning, 2025. URL [https://openreview.net/forum?id=IyVcxU0RKI](https://openreview.net/forum?id=IyVcxU0RKI).

[36] Zenan Huang, Yihong Zhuang, Guoshan Lu, Zeyu Qin, Haokai Xu, Tianyu Zhao, Ru Peng, Jiaqi Hu, Zhanming Shen, Xiaomeng Hu, et al. Reinforcement learning with rubric anchors. arXiv preprint arXiv:2508.12790, 2025.

[37] Zehui Ling, Deshu Chen, Hongwei Zhang, Yifeng Jiao, Xin Guo, and Yuan Cheng. Fast on the easy, deep on the hard: Efficient reasoning via powered length penalty. CoRR, abs/2506.10446, 2025. doi: 10.48550/ARXIV.2506.10446. URL [https://doi.org/10.48550/arXiv.2506.10446](https://doi.org/10.48550/arXiv.2506.10446).

[38] Sandhini Agarwal, Lama Ahmad, Jason Ai, Sam Altman, Andy Applebaum, Edwin Arbus, Rahul K Arora, Yu Bai, Bowen Baker, Haiming Bao, et al. gpt-oss-120b & gpt-oss-20b model card. arXiv preprint arXiv:2508.10925, 2025.

[39] An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, et al. Qwen3 technical report. CoRR, abs/2505.09388, 2025. doi: 10.48550/ARXIV.2505.09388. URL [https://doi.org/10.48550/arXiv.2505.09388](https://doi.org/10.48550/arXiv.2505.09388).

[40] Gheorghe Comanici, Eric Bieber, Mike Schaekermann, Ice Pasupat, Noveen Sachdeva, Inderjit Dhillon, Marcel Blistein, Ori Ram, Dan Zhang, Evan Rosen, et al. Gemini 2.5: Pushing the frontier with advanced reasoning, multimodality, long context, and next generation agentic capabilities. CoRR, abs/2507.06261, 2025. doi: 10.48550/ARXIV.2507.06261. URL [https://doi.org/10.48550/arXiv.2507.06261](https://doi.org/10.48550/arXiv.2507.06261).

[41] Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. CoRR, abs/2311.07911, 2023. doi: 10.48550/ARXIV.2311.07911. URL [https://doi.org/10.48550/arXiv.2311.07911](https://doi.org/10.48550/arXiv.2311.07911).

[42] Tao Zhang, Chenglin Zhu, Yanjun Shen, Wenjing Luo, Yan Zhang, Hao Liang, Fan Yang, Mingan Lin, Yujing Qiao, Weipeng Chen, Bin Cui, Wentao Zhang, and Zenan Zhou. Cfbench: A comprehensive constraints-following benchmark for llms. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), ACL 2025, Vienna, Austria, July 27 - August 1, 2025, pages 32926–32944. Association for Computational Linguistics, 2025. URL [https://aclanthology.org/2025.acl-long.1581/](https://aclanthology.org/2025.acl-long.1581/).

[43] Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Tianhao Wu, Banghua Zhu, Joseph E. Gonzalez, and Ion Stoica. From crowdsourced data to high-quality benchmarks: Arena-hard and benchbuilder pipeline. CoRR, abs/2406.11939, 2024. doi: 10.48550/ARXIV.2406.11939. URL [https://doi.org/10.48550/arXiv.2406.11939](https://doi.org/10.48550/arXiv.2406.11939).

[44] Xiao Liu, Xuanyu Lei, Shengyuan Wang, Yue Huang, Andrew Feng, Bosi Wen, Jiale Cheng, Pei Ke, Yifan Xu, Weng Lam Tam, Xiaohan Zhang, Lichao Sun, Xiaotao Gu, Hongning Wang, Jing Zhang, Minlie Huang, Yuxiao Dong, and Jie Tang. Alignbench: Benchmarking chinese alignment of large language models. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), ACL 2024, Bangkok, Thailand, August 11-16, 2024, pages 11621–11640. Association for Computational Linguistics, 2024. doi: 10.18653/V1/2024. ACL-LONG.624. URL [https://doi.org/10.18653/v1/2024.acl-long.624](https://doi.org/10.18653/v1/2024.acl-long.624).

[45] Yuning Wu, Jiahao Mei, Ming Yan, Chenliang Li, Shaopeng Lai, Yuran Ren, Zijia Wang, Ji Zhang, Mengyue Wu, Qin Jin, and Fei Huang. Writingbench: A comprehensive benchmark for generative writing. CoRR, abs/2503.05244, 2025. doi: 10.48550/ARXIV.2503.05244. URL [https://doi.org/10.48550/arXiv.2503.05244](https://doi.org/10.48550/arXiv.2503.05244).

<!-- page 23 of 26 -->

[46] Wenhua Cheng, Weiwei Zhang, Haihao Shen, Yiyang Cai, Xin He, Kaokao Lv, and Yi Liu. Optimize weight rounding via signed gradient descent for the quantization of llms. In Yaser Al-Onaizan, Mohit Bansal, and Yun-Nung Chen, editors, Findings of the Association for Computational Linguistics: EMNLP 2024, Miami, Florida, USA, November 12-16, 2024, pages 11332–11350. Association for Computational Linguistics, 2024. doi: 10.18653/V1/2024. FINDINGS-EMNLP.662. URL [https://doi.org/10.18653/v1/2024.findings-emnlp.662](https://doi.org/10.18653/v1/2024.findings-emnlp.662).

[47] Saleh Ashkboos, Amirkeivan Mohtashami, Maximilian L. Croci, Bo Li, Pashmina Cameron, Martin Jaggi, Dan Alistarh, Torsten Hoefler, and James Hensman. Quarot: Outlierfree 4-bit inference in rotated llms. In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. URL [http://papers.nips.cc/paper\_files/paper/2024/hash/b5b939436789f76f08b9d0da5e81af7c-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2024/hash/b5b939436789f76f08b9d0da5e81af7c-Abstract-Conference.html).

[48] Elias Frantar, Saleh Ashkboos, Torsten Hoefler, and Dan Alistarh. GPTQ: accurate post-training quantization for generative pre-trained transformers. CoRR, abs/2210.17323, 2022. doi: 10.48550/ARXIV.2210.17323. URL [https://doi.org/10.48550/arXiv.2210.17323](https://doi.org/10.48550/arXiv.2210.17323).

[49] Ying Zhang, Peng Zhang, Mincong Huang, Jingyang Xiang, Yujie Wang, Chao Wang, Yineng Zhang, Lei Yu, Chuan Liu, and Wei Lin. QQQ: quality quattuor-bit quantization for large language models. CoRR, abs/2406.09904, 2024. doi: 10.48550/ARXIV.2406.09904. URL [https://doi.org/10.48550/arXiv.2406.09904](https://doi.org/10.48550/arXiv.2406.09904).

[50] Lianmin Zheng, Liangsheng Yin, Zhiqiang Xie, Chuyue Sun, Jeff Huang, Cody Hao Yu, Shiyi Cao, Christos Kozyrakis, Ion Stoica, Joseph E. Gonzalez, Clark W. Barrett, and Ying Sheng. Sglang: Efficient execution of structured language model programs. In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. URL [http://papers.nips.cc/paper\_files/paper/2024/hash/724be4472168f31ba1c9ac630f15dec8-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2024/hash/724be4472168f31ba1c9ac630f15dec8-Abstract-Conference.html).

[51] Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph Gonzalez, Hao Zhang, and Ion Stoica. Efficient memory management for large language model serving with pagedattention. In Jason Flinn, Margo I. Seltzer, Peter Druschel, Antoine Kaufmann, and Jonathan Mace, editors, Proceedings of the 29th Symposium on Operating Systems Principles, SOSP 2023, Koblenz, Germany, October 23-26, 2023, pages 611–626. ACM, 2023. doi: 10.1145/3600006.3613165. URL [https://doi.org/10.1145/3600006.3613165](https://doi.org/10.1145/3600006.3613165).

[52] Yuhui Li, Fangyun Wei, Chao Zhang, and Hongyang Zhang. Eagle-3: Scaling up inference acceleration of large language models via training-time test. arXiv preprint arXiv:2503.01840, 2025.

## A Example of Evaluation Prompt for Rubrics

Here are examples of evaluation prompts for positive and negative rubrics, where &lt;conversation&gt; denotes the conversation history between the user and the assistant, and &lt;rubric_item&gt; denotes a rubric expressed in natural language with its corresponding criteria and point values.

以下是正向与负向 rubric 的评估提示示例. 其中 &lt;conversation&gt; 表示用户与助手之间的对话历史, &lt;rubric_item&gt; 表示用自然语言写成的一条 rubric, 附带相应的判定标准与分值.

### Example of Evaluation Prompt for Positive Rubrics

Your task is to review a conversation along with a rubric item, and evaluate the final assistant response (i.e., the most recent turn) on how well it satisfies the rubric item. The rubric item provided is positive, meaning it specifies what constitutes an acceptable response.

你的任务是审阅一段对话和一条 rubric item, 评估助手的最后一条回复 (即最近一轮) 在多大程度上满足该 rubric item. 所给 rubric item 是正向的, 即它规定了什么样的回复是可接受的.

<!-- page 24 of 26 -->

```txt
# Conversation
<conversation>

# Rubric item
<rubric_item>

# Instructions
Return a json object with the following fields: "explanation" and "acceptable".
- The "explanation" field should be a string explaining why the response does or does not meet the criterion and whether it is acceptable.
- The "acceptable" field should be a boolean indicating whether the response meets the criterion and is acceptable.

# Response Format
Return just the json object in markdown format. Do not include any other text in the response.
{
  "explanation": "[You explanation here]",
  "acceptable": [true/false]
}

Example of Evaluation Prompt for Negative Rubrics

Your task is to review a conversation along with a rubric item, and evaluate the final assistant response (i.e., the most recent turn) on how well it satisfies the rubric item. The rubric item provided is negative, meaning it specifies what constitutes an unacceptable response.

# Conversation
<conversation>

# Rubric item
<rubric_item>

# Instructions
Return a json object with the following fields: "explanation" and "unacceptable".
- The "explanation" field should be a string explaining why the response does or does not meet the criterion and whether it is unacceptable.
- The "unacceptable" field should be a boolean indicating whether the response meets the criterion and is unacceptable.

# Response Format
Return just the json object in markdown format. Do not include any other text in the response.
{
  "explanation": "[You explanation here]",
  "unacceptable": [true/false]
}
```

上面代码块包含两套模板. 正向模板在 `# Conversation` 下放对话历史, 在 `# Rubric item` 下放 rubric, 要求返回含 「explanation」 与 「acceptable」 两个字段的 JSON: 「explanation」 用一段文字说明回复为何满足或不满足该标准, 以及是否可接受; 「acceptable」 为布尔值, 表示回复是否满足标准, 可以接受. 回复格式要求只返回 markdown 格式的 JSON 对象, 不附其他文字.

负向模板 (代码块中 「Example of Evaluation Prompt for Negative Rubrics」 之后的部分) 开头的任务说明与正向模板基本相同, 只是注明所给 rubric item 是负向的, 即它规定了什么样的回复是不可接受的. 结构同样是对话, rubric item, 指令与返回格式, 但字段换成 「explanation」 与 「unacceptable」: 「unacceptable」 为 true 表示回复命中了这条负向标准, 属于不可接受. 把字段名直接写成 「unacceptable」, 正是 §3.3.2 所说的做法, 让裁判判断 「不期望的行为是否出现」, 而不是判断回复的好坏.

## B Response Case of HealthBench

<!-- page 25 of 26 -->

![Image block](images/p25-figure-12-case-of-gestational-diabetes-answered-by.png)

Figure 12: Case of Gestational Diabetes answered by Baichuan-M2, which shows superior performance in Accuracy, Relevance, and Completeness.

图 12: Baichuan-M2 对妊娠糖尿病病例的回答, 在准确性, 相关性与完整性上表现更好.

<!-- page 26 of 26 -->

![Image block](images/p26-figure-13-gestational-diabetes-case-responded-by-gpt.png)

Figure 13: Gestational Diabetes case responded by gpt-oss-120b.

图 13: gpt-oss-120b 对妊娠糖尿病病例的回答.

26
