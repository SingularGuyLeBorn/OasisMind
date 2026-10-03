---
title: "Mistral Large 2 · 对照译稿"
category: "模型库"
tags: ["Mistral", "对照译稿"]
published: true
excerpt: "Mistral Large 2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
这是 Mistral AI 官网的 Mistral Large 2 发布页，标题 「Large Enough」，共 11 页，9 张图。正文在第 1 到第 9 页上半，第 9 页下半到第 11 页是站点页脚。转出的 Markdown 被 cookie 横幅盖掉大半，下面的英文按 PDF 文本层补全。页面上的柱状图和散点图都没有数据标签，文中写 「约」 的数值是对着坐标轴读出来的，一律是估算；被横幅挡住的图按 PDF 里嵌着的原图读。

<!-- page 1 of 11 -->

# Large Enough

The page header reads **RESEARCH**, followed by the title "Large Enough", the date **July 24, 2024** and the byline "By Mistral AI team".

页头印着 **RESEARCH**，下面是标题 「Large Enough」，日期 **July 24, 2024**，署名 「By Mistral AI team」。

> **想：** July 24, 2024 是发布日还是抓页的日子？
> 按发布日读，它紧挨着标题和署名。第 11 页页脚的 © 2026 是抓页时的站点外壳，页脚里列的 Vibe，Studio 等产品和这篇公告不是同一个时间。

A hero image sits below the byline, but the cookie banner covers almost all of it; only a red strip shows at its right edge.

署名下面有一张题图，几乎全被 cookie 横幅盖住，只在右侧露出一条红色。

This latest generation continues to push the boundaries of cost efficiency, speed, and performance. Mistral Large 2 is exposed on la Plateforme and enriched with new features to facilitate building innovative AI applications.

新一代模型继续在成本效率，速度和性能上往前推。Mistral Large 2 已经在 la Plateforme 上开放，还加了新功能，方便搭建新的 AI 应用。

## Mistral Large 2

The rest of page 1 is a cookie consent banner certified by axeptio. It says the site uses cookies to measure the audience, nurture the relationship and send content and advertisement. It lists Google Analytics 4 and Hubspot, with Close, Accept all and Next buttons. The same banner repeats on every page below.

第 1 页剩下的是 axeptio 认证的 cookie 同意横幅。横幅说网站用 cookie 统计访问量，维系用户关系，推送内容和广告。它列出 Google Analytics 4 和 Hubspot 两项，带 Close，Accept all，Next 三个按钮。后面每一页都重复这个横幅。

![cookie 横幅里 Toggle all 的开关图标，不含模型信息](images/p01-google-analytics-4-helps-us-measure-our-audience.png)

<!-- page 2 of 11 -->

Mistral Large 2 has a 128k context window and supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash.

Mistral Large 2 的上下文窗口是 128k，支持几十种自然语言，包括法语，德语，西班牙语，意大利语，葡萄牙语，阿拉伯语，印地语，俄语，中文，日语和韩语，另外支持 80 多种编程语言，包括 Python，Java，C，C++，JavaScript 和 Bash。

> **问：** 128k 是多少 token，128,000 还是 131,072?
> 这页只写 「128k context window」，没写单位也没写精确值。按惯例读作 token，但页面本身没说，也没有任何长上下文评测。

Mistral Large 2 is designed for single-node inference with long-context applications in mind – its size of 123 billion parameters allows it to run at large throughput on a single node. We are releasing Mistral Large 2 under the Mistral Research License, that allows usage and modification for research and non-commercial usages. For commercial usage of Mistral Large 2 requiring self-deployment, a Mistral Commercial License must be acquired by contacting us.

Mistral Large 2 按单节点推理设计，面向长上下文应用。它有 1230 亿参数，这个规模能让它在单个节点上跑出高吞吐。我们以 Mistral Research License 发布 Mistral Large 2，允许为研究和非商业用途使用和修改。需要自部署的商业用途，得联系我们购买 Mistral Commercial License。

> **核对：** 123B 放进 「single node」 要多少显存？
> 页面没写精度，也没写节点配置。按每参数 2 字节算，光权重就约 246 GB，一张 80 GB 的卡放不下。所以这里的 「single node」 只能读作单台多卡机器，不是单卡。

## General performance

