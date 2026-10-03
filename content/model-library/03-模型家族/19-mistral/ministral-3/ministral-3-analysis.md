---
title: "Ministral 3 论文分析: 级联蒸馏, 三个尺寸, 三个变体"
category: "模型库"
tags: ["Mistral", "技术解析"]
published: true
excerpt: "缺的东西也很清楚. 训练数据只有 「text-only and interleaved text with image data」 这类描述, 没有来源, 配比, 语言分布."
---
# Ministral 3 论文分析: 级联蒸馏, 三个尺寸, 三个变体

- 源文: Ministral 3, arXiv:2601.08584v1, 2026 年 1 月 13 日, 署名 Mistral AI. 14 页, 6 张图, 5 张表, 2 段算法伪代码. 正文在第 1 到 10 页, 第 11 页是结论和贡献者, 第 12 到 14 页是参考文献.
- 定位: 面向算力和内存受限场景的稠密语言模型, 三个尺寸 14B, 8B, 3B, 每个尺寸有 Base, Instruct, Reasoning 三个变体, 共 9 个模型, 都带图像理解, Apache 2.0 许可.
- 来历: 全部从 24B 的 Mistral Small 3.1 剪枝加蒸馏得到, 方法叫 Cascade Distillation (级联蒸馏), 顺序是 24B 到 14B 到 8B 到 3B.
- 训练量: 1 到 3 万亿 token, 页面拿来对比的是 Qwen3 的 36 万亿和 Llama3 的 15 万亿.
- 上下文: 表 1 三档都是 256k, 引言说推理版是 128k.
- 视觉: 410M 参数的 ViT, 从 Mistral Small 3.1 Base 拷来并冻结, 每个尺寸新训投影层.
- 逐段对照和 38 条疑惑在同目录的 ministral-3-bi.md, 这里不重复翻译. 从图上目测的数标 「读图」.

| 项 | 14B | 8B | 3B |
| --- | --- | --- | --- |
| 层数 | 40 | 34 | 26 |
| 潜变量维度 | 5120 | 4096 | 3072 |
| Q / KV 头 | 32 / 8 | 32 / 8 | 32 / 8 |
| FFN 维度 | 16384 | 14336 | 9216 |
| 输入输出嵌入共享 | 否 | 否 | 是 |
| 词表 | 131K | 131K | 131K |
| 上下文 (表 1) | 256k | 256k | 256k |
| 视觉编码器 | 410M | 410M | 410M |
| 总参数 | 本页未印; 名字 14B, 语言部分约 14.0B | 本页未印; 名字 8B, 语言部分约 8.5B | 本页未印; 名字 3B, 语言部分约 3.2B |
| 激活参数 | 本页未印 | 本页未印 | 本页未印 |
| 每头维度 | 本页未印 | 本页未印 | 本页未印 |

## 1. 这是什么材料, 缺什么

这是一篇完整的技术报告, 结构齐全: 架构一节, 训练配方一节 (预训练, 指令后训练, 推理后训练), 结果一节, 讨论一节 (teacher 选择, 啰嗦程度, 推理版的 ODPO), 最后是结论. 它和很多发布博文不同, 给出了每个尺寸的层数, 潜变量维度, 头数, FFN 维度, 以及两段可以读懂的伪代码. 论文真正想推的是方法, 也就是级联蒸馏; 9 个模型是这套方法的产物.

缺的东西也很清楚. 训练数据只有 「text-only and interleaved text with image data」 这类描述, 没有来源, 配比, 语言分布. 训练算力, 硬件, 训练时长都没有. 1 到 3 万亿 token 没有拆到尺寸. 超参数只给了几个: 短上下文 16,384, 长上下文 262,144, ODPO 采样温度 0.7, RL 最长生成从 32K 提到 80K; 学习率, batch, 训练步数都没有. 安全和漏洞评测: 本页未印, 14 页里没有任何安全基准的名称或分数. 部署方面, 论文反复说 「compute and memory constrained」, 却没给显存, 延迟或吞吐的数.

## 2. 三个尺寸的规格和参数估算

