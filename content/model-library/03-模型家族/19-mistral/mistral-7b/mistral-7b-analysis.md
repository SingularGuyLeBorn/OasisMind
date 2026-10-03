---
title: "Mistral 7B 论文解读"
category: "模型库"
tags: ["Mistral", "技术解析"]
published: true
excerpt: "Mistral 7B 是 Mistral AI 的第一份技术报告, 篇幅很短: 架构一页半, 评测一页半, 指令微调和护栏各一页, 结论一段."
---
# Mistral 7B 论文解读

- 原文: Mistral 7B, arXiv:2310.06825v1, 2023 年 10 月 10 日, 正文 7 页加参考文献 2 页, 共 9 页, 13 张图.
- 作者: Mistral AI 18 人, 第一作者 Albert Q. Jiang.
- 模型: 稠密 decoder-only transformer, 32 层, 隐藏维度 4096, 32 个查询头配 8 个 KV 头 (GQA), 滑动窗口 4096, 上下文 8192, 词表 32000.
- 版本: 基座 Mistral 7B 和指令版 Mistral 7B - Instruct, Apache 2.0 许可.
- 本文印出的核心数字: MMLU 60.1%, GSM8K 52.2% (maj@8), HumanEval 30.5%, MT-Bench 6.84 ± 0.07, Chatbot Arena ELO 1031.
- 双语对照见同目录 mistral-7b-bi.md.

## 1. 这篇论文交代了什么

Mistral 7B 是 Mistral AI 的第一份技术报告, 篇幅很短: 架构一页半, 评测一页半, 指令微调和护栏各一页, 结论一段. 它想证明的事情只有一件, 就是一个 7B 的稠密模型, 在作者自己的评测流水线上, 能全面压过 Llama 2 13B, 并在数学和代码上压过 Llama 1 34B. 为了让这个结论可信, 作者把所有对照模型都用自家流水线重跑了一遍, 而不是抄 Llama 2 论文里的数.

论文没有交代的东西同样多. 训练数据来源, 训练 token 数, 训练用了多少卡和多少时间, 学习率和 batch size, 全都没写. 指令微调只说用了 Hugging Face 上的公开数据集, 没说是哪些, 也没说训练了几轮. 所以读这篇报告, 能核对的主要是两块: 表 1 的架构规格, 以及表 2 到表 4 的评测数字. 结论里提出的 「三维问题」 (模型能力, 训练成本, 推理成本) 在正文里只给了推理一侧的两个相对数, 训练成本一侧是空的.

## 2. 规格表能推出什么

表 1 只有九行, 但能推出不少东西. 32 个查询头乘每头 128 维等于 4096, 和 dim 吻合. 8 个 KV 头意味着每 4 个查询头共享一组 key 和 value, KV 投影的输出维度是 8 × 128 = 1024, 只有查询投影的四分之一. FFN 中间维度 14336 是隐藏维度的 3.5 倍. 论文没写 FFN 用什么结构, 如果按三个矩阵的门控结构算, 每层 FFN 约 1.76 亿参数, 注意力四个投影约 4194 万, 一层合计约 2.18 亿, 32 层约 69.8 亿.

再加上嵌入. 词表 32000 乘 4096 约 1.31 亿, 输入和输出矩阵如果不共享, 总共约 2.62 亿, 模型总参数约 72.4 亿; 共享的话约 71.1 亿. 两种算法都落在 「7-billion-parameter」 的说法之内, 但论文既没说共享与否, 也没有印出精确参数量, 所以 「7B」 这个名字只能理解成量级. 层归一化的参数量级在 26 万左右, 对总数没有影响.

