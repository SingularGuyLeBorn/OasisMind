---
title: "Mistral Medium 3 · 对照译稿"
category: "模型库"
tags: ["Mistral", "对照译稿"]
published: true
excerpt: "Mistral Medium 3 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
这是 Mistral AI 官网的 Mistral Medium 3 发布页，标题 「Medium is the new large.」，共 8 页，10 张图。正文在第 1 到第 6 页，第 7, 8 页是站点页脚。每一页都叠着一个 cookie 横幅，转出的 Markdown 丢了大半正文，下面的英文按 PDF 文本层补全。第 4 页的评测表和第 5 页的两张人评图被横幅挡住一部分，数字按 PDF 里嵌着的原图读；原图上每个数都印了出来，不需要读柱高。转出的 Markdown 把 「RULER 128K」 一行错认成 「RULER 428K」，数字也错成 99.2%，96.7%，98.0%，以原图为准。

<!-- page 1 of 8 -->

# Medium is the new large.

The page header reads **RESEARCH**, followed by the title "Medium is the new large.", the date **May 7, 2025** and the byline "By Mistral AI".

页头印着 **RESEARCH**，下面是标题 「Medium is the new large.」，日期 **May 7, 2025**，署名 「By Mistral AI」。

A hero image sits below the byline. Only its right part shows on the page: blue pixel blocks on a grey grid; the pixel-art centre of the picture is hidden behind the cookie banner.

署名下面是一张题图。页面上只露出右侧一截，灰色网格上堆着蓝色像素块，画面中间的像素画被 cookie 横幅挡住。

![题图右侧局部，灰色网格和蓝色像素块，左边被 cookie 横幅挡住](images/p01-ontier-for-both-open-models-s-as-well-as-enterprise.png)

At Mistral AI, we are continuously pushing the frontier for both open models (Mistral Small, Mistral Large, Pixtral, many others) as well as enterprise models (Mistral OCR, Mistral Saba, Ministral 3B / 8B, and more). All the way from Mistral 7B, our models have consistently demonstrated performance of significantly higher-weight and more expensive models. And today, we are excited to announce Mistral Medium 3, pushing efficiency and usability of language models even further.

在 Mistral AI，我们一直在推前沿，既有开放模型（Mistral Small，Mistral Large，Pixtral 等），也有企业模型（Mistral OCR，Mistral Saba，Ministral 3B / 8B 等）。从 Mistral 7B 开始，我们的模型一再做到参数大得多，价格贵得多的模型才有的性能。今天我们发布 Mistral Medium 3，把语言模型的效率和易用性再往前推一步。

The last clause, from "announce Mistral Medium 3", is printed at the top of page 2.

最后半句 「announce Mistral Medium 3」 起印在第 2 页开头。

> **想：** 「higher-weight」 说的是多重，Medium 3 自己有多少参数？
> 按上下文 「higher-weight」 指参数更多的模型。可整页没有给 Medium 3 的参数量，「Medium」 到底多大，只能从第 3 页 「四张 GPU 起」 这类侧面信息去猜，页面本身不交代。

The rest of page 1 is a cookie consent banner certified by axeptio. It says the site uses cookies to measure the audience, nurture the relationship and send content and advertisement. It lists Google Analytics 4 and Hubspot, with Close, Accept all and Next buttons. The same banner repeats on every page below.

第 1 页剩下的是 axeptio 认证的 cookie 同意横幅。横幅说网站用 cookie 统计访问量，维系用户关系，推送内容和广告。它列出 Google Analytics 4 和 Hubspot 两项，带 Close，Accept all，Next 三个按钮。后面每一页都重复这个横幅，下文不再逐页说明。

<!-- page 2 of 8 -->

## Highlights.

1. Mistral Medium 3 introduces a new class of models that balances
   - SOTA performance
   - 8X lower cost
   - simpler deployability to accelerate enterprise usage
3. The model leads in professional use cases such as coding and multimodal understanding
4. The model delivers a range of enterprise capabilities including:
   - Hybrid or on-premises / in-VPC deployment
   - Custom post-training
   - Integration into enterprise tools and systems

1. Mistral Medium 3 开了一类新模型，同时兼顾
   - SOTA 性能
   - 成本低 8 倍
   - 部署更简单，加快企业落地
3. 模型在代码，多模态理解这类专业场景里领先
4. 模型提供一系列企业能力，包括：
   - 混合部署，或本地 / VPC 内部署
   - 定制后训练
   - 接入企业工具和系统

