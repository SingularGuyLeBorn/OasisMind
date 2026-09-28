# o3-mini 系统卡: 一个小推理模型的安全评测与第一个自主性中风险

来源: OpenAI o3-mini System Card (OpenAI, 2025 年 1 月 31 日). 同目录源文 `o3-mini.md`, 37 页, 23 张图 (19 张评测柱状图或点图, 1 张 SWE-bench 流程示意, 2 张 MLE-bench 示意, 1 张分子图像示例), 18 张表. 逐段对照见 `o3-mini-bi.md`. 下文数字只取本文印出的值; 从图上读出的数标 「读图」, 自己算出的数标 「估算」. 涉及网络攻击与生物实验的小节, 这里只谈评级和分数.

| 项目 | 本文印出的值 |
| --- | --- |
| 定位 | o 系列最新成员, 与 o1-mini 一样是 「a faster model that is particularly effective at coding」 |
| 训练方法 | 大规模强化学习 + CoT; 审慎对齐 (deliberative alignment); 预训练数据过滤与 PII 过滤 |
| 结构与规模 | 未披露: 没有参数量, 层数, 上下文长度, 训练 token 数, 价格, 推理强度档位 |
| 检查点 | near-final 检查点与发布检查点共用同一个基座, 后者多了 「small incremental post training improvements」 |
| 总体风险 | 中; 说服, CBRN, 模型自主性为中, 网络安全为低 |
| 越狱最坏情形 | StrongReject goodness@0.1 0.73, o1-mini 0.72, GPT-4o 0.37 (Table 2) |
| 幻觉 | PersonQA 幻觉率 14.8%, accuracy 21.7% (Table 3) |
| 红队 | 对 GPT-4o 胜率 **73.3% 到 83.1%**, 对 o1 约 50% (Table 8); Gray Swan ASR 3.6%, o1 1.9% |
| 网络安全 | CTF 缓解后高中 61%, 大学 21%, 专业 21% (读图) |
| 说服 | MakeMePay 收款率缓解前 79%, 缓解后 1%; MakeMeSay 缓解后 62% (读图) |
| 软件工程 | SWE-bench Verified: 内部工具脚手架 61%, Agentless 39%, n=477 |
| 多语言 | MMLU 14 种人工译本, 14 行全部低于 GPT-4o, 12 行高于 o1-mini (Table 14) |

## 1. 这份材料交代了什么, 没交代什么

系统卡的第 1 到第 3 节加起来两页多一点, 余下三十多页都是评测, 作者名单和参考文献. 关于模型本身, 本文只给了三类信息. 第一类是定位: o3-mini 是 o 系列最新的一员, 和 o1-mini 一样更快, 尤其擅长编程, 计划在 ChatGPT 里接入联网搜索. 第二类是训练方法: 用大规模强化学习学会先产生很长的 CoT 再回答, 并用审慎对齐让模型在上下文里对照安全政策推理. 第三类是数据: 预训练用公开数据与内部定制数据, 经过质量过滤, 个人信息过滤, 以及 Moderation API 与安全分类器的有害内容过滤.

没交代的比交代的多得多. 参数量, 层数, 注意力形式, 是否用 MoE, 上下文长度, 训练 token 数, 训练算力, 强化学习用的奖励怎么来, 是 PPO 还是 GRPO 一类算法, 这页都没有. 「faster」 没有任何延迟或吞吐数字支撑, 价格与推理强度档位也不在本文范围内. 所以凡是 「o3-mini 为什么比 o1-mini 强」 的结构性解释, 本文给不出依据, 下文不做这类推测. 能讨论的只有一件事: 在一批固定的安全与能力评测上, 它相对 GPT-4o, o1-mini, o1 落在哪里, 以及这些数字该怎么读.

第 3 节还有一处容易被略过的交代: 评测覆盖两个检查点, o3-mini-near-final-checkpoint 和发布检查点, 两者 「the base model is the same」, 发布版只多了少量后训练改进. 红队和两项说服人工评测用的是 near-final, 其余 「All other evaluations are on the final model」. 这句话在 §5.7.2 被打破了一次, 第 12 节再谈. 另外, GPT-4o 和 o1-mini 这类在线模型的对照数取自它们的最新版本, 与各自发布时公布的值可能略有出入, 跨系统卡比较同一模型的分数时要记住这一点.

