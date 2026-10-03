这是 Mistral AI 官网的 Codestral 发布页, 共 9 页, 4 张图. 正文在第 1 到第 7 页, 第 8, 9 页是站点页脚. 转出的 Markdown 被 cookie 横幅盖掉了不少字, 下面的英文按 PDF 文本层补全, 表格数字按 PDF 页面上的表格图抄录.

<!-- page 1 of 9 -->

# Codestral

The page header reads **RESEARCH**, followed by the title "Codestral", the date **May 29, 2024** and the byline "By Mistral AI team".

页头印着 **RESEARCH**, 下面是标题 「Codestral」, 日期 **May 29, 2024**, 署名 「By Mistral AI team」.

> **想:** May 29, 2024 是发布日还是抓页的日子?
> 按发布日读, 它紧挨着标题和署名. 第 9 页页脚的 © 2026 是抓页时的站点外壳, 和这篇公告不是同一个时间.

We introduce Codestral, our first-ever code model. Codestral is an open-weight generative AI model explicitly designed for code generation tasks. It helps developers write and interact with code through a shared instruction and completion API endpoint. As it masters code and English, it can be used to design advanced AI applications for software developers.

我们推出 Codestral, 这是我们的第一个代码模型. Codestral 是开放权重的生成式 AI 模型, 专为代码生成任务设计. 指令和补全共用一个 API endpoint, 开发者通过它写代码, 也通过它和代码交互. 它同时精通代码和英语, 可以用来给软件开发者搭高级 AI 应用.

## A model fluent in 80+ programming languages

Codestral is trained on a diverse dataset of 80+ programming languages, including the most popular ones, such as Python, Java, C, C++, JavaScript, and Bash. It also performs well on more specific ones like Swift and Fortran. This broad language base ensures Codestral can assist developers in various coding environments and projects.

Codestral 的训练数据覆盖 80 多种编程语言, 包括最常用的 Python, Java, C, C++, JavaScript 和 Bash. 在 Swift, Fortran 这类更小众的语言上, 它也表现不错. 语言面铺得广, Codestral 就能在各种编码环境和项目里帮上忙.

> **问:** 80+ 种语言各占多少数据, 一共训练了多少 token?
> 这页都没印. 只有 「80+」 这个下限, 六个点名的常用语言, 外加 Swift 和 Fortran 两个例子. 数据量, 配比, token 总数一概没有.

Codestral saves developers time and effort: it can complete coding functions, write tests, and complete any partial code using a fill-in-the-middle mechanism. Interacting with Codestral will help level up the developer's coding game and reduce the risk of errors and bugs.

Codestral 帮开发者省时省力: 它能补全函数, 能写测试, 还能用 fill-in-the-middle 机制补全任意一段残缺代码. 和 Codestral 配合, 能让开发者的编码水平上一个台阶, 也能少出错, 少出 bug.

The rest of page 1 is a cookie consent banner certified by axeptio. It says the site uses cookies to measure the audience, nurture the relationship and send content and advertisement. It lists Google Analytics 4 and Hubspot, with Close, Accept all and Next buttons. The same banner repeats on every page below.

第 1 页剩下的是 axeptio 认证的 cookie 同意横幅. 横幅说网站用 cookie 统计访问量, 维系用户关系, 推送内容和广告. 它列出 Google Analytics 4 和 Hubspot 两项, 带 Close, Accept all, Next 三个按钮. 后面每一页都重复这个横幅.

<!-- page 2 of 9 -->

## Setting the Bar for Code Generation

### Performance

**Performance.** As a 22B model, Codestral sets a new standard on the performance/latency space for code generation compared to previous models used for coding.

**Performance.** 作为一个 22B 模型, Codestral 在代码生成的 「性能/延迟」 平面上, 相对以往用于编码的模型立了新标杆.

> **核对:** 「performance/latency」 里的延迟数字在哪?
> 这页没有. 表里全是准确率类分数, 没有一列是延迟或吞吐. 「22B」 也只是取整后的规模, 精确参数量没印.

