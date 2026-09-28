<!-- page 1 of 4 -->

2025-09-30 · Research

2025 年 9 月 30 日, 栏目: Research (研究).

# GLM-4.6: Advanced Agentic, Reasoning and Coding Capabilities

GLM-4.6: 更强的智能体, 推理和编程能力 (正标题).

![Image block](images/p01-image.png)

(图: 黑色圆角方块里一个白色 「Z」 字标, 是下面 「Try it at Z.ai」 这类链接前的小图标. 没有文字, 没有数据.)

![Image block](images/p01-z-try-it-at-z-ai-https-z-ai-z-call-it-at-z-ai-https.png)

(图: 一个淡紫色的文档图标, 画面里没有文字. 在 PDF 里它位于 「Tech Report」 前面.)

> **核对:** 第 1 页两张图的文件名, 对得上画面吗?
> 只对上一半. `p01-image.png` 是 「Z」 字标, PDF 里 「Try it at Z.ai」 和 「Call it at Z.ai」 前面各有一个, 两处图标一样, 分不出这张截的是哪一个. `p01-z-try-it-at-z-ai-https-z-ai-z-call-it-at-z-ai-https.png` 的文件名取自链接那一行的文字, 画面却是 「Tech Report」 前那个文档图标, 和 Z.ai 没有关系. PDF 文字层里这个图标本身是一个 📄 字符, 所以 md 链接文字里还留着 📄, 同一个图标在 md 里出现了两次, 一次是图, 一次是字符. 链接行开头的两个 「Z」 和 HuggingFace 前的 「S」 也是图标被识别成了字母, PDF 文字层里没有它们; 「S」 对应的是 HuggingFace 的笑脸图标.

