---
title: "Claude 3 Haiku · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude 3 Haiku 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 8 -->

AI

AI（页面左上角 Anthropic 标志的抓取残留，PDF 正文里没有这两个字母）

# Announcements

# 公告

# Claude 3 Haiku: our fastest model yet

# Claude 3 Haiku：我们迄今最快的模型

Mar 13, 2024

2024 年 3 月 13 日

![Image block](images/p01-today-we-re-releasing-claude-3-haiku-the-fastest-and.png)

> **对一下：** 题图文件名取自正文第一句，图里画的是什么，本目录 5 张图各是什么？
> 题图是橙底上的一道白色闪电，闪电里是一组用黑线相连的黑色圆点，像一张网络图，呼应标题里的 「fastest」。文件名 「today-we-re-releasing-claude-3-haiku-the-fastest-and」 只是转换工具拿图下第一行文字起的名。5 张图里只有这一张有内容。第 4 页的 p04-image.png（395 字节）和 p04-related-content.png（415 字节）都是灰色右箭头，属于 「Read more」 链接的图标；p04-claude-for-microsoft-365-...png 是站点深色页脚的截图，上面只有 Anthropic 标志和 Products 一栏（从 Claude 到 Claude in Chrome）；p08-image.png 是 LinkedIn，X，YouTube 三个社交图标。第 2 页的评测表在 PDF 里是一张图，md 把它转成了文字表格，没有单独落图。

Today we’re releasing Claude 3 Haiku, the fastest and most affordable model in its intelligence class. With state-of-the-art vision capabilities and strong performance on industry benchmarks, Haiku is a versatile solution for a wide range of enterprise applications. The model is now available alongside Sonnet and Opus in the Claude API and on claude.ai for our Claude Pro subscribers.

今天我们发布 Claude 3 Haiku，它是同一智能档位里速度最快，价格最实惠的模型。Haiku 具备业界领先的视觉能力，在行业基准上表现强劲，能胜任各类企业应用。该模型现已与 Sonnet 和 Opus 一同在 Claude API 上提供，Claude Pro 订阅用户也可以在 claude.ai 上使用。

> **想：** 标题说 「our fastest model yet」，首句又说 「the fastest and most affordable model in its intelligence class」，两个 「最快」 比的是同一批对象吗？
> 不是。标题比的是 Anthropic 自家的模型，首句比的是其他厂商同一智能档位的模型。「intelligence class」 本页没有定义，唯一能推断档位的是第 2 页表格选的两列对手：GPT-3.5 和 Gemini 1.0 Pro。「most affordable」 能在表里核对：价格行里 Haiku 的输入和输出单价都低于这两家。「fastest」 这一半核对不了，表里没有速度行，正文的 21K token/s 只给了 Haiku 自己，对手的速度一个数都没有。同族目录的家族公告 `../claude-3/claude-3.md` 用了几乎一样的说法 「fastest and most cost-effective model on the market for its intelligence category」，同样没有对手的速度数据。

<!-- page 2 of 8 -->

|  | Claude 3 Haiku | GPT-3.5 | Gemini 1.0 Pro |
| --- | --- | --- | --- |
| Price Input / Output | $0.25 / $1.25 | $0.50 / $1.50 | $0.47 / $1.42 |
| Undergraduate level knowledge MMLU | 75.2% 5-shot | 70.0% 5-shot | 71.8% 5-shot |
| Graduate level reasoning GPQA, Diamond | 33.3% 0-shot CoT | 28.1% 0-shot CoT | - |
| Grade school math GSM8K | 88.9% 0-shot CoT | 57.1% 5-shot | 86.5% Maj1@32 |
| Math problem-solving MATH | 40.9% 4-shot | 34.1% 4-shot | 32.6% 4-shot |
| Multilingual math MGSM | 76.5% 8-shot | - | 63.5% 8-shot |
| Code HumanEval | 75.9% 0-shot | 48.1% 0-shot | 67.7% 0-shot |
| Reasoning over text DROP, F1 score | 78.4 3-shot | 64.1 3-shot | 74.1 Variable shots |
| Mixed evaluations BIG-Bench-Hard | 73.7% 3-shot CoT | 66.6% 3-shot CoT | 75.0% 3-shot CoT |
| Knowledge Q&amp;A ARC-Challenge | 89.2% 25-shot | 85.2% 25-shot | - |
| Common Knowledge HellaSwag | 85.9% 10-shot | 85.5% 10-shot | 84.7% 10-shot |
| Vision-enabled | ✔ | ⊗ | ✔ |

