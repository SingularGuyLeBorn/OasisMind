这是 Mistral AI 官网的 Mistral Small 4 发布页, 标题 「Introducing Mistral Small 4」, 共 10 页, 6 张图. 正文在第 1 到第 8 页, 第 9, 10 页是站点页脚. 每一页都叠着 axeptio 的 cookie 横幅, 转出的 Markdown 丢了大半正文, 下面的英文按 PDF 文本层补全. 第 3 页和第 5 页两张柱状图被横幅挡住一部分, 数字按 PDF 里嵌着的原图读, 每根柱上都印了数, 不需要读柱高. 第 6 页正文提到的 「Score vs. Output Length」 图, PDF 里只剩一段空白和图注, 没有抓到图, images 目录里也没有. 文中自己算的数都标了估算.

<!-- page 1 of 10 -->

# Introducing Mistral Small 4

The page header reads **RESEARCH**, followed by the title "Introducing Mistral Small 4", the date **March 16, 2026** and the byline "By Mistral AI".

页头印着 **RESEARCH**, 下面是标题 「Introducing Mistral Small 4」, 日期 **March 16, 2026**, 署名 「By Mistral AI」.

A hero image sits below the byline: a pixel-art pink tulip with green leaves on a blue background, with a white square in the middle holding a small copy of the same flower. The images directory keeps a screenshot of this area, where the cookie banner covers the left half of the picture and the first lines of the body text.

署名下面是一张题图: 蓝色底上一朵像素风的粉色郁金香, 配绿色叶子, 中间嵌一个白色方块, 里面是同一朵花的小图. images 目录保存的是这一块的截屏, cookie 横幅盖住了画面左半和正文开头几行.

![题图截屏, 像素风粉色郁金香和绿叶, 左半被 cookie 横幅盖住, 下方露出正文开头几行](images/p01-hl.png)

Today, we are announcing Mistral Small 4. This model is the next major release in the Mistral Small family. Mistral Small 4 is the first Mistral model to unify the capabilities of our flagship models, Magistral for reasoning, Pixtral for multimodal, and Devstral for agentic coding, into a single, versatile model. With Small 4, users no longer need to choose between a fast instruct model, a powerful reasoning engine, or a multimodal assistant: one model now delivers all three, with configurable reasoning effort and best-in-class efficiency.

今天我们发布 Mistral Small 4. 它是 Mistral Small 系列的下一个大版本. Mistral Small 4 是第一个把我们几条旗舰线的能力合进一个模型的 Mistral 模型: 推理靠 Magistral, 多模态靠 Pixtral, agentic 编码靠 Devstral. 有了 Small 4, 用户不必再在快速的 instruct 模型, 强推理引擎和多模态助手之间挑一个: 一个模型同时给出这三样, 推理强度可调, 效率同级最好.

The clause from "powerful reasoning engine" onward is printed at the top of page 2.

「powerful reasoning engine」 起的后半句印在第 2 页开头.

> **想:** 「unify the capabilities」 是把三个模型合起来, 还是重新训一个?
> 页面只说能力合进 「a single, versatile model」, 做法一字没提: 没说蒸馏, 合并权重还是从头训练. 后面的结构参数也没有和这三个模型对照, 看不出谁是谁的底座.

The rest of page 1 is a cookie consent banner certified by axeptio. It says the site uses cookies to measure the audience, nurture the relationship and send content and advertisement. It lists Google Analytics 4 and Hubspot, with Close, Accept all and Next buttons. The same banner repeats on every page below.

第 1 页其余部分是 axeptio 认证的 cookie 同意横幅. 横幅说网站用 cookie 统计访问量, 维系用户关系, 推送内容和广告. 它列出 Google Analytics 4 和 Hubspot 两项, 带 Close, Accept all, Next 三个按钮. 后面每一页都重复这个横幅, 下文不再逐页说明.

<!-- page 2 of 10 -->

Mistral Small 4 is released under the Apache 2.0 license, continuing our commitment to open, accessible, and customizable AI.

Mistral Small 4 以 Apache 2.0 许可发布, 延续我们对开放, 易得, 可定制 AI 的承诺.

## A new standard for multimodal, reasoning-optimized models

