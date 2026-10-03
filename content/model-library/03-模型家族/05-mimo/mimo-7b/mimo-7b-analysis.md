---
title: "MiMo-7B: 一个 7B 推理模型怎样从语料一路做到 RL"
category: "模型库"
tags: ["MiMo", "技术解析"]
published: true
excerpt: "MiMo-7B 是小米 MiMo 线的第一篇技术报告 (产品站论文墙上日期 2025年5月12日)."
---
# MiMo-7B: 一个 7B 推理模型怎样从语料一路做到 RL

来源: 同目录 `mimo-7b.md` (arXiv:2505.07608v2, 28 页, 9 图). 对照译稿见 `mimo-7b-bi.md`. 数字回 Abstract, Fig. 1–8, Tab. 1–6 与 §2–§3.6. 开源入口 https://github.com/xiaomimimo/MiMo.

MiMo-7B 是小米 MiMo 线的第一篇技术报告 (产品站论文墙上日期 2025年5月12日). 它要证明的事很具体: 当时多数成功的推理 RL 都建在 32B 级底座上, 小米想看从零训的 7B 能不能同时把数学和代码抬到 o1-mini 档. 回答这个问题, 光改后训练不够. 语料怎么抽, 配比怎么排, 训练目标加不加 MTP, RL 题怎么清洗, 奖励怎么设计, rollout 系统怎么调度, 评测拿什么尺子量潜力, 这些决定在报告里是互相咬合的, 拆开任何一块, 7B 的故事都讲不通.

放到更长的时间线上看, 这篇报告的积木大多有来处. 骨架是 Llama / Qwen 同款 decoder-only (GQA 来自 Ainslie et al. 2023, RoPE 来自 Su et al.); MTP 按 Gloeckle et al. 2024 提出, 报告明写受 DeepSeek-V3 启发; RL 主算法是 DeepSeekMath 的 GRPO, 再并入 DAPO (Yu et al. 2025) 的 Clip-Higher 与 Dynamic Sampling; 用 pass@k 衡量底座潜力的思路来自 Yue et al. 2025. 小米自己加的部分是推理密度导向的语料流水线, 训时单层 / 推时多层的 MTP 用法, 按测例难度分层的代码奖励, 易题回采池, 以及 Seamless Rollout 调度引擎. 后面的 MiMo-V2-Flash 明写数据流水线 「largely follows MiMo-7B」, 并把 Seamless Rollout 扩成 Data Scheduler, 所以这篇也是整个家族的地基.

读之前先分清两种 「变大」. 部署前的 Scaling 是 25 万亿 token 预训练, 三阶段配比, 以及上下文从 8,192 拉到 32,768. TestingTime 是推理时多花算力: 评测里每题多次采样, pass@k 里的 $k$, 以及 RL-0530 在评测中用 48K 生成预算. MTP 的投机解码加速与 Seamless Rollout 的壁钟加速都不属于 TestingTime, 它们是结构和训练系统上的选择.

## 1. 底座: 潜力判据, 语料与结构

### 1.1. 问题怎么提出: 先证明底座里有可挖的正解

报告的出发点是一个判断: **RL 能挖到多少, 很大程度上被底座限定.** Yue et al. 2025 的实验显示, 在 $k$ 足够大时, RL 后模型的 pass@k 并不总能超过底座, RL 更多是把底座已经能采到的正解调到更靠前. 小米把这个观察当成选底座的尺子: 单次成功率 Pass@1 低估潜力, 应该看 pass@k 曲线. Fig. 3 显示 MiMo-7B-Base 在多条推理榜的各个 $k$ 上都高于对照, 包括 32B 基线, 差距随 $k$ 增大而拉开, LiveCodeBench 上最明显. 关于 RLVR 的探索边界, 可对照 [RLVR 的局限性与探索边界分析](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLVR的局限性与探索边界分析.md).

有了这把尺子, 成功标准就分成两层. 第一层是 Fig. 3 的 pass@k 包络高于更大底座, 说明值得在 7B 上做大规模 RL. 第二层是 Tab. 4 的 Pass@1 进入 o1-mini 同档, 说明 RL 真把潜力兑现了. 只有第一层, 模型只是好底座; 只有第二层, 涨分可能来自蒸馏轨迹或评测噪声, 很难说明小模型本身可训. Tab. 1 的 Base Pass@1 已经给出信号: BBH 75.2, LiveCodeBench v5 32.9, AIME 2024 32.9. Tab. 4 的正式 RL 版 AIME 2025 55.4 (比 o1-mini 高 4.7), LiveCodeBench v5 57.8, v6 49.3. 开源清单放了 Base, SFT, 从 Base 直接 RL 的 RL-Zero, 以及从 SFT 再 RL 的 RL 四套权重, 别人可以分别复现 「直 RL」 与 「先 SFT 再 RL」 两条线.

### 1.2. 语料为推理铺厚: 抽取, 过滤, 合成, 三阶段配比