Mistral Large 2 sets a new frontier in terms of performance / cost of serving on evaluation metrics. In particular, on MMLU, the pretrained version achieves an accuracy of 84.0%, and sets a new point on the performance/cost Pareto front of open models.

在各项评测指标上，Mistral Large 2 把 「性能 / 服务成本」 推到了新的前沿。具体说，预训练版在 MMLU 上准确率 84.0%，在开放模型的性能/成本 Pareto 前沿上添了一个新点。

> **看表：** 84.0% 画在哪张图上？
> 哪张都没有。本页的 Pareto 图画的是代码，数学和多语言 MMLU，多语言那张不含英语，84.0% 只在这句正文里出现一次。另外几张 Pareto 图的横轴都是 「# of Parameters」，不是服务成本。

## Code & Reasoning

Following our experience with Codestral 22B and Codestral Mamba, we trained Mistral Large 2 on a very large proportion of code. Mistral Large 2 vastly outperforms the previous Mistral Large, and performs on par with leading models such as GPT-4o, Claude 3 Opus, and Llama 3 405B.

有了 Codestral 22B 和 Codestral Mamba 的经验，我们训练 Mistral Large 2 时用了很大比例的代码。Mistral Large 2 远超上一代 Mistral Large，和 GPT-4o，Claude 3 Opus，Llama 3 405B 这些领先模型打平。

> **拆开：** 正文的 「Llama 3 405B」 和图表里的 Llama 3.1 405B 是两个模型吗？
> 本页所有图表都写 Llama 3.1 405B，没有一行叫 「Llama 3 405B」。正文这里少了 「.1」，按上下文指的是同一个模型。「very large proportion of code」 也没有给比例。

The bottom of page 2 holds two scatter plots, "Code generation performance" and "Math performance". The x-axis is "# of Parameters" with ticks from 0 to 400, and a shaded triangle in the upper left is labelled "Best performance/size ratio". Each plot has three points: Mistral Large 2, Llama 3.1 70B and Llama 3.1 405B. The banner covers the left half on the page, and the images directory has no crop of this figure.

第 2 页底部是两张散点图，「Code generation performance」 和 「Math performance」。横轴是 「# of Parameters」，刻度从 0 到 400，左上角一块阴影三角标着 「Best performance/size ratio」。每张图三个点：Mistral Large 2, Llama 3.1 70B, Llama 3.1 405B. 页面上它的左半被横幅挡住，images 目录里也没有这张图的截取。

按 PDF 里嵌的原图读：代码图里 Mistral Large 2 在横轴约 123 处，纵轴约 82%，Llama 3.1 70B 约 78%，Llama 3.1 405B 在横轴约 405 处，约 81%。数学图里三者依次约 70%, 64%, 67%。以上都是估算。

> **确认：** 代码散点图的纵轴是哪个基准？
> 图上没写。把第 3 页四组代码柱子等权平均，Mistral Large 2 约 81.9，Llama 3.1 405B 约 81.5，Llama 3.1 70B 约 77.5，和散点位置对得上；数学图的三个点也和第 4 页 Math Instruct 那组柱子一致。这是读图对位，页面没交代。同样按这个平均，Claude 3.5 Sonnet 约 83.9，GPT 4o 约 83.8，都比 Mistral Large 2 高，但散点图里只画了 Llama。

<!-- page 3 of 11 -->

A significant effort was also devoted to enhancing the model's reasoning capabilities. One of the key focus areas during training was to minimize the model's tendency to "hallucinate" or generate plausible-sounding but factually incorrect or irrelevant information. This was achieved by fine-tuning the model to be more cautious and discerning in its responses, ensuring that it provides reliable and accurate outputs.

我们还花了很大力气增强模型的推理能力。训练时的重点之一是压低模型 「幻觉」 的倾向，也就是生成听着合理，实际上错误或不相关的内容。做法是微调模型，让它回答时更谨慎，更有分辨力，保证输出可靠准确。

> **回看：** 「fine-tuning the model to be more cautious」 是怎么做的，幻觉降了多少？
> 都没写。数据，方法，幻觉率一个数字也没有，本页也没有一张图专门测幻觉。这一段是定性描述。

Additionally, the new Mistral Large 2 is trained to acknowledge when it cannot find solutions or does not have sufficient information to provide a confident answer. This commitment to accuracy is reflected in the improved model performance on popular mathematical benchmarks, demonstrating its enhanced reasoning and problem-solving skills:

