---
title: "MiniCPM4.1 · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM4.1 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
# MiniCPM4.1 目录对照稿：与 minicpm4 同源

这个目录的源文 `minicpm4-1.md` 和同级目录 `minicpm4/minicpm4.md` 字节完全相同：两份都是 194900 字节，SHA256 都是 `858549b9d6d152cc03917f64ef83117ffbc4781ed7e44e684c7049845be02398`，都是 44 页、11 张图。两边的 PDF 也相同（2590544 字节，SHA256 前缀 `2d20e01f1323050f`），`images/` 下 11 张图逐个比对哈希也一致。

论文是 arXiv:2506.07900v2《MiniCPM4: Ultra-Efficient LLMs on End Devices》。MiniCPM4.1 没有单独成文，它是这篇 v2 里新增的混合推理模型，可以在深度推理和非推理两种模式间切换。所以这里不再逐段翻译一遍，逐段的中英对照读法放在 `../minicpm4/minicpm4-bi.md`，两份源文之间没有任何差别可供对照。

下面按页保留页标和原图位置，每页用一两句中文说明这一页讲什么，方便从这个目录直接定位到 minicpm4 对照稿的同一页。

> **想:** 目录名带 4-1，内容会不会是 MiniCPM4.1 的单独技术报告？
> 不是。两份 md 的 SHA256 完全一致，内容就是同一篇 v2 论文，4.1 只是论文里的一节和一个模型版本。

<!-- page 1 of 44 -->

第 1 页：标题、作者署名 MiniCPM Team、三个链接（MiniCPM4-8B、MiniCPM4.1-8B 的 Hugging Face 页和 GitHub 仓库）以及摘要。摘要列出四个方向：架构上的 InfLLM v2，数据上的 UltraClean 和 UltraChat v2，训练算法上的 ModelTunnel v2、chunk-wise rollout 和 BitCPM，推理系统上的 CPM.cu。模型有 0.5B 和 8B 两个尺寸，4.1 是混合推理版本。下面四张图是端侧 GPU（Jetson AGX Orin 64G 和 RTX 4090 24G）上的推理速度对比。

![Chart block](images/p01-chart.png)

![Chart block](images/p01-chart-2.png)

![Chart block](images/p01-figure-1-inference-speed-evaluation-on-end-side-gpus.png)

![Chart block](images/p01-1.png)

<!-- page 2 of 44 -->

第 2 页：目录的前半部分，列出第 1 到第 4 章的小节编号。

<!-- page 3 of 44 -->

第 3 页：目录后半部分，覆盖评测、应用、结论、贡献名单和参考文献。

<!-- page 4 of 44 -->

第 4 页：第 1 章引言开头，交代端侧部署对长上下文、算力和内存的约束。

<!-- page 5 of 44 -->

第 5 页：引言继续，按架构、数据、训练、推理四块逐条介绍贡献。

<!-- page 6 of 44 -->

第 6 页：引言收尾，第 2 章「高效架构与预训练」的开篇说明。

<!-- page 7 of 44 -->

第 7 页：图 2 是 InfLLM v2 的示意图，每个 query 组共享选中的上下文块。2.1 节和 2.1.1 节从这里开始，讲可训练稀疏注意力的整体框架。

![Image block](images/p07-figure-2-the-illustration-of-infllm-v2-each-query-group.png)

<!-- page 8 of 44 -->

第 8 页：2.1.1 节后半和 2.1.2 节，讲动态上下文块的选择方式。

<!-- page 9 of 44 -->

第 9 页：2.1.2 节收尾和 2.1.3 节，讨论可训练稀疏注意力的设计原则。

<!-- page 10 of 44 -->

第 10 页：图 3 是高质量数据流程的示意图。2.2 节 UltraClean 和 2.2.1 节知识密集型数据筛选从这里开始。

![Image block](images/p10-figure-3-the-illustration-of-high-quality-data.png)

<!-- page 11 of 44 -->

第 11 页：2.2.1 节继续，表 1 对比不同数据验证策略的计算开销。

<!-- page 12 of 44 -->

第 12 页：2.2.1 节的表 2，列出中英文数据集上的逐项结果。

<!-- page 13 of 44 -->

第 13 页：2.2.2 节，推理密集型数据的生成。

<!-- page 14 of 44 -->

第 14 页：2.2.3 节讨论未来的训练数据；2.3 节 ModelTunnel v2 和 2.3.1 节可预测扩展的性能指标从这里开始。

> **核对:** 两个目录的 `images/` 文件名一样，图片本身会不会换过？
> 没有换。11 张图逐个算 SHA256，两边全部一致，本稿引用的就是这个目录下的同一批图。

<!-- page 15 of 44 -->

第 15 页：图 4 展示 loss 与下游指标之间的 sigmoid 关系，是 2.3.1 节的核心图。

![Image block](images/p15-figure-4-the-sigmoid-relationship-between-loss-and.png)

<!-- page 16 of 44 -->

第 16 页：表 3 对比超参数搜索的计算开销和效果；2.3.1 节收尾，2.3.2 节预训练工程。

<!-- page 17 of 44 -->

第 17 页：第 3 章「高效后训练」开篇，3.1 节 UltraChat v2，含 3.1.1 知识密集型数据和 3.1.2 推理密集型数据。

<!-- page 18 of 44 -->

第 18 页：3.1.2 节收尾，3.1.3 指令遵循数据，3.1.4 长上下文数据。

<!-- page 19 of 44 -->

