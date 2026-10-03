---
title: "Llama 3.3 · 对照译稿"
category: "模型库"
tags: ["Llama", "对照译稿"]
published: true
excerpt: "Llama 3.3 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 5 -->

## Meta Llama 3.3 — Official Model Card

Meta Llama 3.3 官方模型卡. 这是一张模型卡, 不是技术报告, 5 页里没有图.

Source: https://raw.githubusercontent.com/meta-llama/llama-models/main/models/llama3_3/MODEL_CARD.md

来源是 meta-llama/llama-models 仓库里 models/llama3_3/MODEL_CARD.md 的原始文件.

**Model Information**

模型信息

The Meta Llama 3.3 multilingual large language model (LLM) is a pretrained and instruction tuned generative model in 70B (text in/text out). The Llama 3.3 instruction tuned text only model is optimized for multilingual dialogue use cases and outperforms many of the available open source and closed chat models on common industry benchmarks.

Meta Llama 3.3 多语言大语言模型 (LLM) 是一个经过预训练和指令微调的生成式模型, 规模 70B (文本进, 文本出). Llama 3.3 的指令微调纯文本模型针对多语言对话场景做了优化, 卡上说它在常见的行业基准上胜过许多现有的开源和闭源聊天模型.

**Model developer**: Meta

模型开发者: Meta.

**Model Architecture:** Llama 3.3 is an auto-regressive language model that uses an optimized transformer architecture. The tuned versions use supervised fine-tuning (SFT) and reinforcement learning with human feedback (RLHF) to align with human preferences for helpfulness and safety.

模型架构: Llama 3.3 是自回归语言模型, 用的是一种优化过的 transformer 架构. 微调版本用监督微调 (SFT) 和基于人类反馈的强化学习 (RLHF), 让模型在有用性和安全性上对齐人类偏好.

| | Training Data | Params | Input modalities | Output modalities | Context length | GQA | Token count | Knowledge cutoff |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Llama 3.3 (text only) | A new mix of publicly available online data. | 70B | Multilingual Text | Multilingual Text and code | 128k | Yes | 15T+ | December 2023 |

| | 训练数据 | 参数 | 输入模态 | 输出模态 | 上下文长度 | GQA | token 数 | 知识截止 |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Llama 3.3 (纯文本) | 公开可得的在线数据的新配比. | 70B | 多语言文本 | 多语言文本和代码 | 128k | 是 | 15T+ | 2023 年 12 月 |

**Supported languages:** English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.

支持的语言: 英语, 德语, 法语, 意大利语, 葡萄牙语, 印地语, 西班牙语, 泰语.

**Llama 3.3 model**. Token counts refer to pretraining data only. All model versions use Grouped-Query Attention (GQA) for improved inference scalability.

Llama 3.3 模型. token 数只指预训练数据. 所有模型版本都用分组查询注意力 (GQA), 用来改善推理阶段的可扩展性.

> **拆开:** 架构这一栏到底印了哪些东西?
> 三样: 自回归, 「optimized transformer architecture」, GQA. 表里 GQA 一格写 Yes, 下面一句又说 「All model versions」 都用 GQA. 可这张卡只有一行模型, 规模只有 70B, 「所有版本」 指哪几个, 卡上没列. 层数, 隐藏维度, 注意力头数一个都没印, 我不补.

> **核对:** 门户表 Llama 3.3 那一行的几格, 卡上能找到出处吗?
> 一部分能. 门户表写 70B, 128K, TikToken-based. 70B 卡上有. 128K 卡上印的是小写 128k, 同一个数. 分词器卡上一个字都没提, TikToken-based 这一格在这 5 页里找不到出处. 反过来, 卡上的 15T+ 和 December 2023 门户表也没有.

**Model Release Date:**

* **70B Instruct: December 6, 2024**

模型发布日期:

* 70B Instruct: 2024 年 12 月 6 日

> **看表:** 卡上自己印了几次 70B?
> 第 1 页三处: 开头一句 「in 70B」, 表里 Params 一格 70B, 发布日期 「70B Instruct」. 第 2 页能耗表还有一行 「Llama 3.3 70B」, 第 2 页基准表有一列 「Llama-3.3 70B Instruct」. 没有第二个规模. 开头说它是 「pretrained and instruction tuned」, 用途一节也提到 pretrained models 可以改作别的生成任务, 但发布日期只列了 70B Instruct 一行. 预训练版有没有单独发布, 哪天发布, 卡上没写.

