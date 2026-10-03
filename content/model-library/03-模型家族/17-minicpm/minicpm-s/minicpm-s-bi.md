---
title: "MiniCPM-S · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM-S 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 11 -->

# openbmb/MiniCPM-S-1B-sft — Hugging Face Model Card

This is the Hugging Face model card of openbmb/MiniCPM-S-1B-sft. It is a model card, not a technical report. The training method is described in the ProSparse paper, which the card links to.

这是 Hugging Face 上 openbmb/MiniCPM-S-1B-sft 的模型卡. 它是模型卡, 不是技术报告. 训练方法写在 ProSparse 论文里, 卡上只给了链接.

The page opens with the site search bar and a "Follow OpenBMB" button with the number 5.36k next to it. The tags are Text Generation, Transformers, PyTorch, Safetensors, English, Chinese, MiniCPM, ModelBest, THUNLP, conversational, and custom_code. The header also shows "arxiv: 5 papers" and "License: apache-2.0", followed by the Deploy, Copy to bucket and Use this model buttons.

页面开头是站内搜索框和 「Follow OpenBMB」 按钮, 旁边的数字是 5.36k. 标签有 Text Generation, Transformers, PyTorch, Safetensors, English, Chinese, MiniCPM, ModelBest, THUNLP, conversational, custom_code. 头部还写着 「arxiv: 5 papers」 和 「License: apache-2.0」, 后面是 Deploy, Copy to bucket, Use this model 三个按钮. Chinese 标签前的 「曲」 和后文 Collection 前的 「品」 是图标被 OCR 认成的字.

The side panel reports the model size as 1B params and the tensor type as BF16, with links to the chat template and file info. Under Inference Providers it says the model isn't deployed by any provider. One Space uses the model: vilarin/MiniCPM-1B. The page then shows a Collection heading and a "Papers for openbmb/MiniCPM-S-1B-sft" heading.

侧栏写模型大小 1B params, 张量类型 BF16, 并给了 chat template 和文件信息的链接. Inference Providers 一栏写这个模型没有部署在任何推理服务商上. 有一个 Space 用了它: vilarin/MiniCPM-1B. 接着是一个 Collection 标题和 「Papers for openbmb/MiniCPM-S-1B-sft」 标题.

> **停一下:** 侧栏的 1B params 之外, 卡上有没有层数, 隐藏维度, 词表大小?
> 没有. 11 页里能找到的规模信息只有 1B params 和 BF16. 后文只说 FFN 是 gated FFN, 激活函数换成 ReLU 再换成 FATReLU, 其余结构参数一个都没印.

<!-- page 2 of 11 -->

Five papers are listed. MiniCPM: Unveiling the Potential of Small Language Models with Scalable Training Strategies, 2404.06395, published Apr 9, 2024, with 24 next to the triangle icon. ProSparse: Introducing and Enhancing Intrinsic Activation Sparsity within Large Language Models, 2402.13516, Feb 21, 2024, 1. ReLU^2 Wins: Discovering Efficient Activation Functions for Sparse LLMs, 2402.03804, Feb 6, 2024, 4. PowerInfer: Fast Large Language Model Serving with a Consumer-grade GPU, 2312.12456, Dec 16, 2023, 46. ReLU Strikes Back: Exploiting Activation Sparsity in Large Language Models, 2310.04564, Oct 6, 2023, 2. The first two titles are cut off with an ellipsis on the page.

列了五篇论文. MiniCPM 那篇讲小模型的可扩展训练策略, 编号 2404.06395, 2024 年 4 月 9 日发布, 三角图标旁是 24. ProSparse 那篇讲在大模型里引入并增强内在激活稀疏, 2402.13516, 2024 年 2 月 21 日, 1. ReLU^2 Wins 讲稀疏 LLM 的高效激活函数, 2402.03804, 2024 年 2 月 6 日, 4. PowerInfer 讲用消费级 GPU 做大模型推理服务, 2312.12456, 2023 年 12 月 16 日, 46. ReLU Strikes Back 讲利用大模型里的激活稀疏, 2310.04564, 2023 年 10 月 6 日, 2. 前两篇的标题在页面上被省略号截断.

The card itself starts with the title MiniCPM-S-1B-sft. The original model is MiniCPM-1B-sft-bf16. The model is created and fine-tuned by ModelBest, OpenBMB and THUNLP. The paper link points to arXiv 2402.13516, with a note that MiniCPM-S-1B is denoted as ProSparse-1B in the paper. There is an adapted LLaMA version, MiniCPM-S-1B-sft-llama-format, and an adapted PowerInfer version, MiniCPM-S-1B-sft-gguf.

