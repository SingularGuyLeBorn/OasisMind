---
title: "DeepSeek-Coder-V2 技术报告详解"
category: "模型库"
tags: ["DeepSeek", "技术解析"]
published: true
excerpt: "开源代码模型在 StarCoder，CodeLlama，DeepSeek-Coder，Codestral 这条线上已经把成绩往上推了不少，但和当时的 GPT-4-Turbo，Claude 3 Opus，Gemini 1.5 Pro 比，差距仍然看得见。"
---
# DeepSeek-Coder-V2 技术报告详解

来源：[arXiv: 2406.11931](https://arxiv. org/abs/2406.11931)(2024-06-17, v1)，仓库 [deepseek-ai/DeepSeek-Coder-V2](https://github. com/deepseek-ai/DeepSeek-Coder-V2)。数字以报告正文与表格为准。

开源代码模型在 StarCoder，CodeLlama，DeepSeek-Coder，Codestral 这条线上已经把成绩往上推了不少，但和当时的 GPT-4-Turbo，Claude 3 Opus，Gemini 1.5 Pro 比，差距仍然看得见。DeepSeek-Coder-V2 的做法不是再从零训一个 Dense 代码模型，而是从 DeepSeek-V2 的中间 checkpoint 接着训：那份 checkpoint 已经吃过 4.2T token，再灌 6T 以代码和数学为主的语料，总暴露量到 10.2T. 架构沿用 V2 的 MoE（报告写明与 DeepSeek-V2 / DeepSeek-V2-Lite 同套超参），两档尺寸是 Lite 16B 总参 / 2.4B 激活，以及 236B / 21B 激活。编程语言从 Coder 时代的 86 种扩到 338 种，上下文从 16K 拉到 128K。

## 1. 数据：60% 代码，10% 数学，30% 自然语言

预训练配比写得很死：源码 60%，数学 10%，自然语言 30%。自然语言直接从 DeepSeek-V2 训练语料采样，这一节主要交代代码和数学怎么捞，怎么洗。

GitHub 侧截到 2023 年 11 月前公开仓库，过滤规则与 DeepSeek-Coder 相同：平均行长超过 100 或最长行超过 1000 的丢掉；字母比例低于 25% 的丢掉；除 XSLT 外，前 100 字符出现 `<? xml version=` 的丢掉；HTML 要求可见文本至少占 20% 且不少于 100 字符；JSON/YAML 只留 50–5000 字符，把数据堆型文件清掉。过滤加近重复去重之后，得到 821B 代码（338 种语言）和 185B 代码相关文本（markdown，issue 等）。

网页侧走 DeepSeekMath 那套 fastText 迭代召回：用 StackOverflow，PyTorch 文档，Math StackExchange 等当种子，训分类器扩网页；中文不能靠空格切词，所以分词用 DeepSeek-V2 的 BPE，召回准不少。域名里第一轮召回比例超过 10% 的标成代码/数学相关，再标 URL，补未收录页，三轮下来从网页拿到 70B 代码相关 token 和 221B 数学相关 token. GitHub 上又用同一管道两轮，补了 94B 更高质量源码。新代码语料合计 1, 170B token(GitHub + CommonCrawl)。数学 221B，大约是 DeepSeekMath 当年 120B 的两倍。

报告用 1B 模型做语料消融（Table 1）：同样训 1T，新语料把 HumanEval 从 30.5% 拉到 36.0%，MBPP 从 44.6% 到 49.0%；再训到 2T，到 37.2% / 54.0%。引言里写的「HumanEval +6.7%, MBPP +9.4%」对应的是相对旧 Coder 语料，训到 2T 后的总增益。

## 2. 训练：从 V2 中间点续训，16B 带 FIM，上下文用 Yarn 两段扩

目标函数上，16B 同时做 Next-Token-Prediction 和 Fill-In-Middle；236B 只做 NTP. FIM 用 PSM(Prefix–Suffix–Middle)，文档级，打包前进序列，FIM 比例 0.5，格式是：

$$
<|\text{fim\_begin}|> f_{pre} <|fim\_hole|> f_{suf} <|fim\_end|> f_{middle} <|eos\_token|>
$$

优化器用 AdamW，$\beta_1=0.9$，$\beta_2=0.95$，weight decay 0.1；学习率 cosine，2000 warm-up，最终降到初始值的 10%。训练里碰到不稳定和梯度尖峰，报告归咎于指数归一化，后来退回常规归一化。

长上下文跟 V2 一样用 YaRN，scale 40，其余超参与 V2 一致。扩展分两段：先 32K，batch 1152，训 1000 步；再 128K，batch 288，再 1000 步；期间上采样长上下文数据。NIAH(Figure 2)显示到 128K 窗口都还能稳住。

对齐分两步。SFT 混了约 20k 代码指令，30k 数学指令（分别来自 DeepSeek-Coder 与 DeepSeek-Math），再从 V2 指令里采一部分通用数据，合计约 300M token；cosine，100 warm-up，初始学习率 $5\times10^{-6}$，batch 约 1M token，总共吃大约 1B token。之后用 GRPO 做 RL（与 DeepSeek-V2 / DeepSeekMath 同族算法，不维护 critic）。代码相关 prompt 过滤后大约 40k，每条带测试用例。数学偏好用 ground-truth；代码侧明明可以靠编译器给 0/1，但测试覆盖经常不够，直接用编译器信号噪声大，于是在编译器数据上再训奖励模型，用 RM 信号做 RL. Figure 3 在内部 LeetCode / LeetCode-zh 上显示 RM 信号明显好于原始编译器信号。16B 在 SFT 里仍保留 FIM，对齐后还能做中间填空式补全。

## 3. 结果：生成与数学逼近闭源，仓库级补全省激活，复杂修仓仍有洞

代码生成（Table 3, greedy）：DS-Coder-V2-Instruct(236B/21B)Python HumanEval 90.2%，多语言平均 75.3%，MBPP+ 76.2%；只低于 GPT-4o 的平均 76.4%，高于 GPT-4-Turbo-0409 的 72.3%. Lite(16B/2.4B)平均 65.6%，超过 DS-Coder-Instruct 33B 的 61.9%. LiveCodeBench（2023-12 至 2024-06 子集）上 236B 总体 43.4%，与 GPT-4o 持平；USACO 12.1%。报告还写它是首个 SWE-Bench 超过 10% 的开源模型（Table 7 里 12.7%），Aider 73.7% 甚至略高于表中 GPT-4o 的 72.9%；Defects4J 单方法子集 21.0%. CRUXEval 上 236B 的 I-COT / O-COT 为 70.0% / 75.1%，开源里突出，相对更大闭源仍有差距，报告自己点到激活参数只有 21B。

数学（Table 9，greedy，无工具）：GSM8K 94.9%, MATH 75.7%(GPT-4o 76.6%)，AIME 2024 为 4/30（maj@64 可到 5/30），Math Odyssey 53.7%. AIME 张数超过表内对照的闭源模型。

补全方面，RepoBench v1.1 的 2023-12 子集上，Lite-Base 激活仅 2.4B，Python 平均 38.9%，接近旧 DS-Coder-Base 33B 的 39.1%；Java 平均 43.3%。单行 FIM(Table 6)Lite-Base 均值 86.4%，与 DS-Coder-Base 33B 持平。236B 基座这条线没有按 FIM 目标训，补全表主要报 Lite。

通用语言（Table 10）相对 V2 Chat：推理向基准 Lite/236B 往往更高，例如 BBH 83.9 vs 79.7，Arena-Hard 65.0 vs 41.6；知识向有回落，TriviaQA 82.3 vs 86.7, NaturalQuestions 47.5 vs 53.4. MT-Bench，AlignBench 略低于 V2 Chat. 30% 自然语言保住了通用面，但配比和对齐资源偏向代码与数学后，百科式问答会退一点。

## 4. 结论里自己划的边界

报告承认：标准基准上已经能和 GPT-4-Turbo，Claude 3 Opus，Gemini 1.5 Pro 在代码与数学专项里打得有来有回，但指令跟随仍明显弱于当时最强闭源，复杂场景（例如 SWE-Bench）会被拖住。下一步他们押在加强 instruction-following，不再指望靠同类生成基准把洞补上。

整条链路可以概括成：站在通用 MoE 中间点上续训；60/10/30 把代码，数学，语言捆在一起；小模型留 FIM 做补全，大模型主攻对话式编码；RL 用 GRPO，代码侧用 RM 平滑编译器 0/1。数字上最醒目的是 236B 只激活 21B 就把 HumanEval 推到 90.2%，MATH 到 75.7%，以及 Lite 2.4B 激活在多项补全/生成指标上压过更大的 Dense 代码模型。缺的那一块报告自己也写了：真实多文件修仓和硬指令跟随，这 6T 续训还没补平。
