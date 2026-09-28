<!-- page 1 of 7 -->

Q :

页眉搜索框留下的残片, 不是正文.

Z

页眉的站点标志 Z.

GLM-5-Turbo

页眉面包屑里的型号名.

# GLM-5-Turbo

Copy page

复制页面, 文档站的按钮文字.

![Image block](images/p01-overview.png)

Overview

概览. 上面这张图是一个向下的折叠箭头.

GLM-5-Turbo is a foundation model deeply optimized for the OpenClaw scenario. It has been specifically optimized for the core requirements of OpenClaw tasks since the training phase, enhancing key capabilities such as tool invocation, command following, timed and persistent tasks, and long-chain execution.

GLM-5-Turbo 是一个针对 OpenClaw 场景深度优化的基础模型. 页面说从训练阶段起就围绕 OpenClaw 任务的核心需求做优化, 加强的能力有四项: 工具调用, 指令遵循, 定时与持续任务, 长链执行. 页面没有给层数, 没有给参数量, 也没有给训练数据的规模.

> **想:** 「foundation model」 加上 「since the training phase」, 是不是说 GLM-5-Turbo 就是 GLM-5 换了个名字?
> 页面没有这样说. 第 3 页写 「GLM-5-Turbo delivers substantial improvements over GLM-5」, GLM-5 在这句里是对照对象, 两个名字分属比较的两边. Turbo 是不是在 GLM-5 权重上继续训练, 结构和参数量是多少, 本页一个字都没印. 名字里的 5 只能说明它挂在 GLM-5 这一代名下, 推不出是同一套权重, 也不能把 GLM-5 技术报告里的结构数字搬过来.

![Image block](images/p01-positioning.png)

Positioning

定位. 上面这张图是一枚地图定位针图标.

ClawBench Enhanced Model

针对 ClawBench 加强的模型.

> **问:** 定位栏写 「ClawBench Enhanced Model」, 第 3 页推出的基准叫 「ZClawBench」. 这是同一个基准吗?
> 页面没有交代. 两个名字差一个 Z, 定位栏没有链接, 也没有版本号. 第 3 页介绍的是 Z.ai 自己提出的 ZClawBench, 不带 Z 的 ClawBench 在全文只出现在定位栏这一处. 两个名字要分开记, 不能默认定位栏说的就是第 4 页那张雷达图.

![Image block](images/p01-input-modalities-text.png)

Input Modalities Text

输入模态: 文本.

![Image block](images/p01-output-modalitie-text.png)

Output Modalitie Text

输出模态: 文本. 源文 「Modalitie」 少了一个 s, 照录. 输入输出都只写了文本, 没有图像或音频.

> **核对:** 第 1 页这四张图, 是模型结构图还是页面图标?
> 是图标. `p01-overview.png` 是向下的折叠箭头, `p01-positioning.png` 是地图定位针, `p01-input-modalities-text.png` 是指向右下的箭头, `p01-output-modalitie-text.png` 是指向左下的箭头. 四个文件分别是 329, 2021, 581, 551 字节, 画面都是黑底上的单个线条符号. 文件名是 MinerU 按紧邻的文字取的, 不是图题. 第 1 页没有结构图, 也没有数据图.

↓↑

上下箭头符号, 是 Context Length 那一栏图标的残片.

Context Length 200K

上下文长度 200K.

Maximum Output Tokens 128K

最大输出 128K token.

> **停一下:** 上下文和价格, 哪一个真印在这一页?
> 上下文印了: 「Context Length 200K」 和 「Maximum Output Tokens 128K」 都在第 1 页的规格栏里. 价格没有印: 7 页里找不到美元, 人民币, 每百万 token 这类计价单位, Resources 里的两个链接也只是 API 文档和 OpenClaw 接入指南. 200K 的 K 按 1000 还是 1024 算, 页面没有注明.

Capability

能力.

1

孤立的数字 1, 位置在 Thinking Mode 上方, 是图标残片.

Thinking Mode

思考模式.

Streaming Output

流式输出.

f(x)

函数图标上的字样.

Function Call

函数调用.

<!-- page 2 of 7 -->

![Image block](images/p02-t.png)

t

单个字母 t, 图标残片.

![Image block](images/p02-context-caching-intelligent-caching-mechanism-to.png)

Context Caching Intelligent caching mechanism to optimize performance in long conversations

上下文缓存: 用智能缓存机制优化长对话里的性能. 上面这张图是一个数据库圆柱图标. 页面没有给命中率, 也没有给节省比例.

