# DeepSeek-Coder 技术报告详解

论文: [DeepSeek-Coder: When the Large Language Model Meets Programming - The Rise of Code Intelligence](https://arxiv. org/abs/2401.14196)(arXiv: 2401.14196v2, 2024-01-26). 仓库: https://github. com/deepseek-ai/DeepSeek-Coder.

2024 年初, 开源代码模型(StarCoder, CodeLlama)和闭源(Codex, GPT-3.5/4)之间仍有明显落差. DeepSeek-Coder 的做法是: 在 87 种编程语言, 共 2T token 上从零预训练一组 Dense 模型(1.3B / 6.7B / 33B, 各有 Base 与 Instruct), 把数据组织成仓库级样本, 并加上 Fill-in-the-Middle(FIM)与 16K 上下文. 评测里, Base 33B 在开源对照中全面靠前; Instruct 33B 在多数代码基准上超过 GPT-3.5 Turbo. 许可偏宽松, 研究与商用都放开(权重另受 DeepSeek Model License 约束, 以官方说明为准).

## 1. 数据: 仓库当训练原子

配比写得很死: 87% 源码, 10% 英文代码相关自然语言(GitHub Markdown, StackExchange), 3% 与代码无关的中文文章. 源码来自 2023 年 2 月前的公开 GitHub 仓库, 语言名单见表 1. 过滤规则大体对齐 StarCoder: 平均行长 >100 或最大行长 >1000 去掉, 字母占比 <25% 去掉, HTML/JSON/YAML 另有可见文本与长度门槛. 过完这套规则, 体积缩到原来的 32.8%.

和文件级预训练的关键差别在依赖. 同仓内用正则抽调用关系(Python `import`, C# `using`, C `include`), 再拓扑排序: 被依赖的文件排在前面, 拼成一条训练样本; 每个文件开头加路径注释. 标准拓扑排序每轮取入度为 0 的点; 这里取当前入度最小的点, 好处理环. 不连通子图各自排完再拼. 去重也在仓库级做近重复去重-- 文件级可能删掉仓里某几个文件, 把结构拆散. 质量上再叠编译器, 质量模型和启发式, 滤语法错, 可读性差, 模块化弱的代码. 清洗后合计约 797.92 GB, 603, 173k 文件(文中亦写 798 GB, 6.03 亿文件). 去污染用 10-gram: 与 HumanEval, MBPP, GSM8K, MATH 测试串相同的 10-gram 一律剔除; 更短但不短于 3-gram 的用精确匹配.

## 2. 训练: next-token prediction + 50% PSM

目标有两套. 一是 next token prediction, 多文件拼成定长样本. 二是 FIM: 文本随机切成前缀 / 中间 / 后缀, 打乱顺序用哨兵连起来. 模式有 PSM(Prefix-Suffix-Middle)与 SPM(Suffix-Prefix-Middle). 在 1.3B, Python 子集上消融 HumanEval-FIM: 100% FIM 补中间最强, 但普通补全最弱; 50% PSM 比 50% MSP(T5 式掩码跨度)更好, 也更均衡. 最终定 50% PSM, 文档级做 FIM 再 packing, 样本形如:

$$
\langle|\text{fim\_start}|\rangle f_{pre}\langle|\text{fim\_hole}|\rangle f_{suf}\langle|\text{fim\_end}|\rangle f_{middle}\langle|\text{eos\_token}|\rangle
$$

分词: HuggingFace Tokenizer 上训 BPE, 词表 32K. 结构是 decoder-only Transformer + RoPE, 与 DeepSeek LLM 同框架; 33B 用 GQA(group size 8), 注意力侧用 FlashAttention v2. 表 2 给出隐藏维, 层数, 头数与学习率: 1.3B 最大 lr $5.3\times10^{-4}$, 6.7B $4.2\times10^{-4}$, 33B $3.5\times10^{-4}$. 优化器 AdamW, $\beta_1=0.9$, $\beta_2=0.95$; 三阶段学习率, 2000 warm-up, 每阶段降到上一阶段的 $\sqrt{1/10}$, 终局为初值的 10%. 训练框架 HAI-LLM, 集群为 A100 与 H800.

长上下文: RoPE 线性缩放, 缩放因子 1→4, base 10000→100000, 再训 1000 步(batch 512, 序列 16K). 理论上可到 64K, 文中写实测可靠区间在 16K.

Instruct: 在 Base 上用 Alpaca 格式的高质量指令数据微调, 对话轮用 `<|EOT|>` 分隔; cosine 调度, 100 warm-up, 初学率 $1\times10^{-5}$, batch 约 4M token, 总共约 2B token. 文中有一处写成「34B」示例, 主表与结论统一按 33B.

## 3. 结果里该盯的数

多语言 HumanEval + MBPP(表 3, greedy): Base 33B 平均 50.3%, MBPP 66.0%; 相对 CodeLlama-Base 34B(41.0% / 55.2%)大约高 9 与 11 个点. Base 6.7B 平均 44.7%, MBPP 60.6%, 已经压过 CodeLlama 34B. Instruct 33B: Python HumanEval 79.3%, 多语言平均 69.2%, MBPP 70.0%, HumanEval 侧超过文中复现的 GPT-3.5-Turbo(76.2% / 64.9% / 70.8%), 仍低于 GPT-4.

DS-1000(表 4)测真实数据科学库调用, Base 33B 总平均 40.2%, 高于 CodeLlama-Base 34B 的 34.3%. 自建 LeetCode Contest(2023-07 至 2024-01, 180 题): Instruct 33B Pass@1 27.8%, 加 Chain-of-Thought 到 28.9%; GPT-3.5-Turbo 23.3%, GPT-4-Turbo+CoT 41.8%. 作者提醒七月, 八月场次分数偏高, 污染风险不能完全排除.

单行 FIM(表 6): Base 33B 均值 81.2%, 7B 80.7%; 文中建议补全产品优先上 6.7B. 跨文件 CrossCodeEval(表 7): 6.7B + retrieval 在多语言 EM/ES 上领先同规模开源; 去掉仓库级预训练后, Java / TypeScript / C# 下降, 仓库级构造的收益落在这张表上. 程序化数学(PAL, 表 8): Base 33B 七项平均 65.8%, GSM8K 60.7%, MATH 29.1%.

## 4. 从通用基座续训: v1.5

另做 DeepSeek-Coder-v1.5 7B: 从 DeepSeek-LLM-7B Base 再训 2T token, 配比改为源码 70%, Markdown/StackExchange 10%, 代码相关自然语言 7%, 数学相关 7%, 中英双语 6%; 只要 next token prediction, 上下文 4K, 不做 FIM. 相对同规模 Coder Base, 代码略降(HumanEval 44.7%→43.2%), 数学与通用语言涨一截(GSM8K 43.2%→62.4%, MMLU 36.6%→49.1%). 结论写得很直: 更强的代码模型宜建在更强的通用 LLM 上, 因为指令多半是自然语言.

## 5. 这篇报告实际留下的东西

仓库级依赖排序与去重, 87/10/3 的配比, 以及 50% PSM 的 FIM, 是整条 DeepSeek 代码线后来反复碰到的母题. 数字上, 6.7B 打过更大的 CodeLlama-34B, 说明数据与组织方式比单纯堆参数更值钱. 限制也清楚: Dense 从零训 33B 成本高; 纯代码配比会伤通用能力, 所以才有 v1.5 的续训实验; 16K 可靠, 64K 只是 RoPE 缩放理论上限. 读原文时以表 1–10 与算法 1 为准, 旧笔记若与表内数字冲突, 以本 PDF 为准.
