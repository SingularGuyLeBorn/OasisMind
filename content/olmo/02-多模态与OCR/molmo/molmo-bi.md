---
title: "Molmo 对照译稿"
category: "多模态与OCR"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "Molmo 与 PixMo 论文 (arXiv 2409.17146) 的逐页中文导读, 每页按原文顺序转述各段要点, 保留全部表格数据, 图和参考文献列表."
---

# Molmo and PixMo: Open Weights and Open Data for State-of-the-Art Vision-Language Models

本稿按 PDF 的 30 页逐页对应, 每页用中文转述原文各段的要点和全部数字, 英文只保留标题和图表题名. 表格数据按 LaTeX 源码整理, 参考文献按原编号列出.

<!-- page 1 of 30 -->

作者: Matt Deitke, Christopher Clark, Sangho Lee, Rohun Tripathi, Yue Yang, Jae Sung Park, Mohammadreza Salehi, Niklas Muennighoff, Kyle Lo, Luca Soldaini, Jiasen Lu 等, 单位为 Allen Institute for AI (Ai2) 与华盛顿大学. 项目页: https://molmo.allenai.org

## Abstract

当时最强的视觉语言模型 (VLM) 仍是闭源的. 开放权重的模型里, 最好的那些大量依赖闭源 VLM 生成的合成数据, 等于把闭源模型蒸馏成开放模型. 学界因此缺少从零构建高性能 VLM 的基础知识.

论文给出 Molmo 系列模型, 核心贡献是 PixMo 数据集: 一份用于预训练的高细节图像描述数据, 一份用于微调的自由问答数据, 以及一份新的 2D 指点 (pointing) 数据, 全部不经外部 VLM 采集. 摘要称 72B 模型在开放权重和开放数据模型中领先, 在学术基准和人工评测上都仅次于 GPT-4o, 并优于 Claude 3.5 Sonnet, Gemini 1.5 Pro 与 Flash 等若干闭源系统. 模型权重, 数据和源码在 https://molmo.allenai.org 公开.

摘要这句和表 1 不一致: 11 项平均里 Molmo-72B 为 81.2, GPT-4o-0513 为 78.5, Molmo-72B 排第一; 只有 Elo 一栏 Molmo-72B (1077) 落后于 GPT-4o (1079). 引言后文和表 1 的说法是「学术平均最高, 人工评测第二」.

## 1. Introduction

大型多模态模型已被广泛使用, 但性能最好的那批 (GPT-4o, Gemini 1.5 Pro, Claude 3.5 Sonnet) 只给 API, 权重和数据都不公开.

为推动研究, 学界发布过一批开放 VLM, 但早期开放模型和闭源模型差距明显. 后来更强的开放权重模型越来越依赖闭源 VLM 产出的合成数据, 实际上是闭源模型的蒸馏版本. 论文认为这类模型绕开了「如何从零构建 VLM」这个问题.

Molmo (Multimodal Open Language Model) 由此提出: 一族开放 VLM, 达到当时最强水平, 并且所有视觉语言训练数据都不依赖任何 VLM (包括闭源 VLM). 模型架构是常规的「视觉编码器 + 语言模型」, 成功的关键在于建模细节和新采集的数据.

<!-- page 2 of 30 -->

![](images/mainfigure_3_compressed.png)
Figure 1. PixMo datasets (left) and the capabilities they enable (right).

图 1 题注要点: 左侧是 PixMo 的各个子集, 右侧是这些数据赋予 Molmo 的能力, 包括稠密描述, 自由问答, 指点和计数, 读文档图表, 读时钟等.

高质量多模态数据难以采集. 论文判断, 让人直接打字写长描述效果不好: 人写到后面会变短, 而且容易漏细节. PixMo-Cap 改为让标注员对着图片口述 60 到 90 秒, 再把录音转写成文字, 这样描述更长更细, 还能保证数据不是由 VLM 生成的.

PixMo-Cap 包含 712k 张图片, 描述长达 200 词以上. 论文列出直接让人打字的三个问题: 只盯着少数显著元素, 打长段落耗时, 而且标注员可能从闭源 VLM 复制粘贴, 违背不蒸馏的目标. 换成口述后, 描述更细, 用时更短, 每条描述还附有录音, 可以证明没有借助 VLM.

微调数据方面, PixMo 还有若干子集: 标注员和纯文本 LLM 协作写出的自由问答 (AskModelAnything), 以及一组合成数据 (文档图表, 时钟, 计数).

另一个新数据源是 PixMo-Points: 标注员在图上点出文本描述的对象. 用点而不用框, 标注更快, 采集量更大 (2.3M 条问答-点对). 有了指点数据, 模型可以先逐个指出对象再计数, 也可以在回答时把点当作视觉解释, 还为机器人和网页智能体这类需要定位的场景提供了接口.

模型沿用「预训练 LLM + 视觉编码器」的常规设计, 论文列出的改进有: 简化的两阶段训练流程, 新的重叠多 crop 策略, 高效训练多标注图像的方法, 以及优化器和视觉语言连接器设置上的经验.

评测覆盖 11 个学术基准和一次按用户偏好排名的人工评测. 引言给出的结论是: MolmoE-1B 两项都接近 GPT-4V; 两个 7B 模型两项都在 GPT-4V 和 GPT-4o 之间; Molmo-72B 学术分最高, 人工偏好第二, 仅次于 GPT-4o, 并胜过 Gemini 1.5 Pro, Flash 和 Claude 3.5 Sonnet. 论文还预告会发布一个基于 MetaCLIP 视觉编码器和 OLMo 的完全开放版本, 并提供大量消融.

<!-- page 3 of 30 -->

![](images/arch6_compressed.png)
Figure 2. Molmo follows the simple and standard design of connecting a vision encoder and a language model.

图 2 题注要点: 预处理把图片切成多个 crop, 视觉编码器分别编码, 连接器把 patch 特征池化并投影到 LLM 的嵌入维度, 再和文本 token 一起送入仅解码器 LLM.

## 2. Architecture · 架构

模型由四部分组成: 预处理器把输入图像变成一组多尺度多 crop 图像; ViT 图像编码器把每张 crop 独立编码为 patch 特征; 连接器把 patch 特征投影到 LLM 输入空间并池化以减少 token 数; 仅解码器 Transformer LLM 生成文本.

在这个模板上, 换不同的视觉编码器和 LLM 就得到不同的模型. 论文所有主结果都用 OpenAI 的 ViT-L/14 336px CLIP. LLM 一侧有四档: 最省算力的 MolmoE-1B 用完全开放的 OLMoE-1B-7B MoE; Molmo-7B-O 用完全开放的 OLMo-7B-1024; Molmo-7B-D 用开放权重的 Qwen2 7B; Molmo-72B 用 Qwen2 72B.

![](images/overlappedcrops-v2_compressed.png)
Figure 3. An image cropped without (left) and with (right) overlap.

图 3 题注要点: 左边是不重叠的切法, 右边是重叠切法. 高亮区域是送进 LLM 的 patch, 重叠切法让每个 patch 在送进 LLM 之前都能看到它在原图中的上下文.

**Cropping. 切图.** 多数 ViT 只吃固定分辨率的方图, 对细粒度任务 (OCR, 看图表) 不够用. Molmo 沿用多 crop 做法: 先选一个行列网格, 把图像放大或缩小到这个网格并切成方块, 另外再把整张图缩放成一个低分辨率全局 crop, 两者一起交给 ViT.

切图的问题是 crop 边缘的 patch 看不到 crop 外面的内容. Molmo 让相邻 crop 互相重叠, 每个 patch 都在至少一个 crop 里有完整上下文. 重叠部分的 patch 特征不会重复送进连接器和 LLM, 拼起来的 patch 正好铺满原图.

**Vision-language connector. 视觉语言连接器.** 图像编码后, 取 ViT 两层的 patch 特征 (倒数第 3 层和倒数第 10 层) 拼起来. 每个 2×2 patch 窗口用多头注意力池化成一个向量, 窗口内 patch 的均值作为 query. 池化后的向量经一个 MLP 投影到 LLM 嵌入空间. 论文报告这种注意力池化优于直接拼接特征.

**Arranging vision tokens. 排列视觉 token.** 池化后的视觉 token 按顺序排列: 先放低分辨率全局 crop, 再放高分辨率 crop 拼成的 patch 网格, 按从左到右, 从上到下的行优先顺序. 低分辨率和高分辨率两段序列各有起止特殊 token, 行与行之间插入行尾 token 标出换行.

> **拆开:** 「重叠 4 个 patch」是指相邻 crop 共享 4 个 patch 吗?
> 答: 不是. 附录 A.1 说 crop 之间的重叠是 4 个 patch (56 像素). 官方代码 `overlap_margins=(4,4)` 的含义是每张 crop 两侧各丢掉 4 个 patch, 只保留中间 $24-8=16$ 个 patch. crop 步长因此是 $16 \times 14 = 224$ 像素, 相邻两张 crop 实际共享 $24-16=8$ 个 patch, 即 112 像素. 4 个 patch 是每侧丢弃的边距, 不是相邻 crop 的重叠宽度.

<!-- page 4 of 30 -->

**Dropout.** LLM 上加残差 dropout, ViT 和连接器不加. 稠密描述预训练时 dropout 只作用在文本 token 上, 让模型更依赖编码后的图像而不是语言先验. 微调不用这种限定, 因为目标回答短, 只对文本做 dropout 的量太少. 消融显示预训练的仅文本 dropout 对描述和下游任务都有帮助.

**Multi-annotated images. 多标注图像.** 很多图有多条标注, 比如同一张图对应多个问答. 做法是把同一张图的所有标注拼进一个序列, 加注意力掩码让每条标注只看到图像 token 和自己的 token, 看不到其他标注. 论文称这和逐条训练图文对等价. 这样处理的图像数减少约三分之二, 训练时间缩短一半以上, 平均序列长度只增加 25%.

> **核对:** 拼接多条标注后 loss 真的和逐条训练一样吗?
> 答: 掩码保证了每条标注看到的上下文相同, 但官方代码对 loss 另有加权. `model_preprocessor.py` 在 `multi_annotation_weighting="root_subsegments"` 下把每条标注的 loss 乘以 $1/\sqrt{n}$, $n$ 是同图标注条数. 同一张图的 $n$ 条标注合计权重是 $\sqrt{n}$, 逐条训练时是 $n$. 论文没有提到这项加权.

## 3. Data · 数据

PixMo 一共七个数据集, 三个由人工标注 (Cap, AskModelAnything, Points), 四个用纯文本 LLM 写代码或文字合成 (CapQA, Docs, Clocks, Count 的标签来自检测器). 没有一个子集用到 VLM.

**PixMo-Cap.** 目标是高质量预训练描述. 图片是覆盖约 70 个主题的网络图片 (路牌, 梗图, 食物, 手绘, 网页, 模糊照片等). 早期每张图由三名标注员各口述至少 60 秒; 后期改为每张图一名标注员, 至少 90 秒, 效率更高而质量不降. 口述时按七个提示问题展开, 问题列在附录.

录音用常规语音识别系统转写, 得到原始转写. 再用纯文本 LLM 生成最终描述: 有多条转写时做归纳, 只有一条时做润色 (去掉口语痕迹, 统一风格). 合计 712k 张图, 1.3M 条转写和描述. 描述平均 196 个英文词, COCO 描述约 11 个, Localized Narratives 约 37 个.

**PixMo-AskModelAnything.** 为了让模型能回答真实使用中的各种问题, 标注员和纯文本 LLM 合作构造图像-问题-答案三元组. 标注员从大图池选图并写问题; 系统先跑非 VLM 的 OCR 模型, 并用一个只在 PixMo-Cap 上训过的描述模型生成图片描述, 再由纯文本 LLM 根据 OCR 结果和稠密描述作答. 标注员可以接受答案; 不满意时指出问题, 要求 LLM 修改, 直到满意为止. 最终是 73k 张图上的 162k 条问答.

**PixMo-Points.** 指点数据服务三个目标: 按文字指出对象; 靠逐个指点计数; 回答问题时用点作视觉解释. 前两个目标的采集方式是让标注员在图上点一个东西, 写下描述, 再把同类对象逐一全部点出. 另外还采了「图中不存在」的样本. 结果是 223k 张图上的 2.3M 条问题-点对.

为了把点当解释用, 论文改造了 AskModelAnything 的流程: 标注员先点出与问题相关的位置, LLM 在答案里引用这些点. 这部分是 14k 张图上的 79k 条标注.

**PixMo-CapQA.** 只给纯文本 LLM 看一张图的真实描述, 让它出题并作答, 共从 165k 张图生成 214k 条问答.

**PixMo-Docs.** 用一套细调过的提示框架, 让 LLM 为 255k 张以文字和图形为主的图片 (图表, 文档, 表格, 示意图) 写渲染代码, 再让 LLM 只读代码 (不看图片) 生成 2.3M 条问答.

**PixMo-Clocks.** 渲染合成时钟并配上读时间的问答. 约 50 种表壳, 约 160k 种逼真的表盘, 时间随机, 共 826k 条样本.

**PixMo-Count.** 在网络图片上跑非 VLM 的目标检测器, 每张图取严格置信度阈值下检测数最多的类别, 生成计数问答. 仿照 CountBenchQA, 对计数 2 到 10 每档人工核对 120 张, 得到验证集和测试集各 540 张. 论文称它比 CountBenchQA 更难. 其余计数在 0 到 10 之间的样本构成 36k 张图的训练集, 每张带点 (对象中心) 和一条问答.

<!-- page 5 of 30 -->

## 4. Training · 训练

**Pre-training. 预训练.** 所有参数都在 PixMo-Cap 上训练, 任务是生成描述. 提示词指定生成长描述 (`long_caption`) 还是转写 (`transcript`); 90% 的情况下提示里还带一个长度提示, 告诉模型目标长度.

很多工作会先单独训练连接器 (冻结 ViT 和 LLM), 再进入全参数训练. Molmo 认为在 PixMo-Cap 上预训练时这一步没有必要. 做法是给连接器更高的学习率和更短的预热, 让它在训练初期快速追上. 去掉这个阶段能缩短训练时间, 流程更简单, 也不再需要这一阶段常用的网络级含噪数据.

预训练用 AdamW 跑 4 个 epoch, 余弦学习率衰减到峰值的 10%. 学习率为连接器 2e-4, ViT 6e-6, LLM 2e-5; 连接器预热 200 步, ViT 和 LLM 预热 2000 步. 梯度裁剪对 LLM, 图像编码器和连接器分别进行.

![](images/fine-tune-mixing-rates-font18.png)
Figure 4. Datasets used for fine-tuning, shown in proportion to their sampling rates.

图 4 题注要点: 微调所用各数据集按采样率画出面积, PixMo 子集和学术数据集分色显示.

**Fine-tuning. 微调.** 微调数据是 PixMo 各子集和 16 个公开学术数据集的混合, 包括 VQA v2.0 (COCO 2014 子集), TextVQA, OK-VQA, ChartQA, DocVQA, InfographicVQA, AI2D, A-OKVQA, AndroidControl, ScienceQA, TabMWP, ST-VQA, TallyQA, DVQA, FigureQA, PlotQA.