要让 Fig. 3 的曲线好看, 功夫下在语料密度上. §2.1 的 HTML / PDF 抽取专门保留公式与代码块, 因为通用抽取工具 (报告引 Barbaresi 2021, 即 trafilatura) 常把这两类内容剥掉; 新工具对数学内容, 代码块和论坛页面单独优化, PDF 解析也针对 STEM 与代码加强. URL 去重加 MinHash 做全局去重, 报告说经过工程优化, 全部网页 dump 的全局去重可以在一天内跑完. 去重之后再用微调过的小模型给领域与多维质量打分. 这一步替换掉了 FineWeb (Penedo et al.) 一类启发式规则过滤, 原因是规则会把公式和代码密集的网页当成低质量文本误杀. MinHash 对好坏文本一视同仁, 所以质量校准只能后置. 合成侧用强推理模型写 STEM 深析, 解题轨迹与创意写作; 报告特别写了一条经验: 合成推理数据可以跑极高 epoch 而不容易过拟合, 普通非推理数据没有这个性质.

配比按三个阶段推进. Stage 1 去掉 「推理题查询的合成答案」, 下采样广告, 新闻, 招聘这类低密度源, 上采样专业领域. Stage 2 在 Stage 1 分布上把数学与代码相关数据加到约 70%, 上下文仍是 8,192. Stage 3 再掺约 10% 数学, 代码与创意写作的合成回复, 并把上下文扩到 32,768. 全程约 25 万亿 token. 合成数据放进 Stage 3 而不是 Stage 1, 是先稳住自然语言底座, 再在长上下文阶段注入可模仿的长回复; 这一步也在为后面 32K 的长 CoT RL 预热.

这种配比有明确代价. Tab. 1 里中文 C-Eval / CMMLU 是 68.7/70.9, 明显落后 Qwen2.5-7B 的 81.8/82.7; GPQA-Diamond 只有 25.8, 低于 Qwen2.5-7B 的 35.4; HumanEval 51.8 和 MBPP 69.2 也不如 Qwen2.5-7B 的 56.7 和 76.7. 真正拉开的是 AIME 与 LiveCodeBench 这种长推理链的榜. 数据侧的偏向一路延续到后训练: RL 题库只有数学和带测例的代码, 通用写作和开放问答都不在主奖励路径上. 选这个底座做中文综合考试, 就不能只看 「25T + 推理密度」 的口号.

Tab. 1 还有几格能看出配比到底买到了什么. 数学上 AIME 2025 Base 为 24.3, Qwen2.5-7B 只有 4.3, 但 4-shot MATH 反而是 37.4 对 44.3, GSM8K 75.2 对 80.2. 短题 few-shot 格式下不占优, 长推理题差距拉得很大, 说明语料投入主要换来的是 「能把长链推下去」, 而不是短答案的格式熟练度. 代码上同样分化: HumanEval / MBPP 落后, CRUXEval-O (给代码推输出) 56.3 高于 Qwen2.5-7B 的 48.5, LiveCodeBench v5 32.9 对 5.0. 知识型闭卷问答则明显吃亏: TriviaQA 60.8, NaturalQuestions 24.5, 都低于 Gemma-2-9B 的 76.5 和 29.2; MMLU-Pro 41.9 也低于 Qwen2.5-7B 的 45.0. 对照组是 Llama-3.1-8B, Gemma-2-9B, Qwen2.5-7B, 评测设置统一; BBH 75.2 比 Qwen2.5-7B 高约 5 分, WinoGrande 78.0 与 AGIEval 48.3 也是组内最高.

Stage 3 的长上下文也有一张单独的核验表. Fig. 4 用 RULER 测 Base: 四类 NIAH (单针, 多键, 多值, 多查询) 按深度与长度汇总后, 在支持的 32K 窗口内近乎满分; 更偏推理的 Common Words Extraction, Frequent Words Extraction, Variable Tracking 三项, 多数设定下超过 Qwen2.5-7B. 纯检索满分并不稀奇, 后三项才对应 「在长上下文里做推理」, 作者把它们当作高质量推理语料有效的证据. 对后训练来说, 这张图的意义在于 32K 的 RL 最大序列长度是有底座支撑的: 如果 Base 到了窗口后段就读不住前文, 长 CoT 的 RL 会在后半段变成噪声. 报告没有测 32K 以外的外推, 7B 这一代的窗口就停在这里.

### 1.3. 骨架保持普通, 改动落在训练日程和 MTP

§2.2 给出的结构完全是主流配置: 36 层, hidden 4,096, FFN intermediate 11,008, 注意力头 32, KV group 8 的 GQA, pre-RMSNorm, SwiGLU, RoPE. 报告自己也写 「similar to Llama and Qwen」. GQA 在性能与 KV 缓存之间的折中见 [GQA 单独成篇](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/02-MQA与GQA-共享KeyValue头/02-MQA与GQA-共享KeyValue头.md). 7B 这一档没有换注意力形态, 小米的架构改动要到 Flash 才出现, 这一篇把可调的旋钮都放在训练日程上.

