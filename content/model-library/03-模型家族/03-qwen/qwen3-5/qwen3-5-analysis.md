---
title: "Qwen3.5: 混合注意力走上旗舰, 视觉进入原生训练"
category: "模型库"
tags: ["Qwen", "技术解析"]
published: true
excerpt: "Qwen3.5 的开源首发是 Qwen3.5-397B-A17B, 总参 397B, 每次前向激活 17B."
---
# Qwen3.5: 混合注意力走上旗舰, 视觉进入原生训练

> 公开材料是阿里云社区转载的发布博客 `qwen3-5.md` (22 页, 2026-02-17), 不是技术报告. 有规格口号, 语言, 视觉, Base 三张对照表, 预训练与基础设施的定性描述, 以及 API 用法; 没有层数表, 混合比例, 专家配置, 训练数据量, RL 课表或任何消融.

来源: 同目录 `qwen3-5.md`, 表内数字以源文为准; 对照译稿见 `qwen3-5-bi.md`.

Qwen3.5 的开源首发是 **Qwen3.5-397B-A17B**, 总参 397B, 每次前向激活 17B. 博客把它称作原生视觉语言模型, 架构 「基于 Qwen3-Next」: 更高稀疏度的 MoE, Gated DeltaNet 与 Gated Attention 的混合注意力, 稳定性优化, MTP. 数据侧写视觉文本 token 规模显著大于 Qwen3, 语言从 119 种扩到 201 种, 词表从 150k 扩到 250k. 后训练的增益被归因于 「几乎所有能想到的 RL 任务与环境都做了扩展」. 这几面在博客里都只有一两句, 下面把能从表上核对的部分和它们对上.

机制单独成篇. Gated DeltaNet 与线性注意力: [01-Kimi-Delta-Attention-KDA](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md). Gated Attention: [06-Gated-Attention](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention/06-Gated-Attention.md). 混合注意力综述: [Gated-Attention-Hybrid-Attention-2025-2026](../../../../llm-guide/10-综述与前沿论文/Gated-Attention-Hybrid-Attention-2025-2026/Gated-Attention-Hybrid-Attention-2025-2026.md). MoE: [01-DeepSeek-MoE](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). MTP: [2.4.6-多Token预测MTP深度解析](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP深度解析.md). MoE 系统并行: [08-MoE系统优化综述](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/08-MoE系统优化综述/08-MoE系统优化综述.md).

## 1. 架构与效率

### 1.1. 架构: 博客只给了名字

博客列出的四项架构特征都来自 Qwen3-Next. **Gated DeltaNet** 是一种线性注意力: 每层维护一个固定大小的状态矩阵, 新 token 到来时, 先用衰减门 $\alpha_t$ 整体衰减旧状态, 再按 **delta rule** 只写入 「当前 key 对应的旧值与新值之差」, 写入强度由 $\beta_t$ 控制. 状态大小不随序列增长, 所以没有随长度线性增长的 KV cache. Gated Attention 是在标准 softmax 注意力输出上加一个门, 保留逐 token 精确检索的能力. 在 Qwen3-Next-80B-A3B 的开源配置里, 两者按每 3 层 Gated DeltaNet 配 1 层 Gated Attention 排列 (Qwen3-Next 模型卡信息, 非本博客).

397B-A17B 是否沿用 3:1 的比例, 层数多少, 专家总数与激活数, 是否有共享专家, MTP 有几层, 博客都没有写, 这一面本页没有. 激活比例可以算: 17/397 约 4.3%, 低于 Qwen3-235B-A22B 的约 9.4% (按参数口号计算), 这和 「更高稀疏度的 MoE」 的说法一致. 选型时总参决定显存, 激活参决定每 token 计算量, 397B 的权重仍要全部装下.

### 1.2. 效率: decode 吞吐倍率随上下文变长而扩大

博客给了一组 decode 吞吐对比: 32k 与 256k 上下文下, 397B-A17B 分别是 Qwen3-Max 的 8.6× 与 19.0×, 是 Qwen3-235B-A22B 的 3.5× 与 7.2×, 并称与 Qwen3-Max 的性能相当. 两组倍率从 32k 到 256k 都翻了一倍多 (19.0/8.6 约 2.2, 7.2/3.5 约 2.1, 按博客数字计算). 对照的两个模型都是全注意力, KV cache 随长度线性增长, decode 时每步要读的 KV 越来越多; 混合注意力只有少数层保留 KV, 长上下文下优势自然放大.

