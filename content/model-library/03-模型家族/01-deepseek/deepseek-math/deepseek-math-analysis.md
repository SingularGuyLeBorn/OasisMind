---
title: "DeepSeekMath: 从网页里挖数学语料, 再用 GRPO 把答题分布拧稳"
category: "模型库"
tags: ["DeepSeek", "技术解析"]
published: true
excerpt: "DeepSeekMath 常被记成「GRPO 的出处」, 但按投入和收益看, 这篇报告的主体是数据."
---
# DeepSeekMath: 从网页里挖数学语料, 再用 GRPO 把答题分布拧稳

来源: [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300) (arXiv: 2402.03300v3, 2024-04-27). 仓库: https://github.com/deepseek-ai/DeepSeek-Math

对照译稿: `deepseek-math-bi.md`. 表内数字与公式编号回源文 `deepseek-math.md`.

DeepSeekMath 常被记成「GRPO 的出处」, 但按投入和收益看, 这篇报告的主体是数据. 一个 7B 模型在竞赛级 MATH 上压过 Minerva 540B, 靠的是从 Common Crawl 里迭代召回的约 120B 数学 token, 加上从代码模型出发的初始化; SFT 和 RL 是在这个底座上再加两截. GRPO 在报告里只占一节, 设计动机也很朴素: 省掉 PPO 的 critic. 它后来成为 V2, V3, R1 共同的 RL 算法, 这是谱系上的意外收获. 下面按「数据怎么来, 底座怎么选, 后训练改变了什么」来读, 算法放在它实际所处的位置上.

## 1. 问题与语料

### 1.1. 问题设定: 7B 能不能靠数据追上 540B

2024 年初的格局是: 闭源的 GPT-4, Gemini Ultra 在 MATH 上约 53%, 开源最好的数学模型(Llemma, WizardMath, MetaMath 一类)停在 20% 到 30% 多. 此前的主流做法是在大底座上继续训数学文本, 数学文本主要来自 arXiv 和证明仓库, 比如 Minerva 在 540B 的 PaLM 上续训, Llemma 在 Proof-Pile-2 上续训. DeepSeek 的问题是反过来的: 不加参数, 只改数据, 7B 能走多远.

整体路径分三段. 预训练: 从 **DeepSeek-Coder-Base-v1.5 7B** 出发续训 500B token, 主料是新挖的 DeepSeekMath Corpus. SFT: 776K 条数学指令, 覆盖 CoT, program-of-thought 和工具集成三种解法. RL: 用 **GRPO** 只在 GSM8K 和 MATH 的 CoT 题上训. 最终 DeepSeekMath-RL 7B 在不用工具, 不投票的设定下 MATH 51.7%, 64 条样本 self-consistency 到 60.9%. 分数的来源可以大致拆开: Base 已经到 MATH 36.2%, SFT 推到 46.8%, RL 再加 4.9 个点. 三段里数据和 SFT 贡献了大头, 这是读后文时需要记住的比例感.

### 1.2. 语料流水: fastText 召回, 按域补种子, 四轮收敛

数据流水的思路是「用分类器在全网召回, 用人工标注补盲区」. 第一轮以 OpenWebMath 为种子: 抽 50 万正例, 再从 Common Crawl 抽 50 万负例, 训一个 **fastText** 分类器(向量维 256, 学习率 0.1, 词 n-gram 最长 3, 最小词频 3, 训 3 epoch). Common Crawl 先做 URL 去重和近似去重, 剩约 400 亿个 HTML 页, 分类器给每页打分, 按分数排序截断. 保留多少不靠拍脑袋: 他们在 top 40B, 80B, 120B, 160B token 上分别做预训练实验, 首轮只留 top 40B.

分类器召回的弱点是只认得像种子的东西. 种子多样性不够, 很多数学页就召不回来. 补救办法是按 base URL 把 Common Crawl 切成互不相交的域, 某个域里已收集页的占比超过 10%, 就把整个域标成数学相关(报告的例子是 mathoverflow.net), 再人工标出域内哪些 URL 路径是数学内容(比如 `/questions`), 把还没收进来的对应页面并进种子, 重训分类器. 人工只标「域和路径」这一层, 不逐页标注, 人工投入被分类器放大到整个 Common Crawl. 四轮之后得到约 **3550 万**页, 120B token; 第四轮收集的数据约 98% 在第三轮已经出现, 于是停止.

