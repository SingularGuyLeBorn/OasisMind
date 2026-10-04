---
title: "olmOCR 2 对照译稿"
category: "多模态与OCR"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "olmOCR 2 技术报告的逐段中英对照: 用合成 HTML 页面批量生成二元单元测试, 以测试通过率作 GRPO 奖励训练 7B OCR 模型, 并记录从第一版到第二版的各项推理与训练改动."
---
<!-- page 1 of 11 -->

arXiv:2510.19817v1 [cs.CV] 22 Oct 2025

# olmOCR 2: Unit Test Rewards for Document OCR

Jake Poznanski, Luca Soldaini, Kyle Lo

Allen Institute for AI {jakep|lucas|kylel}@allenai.org

## Abstract

We present olmOCR 2, the latest in our family of powerful OCR systems for converting digitized print documents, like PDFs, into clean, naturally ordered plain text. olmOCR 2 is powered by olmOCR-2-7B-1025, a specialized, 7B vision language model (VLM) trained using reinforcement learning with verifiable rewards (RLVR), where our rewards are a diverse set of binary unit tests. To scale unit test creation, we develop a pipeline for generating synthetic documents with diverse and challenging layouts, known ground-truth HTML source code, and extracted test cases. We show that RL training on these test cases results in state-of-the-art performance on olmOCR-Bench, our English-language OCR benchmark, with the largest improvements in math formula conversion, table parsing, and multi-column layouts compared to previous versions. We release our model, data and code under permissive open licenses.

我们推出 olmOCR 2, 这是我们 OCR 系统家族的最新成员, 用来把 PDF 这类数字化印刷文档转成干净, 按自然阅读顺序排列的纯文本. olmOCR 2 的核心是 olmOCR-2-7B-1025, 一个专用的 7B 视觉语言模型 (VLM), 用可验证奖励强化学习 (RLVR) 训练, 奖励来自一组类型多样的二元单元测试. 为了批量生产单元测试, 我们搭了一条合成文档流水线: 生成版式多样且有难度的文档, 每份文档的 HTML 源码 (即真值) 已知, 测试用例从源码中抽取. 我们的实验表明, 在这些测试用例上做 RL 训练, 能在我们的英文 OCR 基准 olmOCR-Bench 上取得最先进的成绩; 与之前的版本相比, 数学公式转换, 表格解析和多栏版式的提升最大. 模型, 数据和代码都以宽松的开源许可发布.

