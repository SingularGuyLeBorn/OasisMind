---
title: "OLMoASR：开放鲁棒语音识别模型与训练数据 · 对照译稿"
category: "多模态与 OCR"
tags: ["OLMoASR", "ASR", "Whisper", "语音识别", "开放数据"]
published: true
excerpt: "OLMoASR 公开大规模语音数据、过滤管线与多档模型，用受控实验研究数据规模和质量如何影响零样本语音识别。"
---

<!-- arXiv 2508.20869; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/olmoasr/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 17 -->

Technical Report

OLMOASR: OPEN MODELS AND DATA FOR TRAINING ROBUST SPEECH RECOGNITION MODELS

Huong Ngo1,2∗Matt Deitke Martijn Bartelds3 Sarah Pratt2

Josh Gardner† Matt Jordan1,† Ludwig Schmidt2∗,3,†

1Allen Institute for AI, 2University of Washington, 3Stanford University

ABSTRACT

Improvements in training data scale and quality have led to significant advances, yet its influence in speech recognition remains underexplored. In this paper, we present a large-scale dataset, OLMOASR-POOL, and series of models, OL- MOASR, to study and develop robust zero-shot speech recognition models. Be- ginning from OLMOASR-POOL, a collection of 3M hours of English audio and 17M transcripts, we design text heuristic filters to remove low-quality or mistran- scribed data. Our curation pipeline produces a new dataset containing 1M hours of high-quality audio-transcript pairs, which we call OLMOASR-MIX. We use OLMOASR-MIX to train the OLMOASR suite of models, ranging from 39M (tiny.en) to 1.5B (large.en) parameters. Across all model scales, OLMOASR achieves comparable average performance to OpenAI’s Whisper on short and long-form speech recognition benchmarks. Notably, OLMOASR-medium.en attains a 12.8% and 11.0% word error rate (WER) that is on par with Whis- per’s largest English-only model Whisper-medium.en’s 12.4% and 10.5% WER for short and long-form recognition respectively (at equivalent parameter count). OLMOASR-POOL, OLMOASR-MIX, OLMOASR models, and filtering, train- ing and evaluation code will be made publicly available to further research on robust speech processing.

训练数据规模和质量的改进带来了重大进步，但其对语音识别的影响仍未得到充分探索。在本文中，我们提出了一个大规模数据集 OLMOASR-POOL 和一系列模型 OL-MOASR，以研究和开发鲁棒的零样本语音识别模型。从 OLMOASR-POOL（300 万小时的英语音频和 1700 万份转录本的集合）开始，我们设计了文本启发式过滤器来删除低质量或错误转录的数据。我们的管理管道生成一个新数据集，其中包含 100 万小时的高质量音频转录对，我们将其称为 OLMOASR-MIX。我们使用 OLMOASR-MIX 来训练 OLMOASR 模型套件，参数范围从 39M (tiny.en) 到 1.5B (large.en)。在所有模型规模上，OLMOASR 在短格式和长格式语音识别基准测试中实现了与 OpenAI 的 Whisper 相当的平均性能。其中，OLMOASR-medium.en 的单词错误率 (WER) 达到了 12.8% 和 11.0%，与 Whisper 最大的纯英语模型 Whisper-medium.en 的短形式和长形式识别的 WER 分别为 12.4% 和 10.5%（参数数量相同）相当。 OLMOASR-POOL、OLMOASR-MIX、OLMOASR 模型以及过滤、训练和评估代码将公开，以进一步研究鲁棒语音处理。

1 INTRODUCTION · 引言

Foundation models trained on web-scale data have changed the landscape of AI. Scaling up models for language, vision-language, and speech has led to breakthroughs such as GPT (Brown et al., 2020), CLIP (Radford et al., 2021), and Whisper (Radford et al., 2023), and the generalization capabilities of these new models has enabled a wide range of new applications. Training data is key to these advances: modern AI models rely on large training sets harvested from the Web that combine both broad data collection with detailed curation. For instance, the latest language models are now trained on trillions of text tokens produced by sophisticated data pipelines (Grattafiori et al., 2024; Liu et al., 2024; Li et al., 2024; OLMo et al., 2024; Liu et al., 2023).

基于网络规模数据训练的基础模型已经改变了人工智能的格局。语言、视觉语言和语音模型的扩展已经带来了突破，例如 GPT (Brown et al., 2020)、CLIP (Radford et al., 2021) 和 Whisper (Radford et al., 2023)，这些新模型的泛化能力催生了广泛的新应用。训练数据是这些进步的关键：现代人工智能模型依赖于从网络上收集的大型训练集，这些训练集将广泛的数据收集与详细的管理结合起来。例如，最新的语言模型现在使用复杂的数据管道生成的数万亿个文本标记进行训练（Grattafiori 等人，2024 年；Liu 等人，2024 年；Li 等人，2024 年；OLMo 等人，2024 年；Liu 等人，2023 年）。

arXiv:2508.20869v1  [cs.SD]  28 Aug 2025

The importance of web-scale training data has led to increasing interest in datasets, including sev- eral efforts to build open datasets for training foundation models. In the text domain, researchers have introduced a multitude of datasets such as C4 (Raffel et al., 2023), the Pile (Gao et al., 2020), RedPajama (Weber et al., 2024), RefinedWeb (Penedo et al., 2023), Dolma (Soldaini et al., 2024), DCLM (Li et al., 2025), FineWeb (Penedo et al., 2024a), Nemotron-CC (Su et al., 2025), etc. In addition, researchers have proposed a wide range of data curation methods (Li et al., 2024; Su et al., 2024; Penedo et al., 2024a; 2023; Wettig et al., 2025). Together, these efforts have enabled multiple open source language models that in some cases are competitive with closed-source models and serve as an important starting point for open research. Similarly, the open image-text datasets such as YFCC, LAION, and DataComp have served as a catalyst for research on multimodal learning, leading to reproductions of frontier commercial models such as OpenCLIP (Cherti et al., 2023). The speech domain, however, is currently lagging behind the other modalities: where there are impor- tant efforts such as OWSM (Peng et al., 2023) and YODAS (Li et al., 2023), there is currently no

网络规模训练数据的重要性导致人们对数据集的兴趣日益浓厚，包括为训练基础模型构建开放数据集的一些努力。在文本领域，研究人员引入了多种数据集，例如 C4 (Raffel et al., 2023)、Pile (Gao et al., 2020)、RedPajama (Weber et al., 2024)、RefinedWeb (Penedo et al., 2023)、Dolma (Soldaini et al., 2024)、DCLM (Li et al., 2024)、DCLM (Li et al., 2024) 2025）、FineWeb（Penedo et al., 2024a）、Nemotron-CC（Su et al., 2025）等。此外，研究人员提出了多种数据管理方法（Li et al., 2024; Su et al., 2024; Penedo et al., 2024a; 2023; Wettig et al., 2025）。总之，这些努力使得多种开源语言模型成为可能，这些模型在某些情况下可以与闭源模型竞争，并成为开放研究的重要起点。同样，YFCC、LAION 和 DataComp 等开放图文数据集也成为多模态学习研究的催化剂，导致 OpenCLIP 等前沿商业模型的复制（Cherti et al., 2023）。然而，语音领域目前落后于其他模式：在 OWSM (Peng et al., 2023) 和 YODAS (Li et al., 2023) 等重要工作领域，目前还没有

†Equal senior contributions. Authors are listed alphabetically by last name. ∗Part of work done while at University of Washington.

†同等高级贡献。作者按姓氏字母顺序列出。 ＊在华盛顿大学期间完成的部分工作。

1

<!-- page 2 of 17 -->

Technical Report

open-source reproduction of the full-scale Whisper (Radford et al., 2023) models, nor a publicly available training set to begin such an effort. This is despite the widespread use and significant im- pact of the Whisper model1, and the stated importance of large-scale, high-quality data to Whisper’s performance (Radford et al., 2023).

全尺寸 Whisper（Radford 等人，2023）模型的开源复制，也没有公开可用的训练集来开始这种努力。尽管 Whisper 模型得到了广泛使用并产生了重大影响，并且大规模、高质量数据对 Whisper 性能的重要性也被提及（Radford 等人，2023）。

Short-form Speech Recognition

Short-form Speech Recognition

6.5

35

6.0

Whisper OLMoASR + OLMoASR-Mix OLMoASR + no quality filtering subset OLMoASR + YODAS

Whisper OLMoASR + OLMoASR-Mix OLMoASR + no quality filtering subset OLMoASR + YODAS

5.5

30

5.0

25

4.5

Average WER

4.0

20

3.5

WER on LibriSpeech.test-clean

15

3.0

2.5

tiny base small medium large Model Size

tiny base small medium large Model Size

Figure 1: Performance on LibriSpeech.test-clean (left) and average performance across 14 short- form speech recognition benchmarks (right) of each baseline for all possible model scales.

We address this shortcoming in the open data ecosystem by introducing OLMOASR-POOL, a dataset with 3M hours of audio and associated transcripts taken from the public internet. Start- ing from these audio-text pairs, we build a careful data curation pipeline that allows us to assemble a high-quality subset for training state-of-the-art robust, zero-shot speech recognition models. As a result of this pipeline, we propose OLMOASR-MIX, a dataset with 1M hours of audio and accom- panying transcripts, that surpasses the scale of data used to train the initial Whisper models. Our data scale matches the amount of weakly labeled data used to train the second and third versions of the Whisper models.

我们通过引入 OLMOASR-POOL 来解决开放数据生态系统中的这一缺陷，该数据集包含从公共互联网获取的 300 万小时的音频和相关文字记录。从这些音频文本对开始，我们构建了一个仔细的数据管理管道，使我们能够组装高质量的子集来训练最先进的鲁棒、零样本语音识别模型。作为这个管道的结果，我们提出了 OLMOASR-MIX，这是一个包含 100 万小时音频和随附文字记录的数据集，超过了用于训练初始 Whisper 模型的数据规模。我们的数据规模与用于训练第二个和第三个版本 Whisper 模型的弱标记数据量相匹配。

We validate the quality of OLMOASR-MIX by training a range of models following the Whisper architecture and training recipe. The resulting family of models, OLMOASR, closely matches the quality of Whisper on a wide range of benchmarks and across multiple compute scales up to the largest Whisper model scale (see Figure 1 and Figure 3). In addition, our models outperform other open data speech recognition models such as OWSM (see Table 8), wav2vec, and HuBERT (see Table 9) across a range of short- and long-form speech recognition benchmarks. Our experiments show that our data curation pipeline is key to the success of our models: compared to a baseline that was trained on a filtered OLMOASR-POOL to remove non-English audio-transcript pairs, our actual training set OLMOASR-MIX consistently improves performance across compute scales (see Figure 3). A key step in our pipeline is removing repeating lines, which improves performance by 14.5% WER (percentage points). A dataset quality ablation also demonstrates that training an OLMOASR model on a weakly-supervised, web-scale data collection like OLMOASR-MIX results in better performance across many evaluation sets compared to training on academic datasets.