选 fastText 当分类器, 是由规模决定的. 要给约 400 亿个页面逐一打分, 分类器每页的成本必须极低, fastText 是基于词 n-gram 的线性模型, CPU 上就能跑完全量. 代价是它只看词面特征, 分不清「讲数学」和「提到数学」, 所以需要排序截断加预训练摸底来控制质量, 而不是只看分类器分数. 后来社区的网页过滤流水多改成「大模型打标, 小分类器推理」的两级结构, 思路一致, 只是打标那一级换成了更聪明的模型.

去污染按 Coder 报告的规则: 与 GSM8K, MATH, CMATH, AGIEval 等评测集有完全相同 10-gram 的文本剔除; 测试文本短于 10-gram 但至少 3-gram 的, 用精确匹配过滤. 这套流水社区常拿来和 OpenWebMath, FineWeb-Edu 一类「分类器过滤网页」的做法放在一起讨论. 区别在于 DeepSeek 多了**按域回补**这一步, 专门对付分类器召回偏窄的问题. 报告自己也说同样的流水能套到代码等其他领域. 分类器阈值, 每轮具体召回多少页, 人工标了多少个域, 报告没有给.

### 1.3. 语料质量怎么证明: 1.3B 上的对照实验

有了语料, 还要证明它比现有数学语料好, 而不只是大. 验证用 DeepSeek-LLM 1.3B, 在每份语料上各训 150B token, 用 few-shot CoT 测八个中英基准. 对照组是 MathPile(8.9B token, 超过 85% 来自 arXiv), OpenWebMath(13.6B), Proof-Pile-2(51.9B, 按 arXiv:Web:Code = 2:4:1 混). 训练超参对齐 DeepSeek LLM: 峰值学习率 5.3e-4, batch 4M token, 上下文 4K, 这样语料差异不会和优化差异混在一起. 结果(Table 1): DeepSeekMath Corpus 在 GSM8K 23.8%, MATH 13.6%, SAT 56.3%, CMATH 41.5% 等项全面领先.

两个细节比最终分数更有说服力. 一是 Figure 3 的学习曲线: 训到约 50B token, 也就是 Proof-Pile-2 刚好过一轮时, DeepSeekMath Corpus 的曲线已经在上方, 说明优势来自平均质量, 不全是规模(读图). 规模也有作用: 小语料很快多轮重复, 曲线走平, 120B 级语料的曲线更陡, 涨得更久. 二是中文: 已有数学语料以英文为主, 在中文基准上提升有限甚至倒退; DeepSeekMath Corpus 中英都有, 两边一起涨. 这和 DeepSeek LLM 的双语路线一脉相承, 也解释了后面 CMATH, 高考题上的大幅领先. 需要注意, 1.3B 实验只用来比较语料排序, 绝对分数不能外推到 7B.

Table 1 还有一行容易被忽略的基线: 不做数学训练的 1.3B, GSM8K 2.9%, CMATH 12.3%, 高考选择 17.9%. MathPile 训完, CMATH 掉到 1.2%, 高考选择掉到 2.8%, 比不训还差, 这就是正文说的「已有语料可能伤害中文数学」. 这组对照还混着一个变量: 每份语料都训 150B token, MathPile 8.9B 要重复约 17 轮, OpenWebMath 约 11 轮, Proof-Pile-2 约 3 轮, DeepSeekMath Corpus 约 1.25 轮. 小语料的分数一部分输在反复重复上, 报告用 Figure 3 在 50B token 处的对比部分回应了这一点, 那时 Proof-Pile-2 刚好一轮, 但 MathPile 和 OpenWebMath 已经重复多轮, 严格的等轮次对照本页没有.

### 1.4. 为什么从代码模型出发, 以及 arXiv 为什么不灵

