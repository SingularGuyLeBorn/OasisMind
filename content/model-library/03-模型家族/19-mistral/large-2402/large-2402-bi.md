---
title: "Mistral Large · 对照译稿"
category: "模型库"
tags: ["Mistral", "对照译稿"]
published: true
excerpt: "Mistral Large 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
这是 Mistral AI 官网 Mistral Large 发布页 「Au Large」 的打印件, 共 9 页, 8 张图. 正文在第 1 到第 7 页, 第 7 页后半到第 9 页是站点页脚. 每页都有一块 cookie 横幅盖住正文, 转出的 Markdown 因此丢了很多字. 下面的英文按 PDF 文本层补全; 表格数字按页面上的表格图抄录, 被横幅挡住的格子留空, 不补. 本稿只用这页印出来的数, 不从 Mistral Large 后续版本搬参数.

<!-- page 1 of 9 -->

# Au Large

The page header reads **RESEARCH**, followed by the title "Au Large", the date **February 26, 2024** and the byline "By Mistral AI team".

页头印着 **RESEARCH**, 下面是标题 「Au Large」, 日期 **February 26, 2024**, 署名 「By Mistral AI team」.

> **想:** February 26, 2024 是发布日, 那每页页眉的 2026/9/25 13:49 又是什么?
> 按发布日读, 它紧挨着标题和署名. 页眉的 2026/9/25 是浏览器打印这页的时间, 第 8 页的 「Mistral AI © 2026」 也是抓页时的站点外壳, 和这篇公告不是同一个时间.

We are releasing Mistral Large, our latest and most advanced language model. Mistral Large is available through la Plateforme. We are also making it available through Azure, our first distribution partner.

我们发布 Mistral Large, 这是我们最新, 也是最强的语言模型. Mistral Large 已经可以通过 la Plateforme 使用. 我们同时把它放到 Azure 上, Azure 是我们的第一个分发伙伴.

## Mistral Large, our new flagship model

Mistral Large is our new cutting-edge text generation model. It reaches top-tier reasoning capabilities. It can be used for complex multilingual reasoning tasks, including text understanding, transformation, and code generation.

Mistral Large 是我们新的前沿文本生成模型, 推理能力达到第一梯队. 它可以做复杂的多语言推理任务, 包括文本理解, 文本转换和代码生成.

Mistral Large achieves strong results on commonly used benchmarks, making it the world's second-ranked model generally available through an API (next to GPT-4) [see below for details on benchmarks].

Mistral Large 在常用基准上成绩很好, 在所有通过 API 公开提供的模型里排世界第二, 仅次于 GPT-4 (基准细节见下文).

> **问:** 「second-ranked」 是按哪个分数排的?
> 这句话本身没说. 页面上能直接排出这个名次的只有 Figure 1 的 MMLU 柱状图: GPT-4 86.4%, Mistral Large 81.2%, Claude 2 78.5%. 在后面几张表的其他列上, 名次并不都是第二.

The rest of page 1 is a cookie consent banner certified by axeptio. It says the site uses cookies to measure the audience, nurture the relationship and send content and advertisement. It lists Google Analytics 4 and Hubspot, each with a switch, plus a "Toggle all" switch and Close, Accept all and Next buttons. The same banner repeats on every page below.

第 1 页剩下的是 axeptio 认证的 cookie 同意横幅. 横幅说网站用 cookie 统计访问量, 维系用户关系, 推送内容和广告. 它列出 Google Analytics 4 和 Hubspot 两项, 各带一个开关, 另有一个 「Toggle all」 总开关, 以及 Close, Accept all, Next 三个按钮. 后面每一页都重复这块横幅.

![cookie 横幅里 "Toggle all" 一行的开关图标, 不含模型信息](images/p01-google-analytics-4-helps-us-measure-our-audience.png)

<!-- page 2 of 9 -->

![Figure 1 柱状图: MMLU 上 GPT-4 86.4%, Mistral Large 81.2%, Claude 2 78.5%, Gemini Pro 71.8%, GPT-3.5 70.0%, LLaMA 2 70B 69.9%, 纵轴从 40% 起](images/p02-figure-1-comparison-of-gpt-4-mistral-large-pre-trained.png)

The bar chart reads, from left to right: GPT-4 86.4%, Large 81.2%, Claude 2 78.5%, Gemini Pro 71.8%, GPT-3.5 70.0%, LLaMA 2 70B 69.9%. The vertical axis is marked 40% at its bottom.

