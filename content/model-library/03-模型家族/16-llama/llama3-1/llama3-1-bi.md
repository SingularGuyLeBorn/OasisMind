---
title: "Llama 3.1 · 对照译稿"
category: "模型库"
tags: ["Llama", "对照译稿"]
published: true
excerpt: "Llama 3.1 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
# Llama 3.1 对照稿（读法见 llama3 目录）

> 本目录的 `llama3-1.md` 和同级目录 `../llama3/llama3.md` 字节完全相同：两份都是 384318 字节，SHA256 前缀都是 6db6ff9cd19703cb。两份 PDF 也相同（SHA256 前缀 481f1599468f95a0），两边 `images/` 各 39 张图，文件名和内容逐一相同。
>
> 所以这里不再把 92 页重译一遍。逐段中英对照的读法在 llama3 目录那一份对照稿里，读那一份就等于读这一份。本稿只保留 92 个页标，每页用一句话说明这一页讲什么，图挂在原来的页上，方便拿 PDF 对页。

<!-- page 1 of 92 -->

标题 The Llama 3 Herd of Models，作者署名，摘要，第 1 节引言开头。

> **想：** 目录叫 llama3-1，论文标题为什么是 Llama 3?
> 源文写着 "All the results presented in this paper are for the Llama 3.1 models，which we will refer to as Llama 3 throughout for brevity." 论文只有一篇（arXiv 2407.21783v3）。全文说的 Llama 3 就是 3.1。两个目录放的是同一份源文。

<!-- page 2 of 92 -->

引言续，表 1 列出 Llama 3 和 Llama 3.1 各规格的发布时间与能力。

> **核对：** 表 1 的 July 2024 在另一份源文里会不会少一行？
> 表 1 里 Llama 3.1 8B，70B，405B 及其 Instruct 版都标 July 2024。这张表在 llama3.md 里是同一页同一位置。两份 md 字节相同，没有哪一份多一行或少一行。

<!-- page 3 of 92 -->

表 2 旗舰模型与同类模型的基准对比；第 2 节总体概览：预训练，后训练，多模态扩展。

<!-- page 4 of 92 -->

第 3 节预训练，3.1 预训练数据，3.1.1 网页数据清洗。

![图 1](images/p04-figure-1-illustration-of-the-overall-architecture-and.png)

> **问：** 图的相对路径要不要改成指向 llama3 目录？
> 不用改。本目录自带一份 `images/`，39 个文件和 llama3 那边同名同哈希。`images/` 在两个目录里都能打开同一张图。

<!-- page 5 of 92 -->

3.1.1 续：去重，启发式过滤，质量分类器。

<!-- page 6 of 92 -->

3.1.2 数据配比，3.1.3 退火数据，3.2 模型结构。

<!-- page 7 of 92 -->

3.2.1 节 Scaling Laws：用小模型的计算预算曲线定旗舰模型的规模。

<!-- page 8 of 92 -->

3.3 基础设施与效率，3.3.1 训练集群。

![图 2](images/p08-figure-2-scaling-law-isoflops-curves-between-6-times-1.png)

![图 3](images/p08-figure-3-number-of-training-tokens-in-identified.png)

<!-- page 9 of 92 -->

3.3.1 续：算力，存储，网络。

![无编号图表](images/p09-chart.png)

![图 4](images/p09-figure-4-scaling-law-forecast-for-arc-challenge-left.png)

<!-- page 10 of 92 -->

3.3.2 模型并行。

<!-- page 11 of 92 -->

3.3.2 续：四维并行的切分顺序。

![图 5](images/p11-figure-5-illustration-of-4d-parallelism-gpus-are.png)

<!-- page 12 of 92 -->

3.3.3 集合通信。

![图 6](images/p12-figure-6-illustration-of-pipeline-parallelism-in-llama.png)

<!-- page 13 of 92 -->

3.3.4 可靠性与运维：训练中断的原因统计。

<!-- page 14 of 92 -->

3.4 训练配方，3.4.1 初始预训练，3.4.2 长上下文预训练。

<!-- page 15 of 92 -->

3.4.3 退火；第 4 节后训练，4.1 建模，4.1.1 对话格式。

![图 7](images/p15-figure-7-illustration-of-the-overall-post-training.png)

<!-- page 16 of 92 -->

4.1.2 奖励模型，4.1.3 监督微调，4.1.4 DPO，4.1.5 模型平均。

<!-- page 17 of 92 -->

