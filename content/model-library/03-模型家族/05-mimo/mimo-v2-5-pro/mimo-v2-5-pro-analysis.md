---
title: "MiMo-V2.5-Pro: 把 Flash 的配方放大到 1T, 滑窗比例改成 6:1"
category: "模型库"
tags: ["MiMo", "技术解析"]
published: true
excerpt: "MiMo-V2.5-Pro 是 1.02T 总参, 42B 激活的 MoE, 沿用 MiMo-V2-Flash 的滑窗加全局注意力混合结构与 3 层 MTP, 混合比从 5:1 改到 6:1, 70 层里只有 10 层存完整 KV, 上下文 1M. 后训练仍是 SFT, 分域 RL 教师, MOPD 三步."
---
# MiMo-V2.5-Pro: 把 Flash 的配方放大到 1T, 滑窗比例改成 6:1

材料是小米 MiMo 团队 2026-04-27 的 MiMo-V2.5-Pro 发布页和 HuggingFace 上 `XiaomiMiMo/MiMo-V2.5-Pro` 的模型卡, 没有单独的技术报告; 机制背景取自 MiMo-V2-Flash 技术报告 (arXiv 2601.02780), 后续对照取自 MiMo-V2.6 技术报告. V2.5-Pro 的骨干, MTP 和后训练范式都来自 Flash, 要看的问题是这套配方放大到 1T 并把滑窗比例改成 6:1 之后, 结构, KV 和分数各变成什么样.

## 1. 谱系与规模

### 1.1. 从 Flash 到 Pro

MiMo 线从 MiMo-7B 起步 (arXiv 2505.07608). 那是一个从零预训练 25T token 的 7B 稠密推理模型, 目标是验证 7B 底座经过 RL 能否把数学和代码抬到 o1-mini 一档, 正式 RL 版 AIME 2025 得 55.4. 家族后来的几块地基都在这一篇里: 推理密度导向的语料流水线, 训练时单层, 推理时多层的 MTP 用法, 以及负责 rollout 调度的 Seamless Rollout 引擎. 见 [MiMo-7B 解读](../mimo-7b/mimo-7b-analysis.md).

MiMo-V2-Flash 第一次做成大规模 MoE: 309B 总参, 15B 激活, 48 层, 256 个路由专家激活 8 个, 预训练 27T token. Flash 的积木各有来路. 滑窗注意力来自 Longformer, 局部与全局交替的混合结构在 Gemma 系列里常见; 可学习的 attention sink 按 gpt-oss 的实现; MoE, MTP 与 FP8 混合精度的组合沿 DeepSeek-V3 的路子; 多教师在线蒸馏建立在 GKD 和 Thinking Machines 的 on-policy distillation 上; R3 (Rollout Routing Replay) 是同队的另一篇论文. 详见 [MiMo-V2-Flash 解读](../mimo-v2-flash/mimo-v2-flash-analysis.md).

发布页说 V2.5-Pro 继承 Flash 的 hybrid attention 和 MTP, 后训练沿用三步范式. 前代 MiMo-V2-Pro 在发布页对照表里标的也是 1.02T / 42B, 所以 V2.5-Pro 相对前代没有换规模. 往后看, V2.6 报告的 Pro 档同样是 1.02T / 42B, 70 层 (60 SWA, 10 GA), 384 个专家激活 8 个, 预训练 30T token, 其中文本阶段 27T, 和 V2.5-Pro 的 27T 相同. V2.6 是否直接从 V2.5-Pro 的预训练检查点继续, 两份材料都没明说, 但规模, 层数和文本数据量都对得上.

### 1.2. 和 V2.5 对比

模型卡给了 V2.5-Pro 和同期 V2.5 的结构对照:

| 项 | V2.5-Pro | V2.5 |
|---|---|---|
| 隐藏维 | 6144 | 4096 |
| 层数 | 70 (1 稠密 + 69 MoE) | 48 (1 稠密 + 47 MoE) |
| GA 层 / SWA 层 | 10 / 60 | 9 / 39 |
| 注意力头 | 128 | 64 |
| 头维 (QK / V) | 192 / 128 | 192 / 128 |
| 路由专家 / 每 token 激活 | 384 / 8 | 256 / 8 |
| 专家中间维 | 2048 | 2048 |
| 稠密 FFN 中间维 (第 0 层) | 16384 | 16384 |
| MTP 层数 | 3 | 3 |