柱状图从左到右依次是: GPT-4 86.4%, Large 81.2%, Claude 2 78.5%, Gemini Pro 71.8%, GPT-3.5 70.0%, LLaMA 2 70B 69.9%. 纵轴底部标着 40%.

Figure 1: Comparison of GPT-4, Mistral Large (pre-trained), Claude 2, Gemini Pro 1.0, GPT 3.5 and LLaMA 2 70B on MMLU (Measuring massive multitask language understanding).

Figure 1: GPT-4, Mistral Large (预训练版), Claude 2, Gemini Pro 1.0, GPT 3.5 和 LLaMA 2 70B 在 MMLU (大规模多任务语言理解) 上的对比.

> **核对:** 图注写的是 「Mistral Large (pre-trained)」, 通过 API 卖的也是这个版本吗?
> 页面没说. 图注和第 3 页的 「performance of the pretrained models」 都指预训练版, 第 1 页 「second-ranked model generally available through an API」 说的却是 API 上的产品. 两者是不是同一份权重, 这页没交代.

> **看表:** 柱子高低看上去差很多, 实际差多少?
> 纵轴从 40% 起画. GPT-4 和 Large 的真实比值是 86.4 / 81.2, 约 1.06; 按柱子露在 40% 以上的部分算是 46.4 / 41.2, 约 1.13. 图上的高度差大约是真实差距的两倍.

Mistral Large comes with new capabilities and strengths:

Mistral Large 带来了这些新能力和长处:

- It is natively fluent in English, French, Spanish, German, and Italian, with a nuanced understanding of grammar and cultural context.
- Its 32K tokens context window allows precise information recall from large documents.
- Its precise instruction-following enables developers to design their moderation policies -- we used it to set up the system-level moderation of le Chat.
- It is natively capable of function calling. This, along with constrained output mode, implemented on la Plateforme, enables application development and tech stack modernisation at scale.

- 它原生流利掌握英语, 法语, 西班牙语, 德语和意大利语, 对语法和文化语境的理解很细.
- 32K token 的上下文窗口, 能从大篇文档里准确找回信息.
- 指令遵循精确, 开发者可以用它设计自己的审核策略. 我们就用它搭了 le Chat 的系统级审核.
- 原生支持 function calling. 配合 la Plateforme 上实现的约束输出模式, 可以大规模开发应用, 也可以改造现有技术栈.

> **拆开:** 「32K tokens context window allows precise information recall」, 召回准到什么程度?
> 这页只给了窗口长度 32K, 没有任何长文检索或召回的分数. 「precise」 是一句定性描述, 页面上找不到能核对它的数.

The lower half of page 2 is covered by the cookie banner; the text above is recovered from the PDF text layer.

第 2 页下半部同样被 cookie 横幅挡住, 上面的文字按 PDF 文本层补全.

![cookie 横幅里的开关图标, 不含模型信息](images/p02-precise-instrgoogle-analytics-4-helps-us-measure-our.png)

<!-- page 3 of 9 -->

## Partnering with Microsoft to provide our models on Azure

At Mistral, our mission is to make frontier AI ubiquitous. This is why we're announcing today that we're bringing our open and commercial models to Azure. Microsoft's trust in our model is a step forward in our journey! Our models are now available through:

Mistral 的使命是让前沿 AI 无处不在. 所以我们今天宣布, 把我们的开放模型和商业模型都带到 Azure 上. 微软对我们模型的信任, 是我们路上前进的一步! 我们的模型现在可以通过以下方式获取:

1. **La Plateforme.** Safely hosted on Mistral's infrastructure in Europe, this access point enables developers to create applications and services across our comprehensive range of models.
2. **Azure.** Mistral Large is available through Azure AI Studio and Azure Machine Learning, with as seamless a user experience as our APIs. Beta customers have used it with significant success.
3. **Self-deployment.** Our models can be deployed on your environment for the most sensitive use cases with access to our model weights; Read success stories on this kind of deployment, and contact our team for further details.