采样率大体和数据集大小的平方根成正比. 几个很大的合成集 (PlotQA, FigureQA, DVQA, PixMo-Clocks) 手动压低; 指点任务比问答学得慢, 所以大幅抬高指点数据的权重.

学术数据集教会模型某些具体技能, 但答案往往很短, 还带有采集时的格式习惯 (DocVQA 要求照抄原文, ChartQA 的数字不带逗号), 不适合直接面向用户. 为避免这些风格渗进日常对话, 学术集的提示前加任务风格标签 (例如 `vqa2:`), 模型学会只在标签出现时用这种风格.

AskModelAnything, CapQA, Points, Count, Cap 这几个 PixMo 子集不加风格标签. PixMo-Cap 配约 30 种描述提示, 指点数据配约 100 种问法模板, 训练时随机抽取. 「用点解释答案」的数据仍保留风格标签, 因为这种模式不够可靠, 只应在用户要求时启用.

**Pointing. 指点.** 模型以纯文本坐标输出点, 坐标归一化到 0 到 100. 指多个对象时, 论文称点按从上到下, 从左到右的顺序排列. 计数采用类似 CoT 的方式: 先逐个输出点, 最后输出总数.

> **确认:** 点的排序真是「先上下, 后左右」吗?
> 答: 和官方代码不一致. `data_formatter.py` 的 `points_to_text` 以 $x \times 10000 + y$ 为排序键, 主键是 $x$, 实际是先从左到右, $x$ 相同时再从上到下.

## 5. Evaluation · 评测

论文提醒, 学术基准的比较要小心: 提示方式, 是否对齐基准特有的答案风格, 是否用过基准训练集, 都会明显影响分数. 所以另做一次人工评测, 按用户偏好给模型排名.

学术基准共 11 个: 10 个常用数据集 (AI2D, ChartQA, VQA v2.0, DocVQA, InfographicVQA, TextVQA, RealWorldQA, MMMU, MathVista, CountBenchQA) 加上更难的 PixMo-Count 测试集. 分数优先取作者发表值, 缺的从技术报告或 OpenVLM Leaderboard 等来源取已报告的最好值, 仍缺的自己算. 论文指出评测细节可能让分数相差 10% 左右, 而提示和数据处理步骤常常不公开, 难以复现.

<!-- page 6 of 30 -->

Table 1. Academic benchmark results covering ten commonly used datasets plus PixMo-Count, and human preference Elo.

| model | AI2D test | ChartQA test | VQA v2.0 testdev | DocVQA test | InfoQA test | TextVQA val | RealWorldQA | MMMU val | MathVista testmini | CountBenchQA | PixMo-Count test | Average | Elo score | Elo rank |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *API call only* |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| GPT-4V | 89.4 | 78.1 | 77.2 | 87.2 | 75.1 | 78.0 | 61.4 | 63.1 | 58.1 | 69.9 | 45.0 | 71.1 | 1041 | 10 |
| GPT-4o-0513 | 94.2 | 85.7 | 78.7 | 92.8 | 79.2 | 77.4 | 75.4 | 69.1 | 63.8 | 87.9 | 59.6 | 78.5 | 1079 | 1 |
| Gemini 1.5 Flash | 91.7 | 85.4 | 80.1 | 89.9 | 75.3 | 78.7 | 67.5 | 56.1 | 58.4 | 81.6 | 61.1 | 75.1 | 1054 | 7 |
| Gemini 1.5 Pro | 94.4 | 87.2 | 80.2 | 93.1 | 81.0 | 78.7 | 70.4 | 62.2 | 63.9 | 85.8 | 64.3 | 78.3 | 1074 | 3 |
| Claude-3 Haiku | 86.7 | 81.7 | 68.4 | 88.8 | 56.1 | 67.3 | 45.5 | 50.2 | 46.4 | 83.0 | 43.9 | 65.3 | 999 | 18 |
| Claude-3 Opus | 88.1 | 80.8 | 66.3 | 89.3 | 55.6 | 67.5 | 49.8 | 59.4 | 50.5 | 83.6 | 43.3 | 66.7 | 971 | 21 |
| Claude-3.5 Sonnet | 94.7 | 90.8 | 70.7 | 95.2 | 74.3 | 74.1 | 60.1 | 68.3 | 67.7 | 89.7 | 58.3 | 76.7 | 1069 | 4 |
| *Open weights only* |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| PaliGemma-mix-3B | 72.3 | 33.7 | 76.3 | 31.3 | 21.4 | 56.0 | 55.2 | 34.9 | 28.7 | 80.6 | 60.0 | 50.0 | 937 | 27 |
| Phi3.5-Vision-4B | 78.1 | 81.8 | 75.7 | 69.3 | 36.6 | 72.0 | 53.6 | 43.0 | 43.9 | 64.6 | 38.3 | 59.7 | 982 | 19 |
| Qwen2-VL-7B | 83.0 | 83.0 | 82.9 | 94.5 | 76.5 | 84.3 | 70.1 | 54.1 | 58.2 | 76.5 | 48.0 | 73.7 | 1025 | 14 |
| Qwen2-VL-72B | 88.1 | 88.3 | 81.9 | 96.5 | 84.5 | 85.5 | 77.8 | 64.5 | 70.5 | 80.4 | 55.7 | 79.4 | 1037 | 12 |
| InternVL2-8B | 83.8 | 83.3 | 76.7 | 91.6 | 74.8 | 77.4 | 64.2 | 51.2 | 58.3 | 57.8 | 43.9 | 69.4 | 953 | 23 |
| InternVL2-Llama-3-76B | 87.6 | 88.4 | 85.6 | 94.1 | 82.0 | 84.4 | 72.7 | 58.2 | 65.5 | 74.7 | 54.6 | 77.1 | 1018 | 16 |
| Pixtral-12B | 79.0 | 81.8 | 80.2 | 90.7 | 50.8 | 75.7 | 65.4 | 52.5 | 58.0 | 78.8 | 51.7 | 69.5 | 1016 | 17 |
| Llama-3.2V-11B-Instruct | 91.1 | 83.4 | 75.2 | 88.4 | 63.6 | 79.7 | 64.1 | 50.7 | 51.5 | 73.1 | 47.4 | 69.8 | 1040 | 11 |
| Llama-3.2V-90B-Instruct | 92.3 | 85.5 | 78.1 | 90.1 | 67.2 | 82.3 | 69.8 | 60.3 | 57.3 | 78.5 | 58.5 | 74.5 | 1063 | 5 |
| *Open weights + data (distilled)* |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| LLaVA-1.5-7B | 55.5 | 17.8 | 78.5 | 28.1 | 25.8 | 58.2 | 54.8 | 35.7 | 25.6 | 40.1 | 27.6 | 40.7 | 951 | 26 |
| LLaVA-1.5-13B | 61.1 | 18.2 | 80.0 | 30.3 | 29.4 | 61.3 | 55.3 | 37.0 | 27.7 | 47.1 | 35.2 | 43.9 | 960 | 22 |
| xGen-MM-interleave-4B | 74.2 | 60.0 | 81.5 | 61.4 | 31.5 | 71.0 | 61.2 | 41.1 | 40.5 | 81.9 | 50.2 | 59.5 | 979 | 20 |
| Cambrian-1-8B | 73.0 | 73.3 | 81.2 | 77.8 | 41.6 | 71.7 | 64.2 | 42.7 | 49.0 | 76.4 | 46.6 | 63.4 | 952 | 25 |
| Cambrian-1-34B | 79.7 | 75.6 | 83.8 | 75.5 | 46.0 | 76.7 | 67.8 | 49.7 | 53.2 | 75.6 | 50.7 | 66.8 | 953 | 24 |
| LLaVA OneVision-7B | 81.4 | 80.0 | 84.0 | 87.5 | 68.8 | 78.3 | 66.3 | 48.8 | 63.2 | 78.8 | 54.4 | 72.0 | 1024 | 15 |
| LLaVA OneVision-72B | 85.6 | 83.7 | 85.2 | 91.3 | 74.9 | 80.5 | 71.9 | 56.8 | 67.5 | 84.3 | 60.7 | 76.6 | 1051 | 8 |
| *The Molmo family* |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| MolmoE-1B | 86.4 | 78.0 | 83.9 | 77.7 | 53.9 | 78.8 | 60.4 | 34.9 | 34.0 | 87.2 | 79.6 | 68.6 | 1032 | 13 |
| Molmo-7B-O | 90.7 | 80.4 | 85.3 | 90.8 | 70.0 | 80.4 | 67.5 | 39.3 | 44.5 | 89.0 | 83.3 | 74.6 | 1051 | 9 |
| Molmo-7B-D | 93.2 | 84.1 | 85.6 | 92.2 | 72.6 | 81.7 | 70.7 | 45.3 | 51.6 | 88.5 | 84.8 | 77.3 | 1056 | 6 |
| Molmo-72B | 96.3 | 87.3 | 86.5 | 93.5 | 81.9 | 83.1 | 75.2 | 54.1 | 58.6 | 91.2 | 85.2 | 81.2 | 1077 | 2 |

表 1 要点: 前 10 列是常用学术基准, 第 11 列是新的 PixMo-Count, Average 是 11 项算术平均, 最后两列是人工偏好的 Elo 分数和名次. 模型按开放程度分为四组: 只给 API, 只开权重, 开权重和数据但数据含蒸馏, 以及 Molmo 系列 (权重, 数据, 训练代码, 评测全开放).

人工评测方面, 论文收集了 15k 条多样的图文提示, 让一组 VLM 分别作答, 再由约 870 名标注员两两比较, 给出超过 325k 次成对评分 (论文称每对模型约 450 次), 最后用 Bradley-Terry 模型拟合出 Elo.

Molmo 的学术评测统一用 36 个 crop (训练是 12 个), 计数任务除外, 因为测试 crop 数一变, 指点能力就泛化不好; 附录说明少量高分辨率续训可以解决.

条件允许时用对应的风格提示 (如 `vqa2:`), AI2D 用透明框版本. 只用于评测的数据集, 短答题借用 VQA v2.0 的标签, 多选题借用 A-OKVQA 的标签. 人工评测不加风格标签, 用 12 个 crop (部分计数题会用到指点), 标注员只看到输出文字, 看不到点.

> **对一下:** 「325k 次评分, 每对模型约 450 次」两个数能同时成立吗?
> 答: 表 1 有 27 个模型, 两两组合 $\binom{27}{2}=351$ 对. $351 \times 450 \approx 158$k, 不到 325k 的一半; 反过来 $325\text{k}/351 \approx 926$ 次每对. 两个数至少有一个口径与表 1 的模型集合不符, 文中没有给出解释.

<!-- page 7 of 30 -->

Table 2. Model ablations. Default settings are marked as baseline (Molmo-7B-D).

(a) Vision encoder

| ViT-L/14 | cap F1 | 11-avg |
|---|---|---|
| OpenAI CLIP 336px | 54.1 | 76.9 |
| MetaCLIP 336px | 54.1 | 77.2 |
| SigLIP-So400m 384px | 54.4 | 77.1 |
| DINOv2 336px | 53.2 | 75.6 |

(b) Image resolution

| # crops train, test | cap F1 | 11-avg |
|---|---|---|
| 4, 4 | 52.0 | 71.0 |
| 4, 12 | 52.0 | 74.1 |
| 4, 36 | 52.0 | 74.2 |
| 12, 12 | 54.1 | 74.9 |
| 12, 36 | 54.1 | 76.9 |
| 36, 36 | 54.0 | 77.2 |

(c) Dropout

| pre-train, fine-tune | cap F1 | 11-avg |
|---|---|---|
| off, off | 53.1 | 74.6 |
| off, on | 53.1 | 76.6 |
| on, on | 53.7 | 77.0 |
| on (text only), on | 54.1 | 76.9 |

(d) Cropping

| cropping | cap F1 | 11-avg |
|---|---|---|
| single | 46.7 | 62.8 |
| multi, no overlap | 53.4 | 75.7 |
| multi, overlap | 54.1 | 76.9 |

(e) Length conditioning

| setting | cap F1 | 11-avg |
|---|---|---|
| off | 53.0 | 76.2 |
| on | 54.1 | 76.9 |

(f) Pooling

| 2×2 pooling | cap F1 | 11-avg |
|---|---|---|
| stacking | 53.7 | 76.1 |
| attention | 54.1 | 76.9 |

表 2 要点: 六组模型设计消融, 默认配置为 CLIP, 训练 12 crop 测试 36 crop, 预训练仅文本 dropout, 重叠多 crop, 带长度提示, 注意力池化. 每组都报两个指标: 描述质量 cap F1 和 11 项平均.

学术结果和人工评测的排序大体一致, 例外是 Qwen2-VL: 学术分很高, 人工评测相对靠后. 论文列出几点:

- MolmoE-1B 基于完全开放的 OLMoE-1B-7B, 学术平均和 Elo 都接近 GPT-4V.
- 基于 OLMo-7B-1024-preview 和 Qwen2 7B 的两个 7B 模型, 在两项指标上都处于 GPT-4V 和 GPT-4o 之间.
- 基于 Qwen2 72B 的模型学术平均最高, Elo 第二, 仅次于 GPT-4o.
- 最好的 Molmo 还胜过多个闭源系统, 包括 Gemini 1.5 Pro, Flash 和 Claude 3.5 Sonnet.

Molmo-72B 还参加了第三方 Chatbot Arena 视觉榜 (英文类别, 2024 年 11 月 13 日数据) 的 Elo 评测, 胜过所有开放模型, 但低于 GPT-4o, Claude 3.5 Sonnet 等若干闭源模型 (附录表 9). 论文推测差异来自题目类型: Arena 的题目不公开, 而自己的评测里计数和看图描述题多, 正是 Molmo 的强项.

分项看, 论文称 Molmo 在自然图像问答上表现突出, 在 zero-shot 的 RealWorldQA 上与所有模型持平或更优, VQA v2.0 达到最好水平. OCR 类基准 (ChartQA, DocVQA, InfoQA, TextVQA) 上胜过其他开放模型和部分闭源模型, 略逊于 Qwen2-VL. 计数类基准领先所有模型, 归功于指点数据和先指点再计数. 推理类 (MMMU, MathVista) 落后, 论文归因于训练混合缺少高级推理数据.

附录还有若干专项评测, 涉及读时钟, 指点, 纯文本能力等. 读时钟方面, 各档 Molmo 都远超其他 VLM, 但不如专门的非 VLM 模型.

为考察 Molmo 用于「行动」的潜力, 论文在 AndroidControl 上测试 Molmo-72B, 低层和高层指令的准确率分别为 88.7% 和 69.0%, 和该基准原论文报告的 83.2% 和 70.8% 相当.

纯文本 NLP 基准上, Molmo 比底座 LLM 略有退化, 加入纯文本数据可以弥补 (附录表 13).

论文还借助 SAM 建立了一个新的指点评测, 各档 Molmo 表现都很好, 结果见附录表 11.

## 6. Ablations · 消融

消融覆盖模型设计 (表 2) 和训练数据 (表 3), 报告两个指标: 预训练后描述的精确率与召回率综合而成的 cap F1 (定义见附录 C), 以及 11 项基准的平均准确率 (有验证集时用验证集).