Base 模型不从 DeepSeek LLM 7B 出发, 而从 **DeepSeek-Coder-Base-v1.5 7B** 出发, 这个选择在讨论节有消融支撑. 在 1.3B 上比较两阶段训练(Table 6, Table 7): 「代码 400B 再数学 150B」相对「通用 400B 再数学 150B」, 不用工具的 GSM8K, MATH, CMATH 和用 Python 的 GSM8K, MATH 都更好. 只训代码的第一阶段, 就已经把 GSM8K+Python 从接近零抬到 12.4%, MATH+Python 到 10.0%. 把 400B 代码和 150B 数学一次混训, 能保住代码能力(HumanEval 29.3%, MBPP 39.4%), 两阶段则会把代码能力冲掉, 但混训的无工具数学略逊于先代码后数学. 报告猜测是 1.3B 容量有限, 同时吃不下两种数据.

这组消融直接决定了 500B 续训的配比: DeepSeekMath Corpus 56%, AlgebraicStack 4%, arXiv 10%, GitHub 代码 20%, 中英 Common Crawl 自然语言 10%. 代码占两成, 就是为了不让代码能力在数学续训中流失. 训练超参沿用 DeepSeek LLM 的 multi-step 调度, 峰值学习率改成 4.2e-4, batch 10M token, 上下文 4K. 用来初始化的是 Coder 学习率衰减之前的 checkpoint. 「代码能不能提升推理」在社区里争论了很久, 这张表至少在数学域给了一个部分肯定的回答, 而且区分了用工具和不用工具两种情况.

读这些消融要留意两个边界. 第一, 讨论节的预训练实验用的是第二轮收集得到的 89B token 版本, 不是最终的 120B 版本, 结论建立在一个中间版本的语料上. 第二, 代码先验的证据全部来自 1.3B, 7B 主实验直接采用了这个结论, 并没有在 7B 上重做「从通用模型出发」的对照. 从 Coder 出发在 7B 上是否同样更好, 本页没有直接证据, 只能说 1.3B 的结果和 7B 的最终成绩方向一致. 这类「小模型消融, 大模型沿用」的做法在家族后续报告里很常见, V3 的 MTP 和负载均衡消融也是先在小档上做.

arXiv 的消融方向相反(Table 8, Table 9). MathPile 和 ArXiv-RedPajama 分别在 1.3B(各 150B token)和 Coder-v1.5 7B(各 40B token)上单独训练, GSM8K, MATH, OCW, SAT, MMLU-STEM, CMATH, 高考题几乎没有提升, 部分变差; miniF2F 上的非形式到形式证明也下降. 报告列了三条没测的边界: 对定理非形式化这类任务的影响, 和其他数据混合时的效果, 更大模型上是否会显现收益. 主配比仍保留 10% arXiv, 可以看作习惯和保险, 不能反过来当作 arXiv 有效的证据. 这组结果在当时有点反直觉, 因为 Minerva, Llemma 都把 arXiv 当主料, 社区后来讨论这篇时, 「网页数学胜过论文」是被引用最多的结论之一.

## 2. Base 与 SFT

### 2.1. Base 7B 的成绩, 以及它说明了什么

不用工具的逐步推理(Table 2): DeepSeekMath-Base 7B 在 GSM8K 64.2%, MATH 36.2%, OCW 15.4%, SAT 84.4%, MMLU-STEM 56.5%, CMATH 71.7%, 高考数学填空 20.3%, 选择 35.3%. 八项都高于同期开源 base, 包括通用的 Mistral 7B 和在 Proof-Pile-2 上训过的 Llemma 7B, 34B; MATH 上相对开源 base 领先 10 个点以上, 也超过了约大 77 倍的 Minerva 540B. 用 Python 解题(Table 3): GSM8K 66.9%, MATH 31.4%. 形式数学用 informal-to-formal 流程, 先 few-shot 生成 Isabelle 证明草稿, 再交给 Sledgehammer 补全, miniF2F 验证集和测试集分别为 25.8% 和 24.6%.

和 Minerva 的对比要看清口径. Table 2 里 Minerva 的数字引自原论文, 不是 DeepSeek 自己跑的: Minerva 540B 的 GSM8K 58.8%, MATH 33.6%, OCW 17.6%, MMLU-STEM 63.9%. DeepSeekMath-Base 在 GSM8K 和 MATH 上更高, OCW 和 MMLU-STEM 上仍低于 540B. 所以「7B 超过 540B」成立的范围是竞赛级和小学应用题这两项, 在大学课程题和多学科选择题上还没追上. 评测全部用 few-shot CoT, 八个基准覆盖从小学应用题到大学水平, 既有自由作答(GSM8K, MATH, CMATH)也有选择题(MMLU-STEM, 高考 MathQA). 形式证明那一项则是给定非形式陈述, 形式陈述和非形式证明, 让模型写 Isabelle 证明草稿, 缺的细节交给 Sledgehammer, 考的是「把人写的证明翻成机器能查的证明」.

