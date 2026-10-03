源文 `glm-4-7.md` 是 Z.ai 在 2025-12-22 发布 GLM-4.7 的博客, MinerU 抓取, 10 页, 19 张图. 正文是四条特性, 一张八项柱状图, 一张 17 行大表, 四组只截到 GLM-4.7 一侧的展示, 三种思考方式和三条脚注. 全篇没有结构, 参数量和训练细节.

# GLM-4.7 博客: 三个编程分数, 一张截断的表和三种思考方式

来源: 同目录 `glm-4-7.md` (第 1 页到第 10 页), 对照同目录 `glm-4-7.pdf`. 逐段英中对照和 26 处疑点见 `glm-4-7-bi.md`. 下文引用的分数, 除非注明出处, 都出自这篇博客的正文, 第 2 页柱状图或第 2 至 3 页的大表.

## 1. 材料是什么

源文是 Z.ai 在 2025-12-22 发布 GLM-4.7 的博客, 栏目 Research, 标题 「GLM-4.7: Advancing the Coding Capability」. MinerU 抓取成 md, 共 10 页, 19 张图. 第 1 页是六个链接和四条特性 (Core Coding, Vibe Coding, Tool Using, Complex Reasoning). 第 2 页上半是一整块八项基准的柱状图, 下半是 17 行大表的前 6 行. 第 3 页是大表后 11 行和一段关于 「感觉」 的话, 接着是前端展示. 第 4 到 7 页是网页, 3D 场景, 海报和幻灯片四组展示. 第 7 页末到第 8 页讲 Interleaved Thinking, Preserved Thinking 和 Turn-level Thinking. 第 9 页是 API, 编程工具, 网页对话, 本地部署四段和三条脚注. 第 10 页只有页脚.

这份材料能回答的是: GLM-4.7 相对 GLM-4.6 官方宣称改了哪几处, 三个编程分数和 HLE 分数的基线从哪来, 八项基准上五个模型的分数, 17 行大表里四家可见对手的分数, 三种思考方式各是什么意思, 评测用了什么采样设置. 它回答不了 GLM-4.7 的参数量, 层数, 注意力结构, 训练数据, 训练方法和上下文窗口长度. 页面上的 Tech Report 链接指向的是 GLM-4.5 的论文, 第 9 节单独说.

## 2. 开头三个数和它们的基线

第 1 页 Core Coding 给了三组数: SWE-bench (73.8%, +5.8%), SWE-bench Multilingual (66.7%, +12.9%), Terminal Bench 2.0 (41%, +16.5%). 三个增量都能在本篇大表里找到基线. 73.8 减 5.8 等于 68.0, 对上 GLM-4.6 列的 SWE-bench Verified 68.0; 66.7 减 12.9 等于 53.8, 对上 SWE-bench Multilingual; 41.0 减 24.5 等于 16.5, 对上 Terminal Bench 2.0. 第 2 页柱状图的绿柱也印着 68.0 和 24.5. 所以三个基线都是博客自己印的 GLM-4.6 分数, 没有从别处借数.

有两处要读仔细. 第一, 正文写的是 「SWE-bench」, 表和图写的是 「SWE-bench Verified」, 按数字对上的是后者, 引用时应写全名. 第二, 三个 「+x%」 都是百分点. 按比例算, 73.8/68.0 约为 1.085, 66.7/53.8 约为 1.240, 41.0/24.5 约为 1.673, 相对提升分别是 8.5%, 24.0%, 67.3%. 写成 「SWE-bench Verified 提升 5.8 个百分点」 才和原文一致, 写成 「提升 5.8%」 会被读成相对值.

三个基线的来历不一样. 68.0 在同家族 GLM-4.6 博客的 SWE-bench Verified 柱上也印着, 前后两篇一致. 53.8 和 24.5 只在 GLM-4.7 的博客里出现: GLM-4.6 博客没有 SWE-bench Multilingual; 它的 Terminal-Bench 印的是 40.5, 和这里 Terminal Bench 2.0 的 24.5 差得很远, 看样子是不同版本的基准. 两篇博客都没交代版本变化, 所以不能拿 GLM-4.6 博客的 40.5 去算 GLM-4.7 的提升.