论文认为 cap F1 反映预训练学到的广泛图像理解能力, 而且不需要跑代价更高的微调阶段, 所以很多设计决策依据这个指标. 论文也说明, 描述指标的提升通常但并不总是对应基准平均的提升.

RealWorldQA 这句和表 1 不一致: 该列中 Molmo-72B 为 75.2, Qwen2-VL-72B 为 77.8, GPT-4o-0513 为 75.4, 两者都高于 Molmo-72B.

<!-- page 8 of 30 -->

Table 3. Data ablations. Default settings are marked (Molmo-7B-D).

(a) PixMo-Cap scaling

| # PixMo-Cap images | cap F1 | 11-avg |
|---|---|---|
| 0 (0.0%) | - | 74.9 |
| 89k (12.5%) | 49.6 | 75.5 |
| 178k (25.0%) | 51.6 | 76.3 |
| 356k (50.0%) | 52.6 | 76.2 |
| 712k (100.0%) | 54.1 | 76.9 |

(b) Pre-training data

| data | cap F1 | 11-avg |
|---|---|---|
| stage 0.5 LAION | 53.9 | 76.9 |
| ShareGPT4V+o (158k images) | 36.3 | 74.9 |
| PixMo-Cap images: our raw transcripts only | 45.2 | 76.4 |
| PixMo-Cap images: our cleaned transcripts only | 53.0 | 76.5 |
| PixMo-Cap images: our raw & cleaned transcripts | 54.1 | 76.9 |
| PixMo-Cap images: captioned by GPT-4o | 52.9 | 77.5 |

(c) Supervised fine-tuning data

| data | 11-avg |
|---|---|
| academic only | 72.5 |
| plus PixMo-Docs | 74.0 |
| PixMo plus academic | 76.9 |
| remove PixMo-AMA | 76.8 |
| remove PixMo-CapQA | 77.0 |
| remove PixMo-Docs | 75.8 |
| remove PixMo-Clocks | 76.9 |
| remove pointing task | 76.2 |

Table 4. Counting ablations (models fine-tuned on only PixMo-Points and PixMo-Count).

(a) Counting strategy

| strategy | CBQA | PCQA |
|---|---|---|
| count | 87.9 | 80.2 |
| point then count | 89.4 | 86.3 |
| count then point | 81.5 | 77.6 |
| pointing + regex | 88.4 | 85.4 |

(b) Point order

| order | CBQA | PCQA |
|---|---|---|
| on | 89.4 | 86.3 |
| off | 85.4 | 74.1 |

(c) Inference compute

| points, length | CBQA | PCQA |
|---|---|---|
| actual, correct | 89.4 | 86.3 |
| random, correct | 85.9 | 76.3 |
| random, random | 76.3 | 75.7 |

(d) Special point tokens

| tokens | CBQA | PCQA |
|---|---|---|
| plain-text | 89.4 | 86.3 |
| special | 85.8 | 80.9 |

表 3 与表 4 要点: 表 3 是数据消融 (描述数据规模, 预训练数据来源, 微调数据构成); 表 4 是计数消融, CBQA 为 CountBenchQA, PCQA 为 PixMo-Count.

消融都在 Molmo-7B-D 上做, 除表中改动的一项外, 其余设置与正式训练一致. 为节省算力, 微调步数比正式模型少.

**Model ablations. 模型消融.** 结论如下:

- 在网络级含噪图文对上训练的视觉编码器 (CLIP, MetaCLIP, SigLIP) 表现相近, 自监督的 DINOv2 稍差但差距不大.
- 指点和描述之外, 训练和推理阶段用更多 crop (分辨率更高) 普遍更好.
- 预训练只对文本 token 做 dropout 的做法提升了描述指标.
- 多 crop 比单个大 crop 好得多, 重叠切图又比不重叠更好.
- 带长度提示的描述预训练比普通描述预训练更好, 下游 11 项平均也受益.
- 注意力池化在两项指标上都优于直接堆叠特征.

**Data ablations. 数据消融.** 结论如下:

- PixMo-Cap 从 0 增加到 712k 张, 两个指标都明显提升.
- 加入网络级含噪数据 (LAION) 没有带来提升; 改用 GPT-4o 生成的描述效果和人工描述相当.
- PixMo 微调数据不仅带来新能力, 也提升了学术基准分数, 主要来自 PixMo-Docs 和计数数据.

**Counting. 计数.** 只用 PixMo-Points 和 PixMo-Count 微调的模型上做计数消融:

- 先指点再计数明显好于直接给数.
- 训练时点按固定空间顺序排列, 效果更好.
- 指点会多花推理计算, 但随机点加正确数量的实验表明, 提升不只是来自多生成 token.
- 坐标用纯文本数字表示, 优于新增专用的点 token.

**Human evaluation. 人工评测.** 对部分消融模型做的人工评测 (表 5) 表明, PixMo 数据对生成用户喜欢的回答很重要, 特别是 PixMo-Cap 和 PixMo-AskModelAnything.

学术数据集能提高人工评分, 但单独使用时效果极差: 只用学术数据微调的模型胜率仅 17%.

用 GPT-4o 给同一批图写描述做预训练, 表现也不错 (胜率 55%). 论文认为这得益于 GPT 的进步和 PixMo 图片本身的多样性; ShareGPT 系列数据在同等规模下明显不如 PixMo 数据 (表 3a, 3b).

<!-- page 9 of 30 -->

Table 5. Elo scores and win rates (excluding ties) of ablation models compared to the default Molmo-7B-D.

| model | Elo score | win % |
|---|---|---|
| Claude-3.5 Sonnet | 1047 | 65% |
| PixMo-Cap w/ GPT-4o captions (Table 3b) | 1018 | 55% |
| PixMo, remove PixMo-CapQA (Table 3c) | 1015 | 50% |
| Molmo-7B-D default | 1014 | n/a |
| PixMo, no academic datasets (Table 3c) | 1013 | 42% |
| GPT-4V | 1010 | 47% |
| DINOv2 vision encoder (Table 2a) | 999 | 45% |
| PixMo, remove PixMo-AMA (Table 3c) | 995 | 40% |
| no PixMo-Cap data (Table 3a) | 990 | 35% |
| academic only (Table 3c) | 897 | 17% |

表 5 要点: 第二轮人工评测的 Elo 分数, 以及各消融模型相对默认 Molmo-7B-D 的胜率 (平局不计).

正文的收尾观点是: 从闭源模型蒸馏也许有效, 但研究社区必须弄清楚不蒸馏怎样训练出有竞争力的 VLM, Molmo 和 PixMo 是朝这个方向迈出的一步.

## Appendix

附录各节为: A 模型细节, B 训练细节, C 评测细节, D 结果细节, E 消融细节, F 数据细节, G 数据集样例, H 相关工作.

## A. Model Details · 模型细节

### A.1 Image Encoding · 图像编码

![](images/crops-figures.png)
Figure 5. Converting an image into tokens.

图 5 题注要点: 图像变成一张低分辨率 crop 和若干张重叠的高分辨率 crop, 用黑边补成方形以保持长宽比. 高低分辨率两段 patch 前后各有图像起止 token, 每行 patch 之后插入列 token. 示例用了 4 张高分辨率 crop, 每张取 6×6=36 个特征; 实际 Molmo 一般用 12 张, 每张 12×12=144 个.

编码流程如图 5. 先选一个矩形网格 (如 2×2, 3×1), 每个格子对应 ViT 的输入尺寸. 用重叠 crop 时, 格子彼此靠拢, 按固定边距重叠 (原文: 4 个 patch, 即 56 像素), 网格总尺寸因此变小.

接着在保持长宽比的前提下把图像放大, 使高或宽恰好等于网格尺寸. 网格选需要放大最少的那个, 并列时选更小的. crop 数有上限; 若上限内覆盖不了整图, 就把图像缩小, 选在上限内缩小最少的网格. 两种情况都用黑边补齐到网格大小, 再从中切出 crop.

低分辨率 crop 是把整图缩放并补边到 ViT 支持的分辨率.

每张 crop 独立经过 ViT 和连接器. 进入连接器之前, 每个 patch 特征按「无补边, 部分补边, 全是补边」三种情况加上一个可学习嵌入, 让模型能把补边和原图自带的黑边区分开. 之后按第 2 节的方式和特殊 token 一起排列; 图文输入时图像在前, 文本在后.

### A.2 Hyper-Parameters · 超参数

各 Molmo 模型的超参数和 AdamW 设置见表 6. 预训练时连接器用更高学习率和更短预热, 以替代单独的连接器训练阶段.

<!-- page 10 of 30 -->

Table 6. Model and training hyper-parameters (Molmo-1B-E, 7B-D, 7B-O, 72B-D). Cells left blank in the source span all four columns.

| block | item | 1B-E | 7B-D | 7B-O | 72B-D |
|---|---|---|---|---|---|
| Image Encoder | Params | 290m | 290m | 290m | 290m |
|  | Dim / MLP Dim | 1024 / 4096 | same | same | same |
|  | Act. / Heads / KV Heads | GELU / 16 / 16 | same | same | same |
|  | Layers | 23 | 23 | 23 | 23 |
|  | Image Size / Patch Size | 336×336 / 14 | same | same | same |
|  | Dropout | 0.0 | 0.0 | 0.0 | 0.0 |
| V/L Connector | Params | 12m | 110m | 74m | 310m |
|  | Pool Size / Pool Dim / Pool Heads | 2×2 / 1024 / 16 | same | same | same |
|  | MLP Dim | 1024 | 37888 | 22016 | 59136 |
|  | Act. / Dropout | SwiGLU / 0.0 | same | same | same |
| LLM | Params | 1.2b (6.9b) | 7.6b | 7.3b | 72b |
|  | Embed | 50304 | 152064 | 100352 | 152064 |
|  | Dim | 2048 | 3584 | 4096 | 8192 |
|  | MLP Dim | 2048×64 | 37888 | 22016 | 59136 |
|  | Act. | SwiGLU | SwiGLU | SwiGLU | SwiGLU |
|  | Heads | 16 | 28 | 32 | 80 |
|  | KV Heads | 16 | 4 | 32 | 8 |
|  | Layers | 16 | 28 | 32 | 64 |
|  | Theta | 10k | 1m | 0.5m | 1m |
|  | Dropout | 0.1 | 0.1 | 0.1 | 0.1 |
| Pre-Train | Warmup ViT / Con. / LLM | 2000 / 200 / 2000 | same | same | same |
|  | LR ViT / Con. | 6e-6 / 2e-4 | same | same | same |
|  | LR LLM | 2e-5 | 2e-5 | 2e-5 | 1e-5 |
|  | Cosine Decay / Eps. / Betas | 10% / 1e-6 / 0.9, 0.95 | same | same | same |
|  | Batch Size / Steps | 128 / 22.3k | same | same | same |
| Fine-Tune | Warmup ViT / Con. / LLM | 200 / 200 / 200 | same | same | same |
|  | LR ViT | 5e-6 | 5e-6 | 5e-6 | 3e-6 |
|  | LR Con. | 5e-6 | 5e-6 | 5e-6 | 3e-6 |
|  | LR LLM | 2e-5 | 1e-5 | 1e-5 | 5e-6 |
|  | Cosine Decay / Eps. / Betas | 10% / 1e-6 / 0.9, 0.95 | same | same | same |
|  | Batch Size | 256 | 256 | 256 | 256 |
|  | Steps | 30k | 30k | 32k | 20k |

表 6 要点: 四档模型共用同一个 ViT 和连接器池化结构, 差别在 LLM 底座和学习率. 1B-E 激活参数 1.2B, 总参数 6.9B, LLM 的 MLP 层有 64 个专家, 每次激活 8 个.

> **看表:** 72B-D 一列 Heads 80, Layers 64 对吗?
> 答: 和底座对不上. HF 上 `Molmo-72B-0924` 的 config 以及 Qwen2-72B 都是 `num_attention_heads` 64, `num_hidden_layers` 80, KV 头 8. 表 6 把这两行写反了; 用 $8192/64=128$ 的头维也能核对, $8192/80$ 不是整数.

连接器 MLP 的中间维度和 LLM 相同, 所以连接器大小随 LLM 变化; 池化层和 ViT 在各模型间一致. 所有训练都用余弦学习率, 最终降到峰值的 10%.

学习率在各模型间相近, 72B 例外, 降低学习率对它更有帮助. 72B 学得更快, 所以训练步数更少; 7B-O 因一处小的配置差异多训了一点, 论文认为不影响性能. 预训练 22.3k 步, batch 128.

22.3k 步与 4 个 epoch 一致: $712\text{k} \times 4 / 128 = 22{,}250$ 步, 四舍五入即 22.3k. 这里的一个样本是一张图 (多标注拼在同一序列里), 所以按图数计 epoch.

![](images/fsdp_ablation.png)
Figure 6. Training loss curves for Molmo-7B with different FSDP precision settings.

图 6 题注要点: Molmo-7B-D 的训练 loss 曲线, 蓝线是权重和梯度归约用 bfloat16, 粉线是 float32 (默认配置), bfloat16 的 loss 更高.

### A.3 Implementation · 实现

实现基于 OLMo 代码库, 用 PyTorch FSDP. 没有用 FlashAttention, 因为它不支持多标注图像所需的复杂掩码; 改用 PyTorch 的 SDPA, 速度接近.

吞吐方面用 PyTorch AMP, 大部分运算以 bfloat16 进行. 但图 6 显示权重和梯度归约用半精度会让 loss 变差, 所以这两项保持全精度; LayerNorm 和 RoPE 的计算也显式用全精度.

FSDP 下每张 GPU 先在本地小 batch 上算梯度, 再做全设备平均. 如果每张卡的 loss 按本地 loss token 数归一, loss token 少的样本 (比如短回答) 会配上更小的除数, 权重被放大. 论文改为统一除以所有设备 loss token 数的平均值; 全局 batch 远大于单卡 batch, 这样基本消除了偏差.

论文指出这个问题在别处也有讨论, 影响过不少代码库; 不做这项修正, 描述指标会下降 0.5 到 1 个点.

<!-- page 11 of 30 -->

微调时在每个 batch 内混合, 同一 batch 里有多种任务的样本. 预训练和微调的最大序列长度都是 2304, 超长样本截断; 实际只在 DVQA 这类每图标注很多的合成集和少数异常样本上发生截断.

训练很稳定, 没有出现 loss 尖峰或 NaN, 论文认为部分原因是用了预训练好的模型.

## B. Training Details · 训练细节

这一节说明训练任务的混合方式和各任务的格式.

### B.1 Pre-Training Task Details · 预训练任务细节

预训练时每张图配上它的描述和一条转写 (有多条转写时每个 epoch 随机选一条), 用多标注机制把两者放进同一序列一起训练. 原文此处把多标注机制的出处写成附录 C, 实际在正文第 2 节.

提示词分别是 `long_caption:` 和 `transcript:` (指令微调阶段改用自然语言提示). 长度提示是一个带噪声的整数: 取描述或转写的字符数, 加上标准差 25 的正态噪声, 除以 15 后向下取整, 大致落在 0 到 100. 加噪声是为了让长度只作参考而不是硬约束, 例如内容很少的图即使给了长提示, 也应该写短.