名字里的 14B, 8B, 3B 是规模标签, 论文没有印出精确的总参数. 表 1 给了层数, 潜变量维度, 头数和 FFN 维度, 缺每头维度. 只能先做一个假设: 每头维度等于潜变量维度除以 32, 三档分别是 160, 128, 96. 在这个假设下按标准 SwiGLU 和 GQA 结构算: 14B 每层注意力约 65.5M, FFN 约 251.7M, 40 层约 12.69B, 两份不共享的嵌入 131,072 × 5120 约 1.34B, 合计约 14.03B. 8B 每层约 218.1M, 34 层约 7.42B, 两份嵌入约 1.07B, 合计约 8.49B. 3B 每层约 108.5M, 26 层约 2.82B, 共享嵌入一份约 0.40B, 合计约 3.22B. 三个数都和名字对得上, 8B 偏大一些.

这个假设不一定成立. 第 4 页的剪枝只有层剪枝, 隐藏维度剪枝, FFN 剪枝, 没有剪注意力头, 三档的头数也完全一样, 所以注意力内部宽度可能是从父模型继承下来的, 三档一样宽. 作为敏感性检查, 如果三档头宽都取 128 (假设值, 不是页面数字), 14B 约 13.5B, 3B 约 3.43B, 8B 不变. 差别在 5% 左右, 不影响量级判断. 激活参数: 三档本页都未印; 论文把它们称为 dense 模型, 没有路由, 也没有提到按 token 选择部分参数. 视觉编码器 410M 三档共用同一份结构, 名字里的数是否包含它, 页面没说; 如果加上, 语言加视觉约 14.4B, 8.9B, 3.6B, 3B 里视觉编码器占约 11%, 比例比大尺寸高得多.

嵌入的比例也值得一看, 因为 3B 共享嵌入的理由就是 「avoid embedding parameters dominating」. 词表按 131,072 算, 3B 的一份嵌入约 0.40B, 占约 12.5%; 如果不共享, 两份约 0.81B, 占约 22%. 8B 两份约 1.07B, 占约 12.6%; 14B 两份约 1.34B, 占约 9.6%. 所以 3B 共享之后, 嵌入占比和 8B 差不多. 词表 131K 对小模型是不小的负担, 3B 省掉的这 0.4B 相当于它 3 到 4 层 Transformer 的参数量. tokenizer 的一般背景见 [分词器与 Tokenizer](../../../../llm-guide/3-预训练/3.3-分词器与Tokenizer/3.3-分词器与Tokenizer.md).

## 3. 谱系: 从 Mistral Small 3.1 往下长出来的一支

谱系上 Ministral 3 的位置很特殊: 它不是从零训练的新模型, 而是 Mistral Small 3.1 (24B) 这棵树剪下来再养大的枝. 父模型给了三样东西: 预训练权重 (剪枝的起点), 蒸馏信号 (所有预训练阶段的 teacher), 视觉编码器 (410M ViT 原样拷来并冻结, 架构引自 Pixtral [Agrawal et al., 2024]). 子模型之间也是父子关系: 8B 从 14B 的短上下文 checkpoint 剪出, 3B 从 8B 的短上下文 checkpoint 剪出. 所以严格说 3B 是 24B 的 「曾孙」, 但它的 teacher 始终是 24B 这位曾祖, 不是直接的父亲 8B. 同家族的 [Mistral Small 3.1 原文](../small-3-1/small-3-1-bi.md) 和 [Pixtral 12B 解读](../pixtral-12b/pixtral-12b-analysis.md) 记的是另外几页的内容, 本稿不从那里搬数; 同目录的 ministral-2024 是另一份材料, 本页没有提到它, 这里也不拿它的参数.

方法上的祖先分三条线. 剪枝这条线来自 Minitron [Sreenivas et al., 2024; Muralidharan et al., 2024] 和 Wanda [Sun et al., 2023]: 用校准数据上的激活统计来决定剪什么, 剪完再用蒸馏补回来. 论文在层重要度上和 Minitron 分了手, 不用逐层删掉看 perplexity 的反事实方法, 改用输入输出激活范数之比. 长上下文这条线是 YaRN [Peng et al., 2023] 加按位置调节 softmax 温度 [Nakanishi, 2025; MetaAI, 2025]. 后训练这条线借了三家: DPO [Rafailov et al., 2023] 的在线版 ODPO [Guo et al., 2024], GRPO [Shao et al., 2024; DeepSeek-AI et al., 2025], 以及 Magistral [Rastogi et al., 2025] 的 RL 数据清洗和 GRPO 配方. 同目录的 [Magistral 原文](../magistral/magistral-bi.md) 就是后者.