> **对一下:** 卡上的发布日期和门户表一样吗?
> 不一样. 门户表 Llama 3.3 一行的 Launch date 是 12/04/2024, 按那张表别的行 (7/18/2023, 4/18/2024) 读成月/日/年, 是 2024 年 12 月 4 日. 这张卡写 December 6, 2024. 差两天. 两边都没有解释, 卡上也没提 12 月 4 日. 我只记两个日期各自的出处, 不替任何一边改.

**Status:** This is a static model trained on an offline dataset. Future versions of the tuned models will be released as we improve model safety with community feedback.

状态: 这是在离线数据集上训练的静态模型. 随着我们借社区反馈改进模型安全, 会陆续发布微调模型的后续版本.

**License** A custom commercial license, the Llama 3.3 Community License Agreement, is available at: [https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/LICENSE](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/LICENSE)

许可证: 一份定制的商业许可证, 名为 Llama 3.3 Community License Agreement, 全文在 meta-llama/llama-models 仓库的 models/llama3_3/LICENSE.

Where to send questions or comments about the model Instructions on how to provide feedback or comments on the model can be found in the model [README](https://github.com/meta-llama/llama3). For more technical information about generation parameters and recipes for how to use Llama 3.3 in applications, please go [here](https://github.com/meta-llama/llama-recipes).

关于模型的问题或意见发到哪里: 反馈方式写在模型的 README 里. 生成参数的更多技术信息, 以及在应用里使用 Llama 3.3 的做法 (recipes), 见 llama-recipes 仓库. 原文 「Where to send questions or comments about the model」 后面没有标点, 直接接下一句.

> **问:** 许可证这一段, 卡上到底写了哪些条款?
> 一条也没写. 只有名字, 性质和链接: 名字是 Llama 3.3 Community License Agreement, 性质是 「custom commercial license」. 条款正文不在这 5 页里. 门户表 License 一格也只剩链接文字 License. 两边都读不出任何使用门槛. 第 2 页能耗表里的 700 是单卡功率的瓦数, 对应正文 「TDP of 700W」, 和许可证无关. 另外反馈用的 README 链接指向 meta-llama/llama3 仓库, 不是 llama3_3 自己的目录.

**Intended Use**

预期用途

**Intended Use Cases** Llama 3.3 is intended for commercial and research use in multiple languages. Instruction tuned text only models are intended for assistant-like chat, whereas pretrained models can be adapted for a variety of natural language generation tasks. The Llama 3.3 model also supports the ability to leverage the outputs of its models to improve other models including synthetic data generation and distillation. The Llama 3.3 Community License allows for these use cases.

预期使用场景: Llama 3.3 面向多种语言的商业和研究用途. 指令微调的纯文本模型用于类似助手的聊天, 预训练模型可以改作各种自然语言生成任务. Llama 3.3 也支持用它的输出去改进其他模型, 包括生成合成数据和蒸馏. Llama 3.3 Community License 允许这些用途.

**Out-of-scope** Use in any manner that violates applicable laws or regulations (including trade compliance laws). Use in any other way that is prohibited by the Acceptable Use Policy and Llama 3.3 Community License. Use in languages beyond those explicitly referenced as supported in this model card.

超出范围: 以任何违反适用法律法规 (包括贸易合规法律) 的方式使用. 以 Acceptable Use Policy 和 Llama 3.3 Community License 禁止的其他方式使用. 在本模型卡明确列为支持的语言之外使用. 原文这句末尾多出一对转义星号, 这里略去.

<!-- page 2 of 5 -->

Note: Llama 3.3 has been trained on a broader collection of languages than the 8 supported languages. Developers may fine-tune Llama 3.3 models for languages beyond the 8 supported languages provided they comply with the Llama 3.3 Community License and the Acceptable Use Policy and in such cases are responsible for ensuring that any uses of Llama 3.3 in additional languages is done in a safe and responsible manner.

注: Llama 3.3 训练时用到的语言比 8 种支持语言更多. 开发者可以把 Llama 3.3 微调到这 8 种之外的语言, 前提是遵守 Llama 3.3 Community License 和 Acceptable Use Policy. 这种情况下, 由开发者负责确保 Llama 3.3 在额外语言上的使用安全, 负责任.

**Hardware and Software**

硬件和软件

**Training Factors** We used custom training libraries, Meta's custom built GPU cluster, and production infrastructure for pretraining. Fine-tuning, annotation, and evaluation were also performed on production infrastructure.

训练因素: 预训练用了自研训练库, Meta 自建的 GPU 集群和生产基础设施. 微调, 标注和评测也在生产基础设施上完成.

**Training Energy Use** Training utilized a cumulative of 39.3M GPU hours of computation on H100-80GB (TDP of 700W) type hardware, per the table below. Training time is the total GPU time required for training each model and power consumption is the peak power capacity per GPU device used, adjusted for power usage efficiency.

训练能耗: 训练累计用了 39.3M GPU 小时的算力, 硬件是 H100-80GB (TDP 700W), 见下表. 训练时间是训练每个模型所需的 GPU 总时间, 功耗是所用每块 GPU 设备的峰值功率容量, 已按电能使用效率调整.

**Training Greenhouse Gas Emissions** Estimated total location-based greenhouse gas emissions were 11,390 tons CO2eq for training. Since 2020, Meta has maintained net zero greenhouse gas emissions in its global operations and matched 100% of its electricity use with renewable energy, therefore the total market-based greenhouse gas emissions for training were 0 tons CO2eq.

训练的温室气体排放: 训练的基于地点的温室气体排放估计共 11,390 吨 CO2eq. 自 2020 年起, Meta 全球运营保持温室气体净零排放, 并用可再生能源匹配了 100% 的用电, 所以训练的基于市场的温室气体排放总量为 0 吨 CO2eq.

| | Training Time (GPU hours) | Training Power Consumption (W) | Training Location-Based Greenhouse Gas Emissions (metric tons CO2eq) | Training Market-Based Greenhouse Gas Emissions (metric tons CO2eq) |
| :---- | :---: | :---: | :---: | :---: |
| Llama 3.3 70B | 7.0M | 700 | 12.9 | 0 |

| | 训练时间 (GPU 小时) | 训练功耗 (W) | 基于地点的训练排放 (公吨 CO2eq) | 基于市场的训练排放 (公吨 CO2eq) |
| :---- | :---: | :---: | :---: | :---: |
| Llama 3.3 70B | 7.0M | 700 | 12.9 | 0 |

> **停一下:** 正文的 39.3M 和表里的 7.0M 应该是同一个量吗?
> 按字面应该是. 正文说 「per the table below」, 表头也是 GPU hours, 表里却只有一行 Llama 3.3 70B, 7.0M. 39.3 是 7.0 的五倍多, 表里没有第二行能把差额补上. 卡上没说 39.3M 算没算别的模型或别的阶段. 我只记: 正文 39.3M, 表 7.0M, 两处矛盾.

The methodology used to determine training energy use and greenhouse gas emissions can be found [here](https://arxiv.org/pdf/2204.05149). Since Meta is openly releasing these models, the training energy use and greenhouse gas emissions will not be incurred by others.

确定训练能耗和温室气体排放的方法见 arXiv 2204.05149. 由于 Meta 公开发布这些模型, 其他人不必再承担这部分训练能耗和排放.

> **再看:** 排放数字也有同样的问题吗?
> 有. 正文写基于地点的排放 11,390 吨 CO2eq, 表里同一列是 12.9 公吨 CO2eq. 11,390 除以 12.9 约为 883, 不是吨和公吨能解释的差别. 基于市场的一列两边都是 0, 这一格对得上. 700 一格是瓦, 和正文 「TDP of 700W」 一致. 这一段还用了复数 「these models」, 可表里只有一个模型.

**Training Data**

训练数据

**Overview:** Llama 3.3 was pretrained on ~15 trillion tokens of data from publicly available sources. The fine-tuning data includes publicly available instruction datasets, as well as over 25M synthetically generated examples.

概述: Llama 3.3 在约 15 万亿 token 的公开来源数据上预训练. 微调数据包括公开的指令数据集, 以及超过 25M 条合成样本.

**Data Freshness:** The pretraining data has a cutoff of December 2023.

数据时效: 预训练数据截止到 2023 年 12 月.

> **确认:** 表里的 15T+ 和这里的 ~15 trillion 是一回事吗?
> 量级一样, 修饰不一样. 第 1 页表格写 15T+, 加号是 「超过」. 这里写 ~15 trillion, 波浪号是 「大约」. 两处都只指预训练数据, 和第 1 页 「Token counts refer to pretraining data only」 对得上. 25M 合成样本属于微调数据, 不算进 15T. 截止日期两处都是 2023 年 12 月.

**Benchmarks - English Text**

基准: 英文文本

In this section, we report the results for Llama 3.3 relative to our previous models.

这一节报告 Llama 3.3 相对于我们之前模型的结果.

**Instruction tuned models**

指令微调模型

| Category | Benchmark | # Shots | Metric | Llama 3.1 8B Instruct | Llama 3.1 70B Instruct | Llama-3.3 70B Instruct | Llama 3.1 405B Instruct |
| :---- | :---- | ----- | :---- | ----- | ----- | ----- | ----- |
| General | MMLU (CoT) | 0 | macro_avg/acc | 73.0 | 86.0 | 86.0 | 88.6 |
| | MMLU Pro (CoT) | 5 | macro_avg/acc | 48.3 | 66.4 | 68.9 | 73.3 |
| Steerability | IFEval | | | 80.4 | 87.5 | 92.1 | 88.6 |
| Reasoning | GPQA Diamond (CoT) | 0 | acc | 31.8 | 48.0 | 50.5 | 49.0 |
| Code | HumanEval | 0 | pass@1 | 72.6 | 80.5 | 88.4 | 89.0 |
| | MBPP EvalPlus (base) | 0 | pass@1 | 72.8 | 86.0 | 87.6 | 88.6 |

| 类别 | 基准 | 示例数 | 指标 | Llama 3.1 8B Instruct | Llama 3.1 70B Instruct | Llama-3.3 70B Instruct | Llama 3.1 405B Instruct |
| :---- | :---- | ----- | :---- | ----- | ----- | ----- | ----- |
| 通用 | MMLU (CoT) | 0 | macro_avg/acc | 73.0 | 86.0 | 86.0 | 88.6 |
| | MMLU Pro (CoT) | 5 | macro_avg/acc | 48.3 | 66.4 | 68.9 | 73.3 |
| 可控性 | IFEval | | | 80.4 | 87.5 | 92.1 | 88.6 |
| 推理 | GPQA Diamond (CoT) | 0 | acc | 31.8 | 48.0 | 50.5 | 49.0 |
| 代码 | HumanEval | 0 | pass@1 | 72.6 | 80.5 | 88.4 | 89.0 |
| | MBPP EvalPlus (base) | 0 | pass@1 | 72.8 | 86.0 | 87.6 | 88.6 |

> **回看:** 第 1 页说它胜过许多开源和闭源聊天模型, 这张表撑得住那句话吗?
> 撑不住. 表里四列全是 Meta 自己的模型: Llama 3.1 8B, 70B, 405B 和 Llama-3.3 70B. 没有一列闭源模型, 也没有别家的开源模型. 小节开头也只说 「relative to our previous models」. IFEval 一行的 Shots 和 Metric 两格是空的, 92.1 用的什么设定, 卡上没印. 列名里只有 3.3 这一列写成 「Llama-3.3」, 带连字符, 其余三列没有.

<!-- page 3 of 5 -->

| Category | Benchmark | # Shots | Metric | Llama 3.1 8B Instruct | Llama 3.1 70B Instruct | Llama-3.3 70B Instruct | Llama 3.1 405B Instruct |
| :---- | :---- | ----- | :---- | ----- | ----- | ----- | ----- |
| Math | MATH (CoT) | 0 | sympy_intersection_score | 51.9 | 68.0 | 77.0 | 73.8 |
| Tool Use | BFCL v2 | 0 | overall_ast_summary/macro_avg/valid | 65.4 | 77.5 | 77.3 | 81.1 |
| Multilingual | MGSM | 0 | em | 68.9 | 86.9 | 91.1 | 91.6 |

| 类别 | 基准 | 示例数 | 指标 | Llama 3.1 8B Instruct | Llama 3.1 70B Instruct | Llama-3.3 70B Instruct | Llama 3.1 405B Instruct |
| :---- | :---- | ----- | :---- | ----- | ----- | ----- | ----- |
| 数学 | MATH (CoT) | 0 | sympy_intersection_score | 51.9 | 68.0 | 77.0 | 73.8 |
| 工具使用 | BFCL v2 | 0 | overall_ast_summary/macro_avg/valid | 65.4 | 77.5 | 77.3 | 81.1 |
| 多语言 | MGSM | 0 | em | 68.9 | 86.9 | 91.1 | 91.6 |

第 3 页原页只有这三行, 没有重印表头. 这里的表头沿用第 2 页.

> **想:** 这三行里, 3.3 70B 比 3.1 70B 都高吗?
> 不是. MATH (CoT) 77.0 对 68.0, 还高过 405B 的 73.8. MGSM 91.1 对 86.9. BFCL v2 却是 77.3 对 77.5, 比 3.1 70B 低 0.2. 回到第 2 页, MMLU (CoT) 两者都是 86.0, 持平. 另外小节标题是 「Benchmarks - English Text」, MGSM 这一行的类别却写 Multilingual, 标题和内容不完全一致.

**Responsibility & Safety**

责任与安全

As part of our Responsible release approach, we followed a three-pronged strategy to managing trust and safety risks:

* Enable developers to deploy helpful, safe and flexible experiences for their target audience and for the use cases supported by Llama.
* Protect developers against adversarial users aiming to exploit Llama capabilities to potentially cause harm.
* Provide protections for the community to help prevent the misuse of our models.

作为负责任发布做法的一部分, 我们用三方面的策略管理信任与安全风险:

* 让开发者能为目标用户, 在 Llama 支持的用例里部署有用, 安全, 灵活的体验.
* 保护开发者, 防范企图利用 Llama 能力造成伤害的对抗性用户.
* 为社区提供保护, 帮助防止我们的模型被滥用.

**Responsible deployment**

负责任的部署

Llama is a foundational technology designed to be used in a variety of use cases, examples on how Meta's Llama models have been responsibly deployed can be found in our [Community Stories webpage](https://llama.meta.com/community-stories/). Our approach is to build the most helpful models enabling the world to benefit from the technology power, by aligning our model safety for the generic use cases addressing a standard set of harms. Developers are then in the driver seat to tailor safety for their use case, defining their own policy and deploying the models with the necessary safeguards in their Llama systems. Llama 3.3 was developed following the best practices outlined in our Responsible Use Guide, you can refer to the [Responsible Use Guide](https://llama.meta.com/responsible-use-guide/) to learn more.

Llama 是一项基础技术, 设计上用于多种用例. Meta 的 Llama 模型被负责任部署的例子, 可以在 Community Stories 网页上看到. 我们的做法是打造最有用的模型, 让世界从这项技术中受益, 办法是针对通用用例, 围绕一组标准的危害类型做模型安全对齐. 之后由开发者主导, 按自己的用例定制安全, 定义自己的策略, 并在自己的 Llama 系统里带着必要的防护措施部署模型. Llama 3.3 按 Responsible Use Guide 里的最佳实践开发, 详见该指南.

**Llama 3.3 instruct**

Llama 3.3 指令版

Our main objectives for conducting safety fine-tuning are to provide the research community with a valuable resource for studying the robustness of safety fine-tuning, as well as to offer developers a readily available, safe, and powerful model for various applications to reduce the develoderationsper workload to deploy safe AI systems. For more details on the safety mitigations implemented please read the Llama 3 paper.

做安全微调的主要目标有两个: 给研究社区提供一份研究安全微调稳健性的有用资源, 以及给开发者提供一个现成, 安全, 强大的模型, 用于各种应用, 减轻开发者部署安全 AI 系统的工作量. 已实施的安全缓解措施的更多细节, 请看 Llama 3 论文.

**Fine-tuning data**

微调数据

We employ a multi-faceted approach to data collection, combining human-generated data from our vendors with synthetic data to mitigate potential safety risks. We've developed many large language model (LLM)-based classifiers that enable us to thoughtfully select high-quality prompts and responses, enhancing data quality control.

我们用多方面的办法收集数据, 把供应商提供的人工数据和合成数据结合起来, 以缓解潜在的安全风险. 我们开发了许多基于大语言模型 (LLM) 的分类器, 用来细致地挑选高质量的提示和回复, 加强数据质量控制.

**Refusals and Tone**

拒答与语气

Building on the work we started with Llama 3, we put a great emphasis on model refusals to benign prompts as well as refusal tone. We included both borderline and adversarial prompts in our safety data strategy, and modified our safety data responses to follow tone guidelines.

在 Llama 3 时开始的工作基础上, 我们很重视模型对良性提示的拒答, 以及拒答时的语气. 安全数据策略里同时放进了边界提示和对抗性提示, 并修改了安全数据里的回复, 使其符合语气准则.

> **问:** 这几段讲的安全微调, 是 3.3 专门做的吗?
> 卡上没分清. 细节让读者去看 「Llama 3 paper」, 拒答一段开头是 「Building on the work we started with Llama 3」. 这几段没有一个 3.3 自己的安全数字. 句中 「reduce the develoderationsper workload」 是原文的乱码, 按上下文应是 developer workload, PDF 和 md 里都这样印, 中文按 developer 译.

**Llama 3.3 systems**

Llama 3.3 系统

**Large language models, including Llama 3.3, are not designed to be deployed in isolation but instead should be deployed as part of an overall AI system with additional safety guardrails as required.** Developers are expected to deploy system safeguards when building agentic systems. Safeguards are key to achieve the right helpfulness-safety alignment as well as mitigating safety and security risks inherent to the system and any integration of the model or system with external tools.

**大语言模型, 包括 Llama 3.3, 不是为单独部署设计的, 应当作为整个 AI 系统的一部分部署, 并按需要加上额外的安全护栏.** 开发者在构建 agent 系统时, 应当部署系统级防护. 防护措施是取得恰当的有用性与安全性平衡的关键, 也用来缓解系统本身, 以及模型或系统与外部工具集成时固有的安全风险.

As part of our responsible release approach, we provide the community with [safeguards](https://llama.meta.com/trust-and-safety/) that developers should deploy with Llama models or other LLMs,

作为负责任发布做法的一部分, 我们向社区提供一些防护措施 (safeguards), 开发者应当把它们和 Llama 模型或其他 LLM 一起部署, (这句接到下一页)

<!-- page 4 of 5 -->

including Llama Guard 3, Prompt Guard and Code Shield. All our [reference implementations](https://github.com/meta-llama/llama-agentic-system) demos contain these safeguards by default so developers can benefit from system-level safety out-of-the-box.

(接上一页) 包括 Llama Guard 3, Prompt Guard 和 Code Shield. 我们所有的参考实现演示都默认带着这些防护措施, 开发者拿来就能得到系统级的安全.

**Capability-specific considerations**

针对特定能力的考虑

**Tool-use**: Just like in standard software development, developers are responsible for the integration of the LLM with the tools and services of their choice. They should define a clear policy for their use case and assess the integrity of the third party services they use to be aware of the safety and security limitations when using this capability. Refer to the Responsible Use Guide for best practices on the safe deployment of the third party safeguards.

工具使用: 和普通软件开发一样, 开发者负责把 LLM 和自己选的工具, 服务集成起来. 他们应当为自己的用例定下清楚的策略, 并评估所用第三方服务的可靠性, 以便了解使用这项能力时的安全局限. 第三方防护措施的安全部署, 最佳实践见 Responsible Use Guide.

**Multilinguality**: Llama 3.3 supports 7 languages in addition to English: French, German, Hindi, Italian, Portuguese, Spanish, and Thai. Llama may be able to output text in other languages than those that meet performance thresholds for safety and helpfulness. We strongly discourage developers from using this model to converse in non-supported languages without implementing finetuning and system controls in alignment with their policies and the best practices shared in the Responsible Use Guide.

多语言: 除英语外, Llama 3.3 支持 7 种语言: 法语, 德语, 印地语, 意大利语, 葡萄牙语, 西班牙语, 泰语. Llama 也许能输出其他语言的文本, 但那些语言没有达到安全和有用性的性能门槛. 我们强烈不建议开发者在没有做微调和系统控制的情况下, 用这个模型以不支持的语言对话. 微调和系统控制要符合开发者自己的策略, 以及 Responsible Use Guide 里的最佳实践.

> **核对:** 第 4 页的语言名单和第 1 页一样吗?
> 一样. 第 1 页列 8 种: English, German, French, Italian, Portuguese, Hindi, Spanish, Thai. 这里写 「7 languages in addition to English」, 列 French, German, Hindi, Italian, Portuguese, Spanish, Thai, 加上英语正好是同样 8 种, 只是顺序换了. 第 1 页把支持语言之外的使用列为超出范围, 第 2 页的注又允许在遵守许可证的前提下微调到其他语言, 这里说不做微调和系统控制就别用. 三处合起来读: 不微调就别用, 微调了责任在开发者.

**Evaluations**

评估

We evaluated Llama models for common use cases as well as specific capabilities. Common use cases evaluations measure safety risks of systems for most commonly built applications including chat bot, coding assistant, tool calls. We built dedicated, adversarial evaluation datasets and evaluated systems composed of Llama models and Llama Guard 3 to filter input prompt and output response. It is important to evaluate applications in context, and we recommend building dedicated evaluation dataset for your use case. Prompt Guard and Code Shield are also available if relevant to the application.

我们针对常见用例和特定能力评估了 Llama 模型. 常见用例评估衡量最常搭建的应用 (聊天机器人, 编程助手, 工具调用) 在系统层面的安全风险. 我们构建了专门的对抗性评估数据集, 评估由 Llama 模型加 Llama Guard 3 组成的系统, Llama Guard 3 用来过滤输入提示和输出回复. 在具体场景里评估应用很重要, 我们建议为自己的用例建专门的评估数据集. 如果和应用相关, 也可以用 Prompt Guard 和 Code Shield.

Capability evaluations measure vulnerabilities of Llama models inherent to specific capabilities, for which were crafted dedicated benchmarks including long context, multilingual, tools calls, coding or memorization.

能力评估衡量 Llama 模型在特定能力上固有的弱点, 为此专门做了基准, 覆盖长上下文, 多语言, 工具调用, 编程或记忆.

**Red teaming**

红队测试

For both scenarios, we conducted recurring red teaming exercises with the goal of discovering risks via adversarial prompting and we used the learnings to improve our benchmarks and safety tuning datasets. We partnered early with subject-matter experts in critical risk areas to understand the nature of these real-world harms and how such models may lead to unintended harm for society. Based on these conversations, we derived a set of adversarial goals for the red team to attempt to achieve, such as extracting harmful information or reprogramming the model to act in a potentially harmful capacity. The red team consisted of experts in cybersecurity, adversarial machine learning, responsible AI, and integrity in addition to multilingual content specialists with background in integrity issues in specific geographic markets. .

两种场景下, 我们都反复做了红队演练, 目标是通过对抗性提示发现风险, 并用得到的经验改进基准和安全微调数据集. 我们很早就和关键风险领域的专家合作, 了解这些现实危害的性质, 以及这类模型可能怎样给社会带来意外伤害. 根据这些交流, 我们给红队定了一组要尝试达成的对抗目标, 例如套出有害信息, 或者改写模型的行为让它以可能有害的方式行事. 红队成员包括网络安全, 对抗性机器学习, 负责任 AI 和诚信方面的专家, 还有在特定地区市场的诚信问题上有背景的多语言内容专家. 原文这句末尾多了一个句点, 印成 「. .」.

**Critical and other risks**

关键风险和其他风险

**We specifically focused our efforts on mitigating the following critical risk areas:**

我们特别着力缓解以下关键风险领域:

**1- CBRNE (Chemical, Biological, Radiological, Nuclear, and Explosive materials) helpfulness**

1- CBRNE (化学, 生物, 放射性, 核和爆炸物) 方面的帮助

To assess risks related to proliferation of chemical and biological weapons of the Llama 3 family of models, we performed uplift testing designed to assess whether use of the Llama models could meaningfully increase the capabilities of malicious actors to plan or carry out attacks using these types of weapons.

为评估 Llama 3 系列模型在化学和生物武器扩散方面的风险, 我们做了能力提升 (uplift) 测试, 用来判断使用 Llama 模型能不能实质性地提高恶意行为者策划或实施这类武器攻击的能力.

**2. Child Safety**

2. 儿童安全

Child Safety risk assessments were conducted using a team of experts, to assess the model's capability to produce outputs that could result in Child Safety risks and inform on any necessary and appropriate risk mitigations via fine tuning. We leveraged those expert red teaming sessions to expand the coverage of our evaluation benchmarks through Llama 3 model development. For Llama 3, we conducted new in-depth sessions using objective based methodologies to assess the model risks along multiple attack vectors including the additional languages Llama 3 is trained on. We also partnered with content specialists to perform red

儿童安全风险评估由一个专家团队完成, 用来评估模型产生可能导致儿童安全风险的输出的能力, 并据此决定需要通过微调做哪些必要, 恰当的风险缓解. 在 Llama 3 模型开发过程中, 我们借这些专家红队环节扩大了评估基准的覆盖面. 针对 Llama 3, 我们用基于目标的方法做了新的深入环节, 沿多个攻击向量评估模型风险, 包括 Llama 3 训练时涉及的额外语言. 我们还和内容专家合作开展红队 (这句接到下一页)

> **确认:** 关键风险这几段评估的对象是 3.3 吗?
> 字面上是 Llama 3. CBRNE 一段写 「the Llama 3 family of models」, 儿童安全一段写 「through Llama 3 model development」 和 「For Llama 3」. 第 5 页网络攻击一段也写 「the Llama 3 family of LLMs」. 卡上没说这些评估在 3.3 上重做过, 也没有给任何结果数字.

<!-- page 5 of 5 -->

teaming exercises assessing potentially violating content while taking account of market specific nuances or experiences.

(接上一页) 演练, 评估可能违规的内容, 同时考虑各市场特有的细微差别和经验.

**3. Cyber attack enablement**

3. 助长网络攻击

Our cyber attack uplift study investigated whether the Llama 3 family of LLMs can enhance human capabilities in hacking tasks, both in terms of skill level and speed. Our attack automation study focused on evaluating the capabilities of LLMs when used as autonomous agents in cyber offensive operations, specifically in the context of ransomware attacks. This evaluation was distinct from previous studies that considered LLMs as interactive assistants. The primary objective was to assess whether these models could effectively function as independent agents in executing complex cyber-attacks without human intervention.

我们的网络攻击能力提升研究考察了 Llama 3 系列 LLM 能否在黑客任务上增强人的能力, 包括技能水平和速度两方面. 攻击自动化研究着重评估 LLM 作为自主 agent 用于网络进攻行动时的能力, 具体场景是勒索软件攻击. 这项评估和以往把 LLM 当作交互式助手的研究不同. 主要目标是判断这些模型能否在没有人干预的情况下, 作为独立 agent 有效执行复杂的网络攻击.

**Community**

社区

Generative AI safety requires expertise and tooling, and we believe in the strength of the open community to accelerate its progress. We are active members of open consortiums, including the AI Alliance, Partnership on AI and MLCommons, actively contributing to safety standardization and transparency. We encourage the community to adopt taxonomies like the MLCommons Proof of Concept evaluation to facilitate collaboration and transparency on safety and content evaluations. Our Purple Llama tools are open sourced for the community to use and widely distributed across ecosystem partners including cloud service providers. We encourage community contributions to our [Github repository](https://github.com/meta-llama/PurpleLlama).

生成式 AI 的安全需要专业知识和工具, 我们相信开放社区的力量能加快这方面的进展. 我们是多个开放联盟的活跃成员, 包括 AI Alliance, Partnership on AI 和 MLCommons, 积极参与安全标准化和透明度建设. 我们鼓励社区采用 MLCommons Proof of Concept 评估这类分类体系, 方便在安全和内容评估上协作, 保持透明. 我们的 Purple Llama 工具已开源给社区使用, 并广泛分发到包括云服务商在内的生态伙伴. 欢迎社区向我们的 Github 仓库贡献.

We also set up the [Llama Impact Grants](https://llama.meta.com/llama-impact-grants/) program to identify and support the most compelling applications of Meta's Llama model for societal benefit across three categories: education, climate and open innovation. The 20 finalists from the hundreds of applications can be found [here](https://llama.meta.com/llama-impact-grants/#finalists).

我们还设立了 Llama Impact Grants 项目, 在教育, 气候和开放创新三个类别里, 发掘并资助用 Meta 的 Llama 模型造福社会的最有说服力的应用. 从数百份申请中选出的 20 个决赛入围者见项目页面.

Finally, we put in place a set of resources including an [output reporting mechanism](https://developers.facebook.com/llama_output_feedback) and [bug bounty program](https://www.facebook.com/whitehat) to continuously improve the Llama technology with the help of the community.

最后, 我们建立了一组资源, 包括输出上报机制和漏洞赏金计划, 借助社区持续改进 Llama 技术.

**Ethical Considerations and Limitations**

伦理考虑与局限

The core values of Llama 3.3 are openness, inclusivity and helpfulness. It is meant to serve everyone, and to work for a wide range of use cases. It is thus designed to be accessible to people across many different backgrounds, experiences and perspectives. Llama 3.3 addresses users and their needs as they are, without insertion unnecessary judgment or normativity, while reflecting the understanding that even content that may appear problematic in some cases can serve valuable purposes in others. It respects the dignity and autonomy of all users, especially in terms of the values of free thought and expression that power innovation and progress.

Llama 3.3 的核心价值是开放, 包容和有用. 它想服务所有人, 适用于广泛的用例. 因此它的设计让不同背景, 经历和观点的人都能使用. Llama 3.3 按用户本来的样子回应用户和他们的需求, 不加不必要的评判或规范要求, 同时认识到, 有些内容在某些情况下看起来有问题, 在另一些情况下却可能有价值. 它尊重所有用户的尊严和自主, 尤其是推动创新和进步的思想自由与表达自由. 原文 「without insertion unnecessary judgment」 少了一个 of, 照原样保留.

But Llama 3.3 is a new technology, and like any new technology, there are risks associated with its use. Testing conducted to date has not covered, nor could it cover, all scenarios. For these reasons, as with all LLMs, Llama 3.3's potential outputs cannot be predicted in advance, and the model may in some instances produce inaccurate, biased or other objectionable responses to user prompts. Therefore, before deploying any applications of Llama 3.3 model, developers should perform safety testing and tuning tailored to their specific applications of the model. Please refer to available resources including our [Responsible Use Guide](https://llama.meta.com/responsible-use-guide), [Trust and Safety](https://llama.meta.com/trust-and-safety/) solutions, and other [resources](https://llama.meta.com/docs/get-started/) to learn more about responsible development.

但 Llama 3.3 是一项新技术, 和任何新技术一样, 使用它有风险. 到目前为止做过的测试没有覆盖, 也不可能覆盖所有场景. 因此, 和所有 LLM 一样, Llama 3.3 可能给出的输出无法事先预料, 模型有时会对用户提示给出不准确, 有偏见或其他令人反感的回复. 所以在部署任何基于 Llama 3.3 的应用之前, 开发者应当针对自己的具体应用做安全测试和调优. 想进一步了解负责任的开发, 请看 Responsible Use Guide, Trust and Safety 方案和其他资源.

> **对一下:** 知识截止和发布日期隔了多久, 卡上怎么交代这段空档?
> 第 1 页表格和第 2 页都写截止 2023 年 12 月, 发布日期是 2024 年 12 月 6 日, 隔了一年. 状态一栏说这是在离线数据集上训练的静态模型, 这一节又说到目前为止的测试没有覆盖所有场景. 卡上没说这一年里数据有没有补过, 只说微调模型的后续版本会随安全改进发布.
