---
title: "Qwen3: 一套权重里的思考与不思考"
category: "模型库"
tags: ["Qwen", "技术解析"]
published: true
excerpt: "Qwen3 是 6 档 Dense (0.6B 到 32B) 加 2 档 MoE (30B-A3B, 235B-A22B) 的一组开源权重, 旗舰 235B 总参, 每 token 激活 22B."
---
# Qwen3: 一套权重里的思考与不思考

来源: [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388) (arXiv:2505.09388v1, 2025-05-14). 仓库: https://github.com/QwenLM/Qwen3. 表内数字以源文 `qwen3.md` 为准, 英文原句对照开同目录 `qwen3-bi.md`.

Qwen3 是 6 档 Dense (0.6B 到 32B) 加 2 档 MoE (30B-A3B, 235B-A22B) 的一组开源权重, 旗舰 235B 总参, 每 token 激活 22B. 它最主要的变化在后训练: 把 thinking mode 和 non-thinking mode 收进同一套权重, 再用 thinking budget 在推理期控制思考 token 的多少. 这件事不是后训练单独做成的. 预训练先把数据从 Qwen2.5 的 18 万亿 token 扩到约 36 万亿, 语言从 29 种扩到 119 种, 并在第二阶段加重 STEM 与代码; 架构上 Dense 去掉 QKV-bias, 加 QK-Norm, MoE 去掉共享专家, 改用 global-batch 负载均衡; 后训练对旗舰走四段 (Long-CoT cold start, Reasoning RL, Thinking Mode Fusion, General RL), 对轻量档改走 Strong-to-Weak Distillation, 报告称只要四段流程约 1/10 的 GPU hours; 评测分 Base 与 Instruct 两套, Instruct 又按两种模式各出一张表. 下面按这条链把各部分怎样互相约束讲清楚.

机制单独成篇. GQA: [03-GQA-在性能与缓存之间折中](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/02-MQA与GQA-共享KeyValue头/02-MQA与GQA-共享KeyValue头.md). RoPE: [01-RoPE本体-旋转位置编码](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/01-RoPE本体-旋转位置编码/01-RoPE本体-旋转位置编码.md). YaRN: [03-长度外推：从PI到YaRN的频率扩展](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md). DCA: [05-DCA-双块注意力](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/04-DCA与S2-Attn-长上下文分块注意力/04-DCA与S2-Attn-长上下文分块注意力.md). SwiGLU: [03-GLU家族-从GLU到SwiGLU](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-激活函数/02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md). QK-Norm 相关的归一化: [归一化层](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.2-归一化层/2.1.2-归一化层.md). MoE: [01-DeepSeek-MoE](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). Scaling Laws: [3.2.6-Scaling-Law](../../../../llm-guide/3-预训练/3.2-预训练全流程/3.2.6-Scaling-Law/3.2.6-Scaling-Law.md). SFT: [4.2-SFT](../../../../llm-guide/4-后训练/4.2-SFT/4.2-SFT.md). GRPO: [02-GRPO](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md). PPO: [04-PPO](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md). 在线蒸馏: [4.6-OPD](../../../../llm-guide/4-后训练/4.6-OPD/4.6-OPD.md). 知识蒸馏: [6.3.3-知识蒸馏](../../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.3-知识蒸馏/6.3.3-知识蒸馏.md).

## 1. 定位与骨架

### 1.1. 从两条产品线到一套权重

Qwen2.5 那一代, 通用聊天和深度推理是两条线: Qwen2.5-Instruct 负责前者, QwQ-32B 负责后者. 用户要在两个端点之间切换. Qwen3 的摘要和引言反复强调的就是把这两条线并起来, 用户不必 「从 Qwen2.5 换到 QwQ」. 引言把 o3, DeepSeek-R1 列为 inference-time scaling 的背景, 这里的意思是 TestingTime: 推理时多花算力换更好的答案. Qwen3 的交付物仍是可下载的 Dense 与 MoE 权重, 外加一个统一的 chat template, 不是某种搜索式推理配方.

这一代没有换注意力算子. 没有 MLA, 没有 MTP 头, Dense 底盘仍是 GQA, SwiGLU, RoPE, pre-norm RMSNorm 的 decoder-only 结构. 真正的代际差别落在三处: 数据翻倍并加重推理类语料, MoE 路由的两处改动, 以及让一套权重同时服务两种模式的后训练. 三处之间有依赖: 后训练先要有一个推理能力够强的底座, 才谈得上把思考能力 「收放」; 而底座的推理能力, 很大一部分来自预训练第二阶段的数据配比.