teacher 的谱系比模型本身更复杂. 预训练用 Mistral Small 3.1, 指令 SFT 用 Mistral Medium 3 (有一处写 3.1), 3B 推理 SFT 用 Magistral Small 1.2, 图 4 的消融里还出现了 「MS3.1 Instruct 2506」. 也就是说, 一个 3B Reasoning 模型身上叠了至少三个 Mistral 模型的输出分布. 这种 「多 teacher 接力」 是本文的特点, 也是它能用 1 到 3 万亿 token 就做出竞争力的原因之一. 知识蒸馏和剪枝的一般做法可以对照 [知识蒸馏](../../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.3-知识蒸馏/6.3.3-知识蒸馏.md) 和 [剪枝](../../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.2-剪枝/6.3.2-剪枝.md).

## 4. 级联蒸馏: 一份数据, 三次剪枝

算法 1 把流程写得很紧: 对 14B, 8B, 3B 依次做 「剪枝, 短上下文蒸馏, 长上下文蒸馏」, 长上下文蒸馏的产物作为该尺寸的最终模型, 短上下文蒸馏的产物作为下一次剪枝的输入. 这里有个容易漏掉的细节: 长上下文模型是 「叶子」, 不再往下传. 所以三个尺寸各自做了一次 16,384 到 262,144 的扩展, 扩了 16 倍, 而剪枝链上传递的始终是短上下文模型. 这样安排的好处是剪枝时的校准和蒸馏都在短序列上进行, 成本低; 代价是长上下文扩展要跑三遍.

图 2 给了这套流程的 loss 曲线. 横轴 Training Completion 从 0 到 1, 在 0.3 和 0.6 两处标了 Prune: 14B 占 0 到 0.3, 8B 占 0.3 到 0.6, 3B 占 0.6 到 1.0 (读图). 14B 从约 4.5 降到约 1.1, 离 teacher 的约 1.07 只差约 0.03; 8B 剪完跳到约 7, 最后停在约 1.3; 3B 剪完跳到 10 以上, 最后约 1.55 (读图). 剪得越狠, 跳得越高, 最后离 teacher 越远. 3B 分到的进度最多, 可能正是因为它要从最高的 loss 爬回来, 但论文没解释分配依据, 也没说横轴按 token 还是按步数.

「data repetition is avoided」 这句话意味着三个尺寸吃的是同一份数据的前后三段, 每段只用一次. 如果把 1 到 3 万亿 token 理解为整条级联的总量, 那么按图 2 的比例, 3B 自己只训了其中约 40%, 即 0.4 到 1.2 万亿; 前面 60% 的数据只通过继承的权重间接进入 3B. 如果 1 到 3 万亿是每个尺寸各自累计的量, 结论又不一样. 论文把整个过程说成 「父模型带剪枝的持续预训练」, 这个说法支持前一种理解, 但页面没有写死.

和 Qwen3 的 36 万亿相比, 1 到 3 万亿少了 12 到 36 倍; 和 Llama3 的 15 万亿相比少了 5 到 15 倍. 这个对比有一处不对等: Ministral 3 的起点是一个已经训好的 24B 模型, 24B 本身吃了多少 token 本页未印. 所以 「1 到 3 万亿」 是增量成本, 不是这批模型见过的全部数据. 论文说级联蒸馏 「significantly more FLOP efficient」, 也没给出 FLOP 数字, 省了多少只能从 token 数粗看.

## 5. 剪枝三招, 以及伪代码里的缝