我们通过遵循 Whisper 架构和训练配方训练一系列模型来验证 OLMOASR-MIX 的质量。由此产生的模型系列 OLMOASR 在各种基准测试和跨多个计算规模直至最大 Whisper 模型规模上与 Whisper 的质量非常匹配（参见图 1 和图 3）。此外，我们的模型在一系列短格式和长格式语音识别基准测试中优于其他开放数据语音识别模型，例如 OWSM（见表 8）、wav2vec 和 HuBERT（见表 9）。我们的实验表明，我们的数据管理管道是模型成功的关键：与在过滤后的 OLMOASR-POOL 上训练以删除非英语音频转录对的基线相比，我们的实际训练集 OLMOASR-MIX 持续提高了跨计算规模的性能（见图 3）。我们管道中的一个关键步骤是删除重复行，这将性能提高了 14.5% WER（百分点）。数据集质量消融还表明，与在学术数据集上进行训练相比，在 OLMOASR-MIX 等弱监督的网络规模数据集合上训练 OLMOASR 模型可以在许多评估集上获得更好的性能。

We publicly release the IDs of the audio-text pairs in OLMOASR-POOL and OLMOASR-MIX as a starting point for research on speech training data. Our hope is that this will enable new re- search on data curation and speech recognition, similar to the LAION-5B project for multimodal learning and DataComp-LM for language modeling. In addition, providing a web-scale speech recognition training set increases transparency around current approaches to AI training and enables research on bias in datasets, fairness, privacy, and data auditing. Given the sensitive nature of train- ing data, we strongly recommend that OLMOASR-POOL and OLMOASR-MIX should only be used for academic research purposes in its current form. We advise against any applications in de- ployed systems without carefully investigating the legal, privacy, and fairness risks associated with OLMOASR-POOL and OLMOASR-MIX.

我们公开发布 OLMOASR-POOL 和 OLMOASR-MIX 中音频文本对的 ID，作为语音训练数据研究的起点。我们希望借此促进数据管理和语音识别方面的新研究，类似于多模态学习的 LAION-5B 项目和语言建模的 DataComp-LM 项目。此外，提供网络规模的语音识别训练集可以提高当前人工智能训练方法的透明度，并支持对数据集偏差、公平性、隐私和数据审计的研究。鉴于训练数据的敏感性，我们强烈建议 OLMOASR-POOL 和 OLMOASR-MIX 仅以当前形式用于学术研究目的。我们建议不要在未仔细调查与 OLMOASR-POOL 和 OLMOASR-MIX 相关的法律、隐私和公平风险的情况下在部署的系统中使用任何应用程序。

1Whisper is, for example, OpenAI’s most-starred repository on GitHub, and various official versions of Whisper have garnered at least 17M downloads on Hugging Face as of the date of this publication.

例如，1Whisper 是 OpenAI 在 GitHub 上星级最高的存储库，截至本文发布之日，Whisper 的各种官方版本在 Hugging Face 上已获得至少 1700 万次下载。

2

<!-- page 3 of 17 -->

Technical Report

Our training data is available at https://huggingface.co/datasets/allenai/OLMoASR-Pool, code can be found at https://github.com/allenai/OLMoASR and models are available at https://huggingface.co/datasets/allenai/OLMoASR.

我们的训练数据可在 https://huggingface.co/datasets/allenai/OLMoASR-Pool 上找到，代码可在 https://github.com/allenai/OLMoASR 上找到，模型可在 https://huggingface.co/datasets/allenai/OLMoASR 上找到。

2 DATA · 数据

2.1 MOTIVATION · 动机

Whisper (Radford et al., 2023) demonstrated an approach of scaling speech recognition datasets to achieve strong generalization and robustness. While the related work focused on studying the impact of data scaling on zero-shot generalization, not much is known about the impact of dataset design and the dataset itself was never made publicly accessible.

Whisper（Radford 等人，2023）演示了一种扩展语音识别数据集以实现强大的泛化性和鲁棒性的方法。虽然相关工作的重点是研究数据扩展对零样本泛化的影响，但人们对数据集设计的影响知之甚少，而且数据集本身从未公开访问。

Open Whisper-style Speech Model (OWSM) (Peng et al., 2023; 2024a;b) is an effort to reproduce Whisper with open-source tools, but trained on a mix of academic datasets. (Tian et al., 2024) in- vestigates the effects of data quality on OWSM models using the same mix. However, studying and training on such data pool does not enable rigorous investigation into Whisper’s zero-shot ca- pability. Moreover, the performance of those models demonstrate that despite improvements to the architecture or training recipe, dataset composition plays a central role in supplying the model’s generalization and robust capabilities.

开放 Whisper 式语音模型 (OWSM)（Peng 等人，2023；2024a；b）是使用开源工具重现 Whisper 的努力，但在混合学术数据集上进行训练。 （Tian 等人，2024）使用相同的组合研究了数据质量对 OWSM 模型的影响。然而，对此类数据池的研究和训练并不能严格研究 Whisper 的零样本能力。此外，这些模型的性能表明，尽管对架构或训练方法进行了改进，但数据集组成在提供模型的泛化和鲁棒功能方面发挥着核心作用。

To address this knowledge gap, we conduct experiments on a collection of weakly-supervised audio- transcript data that is on the same scale as Whisper’s dataset to analyze how different dataset design choices affect a speech recognition model’s downstream performance. Model architecture, training code and evaluation setup are controlled and only the data is changed. More specifically, we use the same architecture, tokenizer and evaluation setup as Whisper. As Whisper did not publish their training and data processing code, we construct a training loop and data processing pipeline to the best of our abilities to match what Whisper used. To validate that our training loop was correct, we monitor the model’s training and validation loss curves.

为了解决这一知识差距，我们对与 Whisper 数据集规模相同的弱监督音频转录数据集进行了实验，以分析不同的数据集设计选择如何影响语音识别模型的下游性能。模型架构、训练代码和评估设置受到控制，仅更改数据。更具体地说，我们使用与 Whisper 相同的架构、分词器和评估设置。由于 Whisper 没有发布他们的训练和数据处理代码，因此我们尽最大努力构建训练循环和数据处理管道以匹配 Whisper 使用的内容。为了验证我们的训练循环是否正确，我们监控模型的训练和验证损失曲线。

2.2 CURATION · 数据筛选

In this section, we describe the curation choices made to achieve OLMOASR-MIX and quantify the impact of the curation layer. Firstly, to ensure that the audio and text language matches, we perform audio-text language alignment (Section 2.2.1). Next, we experiment with different text- based heuristics (Section 2.2.2) to remove low-quality audio-text pairs. We will also explain what type of low-quality data we are targeting at each layer. Finally, we perform fuzzy decontamination and deduplication (Appendix C) on the transcripts to remove contaminated or duplicated audio-text pairs. Figure 2 visually illustrates each step in removing low quality data and denotes their respective percentages of data removed.

在本节中，我们将描述为实现 OLMOASR-MIX 所做的管理选择，并量化管理层的影响。第一步，为了确保音频和文本语言匹配，我们执行音频-文本语言对齐（第 2.2.1 节）。接下来，我们尝试使用不同的基于文本的启发式方法（第 2.2.2 节）来删除低质量的音频文本对。我们还将解释我们针对每一层的低质量数据类型。末尾，我们对转录本进行模糊去污和重复数据删除（附录 C），以删除受污染或重复的音频文本对。图 2 直观地说明了删除低质量数据的每个步骤，并表示了它们各自删除的数据的百分比。

All experiments are performed on the OLMOASR-tiny.en model and compared to a baseline that has only been trained on data filtered with the audio-text language alignment filter. We use this baseline as it does not target the quality of transcripts. This will be referred to as the ”no quality filtering” baseline from this point onward. To assess them, we use the word error rate (WER) metric which calculates the percentage of words that were incorrectly predicted when compared to a reference text.

所有实验均在 OLMOASR-tiny.en 模型上进行，并与仅使用音频文本语言对齐过滤器过滤的数据进行训练的基线进行比较。我们使用此基线是因为它不针对转录本的质量。从此时起，这将被称为“无质量过滤”基线。为了评估它们，我们使用单词错误率 (WER) 指标，该指标计算与参考文本相比错误预测的单词百分比。

2.2.1 AUDIO-TEXT LANGUAGE ALIGNMENT

To ensure that we are training on only English audio-text pairs, a spoken language identification model, VoxLingua107 (Valk & Alum¨ae, 2021), is used to tag the audio sample with the spoken language, and pycld2 to tag the corresponding transcript sample with the text language. The top-1 predicted language from both models are chosen as the tagged languages. We then remove audio-text pairs where the tagged audio and text language are not both English.

为了确保我们仅对英语音频文本对进行训练，使用口语识别模型 VoxLingua107（Valk & Alum¡ae，2021）来用口语标记音频样本，并使用 pycld2 用文本语言标记相应的转录样本。两个模型中的前 1 个预测语言被选为标记语言。然后，我们删除标记的音频和文本语言不都是英语的音频文本对。

2.2.2 TEXT HEURISTICS

There is no guarantee that the transcripts are manual transcriptions of the audio from the public internet. In fact, many publicly accessible transcripts are produced by speech recognition sys-

无法保证文字记录是来自公共互联网的音频的手动转录。事实上，许多可公开访问的文字记录都是由语音识别系统生成的

3

<!-- page 4 of 17 -->

Technical Report

Figure 2: Construction of OLMOASR-MIX from OLMOASR-POOL. Segmentation reduces OLMOASR-POOL from 3M to 2.4M hours. Percentages are relative to most recent filtered sub- set, based on the number of hours or segments.

tems. Recent work has illustrated inferior performance from training on automatic transcripts for speech recognition (Li et al., 2023) or a mix of human and machine-labeled data on translation systems (Fernandes et al., 2023). Through manual examination, we identify text characteristics of machine-generated transcripts that can be used as filtering heuristics.

项目。最近的研究表明，语音识别自动转录训练（Li et al., 2023）或翻译系统上人类和机器标记数据的混合训练（Fernandes et al., 2023）的性能较差。通过手动检查，我们识别机器生成的记录的文本特征，这些特征可用作过滤启发法。

Exploratory analysis uncovered a non-trivial number of audio-text pairs where the transcriptions are unfaithful and unrelated to the audio. There are also instances of partial transcriptions, and temporally misaligned transcriptions. To remove them, each audio-text pair is scored based on the WER between the manually uploaded and an associated machine-generated text, then omitting pairs where the score is lower than a specific threshold.

