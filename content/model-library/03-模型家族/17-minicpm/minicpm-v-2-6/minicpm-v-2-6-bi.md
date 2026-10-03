---
title: "MiniCPM-V 2.6 · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM-V 2.6 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 14 -->

S

页面左上角的搜索图标, 被识别成了字母 S.

Search models, datasets, users...

搜索模型, 数据集, 用户...

## [openbmb](https://huggingface.co/openbmb)/[MiniCPM-V-2\_6](https://huggingface.co/openbmb/MiniCPM-V-2_6)

Like 1.06k. Follow OpenBMB 5.36k.

点赞 1.06k. 关注 OpenBMB, 关注者 5.36k.

[Image-Text-to-Text](https://huggingface.co/models?pipeline_tag=image-text-to-text)

任务类型: 图文生成文本.

![Hugging Face 笑脸标志, 位于 Transformers 标签前](images/p01-transformers-https-huggingface-co-models-library.png)

[Transformers](https://huggingface.co/models?library=transformers) · [Safetensors](https://huggingface.co/models?library=safetensors) · openbmb/RLAIF-V-Dataset · [multilingual](https://huggingface.co/models?language=multilingual) · [minicpmv](https://huggingface.co/models?other=minicpmv) · [feature-extraction](https://huggingface.co/models?other=feature-extraction) · [minicpm-v](https://huggingface.co/models?other=minicpm-v) · [vision](https://huggingface.co/models?other=vision) · [multi-image](https://huggingface.co/models?other=multi-image) · [ocr](https://huggingface.co/models?other=ocr) · [video](https://huggingface.co/models?other=video) · [custom\_code](https://huggingface.co/models?other=custom_code) · [conversational](https://huggingface.co/models?other=conversational) · arxiv:2408.01800

标签: Transformers, Safetensors, 数据集 openbmb/RLAIF-V-Dataset, 多语言, minicpmv, 特征提取, minicpm-v, 视觉, 多图, OCR, 视频, 自定义代码, 对话, 关联论文 arXiv 2408.01800.

Deploy · Copy to bucket **NEW** · Use this model

页面按钮: 部署, 复制到存储桶 (标了 **NEW**), 使用此模型.

[**Model card**](https://huggingface.co/openbmb/MiniCPM-V-2_6) · [Files](https://huggingface.co/openbmb/MiniCPM-V-2_6/tree/main) · [**xet**](https://huggingface.co/openbmb/MiniCPM-V-2_6/tree/main)

标签页: 模型卡, 文件, xet 存储标记.

![社区标签页的挥手图标](images/p01-community.png)

Community

社区.

![社区标签页旁的深色角标, 数字 58](images/p01-downloads-last-month.png)

这张角标图的文件名叫 downloads-last-month, 图里其实只有数字 58, 位置紧跟 Community, 是社区讨论数, 不是下载量.

Downloads last month

31,228

上月下载 31,228 次.

![上月下载量的紫色迷你折线图, 末端陡降](images/p01-safetensors.png)

这张折线图的文件名取自下一行标题 Safetensors, 图里画的是下载量走势.

## Safetensors

Model size: 8B params. Tensor type: BF16. <u>Chat template</u>. <u>Files info</u>.

模型大小: 8B 参数. 张量类型: BF16. 另有对话模板和文件信息两个入口.

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers) / 推理服务商

[Image-Text-to-Text](https://huggingface.co/tasks/image-text-to-text)

This model isn't deployed by any Inference Provider.

任务类型为图文生成文本. 目前没有任何推理服务商部署这个模型.

![举手的人物图标](images/p01-4-ask-for-provider-support.png)

4 Ask for provider support

请求服务商支持, 按钮旁的计数为 4.

## Model tree for openbmb/MiniCPM-V-2\_6 / 模型树

**Adapters** [24 models](https://huggingface.co/models?other=base_model:adapter:openbmb/MiniCPM-V-2_6) · **Finetunes** [14 models](https://huggingface.co/models?other=base_model:finetune:openbmb/MiniCPM-V-2_6) · **Quantizations** [14 models](https://huggingface.co/models?other=base_model:quantized:openbmb/MiniCPM-V-2_6)

以本模型为基座的衍生模型: 适配器 24 个, 微调版 14 个, 量化版 14 个.

## Dataset used to train openbmb/MiniCPM-V-2\_6 / 训练用数据集

[**openbmb/RLAIF-V-Dataset**](https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset): [Viewer • Updated Oct 14, 2025 • 83.1k • 1.87k • 219](https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset)

openbmb/RLAIF-V-Dataset: 可在线查看, 2025 年 10 月 14 日更新, 规模 83.1k, 下载 1.87k, 点赞 219.

> **想:** 侧栏 「Dataset used to train」 只挂了 openbmb/RLAIF-V-Dataset 一个, 这是不是说整个 8B 模型只用这份 83.1k 的数据训练?
> 不能这么读. 第 3 页写可信行为 「Based on the the latest RLAIF-V and VisCPM techniques」, RLAIF-V 对应的是降幻觉这一步; SigLip-400M 和 Qwen2-7B 各自的预训练数据, 以及多模态阶段用了什么数据, 这一页一个字都没写.

<!-- page 2 of 14 -->

```txt
MiniCPM-o & MiniCPM-V Collection
Multimodal models with leading perform... • 32 items • Updated 10 days ago • △ 86
```

合集 「MiniCPM-o & MiniCPM-V Collection」: 性能领先的多模态模型 (简介被截断), 共 32 项, 10 天前更新, 点赞 86.

```txt
MiniCPM-V: A GPT-4V Level MLLM on Your Phone
Paper • 2408.01800 • Published Aug 3, 2024 • △ 95
```

论文 「MiniCPM-V: A GPT-4V Level MLLM on Your Phone」 (MiniCPM-V: 手机上的 GPT-4V 级多模态大模型), arXiv 2408.01800, 2024 年 8 月 3 日发布, 点赞 95.

```txt
Paper for openbmb/MiniCPM-V-2_6
```

本模型的关联论文, 即上面这一篇.

## Spaces using openbmb/MiniCPM-V-2\_6 45 / 使用本模型的 Space 共 45 个

```txt
KwabsHug/GameConfigIdea
```

```txt
build-small-hackathon/ai-video-generation
```

页面只展开了两个: KwabsHug/GameConfigIdea 和 build-small-hackathon/ai-video-generation.

## Collections including openbmb/MiniCPM-V-2\_6 / 收录本模型的合集

```txt
MiniCPM Collection The MiniCPM family of LLMs and VLLMs. • 33 items • Updated 10 days ago • △ 78
```

标题前原有一个合集图标, 被识别成了 「品」 字, 这里删去. 合集 「MiniCPM Collection」: MiniCPM 家族的大语言模型和视觉语言模型, 共 33 项, 10 天前更新, 点赞 78.

## You need to agree to share your contact information to access this model / 访问本模型需要同意共享联系信息

This repository is publicly accessible, but **you have to accept the conditions to access its files and content**.

这个仓库是公开可见的, 但**你必须接受条件才能访问其中的文件和内容**.

[Log in](https://huggingface.co/login?next=/openbmb/MiniCPM-V-2_6) to review the conditions and access this model content.

登录后查看条件并访问模型内容.

## A GPT-4V Level MLLM for Single Image, Multi Image and Video on Your Phone / 手机上的 GPT-4V 级多模态大模型, 支持单图, 多图和视频

[GitHub](https://github.com/OpenBMB/MiniCPM-V) | [Demo](http://120.92.209.146:8887/)

GitHub 仓库 | 在线演示.

<!-- page 3 of 14 -->

## News / 新闻

[2025.01.14] 🔥 We open source [**MiniCPM-o 2.6**](https://huggingface.co/openbmb/MiniCPM-o-2_6), with significant performance improvement over **MiniCPM-V 2.6**, and support real-time speech-to-speech conversation and multimodal live streaming. Try it now.

[2025.01.14] 我们开源了 **MiniCPM-o 2.6**, 性能比 **MiniCPM-V 2.6** 明显提升, 并支持实时的语音到语音对话和多模态直播流. 欢迎试用.

> **问:** 新闻说 MiniCPM-o 2.6 比 MiniCPM-V 2.6 有 「significant performance improvement」, 这一页能拿到 o 2.6 的分数或规模做对比吗?
> 拿不到. o 2.6 在本页只出现在这条新闻和第 2 页的合集名里, 评测表, 雷达图和部署说明全部只写 V 2.6. 两者是不同仓库 (MiniCPM-o-2\_6 和 MiniCPM-V-2\_6), 本稿所有数字只属于 V 2.6, 「明显提升」 在这页没有数字支撑.

## MiniCPM-V 2.6

**MiniCPM-V 2.6** is the latest and most capable model in the MiniCPM-V series. The model is built on SigLip-400M and Qwen2-7B with a total of 8B parameters. It exhibits a significant performance improvement over MiniCPM-Llama3-V 2.5, and introduces new features for multi-image and video understanding. Notable features of MiniCPM-V 2.6 include:

**MiniCPM-V 2.6** 是 MiniCPM-V 系列里最新, 能力最强的模型. 它基于 SigLip-400M 和 Qwen2-7B 搭建, 总参数 8B. 相比 MiniCPM-Llama3-V 2.5 性能明显提升, 并新增多图理解和视频理解. 它的主要特点如下:

> **核对:** SigLip-400M 加 Qwen2-7B, 页面说 「a total of 8B parameters」, 名义值相加对得上吗?
> 0.4B + 7B = 7.4B, 与 8B 差 0.6B. 400M 和 7B 都是档位名, 本身取过整; 视觉特征接进语言模型还要一层连接模块, 页面没写它的规模. 侧栏 「Model size 8B params」 也是取整显示, 页面没给精确参数量, 这 0.6B 拆不开.

🔥 **Leading Performance.** MiniCPM-V 2.6 achieves an average score of 65.2 on the latest version of OpenCompass, a comprehensive evaluation over 8 popular benchmarks. **With only 8B parameters, it surpasses widely used proprietary models like GPT-4o mini, GPT-4V, Gemini 1.5 Pro, and Claude 3.5 Sonnet** for single image understanding.

**领先性能.** MiniCPM-V 2.6 在最新版 OpenCompass 上拿到 65.2 的平均分, OpenCompass 是覆盖 8 个常用基准的综合评测. **只用 8B 参数, 它在单图理解上超过了 GPT-4o mini, GPT-4V, Gemini 1.5 Pro 和 Claude 3.5 Sonnet 这些广泛使用的闭源模型**.

> **看表:** 这里说 8B 参数在单图理解上 「surpasses」 Claude 3.5 Sonnet, 第 5 页的表格同意吗?
> 不同意. OpenCompass 一列 Claude 3.5 Sonnet 是 67.9, MiniCPM-V 2.6 是 65.2, 低 2.7 分; 逐列比, MiniCPM-V 2.6 赢 MME, OCRBench, AI2D, Object HalBench 四项, 输 MMVet, MMMU, MathVista, MMB, DocVQA, HallusionBench 六项, TextVQA 无对照. GPT-4o mini (64.1), GPT-4V (63.5), Gemini 1.5 Pro (64.4) 的 OpenCompass 确实都低于 65.2.

🖼️ **Multi Image Understanding and In-context Learning.** MiniCPM-V 2.6 can also perform **conversation and reasoning over multiple images**. It achieves **state-of-the-art performance** on popular multi-image benchmarks such as Mantis-Eval, BLINK, Mathverse mv and Sciverse mv, and also shows promising in-context learning capability.

**多图理解与上下文学习.** MiniCPM-V 2.6 还能**在多张图之间对话和推理**. 它在 Mantis-Eval, BLINK, Mathverse mv 和 Sciverse mv 等常用多图基准上达到 **SOTA 水平**, 也显示出不错的上下文学习能力.

🎬 **Video Understanding.** MiniCPM-V 2.6 can also **accept video inputs**, performing conversation and providing dense captions for spatial-temporal information. It outperforms **GPT-4V, Claude 3.5 Sonnet and LLaVA-NeXT-Video-34B** on Video-MME with/without subtitles.

**视频理解.** MiniCPM-V 2.6 还能**接受视频输入**, 可以围绕视频对话, 并为时空信息生成密集描述. 在 Video-MME 上, 无论带不带字幕, 它都超过 **GPT-4V, Claude 3.5 Sonnet 和 LLaVA-NeXT-Video-34B**.

💪 **Strong OCR Capability and Others.** MiniCPM-V 2.6 can process images with any aspect ratio and up to 1.8 million pixels (e.g., 1344x1344). It achieves **state-of-the-art performance on OCRBench, surpassing proprietary models such as GPT-4o, GPT-4V, and Gemini 1.5 Pro**. Based on the the latest [RLAIF-V](https://github.com/RLHF-V/RLAIF-V/) and [VisCPM](https://github.com/OpenBMB/VisCPM) techniques, it features **trustworthy behaviors**, with significantly lower hallucination rates than GPT-4o and GPT-4V on Object HalBench, and supports **multilingual capabilities** on English, Chinese, German, French, Italian, Korean, etc.

**较强的 OCR 能力及其他.** MiniCPM-V 2.6 能处理任意长宽比, 最高 180 万像素 (例如 1344x1344) 的图像. 它在 **OCRBench 上达到 SOTA, 超过 GPT-4o, GPT-4V 和 Gemini 1.5 Pro 等闭源模型**. 借助最新的 RLAIF-V 和 VisCPM 技术, 它表现出**可信的行为**: 在 Object HalBench 上的幻觉率明显低于 GPT-4o 和 GPT-4V; 同时具备英语, 中文, 德语, 法语, 意大利语, 韩语等**多语言能力**.

<!-- page 4 of 14 -->

**Superior Efficiency.** In addition to its friendly size, MiniCPM-V 2.6 also shows **state-of-the-art token density** (i.e., number of pixels encoded into each visual token). **It produces only 640 tokens when processing a 1.8M pixel image, which is 75% fewer than most models**. This directly improves the inference speed, firsttoken latency, memory usage, and power consumption. As a result, MiniCPM-V 2.6 can efficiently support **real-time video understanding** on end-side devices such as iPad.

**高效率.** 除了体量友好, MiniCPM-V 2.6 还有 **SOTA 的 token 密度** (即每个视觉 token 编码的像素数). **处理一张 180 万像素的图像只产生 640 个 token, 比多数模型少 75%**. 这直接改善推理速度, 首 token 延迟, 显存占用和功耗. 因此 MiniCPM-V 2.6 能在 iPad 这类端侧设备上高效支持**实时视频理解**.

> **拆开:** 「640 tokens when processing a 1.8M pixel image」 和表里的 Token Density 2822 是同一回事吗? 「75% fewer」 又是跟谁比?
> 1344 × 1344 = 1,806,336 像素, 除以 640 得 2822.4, 正是表里的 2822, 所以 「1.8M」 指的就是 1344x1344. 少 75% 意味着对方约要 2560 个 token; 按表中密度倒推同样像素, InternVL2-8B (706) 约 2559 个, Claude 3.5 Sonnet (750) 约 2408 个, GPT-4o 与 GPT-4V (1088) 约 1660 个, MiniCPM-Llama-V 2.5 (1882) 约 960 个, 只有 706 这一档正好是 75%, 「most models」 指哪些模型页面没说.

💫 **Easy Usage.** MiniCPM-V 2.6 can be easily used in various ways: (1) [llama.cpp](https://github.com/OpenBMB/llama.cpp/blob/minicpmv-main/examples/llava/README-minicpmv2.6.md) and [ollama](https://github.com/OpenBMB/ollama/tree/minicpm-v2.6) support for efficient CPU inference on local devices, (2) [int4](https://huggingface.co/openbmb/MiniCPM-V-2_6-int4) and [GGUF](https://huggingface.co/openbmb/MiniCPM-V-2_6-gguf) format quantized models in 16 sizes, (3) [vLLM](https://github.com/OpenBMB/MiniCPM-V/tree/main?tab=readme-ov-file#inference-with-vllm) support for high-throughput and memory-efficient inference, (4) fine-tuning on new domains and tasks, (5) quick local WebUI demo setup with [Gradio](https://github.com/OpenBMB/MiniCPM-V/tree/main?tab=readme-ov-file#chat-with-our-demo-on-gradio) and (6) online web [demo](http://120.92.209.146:8887/).

**易用.** MiniCPM-V 2.6 有多种用法: (1) llama.cpp 和 ollama 支持在本地设备上做高效的 CPU 推理; (2) 提供 int4 和 GGUF 格式的量化模型, 共 16 种尺寸; (3) vLLM 支持高吞吐, 省显存的推理; (4) 可在新领域和新任务上微调; (5) 用 Gradio 快速搭建本地 WebUI 演示; (6) 在线网页演示.

> **确认:** 这里说 int4 和 GGUF 「quantized models in 16 sizes」, 第 1 页模型树又写 Quantizations 14 models, 是不是数漏了两个?
> 不是同一个数. 按字面, 16 是官方 int4 和 GGUF 两个仓库合起来提供的量化尺寸数; 14 是 Hugging Face 按 base\_model 统计的量化衍生仓库数, 社区上传的也算在内. 页面没有列出 16 种尺寸各是什么, 两边无法一一对应.

## Evaluation / 评测

![单图评测雷达图, 16 条轴, 对比 GPT-4V-20240409, Gemini 1.5 Pro, Cambrian-34B, InternVL2-8B 和 MiniCPM-V 2.6 8B](images/p04-single-image-results-on-opencompass-mme-mmvet-ocrbench.png)

雷达图的 16 条轴依次为 HallusionBench, AI2D, OCRBench, DocVQA, OpenCompass, MMVet, TextVQA, ChartQA, Object HalBench, Mantis, Video-MME, BLINK, MME, MMB-1.1, MMMU, MathVista, 中心标 N/A. 每条轴上印三圈刻度, 外圈是该轴最大值, 例如 OCRBench 852.0, OpenCompass 65.2, MME 2348.4, Object HalBench 91.8. 紫色的 MiniCPM-V 2.6 8B 在多数轴上处于最外圈.

> **回看:** 雷达图外圈数字和第 5, 6 页的表逐轴对得上吗?
> 大部分对得上: OpenCompass 65.2, MME 2348.4, OCRBench 852.0, TextVQA 80.1, Mantis 69.1, MMVet 67.5 (GPT-4V), DocVQA 91.6 (InternVL2-8B). 三处要小心: BLINK 外圈写 53.0, 表里 MiniCPM-V 2.6 是 54.1, GPT-4V 是 54.6; Object HalBench 外圈 91.8 等于 100 - 8.2, 是把 「越低越好」 翻成了 「越高越好」; Video-MME 的 81.3 和 ChartQA 的 83.3 在本页任何表里都找不到.

Single image results on OpenCompass, MME, MMVet, OCRBench, MMMU, MathVista, MMB, AI2D, TextVQA, DocVQA, HallusionBench, Object HalBench:

单图结果, 覆盖 OpenCompass, MME, MMVet, OCRBench, MMMU, MathVista, MMB, AI2D, TextVQA, DocVQA, HallusionBench, Object HalBench:

<!-- page 5 of 14 -->

| Model | Size | Token Density+ | OpenCompass | MME | MMVet | OCRBench | MMMU val | MathVista mini | MMB1.1 test | AI2D | TextVQA val | DocVQA test | HallusionBench | Object HalBench |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Proprietary** | | | | | | | | | | | | | | |
| GPT-4o | - | 1088 | 69.9 | 2328.7 | 69.1 | 736 | 69.2 | 61.3 | 82.2 | 84.6 | - | 92.8 | 55.0 | 17.6 |
| Claude 3.5 Sonnet | - | 750 | 67.9 | 1920.0 | 66.0 | 788 | 65.9 | 61.6 | 78.5 | 80.2 | - | 95.2 | 49.9 | 13.8 |
| Gemini 1.5 Pro | - | - | 64.4 | 2110.6 | 64.0 | 754 | 60.6 | 57.7 | 73.9 | 79.1 | 73.5 | 86.5 | 45.6 | - |
| GPT-4o mini | - | 1088 | 64.1 | 2003.4 | 66.9 | 785 | 60.0 | 52.4 | 76.0 | 77.8 | - | - | 46.1 | 12.4 |
| GPT-4V | - | 1088 | 63.5 | 2070.2 | 67.5 | 656 | 61.7 | 54.7 | 79.8 | 78.6 | 78.0 | 87.2 | 43.9 | 14.2 |
| Step-1V | - | - | 59.5 | 2206.4 | 63.3 | 625 | 49.9 | 44.8 | 78.0 | 79.2 | 71.6 | - | 48.4 | - |
| Qwen-VL-Max | - | 784 | 58.3 | 2281.7 | 61.8 | 684 | 52.0 | 43.4 | 74.6 | 75.7 | 79.5 | 93.1 | 41.2 | 13.4 |
| **Open-source** | | | | | | | | | | | | | | |
| LLaVA-NeXT-Yi-34B | 34B | 157 | 55.0 | 2006.5 | 50.7 | 574 | 48.8 | 40.4 | 77.8 | 78.9 | 69.3 | - | 34.8 | 12.6 |
| Mini-Gemini-HD-34B | 34B | 157 | - | 2141 | 59.3 | 518 | 48.0 | 43.3 | - | 80.5 | 74.1 | 78.9 | - | - |
| Cambrian-34B | 34B | 1820 | 58.3 | 2049.9 | 53.2 | 591 | 50.4 | 50.3 | 77.8 | 79.5 | 76.7 | 75.5 | 41.6 | 14.7 |
| GLM-4V-9B | 13B | 784 | 59.1 | 2018.8 | 58.0 | 776 | 46.9 | 51.1 | 67.9 | 71.2 | - | - | 45.0 | - |
| InternVL2-8B | 8B | 706 | 64.1 | 2215.1 | 54.3 | 794 | 51.2 | 58.3 | 79.4 | 83.6 | 77.4 | 91.6 | 45.0 | 21.3 |
| MiniCPM-Llama-V 2.5 | 8B | 1882 | 58.8 | 2024.6 | 52.8 | 725 | 45.8 | 54.3 | 72.0 | 78.4 | 76.6 | 84.8 | 42.4 | 10.3 |
| MiniCPM-V 2.6 | 8B | 2822 | 65.2 | 2348.4* | 60.0 | 852* | 49.8* | 60.6 | 78.0 | 82.1 | 80.1 | 90.8 | 48.1* | 8.2 |

单图结果表. Size 为参数规模, Token Density+ 为 token 密度 (见下方注释), Proprietary 为闭源组, Open-source 为开源组, 「-」 表示没有数据, 带 * 的分数见下一行说明.

> **停一下:** 开源组里 GLM-4V-9B 的 Size 一栏写 13B, 名字里却是 9B, 哪个对?
> 页面只印了这两个数, 没有解释. 9B 是模型名的一部分, 13B 是表格作者填的规模, 差 4B; 以这页为准只能说 「表里记作 13B」, 把它当成和 8B 的 MiniCPM-V 2.6 同档的对手要谨慎.

We evaluate this benchmark using chain-of-thought prompting.

我们在这项基准上使用 CoT 提示评测. 打印稿这一行前面的星号丢了, 按位置对应表中带 * 的分数.

\+ Token Density: number of pixels encoded into each visual token at maximum resolution, i.e., # pixels at maximum resolution / # visual tokens.

\+ Token 密度: 最大分辨率下每个视觉 token 编码的像素数, 即最大分辨率的像素数除以视觉 token 数.

Note: For proprietary models, we calculate token density based on the image encoding charging strategy defined in the official API documentation, which provides an upperbound estimation.

注: 闭源模型的 token 密度按官方 API 文档里的图像编码计费规则计算, 给出的是上界估计.

> **再看:** Token Density 一列 MiniCPM-V 2.6 是 2822, GPT-4o 是 1088, 能说它的密度是 GPT-4o 的 2.6 倍吗?
> 口径不同. 注里说闭源模型的密度是按 API 计费规则倒算的 「upperbound estimation」, 开源模型是按最大分辨率除以实际视觉 token 数. 2822 / 1088 ≈ 2.59 只能当量级参考; 各模型的最大分辨率也不一样, 密度高不等于同一张图看得更清楚.

> **对一下:** HallusionBench 一列 MiniCPM-V 2.6 是 48.1, Object HalBench 一列是 8.2, 一高一低, 它在幻觉上到底算好还是差?
> 两列方向相反. 正文把 Object HalBench 叫 「hallucination rates」, 越低越好, 8.2 是全表最低; 雷达图把它翻成 100 - 8.2, 却没翻 HallusionBench, 说明作者把 HallusionBench 当越高越好: 48.1 低于 GPT-4o 的 55.0 和 Claude 3.5 Sonnet 的 49.9, 高于 GPT-4V 的 43.9. 表头本身没标方向.

> **想:** 正文写 MiniCPM-Llama3-V 2.5, 表里写 MiniCPM-Llama-V 2.5, 是两个模型吗?
> 按上下文是同一个前代, 表里少了 「3」. 表中它的 Token Density 1882, OpenCompass 58.8; V 2.6 分别是 2822 和 65.2, 密度多 49.9%, OpenCompass 高 6.4 分. 这是本页唯一给出前代分数的地方, 前代的规模这页只印了 Size 8B.

Multi-image results on Mantis Eval, BLINK Val, Mathverse mv, Sciverse mv, MIRB:

多图结果, 覆盖 Mantis Eval, BLINK Val, Mathverse mv, Sciverse mv, MIRB:

| Model | Size | Mantis Eval | BLINK val | Mathverse mv | Sciverse mv | MIRB |
| --- | --- | --- | --- | --- | --- | --- |
| **Proprietary** | | | | | | |
| GPT-4V | - | 62.7 | 54.6 | 63.0 | 66.9 | 53.1 |
| LLaVA-NeXT-Interleave-14B | 14B | 66.4 | 54.4 | 32.7 | 30.2 | - |
| **Open-source** | | | | | | |
| Emu2-Chat | 37B | 37.8 | 36.2 | - | 27.2 | - |
| CogVLM | 17B | 45.2 | 41.1 | - | - | - |
| VPG-C | 7B | 52.4 | 43.1 | 24.3 | 23.1 | - |
| VILA 8B | 8B | 51.2 | 39.3 | - | 36.5 | - |
| InternLM-XComposer-2.5 | 8B | 53.1 | 48.9 | 32.1* | - | 42.5 |
| InternVL2-8B | 8B | 59.0* | 50.9 | 30.5* | 34.4* | 56.9* |
| MiniCPM-V 2.6 | 8B | 69.1 | 54.1 | 84.9 | 74.9 | 53.8 |

多图结果表. 分组和符号同上表, 但带 * 的分数含义不同, 见下页第一行.

<!-- page 6 of 14 -->

We evaluate the officially released checkpoint by ourselves.

我们自己评测了官方发布的检查点. 这一行同样丢了星号, 按位置对应多图表中带 * 的分数.

> **问:** 单图表和多图表都有带 * 的分数, 意思一样吗?
> 不一样. 单图表的注是 「We evaluate this benchmark using chain-of-thought prompting」, MiniCPM-V 2.6 的 MME, OCRBench, MMMU, HallusionBench 四项带 *, 是用 CoT 提示测的; 多图表的注是 「We evaluate the officially released checkpoint by ourselves」, 带 * 的是 InternLM-XComposer-2.5 和 InternVL2-8B 由作者自己复测的分数. 同一个符号, 两种口径.

> **核对:** 第 3 页说在 Mantis-Eval, BLINK, Mathverse mv, Sciverse mv 上 「state-of-the-art」, 多图表的 BLINK 一列撑得住吗?
> 撑不住. BLINK val 上 MiniCPM-V 2.6 是 54.1, GPT-4V 54.6, LLaVA-NeXT-Interleave-14B 54.4, 都比它高; 只算 Open-source 组, 54.1 才是第一. 另外 LLaVA-NeXT-Interleave-14B 带着 14B 的规模被放进 Proprietary 组, 分组本身可疑. MIRB 上它 53.8 低于 InternVL2-8B 的 56.9*, 正文也没把 MIRB 列进 SOTA 名单.

> **看表:** Mathverse mv 一列 MiniCPM-V 2.6 是 84.9, GPT-4V 63.0, 开源模型都在 32.7 及以下, 这个差距正常吗?
> 页面只给数, 没给评测设置. 84.9 比 GPT-4V 高 21.9 分, 比 InternVL2-8B 的 30.5* 高 54.4 分; Sciverse mv 上 74.9 比 GPT-4V 的 66.9 高 8.0 分. 跨度这么大, 引用前要先确认各家是否用了同一套提示和同一个子集, 这一页确认不了.

**Video results on Video-MME and Video-ChatGPT:**

**Video-MME 和 Video-ChatGPT 上的视频结果:**

| Model | Size | Video-MME w/o subs | Video-MME w subs | Video-ChatGPT Correctness | Detail | Context | Temporal | Consistency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Proprietary** | | | | | | | | |
| Claude 3.5 Sonnet | - | 60.0 | 62.9 | - | - | - | - | - |
| GPT-4V | - | 59.9 | 63.3 | - | - | - | - | - |
| **Open-source** | | | | | | | | |
| LLaVA-NeXT-7B | 7B | - | - | 3.39 | 3.29 | 3.92 | 2.60 | 3.12 |
| LLaVA-NeXT-34B | 34B | - | - | 3.29 | 3.23 | 3.83 | 2.51 | 3.47 |
| CogVLM2-Video | 12B | - | - | 3.49 | 3.46 | 3.23 | 2.98 | 3.64 |
| LongVA | 7B | 52.4 | 54.3 | 3.05 | 3.09 | 3.77 | 2.44 | 3.64 |
| InternVL2-8B | 8B | 54.0 | 56.9 | - | - | - | - | - |
| InternLM-XComposer-2.5 | 8B | 55.8 | - | - | - | - | - | - |
| LLaVA-NeXT-Video | 32B | 60.2 | 63.0 | 3.48 | 3.37 | 3.95 | 2.64 | 3.28 |
| MiniCPM-V 2.6 | 8B | 60.9 | 63.6 | 3.59 | 3.28 | 3.93 | 2.73 | 3.62 |

视频结果表. 原表表头分两层: Video-MME 下分 w/o subs (无字幕) 和 w subs (有字幕), Video-ChatGPT 下分 Correctness (正确性), Detail (细节), Context (上下文), Temporal (时序), Consistency (一致性) 五项, 这里把两层合成一行.

> **拆开:** 第 3 页说 Video-MME 上超过 「LLaVA-NeXT-Video-34B」, 视频表里对应哪一行? 差多少?
> 表里只有 「LLaVA-NeXT-Video」, Size 写 32B, 和 34B 对不上. 按这一行比, 无字幕 60.9 对 60.2, 高 0.7; 有字幕 63.6 对 63.0, 高 0.6. 对 GPT-4V 分别高 1.0 和 0.3, 对 Claude 3.5 Sonnet 分别高 0.9 和 0.7, 都在 1 分以内.

> **确认:** Video-ChatGPT 的五个维度里, MiniCPM-V 2.6 哪几项是第一?
> 只有 Correctness 一项 (3.59). Detail 3.28 低于 CogVLM2-Video 的 3.46, Context 3.93 低于 LLaVA-NeXT-Video 的 3.95, Temporal 2.73 低于 CogVLM2-Video 的 2.98, Consistency 3.62 低于 CogVLM2-Video 和 LongVA 的 3.64. 五项平均 3.43, 是表里最高 (页面没给平均), 次高是 CogVLM2-Video 的 3.36.

Click to view few-shot results on TextVQA, VizWiz, VQAv2, OK-VQA.

点击查看 TextVQA, VizWiz, VQAv2, OK-VQA 上的少样本结果. 折叠内容没有印出来.

**Examples**

**示例**

<!-- page 7 of 14 -->

Oo

页首两个小圆点图标被识别成了 「Oo」.

![一辆黑色平把自行车停在木栅栏前的草地边](images/p07-round-1.png)

Round 1

第 1 轮.

Help me lower my bike seat

帮我把自行车座调低.

![机器人头像图标, 标记 MiniCPM-V 2.6 的回答](images/p07-minicpm-v-2-6.png)

MiniCPM-V 2.6

模型回答:

To lower your bike seat, follow these steps:

要把自行车座调低, 按下面几步做:

1. Locate the seat post clamp: On the underside of the seat, you should see a clamp that holds the seat post in place.

1. 找到座管夹: 在座垫下方, 你应该能看到一个把座管固定住的夹子.

2. Release the clamp: There is usually a quickrelease lever or a bolt that you can use to release the clamp. If it's a lever, pull it to unlock the seat post. If it's a bolt, loosen it slightly.

2. 松开夹子: 通常有一个快拆扳手或一颗螺栓用来松开夹子. 如果是扳手, 扳开它解锁座管; 如果是螺栓, 稍微拧松.

3. Lower the seat: Gently lower the seat until it reaches the desired height. Be careful not to lower it too far, as this could affect your riding position and comfort.

3. 放低座垫: 轻轻把座垫往下放, 直到想要的高度. 注意别放得太低, 否则会影响骑行姿势和舒适度.

4. Secure the seat: Once you've reached the desired height, reattach the clamp. If it's a lever, push it back to lock the seat in place. If it's a bolt, tighten it until it's secure.

4. 固定座垫: 到了想要的高度后, 重新夹紧. 如果是扳手, 把它推回去锁住座垫; 如果是螺栓, 拧紧到牢固为止.

5. Test the seat: Give the seat a gentle push to ensure it's securely in place and doesn't wobble. Remember to adjust the seat height based on your comfort and the type of riding you'll be doing.

5. 检查座垫: 轻推一下座垫, 确认它固定牢靠, 不晃动. 记得根据自己的舒适度和骑行类型调整座高.

![海边餐桌上的两瓶绿色 Magna 啤酒和一瓶水](images/p07-do.png)

Do

Do

图下两行 「Do」 是页面小图标被识别出的残字, 没有实际含义.

![座管特写, 白圈圈出车架立管顶端带螺栓的座管夹](images/p07-round-2.png)

Round 2

第 2 轮.

Is this the lever or bolt?

这是扳手还是螺栓?

![机器人头像图标, 标记 MiniCPM-V 2.6 的回答](images/p07-minicpm-v-2-6-2.png)

MiniCPM-V 2.6

模型回答:

The image shows a bolt, not a lever. This type of clamp is typically used to secure the seat post in place on a bicycle. To lower your bike seat using this mechanism, you would loosen or remove the bolt, adjust the seat height as needed, and then reattach or tighten the bolt to secure the seat.

图里是螺栓, 不是扳手. 这种夹子一般用来把座管固定在自行车上. 用这个结构调低座垫, 要先拧松或卸下螺栓, 按需要调好座高, 再装回或拧紧螺栓把座垫固定住.

> **回看:** 第 1 轮回答说座管夹在 「the underside of the seat」, 和第 2 轮那张特写对得上吗?
> 对不上. 第 2 轮照片里白圈圈住的夹子套在车架立管顶端, 座管从这里插进车架, 离座垫还有一段距离. 第 2 轮回答 「The image shows a bolt, not a lever」 与照片一致, 但没有顺带纠正第 1 轮说错的位置.

![用户头像图标](images/p07-image.png)

![自行车车架说明书页: 爆炸图加零件名称与工具尺寸表](images/p07-image-2.png)

![餐厅酒单 Wine & Beers, Beers 栏列出 Medalla 5, Magna 6, Heineken 6, Presidente 6](images/p07-how-much-should-i-pay-for-all-of-the-beer-on-the-table.png)

How much should I pay for all of the beer on the table according to the price on the menu?

按菜单上的价格, 桌上所有啤酒我该付多少钱?

![黄色工具箱, 装着成套内六角扳手, 套筒和棘轮扳手](images/p07-round-3.png)

Round 3

第 3 轮.

Here is my manual and tool box, do I have the right tool?

这是我的说明书和工具箱, 我有合适的工具吗?

![机器人头像图标, 标记 MiniCPM-V 2.6 的回答](images/p07-minicpm-v-2-6-3.png)

MiniCPM-V 2.6

模型回答:

To determine if you have the right tool for adjusting your bike seat, we need to identify the specific tools required based on the manual provided in the first image.

要判断你有没有调座垫的合适工具, 先要根据第一张图里的说明书, 确认需要哪种工具.

1. Identify the Tool Required:

1. 确认所需工具:

\- According to the manual (the first image), to adjust the seat post clamp (item labeled 'J' which is the SEAT COLLAR), you would typically use a 4mm Allen key or hex wrench.

\- 根据说明书 (第一张图), 调整座管夹 (标为 'J' 的零件, 即 SEAT COLLAR 座管束环), 通常要用 4mm 的内六角扳手.

2. Check Your Tool Box:

2. 检查你的工具箱:

\- In the second image, you have a comprehensive tool box with various sizes of Allen keys and hex wrenches.

\- 第二张图里, 你有一个很齐全的工具箱, 里面有各种尺寸的内六角扳手.

3. Determine Availability:

3. 确认有没有:

\- Look through the set in the tool box to find a 4mm Allen key or hex wrench. The exact size may not be explicitly marked, but you should be able to identify it by its shape and size relative to other tools.

\- 在工具箱里找一把 4mm 的内六角扳手. 尺寸可能没有明确标注, 但你可以根据它的形状和相对其他工具的大小认出来.

Conclusion:

Based on the information from the manual and the tool box, you should have the appropriate tool to lower your bike seat. Ensure that you select a 4mm Allen key or hex wrench from your tool box to proceed with the adjustment safely and effectively.

根据说明书和工具箱的信息, 你应该有调低座垫的合适工具. 请从工具箱里选出 4mm 的内六角扳手, 再安全, 有效地进行调整.

![机器人头像图标, 标记 MiniCPM-V 2.6 的回答](images/p07-minicpm-v-2-6-4.png)

MiniCPM-V 2.6

模型回答 (对应上面的啤酒问题):

To calculate the total cost of the beer on the table according to the price on the menu, follow these steps:

按菜单价格计算桌上啤酒的总价, 步骤如下:

1. Identify the beers on the table:

1. 认出桌上的啤酒:

\- There are two bottles of Magna beer on the table.

\- 桌上有两瓶 Magna 啤酒.

2. Find the price of Magna beer on the menu:

2. 在菜单上找 Magna 的价格:

\- According to the menu, Magna beer is priced at 6 units of currency.

\- 按菜单, Magna 啤酒标价 6 个货币单位.

3. Calculate the total cost:

3. 计算总价:

\- Since there are two bottles of Magna beer, multiply the price per bottle by the number of bottles:

\- 因为有两瓶 Magna, 用单瓶价格乘以瓶数:

6 units/can × 2 cans = 12 units

6 单位/罐 × 2 罐 = 12 单位

Therefore, you should pay 12 units of currency for all of the beer on the table according to the price on the menu.

因此, 按菜单价格, 桌上所有啤酒你应付 12 个货币单位.

> **停一下:** 算啤酒钱时, 回答前面说 「two bottles of Magna beer」, 算式却写 「6 units/can × 2 cans」, 瓶还是罐?
> 照片里是两只绿色玻璃瓶, 瓶身印 MAGNA; 酒单 Beers 栏 Magna 标 6. 单位写错不影响结果, 6 × 2 = 12 是对的, 这是示例里模型自己的笔误.

<!-- page 8 of 14 -->

![Python 蓝黄双蛇标志的小图标](images/p08-d.png)

D

Python 文件图标旁被识别出的残字 「D」.

![用户头像图标](images/p08-case-debug.png)

## CASE-DEBUG

调试案例. 截图是一个名为 case-debug 的 Python 项目.

main.py

user.py

编辑器里的两个文件标签: main.py 和 user.py.

```python
class User:
    def __init__(self, first_name, last_name, address, telephone):
        self._first_name = first_name
        self_lat_name = last_name
        self._address = address
        self_telephone = telephone

    def describe_user(self):
        print["("self_lat_name|self._first_name) lives in (self_address), telephone number: (self.telephone)")"]
    def greet_user(self):
        print["("Hello, (self_lat_name)|self._first_name)")"]
```

user.py 里的 User 类: 构造函数保存名, 姓, 地址, 电话, 另有 describe\_user 和 greet\_user 两个打印方法. 这段代码是从截图识别出来的, 下划线, 点号和括号多处错乱.

```python
def __init__(self, privileges=['Add post', 'Delete post', 'Add user']): self.privileges = privileges
```

privilege.py 里 Privileges 类的构造函数, 默认权限为 'Add post', 'Delete post', 'Add user'.

main.py > ...

编辑器面包屑: main.py 文件.

```python
admins = Admin('Lili', 'Wang', 'China', '12345678')

admins.privileges.show_privileges()
```

main.py 的两行: 创建一个 Admin 对象, 再调用它的 show\_privileges 方法.

## TERMINAL / 终端

```python
( base ) → case-debug python main.py
Traceback (most recent call last):
  File "/Users">case-debug/main.py", line 2, in <module>
  from privilege import Privileges, Admin
  File "/Users">case-debug/privilege.py", line 8, in <module>
  class Admin(User):
  NameError: name 'User' is not defined
( base ) → case-debug
```

终端输出: 运行 main.py 时, 在 privilege.py 第 8 行 「class Admin(User):」 处报 NameError, User 未定义.

![机器人头像图标, 标记 MiniCPM-V 2.6 的回答](images/p08-minicpm-v-2-6.png)

MiniCPM-V 2.6

模型回答:

The cause of the bug is that the `User` class is not defined in the `privilege.py` module. When you import `Privileges` from `privilege.py` in `main.py`, it expects the `User` class to be defined, but it is not.

bug 的原因是 `privilege.py` 模块里没有定义 `User` 类. 在 `main.py` 里从 `privilege.py` 导入 `Privileges` 时, 它要求 `User` 类已经定义, 但实际没有.

To fix this bug, you need to define the `User` class in the `privilege.py` module. Here is the corrected code for `privilege.py`:

要修这个 bug, 需要在 `privilege.py` 模块里定义 `User` 类. 下面是改好的 `privilege.py`:

```python
class User:
    ...
    def describe_user(self): print(f"{self.last_name}{self.first_name} lives in {self.address}, telephone number: {self.telephone}")
...
12 class Privileges:
...
18 class Admin(User):
```

打印稿只识别出改后代码的几行片段: User 类和它的 describe\_user 方法, 以及行号 12 处的 Privileges 类和行号 18 处的 Admin(User) 类, 中间部分缺失.

In this corrected version, the `User` class is defined within the `privilege.py` module. Now, when you import `Privileges` from `privilege.py` in `main.py`, the `User` class is available, and the `show_privileges()` method can be called without raising a `NameError`.

在改后的版本里, `User` 类定义在 `privilege.py` 模块内. 现在从 `privilege.py` 导入 `Privileges` 时, `User` 类已经可用, 调用 `show_privileges()` 方法也不会再抛出 `NameError`.

What is the cause of the bug? How to fix it?

这个 bug 的原因是什么? 怎么修?

\* The code blocks in the model's response have been rendered for ease of reading.

\* 为方便阅读, 模型回答中的代码块已做渲染.

> **对一下:** 调试示例里, 模型给的修法是在 privilege.py 里重新定义 User 类, 和截图里的项目结构合不合?
> 截图里已有 user.py, User 类就定义在那里, 更直接的修法是在 privilege.py 里导入它; 模型的改法等于把类复制一份, 能消掉这条 NameError, 但项目里会留下两份 User. user.py 里 「self\_lat\_name」 和 print[...] 这类写法来自截图识别, 原代码是否真有这些错, 打印稿看不清.

![漫画第 1 格: 戴白手套的人在做塔可, 桌上牌子写 TACO 1$](images/p08-shot-1.png)

Shot 1:

第 1 格:

![漫画一格: 戴白手套的手接过一张纸币](images/p08-while-cooking.png)

... while cooking.

...做饭的时候 (这句的前半截没有印出来).

But, he also wears gloves when accepting cash.

可是他收现金的时候也戴着手套.

![漫画第 2 格: 印着回收标志的绿色水壶](images/p08-shot-2.png)

Shot 2:

第 2 格:

Yes, this is a reusable eco-friendly water bottle.

是的, 这是一个可重复使用的环保水壶.

But, he buys bottled water and pours it inside.

可是他买来瓶装水倒进去.

o o

鸟MiniCPM-V 2.6

两行页脚残字: 「o o」 是小图标, 「鸟」 是 MiniCPM-V 2.6 头像图标被识别成的字.

Yes, he has a digital wallet with various cryptocurrencies. But the store only accepts cash.

是的, 他有一个装着多种加密货币的数字钱包. 可是店里只收现金.

![用户头像图标](images/p08-2008-2017-8-24-4.png)

由于存在闭幕后奖牌被取消的情况，下面的2008年北京奥运会奖牌榜实为截至2017年8月24日的奖牌榜。以下根据题标列举数目:[4]

奖牌榜

截图原文就是中文, 照录. 大意: 因为有闭幕后取消奖牌的情况, 下表是截至 2017 年 8 月 24 日的 2008 年北京奥运会奖牌榜.

| 名次 | 国家/地区 | 金牌 | 领牌 | 铜牌 | 奖牌总数 |
| --- | --- | --- | --- | --- | --- |
| 1 | 中国 (CHN) | 48 | 22 | 30 | 100 |
| 2 | 美国 (USA) | 36 | 39 | 37 | 112 |
| 3 | 俄罗斯 (RUS) | 24 | 13 | 23 | 60 |
| 4 | 英国 (GBR) | 19 | 13 | 19 | 51 |
| 5 | 德国 (GER) | 16 | 11 | 14 | 41 |
| 6 | 澳大利亚 (AUS) | 14 | 15 | 17 | 46 |
| 7 | 韩国 (KOR) | 13 | 11 | 8 | 32 |
| 8 | 日本 (JPN) | 9 | 8 | 8 | 25 |
| 9 | 意大利 (ITA) | 8 | 9 | 10 | 27 |
| 10 | 法国 (FRA) | 7 | 16 | 20 | 43 |
| 11 | 荷兰 (NED) | 7 | 5 | 4 | 16 |
| 12 | 乌克兰 (UKR) | 7 | 4 | 11 | 22 |
| 13 | 肯尼亚 (KEN) | 6 | 4 | 6 | 16 |
| 14 | 西班牙 (ESP) | 5 | 11 | 3 | 19 |
| 15 | 牙买加 (JAM) | 5 | 4 | 2 | 11 |

表头 「领牌」 是 「银牌」 的识别错字, 表内数字照录.

(English Translation) How many gold medals did the top three countries with the most gold medals at the 2008 Olympics win in total? Please analyze step by step.

2008年奥运会获得金牌数最多的3个国家一共获得了多少枚金牌？请逐步分析

用户提问原文是中文, 上面的英文是页面自带的翻译, 提问照录.

Click to view more cases.

点击查看更多案例. 折叠内容没有印出来.

MiniCPM-V 2.6

模型回答 (原文为中文, 下面每段先列页面自带的英文翻译, 再照录中文原文):

(English Translation) According to the medal table information in the image, the top three countries with the most gold medals at the 2008 Olympics are:

根据图像中的奖牌榜信息，2008年奥运会获得金牌数最多的3个国家分别是:

China (CHN): 48 gold medals

1.中国（CHN）:48枚金牌

United States (USA): 36 gold medals

2. 美国(USA）:36枚金牌

Russia (RUS): 24 gold medals

3.俄罗斯(RUS):24枚金牌

To calculate the total number of gold medals won by these three countries, we need to add their gold medal counts:

要计算这3个国家一共获得了多少枚金牌，我们需要将它们的金牌数相加:

48 (China) + 36 (USA) + 24 (Russia) = 108

48(中国) + 36(美国) + 24(俄罗斯) = 108

Therefore, the top three countries with the most gold medals at the 2008 Olympics won a total of 108 gold medals.

因此，2008年奥运会获得金牌数最多的3个国家一共获得了108枚金牌。

> **再看:** 奖牌榜截图里的数和模型算出的 108 核对得上吗?
> 对得上. 前三名金牌 48, 36, 24, 相加 108; 表里 15 行每行金银铜相加都等于奖牌总数, 例如中国 48 + 22 + 30 = 100, 美国 36 + 39 + 37 = 112. 美国奖牌总数比中国多, 但题目问的是金牌, 模型没有混淆.

<!-- page 9 of 14 -->

We deploy MiniCPM-V 2.6 on end devices. The demo video is the raw screen recording on a iPad Pro without edition.

我们把 MiniCPM-V 2.6 部署在端侧设备上. 演示视频是 iPad Pro 上未经剪辑的原始录屏.

![iPad 端侧演示录屏的四张截图: 欢迎页 Welcome to MiniCPM-V 2.6 和一张梗图, 海边啤酒与菜单的提问, 欢迎页上的一张火车票照片, 两张柴犬截图配提问 "这两张图合在一起看，有什么好笑的地方。"](images/p09-image.png)

<!-- page 10 of 14 -->

![黑屏的视频播放器, 时长 0:41](images/p10-image.png)

![链接图标](images/p10-demo.png)

**Demo**

**演示**

Click here to try the Demo of [MiniCPM-V 2.6](http://120.92.209.146:8887/).

点这里试用 MiniCPM-V 2.6 的演示.

**Usage**

**用法**

Inference using Huggingface transformers on NVIDIA GPUs. Requirements tested on python 3.10:

在 NVIDIA GPU 上用 Huggingface transformers 推理. 下列依赖在 python 3.10 上验证过:

```txt
Pillow==10.1.0
torch==2.1.2
torchvision==0.16.2
transformers==4.40.0
sentencepiece==0.1.99
decord
```

依赖清单: Pillow 10.1.0, torch 2.1.2, torchvision 0.16.2, transformers 4.40.0, sentencepiece 0.1.99, 以及不限版本的 decord.

<!-- page 11 of 14 -->

```python
# test.py
import torch
from PIL import Image
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained('openbmb/MiniCPM-V-2_6', trust_remote)
    attn_implementation='sdpa', torch_dtype=torch.bfloat16) # sdpa or i
model = model.eval().cuda()
tokenizer = AutoTokenizer.from_pretrained('openbmb/MiniCPM-V-2_6', trus

image = Image.open('xx.jpg').convert('RGB')
question = 'What is in the image?' 
msgs = [{'role': 'user', 'content': [image, question]]}

res = model.chat(
    image=None,
    msgs=news,
    tokenizer=newizer
)
print(res)

## if you want to use streaming, please make sure sampling=True and st
## the model.chat will return a generator
res = model.chat(
    image=None,
    msgs=news,
    tokenizer=newizer,
    sampling=True,
    stream=True
)

generated_text = ""
for new_text in res:
    generated_text += new_text
    print(new_text, flush=True, end='')
```

test.py 的内容: 以 bfloat16 和 sdpa 注意力加载模型并放到 GPU, 读入一张图片, 提问 'What is in the image?', 先做一次普通调用, 再做一次流式调用. 代码照录, 第 10 页末尾的 「# test.py」 和 「import torch」 两行接回到这里. 注释说: 要用流式输出, 必须设 sampling=True, model.chat 会返回一个生成器.

> **想:** 示例代码里的 msgs=news, tokenizer=newizer 能直接跑吗?
> 不能照抄. 前面定义的变量是 msgs 和 tokenizer, news 和 newizer 是识别错字; from\_pretrained 那两行在 trust\_remote 和 trus 处被页面右边截断, 注释 「# sdpa or i」 和 「...and st」 也断了. 按页面只能看出两种调法: 普通调用, 以及 sampling=True, stream=True 的流式调用.

**Chat with multiple images**

**多图对话**

Click to show Python code running MiniCPM-V 2.6 with multiple images input.

点击展开用多图输入运行 MiniCPM-V 2.6 的 Python 代码. 折叠内容没有印出来.

<!-- page 12 of 14 -->

## In-context few-shot learning / 上下文少样本学习

Click to view Python code running MiniCPM-V 2.6 with few-shot input.

点击查看用少样本输入运行 MiniCPM-V 2.6 的 Python 代码. 折叠内容没有印出来.

## Chat with video / 视频对话

Click to view Python code running MiniCPM-V 2.6 with video input.

点击查看用视频输入运行 MiniCPM-V 2.6 的 Python 代码. 折叠内容没有印出来.

Please look at [GitHub](https://github.com/OpenBMB/MiniCPM-V) for more detail about usage.

更多用法细节请看 GitHub.

## Inference with llama.cpp / 用 llama.cpp 推理

MiniCPM-V 2.6 can run with llama.cpp. See our fork of [llama.cpp](https://github.com/OpenBMB/llama.cpp/tree/minicpm-v2.5/examples/minicpmv) for more detail.

MiniCPM-V 2.6 可以用 llama.cpp 运行. 详情见我们 fork 的 llama.cpp.

> **问:** 这一节的 llama.cpp 链接指向 minicpm-v2.5 分支, 第 4 页 Easy Usage 的链接却指向 minicpmv-main 分支下的 README-minicpmv2.6.md, 该看哪个?
> 页面两处都写了, 没说明区别. 从路径看, 第 4 页那条是专门写给 2.6 的说明文件, 这一节的分支名还停在 v2.5, 像是从前代模型卡沿用下来的链接.

## Int4 quantized version / Int4 量化版

Download the int4 quantized version for lower GPU memory (7GB) usage: [MiniCPM-V-2\_6-int4](https://huggingface.co/openbmb/MiniCPM-V-2_6-int4).

下载 int4 量化版可以降低显存占用 (7GB): MiniCPM-V-2\_6-int4.

> **核对:** int4 版本写 「lower GPU memory (7GB)」, 8B 参数按 4 bit 算不是只要 4 GB 吗?
> 8B × 0.5 字节 ≈ 4 GB 只是权重, 7GB 说的是运行时显存, 还要算激活, KV cache 和图像编码的中间结果; 页面没说视觉部分是否也量化成 int4, 也没给测量条件. 对照 BF16 权重约 16 GB, int4 版的显存降到一半以下.

**License**

**许可证**

## Model License / 模型许可

The code in this repo is released under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE) License.

本仓库的代码以 Apache-2.0 许可证发布.

The usage of MiniCPM-V series model weights must strictly follow [MiniCPM Model License.md](https://github.com/OpenBMB/MiniCPM/blob/main/MiniCPM%20Model%20License.md).

MiniCPM-V 系列模型权重的使用必须严格遵守 MiniCPM Model License.md.

The models and weights of MiniCPM are completely free for academic research. After filling out a ["questionnaire"](https://modelbest.feishu.cn/share/base/form/shrcnpV5ZT9EJ6xYjh3Kx0J6v8g) for registration, MiniCPM-V 2.6 weights are also available for free commercial use.

MiniCPM 的模型和权重对学术研究完全免费. 填写一份 「问卷」 登记后, MiniCPM-V 2.6 的权重也可以免费商用.

## Statement / 声明

As an LMM, MiniCPM-V 2.6 generates contents by learning a large mount of multimodal corpora, but it cannot comprehend, express personal opinions or make value judgement.

作为多模态大模型, MiniCPM-V 2.6 通过学习大量多模态语料来生成内容, 但它不能理解, 不能表达个人观点, 也不能做价值判断.

<!-- page 13 of 14 -->

Anything generated by MiniCPM-V 2.6 does not represent the views and positions of the model developers

MiniCPM-V 2.6 生成的任何内容都不代表模型开发者的观点和立场.

We will not be liable for any problems arising from the use of the MinCPM-V models, including but not limited to data security issues, risk of public opinion, or any risks and problems arising from the misdirection, misuse, dissemination or misuse of the model.

因使用 MiniCPM-V 模型产生的任何问题, 我们概不负责, 包括但不限于数据安全问题, 舆论风险, 以及模型被误导, 误用, 传播或滥用带来的任何风险和问题.

## Key Techniques and Other Multimodal Projects / 关键技术与其他多模态项目

👏 Welcome to explore key techniques of MiniCPM-V 2.6 and other multimodal projects of our team:

欢迎了解 MiniCPM-V 2.6 的关键技术, 以及我们团队的其他多模态项目:

```txt
VisCPM | RLHF-V | LLaVA-UHD | RLAIF-V
```

四个项目: VisCPM, RLHF-V, LLaVA-UHD, RLAIF-V.

## Citation / 引用

If you find our work helpful, please consider citing our papers 📝 and liking this project ❤️

如果我们的工作对你有帮助, 请考虑引用我们的论文并给这个项目点赞.

```bib
@article{yao2024minicpm,
  title={MiniCPM-V: A GPT-4V Level MLLM on Your Phone},
  author={Yao, Yuan and Yu, Tianyu and Zhang, Ao and Wang, Chongyi and journal={arXiv preprint arXiv:2408.01800},
  year={2024}
}
```

引用条目: Yao Yuan 等, 「MiniCPM-V: A GPT-4V Level MLLM on Your Phone」, arXiv 预印本 2408.01800, 2024 年. 打印稿里作者列表在第四位之后被截断, 直接接上了 journal 字段.

## Company / 公司

<!-- page 14 of 14 -->

## Website / 网站

![Hugging Face 笑脸标志, 位于页脚](images/p14-image.png)