90% 的样本带长度提示, 格式如 `long_caption_83:`; 另外 10% 不带, 以保留输出默认描述的能力.

![](images/length-hint-pr.png)
Figure 7. Captioning precision and recall with different length hints.

图 7 题注要点: 预训练后的 Molmo-7B-D 在不同长度提示下的描述精确率和召回率. 提示短时描述的东西少, 召回下降, 但集中在显著易懂的部分, 精确率可能更高.

调整长度提示可以在精确率和召回率之间取舍. 各设置下生成描述的平均长度与期望长度相差不到 10 个字符, 说明模型很好地遵循了提示. 消融统一报告长度提示为 65 时的分数, 它和不加提示相当或略好.

长度提示的格式和代码略有出入: `data_formatter.py` 拼接的是 `style + " " + str(n // 15) + ":"`, 风格名和数字之间是空格, 不是下划线; $n$ 为描述字符数加上 $\mathcal{N}(0, 25)$ 的整数噪声. 两种写法对模型行为影响不大, 但复现时要按代码的格式.

Table 7. Full list of instruction fine-tuning datasets, sampling rates (%), number of images, annotations, tokens and average crops.

| name | rate | images | anno. | tokens | avg. crops |
|---|---|---|---|---|---|
| PixMo (Annotated) | 38.1 | 1m | 3.3m | 350m | 10.6 |
| Points | 28.8 | 220k | 2.3m | 160m | 10.1 |
| AskModelAnything | 3.8 | 71k | 160k | 17m | 10.0 |
| Cap | 3.2 | 712k | 712k | 160m | 10.9 |
| PointQA | 2.4 | 14k | 76k | 11m | 11.0 |
| PixMo (Synthetic) | 31.6 | 1.3m | 3.3m | 120m | 11.0 |
| Count | 6.2 | 36k | 37k | 3m | 11.9 |
| CapQA | 5.7 | 160k | 210k | 38m | 10.8 |
| Clocks | 5.3 | 800k | 800k | 20m | 10.5 |
| Docs-Charts | 5.2 | 120k | 1.1m | 34m | 12.8 |
| Docs-Other | 4.0 | 71k | 610k | 15m | 12.8 |
| Docs-Tables | 3.3 | 47k | 420k | 12m | 12.1 |
| Docs-Diagrams | 1.9 | 16k | 140k | 3.6m | 12.5 |
| Academic | 30.3 | 880k | 25m | 1b | 8.0 |
| TallyQA | 3.9 | 130k | 250k | 4.6m | 6.1 |
| VQA v2.0 | 3.1 | 83k | 440k | 7.9m | 6.7 |
| AndroidControl | 2.9 | 74k | 300k | 13m | 11.0 |
| A-OKVQA | 2.8 | 17k | 17k | 380k | 6.8 |
| DocVQA | 2.1 | 10k | 39k | 1m | 12.9 |
| TextVQA | 2.0 | 22k | 35k | 700k | 12.7 |
| ChartQA | 1.8 | 18k | 28k | 850k | 9.3 |
| ST-VQA | 1.7 | 18k | 25k | 530k | 4.6 |
| InfographicVQA | 1.6 | 4.4k | 24k | 670k | 12.0 |
| TabWMP | 1.6 | 23k | 23k | 930k | 2.3 |
| PlotQA | 1.5 | 160k | 20m | 930m | 12.4 |
| AI2D | 1.3 | 6.2k | 15k | 630k | 6.4 |
| DVQA | 1.1 | 200k | 2.3m | 51m | 5.0 |
| FigureQA | 1.1 | 100k | 1.3m | 25m | 6.1 |
| OK-VQA | 1.0 | 9k | 9k | 180k | 6.8 |
| ScienceQA | 0.8 | 5k | 6.2k | 460k | 4.3 |

表 7 要点: 各列为采样率, 图片数, 标注数 (问答对数), 用 Qwen2 分词器统计的文本 token 数, 以及平均 crop 数 (最多 13 张, 1 张低分辨率加 12 张高分辨率). 三个分组行 (PixMo 人工标注, PixMo 合成, 学术) 是组内合计, 采样率合计 $38.1+31.6+30.3=100$. 微调只用各数据集的训练集.

初步实验里混入其他描述来源 (COCO Captions, Localized Narratives, 由 Visual Genome 标注导出的描述) 没有提升描述指标, 所以预训练只用 PixMo-Cap.

<!-- page 12 of 30 -->

### B.2 Fine-Tuning Task Details · 微调任务细节

**Multiple choice questions. 多选题.** AI2D, A-OKVQA, ScienceQA 的多选题在问题后附 `Choices:` 和换行分隔的选项, 选项用大写字母标号, 模型只输出字母.

有些多选题出现在其他数据集里 (例如 PixMo-Docs 中的), 这类题按普通问答处理.

**Multiple answers. 多答案.** 像 VQA v2.0 这种每题有多个答案的数据集, 训练只用出现最多的那个; 若多个答案并列最多, 每个 epoch 随机选一个.

**Pointing. 指点.** 指点用类 HTML 格式输出, 坐标 $(x, y)$ 按图像宽高归一化到 0 到 100, 保留一位小数. 单点格式为 `<point x="10.0" y="10.0" alt="...">...</point>`; 多点时用带编号的属性 `x1, y1, x2, y2, ...`.

多点格式的例子有笔误: 原文写成 `x2="20.0" y1="20.0"`, 第二个点的纵坐标属性应为 `y2`. 官方代码按 `x{ix}` 和 `y{ix}` 成对生成属性.

给点编号便于计数, 总数就是最后一个点的编号.

和用户交互时, 界面把点的文本替换成标签内的行内文字, 并在图上画点, 鼠标悬停显示 alt 文字. 指点和计数时两处文字都是所指对象的名称; 用点作解释时两者可以不同.

**PixMo-Points.** 对象很多时序列会很长, 为避免显存溢出, 训练不使用计数超过 40 的样本, 论文计划在后续版本去掉这个限制.

**PixMo-AskModelAnything.** 这个数据集里常有「有多少」的提问, 但不带点数据, 结果模型被问到计数时会不指点. 解决办法是启发式识别这类问题, 在前面随机加一句「不要指点直接回答」类的指令 (共 20 种措辞).

**AI2D.** AI2D 需要给图中区域打标签, 有两种呈现方式: 用不透明框盖住原标签再写字母, 或用透明框. 两种都训练, 主结果用透明框设置 (附录表 14 给出两者对比).

答案本身就是字母的 AI2D 题, 列选项时不再加字母前缀. AI2D 没有验证集, 论文分出 384 张图 (约 2000 条问答) 自建验证集, 所有模型都不在这部分上训练.

**ChartQA.** 训练集中合成问题远多于人工问题 (21k 对 7k), 而且偏噪, 质量较低. 论文重新加权, 让合成和非合成样本的总权重相等, 这也让训练分布更接近合成与非合成各占一半的验证集和测试集.

**A-OKVQA.** 训练多选题, 对没有被标为难以直接作答的题, 还会去掉选项当成直接问答训练; 两种版本用不同风格标签.

**TabWMP.** 当作短答任务, 不展示选项.

**AndroidControl.** 训练四种输入输出配置: 低层指令到动作, 高层目标到动作, 低层加高层输入到动作, 以及高层目标加 CoT 推理到动作. 输入只有指令和截图, 不给无障碍树, 动作历史和可用动作说明. 目标动作写成文本, 坐标和普通指点一样缩放到 0 到 100.

Table 8. Training times for the Molmo models (GPUs, wall-clock hours, GPU hours).

| model | pre-train GPUs | time | GPU hr. | fine-tune GPUs | time | GPU hr. |
|---|---|---|---|---|---|---|
| 1B-E | 8 | 33.3 | 264 | 64 | 13.3 | 850 |
| 7B-D | 64 | 8.6 | 550 | 128 | 11.2 | 1.4k |
| 7B-O | 64 | 8.9 | 570 | 128 | 13.5 | 1.7k |
| 72B | 128 | 33.3 | 4.2k | 256 | 32.4 | 8.3k |

### B.3 Training Time · 训练时间

训练时间与 GPU 数量见表 8. 所有模型都在带 InfiniBand 互联的 H100 上训练. 每行的 GPU 小时都等于 GPU 数乘以墙钟时间, 例如 72B 微调 $256 \times 32.4 \approx 8.3$k.

<!-- page 13 of 30 -->

## C. Evaluation Details · 评测细节

**Captioning metric (cap F1). 描述指标.** 描述质量相对一组评测图片来衡量, 这批图片的采集方式和 PixMo-Cap 相同, 但和训练集分开. 评测集共 1500 张 (部分实验用了 2730 张).

每张评测图最多有六条音频转写. 用 GPT-4o 把模型描述和参考转写各自拆成原子陈述, 再做匹配: 召回率看参考陈述有多少被覆盖, 精确率看模型陈述有多少能在原始转写中得到支持. 两者的调和平均就是 cap F1.

**Human evaluation. 人工评测.** 论文定义了 10 类问题, 由做其他标注任务的同一批众包人员提供图片和问题. 各类数量为: 输出格式 1525, 细粒度问答 1510, 通用 1504, 文档 1499, 描述 1493, 计数 1490, 作业题 1489, 图表 1473, 命名实体 1448, 创意 1420.

标注员看到图片, 问题和匿名的 A, B 两个回答, 有五个选项: 平局 (都差), 平局 (都好), A 更好, B 更好, 不知道. 人工评测做了两轮: 第一轮针对表 1 的模型, 从 10 类里随机抽题, 直到每对模型约有 450 条反馈; 第二轮针对表 5 的消融模型, 先人工核对题目质量, 固定 500 题 (每类 50 题), 每对模型都用全部题目. 去掉「不知道」后用 Bradley-Terry 模型算 Elo.

**AndroidControl.** 评测阶段只给任务指令 (高层或低层) 和当前截图, 在域内测试集 (IDD) 上报告逐步准确率.

## D. Result Details · 结果细节

**Chatbot Arena.** 表 9 是 Chatbot Arena 视觉排行榜在英文查询上的摘要. Molmo-72B 胜过所有完全开放和开放权重模型, 但落后于若干闭源模型. 在论文自己的 Elo 评测中 Molmo-72B 名次更高 (第 2), 论文推测差异来自问题分布不同, 自己的评测里计数和看图描述题较多, 正好是 Molmo 的强项.

**Clock reading. 读时钟.** 多数公开训练数据的 VLM 都没有读时钟数据, PixMo-Clocks 补上了这一类. 它完全是合成的, 纯色背景上显示各种表壳和表盘.

评测用的是 Yang 等人 [121] 提出的真实场景读时钟基准, 图片来自 COCO, OpenImages 和电影 The Clock (2010) 构成的 Clock Movies, 和 PixMo-Clocks 的分布差别很大. 对照组包括闭源模型, 开放权重模型, 以及 [121] 中专门读时钟的单任务模型.

<!-- page 14 of 30 -->

Table 9. Chatbot Arena's vision leaderboard (English queries).

| model | score | 95% CI | openness |
|---|---|---|---|
| Gemini-Exp-114 | 1278 | +28/-27 | API only |
| ChatGPT-4o-latest (20240903) | 1256 | +13/-13 | API only |
| Gemini-1.5-Pro-002 | 1220 | +15/-14 | API only |
| Gemini-1.5-Flash-002 | 1219 | +15/-17 | API only |
| GPT-4o-2024-05-13 | 1213 | +9/-9 | API only |
| Claude 3.5 Sonnet (20240620) | 1187 | +9/-7 | API only |
| Claude 3.5 Sonnet (20241022) | 1184 | +15/-15 | API only |
| Gemini-1.5-Pro-001 | 1158 | +9/-8 | API only |
| GPT-4-Turbo-2024-04-09 | 1157 | +7/-10 | API only |
| Gemini-1.5-Flash-8B-Exp-0827 | 1137 | +15/-13 | API only |
| GPT-4o-2024-08-06 | 1131 | +18/-20 | API only |
| Gemini-1.5-Flash-8B-001 | 1133 | +10/-15 | API only |
| GPT-4o-mini-2024-07-18 | 1124 | +7/-9 | API only |
| Molmo-72B | 1115 | +18/-17 | Fully Open |
| Qwen2-VL-72B | 1113 | +15/-17 | Open Weight |
| InternVL2-26B | 1096 | +11/-10 | Open Weight |
| Pixtral-12B-2409 | 1085 | +13/-14 | Open Weight |
| Llama-3.2V-90B-Instruct | 1085 | +12/-14 | Open Weight |
| Gemini-1.5-Flash-001 | 1087 | +8/-8 | API only |
| Molmo-7B-D | 1076 | +15/-18 | Fully Open |
| Yi-Vision | 1070 | +21/-26 | Distilled |
| Claude 3 Opus | 1073 | +6/-8 | API only |
| Qwen2-VL-7B | 1068 | +15/-14 | Open Weight |
| Llama-3.2V-11B-Instruct | 1061 | +14/-14 | Open Weight |

Table 10. Clock reading benchmark results (accuracy, hour accuracy, minute accuracy).

| model | acc. | hour acc. | min. acc. |
|---|---|---|---|
| GPT-4o-0513 | 2.7 | 14.2 | 8.6 |
| Gemini 1.5 Pro | 0.9 | 11.6 | 5.1 |
| Claude-3.5 Sonnet | 6.6 | 22.3 | 17.5 |
| PaliGemma-mix-3B | 6.1 | 21.0 | 15.8 |
| Phi3.5-Vision-4B | 1.9 | 12.0 | 7.6 |
| Qwen2-VL-72B | 9.1 | 24.9 | 18.4 |
| InternVL2-Llama-3-76B | 3.3 | 16.3 | 9.9 |
| Pixtral-12B | 1.7 | 11.9 | 6.7 |
| Llama-3.2V-90B-Instruct | 3.4 | 17.9 | 10.1 |
| LLaVA-1.5-13B | 0.8 | 11.6 | 5.7 |
| xGen-MM-interleave-4B | 2.0 | 11.9 | 8.0 |
| Cambrian-1-34B | 1.8 | 11.1 | 7.2 |
| LLaVA OneVision-72B | 5.7 | 17.9 | 15.4 |
| MolmoE-1B | 65.8 | 77.9 | 74.1 |
| Molmo-7B-O | 64.2 | 76.3 | 73.8 |
| Molmo-7B-D | 68.2 | 78.6 | 76.0 |
| Molmo-72B | 65.6 | 77.1 | 73.7 |
| Specialized single-task model | 78.9 | 84.2 | 82.9 |

表 9 与表 10 要点: 表 9 是第三方排行榜, Molmo-72B 位于开放模型之首; 表 10 中其他 VLM 读真实时钟的准确率大多在 10% 以下, Molmo 各档在 64% 到 68% 之间, 专门训练的单任务模型为 78.9%.

所有 VLM 用同一条提问, 要求只按 HH:MM 格式回答时间, 计分沿用基准的官方协议. 除 Molmo 外, 包括闭源模型在内的 VLM 都读不好时钟. Molmo-72B 反而不如 7B-D 和 1B, 论文给出的可能原因是 Clocks 在微调混合中只占 5.3%, 而 72B 的训练步数又少于其他模型. 论文认为加入真实钟表图片可能缩小和专用模型的差距.

