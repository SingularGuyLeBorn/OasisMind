---
title: "Qwen3-235B-A22B-Instruct-2507: 只做 non-thinking 的旗舰刷新"
category: "模型库"
tags: ["Qwen", "技术解析"]
published: true
excerpt: "这张卡交付的是 Qwen3 旗舰 MoE 的一个新版本, 只保留 non-thinking 模式."
---
# Qwen3-235B-A22B-Instruct-2507: 只做 non-thinking 的旗舰刷新

> 公开材料是 Hugging Face 上 `Qwen/Qwen3-235B-A22B-Instruct-2507` 的模型卡抓取 (17 页, 前两页和末页多是 Hub 页面元素). 卡里有规格, 对照表, 1M 上下文的部署步骤和 RULER 表, 没有预训练数据, 后训练配方, 路由细节或消融.

来源: 同目录 `qwen3-2507.md`, 表内数字以源文为准; 对照译稿见 `qwen3-2507-bi.md`.

这张卡交付的是 Qwen3 旗舰 MoE 的一个新版本, 只保留 non-thinking 模式. 规格和 Qwen3 报告里的 235B-A22B 完全相同, 变化集中在两处: 后训练之后的分数, 以及原生上下文从 32K 训练段加外推, 变成原生 262,144 并可外推到约 1M. 卡上能看到的是结果和部署开关, 看不到的是数据与训练. 所以下面按 「规格, 分数, 长上下文, 用法」 的顺序写, 每一处都注明卡上有什么, 没有什么.

机制单独成篇. GQA: [03-GQA-在性能与缓存之间折中](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/02-MQA与GQA-共享KeyValue头/02-MQA与GQA-共享KeyValue头.md). MoE: [01-DeepSeek-MoE](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). DCA: [05-DCA-双块注意力](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/04-DCA与S2-Attn-长上下文分块注意力/04-DCA与S2-Attn-长上下文分块注意力.md). YaRN: [03-长度外推：从PI到YaRN的频率扩展](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md). 长上下文推理优化: [03-长上下文推理优化技术全景](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/2.5.3-长上下文推理优化/2.5.3-长上下文推理优化.md).

## 1. 定位与分数

### 1.1. 定位: 从一权双模式退回单模式

卡面把它写成 **Qwen3-235B-A22B non-thinking mode** 的更新版. 规格一行不差: 总参 235B, 激活 22B, 非嵌入 234B, 94 层, GQA 为 Q 64 / KV 4, 专家 128 选 8. 训练阶段只写 「Pretraining & Post-training」. 许可证是 apache-2.0. 卡末引用 Qwen3 报告和 Qwen2.5-1M 报告.

卡上最关键的是一条说明: 这个模型**只支持 non-thinking 模式**, 输出不会出现 `<think></think>` 块, 也不再需要 `enable_thinking=False`. Qwen3 报告的主张是把两种模式收进一套权重; 2507 把 non-thinking 单独拆出来做, 等于承认在这一档上, 分开训练两个模型比共用一套权重更划算. 为什么这样选, 卡上没有解释. 可以对照的事实是, Qwen3 报告表 22 显示 Fusion 和 General RL 会让 thinking 侧的难题分数小幅回落 (见 Qwen3 解析), 拆开训练可以避开这种互相牵制 (推测).

### 1.2. 分数: 相对旧 non-thinking 几乎全面上涨

Performance 表把 Deepseek-V3-0324, GPT-4o-0327, Claude Opus 4 Non-thinking, Kimi K2, 旧 Qwen3-235B-A22B Non-thinking 和 2507 并排, 共 29 行. 相对旧 non-thinking, 只有 Aider-Polyglot 一格下降 (59.6 到 57.3), 其余全部上涨 (按表计算). 涨幅最大的是 SimpleQA (12.2 到 54.3), AIME25 (24.7 到 70.3), HMMT25 (10.0 到 55.4), ARC-AGI (4.3 到 41.8), ZebraLogic (37.7 到 95.0). 在六列中拿到最高分的行是 14/29 (按表计算), 集中在知识问答, 数学推理和多语.

SimpleQA 的涨幅要单独看. 这是考长尾事实的基准, 从 12.2 涨到 54.3, 超过了表中所有对照. 一般认为事实知识主要来自预训练, 后训练很难凭空加进去. 卡上 Highlights 写 「多语言长尾知识覆盖大幅提升」, 训练阶段又写了 Pretraining, 所以 2507 可能不只是换了后训练 (推测). 卡上没有说明底座是否重训或继续预训练, 这一面本页没有.

AIME25 70.3 出现在一个 「不思考」 的模型上, 也要换个角度理解. 卡上推荐多数查询输出 16,384 token, 数学题提示要求 「逐步推理, 答案放进 `\boxed{}`」. non-thinking 的意思只是没有单独的思考块, 并不等于回答短; 模型完全可以在正文里写长推导. 比较 thinking 与 non-thinking 模型时, 输出长度和提示方式要一起报.

### 1.3. 没赢的格子与脚注

卡面没有逐项讨论弱项, 但表里很清楚. 知识类 MMLU-Pro 83.0 和 MMLU-Redux 93.1 都低于 Claude Opus 4 Non-thinking (86.6, 94.2). 代码类 MultiPL-E 87.9 略低于 Claude 的 88.5, Aider-Polyglot 57.3 远低于 Claude 的 70.7. 写作与指令类 IFEval, Creative Writing, WritingBench 都略低于 Kimi K2. 多语知识 INCLUDE 79.5 低于 GPT-4o 的 82.1 和 V3 的 80.1.