V2.5 的层数, 层型和专家数都和 Flash 相同, 是 Flash 骨干接上视听编码器的版本. V2.5-Pro 在三个方向上放大: 隐藏维从 4096 到 6144, 层数从 48 到 70, 专家从 256 到 384. 专家中间维, 头维, 每 token 激活的专家数都没变. 按总参折算, V2.5-Pro 每 token 激活约 $42/1020\approx4.1\%$, Flash 约 $15/309\approx4.9\%$; 路由专家的激活比例从 $8/256\approx3.1\%$ 降到 $8/384\approx2.1\%$ (推导). 模型放大时, 小米选择加专家数, 不加每个专家的宽度, 也不加激活个数.

两档都没有共享专家, 只在第 0 层放一个稠密 FFN. Flash 报告没有给去掉共享专家的消融, 但给了 SFT 阶段监控专家负载的指标: 梯度为零的参数个数 num-zeros, 上升说明有专家拿不到 token, 下降说明过拟合. 没有共享专家兜底时, 路由一旦塌缩就没有备用支路, 这类负载监控更要紧. 到 V2.6, Pro 档的 RL 在第 9 层出现了路由漂移, 前 20 步冷专家占比从 0.5% 涨到 22%, 最后的处理是 RL 期间冻结 router.

## 2. 混合注意力与 MTP

### 2.1. 滑窗加 sink

SWA 层的查询只和最近 128 个 token 做注意力, GA 层和全部前文做注意力. 窗口压到 128 靠的是 attention sink. StreamingLLM 观察到, softmax 要求权重和为 1, 当前查询没有真正相关的键时, 模型会把多余的权重倒在开头几个 token 上. 滑窗把开头的 token 挡在窗外, 多余的权重只能分给窗内不相关的 token. gpt-oss 的做法是给每个头加一个可学习标量, 作为额外一列 logit 放进 softmax 分母. Flash 报告式 (2)–(4) 写成:

$$
s_{ij}=\frac{\exp(a_{ij}-m_i)}{\exp(\mathrm{sink}-m_i)+\sum_{j'}\exp(a_{ij'}-m_i)},\qquad o_i=\sum_j s_{ij}v_j
\tag{1}
$$

其中 $a_{ij}=q_ik_j^\top/\sqrt d$, $m_i=\max\left(\max_j a_{ij},\mathrm{sink}\right)$ 只用来防溢出. sink 只在分母里, 不对应任何 value. 把权重加起来:

$$
\sum_j s_{ij}=1-p_i^{\mathrm{sink}},\qquad p_i^{\mathrm{sink}}=\frac{e^{\mathrm{sink}}}{e^{\mathrm{sink}}+\sum_{j'}e^{a_{ij'}}}
\tag{2}
$$

窗内所有键的 logit 都明显低于 sink 时, $p_i^{\mathrm{sink}}\to1$, $o_i\to0$, 这个头这一步基本不输出; 没有 sink 时, 128 个键再不相关也得把权重分完. 背景见 [StreamingLLM 与 Attention Sink](../../../../llm-guide/2-核心原理与架构/2.7-长上下文与外推技术/2.7.2-KV缓存压缩与淘汰/01-StreamingLLM与Attention-Sink/01-StreamingLLM与Attention-Sink.md).

### 2.2. Flash 的消融

窗口能压到 128 的依据是 Flash 报告在 32B 稠密代理模型上的消融. 不带 sink 时, 窗口 128 全面掉分, MMLU 54.9, 全 GA 基线 57.3; 加 sink 后 MMLU 58.3, 反超全 GA. 长上下文上, 窗口 128 加 sink 在 GSM-Infinite 17.3, NoLiMa 51.2, MRCR 34.4, 优于或持平全 GA; 窗口 512 加 sink 反而在 NoLiMa (38.5) 和 MRCR (19.6) 上明显变差. 报告给的解释有两条, 都是经验性的: 小窗口有正则化作用; 窗口越小, SWA 层和 GA 层的分工越清楚, 长程依赖全部交给 GA.

这组消融只做到 5:1, 309B 的 Flash 也没有重跑全表. V2.5-Pro 把比例推到 6:1, 70 层里 GA 只占 1/7, 发布页说 sink 保住了性能, 但没有给 1T 规模上 5:1 和 6:1 的对比.

### 2.3. KV 降多少