探索性分析发现了大量音频文本对，其中转录不忠实且与音频无关。还存在部分转录和时间上错位转录的情况。为了删除它们，每个音频文本对都会根据手动上传的文本和相关的机器生成的文本之间的 WER 进行评分，然后忽略分数低于特定阈值的对。

Text casing. Through examining audio-text pairs, we noticed that a lot of machine-generated tran- scripts contain text that is mostly made up of lower or upper case characters. We designed a case detector to loop through each transcript line and keep counts of the respective cases. The case type with the highest frequency is the resulting case tag of the audio-text pair. In Table 1, removing audio-text pairs that have been tagged with upper or lower case types improves short-form WER by 4.8% after removing 32.0% of the data.

文本大小写。通过检查音频文本对，我们注意到许多机器生成的文本包含主要由小写或大写字符组成的文本。我们设计了一个病例检测器来循环遍历每个转录行并记录各个病例的计数。频率最高的案例类型是音频-文本对的结果案例标签。在表 1 中，删除已用大写或小写类型标记的音频文本对在删除 32.0% 的数据后将短格式 WER 提高了 4.8%。

Short-form

Percent remaining

Filtering strategy Data hours

WER

(%)

No quality filtering 2,010,447 - 37.2 Upper-case or lower-case removal 1,367,506 68.0 32.4

Table 1: Filtering out transcripts with upper or lower case improves WER performance on short- form transcription. Short-form WER refers to the average performance across 14 short-form speech recognition datasets. Percent remaining is based on number of hours or segments remaining from filter relative to the no quality filtering strategy.

Presence of repeating lines. Another issue with machine-generated transcripts is the repetition of lines, which can misalign audio and text. To detect these, we check if each line matches the previous one exactly. Table 2 shows that the removal of repeats reduces the short-form WER by 14.4% while removing 39.9% of the data.

存在重复行。机器生成的文字记录的另一个问题是行的重复，这可能会导致音频和文本不一致。为了检测这些，我们检查每一行是否与前一行完全匹配。表 2 显示，删除重复项将短格式 WER 降低了 14.4%，同时删除了 39.9% 的数据。

We also test combining casing and repeat filters. Table 2 shows that filtering by both repeats, and lower and upper case yields a WER 0.7% higher than just repeats and mostly uppercase text, while removing more data. Therefore, our final curation only filters based on the presence of repeating lines and mostly upper case text.

我们还测试了组合套管和重复过滤器。表 2 显示，按重复、小写和大写进行过滤的 WER 比仅重复和大部分大写文本高出 0.7%，同时删除了更多数据。因此，我们的最终管理仅根据重复行和大部分大写文本的存在进行过滤。

4

<!-- page 5 of 17 -->

Technical Report

Short-form

Percent remaining

Filtering strategy Data hours

WER

(%)

No quality filtering 2,010,447 - 37.2 Repeating lines removal 1,207,676 60.1 22.7 Repeating lines removal and upper-case removal 1,139,722 56.7 21.9 Repeating lines removal and upper and lower case removal 944,106 47.0 22.6

Table 2: Filtering out transcripts with repeating lines improves WER performance on short-form transcription. Short-form WER refers to the average performance across 14 short-form speech recognition datasets. Percent remaining is based on number of hours or segments remaining from filter relative to the no quality filtering strategy.

Manual-machine text comparison. Unfaithful or misaligned transcripts can cause the model to learn from poorly matched audio-text pairs. To filter these, we compare a manual transcript with its machine-generated version using WER. Although automatic transcripts are less precise, they reliably capture speech utterances, making them effective for identifying low-quality data. Pairs with WER above a set threshold are removed.

手动-机器文本比较。不忠实或错位的转录可能会导致模型从不匹配的音频文本对中学习。为了过滤这些内容，我们使用 WER 将手动记录与其机器生成的版本进行比较。尽管自动转录不太精确，但它们可以可靠地捕获语音，从而可以有效识别低质量数据。 WER 高于设定阈值的配对将被删除。

We use two variants: manual-machine document-level and segment-level comparison. The document-level filter mainly detects unrelated transcripts, but might confound minor differences with misalignments. Manual inspection also showed that sections of poorly-aligned transcripts can be recovered, so we also utilize a segment-level filter for more fine-grained filtering. Through ex- periments, we determined thresholds of 0.5 for document-level and 0.7 for segment-level filtering.

我们使用两种变体：手动机器文档级比较和段级比较。文档级过滤器主要检测不相关的转录本，但可能会混淆微小差异和错位。手动检查还表明，对齐不良的转录本部分可以恢复，因此我们还利用片段级过滤器进行更细粒度的过滤。通过实验，我们确定文档级过滤的阈值为 0.5，段级过滤的阈值为 0.7。

Table 3 illustrates that employing this filter improves WER performance on short-form transcription by 16.5% after removing 54.8% of the data.

Short-form

Percent remaining

Filtering strategy Data hours

WER

(%)

No quality filtering 2,010,447 - 37.2 Manual-machine text comparison 908,923 45.2 20.7

Table 3: Employing manual-machine text comparison filter improves WER performance on short- form transcription. Short-form WER refers to the average performance across 14 short-form speech recognition datasets. Percent remaining is based on number of hours or segments remaining from filter relative to the no quality filtering strategy.

3 MODEL AND TRAINING · 模型与训练

3.1 MODEL · 模型

To fully understand the impact of our data curation methodology on producing robust speech recog- nition systems with strong zero-shot capabilities, we utilize Whisper’s model architecture and tok- enizer. We have only modified the architecture code to use FlashAttention (Dao et al., 2022) in the attention module and incorporate the causal and padding mask for batch training.

为了充分了解我们的数据管理方法对生成具有强大零样本功能的强大语音识别系统的影响，我们利用 Whisper 的模型架构和分词器。我们仅修改了架构代码以在注意力模块中使用 FlashAttention（Dao 等人，2022），并合并用于批量训练的因果和填充掩码。

3.2 TRAINING DETAILS · 训练细节

In contrast to the Whisper training procedure, we train with a larger batch size, reconfigure the learning rate and warmup scheduler, and total steps trained accordingly. This was done to leverage available compute and maximize efficient distributed training. Moreover, we retain the same maxi- mum learning rate for all scales and do not perform hyperparameter tuning. For OLMOASR-tiny.en, OLMOASR-base.en and OLMOASR-small.en we train with Distributed Data Parallel (DDP) us- ing FP16 with dynamic loss scaling. In contrast, OLMOASR-medium.en and OLMOASR-large.en

与 Whisper 训练过程相反，我们使用更大的批量大小进行训练，重新配置学习率和预热调度程序，并相应地训练总步骤。这样做是为了利用可用的计算并最大限度地提高分布式训练的效率。此外，我们为所有尺度保留相同的最大学习率，并且不执行超参数调整。对于 OLMOASR-tiny.en、OLMOASR-base.en 和 OLMOASR-small.en，我们使用具有动态损失缩放功能的 FP16 进行分布式数据并行（DDP）训练。相比之下，OLMOASR-medium.en 和 OLMOASR-large.en

5

<!-- page 6 of 17 -->

Technical Report

were trained with Fully Sharded Data Parallel (FSDP) using bfloat16 with dynamic loss scaling and activation checkpointing. We found that training with FSDP using bfloat16 provided better training stability than with FP16.

使用具有动态损失缩放和激活检查点的 bfloat16 通过完全分片数据并行 (FSDP) 进行训练。我们发现使用 bfloat16 进行 FSDP 训练比使用 FP16 提供更好的训练稳定性。

4 RESULTS AND DISCUSSION · 结果与讨论

4.1 EVALUATION METHODOLOGY · 评测方法

To properly assess how our dataset design approach contributes to OLMOASR’s zero-shot general- ization ability, we evaluate our model on a suite of 21 datasets that have not been used for training, 14 short-form and 7 long-form sets. To maintain comparable evaluation with Whisper (Radford et al., 2023), we use greedy decoding for short-form and beam search for long-form. The evalu- ation sets will assess the model’s capabilities in contexts such as audio book recordings, lectures, calls and meetings. Moreover, these datasets contain speech of short and long utterances, different accents, high and low signal clarity. We also study how useful OLMOASR-MIX is as a robustness intervention, utilizing effective and relative robustness from (Taori et al., 2020).

为了正确评估我们的数据集设计方法如何有助于 OLMOASR 的零样本泛化能力，我们在一组尚未用于训练的 21 个数据集（14 个短格式集和 7 个长格式集）上评估了我们的模型。为了保持与 Whisper 的可比评估（Radford et al., 2023），我们对短格式使用贪婪解码，对长格式使用波束搜索。评估集将评估模型在有声读物录音、讲座、通话和会议等环境中的能力。此外，这些数据集包含短话和长话、不同口音、高和低信号清晰度的语音。我们还利用（Taori 等人，2020）的有效和相对稳健性，研究了 OLMOASR-MIX 作为稳健性干预措施的有用性。

Short-form Speech Recognition

Long-form Speech Recognition

24

35

22

Whisper OLMoASR + OLMoASR-Mix OLMoASR + no quality filtering subset OLMoASR + YODAS

Whisper OLMoASR + OLMoASR-Mix OLMoASR + no quality filtering subset OLMoASR + YODAS

20

30

18

25

16

Average WER

Average WER

20

14

12

15

10

tiny base small medium large Model Size

tiny base small medium large Model Size

Figure 3: Average performance across 14 short-form speech recognition benchmarks (left) and across 7 long-form speech recognition benchmarks (right) of each baseline for all possible model scales.

4.2 ZERO-SHOT PERFORMANCE ACROSS DATASETS · 跨数据集零样本表现

Primary results. Average performance across 14 short and 7 long-form evaluation sets can be found in Figure 3. Short-form performance from each dataset can be found in Table 4 and long- form results can be found in Table 5. Below, we establish core findings from our main baseline.

初步结果。 14 个简短评估集和 7 个长评估集的平均表现如图 3 所示。每个数据集的简短表现可在表 4 中找到，长评估结果可在表 5 中找到。下面，我们根据主要基线建立了核心发现。

OLMOASR-MIX enables OLMOASR’s competitive zero-shot capability. From Figure 3, OLMOASR is comparable to Whisper (Radford et al., 2023), the current state-of-the-art zero-shot ASR, with the largest average performance gap being 0.4% for short-form and 1% for long-form.

OLMOASR-MIX 实现了 OLMOASR 具有竞争力的零射击能力。从图 3 中可以看出，OLMOASR 与当前最先进的零样本 ASR Whisper (Radford et al., 2023) 相当，最大平均性能差距为短格式 0.4%，长格式 1%。