> **问：** 列表为什么从 1 直接跳到 3?
> 页面印的就是 1, 3, 4，PDF 文本层也是这样，不是被横幅挡住。缺的第 2 条写什么，本页找不到。

> **核对：** 「8X lower cost」 是和谁比，能复算吗？
> 这一条没写比较对象。本页只印了 Medium 3 自己的价格，没印任何对手的价格，8 倍复算不了。

## The perfect balance.

Mistral Medium 3 delivers frontier performance while being an order of magnitude less expensive. For instance, the model performs at or above 90% of Claude Sonnet 3.7 on benchmarks across the board at a significantly lower cost ($0.4 input / $2 output per M token).

Mistral Medium 3 做到前沿性能，价格却低一个数量级。比如，它在各项基准上都达到 Claude Sonnet 3.7 的 90% 或以上，成本低得多（输入每百万 token $0.4，输出每百万 token $2）。

> **看表：** 「at or above 90% of Claude Sonnet 3.7 ... across the board」 在第 4 页的表里全都成立吗？
> 14 行里 12 行成立。LiveCodeBench 30.3% 对 36.0%，约 84.2%；GPQA Diamond 57.1% 对 69.7%，约 81.9%，这两行低于 90%。

> **拆开：** 两个单价合成一个数大概多少？
> 页面只给了输入 $0.4，输出 $2 两个单价，输出是输入的 5 倍。假设输入输出 token 按 3:1 混合，约 $0.8 每百万 token；3:1 是我假设的比例，页面没有。

On performance, Mistral Medium 3 also surpasses leading open models such as Llama 4 Maverick and enterprise models such as Cohere Command A. On pricing, the model beats cost leaders such as DeepSeek v3, both in API and self-deployed systems.

性能上，Mistral Medium 3 还超过了 Llama 4 Maverick 这样的领先开放模型，以及 Cohere Command A 这样的企业模型。价格上，不论走 API 还是自部署，它都比 DeepSeek v3 这类低价标杆更便宜。

> **确认：** 这里的 DeepSeek v3 和第 4, 5 页的 DeepSeek 3.1 是同一个模型吗？
> 本页没交代。价格比较写 「DeepSeek v3」，评测表和人评图都写 「DeepSeek 3.1」。页面既没印 DeepSeek 的价格，也没印自部署的成本算法，「beats cost leaders」 这句没有数字可核。

<!-- page 3 of 8 -->

Additionally, Mistral Medium 3 can also be deployed on any cloud, including self-hosted environments of four GPUs and above.

另外，Mistral Medium 3 能部署在任何云上，也能自托管，四张 GPU 起。

> **回看：** 「four GPUs and above」 是什么卡，什么精度？
> 都没写。页面也没给参数量，所以没法从四张卡反推模型大小，也没法反过来核对四张卡够不够。

## Top-tier performance.

Mistral Medium 3 is designed to be frontier-class, particularly in categories of professional use. In the evaluations below, we use numbers reported previously by other providers wherever available, otherwise we use our own evaluation harness. Performance accuracy on all benchmarks were obtained through the same internal evaluation pipeline. Mistral Medium 3 particular stands out in coding and STEM tasks where it comes close to its very large and much slower competitors.

Mistral Medium 3 按前沿级来设计，尤其是专业用途这几类。下面的评测里，凡是其他厂商报过的数就直接用，没有的才用我们自己的评测框架。所有基准的准确率都出自同一条内部评测流程。Mistral Medium 3 在代码和 STEM 任务上尤其突出，接近那些大得多，慢得多的对手。

> **停一下：** 前一句说 「有现成的就用别家报的数」，后一句说 「所有基准都走同一条内部流程」，两句能同时成立吗？
> 字面上互相矛盾。第 4 页表下的星号注只留了后一句，表里哪些格子是抄来的，哪些是自测的，没有任何标记。「much slower」 也没给速度数字。

The rest of page 3 is the cookie banner. The images directory keeps three small crops from it: two empty checkboxes and the Toggle all switch.

第 3 页其余部分是 cookie 横幅。images 目录里从横幅上截了三个小图：两个空复选框，一个 Toggle all 开关。

![cookie 横幅里 Google Analytics 4 一项的空复选框，不含模型信息](images/p03-image.png)

![cookie 横幅里 Hubspot 一项的空复选框，不含模型信息](images/p03-image-2.png)

![cookie 横幅里 Toggle all 的开关，处于关闭状态，不含模型信息](images/p03-ad.png)