模型卡写 SWA 和 GA 都用 8 个 KV 头, V2.6 报告 Pro 档的 Tab. 1 也是 SWA 和 GA 都为 128/8 头. 每层每个 token 存的 K 和 V 元素数是 KV 头数乘 $(192+128)$, 即 $8\times320=2560$. 序列长 $L$ 时 (推导):

$$
\mathrm{KV}_{\mathrm{Pro}}(L)=10\times2560\,L+60\times2560\times\min(L,128)
\tag{3}
$$

$L=1{,}048{,}576$ 时第一项约 268 亿个元素, 第二项约 1,966 万, 只占第一项的 0.07%. 如果 70 层全用同配置的 GA, 是 $70\times2560\,L$, 和第一项之比正好是 7. 发布页的 「nearly 7×」 和层数比一致.

同样的算法用在 Flash 上: Flash 的 GA 层只有 4 个 KV 头, SWA 层 8 个, 48 层里 9 层 GA, 相对全 GA 是 $48/9\approx5.3$ 倍. Flash 报告摘要写的是 「nearly 6×」, 按 5:1 的块模板算是 6 倍, 但首层从 SWA 换成了 GA, 逐层数是 39:9; 「nearly 6×」 应是按模板说的, 没有扣首层. V2.5-Pro 的 60:10 恰好是 6:1, 层数比和模板比没有这个差. 按式 (3), 1M 上下文时单条序列的 KV 用 BF16 存约 54GB, 用 FP8 存约 27GB (推导, 未计 MTP 层).

和 Flash 比, Pro 的 GA 层数从 9 加到 10, 每层 GA 的 KV 头从 4 加到 8, 每个 token 在 GA 层的 KV 元素数从 $9\times1280=11{,}520$ 涨到 $10\times2560=25{,}600$, 约 2.2 倍 (推导). 总参放大 3.3 倍, 长上下文 KV 只放大 2.2 倍. 换个角度看, 6:1 省下的是层数, 每层 GA 本身反而变宽了: Flash 给 GA 层 4 个 KV 头, 是因为 GA 层的缓存随序列增长, SWA 层多给几个头几乎不占显存; Pro 两类层都是 8 个 KV 头, 发布页没有解释这处改动.

这个思路和 DeepSeek 一路的 MLA 是两种降 KV 的办法. MLA 把每个 token 的 K 和 V 压进 512 维左右的潜空间, 所有层仍看全序列; MiMo 让多数层只看 128 个 token, 远距离只交给少数全局层. 前者每层都省, 后者只让少数层花钱; MiMo 的代价是远程信息只能经过 10 层 GA 传递. 对照表里的 DeepSeek V4 Pro 走第三条路, 用 CSA 和 HCA 沿序列维把 KV 压到 1/4 和 1/128, 1M 上下文下 KV 约为 V3.2 的 10%. 三家都把 1M 当目标, 省 KV 的位置各不相同, 见 [DeepSeek-V4 解析](../../01-deepseek/deepseek-v4/deepseek-v4-analysis.md).

### 2.4. 长上下文

正式版 1M, Base 256K, 发布页和 V2.5 同一个模式, 扩展发生在哪个训练阶段两份材料都没写. Flash 报告的做法可以参考: 原生 32K 预训练, 然后扩到 256K, GA 层的 RoPE 频率底数从 640K 调到 5M.

模型卡给了 GraphWalks 的分长度结果. 前代 V2-Pro 在 1M 上掉到 0.00; V2.5-Pro 在 512K 上 BFS 0.56, Parents 0.92, 在 1M 上 0.37 和 0.62. GraphWalks 要求模型在上下文里给出的图上做广度优先搜索或找父节点, 考的是对远处多个位置的精确检索和组合. 在这类任务上, 1M 长度的信息全部要靠 10 层 GA 拿, 0.37 和 0.62 说明 1M 窗口能用, 但比 512K 明显下降.

Flash 报告的 Base 模型长上下文表给过同一结构 「掉得慢」 的证据. GSM-Infinite Hard 从 16K 到 128K, Flash 从 37.7 降到 29.0, Kimi-K2-Base 从 34.6 降到 8.8, DeepSeek-V3.1-Base 从 41.5 降到 28.7, 用稀疏注意力的 DeepSeek-V3.2-Exp 从 50.4 降到 25.7. V3.2-Exp 短长度最高, 到 128K 掉得最多. 这张表的对照模型最大长度都不到 256K, 证据只覆盖到 128K; V2.5-Pro 在 1M 上的表现, 目前只有 GraphWalks 这一组数.

### 2.5. MTP: 3 层草稿与吞吐