卡的正文从标题 MiniCPM-S-1B-sft 开始. 原模型是 MiniCPM-1B-sft-bf16. 模型由 ModelBest (面壁智能), OpenBMB, THUNLP 制作并微调. 论文链接指向 arXiv 2402.13516, 并注明 MiniCPM-S-1B 在论文里叫 ProSparse-1B. 另有两个适配版本: LLaMA 格式的 MiniCPM-S-1B-sft-llama-format, 以及给 PowerInfer 用的 MiniCPM-S-1B-sft-gguf.

> **想:** MiniCPM-S-1B 和论文里的 ProSparse-1B 是两个模型吗?
> 卡上说是同一个, 只是名字不同. 第 10 页还给了一个重复仓库 SparseLLM/ProSparse-MiniCPM-1B-sft, 用的就是 ProSparse 这个名字.

For a proper response, the card recommends a standard chat prompt `<用户>{prompt}<AI>`, where prompt is the query text and `<用户>` and `<AI>` are prompt tokens.

卡建议用标准对话格式 `<用户>{prompt}<AI>` 来让模型好好回答. 其中 prompt 是问题文本, `<用户>` 和 `<AI>` 是提示用的 token.

<!-- page 3 of 11 -->

Also make sure there is a bos token `<s>` at the beginning of any input, otherwise the model can sometimes behave improperly.

另外要保证每条输入开头都有 bos token `<s>`, 否则模型有时会表现异常.

> **核对:** 源 md 这里印的是 $<\varsigma>$, 它是什么符号?
> 是 `<s>`. PDF 同一处的文字就是 「a bos token <s>」, 第 7 页讲 LM-Eval 时也印的是 `<s>`. $<\varsigma>$ 是 MinerU 把尖括号里的 s 认成了希腊字母.

The introduction says activation sparsity, meaning that many elements of activation outputs contribute only weakly, is a promising way to speed up LLM inference. Acceleration methods built on it usually get higher speed by smarter resource allocation and computation policies, so that resources are not wasted on these weakly contributing parameters.

引言说, 激活稀疏指激活输出里有相当多贡献很弱的元素, 利用它来加速大模型推理是一条有希望的路. 基于激活稀疏的加速方法, 通常靠更聪明的资源分配和计算策略, 不把资源浪费在这些弱贡献的参数上, 从而跑得更快.

Using ReLU as the activation function is a direct way to get activation sparsity. But most recent mainstream LLMs use activation functions without intrinsic sparsity, such as GELU and Swish. Some work swaps in ReLU or its variants so that non-ReLU LLMs gain activation sparsity and speed, but few of them get high sparsity and comparable task performance at the same time.

用 ReLU 做激活函数是得到激活稀疏的直接办法. 但近来的主流大模型多用没有内在稀疏性的激活函数, 比如 GELU 和 Swish. 有些工作把激活函数换成 ReLU 或它的变体, 让非 ReLU 模型也有激活稀疏和加速, 但很少能同时做到高稀疏和相当的任务表现.

The card introduces ProSparse, a simple sparsification method that pushes LLMs to higher activation sparsity while keeping comparable performance. Applied to Swish-activated LLaMA2-7B, LLaMA2-13B and MiniCPM-1B, it yields ReLU-activated models with sparsity of 89.32%, 88.80% and 87.89%, with performance comparable to the originals. The card calls these the most sparsely activated models among open-source LLaMA versions and competitive end-size models, well above ReluLLaMA-7B (66.98%) and ReluLLaMA-13B (71.56%). Inference experiments show the speedup on PowerInfer and on two sparse GPU operators.

卡介绍的 ProSparse 是一种简单的稀疏化方法, 把大模型的激活稀疏度往上推, 同时保持相当的表现. 用在 Swish 激活的 LLaMA2-7B, LLaMA2-13B, MiniCPM-1B 上, 得到 ReLU 激活的模型, 稀疏度分别是 89.32%, 88.80%, 87.89%, 表现和原模型相当. 卡说这是开源 LLaMA 版本和同级端侧模型里激活最稀疏的, 明显高于 ReluLLaMA-7B 的 66.98% 和 ReluLLaMA-13B 的 71.56%. 推理实验在 PowerInfer 和两个稀疏 GPU 算子上都看到了加速.

