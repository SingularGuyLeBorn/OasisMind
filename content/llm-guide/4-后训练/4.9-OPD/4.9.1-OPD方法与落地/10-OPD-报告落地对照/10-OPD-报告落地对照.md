---
title: "10 · OPD 在各家技术报告里的落地"
category: "后训练"
published: true
tags: ["OPD", "MOPD", "On-Policy Distillation", "Qwen3", "DeepSeek-V4", "Kimi K3", "GLM-5", "ERNIE 5.1", "Baichuan-M3"]
excerpt: "同叫 on-policy distillation, 在各家流水线里占的位置不同: Qwen3 用大模型教小模型, DeepSeek-V4, K3, MiMo, ERNIE 5.1 等用它把分域专家并成一份权重, GLM-5 用它在顺序 RL 之后找回前面阶段的能力. 本文按报告原文对照教师来源, 损失形态和数字的适用条件."
---
# OPD 在各家技术报告里的落地

> 相关阅读: [01 OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md) · [09 MOPD 多教师蒸馏](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) · [07 OPD 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md)

本文的材料是 2025-2026 年九份公开技术报告或模型卡里写到 on-policy distillation 的段落: Qwen3, DeepSeek-V4, DeepSeek-V4.1-Flash, Kimi K3, MiMo-V2-Flash, ERNIE 5.1, Baichuan-M3, MiniCPM5-1B, GLM-5, 以及只提了一句的 Step 3.5 Flash. 要回答的问题是: 这一步在各家流水线里放在哪, 教师从哪来, 损失算在全词表还是采样 token 上, 报告给出的数字在什么条件下成立.

记号沿用 [01](../01-OPD基础原理/01-OPD基础原理.md): 学生 $\pi_\theta$, 教师 $\pi_T$, 提示 $x$, 学生采样的回答 $y$, $\mathrm{sg}[\cdot]$ 为 stop-gradient.

## 1. 三种用法与 Qwen3 的大教小

### 1.1 三种用法

按教师与学生的关系, 这些报告里的 OPD 分三类.

| 用法 | 教师 | 学生 | 报告 |
|------|-----|------|-----|
| 大教小 | 同系列更大的模型 | 轻量档模型 | Qwen3 |
| 分域专家合版 | 从同一 SFT 检查点分域训出的 RL (或 SFT) 专家 | 统一的发布模型, 通常与教师同尺寸 | DeepSeek-V4, DeepSeek-V4.1-Flash, Kimi K3, MiMo-V2-Flash, ERNIE 5.1, Baichuan-M3, MiniCPM5-1B |
| 跨阶段恢复 | 同一条流水线里更早阶段的最终检查点 | 最后阶段的同一模型 | GLM-5 |

第一类的目标是压尺寸, 第二类是合并能力, 第三类是修补顺序训练造成的遗忘. 三类共用「学生采样, 教师逐 token 打分」的骨架, 但教师来源不同, 能期待的结果也不同. 第二类的方法细节见 [09](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md), 本文对这几家只列出与 09 不重复的部分.

### 1.2 Qwen3 的 Strong-to-Weak 流程

Qwen3 的旗舰模型走四段后训练: 长 CoT 冷启动, 推理 RL, 思考模式融合, 通用 RL. 轻量档不再逐个跑这四段, 而是用 Strong-to-Weak 蒸馏, 覆盖 5 个 dense 模型 (0.6B, 1.7B, 4B, 8B, 14B) 和一个 MoE (30B-A3B). 报告 §4.5 把它分两段:

1. **Off-policy 蒸馏**. 把教师在 `/think` 与 `/no_think` 两种模式下的输出合在一起做响应蒸馏, 让学生先具备基本推理和模式切换能力.
2. **On-policy 蒸馏**. 采样提示, 学生以 `/think` 或 `/no_think` 模式自己生成回答, 再把学生 logits 向教师 (Qwen3-32B 或 Qwen3-235B-A22B) 的 logits 对齐, 最小化 KL 散度.

报告只写了 minimize the KL divergence, 没有写正向还是反向, 也没有写在全词表还是采样 token 上计算.

