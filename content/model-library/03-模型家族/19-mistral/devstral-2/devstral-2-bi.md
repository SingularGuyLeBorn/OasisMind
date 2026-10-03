---
title: "Devstral 2 · 对照译稿"
category: "模型库"
tags: ["Mistral", "对照译稿"]
published: true
excerpt: "Devstral 2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
这是 Mistral AI 官网的 Devstral 2 发布页, 标题 「Introducing: Devstral 2 and Mistral Vibe CLI.」, 共 10 页, 10 张图, 不是论文. 正文在第 1 到第 8 页, 第 9, 10 页是站点页脚. 每一页都叠着一个 cookie 横幅, 转出的 Markdown 丢了大半正文, 下面的英文按 PDF 文本层补全. 第 3, 4, 5 页的三张图被横幅或站点顶栏挡住一部分, 标题, 坐标轴和图例按 PDF 里嵌着的原图读; 柱状图和人评图的每个数都印在图上, 散点图只有位置没有数.

<!-- page 1 of 10 -->

# Introducing: Devstral 2 and Mistral Vibe CLI.

The page header reads **RESEARCH**, followed by the title "Introducing: Devstral 2 and Mistral Vibe CLI.", the date **December 9, 2025** and the byline "By Mistral AI".

页头印着 **RESEARCH**, 下面是标题 「Introducing: Devstral 2 and Mistral Vibe CLI.」, 日期 **December 9, 2025**, 署名 「By Mistral AI」.

A hero image sits below the byline: a pixel-art terminal window with red, orange and green dots and a ">M" prompt on a blue and dark-navy grid. On the page only its right part shows; the images directory keeps a crop of that part.

署名下面是一张题图: 蓝色和深藏青色的网格上, 画着一个像素风终端窗口, 顶上三个红, 橙, 绿圆点, 窗口里是 「>M」 提示符. 页面上只露出右侧一截, images 目录保存的就是这一截.

![题图右侧局部, 像素风终端窗口的三个彩色圆点和放大的 ">" 提示符, 左边被 cookie 横幅挡住](images/p01-eration-coding-model-family-stral-small-2-24b-devstral-2.png)

Today, we're releasing Devstral 2—our next-generation coding model family available in two sizes: Devstral 2 (123B) and Devstral Small 2 (24B). Devstral 2 ships under a modified MIT license, while Devstral Small 2 uses Apache 2.0. Both are open-source and permissively licensed to accelerate distributed intelligence.

今天我们发布 Devstral 2, 这是我们新一代的代码模型家族, 有两个尺寸: Devstral 2 (123B) 和 Devstral Small 2 (24B). Devstral 2 用修改过的 MIT 许可发布, Devstral Small 2 用 Apache 2.0. 两者都开源, 许可宽松, 目的是加快 「分布式智能」 的发展.

> **想:** 「modified MIT license」 改了 MIT 的哪一部分?
> 本页没写. 两个型号许可不同, 大的那个是改过的 MIT, 小的是标准 Apache 2.0, 具体加了什么限制, 要去看许可原文, 这页不交代.

The rest of page 1 is a cookie consent banner certified by axeptio. It says the site uses cookies to measure the audience, nurture the relationship and send content and advertisement. It lists Google Analytics 4 and Hubspot, with Close, Accept all and Next buttons. The same banner repeats on every page below.

第 1 页剩下的是 axeptio 认证的 cookie 同意横幅. 横幅说网站用 cookie 统计访问量, 维系用户关系, 推送内容和广告. 它列出 Google Analytics 4 和 Hubspot 两项, 带 Close, Accept all, Next 三个按钮. 后面每一页都重复这个横幅, 下文不再逐页说明.

<!-- page 2 of 10 -->

Devstral 2 is currently free to use via our API.

Devstral 2 目前可以通过我们的 API 免费使用.

We are also introducing Mistral Vibe, a native CLI built for Devstral that enables end-to-end code automation.