<!-- page 4 of 8 -->

Page 4 shows a benchmark table. On the page, the table is cut at the top, so the header row and the CODING label are missing, and the banner covers the lower-left part, including the row names of the multimodal block. The embedded image in the PDF has the full table, transcribed below. The Mistral Medium 3 column is highlighted in orange. The images directory has no crop of this table.

第 4 页是一张评测表。页面上表的顶端被切掉，看不到表头和 CODING 标签，左下角又被横幅盖住，多模态几行的行名也看不见。PDF 里嵌着的原图是完整的，按原图转录如下。Mistral Medium 3 一列底色标成橙色。images 目录里没有这张表的截取。

| Benchmark | Mistral Medium 3 | Llama 4 Maverick | GPT-4o | Claude Sonnet 3.7 | Command-A | DeepSeek 3.1 |
|---|---|---|---|---|---|---|
| **CODING** | | | | | | |
| HumanEval 0-shot | 92.1% | 85.4% | 91.5% | 92.1% | 82.9% | 93.3% |
| LiveCodeBench (v6) 0-shot | 30.3% | 28.7% | 31.4% | 36.0% | 26.3% | 42.9% |
| MultiPL-E average 0-shot | 81.4% | 76.4% | 79.8% | 83.4% | 73.1% | 84.9% |
| **INSTRUCTION FOLLOWING** | | | | | | |
| ArenaHard 0-shot | 97.1% | 91.8% | 95.4% | 93.2% | 95.1% | 97.3% |
| IfEval 0-shot | 89.4% | 88.9% | 87.2% | 91.8% | 89.7% | 89.1% |
| **MATH** | | | | | | |
| Math500 Instruct 0-shot | 91.0% | 90.0% | 76.4% | 83.0% | 82.0% | 93.8% |
| **KNOWLEDGE** | | | | | | |
| GPQA Diamond 5-shot CoT | 57.1% | 61.1% | 52.5% | 69.7% | 46.5% | 61.1% |
| MMLU Pro 5-shot CoT | 77.2% | 80.4% | 75.8% | 80.0% | 68.9% | 81.1% |
| **LONG CONTEXT** | | | | | | |
| RULER 32K | 96.0% | 94.8% | 96.0% | 95.7% | 95.6% | 95.8% |
| RULER 128K | 90.2% | 86.7% | 88.9% | 93.8% | 91.2% | 91.9% |
| **MULTIMODAL** | | | | | | |
| MMMU 0-shot | 66.1% | 71.8% | 68.7% | 71.3% | No multimodal support | No multimodal support |
| DocVQA 0-shot | 95.3% | 94.1% | 85.9% | 84.3% | No multimodal support | No multimodal support |
| AI2D 0-shot | 93.7% | 84.4% | 93.3% | 78.8% | No multimodal support | No multimodal support |
| ChartQA 0-shot | 82.6% | 90.4% | 86.0% | 76.3% | No multimodal support | No multimodal support |

In the original, the last two columns of the multimodal block are merged into one cell reading "No multimodal support".

原图里多模态四行的最后两列合成一格，写着 「No multimodal support」。

> **再看：** 多模态比了几家？
> 四家。Command-A 和 DeepSeek 3.1 标 「No multimodal support」，所以多模态四行只有 Medium 3，Llama 4 Maverick，GPT-4o，Claude Sonnet 3.7 的数。表里也没有 Mistral 自家上一代模型。

> **对一下：** 「surpasses ... Llama 4 Maverick」 在 14 行里赢几行？
> 10 行。GPQA Diamond，MMLU Pro，MMMU，ChartQA 四行是 Llama 4 Maverick 更高，差得最多的是 ChartQA，82.6% 对 90.4%，7.8 个点。对 Command-A 的 10 行里，IfEval 和 RULER 128K 两行是 Command-A 更高。

> **想：** Highlights 说代码领先，表里三行代码排第几？
> HumanEval 第 2，和 Claude Sonnet 3.7 同为 92.1%；MultiPL-E 第 3；LiveCodeBench 第 4。三行的最高分都是 DeepSeek 3.1，LiveCodeBench 上 42.9% 比 Medium 3 高 12.6 个点。

> **问：** RULER 从 32K 到 128K，Medium 3 掉了多少？
> 从 96.0% 到 90.2%，掉 5.8 个点。Claude Sonnet 3.7 只掉 1.9 个点。32K 时 Medium 3 和 GPT-4o 并列第一，128K 时排第 4。页面全篇没写上下文窗口有多长。

