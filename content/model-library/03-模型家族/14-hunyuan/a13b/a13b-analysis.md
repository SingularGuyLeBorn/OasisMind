---
title: "Hunyuan-A13B 技术报告解读: 80B 总参数, 13B 激活, fast 与 slow 分两张表评测"
category: "模型库"
tags: ["Hunyuan", "技术解析"]
published: true
excerpt: "报告的结构很紧凑: 第 1 节引言; 第 2 节预训练, 讲数据, 结构和三个训练阶段; 第 3 节后训练, 讲推理向微调, 全场景微调和双模式 CoT;"
---
# Hunyuan-A13B 技术报告解读: 80B 总参数, 13B 激活, fast 与 slow 分两张表评测

来源: 同目录 `a13b.md` (MinerU 抓取, 页标记 `page 1 of 14` 到 `page 14 of 14`, 1 张图), 对照同目录 `a13b.pdf`. 逐段中英对照和 17 条疑点见 `a13b-bi.md`. 下文的页码, 表号, 图号都指这篇报告本身; md 和 PDF 不一致的地方, 以 PDF 为准并注明.

## 1. 材料与版本

这是腾讯混元团队的 Hunyuan-A13B 技术报告, 首页日期 2025-06-26, 共 14 页. 正文到第 11 页结论为止, 第 12 到 14 页是 52 条参考文献. 全文 7 张表, 1 张图: 图 1 是后训练四步的流程图; 表 1 是结构超参数; 表 2 是基座模型评测; 表 3 和表 4 分别是 slow-thinking 和 fast-thinking 模式下的后训练模型评测; 表 5 和表 6 是长上下文评测; 表 7 是吞吐量. md 首页第一行 「2 Tencent Hunyuan」 里的 「2」 在 PDF 文字层里没有, 是首页标志图被识别出来的字符.

报告的结构很紧凑: 第 1 节引言; 第 2 节预训练, 讲数据, 结构和三个训练阶段; 第 3 节后训练, 讲推理向微调, 全场景微调和双模式 CoT; 第 4 节评测, 分基座模型, 后训练模型, 长上下文和推理效率; 第 5 节结论. 摘要给出的核心数字只有几个: MoE 架构, 总参数 80B, 推理时激活 13B, 预训练 20T token, 双模式 CoT 分 fast-thinking 和 slow-thinking. 摘要里没有任何基准分数, 所有分数都在第 8 到 11 页的六张表里. 下面按这些数字逐项说明它们在正文里的出处和含义.

## 2. 参数: 80B 和 13B 各在哪一行

80B 和 13B 在全文出现多次, 但只有一张表把它们写成数字: 第 8 页表 2 的表头区. 「# Activated Params」 一行, Hunyuan-A13B 是 13B; 「# Total Params」 一行是 80B. 同表的对照组: Hunyuan-Large-1116 是 52B 和 389B, Qwen2.5-72B 是 72B 和 72B, Qwen3-A22B 是 22B 和 235B. 稠密模型两行相等, MoE 模型两行差出几倍, 这正是 MoE 的设计: 权重总量大, 每个输入只经过其中一小部分. 总参数决定要存多少权重, 激活参数决定每个 token 的计算量, 两个数说的是两件事, 各自成立. 第 3 页表 1 虽然是结构表, 反而没有参数量这一行.

正文拿这两个数做比较时, 要看清用的是哪一行. 第 7 页说相对 Hunyuan-Large 只用 「1/4 activated parameters and about 1/5 total parameters」, 13/52 = 0.25 用的是激活行, 80/389 约 0.21 用的是总参数行. 说 Qwen2.5-72B 「similar total parameter size」, 比的是 80B 和 72B. 说 Qwen3-A22B 有 「about 3 times the total of parameters and about 2 times activated parameters」, 按表是 235/80 约 2.9 和 22/13 约 1.7. 模型名里的 A13B 指激活参数, 命名方式和 Qwen3-235B-A22B 一样. 激活比例 13/80 约 16%, 高于 Qwen3-A22B 的 22/235 约 9.4%, 也高于 Hunyuan-Large 的 52/389 约 13%.