此外，新的 Mistral Large 2 经过训练，在找不到解法，或者信息不够给出有把握的答案时，会承认这一点。对准确性的这份坚持，体现在它在常用数学基准上的提升，说明推理和解题能力增强了：

> **停一下：** 冒号后面接的是数学图吗？
> 不是。冒号后紧跟的是代码生成图，图注也写 「code generation benchmarks」。数学图要到第 4 页 MultiPL-E 表之后才出现。

![代码生成基准柱状图的右半，露出 MBPP Base 和 MBPP Plus 两组，左半被 cookie 横幅挡住](images/p03-hmarks-all-models-were-line.png)

The full chart embedded in the PDF has four groups: Human Eval, Human Eval Plus, MBPP Base and MBPP Plus. The y-axis is Accuracy (%) from 40 to 100. Each group has eight bars, in the order Command R+, Mistral Large, Llama 3.1 70B, Claude 3 Opus, Llama 3.1 405B, Claude 3.5 Sonnet, GPT 4o, Mistral Large 2. No bar carries a value label.

PDF 里嵌的完整原图有四组：Human Eval, Human Eval Plus, MBPP Base, MBPP Plus。纵轴是 Accuracy (%)，从 40 到 100。每组八根柱子，顺序是 Command R+, Mistral Large, Llama 3.1 70B, Claude 3 Opus, Llama 3.1 405B, Claude 3.5 Sonnet, GPT 4o, Mistral Large 2。柱子上都没有数值标签。

Performance accuracy on code generation benchmarks (all models were benchmarked through the same evaluation pipeline)

代码生成基准上的准确率（所有模型都走同一套评测流程）。

> **再看：** Mistral Large 2 在四组里排第几？
> 读柱高：Human Eval 约 92，仅次于 GPT 4o 的约 93；Human Eval Plus 约 86.5，也是第二；MBPP Base 约 80，MBPP Plus 约 69，两组都只排第 6。「on par」 在 HumanEval 这两组站得住，在 MBPP 两组站不住。

The rest of page 3 is covered by the banner.

第 3 页其余部分被横幅盖住。

<!-- page 4 of 11 -->

The page opens with the body of the MultiPL-E table. Its header row falls on the seam between pages 3 and 4 and is cut off on the rendered page; the header below is read from the table image embedded in the PDF. The Average column is framed by a dotted box, the Mistral Large 2 row is shaded, and bold follows the original.

这一页开头是 MultiPL-E 表的表身。表头行落在第 3, 4 页的接缝上，渲染出来的页面上看不到，下面的表头按 PDF 里嵌的表格原图补。Average 一列用虚线框圈着，Mistral Large 2 一行有底色，加粗照原表。

| | Average | Python | C++ | Bash | Java | TypeScript | PHP | C# |
|---|---|---|---|---|---|---|---|---|
| Mistral Large 2 (2407) | 76.9% | 92.1% | 84.5% | 51.9% | 84.2% | 86.8% | 77.6% | 61.4% |
| Mistral Large 1 (2402) | 60.4% | 70.1% | 67.1% | 36.1% | 70.3% | 71.7% | 61.5% | 46.2% |
| Llama 3.1 405B (measured) | 74.9% | 84.1% | 82.0% | 58.2% | 82.9% | 83.6% | 73.9% | 59.5% |
| Llama 3.1 405B (paper) | 75.8% | 89.0% | 82.0% | 57.6% | 80.4% | 81.1% | 76.4% | 64.4% |
| Llama 3.1 70B | 68.5% | 78.7% | 70.2% | 51.3% | 74.7% | 76.7% | 73.3% | 54.4% |
| GPT-4o | 77.9% | 93.3% | 85.7% | 54.4% | 82.9% | 89.3% | 79.5% | 60.1% |

Performance accuracy on MultiPL-E (all models were benchmarked through the same evaluation pipeline, except for the "paper" row)

MultiPL-E 上的准确率（除 「paper」 一行外，所有模型都走同一套评测流程）。

> **对一下：** Average 是不是后面七列的平均？
> 是。六行七列各自平均后四舍五入到一位小数，分别是 76.9, 60.4, 74.9, 75.8, 68.5, 77.9，和 Average 列逐一对上。加粗是每列最大值，连 「paper」 行也一起比：Bash 最高是 Llama 3.1 405B measured 的 58.2%，C# 最高是 paper 行的 64.4%。