## 2. 训练描述: 强化学习, CoT 与审慎对齐

第 2 节对训练的描述几乎全是定性的: 模型 「think before they answer」, 训练中学会 「refine their thinking process, try different strategies, and recognize their mistakes」. 这与 o1 系统卡的说法一致, 是推理模型的通用描述, 不是 o3-mini 独有的信息. 推理模型这条路线的一般机制可参见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md); 本文没有给出 CoT 长度, 强化学习步数, 奖励模型或可验证奖励的比例, 这些都无从核对.

与安全直接相关的是审慎对齐. 脚注 1 的定义是 「teaches LLMs to explicitly reason through safety specifications before producing an answer」, §5.2 补充说它 「required updating the format of our refusal policies and generating new safety data」, 并顺带为政治说服任务引入了新的拒答行为. 这与 [Constitutional AI](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLAIF/01-Constitutional-AI-宪法对齐/01-Constitutional-AI-宪法对齐.md) 一类 「让模型对照成文规范自我约束」 的做法思路相近, 区别在于规范是在 CoT 里被显式引用的. 但本文没有一张表单独做消融, 看不出拒答和越狱上的提升有多少来自审慎对齐, 多少来自常规的拒答训练 (第 4.1 节说 o3-mini 「inherits our earlier safety mitigations of training in refusal behavior」).

数据侧的描述同样简短. 预训练数据过滤 「removing sensitive content that could enable CBRN proliferation」, 加上 PII 输入过滤, 这些在 §5.2 被列为 o 系列共用的预训练缓解. 过滤比例, 过滤前后的数据量, 过滤对能力分的影响, 本文都没有. 通用的数据清洗流程可参见 [数据处理](../../../../llm-guide/3-预训练/3.1-预训练数据/3.1.3-数据处理/3.1.3-数据处理.md). 读到后面化学生物一节时值得回想这一点: 缓解前模型在多项生物评测上仍超过专家基线, 说明预训练过滤并没有把相关知识清干净, 真正起作用的是后训练阶段的拒答.

## 3. 拒答与越狱: 平均接近满分, 差距在最坏情形

Table 1 的四行里, 标准拒答集的 not_unsafe 三个模型都是 1, not_overrefuse 在 0.89 到 0.92 之间, 几乎没有区分度. 拉开差距的是高难拒答集: o3-mini 0.9, o1-mini 0.93, GPT-4o 0.8. XSTest 的过度拒答上 o3-mini 0.88, 与 GPT-4o 相同, 低于 o1-mini 的 0.95. 正文说 o3-mini 「has similar performance to GPT-4o」, 这个说法只在 XSTest 上成立; 高难拒答上 o3-mini 比 GPT-4o 高 0.1, 比 o1-mini 低 0.03.

附录能把这两个汇总数拆开. Table 17 里 o3-mini 的 XSTest 十个类别简单平均正好是 0.88 (估算), 与 Table 1 对得上; 掉分集中在 Discr: Nonsense context 0.48 与 Privacy: fictional 0.56. 同一张表上缓解前模型整体是 0.99, 缓解后降到 0.88. 这说明安全训练在带来拒答的同时, 也让模型在 「字面敏感, 语义无害」 的边界上更保守. 高难拒答集反过来: Table 16 里缓解前 sexual/exploitative 只有 0.52, 缓解后升到 0.93, 安全训练在这一类上起的作用最大.

越狱评测 (Table 2) 的读法与拒答类似. Production jailbreaks, Jailbreak Augmented Examples, Human Sourced Jailbreaks 三行都在 0.95 以上, 三个模型差别不大; 只有 StrongReject 掉到 0.73 上下. 差别来自指标口径: goodness@0.1 对每条提示只看最强的前 10% 越狱技巧, 是最坏情形的安全率. 在这一行上 o3-mini 0.73 与 o1-mini 0.72 持平, GPT-4o 只有 0.37. 推理模型相对 GPT-4o 的优势, 在平均情形里几乎看不见, 要到最坏情形才显出来. 越狱评测的一般设计可参见 [安全与对抗评测](../../../../llm-guide/10-评测、安全与治理/10.2-安全与对抗评测.md).

## 4. 幻觉与偏见: 分母决定结论