For short-form transcription, OLMOASR performs on-par with Whisper at tiny to small scales. However, the gap widens at 769M and 1.5B, which may be due to lack of hyperparameter tuning or differences in data scale. Specifically, OLMOASR-large.en was trained on 440K hours of English data per pass, while Whisper used 680K hours of multilingual data. For a more fair comparison, we re-trained OLMOASR-large.en on 680K hours of English data which reduces the gap from 0.8% to 0.4%. This is denoted as OLMOASR-large.en-v2 on 4.

对于短格式转录，OLMOASR 在微小到小尺度上的表现与 Whisper 相当。然而，差距在 769M 和 1.5B 处扩大，这可能是由于缺乏超参数调整或数据规模的差异所致。具体来说，OLMOASR-large.en 每次使用 44 万小时的英语数据进行训练，而 Whisper 使用 68 万小时的多语言数据。为了更公平的比较，我们使用 68 万小时的英语数据重新训练 OLMOASR-large.en，将差距从 0.8% 缩小到 0.4%。这在 4 上表示为 OLMOASR-large.en-v2。

For long-form transcription, OLMOASR-tiny.en and OLMOASR-base.en outperform Whisper’s equivalents, and OLMOASR-small.en is on par with Whisper-small.en. At larger scales, the perfor- mance gap reappears for similar reasons as in short-form transcription.

对于长格式转录，OLMOASR-tiny.en 和 OLMOASR-base.en 优于 Whisper 的同等版本，OLMOASR-small.en 与 Whisper-small.en 相当。在更大的规模上，由于与短格式转录类似的原因，性能差距再次出现。

Data curation is vital to achieve strong zero-shot generalization. OLMOASR on all model scales benefits from data curation, especially OLMOASR-tiny.en for short-form and long-form,

数据管理对于实现强大的零样本泛化很关键。所有模型规模的 OLMOASR 都受益于数据管理，尤其是针对短格式和长格式的 OLMOASR-tiny.en，

6

<!-- page 7 of 17 -->

Technical Report

LibriSpeech.test-other

CallHome

LibriSpeech.test-clean

AMI-SDM

WSJ

Artie

TED-LIUM3

Switchboard

AMI-IHM

CHiME6

CommonVoice5.1

CORAAL

VoxPopuli.en

Fleurs.en.us

Average

Model

OLMOASR (Open weights, code, data) vs. Whisper (Open weights, closed training code, data)

OLMOASR-tiny.en 5.1 12.3 5.5 5.6 23.9 18.7 25.1 19.3 25.7 45.2 24.2 55.4 11.6 9.7 20.5 Whisper tiny.en 5.6 14.6 6.0 5.0 24.1 17.8 26.3 20.0 23.9 41.3 23.7 50.3 11.7 11.6 20.1

OLMOASR-base.en 3.7 9.0 4.6 4.3 20.5 14.0 18.5 13.6 21.5 38.0 20.4 47.8 9.7 6.7 16.6 Whisper base.en 4.2 10.2 4.9 4.6 20.9 15.2 19.0 13.4 22.6 36.4 20.5 46.7 10.0 7.6 16.9

OLMOASR-small.en 3.0 7.0 4.2 3.8 16.7 13.2 13.1 9.6 19.6 30.6 18.7 39.9 8.7 5.0 13.8 Whisper small.en 3.1 7.4 4.0 3.3 18.2 15.7 13.1 9.7 20.2 27.6 17.5 38.0 8.1 6.0 13.7

OLMOASR-medium.en 3.5 5.7 5.0 3.6 14.3 12.7 11.3 7.5 18.7 28.5 16.9 38.3 8.4 4.4 12.8 Whisper medium.en 3.1 6.3 4.1 3.3 16.2 14.1 10.6 7.6 17.5 25.3 16.4 37.2 7.4 5.0 12.4

OLMOASR-large.en 2.6 5.9 4.5 3.7 16.5 12.7 11.1 7.9 18.7 30.7 16.4 38.8 8.1 4.5 13.0 OLMOASR-large.en-v2 2.7 5.6 4.2 3.6 15.0 11.7 11.1 7.8 18.1 29.4 17.1 38.0 8.0 4.2 12.6 Whisper large-v1 2.7 5.6 4.0 3.1 15.8 13.1 9.5 6.7 19.4 25.6 16.4 36.9 7.3 4.6 12.2

Whisper large-v2 2.7 5.2 4.0 3.9 17.6 13.8 9.0 6.2 16.2 25.5 16.9 36.4 7.3 4.4 12.1 Whisper large-v3 2.0 3.9 3.9 3.5 14.0 13.2 8.4 5.9 18.7 26.8 16.0 34.2 9.5 4.0 11.7 Whisper large-v3-turbo 2.2 4.2 3.5 3.5 13.2 12.9 9.7 6.3 18.6 27.3 16.1 35.2 12.2 4.4 12.1

Table 4: Short-form English transcription WER (%) with greedy decoding, comparing between OLMOASR and Whisper models.

Effective and Relative Robustness

100

Zero-shot OLMoASR models Zero-shot Whisper models Supervised LibriSpeech models

90

80

70

60

50

40

30

20

Average WER on AMI, CommonVoice, CHiME-6, CORAAL (%)

2 3 4 5 6 WER on LibriSpeech test-clean (%)

Figure 4: We plot 11 supervised models trained on LibriSpeech without any robustness interventions and demonstrate their WER on a reference test set and the average WER across 5 out-of-distribution evaluation sets. We also plot zero-shot OLMOASR models to compare to the standard models, and Whisper models to demonstrate OLMOASR’s similar robustness capability.

and OLMOASR-medium.en for long-form. This can be observed from the performance discrepancy between OLMOASR trained on the no quality filtering subset and OLMOASR-MIX on short and long-form in Figure 3.

和 OLMOASR-medium.en（长格式）。从图 3 中在无质量过滤子集上训练的 OLMOASR 与在短格式和长格式上训练的 OLMOASR-MIX 之间的性能差异可以观察到这一点。

4.3 ROBUSTNESS GAINED FROM WEB-SCALE DATA · 网络规模数据带来的稳健性

Effective robustness. Following (Taori et al., 2020), effective robustness measures how much a model outperforms the expected baseline on out-of-distribution data, given its in-distribution perfor- mance. A positive gap indicates stronger robustness than a standard model.

有效的稳健性。按照（Taori 等人，2020）的说法，有效稳健性衡量的是模型在分布外数据上优于预期基线的程度（考虑到其分布内性能）。正差距表明比标准模型具有更强的鲁棒性。

To evaluate OLMOASR’s effective robustness, we use LibriSpeech test-clean as the in-distribution set and five out-of-distribution sets: AMI (AMI-IHM, AMI-SDM), CommonVoice, CHiME-6, and CORAAL, covering diverse speakers and conditions.

为了评估 OLMOASR 的有效鲁棒性，我们使用 LibriSpeech test-clean 作为分布内集和五个分布外集：AMI（AMI-IHM、AMI-SDM）、CommonVoice、CHiME-6 和 CORAAL，涵盖不同的说话者和条件。

7

<!-- page 8 of 17 -->

Technical Report

TED-LIUM3

Meanwhile

Kincaid46

Rev16

Earnings-21

Earnings-22

CORAAL

Average

Model

OLMOASR (Open weights, code, data) vs. Whisper (Open weights, closed training code, data)

OLMOASR-tiny.en 4.8 12.6 13.6 14.0 14.2 20.0 30.2 15.6 Whisper tiny.en 5.5 12.8 13.8 15.1 17.0 22.0 30.3 16.6

OLMOASR-base.en 3.9 10.2 11.2 12.0 11.1 15.6 26.1 12.9 Whisper base.en 4.6 9.4 11.2 13.2 12.5 16.6 25.2 13.2

OLMOASR-small.en 3.6 7.4 10.2 11.5 10.1 14.0 23.4 11.5 Whisper small.en 4.6 6.0 9.4 12.0 10.8 14.0 21.9 11.2

OLMOASR-medium.en 3.3 6.9 9.4 12.5 9.5 13.5 21.9 11.0 Whisper medium.en 3.6 5.2 8.9 11.9 10.2 13.3 20.6 10.5

OLMOASR-large.en 3.5 8.8 10.0 11.5 9.9 13.5 22.4 11.4 OLMOASR-large.en-v2 3.6 10.0 10.1 11.1 9.8 13.5 22.1 11.5 Whisper large-v1 3.8 5.3 8.8 11.0 10.3 13.4 20.4 10.4

Whisper large-v2 3.5 5.1 8.8 11.3 9.7 12.6 19.6 10.1 Whisper large-v3 3.2 5.2 8.3 10.2 9.4 12.8 19.4 9.8 Whisper large-v3-turbo 3.1 5.2 8.4 9.5 9.5 12.6 19.3 9.7

Table 5: Long-form English transcription WER (%) with beam search and temperature fallback, comparing between OLMOASR and Whisper models.

Figure 4 shows that although zero-shot OLMOASR models have higher WER on LibriSpeech test- clean than supervised models, they significantly outperform them on the out-of-distribution bench- marks.

Relative robustness. Effective robustness on its own is insufficient to characterize the robustness of a model. Hence, we use relative robustness to directly measure the performance difference be- tween a model with and without a robustness intervention. From Figure 4, we can examine the relative robustness OLMOASR has compared to supervised LibriSpeech models which illustrates that OLMOASR out-performs the other models on the out-of-distribution datasets.

相对稳健性。有效的稳健性本身不足以表征模型的稳健性。因此，我们使用相对鲁棒性来直接测量有鲁棒性干预和没有鲁棒性干预的模型之间的性能差异。从图 4 中，我们可以检查 OLMOASR 与监督 LibriSpeech 模型相比的相对鲁棒性，这表明 OLMOASR 在分布外数据集上优于其他模型。

OLMOASR-MIX is a useful robustness intervention. From analyzing OLMOASR’s effec- tive and relative robustness, OLMOASR exhibits positive effective and relative robustness, making OLMOASR-MIX and the curation methodology to extract it a beneficial robustness solution.

OLMOASR-MIX 是一种有用的稳健性干预措施。通过分析 OLMOASR 的有效和相对鲁棒性，OLMOASR 表现出积极的有效和相对鲁棒性，这使得 OLMOASR-MIX 和提取它的管理方法成为有益的鲁棒性解决方案。

5 ABLATIONS · 消融实验

5.1 DATASET SCALING · 数据集规模

For our main experiments, we trained on 440K hours, but OLMOASR-MIX contains 1M hours. To examine the effect of data scaling, we trained OLMOASR-74M on subsampled portions of OLMOASR-MIX: 4.8%, 21.1%, 42.1%, 65.4%, 84.5% and 100% (about 50K, 220K, 440K, 680K, 880K and 1M hours), keeping total seen data and hyperparameters constant.