两段的顺序有它的道理. Qwen3 的思考开关靠聊天模板里的 `/think` 与 `/no_think` 标记, 非思考回答保留一个空的 thinking 块. 一个没见过这套格式的小模型直接做 on-policy 蒸馏, 自己采出的回答多半不守格式, 教师在这些前缀上的打分信息量低. 先用教师两种模式的输出做响应蒸馏, 学生的 rollout 才落在教师熟悉的格式和推理风格里, 第二段的逐 token 信号才有用. 报告对第一段的定位就是给第二段打基础. 第二段的提示让学生随机以两种模式之一作答, 两种模式都受教师监督, 模式切换能力在蒸馏中一并保留.

### 1.3 Qwen3: 与直接 RL 的对照 (Table 21)

报告 Discussion 部分比较了 on-policy 蒸馏与直接 RL. 两者都从同一个 off-policy 蒸馏后的 Qwen3-8B 检查点出发, 为简化只用数学和代码相关的查询. 括号里是 pass@64.

| 方法 | AIME'24 | AIME'25 | MATH500 | LiveCodeBench v5 | MMLU-Redux | GPQA-Diamond | GPU 小时 |
|------|--------:|--------:|--------:|-----------------:|-----------:|-------------:|--------:|
| Off-policy 蒸馏 | 55.0 (90.0) | 42.8 (83.3) | 92.4 | 42.0 | 86.4 | 55.6 | - |
| + RL | 67.6 (90.0) | 55.5 (83.3) | 94.8 | 52.9 | 86.9 | 61.3 | 17,920 |
| + On-policy 蒸馏 | 74.4 (93.3) | 65.5 (86.7) | 97.0 | 60.3 | 88.3 | 63.3 | 1,800 |

可以读出三点.

**成本**. 1,800 / 17,920 约等于 0.10, 即报告说的「约 1/10 GPU 小时」. 这个比值的条件是: 8B 学生, 起点是已经做过 off-policy 蒸馏的检查点, 只用数学与代码数据, 教师是更大的 Qwen3. 报告后训练概述 (第 4 章开头) 另有一处「1/10」, 比较对象是对每个小模型完整跑四段训练, 两处的分母不同.

在同样 GPU 小时下的相对增量也可以从表里读出: 相对 RL, on-policy 蒸馏在 AIME'24 多 6.8, AIME'25 多 10.0, LiveCodeBench v5 多 7.4, MATH500 多 2.2. 表里没有「RL 跑到 1,800 GPU 小时」或「蒸馏跑到 17,920 GPU 小时」的对照点, 所以不能据此判断两条曲线在同等预算下的差距.

**pass@1 与 pass@64**. RL 把 AIME'24 的 pass@1 从 55.0 提到 67.6, pass@64 停在 90.0 不动, AIME'25 的 pass@64 也停在 83.3. On-policy 蒸馏把 pass@64 提到 93.3 和 86.7. 报告的解释是, 从教师 logits 蒸馏能扩大学生的探索空间, 而 RL 主要把已有的正确解推到更高概率. 这与「RL 提高 pass@1, 不提高 pass@k 上界」的观察一致. 蒸馏能提高上界, 前提是教师比学生强.

**没有遗忘对照**. 表中 MMLU-Redux 与 GPQA-Diamond 都略有上升, 但训练只用了数学与代码数据, 表里没有通用对话或指令跟随的指标.

## 2. GLM-5: 跨阶段蒸馏

### 2.1 流程

GLM-5 的后训练是顺序的: 多任务 SFT (引入交错思考模式), 推理 RL, agent RL, 通用 RL. 报告 §3.5 指出, 依次针对不同目标优化会让先前获得的能力逐步退化. 为此在最后加一个 on-policy cross-stage distillation 阶段, 用来快速恢复 SFT, 推理 RL 和通用 RL 阶段学到的技能. 报告的官方名称里没有 OPD 或 MOPD 缩写.

教师是前面各阶段的最终检查点. 正文点名的是 SFT, 推理 RL, 通用 RL 三个阶段; 报告图 5 里蒸馏框也只接收这三路 logits, agent RL 阶段没有箭头指向它. 也就是说, agent RL 的能力由学生自己带进最后一段, 蒸馏只负责找回另外三段. 训练提示从对应教师的 RL 训练集中采样, 按适当比例混合, 报告没有给出比例.

报告引言把这一步描述为贯穿顺序 RL 的防遗忘手段, §3.5 则写明它作为最后一个阶段执行. 两处说法的交集是: 跨阶段蒸馏在通用 RL 之后单独做一次, 不在每两段 RL 之间各插一次.

