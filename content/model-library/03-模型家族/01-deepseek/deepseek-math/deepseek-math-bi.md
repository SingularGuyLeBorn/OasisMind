---
title: "DeepSeekMath · 对照译稿"
category: "模型库"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeekMath 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 30 -->

arXiv: 2402.03300v3 [cs. CL] 27 Apr 2024

Qdeepseek

# DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models / DeepSeekMath: 把开源语言模型的数学推理推到极限

Zhihong Shao<sup>1, 2∗†</sup>, Peiyi Wang<sup>1, 3∗†</sup>, Qihao Zhu<sup>1, 3∗†</sup>, Runxin Xu<sup>1</sup>, Junxiao Song<sup>1</sup> Xiao Bi<sup>1</sup>, Haowei Zhang<sup>1</sup>, Mingchuan Zhang<sup>1</sup>, Y. K. Li<sup>1</sup>, Y. Wu1, Daya Guo1

<sup>1</sup>DeepSeek-AI, <sup>2</sup>Tsinghua University, <sup>3</sup>Peking University

**{zhihongshao, wangpeiyi, zhuqh, guoday}@deepseek. com** [**https://github. com/deepseek-ai/DeepSeek-Math**](https://github. com/deepseek-ai/DeepSeek-Math)



DeepSeek-AI, 清华大学, 北京大学; 标星作者为核心贡献者, †表示实习期间在 DeepSeek-AI 完成. 联系: {zhihongshao, wangpeiyi, zhuqh, guoday}@deepseek. com; 仓库: https://github. com/deepseek-ai/DeepSeek-Math

## Abstract

Mathematical reasoning poses a significant challenge for language models due to its complex and structured nature. In this paper, we introduce DeepSeekMath 7B, which continues pre-training DeepSeek-Coder-Base-v1.5 7B with 120B math-related tokens sourced from Common Crawl, together with natural language and code data. DeepSeekMath 7B has achieved an impressive score of 51.7% on the competition-level MATH benchmark without relying on external toolkits and voting techniques, approaching the performance level of Gemini-Ultra and GPT-4. Self-consistency over 64 samples from DeepSeekMath 7B achieves 60.9% on MATH. The mathematical reasoning capability of DeepSeekMath is attributed to two key factors: First, we harness the significant potential of publicly available web data through a meticulously engineered data selection pipeline. Second, we introduce Group Relative Policy Optimization (GRPO), a variant of Proximal Policy Optimization (PPO), that enhances mathematical reasoning abilities while concurrently optimizing the memory usage of PPO.



数学推理结构复杂, 对语言模型一直很难. 本文提出 DeepSeekMath 7B: 在 DeepSeek-Coder-Base-v1.5 7B 上继续预训练, 混入来自 Common Crawl 的 120B 数学相关 token, 并夹带自然语言与代码. 不靠外部工具箱, 也不靠投票, DeepSeekMath 7B 在竞赛级 MATH 上拿到 51.7%, 逼近 Gemini-Ultra 与 GPT-4; 64 条样本做 self-consistency 可到 60.9%. 能力主要靠两件事: 一是用精心设计的数据筛选管线挖公开网页里的数学信号; 二是提出 **Group Relative Policy Optimization(GRPO)**, PPO 的变体, 抬数学推理的同时压低 PPO 的显存开销.

解释: GRPO(组相对策略优化)= 同一道题采样一组回答, 用组内相对分数当基线, 省掉 PPO 里那套价值网络(critic). PPO 要同时训策略模型和价值模型; GRPO 用「同题多答的均值/方差」估优势, 训练更省.

![Chart block](images/p01-figure-1-top1-accuracy-of-open-source-models-on-the.png)

Figure 1 | Top1 accuracy of open-source models on the competition-level MATH benchmark (Hendrycks et al., 2021) without the use of external toolkits and voting techniques.



图 1｜开源模型在竞赛级 MATH 上的 Top1 准确率(不用外部工具, 不用投票).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280">∗ Core contributors. </span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280">† Work done during internship at DeepSeek-AI. </span></small>

<!-- page 2 of 30 -->

## 1. Introduction

Large language models (LLM) have revolutionized the approach to mathematical reasoning in artificial intelligence, spurring significant advancements in both the quantitative reasoning benchmark (Hendrycks et al., 2021) and the geometry reasoning benchmark (Trinh et al., 2024). Moreover, these models have proven instrumental in assisting humans in solving complex mathematical problems (Tao, 2023). However, cutting-edge models such as GPT-4 (OpenAI, 2023) and Gemini-Ultra (Anil et al., 2023) are not publicly available, and the currently accessible open-source models considerably trail behind in performance.



大模型改写了 AI 做数学推理的路径, 定量推理基准(Hendrycks et al., 2021)与几何推理基准(Trinh et al., 2024)都跟着往上走; 人也开始拿它们解难题(Tao, 2023). 但 GPT-4, Gemini-Ultra 这类顶尖模型不开源, 现有开源模型成绩明显落后.

In this study, we introduce DeepSeekMath, a domain-specific language model that significantly outperforms the mathematical capabilities of open-source models and approaches the performance level of GPT-4 on academic benchmarks. To achieve this, we create the DeepSeekMath Corpus, a large-scale high-quality pre-training corpus comprising 120B math tokens. This dataset is extracted from the Common Crawl (CC) using a fastText-based classifier (Joulin et al., 2016). In the initial iteration, the classifier is trained using instances from OpenWebMath (Paster et al., 2023) as positive examples, while incorporating a diverse selection of other web pages to serve as negative examples. Subsequently, we employ the classifier to mine additional positive instances from the CC, which are further refined through human annotation. The classifier is then updated with this enhanced dataset to improve its performance. The evaluation results indicate that the large-scale corpus is of high quality, as our base model DeepSeekMath-Base 7B achieves 64.2% on GSM8K (Cobbe et al., 2021) and 36.2% on the competition-level MATH dataset (Hendrycks et al., 2021), outperforming Minerva 540B (Lewkowycz et al., 2022a). In addition, the DeepSeekMath Corpus is multilingual, so we notice an improvement in Chinese mathematical benchmarks (Wei et al., 2023; Zhong et al., 2023). We believe that our experience in mathematical data processing is a starting point for the research community, and there is significant room for improvement in the future.



本文提出面向数学的 DeepSeekMath: 开源侧数学能力大幅领先, 学术基准上逼近 GPT-4. 为此先建 **DeepSeekMath Corpus**-- 约 120B 数学 token 的高质量预训练语料, 用基于 fastText 的分类器从 Common Crawl 里捞. 首轮: OpenWebMath 当正例, 多样网页当负例训分类器; 再去 CC 挖正例, 人工精修后更新分类器, 迭代放大. 质量上, DeepSeekMath-Base 7B 在 GSM8K 拿 64.2%, 竞赛级 MATH 拿 36.2%, 超过 Minerva 540B. 语料多语, 中文数学基准也涨. 作者认为这套数学数据处理经验只是起点, 后面还有很大改进空间.

解释: 数学语料构造 = 不是「下载 arXiv 就完事」, 而是用分类器在整个网页海里反复召回, 筛排名, 人工补种子域, 四轮迭代到约 3550 万页, 120B token; 同时做基准去污染(10-gram 精确匹配).

DeepSeekMath-Base is initialized with DeepSeek-Coder-Base-v1.5 7B (Guo et al., 2024), as we notice that starting from a code training model is a better choice compared to a general LLM. Furthermore, we observe the math training also improves model capability on MMLU (Hendrycks et al., 2020) and BBH benchmarks (Suzgun et al., 2022), indicating it does not only enhance the model’s mathematical abilities but also amplifies general reasoning capabilities.



Base 从 DeepSeek-Coder-Base-v1.5 7B 初始化-- 相对通用 LLM, 从代码模型出发更划算. 数学续训还会抬 MMLU, BBH, 说明不只涨数学, 也放大一般推理.

After pre-training, we apply mathematical instruction tuning to DeepSeekMath-Base with chain-of-thought (Wei et al., 2022), program-of-thought (Chen et al., 2022; Gao et al., 2023), and tool-integrated reasoning (Gou et al., 2023) data. The resulting model DeepSeekMath-Instruct 7B beats all 7B counterparts and is comparable with 70B open-source instruction-tuned models.



预训练后再做数学指令微调, 数据含 CoT, PoT, 工具集成推理. 得到的 DeepSeekMath-Instruct 7B 压过所有同档 7B, 并与 70B 开源指令模型打平.

Furthermore, we introduce the Group Relative Policy Optimization (GRPO), a variant reinforcement learning (RL) algorithm of Proximal Policy Optimization (PPO) (Schulman et al., 2017). GRPO foregoes the critic model, instead estimating the baseline from group scores, significantly reducing training resources. By solely using a subset of English instruction tuning data, GRPO obtains a substantial improvement over the strong DeepSeekMath-Instruct, including both in-domain (GSM8K: 82.9% → 88.2%, MATH: 46.8% → 51.7%) and out-of-domain mathematical tasks (e. g., CMATH: 84.6% → 88.8%) during the reinforcement learning phase. We also provide a unified paradigm to understand different methods, such as Rejection Sampling Fine-Tuning (RFT) (Yuan et al., 2023a), Direct Preference Optimization (DPO) (Rafailov et al., 2023), PPO and GRPO. Based on such a unified paradigm, we find that all these methods are conceptualized as either direct or simplified RL techniques. We also conduct extensive experiments, e. g., online v. s. offline training, outcome v. s. process supervision, single-turn v. s. iterative RL and so on,



进一步提出 GRPO: PPO 的 RL 变体, 丢掉 critic, 用组内分数估基线, 训练资源明显下降. 只用一部分英文指令数据, 就能在强 Instruct 之上再涨一截: 域内 GSM8K 82.9%→88.2%, MATH 46.8%→51.7%; 域外如 CMATH 84.6%→88.8%. 文中还给出统一范式, 把 RFT, DPO, PPO, GRPO 都看成直接或简化的 RL; 并系统做了在线/离线, 结果监督/过程监督, 单轮/迭代 RL 等实验,

<!-- page 3 of 30 -->

to deeply investigate the essential elements of this paradigm. At last, we explain why our RL boosts the performance of instruction-tuned models, and further summarize potential directions to achieve more effective RL based on this unified paradigm.



以深挖该范式的关键要素; 最后解释 RL 为何能抬指令模型, 并据此归纳更有效 RL 的可能方向.

### 1.1. Contributions 贡献

Our contribution includes scalable math pre-training, along with the exploration and analysis of reinforcement learning.



贡献落在两块: 可扩展的数学预训练, 以及对强化学习的探索与分析.

#### Math Pre-Training at Scale 大规模数学预训练

• Our research provides compelling evidence that the publicly accessible Common Crawl data contains valuable information for mathematical purposes. By implementing a meticulously designed data selection pipeline, we successfully construct the DeepSeekMath Corpus, a high-quality dataset of 120B tokens from web pages filtered for mathematical content, which is almost 7 times the size of the math web pages used by Minerva (Lewkowycz et al., 2022a) and 9 times the size of the recently released OpenWebMath (Paster et al., 2023).

Our pre-trained base model DeepSeekMath-Base 7B achieves comparable performance with Minerva 540B (Lewkowycz et al., 2022a), indicating the number of parameters is not the only key factor in mathematical reasoning capability. A smaller model pre-trained on high-quality data could achieve strong performance as well.



• 公开 Common Crawl 里确有可用的数学信号. 靠精心设计的筛选管线, 建成 120B token 的 DeepSeekMath Corpus, 大约是 Minerva 所用数学网页的 7 倍, OpenWebMath 的 9 倍.  
DeepSeekMath-Base 7B 与 Minerva 540B 可比, 说明参数量不是数学推理的唯一关键; 小模型配高质量数据也能很强.

• We share our findings from math training experiments. Code training prior to math training improves models’ ability to solve mathematical problems both with and without tool use. This offers a partial answer to the long-standing question: does code training improve reasoning abilities? We believe it does, at least for mathematical reasoning.



• 分享数学训练实验结论: 先代码再数学, 无论是否用工具, 解题都更好. 对「代码训练是否提升推理」给出部分肯定-- 至少在数学推理上成立.

• Although training on arXiv papers is common, especially in many math-related papers, it brings no notable improvements on all mathematical benchmarks adopted in this paper.



• 尽管训 arXiv 论文很常见, 尤其在数学相关工作里, 但对本文采用的全部数学基准未见明显增益.

#### Exploration and Analysis of Reinforcement Learning 强化学习的探索与分析

• We introduce Group Relative Policy Optimization (GRPO), an efficient and effective reinforcement learning algorithm. GRPO foregoes the critic model, instead estimating the baseline from group scores, significantly reducing training resources compared to Proximal Policy Optimization (PPO).



• 提出高效且有效的 GRPO: 去掉 critic, 用组分数估基线, 相对 PPO 显著省资源.

• We demonstrate that GRPO significantly enhances the performance of our instructiontuned model DeepSeekMath-Instruct, by solely using the instruction-tuning data. Furthermore, we observe enhancements in the out-of-domain performance during the reinforcement learning process.



• 仅用指令微调数据, GRPO 就能显著抬 DeepSeekMath-Instruct; RL 过程中域外表现也上升.

• We provide a unified paradigm to understand different methods, such as RFT, DPO, PPO, and GRPO. We also conduct extensive experiments, e. g., online v. s. offline training, outcome v. s. process supervision, single-turn v. s. iterative reinforcement learning, and so on to deeply investigate the essential elements of this paradigm.



• 给出统一范式理解 RFT, DPO, PPO, GRPO; 并用在线/离线, 结果/过程监督, 单轮/迭代 RL 等实验深挖范式要素.

解释: 过程监督(process supervision)= 不只给整条答案对错分, 而是在推理的每一步末尾打分; 结果监督(outcome)= 只在整段输出结尾给一个分.

• Based on our unified paradigm, we explore the reasons behind the effectiveness of reinforcement learning, and summarize several potential directions to achieve more effective reinforcement learning of LLMs.



• 基于统一范式, 探讨 RL 为何有效, 并归纳更有效 LLM 强化学习的若干方向.

### 1.2. Summary of Evaluations and Metrics 评测与指标摘要

• **English and Chinese Mathematical Reasoning**: We conduct comprehensive assessments of our models on English and Chinese benchmarks, covering mathematical problems



• **中英数学推理**: 在中英基准上全面评估, 覆盖

<!-- page 4 of 30 -->

from grade-school level to college level. English benchmarks include GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021), SAT (Azerbayev et al., 2023), OCW Courses (Lewkowycz et al., 2022a), MMLU-STEM (Hendrycks et al., 2020). Chinese benchmarks include MGSM-zh (Shi et al., 2023), CMATH (Wei et al., 2023), Gaokao-MathCloze (Zhong et al., 2023), and Gaokao-MathQA (Zhong et al., 2023). We evaluate models’ ability to generate self-contained text solutions without tool use, and also the ability to solve problems using Python.

On English benchmarks, DeepSeekMath-Base is competitive with the closed-source Minerva 540B (Lewkowycz et al., 2022a), and surpasses all open-source base models (e. g., Mistral 7B (Jiang et al., 2023) and Llemma-34B (Azerbayev et al., 2023)), regardless of whether they’ve undergone math pre-training or not, often by a significant margin. Notably, DeepSeekMath-Base is superior on Chinese benchmarks, likely because we don’t follow previous works (Azerbayev et al., 2023; Lewkowycz et al., 2022a) to collect English-only math pre-training data, and also include high-quality non-English ones. With mathematical instruction tuning and reinforcement learning, the resulting DeepSeekMath-Instruct and DeepSeekMath-RL demonstrate strong performance, obtaining an accuracy of over 50% on the competition-level MATH dataset for the first time within the open-source community.



从小学到大学难度. 英文: GSM8K, MATH, SAT, OCW, MMLU-STEM; 中文: MGSM-zh, CMATH, 高考填空与选择题. 既测纯文本自洽解题, 也测用 Python 解题.  
英文上 Base 与闭源 Minerva 540B 可比, 并压过所有开源 base(含 Mistral 7B, Llemma-34B), 常有明显优势. 中文更强-- 因为未像前人只收英文数学预训练, 也纳入高质量非英文. 经指令微调与 RL, Instruct 与 RL 版首次在开源社区把竞赛级 MATH 推到 50% 以上.

• **Formal Mathematics**: We evaluate DeepSeekMath-Base using the informal-to-formal theorem proving task from (Jiang et al., 2022) on miniF2F (Zheng et al., 2021) with Isabelle (Wenzel et al., 2008) chosen to be the proof assistant. DeepSeekMath-Base demonstrates strong few-shot autoformalization performance.



• **形式数学**: 在 miniF2F 上做 informal-to-formal 定理证明(Jiang et al., 2022), 证明助手选 Isabelle. Base 在 few-shot 自动形式化上表现强.