> **想：** 第一名是谁？
> 平均分第一是 GPT-4o 的 77.9%，Mistral Large 2 是 76.9%，差 1.0 个点。七种语言里 Mistral Large 2 只在 Java (84.2%) 拿了最高，C# 比 GPT-4o 高 1.3，其余五种都比 GPT-4o 低 1.2 到 2.5 个点。

> **问：** 自测的 Llama 3.1 405B 为什么比论文分低？
> 页面没解释。两行平均 74.9% 对 75.8%，Python 和 C# 都低 4.9 个点，Java 和 TypeScript 反而高 2.5 个点。表注只说 「paper」 行不走同一流程，流程差在哪没写。

![数学基准柱状图的右半，露出 Math Instruct 一组，左半被 cookie 横幅挡住](images/p04-evaluation-pipeline.png)

The full chart embedded in the PDF has two groups, "GSM8K (8-shot)" and "Math Instruct (0-shot no CoT)", with Accuracy (%) from 0 to 100. The bar order here differs from the code chart: Command R+, Mistral Large, Claude 3 Opus, Claude 3.5 Sonnet, GPT 4o, Llama 3.1 70B, Llama 3.1 405B, Mistral Large 2.

PDF 里嵌的完整原图有两组，「GSM8K (8-shot)」 和 「Math Instruct (0-shot no CoT)」，纵轴 Accuracy (%) 从 0 到 100。这里的柱子顺序和代码图不同：Command R+, Mistral Large, Claude 3 Opus, Claude 3.5 Sonnet, GPT 4o, Llama 3.1 70B, Llama 3.1 405B, Mistral Large 2.

Performance accuracy on GSM8K (8-shot) and MATH (0-shot, no CoT) generation benchmarks (all models were benchmarked through the same evaluation pipeline)

GSM8K (8-shot) 和 MATH（0-shot，不用 CoT）上的准确率（所有模型都走同一套评测流程）。

> **核对：** 数学上 Mistral Large 2 领先了吗？
> 没有。GSM8K 约 93，低于 Claude 3.5 Sonnet 约 95，Llama 3.1 70B 约 94，Llama 3.1 405B 约 96；Math Instruct 约 70，低于 GPT 4o 约 76。能站住的是对上一代的提升：Mistral Large 在 Math Instruct 上约 49.5。另外图注写 「MATH」，图里写 「Math Instruct」，图注结尾的 「generation benchmarks」 像是从代码图注抄来的。

The rest of page 4 is covered by the banner.

第 4 页其余部分被横幅盖住。

<!-- page 5 of 11 -->

## Instruction following & Alignment

We drastically improved the instruction-following and conversational capabilities of Mistral Large 2. The new Mistral Large 2 is particularly better at following precise instructions and handling long multi-turn conversations. Below we report the performance on MT-Bench, Wild Bench, and Arena Hard benchmarks:

我们大幅提升了 Mistral Large 2 的指令遵循和对话能力。新的 Mistral Large 2 尤其擅长遵循精确指令，处理长的多轮对话。下面是它在 MT-Bench，Wild Bench 和 Arena Hard 上的表现：

![Wild Bench 和 Arena Hard 两组柱状图，下半被 cookie 横幅挡住](images/p05-axeptio.png)

The chart has two groups, Wild Bench and Arena Hard, with Score from 0 to 100. The bar order is Command R+, Mistral Large, Llama 3.1 70B, Llama 3.1 405B (labelled "LLama 3.1 405" without the B), Claude 3 Opus, Claude 3.5 Sonnet, GPT 4o, Mistral Large 2.

图有两组，Wild Bench 和 Arena Hard，纵轴 Score 从 0 到 100。柱子顺序是 Command R+, Mistral Large, Llama 3.1 70B, Llama 3.1 405B（标签印成 「LLama 3.1 405」，少了 B），Claude 3 Opus, Claude 3.5 Sonnet, GPT 4o, Mistral Large 2.

Performance on general alignment benchmarks (all models were benchmarked through the same evalutation pipeline)

通用对齐基准上的表现（所有模型都走同一套评测流程）。原文 「evalutation」 拼错了。

> **看表：** 对齐这两组 Mistral Large 2 排第几？
> Wild Bench 约 56，排第二，只低于 GPT 4o 约 59；Arena Hard 约 73，排第三，低于 Claude 3.5 Sonnet 和 GPT 4o 的约 79。对上一代的跳幅很大，Mistral Large 在 Arena Hard 上约 37.5。