Code: [allenai/olmocr](https://github.com/allenai/olmocr) · Demo: [olmocr.allenai.org](https://olmocr.allenai.org/) · Data: [olmOCR-mix-1025](https://huggingface.co/datasets/allenai/olmOCR-mix-1025), [olmOCR-synthmix-1025](https://huggingface.co/datasets/allenai/olmOCR-synthmix-1025) · Models: [olmOCR-2-7B-1025](https://huggingface.co/allenai/olmOCR-2-7B-1025), [olmOCR-2-7B-1025-FP8](https://huggingface.co/allenai/olmOCR-2-7B-1025-FP8)

## 1 Introduction

Since our initial release of olmOCR (Poznanski et al., 2025) in February 2025, we've seen an explosion of progress in advancing the state-of-the-art in optical character recognition (OCR). In this short technical report, we present our latest system—olmOCR 2—a state-of-the-art OCR system for extracting and linearizing content from digitized print documents like PDFs. olmOCR 2 is powered by olmOCR-2-7B-1025, an OCR-specialized VLM trained using reinforcement learning with verifiable rewards (RLVR) (Lambert et al., 2024). Our training recipe involves two parts:

自 2025 年 2 月首次发布 olmOCR (Poznanski et al., 2025) 以来, 光学字符识别 (OCR) 的最好水平进展极快. 这份简短的技术报告介绍我们的最新系统 olmOCR 2: 一个从 PDF 等数字化印刷文档中提取内容并把它线性化的 OCR 系统, 达到当前最好水平. 它的核心是 olmOCR-2-7B-1025, 一个专做 OCR 的 VLM, 用可验证奖励强化学习 (RLVR) (Lambert et al., 2024) 训练. 训练配方分两部分:

1. We develop a synthetic document pipeline that can take any standard document, render a version of it into clean HTML, and generate easily verifiable **unit tests** which can be run to check whether an OCR system output has correctly parsed this document page.

1. 我们搭了一条合成文档流水线: 输入任意一份普通文档, 把它重新渲染成一份干净的 HTML, 再生成容易验证的**单元测试**, 运行这些测试就能判断某个 OCR 系统的输出是否正确解析了这一页.

2. We apply Group Relative Policy Optimization (GRPO) (Shao et al., 2024) to olmOCR using our synthetic verifiable unit tests as binary-valued reward signals.

2. 我们对 olmOCR 使用 Group Relative Policy Optimization (GRPO) (Shao et al., 2024), 以合成的可验证单元测试作为二值奖励信号.

<!-- page 2 of 11 -->

| | olmOCR-Bench score | Release date | Model weights | Training data | Training code | Inference code | Model license |
|---|---|---|---|---|---|---|---|
| OpenAI GPT-4o | 68.9 ± 1.1 | May 2024 | no | no | no | no | no (6) |
| Qwen 2 VL 7B | 31.5 ± 0.9 | Aug 2024 | yes | no | no | yes | yes (1) |
| Gemini Flash 2 | 57.8 ± 1.1 | Dec 2024 | no | no | no | no | no (6) |
| Qwen 2.5 VL 7B | 65.5 ± 1.2 | Feb 2025 | yes | no | no | yes | yes (1) |
| Mistral OCR API | 72.0 ± 1.1 | Mar 2025 | no | no | no | no | no (6) |
| MinerU 1.3.10 | 61.5 ± 1.1 | Apr 2025 | yes | no | no | yes | restricted (4) |
| Nanonets OCR S | 64.5 ± 1.1 | Jun 2025 | yes | no | no | yes | unspecified (5) |
| MonkeyOCR Pro 3B | 75.8 ± 1.0* | Jun 2025 | yes | no | no | yes | unspecified (5) |
| Infinity-Parser 7B | 79.1 ± ?* | Jun 2025 | yes | yes | no | yes | yes (1) |
| dots.OCR | 79.1 ± 1.0* | Jul 2025 | yes | no | yes | yes | yes (2) |
| Marker 1.10.1 | 76.1 ± 1.1 | Sep 2025 | yes | no | no | yes | restricted (3) |
| MinerU 2.5.4 | 75.2 ± 1.1* | Sep 2025 | yes | no | no | yes | restricted (4) |
| PaddleOCR-VL | 80.0 ± 1.0* | Oct 2025 | yes | no | yes | yes | yes (1) |
| Nanonets OCR2 3B | 69.5 ± 1.1 | Oct 2025 | yes | no | no | yes | unspecified (5) |
| DeepSeek-OCR | 75.7 ± 1.0 | Oct 2025 | yes | no | no | yes | yes (2) |
| Infinity-Parser 7B | **82.5 ± ?*** | Oct 2025 | yes | no | no | yes | yes (1) |
| Chandra OCR 0.1.0 | **83.1 ± 0.9*** | Oct 2025 | yes | no | no | yes | restricted (3) |
| olmOCR | 68.2 ± 1.1 | Feb 2025 | yes | yes | yes | yes | yes (1) |
| olmOCR 2 | **82.4 ± 1.1** | Oct 2025 | yes | yes | yes | yes | yes (1) |

Table 1 Comparison of olmOCR 2 and other OCR systems. olmOCR 2 achieves state-of-the-art performance while maintaining fully open data, model, and code. Open-source licenses: (1) Apache 2.0, (2) MIT; open licenses with usage restrictions: (3) OpenRAIL-M, (4) AGPL v3; (5) license not specified; (6) API access only after accepting ToS. Results are fully reproduced by ourselves, except those marked with * which are reported by their authors.

表 1: olmOCR 2 与其他 OCR 系统的对比. 原文用勾, 叉, 警告和问号图标表示开放情况, 这里依次写作 yes, no, restricted, unspecified.

Others have also demonstrated the power of RLVR for OCR-specialized VLMs (Wang et al., 2025a); we find this training process is highly effective when combined with binary unit tests, with particular efficiency in improving the model's ability to extract equations, tables and multi-column layouts. Combined with other performance improvements that we've made to the underlying inference system—improved base model, tuned inference settings, model checkpoint averaging or "souping" (Matena and Raffel, 2022; Wortsman et al., 2022), bugfixes and more—olmOCR 2 achieves state-of-the-art performance on olmOCR-Bench, with a **+14.2 point overall improvement** over our initial release six months prior (Table 1). Our development process over these six months has remained **fully open**, with frequent version updates accompanied by full data, model and code releases, all under permissive open source licenses.

已有工作证明了 RLVR 对专做 OCR 的 VLM 有效 (Wang et al., 2025a); 我们发现这种训练与二元单元测试结合时效果很好, 对公式, 表格和多栏版式的提取能力提升尤其高效. 再加上我们对底层推理系统的其他改进 (更好的基座模型, 调好的推理设置, 检查点平均即「souping」(Matena and Raffel, 2022; Wortsman et al., 2022), 修 bug 等), olmOCR 2 在 olmOCR-Bench 上达到最好水平, 比六个月前的首个版本**总分提高 14.2 分** (Table 1). 这六个月里开发过程一直**完全开放**, 版本更新频繁, 每次都同步发布完整的数据, 模型和代码, 全部采用宽松的开源许可.

## 2 Why Unit Tests? · 为什么用单元测试

In olmOCR-Bench (Poznanski et al., 2025), we measured the performance of OCR systems by defining a set of unit test cases for each document. These test cases can check for any of the following properties:

在 olmOCR-Bench (Poznanski et al., 2025) 中, 我们给每份文档定义一组单元测试用例来衡量 OCR 系统. 这些用例可以检查下面任意一种性质:

- **Text Presence:** Checks that certain phrases appear exactly in the document
- **Text Absence:** Checks that certain phrases do not appear (e.g., headers, footers, or page numbers)
- **Natural Reading Order:** Checks sentences for reading order correctness
- **Table Accuracy:** Checks the relative position of cells (with specific values) in a table
- **Math Formula Accuracy:** Checks that a given math formula visually renders the same way with KaTeX
- **Baseline Robustness:** Checks that long repeated $n$-grams or non-target language characters do not appear.

- **文本出现 (Text Presence):** 检查某些短语是否原样出现在输出中.
- **文本不出现 (Text Absence):** 检查某些短语 (如页眉, 页脚或页码) 是否没有出现.
- **自然阅读顺序 (Natural Reading Order):** 检查句子的阅读顺序是否正确.
- **表格准确性 (Table Accuracy):** 检查表格中带特定值的单元格之间的相对位置.
- **公式准确性 (Math Formula Accuracy):** 检查给定公式用 KaTeX 渲染后在视觉上是否一致.
- **基线鲁棒性 (Baseline Robustness):** 检查输出中没有长段重复的 $n$-gram, 也没有非目标语言的字符.

<!-- page 3 of 11 -->

![](images/olmocrbench-edit-distance-example.png)

Figure 1 Binary unit test vs edit distance for reading order errors. The caption is floating and can be correctly represented either before or after the section that contains the green and yellow passages. A unit test that checks the presence of text ordering "green, then yellow, uninterrupted by red" will place an equivalent score to OCR output that places caption before or after the main passage. Yet, edit distance highly penalizes cases where the caption occurs *after* the yellow text. Furthermore, edit distance sometimes partially rewards cases which should be considered a severe reading order failure, such as when the caption occurs *in-between* the green and yellow texts or the green then yellow text ordering is flipped.

图 1: 阅读顺序错误下二元单元测试与编辑距离的对比. 左为原页面 (红框为浮动图注, 绿框与黄框为一段被分栏切开的正文), 右为六种输出顺序在两种指标下的得分.

![](images/equation-unit-test.png)

Figure 2 Binary unit test vs edit distance for math equation parsing. For a given equation and its reference LaTeX, model A produces a text output that is more dissimilar to the reference LaTeX than model B; however, after rendering and comparing the relative bounding box positions of rendered equation DOM elements, model A passes the unit test, while model B fails. Limitations of edit distance for math formulas are explored further in CDM (Wang et al., 2025b).

图 2: 公式解析下二元单元测试与编辑距离的对比. 模型 A 的 LaTeX 与参考串编辑距离 37.84, 渲染后通过; 模型 B 编辑距离 9.33, 渲染后失败.

While popular OCR benchmarks often use a form of edit distance (Ouyang et al., 2024) against a ground truth, we developed olmOCR-Bench around **binary unit tests** for two key properties:

主流 OCR 基准大多计算输出与真值之间某种形式的编辑距离 (Ouyang et al., 2024), 而我们围绕**二元单元测试**设计 olmOCR-Bench, 是看中它的两个性质:

- **Equal treatment of "ties".** Floating document elements like tables or figures lack a definitive ground truth representation. Unit tests can allow for these different-yet-equivalently-correct representations of the same OCR'd content to yield similar scores, while edit distance often rewards/penalizes these cases differently.
- **Continuous score doesn't necessarily measure "correctness".** The use of edit distance as a continuous scoring function rewards/penalizes OCR output in a manner that doesn't correlate with practical notions of correctness, such as placing greater emphasis on correct ordering of main body text rather than caption placement or post-rendered correctness of a LaTeX formula rather than the LaTeX form itself.

- **对「并列正确」一视同仁.** 表格, 插图这类浮动元素没有唯一确定的真值写法. 同一内容的几种写法不同但同样正确, 单元测试可以给它们相近的分数, 编辑距离则常常对它们奖罚不一.
- **连续分数不一定衡量「正确与否」.** 把编辑距离当连续评分函数时, 它的奖罚方式与实际意义上的正确性对不上. 例如实际更看重正文顺序对不对, 而不是图注放在哪里; 更看重 LaTeX 公式渲染出来对不对, 而不是 LaTeX 字面写法.

We include two key motivating examples in Figures 1 and 2 to further illustrate.

图 1 和图 2 给出两个说明动机的例子.

> **拆开:** Figure 1 里第二行 (正文顺序对, 图注放在正文之后) 编辑距离是 0.85, 而第六行 (图注在前, 但绿, 黄两段顺序颠倒) 只有 0.40, 编辑距离为什么会把后者判得更近?
> 答: 图中参考串的顺序是第一行「图注, 绿, 黄」, 它的编辑距离为 0. 编辑距离按字符的插入, 删除, 替换计数, 整段图注从开头挪到末尾, 相当于先删掉一整段再在后面插回一整段, 代价约为两倍图注长度; 第六行「图注, 黄, 绿」保留了图注在开头, 只需要把绿, 黄两段对调, 如果绿段比图注短, 代价就更小. 所以编辑距离量的是「离参考串的字面写法有多远」, 不区分哪一段放错了位置. 单元测试只检查「绿在黄之前, 中间不夹红」这一个约束, 第二行通过, 第六行不通过; 第五行 (绿, 图注, 黄) 正文顺序没错, 但图注把两段隔开, 同样不通过, 编辑距离却只给 0.45. 图里的数值是归一化后的距离, 具体归一化方式文中没有给出.

While prior work has explored improvements to edit distance, particularly for math formulas (Wang et al., 2025b), and such ideas have led to recent updates in popular benchmarks like OmniDocBench v1.5 (Ouyang et al., 2024), there is still much more work to be done to develop calibrated continuous scores for other types of OCR targets beyond math formulas. Binary unit tests, on the other hand, offer us a single elegant framework to simultaneously develop evaluations for a diversity of OCR errors.

已有工作改进过编辑距离, 尤其是针对公式 (Wang et al., 2025b), 这些想法也促成了 OmniDocBench v1.5 (Ouyang et al., 2024) 等主流基准的近期更新. 但除公式之外, 要给其他类型的 OCR 目标设计校准过的连续分数, 还有很多工作要做. 二元单元测试则提供了一个统一的框架, 可以同时为多种 OCR 错误设计评测.

<!-- page 4 of 11 -->

![](images/html-rendering.png)

Figure 3 HTML page generation for our olmOCR 2 synthetic data pipeline. We sample a page from a real document (left) and prompt a general VLM to generate a highly similar HTML page (right). The rendered HTML page image paired with the raw HTML serves as supervision for our OCR-specialized VLM.

图 3: 合成数据流水线中的 HTML 页面生成. 左为真实论文页面, 右为通用 VLM 生成的 HTML 渲染结果, 插图被替换成灰色占位框.

## 3 Scaling Unit Test Generation for RLVR · 为 RLVR 批量生成单元测试

### 3.1 Data · 数据

The original unit tests that make up olmOCR-Bench were all manually verified and took hours of work to create and check by hand. In order to scale unit test creation to support RL training, we develop a pipeline to create large numbers of synthetic test cases with very high accuracy. The pipeline synthetically creates HTML pages corresponding to real PDF documents, which allows programmatic generation of unit tests. An example of the generated HTML is shown in Figure 3.

olmOCR-Bench 原有的单元测试都经过人工核验, 手工编写和检查花了大量工时. 为了把单元测试的规模做大以支撑 RL 训练, 我们搭了一条流水线, 大量生成准确率很高的合成测试用例. 流水线为真实 PDF 文档合成对应的 HTML 页面, 由此可以用程序生成单元测试. 图 3 是一个生成的 HTML 示例.

**PDF sourcing** We sample documents that contain relevant, difficult-to-OCR material. For example, to focus on unit tests for math equations, we source from arXiv math-heavy papers. By sampling real-world documents, we create a high diversity of documents, instead of being restricted to just a handful of pre-made templates.

**PDF 来源** 我们采样包含相关且难以 OCR 的内容的文档. 例如要侧重公式类单元测试, 就从公式密集的 arXiv 论文中取. 采样真实文档能得到多样性很高的文档集合, 不会被限制在少数几种预制模板里.

**PDF to HTML conversion** We iteratively prompt a general VLM to first create, and then refine, the HTML code that best represents the rasterized image of a page. In detail, this can be broken down in three steps:

**PDF 转 HTML** 我们反复提示一个通用 VLM, 先生成, 再精修, 得到最能还原页面栅格图像的 HTML 代码. 具体分三步:

1. **Layout analysis**. We first use the VLM with a picture of a randomly sampled page from PDF documents and ask it to analyze the document. In this step, we prompt (footnote 1) the VLM to identify the general layout of the page, such as number of columns, presence of images or tables, headers and footers, and so on. This step provides guidance during HTML page generation to improve coverage of unit test elements.

1. **版式分析.** 先把从 PDF 文档中随机抽取的一页图片交给 VLM, 让它分析文档. 这一步的提示 (脚注 1) 要求 VLM 识别页面的整体版式, 比如栏数, 有没有图片或表格, 页眉页脚等. 这一步为后面生成 HTML 提供指引, 提高单元测试所需元素的覆盖率.

2. **Content rendering**. We prompt (footnote 2) the general VLM again with the previous model output and the same

Footnote 1: [github.com/allenai/olmocr/olmocr/bench/synth/mine_html_templates.py#L398-L420](https://github.com/allenai/olmocr/blob/f5fad405c0bc47ce7196fad5b9f2c69d33da4ef2/olmocr/bench/synth/mine_html_templates.py#L398-L420)

Footnote 2: [github.com/allenai/olmocr/olmocr/bench/synth/mine_html_templates.py#L437-L465](https://github.com/allenai/olmocr/blob/f5fad405c0bc47ce7196fad5b9f2c69d33da4ef2/olmocr/bench/synth/mine_html_templates.py#L437-L465)

脚注 1, 2: 指向官方仓库固定 commit 下 `mine_html_templates.py` 的两段提示词代码.

<!-- page 5 of 11 -->

document image, and ask it to "render this document as clean, semantic HTML" fitting into the same dimensions as the original.

2. **内容渲染.** 再次提示 (脚注 2) 通用 VLM, 输入上一步的模型输出和同一张文档图像, 要求它「把这份文档渲染成干净, 语义化的 HTML」, 尺寸与原页面一致.

3. **Output refinement**. We render the HTML generated at the previous step, convert it to an image, and pass it to the general VLM along with the original document image and the generated HTML. We prompt (footnote 3) the general VLM to refine its HTML to better match the original.

3. **输出精修.** 把上一步生成的 HTML 渲染出来转成图像, 连同原始文档图像和生成的 HTML 一起交给通用 VLM, 提示 (脚注 3) 它修改 HTML, 让渲染结果更贴近原页面.

**Unit test creation** We create olmOCR-Bench-compatible test cases based on the semantics of the HTML the VLM produced. For example, the layout analysis step asks for headers and footers to be in HTML `<header>` and `<footer>` tags, so we can generate "Text Absence" test cases for those. Math equations are rendered with KaTeX, so we can extract those and create test cases matching them. Tables are extracted from the ground-truth in the same way, and random cells sampled to create test cases.

**生成单元测试** 我们根据 VLM 生成的 HTML 的语义, 生成与 olmOCR-Bench 兼容的测试用例. 例如版式分析一步要求把页眉页脚放进 HTML 的 `<header>` 和 `<footer>` 标签, 这样就能为它们生成「文本不出现」测试. 公式用 KaTeX 渲染, 所以可以把公式抽出来, 生成与之匹配的测试. 表格同样从真值中抽取, 随机采样单元格生成测试.

**Implementation** We use `claude-sonnet-4-20250514` as the general VLM for the procedure described above. Overall, we found it sufficiently accurate and cost effective, costing approximately \$0.12 per document page. We note that our pipeline is robust to hallucinations: even in cases where Claude makes an error when it is performing OCR, that does not affect our pipeline, as we use the HTML output alone to generate unit tests. olmOCR2-synthmix-1025, our final data mix consists of 2,186 PDF pages. In total, across these PDF pages, we create 30,381 test cases.

**实现** 上述流程中的通用 VLM 用的是 `claude-sonnet-4-20250514`. 总体上它足够准确, 成本也合适, 每页约 0.12 美元. 这条流水线对幻觉是稳健的: 即使 Claude 在做 OCR 时出错, 也不影响流水线, 因为单元测试只从 HTML 输出生成. 最终的数据集 olmOCR2-synthmix-1025 由 2,186 个 PDF 页面组成, 在这些页面上一共生成 30,381 个测试用例.

> **问:** §3.1 说 Claude 做 OCR 出错也不影响流水线, 可 HTML 本身就是 Claude 写的, 抄错的字怎么不会变成错误的测试?
> 答: 关键在训练时喂给模型的图像是什么. Figure 3 的题注写明「渲染后的 HTML 页面图像与原始 HTML 配对」作为监督; 官方 `grpo_train.py` 的 `OlmOCRBenchDataset` 从 `bench_data/pdfs/` 读页面, 数据集卡说明那里放的是由 HTML 重新渲染的单页 PDF. 所以策略模型看到的是 HTML 自己渲染出的页面, Claude 把原文 0.60 抄成 0.66, 渲染图上也是 0.66, 测试要求 0.66, 图像与测试互相一致, 错误只让这一页偏离了原始文档, 不会产生「看到 A 却要求输出 B」的错标. 这一说法只覆盖单元测试奖励; 同一份代码里的元数据奖励会拿 `claude_original/` 中 Claude 原始 OCR 输出的语言, 旋转, 是否表格等字段作参照, Claude 在这几个字段上的判断错误会直接进入奖励.

Alongside olmOCR2-synthmix-1025, we use a refreshed mix for supervised fine-tuning, olmOCR-mix-1025. The dataset contains 267,962 pages from over 100,000 PDFs sampled from diverse sources, including 9,828 pages from national archives. Compared to olmOCR-mix-0225, the new mix has been re-processed using GPT-4.1 instead of GPT-4o, has more consistent equation formatting (with `\[` and `\(` for block and inline math), uses HTML format for tables, and includes basic alt text for images. See Table 2 for SFT results using these two training sets.

除了 olmOCR2-synthmix-1025, 我们还更新了监督微调用的数据 olmOCR-mix-1025. 它包含来自 10 万多份 PDF 的 267,962 页, 来源多样, 其中 9,828 页来自国家档案馆. 与 olmOCR-mix-0225 相比, 新数据改用 GPT-4.1 而不是 GPT-4o 重新处理, 公式格式更统一 (块级公式用 `\[`, 行内公式用 `\(`), 表格改用 HTML 格式, 图片带有基本的 alt 文本. 两套训练集的 SFT 结果见 Table 2.

| | ArXiv | Old scans math | Tables | Old scans | Headers & footers | Multi column | Long tiny text | Base | Overall |
|---|---|---|---|---|---|---|---|---|---|
| olmOCR-mix-0225 | 78.6 | 79.9 | 72.9 | 43.9 | 95.1 | 77.3 | 81.2 | 98.9 | 78.5 ± 1.1 |
| olmOCR-mix-1025 | 70.8 | 79.3 | 77.9 | 45.6 | 93.7 | 81.3 | 78.7 | 99.3 | 78.3 ± 1.2 |

Table 2 Finetuning on a single epoch of olmOCR-mix-0225 vs olmOCR-mix-1025, evaluated on olmOCR-Bench.

表 2: 在 olmOCR-mix-0225 与 olmOCR-mix-1025 上各微调一个 epoch, 在 olmOCR-Bench 上的成绩.

### 3.2 Training · 训练

We start with a Qwen2.5-VL-7B-Instruct model that has been fine-tuned on olmOCR-mix-1025 as described in Poznanski et al. (2025). We train for one epoch on olmOCR2-synthmix-1025 using an 8xH100 GPU node. For each document, 28 completions are generated. Each completion gets scored using the standard olmOCR-Bench scoring rules, where each test case is either a pass or fail, and the reward is the fraction from 0.0 to 1.0 of passing test cases. An example of this reward is shown in Figure 4.

起点是按 Poznanski et al. (2025) 的方法在 olmOCR-mix-1025 上微调过的 Qwen2.5-VL-7B-Instruct. 我们用一台 8 卡 H100 节点在 olmOCR2-synthmix-1025 上训练一个 epoch. 每份文档生成 28 个 completion. 每个 completion 按标准的 olmOCR-Bench 评分规则打分: 每个测试用例要么通过要么失败, 奖励是通过的测试所占的比例, 取值 0.0 到 1.0. 图 4 是这种奖励的一个例子.

Besides the unit test above, we include two additional rewards to ensure correct output format: a binary reward for whether the model completion ends with the EOS token, and a reward between 0 and 1 to ensure that the model outputs document metadata at the top of its response (*e.g.*, primary language, rotation correction factor).

除了上述单元测试, 我们还加了两项保证输出格式正确的奖励: 一项是二元奖励, 看 completion 是否以 EOS token 结尾; 另一项取值 0 到 1, 确保模型在回复开头输出文档元数据 (例如主要语言, 旋转校正角度).

> **核对:** §3.2 一共三项奖励, 单元测试通过率, EOS, 元数据, 三者怎样合成一个标量交给 GRPO? 各自权重是多少?
> 答: 文中没有给出合成方式和权重. 官方 `grpo_train.py` 把每项奖励注册成一个 reward function, 权重由 `--reward_bench`, `--reward_eos`, `--reward_front_matter` 等参数给出 (不带数值时默认 1.0), 交给 TRL 的 `GRPOConfig(reward_weights=...)` 做加权求和, 再在每组 28 个 completion 内做组相对归一化 (`scale_rewards` 默认 `group`). 元数据奖励的实现是: front matter 能被解析得 0.5, 五个字段 (primary_language, is_rotation_valid, rotation_correction, is_table, is_diagram) 每与 Claude 原始输出一致加 0.1. 若三项权重都取 1, 总奖励落在 $[0,3]$, 单元测试一项只占三分之一的量程; 不过组内归一化只看同一页 28 个样本之间的差, 多数样本 EOS 与元数据都满分时, 优势主要由单元测试通过率的差异决定. 实际训练用的权重仓库里没有记录.

We use the Hugging Face TRL library (von Werra et al., 2020), with KL divergence $\beta = 0.01$. To maximize performance, we found it beneficial to train multiple models, and average, or *soup* (Wortsman et al., 2022), their weights. In detail, we train six models with different random seeds, and soup their weights at the end.

训练用 Hugging Face TRL 库 (von Werra et al., 2020), KL 散度系数 $\beta = 0.01$. 为了把性能做到最好, 我们发现训练多个模型再把权重平均 (即 *soup*, Wortsman et al., 2022) 有好处. 具体做法是用六个不同的随机种子训练六个模型, 最后把它们的权重平均.

Footnote 3: [github.com/allenai/olmocr/olmocr/bench/synth/mine_html_templates.py#L510-L546](https://github.com/allenai/olmocr/blob/f5fad405c0bc47ce7196fad5b9f2c69d33da4ef2/olmocr/bench/synth/mine_html_templates.py#L510-L546)

脚注 3: 指向同一文件中精修步骤的提示词代码.

<!-- page 6 of 11 -->

![](images/grpo-reward.png)

Figure 4 Unit test rewards for olmOCR 2's RLVR training. Given a generated HTMl page and its unit tests (left), we can easily score a generated Markdown page (right) according to these unit tests. Each test contributes a binary reward which is aggregated at a page-level as a pass rate. For example, with 4 of 6 passes, the page level reward is 0.67.

图 4: RLVR 训练中的单元测试奖励. 左为 HTML 渲染页及六个测试 (页眉不出现, 表头「Model」在「GPT-4-turbo」之上, 「0.60」在「0.57」之上, 某段文字出现, 两段顺序正确, 页码不出现), 右为模型输出的 Markdown 及每个测试的通过情况.

## 4 Results · 结果

Table 3 presents a summary of major development points between our initial olmOCR and olmOCR 2, evaluated on the latest version of olmOCR-Bench. We also include a number of powerful OCR baselines, including the latest versions of actively developed open OCR projects like Marker, MinerU, and PaddleOCR, as well as some recent additions to the state-of-the-art in OCR-specialized VLMs. Our key findings are:

Table 3 汇总了从最初的 olmOCR 到 olmOCR 2 之间的主要开发节点, 全部在最新版 olmOCR-Bench 上评测. 表中也列了几个强 OCR 基线, 包括 Marker, MinerU, PaddleOCR 等仍在活跃开发的开源 OCR 项目的最新版本, 以及近期达到最好水平的几个专做 OCR 的 VLM. 主要发现如下:

**Dynamic temperature scaling.** Our first version of olmOCR set a default temperature of 0.8. We found that sampling at a lower temperature tends to give better results but at the risk of VLM inference encountering repetition loops. To take advantage of low temperatures while mitigating this repetition issue, we use dynamic temperature scaling starting at 0.1 and continually increasing it to 0.2, 0.3 and so on up to a max of 0.8. Each increase is triggered off a failure in the model to generate an EOS token (and thus repeat infinitely). This resulted in significant improvement in overall benchmark performance.

**动态温度.** 第一版 olmOCR 的默认采样温度是 0.8. 我们发现低温采样往往效果更好, 但 VLM 推理更容易陷入重复循环. 为了既用上低温又缓解重复, 我们采用动态温度: 从 0.1 开始, 逐步升到 0.2, 0.3, 依此类推, 最高到 0.8. 每次升温都由模型没能生成 EOS token (因而无限重复) 触发. 这一改动让基准总分显著提高.

> **再看:** 动态温度「0.1, 0.2, 0.3, 依此类推, 最高 0.8」在推理代码里是怎样一张表? 最多会重试几次?
> 答: 论文给的固定 commit (f5fad405) 与 main 分支的 `pipeline.py` 都写着 `TEMPERATURE_BY_ATTEMPT = [0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 0.9, 1.0]`, 第 $k$ 次尝试 ($k$ 从 0 起) 取第 $k$ 项, 超出表长取最后一项; `--max_page_retries` 默认 8, 所以一页最多尝试 8 次, 温度依次是 0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 0.9, 1.0. 与论文描述有三处不同: 0.1 用两次, 0.3 之后跳到 0.5, 上限是 1.0 而不是 0.8. 重试的触发条件是返回的 `finish_reason` 不是 `stop` (没生成 EOS) 或总 token 超过 16384. 8 次都失败时, 这一页退回 `pdftotext` 抽取的文本层.

**Better prompting.** We found an unintended bug in which order of image and the text was mismatched between training and inference prompts. We standardize prompt order by always including text first in all settings; matching the order in training and inference improved benchmark performance substantially. We experimented with the reverse order and found no meaningful difference in OCR performance, however placing any fixed text first allows for prompt caching by the inference engine.

**更好的提示.** 我们发现一个无意中引入的 bug: 训练和推理时提示中图像与文本的先后顺序不一致. 我们把所有场景的提示顺序统一为文本在前; 训练与推理顺序对齐后, 基准成绩大幅提高. 我们也试过反过来 (图像在前), OCR 效果没有明显差别, 但把固定文本放在前面可以让推理引擎做 prompt 缓存.

**New trainer.** We reimplemented our trainer for VLM finetuning, with minor tweaks to hyperparameters (*e.g.*, avoiding weight decay on the bias and layer norm weights). We found no meaningful benchmark score difference from this change.

**新训练器.** 我们重写了 VLM 微调的训练器, 对超参数做了小调整 (例如 bias 和 layer norm 权重不做 weight decay). 这一改动对基准成绩没有明显影响.

<!-- page 7 of 11 -->

| | ArXiv | Old scans math | Tables | Old scans | Headers & footers | Multi column | Long tiny text | Base | Overall |
|---|---|---|---|---|---|---|---|---|---|
| Mistral OCR API | 77.2 | 67.5 | 60.6 | 29.3 | 93.6 | 71.3 | 77.1 | 99.4 | 72.0 ± 1.1 |
| Marker 1.10.1 | 83.8 | 66.8 | 72.9 | 33.5 | 86.6 | 80.0 | 85.7 | 99.3 | 76.1 ± 1.1 |
| MinerU 2.5.4* | 76.6 | 54.6 | 84.9 | 33.7 | 96.6 | 78.2 | 83.5 | 93.7 | 75.2 ± 1.1 |
| DeepSeek-OCR | 77.2 | 73.6 | 80.2 | 33.3 | 96.1 | 66.4 | 79.4 | 99.8 | 75.7 ± 1.0 |
| Nanonets-OCR2-3B | 75.4 | 46.1 | 86.8 | 40.9 | 32.1 | 81.9 | 93.0 | 99.6 | 69.5 ± 1.1 |
| PaddleOCR-VL* | 85.7 | 71.0 | 84.1 | 37.8 | 97.0 | 79.9 | 85.7 | 98.5 | 80.0 ± 1.0 |
| Infinity-Parser 7B* | 84.4 | 83.8 | 85.0 | 47.9 | 88.7 | 84.2 | 86.4 | 99.8 | 82.5 ± ? |
| Chandra OCR 0.1.0* | 82.2 | 80.3 | 88.0 | 50.4 | 90.8 | 81.2 | 92.3 | 99.9 | 83.1 ± 0.9 |
| olmOCR (first release) | 63.3 | 67.5 | 62.3 | 38.6 | 93.4 | 67.6 | 54.8 | 97.9 | 68.2 ± 1.1 |
| + Dynamic temp scaling | 71.4 | 73.1 | 65.6 | 40.5 | 93.2 | 76.6 | 64.9 | 96.7 | 72.8 ± 1.2 |
| + Better prompting | 76.3 | 76.0 | 70.2 | 43.2 | 94.1 | 77.5 | 71.9 | 96.8 | 75.8 ± 1.0 |
| + New trainer, YAML, img resize, Qwen 2.5 VL | 78.8 | 77.5 | 71.9 | 45.4 | 94.2 | 78.6 | 81.4 | 99.8 | 78.5 ± 1.1 |
| + Handle blank pages | 78.6 | 79.9 | 72.9 | 43.9 | 95.1 | 77.3 | 81.2 | 98.9 | 78.5 ± 1.1 |
| + Synth data, RLVR, souping | 83.0 | 82.3 | 84.9 | 47.7 | 96.1 | 83.7 | 81.9 | 99.7 | 82.4 ± 1.1 |

Table 3 OCR model performance comparison. Results are reproduced in-house, except those marked with *, which are reported by model authors.

表 3: OCR 模型成绩对比. 下半部分逐行累加 olmOCR 的开发改动.

> **看表:** Table 3 的「+ Handle blank pages」一行与 Table 2 的 olmOCR-mix-0225 一行八个分项完全相同, 那么末行「+ Synth data, RLVR, souping」的 SFT 起点是哪一个?
> 答: 两行逐项相同 (78.6 / 79.9 / 72.9 / 43.9 / 95.1 / 77.3 / 81.2 / 98.9), 说明「Handle blank pages」这个模型就是在 olmOCR-mix-0225 上微调一个 epoch 的结果. §3.2 和 §4 末尾都写明 RL 从 olmOCR-mix-1025 上的 SFT 模型出发, 也就是 Table 2 中 78.3 那一行. 所以 Table 3 最后一步其实同时换了三样东西: SFT 数据 (0225 换成 1025), RL 训练, 六模型 soup, 行名只写了后两样. 按真实起点算, RL 加 soup 的增益是 $82.4-78.3=4.1$ 分, ArXiv 从 70.8 到 83.0 涨了 12.2 分, Tables 从 77.9 到 84.9 涨 7.0 分, Multi column 从 81.3 到 83.7 只涨 2.4 分; 按表中相邻两行算则是 Tables +12.0, Multi column +6.4, ArXiv +4.4. 两种算法给出的「RL 主要改善了什么」并不相同, 前者把 Tables 和 Multi column 的一部分提升归给了 1025 数据本身. 单独的「1025 SFT + RL, 不 soup」或「0225 SFT + RL」的成绩文中没有给出.

**YAML.** The first olmOCR was trained to output JSON objects. We switched to YAML, which reduced the retry rate dramatically. We speculate this is because the model does not need to remember how many open quotes there are currently in the JSON and can simply output an EOS token as soon as it is done. With JSON, we also found more incidences of repetition loops. We found no benchmark score difference, but with fewer need for retries, this improved our inference efficiency.

**YAML.** 第一版 olmOCR 训练成输出 JSON 对象. 我们改为 YAML, 重试率大幅下降. 我们推测原因是模型不必记住 JSON 中当前还有几个未闭合的引号, 写完就可以直接输出 EOS token. 用 JSON 时重复循环也更多. 基准分数没有差别, 但重试变少, 推理效率提高了.

**Image Resizing.** Our initial olmOCR used 1024px on the longest edge; olmOCR 2 uses 1288px instead. Bigger images do appear to yield slightly better performance across many model families, though they take more dedicated compute. We performed a sweep of image sizes and picked this size as a reasonable balance between benchmark score and inference speed.

**图像尺寸.** 最初的 olmOCR 把页面渲染成最长边 1024 像素, olmOCR 2 改为 1288 像素. 在很多模型家族上, 更大的图像似乎都能带来略好的效果, 代价是更多的专用算力. 我们扫了一遍图像尺寸, 选这个尺寸作为基准分数与推理速度之间的合理折中.

**Qwen 2.5 VL.** We switched from Qwen 2 VL (Wang et al., 2024b), which was our base model in olmOCR to Qwen 2.5 VL (Bai et al., 2025), resulting in a slight improvement in benchmark score.

**Qwen 2.5 VL.** 我们把基座模型从 olmOCR 用的 Qwen 2 VL (Wang et al., 2024b) 换成 Qwen 2.5 VL (Bai et al., 2025), 基准分数略有提升.

**Handle blank pages.** We caught a bug in the data loader for our olmOCR model where all instances of blank pages were being skipped. The model, never having been trained on blank pages, would hallucinate in such cases. We fixed the data loader and retrained the model, though this didn't impact benchmark scores.

**处理空白页.** 我们在 olmOCR 模型的数据加载器里发现一个 bug: 所有空白页都被跳过了. 模型从没在空白页上训练过, 遇到空白页就会产生幻觉. 我们修好数据加载器重新训练了模型, 不过基准分数没有变化.

**olmOCR 2.** Finally, our latest release olmOCR 2 demonstrates a significant improvement in benchmark performance. Our best model, reported here, is the result of:

**olmOCR 2.** 最后, 最新发布的 olmOCR 2 在基准上有显著提升. 这里报告的最佳模型由以下步骤得到:

1. A single epoch of SFT training on olmOCR-mix-1025,
2. A single epoch of RL training over our synthetic data olmOCR2-synthmix-1025,
3. Repeating the RL training for six random seeds and averaging (or "souping") the checkpoints. We used importance sampling at both the token level (3 runs) and the sequence level (3 runs); more details on their difference in Zheng et al. (2025).

1. 在 olmOCR-mix-1025 上做一个 epoch 的 SFT;
2. 在合成数据 olmOCR2-synthmix-1025 上做一个 epoch 的 RL;
3. 用六个随机种子重复 RL 训练, 再把检查点平均 (即「souping」). 其中 3 次用 token 级重要性采样, 3 次用序列级重要性采样, 两者的区别见 Zheng et al. (2025).

<!-- page 8 of 11 -->

## 5 Related Work · 相关工作

**Machine learning models for OCR.** OCR of digitized print documents, often in PDF format, has been a long-standing research area, even dating back to the 1950s (Mori et al., 1992; Smith, 2013); these systems were largely built on hand-written pipelines based on expert understanding of the PDF internal representation (PDF Association staff, 2015). The incorporation of modern machine learning models into these pipelines marked a notable paradigm shift, leading to the development of powerful OCR systems like MinerU (Wang et al., 2024a), Marker (Paruchuri, 2025a) and PP-OCRv5 (Cui et al., 2025b). Such systems often compose multiple models together (*e.g.*, section segmentation or table parsing using small, specialized models).

**OCR 中的机器学习模型.** 对数字化印刷文档 (通常是 PDF) 做 OCR 是一个历史很长的研究方向, 可以追溯到 20 世纪 50 年代 (Mori et al., 1992; Smith, 2013); 这些系统大多是人工编写的流水线, 依赖专家对 PDF 内部表示的理解 (PDF Association staff, 2015). 把现代机器学习模型引入这些流水线是一次明显的范式转变, 催生了 MinerU (Wang et al., 2024a), Marker (Paruchuri, 2025a), PP-OCRv5 (Cui et al., 2025b) 等强 OCR 系统. 这类系统通常把多个模型组合起来 (例如用小的专用模型做版面分割或表格解析).

**Rise of vision language models.** We are seeing yet another paradigm shift in OCR methodology, relying on increasing power of vision language models (VLMs) to generate the target OCR text in an end-to-end fashion. This was a rare pattern prior to 2025. Notable exceptions to the rule include Nougat (Blecher et al., 2023) and GOT-OCR 2.0 (Wei et al., 2024), models capable of taking images of PDF pages as input and return plain text. Also in 2024 was the release of GPT-4o (OpenAI et al., 2024), which boasted another major leap in PDF understanding, and we saw other frontier model developers soon after release general VLMs with improved OCR capabilities (*e.g.* Gemini 2 (Google, 2025) and Qwen 2.5VL (Bai et al., 2025)). Our initial release of olmOCR (Poznanski et al., 2025) demonstrated the ability to distill GPT-4o's OCR capability into a small 7B VLM. Using VLMs as the foundation for OCR has since seen widespread adoption with ever more impressive models; notable examples include end-to-end systems like Nanonets-OCR2-3B (Mandal et al., 2025), MinerU 2.5 (Niu et al., 2025), dots.OCR (Jian et al., 2025), Monkey OCR (Li et al., 2025) and Chandra OCR (Paruchuri, 2025b), as well as hybrid systems like DeepSeek-OCR (DeepSeek-AI, 2025) and PaddleOCR-VL (Cui et al., 2025a) that use powerful VLMs as the backbone within ML pipelines.

**视觉语言模型的兴起.** OCR 方法正在经历又一次范式转变: 依靠越来越强的视觉语言模型 (VLM) 端到端地生成目标 OCR 文本. 在 2025 年之前这种做法很少见. 少数例外是 Nougat (Blecher et al., 2023) 和 GOT-OCR 2.0 (Wei et al., 2024), 它们以 PDF 页面图像为输入, 输出纯文本. 同在 2024 年发布的 GPT-4o (OpenAI et al., 2024) 在 PDF 理解上又有一次大的跃升, 其他前沿模型开发者随后也发布了 OCR 能力更强的通用 VLM (例如 Gemini 2 (Google, 2025) 和 Qwen 2.5VL (Bai et al., 2025)). 我们最初发布的 olmOCR (Poznanski et al., 2025) 证明了可以把 GPT-4o 的 OCR 能力蒸馏进一个 7B 的小 VLM. 此后以 VLM 为基础做 OCR 被广泛采用, 模型越来越强; 代表性的端到端系统有 Nanonets-OCR2-3B (Mandal et al., 2025), MinerU 2.5 (Niu et al., 2025), dots.OCR (Jian et al., 2025), Monkey OCR (Li et al., 2025) 和 Chandra OCR (Paruchuri, 2025b), 混合系统有 DeepSeek-OCR (DeepSeek-AI, 2025) 和 PaddleOCR-VL (Cui et al., 2025a), 它们在机器学习流水线中以强 VLM 作骨干.

**Reinforcement learning for OCR** Several other recent models have explored reinforcement learning for OCR. DianJin-OCR-R1 (Chen et al., 2025) uses RL rewards to finetune a reasoning model to improve OCR performance by using chain of thought to dedicate more inference compute to difficult document sections. Other works such as (He et al., 2025) and (Xiong et al., 2025) have demonstrated that RL rewards improve performance in visual document answering systems.

**用于 OCR 的强化学习** 近期还有几个模型探索了用强化学习做 OCR. DianJin-OCR-R1 (Chen et al., 2025) 用 RL 奖励微调一个推理模型, 借助 CoT 在难处理的文档区域投入更多推理算力, 以提升 OCR 效果. He et al. (2025) 和 Xiong et al. (2025) 等工作则证明了 RL 奖励能提升视觉文档问答系统的表现.

The closest work to ours is Infinity Parser (Wang et al., 2025a) which also develops a synthetic data pipeline around HTML renderings and trains their OCR-specialized VLM using GRPO with verifiable rewards. A slight difference in our works is our use of sampled real content to seed generation of full HTML pages while their work injected sampled real content into pre-made HTML layouts. A more significant difference is that we use binary unit tests as our verifiable reward signal while they define their reward based on edit distance, paragraph count, and structural consistency.

与我们最接近的工作是 Infinity Parser (Wang et al., 2025a), 它同样围绕 HTML 渲染搭建合成数据流水线, 并用带可验证奖励的 GRPO 训练专做 OCR 的 VLM. 一个小区别是: 我们以采样到的真实内容为种子生成完整的 HTML 页面, 他们则把采样到的真实内容填进预制的 HTML 版式. 更大的区别在奖励: 我们以二元单元测试作为可验证奖励信号, 他们的奖励基于编辑距离, 段落数和结构一致性.

## 6 Conclusion

We have presented olmOCR 2, a state-of-the-art OCR system powered by an OCR-specialized VLM trained using reinforcement learning with verifiable rewards. We define these rewards using binary unit tests and scale the generation of these tests through a synthetic data pipeline that samples real documents and generates similar HTML renderings as ground truth. We also present our learnings through the course of our ongoing open development of olmOCR. We release our model checkpoints, training and inference code, and two training data mixes, all under permissive open licenses to support further research in this field.

我们介绍了 olmOCR 2, 一个达到最好水平的 OCR 系统, 核心是用可验证奖励强化学习训练的专做 OCR 的 VLM. 奖励由二元单元测试定义; 测试的批量生成依靠一条合成数据流水线: 采样真实文档, 生成与之相似的 HTML 渲染作为真值. 我们也总结了在持续开放开发 olmOCR 过程中积累的经验. 模型检查点, 训练与推理代码, 以及两套训练数据都以宽松的开源许可发布, 以支持这一领域的后续研究.

In the future, we hope to further develop the synthetic data pipeline to cover more complicated document types and unit tests. We are interested in exploring further the differences between binary unit tests versus continuous scores like edit distance as evaluation targets (Ouyang et al., 2024) as well as RL rewards (Wang et al., 2025a).

今后我们希望继续扩展合成数据流水线, 覆盖更复杂的文档类型和单元测试. 我们也想进一步研究二元单元测试与编辑距离这类连续分数的差别, 既包括作为评测目标 (Ouyang et al., 2024), 也包括作为 RL 奖励 (Wang et al., 2025a).

<!-- page 9 of 11 -->

## Acknowledgements

We thank members of the Ai2 team for their support in making this release possible, especially Kyle Wiggers and Crystal Nam for their support during the release process. We thank our inference partners DeepInfra and Parasail for helping us set up public API access to olmOCR 2. We thank Haydn Jones, Charitarth Chugh, and Vik Paruchuri for their contributions to our open source repo. We thank the Qwen team for releasing open VLM models that have accelerated this exciting line of work. We thank the many developers of other open OCR systems for their usage of and feedback on olmOCR-Bench. This research used resources of the Oak Ridge Leadership Computing Facility, which is a DOE Office of Science User Facility supported under Contract DE-AC05-00OR22725.

## References

Shuai Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Sibo Song, Kai Dang, Peng Wang, Shijie Wang, Jun

Tang, Humen Zhong, Yuanzhi Zhu, Mingkun Yang, Zhaohai Li, Jianqiang Wan, Pengfei Wang, Wei Ding, Zheren Fu, Yiheng Xu, Jiabo Ye, Xi Zhang, Tianbao Xie, Zesen Cheng, Hang Zhang, Zhibo Yang, Haiyang Xu, and Junyang Lin. Qwen2.5-VL technical report. arXiv [cs.CV], February 2025.

Lukas Blecher, Guillem Cucurull, Thomas Scialom, and Robert Stojnic. Nougat: Neural optical understanding for

academic documents, 2023. URL https://arxiv.org/abs/2308.13418.

Qian Chen, Xianyin Zhang, Lifan Guo, Feng Chen, and Chi Zhang. Dianjin-ocr-r1: Enhancing ocr capabilities via a

reasoning-and-tool interleaved vision-language model, 2025. URL https://arxiv.org/abs/2508.13238.

Cheng Cui, Ting Sun, Suyin Liang, Tingquan Gao, Zelun Zhang, Jiaxuan Liu, Xueqing Wang, Changda Zhou, Hongen

Liu, Manhui Lin, Yue Zhang, Yubo Zhang, Handong Zheng, Jing Zhang, Jun Zhang, Yi Liu, Dianhai Yu, and Yanjun Ma. Paddleocr-vl: Boosting multilingual document parsing via a 0.9b ultra-compact vision-language model, 2025a. URL https://arxiv.org/abs/2510.14528.

Cheng Cui, Ting Sun, Manhui Lin, Tingquan Gao, Yubo Zhang, Jiaxuan Liu, Xueqing Wang, Zelun Zhang, Changda

Zhou, Hongen Liu, Yue Zhang, Wenyu Lv, Kui Huang, Yichao Zhang, Jing Zhang, Jun Zhang, Yi Liu, Dianhai Yu, and Yanjun Ma. Paddleocr 3.0 technical report, 2025b. URL https://arxiv.org/abs/2507.05595.

DeepSeek-AI. Deepseek-ocr: Contexts optical compression, 2025. URL https://github.com/deepseek-ai/ DeepSeek-OCR. Model available at: https://huggingface.co/deepseek-ai/DeepSeek-OCR.

Google. Explore document processing capabilities with the gemini API. https://web.archive.org/web/ 20250224064040/https://ai.google.dev/gemini-api/docs/document-processing?lang=python, 2025. Accessed: 2025-2-23.

Zhentao He, Can Zhang, Ziheng Wu, Zhenghao Chen, Yufei Zhan, Yifan Li, Zhao Zhang, Xian Wang, and Minghui

Qiu. Seeing is believing? mitigating ocr hallucinations in multimodal large language models, 2025. URL https: //arxiv.org/abs/2506.20168.

Mi Jian, Yumeng Li, Bowen Wang, Xiaomin He, Zheyuan Gu, Qing Yan, Colin Zhang, and Lei Zhang. dots.ocr:

Multilingual Document Layout Parsing in a Single Vision-Language Model. https://github.com/rednote-hilab/ dots.ocr, 2025. GitHub repository.

Nathan Lambert, Jacob Daniel Morrison, Valentina Pyatkin, Shengyi Huang, Hamish Ivison, Faeze Brahman, Lester

James Validad Miranda, Alisa Liu, Nouha Dziri, Shane Lyu, Yuling Gu, Saumya Malik, Victoria Graf, Jena D. Hwang, Jiangjiang Yang, Ronan Le Bras, Oyvind Tafjord, Chris Wilhelm, Luca Soldaini, Noah A. Smith, Yizhong Wang, Pradeep Dasigi, and Hanna Hajishirzi. Tulu 3: Pushing frontiers in open language model post-training. 2024. URL https://api.semanticscholar.org/CorpusID:274192505.

Zhang Li, Yuliang Liu, Qiang Liu, Zhiyin Ma, Ziyang Zhang, Shuo Zhang, Zidun Guo, Jiarui Zhang, Xinyu Wang,

and Xiang Bai. Monkeyocr: Document parsing with a structure-recognition-relation triplet paradigm, 2025. URL https://arxiv.org/abs/2506.05218.

Souvik Mandal, Ashish Talewar, Siddhant Thakuria, Paras Ahuja, and Prathamesh Juvatkar. Nanonets-ocr2: A model

for transforming documents into structured markdown with intelligent content recognition and semantic tagging, 2025.

9

<!-- page 10 of 11 -->

Michael Matena and Colin Raffel. Merging models with fisher-weighted averaging. 2022. URL https://arxiv.org/

abs/2111.09832.

S Mori, C Y Suen, and K Yamamoto. Historical review of OCR research and development. Proceedings of the IEEE.

Institute of Electrical and Electronics Engineers, 80(7):1029–1058, July 1992. ISSN 0018-9219,1558-2256. doi: 10.1109/5.156468.

Junbo Niu, Zheng Liu, Zhuangcheng Gu, Bin Wang, Linke Ouyang, Zhiyuan Zhao, Tao Chu, Tianyao He, Fan Wu,

Qintong Zhang, et al. Mineru2. 5: A decoupled vision-language model for efficient high-resolution document parsing. arXiv preprint arXiv:2509.22186, 2025.

OpenAI, Josh Achiam, Steven Adler, Sandhini Agarwal, Lama Ahmad, Ilge Akkaya, Florencia Leoni Aleman, Diogo

Almeida, Janko Altenschmidt, Sam Altman, Shyamal Anadkat, Red Avila, Igor Babuschkin, Suchir Balaji, Valerie Balcom, Paul Baltescu, Haiming Bao, Mohammad Bavarian, Jeff Belgum, Irwan Bello, Jake Berdine, Gabriel Bernadett-Shapiro, Christopher Berner, Lenny Bogdonoff, Oleg Boiko, Madelaine Boyd, Anna-Luisa Brakman, Greg Brockman, Tim Brooks, Miles Brundage, Kevin Button, Trevor Cai, Rosie Campbell, Andrew Cann, Brittany Carey, Chelsea Carlson, Rory Carmichael, Brooke Chan, Che Chang, Fotis Chantzis, Derek Chen, Sully Chen, Ruby Chen, Jason Chen, Mark Chen, Ben Chess, Chester Cho, Casey Chu, Hyung Won Chung, Dave Cummings, Jeremiah Currier, Yunxing Dai, Cory Decareaux, Thomas Degry, Noah Deutsch, Damien Deville, Arka Dhar, David Dohan, Steve Dowling, Sheila Dunning, Adrien Ecoffet, Atty Eleti, Tyna Eloundou, David Farhi, Liam Fedus, Niko Felix, Simón Posada Fishman, Juston Forte, Isabella Fulford, Leo Gao, Elie Georges, Christian Gibson, Vik Goel, Tarun Gogineni, Gabriel Goh, Rapha Gontijo-Lopes, Jonathan Gordon, Morgan Grafstein, Scott Gray, Ryan Greene, Joshua Gross, Shixiang Shane Gu, Yufei Guo, Chris Hallacy, Jesse Han, Jeff Harris, Yuchen He, Mike Heaton, Johannes Heidecke, Chris Hesse, Alan Hickey, Wade Hickey, Peter Hoeschele, Brandon Houghton, Kenny Hsu, Shengli Hu, Xin Hu, Joost Huizinga, Shantanu Jain, Shawn Jain, Joanne Jang, Angela Jiang, Roger Jiang, Haozhun Jin, Denny Jin, Shino Jomoto, Billie Jonn, Heewoo Jun, Tomer Kaftan, Łukasz Kaiser, Ali Kamali, Ingmar Kanitscheider, Nitish Shirish Keskar, Tabarak Khan, Logan Kilpatrick, Jong Wook Kim, Christina Kim, Yongjik Kim, Jan Hendrik Kirchner, Jamie Kiros, Matt Knight, Daniel Kokotajlo, Łukasz Kondraciuk, Andrew Kondrich, Aris Konstantinidis, Kyle Kosic, Gretchen Krueger, Vishal Kuo, Michael Lampe, Ikai Lan, Teddy Lee, Jan Leike, Jade Leung, Daniel Levy, Chak Ming Li, Rachel Lim, Molly Lin, Stephanie Lin, Mateusz Litwin, Theresa Lopez, Ryan Lowe, Patricia Lue, Anna Makanju, Kim Malfacini, Sam Manning, Todor Markov, Yaniv Markovski, Bianca Martin, Katie Mayer, Andrew Mayne, Bob McGrew, Scott Mayer McKinney, Christine McLeavey, Paul McMillan, Jake McNeil, David Medina, Aalok Mehta, Jacob Menick, Luke Metz, Andrey Mishchenko, Pamela Mishkin, Vinnie Monaco, Evan Morikawa, Daniel Mossing, Tong Mu, Mira Murati, Oleg Murk, David Mély, Ashvin Nair, Reiichiro Nakano, Rajeev Nayak, Arvind Neelakantan, Richard Ngo, Hyeonwoo Noh, Long Ouyang, Cullen O’Keefe, Jakub Pachocki, Alex Paino, Joe Palermo, Ashley Pantuliano, Giambattista Parascandolo, Joel Parish, Emy Parparita, Alex Passos, Mikhail Pavlov, Andrew Peng, Adam Perelman, Filipe de Avila Belbute Peres, Michael Petrov, Henrique Ponde de Oliveira Pinto, Michael, Pokorny, Michelle Pokrass, Vitchyr H. Pong, Tolly Powell, Alethea Power, Boris Power, Elizabeth Proehl, Raul Puri, Alec Radford, Jack Rae, Aditya Ramesh, Cameron Raymond, Francis Real, Kendra Rimbach, Carl Ross, Bob Rotsted, Henri Roussez, Nick Ryder, Mario Saltarelli, Ted Sanders, Shibani Santurkar, Girish Sastry, Heather Schmidt, David Schnurr, John Schulman, Daniel Selsam, Kyla Sheppard, Toki Sherbakov, Jessica Shieh, Sarah Shoker, Pranav Shyam, Szymon Sidor, Eric Sigler, Maddie Simens, Jordan Sitkin, Katarina Slama, Ian Sohl, Benjamin Sokolowsky, Yang Song, Natalie Staudacher, Felipe Petroski Such, Natalie Summers, Ilya Sutskever, Jie Tang, Nikolas Tezak, Madeleine B. Thompson, Phil Tillet, Amin Tootoonchian, Elizabeth Tseng, Preston Tuggle, Nick Turley, Jerry Tworek, Juan Felipe Cerón Uribe, Andrea Vallone, Arun Vijayvergiya, Chelsea Voss, Carroll Wainwright, Justin Jay Wang, Alvin Wang, Ben Wang, Jonathan Ward, Jason Wei, CJ Weinmann, Akila Welihinda, Peter Welinder, Jiayi Weng, Lilian Weng, Matt Wiethoff, Dave Willner, Clemens Winter, Samuel Wolrich, Hannah Wong, Lauren Workman, Sherwin Wu, Jeff Wu, Michael Wu, Kai Xiao, Tao Xu, Sarah Yoo, Kevin Yu, Qiming Yuan, Wojciech Zaremba, Rowan Zellers, Chong Zhang, Marvin Zhang, Shengjia Zhao, Tianhao Zheng, Juntang Zhuang, William Zhuk, and Barret Zoph. Gpt-4 technical report, 2024. URL https://arxiv.org/abs/2303.08774.

Linke Ouyang, Yuan Qu, Hongbin Zhou, Jiawei Zhu, Rui Zhang, Qunshu Lin, Bin Wang, Zhiyuan Zhao, Man Jiang,

Xiaomeng Zhao, Jin Shi, Fan Wu, Pei Chu, Minghao Liu, Zhenxiang Li, Chao Xu, Bo Zhang, Botian Shi, Zhongying Tu, and Conghui He. Omnidocbench: Benchmarking diverse pdf document parsing with comprehensive annotations, 2024. URL https://arxiv.org/abs/2412.07626.

Vik Paruchuri. Marker: Convert pdf to markdown + json quickly with high accuracy, 2025a. URL https://github.

com/VikParuchuri/marker. Version 1.4.0.

Vik Paruchuri. chandra: OCR model that handles complex tables, forms, handwriting with full layout. https:

//github.com/datalab-to/chandra, 2025b. GitHub repository.

10

<!-- page 11 of 11 -->

PDF Association staff. Pdf in 2016: Broader, deeper, richer. PDF Association, December 2015. URL https: //pdfa.org/pdf-in-2016-broader-deeper-richer/.

Jake Poznanski, Jon Borchardt, Jason Dunkelberger, Regan Huff, Daniel Lin, Aman Rangapur, Christopher Wilhelm,

Kyle Lo, and Luca Soldaini. olmOCR: Unlocking Trillions of Tokens in PDFs with Vision Language Models, 2025. URL https://arxiv.org/abs/2502.18443.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K.

Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models, 2024. URL https://arxiv.org/abs/2402.03300.

Ray W Smith. History of the tesseract OCR engine: what worked and what didn’t. In Richard Zanibbi and Bertrand

Coüasnon, editors, Document Recognition and Retrieval XX, volume 8658, page 865802. SPIE, February 2013. doi: 10.1117/12.2010051.

Leandro von Werra, Younes Belkada, Lewis Tunstall, Edward Beeching, Tristan Thrush, Nathan Lambert, Shengyi

Huang, Kashif Rasul, and Quentin Gallouédec. Trl: Transformer reinforcement learning. https://github.com/ huggingface/trl, 2020.

Baode Wang, Biao Wu, Weizhen Li, Meng Fang, Yanjie Liang, Zuming Huang, Haozhe Wang, Jun Huang, Ling Chen,

Wei Chu, and Yuan Qi. Infinity parser: Layout aware reinforcement learning for scanned document parsing, 2025a. URL https://arxiv.org/abs/2506.03197.

Bin Wang, Chao Xu, Xiaomeng Zhao, Linke Ouyang, Fan Wu, Zhiyuan Zhao, Rui Xu, Kaiwen Liu, Yuan Qu, Fukai

Shang, Bo Zhang, Liqun Wei, Zhihao Sui, Wei Li, Botian Shi, Yu Qiao, Dahua Lin, and Conghui He. Mineru: An open-source solution for precise document content extraction, 2024a. URL https://arxiv.org/abs/2409.18839.

Bin Wang, Fan Wu, Linke Ouyang, Zhuangcheng Gu, Rui Zhang, Renqiu Xia, Bo Zhang, and Conghui He. Image

over text: Transforming formula recognition evaluation with character detection matching, 2025b. URL https: //arxiv.org/abs/2409.03643.

Peng Wang, Shuai Bai, Sinan Tan, Shijie Wang, Zhihao Fan, Jinze Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin

Ge, Yang Fan, Kai Dang, Mengfei Du, Xuancheng Ren, Rui Men, Dayiheng Liu, Chang Zhou, Jingren Zhou, and Junyang Lin. Qwen2-vl: Enhancing vision-language model’s perception of the world at any resolution, 2024b. URL https://arxiv.org/abs/2409.12191.

Haoran Wei, Chenglong Liu, Jinyue Chen, Jia Wang, Lingyu Kong, Yanming Xu, Zheng Ge, Liang Zhao, Jianjian

Sun, Yuang Peng, et al. General ocr theory: Towards ocr-2.0 via a unified end-to-end model. arXiv preprint arXiv:2409.01704, 2024.

Mitchell Wortsman, Gabriel Ilharco, Samir Yitzhak Gadre, Rebecca Roelofs, Raphael Gontijo-Lopes, Ari S. Morcos,

Hongseok Namkoong, Ali Farhadi, Yair Carmon, Simon Kornblith, and Ludwig Schmidt. Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time, 2022. URL https: //arxiv.org/abs/2203.05482.

Junyu Xiong, Yonghui Wang, Weichao Zhao, Chenyu Liu, Bing Yin, Wengang Zhou, and Houqiang Li. Docr1: Evidence

page-guided grpo for multi-page document understanding, 2025. URL https://arxiv.org/abs/2508.07313.

Chujie Zheng, Shixuan Liu, Mingze Li, Xiong-Hui Chen, Bowen Yu, Chang Gao, Kai Dang, Yuqiong Liu, Rui Men,

An Yang, Jingren Zhou, and Junyang Lin. Group sequence policy optimization, 2025. URL https://arxiv.org/ abs/2507.18071.

11