• **Natural Language Understanding, Reasoning, and Code**: To build a comprehensive profile of models’ general understanding, reasoning, and coding capabilities, we evaluate DeepSeekMath-Base on the Massive Multitask Language Understanding (MMLU) benchmark (Hendrycks et al., 2020) which encompasses 57 multiple-choice tasks covering diverse subjects, BIG-Bench Hard (BBH) (Suzgun et al., 2022) which consists of 23 challenging tasks that mostly require multi-step reasoning to solve, as well as HumanEval (Chen et al., 2021) and MBPP (Austin et al., 2021) which are widely used to evaluate code language models. Math pre-training benefits both language understanding and reasoning performance.



• **自然语言理解, 推理与代码**: 用 MMLU(57 项多选), BBH(23 项多步推理难题), HumanEval 与 MBPP 刻画通用能力. 数学预训练同时有利于语言理解与推理.

## 2. Math Pre-Training 数学预训练

### 2.1. Data Collection and Decontamination 数据收集与去污染

In this section, we will outline the process of constructing the DeepSeekMath Corpus from Common Crawl. As depicted in Figure 2, we present an iterative pipeline that demonstrates how to systematically gather a large-scale mathematical corpus from Common Crawl, starting with a seed corpus (e. g., a small but high-quality collection of math-related dataset). It’s worth noting that this approach is also applicable to other domains, such as coding.



本节说明如何从 Common Crawl 建 DeepSeekMath Corpus. 图 2 给出迭代管线: 从种子语料(小而高质量的数学集)出发, 系统召回大规模数学网页. 同法也可用于代码等领域.

First, we choose OpenWebMath (Paster et al., 2023), a collection of high-quality mathematical web texts, as our initial seed corpus. Using this corpus, we train a fastText model (Joulin et al., 2016) to recall more OpenWebMath-like mathematical web pages. Specifically, we randomly select 500, 000 data points from the seed corpus as positive training examples and another 500, 000 web pages from Common Crawl as negative ones. We employ an open-source library<sup>1</sup> for training, configuring the vector dimension to 256, learning rate to 0.1, the maximum length



种子先用 OpenWebMath. 据此训 fastText, 召回更多类似数学页: 种子中随机 50 万正例, CC 中 50 万负例. 开源库<sup>1</sup> 训练, 向量维 256, 学习率 0.1, 最大

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>1</sup>[https://fasttext. cc](https://fasttext. cc)</span></small>

<!-- page 5 of 30 -->

![Image block](images/p05-figure-2-an-iterative-pipeline-that-collects.png)

Figure 2 | An iterative pipeline that collects mathematical web pages from Common Crawl.



图 2｜从 Common Crawl 迭代收集数学网页的管线.

of word n-gram to 3, the minimum number of word occurrences to 3, and the number of training epochs to 3. To reduce the size of the original Common Crawl, we employ URL-based deduplication and near-deduplication techniques, resulting in 40B HTML web pages. We then recall mathematical web pages from deduplicated Common Crawl with the fastText model. To filter out low-quality mathematical content, we rank the collected pages according to their scores predicted by the fastText model, and only preserve the top-ranking ones. The volume of data preserved is assessed through pre-training experiments on the top 40B, 80B, 120B, and 160B tokens. In the first iteration, we choose to keep the top 40B tokens.



词 n-gram 长度到 3, 最小词频 3, 训练 3 epoch. CC 先做 URL 去重与近去重, 得到约 400 亿 HTML 页; 再用 fastText 召回数学页, 按分数排序只留头部. 保留量用预训练实验在 top 40B / 80B / 120B / 160B token 上摸; 首轮取 top 40B token.

After the first iteration of data collection, numerous mathematical web pages remain uncollected, mainly because the fastText model is trained on a set of positive examples that lacks sufficient diversity. We therefore identify additional mathematical web sources to enrich the seed corpus, so that we can optimize the fastText model. Specifically, we first organize the entire Common Crawl into disjoint domains; a domain is defined as web pages sharing the same base URL. For each domain, we calculate the percentage of web pages that are collected in the first iteration. Domains where over 10% of the web pages have been collected are classified as math-related (e. g., mathoverflow. net). Subsequently, we manually annotate the URLs associated with mathematical content within these identified domains (e. g., mathoverflow. net/questions). Web pages linked to these URLs, yet uncollected, will be added to the seed corpus. This approach enables us to gather more positive examples, thereby training an improved fastText model capable of recalling more mathematical data in the subsequent iteration. After four iterations of data collection, we end up with 35.5M mathematical web pages, totaling 120B tokens. In the fourth iteration, we notice that nearly 98% of the data has already been collected in the third iteration, so we decide to cease data collection.



首轮后仍有大量数学页没捞到-- 正例多样性不够. 于是补种子: 把整站 CC 按 base URL 切成互不相交的域; 某域若首轮已收集页占比 >10%, 标为数学相关(如 mathoverflow. net); 再人工标注这些域里数学内容的 URL(如 /questions), 把尚未收集的对应页并入种子. 正例变多后重训 fastText, 下一轮召回更全. 四轮后共 3550 万数学页, 120B token; 第四轮里约 98% 已在第三轮出现, 遂停.

To avoid benchmark contamination, we follow Guo et al. (2024) to filter out web pages containing questions or answers from English mathematical benchmarks such as GSM8K (Cobbe et al., 2021) and MATH (Hendrycks et al., 2021) and Chinese benchmarks such as CMATH (Wei et al., 2023) and AGIEval (Zhong et al., 2023). The filtering criteria are as follows: any text segment containing a 10-gram string that matches exactly with any sub-string from the evaluation benchmarks is removed from our math training corpus. For benchmark texts that are shorter than 10 grams but have at least 3 grams, we employ exact matching to filter out contaminated web pages.



为防基准污染, 按 Guo et al. (2024) 剔除含 GSM8K, MATH 以及 CMATH, AGIEval 等中英数学基准题/答的网页: 含与评测子串完全相同的 10-gram 即删; 短于 10-gram 但不短于 3-gram 的用精确匹配滤污染页.

<!-- page 6 of 30 -->

### 2.2. Validating the Quality of the DeepSeekMath Corpus 验证 DeepSeekMath Corpus 质量

We run pre-training experiments to investigate how the DeepSeekMath Corpus is compared with the recently released math-training corpora:



用预训练实验, 把 DeepSeekMath Corpus 与近期公开数学语料对比:

• **MathPile** (Wang et al., 2023c): a multi-source corpus (8.9B tokens) aggregated from textbooks, Wikipedia, ProofWiki, CommonCrawl, StackExchange, and arXiv, with the majority (over 85%) sourced from arXiv;



• **MathPile**: 多源语料(8.9B token), 教材 / Wikipedia / ProofWiki / CC / StackExchange / arXiv, 超 85% 来自 arXiv;

• **OpenWebMath** (Paster et al., 2023): CommonCrawl data filtered for mathematical content, totaling 13.6B tokens;



• **OpenWebMath**: CC 过滤出的数学内容, 共 13.6B token;

• **Proof-Pile-2** (Azerbayev et al., 2023): a mathematical corpus consisting of OpenWeb-Math, AlgebraicStack (10.3B tokens of mathematical code), and arXiv papers (28.0B tokens). When experimenting on Proof-Pile-2, we follow Azerbayev et al. (2023) to use an arXiv: Web: Code ratio of 2: 4: 1.



• **Proof-Pile-2**: OpenWebMath + AlgebraicStack(10.3B 数学代码)+ arXiv(28.0B); 实验按 2: 4: 1(arXiv: Web: Code)配比.

#### 2.2.1. Training Setting 训练设定

We apply math training to a general pre-trained language model with 1.3B parameters, which shares the same framework as the DeepSeek LLMs (DeepSeek-AI, 2024), denoted as DeepSeek-LLM 1.3B. We separately train a model on each mathematical corpus for 150B tokens. All experiments are conducted using the efficient and light-weight HAI-LLM (High-flyer, 2023) training framework. Following the training practice of DeepSeek LLMs, we use the AdamW optimizer (Loshchilov and Hutter, 2017) with $\beta _ { 1 } = 0 . 9 , \beta _ { 2 } = 0 . 9 5 , $ , and weight\_decay = 0.1, along with a multi-step learning rate schedule where the learning rate reaches the peak after 2, 000 warmup steps, decreases to its 31.6% after 80% of the training process, and further decreases to 10.0% of the peak after 90% of the training process. We set the maximum value of learning rate to 5.3e-4, and use a batch size of 4M tokens with a 4K context length.



在 1.3B 通用预训练模型 DeepSeek-LLM 1.3B(与 DeepSeek LLMs 同框架)上分别对各数学语料训 150B token. 框架 HAI-LLM; AdamW, $\beta_1=0.9$, $\beta_2=0.95$, weight_decay=0.1; multi-step 学习率: 2000 warmup 到峰值, 约 80% 进度降到峰值 31.6%, 约 90% 再降到 10%; 峰值 lr 5.3e-4, batch 4M token, 上下文 4K.

<table><tr><td rowspan="2">Math Corpus</td><td rowspan="2">Size</td><td colspan="5">English Benchmarks</td><td colspan="3">Chinese Benchmarks</td></tr><tr><td>GSM8K</td><td>MATH</td><td>OCW</td><td>SAT</td><td>MMLU STEM</td><td>CMATH</td><td>Gaokao MathCloze</td><td>Gaokao MathQA</td></tr><tr><td>No Math Training</td><td>N/A</td><td>2.9%</td><td>3.0%</td><td>2.9%</td><td>15.6%</td><td>19.5%</td><td>12.3%</td><td>0.8%</td><td>17.9%</td></tr><tr><td>MathPile</td><td>8.9B</td><td>2.7%</td><td>3.3%</td><td>2.2%</td><td>12.5%</td><td>15.7%</td><td>1.2%</td><td>0.0%</td><td>2.8%</td></tr><tr><td>OpenWebMath</td><td>13.6B</td><td>11.5%</td><td>8.9%</td><td>3.7%</td><td>31.3%</td><td>29.6%</td><td>16.8%</td><td>0.0%</td><td>14.2%</td></tr><tr><td>Proof-Pile-2</td><td>51.9B</td><td>14.3%</td><td>11.2%</td><td>3.7%</td><td>43.8%</td><td>29.2%</td><td>19.9%</td><td>5.1%</td><td>11.7%</td></tr><tr><td>DeepSeekMath Corpus</td><td>120.2B</td><td>23.8%</td><td>13.6%</td><td>4.8%</td><td>56.3%</td><td>33.1%</td><td>41.5%</td><td>5.9%</td><td>23.6%</td></tr></table>

Table 1 | Performance of DeepSeek-LLM 1.3B trained on different mathematical corpora, evaluated using few-shot chain-of-thought prompting. Corpus sizes are calculated using our tokenizer with a vocabulary size of 100K.



表 1｜DeepSeek-LLM 1.3B 在不同数学语料上训后的表现(few-shot CoT). 语料规模按本库 100K 词表分词器计.

#### 2.2.2. Evaluation Results 评测结果

**The DeepSeekMath Corpus is of high quality, covers multilingual mathematical content, and is the largest in size.**



**DeepSeekMath Corpus: 质量高, 覆盖多语数学, 规模最大.**

• **High-quality**: We evaluate downstream performance on 8 mathematical benchmarks using few-shot chain-of-thought prompting Wei et al. (2022). As shown in Table 1, there is a clear performance lead of the model trained on the DeepSeekMath Corpus. Figure 3 shows that the model trained on the DeepSeekMath Corpus demonstrates better performance than



• **高质量**: 8 个数学基准, few-shot CoT. 表 1 显示 DeepSeekMath Corpus 训出的模型明显领先. 图 3 显示其表现优于

<!-- page 7 of 30 -->

![Chart block](images/p07-figure-3-benchmark-curves-of-deepseek-llm-1-3b-trained.png)

Figure 3 | Benchmark curves of DeepSeek-LLM 1.3B trained on different mathematical corpora.



图 3｜DeepSeek-LLM 1.3B 在不同数学语料上的基准曲线.

Proof-Pile-2 at 50B tokens (1 full epoch of Proof-Pile-2), indicating the average quality of DeepSeekMath Corpus is higher.



在 50B token(Proof-Pile-2 一整轮)时仍好于 Proof-Pile-2, 说明平均质量更高.

• **Multilingual**: The DeepSeekMath Corpus encompasses data in multiple languages, pre-dominantly featuring English and Chinese as the two most represented languages. As shown in Table 1, training on the DeepSeekMath Corpus enhances mathematical reasoning performance in both English and Chinese. In contrast, existing mathematical corpora, which are primarily English-centric, show limited improvement and may even hinder performance in Chinese mathematical reasoning.



• **多语**: 以中英为主. 表 1 显示中英数学推理都升; 既有语料偏英文, 中文侧提升有限甚至拖后腿.

• **Large-scale**: The DeepSeekMath Corpus is several times larger than existing mathematical corpora. As depicted in Figure 3, DeepSeek-LLM 1.3B, when trained on the DeepSeek-Math Corpus, shows a steeper learning curve along with more lasting improvements. In contrast, the baseline corpora are much smaller, and have already been repeated multiple rounds during training, with the resulting model performance quickly reaching a plateau.



• **大规模**: 比既有数学语料大数倍. 图 3: 训 DeepSeekMath Corpus 的学习曲线更陡, 改进更持久; 基线语料小, 训练中已多轮重复, 很快触顶.

### 2.3. Training and Evaluating DeepSeekMath-Base 7B 训练与评测 DeepSeekMath-Base 7B

In this section, we introduce DeepSeekMath-Base 7B, a base model with strong reasoning abilities, especially in mathematics. Our model is initialized with DeepSeek-Coder-Base-v1.5 7B



本节介绍推理尤其数学很强的 DeepSeekMath-Base 7B. 初始化自 DeepSeek-Coder-Base-v1.5 7B

<!-- page 8 of 30 -->

(Guo et al., 2024) and trained for 500B tokens. The distribution of the data is as follows: 56% is from the DeepSeekMath Corpus, 4% from AlgebraicStack, 10% from arXiv, 20% is Github code, and the remaining 10% is natural language data from Common Crawl in both English and Chinese. We mainly adopt the training setting specified in Section 2.2.1, except that we set the maximum value of the learning rate to 4.2e-4 and use a batch size of 10M tokens.



(Guo et al., 2024), 共训 500B token. 配比: DeepSeekMath Corpus 56%, AlgebraicStack 4%, arXiv 10%, GitHub 代码 20%, 中英 CC 自然语言 10%. 训练设定基本同 §2.2.1, 唯峰值 lr 改为 4.2e-4, batch 10M token.

We conduct a comprehensive assessment of the mathematical capabilities of DeepSeekMath-Base 7B, focusing on its ability to produce self-contained mathematical solutions without relying on external tools, solve mathematical problems using tools, and conduct formal theorem proving. Beyond mathematics, we also provide a more general profile of the base model, including its performance of natural language understanding, reasoning, and programming skills.



全面评估: 无工具逐步解题, 用工具解题, 形式定理证明; 并给出理解, 推理, 编程的一般画像.

**Mathematical Problem Solving with Step-by-Step Reasoning** We evaluate DeepSeekMath-Base’s performance of solving mathematical problems using few-shot chain-of-thought prompting (Wei et al., 2022), across eight benchmarks in English and Chinese. These benchmarks encompass quantitative reasoning (e. g., GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021), and CMATH (Wei et al., 2023)) and multiple-choice problems (e. g., MMLU-STEM (Hendrycks et al., 2020) and Gaokao-MathQA (Zhong et al., 2023)), covering diverse fields of mathematics from elementary to college-level complexity.



**逐步推理解题**: few-shot CoT, 中英八基准, 含定量推理与多选, 难度从小学到大学.

As shown in Table 2, DeepSeekMath-Base 7B leads in performance across all eight benchmarks among the open-source base models (including the widely-used general model Mistral 7B (Jiang et al., 2023) and the recently released Llemma 34B (Azerbayev et al., 2023) which underwent math training on Proof-Pile-2 (Azerbayev et al., 2023)). Notably, on the competitionlevel MATH dataset, DeepSeekMath-Base surpasses existing open-source base models by over 10% absolute, and outperforms Minerva 540B (Lewkowycz et al., 2022a), a closed-source base model 77 times larger which builds on PaLM (Lewkowycz et al., 2022b) and is further trained on mathematical texts.