The next heading is Training Dataset.

下一个标题是 Training Dataset (训练数据).

<!-- page 4 of 11 -->

The 1B model is trained on about 473.02 billion tokens in 101,000 steps: 35,000 steps of standard ProSparse pre-training, 60,000 steps of decay, and 6,000 steps of SFT. Apart from ProSparse, the other training settings closely follow the original MiniCPM-1B. The card refers to the paper and the MiniCPM technical report for details.

1B 模型一共训练了约 473.02B token, 101,000 步: 标准 ProSparse 预训练 35,000 步, decay 60,000 步, SFT 6,000 步. 除了 ProSparse, 其他训练设置和原版 MiniCPM-1B 基本一致. 细节让读者去看论文和 MiniCPM 技术报告.

> **拆开:** 101,000 步和表里的累计步数对得上吗?
> 对得上. 35,000 + 60,000 + 6,000 = 101,000. 下一页表里第 4 阶段累计到 35,000, decay 累计到 95,000, SFT 累计到 101,000. 这一节标题叫 Training Dataset, 但没有列任何数据集的名字和配比.

The card adds that, intuitively, training with more tokens or with data of wider coverage and higher quality will give better task performance.

卡还补了一句: 直觉上, 用更多 token, 或者覆盖更广, 质量更高的数据来训, 任务表现会更好.

ProSparse training has three steps, detailed in Section 3.2 of the paper. Step 1, activation function substitution: the FFN activation is replaced with ReLU, followed by continual training. Step 2, progressive sparsity regularization: the model is optimized jointly on next-token prediction loss and an $L_1$ regularization loss on the sparse intermediate outputs of FFNs. The regularization factor rises in stages: a small constant in the warmup stage, then λ increases along a smooth sine curve in each later incremental stage, each stage with a certain number of training steps. This gives the model time to adapt without radical activation shifts, which reduces performance loss. Step 3, activation threshold shifting: ReLU is replaced by FATReLU, a ReLU variant with a positive threshold, which prunes non-zero but weakly contributing activation elements and raises sparsity further.

ProSparse 的训练分三步, 细节在论文 3.2 节. 第一步, 换激活函数: 把 FFN 的激活换成 ReLU, 然后继续训练. 第二步, 渐进稀疏正则: 同时优化常规的下一个 token 预测损失和 $L_1$ 正则损失, 正则加在 FFN 的稀疏中间输出上. 正则系数分阶段上调: 预热阶段是一个小常数, 之后每个递增阶段里 λ 沿一条平滑的正弦曲线上升, 每个阶段各训一定步数. 这样模型有时间适应越来越强的正则, 激活不会剧烈漂移, 掉分就少. 第三步, 平移激活阈值: 把 ReLU 换成 FATReLU, 这是带正阈值的 ReLU 变体, 能把那些非零但贡献很弱的激活元素剪掉, 稀疏度再往上走.

The hyper-parameters of each stage, including the regularization factor $\lambda_i$, the accumulated training steps $T_i$ and the accumulated training tokens, are listed in the table that follows.

每个阶段的超参数, 包括正则系数 $\lambda_i$, 累计训练步数 $T_i$ 和累计训练 token 数, 列在接下来的表里.

<!-- page 5 of 11 -->

| Step Number i | λ<sub>i</sub> | T<sub>i</sub> | Accumulated Tokens (B) |
| --- | --- | --- | --- |
| 0 | 0 | 10,000 | 49.15 |
| 1 | 1e-3 | 15,000 | 73.73 |
| 2 | 5e-3 | 20,000 | 98.30 |
| 3 | 5e-3 | 25,000 | 122.88 |
| 4 | 5e-2 | 35,000 | 172.03 |
| decay | 5e-2 (fixed) | 95,000 | 466.94 |
| SFT | 1e-2 (fixed) | 101,000 | 473.02 |

表里七行: 第 0 到第 4 阶段, 然后 decay 和 SFT. λ 依次是 0, 1e-3, 5e-3, 5e-3, 5e-2, decay 固定 5e-2, SFT 固定 1e-2. 累计 token 从 49.15B 走到 473.02B.

> **看表:** 正文说正则系数逐级增大, 为什么第 2 和第 3 阶段都是 5e-3, SFT 又降到 1e-2?
> PDF 同一张表也是 5e-3, 5e-3, 不是 MinerU 抄错. 卡没有解释这两处. 另外第 0 阶段印的是 0, 正文说预热阶段是 「小常数」, 卡上也没说 0 是不是就是那个常数.

