---
title: "MiniCPM-S 技术解析"
category: "模型库"
tags: ["MiniCPM", "技术解析"]
published: true
excerpt: "规模信息只有侧栏的 1B params 和 BF16。结构上能确定的只有两点：FFN 是 gated FFN，激活函数先换成 ReLU，最后换成 FATReLU。"
---
源文是 Hugging Face 上 openbmb/MiniCPM-S-1B-sft 的模型卡，11 页，1 张图，不是技术报告。

- 这是什么：MiniCPM-1B-sft-bf16 用 ProSparse 方法改出来的激活稀疏版本，论文里叫 ProSparse-1B。
- 卡给了什么：训练步数和正则系数日程，一张分数表，一张加速表，使用上的几条注意事项。
- 卡没给什么：层数，隐藏维度，词表大小，上下文长度，以及 1B 模型自己的加速数字。
- 唯一的图：第 11 页页脚的 Hugging Face 标志，和模型无关。

规模信息只有侧栏的 1B params 和 BF16。结构上能确定的只有两点：FFN 是 gated FFN，激活函数先换成 ReLU，最后换成 FATReLU。

稀疏度是这张卡的主角。MiniCPM-S-1B 的平均稀疏度是 87.89，平均分 44.72，原版 MiniCPM-1B 是 44.44。

## 1. ProSparse 改的是 FFN 的激活

ProSparse 分三步。第一步把 FFN 的激活函数从 Swish 换成 ReLU，再继续训练。第二步在下一个 token 预测损失之外加一项 $L_1$ 正则，作用在 FFN 的稀疏中间输出上，正则系数分阶段往上调。第三步把 ReLU 换成 FATReLU，也就是带正阈值的 ReLU，把非零但很小的激活也剪成零。

三步各管一件事。换 ReLU 让激活里出现真正的零，这是稀疏的来源。$L_1$ 正则把更多中间输出往零推，分阶段加码是为了让模型慢慢适应，卡的原话是避免 「radical activation shifts」，从而少掉分。FATReLU 是最后补一刀，处理那些 ReLU 之后仍然非零，但贡献很弱的元素。

阈值平移的效果在分数表里能单独看出来。带星号的是没做这一步的版本。MiniCPM-S-1B\* 稀疏度 86.25，做完阈值平移到 87.89，平均分两行都是 44.72. 7B 从 88.11 到 89.32，平均分 38.31 到 38.46. 13B 从 87.97 到 88.80，平均分 45.07 到 44.90。三个规模上这一步都只加了一到两个点的稀疏度，平均分的变化都在 0.2 以内。

卡没写 FATReLU 的阈值。唯一的线索是 vLLM 步骤里的环境变量 `ACT_INFO=fatrelu_0.01`，而那一段说的是 ProSparse LLaMA 模型，配置文件链到 prosparse-llama-2-7b. 所以 0.01 能否搬到 1B 上，这张卡给不出答案。

## 2. 101,000 步怎么分

卡写得很清楚：一共约 473.02B token，101,000 步。其中标准 ProSparse 预训练 35,000 步，decay 60,000 步，SFT 6,000 步。超参数表里第 4 阶段累计到 35,000 步，decay 累计到 95,000 步，SFT 累计到 101,000 步，和正文的拆分一致。除了 ProSparse 本身，其余训练设置 「highly consistent」 地沿用原版 MiniCPM-1B。

正则系数的日程是：第 0 阶段 0，训到 10,000 步。第 1 阶段 1e-3，到 15,000 步。第 2 阶段 5e-3，到 20,000 步。第 3 阶段 5e-3，到 25,000 步。第 4 阶段 5e-2，到 35,000 步。decay 固定 5e-2，SFT 固定 1e-2。正文说预热阶段是小常数，之后每个阶段沿正弦曲线上升，表里印的应当是各阶段的目标值。

这张表有两处和正文的 「逐级增大」 不完全对得上。第 2, 3 阶段都是 5e-3，我对过 PDF，同一张表也是两个 5e-3. SFT 的 1e-2 比 decay 的 5e-2 低。卡对这两处都没有说明。