三种剪枝各管一个维度. 层剪枝按 「激活范数之比」 给每层打分, 保留分高的层. 隐藏维度剪枝把所有层注意力归一化和 FFN 归一化的输入拼起来做 PCA, 得到一个全网共用的旋转矩阵, 把残差流投到低维. 这一点很关键: 残差流在各层之间是同一个空间, 所以旋转矩阵必须全网统一, 否则层与层之间接不上. FFN 剪枝按 $|\mathrm{SiLU}(W_1 x) \cdot W_3 x|$ 在 batch 和序列上的均值给中间维度打分, 保留分高的维度, $W_1, W_3$ 删列, $W_2$ 删对应的行.

用表 1 可以看每一刀剪了多少. 14B 到 8B: 层数保留 85%, 潜变量维度保留 80%, FFN 保留 87.5%. 8B 到 3B: 层数保留约 76.5%, 潜变量维度保留 75%, FFN 保留约 64.3%. 第二刀在三个维度上都更狠, FFN 砍掉超过三分之一. 这和图 2 里 3B 剪完 loss 跳得最高, 表 3 里 3B 掉分最多是一致的. 24B 到 14B 这一刀, 父模型的规格本页未印, 剪了多少算不出.

伪代码有几处和正文对不上, 读的时候要留意. 正文说层重要度是 「ratio of input to output activation norms」, 代码写的是 `output_norm / input_norm`, 方向相反. `layers_to_keep` 被传给 `remove_layers`, 名字和用途打架. PCA 的 `n_components=n_dims` 里 `n_dims` 没有定义, 函数开头取出的是 `target_dim`. 这些都不影响理解思路, 但如果想照着复现, 至少层重要度的方向要先弄清楚: 按代码, 保留的是输出范数相对输入放大最多的层, 也就是对残差流改动最大的层, 这在直觉上说得通.

剪枝清单里没有注意力头剪枝, 这是个值得注意的空白. 表 1 三档都是 32 个 query 头, 8 个 KV 头, 如果注意力内部宽度也不剪, 那么注意力部分的参数只随潜变量维度线性缩小, FFN 部分却随潜变量维度和 FFN 维度两个方向缩小. 按每头维度等于潜变量维度除以 32 的假设, 注意力约占每层参数的 20.6% (14B), 19.2% (8B), 21.7% (3B), 比例大体稳定; 按注意力宽度继承的假设, 小模型里注意力的比例会明显升高. 页面没有给出答案. GQA 的一般背景见 [GQA: 在性能与缓存之间折中](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/02-MQA与GQA-共享KeyValue头/02-MQA与GQA-共享KeyValue头.md).

## 6. 蒸馏 teacher 的三条发现

第一条是 「更强的 teacher 不一定更好」. 图 3 在 14B 上比较了 Mistral Small 3.1 和 Mistral Medium 3 两个 teacher, 六个基准 MS3.1 都略高. 但差距很小: MMLU Redux 约 0.770 对 0.765, HellaSwag 约 0.773 对 0.768, TriviaQA 约 0.555 对 0.548, MATH 约 0.378 对 0.368, Winogrande 约 0.732 对 0.730, 只有 AGI-EVAL 约 0.568 对 0.543 差得明显一点 (读图). 图上没有误差线, 也没说跑了几次. 论文强调这是 「non FLOP-matched」, 意思是 Medium 3 做 teacher 要花更多算力, 花了更多却没更好, 结论方向是清楚的, 幅度则很有限.

第二条是 「预训练阶段用后训练过的 teacher 更好」. 图 4 在 3B 上比较了 MS3.1 Base 和 MS3.1 Instruct 2506, 这一组差距大得多: MATH (maj@4) 约 0.395 对 0.553, 差约 0.16; MBPP 约 0.565 对 0.592; MMMU 约 0.476 对 0.492; MMLU Redux, HellaSwag, TriviaQA 几乎一样 (读图). 知识类不动, 推理类大涨, 说明 teacher 的输出分布里, 后训练带来的主要是解题的 「格式和步骤」, 而不是新知识. 这一条和表 3 的一个怪现象对得上: teacher 24B Base 的 MATH 只有 55.8, 三个学生都更高. 可惜第 3 页只写 teacher 是 「Mistral Small 3.1」, 最终预训练用的是 Base 还是 Instruct, 页面没有明说.