MTP 模块有 3 层, 用稠密 FFN, 发布页说它 「natively integrated for training and inference」, 输出吞吐 「roughly tripling」, 并加速 RL rollout. Flash 报告给了同结构的实测: 每层约 0.33B, 稠密 FFN 加 SWA; 3 层 MTP 接受长度最高约 3.6; 固定 16K 输入, 1K 输出时, 相对无 MTP 加速 1.82× 到 2.70×, 随接受长度近似线性上升.

线性关系可以从投机解码的成本结构看出来 (按 Flash 报告 Table 10 推导). 一次投机步平均产出 $L_{\mathrm{accept}}$ 个 token, 代价是 3 层草稿加主模型一次并行校验, 相对一次普通解码步的耗时记作 $1/c_B$, 只和 batch 有关, 不随接受长度变:

$$
\mathrm{speedup}\approx c_B\,L_{\mathrm{accept}}
\tag{4}
$$

Flash 的表里 $c_B$ 在 0.65 到 0.70 之间. 要达到 3 倍, 按 $c_B=0.70$ 需要接受长度约 4.3, 超过 3 层 MTP 的上限 4 (3 个草稿全接受再加校验自带的 1 个) (推导). 所以 「约三倍」 要么是在 $c_B$ 更高的配置下测的, 要么是按别的口径算的, 发布页没有给测试条件, 只能当产品口径读.

接受长度又和任务有关. Flash 报告的 Figure 7 用 next-token 交叉熵 $x$ 拟合平均接受长度 $y$:

$$
y=4\left(1-0.58\,x^{0.58}\right),\qquad R^2=0.995
\tag{5}
$$

$x=0$ 时 $y=4$, 正是 3 层 MTP 的上限. 低熵任务 (如网页开发) 接受长, 高熵任务 (如 MMLU-Pro 一类知识问答) 接受短. 反解式 (5), 接受长度 3.6 对应 $x\approx0.048$, 2.8 对应 $x\approx0.32$ (推导). 发布页的 「约三倍」 没说在哪类任务上测, 按式 (5), 换一类任务, 接受长度和吞吐倍数都会变. 模型卡的 SGLang 部署示例用 EAGLE 投机解码, 步数为 3, 和 MTP 层数相同.

MTP 用在 RL 上的理由来自 Flash 报告: on-policy 训练的小 batch 吃不满 GPU, 长尾序列到最后 batch 趋近 1, 多 token 草稿能补回算术强度. 到 V2.6, RL rollout 换成 DFlash 块扩散草稿模型, 一次出一整块草稿, 报告称平均接受长度比 MTP 高 31.3%. MTP 的一般机制见 [多 Token 预测 MTP](../../../../llm-guide/2-核心原理与架构/2.8-其他架构方向/2.8.1-多Token预测MTP/2.8.1-多Token预测MTP.md), 投机解码见 [投机解码原理与应用](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/01-投机解码原理与应用/01-投机解码原理与应用.md).

## 3. 预训练与后训练

### 3.1. 预训练与 Base 模型

预训练 27T token, FP8 混合精度, 原生序列 32K, 和 Flash 报告的 27T 相同. Flash 的 27T 分三段 (22T, 4T, 1T), 语料偏向仓库级代码和长程依赖. V2.5-Pro 的数据配比发布页只有总数.

模型卡给了 Base 模型的对照, 选几行:

| 基准 | V2.5-Pro Base | V2.5 Base | DeepSeek-V4-Pro Base | DeepSeek-V4-Flash Base | Kimi-K2 Base |
|---|---|---|---|---|---|
| MMLU | 89.4 | 86.3 | 90.1 | 88.7 | 87.8 |
| MMLU-Pro | 68.5 | 65.8 | 73.5 | 68.3 | 69.2 |
| GPQA-Diamond | 66.7 | 58.1 | - | - | 48.1 |
| GSM8K | 99.6 | 83.3 | 92.6 | 90.8 | 92.1 |
| MATH | 86.2 | 67.7 | 64.5 | 57.4 | 70.2 |
| LiveCodeBench v6 | 39.6 | 35.5 | - | - | 26.3 |
| SWE-Bench AgentLess | 35.7 | 30.8 | - | - | 28.2 |
| C-Eval | 91.5 | 88.6 | 93.1 | 92.1 | 92.5 |