许可是 Apache 2.0. 引言给出的旗舰数字是 thinking 模式下 AIME'24 85.7, AIME'25 81.5, LiveCodeBench v5 70.7, CodeForces 2056, BFCL v3 70.8. 这组数字全部来自 thinking 模式, 同一权重在 non-thinking 模式下的 AIME'24 是 40.1 (表 12). 引用时必须注明模式.

### 1.2. 注意力: 去掉 QKV-bias, 加上 QK-Norm

表 1 是 Dense 规格. 层数从 0.6B/1.7B 的 28 层到 32B 的 64 层. 注意力全程是 GQA, KV head 固定为 8, Q head 随规模增长: 小两档 16, 4B/8B 32, 14B 40, 32B 64. 于是每个 KV head 被共享的倍数从 2 涨到 8 (按表计算), 模型越大, KV cache 相对 Q 的压缩越狠. Tie Embedding 只在 0.6B, 1.7B, 4B 打开, 8B 起解开; 小模型的词表嵌入占总参比例高, 共享输入输出嵌入能省下可观的参数. 上下文 0.6B/1.7B 标 32K, 4B 及以上标 128K.

相对 Qwen2.5, 报告点名两处改动: 去掉 Qwen2 起用的 **QKV-bias**, 在注意力里加入 **QK-Norm**, 理由都是训练稳定. QK-Norm 出自 ViT-22B 的经验: 模型放大到约 8B 时, 注意力 logits 会失控增长, softmax 塌成近似 one-hot, 熵接近零, 训练随之发散; 解决办法是在点积之前分别对 query 和 key 做归一化, 把 logits 的量级压住. Qwen3 的开源实现里, 这一归一化是逐 head 的 RMSNorm, 作用在 head 维上, 位置在 RoPE 之前 (仓库实现, 非本报告). 写成式子, 每个 head 的打分从 $q^\top k/\sqrt d$ 变成
$$s=\frac{\big(\gamma_q\odot\hat q\big)^\top\big(\gamma_k\odot\hat k\big)}{\sqrt d},\qquad \hat q=\frac{q}{\mathrm{RMS}(q)},\ \hat k=\frac{k}{\mathrm{RMS}(k)}.$$
$\hat q, \hat k$ 的均方根恒为 1, 范数固定为 $\sqrt d$, 于是在 $\gamma$ 不动时 $|s|\le\sqrt d\cdot\max|\gamma_q|\max|\gamma_k|$; 原式里 $q, k$ 的范数可以随训练一起涨, logits 没有上界, 这正是 softmax 塌成 one-hot 的来路. 可学的 $\gamma_q, \gamma_k$ 把温度交还给模型, 但要把 logits 推大必须显式改这两组逐维系数, 不能再靠激活值漂移. 去掉 bias 也是 ViT-22B 与 PaLM 一路的做法.

这两处改动的证据形态要看清: 报告只写 「为了稳定训练」, 没有给出有无 QK-Norm 的 loss 曲线或消融. 对读者来说, 它们更像大模型训练的标准配置, 而不是新的注意力机制. 对部署侧, QK-Norm 多了两次逐 head 归一化, 计算量可以忽略, 但做量化或自定义 kernel 时要记得这一步在 RoPE 前面, 顺序和 Llama-4 的做法不同.

### 1.3. MoE: 128 选 8, 不再有共享专家

表 2 是 MoE 规格. 30B-A3B 是 48 层, Heads 32/4; 235B-A22B 是 94 层, Heads 64/4. 两档都是 128 个专家, 每 token 激活 8 个, 上下文 128K. MoE 与 Dense 共用同一套注意力积木, 差别在 FFN 是否专家化. 注意 MoE 的 KV head 是 4, 比 Dense 的 8 更少, 235B 每个 KV head 被 16 个 Q head 共享 (按表计算).

相对 Qwen2.5-MoE, 报告写了两处变化. 一是沿用细粒度专家切分, 但取消 **shared experts**, 128 个专家全部参与路由. 二是改用 **global-batch load balancing loss**. 负载均衡损失的标准形式是 $N_E \sum_i f_i p_i$, 其中 $f_i$ 是专家 $i$ 被选中的频率, $p_i$ 是它的平均门控分. 常见训练框架在每个 micro-batch 内算 $f_i$, 而大模型的 micro-batch 往往只有几条序列, 结果近似于要求每条序列内部都把 token 平均分给所有专家; 一条纯代码序列也得均匀路由, 专家就很难专门化. global-batch 的做法是跨并行组同步 $f_i$, 在全局批次上算均衡, 只要求语料整体均衡 (Qiu et al., 2025, 该文作者与 Qwen3 团队重叠, 实验规模到 42.8B 总参与 400B token). 两种做法的差别只落在 $f_i$ 这一项的统计范围上 (Qwen3 报告只点名方法, 下面按 Qiu et al. 的写法):
$$\mathcal{L}_{bal}=N_E\sum_{i=1}^{N_E}f_i\,p_i,\qquad f_i^{\text{micro}}=\frac{1}{|B_m|}\sum_{x\in B_m}\mathbb 1[i\in\mathrm{TopK}(x)],\qquad f_i^{\text{global}}=\frac{1}{|B_g|}\sum_{x\in B_g}\mathbb 1[i\in\mathrm{TopK}(x)].$$
$p_i$ 仍在本地算, 梯度也只经 $p_i$ 回传; 改的只是 $f_i$ 从本卡 micro-batch $B_m$ 的计数换成 all-reduce 后全局批次 $B_g$ 的计数. 惩罚项在所有 $f_i$ 相等时最小, micro 版要求几条序列内部就摊平, global 版只要求整个全局批次摊平, 一条纯代码序列把 token 集中给 「代码专家」 不再受罚, 只要别的序列把其他专家用上.