> **回看:** `p02-t.png` 画的是什么, 文件名里的 t 从哪来?
> 画面是一个纸箱形状的线条图标, 908 字节. 文件名取自它下方被识别成 「t」 的一个字符, 这个 t 不是能力名. PDF 文字层在第 2 页开头印了三段图标说明: 「Offering multiple thinking modes for different scenarios」, 「Support real-time streaming responses to enhance user interaction experience」, 「Powerful tool invocation capabilities, enabling integration with various external toolsets」. md 里这三段都没出现, 只剩一个 t. 纸箱图标对应哪一项, 页面没有标.

Structured Output Support for structured output formats like JSON, facilitating system integration

结构化输出: 支持 JSON 这类结构化格式, 方便接入系统.

MCP Flexibly integrate external MCP tools and data sources to expand use cases

MCP: 可以灵活接入外部 MCP 工具和数据源, 扩展使用场景.

## Introducing GLM-5-Turbo (介绍 GLM-5-Turbo)

OpenClaw Native Model1

OpenClaw 原生模型. 末尾的 1 是 MinerU 把一个编号粘到了标题后面. PDF 文字层里这个 1 单独成行, 落在本节正文之后, 页面没有对应的脚注文字.

From training data construction to the design of optimization objectives, we have systematically constructed a variety of OpenClaw tasks scenarios based on real-world agent workflows, ensuring that the model is truly capable of executing complex, dynamic, and long-chain tasks. We have significantly enhanced the following core capabilities:

页面说, 从训练数据构建到优化目标设计, 他们基于真实的智能体工作流, 系统地构造了多种 OpenClaw 任务场景, 让模型能执行复杂, 动态, 长链的任务. 下面列出显著加强的核心能力. 数据量和优化目标的形式都没有给. 源文 「OpenClaw tasks scenarios」 的复数写法照录.

Tool Calling—Precise Invocation, No Failures: GLM-5-Turbo has strengthened its ability to invoke external tools and various skills, ensuring greater stability and reliability in multi-step tasks, thereby enabling OpenClaw tasks to transition from dialogue to execution.

工具调用, 小标题是 「精准调用, 不出错」: GLM-5-Turbo 加强了调用外部工具和各种 skill 的能力, 多步任务里更稳定可靠, 让 OpenClaw 任务从对话走到执行. 「No Failures」 是宣传用语, 页面没有给失败率.

Instruction Following—Enhanced Decomposition of Complex Instructions: The model demonstrates stronger comprehension and decomposition capabilities for complex, multi-layered, and long-chain instructions. It can accurately identify objectives, plan steps, and support collaborative task division among multiple agents.

指令遵循, 小标题是 「更强的复杂指令拆解」: 模型对复杂, 多层, 长链的指令理解和拆解得更好, 能识别目标, 规划步骤, 并支持多个智能体之间分工协作. 没有分数.

<!-- page 3 of 7 -->

Z

页眉的站点标志 Z.

complex, long-running tasks.

一段被截断的句尾, 意思是 「复杂的长时任务」.

> **再看:** 第 1 页概览列了四项能力, 第 2 页只写了工具调用和指令遵循, 第 3 页开头这半句是谁的?
> 是第三项 「定时与持续任务」 的句尾. md 把整段丢了, PDF 文字层还在: 小标题是 「Scheduled and Persistent Tasks」, 副标题是 「Better Understanding of Time Dimensions, Uninterrupted Long Tasks」, 正文说针对定时触发, 持续执行和长时任务做了优化, 更能理解和时间有关的要求, 并在 「complex, long-running tasks」 里保持执行连续. 概览写 「timed and persistent tasks」, 正文写 「Scheduled and Persistent Tasks」, 用词不同, 指的是同一项. 这里只按 PDF 补读, 不改源 md.

High-Throughput Long Chains — Faster and More Stable Execution: For Lobster tasks involving high data throughput and long logical chains, GLM-5-Turbo further enhances execution efficiency and response stability, making it better suited for integration into real-world business workflows.

高吞吐长链, 小标题是 「执行更快更稳」: 面对数据吞吐大, 逻辑链长的 Lobster 任务, GLM-5-Turbo 进一步提高了执行效率和响应稳定性, 更适合接进真实的业务流程. 没有吞吐数字, 也没有延迟数字.

> **对一下:** 「Lobster tasks」 是什么任务, 和 OpenClaw 什么关系?
> 页面没有定义. Lobster 全文只出现这一次, 前后都在讲 OpenClaw. 从字面猜, claw 是钳子, lobster 是龙虾, 可能是 OpenClaw 任务的别称, 但页面没写. 这里保留原词 Lobster, 不替它下定义.

ZClawBench: A Benchmark for the OpenClaw Agent Scenario2

ZClawBench: 面向 OpenClaw 智能体场景的基准. 末尾的 2 和上一节的 1 是同一类编号, PDF 文字层里它单独落在本节正文末尾.