Table 3 的两组对照各有口径. 工具解题用 few-shot program-of-thought: 模型写一段能调用 `math` 和 `sympy` 的 Python 程序, 以执行结果作答. DeepSeekMath-Base 7B 的 66.9% 和 31.4% 高于 Llemma 34B(64.6%, 26.3%)和 CodeLlama 34B(52.7%, 23.5%), 同尺寸的 CodeLlama 7B 只有 27.1% 和 17.2%, 说明光有代码能力不够, 还得有数学语料. 形式证明那一栏各模型差距很小, 最好的 Llemma 只有 21% 到 22%, DeepSeekMath 多了 3 到 4 个点; Sledgehammer 补细节这一步对所有模型一视同仁, 把差距压扁了. 训练预算可以粗算: 500B token, batch 10M token, 约 5 万步; 报告没给 GPU 小时, 这一面本页没有.

通用能力是否被数学续训挤掉, 看 Table 4. 比较的基准是用来初始化的那个衰减前 checkpoint(MMLU 42.9%, BBH 42.9%, HumanEval 40.2%, MBPP 52.6%). Math-Base 的 MMLU 和 BBH 升到 54.9% 和 59.5%, HumanEval 40.9%, MBPP 52.6%, 代码能力基本保住; 但和训完整的 Coder-Base-v1.5(HumanEval 43.2%, MBPP 60.4%)比还是低一些, MMLU 也仍低于 Mistral 7B 的 62.4%. 这组对照把「专用模型必然偏科」这个担心压了下去, 数学训练甚至抬高了语言理解和推理, 至少在 7B 规模和这套配比上成立. 更重要的是它说明了一件事: 在当时的设定下, 数学能力的上限主要由预训练数据决定, 参数量排在后面. 这个判断后来在 Prover 系列上继续使用, Prover 和 Prover-V1.5 都以 DeepSeekMath-Base 为起点.

### 2.2. SFT: 同一道题给三种写法

指令数据 776K 条. 英文部分给 GSM8K 和 MATH 标注工具集成解法, 并收入 MathInstruct 子集和 Lila-OOD 训练集中用 CoT 或 PoT 解的题, 覆盖代数, 概率, 数论, 微积分, 几何. 中文部分是 K-12 数学, 横跨 76 个子主题, 同一道题同时标 CoT 和工具集成两种格式. 训练设定很朴素: 样本拼接到 4K token, 500 step, batch 256, 学习率恒定 5e-5. 这里没有新方法, 价值在于同一道题允许走多条解题通道: 写步骤, 写程序, 或者在自然语言和工具之间切换. SFT 的总量不大: 500 步 × 256 条 × 4K token, 约 5.2 亿 token; 776K 条样本如果都过一遍, 平均每条约 670 token, 报告没给 epoch 数. 和 500B 的续训相比, SFT 只占千分之一, 却贡献了 10 个点的 MATH, 这和 DeepSeek LLM 里「SFT 教格式和解法通道, 知识在预训练里」的判断一致.

Table 5 要分两栏读, 灰格是 32 候选多数票, 其余是 Top1. 不用工具时, DeepSeekMath-Instruct 7B 在 GSM8K 82.9%, MATH 46.8%, MGSM-zh 73.2%, CMATH 84.6%, 高于 Qwen 72B, MetaMath 70B, DeepSeek-LLM-Chat 67B, 以及做过过程监督 PPO 的 Math-Shepherd-Mistral 7B(MATH 33.0%). MATH 仍低于 GPT-4 的 52.9% 和 Gemini Ultra 的 53.2%. 允许用工具时 Instruct 的 MATH 到 57.4%, 超过所有开源对照, 离 GPT-4 Code Interpreter 的 69.7% 还有距离. 从 Base 的 36.2% 到 Instruct 的 46.8%, SFT 一步就涨了 10 个点, 比后面 RL 的增量大一倍.