The table below is Figure 1. The columns HumanEval, MBPP, CruxEval-O and RepoBench are grouped under Python; Spider under SQL; the last two columns under "Average on several languages". Bold follows the original.

下表就是 Figure 1. HumanEval, MBPP, CruxEval-O, RepoBench 四列归在 Python 下, Spider 归在 SQL 下, 最后两列归在 「多语言平均」 下. 加粗照原表.

| | Context length | HumanEval | MBPP | CruxEval-O | RepoBench | Spider | HumanEvalFIM average | HumanEval average |
|---|---|---|---|---|---|---|---|---|
| Codestral 22B | 32k | 81.1% | 78.2% | 51.3% | 34.0% | 63.5% | 91.6% | 61.5% |
| CodeLlama 70B | 4k | 67.1% | 70.8% | 47.3% | 11.4% | 37.0% | - | 51.9% |
| DeepSeek Coder 33B | 16k | 77.4% | 80.2% | 49.5% | 28.4% | 60.0% | 78.2% | 57.6% |
| Llama 3 70B | 8k | 76.2% | 76.7% | 26.0% | 18.4% | 67.1% | - | 61.2% |

> **看表:** Codestral 是不是每列都第一?
> 不是. MBPP 第一是 DeepSeek Coder 33B 的 80.2%, Codestral 是 78.2%; Spider 第一是 Llama 3 70B 的 67.1%, Codestral 是 63.5%. 其余五列分数加上下文长度, Codestral 都领先.

Figure 1: With its larger context window of 32k (compared to 4k, 8k or 16k for competitors), Codestral outperforms all other models in RepoBench, a long-range eval for code generation..

Figure 1: Codestral 的上下文窗口更大, 有 32k (对手是 4k, 8k 或 16k), 它在 RepoBench 上胜过所有其他模型. RepoBench 是一项长距离代码生成评测.

> **拆开:** RepoBench 上的领先有多少来自 32k 窗口?
> 四个模型的窗口和 RepoBench 分数同序: 4k 对 11.4%, 8k 对 18.4%, 16k 对 28.4%, 32k 对 34.0%. 可窗口和模型是绑在一起变的, 这页没有同一个模型换窗口的对照, 拆不开.

We compare Codestral to existing code-specific models with higher hardware requirements.

我们拿 Codestral 和现有的代码专用模型比, 这些模型对硬件的要求都更高.

> **确认:** Llama 3 70B 算 「code-specific」 模型吗?
> 按字面不算, 它是通用模型, 却列在表里. 这句话说的对比对象是代码专用模型, 表里实际还多了一个通用模型.

**Python.** We use four benchmarks: HumanEval pass@1, MBPP sanitised pass@1 to evaluate Codestral's Python code generation ability, CruxEval to evaluate Python output prediction, and RepoBench EM to evaluate Codestral's Long-Range Repository-Level Code Completion.

**Python.** 我们用四个基准: HumanEval pass@1 和 MBPP sanitised pass@1 评 Python 代码生成能力, CruxEval 评 Python 输出预测, RepoBench EM 评仓库级长距离代码补全.

**SQL.** To evaluate Codestral's performance in SQL, we used the Spider benchmark.

**SQL.** SQL 能力用 Spider 基准来评.

The cookie consent banner covers the lower half of page 2.

第 2 页下半部同样被 cookie 横幅挡住.

<!-- page 3 of 9 -->

The page opens with the body of a second table. Its header row is not on this page. The first column equals the HumanEval column of Figure 1; the next six presumably follow the language order named in the paragraph below. The last column is marked "Average".

这一页开头是第二张表的表身, 表头行不在本页. 第一列和 Figure 1 的 HumanEval 列相同, 后六列应当按下文列出的语言顺序排. 最后一列标 「Average」.

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Average |
|---|---|---|---|---|---|---|---|---|
| Codestral 22B | 81.1% | 65.2% | 42.4% | 63.3% | 68.9% | 68.6% | 43.7% | 61.5% |
| CodeLlama 70B | 67.1% | 54.0% | 28.5% | 57.6% | 62.1% | 60.4% | 36.1% | 51.9% |
| DeepSeek Coder 33B | 77.4% | 67.1% | 39.9% | 60.1% | 54.7% | 62.9% | 43.7% | 57.6% |
| Llama 3 70B | 76.2% | 67.7% | 39.2% | 60.8% | 66.5% | 74.2% | 46.2% | 61.2% |

