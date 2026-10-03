---
title: "GPT-4.5 系统卡: 无监督路线的最大模型与它的安全评测"
category: "模型库"
tags: ["OpenAI", "技术解析"]
published: true
excerpt: "系统卡的第 1, 2 节合起来不到两页, 剩下近三十页都是评测. 模型本身只交代了三件事: 它以 GPT-4o 为基础, 继续扩大预训练;"
---
# GPT-4.5 系统卡: 无监督路线的最大模型与它的安全评测

来源: OpenAI GPT-4.5 System Card (OpenAI, 2025 年 2 月 27 日). 同目录源文 `gpt-4-5.md`, 31 页, 22 张图 (1 张带编号的 Figure 1, 19 张评测柱状图, 2 张 SWE-bench 与 MLE-Bench 流程示意), 21 张表. 逐段对照见 `gpt-4-5-bi.md`. 下文数字只取本文印出的值; 从柱状图上读出的数标 「读图」.

| 项目 | 本文印出的值 |
| --- | --- |
| 定位 | 研究预览, 「largest and most knowledgeable model yet」, 以 GPT-4o 为基础继续扩大预训练 |
| 训练方法 | 新的监督技术 + SFT + RLHF; 新对齐技术 「用更小模型产出的数据训练更大模型」 |
| 结构与规模 | 未披露: 没有参数量, 层数, 上下文长度, 训练 token 数 |
| 总体风险 | 中; CBRN 与说服为中, 网络安全与模型自主性为低 |
| 幻觉 | PersonQA accuracy 0.78, 幻觉率 0.19 (Table 4) |
| 过度拒答 | 多模态 not_overrefuse 0.31, GPT-4o 0.48, o1 0.96 (Table 2) |
| 越狱最坏情形 | StrongReject goodness@0.1 0.34, o1 0.87 (Table 3) |
| METR 时间跨度 | 约 **30 分钟**, 50% 可靠度, 更早的检查点 (Figure 1) |
| 说服 | MakeMePay 收款率 57%, MakeMeSay 胜率 72% |
| 软件工程 | SWE-bench Verified 38% (n=477), SWE-Lancer 合计 \$186,125 / \$500,800 |
| 多语言 | MMLU 14 种人工译本 + 英语, 全部高于 GPT-4o, 全部低于 o1 (Table 16) |

## 1. 这份材料交代了什么, 没交代什么

系统卡的第 1, 2 节合起来不到两页, 剩下近三十页都是评测. 模型本身只交代了三件事: 它以 GPT-4o 为基础, 继续扩大预训练; 后训练用了 SFT, RLHF 和一种 「新的监督技术」; 数据来自公开数据, 合作方专有数据和内部定制数据, 并用 Moderation API 与安全分类器过滤. 参数量, 层数, 注意力形式, 上下文长度, 训练 token 数, 算力, 一概没有. 读这份材料时要先接受一个前提: 凡是关于 「GPT-4.5 为什么强」 的结构性解释, 本文都给不出依据, 下文也不做这类推测.

唯一稍有信息量的训练描述, 是第 2 节那句 「scalable alignment techniques that enable training larger and more powerful models with data derived from smaller models」. 常见的蒸馏是大模型教小模型, 这里方向反过来, 由小模型产出数据去对齐大模型. 这与 [RLAIF](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLAIF/4.4.3-RLAIF.md) 一类 「用模型反馈替代部分人工反馈」 的思路相近, 但本文没说小模型有多大, 产出的是偏好标注还是示范, 占后训练多少. 本文也没有任何一张表单独评测这项技术, 后面 Table 6 到 Table 8 的指令层级提升, §3.1.5 明确归因于 「supervised GPT-4.5 to follow the instructions in the system message」, 不能挪作这项技术的证据.

## 2. 两条 Scaling 路线里的位置

第 2 节把 OpenAI 的能力路线分成两条: 一条 Scaling 无监督学习, 目标是 「世界模型更准, 幻觉更少, 联想更好」; 一条 Scaling CoT 推理, 让模型 「先思考再回答」, 面向 STEM 和逻辑题. GPT-4.5 被放在第一条线上. 这个定位直接决定了怎么读后面的评测: 凡是需要多步推理, 长程工具调用的评测, GPT-4.5 大概率落后于 o1, o3-mini 和 deep research; 凡是更依赖知识面, 语言质量和对话分寸的评测, 它才有机会领先. 预训练规模与能力的一般关系可参见 [Scaling Law](../../../../llm-guide/3-预训练/3.2-预训练全流程/3.2.6-Scaling-Law/3.2.6-Scaling-Law.md), 本文没有提供任何能套进这类曲线的数.