\*Performance accuracy on all benchmarks were obtained through the same internal evaluation pipeline.

\*所有基准的准确率都出自同一条内部评测流程。

## Human Evals

In addition to academic benchmarks we report third-party human evaluations that are more representative of real-world use cases. Mistral Medium 3 continues to shine in the coding domain and delivers much better performance, across the board, than some of its much larger competitors.

除了学术基准，我们还报告第三方做的人工评测，这更能代表真实使用场景。Mistral Medium 3 在代码领域继续亮眼，全面好于一些大得多的对手。

> **核对：** 「third-party」 是哪家，多少评审，多少题？
> 都没写。下一页两张图只有胜率，没有样本量，没有评审人数，也没有平局的处理方式。

<!-- page 5 of 8 -->

The first chart is titled "Mistral Wins vs Competitor Wins for Coding". It is a stacked bar chart with Ratio on the y-axis (0 to 100) and one bar per competitor on the x-axis. The orange part is mistral_wins, the red part other_model_wins. On the page, the site header covers the title and the top of the y-axis.

第一张图标题是 「Mistral Wins vs Competitor Wins for Coding」。这是一张堆叠柱状图，纵轴 Ratio（0 到 100），横轴每个对手一根柱。橙色是 mistral_wins，红色是 other_model_wins。页面上图的标题和纵轴顶端被站点顶栏盖住。

![代码人评堆叠柱状图，Medium 3 对五个对手的胜负比例，标题被站点顶栏遮住](images/p05-here-are-our-cookies.png)

| competitor | mistral_wins | other_model_wins |
|---|---|---|
| Claude Sonnet 3.7 | 40.00 | 60.00 |
| DeepSeek 3.1 | 37.50 | 62.50 |
| GPT-4o | 50.00 | 50.00 |
| Command-A | 69.23 | 30.77 |
| Llama 4 Maverick | 81.82 | 18.18 |

> **看表：** 代码人评里，Medium 3 对谁是输的？
> 对 Claude Sonnet 3.7 (40.00) 和 DeepSeek 3.1 (37.50) 都不到一半，对 GPT-4o 50.00 打平。正文 「much better ... than some of its much larger competitors」 里的 「some」，按这张图只能是 Command-A 和 Llama 4 Maverick。

> **拆开：** 81.82 / 18.18 背后大概多少道题？
> 页面没写。两位小数能对上的最小分母：81.82 是 9/11, 69.23 是 9/13, 37.50 是 3/8, 40.00 是 2/5（实际题数可以是这些分母的倍数）。如果真是最小分母，样本只有十来道。

The second chart is titled "Mistral Wins Vs Llama 4 Maverick". It is a horizontal stacked bar chart with domain on the y-axis and "Mistral Win Rate" (0 to 100) on the x-axis. On the page, the banner covers its left half, including the domain names and the orange segments. The values below are read from the embedded image.

第二张图标题是 「Mistral Wins Vs Llama 4 Maverick」。这是一张横向堆叠柱状图，纵轴 domain，横轴 「Mistral Win Rate」（0 到 100）。页面上它的左半被横幅盖住，领域名和橙色段都看不见，下面的数按嵌入的原图读。

![分领域人评横向柱状图，Medium 3 对 Llama 4 Maverick，左半被 cookie 横幅挡住，只露出红色段](images/p05-b.png)

| domain | Mistral wins | Llama 4 Maverick wins |
|---|---|---|
| Coding | 81.82 | 18.18 |
| Multimodal | 53.85 | 46.15 |
| English | 66.67 | 33.33 |
| French | 71.43 | 28.57 |
| Spanish | 73.33 | 26.67 |
| German | 62.50 | 37.50 |
| Arabic | 64.71 | 35.29 |

> **确认：** 两张图里 Coding 对 Llama 4 Maverick 的数一样吗？
> 一样，都是 81.82 / 18.18。每根柱两段加起来都是 100，平局没有单列，是剔掉了还是本来没有，页面没说。

<!-- page 6 of 8 -->

## Built for enterprise use cases.

Mistral Medium 3 stands out from other SOTA models in its ability to adapt to enterprise contexts. In a world where organizations are forced to choose between fine-tuning over API or self-deploying and customizing model behaviour from scratch, Mistral Medium 3 offers a path to comprehensively integrate intelligence into enterprise systems. With the help of Mistral's applied AI solutions, the model can be continuously pretrained, fully fine tuned, and blended into enterprise knowledge bases, making it a high-fidelity solution for domain-specific training, continuous learning, and adaptive workflows. Beta customers across financial services, energy, and healthcare are using the model to enrich customer service with deep context, personalize business processes, and analyze complex datasets.