我们还推出 Mistral Vibe, 一个为 Devstral 打造的原生命令行工具, 能端到端地自动完成写代码的活.

## Highlights.

1. Devstral 2: SOTA open model for code agents with a fraction of the parameters of its competitors and achieving 72.2% on SWE-bench Verified.
2. Up to 7x more cost-efficient than Claude Sonnet at real-world tasks.
3. Mistral Vibe CLI: Native, open-source agent in your terminal solving software engineering tasks autonomously.
4. Devstral Small 2: 24B parameter model available via API or deployable locally on consumer hardware.
5. Compatible with on-prem deployment and custom fine-tuning.

1. Devstral 2: 面向代码 agent 的 SOTA 开放模型, 参数只有对手的零头, SWE-bench Verified 达到 72.2%.
2. 在真实任务上, 成本效率最高是 Claude Sonnet 的 7 倍.
3. Mistral Vibe CLI: 跑在终端里的原生开源 agent, 自主完成软件工程任务.
4. Devstral Small 2: 24B 参数, 可以走 API, 也能部署在消费级硬件上本地跑.
5. 支持本地部署和定制微调.

> **问:** 「Up to 7x more cost-efficient than Claude Sonnet」 能复算吗?
> 复算不了. 本页只印了 Devstral 两个型号的价格, 没印 Claude Sonnet 的价格, 没说是哪一版 Sonnet, 也没说 「real-world tasks」 是哪些任务, 成本效率怎么定义.

## Devstral: the next generation of SOTA coding.

Devstral 2 is a 123B-parameter dense transformer supporting a 256K context window. It reaches 72.2% on SWE-bench Verified—establishing it as one of the best open-weight models while remaining highly cost efficient. Released under a modified MIT license, Devstral sets the open state-of-the-art for code agents.

Devstral 2 是一个 123B 参数的 dense transformer, 支持 256K 上下文窗口. 它在 SWE-bench Verified 上达到 72.2%, 成为最好的开放权重模型之一, 同时成本效率很高. Devstral 以修改过的 MIT 许可发布, 刷新了代码 agent 的开放模型最好成绩.

> **核对:** 「sets the open state-of-the-art」 和下一页柱状图对得上吗?
> 对不上. 柱状图 Open-weight 一组里 Deepseek V3.2 是 73.1, 比 Devstral 2 的 72.2 高 0.9 个点. 同一段前半句说 「one of the best open-weight models」, 这个说法和图是一致的, 后半句的 「state-of-the-art」 不一致.

Devstral Small 2 scores 68.0% on SWE-bench Verified, and places firmly among models up to five times its size while being capable of running locally on consumer hardware.

Devstral Small 2 在 SWE-bench Verified 上得 68.0%, 稳稳站进体量最多是它五倍的那一档模型里, 而且能在消费级硬件上本地运行.

> **看表:** 「up to five times its size」 按 24B 算是多大, 图里有谁落在这一档?
> 五倍是 120B. 柱状图里名字带尺寸的只有 GPT-OSS-120B, 62.4, 比 Small 2 低 5.6 个点; Devstral 2 是 123B, 略超五倍, 高 4.2 个点. GLM 4.6 和 Small 2 同为 68.0, 但散点图里它在 450B 附近, 远不止五倍.

<!-- page 3 of 10 -->

Page 3 opens with a bar chart titled "SWE-Bench Verified: Open-weight vs Proprietary models". The y-axis runs from 0 to 90. The bars are grouped into Open-weight and Proprietary; the two Devstral bars are orange, the others grey with each company's logo. A dashed red line runs across the chart at the height of the Devstral 2 bar. On the page, the site header covers the title; the embedded image in the PDF shows it.