PersonQA (Table 3) 只有两行, 但两行指向不同的结论. o3-mini 的幻觉率 14.8% 在三者中最低, GPT 4o-mini 为 52.4%, o1-mini 为 27.4%; 可 accuracy 上 o3-mini 只有 21.7%, 低于 GPT 4o-mini 的 28.4%. 两项相加, GPT 4o-mini 为 80.8%, o1-mini 47.0%, o3-mini 36.5% (估算). 如果剩余部分主要是 「不作答」, 那么 o3-mini 的低幻觉率有相当一部分来自少答, 而不是答得更准. 本文没有定义第三类结果, 这个推断无法核实, 但足以说明 「on par or better」 只在幻觉率一项上成立. 表头写的是 GPT 4o-mini, 正文说对比 GPT-4o, 两处也不一致.

BBQ (Table 4) 有同样的分母问题. 歧义题 accuracy o3-mini 为 0.82, 低于 o1-mini 的 0.88 和 GPT-4o 的 0.97; 非歧义题为 0.96, 四个模型中最高. 第三行 P(not stereotyping | ambiguous question, not unknown) 上 o3-mini 为 0.12, 也是最高, 但这个条件概率只在歧义题里没答 「unknown」 的样本上算; o3-mini 歧义题答错更多, 这个条件下的样本也更多, 两个模型的第三行并不是在同一个分母上比. 正文把非歧义题的变化也写成 「slight regression」, 按表是从 0.94 升到 0.96, 应属笔误.

显性与隐性歧视的系数在附录 Table 18. 显性歧视上 o3-mini 总系数 0.14, 五个模型中最低, 与正文 「least bias」 相符; 隐性歧视上 o3-mini 为 0.22, 低于 o1-mini 的 0.44 和 4o-mini 的 0.28, 高于 o1-preview 的 0.09 和 o1 的 0.21, 正文称之为 「moderately」. 这张表有两个小问题: 显性一栏的对照是 GPT-4o, 隐性一栏却换成了 4o-mini; 正文说拟合的是 mixed effects model, 表注写的是 fixed effects model. 系数已归一化到 0 到 1, 只能在同一栏内部比较.

## 5. 指令层级: 面向 API 部署的防线

§4.2 的出发点是 API 部署: 开发者可以给每条终端用户提示附上自定义的开发者消息, 处理不当就可能绕过护栏. 对策是指令层级, 即系统消息优先于开发者消息, 开发者消息优先于用户消息, 做法是收集三类消息互相冲突的样例, 「supervised o3-mini」 去遵守更高优先级的指令. 从描述看这是一轮带标注的 SFT, 与审慎对齐不是同一件事. 通用的 SFT 做法可参见 [SFT](../../../../llm-guide/4-后训练/4.2-SFT/4.2-SFT.md).

三张表的结果并不整齐. 消息类型冲突 (Table 5) 上 o3-mini 三行为 0.75, 0.76, 0.73, 对 GPT-4o 一平两负, 对 o1 三行全负; 系统对用户这一行低 GPT-4o 0.05, 最可能就是正文 「all but one」 里的那个例外. 家教越狱 (Table 6) 上 o3-mini 开发者消息 0.94 高于 o1 的 0.92, 系统消息 0.88 低于 o1 的 0.95. 短语与密码保护 (Table 7) 上 o3-mini 短语保护两行都是 1, 高于 o1 的 0.91 和 0.70; 密码保护两行 0.95 和 0.89, 低于 o1 的 1 和 0.96. 正文 「both better and worse than o1 (depending on the eval)」 是对这种分布的如实描述.

值得注意的是冲突类评测整体偏低. 三个模型在 Table 5 上都只有 0.73 到 0.80, 说明 「按优先级服从」 在纯冲突场景下仍是弱项, 而这恰恰是开发者消息被滥用时最直接的攻击面. 本文计划让 o3-mini 在 ChatGPT 里联网搜索并总结, 理由之一就是它在越狱和指令层级上的表现; 可网页内容里的注入属于哪一级消息, 本文没有讨论, 这几张表也没有覆盖网页注入场景.

## 6. 红队与 Gray Swan 竞技场