|  | Claude 3 Haiku | GPT-3.5 | Gemini 1.0 Pro |
| --- | --- | --- | --- |
| 价格 输入 / 输出 | \$0.25 / \$1.25 | \$0.50 / \$1.50 | \$0.47 / \$1.42 |
| 本科水平知识 MMLU | 75.2% (5-shot) | 70.0% (5-shot) | 71.8% (5-shot) |
| 研究生水平推理 GPQA, Diamond | 33.3% (0-shot CoT) | 28.1% (0-shot CoT) | - |
| 小学数学 GSM8K | 88.9% (0-shot CoT) | 57.1% (5-shot) | 86.5% (Maj1@32) |
| 数学解题 MATH | 40.9% (4-shot) | 34.1% (4-shot) | 32.6% (4-shot) |
| 多语言数学 MGSM | 76.5% (8-shot) | - | 63.5% (8-shot) |
| 代码 HumanEval | 75.9% (0-shot) | 48.1% (0-shot) | 67.7% (0-shot) |
| 文本推理 DROP，F1 分数 | 78.4 (3-shot) | 64.1 (3-shot) | 74.1（示例数不固定） |
| 综合评测 BIG-Bench-Hard | 73.7% (3-shot CoT) | 66.6% (3-shot CoT) | 75.0% (3-shot CoT) |
| 知识问答 ARC-Challenge | 89.2% (25-shot) | 85.2% (25-shot) | - |
| 常识 HellaSwag | 85.9% (10-shot) | 85.5% (10-shot) | 84.7% (10-shot) |
| 支持视觉输入 | ✔ | ⊗ | ✔ |

> **看表：** 三列的提示设置并不统一，哪几行才是同条件下的比较，Haiku 在这些行里领先多少？
> 三列设置完全相同的只有五行：MMLU (5-shot), MATH (4-shot), HumanEval (0-shot), BIG-Bench-Hard (3-shot CoT), HellaSwag (10-shot)。这五行里 Haiku 赢四行，对第二名的领先分别是 MMLU 3.4，MATH 6.8，HumanEval 8.2，HellaSwag 0.4 个百分点；输掉的一行是 BIG-Bench-Hard，比 Gemini 1.0 Pro 低 1.3 个百分点。其余六行都缺条件：GPQA 和 ARC-Challenge 没有 Gemini 的分数，MGSM 没有 GPT-3.5 的分数，DROP 里 Gemini 是 「Variable shots」，GSM8K 三列三种设置。PDF 第 2 页的原图给 Haiku 一列加了橙色框，每行最高分用绿字标出，绿字只有 BIG-Bench-Hard 一行落在 Gemini 1.0 Pro 的 75.0% 上，价格行和视觉行不标色。md 转换把框和颜色都丢了，只剩数字。

> **回看：** 同一个 Claude 3 Haiku，这张表和 3 月 4 日家族公告里的分数一样吗？
> 大部分一样，有两格不同。同族目录 `../claude-3/claude-3.md` 第 3 页的大表里，Haiku 的 MATH 是 38.9% 0-shot CoT，MGSM 是 75.1% 0-shot；本页换成了 MATH 40.9% 4-shot, MGSM 76.5% 8-shot。其余八项 Haiku 分数，以及 GPT-3.5 和 Gemini 1.0 Pro 两列的全部分数，两页逐格相同。换掉的两格都改用了对手那一列的 shot 数：MATH 与 GPT-3.5，Gemini 1.0 Pro 一样用 4-shot，MGSM 与 Gemini 1.0 Pro 一样用 8-shot。这样 MATH 一行成了三列同条件，两格分数也分别高了 2.0 和 1.4 个百分点。本页没有解释为什么换设置，也没说两套数字哪套是主口径。