第 1 页 Complex Reasoning 说 HLE 达到 42.8%, 比 GLM-4.6 高 12.4%. 大表里 HLE 分两行, 不带工具是 24.8 对 17.2, 带工具是 42.8 对 30.4. 42.8 减 30.4 等于 12.4, 所以正文引的是带工具那一行, 不带工具只高 7.6. 正文省掉了 「w/ Tools」, 又放在 「Complex Reasoning」 标题下, 容易被当成纯推理分数. 30.4 和 GLM-4.6 博客里 HLE 带工具的数相同.

## 3. 第 2 页的八张柱状图

第 2 页的评测图副标题写 「Evaluation results under 128K context length」, 图例五个模型依次是 GLM-4.7, GLM-4.6, DeepSeek-V3.2, Claude Sonnet 4.5, GPT-5.1(High). 柱子上只有图标, 按图例顺序读出的数如下 (括号里是带工具或带上下文管理的数):

| 基准 | GLM-4.7 | GLM-4.6 | DeepSeek-V3.2 | Claude Sonnet 4.5 | GPT-5.1(High) |
|---|---|---|---|---|---|
| AIME 25 | 95.7 | 93.9 | 93.1 | 87.0 | 94.0 |
| LiveCodeBench v6 | 84.9 | 82.8 | 83.3 | 64.0 | 87.0 |
| GPQA-Diamond | 85.7 | 81.0 | 82.4 | 83.4 | 88.1 |
| HLE | 24.8 (42.8) | 17.2 (30.4) | 25.1 (40.8) | 13.7 (32) | 25.7 (42.7) |
| SWE-bench Verified | 73.8 | 68.0 | 73.1 | 77.2 | 76.3 |
| Terminal Bench 2.0 | 41.0 | 24.5 | 46.4 | 42.8 | 47.6 |
| τ²-Bench | 87.4 | 75.2 | 85.3 | 87.2 | 82.7 |
| BrowseComp | 52 (67.5) | 45.1 (57.5) | 51.4 (67.6) | 24.1 | 50.8 |

GLM-4.7, GLM-4.6, DeepSeek-V3.2 三列和大表逐项一致. Claude Sonnet 4.5 和 GPT-5.1(High) 只出现在这张图里, 大表里看不到. 按同口径比, GLM-4.7 对 Claude Sonnet 4.5 八项赢六项, 输 SWE-bench Verified (73.8 对 77.2) 和 Terminal Bench 2.0 (41.0 对 42.8), 两项输掉的恰好是第 1 页 Core Coding 主打的方向. 对 GPT-5.1(High), 赢 AIME 25, HLE 带工具 (42.8 对 42.7, 只差 0.1), τ²-Bench, BrowseComp, 输 LiveCodeBench v6, GPQA-Diamond, SWE-bench Verified, Terminal Bench 2.0; HLE 不带工具也输 (24.8 对 25.7). BrowseComp 上 GPT-5.1(High) 只有一段 50.8, 同口径应拿 GLM-4.7 的 52 去比.

同一个 Claude Sonnet 4.5, 在两篇博客里的数不完全一样. AIME 25 87.0, GPQA 83.4, SWE-bench Verified 77.2 两篇相同; LiveCodeBench v6 这里 64.0, GLM-4.6 博客是 57.7; HLE 这里 13.7, 那边 17.3; BrowseComp 这里 24.1, 那边 19.6; τ²-Bench 这里 87.2, 那边 88.1. 两篇都没说对手分数是自己跑的还是引用的. 所以跨两篇比较对手时只能各看各的, 不能把两篇的 Claude 列拼成一条时间线.

副标题和小图标题有两处名字不同: 副标题写 「GPQA」 和 「Terminal-Bench」, 小图写 「GPQA-Diamond」 和 「Terminal Bench 2.0」, 大表也是后一种, 应以小图为准. 128K 是八项跑分时的上下文长度, 博客没给 GLM-4.7 的最大窗口. 脚注 1 的 「max new tokens 131072」 正好是 128 × 1024, 但那是生成上限, 两件事不能合并.

## 4. 17 行的大表