The evaluation results on these benchmarks show the advantage of ProSparse: it is the only method that reaches high sparsity with performance comparable to the original Swish-activated LLaMA2. Models under all settings are trained with the same number of tokens on the same mixed dataset. Evaluation uses the UltraEval framework.

这些基准上的结果显示了 ProSparse 的优势: 它是唯一一个既达到高稀疏, 表现又和原版 Swish 激活 LLaMA2 相当的方法. 所有设置下的模型都用同样多的 token 在同一个混合数据集上训练. 评测用的是 UltraEval 框架.

Code Generation is the average pass@1 on HumanEval (0-shot) and MBPP (3-shot). Commonsense Reasoning is the average 0-shot accuracy on PIQA, SIQA, HellaSwag, WinoGrande and COPA. Reading Comprehension is the average 0-shot accuracy on BoolQ, LAMBADA and TyDi QA. Other Popular Benchmarks are the average accuracies on GSM8K (8-shot), MMLU (5-shot), Big Bench Hard (BBH) (3-shot) and AGI-Eval (0-shot).

代码生成取 HumanEval (0-shot) 和 MBPP (3-shot) 的 pass@1 平均. 常识推理取 PIQA, SIQA, HellaSwag, WinoGrande, COPA 的 0-shot 准确率平均. 阅读理解取 BoolQ, LAMBADA, TyDi QA 的 0-shot 准确率平均. 其他常用基准取 GSM8K (8-shot), MMLU (5-shot), Big Bench Hard (BBH) (3-shot), AGI-Eval (0-shot) 的准确率.

<!-- page 6 of 11 -->

For PIQA, SIQA, HellaSwag, WinoGrande, COPA, BoolQ, LAMBADA, TyDi QA and AGI-Eval, the predicted answer is chosen by maximized perplexity. For GSM8K, MMLU and BBH, the answers are generated directly.

PIQA, SIQA, HellaSwag, WinoGrande, COPA, BoolQ, LAMBADA, TyDi QA, AGI-Eval 这几项, 预测答案按困惑度选 (原文写的是 maximized perplexity). GSM8K, MMLU, BBH 的答案直接生成.

| Setting | Average Sparsity | Average Performance | Code Generation | Commonsense Reasoning | Reading Comprehension | GSM |
| --- | --- | --- | --- | --- | --- | --- |
| LLaMA2-7B | - | 37.96 | 16.37 | 69.59 | 61.87 | 12.96 |
| ReluLLaMA-7B | 66.98 | 37.62 | 15.85 | 69.64 | 70.54 | 5.84 |
| ProSparse-7B* | 88.11 | 38.31 | 19.47 | 66.29 | 63.33 | 12.74 |
| ProSparse-7B | 89.32 | 38.46 | 19.42 | 66.27 | 63.50 | 12.13 |
| LLaMA2-13B | - | 44.06 | 20.19 | 72.58 | 71.55 | 22.21 |
| ReluLLaMA-13B | 71.56 | 42.74 | 20.19 | 70.44 | 73.29 | 18.50 |
| ProSparse-13B* | 87.97 | 45.07 | 29.03 | 69.75 | 67.54 | 25.40 |
| ProSparse-13B | 88.80 | 44.90 | 28.42 | 69.76 | 66.91 | 26.31 |
| MiniCPM-1B | - | 44.44 | 36.85 | 63.67 | 60.90 | 35.48 |
| MiniCPM-S-1B* | 86.25 | 44.72 | 41.38 | 64.55 | 60.69 | 34.72 |
| MiniCPM-S-1B | 87.89 | 44.72 | 42.04 | 64.37 | 60.73 | 34.57 |

1B 这三行: MiniCPM-1B 平均分 44.44, MiniCPM-S-1B* 稀疏度 86.25, 平均 44.72, MiniCPM-S-1B 稀疏度 87.89, 平均 44.72. 代码生成从 36.85 升到 42.04, GSM 从 35.48 降到 34.57, 常识推理 63.67 到 64.37, 阅读理解 60.90 到 60.73.

> **再看:** Average Performance 是这几列的平均吗?
> 不是. MiniCPM-1B 可见的四列是 36.85, 63.67, 60.90, 35.48, 平均约 49.23, 表里印的是 44.44. 第 5 页列了 MMLU, BBH, AGI-Eval, 表头却停在 GSM, PDF 里也只到 GSM, 右边几列在截图时被页宽切掉了. 平均分算进了看不到的那几列.

