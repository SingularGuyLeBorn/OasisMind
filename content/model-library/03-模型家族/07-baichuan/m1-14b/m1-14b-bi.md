<!-- page 1 of 33 -->

arXiv:2502.12671v2 [cs.CL] 5 Mar 2025

百川智能

# Baichuan-M1: Pushing the Medical Capability of Large Language Models 推高大语言模型医学能力的 Baichuan-M1

**Baichuan Inc.**<sup>∗</sup>

## Abstract

The current generation of large language models (LLMs) is typically designed for broad, general-purpose applications, while domain-specific LLMs, especially in vertical fields like medicine, remain relatively scarce. In particular, the development of highly efficient and practical LLMs for the medical domain is challenging due to the complexity of medical knowledge and the limited availability of high-quality data. To bridge this gap, we introduce Baichuan-M1, a series of large language models specifically optimized for medical applications. Unlike traditional approaches that simply continue pretraining on existing models or apply post-training to a general base model, Baichuan-M1 is trained from scratch with a dedicated focus on enhancing medical capabilities. Our model is trained on 20 trillion tokens and incorporates a range of effective training methods that strike a balance between general capabilities and medical expertise. As a result, Baichuan-M1 not only performs strongly across general domains such as mathematics and coding but also excels in specialized medical fields. We have open-sourced Baichuan-M1-14B, a mini version of our model, which can be accessed through the following links.

当前这一代大语言模型大多面向宽泛的通用场景设计, 面向特定领域的模型, 尤其是医学这类垂直领域, 仍然偏少. 医学知识复杂, 高质量数据又稀缺, 想做出既高效又实用的医学大模型并不容易. 为补上这块空白, 我们推出 Baichuan-M1, 一个专为医学应用优化的大语言模型系列. 传统做法要么在现成模型上继续预训练, 要么在通用底座上做后训练; Baichuan-M1 则从零开始训练, 从一开始就把医学能力当作重点. 模型在 20 万亿 token 上训练, 并结合一组有效的训练方法, 在通用能力与医学专长之间取得平衡. 结果是, Baichuan-M1 不仅在数学, 代码等通用领域表现强劲, 在专业医学领域也很出色. 我们开源了该模型的小尺寸版本 Baichuan-M1-14B, 可通过以下链接获取.