表 1 的维度能大致复原这两个数. 以下是我按表 1 做的估算, 假设头维 128, 每个专家是 SwiGLU 的三块矩阵, 忽略归一化层. 每层注意力约 41.9M, 每个专家约 37.7M. 32 层, 每层 65 个专家, 专家合计约 78.5B, 注意力合计约 1.34B, 再加 0.52B 到 0.54B 的词嵌入, 总计约 80.4B. 激活部分每层 9 个专家, 32 层约 10.9B, 加注意力约 12.2B, 把输出层也算上约 12.7B, 嵌入和输出层都算约 13.3B. 两组数都和表 2 吻合, 专家约占总参数的 98%. 本文没写参数的计数口径, 从估算看, 13B 应当包含了嵌入或输出层.

## 3. 结构: 1 个共享专家, 64 个细粒度专家, GQA

第 2 页 2.2 节说结构采用细粒度 MoE, 引用的是 DeepSeekMoE (Dai et al., 2024): 1 个共享专家加 64 个非共享专家, 所有专家的中间维度相同, 表 1 里是 FFN Hidden Size 3072. 每个 token 固定经过共享专家, 再由路由从 64 个非共享专家里选 8 个. 表 1 把非共享专家叫 「Specialized Experts」, 激活的 8 个叫 「Activated Specialized Experts」, 和正文的 「non-shared experts」 是同一回事. 2.2 节的原话是 「During the training stage, ... only 8 non-shared experts are activated」, 推理时同样是 8 个, 13B 激活参数也是按这个数得出的.

共享专家的数量来自 MoE 架构 scaling laws 实验: 没有共享专家的模型更差, 超过一个以后收益递减, 甚至出现波动. 本文只给了这个定性结论, 没有给实验规模, 损失曲线或具体分数. 其他结构参数: 32 层, 隐藏维度 4096, 32 个注意力头, 8 个 KV 头, 激活函数 SwiGLU (正文拼作 SWiGLU), 词表 128K, 分词器和 Hunyuan-Large 相同. 和同量级的模型比, 这是一个层数不多, 隐藏维度也不宽的模型, 参数几乎全部堆在专家上.

注意力用 GQA, 32 个 query 头共享 8 组 KV, 目的是减小 KV Cache. 按表 1 估算 (头维 128, 16 位存储), 每个 token 的 KV Cache 是 2 x 32 层 x 8 头 x 128 维 x 2 字节, 约 128KB; 如果换成 32 个 KV 头的普通多头注意力, 就是 512KB. 在 256K 上下文下, 前者约 32GB, 后者约 128GB. 第 11 页 4.4 节说支持 KV Cache FP8, 还能再减一半. 这组估算本文没有给出, 但能说明 GQA 对 256K 上下文的作用: 不减 KV 头, 长上下文推理的显存压力会大四倍.

计算量也可以粗算. 按常用的 「每个 token 前向计算约为 2 倍激活参数」 估计, Hunyuan-A13B 每个 token 前向约 26 GFLOPs, 同样 80B 的稠密模型约 160 GFLOPs, 差 6 倍多; 和表 2 里的 Qwen2.5-72B 比, 也只有它的五分之一左右. 这就是引言里 「substantially reducing inference latency and computational overhead relative to dense models of similar scale」 的来源. 但显存一侧省不下来: 80B 权重都要装进显存, 16 位存储约 160GB, 第 11 页提到的 Weight Only INT8 和 W8A8 能把它压到约 80GB. 所以 MoE 省的是每个 token 的计算, 不是存储, 这也是本文在推理效率一节同时强调量化格式的原因. 以上数字是我的估算, 本文没有给.

## 4. 数据: 20T 和它的分母

20T 在全文出现五次: 摘要 「20T token corpus」, 第 1 页 「a robust 20T tokens」, 第 2 页 「more than 20T tokens」, 第 3 页 「This stage processed a total of 20T tokens」, 第 11 页结论 「20T pre-training dataset」. 能落到具体阶段的只有第 3 页那一处: 20T 是第一阶段 Foundation Training Stage 的处理量. 所以谈 20T 的分母, 说的就是基础训练阶段, 不包括之后的退火和长上下文.

以 20T 为分母, 有三个数能算比例. 2.1 节的 250B 高质量 STEM 语料占 1.25%; 余弦衰减段的 13.5T 占 67.5%; 退火阶段的 300B 相当于 1.5%. 250B 的比例要小心理解: 本文没说它是独立 token 数还是采样后的训练量, 也没给重复轮数, 所以它说明的是这批语料的体量, 不是训练配比. 训练总量方面, 第一阶段 20T, 退火 300B, 长上下文两段没给 token 数, 合计超过 20.3T, 和第 2 页 「more than 20T」 一致.

