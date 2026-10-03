---
title: "MiniCPM-V 2.0 · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM-V 2.0 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 12 -->

![绿色地球图标，页面上它是语言标签 English 和 Chinese 前面的小图标](images/p01-s.png)

Search models, datasets, users...

搜索框里的占位文字：搜索模型，数据集，用户。这份源文是 Hugging Face 上 openbmb/MiniCPM-V-2 模型页的网页截取，不是论文。MinerU 在地球图标下面单独识别出的字母 S 是图标残字，已删去。

## [openbmb](https://huggingface.co/openbmb)/[MiniCPM-V-2](https://huggingface.co/openbmb/MiniCPM-V-2)（模型仓库名）

仓库名：组织 openbmb 下的 MiniCPM-V-2。

Like 504 · Follow <u>OpenBMB 5.36k</u>

点赞 504；关注 OpenBMB 组织的人数 5.36k. MinerU 把 Like 和 504 拆成两行，这里合成一行。

[Visual Question Answering](https://huggingface.co/models?pipeline_tag=visual-question-answering)

![Transformers 标签前的 Hugging Face 笑脸图标](images/p01-transformers-https-huggingface-co-models-library.png)

[Transformers](https://huggingface.co/models?library=transformers) · [Chinese](https://huggingface.co/models?language=zh) · [minicpmv](https://huggingface.co/models?other=minicpmv) · [English](https://huggingface.co/models?language=en)

![Safetensors 标签前的黑色叠层菱形图标](images/p01-safetensors-https-huggingface-co-models-library.png)

[Safetensors](https://huggingface.co/models?library=safetensors) · arxiv:4 papers · [feature-extraction](https://huggingface.co/models?other=feature-extraction) · 4 datasets · [custom\_code](https://huggingface.co/models?other=custom_code) · [Eval Results](https://huggingface.co/models?other=eval-results)

页面标签：任务类型视觉问答，加载库 Transformers，语言中文和英文，模型类型 minicpmv，权重格式 Safetensors，关联 arXiv 论文 4 篇，特征抽取，训练数据集 4 个，需要自定义代码（custom_code），有评测结果。

Copy to bucket **NEW** · Deploy · Use this model

页面按钮：复制到存储桶（新功能），部署，使用此模型。

[**Model card**](https://huggingface.co/openbmb/MiniCPM-V-2) · [Files](https://huggingface.co/openbmb/MiniCPM-V-2/tree/main) · [**xet**](https://huggingface.co/openbmb/MiniCPM-V-2/tree/main)

三个标签页：模型卡，文件，xet 存储标识。

![社区入口前的黄色手掌表情图标](images/p01-image.png)

Community

![社区讨论数的黑底角标，数字 29](images/p01-community.png)

社区讨论区入口。这张角标 MinerU 按下一行命名成 community，图上是数字 29，PDF 文字层里它紧跟在 Community 后面，是讨论帖数。

## Downloads last month（上月下载量）

27,474

上个月下载 27,474 次。

**Safetensors**

![Model size 旁边的圆圈信息图标](images/p01-model-size.png)

Model size: 3B params · Tensor type: BF16 · <u>Files info</u>

Hugging Face 按权重文件自动统计：模型大小 3B 参数，张量类型 BF16；旁边是 「文件信息」 链接。

> **核对：** 侧栏写 3B params，第 3 页正文写 MiniCPM-V 2.8B，第 6 页表里 Size 也记 2.8B，以哪个为准？
> 两个数口径不同。正文说模型由 SigLip-400M 和 MiniCPM-2.4B 经 perceiver resampler 连接，名字里的数相加是 0.4B + 2.4B = 2.8B，perceiver resampler 本身多少参数页面没给。侧栏 3B 是 Hugging Face 按 safetensors 文件统计后取整的数。评测表统一用 2.8B，读表按 2.8B。

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)（推理服务商）

[Visual Question Answering](https://huggingface.co/tasks/visual-question-answering)

This model isn't deployed by any Inference Provider.

任务类型视觉问答。目前没有任何推理服务商部署这个模型。

![请求服务商支持按钮前的举手表情图标](images/p01-ask-for-provider-support.png)

Ask for provider support

请求服务商支持。

## Model tree for openbmb/MiniCPM-V-2（模型谱系）

**Finetunes** [2 models](https://huggingface.co/models?other=base_model:finetune:openbmb/MiniCPM-V-2)

以这个模型为基座的微调模型 2 个。页面没有列出适配器或量化模型。

## Datasets used to train openbmb/MiniCPM-V-2（训练用数据集）

[**liuhaotian/LLaVA-Instruct-150K**](https://huggingface.co/datasets/liuhaotian/LLaVA-Instruct-150K)

[Preview • Updated Jan 3, 2024 • 3.82k • 636](https://huggingface.co/datasets/liuhaotian/LLaVA-Instruct-150K)

[**HuggingFaceM4/VQAv2**](https://huggingface.co/datasets/HuggingFaceM4/VQAv2)

[Updated Jun 30, 2022 • 1.32k • 50](https://huggingface.co/datasets/HuggingFaceM4/VQAv2)

[**openbmb/RLHF-V-Dataset**](https://huggingface.co/datasets/openbmb/RLHF-V-Dataset)

Viewer • Updated May 28, 2024 • 5.73k • ↓ 581 • ♥ 74

页面列出三个训练数据集。LLaVA-Instruct-150K：可预览，2024 年 1 月 3 日更新，下载 3.82k 次，636 个赞。VQAv2: 2022 年 6 月 30 日更新，下载 1.32k 次，50 个赞。RLHF-V-Dataset：可在线查看，2024 年 5 月 28 日更新，5.73k 条数据，下载 581 次，74 个赞。RLHF-V-Dataset 的统计行印在第 2 页页首，这里接回它的条目。

> **问：** 标签栏写 4 datasets，这里只列了 3 个，第 4 个在哪？
> 这 12 页里找不到。列出的是 LLaVA-Instruct-150K，VQAv2 和 RLHF-V-Dataset，页面没有 「展开更多」 之类的入口。这一栏只是元数据里登记的数据集，模型卡正文没有写训练数据的组成和规模，不能拿这 3 个当训练集全貌。

<!-- page 2 of 12 -->

## Spaces using openbmb/MiniCPM-V-2 17（使用本模型的 Space）

eduagarcia/multilingual-tokenizer-leaderboard · jpye00/AdGazer · bokesyo/MiniCPM\_Visual\_Document\_Retriever\_Demo · build-small-hackathon/naija-solar · Mister56/VQA\_app · +12 Spaces

使用这个模型的 Space 共 17 个，页面列出 5 个：多语言分词器排行榜，AdGazer，MiniCPM 视觉文档检索演示，naija-solar，VQA_app，其余 12 个折叠。5 + 12 = 17，和标题的数对得上。MinerU 把 Mister56/VQA_app 这一行排到了标题前面，这里按页面顺序放回。

**Collections including openbmb/MiniCPM-V-2**

MiniCPM-o & MiniCPM-V Collection · Multimodal models with leading perform... • 32 items • Updated 10 days ago • △ 86

MiniCPM Collection · The MiniCPM family of LLMs and VLLMs. • 33 items • Updated 10 days ago • △ 78

收录这个模型的合集两个。MiniCPM-o 与 MiniCPM-V 合集：性能领先的多模态模型（简介被截断），32 项，10 天前更新，86 个赞。MiniCPM 合集：MiniCPM 系列的大语言模型和视觉语言模型，33 项，10 天前更新，78 个赞。

## Papers for openbmb/MiniCPM-V-2（关联论文）

[**MiniCPM-V: A GPT-4V Level MLLM on Your Phone**](https://huggingface.co/papers/2408.01800)

Paper • 2408.01800 • Published Aug 3, 2024 • △ 95

「MiniCPM-V：手机上的 GPT-4V 级多模态大模型」，arXiv 2408.01800, 2024 年 8 月 3 日发布，95 个赞。

[**LLaVA-UHD: an LMM Perceiving Any Aspect Ratio and High-Resolution Images**](https://huggingface.co/papers/2403.11703)

Paper • 2403.11703 • Published Mar 18, 2024 • △ 18

「LLaVA-UHD：能感知任意长宽比和高分辨率图像的多模态大模型」，arXiv 2403.11703, 2024 年 3 月 18 日发布，18 个赞。

[**RLHF-V: Towards Trustworthy MLLMs via Behavior Alignment from Fine-grained Correct…**](https://huggingface.co/papers/2312.00849)

Paper • 2312.00849 • Published Dec 1, 2023 • △ 11

「RLHF-V：用细粒度纠正式人类反馈做行为对齐，走向可信的多模态大模型」（标题在页面上被截断），arXiv 2312.00849, 2023 年 12 月 1 日发布，11 个赞。

[**Large Multilingual Models Pivot Zero-Shot Multimodal Learning across Languages**](https://huggingface.co/papers/2308.12038)

Paper • 2308.12038 • Published Aug 23, 2023 • △ 2

「大型多语言模型撬动跨语言的零样本多模态学习」，arXiv 2308.12038, 2023 年 8 月 23 日发布，2 个赞。这是正文里 VisCPM 那条链接对应的论文。

## Evaluation results（评测结果）

likaixin/ScreenSpot-Pro leaderboard ↗

Overall · [source](https://gui-agent.github.io/grounding-leaderboard/) · 3

Android Studio Macos · [source](https://gui-agent.github.io/grounding-leaderboard/) · 0

Autocad Windows · [source](https://gui-agent.github.io/grounding-leaderboard/) · 0

+24 more

Hugging Face 从第三方排行榜 likaixin/ScreenSpot-Pro 汇总来的结果：总分 3, Android Studio (macOS) 子项 0, Autocad (Windows) 子项 0，另有 24 项折叠。Autocad 这一行和 「+24 more」 印在第 3 页页首，这里接回列表；MinerU 把 Autocad 的分数 0 识别成单独一行，这里并回条目。

> **看表：** 标签栏的 「Eval Results」 指的是这组 ScreenSpot-Pro 分数，还是第 6 页那张大表？
> 指这组。来源链接是 gui-agent.github.io 的 grounding-leaderboard，也就是界面元素定位类榜单；模型卡正文和第 6 页的表都没提 ScreenSpot-Pro。总分 3，两个子项 0，说明这个模型在这类任务上几乎拿不到分，这组数和正文的 OCR 类分数不是一回事。

<!-- page 3 of 12 -->

## [GitHub](https://github.com/OpenBMB/MiniCPM-V) | [Demo](https://huggingface.co/spaces/openbmb/MiniCPM-V-2)

两个链接：GitHub 仓库，在线演示。

## News（新闻）

[2025.01.14] 🔥 We open source [**MiniCPM-o 2.6**](https://huggingface.co/openbmb/MiniCPM-o-2_6), with significant performance improvement over **MiniCPM-V 2.6**, and support real-time speech-to-speech conversation and multimodal live streaming. Try it now.

[2025.01.14] 开源 MiniCPM-o 2.6，性能比 MiniCPM-V 2.6 明显提升，支持实时语音到语音对话和多模态实时流。欢迎试用。

[2024.08.06] 🔥 We open-source [**MiniCPM-V 2.6**](https://huggingface.co/openbmb/MiniCPM-V-2_6), which outperforms GPT-4V on single image, multi-image and video understanding. It advances popular features of MiniCPM-Llama3-V 2.5, and can support real-time video understanding on iPad.

[2024.08.06] 开源 MiniCPM-V 2.6，在单图，多图和视频理解上超过 GPT-4V. 它在 MiniCPM-Llama3-V 2.5 受欢迎的功能上继续改进，能在 iPad 上做实时视频理解。

[2024.05.20] 🔥 The GPT-4V level multimodal model [**MiniCPM-Llama3-V 2.5**](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5) is out.

[2024.05.20] GPT-4V 级多模态模型 MiniCPM-Llama3-V 2.5 发布。

> **停一下：** 新闻前三条讲的是 MiniCPM-o 2.6，MiniCPM-V 2.6 和 MiniCPM-Llama3-V 2.5，「outperforms GPT-4V」 说的是谁？
> 说的是 2024.08.06 那条里的 MiniCPM-V 2.6，不是这页的 MiniCPM-V 2.0。新闻列表在 2.0 发布后一直往上追加，前三条是后续型号的公告。MiniCPM-V 2.0 自己的主张从 2024.04.12 那条开始，对手是 Gemini Pro，Qwen-VL-Chat 9.6B 和 Yi-VL 34B，没有说胜过 GPT-4V。

[2024.04.23] MiniCPM-V 2.0 supports vLLM now!

[2024.04.23] MiniCPM-V 2.0 现已支持 vLLM。

[2024.04.18] We create a HuggingFace Space to host the demo of MiniCPM-V 2.0 at [here](https://huggingface.co/spaces/openbmb/MiniCPM-V-2)!

[2024.04.18] 在 HuggingFace 上建了一个 Space 来托管 MiniCPM-V 2.0 的演示，地址见链接。

[2024.04.17] MiniCPM-V 2.0 supports deploying [WebUI Demo](https://github.com/OpenBMB/MiniCPM-V/blob/8a1f766b85595a8095651eed9a44a83a965b305b/README_en.md#minicpm-v-) now!

[2024.04.17] MiniCPM-V 2.0 现已支持部署 WebUI 演示。

[2024.04.15] MiniCPM-V 2.0 supports [fine-tuning](https://github.com/modelscope/swift/blob/main/docs/source/Multi-Modal/minicpm-v-2%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5.md) with the SWIFT framework!

[2024.04.15] MiniCPM-V 2.0 支持用 SWIFT 框架微调。

[2024.04.12] We open-source MiniCPM-V-2.0, which achieves comparable performance with Gemini Pro in understanding scene text and outperforms strong Qwen-VL-Chat 9.6B and Yi-VL 34B on [OpenCompass](https://rank.opencompass.org.cn/leaderboard-multimodal), a comprehensive evaluation over 11 popular benchmarks. Click [here](https://openbmb.vercel.app/minicpm-v-2) to view the MiniCPM-V 2.0 technical blog.

[2024.04.12] 开源 MiniCPM-V-2.0。它在场景文字理解上与 Gemini Pro 表现相当；在 OpenCompass 上超过强模型 Qwen-VL-Chat 9.6B 和 Yi-VL 34B，OpenCompass 是覆盖 11 个常用基准的综合评测。点链接可看 MiniCPM-V 2.0 的技术博客。

![MiniCPM-V 2.0 标题前的锚点链接图标](images/p03-minicpm-v-2-0.png)

## MiniCPM-V 2.0

**MiniCPM-V 2.8B** is a strong multimodal large language model for efficient end-side deployment. The model is built based on SigLip-400M and [MiniCPM-2.4B](https://github.com/OpenBMB/MiniCPM/), connected by a perceiver resampler. Our latest version, **MiniCPM-V 2.0** has several notable features.

MiniCPM-V 2.8B 是一个面向端侧高效部署的多模态大语言模型。模型以 SigLip-400M 和 MiniCPM-2.4B 为基础，两者之间用 perceiver resampler 连接。最新版本 MiniCPM-V 2.0 有以下几个特点。

> **拆开：** 「MiniCPM-V 2.8B」 和 「MiniCPM-V 2.0」 是两个模型吗？
> 是同一个。2.8B 是参数量，2.0 是版本号：这句先用参数量称呼模型，后半句才说 「最新版本 MiniCPM-V 2.0」。容易混的地方在第 6 页：上一代 MiniCPM-V 在表里的 Size 也是 2.8B，两代尺寸相同，表里两代之间的差距不来自参数量。

<!-- page 4 of 12 -->

## 🔥 State-of-the-art Performance.（领先的性能）

MiniCPM-V 2.0 achieves **state-of-the-art performance** on multiple benchmarks (including OCRBench, TextVQA, MME, MMB, MathVista, etc) among models under 7B parameters. It even **outperforms strong Qwen-VL-Chat 9.6B, CogVLM-Chat 17.4B, and Yi-VL 34B on OpenCompass, a comprehensive evaluation over 11 popular benchmarks**. Notably, MiniCPM-V 2.0 shows **strong OCR capability**, achieving **comparable performance to Gemini Pro in scene-text understanding**, and **state-of-the-art performance on OCRBench** among open-source models.

在 7B 参数以下的模型里，MiniCPM-V 2.0 在多个基准（包括 OCRBench，TextVQA，MME，MMB，MathVista 等）上取得领先。在 OpenCompass 这个覆盖 11 个常用基准的综合评测上，它甚至超过了强模型 Qwen-VL-Chat 9.6B，CogVLM-Chat 17.4B 和 Yi-VL 34B. 特别是，MiniCPM-V 2.0 的 OCR 能力很强：场景文字理解与 Gemini Pro 相当，OCRBench 成绩在开源模型中领先。

> **看表：** 「7B 以下模型中 MME 领先」 和第 6 页的表对得上吗？
> 对不上。表里 Yi-VL-6B 的 Size 是 6.7B，MME 1915.1，比 MiniCPM-V 2.0 的 1808.6 高 106.5. MMB 若看 dev(zh)，Yi-VL-6B 的 68.3 也比 68.1 高 0.2; dev(en) 是 MiniCPM-V 2.0 的 69.6 领先 68.6。在 7B 以下确实最高的是 OCRBench，TextVQA 和 MathVista 三项。

> **对一下：** OpenCompass 55.0 胜过 Qwen-VL-Chat，CogVLM-Chat 和 Yi-VL 34B，表里有没有没点名的对手？
> 有。点名的三个分别是 52.1, 52.5, 52.6，都低于 55.0。同表 DeepSeek-VL-7B (7.3B) 是 55.6，比 MiniCPM-V 2.0 高 0.6，正文没有提它；第 5 页雷达图 OpenCompass 轴的外圈刻度也是 55.6。

> **确认：** 「场景文字理解与 Gemini Pro 相当」 落在哪几列？
> 只落在 TextVQA: 74.1 对 Gemini Pro Vision 的 74.6，差 0.5. OCRBench 是 605 对 680，差 75；DocVQA 是 71.9 对 88.1，差 16.2。正文把 OCRBench 的领先限定在开源模型里，这样读才和表一致：605 在开源模型中最高，CogVLM-Chat 590 次之，两个闭源模型（680, 645）都更高。

## 🏆 Trustworthy Behavior.（可信行为）

LMMs are known for suffering from hallucination, often generating text not factually grounded in images. MiniCPM-V 2.0 is **the first end-side LMM aligned via multimodal RLHF for trustworthy behavior** (using the recent [RLHF-V](https://rlhf-v.github.io/) [CVPR'24] series technique). This allows the model to **match GPT-4V in preventing hallucinations** on Object HalBench.

多模态大模型普遍有幻觉问题，常常生成与图像事实不符的文字。MiniCPM-V 2.0 是第一个通过多模态 RLHF 对齐可信行为的端侧多模态大模型（用的是近期 RLHF-V [CVPR'24] 系列技术）。这让它在 Object HalBench 上防幻觉的表现与 GPT-4V 持平。

> **回看：** 「在 Object HalBench 上与 GPT-4V 持平」，表里是 85.5 / 92.2 对 86.4 / 92.7，算持平吗？
> 两个数都略低，分别低 0.9 和 0.5，「match」 是约数说法。这一列每格两个数，斜杠前后各是什么指标，这 12 页没有解释；第 5 页雷达图只画了斜杠后的 92.2，而且把它画在最外圈，可见图里按越高越好处理。

## 🌟 High-Resolution Images at Any Aspect Raito.（任意长宽比的高分辨率图像）

MiniCPM-V 2.0 can accept **1.8 million pixels (e.g., 1344x1344) images at any aspect ratio**. This enables better perception of fine-grained visual information such as small objects and optical characters, which is achieved via a recent technique from [LLaVA-UHD](https://arxiv.org/pdf/2403.11703.pdf).

MiniCPM-V 2.0 能接收任意长宽比，最多 180 万像素（例如 1344x1344）的图像。这让它能更好地看清小物体，印刷文字这类细粒度视觉信息，做法来自近期的 LLaVA-UHD 技术。标题里的 Raito 是原文拼写，应为 Ratio。

> **想：** 1.8M 像素配 1344x1344 这个例子，进到语言模型要多少 token?
> 页面没有给。1344 × 1344 = 1,806,336 像素，和 「1.8 million」 对得上。下面 High Efficiency 一段只说 perceiver resampler 把图像表示压成 「much fewer tokens」，没有每张图或每个切片的 token 数，也没说非正方形的图怎么切，这页回答不了。

## ⚡️ High Efficiency.（高效）

MiniCPM-V 2.0 can be **efficiently deployed on most GPU cards and personal computers**, and **even on end devices such as mobile phones**. For visual encoding, we compress the image representations into much fewer tokens via a perceiver resampler. This allows MiniCPM-V 2.0 to operate with **favorable memory cost and speed during inference even when dealing with high-resolution images**.

MiniCPM-V 2.0 能在大多数 GPU 和个人电脑上高效部署，甚至能部署在手机这类端侧设备上。视觉编码这一步，我们用 perceiver resampler 把图像表示压缩成少得多的 token。因此即使处理高分辨率图像，MiniCPM-V 2.0 推理时的显存占用和速度也不错。

## 🙌 Bilingual Support.（双语支持）

MiniCPM-V 2.0 **supports strong bilingual multimodal capabilities in both English and Chinese**. This is enabled by generalizing multimodal capabilities across languages, a technique from [VisCPM](https://arxiv.org/abs/2308.12038) [ICLR'24].

MiniCPM-V 2.0 在英文和中文上都有较强的多模态能力。这来自把多模态能力跨语言泛化的做法，是 VisCPM [ICLR'24] 提出的技术。这句话在 「across」 之后跨到第 5 页，这里接回。

<!-- page 5 of 12 -->

## Evaluation（评测）

![八轴雷达图：TextVQA val, DocVQA Test，OCRBench，Object HalBench，MME，MMMU val，MathVista，OpenCompass；六个模型为 Qwen-VL-Chat 9.6B, DeepSeek-VL-7B，CogVLM-Chat 17.4B，MobileVLM V2 3.1B，MiniCPM-V 2.8B，MiniCPM-V 2.0 2.8B，紫色的 MiniCPM-V 2.0 在多数轴上处于最外圈](images/p05-results-on-textvqa-docvqa-ocrbench-opencompass-mme.png)

Results on TextVQA, DocVQA, OCRBench, OpenCompass, MME, MMBench, MMMU, MathVista, LLaVA Bench, Object HalBench.

在 TextVQA, DocVQA，OCRBench，OpenCompass，MME，MMBench，MMMU，MathVista，LLaVA Bench，Object HalBench 上的结果。

> **再看：** 图注列了 10 个基准，雷达图上有几根轴？
> 8 根，图注里的 MMBench 和 LLaVA Bench 不在图上，要看第 6 页的表。MiniCPM-V 2.0 也不是每根轴都在最外圈：MME 轴外圈 1860.0 是 Qwen-VL-Chat，OpenCompass 轴外圈 55.6 是 DeepSeek-VL-7B，MMMU val 轴外圈 38.3 是 DeepSeek-VL-7B 和上一代 MiniCPM-V. 图里只有 6 个模型，没有 Gemini Pro，GPT-4V 和两个 Yi-VL。

<!-- page 6 of 12 -->

<table><tr><td>Model</td><td>Size</td><td>TextVQA val</td><td>DocVQA test</td><td>OCRBench</td><td>OpenCompass</td><td>MME</td><td>MMB dev(en)</td><td>MMB dev(zh)</td><td>MMMU val</td><td>MathVista</td><td>LLaVA Bench</td><td>Object HalBench</td></tr><tr><td colspan="13">Proprietary models</td></tr><tr><td>Gemini Pro Vision</td><td>-</td><td>74.6</td><td>88.1</td><td>680</td><td>63.8</td><td>2148.9</td><td>75.2</td><td>74.0</td><td>48.9</td><td>45.8</td><td>79.9</td><td>-</td></tr><tr><td>GPT-4V</td><td>-</td><td>78.0</td><td>88.4</td><td>645</td><td>63.2</td><td>1771.5</td><td>75.1</td><td>75.0</td><td>53.8</td><td>47.8</td><td>93.1</td><td>86.4 / 92.7</td></tr><tr><td colspan="13">Open-source models 6B~34B</td></tr><tr><td>Yi-VL-6B</td><td>6.7B</td><td>45.5*</td><td>17.1*</td><td>290</td><td>49.3</td><td>1915.1</td><td>68.6</td><td>68.3</td><td>40.3</td><td>28.8</td><td>51.9</td><td>-</td></tr><tr><td>Qwen-VL-Chat</td><td>9.6B</td><td>61.5</td><td>62.6</td><td>488</td><td>52.1</td><td>1860.0</td><td>60.6</td><td>56.7</td><td>37.0</td><td>33.8</td><td>67.7</td><td>56.2 / 80.0</td></tr><tr><td>Yi-VL-34B</td><td>34B</td><td>43.4*</td><td>16.9*</td><td>290</td><td>52.6</td><td>2050.2</td><td>71.1</td><td>71.4</td><td>45.1</td><td>30.7</td><td>62.3</td><td>-</td></tr><tr><td>DeepSeek-VL-7B</td><td>7.3B</td><td>64.7*</td><td>47.0*</td><td>435</td><td>55.6</td><td>1765.4</td><td>74.1</td><td>72.8</td><td>38.3</td><td>36.8</td><td>77.8</td><td>-</td></tr><tr><td>TextMonkey</td><td>9.7B</td><td>64.3</td><td>66.7</td><td>558</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>CogVLM-Chat</td><td>17.4B</td><td>70.4</td><td>33.3*</td><td>590</td><td>52.5</td><td>1736.6</td><td>63.7</td><td>53.8</td><td>37.3</td><td>34.7</td><td>73.9</td><td>73.6 / 87.4</td></tr><tr><td colspan="13">Open-source models 1B~3B</td></tr><tr><td>DeepSeek-VL-1.3B</td><td>1.7B</td><td>58.4*</td><td>37.9*</td><td>413</td><td>46.0</td><td>1531.6</td><td>64.0</td><td>61.2</td><td>33.8</td><td>29.4</td><td>51.1</td><td>-</td></tr><tr><td>MobileVLM V2</td><td>3.1B</td><td>57.5</td><td>19.4*</td><td>-</td><td>-</td><td>1440.5(P)</td><td>63.2</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Mini-Gemini</td><td>2.2B</td><td>56.2</td><td>34.2*</td><td>-</td><td>-</td><td>1653.0</td><td>59.8</td><td>-</td><td>31.7</td><td>-</td><td>-</td><td>-</td></tr><tr><td>MiniCPM-V</td><td>2.8B</td><td>60.6</td><td>38.2</td><td>366</td><td>47.6</td><td>1650.2</td><td>67.9</td><td>65.3</td><td>38.3</td><td>28.9</td><td>51.3</td><td>78.4 / 88.5</td></tr><tr><td>MiniCPM-V 2.0</td><td>2.8B</td><td>74.1</td><td>71.9</td><td>605</td><td>55.0</td><td>1808.6</td><td>69.6</td><td>68.1</td><td>38.2</td><td>38.7</td><td>69.2</td><td>85.5 / 92.2</td></tr></table>

表的列依次是：模型，参数量，TextVQA 验证集，DocVQA 测试集，OCRBench，OpenCompass，MME，MMBench 开发集（英文），MMBench 开发集（中文），MMMU 验证集，MathVista, LLaVA Bench, Object HalBench。行分三组：闭源模型（Gemini Pro Vision, GPT-4V），6B 到 34B 的开源模型，1B 到 3B 的开源模型。「-」 表示没有数据。PDF 里 MiniCPM-V 2.0 一行整行加粗，上一代 MiniCPM-V 的 MMMU val 38.3 也加粗。

\* We evaluate the officially released checkpoint by ourselves.

\* 这些分数是我们自己用官方发布的权重测出来的。

> **问：** 带星号的格和 MobileVLM V2 那格 1440.5(P) 该怎么读？
> 星号按脚注是团队自己用官方权重测的，集中在 TextVQA 和 DocVQA 两列，例如 Yi-VL-34B 的 DocVQA 16.9*，CogVLM-Chat 的 DocVQA 33.3*；不带星号的格来源页面没说。（P）在这 12 页里没有解释，这一格和同列其他 MME 分数可能不是同一口径，不宜直接比。MiniCPM-V 2.0 自己那一行没有星号。

> **看表：** 同是 2.8B，MiniCPM-V 2.0 比上一代 MiniCPM-V 哪几列涨得多，有没有倒退？
> 涨得最多的是文字密集的几列：DocVQA 38.2 到 71.9 (+33.7)，TextVQA 60.6 到 74.1 (+13.5)，OCRBench 366 到 605 (+239)；另外 LLaVA Bench +17.9, MathVista +9.8, OpenCompass +7.4. MMMU val 是 38.3 到 38.2，降了 0.1，是唯一没涨的一列，学科知识类题目基本没动。

## Examples（示例）

示例。这个标题印在第 6 页表格下方，MinerU 没有识别出来，这里按 PDF 补上。

<!-- page 7 of 12 -->

第 7 页是三组演示截图，每组左边是输入图，右边是提示词和回答。MinerU 把三组的内容交错排列，这里按 PDF 版面顺序分组排。

![台北街景照片，砖楼底层是 animate cafe 蓝色招牌，被红框圈出，左边竖招牌和右边 FamilyMart 招牌也有彩色框](images/p07-q-b-bc.png)

![三个招牌的放大图：红框 animate cafe 蓝底招牌，黄框 「金店面 誠忠不動產」 竖招牌，青框 FamilyMart 招牌](images/p07-you-may-see-it-if-you-re-lucky-while-you-re-sitting-on.png)

animatecafe

放大图里 animate cafe 招牌文字的识别结果。这张放大图 MinerU 按下一段文字命名，实际属于第一组演示。

![用户头像图标](images/p07-image.png)

描述画面内容

用户的提示词，原文就是中文。

![机器人头像图标，表示下面是 MiniCPM-V 2.0 的回答](images/p07-image-2.png)

#### MiniCPM-V 2.0

这幅图片描绘了一个繁忙的城市街道场景。在前景中，有一家名为「动画咖啡馆」（Animate Cafe）的商店，它有一个蓝色的招牌。这家店位于一栋砖砌建筑的前面，这栋建筑上装饰着各种广告牌和标志。在街道上，有几辆摩托车和一辆汽车停着或行驶着，表明这是一个活跃的交通环境。可以看到几个人，其中一些正在行走，而另一些则坐在摩托车上。在背景中，可以看到其他商店的招牌，包括一家名为「诚忠不动产」的房地产公司，以及一家名为全家便利店”（FamilyMart）的便利商店。这些商店的存在表明该地区可能是一个商业和住宅混合区。总体而言，这幅图像捕捉到了一个充满活力的城市环境，展示了各种商店、交通和行人，营造出一种繁忙的都市氛围

模型回答原文是中文，照录。PDF 截图里有三处绿色高亮：有一家名为 「动画咖啡馆」（Animate Cafe）的商店，「诚忠不动产」 的房地产公司，一家名为 「全家便利店」（FamilyMart）的便利商店。

\*The colored boxes are for illustration purposes only and are not used as model input.

\*彩色框只作示意，不作为模型输入。

> **对一下：** 回答里的店名和截图对得上吗？
> 三处绿色高亮都对得上招牌。招牌上是繁体 「誠忠不動產」，回答写成简体 「诚忠不动产」。MinerU 版本在 「全家便利店」 前丢了左引号，PDF 截图里左引号在，上面照 MinerU 原样保留。回答没有提竖招牌上的 「金店面」。

第二组的输入是一张 BBC 旅游报道的长截图。下面的英文是 MinerU 从截图里识别出的文字，IIghting，galaxcy，spolke 这类拼写错误是识别结果，照录。截图里的作者署名 「By Sarah Harvey, Features correspondent」 和几条图片说明没有被识别出来。

≡ q B BC

截图顶部 BBC 网站导航栏（菜单，搜索，BBC 标志）的识别结果。

How a fictitious 'sea' became a top Maldivian tourist attraction

一片虚构的 「海」 是怎么成为马尔代夫头号景点的。

![马尔代夫夜晚海滩，岸边海水泛着蓝色荧光，天上是银河，右下角署名 Petr Horalek](images/p07-the-maldives-famous-sea-of-stars-is-part-fact-part.png)

The Maldives' famous Sea of Stars is part fact, part fiction – but that just adds to the mystery of one of the country's top tourist attractions.

马尔代夫著名的 「星空海」 一半是真，一半是虚构，但这反而给这个国家最热门的景点之一添了几分神秘。

A glittering expanse of the Indian Ocean glowed blue in the dark as if the stars were submerged underwater after falling from the sky. Along the shoreline, more tiny star-like dots were swept up by waves and tumbled onto the beach, IIghting up the wet sand like a reflection of the night sky. They disappeared into the shadows in mere moments. I bounded across the beach and turned round to see my footprints rekindling the lights, leaving a glowing trail behind me. Dipping my toe into the twinkling blue water, the brightness intensified, Iike a swirling galaxcy.

一大片印度洋在黑暗里闪着蓝光，好像星星从天上掉下来，沉进了水里。沿着海岸，更多星点似的小光被浪卷起，翻到沙滩上，把湿沙照亮，像夜空的倒影。它们转眼就没入阴影。我跳着跑过沙滩，回头看见自己的脚印又把光点亮，身后留下一道发光的足迹。把脚趾探进闪烁的蓝色海水，光变得更亮，像一个旋转的星系。

This Incredible sight, commonly known as the "Sea of Stars", is one of the highest-rated attractions in the Maldives. Stunning images of it proliferate online, inspiring adventurous travellers to seek it out. But few people can agree on exactly where you can find the Maldives' Sea of Stars.

这一奇景通常被叫作 「星空海」，是马尔代夫评分最高的景点之一。网上到处是它的惊艳照片，吸引爱冒险的旅行者去寻找。可到底在哪里能看到马尔代夫的星空海，很少有人说得一致。

That's because the Sea of Stars does not actually exist.

原因是星空海其实并不存在。

To clarify, the Maldives' mysterious Sea of Stars does not exist as a geographical location. The simple reason for this Is that these magical-looking lights are bioluminescent plankton that bob around the ocean.

讲清楚一点：马尔代夫神秘的星空海并不是一个地理位置。原因很简单，这些看着很神奇的光，是在海里漂来漂去的发光浮游生物。

"When people say they want to see the Sea of Stars in the Maldives, they are actually asking to see a chemical reaction - it's bioluminescent plankton," said marine biologist and wildlife presenter Lauren Arthur, who worked in the Maldives for eight years and recently returned to film sea life.

「人们说想去马尔代夫看星空海，其实是想看一种化学反应，也就是发光浮游生物，」 海洋生物学家，野生动物节目主持人 Lauren Arthur 说。她在马尔代夫工作过八年，最近又回去拍摄海洋生物。

She explained that bioluminescence is a chemical reaction whereby light is produced, while plankton is a collective term for microscopic organisms that can't control their movements - they just float around in currents. Not all plankton is capable of emitting light (only specific species can), but even then, they don't emit light all the time, only when they are disturbed, she added. "There's no one specific place to find bioluminescent plankton. It can be found anywhere in the Maldives, or even anywhere around the world where you get plankton, even the United Kingdom.

她解释说，生物发光是一种产生光的化学反应，而浮游生物是对无法控制自身运动的微小生物的统称，它们只是随洋流漂动。她补充说，并非所有浮游生物都能发光（只有特定物种可以），能发光的也不是一直发光，只有受到扰动时才发光。「没有哪个特定地点才能找到发光浮游生物。在马尔代夫哪里都可能看到，甚至世界上任何有浮游生物的地方都可能看到，连英国也有。」 MinerU 把这段在 「emitting light」 处拆成两段，这里接回。

![夜晚海滩近景，浪花泛着亮蓝色荧光，远处是岛上树影和星空，右下角署名 Petr Horalek](images/p07-te.png)

图下 MinerU 识别出的残字 te 已删去。

This means that while the Maldives' famous Sea of Stars does not exist, you could still see something resembling a sea of stars - although witnessing it will largely come down to luck

这意味着，马尔代夫著名的星空海虽然不存在，你仍可能看到类似星空海的景象，只是能不能看到，很大程度上靠运气。

Visit during the Southwest Monsoon from April till October

在 4 月到 10 月的西南季风期前往。

• Book a night snorkelling trip with a local. operator

• 找当地运营商预订夜间浮潜。

Choose an island with minimal light pollution on the beach

选一个海滩上光污染最少的岛。

这三行是截图里的提示框。

Arthur confirmed my good fortune in previously encountering lots of bioluminescent plankton on several islands around the Maldives, including Olhahali, Kurumba and Hulhumale in North Male Atoll. However, I lived in that atoll for five years and frequently return for lengthy visits, unlike most travellers who come to the Maldives for an average just of eight days, which makes seeing this elusive phenomenon harder.

Arthur 证实我以前运气不错：我在马尔代夫好几个岛上都遇到过大量发光浮游生物，包括北马累环礁的 Olhahali，Kurumba 和 Hulhumale。不过我在那个环礁住了五年，之后也常回去长住；大多数游客来马尔代夫平均只待八天，想看到这种难得的现象就更难。

I asked Arthur if a traveller visiting the Maldives on a time crunch can do anything to increase their chances of seeing a sea of stars in the Maldives. She recommended visiting during the Southwrest Monsoon (which begins in April and runs until October) when the currents drive plankton from the south-west towards the north-east of the country and the largest amounts of plankton are found.

我问 Arthur，时间紧的游客有没有办法提高在马尔代夫看到星空海的机会。她建议在西南季风期（4 月开始，一直到 10 月）前往，这时洋流把浮游生物从该国西南部推向东北部，浮游生物的数量也最多。

Arthur also belleves you have a higher chance of seeing it underwater than on land.

Arthur 还认为，在水下看到的机会比在岸上大。

"You may see It If you're lucky while you're sitting on the beach with a nice glass of Champagne, but luck is the key word," said Arthur. The best way to see it is to get into the water when it's thick with plankton and go night snorkelling. It's one of the most exciting things you can do."

「运气好的话，你坐在沙滩上端着一杯香槟也可能看到，但关键词是运气，」 Arthur 说。「最好的办法是在浮游生物密集的时候下水，去夜间浮潜。这是你能做的最刺激的事之一。」

The best way to see it is to get into the water when it's thick with plankton and go night snorkelling. It's one of the most exciting things you can do

最好的办法是在浮游生物密集的时候下水，去夜间浮潜。这是你能做的最刺激的事之一。这一句是截图里的引语框，开头 MinerU 识别出的 44 是大引号图形，已删去。

Arthur has also observed bioluminescent plankton many times during the new Moon, when there is very little ambient light, and she recommends travellers take the following steps:

Arthur 还多次在新月期间看到发光浮游生物，那时环境光很少。她建议游客这样做：

"First, gather your group together in the water then turn off your waterproof torches. The minute you turn them off, it's very eerie, but just start moving your arms and legs like crazy." This will create movement in the water column."You're disturbing the plankton that will emit light - whether that's being disturbed by a predator or even a human swimming. As soon as you disturb them, you're floating amongst the stars."

「先把同伴在水里聚到一起，然后关掉防水手电。一关掉会觉得很瘆人，但接着就开始拼命挥动胳膊和腿。」 这样会搅动水体。「你在扰动那些会发光的浮游生物，不管扰动来自捕食者还是游泳的人。一扰动它们，你就像漂在星星中间。」

A few diving and water-sports centres, such as Maafuashi Dive & Watersports, can provide night snorkelling trips, on request, to help you search for bioluminescent plankton.

有几家潜水和水上运动中心，比如 Maafuashi Dive & Watersports，可以按需安排夜间浮潜，帮你寻找发光浮游生物。

![夜色中海面上一艘白色游艇，前景海水里散布着蓝色光点，天上有星和红色星云，右上角署名 Petr Horalek](images/p07-while-all-the-marine-biologists-i-spolke-to-agreed-with.png)

While all the marine biologists I spolke to agreed with Arthur, none could offer a biological explanation for why two Maldivian islands with similar soundling names have become famous as the place to see the "Sea of Stars". "It's impossibie for plankton to be attracted to any single island," said Arthur.

我采访的海洋生物学家都同意 Arthur 的看法，但没有人能从生物学上解释，为什么马尔代夫两个名字发音相近的岛成了看 「星空海」 的出名去处。「浮游生物不可能只被某一个岛吸引，」 Arthur 说。

Yet if you're one of the 320,000 people a month worldwide searching on Google for "Sea of Stars", you've probably found countless souroes urging you to go to Vaadhoo or Vadoo. Vaadhoo is an inhabited island in Raa Atoll with a population of 626, while Adaaran Prestige Vadoo is a private resort island, some 120 miles away in South Male' Atoll

可如果你是全球每月在 Google 上搜索 「Sea of Stars」 的 320,000 人之一，大概已经看到无数来源催你去 Vaadhoo 或 Vadoo. Vaadhoo 是 Raa 环礁上一个有人居住的岛，人口 626；Adaaran Prestige Vadoo 则是一个私人度假岛，在大约 120 英里外的南马累环礁。

![用户头像图标](images/p07-please-explain-in-detail-what-this-picture-is-about.png)

Please explain in detail what this picture is about.

请详细解释这张图讲的是什么。

![机器人头像图标，表示下面是 MiniCPM-V 2.0 的回答](images/p07-minicpm-v-2-0.png)

#### MiniCPM-V 2.0

The image appears to be a screenshot from a news article about the bioluminescence of the Sea of Stars on the Maldives. The article discusses the unique phenomenon where bioluminescent plankton illuminate the water at night, creating a mesmerizing light show. The author of the article, Sarah Harvey, provides a personal account of her experience witnessing this natural spectacle for the first time.

这张图看起来是一篇新闻报道的截图，讲的是马尔代夫星空海的生物发光。文章讨论了这一独特现象：发光浮游生物在夜里把海水照亮，形成迷人的光影。文章作者 Sarah Harvey 讲述了她第一次亲眼看到这一自然奇观的经历。

The article also touches on the scientific aspects of the phenomenon, explaining that it is caused by a chemical reaction between plankton and seawater, and it's one of the most beautiful attractions in the Maldives. The author notes that while there are no specific places to see this bioluminescence, it can be found in various locations around the Maldives.

文章也谈到这一现象的科学原理，解释说它由浮游生物与海水之间的化学反应引起，而且是马尔代夫最美的景点之一。作者指出，虽然没有特定的地点可以看到这种生物发光，但在马尔代夫各处都能找到。

The image includes a photo of the Sea of Stars, which is described as one of the highest-rated attractions in the Maldives. It's also mentioned that the bioluminescence of the Sea of Stars is similar to that of the Milky Way, which adds to its allure.

图里有一张星空海的照片，文中把它说成马尔代夫评分最高的景点之一。文中还提到星空海的生物发光和银河相似，这增添了它的吸引力。

The article concludes with a call to action, inviting readers to choose an island with minimal light pollution to fully experience the bioluminescence of the Sea of Stars. It also suggests visiting during the Southwest Monsoon season from April to June for the most exciting experiences.

文章结尾发出号召，请读者选一个光污染最少的岛，充分体验星空海的生物发光。文章还建议在 4 月到 6 月的西南季风季前往，以获得最精彩的体验。

Overall, the image is a promotional piece for the Sea of Stars, highlighting its natural beauty and the unique experience it offers to visitors.

总的来说，这张图是星空海的一篇宣传稿，突出它的自然之美和给游客的独特体验。

PDF 截图里这段回答有五处绿色高亮：关于马尔代夫星空海生物发光的新闻报道，发光浮游生物在夜里照亮海水，作者 Sarah Harvey，没有特定地点但在马尔代夫各处都能找到，请读者选光污染最少的岛。

\*The colored underlines are for illustration purposes only and are not used as model input.

\*彩色下划线只作示意，不作为模型输入。

> **核对：** 回答说西南季风季是 「April to June」，和截图原文对得上吗？
> 对不上。截图里两处都是 4 月到 10 月：提示框 「from April till October」，正文 「begins in April and runs until October」。这句在 PDF 里没有高亮，页面也没指出。同样没高亮的还有 「浮游生物与海水之间的化学反应」 和 「与银河相似」：原文说的是产生光的化学反应，银河在原文里没出现，最接近的是比喻 「like a swirling galaxcy」。作者名 Sarah Harvey 是对的，截图里有署名。

第三组：细节描述，同一张图对比 MiniCPM-V 2.0 和 GPT-4V。

![加油站照片：前景一辆白色皮卡，车门上有 TA 标志，后面白色大顶棚下停着几辆大卡车，左边有红色柱桩](images/p07-image-4.png)

![用户头像图标](images/p07-provide-an-intricate-description-of-the-image-capturing.png)

Provide an intricate description of the image, capturing its visual elements, including colors, shapes, textures, objects, and any people present.

请细致地描述这张图，写出它的视觉元素，包括颜色，形状，质感，物体以及画面中的人。

![用户头像图标，与上一张相同，版面上这一组只有提示词前一个用户头像，这张是 MinerU 重复切出的](images/p07-minicpm-v-2-0-2.png)

![机器人头像图标，表示下面是 MiniCPM-V 2.0 的回答](images/p07-image-3.png)

#### MiniCPM-V 2.0

The image captures a bustling scene at a gas station. Dominating the foreground is a white truck, its letters "TA" emblazoned on its side, parked under the shelter of a large, white canopy. The canopy, with its sleek lines, contrasts against the backdrop of the sky. Behind the truck, several large semi-trucks are parked, their metallic bodies gleaming under the clear sky. Among these, a red truck stands out, adding a splash of color to the scene. The ground is marked with yellow lines, guiding the flow of vehicles and ensuring safety. In the background, power lines stretch across the sky, a testament to the city's infrastructure. Trees dot the landscape, their green leaves adding a touch of nature to the urban setting. The entire scene is a harmonious blend of man-made structures and natural elements.

这张图是加油站的一个繁忙场景。前景最显眼的是一辆白色卡车，车身印着字母 「TA」，停在一个白色大顶棚下。顶棚线条利落，衬着天空。卡车后面停着几辆大型半挂车，金属车身在晴空下发亮。其中一辆红色卡车格外醒目，给画面添了一抹颜色。地面画着黄线，引导车流，保障安全。背景里电线横过天空，显出城市的基础设施。四周点缀着树木，绿叶给城市环境带来一点自然气息。整个画面是人造建筑和自然元素的和谐融合。

#### GPT-4V

This image features a busy fuel station during daylight. The sky is clear, hinting at a sunny day, and the natural light casts soft shadows on the ground. In the forefront, there's a white pickup truck with red and purple stripes and a logo on the door, parked at an angle. It has a utilitarian design with a cargo bed filled with assorted items, including what appears to be a red toolbox.

这张图是白天一个繁忙的加油站。天空晴朗，看来是个晴天，自然光在地面投下柔和的影子。最前面是一辆白色皮卡，车身有红色和紫色条纹，车门上有标志，斜着停放。它是实用型设计，货斗里装着各种东西，其中似乎有一个红色工具箱。

Behind the pickup, under a large, flat-roofed shelter, multiple large trucks are parked in a row. Each truck has a different color scheme; one is predominantly blue, another is red, and a third has a white cab pulling a trailer with red and blue stripes. The shelter's roof is supported by thin pillars, creating an open space that looks clean and functional. To the left, there are fuel pumps with bright red housings and white tops, contrasting with the duller colors of the concrete ground. Various safety and direction signs are visible, such as a 'No Smoking' sign and arrows for traffic flow. There's an absence of people in the scene, which, combined with the stationary vehicles, gives the image a static feel. The overall appearance is one of an ordinary, mundane moment in a commercial or industrial area, captured in a photograph.

皮卡后面，一个平顶大棚下，几辆大卡车排成一排。每辆配色不同：一辆以蓝色为主，一辆是红色，第三辆是白色车头，拖着一节带红蓝条纹的挂车。棚顶由细柱撑着，形成一个开阔的空间，看上去干净实用。左边是加油机，机身亮红色，顶部白色，和水泥地面暗淡的颜色形成对比。能看到各种安全和指示标志，比如 「禁止吸烟」 标志和指示车流的箭头。画面里没有人，加上停着不动的车，让图像显得很静。整体看，这是商业区或工业区里一个普通，平常的时刻，被拍了下来。

> **拆开：** 第三组回答里的红字标的是什么？
> 页面没有图例，这一组也没有脚注。从 PDF 渲染图数，MiniCPM-V 2.0 的回答有 2 处红字（「parked under the shelter of a large, white canopy」 和 「a red truck」），GPT-4V 有 7 处（红紫条纹，红色工具箱，另一辆是红色，白车头拖红蓝条纹挂车，红色加油机，禁止吸烟标志和箭头，画面中没有人）。页面没说红字是错误还是细节，2 对 7 不能当作幻觉率读。

We deploy MiniCPM-V 2.0 on end devices. The demo video is the raw screen recording on a Xiaomi 14 Pro without edition.

我们把 MiniCPM-V 2.0 部署在端侧设备上。演示视频是在小米 14 Pro 上直接录屏，未经剪辑。

<!-- page 8 of 12 -->

![演示视频的两帧手机录屏：标题栏 Demo: MiniCPM-V 2.0，左图提示 Image 7 process is done，ask any question，输入图是车站里的 「菲玛 艺术涂料」 广告牌；右图提示 Image 9 process is done，输入图是街头的红色双层巴士和黑色出租车](images/p08-demo.png)

## Demo（演示）

Click here to try out the Demo of [MiniCPM-V 2.0](https://huggingface.co/spaces/openbmb/MiniCPM-V-2).

点这里试用 MiniCPM-V 2.0 的在线演示。

### Deployment on Mobile Phone（在手机上部署）

标题前 MinerU 识别出的 $\mathcal { Q }$ 是折叠块的图标，PDF 文字层没有这个符号。

MiniCPM-V 2.0 can be deployed on mobile phones with Android and Harmony operating systems. 🚀 Try it out [here](https://github.com/OpenBMB/mlc-MiniCPM).

MiniCPM-V 2.0 可以部署在 Android 和鸿蒙系统的手机上，点链接试用。句中的 🚀 被 MinerU 识别成了 $\mathcal { A } ^ { \flat }$，这里按 PDF 文字层还原。

### Inference with vLLM（用 vLLM 推理）

标题前同样有一个被识别成 $\mathcal { Q }$ 的折叠图标。

<!-- page 9 of 12 -->

▶ Click to see how to inference with vLLM

点击展开查看如何用 vLLM 推理。这是一个折叠块，PDF 里没有展开，内容不在这 12 页里。

### Usage（用法）

Inference using Huggingface transformers on Nivdia GPUs or Mac with MPS (Apple silicon or AMD GPUs). Requirements tested on python 3.10:

用 Huggingface transformers 在 Nvidia GPU 或支持 MPS 的 Mac（Apple 芯片或 AMD GPU）上推理。下面的依赖版本在 Python 3.10 上验证过。原文 Nivdia 是拼写错误。

```txt
Pillow==10.1.0
timm==0.9.10
torch==2.1.2
torchvision==0.16.2
transformers==4.36.0
sentencepiece==0.1.99
```

```python
# test.py
import torch
from PIL import Image
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained('openbmb/MiniCPM-V-2', trust_remote_c
# For Nvidia GPUs support BF16 (like A100, H100, RTX3090)
model = model.to(device='cuda', dtype=torch.bfloat16)
# For Nvidia GPUs do NOT support BF16 (like V100, T4, RTX2080)
#model = model.to(device='cuda', dtype=torch.float16)
# For Mac with MPS (Apple silicon or AMD GPUs).
# Run with `PYTORCH_ENABLE_MPS_FALLBACK=1 python test.py`
#model = model.to(device='mps', dtype=torch.float16)

tokenizer = AutoTokenizer.from_pretrained('openbmb/MiniCPM-V-2', trust_
model.eval()

image = Image.open('xx.jpg').convert('RGB')
question = 'What is in the image?'
msgs = [{'role': 'user', 'content': question}]

res, context, _ = model.chat(
    image=image,
    msgs=msgs,
    context=None,
    tokenizer=tokenizer,
    sampling=True,
    temperature=0.7
)
print(res)
```

代码注释的意思：支持 BF16 的 Nvidia GPU（如 A100, H100, RTX3090）用 bfloat16；不支持 BF16 的（如 V100, T4, RTX2080）改用 float16；Mac 用 MPS 时以 float16 加载，并用 PYTORCH_ENABLE_MPS_FALLBACK=1 启动。之后读图，组一条用户消息，调用 model.chat，采样温度 0.7。代码从 model.chat( 之后跨到第 10 页，这里合成一段。

> **确认：** MinerU 版本里的 msgs=news 和 'content': question'] 能跑吗？
> 这两处是 MinerU 的识别错误，PDF 文字层是 msgs=msgs 和 'content': question}]，上面的代码按 PDF 录入。另有两处是网页本身截断：from_pretrained 的参数只露出 trust_remote_c 和 trust_，后半截页面上看不到（推测是 trust_remote_code=True），照原样保留，直接复制会报语法错误。

<!-- page 10 of 12 -->

Please look at [GitHub](https://github.com/OpenBMB/MiniCPM-V) for more detail about usage.

更多用法见 GitHub。

## MiniCPM-V 1.0

Please see the info about MiniCPM-V 1.0 [here](https://huggingface.co/openbmb/MiniCPM-V).

MiniCPM-V 1.0 的信息见链接。

## License（许可证）

### Model License（模型许可）

The code in this repo is released under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE) License.

本仓库的代码以 Apache-2.0 许可证发布。

The usage of MiniCPM-V series model weights must strictly follow [MiniCPM Model License.md](https://github.com/OpenBMB/MiniCPM/blob/main/MiniCPM%20Model%20License.md).

MiniCPM-V 系列模型权重的使用必须严格遵守 MiniCPM Model License.md。

The models and weights of MiniCPM are completely free for academic research. after filling out a ["questionnaire"](https://modelbest.feishu.cn/share/base/form/shrcnpV5ZT9EJ6xYjh3Kx0J6v8g) for registration, are also available for free commercial use.

MiniCPM 的模型和权重对学术研究完全免费；填写 「问卷」 登记后，也可以免费商用。

### Statement（声明）

As a LLM, MiniCPM-V 2.0 generates contents by learning a large mount of texts, but it cannot comprehend, express personal opinions or make value judgement. Anything generated by MiniCPM-V 2.0 does not represent the views and positions of the model developers

作为大语言模型，MiniCPM-V 2.0 通过学习大量文本来生成内容，但它不能理解，不能表达个人观点，也不能做价值判断。MiniCPM-V 2.0 生成的任何内容都不代表模型开发者的观点和立场。

We will not be liable for any problems arising from the use of the MinCPM-V open Source model, including but not limited to data security issues, risk of public opinion, or any risks and problems arising from the misdirection, misuse, dissemination or misuse of the model.

对使用 MiniCPM-V 开源模型产生的任何问题，我们不承担责任，包括但不限于数据安全问题，舆论风险，以及模型被误导，误用，传播或滥用带来的任何风险和问题。原文 MinCPM-V 是拼写错误；这句在 「risk of public」 之后跨到第 11 页，这里接回。

<!-- page 11 of 12 -->

### Other Multimodal Projects from Our Team（团队的其他多模态项目）

VisCPM | RLHF-V | LLaVA-UHD

## Citation（引用）

If you find our work helpful, please consider citing the following papers

如果我们的工作对你有帮助，请考虑引用下面的论文。

```bib
@article{yu2023rlhf,
  title={Rlhf-v: Towards trustworthy mllms via behavior alignment from 
  author={Yu, Tianyu and Yao, Yuan and Zhang, Haoye and He, Taiwen and 
  journal={arXiv preprint arXiv:2312.00849},
  year={2023}
}
@article{viscpm,
    title={Large Multilingual Models Pivot Zero-Shot Multimodal Learnin
    author={Jinyi Hu and Yuan Yao and Chongyi Wang and Shan Wang and Yi
    journal={arXiv preprint arXiv:2308.12038},
    year={2023}
}
@article{xu2024llava-uhd,
  title={{LLaVA-UHD}: an LMM Perceiving Any Aspect Ratio and High-Resol
  author={Xu, Ruyi and Yao, Yuan and Guo, Zonghao and Cui, Junbo and Ni
  journal={arXiv preprint arXiv:2403.11703},
  year={2024}
}
@article{yao2024minicpmvgpt4vlevelmllm,
  title={MiniCPM-V: A GPT-4V Level MLLM on Your Phone},
  author={Yao, Yuan and Yu, Tianyu and Zhang, Ao and Wang, Chongyi and 
  journal={arXiv preprint arXiv:2408.01800},
  year={2024},
  url={https://arxiv.org/abs/2408.01800},
}
```

四条 BibTeX，依次对应 RLHF-V，VisCPM，LLaVA-UHD 和 MiniCPM-V 论文。每条的 title 和 author 行在网页右边被截断；MinerU 在截断处多识别出 「Y:」 「N:」 这类残字，上面按 PDF 文字层录入。最后一条的 url 行和收尾的右括号印在第 12 页页首，这里并回同一个代码块。

<!-- page 12 of 12 -->

![系统主题切换按钮的显示器图标](images/p12-system-theme.png)

## System theme（系统主题）

## Company（公司）

[TOS](https://huggingface.co/terms-of-service) · [Privacy](https://huggingface.co/privacy) · [About](https://huggingface.co/huggingface) · [Careers](https://apply.workable.com/huggingface/)

服务条款，隐私，关于，招聘。

## Website（网站）

[Models](https://huggingface.co/models) · [Datasets](https://huggingface.co/datasets) · [Spaces](https://huggingface.co/spaces) · [Pricing](https://huggingface.co/pricing) · [Docs](https://huggingface.co/docs)

模型，数据集，Space，定价，文档。这是 Hugging Face 网站的页脚。

![页脚的 Hugging Face 笑脸标志](images/p12-image.png)