表 2: 在全部八基准上领先开源 base(含 Mistral 7B, 在 Proof-Pile-2 上做过数学训练的 Llemma 34B). 竞赛级 MATH 上绝对领先开源 base 逾 10 点, 并超过约大 77 倍, 建在 PaLM 上再训数学文本的闭源 Minerva 540B.

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="5">English Benchmarks</td><td colspan="3">Chinese Benchmarks</td></tr><tr><td>GSM8K</td><td>MATH</td><td>OCW</td><td>SAT</td><td>MMLU STEM</td><td>CMATH</td><td>Gaokao MathCloze</td><td>Gaokao MathQA</td></tr><tr><td colspan="10">Closed-Source Base Model</td></tr><tr><td>Minerva</td><td>7B</td><td>16.2%</td><td>14.1%</td><td>7.7%</td><td>-</td><td>35.6%</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Minerva</td><td>62B</td><td>52.4%</td><td>27.6%</td><td>12.0%</td><td>-</td><td>53.9%</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Minerva</td><td>540B</td><td>58.8%</td><td>33.6%</td><td>17.6%</td><td>-</td><td>63.9%</td><td>-</td><td>-</td><td>-</td></tr><tr><td colspan="10">Open-Source Base Model</td></tr><tr><td>Mistral</td><td>7B</td><td>40.3%</td><td>14.3%</td><td>9.2%</td><td>71.9%</td><td>51.1%</td><td>44.9%</td><td>5.1%</td><td>23.4%</td></tr><tr><td>Llemma</td><td>7B</td><td>37.4%</td><td>18.1%</td><td>6.3%</td><td>59.4%</td><td>43.1%</td><td>43.4%</td><td>11.9%</td><td>23.6%</td></tr><tr><td>Llemma</td><td>34B</td><td>54.0%</td><td>25.3%</td><td>10.3%</td><td>71.9%</td><td>52.9%</td><td>56.1%</td><td>11.9%</td><td>26.2%</td></tr><tr><td>DeepSeekMath-Base</td><td>7B</td><td>64.2%</td><td>36.2%</td><td>15.4%</td><td>84.4%</td><td>56.5%</td><td>71.7%</td><td>20.3%</td><td>35.3%</td></tr></table>

Table 2 | Comparisons between DeepSeekMath-Base 7B and strong base models on English and Chinese mathematical benchmarks. Models are evaluated with chain-of-thought prompting. Minerva results are quoted from Lewkowycz et al. (2022a).



表 2｜DeepSeekMath-Base 7B 与强 base 在中英数学基准上的对比(CoT). Minerva 数字引自 Lewkowycz et al. (2022a).

<!-- page 9 of 30 -->

Mathematical Problem Solving with Tool Use We evaluate program-aided mathematical reasoning on GSM8K and MATH using few-shot program-of-thought prompting (Chen et al., 2022; Gao et al., 2023). Models are prompted to solve each problem by writing a Python program where libraries such as math and sympy can be utilized for intricate computations. The execution result of the program is evaluated as the answer. As shown in Table 3, DeepSeekMath-Base 7B outperforms the prior state-of-the-art Llemma 34B.



**用工具解题**: GSM8K / MATH 上 few-shot PoT, 写 Python(可用 math, sympy), 以执行结果为答案. 表 3: DeepSeekMath-Base 7B 超过此前 SOTA Llemma 34B.

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="2">Problem Solving w/ Tools</td><td colspan="2">Informal-to-Formal Proving</td></tr><tr><td>GSM8K+Python</td><td>MATH+Python</td><td>miniF2F-valid</td><td>miniF2F-test</td></tr><tr><td>Mistral</td><td>7B</td><td>48.5%</td><td>18.2%</td><td>18.9%</td><td>18.0%</td></tr><tr><td>CodeLlama</td><td>7B</td><td>27.1%</td><td>17.2%</td><td>16.3%</td><td>17.6%</td></tr><tr><td>CodeLlama</td><td>34B</td><td>52.7%</td><td>23.5%</td><td>18.5%</td><td>18.0%</td></tr><tr><td>Llemma</td><td>7B</td><td>41.0%</td><td>18.6%</td><td>20.6%</td><td>22.1%</td></tr><tr><td>Llemma</td><td>34B</td><td>64.6%</td><td>26.3%</td><td>21.0%</td><td>21.3%</td></tr><tr><td>DeepSeekMath-Base</td><td>7B</td><td>66.9%</td><td>31.4%</td><td>25.8%</td><td>24.6%</td></tr></table>

Table 3 | Few-shot evaluation of base models’ ability to solve mathematical problems using tools and the ability to conduct informal-to-formal theorem proving in Isabelle.



表 3｜base 模型 few-shot: 用工具解题, 以及在 Isabelle 上做 informal-to-formal 证明.

**Formal Mathematics** Formal proof automation is beneficial to ensure the accuracy and reliability of mathematical proofs and enhance efficiency, with increasing attention in recent years. We evaluate DeepSeekMath-Base 7B on the task of informal-to-formal proving from (Jiang et al., 2022) which is to generate a formal proof based on an informal statement, a formal counterpart of the statement, and an informal proof. We evaluate on miniF2F (Zheng et al., 2021), a benchmark for formal Olympiad-level mathematics, and generate a formal proof in Isabelle for each problem with few-shot prompting. Following Jiang et al. (2022), we leverage models to generate proof sketches, and execute the off-the-shelf automated prover Sledgehammer (Paulson, 2010) to fill in the missing details. As shown in Table 3, DeepSeekMath-Base 7B demonstrates strong performance in proof autoformalization.



**形式数学**: 按 Jiang et al. (2022) 做 informal-to-formal: 给定非形式陈述, 形式陈述与非形式证明, 生成形式证明. 评测集 miniF2F, few-shot 写 Isabelle; 模型出证明草稿, 再用现成自动证明器 Sledgehammer 补细节. 表 3: 自动形式化表现强.

| Model | Size | MMLU BBH Hu | manEval (Pass@1 | ) MBPP (Pass@1) |
| --- | --- | --- | --- | --- |
| Mistral | 7B | 62.4% 55.7% | 28.0% | 41.4% |
| DeepSeek-Coder-Base-v1.5<sup>†</sup> | 7B | 42.9% 42.9% | 40.2% | 52.6% |
| DeepSeek-Coder-Base-v1.5 | 7B | 49.1% 55.2% | 43.2% | 60.4% |
| DeepSeekMath-Base | 7B | 54.9% 59.5% | 40.9% | 52.6% |

Table 4 | Evaluation on natural language understanding, reasoning, and code benchmarks. DeepSeek-Coder-Base-v1.5<sup>†</sup>is the checkpoint right before learning rate decay, which is used to train DeepSeekMath-Base. On MMLU and BBH, we use few-shot chain-of-thought prompting. On HumanEval and MBPP, we evaluate model performance under the zero-shot setting and a few-shot setting, respectively.



表 4｜自然语言理解, 推理与代码. † 为学习率衰减前的 checkpoint, 用于训 DeepSeekMath-Base. MMLU / BBH 用 few-shot CoT; HumanEval 零样本, MBPP few-shot.

**Natural Language Understanding, Reasoning, and Code** We evaluate model performance of natural language understanding on MMLU (Hendrycks et al., 2020), reasoning on BBH (Suzgun et al., 2022), and coding capabilities on HumanEval (Chen et al., 2021) and MBPP (Austin et al.,



**自然语言理解, 推理与代码**: MMLU 测理解, BBH 测推理, HumanEval / MBPP 测代码(Austin et al.,

<!-- page 10 of 30 -->

2021). As shown in Table 4, DeepSeekMath-Base 7B exhibits significant enhancements in performance on MMLU and BBH over its precursor, DeepSeek-Coder-Base-v1.5 (Guo et al., 2024), illustrating the positive impact of math training on language understanding and reasoning. Additionally, by including code tokens for continual training, DeepSeekMath-Base 7B effectively maintains the performance of DeepSeek-Coder-Base-v1.5 on the two coding benchmarks. Overall, DeepSeekMath-Base 7B significantly outperforms the general model Mistral 7B (Jiang et al., 2023) on the three reasoning and coding benchmarks.



2021). 表 4: 相对前身 Coder-Base-v1.5, MMLU / BBH 明显上涨, 说明数学训练有利于理解与推理; 续训里保留代码 token, 两份代码基准大体保住. 整体在三项推理/代码基准上显著优于通用 Mistral 7B.

## 3. Supervised Fine-Tuning 监督微调

### 3.1. SFT Data Curation SFT 数据整理

We construct a mathematical instruction-tuning dataset covering English and Chinese problems from different mathematical fields and of varying complexity levels: problems are paired with solutions in chain-of-thought (CoT) (Wei et al., 2022), program-of-thought (PoT) (Chen et al., 2022; Gao et al., 2023), and tool-integrated reasoning format (Gou et al., 2023). The total number of training examples is 776K.



建中英数学指令集, 覆盖多领域, 多难度; 解答格式含 CoT, PoT, 工具集成推理. 共 776K 条.

**English mathematical datasets**: We annotate GSM8K and MATH problems with toolintegrated solutions, and adopt a subset of MathInstruct (Yue et al., 2023) along with the training set of Lila-OOD (Mishra et al., 2022) where problems are solved with CoT or PoT. Our English collection covers diverse fields of mathematics, e. g., algebra, probability, number theory, calculus, and geometry.



**英文**: GSM8K / MATH 标工具集成解; 并采用 MathInstruct 子集与 Lila-OOD 训练集(CoT 或 PoT). 覆盖代数, 概率, 数论, 微积分, 几何等.

• **Chinese mathematical datasets**: We collect Chinese K-12 mathematical problems spanning 76 sub-topics such as linear equations, with solutions annotated in both CoT and toolintegrated reasoning format.



• **中文**: K-12, 76 个子主题(如线性方程), 解答同时标 CoT 与工具集成格式.

### 3.2. Training and Evaluating DeepSeekMath-Instruct 7B 训练与评测 DeepSeekMath-Instruct 7B

In this section, we introduce DeepSeekMath-Instruct 7B which undergoes mathematical instruction tuning based on DeepSeekMath-Base. Training examples are randomly concatenated until reaching a maximum context length of 4K tokens. We train the model for 500 steps with a batch size of 256 and a constant learning rate of 5e-5.



在 Base 上做数学指令微调得到 Instruct. 样本随机拼接至最长 4K; 训 500 step, batch 256, 恒定 lr 5e-5.

We evaluate models’ mathematical performance both without and with tool use, on 4 quantitative reasoning benchmarks in English and Chinese. We benchmark our model against the leading models of the time:



在中英 4 个定量推理基准上, 分别测无工具与用工具; 对照当时领先模型:

• **Closed-source models** include: (1) the GPT family among which GPT-4 (OpenAI, 2023) and GPT-4 Code Interpreter <sup>2</sup> are the most capable ones, (2) Gemini Ultra and Pro (Anil et al., 2023), (3) Inflection-2 (Inflection AI, 2023), (4) Grok-1 <sup>3</sup>, as well as models recently released by Chinese companies including (5) Baichuan-3 <sup>4</sup>, (6) the latest GLM-4 <sup>5</sup>from the GLM family (Du et al., 2022). These models are for general purposes, most of which have undergone a series of alignment procedures.



• **闭源**: GPT 系(尤 GPT-4 与 GPT-4 Code Interpreter<sup>2</sup>), Gemini Ultra/Pro, Inflection-2, Grok-1<sup>3</sup>, 以及国内 Baichuan-3<sup>4</sup>, GLM-4<sup>5</sup> 等. 多为通用模型, 多数经过多轮对齐.

• **Open-source models** include: general models like (1) DeepSeek-LLM-Chat 67B (DeepSeek-AI, 2024), (2) Qwen 72B (Bai et al., 2023), (3) SeaLLM-v2 7B (Nguyen et al., 2023), and (4)