两处改动是配套的. 共享专家原本承担 「所有 token 都要用的通用知识」, 去掉之后, 通用能力要么分摊到多个路由专家, 要么由路由自己学出来; 放松后的均衡约束给了路由这种自由. 风险是路由崩塌, 即少数专家被过度使用, 或者专家学成相似副本. Qwen3 报告没有给专家利用率直方图, 路由熵曲线或无共享专家的消融, 这一面本页没有; 支撑这套设计的只有 Base 表上的激活参效率. 词表是 BBPE 151,669, 全系列统一.

激活比例可以按表粗算. 专家层面是 8/128, 即 6.25%; 但整体激活参比例, 30B-A3B 是 3/30 约 10%, 235B-A22B 是 22/235 约 9.4% (按表计算). 两个比例的差, 来自注意力, 嵌入和归一化这些每个 token 都要走的稠密部分 (推算, 报告没有拆分参数). 这也说明 「激活参」 不等于 「专家参乘以 8/128」, 估算推理成本时要把稠密部分算进去. 另外, 总参决定显存, 激活参决定每 token 的计算量, 235B 的权重即使只激活 22B, 部署时也要全部装进显存或做专家卸载.

## 2. 预训练

### 2.1. 预训练数据: 36T 从哪里来

§3.1 的数据故事分三层. 第一层是量: 约 36 万亿 token, 相对 Qwen2.5 约两倍 token, 三倍语言数, 覆盖代码, STEM, 推理, 书籍, 多语文本与合成数据. 第二层是新增来源: 用微调过的 Qwen2.5-VL 对大量 PDF 类文档做文字识别, 再用 Qwen2.5 精炼, 得到 「数万亿」 高质量 token; 用 Qwen2.5, Qwen2.5-Math, Qwen2.5-Coder 合成教科书, 问答, 指令, 代码片段, 同样是 「数万亿」 量级, 覆盖几十个领域. 报告没有给这两类来源的精确 token 数, 也没有给合成数据在 36T 里的占比.

第三层是配比方法. 报告建了一个多语数据标注系统, 给超过 30 万亿 token 打教育价值, 领域, 主题, 安全等标签, 再在细粒度标签上用小代理模型做大量消融, 在**样本级** (instance-level) 优化配比. 报告特意和此前在数据源或领域级别调配比的工作 (DoReMi 等) 做了区分. 这是 Qwen2.5 「过滤器加重采样」 的延续, 粒度更细.

这一层对后面的影响要连起来看. 上一代的 Math 和 Coder 专模在这里被当作数据生成器, 通用底座的数学与代码密度因此上来了, Base 表上 STEM 与代码的跨代提升最明显 (见第 2.3 节). 代价是分布可能向生成器的偏好靠拢; 报告用样本级标注和过滤来对冲, 但没有给保留率, 去重率或合成数据消融, 这一面本页没有.

### 2.2. 三阶段日程与超参预测

§3.2 把预训练分成三段. S1 通用阶段: 超过 30T token, 序列长 4,096, 覆盖全部 119 种语言, 目标是语言能力与世界知识. S2 推理阶段: 提高 STEM, 代码, 推理和合成数据比例, 再训约 5T 更高质量 token, 序列长仍是 4,096, 并加快学习率衰减. 长文阶段: 数百亿 token, 序列长 32,768, 其中 75% 的文本长度在 16,384 到 32,768 之间, 25% 在 4,096 到 16,384 之间.