With the growing adoption of OpenClaw, evaluating model performance in Openclaw workflows has become a key focus across the industry. Based on extensive analysis of real OpenClaw use cases, we introduce ZClawBench, an end-to-end benchmark designed specifically for agent tasks in the OpenClaw ecosystem.

页面说, OpenClaw 用的人越来越多, 怎么评估模型在 OpenClaw 工作流里的表现成了行业关注的事. 他们分析了大量真实 OpenClaw 用例, 推出 ZClawBench, 一个专门针对 OpenClaw 生态里智能体任务的端到端基准. 同一段里 「OpenClaw」 和 「Openclaw」 两种大小写都有, 照录.

Current OpenClaw workloads span a wide range of task types, including environment setup, software development, information retrieval, data analysis, and content creation. The user base has also expanded beyond early developer adopters to include productivity users, financial professionals, operations engineers, content creators, and research analysts. Meanwhile, the usage of Skills has increased rapidly from 26% to 45% in a short period of time—highlighting a clear shift toward a more modular and skill-driven agent ecosystem.

当前 OpenClaw 的工作负载有五类: 环境配置, 软件开发, 信息检索, 数据分析, 内容创作. 用户也从早期的开发者扩展到效率型用户, 金融从业者, 运维工程师, 内容创作者和研究分析师. Skills 的使用率在短时间内从 26% 升到 45%, 页面据此说智能体生态在转向更模块化, 以 skill 驱动的形态.

> **问:** 26% 到 45% 是什么的占比, 统计了多长时间?
> 页面只写 「the usage of Skills has increased rapidly from 26% to 45% in a short period of time」. 分母是任务数, 会话数还是用户数, 没说. 「short period」 是几周还是几个月, 没说. 数据来自 ZClawBench 的用例样本还是平台日志, 也没说. 这两个百分数只是页面的一句描述, 不是 ZClawBench 的分数.

Benchmark results show that GLM-5-Turbo delivers substantial improvements over GLM-5 in OpenClaw scenarios, outperforming several leading models across multiple key task categories.

页面说基准结果显示, GLM-5-Turbo 在 OpenClaw 场景下比 GLM-5 提升明显, 并在多个关键任务类别上超过了几个领先模型. 这一句没有带任何数值.

<!-- page 4 of 7 -->

Z

页眉的站点标志 Z.

Gemini 3.1 Pro MiniMax M2.5 Kimi K2.5

雷达图图例里被识别出来的三个名字: Gemini 3.1 Pro, MiniMax M2.5, Kimi K2.5.

Automation

自动化.

![Image block](images/p04-office-daily-tasks.png)

Office & Daily Tasks

办公与日常任务. 上面这张是全文唯一的数据图, 一张五条轴的雷达图, 241881 字节. 文件名取自紧邻的轴标签, 不是图题.

Development & Operations

开发与运维.

Data Analysis

数据分析.

> **看表:** 雷达图里哪条线是 GLM-5-Turbo, 哪条是 GLM-5?
> 图上认不出来. `p04-office-daily-tasks.png` 里有六条折线: 一条加粗的蓝线, 加上橙, 绿, 浅灰, 粉, 深灰五条细线. 图例只识别出三个名字, 图片左上角只露出被裁掉的 「Pro」 和 「2.5」. GLM-5-Turbo 和 GLM-5 这两个名字在第 4 页的文字里都没出现. 加粗线通常是主角, 但页面没写明. 轴上没有刻度, 也没有数字, 所以 「substantial improvements over GLM-5」 在这张图上读不出幅度.

> **拆开:** 假设蓝线就是 GLM-5-Turbo, 它是不是每个方向都在最外圈?
> 不是. 顶部那条轴, 自动化, 办公与日常任务, 开发与运维这四个方向, 橙线都在蓝线外侧, 只有数据分析一轴两条线几乎重合. 开发与运维这一轴, 绿线也在蓝线外侧. 这和正文措辞对得上: 页面说的是 「outperforming several leading models」, 没说超过全部对照. 橙线是谁, 图例没给, 不能替它填名字.

> **确认:** 正文列了五类工作负载, 雷达图也是五条轴, 两者是不是一一对应?
> 对不上. 雷达图能读出标签的只有四条轴: Automation, Office & Daily Tasks, Development & Operations, Data Analysis. 顶部那条轴的标签在截图里被裁掉了. 正文的五类是 environment setup, software development, information retrieval, data analysis, content creation, 只有 data analysis 两边同名. 雷达图的分类口径和正文的工作负载分类不是同一套.

The ZClawBench dataset and full evaluation trajectories are now publicly available. We welcome the community to validate, reproduce, and further improve the benchmark.

页面说 ZClawBench 数据集和完整的评测轨迹已经公开, 欢迎社区验证, 复现并改进这个基准.