规格表还决定了缓存成本. 按 fp16 存储, 每个 token 每层要存 key 和 value 各 8 × 128 个数, 32 层合计 2 × 32 × 8 × 128 × 2 字节 = 128 KiB. 如果 KV 头和查询头一样是 32 个, 这个数会变成 512 KiB. 引言里说 GQA 「reduces the memory requirement during decoding, allowing for higher batch sizes」, 这个 4 倍就是它在本模型上的具体含义. 论文没有给 GQA 的消融, 所以 「significantly accelerates the inference speed」 这句话没有对应的数字支撑. GQA 本身的机制见本库 [GQA](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/03-GQA-在性能与缓存之间折中/03-GQA-在性能与缓存之间折中.md).

## 3. 滑动窗口: 131K 是上限, 不是实测长度

SWA 的想法很朴素: 每一层只看前面固定长度的窗口, 层数一叠, 顶层就能间接看到很远的位置. 图 1 右边那张示意画的就是这件事, 顶层最右边的 token 经过三次斜向连接, 回溯到了底层靠左的位置. 按正文的说法, 第 k 层能触及的最远距离是 W × k, 窗口 4096, 32 层, 乘出来 131,072, 这就是 「approximately 131K」.

这个数要和表 1 的 context_len = 8192 分开看. 131K 是信息沿层逐级传递的理论上界, 每经过一层, 远处的信息都要被压进窗口内某个位置的隐状态里再往前送, 能保留多少, 论文没有测. 训练时模型见过的长度是 8192, 论文也没有给 8192 以外的任何质量数字. 摘要里 「effectively handle sequences of arbitrary length」 的 「arbitrary」, 在正文里找不到评测支撑, 更准确的说法是: 计算和缓存不随长度增长, 至于长距离信息还剩多少, 本文没有回答.

窗口的边界还有一处前后不一. 图 1 图注说每个 token 「at most W tokens」, 图中 W = 3, 掩码每行恰好 3 个 1, 连自己在内. 正文却写成位置 i - W 到 i, 闭区间是 W + 1 个位置. 图 3 的掩码可以当作裁判: 每个查询 token 都恰好看 4 个位置, 与图 2 的 W = 4 对应. 所以图的约定是 「含自己共 W 个」, 正文的区间写法多了一个. 对 W = 4096 来说差一个位置无关紧要, 但照着正文公式写实现的人会写出和官方掩码不同的边界.

速度方面, 正文只给了一个数: 16K 序列, W = 4096, 改过的 FlashAttention 和 xFormers 比 vanilla attention 快 2 倍. 这个 16K 已经超过了 context_len 的 2 倍, 比较的基线是 vanilla attention 而不是同样用 FlashAttention 的全注意力, 也没有交代硬件, batch 和是否端到端. 所以这个 2 倍更像一个实现层面的示意, 不适合拿去和别的长上下文方法直接比较. 相关背景见本库 [FlashAttention](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md) 和 [稀疏与压缩注意力](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/2.3.2-稀疏与压缩注意力.md).

## 4. 滚动缓存与分块预填充

窗口固定之后, 超出窗口的 key 和 value 再也不会被访问, 缓存就可以做成环形: 大小固定为 W, 第 i 步写到第 i mod W 个位置. 图 2 用 W = 4 演示了三个时间步, 第一行 「This is an」 在第 i+1 步补上 「example」, 第 i+2 步的 「of」 回到第一格覆盖 「This」, 周期正好是 4. 正文在引出图 2 时写的是 「for W = 3」, 和图注的 W = 4 冲突, 应该是沿用了图 1 的取值.

「32k 序列省 8 倍」 就是 32768 除以 4096. 结合第 2 节的每 token 128 KiB, 单条 32k 序列的缓存从约 4 GiB 封顶到约 512 MiB. 这里有一层容易被忽略的前提: 这 8 倍是和同一个 SWA 模型不用环形缓存相比, 因为 SWA 模型本来就不需要窗口外的缓存; 若和全注意力模型比, 质量上并不等价. 正文说 「without impacting the model quality」, 同样没有给评测数字.

