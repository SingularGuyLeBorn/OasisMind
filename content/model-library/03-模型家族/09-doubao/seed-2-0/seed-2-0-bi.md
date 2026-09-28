<!-- page 1 of 78 -->

ByteDance | Seed

# Seed2.0 Model Card: Towards Intelligence Frontier for Real-World Complexity

Seed2.0 模型卡: 面向真实世界复杂性的智能前沿

Bytedance Seed

## 1 Introduction

Large Language Models (LLMs) now play a central role in modern digital infrastructure. Usage has grown dramatically across both professional and personal contexts  $[11]$ . The Seed team has developed a comprehensive model family that includes general-purpose LLMs, multimodal models, open-source releases, code-specialized models, diffusion-based language modeling, formal theorem proving, and generative media systems: Seed1.6/1.8, Seed1.5-VL, Seed-OSS, Seed-Coder, Seed Diffusion, and Seed-Prover. These models currently power a large-scale product ecosystem serving hundreds of millions of daily active users across applications. Meanwhile, the field is moving toward an agentic paradigm where LLMs tackle scientific research, complex software development, autonomous documentation learning, and multi-step real-world workflows. This shift motivates Seed2.0 Series (Pro / Lite / Mini), which is designed to deliver optimal user experience in large-scale production environments.

大语言模型(LLM)如今在现代数字基础设施中处于核心位置, 在工作和个人场景里的使用量都大幅增长 $[11]$. Seed 团队开发了一个完整的模型家族, 覆盖通用 LLM, 多模态模型, 开源模型, 代码专用模型, 基于扩散的语言建模, 形式化定理证明和生成式媒体系统: Seed1.6/1.8, Seed1.5-VL, Seed-OSS, Seed-Coder, Seed Diffusion 和 Seed-Prover. 这些模型目前支撑着一个大规模产品生态, 在各类应用中服务数亿日活用户. 与此同时, 领域正在走向 agent 范式, 让 LLM 去做科学研究, 复杂软件开发, 自主学习文档和多步骤的真实工作流. 这一转变催生了 Seed2.0 系列(Pro / Lite / Mini), 它的设计目标是在大规模生产环境里给出最好的用户体验.

Seed2.0 prioritizes user experience under large-scale online deployment, as evidenced by strong results on the LMSYS Chatbot Arena, a public human preference benchmark. $^{1}$  In practice, interactive quality is most directly shaped by four factors: the prevalence of visual and multimodal queries, the impact of inference latency on user satisfaction, the need for reliable complex instruction execution, and the demand for seamless coding assistance. Our design reflects these priorities:

Seed2.0 把大规模在线部署下的用户体验放在首位, 这一点可以从公开人类偏好榜 LMSYS Chatbot Arena 上的强劲成绩看出. $^{1}$ 实际中, 交互质量最直接地受四个因素影响: 视觉和多模态查询的普遍程度, 推理延迟对用户满意度的影响, 可靠执行复杂指令的需求, 以及顺畅编码辅助的需求. 我们的设计对应这些优先级:

\- Robust Visual and Multimodal Understanding. A substantial fraction of real user queries involve images—screenshots, charts, scanned documents, and mixed-media content. Seed2.0 strengthens visual reasoning with reduced hallucination [20, 35, 117] and improves structured extraction from documents and figures [65, 100].

\- 稳健的视觉与多模态理解. 真实用户查询中有相当一部分带图片: 截图, 图表, 扫描文档和混合媒体内容. Seed2.0 强化了视觉推理并减少幻觉 [20, 35, 117], 也改进了从文档和图表中做结构化抽取的能力 [65, 100].

\- Fast and Flexible Inference. Inference latency directly impacts user experience. Seed2.0 offers three model sizes (Pro / Lite / Mini), allowing developers to choose the appropriate balance between performance and speed for their specific use case.

\- 快速灵活的推理. 推理延迟直接影响用户体验. Seed2.0 提供三个尺寸(Pro / Lite / Mini), 开发者可以按自己的场景在性能和速度之间选合适的平衡点.

> **想:** Pro / Lite / Mini 在全文的对比里是不是同一套条件? 三个尺寸之间只差参数量吗?
> 不是同一套条件. 原文从头到尾没给三者的参数量, 激活量, 训练数据或推理设置, 只说「三个尺寸」. 表上也不对称: Table 3 和 Table 11/13 的大模型组只放 Pro, Table 4 放 Lite 和 Mini, Table 12/14 的 agent 与高阶任务只放 Lite, Mini 整组缺席; 三者同框只出现在 Table 8 和 Table 9. 所以「Lite 接近 Pro」这类结论只能在 Table 8/9 里对着看, 其他表是两套对手, 两套分组.

\- Reliable Complex Instruction Execution. In production, we observe that users frequently issue complex, multi-step instructions that require precise execution—tasks where success depends not on factual recall but on structured reasoning and constraint satisfaction. Recent benchmarks such as $DeR^2$ [115] and CL-bench [26] capture exactly this demand. Seed2.0 treats it as a first-class requirement.

\- 可靠的复杂指令执行. 我们在生产中观察到, 用户经常下达需要精确执行的复杂多步指令: 这类任务成败不在于事实记忆, 而在于结构化推理和约束满足. $DeR^2$ [115] 和 CL-bench [26] 等近期基准正好刻画了这种需求. Seed2.0 把它当作一等需求.

Seed2.0 also pursues a broader goal: handling tasks with real-world complexity. The Seed team has focused on raising the intelligence ceiling, moving from Olympiad-style problems toward research-level reasoning tasks. Seed2.0 tackles Erdos problems and performs Scientific Coding, pushing the boundaries of machine intelligence  $[4, 8, 70, 76]$ .

Seed2.0 还追求一个更大的目标: 处理具有真实世界复杂性的任务. Seed 团队着力抬高智能上限, 从奥赛式题目走向研究级推理任务. Seed2.0 攻关 Erdős 问题并做 Scientific Coding, 推动机器智能的边界 $[4, 8, 70, 76]$.

Current agent systems, however, show an interesting asymmetry: they solve competition-level problems yet often fail to reliably complete practical tasks end-to-end—like building a well-designed application in one pass  $[17]$ . Two factors explain this gap. First, real-world tasks span long horizons and multiple stages, but

然而当前的 agent 系统呈现一种有意思的不对称: 它们能解竞赛级题目, 却常常无法可靠地端到端完成实际任务, 比如一次做出一个设计良好的应用 $[17]$. 这个差距有两个原因. 第一, 真实任务跨越长时程和多个阶段, 但

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">$^{1}$ Seed ranks 6th on the LMSYS Chatbot Arena — Text Arena (Overall) leaderboard and 3rd on the Vision Arena leaderboard as of Feb 16, 2026.</span></small>

<small>$^{1}$ 截至 2026 年 2 月 16 日, Seed 在 LMSYS Chatbot Arena 的 Text Arena (Overall) 榜排第 6, 在 Vision Arena 榜排第 3.</small>

<!-- page 2 of 78 -->

![Chart block](images/p02-figure-1-maas-usage-distribution-in-mainland-china-left.png)

Figure 1 MaaS usage distribution in mainland China. Left: Industry traffic distribution showing strong dominance of the Internet sector. Right: Business Customer Usage Scenario Distribution. These statistics is named “Doubao Collaboration Incentive Program”, which sourced from the authorization of customers who have signed the Data Authorization Agreement.

图 1 中国大陆 MaaS 使用分布. 左: 行业流量分布, 互联网行业占绝对主导. 右: 企业客户使用场景分布. 这些统计来自「豆包协作激励计划」, 数据源于签署了数据授权协议的客户授权.

existing LLM agents struggle to autonomously construct effective workflows and accumulate experience over extended timescales  $[5, 37, 60]$ . Second, real-world knowledge is highly domain-specific and long-tailed; models strong in math and code often provide little value in specialized professional contexts. Seed2.0 addresses this through systematic ingestion of long-tail domain knowledge  $[40, 132]$ .

现有 LLM agent 难以自主构建有效的工作流, 也难以在较长时间尺度上积累经验 $[5, 37, 60]$. 第二, 真实世界知识高度依赖领域且呈长尾分布; 数学和代码强的模型, 在专业场景里往往帮不上什么忙. Seed2.0 通过系统性地吸收长尾领域知识来应对这一点 $[40, 132]$.

This report presents our initial progress toward real-world complexity. To systematically track and guide this effort, we establish an evaluation framework spanning four dimensions: Science Discovery, Vibe Coding, Context Learning, and Real-World Tasks—each targeting a core aspect of complex, long-horizon agent performance. This framework serves both as a benchmark suite and an iterative development guide.

本报告介绍我们在真实世界复杂性方向上的初步进展. 为了系统地跟踪和引导这项工作, 我们建立了一个覆盖四个维度的评测框架: Science Discovery, Vibe Coding, Context Learning 和 Real-World Tasks, 每个维度对准复杂长时程 agent 表现的一个核心方面. 这个框架既是基准套件, 也是迭代开发的指南.

Note that the Seed2.0 Series still have gaps with international frontier LLMs, while Seed identifies the directions for enhancing the model's capabilities for real-world complexity and makes great efforts to optimize Seed Model Series in this regard. Seed2.0 Series have considerable gaps with Claude in terms of coding, taking SWE-Evo and NL2Repo as examples. Seed2.0 Series have relatively obvious gaps with Gemini in terms of long-tail knowledge closely related to user experience, taking SuperGPQA and SimpleQA-Verified as examples.

需要说明, Seed2.0 系列与国际前沿 LLM 仍有差距; Seed 已经找到了提升模型应对真实世界复杂性能力的方向, 并在这方面全力优化 Seed 模型系列. 在编码上, Seed2.0 系列与 Claude 差距明显, 以 SWE-Evo 和 NL2Repo 为例. 在与用户体验密切相关的长尾知识上, Seed2.0 系列与 Gemini 差距比较明显, 以 SuperGPQA 和 SimpleQA-Verified 为例.

In the following sections, we present Seed2.0's performance across standard benchmarks—where it performs on par with leading international frontier models—and showcase representative cases of Seed2.0 solving complex real-world problems.

接下来的章节会给出 Seed2.0 在标准基准上的表现(与国际前沿领先模型相当), 并展示 Seed2.0 解决复杂真实问题的代表性案例.

We invite readers to explore the capabilities of Seed2.0.

欢迎读者亲自体验 Seed2.0 的能力.

Seed2.0 is now accessible on Volcano Engine, under the model id: Doubao-Seed-2.0-pro.

Seed2.0 现已在火山引擎上线, 模型 id 为: Doubao-Seed-2.0-pro.

The model can be accessed at https://www.volcengine.com/experience/ark.

可通过 https://www.volcengine.com/experience/ark 访问该模型.

More details are available on the official page: https://seed.bytedance.com/zh/seed2.

更多信息见官方页面: https://seed.bytedance.com/zh/seed2.

## 2 Seed2.0 Deployment Patterns and Developer Behavior

2 Seed2.0 的部署模式与开发者行为

### 2.1 MaaS Usage in Mainland China

2.1 中国大陆的 MaaS 使用情况

MaaS usage patterns in mainland China concentrate heavily on enterprise-facing digital industries and cognitively intensive applications (Figure 1).

中国大陆的 MaaS 使用高度集中在面向企业的数字产业和认知密集型应用(Figure 1).

At the industry level, the Internet sector dominates overwhelmingly, accounting for the vast majority of traffic. Consumer electronics, finance, new retail, and business services follow at a considerable distance. Traditional verticals like manufacturing, automotive, and communication each represent less than $1\%$ of total usage, perhaps due to the capability shortcomings of the previous Seed model series. The leading industries share key characteristics: higher information density, faster product iteration cycles, and tighter integration between models and production systems. Seed2.0 operates primarily within large-scale digital infrastructures where models participate directly in core business workflows, not as peripheral productivity tools.

在行业层面, 互联网行业占压倒性优势, 占了绝大部分流量. 消费电子, 金融, 新零售和商业服务紧随其后, 但差距很大. 制造, 汽车和通信等传统垂直行业各自不到总用量的 $1\%$, 原因可能是此前 Seed 模型系列能力不足. 领先行业有几个共同特征: 信息密度更高, 产品迭代更快, 模型与生产系统结合更紧. Seed2.0 主要运行在大规模数字基础设施之中, 模型直接参与核心业务流程, 而不是边缘的效率工具.

<!-- page 3 of 78 -->

![Chart block](images/p03-figure-2-query-distribution-by-development-and.png)

Figure 2 Query distribution by development and requirement domain. Frontend development and bug fixing substantially dominate agentic coding requests, each far exceeding their respective category alternatives.

图 2 按开发领域和需求领域划分的查询分布. 前端开发和 bug 修复在 agentic coding 请求中占绝对多数, 各自远超同类别的其他选项.

Table 1 API Token Prefill / Decode Price Comparison (USD per 1M tokens). For Seed2.0 models with interval pricing, we report a single representative price.

表 1 API token Prefill / Decode 价格对比(美元 / 每 1M token). 对于分档计价的 Seed2.0 模型, 我们报告一个代表性价格.

| Model | Prefill (Input) | Decode (Output) |
| --- | --- | --- |
| GPT-5.2 High | $1.75 | $14.00 |
| Claude-Opus-4.5-thinking | $5.00 | $25.00 |
| Gemini-3-Pro | $2.00-4.00* | $12.00-18.00* |
| Claude-Sonnet-4.5-thinking | $3.00 | $15.00 |
| GPT-5.0-mini High | $0.25 | $2.00 |
| Gemini-3-Flash High | $0.50-1.00* | $3.00* |
| Seed2.0 Pro | $0.47 (¥3.41) | $2.37 (¥17.04) |
| Seed2.0 Lite | $0.09 (¥0.64) | $0.53 (¥3.83) |
| Seed2.0 Mini | $0.03 (¥0.22) | $0.31 (¥2.24) |

\*Gemini prices are ranges over context tiers (and input modalities for Flash) from vendor pricing pages.

\*Gemini 价格是按上下文档位(Flash 还按输入模态)给出的区间, 取自厂商定价页.

At the scenario level, we analyze data from the Doubao Collaboration Incentive Program $^{2}$ $^{3}$, an open program that encourages partners and developers to grant authorization for the use of authentic model usage data (Figure 1, right). Unstructured information processing and analysis dominates, representing the largest single share. Education, content creation, and search and recommendation follow as the next tier. Together, these top scenarios account for most deployment cases. Specialized applications—social companion, professional consulting, customer service and sales, quality inspection, coding, and structured information processing—each occupy substantially smaller shares. This pattern reflects how enterprises currently adopt AI: they start with scenarios requiring models to process heterogeneous data at scale, synthesize cross-domain knowledge, and generate actionable insights. More specialized use cases remain in earlier deployment stages.

在场景层面, 我们分析了豆包协作激励计划 $^{2}$ $^{3}$ 的数据, 这是一个开放计划, 鼓励合作方和开发者授权使用真实的模型使用数据(Figure 1, 右). 非结构化信息处理与分析占比最大. 教育, 内容创作, 搜索与推荐构成第二梯队. 这几个头部场景合起来占了大多数部署案例. 专门化应用, 包括社交陪伴, 专业咨询, 客服与销售, 质检, 编码和结构化信息处理, 各自占比小得多. 这一分布反映了企业当前采用 AI 的方式: 先从需要模型大规模处理异构数据, 综合跨领域知识并产出可执行洞见的场景做起. 更专门的用例仍处在较早的部署阶段.

The dominant scenarios impose specific technical demands: models must handle long contexts, integrate heterogeneous knowledge sources, execute multi-step instructions, and produce structured, high-fidelity outputs for downstream systems. In unstructured information processing—the largest category—enterprises use Seed Models to analyze user feedback, extract insights from multi-source documents, and generate structured reports for decision-making. Education applications power intelligent tutoring systems and personalized learning content. Content creation leverages multimodal capabilities for automated writing, video script generation, and multimedia synthesis. Search and recommendation systems integrate Seed Models for improved semantic understanding and ranking accuracy.

头部场景提出了具体的技术要求: 模型必须处理长上下文, 整合异构知识源, 执行多步指令, 并为下游系统产出结构化的高保真输出. 在最大的类别非结构化信息处理中, 企业用 Seed 模型分析用户反馈, 从多源文档中提取洞见, 为决策生成结构化报告. 教育应用支撑智能辅导系统和个性化学习内容. 内容创作借助多模态能力做自动写作, 视频脚本生成和多媒体合成. 搜索与推荐系统接入 Seed 模型, 以改进语义理解和排序准确率.

Seed Model functions as a workflow-oriented MaaS foundation rather than a lightweight conversational model, emphasizing multimodal understanding, long-context reasoning, structured generation, and tool-augmented execution for reliable end-to-end enterprise task completion.

Seed 模型的定位是面向工作流的 MaaS 底座, 而不是轻量的对话模型; 它强调多模态理解, 长上下文推理, 结构化生成和工具增强执行, 以可靠地端到端完成企业任务.

Globally, this approach aligns with recent enterprise AI reports from OpenAI, Anthropic, and Google Cloud, which identify software engineering, research, analytics, customer support, and knowledge work as the fastest-growing enterprise AI categories  $[3, 34, 64]$ .

从全球看, 这一路线与 OpenAI, Anthropic 和 Google Cloud 近期的企业 AI 报告一致, 这些报告认为软件工程, 研究, 分析, 客户支持和知识工作是增长最快的企业 AI 类别 $[3, 34, 64]$.

### 2.2 Query Distribution in Agentic Coding

2.2 Agentic Coding 中的查询分布

To understand real-world interaction patterns in agentic coding, we analyze trajectory-level developer usage data. The most striking finding is the dominance of frontend development (Figure 2). Queries related to page layout, styling, and UI logic management far exceed those for backend services, client-side applications, or full-stack integration. This distribution likely reflects both the iterative nature of frontend work—where visual feedback loops encourage frequent model interactions—and the relative accessibility of frontend tasks for AI assistance.

为了理解 agentic coding 中的真实交互模式, 我们分析了轨迹级的开发者使用数据. 最显眼的发现是前端开发占主导(Figure 2). 与页面布局, 样式和 UI 逻辑管理相关的查询, 远多于后端服务, 客户端应用或全栈集成. 这种分布可能既反映了前端工作的迭代性质(视觉反馈回路促使开发者频繁与模型交互), 也反映了前端任务相对更容易得到 AI 辅助.

Programming language and framework statistics reinforce this pattern. Frontend-related languages (JavaScript, TypeScript, CSS, HTML) collectively account for the majority of code touched in these sessions. Among

编程语言和框架的统计也印证了这一点. 前端相关语言(JavaScript, TypeScript, CSS, HTML)合计占这些会话所涉代码的大部分. 在

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">$^{2}$ https://www.volcengine.com/docs/82379/1391869?lang=zh</span></small>

<small>$^{2}$ 豆包协作激励计划说明页: https://www.volcengine.com/docs/82379/1391869?lang=zh</small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">$^{3}$ https://docs.byteplus.com/en/docs/legal/data\_authorization\_agreement\_modelark</span></small>

<small>$^{3}$ BytePlus ModelArk 数据授权协议(链接见上方英文脚注).</small>

<!-- page 4 of 78 -->

frameworks, Vue.js leads decisively—more than three times the adoption of React—reflecting the developer ecosystem in mainland China where Vue has historically enjoyed stronger community support.

框架中, Vue.js 遥遥领先, 采用量是 React 的三倍以上, 这反映了中国大陆的开发者生态: Vue 在这里一向有更强的社区支持.

By task type, bug fixing dominates, followed by refactoring and documentation work. This distribution suggests developers primarily turn to AI assistance for reactive maintenance rather than greenfield development. The high proportion of debugging queries indicates that error diagnosis and resolution remain significant pain points where AI provides clear value.

按任务类型看, bug 修复占主导, 其次是重构和文档工作. 这说明开发者主要把 AI 辅助用于被动维护, 而不是从零开发. 调试类查询占比高, 表明错误诊断与修复仍是明显痛点, AI 在这里价值清楚.

These patterns carry implications for model development. The concentration on frontend work suggests that JavaScript/TypeScript understanding, CSS layout reasoning, and framework-specific knowledge should be prioritized. The prevalence of bug-fixing queries indicates that models benefit from strong debugging capabilities—the ability to trace error messages, understand stack traces, and reason about program state.

这些模式对模型开发有启示. 前端工作集中, 说明应优先加强 JavaScript/TypeScript 理解, CSS 布局推理和特定框架知识. bug 修复查询普遍, 说明模型受益于强调试能力: 能追踪报错信息, 读懂调用栈, 推理程序状态.

### 2.3 Cost Efficiency

2.3 成本效率

A key advantage of Seed2.0 lies in its cost structure. Table 1 compares API pricing across major foundation models. While Seed2.0 achieves comparable performance to frontier models on user experience, its token pricing is roughly an order of magnitude lower.

Seed2.0 的一个关键优势在于成本结构. Table 1 对比了主要基础模型的 API 价格. Seed2.0 在用户体验上与前沿模型表现相当, 而 token 价格大约低一个数量级.

> **问:** 「低一个数量级」对着 Table 1 算出来是多少? 单价低是否等于单任务便宜?
> 按 Table 1 算, Seed2.0 Pro 的 decode 价 $2.37 对 GPT-5.2 High 的 $14.00 约为 5.9 倍, 对 Claude-Opus-4.5-thinking 的 $25.00 约为 10.5 倍; prefill 价 $0.47 对 GPT-5.2 的 $1.75 只有约 3.7 倍. 只有对 Opus 才接近十倍. 单价也不等于单任务成本: 单任务花费 = 单价 × token 数, 而 Table 15 的 WorldTravel 一行显示 Seed2.0 Pro 平均 1486 个 completion token, GPT-5.2 High 是 9190, token 数本身又差了约 6 倍. 两个因子要分开看.

This cost differential is particularly significant for enterprise MaaS deployments. In scenarios involving high-volume, workflow-integrated usage—such as the unstructured information processing and content generation tasks described above—API costs can become a limiting factor for adoption. Seed2.0's pricing enables use cases that would be economically infeasible with more expensive alternatives, without sacrificing the reasoning and generation quality required for production systems.

这种成本差异对企业 MaaS 部署尤其重要. 在高调用量, 深度接入工作流的场景里(比如上面提到的非结构化信息处理和内容生成), API 费用可能成为采用的瓶颈. Seed2.0 的定价让一些在更贵方案下经济上不可行的用例变得可行, 同时不牺牲生产系统所需的推理和生成质量.

The Seed2.0 Series offer tiered options to match different workload requirements. Seed2.0 Pro targets complex reasoning and long-context tasks where capability is paramount. Seed2.0 Lite provides a balanced trade-off for general-purpose applications. Seed2.0 Mini, with decode pricing under \$0.50 per million tokens, opens possibilities for high-throughput, latency-sensitive applications where cost per query must remain minimal.

Seed2.0 系列提供分级选项, 以匹配不同的负载需求. Seed2.0 Pro 面向能力优先的复杂推理和长上下文任务. Seed2.0 Lite 为通用应用提供均衡的取舍. Seed2.0 Mini 的 decode 价低于每百万 token \$0.50, 为高吞吐, 延迟敏感, 单次查询成本必须极低的应用打开了空间.

## 3 Comprehensive Evaluation Framework and Methodology

3 综合评测框架与方法

### 3.1 Fundamental Language Capacity

3.1 基础语言能力

This section evaluates Seed2.0's fundamental capabilities, including reasoning, complex instruction following, and broad knowledge understanding. We compare our results with representative frontier models, including GPT-5.2 High, Claude-Sonnet-4.5, Claude-Opus-4.5, Gemini-3-Pro High, and Gemini-3-Flash High.

本节评测 Seed2.0 的基础能力, 包括推理, 复杂指令遵循和广泛的知识理解. 我们与有代表性的前沿模型对比, 包括 GPT-5.2 High, Claude-Sonnet-4.5, Claude-Opus-4.5, Gemini-3-Pro High 和 Gemini-3-Flash High.

> **核对:** 对手标了 High 或 thinking, Seed2.0 自己用的是思考模式还是默认模式?
> 原文没写. 对手一侧写得很细: Table 3 的 GPT-5.2 High 和 Gemini-3-Pro High 标了推理档位, Table 1 的 Claude 写成 「Claude-Opus-4.5-thinking」, 到 Table 3 又只写 「Claude-Opus-4.5」. Seed2.0 一侧只有名字. 唯一旁证在 Table 15: XBench 一行给出 Seed2.0 Pro 平均 277.49 个 reasoning token, WorldTravel 一行是 1286, 说明这些评测里它开着思考. 但思考预算多大, 各表是否一致, 默认模式下分数是多少, 全文都没有. 对手的 Claude 在 Table 3 是否开了 thinking 也说不清, 这会直接影响 Table 3 里 Claude 那两列的解读.

Specifically, we evaluate Seed2.0 on AIME 2025 and HMMT 2025 [4], BeyondAIME [8], IMOAnswerBench (no tool) [53], AetherCode [99], LiveCodeBench(v6) [44], Codeforces Elo Rating [74, 127] on the problem set from June to December 2025, GPQA Diamond [76], PhyBench [73], BABE [82], KORBench [54], ARC-AGI-1/2 [72], Inverse IFEval [123], MARS-Bench [108], MultiChallenge [24], COLLIE [113], MMLU-Pro [96], SuperGPQA [28], and LPFQA [132], along with a set of internal benchmarks designed to reflect high-value real-world tasks. For Graphwalks, we use our in-house tokenization pipeline during evaluation, which leads to a mismatch in how tokens are counted compared with the official OpenAI Graphwalks tokenization and scoring setup.

具体来说, 我们在以下基准上评测 Seed2.0: AIME 2025 和 HMMT 2025 [4], BeyondAIME [8], IMOAnswerBench (no tool) [53], AetherCode [99], LiveCodeBench(v6) [44], 基于 2025 年 6 月至 12 月题集的 Codeforces Elo Rating [74, 127], GPQA Diamond [76], PhyBench [73], BABE [82], KORBench [54], ARC-AGI-1/2 [72], Inverse IFEval [123], MARS-Bench [108], MultiChallenge [24], COLLIE [113], MMLU-Pro [96], SuperGPQA [28] 和 LPFQA [132], 另外还有一组为反映高价值真实任务而设计的内部基准. 对 Graphwalks, 我们在评测中使用自研的 tokenization 流程, 因此 token 的计数方式与 OpenAI 官方 Graphwalks 的 tokenization 和计分设置不一致.

> **看表:** Graphwalks 换了 tokenizer, Table 3 的 「<128k」 还是同一批题吗?
> 不一定. Graphwalks 按上下文长度切子集, 「<128k」 这个门槛是用 token 数量量的. 换成自研 tokenization 后, 同一道题的 token 数会变, 落进 「<128k」 的题目集合也会变, 分母就不再是官方那一批. Table 3 里 Seed2.0 Pro 的 Graphwalks Bfs 是 68.9, GPT-5.2 High 是 98.0; 如果对手的数字来自官方口径, 这一行其实是两个分母在比. Table 4 的 Graphwalks Parents 一行 Seed2.0 Lite 拿到 100.0, 同样要带着这个前提读.

#### 3.1.1 Long-tail Professional Knowledge Benchmarks

3.1.1 长尾专业知识基准

While benchmarks such as SimpleQA or HLE are valuable probes of factual recall and difficult trivia, they often emphasize rare or idiosyncratic facts that are only occasionally useful in real-world workflows. Inspired by the design philosophy of SuperGPQA [28], we place stronger emphasis on professionally relevant long-tail knowledge that arises in practical work settings. To this end, we design two new benchmarks, LPFQA and Encyclo-K, to directly measure a model's ability to function as a high-end search engine over long-tail professional knowledge.

SimpleQA 或 HLE 这类基准能很好地探测事实记忆和高难冷知识, 但它们往往偏重罕见或怪僻的事实, 这些事实在真实工作流里只是偶尔有用. 受 SuperGPQA [28] 设计理念启发, 我们更强调实际工作中出现的, 与专业相关的长尾知识. 为此, 我们设计了两个新基准 LPFQA 和 Encyclo-K, 直接衡量模型能否充当长尾专业知识上的高端搜索引擎.

LPFQA. LPFQA (Long-tail Professional Forum-based Question Answering) [132] is constructed from long-tail questions collected from professional forums and expert communities. It evaluates whether a model can correctly answer realistic, domain-specific questions encountered in daily work, covering fields such as

LPFQA. LPFQA(基于专业论坛的长尾问答)[132] 由从专业论坛和专家社区收集的长尾问题构成. 它评测模型能否正确回答日常工作中遇到的真实领域问题, 覆盖的领域包括

<!-- page 5 of 78 -->

programming, finance, engineering, medicine, and applied science. LPFQA therefore measures the model's reliability in retrieving and synthesizing long-tail professional knowledge.

编程, 金融, 工程, 医学和应用科学. 因此 LPFQA 衡量的是模型检索和综合长尾专业知识的可靠性.

Encyclo-K. Encyclo-K [48] evaluates genuine mastery of book-level professional knowledge. It extracts atomic knowledge statements from books and dynamically composes them into evaluation instances, enabling flexible construction of test sets. This design supports both zero-shot and few-shot in-context learning (ICL) evaluation, allowing us to probe knowledge acquisition in pre-training and post-training stages. Compared with static QA datasets, Encyclo-K provides a scalable and compositional way to assess whether models internalize structured knowledge from long-form sources.

Encyclo-K. Encyclo-K [48] 评测模型是否真正掌握书本级的专业知识. 它从书中抽取原子化的知识陈述, 再动态组合成评测样本, 可以灵活构造测试集. 这种设计同时支持 zero-shot 和 few-shot 的上下文学习(ICL)评测, 让我们能分别考察预训练和后训练阶段的知识获取. 与静态 QA 数据集相比, Encyclo-K 提供了一种可扩展, 可组合的方式, 用来评估模型是否把长篇来源中的结构化知识内化了.

HLE-Verified. HLE-Verified (Humanity's Last Exam—Verified) is a curated subset of Humanity's Last Exam created in response to researchers reporting inaccurate, blurry, or underspecified questions in the original benchmark. We hire domain experts to review and select only questions that are clear, unambiguous, and confidently verifiable, thereby providing a more reliable evaluation of a model's true performance on challenging expert-level problems.

HLE-Verified. HLE-Verified(Humanity's Last Exam—Verified)是 Humanity's Last Exam 的一个精选子集, 起因是研究者反映原基准中有不准确, 模糊或条件不足的题目. 我们聘请领域专家审题, 只保留清晰, 无歧义, 能有把握验证的题目, 从而更可靠地评估模型在高难专家级问题上的真实表现.

### 3.2 Fundamental Vision Capacity

3.2 基础视觉能力

To comprehensively evaluate the vision capabilities of Seed2.0, we conduct extensive evaluations across 50 public image benchmarks and 24 public video benchmarks. For image understanding, the selected benchmarks cover nine distinct categories: Math, STEM, Visual Puzzles, Perception & Recognition, General VQA, Pointing & Counting, 2D & 3D Spatial Understanding, Document & Chart Understanding and LongContext Understanding. The following benchmarks are used for evaluating the image understanding capability of Seed2.0:

为了全面评测 Seed2.0 的视觉能力, 我们在 50 个公开图像基准和 24 个公开视频基准上做了大量评测. 图像理解方面, 所选基准覆盖九个类别: 数学, STEM, 视觉谜题, 感知与识别, 通用 VQA, 指点与计数, 2D 与 3D 空间理解, 文档与图表理解, 以及长上下文理解. 以下基准用于评测 Seed2.0 的图像理解能力:

\- MultiModal Math: Mathematical reasoning within a visual context constitutes a core challenge for modern multimodal models, requiring rigorous logic and symbol grounding. To evaluate this capability, we employ a suite of benchmarks including MathVista (testmini) [52], MathVision [94], DynaMath [133], MathKangaroo [4], and MathCanvas [81]. Regarding specific metrics, for DynaMath, we report the worst-case accuracy, requiring the model to correctly answer all 10 variants of a problem to score. For MathKangaroo, performance is measured by the average accuracy across all bimonthly competitions in 2025, while complete accuracy is utilized for MathCanvas.

\- 多模态数学: 视觉情境下的数学推理是现代多模态模型的核心挑战, 需要严密的逻辑和符号落地. 为此我们使用一组基准, 包括 MathVista (testmini) [52], MathVision [94], DynaMath [133], MathKangaroo [4] 和 MathCanvas [81]. 指标方面, DynaMath 报告最差情形准确率, 模型要答对一道题的全部 10 个变体才得分. MathKangaroo 取 2025 年所有双月竞赛的平均准确率, MathCanvas 使用完全准确率.

\- MultiModal STEM: Mastery of domain-specific knowledge in science and engineering is essential for expert-level assistance. We assess this competence using MMMU [117], MMMU-Pro [118], EMMA [36], SFE [131], HiPhO [116], XLRS-Bench [92], and PhyX [80]. In terms of evaluation settings, for MMMU-Pro, we aggregate scores across the Standard (10 options) and Vision subsets. For HiPhO, the reported metric is the average normalized score from 13 Physics Olympiad competitions. For XLRS-Bench, we calculate the macro average accuracy on the lite subset. For PhyX, we report the accuracy over the testmini openended subset.

\- 多模态 STEM: 掌握理工领域的专业知识, 是提供专家级帮助的前提. 我们用 MMMU [117], MMMU-Pro [118], EMMA [36], SFE [131], HiPhO [116], XLRS-Bench [92] 和 PhyX [80] 评估这项能力. 评测设置上, MMMU-Pro 汇总 Standard(10 个选项)和 Vision 两个子集的分数. HiPhO 报告 13 场物理奥赛的平均归一化得分. XLRS-Bench 计算 lite 子集上的宏平均准确率. PhyX 报告 testmini 开放式子集上的准确率.

\- Visual Puzzles: Abstract reasoning and pattern recognition capabilities are tested through puzzle-solving tasks, which serve as a proxy for general intelligence. Our evaluation includes LogicVista [106], VPCT [7], ZEROBench [77], ArcAGI (Image) [72], and VisuLogic [107]. Specifically, for ZEROBench, we assess accuracy on both main questions and sub-questions. In the case of ArcAGI, models are provided with both text matrices and rendered images. We notice that the additional visual input significantly improves the performance of Seed2.0 on ArcAGI.

\- 视觉谜题: 抽象推理和模式识别能力通过解谜任务测试, 这类任务可作为通用智能的代理指标. 我们的评测包括 LogicVista [106], VPCT [7], ZEROBench [77], ArcAGI (Image) [72] 和 VisuLogic [107]. 其中 ZEROBench 同时评估主问题和子问题的准确率. ArcAGI 同时给模型提供文本矩阵和渲染后的图像. 我们注意到, 额外的视觉输入显著提升了 Seed2.0 在 ArcAGI 上的表现.

\- Perception & Cognition: Ensuring reliability involves minimizing hallucinations and mitigating biases in visual interpretation. We investigate these fundamental perceptual traits using VLMsAreBiased [90], VLMsAreBlind [75], VisFactor [41], RealWorldQA [105], and BabyVision [15]. For VisFactor, we report the macro average accuracy over all constituent tasks.

\- 感知与认知: 可靠性要求尽量减少幻觉, 并减轻视觉解读中的偏差. 我们用 VLMsAreBiased [90], VLMsAreBlind [75], VisFactor [41], RealWorldQA [105] 和 BabyVision [15] 考察这些基础感知特性. VisFactor 报告所有子任务的宏平均准确率.

\- General VQA: The model's versatility in handling open-ended queries and following instructions is reflected in General Visual Question Answering. This broad capability is gauged via SimpleVQA [20], HallusionBench [35], MME-CC [122], MMStar [16], MUIRBench [91], MTVQA [83], VibeEval [66], and ViVerBench [124]. Distinctively, for MTVQA, we deploy an LLM-judge (Deepseek-V3-0324) rather than rule-based matching to evaluate predictions. For VibeEval, raw scores on the 1–5 scale are normalized to a 0–100 range for reporting.

\- 通用 VQA: 模型处理开放式提问和遵循指令的多面能力, 体现在通用视觉问答上. 这项宽泛能力用 SimpleVQA [20], HallusionBench [35], MME-CC [122], MMStar [16], MUIRBench [91], MTVQA [83], VibeEval [66] 和 ViVerBench [124] 衡量. 不同之处在于, MTVQA 用 LLM 评审(Deepseek-V3-0324)而非规则匹配来评判预测. VibeEval 把 1–5 分的原始分归一化到 0–100 后报告.

\- Point & Counting: Fine-grained visual grounding and precise object enumeration are critical for tasks requiring high spatial fidelity. We measure these skills using CountBench [67], FSC-147 [2], and PointBench [19]. With respect to evaluation metrics, we report the Mean Absolute Error (MAE) for FSC-147.

\- 指点与计数: 细粒度视觉定位和精确计数, 对需要高空间保真度的任务至关重要. 我们用 CountBench [67], FSC-147 [2] 和 PointBench [19] 衡量这些技能. 评测指标上, FSC-147 报告平均绝对误差(MAE).

<!-- page 6 of 78 -->

\- 2D & 3D Spatial Understanding: Comprehending geometric relationships and depth is vital for embodied agents and 3D-aware applications. We utilize a comprehensive set of benchmarks including BLINK [33], MMSIBench [112], TreeBench [93], RefSpatialBench [128], DA-2K [111], All-Angles [114], and ERQA [85]. To ensure a robust assessment of spatial consistency in MMSIBench, we apply the circular evaluation strategy [49].

\- 2D 与 3D 空间理解: 理解几何关系和深度, 对具身 agent 和3D 感知应用至关重要. 我们使用一整套基准, 包括 BLINK [33], MMSIBench [112], TreeBench [93], RefSpatialBench [128], DA-2K [111], All-Angles [114] 和 ERQA [85]. 为了稳健评估 MMSIBench 的空间一致性, 我们采用循环评测策略 [49].

\- Document & Chart Understanding: The ability to extract information from dense texts and interpret complex infographics is key for professional workflows. This domain is covered by ChartQAPro [58], OCRBenchv2 [31], OmniDocBench [65], and CharXiv [100]. For scoring specifics, OCRBenchv2 results represent the average of overall English and Chinese scores. We use Normalized Edit Distance (NED) for OmniDocBench 1.5, and for CharXiv, we average accuracy across both descriptive questions (DQ) and reasoning questions (RQ).

\- 文档与图表理解: 从密集文本中提取信息, 解读复杂信息图, 是专业工作流的关键. 这一领域由 ChartQAPro [58], OCRBenchv2 [31], OmniDocBench [65] 和 CharXiv [100] 覆盖. 计分细节: OCRBenchv2 的结果是英文与中文总分的平均. OmniDocBench 1.5 使用归一化编辑距离(NED); CharXiv 取描述类问题(DQ)与推理类问题(RQ)准确率的平均.

\- LongContext Understanding: Processing extensive visual inputs, such as multi-page documents or long-form videos, tests the model's memory and temporal reasoning. To benchmark this capacity, we select DUDE [89], MMLongBench [98], LongDocURL [22], and MMLongBench-Doc [56].

\- 长上下文理解: 处理大量视觉输入(如多页文档或长视频)考验模型的记忆和时序推理. 为衡量这项能力, 我们选用 DUDE [89], MMLongBench [98], LongDocURL [22] 和 MMLongBench-Doc [56].

For video understanding, we conducted an extensive evaluation across six dimensions: video knowledge, video reasoning, fundamental video perception and motion understanding, long-video understanding, multi-video understanding, and streaming video understanding, covering a total of 24 open benchmarks.

视频理解方面, 我们从六个维度做了大量评测: 视频知识, 视频推理, 基础视频感知与运动理解, 长视频理解, 多视频理解, 以及流式视频理解, 共覆盖 24 个公开基准.

\- Video Knowledge: We mainly adopt VideoMMMU [39], MMVU [125], and VideoSimpleQA [10] to evaluate the model's video knowledge capability. These benchmarks evaluate not only the model's mastery of world knowledge expressed in videos, but also its ability to acquire and internalize knowledge from video content.

\- 视频知识: 我们主要用 VideoMMMU [39], MMVU [125] 和 VideoSimpleQA [10] 评测模型的视频知识能力. 这些基准不仅评估模型对视频中所表达的世界知识的掌握, 也评估它从视频内容中获取并内化知识的能力.

\- Video Reasoning: Multi-hop reasoning and video state tracking are core competencies for video reasoning. To this end, we conduct an in-depth evaluation using VideoReasonBench [51], Morse-500 [9], VideoHolmes [18], and Minerva [62]. Given that Morse-500 places a stronger emphasis on reasoning over physical dynamics, we increase the input frame rate to 5 FPS for this benchmark (the same setting is applied to all compared models).

\- 视频推理: 多跳推理和视频状态跟踪是视频推理的核心能力. 为此我们用 VideoReasonBench [51], Morse-500 [9], VideoHolmes [18] 和 Minerva [62] 做深入评测. 由于 Morse-500 更侧重物理动态推理, 我们把该基准的输入帧率提高到 5 FPS(所有对比模型采用相同设置).

\- Motion & Perception: Foundational video perception, particularly motion perception, is central to video understanding. We therefore evaluate this capability using TVBench [21], ContPhy [126], TempCompass [50], EgoTempo [71], TOMATO [78], and MotionBench [38]. Given the prevalence of fast motion and rapid temporal state changes in these benchmarks, we increase the input frame rate to 2 FPS across all evaluations (the same setting is applied to all compared models).

\- 运动与感知: 基础视频感知, 尤其是运动感知, 是视频理解的核心. 因此我们用 TVBench [21], ContPhy [126], TempCompass [50], EgoTempo [71], TOMATO [78] 和 MotionBench [38] 评测这项能力. 由于这些基准中快速运动和快速时序状态变化很普遍, 我们在所有评测中把输入帧率提高到 2 FPS(所有对比模型采用相同设置).

> **拆开:** 「所有对比模型采用相同设置」和 Table 9 里带星号的数字能同时成立吗?
> 拆成两类数字看. 一类是 Seed 自己跑的, 可以统一到 2 FPS 或 5 FPS. 另一类是 Table 9 标 * 的, 表注说它们「取自技术报告」, 例如 Gemini-3-Pro 的 VideoMMMU 87.6* 和 MotionBench 70.3*. 技术报告里的数字用的是对方自己的帧率, 不可能事后改成 2 FPS. 所以 MotionBench 这一行里 Seed2.0 Pro 的 75.2 对 Gemini-3-Pro 的 70.3*, 不在「相同设置」的承诺范围内. Morse-500 那一行没有星号, 这里的 37.4 对 33.0 才算同条件.

\- Long-Video Understanding: Long videos remain a major challenge in video understanding and a stringent test of a model's multimodal long-context reasoning. To accurately assess performance under long-video settings, we evaluate on VideoMME [30], CGBench [12], LongVideoBench [103], VideoEval-Pro [55], and LVBench [95], which include many hour-scale videos.

\- 长视频理解: 长视频仍是视频理解的一大难点, 也是对模型多模态长上下文推理的严格检验. 为准确评估长视频场景下的表现, 我们在 VideoMME [30], CGBench [12], LongVideoBench [103], VideoEval-Pro [55] 和 LVBench [95] 上评测, 其中包含许多小时级视频.

\- Multi-Video Understanding: Multi-video understanding introduces new challenges for cross-context reasoning and is prevalent in real-world applications. Accordingly, we use CrossVid [46] as the primary benchmark to evaluate the model's performance on cross-video reasoning.

\- 多视频理解: 多视频理解给跨上下文推理带来新挑战, 在真实应用中很常见. 因此我们以 CrossVid [46] 作为主要基准, 评测模型的跨视频推理表现.

\- Streaming: To assess real-time perception and interaction capabilities, we employ a comprehensive benchmark suite. OVBench [43] and OVOBench [63] are utilized to evaluate online reasoning and temporal awareness; LiveSports3K [14] emphasizes fine-grained sports event perception; ODVBench [120] tests generalization in autonomous driving scenarios; and ViSpeak [32] focuses on real-time visual referring capabilities.

\- 流式: 为评估实时感知和交互能力, 我们使用一整套基准. OVBench [43] 和 OVOBench [63] 用于评测在线推理和时间感知; LiveSports3K [14] 强调细粒度体育事件感知; ODVBench [120] 测试自动驾驶场景下的泛化; ViSpeak [32] 聚焦实时视觉指代能力.

### 3.3 Fundamental Agentic Capacity

3.3 基础 Agent 能力

With the transition from passive assistants to agentic systems, LLMs must go beyond single-turn responses and demonstrate the ability to plan, invoke tools, interact with environments, and complete multi-step tasks. We define this foundational layer as Fundamental Agentic Capacity. To avoid underestimating competing products, the final score is defined as the maximum of the score reported in the official documentation and the score obtained in our tests.

随着从被动助手向 agent 系统转变, LLM 必须超越单轮回答, 展现规划, 调用工具, 与环境交互和完成多步任务的能力. 我们把这一基础层定义为基础 Agent 能力. 为避免低估竞品, 最终分数取官方文档报告分数与我们实测分数中的较高者.

> **确认:** 「取官方与实测的较高者」对谁有利? Table 11 的括号数字怎么读?
> 这条规则只作用于竞品, Seed2.0 用的是自己的单一实测. 对竞品取 max 会系统性抬高对手, 所以在 Table 11 里 Seed2.0 仍然领先的行(如 BrowseComp-zh 82.4 对 GPT-5.2 High 76.1)是在对自己不利的口径下赢的. 反过来, 括号里是「对齐设置下」的分数: BrowseComp 一行 GPT-5.2 High 写作 77.9 (65.3), 主数字取了较高的官方值, 对齐后是 65.3; Seed2.0 Pro 的 77.3 在主数字口径下排第二, 按对齐口径则明显领先. 同一格里两个数字就是两个协议, 加粗和下划线用的是主数字.

For better agentic evaluation, we conduct systematic refactoring of test scripts to optimize execution stability and reproducibility. We eliminate task-level entrypoint configurations to reduce redundant environment provisioning, consolidating execution environments into pre-built images. Where reference-script environments have degraded or contained errors, we perform targeted repairs to restore functionality. Additionally, we

为了更好地做 agent 评测, 我们系统重构了测试脚本, 以提高执行稳定性和可复现性. 我们去掉了任务级入口配置以减少重复的环境搭建, 把执行环境合并进预构建镜像. 对于参考脚本环境已退化或含错误的情况, 我们做了针对性修复以恢复功能. 此外, 我们

<!-- page 7 of 78 -->

replace external package repositories with internal mirrors to ensure consistent dependency resolution.

用内部镜像替换外部包仓库, 以保证依赖解析一致.

We also implement quality-based filtering to remove problematic test cases. This exclusion criterion targets several categories: multi-container Docker Compose scenarios that introduced unnecessary complexity; test cases where reference solutions fail to pass their own validation; cases exhibiting non-deterministic behavior across runs; tasks causing abnormal disk consumption; network-dependent problems with inconsistent outcomes; and scenarios requiring extended downloads or complex validation procedures that undermine reproducibility.

我们还按质量过滤掉有问题的测试样例. 排除标准针对几类: 引入不必要复杂度的多容器 Docker Compose 场景; 参考解自己都通不过验证的样例; 多次运行结果不确定的样例; 导致磁盘占用异常的任务; 依赖网络且结果不稳定的问题; 以及需要长时间下载或复杂验证流程, 从而损害可复现性的场景.

Specifically, we evaluate Seed2.0 across five representative dimensions: Coding Agents, Search Agents, Tool Use, GUI Agents, and Deep Research. These benchmarks cover repository-level software engineering (e.g., Terminal-Bench [59], SWE-Lancer [61], SWE-Bench [45], Multi-SWE-Bench [119], SWE-Bench Pro [23], SWE Multilingual [110], Scicode [87], SWE-Evo [86], Aider Polyglot, ArtifactsBench [121], CodeSimpleQA [109] and SpreadsheetBench Verified [57]), and Trae In-House Bench covering frontend and back-end production scenarios), broad and deep information seeking (e.g. BrowseComp [101, 130], HLE [70], WideSearch [102], FinSearchComp [40] and seal-0[69]), tool invocation and orchestration (e.g., $\tau^2$-Bench[5], BFCL-v4 [68], MCP-Mark [104], VitaBench [37]), agentic visual tasks(e.g. Minedojo-Verified [29], HLE-VL and MM-BrowseComp [47]) and long-horizon research reasoning and synthesis (e.g., DeepConsult [84], Deep Research [27] and ResearchRubrics [79]). Unless explicitly stated, evaluations are conducted without external tools and follow each benchmark's official protocol. For Terminal-Bench 2.0, we exclude three cases (extract-moves-from-video, mailman, and install-windows-3.11) due to network access restrictions and security considerations in our evaluation environment. The remaining tasks are adapted to our internal agent framework while preserving the original evaluation criteria.

具体来说, 我们从五个有代表性的维度评测 Seed2.0: Coding Agents, Search Agents, Tool Use, GUI Agents 和 Deep Research. 这些基准覆盖仓库级软件工程(如 Terminal-Bench [59], SWE-Lancer [61], SWE-Bench [45], Multi-SWE-Bench [119], SWE-Bench Pro [23], SWE Multilingual [110], Scicode [87], SWE-Evo [86], Aider Polyglot, ArtifactsBench [121], CodeSimpleQA [109] 和 SpreadsheetBench Verified [57], 以及覆盖前后端生产场景的 Trae In-House Bench), 广度与深度信息检索(如 BrowseComp [101, 130], HLE [70], WideSearch [102], FinSearchComp [40] 和 seal-0[69]), 工具调用与编排(如 $\tau^2$-Bench[5], BFCL-v4 [68], MCP-Mark [104], VitaBench [37]), agent 视觉任务(如 Minedojo-Verified [29], HLE-VL 和 MM-BrowseComp [47]), 以及长时程研究推理与综合(如 DeepConsult [84], Deep Research [27] 和 ResearchRubrics [79]). 除非特别说明, 评测不使用外部工具, 并遵循各基准的官方协议. 对 Terminal-Bench 2.0, 由于评测环境的网络访问限制和安全考虑, 我们排除了三个样例(extract-moves-from-video, mailman 和 install-windows-3.11). 其余任务适配到我们内部的 agent 框架, 同时保留原有评测标准.

> **回看:** Terminal-Bench 2.0 去掉 3 题, 再加上前面的质量过滤, Table 11 的分母和对手一样吗?
> 原文只说 Seed 这边去掉了 3 题并做了质量过滤, 没说对手的分数是否也在同一个缩小的题集上重跑. 按上一段「取官方与实测较高者」的规则, 对手的数字很可能部分来自官方全集. 于是 Table 11 的 Terminal Bench 2.0 一行(Seed2.0 Pro 55.8, GPT-5.2 High 62.4)可能是两个分母. 还有一处对不上: 同一个 Gemini-3-Pro High, 在 Table 11 是 56.9, 在 Table 13 是 54.2, 两张表都注明 「Using Terminus2」, 差出来的 2.7 分原文没有解释.

### 3.4 Advanced Economically & Scientifically Valuable Tasks

3.4 高阶经济与科学价值任务

As highlighted in the Introduction, the arrival of the Agent era fundamentally shifts the role of LLMs from answering isolated prompts to driving long-horizon, economically and scientifically valuable workflows. In this paradigm, models are expected to support scientific research, autonomously construct software systems, learn from user-provided context and documentation, and execute complex real-world tasks with tangible economic impact. Motivated by this shift, we build a set of scenario-grounded evaluations that directly reflect such real-world agentic workloads.

如 Introduction 所述, Agent 时代的到来从根本上改变了 LLM 的角色: 从回答孤立的提示, 变成驱动长时程, 有经济和科学价值的工作流. 在这一范式下, 人们期望模型支持科学研究, 自主构建软件系统, 从用户提供的上下文和文档中学习, 并执行有实际经济影响的复杂真实任务. 基于这一转变, 我们构建了一组扎根于场景的评测, 直接反映这类真实 agent 负载.

Specifically, we organize our advanced evaluations into four dimensions: Scientific Discovery, Vibe Coding, Context Learning, and Real-World Tasks. Each dimension is anchored by Seed-designed benchmarks targeting concrete failure modes observed in practice.

具体来说, 我们把高阶评测组织成四个维度: Scientific Discovery, Vibe Coding, Context Learning 和 Real-World Tasks. 每个维度都以 Seed 设计的基准为锚, 针对实践中观察到的具体失败模式.

Scientific Discovery. We introduce Ainstain Bench [27] and BABE [129] to evaluate research-oriented capability. Ainstain Bench emphasizes scientific coding, measuring whether models can implement and manipulate computational procedures used in scientific workflows. BABE focuses on reasoning over interleaved textual and visual scientific information in the biological domain, assessing whether models can perform research-style inference grounded in multimodal evidence [27, 84].

Scientific Discovery. 我们引入 Ainstain Bench [27] 和 BABE [129] 评测面向研究的能力. Ainstain Bench 强调科学编程, 衡量模型能否实现和操作科学工作流中使用的计算过程. BABE 聚焦生物领域中图文交织的科学信息推理, 评估模型能否基于多模态证据做研究式推断 [27, 84].

Vibe Coding. We build NL2Repo-Bench to measure whether a model can complete an entire software repository from a natural-language specification in a single end-to-end process. This benchmark targets long-horizon repository construction, cross-file consistency, and dependency management, reflecting the emerging demand for extreme “vibe coding” scenarios  $[44, 99, 127]$ .

Vibe Coding. 我们构建 NL2Repo-Bench, 衡量模型能否在一个端到端流程中仅凭自然语言规格完成整个软件仓库. 该基准针对长时程仓库构建, 跨文件一致性和依赖管理, 反映了新兴的极端 「vibe coding」 场景需求 $[44, 99, 127]$.

Economically Valuable Fields. Beyond fundamental capabilities such as reasoning and knowledge, we prioritize high-value real-world applications to ensure that Seed2.0's development aligns with practical economic utility. To this end, we have developed a suite of specialized in-house benchmarks [1] including:

Economically Valuable Fields. 在推理和知识等基础能力之外, 我们优先考虑高价值的真实应用, 确保 Seed2.0 的开发与实际经济效用对齐. 为此我们开发了一套专门的内部基准 [1], 包括:

\- Education: Evaluates performance in teaching-oriented scenarios, including problem solving, grading, explanation, and question generation, covering core subjects across K–12 levels.

\- 教育: 评测面向教学场景的表现, 包括解题, 批改, 讲解和出题, 覆盖 K–12 各阶段的核心学科.

\- Text Classification: Evaluates the model's ability to analyze text and generate structured outputs or labels. This integrates compositional tasks—where multiple elements like intent and slots are identified in a single inference—with broader information processing, such as sentiment analysis and the synthesis of core viewpoints from unstructured data.

\- 文本分类: 评测模型分析文本并生成结构化输出或标签的能力. 它结合了组合式任务(在一次推理中同时识别意图和槽位等多个元素)和更宽泛的信息处理, 如情感分析和从非结构化数据中综合核心观点.

<!-- page 8 of 78 -->

Table 2 Evaluation on 2025 Olympiad-level Mathematical Competitions. The Gold Medal thresholds are $\geq 35$ for IMO 2025 and $\geq 87$ for CMO 2025.

表 2 2025 年奥赛级数学竞赛评测. 金牌线为 IMO 2025 $\geq 35$, CMO 2025 $\geq 87$.

> **停一下:** Table 2 的两行分母不同, 金牌是在什么余量下拿到的? 用了多少推理算力?
> IMO 满分 42(6 题 × 7 分), CMO 满分 126(6 题 × 21 分), 两个分母不能横比. IMO 35/42 正好压在金牌线 35 上, P6 得 0 分, 任何一题少 1 分就掉出金牌; CMO 114/126 比金牌线 87 高出 27 分, 余量大得多. 另外, Appendix E.1 说明这些成绩来自 solve-verify-refine 的迭代流水线: 模型生成候选解, 自查漏洞, 再改写, 这是典型的 TestingTime 投入, 不是单次采样. 表里既没给迭代轮数, 也没说谁按什么细则打分, 所以 Table 2 衡量的是「模型 + 流水线」的组合.

| Competition | P1 | P2 | P3 | P4 | P5 | P6 | Overall | Medal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IMO 2025 | 7 | 7 | 7 | 7 | 7 | 0 | 35/42 | Gold |
| CMO 2025 | 21 | 21 | 9 | 21 | 21 | 21 | 114/126 | Gold |

\- Information Extraction: Assesses structured extraction of relevant elements (e.g., words, sentences, or fields) from heterogeneous documents, including meeting records, legal texts, contracts, and corporate knowledge bases.

\- 信息抽取: 评估从异构文档(包括会议记录, 法律文本, 合同和企业知识库)中结构化抽取相关要素(如词语, 句子或字段)的能力.

Context Learning. In enterprise and developer-facing settings, users require strict execution based on supplied context, such as long manuals or internal documents. Beyond existing evaluations like CL-Bench  $[26]$  and KOR-Bench  $[54]$ , we incorporate  $DeR^{2}$ , which evaluates whether models can extract and utilize useful information from noisy long-form technical documents to perform reasoning and problem solving  $[115]$ . Furthermore, we introduce two in-house scenarios  $[1]$  to reflect agentic workloads:

Context Learning. 在企业和面向开发者的场景中, 用户要求模型严格依据所给上下文(如长手册或内部文档)执行. 除 CL-Bench $[26]$ 和 KOR-Bench $[54]$ 等已有评测外, 我们纳入 $DeR^{2}$, 它评测模型能否从嘈杂的长篇技术文档中抽取并利用有用信息来推理和解题 $[115]$. 此外, 我们引入两个内部场景 $[1]$ 来反映 agent 负载:

\- Customer Support Q&A: Assesses the ability to recognize user intent and synthesize answers after retrieving information from enterprise knowledge bases, specifically handling cases where recalled information is highly noisy.

\- 客服问答: 评估模型识别用户意图, 从企业知识库检索信息后综合答案的能力, 特别是处理召回信息高度嘈杂的情况.

\- Complex Workflow: Validates the model's capacity to complete sophisticated, continuous tasks by synthesizing complex information and instructions provided within the context.

\- 复杂工作流: 验证模型综合上下文中给出的复杂信息和指令, 完成精细连续任务的能力.

Real-World Tasks. We construct fine-grained internal evaluations for end-to-end task fulfillment. In particular, we curate GDPVal-Verified, a reliable subset of GDPVal with rubric-based automatic evaluation, and build the comparable XpertBench [1]. In addition, we introduce WorldTravel [97] to measure the model's ability to decompose goals and produce executable multi-step plans in real-world scenarios.

Real-World Tasks. 我们构建细粒度的内部评测, 考察端到端的任务完成. 具体地, 我们整理了 GDPVal-Verified, 这是 GDPVal 的一个可靠子集, 采用基于 rubric 的自动评测, 并构建了可对比的 XpertBench [1]. 此外, 我们引入 WorldTravel [97], 衡量模型在真实场景中分解目标并产出可执行多步计划的能力.

Overall, this evaluation suite operationalizes the vision described in our Introduction: assessing whether LLMs can function as agentic systems that complete real tasks, rather than merely answering questions. By grounding evaluation in realistic workflows and long-horizon completion, we obtain a more faithful measurement of advanced economically and scientifically valuable capability.

总体而言, 这套评测把 Introduction 中描述的愿景落成了可操作的形式: 评估 LLM 能否作为 agent 系统完成真实任务, 而不只是回答问题. 通过把评测扎根于真实工作流和长时程完成度, 我们对高阶经济与科学价值能力得到了更忠实的测量.

## 4 Results

4 结果

### 4.1 Fundamental Language Evaluation

4.1 基础语言评测

We evaluate Seed2.0 (Pro/Lite/Mini) on a comprehensive suite of fundamental language benchmarks spanning knowledge and science, mathematics, code and STEM reasoning, long-context understanding, multilinguality, instruction following, and hallucination robustness. Tables 3 and 4 report the detailed results.

我们在一整套基础语言基准上评测 Seed2.0(Pro/Lite/Mini), 覆盖知识与科学, 数学, 代码与 STEM 推理, 长上下文理解, 多语言, 指令遵循和幻觉稳健性. Table 3 和 Table 4 给出详细结果.

Overall, Seed2.0 Pro sits comfortably within the international leading group across core language capabilities. Our optimization is shaped by large-scale product feedback: for user-facing deployments such as Doubao, we prioritize instruction-following robustness, long-tail knowledge coverage, and long-context stability; for coding-oriented products such as Trae, code reasoning and front-end generation quality take precedence. The benchmark results reflect these choices.

总体来看, Seed2.0 Pro 在核心语言能力上稳居国际第一梯队. 我们的优化受大规模产品反馈塑造: 对豆包这类面向用户的部署, 我们优先保证指令遵循的稳健性, 长尾知识覆盖和长上下文稳定性; 对 Trae 这类面向编码的产品, 代码推理和前端生成质量优先. 基准结果反映了这些取舍.

Knowledge and Science. Seed2.0 Pro leads on HealthBench and remains neck-and-neck with GPT-5.2 and Gemini-3-Pro on SuperGPQA and Encyclo-K, surpassing them in several cases. These gains matter for production: real user queries often probe obscure facts and domain-specific knowledge that generic training underserves.

知识与科学. Seed2.0 Pro 在 HealthBench 上领先, 在 SuperGPQA 和 Encyclo-K 上与 GPT-5.2 和 Gemini-3-Pro 不相上下, 若干情况下还超过它们. 这些提升对生产很重要: 真实用户查询常常涉及冷门事实和领域知识, 通用训练在这方面覆盖不足.

Mathematics, Code, and STEM Reasoning. Seed2.0 Pro demonstrates advanced proficiency in mathematical reasoning. It exhibits highly competitive performance on popular evaluation suites (AIME, HMMT) and

数学, 代码与 STEM 推理. Seed2.0 Pro 在数学推理上展现出高水平. 它在热门评测集(AIME, HMMT)上极具竞争力, 并且

> **再看:** Table 3 的 AIME 和 HMMT 差一两分, 能说明高下吗?
> 很难. AIME 每届 30 题, 一题约合 3.33 分; HMMT 也是 30 题左右. Table 3 里 AIME 2026 一行 Seed2.0 Pro 94.2, Gemini-3-Pro High 93.3, 差 0.9 分, 不到一题; HMMT Nov 2025 一行 Claude-Opus-4.5, Gemini-3-Pro 和 Seed2.0 Pro 三家都是 93.3(即 28/30). 94.2 这种不是 3.33 整数倍的数, 说明是多次采样的平均, 但采样次数和方差原文都没给. 这类行只能看「同一档」, 不宜读出排名.

<!-- page 9 of 78 -->

Table 3 Evaluation on Fundamental Language Capacity Benchmarks (Large Models). The highest score is marked in bold, and the second is underlined.

表 3 基础语言能力基准评测(大模型). 最高分加粗, 第二名加下划线.

<table><tr><td>Capability</td><td>Benchmark</td><td>GPT-5.2 High</td><td>Claude-Sonnet-4.5</td><td>Claude-Opus-4.5</td><td>Gemini-3-Pro High</td><td>Seed2.0 Pro</td></tr><tr><td rowspan="8">Science</td><td>MMLU-Pro</td><td>85.9</td><td>88.0</td><td>89.3</td><td>90.1</td><td>87.0</td></tr><tr><td>HLE (no tool, text only)</td><td>29.9</td><td>14.5</td><td>23.7</td><td>33.3</td><td>32.4</td></tr><tr><td>SimpleQA Verified</td><td>36.8</td><td>29.3</td><td>48.6</td><td>72.1</td><td>36.0</td></tr><tr><td>HealthBench</td><td>63.3</td><td>28.7</td><td>36.3</td><td>37.9</td><td>57.7</td></tr><tr><td>HealthBench - Hard</td><td>42.0</td><td>10.9</td><td>11.0</td><td>15.0</td><td>29.1</td></tr><tr><td>SuperGPQA</td><td>67.9</td><td>65.5</td><td>70.6</td><td>73.8</td><td>68.7</td></tr><tr><td>LPFQA</td><td>54.4</td><td>54.9</td><td>52.6</td><td>51.2</td><td>52.6</td></tr><tr><td>Encyclo-K</td><td>61.0</td><td>58.0</td><td>63.3</td><td>64.9</td><td>65.7</td></tr><tr><td rowspan="8">Math</td><td>AIME 2026</td><td>97.5</td><td>82.5</td><td>92.5</td><td>93.3</td><td>94.2</td></tr><tr><td>AIME 2025</td><td>99.0</td><td>87.0</td><td>91.3</td><td>95.0</td><td>98.3</td></tr><tr><td>HMMT Feb 2025</td><td>100.0</td><td>79.2</td><td>92.9</td><td>97.3</td><td>97.3</td></tr><tr><td>HMMT Nov 2025</td><td>100.0</td><td>81.7</td><td>93.3</td><td>93.3</td><td>93.3</td></tr><tr><td>MathArenaApex</td><td>18.2</td><td>1.0</td><td>1.6</td><td>24.5</td><td>20.3</td></tr><tr><td>MathArenaApex (shortlist)</td><td>80.1</td><td>26.0</td><td>47.4</td><td>71.4</td><td>82.1</td></tr><tr><td>BeyondAIME</td><td>86.0</td><td>57.0</td><td>69.0</td><td>83.0</td><td>86.5</td></tr><tr><td>IMOAnswerBench (no tool)</td><td>86.6</td><td>60.7</td><td>72.6</td><td>83.3</td><td>89.3</td></tr><tr><td rowspan="3">Code</td><td>Codeforces (no tool)</td><td>3148</td><td>1485</td><td>1701</td><td>2726</td><td>3020</td></tr><tr><td>AetherCode</td><td>73.8</td><td>16.4</td><td>31.6</td><td>57.8</td><td>60.6</td></tr><tr><td>LiveCodeBench (v6)</td><td>87.7</td><td>64.0</td><td>84.8</td><td>90.7</td><td>87.8</td></tr><tr><td rowspan="6">STEM</td><td>GPQA Diamond</td><td>92.4</td><td>84.3</td><td>86.9</td><td>91.9</td><td>88.9</td></tr><tr><td>Superchem (text-only)</td><td>58.0</td><td>32.4</td><td>43.2</td><td>63.2</td><td>51.6</td></tr><tr><td>BABE</td><td>58.1</td><td>44.7</td><td>49.3</td><td>51.30</td><td>50.0</td></tr><tr><td>Phybench</td><td>74.0</td><td>48.0</td><td>69.0</td><td>80.0</td><td>74.0</td></tr><tr><td>FrontierSci-research</td><td>25.0</td><td>16.7</td><td>21.7</td><td>15.0</td><td>25.0</td></tr><tr><td>FrontierSci-olympiad</td><td>75.0</td><td>60.0</td><td>71.0</td><td>73.0</td><td>74.0</td></tr><tr><td rowspan="4">General Reasoning</td><td>ARC-AGI-1</td><td>89.9</td><td>70.9</td><td>84.0</td><td>85.0</td><td>85.4</td></tr><tr><td>ARC-AGI-2</td><td>57.5</td><td>13.6</td><td>29.1</td><td>31.1</td><td>37.5</td></tr><tr><td>KORBench</td><td>79.2</td><td>73.0</td><td>77.4</td><td>73.9</td><td>77.5</td></tr><tr><td>ProcBench</td><td>95.0</td><td>87.5</td><td>92.5</td><td>90.0</td><td>96.6</td></tr><tr><td rowspan="7">Long Context Performance</td><td>MRCR v2 (8-needle)</td><td>89.4</td><td>47.1</td><td>56.2</td><td>79.7</td><td>54.0</td></tr><tr><td>Graphwalks Bfs (&lt;128k)</td><td>98.0</td><td>80.5</td><td>92.0</td><td>79.9</td><td>68.9</td></tr><tr><td>Graphwalks Parents (&lt;128k)</td><td>99.7</td><td>99.0</td><td>96.2</td><td>99.7</td><td>97.6</td></tr><tr><td>LongBench v2 (128k)</td><td>63.2</td><td>62.0</td><td>65.0</td><td>67.4</td><td>63.8</td></tr><tr><td>Frames</td><td>84.0</td><td>78.7</td><td>84.7</td><td>81.9</td><td>84.5</td></tr><tr><td>DeR2 Bench</td><td>69.0</td><td>58.9</td><td>60.4</td><td>66.1</td><td>58.2</td></tr><tr><td>CL-Bench</td><td>23.9</td><td>18.1</td><td>22.6</td><td>15.6</td><td>20.8</td></tr><tr><td rowspan="3">Multilingual</td><td>Global PIQA</td><td>93.2</td><td>93.9</td><td>93.9</td><td>95.0</td><td>92.3</td></tr><tr><td>MMMLU</td><td>90.3</td><td>89.9</td><td>91.0</td><td>91.8</td><td>88.1</td></tr><tr><td>Disco-X</td><td>76.3</td><td>70.3</td><td>78.6</td><td>76.8</td><td>82.0</td></tr><tr><td rowspan="4">Instruction Following</td><td>MultiChallenge</td><td>59.5</td><td>57.3</td><td>59.0</td><td>68.7</td><td>68.3</td></tr><tr><td>COLLIE</td><td>96.9</td><td>77.3</td><td>79.8</td><td>95.0</td><td>93.9</td></tr><tr><td>MARS-Bench</td><td>87.9</td><td>72.9</td><td>87.7</td><td>85.6</td><td>85.6</td></tr><tr><td>Inverse IFEval</td><td>72.3</td><td>69.3</td><td>72.4</td><td>79.6</td><td>78.9</td></tr><tr><td rowspan="3">Hallucination</td><td>LongFact-Objects</td><td>99.2</td><td>98.8</td><td>99.0</td><td>98.1</td><td>92.9</td></tr><tr><td>LongFact-Concepts</td><td>99.7</td><td>98.5</td><td>98.8</td><td>98.5</td><td>92.8</td></tr><tr><td>FactScore</td><td>91.9</td><td>90.6</td><td>91.1</td><td>92.6</td><td>71.2</td></tr></table>

<!-- page 10 of 78 -->

Table 4 Evaluation on Fundamental Language Capacity Benchmarks (Efficient Models). The highest score is marked in bold, and the second is underlined.

表 4 基础语言能力基准评测(高效模型). 最高分加粗, 第二名加下划线.

<table><tr><td>Capability</td><td>Benchmark</td><td>GPT-5-mini High</td><td>Gemini-3-Flash High</td><td>Seed2.0 Mini</td><td>Seed2.0 Lite</td></tr><tr><td rowspan="8">Science</td><td>MMLU-Pro</td><td>84.1</td><td>87.8</td><td>83.6</td><td>87.7</td></tr><tr><td>HLE (no tool, text only)</td><td>17.6</td><td>31.7</td><td>13.3</td><td>28.2</td></tr><tr><td>SimpleQA Verified</td><td>26.0</td><td>65.4</td><td>18.9</td><td>24.0</td></tr><tr><td>HealthBench</td><td>62.5</td><td>51.6</td><td>30.0</td><td>51.2</td></tr><tr><td>HealthBench - Hard</td><td>38.6</td><td>21.5</td><td>15.3</td><td>20.0</td></tr><tr><td>SuperGPQA</td><td>60.5</td><td>72.7</td><td>61.6</td><td>67.5</td></tr><tr><td>LPFQA</td><td>50.7</td><td>51.6</td><td>47.2</td><td>50.9</td></tr><tr><td>Encyclo-K</td><td>53.0</td><td>60.0</td><td>52.1</td><td>64.5</td></tr><tr><td rowspan="8">Math</td><td>AIME 2026</td><td>92.5</td><td>93.3</td><td>86.7</td><td>88.3</td></tr><tr><td>AIME 2025</td><td>90.3</td><td>95.2</td><td>87.0</td><td>93.0</td></tr><tr><td>HMMT Feb 2025</td><td>93.3</td><td>100</td><td>70.0</td><td>90.0</td></tr><tr><td>HMMT Nov 2025</td><td>96.7</td><td>96.7</td><td>80.0</td><td>86.7</td></tr><tr><td>MathArenaApex</td><td>2.1</td><td>17.7</td><td>4.2</td><td>4.7</td></tr><tr><td>MathArenaApex (shortlist)</td><td>43.4</td><td>71.9</td><td>31.1</td><td>52.6</td></tr><tr><td>BeyondAIME</td><td>72.0</td><td>82.0</td><td>69.0</td><td>76.0</td></tr><tr><td>IMOAnswerBench (no tool)</td><td>72.1</td><td>84.4</td><td>71.6</td><td>81.6</td></tr><tr><td rowspan="3">Code</td><td>Codeforces</td><td>1985</td><td>2727</td><td>1644</td><td>2233</td></tr><tr><td>AetherCode</td><td>42.6</td><td>56.1</td><td>29.8</td><td>41.5</td></tr><tr><td>LiveCodeBench (v6)</td><td>62.6</td><td>84.7</td><td>64.1</td><td>81.7</td></tr><tr><td rowspan="6">STEM</td><td>GPQA Diamond</td><td>82.1</td><td>90.7</td><td>79.0</td><td>85.1</td></tr><tr><td>Superchem (text-only)</td><td>34.8</td><td>54.4</td><td>16.2</td><td>48.0</td></tr><tr><td>BABE</td><td>49.2</td><td>55.2</td><td>40.4</td><td>50.2</td></tr><tr><td>Phybench</td><td>60.0</td><td>77.0</td><td>56.0</td><td>73.0</td></tr><tr><td>FrontierSci-research</td><td>18.3</td><td>11.7</td><td>3.3</td><td>18.3</td></tr><tr><td>FrontierSci-olympiad</td><td>69.0</td><td>73.0</td><td>44.0</td><td>70.0</td></tr><tr><td rowspan="4">General Reasoning</td><td>ARC-AGI-1</td><td>54.5</td><td>86.9</td><td>43.3</td><td>75.7</td></tr><tr><td>ARC-AGI-2</td><td>3.5</td><td>34.3</td><td>2.3</td><td>14.8</td></tr><tr><td>KORBench</td><td>74.2</td><td>76.0</td><td>72.8</td><td>77.0</td></tr><tr><td>ProcBench</td><td>87.5</td><td>90.0</td><td>80.1</td><td>92.4</td></tr><tr><td rowspan="7">Long Context Performance</td><td>MRCR v2 (8-needle)</td><td>50.1</td><td>79.0</td><td>51.4</td><td>33.6</td></tr><tr><td>Graphwalks Bfs (&lt;128K)</td><td>85.5</td><td>84.2</td><td>64.1</td><td>82.5</td></tr><tr><td>Graphwalks Parents (&lt;128K)</td><td>96.6</td><td>99.7</td><td>93.0</td><td>100.0</td></tr><tr><td>LongBench v2 (128K)</td><td>56.7</td><td>64.0</td><td>52.3</td><td>59.6</td></tr><tr><td>Frames</td><td>82.9</td><td>83.7</td><td>80.5</td><td>83.4</td></tr><tr><td>DeR2 Bench</td><td>50.3</td><td>66.0</td><td>46.6</td><td>57.3</td></tr><tr><td>CL-Bench</td><td>25.2</td><td>16.1</td><td>14.8</td><td>20.0</td></tr><tr><td rowspan="3">Multilingual</td><td>Global PIQA</td><td>91.6</td><td>95.6</td><td>89.2</td><td>92.1</td></tr><tr><td>MMMLU</td><td>86.3</td><td>91.8</td><td>81.6</td><td>87.7</td></tr><tr><td>Disco-X</td><td>67.7</td><td>71.9</td><td>73.0</td><td>80.3</td></tr><tr><td rowspan="4">Instruction Following</td><td>MultiChallenge</td><td>59.0</td><td>69.3</td><td>61.1</td><td>63.2</td></tr><tr><td>COLLIE</td><td>97.4</td><td>96.5</td><td>91.2</td><td>94.0</td></tr><tr><td>MARS-Bench</td><td>66.1</td><td>84.6</td><td>62.4</td><td>80.5</td></tr><tr><td>Inverse IFEval</td><td>74.8</td><td>80.9</td><td>69.3</td><td>77.1</td></tr><tr><td rowspan="3">Hallucination</td><td>LongFact-Objects</td><td>99.2</td><td>97.9</td><td>87.0</td><td>92.2</td></tr><tr><td>LongFact-Concepts</td><td>99.5</td><td>98.6</td><td>91.4</td><td>92.4</td></tr><tr><td>FactScore</td><td>96.1</td><td>92.0</td><td>50.4</td><td>62.4</td></tr></table>

<!-- page 11 of 78 -->

Table 5 Evaluation on Putnam-200 [88], Pass@8. Agent-based multi-turn setup with Lean, Python, and Lean search tools. The highest score is marked in bold, and the second is underlined.

表 5 Putnam-200 [88] 评测, Pass@8. 基于 agent 的多轮设置, 可用 Lean, Python 和 Lean 搜索工具. 最高分加粗, 第二名加下划线.

| Benchmark | Deepseek-Prover-V2 | Seed-1.5 Prover | Gemini-3-Pro | Seed2.0 Lite | Seed2.0 Pro |
| --- | --- | --- | --- | --- | --- |
| Putnam-200 | &lt;4.0 | 26.5 | 26.5 | 30.5 | 35.5 |

Table 6 Complex instruction-following benchmark across multiple test sets and instruction categories.

表 6 覆盖多个测试集和指令类别的复杂指令遵循基准.

| Test Set | Description | Example |
| --- | --- | --- |
| Format | Provide format-related instructions and require the model to produce outputs in the specified format. | You are an expository-instruction rewriter designed for young children. You can transform user-provided instructions for different objects into introductions that are easy to understand and rich in imagination.... You must append a cute, positive emoji to the end of every sentence throughout the entire text 😊. |
| Conditional | Provide instructions with conditional rules and require the model to generate outputs that follow the rules. | Character◆ You are a customer-service bot for a cross-border e-commerce platform responsible for men's and women's...◆ You must ensure that the user's information is complete. The required information includes "gender," "foot length" ... |
| Content | Require the response to include specified content. | Skill 1: Standard interaction1. When user greets you, identify yourself as a food calorie calculator and invite the user to ask a question ...Skill 2: Provide calorie data per 100 g of food... |
| Phrasing | Require the response to include specified phrasing. | Role: You are a question-loving bot. Your "head" is filled with different questions. Although you love asking questions, you consistently offer users distinctive reflections and experiences.Requirements:◆ Your task is to generate questions corresponding to the topic proposed by the user.◆ Ensure diversity in the questions; each time you ask questions, you must provide three... |
| Tone | Require LLMs to generate responses that match a specified tone or style (e.g., humorous, formal, sarcastic). | You particularly dislike people around you commenting on your current life situation, especially when they ask why you still have not had children or bought a house; you respond with sarcastic, cutting remarks... |
| Emoji | Require the response to include emojis, or a specified type of emojis. | ... When a pedestrian and a car are involved in a traffic accident, you represent it as "�����" . When multiple pedestrians and a single car are involved, represent it as "�����" . When vehicles are involved in a chain-reaction collision, represent it as "�����������������... |
| Few-shot | Require the model to reference or follow the exemplar format and/or content when generating outputs. | You need to revise the text I provide into an ordered-list format, using the following rules: 1. Convert the text into an ordered list; you do not need to consider whether the revised sentences are fluent...Fewshot: ... |
| Chinese | Evaluate whether the model can generate text that satisfies specified Chinese length constraints. | Please help me come up with a title based on the following content. The title must be exactly 10 Chinese characters (no more, no less). Provide only one title-do not give multiple options... |
| English | Evaluate whether the model can generate text that satisfies specified English length constraints. | Please explore the coordination and impact of monetary policy in the context of globalization, for economists and policy makers, combined with international trade theory and exchange rate mechanism, to distinguish the difference in policy response between developed and developing countries... |

performs on par with SOTA models on extremely challenging benchmarks such as IMOAnswerBench and MathApex. Notably, Seed2.0 Pro achieves gold-medal level performance in Olympiad-level mathematical competitions: 2025 International Mathematical Olympiad (IMO) and 2025 China Mathematical Olympiad (CMO). Beyond natural language reasoning, Seed2.0 also excels in formal theorem proving, demonstrating superior performance on the Putnam-200 (a random subset of 200 problems from PutnamBench [88]) and making strides in open Erdős problems. Table 2 and Table 5 report the results. Implementation details are provided in Appendix E. In coding, it reaches a Codeforces Elo of 3020 and posts strong LiveCodeBench numbers. STEM-oriented benchmarks such as FrontierSci-research tell a similar story, with Seed2.0 Pro matching or edging out Gemini-3-Pro in multiple cases. This reflects our continued investment in deep reasoning and code-centric training.

在 IMOAnswerBench 和 MathApex 等极难基准上与 SOTA 模型持平. 值得一提的是, Seed2.0 Pro 在奥赛级数学竞赛中达到金牌水平: 2025 年国际数学奥林匹克(IMO)和 2025 年中国数学奥林匹克(CMO). 在自然语言推理之外, Seed2.0 在形式化定理证明上也很出色, 在 Putnam-200(从 PutnamBench [88] 中随机抽取的 200 题子集)上表现优异, 并在开放的 Erdős 问题上取得进展. Table 2 和 Table 5 给出结果. 实现细节见 Appendix E. 编码方面, 它的 Codeforces Elo 达到 3020, LiveCodeBench 成绩也很强. FrontierSci-research 等面向 STEM 的基准呈现类似情况, Seed2.0 Pro 在多处与 Gemini-3-Pro 持平或略胜. 这反映了我们在深度推理和以代码为中心的训练上的持续投入.

> **对一下:** Table 5 的 Pass@8 和 Table 3 的单次分数能放在一起比吗? 这里的领先来自模型还是来自采样?
> 不能直接放一起. Table 5 是 Pass@8, 每题最多 8 次独立尝试, 且 agent 可以多轮调用 Lean, Python 和 Lean 搜索; Lean 编译器本身就是判定器, 8 次里任一次通过就算解出, 挑选几乎不花成本. 这是 TestingTime 投入与部署前缩放叠加后的结果. Seed2.0 Pro 35.5 对 Seed2.0 Lite 30.5 的差距, 才是同一 TestingTime 条件下尺寸带来的; 35.5 对 Gemini-3-Pro 26.5 则还要看 Gemini 是否也在同样的 agent 框架和 8 次预算下跑, 原文没交代. Table 3 的数学行没写 Pass@k, 按惯例是单次或多次平均, 口径不同.

Long Context Understanding. Seed2.0 Pro ranks first on the Frames leaderboard. While retrieval-heavy tasks such as MRCR and Graphwalks still show some headroom compared to other leading models, these gaps have limited impact on real-world user experience—and similar weaknesses are observed across other frontier models.

长上下文理解. Seed2.0 Pro 在 Frames 榜上排第一. 虽然 MRCR 和 Graphwalks 这类重检索的任务与其他领先模型相比仍有提升空间, 但这些差距对真实用户体验影响有限, 其他前沿模型也存在类似弱点.

Instruction Following, Multilinguality, and Hallucination. Instruction-following capability sees clear gains over Seed1.8, which directly benefits complex user requests in deployment. Multilingual performance and hallucination robustness remain competitive, with room for further improvement in future iterations.

指令遵循, 多语言与幻觉. 指令遵循能力相比 Seed1.8 有明显提升, 直接惠及部署中的复杂用户请求. 多语言表现和幻觉稳健性保持有竞争力, 未来迭代中仍有改进空间.

> **想:** 「幻觉稳健性保持有竞争力」和 Table 3 的 Hallucination 三行对得上吗?
> 对不上. Table 3 的 FactScore 一行, GPT-5.2 High 91.9, Claude-Sonnet-4.5 90.6, Claude-Opus-4.5 91.1, Gemini-3-Pro High 92.6, Seed2.0 Pro 是 71.2, 落后约 20 分; LongFact-Objects 和 LongFact-Concepts 两行 Seed2.0 Pro 是 92.9 和 92.8, 对手都在 98 以上. Table 4 更明显: Seed2.0 Mini 的 FactScore 只有 50.4, Lite 是 62.4, 对手 GPT-5-mini High 是 96.1. 三行都垫底, 这段文字的措辞比表上的数字乐观得多.

Complex Instruction Following. We run a fine-grained analysis using an in-house benchmark (see Table 6) tailored for Chinese-language production scenarios: 912 test cases across 17 weighted dimensions reflecting practical deployment importance.

复杂指令遵循. 我们用一个面向中文生产场景的内部基准(见 Table 6)做细粒度分析: 共 912 个测试样例, 覆盖 17 个按实际部署重要性加权的维度.

<!-- page 12 of 78 -->

Table 7 Complex instruction following performance on in-house Chinese benchmark. Bold indicates the better result.

表 7 内部中文基准上的复杂指令遵循表现. 加粗表示较好的结果.

| Model | Overall | Format | Conditional | Content | Phrasing | Tone | Emoji | Few-shot | Chinese | English |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Seed-1.8 | 72.89 | 45.33 | 81.25 | 90.48 | 75.00 | 61.29 | 92.14 | 55.78 | 77.67 | 62.05 |
| Seed2.0 Pro | 75.26 | 46.00 | 88.19 | 87.76 | 85.31 | 76.45 | 93.62 | 65.31 | 80.00 | 67.41 |

As shown in Table 7, Seed2.0 Pro scores 75.26%, a +2.37% absolute gain over Seed1.8. The largest jumps come in tone control (+15.16%), phrasing adherence (+10.31%), and few-shot learning (+9.53%). In practice, this means more precise Chinese pragmatic effects—including subtle stylistic modes like tsundere-like affect and sarcastic or ironic (“yin-yang”) expression—and more reliable multi-constraint prompting. At the few-shot level, the model better infers structural and stylistic requirements implied by exemplars, including quantitative constraints such as paragraph counts or emoji quotas, and shows improved compliance with strict length limits in both Chinese and English.

如 Table 7 所示, Seed2.0 Pro 得分 75.26%, 比 Seed1.8 绝对提升 +2.37%. 提升最大的是语气控制(+15.16%), 措辞遵循(+10.31%)和 few-shot 学习(+9.53%). 实际效果是, 中文语用效果更精确, 包括傲娇式情绪和讽刺, 反讽(「阴阳怪气」)这类微妙的风格, 多约束提示也更可靠. 在 few-shot 层面, 模型更能推断示例中隐含的结构和风格要求, 包括段落数或 emoji 配额这样的数量约束, 并且在中英文严格长度限制上的遵循度都有提高.

> **问:** Table 7 的 Overall 是怎么从各列算出来的? 有没有列在退步?
> 不是各列简单平均. 按表上 9 列直接平均, Seed-1.8 约 71.22, Seed2.0 Pro 约 76.67, 差 5.45; 而 Overall 分别是 72.89 和 75.26, 只差 2.37. 原因是 Overall 按 17 个加权维度, 912 个样例计算, 表上只露出 9 列, 权重和剩下 8 个维度都没给, 分母不一样. 另外, Content 一列从 90.48 降到 87.76, Format 只从 45.33 到 46.00, 正文只报了涨幅最大的三列. 三个涨幅本身核对无误: 76.45−61.29=15.16, 85.31−75.00=10.31, 65.31−55.78=9.53.

Lite and Mini Variants. Seed2.0 Lite and Seed2.0 Mini offer strong efficiency–quality trade-offs. Across a wide range of benchmarks, our small models hold their own against counterparts from OpenAI and Google. Seed2.0 Lite in particular posts strong math and reasoning numbers while maintaining solid instruction-following performance—well-suited for latency-sensitive and cost-constrained deployments.

Lite 与 Mini 版本. Seed2.0 Lite 和 Seed2.0 Mini 在效率与质量之间给出了很好的取舍. 在大量基准上, 我们的小模型能与 OpenAI 和 Google 的同级模型分庭抗礼. 尤其是 Seed2.0 Lite, 数学和推理成绩很强, 指令遵循也扎实, 很适合延迟敏感, 成本受限的部署.

### 4.2 Vision Task Evaluation

4.2 视觉任务评测

We evaluate the performance of Seed2.0 (including Pro, Lite, and Mini variants) on a comprehensive suite of public visual-language benchmarks, comparing it against its predecessor Seed1.8 and several state-of-the-art models such as Gemini-3-Pro, GPT-5.2, and Claude-Opus-4.5. The evaluation covers a broad spectrum of capabilities, ranging from mathematical and STEM reasoning to visual puzzles, spatial understanding, and long-context document processing. Table 8 presents the detailed results, where Seed2.0 Pro demonstrates superior performance, achieving the highest scores across the majority of benchmarks.

我们在一整套公开视觉语言基准上评测 Seed2.0(包括 Pro, Lite 和 Mini), 并与前代 Seed1.8 以及 Gemini-3-Pro, GPT-5.2 和 Claude-Opus-4.5 等 SOTA 模型对比. 评测覆盖的能力很广, 从数学与 STEM 推理, 到视觉谜题, 空间理解和长上下文文档处理. Table 8 给出详细结果, Seed2.0 Pro 表现突出, 在多数基准上拿到最高分.

Math and STEM Reasoning. In mathematical reasoning, Seed2.0 Pro demonstrates exceptional capability, achieving state-of-the-art results on MathVision (88.8), MathKangaroo (90.5), and MathCanvas (61.9), while tying for the top score on MathVista (89.8). Notably, Seed2.0 Lite also excels, securing the top spot on DynaMath (70.5). In STEM tasks, Seed2.0 Pro leads in EMMA (72.0), XLRS-Bench (54.6), and PhyX (72.1). On the remaining benchmarks, Seed2.0 Pro also delivers transformative gains compared to Seed1.8: scores on HiPhO and MMMU-Pro improved by 15.8 and 5.0, respectively, rapidly narrowed the gap with best methods.

数学与 STEM 推理. 数学推理方面, Seed2.0 Pro 能力出众, 在 MathVision (88.8), MathKangaroo (90.5) 和 MathCanvas (61.9) 上取得 SOTA, 在 MathVista (89.8) 上并列第一. 值得注意的是 Seed2.0 Lite 也很出色, 在 DynaMath (70.5) 上排第一. STEM 任务中, Seed2.0 Pro 在 EMMA (72.0), XLRS-Bench (54.6) 和 PhyX (72.1) 上领先. 在其余基准上, Seed2.0 Pro 相比 Seed1.8 也有质的提升: HiPhO 和 MMMU-Pro 分别提高 15.8 和 5.0, 迅速缩小了与最佳方法的差距.

Visual Puzzles and Logic. Seed2.0 Pro exhibits significant advancements in logical reasoning and visual puzzle solving. It achieves the highest scores on LogicVista (81.4) and ZeroBench (Main 12.0, Sub 47.6), demonstrating robust problem-solving abilities. On the challenging VisuLogic benchmark, Seed2.0 Pro scores 47.4, outperforming all counterparts by a notable margin. Although GPT-5.2 leads on ArcAGI-Image, Seed2.0 Pro secures a competitive second place (88.8 on ArcAGI1 and 43.3 on ArcAGI2), showing substantial improvement over Seed-1.8.

视觉谜题与逻辑. Seed2.0 Pro 在逻辑推理和视觉解谜上进步显著. 它在 LogicVista (81.4) 和 ZeroBench (Main 12.0, Sub 47.6) 上拿到最高分, 展现出稳健的解题能力. 在高难的 VisuLogic 基准上, Seed2.0 Pro 得 47.4, 明显领先所有对手. 虽然 GPT-5.2 在 ArcAGI-Image 上领先, Seed2.0 Pro 取得了有竞争力的第二名(ArcAGI1 88.8, ArcAGI2 43.3), 比 Seed-1.8 大幅提高.

Perception and General VQA. For perception and recognition, Seed2.0 Pro demonstrates exceptional capabilities. It achieves SOTA results on VLMsAreBiased (77.4), VLMsAreBlind (98.6), and BabyVision (60.6). In general VQA benchmarks, Seed2.0 Pro leads in SimpleVQA (71.4), MUIRBench (81.8), and VibeEval (81.4). Seed2.0 Pro consistently outperforms Seed1.8 across all general VQA tasks, highlighting its refined visual understanding.

感知与通用 VQA. 在感知与识别上, Seed2.0 Pro 能力出众. 它在 VLMsAreBiased (77.4), VLMsAreBlind (98.6) 和 BabyVision (60.6) 上取得 SOTA. 通用 VQA 基准中, Seed2.0 Pro 在 SimpleVQA (71.4), MUIRBench (81.8) 和 VibeEval (81.4) 上领先. Seed2.0 Pro 在所有通用 VQA 任务上都稳定超过 Seed1.8, 体现出更精细的视觉理解.

Spatial Understanding and Counting. Seed2.0 Pro excels in spatial understanding and fine-grained localization. It sets new state-of-the-arts on DA-2K (92.3), RefSpatialBench (72.6), and BLINK (79.5), surpassing the strong baseline of Gemini-3-Pro. In counting tasks, Seed2.0 Pro achieves best performance on FSC-147 with a mean absolute error of 11.3 (lower is better), significantly improving upon Seed1.8 and competitor models.

空间理解与计数. Seed2.0 Pro 在空间理解和细粒度定位上表现出色. 它在 DA-2K (92.3), RefSpatialBench (72.6) 和 BLINK (79.5) 上刷新 SOTA, 超过强基线 Gemini-3-Pro. 计数任务中, Seed2.0 Pro 在 FSC-147 上取得最佳表现, 平均绝对误差 11.3(越低越好), 相比 Seed1.8 和竞品模型显著改进.

Document and Long-Context Understanding. A standout feature of Seed2.0 Pro is its dominance in long-

文档与长上下文理解. Seed2.0 Pro 的一个突出特点, 是它在长

<!-- page 13 of 78 -->

Table 8 Performance of Seed2.0 on public visual-language benchmarks compared to previous models. We report Pass@1 in these benchmarks. The best score for each benchmark is marked in bold, and the second best is underlined. Results marked with an \* are sourced from the technical report.

表 8 Seed2.0 与此前模型在公开视觉语言基准上的表现对比. 这些基准均报告 Pass@1. 每个基准的最佳分数加粗, 第二名加下划线. 标 \* 的结果取自技术报告.

<table><tr><td>Capability</td><td>Benchmark</td><td>Claude-Opus-4.5</td><td>GPT-5.2 High</td><td>Gemini-3-Pro High</td><td>Seed1.8</td><td>Seed2.0 Mini</td><td>Seed2.0 Lite</td><td>Seed2.0 Pro</td></tr><tr><td rowspan="5">Math</td><td>MathVista</td><td>80.6</td><td>83.1</td><td>89.8</td><td>87.7</td><td>85.5</td><td>89.0</td><td>89.8</td></tr><tr><td>MathVision</td><td>74.3</td><td>86.8</td><td>86.1</td><td>81.3</td><td>78.1</td><td>86.4</td><td>88.8</td></tr><tr><td>DynaMath</td><td>52.5</td><td>70.1</td><td>63.3</td><td>61.5</td><td>58.9</td><td>70.5</td><td>68.9</td></tr><tr><td>MathKangaroo</td><td>69.6</td><td>86.9</td><td>84.4*</td><td>73.8</td><td>79.8</td><td>86.3</td><td>90.5</td></tr><tr><td>MathCanvas</td><td>52.9</td><td>55.3</td><td>58.8</td><td>53.6</td><td>53.2</td><td>61.1</td><td>61.9</td></tr><tr><td rowspan="7">STEM</td><td>MMMU</td><td>81.6</td><td>83.7</td><td>87.0</td><td>83.4</td><td>79.7</td><td>83.7</td><td>85.4</td></tr><tr><td>MMMU-Pro</td><td>70.8</td><td>79.5*</td><td>81.0*</td><td>73.2</td><td>71.4</td><td>76.0</td><td>78.2</td></tr><tr><td>EMMA</td><td>60.4</td><td>69.4</td><td>66.5</td><td>60.9</td><td>57.0</td><td>65.5</td><td>72.0</td></tr><tr><td>SFE</td><td>55.8</td><td>50.1</td><td>61.9</td><td>51.2</td><td>48.4</td><td>53.4</td><td>55.6</td></tr><tr><td>HiPhO</td><td>81.8</td><td>77.7</td><td>79.1</td><td>58.3</td><td>55.8</td><td>72.5</td><td>74.1</td></tr><tr><td>XLRS-Bench (macro)</td><td>50.4</td><td>49.9</td><td>51.7</td><td>39.9</td><td>49.9</td><td>53.7</td><td>54.6</td></tr><tr><td>PhyX (openended)</td><td>61.3</td><td>71.5</td><td>71.0</td><td>65.9</td><td>65.0</td><td>62.8</td><td>72.1</td></tr><tr><td rowspan="7">Visual Puzzles</td><td>LogicVista</td><td>68.9</td><td>81.0</td><td>80.8</td><td>78.3</td><td>73.8</td><td>79.6</td><td>81.9</td></tr><tr><td>VPCT</td><td>29.0</td><td>56.0</td><td>90.0</td><td>61.0</td><td>48.0</td><td>73.0</td><td>76.0</td></tr><tr><td>ZeroBench (main)</td><td>4.0</td><td>11.0</td><td>10.0</td><td>11.0</td><td>7.0</td><td>8.0</td><td>12.0</td></tr><tr><td>ZeroBench (sub)</td><td>30.8</td><td>38.9</td><td>42.2</td><td>37.7</td><td>36.2</td><td>42.2</td><td>47.6</td></tr><tr><td>ArcAGI1-Image</td><td>75.8</td><td>93.1</td><td>69.4</td><td>31.4</td><td>29.8</td><td>80.9</td><td>88.8</td></tr><tr><td>ArcAGI2-Image</td><td>26.1</td><td>54.4</td><td>21.5</td><td>1.3</td><td>1.5</td><td>28.3</td><td>43.3</td></tr><tr><td>VisuLogic</td><td>27.6</td><td>37.0</td><td>39.0</td><td>35.8</td><td>40.4</td><td>47.3</td><td>47.4</td></tr><tr><td rowspan="5">Perception &amp; Recognition</td><td>VLMsAreBiased</td><td>21.4</td><td>28.0</td><td>50.6*</td><td>62.0</td><td>58.4</td><td>74.8</td><td>77.4</td></tr><tr><td>VLMsAreBlind</td><td>77.2</td><td>84.2</td><td>97.5</td><td>93.0</td><td>93.1</td><td>97.0</td><td>98.6</td></tr><tr><td>VisFactor</td><td>24.5</td><td>33.6</td><td>45.8</td><td>20.4</td><td>23.6</td><td>33.4</td><td>36.8</td></tr><tr><td>RealWorldQA</td><td>75.9</td><td>82.1</td><td>84.7</td><td>78.0</td><td>81.6</td><td>81.7</td><td>86.0</td></tr><tr><td>BabyVision</td><td>16.2</td><td>37.4</td><td>49.7*</td><td>30.2</td><td>38.7</td><td>57.5</td><td>60.6</td></tr><tr><td rowspan="9">General VQA</td><td>SimpleVQA</td><td>57.9</td><td>54.1</td><td>69.7</td><td>65.4</td><td>68.7</td><td>67.2</td><td>71.4</td></tr><tr><td>HallusionBench</td><td>65.3</td><td>67.7</td><td>69.9</td><td>63.9</td><td>65.1</td><td>66.0</td><td>68.0</td></tr><tr><td>MME-CC</td><td>25.2</td><td>44.4</td><td>56.9</td><td>43.4</td><td>40.8</td><td>50.2</td><td>57.0</td></tr><tr><td>MMStar</td><td>73.9</td><td>78.2</td><td>83.1</td><td>79.9</td><td>79.1</td><td>80.7</td><td>83.0</td></tr><tr><td>MUIRBench</td><td>78.9</td><td>77.4</td><td>78.2</td><td>78.7</td><td>78.0</td><td>76.2</td><td>81.8</td></tr><tr><td>MTVQA</td><td>53.1</td><td>48.5</td><td>50.8</td><td>47.3</td><td>50.6</td><td>51.1</td><td>51.1</td></tr><tr><td>WorldVQA</td><td>36.6</td><td>26.3</td><td>47.5</td><td>40.4</td><td>47.6</td><td>44.0</td><td>49.9</td></tr><tr><td>VibeEval</td><td>70.3</td><td>73.1</td><td>77.7</td><td>74.0</td><td>76.5</td><td>76.5</td><td>81.4</td></tr><tr><td>ViVerBench</td><td>72.4</td><td>74.8</td><td>75.9</td><td>74.6</td><td>73.9</td><td>80.0</td><td>75.9</td></tr><tr><td rowspan="3">Pointing &amp; Counting</td><td>CountBench</td><td>90.3</td><td>91.2</td><td>97.3</td><td>96.3</td><td>95.5</td><td>97.1</td><td>95.5</td></tr><tr><td>FSC-147↓</td><td>20.9</td><td>21.1</td><td>12.1</td><td>13.6</td><td>17.3</td><td>11.9</td><td>11.3</td></tr><tr><td>Point-Bench</td><td>-</td><td>-</td><td>85.5*</td><td>76.5</td><td>77.0</td><td>79.0</td><td>81.4</td></tr><tr><td rowspan="7">2D &amp; 3D Spatial Understanding</td><td>BLINK</td><td>68.1</td><td>70.3</td><td>77.1</td><td>74.3</td><td>73.4</td><td>75.6</td><td>79.5</td></tr><tr><td>MMSIBench (circular)</td><td>20.2</td><td>26.1</td><td>25.4</td><td>25.8</td><td>19.7</td><td>28.3</td><td>32.5</td></tr><tr><td>TreeBench</td><td>53.6</td><td>58.8</td><td>62.7</td><td>58.5</td><td>57.3</td><td>64.2</td><td>64.7</td></tr><tr><td>RefSpatialBench</td><td>-</td><td>25.5</td><td>65.5*</td><td>56.3</td><td>55.6</td><td>66.4</td><td>72.6</td></tr><tr><td>DA-2K</td><td>70.3</td><td>78.9</td><td>82.1</td><td>90.7</td><td>86.4</td><td>90.3</td><td>92.3</td></tr><tr><td>All-Angles</td><td>63.1</td><td>71.5</td><td>73.5</td><td>61.6</td><td>61.3</td><td>65.2</td><td>72.1</td></tr><tr><td>ERQA</td><td>48.3</td><td>59.8</td><td>70.5*</td><td>58.8</td><td>56.3</td><td>65.8</td><td>68.5</td></tr><tr><td rowspan="5">Document &amp; Chart Understanding</td><td>ChartQAPro</td><td>-</td><td>67.6</td><td>69.0</td><td>63.0</td><td>65.2</td><td>70.3</td><td>71.2</td></tr><tr><td>OCRBenchv2</td><td>55.5</td><td>55.6</td><td>63.3</td><td>52.6</td><td>58.5</td><td>62.4</td><td>62.5</td></tr><tr><td>OmniDocBench 1.5 ↓</td><td>0.153</td><td>0.143*</td><td>0.115*</td><td>0.106</td><td>0.110</td><td>0.102</td><td>0.099</td></tr><tr><td>CharXiv-DQ</td><td>92.7</td><td>93.8</td><td>94.4</td><td>88.0</td><td>91.9</td><td>93.3</td><td>93.5</td></tr><tr><td>CharXiv-RQ</td><td>65.5</td><td>82.1*</td><td>81.4*</td><td>71.4</td><td>70.8</td><td>79.9</td><td>80.5</td></tr><tr><td rowspan="4">LongContext Understanding</td><td>DUDE</td><td>55.6</td><td>68.2</td><td>70.1</td><td>69.4</td><td>68.9</td><td>72.1</td><td>72.4</td></tr><tr><td>MMLongBench</td><td>-</td><td>-</td><td>73.6</td><td>72.4</td><td>66.7</td><td>70.8</td><td>74.8</td></tr><tr><td>LongDocURL</td><td>-</td><td>-</td><td>72.0</td><td>74.5</td><td>71.3</td><td>75.1</td><td>74.7</td></tr><tr><td>MMLongBench-Doc</td><td>-</td><td>-</td><td>59.5</td><td>57.0</td><td>48.9</td><td>55.1</td><td>61.4</td></tr></table>

<!-- page 14 of 78 -->

Table 9 Performance of Seed2.0 on public video understanding benchmarks compared to previous models. The highest score in each benchmark is marked in bold, and the second is underlined. For benchmarks marked with a ‡, we include subtitles for evaluation. Results marked with an \* are sourced from the technical report.

表 9 Seed2.0 与此前模型在公开视频理解基准上的表现对比. 每个基准的最高分加粗, 第二名加下划线. 标 ‡ 的基准在评测时加入字幕. 标 \* 的结果取自技术报告.

<table><tr><td>Capability</td><td>Benchmark</td><td>Human</td><td>Gemini-3-Pro</td><td>Gemini-3-Flash</td><td>Seed1.8</td><td>Seed2.0 Mini</td><td>Seed2.0 Lite</td><td>Seed2.0 Pro</td></tr><tr><td rowspan="3">Knowledge</td><td>VideoMMMU [39]</td><td>74.4</td><td>87.6*</td><td>88.1</td><td>82.7</td><td>80.6</td><td>84.1</td><td>86.9</td></tr><tr><td>MMVU [125]</td><td>49.7</td><td>76.3</td><td>77.9</td><td>73.1</td><td>69.0</td><td>75.0</td><td>78.2</td></tr><tr><td>VideoSimpleQA [10]</td><td>-</td><td>71.9</td><td>70.7</td><td>67.8</td><td>67.7</td><td>66.6</td><td>71.9</td></tr><tr><td rowspan="4">Reasoning</td><td>VideoReasonBench [51]</td><td>73.8</td><td>59.5</td><td>61.2</td><td>52.8</td><td>40.5</td><td>64.2</td><td>77.8</td></tr><tr><td>Morse-500 [9]</td><td>55.4</td><td>33.0</td><td>32.4</td><td>29.2</td><td>32.2</td><td>32.2</td><td>37.4</td></tr><tr><td>VideoHolmes‡ [18]</td><td>-</td><td>64.2</td><td>65.6</td><td>65.5</td><td>58.6</td><td>63.8</td><td>67.4</td></tr><tr><td>Minerva‡ [62]</td><td>-</td><td>65.0</td><td>64.4</td><td>62.4</td><td>54.7</td><td>63.8</td><td>66.5</td></tr><tr><td rowspan="7">Motion &amp; Perception</td><td>TVBench [21]</td><td>94.8</td><td>71.1</td><td>69.6</td><td>71.5</td><td>70.5</td><td>71.5</td><td>75.0</td></tr><tr><td>ContPhy [126]</td><td>-</td><td>58.0</td><td>60.5</td><td>54.9</td><td>55.9</td><td>56.1</td><td>67.4</td></tr><tr><td>TempCompass [50]</td><td>97.3</td><td>88.0</td><td>88.3</td><td>86.9</td><td>83.7</td><td>87.0</td><td>89.6</td></tr><tr><td>EgoTempo [71]</td><td>63.2</td><td>65.4</td><td>58.4</td><td>67.0</td><td>67.2</td><td>61.8</td><td>71.8</td></tr><tr><td>MotionBench [38]</td><td>-</td><td>70.3*</td><td>68.9</td><td>70.6</td><td>64.4</td><td>70.9</td><td>75.2</td></tr><tr><td>TOMATO [78]</td><td>95.2</td><td>59.6</td><td>60.8</td><td>60.8</td><td>47.4</td><td>57.3</td><td>59.9</td></tr><tr><td>+ Thinking with Tracking</td><td>95.2</td><td>-</td><td>64.0</td><td>61.0</td><td>51.3</td><td>59.2</td><td>65.3</td></tr><tr><td rowspan="5">Long Video</td><td>VideoMME‡ [30]</td><td>-</td><td>88.4*</td><td>85.2</td><td>87.8</td><td>81.2</td><td>87.7</td><td>89.5</td></tr><tr><td>CGBench [12]</td><td>-</td><td>65.5</td><td>65.3</td><td>62.4</td><td>59.2</td><td>59.3</td><td>65.0</td></tr><tr><td>LongVideoBench [103]</td><td>-</td><td>76.7</td><td>74.5</td><td>77.4</td><td>74.8</td><td>77.3</td><td>80.3</td></tr><tr><td>VideoEval-Pro [55]</td><td>-</td><td>52.7</td><td>51.9</td><td>45.9</td><td>43.7</td><td>44.3</td><td>48.0</td></tr><tr><td>LVBench [95]</td><td>-</td><td>-</td><td>-</td><td>73.0</td><td>66.6</td><td>73.0</td><td>76.4</td></tr><tr><td>Multi Video</td><td>CrossVid [46]</td><td>89.2</td><td>53.0</td><td>48.7</td><td>57.3</td><td>58.6</td><td>57.7</td><td>60.3</td></tr><tr><td rowspan="5">Streaming</td><td>OVBench [43]</td><td>-</td><td>62.7</td><td>59.2</td><td>65.1</td><td>60.1</td><td>65.5</td><td>69.2</td></tr><tr><td>LiveSports-3K [14]</td><td>-</td><td>74.5</td><td>71.5</td><td>77.5</td><td>73.3</td><td>77.8</td><td>78.0</td></tr><tr><td>OVOBench [63]</td><td>92.8</td><td>70.1</td><td>68.7</td><td>72.6</td><td>70.4</td><td>76.7</td><td>77.0</td></tr><tr><td>ODVBench [120]</td><td>91.4</td><td>63.6</td><td>56.7</td><td>63.5</td><td>65.1</td><td>69.6</td><td>72.5</td></tr><tr><td>ViSpeak [32]</td><td>96.0</td><td>89.0</td><td>86.0</td><td>79.0</td><td>77.5</td><td>84.0</td><td>78.5</td></tr></table>

context understanding. It achieves SOTA scores on DUDE (72.4), MMLongBench (74.8), and MMLongBenchDoc (61.4). In document and chart understanding, Seed2.0 Pro also leads on ChartQAPro (71.2) and OmniDocBench 1.5, proving its efficacy in processing complex, information-dense visual inputs.

上下文理解上的统治力. 它在 DUDE (72.4), MMLongBench (74.8) 和 MMLongBenchDoc (61.4) 上取得 SOTA. 在文档与图表理解上, Seed2.0 Pro 也在 ChartQAPro (71.2) 和 OmniDocBench 1.5 上领先, 证明它能有效处理复杂, 信息密集的视觉输入.

In summary, Seed2.0 Pro delivers state-of-the-art performance across a diverse array of visual-language tasks, particularly excelling in mathematics reasoning, perception proficiency, spatial reasoning, and long-context understanding, while Seed2.0 Lite and Mini offer competitive efficiency-focused alternatives.

总之, Seed2.0 Pro 在各类视觉语言任务上达到 SOTA 水平, 尤其擅长数学推理, 感知, 空间推理和长上下文理解, 而 Seed2.0 Lite 和 Mini 提供了偏重效率的有力替代.

> **核对:** Table 8 是三个尺寸唯一同框的表之一, 分数是否随尺寸单调?
> 不单调. Table 8 里 Lite 高于 Pro 的行有: DynaMath 70.5 对 68.9, ViVerBench 80.0 对 75.9, CountBench 97.1 对 95.5, LongDocURL 75.1 对 74.7; Mini 高于 Lite 的行有 SimpleVQA 68.7 对 67.2, PhyX 65.0 对 62.8, EgoTempo(Table 9) 67.2 对 61.8. 同一套评测条件下出现这种倒挂, 说明单个基准上 1–5 分的差距里有不小的噪声, 或者三个尺寸的后训练配方并不相同. 原文把 Lite 的 DynaMath 第一写成亮点, 但同一张表也说明不能拿单行分数给尺寸排序.

### 4.3 Video Task Evaluation

4.3 视频任务评测

We conduct a comprehensive evaluation of the Seed2.0 family (including Seed2.0 Mini, Seed2.0 Lite, and Seed2.0 Pro) across multiple dimensions of video capabilities, including knowledge, reasoning, perception, motion understanding, as well as long-term, multi-video, and streaming video analysis.

我们对 Seed2.0 家族(包括 Seed2.0 Mini, Seed2.0 Lite 和 Seed2.0 Pro)做了全面评测, 覆盖视频能力的多个维度, 包括知识, 推理, 感知, 运动理解, 以及长时, 多视频和流式视频分析.

As shown in Table 9, Seed2.0 pushes the performance frontier for video understanding and delivers state-of-the-art results on multiple benchmarks, with exceptional performance in motion perception, reasoning, and streaming video understanding.

如 Table 9 所示, Seed2.0 推进了视频理解的性能前沿, 在多个基准上取得 SOTA, 在运动感知, 推理和流式视频理解上表现尤其突出.

Video Knowledge. In terms of knowledge, Seed2.0 achieves leading performance on the multidisciplinary benchmark MMVU [125], and delivers results comparable to Gemini-3-Pro on VideoMMMU [39] and VideoSim-

视频知识. 知识方面, Seed2.0 在多学科基准 MMVU [125] 上领先, 并与 Gemini-3-Pro 在 VideoMMMU [39] 和 VideoSim-

<!-- page 15 of 78 -->

Table 10 Performance of Seed2.0 with video tool-use on long-form video understanding and reasoning. We compare the performance of Seed2.0 when using the VideoCut tool across different benchmarks.

表 10 Seed2.0 使用视频工具时在长视频理解与推理上的表现. 我们对比了 Seed2.0 在不同基准上使用 VideoCut 工具时的表现.

| Benchmark | Average Duration | Gemini-3-Pro | Seed1.8 | Seed1.8 w/ VideoCut | Seed2.0 | Seed2.0 Pro w/ VideoCut |
| --- | --- | --- | --- | --- | --- | --- |
| CGBench [12] | 1624 seconds | 65.5 | 62.4 | 65.9 | 65.0 | 66.8 |
| LVBench [95] | 4104 seconds | - | 73.0 | 78.9 | 76.4 | 80.0 |
| ZeroVideo | 1672 seconds | 14.3 | 6.9 | 18.8 | 14.5 | 27.9 |

pleQA [10], representing a substantial improvement over the previously released Seed1.8 [1]. In addition, it is worth noting that our lightweight model, Seed2.0 Mini, also performs strongly.

pleQA [10] 上结果相当, 相比此前发布的 Seed1.8 [1] 有大幅提升. 此外值得一提, 我们的轻量模型 Seed2.0 Mini 也表现强劲.

Video Reasoning. In video reasoning, Seed2.0 Pro continues to push the performance frontier. On VideoReasonBench [51], Seed2.0 surpasses human performance, with particularly strong results in visual state tracking, widely regarded as one of the most fundamental capabilities underlying video reasoning.

视频推理. 在视频推理上, Seed2.0 Pro 继续推进性能前沿. 在 VideoReasonBench [51] 上, Seed2.0 超过人类表现, 在视觉状态跟踪上尤其强, 这被普遍视为视频推理最基础的能力之一.

On Morse-500 [9], a highly challenging reasoning benchmark covering video abstract reasoning, physical reasoning, and planning reasoning, Seed2.0 further achieves a new state of the art, reaching 37.4% accuracy. Despite this progress, a substantial gap to human-level performance remains, and future iterations of the model will continue to close this gap.

Morse-500 [9] 是一个极具挑战的推理基准, 覆盖视频抽象推理, 物理推理和规划推理. Seed2.0 在上面进一步刷新 SOTA, 准确率达到 37.4%. 尽管有进展, 与人类水平仍有很大差距, 后续迭代会继续缩小这一差距.

Video Perception and Motion Understanding. Foundational video perception is critical to video understanding and reasoning. Among these perceptual competencies, motion understanding is particularly crucial for modeling temporal state transitions and tracking dynamic changes over time. Seed2.0 further strengthens its motion perception and understanding capabilities. As summarized in Table 9, Seed2.0 Pro attains state-of-the-art performance on the majority of benchmarks and substantially outperforms Seed1.8 and Gemini-3-Pro across several evaluations.

视频感知与运动理解. 基础视频感知对视频理解和推理至关重要. 在各项感知能力中, 运动理解对建模时序状态转移和跟踪随时间的动态变化尤其关键. Seed2.0 进一步强化了运动感知与理解能力. 如 Table 9 所总结, Seed2.0 Pro 在多数基准上取得 SOTA, 并在若干评测中大幅超过 Seed1.8 和 Gemini-3-Pro.

For TOMATO [78], we explore a Thinking with Tracking strategy in which we prompt to encourage the model to explicitly output per-frame bounding boxes for the moving target during reasoning, and then identifies the motion type based on the target's trajectory. This strategy is effective for both the Gemini and Seed models, and yields meaningful gains on TOMATO. Nevertheless, performance on TOMATO and TVBench suggests that a considerable gap to human-level proficiency remains. We will continue to advance motion perception in subsequent iterations to further narrow this gap.

对 TOMATO [78], 我们探索了一种 Thinking with Tracking 策略: 通过提示促使模型在推理时显式输出运动目标的逐帧边界框, 再根据目标轨迹判断运动类型. 这一策略对 Gemini 和 Seed 模型都有效, 在 TOMATO 上带来可观提升. 不过, TOMATO 和 TVBench 上的表现表明, 与人类水平仍有相当差距. 我们会在后续迭代中继续推进运动感知, 进一步缩小差距.

Long Video Understanding. For long-video understanding, Seed2.0 Pro achieves a breakthrough performance of 89.5 on VideoMME  $[30]$ . Seed2.0 also delivers strong results on LVBench and LongVideoBench, showing substantial improvements over Seed1.8 across these benchmarks. In addition, the entire Seed2.0 model family is equipped with VideoCut tool-use capabilities by default to improve long video reasoning.

长视频理解. 在长视频理解上, Seed2.0 Pro 在 VideoMME $[30]$ 上取得 89.5 的突破性成绩. Seed2.0 在 LVBench 和 LongVideoBench 上也表现强劲, 在这些基准上相比 Seed1.8 大幅提升. 此外, 整个 Seed2.0 模型家族默认具备 VideoCut 工具调用能力, 以改进长视频推理.

Multiple Video Understanding. Multi-video understanding requires models to identify and integrate critical evidence across multiple video contexts, and is a core capability for real-world applications as well as video agents. On CrossVid [46], a benchmark for multi-video understanding, Seed2.0 Pro achieves a new state-of-the-art score of 60.3. Looking ahead, we will prioritize further improvements in multi-video understanding, with an emphasis on strengthening cross-context reasoning.

多视频理解. 多视频理解要求模型在多个视频上下文中识别并整合关键证据, 是真实应用和视频 agent 的核心能力. 在多视频理解基准 CrossVid [46] 上, Seed2.0 Pro 取得 60.3 的新 SOTA. 展望未来, 我们会优先继续改进多视频理解, 重点加强跨上下文推理.

Streaming. Moving beyond static analysis, streaming video understanding and interactive reasoning enable systems to comprehend and respond to visual inputs in real-time, providing key capabilities for interactive products (e.g., Doubao video calling). Across multiple benchmarks, Seed2.0 Pro delivers further improvements, while Seed2.0 Lite surpasses Gemini-3-Pro/Flash in several evaluations with high efficiency.

流式. 超越静态分析, 流式视频理解和交互式推理让系统能实时理解并回应视觉输入, 为交互式产品(如豆包视频通话)提供关键能力. 在多个基准上, Seed2.0 Pro 进一步提升, Seed2.0 Lite 则以高效率在若干评测中超过 Gemini-3-Pro/Flash.

Video Tool-Use: VideoCut. Seed2.0 also further enhances video tool-use capability, i.e., VideoCut. When processing long videos or tasks that require high-frame-rate perception, it can adopt VideoCut to replay relevant segments at a higher FPS, which is an intuitive and effective mechanism for video understanding and reasoning. As shown in Table 10, we evaluate the performance of enabling VideoCut for Seed2.0 Pro.

视频工具调用: VideoCut. Seed2.0 还进一步增强了视频工具调用能力, 即 VideoCut. 处理长视频或需要高帧率感知的任务时, 它可以用 VideoCut 以更高 FPS 回放相关片段, 这是一种直观有效的视频理解与推理机制. 如 Table 10 所示, 我们评测了 Seed2.0 Pro 开启 VideoCut 后的表现.

> **看表:** Table 9 的长视频分数到底开没开 VideoCut? 这部分增益该算 TestingTime 还是部署前缩放?
> 原文自相矛盾. 上文说「整个家族默认具备 VideoCut」, 但 Table 10 的 「Seed2.0」 一列(CGBench 65.0, LVBench 76.4)与 Table 9 中 Seed2.0 Pro 的数字完全相同, 而 「w/ VideoCut」 一列另给 66.8 和 80.0, 可见 Table 9 是关着 VideoCut 跑的. VideoCut 是推理时多花算力回放片段, 属于 TestingTime; 尺寸差异属于部署前缩放. 两者可以对着量: LVBench 上 Mini 66.6 到 Pro 76.4 是 +9.8(缩放), Pro 76.4 到 80.0 是 +3.6(TestingTime); CGBench 上是 +5.8 对 +1.8. 只有 ZeroVideo 反过来, VideoCut 带来 +13.4(14.5 到 27.9), 而且 Table 10 的 「Seed2.0」 一列没写是哪个尺寸.

<!-- page 16 of 78 -->

Table 11 Evaluation on Fundamental Agentic Capacity Benchmarks (Large Models). The highest score is marked in bold, and the second is underlined. Some scores differ greatly from the evaluation results in the tech reports by other organizations. The scores in parentheses represent the results under the aligned settings then.

表 11 基础 Agent 能力基准评测(大模型). 最高分加粗, 第二名加下划线. 有些分数与其他机构技术报告中的评测结果差别很大. 括号中的分数表示当时对齐设置下的结果.

<table><tr><td>Capability</td><td>Benchmark</td><td>GPT-5.2 High</td><td>Claude-Sonnet-4.5</td><td>Claude-Opus-4.5</td><td>Gemini-3-pro High</td><td>Seed2.0 Pro</td></tr><tr><td rowspan="12">Coding Agent</td><td>Terminal Bench  $2.0^1$ </td><td>62.4</td><td>45.2</td><td>60.2</td><td>56.9</td><td>55.8</td></tr><tr><td>SWE-Lancer</td><td>48.9</td><td>45.7</td><td>56.1</td><td>44.3</td><td>49.4</td></tr><tr><td>SWE Bench Verified</td><td>80.0</td><td>77.2</td><td>80.9</td><td>76.2</td><td>76.5</td></tr><tr><td>Multi-SWE-Bench</td><td>47.7</td><td>47.7</td><td>52.8</td><td>50.2</td><td>45.2</td></tr><tr><td>SWE-Bench Pro</td><td>55.6</td><td>48.4</td><td>55.4</td><td>49.7</td><td>46.9</td></tr><tr><td>SWE Multilingual</td><td>68.8</td><td>64.1</td><td>74.0</td><td>72.7</td><td>71.7</td></tr><tr><td>Scicode</td><td>49.7</td><td>47.9</td><td>52.8</td><td>57.7</td><td>48.5</td></tr><tr><td>SWE-Evo</td><td>12.5</td><td>16.7</td><td>27.1</td><td>8.9</td><td>8.5</td></tr><tr><td>Aider Polyglot</td><td>91.1</td><td>82.2</td><td>92.4</td><td>94.2</td><td>80.0</td></tr><tr><td>ArtifactsBench</td><td>71.1</td><td>59.1</td><td>68.5</td><td>58.4</td><td>66.6</td></tr><tr><td>CodeSimpleQA</td><td>62.3</td><td>59.6</td><td>63.0</td><td>54.7</td><td>58.0</td></tr><tr><td>SpreadsheetBench Verified</td><td>69.9</td><td>75.9</td><td>78.6</td><td>70.8</td><td>79.1</td></tr><tr><td rowspan="8">Search Agent</td><td>BrowseComp</td><td>77.9 (65.3)</td><td>43.9 (29.5)</td><td>67.8 (57.2)</td><td>59.2</td><td>77.3</td></tr><tr><td>BrowseComp-zh</td><td>76.1</td><td>42.4</td><td>62.4</td><td>66.8</td><td>82.4</td></tr><tr><td>HLE-text</td><td>45.5</td><td>32.0</td><td>43.2</td><td>46.9</td><td>54.2</td></tr><tr><td>HLE-Verified</td><td>68.5</td><td>37.6</td><td>56.6</td><td>67.5</td><td>73.6</td></tr><tr><td>WideSearch</td><td>76.8</td><td>65.1</td><td>76.2 (71.7)</td><td>67.3</td><td>74.7</td></tr><tr><td>FinSearchComp</td><td>73.8</td><td>58.6</td><td>66.2</td><td>52.7</td><td>70.2</td></tr><tr><td>DeepSearchQA</td><td>71.3 (66.4)</td><td>36.3</td><td>76.1 (41.6)</td><td>63.9</td><td>77.4</td></tr><tr><td>Seal-0</td><td>51.4</td><td>53.4</td><td>47.7</td><td>45.5</td><td>49.5</td></tr><tr><td rowspan="5">Tool Use</td><td> $\tau^2$ -Bench (retail)</td><td>82</td><td>86.2</td><td>88.9</td><td>85.3</td><td>90.4</td></tr><tr><td> $\tau^2$ -Bench (telecom)</td><td>98.7</td><td>98.0</td><td>98.2</td><td>98.0</td><td>94.2</td></tr><tr><td>MCP-Mark</td><td>57.5</td><td>32.1</td><td>42.3</td><td>53.9</td><td>54.7</td></tr><tr><td>BFCL-v4</td><td>65.9</td><td>72.9</td><td>76.5</td><td>71.0</td><td>73.4</td></tr><tr><td>VitaBench</td><td>41.8</td><td>40.8</td><td>55.3</td><td>48.8</td><td>47.0</td></tr><tr><td rowspan="3">Deep Research</td><td>DeepConsult</td><td>54.3</td><td>55.8</td><td>61.0</td><td>48.0</td><td>61.1</td></tr><tr><td>DeepResearchBench</td><td>52.2</td><td>47.2</td><td>50.6</td><td>49.6</td><td>53.3</td></tr><tr><td>ResearchRubrics</td><td>42.3</td><td>38.6</td><td>45.0</td><td>37.7</td><td>50.7</td></tr><tr><td rowspan="3">Vision Agent</td><td>Minedojo-Verified</td><td>18.3</td><td>-</td><td>-</td><td>23.3</td><td>49.0</td></tr><tr><td>MM-BrowseComp</td><td>26.3</td><td>-</td><td>-</td><td>25.0</td><td>48.8</td></tr><tr><td>HLE-VL</td><td>31.0</td><td>-</td><td>-</td><td>36.0</td><td>39.2</td></tr></table>

$^{1}$  Using Terminus2.

$^{1}$ 使用 Terminus2.

With VideoCut, Seed2.0 Pro further raises the ceiling of long-video understanding, yielding substantial improvements on CGBench, LVBench, and the challenging ZeroVideo, which consists of challenging, real-world video reasoning scenarios, including fine-grained high-frame-rate motion perception and long-form, multi-hop reasoning over extended videos.

借助 VideoCut, Seed2.0 Pro 进一步抬高了长视频理解的上限, 在 CGBench, LVBench 以及高难的 ZeroVideo 上都有大幅提升. ZeroVideo 由高难的真实视频推理场景组成, 包括细粒度高帧率运动感知和长视频上的长篇多跳推理.

### 4.4 Fundamental Agentic Capacity

4.4 基础 Agent 能力

We evaluate Seed2.0 (Pro/Lite) on a diverse set of agentic benchmarks covering search agents, deep research, vision agents, coding agents, and tool use. Tables 11 and 12 report detailed results.

我们在一组多样的 agent 基准上评测 Seed2.0(Pro/Lite), 覆盖搜索 agent, 深度研究, 视觉 agent, 编码 agent 和工具调用. Table 11 和 Table 12 给出详细结果.

Overall, Seed2.0 Pro lands in the top tier across agentic capabilities, with clear advantages on search, deep research, and vision agent tasks—the workloads that matter most for high-frequency user scenarios like information seeking, complex reasoning, and multimodal interaction.

总体来看, Seed2.0 Pro 在各项 agent 能力上位居第一梯队, 在搜索, 深度研究和视觉 agent 任务上优势明显, 这些正是信息检索, 复杂推理和多模态交互等高频用户场景最看重的负载.

Search, Deep Research, and Vision Agents. Seed2.0 Pro consistently leads or sits near the top on search and research-oriented benchmarks: HLE, BrowseComp, WideSearch and DeepSearchQA. On deep research tasks,

搜索, 深度研究与视觉 Agent. Seed2.0 Pro 在面向搜索和研究的基准上稳定领先或接近榜首: HLE, BrowseComp, WideSearch 和 DeepSearchQA. 在深度研究任务上,

<!-- page 17 of 78 -->

Table 12 Evaluation on Fundamental Agentic Capacity Benchmarks (Efficient Models). The highest score is marked in bold, and the second is underlined.

表 12 基础 Agent 能力基准评测(高效模型). 最高分加粗, 第二名加下划线.

<table><tr><td>Capability</td><td>Benchmark</td><td>GPT-5-mini High</td><td>Gemini-3-Flash High</td><td>Seed2.0 Lite</td></tr><tr><td rowspan="12">Coding Agent</td><td>Terminal Bench  $2.0^1$ </td><td>36.9</td><td>60.0</td><td>45.0</td></tr><tr><td>SWE-Lancer</td><td>43.1</td><td>51.7</td><td>47.1</td></tr><tr><td>SWE Bench Verified</td><td>67.9</td><td>78.0</td><td>73.5</td></tr><tr><td>Multi-SWE-Bench</td><td>49.3</td><td>59.0</td><td>41.1</td></tr><tr><td>SWE-Bench Pro</td><td>51.7</td><td>46.7</td><td>46.0</td></tr><tr><td>SWE Multilingual</td><td>63.8</td><td>71.1</td><td>64.4</td></tr><tr><td>Scicode</td><td>40.2</td><td>55.0</td><td>52.4</td></tr><tr><td>SWE-Evo</td><td>10.4</td><td>12.8</td><td>10.6</td></tr><tr><td>Aider Polyglot</td><td>79.1</td><td>92.0</td><td>76.0</td></tr><tr><td>ArtifactsBench</td><td>68.9</td><td>52.5</td><td>62.6</td></tr><tr><td>CodeSimpleQA</td><td>57.6</td><td>53.7</td><td>53.1</td></tr><tr><td>SpreadsheetBench Verified</td><td>58.1</td><td>65.7</td><td>82.3</td></tr><tr><td rowspan="8">Search Agent</td><td>BrowseComp</td><td>48.1</td><td>41.5</td><td>72.1</td></tr><tr><td>BrowseComp-zh</td><td>49.5</td><td>63.0</td><td>82.0</td></tr><tr><td>HLE-text</td><td>35.8</td><td>47.6</td><td>49.5</td></tr><tr><td>HLE-Verified</td><td>56.4</td><td>71.8</td><td>70.7</td></tr><tr><td>WideSearch</td><td>37.7</td><td>64.0</td><td>74.5</td></tr><tr><td>FinSearchComp</td><td>38.1</td><td>54.8</td><td>65.1</td></tr><tr><td>DeepSearchQA</td><td>16.7</td><td>54.7</td><td>67.7</td></tr><tr><td>Seal-0</td><td>34.2</td><td>37.8</td><td>52.3</td></tr><tr><td rowspan="5">Tool Use</td><td> $\tau^2$ -Bench (retail)</td><td>-</td><td>88.6</td><td>90.9</td></tr><tr><td> $\tau^2$ -Bench (telecom)</td><td>-</td><td>94.7</td><td>92.1</td></tr><tr><td>MCP-Mark</td><td>30.2</td><td>40.5</td><td>46.7</td></tr><tr><td>BFCL-v4</td><td>57.9</td><td>65.0</td><td>72.9</td></tr><tr><td>VitaBench</td><td>20.8</td><td>46.7</td><td>41.8</td></tr><tr><td rowspan="3">Deep Research</td><td>DeepConsult</td><td>49.8</td><td>26.0</td><td>60.3</td></tr><tr><td>DeepResearchBench</td><td>50.7</td><td>46.1</td><td>54.4</td></tr><tr><td>ResearchRubrics</td><td>43.6</td><td>36.9</td><td>50.8</td></tr><tr><td rowspan="3">Vision Agent</td><td>Minedojo Verified</td><td>20.3</td><td>24.3</td><td>39.7</td></tr><tr><td>MM-BrowseComp</td><td>17.9</td><td>22.8</td><td>45.1</td></tr><tr><td>HLE-VL</td><td>18.7</td><td>36.8</td><td>35.8</td></tr></table>

$^{1}$  Using Terminus2.

$^{1}$ 使用 Terminus2.

it posts the best results on Deep Research and Research Rubrics. In vision-agent settings, Seed2.0 Pro pulls ahead of reported baselines by a wide margin on Minedojo-Verified, MM-BrowseComp, and HLE-VL—evidence of strong multimodal grounding for action-oriented tasks. Taken together, these numbers place Seed2.0 Pro at or near state-of-the-art on search, deep research, and vision agents.

它在 Deep Research 和 Research Rubrics 上取得最好成绩. 在视觉 agent 场景中, Seed2.0 Pro 在 Minedojo-Verified, MM-BrowseComp 和 HLE-VL 上大幅领先已报告的基线, 说明它在面向动作的任务上有很强的多模态落地能力. 综合来看, 这些数字表明 Seed2.0 Pro 在搜索, 深度研究和视觉 agent 上处于或接近 SOTA.

Tool Use and Coding Agents. Tool use and coding-agent performance is solidly first-tier. Seed2.0 Pro holds its own on SWE-Bench Pro and SWE Bench Verified, and tops SpreadsheetBench for structured artifact manipulation. We also see distinctive gains on SWE-Evo, pointing to robust evolutionary code improvement. Beyond this, Seed2.0 Pro also delivers strong performance on general tool use tasks such as MCP-Mark, BFCL-v4 and  $\tau^{2}$ -Bench. That said, complex API orchestration and long-horizon code execution still leave room to grow.

工具调用与编码 Agent. 工具调用和编码 agent 的表现稳居第一梯队. Seed2.0 Pro 在 SWE-Bench Pro 和 SWE Bench Verified 上不落下风, 并在结构化产物操作的 SpreadsheetBench 上排名第一. 我们在 SWE-Evo 上也看到了独特的提升, 表明它在演进式代码改进上较为稳健. 此外, Seed2.0 Pro 在 MCP-Mark, BFCL-v4 和 $\tau^{2}$-Bench 等通用工具调用任务上也表现强劲. 不过, 复杂 API 编排和长时程代码执行仍有提升空间.

Efficient Agentic Deployment. Among small models, Seed2.0 Lite consistently ranks first or second on efficient agentic benchmarks. It performs well on search and deep research tasks and posts excellent SpreadsheetBench numbers. Paired with significantly lower inference cost, Lite offers a practical quality-cost trade-off for large-scale and latency-sensitive deployments.

高效 Agent 部署. 在小模型中, Seed2.0 Lite 在高效 agent 基准上稳定排在第一或第二. 它在搜索和深度研究任务上表现良好, SpreadsheetBench 成绩优秀. 加上显著更低的推理成本, Lite 为大规模, 延迟敏感的部署提供了实用的质量成本取舍.

<!-- page 18 of 78 -->

Table 13 Evaluation on Advanced Economically and Scientifically Valuable Tasks (Large Models). The highest score is marked in bold, and the second is underlined.

表 13 高阶经济与科学价值任务评测(大模型). 最高分加粗, 第二名加下划线.

<table><tr><td>Capability</td><td>Benchmark</td><td>GPT-5.2 High</td><td>Claude-Sonnet-4.5</td><td>Claude-Opus-4.5</td><td>Gemini-3-pro High</td><td>Seed2.0 Pro</td></tr><tr><td rowspan="5">Science Discovery</td><td>Scicode</td><td>49.7</td><td>47.9</td><td>52.8</td><td>57.7</td><td>52.1</td></tr><tr><td>FrontierSci-research</td><td>25.0</td><td>16.7</td><td>21.7</td><td>15.0</td><td>23.3</td></tr><tr><td>Superchem (text-only)</td><td>58.0</td><td>32.4</td><td>43.2</td><td>63.2</td><td>53.0</td></tr><tr><td>BIObench</td><td>58.1</td><td>44.7</td><td>49.3</td><td>51.3</td><td>53.5</td></tr><tr><td>AInstein Bench</td><td>41.3</td><td>33.7</td><td>44.0</td><td>42.8</td><td>47.7</td></tr><tr><td rowspan="5">Vibe Coding</td><td>NL2Repo-Bench</td><td>49.3</td><td>39.9</td><td>43.2</td><td>34.2</td><td>27.9</td></tr><tr><td>NL2Repo (Pass@1)</td><td>8.0</td><td>3.0</td><td>3.0</td><td>4.0</td><td>3.0</td></tr><tr><td>ArtifactsBench</td><td>71.1</td><td>59.1</td><td>68.5</td><td>58.4</td><td>66.6</td></tr><tr><td>SWE-Bench Pro</td><td>55.6</td><td>48.4</td><td>55.4</td><td>49.7</td><td>46.9</td></tr><tr><td>Terminal Bench  $2.0^1$ </td><td>62.4</td><td>45.2</td><td>60.2</td><td>54.2</td><td>55.8</td></tr><tr><td rowspan="5">Context Learning</td><td>KORBench</td><td>79.2</td><td>73.0</td><td>77.4</td><td>73.9</td><td>77.2</td></tr><tr><td> $DeR^2$  Bench</td><td>69.0</td><td>58.9</td><td>60.4</td><td>66.1</td><td>58.2</td></tr><tr><td>CL-Bench</td><td>23.9</td><td>18.1</td><td>22.6</td><td>15.6</td><td>21.5</td></tr><tr><td>ToB-Complex Workflows</td><td>45.0</td><td>61.0</td><td>64.8</td><td>69.2</td><td>64.7</td></tr><tr><td>ToB-Reference Q&amp;A</td><td>63.6</td><td>58.9</td><td>67.9</td><td>68.3</td><td>72.4</td></tr><tr><td rowspan="9">Real World Tasks</td><td>HealthBench - Hard</td><td>36.6</td><td>10.9</td><td>11.0</td><td>15.0</td><td>28.3</td></tr><tr><td>GDPVal-Diamond</td><td>26.9</td><td>15.2</td><td>20.7</td><td>19.4</td><td>21.3</td></tr><tr><td>XPert Bench</td><td>53.3</td><td>44.7</td><td>50.5</td><td>53.1</td><td>64.5</td></tr><tr><td>ToB-K12 Education</td><td>61.6</td><td>50.1</td><td>56.2</td><td>59.4</td><td>62.8</td></tr><tr><td>ToB-Compositional Tasks</td><td>51.5</td><td>57.3</td><td>63.6</td><td>64.8</td><td>59.1</td></tr><tr><td>ToB-Text Classification</td><td>62.1</td><td>64.5</td><td>63.9</td><td>67.5</td><td>69.0</td></tr><tr><td>ToB-Information Extraction</td><td>44.7</td><td>48.3</td><td>50.1</td><td>49.0</td><td>52.0</td></tr><tr><td>World Travel (VLM)</td><td>19.33</td><td>2.67</td><td>14.0</td><td>8.0</td><td>12.0</td></tr><tr><td>World Travel (TEXT)</td><td>32.67</td><td>10.0</td><td>21.3</td><td>14.7</td><td>23.3</td></tr></table>

$^{1}$  Using Terminus2.

$^{1}$ 使用 Terminus2.

### 4.5 Advanced Economically and Scientifically Valuable Tasks

4.5 高阶经济与科学价值任务

We further evaluate Seed2.0 on advanced tasks that reflect scientific discovery, economically valuable workflows, context-based learning, and real-world task completion. Tables 13 and 14 report the detailed results.

我们进一步在反映科学发现, 有经济价值的工作流, 基于上下文的学习和真实任务完成的高阶任务上评测 Seed2.0. Table 13 和 Table 14 给出详细结果.

Scientific Discovery. Seed2.0 Pro operates at the frontier. It posts strong numbers on FrontierSci-research and scientific coding benchmarks, and leads on AInstein Bench—signs of robust hypothesis-driven reasoning in research-style scenarios.

科学发现. Seed2.0 Pro 处于前沿. 它在 FrontierSci-research 和科学编程基准上成绩强劲, 并在 AInstein Bench 上领先, 表明它在研究式场景中具备稳健的假设驱动推理.

> **拆开:** Table 13 与 Table 3/11 里同名基准的 Seed2.0 Pro 分数一致吗?
> 拆开逐行对, 有六处不一致. Scicode: Table 11 为 48.5, Table 13 为 52.1; FrontierSci-research: Table 3 为 25.0, Table 13 为 23.3; Superchem (text-only): 51.6 对 53.0; KORBench: 77.5 对 77.2; CL-Bench: 20.8 对 21.5; HealthBench - Hard: 29.1 对 28.3, 同一行 GPT-5.2 High 也从 42.0 变成 36.6. 另外 Table 3 的 「BABE」 与 Table 13 的 「BIObench」 对手分数完全相同(58.1, 44.7, 49.3), Seed2.0 Pro 却从 50.0 变成 53.5. 对手不变而 Seed 变, 像是 Seed 这一列来自不同的检查点或不同轮次, 原文没有说明. 读 Table 13 的「领先」时, 要记得同名基准在别的表里可能是另一个数.

Real-World Economic Value. Beyond science, Seed2.0 Pro translates well to tasks with direct economic value. It tops XPert Bench and remains highly competitive on GDPVal and multiple ToB benchmarks. Notably, the model excels on user-oriented scenarios we explicitly optimize for: customer-service QA, information extraction, intent recognition, and K12 problem solving. These results reflect reliable instruction-following behavior in production.

真实经济价值. 在科学之外, Seed2.0 Pro 在有直接经济价值的任务上也表现良好. 它在 XPert Bench 上排第一, 在 GDPVal 和多个 ToB 基准上保持很强的竞争力. 值得注意的是, 模型在我们明确优化的面向用户场景上表现出色: 客服问答, 信息抽取, 意图识别和 K12 解题. 这些结果反映了生产中可靠的指令遵循行为.

Context Learning and Repository-Level Code. Clear headroom remains on context-driven learning and end-to-end vibe coding. Seed2.0 Pro trails the strongest baselines on DeR $^{2}$ Bench and NL2Repo-Bench, suggesting that long-horizon context integration and repository-level code generation are still challenging. We have flagged these as priority directions and are actively pushing targeted research.

上下文学习与仓库级代码. 在上下文驱动的学习和端到端 vibe coding 上仍有明显空间. Seed2.0 Pro 在 DeR $^{2}$ Bench 和 NL2Repo-Bench 上落后于最强基线, 说明长时程上下文整合和仓库级代码生成仍然困难. 我们已将这些列为优先方向, 正在积极推进针对性研究.

> **确认:** Table 13 的 NL2Repo-Bench 和 NL2Repo (Pass@1) 是同一件事的两个分数吗?
> 同一批任务, 两个分母. NL2Repo-Bench 一行更像按测试用例计的通过比例(Seed2.0 Pro 27.9, GPT-5.2 High 49.3), NL2Repo (Pass@1) 一行是整个仓库一次全部通过的比例(Seed2.0 Pro 3.0, GPT-5.2 High 8.0). 前者看「写对了多少」, 后者看「能不能交付」. 在 Pass@1 口径下五家都在 3.0–8.0 之间, 最多相差 5 个点; 在部分通过口径下差距拉到 21.4. Table 14 同理, Seed2.0 Lite 是 24.6 对 1.0. 原文没写 NL2Repo-Bench 的计分公式, 「部分通过比例」这一点是从两行量级推断的.

Efficiency at Scale. Seed2.0 Lite holds up well on advanced tasks among efficient models. It posts strong results on ToB real-world benchmarks, solid scientific discovery numbers, and competitive context-learning outcomes. On several advanced benchmarks, Lite beats GPT-5-Mini outright while offering favorable latency and cost.

规模化效率. 在高效模型中, Seed2.0 Lite 在高阶任务上表现稳健. 它在 ToB 真实基准上成绩强劲, 科学发现成绩扎实, 上下文学习结果也有竞争力. 在若干高阶基准上, Lite 直接胜过 GPT-5-Mini, 同时延迟和成本更有优势.

<!-- page 19 of 78 -->

Table 14 Evaluation on Advanced Economically and Scientifically Valuable Tasks (Efficient Models). The highest score is marked in bold, and the second is underlined.

表 14 高阶经济与科学价值任务评测(高效模型). 最高分加粗, 第二名加下划线.

<table><tr><td>Capability</td><td>Benchmark</td><td>GPT-5-mini High</td><td>Gemini-3-Flash High</td><td>Seed2.0 Lite</td></tr><tr><td rowspan="5">Science Discovery</td><td>Scicode</td><td>40.2</td><td>55.0</td><td>52.4</td></tr><tr><td>FrontierSci-research</td><td>18.3</td><td>11.7</td><td>18.3</td></tr><tr><td>Superchem (text-only)</td><td>34.8</td><td>54.4</td><td>48.0</td></tr><tr><td>BIObench</td><td>49.2</td><td>55.2</td><td>50.2</td></tr><tr><td>AInstein Bench</td><td>35.0</td><td>44.0</td><td>38.3</td></tr><tr><td rowspan="5">Vibe Coding</td><td>NL2Repo-Bench</td><td>19.5</td><td>27.6</td><td>24.6</td></tr><tr><td>NL2Repo (Pass@1)</td><td>2.0</td><td>2.0</td><td>1.0</td></tr><tr><td>ArtifactsBench</td><td>68.9</td><td>52.5</td><td>62.6</td></tr><tr><td>SWE-Bench Pro</td><td>51.7</td><td>46.7</td><td>46.0</td></tr><tr><td>Terminal Bench  $2.0^1$ </td><td>36.9</td><td>60.0</td><td>45.0</td></tr><tr><td rowspan="5">Context Learning</td><td>KORBench</td><td>74.2</td><td>76.0</td><td>77.0</td></tr><tr><td> $DeR^2$  Bench</td><td>50.3</td><td>66.0</td><td>57.3</td></tr><tr><td>CL-Bench</td><td>25.2</td><td>16.1</td><td>20.0</td></tr><tr><td>ToB-Reference Q&amp;A</td><td>53.4</td><td>64.9</td><td>68.2</td></tr><tr><td>ToB-Complex Workflows</td><td>42.5</td><td>61.3</td><td>62.0</td></tr><tr><td rowspan="9">Real World Tasks</td><td>HealthBench - Hard</td><td>38.6</td><td>21.5</td><td>20.0</td></tr><tr><td>GDPVal-Diamond</td><td>11.5</td><td>6.46</td><td>23.2</td></tr><tr><td>XPert Bench</td><td>47.6</td><td>50.1</td><td>63.3</td></tr><tr><td>ToB-K12 Education</td><td>53.7</td><td>59.0</td><td>63.8</td></tr><tr><td>ToB-Compositional Tasks</td><td>47.5</td><td>57.7</td><td>54.8</td></tr><tr><td>ToB-Text Classification</td><td>52.7</td><td>61.9</td><td>64.5</td></tr><tr><td>ToB-Information Extraction</td><td>40.5</td><td>45.4</td><td>48.4</td></tr><tr><td>World Travel (VLM)</td><td>2.7</td><td>7.3</td><td>14.0</td></tr><tr><td>World Travel (TEXT)</td><td>15.3</td><td>13.3</td><td>24.0</td></tr></table>

$^{1}$  Using Terminus2.

$^{1}$ 使用 Terminus2.

Across agentic capacity and advanced real-world tasks, Seed2.0 delivers consistent top-tier performance. Seed2.0 Pro excels in search, deep research, vision agents, and scientific discovery; Lite provides a compelling efficiency-focused alternative for large-scale deployment.

在 agent 能力和高阶真实任务上, Seed2.0 始终保持第一梯队表现. Seed2.0 Pro 在搜索, 深度研究, 视觉 agent 和科学发现上表现突出; Lite 为大规模部署提供了有吸引力的偏效率选项.

## 5 Use Cases of Seed2.0

5 Seed2.0 的应用案例

In this section, we demonstrate the applicability of Seed2.0 across diverse real-world scenarios, illustrating how the model addresses practical challenges in vibe coding, application operation, and even scientific discovery.

本节展示 Seed2.0 在多种真实场景中的适用性, 说明模型如何应对 vibe coding, 应用操作乃至科学发现中的实际难题.

### 5.1 Vibe Coding

5.1 Vibe Coding

In the "Vibe Coding" setting, the model is evaluated on end-to-end software engineering behavior under realistic constraints rather than isolated code snippets. Tasks include interpreting underspecified requirements, forming executable plans, producing runnable artifacts, and iteratively refining solutions based on feedback until acceptance criteria are met.

在 「Vibe Coding」 设置中, 模型接受的评测是真实约束下的端到端软件工程行为, 而不是孤立的代码片段. 任务包括理解描述不全的需求, 形成可执行的计划, 产出可运行的产物, 并根据反馈迭代改进, 直到满足验收标准.

To characterize Seed2.0's capabilities in this regime, we present five representative case studies: algorithmically challenging code synthesis under compute constraints (§ 5.1.1), repository-level construction from requirements documents alone (§ 5.1.2), zero-regression debugging guided by unit tests (§ 5.1.3), cross-version upgrade debugging using release notes with full test suite validation (§ 5.1.4), and competition-level programming under official limits (§ 5.1.5). These settings vary supervision completeness, engineering scope, and failure signal observability, enabling comprehensive assessment of planning, implementation, verification, and iterative correction in realistic development workflows.

为了刻画 Seed2.0 在这一场景下的能力, 我们给出五个有代表性的案例: 算力约束下有算法难度的代码合成(§ 5.1.1), 仅凭需求文档构建仓库(§ 5.1.2), 单元测试引导的零回归调试(§ 5.1.3), 借助 release notes 并以完整测试套件验证的跨版本升级调试(§ 5.1.4), 以及官方限制下的竞赛级编程(§ 5.1.5). 这些设置在监督完整度, 工程范围和失败信号可观测性上各不相同, 可以全面评估真实开发流程中的规划, 实现, 验证和迭代修正.

<!-- page 20 of 78 -->

![Image block](images/p20-figure-3-the-case-of-seed2-0-with-complex-code.png)

Figure 3 The case of Seed2.0 with Complex Code Generation Task on TerminalBench 2.0 [59].

图 3 Seed2.0 在 TerminalBench 2.0 [59] 复杂代码生成任务上的案例.

<!-- page 21 of 78 -->

*范围说明: § 5.1.1 属于网络安全类(密码分析)案例, 按本文件的范围只记评测名称与结果, 不转写做法和案例. 评测: TerminalBench 2.0, 任务 feal-linear-cryptanalysis, 难度标注 Hard. 结果: 12 轮交互内完成, 候选结果对 32 组已知样本全部校验一致, 100 条目标数据全部处理并写出. 原文未给阈值. 图见 Figure 3.*

#### 5.1.2 Project Repository Construction

5.1.2 项目仓库构建

To evaluate the model's Project Repository Construction capabilities, we use the NL2Repo [25] task, which requires building a library-level Python repository from an empty workspace using only a requirements document. The deliverable is a Decouple-style configuration utility that separates configuration from code while remaining installable, testable, and usable as a standard Python package. Seed2.0 completes the task in 37 interaction rounds. As shown in Figure 4, the workflow follows three standard phases: Specification Analysis, Implementation & Configuration, and Testing & Debugging. Seed2.0 first reads start.md and extracts requirements for configuration decoupling, multi-source loading. Implementation centers on decouple.py, which defines eight core classes for source precedence, parsing, and type conversion.

为评测模型的项目仓库构建能力, 我们使用 NL2Repo [25] 任务: 从空工作区出发, 仅凭一份需求文档构建一个库级 Python 仓库. 交付物是一个 Decouple 风格的配置工具, 把配置与代码分离, 同时要能作为标准 Python 包安装, 测试和使用. Seed2.0 用 37 轮交互完成了任务. 如 Figure 4 所示, 工作流分三个标准阶段: 规格分析, 实现与配置, 测试与调试. Seed2.0 先读 start.md, 提取配置解耦和多源加载的需求. 实现以 decouple.py 为中心, 其中定义了八个核心类, 负责来源优先级, 解析和类型转换.

Quality assurance relies on a pytest suite (tests/test\_decouple.py) with 22 model-written test cases. Failures reveal issues that were fixed iteratively: installing a missing pytest dependency; addressing a Python 3.12-related configuration-reading import failure by switching to parser.read\_file(); adding a guard for boolean casting on empty strings; moving fixtures to global scope to avoid class-scoping conflicts; and correcting a parameter-name mismatch (flat versus choices) to match the intended API. This pattern indicates systematic debugging guided by test output.

质量保障依靠一个 pytest 测试套件(tests/test\_decouple.py), 其中有 22 个模型自己写的测试用例. 失败暴露出的问题被逐个修复: 安装缺失的 pytest 依赖; 针对 Python 3.12 下读取配置时的导入失败, 改用 parser.read\_file(); 为空字符串的布尔转换加保护; 把 fixture 移到全局作用域, 避免类作用域冲突; 修正参数名不一致(flat 对 choices), 使之符合预期 API. 这一模式说明模型在按测试输出做系统性调试.

After these fixes, all 22 tests pass. The model also runs example code, validates installation via “pip install -e .”, and confirms cross-directory imports, showing both functional correctness and packaging readiness.

修复之后, 22 个测试全部通过. 模型还运行了示例代码, 用 「pip install -e .」 验证安装, 并确认跨目录导入可用, 同时证明了功能正确和打包就绪.

<!-- page 22 of 78 -->

![Image block](images/p22-figure-4-case-study-of-seed2-0-performing-the-project.png)

Figure 4 Case study of Seed2.0 performing the Project Repository Construction Task on NL2Repo [25].

图 4 Seed2.0 在 NL2Repo [25] 上执行项目仓库构建任务的案例.

Overall, Seed2.0 follows a structured, engineer-like workflow from requirements to implementation, testing, and debugging, producing a complete, convention-compliant repository with documentation.

总体而言, Seed2.0 遵循一套结构化, 像工程师一样的工作流, 从需求到实现, 测试和调试, 最终产出一个完整, 符合规范且带文档的仓库.

#### 5.1.3 Iterative Code Debugging

5.1.3 迭代式代码调试

To systematically analyze the iterative code debugging capabilities of Seed2.0, we present a detailed case study from SWEBenchPro [23]. This case presents a zero-regression refactoring that relocates the Qt warning suppression logic and its tests from log.py to qtlog.py, correcting module boundaries without altering external behavior.

为系统分析 Seed2.0 的迭代式代码调试能力, 我们给出一个来自 SWEBenchPro [23] 的详细案例. 这是一次零回归重构: 把 Qt 警告屏蔽逻辑及其测试从 log.py 迁到 qtlog.py, 在不改变外部行为的前提下修正模块边界.

<!-- page 23 of 78 -->

![Image block](images/p23-figure-5-case-study-of-seed2-0-performing-the-iterative.png)

Figure 5 Case study of Seed2.0 performing the Iterative Code Debugging task on SweBenchPro [23].

图 5 Seed2.0 在 SweBenchPro [23] 上执行迭代式代码调试任务的案例.

As shown in Figure 5, the refactoring preserves runtime semantics, the public API, and downstream compatibility across four key stages: Understanding & Location, Edition & Optimization, Local Verification, and Global Verification. The goal is not redesign but stronger verification through test relocation and extension. The core constraint is strict behavioral equivalence, identical behavior to the original, with the same effects on all non-Qt and non-matching logs.

如 Figure 5 所示, 这次重构在四个关键阶段中保持了运行时语义, 公共 API 和下游兼容: 理解与定位, 编辑与优化, 本地验证, 全局验证. 目标不是重新设计, 而是通过迁移并扩展测试来加强验证. 核心约束是严格的行为等价: 与原实现行为完全一致, 对所有非 Qt 和不匹配的日志效果相同.

More specifically, during Edition & Optimization, correctness is validated at the handler boundary. Non-matching warnings continue to appear in the console and captured logs, while matching warnings are fully suppressed before reaching handlers. Suppression follows the original semantics: a message is hidden if it equals the filter string or begins with the configured pattern; otherwise, it prints normally. The filtering mechanism, including hide\_qt\_warning and QtWarningFilter, is migrated to qtlog.py, with tests moved to test\_qtlog.py. For backward compatibility, log.py retains an import layer so existing call sites remain intact, consolidating qtlog.py as the single source of truth.

更具体地说, 在编辑与优化阶段, 正确性在 handler 边界上验证. 不匹配的警告仍然出现在控制台和捕获的日志里, 匹配的警告则在到达 handler 之前被完全屏蔽. 屏蔽遵循原有语义: 消息等于过滤字符串或以配置的模式开头就隐藏, 否则正常打印. 过滤机制(包括 hide\_qt\_warning 和 QtWarningFilter)迁到 qtlog.py, 测试移到 test\_qtlog.py. 为了向后兼容, log.py 保留一个导入层, 现有调用点不受影响, qtlog.py 成为唯一的事实源.

Validation proceeds through five phases: boundary scanning, migration with compatibility wiring, unit

验证分五个阶段进行: 边界扫描, 带兼容接线的迁移, 单元

<!-- page 24 of 78 -->

```txt
Task Overview
... I've uploaded a python code repository in the directory /testbed. Consider the following issue description:
<issue_description>
* GDrive: use lates PyDrive2 version to fix large file uploads (#3592) @shcheklein
* CLI: redirect warnings to logger (#3591) @shcheklein
* push/pull/status/metrics: add support for `--all-commits` (#3587) @efiop ...
</issue_description>
Can you help me implement the necessary changes to the repository so that the requirements specified in the <issue_description> are met? ...
Your task is to make the minimal changes to non-test files in the /testbed directory to ensure the <issue_description> is satisfied.
Follow these phases to resolve the issue:
Phase 1. READING: read the problem and reword it in clearer terms...
Phase 2. RUNNING: install and run the tests on the repository...
Phase 8. FINAL REVIEW: Carefully re-read the problem description and compare your changes with the base commit a338fad036bd9ac8bdd79ecec964f8c5558609c4...
```

##### Assistant:

助手:

```ini
[Stage 1: Environment Exploration]
execute_bash(command="ls -la /testbed") ...
str_replace_editor(command="view", path="/testbed/setup.py")...

[Stage 2: Solving Issue #3581 (~6 rounds)]
str_replace_editor(command="str_replace", path="/testbed/dvc/system.py", old_str ="
if platform.system() == "Windows" and sys.version_info < (3, 8):
    try:
        import speedcopy
        speedcopy.patch_copyfile()
    except ImportError:
        pass
", new_str="
if platform.system() == "Windows" and sys.version_info < (3, 8):
    import sys
    winver = sys.getwindowsversion()
    if winver.major > 6 or (winver.major == 6 and winver.minor >= 1):
        try:
            import speedcopy
            speedcopy.patch_copyfile()
        except ImportError:
            pass
")...
str_replace_editor(command="str_replace", path=".../dvc/system.py", old_str ="...", new_str="...")...
execute_bash(command="grep -r \"warnings\" /testbed/dvc --include=\"*.py\" | grep -E ...")...
str_replace_editor(command="str_replace", path=".../setup.py", old_str ="...", new_str="...")...

[Stage 3: Solving Issue #3591 (5 rounds)]
execute_bash(command="mkdir -p /openhands/workspace/tests") ...
str_replace_editor(command="view", path=" /testbed/dvc/main.py") ...
str_replace_editor(command="str_replace", path=".../dvc/main.py", old_str ="...", new_str="...")...
str_replace_editor(command="str_replace", path=".../dvc/main.py", old_str ="...", new_str="...")...

[Stage 4: Solving Issue #3587 (50+ rounds)]
# Add the --all-commits parameter to push/pull/fetch
str_replace_editor(command="str_replace", path=".../ dvc/command/data_sync.py" ...) ...
str_replace_editor(command="str_replace", path=".../dvc/command/status.py" ...) ...
str_replace_editor(command="str_replace", path=".../dvc/command/ metrics.py" ...) ...
# Backend implementation
```

<!-- page 25 of 78 -->

![Image block](images/p25-figure-6-the-case-of-seed2-0-with-complex-iterative.png)

Figure 6 The case of Seed2.0 with Complex Iterative Debugging Task on SWE-EVO.

图 6 Seed2.0 在 SWE-EVO 复杂迭代调试任务上的案例.

regression testing, integration verification, and final cleanup. Results show 56 passing unit tests, verified import compatibility, accurate handler outputs, and complete reference coverage. A logger-parameter issue found during testing is fixed and revalidated, ensuring precise behavioral equivalence. The refactoring delivers comprehensive test coverage and production-level maintainability.

回归测试, 集成验证和最终清理. 结果显示 56 个单元测试通过, 导入兼容性得到验证, handler 输出准确, 引用覆盖完整. 测试中发现的一个 logger 参数问题被修复并重新验证, 保证了精确的行为等价. 这次重构带来了全面的测试覆盖和生产级的可维护性.

#### 5.1.4 Complex Iterative Debugging

5.1.4 复杂迭代调试

In this Release-Note-only SWE-EVO upgrade case, the agent's objective shifts from resolving a single, well-scoped issue (as in SWE-bench) to upgrading a library across versions using only release notes as guidance. With no explicit file-level directives, the model has to infer which components encoded the promised behavioral changes and treat the full unit test suite as the acceptance oracle, including both historically passing and historically failing tests. As shown in Figure 6, across 79 turns, the workflow converges on an exploration→implementation→verification loop: it first maps the repository and dependency surface (via directory inspection and setup.py) and identifies the codebase as DVC, then iteratively implements cross-cutting upgrades spanning OS compatibility, logging semantics, CLI/API consistency, concurrency safety, and user-facing output correctness.

在这个只给 release notes 的 SWE-EVO 升级案例里, agent 的目标从解决单个范围明确的 issue(如 SWE-bench), 变成仅以 release notes 为指引, 把一个库跨版本升级. 没有明确的文件级指令, 模型必须推断哪些组件承载了承诺的行为变化, 并把完整的单元测试套件当作验收判据, 其中既有历史上通过的测试, 也有历史上失败的测试. 如 Figure 6 所示, 在 79 轮中, 工作流收敛到 探索→实现→验证 的循环: 先通过目录检查和 setup.py 摸清仓库和依赖面, 识别出代码库是 DVC, 然后迭代实现一系列横切升级, 涉及操作系统兼容, 日志语义, CLI/API 一致性, 并发安全和面向用户输出的正确性.

The most involved change is the end-to-end introduction of an -all-commits flag across push, pull, status, and metrics, because it requires more than CLI plumbing: the agent has to thread a single semantic intent from command entry points through repository operations and into revision traversal, ultimately extending the branch iteration mechanism (brancher.py) and ensuring repository initialization invokes the updated traversal path (init.py).

最复杂的改动是端到端地给 push, pull, status 和 metrics 引入 -all-commits 参数, 因为这不只是 CLI 管道活: agent 要把同一个语义意图从命令入口一路穿过仓库操作, 传到修订遍历, 最终扩展分支迭代机制(brancher.py), 并确保仓库初始化调用更新后的遍历路径(init.py).

<!-- page 26 of 78 -->

![Image block](images/p26-figure-7-the-competitive-programming-results-across.png)

Figure 7 The competitive programming results across five ICPC.

图 7 五场 ICPC 上的竞赛编程结果.

In parallel, it handles platform constraints by gating speedcopy imports using sys.getwindowsversion() (a robust choice over fragile string parsing) and refines progress reporting by switching tqdm-related locking to threading.RLock() to mitigate re-entrancy and multi-thread contention. It also improves UX fidelity by suppressing the "No changes" message in metrics diff when suppression is requested, demonstrating attention to behavioral edge cases that tests commonly encode. Notably, the PyDrive2 large-file upload item is resolved as a dependency conformance check, pydrive2>=1.4.8 is already declared, so the agent avoids unnecessary code churn, aligning with a minimal-change upgrade strategy. Verification proceeds through repeated targeted test runs and final holistic validation, including checking CLI help output to ensure argument exposure matched the intended interface design.

与此同时, 它用 sys.getwindowsversion() 给 speedcopy 导入加门控来处理平台约束(比脆弱的字符串解析更稳妥), 并把 tqdm 相关的锁换成 threading.RLock(), 以缓解重入和多线程争用, 改进进度报告. 它还在请求静默时屏蔽 metrics diff 中的 「No changes」 消息, 提升用户体验的保真度, 说明它关注测试常会覆盖的行为边界. 值得一提的是, PyDrive2 大文件上传这一条被当作依赖一致性检查处理: pydrive2>=1.4.8 已经声明, 所以 agent 没有做不必要的代码改动, 符合最小改动的升级策略. 验证通过反复的定向测试运行和最后的整体验证完成, 其中包括检查 CLI 帮助输出, 确保参数暴露与预期接口设计一致.

#### 5.1.5 Competition-Level Programming

5.1.5 竞赛级编程

To evaluate capabilities on competition-level programming, we assess model performance across five recent ICPC Official contests in late 2025. These five contests include the ICPC 2025 World Finals Baku (Sept 4, 2025), the ICPC 2025 Xi'an Regional Contest (Oct 19, 2025), the ICPC 2025 Chengdu Regional Contest (Oct 26, 2025), the ICPC 2025 Wuhan Regional Contest (Nov 2, 2025), and the ICPC 2025 Shanghai Regional Contest (Nov 23, 2025). We utilize test cases, time limits, and memory limits consistent with the official competitions. We compare the Pass@8 score for each model, which represents the percentage of problems solved when allowing each model up to eight independent generations per problem. The input prompt for the models contains only the problem statement and a simple instruction requiring the solution in C++, without the use of multi-turn interaction or external tool calls.

为评测竞赛级编程能力, 我们在 2025 年末的五场 ICPC 官方比赛上评估模型表现. 这五场是 ICPC 2025 世界总决赛巴库站(2025 年 9 月 4 日), ICPC 2025 西安区域赛(2025 年 10 月 19 日), ICPC 2025 成都区域赛(2025 年 10 月 26 日), ICPC 2025 武汉区域赛(2025 年 11 月 2 日)和 ICPC 2025 上海区域赛(2025 年 11 月 23 日). 我们使用与官方比赛一致的测试数据, 时间限制和内存限制. 我们比较各模型的 Pass@8 分数, 即每题允许最多八次独立生成时解出题目的百分比. 模型的输入提示只包含题面和一条要求用 C++ 作答的简单指令, 不使用多轮交互或外部工具调用.

The results are shown in Figure 7. Seed2.0 Pro achieves a Pass@8 score of $73.02\%$, significantly outperforming GPT-5.2 and Gemini-3-Pro. Compared against human team performance, Seed2.0 Pro achieves Gold Medals in all five contests.

结果见 Figure 7. Seed2.0 Pro 的 Pass@8 为 $73.02\%$, 显著超过 GPT-5.2 和 Gemini-3-Pro. 与人类队伍成绩相比, Seed2.0 Pro 在全部五场比赛中都达到金牌.

> **回看:** Figure 7 的「五场全金」和人类队伍是同条件吗?
> 不是. Pass@8 等于每题 8 次独立提交, 只要有一次通过官方数据就算解出, 模型拿不到判题反馈, 也不承担罚时; 人类队伍可以根据 WA/TLE 反馈修改, 但每次错误提交都计罚时, 且整场只有 5 小时和一台电脑. 金牌线是按人类的解题数和罚时排出来的, 把 Pass@8 的解题比例折算成奖牌, 相当于把 8 份采样预算的 TestingTime 投入换成了排名. 原文也没给 Pass@1, 看不出单次提交能否达到同样档位.

### 5.2 Real-world Application Operation

5.2 真实应用操作

In productivity software, GUI interactions are state-dependent: toolchains vary with workspace or mode changes; parameters interlink across editing rounds; and interaction details (e.g., dialog prompts, focus management, double-clicking, drag-to-align) can trigger cascading failures. To examine whether Seed2.0 exhibits semantic understanding and long-horizon execution for complex interfaces, we evaluate it in two settings: (i) FreeCAD, a CAD environment emphasizing modeling context and constraint logic, and (ii) CapCut, a video-editing environment emphasizing timeline alignment and multi-track editing. These case studies illustrate how the model executes multi-step procedures while tracking interface state and self-corrects when UI errors arise.

在生产力软件中, GUI 交互依赖状态: 工具链随工作区或模式切换而变化; 参数在多轮编辑之间互相关联; 交互细节(如对话框提示, 焦点管理, 双击, 拖动对齐)可能引发连锁失败. 为考察 Seed2.0 是否具备对复杂界面的语义理解和长时程执行能力, 我们在两个设置中评测它: (i) FreeCAD, 一个强调建模上下文和约束逻辑的 CAD 环境; (ii) CapCut, 一个强调时间线对齐和多轨编辑的视频剪辑环境. 这些案例说明模型如何在跟踪界面状态的同时执行多步流程, 并在出现 UI 错误时自我纠正.

#### 5.2.1 FreeCAD Operation

5.2.1 FreeCAD 操作

As shown in Figure 8, we evaluate whether Seed2.0 can perform semantic GUI understanding in a stateful CAD environment beyond template-based interactions. The model successfully tracks contextual information, including active workbenches, bodies, operational modes, and attachment planes. When encountering errors

如 Figure 8 所示, 我们评测 Seed2.0 能否在有状态的 CAD 环境中做语义级 GUI 理解, 而不只是套模板交互. 模型成功跟踪了上下文信息, 包括当前工作台, 实体(body), 操作模式和附着平面. 遇到

<!-- page 27 of 78 -->

##### Task Overview

任务概述

Scenario: You are working in FreeCAD 1.0.2, using the Part Design workbench to create a parametric solid. After completing the modeling, you need to read the solid's volume and area from the FreeCAD ...

场景: 你在 FreeCAD 1.0.2 中使用 Part Design 工作台创建一个参数化实体. 建模完成后, 需要从 FreeCAD 读出该实体的体积和表面积 ...

Task Objective: First, create a circular sketch with a diameter of 80mm and extrude it by 40mm to create a boss. Then, create a rectangular sketch with a length of 50mm and a width of 30mm on the top surface of this boss and extrude it by 20mm to create a secondary boss. Read the final solid's volume and surface area values.

任务目标: 先创建一个直径 80mm 的圆形草图, 拉伸 40mm 形成凸台. 然后在凸台顶面上创建一个长 50mm, 宽 30mm 的矩形草图, 拉伸 20mm 形成第二个凸台. 读出最终实体的体积和表面积数值.

##### Assistant:

助手:

##### [Stage 1: Initial Start]

[阶段 1: 初始启动]

&lt;think&gt;Now we're on FreeCAD's start page. In the project tile area at the top left of the start page, click the New File icon. The "Parametric Part" tile is the New File icon for a parametric part—click it to create a new parametric solid model project.

&lt;think&gt;现在我们在 FreeCAD 的起始页. 在起始页左上方的项目卡片区域点击新建文件图标. 「Parametric Part」 卡片就是参数化零件的新建文件图标, 点击它创建一个新的参数化实体建模项目.

![Image block](images/p27-image.png)

![Image block](images/p27-stage-2-self-reflection-to-correct-mis-operation.png)

[Stage 2: Self-Reflection to Correct Mis-Operation]

[阶段 2: 自我反思, 纠正误操作]

The "Select attachment" dialog has popped up. According to the operating procedure, I need to choose the XY-Plane (reference plane). In the list, find "XY-Plane001 (Reference plane)", click to select it, then click OK to enter Sketcher.

「Select attachment」 对话框弹出了. 按操作流程, 我需要选择 XY-Plane(基准平面). 在列表中找到 「XY-Plane001 (Reference plane)」, 点击选中, 再点 OK 进入 Sketcher.

The OK button didn't respond just now. This may be because the click wasn't accurate enough, or the system was slow to respond. Look carefully for the OK button: it's the green checkmark icon with the text "OK" next to it. Click this button accurately again to enter the sketch editing interface.

刚才 OK 按钮没有响应. 可能是点击不够准, 也可能是系统响应慢. 仔细找 OK 按钮: 它是绿色对勾图标, 旁边写着 「OK」. 再准确点击一次这个按钮, 进入草图编辑界面.

![Image block](images/p27-image-2.png)

![Image block](images/p27-we-accidentally-clicked-the-pocket-tool-and-an-error.png)

We accidentally clicked the Pocket tool and an error dialog popped up. We need to close this dialog first by clicking OK, then return to the correct step and locate the tool for creating a circle. First, handle the error prompt by clicking the

我们误点了 Pocket 工具, 弹出了错误对话框. 需要先点 OK 关掉这个对话框, 再回到正确的步骤, 找到画圆的工具. 先处理错误提示, 点击

OK button in the dialog box.

对话框中的 OK 按钮.

The Sketcher menu is now expanded. We need to find the "Circle" option under "Sketcher geometries." Move the mouse to the "Sketcher geometries" submenu, expand it, then find and click the "Circle" tool to start drawing a circle sketch. This helps us select the correct circle tool and avoid clicking the wrong icon again.

Sketcher 菜单已经展开. 我们要在 「Sketcher geometries」 下找到 「Circle」 选项. 把鼠标移到 「Sketcher geometries」 子菜单上展开, 再找到并点击 「Circle」 工具开始画圆形草图. 这样能选中正确的画圆工具, 避免再次点错图标.

![Image block](images/p27-image-3.png)

![Image block](images/p27-we-have-selected-the-circle-by-center-tool-next-we-need.png)

We have selected the "Circle by center" tool. Next, We need to place the circle's center at the origin on the canvas (the intersection of the two axes). Click that intersection to set the center, then click another point to define the circle's edge and

我们已经选中了 「Circle by center」 工具. 接下来要把圆心放在画布原点(两条坐标轴的交点). 点击该交点设定圆心, 再点击另一处确定圆的边缘

draw the circle. First, ...

画出这个圆. 首先, ...

The "Insert diameter" dialog has popped up. Change the diameter value to 80 mm. First select the existing value in the input box, then type 80 to replace the original 47.47 (this correctly updates the value).

「Insert diameter」 对话框弹出了. 把直径改成 80 mm. 先选中输入框里现有的值, 再输入 80 替换原来的 47.47(这样才能正确更新数值).

![Image block](images/p27-stage-3-correct-operation.png)

[Stage 3: Correct Operation]

[阶段 3: 正确操作]

<!-- page 28 of 78 -->

We're back in the correct interface and need to find the Pad tool again. On the top toolbar in the Part Design workbench, the Pad icon looks like an upward extrusion; it should be the button labeled "Pad," or we can locate it via the menu for better accuracy. Click "Part Design" on the top menu bar, then find and click "Pad" to avoid selecting the wrong icon.

我们回到了正确的界面, 需要重新找到 Pad 工具. 在 Part Design 工作台的顶部工具栏上, Pad 图标像一个向上拉伸的形状, 应该是标着 「Pad」 的按钮; 也可以通过菜单定位, 更准确. 点击顶部菜单栏的 「Part Design」, 再找到并点击 「Pad」, 避免选错图标.

![Image block](images/p28-figure-8-the-case-of-seed2-0-with-freecad-operation-task.png)

Figure 8 The case of Seed2.0 with FreeCAD Operation Task.

图 8 Seed2.0 在 FreeCAD 操作任务上的案例.

such as incorrect tool selection or unresponsive dialogs, the model demonstrates expert-like recovery by formulating micro-plans (e.g., "create circle, constrain diameter, exit sketch") and executing them. The model's self-reflection mechanism functions as an online control loop under noisy UI feedback. Rather than simply documenting errors, the model diagnoses failure modes (misclicks, mode errors, or UI lag), applies targeted corrective actions (dismissing dialogs, reselecting tools, or reconfirming constraints), and resumes the parametric workflow. This behavior suggests a generalizable framework for robust GUI agents: maintain system invariants, restore operational context, and proceed with the intended task.

选错工具或对话框无响应这类错误时, 模型表现出专家式的恢复: 先拟定微计划(如 「画圆, 约束直径, 退出草图」), 再执行. 模型的自我反思机制在嘈杂的 UI 反馈下起到在线控制回路的作用. 它不是简单记录错误, 而是诊断失败模式(误点, 模式错误或 UI 延迟), 采取针对性纠正动作(关闭对话框, 重新选工具或重新确认约束), 然后继续参数化建模流程. 这种行为提示了一个可推广的稳健 GUI agent 框架: 维护系统不变量, 恢复操作上下文, 再推进预定任务.

Based on this, correctness is anchored by redundant verification rather than “looks right.” The model validates the final solid via both the Properties panel (Data → Shape → Volume/Area) and an independent Python readout (obj.Shape.Volume, obj.Shape.Area), turning a GUI procedure into a checkable outcome and reducing common silent failures like wrong selection or wrong document state.

在此基础上, 正确性靠冗余验证来保证, 而不是 「看起来对」. 模型通过属性面板(Data → Shape → Volume/Area)和一次独立的 Python 读数(obj.Shape.Volume, obj.Shape.Area)双重验证最终实体, 把一个 GUI 流程变成可检查的结果, 减少选错对象或文档状态不对这类常见的静默失败.

#### 5.2.2 CapCut Operation

5.2.2 CapCut 操作

Further, we demonstrate Seed2.0's capabilities on operational CapCut tasks. As shown in Figure 9, we present a case where Seed2.0 functions as an execution-oriented editor, tasked with producing a frame-accurate CapCut (Jianying Pro) project. The system maintains coherent goal states across multiple operations, video splitting, transition placement, audio splicing, and global effects application, while employing reflective self-correction to recover from UI-level errors. These errors include missed double-clicks, incorrect effect selection, and misaligned audio placement.

我们进一步展示 Seed2.0 在 CapCut 操作任务上的能力. 如 Figure 9 所示, 在这个案例中 Seed2.0 扮演以执行为导向的剪辑师, 任务是做出一个帧级精确的 CapCut(剪映专业版)工程. 系统在视频切分, 转场放置, 音频拼接和全局特效应用等多个操作中保持一致的目标状态, 并用反思式自我纠正从 UI 层面的错误中恢复. 这些错误包括双击没生效, 选错特效和音频放错位置.

The trace reveals Seed2.0's core strength: adaptive control under partial failure. Upon detecting actions that fail to yield the intended UI state, the system re-identifies the correct control sequence. For instance, it re-targets the "Audio" panel, closes obstructive pop-ups, or switches from "click add" to "drag-to-join" for

轨迹显示出 Seed2.0 的核心优势: 部分失败下的自适应控制. 一旦发现动作没有带来预期的 UI 状态, 系统会重新确定正确的控制序列. 例如, 它会重新定位 「Audio」 面板, 关掉挡路的弹窗, 或者对

<!-- page 29 of 78 -->

##### Task Overview

任务概述

Please help me create a video using CapCut. The source materials are the video file \`1.mp4\` and the audio file \`21.mp3\`, both located on my desktop. Strictly follow the timing parameters provided below. The specific requirements are as follows:

请帮我用 CapCut 制作一个视频. 素材是视频文件 \`1.mp4\` 和音频文件 \`21.mp3\`, 都在我的桌面上. 严格按照下面给出的时间参数执行. 具体要求如下:

Step 1: Create a new project

第 1 步: 新建工程

◆ Import the files '1.mp4'.

◆ 导入文件 '1.mp4'.

Step 2: Video Editing

第 2 步: 视频剪辑

◆ Set the first video split point at '00:00:01:24'.

◆ 在 '00:00:01:24' 设置第一个视频切分点.

◆ Set the second video split point at '00:00:03:28'. to these timestamps...

◆ 在 '00:00:03:28' 设置第二个视频切分点. 按这些时间戳...

##### Assistant:

助手:

##### [Stage 1: Initial Start]

[阶段 1: 初始启动]

Think: The editing task requires launching CapCut (Professional Edition) as a prerequisite. Since the desktop contains a CapCut Professional icon, the first step is to initiate the application by double-clicking this icon...
Action: left\_double[0.025,0.268]

思考: 剪辑任务的前提是启动 CapCut(专业版). 桌面上有 CapCut 专业版图标, 所以第一步是双击这个图标启动应用...
动作: left\_double[0.025,0.268]

![Image block](images/p29-image.png)

![Image block](images/p29-think-capcut-did-not-appear-to-start-successfully-which.png)

Think: CapCut did not appear to start successfully, which may indicate that the prior double-click was not registered accurately or that the startup latency is longer than expected... (Failure of left-button double-click; reflective retry)
Action: left\_double[0.025,0.268]

思考: CapCut 似乎没有启动成功, 可能是上一次双击没有被准确识别, 也可能是启动耗时比预期长...(左键双击失败; 反思后重试)
动作: left\_double[0.025,0.268]

##### [Stage 2: Editing & Operation]

[阶段 2: 剪辑与操作]

Think: The CapCut interface has now loaded, and the "Start Creating" button is visible. Clicking this button enters the editing project workspace, which is required before importing assets...

思考: CapCut 界面已经加载, 「Start Creating」 按钮可见. 点击它进入剪辑工程工作区, 这是导入素材之前必须的一步...

Action: click[0.577,0.166]

动作: click[0.577,0.166]

![Image block](images/p29-image-2.png)

![Image block](images/p29-think-a-yellow-notification-prompt-is-present-first.png)

Think: A yellow notification prompt is present. First, click "Got it" to dismiss the prompt. Next, click the "Import" control in the media panel (the blue plus sign) to open the file selection

思考: 界面上有一个黄色通知提示. 先点 「Got it」 关掉提示. 再点媒体面板里的 「Import」 控件(蓝色加号)打开文件选择

dialog and import 1.mp4...
Action: click[0.142,0.100]

对话框, 导入 1.mp4...
动作: click[0.142,0.100]

Think: The asset 1.mp4 is now visible in the media panel. Click the "+" button at the lower-right corner of the video thumbnail to add the clip to the timeline. The "+" icon should be located at the bottom-right of the 1.mp4 thumbnail...
Action: click[0.157,0.260]

思考: 素材 1.mp4 已出现在媒体面板中. 点击视频缩略图右下角的 「+」 按钮, 把片段加到时间线上. 「+」 图标应该在 1.mp4 缩略图的右下方...
动作: click[0.157,0.260]

![Image block](images/p29-image-3.png)

![Image block](images/p29-think-the-playhead-was-positioned-inaccurately-it-must.png)

Think: The playhead was positioned inaccurately; it must be set precisely to 00:00:01:24. First, address any pop-up by clicking "Got it" to close the prompt, and then readjust the playhead location.

思考: 播放头定位不准, 必须精确设在 00:00:01:24. 先点 「Got it」 关掉弹窗, 再重新调整播放头位置.

Action: click[0.973,0.507]

动作: click[0.973,0.507]

Think: The transition panel has finished loading. In the left-side category list, there is a "Dissolve" category. Click "Dissolve" to filter dissolve-related transitions, then locate the dissolve...

思考: 转场面板已加载完成. 左侧分类列表里有 「Dissolve」 类别. 点击 「Dissolve」 筛选溶解类转场, 然后找到溶解...

![Image block](images/p29-29.png)

<!-- page 30 of 78 -->

![Image block](images/p30-think-the-previous-attempt-selected-the-dissolve-effect.png)

Think: The previous attempt selected the "Dissolve" effect itself rather than its plus icon, resulting in the effect being highlighted but not applied to the track...  
Action: drag[0.366,0.220]

思考: 上一次选中的是 「Dissolve」 特效本身, 而不是它的加号图标, 结果特效被高亮但没有应用到轨道上...
动作: drag[0.366,0.220]

Think: Clicking "Audio" produced no response, which may be attributable to incomplete UI loading or inaccurate click targeting...
Action click[0.050.0065]

思考: 点击 「Audio」 没有响应, 可能是 UI 没加载完, 也可能是点击目标不准...
动作 click[0.050.0065]

![Image block](images/p30-stage-3-self-reflection-to-correct-mis-operation.png)

[Stage 3: Self-Reflection to Correct Mis-Operation]

[阶段 3: 自我反思, 纠正误操作]

![Image block](images/p30-think-a-key-issue-is-observed-the-audio-track-begins-at.png)

Think: A key issue is observed: the audio track begins at approximately 00:00:03:00 rather than 00:00:00. Consequently, when the playhead is at 00:00:05:00, ... At this stage, the playhead should be dragged to the far-left of the timeline (00:00:00) to...

思考: 发现一个关键问题: 音频轨道从大约 00:00:03:00 开始, 而不是 00:00:00. 因此当播放头在 00:00:05:00 时, ... 这时应把播放头拖到时间线最左端(00:00:00), 以便...

Action: drag[0.289 0.588]

动作: drag[0.289 0.588]

Think: After the prior drag, the start position of the latter audio segment remains incorrect and requires further adjustment. Move the playhead to 00:00:02:29, then ...
Action: drag[0.208,0.843]

思考: 上一次拖动之后, 后一段音频的起始位置仍然不对, 需要再调. 把播放头移到 00:00:02:29, 然后 ...
动作: drag[0.208,0.843]

![Image block](images/p30-stage-4-failed-local-fixes-and-refinement.png)

##### [Stage 4: Failed Local Fixes and Refinement]

[阶段 4: 局部修复失败与改进]

![Image block](images/p30-think-the-snowflake-sparkle-effect-clip-is-currently.png)

Think: The "Snowflake Sparkle" effect clip is currently selected. Drag the right endpoint of this effect segment to 00:00:08:26 so that the effect covers the full duration of the video... The next step is to extend the right endpoint of the "Snowflake Sparkle" effect on the effects track to 00:00:08:26...
Action: drag[0.219,0.671]

思考: 当前选中的是 「Snowflake Sparkle」 特效片段. 把这个特效片段的右端点拖到 00:00:08:26, 让特效覆盖视频全长... 下一步是把特效轨上 「Snowflake Sparkle」 特效的右端点延长到 00:00:08:26.
动作: drag[0.219,0.671]

![Image block](images/p30-figure-9-the-case-of-seed2-0-with-capcut-operation-task.png)

Figure 9 The case of Seed2.0 with CapCut Operation Task.

图 9 Seed2.0 在 CapCut 操作任务上的案例.

dissolve transitions. Crucially, the system re-anchors the workflow to canonical timeline invariants, project starts at 00:00:00:00 and splice boundary at 00:00:02:29, before proceeding. This re-anchoring mechanism prevents error propagation in multi-stage editing workflows.

溶解转场从 「点击添加」 改为 「拖动加入」. 关键在于, 系统在继续之前会把工作流重新锚定到规范的时间线不变量上: 工程从 00:00:00:00 开始, 拼接边界在 00:00:02:29. 这种重新锚定机制防止了多阶段剪辑流程中的错误传播.

The specification's HH:MM:SS:FR timecodes are meaningful only under a consistent project frame rate. Therefore, Seed2.0's emphasis on precise alignment and playhead repositioning serves as a critical control mechanism that guards against silent drift at split and splice boundaries. Within this frame-accurate regime, the system applies the requested "Dissolve" transitions by locating them in CapCut's transitions library and placing them at each clip junction created by the three splits. Similarly, the system extends a snow-style atmospheric overlay to cover the full 00:00:00:00–00:00:08:26 program window by applying an effect clip on the timeline and adjusting its duration to match the target interval.

规格中的 HH:MM:SS:FR 时间码只有在工程帧率一致时才有意义. 因此, Seed2.0 对精确对齐和重新定位播放头的重视, 是一种关键的控制机制, 可以防止切分和拼接边界上的静默漂移. 在这种帧级精确的状态下, 系统在 CapCut 转场库中找到要求的 「Dissolve」 转场, 放到三次切分产生的每个片段接缝处. 类似地, 系统在时间线上加一个特效片段并把时长调到目标区间, 让一个雪景氛围叠加层覆盖 00:00:00:00–00:00:08:26 的完整节目时段.

<!-- page 31 of 78 -->

##### Task Overview

任务概述

Input: Recreate this website and add the following features: number rolling count animation, XP bar animation, 3D tilt effect + highlight sweep animation for Mission cards, and dynamic shimmer texture for progress bars.

输入: 重新创建这个网站, 并添加以下功能: 数字滚动计数动画, 经验值(XP)进度条动画, 任务卡片的 3D 倾斜效果 + 高光扫掠动画, 以及进度条的动态闪烁纹理.

输入: 重新创建这个网站，并添加以下功能:数字滚动计数动画、经验值（XP）进度条动画、任务卡片的3D倾斜效果 + 高光扫掠动画，以及进度条的动态闪烁纹理。

![Image block](images/p31-figure-10-the-case-of-seed2-0-with-image-to-code.png)

Figure 10 The case of Seed2.0 with Image to code website HTML generation task.

图 10 Seed2.0 在图像转代码(网站 HTML 生成)任务上的案例.

#### 5.2.3 Image-to-Code Generation

5.2.3 图像转代码生成

Here are two examples of code generation in real-world application scenario. As shown in Figure 10, the task is to recreate a website according to the given image. Some features are clearly required in the query prompt, including number rolling count animation, XP bar animation, 3D tilt effect + highlight sweep animation for Mission cards, and dynamic shimmer texture for progress bars. By saving the prediction code part as an HTML file and opening it directly in any browser, we could get a website almost the same as the input with all required features. As shown in Figure 11, the task is to recreate a 3D plot as a matplotlib expert, in which x-y projection, x-z projection, and y-z projection relationships are provided. By compiling the generated Python code, we could get a 3D phase space which follows the projection as input.

下面是真实应用场景中代码生成的两个例子. 如 Figure 10 所示, 任务是按给定图片重建一个网站. 查询提示中明确要求了若干功能, 包括数字滚动计数动画, XP 进度条动画, 任务卡片的 3D 倾斜效果 + 高光扫掠动画, 以及进度条的动态闪烁纹理. 把预测的代码部分存成 HTML 文件, 直接在任意浏览器中打开, 就能得到一个与输入几乎一样, 且具备所有要求功能的网站. 如 Figure 11 所示, 任务是以 matplotlib 专家的身份重建一张 3D 图, 输入给出了 x-y, x-z 和 y-z 三个投影关系. 运行生成的 Python 代码, 可以得到一个符合输入投影的 3D 相空间图.

<!-- page 32 of 78 -->

##### Task Overview

任务概述

Input: You are a helpful assistant that can generate Python code using matplotlib. Generate the matplotlib code to create a plot that looks like the given image, as similar as possible. The generated code should be surrounded by \`\`python and \`\`'.

输入: 你是一个能用 matplotlib 生成 Python 代码的得力助手. 请生成 matplotlib 代码, 画出与给定图像尽可能相似的图. 生成的代码应放在 \`\`python 和 \`\`' 之间.

输入:你是一个能够使用 matplotlib 生成 Python 代码的智能助手。请输出一段 matplotlib 代码，绘制出与给定图像尽可能一致的图表，并将代码放在代码块中。

![Image block](images/p32-figure-11-the-case-of-seed2-0-with-image-to-code-3d.png)

Figure 11 The case of Seed2.0 with Image to code 3D distribution generation task.

图 11 Seed2.0 在图像转代码(3D 分布图生成)任务上的案例.

### 5.3 Multidisciplinary Scientific Research

5.3 多学科科学研究

To comprehensively examine Seed2.0's utility in cross-disciplinary scientific research, we evaluate its capacity to facilitate scientific discovery through two complementary task scenarios: code generation across scientific domains and cross-domain analytical reasoning.

为全面考察 Seed2.0 在跨学科科学研究中的作用, 我们通过两类互补的任务场景评估它促进科学发现的能力: 跨科学领域的代码生成, 以及跨领域的分析推理.

<!-- page 33 of 78 -->

#### Task Overview

任务概述

Quantum computation represents programs as unitary transformations acting on quantum states. In practice, arbitrary unitaries must be compiled into sequences of hardware-supported gates. Qiskit implements this compilation pipeline by combining quantum physics, numerical methods, and group-theoretic representations.

量子计算把程序表示为作用在量子态上的酉变换. 实践中, 任意酉矩阵必须编译成硬件支持的门序列. Qiskit 结合量子物理, 数值方法和群论表示实现了这条编译流水线.

A core component of this pipeline is the Solovay–Kitaev (SK) algorithm, which approximates arbitrary single-qubit unitaries using a finite universal gate set. Mathematically, single-qubit gates are elements of the Lie group SU(2). However, Qiskit's implementation formulates the recursive core of the SK algorithm in terms of SO(3) rotation matrices, corresponding to rotations on the Bloch sphere.

这条流水线的一个核心组件是 Solovay–Kitaev(SK)算法, 它用一个有限的通用门集合逼近任意单量子比特酉矩阵. 数学上, 单量子比特门是李群 SU(2) 的元素. 然而 Qiskit 的实现用 SO(3) 旋转矩阵(对应 Bloch 球上的旋转)来表述 SK 算法的递归核心.

![Image block](images/p33-figure-1-global-phase-ambiguity-in-qiskit-s-solovay.png)

Figure 1. Global phase ambiguity in Qiskit's Solovay-Kitaev implementation, where the $\mathrm{SU}(2)\rightarrow \mathrm{SO}(3)$ mapping can lead to a -1 phase error upon reconstruction.

图 1. Qiskit 的 Solovay-Kitaev 实现中的全局相位歧义: $\mathrm{SU}(2)\rightarrow \mathrm{SO}(3)$ 映射在重建时可能导致 -1 相位误差.

This design choice introduces a subtle but critical ambiguity: SU(2) is a double cover of SO(3). Two unitary matrices that differ only by a global phase of -1 correspond to the same SO(3) rotation. As a result, computations performed purely in SO(3) discard global phase information, which must be carefully restored when mapping results back to SU(2).

这一设计引入了一个细微但关键的歧义: SU(2) 是 SO(3) 的二重覆盖. 只差一个 -1 全局相位的两个酉矩阵对应同一个 SO(3) 旋转. 结果, 纯粹在 SO(3) 中进行的计算会丢掉全局相位信息, 把结果映射回 SU(2) 时必须小心地恢复.

In the reported issue, applying the Solovay–Kitaev pass to a simple Pauli-Y gate produced a circuit whose unitary matrix was exactly the negative of the target operator. While physically equivalent up to global phase, the circuit reported an incorrect global phase value, leading to a mismatch at the operator level and violating user expectations.

在报告的 issue 中, 对一个简单的 Pauli-Y 门应用 Solovay–Kitaev pass, 得到的电路的酉矩阵恰好是目标算符的相反数. 虽然在全局相位意义下物理等价, 电路报告的全局相位值却是错的, 导致算符层面不匹配, 违背了用户预期.

Resolving this issue requires reasoning simultaneously about:

解决这个问题需要同时推理:

the mathematical relationship between SU(2) and SO(3),

SU(2) 与 SO(3) 之间的数学关系,

the architectural design of Qiskit's SK implementation, and

Qiskit SK 实现的架构设计, 以及

the precise location where lost phase information must be reconstructed.

必须在哪个精确位置重建丢失的相位信息.

#### Assistant:

助手:

#### [Stage 1: Symptom Identification and Reproduction]

[阶段 1: 症状识别与复现]

The agent begins by reproducing the reported behavior using a minimal example: decomposing a single-qubit Pauli-Y gate with the Solovay-Kitaev pass. It observes that the resulting circuit implements an operator numerically equal to -Y, while reporting a global phase of  $\frac{3\pi}{4}$ .

agent 先用一个最小例子复现报告的行为: 用 Solovay-Kitaev pass 分解单量子比特 Pauli-Y 门. 它观察到得到的电路实现的算符在数值上等于 -Y, 同时报告的全局相位是 $\frac{3\pi}{4}$.

Crucially, the agent does not treat this as a numerical approximation error. Instead, it explicitly checks operator equality and verifies that the discrepancy is a pure sign flip, corresponding to a phase difference of  $\pi$ .

关键是, agent 没有把它当成数值逼近误差. 它显式检查算符是否相等, 确认差异是纯粹的符号翻转, 对应 $\pi$ 的相位差.

[Stage 2: Mathematical Interpretation of the Error]

[阶段 2: 对误差的数学解释]

Let's interpret the sign flip through group representation theory. We can recognize that:

我们用群表示论来解释这个符号翻转. 可以认识到:

◆ the SK recursion operates in SO(3),

◆ SK 递归在 SO(3) 中进行,

◆ the mapping from SU(2) → SO(3) is two-to-one, and

◆ 从 SU(2) → SO(3) 的映射是二对一的, 并且

Therefore the recursion cannot distinguish U from -U.

因此递归无法区分 U 和 -U.

At this stage, the error is identified as structural rather than accidental: global phase information is systematically lost during the SO(3)-based recursion and must be recovered afterward.

到这一步, 误差被认定为结构性的而非偶然的: 全局相位信息在基于 SO(3) 的递归中被系统性地丢掉, 必须事后恢复.

This reasoning step is independent of any specific code and reflects domain knowledge in quantum mechanics and Lie groups.

这一步推理不依赖任何具体代码, 体现的是量子力学和李群方面的领域知识.

#### [Stage 3: Error Localization in the Codebase]

[阶段 3: 在代码库中定位错误]

The agent then localizes the error to a specific boundary in the implementation:

然后 agent 把错误定位到实现中的一个特定边界:

◆ the recursive SK algorithm itself is mathematically correct,

◆ 递归的 SK 算法本身在数学上是正确的,

◆ the loss occurs at the interface between the SO(3) recursion and the final SU(2) circuit construction.

◆ 丢失发生在 SO(3) 递归与最终 SU(2) 电路构建之间的接口处.

Concretely, the agent identifies the output phase assignment logic in Qiskit's solovay\_kitaev.py

具体地, agent 找到了 Qiskit 的 solovay\_kitaev.py 中的输出相位赋值逻辑

<!-- page 34 of 78 -->

![Image block](images/p34-figure-12-the-case-of-seed2-0-with-quantum-computing.png)

Figure 12 The case of Seed2.0 with Quantum Computing Task on AInsteinBench [27].

图 12 Seed2.0 在 AInsteinBench [27] 量子计算任务上的案例.

#### 5.3.1 Multidisciplinary Scientific Research Coding

5.3.1 多学科科学研究编程

In real-world development of multidisciplinary scientific software, problems typically involve coupling among mathematical representations, physical conventions, and large-scale codebases, leading to subtle yet high-cost errors. Seed2.0 demonstrates robust generalization and debugging capabilities on such cross-domain tasks by identifying structural causes of anomalous behavior and producing verifiable fixes through dependency tracing and execution context analysis. The following sections present representative case studies from quantum computing, numerical general relativity, and computational chemistry.

在真实的多学科科学软件开发中, 问题通常牵涉数学表示, 物理约定和大规模代码库之间的耦合, 由此产生细微但代价高昂的错误. Seed2.0 在这类跨领域任务上展现出稳健的泛化和调试能力: 它能找出异常行为的结构性原因, 并通过依赖追踪和执行上下文分析给出可验证的修复. 下面给出来自量子计算, 数值广义相对论和计算化学的代表性案例.

Quantum Computing. On specialized and emerging tasks, Seed2.0 demonstrates remarkable generalization capabilities. In the quantum software engineering track of AInstein Bench [27], Seed2.0 successfully resolves a subtle bug in Qiskit's Solovay–Kitaev (SK) compiler stemming from a representation mismatch. The bug arises because Qiskit performs SK recursion in SO(3) (Bloch-sphere rotations), whereas target single-qubit gates belong to SU(2). Because SU(2) double-covers SO(3), the recursion cannot distinguish U from -U, so global phase information can be dropped and must be restored when mapping the result back to an SU(2) circuit. The reported symptom, decomposing Pauli-Y yields an operator exactly equal to -Y with an inconsistent global phase, reflects this structural phase ambiguity rather than approximation error.

量子计算. 在专门的新兴任务上, Seed2.0 展现出出色的泛化能力. 在 AInstein Bench [27] 的量子软件工程赛道中, Seed2.0 成功修复了 Qiskit 的 Solovay–Kitaev(SK)编译器中一个由表示不匹配引起的细微 bug. 这个 bug 的起因是 Qiskit 在 SO(3)(Bloch 球旋转)中做 SK 递归, 而目标单量子比特门属于 SU(2). 由于 SU(2) 二重覆盖 SO(3), 递归无法区分 U 和 -U, 全局相位信息可能丢失, 把结果映射回 SU(2) 电路时必须恢复. 报告的症状是分解 Pauli-Y 得到恰好等于 -Y 的算符, 且全局相位不一致, 这反映的是这种结构性相位歧义, 而不是逼近误差.

Seed2.0's approach to this problem exemplifies systematic debugging methodology. The system first reproduces the failure using a minimal test case, verifies that the discrepancy manifested as a pure sign flip (phase difference of $\pi$), and localizes the root cause to the post-processing boundary in solovay\_kitaev.py where phase assignment occurs. Critically, Seed2.0 avoids modifying the mathematically correct recursion itself. After rejecting gate-specific constant-offset patches that would lack generalizability, it implements a principled solution: aligning operators by computing the phase $\phi$ such that $e^{i\phi}U_{\mathrm{decomp}} = U_{\mathrm{target}}$, then validating that this fix generalizes across all single-qubit gates without introducing regressions. This trajectory demonstrates agentic debugging through domain-theoretic diagnosis, precise code-level intervention at the appropriate

Seed2.0 处理这个问题的方式体现了系统化的调试方法. 系统先用最小测试用例复现失败, 确认差异表现为纯粹的符号翻转(相位差 $\pi$), 并把根因定位到 solovay\_kitaev.py 中做相位赋值的后处理边界. 关键在于, Seed2.0 没有去改数学上正确的递归本身. 在否决了缺乏通用性的, 针对特定门的常数偏移补丁之后, 它实现了一个有原则的方案: 计算相位 $\phi$ 使得 $e^{i\phi}U_{\mathrm{decomp}} = U_{\mathrm{target}}$, 以此对齐算符, 再验证这个修复能推广到所有单量子比特门且不引入回归. 这条轨迹展示了 agent 式调试: 用领域理论诊断, 在合适的

<!-- page 35 of 78 -->

##### Task Overview

任务概述

A core requirement when tracking multiple horizons is computing the proper distance between them. Unlike coordinate distance (simple Euclidean distance), proper distance in general relativity accounts for the curvature of spacetime. Mathematically, for a path connecting two points, the proper distance is given by integrating the line element:

跟踪多个视界时的一个核心需求, 是计算它们之间的固有距离. 与坐标距离(简单的欧氏距离)不同, 广义相对论中的固有距离考虑了时空弯曲. 数学上, 对连接两点的一条路径, 固有距离由线元的积分给出:

$$
s = \int \sqrt {\left\{g _ {\{i j \}} , d x ^ {i} , d x ^ {j} \right\}}
$$

where $g_{\{ij\}}$ is the spatial metric tensor. This integral needs to be evaluated numerically by:

其中 $g_{\{ij\}}$ 是空间度规张量. 这个积分需要数值计算, 步骤是:

1. Sampling points along a path between the two horizons

1. 在两个视界之间的路径上采样点

2. Interpolating the metric components at each point

2. 在每个点上插值度规分量

3. Computing the infinitesimal proper length $ds$ at each step

3. 在每一步计算无穷小固有长度 $ds$

4. Summing to obtain the total proper distance

4. 求和得到总固有距离

![Image block](images/p35-the-task-was-to-implement-ahfinder-dis-f-the-subroutine.png)

The task was to implement AHFinder\_dis.F, the subroutine responsible for computing the proper distance between two AH centers, using the methods above.

任务是实现 AHFinder\_dis.F, 即用上述方法计算两个 AH 中心之间固有距离的子程序.

##### Assistant:

助手:

##### [Stage 1: Codebase Exploration and Task Identification]

[阶段 1: 探索代码库, 识别任务]

... Ah there it is! It's referenced in line 5 of the makefile as AHFinder\_dis.F, but it doesn't exist in the src directory! So I need to create AHFinder\_dis.F. ... Line 1507 is where it calls the subroutine AHFinder\_dis... so AHFinder\_dis is called when find3 is true, meaning we have to find 3 horizons. This establishes the functional requirement: the subroutine must calculate proper distances between detected horizons when the find3 flag is enabled (for binary black hole simulations).

... 找到了! makefile 第 5 行引用了 AHFinder\_dis.F, 但 src 目录里没有这个文件! 所以我需要创建 AHFinder\_dis.F. ... 第 1507 行调用了子程序 AHFinder\_dis... 所以当 find3 为真, 也就是要找 3 个视界时, 会调用 AHFinder\_dis. 这就确定了功能需求: 在 find3 标志开启时(用于双黑洞模拟), 该子程序必须计算已检测到的视界之间的固有距离.

##### [Stage 2: Data Structure Analysis]

[阶段 2: 数据结构分析]

... From line 71-73 of AHFinder\_dat I see that we have c0\_0, c0\_1, c0\_2 as well as cc\_0, cc\_1,

... 从 AHFinder\_dat 第 71-73 行可以看到 c0\_0, c0\_1, c0\_2, 以及 cc\_0, cc\_1,

cc\_2 and cs\_0, cs\_1, cs\_2. Those are coefficients for 3 different horizons!

cc\_2 和 cs\_0, cs\_1, cs\_2. 这些是 3 个不同视界的系数!

We identify that each horizon is characterized by:

我们确认每个视界由以下量刻画:

◆ Center coordinates: xc\_0, yc\_0, zc\_0 (and similarly for horizons 1 and 2)

◆ 中心坐标: xc\_0, yc\_0, zc\_0(视界 1 和 2 类似)

◆ Shape coefficients: spherical harmonic expansion coefficients c0, cc, cs

◆ 形状系数: 球谐展开系数 c0, cc, cs

◆ Status flags: status\_old\_0, status\_old\_1, status\_old\_2 indicating whether each horizon was found

◆ 状态标志: status\_old\_0, status\_old\_1, status\_old\_2, 表示各视界是否被找到

##### [Stage 3: Physical Interpretation and Algorithm Design]

[阶段 3: 物理解释与算法设计]

Proper distance between two events... is the length of the shortest spatial geodesic between them. But wait, do we really want the shortest proper distance? Or just the Euclidean distance? ...Perfect! Now I understand! Proper distance between two points in a curved 3D space is the minimum length of the path between them (the geodesic). To calculate it: 1. Choose a parametric path from point A to point B, 2. Interpolate the 3D metric along the path, 3. Integrate the length of the path segments using the metric.

两个事件之间的固有距离... 是它们之间最短空间测地线的长度. 等等, 我们真的要最短固有距离吗? 还是只要欧氏距离? ...好! 现在明白了! 弯曲3D 空间中两点间的固有距离, 是它们之间路径的最小长度(测地线). 计算方法: 1. 选一条从 A 点到 B 点的参数化路径, 2. 沿路径插值3D 度规, 3. 用度规对路径各段长度积分.

##### [Stage 4: Implementation]

[阶段 4: 实现]

Metric Component Extraction:

度规分量提取:

call CCTK\_VarIndex(v\_gxx, "admbase::gxx")

call CCTK\_VarIndex(v\_gyy, "admbase::gyy")

call CCTK\_VarIndex(v\_gzz, "admbase::gzz")

call CCTK\_VarIndex(v\_gxy, "admbase::gxy")

call CCTK\_VarIndex(v\_gxz, "admbase::gxz")

call CCTK\_VarIndex(v\_gyz, "admbase::gyz")

<!-- page 36 of 78 -->

![Image block](images/p36-figure-13-the-case-of-seed2-0-with-general-relativity.png)

Figure 13 The case of Seed2.0 with General Relativity Task on AInsteinBench [27].

图 13 Seed2.0 在 AInsteinBench [27] 广义相对论任务上的案例.

interface, and rigorous generalization testing.

接口处做精确的代码级干预, 以及严格的泛化测试.

This case underscores Seed2.0's capability in quantum compiler debugging, a demanding scientific software engineering task that cannot be resolved through pattern matching or localized edits alone. Success requires understanding the mathematical abstraction (Lie group coverings), mapping this abstraction onto the software architecture, and identifying where theoretical guarantees must be enforced in the implementation. The demonstrated trajectory indicates that Seed2.0 can effectively navigate tasks requiring a deep integration of mathematical reasoning and software engineering principles.

这个案例凸显了 Seed2.0 在量子编译器调试上的能力. 这是一项要求很高的科学软件工程任务, 光靠模式匹配或局部修改解决不了. 成功需要理解数学抽象(李群覆盖), 把这个抽象映射到软件架构上, 并找出实现中必须落实理论保证的位置. 这条轨迹表明, Seed2.0 能有效处理需要把数学推理和软件工程原则深度结合的任务.

General Relativity. Seed2.0 demonstrates robust performance on numerical relativity tasks from AInstein-Bench [27]. When tasked with implementing numerical-relativity functionality in the Einstein Toolkit's legacy Fortran codebase (Cactus framework), the agent autonomously diagnoses and resolves a critical integration failure: it identifies that AHFinder\_dis.F, referenced by the build system, is missing from src, then traces its call site in AHFinder.F to determine the routine's role in multi-horizon tracking during binary black-hole simulations. This systematic debugging approach, locating missing components and verifying execution context, demonstrates practical software engineering capabilities beyond isolated code generation.

广义相对论. Seed2.0 在 AInstein-Bench [27] 的数值相对论任务上表现稳健. 在 Einstein Toolkit 的遗留 Fortran 代码库(Cactus 框架)中实现数值相对论功能时, agent 自主诊断并解决了一个关键的集成失败: 它发现构建系统引用的 AHFinder\_dis.F 在 src 中缺失, 然后在 AHFinder.F 中追踪到它的调用点, 从而确定该例程在双黑洞模拟的多视界跟踪中的作用. 这种系统化的调试方法(定位缺失组件, 核实执行上下文)体现了超越孤立代码生成的实际软件工程能力.

The implementation exhibits both physics insight and numerical rigor. Seed2.0 correctly interprets "distance" as proper distance in curved spacetime rather than coordinate separation, implementing $s = \int \sqrt{g_{ij} dx^i dx^j}$ with the full spatial 3-metric including all off-diagonal components $(g_{xx}, g_{yy}, g_{zz}, g_{xy}, g_{xz}, g_{yz})$. The solution properly accesses metric variables using Einstein Toolkit conventions, integrated with AHFinder's output

实现同时体现了物理洞察和数值严谨. Seed2.0 正确地把 「距离」 理解为弯曲时空中的固有距离, 而不是坐标间隔, 并用包含全部非对角分量 $(g_{xx}, g_{yy}, g_{zz}, g_{xy}, g_{xz}, g_{yz})$ 的完整空间 3-度规实现了 $s = \int \sqrt{g_{ij} dx^i dx^j}$. 方案按 Einstein Toolkit 的约定正确访问度规变量, 与 AHFinder 的输出

<!-- page 37 of 78 -->

*范围说明: 第 37 页是计算化学(PySCF 密度拟合)案例的任务说明与轨迹, 按本文件范围只记评测名称: AInsteinBench, 计算化学赛道. 原文未给该案例的分数与阈值, 做法与案例正文不转写. 图见 Figure 14.*

##### Task Overview

任务概述

![Image block](images/p37-resolving-this-issue-requires.png)

##### Assistant:

助手:

##### [Stage 1: Symptom Identification and Reproduction]

[阶段 1: 症状识别与复现]

<!-- page 38 of 78 -->

![Image block](images/p38-figure-14-the-case-of-seed2-0-with-computational.png)

Figure 14 The case of Seed2.0 with Computational Chemistry Task on AInsteinBench [27].

图 14 Seed2.0 在 AInsteinBench [27] 计算化学任务上的案例.

patterns, and includes robustness checks for invalid handles and absent horizons. While the production implementation incorporates additional refinements, grid symmetry handling, horizon–line intersections via spherical harmonics, and improved quadrature, the agent's solution captures the essential physics with appropriate simplifying assumptions.

模式集成, 并包含对无效句柄和视界缺失的稳健性检查. 虽然生产实现还有更多细节(网格对称处理, 用球谐函数求视界与连线的交点, 更好的求积), agent 的方案在合理的简化假设下抓住了核心物理.

This performance illustrates Seed2.0's capacity to navigate the multidimensional challenge space of scientific computing: translating physical concepts (Riemannian geometry, geodesic integration) into numerical methods (interpolation, quadrature) within complex software architectures (framework APIs, mixed-language codebases with F77/F90 syntax and preprocessor macros). The agent's successful integration of domain knowledge with system-level engineering reflects the core competencies that AInsteinBench is designed to evaluate.

这一表现说明, Seed2.0 能应对科学计算中多维度的难题: 在复杂软件架构(框架 API, 混用 F77/F90 语法和预处理宏的多语言代码库)之中, 把物理概念(黎曼几何, 测地线积分)转化为数值方法(插值, 求积). agent 把领域知识与系统级工程成功结合, 正是 AInsteinBench 想要评测的核心能力.

*范围说明: 此处是计算化学案例的正文, 按范围不转写. 评测名称: AInsteinBench. 原文给出的数值结果只有能量偏差约 0.9 Hartree, 修复后与参考值一致到约 $10^{-11}$ Hartree.*

<!-- page 39 of 78 -->

##### Task Overview

任务概述

Is it true that if $1 \leq a_1 < a_2 < \ldots$ is a sequence of integers with $\lim_{n \to \infty} a_n^{\frac{1}{2n}} > 1$ then $\sum_{n=1}^{\infty} \frac{1}{a_n a_{n+1}}$. is irrational?

是否成立: 若 $1 \leq a_1 < a_2 < \ldots$ 是一个整数序列, 满足 $\lim_{n \to \infty} a_n^{\frac{1}{2n}} > 1$, 则 $\sum_{n=1}^{\infty} \frac{1}{a_n a_{n+1}}$. 是无理数?

##### Assistant:

助手:

[Stage 1: Rationality Implies Lower Bound on $x_{\mathrm{m}}$]

[阶段 1: 有理性蕴含 $x_{\mathrm{m}}$ 的下界]

... Assume $S = P / Q$ for coprime positive integers $P, Q$. For each $m \geq 1$, split the sum into the partial sum and tail:

... 假设 $S = P / Q$, 其中 $P, Q$ 为互素正整数. 对每个 $m \geq 1$, 把和拆成部分和与尾项:

$$
S = S _ {m} + R _ {m}, \qquad S _ {m} = \sum_ {n = 1} ^ {m} \frac {1}{a _ {n} a _ {n + 1}}, \qquad R _ {m} = \sum_ {n = m + 1} ^ {\infty} \frac {1}{a _ {n} a _ {n + 1}}.
$$

Let $D_m = a_1a_2 \cdots a_{m+1}$. For $n \leq m$, the term $\frac{D_m}{a_n a_{n+1}} = \left( \prod_{i=1}^{n-1} a_i \right) \left( \prod_{i=n+2}^{m+1} a_i \right)$ is an integer, so $K_m = D_m S_m \in \mathbb{Z}$. Rearranging:

令 $D_m = a_1a_2 \cdots a_{m+1}$. 对 $n \leq m$, 项 $\frac{D_m}{a_n a_{n+1}} = \left( \prod_{i=1}^{n-1} a_i \right) \left( \prod_{i=n+2}^{m+1} a_i \right)$ 是整数, 所以 $K_m = D_m S_m \in \mathbb{Z}$. 整理得:

$$
D _ {m} S = K _ {m} + D _ {m} R _ {m} \Rightarrow x _ {m} = D _ {m} R _ {m} = \frac {D _ {m} P - K _ {m} Q}{Q} \dots
$$

##### [Stage 2: Loose Tail Bound and Recurrence]

[阶段 2: 松的尾项界与递推]

Because $\{a_{n}\}$ is strictly increasing, $a_{n + 1} - a_n\geq 1$, so:

因为 $\{a_{n}\}$ 严格递增, $a_{n + 1} - a_n\geq 1$, 所以:

$$
\frac {1}{a _ {n} a _ {n + 1}} = \frac {1}{a _ {n + 1} - a _ {n}} \left(\frac {1}{a _ {n}} - \frac {1}{a _ {n + 1}}\right) \leq \frac {1}{a _ {n}} - \frac {1}{a _ {n + 1}}.
$$

The liminf condition implies $a_{n}\to \infty$: there exists $N_{1}\in \mathbb{N}$ such that for all $n\geq N_1$, $a_{n}^{\frac{1}{2^{n}}} > \frac{L + 1}{2} >1$, so $a_{n} > \left[\frac{L + 1}{2}\right]^{2^{n}}\to \infty$ as $n\to \infty$.

liminf 条件蕴含 $a_{n}\to \infty$: 存在 $N_{1}\in \mathbb{N}$, 使得对所有 $n\geq N_1$, $a_{n}^{\frac{1}{2^{n}}} > \frac{L + 1}{2} >1$, 于是当 $n\to \infty$ 时 $a_{n} > \left[\frac{L + 1}{2}\right]^{2^{n}}\to \infty$.

Summing the telescoping inequality from $n = m + 2$ to $\infty$:

把裂项不等式从 $n = m + 2$ 加到 $\infty$:

$$
\sum_ {n = m + 2} ^ {\infty} \frac {1}{a _ {n} a _ {n + 1}} \leq \sum_ {n = m + 2} ^ {\infty} \left(\frac {1}{a _ {n}} - \frac {1}{a _ {n + 1}}\right) = \lim _ {N \to \infty} \left(\frac {1}{a _ {m + 2}} - \frac {1}{a _ {N}}\right) = \frac {1}{a _ {m + 2}} \dots
$$

[Stage 3: Logarithmic Variables and Boundedness of $r_k$]

[阶段 3: 对数变量与 $r_k$ 的有界性]

Take natural logarithms and define:

取自然对数并定义:

$$
b _ {k} = \log a _ {k},
$$

$$
Q _ {k} = \log P _ {k} = \sum_ {i = 1} ^ {k} b _ {i}, \qquad r _ {k} = \frac {Q _ {k}}{2 ^ {k}}.
$$

The recurrence $a_{k}\leq K P_{k - 1}$ becomes:

递推式 $a_{k}\leq K P_{k - 1}$ 变为:

$$
b _ {k} \leq \log K + Q _ {k - 1}, \quad \text {for} k \geq 3.
$$

Since $Q_{k} = Q_{k - 1} + b_{k}$, substitute to get:

由于 $Q_{k} = Q_{k - 1} + b_{k}$, 代入得:

$Q_{k}\leq Q_{k - 1} + \log K + Q_{k - 1} = 2Q_{k - 1} + C,\quad where C = \log K.$

Divide by $2^{k}$:

两边除以 $2^{k}$:

$$
\frac {Q _ {k}}{2 ^ {k}} \leq \frac {Q _ {k - 1}}{2 ^ {k - 1}} + \frac {C}{2 ^ {k}} \Rightarrow r _ {k} \leq r _ {k - 1} + \frac {C}{2 ^ {k}}, \quad \text {for} k \geq 3 \dots
$$

##### [Stage 4: Identity Relating $r_k$ and $d_k$]

[阶段 4: 联系 $r_k$ 与 $d_k$ 的恒等式]

Define the normalized log sequence:

定义归一化对数序列:

$$
d _ {k} = \frac {b _ {k}}{2 ^ {k}} = \log \frac {a _ {k}}{2 ^ {k}}.
$$

The liminf condition translates to:

liminf 条件转化为:

$$
\liminfits_{k\to \infty}d_{k} = l = \log L > 0.
$$

Using $Q_{k} = Q_{k - 1} + b_{k}$, divide by $2^{k}$ to derive the identity:

利用 $Q_{k} = Q_{k - 1} + b_{k}$, 除以 $2^{k}$ 得到恒等式:

$$
r _ {k} = \frac {Q _ {k - 1}}{2 ^ {k}} + \frac {b _ {k}}{2 ^ {k}} = \frac {r _ {k - 1}}{2} + d _ {k},
$$

which holds for all $k \geq 1$ with $r_0 = \frac{Q_0}{2^2} = \log 1 = 0$ (since $P_0 = 1$, the empty product)...

该式对所有 $k \geq 1$ 成立, 其中 $r_0 = \frac{Q_0}{2^2} = \log 1 = 0$(因为 $P_0 = 1$, 即空积)...

##### [Stage 5: Convergence of $\mathbf{r_k}$ and $\mathbf{d_k}$]

[阶段 5: $\mathbf{r_k}$ 与 $\mathbf{d_k}$ 的收敛]

We now show $\lim_{k\to \infty}r_k = R$ , so $r_k$ converges to $R$ . Let $R^{\prime} = \lim_{k\to \infty}r_k$

下面证明 $\lim_{k\to \infty}r_k = R$ , 从而 $r_k$ 收敛到 $R$ . 令 $R^{\prime} = \lim_{k\to \infty}r_k$

Choose subsequences:

选取子序列:

◆  $k_{m}$  such that  $r_{k_{m}} \rightarrow R$  as  $m \rightarrow \infty$ ,

◆  $k_{m}$ , 使得当 $m \rightarrow \infty$ 时 $r_{k_{m}} \rightarrow R$ ,

◆  $j_{n}$  such that  $r_{j_{n}} \rightarrow R'$  as  $n \rightarrow \infty$ .

◆  $j_{n}$ , 使得当 $n \rightarrow \infty$ 时 $r_{j_{n}} \rightarrow R'$ .

For each $j_n$, let $k_m$ be the largest index satisfying $k_m \leq j_n$, so $k_m \leq j_n < k_{m+1}$. Since $k_{m+1} > j_n$, apply the inequality from Step 3:

对每个 $j_n$, 令 $k_m$ 为满足 $k_m \leq j_n$ 的最大下标, 于是 $k_m \leq j_n < k_{m+1}$. 由于 $k_{m+1} > j_n$, 应用第 3 步的不等式:

$$
r _ {k _ {m + 1}} \leq r _ {j _ {n}} + \frac {C ^ {\prime}}{2 ^ {j _ {n}}} \dots
$$

<!-- page 40 of 78 -->

[Stage 7: Final Contradiction]

[阶段 7: 最终矛盾]

For $m \geq N_2 - 1$, use the tight tail bound to write:

对 $m \geq N_2 - 1$, 利用紧的尾项界写出:

$$
x _ {m} = D _ {m} R _ {m} \leq \frac {2 D _ {m}}{a _ {m + 1} a _ {m + 2}}.
$$

Since $D_{m} = P_{m + 1} = P_{m}a_{m + 1}$, substitute to simplify:

由于 $D_{m} = P_{m + 1} = P_{m}a_{m + 1}$, 代入化简:

$$
x _ {m} \leq \frac {2 P _ {m} a _ {m + 1}}{a _ {m + 1} a _ {m + 2}} = \frac {2 P _ {m}}{a _ {m + 2}} \dots
$$

... The proof proceeds by contradiction, assuming $S = \sum_{n=1}^{\infty} \frac{1}{a_n a_{n+1}} = \frac{P}{Q}$ is rational. We split $S$ into a partial sum $S_m$ and tail $R_m$, defining $D_m = a_1 a_2 \cdots a_{m+1}$ so that $x_m = D_m R_m$ is a positive rational number with denominator dividing $Q$, hence $x_m \geq \frac{1}{Q}$. A telescoping bound on $R_m$ yields the recurrence $a_k \leq K P_{k-1}$ (with $K = 2Q$) for $k \geq 3$, where $P_k$ is the product of the first $k$ terms of the sequence. Converting to logarithmic variables $r_k = \frac{\log p_k}{2^k}$, we show $r_k \leq r_{k-1} + \frac{C}{2^k}$ for some constant $C$, implying $r_n \leq r_m + \frac{C}{2^m}$ for all $n \geq m$. Using this, we prove $\liminf r_k = \limsup r_k = R$, so $r_k$ converges to $R$. Defining $d_k = \frac{\log a_k}{2^k}$, the identity $r_k = \frac{r_{k-1}}{2} + d_k$ implies $d_k \to D = \frac{R}{2}$, with $D \geq \log L > 0$ by the liminf condition. Using the convergence of $d_k$, we bound the tail $R_m$ by a geometric series, giving $R_m \leq \frac{2}{a_{m+1} a_{m+2}}$ for large $m$. Combining this with the growth rates of $P_m = e^{2^m r_m}$ and $a_{m+2} = e^{4 d_{m+2} 2^m}$, we find $x_m \leq 2 e^{2^m (r_m - 4 d_{m+2})} \to 0$ as $m \to \infty$, contradicting $x_m \geq \frac{1}{Q} > 0$. Thus $S$ is irrational.

... 证明用反证法, 假设 $S = \sum_{n=1}^{\infty} \frac{1}{a_n a_{n+1}} = \frac{P}{Q}$ 是有理数. 把 $S$ 拆成部分和 $S_m$ 与尾项 $R_m$, 定义 $D_m = a_1 a_2 \cdots a_{m+1}$, 使 $x_m = D_m R_m$ 是分母整除 $Q$ 的正有理数, 因此 $x_m \geq \frac{1}{Q}$. 对 $R_m$ 的裂项界给出递推式 $a_k \leq K P_{k-1}$(其中 $K = 2Q$), 对 $k \geq 3$ 成立, $P_k$ 是序列前 $k$ 项之积. 换成对数变量 $r_k = \frac{\log p_k}{2^k}$ 后, 证明对某个常数 $C$ 有 $r_k \leq r_{k-1} + \frac{C}{2^k}$, 从而对所有 $n \geq m$ 有 $r_n \leq r_m + \frac{C}{2^m}$. 据此证明 $\liminf r_k = \limsup r_k = R$, 即 $r_k$ 收敛到 $R$. 定义 $d_k = \frac{\log a_k}{2^k}$, 恒等式 $r_k = \frac{r_{k-1}}{2} + d_k$ 蕴含 $d_k \to D = \frac{R}{2}$, 且由 liminf 条件 $D \geq \log L > 0$. 利用 $d_k$ 的收敛, 用几何级数界住尾项 $R_m$, 对足够大的 $m$ 得到 $R_m \leq \frac{2}{a_{m+1} a_{m+2}}$. 再结合 $P_m = e^{2^m r_m}$ 与 $a_{m+2} = e^{4 d_{m+2} 2^m}$ 的增长速度, 得到当 $m \to \infty$ 时 $x_m \leq 2 e^{2^m (r_m - 4 d_{m+2})} \to 0$, 与 $x_m \geq \frac{1}{Q} > 0$ 矛盾. 所以 $S$ 是无理数.

Figure 15 The case of Seed2.0 with Complex Mathematics Solution Task on Erdős.

图 15 Seed2.0 在 Erdős 复杂数学求解任务上的案例.

### 5.4 Multidisciplinary Scientific Research Analysis

5.4 多学科科学研究分析

In this section, we systematically evaluate Seed2.0's scientific research analysis capabilities across tasks that mirror real-world workflows. We design four thematic categories spanning theoretical derivations, computational modeling, and experimental design. Our assessment examines whether Seed2.0 produces outputs that are technically sound, internally consistent, and aligned with domain conventions, including explicit assumptions, appropriate methodological choices, and reproducible procedures. We further evaluate its justification of technical decisions and the transferability of outputs to downstream applications, thereby characterizing its performance across multidisciplinary research settings.

本节系统评估 Seed2.0 在贴近真实工作流的任务上的科学研究分析能力. 我们设计了四个主题类别, 涵盖理论推导, 计算建模和实验设计. 评估考察 Seed2.0 的输出是否技术上可靠, 内部一致, 符合领域惯例, 包括明确的假设, 恰当的方法选择和可复现的流程. 我们还评估它对技术决策的论证, 以及输出能否迁移到下游应用, 从而刻画它在多学科研究场景中的表现.

Complex Mathematics Solution. To demonstrate the model's capability in Seed2.0 to solve complex mathematical tasks, we present proofs of two Erdős Problems [6], generated through a iterative refinement pipeline with Seed2.0. Figure 15 shows a summary of the output and demonstrates that Seed2.0 can address frontier-level challenges in mathematical research. Human experts have verified these proofs for correctness, and we have formalized the proof of Erdős 1051 using Seed-Prover 1.5 [13]. The model demonstrates a strong capacity for systematic reasoning and rigorous proof construction. See Appendix E for evaluation details and full outputs.

复杂数学求解. 为展示 Seed2.0 解决复杂数学任务的能力, 我们给出两道 Erdős 问题 [6] 的证明, 它们由基于 Seed2.0 的迭代改进流水线生成. Figure 15 给出输出摘要, 表明 Seed2.0 能应对数学研究中的前沿难题. 人类专家已核验这些证明的正确性, 我们还用 Seed-Prover 1.5 [13] 把 Erdős 1051 的证明形式化了. 模型展现出系统推理和严谨构造证明的强大能力. 评测细节和完整输出见 Appendix E.

<!-- page 41 of 78 -->

*范围说明: 第 41–46 页是 FrontierScience 上的三个生物/化学分析案例(大麻二酚分子模拟, 马来酰亚胺聚乙炔合成机理, 小鼠高尔基体多组学). 按本文件范围只记评测名称与分数: 评测为 FrontierScience; 原文对这三例只给定性评价, 没有分数和阈值. 做法与案例正文不转写, 页标记与图保留.*

#### Task Overview

任务概述

#### Assistant:

助手:

<!-- page 42 of 78 -->

![Image block](images/p42-figure-16-case-study-of-seed2-0-performing-the.png)

Figure 16 Case study of Seed2.0 performing the Cannabidiol Scientific Analysis on FrontierScience.

图 16 Seed2.0 在 FrontierScience 上执行大麻二酚(CBD)科学分析的案例.

<!-- page 43 of 78 -->

#### Task Overview

任务概述

#### Assistant:

助手:

<!-- page 44 of 78 -->

![Image block](images/p44-figure-17-case-study-of-seed2-0-performing-the.png)

Figure 17 Case study of Seed2.0 performing the Maleimide Polyacetylene Scientific Analysis on FrontierScience.

图 17 Seed2.0 在 FrontierScience 上执行马来酰亚胺聚乙炔科学分析的案例.

<!-- page 45 of 78 -->

#### Task Overview

任务概述

#### Assistant:

助手:

<!-- page 46 of 78 -->

![Image block](images/p46-figure-18-case-study-of-seed2-0-performing-the-golgi.png)

Figure 18 Case study of Seed2.0 performing the Golgi Proteins Scientific Analysis on FrontierScience.

图 18 Seed2.0 在 FrontierScience 上执行高尔基体蛋白科学分析的案例.

### 5.5 Automated Model-on-Model Behavioral Diagnostics

5.5 模型评模型的自动化行为诊断

As evaluation ecosystems grow in scale and diversity, manual analysis of benchmark results becomes increasingly costly and difficult to standardize. We build an automated model-on-model diagnostic pipeline that uses LLMs to analyze the evaluation outcomes of peer models across heterogeneous benchmarks. The system aggregates metric scores and behavioral statistics, including token usage, formatting compliance, turn counts, emoji frequency, best-of-N statistics and other derived metrics, alongside instance-level outputs, reasoning traces, and execution trajectories. Through a three-layer design that separates data processing, scenario-adaptive analytical workflows, and report synthesis, the framework scales to large case volumes and helps algorithm researchers efficiently iterate on models by exposing model weaknesses, strategy trade-offs, and concrete behavioral issues such as code-switching and repetitive CoT patterns. Table 15 shows that the pipeline scales across diverse benchmarks and produces structured findings with quantified throughput and resource statistics.

随着评测生态的规模和多样性增长, 人工分析基准结果越来越贵, 也越来越难标准化. 我们构建了一条模型评模型的自动化诊断流水线, 用 LLM 分析同类模型在异构基准上的评测结果. 系统汇总指标分数和行为统计, 包括 token 用量, 格式合规, 轮次数, emoji 频率, best-of-N 统计和其他派生指标, 以及样本级输出, 推理轨迹和执行轨迹. 通过把数据处理, 场景自适应的分析流程和报告综合分成三层, 该框架能扩展到大量案例, 帮助算法研究者高效迭代模型: 暴露模型弱点, 策略取舍和具体行为问题, 如语码切换和重复的 CoT 模式. Table 15 表明, 这条流水线能扩展到多样的基准, 并给出带有吞吐量和资源量化统计的结构化结论.

<!-- page 47 of 78 -->

Table 15 Scalable automated diagnostics for iterative model development. The pipeline converts large-scale benchmark evaluations into structured behavioral reports across reasoning, planning, and tool-use domains, revealing capability trade-offs and systematic failures with measured throughput and efficiency.

表 15 用于迭代式模型开发的可扩展自动化诊断. 该流水线把大规模基准评测转换为覆盖推理, 规划和工具调用领域的结构化行为报告, 揭示能力取舍和系统性失败, 并给出实测的吞吐量和效率.

> **停一下:** Table 15 的 WorldTravel 一格里, 失败原因占比加起来超过 100%, 分母是什么?
> 33% + 30% + 25% + 28% = 116%, 说明四类失败可以同时出现在一个案例上, 是多标签计数, 各自的分母是失败案例数而不是「失败次数」. 而且这里又有两个分母: 这一格开头写 「Cases per Model: 150」, 失败统计却写 「Across 60 head-model comparisons」, 60 是从哪 150 个里怎么挑的没说. 同一格的 +0.09 对得上(0.327−0.233=0.094), 「77% fewer reasoning tokens (1286 vs 5597)」 也对得上(1−1286/5597≈0.770). 这张表的诊断结论由 LLM 自动写出, 数字需要像这样逐个复算.

> **再看:** IMO-Bench 一格的 bon=0.87, won=0.66 是什么? 「21% sampling instability」 该怎么读?
> bon 和 won 应是同一题多次采样里取最好(best-of-N)和取最差(worst-of-N)的得分, 两者之差衡量采样之间的波动. 0.87−0.66=0.21, 表里写 0.211, 是保留了更多位的结果. 「21% instability」 的说法把分差直接当成百分比, 不严谨: 它是绝对分差, 不是 21% 的题不稳定. 这一格说明 Seed2.0 Pro 的上限(bon 接近 Gemini-3-Pro 的 0.92)与下限(won 低于 GPT-5.2 High 的 0.81)差得多, 也就是说多花 TestingTime 做采样加挑选, 对它的收益会比对 GPT-5.2 大. 这也解释了为何 Table 2 的竞赛成绩要配 solve-verify-refine 流水线.

| Benchmark | Representative Findings | Efficiency Profile |
| --- | --- | --- |
| XBench | Focus: SearchAgent.Finding: Seed2.0 Pro delivers the strongest overall performance on this benchmark while maintaining efficient search behavior. It consistently completes complex multi-step tasks through multi-source retrieval and iterative verification, but shows weakness in fine-grained boundary alignment and structured comparison scenarios.Evidence: It ranks first with avg_score=0.64, ahead of GPT-5.2 High (0.57), Claude-Sonnet-4.5-thinking (0.48), and Gemini-2.5-Pro (0.24), while using 337.62 completion tokens and 277.49 reasoning tokens on average. In long multi-hop cases such as case_6 (48 calls), case_15 (44 calls), and case_52 (70+ calls), it converges through repeated verification; however, in boundary-sensitive tasks like case_28, case_33, case_35, and case_91, it receives score 0.0 due to condition misalignment or anchor drift. | Cases per Model: 100Models: 9Time Cost: 2435 sTokens in: 0.9 MTokens out: 0.1 M |
| WorldTravel | Focus: Real World Tasks.Finding: Seed2.0 Pro demonstrates strong engineering stability, but its performance degrades under high coupling density due to weak second-order constraint reasoning and limited long-chain conflict repair. The primary gap with GPT-5.2 lies not in basic planning, but in maintaining constraint closure under cross-dependent temporal, structural, and pricing constraints.Evidence: Seed2.0 Pro ranks 2nd with avg_score=0.233, trailing GPT-5.2 High (0.327, +0.09) while outperforming most peers. It maintains error_rate=0.00 and stable latency (31.39s), using 77% fewer reasoning tokens (1286 vs 5597) and 84% fewer completion tokens (1486 vs 9190) than GPT-5.2 High. Success cases concentrate in ≤15 structured constraints, whereas failures increase sharply when constraints exceed 15 with cross-dependencies. Major failure patterns include temporal window misalignment (case_19, 27, 42), fine-grained ticket miscalculation (case_23, 55), structural ordering errors (case_17, 53), and missing long-chain conflict repair (case_29, 46). Across 60 head-model comparisons, 33% of failures stem from temporal misalignment, 30% from structural violations, 25% from pricing errors, and 28% from conflict detection breakdown. | Cases per Model: 150Models: 9Time Cost: 1571 sTokens in: 0.9 MTokens out: 0.04 M |
| IMO-Bench | Focus: ReasoningFinding: Seed2.0 Pro is strong at pushing structured problems to a logical conclusion. In recursive, combinatorial, and formula-driven tasks, it can carry the reasoning chain step by step without breaking the internal logic. However, it struggles when a problem requires extreme-case construction or full boundary coverage. It often proves the main idea correctly but fails to completely seal upper-lower bounds or exhaust all branches.Evidence: Seed2.0 Pro achieves avg_score=0.779 (Rank 4/9), showing stable execution quality. Its bon=0.87 is close to Gemini-3-Flash (0.91) and Gemini-3-Pro (0.92), indicating competitive peak capability. However, its won=0.66 is significantly lower than GPT-5.2 High (0.81), resulting in a bon-won gap of 0.211, which implies 21% sampling instability. Behaviorally, 65% of its incorrect cases involve extreme-value or boundary-construction tasks, and 80% involve full-quantifier or multi-branch exhaustion problems, aligning with the observed robustness gap. | Cases per Model: 400Models: 9Time Cost: 1741 sTokens in: 1.4 MTokens out: 0.06 M |

<!-- page 48 of 78 -->

| Benchmark | Representative Findings | Efficiency Profile |
| --- | --- | --- |
| $\tau^{2}$-Bench | Focus:Tool Use Agent.Finding:Seed2.0 Pro high-score cases dynamically skip redundant device checks and resolve issues within a controlled tool-call budget, while strictly adhering to single-step JSON outputs; low-score cases follow mechanical enumeration, over-consume dialogue turns, and break structural constraints.Evidence:Seed2.0 Pro high-score cases complete in 31.4 turns on average with 7.3 tool calls, whereas low-score cases expand to 55.0 turns (+75.2%) and 9.6 calls (+31.5%), often delaying billing checks by 30+ turns (e.g., case_51, case_-54); Seed2.0 Pro scores 0.781 (3/9) using 721 completion tokens and 637 reasoning tokens, substantially fewer than GPT-5 High (2143 / 1946) despite a 0.17 score gap. | Cases per Model:278Models:9Time Cost:3116 sTokens in:1.8 MTokens out:0.1 M |

## 6 Conclusion

The Seed2.0 model series takes a key step forward in the intelligent evolution of solving complex real-world tasks. First, the Seed team identifies users' real needs, and selects or abstracts a series of benchmarks based on these real needs and complex real-world scenarios to build a reliable evaluation system. Based on the reliable and forward-looking evaluation system, Seed2.0 focuses on solving long-tail knowledge problems and complex instruction following problems, thereby enhancing the reliability of the model in complex and long-range real-world tasks. In addition, Seed2.0 has world-leading reasoning intelligence, visual understanding capabilities, and search capabilities, which meet the most real needs of a large number of users. The model card provides a large number of real use cases to prove that the Seed2.0 model begins to have the ability to handle initial complex real-world tasks, thus bringing more value to hundreds of millions of users.

Seed2.0 模型系列在解决复杂真实任务的智能演进上迈出了关键一步. 首先, Seed 团队识别用户的真实需求, 并基于这些需求和复杂的真实场景, 选取或抽象出一系列基准, 构建可靠的评测体系. 依托这一可靠且具前瞻性的评测体系, Seed2.0 着力解决长尾知识问题和复杂指令遵循问题, 从而提升模型在复杂长程真实任务中的可靠性. 此外, Seed2.0 拥有世界领先的推理智能, 视觉理解能力和搜索能力, 满足大量用户最真实的需求. 本模型卡给出了大量真实用例, 证明 Seed2.0 模型开始具备处理初步复杂真实任务的能力, 从而为数亿用户带来更多价值.

## References

[1] Seed-1.8 Model Card and Evaluation Overview. https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/research/Seed-1.8-Modelcard.pdf, 2025. Accessed: 2026-02-xx.

[2] Niki Amini-Naieni, Kiana Amini-Naieni, Tengda Han, and Andrew Zisserman. Open-world text-specified object counting. arXiv preprint arXiv:2306.01851, 2023.

[3] Anthropic. The anthropic economic index: January 2026 report on ai work task evolution. Technical report, Anthropic, 2026. URL https://www.anthropic.com/research/anthropic-economic-index-january-2026-report.

[4] Mislav Balunović, Jasper Dekoninck, Ivo Petrov, Nikola Jovanović, and Martin Vechev. Matharena: Evaluating llms on uncontaminated math competitions. arXiv preprint arXiv:2505.23281, 2025.

[5] Victor Barres, Honghua Dong, Soham Ray, Xujie Si, and Karthik Narasimhan.  $\tau^{2}$ -bench: Evaluating conversational agents in a dual-control environment. arXiv preprint arXiv:2506.07982, 2025.

[6] T. F. Bloom. Erdős problem #1051. URL https://www.erdosproblems.com/1051.

[7] Chase Brower. Visual physics comprehension test, 2025.

[8] ByteDance-Seed. Beyondaime: Advancing math reasoning evaluation beyond high school olympiads. https://huggingface.co/datasets/ByteDance-Seed/BeyondAIME, 2025.

[9] Zikui Cai, Andrew Wang, Anirudh Satheesh, Ankit Nakhawa, Hyunwoo Jae, Keenan Powell, Minghui Liu, Neel Jay, Sungbin Oh, Xiyao Wang, Yongyuan Liang, Tom Goldstein, and Furong Huang. MORSE-500: A programmatically controllable video benchmark to stress-test multimodal reasoning. CoRR, abs/2506.05523, 2025.

<!-- page 49 of 78 -->

[10] Meng Cao, Pengfei Hu, Yingyao Wang, Jihao Gu, Haoran Tang, Haoze Zhao, Jiahua Dong, Wangbo Yu, Ge Zhang, Ian Reid, and Xiaodan Liang. Video simpleqa: Towards factuality evaluation in large video language models. CoRR, abs/2503.18923, 2025.

[11] Aaron Chatterji, Thomas Cunningham, David J Deming, Zoe Hitzig, Christopher Ong, Carl Yan Shan, and Kevin Wadman. How people use chatgpt. Working Paper 34255, National Bureau of Economic Research, September 2025. URL http://www.nber.org/papers/w34255.

[12] Guo Chen, Yicheng Liu, Yifei Huang, Baoqi Pei, Jilan Xu, Yuping He, Tong Lu, Yali Wang, and Limin Wang. Cg-bench: Clue-grounded question answering benchmark for long video understanding. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025, 2025.

[13] Jiangjie Chen, Wenxiang Chen, Jiacheng Du, Jinyi Hu, Zhicheng Jiang, Allan Jie, Xiaoran Jin, Xing Jin, Chenggang Li, Wenlei Shi, Zhihong Wang, Mingxuan Wang, Chenrui Wei, Shufa Wei, Huajian Xin, Fan Yang, Weihao Gao, Zheng Yuan, Tianyang Zhan, Zeyu Zheng, Tianxi Zhou, and Thomas Hanwen Zhu. Seed-prover 1.5: Mastering undergraduate-level theorem proving via learning from experience, 2025. URL https://arxiv.org/abs/2512.17260.

[14] Joya Chen, Ziyun Zeng, Yiqi Lin, Wei Li, Zejun Ma, and Mike Zheng Shou. Livecc: Learning video LLM with streaming speech transcription at scale. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 29083–29095, 2025.

[15] Liang Chen, Weichu Xie, Yiyan Liang, Hongfeng He, Hans Zhao, Zhibo Yang, Zhiqi Huang, Haoning Wu, Haoyu Lu, Yiping Bao, et al. Babyvision: Visual reasoning beyond language. arXiv preprint arXiv:2601.06521, 2026.

[16] Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Yuhang Zang, Zehui Chen, Haodong Duan, Jiaqi Wang, Yu Qiao, Dahua Lin, et al. Are we on the right way for evaluating large vision-language models? Advances in Neural Information Processing Systems, 37:27056–27087, 2024.

[17] Qiguang Chen, Libo Qin, Jinhao Liu, Dengyun Peng, Jiannan Guan, Peng Wang, Mengkang Hu, Yuhang Zhou, Te Gao, and Wanxiang Che. Towards reasoning era: A survey of long chain-of-thought for reasoning large language models. arXiv preprint arXiv:2503.09567, 2025.

[18] Junhao Cheng, Yuying Ge, Teng Wang, Yixiao Ge, Jing Liao, and Ying Shan. Video-holmes: Can MLLM think like holmes for complex video reasoning? CoRR, abs/2505.21374, 2025.

[19] Long Cheng, Jiafei Duan, Yi Ru Wang, Haoquan Fang, Boyang Li, Yushan Huang, Elvis Wang, Ainaz Eftekhar, Jason Lee, Wentao Yuan, et al. Pointarena: Probing multimodal grounding through language-guided pointing. arXiv preprint arXiv:2505.09990, 2025.

[20] Xianfu Cheng, Wei Zhang, Shiwei Zhang, Jian Yang, Xiangyuan Guan, Xianjie Wu, Xiang Li, Ge Zhang, Jiaheng Liu, Yuying Mai, et al. Simplevqa: Multimodal factuality evaluation for multimodal large language models. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 4637–4646, 2025.

[21] Daniel Cores, Michael Dorkenwald, Manuel Mucientes, Cees G. M. Snoek, and Yuki M. Asano. Tvbench: Redesigning video-language evaluation. CoRR, abs/2410.07752, 2024.

[22] Chao Deng, Jiale Yuan, Pi Bu, Peijie Wang, Zhong-Zhi Li, Jian Xu, Xiao-Hui Li, Yuan Gao, Jun Song, Bo Zheng, et al. Longdocurl: a comprehensive multimodal long document benchmark integrating understanding, reasoning, and locating. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1135–1159, 2025.

[23] Xiang Deng, Jeff Da, Edwin Pan, Yannis Yiming He, Charles Ide, Kanak Garg, Niklas Lauffer, Andrew Park, Nitin Pasari, Chetan Rane, et al. Swe-bench pro: Can ai agents solve long-horizon software engineering tasks? arXiv preprint arXiv:2509.16941, 2025.

[24] Kaustubh Deshpande, Ved Sirdeshmukh, Johannes Baptist Mols, Lifeng Jin, Ed-Yeremai Hernandez-Cardona, Dean Lee, Jeremy Kritz, Willow E Primack, Summer Yue, and Chen Xing. Multichallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier llms. In Findings of the Association for Computational Linguistics: ACL 2025, pages 18632–18702, 2025.

[25] Jingzhe Ding, Shengda Long, Changxin Pu, Huan Zhou, Hongwan Gao, Xiang Gao, Chao He, Yue Hou, Fei Hu, Zhaojian Li, et al. Nl2repo-bench: Towards long-horizon repository generation evaluation of coding agents. arXiv preprint arXiv:2512.12730, 2025.

<!-- page 50 of 78 -->

[26] Shihan Dou, Ming Zhang, Zhangyue Yin, Chenhao Huang, Yujiong Shen, Junzhe Wang, Jiayi Chen, Yuchen Ni, Junjie Ye, Cheng Zhang, Huaibing Xie, Jianglu Hu, Shaolei Wang, Weichao Wang, Yanling Xiao, Yiting Liu, Zenan Xu, Zhen Guo, Pluto Zhou, Tao Gui, Zuxuan Wu, Xipeng Qiu, Qi Zhang, Xuanjing Huang, Yu-Gang Jiang, Di Wang, and Shunyu Yao. CL-bench: A Benchmark for Context Learning. arXiv e-prints, art. arXiv:2602.03587, February 2026. doi: 10.48550/arXiv.2602.03587.

[27] Mingxuan Du, Benfeng Xu, Chiwei Zhu, Xiaorui Wang, and Zhendong Mao. Deepresearch bench: A comprehensive benchmark for deep research agents. arXiv preprint arXiv:2506.11763, 2025.

[28] Xinrun Du, Yifan Yao, Kaijing Ma, Bingli Wang, Tianyu Zheng, King Zhu, Minghao Liu, Yiming Liang, Xiaolong Jin, Zhenlin Wei, et al. Supergpqa: Scaling llm evaluation across 285 graduate disciplines. arXiv preprint arXiv:2502.14739, 2025.

[29] Linxi Fan, Guanzhi Wang, Yunfan Jiang, Ajay Mandlekar, Yuncong Yang, Haoyi Zhu, Andrew Tang, De-An Huang, Yuke Zhu, and Anima Anandkumar. MineDojo: Building Open-Ended Embodied Agents with Internet-Scale Knowledge. arXiv e-prints, art. arXiv:2206.08853, June 2022. doi: 10.48550/arXiv.2206.08853.

[30] Chaoyou Fu, Yuhan Dai, Yongdong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, Peixian Chen, Yanwei Li, Shaohui Lin, Sirui Zhao, Ke Li, Tong Xu, Xiawu Zheng, Enhong Chen, Caifeng Shan, Ran He, and Xing Sun. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 24108–24118, 2025.

[31] Ling Fu, Zhebin Kuang, Jiajun Song, Mingxin Huang, Biao Yang, Yuzhe Li, Linghao Zhu, Qidi Luo, Xinyu Wang, Hao Lu, et al. Ocrbench v2: An improved benchmark for evaluating large multimodal models on visual text localization and reasoning. arXiv preprint arXiv:2501.00321, 2024.

[32] Shenghao Fu, Qize Yang, Yuan-Ming Li, Yi-Xing Peng, Kun-Yu Lin, Xihan Wei, Jian-Fang Hu, Xiaohua Xie, and Wei-Shi Zheng. Vispeak: Visual instruction feedback in streaming videos. CoRR, abs/2503.12769, 2025.

[33] Xingyu Fu, Yushi Hu, Bangzheng Li, Yu Feng, Haoyu Wang, Xudong Lin, Dan Roth, Noah A Smith, Wei-Chiu Ma, and Ranjay Krishna. Blink: Multimodal large language models can see but not perceive. In European Conference on Computer Vision, pages 148–166. Springer, 2024.

[34] Google Cloud. Gemini enterprise: Release notes and workspace agent integration updates. Official Documentation, 2026. URL https://docs.cloud.google.com/gemini/enterprise/docs/release-notes.

[35] Tianrui Guan, Fuxiao Liu, Xiyang Wu, Ruiqi Xian, Zongxia Li, Xiaoyu Liu, Xijun Wang, Lichang Chen, Furong Huang, Yaser Yacoob, et al. Hallusionbench: an advanced diagnostic suite for entangled language hallucination and visual illusion in large vision-language models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 14375–14385, 2024.

[36] Yunzhuo Hao, Jiawei Gu, Huichen Will Wang, Linjie Li, Zhengyuan Yang, Lijuan Wang, and Yu Cheng. Can mllms reason in multimodality? emma: An enhanced multimodal reasoning benchmark. arXiv preprint arXiv:2501.05444, 2025.

[37] Wei He, Yueqing Sun, Hongyan Hao, Xueyuan Hao, Zhikang Xia, Qi Gu, Chengcheng Han, Dengchang Zhao, Hui Su, Kefeng Zhang, et al. Vitabench: Benchmarking llm agents with versatile interactive tasks in real-world applications. arXiv preprint arXiv:2509.26490, 2025.

[38] Wenyi Hong, Yean Cheng, Zhuoyi Yang, Weihan Wang, Lefan Wang, Xiaotao Gu, Shiyu Huang, Yuxiao Dong, and Jie Tang. Motionbench: Benchmarking and improving fine-grained video motion understanding for vision language models. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 8450–8460, 2025.

[39] Kairui Hu, Penghao Wu, Fanyi Pu, Wang Xiao, Yuanhan Zhang, Xiang Yue, Bo Li, and Ziwei Liu. Video-mmmu: Evaluating knowledge acquisition from multi-discipline professional videos. arXiv preprint arXiv:2501.13826, 2025.

[40] Liang Hu, Jianpeng Jiao, Jiashuo Liu, Yanle Ren, Zhoufutu Wen, Kaiyuan Zhang, Xuanliang Zhang, Xiang Gao, Tianci He, Fei Hu, et al. Finsearchcomp: Towards a realistic, expert-level evaluation of financial search and reasoning. arXiv preprint arXiv:2509.13160, 2025.

<!-- page 51 of 78 -->

[41] Jen-Tse Huang, Dasen Dai, Jen-Yuan Huang, Youliang Yuan, Xiaoyuan Liu, Wenxuan Wang, Wenxiang Jiao, Pinjia He, and Zhaopeng Tu. Visfactor: Benchmarking fundamental visual cognition in multimodal large language models. arXiv preprint arXiv:2502.16435, 2025.

[42] Yichen Huang and Lin F Yang. Winning gold at imo 2025 with a model-agnostic verification-and-refinement pipeline. arXiv preprint arXiv:2507.15855, 2025.

[43] Zhenpeng Huang, Xinhao Li, Jiaqi Li, Jing Wang, Xiangyu Zeng, Cheng Liang, Tao Wu, Xi Chen, Liang Li, and Limin Wang. Online video understanding: Ovbench and videochat-online. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 3328–3338, 2025.

[44] Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv:2403.07974, 2024.

[45] Carlos E Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik Narasimhan. Swe-bench: Can language models resolve real-world github issues? arXiv preprint arXiv:2310.06770, 2023.

[46] Jingyao Li, Jingyun Wang, Molin Tan, Haochen Wang, Cilin Yan, Likun Shi, Jiayin Cai, Xiaolong Jiang, and Yao Hu. Crossvid: A comprehensive benchmark for evaluating cross-video reasoning in multimodal large language models. CoRR, abs/2511.12263, 2025.

[47] Shilong Li, Xingyuan Bu, Wenjie Wang, Jiaheng Liu, Jun Dong, Haoyang He, Hao Lu, Haozhe Zhang, Chenchen Jing, Zhen Li, Chuanhao Li, Jiayi Tian, Chenchen Zhang, Tianhao Peng, Yancheng He, Jihao Gu, Yuanxing Zhang, Jian Yang, Ge Zhang, Wenhao Huang, Wangchunshu Zhou, Zhaoxiang Zhang, Ruizhe Ding, and Shilei Wen. MM-BrowseComp: A Comprehensive Benchmark for Multimodal Browsing Agents. arXiv e-prints, art. arXiv:2508.13186, August 2025. doi: 10.48550/arXiv.2508.13186.

[48] Yiming Liang, Yizhi Li, Yantao Du, Ge Zhang, Jiayi Zhou, Yuchen Wu, Yinzhu Piao, Denghui Cao, Tong Sun, Ziniu Li, Li Du, Bo Lei, Jiaheng Liu, Chenghua Lin, Zhaoxiang Zhang, Wenhao Huang, and Jiajun Zhang. Encyclo-K: Evaluating LLMs with Dynamically Composed Knowledge Statements. arXiv e-prints, art. arXiv:2512.24867, December 2025. doi: 10.48550/arXiv.2512.24867.

[49] Yuan Liu, Haodong Duan, Yuanhan Zhang, Bo Li, Songyang Zhang, Wangbo Zhao, Yike Yuan, Jiaqi Wang, Conghui He, Ziwei Liu, et al. Mmbench: Is your multi-modal model an all-around player? In European conference on computer vision, pages 216–233. Springer, 2024.

[50] Yuanxin Liu, Shicheng Li, Yi Liu, Yuxiang Wang, Shuhuai Ren, Lei Li, Sishuo Chen, Xu Sun, and Lu Hou. Tempcompass: Do video llms really understand videos? In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Findings of the Association for Computational Linguistics, ACL 2024, Bangkok, Thailand and virtual meeting, August 11-16, 2024, pages 8731–8772. Association for Computational Linguistics, 2024.

[51] Yuanxin Liu, Kun Ouyang, Haoning Wu, Yi Liu, Lin Sui, Xinhao Li, Yan Zhong, Y. Charles, Xinyu Zhou, and Xu Sun. Videoreasonbench: Can mllms perform vision-centric complex video reasoning? CoRR, abs/2505.23359, 2025.

[52] Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

[53] Minh-Thang Luong, Dawsen Hwang, Hoang H Nguyen, Golnaz Ghiasi, Yuri Chervonyi, Insuk Seo, Junsu Kim, Garrett Bingham, Jonathan Lee, Swaroop Mishra, et al. Towards robust mathematical reasoning. In Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing, pages 35406–35430, 2025.

[54] Kaijing Ma, Xinrun Du, Yunran Wang, Haoran Zhang, Zhoufutu Wen, Xingwei Qu, Jian Yang, Jiaheng Liu, Minghao Liu, Xiang Yue, et al. Kor-bench: Benchmarking language models on knowledge-orthogonal reasoning tasks. arXiv preprint arXiv:2410.06526, 2024.

[55] Wentao Ma, Weiming Ren, Yiming Jia, Zhuofeng Li, Ping Nie, Ge Zhang, and Wenhu Chen. Videoeval-pro: Robust and realistic long video understanding evaluation. CoRR, abs/2505.14640, 2025.

[56] Yubo Ma, Yuhang Zang, Liangyu Chen, Meiqi Chen, Yizhu Jiao, Xinze Li, Xinyuan Lu, Ziyu Liu, Yan Ma, Xiaoyi Dong, et al. Mmlongbench-doc: Benchmarking long-context document understanding with visualizations. Advances in Neural Information Processing Systems, 37:95963–96010, 2024.

<!-- page 52 of 78 -->

[57] Zeyao Ma, Bohan Zhang, Jing Zhang, Jifan Yu, Xiaokang Zhang, Xiaohan Zhang, Sijia Luo, Xi Wang, and Jie Tang. SpreadsheetBench: Towards Challenging Real World Spreadsheet Manipulation. arXiv e-prints, art. arXiv:2406.14991, June 2024. doi: 10.48550/arXiv.2406.14991.

[58] Ahmed Masry, Mohammed Saidul Islam, Mahir Ahmed, Aayush Bajaj, Firoz Kabir, Aaryaman Kartha, Md Tahmid Rahman Laskar, Mizanur Rahman, Shadikur Rahman, Mehrad Shahmohammadi, et al. Chartqapro: A more diverse and challenging benchmark for chart question answering. arXiv preprint arXiv:2504.05506, 2025.

[59] Mike A Merrill, Alexander G Shaw, Nicholas Carlini, Boxuan Li, Harsh Raj, Ivan Bercovich, Lin Shi, Jeong Yeon Shin, Thomas Walshe, E Kelly Buchanan, et al. Terminal-bench: Benchmarking agents on hard, realistic tasks in command line interfaces. arXiv preprint arXiv:2601.11868, 2026.

[60] Grégoire Mialon, Clémentine Fourrier, Thomas Wolf, Yann LeCun, and Thomas Scialom. Gaia: a benchmark for general ai assistants. In The Twelfth International Conference on Learning Representations, 2023.

[61] Samuel Miserendino, Michele Wang, Tejal Patwardhan, and Johannes Heidecke. SWE-Lancer: Can Frontier LLMs Earn \$1 Million from Real-World Freelance Software Engineering? arXiv e-prints, art. arXiv:2502.12115, February 2025. doi: 10.48550/arXiv.2502.12115.

[62] Arsha Nagrani, Sachit Menon, Ahmet Iscen, Shyamal Buch, Ramin Mehran, Nilpa Jha, Anja Hauth, Yukun Zhu, Carl Vondrick, Mikhail Sirotenko, Cordelia Schmid, and Tobias Weyand. MINERVA: evaluating complex video reasoning. CoRR, abs/2505.00681, 2025.

[63] Junbo Niu, Yifei Li, Ziyang Miao, Chunjiang Ge, Yuanhang Zhou, Qihao He, Xiaoyi Dong, Haodong Duan, Shuangrui Ding, Rui Qian, Pan Zhang, Yuhang Zang, Yuhang Cao, Conghui He, and Jiaqi Wang. Ovo-bench: How far is your video-llms from real-world online video understanding? In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 18902–18913, 2025.

[64] OpenAI. The state of enterprise ai 2025: Adoption, depth, and workflow integration. Technical report, OpenAI, 2025. URL https://openai.com/index/the-state-of-enterprise-ai-2025-report/.

[65] Linke Ouyang, Yuan Qu, Hongbin Zhou, Jiawei Zhu, Rui Zhang, Qunshu Lin, Bin Wang, Zhiyuan Zhao, Man Jiang, Xiaomeng Zhao, et al. Omnidocbench: Benchmarking diverse pdf document parsing with comprehensive annotations. In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 24838–24848, 2025.

[66] Piotr Padlewski, Max Bain, Matthew Henderson, Zhongkai Zhu, Nishant Relan, Hai Pham, Donovan Ong, Kaloyan Aleksiev, Aitor Ormazabal, Samuel Phua, et al. Vibe-eval: A hard evaluation suite for measuring progress of multimodal language models. arXiv preprint arXiv:2405.02287, 2024.

[67] Roni Paiss, Ariel Ephrat, Omer Tov, Shiran Zada, Inbar Mosseri, Michal Irani, and Tali Dekel. Teaching clip to count to ten. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 3170–3180, 2023.

[68] Shishir G. Patil, Huanzhi Mao, Charlie Cheng-Jie Ji, Fanjia Yan, Vishnu Suresh, Ion Stoica, and Joseph E. Gonzalez. The berkeley function calling leaderboard (bfcl): From tool use to agentic evaluation of large language models. In Forty-second International Conference on Machine Learning, 2025.

[69] Thinh Pham, Nguyen Nguyen, Pratibha Zunjare, Weiyuan Chen, Yu-Min Tseng, and Tu Vu. SealQA: Raising the Bar for Reasoning in Search-Augmented Language Models. arXiv e-prints, art. arXiv:2506.01062, June 2025. doi: 10.48550/arXiv.2506.01062.

[70] Long Phan, Alice Gatti, Ziwen Han, Nathaniel Li, Josephina Hu, Hugh Zhang, Chen Bo Calvin Zhang, Mohamed Shaaban, John Ling, Sean Shi, et al. Humanity's last exam. arXiv preprint arXiv:2501.14249, 2025.

[71] Chiara Plizzari, Alessio Tonioni, Yongqin Xian, Achin Kulshrestha, and Federico Tombari. Omnia de egotempo: Benchmarking temporal understanding of multi-modal llms in egocentric videos. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 24129–24138, 2025.

[72] ARC Prize. Arc agi: The \$1 million artificial general intelligence prize. https://arcprize.org/arc-agi/1/, 2024.

[73] Shi Qiu, Shaoyang Guo, Zhuo-Yang Song, Yunbo Sun, Zeyu Cai, Jiashen Wei, Tianyu Luo, Yixuan Yin, Haoxu Zhang, Yi Hu, et al. Phybench: Holistic evaluation of physical perception and reasoning in large language models. arXiv preprint arXiv:2504.16074, 2025.

<!-- page 53 of 78 -->

[74] Shanghaoran Quan, Jiaxi Yang, Bowen Yu, Bo Zheng, Dayiheng Liu, An Yang, Xuancheng Ren, Bofei Gao, Yibo Miao, Yunlong Feng, Zekun Wang, Jian Yang, Zeyu Cui, Yang Fan, Yichang Zhang, Binyuan Hui, and Junyang Lin. CodeElo: Benchmarking Competition-level Code Generation of LLMs with Human-comparable Elo Ratings. arXiv e-prints, art. arXiv:2501.01257, January 2025. doi: 10.48550/arXiv.2501.01257.

[75] Pooyan Rahmanzadehgervi, Logan Bolton, Mohammad Reza Taesiri, and Anh Totti Nguyen. Vision language models are blind. In Proceedings of the Asian Conference on Computer Vision, pages 18–34, 2024.

[76] David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024.

[77] Jonathan Roberts, Mohammad Reza Taesiri, Ansh Sharma, Akash Gupta, Samuel Roberts, Ioana Croitoru, Simion-Vlad Bogolin, Jialu Tang, Florian Langer, Vyas Raina, et al. Zerobench: An impossible visual benchmark for contemporary large multimodal models. arXiv preprint arXiv:2502.09696, 2025.

[78] Ziyao Shangguan, Chuhan Li, Yuxuan Ding, Yanan Zheng, Yilun Zhao, Tesca Fitzgerald, and Arman Cohan. TOMATO: assessing visual temporal reasoning capabilities in multimodal foundation models. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025, 2025.

[79] Manasi Sharma, Chen Bo Calvin Zhang, Chaithanya Bandi, Clinton Wang, Ankit Aich, Huy Nghiem, Tahseen Rabbani, Ye Htet, Brian Jang, Sumana Basu, Aishwarya Balwani, Denis Peskoff, Marcos Ayestaran, Sean M. Hendryx, Brad Kenstler, and Bing Liu. ResearchRubrics: A Benchmark of Prompts and Rubrics For Evaluating Deep Research Agents. arXiv e-prints, art. arXiv:2511.07685, November 2025. doi: 10.48550/arXiv.2511.07685.

[80] Hui Shen, Taiqiang Wu, Qi Han, Yunta Hsieh, Jizhou Wang, Yuyue Zhang, Yuxin Cheng, Zijian Hao, Yuansheng Ni, Xin Wang, et al. Phyx: Does your model have the" wits" for physical reasoning? arXiv preprint arXiv:2505.15929, 2025.

[81] Weikang Shi, Aldrich Yu, Rongyao Fang, Houxing Ren, Ke Wang, Aojun Zhou, Changyao Tian, Xinyu Fu, Yuxuan Hu, Zimu Lu, et al. Mathcanvas: Intrinsic visual chain-of-thought for multimodal mathematical reasoning. arXiv preprint arXiv:2510.14958, 2025.

[82] Samuel Stevens. BioBench: A Blueprint to Move Beyond ImageNet for Scientific ML Benchmarks. arXiv e-prints, art. arXiv:2511.16315, November 2025. doi: 10.48550/arXiv.2511.16315.

[83] Jingqun Tang, Qi Liu, Yongjie Ye, Jinghui Lu, Shu Wei, An-Lan Wang, Chunhui Lin, Hao Feng, Zhen Zhao, Yanjie Wang, et al. Mtvqa: Benchmarking multilingual text-centric visual question answering. In Findings of the Association for Computational Linguistics: ACL 2025, pages 7748–7763, 2025.

[84] DeepConsult Team. DeepConsult: A deep research benchmark for consulting and business queries. https://github.com/youdotcom-oss/ydc-deep-research-evals, 2025. GitHub repository.

[85] Gemini Robotics Team, Saminda Abeyruwan, Joshua Ainslie, Jean-Baptiste Alayrac, Montserrat Gonzalez Arenas, Travis Armstrong, Ashwin Balakrishna, Robert Baruch, Maria Bauza, Michiel Blokzijl, et al. Gemini robotics: Bringing ai into the physical world. arXiv preprint arXiv:2503.20020, 2025.

[86] Minh V. T. Thai, Tue Le, Dung Nguyen Manh, Huy Phan Nhat, and Nghi D. Q. Bui. SWE-EVO: Benchmarking Coding Agents in Long-Horizon Software Evolution Scenarios. arXiv e-prints, art. arXiv:2512.18470, December 2025. doi: 10.48550/arXiv.2512.18470.

[87] Minyang Tian, Luyu Gao, Shizhuo Dylan Zhang, Xinan Chen, Cunwei Fan, Xuefei Guo, Roland Haas, Pan Ji, Kittithat Krongchon, Yao Li, Shengyan Liu, Di Luo, Yutao Ma, Hao Tong, Kha Trinh, Chenyu Tian, Zihan Wang, Bohao Wu, Yanyu Xiong, Shengzhu Yin, Minhui Zhu, Kilian Lieret, Yanxin Lu, Genglin Liu, Yufeng Du, Tianhua Tao, Ofir Press, Jamie Callan, Eliu Huerta, and Hao Peng. SciCode: A Research Coding Benchmark Curated by Scientists. arXiv e-prints, art. arXiv:2407.13168, July 2024. doi: 10.48550/arXiv.2407.13168.

[88] George Tsoukalas, Jasper Lee, John Jennings, Jimmy Xin, Michelle Ying, Yuxing Deng, and Zico Kolter. Putnambench: Evaluating neural theorem-provers on the putnam mathematical competition, 2024. URL https://github.com/trishullab/PutnamBench.

[89] Jordy Van Landeghem, Rubèn Tito, Łukasz Borchmann, Michał Pietruszka, Pawel Joziak, Rafal Powalski, Dawid Jurkiewicz, Mickaël Coustaty, Bertrand Anckaert, Ernest Valveny, et al. Document understanding dataset and evaluation (dude). In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 19528–19540, 2023.

<!-- page 54 of 78 -->

[90] An Vo, Khai-Nguyen Nguyen, Mohammad Reza Taesiri, Vy Tuong Dang, Anh Totti Nguyen, and Daeyoung Kim. Vision language models are biased. arXiv preprint arXiv:2505.23941, 2025.

[91] Fei Wang, Xingyu Fu, James Y Huang, Zekun Li, Qin Liu, Xiaogeng Liu, Mingyu Derek Ma, Nan Xu, Wenxuan Zhou, Kai Zhang, et al. Muirbench: A comprehensive benchmark for robust multi-image understanding. arXiv preprint arXiv:2406.09411, 2024.

[92] Fengxiang Wang, Hongzhen Wang, Zonghao Guo, Di Wang, Yulin Wang, Mingshuo Chen, Qiang Ma, Long Lan, Wenjing Yang, Jing Zhang, et al. Xlrs-bench: Could your multimodal llms understand extremely large ultra-high-resolution remote sensing imagery? In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 14325–14336, 2025.

[93] Haochen Wang, Xiangtai Li, Zilong Huang, Anran Wang, Jiacong Wang, Tao Zhang, Jiani Zheng, Sule Bai, Zijian Kang, Jiashi Feng, et al. Traceable evidence enhanced visual grounded reasoning: Evaluation and methodology. arXiv preprint arXiv:2507.07999, 2025.

[94] Ke Wang, Junting Pan, Weikang Shi, Zimu Lu, Houxing Ren, Aojun Zhou, Mingjie Zhan, and Hongsheng Li. Measuring multimodal mathematical reasoning with math-vision dataset. Advances in Neural Information Processing Systems, 37:95095–95169, 2024.

[95] Weihan Wang, Zehai He, Wenyi Hong, Yean Cheng, Xiaohan Zhang, Ji Qi, Shiyu Huang, Bin Xu, Yuxiao Dong, Ming Ding, and Jie Tang. Lvbench: An extreme long video understanding benchmark. CoRR, abs/2406.08035, 2024.

[96] Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. Advances in Neural Information Processing Systems, 37:95266–95290, 2024.

[97] Zexuan Wang, Chenghao Yang, Yingqi Que, Zhenzhu Yang, Huaqing Yuan, Yiwen Wang, Zhengxuan Jiang, Shengjie Fang, Zhenhe Wu, Zhaohui Wang, Zhixin Yao, Jiashuo Liu, Jincheng Ren, Yuzhen Li, Yang Yang, Jiaheng Liu, Jian Yang, Zaiyuan Wang, Ge Zhang, Zhoufutu Wen, and Wenhao Huang. Worldtravel: A realistic multimodal travel-planning benchmark with tightly coupled constraints, 2026. URL https://arxiv.org/abs/2602.08367.

[98] Zhaowei Wang, Wenhao Yu, Xiyu Ren, Jipeng Zhang, Yu Zhao, Rohit Saxena, Liang Cheng, Ginny Wong, Simon See, Pasquale Minervini, et al. Mmlongbench: Benchmarking long-context vision-language models effectively and thoroughly. arXiv preprint arXiv:2505.10610, 2025.

[99] Zihan Wang, Jiaze Chen, Zhicheng Liu, Markus Mak, Yidi Du, Geonsik Moon, Luoqi Xu, Aaron Tua, Kunshuo Peng, Jiayi Lu, et al. Aethercode: Evaluating llms' ability to win in premier programming competitions. arXiv preprint arXiv:2508.16402, 2025.

[100] Zirui Wang, Mengzhou Xia, Luxi He, Howard Chen, Yitao Liu, Richard Zhu, Kaiqu Liang, Xindi Wu, Haotian Liu, Sadhika Malladi, et al. Charxiv: Charting gaps in realistic chart understanding in multimodal llms. Advances in Neural Information Processing Systems, 37:113569–113697, 2024.

[101] Jason Wei, Zhiqing Sun, Spencer Papay, Scott McKinney, Jeffrey Han, Isa Fulford, Hyung Won Chung, Alex Tachard Passos, William Fedus, and Amelia Glaese. Browsecomp: A simple yet challenging benchmark for browsing agents. arXiv preprint arXiv:2504.12516, 2025.

[102] Ryan Wong, Jiawei Wang, Junjie Zhao, Li Chen, Yan Gao, Long Zhang, Xuan Zhou, Zuo Wang, Kai Xiang, Ge Zhang, et al. Widesearch: Benchmarking agentic broad info-seeking. arXiv preprint arXiv:2508.07999, 2025.

[103] Haoning Wu, Dongxu Li, Bei Chen, and Junnan Li. Longvideobench: A benchmark for long-context interleaved video-language understanding. In Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024.

[104] Zijian Wu, Xiangyan Liu, Xinyuan Zhang, Lingjun Chen, Fanqing Meng, Lingxiao Du, Yiran Zhao, Fanshi Zhang, Yaoqi Ye, Jiawei Wang, Zirui Wang, Jinjie Ni, Yufan Yang, Arvin Xu, and Michael Qizhe Shieh. MCPMark: A Benchmark for Stress-Testing Realistic and Comprehensive MCP Use. arXiv e-prints, art. arXiv:2509.24002, September 2025. doi: 10.48550/arXiv.2509.24002.

[105] XAI. Realworldqa. URL https://huggingface.co/datasets/xai-org/RealworldQA.

[106] Yijia Xiao, Edward Sun, Tianyu Liu, and Wei Wang. Logicvista: Multimodal llm logical reasoning benchmark in visual contexts. arXiv preprint arXiv:2407.04973, 2024.

<!-- page 55 of 78 -->

[107] Weiye Xu, Jiahao Wang, Weiyun Wang, Zhe Chen, Wengang Zhou, Aijun Yang, Lewei Lu, Houqiang Li, Xiaohua Wang, Xizhou Zhu, et al. Visulogic: A benchmark for evaluating visual reasoning in multi-modal large language models. arXiv preprint arXiv:2504.15279, 2025.

[108] Chenghao Yang, Yinbo Luo, Zhoufutu Wen, Qi Chu, Tao Gong, Longxiang Liu, Kaiyuan Zhang, Jianpeng Jiao, Ge Zhang, Wenhao Huang, et al. Mars-bench: A multi-turn athletic real-world scenario benchmark for dialogue evaluation. arXiv preprint arXiv:2505.23810, 2025.

[109] Jian Yang, Wei Zhang, Yizhi Li, Shawn Guo, Haowen Wang, Aishan Liu, Ge Zhang, Zili Wang, Zhoujun Li, Xianglong Liu, and Weifeng Lv. CodeSimpleQA: Scaling Factuality in Code Large Language Models. arXiv e-prints, art. arXiv:2512.19424, December 2025. doi: 10.48550/arXiv.2512.19424.

[110] John Yang, Kilian Lieret, Carlos E. Jimenez, Alexander Wettig, Kabir Khandpur, Yanzhe Zhang, Binyuan Hui, Ofir Press, Ludwig Schmidt, and Diyi Yang. Swe-smith: Scaling data for software engineering agents, 2025. URL https://arxiv.org/abs/2504.21798.

[111] Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng, and Hengshuang Zhao. Depth anything v2. Advances in Neural Information Processing Systems, 37:21875–21911, 2024.

[112] Sihan Yang, Runsen Xu, Yiman Xie, Sizhe Yang, Mo Li, Jingli Lin, Chenming Zhu, Xiaochen Chen, Haodong Duan, Xiangyu Yue, et al. Mmsi-bench: A benchmark for multi-image spatial intelligence. arXiv preprint arXiv:2505.23764, 2025.

[113] Shunyu Yao, Howard Chen, Austin W Hanjie, Runzhe Yang, and Karthik Narasimhan. Collie: Systematic construction of constrained text generation tasks. In 12th International Conference on Learning Representations, ICLR 2024, 2024.

[114] Chun-Hsiao Yeh, Chenyu Wang, Shengbang Tong, Ta-Ying Cheng, Ruoyu Wang, Tianzhe Chu, Yuexiang Zhai, Yubei Chen, Shenghua Gao, and Yi Ma. Seeing from another perspective: Evaluating multi-view understanding in mllms. arXiv preprint arXiv:2504.15280, 2025.

[115] Shuangshuang Ying, Zheyu Wang, Yunjian Peng, Jin Chen, Yuhao Wu, Hongbin Lin, Dingyu He, Siyi Liu, Gengchen Yu, YinZhu Piao, Yuchen Wu, Xin Gui, Zhongyuan Peng, Xin Li, Xeron Du, Libo Qin, YiXin Cao, Ge Zhang, and Stephen Huang. Retrieval-Infused Reasoning Sandbox: A Benchmark for Decoupling Retrieval and Reasoning Capabilities. arXiv e-prints, art. arXiv:2601.21937, January 2026. doi: 10.48550/arXiv.2601.21937.

[116] Fangchen Yu, Haiyuan Wan, Qianjia Cheng, Yuchen Zhang, Jiacheng Chen, Fujun Han, Yulun Wu, Junchi Yao, Ruilizhen Hu, Ning Ding, et al. Hipho: How far are (m) llms from humans in the latest high school physics olympiad benchmark? arXiv preprint arXiv:2509.07894, 2025.

[117] Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, et al. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9556–9567, 2024.

[118] Xiang Yue, Tianyu Zheng, Yuansheng Ni, Yubo Wang, Kai Zhang, Shengbang Tong, Yuxuan Sun, Botao Yu, Ge Zhang, Huan Sun, et al. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15134–15186, 2025.

[119] Daoguang Zan, Zhirong Huang, Wei Liu, Hanwu Chen, Linhao Zhang, Shulin Xin, Lu Chen, Qi Liu, Xiaojian Zhong, Aoyan Li, et al. Multi-swe-bench: A multilingual benchmark for issue resolving. arXiv preprint arXiv:2504.02605, 2025.

[120] Xiangyu Zeng, Kefan Qiu, Qingyu Zhang, Xinhao Li, Jing Wang, Jiaxin Li, Ziang Yan, Kun Tian, Meng Tian, Xinhai Zhao, Yi Wang, and Limin Wang. Streamforest: Efficient online video understanding with persistent event memory. CoRR, abs/2509.24871, 2025.

[121] Chenchen Zhang, Yuhang Li, Can Xu, Jiaheng Liu, Ao Liu, Changzhi Zhou, Ken Deng, Dengpeng Wu, Guanhua Huang, Kejiao Li, Qi Yi, Ruibin Xiong, Shihui Hu, Yue Zhang, Yuhao Jiang, Zenan Xu, Yuanxing Zhang, Wiggin Zhou, Chayse Zhou, and Fengzong Lian. ArtifactsBench: Bridging the Visual-Interactive Gap in LLM Code Generation Evaluation. arXiv e-prints, art. arXiv:2507.04952, July 2025. doi: 10.48550/arXiv.2507.04952.

<!-- page 56 of 78 -->

[122] Kaiyuan Zhang, Chenghao Yang, Zhoufutu Wen, Sihang Yuan, Qiuyue Wang, Chaoyi Huang, Guosheng Zhu, He Wang, Huawenyu Lu, Jianing Wen, et al. Mme-cc: A challenging multi-modal evaluation benchmark of cognitive capacity. arXiv preprint arXiv:2511.03146, 2025.

[123] Qinyan Zhang, Xinping Lei, Ruijie Miao, Yu Fu, Haojie Fan, Le Chang, Jiafan Hou, Dingling Zhang, Zhongfei Hou, Ziqiang Yang, et al. Inverse ifeval: Can llms unlearn stubborn training conventions to follow real instructions? arXiv preprint arXiv:2509.04292, 2025.

[124] Xinchen Zhang, Xiaoying Zhang, Youbin Wu, Yanbin Cao, Renrui Zhang, Ruihang Chu, Ling Yang, and Yujiu Yang. Generative universal verifier as multimodal meta-reasoner. arXiv preprint arXiv:2510.13804, 2025.

[125] Yilun Zhao, Haowei Zhang, Lujing Xie, Tongyan Hu, Guo Gan, Yitao Long, Zhiyuan Hu, Weiyuan Chen, Chuhan Li, Zhijian Xu, Chengye Wang, Ziyao Shangguan, Zhenwen Liang, Yixin Liu, Chen Zhao, and Arman Cohan. MMVU: measuring expert-level multi-discipline video understanding. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2025, Nashville, TN, USA, June 11-15, 2025, pages 8475–8489, 2025.

[126] Zhicheng Zheng, Xin Yan, Zhenfang Chen, Jingzhou Wang, Qin Zhi Eddie Lim, Joshua B. Tenenbaum, and Chuang Gan. Contphy: Continuum physical concept learning and reasoning from videos. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024, volume 235 of Proceedings of Machine Learning Research, pages 61526–61558, 2024.

[127] Zihan Zheng, Zerui Cheng, Zeyu Shen, Shang Zhou, Kaiyuan Liu, Hansen He, Dongruixuan Li, Stanley Wei, Hangyi Hao, Jianzhu Yao, et al. Livecodebench pro: How do olympiad medalists judge llms in competitive programming? arXiv preprint arXiv:2506.11928, 2025.

[128] Enshen Zhou, Jingkun An, Cheng Chi, Yi Han, Shanyu Rong, Chi Zhang, Pengwei Wang, Zhongyuan Wang, Tiejun Huang, Lu Sheng, et al. Roborefer: Towards spatial referring with reasoning in vision-language models for robotics. arXiv preprint arXiv:2506.04308, 2025.

[129] Junting Zhou, Jin Chen, Linfeng Hao, Denghui Cao, Zheyu Wang, Qiguang Chen, Chaoyou Fu, Jiaze Chen, Yuchen Wu, Ge Zhang, Mingxuan Wang, Wenhao Huang, and Tong Yang. Babe: Biology arena benchmark, 2026. URL https://arxiv.org/abs/2602.05857.

[130] Peilin Zhou, Bruce Leon, Xiang Ying, Can Zhang, Yifan Shao, Qichen Ye, Dading Chong, Zhiling Jin, Chenxuan Xie, Meng Cao, et al. Browsecomp-zh: Benchmarking web browsing ability of large language models in chinese. arXiv preprint arXiv:2504.19314, 2025.

[131] Yuhao Zhou, Yiheng Wang, Xuming He, Ruoyao Xiao, Zhiwei Li, Qiantai Feng, Zijie Guo, Yuejin Yang, Hao Wu, Wenxuan Huang, et al. Scientists' first exam: Probing cognitive abilities of mllm via perception, understanding, and reasoning. arXiv preprint arXiv:2506.10521, 2025.

[132] Liya Zhu, Peizhuang Cong, Aowei Ji, Wenya Wu, Jiani Hou, Chunjie Wu, Xiang Gao, Jingkai Liu, Zhou Huan, Xuelei Sun, et al. Lpfqa: A long-tail professional forum-based benchmark for llm evaluation. arXiv preprint arXiv:2511.06346, 2025.

[133] Chengke Zou, Xingang Guo, Rui Yang, Junyu Zhang, Bin Hu, and Huan Zhang. Dynamath: A dynamic visual benchmark for evaluating mathematical reasoning robustness of vision language models. arXiv preprint arXiv:2411.00836, 2024.

<!-- page 57 of 78 -->

## A FreeCAD Parametric Modeling: GUI Agent Case Study

A FreeCAD 参数化建模: GUI Agent 案例研究

### A.1 Task Overview

A.1 任务概述

Task: Using FreeCAD 1.0.2, create a parametric solid model consisting of:

任务: 用 FreeCAD 1.0.2 创建一个参数化实体模型, 包括:

1. A cylindrical base: Diameter 80mm, Height 40mm

1. 一个圆柱底座: 直径 80mm, 高 40mm

2. A rectangular boss on top: $50\mathrm{mm} \times 30\mathrm{mm} \times 20\mathrm{mm}$

2. 顶部一个矩形凸台: $50\mathrm{mm} \times 30\mathrm{mm} \times 20\mathrm{mm}$

Goal: Calculate and verify the final solid's volume and surface area using Python scripting.

目标: 用 Python 脚本计算并验证最终实体的体积和表面积.

Environment: FreeCAD 1.0.2 on Ubuntu (Chinese interface, unit: mm)

环境: Ubuntu 上的 FreeCAD 1.0.2(中文界面, 单位: mm)

### A.2 Complete Workflow Visualization

A.2 完整工作流可视化

Figure 19 illustrates the key milestones of the 96-step modeling process, from software initialization to programmatic verification. The agent successfully navigated through multiple interface challenges, demonstrating robust error recovery and systematic problem-solving capabilities.

Figure 19 展示了这次 96 步建模过程的关键里程碑, 从软件初始化到程序化验证. agent 成功穿过了多个界面难关, 展现出稳健的错误恢复和系统化的解题能力.

![Image block](images/p57-figure-19-key-milestones-in-the-freecad-modeling.png)

Figure 19 Key milestones in the FreeCAD modeling workflow. The workflow consists of nine critical phases: (1) Software launch and configuration, (2) Sketch creation with geometric constraints, (3) First pad extrusion, (4) Top face selection, (5-6) Secondary feature creation, (7) Surface selection for scripting, (8) Python console execution, and (9) Final verification results (Volume: 231061.93 mm³, Surface Area: 23306.19 mm²).

图 19 FreeCAD 建模工作流的关键里程碑. 工作流包括九个关键阶段: (1) 软件启动与配置, (2) 带几何约束的草图创建, (3) 第一次 Pad 拉伸, (4) 顶面选择, (5-6) 第二个特征的创建, (7) 为脚本选择表面, (8) Python 控制台执行, (9) 最终验证结果(Volume: 231061.93 mm³, Surface Area: 23306.19 mm²).

> **对一下:** Figure 19 给的体积和表面积能手算复核吗? 「6 位小数精度」又体现在哪?
> 能. 圆柱体积 $\pi \times 40^2 \times 40 \approx 201061.93$, 凸台体积 $50 \times 30 \times 20 = 30000$, 合计 231061.93 mm³, 与 Figure 19 一致. 表面积: 圆柱全表面 $2\pi \times 40^2 + 2\pi \times 40 \times 40 \approx 20106.19$, 凸台放在顶面上, 底面遮住的面积与自己的顶面相互抵消, 只新增四个侧面 $2 \times (50+30) \times 20 = 3200$, 合计 23306.19 mm², 也一致. 但 A.4 说 「6 decimal places via Python API」, Figure 19 和 A.3 的最终输出却都只显示 2 位小数, 文中看不到那 6 位.

### A.3 Detailed Execution Trace

A.3 详细执行轨迹

Below we present key reasoning traces from selected critical steps, highlighting the agent's decision-making process and error recovery strategies.

下面给出若干关键步骤的推理轨迹, 突出 agent 的决策过程和错误恢复策略.

<!-- page 58 of 78 -->

#### Phase 1: Software Initialization (Steps 1-8)

阶段 1: 软件初始化(第 1-8 步)

##### Steps 1-3: Launching FreeCAD

第 1-3 步: 启动 FreeCAD

Step 1: First need to open FreeCAD software. On Ubuntu system, should click the bottom-left nine-grid icon (applications menu) to find and launch FreeCAD. Current desktop sidebar doesn't show FreeCAD icon, so first open the application list.

第 1 步: 首先要打开 FreeCAD. 在 Ubuntu 上, 应点击左下角的九宫格图标(应用菜单)找到并启动 FreeCAD. 当前桌面侧栏没有显示 FreeCAD 图标, 所以先打开应用列表.

Step 2-3: Previous clicks on the nine-grid icon had no response, possibly due to inaccurate click position. Need to click again at the exact center of the icon to trigger the application list expansion.

第 2-3 步: 之前点击九宫格图标没有反应, 可能是点击位置不准. 需要在图标正中心再点一次, 触发应用列表展开.

##### Steps 4-8: Language Configuration

第 4-8 步: 语言配置

Step 4: Now the application list shows the FreeCAD icon with red and blue "F" logo. Need to double-click it to launch FreeCAD software and begin the modeling task.

第 4 步: 应用列表中出现了带红蓝 「F」 标志的 FreeCAD 图标. 需要双击它启动 FreeCAD, 开始建模任务.

Step 6-8: FreeCAD startup complete, showing welcome interface. Need to set language to Chinese. Click Language dropdown → Select Simplified Chinese → Click Done to enter software.

第 6-8 步: FreeCAD 启动完成, 显示欢迎界面. 需要把语言设为中文. 点击 Language 下拉框 → 选择简体中文 → 点击 Done 进入软件.

#### Phase 2: Base Sketch Creation (Steps 9-30)

阶段 2: 底座草图创建(第 9-30 步)

##### Steps 9-14: Creating Sketch on XY Plane

第 9-14 步: 在 XY 平面上创建草图

Step 9-11: On the start page's project card area, click Parametric Part icon to create new parametric solid project. Then click "Create Body" in the task panel.

第 9-11 步: 在起始页的项目卡片区域, 点击 Parametric Part 图标新建参数化实体项目. 然后在任务面板中点击 「Create Body」.

Step 12-14: Click Create Sketch in the left task panel → In the "Select Attachment" dialog, choose XY-Plane001 (Base Plane) → Click OK to enter sketch editing.

第 12-14 步: 在左侧任务面板点击 Create Sketch → 在 「Select Attachment」 对话框中选择 XY-Plane001 (Base Plane) → 点击 OK 进入草图编辑.

##### Steps 22-30: Circle Tool Selection Challenge

第 22-30 步: 圆工具选择的难关

Step 22-24: Error recovery in progress. After multiple failed attempts clicking wrong tools (point tool, three-point arc tool), need to locate the correct circle creation tool. The icon is a simple circle shape in the sketch toolbar.

第 22-24 步: 正在进行错误恢复. 多次误点了错误的工具(点工具, 三点圆弧工具)之后, 需要找到正确的画圆工具. 它的图标是草图工具栏上一个简单的圆形.

Step 25-27: Previous icon clicks were unsuccessful. Changed strategy: Use menu bar → Sketcher → Sketch Geometry → Circle by Center to accurately select the tool, avoiding icon confusion.

第 25-27 步: 之前点击图标没有成功. 换策略: 用菜单栏 → Sketcher → Sketch Geometry → Circle by Center 准确选中工具, 避免图标混淆.

Step 28-30: Circle tool successfully selected. Click at origin to place circle center, then click to the right to place circle edge, drawing the circular sketch. Press Esc to exit drawing command.

第 28-30 步: 成功选中画圆工具. 在原点点击放置圆心, 再向右点击放置圆的边缘, 画出圆形草图. 按 Esc 退出绘制命令.

#### Phase 3: Dimensional Constraints (Steps 31-39)

阶段 3: 尺寸约束(第 31-39 步)

##### Steps 31-36: Constraining Circle Diameter

第 31-36 步: 约束圆的直径

Step 31-33: Need to select this circle for dimension annotation. Direct clicking on circle edge failed to select. Changed approach: Click 1-Circle in the Elements panel (left sidebar) to select, which is more reliable.

第 31-33 步: 需要选中这个圆来标注尺寸. 直接点圆的边缘没能选中. 换方法: 在 Elements 面板(左侧栏)点击 1-Circle 来选中, 这样更可靠.

Step 34-36: After selecting circle through element list, right-click to open context menu → Click "Dimension" → Select Constrain Diameter from submenu.

第 34-36 步: 通过元素列表选中圆之后, 右键打开上下文菜单 → 点击 「Dimension」 → 在子菜单中选择 Constrain Diameter.

Step 37-39: "Insert Diameter" dialog appeared. Need to change diameter value to 80mm. Type 80 to replace the previous 47.47mm value. Click OK to confirm this dimension constraint, completing the circle sketch dimension constraint.

第 37-39 步: 弹出 「Insert Diameter」 对话框. 需要把直径改成 80mm. 输入 80 替换之前的 47.47mm. 点击 OK 确认这个尺寸约束, 完成圆形草图的尺寸约束.

<!-- page 59 of 78 -->

Phase 4: First Pad Extrusion (Steps 40-52)

阶段 4: 第一次 Pad 拉伸(第 40-52 步)

![Image block](images/p59-phase-5-rectangular-sketch-creation-steps-53-78.png)

Phase 5: Rectangular Sketch Creation (Steps 53-78)

阶段 5: 矩形草图创建(第 53-78 步)

Step 53-55: According to procedure step 20, need to click and select the base's top face in 3D view. Then click "Create Sketch" to start drawing rectangular sketch on this face.
Step 56-58: Click rectangle tool, click once in upper-left area of canvas to place first corner point, click in lower-right area to place second corner, generating rectangle. Press Esc to exit rectangle drawing command.

第 53-55 步: 按流程第 20 步, 需要在3D 视图中点击选中底座的顶面. 然后点击 「Create Sketch」, 在该面上开始画矩形草图.
第 56-58 步: 点击矩形工具, 在画布左上区域点一次放置第一个角点, 在右下区域点击放置第二个角点, 生成矩形. 按 Esc 退出矩形绘制命令.

Step 59-64: Horizontal dimension: Select rectangle's upper horizontal edge $\rightarrow$ Right-click $\rightarrow$ "Horizontal Distance Constraint" $\rightarrow$ Enter 50mm.

第 59-64 步: 水平尺寸: 选中矩形上方的水平边 $\rightarrow$ 右键 $\rightarrow$ 「Horizontal Distance Constraint」 $\rightarrow$ 输入 50mm.

Step 76-77: "Insert Length" dialog appeared. Type 30 to set vertical length to 30mm. Click OK to confirm.

第 76-77 步: 弹出 「Insert Length」 对话框. 输入 30, 把竖直长度设为 30mm. 点击 OK 确认.

Phase 6: Second Pad Extrusion (Steps 79–82)

阶段 6: 第二次 Pad 拉伸(第 79–82 步)

| Steps 79-82: Creating Rectangular Boss |
| --- |
| Step 79-81: In task panelclick Pad, wait for parameters dialog to load. Change length from default 10.00mm to20mm.Step 82: Click OK to confirm,generating second pad. At this point, compound solid modeling is complete. |

Phase 7: Programmatic Verification (Steps 83-96)

阶段 7: 程序化验证(第 83-96 步)

<!-- page 60 of 78 -->

```txt
Step 88-95: Sequentially input four Python commands in console:
Command 1: obj = Gui.Selection.getSelection()[0] — Retrieve selected object
Command 2: vol = obj.Shape.Volume — Calculate volume
Command 3: area = obj.Shape.Area — Calculate surface area
Command 4: (vol, area) — Display results
Step 96 – Final Results:
    Volume = 231061.93 mm³
    Surface Area = 23306.19 mm²
Task completed successfully! Modeling finished and final entity's volume and surface area values read.
```

### A.4 Agent Performance Analysis

A.4 Agent 表现分析

#### Execution Statistics

执行统计

\- Total Steps: 96 sequential operations

\- 总步数: 96 个顺序操作

\- Error Recovery Instances: 8 failed tool selections, all successfully recovered

\- 错误恢复次数: 8 次工具选择失败, 全部成功恢复

\- UI Navigation Strategy: Shifted from toolbar icons to menu-based navigation after failures

\- UI 导航策略: 失败后从工具栏图标改为菜单导航

\- Element Selection Strategy: Adopted Elements panel method after direct clicking proved unreliable

\- 元素选择策略: 直接点击被证明不可靠后, 改用 Elements 面板

\- Verification Precision: 6 decimal places via Python API (vs. typical 2 decimals from GUI inspection)

\- 验证精度: 通过 Python API 达到 6 位小数(GUI 查看通常只有 2 位)

#### Key Findings

主要发现

1. Adaptive Error Recovery: When direct toolbar icon clicking failed (Steps 22-27, 44-47), the agent systematically switched to menu-based navigation, demonstrating flexible problem-solving rather than repetitive failed attempts.

1. 自适应错误恢复: 直接点击工具栏图标失败时(第 22-27 步, 第 44-47 步), agent 系统地切换到菜单导航, 体现出灵活解题, 而不是反复重试失败的动作.

2. Robust Selection Strategy: After encountering unreliable direct geometry clicking (Steps 31-33, 65-73), the agent learned to consistently use the Elements panel as a more reliable selection mechanism.

2. 稳健的选择策略: 在直接点击几何体不可靠之后(第 31-33 步, 第 65-73 步), agent 学会了始终使用 Elements 面板这一更可靠的选择机制.

3. System Response Awareness: The agent exhibited patience with UI delays by using explicit wait commands (Steps 42, 50, 70), preventing premature actions that could derail the workflow.

3. 对系统响应的感知: agent 用显式等待命令耐心应对 UI 延迟(第 42, 50, 70 步), 避免可能打乱工作流的过早操作.

4. Scriptable Verification: Rather than relying on visual GUI property inspection, the agent employed FreeCAD's Python API for precise numerical verification, yielding higher-precision results critical for engineering applications.

4. 可脚本化的验证: agent 没有依赖 GUI 属性面板的目视检查, 而是用 FreeCAD 的 Python API 做精确数值验证, 得到对工程应用很关键的更高精度结果.

### A.5 Workflow Summary

A.5 工作流总结

Table 16 Key operations and parameters in the modeling workflow

表 16 建模工作流中的关键操作和参数

| Steps | Operation | Critical Parameters / Challenges |
| --- | --- | --- |
| 1-8 | Software Launch | Language config: Simplified Chinese, Units: mm |
| 9-16 | Base Sketch Setup | XY plane selection, "Circle by Center" tool |
| 17-39 | Dimension Constraint | 80mm diameter, Element panel selection required |
| 40-52 | First Pad | 40mm height, Menu navigation after toolbar failures |
| 53-58 | Top Face Sketch | Face selection in 3D view, rectangle tool |
| 59-78 | Rectangle Constraints | 50mm × 30mm, Vertical dimension via element list |
| 79-82 | Second Pad | 20mm height, Completing compound geometry |
| 83-96 | Python Verification | Shape.Volume &amp; Shape.Area APIs, 6-digit precision |

<!-- page 61 of 78 -->

### A.6 Lessons for GUI Agent Design

A.6 对 GUI Agent 设计的启示

This case study reveals several design considerations for future GUI automation systems:

这个案例揭示了未来 GUI 自动化系统的几点设计考量:

1. Icon Ambiguity: CAD toolbars contain visually similar icons (circle, arc, point). Agents would benefit from OCR-based tooltip reading or enhanced icon classification models.

1. 图标歧义: CAD 工具栏中有外观相似的图标(圆, 圆弧, 点). agent 可以借助基于 OCR 的提示文字读取或更强的图标分类模型.

2. Selection Reliability: Direct geometric entity clicking proves unreliable in complex 3D environments. Structured selection via hierarchical element trees provides more robust alternatives.

2. 选择可靠性: 在复杂3D 环境中直接点击几何实体并不可靠. 通过层级元素树做结构化选择是更稳健的替代.

3. Fallback Strategies: Menu-based navigation, while slower, offers unambiguous tool access. Agents should maintain hybrid strategies (toolbar-first, menu-fallback).

3. 回退策略: 菜单导航虽然慢, 但能无歧义地找到工具. agent 应保持混合策略(优先工具栏, 菜单兜底).

4. Verification Paradigm: Programmatic verification via scripting APIs provides superior accuracy over visual GUI inspection, particularly for numerical engineering tasks.

4. 验证范式: 通过脚本 API 做程序化验证比目视检查 GUI 精度更高, 数值型工程任务尤其如此.

*范围说明: Appendix B 是网络安全类(密码分析)案例, 按本文件范围只记评测名称, 分数与阈值, 不转写做法和案例. 评测: TerminalBench 2.0 密码分析任务. 结果: 在 32 组已知样本上 100% 校验通过, 100 条目标数据全部处理, 原文报告总耗时 22.6 sec. 原文未给阈值. Table 17 与 Table 18 属于做法细节, 一并不转写.*

<!-- page 62 of 78 -->

<!-- page 63 of 78 -->

<!-- page 64 of 78 -->

<!-- page 65 of 78 -->

<!-- page 66 of 78 -->

<!-- page 67 of 78 -->

## C NL2Repo: Python-Decouple Library Implementation

C NL2Repo: Python-Decouple 库实现

### C.1 Task Overview

C.1 任务概述

Benchmark: NL2Repo - Repository-level code generation from natural language specification
Task: Implement a complete Python configuration management library from a 39KB natural language specification document (start.md).

基准: NL2Repo, 从自然语言规格生成仓库级代码
任务: 依据一份 39KB 的自然语言规格文档(start.md), 实现一个完整的 Python 配置管理库.

#### Requirements:

需求:

\- Multi-source configuration reading (environment variables, .env files, .ini files)

\- 多源配置读取(环境变量, .env 文件, .ini 文件)

\- Intelligent type conversion system (bool, int, CSV, custom casters)

\- 智能类型转换系统(bool, int, CSV, 自定义转换器)

\- Validation mechanisms (Choices validator, default values)

\- 校验机制(Choices 校验器, 默认值)

\- Docker secrets support for containerized deployments

\- 支持容器化部署的 Docker secrets

\- Complete project structure with setup.py, tests, documentation

\- 完整的项目结构, 含 setup.py, 测试和文档

\- API must match specification: from decouple import AutoConfig, Csv, Choices...

\- API 必须符合规格: from decouple import AutoConfig, Csv, Choices...

Challenge: Transform verbose requirements into production-ready, installable Python package with 100% test coverage.

挑战: 把冗长的需求变成可用于生产, 可安装且测试覆盖率 100% 的 Python 包.

<!-- page 68 of 78 -->

### C.2 Agent Execution Trace

C.2 Agent 执行轨迹

#### Step 1: Specification Analysis

第 1 步: 规格分析

First, explore the workspace to understand project requirements. The start.md file contains comprehensive specifications including: - API interfaces with exact function signatures - File structure requirements (decouple.py, setup.py, README.rst, etc.) - Type conversion logic with specific examples (.env parsing rules, quote handling) - Test cases embedded in documentation

首先探索工作区, 理解项目需求. start.md 包含完整的规格, 包括: - 带精确函数签名的 API 接口 - 文件结构要求(decouple.py, setup.py, README.rst 等) - 带具体示例的类型转换逻辑(.env 解析规则, 引号处理) - 嵌在文档里的测试用例

Action: view /openhands/workspace/start.md to extract requirements systematically.

动作: 查看 /openhands/workspace/start.md, 系统地提取需求.

Key insight: Document contains code snippets showing expected behavior — these serve as implicit test specifications.

关键洞察: 文档中包含展示预期行为的代码片段, 这些片段就是隐式的测试规格.

#### Step 2-3: Core Module Implementation

第 2-3 步: 核心模块实现

Priority: Create decouple.py first as it's the heart of the library.

优先级: 先创建 decouple.py, 它是整个库的核心.

##### Critical decisions made:

做出的关键决策:

1. Boolean conversion: Must handle edge case of empty strings $\rightarrow$ False (not ValueError)

1. 布尔转换: 必须处理空字符串的边界情况 $\rightarrow$ False(而不是 ValueError)

2. ConfigParser compatibility: Python 3.12 doesn't have read\_config, use read\_file() instead

2. ConfigParser 兼容: Python 3.12 没有 read\_config, 改用 read\_file()

3. Quote stripping in .env parser: Only strip matching quotes at start/end: v[0] == v[-1] in [","", ],

3. .env 解析器中的引号剥离: 只剥离首尾成对的引号: v[0] == v[-1] in [「,」", ],

4. Docker secrets: Handle missing directory gracefully with os.path.exists() check

4. Docker secrets: 用 os.path.exists() 检查, 优雅处理目录缺失

Action: Implement 300+ lines covering RepositoryEnv, RepositoryIni, RepositorySecret, Config, AutoConfig, Csv, Choices classes.

动作: 实现 300 多行代码, 覆盖 RepositoryEnv, RepositoryIni, RepositorySecret, Config, AutoConfig, Csv, Choices 等类.

Challenge encountered: Initial implementation failed test — empty string strtobool('') raised ValueError instead of returning False. Fixed by adding early return.

遇到的问题: 初版实现没通过测试, 空字符串 strtobool('') 抛出 ValueError 而不是返回 False. 通过加一个提前返回修复.

#### Step 4-6: Package Configuration & Testing

第 4-6 步: 打包配置与测试

##### Setup infrastructure:

搭建基础设施:

\- setup.py: Configured as installable package with metadata

\- setup.py: 配置为带元数据的可安装包

\- README.rst: Comprehensive documentation with usage examples

\- README.rst: 带使用示例的完整文档

\- .gitignore, .editorconfig, .travis.yml: Development tooling

\- .gitignore, .editorconfig, .travis.yml: 开发工具配置

\- tests/test\_decouple.py: 22 test cases covering all functionality

\- tests/test\_decouple.py: 覆盖全部功能的 22 个测试用例

##### Test-driven iteration:

测试驱动的迭代:

1. Run pytest $\rightarrow 1$ failure (empty string boolean conversion)

1. 运行 pytest $\rightarrow 1$ 个失败(空字符串布尔转换)

2. Fix strtobool() to handle empty strings

2. 修改 strtobool(), 处理空字符串

3. Run pytest $\rightarrow 4$ errors (fixture scope issue)

3. 运行 pytest $\rightarrow 4$ 个错误(fixture 作用域问题)

4. Move env\_file fixture to module scope

4. 把 env\_file fixture 移到模块作用域

5. Run pytest → All 22 tests pass

5. 运行 pytest → 22 个测试全部通过

Action: pip install -e . to verify package installability.

动作: 运行 pip install -e . 验证包可以安装.

### C.3 Key Agent Capabilities Demonstrated

C.3 展现出的关键 Agent 能力

1. Specification Parsing: Extracted structured requirements from 39KB natural language document, identifying implicit constraints (e.g., Python 3.12 compatibility issues).

1. 规格解析: 从 39KB 的自然语言文档中提取结构化需求, 识别出隐含约束(如 Python 3.12 兼容问题).

2. Error-Driven Development: Systematically debugged ImportError (read\_config not available) by consulting Python 3.12 ConfigParser API documentation and adapting implementation.

2. 错误驱动开发: 查阅 Python 3.12 ConfigParser 的 API 文档并调整实现, 系统地调试了 ImportError(read\_config 不可用).

3. Backwards Compatibility: Ensured API exports work from both expected locations using from qtlog import hide\_qt\_warning # noqa: F401 pattern.

3. 向后兼容: 用 from qtlog import hide\_qt\_warning # noqa: F401 的写法, 确保 API 从两个预期位置都能导出.

4. Production Quality: Generated complete package infrastructure including LICENSE (MIT), MANIFEST.in, setup.cfg for PyPI distribution.

4. 生产级质量: 生成了完整的包基础设施, 包括 LICENSE(MIT), MANIFEST.in, 以及用于 PyPI 发布的 setup.cfg.

<!-- page 69 of 78 -->

### C.4 Performance Metrics

C.4 表现指标

Table 19 Implementation statistics

表 19 实现统计

> **想:** Table 19 的首轮通过率 77% (17/22) 和正文的修复过程对得上吗? 100% 覆盖率从哪来?
> 分母对得上: 17/22≈77.3%, 差的 5 个正好是 C.2 里「1 个失败 + 4 个错误」. 但 § 5.1.2 列出的修复有五项(缺 pytest 依赖, read\_file, 空字符串布尔, fixture 作用域, flat/choices 参数名), C.2 只提到其中两项, 两处叙述的粒度不同. 「Test coverage 100%」 在全文找不到任何覆盖率工具的输出, 而且 22 个测试是模型自己写的, 用自己写的测试量出的覆盖率, 与 NL2Repo 用基准自带测试计分(Table 13 的 NL2Repo 两行)不是一回事. 顺带一提, C.3 第 3 条出现了 qtlog 的写法, 那是 Appendix D 的内容, 像是串到了这里.

| Metric | Value |
| --- | --- |
| Files created | 11 |
| Lines of code (decouple.py) | 323 |
| Test cases | 22 |
| Test coverage | 100% |
| Execution time | 4.5 seconds |
| Pass rate (first run) | 77% (17/22) |
| Pass rate (final) | 100% (22/22) |

Final Validation:

最终验证:

```txt
$ python -c "from decouple import config; \
  print('DEBUG =', config('DEBUG', default=False, cast=bool))"
Success! DEBUG = False

$ pip install -e .
Successfully installed python-decouple-3.8
```

Task Completed: Fully functional, installable Python package matching all specifications.

任务完成: 一个功能完整, 可安装, 符合全部规格的 Python 包.

<!-- page 70 of 78 -->

## D SWE-bench Pro: Qt Logging Module Refactoring

D SWE-bench Pro: Qt 日志模块重构

### D.1 Task Overview

D.1 任务概述

Benchmark: SWE-bench Pro - Real-world software engineering task from qutebrowser repository
Issue: Relocate hide\_qt\_warning function and QtWarningFilter class from utils/log.py to utils/qtlog.py while maintaining backwards compatibility.

基准: SWE-bench Pro, 来自 qutebrowser 仓库的真实软件工程任务
Issue: 把 hide\_qt\_warning 函数和 QtWarningFilter 类从 utils/log.py 迁到 utils/qtlog.py, 同时保持向后兼容.

Constraints:

约束:

\- Must preserve identical filtering behavior (pattern matching, whitespace handling)

\- 必须保持完全相同的过滤行为(模式匹配, 空白处理)

\- Existing code using from log import hide\_qt\_warning must continue working

\- 使用 from log import hide\_qt\_warning 的现有代码必须继续可用

\- Tests must be relocated to appropriate module (test\_qtlog.py)

\- 测试必须迁到对应的模块(test\_qtlog.py)

\- No regression in warning suppression functionality

\- 警告屏蔽功能不得回归

Success criteria: All tests pass, existing usage patterns unaffected, code properly organized.

成功标准: 全部测试通过, 现有用法不受影响, 代码组织合理.

### D.2 Agent Execution Trace

D.2 Agent 执行轨迹

#### Step 1: Repository Exploration

第 1 步: 仓库探索

```txt
Action: Survey codebase structure to understand dependencies.
find /app -name "*.py" | grep -E '(log|test.*log)'
Findings:
    • qutebrowser/utils/log.py (484 lines) — contains QtWarningFilter class
    • qutebrowser/utils/qtlog.py (214 lines) — Qt-specific logging utilities
    • tests/unit/utils/test_log.py (406 lines) — includes TestHideQtWarning class
    • tests/unit/utils/test_qtlog.py (53 lines) — minimal test coverage
    • qutebrowser/browser/qtnetworkdownloads.py — uses log.hide_qt_warning()
Insight: Migration requires 3 coordinated changes to maintain consistency.
```

<!-- page 71 of 78 -->

```txt
Step 2: Function Migration
```

Move QtWarningFilter class:

迁移 QtWarningFilter 类:

```python
# Add to qtlog.py (lines 31-46)
class QtWarningFilter(logging.Filter):
    def __init__(self, pattern: str) -> None:
        super().__init__()
        self._pattern = pattern

    def filter(self, record: logging.LogRecord) -> bool:
        do_log = not record.msg.strip().startswith(self._pattern)
        return do_log
```

Move hide\_qt\_warning context manager:

迁移 hide\_qt\_warning 上下文管理器:

```python
# Add to qtlog.py (lines 49-58)
@contextlib.contextmanager
def hide_qt_warning(pattern: str, logger: str = 'qt') -> Iterator[None]:
    log_filter = QtWarningFilter(pattern)
    logger_obj = logging.getLogger(logging)
    logger_obj.addFilter(log_filter)
    try:
        yield
    finally:
        logger_obj.removeFilter(log_filter)
```

Critical detail: Preserve exact whitespace handling logic: record.msg.strip().startswith() enables matching with leading/trailing spaces.

关键细节: 保留精确的空白处理逻辑: record.msg.strip().startswith() 让带首尾空格的消息也能匹配.

```txt
Step 3: Backwards Compatibility
```

Problem: Existing code imports from log module:

问题: 现有代码从 log 模块导入:

```python
from qutebrowser.utils import log
with log.hide_qt_warning(...):
```

Solution: Re-export from log.py for backwards compatibility:

方案: 在 log.py 中重新导出, 保持向后兼容:

```python
# In log.py (line 35)
from qutebrowser.utils.qtlog import hide_qt_warning, QtWarningFilter # noqa:
    F401
```

Deleted from log.py:

从 log.py 中删除:

<!-- page 72 of 78 -->

#### Step 4: Test Migration

第 4 步: 测试迁移

Move TestHideQtWarning class:

迁移 TestHideQtWarning 类:

\- Source: test\_log.py lines 343-369 (27 lines)

\- 来源: test\_log.py 第 343-369 行(27 行)

\- Destination: test\_qtlog.py lines 32-58

\- 目标: test\_qtlog.py 第 32-58 行

\- Updated references: log.hide\_qt\_warning → qtlog.hide\_qt\_warning

\- 更新引用: log.hide\_qt\_warning → qtlog.hide\_qt\_warning

##### Test coverage preserved:

保留的测试覆盖:

1. test\_unfiltered: Non-matching patterns pass through

1. test\_unfiltered: 不匹配的模式正常通过

2. test\_filtered[Hello]: Exact match suppressed

2. test\_filtered[Hello]: 完全匹配被屏蔽

3. test\_filtered[Hello World]: Prefix match suppressed

3. test\_filtered[Hello World]: 前缀匹配被屏蔽

4. test\_filtered[ Hello World ]: Whitespace handling works

4. test\_filtered[ Hello World ]: 空白处理有效

Deleted from test\_log.py: Lines 343-369 (TestHideQtWarning class removed)

从 test\_log.py 删除: 第 343-369 行(移除 TestHideQtWarning 类)

#### Step 5: Validation

第 5 步: 验证

Run test suite:

运行测试套件:

```txt
$ pytest tests/unit/utils/test_qtlog.py -xvs
==== 5 passed in 0.06s =====

$ pytest tests/unit/utils/test_log.py -xvs
==== 51 passed in 1.65s =====
```

Verify backwards compatibility:

验证向后兼容:

```python
# Import from both locations
from qutebrowser.utils.log import hide_qt_warning as h1
from qutebrowser.utils.qtlog import hide_qt_warning as h2
assert h1 is h2  # Same function object - PASS
```

Test real usage pattern:

测试真实用法:

```python
# Simulate qtnetworkdownloads.py usage
with log.hide_qt_warning('QNetworkReplyImplPrivate', 'qt-tests'):
    logger.warning('QNetworkReplyImplPrivate::error...')  # Filtered
    logger.warning('Other warning')  # Passes through
# Result: Only "Other warning" appears - CORRECT
```

All validations passed

全部验证通过

### D.3 Refactoring Analysis

D.3 重构分析

Table 20 Code migration summary

表 20 代码迁移汇总

| File | Lines Added | Lines Removed | Net Change |
| --- | --- | --- | --- |
| qtlog.py | +28 | 0 | +28 |
| log.py | +1 | -26 | -25 |
| test_qtlog.py | +27 | 0 | +27 |
| test_log.py | 0 | -27 | -27 |
| Total | +56 | -53 | +3 |

### D.4 Key Software Engineering Practices

D.4 关键软件工程实践

1. Incremental Migration: Agent performed refactoring in 5 systematic steps rather than bulk copy-paste, reducing risk of breaking changes.

1. 增量迁移: agent 分 5 个系统步骤完成重构, 而不是整块复制粘贴, 降低了引入破坏性改动的风险.

<!-- page 73 of 78 -->

2. Backwards Compatibility: Used Python re-export pattern (from qtlog import \*) to maintain existing API surface while reorganizing internals.

2. 向后兼容: 用 Python 的重新导出写法(from qtlog import \*)维持现有 API 表面, 同时重组内部结构.

3. Test-First Validation: Moved tests after moving code, then validated all tests pass before declaring success — ensuring no behavior regression.

3. 测试先行的验证: 先迁代码再迁测试, 然后在宣布成功前确认全部测试通过, 保证没有行为回归.

4. Dependency Analysis: Searched codebase for all usages (grep -r "hide\_qt\_warning") to identify affected modules before making changes.

4. 依赖分析: 在改动前搜索代码库的全部用法(grep -r 「hide\_qt\_warning」), 找出受影响的模块.

Impact: Zero breaking changes, improved code organization, all 56 tests passing.

影响: 零破坏性改动, 代码组织改善, 56 个测试全部通过.

## E Evaluation Details on Advanced Mathematical Reasoning

E 高阶数学推理的评测细节

### E.1 Natural Language Proving

E.1 自然语言证明

We adopt an iterative refine pipeline based on the solve-verify-refine framework  $[42]$ . Under this paradigm, Seed2.0 Pro generates candidate solutions, autonomously identifies logical flaws, and refines its outputs to satisfy strict Olympiad scoring criteria. Table 2 reports the results.

我们采用基于 solve-verify-refine 框架 $[42]$ 的迭代改进流水线. 在这一范式下, Seed2.0 Pro 生成候选解, 自主找出逻辑漏洞, 并改进输出以满足严格的奥赛评分标准. Table 2 给出结果.

Notably, the high scores achieved by Seed2.0 Pro are not merely the result of hallucinated correct final answers. Instead, the model demonstrates a strong capacity for systematic reasoning and rigorous proof construction. The solve-verify-refine iterative pipeline ensures that every step of the deduction is logically coherent and mathematically rigorous, fully validating that Seed2.0 can complete complex mathematical reasoning tasks reliably rather than generating specious correct answers.

值得注意的是, Seed2.0 Pro 取得的高分不只是碰巧给出正确最终答案的幻觉结果. 模型展现出系统推理和严谨构造证明的强大能力. solve-verify-refine 迭代流水线保证推导的每一步都逻辑连贯, 数学严谨, 充分证明 Seed2.0 能可靠地完成复杂数学推理任务, 而不是生成似是而非的正确答案.

> **问:** 这段说流水线「保证每一步严谨」, 验证者是谁? 这对 Table 2 的解读有什么影响?
> 按 E.1 的描述, 找漏洞的 verifier 就是 Seed2.0 Pro 自己, 自我验证只能降低错误率, 谈不上「保证」. 真正的保证来自外部评分, 而原文没说 Table 2 的逐题分数由谁按什么细则给出, 也没说流水线跑了几轮, 用了多少 token. 所以 Table 2 衡量的是「Seed2.0 Pro + 若干轮 TestingTime 自我修订」的组合, 不能和单次作答的模型直接比. 对照 Table 15 的 IMO-Bench 一格: 单次采样的 bon 与 won 相差 0.211, 正是这种波动让多轮修订有收益.

### E.2 Formal Theorem Proving

E.2 形式化定理证明

Beyond natural language reasoning, we test Seed2.0 on formal theorem proving using Putnam-200 (randomly sampled from [88])—200 formalized Putnam Competition problems evaluated in an agent-based multi-turn setup with Lean and Python tool access [13]. Table 5 reports the results.

在自然语言推理之外, 我们用 Putnam-200(从 [88] 中随机抽样)测试 Seed2.0 的形式化定理证明能力: 200 道形式化的 Putnam 竞赛题, 在可使用 Lean 和 Python 工具的 agent 多轮设置中评测 [13]. Table 5 给出结果.

Seed2.0 Pro reaches 35.5% Pass@8, a new state-of-the-art among comparable general-purpose models. This substantially surpasses Gemini-3-Pro and also exceeds our previous dedicated prover, Seed-1.5-Prover [13]. Seed2.0 Lite follows at 30.5% Pass@8, showing that strong formal reasoning survives even under efficiency constraints.

Seed2.0 Pro 达到 35.5% Pass@8, 在同类通用模型中创下新 SOTA. 它大幅超过 Gemini-3-Pro, 也超过了我们此前的专用证明器 Seed-1.5-Prover [13]. Seed2.0 Lite 以 30.5% Pass@8 紧随其后, 说明即使在效率约束下, 强形式化推理能力依然保得住.

These results hint at meaningful transfer from natural language math reasoning to formal proof search. Unlike specialized provers trained primarily on formal corpora, Seed2.0 is optimized as a general-purpose model; its Putnam performance suggests that symbolic reasoning developed in natural language contexts can transfer to formal theorem proving.

这些结果暗示自然语言数学推理向形式化证明搜索有实质迁移. 与主要在形式化语料上训练的专用证明器不同, Seed2.0 是作为通用模型优化的; 它在 Putnam 上的表现说明, 在自然语言语境中形成的符号推理能力可以迁移到形式化定理证明.

### E.3 Case study on Erdos Problems

E.3 Erdős 问题案例研究

This section demonstrates the AI agent's capability to solve challenging open problems from Paul Erdős's problem collection, covering combinatorial geometry (Erdős 652) and analytic number theory (Erdős 1051).

本节展示 AI agent 解决 Paul Erdős 问题集中高难开放问题的能力, 涵盖组合几何(Erdős 652)和解析数论(Erdős 1051).

<!-- page 74 of 78 -->

#### E.3.1 Erdos 652: Distinct Distances in Planar Point Sets

E.3.1 Erdős 652: 平面点集中的不同距离

##### Problem Input

问题输入

Let $x_{1},\ldots ,x_{n}\in \mathbb{R}^{2}$ and let $R(x_{i}) = \# \{|x_{j} - x_{i}|:j\neq i\}$, where the points are ordered such that

设 $x_{1},\ldots ,x_{n}\in \mathbb{R}^{2}$, 令 $R(x_{i}) = \# \{|x_{j} - x_{i}|:j\neq i\}$, 其中各点排序使得

$$
R (x _ {1}) \leq \dots \leq R (x _ {n}).
$$

Let $\alpha_{k}$ be minimal such that, for all large enough $n$, there exists a set of $n$ points with $R(x_{k}) < \alpha_{k}n^{1 / 2}$. Is it true that $\alpha_{k}\to \infty$ as $k\to \infty$?

令 $\alpha_{k}$ 为满足以下条件的最小值: 对所有足够大的 $n$, 存在一个 $n$ 点集合使 $R(x_{k}) < \alpha_{k}n^{1 / 2}$. 当 $k\to \infty$ 时, $\alpha_{k}\to \infty$ 是否成立?

##### Output

输出

##### Step 1: Incidence Count and Graph Construction

第 1 步: 关联计数与图构造

Let $S$ be a set of $n$ points in $\mathbb{R}^2$, ordered such that $R(x_1) \leq R(x_2) \leq \dots \leq R(x_n)$, where $R(x_i) = \#\{|x_j - x_i| : j \neq i\}$. Let $\alpha_k$ be the minimal constant such that for all sufficiently large $n$, there exists an $n$-point set $S$ with $R(x_k) < \alpha_k n^{1/2}$. We aim to show $\alpha_k \to \infty$ as $k \to \infty$.

设 $S$ 是 $\mathbb{R}^2$ 中 $n$ 个点的集合, 排序使得 $R(x_1) \leq R(x_2) \leq \dots \leq R(x_n)$, 其中 $R(x_i) = \#\{|x_j - x_i| : j \neq i\}$. 令 $\alpha_k$ 为满足以下条件的最小常数: 对所有足够大的 $n$, 存在 $n$ 点集合 $S$ 使 $R(x_k) < \alpha_k n^{1/2}$. 我们要证明当 $k \to \infty$ 时 $\alpha_k \to \infty$.

$$
k \geq 1
$$

$$
\varepsilon > 0
$$

$$
P _ {1}, P _ {2}, \dots , P _ {k}
$$

$$
\alpha_ {k}
$$

$$
n,
$$

$$
R (P _ {i}) <   (\alpha_ {k} + \varepsilon) n ^ {1 / 2}
$$

$$
i = 1, \dots , k
$$

$$
t = \lfloor (\alpha_ {k} + \varepsilon) n ^ {1 / 2} \rfloor
$$

$$
t \leq (\alpha_ {k} + \varepsilon) n ^ {1 / 2}
$$

For each center $P_{i}$, let $\Gamma_{i}$ be the set of circles centered at $P_{i}$ with radii equal to the distinct distances from $P_{i}$ to $S \setminus \{P_{i}\}$. Then $|\Gamma_i| \leq t$, so the total number of circles is $L = |\bigcup_{i=1}^{k} \Gamma_{i}| \leq kt$.

对每个中心 $P_{i}$, 令 $\Gamma_{i}$ 为以 $P_{i}$ 为圆心, 半径取遍 $P_{i}$ 到 $S \setminus \{P_{i}\}$ 各不同距离的圆的集合. 则 $|\Gamma_i| \leq t$, 所以圆的总数 $L = |\bigcup_{i=1}^{k} \Gamma_{i}| \leq kt$.

Count the incidences $I = I(S, \Gamma)$ between points in $S$ and circles in $\Gamma$: For a non-center point $Q \in S \setminus \{P_1, \ldots, P_k\}$, $Q$ lies on exactly one circle in $\Gamma_i$ for each $i$, contributing $k$ incidences. There are $n - k$ such points, giving $k(n - k)$ incidences. For a center $P_j$, $P_j$ is not contained in any circle in $\Gamma_j$, but lies on exactly one circle in $\Gamma_i$ for each $i \neq j$, contributing $k - 1$ incidences. There are $k$ such points, giving $k(k - 1)$ incidences. Summing these: $I = k(n - k) + k(k - 1) = kn - k$.

计算 $S$ 中的点与 $\Gamma$ 中的圆之间的关联数 $I = I(S, \Gamma)$: 对非中心点 $Q \in S \setminus \{P_1, \ldots, P_k\}$, 对每个 $i$, $Q$ 恰好落在 $\Gamma_i$ 的一个圆上, 贡献 $k$ 个关联. 这样的点有 $n - k$ 个, 共 $k(n - k)$ 个关联. 对中心 $P_j$, $P_j$ 不在 $\Gamma_j$ 的任何圆上, 但对每个 $i \neq j$ 恰好落在 $\Gamma_i$ 的一个圆上, 贡献 $k - 1$ 个关联. 这样的点有 $k$ 个, 共 $k(k - 1)$ 个关联. 求和: $I = k(n - k) + k(k - 1) = kn - k$.

Construct an undirected multigraph $G$ with vertex set $S$. For each circle $\gamma \in \Gamma$ with $m_{\gamma} = |\gamma \cap S| \geq 2$, connect consecutive points of $\gamma \cap S$ (in cyclic order around $\gamma$) with undirected edges (a 2-cycle for $m_{\gamma} = 2$, a simple cycle for $m_{\gamma} \geq 3$). The total number of edges in $G$ is: $E = \sum_{\gamma \in \Gamma, m_{\gamma} \geq 2} m_{\gamma} = \sum_{\gamma \in \Gamma} m_{\gamma} - \sum_{\gamma \in \Gamma, m_{\gamma} = 1} 1 = I - L_1$, where $L_1$ is the number of circles with exactly one point of $S$. Since $L_1 \leq L = kt$, we have: $E \geq I - L = (kn - k) - kt = kn - k - kt$.

构造以 $S$ 为顶点集的无向多重图 $G$. 对每个满足 $m_{\gamma} = |\gamma \cap S| \geq 2$ 的圆 $\gamma \in \Gamma$, 用无向边连接 $\gamma \cap S$ 中相邻的点(沿 $\gamma$ 的循环顺序)($m_{\gamma} = 2$ 时是一个 2-环, $m_{\gamma} \geq 3$ 时是一个简单环). $G$ 的边总数为: $E = \sum_{\gamma \in \Gamma, m_{\gamma} \geq 2} m_{\gamma} = \sum_{\gamma \in \Gamma} m_{\gamma} - \sum_{\gamma \in \Gamma, m_{\gamma} = 1} 1 = I - L_1$, 其中 $L_1$ 是恰好含 $S$ 中一个点的圆的个数. 由于 $L_1 \leq L = kt$, 有: $E \geq I - L = (kn - k) - kt = kn - k - kt$.

##### Step 2: Bounding Parallel Edges

第 2 步: 界定平行边

Simplify $G$ to a simple graph $G'$ by removing all but one edge from each set of parallel edges. Let $R$ be the total number of edges removed, so $E' = E - R$ (edges in $G'$). For an unordered pair $\{u, v\} \subseteq S$, define: $s_1(\{u, v\})$: number of centers where $\{u, v\}$ are consecutive on a circle with $m_\gamma \geq 3$, $s_2(\{u, v\})$: number of centers where $\{u, v\}$ are the only two points on a circle ($m_\gamma = 2$), $s(\{u, v\}) = s_1 + s_2$: total centers with $\{u, v\}$ consecutive, $\mu(\{u, v\}) = s_1 + 2s_2$: edge multiplicity of $\{u, v\}$ in $G$. The number of edges removed for $\{u, v\}$ is $\max(\mu(\{u, v\}) - 1, 0)$, so: $R = \sum_{\{u, v\} \subseteq S} \max(s_1(\{u, v\}) + 2s_2(\{u, v\}) - 1, 0)$. Rewrite $R$ by splitting the sum over $s(\{u, v\})$: $R = \sum_{\{u, v\}: s \geq 2} (s - 1) + \sum_{\{u, v\}} s_2(\{u, v\}) = R_{\mathrm{mult}} + T$, where $R_{\mathrm{mult}} = \sum_{\{u, v\}: s \geq 2} (s - 1)$ and $T = \sum_{\{u, v\}} s_2(\{u, v\})$ (total two-point circles, so $T \leq kt$). For $R_{\mathrm{mult}}$, note $\sum_{\{u, v\}: s \geq 2} (s - 1) \leq \sum_{\{u, v\}} \binom{s}{2}$, where the right-hand side counts triples $(P_i, P_j, \{u, v\})$ with $i < j$ and $\{u, v\}$ consecutive on circles of both $P_i$ and $P_j$. For fixed centers $A = P_i, B = P_j$, consecutive pairs $\{u, v\}$ for both are symmetric over line $AB$, giving at most $2t$ such pairs per center pair. Thus:

把 $G$ 化简为简单图 $G'$: 每组平行边只保留一条. 令 $R$ 为删去的边的总数, 于是 $E' = E - R$($G'$ 的边数). 对无序对 $\{u, v\} \subseteq S$, 定义: $s_1(\{u, v\})$: $\{u, v\}$ 在某个 $m_\gamma \geq 3$ 的圆上相邻的中心个数, $s_2(\{u, v\})$: $\{u, v\}$ 是某个圆上仅有的两个点($m_\gamma = 2$)的中心个数, $s(\{u, v\}) = s_1 + s_2$: $\{u, v\}$ 相邻的中心总数, $\mu(\{u, v\}) = s_1 + 2s_2$: $\{u, v\}$ 在 $G$ 中的边重数. 对 $\{u, v\}$ 删去的边数是 $\max(\mu(\{u, v\}) - 1, 0)$, 所以: $R = \sum_{\{u, v\} \subseteq S} \max(s_1(\{u, v\}) + 2s_2(\{u, v\}) - 1, 0)$. 按 $s(\{u, v\})$ 拆分求和, 把 $R$ 改写为: $R = \sum_{\{u, v\}: s \geq 2} (s - 1) + \sum_{\{u, v\}} s_2(\{u, v\}) = R_{\mathrm{mult}} + T$, 其中 $R_{\mathrm{mult}} = \sum_{\{u, v\}: s \geq 2} (s - 1)$, $T = \sum_{\{u, v\}} s_2(\{u, v\})$(两点圆的总数, 所以 $T \leq kt$). 对 $R_{\mathrm{mult}}$, 注意 $\sum_{\{u, v\}: s \geq 2} (s - 1) \leq \sum_{\{u, v\}} \binom{s}{2}$, 右边计数的是满足 $i < j$ 且 $\{u, v\}$ 在 $P_i$ 和 $P_j$ 的圆上都相邻的三元组 $(P_i, P_j, \{u, v\})$. 固定中心 $A = P_i, B = P_j$, 两者共同的相邻对 $\{u, v\}$ 关于直线 $AB$ 对称, 所以每对中心至多有 $2t$ 个这样的对. 因此:

$$
\sum_ {\{u, v \}} \binom{s}{2} = \sum_ {1 \leq i <   j \leq k} N (P _ {i}, P _ {j}) \leq \binom{k}{2} \cdot 2 t \leq k ^ {2} t.
$$

Combining bounds for $R_{\mathrm{mult}}$ and $T$: $R \leq k^2 t + kt = kt(k + 1)$.

合并 $R_{\mathrm{mult}}$ 与 $T$ 的界: $R \leq k^2 t + kt = kt(k + 1)$.

<!-- page 75 of 78 -->

Output

输出

##### Step 3: Simplifying the Graph and Applying the Crossing Number Inequality

第 3 步: 化简图并应用交叉数不等式

The number of edges in the simple graph $G'$ is:

简单图 $G'$ 的边数为:

$$
E ^ {\prime} = E - R \geq (k n - k - k t) - k t (k + 1) = k n - k - k t (k + 2).
$$

For fixed $k, t = O(n^{1/2})$, so $kt(k + 2) + k = O(k^2 n^{1/2}) = o(kn)$ as $n \to \infty$. For sufficiently large $n$:

对固定的 $k$, $t = O(n^{1/2})$, 所以当 $n \to \infty$ 时 $kt(k + 2) + k = O(k^2 n^{1/2}) = o(kn)$. 对足够大的 $n$:

$$
k t (k + 2) + k \leq \frac {k n}{2} \implies E ^ {\prime} \geq \frac {k n}{2}.
$$

For $k \geq 8$, $E' \geq 4n$, satisfying the crossing number inequality hypothesis. The crossing number of $G$ is bounded by:

当 $k \geq 8$ 时 $E' \geq 4n$, 满足交叉数不等式的前提. $G$ 的交叉数有上界:

$$
\mathrm{cr} (G) \leq 2 \binom{L}{2} \leq L ^ {2} \leq (k t) ^ {2},
$$

since two circles intersect in at most two points (no crossings on the same circle, vertex intersections are not counted). As $G'$ is a subgraph of $G$, $\mathrm{cr}(G') \leq \mathrm{cr}(G) \leq k^2 t^2$.

因为两个圆至多交于两点(同一圆上不产生交叉, 顶点处的相交不计). 由于 $G'$ 是 $G$ 的子图, $\mathrm{cr}(G') \leq \mathrm{cr}(G) \leq k^2 t^2$.

Apply the crossing number inequality (simple graph with $n$ vertices, $m \geq 4n$ edges: $\mathrm{cr}(G) \geq \frac{m^3}{64n^2}$) to $G'$ with $m = E' \geq \frac{kn}{2}$:

对 $G'$ 应用交叉数不等式(有 $n$ 个顶点, $m \geq 4n$ 条边的简单图满足 $\mathrm{cr}(G) \geq \frac{m^3}{64n^2}$), 取 $m = E' \geq \frac{kn}{2}$:

$$
k ^ {2} t ^ {2} \geq \frac {(k n / 2) ^ {3}}{6 4 n ^ {2}} = \frac {k ^ {3} n ^ {3} / 8}{6 4 n ^ {2}} = \frac {k ^ {3} n}{5 1 2}.
$$

Divide by $k^2$ :

两边除以 $k^2$ :

$$
t ^ {2} \geq \frac {k n}{5 1 2} \implies t \geq \frac {\sqrt {k n}}{\sqrt {5 1 2}} = \frac {\sqrt {k n}}{1 6 \sqrt {2}} \approx \frac {\sqrt {k n}}{2 2 . 6}.
$$

##### Step 4: Final Lower Bound on $\alpha_{k}$

第 4 步: $\alpha_{k}$ 的最终下界

Recall $t \leq (\alpha_k + \varepsilon)n^{1/2}$. Substitute into the inequality:

回忆 $t \leq (\alpha_k + \varepsilon)n^{1/2}$. 代入不等式:

$$
(\alpha_ {k} + \varepsilon) n ^ {1 / 2} \geq \frac {\sqrt {k n}}{2 2 . 6} \implies \alpha_ {k} + \varepsilon \geq \frac {\sqrt {k}}{2 2 . 6}.
$$

This holds for all $\varepsilon > 0$, so taking $\varepsilon \to 0$ gives:

该式对所有 $\varepsilon > 0$ 成立, 令 $\varepsilon \to 0$ 得:

for sufficiently large $k$. As $k \to \infty$, $\frac{\sqrt{k}}{23} \to \infty$, so $\alpha_k \to \infty$.

对足够大的 $k$ 成立. 当 $k \to \infty$ 时 $\frac{\sqrt{k}}{23} \to \infty$, 所以 $\alpha_k \to \infty$.

$$
\alpha_ {k} \geq \frac {\sqrt {k}}{2 3}
$$

<!-- page 76 of 78 -->

#### E.3.2 Erdos 1051: Irrationality of Infinite Series

E.3.2 Erdős 1051: 无穷级数的无理性

##### Problem Input

问题输入

Is it true that if $1 \leq a_1 < a_2 < \ldots$ is a sequence of integers with

是否成立: 若 $1 \leq a_1 < a_2 < \ldots$ 是一个整数序列, 满足

$$
\liminf a _ {n} ^ {1 / 2 ^ {n}} > 1
$$

then

则

$$
\sum_ {n = 1} ^ {\infty} \frac {1}{a _ {n} a _ {n + 1}}
$$

is irrational?

是无理数?

Seed-Prover 1.5 also formalized this problem at https://github.com/ByteDance-Seed/Seed-Prover/blob/main/SeedProver-1.5/erdos\_1051.lean.

Seed-Prover 1.5 也把这道题形式化了, 见 https://github.com/ByteDance-Seed/Seed-Prover/blob/main/SeedProver-1.5/erdos\_1051.lean.

##### Output

输出

##### Step 1: Rationality Implies Lower Bound on $x_{m}$

第 1 步: 有理性蕴含 $x_{m}$ 的下界

Let $a_1 < a_2 < \cdots$ be a strictly increasing sequence of positive integers with $\liminf_{n \to \infty} a_n^{1/2^n} = L > 1$, and define the sum $S = \sum_{n=1}^{\infty} \frac{1}{a_n a_{n+1}}$. We prove $S$ is irrational by contradiction. Assume $S = P/Q$ for coprime positive integers $P, Q$. For each $m \geq 1$, split the sum into the partial sum and tail:

设 $a_1 < a_2 < \cdots$ 是满足 $\liminf_{n \to \infty} a_n^{1/2^n} = L > 1$ 的严格递增正整数序列, 定义和 $S = \sum_{n=1}^{\infty} \frac{1}{a_n a_{n+1}}$. 我们用反证法证明 $S$ 是无理数. 假设 $S = P/Q$, 其中 $P, Q$ 为互素正整数. 对每个 $m \geq 1$, 把和拆成部分和与尾项:

$$
S = S _ {m} + R _ {m}, \quad S _ {m} = \sum_ {n = 1} ^ {m} \frac {1}{a _ {n} a _ {n + 1}}, \quad R _ {m} = \sum_ {n = m + 1} ^ {\infty} \frac {1}{a _ {n} a _ {n + 1}}.
$$

Let $D_{m} = a_{1}a_{2}\dots a_{m + 1}$. For $n\leq m$, the term $D_{m} / (a_{n}a_{n + 1}) = \left(\prod_{i = 1}^{n - 1}a_{i}\right)\left(\prod_{i = n + 2}^{m + 1}a_{i}\right)$ is an integer, so $K_{m} = D_{m}S_{m}\in \mathbb{Z}$. Rearranging:

令 $D_{m} = a_{1}a_{2}\dots a_{m + 1}$. 对 $n\leq m$, 项 $D_{m} / (a_{n}a_{n + 1}) = \left(\prod_{i = 1}^{n - 1}a_{i}\right)\left(\prod_{i = n + 2}^{m + 1}a_{i}\right)$ 是整数, 所以 $K_{m} = D_{m}S_{m}\in \mathbb{Z}$. 整理得:

$$
D _ {m} S = K _ {m} + D _ {m} R _ {m} \implies x _ {m} = D _ {m} R _ {m} = \frac {D _ {m} P - K _ {m} Q}{Q}.
$$

Since $R_{m} > 0$, $x_{m} > 0$, the numerator is a positive integer. Hence $x_{m} \geq 1 / Q$ for all $m \geq 1$.

由于 $R_{m} > 0$, $x_{m} > 0$, 分子是正整数. 因此对所有 $m \geq 1$ 有 $x_{m} \geq 1 / Q$.

##### Step 2: Loose Tail Bound and Recurrence

第 2 步: 松的尾项界与递推

Because $\{a_{n}\}$ is strictly increasing, $a_{n + 1} - a_n\geq 1$ , so:

因为 $\{a_{n}\}$ 严格递增, $a_{n + 1} - a_n\geq 1$ , 所以:

$$
\frac {1}{a _ {n} a _ {n + 1}} = \frac {1}{a _ {n + 1} - a _ {n}} \left(\frac {1}{a _ {n}} - \frac {1}{a _ {n + 1}}\right) \leq \frac {1}{a _ {n}} - \frac {1}{a _ {n + 1}}.
$$

The liminf condition implies $a_{n} \to \infty$: there exists $N_{1} \in \mathbb{N}$ such that for all $n \geq N_{1}$, $a_{n}^{1/2^{n}} > (L + 1)/2 > 1$, so $a_{n} > [(L + 1)/2]^{2^{n}} \to \infty$ as $n \to \infty$. Summing the telescoping inequality from $n = m + 2$ to $\infty$:

liminf 条件蕴含 $a_{n} \to \infty$: 存在 $N_{1} \in \mathbb{N}$, 使得对所有 $n \geq N_{1}$, $a_{n}^{1/2^{n}} > (L + 1)/2 > 1$, 于是当 $n \to \infty$ 时 $a_{n} > [(L + 1)/2]^{2^{n}} \to \infty$. 把裂项不等式从 $n = m + 2$ 加到 $\infty$:

$$
\sum_ {n = m + 2} ^ {\infty} \frac {1}{a _ {n} a _ {n + 1}} \leq \sum_ {n = m + 2} ^ {\infty} \left(\frac {1}{a _ {n}} - \frac {1}{a _ {n + 1}}\right) = \lim _ {N \to \infty} \left(\frac {1}{a _ {m + 2}} - \frac {1}{a _ {N}}\right) = \frac {1}{a _ {m + 2}}.
$$

Thus:

因此:

$$
R _ {m} = \frac {1}{a _ {m + 1} a _ {m + 2}} + \sum_ {n = m + 2} ^ {\infty} \frac {1}{a _ {n} a _ {n + 1}} \leq \frac {1}{a _ {m + 1} a _ {m + 2}} + \frac {1}{a _ {m + 2}} \leq \frac {2}{a _ {m + 2}},
$$

where the last inequality uses $a_{m + 1}\geq 1$ . Combining with $x_{m}\geq 1 / Q$

最后一个不等式用到了 $a_{m + 1}\geq 1$ . 结合 $x_{m}\geq 1 / Q$

$$
\frac {1}{Q} \leq \frac {2 D _ {m}}{a _ {m + 2}} \implies a _ {m + 2} \leq 2 Q D _ {m}.
$$

Let $P_{k} = a_{1}a_{2}\cdots a_{k}$ denote the product of the first k terms. Since $D_{m} = P_{m+1}$, reindex with $k = m + 2$ ( $m = k - 2 \geq 1 \implies k \geq 3$ ) to obtain:

令 $P_{k} = a_{1}a_{2}\cdots a_{k}$ 表示前 k 项之积. 由于 $D_{m} = P_{m+1}$, 用 $k = m + 2$ 重新编号( $m = k - 2 \geq 1 \implies k \geq 3$ ), 得到:

$$
a _ {k} \leq K P _ {k - 1} \quad \text {for all} k \geq 3, \quad \text {where} K = 2 Q > 0.
$$

<!-- page 77 of 78 -->

| Step 3: Logarithmic Variables and Boundedness of rkTake natural logarithms and define:bk= log ak, Qk= log Pk= ∑i=1kbi, rk= Qk/2k. |
| --- |
| The recurrence ak≤KPk-1becomes:bk≤ log K+Qk-1 for k≥3. |
| Since Qk=Qk-1+bk, substitute to get:Qk≤Qk-1+log K+Qk-1=2Qk-1+C, where C=log K. |
| Divide by 2k:Qk/2k≤Qk-1/2k-1+C/2kimpler k≤rk-1+C/2k for k≥3. |
| For n≥m≥3, sum the inequality from k=m+1 to n:rn-rm= ∑k=m+1n(rk-rk-1)≤ ∑k=m+1nC/2k≤C/2m. |
| Adjusting for m&lt;3 by increasing C to a larger constant C' >0 if needed, we have for all n≥m≥1:rn≤rm+C'/2m. |
| This implies {rk} is bounded above: for any k≥1, rk≤r1+C'/2&lt;∞. Let R=lim supk→∞ rk&lt;∞. |
| Step 4: Identity Relating rk and dkDefine the normalized log sequence:dk=bk/2k=log ak/2k. |
| The liminf condition translates to: liminf dk=l=log L>0. |
| Using Qk=Qk-1+bk, divide by 2kto derive the identity:rk=Qk-1/2k+bk/2k=rk-1/2+dk, |
| which holds for all k≥1 with r0=Q0/20=log1=0 (since P0=1, the empty product). |
| Step 5: Convergence of rk and dkWe now show liminfk→∞ rk=R, so rk converges to R. Let R' = lim infk→∞ rk. Choose subsequences: {km} such that rk_m → R as m→∞, {jn} such that rjn→R' as n→∞. |
| For each jn, let km be the largest index satisfying km≤jn, so km≤jn&lt;km+1. Since km+1 >jn, apply the inequality from Step 3: rk+m+1≤rjn+C'/2jn. |
| Taking the limit as n→∞, the left-hand side tends to R (as km+1 is a subsequence of {km}), and the right-hand side tends to R' + 0 = R' (since jn→∞). Thus R≤R'. But R' ≤ R by definition of liminf, so R' = R. Hence limk→∞ rk=R.Now use the identity dk=rk-rk-1/2. Since rk→R, rk-1→R as k→∞, so:limk→∞ dk=R-R/2=R/2.Let D=R/2. The liminf condition gives l=lim inf dk=D≥log L>0, so D>0. |

Output

输出

<!-- page 78 of 78 -->

Output

输出

##### Step 6: Tight Tail Bound

第 6 步: 紧的尾项界

Since $d_k \to D > 0$, choose $\epsilon = D / 10 > 0$. There exists $N_2 \in \mathbb{N}$ such that for all $n \geq N_2$:

由于 $d_k \to D > 0$, 取 $\epsilon = D / 10 > 0$. 存在 $N_2 \in \mathbb{N}$, 使得对所有 $n \geq N_2$:

$$
| d _ {n} - D | <   \epsilon \implies D - \epsilon <   d _ {n} <   D + \epsilon .
$$

Exponentiating gives:

取指数得:

$$
e ^ {(D - \epsilon) 2 ^ {n}} <   a _ {n} <   e ^ {(D + \epsilon) 2 ^ {n}} \quad \text {for} n \geq N _ {2}.
$$

For $m \geq N_2 - 1$, consider the ratio of consecutive terms in the tail $R_m$:

对 $m \geq N_2 - 1$, 考虑尾项 $R_m$ 中相邻项之比:

$$
\frac {1 / \left(a _ {n + 1} a _ {n + 2}\right)}{1 / \left(a _ {n} a _ {n + 1}\right)} = \frac {a _ {n}}{a _ {n + 2}} \quad \text {for} n \geq m + 1 \geq N _ {2}.
$$

Using the bounds on $a_{n}$:

利用 $a_{n}$ 的界:

$$
\frac {a _ {n}}{a _ {n + 2}} <   \frac {e ^ {(D + \epsilon) 2 ^ {n}}}{e ^ {(D - \epsilon) 2 ^ {n + 2}}} = e ^ {(D + \epsilon) 2 ^ {n} - 4 (D - \epsilon) 2 ^ {n}} = e ^ {(- 3 D + 5 \epsilon) 2 ^ {n}}.
$$

With $\epsilon = D / 10$, the exponent becomes:

取 $\epsilon = D / 10$, 指数变为:

$$
- 3 D + 5 \epsilon = - 3 D + \frac {D}{2} = - \frac {5 D}{2} <   0,
$$

so $a_{n} / a_{n + 2}\leq 1 / 2$ for all $n\geq N_2$ (since the exponent decays super-exponentially and is bounded above by $\log (1 / 2)$ for large $n$). Thus the tail $R_{m}$ is bounded by a geometric series with ratio $1 / 2$:

所以对所有 $n\geq N_2$ 有 $a_{n} / a_{n + 2}\leq 1 / 2$(因为指数以超指数速度衰减, 对大的 $n$ 上界为 $\log (1 / 2)$). 于是尾项 $R_{m}$ 被一个公比为 $1 / 2$ 的几何级数界住:

$$
R _ {m} \leq \frac {1}{a _ {m + 1} a _ {m + 2}} + \frac {1}{2} \cdot \frac {1}{a _ {m + 1} a _ {m + 2}} + \frac {1}{2 ^ {2}} \cdot \frac {1}{a _ {m + 1} a _ {m + 2}} + \dots = \frac {2}{a _ {m + 1} a _ {m + 2}}.
$$

##### Step 7: Final Contradiction

第 7 步: 最终矛盾

For $m \geq N_2 - 1$, use the tight tail bound to write: $x_m = D_m R_m \leq \frac{2D_m}{a_{m+1} a_{m+2}}$. Since $D_m = P_{m+1} = P_m a_{m+1}$, substitute to simplify:

对 $m \geq N_2 - 1$, 利用紧的尾项界写出: $x_m = D_m R_m \leq \frac{2D_m}{a_{m+1} a_{m+2}}$. 由于 $D_m = P_{m+1} = P_m a_{m+1}$, 代入化简:

$$
x _ {m} \leq \frac {2 P _ {m} a _ {m + 1}}{a _ {m + 1} a _ {m + 2}} = \frac {2 P _ {m}}{a _ {m + 2}}.
$$

Express $P_{m}$ and $a_{m + 2}$ in terms of $r_m$ and $d_{m + 2}$:

把 $P_{m}$ 和 $a_{m + 2}$ 用 $r_m$ 和 $d_{m + 2}$ 表示:

$$
P _ {m} = e ^ {Q _ {m}} = e ^ {2 ^ {m} r _ {m}}, \quad a _ {m + 2} = e ^ {b _ {m + 2}} = e ^ {d _ {m + 2} 2 ^ {m + 2}} = e ^ {4 d _ {m + 2} 2 ^ {m}}.
$$

Thus:

因此:

$$
\frac {P _ {m}}{a _ {m + 2}} = e ^ {2 ^ {m} r _ {m} - 4 d _ {m + 2} 2 ^ {m}} = e ^ {2 ^ {m} (r _ {m} - 4 d _ {m + 2})}.
$$

Since $r_m \to R = 2D$ and $d_{m+2} \to D$, choose $\epsilon = D/5 > 0$. There exists $M \geq N_2 - 1$ such that for all $m \geq M$:

由于 $r_m \to R = 2D$ 且 $d_{m+2} \to D$, 取 $\epsilon = D/5 > 0$. 存在 $M \geq N_2 - 1$, 使得对所有 $m \geq M$:

$$
r _ {m} <   2 D + \epsilon , \quad d _ {m + 2} > D - \epsilon .
$$

Substitute into the exponent:

代入指数:

$$
r _ {m} - 4 d _ {m + 2} <   (2 D + \epsilon) - 4 (D - \epsilon) = 2 D + \epsilon - 4 D + 4 \epsilon = - 2 D + 5 \epsilon .
$$

With $\epsilon = D / 5$, this simplifies to:

取 $\epsilon = D / 5$, 化简为:

$$
r _ {m} - 4 d _ {m + 2} <   - 2 D + 5 \cdot \frac {D}{5} = - D <   0.
$$

Thus for $m\geq M$

因此对 $m\geq M$

$$
\frac {P _ {m}}{a _ {m + 2}} <   e ^ {2 ^ {m} (- D)} = e ^ {- D 2 ^ {m}},
$$

SO:

所以:

$$
x _ {m} \leq 2 e ^ {- D ^ {2 m}}.
$$

Since $D > 0$, $e^{-D2^m} \to 0$ as $m \to \infty$, so $x_m \to 0$. This contradicts Step 1, where $x_m \geq 1 / Q > 0$ for all $m \geq 1$. Therefore, the assumption that $S$ is rational is false. The sum $S$ is irrational.

由于 $D > 0$, 当 $m \to \infty$ 时 $e^{-D2^m} \to 0$, 所以 $x_m \to 0$. 这与第 1 步中对所有 $m \geq 1$ 都有 $x_m \geq 1 / Q > 0$ 矛盾. 因此 $S$ 为有理数的假设不成立. 和 $S$ 是无理数.

78