长文阶段沿用 Qwen2.5 的做法, 用 **ABF** 把 RoPE base 从 10,000 调到 1,000,000, 推理期再叠加 YaRN 和 DCA, 报告称序列容量约再乘 4. 附录 RULER 评测用的就是 YaRN scaling_factor=4, 32,768 乘 4 正好到 128K (按配置计算), 这和表 1 中 4B 及以上标 128K 对得上; 0.6B/1.7B 标 32K, 说明小两档没有按这个外推口径标注. 训练段只到 32K, 128K 能力靠推理期外推, 选型时要把 「训练过的长度」 和 「声明的长度」 分开.

三段的数据量级差别很大. 按报告的量级, S1 超过 30T, S2 约 5T, 长文阶段只有数百亿, 长文段约占总量的千分之一到千分之三 (按 「数百亿」 对 36T 估算). 长上下文能力主要靠 RoPE base 调整和少量长文本 「唤醒」, 而不是大规模长文本训练. 另一个细节是 S2 「加快学习率衰减」: 学习率在推理数据上快速降下来, 相当于把最后一段退火留给高质量 STEM 与代码数据, 这与很多报告在退火期上调高质量数据比例的做法一致. 衰减曲线的具体形状报告没有给.

超参方面, 报告沿用 Qwen2.5 的思路, 针对三个阶段分别建立 Scaling Laws, 研究架构, 数据, 训练阶段与最优学习率, batch size 之间的关系, 再为每个 Dense 或 MoE 模型设定预测出的最优值. 这里的 Scaling Laws 用于部署前的超参选择, 不是在预测最终性能. 具体的拟合公式, 各档学习率与 batch 数值, 总训练 FLOPs 报告都没有给, 这一面本页没有.

### 2.3. Base 评测: 协议与没赢的格子

Base 评测用 15 个基准, shot 设置各不相同: MMLU, MMLU-Redux, MMLU-Pro, SuperGPQA, GPQA 用 5-shot (后三者带 CoT), BBH 3-shot CoT, GSM8K 与 MATH 4-shot CoT, EvalPlus 与 MultiPL-E 0-shot, MBPP 3-shot, CRUX-O 1-shot, MGSM 8-shot CoT, MMMLU 与 INCLUDE 5-shot. 报告称所有模型走同一评测管线. 这组设定和 Qwen2.5 报告不完全一样, 跨报告比分数要小心.

旗舰 235B-A22B-Base 在表 3 里对 DeepSeek-V3-Base 赢 14/15, 唯一输的是 INCLUDE (73.46 对 75.17), 而且比 Llama-4-Maverick 的 73.47 也低 0.01. 它用的总参约为 V3 的 1/3, 激活参约为 2/3. 对上代 Qwen2.5-72B-Base 全部 15 项领先, 激活参不到 1/3. 提升最大的格子在 MMLU-Pro (68.18 对 V3 的 59.84), EvalPlus (77.60 对 63.75) 和 MATH (71.84 对 62.62), 正好是 S2 加重的方向.

32B-Base 在表 4 里对上代 72B-Base 赢 10/15, 输的五格是 MMLU, MMLU-Redux, MATH (61.62 对 62.12), MMMLU 和 INCLUDE, 按表逐格核对与正文一致. 但正文说 32B-Base 在全部 15 项上超过 Llama-4-Scout-Base, 按表 INCLUDE 是 67.87 对 68.09, 这一格并没有赢, 以表为准应是 14/15; 同一格也低于 Gemma-3-27B 的 68.94. 多语知识类的 INCLUDE 是 Qwen3 在 Base 表上反复失手的格子.

14B-Base 对 Qwen2.5-14B 和 Gemma-3-12B 全部 15 项领先, 按表核对成立. 30B-A3B-Base 只激活约 3B, 对 Qwen2.5-14B 全部领先; 对同代 14B Dense 是 10 胜 5 负, 输在 GSM8K, MATH, EvalPlus, CRUX-O, MGSM, 集中在数学与代码; 对 Qwen2.5-32B 输 7 格 (按表计算). 所谓 「1/5 激活参追平同代 Dense」, 在数学推理上还差一截. 边侧 8B-Base 对 Qwen2.5-14B 赢 10 格, 输的是 MMLU, MMLU-Redux, GSM8K, MMMLU, INCLUDE, 知识类仍吃参数. 表 8 里 Gemma-3-1B 的 GSM8K 只有 2.20, MGSM 1.74, 远低于同档, 可能是 few-shot 格式不适配 (推测), 这一列不宜当作能力对照.