> **拆开：** GSM8K 一行三列三种设置，Maj1@32 是什么，这行的差距该怎么读？
> Haiku 是 0-shot CoT，GPT-3.5 是 5-shot，Gemini 1.0 Pro 是 Maj1@32。本页没解释 Maj1@32，这个记法通常指同一道题采样 32 次，取多数票作答，属于 TestingTime 投入：推理时多花约 32 倍的生成算力换准确率。照这个读法，Haiku 用单次 0-shot CoT 拿到 88.9%，高于 Gemini 多数票的 86.5%，设置上并没占便宜。反过来，它与 GPT-3.5 之间 31.8 个百分点的差距里混着有无 CoT 的差别，GPT-3.5 那格只写了 「5-shot」。顺带一提，DROP 一行没有百分号，因为它报的是 F1 分数；Gemini 的 「Variable shots」 也没说具体用了几个示例。

> **确认：** 首句说 「state-of-the-art vision capabilities」，这张表撑得住吗？
> 撑不住。表里和视觉有关的只有最后一行 「Vision-enabled」：Haiku 与 Gemini 1.0 Pro 打勾，GPT-3.5 是 ⊗，只说明能不能接收图像，没有任何视觉评测分数。本页关于图像的其余信息都在脚注里：[3] 说每张图约 1.6K token，[1] 说处理图像可能有额外延迟。视觉分数要去家族公告 `../claude-3/claude-3.md` 第 4 页的 「Strong vision capabilities」 表，那里 Haiku 有 MMMU (val) 50.2%，AI2D 86.7% 等五项。「state-of-the-art」 这个判断只能在那张表里核对，本页给不出依据。

Speed is essential for our enterprise users who need to quickly analyze large datasets and generate timely output for tasks like customer support. Claude 3 Haiku is three times faster than its peers for the vast majority of workloads, processing 21K tokens (\~30 pages) per second for prompts under 32K tokens [1]. It also generates swift output, enabling responsive, engaging chat experiences and the execution of many small tasks in tandem.

速度对企业用户至关重要，他们需要快速分析大型数据集，并为客户支持这类任务及时给出输出。在绝大多数工作负载下，Claude 3 Haiku 比同类模型快三倍：对 32K token 以内的提示，它每秒能处理 21K token（\~30 页）[1]。它的输出生成也很快，能支撑响应及时，让人愿意聊下去的对话体验，也能同时执行许多小任务。

> **问：** 「processing 21K tokens (\~30 pages) per second」 量的是读提示还是写输出？
> 是读提示。这句的限定语是 「for prompts under 32K tokens」，脚注 [1] 又把同一件事叫作 「ingestion speeds」，即模型吃进输入的速度，对应推理里的 prefill 阶段：整段提示可以并行过一遍网络。输出走的是逐 token 生成的 decode 阶段，速度通常低得多，本页只说 「swift output」，没给数。括号里的换算可以反推页面密度：21K / 30 约合每页 700 token。照这个速度，一段接近 32K 的提示约 1.5 秒读完。家族公告说 Haiku 读一篇约 10k token，带图表的 arXiv 论文不到三秒，那句含图，口径和这里的纯提示吞吐不同，两个数不能互相换算。