### 2.2 损失与教师的排列方式

GLM-5 的 RL 用一个 GRPO 变体 (报告式 (1)): 带 PPO 式裁剪, 并用一个 pop 函数按训推概率比 $\rho_{i,t}$ 是否落在 $[1/\beta,\beta]$ 内屏蔽 token. 推理 RL 阶段的超参是 $\beta=2$, $\epsilon_{\mathrm{low}}=0.2$, $\epsilon_{\mathrm{high}}=0.28$, 完全 on-policy, 组大小 32, batch size 32.

跨阶段蒸馏沿用式 (1), 只把优势项换成 (报告式 (2)):

$$
\hat A_{i,t}=\mathrm{sg}\Bigl[\log\frac{\pi^{\mathrm{infer}}_{\theta_{\mathrm{teacher}}}(y_{i,t}\mid x,y_{i,<t})}{\pi^{\mathrm{train}}_{\theta}(y_{i,t}\mid x,y_{i,<t})}\Bigr] \tag{1}
$$

学生在教师更看好的 token 上得到正优势. 上标 infer 和 train 表示概率分别来自推理引擎和训练引擎: 教师 logits 目前由推理引擎提供, 报告计划以后把推理后端迁到训练引擎, 并统一使用 MLA 的 MQA 模式做推理.

这一阶段 GRPO 的组大小设为 1, batch 1024, 目的是提高数据吞吐. 报告给的理由是优势直接由与教师的差距算出, 不再需要每个提示一大组样本来估计组内相对奖励. 推导上也是这样: 推理 RL 的优势是本回答奖励减去组内 $G$ 个奖励的均值再除以组内标准差, $G=1$ 时分子恒为 0, 训练无信号; 式 (1) 的优势只依赖本条回答本位置的两个概率, 与同组其他回答无关, $G=1$ 时照样有逐 token 的非零信号. 报告没有说明两处 batch size 是按提示还是按回答计数, 两个阶段每步的样本量无法直接换算. 同样的配置也出现在 Ma 等的 MOPD 实验里 (每题 1 条 rollout, batch 2048), 见 [09](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) 第 5.2 节.

教师的来源也和分域合版不同. GLM-5 的教师在时间上排成一列, 每个教师是学生在某个更早阶段的样子; 分域合版的教师是并行训出的. 两者的风险不同. 分域合版的教师彼此独立, 冲突来自不同域的梯度在共享参数上的拉扯; 跨阶段蒸馏的教师之间本来就有继承关系, 后面的阶段只是覆盖了前面的部分能力, 蒸馏要找回的是被覆盖掉的那部分. 按 [09](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) 第 5.4 节「同源教师」的结论, 这种设定下师生分布接近, 初始 KL 低, 对稳定性有利. GLM-5 报告没有给出蒸馏前后的分项对照数字.

## 3. 分域专家合版: 各家的差异点

### 3.1 DeepSeek-V4.1-Flash

DeepSeek-V4, Kimi K3, MiMo-V2-Flash 的公式与 Ma 等的对照实验见 [09](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md), 这一节补上另外四家, 先从 V4.1-Flash 说起.

V4.1-Flash 报告说明后训练没有算法创新, 沿用 V4 的 SFT, RL, OPD 配方, 变化集中在数据流水. §5.2.4 写了它的 OPD 规模和工程:

- 作为后训练的最后一段, 全词表 OPD 在所有域的数据上进行, 使用超过 40 个教师模型, rollout 用异步生成.
- 各域训练流程不同, 每个域的最佳教师可能来自模型开发的不同阶段; 教师之间, 教师与学生之间的架构可以不同. 基础设施支持数量不设上限的异构教师做全词表 OPD, 并以可忽略的代价在教师之间切换.
- 训练中会持续跟踪模型能力并动态调整配方, 包括数据配比, 每个数据集的并发上限, 当前启用的教师. 同步训练里 rollout batch 天然给出切换边界; 异步训练中不同配置下生成的样本会同时在途, 基础设施保证配置切换前后一致, 不打断 rollout 与训练.

与 V4 的「十余个」教师相比, 教师数量翻了几倍, 教师可以与学生异构. 全词表 reverse KL 只要求师生在同一个词表上给出分布, 不要求层数, 注意力形式或专家数相同, 所以架构异构不改变损失本身, 难点落在基础设施上: 每个教师要有自己的推理服务, 切换教师不能拖慢 rollout.