数学和代码是 V2.5-Pro Base 拉开差距的地方: MATH 86.2 比 DeepSeek-V4-Pro Base 高 21.7, GSM8K 99.6 接近满分, SWE-Bench AgentLess 35.7 比 Kimi-K2 Base 高 7.5. 知识类基准反过来: MMLU-Pro 68.5 低于 DeepSeek-V4-Pro Base 的 73.5, C-Eval 91.5 低于三家对照. 中文基准偏弱这一点和 Flash Base 相同, Flash 的 C-Eval 和 CMMLU 也都低于三家对照. 相对 V2.5 Base, 放大后 GSM8K 涨 16.3, MATH 涨 18.5, GPQA-Diamond 涨 8.6, MMLU 只涨 3.1. 各家 Base 的 few-shot 设置模型卡没有逐项列出, 跨家比较只作参考.

### 3.2. 后训练三步与 V2.6 的改动

发布页的三步: SFT 建立指令遵循; 分域训练, 各领域教师分别做 RL, 点名了数学, 安全, 智能体工具调用; 最后 MOPD, 一个学生在自己的 rollout 上接受各领域教师的 token 级指导, 合成统一模型. 这和 Flash 报告的 Figure 3 一一对应.

Flash 报告给了 MOPD 的形式. 逐 token 的 reverse KL 取负当作优势, 再叠加结果奖励 (ORM) 的优势, 训练和推理引擎的概率比越界的 token 置零 (Flash 报告式 (7)–(9)):

$$
\mathcal{L}_{\mathrm{MOPD}}(\theta)=-\mathbb{E}_{x,\,y\sim\mu_\theta}\left[\frac{1}{|y|}\sum_{t=1}^{|y|}w_t\,\hat A_{\mathrm{MOPD},t}\log\pi_\theta(y_t\mid x,y_{<t})\right]
\tag{6}
$$

$$
\hat A_{\mathrm{MOPD},t}=\mathrm{sg}\left[\log\frac{\pi_{\mathrm{domain}_x}(y_t\mid x,y_{<t})}{\pi_\theta(y_t\mid x,y_{<t})}\right]+\alpha\hat A_{\mathrm{ORM}}
\tag{7}
$$

$\pi_{\mathrm{domain}_x}$ 是 prompt $x$ 所属领域的教师. 教师项的符号由师生在这个 token 上的概率比决定: 学生给 0.1, 教师给 0.5, 该项是 $\log5\approx1.61$, 推高这个 token; 学生给 0.4, 教师给 0.05, 是 $\log0.125\approx-2.08$, 压低它. $w_t=\mathrm{sg}[\pi_\theta/\mu_\theta]$, 越出 $[\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}}]$ 置 0; $\pi_\theta$ 和 $\mu_\theta$ 是同一组参数在训练引擎和推理引擎里算出的概率, $w_t$ 量的是两个引擎的数值差. 在 MoE 上, 两个引擎还可能选出不同的专家, R3 在训练时重放 rollout 记下的专家选择来对齐.

Flash 报告的 RL 系统还有两块和长程任务直接相关. Data Scheduler 按历史通过率做动态采样, 给空闲的 GPU 派新 prompt; 超长轨迹用 partial rollout 切成多步, 同时限制陈旧度和每批 partial 样本的比例, 用考虑陈旧度的截断重要性采样补偿. Toolbox 是集中的资源分配器, 在并发任务之间执行工具的配额和 QPS 限制, 用容错的 Ray actor 池消除冷启动. 上万个环境同时调用搜索, 代码执行, 网页渲染, 任何一个工具卡住都会拖住一批 rollout, 这两块解决的是这个问题. MiMo-7B 那一代不做异步训练, Flash 开始接受有限的陈旧, V2.6 放宽到最多落后 4 个策略版本. Flash 的 Table 7 显示 MOPD 后数学, 代码, SWE 基本追平或超过最佳教师, 搜索智能体没追上 (BrowseComp 45.4 对 SFT 教师 51.7). 机制见 [MOPD 多教师在线蒸馏](../../../../llm-guide/4-后训练/4.9-OPD/4.9.1-OPD方法与落地/09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md).

发布页的 Frontier Coding 一段说代码能力的进一步提升来自 「scaling post-training compute」, 教师数量, RL 算法和超参都没给. 这一段配的评测是内部的 MiMo Coding Bench, 衡量模型在 Claude Code 一类 agentic 框架里做编程任务的能力, 覆盖仓库理解, 项目构建, 代码审查, 结构化产物生成, 规划和 SWE; 图题是「缩小与 Opus 4.6 的差距」, 也就是说在这套内部基准上 V2.5-Pro 仍低于 Opus 4.6. 发布页同时点名了 Claude Code, OpenCode, Kilo 三个可接入的 scaffold.