小档还有一处正文与表对不上. 总结段说 Qwen3-1.7B/4B/8B/14B/32B-Base 分别与 Qwen2.5-3B/7B/14B/32B/72B-Base 相当, 边侧段又说 8B/4B/1.7B 在过半基准上超过 Qwen2.5-14B/7B/3B. 但表 8 里 1.7B 的对照只有 Qwen2.5-1.5B 和 Gemma-3-1B, 没有 Qwen2.5-3B; Qwen2.5-3B 只出现在表 7 作为 4B 的对照. 所以 「1.7B 超过 Qwen2.5-3B」 在本报告的表里无法核对. 能核对的是 4B 对 Qwen2.5-7B: 15 项里只输 MMLU (72.99 对 74.16), 赢 14 项 (按表计算), 比正文说的 「过半」 更强. 1.7B 对 Qwen2.5-1.5B, 0.6B 对 Qwen2.5-0.5B 则是全部领先, 0.6B 的 GSM8K 从 41.62 升到 59.59, BBH 从 20.30 升到 41.47.

## 3. 后训练四段与蒸馏

### 3.1. 后训练总图与 Long-CoT cold start

图 1 把旗舰后训练画成四段. 前两段专攻 thinking: **Long-CoT cold start** 和 Reasoning RL; 后两段把 non-thinking 融进来: Thinking Mode Fusion 和 General RL. §4 开头写了两个目标: Thinking Control, 即开不开思考, 想多深; Strong-to-Weak Distillation, 即小模型不必各自重跑四段. 顺序是先把思考能力做强, 再教模型也能直接答. 反过来做, non-thinking 数据容易冲淡刚学到的长 CoT.

cold start 的数据构造分两轮过滤. 查询过滤用 Qwen2.5-72B-Instruct: 去掉难以验证的题, 包括含多个子问题的题和泛文本生成题; 去掉不用 CoT 也能答对的题, 防止模型靠表面猜测; 再给每条查询标领域, 保持领域平衡. 响应过滤在留出验证集后进行: 用 QwQ-32B 每题采 N 条, QwQ 一直做不对的题交人工判断; 对 Pass@N 为正的题, 剔除六类响应: 答案错, 大量重复, 明显靠猜, 思考与总结不一致, 语言混杂或风格突变, 疑似与验证集过于相似.

这一段的目标写得很克制: 植入基础推理模式, 不追求即时推理分数, 样本数和训练步数都尽量少, 把提升空间留给 RL. 这和 「SFT 数据越多越好」 的直觉相反, 理由是 cold start 太强会把策略锁死, RL 阶段难以探索. 六条剔除规则里, 「思考与总结不一致」 和 「语言混杂」 直接服务于后面的 Fusion: 如果 cold start 就允许思考块和最终答案各说各的, 后面的模板分隔学到的也是脏格式. 数据条数, 步数, 人工判断占比, 报告都没有给.

### 3.2. Reasoning RL: 3,995 道题, 170 步

Reasoning RL 的 query-verifier 对要满足四条: cold start 没用过; 对 cold start 模型可学; 尽可能难; 覆盖广泛子领域. 最终收集 3,995 对, 用 **GRPO** 更新参数. 这个数量很小, 说明这一段依赖的是题目难度和采样量, 而不是题量. 四条标准里的 「可学」 和 「尽量难」 互相牵制: 太难的题整组 rollout 全错, GRPO 的组内相对优势为零, 没有梯度.

报告给了几条训练经验: 大 batch, 每条查询高 rollout 数, 用 off-policy 训练提高样本效率; 控制熵让它稳步上升或保持稳定, 以平衡探索与利用. 结果是一次 RL 运行中训练奖励和验证分一起上涨, 不需要人工调超参. 例证是 235B-A22B 的 AIME'24 在 170 步内从 70.1 升到 85.1. 最终表 11 报的是 85.7, 略高于 RL 段末尾, 说明后两段对这一格基本没有伤害, 和表 22 里 32B 的轻微下降略有不同.

具体的 batch 大小, rollout 数, 学习率, KL 系数, 熵控制的实现方式, 报告都没有给, 这一面本页没有. 读者可以记住的是配方的形状: 少量难题, 高采样, 熵受控. GRPO 本身的组内优势推导见文首单独成篇.

### 3.3. Thinking Mode Fusion: 模板, 开关与预算

Fusion 在 Reasoning RL 模型上做继续 SFT. thinking 数据由 Stage 2 模型自己对 Stage 1 查询做拒绝采样生成, 这样新数据的分布就是刚训好的推理策略本身, 不会被外部教师冲掉. non-thinking 数据覆盖代码, 数学, 指令遵循, 多语, 创意写作, 问答, 角色扮演, 用自动生成的 checklist 评估响应质量, 并特意提高翻译任务比例, 照顾低资源语言.

chat template 的设计见表 9. 用户查询或 system message 里带 `/think` 或 `/no_think` 标志; non-thinking 样本的回复里保留一个**空的思考块**, 保证格式一致, 部署侧直接在模板里拼一个空思考块就能禁止思考. 默认是 thinking 模式, 所以训练里加了一些不带 `/think` 的 thinking 样本. 多轮对话里随机插入多个开关, 模型以最后一个为准. Hugging Face 模板里对应的参数是 `enable_thinking=False`.