尽管只在合成数据上训练, 论文定性观察到读时钟能力能迁移到更复杂的提问和描述任务中.

**Pointing. 指点.** 指点评测集有 493 组图片-指点问题, 逐条人工核对: 要么图中没有目标, 要么每个目标实例都有一个标注点和一张准确的分割掩码 (掩码用 SAM 以标注点为提示生成).

没有目标时, 模型正确回答「图中没有」则精确率和召回率记 1, 否则记 0. 有目标时, 用预测点和标注点的距离作代价, 以 Jonker-Volgenant 算法做一对一指派, 落在所配对象掩码内的预测点算正确. 精确率是落在掩码内的预测点比例, 召回率是被预测点覆盖的掩码比例. 结果见表 11.

<!-- page 15 of 30 -->

Table 11. Pointing evaluation results.

| model | precision | recall | F1 |
|---|---|---|---|
| MolmoE-1B | 73.0 | 72.9 | 72.2 |
| Molmo-7B-O | 75.7 | 75.5 | 75.1 |
| Molmo-7B-D | 75.0 | 74.6 | 74.3 |
| Molmo-7B-D (36 crops) | 58.4 | 58.7 | 58.1 |
| Molmo-72B | 75.8 | 75.4 | 75.2 |

![](images/ablation_elo_rates.png)
Figure 8. Human evaluation outcomes for matchups between Molmo-7B-D and the ablation models.

图 8 题注要点: 把表 5 的胜率展开为胜, 负, 平局 (都好), 平局 (都差) 四种情况的比例. 「不知道」占全部反馈的 2.9%, 计算前已剔除.

Table 12. High-resolution fine-tuning results (* marks evaluating counting with 36 crops).

| # crops train, test | CountBenchQA | PixMo-Count val | 11-avg |
|---|---|---|---|
| 12, 36* | 87.7 | 73.9 | 75.8 |
| 12, 36 | 88.5 | 85.2 | 76.9 |
| 36, 36 | 88.9 | 87.4 | 77.2 |
| 12→36, 36 | 88.9 | 87.4 | 77.2 |

**High-resolution fine-tuning. 高分辨率微调.** 表 2b 显示训练 crop 数从 12 增加到 36, 11 项平均从 76.9 升到 77.2. 论文没有直接用 36 crop 从头训练, 而是在 12 crop 模型上用 36 crop 续训 3000 步 (微调步数的 10%), 学习率大致减半 (ViT 与连接器 2e-6, LLM 5e-6), batch 仍为 256, 各模块预热 200 步.

只在推理时加 crop (表 12 第一行) 会让计数变差, CountBenchQA 从 88.5 降到 87.7, PixMo-Count 从 85.2 降到 73.9, 说明训练和测试分辨率不一致会伤计数, 所以默认模型 (第二行) 计数时用 12 crop. 经过高分辨率续训的模型 (第四行) 用 36 crop 推理时计数恢复, 和直接用 36 crop 训练的模型 (第三行) 持平, 11 项平均不受影响.

**Text-only benchmarks. 纯文本基准.** PixMo 全是图文数据, 不含纯文本数据. 论文按 Llama 3 的设置评测常见纯文本基准, 能把 Llama 3 的数字复现到置信区间内. 结果表明 Molmo-7B-D 所用的 Qwen2 在多模态微调后丢失了部分知识.

论文在 7B 上做了小实验: 在微调混合中加入 Tulu 3 的纯文本数据, 分全量和下采样到 10% 两种比例. 加入后纯文本分数回升, 数学和编程最明显. 下采样到 10% 在多数纯文本任务上反而更好, 11 项平均也从 76.9 升到 77.1.

**Human evaluation. 人工评测.** 图 8 给出第二轮人工评测的细节, 即默认模型和每个消融模型对局的胜负平分布.

<!-- page 16 of 30 -->

Table 13. Text-only benchmark results (11-avg denotes the average on the 11 academic benchmarks).

| model | MMLU | MMLU-Pro | GSM-8k | MATH | ARC-C | HumanEval | 11-avg |
|---|---|---|---|---|---|---|---|
| Qwen2-7B (language model) | 70.2 | 42.1 | 71.8 | 40.3 | 87.5 | 47.6 | - |
| Molmo-7B-D | 64.6 | 32.2 | 58.8 | 11.5 | 81.5 | 36.6 | 76.9 |
| Molmo-7B-D + Tulu 3 | 64.9 | 38.6 | 67.7 | 8.3 | 84.5 | 51.2 | 76.9 |
| Molmo-7B-D + Tulu 3 ×0.1 down-sample | 65.4 | 37.3 | 71.2 | 27.5 | 84.9 | 55.5 | 77.1 |

Table 14. AI2D test scores with transparent and opaque boxes.

| model | opaque | transparent |
|---|---|---|
| MolmoE-1B | 75.7 | 86.4 |
| Molmo-7B-O | 79.8 | 90.7 |
| Molmo-7B-D | 82.4 | 93.2 |
| Molmo-72B | 86.4 | 96.3 |

表 13 与表 14 要点: 表 13 中 Molmo-7B-D 的 MATH 从底座的 40.3 掉到 11.5, 加全量 Tulu 3 后反而降到 8.3, 下采样到 10% 后回到 27.5. 表 14 中透明框比不透明框高约 10 个点, 主表 1 用的是透明框.

**AI2D with opaque boxes. 不透明框的 AI2D.** 表 14 对比两种标签框设置的 AI2D 分数, 两种设置的说明见附录 B.2.

![](images/cap_f1_11_avg_corr.png)
Figure 9. Relationship between cap F1 and 11-avg.

图 9 题注要点: 22 个消融实验的 cap F1 与 11 项平均的散点图, 这些实验都影响预训练且使用 PixMo-Cap. Pearson 相关系数 $\rho = 0.82$, 红线为最小二乘拟合.

**Cap F1 and 11-avg correlation. cap F1 与 11 项平均的相关性.** 项目大部分时间里团队没有看下游任务 (只在 VQA v2.0 上做过少量检查), 而是以提升描述指标为目标做大多数建模决策. 项目结束时, 论文用消融实验分析了 cap F1 和 11 项平均的关系 (图 9).

入选的 22 个实验需同时满足: 改动影响预训练, 且使用 PixMo-Cap. 换用其他预训练数据 (如 ShareGPT4o/v) 的实验被排除, 因为这时 cap F1 成了域外评测, 不能直接比较. 两者强相关, 说明优化稠密描述可能是一大类下游任务的合理代理, 但论文强调这只是相关, 尚未建立因果关系.

**Leaderboards. 排行榜.** 论文把 Molmo-72B-D 提交到若干排行榜 (截至 2024 年 11 月 21 日): VQA v2.0 和 A-OKVQA 榜第一, DocQA 和 InfoQA 榜第三, 排在 QwenVL-72B 和 InternVL2-Pro 之后.

## E. Ablations Details · 消融细节

### E.1 Discussion of Main Paper Ablations · 正文消融讨论

**Vision encoder. 视觉编码器.** 团队早期选定 OpenAI CLIP, 主结果和消融默认都用它, 之后才比较了另外三种 (表 2a). 除 SigLIP 用 384×384 外, 都是 336×336 输入的 ViT-L/14. MetaCLIP 从 224×224 的权重出发, 把位置编码插值到 336×336 再用. 为了让计算量相当, SigLIP 的最大 crop 数略有下调, 使各模型平均视觉 token 数接近.

三种在网络级含噪图文数据上训练的编码器在两项指标上差不多. 其中 MetaCLIP 的数据和权重都开放, 搭配 MetaCLIP 和 OLMo 的 Molmo 每个组件, 每份数据都是开放的; 论文坦言事后看应当默认用 MetaCLIP, 只是评估得太晚, 来不及重训已有模型和消融. 只用图像自监督训练的 DINOv2 仅略差, 在用户研究中对默认模型的胜率为 45%.

**Image resolution. 图像分辨率.** 训练和测试用更多 crop 一般更好, 文档类任务甚至在测试 crop 多于训练时还能受益. 但描述和指点 (以及计数) 在训练与测试 crop 数不一致时会变差, 所以这两类任务的测试 crop 数始终与训练一致. 表 12 显示, 少量高分辨率续训后, 所有任务都可以统一用同一 crop 数推理.

**Dropout.** LLM 中加 dropout 对预训练和微调都有利 (表 2c). 只对描述文本 token 做 dropout (不作用于视觉和提示 token) 还能提升描述指标. 论文推测这种限定让模型生成时更依赖视觉 token, 少依赖前文猜测, 可能减少幻觉.

<!-- page 17 of 30 -->

![](images/pixmo_point_count_answer_dist.png)
Figure 10. PixMo-Points distribution of counts.

图 10 题注要点: 按答案所在区间 (1 到 10, 11 到 20 等) 统计的指点问题数量, 纵轴取对数.

**Length conditioning. 长度条件.** 去掉长度提示后描述指标明显下降, 下游任务也变差 (表 2e). 长度条件只改变预训练任务, 下游变好说明带长度条件的描述是更好的预训练任务.

**PixMo-Cap scaling. 描述数据规模.** 在预训练和微调混合中都按比例减少 PixMo-Cap (表 3a), 两项指标都随数据从 0 增加到 712k 张图而提升. 用户研究里完全不用 PixMo-Cap 的模型对默认模型胜率只有 35%, 用户偏好受到明显打击.

**Pre-training data. 预训练数据.** 论文测试了当时流行的「先用网络级含噪图文对预训练整个 VLM」(表 3b): 在 LAION 2B 上加一个 50k 步, batch 1024 的前置阶段, 只训连接器, 冻结 LLM 和图像编码器, 之后照常做稠密描述预训练和指令微调. 指标没有提升, 因此流程保持简单.

用 ShareGPT4V/o (经描述从 GPT-4 蒸馏) 代替 PixMo-Cap, 即使大致控制数据规模 (对照表 3a 的 178k 张), 两项指标也都更差. 反过来, 用 GPT-4o 给 PixMo-Cap 的全部图片重写描述再训练, 两项指标都很好, 论文认为原因在于 PixMo-Cap 的图片分布更多样, 以及 GPT-4o 描述能力的进步. 只用原始转写或只用 LLM 清洗后的转写, 都比两者同时使用略差.

**Supervised fine-tuning data. 微调数据.** 只用学术数据集 (图 4 中除 AndroidControl 外的学术集) 明显不如完整混合, 原文这里写作 72.2% 对 76.8%. 差距主要来自 PixMo-Docs (提升文档类任务) 和 PixMo-Points, PixMo-Count 的计数数据. 其他 PixMo 微调集对 11 项基准影响很小, 有时略负, 它们主要增加新能力并改善聊天体验, 这体现在表 5 的用户偏好上.

这组数字和表 3c 不一致: 表 3c 中 academic only 为 72.5, PixMo plus academic 为 76.9. 76.8 恰好是表 3c 里 remove PixMo-AMA 那一行的值, 附录这句话的两个数字都和表 3c 差 0.1 到 0.3.

**Counting. 计数.** 表 4d 比较两种坐标表示: 默认的 0.0 到 100.0 纯文本数字 (原文说「一位有效数字」), 以及往分词器里加 1000 个专用点 token, 保持同样的空间精度. 专用 token 明显更差.

原文「一位有效数字」与格式不符: 代码和例子用的是保留一位小数 (`:0.1f`, 如 `10.0`), 每个轴约有 1001 个取值, 和 1000 个专用 token 的精度相当; 一位有效数字只能表示 10 到 90 这类值.

### E.2 Additional Ablations · 补充消融

表 15 给出另外三组模型消融: ViT 取哪几层特征, 学习率预热步数, 梯度归一化方式. 细节见各子表题注.

## F. Data Details · 数据细节

**PixMo-Points.** 共 229k 张不同的图, 1.98M 条指代表达, 平均每张图 8.7 条表达, 每条表达平均 5.5 个点, 每张图平均 47.7 个点; 另有 359k 条无目标 (不含点) 的样本. 非零点数的表达的点数分布见图 10.

<!-- page 18 of 30 -->

Table 15. Additional model ablations.

(a) Vision encoder layers

| layers | cap F1 | 11-avg |
|---|---|---|
| 3rd-to-last & 10th-to-last | 54.1 | 76.9 |
| only 3rd-to-last | 53.7 | 76.6 |
| only 10th-to-last | 52.5 | 76.3 |

(b) Learning rate warmup

| steps (ViT / con. / LLM) | cap F1 | 11-avg |
|---|---|---|
| 2000 / 200 / 2000 | 54.1 | 76.9 |
| 200 / 200 / 200 | 53.7 | 76.9 |

(c) Grad norm

| grad norm | cap F1 | 11-avg |
|---|---|---|
| component-wise | 54.1 | 76.9 |
| global | 53.6 | 76.9 |
| global, fine-tune only | 54.1 | 76.9 |

表 15 要点: 拼接两层 ViT 特征优于只取一层; 描述预训练中 ViT 和 LLM 用更长预热略好; 按组件分别做梯度裁剪略好于全局裁剪, 差别只在 cap F1 上.

PixMo-Points 比以往数据集大得多也更多样. gRefCOCO 共 20k 张图, 60k 个实例, 278k 条表达 (其中 80k 多目标, 32k 无目标); RefCOCO, RefCOCOg, RefCOCO+ 各约 86k, 142k, 141k 条表达, 且没有多目标指代. PixMo-Points 标点而不标分割掩码, 采集效率高得多.

**PixMo-Cap.** 标注员口述时回答七个问题: 第一眼看是什么图, 有哪些物体和数量, 文字写了什么, 物体位置, 有哪些细微之处, 背景里有什么, 风格和颜色.

**PixMo-Docs.** 论文搭建了一个合成文字与图形密集图像的框架: 让纯文本 LLM 写渲染程序, 再把程序作为上下文交给另一个 LLM 构造指令微调数据. 支持七种语言或渲染库: Matplotlib, Plotly, LaTeX, HTML, Vega-Lite, Mermaid, Graphviz, 分别有生成图表, 表格, 示意图和各类文档的专门流程.

生成过程由文本输入控制, 例如输入「餐厅菜单」, 系统挑选合适工具生成相关数据. 为增加多样性, 输入查询覆盖面很广, 还引入 persona 控制内容和风格, 例如给菜单任务配上一位烧烤爱好者的人设, 就会生成融合南方烧烤风味的菜单. 代码生成用 Claude-3.5 Sonnet, 指令数据生成阶段出于成本考虑用 GPT-4o-mini.

## G. Dataset Examples · 数据集样例

附录 G 给出各 PixMo 子集的随机样例, 提示用粗体, 点用粉色圆点标出 (图 12 到图 22).

## H. Related Work · 相关工作

**Vision-language contrastive models. 视觉语言对比模型.** CLIP, ALIGN 等在含噪网络数据上训练, 提供与语言对齐的图像编码器, 无需任务微调就能做分类和检索. 更早的工作在 Transformer 流行之前已有类似想法; CLIP 之后也有工作致力于把整条 CLIP 流程开放. 但这类编码器在辨认细节上有局限.