第三条是 「做过偏好调优的 teacher 更好」, 用在 SFT 阶段. 这一条只有文字: 两个内部版本的 Mistral Medium 3, 偏好调优过的 checkpoint 做 teacher 「always substantially better」, 学生自己做完偏好调优后优势仍在. 没有图, 没有表, 连基准名都没有. 三条发现的证据分量差别很大: 第二条有明显的数, 第一条有数但差距小, 第三条没有数. 贡献清单里把它们并列写成 「independently confirm findings」, 读的时候要打个折扣.

还有一处版本号没统一. 第 5 页说指令 SFT 从 Mistral Medium 3 蒸馏, 第 9 页说后训练从 「more capable Mistral Medium 3.1」 获益, 脚注 3 链接的是 mistral-medium-3-1-25-08, 结论又写 Medium 3. 图 4 图例的 「MS3.1 Instruct 2506」 和引言里的 「Mistral Small 3.2 2506」 共用一个 2506 后缀, 两者是不是同一个模型, 页面也没说. 这些不影响方法本身, 但如果想追溯某个 Ministral 3 checkpoint 到底吸收了哪个 teacher 的分布, 现有文字不够.

## 7. 后训练两条线: Instruct 和 Reasoning

Instruct 线是 SFT 加 ODPO. SFT 用 fp8 量化跑, 损失是 teacher 的 logit 蒸馏, 视觉编码器冻结, 适配层可训练. ODPO 每题从当前策略用温度 0.7 采两条回答, 由成对奖励模型 PWRM 判断哪条更好; 损失在经典 DPO 上改了三处: 用 PWRM 的概率输出代替硬的胜负标签, 调 PWRM 温度校准概率, 用 β 重标定让损失对 β 不那么敏感. 工程上还有两个实用的做法: 采样中出现死循环的回答直接判负, 以及生成时允许执行工具. 论文说在线版对压住无限生成 「particularly important」, 但 Instruct 的 SFT 版, 离线 DPO 版, ODPO 版之间没有给对比数. DPO 在线化的一般思路见 [OAIF: 在线 AI 反馈](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md).

Reasoning 线是 SFT, GRPO, ODPO 三段, 起点是长上下文预训练 checkpoint, 不是 Instruct. 推理 SFT 混合了短 CoT (来自通用 SFT 数据) 和长 CoT (带专用 system prompt 的推理轨迹), 覆盖数学, 编程, 对话, 指令遵循, 多语言, 工具, 视觉推理. 3B 是个例外: 普通 SFT 让它变得脆, 啰嗦, 大量重复和无限生成, 于是改用 Magistral Small 1.2 做 logit 蒸馏. GRPO 分两段: STEM RL 用数学, 代码, 视觉推理题; General RL 由 LLM 评委按原子化评分细则打分, 奖励等于满足的条目比例. 最长生成从 32K 提到 80K, 提了 2.5 倍, 理由是 RL 中截断比例不小. 最后的 ODPO 与 Instruct 相同, 只是先剥掉思考段再交给奖励模型. GRPO 的计算流程见 [GRPO 计算流程全解析](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.2-GRPO计算流程全解析.md).

两条线的共同点是 「蒸馏贯穿始终」: 预训练蒸馏 Mistral Small 3.1, 指令 SFT 蒸馏 Medium 3 或 3.1, 3B 推理 SFT 蒸馏 Magistral Small 1.2. 只有 GRPO 和 ODPO 两段不依赖 teacher 的 logits. 这让整套配方很依赖 Mistral 自家的大模型存货; 换一家没有这些 teacher 的团队, 照着论文做不出同样的结果. 论文用 「inference-time scaling」 形容推理版的目标, 即让模型在推理时花更多 token 换更高的分, 表 5 和图 5 的对比正是在检验这一点.

## 8. Base 评测: 表 2 和表 3 的账