数据流水线复用了 Hunyuan-TurboS 的三个模块: 预处理 (去重, 低质量过滤, 去噪, 主题标注), 基于模型的纯文本抽取, 后处理 (低质量过滤, 语义级去重). A13B 在这条流水线上的改动集中在 STEM: 改进 STEM 数据的获取和清洗, 另加精细的知识标注体系和多维度难度分级框架. 摘要说这些改进 「significantly improves its factual reliability and reasoning abilities」, 但本文没有做数据消融, 这句话在正文里找不到对应的数字.

## 5. 训练阶段: 学习率和上下文窗口

第 3 页 2.3 节把预训练分成三个阶段. 基础训练阶段处理 20T token: 学习率从 0 线性预热到 3e-4, 在 13.5T token 内余弦衰减到 3e-5, 然后保持 3e-5 到阶段结束; 上下文窗口固定 4096. 快速退火阶段从 3e-5 出发, 在 300B token 内余弦衰减到 8e-6, 窗口扩到 8192. 长上下文阶段分两段, 先到 32K 再到 256K, 用和 Hunyuan-TurboS 相同的 NTK-aware 位置编码, alpha 分别是 50 和 1000.

md 在学习率公式里多出两个方括号, 写成 `\left[ 3 \times 10^{-4} \right.` 和 `3 \times 10^{-5} ]`, 看上去像区间记号. PDF 文字层里没有这两个括号, 是 MinerU 识别公式时多出来的. 这一节还有几个数本文没给: 预热段多长, batch size 多大, 长上下文两段各用多少 token, 各阶段的数据配比. 所以关于保持最小学习率的那一段, 只能说最多 6.5T, 给不出精确值. 上下文窗口的路径 4096, 8192, 32K, 256K, 和表 2 里的 Context Length 256K 对得上.

把三个阶段连起来看, 学习率曲线有两次下降. 第一次是基础阶段前 13.5T 的余弦衰减, 从 3e-4 降到十分之一, 然后在 3e-5 上平着走完剩下的部分, 最多 6.5T. 第二次是退火阶段的 300B, 从 3e-5 再降到 8e-6, 约为峰值的 2.7%. 退火阶段的 token 量只有基础阶段的 1.5%, 但它同时把上下文窗口从 4096 翻到 8192, 也就是说窗口扩展从退火阶段就开始了, 并不是等到长上下文阶段. 本文说退火的目的是 「enhance its overall performance」, 没有给退火前后的分数. 长上下文两段只给了 alpha, 没说学习率, 8e-6 之后学习率怎么走, 本文没有交代.

## 6. 后训练: 四步流程

![Image block](images/p03-figure-1-a-diagram-illustrating-the-four-steps-of.png)

第 3 页图 1 是全文唯一的图, 画的是 Pretrain Model 之后的四步: Stage1 Reasoning-oriented SFT, Stage2 Reasoning-oriented RL, Stage3 All-Scenarios SFT, Stage4 All-Scenarios RL. 第 3 节正文说框架由 「two complementary fine-tuning phases」 组成, 和图 1 的 「four steps」 不矛盾: 两个阶段是推理向微调和全场景微调, 每个阶段内部先 SFT 后 RL. 小节 3.1.1, 3.1.2, 3.2.1, 3.2.2 依次对应这四步, 第 2 页引言里的后训练顺序也一样.

两个阶段的 RL 信号不同. 推理向阶段的 RL 只看最终输出对不对; 全场景阶段用 「dual-signal」, 既看正确性, 也让一个更大的 LLM 评估风格, 连贯性和适应性. 这个区别决定了两个阶段的数据形态: 推理向阶段需要能自动验证的答案, 所以排除了选择题, 判断题和证明题; 全场景阶段允许开放式任务, 靠生成式奖励模型打分.

## 7. 推理向微调: SFT 数据和 RL 配方