对于我们的主要实验，我们训练了 440K 小时，但 OLMOASR-MIX 包含 100 万小时。为了检查数据缩放的效果，我们在 OLMOASR-MIX 的子采样部分上训练 OLMOASR-74M：4.8%、21.1%、42.1%、65.4%、84.5% 和 100%（大约 50K、220K、440K、680K、880K 和 1M 小时），保留总的可见数据和超参数常数。

Figure 5 shows that for short-form speech recognition, WER drops by 0.9% when increasing data from 50K to 220K hours (4×), but plateaus from 21.1% to 84.5%. Using the full dataset yields an additional 1.5% WER improvement. For long-form, OLMOASR shows minimal gains across scales. This suggests that beyond moderate scaling (1.5×), gains diminish: a 20× scale-up gives only a 2.1% WER boost for short-form and 0.6% for long-form. This may be due to OLMOASR- 74M being too small, the need for more data curation, longer training, or larger models.

Our work has shown that training on OLMOASR-MIX leads to strong robustness and zero-shot capabilities. Can we also quantify the performance and robustness gap between OLMOASR and other models trained on a different data mix? To address this question, we evaluate OLMOASR that has been trained on an academic dataset mix and OLMOASR that has been trained on a dataset mix containing manual and automatic transcripts.

我们的工作表明，OLMOASR-MIX 上的训练可以带来强大的鲁棒性和零样本能力。我们还可以量化 OLMOASR 与在不同数据组合上训练的其他模型之间的性能和鲁棒性差距吗？为了解决这个问题，我们评估了在学术数据集混合上训练的 OLMOASR 和在包含手动和自动成绩单的数据集混合上训练的 OLMOASR。

8

<!-- page 9 of 17 -->

Technical Report

English Speech Recognition

Short-form Long-form

17

16

15

Average WER

14

13

0.25 0.50 0.75 1.00 Fraction of OLMoASR-Mix used for training

Figure 5: We plot the average performance of OLMOASR-74M on 14 short-form and 7 long-form evaluation sets, while varying the total data trained on. The fraction of OLMOASR-MIX used for training is based on number of hours.

5.2 RESULTS FROM TRAINING ON ACADEMIC DATASETS · 学术数据集训练结果

Short-form Speech Recognition

Long-form Speech Recognition

19

Trained on OWSM-Eng Trained on OLMoASR-Mix

Trained on OWSM-Eng Trained on OLMoASR-Mix

19

18

18

17

16

17

15

Average WER

Average WER

14

16

13

15

12

100 200 300 400 500 Total data seen (in K hours)

100 200 300 400 500 Total data seen (in K hours)

Figure 6: Short-form speech recognition performance of OLMOASR-244M trained on OWSM-Eng and OLMOASR-MIX for varying total amount of data seen. The baseline trained on OLMOASR- MIX trains for one epoch on subsampled subsets of the data, while OLMOASR-244M trained on OWSM-Eng does one, two and four passes through its 113K English subset.

To compare training on academic vs. web-scale data, we train OLMOASR-small.en on OWSM-Eng (the English subset of OWSM) and OLMOASR-MIX with the same total data seen: 113K, 226K, and 452K hours and evaluate both on short and long-form speech recognition.

为了比较学术数据与网络规模数据的训练，我们在 OWSM-Eng（OWSM 的英语子集）和 OLMOASR-MIX 上训练 OLMOASR-small.en，使用相同的总数据：113K、226K 和 452K 小时，并对短格式和长格式语音识别进行评估。

Figure 6 shows that OLMOASR-MIX consistently yields lower WER for short-form speech except at 452K hours, where the gap is only 0.2%. The difference is more pronounced for long-form, highlighting better generalization from unsegmented long-form data in OLMOASR-POOL versus short-form academic corpora. The smaller short-form gap is partly because OWSM-Eng includes training splits of some evaluation sets, making its evaluation not fully zero-shot.

Since OWSM-Eng overlaps with many test sets except CHIME-6 and CORAAL, we assess out-of- distribution robustness using them and LibriSpeech as a reference. Figure 7 shows that OLMOASR- MIX-trained models achieve lower WER than OWSM-Eng-trained ones, outperforming expected baselines on CHIME-6 and CORAAL.

由于 OWSM-Eng 与除 CHIME-6 和 CORAAL 之外的许多测试集重叠，因此我们使用它们和 LibriSpeech 作为参考来评估分布外的稳健性。图 7 显示，OLMOASR-MIX 训练的模型比 OWSM-Eng 训练的模型实现了更低的 WER，优于 CHIME-6 和 CORAAL 上的预期基线。

Overall, training on OLMOASR-MIX improves performance and robustness over academic data at the same scale.

总体而言，OLMOASR-MIX 训练比同等规模的学术数据提高了性能和稳健性。

9

<!-- page 10 of 17 -->

Technical Report

5.3 RESULTS FROM TRAINING ON MANUAL AND AUTOMATIC DATA MIX · 人工与自动标注混合数据训练结果

YODAS (Li et al., 2023) is a large-scale, multilingual speech dataset containing over 500K hours of YouTube audio across 100+ languages designed to support supervised and self-supervised learning. For our ablation, we train OLMOASR with the 190K hours English subset of YODAS on model scales ranging from tiny to small. The models are trained for the same amount of total data seen as OLMOASR on the full OLMOASR-MIX.

YODAS（Li et al.，2023）是一个大型多语言语音数据集，包含超过 50 万小时的 YouTube 音频，涵盖 100 多种语言，旨在支持监督和自监督学习。对于我们的消融，我们使用 YODAS 的 190K 小时英语子集在从小到小的模型规模上训练 OLMOASR。这些模型的训练数据量与完整 OLMOASR-MIX 上的 OLMOASR 相同。

Figure 3 demonstrates that while YODAS is also a web-scale dataset, OLMOASR trained on OLMOASR-MIX out-performs the YODAS-trained model on all model scales with the largest dif- ference being 2.7%.

Effective and Relative Robustness

45

Zero-shot OLMoASR-small.en (1-epoch) Zero-shot OLMoASR-small.en (on OWSM-Eng data)

零样本 OLMoASR-small.en（1-epoch） 零样本 OLMoASR-small.en（基于 OWSM-Eng 数据）

40

35

30

Average WER on CHiME-6, CORAAL (%)

25

2.0 2.5 3.0 3.5 4.0 4.5 WER on LibriSpeech test-clean (%)

Figure 7: We plot 3 OLMOASR trained on OWSM-Eng data without any robustness interventions and demonstrate their WER on a reference test set (LibriSpeech test-clean) and the average WER across 2 out-of-distribution evaluation sets (CHiME-6, CORAAL). We also plot the performance of zero-shot OLMOASR models to compare to the former.

6 RELATED WORK · 相关工作

Large-scale English ASR Datasets English ASR datasets have grown dramatically in scale. LibriSpeech (Panayotov et al., 2015) remains a benchmark with 960 hours of read speech. Gi- gaSpeech (Chen et al., 2021) expands this to 10,000 hours after filtering from 33,000 hours. The Peo- ple’s Speech (Galvez et al., 2021) offers 30,000 hours from internet sources (excluding YouTube). Proprietary datasets like those for Whisper (Radford et al., 2023) and USM (Zhang et al., 2023) are much larger, ranging from 100K to 1M hours. YODAS (Li et al., 2023) helps close this gap by providing 190,000 hours of English audio within a 480,000-hour multilingual YouTube corpus.

大规模英语 ASR 数据集 英语 ASR 数据集的规模急剧增长。 LibriSpeech（Panayotov 等人，2015）仍然是一个基准，具有 960 小时的语音阅读时间。 GigaSpeech（Chen 等人，2021）将过滤后的时间从 33,000 小时扩展到 10,000 小时。 《人民演讲》（Galvez et al., 2021）提供了来自互联网来源（不包括 YouTube）的 30,000 小时内容。 Whisper（Radford 等人，2023）和 USM（Zhang 等人，2023）等专有数据集要大得多，范围从 10 万到 100 万小时不等。 YODAS（Li et al., 2023）通过在 480,000 小时的多语言 YouTube 语料库中提供 190,000 小时的英语音频，帮助缩小了这一差距。

Large-scale English ASR Models ASR performance benefits from more and better data (Baevski et al., 2020; Radford et al., 2023). Self-supervised learning (SSL) uses large unlabeled audio for pre-training, then fine-tunes on transcripts (Zhang et al., 2022; 2023; Communication et al., 2023), but fine-tuning may limit robustness (Radford et al., 2023). Supervised training on diverse data enhances generalization (Chan et al., 2021; Likhomanenko et al., 2021). Whisper, trained on 680K hours, is well-known but proprietary. OWSM (Peng et al., 2023; 2024b; Tian et al., 2024) provides an open alternative with up to 180K hours (73K English). OWLS (Chen et al., 2025) further explores scaling laws for multilingual ASR up to 360K hours and shows clear benefits from scaling data and model size, especially for non-English.

大规模英语 ASR 模型 ASR 性能受益于更多更好的数据（Baevski 等人，2020；Radford 等人，2023）。自监督学习（SSL）使用大量未标记的音频进行预训练，然后对转录本进行微调（Zhang et al., 2022; 2023; Communication et al., 2023），但微调可能会限制鲁棒性（Radford et al., 2023）。对不同数据进行监督训练可以增强泛化能力（Chan 等人，2021 年；Likhomanenko 等人，2021 年）。 Whisper 经过 68 万小时的训练，众所周知，但属于专有技术。 OWSM（Peng 等人，2023；2024b；Tian 等人，2024）提供了长达 180K 小时（73K 英语）的开放替代方案。 OWLS（Chen 等人，2025）进一步探索了长达 36 万小时的多语言 ASR 的缩放法则，并显示了缩放数据和模型大小的明显好处，特别是对于非英语。

Data Quality and Data-centric Learning Recent work across language, vision, and multimodal domains shows that better data can greatly boost model performance. Llama 2 and 3 (Touvron et al., 2023b; Grattafiori et al., 2024) improved mainly through better data over Llama 1 (Touvron et al., 2023a). Similar trends hold for text (DCLM (Li et al., 2024), Nemotron-CC (Su et al., 2024)) and multimodal models (DataComp (Gadre et al., 2023), DeepSeek-VL2 (Wu et al., 2024), Bunny (He

数据质量和以数据为中心的学习最近在语言、视觉和多模态领域的工作表明，更好的数据可以极大地提高模型性能。 Llama 2 和 3（Touvron 等人，2023b；Grattafiori 等人，2024）主要通过比 Llama 1（Touvron 等人，2023a）更好的数据进行改进。文本（DCLM（Li et al., 2024）、Nemotron-CC（Su et al., 2024））和多模态模型（DataComp（Gadre et al., 2023）、DeepSeek-VL2（Wu et al., 2024）、Bunny（He

10

<!-- page 11 of 17 -->

Technical Report

et al., 2024)). A key principle in data-centric ML is to run controlled experiments with fixed archi- tectures and training, varying only the data to isolate its impact—an approach central to works like DataComp (Gadre et al., 2023; Li et al., 2024).