## Resources (资源)

: Learn how to call the API.[API Documentation](https://docs.z.ai/api-reference/llm/chat-completion)

了解如何调用 API. 链接文字是 API Documentation, 指向 `docs.z.ai/api-reference/llm/chat-completion`. 行首的冒号是图标被抽掉后留下的残片.

: Learn how to integrate with OpenClaw.[OpenClaw Guide](https://docs.z.ai/devpack/tool/openclaw#switching-to-glm-5-turbo-model)

了解如何接入 OpenClaw. 链接文字是 OpenClaw Guide, 页内锚点是 `#switching-to-glm-5-turbo-model`.

> **想:** 说是公开了的 ZClawBench, Resources 里给了地址吗?
> 没给. Resources 只有两条, API 文档和 OpenClaw 接入指南, 都在 `docs.z.ai` 下. 数据集和评测轨迹放在哪个仓库, 本页找不到链接. 「publicly available」 只能记成页面的声明, 要复现得另找来源.

## Quick Start (快速开始)

The following is a full sample code to help you onboard GLM-5-Turbo with ease.

下面是一段完整的示例代码, 帮你快速接入 GLM-5-Turbo.

cURL Official Python SDK Official Java SDK OpenAI Python SDK

四个标签页: cURL, 官方 Python SDK, 官方 Java SDK, OpenAI Python SDK. 下面两段代码都是 cURL 标签页里的请求体, 其他三个标签页的内容没有进 PDF.

Basic Call

基本调用.

<!-- page 5 of 7 -->

c

单个字母 c, 代码框角上的图标残片.

```txt
"model": "glm-b-turbo",
"messages": [
    {
        "role": "user",
        "content": "As a marketing expert, please create an attractive sl"
    },
    {
        "role": "assistant",
        "content": "Sure, to craft a compelling slogan, please tell me mo
    },
    {
        "role": "user",
        "content": "Z.AI Open Platform"
    }
],
"thinking": {
    "type": "enabled"
},
"max_tokens": 4096,
"temperature": 1.0
}'
```

基本调用的请求体. 三轮消息: 用户请 「市场专家」 写一句吸引人的口号, 助手追问细节, 用户回答 「Z.AI Open Platform」. 两条 content 在 「sl」 和 「mo」 处被截断, 第二条的引号也没闭合, 是截图宽度造成的, 照录. 参数是 thinking 为 enabled, max_tokens 为 4096, temperature 为 1.0.

> **核对:** 基本调用里的模型名是 「glm-b-turbo」, 流式调用里是 「glm-5-turbo」. 接口有两个名字吗?
> 没有. PDF 文字层里两段都是 「glm-5-turbo」, md 里的 b 是 MinerU 把 5 认错了. 同一段还丢了请求头: PDF 里有 `curl -X POST "https://api.z.ai/api/paas/v4/chat/completions"`, 以及 Content-Type 和 Authorization 两个请求头, md 的代码块从 「model」 那一行才开始. 调用时模型名按 glm-5-turbo 写.

> **对一下:** 示例写 「max_tokens」: 4096, 第 1 页写最大输出 128K. 哪个是上限?
> 128K 是规格栏写的上限, 4096 是示例里设的值, 两者不冲突. 示例没说 4096 为什么这么选, 也没说思考模式下思考内容算不算进 max_tokens. temperature 1.0 同样只是示例值, 页面没给推荐范围.

Streaming Call

流式调用.

<!-- page 6 of 7 -->

c

同上, 代码框角上的图标残片.

```txt
"model": "glm-5-turbo",
"messages": [
    {
        "role": "user",
        "content": "As a marketing expert, please create an attractive sl"
    },
    {
        "role": "assistant",
        "content": "Sure, to craft a compelling slogan, please tell me mo
    },
    {
        "role": "user",
        "content": "Z.AI Open Platform"
    }
],
"thinking": {
    "type": "enabled"
},
"stream": true,
"max_tokens": 4096,
"temperature": 1.0
}'
```

流式调用的请求体, 和基本调用只差一行 「stream」: true, 消息和其他参数都一样. 这一段的模型名是 glm-5-turbo.

Was this page helpful?

这一页对你有帮助吗?

Yes

有.

No

没有.

<!-- page 7 of 7 -->

Z

页脚的站点标志 Z.

Q :

搜索框残片. 第 7 页在 PDF 文字层里是空白, md 只抽出了这两个残片.

> **停一下:** 这一页是什么时候发布的?
> 页面没有日期. 没有发布日, 没有更新时间, 页脚也没有版权年. 能看出的只是它属于文档站: Copy page 和 Was this page helpful 都是文档站的控件, 两个链接都在 `docs.z.ai` 下. 引用时日期只能写 「未印」.
