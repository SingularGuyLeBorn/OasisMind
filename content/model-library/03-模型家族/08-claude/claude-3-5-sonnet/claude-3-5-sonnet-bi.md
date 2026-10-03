---
title: "Claude 3.5 Sonnet · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude 3.5 Sonnet 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 10 -->

AI

AI (页面左上角 Anthropic 标志被识别成的文字, 不是正文)

Announcements

公告

# Claude 3.5 Sonnet

Jun 21, 2024

2024 年 6 月 21 日

[Try on Claude.ai](https://claude.ai/)

[在 Claude.ai 上试用](https://claude.ai/)

![Image block](images/p01-update-consumer-terms-and-privacy-policy-aug-28-2025.png)

> **核对:** 题图的文件名是 「update-consumer-terms-and-privacy-policy-aug-28-2025」, 它和隐私政策有关吗?
> 无关. 图里是橙底上一个白色剪纸风格的人头侧影, 头部中间画着一朵黑线描的放射状花形, 没有任何文字. 文件名是转换工具拿图下方第一行文字命名的, 那一行是 「UPDATE Consumer Terms and Privacy Policy Aug 28, 2025」, 属于站点横幅, 日期比正文的 Jun 21, 2024 晚了一年多. md 全文共落了 6 张图: 这张题图, 第 2 页的智能-成本示意图, 第 6 页两个 「Read more」 旁的箭头小图标和一张页脚截图, 以及第 10 页的社交图标. PDF 里真正嵌入的位图只有 4 张, 分在第 1 到 4 页: 题图, 示意图和两张评测表; 两张评测表被 md 转成了文字表格, 不计在那 6 张里.

UPDATE Consumer Terms and Privacy Policy Aug 28, 2025

更新: 消费者条款与隐私政策, 2025 年 8 月 28 日

Today, we’re launching Claude 3.5 Sonnet—our first release in the forthcoming Claude 3.5 model family. Claude 3.5 Sonnet raises the industry bar for intelligence, outperforming competitor models and Claude 3 Opus on a wide range of evaluations, with the speed and cost of our mid-tier model, Claude 3 Sonnet.

今天我们发布 Claude 3.5 Sonnet, 这是即将推出的 Claude 3.5 模型家族中的第一款. Claude 3.5 Sonnet 抬高了业界的智能标杆, 在大量评测上超过竞品模型和 Claude 3 Opus, 速度与成本则和我们的中档模型 Claude 3 Sonnet 相同.

Claude 3.5 Sonnet is now available for free on Claude.ai and the Claude iOS app, while Claude Pro and Team plan subscribers can access it with significantly higher rate

<!-- page 2 of 10 -->

limits. It is also available via the Anthropic [API](https://docs.anthropic.com/en/home), [Amazon Bedrock](https://aws.amazon.com/blogs/aws/anthropics-claude-3-5-sonnet-model-now-available-in-amazon-bedrock-the-most-intelligent-claude-model-yet/), and [Google Cloud’s Vertex AI](https://cloud.google.com/blog/products/ai-machine-learning/announcing-anthropics-claude-3-5-sonnet-on-vertex-ai-providing-more-choice-for-enterprises). The model costs \$3 per million input tokens and \$15 per million output tokens, with a 200K token context window.

Claude 3.5 Sonnet 现已在 Claude.ai 和 Claude iOS 应用上免费开放, Claude Pro 与 Team 套餐的订阅用户可以在高得多的速率限制下使用. 它也可以通过 Anthropic [API](https://docs.anthropic.com/en/home), [Amazon Bedrock](https://aws.amazon.com/blogs/aws/anthropics-claude-3-5-sonnet-model-now-available-in-amazon-bedrock-the-most-intelligent-claude-model-yet/) 和 [Google Cloud 的 Vertex AI](https://cloud.google.com/blog/products/ai-machine-learning/announcing-anthropics-claude-3-5-sonnet-on-vertex-ai-providing-more-choice-for-enterprises) 调用. 模型价格为每百万输入 token \$3, 每百万输出 token \$15, 上下文窗口为 200K token.

> **问:** \$3 和 \$15 每百万 token 的价格, 以及 200K token 的上下文窗口, 本页有没有别的数能对上?
> 价格这边, 输出单价是输入的 5 倍. 第 1 页说 3.5 Sonnet 具有 「the speed and cost of our mid-tier model, Claude 3 Sonnet」, 即与 Claude 3 Sonnet 同价, 但全页没有写 Claude 3 Sonnet 或 Claude 3 Opus 的单价, 所以后文 「cost-effective pricing」 相对 Opus 便宜多少算不出来. 紧接着的示意图横轴是 「Price per million tokens」, 3.5 Sonnet 与 3 Sonnet 画在同一横坐标上, 和这句话一致, 只是轴上没有刻度. 上下文这边, 200K 全文只出现这一次; 两张评测表里没有专门测长上下文的项目, 所以 200K 窗口在长输入上表现如何, 本页没有给证据. 免费用户与 Pro, Team 用户之间的 「significantly higher rate limits」 同样没有数字.

![Image block](images/p02-frontier-intelligence-at-2x-the-speed.png)

> **再看:** 这张示意图两根轴都没有刻度, 它能读出什么?
> 能读出的只有相对位置. 纵轴是 「INTELLIGENCE」, 小字 「Benchmark scores」; 横轴是 「COST」, 小字 「Price per million tokens」. 三个 Claude 3 模型沿一条浅色虚线从左下往右上排: Haiku 最便宜也最低, 3 Sonnet 居中, Opus 最贵也最高. Claude 3 Sonnet 的点和字都画成淡灰色, 一根灰色箭头从它竖直向上指到 Claude 3.5 Sonnet; 3.5 Sonnet 的点比 Opus 还高, 横坐标却和 3 Sonnet 相同. 图要表达的是 「同一价位把智能往上提, 越过了原来那条曲线」. 纵轴的 「Benchmark scores」 是哪些基准, 怎样合成一个分数, 图上没说, 点的高低只能当示意, 换算不到表里任何一格. 这张图紧挨着 「Frontier intelligence at 2x the speed」 这个小节标题, 图里却没有速度这一维.

## Frontier intelligence at 2x the speed

## 两倍速度下的前沿智能

Claude 3.5 Sonnet sets new industry benchmarks for graduate-level reasoning (GPQA), undergraduate-level knowledge (MMLU), and coding proficiency (HumanEval). It shows marked improvement in grasping nuance, humor, and complex instructions, and is exceptional at writing high-quality content with a natural, relatable tone.

Claude 3.5 Sonnet 在研究生水平推理 (GPQA), 本科水平知识 (MMLU) 和编码能力 (HumanEval) 上创下业界新高. 它在把握细微差别, 幽默和复杂指令方面进步明显, 写高质量内容尤其出色, 语气自然, 让人读着亲切.

> **对一下:** 这里点名在 GPQA, MMLU, HumanEval 三项上创了新高, 第 3 页的表里三项都是 3.5 Sonnet 第一吗?
> GPQA 和 HumanEval 是. GPQA Diamond 上 3.5 Sonnet 为 59.4%, 高于 GPT-4o 的 53.6% 和 Claude 3 Opus 的 50.4%; HumanEval 为 92.0%, 高于 GPT-4o 的 90.2%. MMLU 要看提示设置. 5-shot 一行 3.5 Sonnet 的 88.7% 最高, 但这一行 GPT-4o 是 「—」; 0-shot CoT 一行 3.5 Sonnet 是 88.3%, 比 GPT-4o 的 88.7% 低 0.4 个百分点. 所以 MMLU 的 「新高」 成立在 5-shot 设置下, 两家同时有分的那一行 3.5 Sonnet 并不领先. 表格脚注另给了一个 5-shot CoT 的 90.4%, 但没有其他模型在同一设置下的对照. 句子后半的 「nuance, humor, and complex instructions」 和 「natural, relatable tone」 在表里没有对应评测.

Claude 3.5 Sonnet operates at twice the speed of Claude 3 Opus. This performance boost, combined with cost-effective pricing, makes Claude 3.5 Sonnet ideal for complex tasks such as context-sensitive customer support and orchestrating multi-step workflows.

Claude 3.5 Sonnet 的运行速度是 Claude 3 Opus 的两倍. 速度提升加上划算的定价, 让 Claude 3.5 Sonnet 很适合复杂任务, 例如需要理解上下文的客户支持, 以及编排多步骤工作流.

> **停一下:** 「twice the speed of Claude 3 Opus」 的 2 倍, 是按什么量的?
> 本页没说. 全文讲速度的只有两句: 第 1 页的 「the speed and cost of our mid-tier model, Claude 3 Sonnet」, 和这里的 「twice the speed of Claude 3 Opus」. 没有每秒输出 token 数, 没有首 token 延迟, 也没说在什么输入长度, 什么部署条件下测的. 小节标题里的 「2x」 只有这一句文字支撑, 上面示意图的横轴是价格, 不是速度. 这段推荐的两类用途, 「context-sensitive customer support」 和 「orchestrating multi-step workflows」, 理由也只是速度加价格, 没有对应的评测.

In an [internal agentic coding evaluation](https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf), Claude 3.5 Sonnet solved 64% of problems, outperforming Claude 3 Opus which solved 38%. Our evaluation tests the model’s ability to fix a bug or add functionality to an open source codebase, given a natural language description of the desired improvement. When instructed and [provided with the relevant tools](https://www.anthropic.com/news/tool-use-ga), Claude 3.5 Sonnet can independently write, edit, and execute code with sophisticated reasoning and troubleshooting capabilities. It handles code

<!-- page 3 of 10 -->

translations with ease, making it particularly effective for updating legacy applications and migrating codebases.

在一项 [内部 agentic 编码评测](https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf) 中, Claude 3.5 Sonnet 解决了 64% 的问题, 超过只解决了 38% 的 Claude 3 Opus. 这项评测考察的是: 给出一段描述期望改进的自然语言说明, 模型能否在开源代码库里修复 bug 或添加功能. 在得到指示并 [配备相关工具](https://www.anthropic.com/news/tool-use-ga) 时, Claude 3.5 Sonnet 可以独立编写, 编辑和执行代码, 推理和排错都很老练. 它做代码翻译也游刃有余, 因此特别适合更新遗留应用和迁移代码库.

> **拆开:** 内部 agentic coding 评测 64% 对 38%, 这个评测由哪几块组成?
> 本页给了三块. 任务: "fix a bug or add functionality to an open source codebase, given a natural language description of the desired improvement「, 即拿一段自然语言需求, 在开源代码库里修 bug 或加功能. 条件: 」When instructed and provided with the relevant tools「, 模型能 」independently write, edit, and execute code「, 说明评测中模型可以借助工具改代码, 跑代码. 结果: 3.5 Sonnet 解决 64%, Claude 3 Opus 解决 38%, 相差 26 个百分点. 没给的有: 题目数量, 允许多少轮工具调用, 怎样判定 」solved「, 以及 GPT-4o 等其他模型的成绩. 这项结果也没有进下面的评测表. 链接指向 」Model_Card_Claude_3_Addendum.pdf", 细节要去那份模型卡增补里找. 段尾的代码翻译, 遗留应用更新和代码库迁移只是用途描述, 没有数字.

<table><tr><td></td><td>Claude 3.5 Sonnet</td><td>Claude 3 Opus</td><td>GPT-4o</td><td>Gemini 1.5 Pro</td><td>Llama-400b (early snapshot)</td></tr><tr><td>Graduate level reasoning GPQA, Diamond</td><td>59.4%*0-shot CoT</td><td>50.4%0-shot CoT</td><td>53.6%0-shot CoT</td><td>—</td><td>—</td></tr><tr><td rowspan="2">Undergraduate level knowledge MMLU</td><td>88.7%**5-shot</td><td>86.8%5-shot</td><td>—</td><td>85.9%5-shot</td><td>86.1%5-shot</td></tr><tr><td>88.3%0-shot CoT</td><td>85.7%0-shot CoT</td><td>88.7%0-shot CoT</td><td>—</td><td>—</td></tr><tr><td>Code HumanEval</td><td>92.0%0-shot</td><td>84.9%0-shot</td><td>90.2%0-shot</td><td>84.1%0-shot</td><td>84.1%0-shot</td></tr><tr><td>Multilingual math MGSM</td><td>91.6%0-shot CoT</td><td>90.7%0-shot CoT</td><td>90.5%0-shot CoT</td><td>87.5%8-shot</td><td>—</td></tr><tr><td>Reasoning over text DROP, F1 score</td><td>87.13-shot</td><td>83.13-shot</td><td>83.43-shot</td><td>74.9Variable shots</td><td>83.53-shotPre-trained model</td></tr><tr><td>Mixed evaluations BIG-Bench-Hard</td><td>93.1%3-shot CoT</td><td>86.8%3-shot CoT</td><td>—</td><td>89.2%3-shot CoT</td><td>85.3%3-shot CoTPre-trained model</td></tr><tr><td>Math problem-solving MATH</td><td>71.1%0-shot CoT</td><td>60.1%0-shot CoT</td><td>76.6%0-shot CoT</td><td>67.7%4-shot</td><td>57.8%4-shot CoT</td></tr><tr><td>Grade school math GSM8K</td><td>96.4%0-shot CoT</td><td>95.0%0-shot CoT</td><td>—</td><td>90.8%11-shot</td><td>94.1%8-shot CoT</td></tr></table>

|  | Claude 3.5 Sonnet | Claude 3 Opus | GPT-4o | Gemini 1.5 Pro | Llama-400b (早期快照) |
| --- | --- | --- | --- | --- | --- |
| 研究生水平推理 GPQA, Diamond | 59.4%* (0-shot CoT) | 50.4% (0-shot CoT) | 53.6% (0-shot CoT) | — | — |
| 本科水平知识 MMLU | 88.7%** (5-shot) | 86.8% (5-shot) | — | 85.9% (5-shot) | 86.1% (5-shot) |
| 本科水平知识 MMLU | 88.3% (0-shot CoT) | 85.7% (0-shot CoT) | 88.7% (0-shot CoT) | — | — |
| 代码 HumanEval | 92.0% (0-shot) | 84.9% (0-shot) | 90.2% (0-shot) | 84.1% (0-shot) | 84.1% (0-shot) |
| 多语言数学 MGSM | 91.6% (0-shot CoT) | 90.7% (0-shot CoT) | 90.5% (0-shot CoT) | 87.5% (8-shot) | — |
| 文本推理 DROP, F1 分数 | 87.1 (3-shot) | 83.1 (3-shot) | 83.4 (3-shot) | 74.9 (shot 数不固定) | 83.5 (3-shot, 预训练模型) |
| 综合评测 BIG-Bench-Hard | 93.1% (3-shot CoT) | 86.8% (3-shot CoT) | — | 89.2% (3-shot CoT) | 85.3% (3-shot CoT, 预训练模型) |
| 数学解题 MATH | 71.1% (0-shot CoT) | 60.1% (0-shot CoT) | 76.6% (0-shot CoT) | 67.7% (4-shot) | 57.8% (4-shot CoT) |
| 小学数学 GSM8K | 96.4% (0-shot CoT) | 95.0% (0-shot CoT) | — | 90.8% (11-shot) | 94.1% (8-shot CoT) |

> **看表:** 各列的提示设置一样吗? 横向比较时要留意什么?
> 不一样, 差异集中在右边两列. 3.5 Sonnet, Claude 3 Opus, GPT-4o 三列在同一行里设置一致, 只有 MMLU 分成 5-shot 和 0-shot CoT 两行. Gemini 1.5 Pro 一列多处不同: MGSM 是 8-shot, DROP 是 「Variable shots」, MATH 是 4-shot, GSM8K 是 11-shot, 而左边三列这几行是 0-shot CoT 或 3-shot. Llama-400b 标着 「early snapshot」, DROP 和 BIG-Bench-Hard 两格还注明 「Pre-trained model」, 也就是拿一个预训练模型和其他几列的产品模型放在一起. 空格也不少: GPT-4o 在 MMLU 5-shot, BIG-Bench-Hard, GSM8K 三行是 「—」, Gemini 在 GPQA 和 MMLU 0-shot CoT 是 「—」, Llama 在 GPQA, MMLU 0-shot CoT, MGSM 是 「—」. 所以 3.5 Sonnet 对 Gemini 和 Llama 的领先, 有一部分是在不同提示设置下比出来的. 页面只标了设置, 没解释为何各家设置不同.

> **核对:** md 表里看不出哪格最高, PDF 原图是怎么标的?
> PDF 第 3 页这张表是图片: 3.5 Sonnet 一列被橙色框圈住, 每行最高分印成绿色. 绿字大多落在 3.5 Sonnet 列, 例外两处都在 GPT-4o 列: MMLU 0-shot CoT 的 88.7% 和 MATH 的 76.6%; 与之相应, 3.5 Sonnet 的 88.3% 和 71.1% 印成黑色. MMLU 一行因此有两个绿色的 88.7%, 一个是 3.5 Sonnet 的 5-shot, 一个是 GPT-4o 的 0-shot CoT, 分属两种设置. MATH 上 3.5 Sonnet 比 GPT-4o 低 5.5 个百分点, 是全表它落后最多的一格. md 转换把颜色和框都丢了, 只剩数字.

> **确认:** md 表里 DROP 一行写着 「87.13-shot」, 3.5 Sonnet 在 DROP 上是 87.13 吗?
> 不是. PDF 原图里这一格分两行, 上面是 87.1, 下面是 「3-shot」, md 把两行粘在一起, 成了 「87.13-shot」. 同一行的 「83.13-shot」 与 「83.43-shot」 是 83.1, 83.4 各加 3-shot; 「74.9Variable shots」 是 74.9 加 「Variable shots」; 「83.53-shotPre-trained model」 是 83.5, 3-shot, 「Pre-trained model」 三行连在一起. 这一行的行名是 「DROP, F1 score」, 数值是 F1 分数, 所以不带百分号, 和其他行的百分比不是同一种单位. 其余各格也有同样的粘连, 如 「59.4%*0-shot CoT」, 只是有百分号隔开, 不容易读错. 上面的中文表已按 PDF 拆开.

\* Claude 3.5 Sonnet scores 67.2% on 5-shot CoT GPQA with maj@32 \*\* Claude 3.5 Sonnet scores 90.4% on MMLU with 5-shot CoT prompting

\* Claude 3.5 Sonnet 在 5-shot CoT 加 maj@32 设置下的 GPQA 得分为 67.2%. \*\* Claude 3.5 Sonnet 在 5-shot CoT 提示下的 MMLU 得分为 90.4%.

> **拆开:** 脚注里的 67.2% 和 90.4% 是怎么测的, 为什么没进表?
> 两个数都换了测法. GPQA 的 67.2% 用的是 「5-shot CoT ... with maj@32」: 给 5 个示例, 让模型写出推理过程, 同一道题采样 32 次, 取出现最多的答案. 这是在推理阶段多花算力换分数, 属于 TestingTime 投入; 表里的 59.4% 是 0-shot CoT 单次作答, 两者差 7.8 个百分点. MMLU 的 90.4% 用的是 「5-shot CoT prompting」, 比表里 5-shot 的 88.7% 高 1.7 个百分点, 比 0-shot CoT 的 88.3% 高 2.1 个百分点. 其他列都没有这两种设置下的分数, 放进表也没法横向比, 所以只进了脚注. 这样一来, 3.5 Sonnet 在 MMLU 上共有三个分数, GPQA 上有两个, 引用时要带上设置.

## State-of-the-art vision

## 业界领先的视觉能力

Claude 3.5 Sonnet is our strongest vision model yet, surpassing Claude 3 Opus on standard vision benchmarks. These step-change improvements are most noticeable for tasks that require visual reasoning, like interpreting charts and graphs. Claude 3.5 Sonnet can also accurately transcribe text from imperfect images—a core capability for retail, logistics, and financial services, where AI may glean more insights from an image, graphic or illustration than from text alone.

Claude 3.5 Sonnet 是我们迄今最强的视觉模型, 在标准视觉基准上超过 Claude 3 Opus. 这种跨越式的提升在需要视觉推理的任务上最为明显, 比如解读各类图表. Claude 3.5 Sonnet 还能从有瑕疵的图片里准确转写文字. 这是零售, 物流和金融服务业的核心能力: 在这些行业里, AI 从一张图片, 图形或插图中得到的信息, 可能比单看文本还多.

> **想:** 正文说视觉提升 「most noticeable for tasks that require visual reasoning, like interpreting charts and graphs」, 下一页的表里图表类提升最大吗?
> 不完全是. 用 3.5 Sonnet 减 Claude 3 Opus: MathVista 从 50.5% 到 67.7%, 提高 17.2 个百分点; Chart Q&A 从 80.8% 到 90.8%, 提高 10.0; MMMU 从 59.4% 到 68.3%, 提高 8.9; AI2D 从 88.1% 到 94.7%, 提高 6.6; 文档视觉问答从 89.3% 到 95.2%, 提高 5.9. 提升最大的是视觉数学推理 MathVista, 图表问答排第二, 两者都算 「visual reasoning」, 和正文说法大体吻合. 正文另一个卖点 「transcribe text from imperfect images」, 表里没有专门的转写评测, 最接近的是文档视觉问答, 但它的行名是 「Q&A」, 测的是看文档答题, 不是逐字转写. 零售, 物流, 金融服务三个行业也只是用途举例, 没有配数据.

<!-- page 4 of 10 -->

|  | Claude 3.5 Sonnet | Claude 3 Opus | GPT-4o | Gemini 1.5 Pro |
| --- | --- | --- | --- | --- |
| Visual math reasoningMathVista (testmini) | 67.7%0-shot CoT | 50.5%0-shot CoT | 63.8%0-shot CoT | 63.9%0-shot CoT |
| Science diagramsAI2D, test | 94.7%0-shot | 88.1%0-shot | 94.2%0-shot | 94.4%0-shot |
| Visual question answeringMMMU (val) | 68.3%0-shot CoT | 59.4%0-shot CoT | 69.1%0-shot CoT | 62.2%0-shot CoT |
| Chart Q&amp;ARelaxed accuracy (test) | 90.8%0-shot CoT | 80.8%0-shot CoT | 85.7%0-shot CoT | 87.2%0-shot CoT |
| Document visual Q&amp;AANLS score, test | 95.2%0-shot | 89.3%0-shot | 92.8%0-shot | 93.1%0-shot |

|  | Claude 3.5 Sonnet | Claude 3 Opus | GPT-4o | Gemini 1.5 Pro |
| --- | --- | --- | --- | --- |
| 视觉数学推理 MathVista (testmini) | 67.7% (0-shot CoT) | 50.5% (0-shot CoT) | 63.8% (0-shot CoT) | 63.9% (0-shot CoT) |
| 科学图示 AI2D, test | 94.7% (0-shot) | 88.1% (0-shot) | 94.2% (0-shot) | 94.4% (0-shot) |
| 视觉问答 MMMU (val) | 68.3% (0-shot CoT) | 59.4% (0-shot CoT) | 69.1% (0-shot CoT) | 62.2% (0-shot CoT) |
| 图表问答 Chart Q&A, Relaxed accuracy (test) | 90.8% (0-shot CoT) | 80.8% (0-shot CoT) | 85.7% (0-shot CoT) | 87.2% (0-shot CoT) |
| 文档视觉问答 Document visual Q&A, ANLS score, test | 95.2% (0-shot) | 89.3% (0-shot) | 92.8% (0-shot) | 93.1% (0-shot) |

> **看表:** 小节标题是 「State-of-the-art vision」, 表里五项 3.5 Sonnet 都是第一吗?
> 四项是, 一项不是. MMMU (val) 上 GPT-4o 为 69.1%, 比 3.5 Sonnet 的 68.3% 高 0.8 个百分点, PDF 原图把 GPT-4o 这一格印成了绿色. 其余四项, 3.5 Sonnet 对第二名的领先幅度差别很大: MathVista 领先 Gemini 1.5 Pro 3.8 个百分点, Chart Q&A 领先 Gemini 3.6, 文档视觉问答领先 Gemini 2.1, AI2D 只领先 Gemini 0.3. 正文原话是 「our strongest vision model yet, surpassing Claude 3 Opus」, 比较对象是自家前代: 对 Opus 五项全胜, 对别家并非如此. 各行度量也不统一, Chart Q&A 用 「Relaxed accuracy」, 文档问答用 「ANLS score」, 表里都写成百分数, 页面没有解释这两种度量. 这张表和上一张一样, 在 PDF 里是图片, md 转成了文字.

## Artifacts—a new way to use Claude

## Artifacts: 使用 Claude 的新方式

Today, we’re also introducing Artifacts on Claude.ai, a new feature that expands how users can interact with Claude. When a user asks Claude to generate content like code snippets, text documents, or website designs, these Artifacts appear in a dedicated window alongside their conversation. This creates a dynamic workspace where they can see, edit, and build upon Claude’s creations in real-time, seamlessly integrating AI-generated content into their projects and workflows.

今天我们还在 Claude.ai 上推出 Artifacts, 这项新功能拓宽了用户与 Claude 交互的方式. 用户让 Claude 生成代码片段, 文本文档或网站设计这类内容时, 这些 Artifacts 会出现在对话旁边的一个专用窗口里. 这样就有了一个动态的工作区, 用户可以实时查看, 编辑 Claude 的产出, 并在此基础上继续搭建, 把 AI 生成的内容顺畅地纳入自己的项目和工作流.

This preview feature marks Claude’s evolution from a conversational AI to a collaborative work environment. It’s just the beginning of a broader vision for Claude.ai, which will soon expand to support team collaboration. In the near future, teams—and eventually entire organizations—will be able to securely centralize their knowledge, documents, and ongoing work in one shared space, with Claude serving as an on-demand teammate.

这项预览功能标志着 Claude 从对话式 AI 走向协作式的工作环境. 这只是 Claude.ai 更大构想的开端, 它很快会扩展到支持团队协作. 不久之后, 团队乃至整个组织都能把知识, 文档和手头的工作安全地集中到一个共享空间里, Claude 则是随叫随到的队友.

> **问:** Artifacts 是模型的新能力, 还是 Claude.ai 的界面功能?
> 按本页的写法是界面功能. 原文是 「introducing Artifacts on Claude.ai, a new feature」, 描述的是生成的代码片段, 文本文档, 网站设计 「appear in a dedicated window alongside their conversation」, 用户在这个窗口里查看, 编辑, 接着改. 全段没有提到 API, 也没有评测数字, 并自称 「preview feature」. 第二段写的是后续规划: 团队协作, 组织把知识和文档集中到共享空间, 用的是 「will soon」, 「In the near future」 这类将来时, 发布当天并未上线. 所以这一小节不影响对模型本身能力的判断, 能力证据仍是前面两张表和内部编码评测.

## Commitment to safety and privacy

## 对安全与隐私的承诺

Our models are subjected to rigorous testing and have been trained to reduce misuse. Despite Claude 3.5 Sonnet’s leap in intelligence, our red teaming assessments have concluded that Claude 3.5 Sonnet remains at [ASL-2](https://www.anthropic.com/news/anthropics-responsible-scaling-policy). More details can be found in the [model card addendum](https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf).

我们的模型都经过严格测试, 并通过训练减少被滥用的可能. 尽管 Claude 3.5 Sonnet 的智能有了飞跃, 我们的红队评估结论是它仍处于 [ASL-2](https://www.anthropic.com/news/anthropics-responsible-scaling-policy). 更多细节见 [模型卡增补](https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf).

> **回看:** 「remains at ASL-2」 这个结论, 本页给了哪些依据?
> 只有一句结论和两个链接. 原文是 「our red teaming assessments have concluded that Claude 3.5 Sonnet remains at ASL-2」, 依据是红队评估, 具体测了什么, 结果多少, 本页没写. 「remains」 表示沿用此前模型的等级, 前半句 「Despite Claude 3.5 Sonnet's leap in intelligence」 又承认能力上了台阶, 合起来是说: 能力提升之后, 红队评估认为它还没到下一个等级. ASL-2 链接指向 Responsible Scaling Policy 的介绍页, 等级标准在那里. 「model card addendum」 链接和第 2 页内部 agentic 编码评测用的是同一个地址 (Model_Card_Claude_3_Addendum.pdf), 安全细节和编码评测细节都要去这一份文件里找, 本目录没有这份文件.

As part of our commitment to safety and transparency, we’ve engaged with external experts to test and refine the safety mechanisms within this latest model. We recently

<!-- page 5 of 10 -->

provided Claude 3.5 Sonnet to the UK’s Artificial Intelligence Safety Institute (UK AISI) for pre-deployment safety evaluation. The UK AISI completed tests of 3.5 Sonnet and shared their results with the US AI Safety Institute (US AISI) as part of a Memorandum of Understanding, made possible by the partnership between the US and UK AISIs [announced earlier this year](https://www.commerce.gov/news/press-releases/2024/04/us-and-uk-announce-partnership-science-ai-safety).

作为对安全与透明的承诺的一部分, 我们请外部专家测试并完善这款最新模型的安全机制. 我们最近把 Claude 3.5 Sonnet 交给英国人工智能安全研究所 (UK AISI) 做部署前安全评估. UK AISI 完成了对 3.5 Sonnet 的测试, 并按一份谅解备忘录把结果分享给美国 AI 安全研究所 (US AISI); 这份备忘录得以签署, 靠的是美英两国 AISI [今年早些时候宣布](https://www.commerce.gov/news/press-releases/2024/04/us-and-uk-announce-partnership-science-ai-safety) 的合作关系.

We have integrated policy feedback from outside subject matter experts to ensure that our evaluations are robust and take into account new trends in abuse. This engagement has helped our teams scale up our ability to evaluate 3.5 Sonnet against various types of misuse. For example, we used feedback from child safety experts at [Thorn](https://www.thorn.org/) to update our classifiers and fine-tune our models.

我们吸收了外部领域专家的政策反馈, 确保评估足够稳健, 并考虑到滥用的新动向. 这些合作帮助团队扩大了针对各类滥用评估 3.5 Sonnet 的能力. 例如, 我们根据 [Thorn](https://www.thorn.org/) 儿童安全专家的反馈更新了分类器, 并对模型做了微调.

> **停一下:** UK AISI 的部署前测试, 结果是什么?
> 本页没有公开. 原文只说 UK AISI "completed tests of 3.5 Sonnet and shared their results with the US AI Safety Institute (US AISI) as part of a Memorandum of Understanding「, 即测试做完, 结果按两国 AISI 的谅解备忘录转给了美方; 测了哪些方面, 结论如何, 都没写. 紧接的这一段同样是过程描述: 吸收外部专家的政策反馈, 以及根据 Thorn 儿童安全专家的反馈 」update our classifiers and fine-tune our models". 这句话同时动了两处, 部署侧的分类器和模型本身, 但没有给出分类器的指标, 也没有微调前后的对比. 这两段能确认的是做了哪些事, 效果如何要看模型卡增补.

One of the core constitutional principles that guides ourAI model development is privacy. We do not train our generative models on user-submitted data unless a user gives us explicit permission to do so.

指导我们 AI 模型开发的核心宪法原则之一是隐私. 除非用户明确授权, 我们不会用用户提交的数据训练生成式模型.

> **对一下:** 这句 「We do not train our generative models on user-submitted data unless a user gives us explicit permission」 和页首那条 2025 年 8 月 28 日的条款更新是什么关系?
> 本页没有说明. 隐私这句是 2024 年 6 月正文的原话, 前提是 「explicit permission」. 页首的 「UPDATE Consumer Terms and Privacy Policy Aug 28, 2025」 只是一行横幅, md 和 PDF 都没有展开它的内容. 所以从这份材料判断不了 2025 年的更新有没有改动这条承诺, 要看页脚 「Privacy policy」 和 「Terms of service: Consumer」 两个链接指向的现行文本. 另有一处转换问题: md 的 「ourAI model development」 丢了空格, PDF 原文是 「our AI model development」.

## Coming soon

## 即将推出

Our aim is to substantially improve the tradeoff curve between intelligence, speed, and cost every few months. To complete the Claude 3.5 model family, we’ll be releasing Claude 3.5 Haiku and Claude 3.5 Opus later this year.

我们的目标是每隔几个月就大幅改善智能, 速度与成本之间的权衡曲线. 为补齐 Claude 3.5 模型家族, 我们将在今年晚些时候发布 Claude 3.5 Haiku 和 Claude 3.5 Opus.

> **再看:** 「improve the tradeoff curve between intelligence, speed, and cost」 和第 2 页那张示意图是一回事吗?
> 可以对照着看, 但图只画了两维. 示意图里那条浅色虚线连着 Claude 3 Haiku, 3 Sonnet, 3 Opus, 就是上一代的智能-成本曲线, 3.5 Sonnet 落在曲线上方. 这句话多了 「speed」 一维, 图上没有. 后续计划方面, Claude 3.5 Haiku 和 Claude 3.5 Opus 写的是 「later this year」, 没有具体日期, 也没有预期价格或分数. 「every few months」 是节奏目标, 本页没有给出衡量曲线改善多少的方法. 这一小节全是规划, 没有可核对的数字.

In addition to working on our next-generation model family, we are developing new modalities and features to support more use cases for businesses, including integrations with enterprise applications. Our team is also exploring features like Memory, which will enable Claude to remember a user’s preferences and interaction history as specified, making their experience even more personalized and efficient.

除了研发下一代模型家族, 我们还在开发新的模态和功能, 以支持更多企业用例, 包括与企业应用的集成. 团队也在探索 Memory 这类功能: 它能让 Claude 按用户的指定记住其偏好和交互历史, 让体验更个性化, 也更高效.

We’re constantly working to improve Claude and love hearing from our users. You can submit feedback on Claude 3.5 Sonnet directly in-product to inform our development roadmap and help our teams to improve your experience. As always, we look forward to seeing what you build, create, and discover with Claude.

我们一直在改进 Claude, 也很乐意听到用户的声音. 你可以直接在产品里提交对 Claude 3.5 Sonnet 的反馈, 帮我们确定开发路线, 改进你的使用体验. 一如既往, 我们期待看到你用 Claude 搭建, 创作和发现的东西.

X

X (分享按钮的抓取残留, 无对应正文)

<!-- page 6 of 10 -->

![Image block](images/p06-image.png)

![Image block](images/p06-related-content.png)

## Related content

## 相关内容

### Claude discovers a novel enzyme system with CRISPR-like repeats

### Claude 发现一种带有类 CRISPR 重复序列的新型酶系统

We’re announcing a new life sciences research group and laboratory at Anthropic. This post introduces the team behind this work and shares early results in which Claude discovered a novel enzyme system with properties reminiscent of CRISPR, with only high-level direction from our scientists.

我们宣布在 Anthropic 成立新的生命科学研究组和实验室. 本文介绍这项工作背后的团队, 并分享早期成果: 在科学家只给出高层方向的情况下, Claude 发现了一种特性让人联想到 CRISPR 的新型酶系统.

[Read more](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

[阅读全文](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

### Partnering with Accenture on embedded evaluation

### 与 Accenture 合作开展嵌入式评估

[Read more](https://www.anthropic.com/news/accenture-embedded-evaluation)

[阅读全文](https://www.anthropic.com/news/accenture-embedded-evaluation)

### Introducing the Life Sciences Verification Program

### 推出生命科学验证计划

The Life Sciences Verification Program (LSVP) gives life science professionals access to Claude Mythos, Opus, and Sonnet models with a refined set of safeguards more permissive for biology-related work.

生命科学验证计划 (LSVP) 让生命科学从业者可以使用 Claude Mythos, Opus 和 Sonnet 模型, 并配以一套经过细化, 对生物相关工作更宽松的安全防护.

[Read more](https://www.anthropic.com/news/life-sciences-verification-program)

[阅读全文](https://www.anthropic.com/news/life-sciences-verification-program)

Products

产品

[Claude](https://claude.com/product/overview)

[Claude](https://claude.com/product/overview)

[Claude Code](https://claude.com/product/claude-code)

[Claude Code](https://claude.com/product/claude-code)

[Claude Code Enterprise](https://claude.com/product/claude-code/enterprise)

[Claude Code 企业版](https://claude.com/product/claude-code/enterprise)

[Claude Cowork](https://claude.com/product/cowork)

[Claude Cowork](https://claude.com/product/cowork)

[@Claude](https://claude.com/product/tag)

[@Claude](https://claude.com/product/tag)

[Claude Design](https://claude.com/product/design)

[Claude Design](https://claude.com/product/design)

[Claude Science](https://claude.com/product/claude-science)

[Claude Science](https://claude.com/product/claude-science)

[Claude Security](https://claude.com/product/claude-security)

[Claude Security](https://claude.com/product/claude-security)

[Claude in Chrome](https://claude.com/claude-in-chrome)

[Chrome 中的 Claude](https://claude.com/claude-in-chrome)

![Image block](images/p06-claude-for-microsoft-365-https-claude-com-claude-for.png)

<!-- page 7 of 10 -->

[Claude for Microsoft 365](https://claude.com/claude-for-microsoft-365)

[面向 Microsoft 365 的 Claude](https://claude.com/claude-for-microsoft-365)

[Skills](https://www.claude.com/skills)

[Skills (技能)](https://www.claude.com/skills)

[Download app](https://claude.ai/download)

[下载应用](https://claude.ai/download)

[Pricing](https://claude.com/pricing)

[价格](https://claude.com/pricing)

[Log in to Claude](https://claude.ai/)

[登录 Claude](https://claude.ai/)

Models

模型

[Mythos](https://www.anthropic.com/claude/mythos)

[Mythos](https://www.anthropic.com/claude/mythos)

[Fable](https://www.anthropic.com/claude/fable)

[Fable](https://www.anthropic.com/claude/fable)

[Opus](https://www.anthropic.com/claude/opus)

[Opus](https://www.anthropic.com/claude/opus)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Haiku](https://www.anthropic.com/claude/haiku)

[Haiku](https://www.anthropic.com/claude/haiku)

Solutions

解决方案

[AI agents](https://claude.com/solutions/agents)

[AI agent](https://claude.com/solutions/agents)

[Code modernization](https://claude.com/solutions/code-modernization)

[代码现代化](https://claude.com/solutions/code-modernization)

[Coding](https://claude.com/solutions/coding)

[编程](https://claude.com/solutions/coding)

[Commerce](https://claude.com/solutions/commerce)

[商业](https://claude.com/solutions/commerce)

[Customer support](https://claude.com/solutions/customer-support)

[客户支持](https://claude.com/solutions/customer-support)

[Cybersecurity](https://claude.com/solutions/cybersecurity)

[网络安全](https://claude.com/solutions/cybersecurity)

[Enterprise](https://claude.com/solutions/enterprise)

[企业](https://claude.com/solutions/enterprise)

[Financial services](https://claude.com/solutions/financial-services)

[金融服务](https://claude.com/solutions/financial-services)

[Government](https://claude.com/solutions/government)

[政府](https://claude.com/solutions/government)

[Healthcare](https://claude.com/solutions/healthcare)

[医疗健康](https://claude.com/solutions/healthcare)

[Higher education](https://claude.com/solutions/education)

[高等教育](https://claude.com/solutions/education)

[K-12 teachers](https://claude.com/solutions/teachers)

[K-12 教师](https://claude.com/solutions/teachers)

[Legal](https://claude.com/solutions/legal)

[法律](https://claude.com/solutions/legal)

[Life sciences](https://claude.com/solutions/life-sciences)

[生命科学](https://claude.com/solutions/life-sciences)

[Nonprofits](https://claude.com/solutions/nonprofits)

[非营利组织](https://claude.com/solutions/nonprofits)

[Sales](https://claude.com/solutions/sales)

[销售](https://claude.com/solutions/sales)

<!-- page 8 of 10 -->

## [Small business](https://claude.com/solutions/small-business)

## [小型企业](https://claude.com/solutions/small-business)

Claude Platform

Claude 平台

[Overview](https://claude.com/platform/api)

[概览](https://claude.com/platform/api)

[Developer docs](https://platform.claude.com/docs)

[开发者文档](https://platform.claude.com/docs)

[Pricing](https://claude.com/pricing#api)

[价格](https://claude.com/pricing#api)

[Ecosystem](https://claude.com/ecosystem)

[生态](https://claude.com/ecosystem)

[Marketplace](https://claude.com/platform/marketplace)

[市场](https://claude.com/platform/marketplace)

[Regional compliance](https://claude.com/regional-compliance)

[区域合规](https://claude.com/regional-compliance)

[Claude on AWS](https://claude.com/partners/claude-on-aws)

[AWS 上的 Claude](https://claude.com/partners/claude-on-aws)

[Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

[Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

[Microsoft Foundry](https://claude.com/partners/microsoft-foundry)

[Microsoft Foundry](https://claude.com/partners/microsoft-foundry)

[Console login](https://platform.claude.com/)

[控制台登录](https://platform.claude.com/)

Resources

资源

[Blog](https://claude.com/blog)

[博客](https://claude.com/blog)

[Claude partner network](https://claude.com/partners)

[Claude 合作伙伴网络](https://claude.com/partners)

[Community](https://claude.com/community)

[社区](https://claude.com/community)

[Connectors](https://claude.com/connectors)

[连接器](https://claude.com/connectors)

[Courses](https://academy.claude.com/)

[课程](https://academy.claude.com/)

[Customer stories](https://claude.com/customers)

[客户案例](https://claude.com/customers)

[Developer blog](https://claude.dev/)

[开发者博客](https://claude.dev/)

[Engineering at Anthropic](https://www.anthropic.com/engineering)

[Anthropic 工程博客](https://www.anthropic.com/engineering)

[Events](https://www.anthropic.com/events)

[活动](https://www.anthropic.com/events)

[Plugins](https://claude.com/plugins)

[插件](https://claude.com/plugins)

[Powered by Claude](https://claude.com/partners/powered-by-claude)

[Powered by Claude](https://claude.com/partners/powered-by-claude)

[Service partners](https://claude.com/partners/services)

[服务合作伙伴](https://claude.com/partners/services)

[Tutorials](https://claude.com/resources/tutorials)

[教程](https://claude.com/resources/tutorials)

[Use cases](https://claude.com/resources/use-cases)

[用例](https://claude.com/resources/use-cases)

Programs

计划

<!-- page 9 of 10 -->

[Startups](https://claude.com/programs/startups)

[初创企业](https://claude.com/programs/startups)

[Scientists](https://claude.com/programs/team-plan-for-scientists)

[科学家](https://claude.com/programs/team-plan-for-scientists)

Help and security

帮助与安全

[Availability](https://www.anthropic.com/supported-countries)

[可用地区](https://www.anthropic.com/supported-countries)

[Status](https://status.anthropic.com/)

[服务状态](https://status.anthropic.com/)

[Support center](https://support.claude.com/en/)

[支持中心](https://support.claude.com/en/)

Company

公司

[Anthropic](https://www.anthropic.com/company)

[Anthropic](https://www.anthropic.com/company)

[Careers](https://www.anthropic.com/careers)

[招聘](https://www.anthropic.com/careers)

[Leadership](https://www.anthropic.com/company/leadership)

[领导团队](https://www.anthropic.com/company/leadership)

[Policy](https://www.anthropic.com/policy)

[政策](https://www.anthropic.com/policy)

[Economic Futures](https://www.anthropic.com/economic-futures)

[经济未来](https://www.anthropic.com/economic-futures)

[Research](https://www.anthropic.com/research)

[研究](https://www.anthropic.com/research)

[News](https://www.anthropic.com/news)

[新闻](https://www.anthropic.com/news)

[Claude’s Constitution](https://www.anthropic.com/constitution)

[Claude 宪章](https://www.anthropic.com/constitution)

[Claude Corps](https://www.anthropic.com/claude-corps)

[Claude Corps](https://www.anthropic.com/claude-corps)

[Keep thinking](https://www.anthropic.com/path-to-hope)

[持续思考](https://www.anthropic.com/path-to-hope)

[Policy on the AI Exponential](https://www.anthropic.com/policy-on-the-ai-exponential)

[关于 AI 指数式发展的政策](https://www.anthropic.com/policy-on-the-ai-exponential)

[Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)

[负责任 Scaling 政策](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)

[Security and compliance](https://trust.anthropic.com/)

[安全与合规](https://trust.anthropic.com/)

[Transparency](https://www.anthropic.com/transparency)

[透明度](https://www.anthropic.com/transparency)

Terms and policies

条款与政策

[Privacy policy](https://www.anthropic.com/legal/privacy)

[隐私政策](https://www.anthropic.com/legal/privacy)

[Consumer health data privacy policy](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[消费者健康数据隐私政策](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)

[负责任披露政策](https://www.anthropic.com/responsible-disclosure-policy)

[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)

[服务条款: 商业版](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

[服务条款: 消费者版](https://www.anthropic.com/legal/consumer-terms)

[Terms of Service: US K-12](https://anthropic.com/legal/k12-terms)

[服务条款: 美国 K-12](https://anthropic.com/legal/k12-terms)

<!-- page 10 of 10 -->

[Data Processing Agreement: US K-12](https://anthropic.com/legal/k12-dpa)

[数据处理协议: 美国 K-12](https://anthropic.com/legal/k12-dpa)

[Usage policy](https://www.anthropic.com/legal/aup)

[使用政策](https://www.anthropic.com/legal/aup)

© 2026 Anthropic PBC

© 2026 Anthropic PBC

![Image block](images/p10-image.png)

> **核对:** 一篇 2024 年 6 月的公告, 页脚为什么是 © 2026, 还列着 Mythos 和 Fable?
> 因为这份 PDF 是 2026 年抓取的, 第 6 页起的 「Related content」 和整个站点页脚都是抓取当时的版本, 不是发布时的样子. 页脚 Models 一栏列了 Mythos, Fable, Opus, Sonnet, Haiku, 相关内容里的生命科学验证计划也提到 Claude Mythos, 这些与正文无关. 图片方面, 第 6 页两张三十来像素见方的小图 (p06-image.png 和 p06-related-content.png) 都是 「Read more」 旁的右箭头; p06-claude-for-microsoft-365 那张是页脚截图, 左上是 Anthropic 标志, 下面是 Products 列表, 文件名取自截图之后的第一行链接; 末尾的 p10-image.png 是 LinkedIn, X, YouTube 三个社交图标. 格式残留还有几处: 第 5 页末的 「X」 是分享按钮, 第 8 页开头的 「Small business」 被转成了二级标题, 第 1 页开头的 「AI」 是 Anthropic 标志被识别成的文字.