放回家族里看更清楚. 一个月前的 DeepSeek LLM 67B Chat 在附录里用工具集成推理拿到 MATH 51.1%, 纯 CoT 是 32.6%. 现在 7B 的 Instruct 纯 CoT 就到 46.8%, 用工具到 57.4%, 参数小了近十倍, 两种设定都更高. 67B 的 SFT 数据里数学占近一半, 但预训练阶段没有专门的数学语料; 7B 这边预训练吃了 120B 数学 token, SFT 同时教三种解法. 两边的差距几乎全部可以归到预训练数据上, 这正是 DeepSeek LLM 报告里「要全面提升数学, 得在预训练阶段加数据」那句话的兑现.

## 3. GRPO 与 RL

### 3.1. GRPO: 用同题多答的均值替掉 critic

PPO 在 LLM 上的负担主要来自 critic. 价值网络和策略差不多大, 显存和算力翻倍; 而奖励通常只打在最后一个 token 上, 要训出一个每个 token 都准的价值函数也不容易. **GRPO** 的做法是对同一道题 $q$ 从旧策略采一组输出 $\{o_1,\ldots,o_G\}$, 用组内奖励的均值当基线, 不再学价值函数(式 3, Figure 4):

$$
\mathcal{J}_{\mathrm{GRPO}}(\theta)=\mathbb{E}\,\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}\left\{\min\left[\rho_{i,t}\hat A_{i,t},\ \mathrm{clip}(\rho_{i,t},1-\varepsilon,1+\varepsilon)\hat A_{i,t}\right]-\beta\,\mathbb{D}_{KL}[\pi_\theta\|\pi_{ref}]\right\},\qquad \rho_{i,t}=\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}\mid q,o_{i,<t})}.
$$

和 PPO 的式 1 逐项比: 裁剪项的形状一样, 都是逐 token 的概率比; 差别在 $\hat A_{i,t}$ 从哪来, 以及 KL 放在哪. PPO 的优势由 GAE 从价值网络算出, 每个 token 的奖励是 $r_t=r_\varphi(q,o_{\le t})-\beta\log\frac{\pi_\theta(o_t\mid q,o_{<t})}{\pi_{ref}(o_t\mid q,o_{<t})}$(式 2), KL 被扣进奖励, 再经 GAE 传到前面的 token. GRPO 把 KL 从奖励里拿出来, 作为独立的一项直接加进损失, 用 Schulman 的无偏估计 $\frac{\pi_{ref}}{\pi_\theta}-\log\frac{\pi_{ref}}{\pi_\theta}-1$ 保证非负(式 4). 外层先按 $1/|o_i|$ 在每条输出内平均, 再按 $1/G$ 在组内平均. 报告给的另一个理由是结构上的: 奖励模型本来就是在同题多答的比较数据上训的, 组内相对优势正好和它的比较性质对上. GRPO 与 PPO 的完整对照见 [02-GRPO](../../../../LargeLanguageModelGuide/4-后训练/4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) 和 [04-PPO](../../../../LargeLanguageModelGuide/4-后训练/4.4-强化学习基础/04-PPO/04-PPO.md).

优势有两种定义. **结果监督**: 奖励模型给整条输出一个分, 组内减均值再除以标准差, 这个值广播到该输出的所有 token, $\hat A_{i,t}=\tilde r_i=\frac{r_i-\mathrm{mean}(\mathbf r)}{\mathrm{std}(\mathbf r)}$. **过程监督**: 过程奖励模型在每一步结尾打分, 第 $i$ 条输出第 $j$ 步结尾的 token 位置记作 $\mathrm{index}(j)$, 奖励 $r_i^{\mathrm{index}(j)}$; 归一化在整组所有输出的所有步上一起做,

$$
\tilde r_i^{\mathrm{index}(j)}=\frac{r_i^{\mathrm{index}(j)}-\mathrm{mean}(\mathbf R)}{\mathrm{std}(\mathbf R)},\qquad \hat A_{i,t}=\sum_{\mathrm{index}(j)\ge t}\tilde r_i^{\mathrm{index}(j)},
$$

