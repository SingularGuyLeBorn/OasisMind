---
title: "Qwen3-Next-80B-A3B-Instruct: 3:1 混合注意力与 512 专家的首发模型卡"
category: "模型库"
tags: ["Qwen", "技术解析"]
published: true
excerpt: "Qwen3-Next 是 Qwen3 之后一条新的架构线, 首发型号 80B-A3B. 模型卡开头讲的动机是: 总参数和上下文长度都在变大, 要靠架构提高 scaling 效率."
---
# Qwen3-Next-80B-A3B-Instruct: 3:1 混合注意力与 512 专家的首发模型卡

> 公开材料是 Hugging Face 上 `Qwen/Qwen3-Next-80B-A3B-Instruct` 的模型卡 (12 页), 有四条架构亮点, 一张规格表, 一张 24 行对照表, 一张 RULER 表和部署说明. 没有 Gated DeltaNet 的更新公式, 没有路由与负载均衡细节, 没有 15T 预训练数据的配比, 也没有后训练配方.

来源: `qwen3-next.md` (Hugging Face 模型卡的 MinerU 转写). 表内数字以源文 qwen3-next.md 为准.

Qwen3-Next 是 Qwen3 之后一条新的架构线, 首发型号 80B-A3B. 模型卡开头讲的动机是: 总参数和上下文长度都在变大, 要靠架构提高 scaling 效率. 给出的改动有四条: Gated DeltaNet 加 Gated Attention 的混合注意力, 高稀疏度 MoE, 零中心并加 weight decay 的 layernorm 等稳定性手段, 以及 MTP. 规格表写得很细, 能据此估算显存和计算; 训练侧只有 「预训练 15T token 加后训练」 一句. 这张卡交付的是 Instruct 权重, 只有 non-thinking 模式, 输出里不会出现 `<think></think>` 块.

机制单独成篇. Gated DeltaNet 与线性注意力: [01-Kimi-Delta-Attention-KDA](../../../../llm-guide/2-核心原理与架构/2.5-线性注意力与状态空间模型/2.5.1-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md). Gated Attention: [06-Gated-Attention](../../../../llm-guide/2-核心原理与架构/2.2-注意力机制/2.2.2-多头注意力变体/05-Gated-Attention-SDPA输出门控/05-Gated-Attention-SDPA输出门控.md). MoE: [01-DeepSeek-MoE](../../../../llm-guide/2-核心原理与架构/2.6-MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). MTP: [2.4.6-多Token预测MTP深度解析](../../../../llm-guide/2-核心原理与架构/2.8-其他架构方向/2.8.1-多Token预测MTP/2.8.1-多Token预测MTP.md). YaRN: [03-长度外推：从PI到YaRN的频率扩展](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md). 后续架构: [qwen3-8-flash-next-analysis](../qwen3-8-flash-next/qwen3-8-flash-next-analysis.md).

## 1. 架构与训练

### 1.1. 层布局: 36 层 GDN, 12 层 Gated Attention

规格表的核心是一行布局: `12 * (3 * (Gated DeltaNet -> MoE) -> 1 * (Gated Attention -> MoE))`. 共 48 层, 隐藏维度 2048, 每四层里三层用 **Gated DeltaNet** (GDN), 一层用 **Gated Attention**, 每层的 token 混合后面都接 MoE. 按字面计, GDN 36 层, Gated Attention 12 层. GDN 是线性注意力的一种, 用固定大小的矩阵状态压缩前缀, 按 delta rule 先擦除旧关联再写入新关联, 计算随长度线性增长; Gated Attention 是标准 softmax 注意力, 保留逐 token 的精确检索. 模型卡没有给 GDN 的更新式, 机制细节见上面的单独成篇.

Gated Attention 一侧: Q 头 16, KV 头 2, head dim 256, RoPE 只作用在其中 64 维上. 16 × 256 = 4096, 比隐藏维度 2048 还宽. 这里的 「Gated」 指 SDPA 输出之后乘一个由 query 决定的 sigmoid 门再进输出投影; 按 transformers 和 vLLM 的实现, Q 投影同时输出 query 和门两份通道 (仓库实现, 非本模型卡). 提出这个设计的论文 (Qiu 等, NeurIPS 2025) 在 30 种门控变体里发现 SDPA 输出后的逐头 sigmoid 门效果最好, 能缓解 attention sink 和激活离群值, 也更耐大学习率. GDN 一侧: V 头 32, QK 头 16, head dim 128, 两个 V 头共用一组 QK, 类似 GQA 的分组.