**Multimodal LLMs. 多模态 LLM.** 常见做法是 CLIP 式编码器加一个连接器, 把图像嵌入对齐到 LLM 输入空间; 也有工作并用多个编码器, 比如加入自监督编码器 (DeepSeek-VL, Cambrian 等). 有的工作先单独训练连接器, 有的没有这一阶段. 另两类架构是用交叉注意力把图像嵌入接到 LLM 各层 (可以冻结 LLM, 保住纯文本能力), 以及去掉编码器直接输入像素.

<!-- page 19 of 30 -->

![](images/openness.png)
Figure 11. VLM Openness Comparison.

图 11 题注要点: 从「权重开放」和「数据与代码开放」两个属性, 对 VLM 本身及其两个预训练组件 (LLM 底座, 视觉编码器) 刻画开放程度; 训练数据含闭源 VLM 生成内容的标为「distilled」.

受训练和推理算力限制, 高效多模态 LLM 也越来越多.

最强的多模态 LLM 都是闭源的, 训练方式和数据几乎不为人知.

<!-- page 20 of 30 -->

另一些工作开放权重, 但不公开训练配方或完整数据; 还有工作公开全部训练细节和数据, 但用了闭源 VLM 生成的数据. 论文据此认为, 需要一条不依赖已有多模态 LLM 生成数据, 完全开放的最强训练流程.

**Vision-language instruction tuning datasets. 视觉指令微调数据.** 常见做法是用视觉模型 (或已有标注) 标注图像, 再让 LLM 据此生成问答, 但自动标注有噪声, 已有标注也很少覆盖图中所有细节. PixMo-CapQA 思路类似, 但用的是 PixMo-Cap 的详细描述. 近期很多方法直接用闭源 VLM 标注图像, 有效但让训练流程依赖闭源 VLM.

把模板化指令套在已有标注数据集上也很常见. Molmo 也用学术数据集, 但用风格标签而不是自然语言指令, 因为论文认为自家数据 (特别是 AskModelAnything) 更适合训练对话交互. 标注员与 LLM 协作生成问答的做法与 ExpertQA 相近, Molmo 把它扩展到图文数据.

**Synthetic vision-language datasets. 合成视觉语言数据.** 以往的合成图表通常只支持一两种类型, 偏重柱状图和折线图. PixMo-Docs 以代码作为 LLM 的纯文本表示, 能支持热力图, 小提琴图, 弦图, 地理图, 树图等多得多的格式. 用 HTML 生成文档的做法与已有工作相近, 但 PixMo-Docs 还用了 HTML 以外的多种表示.

合成时钟数据前人做过. PixMo-Clocks 用真实表盘而不是纯模拟器渲染, 多样性更高 (没有秒针的表, 装饰或配色风格化, 背景图片, 单独的秒针小表盘等). 论文认为两类数据合用可能还有提升.

**VLM grounding. VLM 定位.** 支持定位的多模态 LLM 越来越多, 训练数据多来自自动检测器或已有指代表达数据集. 其中 GRES 最接近 PixMo-Points: 人工标注, 表达任意, 含不存在标注, 允许一个表达指向多个对象. 但它只覆盖有限类别 (如 COCO 类别), 也很少在一张图里定位大量对象. PixMo-Points 从多样图片出发, 让人工标点而非标掩码, 得到 1.98M 条指代表达, 平均每条 5.5 个点.

**Bootstrapping from LLMs. 借助 LLM 起步.** 用闭源纯文本 LLM 生成和整理数据很常见, PixMo 的几个子集也用了. 论文承认这意味着当前数据流程并非完全开放, 但认为一旦开放 LLM 足够强, 就可以替换闭源 LLM, 构建功能上等价的数据集; 不必等开放 LLM 研究完成, 应当并行推进开放 VLM 研究. 用一个 VLM 去构建另一个 VLM 则完全不同, 依赖是循环的, 将来也无法得到完全开放的系统.

「不使用 VLM」的实际范围要从附录拼出来. 附录 F 写明 PixMo-Docs 的代码由 Claude-3.5 Sonnet 生成, 问答由 GPT-4o-mini 生成; HF 上 pixmo-cap 数据卡也说明描述由 Claude 从转写改写而来. 这两个模型本身都能看图, 但这里只以纯文本方式调用, 没有输入任何图片. 所以论文的实际界线是「不把图像交给外部模型」, 而不是「不调用具备视觉能力的模型」.

<!-- page 21 of 30 -->

![](images/cap-cropped-pdf_compressed.png)
Figure 12. Randomly selected examples from PixMo-Cap with our prompt templates.

图 12 题注要点: PixMo-Cap 的随机样例, 每张图配有提示模板和长描述.

![](images/askmodelanything-cropped-pdf_compressed.png)
Figure 13. Randomly selected examples from PixMo-AskModelAnything.

图 13 题注要点: AskModelAnything 的随机样例, 问题由标注员写, 答案经标注员和 LLM 反复修订.

<!-- page 22 of 30 -->

![](images/points-cropped-pdf_compressed.png)
Figure 14. Randomly selected examples from PixMo-Points.

图 14 题注要点: PixMo-Points 的随机样例, 即使文字被截断, 所有点也都在图中. 模板化提示对某些选项可能不合语法, 但论文发现足以让模型正确响应自然语言指令.

![](images/pointqa-cropped-pdf_compressed.png)
Figure 15. Randomly selected examples from the experimental PixMo-Points data that includes points with explanations.

图 15 题注要点: 带解释的实验性指点数据样例, 答案文字中引用图上的点.

<!-- page 23 of 30 -->

![](images/capqa-cropped-pdf_compressed.png)
Figure 16. Randomly selected examples from the synthetic PixMo-CapQA data generated from PixMo-Cap.

图 16 题注要点: 由 PixMo-Cap 描述生成的 CapQA 问答样例.

![](images/clocks-cropped-pdf_compressed.png)
Figure 17. Randomly selected examples from the synthetic PixMo-Clocks data after our data augmentation.

图 17 题注要点: 数据增强后的合成时钟样例, 表壳, 表盘, 背景各不相同.

![](images/count-cropped-pdf_compressed.png)
Figure 18. Randomly selected examples from the synthetic PixMo-Count data.

图 18 题注要点: PixMo-Count 样例, 计数标签来自目标检测器.

<!-- page 24 of 30 -->

![](images/docs-charts-cropped-pdf_compressed.png)
Figure 19. Randomly selected chart examples from the synthetic PixMo-Docs data.

图 19 题注要点: PixMo-Docs 中的合成图表样例.

![](images/docs-tables-cropped-pdf_compressed.png)
Figure 20. Randomly selected table examples from the synthetic PixMo-Docs data.

图 20 题注要点: PixMo-Docs 中的合成表格样例.

![](images/docs-diagrams-cropped-pdf_compressed.png)
Figure 21. Randomly selected diagram examples from the synthetic PixMo-Docs data.

图 21 题注要点: PixMo-Docs 中的合成示意图样例.

<!-- page 25 of 30 -->

![](images/docs-other-cropped-pdf_compressed.png)
Figure 22. Other randomly selected documents from the synthetic PixMo-Docs data.

图 22 题注要点: PixMo-Docs 中其他类型的合成文档样例.

<!-- page 26 of 30 -->

## References

[1] Marah Abdin, Jyoti Aneja, Hany Awadalla, Ahmed Awadallah, Ammar Ahmad Awan, Nguyen Bach, Amit Bahree, Arash Bakhtiari, Jianmin Bao, Harkirat Behl, et al. Phi-3 technical report: A highly capable language model locally on your phone. arXiv preprint arXiv:2404.14219, 2024.

[2] Manoj Acharya, Kushal Kafle, and Christopher Kanan. TallyQA: Answering complex counting questions. In AAAI, 2019.

[3] Pravesh Agrawal, Szymon Antoniak, Emma Bou Hanna, Devendra Chaplot, Jessica Chudnovsky, Saurabh Garg, Theophile Gervet, Soham Ghosh, Amélie Héliou, Paul Jacob, et al. Pixtral 12b. arXiv preprint arXiv:2410.07073, 2024.

[4] 01. AI, :, Alex Young, Bei Chen, Chao Li, Chengen Huang, Ge Zhang, Guanwei Zhang, Heng Li, Jiangcheng Zhu, Jianqun Chen, Jing Chang, Kaidong Yu, Peng Liu, and more. Yi: Open foundation models by 01.ai. arXiv preprint arXiv:2403.04652, 2024.

[5] Meta AI. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

[6] Jean-Baptiste Alayrac, Jeff Donahue, Pauline Luc, Antoine Miech, Iain Barr, Yana Hasson, Karel Lenc, Arthur Mensch, Katherine Millican, Malcolm Reynolds, et al. Flamingo: a visual language model for few-shot learning. In NeurIPS, 2022.

[7] Anthropic. The claude 3 model family: Opus, sonnet, haiku, 2024.

[8] Jimmy Lei Ba, Jamie Ryan Kiros, and Geoffrey E Hinton. Layer normalization. In NeurIPS Deep Learning Symposium, 2016.

[9] Rohan Bavishi, Erich Elsen, Curtis Hawthorne, Maxwell Nye, Augustus Odena, Arushi Somani, and Sağnak Taşırlar. Fuyu-8b: A multimodal architecture for ai agents, 2023.

[10] Lucas Beyer, Andreas Steiner, André Susano Pinto, Alexander Kolesnikov, Xiao Wang, Daniel Salz, Maxim Neumann, Ibrahim Alabdulmohsin, Michael Tschannen, Emanuele Bugliarello, Thomas Unterthiner, Daniel Keysers, Skanda Koppula, Fangyu Liu, Adam Grycner, Alexey Gritsenko, Neil Houlsby, Manoj Kumar, Keran Rong, Julian Eisenschlos, Rishabh Kabra, Matthias Bauer, Matko Bošnjak, Xi Chen, Matthias Minderer, Paul Voigtlaender, Ioana Bica, Ivana Balazevic, Joan Puigcerver, Pinelopi Papalampidi, Olivier Henaff, Xi Xiong, Radu Soricut, Jeremiah Harmsen, and Xiaohua Zhai. PaliGemma: A versatile 3B VLM for transfer. arXiv preprint arXiv:2407.07726, 2024.

[11] Ali Furkan Biten, Ruben Tito, Andres Mafla, Lluis Gomez, Marçal Rusinol, Ernest Valveny, CV Jawahar, and Dimosthenis Karatzas. Scene text visual question answering. In ICCV, 2019.

[12] Junbum Cha, Wooyoung Kang, Jonghwan Mun, and Byungseok Roh. Honeybee: Locality-enhanced projector for multimodal llm. In CVPR, 2024.

[13] Guiming Hardy Chen, Shunian Chen, Ruifei Zhang, Junying Chen, Xiangbo Wu, Zhiyi Zhang, Zhihong Chen, Jianquan Li, Xiang Wan, and Benyou Wang. Allava: Harnessing gpt4v-synthesized data for a lite vision-language model. arXiv preprint arXiv:2402.11684, 2024a.

[14] Kaibing Chen, Dong Shen, Hanwen Zhong, Huasong Zhong, Kui Xia, Di Xu, Wei Yuan, Yifei Hu, Bin Wen, Tianke Zhang, Changyi Liu, Dewen Fan, Huihui Xiao, Jiahong Wu, Fan Yang, Size Li, and Di Zhang. Evlm: An efficient vision-language model for visual understanding. arXiv preprint arXiv:2407.14177, 2024b.

[15] Lin Chen, Jisong Li, Xiaoyi Dong, Pan Zhang, Conghui He, Jiaqi Wang, Feng Zhao, and Dahua Lin. ShareGPT4V: Improving large multi-modal models with better captions. arXiv preprint arXiv:2311.12793, 2023a.

[16] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Josh Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

[17] Xinlei Chen, Hao Fang, Tsung-Yi Lin, Ramakrishna Vedantam, Saurabh Gupta, Piotr Dollár, and C Lawrence Zitnick. Microsoft COCO captions: Data collection and evaluation server. arXiv preprint arXiv:1504.00325, 2015.

[18] Xi Chen, Xiao Wang, Lucas Beyer, Alexander Kolesnikov, Jialin Wu, Paul Voigtlaender, Basil Mustafa, Sebastian Goodman, Ibrahim Alabdulmohsin, Piotr Padlewski, et al. Pali-3 vision language models: Smaller, faster, stronger. arXiv preprint arXiv:2310.09199, 2023b.

[19] Zhe Chen, Weiyun Wang, Hao Tian, Shenglong Ye, Zhangwei Gao, Erfei Cui, Wenwen Tong, Kongzhi Hu, Jiapeng Luo, Zheng Ma, Ji Ma, Jiaqi Wang, Xiaoyi Dong, Hang Yan, Hewei Guo, Conghui He, Botian Shi, Zhenjiang Jin, Chao Xu, Bin Wang, Xingjian Wei, Wei Li, Wenjian Zhang, Bo Zhang, Pinlong Cai, Licheng Wen, Xiangchao Yan, Min Dou, Lewei Lu, Xizhou Zhu, Tong Lu, Dahua Lin, Yu Qiao, Jifeng Dai, and Wenhai Wang. How far are we to GPT-4V? closing the gap to commercial multimodal models with open-source suites. arXiv preprint arXiv:2404.16821, 2024c.

[20] Mehdi Cherti, Romain Beaumont, Ross Wightman, Mitchell Wortsman, Gabriel Ilharco, Cade Gordon, Christoph Schuhmann, Ludwig Schmidt, and Jenia Jitsev. Reproducible scaling laws for contrastive language-image learning. In CVPR, 2023.

[21] Wei-Lin Chiang, Lianmin Zheng, Ying Sheng, Anastasios Nikolas Angelopoulos, Tianle Li, Dacheng Li, Hao Zhang, Banghua Zhu, Michael Jordan, Joseph E Gonzalez, and Ion Stoica. Chatbot arena: An open platform for evaluating LLMs by human preference. In ICML, 2024.

[22] Xiangxiang Chu, Limeng Qiao, Xinyang Lin, Shuang Xu, Yang Yang, Yiming Hu, Fei Wei, Xinyu Zhang, Bo Zhang, Xiaolin Wei, and Chunhua Shen. Mobilevlm : A fast, strong and open vision language assistant for mobile devices. arXiv preprint arXiv:2312.16886, 2023.

<!-- page 27 of 30 -->

[23] Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

[24] Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

[25] David F Crouse. On implementing 2d rectangular assignment algorithms. IEEE Transactions on Aerospace and Electronic Systems, 2016.

[26] Wenliang Dai, Junnan Li, Dongxu Li, Anthony Meng Huat Tiong, Junqi Zhao, Weisheng Wang, Boyang Albert Li, Pascale Fung, and Steven C. H. Hoi. Instructblip: Towards general-purpose vision-language models with instruction tuning. In NeurIPS, 2023.

[27] Wenliang Dai, Nayeon Lee, Boxin Wang, Zhuoling Yang, Zihan Liu, Jon Barker, Tuomas Rintamaki, Mohammad Shoeybi, Bryan Catanzaro, and Wei Ping. NVLM: Open frontier-class multimodal LLMs. arXiv preprint arXiv:2409.11402, 2024.