Z [Try it at Z.ai](https://z.ai/) Z [Call it at Z.ai](https://docs.z.ai/guides/llm/glm-4.6) S [HuggingFace](https://huggingface.co/zai-org/GLM-4.6) [📄 Tech Report](https://arxiv.org/abs/2508.06471)

四个链接: [在 Z.ai 上试用](https://z.ai/), [在 Z.ai 上调用](https://docs.z.ai/guides/llm/glm-4.6) (指向 API 文档), [HuggingFace](https://huggingface.co/zai-org/GLM-4.6) (模型页), [技术报告](https://arxiv.org/abs/2508.06471).

> **问:** 「Tech Report」 链到 arXiv:2508.06471, 这是 GLM-4.6 的报告吗?
> 不是这一代的. 同家族目录 `glm-4-5/glm-4-5.md` 开头印着 「arXiv:2508.06471v1 [cs.CL] 8 Aug 2025」, 标题是 「GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models」, 比本篇的 2025-09-30 早 53 天. 博客没有说明这是上一代的报告, 按钮上只写 「Tech Report」. 本目录只有这篇博客, 没有 GLM-4.6 自己的技术报告. 所以论文里的参数量, 训练数据和评测分数, 都不能当成这篇博客给 GLM-4.6 印的数.

Today, we are releasing the latest version of our flagship model: **GLM-4.6**. Compared with GLM-4.5, this generation brings several key improvements:

今天我们发布旗舰模型的最新版本: **GLM-4.6**. 和 GLM-4.5 相比, 这一代有几项关键改进:

**Longer context window:** The context window has been expanded from 128K to 200K tokens, enabling the model to handle more complex agentic tasks.

**更长的上下文窗口:** 上下文窗口从 128K token 扩到 200K token, 让模型能处理更复杂的智能体任务.

> **拆开:** 128K 到 200K, 博客交代了是怎么扩的吗?
> 没有. 这一句只给了两个端点和一个理由 (「handle more complex agentic tasks」), 单位是 tokens. 位置编码, 注意力结构, 长文本训练阶段, 全篇都没提, 这里也不替它补. 128K 是 GLM-4.5 的窗口, 这是博客自己印的起点; 200K 是 GLM-4.6 的窗口长度, 不是任何一项得分. 还要连着第 2 页看: 评测图的副标题写 「Evaluation results under 128K context length」, 八项基准都是在旧窗口长度下跑的, 200K 没有进那张图.

**Superior coding performance:** The model achieves higher scores on code benchmarks and demonstrates better real-world performance in applications such as Claude Code、Cline、Roo Code and Kilo Code, including improvements in generating visually polished front-end pages.

**编程更强:** 模型在代码基准上得分更高, 在 Claude Code, Cline, Roo Code 和 Kilo Code 等应用里的实际表现也更好, 包括生成的前端页面在视觉上更精致.

**Advanced reasoning:** GLM-4.6 shows a clear improvement in reasoning performance and supports tool use during inference, leading to stronger overall capability.

**推理更强:** GLM-4.6 的推理表现明显提升, 并支持在推理过程中调用工具, 整体能力因此更强.

**More capable agents:** GLM-4.6 exhibits stronger performance in tool using and search-based agents, and integrates more effectively within agent frameworks.

**智能体更强:** GLM-4.6 在工具调用型和搜索型智能体上表现更强, 接入智能体框架也更顺.

**Refined writing:** Better aligns with human preferences in style and readability, and performs more naturally in role-playing scenarios.

**写作更讲究:** 文风和可读性更贴合人的偏好, 角色扮演场景里表现更自然.

We evaluated GLM-4.6 across eight public benchmarks covering agents, reasoning, and coding. Results show clear gains over GLM-4.5, with GLM-4.6 also holding competitive advantages over leading domestic and international models such as **DeepSeek-V3.2-Exp** and **Claude Sonnet 4**, but still lags behind Claude Sonnet 4.5 in coding ability.

我们在覆盖智能体, 推理和编程的八个公开基准上评估了 GLM-4.6. 结果显示它比 GLM-4.5 有明显提升, 和 **DeepSeek-V3.2-Exp**, **Claude Sonnet 4** 等国内外领先模型相比也有竞争优势, 但编程能力仍落后于 Claude Sonnet 4.5.

> **看表:** 「competitive advantages over DeepSeek-V3.2-Exp and Claude Sonnet 4, but still lags behind Claude Sonnet 4.5 in coding」, 和第 2 页八张柱状图对得上吗?
> 大体对得上, 细看有例外. 对 Claude Sonnet 4, GLM-4.6 八项赢七项, 输的是 SWE-bench Verified, 68.0 对 72.5. 对 DeepSeek-V3.2-Exp, 也是八项赢七项, 输的是 HLE, 不带工具时 17.2 对 19.8, 带工具的 30.4 才超过. 对 Claude Sonnet 4.5, 八项里只赢 AIME 25, LiveCodeBench v6, BrowseComp 三项. 按基准名称看和写代码直接相关的三项里 (博客没给分类, 这是按名字归的), SWE-bench Verified 68.0 对 77.2, Terminal-Bench 40.5 对 50.0, 是落后; LiveCodeBench v6 却是 82.8 对 57.7 领先. 另外 GPQA (81.0 对 83.4, 带工具 82.9 也不够), HLE (17.2 对 17.3), τ²-Bench (75.9 对 88.1) 也落后, 这三项正文没提, 正文只承认了编程落后.

中

中 (页面右下角一个浮动的圆形按钮, 上面只有这一个字.)

> **停一下:** 第 1 页末尾这个孤立的 「中」 是正文吗?
> 不是. PDF 第 1 页右下角有一个圆形浮动按钮, 按钮上就是这个字; 看位置和样子像是切换中文的入口, 这是按外观推断, 页面没写它的功能. 它在 PDF 文字层里存在, 所以 md 把它当成一段正文抓了进来. 它不属于上面那段评测总结.

<!-- page 2 of 4 -->

LLM Performance Evaluation: Agentic, Reasoning and Coding

大模型性能评测: 智能体, 推理与编程 (评测图的大标题. 源文 md 把它标成一级标题; 在 PDF 里它是图片里的字, 文字层没有这一行, 这里按图内文字处理, 不作标题.)

8 benchmarks: AIME 25, GPQA, LiveCodeBench v6, HLE, BrowseComp, SWE-bench Verified, Terminal-Bench, τ²-Bench (Evaluation results under 128K context length)

8 个基准: AIME 25, GPQA, LiveCodeBench v6, HLE, BrowseComp, SWE-bench Verified, Terminal-Bench, τ²-Bench (评测结果均在 128K 上下文长度下得出).

GLM-4.6GLM-4.5DeepSeek-V3.2-ExpClaude Sonnet 4Claude Sonnet 4.5

图例, 五个模型依次是: GLM-4.6 (蓝), GLM-4.5 (绿), DeepSeek-V3.2-Exp, Claude Sonnet 4, Claude Sonnet 4.5 (后三个是深浅不同的灰). md 把五个名字粘成了一串.

> **确认:** 副标题说 「under 128K context length」, 那 200K 在这张图里体现了吗?
> 没有. 这八项的分数都是在 128K 上下文长度下得出的, 也就是 GLM-4.5 的窗口长度. 第 1 页说窗口扩到 200K, 可这张图没有一项是在 200K 下跑的, 博客也没给 200K 下的长文本评测. 所以不能拿这张图证明 200K 窗口的效果; 在这篇博客里, 200K 只是一个窗口长度, 没有配分数.

![Chart block](images/p02-chart.png)

(图: AIME 25. 五根柱从左到右按图例顺序: GLM-4.6 93.9, 柱顶再叠一段深蓝, 标 98.6 w/ Tools; GLM-4.5 85.4; DeepSeek-V3.2-Exp 89.3; Claude Sonnet 4 74.3; Claude Sonnet 4.5 87.0.)

![Chart block](images/p02-chart-2.png)

(图: GPQA. GLM-4.6 81.0, 带工具 82.9; GLM-4.5 79.9; DeepSeek-V3.2-Exp 79.9; Claude Sonnet 4 77.7; Claude Sonnet 4.5 83.4.)

![Chart block](images/p02-chart-3.png)

(图: LiveCodeBench v6. GLM-4.6 82.8, 带工具 84.5; GLM-4.5 63.3; DeepSeek-V3.2-Exp 70.1; Claude Sonnet 4 48.9; Claude Sonnet 4.5 57.7.)

![Chart block](images/p02-chart-4.png)

(图: HLE. GLM-4.6 17.2, 带工具 30.4, 八张图里深蓝那一段最长的一次; GLM-4.5 14.4; DeepSeek-V3.2-Exp 19.8; Claude Sonnet 4 9.6; Claude Sonnet 4.5 17.3.)

![Chart block](images/p02-chart-5.png)

(图: BrowseComp. GLM-4.6 45.1; GLM-4.5 26.4; DeepSeek-V3.2-Exp 40.1; Claude Sonnet 4 14.7; Claude Sonnet 4.5 19.6. 没有带工具的一段.)

![Chart block](images/p02-chart-6.png)

(图: SWE-bench Verified. GLM-4.6 68.0; GLM-4.5 64.2; DeepSeek-V3.2-Exp 67.8; Claude Sonnet 4 72.5; Claude Sonnet 4.5 77.2.)

![Chart block](images/p02-chart-7.png)

(图: Terminal-Bench. GLM-4.6 40.5; GLM-4.5 37.5; DeepSeek-V3.2-Exp 37.7; Claude Sonnet 4 35.5; Claude Sonnet 4.5 50.0.)

![Chart block](images/p02-real-world-experience-matters-more-than-leaderboards-we.png)

(图: τ²-Bench, 名称下方小字 「(Weighted)」. GLM-4.6 75.9; GLM-4.5 67.5; DeepSeek-V3.2-Exp 53.4; Claude Sonnet 4 66.0; Claude Sonnet 4.5 88.1.)

> **再看:** 八张柱状图的文件名对得上画面吗?
> 前七张是 `p02-chart.png` 到 `p02-chart-7.png` (第一张没有 「-1」 后缀), 画面依次是 AIME 25, GPQA, LiveCodeBench v6, HLE, BrowseComp, SWE-bench Verified, Terminal-Bench, 和副标题列的顺序一致. 第八张 τ²-Bench 的文件名却是 `p02-real-world-experience-matters-more-than-leaderboards-we.png`, 取自图下面那段正文的开头, 画面里没有这句话. 另外, PDF 里整块评测图是一张 3390x2654 的位图, 标题, 副标题和图例都画在图里; md 的标题行和图例行是从图里识别出来的字.

> **回看:** 柱子上只有图标, 两根 Claude 柱用的是同一个图标, 怎么分清 Sonnet 4 和 Sonnet 4.5?
> 只能靠图例顺序和灰度. 每张图的柱子上只有 Z 字标, 鲸鱼图标和 Anthropic 的字标, 没写模型名; 两根 Claude 柱图标相同, 第四根灰度稍深, 第五根更浅, 和图例里 Claude Sonnet 4, Claude Sonnet 4.5 的色块对应, 上面转录的数字都按这个顺序读. 「w/ Tools」 那一段只出现在 GLM-4.6 的柱子上, 而且只有 AIME 25, GPQA, LiveCodeBench v6, HLE 四项有. 其他四个模型没有带工具的数, 所以 98.6, 82.9, 84.5, 30.4 这四个数没有同口径的对手可比; 第 1 页 「supports tool use during inference」 在图上对应的就是这四段深蓝.

> **对一下:** 和 GLM-4.5 比, 哪些数是这篇博客自己印的?
> 正文里和 GLM-4.5 比的只有定性说法 (「clear gains over GLM-4.5」, 「improves over GLM-4.5」) 和一个数: 下面这段的 「about 15% fewer tokens」. 其余都印在图上. 八张柱状图里的绿柱就是 GLM-4.5 这一行: AIME 25 85.4, GPQA 79.9, LiveCodeBench v6 63.3, HLE 14.4, BrowseComp 26.4, SWE-bench Verified 64.2, Terminal-Bench 37.5, τ²-Bench 67.5. GLM-4.6 八项全部高于它, 差值依次是 8.5, 1.1, 19.5, 2.8, 18.7, 3.8, 3.0, 8.4, 最大的是 LiveCodeBench v6 和 BrowseComp, 最小的是 GPQA. 第 3 页还有两处: CC-Bench 里 GLM-4.6 对 GLM-4.5 是 50.0% 胜, 13.5% 平, 36.5% 负; 每次交互平均 token 用量 651,525 对 762,817.

> **核对:** 这一行 GLM-4.5 的数, 能拿 Tech Report 里的数去对吗?
> 只能对上一部分, 而且不能反过来补. 同家族目录 `glm-4-5/glm-4-5.md` (就是 arXiv:2508.06471 那篇论文) 写的 GLM-4.5 分数里, HLE 14.4, BrowseComp 26.4, SWE-bench Verified 64.2, Terminal-Bench 37.5 这四个数和本页绿柱相同. 其余对不上: 论文 GPQA 是 79.1, 本页是 79.9; 论文用的是 LiveCodeBench (2407-2501), 本页是 LiveCodeBench v6; 论文用 AIME 24, 本页是 AIME 25; 论文用 TAU-Bench, 本页是 τ²-Bench (Weighted). 这几个论文数只拿来核对, 不是这篇博客印的; 引用 GLM-4.5 的分数时, 一律以本页绿柱为准.

Real-world experience matters more than leaderboards. We extended **CC-Bench** from GLM-4.5 with more challenging tasks, where human evaluators worked with models inside isolated Docker containers and completed multi-turn real-world tasks across front-end development, tool building, data analysis, testing, and algorithm.**GLM-4.6** improves over GLM-4.5 and reaches **near parity with Claude Sonnet 4 (48.6% win rate)**, while clearly outperforming other open-source baselines. From a **token-efficiency** perspective, GLM-4.6 finishes tasks with about 15% fewer tokens than GLM-4.5, showing improvements in both capability and efficiency. All evaluation details and trajectory data have been made publicly available for further community research: [https://huggingface.co/datasets/zai-org/CC-Bench-trajectories](https://huggingface.co/datasets/zai-org/CC-Bench-trajectories)

真实使用体验比排行榜更重要. 我们在 GLM-4.5 时的 **CC-Bench** 基础上加入了更难的任务: 人类评估员在隔离的 Docker 容器里和模型协作, 完成前端开发, 工具构建, 数据分析, 测试和算法等方面的多轮真实任务.**GLM-4.6** 比 GLM-4.5 有提升, 与 **Claude Sonnet 4 接近持平 (胜率 48.6%)**, 同时明显胜过其他开源基线. 从 **token 效率** 看, GLM-4.6 完成任务所用的 token 比 GLM-4.5 少约 15%, 能力和效率都有提升. 全部评估细节和轨迹数据都已公开, 供社区进一步研究: [https://huggingface.co/datasets/zai-org/CC-Bench-trajectories](https://huggingface.co/datasets/zai-org/CC-Bench-trajectories)

> **问:** 48.6% 胜率叫 「near parity」, 平局和负局各是多少?
> 正文只给了胜率. 第 3 页的 CC-Bench 图补全了这一行: GLM-4.6 对 Claude Sonnet 4 是 48.6% 胜, 9.5% 平, 41.9% 负, 胜比负多 6.7 个百分点. 按这三个数, GLM-4.6 在这组人工对比里略占上风, 博客选的措辞是 「near parity」. 「other open-source baselines」 指谁, 正文没点名, 要看第 3 页图里的 Kimi-K2-0905 和 DeepSeek-V3.1-Terminus. CC-Bench 这组对比里也没有 Claude Sonnet 4.5.

<!-- page 3 of 4 -->

CC-Bench-V1.1: GLM 4.6's Experience with Agentic Coding in Real-world Development Scenarios

CC-Bench-V1.1: GLM 4.6 在真实开发场景中的智能体编程表现 (左图标题. 原文 「GLM 4.6」 中间没有连字符.)

Average Token Usage per Interaction

每次交互的平均 token 用量 (右图标题. PDF 里标题下还有一行小字 「(input + output tokens for multiple tool calls, without cache)」, 意思是多次工具调用的输入加输出 token, 不计缓存; md 没有抓到这一行.)

Z

Z (右图右上角的字标.)

![Chart block](images/p03-chart.png)

(图: 横向堆叠条形图, 四行, 蓝为胜, 黑为平, 绿为负, 横轴 0 到 100. GLM-4.6 vs Claude Sonnet 4: 48.6% / 9.5% / 41.9%; vs GLM-4.5: 50.0% / 13.5% / 36.5%; vs Kimi-K2-0905: 56.8% / 28.3% / 14.9%; vs DeepSeek-V3.1-Terminus: 64.9% / 8.1% / 27.0%.)

![Chart block](images/p03-getting-started-with-glm-4-6.png)

(图: 竖向柱状图, 纵轴标题 「Tokens per Round」, 刻度 0, 250,000, 500,000, 750,000, 顶端印 「1,00,000」. GLM-4.6 651,525; GLM-4.5 762,817; Kimi-K2-0905 821,759; DeepSeek-V3.1-Terminus 947,454.)

> **拆开:** 第 3 页这两张图, 文件名对得上画面吗?
> `p03-chart.png` 是 CC-Bench 的胜平负条形图, 名字泛, 但不算错. `p03-getting-started-with-glm-4-6.png` 的画面是 token 用量柱状图, 文件名却取自图下面的小节标题 「Getting started with GLM-4.6」, 画面里没有这几个字. PDF 里这两张图是同一张 8870x2898 的位图, 左右并排; md 上面那两行标题和孤立的 「Z」, 都是从这张位图里识别出来的字, 不是网页正文. 左图标题写的是 「CC-Bench-V1.1」, 第 2 页正文只说在 GLM-4.5 的 CC-Bench 上 「extended」, 版本号只在图里出现.

> **看表:** CC-Bench 四行加起来都是 100% 吗? 两处 DeepSeek 是同一个模型吗?
> 四行都正好是 100.0%: 48.6+9.5+41.9, 50.0+13.5+36.5, 56.8+28.3+14.9, 64.9+8.1+27.0. 胜减负依次是 6.7, 13.5, 41.9, 37.9 个百分点; 对 Kimi-K2-0905 的平局最多, 占 28.3%. 两处 DeepSeek 不是同一个: 第 2 页八项基准比的是 DeepSeek-V3.2-Exp, 这里 CC-Bench 和 token 用量比的是 DeepSeek-V3.1-Terminus; Kimi-K2-0905 也只出现在这两张图里. 两组对比的对手不一样, 不能把 CC-Bench 的胜率和第 2 页的分数拼成一张表.

> **回看:** 「about 15% fewer tokens」 和图上的数对得上吗? 纵轴顶端那个 「1,00,000」 是多少?
> 对得上. 651,525 除以 762,817 约等于 0.854, 少了约 14.6%, 正文取整成 「about 15%」. 按同样算法, 比 Kimi-K2-0905 少约 20.7%, 比 DeepSeek-V3.1-Terminus 少约 31.2%, 这两个数博客没写. 纵轴顶端印的 「1,00,000」, 按印度式分位读是十万, 比下面的 750,000 还小, 讲不通; 按 250,000 的刻度间隔, 那一格应是 1,000,000, 图上少了一个 0. 还有一处口径没对齐: 标题是 「per Interaction」, 纵轴写 「Tokens per Round」, 一次 interaction 和一个 round 是不是一回事, 图里没解释.

## Getting started with GLM-4.6

GLM-4.6 上手指南

**Call GLM-4.6 API on Z.ai API platform**

在 Z.ai API 平台调用 GLM-4.6 API (小节标题. 源文 md 里这一行和下面三个小节标题都是二级标题, 这里改成加粗行, 文字不变.)

The Z.ai API platform offers both GLM-4.6 models. For comprehensive API documentation and integration guidelines, please refer to [https://docs.z.ai/guides/llm/glm-4.6](https://docs.z.ai/guides/llm/glm-4.6). Alternatively, developers are welcome to access both models through OpenRouter.

Z.ai API 平台同时提供两个 GLM-4.6 模型. 完整的 API 文档和接入指南见 [https://docs.z.ai/guides/llm/glm-4.6](https://docs.z.ai/guides/llm/glm-4.6). 开发者也可以通过 OpenRouter 使用这两个模型.

> **想:** 「both GLM-4.6 models」 是哪两个?
> 全篇没说. 博客从头到尾只出现 GLM-4.6 一个名字, 没有第二个型号, 也没有任何后缀; 这一段却两次用 「both」, 一次 「both GLM-4.6 models」, 一次 「both models」. 这里不猜第二个是什么. 同样没交代的还有规模: 第 3 页只说权重在 HuggingFace 和 ModelScope 公开, 没给一个参数数字.

**Use GLM-4.6 with Coding Agents**

在编程智能体里使用 GLM-4.6 (小节标题.)

GLM-4.6 is now available to use within coding agents (Claude Code, Kilo Code, Roo Code, Cline and more).

GLM-4.6 现在可以在编程智能体里使用 (Claude Code, Kilo Code, Roo Code, Cline 等).

For **GLM Coding Plan subscribers:** You'll be automatically upgraded to GLM-4.6. If you've previously customized the app configs (like \~/.claude/settings.json in Claude Code), simply update the model name to "glm-4.6" to complete the upgrade.

对 **GLM Coding Plan 订阅用户:** 你会被自动升级到 GLM-4.6. 如果之前改过应用配置 (比如 Claude Code 里的 `~/.claude/settings.json`), 只要把模型名改成 「glm-4.6」 就完成了升级.

For **New users:** The GLM Coding Plan offers Claude-level performance at a fraction of the cost — just 1/7th the price with 3x the usage quota. Start building today: [https://z.ai/subscribe](https://z.ai/subscribe).

对 **新用户:** GLM Coding Plan 用一小部分成本提供 Claude 级别的表现, 价格只有 1/7, 用量额度是 3 倍. 现在就开始: [https://z.ai/subscribe](https://z.ai/subscribe).

> **确认:** 「1/7th the price with 3x the usage quota」 是和谁比?
> 原句没写比较对象. 前半句说 「Claude-level performance」, 后半句的 1/7 和 3 倍按上下文像是和 Claude 的订阅比, 但没点名是哪一档套餐, 也没给价格. 这两个数属于订阅推广, 不是模型评估的数, 也没有图表支撑. 另外, 第 1 页列应用的顺序是 Claude Code, Cline, Roo Code, Kilo Code, 这里换成 Claude Code, Kilo Code, Roo Code, Cline, 四个名字一样, 只是顺序不同.

**Chat with GLM-4.6 on Z.ai**

在 Z.ai 上和 GLM-4.6 对话 (小节标题.)

GLM-4.6 is accessible through [Z.ai](https://chat.z.ai/) by selecting the GLM-4.6 model option.

在 [Z.ai](https://chat.z.ai/) 上选择 GLM-4.6 模型选项即可使用.

**Serve GLM-4.6 Locally**

本地部署 GLM-4.6 (小节标题.)

Model weights of GLM-4.6 is publicly available at [HuggingFace](https://huggingface.co/zai-org/GLM-4.6) and [ModelScope](https://modelscope.cn/models/ZhipuAI/GLM-4.6). For local deployment, GLM-4.6 supports inference frameworks including vLLM and SGLang.

GLM-4.6 的模型权重已在 [HuggingFace](https://huggingface.co/zai-org/GLM-4.6) 和 [ModelScope](https://modelscope.cn/models/ZhipuAI/GLM-4.6) 公开. 本地部署方面, GLM-4.6 支持 vLLM 和 SGLang 等推理框架.

> **核对:** 这里给了模型规模或结构吗? 两个权重链接和第 1 页一致吗?
> 没给规模和结构. 这一段只说权重公开, 支持 vLLM 和 SGLang, 没有参数量, 层数, 注意力类型或精度格式. Tech Report 论文摘要里的 355B 总参数, 32B 激活参数是 GLM-4.5 的数, 博客没说 GLM-4.6 沿用, 不能挪过来当 GLM-4.6 的规模. HuggingFace 链接两处都是 `huggingface.co/zai-org/GLM-4.6`, 一致; ModelScope 链接是 `modelscope.cn/models/ZhipuAI/GLM-4.6`, 组织名写的是 ZhipuAI, 不是 zai-org. 原句 「Model weights ... is」 主谓不一致, 照录.

<!-- page 4 of 4 -->

Comprehensive deployment instructions are available in the official GitHub repository.

完整的部署说明见官方 GitHub 仓库.

> **停一下:** 「official GitHub repository」 链到哪里?
> 这句没有链接, PDF 里也没有, 仓库名也没写. 整页唯一的 GitHub 链接在页脚右下角的图标上, 指向 `github.com/THUDM`, 是组织主页, 不是 GLM-4.6 的仓库; 旁边的 X 图标指向 `x.com/zai_org`. md 把这两个图标识别成了末尾的 「x0」, 链接也丢了. HuggingFace 用的组织名是 zai-org, GitHub 图标用的是 THUDM, 两处不一样.

![Image block](images/p04-legal.png)

(图: 深灰色圆角方块里的白色 「Z」 字标, 比第 1 页的小图标大得多, 位于页脚左上. 没有文字.)

Legal

法律信息

[Privacy Policy](https://chat.z.ai/legal-agreement/privacy-policy)

[隐私政策](https://chat.z.ai/legal-agreement/privacy-policy)

[Terms of Service](https://chat.z.ai/legal-agreement/terms-of-service)

[服务条款](https://chat.z.ai/legal-agreement/terms-of-service)

© 2026 [Z.ai](https://chat.z.ai/) Inc.

© 2026 [Z.ai](https://chat.z.ai/) Inc. (版权行.)

x0

x0 (页脚右下角 X 和 GitHub 两个图标被识别成的字符.)

> **对一下:** `p04-legal.png` 对得上画面吗? 页脚的 © 2026 和页首的 2025-09-30 矛盾吗?
> 文件名取自图下方的 「Legal」 一词, 画面是 Z 字标, 没有 「Legal」 字样; 它确实在 「Legal」 正上方, 位置对, 内容不对. 13 张图逐一对下来: 文件名和画面相符的是 `p02-chart.png` 到 `p02-chart-7.png` 七张; `p01-image.png` 和 `p03-chart.png` 名字泛, 但不算错; 另外四张 (`p01-z-try-...`, `p02-real-world-...`, `p03-getting-started-...`, `p04-legal.png`) 都是拿相邻文字命名的, 和画面对不上. 版权年份不矛盾: 页首 2025-09-30 是发布日, 页脚 © 2026 是网页当时的版权行; PDF 的生成时间是 2026-09-25, 也就是抓取那一年.