分域 RL 的环境在 Flash 报告里有交代, V2.5-Pro 的智能体能力就建在这些环境上. 代码智能体用真实 GitHub 仓库搭可执行环境, 约 120K 个, 系统提示刻意最简, 只经 shell 和后端交互; 终端任务从 Stack Overflow 和 Stack Exchange 选题, 改写成带 Dockerfile 和测例的任务, 过滤后约 30,000 条; 网页开发用 Playwright 把生成的页面录成视频, 交给多模态判别器打分; 搜索智能体只有 search, open, find 三个工具; 函数调用在合成的应用环境里训, 工具之间既有显式的数据依赖, 也有要推断的隐藏状态. Flash 报告附录 B 还记了一处漏洞: 官方 SWE-Bench 镜像没清干净未来的提交, RL 中模型会学会用 git 翻出答案, Flash 的处理是自建训练镜像修掉这个问题. 到 V2.6, 防线扩成断网, 截断 Git 历史, 专门的 Hack Agent 和在线清零四层.

到了 V2.6, 报告保留了骨干, 把后训练改成 「三轴放大 RL」. 三条轴是: 更大的 batch 和更高的吞吐 (异步训练, 每步 1,568 个 prompt, 2.7B 到 3.7B token); 更多样的环境 (代码, 通用, 视觉, 网络安全四域, 混用多种 harness); 更多的 grader 算力 (组内比较的 agentic grading, 并把模型推向更短的解). 分域 RL 训教师换成一次混合任务 RL, 难以验证的领域交给 MOPD2 的 SFT 教师; MOPD2 从教师轨迹切出历史前缀, 学生只采当前一轮. Pro 的 RL 花了约 260 万美元. 这些改动在 V2.5-Pro 上都还没有, 详见 [MiMo-V2.6 解读](../mimo-v2-6/mimo-v2-6-analysis.md).

## 4. 长程案例与评测

### 4.1. 长程案例

发布页用三个案例展示长程能力. SysY 编译器来自北大编译原理课程项目, 用 Rust 从零实现词法分析, 语法分析, AST, Koopa IR 生成, RISC-V 后端和性能优化, 发布页说参考项目通常要本科生几周. 模型用 4.3 小时, 672 次工具调用, 课程隐藏测试 233/233. 过程是分层推进的: Koopa IR 110/110, RISC-V 后端 103/103, 性能 20/20, 三项相加正好 233. 第一次编译就过了 137/233 (约 59%); 第 512 轮的一次重构让两个测试回退, 模型定位后恢复.

视频编辑器: 几条简单提示后交付可运行的桌面应用, 有多轨时间线, 剪辑, 交叉淡化, 混音和导出, 8,192 行代码, 1,868 次工具调用, 11.5 小时; 演示视频里的 AI 旁白由 MiMo-V2-TTS 生成. 模拟电路 FVF-LDO: 在 TSMC 180nm 工艺上从零设计, 模型要定功率管尺寸, 调补偿网络, 选偏置电压, 让相位裕度, 线性调整率, 负载调整率, 静态电流, PSRR, 瞬态响应六项同时达标, 发布页说训练有素的模拟设计师做同规模项目通常要几天; harness 是 Claude Code 加 ngspice 仿真闭环, 约一小时全部达标, 图中展示的四项相对模型自己的初稿提升约一个数量级. 初值和终值只画在图里, 正文没有数值表.

发布页把这些表现归结为 「harness awareness」: 用满 harness 提供的能力, 管理自己的记忆, 按最终目标控制上下文里放什么. 它还说配上合适的 harness, V2.5-Pro 能撑起超过一千次工具调用的长程任务, agentic 场景里对上下文中细小约束的遵循也更稳. 三个案例都是单次演示, 没有重复次数和失败率, 能说明能力的上限, 不能当受控评测读.