4.1.6 迭代轮次，4.2 后训练数据，4.2.1 偏好数据，4.2.2 SFT 数据。

<!-- page 18 of 92 -->

4.2.3 数据处理与质量控制。

<!-- page 19 of 92 -->

4.3 能力，4.3.1 代码。

<!-- page 20 of 92 -->

4.3.1 代码续。

<!-- page 21 of 92 -->

4.3.1 代码续。

<!-- page 22 of 92 -->

4.3.2 多语言。

<!-- page 23 of 92 -->

4.3.3 数学与推理。

<!-- page 24 of 92 -->

4.3.4 长上下文，4.3.5 工具使用。

<!-- page 25 of 92 -->

4.3.5 工具使用续。

<!-- page 26 of 92 -->

4.3.6 事实性。

![图 10](images/p26-figure-10-multi-step-tool-usage-example-of-llama-3.png)

<!-- page 27 of 92 -->

4.3.6 事实性续。

![图 11](images/p27-figure-11-processing-file-uploads-example-of-llama-3.png)

<!-- page 28 of 92 -->

4.3.7 可控性；第 5 节结果，5.1 预训练模型，5.1.1 标准基准。

<!-- page 29 of 92 -->

5.1.1 标准基准续。

<!-- page 30 of 92 -->

5.1.2 模型鲁棒性。

![无编号图表](images/p30-chart.png)

![图 12](images/p30-figure-12-performance-of-pre-trained-llama-3-8b-and-70b.png)

<!-- page 31 of 92 -->

5.1.2 鲁棒性续。

<!-- page 32 of 92 -->

5.1.2 鲁棒性续：MMLU 上不同设计选择下的表现。

![无编号图表](images/p32-chart.png)

![图 13](images/p32-figure-13-robustness-of-our-pre-trainedlanguagemodels.png)

![无编号图表](images/p32-chart-2.png)

![图 14](images/p32-figure-14-robustness-of-our-pre-trainedlanguagemodels.png)

<!-- page 33 of 92 -->

5.1.3 对抗基准，5.1.4 污染分析。

![无编号图表](images/p33-chart.png)

![图 15](images/p33-figure-15-adversarial-versus-non-adversarial.png)

<!-- page 34 of 92 -->

5.2 后训练模型。

<!-- page 35 of 92 -->

5.2.1 通用知识与指令遵循基准，5.2.2 能力考试。

<!-- page 36 of 92 -->

5.2.3 代码基准。

<!-- page 37 of 92 -->

5.2.4 多语言基准。

<!-- page 38 of 92 -->

5.2.5 数学与推理基准，5.2.6 长上下文基准，5.2.7 工具使用表现。

<!-- page 39 of 92 -->

5.3 人工评测。

<!-- page 40 of 92 -->

5.4 安全。

![图 16](images/p40-figure-16-human-evaluation-results-for-llama-3-405b-vs.png)

<!-- page 41 of 92 -->

5.4.1 安全基准构建。

![图 17](images/p41-figure-17-human-evaluation-results-for-the-llama-3-405b.png)

<!-- page 42 of 92 -->

5.4.2 安全预训练，5.4.3 安全微调。

<!-- page 43 of 92 -->

5.4.3 安全微调续：违规率与误拒率两个指标，微调数据的构成。

![图 18](images/p43-figure-18-influence-of-model-size-on-safety-mix-design.png)

<!-- page 44 of 92 -->

5.4.4 安全结果。

![无编号图表](images/p44-chart.png)

![图 19](images/p44-figure-19-violation-rates-vr-and-false-refusal-rates.png)

![无编号图表](images/p44-chart-2.png)

![图 20](images/p44-figure-20-violation-rates-vr-and-false-refusal-rates.png)

<!-- page 45 of 92 -->

5.4.4 安全结果续。

![图 21](images/p45-figure-21-violation-and-false-refusal-rates-across.png)

<!-- page 46 of 92 -->

5.4.5 网络安全与化学/生物武器安全。

<!-- page 47 of 92 -->

5.4.5 续：提示注入与钓鱼说服力。

![图 22](images/p47-figure-22-text-based-prompt-injection-success-rates-per.png)

![图 23](images/p47-figure-23-average-spear-phishing-persuasiveness-scores.png)

<!-- page 48 of 92 -->

5.4.6 红队。

<!-- page 49 of 92 -->

5.4.7 系统级安全。

<!-- page 50 of 92 -->

5.4.7 系统级安全续。

<!-- page 51 of 92 -->