**thinking budget** 是这一段顺带得到的能力. 模型学会两种模式后, 自然能处理中间状态, 也就是基于不完整的思考作答. 实现方式是: 思考长度达到用户设定的阈值时, 人工中断思考, 插入一句停止指令 「Considering the limited time by the user, I have to give the solution based on the thinking directly now.」 并接上 `</think>`, 模型随后基于已有推理给出答案. 报告强调这种能力没有专门训练. 图 2 在数学, 代码, STEM 四个基准上展示, 随预算增加, 235B-A22B 的分数平滑上升, 并预期输出超过 32K 后还会继续涨. 图上的具体刻度正文没有写, 引用曲线时只能读图.

### 3.4. General RL: 20 多类任务, 三种奖励

General RL 的奖励系统覆盖超过 20 类任务, 每类有定制评分标准, 目标能力分五组: 指令遵循 (内容, 格式, 长度, 结构化输出); 格式遵循 (响应 `/think` 与 `/no_think` 开关, 用 `<think>` 与 `</think>` 分隔思考与回答); 偏好对齐 (开放问题上的有用性, 参与感与风格); Agent 能力 (通过指定接口调用工具, rollout 中允许完整多轮交互并拿到真实环境反馈); 特定场景, 例如 RAG 任务里用奖励引导准确回答, 减少幻觉.

奖励分三种. **规则奖励**在推理 RL 里已广泛使用, 这里也用于指令遵循和格式, 精度高, 能防 reward hacking. 带参考答案的模型奖励: 给每条查询配参考答案, 让 Qwen2.5-72B-Instruct 按参考打分, 适合没有严格格式的任务, 避免规则奖励的假阴性. 无参考答案的模型奖励: 用人类偏好数据训练奖励模型输出标量分, 覆盖面最广, 用于提升参与感和有用性.

这一段用什么 RL 算法, 报告没有写明; 三种奖励如何加权, 各任务的数据量, 训练步数也都没有给. 可以确定的是, 格式遵循被当作一类任务单独奖励, 这是双模式能在一套权重里稳定共存的关键: 第 4.2 节表 22 里 ThinkFollow 从 88.7 升到 98.9, 主要就发生在这一段.

### 3.5. Strong-to-Weak Distillation: 1,800 对 17,920 GPU hours

蒸馏覆盖 5 个 Dense (0.6B, 1.7B, 4B, 8B, 14B) 和 30B-A3B. 第一步 off-policy: 把教师在 `/think` 和 `/no_think` 下的输出混在一起做响应蒸馏, 让学生先学会基本推理和模式切换. 第二步 **on-policy**: 采样 prompt, 让学生自己以两种模式之一生成回复, 再把学生的 logits 对齐教师 (Qwen3-32B 或 Qwen3-235B-A22B), 最小化 KL 散度. 哪个学生配哪个教师, 报告没有逐档说明. 两步的差别可以落到同一个损失上看:
$$\mathcal{L}=\mathbb{E}_{x,\ y\sim\pi_{\text{gen}}(\cdot\mid x)}\sum_{t}\mathrm{KL}\big(\pi_T(\cdot\mid x,y_{<t})\,\|\,\pi_S(\cdot\mid x,y_{<t})\big).$$
on-policy 步里 $\pi_{\text{gen}}=\pi_S$, 前缀由学生自己采样, 教师在学生实际走到的前缀上给出整个词表的分布, 学生犯错之后的位置也有监督. off-policy 步报告称为 「response distillation」, 前缀来自教师, 按字面理解监督信号是教师写出的文本, 相当于把上式换成在教师回复上做 $-\sum_t\log\pi_S(y_t\mid x,y_{<t})$; 学生只见过教师走的路, 自己一偏离就没有监督. 报告只说 「最小化 KL」, KL 的方向和是否逐 token 求和没有写, 上式的方向是按常见实现写的.

表 21 在 8B 上做了对照, 起点都是同一个 off-policy 蒸馏检查点, 只用数学和代码查询. 继续做 RL: AIME'24 从 55.0 到 67.6, 花 17,920 GPU hours; 改做 on-policy 蒸馏: 到 74.4, 只花 1,800 GPU hours, 约为前者的 1/10 (按表计算). 括号里的 pass@64 更能说明问题: RL 之后 AIME'24 与 AIME'25 的 pass@64 保持在 90.0 与 83.3, 完全没动; 蒸馏之后升到 93.3 与 86.7. 报告据此说教师 logits 能扩大学生的探索空间, 而 RL 只是把已有的正确答案采得更准.