Mistral Small 4 is a hybrid model optimized for general chat, coding, agentic tasks, and complex reasoning. Its architecture supports both text and image inputs, making it versatile for a wide range of applications. With Mistral Small 4, we reaffirm our commitment to open-source models and are proud to join the NVIDIA Nemotron Coalition as a founding member, advancing collaboration and innovation in AI development.

Mistral Small 4 是一个混合模型, 针对日常对话, 编码, agentic 任务和复杂推理做了优化. 它的结构同时支持文本和图像输入, 能用在很多场景. 借 Mistral Small 4, 我们重申对开源模型的承诺, 并以创始成员身份加入 NVIDIA Nemotron Coalition, 推动 AI 开发上的协作和创新.

> **问:** 「hybrid model」 混的是什么?
> 按下文, 混的是快速回答和深度推理两种模式, 由第 4 页的 reasoning_effort 切换. 页面没说两种模式是同一套权重还是另有分支, 第 3 页图里两种模式的分数画在同一根柱子上.

### Key architectural details

- Mixture of Experts (MoE): 128 experts, with 4 active per token, enabling efficient scaling and specialization.
- 119B total parameters, with 6B active parameters per token (8B including embedding and output layers).
- 256k context window, supporting long-form interactions and document analysis.
- Configurable reasoning effort: Toggle between fast, low-latency responses and deep, reasoning-intensive outputs.
- Native multimodality: Accepts both text and image inputs, unlocking use cases from document parsing to visual analysis.

- MoE: 128 个专家, 每个 token 激活 4 个, 换来高效的 Scaling 和分工.
- 总参数 119B, 每个 token 激活 6B (算上 embedding 层和输出层是 8B).
- 256k 上下文窗口, 支持长对话和文档分析.
- 推理强度可调: 在快速, 低延迟的回答和深入, 重推理的输出之间切换.
- 原生多模态: 接受文本和图像输入, 能做从文档解析到视觉分析的事.

> **拆开:** 128 选 4 和 119B 选 6B, 两个比例对得上吗?
> 专家激活比例是 4/128, 约 3.1%; 参数激活比例是 6/119, 约 5.0%, 算上 embedding 层和输出层是 8/119, 约 6.7% (都是估算). 后两个比前一个高, 说明专家之外还有每个 token 都要走的公共部分, 但页面没给层数, 隐藏维度, 单个专家大小, 也没说有没有共享专家, 公共部分多大拆不出来.

> **核对:** 「256k」 是 token 吗, 有长上下文分数吗?
> 页面只写 「256k context window」, 没写单位. 第 5, 6 页出现了 LCR / AA LCR, 但页面没展开这个缩写, 也没标这项评测喂了多长的输入, 256k 这一条没有任何分数直接支撑.

The rest of page 2 is the cookie banner, which covers the start of the architecture list.

第 2 页其余部分是 cookie 横幅, 挡住了结构列表的前半截.

<!-- page 3 of 10 -->

### Performance highlights

- 40% reduction in end-to-end completion time (latency-optimized setup).
- 3x more requests per second (throughput-optimized setup) compared to Mistral Small 3.

- 端到端完成时间减少 40% (延迟优化配置).
- 每秒请求数是 Mistral Small 3 的 3 倍 (吞吐优化配置).

> **停一下:** 40% 是和谁比?
> 按排版, 「compared to Mistral Small 3」 只挂在第二条后面, 第一条没写基线, 只能顺着读成也是比 Small 3. 两条都没给硬件, 并发, 输入输出长度, 也没说 Small 4 当时开没开推理. 第 4 页说 「none」 模式对标的是 Small 3.2, 这里比速度用的却是 Small 3, 基线不是同一个版本.

Below the list is a grouped bar chart titled "Performance comparison across internal models". The legend has two entries: Instruct (solid orange) and Reasoning (orange hatching). The left block is labelled Text Benchmarks and holds GPQA Diamond, MMLU Pro, AllenAI IFBench and Arena Hard; the right block, Vision Benchmarks, holds MMMU-Pro. Each group has four bars: Mistral Small 4, Mistral Small 3.2, Mistral Medium 3.1 and Mistral Large 3. The Small 4 bar is solid up to its Instruct score, printed inside the bar, and hatched above that up to its Reasoning score, printed on top. The other three bars are grey with one number each. The y-axis runs from 20 to 80. On the page, the cookie banner covers the lower left of the chart; the image kept in the images directory is a crop of the right side, showing only the Arena Hard and MMMU-Pro groups. The numbers below are read from the full embedded image.