1. **La Plateforme.** 安全托管在 Mistral 位于欧洲的基础设施上. 开发者可以通过这个入口, 用我们全系列的模型搭应用和服务.
2. **Azure.** Mistral Large 可以通过 Azure AI Studio 和 Azure Machine Learning 使用, 体验和我们自己的 API 一样顺畅. Beta 客户用它取得了明显成效.
3. **Self-deployment.** 对最敏感的用途, 我们的模型可以部署在你自己的环境里, 并能拿到模型权重. 可以看看这类部署的成功案例, 详情请联系我们的团队.

> **确认:** 自部署能 「access to our model weights」, 是不是说 Mistral Large 权重公开了?
> 按这页不能这么读. 这里说的是面向敏感用途的自部署方案, 要联系团队. 第 6 页列出的 「Open-weight endpoints」 只有 open-mistral-7B 和 open-mixtral-8x7b, mistral-large-2402 列在另一类 「optimised model endpoints」 里.

## Mistral Large capacities

We compare Mistral Large's performance to the top-leading LLM models on commonly used benchmarks.

我们在常用基准上, 把 Mistral Large 和市面上领先的 LLM 做了对比.

### Reasoning and knowledge

Mistral Large shows powerful reasoning capabilities. In the following figure, we report the performance of the pretrained models on standard benchmarks.

Mistral Large 推理能力很强. 下图给出的是各预训练模型在标准基准上的成绩.

The cookie banner covers the middle of page 3. The table referred to as "the following figure" starts on page 4.

第 3 页中段被 cookie 横幅挡住. 文中说的 「下图」 从第 4 页开始.

<!-- page 4 of 9 -->

The page opens with the body of Figure 2. Its header row is not visible on any page; the column names below follow the benchmark order in the caption. Bold follows the original.

这一页开头是 Figure 2 的表身, 表头行在哪一页都看不到. 下面的列名按图注里基准出现的顺序填写. 加粗照原表.

| | MMLU | HellaSwag (10-shot) | WinoGrande (5-shot) | Arc Challenge (5-shot) | Arc Challenge (25-shot) | TriviaQA (5-shot) | TruthfulQA |
|---|---|---|---|---|---|---|---|
| Mistral Large | 81.2% | 89.2% | 86.7% | 94.2% | 94.0% | 82.7% | 50.5% |
| LLaMA 2 70B | 69.9% | 87.1% | 83.2% | 86.0% | 85.1% | 77.6% | 44.7% |
| GPT 3.5 | 70.0% | 85.5% | 81.6% | 85.2% | 85.2% | - | - |
| GPT 4 | 86.4% | 95.3% | 87.5% | - | 96.3% | - | - |
| Claude 2 | 78.5% | - | - | 91.0% | - | 87.5% | - |
| Gemini Pro 1.0 | 71.8% | 84.7% | - | - | - | - | - |

> **回看:** 表头看不到, 凭什么说第一列是 MMLU?
> 第一列六个值 86.4, 81.2, 78.5, 71.8, 70.0, 69.9 和 Figure 1 的 MMLU 柱子一个不差, 图注也把 MMLU 列在第一个. 后六列是按图注顺序对位, 这一步是推断, 页面上看不到列名.

> **停一下:** Arc Challenge 5-shot 为什么比 25-shot 还高?
> Mistral Large 是 94.2% 对 94.0%, LLaMA 2 70B 是 86.0% 对 85.1%, GPT 3.5 两列都是 85.2%. 示例多了分数反而持平或略降, 页面没解释. 还要注意 Mistral Large 在 5-shot 列加粗, 是因为 GPT 4 那格是 「-」; 到了 25-shot 列, GPT 4 的 96.3% 比它高.

> **再看:** 和 Claude 2 比, Mistral Large 算赢还是输?
> 两者都有分数的列只有 MMLU, Arc Challenge 5-shot, TriviaQA 三列. Mistral Large 赢两列 (81.2 对 78.5, 94.2 对 91.0), 输 TriviaQA (82.7 对 87.5). 三列平均约 86.0 对 85.7, 差距只有 0.4 个点左右.

Figure 2: Performance on widespread common sense, reasoning and knowledge benchmarks of the top-leading LLM models on the market: MMLU (Measuring massive multitask language in understanding), HellaSwag (10-shot), Wino Grande (5-shot), Arc Challenge (5-shot), Arc Challenge (25-shot), TriviaQA (5-shot) and TruthfulQA.