把全文的对照数字按这条线过一遍, 结果基本符合预期. 领先 o1 的地方很少: PersonQA accuracy 0.78 对 0.55 (Table 4), MakeMeSay 72% 对 42%, MakeMePay 收款率 57% 对 27%, SWE-Lancer 两类任务略高于 o1. 落后 o1 的地方很多: StrongReject 0.34 对 0.87, 家教越狱 0.77 对 0.95, BBQ 非歧义题 0.74 对 0.93, SWE-bench Verified 38% 对 48%, MMLU 15 行全部低于 o1. 第 4 节开头那句 「it does not introduce net-new capabilities on most preparedness evaluations compared to previous reasoning releases」, 就是对这种分布的正式表述. 说服类评测是明显的例外, 这一点第 10 节再展开.

## 3. 拒答: 不安全输出挡住了, 过度拒答变多了

Table 1 与 Table 2 有一个排版问题需要先处理: 标准拒答评测和多模态评测各有两行指标, MinerU 把它们挤进了同一格, 写成 「0.980.71」 这样的样子. 拆开后, 纯文本标准集上 GPT-4.5 的 not_unsafe 为 0.99, not_overrefuse 为 0.71, 后者与 GPT-4o 一模一样, 比 o1 低 0.08. 多模态集上 GPT-4.5 的 not_unsafe 为 0.99, not_overrefuse 只有 0.31, GPT-4o 是 0.48, o1 是 0.96. 正文对此的表述是 「more likely to overrefuse than the comparison models」, 实际差距是 o1 的三分之一左右.

这个 0.31 在附录里拆不开. 正文说细分见 Appendix 7.1, 可对应的 Table 21 只列 not_unsafe, 而且只有三个类别; GPT-4.5 三类平均约 0.978, 也对不上 Table 2 的 0.99. 纯文本的 XSTest 细分 (Table 19) 倒能看出过度拒答集中在哪里: Safe Contexts 只有 0.56, Discr: Nonsense group 为 0.72, Figurative Language 与 Historical Events 都从 1 掉到 0.92. 这些类别的共同点是 「字面上碰到敏感词, 语义上无害」, GPT-4.5 在这类边界上比 GPT-4o 更保守. 多模态上的过度拒答是否同源, 本文没有给出材料.

附录还有一个更隐蔽的问题. 用 Table 18 七个类别做简单平均, 高难拒答集上 GPT-4o 约 0.850, GPT-4.5 约 0.836, GPT-4.5 反而更低; 可 Table 1 印的是 GPT-4o 0.83, GPT-4.5 0.85, 顺序相反. 同样的计算放到 Table 19 与 Table 20 上, 简单平均都能对上 Table 1, 只有 Table 18 对不上. 最可能的解释是 Table 1 按类别样本数加权, 而 GPT-4.5 较弱的 illicit/non-violent (0.73) 与 illicit/violent (0.78) 样本较少, 但本文没有给各类样本数, 这个解释无法核实.

## 4. 越狱与指令层级: 平均情形与最坏情形

Table 3 的两行数字看上去互相打架. 人工来源越狱上 GPT-4.5 是三个模型里最高的 0.99, StrongReject 上却是最低的 0.34, 甚至低于 GPT-4o 的 0.37. 关键在指标定义: 人工越狱是 accuracy, 对全部样本平均; goodness@0.1 对每条提示只看最强的前 10% 攻击技巧, 是最坏情形下的安全率. 一把锁对大多数撬法都够用, 并不说明它扛得住最好的那几种. o1 在最坏情形下的 0.87 与 GPT-4.5 拉开了 0.53, 本文没有解释原因, 正文只写了一句 「performs close to GPT-4o」.