<!-- page 7 of 11 -->

"Original" refers to the original Swish-activated LLaMA2 versions. ReluLLaMA-7B and ReluLLaMA-13B are available on Hugging Face, and so is MiniCPM-1B. "ProSparse-7B\*", "ProSparse-13B\*" and "MiniCPM-S-1B\*" are the ProSparse versions without activation threshold shifting.

「Original」 指原版 Swish 激活的 LLaMA2. ReluLLaMA-7B 和 ReluLLaMA-13B 在 Hugging Face 上有, MiniCPM-1B 也有. 带星号的 ProSparse-7B\*, ProSparse-13B\*, MiniCPM-S-1B\* 是没做激活阈值平移的 ProSparse 版本.

The next heading is Evaluation Issues with LM-Eval. The results above can be reproduced with UltraEval. Some abnormal results from other frameworks such as LM-Eval probably come from the missing cls token `<s>`, which LM-Eval does not add by default. A quick temporary fix is given in code. Other differences may come from few-shot settings, data pre-processing and extra prompts.

下一个标题是 Evaluation Issues with LM-Eval. 上面的结果能用 UltraEval 复现. 用 LM-Eval 等其他框架跑出的一些异常结果, 可能是因为缺了 cls token `<s>`, LM-Eval 默认不加它. 卡给了一段临时修补代码. 其他差异可能来自 few-shot 设置, 数据预处理和额外的提示词.

```python
# https://github.com/EleutherAI/lm-evaluation-harness/blob/main/lm_eval
for _, context_enc, continuation_enc in chunk:
    # sanity check
    assert len(context_enc) > 0
    # Note: a trivial fix here
    if context_enc[0] != 1:
        context_enc = [1] + context_enc
    assert len(continuation_enc) > 0
    assert len(continuation_enc) <= self.max_length
```

这段代码在 context 编码的第一个 id 不是 1 时, 在前面补一个 1. 代码没有写 1 对应哪个 token, 结合上文, 它指的是 `<s>`. 第 3 页叫它 bos token, 这里叫 cls token, 说的是同一个 `<s>`.

The card then gives steps for adapting the original vLLM to ProSparse LLaMA models. First, replace vllm/model_executor/models/llama.py with a provided file. Second, replace the contents of the original config.json with a provided file. Third, set the environment variable ACT_INFO: `export ACT_INFO=relu` for the version without activation threshold shifting, and `export ACT_INFO=fatrelu_0.01` for the version with it.

接着卡给了把原版 vLLM 改成能跑 ProSparse LLaMA 模型的步骤. 一, 用给定文件替换 vllm/model_executor/models/llama.py. 二, 用给定文件替换原来 config.json 的内容. 三, 设环境变量 ACT_INFO: 跑不带阈值平移的版本用 `export ACT_INFO=relu`, 跑带阈值平移的版本用 `export ACT_INFO=fatrelu_0.01`.

> **对一下:** fatrelu_0.01 里的 0.01 是 FATReLU 的阈值吗? MiniCPM-S-1B 也用这个?
> 卡上别处没写 FATReLU 的阈值, 0.01 只出现在这个变量名里. 这三步说的是 ProSparse LLaMA 模型, 例子里的 config.json 链到 prosparse-llama-2-7b, 没有说 MiniCPM-S-1B 的阈值是多少.

The next heading is Inference Acceleration Effects.

下一个标题是 Inference Acceleration Effects (推理加速效果).

<!-- page 8 of 11 -->

First, the card uses PowerInfer, an acceleration framework built on activation sparsity. Its speed and accuracy depend heavily on the activation predictor, so the card reports activation recall and predicted sparsity, the two key metrics of the predictor, plus the tokens generated per second by PowerInfer on one A100 GPU with sufficient CPUs. GGUF files and activation predictors are also released for ProSparse LLaMA models.

先用的是 PowerInfer, 一个利用激活稀疏的加速框架. 它的速度和准确性很依赖激活预测器, 所以卡报告了预测器的两个关键指标: 激活召回率和预测稀疏度, 另外报告 PowerInfer 每秒生成的 token 数, 环境是一张 A100 加足够的 CPU. ProSparse LLaMA 模型的 GGUF 文件和激活预测器也放出来了.