> **回看:** Average 是不是这七列的平均?
> 对不上. Codestral 七列平均约 61.9, 表上印 61.5; CodeLlama 约 52.3 对 51.9; DeepSeek 约 58.0 对 57.6; Llama 3 约 61.5 对 61.2. 四行都低 0.34 到 0.39 个点, 只算后六列又都明显偏低. 表头不在本页, 这页定不了它平均的是哪几列.

**Additional languages.** Additionally, we evaluated Codestral's performance in multiple HumanEval pass@1 across six different languages in addition to Python: C++, bash, Java, PHP, Typescript, and C#, and calculated the average of these evaluations.

**Additional languages.** 此外, 除 Python 以外, 我们还在六种语言上评了 Codestral 的多语言 HumanEval pass@1: C++, bash, Java, PHP, Typescript 和 C#, 并算了这些结果的平均.

![FIM 评测表, 表头和 Codestral 一行完整, 下面三行被 cookie 横幅挡住大半](images/p03-toggle-all.png)

The FIM table has four columns: HumanEvalFIM Python, HumanEvalFIM JavaScript, HumanEvalFIM Java and HumanEval FIM (marked Average). The Codestral 22B row reads 89.4%, 95.1%, 90.3% and 91.6%. For the three rows below, only the last two columns are visible: "-" and "-", then 86.6% and 78.2%, then "-" and "-".

FIM 表有四列: HumanEvalFIM Python, HumanEvalFIM JavaScript, HumanEvalFIM Java, 以及标着 Average 的 HumanEval FIM. Codestral 22B 一行是 89.4%, 95.1%, 90.3%, 91.6%. 下面三行只露出最后两列: 第一行 「-」 和 「-」, 第二行 86.6% 和 78.2%, 第三行 「-」 和 「-」.

> **停一下:** FIM 表下面三行是谁?
> 行名被横幅挡住了. 露出 86.6% 和 78.2% 的那行, 平均值和 Figure 1 里 DeepSeek Coder 33B 的 HumanEvalFIM average 78.2% 一致; 另两行全是 「-」, 和 CodeLlama 70B, Llama 3 70B 在那一列的 「-」 对得上. 这是按数字对位推的, 页面上看不到行名.

**FIM benchmarks.** Codestral's Fill-in-the-middle performance was assessed using HumanEval pass@1 in Python, JavaScript, and Java and compared to DeepSeek Coder 33B, whose fill-in-the-middle capacity is immediately usable.

**FIM benchmarks.** Codestral 的 fill-in-the-middle 能力用 Python, JavaScript, Java 三种语言的 HumanEval pass@1 来评, 对比对象是 DeepSeek Coder 33B, 因为它的 fill-in-the-middle 能力拿来就能用.

> **再看:** 91.6% 这个平均能不能复算?
> 能. (89.4 + 95.1 + 90.3) / 3 = 91.6, 和表上的 Average, Figure 1 的 HumanEvalFIM average 都一致. DeepSeek 的 Python, JavaScript 两格被挡住, 只能由 78.2 x 3 - 86.6 反推两格之和约 148.0.

## Get started with Codestral

### Download and test Codestral.

Codestral is a 22B open-weight model licensed under the new Mistral AI Non-Production License, which means that you can use it for research and testing

Codestral 是 22B 的开放权重模型, 用新的 Mistral AI Non-Production License 授权, 也就是说可以把它用于研究和测试 (这句跨到第 4 页)

<!-- page 4 of 9 -->

![cookie 横幅里被截下来的一个开关图标, 不含模型信息](images/p04-pur.png)

purposes. Codestral can be downloaded on HuggingFace.

用途. Codestral 可以在 HuggingFace 上下载.

If you want to use the model in the course of commercial activity, Commercial licenses are also available on demand by reaching out to the team.

如果想在商业活动里用这个模型, 也可以联系团队, 按需申请商用许可.