列表下面是一张分组柱状图, 标题 「Performance comparison across internal models」. 图例两项: Instruct (实心橙色) 和 Reasoning (橙色斜线). 左边一块标 Text Benchmarks, 包括 GPQA Diamond, MMLU Pro, AllenAI IFBench, Arena Hard; 右边一块标 Vision Benchmarks, 只有 MMMU-Pro. 每组四根柱: Mistral Small 4, Mistral Small 3.2, Mistral Medium 3.1, Mistral Large 3. Small 4 那根柱实心部分到 Instruct 分数为止, 数字印在柱内; 往上是斜线部分, 到 Reasoning 分数为止, 数字印在柱顶. 另外三根是灰色, 各印一个数. 纵轴从 20 到 80. 页面上 cookie 横幅盖住了图的左下角; images 目录里保存的是图右侧的截取, 只有 Arena Hard 和 MMMU-Pro 两组. 下表按 PDF 里嵌着的完整原图转录.

![Small 4 与自家三款模型的分组柱状图右侧截取, 只含 Arena Hard 和 MMMU-Pro 两组, Small 4 柱分实心 Instruct 段和斜线 Reasoning 段](images/p03-performance-comparison-across-internal-models.png)

| Benchmark | Small 4 Instruct | Small 4 Reasoning | Small 3.2 | Medium 3.1 | Large 3 |
|---|---|---|---|---|---|
| GPQA Diamond | 59.1 | 71.2 | 50 | 65.7 | 64.1 |
| MMLU Pro | 73.5 | 78 | 69 | 76.8 | 80.9 |
| AllenAI IFBench | 35.7 | 48 | 34 | 40.8 | 37.8 |
| Arena Hard | 55.8 | 58.3 | 43.1 | 67.3 | 66.7 |
| MMMU-Pro | 46.3 | 60 | 49.1 | 43.8 | 54 |

> **看表:** 开推理以后, Small 4 在五项里拿了几个第一?
> 三个: GPQA Diamond 71.2, IFBench 48, MMMU-Pro 60. MMLU Pro 78 低于 Large 3 的 80.9; Arena Hard 58.3 低于 Medium 3.1 的 67.3 和 Large 3 的 66.7, 分别差 9.0 和 8.4 个点.

> **再看:** 不开推理呢?
> Instruct 分数一个第一都没有. MMMU-Pro 46.3 还低于 Small 3.2 的 49.1, IFBench 35.7 低于 Medium 3.1 和 Large 3. 五项等权平均, instruct 约 54.1, reasoning 约 63.1, Small 3.2 约 49.0, Medium 3.1 约 58.9, Large 3 约 60.7 (都是估算). 只看 instruct, Small 4 的平均排在 Medium 3.1 和 Large 3 后面.

> **确认:** 灰色柱子是那三个模型开了推理, 还是没开?
> 图例只给 Small 4 分了 Instruct 和 Reasoning, 另外三个模型的柱子没标模式, 页面也没说 Small 3.2, Medium 3.1, Large 3 是不是推理模型. 所以斜线顶上的数, 可能是拿 Small 4 的推理分去比别人的非推理分.

> **对一下:** 纵轴从哪里起?
> 从 20 起, 不是 0. IFBench 上 48 对 34, 图上柱高约是 28 对 14, 看起来差一倍, 实际分数比约 1.41 (估算). 第 5 页那张图的纵轴从 0 起.

## Why Mistral Small 4?

### Unified capabilities

The section heading "Why Mistral Small 4?" and the sub-heading "Unified capabilities" close page 3; the cookie banner covers the space in between.

小节标题 「Why Mistral Small 4?」 和子标题 「Unified capabilities」 印在第 3 页末尾, 两者之间被 cookie 横幅盖住.

<!-- page 4 of 10 -->

Mistral Small 4 consolidates the strengths of Magistral (reasoning), Devstral (coding agents), and Mistral Small (instruct) into a single model. Whether you need a chat assistant, a research partner, or a coding agent, Small 4 adapts to your task, no need to switch between specialized models.