第 3 页开头是一张柱状图, 标题 「SWE-Bench Verified: Open-weight vs Proprietary models」. 纵轴 0 到 90. 柱子分成 Open-weight 和 Proprietary 两组, 两根 Devstral 柱是橙色, 其余是灰色, 柱上印着各家的标志. 一条红色虚线横穿全图, 高度和 Devstral 2 的柱顶齐平. 页面上图的标题被站点顶栏盖住, PDF 里嵌着的原图能看到.

![SWE-Bench Verified 柱状图, 开放权重和闭源两组共 14 个模型, Devstral 两根柱为橙色](images/p03-chart.png)

| Group | Model | SWE-Bench Verified |
|---|---|---|
| Open-weight | Devstral Small 2 | 68.0 |
| Open-weight | Devstral 2 | 72.2 |
| Open-weight | DeepSWE | 42.2 |
| Open-weight | CWM | 53.9 |
| Open-weight | GPT-OSS-120B | 62.4 |
| Open-weight | GLM 4.6 | 68.0 |
| Open-weight | Minimax M2 | 69.4 |
| Open-weight | Qwen 3 coder plus | 69.6 |
| Open-weight | Kimi K2 thinking | 71.3 |
| Open-weight | Deepseek V3.2 | 73.1 |
| Proprietary | Grok Code Fast 1 | 70.8 |
| Proprietary | Gemini 3 Pro | 76.2 |
| Proprietary | GPT 5.1 Codex Max | 77.9 |
| Proprietary | Claude 4.5 Sonnet | 77.2 |

> **拆开:** 虚线以上都有谁?
> 开放权重一组只有 Deepseek V3.2 (73.1). 闭源一组四个里三个在虚线以上: Gemini 3 Pro 76.2, Claude 4.5 Sonnet 77.2, GPT 5.1 Codex Max 77.9; Grok Code Fast 1 是 70.8, 在线下. 最高的 GPT 5.1 Codex Max 比 Devstral 2 高 5.7 个点.

A second image is a screenshot of the same area: the bar chart on top, the cookie banner in the lower left, and the right end of the paragraph below showing through.

第二张图是同一块区域的截屏: 上面是柱状图, 左下是 cookie 横幅, 右侧露出下面一段正文的行尾.

![同一张柱状图的截屏, 左下角 cookie 横幅挡住了下方正文的左半](images/p03-image.png)

Devstral 2 (123B) and Devstral Small 2 (24B) are 5x and 28x smaller than DeepSeek V3.2, and 8x and 41x smaller than Kimi K2—proving that compact models can match or exceed the performance of much larger competitors. Their reduced size makes deployment practical on limited hardware, lowering barriers for developers, small businesses, and hobbyists.hardware.

Devstral 2 (123B) 和 Devstral Small 2 (24B) 比 DeepSeek V3.2 小 5 倍和 28 倍, 比 Kimi K2 小 8 倍和 41 倍. 这说明紧凑的模型也能追平甚至超过大得多的对手. 体量小了, 在有限的硬件上部署就变得可行, 开发者, 小公司和业余爱好者的门槛都降低了.

> **确认:** 四个倍数反推出来的 DeepSeek V3.2 和 Kimi K2 有多大?
> 123 x 5 = 615, 24 x 28 = 672; 123 x 8 = 984, 24 x 41 = 984. Kimi K2 两个倍数对得上, 都指向约 1000B; DeepSeek V3.2 两个倍数差了 57B, 说明 5 倍是往下取整. 本页正文没印这两个模型的参数量, 只有下一页散点图的位置.

> **回看:** 句尾 「hobbyists.hardware.」 多出来的 hardware 是什么?
> PDF 文本层就是这样, 截屏里这一行的行尾也露出 「hardware.」. 像是页面上叠了两版文字, 这个词不属于这句话, 译文没有译它.

<!-- page 4 of 10 -->