推理向 SFT 数据分四个领域. 数学题来自教材, 标准化考试和竞赛, 用生成式奖励模型和自动验证迭代筛选 CoT 样例. 代码数据用一条成熟的数据生成流水线 (引用 Wei et al., 2024 的 Magicoder) 把开源代码转成指令推理对, 再经 critic 模型和沙箱执行验证. 逻辑数据来自谜题集, 参照 ZebraLogic 自动合成扩充, 常规样本自动评估, 复杂样本人工核验. 科学数据覆盖物理, 化学, 生物, 难度从初中到研究生, 高难题由 LLM 验证器检查单位换算, 数值近似和化学记号, 最后用拒绝采样过滤. 四个领域都只保留经过验证的样本.

推理向 RL 基于 GRPO, 用两类奖励: 结果奖励模型给 0 或 1 的二值奖励, 用于数学, 逻辑和科学; 代码题用多语言沙箱, 支持 36 种语言, 部署在分布式 CPU 集群上, 并发超过 1000. 数据集 150K, 数学, 代码, 逻辑, 科学按 2:2:1:1 分配, 即 50K, 50K, 25K, 25K; 其中 10% 即 15K 与 SFT 数据重叠, 其余 135K 是新样例. 提示从 SFT 模型表现不稳定的题里采样. 排除选择题, 判断题和证明题, 是因为前两类能蒙对, 证明题没法自动判对错.

训练配置有这些: 上下文分两段, 先 24K 再 32K; 参照 Yu et al. (DAPO) 去掉 KL 散度约束; on-policy 学习; 大 batch; 更多 rollout; 采样温度 0.6 到 0.8. 本文只说这些措施 「collectively benefit the RL training process」, 没有给 RL 前后的分数对比, 也没有训练曲线, 所以每项配置单独贡献多少无从判断.

## 8. 全场景微调: 八类 SFT 数据, 十二个 RL 方向

全场景 SFT 把一部分推理数据和通用数据混在一起, 补充八类能力: 语言理解, 创意写作, 多语言, 复杂指令, 角色扮演, 知识问答, 多轮对话, 智能体. 智能体数据写得最具体: 一个五角色合成引擎 (用户, 规划者, 工具, 智能体, 检查者); 三种工具来源 (沙箱工具, MCP, 合成工具); 30 多种智能体系统指令; 工具, 动作和响应的格式变化组合出 20,000 种格式; 重点加强 Excel 处理和深度搜索这类高频任务. 这里还提到训练了一个专门生成思考过程的模型, 用来缓解快思考和慢思考数据不平衡, 这和 3.3 节的双模式 CoT 直接相关.

全场景 RL 以生成式奖励模型 (GRM) 为核心: 开放式任务拿参考答案当语义锚点, 确定性问题用标准答案; GRM 还能读入 CoT, 调用工具, 统计长度, 检查约束. 第 6 页列了 12 个方向, 各配奖励服务: 文本理解, 翻译, 长上下文, 创意写作, 智能体, 多轮对话, 复杂指令, 角色扮演, 安全, 知识问答, 多语言, 金融法律医疗. 智能体方向的奖励写得最明确: 格式奖励取 0 或 1, 再加上工具, 参数, 取值一致性的正确性奖励.

本节末尾说全场景 RL 覆盖 「16 sub-topics and over 30 scoring services」. 按编号数只有 12 项, 把金融, 法律, 医疗拆开也只有 14 项, 剩下的子主题本文没有列出名字; 30 多个评分服务同样没有清单. 这两个数在本文里没法逐项核对. 全场景阶段也没有单独的评测, 它的效果只能从表 3, 表 4 里指令遵循, 文本生成, NLU 和智能体这几组分数间接看到.

## 9. 双模式 CoT: 一个格式, 两个标签

第 7 页 3.3 节讲双模式 CoT 的实现. fast-thinking 输出简洁, 适合简单任务; slow-thinking 包含反思, 回溯这类步骤, CoT 更长, token 消耗更多, 换来复杂任务上的准确率. 两种模式在后训练里用统一结构同时训练, 共用一个输出格式, 差别只在 `<think>` 块是否为空. 用户用控制标签切换: `/no think` 对应 fast, `/think` 对应 slow, 不加标签默认 slow.