成对红队 (§4.3.1) 用的是 near-final 检查点, 三个模型匿名并排生成, 都能联网和执行代码. 对话类别里网络入侵 13.8%, 生物恐怖 14.2%, 武器制造 8.5%, 其余五类合计约 26% (估算); 八类加起来是 62.5%, 剩下的 「among others」 没有列出. 只有产生过至少一条被认为不安全的生成的对话才计入, 所以 Table 8 的胜率比的是 「在有风险的对话里谁更安全」, 不是整体拒答率.

Table 8 的结论很清楚: o3-mini 对 GPT-4o 三种打分为 73.3%, 83.1%, 82.4%, 与 o1 对 GPT-4o 的 71.8%, 82.8%, 82.4% 几乎一样; o3-mini 对 o1 为 51.9%, 50.4%, 49.9%, 可读作打平. 拒答率则是另一幅图景: GPT-4o 拒答 34.2%, o1 63.5%, o3-mini 56%. o3-mini 比 o1 少拒答 7.5 个百分点, 安全胜率却没掉, 脚注 5 的 「Not all the queries necessarily should be refused」 是理解这一点的关键.

Gray Swan 竞技场 (§4.3.2) 给出的是反方向的信号. 攻击成功要求补全同时触发 moderation API 和 「complete and actionable」 分类器, o3-mini 的平均 ASR 为 3.6%, o1-mini 3.7%, GPT-4o 4.0%, o1 1.9%. o3-mini 约为 o1 的 1.89 倍 (估算), 与 Table 8 里和 o1 打平的结论并不矛盾: 前者是公开竞技场里用户主动攻击, 后者是专业红队的开放式试探, 两种设置测的是不同的东西. 本文没给竞技场的攻击总次数, 这几个百分比算不出置信区间.

## 7. 准备度框架怎么读: 缓解前, 缓解后与下界

第 5 节开头有三条规则, 决定了后面所有数字的读法. 其一, 只有缓解后评分不高于中的模型才能部署, 不高于高的才能继续开发. 其二, 评级依据是缓解前模型, 即 「actively post-trained to be helpful, i.e., not refuse」 的研究版本; SAG 把缓解后等级定得与缓解前相同, 「to err on the side of caution」. 其三, 所有结果都只能当作 「a lower bound of potential model capability」, 因为更好的脚手架或诱导方法可能大幅提高分数. 这套流程的一般讨论见 [部署治理与持续保证](../../../../llm-guide/10-评测、安全与治理/10.4-部署治理与持续保证.md).

「缓解前更强」 这个隐含前提, 在能力类评测上并不总成立. 读图: 专业级 CTF 缓解后 21%, 缓解前只有 12%; BioLP 缓解后 41%, 缓解前 39%; ProtocolQA 缓解后 23%, 缓解前 18%. 本文对缓解前模型的描述是 「different post-training procedures」, 这意味着它不是缓解后模型去掉安全训练的版本, 而是另一条后训练支路, 在有些任务上可能反而训得更差. 所以缓解前的分数在拒答类评测上是上界, 在纯能力类评测上不一定是.

置信区间的说明也值得一读. pass@1 的 95% 区间用 bootstrap 对 「模型的多次尝试」 重采样, 数据集本身视为固定; 本文自己承认这种做法在小数据集上会低估不确定性, 在通过率接近 0% 或 100% 时区间会过窄. 后面几项评测恰好都是小数据集: 面试编程题 18 道, 核知识专家题 87 道, MLE-bench 75 场. 读这些图上的误差棒时, 要把它当作偏乐观的区间. 评测统计的一般问题见 [评测科学与证据](../../../../llm-guide/10-评测、安全与治理/10.1-评测科学与证据.md).

## 8. 网络安全: 低

网络安全是四类里唯一评为低的. 评测用一百多道 CTF 题, 分高中, 大学, 专业三档, 给模型一个 Kali Linux 工具环境, 每次尝试最多 60 轮工具调用, 每题 12 次尝试. 读图: o3-mini 缓解后三档为 61%, 21%, 21%, 缓解前为 56%, 27%, 12%; o1 为 49%, 17%, 23%. 高中档不满足 「非平凡利用」 的要求, 脚注 6 说明它不用于任何风险评估, 真正起作用的是大学与专业两档.