这个对照有两处限定. 一是 RL 分支从同一个 8B 检查点出发, 没有更强的模型可依赖, 蒸馏分支则有 32B 或 235B 教师, 两者的信息来源不对等, 比的是 「有教师时怎么用最划算」. 二是只比了数学代码, 通用能力上蒸馏是否同样占优, 表 21 没有回答. 结论可以这样读: 旗舰已经花大钱把能力练出来之后, 小模型走蒸馏既便宜又更好; 小模型双模式的主要来源是这条蒸馏线, 不是缩小版的四段 RL.

蒸馏的效果在 Instruct 表上可以横向验证. 30B-A3B 与 14B 都是蒸馏出来的学生, 一个是约 3B 激活的 MoE, 一个是 14B Dense. thinking 模式下两者在 AIME'24 (80.4 对 79.3) 和 LiveCodeBench (62.6 对 63.5) 上几乎打平, CodeForces 则是 MoE 明显更高, 1974 对 1766 (表 15). 边侧 8B thinking 的 AIME'24 76.0, 高于 DeepSeek-R1-Distill-Qwen-32B 的 72.6 (表 17); 后者也是蒸馏出来的, 差别在 Qwen3 有 on-policy 一步, R1-Distill 只做了 SFT 式的响应蒸馏 (R1 报告信息). 不过 Multi-IF 上两者差距极大, 8B 是 71.2, R1-Distill-32B 只有 31.3, 这更多反映训练数据的多语覆盖, 不是蒸馏方式本身.

## 4. 评测与代价

### 4.1. Instruct 评测: 两套模式, 两套表

§4.6 为两种模式设了不同的采样超参. thinking: temperature 0.6, top-p 0.95, top-k 20, 只在 Creative Writing v3 和 WritingBench 上加 presence penalty 1.5. non-thinking: 0.7 / 0.8 / 20, presence penalty 1.5. 最大输出默认 32,768, AIME 放到 38,912. AIME 每题采 64 次取平均, GPQA-Diamond 采 10 次. CodeForces 每题最多生成 8 次独立尝试. BFCL 全部用 FC 格式, 多轮评测用 YaRN 扩到 64k; 部分基线取自 BFCL 榜单, 在 FC 与 Prompt 两种格式中取较高分, 这对基线是有利的口径. LiveCodeBench 在 thinking 模式下去掉了 「只返回程序」 的限制, 让模型自由思考.

旗舰 thinking (表 11) 对 DeepSeek-R1 赢 17/23, 激活参约为 R1 的 60%, 总参约 35%. 输的六格是 MMLU-Redux (92.7 对 92.9), GPQA-Diamond (71.1 对 71.5), C-Eval, Creative Writing, INCLUDE (78.7 对 82.7), MMMLU, 按表核对与 17 胜一致; 输的集中在知识和多语知识, 赢的集中在数学, Agent, 代码. 对 Gemini2.5-Pro, 旗舰在 AIME'24 (85.7 对 92.0), GPQA-Diamond (71.1 对 84.0) 上差距明显. 旗舰 non-thinking (表 12) 对 GPT-4o-2024-11-20 赢 18/23, 输在 IFEval, Creative Writing, BFCL (68.0 对 72.5), INCLUDE, MMMLU.

两张旗舰表对照着读, 能看出哪些能力依赖思考. 对齐类几乎不依赖: Arena-Hard thinking 95.6, non-thinking 96.1; AlignBench 8.94 对 8.91; IFEval 83.4 对 83.2. 知识类依赖很小: MMLU-Redux 92.7 对 89.2. 数学与代码依赖极大: AIME'25 81.5 对 24.7, LiveCodeBench 70.7 对 35.3, CodeForces 2056 对 1387. 所以聊天和写作流量关掉思考几乎没有损失, 而数学代码关掉思考会掉一大半. 这正是一套权重双模式在产品上的意义: 按请求类型决定是否付思考 token 的成本.

32B thinking (表 13) 对 QwQ-32B 赢 17/23, 输的六格里包括 CodeForces (1977 对 1982) 和 MATH-500 (97.2 对 98.0), 这两格恰好是 QwQ 的强项. 30B-A3B thinking (表 15) 以约 3B 激活参在 AIME'24 上拿到 80.4, 高于 QwQ-32B 的 79.5. 小档里有几格反常值得记下: 表 18 中 4B non-thinking 的 ZebraLogic 是 35.2, 高于 8B 的 26.7; 表 19 中 0.6B thinking 的 AIME'25 (15.1) 高于 AIME'24 (10.7). 报告没有解释, 可能是小模型在这些题上方差大 (推测).

### 4.2. 阶段消长与长上下文的代价