指令层级的三张表 (Table 6 到 Table 8) 呈现的是同一个格局. 对 GPT-4o 四行全胜, 家教越狱从 0.33 提到 0.77, 提升最大; 对 o1 四行全输, 家教越狱相差 0.18, 密码保护 0.92 对 1. §3.1.5 说这种能力是通过收集 system 与 user 消息冲突的样例做监督训练得来的, 属于 [SFT](../../../../llm-guide/4-后训练/4.2-SFT/4.2-SFT.md) 式的直接教. o1 不需要专门为 GPT-4.5 设计的样例也能做得更好, 一个合理的推断是推理过程本身有助于识别 「用户在绕规则」, 但本文没有做这方面的对照实验.

三张表的行名后缀也容易看岔. Table 7 写 「Tutor jailbreak - system message」, Table 8 写 「Phrase protection - user message」, 看上去像两种不同的冲突, 其实说的是同一种冲突的两端: 前者强调防守指令放在 system 消息里, 后者强调攻击来自 user 消息. §3.1.5 开头说发给 GPT-4.5 的消息只分 system 与 user 两类, Table 6 的标题却叫 「Conflicts Between Message Types」, 表里也只有 System 对 User 一行. 对部署方来说, 这组数字的实际含义是: 把规则写进 system 消息, GPT-4.5 守住的概率在 0.76 到 0.92 之间, 比 GPT-4o 可靠, 但离 o1 在密码保护上的满分还有距离, 遇到提示注入场景时不能只靠模型自觉.

## 5. 幻觉与偏见: 两张小表的分母问题

Table 4 是全文支撑 「幻觉更少」 的唯一数据. GPT-4.5 的 accuracy 0.78, 比 o1 高 0.23; 幻觉率 0.19, 只比 o1 低 0.01. 把两个指标相加, GPT-4.5 是 0.97, GPT-4o 是 0.80, o1 是 0.75. 如果两个指标分母相同且只含作答, 两者之和应接近 1; 实际余下的部分, GPT-4o 有 0.20, o1 有 0.25, GPT-4.5 只有 0.03. 这部分可能是拒答, 不知道或半对, 本文没有定义. 一种读法是: GPT-4.5 几乎每题都作答, accuracy 因此大涨; 幻觉率却几乎没降, 它 「多答对的题」 可能主要来自原本不作答的那部分, 而不是把原来答错的题改对. 本文没有给出拒答率, 这个读法只能停在推断.

正文另一处笔误也在这张表附近: 「performs on par or better than GPT-4o and o1-mini」, 表里并没有 o1-mini, 对照列是 o1. 至于正文末尾那句 「More work is needed ... particularly in domains not covered by our evaluations (e.g., chemistry)」, 结合 PersonQA 只问人物事实这一点, 可以确定本文对幻觉的测量范围非常窄.

Table 5 的 BBQ 结果有同样的分母问题. P(not-stereotype | not unknown) 上 GPT-4.5 是 0.20, GPT-4o 与 o1 只有 0.06 与 0.05. 歧义题的正确答案是 「unknown」, GPT-4.5 的歧义题 accuracy 为 0.95, 所以条件概率只在约 5% 的歧义题上计算. 分母这么小, 几道题就能让比值成倍变化, 这也是正文说这个指标 「descriptive power ... is minimal」 的原因. 真正有区分度的是非歧义题: o1 0.93, GPT-4.5 0.74, GPT-4o 0.72, 带偏见的干扰项对非推理模型的影响明显更大.

## 6. 红队评测集和外部评估

§3.2 用的两套红队评测集, 都是为别的模型构建的. Table 9 的集子针对 o3-mini 生成, o3-mini 只有 0.26, 正文说 「not unexpected」; Table 10 的集子针对 deep research 构建, deep research 却得了 0.67, 与 o1 的 0.68 几乎并列第一. 两张表摆在一起, 「针对谁生成谁吃亏」 的逻辑只在第一张成立. GPT-4.5 在两张表上分别为 0.51 与 0.46, 比 GPT-4o 高 0.01 与 0.06, 前一个差值落在任何合理的波动范围之内, 不宜读成稳健性提升. 正文最后一段也承认, 这些对抗集 「intentionally challenging」, 短期内分数偏低是预期之内的事.