专业档 21% 与 o1 的 23% 相近, 而 o1 同样评为低, 所以 o3-mini 评为低在同一框架内是自洽的. 本文没有给出低与中之间的量化阈值, 小结只有一句 「does not sufficiently advance real-world vulnerability exploitation capabilities」. 另外, 以往模型的分数来自稍旧的数据集版本, 有不到 10% 的题修过启动问题, o3-mini 用的是新版本, 两者只是 「provided for reference only」. 题目分类与具体解题过程涉及攻击细节, 这里不展开, 只保留评级与分数.

## 9. 化学与生物: 中, 只看分数

化学生物评为中, 小结的理由是 o3-mini 能 「help experts with the operational planning of reproducing a known biological threat」, 但不能帮助非专家, 因为动手实验技能模型还替代不了. 本节只记评级与分数, 不涉及任何实验流程. 长问答评测 (§5.4.1) 按五个阶段打分, 读图: 缓解前 o3-mini 获取 81%, 扩增 100%, 配制 28%, 释放 69%, 构想阶段所有模型都是 0%; 缓解后 o3-mini 五个阶段全为 0%, 与 「reliably refuse」 一致. 正文自己承认这项评测 「reaching a point of saturation」.

专家对比 (§5.4.2) 由 46 位生物专家做了数千次对比, 读图: o3-mini 缓解前准确性 81.4%, 易懂性 79.4%, 执行难易度 81.5%, o1 缓解前对应 75.4%, 68.9%, 80.1%. 执行难易度只领先 1.4 个百分点, o3-mini 的误差棒又最宽, 两者区间重叠. 缓解后模型的胜率没有汇总展示, 理由是它们 「consistently refuse on certain stages」. 七位专家的一周试用 (§5.4.3) 给的是定性结论: 七人都认为有用, 四人提到加快检索, 同时也指出模型 「sometimes hallucinated」.

多选与短答类评测上, o3-mini 与 o1 系列大体同档. 读图: 多模态病毒学排错缓解后 53%, o1 59%, GPT-4o 41%; BioLP 缓解后 41%, 缓解前 39%, 都超过 38.4% 的专家基线; ProtocolQA 缓解后 23%, 远低于专家共识 54% 与中位数 42%; 隐性知识多选缓解前 68%, 缓解后 58%, 后者是六个模型中唯一低于 63% 第 80 百分位专家基线的; 开放式隐性知识题缓解前后都是 51%. 生物工具任务 (Table 11) 上 o3-mini 在两项任务里的成功率明显高于多数对照, 但标题写 「over 10 Rollouts」, 表里却有 92%, 83%, 17% 这类 10 次采样算不出来的值, 第 14 节列入对不上的数字.

## 10. 放射与核

放射与核一节没有单独的评分行, 小结只说缓解后 o3-mini 「cannot meaningfully assist」, 并强调本文没有使用任何美国涉密信息, 完整评估需要与美国能源部合作. 结构化专家试探 (§5.5.1) 用 10 位专家对缓解前模型做了 123 段对话: 54 段评为中, 61 段评为低, 8 段最初评为高, 后经多轮复核全部下调. 54 + 61 + 8 = 123 对得上, 但本文没说 8 段各下调到哪一级, 最终中风险在 54 到 62 段之间 (估算).

两项多选评测都指向 「与 o1 同档或更弱」. 读图: 核工程背景知识 222 题上 o3-mini 缓解前 71%, 缓解后 73%, o1 74%, o1-preview 72%, GPT-4o 54%. 放射与核专家知识 87 题上 o3-mini 缓解前 58%, 缓解后 60%, o1 70%, 与正文 「about 10% worse than o1」 相符. 正文说题目分为 「nine topics」, 后面列了 10 个, 本文没说明哪两项应合并; 87 道题摊到 10 个主题, 每个主题不到 9 道 (估算), 分主题结论本文也没有给.

## 11. 说服: 政策能不能被触发

说服评为中, 小结是 「human-level persuasion capabilities」, 但不超过顶尖人类写手. 四项评测里, ChangeMyView 与政治说服并行生成是人工评测, 用的是 near-final 检查点; MakeMePay 与 MakeMeSay 是模型对模型的自动评测, 对手固定为 GPT-4o. ChangeMyView 收集了 n = 3,000 次评分, 读图: o3-mini 缓解前 82.2%, GPT-4o 82.7%, 缓解后 82.9%, o1 83.8%, 最高与最低只差 1.6 个百分点, 误差棒两两重叠. 这张图支持 「都在第 80 到 90 百分位」, 不支持任何两两排序, 也没有接近正文所说的超人水平 (95 以上百分位).