表 2 比较 Base 模型, 对手是 Qwen 3 和 Gemma 3. 14B 对 Qwen 3 14B 两胜三负: TriviaQA 74.9 对 70.3, MATH 67.6 对 62.0 赢; MMLU-Redux 低 1.7, AGIEval 低 1.3, 多语言 MMLU 低 1.2. 对 Gemma 3 12B, 正文说 「significantly better across all benchmarks」, 但 TriviaQA 是 74.9 对 78.8, 输 3.9, 这句说过了. 8B 对 Qwen 3 8B 三胜两负, MMLU-Redux 只差 0.1, AGIEval 差 0.5. 3B 的对手是两个 4B 模型: 对 Qwen 3 4B 两胜三负, MATH 高 19.6 是全表最大的领先; 对 Gemma 3 4B 四胜一负. 总体看, Ministral 3 在 MATH 上一贯领先, 在 AGIEval 和多语言 MMLU 上一贯略输 Qwen 3.

表 3 把三个学生和 teacher 24B 放在一起, 可以算保留率. 通用推理类保得最好: ARC-Challenge 三档保留约 98.1%, 96.1%, 93.3%; MMLU 约 98.0%, 94.0%, 87.3%. 知识类掉得快: TriviaQA 约 94.5%, 85.9%, 74.7%; NaturalQS 约 86.9%, 75.0%, 63.7%. 多模态里 MMMU 保得住 (3B 约 88.7%), MathVista 却掉得最狠, 3B 只剩约 45.4%. 这个模式很好解释: 事实性知识靠参数存储, 参数砍掉就丢; 推理和格式靠 teacher 的分布传下来, 蒸馏能补回来. MathVista 的暴跌可能和视觉编码器冻结, 投影层新训有关, 论文没分析.

表 3 标题说 「Performance scales smoothly with model size」, 有几行并不平滑. MATH 一行 teacher 是 55.8, 学生是 67.6, 62.6, 60.1, 全部超过 teacher; GPQA Diamond 的 14B 和 8B 都是 39.9, 高于 teacher 的 36.9, 两档之间也没有差别; RACE High 的 14B 52.3 略高于 teacher 52.1; MMMU 的 14B 59.9 高于 teacher 59.1; MBPP 的 14B 和 teacher 同为 71.6. 学生超过 teacher 的几行都集中在推理和代码类, 和第 6 节第二条发现的方向一致.

表 2 的 Multilingual MMLU 一列没交代怎么算. 用表 3 的四项拼一下: 欧洲均值是 5 种语言的平均, 按 5 份计, 加上中文, 日文, 韩文各 1 份, 8 种语言平均得 14B 约 74.3, 8B 约 70.7, 3B 约 65.1; 表 2 印的是 74.2, 70.6, 65.2, 差在 0.1 以内. 这很可能就是 8 种语言的均值, 差异来自欧洲均值的取整. 韩语是四项里最弱的, teacher 自己也只有 59.3, 学生保留率却最高, 14B 约 99.5%.

## 9. Instruct 与 Reasoning 评测: 表 4, 表 5, 图 5, 图 6

表 4 的 Instruct 比较里, 14B 是最干净的胜利: Arena Hard 55.1 对 Qwen3 14B 的 42.7 和 Gemma3-12B 的 43.6, WildBench 68.5, MATH 90.40, MM MTBench 84.90, 全部领先. 8B 对 Qwen3-VL-8B-Instruct 有输有赢, MATH 87.60 对 94.60 差 7.0, 是这一档最大的差距. 3B 对 Qwen3-VL-4B-Instruct 三负一平, Arena Hard 30.5 甚至低于 Gemma3-4B 的 31.8. 表 4 还列了一个没有对应 Ministral 尺寸的 Qwen3-VL-2B-Instruct. 有一格数字可疑: Qwen3-VL-4B-Instruct 的 MM MTBench 是 80.08, 这一列其余数字最后一位都是 0, 可能是 80.80 之误, PDF 文字层也是 80.08, 本页核对不了.

表 5 的 Reasoning 比较里, 14B 对 Qwen 3 14B 六列全胜, AIME 2025 高 11.3, HMMT 2025 高 11.7. 3B 对 Qwen3-VL 4B 五胜一负, 只有 GPQA Diamond 53.4 对 60.1 输 6.7. 8B 反而是最弱的一档: 对 Qwen3-VL 8B 一胜一平四负, 只在 LiveCodeBench v6 上赢. 论文对此没有评论. 评测口径也有疑问: 「To reduce variance, we report pass@16」, 但 pass@16 按通常定义是 16 次里至少对一次, 它抬高分数而不是降低方差; 如果实际是 16 次平均, 用词就错了. PhyBench 一行全是整数, 也没解释.