Page 4 opens with a scatter plot. The x-axis is "Model Size (B parameters)", from 0 to about 1100 with ticks at 200, 400, 600, 800, 1000. The y-axis is "SWE-Bench Verified Regular Performance (%)", from 50 to 75. A light-green triangle fills the upper-left corner, from about 62.7 on the y-axis up to about 320B at the top edge. Devstral 2 and Devstral Small 2 sit inside the triangle with orange logos; the other points are grey. No values are printed next to the points. On the page, the site header covers the top edge of the plot.

第 4 页开头是一张散点图. 横轴 「Model Size (B parameters)」, 从 0 到约 1100, 刻度 200, 400, 600, 800, 1000. 纵轴 「SWE-Bench Verified Regular Performance (%)」, 从 50 到 75. 左上角铺着一块浅绿色三角形, 从纵轴约 62.7 处斜向上, 到顶边约 320B 处. Devstral 2 和 Devstral Small 2 用橙色标志, 落在三角形里, 其余点是灰色. 点旁边没有印数值. 页面上图的顶边被站点顶栏盖住.

![散点图, 横轴模型参数量, 纵轴 SWE-Bench Verified, 两个 Devstral 点落在左上角的浅绿三角里](images/p04-here-are-our-cookies.png)

The points, read from their positions in the embedded image (all estimates):

按嵌入原图里的位置读出的点 (全部是估算):

| Model | Size (B) | Score (%) |
|---|---|---|
| Devstral Small 2 | ~20 | ~68 |
| Devstral 2 | ~120 | ~72 |
| Qwen 3 coder flash | ~25 | ~54 |
| CWM | ~25 | ~52 |
| MiniMax M2 | ~225 | ~69.5 |
| GLM 4.6 | ~450 | ~68 |
| Qwen3 coder plus | ~480 | ~70 |
| DeepSeek v3.2 | ~670 | ~73 |
| Kimi K2 thinking | ~1000 | ~71.5 |

> **停一下:** 散点图和柱状图的点对得上吗?
> 大部分对得上, 有两处不对. CWM 在柱状图里是 53.9, 散点图里落在约 52, 反倒是 Qwen 3 coder flash 落在约 54; Qwen 3 coder flash 只出现在散点图里, 柱状图没有它. DeepSWE, GPT-OSS-120B 和四个闭源模型不在散点图里.

> **再看:** 纵轴的 「Regular Performance」 是什么口径, 绿色三角形又代表什么?
> 本页都没解释. 「Regular」 像是和某种加强设置相对, 但页面没提别的设置. 三角形的斜边从左下到右上, 读起来是 「同样的分数, 参数更少」 的区域, 图上没有图注.

## Built for production-grade workflows.

Devstral 2 supports exploring codebases and orchestrating changes across multiple files while maintaining architecture-level context. It tracks framework dependencies, detects failures, and retries with corrections—solving challenges like bug fixing and modernizing legacy systems.

Devstral 2 能探索代码库, 在多个文件之间协调修改, 同时保持架构层面的上下文. 它会跟踪框架依赖, 发现失败, 改正后重试, 能处理修 bug, 改造遗留系统这类难题.

The model can be fine-tuned to prioritize specific languages or optimize for large enterprise codebases.

模型可以微调, 让它偏重特定编程语言, 或者针对大型企业代码库做优化.

We evaluated Devstral 2 against DeepSeek V3.2 and Claude Sonnet 4.5 using human evaluations conducted by an independent annotation provider, with tasks scaffolded through Cline. Devstral 2 shows a clear advantage over DeepSeek V3.2, with a 42.8% win rate versus 28.6% loss rate. However, Claude Sonnet 4.5 remains significantly preferred, indicating a gap with closed-source models persists.

我们把 Devstral 2 和 DeepSeek V3.2, Claude Sonnet 4.5 放在一起做了人工评测, 评测由一家独立标注公司执行, 任务通过 Cline 搭好执行框架. Devstral 2 明显胜过 DeepSeek V3.2, 胜率 42.8%, 负率 28.6%. 不过评审仍然明显更偏好 Claude Sonnet 4.5, 说明和闭源模型的差距还在.