等人，2024））。以数据为中心的机器学习的一个关键原则是使用固定的架构和训练运行受控实验，仅改变数据以隔离其影响——这是 DataComp 等工作的核心方法（Gadre 等人，2023 年；Li 等人，2024 年）。

REFERENCES

Alexei Baevski, Yuhao Zhou, Abdelrahman Mohamed, and Michael Auli. wav2vec 2.0: A framework for self-supervised learning of speech representations. In H. Larochelle, M. Ranzato, R. Hadsell, M.F. Balcan, and H. Lin (eds.), Advances in Neural In- formation Processing Systems, volume 33, pp. 12449–12460. Curran Associates, Inc., 2020. URL https://proceedings.neurips.cc/paper_files/paper/2020/ file/92d1e1eb1cd6f9fba3227870bb6d7f07-Paper.pdf.

Tom Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared D Kaplan, Prafulla Dhariwal,

Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, et al. Language models are few-shot learners. Advances in neural information processing systems, 33:1877–1901, 2020.

William Chan, Daniel Park, Chris Lee, Yu Zhang, Quoc Le, and Mohammad Norouzi. Speechstew:

Simply mix all available speech recognition data to train one large neural network, 2021. URL https://arxiv.org/abs/2104.02133.

Guoguo Chen, Shuzhou Chai, Guan-Bo Wang, Jiayu Du, Wei-Qiang Zhang, Chao Weng, Dan Su,

Daniel Povey, Jan Trmal, Junbo Zhang, Mingjie Jin, Sanjeev Khudanpur, Shinji Watanabe, Shuai- jiang Zhao, Wei Zou, Xiangang Li, Xuchen Yao, Yongqing Wang, Zhao You, and Zhiyong Yan. Gigaspeech: An evolving, multi-domain asr corpus with 10,000 hours of transcribed audio. In Interspeech 2021, pp. 3670–3674, 2021. doi: 10.21437/Interspeech.2021-1965.

William Chen, Jinchuan Tian, Yifan Peng, Brian Yan, Chao-Han Huck Yang, and Shinji Watan-

abe. Owls: Scaling laws for multilingual speech recognition and translation models, 2025. URL https://arxiv.org/abs/2502.10373.

Mehdi Cherti, Romain Beaumont, Ross Wightman, Mitchell Wortsman, Gabriel Ilharco, Cade Gor-

don, Christoph Schuhmann, Ludwig Schmidt, and Jenia Jitsev. Reproducible scaling laws for contrastive language-image learning. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 2818–2829, 2023.

Seamless Communication, Lo¨ıc Barrault, Yu-An Chung, Mariano Cora Meglioli, David Dale, Ning

Dong, Paul-Ambroise Duquenne, Hady Elsahar, Hongyu Gong, Kevin Heffernan, John Hoffman, Christopher Klaiber, Pengwei Li, Daniel Licht, Jean Maillard, Alice Rakotoarison, Kaushik Ram Sadagopan, Guillaume Wenzek, Ethan Ye, Bapi Akula, Peng-Jen Chen, Naji El Hachem, Brian Ellis, Gabriel Mejia Gonzalez, Justin Haaheim, Prangthip Hansanti, Russ Howes, Bernie Huang, Min-Jae Hwang, Hirofumi Inaguma, Somya Jain, Elahe Kalbassi, Amanda Kallet, Ilia Kulikov, Janice Lam, Daniel Li, Xutai Ma, Ruslan Mavlyutov, Benjamin Peloquin, Mohamed Ramadan, Abinesh Ramakrishnan, Anna Sun, Kevin Tran, Tuan Tran, Igor Tufanov, Vish Vogeti, Car- leigh Wood, Yilin Yang, Bokai Yu, Pierre Andrews, Can Balioglu, Marta R. Costa-juss`a, Onur Celebi, Maha Elbayad, Cynthia Gao, Francisco Guzm´an, Justine Kao, Ann Lee, Alexandre Mourachko, Juan Pino, Sravya Popuri, Christophe Ropers, Safiyyah Saleem, Holger Schwenk, Paden Tomasello, Changhan Wang, Jeff Wang, and Skyler Wang. Seamlessm4t: Massively mul- tilingual & multimodal machine translation, 2023. URL https://arxiv.org/abs/2308. 11596.

Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, and Christopher R´e. Flashattention: Fast and

memory-efficient exact attention with io-awareness, 2022. URL https://arxiv.org/abs/ 2205.14135.

Patrick Fernandes, Behrooz Ghorbani, Xavier Garcia, Markus Freitag, and Orhan Firat. Scaling

laws for multilingual neural machine translation, 2023. URL https://arxiv.org/abs/ 2302.09650.

Samir Yitzhak Gadre, Gabriel Ilharco, Alex Fang, Jonathan Hayase, Georgios Smyrnis, Thao

Nguyen, Ryan Marten, Mitchell Wortsman, Dhruba Ghosh, Jieyu Zhang, et al. Datacomp: In

11

<!-- page 12 of 17 -->

Technical Report

search of the next generation of multimodal datasets. Advances in Neural Information Processing Systems, 36:27092–27112, 2023.

Daniel Galvez, Greg Diamos, Juan Torres, Keith Achorn, Juan Cer´on, Anjali Gopi, David

Kanter, Max Lam, Mark Mazumder, and Vijay Janapa Reddi. The people’s speech: A large-scale diverse english speech recognition dataset for commercial usage. In J. Vanschoren and S. Yeung (eds.), Proceedings of the Neural Information Process- ing Systems Track on Datasets and Benchmarks, volume 1, 2021. URL https: //datasets-benchmarks-proceedings.neurips.cc/paper_files/paper/ 2021/file/202cb962ac59075b964b07152d234b70-Paper-round1.pdf.

Leo Gao, Stella Biderman, Sid Black, Laurence Golding, Travis Hoppe, Charles Foster, Jason

Phang, Horace He, Anish Thite, Noa Nabeshima, Shawn Presser, and Connor Leahy. The pile: An 800gb dataset of diverse text for language modeling, 2020. URL https://arxiv.org/ abs/2101.00027.

Aaron Grattafiori, Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad

Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Alex Vaughan, et al. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

Muyang He, Yexin Liu, Boya Wu, Jianhao Yuan, Yueze Wang, Tiejun Huang, and Bo Zhao. Efficient

multimodal learning from data-centric perspective. arXiv preprint arXiv:2402.11530, 2024.

Jeffrey Li, Alex Fang, Georgios Smyrnis, Maor Ivgi, Matt Jordan, Samir Yitzhak Gadre, Hritik

Bansal, Etash Guha, Sedrick Scott Keh, Kushal Arora, et al. Datacomp-lm: In search of the next generation of training sets for language models. Advances in Neural Information Processing Systems, 37:14200–14282, 2024.

Jeffrey Li, Alex Fang, Georgios Smyrnis, Maor Ivgi, Matt Jordan, Samir Gadre, Hritik Bansal,

Etash Guha, Sedrick Keh, Kushal Arora, Saurabh Garg, Rui Xin, Niklas Muennighoff, Rein- hard Heckel, Jean Mercat, Mayee Chen, Suchin Gururangan, Mitchell Wortsman, Alon Al- balak, Yonatan Bitton, Marianna Nezhurina, Amro Abbas, Cheng-Yu Hsieh, Dhruba Ghosh, Josh Gardner, Maciej Kilian, Hanlin Zhang, Rulin Shao, Sarah Pratt, Sunny Sanyal, Gabriel Il- harco, Giannis Daras, Kalyani Marathe, Aaron Gokaslan, Jieyu Zhang, Khyathi Chandu, Thao Nguyen, Igor Vasiljevic, Sham Kakade, Shuran Song, Sujay Sanghavi, Fartash Faghri, Se- woong Oh, Luke Zettlemoyer, Kyle Lo, Alaaeldin El-Nouby, Hadi Pouransari, Alexander Toshev, Stephanie Wang, Dirk Groeneveld, Luca Soldaini, Pang Wei Koh, Jenia Jitsev, Thomas Kol- lar, Alexandros G. Dimakis, Yair Carmon, Achal Dave, Ludwig Schmidt, and Vaishaal Shankar. Datacomp-lm: In search of the next generation of training sets for language models, 2025. URL https://arxiv.org/abs/2406.11794.

Xinjian Li, Shinnosuke Takamichi, Takaaki Saeki, William Chen, Sayaka Shiota, and Shinji Watan-

abe. Yodas: Youtube-oriented dataset for audio and speech. In 2023 IEEE Automatic Speech Recognition and Understanding Workshop (ASRU), pp. 1–8, 2023. doi: 10.1109/ASRU57964. 2023.10389689.

Tatiana Likhomanenko, Qiantong Xu, Vineel Pratap, Paden Tomasello, Jacob Kahn, Gilad Avidov,

Ronan Collobert, and Gabriel Synnaeve. Rethinking evaluation in asr: Are our models robust enough? In Interspeech 2021, pp. 311–315, 2021. doi: 10.21437/Interspeech.2021-1758.

Aixin Liu, Bei Feng, Bing Xue, Bingxuan Wang, Bochao Wu, Chengda Lu, Chenggang Zhao,

Chengqi Deng, Chenyu Zhang, Chong Ruan, et al. Deepseek-v3 technical report. arXiv preprint arXiv:2412.19437, 2024.

Zhengzhong Liu, Aurick Qiao, Willie Neiswanger, Hongyi Wang, Bowen Tan, Tianhua Tao, Junbo

Li, Yuqi Wang, Suqi Sun, Omkar Pangarkar, et al. Llm360: Towards fully transparent open-source llms. arXiv preprint arXiv:2312.06550, 2023.

Team OLMo, Pete Walsh, Luca Soldaini, Dirk Groeneveld, Kyle Lo, Shane Arora, Akshita

Bhagia, Yuling Gu, Shengyi Huang, Matt Jordan, et al. 2 olmo 2 furious. arXiv preprint arXiv:2501.00656, 2024.

12

<!-- page 13 of 17 -->

Technical Report

Vassil Panayotov, Guoguo Chen, Daniel Povey, and Sanjeev Khudanpur. Librispeech: An asr corpus

based on public domain audio books. In 2015 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), pp. 5206–5210, 2015. doi: 10.1109/ICASSP.2015. 7178964.

Guilherme Penedo, Quentin Malartic, Daniel Hesslow, Ruxandra Cojocaru, Alessandro Cappelli,

Hamza Alobeidli, Baptiste Pannier, Ebtesam Almazrouei, and Julien Launay. The refinedweb dataset for falcon llm: outperforming curated corpora with web data, and web data only. arXiv preprint arXiv:2306.01116, 2023.

Guilherme Penedo, Hynek Kydl´ıˇcek, Anton Lozhkov, Margaret Mitchell, Colin A Raffel, Leandro

Von Werra, Thomas Wolf, et al. The fineweb datasets: Decanting the web for the finest text data at scale. Advances in Neural Information Processing Systems, 37:30811–30849, 2024a.

Guilherme Penedo, Hynek Kydl´ıˇcek, Loubna Ben allal, Anton Lozhkov, Margaret Mitchell, Colin

Raffel, Leandro Von Werra, and Thomas Wolf. The fineweb datasets: Decanting the web for the finest text data at scale, 2024b. URL https://arxiv.org/abs/2406.17557.

Yifan Peng, Jinchuan Tian, Brian Yan, Dan Berrebbi, Xuankai Chang, Xinjian Li, Jiatong Shi,

Siddhant Arora, William Chen, Roshan Sharma, Wangyou Zhang, Yui Sudo, Muhammad Shakeel, Jee-Weon Jung, Soumi Maiti, and Shinji Watanabe. Reproducing whisper-style training using an open-source toolkit and publicly available data. In 2023 IEEE Automatic Speech Recognition and Understanding Workshop (ASRU), pp. 1–8, 2023. doi: 10.1109/ASRU57964.2023.10389676.

Yifan Peng, Yui Sudo, Muhammad Shakeel, and Shinji Watanabe. Owsm-ctc: An open encoder-

only speech foundation model for speech recognition, translation, and language identification, 2024a. URL https://arxiv.org/abs/2402.12654.

Yifan Peng, Jinchuan Tian, William Chen, Siddhant Arora, Brian Yan, Yui Sudo, Muhammad Sha-

keel, Kwanghee Choi, Jiatong Shi, Xuankai Chang, Jee weon Jung, and Shinji Watanabe. Owsm v3.1: Better and faster open whisper-style speech models based on e-branchformer. In Interspeech 2024, pp. 352–356, 2024b. doi: 10.21437/Interspeech.2024-1194.

Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal,

Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, et al. Learning transferable visual models from natural language supervision. In International conference on machine learning, pp. 8748–8763. PmLR, 2021.

Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine Mcleavey, and Ilya Sutskever.

Robust speech recognition via large-scale weak supervision. In Andreas Krause, Emma Brun- skill, Kyunghyun Cho, Barbara Engelhardt, Sivan Sabato, and Jonathan Scarlett (eds.), Pro- ceedings of the 40th International Conference on Machine Learning, volume 202 of Proceed- ings of Machine Learning Research, pp. 28492–28518. PMLR, 23–29 Jul 2023. URL https: //proceedings.mlr.press/v202/radford23a.html.

Colin Raffel, Noam Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael Matena, Yanqi

Zhou, Wei Li, and Peter J. Liu. Exploring the limits of transfer learning with a unified text-to-text transformer, 2023. URL https://arxiv.org/abs/1910.10683.

Luca Soldaini, Rodney Kinney, Akshita Bhagia, Dustin Schwenk, David Atkinson, Russell Authur,

Ben Bogin, Khyathi Chandu, Jennifer Dumas, Yanai Elazar, Valentin Hofmann, Ananya Harsh Jha, Sachin Kumar, Li Lucy, Xinxi Lyu, Nathan Lambert, Ian Magnusson, Jacob Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Abhilasha Ravichander, Kyle Richardson, Zejiang Shen, Emma Strubell, Nishant Subramani, Oyvind Tafjord, Pete Walsh, Luke Zettlemoyer, Noah A. Smith, Hannaneh Hajishirzi, Iz Beltagy, Dirk Groeneveld, Jesse Dodge, and Kyle Lo. Dolma: an open corpus of three trillion tokens for language model pretraining research, 2024. URL https://arxiv.org/abs/2402.00159.

Dan Su, Kezhi Kong, Ying Lin, Joseph Jennings, Brandon Norick, Markus Kliegl, Mostofa Patwary,

Mohammad Shoeybi, and Bryan Catanzaro. Nemotron-cc: Transforming common crawl into a refined long-horizon pretraining dataset. arXiv preprint arXiv:2412.02595, 2024.

13

<!-- page 14 of 17 -->

Technical Report

Dan Su, Kezhi Kong, Ying Lin, Joseph Jennings, Brandon Norick, Markus Kliegl, Mostofa Patwary,

Mohammad Shoeybi, and Bryan Catanzaro. Nemotron-cc: Transforming common crawl into a refined long-horizon pretraining dataset, 2025. URL https://arxiv.org/abs/2412. 02595.

Rohan Taori, Achal Dave, Vaishaal Shankar, Nicholas Carlini, Benjamin Recht, and Ludwig

Schmidt. Measuring robustness to natural distribution shifts in image classification, 2020. URL https://arxiv.org/abs/2007.00644.

Jinchuan Tian, Yifan Peng, William Chen, Kwanghee Choi, Karen Livescu, and Shinji Watanabe.

On the effects of heterogeneous data sources on speech-to-text foundation models. In Interspeech 2024, pp. 3959–3963, 2024. doi: 10.21437/Interspeech.2024-1938.

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timoth´ee

Lacroix, Baptiste Rozi`ere, Naman Goyal, Eric Hambro, Faisal Azhar, et al. Llama: Open and efficient foundation language models. arXiv preprint arXiv:2302.13971, 2023a.

Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Niko-