这段有两处印刷上的疑点. 空块写成 `<think>\n\n<think>`, 两个都是开标签, 按上下文第二个应是 `</think>`; `/no think` 中间是空格, 也可能是丢了下划线. PDF 文字层和 md 一致, 所以这是本文原样, 不是转写错误. 从资源角度看, slow-thinking 是在 TestingTime 多花算力: 模型参数不变, 每个问题多生成一段思考内容. 本文没有给两种模式的平均输出长度或延迟, 额外开销有多大没有数字, 只能从表 3 和表 4 的分数差看收益一侧.

## 10. 基座模型评测: 表 2 的几处计数

第 8 页表 2 比较四个基座模型, 14 个基准分三组: 通用 (MMLU, MMLU-Pro, MMLU-Redux, BBH, SuperGPQA), 编程 (EvalPlus, MultiPL-E, MBPP, CRUX-I, CRUX-O), 数学与 STEM (MATH, CMATH, GSM8k, GPQA). 第 7 页 4.1.1 节说评测有四个维度, 第四个是多语言能力, 但表 2 没有多语言分组, 列表里也没有多语言基准. MultiPL-E 是多编程语言, CMATH 是中文数学, 都不算自然语言的多语言评测. 所以基座模型的多语言能力, 本文没有分数.

正文的三条结论, 逐行核对的结果不一样. 对 Hunyuan-Large, 正文说 14 项赢 12 项, 逐行数是 11 项, 输在 MMLU (88.17 对 88.40), CMATH (91.17 对 91.30) 和 GSM8k (91.83 对 92.80). PDF 表 2 把 CMATH 的加粗给了 Hunyuan-A13B 的 91.17, 和数值不符; 照加粗算正好 12 项. 对 Qwen2.5-72B, 正文说 「almost all」, 实际 14 项全赢. 对 Qwen3-A22B, 正文说 12 项赢 7 项, 核对无误: Qwen3-A22B 缺 CRUX-I 和 CMATH, 可比 12 项, Hunyuan-A13B 赢 MMLU, MMLU-Redux, EvalPlus, MultiPL-E, MBPP, MATH, GPQA.

分组看, Hunyuan-A13B 在编程组最强: 对 Qwen3-A22B, EvalPlus, MultiPL-E, MBPP 都更高, 只有 CRUX-O 低 2 分. 通用组互有胜负, MMLU-Pro, BBH, SuperGPQA 都低于 Qwen3-A22B. 数学组 MATH 和 GPQA 更高, GSM8k 91.83 在四个模型里是第二低. GPQA 一行 Hunyuan-Large-1116 只有 25.18, 远低于其他三个模型的 45 到 49, 本文没有解释这个数.

## 11. 后训练模型评测: fast 和 slow 是两张表

后训练模型的评测在第 9 页两张表里: 表 3 是 slow-thinking, 表 4 是 fast-thinking. fast 和 slow 没有放进同一张表做成两列, 而是各配一组对照: 表 3 对 OpenAI-o1-1217, Deepseek-R1-0120, Qwen3-A22B, 都是推理模型; 表 4 对 Hunyuan-Large-1116, Qwen2.5-72B-instruct, Qwen3-A22B. 两张表都是 21 行, 其中 20 行同名, 编程组第三行不同 (表 3 是 ArtifactsBench, 表 4 是 McEval). md 把同一类别的几行挤进了一个单元格, 例如 「74.379.296.4」 要拆成 74.3, 79.2, 96.4; bi 文件里已按 PDF 拆开重排了这两张表.

把两张表里 Hunyuan-A13B 的同名行相减, 能看出 slow-thinking 的收益落在哪里. 收益最大的是竞赛数学和逻辑: AIME2025 +57.6, AIME2024 +56.7, ZebraLogic +48.2, LiveCodeBench +36.5. 指令遵循和文本生成几乎不变: IF-Eval +0.3, LengthCtrl +1.5, InsCtrl +3.0. 有两行 fast 反而更高: ComplexFuncBench 74.0 对 61.2, C3-Bench 65.4 对 63.5. Qwen3-A22B 这两行是 slow 略高, 所以这个反转只出现在 Hunyuan-A13B 上, 本文没有解释. 这组差值说明, TestingTime 多花的算力主要换来多步推理题的分数, 对格式遵循类任务帮助很小.