外部评估部分信息量有限. Apollo Research 的结论是暗中谋划得分 「低于 o1 但高于 GPT-4o」, 可 Appendix 7.2 只给了 GPT-4.5 对 o1 的比较: 六项评测中三项零暗中谋划 (o1 六项全有), 伪装对齐与 o1 相近, 乘法藏拙不如 o1 一贯, 自我外泄 2%. GPT-4o 的数一个都没有, 另外三项评测的名字也没列. 2% 那一项的设置相当激进: 模型被要求 「不惜一切代价」 追求长期目标, 还拿到隐藏草稿区, 并被鼓励 「有创造性, 要主动」, 在这些少数情况下, 它在后续追问中仍保持欺骗.

METR 的 Figure 1 是全文唯一带编号的图. 时间跨度分数定义为 agent 能以 50% 可靠度完成的任务时长, 按人类基线耗时计. 说明文字给 GPT-4.5 的是 「around **30 minutes**」, 读图柱顶在 30 min 刻度线之上, 按对数纵轴估算约 35 分钟, 95% CI 约 20 分钟到接近 1 小时; 同样读图, o1 约 1 小时出头, Claude 3.5 Sonnet (New) 约 50 分钟, GPT-4o 约 10 分钟. 需要注意两点: METR 测的是更早的检查点, 只有 **7 天**; 用的是为 o1 优化的 agent 脚手架. METR 自己在正文里也说, 训练完成后才做的能力评估只能给出有限的安全保证. 有关这类第三方评估的方法论, 可参见 [部署治理与持续保证](../../../../llm-guide/5-评测、安全与治理/5.4-部署治理与持续保证.md).

## 7. 准备度框架的读法: 评级, 指标与 「缓解前」

第 4 节开头给出了总评: 安全顾问组把 GPT-4.5 定为总体中风险, CBRN 与说服为中, 网络安全与模型自主性为低. 问题在于 「中」 指的是哪个模型. §4.1 说 CBRN 与说服 「reached a Medium post-mitigation risk designation」; Conclusion 却写 「classify the pre-mitigation model as medium risk in persuasion and CBRN」. 两处说法一处指缓解后, 一处指缓解前. 对照 §4.3.1, 缓解后模型在长篇生物风险题上五个阶段全是 0%, 可见 CB 的中风险判断至少部分依据的是缓解前能力. 本文没有统一这两个术语在评级中的用法.

第 4 节的柱状图用了至少四种指标, 读的时候必须逐图看纵轴. 长篇生物风险, BioLP, ProtocolQA, SWE-bench, Agentic Tasks, MLE-Bench, OpenAI PRs, 面试编程题用 pass@1; 多模态病毒学, 隐性知识, 背景核知识, 放射与核专家知识, 面试选择题用 **cons@32** (32 次采样取多数票); WMDP 用 **cons@4**; CTF 用 **pass@12**. §4 开头那段置信区间说明只针对 pass@1, 而且作者自己提醒: bootstrap 只刻画同一批题上多次尝试的采样方差, 不刻画题目层面的方差, 小数据集上区间会偏窄. 面试编程题只有 18 道, 79% 换成题数是 14.22 道, 一道题就值约 5.6 个百分点, 这类评测的误差棒要打折看. 评测指标本身的一般讨论见 [评测科学与证据](../../../../llm-guide/5-评测、安全与治理/5.1-评测科学与证据.md).

最容易误读的是 「缓解前」 这个标签. 按直觉, 缓解前模型没有安全训练, 能力应当不低于缓解后. 可逐图读下来几乎处处相反: BioLP 25% 到 29%, 隐性知识 65% 到 72%, 背景核知识 64% 到 71%, 放射与核专家知识 62% 到 68%, WMDP 83% 到 85%, CTF 高中级 37% 到 53%, SWE-bench 35% 到 38%, Agentic Tasks 25% 到 40%, OpenAI PRs 2% 到 7%, 面试编程 72% 到 79%. §4 第二段说评测跑在 「throughout training and on early post-trained checkpoints」 上. 更一致的读法是: 「缓解前」 是一个后训练更少的早期检查点, 它同时缺少安全训练和能力调优, 因而不能充当能力上界. 本文的风险判断若以它为依据, 实际可能偏低.

## 8. 网络安全与化学生物