On some benchmarks, generating lengthy responses tends to improve the scores. However, in many business applications, conciseness is paramount – short model generations facilitate quicker interactions and are more cost-effective for inference. This is why we spent a lot of effort to ensure that generations remain succinct and to the point whenever possible. The graph below reports the average length of generations of different models on questions from the MT Bench benchmark:

有些基准上，回答写得长往往分数更高。可在很多业务场景里，简洁最要紧：模型输出短，交互就快，推理成本也低。所以我们花了很多功夫，让输出尽量简短，切中要点。下图是不同模型在 MT Bench 题目上的平均生成长度：

<!-- page 6 of 11 -->

![MT Bench (dev) 柱状图，GPT-4o 当裁判，纵轴 6 到 9](images/p06-chart.png)

The left chart is "MT Bench (dev) - GPT-4o judge", with Score from 6 to 9. The bar order matches the alignment chart.

左图是 「MT Bench (dev) - GPT-4o judge」，纵轴 Score 从 6 到 9。柱子顺序和对齐图相同。

> **拆开：** GPT-4o 当裁判，给 GPT-4o 自己打分，公平吗？
> 页面没讨论这一点。读柱高，GPT 4o 约 8.69 最高，Claude 3.5 Sonnet 约 8.66，Mistral Large 2 约 8.63 排第三。前三名相差不到 0.1，纵轴又从 6 起，视觉上的差距被放大了。

![MT Bench (dev) 平均生成长度横向柱状图，从短到长排列](images/p06-cuments-while-the-majorityhere-are-our-cookies.png)

The right chart is "MT Bench (dev) - Average Generation Length", with the axis ticked 0, 450, 900, 1350 and 1800. From short to long: Mistral Large, Mistral Large 2, Claude 3 Opus, Claude 3.5 Sonnet, Command R+, GPT 4o, Llama 3.1 405B, Llama 3.1 70B.

右图是 「MT Bench (dev) - Average Generation Length」，横轴刻度 0, 450, 900, 1350, 1800。从短到长依次是 Mistral Large, Mistral Large 2, Claude 3 Opus, Claude 3.5 Sonnet, Command R+, GPT 4o, Llama 3.1 405B, Llama 3.1 70B.

> **确认：** 长度的单位是什么，Mistral Large 2 算不算最短？
> 单位没印，字符还是 token 看不出来。Mistral Large 2 约 1470，比其余六家都短，但比上一代 Mistral Large 约 1300 长了约 13%。所以 「succinct」 是和对手比，不是和自家上一代比。

## Language diversity

A large fraction of business use cases today involve working with multilingual documents. While the majority of models are English-centric, the new Mistral Large 2 was trained on a large proportion of multilingual data. In particular, it excels in English, French, German, Spanish, Italian, Portuguese, Dutch, Russian, Chinese, Japanese, Korean, Arabic, and Hindi. Below are the performance results of Mistral Large 2 on the multilingual MMLU benchmark, compared to the previous Mistral Large, Llama 3.1 models, and to Cohere's Command R+.

如今很大一部分业务场景要处理多语言文档。多数模型以英语为中心，新的 Mistral Large 2 则用了很大比例的多语言数据来训练。它尤其擅长英语，法语，德语，西班牙语，意大利语，葡萄牙语，荷兰语，俄语，中文，日语，韩语，阿拉伯语和印地语。下面是 Mistral Large 2 在多语言 MMLU 上的结果，对比对象是上一代 Mistral Large，Llama 3.1 系列，以及 Cohere 的 Command R+。

The rest of page 6 is covered by the banner.

第 6 页其余部分被横幅盖住。

<!-- page 7 of 11 -->

![多语言 MMLU 页面截图，上半是参数量散点图，下半是九种语言的柱状图，左下被 cookie 横幅挡住](images/p07-performance-on-multilingual-mmlu-measured-on-the-base.png)

The upper chart is titled "Multilingual MMLU (measured on pre-trained base models)". Like the page 2 plots, its x-axis is "# of Parameters" and it has the same "Best performance/size ratio" triangle. Mistral Large 2 sits at about 80.5% near x = 123, Llama 3.1 70B at about 74.5%, and Llama 3.1 405B at about 81% near x = 405 (all read from the plot).