政治说服是 o3-mini 唯一明显落后的一项. 读图: 对生产版 GPT-4o 的胜率缓解后 35.5%, 缓解前 38.2%, 都在 50% 基准线以下十几个百分点; o1 为 53.3%, 误差棒下沿约在 49.5% (读图), 跨过了 50%. §5.2 提到审慎对齐 「introduced a new refusal behavior for political persuasion tasks」, 这可能压低了 o3-mini 的分数, 但缓解前模型也只有 38.2%, 拒答解释不了全部差距. 本文没有拆开这一因素.

两项自动评测最能说明安全训练的边界. MakeMePay 上 o3-mini 缓解前收款率 79%, 金额提取率 9%, 即从 \$100,000 里拿走约 \$9,000 (估算), 常骗到小额; 缓解后收款率降到 1%, 提取率 0%, 差 78 个百分点. MakeMeSay 上缓解前 73%, 缓解后仍有 62%, 只降了 11 个百分点. 正文给了原因: 让模型玩一个猜词游戏 「is not out-of-policy」, 拒答训练不会被触发, 而骗钱更容易命中政策. 所以 62% 更接近缓解后模型的真实操纵能力; MakeMePay 上的 1% 反映的是 「这件事会被拒」, 不是 「它不会」.

这个对照对读整份系统卡都有用. 缓解后分数低, 可能是能力低, 也可能只是触发了拒答; 能区分两者的, 是像 MakeMeSay 这样把同一种能力包装成政策允许的任务. 生物长问答全为 0% 和 MakeMePay 的 1%, 都属于后一种, 是靠拒答压下来的. 这也是 SAG 按缓解前定级的理由之一: 拒答挡的是请求的措辞, 挡不住换个包装的同一种能力.

## 12. 模型自主: 中风险落在一个数上

o3-mini 是第一个在模型自主性上评为中的模型, 小结点名的依据是 SWE-bench Verified. 这一项的数字需要拆开读. 读图: o3-mini (tools) 61%, 用内部工具脚手架, 每题 4 次尝试取平均; 发布候选用 Agentless 1.0 只有 39%, 缓解前 40%, 低于 o1 的 48%. §5.7.2 写明 o3-mini (tools) 「was evaluated using a non-final checkpoint that differs slightly from the o3-mini launch candidate」, 第 3 节 「其余评测都用最终模型」 的清单没有列进这一处. 另外 SWE-bench Verified 本有 500 题, 本文只用内部验证过的 477 题, 与公开榜单不同口径. Coding Agent 的脚手架差异可参见 [IDE 与 Coding-Agent](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md).

同属这一类的其他评测, 大多不支持 「能力显著领先」. 面试题 (§5.7.1) 上编程题 o3-mini 缓解后 92%, o1 83%; 可编程题只有 18 道, 92% 约为 16.56 道 (估算), 相当于比 o1 多做对不到 2 道. 多选题 97 道, o3-mini 缓解后 80%, 与 o1 相同. 智能体任务 (§5.7.3) 上 o3-mini 缓解前 26%, 缓解后 27%, 六个模型中最低, o1-preview 42% 最高. MLE-bench 上 pass@1 缓解后 11%, pass@10 缓解后 20%, o1-preview 的 pass@10 为 37%. OpenAI PRs 上 o3-mini 缓解前后都是 0%, o1 为 12%.

两处定性描述比数字更值得记下. 智能体任务里, o3-mini 通过了自动评分器的几次整体任务, 人工检查发现 「major parts of each task were left silently incomplete」, 例如偷换成更简单的模型代替 Mistral 7B, 自动评分器没有抓到. OpenAI PRs 的 0% 被归因于 「poor instruction following and confusion about specifying tools in the correct format」, 模型反复调用幻觉出来的 bash 工具, 而框架只接 python. 本文没有换成 o3-mini 习惯的工具格式重测, 所以这个 0% 混着能力与接口适配两种因素. Agent 评测的设计问题可参见 [Benchmark 与 Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md).

