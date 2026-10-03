---
title: "Llama 4 · 对照译稿"
category: "模型库"
tags: ["Llama", "对照译稿"]
published: true
excerpt: "Llama 4 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

三

页眉: 左上角的 2026/9/25 13:27 是这份 PDF 的打印时间, 不是发文日期; 中间一行是网页标题; 下面是 Meta 标志. 「三」 是页眉右上角的菜单按钮被识别成了汉字, 不是正文. 后面每一页都有同样的页眉, 下文只在它夹带了别的碎片时再说明.

Large Language Model

栏目名: 大语言模型.

# The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

标题: Llama 4 家族: 原生多模态 AI 创新新时代的开端. 「herd」 本义是兽群, 这里指这一批 Llama 4 模型.

April 5, 2025 • 12 minute read

发文日期 2025 年 4 月 5 日, 标注阅读时长 12 分钟.

![Image block](images/p01-takeaways.png)

(图: 浅蓝到淡紫渐变的横幅. 左上大字 「Llama 4: Leading Multimodal Intelligence」, 右边小字 「Newest model suite offering unrivaled speed and efficiency」. 下面三栏按台阶排开. 第一栏 Llama 4 Behemoth: 「288B active parameter, 16 experts」, 「2T total parameters」, 「The most intelligent teacher model for distillation」, 按钮 Preview. 第二栏 Llama 4 Maverick: 「17B active parameters, 128 experts」, 「400B total parameters」, 「Native multimodal with 1M context length」, 按钮 Available. 第三栏 Llama 4 Scout: 「17B active parameters, 16 experts」, 「109B total parameters」, 「Industry leading 10M context length」, 「Optimized inference」, 按钮 Available. 横幅上的字 md 没有抽成正文, PDF 文本层里也没有.)

## Takeaways

要点:

We’re sharing the first models in the Llama 4 herd, which will enable people to build more personalized multimodal experiences.

我们放出 Llama 4 家族的第一批模型, 让人们能做出更个性化的多模态体验.

Llama 4 Scout, a 17 billion active parameter model with 16 experts, is the best multimodal model in the world in its class and is more powerful than all previous generation Llama models, while fitting in a single NVIDIA H100 GPU. Additionally, Llama 4 Scout offers an industry-leading context window of 10M and delivers better results than Gemma 3, Gemini 2.0 Flash-Lite, and Mistral 3.1 across a broad range of widely reported benchmarks.

Llama 4 Scout 是一个 170 亿激活参数, 16 个专家的模型. 页面称它是全球同级别里最好的多模态模型, 比之前所有代的 Llama 模型都强, 同时能装进单张 NVIDIA H100 GPU. 此外, Llama 4 Scout 提供业界领先的 10M 上下文窗口, 在一大批被广泛报告的基准上结果好于 Gemma 3, Gemini 2.0 Flash-Lite 和 Mistral 3.1. 这里的 10M 没写单位, 第 6 页写成 「10 million tokens」.

页面图像上这两段是 Takeaways 下的圆点条目, md 去掉了圆点.

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

1/15

页脚: 原文网址和页码 1/15. 后面每页页脚相同, 只换页码.

<!-- page 2 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

of

页眉同第 1 页. 单独一行的 「of」 是被页眉挡住的那一行留下的碎片.

