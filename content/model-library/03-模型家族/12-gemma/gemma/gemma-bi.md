---
title: "Gemma 版本页 · 对照译稿"
category: "模型库"
tags: ["Gemma", "对照译稿"]
published: true
excerpt: "Gemma 版本页 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 6 -->

![Image block](images/p01-gemma-4-25-6-token-https-ai-google-dev-gemma-docs-core.png)

（图：一个浅灰色圆角按钮。左半边是两张叠放的纸，右半边是一个向下的小三角，看形状是网页上带下拉菜单的复制按钮。图里没有文字，也没有数据。）

> **回看：** 这张图的文件名带着 「gemma-4-25-6-token」，图里有横幅上的内容吗？
> 没有。画面只是一个按钮，没有字，没有数。MinerU 按图片下方最近的一行文字给图起名，那一行恰好是 Gemma 4 的横幅，于是一个按钮图标挂上了 「25.6 万 token」 的名字。这一页唯一的图和任何模型都没有关系。

Gemma 4 is released with text, audio, and image input and a context window of up to 256K tokens![Learn more](https://ai.google.dev/gemma/docs/core?hl=zh-cn)

Gemma 4 发布：支持文本，音频和图像输入，上下文窗口最长 25.6 万 token![了解详情](https://ai.google.dev/gemma/docs/core?hl=zh-cn)（源文把网址也塞进了链接文字，这里去掉。下面各条同样处理。）

（源文只抓到 Google 机翻的中文页，没有英文原文。本文件每组的英文行是按中文和链接还原的英文，不是原页逐字；中文行按页面事实重写，不照搬机翻。）

> **想：** 横幅上 「上下文窗口最长 25.6 万 token」 说的是哪一代，哪几个尺寸？
> 横幅开头就是 「Gemma 4 发布」，这个数属于 Gemma 4，能读到的也就这么多。下面版本列表里 Gemma 4 的三条（3 月 31 日，4 月 16 日，6 月 3 日）只列名字和尺寸，没有一条提上下文长度，也没说音频输入是不是每个尺寸都有。「最长可达」 是上限，E2B 和 31B 是不是同一个上限，两个月后才出的 12B Unified 算不算在内，页上都没有。另外，中文 「25.6 万」 多半是从英文 「256K」 换算来的：K 按 1000 算是 256,000，按 1024 算是 262,144，机翻把这个差别抹平了，页上也没给精确数。Gemma 3 及更早各代的上下文长度，这页一个都没写。

translated by Google. Google uses AI to translate content into your preferred language. AI translations may contain errors.

translated by Google（由 Google 翻译）。Google 用 AI 把内容译成你设置的语言，AI 译文可能有错。

Switch to English

切换到英文（页面自带的语言切换按钮。）

## Gemma releases（Gemma 版本）

This page lists the releases of the Gemma family of models.

这一页按日期列出 Gemma 系列的各次发布。

June 3, 2026

2026 年 6 月 3 日

Released [Gemma 4 12B Unified](https://ai.google.dev/gemma/docs/core?hl=zh-cn).

发布 [Gemma 4 12B Unified](https://ai.google.dev/gemma/docs/core?hl=zh-cn)。

> **核对：** 12B Unified 是 Gemma 4 首发时的某个尺寸吗？
> 不是。3 月 31 日 Gemma 4 列的是 E2B，E4B，31B，26B A4B 四个，没有 12B；4 月 16 日的 MTP 也只点了这四个。12B Unified 在两个月后单独出现，链接和横幅，和 3 月 31 日那条一样都是 /gemma/docs/core，没有自己的页面。「Unified」 指什么，它和前面四个是什么关系，页上一个字都没有。所以 「Gemma 4」 在本页对应三个日期，五个带尺寸的名字，不能把 「Gemma 4 哪天发布」 答成一个日期。

April 16, 2026

2026 年 4 月 16 日

Released [Gemma 4 - MTP](https://ai.google.dev/gemma/docs/mtp/overview?hl=zh-cn) for E2B, E4B, 31B, and 26B A4B.

发布 [Gemma 4 - MTP](https://ai.google.dev/gemma/docs/mtp/overview?hl=zh-cn)，覆盖 E2B，E4B，31B 和 26B A4B。

> **拆开：** MTP 这一条算不算新模型？
> 原文的动词是 「适用于」，后面跟的正是 3 月 31 日那四个尺寸，没有新增尺寸。读起来更像给已有四个尺寸配的一样东西，链接也落在单独的 /gemma/docs/mtp/overview 文档下。MTP 是什么的缩写，用来做什么，页上没写；26B A4B 里的 「A4B」，E2B 和 E4B 里的 「E」 也都没解释。这几个字母不能照字面猜成参数量，引用时原样照抄最稳。

March 31, 2026

2026 年 3 月 31 日

Released [Gemma 4](https://ai.google.dev/gemma/docs/core?hl=zh-cn) in four sizes: E2B, E4B, 31B, and 26B A4B.

发布 [Gemma 4](https://ai.google.dev/gemma/docs/core?hl=zh-cn)，有 E2B，E4B，31B，26B A4B 四个尺寸。

> **对一下：** 各代 Gemma 的链接指向哪里？
> 指向不一样。Gemma，Gemma 2，Gemma 3 分别链到 model_card，model_card_2，model_card_3，是各自的模型卡；Gemma 4 和 12B Unified 链到 /gemma/docs/core，和横幅的 「了解详情」 是同一个地址，整页找不到 model_card_4. Gemma 3n 又链到 /docs/3n. 想从这页点进 Gemma 4 的规格说明，路径和前几代不同。

January 15, 2026

2026 年 1 月 15 日

Released [TranslateGemma](https://www.kaggle.com/models/google/translategemma) in 4B, 12B, and 27B sizes.

发布 [TranslateGemma](https://www.kaggle.com/models/google/translategemma)，有 4B，12B，27B 三个尺寸。（链接去 Kaggle 的模型页，不在 ai.google.dev 站内。）

<!-- page 2 of 6 -->

## January 13, 2026（2026 年 1 月 13 日）

Released [MedGemma 1.5](https://developers.google.com/health-ai-developer-foundations/medgemma?hl=zh-cn) in a 4B size.

发布 [MedGemma 1.5](https://developers.google.com/health-ai-developer-foundations/medgemma?hl=zh-cn)，只有 4B 一个尺寸。（源文把这一条拆成一个带链接的标题，外加一行只剩网址的链接，这里合并成一句。）

## December 19, 2025（2025 年 12 月 19 日）

Released [Gemma Scope 2](https://ai.google.dev/gemma/docs/gemma_scope?hl=zh-cn), an interpretability suite for Gemma 3 models.

发布 [Gemma Scope 2](https://ai.google.dev/gemma/docs/gemma_scope?hl=zh-cn)，一套给 Gemma 3 模型用的可解释性工具。

## December 18, 2025（2025 年 12 月 18 日）

Released [FunctionGemma](https://ai.google.dev/gemma/docs/functiongemma?hl=zh-cn) in a 270M size.

发布 [FunctionGemma](https://ai.google.dev/gemma/docs/functiongemma?hl=zh-cn)，只有 270M 一个尺寸。

Released [T5Gemma v2](https://blog.google/technology/developers/t5gemma-2/?hl=zh-cn) in 270M-270M, 1B-1B, and 4B-4B sizes.

发布 [T5Gemma v2](https://blog.google/technology/developers/t5gemma-2/?hl=zh-cn)，有 270M-270M，1B-1B，4B-4B 三个尺寸。

> **问：** 「270M-270M」 这种两个数连在一起的写法是什么意思？
> 页上没解释。三档都是两个相等的数用连字符连着，别的条目没有这种格式。能对照的只有 T5Gemma 第一版（2025 年 7 月 9 日），可那一条只写 「多种参数规格」，一个数都没给，v1 和 v2 的尺寸没法逐档比。两版的链接也不在一处：v2 去 blog.google，v1 去 developers.googleblog.com/en/，后者是英文博客，网址里没有 hl=zh-cn。

## September 13, 2025（2025 年 9 月 13 日）

Released [VaultGemma](https://www.kaggle.com/models/google/vaultgemma) in a 1B size.

发布 [VaultGemma](https://www.kaggle.com/models/google/vaultgemma)，只有 1B 一个尺寸。（链接同样去 Kaggle.）

September 4, 2025

2025 年 9 月 4 日

Released [EmbeddingGemma](https://ai.google.dev/gemma/docs/embeddinggemma?hl=zh-cn) in a 308M size.

发布 [EmbeddingGemma](https://ai.google.dev/gemma/docs/embeddinggemma?hl=zh-cn)，只有 308M 一个尺寸。

## August 14, 2025（2025 年 8 月 14 日）

Released [Gemma 3](https://ai.google.dev/gemma/docs/core/model_card_3?hl=zh-cn) in a 270M size.

发布 [Gemma 3](https://ai.google.dev/gemma/docs/core/model_card_3?hl=zh-cn) 的 270M 尺寸。

> **看表：** 同一个名字在列表里出现在几个日期？
> 按页面原文整理如下，只收名字相同或只差版本后缀的条目：

| 名字 | 日期 | 页上写的尺寸 |
|---|---|---|
| Gemma | 2024-02-21 首次；2024-04-05 发布 1.1 | 2B，7B；1.1 未写 |
| Gemma 2 | 2024-06-27 首次；2024-07-31 | 9B, 27B; 2B |
| Gemma 3 | 2025-03-10; 2025-08-14 | 1B, 4B, 12B, 27B; 270M |
| Gemma 4 | 2026-03-31; 2026-04-16 (MTP); 2026-06-03 | E2B，E4B，31B，26B A4B；同前四个；12B Unified |
| MedGemma | 2025-05-20; 2025-07-09; 2026-01-13 (1.5) | 4B，27B；27B 多模态；4B |
| CodeGemma | 2024-04-09 首次；2024-05-03 (v1.1) | 都未写 |
| RecurrentGemma | 2024-04-09 首次；2024-06-11 | 未写；9B |
| PaliGemma 系 | 2024-05-14 首次；2024-12-05 (2); 2025-02-19 (2 mix) | 未写；3B, 10B, 28B; 3B, 10B, 28B |

> Gemma 3 的 270M 和 3 月那一批隔了五个月，链接却是同一张 model_card_3。按名字查日期会查出两三个答案，只按日期查名字又会漏掉后补的尺寸。引用时要写成 「日期 + 名字 + 尺寸」 三件一起。

<!-- page 3 of 6 -->

## July 9, 2025（2025 年 7 月 9 日）

Released [T5Gemma](https://developers.googleblog.com/en/t5gemma/) in multiple sizes.

发布 [T5Gemma](https://developers.googleblog.com/en/t5gemma/)，有多个尺寸（页上没列具体是哪些）。

Released [MedGemma](https://developers.google.com/health-ai-developer-foundations/medgemma?hl=zh-cn) as a 27B multimodal model.

发布 [MedGemma](https://developers.google.com/health-ai-developer-foundations/medgemma?hl=zh-cn) 的 27B 多模态模型。

## June 26, 2025（2025 年 6 月 26 日）

Released [Gemma 3n](https://ai.google.dev/gemma/docs/3n?hl=zh-cn) in two sizes: E2B and E4B.

发布 [Gemma 3n](https://ai.google.dev/gemma/docs/3n?hl=zh-cn)，有 E2B，E4B 两个尺寸。

> **对一下：** E2B，E4B 这两个标签在页上指的是同一个模型吗？
> 不是同一代。2025 年 6 月 26 日 Gemma 3n 发布 E2B 和 E4B，2026 年 3 月 31 日 Gemma 4 又有 E2B 和 E4B，4 月 16 日的 MTP 也点了这两个。同一组标签跨了两代，只说 「E4B」 分不清是 3n 还是 4，引用时必须带上代号。「E」 代表什么，两代的 E4B 规模是否相同，页上都没写。

## May 20, 2025（2025 年 5 月 20 日）

Released [MedGemma](https://developers.google.com/health-ai-developer-foundations/medgemma?hl=zh-cn) in 4B and 27B sizes.

发布 [MedGemma](https://developers.google.com/health-ai-developer-foundations/medgemma?hl=zh-cn)，有 4B，27B 两个尺寸。

> **确认：** MedGemma 一共有几个 27B?
> 按页面至少两个。5 月 20 日发布 4B 和 27B；7 月 9 日又单列一条 「27B 多模态模型」。假如 5 月那个 27B 本来就是多模态，7 月就没必要再写一条，所以两个 27B 多半不是同一个东西，不过页上也没说 5 月那个是纯文本。三条 MedGemma（第三条是 2026 年 1 月的 1.5）链到同一个 health-ai-developer-foundations/medgemma 页面，只看链接分不出是哪一次发布。

## March 10, 2025（2025 年 3 月 10 日）

Released [Gemma 3](https://ai.google.dev/gemma/docs/core/model_card_3?hl=zh-cn) in four sizes: 1B, 4B, 12B, and 27B.

发布 [Gemma 3](https://ai.google.dev/gemma/docs/core/model_card_3?hl=zh-cn)，有 1B，4B，12B，27B 四个尺寸。

Released [ShieldGemma 2](https://ai.google.dev/gemma/docs/shieldgemma?hl=zh-cn).

发布 [ShieldGemma 2](https://ai.google.dev/gemma/docs/shieldgemma?hl=zh-cn)。

> **停一下：** ShieldGemma 2 和 Gemma 3 同一天发布，能不能说它基于 Gemma 3?
> 不能从这页说。这一条只有名字，没写尺寸，没写用途，也没写基于哪一代。整页明说 「适用于 Gemma 3」 的只有 2025 年 12 月的 Gemma Scope 2。同一天上线只说明发布日期相同，不是血缘证据。同样，1 月 15 日 TranslateGemma 的 4B，12B，27B 正好和 Gemma 3 的三个尺寸同名，页上也没说两者有关。

## February 19, 2025（2025 年 2 月 19 日）

Released [PaliGemma 2 mix](https://ai.google.dev/gemma/docs/paligemma/model-card-2?hl=zh-cn) in 3B, 10B, and 28B sizes.

发布 [PaliGemma 2 mix](https://ai.google.dev/gemma/docs/paligemma/model-card-2?hl=zh-cn)，有 3B，10B，28B 三个尺寸。

## December 5, 2024（2024 年 12 月 5 日）

Released [PaliGemma 2](https://ai.google.dev/gemma/docs/paligemma?hl=zh-cn) in 3B, 10B, and 28B sizes.

发布 [PaliGemma 2](https://ai.google.dev/gemma/docs/paligemma?hl=zh-cn)，有 3B，10B，28B 三个尺寸。

<!-- page 4 of 6 -->

## October 16, 2024（2024 年 10 月 16 日）

Released the [Personal AI code assistant](https://ai.google.dev/gemma/docs/personal-code-assistant?hl=zh-cn) developer guide.

发布开发者指南 [个人 AI 编程助手](https://ai.google.dev/gemma/docs/personal-code-assistant?hl=zh-cn)。

## October 15, 2024（2024 年 10 月 15 日）

Released [Gemma-APS](https://ai.google.dev/gemma/docs/gemma-aps?hl=zh-cn) in 2B and 7B sizes.

发布 [Gemma-APS](https://ai.google.dev/gemma/docs/gemma-aps?hl=zh-cn)，有 2B，7B 两个尺寸。（APS 是什么的缩写，页上没写。）

## October 8, 2024（2024 年 10 月 8 日）

Released the [Business email assistant](https://ai.google.dev/gemma/docs/business-email-assistant?hl=zh-cn) developer guide.

发布开发者指南 [商务邮件助手](https://ai.google.dev/gemma/docs/business-email-assistant?hl=zh-cn)。

## October 3, 2024（2024 年 10 月 3 日）

Released [Gemma 2 JPN](https://www.kaggle.com/models/google/gemma-2-2b-jpn-it) in a 2B size.

发布 [Gemma 2 JPN](https://www.kaggle.com/models/google/gemma-2-2b-jpn-it)，只有 2B 一个尺寸。

> **核对：** Gemma 2 JPN 的 2B 是哪一个版本？
> 页面文字只写 「2B」。链接是 Kaggle 的 google/gemma-2-2b-jpn-it，里面的 2b 和 jpn 与文字对得上，末尾还多一截 「it」。Gemma 在 Kaggle 上常用 it 标指令调优版，但这一点页上没交代，中文条目也没提。这一条的信息有一部分只存在网址里，光抄文字会丢。

Released the [Spoken language tasks](https://ai.google.dev/gemma/docs/spoken-language/task-specific-tuning?hl=zh-cn) developer guide.

发布开发者指南 [口语任务](https://ai.google.dev/gemma/docs/spoken-language/task-specific-tuning?hl=zh-cn)。

> **再看：** 源文写成 「口 语任务」，这是什么，为什么夹在模型中间？
> 中间那个空格是抓取或机翻留下的错字，本来是 「口语任务」。链接路径是 spoken-language/task-specific-tuning，从路径看讲的是口语类任务的专项调优；条目末尾写着 「开发者指南」，它和 10 月 8 日的商务邮件助手，10 月 16 日的个人 AI 编程助手一样是教程，不是模型。2024 年 10 月这五条记录里有三条是指南，数 「发布了多少个模型」 时要剔掉。源文把这两个助手译成 「代码助理」 和 「电子邮件助理」，是机翻用词，这里改成常用说法。

## September 12, 2024（2024 年 9 月 12 日）

Released [DataGemma](https://ai.google.dev/gemma/docs/datagemma?hl=zh-cn) in a 2B size.

发布 [DataGemma](https://ai.google.dev/gemma/docs/datagemma?hl=zh-cn)，只有 2B 一个尺寸。

## July 31, 2024（2024 年 7 月 31 日）

Released [Gemma 2](https://ai.google.dev/gemma/docs/core/model_card_2?hl=zh-cn) in a 2B size.

发布 [Gemma 2](https://ai.google.dev/gemma/docs/core/model_card_2?hl=zh-cn) 的 2B 尺寸。

Initial release of [ShieldGemma](https://ai.google.dev/gemma/docs/shieldgemma?hl=zh-cn).

首次发布 [ShieldGemma](https://ai.google.dev/gemma/docs/shieldgemma?hl=zh-cn)。

Initial release of [Gemma Scope](https://ai.google.dev/gemma/docs/gemma_scope?hl=zh-cn).

首次发布 [Gemma Scope](https://ai.google.dev/gemma/docs/gemma_scope?hl=zh-cn)。

<!-- page 5 of 6 -->

## June 27, 2024（2024 年 6 月 27 日）

Initial release of [Gemma 2](https://ai.google.dev/gemma/docs/core/model_card_2?hl=zh-cn) in 9B and 27B sizes.

首次发布 [Gemma 2](https://ai.google.dev/gemma/docs/core/model_card_2?hl=zh-cn)，有 9B，27B 两个尺寸。

> **问：** 为什么有的条目写 「首次发布」，有的只写 「发布」？
> 页上没有说明。「首次发布」 一共七处：Gemma，CodeGemma，RecurrentGemma，PaliGemma，Gemma 2，ShieldGemma，Gemma Scope，全在 2024 年 7 月 31 日及以前。之后第一次出现的名字，从 2024 年 9 月的 DataGemma，10 月的 Gemma-APS，到 2026 年的 TranslateGemma，都只写 「发布」。所以不能靠 「首次」 两个字判断一个名字是不是新面孔，要自己往下翻，看列表后面还有没有同名条目。

June 11, 2024

2024 年 6 月 11 日

Released the 9B variant of [RecurrentGemma](https://ai.google.dev/gemma/docs/recurrentgemma?hl=zh-cn).

发布 [RecurrentGemma](https://ai.google.dev/gemma/docs/recurrentgemma?hl=zh-cn) 的 9B 版本。

May 14, 2024

2024 年 5 月 14 日

Initial release of [PaliGemma](https://ai.google.dev/gemma/docs/paligemma?hl=zh-cn).

首次发布 [PaliGemma](https://ai.google.dev/gemma/docs/paligemma?hl=zh-cn)。

May 3, 2024

2024 年 5 月 3 日

Released [CodeGemma](https://ai.google.dev/gemma/docs/codegemma?hl=zh-cn) v1.1.

发布 [CodeGemma](https://ai.google.dev/gemma/docs/codegemma?hl=zh-cn) v1.1。

April 9, 2024

2024 年 4 月 9 日

Initial release of [CodeGemma](https://ai.google.dev/gemma/docs/codegemma?hl=zh-cn).

首次发布 [CodeGemma](https://ai.google.dev/gemma/docs/codegemma?hl=zh-cn)。

Initial release of [RecurrentGemma](https://ai.google.dev/gemma/docs/recurrentgemma?hl=zh-cn).

首次发布 [RecurrentGemma](https://ai.google.dev/gemma/docs/recurrentgemma?hl=zh-cn)。

April 5, 2024

2024 年 4 月 5 日

Released [Gemma](https://ai.google.dev/gemma/docs/core/model_card?hl=zh-cn) 1.1.

发布 [Gemma](https://ai.google.dev/gemma/docs/core/model_card?hl=zh-cn) 1.1。

February 21, 2024

2024 年 2 月 21 日

Initial release of [Gemma](https://ai.google.dev/gemma/docs/core/model_card?hl=zh-cn) in 2B and 7B sizes.

首次发布 [Gemma](https://ai.google.dev/gemma/docs/core/model_card?hl=zh-cn)，有 2B，7B 两个尺寸。

<!-- page 6 of 6 -->

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies?hl=zh-cn). Java is a registered trademark of Oracle and/or its affiliates.

除非另有说明，本页内容按 [知识共享署名 4.0 许可](https://creativecommons.org/licenses/by/4.0/) 授权，代码示例按 [Apache 2.0 许可](https://www.apache.org/licenses/LICENSE-2.0) 授权。详见 [Google 开发者网站政策](https://developers.google.com/site-policies?hl=zh-cn)。Java 是 Oracle 和/或其关联公司的注册商标。

> **确认：** 这里的 CC BY 4.0 和 Apache 2.0 是 Gemma 模型的许可吗？
> 不是。原句管的是 「本页内容」 和 「代码示例」，也就是这篇文档网页本身。Gemma 各模型的权重按什么条款发布，这页一句没提，不能拿这一行回答 「Gemma 能不能商用」。

Last updated (UTC): 2026-07-03.

最后更新（UTC）：2026-07-03.

> **回看：** 这份列表新到哪一天？
> 页脚写最后更新 2026-07-03，列表最新一条是 2026 年 6 月 3 日的 12B Unified，中间一个月没有新条目。7 月 3 日那次改了什么，页上看不出，可能只是改了横幅或译文。7 月 3 日以后有没有新的发布，这份抓取看不到，抓取日期也没有留在页面上。