「最佳教师可能来自不同开发阶段」这一条, 让 V4.1-Flash 的做法同时带有第 1.1 节里第二类和第三类的特征. 某个域的教师可以是更早的某个检查点, 与 GLM-5 用前序阶段检查点当教师的思路相同; 不同的是 V4.1-Flash 的教师按域挑选, GLM-5 的教师按阶段挑选. 动态改配方意味着教师集合在训练中会变, 报告没有说明切换的判据, 只说依据持续跟踪的模型能力.

### 3.2 ERNIE 5.1

ERNIE 5.1 报告把动机写成两点: 串行的 SFT 加多阶段混合 RL 拖慢研发迭代; 在单个阶段里融合所有能力会带来多目标冲突, 出现一项上升另一项下降的跷跷板效应. 后训练分四段:

1. **统一 SFT**, 用多领域指令数据建立指令跟随和工具调用能力, 作为后续的初始化检查点.
2. **领域专家训练**, 并行训练代码, 推理, agent 等专家, 每个方向自定奖励信号和训练算法. 报告没有写这些专家一定用 RL 训练, 四段里明写在线 RL 的只有第 4 段.
3. **OPD**, 以统一 SFT 模型为学生, 多个领域专家为教师, 学生从自己的策略分布采样, 用 token 级 reverse KL 向多个教师学习.
4. **通用在线 RL**, 面向通用对话场景.

第 4 段是 ERNIE 5.1 与其他几家的主要差别. 报告写道, 实验发现并非所有任务都适合用基于 token 级 KL 的 OPD 融合. 分布熵高的任务 (开放式闲聊, 创意写作) 蒸馏效率低, 还可能让输出概率分布过度平滑. 所以这类域不做蒸馏, 改在 OPD 之后的模型上直接做在线 RL, 用来保证指令跟随, 生成多样性和人类偏好对齐. MiMo-V2-Flash 的 Table 7 里, Arena-Hard 创意写作一项在 MOPD 后比教师低 3.9 (见 09 第 4.3 节), 与 ERNIE 5.1 的观察方向一致.

ERNIE 5.1 没有给出机制分析. 从估计器的角度可以看出一部分原因: 采样 token 上的对数比 $\log\pi_T(y_t)-\log\pi_\theta(y_t)$ 只是逐位置 reverse KL 的单样本估计, 教师分布越平, 同一位置上不同采样 token 的对数比差异越大, 估计方差越高; 而且教师本身的高熵意味着它在这些位置上没有明确偏好, 学生能学到的主要是「保持分散」, 这与生成多样性的目标并不对应具体的质量差别. [07](../07-OPD-失败模式/07-OPD-失败模式.md) 第 1.3 节用均匀教师算过 reverse KL 的极端情形. 报告采用的处理是把这类域整段移出蒸馏, 交给有偏好奖励的 RL.

### 3.3 Baichuan-M3

Baichuan-M3 (医疗模型) 的框架是三段: 任务专项 RL (TaskRL), 离线策略蒸馏, 多教师在线策略蒸馏 (MOPD). 第一段让不同模型在各自的任务奖励下充分探索, 得到一组带有不同归纳偏置的领域教师, 隔离任务之间的梯度干扰.

第二段与其他几家不同, 先做一次离线蒸馏. 冻结所有教师, 在各自领域 rollout, 构成离线轨迹集 $\mathcal D$, 学生 off-policy 地学习. 为适应每个状态只有一个样本的离线数据, 损失用一个裁剪过的前向 KL (报告式 (2)):

$$
\mathcal L_{\mathrm{clip\text{-}FKL}}(\theta)=\mathbb E_{(s,a)\sim\mathcal D}\bigl[\mathbb I\bigl(\log\pi_\theta(a\mid s)<\log\pi_t(a\mid s)\bigr)\cdot(-\log\pi_\theta(a\mid s))\bigr] \tag{2}
$$

只在学生对该 token 的概率低于教师时才有梯度, 而梯度本身就是 SFT 的 $-\nabla\log\pi_\theta(a\mid s)$. 这相当于以教师概率为上限的 SFT: 只要求学生在教师的经验支撑上不低于教师, 不去拟合完整的条件分布. 报告的理由是避免单样本情形下把概率过度放大, 在数据支撑之外保留熵, 缓解模式坍缩, 给第三段留出探索空间.