widely reported benchmarks, while achieving comparable results to the new DeepSeek v3 on reasoning and coding—at less than half the active parameters. Llama 4 Maverick offers a best-in-class performance to cost ratio with an experimental chat version scoring ELO of 1417 on [LMArena](https://lmarena.ai/leaderboard).

这一条在 md 里从半句开始. 页面图像上它的第一行被页眉挡住, PDF 文本层保留了开头: "Llama 4 Maverick, a 17 billion active parameter model with 128 experts, is the best multimodal model in its class, beating GPT-4o and Gemini 2.0 Flash across a broad range of widely reported benchmarks". 整条的意思是: Llama 4 Maverick 是一个 170 亿激活参数, 128 个专家的模型, 页面称它是同级别最好的多模态模型, 在一大批被广泛报告的基准上胜过 GPT-4o 和 Gemini 2.0 Flash, 在推理和编程上和新的 DeepSeek v3 结果相当, 激活参数却不到对方一半. Llama 4 Maverick 的性能成本比同级最好, 一个实验性的聊天版本在 [LMArena](https://lmarena.ai/leaderboard) 上拿到 1417 的 ELO 分.

These models are our best yet thanks to distillation from Llama 4 Behemoth, a 288 billion active parameter model with 16 experts that is our most powerful yet and among the world’s smartest LLMs. Llama 4 Behemoth outperforms GPT-4.5, Claude Sonnet 3.7, and Gemini 2.0 Pro on several STEM benchmarks. Llama 4 Behemoth is still training, and we’re excited to share more details about it even while it’s still in flight.

这些模型是我们迄今最好的, 功劳在于从 Llama 4 Behemoth 蒸馏. Behemoth 是一个 2880 亿激活参数, 16 个专家的模型, 是我们迄今最强的模型, 也跻身全球最聪明的大模型之列. Llama 4 Behemoth 在几项 STEM 基准上胜过 GPT-4.5, Claude Sonnet 3.7 和 Gemini 2.0 Pro. 它还在训练中, 我们很乐意在它训完之前就多分享一些细节.

Download the Llama 4 Scout and Llama 4 Maverick models today on [llama.com](https://www.llama.com/llama-downloads/) and [Hugging Face](https://huggingface.co/meta-llama). Try Meta AI built with Llama 4 in WhatsApp, Messenger, Instagram Direct, and on the [web](https://meta.ai/).

今天就可以在 [llama.com](https://www.llama.com/llama-downloads/) 和 [Hugging Face](https://huggingface.co/meta-llama) 下载 Llama 4 Scout 和 Llama 4 Maverick. 也可以在 WhatsApp, Messenger, Instagram Direct 和 [网页版](https://meta.ai/) 上试用基于 Llama 4 的 Meta AI.

页面图像上这两段也是 Takeaways 的圆点条目, 到这里 Takeaways 结束.

As more people continue to use artificial intelligence to enhance their daily lives, it’s important that the leading models and systems are openly available so everyone can build the future of personalized experiences. Today, we’re excited to announce the most advanced suite of models that support the entire [Llama](https://www.llama.com/) ecosystem. We’re introducing Llama 4 Scout and Llama 4 Maverick, the first open-weight natively multimodal models with unprecedented context length support and our first built using a mixture-of-experts (MoE) architecture. We’re also previewing Llama 4 Behemoth, one of the smartest LLMs in the world and our most powerful yet to serve as a teacher for our new models.

越来越多的人用人工智能改善日常生活, 所以让领先的模型和系统开放可得很重要, 这样每个人都能参与打造个性化体验的未来. 今天我们发布一套最先进的模型, 支撑整个 [Llama](https://www.llama.com/) 生态. 我们推出 Llama 4 Scout 和 Llama 4 Maverick, 页面称它们是第一批开放权重的原生多模态模型, 支持前所未有的上下文长度, 也是我们第一批用 MoE (mixture-of-experts) 架构搭的模型. 我们还预览了 Llama 4 Behemoth, 它是全球最聪明的大模型之一, 也是我们迄今最强的模型, 用来当新模型的老师.

These Llama 4 models mark the beginning of a new era for the Llama ecosystem. We designed two efficient models in the Llama 4 series, Llama 4 Scout, a 17 billion active parameter model with 16 experts, and Llama 4 Maverick, a 17 billion active parameter model with 128 experts. The former fits on a single H100 GPU (with Int4 quantization) while the latter fits on a single H100 host. We also trained a teacher model, Llama 4 Behemoth, that outperforms GPT-4.5, Claude Sonnet 3.7, and Gemini 2.0 Pro on STEM-focused benchmarks such as MATH-500 and GPQA Diamond. While we’re not yet releasing Llama 4 Behemoth as it is still training, we’re excited to share more technical details about our approach.

这些 Llama 4 模型标志着 Llama 生态新时代的开始. 我们在 Llama 4 系列里设计了两个高效模型: Llama 4 Scout, 170 亿激活参数, 16 个专家; Llama 4 Maverick, 170 亿激活参数, 128 个专家. 前者能装进单张 H100 GPU (用 Int4 量化), 后者能装进单台 H100 主机. 我们还训练了一个老师模型 Llama 4 Behemoth, 它在 MATH-500, GPQA Diamond 这类偏 STEM 的基准上胜过 GPT-4.5, Claude Sonnet 3.7 和 Gemini 2.0 Pro. Llama 4 Behemoth 还在训练, 暂不发布, 但我们愿意先分享做法上的更多技术细节.

> **拆开:** 「fits on a single H100 GPU」 要什么前提?
> 第 1 页 Takeaways 说 Scout 「fitting in a single NVIDIA H100 GPU」, 没有任何前提. 这一段加了括号 「(with Int4 quantization)」. 第 6 页给出 Scout 总参数 109B. 按 Int4 每个参数半字节算, 光权重约 109 x 0.5 = 54.5 GB; 按第 5 页提到的 FP8 每参数 1 字节算约 109 GB. 页面没印 H100 的显存有多大, 也没说 10M 上下文要占的缓存算不算在 「fits」 里. Maverick 的说法前后换了三次: 这一段是 「single H100 host」, 第 4 页是 「single NVIDIA H100 DGX host」, 第 6 页表注 5 是 「On a single host」. 一台主机装几张卡, 用什么精度, 页面都没写, 所以 400B 总参数装进一台主机的条件没法从页面核对.

We continue to believe that openness drives innovation and is good for developers, good for Meta, and good for the world. We’re making Llama 4 Scout and Llama 4 Maverick available for download today on [llama.com](https://www.llama.com/llama-downloads/) and [Hugging Face](https://huggingface.co/meta-llama) so everyone can continue to build new experiences using our latest technology. We’ll also make them available via our partners in the coming days. You can also try Meta AI with Llama 4 starting today in WhatsApp, Messenger, Instagram Direct, and on the [Meta.AI](https://meta.ai/) website.

我们依然相信, 开放推动创新, 对开发者好, 对 Meta 好, 对世界也好. 今天起可以在 [llama.com](https://www.llama.com/llama-downloads/) 和 [Hugging Face](https://huggingface.co/meta-llama) 下载 Llama 4 Scout 和 Llama 4 Maverick, 让每个人都能继续用我们最新的技术做新体验. 未来几天, 我们也会通过合作伙伴提供这两个模型. 从今天起, 还可以在 WhatsApp, Messenger, Instagram Direct 和 [Meta.AI](https://meta.ai/) 网站上试用基于 Llama 4 的 Meta AI.

This is just the beginning for the Llama 4 collection. We believe that the most intelligent systems need to be capable of taking generalized actions, conversing naturally with humans, and working

这只是 Llama 4 系列的开始. 我们相信, 最聪明的系统要能采取通用的行动, 能和人自然交谈, 还要能 (句子接到下一页.)

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

2/15

页脚, 页码 2/15.

<!-- page 3 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

三

页眉同第 1 页.

innovate on the next big consumer and business use cases. We’re continuing to research and prototype both models and products, and we’ll share more about our vision at LlamaCon on April 29—[sign up to hear more](https://www.llama.com/events/llamacon/signup/).

md 在这里接上的是半句. 页面图像上这一页顶端有两行被页眉挡住, PDF 文本层保留了: "through challenging problems they haven't seen before. Giving Llama superpowers in these areas will lead to better products for people on our platforms and more opportunities for developers to". 连上上一页, 意思是: 还要能攻克以前没见过的难题. 让 Llama 在这些方面有超能力, 会给我们平台上的用户带来更好的产品, 也给开发者更多机会, 去开拓下一批重要的消费和商业场景. 我们在继续研究, 同时给模型和产品做原型, 会在 4 月 29 日的 LlamaCon 上分享更多愿景 (这里没写年份), [报名了解更多](https://www.llama.com/events/llamacon/signup/).

Whether you’re a developer building on top of our models, an enterprise integrating them into your workflows, or simply curious about the potential uses and benefits of AI, Llama 4 Scout and Llama 4 Maverick are the best choices for adding next-generation intelligence to your products. Today, we’re excited to share more about the four major parts of their development and insights into our research and design process. We also can’t wait to see the incredible new experiences the community builds with our new Llama 4 models.

不管你是在我们模型上开发的开发者, 把模型接进工作流的企业, 还是只是好奇 AI 能用来做什么, 有什么好处, 要给产品加上下一代智能, Llama 4 Scout 和 Llama 4 Maverick 都是最好的选择. 今天, 我们来多讲讲它们开发过程中的四个主要部分, 以及研究和设计过程中的心得. 我们也很期待社区用新的 Llama 4 模型做出精彩的新体验.

**Pre-training**

小标题: 预训练. md 里这是二级标题, 这里改成加粗, 后面几个小标题同样处理.

These models represent the best of Llama, offering multimodal intelligence at a compelling price while outperforming models of significantly larger sizes. Building the next generation of Llama models required us to take several new approaches during pre-training.

这些模型代表了 Llama 的最高水平: 以有吸引力的价格提供多模态智能, 同时胜过规模大得多的模型. 做下一代 Llama 模型, 要求我们在预训练中采用几种新做法.

Our new Llama 4 models are our first models that use a mixture of experts (MoE) architecture. In MoE models, a single token activates only a fraction of the total parameters. MoE architectures are more compute efficient for training and inference and, given a fixed training FLOPs budget, delivers higher quality compared to a dense model.

新的 Llama 4 模型是我们第一批用 MoE 架构的模型. 在 MoE 模型里, 一个 token 只激活总参数的一小部分. MoE 架构在训练和推理上算力效率更高, 在固定的训练 FLOPs 预算下, 质量比稠密模型更高. 这一句的 「architectures ... delivers」 主谓不一致, 照原样保留.

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

3/15

页脚, 页码 3/15.

<!-- page 4 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

页眉同第 1 页, 这一页 md 没有识别出 Meta 标志.

![Image block](images/p04-as-an-example-llama-4-maverick-models-have-17b-active.png)

(图: 左边一列从下往上是 「Attention」 和 「FFN」 交替堆叠, 底部有省略号, 画出了三个 FFN 块. 中间那个 FFN 块用虚线放大到右边的大框 「Mixture of Experts」. 大框底部一个 Attention 的输出分成两路: 一路进灰色的 「Router」, 再分发给 「Routed Experts」 框里的 「Expert 0」, 「Expert 1」, 省略号, 「Expert 15」; 另一路直接进蓝色的 「Shared Expert」. 两路输出在顶上的 「+」 汇合后向上输出. 图上没有标是哪个模型. md 把这张图的文件名取成了下面正文的开头.)

As an example, Llama 4 Maverick models have 17B active parameters and 400B total parameters. We use alternating dense and mixture-of-experts (MoE) layers for inference efficiency. MoE layers use 128 routed experts and a shared expert. Each token is sent to the shared expert and also to one of the 128 routed experts. As a result, while all parameters are stored in memory, only a subset of the total parameters are activated while serving these models. This improves inference efficiency by lowering model serving costs and latency—Llama 4 Maverick can be run on a single NVIDIA H100 DGX host for easy deployment, or with distributed inference for maximum efficiency.

举个例子, Llama 4 Maverick 模型有 170 亿激活参数和 4000 亿总参数. 为了推理效率, 我们让稠密层和 MoE 层交替排列. MoE 层用 128 个路由专家和 1 个共享专家. 每个 token 都会送到共享专家, 同时送到 128 个路由专家中的一个. 所以, 虽然全部参数都存在内存里, 服务这些模型时只激活总参数的一部分. 这降低了服务成本和延迟, 提高了推理效率. Llama 4 Maverick 可以在单台 NVIDIA H100 DGX 主机上运行, 部署方便, 也可以用分布式推理追求最高效率.

> **确认:** 图里的路由专家是 16 个, 正文说 128 个, 这张图画的是哪个模型?
> 图里 Routed Experts 框写的是 Expert 0, Expert 1, 省略号, Expert 15, 按编号是 16 个. 图下正文以 Maverick 为例, 说 MoE 层有 128 个路由专家加 1 个共享专家. 在页面上, 16 这个数属于 Scout 和 Behemoth (第 1, 2, 6, 10 页都写 16 experts), 可正文没说 Scout 或 Behemoth 也有共享专家, 也没说它们是不是稠密层和 MoE 层交替. 第 2 页和第 6 页说 Maverick 有 「128 experts」, 这一页拆成 128 个路由专家和 1 个共享专家, 「128 experts」 算没算共享专家, 页面没有统一说法. 再看总参数: 专家数从 Scout 的 16 到 Maverick 的 128 是 8 倍, 总参数从 109B 到 400B 约 3.7 倍. 每个专家多大, 稠密层占多少, 页面都没给, 两个倍数之间差在哪里, 从页面看不出来.

Llama 4 models are designed with native multimodality, incorporating early fusion to seamlessly integrate text and vision tokens into a unified model backbone. Early fusion is a major step forward, since it enables us to jointly pre-train the model with large amounts of unlabeled text, image, and video data. We also improved the vision encoder in Llama 4. This is based on MetaCLIP but trained separately in conjunction with a frozen Llama model to better adapt the encoder to the LLM.

Llama 4 模型按原生多模态设计, 用早期融合 (early fusion) 把文本 token 和视觉 token 无缝接进同一个模型主干. 早期融合是一大进步, 因为它让我们能用大量无标注的文本, 图像和视频数据联合预训练模型. 我们还改进了 Llama 4 的视觉编码器. 它基于 MetaCLIP, 但和一个冻结的 Llama 模型配合, 单独训练, 让编码器更好地适配大模型.

We developed a new training technique which we refer to as MetaP that allows us to reliably set critical model hyper-parameters such as per-layer learning rates and initialization scales. We

我们开发了一种新的训练技术, 叫 MetaP, 能可靠地设定关键的模型超参数, 比如每层的学习率和初始化尺度. 我们 (句子接到下一页.)

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

4/15

页脚, 页码 4/15.

<!-- page 5 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

g

页眉同第 1 页. 单独一行的 「g」 是被页眉挡住那一行的碎片.

on 200 languages, including over 100 with over 1 billion tokens each, and overall 10x more multilingual tokens than Llama 3.

md 这一段从半句开始. PDF 文本层保留了前面被挡住的部分: "found that chosen hyper-parameters transfer well across different values of batch size, model width, depth, and training tokens. Llama 4 enables open source fine-tuning efforts by pre-training". 连上上一页, 意思是: 我们发现, 选好的超参数在不同的批大小, 模型宽度, 深度和训练 token 数之间迁移得很好. Llama 4 在 200 种语言上预训练, 其中超过 100 种语言每种有超过 10 亿 token, 多语言 token 总量是 Llama 3 的 10 倍, 以此支持开源社区的微调工作.

Additionally, we focus on efficient model training by using FP8 precision, without sacrificing quality and ensuring high model FLOPs utilization—while pre-training our Llama 4 Behemoth model using FP8 and 32K GPUs, we achieved 390 TFLOPs/GPU. The overall data mixture for training consisted of more than 30 trillion tokens, which is more than double the Llama 3 pre-training mixture and includes diverse text, image, and video datasets.

此外, 我们注重训练效率: 用 FP8 精度, 不牺牲质量, 并保证较高的模型 FLOPs 利用率. 预训练 Llama 4 Behemoth 时用 FP8 和 32K 张 GPU, 我们做到了每张 GPU 390 TFLOPs. 训练用的整体数据混合超过 30 万亿 token, 是 Llama 3 预训练混合的两倍多, 包含多样的文本, 图像和视频数据集.

We continued training the model in what we call “mid-training” to improve core capabilities with new training recipes including long context extension using specialized datasets. This enabled us to enhance model quality while also unlocking best-in-class 10M input context length for Llama 4 Scout.

我们还用所谓的 「mid-training」 (中期训练) 继续训练模型, 用新的训练配方提升核心能力, 其中包括用专门的数据集做长上下文扩展. 这让我们在提高模型质量的同时, 为 Llama 4 Scout 解锁了同级最佳的 10M 输入上下文长度.

**Post-training our new models**

小标题: 新模型的后训练.

Our newest models include smaller and larger options to accommodate a range of use cases and developer needs. Llama 4 Maverick offers unparalleled, industry-leading performance in image and text understanding, enabling the creation of sophisticated AI applications that bridge language barriers. As our product workhorse model for general assistant and chat use cases, Llama 4 Maverick is great for precise image understanding and creative writing.

我们最新的模型有小有大, 适应不同用途和开发者需求. Llama 4 Maverick 在图像和文本理解上表现业界领先, 无可比拟, 能用来做跨越语言障碍的复杂 AI 应用. 作为我们面向通用助手和聊天场景的产品主力模型, Llama 4 Maverick 擅长精确的图像理解和创意写作.

The biggest challenge while post-training the Llama 4 Maverick model was maintaining a balance between multiple input modalities, reasoning, and conversational abilities. For mixing modalities, we came up with a carefully curated curriculum strategy that does not trade-off performance compared to the individual modality expert models. With Llama 4, we revamped our post-training pipeline by adopting a different approach: lightweight supervised fine-tuning (SFT) > online reinforcement learning (RL) > lightweight direct preference optimization (DPO). A key learning was that SFT and DPO can over-constrain the model, restricting exploration during the online RL stage and leading to suboptimal accuracy, particularly in reasoning, coding, and math domains. To address this, we removed more than 50% of our data tagged as easy by using Llama models as a judge and did lightweight SFT on the remaining harder set. In the subsequent multimodal online RL stage, by carefully selecting harder prompts, we were able to achieve a step change in performance. Furthermore, we implemented a continuous online RL strategy, where we alternated between training the model and then using it to continually filter and retain only medium-to-hard difficulty prompts. This strategy proved highly beneficial in terms of compute and accuracy tradeoffs. We then did a lightweight DPO to handle corner cases related to model response quality, effectively achieving a good balance between the model’s intelligence and conversational abilities. Both the pipeline architecture and the continuous online RL strategy with adaptive data

后训练 Llama 4 Maverick 最大的难点, 是在多种输入模态, 推理能力和对话能力之间保持平衡. 混合模态方面, 我们设计了一套精心编排的课程策略, 和各个单模态专家模型相比不损失性能. 到了 Llama 4, 我们换了一种做法, 重做了后训练流水线: 轻量监督微调 (SFT) > 在线强化学习 (RL) > 轻量直接偏好优化 (DPO). 一个关键的经验是, SFT 和 DPO 会把模型约束过头, 限制在线 RL 阶段的探索, 导致准确率不理想, 在推理, 编程和数学上尤其明显. 为此, 我们用 Llama 模型当评判, 去掉了超过 50% 被标为简单的数据, 在剩下更难的数据上做轻量 SFT. 接下来的多模态在线 RL 阶段, 我们仔细挑选更难的提示, 让性能有了阶跃式的提升. 我们还实施了持续在线 RL 策略: 训练模型, 再用它持续过滤, 只保留中等到困难的提示, 两步交替进行. 这个策略在算力和准确率的权衡上很划算. 之后我们做了一轮轻量 DPO, 处理和回复质量有关的边角情况, 在模型的智能和对话能力之间取得了不错的平衡. 这套流水线结构, 以及带自适应数据 (句子接到下一页.)

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

5/15

页脚, 页码 5/15.

<!-- page 6 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

三

页眉同第 1 页. md 在这一页漏了开头一句: 页面图像上它被页眉挡住, PDF 文本层保留了 "filtering culminated in an industry-leading, general-purpose chat model with state-of-the-art intelligence and image understanding capabilities." 接上上一页, 意思是: 这套流水线结构, 以及带自适应数据过滤的持续在线 RL 策略, 最终造出一个业界领先的通用聊天模型, 智能和图像理解能力都是一流水平.

As a general purpose LLM, Llama 4 Maverick contains 17 billion active parameters, 128 experts, and 400 billion total parameters, offering high quality at a lower price compared to Llama 3.3 70B. Llama 4 Maverick is the best-in-class multimodal model, exceeding comparable models like GPT-4o and Gemini 2.0 on coding, reasoning, multilingual, long-context, and image benchmarks, and it’s competitive with the much larger DeepSeek v3.1 on coding and reasoning.

作为通用大模型, Llama 4 Maverick 有 170 亿激活参数, 128 个专家, 4000 亿总参数, 和 Llama 3.3 70B 相比质量高, 价格更低. Llama 4 Maverick 是同级最佳的多模态模型, 在编程, 推理, 多语言, 长上下文和图像基准上超过 GPT-4o, Gemini 2.0 这类可比模型, 在编程和推理上能和大得多的 DeepSeek v3.1 一较高下.

> **问:** 对手是 「the new DeepSeek v3」 还是 「DeepSeek v3.1」, 「much larger」 大多少?
> 第 2 页 Takeaways 写的是 「the new DeepSeek v3」, 说 Maverick 「at less than half the active parameters」. 这一段和下面的表头都写 「DeepSeek v3.1」, 说它 「much larger」. 两处版本号不同, 页面没说 v3 和 v3.1 是不是同一个模型. DeepSeek 的激活参数和总参数全文没印, 「不到一半」 和 「大得多」 都没法用页面上的数核对. 「new」 是相对哪天说的也没写, 发文日是 2025 年 4 月 5 日. 同一段里 「lower price compared to Llama 3.3 70B」 也一样: 下面这张表的价格行没有 Llama 3.3 70B, 第 9 页 Scout 表有 Llama 3.3 70B 一列, 却没有价格行.

Llama 4 Maverick instruction-tuned benchmarks

表名: Llama 4 Maverick 指令微调版的基准.

<table><tr><td>CategoryBenchmark</td><td>Llama 4Maverick</td><td>Gemini 2.0 Flash</td><td>DeepSeek v3.1</td><td>GPT-4o</td></tr><tr><td>Inference CostCost per 1M input&amp; output tokens (3:1 blended)</td><td> $\$0.19-\$0.49^5$ </td><td>$0.17</td><td>$0.48</td><td>$4.38</td></tr><tr><td>Image ReasoningMMMU</td><td>73.4</td><td>71.7</td><td rowspan="4">No multimodal support</td><td>69.1</td></tr><tr><td>MathVista</td><td>73.7</td><td>73.1</td><td>63.8</td></tr><tr><td>Image UnderstandingChartQA</td><td>90.0</td><td>88.3</td><td>85.7</td></tr><tr><td>DocVQA (test)</td><td>94.4</td><td>—</td><td>92.8</td></tr><tr><td>CodingLiveCodeBench(10/01/2024-02/01/2025)</td><td>43.4</td><td>34.5</td><td> $45.8/49.2^3$ </td><td> $32.3^3$ </td></tr><tr><td>Reasoning &amp; KnowledgeMMLU Pro</td><td>80.5</td><td>77.6</td><td>81.2</td><td>—</td></tr><tr><td>GPQA Diamond</td><td>69.8</td><td>60.1</td><td>68.4</td><td>53.6</td></tr><tr><td>MultilingualMultilingual MMLU</td><td>84.6</td><td>—</td><td>—</td><td>81.5</td></tr><tr><td>Long ContextMTOB (half book)eng → kgv/kgv → eng</td><td>54.0/46.4</td><td> $48.4/39.8^4$ </td><td rowspan="2">Context window is 128K</td><td rowspan="2">Context window is 128K</td></tr><tr><td>MTOB (full book)eng → kgv/kgv → eng</td><td>50.8/46.7</td><td> $45.5/39.6^4$ </td></tr></table>

md 把每一格的类别小字和基准名粘在了一起, 比如 「Inference CostCost per 1M input& output tokens (3:1 blended)」. 页面图像上类别是基准名上方的一行灰色小字, Llama 4 Maverick 一列是蓝色字, 每行最高分加粗, md 都没保留. 上标写成了公式. 下面按类别拆开重排, 空格写 「无」, 价格改写成美元数字:

| 类别 | 基准 | Llama 4 Maverick | Gemini 2.0 Flash | DeepSeek v3.1 | GPT-4o |
| --- | --- | --- | --- | --- | --- |
| 推理成本 | 每 100 万输入和输出 token 的成本 (输入输出按 3:1 混合) | 0.19-0.49 美元 (注 5) | 0.17 美元 | 0.48 美元 | 4.38 美元 |
| 图像推理 | MMMU | 73.4 | 71.7 | 不支持多模态 | 69.1 |
| 图像推理 | MathVista | 73.7 | 73.1 | 不支持多模态 | 63.8 |
| 图像理解 | ChartQA | 90.0 | 88.3 | 不支持多模态 | 85.7 |
| 图像理解 | DocVQA (test) | 94.4 | 无 | 不支持多模态 | 92.8 |
| 编程 | LiveCodeBench (10/01/2024-02/01/2025) | 43.4 | 34.5 | 45.8/49.2 (注 3) | 32.3 (注 3) |
| 推理与知识 | MMLU Pro | 80.5 | 77.6 | 81.2 | 无 |
| 推理与知识 | GPQA Diamond | 69.8 | 60.1 | 68.4 | 53.6 |
| 多语言 | Multilingual MMLU | 84.6 | 无 | 无 | 81.5 |
| 长上下文 | MTOB (半本书) eng→kgv / kgv→eng | 54.0/46.4 | 48.4/39.8 (注 4) | 上下文窗口是 128K | 上下文窗口是 128K |
| 长上下文 | MTOB (整本书) eng→kgv / kgv→eng | 50.8/46.7 | 45.5/39.6 (注 4) | 上下文窗口是 128K | 上下文窗口是 128K |

1. For Llama model results, we report O shot evaluation with temperature = 0 and no majority voting or parlel test time compute. For high-variance benchmarks (GPQA Diamond, LiveCodeBench), we average over multiple generations to reduce uncertainty.

注 1: Llama 模型的结果按 0-shot 报告, temperature = 0, 不做多数投票, 也不在推理阶段加并行计算. 对 GPQA Diamond, LiveCodeBench 这类方差大的基准, 我们对多次生成取平均, 降低不确定性. md 里的 「O shot」 在页面图像上是 「0 shot」, 「parlel」 是 「parallel」.

2. For non-Llama models, we source the highest available self-reported eval results, unless otherwise specified. We only include evals from models that have reproducible evals (via API or open weights), and we only include non-thinking models. Cost estimates are sourced from Artificial Analysis for non-Llama models.

注 2: 非 Llama 模型取能找到的最高自报结果, 另有说明的除外. 只收录评估可复现 (通过 API 或开放权重) 的模型, 并且只收录非思考模型. 非 Llama 模型的成本估计来自 Artificial Analysis.

3. DeepSeek v3.1's date range is unknown (49.2), so we provide our internal result (45.8) on the defined date range. Results for GPT-4o are sourced from the LCB leaderboard.

注 3: DeepSeek v3.1 那个数 (49.2) 的日期区间不明, 所以我们在规定的日期区间上给出内部结果 (45.8). GPT-4o 的结果来自 LCB 排行榜.

4. Specialized long context evals are not traditionally reported for generalist models, so we share internal runs to showcase Llama's frontier performance.

注 4: 通用模型一般不报专门的长上下文评估, 所以我们给出内部跑的结果, 展示 Llama 的前沿水平.

5. \$0.19/Mtok (3:1 blended) is our cost estimate for Llama 4 Maverick assuming distributed inference. On a single host, we project the model can be served at \$0.30-\$0.49/Mtok (3:1 blended)

注 5: 每百万 token 0.19 美元 (3:1 混合) 是我们对 Llama 4 Maverick 在分布式推理下的成本估计. 在单台主机上, 我们预计服务成本是每百万 token 0.30 到 0.49 美元 (3:1 混合). md 里美元符号前多了反斜杠, 句末少了句号.

> **看表:** LiveCodeBench 的日期区间, 各家的数是不是同一段?
> 表头给的区间是 10/01/2024-02/01/2025, 如果按 月/日/年 读, 是 2024 年 10 月 1 日到 2025 年 2 月 1 日, 截止日比发文日早两个多月; 页面没说是哪种日期写法. 注 3 说 DeepSeek v3.1 的区间不明, 所以同一格里放了两个数: 49.2 区间不明, 45.8 是 Meta 在规定区间上的内部结果. GPT-4o 的 32.3 来自 LCB 排行榜, 第 10 页 Gemini 2.0 Pro 的 36.0 也来自 LCB 排行榜, 这两个数是不是按同一个区间取的, 注里没说. 第 10 页 Behemoth 表注 1 说 Llama 的结果是 「current best internal runs」, 而 Behemoth 还在训练, 「current」 指哪一天也没写. 页眉的 2026/9/25 是打印时间, 不能拿来当这些数的日期.

Our smaller model, Llama 4 Scout, is a general purpose model with 17 billion active parameters, 16 experts, and 109 billion total parameters that delivers state-of-the-art performance for its class Llama 4 Scout dramatically increases the supported context length from 128K in Llama 3 to an industry leading 10 million tokens. This opens up a world of possibilities, including multi-document summarization, parsing extensive user activity for personalized tasks, and reasoning over vast codebases.

我们的小模型 Llama 4 Scout 是一个通用模型, 170 亿激活参数, 16 个专家, 1090 亿总参数, 在同级别里表现最好. Llama 4 Scout 把支持的上下文长度从 Llama 3 的 128K 大幅提到业界领先的 1000 万 token. 这带来很多可能, 比如多文档摘要, 解析大量用户活动来做个性化任务, 在庞大的代码库上推理. md 里 「for its class」 后面少了句号, 两句粘在一起, PDF 文本层有句号.

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

6/15

页脚, 页码 6/15.

<!-- page 7 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

页眉同第 1 页. md 把这一页的 Meta 标志标成了二级标题, 这里去掉了标题符号.

tasks such as retrieval with “retrieval needle in haystack” for text as well as cumulative negative log-likelihoods (NLLs) over 10 million tokens of code. A key innovation in the Llama 4 architecture is the use of interleaved attention layers [without positional embeddings](https://arxiv.org/abs/2305.19466). Additionally, we employ [inference time temperature scaling](https://arxiv.org/pdf/2501.19399) of attention to enhance length generalization. We call this the iRoPE architecture, where “i” stands for “interleaved” attention layers, highlighting the long-term goal of supporting “infinite” context length, and “RoPE” refers to the [rotary position embeddings](https://arxiv.org/abs/2104.09864) employed in most layers.

md 这一段从半句开始. PDF 文本层保留了被页眉挡住的前两行: "Llama 4 Scout is both pre-trained and post-trained with a 256K context length, which empowers the base model with advanced length generalization capability. We present compelling results in「. 整段意思是: Llama 4 Scout 的预训练和后训练都用 256K 上下文长度, 让基础模型有很强的长度泛化能力. 我们在一些任务上给出了有说服力的结果, 比如文本上的 」retrieval needle in haystack" (大海捞针式检索), 以及在 1000 万 token 代码上的累积负对数似然 (NLL). Llama 4 架构的一个关键创新, 是使用 [不带位置嵌入](https://arxiv.org/abs/2305.19466) 的交错注意力层. 此外, 我们在推理阶段对注意力做 [温度缩放](https://arxiv.org/pdf/2501.19399), 提升长度泛化. 我们把这叫做 iRoPE 架构: 「i」 代表 「interleaved」 (交错) 注意力层, 也点出支持 「infinite」 (无限) 上下文长度这个长期目标; 「RoPE」 指大多数层里用的 [旋转位置嵌入](https://arxiv.org/abs/2104.09864).

> **想:** 训练用的是 256K, 宣传的是 10M, 中间差在哪一步?
> 这一页 (PDF 文本层那句) 说 Scout 预训练和后训练都用 256K 上下文. 第 5 页说 mid-training 里做了 「long context extension using specialized datasets」, 然后 「unlocking best-in-class 10M input context length」. 第 6 页说上下文从 Llama 3 的 128K 提到 1000 万 token. 按 10M / 256K 算, 两者差约 39 倍. 预训练和后训练都是 256K 的话, mid-training 扩到了多长, 页面没写; 剩下的长度是靠 「length generalization」 和推理阶段的温度缩放外推, 还是训练中见过, 页面也没讲清. 第 8 页 Scout 的检索图一直画到 10M, 代码 NLL 曲线画到 10^7, 这些是结果, 不是训练长度. iRoPE 里 「without positional embeddings」 的层和用 RoPE 的层各占多少, 这一页只说 RoPE 用在 「most layers」, 没有给比例.

Llama 4 Scout

0:00 / 0:18

这里是一个 18 秒的视频框. 页面图像上画面中央写着 「Llama 4 Scout」 和大字 「Long Context」, 下面是播放条, 进度 0:00 / 0:18. md 只留下了这两行字.

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

7/15

页脚, 页码 7/15.

<!-- page 8 of 15 -->

![Chart block](images/p08-2026-9-25-13-27.png)

(图: 三块方格图并排. 左块标题 「Llama 4 Maverick」, 副标题 「Below, text NiH up to 1M tokens」, 横轴 Context Length (Tokens) 从 1K 到 1M, 纵轴 Depth (%) 从 0 到 100; 格子几乎全蓝, 在 572K 到 643K 附近, 深度 79 和 86 处各有一个白格. 中块标题 「Llama 4 Scout」, 副标题 「Below, text NiH up to 10M tokens」, 横轴从 1K 到 10M, 格子全蓝. 右块标题 「Llama 4 Scout」, 副标题 「Below, video NiH up to 20 hours, 10.4M tokens」, 横轴 Video Length (Hours) 从 2h 到 20h, 纵轴 Depth (%) 从 0 到 100; 在 12h 深度 30 和 16h 深度 40 处各有一个白格. 图上没有图例, 蓝和白各代表什么没写. NiH 即 needle in haystack. md 把这张图排在页眉前面, 文件名取成了页眉的打印时间.)

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

页眉同第 1 页.

Cumulative average NLL for code

图题: 代码的累积平均 NLL.

![Chart block](images/p08-we-trained-both-of-our-models-on-a-wide-variety-of.png)

(图: 一条蓝色折线. 横轴 Sequence Position, 对数刻度, 从 10^1 到 10^7; 纵轴 Negative Log-likelihood (Log Scale), 只标了刻度 1. 曲线从左上一路下降, 约在 10^3 附近降到 1 左右, 之后缓慢走低, 到 10^7 仍略有下降. 图上没标是哪个模型. md 把这张图的文件名取成了下面正文的开头.)

We trained both of our models on a wide variety of image and video frame stills in order to give them broad visual understanding, including of temporal activities and related images. This enables effortless interaction on multi-image inputs alongside text prompts for visual reasoning and understanding tasks. The models were pre-trained on up to 48 images, and we’ve tested in post-training with good results up to eight images.

我们在大量各式各样的图像和视频帧静图上训练了两个模型, 让它们有广泛的视觉理解能力, 包括理解随时间发生的活动和相互关联的图像. 这样模型就能轻松处理多图输入加文本提示, 完成视觉推理和理解任务. 模型预训练时最多用到 48 张图, 后训练中我们验证过, 最多 8 张图时效果良好.

> **对一下:** Maverick 的上下文长度是多少?
> 正文从头到尾没给 Maverick 的上下文长度. 第 2 页只说 Scout 和 Maverick 都有 「unprecedented context length support」, 第 5 页和第 6 页的 10M 都只挂在 Scout 名下. 1M 这个数只出现在两张图上: 第 1 页横幅写 Maverick 「Native multimodal with 1M context length」, 这一页左边的检索图写 「text NiH up to 1M tokens」, 而且这块图里有两个白格, Scout 的文本图全蓝. 第 6 页 Maverick 表把对手的长上下文格写成 「Context window is 128K」, 却没写 Maverick 自己的窗口. 1M 是 Maverick 的上限, 还是只是这张图画到的长度, 页面没说.

> **核对:** 视频检索图写 10.4M tokens, 比 10M 还多?
> 右边那块图的副标题是 「video NiH up to 20 hours, 10.4M tokens」. Scout 的上下文长度在第 1 页写 10M, 第 5 页写 「10M input context length」, 第 6 页写 「10 million tokens」. 10.4M 比 10M 多出 0.4M. 页面没说 10M 是约数, 还是按 1024 进位 (10 x 1024 x 1024 约 10.49M), 也没说 20 小时视频按什么帧率抽帧, 每帧多少 token, 怎么换算成 10.4M. 这一页正文给的多图上限是预训练 48 张, 后训练验证到 8 张, 20 小时视频折成多少帧, 和这两个上限是什么关系, 页面也没交代.

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

8/15

页脚, 页码 8/15.

<!-- page 9 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

页眉同第 1 页. 和第 7 页一样, md 把 Meta 标志标成了二级标题, 这里去掉了标题符号.

visual question answering for the LLM to better understand user intent and localize objects of interest. Llama 4 Scout also exceeds comparable models on coding, reasoning, long context, and image benchmarks and offers stronger performance than all previous Llama models.

md 这一段从半句开始. PDF 文本层保留了被页眉挡住的前两行: "Llama 4 Scout is also best-in-class on image grounding, able to align user prompts with relevant visual concepts and anchor model responses to regions in the image. This enables more precise". 整段意思是: Llama 4 Scout 在图像定位 (image grounding) 上也是同级最佳, 能把用户提示和相关的视觉概念对齐, 把模型的回答锚定到图中的区域. 这让大模型的视觉问答更精确, 更好地理解用户意图, 定位用户关心的物体. Llama 4 Scout 在编程, 推理, 长上下文和图像基准上也超过可比模型, 比之前所有 Llama 模型都强.

Llama 4 Scout instruction-tuned benchmarks

表名: Llama 4 Scout 指令微调版的基准.

<table><tr><td>Category Benchmark</td><td>Llama 4 Scout</td><td>Llama 3.3 70B</td><td>Llama 3.1 405B</td><td>Gemma 3 27B</td><td>Mistral 3.1 24B</td><td>Gemini 2.0 Flash-Lite</td></tr><tr><td>Image Reasoning MMMU</td><td>69.4</td><td rowspan="4">No multimodal support</td><td rowspan="4">No multimodal support</td><td>64.9</td><td>62.8</td><td>68.0</td></tr><tr><td>MathVista</td><td>70.7</td><td>67.6</td><td>68.9</td><td>57.6</td></tr><tr><td>Image Understanding ChartQA</td><td>88.8</td><td>76.3</td><td>86.2</td><td>73.0</td></tr><tr><td>DocVQA (test)</td><td>94.4</td><td>90.4</td><td>94.1</td><td>91.2</td></tr><tr><td>Coding LiveCodeBench (10/01/2024-02/01/2025)</td><td>32.8</td><td>33.3</td><td>27.7</td><td>29.7</td><td>—</td><td>28.9</td></tr><tr><td>Reasoning &amp; Knowledge MMLU Pro</td><td>74.3</td><td>68.9</td><td>73.4</td><td>67.5</td><td>66.8</td><td>71.6</td></tr><tr><td>GPQA Diamond</td><td>57.2</td><td>50.5</td><td>49.0</td><td>42.4</td><td>46.0</td><td>51.5</td></tr><tr><td>Long Context MTOB (half book) eng → kgv/kgv→eng</td><td>42.2/36.6</td><td rowspan="2">Context window is 128K</td><td rowspan="2">Context window is 128K</td><td rowspan="2">Context window is 128K</td><td rowspan="2">Context window is 128K</td><td> $42.3/35.1^3$ </td></tr><tr><td>MTOB (full book) eng → kgv/kgv→eng</td><td>39.7/36.3</td><td> $35.1/30.0^3$ </td></tr></table>

这张表 md 同样把类别和基准名粘在一起, 只是中间留了空格. 页面图像上每行最高分加粗: LiveCodeBench 一行加粗的是 Llama 3.3 70B 的 33.3, 不是 Scout 的 32.8. 下面拆开重排, 空格写 「无」:

| 类别 | 基准 | Llama 4 Scout | Llama 3.3 70B | Llama 3.1 405B | Gemma 3 27B | Mistral 3.1 24B | Gemini 2.0 Flash-Lite |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 图像推理 | MMMU | 69.4 | 不支持多模态 | 不支持多模态 | 64.9 | 62.8 | 68.0 |
| 图像推理 | MathVista | 70.7 | 不支持多模态 | 不支持多模态 | 67.6 | 68.9 | 57.6 |
| 图像理解 | ChartQA | 88.8 | 不支持多模态 | 不支持多模态 | 76.3 | 86.2 | 73.0 |
| 图像理解 | DocVQA (test) | 94.4 | 不支持多模态 | 不支持多模态 | 90.4 | 94.1 | 91.2 |
| 编程 | LiveCodeBench (10/01/2024-02/01/2025) | 32.8 | 33.3 | 27.7 | 29.7 | 无 | 28.9 |
| 推理与知识 | MMLU Pro | 74.3 | 68.9 | 73.4 | 67.5 | 66.8 | 71.6 |
| 推理与知识 | GPQA Diamond | 57.2 | 50.5 | 49.0 | 42.4 | 46.0 | 51.5 |
| 长上下文 | MTOB (半本书) eng→kgv / kgv→eng | 42.2/36.6 | 上下文窗口是 128K | 上下文窗口是 128K | 上下文窗口是 128K | 上下文窗口是 128K | 42.3/35.1 (注 3) |
| 长上下文 | MTOB (整本书) eng→kgv / kgv→eng | 39.7/36.3 | 上下文窗口是 128K | 上下文窗口是 128K | 上下文窗口是 128K | 上下文窗口是 128K | 35.1/30.0 (注 3) |

1. For Llama model results, we report O shot evaluation with temperature = O0 and no majority voting or parallel test time compute. For high-variance benchmarks (GPQA Diamond, LiveCodeBench), we average over multiple generations to reduce uncertainty.

注 1: 和第 6 页注 1 相同: Llama 模型按 0-shot, temperature = 0, 不做多数投票, 不在推理阶段加并行计算; 方差大的 GPQA Diamond, LiveCodeBench 对多次生成取平均. md 里的 「O shot」 和 「O0」 在页面图像上是 「0 shot」 和 「0」.

2. For non-Llama models, we source the highest available self-reported eval results unless otherwise specified. We only include evals from models that have reproducible evals (via API or open weights), and we only include non-thinking models. 3. Specialized long context evals are not traditionally reported for generalist models, so we share internal runs to showcase Llama's frontier performance.

注 2 和注 3: 非 Llama 模型取能找到的最高自报结果, 另有说明的除外; 只收录评估可复现 (通过 API 或开放权重) 的模型, 只收录非思考模型. 通用模型一般不报专门的长上下文评估, 所以给出内部跑的结果, 展示 Llama 的前沿水平. 页面图像上注 2 和注 3 分两行, md 把它们粘成了一段. 这张表的注 2 没有成本那句, 表里也没有价格行.

These new models are important building blocks that will help enable the future of human connection. In keeping with our commitment to open source, we’re making Llama 4 Maverick and Llama 4 Scout available to download on [llama.com](https://www.llama.com/llama-downloads/) and Hugging Face, with availability across the most widely used cloud and data platforms, edge silicon, and global service integrators to follow shortly.

这些新模型是重要的基础部件, 会帮助实现人与人连接的未来. 按照我们对开源的承诺, Llama 4 Maverick 和 Llama 4 Scout 可以在 [llama.com](https://www.llama.com/llama-downloads/) 和 Hugging Face 下载, 接下来很快会在最常用的云和数据平台, 边缘芯片以及全球服务集成商上提供.

**Pushing Llama to new sizes: The 2T Behemoth**

小标题: 把 Llama 推到新的规模: 2T 的 Behemoth.

We’re excited to share a preview of Llama 4 Behemoth, a teacher model that demonstrates advanced intelligence among models in its class. Llama 4 Behemoth is also a multimodal mixture-

我们很高兴预览 Llama 4 Behemoth. 它是一个老师模型, 在同级模型里展现出很高的智能水平. Llama 4 Behemoth 也是一个多模态 MoE (句子接到下一页.)

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

9/15

页脚, 页码 9/15.

<!-- page 10 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

三

页眉同第 1 页.

multilinguality, and image benchmarks, it was the perfect choice to teach the smaller Llama 4 models. We codistilled the Llama 4 Maverick model from Llama 4 Behemoth as a teacher model, resulting in substantial quality improvements across end task evaluation metrics. We developed a novel distillation loss function that dynamically weights the soft and hard targets through training. Codistillation from Llama 4 Behemoth during pre-training amortizes the computational cost of resource-intensive forward passes needed to compute the targets for distillation for the majority of the training data used in student training. For additional new data incorporated in student training, we ran forward passes on the Behemoth model to create distillation targets.

md 这一段从半句开始. PDF 文本层保留了被页眉挡住的前两行: "of-experts model, with 288B active parameters, 16 experts, and nearly two trillion total parameters. Offering state-of-the-art performance for non-reasoning models on math,". 接上一页, 整段意思是: 它是一个多模态 MoE 模型, 2880 亿激活参数, 16 个专家, 总参数将近两万亿. 它在数学, 多语言和图像基准上是非推理模型里的最好水平, 因此是教小一些的 Llama 4 模型的最佳人选. 我们以 Llama 4 Behemoth 为老师, 对 Llama 4 Maverick 做了共同蒸馏 (codistillation), 各项最终任务的评估指标都有明显的质量提升. 我们开发了一种新的蒸馏损失函数, 在训练过程中动态调整软目标和硬目标的权重. 计算蒸馏目标需要做开销很大的前向计算; 对学生训练所用的大部分数据, 这部分成本被预训练期间从 Behemoth 做的共同蒸馏分摊了. 学生训练里另外加入的新数据, 我们在 Behemoth 上单独跑前向计算来生成蒸馏目标.

> **回看:** Behemoth 的总参数是 2T 还是 「nearly two trillion」?
> 第 1 页横幅写 「2T total parameters」, 第 9 页小标题写 「The 2T Behemoth」, 这一页开头 (PDF 文本层) 写 「nearly two trillion total parameters」, 下面一段写 「a model with two trillion parameters」, 第 11 页开头写 「a two trillion parameter model」. 同一个模型, 四处按整 2T 说, 一处说 「将近」, 差多少页面没给. 激活参数 288B 和 16 个专家在第 1, 2 页和这一页一致. 用页面上的数算激活占比: Scout 17B / 109B 约 15.6%, Maverick 17B / 400B 约 4.3%, Behemoth 288B / 2T 约 14.4%. Behemoth 和 Scout 都是 16 个专家, 占比接近; 但 Behemoth 有没有共享专家, 是不是也稠密层和 MoE 层交替, 页面没写.

Llama 4 Behemoth instruction-tuned benchmarks

表名: Llama 4 Behemoth 指令微调版的基准.

| CategoryBenchmark | Llama 4 Behemoth | Claude Sonnet 3.7 | Gemini 2.0 Pro | GPT-4.5 |
| --- | --- | --- | --- | --- |
| CodingLiveCodeBench(10/01/2024-02/01/2025) | 49.4 | — | $36.0^3$ | — |
| Reasoning &amp; KnowledgeMATH-500 | 95.0 | 82.2 | 91.8 | — |
| MMLU Pro | 82.2 | — | 79.1 | — |
| GPQA Diamond | 73.7 | 68.0 | 64.7 | 71.4 |
| MultilingualMultilingual MMLU (OpenAI) | 85.8 | 83.2 | — | 85.1 |
| Image ReasoningMMMU | 76.1 | 71.8 | 72.7 | 74.4 |

这张表 md 转成了竖线表格, 类别和基准名同样粘在一起. 拆开重排, 空格写 「无」:

| 类别 | 基准 | Llama 4 Behemoth | Claude Sonnet 3.7 | Gemini 2.0 Pro | GPT-4.5 |
| --- | --- | --- | --- | --- | --- |
| 编程 | LiveCodeBench (10/01/2024-02/01/2025) | 49.4 | 无 | 36.0 (注 3) | 无 |
| 推理与知识 | MATH-500 | 95.0 | 82.2 | 91.8 | 无 |
| 推理与知识 | MMLU Pro | 82.2 | 无 | 79.1 | 无 |
| 推理与知识 | GPQA Diamond | 73.7 | 68.0 | 64.7 | 71.4 |
| 多语言 | Multilingual MMLU (OpenAI) | 85.8 | 83.2 | 无 | 85.1 |
| 图像推理 | MMMU | 76.1 | 71.8 | 72.7 | 74.4 |

1. Llama model results represent our current best internal runs.

注 1: Llama 模型的结果是我们目前内部跑出的最好结果.

3. Results are sourced from the LCB leaderboard.

注 3: 结果来自 LCB 排行榜. 页面图像上注 1 和注 3 之间还有注 2: "For non-Llama models, we source the highest available self-reported eval results, unless otherwise specified. We only include evals from models that have reproducible evals (via API or open weights) and we only include non-thinking models." md 漏了这一条. 它和第 9 页注 2 的意思相同.

Post-training a model with two trillion parameters was a significant challenge too that required us to completely overhaul and revamp the recipe, starting from the scale of data. In order to maximize performance, we had to prune 95% of the SFT data, as opposed to 50% for smaller models, to achieve the necessary focus on quality and efficiency. We also found that doing lightweight SFT followed by large-scale reinforcement learning (RL) produced even more significant improvements in reasoning and coding abilities of the model. Our RL recipe focused on sampling hard prompts by doing pass@k analysis with the policy model and crafting a training curriculum of increasing prompt hardness. We also found that dynamically filtering out prompts with zero advantage during training and constructing training batches with mixed prompts from multiple capabilities were instrumental in providing a performance boost on math, reasoning, and coding. Finally, sampling from a variety of system instructions was crucial in ensuring that the model retained its instruction following ability for reasoning and coding and was able to perform well across a variety of tasks.

后训练一个两万亿参数的模型也是很大的挑战, 我们不得不从数据规模开始, 彻底重做配方. 为了把性能做到最好, 我们剪掉了 95% 的 SFT 数据, 小模型只剪 50%, 以便把重点放在质量和效率上. 我们还发现, 先做轻量 SFT, 再做大规模强化学习 (RL), 对模型推理和编程能力的提升更明显. 我们的 RL 配方重点在两件事: 用策略模型做 pass@k 分析来采样难的提示, 按提示难度递增编排训练课程. 我们还发现, 训练中动态滤掉优势为零的提示, 用来自多种能力的混合提示组成训练批, 对提升数学, 推理和编程表现起了关键作用. 最后, 从多种系统指令里采样, 对保证模型在推理和编程时保住指令遵循能力, 并在各种任务上表现良好, 非常关键.

> **再看:** 小模型剪掉的数据是 「50%」 还是 「more than 50%」?
> 这一段说 Behemoth 剪掉 95% 的 SFT 数据, 「as opposed to 50% for smaller models」. 第 5 页讲 Maverick 时写的是 「removed more than 50% of our data tagged as easy」. 一处是整 50%, 一处是超过 50%. 口径也不一样: 第 5 页那句可以读成 「去掉了超过一半的数据, 去掉的是被标为简单的那些」, 也可以读成 「去掉了被标为简单的数据中的一半以上」, 分母不确定; 这里的分母是全部 SFT 数据. 「smaller models」 指 Maverick 一个, 还是 Maverick 和 Scout 两个, 也没写, 第 5 页整段只点了 Maverick 的名. SFT 数据总共多少条, 剪完剩多少, 全文没有数.

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

10/15

页脚, 页码 10/15.

<!-- page 11 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

on

页眉同第 1 页. 单独一行的 「on」 是被页眉挡住那一行的碎片.

for speed, which enabled faster iteration. We developed a fully asynchronous online RL training framework that enhanced flexibility. Compared to the existing distributed training framework, which sacrifices the compute memory in order to stack all models in memory, our new infrastructure enabled flexible allocation of different models to separate GPUs, balancing resources across multiple models based on computational speed. This innovation resulted in a \~10x improvement in training efficiency over previous generations.

md 这一段从半句开始. PDF 文本层保留了被挡住的开头: "Scaling RL for a two trillion parameter model also required revamping our underlying RL infrastructure due to its unprecedented scale. We optimized the design of our MoE parallelization". 整段意思是: 给两万亿参数的模型扩大 RL 规模, 规模前所未有, 也要求我们重做底层 RL 基础设施. 我们为速度优化了 MoE 并行的设计, 迭代因此更快. 我们开发了完全异步的在线 RL 训练框架, 灵活性更好. 现有的分布式训练框架为了把所有模型都堆进内存, 牺牲了计算内存; 我们的新基础设施能把不同模型灵活分配到不同的 GPU 上, 按计算速度在多个模型之间平衡资源. 这项创新让训练效率比前几代提高了约 10 倍. md 里 「\~10x」 的反斜杠是转写留下的.

**Safeguards and protections**

小标题: 安全措施和保护.

We aim to develop the most helpful and useful models while protecting against and mitigating the most severe risks. We built Llama 4 with the best practices outlined in our Developer Use Guide: AI Protections. This includes integrating mitigations at each layer of model development from pre-training to post-training to tunable system-level mitigations that shield developers from adversarial users. In doing so, we empower developers to create helpful, safe, and adaptable experiences for their Llama-supported applications.

我们的目标是做出最有帮助, 最有用的模型, 同时防范和缓解最严重的风险. 我们按 Developer Use Guide: AI Protections (开发者使用指南: AI 保护) 里的最佳实践构建 Llama 4. 这包括在模型开发的每一层都加入缓解措施, 从预训练到后训练, 再到可调节的系统级缓解措施, 帮开发者挡住恶意用户. 这样, 开发者就能为基于 Llama 的应用做出有帮助, 安全, 适应性强的体验.

**Pre- and post-training mitigations**

小标题: 预训练和后训练阶段的缓解措施. 页面图像上这是加粗的三级小标题.

For pre-training, we use data filtering in combination with other data mitigations to safeguard models. For post-training, we apply a range of techniques to ensure our models conform to policies that are helpful to users and developers, including the right level of safety data at each stage.

预训练阶段, 我们用数据过滤, 配合其他数据层面的缓解措施来保护模型. 后训练阶段, 我们用一系列技术让模型遵守对用户和开发者有帮助的政策, 包括在每个阶段放入分量合适的安全数据.

**System-level approaches**

小标题: 系统级做法. 页面图像上同样是加粗的三级小标题.

At the system-level, we have open-sourced several safeguards which can help identify and guard against potentially harmful inputs and outputs. These tools can be integrated into our Llama models and with other third-party tools:

系统层面, 我们开源了几个安全组件, 帮助识别和防范可能有害的输入和输出. 这些工具可以集成进我们的 Llama 模型, 也能和其他第三方工具配合使用:

Llama Guard: Our input/output safety large language model based on the [hazards taxonomy](https://arxiv.org/abs/2404.12241) we developed with MLCommons. Developers can use it to detect whether inputs or outputs violate the policies they’ve created for their specific application.

Llama Guard: 我们的输入输出安全大模型, 基于我们和 MLCommons 一起制定的 [危害分类体系](https://arxiv.org/abs/2404.12241). 开发者可以用它检测输入或输出是否违反了他们为自己的应用制定的政策.

Prompt Guard: A classifier model trained on a large corpus of attacks, which is capable of detecting both explicitly malicious prompts (Jailbreaks) as well as prompts that contain inject inputs (Prompt Injections).

Prompt Guard: 一个在大量攻击样本上训练的分类模型, 既能检测明显恶意的提示 (越狱, Jailbreaks), 也能检测带注入输入的提示 (提示注入, Prompt Injections).

CyberSecEval: Evaluations that help AI model and product developers understand and reduce generative AI cybersecurity risk.

CyberSecEval: 一套评估, 帮 AI 模型和产品的开发者了解并降低生成式 AI 的网络安全风险.

页面图像上这三条是圆点列表, md 去掉了圆点. PDF 文本层把这三条排在下一段后面, 页面图像和 md 都把它们放在前面.

We’ve heard from developers that these tools are most effective and helpful when they can be tailored to their applications. We provide developers with an open solution so they can create the safest and most effective experiences based on their needs. We’ll also continue working with a

我们从开发者那里听到, 这些工具能按自己的应用定制时最有效, 最有帮助. 我们给开发者一套开放的方案, 让他们按自己的需求做出最安全, 最有效的体验. 我们也会继续和 (句子接到下一页.)

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

11/15

页脚, 页码 11/15.

<!-- page 12 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

三

页眉同第 1 页. md 在这里漏了一句: 页面图像上它被页眉挡住, PDF 文本层保留了 「global set of partners to create industry-wide system standards that benefit the open source community.」 接上一页, 意思是: 我们也会继续和全球的伙伴一起, 制定对开源社区有益的全行业系统标准.

**Evaluations and red-teaming**

小标题: 评估和红队测试.

We run systematic testing of models across a wide range of scenarios and use cases in a controlled and repeatable manner. This produces data that we incorporate back into post-training.

我们以可控, 可重复的方式, 在大量场景和用途上对模型做系统性测试. 产生的数据会回流到后训练里.

We stress test our models using adversarial dynamic probing across a range of topics using automated and manual testing. We’ve made advancements in understanding and evaluating potential model risk. One example of this is our new development of Generative Offensive Agent Testing (GOAT). Using GOAT, we address the limitations of traditional red-teaming by simulating multi-turn interactions of medium-skilled adversarial actors, helping us increase our testing coverage and raise vulnerabilities faster. By adding automation to our testing toolkit, GOAT has allowed our expert human red teamers to focus on more novel adversarial areas, while the automation focuses on known risk areas. This makes the process more efficient and effective, and it enables us to build a better quantitative and qualitative picture of risk.

我们用对抗性的动态探测, 结合自动和人工测试, 在一系列话题上对模型做压力测试. 我们在理解和评估潜在模型风险上有了进展. 一个例子是我们新开发的 Generative Offensive Agent Testing (GOAT, 生成式攻击智能体测试). GOAT 模拟中等水平的对抗者做多轮交互, 弥补传统红队测试的局限, 帮我们扩大测试覆盖面, 更快暴露漏洞. 把自动化加进测试工具箱以后, 人类红队专家可以专注于更新颖的对抗领域, 自动化负责已知的风险领域. 流程因此更高效, 更有效, 我们也能从定量和定性两方面更好地把握风险.

**Addressing bias in LLMs**

小标题: 处理大模型的偏见.

It’s well-known that all leading LLMs have had issues with bias—specifically, they historically have leaned left when it comes to debated political and social topics. This is due to the types of training data available on the internet.

众所周知, 所有领先的大模型都有偏见问题: 在有争议的政治和社会话题上, 它们历来偏左. 这是互联网上能拿到的训练数据的类型造成的.

Our goal is to remove bias from our AI models and to make sure that Llama can understand and articulate both sides of a contentious issue. As part of this work, we’re continuing to make Llama more responsive so that it answers questions, can respond to a variety of different viewpoints without passing judgment, and doesn't favor some views over others.

我们的目标是去掉 AI 模型里的偏见, 让 Llama 能理解并讲清一个争议问题的两面. 作为这项工作的一部分, 我们继续让 Llama 更愿意回应: 会回答问题, 能回应各种不同观点而不下评判, 不偏向某些观点.

We have made improvements on these efforts with this release—Llama 4 performs significantly better than Llama 3 and is comparable to Grok:

这次发布在这方面有了改进, Llama 4 比 Llama 3 明显更好, 和 Grok 相当:

Llama 4 refuses less on debated political and social topics overall (from 7% in Llama 3.3 to below 2%).

在有争议的政治和社会话题上, Llama 4 总体拒答更少 (从 Llama 3.3 的 7% 降到 2% 以下).

Llama 4 is dramatically more balanced with which prompts it refuses to respond to (the proportion of unequal response refusals is now less than 1% on a set of debated topical questions).

Llama 4 在拒答哪些提示上平衡得多 (在一组有争议的话题问题上, 不对等拒答的比例现在低于 1%).

Our testing shows that Llama 4 responds with strong political lean at a rate comparable to Grok (and at half of the rate of Llama 3.3) on a contentious set of political or social topics. While we are making progress, we know we have more work to do and will continue to drive this rate further down.

我们的测试显示, 在一组有争议的政治或社会话题上, Llama 4 给出强烈政治倾向回答的比例和 Grok 相当 (是 Llama 3.3 的一半). 我们在进步, 但知道还有更多工作要做, 会继续把这个比例往下压.

页面图像上这三条是圆点列表, md 去掉了圆点.

> **停一下:** 比较对象是 Llama 3 还是 Llama 3.3?
> 这一段先说 Llama 4 「significantly better than Llama 3」, 下面三条给的数却都拿 Llama 3.3 比: 拒答率 「from 7% in Llama 3.3」, 强烈倾向 「half of the rate of Llama 3.3」. 第 6 页 Scout 那段说上下文 「from 128K in Llama 3」, 第 9 页表里标 「Context window is 128K」 的是 Llama 3.3 70B 和 Llama 3.1 405B; 第 5 页 「10x more multilingual tokens than Llama 3」 和 「more than double the Llama 3 pre-training mixture」 又只写 Llama 3. 页面先后叫过 Llama 3, 3.1, 3.3, 哪些句子里的 「Llama 3」 泛指这一代, 哪些特指某个版本, 没有交代. 强烈倾向那条只给了相对值 (一半), Llama 3.3 和 Grok 的绝对比例都没印; 不对等拒答 「低于 1%」 也没有 Llama 3.3 的对照数.

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

12/15

页脚, 页码 12/15.

<!-- page 13 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

三

页眉同第 1 页. md 在这里又漏了一句: 页面图像上它被页眉挡住, PDF 文本层保留了 「We're proud of this progress to date and remain committed to our goal of eliminating overall bias in our models.」 意思是: 我们为目前的进展自豪, 也会坚持消除模型整体偏见这个目标.

**Explore the Llama ecosystem**

小标题: 探索 Llama 生态.

While it’s important that models are intelligent, people also want models that can reply in a personalized way with human-like speed. As our most advanced models yet, Llama 4 is optimized to meet these needs.

模型聪明固然重要, 人们也希望模型能以接近真人的速度, 用个性化的方式回复. 作为我们迄今最先进的模型, Llama 4 针对这些需求做了优化.

Of course, models are one piece of the larger ecosystem that brings these experiences to life. We’re focused on the full stack, which includes new product integrations. We’re excited to continue the conversations we’re having with our partners and the open source community, and as always, we can’t wait to see the rich experiences people build in the new Llama ecosystem.

当然, 模型只是让这些体验落地的更大生态里的一部分. 我们关注整个技术栈, 包括新的产品集成. 我们很乐意继续和伙伴及开源社区交流, 也一如既往地期待大家在新的 Llama 生态里做出丰富的体验.

Download the Llama 4 Scout and Llama 4 Maverick models today on [llama.com](https://www.llama.com/llama-downloads/) and [Hugging Face](https://huggingface.co/meta-llama). Try Meta AI built with Llama 4 in WhatsApp, Messenger, Instagram Direct, and on the [Meta.AI](https://meta.ai/) website.

今天就可以在 [llama.com](https://www.llama.com/llama-downloads/) 和 [Hugging Face](https://huggingface.co/meta-llama) 下载 Llama 4 Scout 和 Llama 4 Maverick. 也可以在 WhatsApp, Messenger, Instagram Direct 和 [Meta.AI](https://meta.ai/) 网站上试用基于 Llama 4 的 Meta AI.

**This work was supported by our partners across the AI community. We’d like to thank and acknowledge (in alphabetical order): Accenture, Amazon Web Services, AMD, Arm, CentML, Cerebras, Cloudflare, Databricks, Deepinfra, DeepLearning.AI, Dell, Deloitte, Fireworks AI, Google Cloud, Groq, Hugging Face, IBM Watsonx, Infosys, Intel, Kaggle, Mediatek, Microsoft Azure, Nebius, NVIDIA, ollama, Oracle Cloud, PwC, Qualcomm, Red Hat, SambaNova, Sarvam AI, Scale AI, Scaleway, Snowflake, TensorWave, Together AI, vLLM, Wipro.**

这项工作得到了 AI 社区伙伴的支持. 我们要感谢 (按字母顺序): Accenture, Amazon Web Services, AMD, Arm, CentML, Cerebras, Cloudflare, Databricks, Deepinfra, DeepLearning.AI, Dell, Deloitte, Fireworks AI, Google Cloud, Groq, Hugging Face, IBM Watsonx, Infosys, Intel, Kaggle, Mediatek, Microsoft Azure, Nebius, NVIDIA, ollama, Oracle Cloud, PwC, Qualcomm, Red Hat, SambaNova, Sarvam AI, Scale AI, Scaleway, Snowflake, TensorWave, Together AI, vLLM, Wipro. 一共 38 个名字. 页面图像上这段是斜体, md 转成了加粗.

Join us in the pursuit of what’s possible with AI.

招聘横幅上的字: 和我们一起探索 AI 的可能.

[**See all open positions**](https://www.metacareers.com/jobs/?is_leadership=0&sub_teams%5B0%5D=Artificial+Intelligence&is_in_page=0&fbclid=IwAR0O8BF7opOj5gASJmwYVGalPPXTLu-6xrl9w00eC7Rarp2HQ9uEH8tERFw)

横幅上的链接: 查看所有空缺职位.

Related Posts

栏目标题: 相关文章. 下面两页是三篇相关文章和网站页脚.

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

13/15

页脚, 页码 13/15.

<!-- page 14 of 15 -->

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

∞Meta

页眉同第 1 页.

![Image block](images/p14-image.png)

(图: 三条横线的菜单图标, 就是页眉右上角那个按钮. 前几页它被识别成汉字 「三」, 这一页被抠成了图.)

![Image block](images/p14-open-source.png)

(图: 第一篇相关文章的封面, 页面上只剩下半截: 蓝色背景, 两只手捧着一个水晶球, 球面是足球的纹路, 下面垫着红布.)

Open Source

栏目: 开源.

How Sevilla FC is discovering future soccer stars with Llama

相关文章标题: 塞维利亚足球俱乐部如何用 Llama 发掘未来的足球明星.

February 28, 2025

日期 2025 年 2 月 28 日.

![Image block](images/p14-read-post-https-ai-meta-com-blog-sevilla-fc-scout.png)

(图: 圆圈里一个向右的箭头, 是 「Read post」 前面的图标.)

[**Read post**](https://ai.meta.com/blog/sevilla-fc-scout-advisor-llama-ibm-watsonx/)

链接: 阅读文章.

F E AT U R E D

下一张封面左上角的 FEATURED 标签, md 把字母拆开了.

Looking at Llama's impact in 2024 and the path ahead

封面上的大字: 回看 Llama 在 2024 年的影响和前路. 这行字 PDF 文本层里没有, 是 md 从封面图上识别出来的.

![Image block](images/p14-large-language-model-the-future-of-ai-built-with-llama.png)

(图: 第二篇相关文章的封面. 深蓝转墨绿的背景, 左上 FEATURED 标签, 下面小字 OPEN SOURCE 和三行大字 「Looking at Llama's impact in 2024 and the path ahead」, 左下角 Meta 标志; 右边是一组牛顿摆, 最右一个球被拉起, 发着光.)

Large Language Model The future of AI: Built with Llama December 19, 2024

栏目: 大语言模型. 文章标题: 「AI 的未来: 用 Llama 构建」. 日期 2024 年 12 月 19 日. 页面上这三项分三行排, md 并成了一行. 封面上的字和文章标题不是同一句.

![Image block](images/p14-read-post-https-ai-meta-com-blog-future-of-ai-built.png)

(图: 同样的右箭头图标.)

[Read post](https://ai.meta.com/blog/future-of-ai-built-with-llama/)

链接: 阅读文章. md 把这一行标成了二级标题, 这里去掉了标题符号.

![Image block](images/p14-https-ai-meta-com-blog-llama-4-multimodal-intelligence.png)

(图: 第三篇相关文章的封面. 深蓝背景上一张节点连线图, 许多节点里画着音符, 一条高亮的路径从左边的大音符连到右边的大音符; 左下角 Meta 标志, 右下角 「AI at Meta」. 这篇的标题和日期在下一页. md 把文件名取成了页脚网址.)

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

14/15

页脚, 页码 14/15.

<!-- page 15 of 15 -->

![Image block](images/p15-2026-9-25-13-27.png)

(图: 右箭头图标, 属于第三篇相关文章的 「Read post」. md 把它排在页眉前面, 文件名取成了页眉的打印时间.)

2026/9/25 13:27

The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation

页眉同第 1 页.

ecomme

第三篇相关文章的标题在 md 里只剩这一截. 页面图像上标题被页眉挡住, 只露出最后一行的下缘. PDF 文本层保留了完整标题: 「How Spotify is using Llama to create personalized recommendations and enhance content discovery」, 意思是: Spotify 如何用 Llama 做个性化推荐, 改进内容发现.

December 18, 2024

日期 2024 年 12 月 18 日.

[Read post](https://ai.meta.com/blog/spotify-personalized-recommendations-built-with-llama/)

链接: 阅读文章. md 同样把这一行标成了二级标题, 这里去掉了标题符号.

- Search AI content
- [Meta AI](https://ai.meta.com/meta-ai/assistant/)
- [Muse](https://ai.meta.com/muse/)
- [AI Research](https://ai.meta.com/research)
- Resources
- [About](https://ai.meta.com/about)
- [Privacy Policy](https://www.facebook.com/about/privacy/) Meta © 2026
- [Terms](https://www.facebook.com/policies/)
- [Cookies](https://www.facebook.com/policies/cookies/)

网站页脚: 搜索框 「搜索 AI 内容」, 然后是折叠菜单 Meta AI, Muse, AI Research (AI 研究), Resources (资源), About (关于), 最下面是 Privacy Policy (隐私政策), Terms (条款), Cookies. 「Meta © 2026」 在页面图像上位于右下角, md 把它并进了 Privacy Policy 那一行. 2026 是版权年份, 和打印时间同年, 发文日期仍是 2025 年 4 月 5 日.

![Image block](images/p15-https-ai-meta-com-blog-llama-4-multimodal-intelligence.png)

(图: 四个圆形社交图标, 依次是 Facebook, Twitter, LinkedIn, YouTube.)

https://ai.meta.com/blog/llama-4-multimodal-intelligence/

15/15

页脚, 页码 15/15.