大表的对手是 GLM-4.6, Kimi K2 Thinking, DeepSeek-V3.2, Gemini 3.0 Pro, 最右一列表头只露出 「Claud」. 对 GLM-4.6, GLM-4.7 的 17 行全部更高. 差值从小到大, MMLU-Pro 1.1, AIME 2025 1.8, LiveCodeBench-v6 2.1, GPQA-Diamond 4.7, HMMT Nov. 2025 5.8, SWE-bench Verified 5.8, BrowseComp 6.9, HLE 7.6, HMMT Feb. 2025 7.9, IMOAnswerBench 8.5, Terminal Bench Hard 9.7, BrowseComp 带上下文管理 10.0, τ²-Bench 12.2, HLE 带工具 12.4, SWE-bench Multilingual 12.9, Terminal Bench 2.0 16.5, BrowseComp-ZH 17.1. 提升大的集中在智能体和工具类, 推理类里提升小的是已经接近满分的 AIME 和 MMLU-Pro.

对其他三家就不是处处领先. DeepSeek-V3.2 有六行更高: MMLU-Pro 85.0, HLE 25.1, SWE-bench Multilingual 70.2, Terminal Bench Hard 35.4, Terminal Bench 2.0 46.4, BrowseComp 带上下文管理 67.6. 其中 SWE-bench Multilingual 和 Terminal Bench 2.0 正是第 1 页标榜 「clear gains」 的两项, 那个 「clear gains」 只是对 GLM-4.6 说的. Kimi K2 Thinking 有两行更高, MMLU-Pro 84.6 和 HLE 带工具 44.9. Gemini 3.0 Pro 有数的 14 行里, GLM-4.7 只在 AIME 2025, HMMT Nov. 2025, BrowseComp 带上下文管理三行领先, 其余 11 行落后, Terminal Bench 2.0 差 13.2 分.

表头那句 「17 benchmarks (including 8 reasoning, 5 coding, and 3 agents)」 加起来是 16. 表里 17 行按标题分组是 REASONING 9 行, CODE AGENT 4 行, GENERAL AGENT 4 行. 要凑出 8, 5, 3, 得把 HLE 两行各算一个, 把 LiveCodeBench-v6 挪进编程, 把 BrowseComp 两行合成一个, 这样是 16 个基准占 17 行. 这是按数字拼出来的读法, 博客没解释.

大表还被截断了. PDF 里网页表格可以横向滚动, 截图只截到 「Claud」 这几个字母, 整列数字不可见; 正文点名的 GPT-5 和 GPT-5.1-High 更在右边, 一个字都没有. md 把表头补成 「Claude」, 数据格全空. 所以 「More detailed comparisons ... with GPT-5, GPT-5.1-High, Claude Sonnet 4.5」 这句话, 在这份材料里只兑现了一半: Claude Sonnet 4.5 和 GPT-5.1(High) 只有柱状图上的八项, GPT-5 一个数都没有.

## 5. GLM-4.6 这一列从哪来

把大表 GLM-4.6 列和 GLM-4.6 自己博客的柱状图对照, 能对上的有六项: AIME 25 93.9, GPQA 81.0, LiveCodeBench v6 82.8, HLE 17.2 (带工具 30.4), BrowseComp 45.1, SWE-bench Verified 68.0. 对不上的是 τ²-Bench: GLM-4.6 博客印 75.9, 名称后标 「Weighted」; 本篇大表和柱状图都是 75.2. 差 0.7, 博客没解释.

一个可能的来源是评测设置变了. 第 9 页脚注 3 说这次 τ²-Bench 在 Retail 和 Telecom 里加了额外提示, Airline 用了 Claude Opus 4.5 发布报告里的修正, 设置一变, 分数跟着变是正常的. 但博客没说 GLM-4.6 这一列是按新设置重跑的, 也没说其他对手是不是同样设置. 另一处是 Terminal-Bench: GLM-4.6 博客的 40.5 在本表找不到对应行, 本表只有 Terminal Bench Hard 23.6 和 Terminal Bench 2.0 24.5. GLM-4.6 博客里 AIME 25, GPQA, LiveCodeBench v6 三项的带工具分数, 本表也没有收. 结论是: 本篇里的 GLM-4.6 分数以本篇为准, 不和 GLM-4.6 博客的数混用.

## 6. thinking before acting 和三种思考方式

第 1 页只用半句话提到 「supports thinking before acting」, 说在 Claude Code, Kilo Code, Cline, Roo Code 里复杂任务明显提升, 没有给基准名和分数. 按字面, 这是在调用工具, 改代码之前先输出一段思考, 属于 TestingTime 一类做法: 推理时多花算力, 换回质量. 第 7 至 8 页的三种思考方式把这件事展开了.