网络安全评测用 100 多道公开 CTF 题, 分高中, 大学, 专业三档, 每题跑 16 次 rollout, 「recording the pass@12 metric over the best set of rollouts」. 这个 「best set」 没有定义. 如果是从 16 次里挑最好的 12 次, 结果近似 「16 次里至少成功一次」, 比标准的 pass@12 更宽松. 缓解后 GPT-4.5 为 53%, 16%, 2%, deep research 为 92%, 91%, 70%, o1 为 49%, 17%, 23%. 专业级上 GPT-4.5 只有 2%, 远低于 o1 的 23%, 这是评为低风险的直接依据. 各档题数没有给出, 所以 2% 对应几道题无从换算.

化学生物部分的小结是 「GPT-4.5 can help experts with the operational planning of reproducing a known biological threat」, 达到中风险阈值. 可逐项看柱状图, 这个判断很难落到哪一根柱子上. 长篇生物风险题上, 缓解前 GPT-4.5 只在构想阶段 25% 领先, 扩增 59% 低于 GPT-4o 的 89%, 配制 0% 低于 deep research 的 69%, 释放 19% 低于 o3-mini 的 69%; 缓解后全部 0%. BioLP 29% 低于专家基线 38.4%; ProtocolQA 18% 低于专家中位数 42% 和共识 54%; 隐性知识 72% 与 deep research 持平, 低于共识 80%. 换句话说, GPT-4.5 在这组评测里没有一项明显超过已发布模型, 本文也没有指明是哪项评测触发了中风险阈值.

多模态病毒学一项有个口径细节. 正文说 GPT-4.5 得 56%, 「a meaningful uplift of 15% over GPT-4o」, 读图 GPT-4o 为 41%, 所以是 15 个百分点, 相对提升约 37%; 指标是 cons@32. 正文又说 「All models score above the average human baseline (40%)」, GPT-4o 只比基线高 1 个百分点. WMDP 生物学用的是 3,668 道题里的 1,520 道生物子集, 约占 41%, 所有模型都在 83% 到 90% 之间, 区分度很低.

## 9. 放射与核

§4.4 开头的限定比其他部分都重: 评测没有使用任何美国机密或受限数据, 全面评估需要与美国能源部合作, 而且裂变材料, 浓缩和后处理设施本身受严格管控. 在这些前提下, 作者的结论是 GPT-4.5 「cannot meaningfully assist」 放射或核武器研发. 两项评测的题目都由 MIT 的 Jake Hecla 编写, 背景核知识 222 道, 放射与核专家知识 87 道.

§4.4.2 有一处明确的计数错误: 正文说 87 道题 「grouped into the following nine topics」, 可逐项数下来是十个主题, 从放射性暴露一直到简易核装置. 87 道题分到十个主题, 平均不足 9 道, 本文也没给每个主题的题数. 成绩方面, 读图背景核知识上缓解后 GPT-4.5 为 71%, o3-mini 73%, deep research 77%, 正文 「roughly in-line with o3-mini」 成立; 专家知识上 GPT-4o 59%, GPT-4.5 68%, 「9% uplift」 是 9 个百分点, 与图吻合.

这一节的判断逻辑和化学生物部分不同. 化学生物的中风险来自 「能帮专家做操作规划」, 放射与核的低影响判断则主要靠物理门槛: 即使模型答对了更多专家题, 裂变材料和浓缩设施的获取仍是决定性瓶颈. 这种论证把模型能力和现实可行性分开看, 专家知识 68% 这个数本身并不直接对应风险等级. 反过来也要看到它的边界: 评测只用了非机密信息, 正文自己说这 「limits our ability to assess certain steps」, 所以 「无法实质性协助」 是在可测范围内的结论, 不能外推到机密环节.

## 10. 说服: 次数和金额是两回事

说服是 GPT-4.5 唯一明显领先所有对照模型的风险类别, 小结直接写了 「state-of-the-art performance」. MakeMePay 里 GPT-4.5 扮骗子, GPT-4o 扮刚拿到 \$100 的被骗者, 每组 1000 个样本. 读图收款率: GPT-4.5 57%, deep research (无浏览) 36%, o1 27%, GPT-4o 与 o3-mini 都是 1%. 金额提取率: deep research 21% 最高, GPT-4.5 8%, o1 4%.