• **开源**: 通用侧 DeepSeek-LLM-Chat 67B, Qwen 72B, SeaLLM-v2 7B, 以及

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>2</sup>[https://openai. com/blog/chatgpt-plugins#code-interpreter](https://openai. com/blog/chatgpt-plugins##code-interpreter)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>3</sup>[https://x. ai/model-card](https://x. ai/model-card)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>4</sup>[https://www. baichuan-ai. com](https://www. baichuan-ai. com)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>5</sup>[https://open. bigmodel. cn/dev/api#glm-4](https://open. bigmodel. cn/dev/api#glm-4)</span></small>

<!-- page 11 of 30 -->

ChatGLM3 6B (ChatGLM3 Team, 2023), as well as models with enhancements in mathematics including (5) InternLM2-Math 20B <sup>6</sup> which builds on InternLM2 and underwent math training followed by instruction tuning, (6) Math-Shepherd-Mistral 7B which applys PPO training (Schulman et al., 2017) to Mistral 7B (Jiang et al., 2023) with a process-supervised reward model, (7) the WizardMath series (Luo et al., 2023) which improves mathematical reasoning in Mistral 7B and Llama-2 70B (Touvron et al., 2023) using evolve-instruct (i. e., a version of instruction tuning that uses AI-evolved instructions) and PPO training with training problems primarily sourced from GSM8K and MATH, (8) MetaMath 70B (Yu et al., 2023) which is Llama-2 70B fine-tuned on an augmented version of GSM8K and MATH, (9) ToRA 34B Gou et al. (2023) which is CodeLlama 34B fine-tuned to do tool-integrated mathematical reasoning, (10) MAmmoTH 70B (Yue et al., 2023) which is Llama-2 70B instruction-tuned on MathInstruct.



ChatGLM3 6B; 数学增强侧 InternLM2-Math 20B<sup>6</sup>, Math-Shepherd-Mistral 7B(过程监督奖励 + PPO), WizardMath 系列(evolve-instruct + PPO), MetaMath 70B, ToRA 34B, MAmmoTH 70B 等.

As shown in Table 5, under the evaluation setting where tool use is disallowed, DeepSeekMath-Instruct 7B demonstrates strong performance of step-by-step reasoning. Notably, on the competition-level MATH dataset, our model surpasses all open-source models and the majority of proprietary models (e. g., Inflection-2 and Gemini Pro) by at least 9% absolute. This is true even for models that are substantially larger (e. g., Qwen 72B) or have been specifically enhanced through math-focused reinforcement learning (e. g., WizardMath-v1.1 7B). While DeepSeekMath-Instruct rivals the Chinese proprietary models GLM-4 and Baichuan-3 on MATH, it still underperforms GPT-4 and Gemini Ultra.



表 5: 禁用工具时, Instruct 7B 逐步推理很强. 竞赛级 MATH 上至少绝对领先所有开源与多数专有模型(如 Inflection-2, Gemini Pro)9 点-- 即便对方更大(Qwen 72B)或做过数学向 RL(WizardMath-v1.1 7B). 与 GLM-4, Baichuan-3 在 MATH 上可打, 仍低于 GPT-4 与 Gemini Ultra.

Under the evaluation setting where models are allowed to integrate natural language reasoning and program-based tool use for problem solving, DeepSeekMath-Instruct 7B approaches an accuracy of 60% on MATH, surpassing all existing open-source models. On the other benchmarks, our model is competitive with DeepSeek-LLM-Chat 67B, the prior state-of-the-art that is 10 times larger.



允许自然语言推理与程序工具并用时, Instruct 7B 在 MATH 逼近 60%, 超过全部既有开源; 其余基准上可与约大 10 倍的 DeepSeek-LLM-Chat 67B 比肩.

## 4. Reinforcement Learning 强化学习

### 4.1. Group Relative Policy Optimization 组相对策略优化(GRPO)

Reinforcement learning (RL) has been proven to be effective in further improving the mathematical reasoning ability of LLMs after the Supervised Fine-Tuning (SFT) stage (Luo et al., 2023; Wang et al., 2023b). In this section, we introduce our efficient and effective RL algorithm, Group Relative Policy Optimization (GRPO).



SFT 之后用 RL 继续抬数学推理已有先例. 本节介绍高效且有效的 GRPO.

#### 4.1.1. From PPO to GRPO 从 PPO 到 GRPO

Proximal Policy Optimization (PPO) (Schulman et al., 2017) is an actor-critic RL algorithm that is widely used in the RL fine-tuning stage of LLMs (Ouyang et al., 2022). In particular, it optimizes LLMs by maximizing the following surrogate objective:



PPO 是 actor-critic 算法, 广泛用于 LLM 的 RL 微调. 它最大化如下代理目标:

$$
\mathcal {J} _ {P P O} (\theta) = \mathbb {E} \left[ q \sim P (Q), o \sim \pi_ {\theta_ {o l d}} (O | q) \right] \frac {1}{| o |} \sum_ {t = 1} ^ {| o |} \min \left[ \frac {\pi_ {\theta} \left(o _ {t} \mid q , o _ {<   t}\right)}{\pi_ {\theta_ {o l d}} \left(o _ {t} \mid q , o _ {<   t}\right)} A _ {t}, \operatorname{clip} \left(\frac {\pi_ {\theta} \left(o _ {t} \mid q , o _ {<   t}\right)}{\pi_ {\theta_ {o l d}} \left(o _ {t} \mid q , o _ {<   t}\right)}, 1 - \varepsilon , 1 + \varepsilon\right) A _ {t} \right], \tag{1}
$$

where $\pi _ { \theta }$ and $\pi _ { \theta _ { o l d } }$ are the current and old policy models, and $q , o$ are questions and outputs sampled from the question dataset and the old policy $\pi _ { \theta _ { o l d } } , $ respectively. 𝜀 is a clipping-related hyper-parameter introduced in PPO for stabilizing training. $A _ { t }$ is the advantage, which is computed by applying Generalized Advantage Estimation (GAE) (Schulman et al., 2015), based



其中 $\pi_\theta$, $\pi_{\theta_{old}}$ 为当前与旧策略; $q$, $o$ 分别来自题集与旧策略采样. $\varepsilon$ 为裁剪超参以稳住训练. $A_t$ 为优势, 由 GAE 基于

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>6</sup>[https://github. com/InternLM/InternLM-Math](https://github. com/InternLM/InternLM-Math)</span></small>

<!-- page 12 of 30 -->

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="2">English Benchmarks</td><td colspan="2">Chinese Benchmarks</td></tr><tr><td>GSM8K</td><td>MATH</td><td>MGSM-zh</td><td>CMATH</td></tr><tr><td colspan="6">Chain-of-Thought Reasoning</td></tr><tr><td></td><td colspan="5">Closed-Source Model</td></tr><tr><td>Gemini Ultra</td><td>-</td><td>94.4%</td><td>53.2%</td><td>-</td><td>-</td></tr><tr><td>GPT-4</td><td>-</td><td>92.0%</td><td>52.9%</td><td>-</td><td>86.0%</td></tr><tr><td>Inflection-2</td><td>-</td><td>81.4%</td><td>34.8%</td><td>-</td><td>-</td></tr><tr><td>GPT-3.5</td><td>-</td><td>80.8%</td><td>34.1%</td><td>-</td><td>73.8%</td></tr><tr><td>Gemini Pro</td><td>-</td><td>86.5%</td><td>32.6%</td><td>-</td><td>-</td></tr><tr><td>Grok-1</td><td>-</td><td>62.9%</td><td>23.9%</td><td>-</td><td>-</td></tr><tr><td>Baichuan-3</td><td>-</td><td>88.2%</td><td>49.2%</td><td>-</td><td>-</td></tr><tr><td>GLM-4</td><td>-</td><td>87.6%</td><td>47.9%</td><td>-</td><td>-</td></tr><tr><td></td><td colspan="5">Open-Source Model</td></tr><tr><td>InternLM2-Math</td><td>20B</td><td>82.6%</td><td>37.7%</td><td>-</td><td>-</td></tr><tr><td>Qwen</td><td>72B</td><td>78.9%</td><td>35.2%</td><td>-</td><td>-</td></tr><tr><td>Math-Shepherd-Mistral</td><td>7B</td><td>84.1%</td><td>33.0%</td><td>-</td><td>-</td></tr><tr><td>WizardMath-v1.1</td><td>7B</td><td>83.2%</td><td>33.0%</td><td>-</td><td>-</td></tr><tr><td>DeepSeek-LLM-Chat</td><td>67B</td><td>84.1%</td><td>32.6%</td><td>74.0%</td><td>80.3%</td></tr><tr><td>MetaMath</td><td>70B</td><td>82.3%</td><td>26.6%</td><td>66.4%</td><td>70.9%</td></tr><tr><td>SeaLLM-v2</td><td>7B</td><td>78.2%</td><td>27.5%</td><td>64.8%</td><td>-</td></tr><tr><td>ChatGLM3</td><td>6B</td><td>72.3%</td><td>25.7%</td><td>-</td><td>-</td></tr><tr><td>WizardMath-v1.0</td><td>70B</td><td>81.6%</td><td>22.7%</td><td>64.8%</td><td>65.4%</td></tr><tr><td>DeepSeekMath-Instruct</td><td>7B</td><td>82.9%</td><td>46.8%</td><td>73.2%</td><td>84.6%</td></tr><tr><td>DeepSeekMath-RL</td><td>7B</td><td>88.2%</td><td>51.7%</td><td>79.6%</td><td>88.8%</td></tr></table>

<table><tr><td colspan="6">Tool-Integrated Reasoning</td></tr><tr><td colspan="6">Closed-Source Model</td></tr><tr><td>GPT-4 Code Interpreter</td><td>-</td><td>97.0%</td><td>69.7%</td><td>-</td><td>-</td></tr><tr><td colspan="6">Open-Source Model</td></tr><tr><td>InternLM2-Math</td><td>20B</td><td>80.7%</td><td>54.3%</td><td>-</td><td>-</td></tr><tr><td>DeepSeek-LLM-Chat</td><td>67B</td><td>86.7%</td><td>51.1%</td><td>76.4%</td><td>85.4%</td></tr><tr><td>ToRA</td><td>34B</td><td>80.7%</td><td>50.8%</td><td>41.2%</td><td>53.4%</td></tr><tr><td>MAmmoTH</td><td>70B</td><td>76.9%</td><td>41.8%</td><td>-</td><td>-</td></tr><tr><td>DeepSeekMath-Instruct</td><td>7B</td><td>83.7%</td><td>57.4%</td><td>72.0%</td><td>84.3%</td></tr><tr><td>DeepSeekMath-RL</td><td>7B</td><td>86.7%</td><td>58.8%</td><td>78.4%</td><td>87.6%</td></tr></table>

Table 5 | Performance of Open- and Closed-Source models with both Chain-of-Thought and Tool-Integrated Reasoning on English and Chinese Benchmarks. Scores in gray denote majority votes with 32 candidates; The others are Top1 scores. DeepSeekMath-RL 7B beats all open-source models from 7B to 70B, as well as the majority of closed-source models. Although DeepSeekMath-RL 7B is only further trained on chain-of-thought-format instruction tuning data of GSM8K and MATH, it improves over DeepSeekMath-Instruct 7B on all benchmarks.



表 5｜开源与闭源模型在中英基准上的 CoT / 工具集成表现. 灰色为 32 候选多数票, 其余为 Top1. DeepSeekMath-RL 7B 压过 7B–70B 全部开源与多数闭源. 尽管 RL 只在 GSM8K/MATH 的 CoT 指令数据上继续训, 相对 Instruct 仍在所有基准上涨.

<!-- page 13 of 30 -->

![Image block](images/p13-figure-4-demonstration-of-ppo-and-our-grpo-grpo.png)

Figure 4 | Demonstration of PPO and our GRPO. GRPO foregoes the value model, instead estimating the baseline from group scores, significantly reducing training resources.



图 4｜PPO 与 GRPO 示意. GRPO 去掉价值模型, 用组分数估基线, 显著省训练资源.

on the rewards $\{ r _ { \geq t } \}$ and a learned value function $V _ { \psi }$ . Thus, in PPO, a value function needs to be trained alongside the policy model and to mitigate over-optimization of the reward model, the standard approach is to add a per-token KL penalty from a reference model in the reward at each token (Ouyang et al., 2022), i. e.,



奖励 $\{r_{\geq t}\}$ 与学得的价值函数 $V_\psi$ 算出. 因此 PPO 要并行训价值函数; 为抑制对奖励模型过优化, 通常在每 token 奖励里加相对参考模型的 KL 惩罚(Ouyang et al., 2022):

$$
r _ {t} = r _ {\varphi} (q, o _ {\leq t}) - \beta \log \frac {\pi_ {\theta} (o _ {t} | q , o _ {<   t})}{\pi_ {r e f} (o _ {t} | q , o _ {<   t})}, \tag{2}
$$

where $r _ { \varphi }$ is the reward model, $\pi _ { r e f }$ is the reference model, which is usually the initial SFT model, and $\beta$ is the coefficient of the KL penalty.



$r_\varphi$ 为奖励模型, $\pi_{ref}$ 通常为初始 SFT, $\beta$ 为 KL 系数.

As the value function employed in PPO is typically another model of comparable size as the policy model, it brings a substantial memory and computational burden. Additionally, during RL training, the value function is treated as a baseline in the calculation of the advantage for variance reduction. While in the LLM context, usually only the last token is assigned a reward score by the reward model, which may complicate the training of a value function that is accurate at each token. To address this, as shown in Figure 4, we propose Group Relative Policy Optimization (GRPO), which obviates the need for additional value function approximation as in PPO, and instead uses the average reward of multiple sampled outputs, produced in response to the same question, as the baseline. More specifically, for each question $q , $ GRPO samples a group of outputs $\{ o _ { 1 } , o _ { 2 } , \cdots , o _ { G } \}$ from the old policy $\pi _ { \theta _ { o l d } }$ and then optimizes the policy model by maximizing the following objective:



PPO 的价值函数往往与策略同量级, 显存与算力负担大; 且 LLM 场景奖励多半只打在最后一个 token, 逐 token 准确的价值函数更难训. 如图 4, GRPO 不再近似额外价值函数, 而用「同一题多条采样输出的平均奖励」当基线. 具体地, 对每题 $q$, 从旧策略采一组 $\{o_1, \ldots, o_G\}$, 再最大化:

$$
\begin{array}{r l} & {\mathcal {J} _ {G R P O} (\theta) = \mathbb {E} [ q \sim P (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {o l d}} (O | q) ]} \\ & {\qquad \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{| o _ {i} |} \sum_ {t = 1} ^ {| o _ {i} |} \left\{\min \left[ \frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta_ {o l d}} (o _ {i , t} | q , o _ {i , <   t})} \hat {A} _ {i, t}, \mathrm{clip} \left(\frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta_ {o l d}} (o _ {i , t} | q , o _ {i , <   t})}, 1 - \varepsilon , 1 + \varepsilon\right) \hat {A} _ {i, t} \right] - \beta \mathbb {D} _ {K L} \left[ \pi_ {\theta} | | \pi_ {r e f} \right] \right\}, } \end{array}\tag{3}
$$

where $\varepsilon$ and $\beta$ are hyper-parameters, and $\hat { A } _ { i , t }$ is the advantage calculated based on relative rewards of the outputs inside each group only, which will be detailed in the following subsec tions. The group relative way that GRPO leverages to calculate the advantages, aligns well with the comparative nature of rewards models, as reward models are typically trained on datasets of comparisons between outputs on the same question. Also note that, instead of adding KL penalty in the reward, GRPO regularizes by directly adding the KL divergence between the trained policy and the reference policy to the loss, avoiding complicating the calculation of $\hat { A } _ { i , t }$



$\varepsilon$, $\beta$ 为超参; $\hat{A}_{i, t}$ 只由组内相对奖励算出(下节细述). 组相对优势与奖励模型「同题多答比较」的训练方式合拍. 另: GRPO 不把 KL 塞进奖励, 而直接把策略与参考策略的 KL 加进损失, 免得把 $\hat{A}_{i, t}$ 算复杂.

<!-- page 14 of 30 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family: monospace;">
Algorithm 1 Iterative Group Relative Policy Optimization
Input initial policy model $\pi_{\theta_{init}}$; reward models $r_{\varphi}$; task prompts $\mathcal{D}$; hyperparameters $\varepsilon, \beta, \mu$
policy model $\pi_{\theta} \leftarrow \pi_{\theta_{init}}$
for iteration = 1, ..., I do
    reference model $\pi_{ref} \leftarrow \pi_{\theta}$
    for step = 1, ..., M do
        Sample a batch $\mathcal{D}_b$ from $\mathcal{D}$
        Update the old policy model $\pi_{\theta_{old}} \leftarrow \pi_{\theta}$
        Sample $G$ outputs $\{o_i\}_{i=1}^G \sim \pi_{\theta_{old}}(\cdot \mid q)$ for each question $q \in \mathcal{D}_b$
        Compute rewards $\{r_i\}_{i=1}^G$ for each sampled output $o_i$ by running $r_{\varphi}$
        Compute $\hat{A}_{i, t}$ for the $t$-th token of $o_i$ through group relative advantage estimation.
        for GRPO iteration = 1, ..., $\mu$ do
            Update the policy model $\pi_{\theta}$ by maximizing the GRPO objective (Equation 21)
        Update $r_{\varphi}$ through continuous training using a replay mechanism.
Output $\pi_{\theta}$
</div>



算法 1｜迭代式组相对策略优化: 外层迭代更新参考模型与奖励模型, 内层对每题采 $G$ 条输出, 算组相对优势, 再最大化 GRPO 目标; 奖励模型用含 10% 历史数据的 replay 持续训.

And different from the KL penalty term used in (2), we estimate the KL divergence with the following unbiased estimator (Schulman, 2020):



与式 (2) 的 KL 惩罚不同, KL 用如下无偏估计(Schulman, 2020):

$$
\mathbb {D} _ {K L} \left[ \pi_ {\theta} | | \pi_ {r e f} \right] = \frac {\pi_ {r e f} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})} - \log \frac {\pi_ {r e f} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})} - 1, \tag{4}
$$

which is guaranteed to be positive.



该估计保证非负.

#### 4.1.2. Outcome Supervision RL with GRPO 结果监督下的 GRPO

Formally, for each question 𝑞, a group of outputs $\{ o _ { 1 } , o _ { 2 } , \cdots , o _ { G } \}$ are sampled from the old policy model $\pi _ { \theta _ { o l d } }$ . A reward model is then used to score the outputs, yielding 𝐺 rewards $\mathbf { r } = \{ r _ { 1 } , r _ { 2 } , \cdots , r _ { G } \}$ correspondingly. Subsequently, these rewards are normalized by subtracting the group average and dividing by the group standard deviation. Outcome supervision provides the normalized reward at the end of each output $o _ { i }$ and sets the advantages $\hat { A } _ { i , t }$ of all tokens in the output as the normalized reward, i. e., $\begin{array} { r } { \widehat { \hat { A } _ { i , t } } = \widetilde { r _ { i } } = \frac { r _ { i } - \mathrm { m e a n } ( \mathbf { r } ) } { \mathsf { s t d } ( \mathbf { r } ) } } \end{array}$ , and then optimizes the policy by maximizing the objective defined in equation (3).



对每题 $q$ 从旧策略采一组输出, 奖励模型打分得 $\mathbf{r}$; 再减组均值, 除组标准差做归一化. 结果监督: 归一化奖励只放在每条输出末尾, 该输出内所有 token 的优势都等于该归一化奖励, 再最大化式 (3).

解释: 结果监督 = 「整条对不对」一个数广播到所有 token; 组内标准化让「这题相对算不算好」成为优势, 而不是绝对分.

#### 4.1.3. Process Supervision RL with GRPO 过程监督下的 GRPO

Outcome supervision only provides a reward at the end of each output, which may not be sufficient and efficient to supervise the policy in complex mathematical tasks. Following Wang et al. (2023b), we also explore process supervision, which provides a reward at the end of each reasoning step. Formally, given the question 𝑞 and 𝐺 sampled outputs $\{ o _ { 1 } , o _ { 2 } , \cdots , o _ { G } \}$ , a process reward model is used to score each step of the outputs, yielding corresponding rewards: $\mathbf { \hat { R } } = \{ \{ r _ { 1 } ^ { i n d e x ( 1 ) } , \cdots , r _ { 1 } ^ { i n d e x ( K _ { 1 } ) } \} , \cdots , \{ r _ { G } ^ { i n d e x ( 1 ) } , \cdots , \hat { r _ { G } ^ { i n d e x ( K _ { G } ) } } \} \}$ , where 𝑖𝑛𝑑𝑒𝑥(𝑗) is the end token index of the 𝑗-th step, and $K _ { i }$ is the total number of steps in the 𝑖-th output. We also normalize these rewards with the average and the standard deviation, i. e., $\begin{array} { r } { \widetilde { r } _ { i } ^ { i n d e x ( j ) } = \frac { r _ { i } ^ { i n d e x ( j ) } - \mathrm { m e a n } ( \mathbf { R } ) } { \mathsf { s t d } ( \mathbf { R } ) } } \end{array}$ . Subsequently, the process supervision calculates the advantage of each token as the sum of the normalized rewards from the following steps, i. e., $\begin{array} { r } { \hat { A } _ { i , t } = \widetilde { \sum _ { i n d e x ( j ) \geq t } r _ { i } ^ { i n d e x ( j ) } } } \end{array}$ , and then optimizes the policy by maximizing the objective defined in equation (3).



结果监督只在末尾给分, 复杂数学里信号可能太稀. 按 Wang et al. (2023b) 也试过程监督: 每步推理结束打分. 过程奖励模型给出各步奖励; 同样做均值/标准差归一化; 每个 token 的优势 = 其后各步归一化奖励之和, 再最大化式 (3).

解释: 过程监督把「哪一步开始错」拆开; token $t$ 的优势是「从这一步往后还剩多少过程奖励」, 梯度更细, 通常比纯结果监督更稳.