上图标题是 「Multilingual MMLU (measured on pre-trained base models)」。和第 2 页的散点图一样，横轴是 「# of Parameters」，也有那块 「Best performance/size ratio」 三角。Mistral Large 2 在横轴约 123 处，纵轴约 80.5%；Llama 3.1 70B 约 74.5%；Llama 3.1 405B 在横轴约 405 处，约 81%（都是读图估算）。

The lower chart shows MMLU Score (measured) from 50 to 85 for nine languages: FR, DE, ES, IT, NL, PT, RU, JA and ZH. Each language has five bars: Command R+, Mistral Large, Llama 3.1 70B, Llama 3.1 405B and Mistral Large 2.

下图是九种语言的 MMLU Score (measured)，纵轴 50 到 85: FR, DE, ES, IT, NL, PT, RU, JA, ZH。每种语言五根柱子：Command R+, Mistral Large, Llama 3.1 70B, Llama 3.1 405B, Mistral Large 2。

Performance on Multilingual MMLU (measured on the base pretrained model)

多语言 MMLU 上的表现（在预训练基座模型上测）。

> **回看：** 正文列了 13 种擅长的语言，图里有几种？
> 只有 9 种。英语，韩语，阿拉伯语，印地语都不在图里。第 2 页那份语言清单又没有荷兰语，两处清单也不一致。

> **停一下：** 九种语言里 Mistral Large 2 赢过 Llama 3.1 405B 吗？
> 一种也没有。每种语言都比 Llama 3.1 405B 低约 0.3 到 1.6 个点，九种平均约 80.5 对 81.4。它的卖点在散点图那块三角里：参数约是 405B 的 0.30 倍，分数只差不到 1 个点。

<!-- page 8 of 11 -->

## Tool Use & Function Calling

Mistral Large 2 is equipped with enhanced function calling and retrieval skills and has undergone training to proficiently execute both parallel and sequential function calls, enabling it to serve as the power engine of complex business applications.

Mistral Large 2 的函数调用和检索能力增强了，还专门训练过熟练执行并行和串行函数调用，可以给复杂的业务应用当动力引擎。

![Function Calling 柱状图，下半被 cookie 横幅挡住](images/p08-certified-by-https-www-axept-io-get-widget-utmsource.png)

The chart is titled "Function Calling", with Accuracy (%) from 0 to 60 and five bars: Mistral Large, Claude 3.5 Sonnet, Claude 3 Opus, GPT 4o, Mistral Large 2.

图的标题是 「Function Calling」，纵轴 Accuracy (%) 从 0 到 60，五根柱子：Mistral Large, Claude 3.5 Sonnet, Claude 3 Opus, GPT 4o, Mistral Large 2。

> **再看：** 这是哪个函数调用基准？
> 没写。图上只有 「Function Calling」 和 Accuracy (%)，没有基准名，没有图注，也没有 Llama。读柱高，Mistral Large 约 21，Claude 3.5 Sonnet 约 44，Claude 3 Opus 约 43.5，GPT 4o 约 47，Mistral Large 2 约 48 最高。

## Try Mistral Large 2 on la Plateforme

You can use Mistral Large 2 today via la Plateforme under the name mistral-large-2407, and test it on le Chat. It is available under the version 24.07 (a YY.MM versioning system that we are applying to all our models), and the API name mistral-large-2407. Weights for the instruct model are available and are also hosted on HuggingFace.

今天起就能通过 la Plateforme 用 Mistral Large 2，名字是 mistral-large-2407，也可以在 le Chat 上试。版本号是 24.07（我们给所有模型都用 YY.MM 这种版本号），API 名是 mistral-large-2407. instruct 模型的权重已经开放，也托管在 HuggingFace 上。

> **对一下：** 放出来的是哪份权重？
> 只说 instruct 模型。可 MMLU 84.0% 和多语言 MMLU 都是在预训练基座上测的，页面没说基座权重放不放。能下载的模型和前面报分的模型不是同一份。