附录 A.3 的 Table 4 给了这个裁剪项的消融. 学生从医学问诊专家初始化, 通过离线蒸馏并入一个健康咨询专家; 两组只差损失, 初始化, 数据和训练配置相同.

| 损失 | ScanBench | HealthBench | HealthBench-Hard |
|-----|---------:|-----------:|----------------:|
| Forward-KL | 73.7 | 58.6 | 33.2 |
| Clip-Forward-KL | 73.5 | 61.1 | 38.5 |

ScanBench 反映问诊能力的保持, 两者基本相同; HealthBench 反映新并入的健康咨询能力, Clip 版高 2.5, Hard 子集高 5.3. 用式 (2) 可以解释这种不对称. 学生从问诊专家起步, 在问诊样本上学生与教师概率起初相同, 指示函数为假, Clip 版在这部分数据上几乎不产生梯度; 标准前向 KL 继续对自身样本做 SFT, 对问诊能力影响也不大. 在健康咨询样本上学生起初低于教师, 两者都在往上推, 区别在于标准版越过教师概率后仍把单个采样 token 往 1 推, Clip 版追平教师就停. 报告的结论是标准前向 KL 在稀疏离线样本上过度放大概率, 干扰的是新能力的整合, 不是旧能力的保持.

第三段学生回到在线环境, 在混合领域分布上 rollout, 同时受真实任务奖励和多教师先验约束, 改用 reverse KL 正则. 报告的说法是前向 KL 的 mode-covering 让第二段稳定继承各专家的高概率区域, 第三段的 reverse KL 配合真实奖励让学生在冲突时选定一个模式, 不在模式之间取平均. 框架支持循环迭代: MOPD 后的统一模型可作为第一段的新初始化, 再做一轮专项增强和蒸馏.

### 3.4 MiniCPM5-1B

MiniCPM5-1B 的来源是 Hugging Face 模型卡, 不是技术报告. 后训练三步: 200B token 的深度思考 SFT 加 200B token 的混合思考 SFT; 从 SFT 模型分出数学, 代码, 闭卷问答, 写作等方向的 RL 教师; 最后用 OPD 把这些教师蒸回一个发布模型.

OPD 的实现写得比较具体:

- 基于 Thinking Machines Lab 的 on-policy distillation, 吸收了 Li 等 *Rethinking On-Policy Distillation* (arXiv:2604.13016) 的实现改进.
- 在 RL 框架里用 reverse KL 作为优势估计, 替换原来基于验证结果的优势.
- 每个位置, 学生和教师各取 top-$k$ logits, 在两组 token 的并集上算 reverse KL, 在信号精度与训练效率之间折中.
- 直接复用训练各 RL 教师时的领域内提示作为蒸馏数据, 不另外整理数据.

模型卡报告 RL 加 OPD 在数学, 代码, 指令跟随任务上把平均分提高 16 分, 撞到 max-tokens 上限的回答比例下降 29 个百分点. 这是 RL 与 OPD 合计的效果, 没有单独拆出 OPD.

学生与教师 top-$k$ 并集的做法, 与 [07](../07-OPD-失败模式/07-OPD-失败模式.md) 第 2.4 节 Fu 等的教师 top-K 局部支持匹配属于同一类改进: 只用采样 token 方差大, 用全词表又太贵, 只在一小组高概率 token 上比较分布. 差别在支撑集的取法, Fu 等只取教师的 top-K, MiniCPM5 把学生的 top-$k$ 也并进来, 学生自己高估而教师低估的 token 因此也会被压下去.

## 4. 横向对照

### 4.1 损失形态

把 [09](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) 的三家与本文几家放在一起, 按每个位置用到教师分布的哪一部分分类:

