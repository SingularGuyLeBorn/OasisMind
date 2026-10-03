---
title: "Grok 4.3 · 对照译稿"
category: "模型库"
tags: ["xAI", "对照译稿"]
published: true
excerpt: "Grok 4.3 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 4 -->

![Image block](images/p01-2026-9-25-15-42.png)

2026/9/25 15:42

2026/9/25 15:42

Grok 4.3 | SpaceXAI Docs

Grok 4.3 | SpaceXAI Docs

![Image block](images/p01-models-https-docs-x-ai-docs-models-grok-4-3-grok-4-3.png)

[Models](https://docs.x.ai/docs/models) / Grok 4.3 grok-4.3

[模型](https://docs.x.ai/docs/models) / Grok 4.3 grok-4.3

Fast, reliable model with strong tool calling and instruction following capabilities.

Grok 4.3 是一个快速, 可靠的模型, 工具调用和指令遵循能力很强.

> **核对:** 「fast, reliable, strong tool calling and instruction following」全是一句形容词, 一个可核验的数都没有, 这条 claim 的机制含量在哪?
> 不在本页. 第 1 页通篇没有基准表: 没有速度指标 (每秒输出 token 数, 首 token 延迟), 没有工具调用分数 (如 BFCL), 没有指令遵循分数 (如 IFEval). 同家族 4.20 页好歹给了 industry-leading speed, lowest hallucination rate 这种可对照的宣称, 本页连宣称对象都不点名. 要核验只有走外部路径: 去 BFCL / IFEval 公开榜单查 grok-4.3 条目, 查不到就只能当定位语读——偏快, 偏稳, 工具调用优先的档位. 第 3 页 Details 同样不含任何评测数字, claim 在本页层面不可核验.

Copy for LLM

复制给 LLM

[View as Markdown](https://docs.x.ai/developers/models/grok-4.3.md)

[以 Markdown 查看](https://docs.x.ai/developers/models/grok-4.3.md)

[Try in playground](https://console.x.ai/team/default/chat?model=grok-4.3&utm_source=docs&utm_medium=referral&utm_campaign=developers-models-grok-4.3&utm_content=model-page-playground)

[在 playground 中试用](https://console.x.ai/team/default/chat?model=grok-4.3&utm_source=docs&utm_medium=referral&utm_campaign=developers-models-grok-4.3&utm_content=model-page-playground)

At a glance

概览

Modalities

模态

Context window

上下文窗口

Pricing

定价

Text, Image Text

文本, 图像 → 文本

> **问:** 「Text, Image Text」只声明了进出模态, 图像输入按什么折算 token, 占不占第 3 页 10,000,000 的 TPM 限额?
> 本页没有答案. 第 1 页 modalities 一行只说明接受图像输入, 输出文本, 全文没有图像 token 的折算规则 (按 tile, 按分辨率还是按固定值), 也没有图像输入走哪档价目的说明, 第 2 页的缓存判定对图像前缀是否适用同样没提. 第 3 页 Details 只有模型名, 别名, 速率三格, 不含模态细节. 要核验只能实测: 同一文本请求带图与不带图各发一次, 对比 usage 里的 input token 数. 页面对多模态只给了一行声明, 机制层全空.

1,000,000

1,000,000

\$1.25 \$2.50

\$1.25 \$2.50

Capabilities

能力

Function calling Connect the xAI model to external tools and systems.

Function calling (函数调用) 把 xAI 模型连接到外部工具和系统.

Structured outputs

Structured outputs (结构化输出)

Return responses in specific, organized formats.

按特定的, 有组织的格式返回回答.

[Configurable reasoning](https://docs.x.ai/developers/model-capabilities/text/reasoning#effort-levels) Supports none (no reasoning at all), low, medium, and high.

[Configurable reasoning (可配置推理)](https://docs.x.ai/developers/model-capabilities/text/reasoning#effort-levels) 支持 none (完全不做推理), low, medium, high 四档.

> **停一下:** none 档是「这个模型不会推理」还是「这次请求不推理」? reasoning 产生的 token 又怎么计费?
> 是后者. 括号里的 no reasoning at all 修饰的是单次请求的行为: 档位是请求参数, 不是模型属性, 同一权重可以在 high 档想很久, 也可以在 none 档直出. 计费侧本页只有一句「每个用到的 token 都计费」 (第 2 页), 没说 reasoning 生成的 token 算输出还是另立名目, none→high 各档的真实价差因此算不出来. PDF 第 3 页 Details 文字层还有 md 没抽到的第 5 档 xhigh 和一行 DEFAULT low: 不传参时默认按 low 直出, 而同家族 4.20 页没有档位概念, 只有一句 can think before responding——两页对「默认会不会思考」给的答案不一样.

Pricing

定价

Input

输入

Output

输出

Tokens

Token

\$1.25 / 1M tokens

\$1.25 / 1M token

Tokens

Token

\$2.50 / 1M tokens

\$2.50 / 1M token

Cached tokens

缓存 token

\$0.20 / 1M tokens

\$0.20 / 1M token

https://docs.x.ai/developers/models/grok-4.3

1/4

<!-- page 2 of 4 -->

2026/9/25 15:42

2026/9/25 15:42

Grok 4.3 | SpaceXAI Docs

Grok 4.3 | SpaceXAI Docs

You are charged for each token used when making calls to our API.

调用我们的 API 时, 用到的每个 token 都要计费.

![Image block](images/p02-using-https-docs-x-ai-cached-input-tokens-can.png)

[Using](https://docs.x.ai/) cached input tokens can significantly reduce your costs.

[使用](https://docs.x.ai/)缓存的输入 token 可以大幅降低成本.

> **想:** 「cached input tokens can significantly reduce costs」是个成本 claim, 它的机制是什么, 凭什么能省?
> 页面只给了结果没给机制. 第 1 页定价表 cached tokens \$0.20 / 1M, 是输入价 \$1.25 的 16%, 省钱幅度这个数能算; 但第 2 页这句话对命中判定一项都没写: 按前缀匹配还是语义相似, 最短可缓存长度多少, 缓存保留多久, 未命中回退到什么价. 这类缓存的机制通常是复用前缀的 KV 表示, 命中率取决于负载前缀稳不稳定, 所以 significantly 能不能兑现全看请求形态, 本页无法核验. 旁证是第 3 页 10,000,000 的 TPM 限额没区分缓存 token 计不计, 口径同样悬着.

This model is available on multiple clusters, you can find full regional based pricing below.

这个模型部署在多个集群上, 完整的分区域定价见下文.

[How does pricing work](https://docs.x.ai/developers/pricing)

[定价怎么算](https://docs.x.ai/developers/pricing)

[Tool pricing](https://docs.x.ai/developers/pricing#tools-pricing)

[工具定价](https://docs.x.ai/developers/pricing#tools-pricing)

[Request increased rate limits](mailto:sales@x.ai?subject=Rate%20limit%20increase%20request)

[申请提高速率限制](mailto:sales@x.ai?subject=Rate%20limit%20increase%20request)

Higher context pricing

长上下文定价

![Image block](images/p02-we-charge-different-rates-for-requests-which-exceed-the.png)

We charge different rates for requests which exceed the

请求超出下面这个上下文窗口时, 我们按另一套费率收费:

200K context window

200K 上下文窗口

> **再看:** 窗口标 1,000,000, 长上下文门槛却是 200K, 「exceed the 200K context window」的口径是什么?
> 口径有三处模糊. 一是按什么累计: 只算输入 token, 还是输入加输出; 多轮对话里未清的历史算不算进去. 二是改价范围: 超门槛后是整次请求按另一套费率, 还是只有超出部分加价; 那套费率藏在关着的开关后面, 一个数都没有. 三是窗口与门槛之间的 800K 区间名义上可用却按未公开费率计, 一次用满 1,000,000 的请求花多少钱, 本页算不出, 而第 3 页的限额表也不提示长上下文是否另有限流.

Show batch API pricing

显示 Batch API 定价

![Image block](images/p02-details.png)

## Details (详情)

https://docs.x.ai/developers/models/grok-4.3

2/4

<!-- page 3 of 4 -->

![Image block](images/p03-2026-9-25-15-42.png)

2026/9/25 15:42

2026/9/25 15:42

Model name

模型名

Grok 4.3 | SpaceXAI Docs

Grok 4.3 | SpaceXAI Docs

Aliases

别名

grok-4.3-latest

grok-4.3-latest

RATE LIMITS

速率限制

Requests per second 37

每秒请求数 37

Tokens per minute 10,000,000

每分钟 token 数 10,000,000

> **看表:** 每秒 37 次和每分钟 10,000,000 个 token, 两个上限什么关系, 能同时顶满吗?
> 单位不同, 卡的是两种负载形态. 37 次每秒折成每分钟 2,220 次; 两个上限同时顶满, 平均每次请求只能用约 4,505 个 token. 反过来, 一次吃满 1,000,000 窗口的请求 (第 1 页) 占掉每分钟额度的十分之一, 一分钟最多 10 次, 离 2,220 次很远. 所以短平快的调用先撞请求数上限, 长上下文调用先撞 token 上限. 口径上本页没说 token 数只算输入还是输入加输出, 缓存命中的 token 计不计 (第 1 页 cached tokens 档存在, 更说不准), 也没说这是账户默认还是可以按模型单独申请. 同家族 4.20 页这两个数一模一样, 更像账户统一默认档.

![Image block](images/p03-learn-more-https-docs-x-ai-docs-tutorial.png)

[Learn more](https://docs.x.ai/docs/tutorial)

[了解更多](https://docs.x.ai/docs/tutorial)

[Quickstart](https://docs.x.ai/docs/tutorial)

[Quickstart (快速上手)](https://docs.x.ai/docs/tutorial)

[Create an API Key and make your first request.](https://docs.x.ai/docs/tutorial)

[创建 API Key, 发出你的第一个请求.](https://docs.x.ai/docs/tutorial)

![Image block](images/p03-learn-more-https-docs-x-ai-docs-guides-function-calling.png)

[Learn more](https://docs.x.ai/docs/guides/function-calling)

[了解更多](https://docs.x.ai/docs/guides/function-calling)

[Tool use](https://docs.x.ai/docs/guides/function-calling)

[Tool use (工具使用)](https://docs.x.ai/docs/guides/function-calling)

https://docs.x.ai/developers/models/grok-4.3

3/4

<!-- page 4 of 4 -->

2026/9/25 15:42

2026/9/25 15:42

Grok 4.3 | SpaceXAI Docs

Grok 4.3 | SpaceXAI Docs

![Image block](images/p04-let-grok-perform-actions-and-look-up-information-https.png)

[Let Grok perform actions and look up information.](https://docs.x.ai/docs/guides/function-calling)

[让 Grok 执行操作, 查找信息.](https://docs.x.ai/docs/guides/function-calling)

Learn more

了解更多

Structured outputs

Structured outputs (结构化输出)

Let Grok generate structured outputs.

让 Grok 生成结构化输出.

https://docs.x.ai/developers/models/grok-4.3

4/4

> **停一下:** 窗口, 三档单价, 200K 门槛, 37 与 10,000,000 的限额, 和 Grok 4.20 完全相同, 4.3 是 4.20 的改名吗?
> 本页分不出, 但有三处实质差异. 一是推理形态: 本页是 none 到 xhigh 五档可调的 configurable reasoning 且默认 low (PDF 第 3 页文字层), 4.20 只有一句 can think before responding, 没有档位, 默认行为很可能不一样. 二是描述口径: 4.20 宣称 industry-leading speed 和 lowest hallucination rate, 本页只说 fast, reliable, strong tool calling, 不提幻觉率. 三是命名: 4.20 正式名带 0309-reasoning 和一批日期码别名, 本页是裸 grok-4.3 加一个 latest 浮动别名. 数字全同只说明计费与限额是这一档家族的统一配置, 不能拿来当 4.3 的独有卖点; 两个模型是否同一底座, 页面层面没有信息, 得看它们在相同基准上的成对评测.