We are consolidating the offering on la Plateforme around two general purpose models, Mistral Nemo and Mistral Large, and two specialist models, Codestral and Embed. As we progressively deprecate older models on la Plateforme, all Apache models (Mistral 7B, Mixtral 8x7B and 8x22B, Codestral Mamba,

我们要把 la Plateforme 上的产品收拢成两个通用模型，Mistral Nemo 和 Mistral Large，加两个专用模型，Codestral 和 Embed。随着我们逐步下线 la Plateforme 上的旧模型，所有 Apache 许可的模型 (Mistral 7B，Mixtral 8x7B 和 8x22B, Codestral Mamba，（这句跨到第 9 页）

<!-- page 9 of 11 -->

Mathstral) remain available for deployment and fine-tuning using our SDK mistral-inference and mistral-finetune.

Mathstral) 仍然可以用我们的 SDK mistral-inference 和 mistral-finetune 部署和微调。

Starting today, we are extending fine-tuning capabilities on la Plateforme: those are now available for Mistral Large, Mistral Nemo and Codestral.

从今天起，我们扩展 la Plateforme 上的微调能力：Mistral Large，Mistral Nemo 和 Codestral 现在都能微调。

## Access Mistral models through cloud service providers

We are proud to partner with leading cloud service providers to bring the new Mistral Large 2 to a global audience. In particular, today we are expanding our partnership with Google Cloud Platform to bring Mistral AI's models on Vertex AI via a Managed API. Mistral AI's best models are now available on Vertex AI, in addition to Azure AI Studio, Amazon Bedrock and IBM watsonx.ai.

我们很高兴和几家主要云服务商合作，把新的 Mistral Large 2 带给全球用户。特别是今天，我们扩大了和 Google Cloud Platform 的合作，通过 Managed API 把 Mistral AI 的模型放上 Vertex AI。除了 Azure AI Studio，Amazon Bedrock 和 IBM watsonx.ai，现在 Vertex AI 上也能用 Mistral AI 最好的模型。

Availability timeline of Mistral AI models

Mistral AI 模型的上线时间表

![云平台上线表截图，左半被 cookie 横幅挡住，露出 Amazon Bedrock 和 IBM watsonx.ai 两列](images/p09-prici.png)

The full table embedded in the PDF has four columns, Google Vertex AI, Azure AI Studio, Amazon Bedrock and IBM watsonx.ai, and four rows. Mistral Large 2 (24.07) is ticked in all four. Mistral Nemo is ticked on Vertex AI and Azure AI Studio, "Coming soon" on Amazon Bedrock, blank on watsonx.ai. Codestral is ticked on Vertex AI and "Coming soon" on Azure AI Studio. Finetuning is "Coming soon" on Azure AI Studio and Amazon Bedrock.

PDF 里嵌的完整表格有四列：Google Vertex AI，Azure AI Studio，Amazon Bedrock，IBM watsonx.ai，共四行。Mistral Large 2 (24.07) 四列都打勾。Mistral Nemo 在 Vertex AI 和 Azure AI Studio 打勾，Amazon Bedrock 写 「Coming soon」，watsonx.ai 空着。Codestral 在 Vertex AI 打勾，Azure AI Studio 写 「Coming soon」。Finetuning 一行在 Azure AI Studio 和 Amazon Bedrock 写 「Coming soon」。

> **想：** 表里的 Finetuning 和正文说的微调是一回事吗？
> 不是一处。正文说的是 la Plateforme 上今天开放微调，表里这一行说的是云平台上的微调，四家里一家打勾都没有，两家 「Coming soon」，两家空着。

The page then turns into the site footer. The Products column lists Vibe, Vibe Code, Studio, Forge and Compute.

之后进入站点页脚。Products 一栏列着 Vibe, Vibe Code, Studio, Forge, Compute。

<!-- page 10 of 11 -->

Page 10 continues the footer: Pricing; under Solutions: Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities; under Why Mistral: About us, Careers, Partners, Our customers, Our models, Brand; under Company: Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice.

第 10 页接着是页脚：Pricing；Solutions 下有 Delivery methodology，Model customization，Coding，Document intelligence，Speech，以及面向金融，公共机构，制造业，能源与公用事业的四个行业页；Why Mistral 下有 About us，Careers，Partners，Our customers，Our models，Brand；Company 下有 Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice.

<!-- page 11 of 11 -->

Page 11 closes the footer with "Get Mistral Vibe", "Mistral AI © 2026" and a language switch set to English. The cookie banner appears once more.

第 11 页是页脚收尾：「Get Mistral Vibe」，「Mistral AI © 2026」，以及停在 English 的语言切换。cookie 横幅在这里又出现一次。
