<!-- page 1 of 4 -->

Q

Q

[Models](https://docs.x.ai/docs/models) / Grok 4.20 grok-4.20-0309-reasoning

[模型](https://docs.x.ai/docs/models) / Grok 4.20 grok-4.20-0309-reasoning

> **想:** 标题写「Grok 4.20」, 模型名里又有一个 0309, 这两个数分别说明什么时间和版次?
> 本页都没解释. 按小数读, 4.20 就是 4.2, 排在 4.1 和 4.3 之间, 但页面没说它该读成「四点二」还是「四点二零」. 0309 像是月日, 可全页没有一处年份. 同家族 [xAI 新闻页](../xai/xai-bi.md) 的列表里没有 Grok 4.20 这一条, 那张列表在 2026 年 2 月 2 日到 4 月 17 日之间是空白. 如果 0309 指 2026 年 3 月 9 日, 正好落在这段空白里, 但这是推测, **本页给不出发布日期**.

![Image block](images/p01-grok-4-20-is-a-high-performance-model-with-industry.png)

Grok 4.20 is a high-performance model with industry-leading speed and agentic tool calling capabilities. It combines the lowest hallucination rate on the market with strict prompt adherence, delivering consistently precise and truthful responses.

Grok 4.20 是一个高性能模型, 速度和 agentic 工具调用能力都处于业界领先. 它兼具市面上最低的幻觉率和对提示的严格遵循, 能稳定给出精确, 真实的回答.

> **问:**「industry-leading speed」和「the lowest hallucination rate on the market」各是多少?
> 两个都没有数. 页面没写每秒输出多少 token, 首个 token 的延迟, 也没写幻觉率的百分比, 和哪些模型比, 用什么评测集. 同家族 [Grok 4.1 专页](../grok-4-1/grok-4-1.md) 给过幻觉率的口径: 在生产流量里分层抽样的信息查询上, 统计回答中有错误的原子陈述占比, 再做宏平均, Grok 4.1 (Non-Reasoning) 是 4.22%. 那是另一个型号, 测的是非推理模式, 不能拿来填这里的「lowest」.

Copy for LLM [View as Markdown](https://docs.x.ai/developers/models/grok-4.20-0309-reasoning.md)

复制给 LLM [以 Markdown 查看](https://docs.x.ai/developers/models/grok-4.20-0309-reasoning.md)

[Try in playground](https://console.x.ai/team/default/chat?model=grok-4.20-0309-reasoning&utm_source=docs&utm_medium=referral&utm_campaign=developers-models-grok-4.20-0309-reasoning&utm_content=model-page-playground)

[在 playground 中试用](https://console.x.ai/team/default/chat?model=grok-4.20-0309-reasoning&utm_source=docs&utm_medium=referral&utm_campaign=developers-models-grok-4.20-0309-reasoning&utm_content=model-page-playground)

At a glance

概览

Modalities

模态

Context window

上下文窗口

Text, Image Text

文本, 图像 → 文本

1,000,000

1,000,000

Pricing

定价

\$1.25 \$2.50

\$1.25 \$2.50

> **核对:** 概览里的定价只有「\$1.25 \$2.50」两个数, 各指什么? 缓存价去哪了?
> 概览没标名目, 也没标单位. 对照下面的 Pricing 表, \$1.25 是输入每 1M token 的价格, \$2.50 是输出每 1M token 的价格, 输出是输入的 2 倍. 表里还有第三个价, 缓存输入 \$0.20, 概览没有放. 旁边的上下文窗口写 1,000,000, 也没提示超过 200K 之后要换费率, 这一点要翻到第 2 页才看得到.

Capabilities

能力

Function calling Connect the xAI model to external tools and systems.

Function calling (函数调用) 把 xAI 模型连接到外部工具和系统.

Structured outputs

Structured outputs (结构化输出)

Return responses in specific, organized formats.

按特定的, 有组织的格式返回回答.

Reasoning The model can think before responding.

Reasoning (推理) 模型可以先思考, 再回答.

Pricing

定价

Input

输入

Output

输出

Tokens

Token

Tokens

Token

\$1.25 / 1M tokens

\$1.25 / 1M token

\$2.50 / 1M tokens

\$2.50 / 1M token

Cached tokens

缓存 token

<!-- page 2 of 4 -->

## \$0.20 / 1M tokens (\$0.20 / 1M token)

> **看表:** 这一行被排成了二级标题, 它是新一节的开头吗? \$0.20 属于哪一格?
> 不是新的一节. 它是第 1 页末尾「Cached tokens」那一格的价格, 分页把名目和数值拆到了两页, MinerU 又把这个大号数字认成了标题. 按数算, \$0.20 是输入价 \$1.25 的 16%, 命中缓存的输入便宜 84%. 下一段只说「significantly reduce」, 没给缓存的最短长度, 保留多久, 怎样算命中, 所以实际能省多少取决于命中率, 本页算不出. 紧跟的图 `p02-you-are-charged-...png` 是页面左上角的 X 形站标, 打印时每页都叠了一次, 和价格无关.

![Image block](images/p02-you-are-charged-for-each-token-used-when-making-calls.png)

You are charged for each token used when making calls to our API. Using cached input tokens can significantly reduce your costs. This model is available on multiple clusters, you can find full regional based pricing below.

调用我们的 API 时, 用到的每个 token 都要计费. 使用缓存的输入 token 可以大幅降低成本. 这个模型部署在多个集群上, 完整的分区域定价见下文.

[How does pricing work](https://docs.x.ai/developers/pricing)

[定价怎么算](https://docs.x.ai/developers/pricing)

[Tool pricing](https://docs.x.ai/developers/pricing#tools-pricing)

[工具定价](https://docs.x.ai/developers/pricing#tools-pricing)

[Request increased rate limits](mailto:sales@x.ai?subject=Rate%20limit%20increase%20request)

[申请提高速率限制](mailto:sales@x.ai?subject=Rate%20limit%20increase%20request)

## Higher context pricing (长上下文定价)

![Image block](images/p02-we-charge-different-rates-for-requests-which-exceed-the.png)

We charge different rates for requests which exceed the

请求超出下面这个上下文窗口时, 我们按另一套费率收费:

200K context window

200K 上下文窗口

> **拆开:** 上下文窗口是 1,000,000, 这里的门槛是 200K, 超过之后收多少?
> 200K 只占窗口的 20%, 剩下 800K 的区间都按另一套费率计, 可这套费率藏在开关后面. 图 `p02-we-charge-...png` 就是那个开关, 抓取时是灰色的关闭状态, 页面上没有显示任何长上下文价格. 本页也没说 200K 按输入算还是按输入加输出算, 超过门槛后是整次请求改价还是只有超出部分改价. 所以一次用满 1,000,000 窗口的请求要花多少钱, 本页算不出.

Show batch API pricing

显示 Batch API 定价

![Image block](images/p02-details.png)

> **确认:** 第 3 页写 Batch API「Supported」, 批量调用的价格在哪?
> 不在页面上. 这一行的开关同样是关着的, 图 `p02-details.png` 就是开关本身, 文件名取自它下一行的「Details」, 不是详情表的截图. 批量调用比实时调用便宜多少, 本页一个数都没有.

Details

详情

Model name

模型名

grok-4.20-0309-reasoning

grok-4.20-0309-reasoning

Aliases

别名

grok-4.20-reasoning-latest

grok-4.20-reasoning-latest

grok-4.20

grok-4.20

grok-4.20-reasoning

grok-4.20-reasoning

grok-4.20-0309

grok-4.20-0309

grok-4.20-beta-0309-reasoning

grok-4.20-beta-0309-reasoning

grok-4.20-beta

grok-4.20-beta

grok-4.20-beta-0309

grok-4.20-beta-0309

grok-4.20-beta-latest

grok-4.20-beta-latest

grok-4.20-beta-latest-reasoning

grok-4.20-beta-latest-reasoning

grok-4.20-beta-reasoning

grok-4.20-beta-reasoning

grok-4.20-experimental-beta-0304-reasoning

grok-4.20-experimental-beta-0304-reasoning

grok-4.20-experimental-beta-0304

grok-4.20-experimental-beta-0304

> **回看:** 正式模型名带 0309, 别名里还有 beta-0309 和 experimental-beta-0304, 这几个日期码怎么排?
> 如果按月日读, 0304 比 0309 早 5 天: experimental beta 在前, beta 在后, 正式名又和 beta 共用 0309. 本页把 beta-0309 和正式的 0309 都列成同一个模型名的别名, 看不出 beta 到正式之间有没有换过权重, 也可能只是改了名字. 别名一共 15 个, 这一页列了 12 个, 剩下 3 个被分页挤到了第 3 页.

<!-- page 3 of 4 -->

grok-4.20-experimental-beta-reasoning-latest

grok-4.20-experimental-beta-reasoning-latest

[grok-4](https://docs.x.ai/).20-experimental-beta-latest

[grok-4](https://docs.x.ai/).20-experimental-beta-latest

> **再看:** 为什么只有「grok-4」带链接, 版本号后半截「.20」落在链接外面?
> 原页这个别名是纯文本 `grok-4.20-experimental-beta-latest`. PDF 每页左上角都叠着那个 X 形站标, 站标本身链到 `docs.x.ai` 首页, 这一页它正好压在别名开头, 抓取时站标的链接套到了「grok-4」上. 版本号因此被拆成「4」和「.20」两截, 链接也不是这个别名的文档. 读的时候按 4.20 看.

grok-4.20-reasoning-gv2

grok-4.20-reasoning-gv2

> **对一下:** 其它别名要么带 0304, 0309 这样的日期码, 要么带 latest, `grok-4.20-reasoning-gv2` 里的 2 是第几版?
> 本页没解释 gv 是什么. 这里有 gv2, 却没有 gv1, 也没有日期码, 没法和 0304, 0309 排出先后.

> **停一下:** 模型名以 reasoning 结尾, 可别名里有的带 reasoning, 有的不带, 不带的是非推理版吗?
> 按本页的写法不是. 15 个别名都指向同一个模型名 `grok-4.20-0309-reasoning`, 其中 8 个带 reasoning, 7 个不带, 连最短的 `grok-4.20` 也在里面. 照字面理解, 请求不带 reasoning 的名字, 拿到的仍是这个推理模型. 本页没提 Grok 4.20 有没有单独的非推理版, 也没提推理能不能关. 同家族 [Grok 4.3 专页](../grok-4-3/grok-4-3.md) 把推理写成 none, low, medium, high 四档可调, 本页只有一句「can think before responding」, 没有档位.

Region

区域

us-east-1, us-west-2

us-east-1, us-west-2

> **问:** 第 2 页说完整的分区域定价在「below」, 下面只有两个区域名, 价格呢?
> 下文只列了 us-east-1 和 us-west-2 两个区域, 没有任何按区域区分的价格. 可能两个区域同价, 也可能分区价格在没展开的交互里, 本页看不出. 第 2 页说的「multiple clusters」和这两个区域是不是同一回事, 本页也没说.

Batch API

Batch API

Supported

支持

RATE LIMITS

速率限制

Requests per second 37

每秒请求数 37

Tokens per minute

每分钟 token 数

10,000,000

10,000,000

> **看表:** 每秒 37 次和每分钟 10,000,000 个 token, 两个上限能同时用满吗?
> 单位一个按秒, 一个按分钟. 换成每分钟, 37 次每秒是 2,220 次. 两个上限同时顶满, 平均每次请求只能用约 4,505 个 token. 反过来, 一次用满 1,000,000 窗口的请求就吃掉每分钟额度的十分之一, 一分钟最多 10 次, 离 2,220 次差得很远. 本页没说 token 数只算输入还是输入加输出, 也没说命中缓存的 token 算不算. 同家族 [Grok 4.3 专页](../grok-4-3/grok-4-3.md) 这两个数也是 37 和 10,000,000, 三档单价和上下文窗口也完全相同, 所以这组限额可能是账户默认档, 不一定是 Grok 4.20 专属.

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

[Let Grok perform actions and look up information.](https://docs.x.ai/docs/guides/function-calling)

[让 Grok 执行操作, 查找信息.](https://docs.x.ai/docs/guides/function-calling)

[Learn more](https://docs.x.ai/docs/guides/structured-outputs)

[了解更多](https://docs.x.ai/docs/guides/structured-outputs)

<!-- page 4 of 4 -->

[Structured outputs](https://docs.x.ai/docs/guides/structured-outputs)

[Structured outputs (结构化输出)](https://docs.x.ai/docs/guides/structured-outputs)

![Image block](images/p04-gr-ok-generate-structured-outputs-https-docs-x-ai-docs.png)

Gr[ok generate structured outputs.](https://docs.x.ai/docs/guides/structured-outputs)

[让 Grok 生成结构化输出.](https://docs.x.ai/docs/guides/structured-outputs)

> **核对:** 第 1 页的 Capabilities 列了 3 项, 页尾的入口卡片也是 3 张, 两组数对得上吗?
> 只对上 2 项. Function calling 对应 Tool use 卡片 (链接同是 `function-calling`), Structured outputs 两边都有. 第 1 页的 Reasoning 没有入口卡, 页尾多出来的 Quickstart 是上手教程, 不是模型能力. 另外这一行开头的「Gr」也对不上原文: PDF 文字层是「Let Grok generate structured outputs.」, 左上角的 X 形站标压住了「Le」, 图 `p04-gr-ok-...png` 截到的正是站标加半个「et」, MinerU 就补出了一个「Gr」. 中文按 PDF 原句译.