即 token $t$ 的优势等于它之后(含所在步)所有步的归一化奖励之和. 落到同一条答错的输出上看两者的差别: 结果监督下, 前面推对的步骤和后面推错的步骤里, 每个 token 拿到同一个负优势; 过程监督下, 推对的步骤奖励高于组均值, 贡献正值, 推错的步骤贡献负值, 同一条输出里不同位置的 token 优势不再相同. 出错步之前的 token 既累加自己那几步的正值, 也累加出错那步的负值; 出错步之后的 token 只累加之后各步. 所以前半段推对的 token 受罚更轻, 甚至可能为正. 迭代版(算法 1)处理的是「策略变强后, 旧奖励模型不够用」: 用策略采样的新结果给奖励模型造训练集, 混 10% 历史数据回放继续训奖励模型, 再把参考模型换成当前策略. 需要强调, 这里的奖励来自神经网络奖励模型, 训练集按 Math-Shepherd 的方法构造, 初始奖励模型从 DeepSeekMath-Base 7B 训出, 学习率 2e-5. 这和一年后 R1-Zero 改用规则奖励, 明确拒绝神经奖励模型, 是两条不同的路.

附录 A.1.6 把 GRPO 的梯度系数写了出来(式 21): $\hat A_{i,t}+\beta\left(\frac{\pi_{ref}}{\pi_\theta}-1\right)$. 第二项就是 KL 约束的作用方式: 某个 token 在当前策略下的概率高于参考模型时, 这一项为负, 把它往回拉; 低于参考模型时为正, 往上推. 和 PPO 把 KL 扣进每个 token 的奖励(式 2)再经 GAE 传播相比, 这种写法让 KL 只作用于当前 token, 不会混进优势估计. 过程监督的优势则有一个副作用: token 的优势等于其后所有步骤归一化奖励之和, 而归一化是在整组所有步骤上做的, 步骤越多的回答, 靠前 token 的优势绝对值越大. 报告没有讨论这一点, 因为 1024 token 上限下步骤数差别有限. 算法 1 里每批样本还可以做 $\mu$ 次 GRPO 内循环更新, 主实验取的是 1 次.

主实验的超参: 策略学习率 1e-6, KL 系数 0.04, 每题采 64 条, 最长 1024 token, batch 1024, 每轮探索后策略只更新一次. 每轮只更新一次意味着新旧策略几乎相同, clip 基本不起作用, 目标函数退化成带组内基线的策略梯度. 社区后来对 GRPO 的两个归一化提过批评. 一是每条输出按 $1/|o_i|$ 做长度平均, 错误的长回答每个 token 受到的惩罚被摊薄, 被认为和 R1 类训练里回答越来越长有关; 二是除以组内标准差, 会让全对或全错附近的题, 也就是很简单和很难的题, 获得更大权重. Dr. GRPO 把两项都去掉, 后续又有工作指出去掉长度归一化会带来另一种长度偏差, 两者无法同时兼顾. 这些讨论见 [03-DrGRPO-去标准差](../../../../LargeLanguageModelGuide/4-后训练/4.5-GRPO家族与RLVR/02-DrGRPO-去标准差/02-DrGRPO-去标准差.md). DeepSeekMath 原文的回答很短, 1024 token 上限下长度偏差不明显, 这些问题要到长 CoT 时代才暴露.

### 3.2. RL 到底改变了什么: 窄题集, 域外上涨, Maj@K 与 Pass@K

RL 数据故意收窄: 只取 SFT 数据里 GSM8K 和 MATH 相关的 CoT 题, 约 144K 道, 其他 SFT 题全部排除, 目的是看 RL 阶段没见过的基准会不会涨. 结果(Table 5): CoT 下 GSM8K 82.9% 到 88.2%, MATH 46.8% 到 51.7%; 域外的 MGSM-zh 73.2% 到 79.6%, CMATH 84.6% 到 88.8%; 工具集成设定下 MATH 57.4% 到 58.8%. 全部指标都涨, 连没训过的中文和工具设定也涨. 工具集成只涨 1.4 个点, 远小于 CoT 的 4.9 个点, 也符合「只强化了 CoT 通道」的预期.