The images directory keeps a crop of this part of the page: the cookie banner on the left, and the right ends of the lines of the three paragraphs above.

images 目录里截了这一块页面: 左边是 cookie 横幅, 右边露出上面三段正文的行尾.

![第 4 页正文右半截, 左侧 cookie 横幅挡住了 "Built for production-grade workflows" 一节的左半](images/p04-c-languages-or-optimize-for.png)

> **对一下:** 「independent annotation provider」 是哪家?
> 正文没点名. 下一页人评图底部有一块写着 「Surge」 的标签, 脚注是 「Evaluations judged by humans conducted by a third party.」, 可以读成标注方是 Surge, 但页面没把两处连起来说. 题数和评审人数都没印.

<!-- page 5 of 10 -->

Page 5 opens with a horizontal stacked bar chart titled "Model Performance Comparison", with a legend of Win (orange), Tie (hatched) and Lose (grey). The x-axis runs from 0 to 100. A label "Surge" sits under the bars, and a footnote reads "Evaluations judged by humans conducted by a third party." On the page, the site header covers the title and the legend; the embedded image in the PDF shows them.

第 5 页开头是一张横向堆叠柱状图, 标题 「Model Performance Comparison」, 图例是 Win (橙色), Tie (斜线), Lose (灰色). 横轴 0 到 100. 柱子下面有一块 「Surge」 标签, 脚注写着 「Evaluations judged by humans conducted by a third party.」 页面上图的标题和图例被站点顶栏盖住, PDF 里嵌着的原图能看到.

![人评横向堆叠柱状图, Devstral 2 分别对 Deepseek V3.2 和 Sonnet 4.5 的胜, 平, 负比例](images/p05-chart.png)

| Comparison | Win | Tie | Lose |
|---|---|---|---|
| Devstral 2 vs Deepseek V3.2 | 42.8% | 28.6% | 28.6% |
| Devstral 2 vs Sonnet 4.5 | 21.4% | 25.5% | 53.1% |

> **想:** 对 Sonnet 4.5 的 「significantly preferred」 有多明显?
> 负 53.1%, 胜 21.4%, 负是胜的约 2.5 倍, 平 25.5%. 对 DeepSeek V3.2 那一行胜 42.8% 负 28.6%, 胜是负的约 1.5 倍. 两行三段加起来都是 100.0.

> **问:** 这些百分数背后大概多少道题?
> 页面没写. Sonnet 4.5 一行能对上的最小分母是 98, 即 21 胜 25 平 52 负; DeepSeek V3.2 一行按四舍五入最小是 269, 如果 42.8 是截断出来的, 7 就够 (3 胜 2 平 2 负).

"Devstral 2 is at the frontier of open-source coding models. In Cline, it delivers a tool-calling success rate on par with the best closed models; it's a remarkably smooth driver. This is a massive contribution to the open-source ecosystem." — Cline.

「Devstral 2 站在开源代码模型的最前沿. 在 Cline 里, 它的工具调用成功率和最好的闭源模型持平, 用起来很顺. 这对开源生态是一份很大的贡献.」 (Cline)

"Devstral 2 was one of our most successful stealth launches yet, surpassing 17B tokens in the first 24 hours. Mistral AI is moving at Kilo Speed with a cost-efficient model that truly works at scale." — Kilo Code.

「Devstral 2 是我们迄今最成功的匿名上线之一, 头 24 小时就跑过了 17B token. Mistral AI 正以 Kilo 的速度前进, 拿出了一个真能大规模用, 成本又低的模型.」 (Kilo Code)

> **核对:** 17B token 摊到 24 小时是多少?
> 平均约 19.7 万 token 每秒. 页面没说这是输入加输出的总数, 也没说 「stealth launch」 期间模型叫什么名字. Cline 那句 「on par with the best closed models」 没给成功率数字.