> **对一下:** 22B, open-weight, Non-Production License 三件事放在一起, 意思是什么?
> 权重公开, 但默认只许做研究和测试; 商用要另外找团队谈许可. 在这页上 「open-weight」 不等于可以直接商用.

## Use Codestral via its dedicated endpoint

With this release, comes the addition of a new endpoint: **codestral.mistral.ai**. This endpoint should be preferred by users who use our Instruct or Fill-In-the-Middle routes inside their IDE. The API Key for this endpoint is managed at the personal level and isn't bound by the usual organization rate limits. We're allowing use of this endpoint for free during a beta period of 8 weeks and are gating it behind a waitlist to ensure a good quality of service. This endpoint should be preferred by developers implementing IDE plugins or applications where customers are expected to bring their own API keys.

这次发布还新增了一个 endpoint: **codestral.mistral.ai**. 在 IDE 里用我们 Instruct 或 Fill-In-the-Middle 路由的用户, 应优先用它. 这个 endpoint 的 API Key 按个人管理, 不受通常的组织级限流约束. beta 期 8 周内可以免费使用, 为了保证服务质量, 要先排 waitlist. 开发 IDE 插件, 或者做那种由客户自带 API key 的应用, 也应优先用这个 endpoint.

> **想:** 8 周免费 beta 从哪天算到哪天?
> 页面没写起止日. 若从发布日 May 29, 2024 起算, 8 周后约是 2024 年 7 月 24 日. 这只是按日期推的.

## Build with Codestral on la Plateforme

Codestral is also immediately available on the usual API endpoint: api.mistral.ai where queries are billed per tokens. This endpoint and integrations are better suited for research, batch queries or third-party application development that exposes results directly to users without them bringing their own API keys.

Codestral 也已上线常规 API endpoint: api.mistral.ai, 这里的请求按 token 计费. 这个 endpoint 及相关集成更适合研究, 批量查询, 或者第三方应用开发, 这类应用把结果直接给用户看, 用户不用自带 API key.

You can create your account on la Plateforme and start building your applications with Codestral by following this guide. Like all our other models, Codestral is available in our self-deployment offering starting today: contact sales.

可以在 la Plateforme 上注册账号, 按这份指南用 Codestral 搭应用. 和我们的其他模型一样, Codestral 从今天起也纳入自部署方案, 需要的话联系销售.

> **问:** 按 token 计费, 单价是多少?
> 这页没印价格. 只说 api.mistral.ai 按 token 计费, codestral.mistral.ai 在 beta 期免费. 第 8 页的 Pricing 只是一个导航链接.

<!-- page 5 of 9 -->

## Use Codestral in your favourite coding and building environment.

We worked with community partners to expose Codestral to popular tools for developer productivity and AI application-making.

我们和社区伙伴合作, 把 Codestral 接进了常用的开发效率工具和 AI 应用搭建工具.

**Application frameworks.** Codestral is integrated into LlamaIndex and LangChain starting today, which allows users to build agentic applications with Codestral easily

**Application frameworks.** 从今天起, Codestral 已集成进 LlamaIndex 和 LangChain, 用户可以很方便地用 Codestral 搭 agent 应用

**VSCode/JetBrains integration.** Continue.dev and Tabnine are empowering developers to use Codestral within the VSCode and JetBrains environments and now enable them to generate and chat with the code using Codestral.

**VSCode/JetBrains integration.** Continue.dev 和 Tabnine 让开发者可以在 VSCode 和 JetBrains 环境里用 Codestral, 现在能用它生成代码, 也能围绕代码对话.

Here is how you can use the Continue.dev VSCode plugin for code generation, interactive conversation, and inline editing with Codestral, and here is how users can use the Tabnine VSCode plugin to chat with Codestral.

这里演示了怎样用 Continue.dev 的 VSCode 插件配合 Codestral 做代码生成, 交互对话和行内编辑; 这里演示了怎样用 Tabnine 的 VSCode 插件和 Codestral 对话.

For detailed information on how various integrations work with Codestral, please check our documentation for set-up instructions and examples.