放到 Table 5 的横向对比里, RL 7B 的 CoT MATH 51.7% 高于同期闭源的 Baichuan-3(49.2%), GLM-4(47.9%), Gemini Pro(32.6%), GPT-3.5(34.1%), 低于 GPT-4(52.9%)和 Gemini Ultra(53.2%); GSM8K 上 88.2% 仍低于 GPT-4 的 92.0% 和 Gemini Ultra 的 94.4%. 工具集成设定下 58.8% 高于 InternLM2-Math 20B 的 54.3%, 离 GPT-4 Code Interpreter 的 69.7% 还差 11 个点. 闭源模型的数字都引自各自报告, 提示和解析方式不统一, 这几行只能看大致位置. 报告把 GSM8K 和 MATH 的 CoT 算作域内, 其他都算域外; 域外的 MGSM-zh 涨 6.4 个点, CMATH 涨 4.2 个点, 幅度和域内相当, 这是「RL 不只是背答案」的主要证据.

讨论节 5.2.2 用 Maj@K 和 Pass@K 解释涨分从哪来(Figure 7, 温度 0.7). Pass@K 看 K 次里是否至少一次对, 近似「会不会」; Maj@K 看多数票是否对, 近似「稳不稳」. **RL 抬高了 Maj@K, Pass@K 几乎不变**. 报告的结论很克制: RL 让正确答案在 TopK 里更容易被采到, 输出分布更稳, 但没有让模型学会原本不会的题. 这个观察比 2025 年那波讨论早了一年多. 2025 年有工作在更大的 K(如 256)上系统比较 RLVR 前后的模型, 发现小 K 时 RL 模型占优, 大 K 时 base 反而更高, 解题覆盖面还会收窄, 结论和 DeepSeekMath 的 Figure 7 一致. 所以读 51.7% 这个数时应当把它理解为「稳定性的提升」, 而不是「能力边界的外推」.

报告对原因有自己的猜测, 落在数据源上. RL 用的题全部来自 SFT 阶段, 采样只用朴素的 nucleus sampling, 模型在熟悉的题上反复练, 很难探索到新解法. 他们给的方向有三个: 换成分布外的题, 用树搜索一类更高级的解码策略去采样, 以及提高推理效率, 因为推理吞吐决定了策略每单位算力能探索多少条路径. 他们还引用了 SFT 模型在推理任务上存在「错位」的观察: SFT 后的模型其实有能力答对, 只是没把正确答案放在最可能的位置, 一系列偏好对齐方法都能改善这一点. 这和 Maj@K 涨, Pass@K 不涨是同一件事的两种说法. 后面家族的走向正好对上这三条: Prover-V1.5 用 MCTS 探索证明路径, V3 以后把推理效率当成 RL 基础设施的核心, R1 用长 CoT 让模型在一次采样内部做搜索.

5.2.1 把 SFT, RFT, DPO, Online RFT, PPO, GRPO 写进同一个梯度形式(式 5, Table 10):

$$
\nabla_\theta\mathcal{J}_{\mathcal{A}}(\theta)=\mathbb{E}_{(q,o)\sim\mathcal{D}}\left(\frac{1}{|o|}\sum_{t=1}^{|o|}GC_{\mathcal{A}}(q,o,t,\pi_{rf})\,\nabla_\theta\log\pi_\theta(o_t\mid q,o_{<t})\right).
$$

期望落在某个数据源采样的 $(q,o)$ 上, 每个 token 的对数概率梯度乘一个梯度系数. 三个变量是数据源, 奖励函数, 算法. SFT 的系数恒为 1, RFT 用对错指示, DPO 用成对偏好的 $\sigma$ 项, PPO 和 GRPO 用奖励算出的优势. 离线方法(RFT, DPO)从冻结的 SFT 模型采样, 在线方法(Online RFT, GRPO)从实时策略采样. 在 Instruct 1.3B 上(Figure 5), Online RFT 前期接近 RFT, 后期拉开; GRPO 又超过 Online RFT, 差别在于它能按奖励分值区分强化力度, 而不是对所有答对的样本一视同仁; GRPO 加过程监督又好于结果监督. 迭代两轮继续涨(Figure 6), 第一轮最明显.