分块预填充处理的是另一头: 提示词事先已知, 可以一次性算出整段的 key 和 value, 但太长的提示词一次算完会占太多显存, 于是按窗口大小切块. 图 3 展示第三块 「the dog go to」 的掩码: 对更早的 「The cat sat on」 全是 0, 对缓存里的 「the mat and saw」 按滑窗递减, 对本块用因果下三角. 每块的注意力矩阵是 W × 2W, W = 4096 时约 3355 万个分数, 与提示词总长无关, 这就是分块的意义.

图 3 还有一个细节: 缓存块的第一列 「the」 对第三块所有 token 都是 0. 按 「含自己共 W 个」 的约定, 第三块第一个 token 能看到的最早位置是 「mat」, 所以缓存里最旧的那一格在这一块已经用不上, 下一步就会被覆盖. 这和图 2 的环形覆盖逻辑一致. 推理框架里的预填充和缓存管理见本库 [增量式 Prefill 与 KV-Cache 机制](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.1-推理框架/02-增量式Prefill与KV-Cache机制.md) 和 [KV 缓存与内存优化](../../../../llm-guide/6-训练与推理优化/6.4-KV缓存与内存优化/6.4-KV缓存与内存优化.md).

## 5. 基座评测: 和 Llama 2 13B 逐列比

表 2 有 12 个基准列. 把 Mistral 7B 和 Llama 2 13B 逐列对照, Mistral 7B 赢了 11 列, 只有 NQ 一列输: 28.8% 对 29.0%. 摘要写 「across all evaluated benchmarks」, 表 2 图注写 「on all metrics」, 都被自己表里的这一列推翻了. 差距只有 0.2, 算不上实质落后, 但 「all」 这个词在数字上不成立. 后面图 5 的图注改成 「except on knowledge benchmarks, where it is on par」, 这个说法才和表对得上.

拉开差距最大的是数学和代码. GSM8K 从 34.3% 到 52.2%, MATH 从 6.0% 到 13.1%, HumanEval 从 18.9% 到 30.5%, MBPP 从 35.4% 到 47.5%. MMLU 从 55.6% 到 60.1%, 常识推理几列多在 1 到 7 个点之间. 和 Code-Llama 7B 比, HumanEval 30.5% 对 31.1%, MBPP 47.5% 对 52.5%, 「approaches」 的说法大体成立, 而 Code-Llama 7B 在 MMLU 上只有 36.9%, 非代码能力明显更弱.

评测协议有两处要留意. 一是数学用了多数投票: GSM8K 8-shot 取 maj@8, MATH 4-shot 取 maj@4. 正文说所有模型都用自家流水线重跑, 但没有单独说 Llama 那几列是否也投票, 表里只印一个数, 读者分不出来. 二是正文列出的两处和 Llama 2 论文的差异: MBPP 用人工核验子集, TriviaQA 不给 Wikipedia 上下文. 这两处意味着表 2 的 Llama 数字不能和 Llama 2 论文里的数直接混用.

图 4 的分类柱子可以用表 2 部分复原. Code = (30.5 + 47.5) / 2 = 39.0, Math = (52.2 + 13.1) / 2 = 32.65, Knowledge = (28.8 + 69.9) / 2 = 49.35, 都和柱高吻合, Llama 2 7B 和 13B 的三类也一样能对上. Reasoning 就对不上了: 表 2 里的 5 个常识列平均是 75.0, 柱高只有约 69.2 (读图). 这说明 Reasoning 还包含表里没印的 SIQA, OpenbookQA, CommonsenseQA, 按 8 项平均反推, 这三项的均值约 59.5. Comprehension 的 BoolQ 和 QuAC, 以及 AGI Eval 和 BBH, 表 2 里都没有, 图 4 的这几根柱子无法从表复原.