Mistral Small 4 把 Magistral (推理), Devstral (编码 agent) 和 Mistral Small (instruct) 的长处收进一个模型. 不管你要的是聊天助手, 研究搭档还是编码 agent, Small 4 都能适配, 不用在几个专用模型之间来回换.

## Reasoning on demand

With the new reasoning_effort parameter, users can dynamically adjust the model's behavior:

- reasoning_effort="none": Fast, lightweight responses for everyday tasks, equivalent to the same chat style of Mistral Small 3.2.
- reasoning_effort="high": Deep, step-by-step reasoning for complex problems, with equivalent verbosity to previous Magistral models.

新增的 reasoning_effort 参数让用户可以随时调整模型的行为:

- reasoning_effort=「none」: 日常任务的快速, 轻量回答, 对话风格和 Mistral Small 3.2 一样.
- reasoning_effort=「high」: 面向复杂问题的深入, 逐步推理, 话量和之前的 Magistral 模型相当.

> **回看:** 只有 「none」 和 「high」 两档吗?
> 页面只列了这两个取值, 没说有没有中间档, 也没说默认是哪一档. 第 3 页图里的 「Reasoning」 和第 5 页图里的 「High」 是不是同一档, 页面没对上号, 按字面推测是 「high」.

Page 1 names Pixtral as the multimodal flagship, while this paragraph lists Magistral, Devstral and Mistral Small; Pixtral is not in this list.

第 1 页把 Pixtral 列为多模态那条线, 这一段列的是 Magistral, Devstral 和 Mistral Small, 没有 Pixtral.

The rest of page 4 is the cookie banner. The images directory keeps two small crops from it: an empty checkbox and the Toggle all switch.

第 4 页其余部分是 cookie 横幅. images 目录里从横幅上截了两个小图: 一个空复选框, 一个 Toggle all 开关.

![cookie 横幅里的空复选框, 不含模型信息](images/p04-image.png)

![cookie 横幅里 Toggle all 的开关, 处于关闭状态, 不含模型信息](images/p04-mis.png)

<!-- page 5 of 10 -->

Page 5 opens with a second bar chart, also titled "Performance comparison across internal models"; on the page, the site header covers the title. It has four groups on the x-axis, LCR, AIME25, Collie and LiveCodeBench, each with three bars: Mistral Small 4 - High (orange), Magistral Medium 1.2 and Magistral Small 1.2 (grey). The y-axis runs from 0 to 80. The cookie banner covers the lower left, including the first group's labels. The crop in the images directory shows the bars and numbers but not the group names. The values below are read from the embedded image.

第 5 页开头是第二张柱状图, 标题同样是 「Performance comparison across internal models」, 页面上标题被站点顶栏盖住. 横轴四组: LCR, AIME25, Collie, LiveCodeBench, 每组三根柱: Mistral Small 4 - High (橙色), Magistral Medium 1.2 和 Magistral Small 1.2 (灰色). 纵轴从 0 到 80. cookie 横幅盖住了左下角, 包括第一组的标签. images 目录里的截取有柱子和数字, 没有组名. 下表按嵌入的原图读.

![Small 4 - High 与 Magistral Medium 1.2, Magistral Small 1.2 的柱状图截取, 四组柱子带数字, 组名和左下角被 cookie 横幅盖住](images/p05-here-are-our-cookies.png)

| Benchmark | Mistral Small 4 - High | Magistral Medium 1.2 | Magistral Small 1.2 |
|---|---|---|---|
| LCR | 71.2 | 73 | 27 |
| AIME25 | 83.8 | 84.4 | 80.2 |
| Collie | 62.9 | 61.3 | 60.3 |
| LiveCodeBench | 63.6 | 66.1 | 60.7 |

> **看表:** 对 Magistral Medium 1.2, Small 4 赢几项?
> 四项赢一项, 只有 Collie 62.9 对 61.3. LCR 低 1.8, AIME25 低 0.6, LiveCodeBench 低 2.5 个点, 四项平均约 70.4 对 71.2 (估算). 对 Magistral Small 1.2 四项全赢, LCR 上 71.2 对 27 差得最多.

## Enterprise-grade efficiency