Because a wrong prediction from the activation predictor can make inference inaccurate, the card also implements two sparse GPU operators for faster, accurate inference. They speed up two key steps of a gated FFN. Step (2), S2, is a fused operator of ReLU and $\mathbf{s} \odot (\mathbf{x}\mathbf{W}_1^T)$. Step (3), S3, is a sparse matrix-vector multiplication $\mathbf{x}_1 \mathbf{W}_2^T$. Here $\mathbf{s}$, $\mathbf{x}$, $\mathbf{x}_1$ and $\odot$ are the gating scores, the FFN input hidden states, the intermediate outputs and element-wise multiplication. $\mathbf{W}_1$ and $\mathbf{W}_2$ are FFN weight matrices.

激活预测器预测错了会让推理不准, 所以卡还实现了两个稀疏 GPU 算子, 做又快又准的推理. 它们加速 gated FFN 里的两个关键步骤. 第 (2) 步 S2 是 ReLU 和 $\mathbf{s} \odot (\mathbf{x}\mathbf{W}_1^T)$ 的融合算子. 第 (3) 步 S3 是稀疏矩阵乘向量 $\mathbf{x}_1 \mathbf{W}_2^T$. 其中 $\mathbf{s}$ 是门控分数, $\mathbf{x}$ 是 FFN 的输入隐状态, $\mathbf{x}_1$ 是中间输出, $\odot$ 是逐元素乘. $\mathbf{W}_1$ 和 $\mathbf{W}_2$ 是 FFN 的权重矩阵. 卡没写 $\mathbf{s}$ 本身怎么算, 也没写第 (1) 步是什么.

The acceleration effects of models with different sparsity are shown below. ProSparse reaches high sparsity without performance loss and gains the most among all settings. Details are in Section 4.3 of the paper.

下面是不同稀疏度模型的加速效果. ProSparse 稀疏度高又不掉分, 在所有设置里收益最大. 细节在论文 4.3 节.

| Setting | Average Sparsity | Activation Recall | Predicted Sparsity | PowerInfer Speed | Speedup to Dense | S2 Time | Speedup to Dense |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dense-7B | - | - | - | 3.67 | 1.00 | 90.55 | 1.00 |
| ReluLLaMA-7B | 66.98 | 90.89 | 58.95 | 11.37 | 3.10 | 67.12 | 1.35 |
| ProSparse-7B* | 88.11 | 93.46 | 75.24 | 16.30 | 4.44 | 46.66 | 1.94 |

这一页是 7B 的前三行. Dense-7B 每秒 3.67 个 token, S2 用时 90.55. ReluLLaMA-7B 每秒 11.37, 3.10 倍, S2 用时 67.12, 1.35 倍. ProSparse-7B\* 每秒 16.30, 4.44 倍, S2 用时 46.66, 1.94 倍.

> **确认:** 正文讲了 S2 和 S3 两个算子, 表里怎么只有 S2 Time?
> 这份截图里确实只有 S2. MinerU 和 PDF 都是 8 列, 最后一列是 S2 的 Speedup to Dense. 第 9 页的注释说 steps (2) and (3) 都计了时间, S3 那两列应当在右边被页宽切掉了. 这里拿不到 S3 的数字.

<!-- page 9 of 11 -->

| Setting | Average Sparsity | Activation Recall | Predicted Sparsity | PowerInfer Speed | Speedup to Dense | S2 Time | Speedup to Dense |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ProSparse-7B | 89.32 | 92.34 | 78.75 | - | - | 45.38 | 2.00 |
| Dense-13B | - | - | - | 1.92 | 1.00 | 131.36 | 1.00 |
| ReluLLaMA-13B | 71.56 | 86.41 | 71.93 | 6.59 | 3.43 | 69.92 | 1.88 |
| ProSparse-13B* | 87.97 | 91.02 | 77.93 | 8.67 | 4.52 | 55.29 | 2.38 |
| ProSparse-13B | 88.80 | 91.11 | 78.28 | - | - | 53.78 | 2.44 |

这一页接着印 ProSparse-7B 和 13B 的四行. ProSparse-7B 没有 PowerInfer 速度, S2 用时 45.38, 2.00 倍. Dense-13B 每秒 1.92, S2 用时 131.36. ReluLLaMA-13B 每秒 6.59, 3.43 倍, S2 用时 69.92, 1.88 倍. ProSparse-13B\* 每秒 8.67, 4.52 倍, S2 用时 55.29, 2.38 倍. ProSparse-13B 也没有 PowerInfer 速度, S2 用时 53.78, 2.44 倍.