「管理记忆, 控制上下文」 在 Flash 报告的附录 C 里有一套具体做法. 扩充侧把工具, 文档, 数据库统一暴露成文件, 让模型用 Bash 去检索; 压缩侧在上下文占用超过阈值 (低至 30%) 时让模型写摘要, 完整历史归档到可检索的记忆文件, 活跃上下文换成摘要. Flash 报告称这在 Deep Research 类任务上稳定带来 5–10% 的准确率提升, 按 DeepSeek 式的激进重置策略复现后, BrowseComp 从 45.4 到 58.3. 发布页没说三个案例里用的是哪种上下文管理, 但 「harness awareness」 指的很可能就是这类能力. 这也说明同一份权重换个 harness, 分数能差很多, 比较不同模型的智能体分数时, harness 要对齐.

### 4.2. 发布页对照表与 token 效率

| 基准 | V2.5-Pro | V2-Pro | DeepSeek V4 Pro | Kimi K2.6 | GLM 5.1 |
|---|---|---|---|---|---|
| GDPVal-AA (Elo) | 1581 | 1426 | 1554 | 1480 | 1535 |
| $\tau^3$-bench | 72.9 | 64.5 | 71.8 | 71.0 | 70.6 |
| Claw-Eval (pass^3) | 63.8 | 57.8 | 59.8 | 62.3 | 62.7 |
| HLE 带工具 / 不带工具 | 48.0 / 34.0 | 40.0 / 28.0 | 48.2 / 37.7 | 54.0 / 34.7 | 52.3 / 31.0 |
| SWE-Bench Pro | 57.2 | 55.0 | 55.4 | 58.6 | 58.4 |
| SWE-bench Verified | 78.9 | 78.0 | 80.6 | 80.2 | - |
| Terminal-Bench 2.0 | 68.4 | 57.1 | 67.9 | 66.7 | 69.0 |
| FrontierSWE (Impl., 排名) | #3.4 | #5.0 | - | - | - |

对照模型的规模: DeepSeek V4 Pro 1.6T / 49B, 按最高推理档评; Kimi K2.6 1T / 32B; GLM 5.1 744B / 40B. V2.5-Pro 在 GDPVal-AA, $\tau^3$-bench, Claw-Eval 三项智能体基准上最高. 其余几项不占优: HLE 带工具 48.0 低于 Kimi 的 54.0 和 GLM 的 52.3, 不带工具 34.0 低于 DeepSeek 的 37.7 和 Kimi 的 34.7; SWE-bench Verified 低于 DeepSeek 和 Kimi; SWE-Bench Pro 低于 Kimi 和 GLM; Terminal-Bench 2.0 低于 GLM. 相对前代, 涨得最多的是 Terminal-Bench 2.0 (+11.3), $\tau^3$-bench (+8.4) 和 HLE 带工具 (+8.0), SWE-bench Verified 只涨 0.9. 规模没变, 这些涨幅都来自训练. FrontierSWE 一行给的是名次, 数值越小越靠前, 带小数, 发布页没解释是怎样平均出来的, 只能看出比前代前进了 1.6 名.

token 效率另有一张图. 发布页的散点图横轴是每条轨迹的平均 token 数 (输入加输出), 纵轴是 ClawEval Pass^3. V2.5-Pro 约 64% 时每条轨迹约 70K token, 发布页称比 Claude Opus 4.6, Gemini 3.1 Pro, GPT-5.4 在相近能力下少用约 40–60% 的 token. 表里同一项是 63.8, 64% 是取整. 对按 token 计费的智能体任务, 每条轨迹的 token 数直接决定成本, 这和分数一样是产品指标. V2.6 的 grader 有一项就是把模型推向更短的解, 方向一致.

### 4.3. V2.6 报告的重测

V2.6 报告的 Tab. 3 用一批更新的基准重测了 V2.5-Pro: DeepSWE v1.1 19.0, ProgramBench 12.5, AutomationBench 16.0, Terminal Bench 2.1 65.2, Terminal Bench 4.0 1.5, Toolathlon-Verified 49.1, Agents' Last Exam 13.2, GDPval-AA 2.1 1107, CyberGym 40.0, MiMo Cyber Bench 0.0. GDPval-AA 2.1 的 1107 和发布页的 GDPVal-AA 1581 版本不同, 不能直接比.

这组数要分开读. 网络安全并非空白: CyberGym 是漏洞复现, V2.5-Pro 有 40.0, 为 0 的只有内部的 MiMo Cyber Bench. DeepSWE 的 19.0 和 Terminal Bench 4.0 的 1.5 很低, 但和第 4.1 节的长程案例并不矛盾: 案例是自选任务的单次演示, DeepSWE 是固定任务集上的统计结果, 两者衡量的范围不同. V2.6-Pro 在 DeepSWE 上到 71.9, 前后骨干相同, 差距来自 mid-training 和覆盖这类环境的三轴 RL. 这些新基准对上一代接近空白区, 19.0 到 71.9 的涨幅有一部分是从不会到会, 不宜当成同一条能力曲线上的进步比例.