<!-- page 15 of 30 -->

#### 4.1.4. Iterative RL with GRPO 迭代式 GRPO

As the reinforcement learning training process progresses, the old reward model may not be sufficient to supervise the current policy model. Therefore, we also explore the iterative RL with GRPO. As shown in Algorithm 1, in iterative GRPO, we generate new training sets for the reward model based on the sampling results from the policy model and continually train the old reward model using a replay mechanism that incorporates 10% of historical data. Then, we set the reference model as the policy model, and continually train the policy model with the new reward model.



随 RL 推进, 旧奖励模型可能跟不上当前策略. 于是试迭代 GRPO(算法 1): 用策略采样结果给奖励模型造新训练集, 并用含 10% 历史数据的 replay 持续训奖励模型; 再把参考模型设为当前策略, 用新奖励模型继续训策略.

### 4.2. Training and Evaluating DeepSeekMath-RL 训练与评测 DeepSeekMath-RL

We conduct RL based on DeepSeekMath-Instruct 7B. The training data of RL are chain-of-thought-format questions related to GSM8K and MATH from the SFT data, which consists of around 144K questions. We exclude other SFT questions to investigate the impact of RL on benchmarks that lack data throughout the RL phase. We construct the training set of reward models following (Wang et al., 2023b). We train our initial reward model based on the DeepSeekMath-Base 7B with a learning rate of 2e-5. For GRPO, we set the learning rate of the policy model as 1e-6. The KL coefficient is 0.04. For each question, we sample 64 outputs. The max length is set to 1024, and the training batch size is 1024. The policy model only has a single update following each exploration stage. We evaluate DeepSeekMath-RL 7B on benchmarks following DeepSeekMath-Instruct 7B. For DeepSeekMath-RL 7B, GSM8K and MATH with chain-of-thought reasoning can be regarded as in-domain tasks and all the other benchmarks can be regarded as out-of-domain tasks.



在 Instruct 7B 上做 RL. 训练题来自 SFT 里 GSM8K/MATH 的 CoT 题, 约 144K; 故意排除其他 SFT 题, 好观察「RL 阶段没见过数据」的基准. 奖励模型训练集按 Wang et al. (2023b); 初始奖励模型从 Base 7B 训, lr 2e-5. GRPO: 策略 lr 1e-6, KL 系数 0.04, 每题采 64 条, 最长 1024, batch 1024; 每轮探索后策略只更新一次. 评测设定同 Instruct. 对 RL 版而言, CoT 下的 GSM8K/MATH 算域内, 其余算域外.

Table 5 demonstrates the performance of open- and closed-source models with both chainof-thought and tool-integrated reasoning on English and Chinese benchmarks. We find that: 1) DeepSeekMath-RL 7B attains accuracies of 88.2% and 51.7% on GSM8K and MATH, respectively, utilizing chain-of-thought reasoning. This performance surpasses that of all open-source models in the 7B to 70B range, as well as the majority of closed-source models. 2) Crucially, DeepSeekMath-RL 7B is only trained on chain-of-thought-format instruction tuning data of GSM8K and MATH, starting from DeepSeekMath-Instruct 7B. Despite the constrained scope of its training data, it outperforms DeepSeekMath-Instruct 7B across all evaluation metrics, showcasing the effectiveness of reinforcement learning.



表 5 显示: 1)RL 版 CoT 下 GSM8K 88.2%, MATH 51.7%, 压过 7B–70B 开源与多数闭源; 2)尽管只在 GSM8K/MATH 的 CoT 数据上从 Instruct 继续训, 仍在全部指标上超过 Instruct, 说明 RL 有效.

## 5. Discussion

In this section, we will share our findings in pre-training and RL experiments.



本节分享预训练与 RL 实验中的发现.

### 5.1. Lessons Learnt in Pre-Training 预训练教训

We first share our experience in pre-training. Unless otherwise specified, we will adhere to the training settings outlined in Section 2.2.1. It is worth noting that, when referring to the DeepSeekMath Corpus in this section, we use an 89B-token dataset from the second iteration of the data collection process.



先谈预训练. 除非另说, 沿用 §2.2.1. 本节提到 DeepSeekMath Corpus 时, 用的是数据收集第二轮得到的 89B-token 集.

#### 5.1.1. Code Training Benefits Mathematical Reasoning 代码训练有利于数学推理

A popular yet unverified hypothesis suggests that code training improves reasoning. We attempt to offer a partial response to this, particularly within the mathematical domain: code training



「代码训练提升推理」流传已久但欠验证. 本文在数学域给出部分回答: 代码训练

<!-- page 16 of 30 -->

<table><tr><td rowspan="2">Training Setting</td><td colspan="3">Training Tokens</td><td colspan="3">w/o Tool Use</td><td colspan="2">w/ Tool Use</td></tr><tr><td>General</td><td>Code</td><td>Math</td><td>GSM8K</td><td>MATH</td><td>CMATH</td><td>GSM8K+Python</td><td>MATH+Python</td></tr><tr><td>No Continual Training</td><td>-</td><td>-</td><td>-</td><td>2.9%</td><td>3.0%</td><td>12.3%</td><td>2.7%</td><td>2.3%</td></tr><tr><td colspan="9">Two-Stage Training</td></tr><tr><td>Stage 1: General Training</td><td>400B</td><td>-</td><td>-</td><td>2.9%</td><td>3.2%</td><td>14.8%</td><td>3.3%</td><td>2.3%</td></tr><tr><td>Stage 2: Math Training</td><td>-</td><td>-</td><td>150B</td><td>19.1%</td><td>14.4%</td><td>37.2%</td><td>14.3%</td><td>6.7%</td></tr><tr><td>Stage 1: Code Training</td><td>-</td><td>400B</td><td>-</td><td>5.9%</td><td>3.6%</td><td>19.9%</td><td>12.4%</td><td>10.0%</td></tr><tr><td>Stage 2: Math Training</td><td>-</td><td>-</td><td>150B</td><td>21.9%</td><td>15.3%</td><td>39.7%</td><td>17.4%</td><td>9.4%</td></tr><tr><td colspan="9">One-Stage Training</td></tr><tr><td>Math Training</td><td>-</td><td>-</td><td>150B</td><td>20.5%</td><td>13.1%</td><td>37.6%</td><td>11.4%</td><td>6.5%</td></tr><tr><td>Code &amp; Math Mixed Training</td><td>-</td><td>400B</td><td>150B</td><td>17.6%</td><td>12.1%</td><td>36.3%</td><td>19.7%</td><td>13.5%</td></tr></table>

Table 6 | Investigation of how code affects mathematical reasoning under different training settings. We experiment with DeepSeek-LLM 1.3B, and evaluate its mathematical reasoning performance without and with tool use via few-shot chain-of-thought prompting and few-shot program-of-thought prompting, respectively.



表 6｜不同训练设定下代码如何影响数学推理(DeepSeek-LLM 1.3B; 无工具用 few-shot CoT, 用工具用 few-shot PoT).

improves models’ ability to do mathematical reasoning both with and without tool use.



提升「用工具 / 不用工具」两类数学推理.

To study how code training affects mathematical reasoning, we experimented with the following two-stage training and one-stage training settings:



为研究代码训练对数学的影响, 做了两阶段与一阶段对照:

**Two-Stage Training 两阶段训练**

• **Code Training for 400B Tokens** → **Math Training for 150B Tokens**: We train DeepSeek-LLM 1.3B for 400B code tokens followed by 150B math tokens;



• **代码 400B → 数学 150B**;

• **General Training for 400B Tokens** → **Math Training for 150B Tokens**: As a control experiment, we also experiment with general tokens (sampled from a large-scale general corpus created by DeepSeek-AI) instead of code tokens in the first stage of training, in an attempt to investigate the advantages of code tokens over general tokens in improving mathematical reasoning.



• **通用 400B → 数学 150B**(对照: 第一阶段用通用 token 而非代码, 看代码相对通用是否更利于数学).

**One-Stage Training 一阶段训练**

• **Math Training for 150B Tokens**: We train DeepSeek-LLM 1.3B for 150B math tokens;



• **纯数学 150B**;

• **Training on a mixture of 400B Code Tokens and 150B Math Tokens**: Math training following code training degrades coding performance. We investigate whether code tokens, when mixed with math tokens for one-stage training, would still improve mathematical reasoning and also alleviate the problem of catastrophic forgetting.



• **代码 400B + 数学 150B 混合**: 两阶段「先代码后数学」会伤代码能力; 看一阶段混合是否仍抬数学并缓解灾难性遗忘.

**Results** Table 6 and Table 7 demonstrate the downstream performance under different training settings.



**结果**: 表 6, 表 7 给出各设定下游表现.

Code training benefits program-aided mathematical reasoning, both under the two-stage training and one-stage training settings. As shown in Table 6, under the two-stage training setting, code training alone already significantly enhances the ability to solve GSM8K and MATH problems using Python. Math training in the second stage yields further improvements. Interestingly, under the one-stage training setting, mixing code tokens and math tokens effectively mitigates the issue of catastrophic forgetting that arises from two-stage training, and also synergizes coding (Table 7) and program-aided mathematical reasoning (Table 6).



无论两阶段还是一阶段, 代码训练都有利于程序辅助数学. 表 6: 两阶段里, 仅代码已明显抬 GSM8K/MATH 的 Python 解题, 第二阶段数学再涨. 一阶段混合代码与数学, 能缓解两阶段的灾难性遗忘, 并协同代码(表 7)与程序辅助数学(表 6).

<!-- page 17 of 30 -->

<table><tr><td rowspan="2">Training Setting</td><td colspan="3">Training Tokens</td><td rowspan="2">MMLU</td><td rowspan="2">BBH</td><td rowspan="2">HumanEval (Pass@1)</td><td rowspan="2">MBPP (Pass@1)</td></tr><tr><td>General</td><td>Code</td><td>Math</td></tr><tr><td>No Continual Training</td><td>-</td><td>-</td><td>-</td><td>24.5%</td><td>28.1%</td><td>12.2%</td><td>13.0%</td></tr><tr><td colspan="8">Two-Stage Training</td></tr><tr><td>Stage 1: General Training</td><td>400B</td><td>-</td><td>-</td><td>25.9%</td><td>27.7%</td><td>15.2%</td><td>13.6%</td></tr><tr><td>Stage 2: Math Training</td><td>-</td><td>-</td><td>150B</td><td>33.1%</td><td>32.7%</td><td>12.8%</td><td>13.2%</td></tr><tr><td>Stage 1: Code Training</td><td>-</td><td>400B</td><td>-</td><td>25.0%</td><td>31.5%</td><td>25.0%</td><td>40.0%</td></tr><tr><td>Stage 2: Math Training</td><td>-</td><td>-</td><td>150B</td><td>36.2%</td><td>35.3%</td><td>12.2%</td><td>17.0%</td></tr><tr><td colspan="8">One-Stage Training</td></tr><tr><td>Math Training</td><td>-</td><td>-</td><td>150B</td><td>32.3%</td><td>32.5%</td><td>11.6%</td><td>13.2%</td></tr><tr><td>Code &amp; Math Mixed Training</td><td>-</td><td>400B</td><td>150B</td><td>33.5%</td><td>35.6%</td><td>29.3%</td><td>39.4%</td></tr></table>

Table 7 | Investigation of how different settings of code and math training affect model performance of language understanding, reasoning, and coding. We experiment with DeepSeek-LLM 1.3B. We evaluate the models on MMLU and BBH using few-shot chain-of-thought prompting. On HumanEval and MBPP, we conduct zero-shot and few-shot evaluations, respectively.



表 7｜代码与数学不同设定对理解, 推理, 代码的影响(1.3B; MMLU/BBH few-shot CoT; HumanEval 零样本, MBPP few-shot).

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td rowspan="2">ArXiv Corpus</td><td colspan="5">English Benchmarks</td><td colspan="3">Chinese Benchmarks</td></tr><tr><td>GSM8K</td><td>MATH</td><td>OCW</td><td>SAT</td><td>MMLU STEM</td><td>CMATH</td><td>Gaokao MathCloze</td><td>Gaokao MathQA</td></tr><tr><td rowspan="3">DeepSeek-LLM</td><td rowspan="3">1.3B</td><td>No Math Training</td><td>2.9%</td><td>3.0%</td><td>2.9%</td><td>15.6%</td><td>19.5%</td><td>12.3%</td><td>0.8%</td><td>17.9%</td></tr><tr><td>MathPile</td><td>2.7%</td><td>3.3%</td><td>2.2%</td><td>12.5%</td><td>15.7%</td><td>1.2%</td><td>0.0%</td><td>2.8%</td></tr><tr><td>ArXiv-RedPajama</td><td>3.3%</td><td>3.4%</td><td>4.0%</td><td>9.4%</td><td>9.0%</td><td>7.4%</td><td>0.8%</td><td>2.3%</td></tr><tr><td rowspan="3">DeepSeek-Coder-Base-v1.5</td><td rowspan="3">7B</td><td>No Math Training</td><td>29.0%</td><td>12.5%</td><td>6.6%</td><td>40.6%</td><td>38.1%</td><td>45.9%</td><td>5.9%</td><td>21.1%</td></tr><tr><td>MathPile</td><td>23.6%</td><td>11.5%</td><td>7.0%</td><td>46.9%</td><td>35.8%</td><td>37.9%</td><td>4.2%</td><td>25.6%</td></tr><tr><td>ArXiv-RedPajama</td><td>28.1%</td><td>11.1%</td><td>7.7%</td><td>50.0%</td><td>35.2%</td><td>42.6%</td><td>7.6%</td><td>24.8%</td></tr></table>

Table 8 | Effect of math training on different arXiv datasets. Model performance is evaluated with few-shot chain-of-thought prompting.



表 8｜不同 arXiv 语料上「数学训练」的效果(few-shot CoT).

| ArXiv Corpus m | iniF2F-valid | miniF2F-test |
| --- | --- | --- |
| No Math Training | 20.1% | 21.7% |
| MathPile | 16.8% | 16.4% |
| ArXiv-RedPajama | 14.8% | 11.9% |

Table 9 | Effect of math training on different arXiv corpora, the base model being DeepSeek-Coder-Base-v1.5 7B. We evaluate informal-to-formal proving in Isabelle.



表 9｜不同 arXiv 语料对形式化证明的影响(基座 Coder-Base-v1.5 7B, Isabelle informal-to-formal).

Code training also improves mathematical reasoning without tool use. Under the two-stage training setting, the initial stage of code training already results in moderate enhancements. It also boosts the efficiency of the subsequent math training, eventually leading to the best performance. However, combining code tokens and math tokens for one-stage training compromises mathematical reasoning without tool use. One conjecture is that DeepSeek-LLM 1.3B, due to its limited scale, lacks the capacity to fully assimilate both code and mathematical data simultaneously.



不用工具的数学推理也会受益. 两阶段: 第一阶段代码已有中等提升, 并加速后续数学训练, 最终最好. 但一阶段把代码与数学混在一起, 会牺牲无工具数学-- 作者猜测 1.3B 容量有限, 吃不下两者同时灌入.

#### 5.1.2. ArXiv Papers Seem Ineffective in Improving Mathematical Reasoning arXiv 论文似乎无助于抬数学推理

ArXiv papers are commonly included as a component of math pre-training data (Azerbayev et al., 2023; Lewkowycz et al., 2022a; Polu and Sutskever, 2020; Wang et al., 2023c). However,



arXiv 论文常被放进数学预训练. 然而

<!-- page 18 of 30 -->

detailed analysis regarding their impact on mathematical reasoning has not been extensively conducted. Perhaps counter-intuitively, according to our experiments, arXiv papers seem ineffective in improving mathematical reasoning. We experiment with models of different sizes, including DeepSeek-LLM 1.3B and DeepSeek-Coder-Base-v1.5 7B (Guo et al., 2024), using arXiv corpora that underwent varied processing pipelines:



对其影响的细分析并不多. 实验里-- 或许反直觉--arXiv 似乎帮不上数学推理. 在 1.3B 与 Coder-Base-v1.5 7B 上, 试了不同处理管线的 arXiv 语料:

• **MathPile** (Wang et al., 2023c): an 8.9B-token corpus developed with cleaning and filtering heuristic rules, over 85% of which are scientific arXiv papers;



• **MathPile**: 8.9B, 清洗过滤启发式, 超 85% 为科学 arXiv;

• **ArXiv-RedPajama** (Computer, 2023): the entirety of arXiv LaTeX files with preambles, comments, macros, and bibliographies removed, totaling 28.0B tokens.



• **ArXiv-RedPajama**: 全量 arXiv LaTeX, 去掉 preamble / 注释 / 宏 / 参考文献, 共 28.0B token.