各类基准的 shot 数也不统一: 常识推理和阅读理解是 0-shot, 世界知识 5-shot, MMLU 5-shot, BBH 3-shot, MBPP 3-shot, HumanEval 0-shot, AGI Eval 写的是 「3-5-shot」, 没说哪些子集用 3, 哪些用 5, 而且只用英文选择题. 这些设置本身没有问题, 但它们决定了表 2 的数字只在本文内部可比. 另外表 2 把 Code-Llama 7B 的 Modality 标成 「Finetuned」, 其余三个是 「Pretrained」, 也就是说表里唯一一个经过额外训练的模型是代码专用模型, 拿它和通用基座比非代码列, 输赢在意料之中.

## 6. 和 Llama 1 34B 比: 图 4 的八类

脚注 4 解释了为什么拿 Llama 1 34B 当对照: Llama 2 34B 没有开源. 但 Llama 1 34B 在表 2 里没有一行, 只在图 4 里以柱子出现, 所以所有和它的比较都只能读图. 按读图估算, Mistral 7B 赢 MMLU (60.1 对约 56.8), AGI Eval (约 43.5 对 35.1), Math (32.6 对约 26.1), Code (39.0 对约 32.9) 四类; Comprehension 两者都在 64.4 左右; Knowledge (49.3 对约 52.6), BBH (约 37.9 对 40.1), Reasoning (约 69.2 对 69.5) 三类输.

四胜一平三负, 正文说 「outperforms Llama 1 34B on most benchmarks」, 说得偏宽. 更要紧的是 「reasoning」. 摘要说在 reasoning 上超过 34B, 图 4 图注说在 reasoning 上 「vastly superior」, 但图 4 自己的 Reasoning 柱子显示 34B 略高. 引言的版本只说 「mathematics and code generation」, 反而是三处说法里唯一和图一致的. 如果把 BBH 也算作推理类, 34B 的领先就更明显.

对 Llama 2 13B, 图 4 图注用了 「significantly outperforms ... on all benchmarks」. 读图看, Knowledge 两者都在 49.3 左右, BBH 约 37.9 对 37.6, 这两类基本持平. 明显拉开的是 MMLU, AGI Eval, Math 和 Code. 所以这句图注的 「significantly」 和 「all」 各有一类不成立. 这些都是措辞问题, 不影响 「7B 追平甚至超过 13B」 这个主结论, 但读者引用时最好以表和柱高为准.

## 7. 等效规模是怎么插出来的

图 5 给了四张折线图: 横轴是 Llama 2 的规模 (7B, 13B, 70B, 刻度上还标了 34B 但没有数据点), 纵轴是 MMLU, Reasoning, Knowledge, Comprehension. Mistral 7B 的分数画一条水平虚线, 和 Llama 2 折线的交点就是 「等效规模」. 印出来的四个数是 MMLU 23B (3.3x), Reasoning 38B (5.4x), Comprehension 21B (3x), Knowledge 13B (1.9x). 除以 7, 分别是 3.29, 5.43, 3.0, 1.86, 与括号里的倍数一致.

论文没说插值方式. 看横轴刻度, 7, 13, 34, 70 之间的间距接近对数. 用对数线性插值算 MMLU: (60.1 - 55.6) / (68.9 - 55.6) ≈ 0.338, 等效规模 13 × (70/13)^0.338 ≈ 23.0B, 和图中的 23B 正好吻合; 用线性插值会得到约 32B. 同样的办法用读图值算 Reasoning, 约 40B, Comprehension 约 22B, 比印出的 38B 和 21B 略大, 差异来自读图误差和 70B 端点取值, 不影响量级.

这个 「等效规模」 有两个隐含前提. 一是 Llama 2 在 13B 到 70B 之间没有数据点, 34B 的位置是插出来的, 能力随规模的真实曲线未必是对数线性. 二是四类分数都是 Mistral 自家流水线的结果, Llama 2 70B 甚至不在表 2 里, 它的分数只能从图 5 读. 正文据此说 Mistral 7B 相当于 「more than 3x」 的 Llama 2, 其中 Comprehension 恰好 3 倍, Reasoning 是 5.4 倍, 一句话把两头都说得不太准. 知识类只有 1.9 倍, 作者的解释是参数量限制了能存的知识, 这个解释合理, 但本文没有实验验证.

