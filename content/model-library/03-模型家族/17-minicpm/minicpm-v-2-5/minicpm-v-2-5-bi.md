---
title: "MiniCPM-Llama3-V 2.5 · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM-Llama3-V 2.5 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 12 -->

![Hugging Face 页面上 "请求服务商支持" 按钮旁的举手表情图标](images/p01-image.png)

![Hugging Face 页头左上角的笑脸抱抱表情图标](images/p01-image-2.png)

![xet 存储标识, 两个叠起来的菱形线框](images/p01-image-3.png)

![复制到存储桶按钮上的两个叠放方框图标](images/p01-s.png)

Search models, datasets, users...

搜索框里的占位文字: 搜索模型, 数据集, 用户. 这份源文是 Hugging Face 上 openbmb/MiniCPM-Llama3-V-2_5 模型页的网页截取, 不是论文. MinerU 在图标下面单独识别出的字母 S 是图标残字, 已删去.

## [openbmb](https://huggingface.co/openbmb)/[MiniCPM-Llama3-V-2\_5](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5) (模型仓库名)

仓库名: 组织 openbmb 下的 MiniCPM-Llama3-V-2_5.

Like 1.41k · Follow <u>OpenBMB 5.36k</u>

点赞数 1.41k; 关注 OpenBMB 组织的人数 5.36k.

[Image-Text-to-Text](https://huggingface.co/models?pipeline_tag=image-text-to-text) · [Transformers](https://huggingface.co/models?library=transformers) · [Safetensors](https://huggingface.co/models?library=safetensors) · openbmb/RLAIF-V-Dataset · [multilingual](https://huggingface.co/models?language=multilingual) · [minicpmv](https://huggingface.co/models?other=minicpmv) · [feature-extraction](https://huggingface.co/models?other=feature-extraction) · [minicpm-v](https://huggingface.co/models?other=minicpm-v) · [vision](https://huggingface.co/models?other=vision) · [ocr](https://huggingface.co/models?other=ocr) · [custom\_code](https://huggingface.co/models?other=custom_code) · [conversational](https://huggingface.co/models?other=conversational)

页面标签: 任务类型 Image-Text-to-Text (图文进, 文本出), 加载库 Transformers, 权重格式 Safetensors, 训练数据集 openbmb/RLAIF-V-Dataset, 多语言, 模型类型 minicpmv, 特征抽取, minicpm-v, 视觉, OCR, 需要自定义代码 (custom_code), 对话.

Deploy · Copy to bucket **NEW** · Use this model

页面按钮: 部署, 复制到存储桶 (新功能), 使用此模型.

[**Model card**](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5) · [Files](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5/tree/main) · [**xet**](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5/tree/main)

三个标签页: 模型卡, 文件, xet 存储标识.

![社区讨论入口旁的挥手表情图标](images/p01-community.png)

Community

社区讨论区入口.

![社区讨论数的黑底角标, 数字 79](images/p01-downloads-last-month.png)

这张角标 MinerU 按下一行命名成 downloads-last-month, 图上其实是数字 79. PDF 文字层里 79 紧跟在 Community 后面, 是社区讨论数.

> **想:** 文件名写着 downloads-last-month, 图上又是 79, 上个月下载量是不是 79?
> 不是. 上个月下载量在下一行, 是 19,575. 79 这张图在 PDF 文字层里排在 「Community」 之后, 「Like」 之前, 和 MiniCPM-o 2.6 页面同位置的讨论数角标是同一种控件. MinerU 按图片下方最近的文字给图起名, 名字和内容对不上, 读图时要看图本身.

Downloads last month: 19,575

上个月下载量 19,575 次. MinerU 把标题和数字各识别成一个二级标题, 这里合成一行.

Safetensors · Model size: 9B params · Tensor type: F16

权重格式 Safetensors; 页面自动统计的模型大小 9B 参数; 张量类型 F16.

<u>Chat template</u> · <u>Files info</u>

两个链接: 对话模板, 文件信息.

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers) (推理服务商)