日程数字要连着 token 断点抄. AdamW ($\beta_1=0.9$, $\beta_2=0.95$, weight decay 0.1), grad clip 1.0. 学习率在前 84B token 从 0 线性暖到 $1.07\times10^{-4}$, 常数相 10.2T, 再余弦降到 $3\times10^{-5}$ (7.5T); 这个值贯穿 Stage 2 (4T) 与 Stage 3 前 1.5T, 最后 500B 余弦降到 $1\times10^{-5}$. batch 在前 168B token 线性暖到 2,560, 保持到 Stage 2 结束; Stage 3 固定为 640, 同时序列从 8,192 拉到 32,768. 两组数相乘可以看出安排的用意 (按数推算): $2560\times8192$ 与 $640\times32768$ 都约为 2,100 万 token, 每步吃进的 token 数没变, 只是把同样的量换成更少, 更长的样本, 学习率与梯度噪声的量级因此不必重新调. 正文没有另给这组设置的消融. RoPE base 从 10,000 提到 640,000, 配合 32K 上下文. 三段学习率的 token 数加起来 (按数推算): Stage 1 是 $0.084+10.2+7.5\approx17.8$T, Stage 2 是 4T, Stage 3 是 $1.5+0.5=2$T, 合计约 23.8T, 比摘要的 「约 25T」 少 1T 出头, 报告没有解释差额. batch 暖机的 168B 正好是学习率暖机 84B 的两倍. MTP 按 $\mathcal{L}=\mathcal{L}_{\mathrm{NTP}}+\lambda\,\mathcal{L}_{\mathrm{MTP}}$ 加权 (报告只给了权重 $\lambda$, 没写成加法式), $\lambda$ 前 10.3T 为 0.3, 之后 0.1. 由于 $0.084+10.2=10.284$T, **$\lambda$ 的切换点正好落在常数学习率结束, 余弦衰减开始的位置**, 后半程更信任主目标 next-token prediction.

RoPE base 的调整是长上下文预训练的常见做法: base 越大, 各维旋转频率越低, 远距离位置之间的相位差不会很快绕回, 模型在更长的窗口里仍能分辨位置. 与先训短窗再用 YaRN 一类插值外推不同, MiMo-7B 是在 Stage 3 直接用 32K 序列继续预训练, 同时换 base, 让模型在真实长样本上适应新频率. 插值外推的一般读法见 [长度外推: 从 PI 到 YaRN](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md). 这一代的做法到 Flash 有了变化: 混合注意力里只有全局层需要换 base, 滑窗层保持 10,000 不动.

**MTP 是这篇在结构上唯一的新增.** 它的做法按 Fig. 2 分两段. 预训练只挂 1 个 MTP 层, 因为初步实验里多层不再涨点. 推理时要多层做 speculative decoding: 预训练结束后把单层复制成两份相同拷贝, 冻结主模型与第一个 MTP 层, 只微调两个新层. AIME24 上第一层接受率约 90%, 第三层仍高于 75%. 仓库 README 另写 MTP 层在预训练与 SFT 中训练, 在 RL 中冻结. 机制推导见 [MTP 单独成篇](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP/2.4.6-多Token预测MTP.md) 与 [投机解码原理与应用](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/01-投机解码原理与应用.md).

这个组合对推理模型特别划算. 长 CoT 的输出动辄上万 token, 自回归逐个生成最慢; MTP 在训练里逼表示预规划后续 token, 在推理里变成可验证的草稿头. 代价是多出一次复制加微调, 以及推理引擎必须原生支持 MTP (§3.4.2 写了在 vLLM 里落地). 只加训练目标不做推理侧多层, 只拿到质量那一半; 只加投机头不在预训练里喂 MTP, 接受率也未必有 90%/75% 这组锚点. Flash 后来把同一思路推到 MoE 上, 并且连 MTP 权重的时间表 (0.3 降到 0.1) 都一样.

## 2. 后训练: 规则 RL 与训练系统

### 2.1. RL 题库和奖励: 只认可核验的对错

后训练先做 SFT. §3.1 的 SFT 约 500K 样本: 去掉与评测集 16-gram 重叠的查询, 剔除混语与不完整回复, 每查询最多保留 8 条回复. 超参是常数学习率 $3\times10^{-5}$, batch 128, pack 到 32,768. §3.2 的 RL 题库是数学约 100K 加代码约 30K, 合计 130K. 这两个数不能加总成 「后训练 630K」, 它们是两条管道; Tab. 6 讨论节把 SFT 扩到约 6M, 那是另一组实验.