还可以换个角度读图 5. 四张图里 Llama 2 从 13B 到 70B 的涨幅差别很大: MMLU 从 55.6 到约 68.9, Knowledge 从 49.3 到约 70.6, 而 Reasoning 只从约 66.2 到 70.7, Comprehension 从约 63.2 到 66.9 (读图). 折线越平, 同样的分差折算出的 「等效规模」 就越大. Reasoning 的 5.4 倍之所以最高, 一部分原因是 Llama 2 在这一类上随规模涨得慢, 并不完全是 Mistral 在这一类上特别强. 等效规模这个指标会放大平坦区间里的小分差, 用它做宣传数字时要把这一点算进去.

## 8. Instruct 模型: MT-Bench, Arena 与 llmboxing

表 3 把 Mistral 7B - Instruct 放进七个对话模型里比. 表按 MT Bench 降序排, Mistral 7B Instruct 以 6.84 ± 0.07 排第二, 只输给 WizardLM 13B v1.2 的 7.2, 高于 Llama 2 13B Chat 的 6.65 和 Vicuna 13B 的 6.57. 「outperforms all 7B models on MT-Bench」 成立: 另两个 7B 是 6.27 和 6.17. 表里只有 Mistral 一行带了标准差, 别的模型的分数是单次还是多次均值, 表注没说.

换成 Chatbot Arena ELO 列, 名次就变了: WizardLM 13B 1047, Vicuna 13B 1041, Mistral 7B Instruct 1031, 它排第三, 在两个 13B 之后, 只比 Llama 2 13B Chat 的 1012 高. Llama 2 7B Chat 的 MT Bench 高于 Vicuna 7B (6.27 对 6.17), ELO 却低 (985 对 997). 两种评测给出的顺序不一致, 这是对话评测常见的情况, 「comparable to 13B - Chat models」 这个措辞留了余地, 算是写得稳妥.

独立人工评测来自 llmboxing.com: 参与者看同一问题下两个匿名回答, 选更喜欢的一个. 截至 2023 年 10 月 6 日, Mistral 7B 被选中 5020 次, Llama 2 13B 被选中 4143 次, 折合约 54.8% 的相对偏好. 论文没说是否有平局选项, 也没给参与人数和题目数. 图 6 的截图展示了一轮对局: 问题是推荐量子物理入门书, Mistral 推荐了 「The Quantum Universe」, Llama 2 13B 推荐了 「The Feynman Lectures on Physics」, 截图上两边的血量分别是 5 和 1, 那是单场对局的界面计分, 和累计次数不是一回事.

指令微调本身写得极简: 用 Hugging Face 上的公开指令数据集, 「No proprietary data or training tricks」, 定位是 「simple and preliminary demonstration」. 这句话的分量在于, 表 3 里 Mistral 7B Instruct 超过的 Llama 2 13B Chat 是经过大规模对齐流程的产品, 而 Mistral 这边只做了一次公开数据的微调. 如果这个对比成立, 它说明的主要是基座的底子; 但因为数据集名称, 条数和训练轮数都没写, 这个结论没法被别人按原样复现, 只能换一套公开数据去验证 「简单微调也够用」 这个方向.

## 9. 护栏与审核

安全部分只记名称和分数. 系统提示词护栏: 175 条不安全提示, 带推荐系统提示词时拒答率 100%. 自我反思内容审核: 精确率 99.4%, 召回率 95.6%, 以可接受提示为正类. 表 5 用 「How to kill a linux process」 演示过度拒答的差别, Mistral 给出 kill 命令, Llama 2 13B - Chat 拒答.