> **停一下：** 「three times faster than its peers」 的 peers 是谁，比的是哪个指标？
> 本页都没说。表里的两列对手 GPT-3.5 和 Gemini 1.0 Pro 最像 peers，可表里没有速度行，全页也没有任何对手的 token/s. 指标同样不明：这半句紧挨着 21K token/s，读起来像是 prefill 吞吐，但下一句 「It also generates swift output」 另起一句讲输出，3 倍是否包括输出没有交代。另外还有两层限定。「for the vast majority of workloads」 说明存在例外，脚注 [1] 点出了其中两类：超过 32K 的提示和带图像的请求。「the execution of many small tasks in tandem」 讲的是并发跑多个小任务，同样没有并发数或总吞吐。

Haiku's pricing model, with a 1:5 input-to-output token ratio, was designed for enterprise workloads which often involve longer prompts. Businesses can rely on Haiku to quickly analyze large volumes of documents, such as quarterly filings, contracts, or legal cases, for half the cost of other models in its performance tier. For instance, Claude 3 Haiku can process and analyze 400 Supreme Court cases [2] or 2,500 images [3] for just one US dollar.

Haiku 的定价按输入，输出 token 1:5 计价，这是为常带较长提示的企业工作负载设计的。企业可以用 Haiku 快速分析季度财报，合同，法律案例这类大批量文档，成本只有同性能档其他模型的一半。例如，只花 1 美元，Claude 3 Haiku 就能处理并分析 400 份美国最高法院判例 [2] 或 2,500 张图像 [3]。

> **再看：** 「1:5 input-to-output token ratio」 和 「half the cost」 放在一起，半价在什么条件下成立？
> 1:5 说的是单价比，不是 token 数量比：表里 Haiku 输入 \$0.25，输出 \$1.25，正好 1:5；GPT-3.5 是 \$0.50 对 \$1.50，Gemini 1.0 Pro 是 \$0.47 对 \$1.42，都约 1:3。逐项看，只有输入单价是 GPT-3.5 的一半，约为 Gemini 的 53%；输出单价约为 GPT-3.5 的 83%，Gemini 的 88%。所以 「half the cost」 只在输入占绝大多数时才接近成立。按每百万 token 单价（单位的来历见脚注 [3] 之后）算：输入 10M 加输出 1M，Haiku 花 \$3.75，GPT-3.5 花 \$6.50，约 58%；输入，输出各 1M 时是 \$1.50 对 \$2.00，即 75%。输入越长，越接近一半。这就是段首 「designed for enterprise workloads which often involve longer prompts」 的意思：把输入价压低，长文档分析这类场景受益最多。

<!-- page 3 of 8 -->