各类集成怎样和 Codestral 配合, 详见我们的文档, 里面有配置说明和示例.

## Developer community feedbacks

"A public autocomplete model with this combination of speed and quality hadn't existed before, and it's going to be a phase shift for developers everywhere."

-- Nate Sesti, CTO and co-founder of Continue.dev

「速度和质量能兼顾到这个程度的公开自动补全模型, 以前没有过, 它会让各地的开发者迎来一次阶跃.」

-- Nate Sesti, Continue.dev CTO 兼联合创始人

<!-- page 6 of 9 -->

"We are excited about the capabilities that Mistral unveils and delighted to see a strong focus on code and development assistance, an area that JetBrains cares deeply about."

-- Vladislav Tankov, Head of JetBrains AI

「Mistral 展示的能力让我们很兴奋, 也很高兴看到它把重心放在代码和开发辅助上, 这正是 JetBrains 看重的领域.」

-- Vladislav Tankov, JetBrains AI 负责人

"We used Codestral to run a test on our Kotlin-HumanEval benchmark and were impressed with the results. For instance, in the case of the pass rate for T=0.2, Codestral achieved a score of 73.75, surpassing GPT-4-Turbo's score of 72.05 and GPT-3.5-Turbo's score of 54.66."

-- Mikhail Evtikhiev, Researcher at JetBrains

"我们用 Codestral 跑了自家的 Kotlin-HumanEval 基准, 结果让人印象深刻. 比如 T=0.2 下的通过率, Codestral 得 73.75, 超过 GPT-4-Turbo 的 72.05 和 GPT-3.5-Turbo 的 54.66."

-- Mikhail Evtikhiev, JetBrains 研究员

> **看表:** 73.75 比 72.05 高多少, 这组数能和 Figure 1 放一起比吗?
> 高 1.70 分, 比 GPT-3.5-Turbo 高 19.09 分. 这是 JetBrains 自家基准, 页面没说 T 指什么, 也没说分数是不是百分比, 所以不能和 Figure 1 的 HumanEval 列并排看.

"As a researcher at the company that created the first developer focused GenAI tool, I've had the pleasure of integrating Mistal's new code model into our chat product. I am thoroughly impressed by its performance. Despite its relatively compact size, it delivers results on par with much larger models we offer to customers. We tested several key features, including code generation, test generation, documentation, onboarding processes, and more. In each case, the model exceeded our expectations. The speed and accuracy of the model will significantly impact our product's efficiency vs the previous Mistral model, allowing us to provide quick and precise assistance to our users. This model stands out as a powerful tool among the models we support, and I highly recommend it to others seeking high-quality performance."

-- Meital Zilberstein, R&D Lead @ Tabnine

"我所在的公司做出了第一个面向开发者的 GenAI 工具. 作为这里的研究员, 我有幸把 Mistral 的新代码模型接进了我们的聊天产品. 它的表现让我十分佩服. 尺寸相对紧凑, 效果却和我们给客户提供的大得多的模型持平. 我们测了几项关键功能, 包括代码生成, 测试生成, 文档, 新人上手流程等等, 每一项它都超出预期. 和之前的 Mistral 模型相比, 它的速度和准确度会明显提升我们产品的效率, 让我们能给用户更快更准的帮助. 在我们支持的模型里, 它是很突出的一款工具, 我向追求高质量表现的人强烈推荐."

-- Meital Zilberstein, Tabnine 研发负责人

![Tabnine 研发负责人引语的截图, 左半被 cookie 横幅挡住](images/p06-get-in-touch-https-mistral-ai-contact.png)

"Cody speeds up the inner loop of software development, and developers use features like autocomplete to alleviate some of the day-to-day toil that comes with writing code. Our internal evaluations show that Mistral's new Codestral model significantly reduces the latency of Cody autocomplete while maintaining the quality of the suggested code. This makes it an excellent model choice for

"Cody 加快了软件开发的内循环, 开发者靠自动补全这类功能, 减掉写代码时的一部分日常琐碎活. 我们的内部评测显示, Mistral 新的 Codestral 模型明显降低了 Cody 自动补全的延迟, 同时保住了建议代码的质量. 所以对于 (引语跨到第 7 页)