SFT 数据的来源值得单独说一句: 报告写它由开源数据与自有的蒸馏数据混合而成, 回答来自更强的推理模型. 这意味着正式 RL 版的起点已经吸收了外部强模型的推理轨迹, Tab. 4 里它和 R1-Distill-Qwen-7B 一类蒸馏模型比, 口径是对得上的. 但要回答第 1.1 节提出的 「7B 底座本身值不值得做 RL」, 更干净的证据是 RL-Zero: 它不经过蒸馏 SFT, 从 Base 直接做规则 RL, AIME 2024 仍从 32.9 涨到 56.4. 报告把两条线都开源, 读者可以自己判断涨分里有多少来自底座, 多少来自蒸馏数据.

题库清洗的阈值说明了作者在防什么. 数学侧用 LLM 滤掉证明题与选择题, 保留原题不改写成整数答案, 为的是降低 reward hacking; 用高级推理模型去掉无解或答案有误的题; 再用 SFT 模型 16 次 rollout, 删掉 passrate > 90% 的易题 (约删 50%). 代码侧去掉无测例的题; 有黄金解的, 剔除黄金解跑不过全部测例的题; 没有黄金解的, 让高级推理模型采 16 次, 一个测例都过不了就丢掉; 最后同样用 SFT 模型剔除 16 次 rollout 全过的题, 得到约 30K 道. 数学侧另做了全局 n-gram 去重, 并对评测集去污染. 前面说的不改写原题, 按机制理解 (解读, 报告只写了 「降低 reward hacking」) 是因为改写成整数答案后答案空间变小, 模型更容易靠猜或凑数拿奖励. 证明题和选择题被整类剔除, 等于承认规则核验器覆盖不了它们; 这与 DeepSeek-R1 一类工作把可核验域划小的思路同向.

奖励函数刻意极简. 数学用 Math-Verify 规则判对错, 代码用后面讲的测例难度分层奖励, 不加 format reward, 也不加 length penalty. 这样做的代价在 §3.6 能看到: 从 Base 直接 RL 时, 模型要先花很多步学会 `\boxed{}` 一类答案抽取格式. 另一个代价是在线判分的负担, 每轮要评上千题, 每题可能有数百测例, 奖励阶段的并行单元测试环境是硬需求, 否则 GPU 会在等判分时空转.

语言混合是奖励极简留下的一个坑. §3.6 写他们像 DeepSeek-R1-Zero 一样在 Base 直 RL 时看到混语, 试过加语言混合惩罚, 但设计不好: 英文回答里抓中文容易, 中文题里数学式和代码天然带英文, 惩罚既去不干净, 又可能诱导模型不管题目语言一律输出英文. 开源后社区试用里也出现过输出随机混语言的反馈, 与这段失败实验对得上.

### 2.2. GRPO 的三处社区改法, 和小米补的两件

式 (1)–(2) 是改版 GRPO. 对每道题 $q$, 从旧策略采 $G$ 条回答 $\{o_1,\dots,o_G\}$, 最大化

$$
\mathcal{J}(\theta)=\mathbb{E}\Big[\frac{1}{\sum_{i=1}^{G}|o_i|}\sum_{i=1}^{G}\sum_{j=1}^{|o_i|}\min\big(\rho_{i,j}A_{i,j},\ \mathrm{clip}(\rho_{i,j},1-\varepsilon_{\mathrm{low}},1+\varepsilon_{\mathrm{high}})\,A_{i,j}\big)\Big],\qquad A_{i,j}=\frac{r_i-\mathrm{mean}(\{r_k\}_{k=1}^{G})}{\mathrm{std}(\{r_k\}_{k=1}^{G})}.
$$

$\rho_{i,j}$ 是新旧策略的概率比. 报告把它写成 $\pi_\theta(o_i|q)/\pi_{\theta_{old}}(o_i|q)$, 没带 token 下标, 但它放在对 $j$ 的求和里, 按 token 级比率读才对得上. $A_{i,j}$ 的右边只有 $r_i$, 同一条回答的所有 token 共用一个优势. 归一化分母是整组 token 总数 $\sum_i|o_i|$, 两种分母的差别落在每个 token 的权重上: 原始 GRPO 先在回答内平均再跨回答平均, 回答 $i$ 的每个 token 权重是 $1/(G|o_i|)$; 这里每个 token 都是 $1/\sum_k|o_k|$. 设 $G=2$, 两条回答长 1,000 与 10,000 token, 原始写法下短回答的 token 权重是 1/2000, 长回答是 1/20000, 差 10 倍; 按整组 token 总数归一后都是 1/11000, 长 CoT 里的 token 不再被稀释. DAPO 的写法就是这个分母. GRPO 本身见 [GRPO 单独成篇](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md).