用累计 token 数相减，可以算出每一步大约吃多少 token。这是我自己算的，卡上没写 batch 大小。前 10,000 步 49.15B，约每步 4.915M token. decay 段从 172.03B 到 466.94B，60,000 步，也是约每步 4.915M. SFT 段从 466.94B 到 473.02B，6,000 步只多了 6.08B，约每步 1.01M. 也就是说，SFT 阶段每步的 token 数大约只有前面的五分之一。

「Training Dataset」 这一节其实没有列数据集。它只讲步数和 token 数，数据来源让读者去看 ProSparse 论文和 MiniCPM 技术报告。卡另外补了一句直觉：token 更多，数据覆盖更广，质量更高，任务表现会更好。这句话没有给数字。

## 3. 分数表：稀疏度上去了，平均分没掉

1B 这三行最值得看。MiniCPM-1B 平均分 44.44，MiniCPM-S-1B\* 和 MiniCPM-S-1B 都是 44.72。分项上，代码生成从 36.85 升到 42.04，涨了 5.19。常识推理 63.67 到 64.37，阅读理解 60.90 到 60.73，GSM 35.48 到 34.57。代码涨得多，GSM 小降，其余基本持平。

7B 和 13B 的对照多了 ReluLLaMA 这一档。ReluLLaMA-7B 稀疏度 66.98，平均分 37.62，比原版 LLaMA2-7B 的 37.96 略低。它的阅读理解是 70.54，比原版 61.87 和 ProSparse-7B 的 63.50 都高，但 GSM 只有 5.84，原版是 12.96. ReluLLaMA-13B 稀疏度 71.56，平均分 42.74，低于原版 13B 的 44.06. ProSparse-13B 平均分 44.90，比原版高，稀疏度 88.80。

平均分这一列要小心读。MiniCPM-1B 可见的四列是 36.85, 63.67, 60.90, 35.48，算下来约 49.23，和 44.44 对不上。卡在评测说明里列了七类：代码生成，常识推理，阅读理解，加上 GSM8K, MMLU, BBH, AGI-Eval。表头停在 GSM，PDF 里也只到 GSM，MMLU，BBH，AGI-Eval 几列是被页宽切掉了。所以这份截图里，平均分的构成有一半看不到。

评测设置也在卡上写明了。评测框架是 UltraEval. HumanEval 是 0-shot，MBPP 3-shot，取 pass@1 平均。常识推理和阅读理解都是 0-shot 准确率。GSM8K 8-shot, MMLU 5-shot, BBH 3-shot, AGI-Eval 0-shot. PIQA 这类选择题按困惑度选答案，GSM8K，MMLU，BBH 直接生成答案。

卡还有一句 「所有设置下的模型都用同样多的 token 在同一个混合数据集上训练」。表里的原版 LLaMA2 和 ReluLLaMA 并不是卡的作者训出来的，这句话在这张卡的上下文里怎么成立，卡没有展开。我只照原文记下，不替它补解释。

## 4. 加速表里没有 1B

加速部分有两条线。一条是 PowerInfer，它的速度和准确性很依赖激活预测器，所以卡报告预测器的激活召回率和预测稀疏度，外加每秒生成 token 数，环境是一张 A100 加足够的 CPU。另一条是作者自己写的两个稀疏 GPU 算子，目的是不依赖预测器，做准确的稀疏推理。

两个算子对应 gated FFN 里的两步。S2 是 ReLU 和 $\mathbf{s} \odot (\mathbf{x}\mathbf{W}_1^T)$ 的融合算子，S3 是稀疏矩阵乘向量 $\mathbf{x}_1 \mathbf{W}_2^T$. $\mathbf{s}$ 是门控分数，$\mathbf{x}$ 是 FFN 输入，$\mathbf{x}_1$ 是中间输出。卡没写 $\mathbf{s}$ 怎么算，也没写第（1）步是什么，这里就不补。