名次上, 表 3 里 Hunyuan-A13B 在 21 行中第一 6 行 (AIME2024, BBH, ZebraLogic, BFCL v3, ComplexFuncBench, C3-Bench), 第二 5 行, 第三 10 行; 对 Qwen3-A22B 赢 16 行. 表 4 里第一 5 行 (FullstackBench, BBH, τ-Bench, ComplexFuncBench, C3-Bench), 第二 14 行, 第三 2 行; 对 Qwen3-A22B 只赢 7 行. 正文说 「especially in the fast-thinking scenario ... often clearly outperforming larger models」, 在 fast 下对 Hunyuan-Large 和 Qwen2.5-72B 成立 (分别赢 18 行和 20 行), 对 Qwen3-A22B 不成立.

正文另两句也要分表看. 「AIME2024 最高分, ZebraLogic 和 BBH 领先」 只在表 3 全部成立, 表 4 里 AIME2024 和 ZebraLogic 都是 Qwen3-A22B 最高. 「在 BFCL-v3, τ-Bench, ComplexFuncbench 和 C3-Bench 上领先」 这句, 表 3 里 τ-Bench 输给 OpenAI-o1-1217 (54.7 对 60.4), 表 4 里 BFCL v3 排第三 (65.9, 低于 68.0 和 66.1), 哪张表都不是四项全第一. 最稳的是 ComplexFuncBench, 两种模式都第一, 分别领先第二名 13.6 和 33.9.

## 12. 长上下文: 表 5 和表 6

第 10 页表 5 用三个基准比长上下文能力, 对照组是 Gemini 2.5 Pro, DeepSeek R1, Qwen3-A22B. Hunyuan-A13B 在 PenguinScrolls (87.7) 和 LongBench-v2 (55.0) 上都排第二, 仅次于 Gemini 2.5 Pro; FRAMES 81.1 排第三, 低于 DeepSeek R1 的 85.7 和 Qwen3-A22B 的 84.0, 正文也承认 RAG 类长上下文处理还有差距. 表注和正文把这些对照组都叫 「open-source models」, 但 Gemini 2.5 Pro 是闭源模型.

第 11 页表 6 是 RULER 的 QA 子任务, 按输入长度分四档: 0-8K, 8K-32K, 32K-64K, 64K-128K. Gemini 2.5 Pro 每档都第一. Hunyuan-A13B 从 78.7 降到 73.9, 降 4.8, 衰减仅次于 Gemini 2.5 Pro 的 3.0; DeepSeek R1 降 9.8, Qwen3-A22B 降 10.0. Hunyuan-A13B 在 32K-64K 这一档反而比 8K-32K 高 2.7, 曲线不单调, 本文没有讨论这一点.

表 6 的 Avg. 列不是四档的等权平均. Gemini 2.5 Pro 算出来是 81.675, 和 81.7 一致; 另外三个模型算出来是 76.475, 71.3, 72.225, 表里写的是 76.7, 72.0, 73.0, 都偏高. 本文没说 Avg. 怎么加权. 还有一点: 模型的上下文窗口是 256K (第 3 页, 表 2), 表 6 最长却只到 128K, 128K 到 256K 这一段没有 RULER 分数, 256K 在长度上限附近表现如何, 本文没有直接数据.

四个长上下文基准各有侧重, 读分数时要记住它们测的是什么. PenguinScrolls 是混元自己发布的人工标注数据集, 四类任务是信息抽取, 信息定位, 定性分析和数值推理, 文本来自书籍, 财报, 法律文件和论文; 这里 Hunyuan-A13B 和 Gemini 2.5 Pro 只差 0.6, 四个模型全在 87 到 88.3 之间, 区分度不大. LongBench-v2 有六类任务, 重在深度理解, 四个模型从 48.4 到 60.9 拉开了 12.5 分, 是这组里区分度最大的. FRAMES 用多跳问题考检索和综合, Hunyuan-A13B 在这里落后最多. RULER 选 QA 子任务, 理由是更贴近真实场景, 任务捷径少. 所以表 5 的三个第二, 第二, 第三名, 分量并不相同.

## 13. 推理效率: 表 7 缺少的条件

第 11 页 4.4 节列出部署支持: vLLM, SGLang, TensorRT-LLM 可以一键部署 W16A16; 服务层有 Auto Prefix Caching 和 Chunk Prefill; 无损量化格式有 Weight Only INT8, W8A8, KV Cache FP8; 加速机制有张量并行, 专家并行和 FusedMoE. 表 7 给出 A16W16C16 精度下四组吞吐: batch 1 为 190.84 tokens/s, batch 16 为 1246.54, batch 32 为 1981.99, batch 32 且输出 22528 时为 1725.95. 输入固定 2048, 输出 14336 或 22528, 加起来正好是 16K 和 24K.