这一节里和效用直接相关的是表 4. 不加系统提示词时 MT Bench 6.84 ± 0.07, 加 Mistral 提示词降到 6.58 ± 0.05, 加 Llama 2 提示词降到 6.38 ± 0.07, 都是 10 次均值. 加了自家提示词后的 6.58, 已经低于表注里 Llama 2 13B - Chat 的 6.65, 而 6.65 是 Llama 2 不带系统提示词的官方分数, 两边条件并不对等. 作者用 「Pareto front」 描述这种取舍, 但表 4 只有三个点, 画不出前沿.

## 10. 放进谱系看

从注意力的来路看, SWA 引了两篇: [6] Sparse Transformer (2019) 和 [3] Longformer (2020). 两篇都是稀疏注意力的前作, 局部窗口的思路早已有之, Mistral 7B 的贡献不在窗口本身, 而在把窗口和环形缓存, 分块预填充这套推理工程绑在一起, 并交给 FlashAttention, xFormers, vLLM 去实现. GQA 引的是 [1] Ainslie 等人 2023 年的论文. 正文 「Compared to Llama, it introduces a few changes」 之后列出的三个小节, 是 SWA, 滚动缓存和分块预填充, 可见作者把自己定位成 「在 Llama 架构上做推理效率改造」.

从人员上看, 参考文献里能读出这支团队的来历. [25] Llama 1 的作者列表中有 Thibaut Lavril, Marie-Anne Lachaux, Timothée Lacroix, 三人都在本文作者名单里; [14] 那篇计算最优训练的论文里有 Arthur Mensch 和 Diego de Las Casas, 两人也在本文作者名单里. 结论里批评 「scaling laws in 2 dimensions」 时引的恰好是 [14], 等于是作者在修正自己参与过的框架: 只看训练成本不够, 推理成本要单独算一维. 这个立场和 Mistral 7B 用小模型换推理效率的做法一脉相承. Scaling law 的背景见本库 [Scaling Law](../../../../llm-guide/3-预训练/3.2-预训练全流程/3.2.6-Scaling-Law/3.2.6-Scaling-Law.md).

从部署生态看, 参考实现, vLLM, SkyPilot, Hugging Face 集成在引言里占了一整段, 致谢里又专门感谢 Tri Dao 和 Daniel Haziza 在很紧的时间里把改动并入 FlashAttention 和 xFormers. 这说明本文的发布方式和技术内容同样重要: Apache 2.0 许可加开箱即用的推理栈, 是它能被广泛拿来微调的前提. 同目录的 Mistral 家族后续还有 Mixtral 8x7B 等模型, 那些是另外的报告, 数字不在本页. vLLM 的缓存管理见本库 [PagedAttention 与 vLLM](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/02-PagedAttention/01-PagedAttention与vLLM.md), 窗口类方法的后续演化见 [StreamingLLM 与 Attention Sink](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md).

## 11. 窗口, 上下文与算力: 几笔账

先算注意力分数的个数. 因果全注意力在长度 n 上要算 n(n+1)/2 个分数, 滑动窗口在 n 大于 W 之后每个位置最多算 W 个. 按 W = 4096 估算: n = 8192 时, 全注意力约 3356 万个, SWA 约 2517 万个, 只省约 1.33 倍; n = 16384 时, 分别约 1.34 亿和 5872 万, 省约 2.29 倍; n = 32768 时, 约 5.37 亿和 1.26 亿, 省约 4.27 倍. 正文在 16K 上报的 「2x speed improvement」 和 2.29 倍的分数比例量级一致, 考虑到 FFN 和投影的开销不随窗口变化, 2 倍更可能只算注意力部分.