**这组倍率不能只归因于激活参**. 17B 对 22B, 单看计算量只差约 1.3 倍 (按激活参计算), 而 32k 下的倍率已经是 3.5; 余下的部分可能来自线性注意力层省掉的 KV 读取, 以及 MTP 用于投机解码 (推测). 博客没有给逐层 KV 字节数, batch 设置, 硬件型号, 也没说 MTP 是否参与了这组测速. 第 12 页的两张 Decode Throughput 图对应 32K 与 256K, 是吞吐图, 不是质量图.

## 2. 预训练与 Base 表

### 2.1. 预训练: 规模, 融合与词表

Power 一段说视觉文本 token 规模显著大于 Qwen3, 中英文, 多语, STEM, 推理数据更丰富, 过滤更严, 并称 397B-A17B 的 Base 能对齐总参超过 1T 的 Qwen3-Max-Base. Versatility 一段说通过早期文本视觉融合 (**early fusion**) 做成原生多模态, 扩充视觉, STEM, 视频数据, 在同等规模上超过 Qwen3-VL. 视觉编码器怎样接入, 从第几层开始融合, 编码器是否冻结, 数据总量多少, 都没有写.

词表从 150k 扩到 250k, 博客称多数语言的编解码效率提升 10–60%, 即同样文本切出的 token 更少. 这对 201 种语言的覆盖有直接意义: 低资源语言在小词表下常被切成很碎的片段, 同样的上下文窗口装下的内容就少. 代价是嵌入层和输出层变大, 按词表大小比例约增加 2/3 (按 250k 对 150k 计算). 博客没有给各语言的效率分表, 10–60% 的区间对应哪些语言无法核对.

### 2.2. Base 表: 与 Qwen3 报告的数字对不上

第 12 到 13 页的 Base 表把 Qwen3-235B-A22B, GLM-4.5-355B-A32B, DeepSeek-V3.2-671B-A37B, K2-1T-A32B 与 Qwen3.5 并排. Qwen3.5 在多数格最高, 提升最大的是 MMLU-Pro (76.01, 对 V3.2 的 62.82), SuperGPQA (57.96, 其余都在 45 以下), SWE-agentless (43.26, 次高 34.67), MultiPL-E (79.39). 这是博客说 「预训练已经抬高底座」 的主要证据.

但同一张表里 Qwen3-235B-A22B 这一列, 和 Qwen3 技术报告表 3 的数字只有部分相同. GPQA 47.47, MATH 71.84, EvalPlus 77.60, MultiPL-E 65.94 完全一致; MMLU-Pro 这里是 67.73, 报告是 68.18; SuperGPQA 42.84 对 44.06; GSM8K 91.17 对 94.39; MMMLU 81.27 对 86.70; INCLUDE 这里 75.26, 反而高于报告的 73.46 (按两表核对). 说明这张表大概是重新跑的, 评测管线或设置不同, 部分格沿用了旧数 (推测). 另一个可疑点是 C-Eval 一行, Qwen3-235B, K2, Qwen3.5 三列都是 91.82, 小数点后两位完全相同. 跨报告比 Base 分数时, 以同一张表内部比较为准.

## 3. 对照评测

### 3.1. 语言对照表: 强在指令与多语, 推理不占优

语言表的对照列是 GPT5.2, Claude4.5Opus, Gemini-3 Pro, Qwen3-Max-Thinking, K2.5-1T-A32B. Qwen3.5 在指令遵循上突出: IFBench 76.5, MultiChallenge 67.6, 都是全表最高; 多语方面 NOVA-63 59.1 最高, PolyMATH 73.3 仅次于 Gemini 与 Claude, MAXIFE 88.2 接近 GPT5.2 的 88.4. 知识类接近前列但不领先, MMLU-Pro 87.8 低于 Gemini 的 89.8 和 Claude 的 89.5.

推理组反而是它的弱项. LiveCodeBench v6 83.6, IMOAnswerBench 80.9, HLE 28.7, 在六列中都是最低 (按表核对), 甚至低于同门的 Qwen3-Max-Thinking. HLE-Verified 是 HLE 的核实修订版, 数据集已开源, Qwen3.5 在这一行是 37.6, 与 Qwen3-Max-Thinking 相同. 长上下文的 AA-LCR 68.7 也是并列最低. 这和第 3.2 节的训练重心能对上: 博客说后训练的重点是扩展 RL 环境的难度和泛化性, 展示的是 Agent 类基准, 而不是竞赛推理.