- Minimum infrastructure: 4x NVIDIA HGX H100, 2x NVIDIA HGX H200, or 1x NVIDIA DGX B200.
- Recommended setup: 4x NVIDIA HGX H100, 4x NVIDIA HGX H200, or 2x NVIDIA DGX B200 for optimal performance.
- Mistral Small 4 is fully open source. Fine-tune it for specialized tasks or deploy it out of the box for general-purpose use. Thanks to collaboration with the community, it's now available on vLLM, llama.cpp, SGLang, Transformers, and more.

- 最低配置: 4x NVIDIA HGX H100, 2x NVIDIA HGX H200, 或 1x NVIDIA DGX B200.
- 推荐配置: 4x NVIDIA HGX H100, 4x NVIDIA HGX H200, 或 2x NVIDIA DGX B200, 性能最佳.
- Mistral Small 4 完全开源. 可以为专门任务微调, 也可以开箱即用做通用任务. 靠社区协作, 它已经能在 vLLM, llama.cpp, SGLang, Transformers 等框架上跑.

> **问:** H100 的最低配置和推荐配置为什么一样?
> 两行都写 「4x NVIDIA HGX H100」. H200 从 2 到 4, B200 从 1 到 2, 都翻了一倍, 唯独 H100 没变. 可能 H100 的最低配就已经是推荐配, 也可能是笔误, 页面没解释.

> **拆开:** 119B 的权重大概占多少显存?
> 按每参数 2 字节 (BF16) 约 238 GB, 按 1 字节 (FP8) 约 119 GB, 还没算 KV cache (估算). 页面没写部署精度, 也没说 「4x HGX H100」 的 4x 是四张卡还是四台 HGX 机器, 这组配置没法和权重大小对上.

<!-- page 6 of 10 -->

Delivering advanced open-source AI models requires broad optimization. Through close collaboration with NVIDIA, inference has been optimized for both open source vLLM and SGLang, ensuring efficient, high-throughput serving across deployment scenarios.

要交付先进的开源 AI 模型, 需要多方面的优化. 通过和 NVIDIA 的紧密合作, 推理已经在开源的 vLLM 和 SGLang 上都做了优化, 保证各种部署场景下都能高效, 高吞吐地提供服务.

Below this paragraph the page leaves an empty space where a figure should be; only its caption is printed. The PDF contains no image here, and the images directory has no file for it.

这段下面留着一块空白, 本该是一张图, 页面上只印了图注. PDF 这里没有嵌入图片, images 目录里也没有对应文件.

Figure: Score vs. Output Length across three benchmarks. Top: accuracy scores (higher is better). Bottom: average output length in thousands of characters (shorter is better).

图: 三个基准上的分数与输出长度. 上: 准确率 (越高越好). 下: 平均输出长度, 单位千字符 (越短越好).

Mistral Small 4 with reasoning achieves competitive scores, matching or surpassing GPT-OSS 120B on all three benchmarks, while generating significantly shorter outputs. On AA LCR, Mistral Small 4 scores 0.72 with just 1.6K characters, whereas Qwen models need 3.5-4x more output (5.8-6.1K) for comparable performance. On LiveCodeBench, Mistral Small 4 outperforms GPT-OSS 120B while producing 20% less output. This efficiency gap matters in practice: shorter outputs mean lower latency, reduced inference costs, and a better user experience.

开推理的 Mistral Small 4 分数有竞争力, 在三个基准上都追平或超过 GPT-OSS 120B, 输出却短得多. 在 AA LCR 上, Mistral Small 4 只用 1.6K 字符就拿到 0.72, 而 Qwen 模型要多出 3.5 到 4 倍的输出 (5.8 到 6.1K) 才有相近的表现. 在 LiveCodeBench 上, Mistral Small 4 超过 GPT-OSS 120B, 输出还少 20%. 这个效率差在实际中很要紧: 输出越短, 延迟越低, 推理成本越低, 用户体验也越好.

> **对一下:** 本页 AA LCR 0.72, 第 5 页 LCR 71.2, 是同一个分吗?
> 对不上. 0.72 换成百分制是 72, 第 5 页 Small 4 - High 在 LCR 上印的是 71.2, 差 0.8; 71.2 四舍五入到两位小数是 0.71. 可能两处不是同一次跑分或同一档推理强度, 页面没说明, 本页的图又没抓到, 没法再核.