[Image-Text-to-Text](https://huggingface.co/tasks/image-text-to-text)

This model isn't deployed by any Inference Provider.

1 Ask for provider support

推理服务商栏: 任务类型 Image-Text-to-Text. 目前没有任何推理服务商部署这个模型, 有 1 人点了 「请求服务商支持」. PDF 文字层里数字 1 前面是一个举手表情符号, 就是本页第一张图.

## Model tree for openbmb/MiniCPM-Llama3-V-2\_5 (模型谱系)

**Adapters** [8 models](https://huggingface.co/models?other=base_model:adapter:openbmb/MiniCPM-Llama3-V-2_5) · **Finetunes** [8 models](https://huggingface.co/models?other=base_model:finetune:openbmb/MiniCPM-Llama3-V-2_5) · **Quantizations** [5 models](https://huggingface.co/models?other=base_model:quantized:openbmb/MiniCPM-Llama3-V-2_5)

以这个模型为基座的衍生模型: 适配器 8 个, 微调模型 8 个, 量化模型 5 个.

## Dataset used to train openbmb/MiniCPM-Llama3-V-2\_5 (训练用数据集)

训练这个模型用到的数据集, 具体条目在下一页.

<!-- page 2 of 12 -->

openbmb/RLAIF-V-Dataset · Viewer · Updated Oct 14, 2025 · 83.1k · 1.87k · 219

训练数据集 openbmb/RLAIF-V-Dataset: 可在线预览, 2025 年 10 月 14 日更新, 83.1k 条数据, 1.87k 次下载, 219 个赞. 这个更新日期说明网页是在 2025 年 10 月中旬之后截取的.

**Spaces using openbmb/MiniCPM-Llama3-V-2\_5** 30

WildVision/vision-arena · eduagarcia/multilingual-tokenizer-leaderboard · NiansuhAI/Main · srinuksv/Main · Harsha200314/vision-arena1 · + 25 Spaces

使用这个模型的 Space 共 30 个, 页面列出 5 个: 视觉竞技场, 多语言分词器排行榜, NiansuhAI 的 Main, srinuksv 的 Main, 另一个视觉竞技场副本, 另有 25 个折叠未列.

**Collections including openbmb/MiniCPM-Llama3-V-2\_5**

MiniCPM Collection · The MiniCPM family of LLMs and VLLMs. • 33 items • Updated 10 days ago • 78

MiniCPM-o & MiniCPM-V Collection · Multimodal models with leading perform... • 32 items • Updated 10 days ago • 86

收录这个模型的合集两个. MiniCPM 合集: MiniCPM 系列的大语言模型和视觉语言模型, 33 项, 10 天前更新, 78 个赞. MiniCPM-o 与 MiniCPM-V 合集: 性能领先的多模态模型 (简介被截断), 32 项, 10 天前更新, 86 个赞. MinerU 在这一行前识别出的 「品」 字是合集图标的残字, 已删去.

## A GPT-4V Level Multimodal LLM on Your Phone (模型卡标题)

模型卡正文的标题: 手机上的 GPT-4V 级多模态大模型.

[GitHub](https://github.com/OpenBMB/MiniCPM-V) | [Demo](https://huggingface.co/spaces/openbmb/MiniCPM-Llama3-V-2_5) | [WeChat](https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/wechat.md)

一排链接: GitHub, 在线演示, 微信群.

**News**

新闻.

[2025.01.14] We open source [**MiniCPM-o 2.6**](https://huggingface.co/openbmb/MiniCPM-o-2_6), with significant performance improvement over **MiniCPM-V 2.6**, and support real-time speech-to-speech conversation and multimodal live streaming. Try it now.

[2025.01.14] 开源 MiniCPM-o 2.6, 性能比 MiniCPM-V 2.6 明显提升, 支持实时语音到语音对话和多模态实时流. 现在就来试试.

[2024.08.10] MiniCPM-Llama3-V 2.5 is now fully supported by [official](https://github.com/ggerganov/llama.cpp) llama.cpp! GGUF models of various sizes are available [here](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5-gguf).

[2024.08.10] 官方 llama.cpp 已完整支持 MiniCPM-Llama3-V 2.5! 多种大小的 GGUF 模型在这里下载.

[2024.08.06] We open-source [**MiniCPM-V 2.6**](https://huggingface.co/openbmb/MiniCPM-V-2_6), which outperforms GPT-4V on single image, multi-image and video understanding. It advances popular features of MiniCPM-Llama3-V 2.5, and can support real-time video understanding on iPad. Try it now!

[2024.08.06] 开源 MiniCPM-V 2.6, 在单图, 多图和视频理解上超过 GPT-4V. 它在 MiniCPM-Llama3-V 2.5 的热门功能上更进一步, 能在 iPad 上做实时视频理解. 现在就来试试! 这一条从第 2 页跨到第 3 页, 半句已接回.

<!-- page 3 of 12 -->

[2024.08.03] MiniCPM-Llama3-V 2.5 technical report is released! See [here](https://github.com/OpenBMB/MiniCPM-V/tree/main/docs/MiniCPM_Llama3_V_25_technical_report.pdf).

[2024.08.03] MiniCPM-Llama3-V 2.5 技术报告发布! 见这里.

[2024.07.19] MiniCPM-Llama3-V 2.5 supports vLLM now! See [here](https://github.com/OpenBMB/MiniCPM-V/tree/main?tab=readme-ov-file#vllm).

[2024.07.19] MiniCPM-Llama3-V 2.5 现在支持 vLLM! 见这里.

[2024.05.28] We now support LoRA fine-tuning for MiniCPM-Llama3-V 2.5, using only 2 V100 GPUs! See more statistics [here](https://github.com/OpenBMB/MiniCPM-V/tree/main/finetune#model-fine-tuning-memory-usage-statistics).

[2024.05.28] 现在支持对 MiniCPM-Llama3-V 2.5 做 LoRA 微调, 只要 2 张 V100 GPU! 更多统计数据见这里 (链接指向微调显存占用统计).

[2024.05.23] MiniCPM-V tops GitHub Trending and HuggingFace Trending! Our demo, recommended by Hugging Face Gradio's official account, is available [here](https://huggingface.co/spaces/openbmb/MiniCPM-Llama3-V-2_5). Come and try it out!

[2024.05.23] MiniCPM-V 登上 GitHub Trending 和 HuggingFace Trending 榜首! 在线演示获 Hugging Face Gradio 官方账号推荐, 在这里, 快来试试!

[2024.05.20] We open-soure MiniCPM-Llama3-V 2.5, it has improved OCR capability and supports 30+ languages, representing the first end-side MLLM achieving GPT-4V level performance! We provide <u>efficient inference</u> and [simple fine-tuning](https://github.com/OpenBMB/MiniCPM-V/blob/main/finetune/readme.md). Try it now!

[2024.05.20] 开源 MiniCPM-Llama3-V 2.5. 它的 OCR 能力更强, 支持 30 多种语言, 是第一个达到 GPT-4V 级性能的端侧多模态大模型! 我们提供高效推理和简单微调. 现在就来试试! 原文 open-soure 是 open-source 的笔误.

## Model Summary (模型概要)

**MiniCPM-Llama3-V 2.5** is the latest model in the MiniCPM-V series. The model is built on SigLip-400M and Llama3-8B-Instruct with a total of 8B parameters. It exhibits a significant performance improvement over MiniCPM-V 2.0. Notable features of MiniCPM-Llama3-V 2.5 include:

MiniCPM-Llama3-V 2.5 是 MiniCPM-V 系列的最新模型. 它基于 SigLip-400M 和 Llama3-8B-Instruct 搭建, 总参数 8B. 和 MiniCPM-V 2.0 相比性能明显提升. MiniCPM-Llama3-V 2.5 的主要特点如下:

> **核对:** 这里写总参数 8B, 第 1 页侧栏是 9B params, 第 5 页评测表 Size 列又写 8.5B, 按哪个?
> 三个数口径不同. 两个组件名字里的数相加是 0.4B + 8B = 8.4B, 评测表的 8.5B 和它最接近, 可能是按实际权重算的总量保留一位小数. 正文的 8B 是整数档位的说法. 侧栏的 9B 是 Hugging Face 按权重文件自动统计后取整, 张量类型 F16. 本页没有逐模块参数表, 分不出 8.4B 和 8.5B 之间的差额在哪一层. 和同表其他模型比大小时用 8.5B, 因为 Size 列对所有行是同一口径.

> **问:** 这句说 V 2.5 是 「the latest model in the MiniCPM-V series」, 可上面新闻里已经有 V 2.6 和 o 2.6, 哪个时间点的说法?
> 模型卡正文写于 2024 年 5 月发布时, 那时它确实是最新的. 新闻栏后来一路往上加条目, 最新一条是 2025.01.14, 侧栏数据集又显示 2025 年 10 月更新, 所以这一页是 「2024 年 5 月的正文 + 2025 年的新闻和侧栏」 拼在一起的. 第 11 页 「Key Techniques」 一节让读者去看 「MiniCPM-V 2.6 的关键技术」, 也是后来改过的痕迹. 读 「latest」 一类的词要按正文写作时间理解.

**Leading Performance.** MiniCPM-Llama3-V 2.5 has achieved an average score of 65.1 on OpenCompass, a comprehensive evaluation over 11 popular benchmarks. **With only 8B parameters, it surpasses widely used proprietary models like GPT-4V-1106, Gemini Pro, Claude 3 and Qwen-VL-Max** and greatly outperforms other Llama 3-based MLLMs.

**性能领先.** MiniCPM-Llama3-V 2.5 在 OpenCompass 上平均分 65.1, OpenCompass 是覆盖 11 个常用基准的综合评测. **只用 8B 参数, 它就超过了 GPT-4V-1106, Gemini Pro, Claude 3, Qwen-VL-Max 这些常用的闭源模型**, 并大幅领先其他基于 Llama 3 的多模态大模型.

> **看表:** 超过 GPT-4V-1106, Gemini Pro, Claude 3, Qwen-VL-Max 这四个, 第 5 页的表能核对几个?
> 只能核对两个. 表里闭源只有 Gemini Pro 62.9 和 GPT-4V (2023.11.06) 63.5, V 2.5 的 65.1 分别高 2.2 和 1.6. Claude 3 和 Qwen-VL-Max 不在表里, 本页也没有它们的 OpenCompass 分数. 而且这句只针对 OpenCompass 平均分, 不是逐项都赢, 逐项的情况见第 5 页表后的疑问.

**Strong OCR Capabilities.** MiniCPM-Llama3-V 2.5 can process images with any aspect ratio and up to 1.8 million pixels (e.g., 1344x1344), achieving an **700+ score on OCRBench, surpassing proprietary models such as GPT-4o, GPT-4V-0409, Qwen-VL-Max and Gemini Pro**. Based on recent user feedback, MiniCPM-Llama3-V 2.5 has now enhanced full-text OCR extraction, table-to-markdown conversion, and other high-utility capabilities, and has further strengthened its instruction-following and complex reasoning abilities, enhancing multimodal interaction experiences.

**OCR 能力强.** MiniCPM-Llama3-V 2.5 能处理任意长宽比, 最高 180 万像素 (比如 1344x1344) 的图像, **在 OCRBench 上拿到 700 以上的分数, 超过 GPT-4o, GPT-4V-0409, Qwen-VL-Max, Gemini Pro 等闭源模型**. 根据近期用户反馈, MiniCPM-Llama3-V 2.5 加强了全文 OCR 提取, 表格转 markdown 等高实用性能力, 并进一步提升了指令遵循和复杂推理能力, 改善多模态交互体验. 这一段从第 3 页跨到第 4 页, 半句已接回.

> **对一下:** 「700+」 和 「超过 GPT-4o, GPT-4V-0409」, 表里对得上吗?
> 分数对得上, 对手对不上. 表里 V 2.5 的 OCRBench 是 725, 符合 700+; 1344 × 1344 = 1,806,336 像素, 也符合 「180 万像素」. 但表里的 GPT-4V 是 2023.11.06 版, OCRBench 645, 不是这里说的 0409 版; GPT-4o 和 Qwen-VL-Max 表里都没有. 能在本页核实的只有 「725 高于 Gemini Pro 的 680 和 GPT-4V-1106 的 645」.

<!-- page 4 of 12 -->

**Trustworthy Behavior.** Leveraging the latest [RLAIF-V](https://github.com/RLHF-V/RLAIF-V/) method (the newest technology in the [RLHF-V](https://github.com/RLHF-V) [CVPR'24] series), MiniCPM-Llama3-V 2.5 exhibits more trustworthy behavior. It achieves 10.3% hallucination rate on Object HalBench, lower than GPT-4V-1106 (13.6%), achieving the best-level performance within the open-source community. [Data released](https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset).

**行为可信.** 借助最新的 RLAIF-V 方法 (RLHF-V [CVPR'24] 系列里最新的技术), MiniCPM-Llama3-V 2.5 的行为更可信. 它在 Object HalBench 上的幻觉率是 10.3%, 低于 GPT-4V-1106 的 13.6%, 在开源社区里达到最好水平. 数据已公开.

> **拆开:** 这里说幻觉率 10.3%, 越低越好; 第 5 页表里 Object HalBench 一列 V 2.5 却是 89.7, GPT-4V 是 86.4, 越高越好, 是两个指标吗?
> 是同一个指标的两种写法. 100 - 10.3 = 89.7, 100 - 13.6 = 86.4, 表里记的是 「不幻觉的比例」. 照这个换算, 表里 MiniCPM-V 2.0 的 85.5 对应幻觉率 14.5%, MiniCPM-V 1.0 的 78.4 对应 21.6%, Qwen-VL-Chat 的 56.2 对应 43.8%. V 2.5 比 V 2.0 降了 4.2 个百分点. 「开源最好」 在表里成立: 开源行里除 V 2.5 外只有 5 个模型有这一列分数, 最高的是 MiniCPM-V 2.0 的 85.5, V 2.5 的 89.7 高于它们全部.

**Multilingual Support.** Thanks to the strong multilingual capabilities of Llama 3 and the cross-lingual generalization technique from [VisCPM](https://github.com/OpenBMB/VisCPM), MiniCPM-Llama3-V 2.5 extends its bilingual (Chinese-English) multimodal capabilities to **over 30 languages including German, French, Spanish, Italian, Korean, Japanese etc.** [All Supported Languages](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5/blob/main/assets/minicpm-llama-v-2-5_languages.md).

**多语言支持.** 得益于 Llama 3 较强的多语言能力和 VisCPM 的跨语言泛化技术, MiniCPM-Llama3-V 2.5 把中英双语的多模态能力扩展到 **30 多种语言, 包括德语, 法语, 西班牙语, 意大利语, 韩语, 日语等**. 全部支持语言见链接.

**Efficient Deployment.** MiniCPM-Llama3-V 2.5 systematically employs **model quantization, CPU optimizations, NPU optimizations and compilation optimizations**, achieving high-efficiency deployment on edge devices. For mobile phones with Qualcomm chips, we have integrated the NPU acceleration framework QNN into llama.cpp for the first time. After systematic optimization, MiniCPM-Llama3-V 2.5 has realized a **150-fold acceleration in multimodal large model end-side image encoding** and a **3-fold increase in language decoding speed**.

**部署高效.** MiniCPM-Llama3-V 2.5 系统性地用上了**模型量化, CPU 优化, NPU 优化和编译优化**, 在边缘设备上实现高效部署. 针对搭载高通芯片的手机, 团队首次把 NPU 加速框架 QNN 集成进 llama.cpp. 经过系统优化, MiniCPM-Llama3-V 2.5 在端侧**多模态大模型图像编码上提速 150 倍**, **语言解码速度提升到 3 倍**.

> **确认:** 150 倍和 3 倍是跟什么比的?
> 本页没写. 没有基线 (是未优化的 llama.cpp, 纯 CPU, 还是别的实现), 没有设备型号, 没有提速前后的秒数或 token/s. 第 7 页的演示视频用的是小米 14 Pro, 但那段话没有和这两个倍数挂钩. 这两个数只能当作 「相对自家某个起点」 的说法, 不能和别家的端侧延迟直接比.

**Easy Usage.** MiniCPM-Llama3-V 2.5 can be easily used in various ways: (1) [llama.cpp](https://github.com/OpenBMB/llama.cpp/blob/minicpm-v2.5/examples/minicpmv/README.md) and [ollama](https://github.com/OpenBMB/ollama/tree/minicpm-v2.5/examples/minicpm-v2.5) support for efficient CPU inference on local devices, (2) [GGUF](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5-gguf) format quantized models in 16 sizes, (3) efficient [LoRA](https://github.com/OpenBMB/MiniCPM-V/tree/main/finetune#lora-finetuning) fine-tuning with only 2 V100 GPUs, (4) <u>streaming output</u>, (5) quick local WebUI demo setup with [Gradio](https://github.com/OpenBMB/MiniCPM-V/blob/main/web_demo_2.5.py) and [Streamlit](https://github.com/OpenBMB/MiniCPM-V/blob/main/web_demo_streamlit-2_5.py), and (6) interactive demos on [HuggingFace Spaces](https://huggingface.co/spaces/openbmb/MiniCPM-Llama3-V-2_5).

**易于使用.** MiniCPM-Llama3-V 2.5 有多种简便用法: (1) llama.cpp 和 ollama 支持在本地设备上高效 CPU 推理; (2) 16 种大小的 GGUF 格式量化模型; (3) 只用 2 张 V100 GPU 就能做高效 LoRA 微调; (4) 流式输出; (5) 用 Gradio 和 Streamlit 快速搭本地 WebUI 演示; (6) HuggingFace Spaces 上的交互式演示.

> **回看:** 这里说 GGUF 量化模型有 16 种大小, 第 1 页侧栏的 Quantizations 却只有 5 models, 哪个对?
> 两个数数的东西不同. 16 是官方 GGUF 仓库 MiniCPM-Llama3-V-2_5-gguf 里不同量化精度的文件个数; 侧栏的 5 是 Hugging Face 上把本模型登记为量化基座的独立仓库个数, 官方 GGUF 仓库本身只算其中一个. 另外第 10 页还有一个 int4 版本仓库. 这两个数不能互相校验.

Evaluation

评测. MinerU 把这个小节标题识别成普通文字, 放在第 4 页页尾.

<!-- page 5 of 12 -->

Results on TextVQA, DocVQA, OCRBench, OpenCompass MultiModal Avg , MME, MMBench, MMMU, MathVista, LLaVA Bench, RealWorld QA, Object HalBench.

在 TextVQA, DocVQA, OCRBench, OpenCompass 多模态平均分, MME, MMBench, MMMU, MathVista, LLaVA Bench, RealWorld QA, Object HalBench 上的结果.

> **停一下:** 这里列了 11 个基准, 上文说 OpenCompass 是 「覆盖 11 个常用基准的综合评测」, 是同一组 11 个吗?
> 不是. 这一行的 11 个名字里就包含 OpenCompass 本身, 它不可能是自己的组成部分. OpenCompass 那 11 个具体是哪些, 本页没列. 另外表里实际有 12 列分数, 因为 MMBench 拆成了 test (en) 和 test (cn) 两列. 两个 「11」 只是碰巧相同.

| Model | Size | OCRBench | TextVQA val | DocVQA test | Open-Compass | MME | MMB test (en) | MMB test (cn) | MMMU val | Math-Vista | LLaVA Bench | RealWorld QA | Object HalBench |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Proprietary** | | | | | | | | | | | | | |
| Gemini Pro | - | 680 | 74.6 | 88.1 | 62.9 | 2148.9 | 73.6 | 74.3 | 48.9 | 45.8 | 79.9 | 60.4 | - |
| GPT-4V (2023.11.06) | - | 645 | 78.0 | 88.4 | 63.5 | 1771.5 | 77.0 | 74.4 | 53.8 | 47.8 | 93.1 | 63.0 | 86.4 |
| **Open-source** | | | | | | | | | | | | | |
| Mini-Gemini | 2.2B | - | 56.2 | 34.2* | - | 1653.0 | - | - | 31.7 | - | - | - | - |
| Qwen-VL-Chat | 9.6B | 488 | 61.5 | 62.6 | 51.6 | 1860.0 | 61.8 | 56.3 | 37.0 | 33.8 | 67.7 | 49.3 | 56.2 |
| DeepSeek-VL-7B | 7.3B | 435 | 64.7* | 47.0* | 54.6 | 1765.4 | 73.8 | 71.4 | 38.3 | 36.8 | 77.8 | 54.2 | - |
| Yi-VL-34B | 34B | 290 | 43.4* | 16.9* | 52.2 | 2050.2 | 72.4 | 70.7 | 45.1 | 30.7 | 62.3 | 54.8 | 79.3 |
| CogVLM-Chat | 17.4B | 590 | 70.4 | 33.3* | 54.2 | 1736.6 | 65.8 | 55.9 | 37.3 | 34.7 | 73.9 | 60.3 | 73.6 |
| TextMonkey | 9.7B | 558 | 64.3 | 66.7 | - | - | - | - | - | - | - | - | - |
| Idefics2 | 8.0B | - | 73.0 | 74.0 | 57.2 | 1847.6 | 75.7 | 68.6 | 45.2 | 52.2 | 49.1 | 60.7 | - |
| Bunny-LLama-3-8B | 8.4B | - | - | - | 54.3 | 1920.3 | 77.0 | 73.9 | 41.3 | 31.5 | 61.2 | 58.8 | - |
| LLaVA-NeXT Llama-3-8B | 8.4B | - | - | 78.2 | - | 1971.5 | - | - | 41.7 | 37.5 | 80.1 | 60.0 | - |
| Phi-3-vision-128k-instruct | 4.2B | 639* | 70.9 | - | - | 1537.5* | - | - | 40.4 | 44.5 | 64.2* | 58.8* | - |
| MiniCPM-V 1.0 | 2.8B | 366 | 60.6 | 38.2 | 47.5 | 1650.2 | 64.1 | 62.6 | 38.3 | 28.9 | 51.3 | 51.2 | 78.4 |
| MiniCPM-V 2.0 | 2.8B | 605 | 74.1 | 71.9 | 54.5 | 1808.6 | 69.1 | 66.5 | 38.2 | 38.7 | 69.2 | 55.8 | 85.5 |
| **MiniCPM-Llama3-V 2.5** | 8.5B | 725 | 76.6 | 84.8 | 65.1 | 2024.6 | 77.2 | 74.2 | 45.8 | 54.3 | 86.7 | 63.5 | 89.7 |

评测表. 列依次是: 模型, 参数规模, OCRBench, TextVQA 验证集, DocVQA 测试集, OpenCompass, MME, MMBench 英文测试集, MMBench 中文测试集, MMMU 验证集, MathVista, LLaVA Bench, RealWorld QA, Object HalBench. 上半部分是闭源 (Proprietary), 下半部分是开源 (Open-source); 最后三行 MiniCPM 系列在网页上用浅蓝底色标出. 加粗按 PDF 页面图像补录: V 2.5 一行除 MME 外全部加粗, MME 一列加粗的是 Yi-VL-34B 的 2050.2, 可见加粗表示开源模型里的最高分. 「-」 表示没有数据. MinerU 转出的是 HTML 表格, 这里改写成 Markdown, 数字逐格对过页面图像.

> **看表:** V 2.5 标榜 「GPT-4V 级」, 和表里的 GPT-4V (2023.11.06) 逐列比, 赢几列输几列?
> 12 列里赢 7 列, 输 5 列. 赢的是 OCRBench 725 对 645, OpenCompass 65.1 对 63.5, MME 2024.6 对 1771.5, MMB 英文 77.2 对 77.0, MathVista 54.3 对 47.8, RealWorld QA 63.5 对 63.0, Object HalBench 89.7 对 86.4. 输的是 TextVQA 76.6 对 78.0, DocVQA 84.8 对 88.4, MMB 中文 74.2 对 74.4, MMMU 45.8 对 53.8, LLaVA Bench 86.7 对 93.1. 其中 MMB 英文和 RealWorld QA 只赢 0.2 和 0.5, MMMU 输 8.0 分, 差距最大. 「GPT-4V 级」 是 「互有胜负, 平均分略高」 的意思.

> **再看:** 表里一批格子带星号, 比如 Yi-VL-34B 的 DocVQA 16.9*, Phi-3-vision 的 OCRBench 639*, 星号什么意思?
> 本页没有脚注解释星号. 带星号的 10 格都在别家模型上: Mini-Gemini 的 DocVQA, DeepSeek-VL-7B 的 TextVQA 和 DocVQA, Yi-VL-34B 的 TextVQA 和 DocVQA, CogVLM-Chat 的 DocVQA, Phi-3-vision 的 OCRBench, MME, LLaVA Bench, RealWorld QA; MiniCPM 三行一个星号都没有. 常见写法是 「这个数由本团队自己测, 不是对方公布的」, 但这 12 页里找不到依据, 只能说这些格和不带星号的格来源可能不同. Yi-VL-34B 的 DocVQA 只有 16.9, 远低于同表其他模型, 这类格子不宜单独拿来下结论.

> **想:** 上文说 V 2.5 「大幅领先其他基于 Llama 3 的多模态大模型」, 表里有两个 Llama 3 模型, 每列都大幅领先吗?
> 大部分列领先明显, 有一列几乎打平. 对 Bunny-LLama-3-8B: OpenCompass 65.1 对 54.3, MMMU 45.8 对 41.3, MathVista 54.3 对 31.5, LLaVA Bench 86.7 对 61.2, 差距都很大; 但 MMB 英文 77.2 对 77.0 只差 0.2, MMB 中文 74.2 对 73.9 只差 0.3. 对 LLaVA-NeXT Llama-3-8B: DocVQA 84.8 对 78.2, LLaVA Bench 86.7 对 80.1, MME 2024.6 对 1971.5. 还有一点: MME 这一列 V 2.5 不是开源第一, Yi-VL-34B 的 2050.2 更高, 所以只有这一格没加粗; 闭源的 Gemini Pro 2148.9 也高于它.

## Evaluation results of multilingual LLaVA Bench (多语言 LLaVA Bench 评测结果)

多语言 LLaVA Bench 的评测结果.

![多语言 LLaVA Bench 分组柱状图: 16 种语言, 每种语言三根柱子, 蓝色 Yi-VL 34B, 橙色 Phi-3-vision-128k-instruct, 绿色 MiniCPM-Llama3-V 2.5 8B; 纵轴 LLaVA Bench Score 0 到 110. 绿柱依次为英语 86.7, 俄语 104.4, 日语 88.0, 越南语 87.0, 葡萄牙语 77.6, 德语 75.6, 罗马尼亚语 75.6, 法语 74.5, 西班牙语 74.3, 捷克语 71.6, 匈牙利语 70.9, 土库曼语 69.6, 韩语 67.9, 泰语 61.9, 拉脱维亚语 58.4, 塞尔维亚语 42.5; 每种语言绿柱都最高](images/p05-examples.png)

图中三组数据. Yi-VL 34B (蓝): 英语 62.3, 俄语 28.7, 日语 24.5, 越南语 37.6, 葡萄牙语 37.2, 德语 36.0, 罗马尼亚语 25.2, 法语 47.4, 西班牙语 49.4, 捷克语 32.6, 匈牙利语 25.3, 土库曼语 37.2, 韩语 29.4, 泰语 23.7, 拉脱维亚语 23.0, 塞尔维亚语 23.7. Phi-3-vision-128k-instruct (橙): 英语 64.2, 俄语 63.9, 日语 53.3, 越南语 33.5, 葡萄牙语 44.2, 德语 49.3, 罗马尼亚语 22.9, 法语 44.5, 西班牙语 53.3, 捷克语 17.5, 匈牙利语 18.9, 土库曼语 50.9, 韩语 27.8, 泰语 13.4, 拉脱维亚语 28.0, 塞尔维亚语 36.2. MinerU 把这张图命名为 examples, 是按图下方的小节标题起的名.

> **问:** 俄语那根绿柱是 104.4, 超过 100 了, 这个分数是百分比吗?
> 不是百分比, 但本页没有解释分数怎么算. 能核对的是英语三根柱子: 86.7, 62.3, 64.2 正好等于评测表 LLaVA Bench 列里 V 2.5, Yi-VL-34B, Phi-3-vision 的分数 (Phi-3 那格在表里带星号), 所以这张图的英语组就是表里那一列. 分数能超过 100, 只能说明它不是正确率, 更像是相对某个参照打出的比值, 参照是什么本页没写. 俄语比英语还高 17.7 分, 这个现象本页也没有说明原因, 不宜读成 「俄语能力强于英语」.

> **核对:** 正文点名 「德语, 法语, 西班牙语, 意大利语, 韩语, 日语」, 图里这 16 种语言都有吗?
> 意大利语没有, 中文也没有. 图里 16 种语言是英, 俄, 日, 越, 葡, 德, 罗, 法, 西, 捷, 匈, 土库曼, 韩, 泰, 拉脱维亚, 塞尔维亚. 正文说支持 「30 多种」, 图只测了 16 种; 中文作为原本的双语之一, 在表里另有 MMB 中文一列 74.2. 16 种语言里 V 2.5 最低的是塞尔维亚语 42.5, 只比 Phi-3 的 36.2 高 6.3, 是差距最小的一组.

Examples

示例. 这个小节标题在第 5 页页尾, 示例内容全在第 6 页.

<!-- page 6 of 12 -->

第 6 页整页是一张拼图, PDF 没有文字层, 下面的文字全部来自 MinerU 对图片的识别, 按页面图像校对过. 拼图分四个示例, 每个示例是 「左边输入图片 + 用户提问 + MiniCPM-Llama3-V 2.5 的回答」. MinerU 从拼图里切出的头像小图按附近文字命名, 名字和内容无关, 这里按示例重新归位.

**Example 1: OCR of a news web page.**

**示例 1: 识别新闻网页里的文字.**

![输入图片里新闻配图: 迈泰奥拉的砂岩石柱群和山顶修道院, 夕阳从云层后照出, 右下角水印 Chris Karagkelis](images/p06-credit-chris-karagkelis.png)

Unesco announces its newest geoparks around the world

9 April 2024

By Lynn Brown, Features correspondent

Unesco Geoparks represent a balance of unique geological features, cultural touchpoints and a focus on sustainability (Credit: Chris Karagkelis)

From dinosaur fossils in Brazil to the soaring monasteries of Meteora, these 18 new geological sites highlight a particular region's natural, cultural and intangible heritage.

Travellers interested in deep dives into geology, culture and sustainability have several new destinations to place on their bucket lists. Unesco just announced the designation of 18 new Global Geoparks, bringing the total to 213 sites representing 48 countries around the world.

From crystal-clear karst lakes to an archipelago formed during the last ice age, these parks are more than just sites with unique geological features; they also serve to highlight a particular region's natural, cultural and intangible heritage. "Unesco Global Geoparks represent landscapes where internationally significant geological heritage intertwines with human history and supports rich biodiversity," explains António Abreu, director of the Division of Ecological and Earth Sciences at Unesco. "Each new geopark tells a unique story, using geology as its lens.

Here are five of the newest geoparks on Unesco's list:

输入图片是一篇英文新闻网页截图. 标题: 联合国教科文组织公布全球最新一批地质公园. 日期 2024 年 4 月 9 日, 作者 Lynn Brown, 专题记者. 图注: 教科文组织地质公园兼顾独特的地质特征, 文化看点和对可持续发展的重视 (摄影: Chris Karagkelis). 正文: 从巴西的恐龙化石到迈泰奥拉高耸的修道院, 这 18 处新的地质遗址展示了一个地区的自然, 文化和非物质遗产. 对地质, 文化和可持续发展感兴趣, 想深入了解的旅行者, 愿望清单上又可以添几个新目的地了. 教科文组织刚刚宣布新认定 18 处世界地质公园, 总数达到 213 处, 分布在全球 48 个国家. 从清澈见底的喀斯特湖泊到末次冰期形成的群岛, 这些公园不只是有独特地质特征的地方, 也在展示一个地区的自然, 文化和非物质遗产. 「教科文组织世界地质公园代表了这样的景观: 具有国际意义的地质遗产与人类历史交织在一起, 并孕育着丰富的生物多样性,」 教科文组织生态与地球科学司司长 António Abreu 解释说, "每一座新地质公园都以地质为视角, 讲述一个独特的故事. 下面是教科文组织名单上五座最新的地质公园: 原图图注那一句 MinerU 没有识别出来, 按页面图像补录; 引号在原网页截图里就没有闭合.

![用户头像: 一个人形线框图标](images/p06-please-identify-the-text-in-the-picture.png)

Please identify the text in the picture.

用户提问: 请识别图片中的文字.

![模型头像: 一个机器人线框图标](images/p06-minicpm-llama3-v-2-5-2.png)

MiniCPM-Llama3-V 2.5

模型回答如下.

Title:

Unesco announces its newest geoparks around the world

Date and Author:

9 April 2024

By Lynn Brown, Features correspondent

Image Caption:

Unesco Geoparks represent a balance of unique geological features, cultural touchpoints and a focus on sustainability (Credit: Chris Karagelis)

Body Text:

From dinosaur fossils in Brazil to the soaring meteors of Meteora, these 18 new geological sites highlight a particular region's natural, cultural and intangible heritage.

Travellers interested in deep dives into geology, culture and sustainability have several new destinations to place on their bucket list. Unesco just announced the designation of 18 new Global Geoparks, bringing the total to 213 sites representing 48 countries around the world.

From crystal-clear karst lakes to an archipelago formed during the last ice age, these parks are more than just unique geological features; they also serve to highlight a particular region's natural, cultural and intangible heritage. Unesco Global Geoparks represent landscapes where internationally significant geological heritage intertwines with human history and supports rich biodiversity, explains António Abreu, director of the Division of Ecological Sciences at Unesco. "Each new geopark tells a unique story, using geology as its lens."

Here are five of the newest geoparks on Unesco's list:

模型把识别结果分成四栏: 标题; 日期和作者 (2024 年 4 月 9 日, Lynn Brown, 专题记者); 图注 (摄影署名写成 Chris Karagelis); 正文. 正文逐段复述原文, 意思同上一段译文, 差异见下面的疑问.

> **对一下:** 这是模型卡拿来展示 OCR 能力的例子, 模型的输出和原图逐字对得上吗?
> 有五处对不上. 原文 「soaring monasteries of Meteora」 (高耸的修道院) 被读成 「soaring meteors」 (高耸的流星); 摄影署名 Karagkelis 少了一个 k, 写成 Karagelis; 「Division of Ecological and Earth Sciences」 丢了 「and Earth」; 「more than just sites with unique geological features」 丢了 「sites with」; 「bucket lists」 变成单数 「bucket list」. 另外原文 Abreu 那句话的前半句有引号, 模型把引号去掉了. 数字 18, 213, 48 和日期都读对了. 展示例子里还留着错字, 说明 「全文 OCR」 在长段英文上仍会把形近词换成常见词.

**Example 2: Summarizing a Chinese article.**

**示例 2: 总结中文文章要点.**

![示例 2 整体截图: 左侧三栏是一篇中文公众号文章 "面壁Ultra对齐技术 大模型上分神器!" 的长截图, 部分句子用红线标出; 中间有两张 UltraInteract 交互流程和偏好树示意图, 两条英文推文截图和一张 RewardBench 排行榜截图; 右侧是用户提问 "请详细总结图片中文章的要点" 和模型的六条中文总结, 右下角有灰色斜体说明](images/p06-minicpm-llama3-v-2-5.png)

面壁Ultra对齐技术 大模型上分神器!

本次大模型「理科状元」 Eurux-8x22B 的优异表现, 得益于来自面壁 Ultra 对齐技术的大规模, 高质量对齐数据集 UltraInteract 上新. 好数据, 才有好模型. 此前, 面壁 Ultra 对齐技术已经「强壮」了全球超 200 个大模型, 堪称大模型上分神器.

传送门 GitHub 链接 https://github.com/OpenBMB/Eurus

UltraInteract 是专门设计用于提升大模型推理能力的大规模, 高质量的对齐数据集, 包含了覆盖数学, 代码和逻辑推理问题的 12 个开源数据集的 86k 条指令和 220k 偏好对, 共有五十万(条)左右数据. 相比而言, Llama3-70B 模型则使用了千万量级的对齐数据, 这从侧面证明了 UltraInteract 数据集的优质性, 数据质量胜过数据数量.

如此高质量的对齐数据是如何构建的呢?

严格质量控制和筛选. 首先, 我们从多个开源数据集中抽样出难度较高, 考察多样推理能力的 86k 复杂推理问题, 并使用多个模型来采样答案. 通过自动化格式检查和人工质量抽查结合的方式保证了答案格式的一致性和内容的正确性.

逐步推理. 对于每条指令, 模型都会按照 CoT 格式进行逐步推理 (如下图①), 生成格式统一但模式多样的推理过程.

多轮交互. 在模型给出推理过程之后, 会自动与答案对比确定推理过程是否正确 (如下图②), 如果不正确, UltraInteract 会使用另一个批评模型 (如下图③) 指出错误并给出改进建议, 生成新的逐步推理 (如下图④), 再与策略模型进行多轮交互 (如下图⑤⑥), 直到答案正确或达到轮数上限为止. 这一步有助于模型学会反思和改错能力, 在实际表现中可以更好地和人进行多轮交互问答.

图注: UltraInteract 两轮交互的过程.

首创偏好树结构. 为了深入探究偏好学习在复杂推理中的作用, UltraInteract 还为每个问题都构建了一棵偏好树 (如下图所示), 其中问题作为根节点, 每个回复作为一个子节点, 每一轮生成两个节点 (一对一错相配对). 所有正确推理对应的节点都可以用于 SFT, 而配对的节点则可以用于偏好学习.

图注: UltraInteract (第三列) 是当前唯一一个树状结构的对齐数据集.

除了 UltraInteract 数据集的大力加持, 偏好对齐也对 Eurux-8x22B 的推理性能提升有所帮助. 我们发现, 在推理任务中, 提升正确答案的奖励值对于偏好对齐的效果十分重要, 因为正确答案的空间比错误答案更有限, 因此更加重要, 模型在训练过程中不能偏离正确答案. 然而, 当前流行的 DPO 算法会使正确答案和错误答案的奖励值共同降低, 因此在实验中效果不佳. 我们采用另外两种偏好对齐算法 KTO 和 NCA, 取得了更好的效果, 能在 SFT 的基础上进一步提升模型性能.

UltraInteract 数据集开源后在社区受到了广泛好评.

高效大模型工厂

从领先的端侧模型「小钢炮」 MiniCPM, 到开源模型推理新 SOTA 的 Eurux-8x22B, 为什么我们总能推出同等参数, 性能更优的「高效大模型」?

答案是, 大模型是一项系统工程, 而我们作为国内极少数兼具大模型算法与 Infra 能力的团队, 拥有自研的全流程高效生产线:

面壁 Ultra 对齐技术, Infra 工艺, 独家「模型沙盒」实验和现代化数据工厂, 从数据, 训练到调校工艺环环相扣, 一条优秀的大模型 Scaling Law 增长曲线由此而生.

Infra 工艺方面, 我们构建了全流程优化加速工具套件平台 ModelForce, 可以实现 10 倍推理加速, 90% 成本降低.

上面是示例 2 输入图片里的中文文章, 原文就是中文, 不再意译. MinerU 的识别有不少错字 (把 UltraInteract 识别成 Ultralnteract, 「筛选」 识别成 「德选」, 「覆盖」 识别成 「圈盖」, 「偏离」 识别成 「偏画」, 「奖励值」 识别成 「奖助值」, 「帮助」 识别成 「裂助」, Eurux 识别成 Furux 等), 这里按页面图像校正, 标点改成英文标点. 最后一句 ModelForce 那段 MinerU 漏识别, 按页面图像补录; 其中 10 倍, 90% 是这篇文章对自家工具平台的说法, 和 MiniCPM-Llama3-V 2.5 的指标无关. 两条推文截图 (Daniel van Strien 和 Nathan Lambert) 与 RewardBench 截图里的英文字号太小, MinerU 没有识别, 这里不录.

请详细总结图片中文章的要点

用户提问: 请详细总结图片中文章的要点.

MiniCPM-Llama3-V 2.5

这张图片是一篇关于面壁Ultra对齐技术的文章摘要. 以下是文章的要点:

1. 面壁Ultra介绍: 面壁Ultra是专门设计用于提升大模型推理能力的大规模, 高质量对齐数据集的工具, 包含了逻辑数学, 代码推理问题的12个开源数据集的86k条指令和220k个偏好对.

2. 面壁Ultra对齐数据集的特点: 面壁Ultra提供了一个包含多种类型对齐数据集的平台, 这些数据集经过严格质量控制和筛选, 确保了数据的可靠性和多样性.

3. 推理过程中的挑战: 在推理过程中, 面壁Ultra通过自动化格式检查和人工质量检查保证了推理的准确性和效率.

4. 模型推理的优化: 面壁Ultra推理SOTA (State-Of-The-Art) 的Eurux-8x22B模型, 并展示了它在推理任务中的表现.

5. 模型推理的复杂性和效率: 面壁Ultra使用了多轮交互的方式来提高模型推理的效率和准确性. 这包括了在推理过程中不断调整参数以达到最佳性能.

6. 面壁Ultra的优势: 文章提到面壁Ultra作为一个系统工程, 拥有自研的全流程高生产效率线, 这使得它能够快速地进行模型推理和优化.

综上所述, 面壁Ultra是一个专注于推进自然语言处理领域对齐数据集的平台, 旨在为模型推理提供更高效和准确的解决方案.

模型的中文回答, 原文就是中文, 按页面图像录入, 标点改成英文标点. MinerU 把其中几处 「Ultra」 识别成 「UItra」, 这里统一.

\* The colored underlines are for illustration purposes only and are not used as model input.

\* 彩色下划线只为示意, 没有作为模型输入. 也就是说, 左边文章里的红线是做展示图时后加的, 标出和回答各条对应的原句, 模型看到的是没有红线的原图.

> **拆开:** 六条总结和原文逐条对照, 哪些是文章里有的, 哪些是模型加的?
> 数字都对: 12 个数据集, 86k 条指令, 220k 偏好对. 主语错了: 原文里 「专门设计用于提升大模型推理能力的数据集」 是 UltraInteract, 面壁 Ultra 是对齐技术的名字, 模型把两者合成 「面壁Ultra是...数据集的工具」, 结尾又说它是 「平台」. 第 1 条 「逻辑数学, 代码推理问题」 把原文 「数学, 代码和逻辑推理」 的顺序搅乱了. 第 5 条 「不断调整参数以达到最佳性能」 原文没有, 原文的多轮交互是批评模型指错, 策略模型重写. 第 6 条把 「大模型是一项系统工程」 和 「团队拥有自研生产线」 两句的主语都换成了面壁 Ultra. 原文里 DPO, KTO, NCA 的对比和偏好树这两个最有信息量的段落, 六条里都没提.

**Example 3: Converting a table image to Markdown.**

**示例 3: 把表格图片转成 Markdown.**

| 模型名称 | 发布时间 | 发布机构 | 语言 | 参数规模 | Tokens规模 | 模型结构 | 是否开源 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T5 | 2019-10 | Google | 英 | 13B |  | T5-style | √ |
| GPT-3 | 2020-05 | OpenAI | 英 | 175B | 300B | GPT-style | × |
| LaMDA | 2021-05 | Google | 英 | 137B | 2.8T | GPT-style | × |
| Jurassic | 2021-08 | AI21 | 英 | 178B | 300B | GPT-style | × |
| MT-NLG | 2021-10 | Microsoft、NVIDIA | 英 | 530B | 270B | GPT-style | × |
| ERNIE 3.0 Titan | 2021-12 | Baidu | 中 | 260B | 300B | Multi-task | × |
| Gopher | 2021-12 | DeepMind | 英 | 280B | 300B | GPT-style | × |
| Chinchilla | 2022-04 | DeepMind | 英 | 70B | 1.4T | GPT-style | × |
| PaLM | 2022-04 | Google | 多语言 | 540B | 780B | GPT-style | × |
| OPT | 2022-05 | Meta | 英 | 125M-175B | 180B | GPT-style | √ |
| BLOOM | 2022-07 | BigScience | 多语言 | 176B | 366B | GPT-style | √ |
| GLM-130B | 2022-08 | Tsinghua | 中、英 | 130B | 400B | GLM-style | √ |
| LLaMA | 2023-02 | Meta | 多语言 | 7B-65B | 1.4T | GPT-style | √ |

上面是示例 3 的输入图片: 一张中文表格, 列出 2019 到 2023 年的 13 个大语言模型, 列为模型名称, 发布时间, 发布机构, 语言, 参数规模, Tokens 规模, 模型结构, 是否开源. 表格内容照图片录入, 单元格里的顿号保留原样. MinerU 的识别有三处错: ERNIE 3.0 Titan 一行漏了 Tokens 规模 300B, 模型结构 Multi-task 识别成 Multi-tank, 表头 「Tokens规模」 识别成 「Token-规模」; 另把 PaLM 写成 PalM. 这里按页面图像更正.

![用户头像: 一个人形线框图标](images/p06-image.png)

请将表格转成 markdown 格式

用户提问: 请将表格转成 markdown 格式.

![模型头像: 一个机器人线框图标](images/p06-by-lynn-brown-features-correspondent.png)

MiniCPM-Llama3-V 2.5

```txt
| 模型名称 | 发布时间 | 发布机构 | 语言 | 参数规模 | Tokens规模 | 模型结构 | 是否开源 |
| -------- | -------- | -------- | ---- | -------- | -------- | -------- | -------- |
| T5 | 2019-10 | Google | 英 | 13B | | T5-style | √ |
| GPT-3 | 2020-05 | OpenAI | 英 | 175B | 300B | GPT-style | × |
| LaMDA | 2021-05 | Google | 英 | 137B | 2.8T | GPT-style | × |
| Jurassic | 2021-08 | AI21 | 英 | 178B | 300B | GPT-style | × |
| MT-NLG | 2021-10 | Microsoft, NVIDIA | 英 | 530B | 270B | GPT-style | × |
| ERNIE 3.0 | 2021-12 | Baidu | 中 | 260B | 300B | Multi-task | × |
| Gopher | 2021-12 | DeepMind | 英 | 280B | 300B | GPT-style | × |
| Chinchilla | 2022-04 | DeepMind | 英 | 70B | 1.4T | GPT-style | × |
| PaLM | 2022-04 | Google | 多语言 | 540B | 7.8/80B | GPT-style | × |
| OPT | 2022-05 | Meta | 英 | 125M-175B | 180B | GPT-style | √ |
| BLOOM | 2022-07 | BigScience | 多语言 | 176B | 366B | GPT-style | √ |
| GLM-130B | 2022-08 | Tsinghua | 中、英 | 130B | 400B | GLM-style | √ |
| LLaMA | 2023-02 | Meta | 多语言 | 7B-65B | 1.4T | GPT-style | √ |
```

模型输出的 Markdown 表格, 按页面图像逐行录入, 保留原样. MinerU 把它压成了一整行, 这里按图恢复换行; 模型原输出里各列用空格对齐, 这里没有保留对齐空格.

> **确认:** 模型转出的表和输入图片逐格一致吗?
> 13 行 8 列里有两格错, 一格改了写法. PaLM 的 Tokens 规模原图是 780B, 输出成 「7.8/80B」; ERNIE 3.0 Titan 的名字输出成 「ERNIE 3.0」, 丢了 Titan; MT-NLG 发布机构一格里 Microsoft 和 NVIDIA 之间的顿号换成了英文逗号, 算不上错. T5 的 Tokens 规模原图就是空的, 输出也留空, 这一格处理对了. 有意思的是 MinerU 识别同一张输入图时在 ERNIE 那一行错得更多 (漏 300B, Multi-tank), 模型反而把这两格读对了.

**Example 4: Explaining a flowchart.**

**示例 4: 解释一张流程图.**

How does UltraEval work? · Data preparation: Raw data (Knowledge, Code, ...) ← Collect ← Official data source (Hugging Face, GitHub, ...) · Evaluation process: Prompt input → Model deployment → Post-process → Metric calculation → Score; Prompt input → Metric calculation · Model support: API ..., Local URL, vLLM/Torch, HF Model, Custom Model

输入图片是一张英文流程图, 标题 「UltraEval 是怎么工作的?」. 左栏 「数据准备」: 原始数据 (知识, 代码等) 由官方数据源 (Hugging Face, GitHub 等) 收集而来. 中栏 「评测流程」: 提示输入, 模型部署, 后处理, 指标计算, 得分. 右栏 「模型支持」: 上方是 API 和本地 URL, 下方是 HF 模型和自定义模型, 两者之间标着 vLLM/Torch, 箭头指向中栏的模型部署. MinerU 把流程图里的文字识别成一整行, 这里按图分栏整理; 这张流程图没有被切成单独的图片文件.

How does it work?

用户提问: 它是怎么工作的?

![模型头像: 一个机器人线框图标](images/p06-the-colored-underlines-are-for-illustration-purposes.png)

MiniCPM-Llama3-V 2.5

模型头像和名字在第 6 页页尾, 回答框在第 7 页顶部.

<!-- page 7 of 12 -->

UltraEval appears to be a system or process designed to evaluate data, likely in the context of a scientific or research project. The flowchart outlines the steps involved in this process:

UltraEval 看起来是一个用于评估数据的系统或流程, 可能用于科学或研究项目. 流程图列出了这一流程的几个步骤:

**1. Data Preparation:** This stage involves collecting and organizing raw data, which can come from official data sources such as GitHub or Hugging Face. These are represented by icons indicating their origin.

**1. 数据准备:** 这一阶段收集并整理原始数据, 数据可以来自 GitHub 或 Hugging Face 等官方数据源. 图中用表示来源的图标来标示它们.

**2. Evaluation Process:** After the data is prepared, it undergoes an evaluation process that includes several steps:

**2. 评测流程:** 数据准备好后, 进入包含以下几步的评测流程:

- **Prompt Input:** This could involve providing prompts or instructions for the model.
- **Model Deployment:** Here, the model is likely trained or configured to perform evaluations based on the input.
- **Local URL:** This step may involve accessing or using a local URL, possibly for deploying the model or retrieving results.
- **Post-process:** This could refer to further processing of the model's output, such as cleaning, filtering, or formatting data.

- **提示输入:** 可能是给模型提供提示或指令.
- **模型部署:** 这里模型大概会被训练或配置, 以便根据输入执行评测.
- **本地 URL:** 这一步可能是访问或使用一个本地 URL, 也许用于部署模型或取回结果.
- **后处理:** 可能指对模型输出做进一步处理, 比如清洗, 过滤或格式化数据.

**3. Metric Calculation:** Following the post-process, metrics are calculated to evaluate the performance of the model. This is indicated by a graph icon, suggesting quantitative analysis.

**3. 指标计算:** 后处理之后计算指标, 评估模型表现. 图中用一个图表图标表示, 意味着定量分析.

**4. Score:** The final stage is to determine the score, which is likely the outcome of the metric calculation. This score would reflect the model's performance or the quality of the data after evaluation.

**4. 得分:** 最后一步是确定得分, 它大概是指标计算的结果. 这个分数反映模型的表现, 或评测后数据的质量.

**5. Model Support:** Throughout the process, there is support for various models, including vLLM/Torch, HF Model, and Custom Model. These models are likely used at different stages of the evaluation process.

**5. 模型支持:** 整个流程中支持多种模型, 包括 vLLM/Torch, HF 模型和自定义模型. 这些模型大概在评测流程的不同阶段使用.

In summary, UltraEval seems to be a structured approach to evaluating data using machine learning models, with a focus on performance metrics and customization options for different types of models.

总之, UltraEval 看起来是一套用机器学习模型评估数据的结构化方法, 侧重性能指标, 并为不同类型的模型提供定制选项.

这段回答在第 7 页顶部的回答框里. MinerU 只识别出第 4, 5 两条, 开头说明, 第 1 到 3 条和结尾总结按页面图像补录.

> **回看:** 回答把 「Local URL」 放进了评测流程的步骤里, 流程图上它在哪?
> 在右栏 「Model support」 里, 和 「API」 放在一起, 是被评测模型的一种接入方式, 不是评测流程的一步. 回答列模型支持时又只写了 vLLM/Torch, HF Model, Custom Model, 漏了 API. 还有两处说法偏了: 把 「Model deployment」 解释成 「模型大概会被训练」, 流程图里没有训练环节; 开头说 UltraEval 「评估数据」, 其实流程图的终点是给模型打分, 数据只是评测集. 通篇 likely 出现 4 次, could 2 次, may, possibly, appears, seems 各 1 次, 基本是看图猜意思; 同一页的 OCR 示例错的是个别词, 这里错的是结构, 读流程图比读文字弱.

We deploy MiniCPM-Llama3-V 2.5 on end devices. The demo video is the raw screen recording on a Xiaomi 14 Pro without edition.

我们把 MiniCPM-Llama3-V 2.5 部署在端侧设备上. 演示视频是在小米 14 Pro 上的原始录屏, 未经剪辑.

![小米 14 Pro 上两张 App 截屏: 标题栏 MiniCPM-Llama3-V_2.5. 左屏 12:42, 顶部显示 Current memory: 10.66 GB / 15.95 GB, 用户发了一张北京到上海的 D705 次火车票照片, 提问 "请提取图片中的起点站、终点站、出发时间、价格等信息，并按照json格式输出。", 回答区只有一个空的加载框. 右屏 11:03, Current memory: 9.79 GB / 15.95 GB, 用户发了一张亚洲饮食金字塔图, 提问 Based on this picture, make a detailed dinner meal plan for me., 回答刚开始流式输出 Based on the image, a detailed dinner](images/p07-image.png)

截图是演示视频的两帧. 左屏的提问: 请提取图片中的起点站, 终点站, 出发时间, 价格等信息, 并按 json 格式输出. 右屏的提问: 根据这张图, 给我做一份详细的晚餐计划. 回答框里只露出开头 「根据这张图片, 一份详细的晚餐」, 说明是逐字流式输出的中间状态. 火车票上的日期, 票价等小字较糊, 这里不录.

> **停一下:** 截屏顶部的 「Current memory: 10.66 GB / 15.95 GB」 是模型占的内存吗?
> 看不出来. 这一行是演示 App 显示的当前内存读数, 分母 15.95 GB 应是手机可用总内存, 分子是否只算模型, 截图没说明. 两屏分别是 10.66 GB 和 9.79 GB, 第 8 页四屏是 10.85, 11.24, 9.89, 10.73 GB, 波动约 1.45 GB. 第 10 页说 int4 版本用 8GB 左右显存, 那是 GPU 上的数, 手机上跑的是 llama.cpp 版本, 两个数不能互相推.

<!-- page 8 of 12 -->

![同一 App 四张截屏, 当前内存读数依次为 10.85 GB, 11.24 GB, 9.89 GB, 10.73 GB (分母都是 15.95 GB). 第一屏图片是斗牛士和公牛, 输入框里西班牙语 "por favor presenta este deporte"; 第二屏是夜景里的哥特式教堂, 俄语 "Что это за здание? для чего обычно используется?"; 第三屏是哆啦 A 梦和大雄等动画角色, 日语 "この画像はどのアニメから来たものですか?詳しく説明してください"; 第四屏是一锅石锅拌饭, 韩语 "사진 속 음식 만드는 법을 알려주세요."](images/p08-demo.png)

四屏的提问分别是: 请介绍一下这项运动 (西班牙语); 这是什么建筑? 通常用来做什么? (俄语); 这张图出自哪部动画? 请详细说明 (日语); 请告诉我图中食物的做法 (韩语). 四条都还在输入框里, 截图里没有模型回答. MinerU 把这张图命名为 demo, 是按下面的小节标题起的名.

## Demo (演示)

演示.

Click here to try out the Demo of [MiniCPM-Llama3-V 2.5](https://huggingface.co/spaces/openbmb/MiniCPM-Llama3-V-2_5).

点这里试用 MiniCPM-Llama3-V 2.5 的在线演示.

**Deployment on Mobile Phone**

**手机端部署.** MinerU 在这个标题和下面几个标题前识别出的 $\mathcal { Q }$ 是网页上链接锚点图标的残形, 已删去.

Coming soon.

即将推出.

> **再看:** 这里写手机部署 「Coming soon」, 上一页却放了小米 14 Pro 的实机录屏, 新闻里还说官方 llama.cpp 已完整支持, 到底能不能在手机上跑?
> 能. 「Coming soon」 是 2024 年 5 月发布时的原文, 后来没有更新. 同一页里能证明手机可跑的有三处: 第 4 页说已把高通 QNN 集成进 llama.cpp, 第 7 到 8 页是小米 14 Pro 的原始录屏, 第 2 页新闻说 2024.08.10 官方 llama.cpp 已完整支持并提供多种大小的 GGUF. 这一行和第 3 页 「latest model」 一样, 是正文没跟着新闻更新留下的旧文字.

**Usage**

**用法.**

Inference using Huggingface transformers on NVIDIA GPUs. Requirements tested on python 3.10:

在 NVIDIA GPU 上用 Huggingface transformers 推理. 以下依赖在 python 3.10 上测试过:

```txt
Pillow==10.1.0
torch==2.1.2
torchvision==0.16.2
transformers==4.40.0
sentencepiece==0.1.99
```

依赖版本: Pillow 10.1.0, torch 2.1.2, torchvision 0.16.2, transformers 4.40.0, sentencepiece 0.1.99.

```python
# test.py
import torch
from PIL import Image
```

示例脚本 test.py 的开头: 导入 torch 和 PIL 的 Image. 这三行在第 8 页, 脚本其余部分在第 9 页. MinerU 把它们和依赖列表放进了同一个代码块, 这里拆开.

<!-- page 9 of 12 -->

```python
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained('openbmb/MiniCPM-Llama3-V-2_5', trust
model = model.to(device='cuda')

tokenizer = AutoTokenizer.from_pretrained('openbmb/MiniCPM-Llama3-V-2_5
model.eval()

image = Image.open('xx.jpg').convert('RGB')
question = 'What is in the image?'
msgs = [{'role': 'user', 'content': question}]

res = model.chat(
    image=image,
    msgs=msgs,
    tokenizer=tokenizer,
    sampling=True, # if sampling=False, beam_search will be used by def
    temperature=0.7,
    # system_prompt='' # pass system_prompt if needed
)
print(res)

## if you want to use streaming, please make sure sampling=True and str
## the model.chat will return a generator
res = model.chat(
    image=image,
    msgs=msgs,
    tokenizer=tokenizer,
    sampling=True,
    temperature=0.7,
    stream=True
)

generated_text = ""
for new_text in res:
    generated_text += new_text
    print(new_text, flush=True, end='')
```

脚本的主体. 第一段: 从 Hub 加载模型和分词器, 移到 cuda, 切到推理模式; 打开一张图片, 问题是 「图里有什么?」, 组成一条用户消息; 调用 model.chat, 开启采样, 温度 0.7, 注释说若 sampling=False 则默认用 beam search, 另可传 system_prompt. 第二段: 流式输出, 注释说要流式就必须 sampling=True 并传 stream=True, 此时 model.chat 返回一个生成器, 循环逐段打印. 代码按 PDF 文字层录入. 网页代码框右侧被截断, 所以有三行不完整: 第 2 行 trust 后面和第 4 行模型名后面被切掉, 注释 「by def」 和 「and str」 后面也被切掉. MinerU 版本还有两处识别错误: msgs=msgs 被识别成 msgs=news, 列表结尾的 }] 被识别成 ']', 这里按文字层更正.

> **想:** 把这段代码原样复制下来能跑吗?
> 不能. 第 2 行 from_pretrained 的第二个参数在网页上被截断, 只剩 trust, 被截掉的部分本页看不到; 第 4 行分词器的模型名缺了右引号和右括号. 结合第 1 页标签里的 custom_code, 这个 trust 开头的参数应是允许加载仓库自定义代码的开关: model.chat 不是 transformers 自带的方法, 是仓库里的自定义代码提供的. 另外用 MinerU 版本复制的话 msgs=news 会直接报未定义. 页面在下一页让读者去 GitHub 看完整用法.

<!-- page 10 of 12 -->

Please look at [GitHub](https://github.com/OpenBMB/MiniCPM-V) for more detail about usage.

更多用法细节请看 GitHub.

## Inference with llama.cpp (用 llama.cpp 推理)

MiniCPM-Llama3-V 2.5 can run with llama.cpp now! See our fork of [llama.cpp](https://github.com/OpenBMB/llama.cpp/tree/minicpm-v2.5/examples/minicpmv) for more detail.

MiniCPM-Llama3-V 2.5 现在能用 llama.cpp 运行了! 详情见团队 fork 的 llama.cpp 仓库.

## Int4 quantized version (Int4 量化版本)

Download the int4 quantized version for lower GPU memory (8GB) usage: [MiniCPM-Llama3-V-2\_5-int4](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5-int4).

下载 int4 量化版本, 显存占用更低 (8GB): MiniCPM-Llama3-V-2_5-int4.

## MiniCPM-V 2.0

Please see the info about MiniCPM-V 2.0 [here](https://huggingface.co/openbmb/MiniCPM-V-2).

MiniCPM-V 2.0 的信息请看这里.

**License**

**许可证.**

## Model License (模型许可)

The code in this repo is released under the [Apache-2.0](https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE) License.

本仓库的代码按 Apache-2.0 许可证发布.

The usage of MiniCPM-V series model weights must strictly follow [MiniCPM Model License.md](https://github.com/OpenBMB/MiniCPM/blob/main/MiniCPM%20Model%20License.md).

MiniCPM-V 系列模型权重的使用必须严格遵守 MiniCPM Model License.md.

The models and weights of MiniCPM are completely free for academic research. after filling out a ["questionnaire"](https://modelbest.feishu.cn/share/base/form/shrcnpV5ZT9EJ6xYjh3Kx0J6v8g) for registration, are also available for free commercial use.

MiniCPM 的模型和权重对学术研究完全免费; 填写一份 「问卷」 登记后, 也可以免费商用. 原文这句在 「research.」 后断开, 后半句缺主语, 意思按上下文补齐.

> **问:** 代码是 Apache-2.0, 那权重也能按 Apache-2.0 随便用吗?
> 不能. 这一节把两样东西分开授权: 仓库代码走 Apache-2.0, 模型权重走 MiniCPM Model License. 权重学术研究免费, 商用要先填问卷登记, 登记后免费. 页面没有列出 MiniCPM Model License 的具体条款, 只给了链接, 限制内容这 12 页里看不到.

## Statement (声明)

As an LLM, MiniCPM-Llama3-V 2.5 generates contents by learning a large mount of texts, but it cannot comprehend, express personal opinions or make value judgement. Anything generated by MiniCPM-Llama3-V 2.5 does not represent the views and positions of the model developers

作为一个大语言模型, MiniCPM-Llama3-V 2.5 通过学习大量文本生成内容, 但它不能理解, 不能表达个人观点, 也不能做价值判断. MiniCPM-Llama3-V 2.5 生成的任何内容都不代表模型开发者的观点和立场. 原文 「a large mount of」 是 「a large amount of」 的笔误, 句末缺句号.

<!-- page 11 of 12 -->

We will not be liable for any problems arising from the use of the MinCPM-V open Source model, including but not limited to data security issues, risk of public opinion, or any risks and problems arising from the misdirection, misuse, dissemination or misuse of the model.

对于使用 MiniCPM-V 开源模型引起的任何问题, 包括但不限于数据安全问题, 舆论风险, 以及模型被误导, 误用, 传播或滥用带来的任何风险和问题, 我们不承担责任. 原文把 MiniCPM-V 拼成了 MinCPM-V, misuse 出现了两次.

## Key Techniques and Other Multimodal Projects (关键技术和其他多模态项目)

Welcome to explore key techniques of MiniCPM-V 2.6 and other multimodal projects of our team:

欢迎了解 MiniCPM-V 2.6 的关键技术以及团队的其他多模态项目:

```txt
VisCPM | RLHF-V | LLaVA-UHD | RLAIF-V
```

四个项目: VisCPM, RLHF-V, LLaVA-UHD, RLAIF-V. 其中 VisCPM 在第 4 页多语言一段出现过 (跨语言泛化技术), RLHF-V 和 RLAIF-V 在第 4 页可信行为一段出现过; LLaVA-UHD 在本页之外没有再提到.

## Citation (引用)

If you find our work helpful, please consider citing our papers and liking this project!

如果觉得我们的工作有帮助, 请考虑引用我们的论文并给项目点个赞!

```bib
@article{yao2024minicpmv,
    title={MiniCPM-V: A GPT-4V Level MLLM on Your Phone},
    author={Yao, Yuan and Yu, Tianyu and Zhang, Ao and Wang, Chongyi
    journal={arXiv preprint 2408.01800},
    year={2024},
}
```

BibTeX 条目: 论文题目 「MiniCPM-V: 手机上的 GPT-4V 级多模态大模型」, 作者 Yao Yuan, Yu Tianyu, Zhang Ao, Wang Chongyi 等 (作者行右侧被截断), arXiv 预印本 2408.01800, 2024 年. 这是整个 MiniCPM-V 系列的论文, 和第 3 页 2024.08.03 那条 「V 2.5 技术报告已发布」 的新闻对应.

## Company (公司)

Hugging Face 网站页脚的 「公司」 栏. PDF 文字层在这里还有 TOS, Privacy, System theme 三项 (服务条款, 隐私, 系统主题), MinerU 没有识别.

<!-- page 12 of 12 -->

[About](https://huggingface.co/huggingface) · [Careers](https://apply.workable.com/huggingface/)

关于, 招聘.

## Website (网站)

[Models](https://huggingface.co/models) · [Datasets](https://huggingface.co/datasets) · [Spaces](https://huggingface.co/spaces) · [Pricing](https://huggingface.co/pricing) · [Docs](https://huggingface.co/docs)

页脚 「网站」 栏: 模型, 数据集, Spaces, 价格, 文档.

![Hugging Face 的笑脸抱抱标志, 页脚左下角](images/p12-image.png)