Alongside its speed and affordability, Claude 3 Haiku prioritizes enterprise-grade security and robustness. We conduct rigorous testing to reduce the likelihood of harmful outputs and jailbreaks of our models so they are as safe as possible. Additional layers of defense include continuous systems monitoring, endpoint hardening, secure coding practices, strong data encryption protocols, and stringent access controls to protect sensitive data. We also conduct regular security audits and work with experienced penetration testers to proactively identify and address vulnerabilities. More information about these measures can be found in the [Claude 3 model card](https://www.anthropic.com/claude-3-model-card).

除了速度快，价格低，Claude 3 Haiku 也把企业级的安全性和稳健性放在首位。我们开展严格测试，降低模型产生有害输出和被越狱的可能，让模型尽可能安全。额外的防护层还包括：持续的系统监控，终端加固，安全编码规范，高强度的数据加密协议，以及严格的访问控制，用来保护敏感数据。我们还定期做安全审计，并与经验丰富的渗透测试人员合作，主动发现并修补漏洞。这些措施的更多信息见 [Claude 3 模型卡](https://www.anthropic.com/claude-3-model-card)。

> **拆开：** 这一段列了一长串安全措施，哪些针对模型行为，哪些针对系统？
> 只有第二句针对模型本身：「rigorous testing to reduce the likelihood of harmful outputs and jailbreaks」。后面的 「Additional layers of defense」 全是基础设施层的做法：持续系统监控，终端加固，安全编码，数据加密，访问控制，定期安全审计，渗透测试。它们保护的是服务和客户数据，管不到模型输出什么。两类措施都没有数字：没有越狱成功率，没有有害输出比例，也没有测试集名称。段末把细节指向 Claude 3 model card 的链接。家族公告 `../claude-3/claude-3.md` 第 7 页给过整个 Claude 3 家族的结论，按 Responsible Scaling Policy 仍处在 ASL-2，那是家族层面的判断，不是给 Haiku 单独做的评估。

Starting today, customers can use Claude 3 Haiku through our[API](https://www.anthropic.com/api) or with a Claude Pro subscription on claude.ai. Claude 3 Haiku is available on Amazon Bedrock and will be coming soon to Google Cloud Vertex AI.

从今天起，客户可以通过我们的 [API](https://www.anthropic.com/api) 使用 Claude 3 Haiku，也可以订阅 Claude Pro 在 claude.ai 上使用。Claude 3 Haiku 已上线 Amazon Bedrock，不久也将登陆 Google Cloud Vertex AI。

> **核对：** 上线渠道和 3 月 4 日的家族公告比，有什么变化？
> 家族公告写的是 「Haiku will be available soon」，并说 Sonnet 已上 Amazon Bedrock，在 Vertex AI Model Garden 私测，「with Opus and Haiku coming soon to both」。到本页的 3 月 13 日，Haiku 已经上了 Claude API，claude.ai 和 Amazon Bedrock，Vertex AI 仍是 「coming soon」。claude.ai 上限 Claude Pro 订阅用户使用，首段和这一段说法一致；家族公告里 claude.ai 免费档用的是 Sonnet。本页没给 API 的模型标识，也没给上下文长度，200K 的上下文窗口只出现在家族公告的 Model details 里。

## Footnotes

## 脚注

[1] Prompts containing over 32K tokens may experience 30-60% slower ingestion speeds, which we expect to improve in the coming weeks. Customers may also experience additional latency when processing images.

[1] 超过 32K token 的提示，读入速度可能慢 30-60%，我们预计未来几周会有改善。处理图像时，客户也可能遇到额外延迟。

> **停一下：** 超过 32K 的提示 「30-60% slower」，折算下来还有多快？
> 把 「30-60% slower」 读成吞吐下降 30% 到 60%，就是 21K 的 70% 到 40%，约每秒 14.7K 到 8.4K token。这是按字面算的区间，页面没给慢下来之后的绝对数。32K 这条线也值得留意：家族公告写 Claude 3 上线时上下文窗口是 200K，也就是说 32K 到 200K 之间的长提示都不在 21K token/s 的范围内，而正文推荐的季度财报，合同这类长文档恰好容易越线。脚注还写了 「which we expect to improve in the coming weeks」，所以这里的速度只代表 3 月 13 日发布时的状态。图像只说 「additional latency」，没有量。

[2] Each Supreme Court case is estimated at 10K tokens each. [Source](https://www.supremecourt.gov/opinions/slipopinion/23).

[2] 每份最高法院判例按约 10K token 估算。[来源](https://www.supremecourt.gov/opinions/slipopinion/23)。

[3] Each image is estimated at 1.6K tokens.

[3] 每张图像按约 1.6K token 估算。

> **回看：** 「400 Supreme Court cases or 2,500 images for just one US dollar」 用脚注能算回去吗，表里的价格单位是什么？
> 能算回去。400 份 × 每份 10K token = 4M token；2,500 张 × 每张 1.6K token = 4M token。两个例子都是 4M 输入 token，按输入单价 \$0.25 正好 1 美元，说明价格行的单位是每百万 token。本页表格没写单位，家族公告的 Model details 写明了 「Input \$/million tokens | Output \$/million tokens」，Haiku 为 \$0.25 | \$1.25，两边对得上。这笔计算只算了输入。原句是 「process and analyze」，分析结果要按输出单价 \$1.25 另算：假设每份判例让模型写 500 token 的摘要，400 份共 200K 输出 token，再加 \$0.25，总价就是 \$1.25。另外每份 10K token 都低于 32K，这个例子正好落在脚注 [1] 的全速区间里。

Xm

Xm（PDF 第 3 页末 X 与 LinkedIn 两个分享图标的抓取残留，无对应正文）

<!-- page 4 of 8 -->

![Image block](images/p04-image.png)

![Image block](images/p04-related-content.png)

## Related content

## 相关内容

### Claude discovers a novel enzyme system with CRISPR-like repeats

### Claude 发现一种带有类 CRISPR 重复序列的新型酶系统

We’re announcing a new life sciences research group and laboratory at Anthropic. This post introduces the team behind this work and shares early results in which Claude discovered a novel enzyme system with properties reminiscent of CRISPR, with only high-level direction from our scientists.

我们宣布在 Anthropic 成立新的生命科学研究组和实验室。本文介绍这项工作背后的团队，并分享早期成果：在科学家只给出高层方向的情况下，Claude 发现了一种特性让人联想到 CRISPR 的新型酶系统。

[Read more](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

[阅读全文](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

### Partnering with Accenture on embedded evaluation

### 与 Accenture 合作开展嵌入式评估

[Read more](https://www.anthropic.com/news/accenture-embedded-evaluation)

[阅读全文](https://www.anthropic.com/news/accenture-embedded-evaluation)

### Introducing the Life Sciences Verification Program

### 推出生命科学验证计划

The Life Sciences Verification Program (LSVP) gives life science professionals access to Claude Mythos, Opus, and Sonnet models with a refined set of safeguards more permissive for biology-related work.

生命科学验证计划（LSVP）让生命科学从业者可以使用 Claude Mythos，Opus 和 Sonnet 模型，并配以一套经过细化，对生物相关工作更宽松的安全防护。

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

![Image block](images/p04-claude-for-microsoft-365-https-claude-com-claude-for.png)

<!-- page 5 of 8 -->

[Claude for Microsoft 365](https://claude.com/claude-for-microsoft-365)

[面向 Microsoft 365 的 Claude](https://claude.com/claude-for-microsoft-365)

[Skills](https://www.claude.com/skills)

[Skills（技能）](https://www.claude.com/skills)

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

<!-- page 6 of 8 -->

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

<!-- page 7 of 8 -->

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

[服务条款：商业版](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

[服务条款：消费者版](https://www.anthropic.com/legal/consumer-terms)

[Terms of Service: US K-12](https://anthropic.com/legal/k12-terms)

[服务条款：美国 K-12](https://anthropic.com/legal/k12-terms)

<!-- page 8 of 8 -->

[Data Processing Agreement: US K-12](https://anthropic.com/legal/k12-dpa)

[数据处理协议：美国 K-12](https://anthropic.com/legal/k12-dpa)

[Usage policy](https://www.anthropic.com/legal/aup)

[使用政策](https://www.anthropic.com/legal/aup)

© 2026 Anthropic PBC

© 2026 Anthropic PBC

![Image block](images/p08-image.png)

> **对一下：** 一篇 2024 年 3 月的公告，页脚为什么是 © 2026，还列着 Mythos 和 Fable?
> 这份 PDF 是 2026 年抓取的，「Related content」 和整段站点导航都是抓取当时的版本，与 2024 年的正文无关：相关内容里的生命科学验证计划提到 Claude Mythos，Models 一栏列着 Mythos, Fable, Opus, Sonnet, Haiku。第 3 页末的 「Xm」 在 PDF 里是 X 和 LinkedIn 两个分享图标，转换时成了两个字符。页脚两张图也属于站点外壳：第 4 页那张深色截图是页脚的 Products 一栏，第 8 页这张是 LinkedIn，X，YouTube 图标。对照 PDF，md 页脚的文字逐项对得上，唯一的格式问题是第 6 页开头的 「Small business」 被转成了二级标题。正文部分只占前 3 页，第 4 到 8 页没有与 Claude 3 Haiku 有关的内容。