| 每个位置的信号 | 报告 | 附加处理 |
|-------------|-----|--------|
| 全词表 reverse KL | DeepSeek-V4, DeepSeek-V4.1-Flash | 缓存教师 hidden, 训练时重建 logit; V4.1 支持 40 个以上的异构教师 |
| 学生与教师 top-$k$ 并集上的 reverse KL | MiniCPM5-1B | 用作 RL 框架里的优势 |
| 教师 top-$k$ 上的 reverse KL 加偏置修正 | Ma 等 (MOPD 论文, 备选实现) | $k=64$, 与 sampled-token 版相当 |
| 采样 token 对数比作优势 | Kimi K3, MiMo-V2-Flash, GLM-5, Ma 等 (默认实现) | K3 对称裁剪 $R_{\max}$; MiMo 训推比越界置零并加 $\alpha\hat A_{\mathrm{ORM}}$; GLM-5 组大小 1; Ma 等 $A_{\max}=5$ |
| token 级 reverse KL, 未写估计方式 | ERNIE 5.1, Baichuan-M3 第三段 | ERNIE 高熵域改用 RL; Baichuan 第三段同时用任务奖励 |
| KL, 未写方向 | Qwen3 | 先 off-policy 蒸馏再 on-policy |

DeepSeek-V4 报告明确反对把采样 token 对数比当优势, 理由是梯度方差高; K3 与 Ma 等则报告更细的 top-$k$ 目标没有明显好处. 两种结论来自不同的规模, 教师数和实现, 报告之间没有直接对照. 各种估计器的方差分析见 [07](../07-OPD-失败模式/07-OPD-失败模式.md) 第 1 节.

另一个分歧是要不要保留结果奖励. MiMo-V2-Flash 默认把 ORM 优势加进 MOPD 优势; Baichuan-M3 第三段同时受任务奖励约束; ERNIE 5.1 把高熵域整个交给后续 RL; K3, DeepSeek-V4, GLM-5 的蒸馏阶段只写了教师信号.

### 4.2 在流水线里的位置

| 报告 | OPD 之前 | OPD 之后 |
|-----|---------|---------|
| Qwen3 (轻量档) | 教师两种模式输出的 off-policy 蒸馏 | 无 |
| GLM-5 | SFT, 推理 RL, agent RL, 通用 RL | 无 |
| DeepSeek-V4 / V4.1-Flash | 分域专家训练 (SFT 加 RL) | 无 |
| ERNIE 5.1 | 统一 SFT, 并行领域专家 | 通用在线 RL |
| Baichuan-M3 | TaskRL, 离线 Clip-FKL 蒸馏 | 可回到 TaskRL 再迭代 |
| MiniCPM5-1B | 两段 SFT, 分方向 RL 教师 | 无 |

多数报告把 OPD 放在最后. ERNIE 5.1 在后面接了一段 RL, 用来处理蒸馏不擅长的高熵域; Baichuan-M3 在前面多做一段离线蒸馏, 让学生在进入在线阶段之前先靠近各教师, 这与 Qwen3 先 off-policy 再 on-policy 的顺序相同. 两者的共同理由是在线阶段的信号质量取决于学生采样能否落在教师熟悉的区域. 分域合版的几家另有一个工程上的共同点: 教师训练可以并行, 各域团队各自迭代, ERNIE 5.1 和 Ma 等都把缩短研发周期列为动机.

### 4.3 读数时的条件

| 数字 | 出处 | 成立条件 |
|-----|-----|--------|
| 约 1/10 GPU 小时 (1,800 对 17,920) | Qwen3 Table 21 | 8B 学生, off-policy 蒸馏后的同一检查点, 只用数学与代码数据 |
| pass@64 从 90.0 到 93.3 | Qwen3 Table 21 | 同上, AIME'24; 教师为 Qwen3-32B 或 235B-A22B |
| AIME 2025 89.3 → 94.1 | MiMo-V2-Flash Table 7 | MOPD 前后学生对比最强教师, 不是成本数字 |
| 归一化分 0.937 对 0.882 | Ma 等 Table 2 | Qwen3-30B-A3B, 三个域, 同一 SFT 起点 |
| 平均 +16 分, 超长回答 −29 个百分点 | MiniCPM5-1B 模型卡 | RL 与 OPD 合计 |
| HealthBench-Hard 33.2 → 38.5 | Baichuan-M3 Table 4 | 离线阶段, 只并入一个健康咨询专家, 比较的是两种离线损失, 不涉及在线 MOPD |

DeepSeek-V4, V4.1-Flash, K3, ERNIE 5.1, GLM-5 都没有公开蒸馏阶段单独的成本或前后对照表. 这几家报告里的最终评测分数是整条后训练的结果, 不能归到 OPD 一步.