Devstral Small 2, a 24B-parameter model with the same 256K context window and released under Apache 2.0, brings these capabilities to a compact, locally deployable form. Its size enables fast inference, tight feedback loops, and easy customization—with fully private, on-device runtime. It also supports image inputs, and can power multimodal agents.

Devstral Small 2 是 24B 参数的模型, 上下文窗口同样是 256K, 用 Apache 2.0 发布, 把上面这些能力装进一个紧凑, 能本地部署的形态. 体量小, 所以推理快, 反馈回路短, 定制方便, 还能完全私有地跑在本机上. 它也支持图像输入, 能驱动多模态 agent.

> **看表:** 支持图像输入的是 Small 2, 那 Devstral 2 呢?
> 本页只说 Small 2 支持图像输入. 第 8 页 Devstral 2 的产品卡片标的是 「TEXT-TO-TEXT」. 全页也没有任何一个图像相关的评测分数.

The images directory keeps a crop of this part: the two quotes and the Small 2 paragraph on the right, the cookie banner on the left, and the top of the next heading "Mistral Vibe CLI." at the bottom.

images 目录里截了这一块: 右边是两段引语和 Small 2 那一段, 左边是 cookie 横幅, 底部露出下一节标题 「Mistral Vibe CLI.」 的上半.

![第 5 页正文截屏, Cline 和 Kilo Code 的引语与 Devstral Small 2 段落, 左半被 cookie 横幅挡住](images/p05-using-natural-language-in-your-terminal-or-integrated.png)

## Mistral Vibe CLI.

<!-- page 6 of 10 -->

Mistral Vibe CLI is an open-source command-line coding assistant powered by Devstral. It explores, modifies, and executes changes across your codebase using natural language—in your terminal or integrated into your preferred IDE via the Agent Communication Protocol. It is released under the Apache 2.0 license.

Mistral Vibe CLI 是一个由 Devstral 驱动的开源命令行编程助手. 你用自然语言下指令, 它就在整个代码库里探索, 修改, 执行改动. 可以直接在终端里用, 也可以通过 Agent Communication Protocol 接进你惯用的 IDE. 它用 Apache 2.0 许可发布.

Below this paragraph is an embedded video player titled 「Mistral Vibe CLI – tool-fetch with MCP」, channel 「Mistral」. The player area is blank in the capture; the PDF text layer also carries a Chinese prompt from the player, 前往平台观看 (watch on the platform).

这段下面嵌着一个视频播放器, 标题 「Mistral Vibe CLI – tool-fetch with MCP」, 频道 「Mistral」. 抓页时播放器区域是空白的, PDF 文本层里还留着播放器的一句中文提示 「前往平台观看」.

Vibe CLI provides an interactive chat interface with tools for file manipulation, code searching, version control, and command execution. Key features:

- **Project-aware context:** Automatically scans your file structure and Git status to provide relevant context
- **Smart references:** Reference files with @ autocomplete, execute shell commands with !, and use slash commands for configuration changes
- **Multi-file orchestration:** Understands your entire codebase—not just the file you're editing—enabling architecture-level reasoning that can halve your PR cycle time
- Persistent history, autocompletion, and customizable themes.

Vibe CLI 提供一个交互式对话界面, 配有文件操作, 代码搜索, 版本控制和命令执行这几类工具. 主要功能:

- **Project-aware context:** 自动扫描文件结构和 Git 状态, 提供相关上下文.
- **Smart references:** 用 @ 自动补全来引用文件, 用 ! 执行 shell 命令, 用斜杠命令改配置.
- **Multi-file orchestration:** 理解整个代码库, 不只是你正在编辑的那个文件, 能做架构层面的推理, 可以把 PR 周期缩短一半.
- 持久化历史, 自动补全, 可定制主题.

> **拆开:** 「can halve your PR cycle time」 有数据吗?
> 没有. 页面没给测了多少个 PR, 在什么项目上, 缩短前后各多久. 这一条和 Highlights 里的 「7x」 一样, 只有结论.