For the Dense settings, the inference speed (token/sec) is measured with llama.cpp, and the time (us) of steps (2) and (3) is measured without the sparse GPU operators. For the sparse settings, the speed comes from PowerInfer, and the sparse GPU operators are applied. ProSparse settings with activation threshold shifting and the MiniCPM architecture are not supported by PowerInfer at present.

Dense 设置的推理速度 (token/sec) 用 llama.cpp 得到, 第 (2)(3) 步的时间 (微秒) 不用稀疏 GPU 算子. 稀疏设置的速度用 PowerInfer 得到, 并用上了稀疏 GPU 算子. 带激活阈值平移的 ProSparse 设置和 MiniCPM 架构, PowerInfer 目前都不支持.

> **回看:** 这是 MiniCPM-S-1B 的模型卡, 加速表里有 1B 的数字吗? 第 2 页不是还给了 PowerInfer 版本?
> 加速表里只有 LLaMA 7B 和 13B, 没有一行是 1B. 注释说 MiniCPM 架构 PowerInfer 目前不支持, 这也解释了两行 ProSparse 的 「-」. 第 2 页列的 MiniCPM-S-1B-sft-gguf 叫 「Adapted PowerInfer version」, 卡没有说它和这句 「目前不支持」 谁更新.

The Citation section asks users to cite with a BibTeX entry keyed song2024prosparse: the ProSparse paper, arXiv preprint arXiv:2402.13516, 2024, with authors starting Song, Chenyang; Han, Xu; Zhang, Zhengyan. The title and author lines are cut off at the right edge of the page.

Citation 一节请用户用 BibTeX 引用, 键名 song2024prosparse, 是 ProSparse 那篇论文, arXiv preprint arXiv:2402.13516, 2024 年, 作者开头是 Song Chenyang, Han Xu, Zhang Zhengyan. 标题行和作者行在页面右边被切断了.

<!-- page 10 of 11 -->

License: the repository is released under Apache-2.0. The use of MiniCPM model weights must strictly follow the General Model License (GML). The models and weights of MiniCPM are completely free for academic research. For commercial use, contact cpm@modelbest.cn to obtain a certificate of authorization.

许可证: 仓库按 Apache-2.0 发布. MiniCPM 模型权重的使用必须严格遵守 General Model License (GML, 通用模型许可协议). MiniCPM 的模型和权重对学术研究完全免费. 商用要发邮件到 cpm@modelbest.cn 申请授权证书.

> **问:** 文首写 apache-2.0, 这里又有 GML, 权重到底按哪份?
> 这一页分开写了: 仓库是 Apache-2.0, 权重的使用要遵守 GML. 学术免费, 商用要申请授权. 文首标签只显示了 apache-2.0.

Statement: as a language model, MiniCPM generates content by learning from a large amount of text. It cannot understand or express personal opinions or value judgments. Nothing it generates represents the views or positions of the developers. Users of its output must evaluate and verify it themselves and take full responsibility.

声明: MiniCPM 作为语言模型, 靠学习大量文本来生成内容. 它不能理解或表达个人观点和价值判断. 它生成的任何内容都不代表开发者的观点和立场. 使用这些内容的人要自己评估和核实, 并承担全部责任.

Acknowledgments: the model card is modified from those of ReluLLaMA-7B and MiniCPM-1B. A duplicate of this repo is SparseLLM/ProSparse-MiniCPM-1B-sft.

致谢: 这张模型卡改自 ReluLLaMA-7B 和 MiniCPM-1B 的模型卡. 这个仓库有一个副本, 在 SparseLLM/ProSparse-MiniCPM-1B-sft.

<!-- page 11 of 11 -->

The last page is the Hugging Face site footer: a System theme switch, a Company group (TOS, Privacy, About, Careers) and a Website group (Models, Datasets, Spaces, Pricing, Docs). The only image in the capture is the Hugging Face logo at the bottom.

最后一页是 Hugging Face 的站点页脚: System theme 主题开关, Company 一组 (TOS, Privacy, About, Careers), Website 一组 (Models, Datasets, Spaces, Pricing, Docs). 整份截图唯一的图是页脚的 Hugging Face 笑脸标志, 和模型结构无关.

![Hugging Face 标志](images/p11-image.png)