## 5. 部署与结论

### 5.1. 部署与计费

权重, tokenizer 和完整模型卡以宽松许可放在 HuggingFace, 模型卡有 SGLang 和 vLLM 的部署指南. SGLang 示例用 16 卡张量并行, 16 路专家并行, 2 路数据并行注意力, EAGLE 投机解码 3 步, 上下文长度 1,048,576; 推荐采样 temperature 1.0, top-p 0.95. 模型卡写明权重是 FP8 (E4M3) 混合精度. 1.02T 参数按 FP8 存约 1TB, 再加上式 (3) 的 KV, 示例按 16 卡张量并行部署 (推导).

发布页同时说 API 和 AI Studio 全量上线, 价格和前代 Pro 相同, 模型名换成 `mimo-v2.5-pro`. Token Plan 支持 V2.5, V2.5-Pro, V2.5-TTS, 所有上下文窗口统一倍率, V2.5 为 1 倍, V2.5-Pro 为 2 倍; 4 月 21 日 14:00 UTC 前购买 Plan 的用户, 已用额度重置. 订阅折扣分三档: 月付的现有用户下个月 7 折, 新用户下个月 77 折, 年付全年 88 折. 「价格不变」 说的是按 token 计费的 API 单价和前代 Pro 一样; 2 倍说的是 Plan 套餐里调用 V2.5-Pro 时额度按 V2.5 的两倍扣. 两者是两套计费方式, 不矛盾.

### 5.2. 结论与边界

V2.5-Pro 是 Flash 配方在 1T 规模上的放大: 隐藏维, 层数和专家数加大, 专家形状和激活个数不变; 混合比从 5:1 改到 6:1, 70 层里 10 层存完整 KV, 长上下文 KV 约为全 GA 的 1/7; 3 层 MTP 和 SFT, 分域 RL, MOPD 的后训练照搬. 规模和前代 V2-Pro 相同, 智能体基准的涨幅都来自训练, 1M 上的 GraphWalks 从 0 到可用.

边界有几处. 6:1 和 sink 的依据是 Flash 在 32B 代理模型上的 5:1 消融, 1T 规模上没有重新对比; MTP 的 「约三倍」 超出按 Flash 实测推算的上限, 测试条件未知; 发布页对照表里 HLE, SWE-bench Verified 和 SWE-Bench Pro 都不占优; V2.6 的重测显示 DeepSWE 一类长程开发基准分数很低, 这块要到 V2.6 的 RL 才补上. Base 256K 到正式版 1M 的扩展在哪个阶段做, 用了多少数据, 1M 上除 GraphWalks 外还有没有别的长上下文评测, 都没有交代; 教师数量, RL 超参和数据配比也没有公开.

## 参考文献

1. Xiaomi MiMo Team. 「MiMo-V2.5-Pro」. 发布页, 2026-04-27, https://mimo.xiaomi.com/. 中英对照见 [mimo-v2-5-pro-bi](./mimo-v2-5-pro-bi.md).
2. Xiaomi MiMo Team. 「MiMo-V2.5-Pro」 模型卡. HuggingFace, 2026, https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro; 合集 https://huggingface.co/collections/XiaomiMiMo/mimo-v25.
3. Xiaomi MiMo Team. 「MiMo-V2-Flash Technical Report」. arXiv:2601.02780, 2026.
4. Xiaomi MiMo Team. 「MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement」. Technical Report, 2026.
5. Guangxuan Xiao, et al. 「Efficient Streaming Language Models with Attention Sinks」. arXiv:2309.17453, 2023.
6. Iz Beltagy, Matthew E. Peters, Arman Cohan. 「Longformer: The Long-Document Transformer」. arXiv:2004.05150, 2020.
7. Rishabh Agarwal, et al. 「On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes」. arXiv:2306.13649, 2023.
8. Ma, et al. 「Stabilizing MoE Reinforcement Learning by Aligning Training and Inference Routers」. 2025.
9. Xiaomi LLM-Core Team. 「MiMo: Unlocking the Reasoning Potential of Language Model - From Pretraining to Posttraining」. arXiv:2505.07608, 2025.
10. DeepSeek-AI. 「DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence」. arXiv:2606.19348, 2026.