### 1.2. MoE: 512 选 10 加 1 个共享专家

MoE 一侧有 512 个专家, 每 token 激活 10 个, 另有 1 个**共享专家**, 专家中间维度 512. 路由专家的激活比例约 2.0% (10/512); 作为对比, Qwen3-235B-A22B 是 128 选 8, 约 6.25% (按 Qwen3 报告规格). 模型卡说的 「extreme low activation ratio」 指的就是这一点. 总参 80B, 激活 3B, 非 embedding 参数 79B, 整体激活比例约 3.75%.

规格可以自洽地核对一下. 每个专家按 SwiGLU 三个矩阵算是 3 × 2048 × 512 ≈ 3.1M 参数, 512 个专家约 1.61B, 48 层约 77B, 加上注意力和 GDN 的参数, 和 79B 的非 embedding 参数量对得上 (按估算). 每 token 实际经过 11 个专家, 48 层合计约 1.7B, 再加上注意力, GDN 投影和 embedding, 接近 3B 激活. 路由方式, 是否用辅助负载均衡损失, 共享专家的中间维度, 模型卡都没写.

### 1.3. 显存与长上下文的代价

混合结构对推理的影响主要在 KV cache. 只有 12 层 Gated Attention 需要随长度增长的 KV cache, 每 token 是 12 层 × K/V 两份 × 2 个 KV 头 × 256 维 × 2 字节 ≈ 24KB, 原生 262,144 长度约 6.4GB, 1M 长度约 25GB (按 BF16 估算). Qwen3-235B-A22B 有 94 层, 每层 4 个 KV 头, head dim 128, 每 token 约 188KB, 是 Qwen3-Next 的 7.8 倍 (按 Qwen3 报告规格估算). 36 层 GDN 的状态大小固定, 每层 32 个 V 头 × 128 × 128, 共约 1,900 万个数, 与序列长度无关.

权重本身 BF16 约 160GB (按每参数 2 字节估算), 所以部署示例都用 4 卡张量并行. 模型卡还提醒, 默认上下文 256K 时服务可能起不来, 可以降到 32768. 模型卡给出的 Base 模型对比是: 相对 Qwen3-32B-Base, 下游更好, 总训练成本约 10%, 32K 以上上下文推理吞吐约 10 倍. 32B 是稠密模型, 每 token 算 32B 参数且 64 层都有 KV cache, 3B 激活加 12 层 KV cache 带来十倍吞吐是合理的量级. 这句对比没有附具体的测量条件.

### 1.4. 训练与稳定性: 模型卡只写了名字

训练侧能确认的只有: 预训练 15T token, 然后后训练. Qwen3 的预训练是 36T token, Qwen3-Next 用了不到一半 (按两份材料对比). 数据来源, 配比, 训练阶段划分, 后训练用了哪些算法, 这一页没有.

稳定性一条点名了 「**zero-centered and weight-decayed layernorm**」. 按 transformers 的实现, 零中心的意思是归一化层的缩放权重初始化为 0, 实际缩放为 1 + weight, 这样再对权重加 weight decay, 就会把有效缩放往 1 拉, 而不是往 0 拉, 防止归一化层权重无限增长 (仓库实现, 非本模型卡). 后来的 Qwen3.8-Flash-Next 技术报告也写明沿用了 Qwen3-Next 的零中心 RMSNorm. MTP 一条说能提升预训练表现并加速推理, 但 Quickstart 里写明 Hugging Face transformers 一般不支持 MTP, 要用 SGLang 或 vLLM 才能用上, 吞吐提升也高度依赖实现. MTP 的深度和接受长度模型卡没有给.

## 2. 评测与长上下文

### 2.1. 对照表: 3B 激活追 235B, 追上了一部分

对照表 24 行, 四列: Qwen3-30B-A3B-Instruct-2507, Qwen3-32B Non-Thinking, Qwen3-235B-A22B-Instruct-2507, Qwen3-Next-80B-A3B-Instruct. 对激活参数相同的 30B-A3B-2507, Qwen3-Next 24 行里赢 23 行, 只有 Creative Writing v3 更低 (85.3 对 86.0). 对 235B-2507, 只赢 4 行: LiveBench (75.8 对 75.4), LiveCodeBench v6 (56.6 对 51.8), Arena-Hard v2 (82.7 对 79.2), WritingBench (87.3 对 85.2); TAU1-Airline 打平 (44.0); 其余 19 行落后 (按表计算). 模型卡说 「在某些基准上持平」, 按表看这个说法是准确的, 不能读成整体持平.