另外两刀也来自社区. 去掉 KL loss, 让策略可以离初始模型更远. **Dynamic Sampling** 滤掉 passrate 为 0 或 1 的 prompt: 组内奖励全相同时, 式 (2) 的分子为零 (分母的标准差也为零), 这组样本不贡献梯度, 滤掉后 batch 里都是有效梯度. **Clip-Higher** 把上界 $\varepsilon_{\mathrm{high}}$ 调大, 下界不动. 优势为正时, 比率超过 $1+\varepsilon_{\mathrm{high}}$ 的 token 取到 clip 那一支, 梯度为零, 等于一步之内要求 $\pi_\theta(o)\le(1+\varepsilon_{\mathrm{high}})\,\pi_{\theta_{old}}(o)$, 能涨的绝对量是 $\varepsilon_{\mathrm{high}}\,\pi_{\theta_{old}}(o)$, 与旧概率成正比: 旧概率 0.9 的 token 与 0.01 的 token 能涨的量差 90 倍. 低概率 token 恰好是探索新解法要抬的那一类, 上界放宽后它们更容易被抬起来, 用来缓解熵坍缩. 报告没给 $\varepsilon_{\mathrm{low}}$ 与 $\varepsilon_{\mathrm{high}}$ 的取值. 这三刀组合在一起是 DAPO 的主体, 小米在 7B 上照搬, 没有另做消融.

这几处改动之间是互相依赖的. Clip-Higher 让策略保持较高的熵, 同一题的 $G$ 条回答更分散, 组内出现 「有对有错」 的概率更高, 被 Dynamic Sampling 滤掉的组就更少, 超采开销随之下降. 反过来, Dynamic Sampling 保证进入 batch 的每道题都有非零优势, token 级平均的梯度才来自模型真正拿不准的题, 而不是全对或全错的题. 去掉 KL 则是给这两者松绑: 推理 RL 往往要把回答长度和解题方式推离初始模型很远, KL 约束会把这种移动拉回来. 三者叠加后留下的问题是两端: 最难的题仍然全错, 最易的题越来越多全对, 这正是小米自己补的两件要处理的.

小米自己补的第一件是 §3.3.1 的 **test difficulty driven reward**. 问题出在 Dynamic Sampling 与稀疏代码奖励的冲突: 难题 16 次 rollout 全部 0 分, 整组会被 Dynamic Sampling 扔掉, 模型永远学不到难题. 做法借鉴 IOI 的子任务计分: 用多个模型多次 rollout 估计每个测例的通过率, 按通过率把测例聚成难度层. 把各层从易到难记为 $L_1,\dots,L_m$, 第 $l$ 层总分 $s_l$, 一个解在 $L_l$ 里通过 $p_l$ 个测例 (层数, 聚类方法和 $s_l$ 怎么定, 报告都没写). 基线, Strict, Soft 三种奖励分别是

$$
R_{\mathrm{base}}=\prod_{l=1}^{m}\mathbb{1}\big[p_l=|L_l|\big],\qquad R_{\mathrm{strict}}=\sum_{l=1}^{m}s_l\prod_{k\le l}\mathbb{1}\big[p_k=|L_k|\big],\qquad R_{\mathrm{soft}}=\sum_{l=1}^{m}\frac{s_l}{|L_l|}\,p_l .
$$

同一个解, $L_1$ 全过, $L_2$ 过一半, $L_3$ 一个没过: 基线给 0, Strict 给 $s_1$, Soft 给 $s_1+s_2/2$. Strict 要求从易到难逐层闭合, 跳过易层去碰难层测例拿不到分; Soft 对每个通过的测例都给分, 信号更密. 对 Dynamic Sampling 来说要紧的是组内方差: 一道难题组内 $G$ 个解都没全过时, 基线下是 $G$ 个 0, 整组被丢; 换成分层奖励, 只要各解闭合的层数不同, 组内奖励就有差, 式 (2) 的优势不再全为零. Fig. 5 左图是单题测例的通过率分层, 右图把两种方案与 「全过才给分」 基线对照. 报告没有宣称哪种方案在所有榜上最优, 引用时要回到该图的曲线.

第二件是 §3.3.2 的 **easy data pool**, 解决另一头的问题. 策略变强后满分题越来越多, Dynamic Sampling 为凑满 batch 会大量超采. 直接从训练集删光满分题又会让策略更新不稳. 于是维护一个易题池, 满分题进池, 每次取题按 $q\sim(1-\alpha)\,\mathcal{D}_{\mathrm{train}}+\alpha\,\mathcal{D}_{\mathrm{easy}}$, $\alpha=10\%$. 回采的易题如果仍然 $G$ 次全对, Dynamic Sampling 照样把它滤掉, 只花 rollout, 不进梯度; 只有策略在这道题上退步, 组里出现错解, 它才进 batch. 按这个读法 (推测, 报告只写了 「稳定策略更新」), 易题池相当于用 10% 的 rollout 预算盯住已经学会的题. 超参在 §3.3.3: batch 512, actor mini-batch 32, 每迭代 16 次梯度更新, 学习率 1e-6, 最大序列 32,768, temperature 与 top-p 都是 1.0. $512/32=16$, 所以每轮的 512 条样本正好切成 16 个 mini-batch, 各更新一次, 走一遍. 第一个 mini-batch 上 $\rho=1$, 之后参数已经动过, $\rho$ 偏离 1, 式 (1) 的裁剪从这里开始起作用. 报告没说 512 数的是题还是回答. 这两件和 Dynamic Sampling 是一套: 难度分层让难题有梯度, 易题池让后期不空转, 单抄 GRPO 公式得不到同样的曲线.