第 19 页：3.1.5 工具调用数据；3.2 节 chunk-wise rollout 和 3.2.1 强化学习数据整理。

<!-- page 20 of 44 -->

第 20 页：算法 1 给出基于 chunk-wise rollout 的策略优化流程；3.2.1 节的数学、代码数据来源与去重，3.2.2 训练配方开篇。

<!-- page 21 of 44 -->

第 21 页：3.2.2 节继续；表 5 对比普通 rollout 与 chunk-wise rollout；3.2.3 节稳定化的分块 rollout。

<!-- page 22 of 44 -->

第 22 页：3.2.3 节收尾，3.2.4 实验分析，3.2.5 实现细节，3.3 节 BitCPM4 三值量化感知训练开篇。

> **问:** MiniCPM4.1 的混合推理模式在哪里写？是不是只有这个目录里才有？
> 两份源文里都有，位置一样。第 1 页的链接和摘要、第 30 页的表 9、第 31 页的表 10、第 38 页的致谢都点名 MiniCPM4.1，两个目录读到的是同样的段落。

<!-- page 23 of 44 -->

第 23 页：图 5 画的是语言建模 loss 与 QAT 后训练 token 占比之间的关系；3.3.1 高效量化感知训练，3.3.2 极低比特模型的讨论。

![Chart block](images/p23-fp8-tokens-all-tokens.png)

<!-- page 24 of 44 -->

第 24 页：表 6 把 BitCPM4 和其他代表性模型对比；第 4 章「高效推理与部署」和 4.1 节 CPM.cu 从这里开始。

<!-- page 25 of 44 -->

第 25 页：图 6 是 FR-Spec 的示意图，4.1.1 节讲按频率排序的词表构建和草稿验证。源 md 这一节标题前混进了一串 OCR 残字，两份源文里这串残字也一模一样。

![Image block](images/p25-figure-6-the-illustration-of-fr-spec-which-requires-the.png)

<!-- page 26 of 44 -->

第 26 页：4.1.1 节收尾，4.1.2 节 P-GPTQ 前缀感知的训练后量化，4.1.3 节投机采样与量化、长上下文的结合。

<!-- page 27 of 44 -->

第 27 页：表 7 对比不同量化方法的评测结果；4.2 节 ArkInfer 跨平台部署和 4.2.1 跨平台兼容架构。

<!-- page 28 of 44 -->

第 28 页：4.2.2 可复用的投机解码与约束解码，4.2.3 可扩展的模型前端。

<!-- page 29 of 44 -->

第 29 页：第 5 章评测开篇，5.1 实验设置，5.2 标准评测，表 8 是 MiniCPM4 与其他开源模型的对比。

> **确认:** 评测表里的数字，两个目录会不会一份只收 4、一份只收 4.1？
> 不会。表 8 收 MiniCPM4，表 9 和表 10 收 MiniCPM4.1，这三张表在两份源文里是同一段文本，每个数字都相同。

<!-- page 30 of 44 -->

第 30 页：表 9 是 MiniCPM4.1 在深度推理任务上与其他开源模型的对比；5.3 节长上下文评测开篇。

<!-- page 31 of 44 -->

第 31 页：图 7 是稀疏注意力下长序列 prefill 的评测结果；表 10 是 MiniCPM4.1 在 RULER（32K）上的 Full 与 Sparse 两行结果；5.4 节效率评测。

![Chart block](images/p31-figure-7-the-evaluation-results-for-long-sequence.png)

<!-- page 32 of 44 -->

第 32 页：图 8 是 MiniCPM4-Survey 的流程大纲；第 6 章应用开篇。

![Image block](images/p32-figure-8-the-outline-of-minicpm4-survey.png)

<!-- page 33 of 44 -->

第 33 页：6.1 节 MiniCPM4-Survey 可信综述生成，6.1.1 数据构建。

<!-- page 34 of 44 -->

第 34 页：6.1.1 节收尾，6.1.2 训练策略，表 11 列出不同 agent 能力对应的奖励设计。

<!-- page 35 of 44 -->

第 35 页：6.1.2 节收尾，6.1.3 评测，表 12 对比几套综述生成系统。

<!-- page 36 of 44 -->

第 36 页：6.2 节 MiniCPM4-MCP 基于 Model Context Protocol 的工具调用，6.2.1 数据构建，6.2.2 训练策略。

<!-- page 37 of 44 -->

第 37 页：表 13 是 MCP 工具调用的准确率；6.2.3 评测。

<!-- page 38 of 44 -->

第 38 页：第 7 章结论与后续工作，第 8 章贡献与致谢。

> **回看:** PDF 会不会比 md 多出 4.1 专属的附录？
> 不会。两个目录的 PDF 同为 2590544 字节、SHA256 前缀相同，页数都是 44，最后几页都是参考文献。

<!-- page 39 of 44 -->

第 39 页：贡献名单收尾，参考文献开始。

<!-- page 40 of 44 -->

第 40 页：参考文献。

<!-- page 41 of 44 -->

第 41 页：参考文献。

<!-- page 42 of 44 -->

第 42 页：参考文献。

<!-- page 43 of 44 -->

第 43 页：参考文献。

<!-- page 44 of 44 -->

第 44 页：参考文献结束。

> **对一下:** 两个目录各留一份对照稿，会不会让人以为存在两个版本？
> 本稿只做指路，内容读法以 `../minicpm4/minicpm4-bi.md` 为准；两份源文字节相同，没有第二个版本。