**落后最多的是 agent 组**. TAU2-Retail 57.3 对 74.6, TAU2-Telecom 13.2 对 32.5, TAU1-Retail 60.9 对 71.3, 这几格 Qwen3-Next 和 30B-A3B-2507 (57.0, 12.3, 59.1) 几乎一样, 离 235B 很远. TAU2-Telecom 上它甚至低于 32B Non-Thinking 的 24.6. Aider-Polyglot 也差得多 (49.8 对 57.3). 知识和推理组则比较接近: MMLU-Pro 80.6 对 83.0, AIME25 69.5 对 70.3, HMMT25 54.1 对 55.4. 多轮工具调用这类任务似乎更依赖激活参数量, 总参数带来的知识容量帮不上太多 (推测). Arena-Hard v2 的分数是 GPT-4.1 评判的胜率, 和其他行的准确率不是同一种度量.

### 2.2. 长上下文: 原生 256K, 用 YaRN 到 1M

原生上下文 262,144, 模型卡说用 **YaRN** 验证到约 1M. 开法有两种: 在 config.json 里加 `rope_scaling` (`rope_type: yarn`, `factor: 4.0`, `original_max_position_embeddings: 262144`), 或者给 vLLM/SGLang 传命令行参数. 262,144 × 4 ≈ 1,048,576, 规格表写的是 1,010,000. 模型卡特别提醒, 主流框架实现的都是 static YaRN, 缩放因子不随输入长度变化, 可能影响短文本表现, 所以只在需要长上下文时才加; 如果常用长度是 524,288, factor 设 2.0 更合适. YaRN 只作用在 12 层 Gated Attention 的 RoPE 上, GDN 层没有位置编码需要外推.

RULER 1M 版的表很有信息量. 平均分 Qwen3-Next 91.8, 235B-2507 92.5, 30B-A3B-2507 86.8. 但分长度看, 在原生 256K 以内, 4K 两者打平 (98.5), 8K 到 256K 的八档里 Qwen3-Next 有七档高于 235B, 只有 192K 略低 (94.0 对 94.5), 128K 上是 96.0 对 93.9, 256K 上是 93.5 对 91.0. 超过 256K 开启 YaRN 以后, 384K 是 91.7 对 92.2, 512K 是 86.9 对 90.9, 下降得比 235B 快, 平均分就是被这两档拉下来的. 表只列到 512K, 768K 和 1M 这一页没有. 还要注意协议不同: Qwen3-Next 开 YaRN, 2507 模型开 Dual Chunk Attention, 每个长度 260 个样本 (13 个子任务各 20 个), 这张表比较的是两套不同的长上下文方案, 不是同一内核下的架构对比.

## 3. 部署建议与谱系位置

部署要求: transformers 需要 main 分支 (旧版会报 `KeyError: 'qwen3_next'`), sglang ≥ 0.5.2, vllm ≥ 0.10.2, 可选装 flash-linear-attention 和 causal-conv1d 加速. 采样建议 Temperature 0.7, TopP 0.8, TopK 20, MinP 0; presence_penalty 可在 0 到 2 之间调来抑制重复, 太高可能出现语言混杂. 输出长度建议 16,384. 跑评测建议数学题加 "逐步推理并把答案放进 `\boxed{}`", 选择题要求在 JSON 的 answer 字段只填选项字母. Agent 场景推荐 Qwen-Agent 配合 MCP 或内置工具.

在 Qwen 谱系里, Qwen3-Next 是混合注意力路线的起点. 3:1 的 GDN 与 Gated Attention 布局后来被 Qwen3.5 用到 397B-A17B 旗舰上, Qwen3.8-Flash-Next 又在这个骨架上加了稀疏注意力, 加宽残差和 n-gram embedding. 模型卡能说明的是这条路线的第一步已经能用 3B 激活, 15T token 在大部分知识和推理题上接近 235B, 长上下文检索在原生长度内更好; 多轮 agent 任务仍明显落后, 这一短板后面几代是否补上, 要看各自的材料.