Agent 组是差距最大的一块. TAU1 与 TAU2 的五个子集里, 2507 一格也没有拿到最高, TAU2-Telecom 32.5 对 Kimi K2 的 65.8, TAU1-Airline 44.0 对 Claude 的 59.6. 只有 BFCL-v3 70.9 是最高. BFCL 主要考单次函数调用的格式和参数, TAU 考多轮对话中与模拟用户和环境配合完成任务, 两者分数背离, 说明 2507 的工具调用格式已经稳定, 长程交互仍是短板.

两个脚注要带着读. Arena-Hardv2 标星号, 胜率由 GPT-4.1 评判, 2507 的 79.2 和其他列可比, 但不能和用其他裁判的 Arena-Hard 分数比. GPT-4o 的 Agent 列标井号, 用的是 GPT-4o-20241120, 因为拿不到 0327 版本的原生 function calling API, 这一列和表头写的版本并不一致.

## 2. 长上下文与部署

### 2.1. 长上下文: 原生 256K, 1M 靠 DCA 和 MInference

卡上写原生上下文 262,144, 可扩到 1,010,000. 到 1M 需要两项技术. **Dual Chunk Attention** 是一种不需训练的长度外推方法: 把长序列切成比预训练窗口短的块, 块内, 块间, 相邻块分别构造相对位置, 让每一对 token 的相对距离都落在模型训练时见过的范围里. **MInference** 是动态稀疏注意力, 只加速 prefill: 离线给每个 head 指定一种稀疏模式 (A-shape, vertical-slash, block-sparse), 推理时根据输入在线估计稀疏索引, 只算重要的部分. 卡上称接近 1M 时相对标准注意力最高约 3× 加速, 技术细节指向 Qwen2.5-1M 报告.

启用方法是用 `config_1m.json` 替换 `config.json`, 这个文件里带长度外推和稀疏注意力的配置. 卡上说跑 1M 总共需要约 1000 GB GPU 显存, 包括权重, KV cache 和峰值激活, 没有拆分. 可以粗算: 235B 参数按 BF16 每参数 2 字节, 权重约 470 GB; KV cache 按开源 config 的 head_dim=128, 每 token 是 94 层 × 4 个 KV head × 128 × 2 (K 与 V) × 2 字节, 约 188 KB, 1M token 约 190 GB (按 config 估算). 剩下的几百 GB 留给激活和框架开销. KV 只占两成左右, 这要归功于 KV head 只有 4 个.

### 2.2. RULER 表: 长度越长, 差距越大

卡上用 1M 版 RULER 测试, 全部开启 DCA, 每个长度 260 条样本 (13 个子任务, 每个 20 条). 表只列到 512k, 没有 1M 那一列. 平均分旧 non-thinking 83.9, 2507 全注意力 92.5, 稀疏注意力 91.7. 按长度看, 旧模型从 4k 的 97.7 降到 512k 的 74.4, 掉了 23.3 分; 2507 全注意力从 98.5 降到 90.9, 只掉 7.6 分 (按表计算). 两个模型在短长度上差不多, 差距几乎全在 128k 以后拉开.

稀疏与全注意力的对比也有细节. 16k, 32k, 64k 三格稀疏版反而略高 (如 64k 96.6 对 95.8), 384k 和 512k 稀疏版更低 (89.7 对 92.2, 89.5 对 90.9). **越长稀疏近似的误差越大**, 这符合预期; 短长度上稀疏略高, 可能在样本噪声范围内 (每格只有 260 条, 推测). 每格样本不多, 零点几分的差别不宜过度解读. 1M 处的准确率卡上没有给, 「支持 1M」 是部署能力的声明, 1M 上的效果这张表没有覆盖.

### 2.3. 部署参数与使用建议

vLLM 路线要装 nightly 版, 用 `VLLM_ATTENTION_BACKEND=DUAL_CHUNK_FLASH_ATTN`, `--max-model-len 1010000`, `--enable-chunked-prefill`, `--max-num-batched-tokens 131072`, `--enforce-eager` (关闭 CUDA graph, dual chunk attention 需要), `--max-num-seqs 1` (显存占用太大, 只跑一条序列), `--gpu-memory-utilization 0.85`, 张量并行 8. SGLang 路线用 `--attention-backend dual_chunk_flash_attn`, `--context-length 1010000`, `--mem-frac 0.75`, `--tp 8`, `--chunked-prefill-size 131072`. 排障分三类: KV cache 不够就降上下文或加并行度; CUDA OOM 说明激活显存不够, 要降 `gpu_memory_utilization` 或 `mem-frac`, 但这会挤占 KV; 输入过长就缩短输入或调大上限.

普通用法要求 transformers ≥ 4.51.0, 否则会报 `KeyError: 'qwen3_moe'`; 服务端要求 sglang ≥ 0.4.6.post1 或 vllm ≥ 0.8.5; 普通场景 OOM 时可先把上下文降到 32,768. 采样建议 Temperature 0.7, TopP 0.8, TopK 20, MinP 0, 和 Qwen3 报告里 non-thinking 的设置一致; presence_penalty 可在 0 到 2 之间调来抑制重复, 偏高可能导致语言混杂. Agent 用法推荐 Qwen-Agent, 它内置工具调用模板和解析器, 可以用 MCP 配置文件定义工具. 跑评测建议用提示统一格式: 数学题要求 `\boxed{}`, 选择题要求 JSON 的 `answer` 字段只填字母.

卡上没有的内容: 预训练是否重做, 后训练用了什么算法和数据, 为什么拆掉 thinking 模式, 1M 处的准确率, 显存的具体拆分. 需要这些信息, 要去 Qwen3 报告和 Qwen2.5-1M 报告里找, 或者等后续技术报告; 这张卡本身回答不了.