5.4.8 局限；第 6 节推理，6.1 流水线并行。

<!-- page 52 of 92 -->

6.2 FP8 量化。

![无编号图表](images/p52-chart.png)

![图 24](images/p52-figure-24-effect-of-micro-batching-on-inference.png)

<!-- page 53 of 92 -->

6.2 FP8 量化续。

![无编号截图](images/p53-image.png)

![无编号图表](images/p53-chart.png)

![图 25](images/p53-figure-25-illustration-of-tensor-wise-and-row-wise-fp8.png)

![图 26](images/p53-figure-26-reward-score-distribution-for-llama-3-405b.png)

> **看表：** 第 53 页两张无编号碎片，另一份里有没有？
> 有。报告的 `p53-image.png` 和 `p53-chart.png` 在 llama3 目录里同名同哈希。连抽取碎片都一样，两份是同一次抽取后复制成两个目录。

<!-- page 54 of 92 -->

第 7 节视觉实验，7.1 数据，7.1.1 图像数据。

![无编号图表](images/p54-chart.png)

![图 27](images/p54-figure-27-throughput-latency-trade-off-in-fp8-inference.png)

<!-- page 55 of 92 -->

7.1.1 图像数据续。

![图 28](images/p55-figure-28-illustration-of-the-compositional-approach-to.png)

<!-- page 56 of 92 -->

7.1.2 视频数据，7.2 视觉模型结构。

<!-- page 57 of 92 -->

7.3 视觉模型规模。

<!-- page 58 of 92 -->

7.4 视觉预训练，7.5 视觉后训练，7.5.1 SFT 数据。

<!-- page 59 of 92 -->

7.5.2 SFT 配方，7.5.3 偏好数据。

<!-- page 60 of 92 -->

7.5.4 奖励模型，7.5.5 DPO，7.5.6 拒绝采样，7.5.7 质量调优。

<!-- page 61 of 92 -->

7.6 图像识别结果，7.7 视频识别结果。

<!-- page 62 of 92 -->

7.7 视频识别结果续。

<!-- page 63 of 92 -->

第 8 节语音实验，8.1 数据，8.1.1 语音理解数据。

![图 29](images/p63-figure-29-architecture-of-our-speech-interface-for.png)

<!-- page 64 of 92 -->

8.1.2 语音生成数据，8.2 语音模型结构，8.2.1 语音理解。

<!-- page 65 of 92 -->

8.2.2 语音生成，8.3 训练配方，8.3.1 语音理解。

<!-- page 66 of 92 -->

8.3.2 语音生成，8.4 语音理解结果。

<!-- page 67 of 92 -->

8.5 语音生成结果。

<!-- page 68 of 92 -->

8.5 语音生成结果续。

![图 30](images/p68-figure-30-transcribed-dialogue-examples-using-the.png)

<!-- page 69 of 92 -->

第 9 节相关工作，9.1 语言。

<!-- page 70 of 92 -->

9.2 多模态，第 10 节结论。

<!-- page 71 of 92 -->

结论续。

<!-- page 72 of 92 -->

贡献者与致谢：核心贡献者，贡献者名单。

<!-- page 73 of 92 -->

致谢。

<!-- page 74 of 92 -->

致谢名单续。

<!-- page 75 of 92 -->

参考文献开始。

<!-- page 76 of 92 -->

参考文献续。

<!-- page 77 of 92 -->

参考文献续。

<!-- page 78 of 92 -->

参考文献续。

<!-- page 79 of 92 -->

参考文献续。

<!-- page 80 of 92 -->

参考文献续。

<!-- page 81 of 92 -->

参考文献续。

<!-- page 82 of 92 -->

参考文献续。

<!-- page 83 of 92 -->

参考文献续。

<!-- page 84 of 92 -->

参考文献续。

<!-- page 85 of 92 -->

参考文献续。

<!-- page 86 of 92 -->

参考文献续。

<!-- page 87 of 92 -->

参考文献续。

<!-- page 88 of 92 -->

参考文献续。

<!-- page 89 of 92 -->

参考文献续。

<!-- page 90 of 92 -->

参考文献续。

<!-- page 91 of 92 -->

参考文献续。

<!-- page 92 of 92 -->

参考文献结束，最后一条是 Zhu 等人的 MiniGPT-4。

> **确认：** 两份源文的结尾是不是同一条参考文献？
> 是。两份都是 92 页，都停在 Zhu 等人的 MiniGPT-4。页数，图数，末条一致。这一份没有 llama3 那份以外的内容。