Interleaved Thinking 是每一次回复和每一次工具调用之前都先思考, 博客说这是 GLM-4.5 起就有的功能, 这一代做了增强. Preserved Thinking 是新引入的: 在编程智能体场景里, 多轮对话中的思考块全部保留, 后面复用已有的推理, 不再从头推导, 博客说这能减少信息丢失和前后不一致, 适合长程任务. Turn-level Thinking 也是新引入的: 一个会话里可以逐轮开关思考, 轻量请求关掉以降低延迟和成本, 复杂任务打开以提升准确性和稳定性.

第 8 页那张示意图 (文件名 `p08-call-glm-4-7-api-via-z-ai-api-platform.png`, 名字取自下面的小节标题, 和画面无关) 画的是前两种. Turn 1 的三步里, 每一步的输入都带着之前所有 Reasoning, Tool call 和 Tool result; Turn 2 的第一步仍然带着 Turn 1 的 Reasoning 1 到 3 和 Answer 1, 再加上 User message 2. 图里没有 Turn-level Thinking 关掉思考的情形, 也没有画不保留思考块时的对照.

这一节缺的是数字. 三种方式各自开和关时分数差多少, 保留思考块让输入长了多少, 延迟和成本增加多少, 全篇没有. 唯一和评测挂钩的是脚注 1: τ²-Bench 和 Terminal Bench 2 开了 Preserved Thinking, 所以这两项的 87.4 和 41.0 是在开着思考保留时得出的. 「since GLM-4.5」 这个说法, 在同家族 GLM-4.5 论文里找不到 「Interleaved」 一词, 论文讲的是 thinking 和 non-thinking 两种模式的 「hybrid reasoning」, 所以只能当作博客自己的说法.

## 7. 三条脚注

脚注 1 是默认设置: temperature 1.0, top-p 0.95, max new tokens 131072, 多轮智能体任务 (τ²-Bench 和 Terminal Bench 2) 开 Preserved Thinking. 脚注 2 是 Terminal Bench 和 SWE-bench Verified: temperature 0.7, top-p 1.0, max new tokens 16384. 脚注 3 是 τ²-Bench: temperature 0, max new tokens 16384, 另加额外提示和 Airline 领域修正. 三组设置差别很大, 默认任务的生成上限是后两组的 8 倍.

脚注有几处边界没写清. Terminal Bench 2 同时落在脚注 1 和脚注 2 里, 应当是两条叠加; 脚注 2 的 「Terminal Bench」 是否包括 Terminal Bench Hard, 没说. SWE-bench Multilingual 没被点名, 按字面走默认设置, 和 SWE-bench Verified 的设置不一样. τ²-Bench 的额外提示和领域修正只说了对 GLM-4.7 怎么做, 对手的分数是否同样设置, 没说. 这些都不影响表上印的数, 但拿这些数和其他来源比时要记住.

## 8. 案例展示