和其他 SOTA 模型比，Mistral Medium 3 的长处在于能适配企业环境。很多机构只能二选一：要么通过 API 微调，要么自己部署，从头定制模型行为。Mistral Medium 3 给了第三条路，把智能完整地接进企业系统。借助 Mistral 的 applied AI solutions，模型可以继续预训练，全量微调，并融进企业知识库，适合领域训练，持续学习和自适应工作流。金融，能源，医疗行业的 Beta 客户已经在用它：带着深上下文做客服，把业务流程个性化，分析复杂数据集。

> **回看：** 「continuously pretrained, fully fine tuned」 是客户自己做，还是 Mistral 代做？
> 页面写的是 「With the help of Mistral's applied AI solutions」，链接指向服务页，读起来是 Mistral 参与的服务。没说客户能不能拿到权重自己训，也没给任何定制前后的分数。

## Available today.

The Mistral Medium 3 API is available starting today on Mistral La Plateforme and Amazon Sagemaker, and soon on IBM WatsonX, NVIDIA NIM, Azure AI Foundry, and Google Cloud Vertex. To deploy and customize the model in your environment, please contact us.

Mistral Medium 3 的 API 今天起在 Mistral La Plateforme 和 Amazon Sagemaker 上可用，不久会上 IBM WatsonX，NVIDIA NIM，Azure AI Foundry 和 Google Cloud Vertex。想在自己的环境里部署和定制，请联系我们。

## One more thing…

With the launches of Mistral Small in March and Mistral Medium today, it's no secret that we're working on something 'large' over the next few weeks. With even our medium-sized model being resoundingly better than flagship open source models such as Llama 4 Maverick, we're excited to 'open' up what's to come :)

三月发了 Mistral Small，今天发 Mistral Medium，我们接下来几周在做一个 「large」 的东西，这已经不是秘密。连中号模型都明显好过 Llama 4 Maverick 这样的旗舰开源模型，我们很期待把接下来的东西 「open」 出来：)

> **停一下：** Medium 3 本身开放权重吗？
> 本页没说开放。上线渠道全是 API，自部署要 「contact us」。结尾那个加引号的 'open' 说的是接下来的 'large'，不是 Medium 3。

<!-- page 7 of 8 -->

Page 7 is the site footer navigation, captured in 2026. It lists Products (Vibe, Vibe Code, Studio, Forge, Compute, Pricing), Solutions (Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities), Why Mistral (About us, Careers, Partners, Our customers, Our models, Brand) and Company. The cookie banner covers the middle of the page.

第 7 页是站点页脚导航，抓页时间是 2026 年。里面列了 Products (Vibe, Vibe Code, Studio, Forge, Compute, Pricing), Solutions（Delivery methodology，Model customization，Coding，Document intelligence，Speech，以及金融，公共机构，制造，能源与公用事业四个行业方案），Why Mistral (About us, Careers, Partners, Our customers, Our models, Brand) 和 Company。页面中间被 cookie 横幅盖住。

> **再看：** 页脚里的 Vibe，Forge 这些产品和 Medium 3 同期吗？
> 不能这么读。页脚是抓页时的站点外壳，第 8 页印着 「Mistral AI © 2026」，而正文日期是 May 7, 2025。这些产品名不是这篇公告的内容。

<!-- page 8 of 8 -->

Page 8 continues the footer: Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice, a "Get Mistral Vibe" block with App Store and Google Play badges, the line "Mistral AI © 2026" and a language switch set to English. The images directory keeps four small crops from this page.

第 8 页接着是页脚：Terms of Service, Privacy Policy，Privacy choices，Data processing agreement，Trust Center，Legal notice，一个带 App Store 和 Google Play 徽标的 「Get Mistral Vibe」 区块，一行 「Mistral AI © 2026」，以及设成 English 的语言切换。images 目录里从这一页截了四个小图。

![cookie 横幅里的空复选框，不含模型信息](images/p08-image.png)

![cookie 横幅里的另一个空复选框，不含模型信息](images/p08-image-2.png)

![页脚里的显示器小图标，像是主题切换里的跟随系统选项，不含模型信息](images/p08-in.png)

![页脚里的月亮小图标，像是主题切换里的深色选项，不含模型信息](images/p08-close.png)