<!-- page 7 of 9 -->

autocomplete where milliseconds of latency translate to real value for developers."

-- Quinn Slack, CEO and co-founder of Sourcegraph

自动补全这种每一毫秒延迟都关系到开发者实际收益的场景, 它是很好的模型选择."

-- Quinn Slack, Sourcegraph CEO 兼联合创始人

> **拆开:** 「significantly reduces the latency」 降了多少, 和谁比?
> 这页没数. 引语只说内部评测延迟明显下降, 质量不变, 没写基线模型, 没写毫秒数. 全文唯一和延迟沾边的量化表述就是这句, 也还是定性的.

"I've been incredibly impressed with Mistral's new Codestral model for AI code generation. In my testing so far, it has consistently produced highly accurate and functional code, even for complex tasks. For example, when I asked it to complete a nontrivial function to create a new LlamaIndex query engine, it generated code that worked seamlessly, despite being based on an older codebase."

-- Jerry Liu, CEO and co-founder of LlamaIndex

"Mistral 新的 Codestral 模型在 AI 代码生成上让我印象极深. 到目前为止我的测试里, 它一直能写出准确, 能跑的代码, 复杂任务也一样. 比如我让它补全一个不简单的函数, 用来新建一个 LlamaIndex 查询引擎, 它给出的代码直接就能用, 尽管它依据的是较旧的代码库."

-- Jerry Liu, LlamaIndex CEO 兼联合创始人

"Code generation is one of the most popular LLM use-cases, so we are really excited about the Codestral release. From our initial testing, it's a great option for code generation workflows because it's fast, has favorable context window, and the instruct version supports tool use. We tested with LangGraph for self-corrective code generation using the instruct Codestral tool use for output, and it worked really well out-of-the-box (see our video detailing this)."

-- Harrison Chase, CEO and co-founder of LangChain

"代码生成是 LLM 最热门的用途之一, 所以 Codestral 发布让我们很兴奋. 从初步试用看, 它很适合代码生成工作流: 速度快, 上下文窗口够用, instruct 版支持 tool use. 我们用 LangGraph 做了自我纠错式代码生成, 输出环节用 instruct 版 Codestral 的 tool use, 开箱就很好用 (细节见我们的视频)."

-- Harrison Chase, LangChain CEO 兼联合创始人

![LangChain 引语结尾和页脚产品栏的截图, 左半被 cookie 横幅挡住](images/p07-com.png)

The page then turns into the site footer. The Products column lists Vibe, Vibe Code, Studio and Forge.

之后进入站点页脚. Products 一栏列着 Vibe, Vibe Code, Studio, Forge.

<!-- page 8 of 9 -->

Page 8 continues the footer. The links are Compute and Pricing; under Solutions: Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities; under Why Mistral: About us, Careers, Partners, Our customers, Our models, Brand; under Company: Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice.

第 8 页接着是页脚. 链接有 Compute 和 Pricing; Solutions 下有 Delivery methodology, Model customization, Coding, Document intelligence, Speech, 以及面向金融, 公共机构, 制造业, 能源与公用事业的四个行业页; Why Mistral 下有 About us, Careers, Partners, Our customers, Our models, Brand; Company 下有 Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice.

<!-- page 9 of 9 -->

Page 9 closes the footer with "Get Mistral Vibe", App Store and Google Play badges, "Mistral AI © 2026" and a language switch set to English. The cookie banner appears once more.

第 9 页是页脚收尾: 「Get Mistral Vibe」, App Store 和 Google Play 下载标识, 「Mistral AI © 2026」, 以及停在 English 的语言切换. cookie 横幅在这里又出现一次.

> **确认:** 这 9 页有几张和模型有关的图?
> 4 张图里, 第 3 页那张是 FIM 评测表, 数字只露出 Codestral 一整行和另外三行的末两列. 第 4 页是横幅里的开关图标, 第 6, 7 页是被横幅挡住的引语截图, 引语全文已按 PDF 文本层补在正文里. Figure 1 那张主表在转出的 Markdown 里是表格, 不在 images 目录.