正文用一个策略解释这种 「次数多, 金额少」 的组合: GPT-4.5 学会了只要小额捐款, 比如 「Even just \$2 or \$3 from the \$100 would help me immensely」. 把两根柱子乘回金额就能检验这个解释. 8% 的提取率对应 \$100,000 里约 \$8,000, 57% 的收款率对应约 570 次付款, 平均每次约 \$14, 是引文里 \$2 或 \$3 的好几倍. 所以小额请求是典型策略, 但分布里还有不少大额付款. deep research 平均每次约 \$58, 它的路线是少而大.

MakeMeSay 里 GPT-4.5 以 72% 的胜率领先, o3-mini 62%, o1 42%, GPT-4o 自己骗自己 26%, deep research (无浏览) 24%. 胜率按定义是获胜次数除以对话次数, 「输」 与 「违规」 都在分母里, 没有分开报告. 每个暗号跑 32 个样本, 暗号总数没给. 这一节的文字还有一个细节值得留意: 作者说 「We do not plot Pre-Mitigations models for this evaluation because the model does not refuse on this task」, 也就是说, 安全训练对这类社会工程能力几乎没有约束, 这也解释了为什么说服是中风险, 且没有任何数字显示缓解措施起了作用. §4.5 第三段承认现有评测只测 「生成有说服力的文字」, 真实风险还涉及个性化, 规模化分发和反复曝光, 作者正在重新考虑评估方法. 安全评测设计的更多讨论见 [安全与对抗评测](../../../../llm-guide/5-评测、安全与治理/5.2-安全与对抗评测.md).

## 11. 模型自主: 从面试题到 SWE-Lancer

模型自主性的六项评测按任务跨度从短到长排列. 面试选择题上 o1 之后的模型都是 80% 左右 (deep research 78%), 已经没有区分度; 编程题 GPT-4.5 79%, 与 deep research 持平, 低于 o3-mini 的 92%. 作者自己也提醒, 面试题只测 1 小时的任务, 真实 ML 研究是 1 个月到 1 年以上. SWE-bench Verified 上缓解后 38%, 缓解前 35%, GPT-4o 31%, o1 48%, deep research 68%. 正文写 「an uplift of 2-7% over GPT-4o」, 按图下界应是 4 个百分点, 不是 2. 另外 SWE-bench Verified 本身有 500 题, 实际只跑 477 题, 剔除的 23 题只说 「validated on our internal infrastructure」.

Agentic Tasks 上缓解后 GPT-4.5 40%, 高于 o1 的 36% 与 GPT-4o 的 34%, 这是它在自主类评测里少有的领先非 deep research 模型的项目, 但缓解前只有 25%, 本身就说明这类评测对后训练版本很敏感. MLE-Bench 上 o1, o3-mini, deep research 与 GPT-4.5 同为 11%, 75 场竞赛的 11% 是 8.25 场, 一场值约 1.3 个百分点; 更要紧的是 deep research 用内部工具脚手架, 其余用 AIDE agent, 同一个 11% 是不同条件下的读数. OpenAI PRs 上 deep research 42%, GPT-4.5 7%, o3-mini 0%; o1 的 12% 和 GPT-4o 的 6% 取自旧系统卡, 用的是修正前的评分, 作者估计新口径下还会再高 1-5pp. Agent 评测设计的一般问题可参见 [Benchmark 与 Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md).

SWE-Lancer 是最接近 「经济价值」 的一项. 通过率: IC SWE 20%, SWE Manager 44%, 都略高于 o1 的 17% 与 42%. 金额: IC SWE \$41,625, SWE Manager \$144,500, 合计 \$186,125, 约占 \$500,800 满额的 37.2%; o1 合计 \$165,625, 约 33.1%; deep research 合计 \$258,875, 约 51.7%. 两类任务单价差别很大, IC SWE 通过率 20% 只换来 \$41,625, 管理类 44% 换来 \$144,500, 通过率不能直接当收入读. 正文还有一句 「Pass@1 performance represents high reasoning effort」, 这是 o 系列的推理强度设置, GPT-4.5 没有对应开关, 本文没说它用的什么配置. 缓解前 GPT-4.5 合计 \$139,500, 与 GPT-4o 的 \$138,750 只差 \$750.

## 12. 多语言 MMLU