### 3.2. Agent 评测: 同一权重, 不同脚手架

Agent 组的脚注要逐条读. 搜索类大多用 simple **context-folding** (256k): 累计的工具返回超过阈值, 就从历史中剪掉更早的返回. BrowseComp 测了两种策略: folding 得 69.0, 与 DeepSeek-V3.2, Kimi K2.5 相同的 discard-all 策略得 78.6, 同一权重差 9.6 分. WideSearch 用 256k 窗口, 不做任何上下文管理. TAU2 的 airline 域按 Claude Opus 4.5 system card 的修复评测. MCP-Mark 固定 GitHub MCP server v0.30.3, Playwright 工具返回截断在 32k token. 复现某一格, 只能照该格脚注来.

第 11 页的图把后训练增益画成 「环境扩展与平均排名」 的关系, 平均排名取自 BFCL-V4, VITA-Bench, DeepPlanning, Tool-Decathlon, MCP-Mark 五个基准. 这是排名的平均, 不是分数的平均; 单项落后会被排名稀释. 按表看, Qwen3.5 在这五项里没有一项第一: BFCL-V4 72.9 低于 Claude 的 77.5, DeepPlanning 34.3 低于 GPT5.2 的 44.6, Tool Decathlon 38.3 低于 GPT5.2 与 Claude, MCP-Mark 46.1 低于 GPT5.2 与 Gemini. 编码 Agent 组 SWE-bench Verified 76.4, Terminal Bench 2 52.5, 都落后 Claude.

### 3.3. 视觉对照表与工具脚手架

视觉表第四列换成 Qwen3-VL-235B-A22B. 相对 Qwen3-VL, Qwen3.5 几乎每格都更高, 涨幅大的有 MathVision (74.6 到 88.6), OSWorld-Verified (38.1 到 62.2), 医学 PMC-VQA (41.2 到 64.2). 对闭源模型, 它在文档与 OCR (OmniDocBench 90.8, OCRBench 93.1) 和空间类 (RefCOCO 92.3) 上领先, 在 SimpleVQA (67.1 对 Gemini 73.2), VideoMMMU, MMVU (75.4 对 GPT5.2 80.8) 上落后.

三条脚注影响读数. MathVision 上 Qwen3.5 用固定的 boxed 提示, 其他模型取有无 boxed 两次中的较高分, 口径对其他模型有利. BabyVision 52.3 与 V* 95.8 都开了 Code Interpreter, 不开时是 43.3 与 91.1; 其他列没有注明是否开工具. **用工具换分数**属于推理时多花算力 (TestingTime), 比较时要把有无工具分开.

## 4. 基础设施, 异步 RL 与用法

多模态训练用**异构并行**: 视觉和语言组件分别选并行策略, 再利用稀疏激活让跨组件计算重叠, 博客称混合图文视频数据的训练吞吐接近纯文本基线的 100%. 另有原生 FP8 管线, 覆盖激活, MoE 路由和 GEMM, 运行时监控敏感层并保留 BF16, 称激活显存降约 50%, 速度提升超过 10%, 稳定扩到数十万亿 token. 两组数字回答的问题不同: 前者是加入视觉后吞吐有没有掉, 后者是低精度省了多少.

RL 框架是训练与推理完全拆开的异步架构, 列出的技术有 FP8 端到端训练, **rollout router replay**, 投机解码, 多轮 rollout locking, 并称限制了梯度陈旧度, 缓解了数据偏斜, 端到端加速 3–5×, 能容纳百万级的 Agent 脚手架与环境. router replay 大概是让训练时的 MoE 路由复现推理时的选择, 减少训推不一致 (推测). 博客没有给陈旧度的界, 也没有给 RL 算法名称. 产品侧 Qwen Chat 有 Auto, Thinking, Fast 三种模式; 托管的 Qwen3.5-Plus 默认 1M 上下文, API 用 `enable_thinking` 和 `enable_search` 两个参数, 流式输出分 `reasoning_content` 与 `content`. 这些是托管服务的接口, 开源 397B 权重的默认上下文与 Plus 是否同一个模型, 博客没有说.