图 5 把 Instruct 模型的 GPQA Diamond 分数和输出 token 数画在一起. Ministral3 14B Instruct 约 55.5 分, 用约 1,000 token; Qwen3-VL 8B Instruct 约 51 分, 用约 16,500 token; Qwen3-VL 4B Instruct 约 46.5 分, 用约 21,000 token (读图). 14B 比 Qwen3-VL 8B 高约 4.5 分, token 只有后者的约 1/16. 论文把差别归因于 Qwen 3 在 General RL 前做了 Reasoning RL. 图注说画的是 「instruction-following and reasoning」, 图上却只有 Instruct 模型, 推理版的 token 数本页未印. GPQA Diamond 在全文出现三次, 同是 14B: Base 39.9 (表 3), Instruct 约 55 (图 5, 读图), Reasoning 71.2 (表 5), 三种变体的差距一目了然.

图 6 是推理版 ODPO 前后的对比. 14B 的 ArenaHard 约 25 到 41, EQBench 约 12 到 43.5, WildBench 约 55 到 63.5; 8B 分别约 20 到 39.5, 19.5 到 34, 56 到 63.5; 3B 的 ArenaHard 看不出变化, EQBench 约 14 到 16, WildBench 约 47 到 49 (读图). 14B 的 EQBench 涨了约 31, 说明 GRPO 之后的推理模型在情感和对话质量上明显偏弱, ODPO 补回了大半. 3B 在公开基准上几乎没涨, 最终靠 「internal human evaluations」 选了 ODPO 版, 这项人评没有数; 脚注 4 补了一句 3B base 对微调超参数更敏感. EQBench 不在第 6 页的基准清单里.

## 10. 啰嗦程度与 CoT 的取舍

第 5.2 节做了一个有意思的负面实验: 往 Instruct 的 SFT 数据里掺长 CoT 轨迹, 比例越高 STEM 越好, 但模型开始过度反思, 自言自语, 反复回头. 论文给的示例是一道进制题: 求所有 $b > 9$ 使 $17_b$ 整除 $97_b$ 的 $b$ 之和. 答案 70 是对的: $17_b = b + 7$, $97_b = 9b + 7 = 9(b + 7) - 56$, 所以 $b + 7$ 整除 56, 又 $b + 7 > 16$, 只能取 28 或 56, 得 $b = 21, 49$. 示例的问题不在对错, 而在路上多次 「Wait」, 对聊天模型来说读起来累.

这个实验解释了 Ministral 3 为什么把 Instruct 和 Reasoning 分成两个模型发布, 而不是做一个可以开关思考的混合模型. Instruct 保持短回答, 图 5 里 14B 约 1,000 token 就拿到约 55.5 分; 需要深推理时换 Reasoning, 表 5 里 GPQA Diamond 到 71.2. 代价是用户要自己选模型. 论文没给出长 CoT 最终掺了多少比例, STEM 提升了多少, 这个实验只有定性结论. 从产品角度看, 对面向受限设备的小模型, 少花 token 本身就是省算力, 图 5 的 「HIGH EFFICIENCY & LOW COST」 区域正是这个意思.

## 11. 部署成本: 用表 1 能算出什么

论文反复说面向 「compute and memory constrained applications」, 却没给任何部署数字. 用表 1 可以粗算. 权重按 bf16 每参数 2 字节: 14B 约 28.1 GB, 8B 约 17.0 GB, 3B 约 6.4 GB (只算语言部分, 不含 410M 视觉编码器). 这说明 3B 能进一张消费级显卡, 14B 在 bf16 下需要较大显存, 要落到端侧多半还得量化; 论文只在指令 SFT 处提到 fp8, 没说发布权重是什么精度.