Figure 2: 市面上领先的 LLM 在常见的常识, 推理和知识基准上的成绩: MMLU (大规模多任务语言理解), HellaSwag (10-shot), Wino Grande (5-shot), Arc Challenge (5-shot), Arc Challenge (25-shot), TriviaQA (5-shot) 和 TruthfulQA.

### Multi-lingual capacities

Mistral Large has native multi-lingual capacities. It strongly outperforms LLaMA 2 70B on HellaSwag, Arc Challenge and MMLU benchmarks in French, German, Spanish and Italian.

Mistral Large 原生具备多语言能力. 在法语, 德语, 西班牙语和意大利语的 HellaSwag, Arc Challenge 和 MMLU 上, 它大幅领先 LLaMA 2 70B.

Figure 3 is half covered by the cookie banner. Only the Spanish and Italian groups (marked by flags) are readable, and the Spanish Arc-C column shows only its "%" signs. The row labels are hidden except for their first letters, M, M and L. Bold follows the original: the whole first row is bold.

Figure 3 被 cookie 横幅挡住一半. 能读的只有西班牙语和意大利语两组 (用国旗标出), 西班牙语的 Arc-C 列也只露出 「%」 号. 行名被挡, 只露出首字母 M, M, L. 加粗照原表, 第一行全部加粗.

| | ES Arc-C | ES HellaS | ES MMLU | IT Arc-C | IT HellaS | IT MMLU |
|---|---|---|---|---|---|---|
| row 1 (M) | | 81.9% | 79.7% | 60.3% | 77.8% | 78.9% |
| row 2 (M) | | 76.3% | 67.5% | 51.1% | 72.9% | 65.9% |
| row 3 (L) | | 74.5% | 66.0% | 49.4% | 70.9% | 65.1% |

> **对一下:** 这三行分别是谁?
> 图注的顺序是 Mistral Large, Mixtral 8x7B, LLaMA 2 70B, 和露出的首字母 M, M, L 对得上, 第一行全加粗也符合 Mistral Large 领先的说法. 所以按 Mistral Large, Mixtral 8x7B, LLaMA 2 70B 读. 这是按顺序和首字母推的, 行名本身看不到.

> **想:** 意大利语 Arc-C 只有 60.3%, 英语 Arc Challenge 却是 94.2%, 差了三十多个点?
> 差 33.9 个点, LLaMA 2 70B 一侧是 49.4% 对 86.0%. 同一基准的 HellaSwag 和 MMLU, 换成西语意语只降几个到十几个点, 唯独 Arc-C 断崖. Figure 3 没写 shot 数, 也没说用的是哪个版本的 Arc 数据, 这页定不了是语言差距还是设定不同.

Figure 3: Comparison of Mistral Large, Mixtral 8x7B and LLaMA 2 70B on HellaSwag, Arc Challenge and MMLU in French, German, Spanish and Italian.

Figure 3: Mistral Large, Mixtral 8x7B 和 LLaMA 2 70B 在法语, 德语, 西班牙语和意大利语的 HellaSwag, Arc Challenge 和 MMLU 上的对比.

<!-- page 5 of 9 -->

### Maths & Coding

Mistral Large shows top performance in coding and math tasks. In the table below, we report the performance across a suite of popular benchmarks to evaluate the coding and math performance for some of the top-leading LLM models.

Mistral Large 在代码和数学任务上表现顶尖. 下表列出了几个领先 LLM 在一组常用代码和数学基准上的成绩.

![Figure 4 代码与数学表: 前三行 Mistral Large, LLaMA 2 70B, GPT 3.5 完整, 后三行的行名和前两列被 cookie 横幅挡住](images/p05-weight-offering-and-our-flagship-model.png)

The table groups HumanEval and MBPP under Coding, and Math maj@4, GSM8K maj@8 (8-shot) and GSM8K maj@1 (5-shot) under Math. The first column header is cut to "HumanE". The labels and the first three columns of rows 4 to 6 are hidden, except that row 6 shows "2.6%" in the Math maj@4 column with its first digit covered. Bold follows the original.

表里 HumanEval 和 MBPP 归在 Coding 下, Math maj@4, GSM8K maj@8 (8-shot), GSM8K maj@1 (5-shot) 归在 Math 下. 第一列表头被截成 「HumanE」. 第 4 到第 6 行的行名和前三列被挡住, 只有第 6 行在 Math maj@4 列露出 「2.6%」, 前一位数字被盖住. 加粗照原表.