表里的数字全是 LLaMA. 7B：稠密每秒 3.67 个 token，ReluLLaMA-7B 11.37, 3.10 倍，ProSparse-7B\* 16.30, 4.44 倍。S2 时间从 90.55 微秒降到 67.12, 46.66, 45.38，分别是 1.35, 1.94, 2.00 倍。13B：稠密每秒 1.92，ReluLLaMA-13B 6.59, 3.43 倍，ProSparse-13B\* 8.67, 4.52 倍。S2 时间从 131.36 微秒降到 69.92, 55.29, 53.78，分别是 1.88, 2.38, 2.44 倍。倍数我用速度和时间相除核过，都对得上。

表里也能看出预测器的效果。ProSparse-7B\* 的激活召回率 93.46，预测稀疏度 75.24，ReluLLaMA-7B 是 90.89 和 58.95. 13B 上 ProSparse-13B\* 是 91.02 和 77.93，ReluLLaMA-13B 是 86.41 和 71.93。在这两组对照里，ProSparse\* 的召回和预测稀疏度都高于 ReluLLaMA，PowerInfer 速度也更快。但召回并不随稀疏度单调上升：ProSparse-7B 稀疏度 89.32，召回 92.34，反而低于 ProSparse-7B\* 的 93.46。

1B 为什么缺席，注释给了原因：带阈值平移的 ProSparse 设置和 MiniCPM 架构，PowerInfer 目前都不支持。所以 ProSparse-7B 和 ProSparse-13B 两行的 PowerInfer 速度是 「-」，1B 更是一行都没有。可第 2 页又列了 「Adapted PowerInfer version」 MiniCPM-S-1B-sft-gguf。两处放在一起，卡没说哪一处更新，读的时候知道有这个矛盾就行。

表头还少了 S3。正文讲了 S2 和 S3，注释也说 steps (2) and (3) 都计了时间，但 MinerU 和 PDF 里都只有 8 列，最后一列是 S2 的倍数。S3 的时间和倍数应当在右边被切掉了，这份材料里拿不到。

## 5. 用起来要注意的几处

对话格式是 `<用户>{prompt}<AI>`，`<用户>` 和 `<AI>` 是提示用的 token。每条输入开头要有 bos token `<s>`，否则模型有时会表现异常。源 md 第 3 页把 `<s>` 认成了 $<\varsigma>$，PDF 那一处是 `<s>`。

用 LM-Eval 跑分可能出现异常，卡把原因归到 LM-Eval 默认不加 `<s>`。修补代码很短：context 编码第一个 id 不是 1 就在前面补一个 1。卡在第 3 页叫它 bos token，第 7 页叫 cls token，指的都是 `<s>`。卡还提醒，其他差异可能来自 few-shot 设置，数据预处理和额外提示词。想复现表里的数字，用 UltraEval。

vLLM 的改法是给 ProSparse LLaMA 模型准备的：替换 llama.py，替换 config.json，设 ACT_INFO。不带阈值平移用 `relu`，带阈值平移用 `fatrelu_0.01`。这三步没有提 MiniCPM-S-1B，不过卡给了 LLaMA 格式的适配版 MiniCPM-S-1B-sft-llama-format，两者之间怎么接，卡上没写。

## 6. 许可证，声明和来源

文首标签写 apache-2.0。第 10 页分开写：仓库按 Apache-2.0 发布，MiniCPM 模型权重的使用必须遵守 General Model License (GML)。学术研究完全免费，商用要发邮件到 cpm@modelbest.cn 申请授权证书。

声明部分有四句：模型从大量文本学习来生成内容，不能理解或表达个人观点，生成内容不代表开发者立场，使用者要自己评估核实。致谢里说这张卡改自 ReluLLaMA-7B 和 MiniCPM-1B 的模型卡，这也解释了为什么卡里大段在讲 LLaMA 7B 和 13B. 仓库还有一个副本 SparseLLM/ProSparse-MiniCPM-1B-sft。

模型由 ModelBest，OpenBMB，THUNLP 制作并微调。卡关联了五篇论文：MiniCPM 技术报告 2404.06395, ProSparse 2402.13516, ReLU^2 Wins 2402.03804, PowerInfer 2312.12456, ReLU Strikes Back 2310.04564。引用用的是 ProSparse 那篇，BibTeX 键名 song2024prosparse，标题和作者行在截图右边被切断。