这笔账说明一件事: 在表 1 的 context_len = 8192 之内, SWA 对计算的节省很有限, 只有约三分之一. 窗口 4096 正好是上下文的一半, 两层就能覆盖整个 8192, 所以在训练长度内, 窗口带来的信息损失也有限. SWA 真正起作用的区间在 8192 以外, 可那正是论文没有给质量数字的区间. 换句话说, 本文证明了 SWA 在训练长度内基本不伤性能 (表 2 的成绩就是带着 SWA 测的), 但它在更长序列上带来的效率收益和质量代价, 本文只证明了前一半.

再算权重和缓存的比例. 按第 2 节约 72.4 亿参数估算, fp16 权重约 13.5 GiB. 单条序列的 KV cache 在窗口封顶后是 512 MiB, 在 8192 长度上 (还没触发环形覆盖) 是 1 GiB. 也就是说, 约 27 条满窗口序列的缓存就和权重一样大. 如果没有 GQA, 每 token 缓存变成 4 倍, 这个数会降到 7 条左右; 如果没有滚动缓存, 32k 序列每条要 4 GiB, 3 条多就和权重一样大. GQA 省的是每个 token 的宽度, 滚动缓存省的是 token 的个数, 两者在缓存上是相乘关系, 这是本文架构部分最实在的收益.

最后看基座能力涨在哪里. 从 Llama 2 7B 到 Mistral 7B, 同样 7B 级别, MMLU 涨 15.7 个点, GSM8K 涨 36.2 个点, HumanEval 涨 18.9 个点, MBPP 涨 21.4 个点, MATH 涨 9.2 个点. 相对 Llama 2 13B, GSM8K 是它的约 1.52 倍, MATH 约 2.18 倍, HumanEval 约 1.61 倍. 架构上的三处改动都针对推理效率, 很难解释这么大的能力差距, 更可能的来源是训练数据和训练量, 而这两样本文恰好都没写. 所以 「精心设计的模型」 这个说法里, 真正决定成绩的那部分设计, 读者从本文是看不到的.

## 12. 本页对不上的数字

下面是全文核对中发现的前后不一致, 都只用本页印出的数:

- 正文说图 2 画的是 W = 3, 图 2 图注和图中都是 W = 4.
- 正文把窗口写成位置 i - W 到 i (W + 1 个), 图 1 和图 3 的掩码都是含自己共 W 个.
- 摘要和表 2 图注说全面超过 Llama 2 13B, 表 2 的 NQ 是 28.8% 对 29.0%.
- 摘要和图 4 图注说 reasoning 上超过或远超 Llama 1 34B, 图 4 的 Reasoning 柱约 69.2 对 69.5 (读图).
- 图 4 图注说在所有基准上明显超过 Llama 2 13B, Knowledge 和 BBH 两类读图基本持平.
- 正文说推理, 理解, MMLU 上相当于 「more than 3x」, 图 5 印的是 5.4x, 3x, 3.3x.
- 正文 SWA 理论跨度 131K, 速度测在 16K 序列上, 表 1 的 context_len 是 8192.
- 图 4 的 Reasoning 柱约 69.2 无法由表 2 的 5 个常识列 (均值 75.0) 复原, 缺 SIQA, OpenbookQA, CommonsenseQA.

这些不一致大多是措辞比数据说得满, 只有 W = 3 和 W = 4 的冲突, 以及窗口区间差一个位置这两处, 会影响照着正文复现实现的人. 主结论, 也就是 7B 在作者的流水线上基本追平并多数超过 Llama 2 13B, 数学和代码大幅领先, 仍然由表 2 支撑.

还有一类不是矛盾, 而是缺口: 训练数据, 训练 token 数和算力, 指令数据的具体来源, GQA 和 SWA 的消融, 131K 跨度下的长距离质量, 这些本文都没有给. 读者如果要在 「三维」 框架下比较 Mistral 7B 和别的模型, 本页只提供了模型能力这一维和推理成本的两个相对数. 训练成本这一维需要到别的材料里去找, 而一旦引入别处的数字, 就要重新确认它和本文的评测流水线是否一致, 不能直接拼进上面的表格里比较.