| | HumanEval | MBPP | Math maj@4 | GSM8K maj@8 (8-shot) | GSM8K maj@1 (5-shot) |
|---|---|---|---|---|---|
| Mistral Large | 45.1% | 73.1% | 45.0% | 91.21% | 81.0% |
| LLaMA 2 70B | 29.3% | 49.8% | 13.8% | 69.6% | 53.6% |
| GPT 3.5 | 48.1% | - | 34.1% | - | 57.1% |
| row 4 (label hidden) | | | - | - | 92.0% |
| row 5 (label hidden) | | | - | - | - |
| row 6 (label hidden) | | | ?2.6% | 86.5% | - |

> **问:** 被挡住的三行里, 谁的 HumanEval 最高?
> 看不到. 但 Mistral Large 的 45.1% 和 GPT 3.5 的 48.1% 都没加粗, 所以 HumanEval 列的最高分一定在被挡住的三行里, 而且高于 48.1%. GSM8K maj@1 的最高分也不是 Mistral Large, 是第 4 行的 92.0%.

> **核对:** GSM8K maj@8 为什么写成 91.21%?
> 全表其他格都是一位小数, 只有这一格两位. 页面没解释, 照抄. 拿它和其他格比时按 91.2 看就行.

> **看表:** maj@8 比 maj@1 高 10 个点, 这 10 个点全是投票带来的吗?
> 不能这么算. Mistral Large 是 91.21% 对 81.0%, 差 10.21 个点; LLaMA 2 70B 是 69.6% 对 53.6%, 差 16.0 个点. 但两列的 shot 数也不同, 一个 8-shot, 一个 5-shot, 投票和示例数的影响在这张表里拆不开.

Figure 4: Performance on popular coding and math benchmarks of the leading LLM models on the market: HumanEval pass@1, MBPP pass@1, Math maj@4, GSM8K maj@8 (8-shot) and GSM8K maj@1 (5 shot).

Figure 4: 市面上领先的 LLM 在常用代码和数学基准上的成绩: HumanEval pass@1, MBPP pass@1, Math maj@4, GSM8K maj@8 (8-shot) 和 GSM8K maj@1 (5-shot).

## A new Mistral Small, optimised for low latency workloads

Alongside Mistral Large, we're releasing a new optimised model, Mistral Small, optimised for latency and cost. Mistral Small outperforms Mixtral 8x7B and has lower latency, which makes it a refined intermediary solution between our open-weight offering and our flagship model.

和 Mistral Large 一起, 我们还发布了一个新的优化模型 Mistral Small, 专门针对延迟和成本优化. Mistral Small 成绩超过 Mixtral 8x7B, 延迟也更低, 所以它是介于我们开放权重产品和旗舰模型之间的一个精巧的中间方案.

> **拆开:** Mistral Small 「outperforms Mixtral 8x7B」, 超过多少, 延迟低多少?
> 这页一个数都没给. Mistral Small 不在 Figure 1 到 Figure 4 的任何一张表里, 延迟也没有毫秒数或倍数.

<!-- page 6 of 9 -->

Mistral Small benefits from the same innovation as Mistral Large regarding RAG-enablement and function calling.

在 RAG 支持和 function calling 上, Mistral Small 和 Mistral Large 用的是同样的新做法.

We're simplifying our endpoint offering to provide the following:

- Open-weight endpoints with competitive pricing. This comprises open-mistral-7B and open-mixtral-8x7b.
- New optimised model endpoints, mistral-small-2402 and mistral-large-2402. We're maintaining mistral-medium, which we are not updating today.

我们把 endpoint 产品线简化成下面这样:

- 价格有竞争力的开放权重 endpoint, 包括 open-mistral-7B 和 open-mixtral-8x7b.
- 新的优化模型 endpoint: mistral-small-2402 和 mistral-large-2402. mistral-medium 继续保留, 今天不做更新.

> **确认:** mistral-large-2402 里的 「2402」 指什么?
> 页面没解释这个后缀. 它和发布日 February 26, 2024 的年月对得上, 读成 2024 年 2 月是按日期推的. 这个名字就是本页 Mistral Large 在 API 上的 endpoint 名.

Our benchmarks give a comprehensive view of performance/cost tradeoffs.

我们的基准页全面展示了性能和成本之间的取舍.