### 2.3. Seamless Rollout: 把样本效率兑成壁钟时间

系统瓶颈在 §3.4 写得很清楚. 回答长度分布偏斜, 多数 GPU 在等少数长序列; 代码判分慢; Dynamic Sampling 又加剧空转和样本浪费. 当时的主流解法是异步训练, 小米拒绝了, 理由是异步会改变算法语义, 给长序列带来陈旧性 (staleness). 他们在 verl 上做了 **Seamless Rollout Engine**, 三个组件: continuous rollout, asynchronous reward, early termination. Fig. 6 画的调度逻辑是: 某个 worker 完成就立刻算奖, 按统计决定是否追加 rollout; 代码奖励走专用服务器; 早停按 FIFO, 只在有效样本已够且更早发起的任务都结束时中止, 避免系统性地压掉长序列.

Tab. 2 在 256 张 H20 上相对 naive dynamic sampling: 三件齐开后 Overall Speedup 2.29×, Rollout Speedup 2.61×, Normalized GPU Idle Time 0.15, GPU Idle Ratio 27.7%, Sample Waste Ratio 12.9% (naive 为 22.1%). 按行读更有信息: 不做动态采样吞吐更高 (2.45×), 但留下大量零梯度样本; 只加 continuous rollout 就把 Overall 拉到 1.99×, waste 从 22.1% 降到 13.9%. 报告写该 5-step 窗口平均 pass rate 约 41%, 所以 2.29× 是这个难度分布下的条件数字. 验证阶段 Tab. 3 给出 1.96×, normalized idle time 为 0.25, GPU idle ratio 从 65.8% 降到 32.9%. 这几列不是彼此独立的量 (按表推算): 空转 GPU 小时 = 空转比例 × rollout 时长, rollout 时长与 Rollout Speedup 成反比, 再除以 naive 行的空转比例归一, 于是 Normalized GPU Idle Time ≈ Idle Ratio ÷ Rollout Speedup ÷ 69.3%. 三件齐开: $0.277/2.61/0.693\approx0.15$; 只加 continuous rollout: $0.388/2.20/0.693\approx0.25$; 不做动态采样: $0.708/2.82/0.693\approx0.36$; Tab. 3 验证行: $0.329/1.96/0.658\approx0.25$, 都与表值吻合. 三件齐开时, 空转比例降了约 2.5 倍, rollout 时长缩了 2.61 倍, 两者相乘才得到 0.15. Sample Waste Ratio 的定义是 (多产出的有效样本数) ÷ (batch 需要的样本数).

三个组件的分工在 Tab. 2 逐行能看出来. continuous rollout 拆掉了生成与判分之间的同步栅栏: 某个 worker 一完成就算奖, 按有效样本数和当前 pass rate 统计判断要不要追加任务, 贡献了最大的一段提速. 异步判分用 Ray 并发管理 rollout 与 reward 任务, 代码判分走专用服务器, Overall 到 2.09×, idle ratio 降到 34.0%, 但 sample waste 从 13.9% 回升到 16.4%: 判分更快, 追加任务更积极, 超采也就多了. early termination 把 waste 压回 12.9%, 它用 FIFO 规则, 只有当有效样本够数且比这些样本更早发起的任务都已结束时才中止剩余任务. 直接粗暴中止会系统性地砍掉长回答, 等所有任务结束再随机抽又会被末尾刚起的长序列拖住, FIFO 是两者之间的折中. 报告还做了一笔对比: 在 41% 的 pass rate 下, 静态采样与朴素动态采样的样本效率差不多, 前者训了零梯度数据, 后者浪费了超采样本; 三件齐开后, 单步时间接近静态采样, 样本效率更高.

调度引擎之外, 报告还花了一段写推理引擎的加固, 这类细节很少出现在模型报告里. verl 以 external launch 模式部署 vLLM, 某些场景下不稳定. 他们做了两处修补: 发生抢占 (pre-emption) 时清掉 prefix caching 里已计算的块, 保证 KV 缓存一致; 调大调度步数时关闭异步输出处理, 保证兼容. 再加上前面提到的 MTP 支持, 这三处都在回答同一个问题: 训练用的推理引擎输出的概率, 要和训练引擎假设的是同一个策略. 这个问题在 7B 稠密模型上靠修 bug 就能压住, 到了 MoE 上会以专家路由不一致的形式重新出现, Flash 用 R3 (Rollout Routing Replay) 专门处理它.