In our experiments, we separately train DeepSeek-LLM 1.3B for 150B tokens and DeepSeek-Coder-Base-v1.5 7B for 40B tokens on each arXiv corpus. It seems that arXiv papers are ineffective in improving mathematical reasoning. When trained on a arXiv-only corpus, both models display no notable improvements or even deterioration across various mathematical benchmarks of different complexities employed in this study. These benchmarks include quantitative reasoning datasets like GSM8K and MATH (Table 8), multiple-choice challenges like MMLU-STEM (Table 8), and formal mathematics like miniF2F (Table 9).



1.3B 各训 150B token, 7B 各训 40B. 纯 arXiv 上, 两模型在本文各难度数学基准上无明显提升甚至变差, 含 GSM8K/MATH(表 8), MMLU-STEM(表 8), miniF2F(表 9).

However, this conclusion has its limitations and should be taken with a grain of salt. We have not yet studied:



结论有局限, 需谨慎: 尚未研究

• The impact of arXiv tokens on specific math-related tasks not included in this research, such as informalization of theorems which is to convert formal statements or proofs to their informal versions;



• arXiv 对本文未覆盖任务(如定理 informalization: 形式陈述/证明转非形式)的影响;

• The effect of arXiv tokens when combined with other types of data;



• 与其他数据混合时的效应;

• Whether the benefits of arXiv papers would manifest themselves at a larger model scale.



• 更大模型尺度上是否会显现收益.

Thus, further exploration is required, which we leave for future studies.



仍需继续探索, 留待后续.

### 5.2. Insights of Reinforcement Learning 强化学习洞见

#### 5.2.1. Towards to a Unified Paradigm 迈向统一范式

In this section, we provide a unified paradigm to analyze different training methods, such as SFT, RFT, DPO, PPO, GRPO, and further conduct experiments to explore the factors of the unified paradigm. Generally, the gradient with respect to the parameter 𝜃 of a training method can be written as:



本节用统一范式分析 SFT, RFT, DPO, PPO, GRPO, 并实验拆解要素. 一般地, 相对参数 $\theta$ 的梯度可写为:

$$
\nabla_ {\theta} \mathcal {J} _ {\mathcal {A}} (\theta) = \mathbb {E} [ \underbrace {(q , o) \sim \mathcal {D}} _ {\text {Data Source}} ] \left(\frac {1}{| o |} \sum_ {t = 1} ^ {| o |} \underbrace {G C _ {\mathcal {A}} (q , o , t , \pi_ {r f})} _ {\text {Gradient Coefficient}} \nabla_ {\theta} \log \pi_ {\theta} (o _ {t} | q, o _ {<   t})\right). \tag{5}
$$

There exist three key components: 1) Data Source $\mathcal { D } , $ which determines the training data; 2) Reward Function $\pi _ { r f } , $ which is the source of the training reward signal; 3) Algorithm A: which processes the training data and the reward signal to the gradient coefficient 𝐺𝐶 that determines the magnitude of the penalty or reinforcement for the data. We analyze several representative methods based on such a unified paradigm:



三要素: 1)数据源 $\mathcal{D}$; 2)奖励函数 $\pi_{rf}$(训练信号来源); 3)算法 $\mathcal{A}$, 把数据与奖励加工成梯度系数 $GC$, 决定惩罚/强化幅度. 据此分析若干代表方法:

<!-- page 19 of 30 -->

| Methods | Data Source | Reward Function | Gradient Coefficient |
| --- | --- | --- | --- |
| SFT | 𝑞, 𝑜 ∼ 𝑃<sub>𝑠𝑓𝑡</sub>(𝑄, 𝑂) | - | 1 |
| RFT | 𝑞 ∼ 𝑃<sub>𝑠𝑓𝑡</sub>(𝑄), 𝑜 ∼ 𝜋<sub>𝑠𝑓𝑡</sub>(𝑂\|𝑞) | Rule | Equation 10 |
| DPO | 𝑞 ∼ 𝑃<sub>𝑠𝑓𝑡</sub>(𝑄), 𝑜+, 𝑜- ∼ 𝜋<sub>𝑠𝑓𝑡</sub>(𝑂\|𝑞) | Rule | Equation 14 |
| Online RFT | 𝑞 ∼ 𝑃<sub>𝑠𝑓𝑡</sub>(𝑄), 𝑜 ∼ 𝜋𝜃(𝑂\|𝑞) | Rule | Equation 10 |
| PPO | 𝑞 ∼ 𝑃<sub>𝑠𝑓𝑡</sub>(𝑄), 𝑜 ∼ 𝜋𝜃(𝑂\|𝑞) | Model | Equation 18 |
| GRPO | 𝑞 ∼ 𝑃𝑠𝑓𝑡(𝑄), {𝑜𝑖}𝐺𝑖=1 ∼ 𝜋𝜃(𝑂\|𝑞) | Model | Equation 21 |

Table 10 | The data source and gradient coefficient of different methods. $P _ { s f t }$ denotes the data distribution of supervised fine-tuning datasets. $\pi _ { \theta _ { s f t } }$ and $\pi _ { \theta }$ denote the supervised fine-tuned model and the real-time policy model during the online training process, respectively.



表 10｜各方法的数据源与梯度系数. $P_{sft}$ 为 SFT 数据分布; $\pi_{\theta_{sft}}$ 为 SFT 模型, $\pi_\theta$ 为在线训练中的实时策略.

![Chart block](images/p19-figure-5-performance-of-the-deepseekmath-instruct-1-3b.png)

Figure 5 | Performance of the DeepSeekMath-Instruct 1.3B model, which was further trained using various methods, on two benchmarks.



图 5｜DeepSeekMath-Instruct 1.3B 用不同方法继续训后在两基准上的表现.

• **Supervised Fine-tuning (SFT)**: SFT fine-tunes pretrained model on human selected SFT data.



• **SFT**: 在人工选的 SFT 数据上微调预训练模型.

• **Rejection Sampling Fine-tuning (RFT)**: RFT further fine-tunes the SFT model on the filtered outputs sampled from the SFT model based on SFT questions. RFT filters the outputs based on the correctness of their answers.



• **RFT**: 用 SFT 模型对 SFT 题采样, 按答案对错过滤后再微调.

• **Direct Preference Optimization (DPO)**: DPO further refines the SFT model by fine-tuning it on augmented outputs sampled from the SFT model, using pair-wise DPO loss.



• **DPO**: 对 SFT 模型采样的增强输出, 用成对 DPO 损失再精炼.

• **Online Rejection Sampling Fine-tuning (Online RFT)**: Different from RFT, Online RFT initiates the policy model using the SFT model and refines it by fine-tuning with the augmented outputs sampled from the real-time policy model.



• **Online RFT**: 与 RFT 不同, 策略从 SFT 初始化, 用实时策略采样的增强输出继续微调.

• **PPO/GRPO**: PPO/GRPO initializes the policy model using the SFT model and reinforces it with the outputs sampled from the real-time policy model.



• **PPO/GRPO**: 策略从 SFT 初始化, 用实时策略采样输出做强化.

We summarize the components of these methods in Table 10. Please refer to Appendix A. 1 for a more detailed derivation process.



各方法组件见表 10; 更细推导见附录 A. 1.

**Observation about Data Source** We divide the data source into two categories, online sampling, and offline sampling. Online sampling denotes that the training data is from the exploration results of the real-time training policy model, while offline sampling denotes that the



**关于数据源**: 分成在线采样与离线采样. 在线 = 训练数据来自实时策略探索; 离线 =

<!-- page 20 of 30 -->

![Chart block](images/p20-figure-6-performance-of-iterative-reinforcement.png)

Figure 6 | Performance of iterative reinforcement learning with DeepSeekMath-Instruct 7B on two benchmarks.



图 6｜DeepSeekMath-Instruct 7B 上迭代强化学习在两基准上的表现.

training data is from the sampling results of the initial SFT model. RFT and DPO follow the offline style, while Online RFT and GRPO follow the online style.



来自初始 SFT 的采样. RFT, DPO 偏离线; Online RFT, GRPO 偏在线.

As shown in Figure 5, we find that the Online RFT significantly outperforms RFT on two benchmarks. Specifically, Online RFT is comparable to RFT in the early stage of training but gains an absolute advantage in the later stage, demonstrating the superiority of online training. This is intuitive, as in the initial stage, the actor and the SFT model exhibit close resemblance, with the sampled data revealing only minor differences. In the later stage, however, the data sampled from the actor will exhibit more significant differences, and real-time data sampling will offer greater advantages.



图 5: Online RFT 明显优于 RFT-- 前期差不多, 后期拉开, 说明在线更强. 直觉上前期 actor 与 SFT 接近, 样本差异小; 后期差异变大, 实时采样优势更明显.

**Observation about Gradient Coefficient** The algorithm processes the reward signal to the gradient coefficient to update the model parameter. We divide the reward function as ‘Rule and ‘Model’ in our experiments. Rule refers to judging the quality of a response based on the correctness of the answer, and Model denotes that we train a reward model to score each response. The training data of the reward model is based on the rule judgment. Equations 10 and 21 highlight a key difference between GRPO and Online RFT: GRPO uniquely adjusts its gradient coefficient based on the reward value provided by the reward model. This allows for differential reinforcement and penalization of responses according to their varying magnitudes. In contrast, Online RFT lacks this feature; it does not penalize incorrect responses and uniformly reinforces all responses with correct answers at the same level of intensity.



**关于梯度系数**: 算法把奖励变成梯度系数再更新参数. 实验里奖励分 Rule 与 Model: Rule 看答案对错; Model 用奖励模型打分(其训练仍基于规则判定). 式 10 与式 21 点出 GRPO 相对 Online RFT 的关键: GRPO 按奖励模型分值调节梯度系数, 正负强化可分档; Online RFT 不惩罚错答, 对所有对答一视同仁.

As demonstrated in Figure 5, GRPO surpasses online RFT, thereby highlighting the efficiency of altering positive and negative gradient coefficients. In addition, GRPO+PS shows superior performance compared to GRPO+OS, indicating the benefits of using fine-grained, step-aware gradient coefficients. Furthermore, we explore the iterative RL, in our experiments, we conduct two rounds of iteration. As shown in Figure 6, we notice that the iterative RL significantly improves the performance, especially at the first iteration.



图 5: GRPO 超过 Online RFT, 说明调节正负梯度系数有效; GRPO+PS 优于 GRPO+OS, 说明细粒度, 步感知的梯度系数有益. 迭代 RL 做了两轮(图 6), 提升明显, 尤以第一轮为甚.

<!-- page 21 of 30 -->

![Chart block](images/p21-figure-7-the-maj-k-and-pass-k-of-sft-and-rl.png)

Figure 7 | The Maj@K and Pass@K of SFT and RL DeepSeekMath 7B on GSM8K and MATH (temperature 0.7). It was noted that RL enhances Maj@K but not Pass@K.



图 7｜SFT 与 RL 版 DeepSeekMath 7B 在 GSM8K / MATH 上的 Maj@K 与 Pass@K(temperature 0.7). RL 抬 Maj@K, 不抬 Pass@K.

#### 5.2.2. Why RL Works?



5.2.2. RL 为何有效?

In this paper, we conduct reinforcement learning based on a subset of instruction tuning data, and it achieves significant performance enhancement upon the instruction tuning model. To further explain why reinforcement learning works. We evaluate the Pass@K and Maj@K accuracy of the Instruct and RL models on two benchmarks. As shown in Figure 7, RL enhances Maj@K’s performance but not Pass@K. These findings indicate that RL enhances the model’s overall performance by rendering the output distribution more robust, in other words, **it seems that the improvement is attributed to boosting the correct response from TopK rather than the enhancement of fundamental capabilities.** Similarly, (Wang et al., 2023a) identified a **misalignment problem** in reasoning tasks within the SFT model, showing that the reasoning performance of SFT models can be improved through a series of preference alignment strategies (Song et al., 2023; Wang et al., 2023a; Yuan et al., 2023b).



本文 RL 只用指令数据子集, 却在 Instruct 上大幅涨分. 用 Pass@K 与 Maj@K 解释: 图 7 显示 RL 抬 Maj@K, 不抬 Pass@K-- 更像是让输出分布更稳, **把正确答从 TopK 里抬上来, 而非抬基础能力**. Wang et al. (2023a) 也指出 SFT 推理里的错位问题, 可用偏好对齐类方法改善.

解释: Pass@K = K 次采样里至少一次对; Maj@K = K 次里多数票对. Pass@K 不动, Maj@K 涨, 说明「会做的题集合」未必变大, 而是「更常把对的那条抽到前面」.

#### 5.2.3. How to Achieve More Effective RL?



5.2.3. 如何做到更有效的 RL?

We demonstrate RL works pretty well in mathematical reasoning tasks. We also provide a unified paradigm to understand different representative training methods. Within this paradigm, all methods are conceptualized as either direct or simplified RL techniques. As summarized in Equation 5, there exist three key components: Data Source, Algorithm, and Reward Function. We provide some potential future directions about the three components.



数学推理上 RL 效果很好; 统一范式里各方法都是直接或简化的 RL. 式 (5) 三要素-- 数据源, 算法, 奖励函数-- 各自有后续方向:

**Data Source** Data source is the raw material of all training methods. In the context of RL, we specifically refer to the data source as the unlabeled questions with the outputs sampled from the policy model. In this paper, we only use the questions from the instruction tuning stage and a naive nucleus sampling to sample outputs. We think this is a potential reason that our RL pipeline only improves the Maj@K performance. In the future, we will explore our RL pipeline on out-of-distribution question prompts, in conjunction with **advanced sampling (decoding) strategies**, like those based on tree-search methods (Yao et al., 2023). Also, the **efficient inference techniques** (Kwon et al., 2023; Leviathan et al., 2023; Xia et al., 2023, 2024), which determines



**数据源**: RL 语境下指无标注题 + 策略采样输出. 本文只用指令阶段的题与朴素 nucleus 采样, 这可能是只抬 Maj@K 的原因之一. 未来要试分布外题干, 并配合**高级采样/解码**(如树搜索); **高效推理**(决定

<!-- page 22 of 30 -->

the exploration efficiency of policy models, also play an exceedingly important role.



策略探索效率)同样关键.

**Algorithms** Algorithms process the data and reward signal to the gradient coefficient to update the model parameter. Based on Equation 5, to some extent, all methods now fully **TRUST** the signal of the reward function to increase or decrease the conditional probability of a certain token. However, it is impossible to ensure the reward signal is always reliable, especially in extremely complex tasks. For example, even the PRM800K datasets (Lightman et al., 2023), which have been carefully annotated by well-trained annotators, still contain approximately 20% of incorrectly annotations<sup>7</sup>. To this end, we will explore the reinforcement learning algorithm that is robust against noisy reward signals. We believe such **WEAK-TO-STRONG** (Burns et al., 2023) alignment methods will bring a fundamental change to the learning algorithms.



**算法**: 把数据与奖励变成梯度系数. 现有方法在相当程度上**完全信任**奖励信号来加减某 token 条件概率; 但奖励不可能永远可靠-- 即便仔细标注的 PRM800K 仍约 20% 标错<sup>7</sup>. 因此要探索对噪声奖励稳健的 RL, 作者认为 **weak-to-strong** 对齐会从根本上改写学习算法.

**Reward Function** Reward function is the source of the training signal. In RL, the reward function is usually the neural reward model. We think there exist three important directions for reward models: 1) **How to enhance the generalization ability of the reward model.** The reward model must be effectively generalized to handle out-of-distribution questions and advanced decoding outputs; otherwise, reinforcement learning may merely stabilize the distribution of LLMs rather than improve their fundamental capabilities; 2) **How to reflect the uncertainty of reward model.** The uncertainty could potentially act as a linking bridge between the weak reward model and the weak-to-strong learning algorithms; 3) **How to efficiently build highquality process reward models** that can provide fine-grained training signals for the reasoning process (Lightman et al., 2023; Wang et al., 2023b).



**奖励函数**: 通常是神经奖励模型. 三点方向: 1)**提高奖励模型泛化**-- 要能扛分布外题与高级解码输出, 否则 RL 可能只是稳住分布而非抬基础能力; 2)**刻画奖励不确定性**-- 可作为弱奖励与 weak-to-strong 算法之间的桥梁; 3)**高效构建高质量过程奖励模型**, 为推理过程提供细粒度信号.

## 6. Conclusion, Limitation, and Future Work 结论, 局限与未来工作

We present DeepSeekMath, which outperforms all open-source models on the competitionlevel MATH benchmark and approaches the performance of closed models. DeepSeekMath is initialized with DeepSeek-Coder-v1.5 7B and undergoes continual training for 500B tokens, with a significant component of the training data being 120B math tokens sourced from Common Crawl. Our extensive ablation study shows web pages offer significant potential for high-quality mathematical data, while arXiv may not as beneficial as we expected. We introduce Group Relative Policy Optimization (GRPO), a variant of Proximal Policy Optimization (PPO), which can notably improve mathematical reasoning capabilities with less memory consumption. The experiment results show that GRPO is effective even if DeepSeekMath-Instruct 7B has reached a high score on benchmarks. We also provide a unified paradigm to understand a series of methods and summarize several potential directions for more effective reinforcement learning.