> **核对:** 「3.5-4x more output (5.8-6.1K)」 按 1.6K 算是多少?
> 5.8/1.6 约 3.6, 6.1/1.6 约 3.8 (估算), 落在 3.5 到 4 之间, 写成 「3.5-4x」 把区间放宽了. 「Qwen models」 是哪几个 Qwen, 各拿多少分, 正文没写.

> **停一下:** 「matching or surpassing GPT-OSS 120B on all three benchmarks」 能核吗?
> 核不了. 三个基准里正文只点名了 AA LCR 和 LiveCodeBench, 第三个没提; GPT-OSS 120B 的分数和输出长度一个都没印. 「20% less output」 也没说是以谁的输出为基数.

### For enterprise buyers:

Efficiency per token directly impacts cost and scalability. Models that maintain or improve performance as responses grow longer reduce the need for manual intervention, lower operational costs, and ensure consistent quality, even for complex, high-stakes tasks like report generation, customer support, or decision-making workflows. Hybrid reasoning models deliver better value by maximizing accuracy without proportional increases in resource use, making them ideal for large-scale deployments where both performance and cost-efficiency are critical.

每个 token 的效率直接影响成本和扩展能力. 回答变长时仍能保持甚至提高表现的模型, 能减少人工介入, 降低运维成本, 即使在报告生成, 客服, 决策流程这类复杂, 高风险任务上也能保持稳定质量. 混合推理模型在不按比例增加资源消耗的前提下把准确率做到最高, 性价比更好, 适合对性能和成本都很在意的大规模部署.

<!-- page 7 of 10 -->

### For technical teams and data scientists:

Performance per token is a key metric for model selection and optimization. Models that scale efficiently allow teams to deploy solutions for longer, more nuanced tasks (e.g., detailed analytics, multi-step reasoning) without sacrificing accuracy or inflating computational costs. This means fewer trade-offs between quality and resource allocation, enabling more innovative and reliable AI-driven applications. It also simplifies fine-tuning and integration, as the model's robustness reduces the need for constant adjustments or fallback systems.

每个 token 的表现是选模型和做优化的关键指标. 能高效 Scaling 的模型, 让团队可以把方案用到更长, 更细的任务上 (比如细致的分析, 多步推理), 既不丢准确率, 也不推高计算成本. 质量和资源之间的取舍因此变少, 能做出更有新意, 更可靠的 AI 应用. 模型够稳, 也就少了反复调整和兜底系统, 微调和集成都更简单.

## Intended use cases

Mistral Small 4 is designed for:

- Developers: Coding automation, codebase exploration, and code agentic workflows.
- Enterprises: General chat assistants, document understanding, and multimodal analysis.
- Researchers: Math, research, and complex reasoning tasks.

Its open-source license and customizable architecture make it ideal for fine-tuning and specialization.

Mistral Small 4 的设计用途:

- 开发者: 编码自动化, 代码库探索, 代码 agentic 工作流.
- 企业: 通用聊天助手, 文档理解, 多模态分析.
- 研究者: 数学, 研究, 复杂推理任务.

开源许可加上可定制的结构, 让它很适合微调和专门化.

## Availability

The page lists two links: "Mistral API and AI Studio", pointing to the AI Studio product page, and "Hugging Face Repository", pointing to the mistralai/mistral-small-4 collection on Hugging Face.

页面列了两个链接: 「Mistral API and AI Studio」, 指向 AI Studio 产品页; 「Hugging Face Repository」, 指向 Hugging Face 上的 mistralai/mistral-small-4 合集.

<!-- page 8 of 10 -->

- Developers can prototype Mistral Small 4 for free on NVIDIA accelerated computing at build.nvidia.com, and for production deployment, Mistral Small 4 is available day-0 as an NVIDIA NIM, delivering optimized, containerized inference out of the box. It can also be customized with NVIDIA NeMo for domain-specific fine-tuning.
- Technical documentation for customers is available on our AI Governance Hub

For enterprise deployments, custom fine-tuning, or on-premises solutions, contact our team.

- 开发者可以在 build.nvidia.com 上用 NVIDIA 加速计算免费试做 Mistral Small 4 原型; 生产部署方面, Mistral Small 4 首日就以 NVIDIA NIM 形式提供, 开箱即得优化过的容器化推理. 它也能用 NVIDIA NeMo 做领域微调.
- 面向客户的技术文档在我们的 AI Governance Hub 上.