Step 3.5 Flash 报告只在 §7 局限与展望里写了一句: 为了把通才能力与深度领域专长统一起来, 他们正在推进 on-policy distillation 的若干变体, 让模型以更高的样本效率内化专家行为. 报告没有给出方法和数字, 按第 1.1 节的分类, 这句话指向的是分域专家合版.

各家训练里的量化感知训练 (V4 §5.2.1, K3 §4.1.4 的 MXFP4) 写在后训练相邻章节, 不属于蒸馏目标, 训推一致性问题见 [6.1.7](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致/6.1.7-训练稳定性与训推不一致.md).

## 参考文献

1. Qwen Team. (2025). [Qwen3 Technical Report.](https://arxiv.org/abs/2505.09388) *arXiv:2505.09388*. §4.5 Strong-to-Weak Distillation, Table 21. 库内: [Qwen3](../../../../../model-library/03-模型家族/03-qwen/qwen3/qwen3-bi.md).
2. GLM-5 Team. (2026). [GLM-5: from Vibe Coding to Agentic Engineering.](https://arxiv.org/abs/2602.15763) *arXiv:2602.15763*. §3.5 式 (2). 库内: [GLM-5](../../../../../model-library/03-模型家族/13-glm/glm-5/glm-5-bi.md).
3. DeepSeek-AI. (2026). DeepSeek-V4 技术报告. §5.1.2 式 (29), §5.2.2. 库内: [DeepSeek-V4](../../../../../model-library/03-模型家族/01-deepseek/deepseek-v4/deepseek-v4-bi.md).
4. DeepSeek-AI. (2026). DeepSeek-V4.1-Flash 技术报告. §5.2.4. 库内: [DeepSeek-V4.1-Flash](../../../../../model-library/03-模型家族/01-deepseek/deepseek-v4-1-flash/deepseek-v4-1-flash-bi.md).
5. Kimi Team. (2026). [Kimi K3: Open Frontier Intelligence.](https://arxiv.org/abs/2607.24653) *arXiv:2607.24653*. §4.1.3 式 (15). 库内: [Kimi K3](../../../../../model-library/03-模型家族/02-kimi/kimi-k3/kimi-k3-bi.md).
6. Xiaomi LLM-Core. (2026). [MiMo-V2-Flash Technical Report.](https://arxiv.org/abs/2601.02780) *arXiv:2601.02780*. §4.1, §4.4, Table 7. 库内: [MiMo-V2-Flash](../../../../../model-library/03-模型家族/05-mimo/mimo-v2-flash/mimo-v2-flash-bi.md).
7. Baidu. (2026). ERNIE 5.1 技术报告. 后训练四阶段. 库内: [ERNIE 5.1](../../../../../model-library/03-模型家族/10-ernie/5-1/5-1-bi.md).
8. Baichuan. (2026). [Baichuan-M3 Technical Report.](https://arxiv.org/abs/2602.06570) *arXiv:2602.06570*. §2.3 三阶段训练, 式 (2). 库内: [Baichuan-M3](../../../../../model-library/03-模型家族/07-baichuan/m3-235b/m3-235b-bi.md).
9. OpenBMB. (2026). [MiniCPM5-1B 模型卡.](https://huggingface.co/openbmb/MiniCPM5-1B) Hugging Face. 库内: [MiniCPM5](../../../../../model-library/03-模型家族/17-minicpm/minicpm5/minicpm5-bi.md).
10. StepFun. (2026). [Step 3.5 Flash.](https://arxiv.org/abs/2602.10604) *arXiv:2602.10604*. §7. 库内: [Step 3.5 Flash](../../../../../model-library/03-模型家族/04-stepfun/step3-5-flash/step3-5-flash-bi.md).
11. Ma, W., Wei, J., Zhao, L., et al. (2026). [MOPD: Multi-Teacher On-Policy Distillation for Capability Integration in LLM Post-Training.](https://arxiv.org/abs/2606.30406) *arXiv:2606.30406*.
12. Li, Y., Zuo, Y., He, B., et al. (2026). [Rethinking On-Policy Distillation of Large Language Models: Phenomenology, Mechanism, and Recipe.](https://arxiv.org/abs/2604.13016) *arXiv:2604.13016*.
13. Lu, K., & Thinking Machines Lab. (2025). [On-Policy Distillation.](https://thinkingmachines.ai/blog/on-policy-distillation/) *Thinking Machines Lab: Connectionism*.