[28] Tri Dao. FlashAttention-2: Faster attention with better parallelism and work partitioning. In ICLR, 2024.

[29] Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, and Christopher Ré. FlashAttention: Fast and memory-efficient exact attention with IO-awareness. In NeurIPS, 2022.

[30] Xiaoyi Dong, Pan Zhang, Yuhang Zang, Yuhang Cao, Bin Wang, Linke Ouyang, Songyang Zhang, Haodong Duan, Wenwei Zhang, Yining Li, Hang Yan, Yang Gao, Zhe Chen, Xinyue Zhang, Wei Li, Jingwen Li, Wenhai Wang, Kai Chen, Conghui He, Xingcheng Zhang, Jifeng Dai, Yu Qiao, Dahua Lin, and Jiaqi Wang. InternLM-XComposer2-4KHD: A Pioneering Large Vision-Language Model Handling Resolutions from 336 Pixels to 4K HD. arXiv preprint arXiv:2404.06512, 2024.

[31] Alexey Dosovitskiy, Lucas Beyer, Alexander Kolesnikov, Dirk Weissenborn, Xiaohua Zhai, Thomas Unterthiner, Mostafa Dehghani, Matthias Minderer, Georg Heigold, Sylvain Gelly, Jakob Uszkoreit, and Neil Houlsby. An image is worth 16x16 words: Transformers for image recognition at scale. In ICLR, 2021.

[32] Yunhao Fang, Ligeng Zhu, Yao Lu, Yan Wang, Pavlo Molchanov, Jan Kautz, Jang Hyun Cho, Marco Pavone, Song Han, and Hongxu Yin. Vila$^2$: Vila augmented vila. arXiv preprint arXiv:2407.17453, 2024.

[33] Andrea Frome, Greg S Corrado, Jon Shlens, Samy Bengio, Jeff Dean, Marc'Aurelio Ranzato, and Tomas Mikolov. Devise: A deep visual-semantic embedding model. NeurIPS, 2013.

[34] Chaoyou Fu, Haojia Lin, Zuwei Long, Yunhang Shen, Meng Zhao, Yifan Zhang, Xiong Wang, Di Yin, Long Ma, Xiawu Zheng, et al. Vita: Towards open-source interactive omni multimodal llm. arXiv preprint arXiv:2408.05211, 2024.

[35] Tao Ge, Xin Chan, Xiaoyang Wang, Dian Yu, Haitao Mi, and Dong Yu. Scaling synthetic data creation with 1,000,000,000 personas. arXiv preprint arXiv:2406.20094, 2024.

[36] Yash Goyal, Tejas Khot, Douglas Summers-Stay, Dhruv Batra, and Devi Parikh. Making the V in VQA matter: Elevating the role of image understanding in visual question answering. In CVPR, 2017.

[37] Dirk Groeneveld, Iz Beltagy, Pete Walsh, Akshita Bhagia, Rodney Kinney, Oyvind Tafjord, A. Jha, Hamish Ivison, Ian Magnusson, Yizhong Wang, Shane Arora, David Atkinson, Russell Authur, Khyathi Raghavi Chandu, Arman Cohan, Jennifer Dumas, Yanai Elazar, Yuling Gu, Jack Hessel, Tushar Khot, William Merrill, Jacob Daniel Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Valentina Pyatkin, Abhilasha Ravichander, Dustin Schwenk, Saurabh Shah, Will Smith, Emma Strubell, Nishant Subramani, Mitchell Wortsman, Pradeep Dasigi, Nathan Lambert, Kyle Richardson, Luke Zettlemoyer, Jesse Dodge, Kyle Lo, Luca Soldaini, Noah A. Smith, and Hanna Hajishirzi. OLMo: Accelerating the science of language models. In ACL, 2024.

[38] Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In ICLR, 2021a.

[39] Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. In NeurIPS Track on Datasets and Benchmarks, 2021b.

[40] Joeri R Hermans, Gerasimos Spanakis, and Rico Möckel. Accumulated gradient normalization. In Asian Conference on Machine Learning, pages 439--454. PMLR, 2017.

[41] Wenyi Hong, Weihan Wang, Ming Ding, Wenmeng Yu, Qingsong Lv, Yan Wang, Yean Cheng, Shiyu Huang, Junhui Ji, Zhao Xue, et al. Cogvlm2: Visual language models for image and video understanding. arXiv preprint arXiv:2408.16500, 2024.

[42] Anwen Hu, Haiyang Xu, Jiabo Ye, Mingshi Yan, Liang Zhang, Bo Zhang, Chen Li, Ji Zhang, Qin Jin, Fei Huang, and Jingren Zhou. mplug-docowl 1.5: Unified structure learning for ocr-free document understanding. In Findings of EMNLP, 2024.

[43] Chao Jia, Yinfei Yang, Ye Xia, Yi-Ting Chen, Zarana Parekh, Hieu Pham, Quoc Le, Yun-Hsuan Sung, Zhen Li, and Tom Duerig. Scaling up visual and vision-language representation learning with noisy text supervision. In ICML, 2021.

[44] Dongfu Jiang, Xuan He, Huaye Zeng, Cong Wei, Max Ku, Qian Liu, and Wenhu Chen. Mantis: Interleaved multi-image instruction tuning. arXiv preprint arXiv:2405.01483, 2024.

[45] Roy Jonker and Ton Volgenant. A shortest augmenting path algorithm for dense and sparse linear assignment problems. Computing, 1987.

[46] Kushal Kafle, Brian Price, Scott Cohen, and Christopher Kanan. DVQA: Understanding data visualizations via question answering. In CVPR, 2018.

[47] Samira Ebrahimi Kahou, Vincent Michalski, Adam Atkinson, 'Akos Kádár, Adam Trischler, and Yoshua Bengio. FigureQA: An annotated figure dataset for visual reasoning. arXiv preprint arXiv:1710.07300, 2017.

[48] Siddharth Karamcheti, Suraj Nair, Ashwin Balakrishna, Percy Liang, Thomas Kollar, and Dorsa Sadigh. Prismatic vlms: Investigating the design space of visually-conditioned language models. arXiv preprint arXiv:2402.07865, 2024.

[49] Aniruddha Kembhavi, Mike Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A diagram is worth a dozen images. In ECCV, 2016.

[50] Diederik P Kingma. Adam: A method for stochastic optimization. In ICLR, 2015.

[51] Alexander Kirillov, Eric Mintun, Nikhila Ravi, Hanzi Mao, Chloe Rolland, Laura Gustafson, Tete Xiao, Spencer Whitehead, Alexander C. Berg, Wan-Yen Lo, Piotr Dollár, and Ross Girshick. Segment anything. In ICCV, 2023.

[52] Ranjay Krishna, Yuke Zhu, Oliver Groth, Justin Johnson, Kenji Hata, Joshua Kravitz, Stephanie Chen, Yannis Kalantidis, Li-Jia Li, David A. Shamma, Michael S. Bernstein, and Li Fei-Fei. Visual genome: Connecting language and vision using crowdsourced dense image annotations. International Journal of Computer Vision, 123:0 32 -- 73, 2016.

<!-- page 28 of 30 -->

[53] Alina Kuznetsova, Hassan Rom, Neil Alldrin, Jasper Uijlings, Ivan Krasin, Jordi Pont-Tuset, Shahab Kamali, Stefan Popov, Matteo Malloci, Alexander Kolesnikov, et al. The open images dataset v4: Unified image classification, object detection, and visual relationship detection at scale. IJCV, 2020.

[54] Hugo Laurençon, Andrés Marafioti, Victor Sanh, and Léo Tronchon. Building and better understanding vision-language models: insights and future directions. arXiv preprint arXiv:2408.12637, 2024a.

[55] Hugo Laurençon, Léo Tronchon, and Victor Sanh. Unlocking the conversion of web screenshots into HTML code with the websight dataset. arXiv preprint arXiv:2403.09029, 2024b.

[56] Bo Li, Peiyuan Zhang, Jingkang Yang, Yuanhan Zhang, Fanyi Pu, and Ziwei Liu. Otterhd: A high-resolution multi-modality model. arXiv preprint arXiv:2311.04219, 2023a.

[57] Bo Li, Yuanhan Zhang, Liangyu Chen, Jinghao Wang, Fanyi Pu, Jingkang Yang, C. Li, and Ziwei Liu. Mimic-it: Multi-modal in-context instruction tuning. arXiv preprint arXiv:2306.05425, 2023b.

[58] Bo Li, Yuanhan Zhang, Liangyu Chen, Jinghao Wang, Jingkang Yang, and Ziwei Liu. Otter: A multi-modal model with in-context instruction tuning. arXiv preprint arXiv:2305.03726, 2023c.

[59] Bo Li, Yuanhan Zhang, Dong Guo, Renrui Zhang, Feng Li, Hao Zhang, Kaichen Zhang, Yanwei Li, Ziwei Liu, and Chunyuan Li. LLaVA-OneVision: Easy visual task transfer. arXiv preprint arXiv:2408.03326, 2024a.

[60] Junnan Li, Dongxu Li, Caiming Xiong, and Steven Hoi. Blip: Bootstrapping language-image pre-training for unified vision-language understanding and generation. In ICML, 2022.

[61] Junyan Li, Delin Chen, Yining Hong, Zhenfang Chen, Peihao Chen, Yikang Shen, and Chuang Gan. Covlm: Composing visual entities and relationships in large language models via communicative decoding. In ICLR, 2024b.

[62] Wei Li, William Bishop, Alice Li, Chris Rawles, Folawiyo Campbell-Ajala, Divya Tyamagundlu, and Oriana Riva. On the effects of data scale on computer control agents. arXiv preprint arXiv:2406.03679, 2024c.

[63] Zhang Li, Biao Yang, Qiang Liu, Zhiyin Ma, Shuo Zhang, Jingxu Yang, Yabo Sun, Yuliang Liu, and Xiang Bai. Monkey: Image resolution and text label are important things for large multi-modal models. CVPR, 2024d.

[64] Bin Lin, Zhenyu Tang, Yang Ye, Jiaxi Cui, Bin Zhu, Peng Jin, Junwu Zhang, Munan Ning, and Li Yuan. Moe-llava: Mixture of experts for large vision-language models. arXiv preprint arXiv:2401.15947, 2024.

[65] Tsung-Yi Lin, Michael Maire, Serge Belongie, James Hays, Pietro Perona, Deva Ramanan, Piotr Dollár, and C Lawrence Zitnick. Microsoft coco: Common objects in context. In ECCV, 2014.

[66] Chang Liu, Henghui Ding, and Xudong Jiang. GRES: Generalized referring expression segmentation. In CVPR, 2023a.

[67] Dongyang Liu, Renrui Zhang, Longtian Qiu, Siyuan Huang, Weifeng Lin, Shitian Zhao, Shijie Geng, Ziyi Lin, Peng Jin, Kaipeng Zhang, Wenqi Shao, Chao Xu, Conghui He, Junjun He, Hao Shao, Pan Lu, Yu Qiao, Hongsheng Li, and Peng Gao. SPHINX-x: Scaling data and parameters for a family of multi-modal large language models. In ICML, 2024a.

[68] Fuxiao Liu, Xiaoyang Wang, Wenlin Yao, Jianshu Chen, Kaiqiang Song, Sangwoo Cho, Yaser Yacoob, and Dong Yu. Mmc: Advancing multimodal chart understanding with large-scale instruction tuning. arXiv preprint arXiv:2311.10774, 2023b.

[69] Haotian Liu, Chunyuan Li, Qingyang Wu, and Yong Jae Lee. Visual instruction tuning. In NeurIPS, 2023c.

[70] Haotian Liu, Chunyuan Li, Yuheng Li, and Yong Jae Lee. Improved baselines with visual instruction tuning. In CVPR, 2024b.

[71] Haotian Liu, Chunyuan Li, Yuheng Li, Bo Li, Yuanhan Zhang, Sheng Shen, and Yong Jae Lee. Llava-next: Improved reasoning, ocr, and world knowledge, 2024c.

[72] Ilya Loshchilov and Frank Hutter. Sgdr: Stochastic gradient descent with warm restarts. arXiv preprint arXiv:1608.03983, 2016.

[73] Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. In ICLR, 2019.

[74] Haoyu Lu, Wen Liu, Bo Zhang, Bingxuan Wang, Kai Dong, Bo Liu, Jingxiang Sun, Tongzheng Ren, Zhuoshu Li, Hao Yang, et al. Deepseek-vl: towards real-world vision-language understanding. arXiv preprint arXiv:2403.05525, 2024a.

[75] Jiasen Lu, Christopher Clark, Sangho Lee, Zichen Zhang, Savya Khosla, Ryan Marten, Derek Hoiem, and Aniruddha Kembhavi. Unified-io 2: Scaling autoregressive multimodal models with vision language audio and action. In CVPR, 2024b.

[76] Pan Lu, Swaroop Mishra, Tanglin Xia, Liang Qiu, Kai-Wei Chang, Song-Chun Zhu, Oyvind Tafjord, Peter Clark, and Ashwin Kalyan. Learn to explain: Multimodal reasoning via thought chains for science question answering. In NeurIPS, 2022.

[77] Pan Lu, Liang Qiu, Kai-Wei Chang, Ying Nian Wu, Song-Chun Zhu, Tanmay Rajpurohit, Peter Clark, and Ashwin Kalyan. Dynamic prompt learning via policy gradient for semi-structured mathematical reasoning. In ICLR, 2023.

[78] Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. MathVista: Evaluating mathematical reasoning of foundation models in visual contexts. In ICLR, 2024c.

[79] Gen Luo, Yiyi Zhou, Tianhe Ren, Shengxin Chen, Xiaoshuai Sun, and Rongrong Ji. Cheap and quick: Efficient vision-language instruction tuning for large language models. In NeurIPS, 2023.

[80] Chaitanya Malaviya, Subin Lee, Sihao Chen, Elizabeth Sieber, Mark Yatskar, and Dan Roth. ExpertQA: Expert-curated questions and attributed answers. arXiv preprint arXiv:2309.07852, 2023.

[81] Kenneth Marino, Mohammad Rastegari, Ali Farhadi, and Roozbeh Mottaghi. OK-VQA: A visual question answering benchmark requiring external knowledge. In CVPR, 2019.

[82] Ahmed Masry, Do Long, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. ChartQA: A benchmark for question answering about charts with visual and logical reasoning. In ACL, 2022.

<!-- page 29 of 30 -->

[83] Minesh Mathew, Dimosthenis Karatzas, and CV Jawahar. DocVQA: A dataset for VQA on document images. In WACV, 2021.

[84] Minesh Mathew, Viraj Bagal, Rubèn Tito, Dimosthenis Karatzas, Ernest Valveny, and CV Jawahar. InfographicVQA. In WACV, 2022.