lay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, et al. Llama 2: Open founda- tion and fine-tuned chat models. arXiv preprint arXiv:2307.09288, 2023b.

J¨orgen Valk and Tanel Alum¨ae. Voxlingua107: A dataset for spoken language recognition. In

2021 IEEE Spoken Language Technology Workshop (SLT), pp. 652–658, 2021. doi: 10.1109/ SLT48900.2021.9383459.

Maurice Weber, Daniel Fu, Quentin Anthony, Yonatan Oren, Shane Adams, Anton Alexandrov,

Xiaozhong Lyu, Huu Nguyen, Xiaozhe Yao, Virginia Adams, Ben Athiwaratkun, Rahul Cha- lamala, Kezhen Chen, Max Ryabinin, Tri Dao, Percy Liang, Christopher R´e, Irina Rish, and Ce Zhang. Redpajama: an open dataset for training large language models, 2024. URL https://arxiv.org/abs/2411.12372.

Alexander Wettig, Kyle Lo, Sewon Min, Hannaneh Hajishirzi, Danqi Chen, and Luca Soldaini.

Organize the web: Constructing domains enhances pre-training data curation. arXiv preprint arXiv:2502.10341, 2025.

Zhiyu Wu, Xiaokang Chen, Zizheng Pan, Xingchao Liu, Wen Liu, Damai Dai, Huazuo Gao, Yiyang

Ma, Chengyue Wu, Bingxuan Wang, et al. Deepseek-vl2: Mixture-of-experts vision-language models for advanced multimodal understanding. arXiv preprint arXiv:2412.10302, 2024.

Yu Zhang, Daniel S. Park, Wei Han, James Qin, Anmol Gulati, Joel Shor, Aren Jansen, Yuanzhong

Xu, Yanping Huang, Shibo Wang, Zongwei Zhou, Bo Li, Min Ma, William Chan, Jiahui Yu, Yongqiang Wang, Liangliang Cao, Khe Chai Sim, Bhuvana Ramabhadran, Tara N. Sainath, Franc¸oise Beaufays, Zhifeng Chen, Quoc V. Le, Chung-Cheng Chiu, Ruoming Pang, and Yonghui Wu. Bigssl: Exploring the frontier of large-scale semi-supervised learning for automatic speech recognition. IEEE Journal of Selected Topics in Signal Processing, 16(6):1519–1532, 2022. doi: 10.1109/JSTSP.2022.3182537.

Yu Zhang, Wei Han, James Qin, Yongqiang Wang, Ankur Bapna, Zhehuai Chen, Nanxin Chen,

Bo Li, Vera Axelrod, Gary Wang, Zhong Meng, Ke Hu, Andrew Rosenberg, Rohit Prabhavalkar, Daniel S. Park, Parisa Haghani, Jason Riesa, Ginger Perng, Hagen Soltau, Trevor Strohman, Bhuvana Ramabhadran, Tara Sainath, Pedro Moreno, Chung-Cheng Chiu, Johan Schalkwyk, Franc¸oise Beaufays, and Yonghui Wu. Google usm: Scaling automatic speech recognition be- yond 100 languages, 2023. URL https://arxiv.org/abs/2303.01037.

A TRAINING DETAILS · 训练细节

Table 6 displays hyperparameters used to train all models. We trained OLMOASR-tiny.en, OL- MOASR-base.en and OLMOASR-small.en on 1 H100 node and OLMOASR-medium.en, OL- MOASR-large.en, and OLMOASR-large.en-v2 on 2 and 4 H100 nodes respectively.

14

<!-- page 15 of 17 -->

Technical Report

Hyperparameter Value Updates 524288 Batch Size 512 Warmup Updates 1049 Max grad norm 1.0 Optimizer AdamW β1 0.9 β2 0.98 ϵ 10−6 Weight Decay 0.1 Weight Init Gaussian Fan-In Maximum Learning Rate 1.5 × 10−3 Learning Rate Schedule Linear Decay

超参数值更新 524288 批量大小 512 预热更新 1049 最大梯度范数 1.0 优化器 AdamW β1 0.9 β2 0.98 ϵ 10−6 权重衰减 0.1 权重初始高斯扇入 最大学习率 1.5 × 10−3 学习率计划线性衰减

Table 6: Training hyperparameters.

B MODEL SIZES · 模型规模

Table 7 enumerates all the model sizes OLMOASR has and the associated parameter count.

Size Parameters tiny 39 M base 74 M small 244 M medium 769 M large 1550 M large-v2 1550 M

Table 7: Model sizes and their parameter counts

C DEDUPLICATION AND DECONTAMINATION · 去重与去污染

We performed transcript level fuzzy deduplication using minhash. We used the parameters from FineWeb (Penedo et al., 2024b), where we used 5-grams of tokens and computed 112 hash functions, split into 14 buckets of 8 hashes each. If any pair of transcripts has the same 8 hashes in any one bucket, they are marked as duplicates. This procedure targets documents that have a Jaccard similarity of 75%. We performed this on 17M total transcripts and removed 505K transcripts for a total deduplication removal rate of 3%. Decontamination was performed by a simple n-gram search. In particular, we decontaminate the evaluation datasets of TED-LIUM3 against our training corpus. First we collect all n-grams of size 10 from the evaluation dataset and check for their presence in each training dataset transcript. If any n-gram is present, we mark the training document as contaminated and do not include it in our training sets. We apply this procedure to 17M transcripts and find only 286 contaminated transcripts.