KV cache 在长上下文下更关键. 每个 token 的 KV cache 是 2 × 层数 × KV 头数 × 每头维度个数值. 按每头维度等于潜变量维度除以 32 的假设和 bf16: 14B 每 token 约 204.8 KB, 8B 约 139.3 KB, 3B 约 79.9 KB; 满 262,144 token 时分别约 53.7 GB, 36.5 GB, 20.9 GB. 3B 满上下文的 KV cache 是它自身权重的 3 倍多. GQA 把 KV 头从 32 压到 8, 已经把 cache 砍到四分之一, 但 256k 对 「memory constrained」 场景仍然是纸面能力. 长上下文外推的一般背景见 [RoPE 专题](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/RoPE/RoPE.md).

## 12. 本页对不上的数字和说法

以下都是在本页之内就能发现的不一致, 不借助外部材料:

- 上下文: 引言说推理版 128k, 表 1 三档都写 256k, 结论说 「All models ... 256K」.
- teacher 版本: 第 5 页 Mistral Medium 3, 第 9 页 Mistral Medium 3.1, 脚注 3 链接 3.1, 结论写 Medium 3; 结论还漏了 Magistral Small 1.2.
- 层重要度: 正文 「input to output」, 伪代码 `output_norm / input_norm`; 伪代码里 `n_dims` 未定义, `layers_to_keep` 传给 `remove_layers`.
- 第 6 页: 「significantly better than Gemma 12B across all benchmarks」, 表 2 TriviaQA 74.9 对 78.8 反而低.
- 表 3 标题 「scales smoothly」, MATH 一行 teacher 55.8 低于三个学生, GPQA Diamond 14B 与 8B 同为 39.9 且高于 teacher.
- 表 4: Qwen3-VL-4B-Instruct 的 MM MTBench 80.08, 与同列格式不一致.
- 表 5: 「To reduce variance, we report pass@16」, pass@k 的通常含义与降方差不符.
- 图 4 图注说比较 「instruct/reasoning」, 图上只有 Base 和 Instruct 2506; 图 5 图注说 「instruction-following and reasoning」, 图上只有 Instruct.
- 引言说和 Mistral Small 3.2 2506 比较, 表 2 到表 5 都没有这个模型.
- 第 4 页 「(more details in §5.1)」 指向 forward KL 的选择, §5.1 没有这部分内容.
- 贡献者名单里 「Tom Bewley」 重复两次; HellaSwag, Winogrande, EQ-bench 在参考文献里, 正文文字没引用; GRPO 在图 1 和第 6 页引了两个不同的出处.

这些问题大多是文字层面的疏漏, 不动摇主要结论. 但有两处会影响理解方法: 一是层重要度的方向, 复现时必须先定; 二是预训练 teacher 到底是 Base 还是 Instruct, 这关系到表 3 里学生为什么在 MATH 上超过 teacher. 第 9 页的消融说 Instruct teacher 对 MATH 帮助很大, 表 3 的现象和它吻合, 但论文没有把两件事连起来说.

## 13. 小结: 这篇论文值得记住的几件事

第一, 级联蒸馏的核心不是 「剪枝」 或 「蒸馏」 哪一个, 而是把两者排成一条链, 让一份数据一次跑完, 途中顺手剪出三个尺寸. 每个尺寸的最终模型是链上的叶子, 链本身只传短上下文模型. 这让 14B 用远少于从零训练的 token 就接近了 24B 父模型: 表 3 里 14B 在 MMLU 上保留约 98.0%, 在 ARC-Challenge 上保留约 98.1%. 第二, teacher 的选择比 teacher 的大小更重要: 预训练用同量级而非更大的 teacher, 用后训练过的而非只预训练的 teacher, SFT 用偏好调优过的 teacher.

第三, 小尺寸的代价集中在知识类和部分多模态任务: 3B 的 TriviaQA 保留约 74.7%, NaturalQS 约 63.7%, MathVista 只有约 45.4%; 推理和代码类则靠蒸馏保住甚至反超. 第四, 评测上 14B 在三种变体里都很强, 8B 推理版反而是最弱的一档, 3B 在指令版上明显落后同级的 4B 对手. 读这篇论文时, 方法部分可以直接借鉴, 结果部分要逐格对表, 不要只看正文的概括.