表 22 用 Qwen3-32B 看 Stage 2, 3, 4 各阶段的变化, 除公开基准外加了四个内部基准: CounterFactQA (识别反事实问题, 不编答案), LengthCtrl (按目标长度写作, 按长度差计分), ThinkFollow (多轮随机插入开关, 看能否正确切换), ToolUse (单轮, 多轮, 多步工具调用的意图, 格式, 参数准确率). Stage 3 之后 ThinkFollow 是 88.7, 仍会偶尔切错; thinking 侧 CounterFactQA +10.9, LengthCtrl +8.0. Stage 4 把 ThinkFollow 推到 98.9, ToolUse thinking 侧 +15.1, non-thinking 侧 +13.3.

代价也写在同一张表里. AIME'24 thinking 从 Stage 2 的 83.8 降到 Stage 3 的 81.9, 再到 Stage 4 的 81.4; LiveCodeBench 从 68.4 降到 65.7; MMLU-Redux, GPQA-Diamond 基本持平. 报告推测原因是**更宽的通用任务稀释了处理难题的专门能力**, 并明确表示接受这一折中. 所以 Qwen3-32B 的最终 thinking 分数, 比它在 Reasoning RL 结束时的峰值略低.

同一张表里, 两种模式在 Stage 3 的横向差别也值得看. non-thinking 的 LengthCtrl 是 84.9, 远高于 thinking 的 70.6; CounterFactQA non-thinking 64.3, 也高于 thinking 的 61.3. 按长度写作和识别反事实问题, 不思考反而更好. 一个可能的解释是, 长思考会让模型在写作前 「规划」 出超出要求的内容, 或在反事实前提上顺着推下去 (推测). 到 Stage 4, thinking 侧的 LengthCtrl 升到 73.5, non-thinking 侧到 87.3, 差距仍在. 反过来, non-thinking 的 AIME'24 在 Stage 4 只从 28.5 升到 31.0, General RL 并不能替代思考本身.

附录表 23 的 RULER 给出长上下文的另一面代价. non-thinking 模式下 Qwen3 普遍优于同档 Qwen2.5, 235B 平均 95.0, 128K 为 90.6. thinking 模式下 (预算设为 8192) 分数下降: 235B 平均 92.2, 8B 从 89.1 降到 84.4. 报告的解释是检索类任务不依赖推理, 思考内容反而干扰检索. 但并非每格都降: 4B 在 64K 上 thinking 是 83.0, 高于 non-thinking 的 77.8, 128K 也略高. 另一处反常是 non-thinking 的 32B 平均 93.7, 低于 14B 的 94.6, 也低于 Qwen2.5-72B 的 95.1, 报告没有讨论.

## 5. 多语覆盖, 边界与谱系位置

多语评测拆成四类: 指令遵循 Multi-IF (8 种语言), 地区知识 INCLUDE (44 种), 通用知识 MMMLU (14 种, 去掉未优化的 Yoruba), 数学 MT-AIME2024 (55 种) 与 PolyMath (18 种), 逻辑 MLogiQA (10 种). INCLUDE 和 MMMLU 为省时间只抽了原数据的 10%. 附录按语种给分表, 并用 Belebele 的 80 种语言按语族汇总. 119 种是预训练覆盖声明, 分表显示高资源语言更强, 低资源与非拉丁文字仍有落差. 模式开关对跨语数学的影响和英文一样大: 旗舰 MT-AIME2024 thinking 80.8, non-thinking 32.4.

报告没有写的内容: 预训练总 FLOPs 与集群规模, 各阶段学习率与 batch 数值, 专家利用率, 合成数据占比, General RL 的算法与奖励权重, 蒸馏的教师配对表. 结论只列了三个方向: 更高质量更多样的预训练数据, 为压缩和超长上下文改进架构与训练方法, 加大面向环境反馈的 Agent RL 算力. 这些是方向, 没有新的规格.

放回谱系里看, Qwen3 继承了 Qwen2.5 的 Dense 梯子, 样本级数据配比和 Scaling Laws 超参预测, 把 QwQ 的推理能力并入主线, 并把 MoE 从 「共享专家加路由专家」 改成全路由加全局均衡. 同期 DeepSeek-R1 走的是先训强推理模型再蒸馏小模型的路线, Qwen3 的不同在于旗舰先统一两种模式, 再把两种模式一起蒸给下游. 选型可以按场景分: 聊天流量用 `/no_think`, 竞赛与长推理打开 thinking 并调高预算, 纯检索的长文任务反而应关掉 thinking; 总参放得下但希望按激活参付推理成本, 选 30B-A3B; 不想上 MoE 路由又要在 32B 附近拿到 QwQ 级推理, 选 32B Dense.