这几张图的规模不一样, 读的时候要分开. Figure 5 的方法对比和 PS 对 OS 的比较都在 Instruct 1.3B 上做, Figure 6 的迭代 RL 在 Instruct 7B 上做. 而 §4.2 描述 DeepSeekMath-RL 7B 的训练时, 只写了奖励模型怎么构造和 GRPO 的超参, 没有写最终发布的模型用的是结果监督还是过程监督, 也没有写是否用了迭代版. 所以「过程监督更好」和「迭代更好」这两条结论, 和 Table 5 里 51.7% 那个模型之间的对应关系, 本页没有给出. Online RFT 前期贴着 RFT, 后期才拉开, 报告的解释也很直接: 刚开始策略和 SFT 模型几乎一样, 在线采样和离线采样差别不大, 训练越久差别越大, 在线的好处才显出来.

### 3.3. 奖励信号能信多少: 规则, 奖励模型, 以及噪声

Table 10 里有一列容易被跳过: 奖励函数. RFT, DPO, Online RFT 用的是规则, 也就是按最终答案对错判分; PPO 和 GRPO 用的是奖励模型, 而奖励模型的训练数据本身也是按规则判出来的. 数学题答案可以自动核对, 规则奖励现成可用, 他们仍给 GRPO 配了神经奖励模型, 理由在梯度系数上: 规则只给对错两档, Online RFT 因此只强化答对的样本, 不惩罚答错的, 而且所有答对的样本强化力度一样; 奖励模型给连续分值, GRPO 可以按分值拉开强化和惩罚的幅度. Figure 5 里 GRPO 超过 Online RFT, 报告就归因于这一点. 过程奖励模型更进一步, 把分值细化到每一步, GRPO+PS 又好于 GRPO+OS.

代价是奖励模型会出错. 5.2.3 直说, 现在所有方法都完全信任奖励信号, 按它去升降 token 概率, 但在复杂任务上奖励不可能总是可靠: 即使是训练有素的标注员精心标注的 PRM800K, 也约有 20% 的标注错误. 他们给了三个方向: 奖励模型要能泛化到分布外题目和高级解码的输出, 否则 RL 只能稳住分布, 推不动能力; 奖励模型要能表达不确定性, 作为弱奖励模型和 weak-to-strong 算法之间的衔接; 要能便宜地造出高质量的过程奖励模型. 后面家族对这个问题给出的答案各不相同: Prover-V1.5 用 Lean 证明器的通过与否当奖励, 这是最严格的规则; R1-Zero 在数学和代码上只用规则, 明确说神经奖励模型在大规模 RL 中容易被 reward hacking; V3 则是规则和模型混用, 模型奖励负责没有标准答案的开放题. DeepSeekMath 站在这条路的起点, 选了表达力更强的模型奖励, 也最早把它的噪声问题写了出来.

## 4. 局限与谱系位置

报告自己承认的短板: 定量推理分数好看, 几何和定理证明仍弱于闭源, 三角形, 椭圆一类题做不好, 作者怀疑预训练和微调的数据选择有偏; 受 7B 规模限制, few-shot 能力不如 GPT-4, GPT-4 能从 few-shot 示例里获益, DeepSeekMath 零样本和 few-shot 表现差不多. 未来工作有两条: 继续改进数据筛选流水, 以及按 5.2.3 探索更有效的 RL, 包括分布外题目, 更好的采样, 抗噪声的算法和更便宜的过程奖励. 这些局限和正文证据对得上: 网页语料擅长小学到竞赛级的定量题, 不擅长图形和形式证明; GRPO 擅长把已有的正确路径采稳, 推不开能力边界.

谱系上, DeepSeekMath 坐在 Coder-v1.5 和后面的推理线之间, 往下分出两条. 数据和底座这条: DeepSeekMath-Base 成为 Prover 和 Prover-V1.5 的起点, 形式证明短板正是 Prover 要补的地方; 「分类器召回网页加按域补种子」的流水也成了后续数学和代码数据的常规做法. 算法这条: GRPO 几个月后就用进了 V2 的对齐阶段, 再到 V3 和 R1. R1-Zero 保留了 GRPO 的组相对基线, 换掉了神经奖励模型, 把回答长度从 1024 放开到上万 token, 于是本篇没暴露的长度偏差问题才浮上来. 从 DeepSeek LLM 结尾那句「RL 能提升复杂推理」到这里, 家族第一次把 RL 做成了可复现的实验, 虽然主要贡献仍在数据上.
