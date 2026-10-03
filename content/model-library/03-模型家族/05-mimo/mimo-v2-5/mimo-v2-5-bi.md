<!-- page 1 of 6 -->

XiaomiMIMO

[Back to Home](https://mimo.xiaomi.com/)

April 22nd, 2026

# Xiaomi MiMo-V2.5 # Xiaomi MiMo-V2.5

**A leap in agency and multimodality.**

**智能体能力与多模态的一次跃升.**

[**Try it now ›**](https://aistudio.xiaomimimo.com/)

[**Access API ›**](https://platform.xiaomimimo.com/)

[**Hugging Face ›**](https://huggingface.co/XiaomiMiMo/MiMo-V2.5)

## Introducing MiMo-V2.5 ## 介绍 MiMo-V2.5

**Today, we are releasing MiMo-V2.5, a major step forward in agentic capability and** multimodal understanding. With native visual and audio understanding, MiMo **V2.5 reasons seamlessly across modalities, surpasses MiMo-V2-Pro in agentic performance, and supports up to 1 million tokens of context.**



**今天我们发布 MiMo-V2.5, 在智能体能力与多模态理解上迈出重要一步. 原生具备视觉与音频理解, MiMo V2.5 可跨模态无缝推理, 智能体表现超过 MiMo-V2-Pro, 并支持最长 1 million tokens 的上下文.**

**MiMo-V2.5 is a 310B-parameter Sparse MoE model (15B active) trained on 48T tokens. Its language backbone inherits from** [**MiMo-V2-Flash**](https://github.com/XiaomiMiMo/MiMo-V2-Flash)**'s hybrid sliding window attention architecture, augmented with dedicated visual and audio encoders (both pretrained in-house) connected through lightweight projectors.**



**MiMo-V2.5 是 310B 参数的稀疏 MoE 模型 (15B 激活), 在 48T tokens 上训练. 语言骨干继承自** [**MiMo-V2-Flash**](https://github.com/XiaomiMiMo/MiMo-V2-Flash) **的 hybrid sliding window attention 架构, 并配上自研预训练的专用视觉与音频编码器, 经轻量 projector 接入.**

> **想:** 页 1 写 Sparse MoE, 总参 310B, 激活 15B, 训练 48T tokens, 骨干来自 MiMo-V2-Flash 的 hybrid sliding window attention. 报告有没有专家池大小, top-k, 或 sliding window 的窗长 / 混合比?
> 没有. 规格停在 310B / 15B / 48T 与 「hybrid sliding window attention」 这一句. 专家拓扑与窗配置要回 Flash 技术报告, 不能从本产品页反推.

<!-- page 2 of 6 -->

![Image block](images/p02-mimo-v2-5-architecture.png)

MiMo-V2.5 architecture.



MiMo-V2.5 架构.

**Training goes through five stages: text pre-training on diverse corpora to build the LLM backbone; projector warmup to align the audio and visual projectors with the language model; multimodal pre-training at scale on high-quality cross-modal data; supervised fine-tuning and agentic post-training, during which the context window is progressively extended from 32K to 256K to 1M; and finally RL and** [**MOPD**](https://arxiv.org/html/2601.02780v2#S4)**, which further strengthens perception, reasoning, and agentic capabilities.**



**训练分五阶段: 在多样语料上做文本预训练以搭起 LLM 骨干; projector warmup, 把音频与视觉 projector 对齐到语言模型; 在高质量跨模态数据上做大规模多模态预训练; 再做 supervised fine-tuning 与智能体后训练, 其间上下文窗口按 32K → 256K → 1M 逐步外扩; 最后是 RL 与** [**MOPD**](https://arxiv.org/html/2601.02780v2#S4)**, 继续加强感知, 推理与智能体能力.**

**Together, these stages yield a single model that sees, hears, and acts on what it perceives — one that understands everything and gets things done.**



**五阶段合在一起, 得到单一模型: 能看, 能听, 并就所感知采取行动 — 既理解, 也能把事做完.**

> **问:** 架构图里音频路径写 Audio Tokenizer → Local Transformer → Audio Projector, 视觉路径写 MiMo ViT → Visual Projector, 骨干标 MiMo Hybrid-SWA Backbone, 顶上并列 LM Head 与 MTP Block. 正文 「lightweight projectors」 与图上的 Local Transformer / MTP 是什么关系?
> 正文只强调自研编码器 + 轻量 projector 接入 Flash 式 hybrid SWA 骨干. Local Transformer 与 MTP Block 出现在图里, 页内没有再给层宽, 接受长度或训练权重. 读图可记下组件名; 机制深度要以图注可见部分为准, 不把 Flash 报告的 MTP 数字直接安到本页.

> **核对:** 五阶段里上下文按 32K → 256K → 1M 外扩, 发生在 「supervised fine-tuning and agentic post-training」. 开源表里 Base 是 256K, 正式 MiMo-V2.5 是 1M. 怎么对齐?
> 训练叙述把 32K/256K/1M 写成后训练渐进外扩; 开源表把 Base 写在 256K, 正式版写在 1M. 页内没有说 Base 是否停在外扩中途, 也没有给出 YaRN 或其它外推算法名. 选型时分记: 训练日程有三段窗口, 公开发布规格是 Base 256K / V2.5 1M.

## Best-in-Class Agency ## 一流智能体表现

<!-- page 3 of 6 -->

On the agentic benchmarks that matter most for real-world deployment, MiMo **V2.5 delivers best-in-class performance:**



在最贴近真实部署的智能体基准上, MiMo V2.5 给出一流表现:

![Chart block](images/p03-in-our-internal-mimo-coding-bench-mimo-v2-5-delivers.png)

**In our internal MiMo Coding Bench, MiMo-V2.5 delivers strong results on** everyday coding tasks, closing the gap with frontier models and matching MiMo **V2.5-Pro at half the cost.**



**在内部 MiMo Coding Bench 上, MiMo-V2.5 在日常编码任务上成绩强, 拉近与前沿模型的差距, 并以一半成本对齐 MiMo V2.5-Pro.**

**On Claw-Eval, a benchmark for daily agentic tasks, MiMo-V2.5 achieves a 62.3 on the general subset, placing it at the Pareto frontier of performance and efficiency.**



**在面向日常智能体任务的 Claw-Eval 上, MiMo-V2.5 在 general subset 拿到 62.3, 落在性能与效率的 Pareto 前沿.**

**These results highlight what makes MiMo-V2.5 unique: frontier-level agentic capability with high token efficiency.**



**这些结果突出 MiMo-V2.5 的卖点: 前沿级智能体能力, 同时 token 效率高.**

> **看表:** 柱图橙柱可读: MiMo Coding Bench 71.8, Claw-Eval Text 62.3, Terminal-Bench 2.0 65.8, SWE-Bench Pro 56.1. 图例对照含 MiMo-V2-Pro, Kimi K2.6, DeepSeek-V4-Flash, Claude Opus 4.6, Gemini 3.1 Pro, GPT-5.4. 正文 「half the cost」 有没有给出美元或 credit 数?
> 没有. 「matching MiMo V2.5-Pro at half the cost」 是文案主张; 同页柱图只给分数. Token Plan 在页 5 才写 1x / 2x credit, 且未声明 Coding Bench 评测成本按该倍率计.

> **拆开:** 页 1 写超过 **MiMo-V2-Pro**; 页 3 写对齐 **MiMo V2.5-Pro** 且半价; 柱图图例是 **MiMo-V2-Pro**. 这是同一型号的不同写法, 还是两档产品?
> 本页同时出现 MiMo-V2-Pro, MiMo V2.5-Pro 与图例 MiMo-V2-Pro. 页 5 Token Plan 又单列 MiMo-V2.5-Pro — 2x. 产品页没有对照表解释三者是否同一 checkpoint. 精读时保留页内原名, 不要私自合并成一个型号.

## Sharper Perception, Longer Horizon ## 更锐利的感知, 更长的视野

**MiMo-V2.5 delivers sharper perception for precise visual reasoning, complex chart analysis, and deep multimodal understanding, with native support for up to 1**



**MiMo-V2.5 在精细视觉推理, 复杂图表分析与深度多模态理解上给出更锐利的感知, 并原生支持最长 1**

<!-- page 4 of 6 -->

million tokens of context.



million tokens 的上下文.

![Chart block](images/p04-image-understanding.png)

IMAGE UNDERSTANDING



图像理解

![Chart block](images/p04-multimodal-agent.png)

MULTIMODAL AGENT



多模态智能体

![Chart block](images/p04-chart.png)

![Chart block](images/p04-video-understanding.png)

VIDEO UNDERSTANDING



视频理解

![Chart block](images/p04-chart-2.png)

![Chart block](images/p04-chart-3.png)

![Chart block](images/p04-chart-4.png)

![Chart block](images/p04-chart-5.png)

![Chart block](images/p04-across-image-video-and-multimodal-agentic-tasks-mimo-v2.png)

**Across image, video, and multimodal agentic tasks, MiMo-V2.5 stays level with frontier closed-source models — matching Gemini 3 Pro on video, Claude Sonnet 4.6 on multimodal agentic work, and staying competitive across image and document understanding. All from one unified model.**



**在图像, 视频与多模态智能体任务上, MiMo-V2.5 与前沿闭源模型持平 — 视频对齐 Gemini 3 Pro, 多模态智能体工作对齐 Claude Sonnet 4.6, 图像与文档理解保持竞争力. 以上都来自同一统一模型.**

> **确认:** 页 4 分面图可见标签与橙柱分数包括 CharXiv RQ 81.0, MMMU-Pro 77.9, Claw-Eval Multimodal 23.8, Video-MME 87.7, DailyOmni 83.5, VideoHolmes 64.0; 另有未印基准名的分面柱 (橙 88.5, 以及橙 87.2). 正文 「matching Gemini 3 Pro on video」 有没有点名具体视频榜?
> 正文只写视频对齐 Gemini 3 Pro, 未点名单榜. 图上 Video-MME 橙 87.7 对星标灰柱 88.4, VideoHolmes 橙 64.0 对星标 64.2, 接近但页内未声明星标柱就是 Gemini 3 Pro. 引用时分写文案主张与图内可读分数.

> **回看:** IMAGE UNDERSTANDING / MULTIMODAL AGENT / VIDEO UNDERSTANDING 三组标题与多张分面柱并排. 图例另含 MiMo-V2-Omni, Kimi K2.6, Claude Opus 4.6, Claude Sonnet 4.6, Gemini 3 Pro, GPT-5.4. 页内有没有说明 Omni 与 V2.5 的关系, 或评测 temperature / shot 协议?
> 没有. Omni 只出现在图例色块. 协议, 采样次数与是否 Thinking 模式均未写. 读榜只取柱顶数字与可见标签, 不做协议外推.

<!-- page 5 of 6 -->

## Open Source ## 开源

**The MiMo-V2.5 series is now fully open-sourced. Weights, tokenizer, and the full model card are available on Hugging Face.**



**MiMo-V2.5 系列现已完整开源. 权重, tokenizer 与完整 model card 可在 Hugging Face 获取.**

| Model | Total Params | Active Params | Context | Precision | Download |
| --- | --- | --- | --- | --- | --- |
| MiMo-V2.5-Base | 310B | 15B | 256K | FP8 (E4M3)Mixed | HuggingFace |
| MiMo-V2.5 | 310B | 15B | 1M | FP8 (E4M3)Mixed | HuggingFace |

## Token Plan Update ## Token Plan 更新

**Alongside stronger models, your Token Plan gets better too. Rates are now simpler and lower:**



**模型更强的同时, Token Plan 也更好. 费率更简单, 也更低:**

**MiMo-V2.5 — 1x (1 token = 1 credit)**



**MiMo-V2.5 — 1x (1 token = 1 credit)**

**MiMo-V2.5-Pro — 2x (1 token = 2 credits)**



**MiMo-V2.5-Pro — 2x (1 token = 2 credits)**

**From today onward, Token Plans no longer charge a multiplier for the 1M-token context window.** [**Order your Token Plan now**](https://platform.xiaomimimo.com/docs/tokenplan/subscription)**.**



**即日起, Token Plan 不再对 1M-token 上下文窗口加收倍率.** [**立即订购 Token Plan**](https://platform.xiaomimimo.com/docs/tokenplan/subscription)**.**

> **停一下:** 开源表只有 MiMo-V2.5-Base 与 MiMo-V2.5 两行, 都是 310B / 15B, Precision 写 FP8 (E4M3)Mixed. Token Plan 却单列 MiMo-V2.5-Pro — 2x. Pro 权重是否同表开源?
> 开源表未出现 Pro 行. Pro 在本页主要作为半价对照与 2x 计费档出现. 不能从本页推断 Pro 已开源或总参不同.

> **再看:** 「no longer charge a multiplier for the 1M-token context window」 与正式版 Context 1M 并读. 这是部署前把窗口做到 1M, 还是推理时 TestingTime 加价取消?
> 页内把它写成 Token Plan 计费变更: 1M 窗口不再另乘倍率. 训练侧 32K→256K→1M 是部署前日程外扩. 二者都不是 「靠加长采样换分」 的 TestingTime 叙事; 本页也没有给出 reasoning_effort 或并行轨迹档.

## What's Next ## 下一步

**MiMo-V2.5 brings frontier agency and native multimodality into the same model, at a price point that makes both practical for production. We are already training the next generation with deeper reasoning, tighter tool integration, and richer real-**



**MiMo-V2.5 把前沿智能体能力与原生多模态放进同一模型, 价位也让二者适合生产. 下一代已在训练, 目标是更深推理, 更紧的工具集成, 以及更丰富的真实**

<!-- page 6 of 6 -->

**world grounding. In the meantime,** [**try it in AI Studio**](https://aistudio.xiaomimimo.com/) **or** [**access the API**](https://platform.xiaomimimo.com/) **— we cannot wait to see what you build.**



**世界 grounding. 眼下可先** [**在 AI Studio 试用**](https://aistudio.xiaomimimo.com/) **或** [**接入 API**](https://platform.xiaomimimo.com/) **— 很期待看到你们做出什么.**

Xiaomi MiMo Team · 2026



小米 MiMo 团队 · 2026

> **对一下:** MOPD 链到 [arxiv html 2601.02780v2 §4](https://arxiv.org/html/2601.02780v2#S4), 即 MiMo-V2-Flash 技术报告的后训练节. 本 6 页产品页有没有复述 MOPD 的三阶段公式或教师域名单?
> 没有. 本页只把 「RL and MOPD」 写成第五阶段口号并外链. Multi-Teacher On-Policy Distillation 的机制细节属于 Flash 报告, 不在本页展开.