表 7 缺几项关键条件: 硬件型号和卡数, 用的哪个推理框架, 是 fast 还是 slow 模式, tokens/s 是否包含输入 token. 缺了这些, 这组数字没法和其他模型横向比, 摘要里的 「superior inference throughput」 在本文里也没有对照组. 表内能做的换算是单条请求的速度: batch 1 约 190.8, batch 16 约 77.9, batch 32 约 61.9, 输出拉长后约 53.9. batch 从 1 到 32, 总吞吐升到约 10.4 倍, 单条速度降到约三分之一. 14336 的输出长度更接近 slow-thinking 的长 CoT, 但本文没写, 这只是推测.

## 14. 与混元前作的继承关系

本文多处说明哪些部件沿用了前作. 数据整理流水线直接复用 Hunyuan-TurboS, A13B 只优化其中的子模块, 重点在 STEM. 激活函数 SwiGLU 与 Hunyuan-Large 和 Hunyuan-TurboS 保持一致. 分词器与 Hunyuan-Large 相同, 词表 128K. 长上下文阶段的 NTK-aware 位置编码与 Hunyuan-TurboS 相同. 参考文献里 Hunyuan-TurboS 的标题是 「Advancing large language models through mamba-transformer synergy and adaptive chain-of-thought」, 说明自适应 CoT 的思路在 TurboS 就有, A13B 的双模式 CoT 用显式标签把它做成了用户可选的开关. 本文没有说 A13B 是否沿用 TurboS 的 Mamba 结构; 表 1 只列了 32 层, 注意力头和 KV 头, 没有任何 Mamba 相关的参数, 按表推测是 Transformer 加 MoE.

Hunyuan-Large 在本文里既是前作, 也是对照组. 它出现在表 2 (基座) 和表 4 (fast-thinking), 版本号是 1116, 结构是 MoE, 激活 52B, 总参数 389B, 上下文 256K. A13B 的激活参数只有它的四分之一, 总参数约五分之一, 基座分数 14 项里赢 11 项, fast 模式 21 项里赢 18 项. 第 7 页说 Hunyuan-Large 是 2024 年首次发布, A13B 的报告日期是 2025 年 6 月, 同一团队用小得多的模型在多数基准上超过了前作. 本文把原因归于训练策略, 模型结构和数据质量三方面的改进, 但没有做消融来区分三者各自的贡献. 表 3 的 slow-thinking 对比里没有 Hunyuan-Large, 本文没说原因, 对照组换成了 OpenAI-o1-1217 和 Deepseek-R1-0120 这类推理模型.

## 15. 疑点索引

bi 文件里的 17 条疑点按页排列, 这里按主题归并, 方便回查. 参数与结构三条: 80B 和 13B 各在表 2 哪一行 (第 1 页); 只用表 1 复原 80B 和 13B (第 3 页); 学习率公式里的方括号是 MinerU 产物 (第 3 页). 数据与训练两条: 20T 的分母和 250B STEM 语料的占比 (第 2 页); 三个阶段的 token 数能拼出多少 (第 3 页). 后训练三条: 两个阶段和四步的关系 (第 3 页); 150K RL 数据的拆分 (第 4 页); 16 个子主题只列了 12 项 (第 6 页). 双模式一条: 思考块标签和默认模式 (第 7 页).

评测部分八条. 表 2 缺多语言分组 (第 7 页); 对 Hunyuan-Large 的 「12 of 14」 逐行数是 11, 加粗有一处和数值不符 (第 7 页); 对 Qwen2.5-72B 其实是全胜, 对 Qwen3-A22B 的 「7 of 12」 无误 (第 7 页); fast 和 slow 是两张表, 不是同表两列 (第 9 页); fast 场景 「明显超过更大模型」 对 Qwen3-A22B 不成立 (第 9 页); 四个智能体基准没有一张表是全第一 (第 9 页); RULER 的 Avg. 不是等权平均, 128K 以上没有分数 (第 11 页); 吞吐量缺硬件和模式 (第 11 页).