这一节在家族里有后续. Flash 的 Data Scheduler 把 Seamless Rollout 扩到细粒度序列调度, 同时接入 partial rollout, 用 staleness-aware truncated importance sampling 控制陈旧度; V2.6 更进一步, 全异步 partial rollout 允许 staleness 4. 7B 这一代为了算法纯净拒绝陈旧样本, 到了几百 B 的 MoE 和长程 Agent 任务, 小米改成了 「允许有限陈旧, 用重要性采样补偿」. 看这条线, 能看出团队对同步 / 异步的取舍是随规模变化的.

## 3. 结果与后续

### 3.1. 两条后训练路径与评测口径

Tab. 5 把 Base, RL-Zero, SFT, RL 四档并排. RL-Zero 从 Base 的 AIME 2024 32.9 拉到 56.4, 增幅陡; 先 SFT 再 RL 的正式版到 68.2, 天花板更高. Fig. 7 否决了 「只做轻量格式 SFT」 的捷径: LiteSFT 起步高于 RL-Zero, 约 500 步后被 Base 直 RL 反超, 相对重 SFT 的 RL 也明显更矮. §3.6 还记录了一个域干扰现象: Base 直 RL 在第 2000–2500 步之间代码持续涨, 数学却抖动下降. 作者看了输出, 归因于 Base 探索能力强, 更容易钻数学奖励的空子, 而代码的测例验证更难刷; 冷启动 SFT 后再 RL, 两域同步上涨. 报告由此得出的结论落在数据面: 数学题集的质量决定 RL 能不能稳住. 这也回头解释了第 2.1 节为什么要整类剔除证明题与选择题, 并坚持不改写原题: 规则核验器越容易被绕过, 探索能力强的策略越会去绕.

两条路径的差别在 Tab. 5 各格并不一致, 值得细看. MATH500 从 Base 的 37.4 到 RL-Zero 93.6, 高于 SFT 的 93.0; AIME 2025 上 RL-Zero 46.3 也高于 SFT 44.3; 但 AIME 2024 (56.4 对 58.7) 和 LiveCodeBench v5 / v6 (49.1/42.9 对 52.3/45.5) 是 SFT 更高. 也就是说, 纯规则 RL 从 Base 出发能追平一次重 SFT, 部分格还超过; 正式版在 SFT 上再做 RL, 五格全部最高 (MATH500 95.8, AIME 25 55.4, LCB v6 49.3). 这组数支持报告的判断: 底座本身可训, 蒸馏数据抬高的是起点和天花板.

读这些分数要带上协议. §3.5.1 对 AIME 平均 32 次采样, LiveCodeBench, GPQA, IF-Eval 平均 8 次, 温度 0.6, top-p 0.95; 数学, 代码, 科学题最大生成 32,768, 其他 8,192. 每题多次采样取平均属于评测里的 TestingTime 开销, 它降低的是方差, 不改变单次能力. Tab. 1 大量带 * 的分数来自作者内部框架, 与外部复现比较时要把框架差算进去. Tab. 4 里一般能力没有崩: GPQA Diamond 54.4, SuperGPQA 40.5, DROP 78.7; 但 IF-Eval 61.0 仍明显低于 GPT-4o, Claude 与 o1-mini 的八十多分档, 指令遵循不是这条配方的优化目标. 对照组停在 Qwen2.5 一代, 表里没有同期新发布的其他 7B 推理模型.

Tab. 4 的对照组分两类: 非推理模型 GPT-4o-0513 与 Claude-3.5-Sonnet-1022, 推理模型 o1-mini, QwQ-32B-Preview, R1-Distill-Qwen-14B 与 7B. 数学上 MATH500 95.8 是全表最高, AIME 2024 68.2 略低于 R1-Distill-Qwen-14B 的 69.7. 代码上 LiveCodeBench v5 57.8 高于 o1-mini 53.8, v6 49.3 比 QwQ-32B-Preview 的 39.1 高出十分以上. 两版 LiveCodeBench 的题目时间窗分别是 2024-08-01 至 2025-02-01 与 2025-02-01 至 2025-05-01, v6 的题晚于大部分模型的训练截止, 相对不容易被污染, 7B 在 v6 上领先比在 v5 上领先更有说服力. 短板集中在知识面: MMLU-Pro 58.6, 远低于 o1-mini 的 80.3, 与 Base 在闭卷问答上的弱势一脉相承.

还有一处容易被忽略: 规则 RL 只用了数学与代码题, Tab. 4 里 DROP, SuperGPQA 这类不在 RL 题库里的榜也没有掉, 作者据此说专项 RL 没有伤到综合能力. 这个结论在本报告的配比下成立, 不能外推成 「任何专项 RL 都不伤通用」. 一个可能的解释 (推测, 报告没有论证) 是 RL 阶段学习率只有 1e-6, 策略移动主要发生在推理链的长度与结构上, 通用知识没被大幅改写. 如果换成更激进的学习率或更长的 RL, 或者题库只剩单一领域, 综合榜是否还能保住, 报告没有做对应实验.