Beyond the new model offering, we're allowing organisation management multi-currency pricing and have updated service tiers on la Plateforme. We have also made a lot of progress in reducing the latency of all our endpoints.

除了新模型, 我们还在 la Plateforme 上开放了组织管理和多币种计价, 并更新了服务档位. 所有 endpoint 的延迟我们也降了不少.

> **回看:** 「performance/cost tradeoffs」 和 「reducing the latency of all our endpoints」, 这页有成本或延迟的数吗?
> 没有. 成本那句指向一个外部基准页链接, 延迟那句只有 「a lot of progress」. 全文没印任何价格, 也没印任何延迟数字.

## JSON format and function calling

JSON format mode forces the language model output to be valid JSON. This functionality enables developers to interact with our models more naturally to extract information in a structured format that can be easily used in the remainder of their pipelines.

JSON 格式模式强制模型输出合法的 JSON. 有了它, 开发者和模型交互更自然, 能把信息抽成结构化格式, 直接喂给后续流水线.

Function calling lets developers interface Mistral endpoints with a set of their own tools, enabling more complex interactions with internal code, APIs or databases. You will learn more in our function calling guide.

Function calling 让开发者把 Mistral 的 endpoint 接到自己的一套工具上, 和内部代码, API 或数据库做更复杂的交互. 详见我们的 function calling 指南.

Function calling and JSON format are only available on mistral-small and mistral-large. We will be adding formatting to all endpoints shortly, as well as enabling more fine-grained format definitions.

目前只有 mistral-small 和 mistral-large 支持 function calling 和 JSON 格式. 我们很快会给所有 endpoint 加上格式化输出, 也会支持更细粒度的格式定义.

<!-- page 7 of 9 -->

## Try Mistral Large and Mistral Small today

Mistral Large is available on la Plateforme and Azure as of today. Mistral Large is also exposed on our beta assistant demonstrator, le Chat. As always, we're eager to have your feedback!

Mistral Large 从今天起在 la Plateforme 和 Azure 上可用, 也上了我们的 beta 版助手演示产品 le Chat. 和往常一样, 期待你的反馈!

The page then turns into the site footer. The Products column lists Vibe, Vibe Code, Studio and Forge; then Compute and Pricing; under Solutions: Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities; under Why Mistral: About us and Careers.

之后进入站点页脚. Products 一栏列着 Vibe, Vibe Code, Studio, Forge; 接着是 Compute 和 Pricing; Solutions 下有 Delivery methodology, Model customization, Coding, Document intelligence, Speech, 以及面向金融, 公共机构, 制造业, 能源与公用事业的四个行业页; Why Mistral 下有 About us 和 Careers.

> **停一下:** 页脚里的 Vibe, Studio, Forge 是和 Mistral Large 一起发布的吗?
> 不是这么读. 页脚是 2026 年打印这页时的站点导航, 正文从头到尾没提这些名字. 本页正文里和 Mistral Large 同时出现的产品只有 la Plateforme, Azure, le Chat 和 Mistral Small.

<!-- page 8 of 9 -->

![第 8 页整页截图: 站点页脚的 Our models, Brand, Company 各项链接, 社交图标, 应用商店标识和语言切换, 左半被 cookie 横幅挡住](images/p08-2026-9-25-13-49.png)

Page 8 continues the footer: Partners, Our customers, Our models, Brand; under Company: Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice. Below are social icons, "Get Mistral Vibe" with App Store and Google Play badges, "Mistral AI © 2026" and a language switch set to English.

第 8 页接着是页脚: Partners, Our customers, Our models, Brand; Company 下有 Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice. 再往下是社交图标, 「Get Mistral Vibe」 和 App Store, Google Play 下载标识, 「Mistral AI © 2026」, 以及停在 English 的语言切换.

<!-- page 9 of 9 -->

Page 9 only shows the "Get in touch" header bar and the cookie banner once more. Its three images are interface pieces from the banner.

第 9 页只剩顶部的 「Get in touch」 栏和又一次出现的 cookie 横幅. 这一页的三张图都是横幅里的界面零件.

![cookie 横幅里的一个空白勾选框图标, 不含模型信息](images/p09-image.png)

![cookie 横幅里 "Toggle all" 一行的开关图标, 不含模型信息](images/p09-2026-9-25-13-49.png)

![cookie 横幅里的另一个空白勾选框图标, 不含模型信息](images/p09-close.png)
