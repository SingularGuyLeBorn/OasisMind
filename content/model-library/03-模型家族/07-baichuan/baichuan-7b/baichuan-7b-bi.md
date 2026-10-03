---
title: "Baichuan-7B · 对照译稿"
category: "模型库"
tags: ["Baichuan", "对照译稿"]
published: true
excerpt: "Baichuan-7B 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 8 -->

| .github/ISSUE_TEMPLATE | Add GitHub issue templates (#29) | 3 years ago |
| --- | --- | --- |
| config | Update deepspeed.json stage 3 ==> stage 2 | 3 years ago |
| evaluation | modify: update evaluate_zh.py | 3 years ago |
| media | Update QRCode (#123) | 3 years ago |
| models | Update modeling_baichuan.py | 3 years ago |
| scripts | Initial commit | 3 years ago |
| .gitignore | feat: update readme and accelerate evaluati... | 3 years ago |
| LICENSE | Initial commit | 3 years ago |
| README.md | Update README.md | 3 years ago |
| README_EN.md | Update README_EN.md | 3 years ago |
| requirements.txt | Update xformers version suggested by sppa... | 3 years ago |
| train.py | Update train.py | 3 years ago |

> **想：** 文件列表里 config 一行写着 「Update deepspeed.json stage 3 ==> stage 2」。7B 模型为什么要从 ZeRO stage 3 退回 stage 2?
> 页面没给理由，只能按 DeepSpeed 的机制推断。ZeRO-2 切分优化器状态和梯度，每张卡仍保留一份完整参数；ZeRO-3 再把参数也切开，前向和反向都要逐层 all-gather 参数，通信量明显更大。7B 参数按 16 位存约 14 GB，A800 单卡放得下，stage 3 省下的显存换不回多出来的通信开销。第 6 页 「训练稳定性和吞吐」 一节用三条讲通信优化，取向一致。要注意这只是仓库示范训练脚本的配置，第 6 页说百川自己的千卡训练是在 LLaMA 框架上改出来的，两者不是一套东西。

**README** Apache-2.0 license

# Baichuan-7B

🤗 [Hugging Face](https://huggingface.co/baichuan-inc/Baichuan-7B) • 🤖 [ModelScope](https://modelscope.cn/organization/baichuan-inc) • 💬 [WeChat](https://github.com/baichuan-inc/Baichuan-7B/blob/main/media/wechat.jpeg?raw=true)

[license Apache-2.0](https://github.com/baichuan-inc/Baichuan-7B/blob/main/LICENSE)

Chinese **|** [**English**](https://github.com/baichuan-inc/Baichuan-7B/blob/main/README_EN.md)

中文 **|** [**English**](https://github.com/baichuan-inc/Baichuan-7B/blob/main/README_EN.md)

## Updates · 更新信息

[2023.09.06] We have released our new-generation open-source model [Baichuan 2](https://github.com/baichuan-inc/Baichuan2), available in 7B and 13B sizes.

[2023.09.06] 我们发布了新一代开源模型 [Baichuan 2](https://github.com/baichuan-inc/Baichuan2)，包含 7B，13B 尺寸。

## Introduction

Baichuan-7B is an open-source, commercially usable large-scale pretrained language model developed by Baichuan Intelligence. Built on the Transformer architecture, it is a 7-billion-parameter model trained on roughly 1.2 trillion tokens. It supports both Chinese and English, with a context window of 4096. It achieves the best results among models of the same size on the standard Chinese and English benchmarks (C-Eval/MMLU).

Baichuan-7B 是由百川智能开发的一个开源可商用的大规模预训练语言模型。基于 Transformer 结构，在大约 1.2 万亿 tokens 上训练的 70 亿参数模型，支持中英双语，上下文窗口长度为 4096。在标准的中文和英文 benchmark(C-Eval/MMLU)上均取得同尺寸最好的效果。

> **问：** 70 亿参数配约 1.2 万亿 tokens，每个参数摊到约 170 个 token，远高于 Chinchilla 给出的 20 左右。这样训划算吗？
> README 没提 Scaling Laws，也没说 tokens 总量是怎么定的。能核对的只有第 7 页的 loss 曲线：到 1200B tokens 处还在缓慢下降，没有走平，说明继续训仍有收益。Chinchilla 的最优比例是在固定训练算力下让 loss 最低，不计部署后的推理开销。7B 这个尺寸定位就是单卡能跑，训练阶段多花算力换一个更强的小模型，部署阶段每次调用都省，这是当时常见的取舍，LLaMA-7B 也训了 1 万亿 tokens。

<!-- page 2 of 8 -->

## Public Benchmark Leaderboards · 公开 benchmark 榜单

### Chinese Evaluation · 中文评测

#### C-Eval

The [C-Eval dataset](https://cevalbenchmark.com/index.html) is a comprehensive Chinese evaluation dataset for foundation models, covering 52 subjects and four difficulty levels. We use its dev set as the source of few-shot examples and run 5-shot evaluation on the test set, by executing the following commands:

[C-Eval 数据集](https://cevalbenchmark.com/index.html)是一个全面的中文基础模型评测数据集，涵盖了 52 个学科和四个难度的级别。我们使用该数据集的 dev 集作为 fewshot 的来源，在 test 集上进行了 5-shot 测试。通过执行下面的命令：

```batch
cd evaluation
python evaluate_zh.py --model_name_or_path 'your/model/path'
```

> **核对：** C-Eval 用 dev 集做 few-shot 示例，在 test 集上跑 5-shot. test 集的答案公开吗？evaluate_zh.py 能在本地直接算出下表的分数吗？
> C-Eval 的 test 集标签不公开，分数要把预测提交到官方网站打分；dev 集每个学科只有 5 道带解析的题，刚好够 5-shot 示例。所以第 2 页这条命令最多产出预测文件，表里的数字应当来自官方提交，页面没写这一步。想在本地自查，可以改跑有标签的 val 集，但那个分数和表里的 test 分数不是同一个量。

**Results · 结果**

| Model 5-shot | Average | Avg(Hard) | STEM | Social Sciences | Humanities | Others |
| --- | --- | --- | --- | --- | --- | --- |
| GPT-4 | 68.7 | 54.9 | 67.1 | 77.6 | 64.5 | 67.8 |
| ChatGPT | 54.4 | 41.4 | 52.9 | 61.8 | 50.9 | 53.6 |
| Claude-v1.3 | 54.2 | 39.0 | 51.9 | 61.7 | 52.1 | 53.7 |
| Claude-instant-v1.0 | 45.9 | 35.5 | 43.1 | 53.8 | 44.2 | 45.4 |
| BLOOMZ-7B | 35.7 | 25.8 | 31.3 | 43.5 | 36.6 | 35.6 |
| ChatGLM-6B | 34.5 | 23.1 | 30.4 | 39.6 | 37.4 | 34.5 |
| Ziya-LLaMA-13B-pretrain | 30.2 | 22.7 | 27.7 | 34.4 | 32.0 | 28.9 |
| moss-moon-003-base (16B) | 27.4 | 24.5 | 27.0 | 29.1 | 27.2 | 26.9 |
| LLaMA-7B-hf | 27.1 | 25.9 | 27.1 | 26.8 | 27.9 | 26.3 |
| Falcon-7B | 25.8 | 24.3 | 25.8 | 26.0 | 25.8 | 25.6 |
| TigerBot-7B-base | 25.7 | 27.0 | 27.3 | 24.7 | 23.4 | 26.1 |
| Aquila-7B<sup>*</sup> | 25.5 | 25.2 | 25.6 | 24.6 | 25.2 | 26.6 |
| Open-LLaMA-v2-pretrain (7B) | 24.0 | 22.5 | 23.1 | 25.3 | 25.2 | 23.2 |
| BLOOM-7B | 22.8 | 20.2 | 21.8 | 23.3 | 23.9 | 23.3 |
| Baichuan-7B | 42.8 | 31.5 | 38.2 | 52.0 | 46.2 | 39.3 |

> **看表：** TigerBot-7B-base 的 Avg(Hard) 比它自己的 Average 还高，Aquila-7B 两者也几乎持平。难题反而不掉分，说明什么？
> C-Eval 是四选一，随机猜的期望是 25%。表的下半段从 LLaMA-7B-hf 到 BLOOM-7B，Average 都落在 22.8 到 27.1 之间，也就是这些模型做中文题基本在猜，难题和普通题分不出差别，高一两个点只是噪声。比起绝对分数，Average 和 Avg(Hard) 拉开多少更能说明模型是否真会：Baichuan-7B 差 11.3 个点，GPT-4 差 13.8 个点，这才是 「易题会做，难题吃力」 的正常形态。

#### Gaokao

[Gaokao](https://github.com/OpenLMLab/GAOKAO-Bench) is a dataset that uses questions from China's college entrance examination (Gaokao) to evaluate large language models, assessing their language ability and logical reasoning. We keep only the single-choice questions, split them randomly, and run a uniform 5-shot evaluation for all models.

[Gaokao](https://github.com/OpenLMLab/GAOKAO-Bench) 是一个以中国高考题作为评测大语言模型能力的数据集，用以评估模型的语言能力和逻辑推理能力。我们只保留了其中的单项选择题，随机划分后对所有模型进行统一 5-shot 测试。

> **拆开：** 这里 「只保留了单项选择题，随机划分后统一 5-shot」。这组分数能和 GAOKAO-Bench 官方榜单对比吗？
> 不能直接比。官方基准既有选择题也有主观题，百川只挑了单选题，又自己随机划出 few-shot 示例和评测集；划分方式和随机种子页面都没给，同一个模型换一次划分分数就会变。第 3 页的 AGIEval 用的也是 「只保留四选一，随机划分」 这套做法。这几张表只适合看同一协议下模型之间的相对顺序。

**Results · 结果**

The results are shown below.

以下是测试的结果。

| Model | Average |
| --- | --- |
| BLOOMZ-7B | 28.72 |
| LLaMA-7B | 27.81 |
| BLOOM-7B | 26.96 |

<!-- page 3 of 8 -->

| Model | Average |
| --- | --- |
| TigerBot-7B-base | 25.94 |
| Falcon-7B | 23.98 |
| Ziya-LLaMA-13B-pretrain | 23.17 |
| ChatGLM-6B | 21.41 |
| Open-LLaMA-v2-pretrain | 21.41 |
| Aquila-7B<sup>*</sup> | 24.39 |
| Baichuan-7B | 36.24 |

> **确认：** Gaokao 表里 Aquila-7B 排在 Open-LLaMA-v2-pretrain 后面，分数却比它上面四行都高。这张表不是按分数排的吗？
> 其余各行确实从高到低排，只有带星号的 Aquila 这一行插在 Baichuan-7B 之前。本页 AGIEval 表下的注释说 Aquila 模型来源于智源官方网站，仅做参考。可以理解为 Aquila 是后补进表的，不在原来的排序里，权重来源也和其他模型不同。读名次时这一行要单独看。

#### AGIEval

[AGIEval](https://github.com/microsoft/AGIEval) aims to evaluate a model's general ability on tasks related to cognition and problem solving. We keep only the four-option single-choice questions, split them randomly, and run a uniform 5-shot evaluation for all models.

[AGIEval](https://github.com/microsoft/AGIEval) 旨在评估模型的认知和解决问题相关的任务中的一般能力。我们只保留了其中的四选一单项选择题，随机划分后对所有模型进行了统一 5-shot 测试。

**Results · 结果**

| Model | Average |
| --- | --- |
| BLOOMZ-7B | 30.27 |
| LLaMA-7B | 28.17 |
| Ziya-LLaMA-13B-pretrain | 27.64 |
| Falcon-7B | 27.18 |
| BLOOM-7B | 26.55 |
| Aquila-7B<sup>*</sup> | 25.58 |
| TigerBot-7B-base | 25.19 |
| ChatGLM-6B | 23.49 |
| Open-LLaMA-v2-pretrain | 23.49 |
| Baichuan-7B | 34.44 |

> **回看：** ChatGLM-6B 和 Open-LLaMA-v2-pretrain 在 Gaokao 表里分数相同，到 AGIEval 表里又相同，两个独立数据集上两次精确到两位小数撞在一起，是巧合吗？
> 概率很低，页面也没有解释。一种可能是两个模型在这些四选一题上都退化成同一种作答偏好，比如总选同一个选项，得分就等于该选项在题库里所占的比例，自然相同；另一种可能是制表时抄错。同样两个模型在第 2 页 C-Eval 表里分数并不相同，说明它们并非处处一样。引用这两行 Gaokao 和 AGIEval 分数之前，最好按本页的协议自己重跑一遍。

The Aquila model is taken from BAAI's official website ([https://model.baai.ac.cn/model-detail/100098](https://model.baai.ac.cn/model-detail/100098)) and is listed for reference only.

其中 Aquila 模型来源于智源官方网站（[https://model.baai.ac.cn/model-detail/100098](https://model.baai.ac.cn/model-detail/100098)），仅做参考。

### English Leaderboard · 英文榜单

Besides Chinese, Baichuan-7B was also evaluated on English. [MMLU](https://arxiv.org/abs/2009.03300) is an English evaluation dataset with 57 multiple-choice tasks, covering elementary mathematics, US history, computer science, law and more, with difficulty ranging from high-school level to expert level; it is currently a mainstream LLM benchmark. We adopt the [open-source](https://github.com/hendrycks/test) evaluation scheme, and the final 5-shot results are as follows:

除了中文之外，Baichuan-7B 也测试了模型在英文上的效果。[MMLU](https://arxiv.org/abs/2009.03300) 是包含 57 个多选任务的英文评测数据集，涵盖了初等数学，美国历史，计算机科学，法律等，难度覆盖高中水平到专家水平，是目前主流的 LLM 评测数据集。我们采用了[开源](https://github.com/hendrycks/test)的评测方案，最终 5-shot 结果如下所示：

**Results · 结果**

| Model | Humanities | Social Sciences | STEM | Other | Average |
| --- | --- | --- | --- | --- | --- |
| ChatGLM-6B<sup>0</sup> | 35.4 | 41.0 | 31.3 | 40.5 | 36.9 |
| BLOOMZ-7B<sup>0</sup> | 31.3 | 42.1 | 34.4 | 39.0 | 36.1 |
| mpt-7B<sup>1</sup> | - | - | - | - | 35.6 |
| LLaMA-7B<sup>2</sup> | 34.0 | 38.3 | 30.5 | 38.1 | 35.1 |

<!-- page 4 of 8 -->

| Model | Humanities | Social Sciences | STEM | Other | Average |
| --- | --- | --- | --- | --- | --- |
| Falcon-7B<sup>1</sup> | - | - | - | - | 35.0 |
| moss-moon-003-sft (16B)<sup>0</sup> | 30.5 | 33.8 | 29.3 | 34.4 | 31.9 |
| BLOOM-7B<sup>0</sup> | 25.0 | 24.4 | 26.5 | 26.4 | 25.5 |
| moss-moon-003-base (16B)<sup>0</sup> | 24.2 | 22.8 | 22.4 | 24.4 | 23.6 |
| Baichuan-7B<sup>0</sup> | 38.4 | 48.9 | 35.6 | 48.1 | 42.3 |

0: Reproduced by us.

0：重新复现。

1: [https://huggingface.co/spaces/HuggingFaceH4/open\_llm\_leaderboard](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard)

2: [https://paperswithcode.com/sota/multi-task-language-understanding-on-mmlu](https://paperswithcode.com/sota/multi-task-language-understanding-on-mmlu)

> **停一下：** MMLU 表的上标有 0, 1, 2 三种来源，mpt-7B 和 Falcon-7B 只有 Average 没有分项。这些数放进一张表里能比吗？
> 上标 0 是百川按 hendrycks/test 自己复现，1 取自 HuggingFace Open LLM Leaderboard，2 取自 paperswithcode。三处的 prompt 模板和打分实现各不相同，MMLU 换一套实现，同一模型差出几个点并不少见。只有上标 0 的几行共用同一套协议，严格比较只能在这几行之间做。mpt-7B 和 Falcon-7B 缺分项，正是因为它们的平均分是从榜单上直接取来的。

#### Reproduction · 复现方法

```shell
git clone https://github.com/hendrycks/test
cd test
wget https://people.eecs.berkeley.edu/~hendrycks/data.tar
tar xf data.tar
mkdir results
cp ../evaluate_mmlu.py .
python evaluate_mmlu.py -m /path/to/Baichuan-7B
```

The detailed metrics of the 57 MMLU tasks are shown in the figure below:

其中在 MMLU 上 57 个任务的具体细指标如下图：

![Chart block](images/p04-image.png)

The metrics for each subject are shown in the figure below:

其中各个学科的指标如下图：

![Chart block](images/p04-image-2.png)

> **再看：** 正文说 MMLU 有 57 个任务，表格分 4 大类，这张图的标题却是 「MMLU 21 Subjects」；而且 math 一栏 baichuan-7B 并不比 LLaMA-7B 高。第 5 页说数字逐位切分 「对于提升数学能力有重要帮助」，两处怎么对上？
> 21 栏是把 57 个任务归并出的中层学科，图右侧的 STEM，humanities，socialsciences，other 又是 4 个大类，两层粒度画在了同一张图里。math 一栏四个模型都在 26% 到 29% 附近，贴着四选一的随机水平，说明这一代 7B 预训练模型在 MMLU 数学题上基本不会做，分词上的改动带来的差别被淹没了。第 5 页那句话没有附消融实验，本文也没有 GSM8K 之类的数学评测，在页面上找不到支撑。

## Inference · 推理方法

<!-- page 5 of 8 -->

The inference code is already available in the [official Hugging Face repository](https://huggingface.co/baichuan-inc/Baichuan-7B).

推理代码已经在[官方 Huggingface 库](https://huggingface.co/baichuan-inc/Baichuan-7B)。

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
```

```txt
tokenizer = AutoTokenizer.from_pretrained("baichuan-inc/Baichuan-7B", trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained("baichuan-inc/Baichuan-7B", device_map="auto", trust_remote_code=True)
inputs = tokenizer('登鹳雀楼->王之涣\n夜雨寄北->', return_tensors='pt')
inputs = inputs.to('cuda:0')
pred = model.generate(**inputs, max_new_tokens=64,repetition_penalty=1.1)
print(tokenizer.decode(pred.cpu()[0], skip_special_tokens=True))
```

> **对一下：** 推理示例的输入是 '登鹳雀楼->王之涣\n夜雨寄北->'，还带着 trust_remote_code=True 和 repetition_penalty=1.1。为什么不直接问 「夜雨寄北的作者是谁」？
> Baichuan-7B 是纯预训练模型，没做 SFT，不会按指令作答。示例先给一行 「诗名->作者」 当 one-shot 示范，让模型照格式续写下一位作者。trust_remote_code 是因为模型结构写在仓库自带的 modeling_baichuan.py 里（第 1 页文件列表的 models 目录），当时 transformers 没有内置这个结构。repetition_penalty 用来压住纯续写模式下常见的循环重复。想要对话能力，第 8 页第三方资源列了几个做过 SFT 的衍生模型。

## Data · 数据

The raw data includes open-source Chinese and English data, Chinese internet data crawled by ourselves, and some high-quality knowledge-oriented data.

原始数据包括开源的中英文数据和自行抓取的中文互联网数据，以及部分高质量知识性数据。

Following related data work, frequency and quality are the two dimensions we mainly consider in data processing. Based on heuristic rules and quality-model scores, we filter the raw dataset at both document and sentence granularity. On the full dataset, we use locality-sensitive hashing to deduplicate at document and sentence granularity.

参考相关数据工作，频率和质量是数据处理环节重点考虑的两个维度。我们基于启发式规则和质量模型打分，对原始数据集进行篇章和句子粒度的过滤。在全量数据上，利用局部敏感哈希方法，对篇章和句子粒度做滤重。

The overall pipeline is shown below:

整体流程如下所示：

![Image block](images/p05-image.png)

> **想：** 正文说先按启发式规则和质量模型打分过滤，再在全量数据上用局部敏感哈希滤重；流程图里 deduplication 和 quality scoring 却是从同一个 Intermediate Data 分出的两条并行支路，最后在 select 汇合。哪个才是实际顺序？
> 图和文字不完全一致。按图读：启发式规则先过一遍，然后一路去重，一路给数据打质量分，select 再把两路结果合起来挑出最终数据；文字则把质量模型并进了过滤那一步。两种写法的共同点是规则过滤在最前，去重和质量分一起决定最终入选。阈值，保留比例，质量模型怎么训，页面都没给。局部敏感哈希做文本去重，常见实现是 MinHash 近似 Jaccard 相似度，页面只写了 「局部敏感哈希」，没说用哪种哈希。

After continual adjustment and multiple rounds of testing, we finally settled on the Chinese-English mixing ratio that performs best on downstream tasks.

经过不断的调整和多轮测试，最终确认了一个在下游任务上表现最好的中英文配比。

We use a data-weighting strategy based on automatic learning to set the mixing proportions of different data categories.

我们使用了一个基于自动学习的数据权重策略，对不同类别的数据进行配比。

## Tokenization · 分词

Following academic practice, we use Byte-Pair Encoding (BPE) from SentencePiece as the tokenization algorithm, with the following optimizations:

我们参考学术界方案使用 SentencePiece 中的 Byte-Pair Encoding (BPE) 作为分词算法，并且进行了以下的优化：

1. Most current open-source models are optimized mainly for English and are therefore inefficient on Chinese corpora. We trained the tokenizer on 20 million multilingual samples, mostly Chinese and English, which significantly improves the compression rate for Chinese.

1. 目前大部分开源模型主要基于英文优化，因此对中文语料存在效率较低的问题。我们使用 2000 万条以中英为主的多语言语料训练分词模型，显著提升对于中文的压缩率。

2. For mathematics, following LLaMA and Galactica, we split every digit of a number into a separate token, which avoids inconsistent number representations and helps a lot in improving mathematical ability.

2. 对于数学领域，我们参考了 LLaMA 和 Galactica 中的方案，对数字的每一位单独分开，避免出现数字不一致的问题，对于提升数学能力有重要帮助。

3. For rare words (such as special symbols), byte encoding of UTF-8 characters is supported, so unknown words are fully covered.

3. 对于罕见字词（如特殊符号等），支持 UTF-8 characters 的 byte 编码，因此做到未知字词的全覆盖。

4. We analyzed the compression rate of different tokenizers on the corpus, as shown in the table below. Our tokenizer is clearly better than those of open-source models such as LLaMA and Falcon, and compared with other Chinese tokenizers at a similar compression rate, it gives higher training and inference efficiency.

4. 我们分析了不同分词器对语料的压缩率，如下表，可见我们的分词器明显优于 LLaMA，Falcon 等开源模型，并且对比其他中文分词器在压缩率相当的情况下，训练和推理效率更高。

| Model | Baichuan-7B | LLaMA | Falcon | mpt-7B | ChatGLM | moss-moon-003 |
| --- | --- | --- | --- | --- | --- | --- |
| Compress Rate | 0.737 | 1.312 | 1.049 | 1.206 | 0.631 | 0.659 |
| Vocab Size | 64,000 | 32,000 | 65,024 | 50,254 | 130,344 | 106,029 |

> **核对：** 压缩率一行 Baichuan-7B 比 LLaMA 小，被说成 「明显优于」；ChatGLM 比 Baichuan-7B 还小，却只说 「压缩率相当」。这个指标是越小越好吗，分母是什么？
> 从行文看是越小越好，大概是同一份语料切出的 token 数相对某个基准的比值，但页面没给定义，也没说语料是纯中文还是中英混合。对 ChatGLM 和 moss 的比较换了角度：压缩率差得不多，而 Baichuan-7B 的词表只有它们的一半左右。词表越小，embedding 和输出层 softmax 的矩阵越小，训练和推理每一步都更省。另外本页第 2 条把数字逐位切开，第 3 条让罕见字回退到 UTF-8 字节，这两条都会让 token 数变多，表里的压缩率是在这些约束下量出来的。

## Model Architecture · 模型结构

The overall model is based on the standard Transformer architecture; we adopt the same model design as LLaMA.

整体模型基于标准的 Transformer 结构，我们采用了和 LLaMA 一样的模型设计。

<!-- page 6 of 8 -->

Positional encoding: [rotary-embedding](https://arxiv.org/abs/2104.09864) is the positional encoding scheme adopted by most models at present, with better extrapolation. Although the maximum length during training is 4096, in actual tests the model extends well to more than 5000 tokens, as shown below:

位置编码：[rotary-embedding](https://arxiv.org/abs/2104.09864) 是现阶段被大多模型采用的位置编码方案，具有更好的外延效果。虽然训练过程中最大长度为 4096，但是实际测试中模型可以很好的扩展到 5000 tokens 以上，如下图：

PPL

![Chart block](images/p06-swiglu-feedforward-8-3-11-008.png)

> **再看：** 图上 PPL 从 4096 到 5120 一路下降，到 5376 突然跳到 15 以上。正文说 「可以很好的扩展到 5000 tokens 以上」，这句站得住吗？
> 只站得住一半。长度从 4096 加到 5120，平均 PPL 从约 13.8 降到约 13.4，因为这是整段平均，靠后的 token 能看到更长的上文，更好猜。5120 到 5376 之间开始崩，5376 处的 PPL 已经高过 4096 处。RoPE 的旋转角随位置线性增长，超出训练时见过的角度范围，注意力打分就会遇到没学过的组合，崩掉是常态。多撑出约 1000 个位置只是余量，谈不上 「更好的外延效果」；本文没做任何位置插值，是原样外推。

Activation: SwiGLU; the feedforward dimension becomes 8/3 of the hidden size, i.e. 11,008.

激活层：SwiGLU，Feedforward 变化为 8/3 倍的隐含层大小，即 11,008。

> **拆开：** 「Feedforward 变化为 8/3 倍的隐含层大小，即 11,008」，可 11,008 除以 8/3 得 4128，不是常见的 4096。隐含层到底多宽？
> 页面没直接写隐含层维度，只说 「和 LLaMA 一样的模型设计」。LLaMA-7B 的 hidden size 是 4096, 8/3 × 4096 ≈ 10922.7，LLaMA 代码再向上取整到 256 的倍数，得到 11,008 = 43 × 256。所以 8/3 是设计比例，11,008 是取整之后的值。取 8/3 是因为 SwiGLU 有 gate，up，down 三个矩阵，三个 8/3 倍宽的矩阵，参数量正好等于标准 FFN 两个 4 倍宽的矩阵。

Layer-Normalization: Pre-Normalization based on [RMSNorm](https://arxiv.org/abs/1910.07467).

Layer-Normalization：基于 [RMSNorm](https://arxiv.org/abs/1910.07467) 的 Pre-Normalization。

## Training Stability and Throughput · 训练稳定性和吞吐

We made many modifications to the original LLaMA framework to improve training throughput, including:

我们在原本的 LLaMA 框架上进行诸多修改以提升训练时的吞吐，具体包括：

1. Operator optimization: using more efficient operators, such as Flash-Attention and NVIDIA apex's RMSNorm.

1. 算子优化技术：采用更高效算子，如 Flash-Attention，NVIDIA apex 的 RMSNorm 等。

2. Operator splitting: splitting some computational operators to reduce peak memory.

2. 算子切分技术：将部分计算算子进行切分，减小内存峰值。

3. Mixed precision: speeding up computation without losing model accuracy.

3. 混合精度技术：降低在不损失模型精度的情况下加速计算过程。

4. Fault tolerance: joint optimization of the training platform and training framework, IaaS + PaaS, enabling minute-level fault localization and job recovery.

4. 训练容灾技术：训练平台和训练框架联合优化，IaaS + PaaS 实现分钟级的故障定位和任务恢复。

5. Communication optimization, specifically:

5. 通信优化技术，具体包括：

i. Using topology-aware collective communication algorithms to avoid network congestion and improve communication efficiency.

i. 采用拓扑感知的集合通信算法，避免网络拥塞问题，提高通信效率。

ii. Setting the bucket size adaptively according to the number of GPUs to improve bandwidth utilization.

ii。根据卡数自适应设置 bucket size，提高带宽利用率。

iii. Tuning the trigger timing of communication primitives according to the model and cluster environment, so that computation and communication overlap.

iii。根据模型和集群环境，调优通信原语的触发时机，从而将计算和通信重叠。

With the optimizations above, we reached a throughput of 182 TFLOPS for the 7B model on a thousand A800 GPUs, with GPU peak compute utilization as high as 58.3%.

基于上述的几个优化技术，我们在千卡 A800 显卡上达到了 7B 模型 182 TFLOPS 的吞吐，GPU 峰值算力利用率高达 58.3%。

> **对一下：** 千卡 A800 上 7B 模型 182 TFLOPS，峰值算力利用率 58.3%。这个 「峰值」 是按什么精度算的？
> 182 ÷ 0.583 ≈ 312，正好是 A800（与 A100 同一算力规格）BF16/FP16 稠密张量核的峰值 312 TFLOPS。所以 182 是每卡的实际吞吐，58.3% 是相对 16 位稠密峰值的利用率。第 3 条 「混合精度技术」 没写具体精度，从这个比值倒推，矩阵乘走的是 16 位。182 里是否算上了激活重计算的那部分算力，页面没说，算上的话利用率会偏高，这一点无法从页面核实。

The final loss is shown below:

最终的 loss 如下图：

<!-- page 7 of 8 -->

![Image block](images/p07-image.png)

![Chart block](images/p07-image-2.png)

> **回看：** loss 曲线从 3 以上一路降到约 1.78。这个数能和 LLaMA 或别的模型的训练 loss 直接比吗？
> 不能。交叉熵按 token 平均，而每个 token 装多少内容取决于分词器：第 5 页的表里 Baichuan-7B 词表 64,000，LLaMA 32,000，切法不同，单个 token 的难度就不同，loss 数值首先反映的是切分方式。跨模型比较要换成按字节算的 bits-per-byte。这张图能读出的只有两点：全程没有明显的 loss spike；到 1200B tokens 还没走平。纵轴顶端截在 3，最初那段更高的 loss 没画进来。

## Training Method · 训练方法

**Installing Dependencies · 安装依赖**

pip install -r requirements.txt

![Image block](images/p07-image-3.png)

**Preparing Data · 准备数据**

Users split the training corpus evenly into multiple UTF-8 text files, with the file count a multiple of the total number of ranks, and put them in the corpus directory (data\_dir by default). Each rank process reads different files in the corpus directory, loads them all into memory, and then starts training. The above is a simplified demonstration pipeline; for formal training jobs, users are advised to adjust the data production logic to their needs.

用户将训练语料按总 rank 数的倍数均匀切分成多个 UTF-8 文本文件，放置在语料目录（默认为 data\_dir）下。各个 rank 进程将会读取语料目录下的不同文件，全部加载到内存后，开始后续训练过程。以上是简化的示范流程，建议用户在正式训练任务中，根据需求调整数据生产逻辑。

> **停一下：** 这里要求把语料按总 rank 数的倍数切成多个 UTF-8 文本文件，每个 rank 全部读进内存再训练。1.2 万亿 tokens 是这样喂进去的吗？
> 不是。页面自己说了 「以上是简化的示范流程」，把 1.2 万亿 tokens 的语料全部载入内存也不现实。train.py 加 DeepSpeed 配置，是留给用户在自己数据上继续训练或微调的示范；第 6 页的千卡训练用的是 「在原本的 LLaMA 框架上进行诸多修改」 的内部框架。第 1 页 deepspeed.json 从 stage 3 改成 stage 2，描述的也只是这套示范脚本。

**Downloading the Tokenizer Model · 下载 tokenizer 模型**

Download the tokenizer model file [tokenizer.model](https://huggingface.co/baichuan-inc/Baichuan-7B/blob/main/tokenizer.model) and place it in the project directory.

下载 tokenizer 模型文件 [tokenizer.model](https://huggingface.co/baichuan-inc/Baichuan-7B/blob/main/tokenizer.model)，放置在项目目录下。

**Configuring DeepSpeed · 配置 DeepSpeed**

This demo code uses the DeepSpeed framework for training. Users need to modify config/hostfile according to their cluster; for multi-node multi-GPU setups, the IP configuration of each node in ssh must be modified. See the DeepSpeed [official documentation](https://www.deepspeed.ai/) for details.

本示范代码采用 DeepSpeed 框架进行训练。用户需根据集群情况，修改 config/hostfile，如果是多机多卡，需要修改 ssh 中各个节点的 IP 配置。具体可以参见 DeepSpeed [官方说明](https://www.deepspeed.ai/)。

**Running Training · 执行训练**

scripts/train.sh

<!-- page 8 of 8 -->

## License · 协议

Use of the source code in this repository follows the open-source license [Apache 2.0](https://github.com/baichuan-inc/Baichuan-7B/blob/main/LICENSE).

对本仓库源码的使用遵循开源许可协议 [Apache 2.0](https://github.com/baichuan-inc/Baichuan-7B/blob/main/LICENSE)。

Baichuan-7B supports commercial use. If you use the Baichuan-7B model or its derivatives for commercial purposes, please contact the licensor as follows to register and apply for written authorization: contact email: [opensource@baichuan-inc.com](mailto:opensource@baichuan-inc.com). For the full license terms，see the [Baichuan-7B 模型许可协议](https://huggingface.co/baichuan-inc/Baichuan-7B/resolve/main/baichuan-7B%20%E6%A8%A1%E5%9E%8B%E8%AE%B8%E5%8F%AF%E5%8D%8F%E8%AE%AE.pdf)。

Baichuan-7B 支持商用。如果将 Baichuan-7B 模型或其衍生品用作商业用途，请您按照如下方式联系许可方，以进行登记并向许可方申请书面授权：联系邮箱：[opensource@baichuan-inc.com](mailto:opensource@baichuan-inc.com)，具体许可协议可见 「[Baichuan-7B 模型许可协议](https://huggingface.co/baichuan-inc/Baichuan-7B/resolve/main/baichuan-7B%20%E6%A8%A1%E5%9E%8B%E8%AE%B8%E5%8F%AF%E5%8D%8F%E8%AE%AE.pdf)」。

> **确认：** 代码是 Apache 2.0，又说 「支持商用」，可商用前要发邮件登记，申请书面授权。这两句矛盾吗？
> 不矛盾，管的是两样东西。Apache 2.0 覆盖的是仓库源码，原文写的是 「对本仓库源码的使用」；模型权重另有 「Baichuan-7B 模型许可协议」，商用要先登记并拿到书面授权。第 1 页顶部的 「Apache-2.0 license」 标签说的只是代码仓库，不能据此认为权重可以免登记商用。

## Third-Party Resources

1. [LLaMA Efficient Tuning](https://github.com/hiyouga/LLaMA-Efficient-Tuning) supports fine-tuning Baichuan-7B with QLoRA, supports RLHF, and supports a WebDemo. For a model after SFT, see [hiyouga/baichuan-7b-sft](https://huggingface.co/hiyouga/baichuan-7b-sft).

1. [LLaMA Efficient Tuning](https://github.com/hiyouga/LLaMA-Efficient-Tuning) 支持 Baichuan-7B 使用 Qlora 进行 Finetune，支持 RLHF，支持 WebDemo。使用经过 SFT 的模型见 [hiyouga/baichuan-7b-sft](https://huggingface.co/hiyouga/baichuan-7b-sft)。

2. [fireballoon/baichuan-vicuna-chinese-7b](https://huggingface.co/fireballoon/baichuan-vicuna-chinese-7b) is a model fine-tuned on Chinese and English data including ShareGPT, ShareGPT-ZH, CoT & CoT-ZH, Leetcode and dummy; the training code follows FastChat.

2. [fireballoon/baichuan-vicuna-chinese-7b](https://huggingface.co/fireballoon/baichuan-vicuna-chinese-7b) 使用 ShareGPT，ShareGPT-ZH，CoT & CoT-ZH，Leetcode，dummy 等包含中英文的数据 Finetune 后的模型，训练代码参考 FastChat。

3. [fireballoon/baichuan-vicuna-7b](https://huggingface.co/fireballoon/baichuan-vicuna-7b) is a model fine-tuned on a mixture of ShareGPT, CoT, Leetcode and other data; the training code follows FastChat.

3. [fireballoon/baichuan-vicuna-7b](https://huggingface.co/fireballoon/baichuan-vicuna-7b) 使用 ShareGPT，CoT 和 Leetcode 等数据混合 Finetune 后的模型，训练代码参考 FastChat。

4. [Efficient-Tuning-LLMs](https://github.com/jianzhnie/Efficient-Tuning-LLMs) supports fine-tuning Baichuan-7B with QLoRA and 4-bit inference.

4. [Efficient-Tuning-LLMs](https://github.com/jianzhnie/Efficient-Tuning-LLMs) 支持 Baichuan-7B 使用 Qlora 进行 Finetune 和 4bit inference。

5. [fastllm](https://github.com/ztxz16/fastllm) is a large-model library implemented in pure C++ with no third-party dependencies; it can run Baichuan-7B on mobile phones.

5. [fastllm](https://github.com/ztxz16/fastllm) fastllm 是纯 c++ 实现，无第三方依赖的大模型库，支持 Baichuan-7B 在手机端运行。

6. [TheBloke/baichuan-7B-GPTQ](https://huggingface.co/TheBloke/baichuan-7B-GPTQ) is a GPTQ 4-bit quantization of Baichuan-7B.

6. [TheBloke/baichuan-7B-GPTQ](https://huggingface.co/TheBloke/baichuan-7B-GPTQ) 对 Baichuan-7B 的 GPTQ 4bit 量化。

## Star History

[Star History](https://star-history.com/#baichuan-inc/Baichuan-7B&Date)

[baichuan-inc/baichuan-7b](https://star-history.com/#baichuan-inc/Baichuan-7B&Date)

![Chart block](images/p08-releases-https-github-com-baichuan-inc-baichuan-7b.png)

**[Releases](https://github.com/baichuan-inc/Baichuan-7B/releases)**

No releases published

尚未发布任何 release

[**Contributors**](https://github.com/baichuan-inc/Baichuan-7B/graphs/contributors) **7**

![Image block](images/p08-languages.png)

**Languages**

[**Python** 99.7%](https://github.com/baichuan-inc/Baichuan-7B/search?l=python) [**Shell** 0.3%](https://github.com/baichuan-inc/Baichuan-7B/search?l=shell)