[https://github.com/baichuan-inc/Baichuan-M1-14B](https://github.com/baichuan-inc/Baichuan-M1-14B)

[https://hf.co/baichuan-inc/Baichuan-M1-14B-Base](https://hf.co/baichuan-inc/Baichuan-M1-14B-Base)

[https://hf.co/baichuan-inc/Baichuan-M1-14B-Instruct](https://hf.co/baichuan-inc/Baichuan-M1-14B-Instruct)

> **想:** Abstract 说模型在 20 万亿 token 上训练. Table 1 按语种把 20T 切成 12T/4T/2T/2T, §4.2 又按阶段切成 12T + 6T + 2T. 这两种切法说的是同一个 20T 吗, 其中有没有重复样本?
> 两种切法的总量都落在 20T, 但口径不同. Table 1 是数据构成, §4.2 是训练日程里实际消耗的 token. §2.1 明确对高质量数据做最多十倍的上采样, 所以 20T 是含重复的训练预算, 不是去重后的唯一 token 数. 全文没有给出去重后的唯一 token 量, §2 开头那句 「select over 20T tokens of high-quality training data」 也没有区分这两层.

![Image block](images/p01-figure-1-the-medical-capability-of-baichuan-m1-14b.png)

Figure 1: The medical capability of Baichuan-M1-14B compared with other models.

图 1: Baichuan-M1-14B 与其他模型的医学能力对比.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>∗</sup>The contribution of this paper are shown in A. Correspondent: daniel@baichuan-inc.com.</span></small>

<small>∗ 本文贡献者名单见附录 A. 通讯联系: daniel@baichuan-inc.com.</small>

<!-- page 2 of 33 -->

百川智能

## 1 Introduction

The rapid development of large language models (LLMs) has revolutionized the modern artificial intelligent by providing advanced capabilities in tasks such as natural language understanding, machine translation, text generation, and code generation. Sparked by the great success of ChatGPT OpenAI (2022), models like GPT-4 OpenAI (2023) and Deepseek-R1 Guo et al. (2025); DeepSeek-AI et al. (2024) have demonstrated the vast potential of LLMs in handling general-purpose applications. These general-purpose models have opened up new possibilities across industries, from customer service to education Adeshola & Adepoju (2024); Spurlock et al. (2024). However, despite their widespread success in broad domains, the application of LLMs in specialized fields, particularly vertical domains such as medical, remains underexplored and presents unique challenges.

大语言模型的快速发展, 在自然语言理解, 机器翻译, 文本生成与代码生成等任务上带来了先进能力, 彻底改变了现代人工智能. 在 ChatGPT (OpenAI, 2022) 的巨大成功带动下, GPT-4 (OpenAI, 2023) 与 Deepseek-R1 (Guo et al., 2025; DeepSeek-AI et al., 2024) 等模型展示了大模型处理通用任务的巨大潜力. 这些通用模型为从客服到教育的各行各业打开了新可能 (Adeshola & Adepoju, 2024; Spurlock et al., 2024). 然而, 尽管在宽泛领域大获成功, 大模型在专业领域, 特别是医学这类垂直领域的应用, 仍然探索不足, 并且面临独特挑战.

In the medical domain, the application of LLMs is both highly promising and profoundly challenging. Unlike more general applications, medical knowledge is complex, deeply specialized, and highly dynamic Sanaei et al. (2023); Wang & Zhang (2024). Medical literature is vast, containing a wealth of information across a wide array of disciplines, including pharmacology, diagnostics, treatment protocols, and patient care. Furthermore, the language used in medical practice is often precise, technical, and sometimes ambiguous, requiring models to possess a high level of domain expertise to understand and generate contextually appropriate responses Singhal et al. (2025); Taylor et al. (2022). Traditional LLMs, while effective in general tasks, struggle to maintain this level of nuance and precision when applied to such specialized fields.

在医学领域, 大模型的应用前景广阔, 难度也极大. 与一般应用不同, 医学知识复杂, 高度专业, 而且更新很快 (Sanaei et al., 2023; Wang & Zhang, 2024). 医学文献体量庞大, 横跨药理学, 诊断学, 治疗方案与患者护理等众多学科. 医疗实践中的语言往往精确, 技术性强, 有时还带歧义, 模型必须具备很高的领域专长, 才能理解并生成贴合语境的回答 (Singhal et al., 2025; Taylor et al., 2022). 传统大模型在通用任务上有效, 用到这类专业领域时却难以保持这种细腻与精确.

A critical challenge in developing effective LLMs for the medical field is the availability of high-quality, domain-specific data. Medical data is often difficult to access due to privacy concerns, regulatory restrictions, and the complexity of medical terminologies. Moreover, the available data is often a mix of structured and unstructured information, encompassing clinical notes, research papers, medical textbooks, and more Taylor et al. (2022). This makes it difficult to effectively pretrain models that can generalize across the full spectrum of medical knowledge. In response to these challenges, recent efforts have focused on finetuning general-purpose LLMs on medical datasets or applying transfer learning approaches Wang et al. (2024b); Zhang et al. (2023); Singhal et al. (2025); Chen et al. (2024c). However, these methods often fail to capture the full depth and specificity of medical knowledge, resulting in models that may perform well in certain tasks but lack the expertise needed for more complex medical queries.

开发有效医学大模型的一个关键难点, 是高质量领域数据是否可得. 出于隐私顾虑, 监管限制以及医学术语的复杂性, 医学数据往往难以获取. 现有数据又常是结构化与非结构化信息的混合, 涵盖临床记录, 研究论文, 医学教科书等 (Taylor et al., 2022). 这使得预训练出能覆盖医学知识全谱的模型变得困难. 为应对这些挑战, 近期工作多集中于在医学数据集上微调通用大模型, 或采用迁移学习方法 (Wang et al., 2024b; Zhang et al., 2023; Singhal et al., 2025; Chen et al., 2024c). 但这些方法常常抓不住医学知识的深度与特异性, 得到的模型在某些任务上表现不错, 面对更复杂的医学问题却缺乏所需的专业能力.

In this paper, we introduce Baichuan-M1, a new series of large language models specifically trained for medical applications. Unlike traditional approaches that rely on continuing pretraining or post-training on general models, Baichuan-M1 is built from the ground up with a dedicated focus on medical expertise. The model is trained on 20 trillion tokens, including general data such as code and books, and medical related data such as clinical data, and patient-related information, using techniques that balance general language capabilities with specialized medical knowledge. This approach ensures that Baichuan-M1 excels not only in general areas like mathematics and coding, but also in specialized medical tasks such as diagnostic support, medical research, and treatment recommendations. Additionally, we introduce an enhanced Transformer architecture taking a balance between efficiency and effectiveness. Moreover, we incorporate a sophisticated training process that progressively refines the model’s medical capabilities, ensuring continuous improvement in its performance on medical but also the general domain.

本文提出 Baichuan-M1, 一个专为医学应用训练的新大语言模型系列. 传统方法依赖在通用模型上继续预训练或做后训练, Baichuan-M1 则从底层搭起, 专注医学专长. 模型在 20 万亿 token 上训练, 既有代码, 书籍等通用数据, 也有临床数据与患者相关信息等医学数据, 所用技术兼顾通用语言能力与专业医学知识. 这样, Baichuan-M1 不仅在数学, 代码等通用方向表现出色, 在诊断辅助, 医学研究与治疗建议等专业医学任务上也同样出色. 此外, 我们提出一种在效率与效果间取得平衡的改进 Transformer 架构, 并设计了逐步打磨医学能力的精细训练流程, 使模型在医学乃至通用领域上的表现持续提升.

The Baichuan-M1 series represents a significant step forward in the development of large language models for healthcare. By focusing on a vertical domain like medicine, we aim to push the boundaries of what LLMs can achieve in fields where precision and reliability are critical. This paper outlines the key features of Baichuan-M1, including its architecture, training methodology, and performance across both general and specialized tasks. We also present comparative results that demonstrate the model’s ability to tackle medical queries with higher accuracy and relevance than general-purpose LLMs, marking a major leap toward the next generation of medical AI.

Baichuan-M1 系列是医疗大模型发展中的重要一步. 通过聚焦医学这样的垂直领域, 我们希望在精确与可靠至关重要的场景中, 推高大模型能力的边界. 本文介绍 Baichuan-M1 的关键特性, 包括架构, 训练方法以及在通用与专业任务上的表现. 我们还给出对比结果, 说明该模型回答医学问题时比通用大模型更准确, 更切题, 这是迈向下一代医学 AI 的一大步.

<!-- page 3 of 33 -->

百川智能

## 2 Data 数据

Our pre-training process consists of several key components. First, we carefully design filtering and scoring mechanisms, leveraging the Baichuan series models to select over 20T tokens of high-quality training data. Second, we classify the data into different domains and apply strategic data mixing methods. We dedicate significant effort to collecting detailed medical data and design a three-stage pre-training process that gradually increases the proportion and complexity of medical data while extending the context window to enhance long-context understanding. Third, we meticulously develop a synthetic data strategy for high-quality medical data, generating over 100 billion high-quality medical reasoning tokens. Below, we provide a detailed explanation of our data preparation and training methodology.

我们的预训练流程由几个关键部分组成. 第一, 精心设计过滤与打分机制, 借助百川系列模型筛出超过 20T token 的高质量训练数据. 第二, 把数据划分到不同领域, 并采用有策略的数据混合方法. 我们花大量精力收集细致的医学数据, 设计三阶段预训练流程, 逐步提高医学数据的占比与复杂度, 同时扩展上下文窗口以增强长上下文理解. 第三, 精心制定面向高质量医学数据的合成策略, 生成超过 100B 的高质量医学推理 token. 下面详细说明数据准备与训练方法.

### 2.1 General Data 通用数据

Powerful medical capabilities are inseparable from strong general capabilities. We develop a multilingual general dataset with a total size of 20T tokens. The specific proportions of different languages are detailed in Table 1, covering the top 30 mainstream languages worldwide. The improvements of general data stem from several key aspects:

强大的医学能力离不开扎实的通用能力. 我们构建了总量 20T token 的多语种通用数据集, 各语种的具体占比见 Table 1, 覆盖全球前 30 种主流语言. 通用数据的改进来自以下几个方面:

| Language | English | Chinese | Multilingual | Code | Total |
| --- | --- | --- | --- | --- | --- |
| Token Count | 12T | 4T | 2T | 2T | 20T |

Table 1: Dataset Composition

表 1: 数据集构成

(1) **Global Deduplication and Upsampling Strategies.** Deduplication is a critical step in constructing high-quality training datasets for LLM pre-training, directly impacting both data quality and the effective training capacity of the model. We apply global deduplication across multilingual and multi-source data while recording the duplication count for each document, similar to Txt360 (Tang et al., 2024). Documents without any duplicate matches may indicate lower quality or sparse distribution (Penedo et al., 2024). To address this issue, we implement controlled upsampling based on the natural distribution of document duplication counts, ensuring a higher proportion of high-quality data. Figure 2 presents the performance curves of the model under the global deduplication and data upsampling strategies, where the deduplication curve represents the global deduplication strategy, and the "Deduplication + Upsampling" curve represents the strategy of first performing global deduplication and then upsampling based on document duplication counts. We trained a 3B model on approximately 1T tokens from scratch using an architecture similar to Baichuan M1. The results demonstrate that the Deduplication + Upsampling strategy achieves significantly better performance compared to global deduplication alone. Furthermore, compared to single-bucket deduplication, the Deduplication + Upsampling strategy provides better control over the total token count, allowing for a more balanced and effective training process.

(1) **全局去重与上采样策略.** 去重是构建大模型预训练高质量数据集的关键一步, 直接影响数据质量与模型的有效训练容量. 我们仿照 Txt360 (Tang et al., 2024), 对多语种, 多来源数据做全局去重, 同时记录每篇文档的重复次数. 没有任何重复匹配的文档, 可能意味着质量较低或分布稀疏 (Penedo et al., 2024). 为此, 我们依据文档重复次数的自然分布做受控上采样, 保证高质量数据占更高比例. Figure 2 给出两种策略下的模型性能曲线: Deduplication 曲线代表全局去重, 「Deduplication + Upsampling」 曲线代表先全局去重, 再按文档重复次数上采样. 我们用与 Baichuan M1 类似的架构, 从零训练一个 3B 模型, 约 1T token. 结果表明, Deduplication + Upsampling 显著优于只做全局去重. 而且相比单桶去重, 这一策略能更好地控制总 token 数, 让训练过程更均衡, 更有效.

> **问:** 去重本来是为了压掉重复文本, 这里却又按重复次数把文档上采样回来. 这一步到底在利用什么信号, 和不去重有什么区别?
> 利用的是 「被多个来源独立转载过」 这一质量信号. §2.1 (1) 先全局去重, 保证同一文档在语料里只剩一份, 再依据记录下来的重复次数分布做受控上采样, 于是重复次数从 「无差别冗余」 变成可调的权重. Figure 2 在 3B 模型, 约 1T token 上显示先去重再上采样优于只去重. 文中没有给出重复次数到上采样倍数的映射函数, 只在下一段给了高质量数据最多重复十次的上限.

(2) **Multidimensional Data Quality Assessment and Sampling Strategy.** Enhancing data quality is essential for model training. We utilize a series of small models to perform multidimensional quality assessments on the entire dataset from both human and model perspectives, including metrics such as causal scoring, educational scoring, reasoning density, and knowledge density. After obtaining the multidimensional quality scores for the data, we turn our attention to the next important challenge: determining the optimal sampling strategy. To determine the optimal sampling strategy, we conduct a detailed ablation study to explore the impact of different upsampling strategies on high-quality data. Figure 3 shows our comparative experiments on data quality and data quantity. Our findings indicate that appropriately upsampling high-quality data, compared to merely filtering out low-quality data, can significantly enhance overall model performance. Additionally, we observed that even aggressive upsampling strategies do not degrade model

(2) **多维数据质量评估与采样策略.** 提升数据质量对训练至关重要. 我们用一系列小模型, 从人和模型两种视角对全量数据做多维质量评估, 指标包括因果评分, 教育价值评分, 推理密度与知识密度. 拿到多维质量分之后, 下一个重要问题是确定最优采样策略. 为此我们做了细致的消融, 考察不同上采样策略对高质量数据的影响. Figure 3 给出数据质量与数据量的对比实验. 结果表明, 与只过滤低质量数据相比, 适度上采样高质量数据能显著提升整体性能. 我们还观察到, 即便激进的上采样也不会损害模型

<!-- page 4 of 33 -->

百川智能

![Chart block](images/p04-figure-2-global-deduplication-strategy-comparison-with.png)

Figure 2: Global deduplication strategy, comparison with global deduplication + upsampling by count strategy. The Aggregated score represents the average performance across the following evaluation benchmarks: MMLU (Hendrycks et al., 2021), CMMLU (Li et al., 2024a), GAOKAO (Zhang et al., 2024), MBPP (Austin et al., 2021), JECQA (Zhong et al., 2019), USMLE (Jin et al., 2021), and MCMLE (Jin et al., 2021).

图 2: 全局去重策略与 「全局去重 + 按重复次数上采样」 策略的对比. Aggregated score 为以下评测集的平均表现: MMLU (Hendrycks et al., 2021), CMMLU (Li et al., 2024a), GAOKAO (Zhang et al., 2024), MBPP (Austin et al., 2021), JECQA (Zhong et al., 2019), USMLE (Jin et al., 2021) 与 MCMLE (Jin et al., 2021).

performance—for instance, upsampling the top 10% high-quality data ten times yields comparable results to upsampling the top 33% data three times. To ensure the model is exposed to a diverse range of data, we constrain our upsampling strategy to a maximum of ten repetitions while removing low-quality data during pretraining.

性能. 例如, 把质量前 10% 的数据重复十次, 与把前 33% 的数据重复三次, 效果相当. 为保证模型接触到足够多样的数据, 我们把上采样限制为最多重复十次, 并在预训练中剔除低质量数据.

> **核对:** Figure 3 把 「前 10% 重复十次」 和 「前 33% 重复三次」 当成同一档对比. 这两组的 token 预算是否对齐, 如果没对齐, 「效果相当」 还能说明激进上采样无害吗?
> 两组几乎对齐. 10% 乘 10 与 33% 乘 3 都约等于原始数据量的一倍, 所以 Figure 3 比的是同预算下 「更窄更精 + 重复更多」 对 「更宽 + 重复较少」. 在这个对齐前提下, 效果相当才说明十次重复没有明显伤害. 这也解释了作者为何把上限定在十次: 这是 Figure 3 实际验证过的最激进档, 文中没有测试超过十次的情况.

**For code data**, we use the Qwen2.5 Coder model(Hui et al., 2024), fine-tuned as a quality filter. Under the condition of maintaining a consistent volume of code data, our comparison of different quality filtering strategies revealed that retaining the top 20% of the highest quality code and applying 5x upsampling yields better results than simply filtering out low-quality data. Furthermore, this approach also outperforms using the top 50% of the code data with 2x upsampling. Therefore, during the pre-training phase, we adopted the strategy of removing low-quality code data and upsampling the high-quality data.

**代码数据方面**, 我们把 Qwen2.5 Coder 模型 (Hui et al., 2024) 微调成质量过滤器. 在保持代码数据总量一致的条件下比较不同质量过滤策略, 发现保留质量前 20% 的代码并做 5 倍上采样, 优于只过滤低质量数据, 也优于取前 50% 代码做 2 倍上采样. 因此在预训练阶段, 我们采用 「剔除低质量代码, 上采样高质量代码」 的策略.

> **拆开:** 正文说三组代码策略在 「代码总量一致」 下比较, Figure 4 的图注却写 Top 50% (2x) 组还 「混入等比例的通用数据」. 这一组到底改了几个变量?
> 按图注至少改了两个: 代码的质量阈值与重复倍数, 以及额外混入的通用数据. 20% 乘 5 与 50% 乘 2 在代码量上确实相等, 符合正文 「consistent volume of code data」 的说法, 但只有 50% 组多了通用数据. 所以 Figure 4 里 Top 20% (5x) 胜过 Top 50% (2x), 不能完全归因于质量阈值; 文中没有给出不混通用数据的 50% 对照.

**For multilingual data**, we use a fine-tuned multilingual language model as the quality filter. We found that simply filtering out low-quality data and mixing in a large amount of multilingual data could not maintain the model’s original capabilities in Chinese and English. To ensure the model’s capabilities in both Chinese and English and to utilize multilingual data more effectively, we conducted a series of experiments on multilingual data filtering strategies and mixing ratios. As shown in Figure 5, we can observe that when selecting the highest quality multilingual data and mixing in 10%, the multilingual data not only had no negative impact on the model’s capabilities in Chinese and English but rather slightly enhanced these capabilities. This improvement may be related to the richer knowledge content of high-quality multilingual data. Additionally, the model gained multilingual capabilities, increasing the total token count by approximately 10%.

**多语种数据方面**, 我们用一个微调过的多语种语言模型做质量过滤器. 我们发现, 只过滤掉低质量数据再大量混入多语种数据, 无法保住模型原有的中英文能力. 为兼顾中英文能力并更有效地利用多语种数据, 我们围绕多语种数据的过滤策略与混合比例做了一系列实验. 如 Figure 5 所示, 选出质量最高的多语种数据并按 10% 混入时, 多语种数据不但没有损害中英文能力, 反而略有提升. 这可能与高质量多语种数据知识含量更丰富有关. 同时模型获得了多语种能力, 总 token 数约增加 10%.

> **对一下:** Figure 5 选定的是 「混入 10%」, 句末又说 「总 token 数约增加 10%」. 这里的 10% 是占比还是增量, 和 Table 1 里 Multilingual 的 2T 对得上吗?
> 句末写的是增量: 在原有数据上多出约 10%. Table 1 中 Multilingual 为 2T, 占 20T 的十分之一, 若按其余 18T 算增量则约为 11%, 两种口径在 「约 10%」 的精度下都说得通, 不构成矛盾. 需要注意的是 Figure 5 是小规模实验, 正文没有写明这组实验的模型尺寸与训练量, 从小实验到 20T 配比的外推是作者的判断.

(3) **Data Classification and Ratio Optimization.** To explore better data ratios and optimize the distribution of pre-training data, we refer to the World Knowledge Classification System and use a series of small models to classify the data into 27 major categories. To ensure a balanced and information-rich dataset, we downsample overrepresented domains in the web-scale data, such as entertainment, e-commerce, news, and social media, while upsampling underrepresented domains like Science, Technology, Engineering, and Mathematics, which contain high-quality information. Additionally, we conduct large-scale data ratio experiments using a series of small models to fit the optimal data ratio strategy to maximize the model’s performance across various domains.

(3) **数据分类与配比优化.** 为探索更好的数据配比, 优化预训练数据分布, 我们参考世界知识分类体系, 用一系列小模型把数据分成 27 个大类. 为保证数据均衡且信息丰富, 我们对网页数据中占比过高的领域 (娱乐, 电商, 新闻, 社交媒体) 下采样, 对含有高质量信息但占比偏低的领域 (科学, 技术, 工程, 数学) 上采样. 此外, 我们用一系列小模型做大规模配比实验, 拟合出最优配比策略, 以最大化模型在各领域的表现.

<!-- page 5 of 33 -->

百川智能

![Chart block](images/p05-figure-3-comparison-of-data-quality-versus-data-volume.png)

Figure 3: Comparison of data quality versus data volume. Baseline represents filtering out only low-quality data. High-quality Top 33% (3x) refers to selecting the top 33% highestquality data and repeating it three times, while High-quality Top 10% (10x) refers to selecting the top 10% highest-quality data and repeating it ten times.

图 3: 数据质量与数据量的对比. Baseline 表示只过滤掉低质量数据. High-quality Top 33% (3x) 指选出质量前 33% 的数据并重复三次, High-quality Top 10% (10x) 指选出质量前 10% 的数据并重复十次.

![Chart block](images/p05-figure-4-comparison-of-different-code-data-quality.png)

Figure 4: Comparison of different code data quality selection strategies and their impact on performance. Code No Sampling represents filtering out only low-quality data. Code Top 20% (5x Sampling) refers to selecting the top 20% highest-quality code data based on quality scores and repeating it five times. Code Top 50% (2x Sampling) refers to selecting the top 50% highest-quality code data and repeating it twice, while mixing in an equal proportion of general data. The Aggregated score represents the average performance across the following evaluation benchmarks: CEVAL (Huang et al., 2023), CMMLU, MMLU, GAOKAO, MBPP, and CMATH (Wei et al., 2023).

图 4: 不同代码数据质量筛选策略及其对性能的影响. Code No Sampling 表示只过滤掉低质量数据. Code Top 20% (5x Sampling) 指按质量分选出前 20% 的代码并重复五次. Code Top 50% (2x Sampling) 指选出前 50% 的代码并重复两次, 同时混入等比例的通用数据. Aggregated score 为以下评测集的平均表现: CEVAL (Huang et al., 2023), CMMLU, MMLU, GAOKAO, MBPP 与 CMATH (Wei et al., 2023).

(4) **Synthetic Data.** High-quality synthetic data, due to its step-by-step generation process and consistency with reasoning scenarios, significantly enhances the model’s reasoning abilities and problem-solving skills (Abdin et al., 2024). In domains such as mathematics, coding, and STEM, we leverage state-of-the-art models to synthesize large-scale data. To ensure high quality, we apply rigorous filtering using a general reward model trained on a language model. The synthetic data is utilized during the model annealing phase to further refine performance.

(4) **合成数据.** 高质量合成数据是逐步生成的, 又与推理场景一致, 因此能显著增强模型的推理与解题能力 (Abdin et al., 2024). 在数学, 代码与 STEM 等领域, 我们借助最先进的模型合成大规模数据. 为保证质量, 我们用一个基于语言模型训练的通用奖励模型做严格过滤. 合成数据用在模型的退火阶段, 以进一步打磨性能.

(5) **Data Concatenation.** To preserve data integrity, we optimize the concatenation scheme to minimize unnecessary truncation of long sequences. Our experiments show that preventing truncation improves overall model performance and significantly enhances long-context understanding during training.

(5) **数据拼接.** 为保持数据完整, 我们优化拼接方案, 尽量减少对长序列的不必要截断. 实验表明, 避免截断能提升整体性能, 并在训练中显著增强长上下文理解.

<!-- page 6 of 33 -->

百川智能

![Chart block](images/p06-figure-5-comparison-of-different-multilingual-data.png)

Figure 5: Comparison of different multilingual data filtering strategies and mixing ratios.

图 5: 不同多语种数据过滤策略与混合比例的对比.

### 2.2 Medical data 医学数据

To enhance the medical capabilities of our model, we dedicate significant efforts to collecting large-scale, high-quality, and diverse medical data for pre-training. We employ a sophisticated data classification and filtering process to improve data quality and ensure comprehensive coverage of medical domains. Furthermore, synthetic data has been demonstrated to be effective for model training (Abdin et al., 2024; Chen et al., 2024b; Maini et al., 2024), and thus, we generate extensive synthetic data to complement the medical data. Specifically, we utilize various advanced data synthesis techniques and design tailored synthesis strategies for different data sources, resulting in data of substantial scale, diverse formats, high educational value, and full coverage of medical scenarios. We conduct a three-stage training process, progressively increasing the concentration and complexity of medical knowledge. Using small-scale models for ablation studies, we determine the optimal data mixture strategy, enabling the model to transition from a medical student to a physician and ultimately to an expert.

为增强模型的医学能力, 我们投入大量精力收集大规模, 高质量, 多样化的医学预训练数据, 并采用精细的数据分类与过滤流程来提升质量, 保证对医学各领域的全面覆盖. 合成数据已被证明对训练有效 (Abdin et al., 2024; Chen et al., 2024b; Maini et al., 2024), 因此我们生成大量合成数据来补充医学数据. 具体而言, 我们运用多种先进的数据合成技术, 并针对不同数据源设计专门的合成策略, 得到规模可观, 格式多样, 教育价值高, 全面覆盖医学场景的数据. 训练分三阶段进行, 逐步提高医学知识的浓度与复杂度. 我们用小规模模型做消融, 确定最优数据混合策略, 让模型从医学生成长为医生, 最终成为专家.

#### 2.2.1 Data source 数据来源

The medical data are primarily obtained from two sources: classification and filtering of web corpora, and manually curated authoritative and informative sources.

医学数据主要来自两处: 对网页语料的分类与过滤, 以及人工整理的权威, 信息丰富的来源.

**Web corpora.** We utilize the a series of small models to classify large-scale web data and further categorize medical data into specific medical content and department-based classifications. To ensure balanced data distribution, we downsample overrepresented categories, such as health and wellness advertisements. The classification of web-scale data facilitates the generation of a substantial volume of medical-related tokens.

**网页语料.** 我们用一系列小模型对大规模网页数据分类, 并把医学数据进一步细分为具体医学内容与按科室划分的类别. 为保证分布均衡, 我们对占比过高的类别 (如保健养生广告) 下采样. 对网页数据的分类带来了大量医学相关 token.

**Expert-curated sources.** Due to the importance of authority and accuracy in medical content, coupled with the vast array of specialized topics of long-tailed knowledge within the medical domain, relying solely on web-based medical content is insufficient for training an expert-level medical LLM. To address this, we engage a team of medical experts to manually curate authoritative sources of medical knowledge, including medical academic papers, real-world medical cases, medical textbooks, biomedical knowledge graphs<sup>1</sup>(KGs), clinical guidelines, medical encyclopedias, and online medical customer QA data. With extensive efforts from medical experts, complied the most comprehensive medical database to date, encompassing over 1T tokens from over 200 authoritative medical knowledge sources. This database almost covers the entire spectrum of medical knowledge, from macro

**专家整理来源.** 医学内容对权威性与准确性要求很高, 医学领域又有大量长尾专业话题, 只靠网页医学内容不足以训练出专家级医学大模型. 为此, 我们请一支医学专家团队人工整理权威医学知识来源, 包括医学学术论文, 真实病例, 医学教科书, 生物医学知识图谱<sup>1</sup> (KG), 临床指南, 医学百科以及线上医疗问答数据. 在医学专家的大量投入下, 我们汇编出迄今最全面的医学数据库, 来自 200 多个权威医学知识源, 超过 1T token. 这个数据库几乎覆盖了医学知识的全谱, 从宏观

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>To fully leverage structured knowledge from KGs for LLM pre-training, we transform it into natural language by anchoring each entity, incorporating its synonyms, semantic types, definitions, and related entities, and reorganizing the information using a Markdown template.</span></small>

<small>1 为在预训练中充分利用 KG 的结构化知识, 我们以每个实体为锚点, 纳入其同义词, 语义类型, 定义与相关实体, 再用 Markdown 模板重组, 把它转写成自然语言.</small>

<!-- page 7 of 33 -->

百川智能

to micro levels, and spans the complete system of medical scenarios, from cutting-edge research to clinical practice.

到微观, 并贯穿从前沿研究到临床实践的完整医学场景体系.

> **再看:** §2.2.1 给出专家整理库超过 1T token, §2 又说合成了超过 100B 医学推理 token, 可 Table 1 只有语种和代码四栏. 医学数据在 20T 里占多少, 三阶段各占多少?
> 文中没有给出这个数. 医学数据横跨 English 与 Chinese 两栏, Table 1 不单列. §4.2 只做定性描述: 第一阶段 「不显著提高医学占比」, 第二阶段 「更强调严肃医学数据」, 第三阶段引入最复杂, 最面向应用的数据. §2.2 所说 「从医学生到医生再到专家」 的递进, 因此只能从这些定性描述读出, 读者无法从本文复算任一阶段的医学比例.

**Data quality filter.** Data quality filtering has been shown to be a critical component in the data collection pipeline (Qwen et al., 2025; DeepSeek-AI et al., 2024). To enhance the quality of medical data, we specifically design a medical quality score and a medical value score. Using the a series of models, we score all medical data and perform sampling based on these scores, significantly improving the overall quality of the medical dataset.

**数据质量过滤.** 数据质量过滤已被证明是数据收集流程中的关键环节 (Qwen et al., 2025; DeepSeek-AI et al., 2024). 为提升医学数据质量, 我们专门设计了医学质量分与医学价值分, 用一系列模型给全部医学数据打分, 并据此采样, 显著提升了医学数据集的整体质量.

#### 2.2.2 Synthetic Data 合成数据

The use of synthetic data in LLM training has gained increasing popularity and has even become a substantial component of training datasets (Abdin et al., 2024). To enhance the quality of synthetic medical data, we manually design distinct yet sophisticated synthesis pipelines tailored to different data sources. Specifically, we utilize expert-curated sources after rigorous filtering as seed data to ensure both the accuracy of synthesis and a comprehensive coverage. Furthermore, we emphasize the importance of long Chain-of-Thought (CoT, Wei et al., 2022) and actively encourage its generation for all synthesized data. We leverage state-of-the-art LLMs to generate data. The detailed examples of synthesis pipelines for various sources are provided below and summarized in Figure 6.

合成数据在大模型训练中越来越流行, 甚至已成为训练集的重要组成部分 (Abdin et al., 2024). 为提升医学合成数据的质量, 我们针对不同数据源人工设计了各不相同又足够精细的合成流水线. 具体而言, 我们以经过严格过滤的专家整理来源为种子数据, 兼顾合成的准确性与覆盖面. 我们还强调长 CoT (Wei et al., 2022) 的重要性, 对所有合成数据都主动鼓励生成长 CoT. 数据由最先进的大模型生成. 下面给出各数据源合成流水线的具体示例, 汇总见 Figure 6.

![Image block](images/p07-figure-6-the-data-synthesis-pipeline-for-various-sources.png)

Figure 6: The data synthesis pipeline for various sources.

图 6: 面向不同数据源的数据合成流水线.

**Encyclopedias, textbooks, and guidelines.** These sources contain extensive medical knowledge presented in natural language. Following Abdin et al. (2024), we construct QA pairs to enhance the medical knowledge of our model. Concretely, we first split long documents (potentially millions of tokens) into shorter chunks (thousands of tokens) and perform an additional round of filtering focused on "knowledge abundance". This step leverages a

**百科, 教科书与指南.** 这些来源以自然语言承载了大量医学知识. 我们仿照 Abdin et al. (2024) 构造问答对, 增强模型的医学知识. 具体做法是: 先把长文档 (可能长达数百万 token) 切成较短的块 (数千 token), 再做一轮聚焦 「知识丰度」 的额外过滤. 这一步借助一个

<!-- page 8 of 33 -->

百川智能

language model to eliminate chunks that do not demonstrate specific medical knowledge points. Subsequently, we conduct data synthesis using the following refined pipeline:

语言模型剔除不包含具体医学知识点的块. 随后按以下精细流水线合成数据:

1. **Knowledge point extraction**: The model extracts medical knowledge points (scientific facts) from the documents.

1. **知识点抽取**: 模型从文档中抽取医学知识点 (科学事实).

2. **Question generation**: For each knowledge point, the model generates an exam question, which can be either a multiple-choice question or a short-answer question.

2. **出题**: 针对每个知识点, 模型生成一道考题, 可以是选择题, 也可以是简答题.

3. **Answer generation without reference**: For each generated question, the model provides an answer without referring to the original document, with an emphasis on generating long Chain-of-Thought (CoT) reasoning. This step preserves the LLM’s output patterns and full CoT structure, facilitating the student model’s learning.

3. **不看参考作答**: 对每道生成的题, 模型在不参考原文的情况下作答, 重点生成长 CoT 推理. 这一步保留了大模型自身的输出模式与完整 CoT 结构, 便于学生模型学习.

4. **Answer revision with reference**: Since the initially generated answers may be incorrect, we conduct a revision step where the model revises its answer based on the original document.

4. **对照参考修订**: 初始答案可能有错, 因此增加修订步骤, 让模型依据原文修改答案.

By combining these steps, we obtain accurate QA pairs covering a wide range of medical topics, accompanied by comprehensive CoT reasoning that aligns with the model’s learning process. We additionally focus on long-tailed medical knowledge including biomedical statistics, numerical problems, rare diseases, and special populations.

把这些步骤组合起来, 就得到覆盖广泛医学主题的准确问答对, 并附带与模型学习过程相契合的完整 CoT 推理. 我们还额外关注长尾医学知识, 包括生物医学统计, 数值计算题, 罕见病与特殊人群.

> **停一下:** 第 3 步故意不给原文让模型自己写长 CoT, 第 4 步再对照原文改答案. 如果第 3 步推理本身走错, 第 4 步只改结论, 会不会留下 「推理与答案对不上」 的样本?
> 有这个风险, 文中没有正面回应. §2.2.2 只说第 3 步是为了保留模型自身的输出模式与完整 CoT 结构, 第 4 步 「revises its answer based on the original document」, 没有写明修订时是否重写整段 CoT. 能兜底的是同节末段: 合成数据还要过医学价值奖励模型, 不合格的按反馈反复修订直到达标. 这类不一致样本最终被筛掉多少, 本文没有统计.

**Real-world patient cases.** Real-world patient notes are invaluable resources for models to learn clinical practices and develop expertise in the medical domain. However, patient notes typically omit the detailed reasoning processes of physicians, recording only final decisions such as diagnoses, treatments, and examinations. To address this limitation, we propose the following pipeline to reconstruct an expert-level reasoning process based on real-world cases:

**真实病例.** 真实病历是模型学习临床实践, 形成医学专长的宝贵资源. 但病历通常省略医生的详细推理, 只记录诊断, 治疗, 检查等最终决策. 为弥补这一点, 我们提出以下流水线, 基于真实病例重建专家级推理过程:

1. **Clinical decision extraction**: The model identifies critical clinical decisions made throughout the patient’s journey, from preliminary diagnosis to prognosis prediction.

1. **临床决策抽取**: 模型识别患者整个就诊过程中的关键临床决策, 从初步诊断到预后判断.

2. **Decision evidence extraction**: For each clinical decision, the model extracts all relevant evidence, including both positive and negative manifestations that support the decision.

2. **决策依据抽取**: 针对每个临床决策, 模型抽取全部相关依据, 包括支持该决策的阳性与阴性表现.

3. **Expert reasoning simulation**: Using the extracted evidence, the model simulates the reasoning process of a medical expert, with particular emphasis on evaluating alternatives such as differential diagnoses and treatment options.

3. **专家推理模拟**: 模型利用抽取的依据模拟医学专家的推理, 特别强调对备选项的评估, 如鉴别诊断与治疗方案选择.

4. **Integration and transformation**: The model integrates the components above, transforms the original note (particularly the evidence) into a suitable format, and weaves together a comprehensive reasoning process that mirrors the full thought process of medical experts.

4. **整合与转写**: 模型整合上述各部分, 把原始病历 (尤其是依据部分) 转成合适的格式, 编织出一条完整推理过程, 还原医学专家的全部思考.

**Knowledge graphs.** For each entity in KGs, we have transformed related knowledge into natural language using a Markdown template. Based on this, we generate data in multiple formats following Maini et al. (2024) to expose the model to diverse knowledge representations. Notably, during QA pair generation, we fully leverage the structure of KGs and propose the synthesis strategy of "entity as the answer". Similar to Chen et al. (2024d), we encourage the model to generate backward reasoning questions by anchoring an entity as the answer rather than including it in the question. For example, for a disease entity, we encourage questions such as "Which of the following diseases could cause the symptom of...?" instead of "What are the typical symptoms of ... disease?" Additionally, the abundant relationships in KGs often cluster similar entities that require careful differentiation. Therefore, we utilize these similar entities as options for multiple-choice questions and generate questions focusing on subtle differences among them, such as "Which of the following vitamins is provided only by animal sources?"

**知识图谱.** 对 KG 中的每个实体, 我们已用 Markdown 模板把相关知识转写成自然语言. 在此基础上, 我们仿照 Maini et al. (2024) 生成多种格式的数据, 让模型接触多样的知识表达. 值得一提的是, 生成问答对时我们充分利用 KG 的结构, 提出 「实体作答案」 的合成策略. 与 Chen et al. (2024d) 类似, 我们把实体锚定为答案而不是放进题干, 鼓励模型生成逆向推理题. 例如对一个疾病实体, 我们鼓励 「以下哪种疾病可能引起...的症状?」 这类问题, 而不是 「...病的典型症状是什么?」. 此外, KG 中丰富的关系常把需要仔细区分的相似实体聚在一起. 因此我们把这些相似实体用作选择题选项, 生成聚焦细微差别的问题, 例如 「以下哪种维生素只能由动物来源提供?」.

**Academic Papers.** Academic papers encapsulate cutting-edge advancements in the medical domain, characterized by rigorous reasoning and a formal tone. To enhance the model’s scientific reasoning capabilities, we extract key evidence and conclusions from these papers

**学术论文.** 学术论文凝结了医学领域的前沿进展, 推理严谨, 语气正式. 为增强模型的科学推理能力, 我们从论文中抽取关键证据与结论,

<!-- page 9 of 33 -->

百川智能

and leverage the state-of-art model to generate detailed analytical bridges between them. This approach enables the student model to learn and internalize the scientific deduction process, improving its ability to engage in structured reasoning.

再借助最先进的模型在二者之间生成详细的分析桥梁. 这样学生模型能学习并内化科学推演过程, 提升结构化推理能力.

**Online customer QA.** Online customer QA data also plays a critical role in model training. Customer questions often contain nonstandard terminology and corner cases that may be overlooked in authoritative sources. However, answers from online forum, even those written by physicians, also suffer from the usage of informal language and excessive brevity. Therefore, we first ask the model to answer the question on itself, and then revise its answer by referring to the original answer to achieve a balance between accuracy and comprehensiveness.

**线上医疗问答.** 线上问答数据在训练中也很关键. 用户提问常含不规范术语和权威来源容易忽略的边角情形. 但论坛上的回答, 即便出自医生之手, 也常用语随意, 过于简短. 因此我们先让模型自行作答, 再参考原回答修订, 在准确与全面之间求平衡.

The synthetic data also undergo rigorous quality check with the medical value reward model. Qualified data is directly used as training data, while unqualified data is revised based on feedback from the reward model until it meets satisfactory quality standards.

合成数据还要经医学价值奖励模型严格质检. 合格的数据直接用作训练数据, 不合格的则依据奖励模型的反馈反复修订, 直到达到满意的质量标准.

## 3 Model Architecture 模型架构

Overall, our structure is similar to Llama and other popular models (Touvron et al., 2023; Yang et al., 2023; Bai et al., 2023), including the use of a pre-norm based on rmsnorm (Vaswani et al., 2017; Xu et al., 2019; Zhang & Sennrich, 2019), FFN layer using SwishGlu (Shazeer, 2020), and rotary position embedding (Su et al., 2024). In addition, in order to reduce the inference cost, we alternately used global attention and sliding window attention like Gemma2 (Team et al., 2024). In fact, the proportion of sliding window attention can be appropriately increased (Yang et al., 2025a). We also increased the head dim from 128 to 256 for the global attention part of the model, as our early experiments find that a head dim of 256 is beneficial for the emergence of some benchmarks.

总体上, 我们的结构与 Llama 等主流模型相似 (Touvron et al., 2023; Yang et al., 2023; Bai et al., 2023): 基于 RMSNorm 的 pre-norm (Vaswani et al., 2017; Xu et al., 2019; Zhang & Sennrich, 2019), 使用 SwishGlu 的 FFN 层 (Shazeer, 2020), 以及旋转位置编码 (Su et al., 2024). 此外, 为降低推理开销, 我们仿照 Gemma2 (Team et al., 2024) 交替使用全局注意力与滑动窗口注意力. 实际上, 滑动窗口注意力的比例还可以适当提高 (Yang et al., 2025a). 我们还把模型全局注意力部分的 head dim 从 128 提到 256, 因为早期实验发现 256 的 head dim 有利于某些评测上能力的涌现.

> **看表:** §3 说只把全局注意力层的 head dim 从 128 提到 256, Table 2 有一行 「H.D.=128」 作对照. 这一行改的是全局层还是所有层, 头数有没有跟着补偿?
> 结合 §3 与第 10 页的配置, 滑动窗口层本来就是 128, 所以 H.D.=128 这行实际只动了全局层. 至于头数是否同步翻倍以保持 KV 宽度不变, Table 2 的注只写 「H.D. is short for head dim」, 正文没有交代. 因此这一行的平均分与 NIAH 下降, 既可能来自 head dim 本身, 也可能来自全局层 KV 总宽度变窄, 本文数据分不开这两种解释.

In addition, we also used temporal short convolution operations on the key and value in attention as shown in Figure 8, which is beneficial for the formation of the model’s incontext learning ability (Xu et al., 2024a). This structure has been found by neural network architecture searching (So et al., 2021) in language modeling, and it is also widely used in non transformer structures (Fu et al., 2022; Peng et al., 2023; Beck et al., 2024; Yang et al., 2024).

此外, 如 Figure 8 所示, 我们还在注意力的 key 与 value 上使用时间维的短卷积, 这有助于模型形成上下文学习能力 (Xu et al., 2024a). 这种结构曾在语言建模的神经架构搜索中被发现 (So et al., 2021), 在非 Transformer 结构里也被广泛使用 (Fu et al., 2022; Peng et al., 2023; Beck et al., 2024; Yang et al., 2024).

> **拆开:** Figure 8 里卷积只加在 k 和 v 两条支路上, q 不卷; k 支路又是先 Conv 后 Rotary Embedding. 为什么只卷 k/v, 顺序为什么是卷积在前?
> 文中给的依据是 Xu et al. (2024a) 的 KV shifting: 让当前位置的 key 与 value 混入前几个位置的信息, 单层注意力就能拼出 「看前一个 token 再匹配」 的上下文学习模式, 而 query 保持当前位置不动. Figure 8 中 k 先卷积再加旋转位置编码, 意味着混合后的 key 仍按自身位置旋转, 相对位置关系不被卷积打乱. Table 2 里 w/o conv 一行在平均分和 NIAH 上都是全表最低, 这是本文对这一设计的主要支持. 卷积核长度正文没有写.

![Chart block](images/p09-figure-7-kv-cache-comparison-between-baichuan-med-14b.png)

Figure 7: KV cache Comparison between Baichuan-Med-14B and other models. In the case of a short context, the KV cache of Baichuanmed-14B is approximately equal to GQA of 6 KV heads, and in the case of a long context, it is approximately equal to the GQA of 4 kv heads.

图 7: Baichuan-Med-14B 与其他模型的 KV cache 对比. 短上下文时, Baichuanmed-14B 的 KV cache 约等于 6 个 KV head 的 GQA; 长上下文时, 约等于 4 个 KV head 的 GQA.

> **核对:** 图注说短上下文约等于 6 个 KV head 的 GQA, 长上下文约等于 4 个. 用第 10 页给的 「全局层 2 个 head 乘 256, 滑窗层 8 个 head 乘 128」 能不能复算出这两个数?
> 短上下文能对上: 全局层 2 乘 256 等价于 4 个 128 维 head, 滑窗层是 8 个, 两类层各占一半时平均正好是 6. 长上下文对不太上: 滑窗层的缓存封顶后, 增长只来自占一半层数的全局层, 按全模型平均折算趋近 2 个 head, 而 4 只是单个全局层自身的宽度. Figure 7 目测最右端橙线约为 GQA_8_layers_40 的三成, 也更接近 2 到 3 之间. 另外, 橙线的拐点落在 8K 到 16K 之间, 说明 14B 的滑窗长度可能比第 10 页消融用的 2k 大, 但正文没有给出 14B 的窗口大小与层比例, 所以这里只能指出数字上的缺口.

<!-- page 10 of 33 -->

百川智能

We use base=1,000,000 for rotary embedding when pretraining rather than 10,000 like Llama2, because the context length of the model is 32k, which requires a large base (Xu et al., 2024b). If we use a smaller base, both the benchmark for short context and the perplexity for long context will be fine, while the model will lose the ability for long-distance retrieval.

预训练时我们把旋转位置编码的 base 设为 1,000,000, 而不是 Llama2 那样的 10,000, 因为模型上下文长度为 32k, 需要较大的 base (Xu et al., 2024b). 如果用较小的 base, 短上下文评测与长上下文困惑度都还正常, 但模型会丧失长距离检索能力.

> **对一下:** 这一段说预训练用 base=1,000,000, §4.2 却写 「RoPE 的 base 先设为 1e5, 之后提到 1e6」, Table 2 还有一行 base=1e4. 预训练前两阶段到底用哪个 base?
> 以 §4.2 更细的日程为准: 前两阶段上下文为 8K, base 为 1e5; 第三阶段 (退火) 上下文扩到 32K, base 提到 1e6. 本段说的 1,000,000 对应 32K 的最终状态, 理由引 Xu et al. (2024b) 的 「base 下界随上下文长度增长」. Table 2 的 base=1e4 是 1.5B, 8K 训练长度下的消融, 与 14B 日程不是同一组设置, 它显示的是短评测基本不动而 NIAH 下降, 与本段 「短上下文正常, 长距离检索丢失」 的描述一致.

And we conduct ablation experiments on the model with 1.5B parameters and trained with 200B tokens, the results are shown in Table 2. The sliding window size is 2k, the total training length is 8k, and NIAH stands for needle in a haystack. And we evaluate our model on multiple commonsense reasoning benchmarks:

我们在一个 1.5B 参数, 训练 200B token 的模型上做了消融, 结果见 Table 2. 滑动窗口大小为 2k, 训练总长度为 8k, NIAH 指大海捞针. 我们在多个常识推理评测上评估模型:

![Image block](images/p10-figure-8-the-attention-mechanism-used-by-baichuan-m1-14b.png)

Figure 8: The attention mechanism used by Baichuan-M1-14B.

图 8: Baichuan-M1-14B 使用的注意力机制.

PIQA (Bisk et al., 2020), HellaSwag (Hella) (Zellers et al., 2019), WinoGrande (Wino) Sakaguchi et al. (2021), ARC-easy (ARC-e) and ARC-challenge (ARC-c) Clark et al. (2018), SIQA, BoolQ, Wikitext (Wiki), and LAMBADA (LMB). And we evaluate Wiki and LMA by ppl, Hella and Arc-E by norm accuracy, others by accuracy.

PIQA (Bisk et al., 2020), HellaSwag (Hella) (Zellers et al., 2019), WinoGrande (Wino) (Sakaguchi et al., 2021), ARC-easy (ARC-e) 与 ARC-challenge (ARC-c) (Clark et al., 2018), SIQA, BoolQ, Wikitext (Wiki) 以及 LAMBADA (LMB). Wiki 与 LMA 用困惑度评估, Hella 与 Arc-E 用归一化准确率, 其余用准确率.

In addition, to save KV cache and improve inference efficiency, we also alternate the use of sliding window attention. The global attention layer has 2 heads with a head dim of 256, while the sliding window attention layer has 8 heads with a head dim of 128. One important reason for adopting this interleaving structure is that large language models have a large amount of layer redundancy (Men et al., 2024), and the number of heads with long-term retrieval capabilities is relatively small (Wu et al., 2024).

此外, 为节省 KV cache, 提升推理效率, 我们交替使用滑动窗口注意力. 全局注意力层有 2 个 head, head dim 为 256; 滑动窗口注意力层有 8 个 head, head dim 为 128. 采用这种交错结构的一个重要原因是, 大语言模型存在大量层冗余 (Men et al., 2024), 而具备长程检索能力的 head 数量相对较少 (Wu et al., 2024).

From Table 2, it can be seen that mixing with sliding window attention does not significantly affect the performance of long context benchmark, but can improve the performance of short context benchmarks. This suggests that the hybrid model may have better performance, which is consistent with some previous research (Waleffe et al., 2024; Yang et al., 2025b).

从 Table 2 可以看出, 混入滑动窗口注意力对长上下文评测影响不大, 却能提升短上下文评测表现. 这说明混合模型可能表现更好, 与此前一些研究一致 (Waleffe et al., 2024; Yang et al., 2025b).

| Model | Wiki ↓ | LMB ↓ | PIQA ↑ | Hella ↑ | Wino ↑ | ARC-e ↑ | ARC-c ↑ | SIQA ↑ | BoolQ ↑ | Avg↑ Niah↑ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baichuan | 15.39 | 14.93 | 79.01 | 61.70 | 63.47 | 77.92 | 43.46 | 45.81 | 66.40 | 62.54 93.6 |
| H.D.=128 | 15.72 | 15.67 | 77.41 | 60.63 | 62.17 | 77.04 | 40.59 | 43.38 | 63.20 | 60.63 92.3 |
| 75% swa | 15.43 | 14.87 | 79.12 | 60.16 | 64.59 | 78.02 | 43.24 | 46.21 | 66.64 | 62.57 89.4 |
| w/o swa | 17.18 | 16.28 | 76.72 | 60.77 | 64.00 | 72.86 | 42.62 | 45.97 | 63.56 | 60.93 93.3 |
| w/o conv | 17.97 | 16.96 | 77.04 | 58.71 | 60.75 | 76.15 | 39.32 | 42.80 | 63.34 | 59.73 88.4 |
| base=1e4 | 15.67 | 15.03 | 78.61 | 61.60 | 61.15 | 79.24 | 42.92 | 45.36 | 66.29 | 62.02 91.2 |

Table 2: Ablation experiments we conducted on the model with 1.5B parameters and trained with 200B tokens. H.D. is short for head dim.

表 2: 在 1.5B 参数, 训练 200B token 的模型上所做的消融实验. H.D. 为 head dim 的缩写.

> **看表:** 正文由 Table 2 得出 「混入滑窗不太影响长上下文」, §3 开头又引 Yang et al. (2025a) 说滑窗比例 「还可以适当提高」. 本文自己的 75% swa 一行支持提高比例吗?
> 不太支持. 默认配置 (两类层交替) 与 w/o swa 相比, 平均分更高而 NIAH 几乎持平, 正文的结论对这一档成立. 但把滑窗提到 75% 后, 短评测平均分与默认持平, NIAH 却明显下滑, 说明在本文 1.5B, 200B token, 8k 训练长度的设置下, 再加滑窗就开始伤检索. 「比例还可以提高」 这句依据的是外部文献, 不是 Table 2. 另外这里的 NIAH 只在 8k 以内测, 更长距离没有覆盖.

## 4 Training Progress 训练过程

### 4.1 Tokenizer 分词器

The medical domain is characterized by a vast array of specialized terminology. Previous studies have demonstrated that training large language models (LLMs) for the medical domain requires a domain-specific vocabulary to optimize performance Taylor et al. (2022); Shin et al. (2020). In the case of Baichuan-M1, we build the vocabulary from two perspectives: first, we train a general-purpose tokenizer using a broad general-purpose dataset such

医学领域的一大特点是专业术语极多. 已有研究表明, 为医学领域训练大语言模型需要领域专用词表才能发挥最佳性能 (Taylor et al., 2022; Shin et al., 2020). Baichuan-M1 从两个角度构建词表: 先用宽泛的通用数据集

<!-- page 11 of 33 -->

百川智能

as web pages and books. Next, we develop a specialized tokenizer focused on medical terminology. Finally, we combine these two tokenizers to achieve a balance between general tokenization efficiency and the granularity needed for medical content. Our final vocabulary size is 133,120. The token efficiency of Baichuan-M1, compared to other models, is illustrated in Figure 9. More details of our tokenizer is illustrated in Appendix.

(如网页与书籍) 训练一个通用分词器; 再开发一个聚焦医学术语的专用分词器; 最后把二者合并, 在通用切分效率与医学内容所需的粒度之间取得平衡. 最终词表大小为 133,120. Baichuan-M1 与其他模型的 token 效率对比见 Figure 9, 分词器的更多细节见附录.

![Chart block](images/p11-figure-9-the-tokenization-efficiency-for-different.png)

Figure 9: The tokenization efficiency for different models, the less the better.

图 9: 不同模型的切分效率, 越低越好.

> **问:** Figure 9 的纵轴是 Tokens/Char, 医学语料上 Baichuan-M1 明显更低, Code 一栏却没有优势. 附录 C 又说数字一律拆成单个数位. 这些规则和 Figure 9 的结果是什么关系?
> 医学一栏的优势来自 §4.1 所说的医学专用分词器, 两个词表合并后常见术语能整体成词. 附录 C 的几条规则各有取舍: 保留纯空白片段是为代码缩进服务, 数字逐位切分会让数值文本的 token 数变多, 以换取数值编码的一致性. Code 一栏没有明显优势, 与 「保留空白片段」 的收益被其他因素抵消相符, 但文中没有拆开分析. 两个分词器具体如何合并, 冲突片段如何取舍, 附录 C 只写了 「merge the tokenizer together」, 没有细节.

### 4.2 Training details 训练细节

The pre-training consists of three distinct stages, following a curriculum learning approach. In the first stage, we select data based on multiple factors that are relatively easy, as the model is randomly initialized, and we believe the training process should be progressive. We choose data samples that are easy both in terms of quality and perplexity. During this stage, we do not significantly increase the proportion of medical data. We use a previous version of our Baichuan model, which has the same data distribution with Baichuan-M1, to obtain these two metrics. In the second stage, we gradually increase the proportion of both hard samples and medical data, as we believe that medical capabilities build upon general capabilities. The third stage is an annealing phase, where we introduce the most complex and application-specific data to prepare the model for downstream alignment.

预训练按课程学习思路分为三个阶段. 第一阶段, 由于模型是随机初始化的, 我们认为训练应循序渐进, 因此按多个因素选出相对容易的数据, 即在质量和困惑度两方面都偏容易的样本. 这一阶段不显著提高医学数据占比. 这两个指标由与 Baichuan-M1 数据分布相同的上一版百川模型给出. 第二阶段, 我们逐步提高难样本与医学数据的比例, 因为我们认为医学能力建立在通用能力之上. 第三阶段是退火阶段, 引入最复杂, 最面向应用的数据, 为下游对齐做准备.

For Baichaun-M1-14B, we employ the AdamW optimizer Loshchilov & Hutter (2017) during training. The parameters $\beta _ { 1 }$ and $\beta _ { 2 }$ are set to 0.9 and 0.95, respectively. We apply a weight decay of 0.1 and clip the gradient norm to 1.0. The model undergoes 2,000 linear scaling steps for warm-up, gradually reaching the maximum learning rate. The learning rate schedule follows the warm-up-stable-decay strategy Hu et al. (2024), with a peak learning rate of 4e-4. The batch size is set to 16M. After training for 12 trillion tokens, we enter the second stage, where the proportion of higher-quality data is increased, along with a greater emphasis on serious medical data. During this phase, the learning rate and batch size remain unchanged, and training continues for an additional 6 trillion tokens. Following a total of 18 trillion tokens, we begin annealing, employing a cosine annealing strategy to gradually reduce the learning rate to a minimal value. After 2 trillion tokens of annealing, the learning rate reaches 2e-5, at which point we transition to SFT training. The context length was set to 8K in the first and second stage, and increased to 32K in the third (annealing) stage. The base value of RoPE was first set to 1e5 and then increased to 1e6.

Baichaun-M1-14B 训练使用 AdamW 优化器 (Loshchilov & Hutter, 2017), $\beta _ { 1 }$ 与 $\beta _ { 2 }$ 分别为 0.9 和 0.95, weight decay 为 0.1, 梯度范数裁剪到 1.0. 模型先经过 2,000 步线性预热, 逐步升到最大学习率. 学习率调度采用 warm-up-stable-decay 策略 (Hu et al., 2024), 峰值学习率 4e-4, batch size 为 16M. 训练 12 万亿 token 后进入第二阶段, 提高高质量数据比例, 更强调严肃医学数据; 这一阶段学习率与 batch size 不变, 再训练 6 万亿 token. 累计 18 万亿 token 后开始退火, 用余弦退火把学习率逐步降到很小的值. 退火 2 万亿 token 后学习率降到 2e-5, 随即转入 SFT 训练. 第一, 第二阶段上下文长度为 8K, 第三 (退火) 阶段提到 32K. RoPE 的 base 先设为 1e5, 之后提到 1e6.

> **回看:** 第一阶段到第二阶段换了数据分布, 学习率和 batch size 都没动; 第三阶段却同时换了数据, 学习率曲线, 上下文长度与 RoPE base. 这对读懂各阶段的贡献意味着什么?
> 12T 处的切换在 WSD 的平台期内完成, 学习率恒为 4e-4, 所以它是一次纯数据切换, 原则上能单独看出课程带来的变化. 第三阶段把余弦退火, 8K 到 32K, base 1e5 到 1e6 与最难, 最面向应用的数据捆在一起, 退火带来的提升无法归到其中任何一项. 本文没有给出分阶段的评测曲线. 顺带一提, 退火终点 2e-5 正好等于 §5.1 SFT 余弦调度的起点, 预训练与 SFT 的学习率是接上的.

In the early stage of training, in order to stabilize the training, we adopted an adaptive gradient truncation strategy. The motivation is that during training, sometimes the large gradient is due to the current parameter reaching a steep point in the parameter space, and sometimes it is caused by special data, and we hope to eliminate the influence of the latter. Pseudo code as shown in Algorithm 1. We conducted experiments on the 3b parameter

在训练早期, 为稳定训练, 我们采用了自适应梯度截断策略. 动机是: 训练中出现大梯度, 有时是因为当前参数到了参数空间里陡峭的位置, 有时则是由特殊数据引起的, 我们希望消除后者的影响. 伪代码见 Algorithm 1. 我们在 3b 参数

<!-- page 12 of 33 -->

百川智能

model and demonstrated the effectiveness of this method in improving the stability of the model during early training, as shown in Figure 10.

的模型上做了实验, 证明该方法能提升模型早期训练的稳定性, 见 Figure 10.

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Algorithm 1 Adaptive Gradient Clipping (AGC)
Initialize an empty stack S // Store the last 100 gradient norm
skip_counter ← 0 // Initialize skip counter
MAX_SKIP ← 1 // Set maximum consecutive skips
for each training step do
    current_norm ← compute_norm() // Compute the norm of the current gradient
    if size of S ≥ 100 then
        avg_norm ← $\frac{\sum_{i=1}^{100} S_i}{100}$ // Compute the average norm of the last 100 gradients
        if current_norm &gt; 1.2 × avg_norm + 0.1 then
            if skip_counter &lt; MAX_SKIP then
                skip_counter ← skip_counter + 1 // Skip step
                continue
            end
            else
                skip_counter ← 0 // Force parameter update
            end
        end
    end
    update_parameters() // Update model parameters
    Push current_norm onto S // Store the current norm
    if size of S &gt; 100 then
        Remove the oldest element from S // Maintain stack size
    end
    skip_counter ← 0 // Reset skip counter
end
</div>

算法 1 自适应梯度裁剪 (AGC) 的中文说明: 初始化空栈 S, 用于保存最近 100 个梯度范数; 跳过计数 skip_counter 置 0; 最大连续跳过次数 MAX_SKIP 置 1. 每个训练步先计算当前梯度范数 current_norm. 若 S 已存满 100 个, 计算最近 100 个范数的均值 avg_norm; 若 current_norm 大于 1.2 × avg_norm + 0.1, 且 skip_counter 小于 MAX_SKIP, 则计数加一并跳过本步; 否则把计数清零, 强制更新. 未被跳过的步执行参数更新, 把 current_norm 压入 S, S 超过 100 个时移除最旧元素, 最后把 skip_counter 清零.

> **确认:** Algorithm 1 叫 Adaptive Gradient Clipping, 可伪代码里并没有把梯度按比例缩小. 它实际做的是什么, 连续两步都超阈值时会怎样?
> 它做的是 「跳步」, 不是裁剪. 某步范数超过 1.2 × avg_norm + 0.1 时直接 continue, 这一步既不更新参数, 也不把该范数压入 S, 所以孤立尖峰不会抬高后续的均值. 若下一步仍超阈值, skip_counter 已达 MAX_SKIP=1, 于是走 else 分支强制更新, 并把这个大范数记入 S. 这对应正文的动机: 单步尖峰当作特殊数据丢掉, 连续尖峰当作参数进入陡峭区域, 照常更新. 另外前 100 步 S 未满, 不做任何判断; §4.2 的 1.0 范数裁剪与 AGC 是否叠加使用, 文中没有明说. 效果证据只有 3b 模型上的 Figure 10.

![Chart block](images/p12-figure-10-the-adaptive-gradient-clipping-agc-strategy.png)

Figure 10: The Adaptive Gradient Clipping (AGC) strategy improves the stability of the initial loss during training.

图 10: 自适应梯度裁剪 (AGC) 策略提升了训练初期 loss 的稳定性.

## 5 Alignments 对齐

### 5.1 Supervised Fine-Tuning 监督微调

We meticulously curated an instruction fine-tuning dataset comprising both a general instruction dataset and a medical instruction dataset.

我们精心整理了一个指令微调数据集, 包含通用指令数据与医学指令数据两部分.

<!-- page 13 of 33 -->

百川智能

#### 5.1.1 General SFT data 通用 SFT 数据

For the general instruction dataset, we iteratively refined our in-house data and specifically constructed task-focused data, including mathematics and coding competitions, to emphasize reasoning skills.

通用指令数据方面, 我们反复打磨内部数据, 并专门构造了面向任务的数据, 包括数学与编程竞赛题, 以强调推理能力.

#### 5.1.2 Medical SFT data 医学 SFT 数据

Regarding medical alignment data, we subdivide it into five major categories to ensure comprehensive coverage of diverse clinical scenarios: **(1) Medical Knowledge, (2) Medical Language Understanding, (3) Medical Reasoning, (4) Medical Long Context,** and **(5) Medical Safety.** Below, we outline each category in detail.

医学对齐数据细分为五大类, 以全面覆盖多样的临床场景: **(1) 医学知识, (2) 医学语言理解, (3) 医学推理, (4) 医学长上下文,** 以及 **(5) 医学安全.** 下面逐类说明.

**Medical Knowledge Data** We leverage online and open-source medical datasets to ensure a diverse range of inputs, which broadens the model’s factual base. A variety of publicly available databases, research publications, and anonymized clinical notes contribute to robust coverage of diseases, treatments, and medical terminologies. This diversity in raw data is vital for training high-performing medical LLMs, as it reflects real-world medical complexity.

**医学知识数据** 我们利用线上与开源医学数据集保证输入多样, 拓宽模型的事实基础. 各类公开数据库, 研究文献与匿名化临床记录共同保证了对疾病, 治疗与医学术语的稳健覆盖. 原始数据的这种多样性反映了真实医学的复杂性, 对训练高性能医学大模型至关重要.

**Medical Language Understanding Data** To accurately interpret domain-specific texts and dialogues, we develop specialized tasks:

**医学语言理解数据** 为准确理解领域文本与对话, 我们设计了专门任务:

• **Entity Extraction and Classification:** From patient-physician dialogues to structured medical records, the model is tasked with identifying key entities (e.g., symptoms, medications) and classifying them into standard categories.

• **实体抽取与分类:** 从医患对话到结构化病历, 模型需要识别关键实体 (如症状, 药物) 并归入标准类别.

• **Terminology Standardization:** We curate datasets of “non-standard term”– “standard term” pairs. This helps align the model output with accepted medical taxonomies, ensuring consistency and clarity.

• **术语标准化:** 我们整理 「非标准术语-标准术语」 配对数据, 帮助模型输出与公认医学分类体系对齐, 保证一致与清晰.

• **Intent and Context Analysis:** Through classification and discourse tasks, the model learns to handle different forms of clinical text, such as Q&A pairs, discharge summaries, and research articles.

• **意图与语境分析:** 通过分类与篇章任务, 模型学会处理不同形式的临床文本, 如问答对, 出院小结与研究文章.

**Medical Reasoning Data** Medical reasoning is essential for clinical decision-making. We implement a multi-stage pipeline to guide logical steps and quality assurance:

**医学推理数据** 医学推理是临床决策的核心. 我们实现了一条多阶段流水线, 引导逻辑步骤并保证质量:

• **Case Summaries and Differential Diagnosis:** The model synthesizes patient records and symptom data, prioritizing possible diagnoses and highlighting key clinical factors.

• **病例摘要与鉴别诊断:** 模型综合病历与症状数据, 给可能的诊断排序, 并突出关键临床因素.

• **Treatment Recommendations and Prognosis:** Based on relevant guidelines, the model proposes therapeutic strategies, discussing their pros and cons, and offering prognostic insights.

• **治疗建议与预后:** 模型依据相关指南提出治疗策略, 讨论利弊, 并给出预后判断.

• **Iterative Review Process:** The model undergoes multiple reasoning passes, refining its conclusions based on clinical best practices and additional feedback loops.

• **迭代复核:** 模型经过多轮推理, 依据临床最佳实践与额外的反馈回路修正结论.

**Medical Long Context Data** Clinical data often includes lengthy and complex references (e.g., guidelines, manuals, long-form case reports). We address this by:

**医学长上下文数据** 临床数据常含冗长复杂的参考材料 (如指南, 手册, 长篇病例报告). 我们这样处理:

• **Diverse Data Sources:** Medical manuals, guidelines, research papers, and extended patient records form the core corpus.

• **多样数据源:** 以医学手册, 指南, 研究论文与完整病历为核心语料.

• **Task-Oriented Prompt Construction:** We create tasks such as question answering, summarization, rewriting, and evidence extraction.

• **面向任务的提示构造:** 构造问答, 摘要, 改写与证据抽取等任务.

• **Context Extension:** Randomly concatenating additional documents before and after the main text expands the context window, training the model to manage long-sequence reasoning more effectively.

• **上下文扩展:** 在正文前后随机拼接其他文档以拉长上下文, 训练模型更有效地处理长序列推理.

<!-- page 14 of 33 -->

百川智能

**Medical Safety Data** Ensuring medical safety involves both data diversity and robust quality control over prompts and model outputs.

**医学安全数据** 保证医学安全既需要数据多样, 也需要对提示与模型输出做稳健的质量控制.

• **Define Coverage Labels:** We establish a comprehensive safety taxonomy, mapping potential high-risk topics or attack vectors to specific labels.

• **定义覆盖标签:** 建立完整的安全分类体系, 把潜在高风险话题或攻击方式映射到具体标签.

• **Set Safety Principles:** Each label is assigned clear guidelines on acceptable behavior and ethical considerations.

• **设定安全原则:** 每个标签都配有关于可接受行为与伦理考量的明确准则.

• **Refine Attack Strategies:** Based on accumulated knowledge of adversarial queries, we adjust and expand the database of potential attack types.

• **完善攻击策略:** 依据积累的对抗性提问经验, 调整并扩充潜在攻击类型库.

• **Illustrative Cases:** For each attack vector, we create 2–3 concrete examples to demonstrate how prompts could compromise patient privacy or safety.

• **示例案例:** 为每种攻击方式编写 2–3 个具体例子, 展示提示可能如何危及患者隐私或安全.

• **Prompt Generation:** Using prompt engineering (PE) and few-shot learning, we produce the required number of prompts for each attack type within each category.

• **提示生成:** 借助提示工程 (PE) 与 few-shot 学习, 为每个类别下的每种攻击类型生成所需数量的提示.

• **Deduplication:** Employing prefix/suffix alterations and semantic similarity checks, we remove duplicates to finalize the safety prompt set.

• **去重:** 通过前后缀改写与语义相似度检查去除重复, 最终确定安全提示集.

**Answer Quality 回答质量**

• **Data Augmentation:** We rely on real-world patient cases, such as MIMIC (Johnson et al., 2016; 2023) and PMC-Patient (Zhao et al., 2023), as primary data sources to generate questions with sufficient difficulty, real-world complexity, and coverage of the full spectrum of clinical scenarios.

• **数据增强:** 以 MIMIC (Johnson et al., 2016; 2023) 与 PMC-Patient (Zhao et al., 2023) 等真实病例为主要数据源, 生成难度足够, 贴近真实复杂度, 覆盖全谱临床场景的问题.

• **Candidate Answer Generation:** Combining each label’s safety principles with advanced LLMs, we produce multiple candidate answers for each prompt.

• **候选答案生成:** 结合各标签的安全原则与先进大模型, 为每个提示生成多个候选答案.

• **Human Expert Validation:** Domain experts review and refine the candidates to ensure they meet safety and accuracy standards, preserving critical medical context.

• **人类专家校验:** 领域专家审阅并完善候选答案, 确保符合安全与准确标准, 同时保留关键医学语境.

Each domain employed unique data creation strategies to fulfill its specialized requirements. We utilized both in-house and open-source models to generate the data. All original data sources, such as proprietary medical texts and patient records, underwent rigorous privacy protection measures. For reasoning-focused data, we adopted the format “system prompt + problem + response,” yielding entries in the form (system prompt, problem, response).

每个领域都采用了各自的数据构造策略以满足专门需求. 数据由内部模型与开源模型共同生成. 所有原始数据源, 如专有医学文本与病历, 都经过严格的隐私保护处理. 对推理类数据, 我们采用 「system prompt + problem + response」 的格式, 得到 (system prompt, problem, response) 形式的条目.

Finally, we fine-tuned Baichuan-M1-14B-Base over five rounds. During training, we used a cosine decay learning rate schedule starting at 2e-5 and gradually decreasing. When packing multiple samples into a single training sequence, we employed a “sample masking” strategy to prevent any cross-contamination between samples and ensure their independence.

最后, 我们对 Baichuan-M1-14B-Base 做了五轮微调. 训练中使用从 2e-5 起逐步下降的余弦衰减学习率. 把多条样本打包进同一训练序列时, 我们采用 「样本掩码」 策略, 防止样本之间相互串扰, 保证彼此独立.

### 5.2 Reinforcement Learning 强化学习

#### 5.2.1 Reward Model 奖励模型

We use both rule-based reward model (RM) and model-based reward model in our reinforcement learning process.

强化学习中我们同时使用基于规则的奖励模型 (RM) 与基于模型的奖励模型.

**Rule-based RM** For questions with verifiable answers, we construct a rule-based system to obtain the quantifiable feedback. Rule-based RM can indeed cover a massive range of domains and applications. For example, ground-truth of medical diagnosis can be extracted from medical textbooks, case histories etc. For self-contained coding problems such as those on Leetcode, we can leverage compiler feedback of test cases to verify the correctness. The main advantage of rule-based RM is its high reliability.

**基于规则的 RM** 对答案可验证的问题, 我们构建规则系统获取可量化反馈. 规则 RM 确实能覆盖大量领域与应用. 例如, 医学诊断的标准答案可从医学教科书, 病历等处提取; 对 Leetcode 上那类自包含的编程题, 可借测例的编译运行反馈验证正确性. 规则 RM 的主要优点是可靠性高.

**Model-based RM** For questions with uncertain answers, we rely on a model-based RM (trained from a Baichuan-M1 checkpoint) to provide the feedback. When training the model-based RM, we meticulously construct a preference dataset to impose expert priors in different domains, to reduce the risk of reward hacking.

**基于模型的 RM** 对答案不确定的问题, 我们依赖一个基于模型的 RM (由某个 Baichuan-M1 检查点训练而来) 提供反馈. 训练该 RM 时, 我们精心构造偏好数据集, 注入各领域的专家先验, 以降低 reward hacking 的风险.

<!-- page 15 of 33 -->

百川智能

![Image block](images/p15-figure-11-the-pipeline-of-our-three-staged.png)

Figure 11: The pipeline of our three-staged reinforcement learning.

图 11: 三阶段强化学习流程.

#### 5.2.2 Training Policies 训练策略

As shown in Figure 11, we apply a three-staged reinforcement learning process to further boost the reasoning ability of our model. This structured approach ensures that the model not only generates high-quality outputs but also aligns with user preferences and maintains logical coherence across diverse tasks. Each stage—Exploratory Log-likelihood Optimization (ELO), Token-Level Direct Preference Optimization (TDPO) Zeng et al. (2024), and Proximal Policy Optimization (PPO) Schulman et al. (2017)—plays a distinct role in refining the model’s capabilities.

如 Figure 11 所示, 我们用三阶段强化学习进一步提升模型的推理能力. 这种分阶段做法让模型不仅输出高质量内容, 还能对齐用户偏好, 并在多样任务中保持逻辑连贯. 三个阶段分别是探索式对数似然优化 (Exploratory Log-likelihood Optimization, ELO), token 级直接偏好优化 (TDPO, Zeng et al., 2024) 与近端策略优化 (PPO, Schulman et al., 2017), 各自在打磨模型能力上承担不同角色.

**Exploratory Log-likelihood Optimization** The ELO phase is designed to enhance the model’s ability to generate diverse and high-quality chain-of-thought (CoT) reasoning paths. Unlike traditional reinforcement learning methods that depend on a reward model to guide optimization, ELO directly optimizes the likelihood of generating coherent and logical reasoning paths. This is achieved by maximizing the probability of high-quality outputs given the input, without relying on external reward signals. For user queries Q, ELO aims to maximize the log-likelihood of the ground truth answer A by optimizing the distribution of CoT generated by model M:

**探索式对数似然优化** ELO 阶段旨在增强模型生成多样且高质量 CoT 推理路径的能力. 传统强化学习依赖奖励模型引导优化, ELO 则直接优化生成连贯, 合乎逻辑的推理路径的似然. 做法是在不依赖外部奖励信号的前提下, 最大化给定输入时高质量输出的概率. 对用户问题 Q, ELO 通过优化模型 M 生成的 CoT 分布, 最大化标准答案 A 的对数似然:

$$
L _ {E L O} = - \mathbb {E} _ {Q} \log \pi_ {M} (A | Q) = - \mathbb {E} _ {Q} \log \mathbb {E} _ {\mathrm{CoT} \sim M} \pi_ {M} (A | Q, \mathrm{CoT}).\tag{1}
$$

According to Jensen’s inequality, we can derive the variational upper bound of $L _ { E L O } ;$

由 Jensen 不等式, 可以推出 $L _ { E L O } ;$ 的变分上界:

$$
L _ {E L O} \leq L _ {u p p e r} = - \mathbb {E} _ {\bar {Q}} \mathbb {E} _ {\mathrm{CoT} \sim M} \log \pi_ {M} (A | Q, \mathrm{CoT}).\tag{2}
$$

We can derive the gradient of the $L _ { u p p e r }$ as

$L _ { u p p e r }$ 的梯度可以写成

$$
\nabla L _ {u p p e r} = - \mathbb {E} _ {Q} \mathbb {E} _ {\mathrm{CoT} \sim M} (\log \pi_ {M} (A | Q, \mathrm{CoT}) - b (Q, A)) \nabla \log \pi_ {M} (\mathrm{CoT} | Q),\tag{3}
$$

which can be directly optimized based on the log-likelihood of the ground truth answer. This approach eliminates potential biases introduced by reward models, ensuring more stable and logical reasoning generation.

这个梯度可以直接基于标准答案的对数似然来优化. 该方法消除了奖励模型可能引入的偏差, 使推理生成更稳定, 更合乎逻辑.

> **想:** 式 (2) 对 CoT 求期望, 而 CoT 本身由 M 采样, 两处都依赖参数. 式 (3) 却只保留了带 $\nabla \log \pi_M(\mathrm{CoT}|Q)$ 的那一项, 另一项去哪了?
> 对式 (2) 的 $L_{upper}$ 完整求导会得到两项: 一项是式 (3) 这种以 $\log \pi_M(A|Q,\mathrm{CoT})$ 为回报, 减去基线 $b(Q,A)$ 的得分函数项, 负责把概率推向 「能让标准答案更可信」 的 CoT; 另一项是 $-\nabla \log \pi_M(A|Q,\mathrm{CoT})$, 即在采样到的 CoT 之后直接对答案做监督. 式 (3) 没有写第二项, 正文也没有解释是省略, 另行训练还是有意去掉. Jensen 方向本身没问题: log 为凹函数, 故 $-\log \mathbb{E} \le -\mathbb{E}\log$. 式 (2) 下标里的 $\bar{Q}$ 与式 (1), (3) 的 $Q$ 不一致, 看起来是排版笔误. 另外 「不依赖外部奖励」 的前提是每个 Q 都有标准答案 A, 文中没有说明 ELO 阶段用了哪些数据.

**Token-Level Direct Preference Optimization** Building on the ELO-trained model, the TDPO phase refines the model using preference pair data. Traditional DPO methods often struggle with length-dependent constraints due to the nature of the KL divergence term, which enforces alignment between the generated outputs and a reference model. In DPO, the KL divergence tends to impose stronger constraints on shorter sequences while being less effective for longer ones. This imbalance can lead to suboptimal performance, especially in tasks requiring long-form reasoning or detailed explanations. TDPO addresses this limitation by introducing token-level optimization. Instead of applying constraints at the sequence level, TDPO operates at the token level, ensuring that the model maintains alignment with user preferences across both short and long sequences.

**token 级直接偏好优化** 在 ELO 训练后的模型上, TDPO 阶段用偏好对数据继续打磨模型. 传统 DPO 中, KL 散度项负责把生成结果约束在参考模型附近, 这一性质使 DPO 常受长度相关约束之苦: KL 散度往往对短序列约束更强, 对长序列约束偏弱. 这种不平衡会导致次优表现, 在需要长篇推理或详细解释的任务上尤其明显. TDPO 引入 token 级优化来解决这一问题: 不在序列级施加约束, 而在 token 级操作, 让模型在长短序列上都保持与用户偏好对齐.

> **再看:** 这段断言 DPO 的 KL 项 「对短序列约束更强, 对长序列偏弱」, Figure 11 也把 TDPO 标成 「Short/Long Text Balance」. 本文有没有给出 TDPO 的目标函数或长短样本上的对比?
> 没有. §5.2.2 对 TDPO 只有定性描述并引用 Zeng et al. (2024), 既没有写出 token 级约束的具体形式, 也没有给偏好数据规模, 更没有按长度分桶的实验. 三阶段 RL 在全文也没有逐阶段消融, Table 3 只报告最终的 Instruct 模型. 因此 「长短不平衡」 这一动机只能回到被引论文核对, 本报告内部无法验证.

**Proximal Policy optimization** In the final stage, PPO is employed to further refine the model’s generation strategy. PPO leverages the improvements achieved during the ELO and TDPO phases, combining them with feedback from a reward model to fine-tune the model’s policy. The reward model provides real-time feedback on the quality of generated outputs, ensuring that the model aligns with user preferences and performs well across a variety of tasks.

**近端策略优化** 最后一阶段用 PPO 进一步打磨模型的生成策略. PPO 在 ELO 与 TDPO 阶段成果的基础上, 结合奖励模型的反馈微调策略. 奖励模型对生成质量给出实时反馈, 保证模型对齐用户偏好, 并在多种任务上表现良好.

<!-- page 16 of 33 -->

百川智能

## 6 Evaluations 评测

### 6.1 Benchmarks 评测集

Our evaluation covers mainstream open-source datasets and private datasets. We categorize medical capabilities into three levels: medical fundamentals, medical examinations, and medical practice.

评测覆盖主流开源数据集与私有数据集. 我们把医学能力分为三个层级: 医学基础, 医学考试与医学实践.

The medical fundamentals level includes tasks such as MedNLI (Romanov & Shivade, 2018) and MedCalc (Khandekar et al., 2024). We also include some medical related subjects of MMLU Hendrycks et al. (2020).

医学基础层级包括 MedNLI (Romanov & Shivade, 2018) 与 MedCalc (Khandekar et al., 2024) 等任务, 另外纳入 MMLU (Hendrycks et al., 2020) 中与医学相关的若干科目.

• MedNLI is a natural language inference task, that is, to determine whether two medical statements are inclusive, mutually exclusive, or irrelevant.

• MedNLI 是自然语言推断任务, 即判断两条医学陈述是蕴含, 互斥还是无关.

• MedCalc is a medical calculation dataset. The model is asked to compute a clinical value based on a patient note.

• MedCalc 是医学计算数据集, 要求模型依据病历计算某项临床数值.

• MMLU is a well known benchmark for large language model evaluation, which covering 57 tasks.

• MMLU 是著名的大模型评测集, 涵盖 57 个任务.

Medical examinations focus on various real medical exams, including USMLE (Jin et al., 2021), CMExam (Liu et al., 2024b), MediQ (Li et al., 2024b), MedBullets (Chen et al., 2024a), Pubmedqa (Jin et al., 2019), ReDis-QA (Wang et al., 2024a), as well as intermediate-level physician exam questions collected from the Chinese Internet, covering pediatrics (Erke), internal medicine (Neike), and general practice (Quanke).

医学考试层级聚焦各类真实医学考试, 包括 USMLE (Jin et al., 2021), CMExam (Liu et al., 2024b), MediQ (Li et al., 2024b), MedBullets (Chen et al., 2024a), Pubmedqa (Jin et al., 2019), ReDis-QA (Wang et al., 2024a), 以及从中文互联网收集的中级医师考试题, 覆盖儿科 (Erke), 内科 (Neike) 与全科 (Quanke).

• USMLE is a subset of MedQA (Jin et al., 2021), whcih is collected form the professional medical board exams of US.

• USMLE 是 MedQA (Jin et al., 2021) 的子集, 取自美国执业医师资格考试.

• MediQ simulates an interactive conversation between a patient and an expert. This benchmark evaluates how well the participants’ expert modules can handle realistic patient queries by either asking relevant questions or making final decisions based on the conversation history.

• MediQ 模拟患者与专家的交互对话, 考察专家模块面对真实患者提问时, 能否依据对话历史提出相关问题或作出最终决策.

• MedBullets contains 308 questions of the USMLE Step 2 & 3 type. The questions are mainly collected from Twitter after 2022.

• MedBullets 含 308 道 USMLE Step 2 & 3 类型的题目, 主要收集自 2022 年之后的 Twitter.

• Pubmedqa is a biomedical-related question-answer dataset constructed from the abstract section of PubMed. Given a medical research question, you are required to answer it with yes/no/maybe based on the provided abstract.

• Pubmedqa 是基于 PubMed 摘要构建的生物医学问答数据集. 给定一个医学研究问题, 需依据所给摘要回答 yes/no/maybe.

• ReDis-QA is constructed around the diagnosis of rare diseases, covering 205 types of rare diseases. It is used to evaluate the performance of large language models in rare disease diagnosis.

• ReDis-QA 围绕罕见病诊断构建, 覆盖 205 种罕见病, 用于评估大模型的罕见病诊断能力.

• We created Erke, Neike and Quanke based on intermediate-level physician exam questions collected from the Chinese Internet.

• Erke, Neike 与 Quanke 由我们基于中文互联网收集的中级医师考试题构建.

The medical practice tier focuses on real consultations, including CMBClin (Wang et al., 2023), ClinicalBench (Yan et al., 2024), RareArena (Rar, 2024), RareBench (Chen et al., 2024e) and NEJMQA.

医学实践层级聚焦真实问诊, 包括 CMBClin (Wang et al., 2023), ClinicalBench (Yan et al., 2024), RareArena (Rar, 2024), RareBench (Chen et al., 2024e) 与 NEJMQA.

• CMBExam and CMBClin cover all levels of clinical medical specialties and comprehensively evaluate the model’s medical knowledge and clinical consultation abilities.

• CMBExam 与 CMBClin 覆盖临床医学各层级专科, 全面评估模型的医学知识与临床问诊能力.

• ClinicalBench contains clinical diagnosis evaluations covering 150 diseases in 24 departments based on real cases. There are a total of 1,500 samples. By simulating the complete medical treatment process, 8 tasks are set up to evaluate the model from the two dimensions of tasks and departments.

• ClinicalBench 基于真实病例, 包含覆盖 24 个科室 150 种疾病的临床诊断评测, 共 1,500 个样本. 通过模拟完整诊疗流程设置 8 项任务, 从任务与科室两个维度评估模型.

• RareArena is a dataset of nearly 50,000 rare disease diagnoses extracted from case summaries in PubMed Central, covering 4,597 rare disease types. It is divided into two settings: RDS (rare disease screening), where the input does not include specific examination results; and RDC (rare disease confirmation), where the input includes specific examinations.

• RareArena 是从 PubMed Central 病例摘要中提取的近 50,000 条罕见病诊断数据, 覆盖 4,597 种罕见病. 分为两种设置: RDS (罕见病筛查), 输入不含具体检查结果; RDC (罕见病确诊), 输入包含具体检查.

<!-- page 17 of 33 -->

百川智能

|  | Baichuan-M1-14B-Instruct | Qwen2.5-14B-Instruct | Qwen2.5-72B-Instruct | claude-3.5-sonnet | gpt-4o |
| --- | --- | --- | --- | --- | --- |
| Average | 72.23 | 65.39 | 70.51 | 74.85 | 75.00 |
| CMBClin | 77.40 | 71.51 | 75.36 | 78.37 | 75.36 |
| ClinicalBench-Diagnosis | 70.90 | 68.85 | 72.23 | 75.00 | 73.05 |
| ClinicalBench-Department | 70.05 | 68.83 | 70.53 | 65.58 | 69.38 |
| ClinicalBench-Treatment | 56.38 | 55.03 | 57.30 | 64.03 | 59.35 |
| RareArena-rdc | 81.80 | 66.40 | 76.20 | 89.60 | 88.40 |
| RareArena-rds | 54.00 | 42.60 | 49.80 | 59.80 | 57.20 |
| RareBench | 59.60 | 52.80 | 60.60 | 65.30 | 62.80 |
| NEJMQA | 49.75 | 45.69 | 50.76 | 69.54 | 54.31 |
| CMExam | 80.10 | 77.70 | 82.70 | 77.50 | 78.00 |
| Erke | 78.48 | 74.68 | 84.81 | 76.58 | 78.48 |
| Neike | 83.42 | 86.10 | 87.17 | 87.70 | 83.42 |
| Quanke | 87.07 | 88.44 | 88.44 | 81.63 | 84.35 |
| USMLE | 78.00 | 67.20 | 76.70 | 85.90 | 87.10 |
| MedBullets | 66.88 | 54.22 | 64.29 | 72.40 | 75.97 |
| MediQ | 83.40 | 66.80 | 79.90 | 88.80 | 90.20 |
| Pubmedqa | 75.20 | 76.40 | 75.60 | 77.00 | 77.60 |
| ReDis-QA | 74.50 | 69.70 | 75.00 | 83.20 | 82.80 |
| MedNLI-Dis | 80.40 | 68.90 | 74.90 | 58.30 | 79.80 |
| MedCalc | 56.00 | 31.40 | 37.90 | 52.60 | 49.00 |
| MMLU-anatomy | 80.00 | 67.41 | 71.11 | 86.67 | 91.11 |
| MMLU-virology | 54.82 | 56.02 | 53.01 | 54.22 | 57.23 |
| MMLU-genetics | 91.00 | 82.00 | 87.00 | 97.00 | 95.00 |

Table 3: Results of Baichuan-M1-14B-Instruct, compared with strong baselines.

表 3: Baichuan-M1-14B-Instruct 与强基线的对比结果.

• RareBench covers patient electronic health records (EHRs), symptoms, and confirmed diagnosis information, involving numerous rare diseases and some common diseases.

• RareBench 涵盖患者电子健康记录 (EHR), 症状与确诊信息, 涉及大量罕见病和部分常见病.

• We created NEJMQA dataset using case challenges from The New England Journal of Medicine<sup>2</sup>(NEJM) to construct diagnostic questions, including nearly 200 patients.

• NEJMQA 由我们利用 The New England Journal of Medicine<sup>2</sup> (NEJM) 的病例挑战构造诊断题, 包含近 200 名患者.

For each benchmark, we randomly select at most 1000 samples in our evaluation.

每个评测集我们最多随机抽取 1000 个样本.

### 6.2 Response and Scoring 回答生成与打分

The prompts used to obtain responses for different benchmarks are listed in Appendix D Table 5.

各评测集用于生成回答的提示见附录 D 的 Table 5.

The generated responses are all free text. We use open-source Qwen2.5-72B-Instruct (Qwen et al., 2025) to perform post-processing or scoring on the responses.

生成的回答全是自由文本. 我们用开源的 Qwen2.5-72B-Instruct (Qwen et al., 2025) 对回答做后处理或打分.

For multiple-choice questions, we first extract the selected option labels and then compare them with the correct answers to determine the score. For other benchmarks, we acquire the score based on the prompts in Appendix D Table 6 directly. The scores for each benchmark will be normalized.

对选择题, 先抽取所选选项标签, 再与正确答案比对得分. 其他评测集直接依据附录 D Table 6 的提示打分. 各评测集得分会做归一化.

> **停一下:** 打分模型是 Qwen2.5-72B-Instruct, 而它本身也是 Table 3 的一列对照. 裁判和选手是同一个模型, 会不会偏向自己?
> 要分题型看. 选择题只让裁判抽取选项标签再与答案比对 (Table 6 第一行), 裁判几乎没有发挥空间. CMBClin 的 0 到 4 分, NEJMQA, RareArena, RareBench 的 「正确诊断是否在前五且上位概念也算对」, 以及 MedCalc 的一致性判断, 都要裁判作语义判断, 这些行才存在自评偏好的可能. 本文没有报告裁判与人类专家的一致率, 也没有换裁判复核. 另外每个评测集最多随机抽 1000 条, 抽样种子与方差也未给出.

### 6.3 Results 结果

As shown in Table 3, Baichuan-M1-14B-Instruct surpasses Qwen2.5-72B-Instruct, which is one of the strongest open-source models, in the area of medicine. Although Baichuan-M1-

如 Table 3 所示, Baichuan-M1-14B-Instruct 在医学领域超过了最强开源模型之一 Qwen2.5-72B-Instruct. 尽管 Baichuan-M1-

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>https://www.nejm.org/</span></small>

<small>2 NEJM 官网: https://www.nejm.org/</small>

<!-- page 18 of 33 -->

百川智能

|  | Baichuan-M1 |  |  |  |
| --- | --- | --- | --- | --- |
| Model | -14B-Base | Qwen2.5-14B | Qwen2.5-32B | Qwen2.5-72B |
| MBPP | 74.0 | 72.8 | 83.3 | 86.5 |
| MBPP+ | 63.0 | 63.2 | 69.0 | 70.1 |
| HumanEval | 60.4 | 56.7 | 58.5 | 59.1 |
| HumanEval+ | 53.7 | 51.2 | 54.3 | 54.9 |
| Bigcodebench | 48.7 | 46.8 | 47.2 | 50.3 |
| MATH | 46.0 | 45.4 | 50.6 | 48.2 |
| CMATH | 88.3 | 88.7 | 86.8 | - |

Table 4: Code and math ability of Baichuan-M1-14B-Base.

表 4: Baichuan-M1-14B-Base 的代码与数学能力.

14B-Instruct is still lagging behind Claude-3.5-Sonnet<sup>3</sup> and GPT-4o<sup>4</sup>, which are the most representative proprietary models, the gap is no longer significant.

14B-Instruct 仍落后于最具代表性的闭源模型 Claude-3.5-Sonnet<sup>3</sup> 与 GPT-4o<sup>4</sup>, 但差距已不再显著.

> **回看:** 「超过 Qwen2.5-72B-Instruct」 依据的是 Table 3 的 Average. 这个平均分是怎么算的, 领先主要来自哪几行?
> Average 是 22 行的算术平均, 用表中数字复算可以对上. 逐行看, M1-14B 与 72B 各胜 11 行, 并非全面领先. 领先集中在 MedCalc, MedNLI-Dis, RareArena 两个设置, MediQ 与 MMLU-anatomy 等行, 其中 MedCalc 一行的差距就贡献了平均分差的将近一半. 反过来, CMExam, Erke, Neike, Quanke 这组中文医师考试, 以及 ClinicalBench 三项, 都是 72B 更高. 所以 「超过 72B」 更准确的读法是: 在计算类与罕见病类任务上明显更强, 在中文考试类任务上仍然落后.

We show some examples in Appendix D Table 7.

部分示例见附录 D 的 Table 7.

In addition, we also show the code and math ability of Baichuan-M1-14B-Base, compared with the Qwen2.5 series models (Qwen et al., 2025). We tested the performance of code generation based on the EvalPlus framework (Liu et al., 2024a) and Bigcodebench (Zhuo et al., 2024). We use MATH (Hendrycks et al., 2021) and CMATH (Wei et al., 2023) to evaluate the math ability.

此外, 我们还展示 Baichuan-M1-14B-Base 的代码与数学能力, 并与 Qwen2.5 系列模型 (Qwen et al., 2025) 对比. 代码生成基于 EvalPlus 框架 (Liu et al., 2024a) 与 Bigcodebench (Zhuo et al., 2024) 测试; 数学能力用 MATH (Hendrycks et al., 2021) 与 CMATH (Wei et al., 2023) 评估.

## 7 Discussion and Conclusion

### 7.1 Continue Pre-training or Training from Scratch? 继续预训练还是从零训练?

Most previous works applying large language models to specialized domains involve additional training on an off-the-shelf base model Dou et al. (2024); Singhal et al. (2025); Zhang & Yang (2023). This approach is considered the most effective for improving vertical capabilities while maintaining general performance. However, in our preliminary experiments, we found that continuing training on well-trained base models, especially those that have undergone annealing, makes it difficult to improve vertical capabilities without sacrificing general capabilities.

以往把大模型用于专业领域的工作, 大多是在现成底座上追加训练 (Dou et al., 2024; Singhal et al., 2025; Zhang & Yang, 2023). 这种做法被认为是在保持通用性能的同时提升垂直能力的最有效途径. 然而我们的初步实验发现, 在训练充分的底座上继续训练, 尤其是已经退火过的底座, 很难在不牺牲通用能力的前提下提升垂直能力.

In the medical domain, the language used and the knowledge involved are significantly different from those in general domains. Therefore, the approach of continuing training by simply increasing the proportion of domain-specific data or adjusting the learning rate may be ineffective, if not impossible, in truly improving medical capabilities, compared to post-training or training from scratch. More future work should focus on this interesting and important task.

医学领域使用的语言和涉及的知识与通用领域差别很大. 因此, 与后训练或从零训练相比, 靠单纯提高领域数据比例或调整学习率来继续训练, 即便不是不可能, 也可能无法真正提升医学能力. 未来应有更多工作关注这个有趣而重要的问题.

> **确认:** §7.1 是全文 「从零训练」 路线的核心论据, 依据是 「初步实验」. 报告里有没有给出继续预训练的对照数字?
> 没有. §7.1 只有文字结论, 没有表或图. Table 3 与 Table 4 的对照对象是 Qwen2.5 系列, 数据与算力都不同, 不能当作 「同数据下继续预训练 vs 从零训练」 的受控对比. 值得注意的是, 作者特别点出 「已经退火过的底座」 最难继续训练, 这与 §4.2 选用 WSD 调度是呼应的: WSD 平台期的检查点尚未退火, 正是适合接着训练的那类起点. 但这层联系是读者推断, 文中没有展开.

### 7.2 Conclusion and Future Work

In conclusion, the introduction of Baichuan-M1 marks a significant advancement in the application of large language models (LLMs) to the medical domain. By training from scratch with a dedicated focus on medical expertise, Baichuan-M1 overcomes the limitations of traditional approaches that rely on fine-tuning general-purpose models. This approach has proven to be particularly effective in handling the complexities of medical knowledge, enabling the model to perform robustly across a range of medical applications, from diagnostics to treatment recommendations.

总之, Baichuan-M1 的推出标志着大语言模型在医学领域应用上的重要进展. 通过专注医学专长的从零训练, Baichuan-M1 克服了依赖微调通用模型的传统方法的局限. 这种方法在处理复杂医学知识上尤其有效, 让模型在从诊断到治疗建议的一系列医学应用中表现稳健.

The model’s strength lies not only in its ability to integrate vast amounts of medical literature, clinical data, and expert-curated sources but also in its sophisticated training methodologies, including the use of synthetic data and a finely tuned pre-training process. The balance

模型的优势不仅在于能整合海量医学文献, 临床数据与专家整理来源, 还在于精细的训练方法, 包括合成数据的使用与精心调校的预训练流程.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>claude-3.5-sonnet-20241022</span></small>

<small>3 所用版本为 claude-3.5-sonnet-20241022.</small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>gpt-4o-2024-05-13</span></small>

<small>4 所用版本为 gpt-4o-2024-05-13.</small>

<!-- page 19 of 33 -->

百川智能

between general capabilities and specialized medical knowledge ensures that Baichuan-M1 excels in both common language tasks and highly specialized medical queries.

通用能力与专业医学知识之间的平衡, 保证了 Baichuan-M1 在常规语言任务和高度专业的医学问题上都表现出色.

Furthermore, the open-sourcing of Baichuan-M1-14B provides an important resource for the broader research community, facilitating further exploration and refinement of medical LLMs. While there is still room for improvement, especially in the areas of rare disease diagnosis and real-world clinical consultation, the results demonstrate that Baichuan-M1 represents a promising leap forward in developing LLMs that can meet the precise demands of the medical field. The model’s continued evolution will likely contribute to the enhancement of AI-driven medical decision-making, offering both improved accuracy and greater potential for advancing healthcare technologies.

此外, Baichuan-M1-14B 的开源为更广泛的研究社区提供了重要资源, 便于进一步探索和改进医学大模型. 尽管仍有提升空间, 尤其是在罕见病诊断与真实临床问诊方面, 结果表明 Baichuan-M1 是开发满足医学精确要求的大模型路上一次有希望的飞跃. 模型的持续演进有望推动 AI 驱动的医学决策, 带来更高的准确性, 也为医疗技术进步提供更大潜力.

<!-- page 20 of 33 -->

百川智能

## References

Rarearena. [https://github.com/zhao-zy15/RareArena/](https://github.com/zhao-zy15/RareArena/), 2024.

Marah Abdin, Jyoti Aneja, Harkirat Behl, Sébastien Bubeck, Ronen Eldan, Suriya Gunasekar, Michael Harrison, Russell J. Hewett, Mojan Javaheripi, Piero Kauffmann, James R. Lee, Yin Tat Lee, Yuanzhi Li, Weishung Liu, Caio C. T. Mendes, Anh Nguyen, Eric Price, Gustavo de Rosa, Olli Saarikivi, Adil Salim, Shital Shah, Xin Wang, Rachel Ward, Yue Wu, Dingli Yu, Cyril Zhang, and Yi Zhang. Phi-4 technical report, 2024. URL [https://arxiv.org/abs/2412.08905](https://arxiv.org/abs/2412.08905).

Ibrahim Adeshola and Adeola Praise Adepoju. The opportunities and challenges of chatgpt in education. Interactive Learning Environments, 32(10):6159–6172, 2024.

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, and Charles Sutton. Program synthesis with large language models, 2021. URL [https://arxiv.org/abs/2108.07732](https://arxiv.org/abs/2108.07732).

Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, et al. Qwen technical report. arXiv preprint arXiv:2309.16609, 2023.

Maximilian Beck, Korbinian Pöppel, Markus Spanring, Andreas Auer, Oleksandra Prudnikova, Michael Kopp, Günter Klambauer, Johannes Brandstetter, and Sepp Hochreiter. xlstm: Extended long short-term memory. arXiv preprint arXiv:2405.04517, 2024.

Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi, et al. Piqa: Reasoning about physical commonsense in natural language. In Proceedings of the AAAI conference on artificial intelligence, volume 34, pp. 7432–7439, 2020.

Hanjie Chen, Zhouxiang Fang, Yash Singla, and Mark Dredze. Benchmarking large language models on answering and explaining challenging medical questions. arXiv preprint arXiv:2402.18060, 2024a.

Hao Chen, Abdul Waheed, Xiang Li, Yidong Wang, Jindong Wang, Bhiksha Raj, and Marah I. Abdin. On the diversity of synthetic data and its impact on training large language models, 2024b. URL [https://arxiv.org/abs/2410.15226](https://arxiv.org/abs/2410.15226).

Junying Chen, Zhenyang Cai, Ke Ji, Xidong Wang, Wanlong Liu, Rongsheng Wang, Jianye Hou, and Benyou Wang. Huatuogpt-o1, towards medical complex reasoning with llms. arXiv preprint arXiv:2412.18925, 2024c.

Justin Chih-Yao Chen, Zifeng Wang, Hamid Palangi, Rujun Han, Sayna Ebrahimi, Long Le, Vincent Perot, Swaroop Mishra, Mohit Bansal, Chen-Yu Lee, and Tomas Pfister. Reverse thinking makes llms stronger reasoners, 2024d. URL [https://arxiv.org/abs/2411.19865](https://arxiv.org/abs/2411.19865).

Xuanzhong Chen, Xiaohao Mao, Qihan Guo, Lun Wang, Shuyang Zhang, and Ting Chen. Rarebench: Can llms serve as rare diseases specialists? In Proceedings of the 30th ACM SIGKDD Conference on Knowledge Discovery and Data Mining, pp. 4850–4861, 2024e.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

DeepSeek-AI, Aixin Liu, Bei Feng, Bing Xue, Bingxuan Wang, Bochao Wu, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chenyu Zhang, Chong Ruan, Damai Dai, Daya Guo, Dejian Yang, Deli Chen, Dongjie Ji, Erhang Li, Fangyun Lin, Fucong Dai, Fuli Luo, Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang, Han Bao, Hanwei Xu, Haocheng Wang, Haowei Zhang, Honghui Ding, Huajian Xin, Huazuo Gao, Hui Li, Hui Qu, J. L. Cai, Jian Liang, Jianzhong Guo, Jiaqi Ni, Jiashi Li, Jiawei Wang, Jin Chen, Jingchang Chen, Jingyang Yuan, Junjie Qiu, Junlong Li, Junxiao Song, Kai Dong, Kai Hu, Kaige Gao, Kang Guan, Kexin Huang, Kuai Yu, Lean Wang, Lecong Zhang, Lei Xu, Leyi Xia, Liang

<!-- page 21 of 33 -->

百川智能

Zhao, Litong Wang, Liyue Zhang, Meng Li, Miaojun Wang, Mingchuan Zhang, Minghua Zhang, Minghui Tang, Mingming Li, Ning Tian, Panpan Huang, Peiyi Wang, Peng Zhang, Qiancheng Wang, Qihao Zhu, Qinyu Chen, Qiushi Du, R. J. Chen, R. L. Jin, Ruiqi Ge, Ruisong Zhang, Ruizhe Pan, Runji Wang, Runxin Xu, Ruoyu Zhang, Ruyi Chen, S. S. Li, Shanghao Lu, Shangyan Zhou, Shanhuang Chen, Shaoqing Wu, Shengfeng Ye, Shengfeng Ye, Shirong Ma, Shiyu Wang, Shuang Zhou, Shuiping Yu, Shunfeng Zhou, Shuting Pan, T. Wang, Tao Yun, Tian Pei, Tianyu Sun, W. L. Xiao, Wangding Zeng, Wanjia Zhao, Wei An, Wen Liu, Wenfeng Liang, Wenjun Gao, Wenqin Yu, Wentao Zhang, X. Q. Li, Xiangyue Jin, Xianzu Wang, Xiao Bi, Xiaodong Liu, Xiaohan Wang, Xiaojin Shen, Xiaokang Chen, Xiaokang Zhang, Xiaosha Chen, Xiaotao Nie, Xiaowen Sun, Xiaoxiang Wang, Xin Cheng, Xin Liu, Xin Xie, Xingchao Liu, Xingkai Yu, Xinnan Song, Xinxia Shan, Xinyi Zhou, Xinyu Yang, Xinyuan Li, Xuecheng Su, Xuheng Lin, Y. K. Li, Y. Q. Wang, Y. X. Wei, Y. X. Zhu, Yang Zhang, Yanhong Xu, Yanhong Xu, Yanping Huang, Yao Li, Yao Zhao, Yaofeng Sun, Yaohui Li, Yaohui Wang, Yi Yu, Yi Zheng, Yichao Zhang, Yifan Shi, Yiliang Xiong, Ying He, Ying Tang, Yishi Piao, Yisong Wang, Yixuan Tan, Yiyang Ma, Yiyuan Liu, Yongqiang Guo, Yu Wu, Yuan Ou, Yuchen Zhu, Yuduan Wang, Yue Gong, Yuheng Zou, Yujia He, Yukun Zha, Yunfan Xiong, Yunxian Ma, Yuting Yan, Yuxiang Luo, Yuxiang You, Yuxuan Liu, Yuyang Zhou, Z. F. Wu, Z. Z. Ren, Zehui Ren, Zhangli Sha, Zhe Fu, Zhean Xu, Zhen Huang, Zhen Zhang, Zhenda Xie, Zhengyan Zhang, Zhewen Hao, Zhibin Gou, Zhicheng Ma, Zhigang Yan, Zhihong Shao, Zhipeng Xu, Zhiyu Wu, Zhongyu Zhang, Zhuoshu Li, Zihui Gu, Zijia Zhu, Zijun Liu, Zilin Li, Ziwei Xie, Ziyang Song, Ziyi Gao, and Zizheng Pan. Deepseek-v3 technical report, 2024. URL [https://arxiv.org/abs/2412.19437](https://arxiv.org/abs/2412.19437).

Longxu Dou, Qian Liu, Guangtao Zeng, Jia Guo, Jiahui Zhou, Wei Lu, and Min Lin. Sailor: Open language models for south-east asia. arXiv preprint arXiv:2404.03608, 2024.

Daniel Y Fu, Tri Dao, Khaled K Saab, Armin W Thomas, Atri Rudra, and Christopher Ré. Hungry hungry hippos: Towards language modeling with state space models. arXiv preprint arXiv:2212.14052, 2022.

Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, Xiao Bi, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv:2009.03300, 2020.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding, 2021.

Shengding Hu, Yuge Tu, Xu Han, Chaoqun He, Ganqu Cui, Xiang Long, Zhi Zheng, Yewei Fang, Yuxiang Huang, Weilin Zhao, et al. Minicpm: Unveiling the potential of small language models with scalable training strategies. arXiv preprint arXiv:2404.06395, 2024.

Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Jiayi Lei, Yao Fu, Maosong Sun, and Junxian He. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In Advances in Neural Information Processing Systems, 2023.

Binyuan Hui, Jian Yang, Zeyu Cui, Jiaxi Yang, Dayiheng Liu, Lei Zhang, Tianyu Liu, Jiajun Zhang, Bowen Yu, Keming Lu, Kai Dang, Yang Fan, Yichang Zhang, An Yang, Rui Men, Fei Huang, Bo Zheng, Yibo Miao, Shanghaoran Quan, Yunlong Feng, Xingzhang Ren, Xuancheng Ren, Jingren Zhou, and Junyang Lin. Qwen2.5-coder technical report. arXiv preprint arXiv:2409.12186, 2024. URL [https://arxiv.org/abs/2409.12186](https://arxiv.org/abs/2409.12186).

Di Jin, Eileen Pan, Nassim Oufattole, Wei-Hung Weng, Hanyi Fang, and Peter Szolovits. What disease does this patient have? a large-scale open domain question answering dataset from medical exams. Applied Sciences, 11(14):6421, 2021.

Qiao Jin, Bhuwan Dhingra, Zhengping Liu, William W Cohen, and Xinghua Lu. Pubmedqa: A dataset for biomedical research question answering. arXiv preprint arXiv:1909.06146, 2019.

<!-- page 22 of 33 -->

百川智能

Alistair EW Johnson, Tom J Pollard, Lu Shen, Li-wei H Lehman, Mengling Feng, Mohammad Ghassemi, Benjamin Moody, Peter Szolovits, Leo Anthony Celi, and Roger G Mark. Mimiciii, a freely accessible critical care database. Scientific data, 3(1):1–9, 2016.

Alistair EW Johnson, Lucas Bulgarelli, Lu Shen, Alvin Gayles, Ayad Shammout, Steven Horng, Tom J Pollard, Sicheng Hao, Benjamin Moody, Brian Gow, et al. Mimic-iv, a freely accessible electronic health record dataset. Scientific data, 10(1):1, 2023.

Nikhil Khandekar, Qiao Jin, Guangzhi Xiong, Soren Dunn, Serina S Applebaum, Zain Anwar, Maame Sarfo-Gyamfi, Conrad W Safranek, Abid A Anwar, Andrew Zhang, Aidan Gilson, Maxwell B Singer, Amisha Dave, Andrew Taylor, Aidong Zhang, Qingyu Chen, and Zhiyong Lu. Medcalc-bench: Evaluating large language models for medical calculations, 2024.

T Kudo. Sentencepiece: A simple and language independent subword tokenizer and detokenizer for neural text processing. arXiv preprint arXiv:1808.06226, 2018.

Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese, 2024a.

Shuyue Stella Li, Vidhisha Balachandran, Shangbin Feng, Jonathan Ilgen, Emma Pierson, Pang Wei Koh, and Yulia Tsvetkov. Mediq: Question-asking llms for adaptive and reliable medical reasoning. arXiv preprint arXiv:2406.00922, 2024b.

Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by chatgpt really correct? rigorous evaluation of large language models for code generation. Advances in Neural Information Processing Systems, 36, 2024a.

Junling Liu, Peilin Zhou, Yining Hua, Dading Chong, Zhongyu Tian, Andrew Liu, Helin Wang, Chenyu You, Zhenhua Guo, Lei Zhu, et al. Benchmarking large language models on cmexam-a comprehensive chinese medical exam dataset. Advances in Neural Information Processing Systems, 36, 2024b.

Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. arXiv preprint arXiv:1711.05101, 2017.

Pratyush Maini, Skyler Seto, He Bai, David Grangier, Yizhe Zhang, and Navdeep Jaitly. Rephrasing the web: A recipe for compute and data-efficient language modeling, 2024. URL [https://arxiv.org/abs/2401.16380](https://arxiv.org/abs/2401.16380).

Xin Men, Mingyu Xu, Qingyu Zhang, Bingning Wang, Hongyu Lin, Yaojie Lu, Xianpei Han, and Weipeng Chen. Shortgpt: Layers in large language models are more redundant than you expect. arXiv preprint arXiv:2403.03853, 2024.

OpenAI. Introducing chatgpt. Blog post openai.com/blog/chatgpt, 2022.

OpenAI. Gpt-4 technical report. ArXiv, abs/2303.08774, 2023.

Guilherme Penedo, Hynek Kydlíček, Loubna Ben allal, Anton Lozhkov, Margaret Mitchell, Colin Raffel, Leandro Von Werra, and Thomas Wolf. The fineweb datasets: Decanting the web for the finest text data at scale, 2024. URL [https://arxiv.org/abs/2406.17557](https://arxiv.org/abs/2406.17557).

Bo Peng, Eric Alcaide, Quentin Anthony, Alon Albalak, Samuel Arcadinho, Stella Biderman, Huanqi Cao, Xin Cheng, Michael Chung, Leon Derczynski, et al. Rwkv: Reinventing rnns for the transformer era. In Findings of the Association for Computational Linguistics: EMNLP 2023, pp. 14048–14077, 2023.

Qwen, :, An Yang, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chengyuan Li, Dayiheng Liu, Fei Huang, Haoran Wei, Huan Lin, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Yang, Jiaxi Yang, Jingren Zhou, Junyang Lin, Kai Dang, Keming Lu, Keqin Bao, Kexin Yang, Le Yu, Mei Li, Mingfeng Xue, Pei Zhang, Qin Zhu, Rui Men, Runji Lin, Tianhao Li, Tianyi Tang, Tingyu Xia, Xingzhang Ren, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yu Wan, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, and Zihan Qiu. Qwen2.5 technical report, 2025. URL [https://arxiv.org/abs/2412.15115](https://arxiv.org/abs/2412.15115).

<!-- page 23 of 33 -->

百川智能

Alexey Romanov and Chaitanya Shivade. Lessons from natural language inference in the clinical domain. 2018. URL [http://arxiv.org/abs/1808.06752](http://arxiv.org/abs/1808.06752).

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An adversarial winograd schema challenge at scale. Communications of the ACM, 64(9):99–106, 2021.

Mohammad-Javad Sanaei, Mehrnaz Sadat Ravari, and Hassan Abolghasemi. Chatgpt in medicine: Opportunity and challenges. Iranian Journal of Blood and Cancer, 15(3):60–67, 2023.

John Schulman, Filip Wolski, Prafulla Dhariwal, Alec Radford, and Oleg Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv:1707.06347, 2017.

Rico Sennrich. Neural machine translation of rare words with subword units. arXiv preprint arXiv:1508.07909, 2015.

Noam Shazeer. Glu variants improve transformer. arXiv preprint arXiv:2002.05202, 2020.

Hoo-Chang Shin, Yang Zhang, Evelina Bakhturina, Raul Puri, Mostofa Patwary, Mohammad Shoeybi, and Raghav Mani. Biomegatron: larger biomedical domain language model. In Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pp. 4700–4706, 2020.

Karan Singhal, Tao Tu, Juraj Gottweis, Rory Sayres, Ellery Wulczyn, Mohamed Amin, Le Hou, Kevin Clark, Stephen R Pfohl, Heather Cole-Lewis, et al. Toward expert-level medical question answering with large language models. Nature Medicine, pp. 1–8, 2025.

David So, Wojciech Mańke, Hanxiao Liu, Zihang Dai, Noam Shazeer, and Quoc V Le. Searching for efficient transformers for language modeling. Advances in neural information processing systems, 34:6010–6022, 2021.

Kyle Dylan Spurlock, Cagla Acun, Esin Saka, and Olfa Nasraoui. Chatgpt for conversational recommendation: Refining recommendations by reprompting with feedback. arXiv preprint arXiv:2401.03605, 2024.

Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

Liping Tang, Nikhil Ranjan, Omkar Pangarkar, Xuezhi Liang, Zhen Wang, Li An, Bhaskar Rao, Linghao Jin, Huijuan Wang, Zhoujun Cheng, Suqi Sun, Cun Mu, Victor Miller, Xuezhe Ma, Yue Peng, Zhengzhong Liu, and Eric P. Xing. Txt360: A top-quality llm pre-training dataset requires the perfect blend. [https://huggingface.co/spaces/LLM360/TxT360](https://huggingface.co/spaces/LLM360/TxT360), 2024.

Ross Taylor, Marcin Kardas, Guillem Cucurull, Thomas Scialom, Anthony Hartshorn, Elvis Saravia, Andrew Poulton, Viktor Kerkez, and Robert Stojnic. Galactica: A large language model for science. arXiv preprint arXiv:2211.09085, 2022.

Gemma Team, Morgane Riviere, Shreya Pathak, Pier Giuseppe Sessa, Cassidy Hardin, Surya Bhupatiraju, Léonard Hussenot, Thomas Mesnard, Bobak Shahriari, Alexandre Ramé, et al. Gemma 2: Improving open language models at a practical size. arXiv preprint arXiv:2408.00118, 2024.

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, and Guillaume Lample. Llama: Open and efficient foundation language models, 2023.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

<!-- page 24 of 33 -->

百川智能

Roger Waleffe, Wonmin Byeon, Duncan Riach, Brandon Norick, Vijay Anand Korthikanti, Tri Dao, Albert Gu, Ali Hatamizadeh, Sudhakar Singh, Deepak Narayanan, Garvit Kulshreshtha, Vartika Singh, Jared Casper, Jan Kautz, Mohammad Shoeybi, and Bryan Catanzaro. An empirical study of mamba-based language models. ArXiv, abs/2406.07887, 2024. URL [https://api.semanticscholar.org/CorpusID:270391285](https://api.semanticscholar.org/CorpusID:270391285).

Dandan Wang and Shiqing Zhang. Large language models in medical and healthcare fields: applications, advances, and challenges. Artificial Intelligence Review, 57(11):299, 2024.

Guanchu Wang, Junhao Ran, Ruixiang Tang, Chia-Yuan Chang, Yu-Neng Chuang, Zirui Liu, Vladimir Braverman, Zhandong Liu, and Xia Hu. Assessing and enhancing large language models in rare disease question-answering. arXiv preprint arXiv:2408.08422, 2024a.

Haochun Wang, Sendong Zhao, Zewen Qiang, Zijian Li, Chi Liu, Nuwa Xi, Yanrui Du, Bing Qin, and Ting Liu. Knowledge-tuning large language models with structured medical knowledge bases for trustworthy response generation in chinese. ACM Trans. Knowl. Discov. Data, August 2024b. ISSN 1556-4681. doi: 10.1145/3686807. URL [https://doi.org/10.1145/3686807](https://doi.org/10.1145/3686807). Just Accepted.

Xidong Wang, Guiming Hardy Chen, Dingjie Song, Zhiyi Zhang, Zhihong Chen, Qingying Xiao, Feng Jiang, Jianquan Li, Xiang Wan, Benyou Wang, et al. Cmb: A comprehensive medical benchmark in chinese. arXiv preprint arXiv:2308.08833, 2023.

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Ed H. Chi, F. Xia, Quoc Le, and Denny Zhou. Chain of thought prompting elicits reasoning in large language models. ArXiv, abs/2201.11903, 2022. URL [https://api.semanticscholar.org/CorpusID:246411621](https://api.semanticscholar.org/CorpusID:246411621).

Tianwen Wei, Jian Luan, Wei Liu, Shuang Dong, and Bin Wang. Cmath: Can your language model pass chinese elementary school math test?, 2023.

Wenhao Wu, Yizhong Wang, Guangxuan Xiao, Hao Peng, and Yao Fu. Retrieval head mechanistically explains long-context factuality. arXiv preprint arXiv:2404.15574, 2024.

Jingjing Xu, Xu Sun, Zhiyuan Zhang, Guangxiang Zhao, and Junyang Lin. Understanding and improving layer normalization. Advances in neural information processing systems, 32, 2019.

Mingyu Xu, Wei Cheng, Bingning Wang, and Weipeng Chen. Kv shifting attention enhances language modeling. arXiv preprint arXiv:2411.19574, 2024a.

Mingyu Xu, Xin Men, Bingning Wang, Qingyu Zhang, Hongyu Lin, Xianpei Han, et al. Base of rope bounds context length. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024b.

Weixiang Yan, Haitian Liu, Tengxiao Wu, Qian Chen, Wen Wang, Haoyuan Chai, Jiayi Wang, Weishan Zhao, Yixin Zhang, Renjun Zhang, et al. Clinicallab: Aligning agents for multi-departmental clinical diagnostics in the real world. arXiv preprint arXiv:2406.13890, 2024.

Aiyuan Yang, Bin Xiao, Bingning Wang, Borong Zhang, Ce Bian, Chao Yin, Chenxu Lv, Da Pan, Dian Wang, Dong Yan, et al. Baichuan 2: Open large-scale language models. arXiv preprint arXiv:2309.10305, 2023.

Bowen Yang, Bharat Venkitesh, Dwarak Talupuru, Hangyu Lin, David Cairuz, Phil Blunsom, and Acyr Locatelli. Rope to nope and back again: A new hybrid attention strategy. arXiv preprint arXiv:2501.18795, 2025a.

Songlin Yang, Bailin Wang, Yu Zhang, Yikang Shen, and Yoon Kim. Parallelizing linear transformers with the delta rule over sequence length. arXiv preprint arXiv:2406.06484, 2024.

<!-- page 25 of 33 -->

百川智能

Songlin Yang, Jan Kautz, and Ali Hatamizadeh. Gated delta networks: Improving mamba2 with delta rule. In The Thirteenth International Conference on Learning Representations, 2025b. URL [https://openreview.net/forum?id=r8H7xhYPwz](https://openreview.net/forum?id=r8H7xhYPwz).

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence? arXiv preprint arXiv:1905.07830, 2019.

Yongcheng Zeng, Guoqing Liu, Weiyu Ma, Ning Yang, Haifeng Zhang, and Jun Wang. Token-level direct preference optimization. arXiv preprint arXiv:2404.11999, 2024.

Biao Zhang and Rico Sennrich. Root mean square layer normalization. Advances in Neural Information Processing Systems, 32, 2019.

Hongbo Zhang, Junying Chen, Feng Jiang, Fei Yu, Zhihong Chen, Jianquan Li, Guiming Chen, Xiangbo Wu, Zhiyi Zhang, Qingying Xiao, et al. Huatuogpt, towards taming language model to be a doctor. arXiv preprint arXiv:2305.15075, 2023.

Xiaotian Zhang, Chunyang Li, Yi Zong, Zhengyu Ying, Liang He, and Xipeng Qiu. Evaluating the performance of large language models on gaokao benchmark, 2024. URL [https://arxiv.org/abs/2305.12474](https://arxiv.org/abs/2305.12474).

Xuanyu Zhang and Qing Yang. Xuanyuan 2.0: A large chinese financial chat model with hundreds of billions parameters. In Proceedings of the 32nd ACM international conference on information and knowledge management, pp. 4435–4439, 2023.

Zhengyun Zhao, Qiao Jin, Fangyuan Chen, Tuorui Peng, and Sheng Yu. A large-scale dataset of patient summaries for retrieval-based clinical decision support systems. Scientific data, 10(1):909, 2023.

Haoxi Zhong, Chaojun Xiao, Cunchao Tu, Tianyang Zhang, Zhiyuan Liu, and Maosong Sun. Jec-qa: A legal-domain question answering dataset, 2019. URL [https://arxiv.org/abs/1911.12011](https://arxiv.org/abs/1911.12011).

Terry Yue Zhuo, Minh Chien Vu, Jenny Chim, Han Hu, Wenhao Yu, Ratnadira Widyasari, Imam Nur Bani Yusuf, Haolan Zhan, Junda He, Indraneil Paul, et al. Bigcodebench: Benchmarking code generation with diverse function calls and complex instructions. arXiv preprint arXiv:2406.15877, 2024.

<!-- page 26 of 33 -->

| Da Pan | Qianli Shen |
| --- | --- |
| Fei Kou | Rihui Xin |
| Fei Li | Shunya Dang |
| Fuzhong Chen | Songchi Zhou |
| Guosheng Dong | Weipeng Chen |
| Han Liu | Wenjing Luo |
| Hongda Zhang | Xin Chen |
| Jin He | Xin Men |
| Jinjie Yang | Xionghai Lin |
| Kangxi Wu | Xuezhen Dong |
| Kegeng Wu | Yan Zhang |
| Lei Su | Yifei Duan |
| Linlin Niu | Yuyan Zhou |
| Linzhuang Sun | Zhi Ma |
| Mang Wang | Zhiying Wu |
| Pengcheng Fan |  |

百川智能

## A Contributor

### A.1 Corresponding Author

Bingning Wang, daniel@baichuan-inc.com

通讯作者: Bingning Wang, daniel@baichuan-inc.com

### A.2 Core Contributors

| Bingning Wang | Xiangrong Zeng |
| --- | --- |
| Haizhou Zhao | Yupeng Zhang |
| Huozhi Zhou | Yuqi Huo |
| Liang Song | Zecheng Wang |
| Mingyu Xu | Zhengyun Zhao |
| Wei Cheng |  |

### A.3 Contributors

## B Examples of synthetic data

We present several examples of our synthetic data in this section.

本节给出若干合成数据示例.

### B.1 Example 1

**Question** Which surgical procedure is most appropriate for treating an aneurysm in the lower part of the thoracic aorta using an invasive method? A. Endovascular aneurysm repair (EVAR) B. Thoracic endovascular aortic repair (TEVAR) C. Open surgical repair of descending thoracic aortic aneurysm D. Hybrid aortic arch repair E. Aortic valve replacement with ascending aorta graft

**问题** 用有创方法治疗胸主动脉下段的动脉瘤, 哪种手术最合适? A. 血管腔内动脉瘤修复术 (EVAR) B. 胸主动脉腔内修复术 (TEVAR) C. 降主动脉瘤开放手术修复 D. 杂交主动脉弓修复术 E. 主动脉瓣置换合并升主动脉人工血管置换

**Answer** Let’s analyze each option to determine which surgical procedure is the most appropriate for treating an aneurysm in the lower part of the thoracic aorta using an invasive method.

**回答** 我们逐项分析, 判断用有创方法治疗胸主动脉下段动脉瘤最合适的手术.

A. Endovascular aneurysm repair (EVAR) Endovascular aneurysm repair (EVAR) is a minimally invasive procedure that involves inserting a stent graft through the blood vessels

A. 血管腔内动脉瘤修复术 (EVAR) EVAR 是一种微创手术, 经血管置入覆膜支架

<!-- page 27 of 33 -->

百川智能

to repair the aneurysm. However, EVAR is typically used for abdominal aortic aneurysms rather than thoracic aortic aneurysms. Therefore, this option is not the most appropriate for the given condition.

来修复动脉瘤. 但 EVAR 通常用于腹主动脉瘤而非胸主动脉瘤, 因此该选项对本病情不是最合适的.

B. Thoracic endovascular aortic repair (TEVAR) Thoracic endovascular aortic repair (TEVAR) is a minimally invasive procedure used to treat thoracic aortic aneurysms. It involves the placement of a stent graft inside the thoracic aorta to reinforce the aneurysm site. While TEVAR is used for thoracic aortic aneurysms, it is considered less invasive compared to open surgical methods, so it does not meet the criteria of being an invasive method.

B. 胸主动脉腔内修复术 (TEVAR) TEVAR 是治疗胸主动脉瘤的微创手术, 在胸主动脉内放置覆膜支架以加固瘤体部位. TEVAR 虽用于胸主动脉瘤, 但相比开放手术创伤更小, 因此不符合 「有创方法」 这一条件.

C. Open surgical repair of descending thoracic aortic aneurysm Open surgical repair of a descending thoracic aortic aneurysm involves a direct surgical approach to repair the aneurysm by opening the chest cavity. This is a traditional open surgery method and is considered invasive. This option matches the requirement of treating an aneurysm in the lower part of the thoracic aorta using an invasive method.

C. 降主动脉瘤开放手术修复 这种手术开胸后直接修复动脉瘤, 是传统开放手术, 属于有创方法. 该选项符合 「用有创方法治疗胸主动脉下段动脉瘤」 的要求.

D. Hybrid aortic arch repair Hybrid aortic arch repair combines open surgical techniques with endovascular methods to treat complex aortic arch aneurysms. While this procedure involves both invasive and minimally invasive components, it is primarily used for aortic arch aneurysms and not specifically for descending thoracic aortic aneurysms.

D. 杂交主动脉弓修复术 该术式结合开放手术与腔内技术, 治疗复杂的主动脉弓动脉瘤. 虽然同时包含有创与微创成分, 但主要用于主动脉弓动脉瘤, 并非专门针对降主动脉瘤.

E. Aortic valve replacement with ascending aorta graft Aortic valve replacement with ascending aorta graft involves replacing the aortic valve and repairing the ascending aorta. This procedure is not directly related to the descending thoracic aorta and is therefore not appropriate for the given condition.

E. 主动脉瓣置换合并升主动脉人工血管置换 该手术置换主动脉瓣并修复升主动脉, 与降主动脉没有直接关系, 因此不适用于本病情.

Based on the analysis, the most appropriate surgical procedure for treating an aneurysm in the lower part of the thoracic aorta using an invasive method is: C. Open surgical repair of descending thoracic aortic aneurysm.

综上, 用有创方法治疗胸主动脉下段动脉瘤, 最合适的手术是: C. 降主动脉瘤开放手术修复.

### B.2 Example 2

**Question** A 24-year-old female patient started to experience involuntary tremors in both thumbs half a year ago. The tremors gradually progressed to involve both hands and were more obvious during movement. The symptoms gradually worsened, accompanied by tremors in both lower limbs and unsteady walking. She gradually developed mild speech difficulties, slurred speech, choking during swallowing, as well as personality changes, with obvious mood swings and irritability. Laboratory tests indicated abnormal liver function, abnormal kidney function, low white blood cell count, and a significantly decreased ceruloplasmin. Head MRI showed multiple abnormal signal changes in the bilateral basal ganglia, thalamus, midbrain, and pons, along with demyelination in the white matter of the left frontal lobe. Regarding the pathogenesis of the patient’s neurological symptoms in this case, which of the following most accurately describes its pathological process?

**问题** 24 岁女性患者, 半年前开始出现双侧拇指不自主震颤, 逐渐发展到双手, 活动时更明显. 症状逐步加重, 伴双下肢震颤与行走不稳. 随后逐渐出现轻度言语困难, 吐字不清, 吞咽呛咳, 以及人格改变, 情绪波动明显, 易激惹. 实验室检查提示肝功能异常, 肾功能异常, 白细胞减少, 铜蓝蛋白显著降低. 头颅 MRI 示双侧基底节, 丘脑, 中脑与脑桥多发异常信号, 伴左额叶白质脱髓鞘. 关于该患者神经系统症状的发病机制, 下列哪项最准确地描述了其病理过程?

A. Immune - mediated central nervous system demyelination

A. 免疫介导的中枢神经系统脱髓鞘

B. Abnormal accumulation of copper ions in the basal ganglia and other brain regions, generating a large number of free radicals leading to neuronal damage

B. 铜离子在基底节等脑区异常蓄积, 产生大量自由基导致神经元损伤

C. Gene mutations cause abnormal myelin proteins, resulting in widespread central nervous system demyelination

C. 基因突变导致髓鞘蛋白异常, 引起中枢神经系统广泛脱髓鞘

D. Cerebral microvascular lesions lead to repeated small - area infarctions, causing nerve function impairment

D. 脑微血管病变导致反复小面积梗死, 造成神经功能损害

E. Deposition of iron ions in the brain, triggering oxidative stress and nerve damage

E. 铁离子在脑内沉积, 引发氧化应激与神经损伤

**Answer** To determine the correct pathological process in this patient’s case, we need to analyze each option in detail, considering the patient’s symptoms, laboratory results, and imaging findings:

**回答** 要确定该患者的病理过程, 需要结合症状, 实验室结果与影像表现逐项分析:

A. \*\*Immune-mediated central nervous system demyelination\*\*: - This option refers to conditions such as multiple sclerosis, where the immune system attacks the myelin sheath

A. \*\*免疫介导的中枢神经系统脱髓鞘\*\*: - 该选项指多发性硬化等疾病, 免疫系统攻击中枢神经系统神经元的

<!-- page 28 of 33 -->

百川智能

of neurons in the central nervous system, leading to demyelination. - Symptoms typically include a range of neurological deficits, but the specific combination of liver and kidney dysfunction, decreased ceruloplasmin, and the MRI findings of abnormal signal changes in the basal ganglia and thalamus are not characteristic of multiple sclerosis or similar demyelinating diseases.

髓鞘, 导致脱髓鞘. - 症状通常包括多种神经功能缺损, 但肝肾功能异常, 铜蓝蛋白降低, 以及 MRI 上基底节与丘脑异常信号这一特定组合, 并不是多发性硬化或类似脱髓鞘疾病的特征.

B. \*\*Abnormal accumulation of copper ions in the basal ganglia and other brain regions, generating a large number of free radicals leading to neuronal damage\*\*: - This describes Wilson’s disease, a genetic disorder causing copper accumulation in the liver, brain, and other tissues. This can lead to hepatic and neurological symptoms, including tremors, personality changes, speech difficulties, and liver dysfunction. - The patient’s abnormal liver and kidney function, low ceruloplasmin, and MRI findings involving the basal ganglia support this diagnosis.

B. \*\*铜离子在基底节等脑区异常蓄积, 产生大量自由基导致神经元损伤\*\*: - 这描述的是 Wilson 病 (肝豆状核变性), 一种导致铜在肝, 脑等组织蓄积的遗传病, 可引起肝脏与神经系统症状, 包括震颤, 人格改变, 言语困难与肝功能异常. - 患者的肝肾功能异常, 铜蓝蛋白降低, 以及累及基底节的 MRI 表现都支持这一诊断.

C. \*\*Gene mutations cause abnormal myelin proteins, resulting in widespread central nervous system demyelination\*\*: - This option refers to leukodystrophies, which are genetic disorders affecting the white matter of the brain due to defects in myelin production or maintenance. - While demyelination was noted in the white matter of the left frontal lobe, the broad range of systemic symptoms and specific MRI findings are not typical for leukodystrophies.

C. \*\*基因突变导致髓鞘蛋白异常, 引起中枢神经系统广泛脱髓鞘\*\*: - 该选项指脑白质营养不良, 一类因髓鞘生成或维持缺陷而累及脑白质的遗传病. - 虽然左额叶白质可见脱髓鞘, 但广泛的全身症状与特定的 MRI 表现并不是脑白质营养不良的典型表现.

D. \*\*Cerebral microvascular lesions lead to repeated small-area infarctions, causing nerve function impairment\*\*: - This option is characteristic of conditions like small vessel disease or cerebral autosomal dominant arteriopathy with subcortical infarcts and leukoencephalopathy (CADASIL). - However, the systemic symptoms including liver and kidney dysfunction, low ceruloplasmin, and specific areas of brain involvement (basal ganglia, thalamus) are not typical of these conditions.

D. \*\*脑微血管病变导致反复小面积梗死, 造成神经功能损害\*\*: - 该选项是小血管病或伴皮质下梗死和白质脑病的常染色体显性遗传性脑动脉病 (CADASIL) 等疾病的特征. - 但肝肾功能异常, 铜蓝蛋白降低等全身症状, 以及特定的脑受累部位 (基底节, 丘脑), 都不是这些疾病的典型表现.

E. \*\*Deposition of iron ions in the brain, triggering oxidative stress and nerve damage\*\*: - This describes conditions such as neurodegeneration with brain iron accumulation (NBIA), which can cause movement disorders and cognitive impairment. - While some neurological symptoms might overlap, the systemic findings (especially liver dysfunction and low ceruloplasmin) are not explained by this condition.

E. \*\*铁离子在脑内沉积, 引发氧化应激与神经损伤\*\*: - 这描述的是脑组织铁沉积神经变性病 (NBIA) 等疾病, 可引起运动障碍与认知损害. - 虽然部分神经症状可能重叠, 但全身表现 (尤其是肝功能异常与铜蓝蛋白降低) 无法用该病解释.

\*\*Summary:\*\* The most accurate description of the pathological process in this patient’s case is \*\*B. Abnormal accumulation of copper ions in the basal ganglia and other brain regions, generating a large number of free radicals leading to neuronal damage\*\*. This aligns with Wilson’s disease, given the combination of neurological symptoms, systemic findings, and imaging results.

\*\*总结:\*\* 对该患者病理过程最准确的描述是 \*\*B. 铜离子在基底节等脑区异常蓄积, 产生大量自由基导致神经元损伤\*\*. 结合神经症状, 全身表现与影像结果, 这与 Wilson 病相符.

### B.3 Example 3

**Question** What role does vitamin K play in blood coagulation? What specific health problems can be caused by vitamin K deficiency?

**问题** 维生素 K 在血液凝固中起什么作用? 维生素 K 缺乏会导致哪些具体健康问题?

**Answer** Vitamin K plays a crucial role in blood coagulation. It is essential for the synthesis of multiple clotting factors (such as clotting factors II (prothrombin), VII, IX, and X) and anticoagulant proteins (such as proteins C and S). These clotting factors are produced in the liver and participate in the blood coagulation process, helping to stop bleeding.

**回答** 维生素 K 在血液凝固中起关键作用. 它是多种凝血因子 (如凝血因子 II (凝血酶原), VII, IX 与 X) 以及抗凝蛋白 (如蛋白 C 与蛋白 S) 合成所必需的. 这些凝血因子在肝脏中生成, 参与凝血过程, 帮助止血.

Specifically, vitamin K is involved in the r-carboxylation of these clotting factors, a process that enables these proteins to bind to calcium ions, thereby functioning effectively in the blood coagulation process. Without sufficient vitamin K, the activity of these clotting factors is significantly reduced, leading to impaired blood clotting.

具体来说, 维生素 K 参与这些凝血因子的 r-羧化, 这一过程使这些蛋白能结合钙离子, 从而在凝血过程中有效发挥作用. 维生素 K 不足时, 这些凝血因子的活性会显著降低, 导致凝血功能受损.

Deficiency in vitamin K can lead to the following specific health problems:

维生素 K 缺乏可导致以下具体健康问题:

1. Bleeding tendency: Due to impaired generation and function of clotting factors, patients with vitamin K deficiency are prone to bleeding issues. This may manifest as skin bruising, nosebleeds, gum bleeding, gastrointestinal bleeding, and even more severe internal bleeding.

1. 出血倾向: 由于凝血因子的生成与功能受损, 维生素 K 缺乏的患者容易出血, 可表现为皮肤瘀斑, 鼻出血, 牙龈出血, 消化道出血, 甚至更严重的内出血.

<!-- page 29 of 33 -->

百川智能

2. Hemorrhagic disease of the newborn: Newborns are particularly susceptible to vitamin K deficiency because their intestines have not yet established enough bacterial colonies to synthesize vitamin K, and breast milk contains relatively low amounts of vitamin K. Therefore, newborns who have not received vitamin K injections may experience severe bleeding problems, such as intracranial hemorrhage.

2. 新生儿出血症: 新生儿尤其容易缺乏维生素 K, 因为其肠道尚未建立足够的菌群来合成维生素 K, 而母乳中的维生素 K 含量也相对较低. 因此, 未注射维生素 K 的新生儿可能出现严重出血, 如颅内出血.

3. Bone health issues: Vitamin K not only plays a role in blood coagulation but also in bone health. It is involved in the carboxylation of osteocalcin, a protein that regulates bone mineralization, which is crucial for bone health and strength. Vitamin K deficiency can lead to decreased bone density and an increased risk of fractures.

3. 骨骼健康问题: 维生素 K 不仅作用于凝血, 也作用于骨骼健康. 它参与骨钙素的羧化, 骨钙素是调节骨矿化的蛋白, 对骨骼健康与强度至关重要. 维生素 K 缺乏可导致骨密度下降, 骨折风险增加.

4. Cardiovascular health problems: Vitamin K also plays a role in regulating vascular calcification. A deficiency in vitamin K may lead to increased vascular calcification, thereby raising the risk of cardiovascular diseases.

4. 心血管健康问题: 维生素 K 还参与调节血管钙化. 维生素 K 缺乏可能使血管钙化加重, 从而提高心血管疾病风险.

Measures to prevent vitamin K deficiency include consuming foods rich in vitamin K (such as leafy green vegetables, fermented foods, and certain plant oils) and using vitamin K supplements when necessary. In newborns, vitamin K is typically administered via injection shortly after birth to prevent hemorrhagic disease. For patients at risk of coagulation disorders, especially those taking anticoagulant medications, vitamin K levels should be monitored and managed under a doctor’s guidance.

预防维生素 K 缺乏的措施包括多吃富含维生素 K 的食物 (如绿叶蔬菜, 发酵食品与某些植物油), 必要时补充维生素 K. 新生儿通常在出生后不久注射维生素 K 以预防出血症. 有凝血障碍风险的患者, 尤其是正在服用抗凝药物的患者, 应在医生指导下监测和管理维生素 K 水平.

### B.4 Example 4

**Question** In a study, the researchers hoped to compare the effects of two treatments on the coronary sinus blood flow in animals. It was known that the average blood flow increase of treatment A was 1.8 ml/min, and that of treatment B was 2.4 ml/min, and the standard deviation of both treatments was 1.0 ml/min. If the test level α was set at 0.05 and the type II error probability $\beta$ was 0.10, how many experimental animals would the researchers need to draw the conclusion that there was a statistically significant difference between the two treatments?

**问题** 某研究希望比较两种处理对动物冠状窦血流量的影响. 已知处理 A 的平均血流增加量为 1.8 ml/min, 处理 B 为 2.4 ml/min, 两种处理的标准差均为 1.0 ml/min. 若检验水准 α 设为 0.05, II 类错误概率 $\beta$ 为 0.10, 研究者需要多少只实验动物, 才能得出两种处理之间差异具有统计学意义的结论?

**Answer** To calculate the sample size needed to detect a statistically significant difference between the two treatments, we can use the formula for comparing two means in a twosample t-test.

**回答** 要计算检出两种处理间统计学显著差异所需的样本量, 可用两样本 t 检验中比较两均值的公式.

The formula for calculating the sample size n in a two-sample t-test is:

两样本 t 检验中样本量 n 的计算公式为:

$$
n = \frac {(z _ {1 - \alpha / 2} + z _ {1 - \beta}) ^ {2} \times 2 \sigma^ {2}}{(\mu_ {1} - \mu_ {2}) ^ {2}}
$$

where:

其中:

$-   z _ { 1 - \alpha / 2 }$ is the critical value corresponding to the significance level α. For a two-tailed test with $\dot { \alpha } = 0 . 0 5 , z _ { 1 - \alpha / 2 } = z _ { 0 . 9 7 5 } \approx 1 . \dot { 9 } 6$

$-   z _ { 1 - \alpha / 2 }$ 是显著性水平 α 对应的临界值. 双侧检验取 $\dot { \alpha } = 0 . 0 5 , z _ { 1 - \alpha / 2 } = z _ { 0 . 9 7 5 } \approx 1 . \dot { 9 } 6$

$-   z _ { 1 - \beta }$ is the critical value corresponding to the power of the test $( 1 - \beta )$ . Given $\beta = 0 . 1 0 ,$ then $z _ { 1 - \beta } = z _ { 0 . 9 0 } \approx 1 . 2 8$

$-   z _ { 1 - \beta }$ 是检验效能 $( 1 - \beta )$ 对应的临界值. 已知 $\beta = 0 . 1 0 ,$ 则 $z _ { 1 - \beta } = z _ { 0 . 9 0 } \approx 1 . 2 8$

$\cdot \sigma$ is the standard deviation of the two groups, assumed to be equal. Here $\sigma = 1 . 0   \mathrm { m l / m i n }$ $-   \mu _ { 1 }$ and $\mu _ { 2 }$ are the means of the two groups. Here $\mu _ { 1 } = 1 . 8$ ml/min and $\mu_{2}=2.4   ml/min$ so $\mu_{1}-\mu_{2}=-0.6  ml/min$

$\cdot \sigma$ 是两组的标准差, 假定相等, 此处 $\sigma = 1 . 0   \mathrm { m l / m i n }$ $-   \mu _ { 1 }$ 与 $\mu _ { 2 }$ 是两组均值, 此处 $\mu _ { 1 } = 1 . 8$ ml/min, $\mu_{2}=2.4   ml/min$, 故 $\mu_{1}-\mu_{2}=-0.6  ml/min$

We take the absolute value of $\mu_{1}-\mu_{2},  so  \left | \mu_{1}-\mu_{2} \right | = 0.6   ml/min$

取 $\mu_{1}-\mu_{2},  so  \left | \mu_{1}-\mu_{2} \right | = 0.6   ml/min$ 的绝对值.

Substitute the values into the formula:

代入公式:

$$
n = \frac {(1 . 9 6 + 1 . 2 8) ^ {2} \times 2 \times 1 ^ {2}}{(0 . 6) ^ {2}}
$$

<!-- page 30 of 33 -->

百川智能

$$
n = \frac {(3 . 2 4) ^ {2} \times 2 \times 1}{0 . 3 6}
$$

$$
n = \frac {1 0 . 4 9 7 6 \times 2}{0 . 3 6} = \frac {2 0 . 9 9 5 2}{0 . 3 6} \approx 5 8. 3 2
$$

Since we cannot have a fraction of an animal, we round up to $n = 5 9$

动物数不能是小数, 因此向上取整为 $n = 5 9$

So the researchers would need 59 experimental animals in each group to draw the conclusion that there was a statistically significant difference between the two treatments at the given significance level and power of the test. In total, $2 \times 5 9 = 1 1 8$ animals are needed for the whole study.

所以在给定显著性水平与检验效能下, 研究者每组需要 59 只实验动物, 才能得出两种处理差异具有统计学意义的结论. 整个研究共需 $2 \times 5 9 = 1 1 8$ 只动物.

## C Tokenizer Details

For the base general tokenizer, we utilize the sentencepiece tokenizer Kudo (2018). For the additional multi-lingual and medical tokenizer, we adopt the huggingface tokenizer<sup>5</sup>to train a BPE tokenizer Sennrich (2015). And then merge the tokenizer together. The specific rules we used are:

基础通用分词器采用 sentencepiece (Kudo, 2018). 额外的多语种与医学分词器用 huggingface tokenizer<sup>5</sup> 训练 BPE 分词器 (Sennrich, 2015), 然后把二者合并. 具体规则如下:

• We do not normalized the input tokens since, i.e., the normalization\_rule\_name is set to identity.

• 不对输入做归一化, 即 normalization\_rule\_name 设为 identity.

• We kept the pieces that only contains whitespace, allowing for more efficient code encoding.

• 保留只含空白字符的片段, 以更高效地编码代码.

• We split numbers into individual digits to better encode numeric data.

• 把数字拆成单个数位, 以更好地编码数值数据.

• The character coverage is set to 0.9999 with rare character falling back to UTF-8 bytes.

• 字符覆盖率设为 0.9999, 罕见字符回退为 UTF-8 字节.

The tokenization efficiency of our model in different language is shown in Figure 12.

模型在不同语言上的切分效率见 Figure 12.

![Chart block](images/p30-figure-12-the-tokenization-efficiency-for-different.png)

Figure 12: The tokenization efficiency for different models on different languages, the less the better.

图 12: 不同模型在不同语言上的切分效率, 越低越好.

## D Evaluation Prompts and Examples

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>[https://huggingface.co/docs/transformers/en/main\_classes/tokenizer](https://huggingface.co/docs/transformers/en/main_classes/tokenizer)</span></small>

<small>5 huggingface tokenizer 文档: [https://huggingface.co/docs/transformers/en/main\_classes/tokenizer](https://huggingface.co/docs/transformers/en/main_classes/tokenizer)</small>

<!-- page 31 of 33 -->

百川智能

| Benchmark | Prompt |
| --- | --- |
| MedCalc | You are a medical professional and you have been asked to answer a question based on the patient note provided. The patient note is a record of a patient's visit to the doctor. Note that you should not provide a diagnosis, but rather only answer the question based on the information provided in the note. Your response should be a numerical value, which is the answer to the question. Let's think step by step, and at the end of your response, repeat your answer in a new line as the format requested in the question, with prefix "The final answer is: ". |
| Multiple-Choice | Please provide an analysis and the correct answer of the given multiple-choice question. Please note that only one answer is correct. |
| ClinicalBench-Department | 您是一位经验丰富的医院导诊员，根据患者提供的性别、年龄和症状等信息，请从医院科室列表中选择一个患者最需要前往治疗的科室。请确保您的回答只包含选中的一个科室，不要包含多余的内容。以下是医院科室列表:... |
| ClinicalBench-Diagnosis | 您是一位经验丰富的科室临床医生，根据给定的病例摘要，请分析并给出该病人的主要诊断，即一种对患者身体健康危害最大、最需要治疗的疾病的名称。以下是给定的病例摘要: |
| ClinicalBench-Treatment | 您是一位经验丰富的科室临床医生，根据给定的病例摘要，请分析并提供一个专业、详细、全面的治疗计划，请分条列出治疗计划。以下是给定的病例摘要: |
| MedNLI | Sentence1: {} Sentence2: {} Whether sentence 2 can be inferred from sentence 1? Pick a choice from 3 options: entailment, contradiction, or neutral. Only output the option. |
| NEJMQA | Given the patient note, enumerate the top 5 most likely diagnoses. |
| RareArena | Given the patient note, enumerate the top 5 most likely diagnoses. Only consider rare diseases. |
| RareBench | Given the patient symptoms, enumerate the top 5 most likely diagnoses. Only consider rare diseases. |

Table 5: Prompts used during the response generation.

表 5: 生成回答时使用的提示. (表中英文提示依次为: MedCalc 要求以医学专业人员身份, 仅依据病历回答数值, 逐步思考并在末行以 「The final answer is: 」 为前缀重复答案; 选择题要求给出分析与唯一正确答案; MedNLI 要求在 entailment, contradiction, neutral 中三选一且只输出选项; NEJMQA 要求依据病历列出最可能的 5 个诊断; RareArena 与 RareBench 分别依据病历与症状列出最可能的 5 个罕见病诊断.)

<!-- page 32 of 33 -->

百川智能

| Benchmark | Prompt |
| --- | --- |
| Multiple-Choice | 以下是某个选择题的回答，请抽取其选中的选项标签，以json格式返回结果，除此以外不要返回其它任何信息。如:{{"select": "A"}}回答:{} |
| CMBClin | 请参考正确答案的内容，给候选答案进行评分。1、分数为整数，取值范围为0、1、2、3或者4分。2、评分最低分为0分，表示候选答案与正确答案毫不相关；3、评分最高分为4分，表示候选答案涵盖了所有要点；4、如果候选答案相比正确答案缺少了部分要点，则要酌情扣分；5、以json格式返回分数以及理由，除此以外不要返回其它任何信息。如:{{"score": 4, "reason": "xxx"}}正确答案:{}候选答案:{} |
| NEJMQA RareArena RareBench | 1、在一个诊断任务中，正确的诊断是{}，以下是学生给出的五个鉴别诊断，请判断正确诊断是否被包含其中（包括学生回答中包含了正确诊断上级概念的情况，即学生未明确判断亚型也算正确）。2、如果包含了正确诊断，则分数为:1，否则分数为:0。3、以json格式返回结果及理由，除此以外不要返回其它任何信息。如:{{"score": 1, "reason": "xxx"}}学生回答:{} |
| MedCalc | 请判断给定的回答与正确答案是否一致。如果一致，得分为:1，否则为:0。具体来说，正确答案可能有以下几种情况:1.单一数字（整数或浮点数），直接判断回答是否完全正确。2.日期，格式可能是mm/dd/yyyy，或者(4 weeks, 3 days)，直接判断回答是否完整正确（忽略格式差异）。3.两个数字，代表正确的范围（下界，上界），请判断回答是否处于这个范围内。以json格式返回结果及理由，除此以外不要返回其它任何信息。如:{{"score": 1, "reason": "xxx"}}正确答案:{}回答:{} |

Table 6: Scoring prompts of different benchmarks.

表 6: 各评测集的打分提示.

<!-- page 33 of 33 -->

百川智能

| Question | Response |
| --- | --- |
| 患者:被沾有病人血液的实心针头扎了，针头是一天前沾的病人血液，还有传染疾病的可能吗（女,年龄26岁）医生:请问您是否知道那位病人的具体健康状况或是否患有任何传染性疾病？例如，乙肝、丙肝或艾滋病等？患者:不知道。医生:请问您是否接种过乙型肝炎疫苗？患者:接种过。医生:请问您被扎到的具体部位是哪里？伤口的深度如何？是否有出血？患者:大拇指根部，深度大约0.5厘米，出血了。根据以上信息，若该病人同时患有乙肝、丙肝或艾滋病，患者最可能感染哪种疾病，并说明理由。 | 丙肝。针头是一天前沾的病人血液，HIV在干燥环境中迅速失去活性，因此一天后针头上的HIV传染性极低。患者接种过乙肝疫苗，对患者有一定的保护。丙肝病毒在体外也有一定的存活时间，因此感染可能性较大。 |
| 一名7岁女孩被送到急诊科，她有10天的发热和咽喉痛病史，过去2天症状急剧恶化。她的咽喉痛在右侧更严重。由于疼痛，她吞咽和张口困难。她还注意到在过去一天中，她的声音质量发生了变化。她的体温为38.2°C（100.8°F），脉搏为86次/分钟，呼吸为18次/分钟，血压为110/75 mm Hg。检查显示颈部淋巴结肿大。口咽检查显示扁桃体发红，右侧扁桃体柱肿胀。悬雍垂偏向左侧。实验室检查结果显示:血红蛋白13.0 g/dL，红细胞压积39%，白细胞计数12,000/mm3，血小板计数200,000/mm3，血清钠138 mEq/L，氯100 mEq/L，钾4.5 mEq/L，碳酸氢盐24 mEq/L，尿素氮14.0 mg/dL，肌酐1.1 mg/dL。基于这些信息，请分析最合适的下一步手术处理措施。只给一个答案。 | 手术处理措施切开引流 |
| 一位78岁女性患者，既往诊断为二尖瓣脱垂，来急诊就诊，主诉24小时内出现4次鲜红色便血。体格检查显示脉率120次/分，血压88/58mmHg。应该采取的最佳初步处理措施是什么？只给一个答案。 | 立即进行静脉补液（也即液体复苏） |
| #一般资料#:性别:男年龄: 43岁职业:无#主诉#:全身黄染、腹胀、尿少、乏力、纳差伴双下肢浮肿半月。#纳现差病，史曾#:在患外者院半接月受前治出疗现，全治身疗黄内染容，包伴括随抗腹病胀毒、、尿抗少感、染、补充白蛋白等，但症状未缓解，反而腹胀加重，出现双下肢浮肿，因此再次入院。患者自述病后精神、食欲减退，睡眠一般，小便颜色深黄，量少，大便干结，无黑便。#既往史#:患者既往乙型肝炎病史，无冠心病、高血压、糖尿病等病史，否认痢疾、伤寒、疟疾、结核病史及密切接触史。无外伤手术史，无输血史。无药物及食物过敏史，预防接种史不详。#查体#:中年男性, ......,神经系统检查未见异常。#辅助检查#:-彩色B超: -肝实质回声增粗，考虑肝硬化可能-胆囊壁增厚-副脾-双肾结石-腹水- DR胸片: -心肺膈未3见6.异6秒常↑--血肌液钙检蛋查白: I-:凝0.0血2n酶g原/m时l↑间-:丙氨酸氨基转移酶: 71.36U/L↑-天门冬氨酸氨基转移酶: 91.65U/L↑ -白蛋白: 40.78g/L-总胆红素: 689.03μmol/L↑ -直接胆红素: 391.85μmol/L↑-中性粒细胞比率: 62.5%根据以上资料，该患者最有可能的诊断及诊断依据是什么？ | #初步诊断#:1. .乙型肝炎肝硬化失代偿期#诊断依据#:1.患者有全身黄染、腹胀、尿少下、肢乏浮力肿、半纳月差的伴症双状。2.既往乙型肝炎病史。3.查体发现全身皮肤黏膜重度黄染，巩膜黄染，腹部膨隆，全腹轻压痛，腹水征阳性，双下肢中度浮肿。4肝.硬辅化助，检胆查囊结壁果增提厚示，双肾结石。 |

Table 7: Examples of Baichuan-M1-14B-Instruction.

表 7: Baichuan-M1-14B-Instruction 的示例.

33