企业部署, 定制微调或本地化方案, 请联系我们的团队.

## The future of AI is open

By unifying instruct, reasoning, and multimodal capabilities, Mistral Small 4 simplifies AI integration and empowers users to tackle a wider range of tasks with a single, adaptable tool, bringing the benefits of open source AI to real-world use cases.

Mistral Small 4 把 instruct, 推理和多模态能力合在一起, 让 AI 接入更简单, 用户拿一个灵活的工具就能处理更多任务, 把开源 AI 的好处带到真实场景里.

Below this closing paragraph is a model card. It reads "Mistral Small 4" with an **OPEN** badge, the line "Multimodal. Multilingual. Apache 2.0.", four tags TEXT-TO-TEXT, AGENTIC, MULTIMODAL and LIGHTWEIGHT, and two prices: Input (/M tokens) $0.15, Output (/M tokens) $0.6. A "Read more" button links to the model card page mistral-small-4-0-26-03 in the Mistral docs. The cookie banner covers the left half of the card.

结尾段下面是一张模型卡片. 卡片上写 「Mistral Small 4」, 带 **OPEN** 标记, 一行 「Multimodal. Multilingual. Apache 2.0.」, 四个标签 TEXT-TO-TEXT, AGENTIC, MULTIMODAL, LIGHTWEIGHT, 两个价格: 输入每百万 token $0.15, 输出每百万 token $0.6. 「Read more」 按钮链接到 Mistral 文档里的模型卡页面 mistral-small-4-0-26-03. cookie 横幅盖住了卡片左半.

> **确认:** 两个单价合起来大概多少?
> 输出是输入的 4 倍. 按输入输出 3:1 混合约 $0.26 每百万 token, 按 1:1 混合约 $0.38 (都是估算, 混合比例是我假设的). 正文从头到尾没提价格, 只有这张卡片印了.

> **再看:** 119B 总参数还叫 Small, 卡片还标 LIGHTWEIGHT, 依据在哪?
> 页面没给理由. 按本页的数, 轻的是每个 token 的计算 (激活 6B), 不是权重 (119B); 第 5 页的最低配置也是多卡起步. 页面没印 Small 3 或 Small 3.2 的参数量, 这一代比上一代大多少, 从本页算不出来.

> **想:** 卡片写 「Multilingual」, 支持哪些语言?
> 正文一句没提多语言, 也没有任何多语言评测. 卡片同时标 TEXT-TO-TEXT 和 MULTIMODAL, 前者字面上是文本进文本出, 和 「Accepts both text and image inputs」 放在一起不太协调, 页面没解释标签的含义.

<!-- page 9 of 10 -->

Page 9 is the site footer navigation, captured in 2026. It lists Products (Vibe, Vibe Code, Studio, Forge, Compute, Pricing), Solutions (Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities), Why Mistral (About us, Careers, Partners, Our customers, Our models, Brand) and Company. The cookie banner covers the middle of the page.

第 9 页是站点页脚导航, 抓页时间是 2026 年. 里面列了 Products (Vibe, Vibe Code, Studio, Forge, Compute, Pricing), Solutions (Delivery methodology, Model customization, Coding, Document intelligence, Speech, 以及金融, 公共机构, 制造, 能源与公用事业四个行业方案), Why Mistral (About us, Careers, Partners, Our customers, Our models, Brand) 和 Company. 页面中间被 cookie 横幅盖住.

<!-- page 10 of 10 -->

Page 10 continues the footer: Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice, a "Get Mistral Vibe" block with App Store and Google Play badges, a row of social icons, the line "Mistral AI © 2026" and a language switch set to English. The image kept in the images directory is the social icon row.

第 10 页接着是页脚: Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice, 一个带 App Store 和 Google Play 徽标的 「Get Mistral Vibe」 区块, 一排社交图标, 一行 「Mistral AI © 2026」, 以及设成 English 的语言切换. images 目录里保存的是那排社交图标.

![页脚的社交图标一排, 依次是 LinkedIn, X, YouTube, Discord, Reddit, 不含模型信息](images/p10-get-mistral-vibe.png)