You can run Vibe CLI programmatically for scripting, toggle auto-approval for tool execution, configure local models and providers through a simple config.toml, and control tool permissions to match your workflow.

Vibe CLI 也能以程序方式调用来写脚本; 工具执行可以打开或关闭自动批准; 本地模型和服务商在一个简单的 config.toml 里配置; 工具权限可以按你的工作流来控制.

![第 6 页截屏, 上方是空白的视频播放器 "Mistral Vibe CLI – tool-fetch with MCP", 下方功能列表的左半被 cookie 横幅挡住](images/p06-you-can-run-vibe-cli-programmatically-for-scripting.png)

<!-- page 7 of 10 -->

## Get started.

Devstral 2 is currently offered free via our API. After the free period, the API pricing will be \$0.40/\$2.00 per million tokens (input/output) for Devstral 2 and \$0.10/\$0.30 for Devstral Small 2.

Devstral 2 目前通过我们的 API 免费提供. 免费期结束后, API 价格为: Devstral 2 每百万 token 输入 \$0.40, 输出 \$2.00; Devstral Small 2 输入 \$0.10, 输出 \$0.30.

> **确认:** 两个型号差多少钱?
> 输入差 4 倍, 输出差约 6.7 倍. Devstral 2 输出是输入的 5 倍, Small 2 输出是输入的 3 倍. 免费期到哪天结束, 页面没写.

We've partnered with leading, open agent tools Kilo Code and Cline to bring Devstral 2 to where you already build.

我们和领先的开放 agent 工具 Kilo Code, Cline 合作, 把 Devstral 2 带到你本来就在用的开发环境里.

Mistral Vibe CLI is available as an extension in Zed, so you can use it directly inside your IDE.

Mistral Vibe CLI 已作为 Zed 的扩展上线, 你可以在 IDE 里直接用.

## Recommended deployment for Devstral.

Devstral 2 is optimized for data center GPUs and requires a minimum of 4 H100-class GPUs for deployment. You can try it today on build.nvidia.com. Devstral Small 2 is built for single-GPU operation and runs across a broad range of NVIDIA systems, including DGX Spark and GeForce RTX. NVIDIA NIM support will be available soon.

Devstral 2 针对数据中心 GPU 优化, 部署至少要 4 张 H100 级别的 GPU. 今天就能在 build.nvidia.com 上试用. Devstral Small 2 为单卡运行设计, 能在各种 NVIDIA 系统上跑, 包括 DGX Spark 和 GeForce RTX. NVIDIA NIM 的支持很快会上线.

> **回看:** 4 张 H100 级 GPU 装得下 123B dense 吗?
> 按 BF16 算, 权重约 246 GB, 4 张 80 GB 卡是 320 GB, 剩约 74 GB 给 KV cache 和激活. 页面没写精度, 显存规格, 也没说 256K 满长上下文时要几张卡.

Devstral Small runs on consumer-grade GPUs as well as CPU-only configurations with no dedicated GPU required.

Devstral Small 能在消费级 GPU 上跑, 也能只用 CPU, 不需要独立显卡.

> **停一下:** 24B 放进一张消费级显卡, 要不要量化?
> 按 BF16 算权重约 48 GB, 超过常见消费级显卡的显存, 大概率要量化. 页面没说用什么精度或量化格式, 也没给纯 CPU 下的速度. 这里写的是 「Devstral Small」, 少了 「2」.

For optimal performance, we recommend a temperature of 0.2 and following the best practices defined for Mistral Vibe CLI.

想要最佳效果, 我们建议 temperature 设为 0.2, 并遵循 Mistral Vibe CLI 定义的最佳实践.

The images directory keeps a crop of this part: the right ends of the deployment paragraphs, the cookie banner on the left, and the top of the heading "Contact us." at the bottom.

images 目录里截了这一块: 右边露出部署几段的行尾, 左边是 cookie 横幅, 底部露出标题 「Contact us.」 的上半.