### 3.2. RL-0530: 更厚的 SFT, on-policy RL, 加长生成预算

报告讨论节写了一个后续检查点. Tab. 6 把 SFT 从约 500K 扩到 6M: AIME 24 58.7→68.3, AIME 25 44.3→50.9. 之后的 RL 改成 on-policy, 报告说 vanilla GRPO 容易过早饱和, 改法参照同队的 MiMo-VL-7B-RL (arXiv:2506.03569); 训练时把生成长度从 32K 提到 38K, 再到 48K. 得到的 MiMo-7B-RL-0530 在 48K 评测下 AIME 24 80.1, AIME 25 70.2, 作者称数学推理与 DeepSeek-R1 同档. Fig. 8 是它在 AIME24 上的训练曲线.

这里有两层要分开. 训练时拉长生成长度是 RL 配方的一部分, 让策略学会用更长的推理链; 评测阶段用 48K 预算是 TestingTime, Tab. 6 脚注写明 0530 在 48K 下评, 其余三列在 32K 下评. 所以 0530 相对主表 RL 的涨幅, 一部分来自更厚的 SFT 与 on-policy 算法, 一部分来自更长的推理预算, 报告没有把两者拆开. Alignbench v1.1 用 GPT-4.1 当裁判, 与规则可核验榜不是同一类信号, 也不宜与 AIME 放在一起比.

Tab. 6 的四列放在一起还有一层信息. SFT-6M 在 AIME 24 上 68.3, 几乎等于 500K SFT 再做完整 RL 的 68.2; MATH500 94.8 对 95.8, GPQA 54.1 对 54.4, 也很接近. 换句话说, 把蒸馏数据加厚 12 倍, 单靠 SFT 就追上了主报告的 RL 版. 但 AIME 25 上 RL 版仍领先 (55.4 对 50.9), LiveCodeBench v5 也是 57.8 对 53.4, RL 的增益在更新, 更难的题上保留下来. 报告同时说 6M SFT 没有削弱后续 RL 的潜力, 0530 在它之上继续涨到 AIME 24 80.1, MATH500 97.2, GPQA 60.6, LiveCodeBench v5 60.9. 这组对照说明蒸馏和 RL 在 7B 上是叠加关系, 不是互相替代.

从方法演进看, 0530 这一步有两个信号. 第一, vanilla GRPO 过早饱和的问题被 on-policy 化解决, 也就是每次更新只用当前策略刚采的样本, 不复用旧 rollout; 同一时期发布的 MiMo-VL-7B-RL 走的也是这条路, 说明团队在 2025 年中已经把 on-policy 当作默认. 第二, 生成预算分段加长 (32K→38K→48K) 和 7B 主报告里 「最大序列 32,768」 的设定相比, 是把长度也当成一种课程来排. 这两点在 Flash 里都被继承: Flash 的后训练以 on-policy 蒸馏为主轴, 长度则通过 partial rollout 分步处理. 本报告里关于 0530 的细节只有 Tab. 6 与 Fig. 8 两处, SFT 6M 的构成与 on-policy 的具体超参都没有给.

### 3.3. 这篇在家族里留下了什么

把各面收成一条链: 高推理密度语料与三阶段配比铺底座, pass@k 证明值得做 RL; 单层 MTP 训练加多层复制服务长 CoT 解码; 可核验题库加难度分层奖励加易题回采稳住 DAPO 式 GRPO; Seamless Rollout 把动态采样兑成 2.29× 训练加速; 最后用更厚的 SFT 与 on-policy RL 把 7B 推到 0530. 每一环都依赖上一环: 没有推理密度, pass@k 立不起来; 没有难度分层奖励, Dynamic Sampling 会扔掉难题; 没有调度引擎, 动态采样的样本效率兑不成时间.

往后看, Flash 继承了数据流水线, MTP 权重时间表, Seamless Rollout 与规则奖励思路, 再加上 MoE, 混合注意力和多教师蒸馏. 损失聚合的说法后来变了: 7B 的式 (1) 只写到组内按 token 总数归一, V2.6 的式 (1) 写法与它相同, 但正文点明用 prompt-mean, 不用全 batch 的 token-mean, 理由是防止 RL 中回答长度涨得太快. 7B 报告没交代实现里是按组还是按整个 batch 归一. 这篇的边界也要记住: 只认规则奖励, 开放题写不好; 数理向配比牺牲了部分中文综合榜; 语言混合惩罚没有解决; Seamless Rollout 的数字锚定在 256 张 H20 与作者的 5-step trace, 换集群要重测. 数字回表, 机制回链, 复现优先顺序是先复现 Tab. 1 / Fig. 3 的底座潜力, 再复现难度分层奖励与易题池, 最后才是壁钟加速.