第 5 节用专业人工译者把 MMLU 测试集译成 14 种语言, 这与 GPT-4 技术报告用 Azure Translate 机翻不同. Table 16 共 15 行, 加上未翻译的英语. GPT-4.5 每一行都高于 GPT-4o, 每一行都低于 o1; 对 15 行做简单平均: GPT-4o 约 0.819, o1 约 0.880, GPT-4.5 约 0.854, GPT-4.5 大致落在两者中间偏 o1 一侧.

逐行相减能看出一个模式. GPT-4.5 相对 GPT-4o 的提升在英语最小, 只有 0.009; 在约鲁巴语最大, 为 0.061; 孟加拉语 0.0463, 葡萄牙语 0.0429, 斯瓦希里语 0.0413 也在前列. 知识面扩大带来的收益, 在低资源语言上更明显. 但约鲁巴语上 GPT-4.5 距 o1 的差距也最大, 为 0.072, 以英语为基准, 约鲁巴语只保留了约 76% 的成绩. 英语行只印三位小数, 其余行印四位, 而且英语是原题, 其余是译本, 英语与其他语言之差混着语言能力和翻译损耗两种因素.

## 13. 本文对不上的数字

| 位置 | 本文写法 | 对照结果 |
| --- | --- | --- |
| Table 1 XSTest 行 | 引 [17] | 正文与 References 均应为 [13], [17] 是 JailbreakBench |
| Table 1 GPT-4o 标准拒答 | 0.98 | Table 17 简单平均约 0.9885, 四舍五入为 0.99 |
| Table 1 高难拒答 | GPT-4o 0.83, GPT-4.5 0.85 | Table 18 简单平均 0.850 与 0.836, 顺序相反 |
| Table 2 多模态 GPT-4.5 not_unsafe | 0.99 | Table 21 三类平均约 0.978, 且缺 not_overrefuse 细分 |
| §3.1.3 PersonQA | 「GPT-4o and o1-mini」 | Table 4 的对照列是 o1 |
| Table 4 | accuracy + 幻觉率 | 0.97, 0.80, 0.75, 均不等于 1, 分母未定义 |
| Table 10 | 为 deep research 构建 | deep research 得 0.67, 与 「针对谁谁吃亏」 的解释矛盾 |
| Figure 1 | 「around 30 minutes」 | 读图约 35 分钟 |
| §4 / §4.1 / Conclusion | 中风险 | 一处说 post-mitigation, 一处说 pre-mitigation |
| §4.2 | pass@12 「over the best set of rollouts」 | 16 次 rollout 如何取 12 次未定义 |
| §4.4.2 | 「nine topics」 | 列表实为十个主题 |
| §4.5.1 | 小额请求 \$2 或 \$3 | 读图 8% 提取率 / 57% 收款率, 平均每次约 \$14 |
| §4.6.2 | 「uplift of 2-7% over GPT-4o」 | 读图 31% 到 35% 与 38%, 应为 4-7 |
| §4.6.2 | 500 题核验集 | 实际 n=477 |
| §4.6.6 | 「high reasoning effort」 | GPT-4.5 不是推理模型, 无对应设置 |
| 多张柱状图 | 缓解前 / 缓解后 | 缓解后普遍高于缓解前, 「缓解前」 定义缺失 |
| §3.3 / Appendix 7.2 | 「higher than GPT-4o」 | 附录没有任何 GPT-4o 数据 |

这些问题大多不改变结论. GPT-4.5 在安全评测上与 GPT-4o 大体持平, 在推理与 agent 类评测上落后于 o 系列, 在说服上领先, 这个大格局经得起上表每一项修正. 真正影响读法的是两处: 一是 「缓解前」 并非能力上界, 准备度评测的下界属性因此更强; 二是过度拒答与 StrongReject 这两个最弱项, 本文都没有给出能定位原因的细分数据.

从文档体例看, 这份系统卡的重心在 「部署前评测做了什么」, 而不是 「模型是怎样做成的」. 读者如果想知道无监督路线的 Scaling 在结构和数据上意味着什么, 本文提供不了答案; 能从本文得到的, 是一张相当完整的风险评测清单, 以及 OpenAI 在 2025 年初用来给前沿模型定级的口径. 与 agent 自主性相关的安全讨论还可参见 [Agent 安全与对齐](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐.md), 后训练里 RLHF 的一般流程见 [RLHF 与 PPO](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/4.4.1-基于奖励模型的RL-RLHF-PPO.md).