我们使用 minhash 执行了转录本级别的模糊去重。我们使用 FineWeb 的参数（Penedo 等人，2024b），其中我们使用 5 克令牌并计算 112 个哈希函数，分为 14 个桶，每个桶有 8 个哈希值。如果任何一对转录本在任意一个存储桶中具有相同的 8 个哈希值，则它们将被标记为重复项。此过程针对 Jaccard 相似度为 75% 的文档。我们对 17M 总转录本执行此操作，并删除了 505K 转录本，总重复数据删除去除率为 3%。通过简单的 n 元搜索来进行净化。特别是，我们根据我们的训练语料库净化了 TED-LIUM3 的评估数据集。第一步，我们从评估数据集中收集所有大小为 10 的 n 元模型，并检查它们是否存在于每个训练数据集转录本中。如果存在任何 n-gram，我们会将训练文档标记为受污染，并且不将其包含在我们的训练集中。我们将此程序应用于 17M 转录本，仅发现 286 个受污染的转录本。

D OWSM VS. OLMOASR PERFORMANCE TABLE · OWSM 与 OLMoASR 表现对比

Table 8 shows the WER performance on short-form evaluation sets that OLMOASR, Whisper and OWSM have all been evaluated on.

E OLMOASR VS. OTHER OPEN-SOURCE MODELS · OLMoASR 与其他开源模型对比

Table 9 illustrates the WER performance of OLMOASR relative to other open-source models.

15

<!-- page 16 of 17 -->

Technical Report

LibriSpeech.test-other

LibriSpeech.test-clean

WSJ

TED-LIUM3

Switchboard

VoxPopuli.en

Fleurs.en.us

Average

Model

OLMOASR-base.en 3.7 9.0 4.6 4.3 14.0 9.7 6.7 7.4 Whisper base.en 4.2 10.2 4.9 4.6 15.2 10.0 7.6 8.1 OWSM-v3.1 base 3.6 9.1 7.8 5.3 22.9 12.0 14.8 10.1

OLMOASR-small.en 3.0 7.0 4.2 3.8 13.2 8.7 5.0 6.4 Whisper small.en 3.1 7.4 4.0 3.3 15.7 8.1 6.0 6.8 OWSM-v3.1 small 2.5 5.8 5.0 3.8 17.4 9.1 10.3 7.3 OWSM-v3.2 small 2.5 6.2 5.4 4.0 17.4 9.0 10.1 7.4

OLMOASR-medium.en 3.5 5.7 5.0 3.6 12.7 8.4 4.4 6.2 Whisper medium.en 3.1 6.3 4.1 3.3 14.1 7.4 5.0 6.2 OWSM-v3.1 medium 2.4 5.0 5.1 3.5 16.3 8.4 9.0 6.8 OWSM-CTC medium 2.4 5.2 4.9 4.2 16.9 8.6 9.9 7.0

Table 8: Short-form English transcription WER (%) with greedy decoding, comparing between OLMOASR, Whisper and OWSM models.

F CONTRIBUTIONS · 贡献说明

• Huong Ngo: Programed and designed all main code infrastructures (data collection and processing, training, and evaluation), collected and processed all data, planned and exe- cuted all experiments on Ai2 compute cluster and UW Hyak Supercomputer Cluster, coor- dinated and performed evaluation and paper writing and revision.

• Huong Ngo：编程和设计所有主要代码基础设施（数据收集和处理、训练和评估），收集和处理所有数据，计划和执行Ai2计算集群和UW Hyak超级计算机集群上的所有实验，协调和执行评估以及论文写作和修订。

• Matt Deitke: Provided advice on data collection and processing and training, paper writing and revision.

• Matt Deitke：提供有关数据收集、处理和培训、论文写作和修改的建议。

• Martijn Bartelds: Provided advice on training and evaluation, paper writing and revision.

• Martijn Bartelds：为训练与评测、论文写作和修订提供建议。

• Sarah Pratt: Provided visual graphics support for paper.

• Sarah Pratt：为论文提供视觉图形支持。

• Josh Gardner: Provided advice on data collection and processing, model training, experi- ment design and project direction, paper writing and revision.

• Josh Gardner：提供有关数据收集和处理、模型训练、实验设计和项目指导、论文写作和修改的建议。

• Matt Jordan: Performed deduplication and decontamination, provided advice on data pro- cessing, experiment design and project direction, paper writing and revision. • Ludwig Schmidt: Provided advice on data collection and processing, model training, ex- periment design and project direction, paper writing and revision.

• Matt Jordan：执行重复数据删除和去污工作，提供数据处理、实验设计和项目方向、论文写作和修改方面的建议。 • Ludwig Schmidt：提供数据收集和处理、模型训练、实验设计和项目方向、论文写作和修改方面的建议。

16

<!-- page 17 of 17 -->

Technical Report

LibriSpeech.test-other

CallHome

LibriSpeech.test-clean

AMI-SDM

WSJ

Artie

TED-LIUM3

Switchboard

AMI-IHM

CHiME6

CommonVoice5.1

CORAAL

VoxPopuli.en

Fleurs.en.us

Average

Model

OLMOASR (Open weights, code, data) vs. Whisper (Open weights, closed training code, data)

OLMOASR-tiny.en 5.1 12.3 5.5 5.6 23.9 18.7 25.1 19.3 25.7 45.2 24.2 55.4 11.6 9.7 20.5 Whisper tiny.en 5.6 14.6 6.0 5.0 24.1 17.8 26.3 20.0 23.9 41.3 23.7 50.3 11.7 11.6 20.1

OLMOASR-base.en 3.7 9.0 4.6 4.3 20.5 14.0 18.5 13.6 21.5 38.0 20.4 47.8 9.7 6.7 16.6 Whisper base.en 4.2 10.2 4.9 4.6 20.9 15.2 19.0 13.4 22.6 36.4 20.5 46.7 10.0 7.6 16.9

OLMOASR-small.en 3.0 7.0 4.2 3.8 16.7 13.2 13.1 9.6 19.6 30.6 18.7 39.9 8.7 5.0 13.8 Whisper small.en 3.1 7.4 4.0 3.3 18.2 15.7 13.1 9.7 20.2 27.6 17.5 38.0 8.1 6.0 13.7

OLMOASR-medium.en 3.5 5.7 5.0 3.6 14.3 12.7 11.3 7.5 18.7 28.5 16.9 38.3 8.4 4.4 12.8 Whisper medium.en 3.1 6.3 4.1 3.3 16.2 14.1 10.6 7.6 17.5 25.3 16.4 37.2 7.4 5.0 12.4

OLMOASR-large.en 2.6 5.9 4.5 3.7 16.5 12.7 11.1 7.9 18.7 30.7 16.4 38.8 8.1 4.5 13.0 OLMOASR-large.en-v2 2.7 5.6 4.2 3.6 15.0 11.7 11.1 7.8 18.1 29.4 17.1 38.0 8.0 4.2 12.6 Whisper large-v1 2.7 5.6 4.0 3.1 15.8 13.1 9.5 6.7 19.4 25.6 16.4 36.9 7.3 4.6 12.2

Whisper large-v2 2.7 5.2 4.0 3.9 17.6 13.8 9.0 6.2 16.2 25.5 16.9 36.4 7.3 4.4 12.1 Whisper large-v3 2.0 3.9 3.9 3.5 14.0 13.2 8.4 5.9 18.7 26.8 16.0 34.2 9.5 4.0 11.7 Whisper large-v3-turbo 2.2 4.2 3.5 3.5 13.2 12.9 9.7 6.3 18.6 27.3 16.1 35.2 12.2 4.4 12.1

wav2vec2-base-100h 6.0 13.4 17.8 13.9 46.9 40.2 47.4 40.8 47.0 79.9 48.1 81.2 28.9 23.1 38.2 wav2vec2-base-960h 3.3 8.5 12.8 8.9 40.6 32.9 36.4 30.9 39.9 68.5 40.2 71.9 21.4 17.4 31.0 wav2vec2-large-960h-lv60-self 1.8 3.8 7.4 4.4 29.1 22.2 19.9 15.8 29.2 56.3 30.8 57.0 13.0 10.2 21.5 wav2vec2-large-960h 2.7 6.2 10.5 7.7 34.8 28.3 29.9 24.5 35.6 65.8 37.0 67.6 17.9 14.6 27.4 wav2vec2-large-robust-ft-libri-960h 2.6 5.3 9.2 6.1 23.4 19.8 20.3 16.2 29.4 58.1 31.7 61.6 15.1 11.8 22.2 asr-crdnn-rnnlm-librispeech 3.0 9.7 17.7 10.7 59.7 56.1 43.7 33.3 83.8 81.0 57.2 85.8 30.6 32.4 43.2 asr-transformer-transformerlm-librispeech 2.1 5.4 11.9 7.4 38.9 33.0 30.6 23.5 44.9 79.5 44.5 75.4 17.8 17.0 30.9 hubert-large-ls960-ft 2.0 4.1 8.4 5.4 29.6 22.8 20.8 16.0 32.0 60.0 33.7 59.1 14.4 10.9 22.8 hubert-xlarge-ls960-ft 1.9 3.5 8.3 5.4 29.3 22.2 19.8 14.8 31.5 58.5 33.3 58.9 14.2 10.5 22.3 s2t-large-librispeech-asr 3.3 8.1 14.9 9.4 54.5 40.3 38.1 30.7 50.2 79.2 53.4 79.5 21.6 18.0 35.8 s2t-medium-librispeech-asr 3.6 8.2 15.7 9.7 58.1 42.4 39.3 31.3 52.6 79.8 60.3 85.3 22.9 19.7 37.8 stt en conformer ctc large 2.1 4.2 4.4 2.1 11.3 8.2 7.4 4.0 13.5 30.5 15.9 39.9 6.7 8.2 11.3 stt en conformer transducer xlarge 1.5 2.8 4.3 1.2 12.0 7.4 4.3 1.5 19.9 36.8 20.5 48.6 6.0 6.3 12.4 unispeech-sat-base-100h-libri-ft 5.7 13.8 17.7 13.6 46.5 40.0 45.3 38.6 44.7 74.8 47.8 77.7 29.8 22.4 37.0

Table 9: Short-form English transcription WER (%) with greedy decoding, comparing between OLMOASR , Whisper models and other open-source models

17