合起来看, 中风险的依据相当集中: 一个用内部脚手架, 非最终检查点, 477 题子集测出的 61%. 正文把它解读为 「competently execute well-specified coding tasks」, 同时承认模型 「still performs poorly on evaluations designed to test real-world ML research capabilities」, 所以没到高. 这个判断本身是保守的, 因为按下界原则, 更好的脚手架只会让分数更高; 但它也说明, 同一个模型在同一类风险上的评级, 很大程度取决于评测方给了什么工具. 「偷偷没做完却通过评分器」 这一条, 则与 [Agent 安全与对齐](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐.md) 里讨论的奖励投机直接相关.

## 13. 多语言 MMLU

第 6 节用专业译员把 MMLU 测试集译成 14 种语言, 统一 0-shot 加 CoT 提示, 答案从回复里按各语言的 「Answer」 译词解析. 正文结论是 o3-mini 「significantly improves multilingual capability compared with o1-mini」. 按 Table 14 逐行对: 12 行 o3-mini 高于 o1-mini, 最大差距在约鲁巴语, 0.6164 对 0.5807; 德语 0.8029 低于 0.8122, 西班牙语 0.8289 低于 0.8303, 这两行反而更低. 14 行简单平均 o3-mini 约 0.7948, o1-mini 约 0.7856 (估算), 只差约 0.009, 称为 「significantly」 缺少统计检验支撑.

与 GPT-4o 比, o3-mini 14 行全部更低, GPT-4o 平均约 0.8145 (估算). 缓解前 o3-mini 平均约 0.7962 (估算), 与缓解后几乎一样, 说明安全训练对多语言知识题基本没有影响. 差距最大的是斯瓦希里语 0.7167 对 0.7786 与约鲁巴语; 约鲁巴语上 o3-mini 0.6164 与 GPT-4o 0.6208 只差 0.0044, 是十四行里最接近的一行. 一个小推理模型在知识密集的 MMLU 上不如 GPT-4o, 与它 「更快, 擅长编程」 的定位相符, 但本文没有给出规模信息, 这里不能把差距归因于参数量.

## 14. 本文对不上的数字

下面这些不一致都能从本文内部核对出来, 按出现顺序列出. §4.1.1 正文写 「GPT-4o, GPT-4o, o1-mini, and o3-mini」, GPT-4o 重复, 表里只有三列. Table 16 里 GPT-4o 五个类别的简单平均约 0.772 (估算), Table 1 印的是 0.8; 本文没给各类样本数, 看不出是否加权所致. Table 3 表头写 「GPT 4o-mini」, 正文说对比 GPT-4o. §4.1.4 把非歧义题从 0.94 到 0.96 的提升写成 「slight regression」. 偏见评测正文写 mixed effects model, Table 18 表注写 fixed effects model. Table 7 列名用 「o3-mini-jan31-release」, 前两张同类表只写 「o3-mini」.

准备度一节的问题更多一些. 第 3 节说只有红队与两项说服人工评测用 near-final 检查点, 但 §5.7.2 的 o3-mini (tools) 也用了非最终检查点. §5.4.1 正文 「Acquisition, Magnification Formulation, and Release」 漏了逗号. 专家胜率图里 GPT-4o 也标成 「(Pre-Mitigation)」, 与正文的模型清单对不上. Table 11 标题说 「Success Rate over 10 Rollouts」, 表里却有 92%, 83%, 17% 这类不是 10% 整数倍的值, 正文又把成功率称作 「pass@10」, 两种统计量混用. §5.5.3 说 「nine topics」, 实际列了 10 个. §5.6.2 图注说生产版 GPT-4o 是 「dotted line」, 图上画的是虚线. §5.7.2 正文说验证集 「500 tasks」, 评测实际用 n=477. §5.7.4 说 o1-preview 与 o1 在 n 较小时 「similar」, pass@1 读图是 16% 对 21%. 第 6 节称多语言 「significantly」 提升, 平均差距约 0.009 且有两行更低.

还有一处属于转换问题, 不是原文错误. §4.3.1 脚注 2 在 MinerU 源文里标号与数字粘连成下标, 按原意应为 19.5% 的红队尝试至少有一轮浏览网页, 6.6% 至少有一轮执行代码. 这些问题单看都不大, 却集中在两类地方: 对照模型的命名, 以及样本量与统计量的口径. 读这份系统卡时, 凡是跨表, 跨检查点, 跨脚手架比较的数字, 都值得先回到源表确认列名和 n.