[85] Brandon McKinzie, Zhe Gan, Jean-Philippe Fauconnier, Sam Dodge, Bowen Zhang, Philipp Dufter, Dhruti Shah, Xianzhi Du, Futang Peng, Floris Weers, Anton Belyi, Haotian Zhang, Karanjeet Singh, Doug Kang, Ankur Jain, Hongyu He, Max Schwarzer, Tom Gunter, Xiang Kong, Aonan Zhang, Jianyu Wang, Chong Wang, Nan Du, Tao Lei, Sam Wiseman, Guoli Yin, Mark Lee, Zirui Wang, Ruoming Pang, Peter Grasch, Alexander Toshev, and Yinfei Yang. Mm1: Methods, analysis & insights from multimodal llm pre-training. arXiv preprint arXiv:2403.09611, 2024.

[86] Nitesh Methani, Pritha Ganguly, Mitesh M Khapra, and Pratyush Kumar. PlotQA: Reasoning over scientific plots. In WACV, 2020.

[87] Niklas Muennighoff, Luca Soldaini, Dirk Groeneveld, Kyle Lo, Jacob Morrison, Sewon Min, Weijia Shi, Pete Walsh, Oyvind Tafjord, Nathan Lambert, Yuling Gu, Shane Arora, Akshita Bhagia, Dustin Schwenk, David Wadden, Alexander Wettig, Binyuan Hui, Tim Dettmers, Douwe Kiela, Ali Farhadi, Noah A. Smith, Pang Wei Koh, Amanpreet Singh, and Hannaneh Hajishirzi. OLMoE: Open mixture-of-experts language models. arXiv preprint arXiv:2409.02060, 2024.

[88] OpenAI. GPT-4 technical report. arXiv preprint arXiv:2303.08774, 2023.

[89] OpenAI. GPT-4o mini system card, 2024a.

[90] OpenAI. GPT-4o system card. arXiv preprint arXiv:2410.21276, 2024b.

[91] Maxime Oquab, Timothée Darcet, Theo Moutakanni, Huy V. Vo, Marc Szafraniec, Vasil Khalidov, Pierre Fernandez, Daniel Haziza, Francisco Massa, Alaaeldin El-Nouby, Russell Howes, Po-Yao Huang, Hu Xu, Vasu Sharma, Shang-Wen Li, Wojciech Galuba, Mike Rabbat, Mido Assran, Nicolas Ballas, Gabriel Synnaeve, Ishan Misra, Herve Jegou, Julien Mairal, Patrick Labatut, Armand Joulin, and Piotr Bojanowski. DINOv2: Learning robust visual features without supervision. arXiv preprint arXiv:2304.07193, 2023.

[92] Zhiliang Peng, Wenhui Wang, Li Dong, Yaru Hao, Shaohan Huang, Shuming Ma, and Furu Wei. Kosmos-2: Grounding multimodal large language models to the world. arXiv preprint arXiv:2306.14824, 2023.

[93] Jordi Pont-Tuset, Jasper Uijlings, Soravit Changpinyo, Radu Soricut, and Vittorio Ferrari. Connecting vision and language with localized narratives. In ECCV, 2020.

[94] Shraman Pramanick, Guangxing Han, Rui Hou, Sayan Nag, Ser-Nam Lim, Nicolas Ballas, Qifan Wang, Rama Chellappa, and Amjad Almahairi. Jack of all tasks, master of many: Designing general-purpose coarse-to-fine vision-language model. In CVPR, 2023.

[95] Alec Radford, Karthik Narasimhan, Tim Salimans, and Ilya Sutskever. Improving language understanding by generative pre-training. OpenAI Blog, 2018.

[96] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, and Ilya Sutskever. Learning transferable visual models from natural language supervision. In ICML, 2021.

[97] Hanoona Rasheed, Muhammad Maaz, Sahal Shaji, Abdelrahman Shaker, Salman Khan, Hisham Cholakkal, Rao M Anwer, Eric Xing, Ming-Hsuan Yang, and Fahad S Khan. GLaMM: Pixel grounding large multimodal model. In CVPR, 2024.

[98] Christoph Schuhmann, Romain Beaumont, Richard Vencu, Cade Gordon, Ross Wightman, Mehdi Cherti, Theo Coombes, Aarush Katta, Clayton Mullis, Mitchell Wortsman, Patrick Schramowski, Srivatsa Kundurthy, Katherine Crowson, Ludwig Schmidt, Robert Kaczmarczyk, and Jenia Jitsev. LAION-5B: An open large-scale dataset for training next generation image-text models. arXiv preprint arXiv:2210.08402, 2022.

[99] Dustin Schwenk, Apoorv Khandelwal, Christopher Clark, Kenneth Marino, and Roozbeh Mottaghi. A-OKVQA: A benchmark for visual question answering using world knowledge. In ECCV, 2022.

[100] Amanpreet Singh, Vivek Natarjan, Meet Shah, Yu Jiang, Xinlei Chen, Devi Parikh, and Marcus Rohrbach. Towards VQA models that can read. In CVPR, 2019.

[101] Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 2024.

[102] Quan Sun, Yufeng Cui, Xiaosong Zhang, Fan Zhang, Qiying Yu, Zhengxiong Luo, Yueze Wang, Yongming Rao, Jingjing Liu, Tiejun Huang, and Xinlong Wang. Generative multimodal models are in-context learners. In CVPR, 2024.

[103] Gemini Team. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. arXiv preprint arXiv:2403.05530, 2024a.

[104] OpenGVLab Team. Internvl2: Better than the best—expanding performance boundaries of open-source multimodal models with the progressive scaling strategy, 2024b.

[105] Rahul Thapa, Kezhen Chen, Ian Covert, Rahul Chalamala, Ben Athiwaratkun, Shuaiwen Leon Song, and James Zou. Dragonfly: Multi-resolution zoom-in encoding enhances vision-language models. arXiv preprint arXiv:2406.00977, 2024.

[106] Shengbang Tong, Ellis Brown, Penghao Wu, Sanghyun Woo, Manoj Middepogu, Sai Charitha Akula, Jihan Yang, Shusheng Yang, Adithya Iyer, Xichen Pan, et al. Cambrian-1: A fully open, vision-centric exploration of multimodal LLMs. In NeurIPS, 2024a.

[107] Shengbang Tong, Zhuang Liu, Yuexiang Zhai, Yi Ma, Yann LeCun, and Saining Xie. Eyes wide shut? exploring the visual shortcomings of multimodal LLMs. In CVPR, 2024b.

[108] Maria Tsimpoukelli, Jacob Menick, Serkan Cabi, S. M. Ali Eslami, Oriol Vinyals, Felix Hill, and Zacharias Janssen. Multimodal few-shot learning with frozen language models. In NeurIPS, 2021.

[109] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. In NeurIPS, 2017.

[110] Junke Wang, Lingchen Meng, Zejia Weng, Bo He, Zuxuan Wu, and Yu-Gang Jiang. To see is to believe: Prompting gpt-4v for better visual instruction tuning. arXiv preprint arXiv:2311.07574, 2023a.

[111] Peng Wang, Shuai Bai, Sinan Tan, Shijie Wang, Zhihao Fan, Jinze Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, et al. Qwen2-vl: Enhancing vision-language model's perception of the world at any resolution. arXiv preprint arXiv:2409.12191, 2024a.

[112] Weihan Wang, Qingsong Lv, Wenmeng Yu, Wenyi Hong, Ji Qi, Yan Wang, Junhui Ji, Zhuoyi Yang, Lei Zhao, Xixuan Song, Jiazheng Xu, Bin Xu, Juanzi Li, Yuxiao Dong, Ming Ding, and Jie Tang. Cogvlm: Visual expert for pretrained language models. In NeurIPS, 2024b.

<!-- page 30 of 30 -->

[113] Yizhong Wang, Hamish Ivison, Pradeep Dasigi, Jack Hessel, Tushar Khot, Khyathi Chandu, David Wadden, Kelsey MacMillan, Noah A Smith, Iz Beltagy, et al. How far can camels go? exploring the state of instruction tuning on open resources. In NeurIPS Track on Datasets and Benchmarks, 2023b.

[114] Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark. In NeurIPS Track on Datasets and Benchmarks, 2024c.

[115] Jason Weston, Samy Bengio, and Nicolas Usunier. Wsabie: Scaling up to large vocabulary image annotation. In IJCAI, 2011.

[116] xAI. RealWorldQA. https://huggingface.co/datasets/xai-org/RealworldQA, 2024. Accessed: 2024-09-24.

[117] Bin Xiao, Haiping Wu, Weijian Xu, Xiyang Dai, Houdong Hu, Yumao Lu, Michael Zeng, Ce Liu, and Lu Yuan. Florence-2: Advancing a unified representation for a variety of vision tasks. In CVPR, 2024.

[118] Hu Xu, Saining Xie, Xiaoqing Tan, Po-Yao Huang, Russell Howes, Vasu Sharma, Shang-Wen Li, Gargi Ghosh, Luke Zettlemoyer, and Christoph Feichtenhofer. Demystifying CLIP data. In ICLR, 2024.

[119] Le Xue, Manli Shu, Anas Awadalla, Jun Wang, An Yan, Senthil Purushwalkam, Honglu Zhou, Viraj Prabhu, Yutong Dai, Michael S Ryoo, et al. xGen-MM (BLIP-3): A family of open large multimodal models. arXiv preprint arXiv:2408.08872, 2024.

[120] An Yang, Baosong Yang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Zhou, Chengpeng Li, Chengyuan Li, Dayiheng Liu, Fei Huang, Guanting Dong, Haoran Wei, Huan Lin, Jialong Tang, Jialin Wang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Ma, Jin Xu, Jingren Zhou, Jinze Bai, Jinzheng He, Junyang Lin, Kai Dang, Keming Lu, Keqin Chen, Kexin Yang, Mei Li, Mingfeng Xue, Na Ni, Pei Zhang, Peng Wang, Ru Peng, Rui Men, Ruize Gao, Runji Lin, Shijie Wang, Shuai Bai, Sinan Tan, Tianhang Zhu, Tianhao Li, Tianyu Liu, Wenbin Ge, Xiaodong Deng, Xiaohuan Zhou, Xingzhang Ren, Xinyu Zhang, Xipin Wei, Xuancheng Ren, Yang Fan, Yang Yao, Yichang Zhang, Yu Wan, Yunfei Chu, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, and Zhihao Fan. Qwen2 technical report. arXiv preprint arXiv:2407.10671, 2024.

[121] Charig Yang, Weidi Xie, and Andrew Zisserman. It's about time: Analog clock reading in the wild. In CVPR, 2022.

[122] Huanjin Yao, Wenhao Wu, Taojiannan Yang, Yuxin Song, Mengxi Zhang, Haocheng Feng, Yifan Sun, Zhiheng Li, Wanli Ouyang, and Jingdong Wang. Dense connector for mllms. In NeurIPS, 2024a.

[123] Yuan Yao, Tianyu Yu, Ao Zhang, Chongyi Wang, Junbo Cui, Hongji Zhu, Tianchi Cai, Haoyu Li, Weilin Zhao, Zhihui He, et al. Minicpm-v: A gpt-4v level mllm on your phone. arXiv preprint arXiv:2408.01800, 2024b.

[124] Jiabo Ye, Anwen Hu, Haiyang Xu, Qinghao Ye, Ming Yan, Guohai Xu, Chenliang Li, Junfeng Tian, Qi Qian, Ji Zhang, et al. UReader: Universal OCR-free visually-situated language understanding with multimodal large language model. In Findings of EMNLP, 2023.

[125] Haoxuan You, Haotian Zhang, Zhe Gan, Xianzhi Du, Bowen Zhang, Zirui Wang, Liangliang Cao, Shih-Fu Chang, and Yinfei Yang. Ferret: Refer and ground anything anywhere at any granularity. arXiv preprint arXiv:2310.07704, 2023.

[126] Licheng Yu, Patrick Poirson, Shan Yang, Alexander C Berg, and Tamara L Berg. Modeling context in referring expressions. In ECCV, 2016.

[127] Yuqian Yuan, Wentong Li, Jian Liu, Dongqi Tang, Xinjie Luo, Chi Qin, Lei Zhang, and Jianke Zhu. Osprey: Pixel understanding with visual instruction tuning. In CVPR, 2024a.

[128] Zhengqing Yuan, Zhaoxu Li, Weiran Huang, Yanfang Ye, and Lichao Sun. Tinygpt-v: Efficient multimodal large language model via small backbones. In ICML Workshop on Advancing Neural Network Training, 2024b.

[129] Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, Cong Wei, Botao Yu, Ruibin Yuan, Renliang Sun, Ming Yin, Boyuan Zheng, Zhenzhu Yang, Yibo Liu, Wenhao Huang, Huan Sun, Yu Su, and Wenhu Chen. MMMU: A massive multi-discipline multimodal understanding and reasoning benchmark for expert AGI. In CVPR, 2024.

[130] Xiaohua Zhai, Basil Mustafa, Alexander Kolesnikov, and Lucas Beyer. Sigmoid loss for language image pre-training. In ICCV, 2023.

[131] Haotian Zhang, Mingfei Gao, Zhe Gan, Philipp Dufter, Nina Wenzel, Forrest Huang, Dhruti Shah, Xianzhi Du, Bowen Zhang, Yanghao Li, Sam Dodge, Keen You, Zhen Yang, Aleksei Timofeev, Mingze Xu, Hong-You Chen, Jean-Philippe Fauconnier, Zhengfeng Lai, Haoxuan You, Zirui Wang, Afshin Dehghan, Peter Grasch, and Yinfei Yang. Mm1.5: Methods, analysis & insights from multimodal llm fine-tuning. arXiv preprint arXiv:2409.20566, 2024a.

[132] Haotian Zhang, Haoxuan You, Philipp Dufter, Bowen Zhang, Chen Chen, Hong-You Chen, Tsu-Jui Fu, William Yang Wang, Shih-Fu Chang, Zhe Gan, and Yinfei Yang. Ferret-v2: An improved baseline for referring and grounding with large language models. In COLM, 2024b.

[133] Pan Zhang, Xiaoyi Dong, Yuhang Zang, Yuhang Cao, Rui Qian, Lin Chen, Qipeng Guo, Haodong Duan, Bin Wang, Linke Ouyang, et al. Internlm-xcomposer-2.5: A versatile large vision language model supporting long-contextual input and output. arXiv preprint arXiv:2407.03320, 2024c.

[134] Renrui Zhang, Jiaming Han, Aojun Zhou, Xiangfei Hu, Shilin Yan, Pan Lu, Hongsheng Li, Peng Gao, and Yu Jiao Qiao. Llama-adapter: Efficient fine-tuning of large language models with zero-initialized attention. In ICLR, 2024d.

[135] Yanli Zhao, Andrew Gu, Rohan Varma, Liang Luo, Chien-Chin Huang, Min Xu, Less Wright, Hamid Shojanazeri, Myle Ott, Sam Shleifer, et al. Pytorch fsdp: Experiences on scaling fully sharded data parallel. arXiv preprint arXiv:2304.11277, 2023.

[136] Xingyi Zhou, Rohit Girdhar, Armand Joulin, Philipp Krähenbühl, and Ishan Misra. Detecting twenty-thousand classes using image-level supervision. In ECCV, 2022.

[137] Deyao Zhu, Jun Chen, Xiaoqian Shen, Xiang Li, and Mohamed Elhoseiny. Minigpt-4: Enhancing vision-language understanding with advanced large language models. In ICLR, 2024.