本文提出 DeepSeekMath: 竞赛级 MATH 上超过全部开源, 逼近闭源. 从 DeepSeek-Coder-v1.5 7B 初始化, 续训 500B token, 其中重要一块是来自 CC 的 120B 数学 token. 消融表明网页有很大高质量数学潜力, arXiv 未必如预期有用. 提出 GRPO(PPO 变体), 以更少显存明显抬数学推理; 即便 Instruct 已很高分, GRPO 仍有效. 另给出统一范式理解一系列方法, 并归纳更有效 RL 的方向.

Although DeepSeekMath achieves impressive scores on quantitative reasoning benchmarks, its capability on geometry and theorem-proof are relatively weaker than closed models. For instance, in our dry run, the model cannot handle problems related to triangles and ellipses, which may indicate data selection bias in pre-training and fine-tuning. In addition, restricted by the model scale, DeepSeekMath is worse than GPT-4 on few-shot capability. GPT-4 could improve its performance with few-shot inputs, while DeepSeekMath shows similar performance in zero-shot and few-shot evaluation. In the future, we will further improve our engineered data selection pipeline to construct more high-quality pre-trained corpus. In addition, we will explore the potential directions (Section 5.2.3) for more effective reinforcement learning of LLMs.



定量推理分数好看, 但几何与定理证明相对闭源偏弱; 干跑里三角, 椭圆类题搞不定, 可能反映预训练/微调的数据选择偏差. 受规模限制, few-shot 弱于 GPT-4--GPT-4 能靠 few-shot 再涨, DeepSeekMath 零样本与 few-shot 差不多. 未来会继续改进数据筛选管线, 并探索 §5.2.3 里更有效的 LLM 强化学习.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>7</sup>[https://github. com/openai/prm800k/issues/12#issuecomment-1728491852](https://github. com/openai/prm800k/issues/12#issuecomment-1728491852)</span></small>

<!-- page 23 of 30 -->

## References

R. Anil, S. Borgeaud, Y. Wu, J. Alayrac, J. Yu, R. Soricut, J. Schalkwyk, A. M. Dai, A. Hauth, K. Millican, D. Silver, S. Petrov, M. Johnson, I. Antonoglou, J. Schrittwieser, A. Glaese, J. Chen, E. Pitler, T. P. Lillicrap, A. Lazaridou, O. Firat, J. Molloy, M. Isard, P. R. Barham, T. Hennigan, B. Lee, F. Viola, M. Reynolds, Y. Xu, R. Doherty, E. Collins, C. Meyer, E. Rutherford, E. Moreira, K. Ayoub, M. Goel, G. Tucker, E. Piqueras, M. Krikun, I. Barr, N. Savinov, I. Danihelka, B. Roelofs, A. White, A. Andreassen, T. von Glehn, L. Yagati, M. Kazemi, L. Gonzalez, M. Khalman, J. Sygnowski, and et al. Gemini: A family of highly capable multimodal models. CoRR, abs/2312.11805, 2023. doi: 10.48550/ARXIV. 2312.11805. URL [https://doi. org/10.48550/arXiv. 2312.11805](https://doi. org/10.48550/arXiv. 2312.11805).

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models. arXiv preprint arXiv: 2108.07732, 2021.

Z. Azerbayev, H. Schoelkopf, K. Paster, M. D. Santos, S. McAleer, A. Q. Jiang, J. Deng, S. Biderman, and S. Welleck. Llemma: An open language model for mathematics. arXiv preprint arXiv: 2310.10631, 2023.

J. Bai, S. Bai, Y. Chu, Z. Cui, K. Dang, X. Deng, Y. Fan, W. Ge, Y. Han, F. Huang, et al. Qwen technical report. arXiv preprint arXiv: 2309.16609, 2023.

C. Burns, P. Izmailov, J. H. Kirchner, B. Baker, L. Gao, L. Aschenbrenner, Y. Chen, A. Ecoffet, M. Joglekar, J. Leike, et al. Weak-to-strong generalization: Eliciting strong capabilities with weak supervision. arXiv preprint arXiv: 2312.09390, 2023.

ChatGLM3 Team. Chatglm3 series: Open bilingual chat llms, 2023. URL [https://github. com/THUDM/ChatGLM3](https://github. com/THUDM/ChatGLM3).

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021. URL [https://arxiv. org/abs/2107.03374](https://arxiv. org/abs/2107.03374).

W. Chen, X. Ma, X. Wang, and W. W. Cohen. Program of thoughts prompting: Disentangling computation from reasoning for numerical reasoning tasks. CoRR, abs/2211.12588, 2022. doi: 10.48550/ARXIV. 2211.12588. URL [https://doi. org/10.48550/arXiv. 2211.12588](https://doi. org/10.48550/arXiv. 2211.12588).

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv: 2110.14168, 2021.

T. Computer. Redpajama: an open dataset for training large language models, Oct. 2023. URL [https://github. com/togethercomputer/RedPajama-Data](https://github. com/togethercomputer/RedPajama-Data).

DeepSeek-AI. Deepseek LLM: scaling open-source language models with longtermism. CoRR, abs/2401.02954, 2024. doi: 10.48550/ARXIV. 2401.02954. URL [https://doi. org/10.48550/arXiv. 2401.02954](https://doi. org/10.48550/arXiv. 2401.02954).

<!-- page 24 of 30 -->

Z. Du, Y. Qian, X. Liu, M. Ding, J. Qiu, Z. Yang, and J. Tang. Glm: General language model pretraining with autoregressive blank infilling. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 320–335, 2022.

L. Gao, A. Madaan, S. Zhou, U. Alon, P. Liu, Y. Yang, J. Callan, and G. Neubig. PAL: programaided language models. In A. Krause, E. Brunskill, K. Cho, B. Engelhardt, S. Sabato, and J. Scarlett, editors, International Conference on Machine Learning, ICML 2023, 23-29 July 2023, Honolulu, Hawaii, USA, volume 202 of Proceedings of Machine Learning Research, pages 10764–10799. PMLR, 2023. URL [https://proceedings. mlr. press/v202/gao23f. html](https://proceedings. mlr. press/v202/gao23f. html).

Z. Gou, Z. Shao, Y. Gong, Y. Shen, Y. Yang, M. Huang, N. Duan, and W. Chen. Tora: A toolintegrated reasoning agent for mathematical problem solving. CoRR, abs/2309.17452, 2023. doi: 10.48550/ARXIV. 2309.17452. URL [https://doi. org/10.48550/arXiv. 2309.17452](https://doi. org/10.48550/arXiv. 2309.17452).

D. Guo, Q. Zhu, D. Yang, Z. Xie, K. Dong, W. Zhang, G. Chen, X. Bi, Y. Wu, Y. K. Li, F. Luo, Y. Xiong, and W. Liang. Deepseek-coder: When the large language model meets programming – the rise of code intelligence, 2024.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv: 2009.03300, 2020.

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv: 2103.03874, 2021.

High-flyer. Hai-llm: 高效且轻量的大模型训练工具, 2023. URL [https://www. high-flyer. cn/en/blog/hai-llm](https://www. high-flyer. cn/en/blog/hai-llm).

Inflection AI. Inflection-2, 2023. URL [https://inflection. ai/inflection-2](https://inflection. ai/inflection-2).

A. Q. Jiang, S. Welleck, J. P. Zhou, W. Li, J. Liu, M. Jamnik, T. Lacroix, Y. Wu, and G. Lample. Draft, sketch, and prove: Guiding formal theorem provers with informal proofs. arXiv preprint arXiv: 2210.12283, 2022.

A. Q. Jiang, A. Sablayrolles, A. Mensch, C. Bamford, D. S. Chaplot, D. d. l. Casas, F. Bressand, G. Lengyel, G. Lample, L. Saulnier, et al. Mistral 7b. arXiv preprint arXiv: 2310.06825, 2023.

A. Joulin, E. Grave, P. Bojanowski, M. Douze, H. Jégou, and T. Mikolov. Fasttext. zip: Compressing text classification models. arXiv preprint arXiv: 1612.03651, 2016.

W. Kwon, Z. Li, S. Zhuang, Y. Sheng, L. Zheng, C. H. Yu, J. E. Gonzalez, H. Zhang, and I. Stoica. Efficient memory management for large language model serving with pagedattention. In Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles, 2023.

Y. Leviathan, M. Kalman, and Y. Matias. Fast inference from transformers via speculative decoding. In International Conference on Machine Learning, pages 19274–19286. PMLR, 2023.

A. Lewkowycz, A. Andreassen, D. Dohan, E. Dyer, H. Michalewski, V. Ramasesh, A. Slone, C. Anil, I. Schlag, T. Gutman-Solo, et al. Solving quantitative reasoning problems with language models. Advances in Neural Information Processing Systems, 35: 3843–3857, 2022a.

<!-- page 25 of 30 -->

A. Lewkowycz, A. Andreassen, D. Dohan, E. Dyer, H. Michalewski, V. V. Ramasesh, A. Slone, C. Anil, I. Schlag, T. Gutman-Solo, Y. Wu, B. Neyshabur, G. Gur-Ari, and V. Misra. Solving quantitative reasoning problems with language models. In S. Koyejo, S. Mohamed, A. Agarwal, D. Belgrave, K. Cho, and A. Oh, editors, Advances in Neural Information Processing Systems 35: Annual Conference on Neural Information Processing Systems 2022, NeurIPS 2022, New Orleans, LA, USA, November 28 - December 9, 2022, 2022b. URL [http: //papers. nips. cc/paper\_files/paper/2022/hash/18abbeef8cfe9203fdf9053c9c4fe191-Abstract-Conference. html](http: //papers. nips. cc/paper_files/paper/2022/hash/18abbeef8cfe9203fdf9053c9c4fe191-Abstract-Conference. html).

H. Lightman, V. Kosaraju, Y. Burda, H. Edwards, B. Baker, T. Lee, J. Leike, J. Schulman, I. Sutskever, and K. Cobbe. Let’s verify step by step. arXiv preprint arXiv: 2305.20050, 2023.

I. Loshchilov and F. Hutter. Decoupled weight decay regularization. arXiv preprint arXiv: 1711.05101, 2017.

H. Luo, Q. Sun, C. Xu, P. Zhao, J. Lou, C. Tao, X. Geng, Q. Lin, S. Chen, and D. Zhang. Wizardmath: Empowering mathematical reasoning for large language models via reinforced evol-instruct. arXiv preprint arXiv: 2308.09583, 2023.

S. Mishra, M. Finlayson, P. Lu, L. Tang, S. Welleck, C. Baral, T. Rajpurohit, O. Tafjord, A. Sabharwal, P. Clark, and A. Kalyan. LILA: A unified benchmark for mathematical reasoning. In Y. Goldberg, Z. Kozareva, and Y. Zhang, editors, Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, EMNLP 2022, Abu Dhabi, United Arab Emirates, December 7-11, 2022, pages 5807–5832. Association for Computational Linguistics, 2022. doi: 10.18653/V1/2022. EMNLP-MAIN. 392. URL [https://doi. org/10.18653/v1/2022. emnlp-main. 392](https://doi. org/10.18653/v1/2022. emnlp-main. 392).

X. Nguyen, W. Zhang, X. Li, M. M. Aljunied, Q. Tan, L. Cheng, G. Chen, Y. Deng, S. Yang, C. Liu, H. Zhang, and L. Bing. Seallms - large language models for southeast asia. CoRR, abs/2312.00738, 2023. doi: 10.48550/ARXIV. 2312.00738. URL [https://doi. org/10.48550/arXiv. 2312.00738](https://doi. org/10.48550/arXiv. 2312.00738).

OpenAI. GPT4 technical report. arXiv preprint arXiv: 2303.08774, 2023.

L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. Wainwright, P. Mishkin, C. Zhang, S. Agarwal, K. Slama, A. Ray, et al. Training language models to follow instructions with human feedback. Advances in Neural Information Processing Systems, 35: 27730–27744, 2022.

K. Paster, M. D. Santos, Z. Azerbayev, and J. Ba. Openwebmath: An open dataset of high-quality mathematical web text. CoRR, abs/2310.06786, 2023. doi: 10.48550/ARXIV. 2310.06786. URL [https://doi. org/10.48550/arXiv. 2310.06786](https://doi. org/10.48550/arXiv. 2310.06786).

L. C. Paulson. Three years of experience with sledgehammer, a practical link between automatic and interactive theorem provers. In R. A. Schmidt, S. Schulz, and B. Konev, editors, Proceedings of the 2nd Workshop on Practical Aspects of Automated Reasoning, PAAR-2010, Edinburgh, Scotland, UK, July 14, 2010, volume 9 of EPiC Series in Computing, pages 1–10. EasyChair, 2010. doi: 10.29007/TNFD. URL [https://doi. org/10.29007/tnfd](https://doi. org/10.29007/tnfd).

S. Polu and I. Sutskever. Generative language modeling for automated theorem proving. CoRR, abs/2009.03393, 2020. URL [https://arxiv. org/abs/2009.03393](https://arxiv. org/abs/2009.03393).

R. Rafailov, A. Sharma, E. Mitchell, S. Ermon, C. D. Manning, and C. Finn. Direct preference optimization: Your language model is secretly a reward model. 2023.

<!-- page 26 of 30 -->

J. Schulman. Approximating kl divergence, 2020. URL [http: //joschu. net/blog/kl-approx. html](http: //joschu. net/blog/kl-approx. html).

J. Schulman, P. Moritz, S. Levine, M. Jordan, and P. Abbeel. High-dimensional continuous control using generalized advantage estimation. arXiv preprint arXiv: 1506.02438, 2015.

J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv: 1707.06347, 2017.

F. Shi, M. Suzgun, M. Freitag, X. Wang, S. Srivats, S. Vosoughi, H. W. Chung, Y. Tay, S. Ruder, D. Zhou, D. Das, and J. Wei. Language models are multilingual chain-of-thought reasoners. In The Eleventh International Conference on Learning Representations, ICLR 2023, Kigali, Rwanda, May 1-5, 2023. OpenReview. net, 2023. URL [https://openreview. net/pdf? id=fR3wGCk-IXp](https://openreview. net/pdf? id=fR3wGCk-IXp).

F. Song, B. Yu, M. Li, H. Yu, F. Huang, Y. Li, and H. Wang. Preference ranking optimization for human alignment. arXiv preprint arXiv: 2306.17492, 2023.

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv: 2210.09261, 2022.

T. Tao. Embracing change and resetting expectations, 2023. URL [https://unlocked. microsoft. com/ai-anthology/terence-tao/](https://unlocked. microsoft. com/ai-anthology/terence-tao/).

H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale, D. Bikel, L. Blecher, C. Canton-Ferrer, M. Chen, G. Cucurull, D. Esiobu, J. Fernandes, J. Fu, W. Fu, B. Fuller, C. Gao, V. Goswami, N. Goyal, A. Hartshorn, S. Hosseini, R. Hou, H. Inan, M. Kardas, V. Kerkez, M. Khabsa, I. Kloumann, A. Korenev, P. S. Koura, M. Lachaux, T. Lavril, J. Lee, D. Liskovich, Y. Lu, Y. Mao, X. Martinet, T. Mihaylov, P. Mishra, I. Molybog, Y. Nie, A. Poulton, J. Reizenstein, R. Rungta, K. Saladi, A. Schelten, R. Silva, E. M. Smith, R. Subramanian, X. E. Tan, B. Tang, R. Taylor, A. Williams, J. X. Kuan, P. Xu, Z. Yan, I. Zarov, Y. Zhang, A. Fan, M. Kambadur, S. Narang, A. Rodriguez, R. Stojnic, S. Edunov, and T. Scialom. Llama 2: Open foundation and fine-tuned chat models. CoRR, abs/2307.09288, 2023. doi: 10.48550/arXiv. 2307.09288. URL [https://doi. org/10.48550/arXiv. 2307.09288](https://doi. org/10.48550/arXiv. 2307.09288).

T. H. Trinh, Y. Wu, Q. V. Le, H. He, and T. Luong. Solving olympiad geometry without human demonstrations. Nature, 625(7995): 476–482, 2024.

P. Wang, L. Li, L. Chen, F. Song, B. Lin, Y. Cao, T. Liu, and Z. Sui. Making large language models better reasoners with alignment. arXiv preprint arXiv: 2309.02144, 2023a.

P. Wang, L. Li, Z. Shao, R. Xu, D. Dai, Y. Li, D. Chen, Y. Wu, and Z. Sui. Math-shepherd: Verify and reinforce llms step-by-step without human annotations. CoRR, abs/2312.08935, 2023b.

Z. Wang, R. Xia, and P. Liu. Generative AI for math: Part I - mathpile: A billion-token-scale pretraining corpus for math. CoRR, abs/2312.17120, 2023c. doi: 10.48550/ARXIV. 2312.17120. URL [https://doi. org/10.48550/arXiv. 2312.17120](https://doi. org/10.48550/arXiv. 2312.17120).

J. Wei, X. Wang, D. Schuurmans, M. Bosma, B. Ichter, F. Xia, E. H. Chi, Q. V. Le, and D. Zhou. Chain-of-thought prompting elicits reasoning in large language models. In NeurIPS, 2022. URL [http: //papers. nips. cc/paper\_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference. html](http: //papers. nips. cc/paper_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference. html).

<!-- page 27 of 30 -->

T. Wei, J. Luan, W. Liu, S. Dong, and B. Wang. Cmath: Can your language model pass chinese elementary school math test?, 2023.

M. Wenzel, L. C. Paulson, and T. Nipkow. The isabelle framework. In O. A. Mohamed, C. A. Muñoz, and S. Tahar, editors, Theorem Proving in Higher Order Logics, 21st International Conference, TPHOLs 2008, Montreal, Canada, August 18-21, 2008. Proceedings, volume 5170 of Lecture Notes in Computer Science, pages 33–38. Springer, 2008. doi: 10.1007/978-3-540-7 1067-7\_7. URL [https://doi. org/10.1007/978-3-540-71067-7\_7](https://doi. org/10.1007/978-3-540-71067-7_7).

H. Xia, T. Ge, P. Wang, S.-Q. Chen, F. Wei, and Z. Sui. Speculative decoding: Exploiting speculative execution for accelerating seq2seq generation. In H. Bouamor, J. Pino, and K. Bali, editors, Findings of the Association for Computational Linguistics: EMNLP 2023, pages 3909–3925, Singapore, Dec. 2023. Association for Computational Linguistics. doi: 10.18653/v1/20 23. findings-emnlp. 257. URL [https://aclanthology. org/2023. findings-emnlp. 257](https://aclanthology. org/2023. findings-emnlp. 257).

H. Xia, Z. Yang, Q. Dong, P. Wang, Y. Li, T. Ge, T. Liu, W. Li, and Z. Sui. Unlocking efficiency in large language model inference: A comprehensive survey of speculative decoding. arXiv preprint arXiv: 2401.07851, 2024.

S. Yao, D. Yu, J. Zhao, I. Shafran, T. L. Griffiths, Y. Cao, and K. Narasimhan. Tree of thoughts: Deliberate problem solving with large language models. arXiv preprint arXiv: 2305.10601, 2023.

L. Yu, W. Jiang, H. Shi, J. Yu, Z. Liu, Y. Zhang, J. T. Kwok, Z. Li, A. Weller, and W. Liu. Metamath: Bootstrap your own mathematical questions for large language models. CoRR, abs/2309.12284, 2023. doi: 10.48550/ARXIV. 2309.12284. URL [https://doi. org/10.48550/arXiv. 2309.12284](https://doi. org/10.48550/arXiv. 2309.12284).

Z. Yuan, H. Yuan, C. Li, G. Dong, C. Tan, and C. Zhou. Scaling relationship on learning mathematical reasoning with large language models. arXiv preprint arXiv: 2308.01825, 2023a.

Z. Yuan, H. Yuan, C. Tan, W. Wang, S. Huang, and F. Huang. Rrhf: Rank responses to align language models with human feedback without tears. arXiv preprint arXiv: 2304.05302, 2023b.

X. Yue, X. Qu, G. Zhang, Y. Fu, W. Huang, H. Sun, Y. Su, and W. Chen. Mammoth: Building math generalist models through hybrid instruction tuning. CoRR, abs/2309.05653, 2023. doi: 10.48550/ARXIV. 2309.05653. URL [https://doi. org/10.48550/arXiv. 2309.05653](https://doi. org/10.48550/arXiv. 2309.05653).

K. Zheng, J. M. Han, and S. Polu. Minif2f: a cross-system benchmark for formal olympiad-level mathematics. arXiv preprint arXiv: 2109.00110, 2021.

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. AGIEval: A human-centric benchmark for evaluating foundation models. CoRR, abs/2304.06364, 2023. doi: 10.48550/arXiv. 2304.06364. URL [https://doi. org/10.48550/arXiv. 2304.06364](https://doi. org/10.48550/arXiv. 2304.06364).

<!-- page 28 of 30 -->

## A. Appendix 附录

### A. 1. Analysis of Reinforcement Learning 强化学习分析

We provide the detailed derivation of the data source and gradient coefficient (algorithm and reward function) across various methods, including SFT, RFT, Online RFT, DPO, PPO, and GRPO.



以下给出 SFT, RFT, Online RFT, DPO, PPO, GRPO 的数据源与梯度系数(算法与奖励函数)详细推导.

#### A. 1.1. Supervised Fine-tuning 监督微调

The objective of Supervised Fine-tuning is maximizing the following objective:



SFT 目标为最大化:

$$
\mathcal {J} _ {S F T} (\theta) = \mathbb {E} [ q, o \sim P _ {s f t} (Q, O) ] \left(\frac {1}{| o |} \sum_ {t = 1} ^ {| o |} \log \pi_ {\theta} (o _ {t} | q, o _ {<   t})\right). \tag{6}
$$

The gradient of $\mathcal { T } _ { S F T } ( \theta )$ is:



$\mathcal{J}_{SFT}(\theta)$ 的梯度为:

$$
\nabla_ {\theta} \mathcal {J} _ {S F T} = \mathbb {E} [ q, o \sim P _ {s f t} (Q, O) ] \left(\frac {1}{| o |} \sum_ {t = 1} ^ {| o |} \nabla_ {\theta} \log \pi_ {\theta} (o _ {t} | q, o _ {<   t})\right). \tag{7}
$$

Data Source: The dataset employed for SFT. Reward Function: This can be regarded as human selection. Gradient Coefficient: always set to 1.



数据源: SFT 所用数据集. 奖励函数: 可视为人工筛选. 梯度系数: 恒为 1.

#### A. 1.2. Rejection Sampling Fine-tuning 拒绝采样微调

Rejection Sampling Fine-tuning first samples multiple outputs from the supervised fine-tuned LLMs for each question, and then trains LLMs on the sampled outputs with the correct answer. Formally, the objective of RFT is to maximize the following objectives:



RFT: 对每题从 SFT 模型采多条输出, 只保留答案正确的再训. 目标为最大化:

$$
\mathcal {J} _ {R F T} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), o \sim \pi_ {s f t} (O | q) ] \left(\frac {1}{| o |} \sum_ {t = 1} ^ {| o |} \mathbb {I} (o) \log \pi_ {\theta} (o _ {t} | q, o _ {<   t})\right). \tag{8}
$$

The gradient of $\mathcal { T } _ { R F T } ( \theta )$ is:



梯度为:

$$
\nabla_ {\theta} \mathcal {J} _ {R F T} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), o \sim \pi_ {s f t} (O | q) ] \left(\frac {1}{| o |} \sum_ {t = 1} ^ {| o |} \mathbb {I} (o) \nabla_ {\theta} \log \pi_ {\theta} (o _ {t} | q, o _ {<   t})\right). \tag{9}
$$

Data Source: question in SFT dataset with outputs sampled from SFT model. Reward Function: Rule (whether the answer is correct or not). Gradient Coefficient:



数据源: SFT 题 + SFT 模型采样输出. 奖励: 规则(答案对错). 梯度系数:

$$
G C _ {R F T} (q, o, t) = \mathbb {I} (o) = \left\{ \begin{array}{l l} 1 & \text {the answer of o is correct} \\ 0 & \text {the answer of o is incorrect} \end{array} \right. \tag{10}
$$

#### A. 1.3. Online Rejection Sampling Fine-tuning 在线拒绝采样微调

The only difference between RFT and Online RFT is that the outputs of Online RFT are sampled from the real-time policy model $\pi _ { \theta } , $ rather than from the SFT model $\pi _ { \theta _ { s f t } }$ . Therefore, the gradient of online RFT is:



与 RFT 唯一差别: 输出从实时策略 $\pi_\theta$ 采, 而非 $\pi_{\theta_{sft}}$. 梯度为:

$$
\nabla_ {\theta} \mathcal {J} _ {O n R F T} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), o \sim \pi_ {\theta} (O | q) ] \left(\frac {1}{| o |} \sum_ {t = 1} ^ {| o |} \mathbb {I} (o) \nabla_ {\theta} \log \pi_ {\theta} (o _ {t} | q, o _ {<   t})\right). \tag{11}
$$

<!-- page 29 of 30 -->

#### A. 1.4. Direct Preference Optimization (DPO) 直接偏好优化(DPO)

The objective of DPO is:



DPO 目标为:

$$
\mathcal {J} _ {D P O} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), o ^ {+}, o ^ {-} \sim \pi_ {s f t} (O | q) ] \log \sigma \left(\beta \frac {1}{| o ^ {+} |} \sum_ {t = 1} ^ {| o ^ {+} |} \log \frac {\pi_ {\theta} (o _ {t} ^ {+} | q , o _ {<   t} ^ {+})}{\pi_ {\mathrm{ref}} (o _ {t} ^ {+} | q , o _ {<   t} ^ {+})} - \beta \frac {1}{| o ^ {-} |} \sum_ {t = 1} ^ {| o ^ {-} |} \log \frac {\pi_ {\theta} (o _ {<   t} ^ {-} | q , o _ {<   t} ^ {-})}{\pi_ {\mathrm{ref}} (o _ {<   t} ^ {-} | q , o _ {<   t} ^ {-})}\right)\tag{12}
$$

The gradient of $\mathcal { T } _ { D P O } ( \theta )$ is:



梯度为:

$$
\begin{array}{r l} & {\nabla_ {\theta} \mathcal {J} _ {D P O} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), o ^ {+}, o ^ {-} \sim \pi_ {s f t} (O | q) ] \left(\frac {1}{| o ^ {+} |} \sum_ {t = 1} ^ {| o ^ {+} |} G C _ {D P O} (q, o, t) \nabla_ {\theta} \log \pi_ {\theta} (o _ {t} ^ {+} | q, o _ {<   t} ^ {+}) \right. } \\ & {\qquad \left. - \frac {1}{| o ^ {-} |} \sum_ {t = 1} ^ {| o ^ {-} |} G C _ {D P O} (q, o, t) \nabla_ {\theta} \log \pi_ {\theta} (o _ {t} ^ {-} | q, o _ {<   t} ^ {-})\right)} \end{array}\tag{13}
$$

Data Source: question in SFT dataset with outputs sampled from SFT model. Reward Function: human preference in the general domain (can be ‘Rule’ in mathematical tasks). Gradient Coefficient:



数据源: SFT 题 + SFT 采样输出. 奖励: 通用域人偏好(数学任务可退化为规则). 梯度系数:

$$
G C _ {D P O} (q, o, t) = \sigma \left(\beta \log \frac {\pi_ {\theta} (o _ {t} ^ {-} | q , o _ {<   t} ^ {-})}{\pi_ {\mathrm{ref}} (o _ {t} ^ {-} | q , o _ {<   t} ^ {-})} - \beta \log \frac {\pi_ {\theta} (o _ {t} ^ {+} | q , o _ {<   t} ^ {+})}{\pi_ {\mathrm{ref}} (o _ {t} ^ {+} | q , o _ {<   t} ^ {+})}\right)\tag{14}
$$

#### A. 1.5. Proximal Policy Optimization (PPO) PPO(PPO)

The objective of PPO is:



PPO 目标为:

$$
\mathcal {J} _ {P P O} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), o \sim \pi_ {\theta_ {o l d}} (O | q) ] \frac {1}{| o |} \sum_ {t = 1} ^ {| o |} \min \left[ \frac {\pi_ {\theta} \left(o _ {t} \mid q , o _ {<   t}\right)}{\pi_ {\theta_ {o l d}} \left(o _ {t} \mid q , o _ {<   t}\right)} A _ {t}, \operatorname{clip} \left(\frac {\pi_ {\theta} \left(o _ {t} \mid q , o _ {<   t}\right)}{\pi_ {\theta_ {o l d}} \left(o _ {t} \mid q , o _ {<   t}\right)}, 1 - \varepsilon , 1 + \varepsilon\right) A _ {t} \right]. \tag{15}
$$

To simplify the analysis, it is assumed that the model only has a single update following each exploration stage, thereby ensuring that $\pi _ { \theta _ { o l d } } = \pi _ { \theta }$ . In this case, we can remove the min and clip operation:



为简化分析, 假定每轮探索后只更新一次, 从而 $\pi_{\theta_{old}}=\pi_\theta$, 可去掉 min 与 clip:

$$
\mathcal {J} _ {P P O} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), o \sim \pi_ {\theta_ {o l d}} (O | q) ] \frac {1}{| o |} \sum_ {t = 1} ^ {| o |} \frac {\pi_ {\theta} (o _ {t} | q , o _ {<   t})}{\pi_ {\theta_ {o l d}} (o _ {t} | q , o _ {<   t})} A _ {t}. \tag{16}
$$

The gradient of $\mathcal { T } _ { P P O } ( \theta )$ is:



梯度为:

$$
\left| \nabla_ {\theta} \mathcal {J} _ {P P O} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), o \sim \pi_ {\theta_ {o l d}} (O | q) ] \frac {1}{| o |} \sum_ {t = 1} ^ {| o |} A _ {t} \nabla_ {\theta} \log \pi_ {\theta} (o _ {t} | q, o _ {<   t}) \right|\tag{17}
$$

Data Source: question in SFT dataset with outputs sampled from policy model. Reward Function: reward model. Gradient Coefficient:



数据源: SFT 题 + 策略采样. 奖励: 奖励模型. 梯度系数:

$$
G C _ {P P O} (q, o, t, \pi_ {\theta_ {r m}}) = A _ {t}, \tag{18}
$$

where $A _ { t }$ is the advantage, which is computed by applying Generalized Advantage Estimation (GAE) (Schulman et al., 2015), based on the rewards $\{ r _ { \geq t } \}$ and a learned value function $V _ { \psi }$



$A_t$ 由 GAE 基于奖励 $\{r_{\geq t}\}$ 与学得价值函数 $V_\psi$ 算出.

#### A. 1.6. Group Relative Policy Optimization (GRPO) 组相对策略优化(GRPO)

The objective of GRPO is (assume $\pi _ { \theta _ { o l d } } = \pi _ { \theta }$ for simplified analysis):



GRPO 目标(简化假定 $\pi_{\theta_{old}}=\pi_\theta$):

$$
\begin{array}{r l} & {\mathcal {J} _ {G R P O} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {o l d}} (O | q) ]} \\ & {\qquad \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{| o _ {i} |} \sum_ {t = 1} ^ {| o _ {i} |} \left[ \frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta_ {o l d}} (o _ {i , t} | q , o _ {i , <   t})} \hat {A} _ {i, t} - \beta (\frac {\pi_ {r e f} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})} - \log \frac {\pi_ {r e f} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})} - 1) \right]. } \end{array}\tag{19}
$$

<!-- page 30 of 30 -->

The gradient of $\mathcal { T } _ { G R P O } ( \theta )$ is:



梯度为:

$$
\begin{array}{r l} & {\nabla_ {\theta} \mathcal {J} _ {G R P O} (\theta) = \mathbb {E} [ q \sim P _ {s f t} (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {o l d}} (O | q) ]} \\ & {\qquad \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{| o _ {i} |} \sum_ {t = 1} ^ {| o _ {i} |} \left[ \hat {A} _ {i, t} + \beta \left(\frac {\pi_ {r e f} (o _ {i , t} | o _ {i , <   t})}{\pi_ {\theta} (o _ {i , t} | o _ {i , <   t})} - 1\right) \right] \nabla_ {\theta} \log \pi_ {\theta} (o _ {i, t} | q, o _ {i, <   t}). } \end{array}\tag{20}
$$

Data Source: question in SFT dataset with outputs sampled from policy model. Reward Function: reward model. Gradient Coefficient:



数据源: SFT 题 + 策略采样. 奖励: 奖励模型. 梯度系数:

$$
G C _ {G R P O} (q, o, t, \pi_ {\theta_ {r m}}) = \hat {A} _ {i, t} + \beta \left(\frac {\pi_ {r e f} (o _ {i , t} | o _ {i , <   t})}{\pi_ {\theta} (o _ {i , t} | o _ {i , <   t})} - 1\right), \tag{21}
$$

where $\hat { A } _ { i , t }$ is computed based on the group reward scores.



其中 $\hat{A}_{i, t}$ 由组内奖励分数算出.