第 3 到 7 页是四组展示: 前端网页 (Live Style, Cyber Domain, Artistic Portfolio), Artifacts (Voxel Pagoda, Particle Galaxy, Rubik's Cube), 巴黎海报, Zootopia 幻灯片. 每组都有 「GLM-4.7」 和 「GLM-4.6」 两个切换标签, 本意是对比两代的生成效果. 可 PDF 里选中的都是 GLM-4.7, GLM-4.6 那一版一次也没截到, 多个标签页也只截到第一个.

截到的内容也不完整. 前端网页只有首屏: 黑底, 「BOLD.」, 大字 「VISUAL IMPACT」 和一个 「START PROJECT」 按钮; md 把描边字和实心字交错成了 「IIMMPPAACCTT」. 体素宝塔的 3D 画面没加载出来, PDF 里那块位图一片空白, md 也没收. 巴黎海报只截到顶部一截云天, 文件名还错成了 `p06-slides-creation-showcases.png`. Zootopia 幻灯片要求 6 页, 预览里只露出第 1 页和第 2 页上半截. 所以第 1 页 Vibe Coding 那条 「cleaner, more modern webpages」, 「better-looking slides」, 在这份材料里只有 GLM-4.7 单方面的几张截图, 没有可比的对照.

## 9. 链接和抓取时间

第 1 页的 「Tech Report」 链到 `arxiv.org/abs/2508.06471`. 同家族目录里这篇论文开头印着 「arXiv:2508.06471v1 [cs.CL] 8 Aug 2025」, 标题是 「GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models」, 比本篇早 136 天. GLM-4.6 的博客用的也是这个链接. 按钮上只写 「Tech Report」, 读者很容易以为是 GLM-4.7 的报告. 本目录没有 GLM-4.7 自己的技术报告, 论文摘要里的总参数, 激活参数, 训练数据量都属于 GLM-4.5; 博客没说 GLM-4.7 沿用 GLM-4.5 的结构, 这些数不能挪过来.

另外两个链接也值得记下. 「GitHub」 按钮链到 `github.com/zai-org/GLM-4.5`, 和 GLM-4.5 论文给的代码地址相同; 第 9 页说部署说明在 「official GitHub repository」, 却没有链接; 第 10 页页脚的 GitHub 图标链到 `github.com/THUDM` 组织主页. 「Z.ai Coding Plan」 的链接带 `utm_campaign=glm5_launch`, 是 GLM-5 发布活动的参数. 再加上页脚 © 2026 和 PDF 生成时间 2026-09-25, 可以确定这份 PDF 抓的是 GLM-5 发布之后的网页, 链接可能被改过, 不一定是 2025-12-22 当天的原样.

## 10. 19 张图

19 张图按页分布: 第 1 页 3 张, 第 2 页 8 张, 第 6 页 1 张, 第 7 页 6 张, 第 8 页 1 张. 文件名和画面相符, 或者名字泛但不算错的有 13 张: `p01-image.png` (Z 字标), `p02-chart.png` 到 `p02-chart-6.png` 六张柱状图, `p02-image.png` (HLE 柱状图), 第 7 页的 academy-award, worldwide-hit, beloved-story 三个图标和 the-city, characters 两张卡片图. 其中 `p02-image.png` 打断了 chart 的编号, 所以 `p02-chart-4.png` 画的是第五项 SWE-bench Verified.

另外 6 张是拿相邻文字命名的, 和画面对不上: `p01-7-try-it-at-z-ai-...` 是 HuggingFace 的笑脸图标, `p01-glm-4-7-your-new-coding-partner-...` 是 Tech Report 前的文档图标, `p02-benchmark-performance-...` 是 BrowseComp 柱状图, `p06-slides-creation-showcases.png` 是巴黎海报顶部, `p07-explore-zootopia.png` 是幻灯片第 1 页的城市主图, `p08-call-glm-4-7-api-...` 是思考方式示意图. md 里还有几处非正文的字: 链接行的 「7」, 「Z」, 「S」 是图标, 第 2 页孤立的 「Z」 是评测图右上角的字标, 第 10 页的 「Z」 是页脚大字标, 「X0」 是 X 和 GitHub 两个图标.

## 11. 这篇能回答什么, 不能回答什么

能稳定回答的: GLM-4.7 在 2025-12-22 发布; 相对 GLM-4.6, SWE-bench Verified 从 68.0 到 73.8, SWE-bench Multilingual 从 53.8 到 66.7, Terminal Bench 2.0 从 24.5 到 41.0, HLE 带工具从 30.4 到 42.8, 增量都是百分点; 17 行大表全部高于 GLM-4.6, 但在六行上低于 DeepSeek-V3.2; 八项柱状图上对 Claude Sonnet 4.5 输在 SWE-bench Verified 和 Terminal Bench 2.0; 三种思考方式的定义; 三组采样设置; 权重在 HuggingFace 和 ModelScope, 支持 vLLM 和 SGLang. 这些都能在正文, 图或表里找到原数.

不能回答的: GLM-4.7 的参数量和结构, 上下文窗口多长, 三种思考方式各自贡献多少分, 保留思考块的开销, 大表里 Claude, GPT-5, GPT-5.1-High 三列的数, GLM-4.6 的 τ²-Bench 为什么从 75.9 变成 75.2, Coding Plan 的 1/7 价格和 3 倍额度是和哪一档比, 部署说明所在的仓库是哪个. Tech Report 链接给的是 GLM-4.5 论文, 不能拿来填这些空. `glm-4-7-bi.md` 记的 26 处疑点, 集中在链接, 基线, 表的截断, 两篇博客间对不上的数和图的文件名上.