![第 7 页部署一节的右半截, 能看到 "requires a minimum of 4 H100-" 和 "temperature of 0.2" 的行尾](images/p07-we.png)

## Contact us.

<!-- page 8 of 10 -->

We're excited to see what you will build with Devstral 2, Devstral Small 2, and Vibe CLI!

我们很期待看到你用 Devstral 2, Devstral Small 2 和 Vibe CLI 做出什么!

Share your projects, questions, or discoveries with us on X/Twitter, Discord, or GitHub.

欢迎在 X/Twitter, Discord 或 GitHub 上和我们分享你的项目, 问题和发现.

## We're hiring!

If you're interested in shaping open-source research and building world-class interfaces that bring truly open, frontier AI to users, we welcome you to apply to join our team.

如果你想参与塑造开源研究, 打造世界级的界面, 把真正开放的前沿 AI 交到用户手里, 欢迎申请加入我们的团队.

Below this is a product card. It reads "Devstral 2" with an **OPEN** tag, the line "Open-weights agentic coding model for autonomous software engineering.", three tags **CODING**, **AGENTIC** and **TEXT-TO-TEXT**, prices "Input (/M tokens) \$0.4" and "Output (/M tokens) \$2", and a "Read more" link. After it the site footer begins with a Products column listing Vibe.

下面是一张产品卡片. 上面写着 「Devstral 2」, 带 **OPEN** 标签, 一行 「Open-weights agentic coding model for autonomous software engineering.」 (用于自主软件工程的开放权重 agent 代码模型), 三个标签 **CODING**, **AGENTIC**, **TEXT-TO-TEXT**, 价格 「Input (/M tokens) \$0.4」 和 「Output (/M tokens) \$2」, 还有一个 「Read more」 链接. 再往下站点页脚开始, 第一栏 Products 里列着 Vibe.

> **再看:** 产品卡片的价格和第 7 页一致吗?
> 一致, 输入 \$0.4, 输出 \$2, 都是每百万 token. 正文说模型 「open-source」, 卡片说 「Open-weights」, 两种说法在这页混用, 页面没区分.

<!-- page 9 of 10 -->

Page 9 is the site footer navigation, captured in 2026. Products continues with Vibe Code, Studio, Forge, Compute and Pricing; Solutions lists Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing and Mistral for energy & utilities; Why Mistral lists About us, Careers, Partners, Our customers, Our models and Brand; Company lists Terms of Service, Privacy Policy, Privacy choices, Data processing agreement and Trust Center. The cookie banner covers the middle of the page.

第 9 页是站点页脚导航, 抓页时间是 2026 年. Products 接着列 Vibe Code, Studio, Forge, Compute, Pricing; Solutions 列 Delivery methodology, Model customization, Coding, Document intelligence, Speech, 以及金融, 公共机构, 制造, 能源与公用事业四个行业方案; Why Mistral 列 About us, Careers, Partners, Our customers, Our models, Brand; Company 列 Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center. 页面中间被 cookie 横幅盖住.

![站点页脚导航截屏, Products 和 Solutions 两栏可见, 中间被 cookie 横幅盖住, 不含模型信息](images/p09-compute-https-mistral-ai-products-aicloud.png)

<!-- page 10 of 10 -->

Page 10 ends the footer: Legal notice, a "Get Mistral Vibe" block with an App Store badge, the line "Mistral AI © 2026" and a language switch set to English.

第 10 页是页脚的末尾: Legal notice, 一个带 App Store 徽标的 「Get Mistral Vibe」 区块, 一行 「Mistral AI © 2026」, 以及设成 English 的语言切换.

> **对一下:** 页脚写 「© 2026」, 正文日期是 December 9, 2025, 哪个是发布时间?
> 正文日期是发布时间. 页脚是抓页时的站点外壳, Vibe Code, Forge 这些产品名也属于外壳, 不是这篇公告的内容.
