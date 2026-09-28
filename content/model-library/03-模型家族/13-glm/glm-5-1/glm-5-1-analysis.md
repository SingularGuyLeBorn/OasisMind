> [OM-FREEPLAY] 材料不够 5000. 源文 `glm-5-1.md` 是 Hugging Face 上 `zai-org/GLM-5.1` 模型页的 MinerU 抓取, 6 页, 7 张图. 作者写的卡片正文只有两段简介, 一张柱状图, 一张 18 行的基准表, 一个部署框架列表和一条引用; 其余是页面自带的标签, 计数和按钮. 全篇没有结构说明, 训练方法和数据. 下文只写能指回原句, 页面元素或表中数字的内容, 不编造架构和参数量, 也不把 `glm-5` 目录那篇论文里的数写成这张卡印的数.

# GLM-5.1 模型卡: 一张 Hugging Face 页面能说明什么

来源: 同目录 `glm-5-1.md`, 对照同目录 `glm-5-1.pdf` (PDF 生成时间 2026-09-25). 逐段英中对照和 19 处疑点见 `glm-5-1-bi.md`. 下文的分数都出自卡片正文的图和表, 或页面自带的评测结果栏; 引到 `glm-5` 目录论文的地方, 一律注明 「论文」, 只作核对.

## 1. 材料性质: 模型页抓取, 不是技术报告

六页的分布是这样的. 第 1 页是 Hugging Face 页面的头部: 仓库名 zai-org/GLM-5.1, 点赞和关注数, 八个标签, arXiv 编号, 许可证, 下载量, Safetensors 信息栏和在线试用框. 第 2 页是派生模型数, 引用它的 Space, 合集, 关联论文和页面自带的评测结果. 第 3 页到第 5 页上半才是作者写的卡片正文: 社区链接, 简介, 一张编程评测柱状图, 一段关于长任务的说明, 一张分两页印的基准表. 第 5 页下半是本地部署和引用, 第 6 页是 BibTeX 后半段和 Hugging Face 页脚.

所以这份材料是一张网页快照, 有两种来源混在一起. 一种是 Hugging Face 平台生成的元素, 比如 「754B params」, 「Downloads last month 73,985」, 「Spaces using zai-org/GLM-5.1 84」; 另一种是作者写的正文. 前者是抓取当时的计数或平台读出的元数据, 后者才是作者对 GLM-5.1 的陈述. 两者引用时要分开说, 比如 754B 不能写成 「卡片称 GLM-5.1 有 754B 参数」, 只能写成 「页面的 Safetensors 信息栏显示 754B」.

## 2. 卡上的名字和 GLM-5 论文是两回事

页面上和论文有关的地方有四处. 第 1 页标签 「arxiv:2602.15763」; 第 2 页 「Paper for zai-org/GLM-5.1」 下挂着 「GLM-5: from Vibe Coding to Agentic Engineering」, 编号 2602.15763, 显示 「Published Feb 17」; 第 3 页正文写 「GLM-5 Technical report」, 链到同一个 arXiv 编号; 第 5 页到第 6 页的 BibTeX 标题也是这篇. 同家族 `glm-5` 目录的源文开头印着 「arXiv:2602.15763v2 [cs.LG] 24 Feb 2026」, 标题相同, 全文搜不到 「GLM-5.1」.

结论是: 卡片挂的论文和 `glm-5` 目录里的论文是同一份, 但那是 GLM-5 的报告, 不是 GLM-5.1 的. 页面借 arxiv 标签自动把它显示在 「Paper for zai-org/GLM-5.1」 下面, 读者很容易当成这一代的报告. 卡片自己的措辞倒是清楚的, 引用说明写的是 「If you find GLM-5.1 or GLM-5 useful」, 请引用 「our technical report」, 并没有说报告里写了 GLM-5.1. 因此论文里的结构, 训练数据, 强化学习设计和分数, 都不能挪来描述 GLM-5.1.

还有两个日期对不齐的小地方. 页面显示论文 「Published Feb 17」, 论文源文印的是 v2 的 24 Feb 2026, 页面没说它显示的是哪一版. 卡片本身没有发布日期, 能看到的时间只有论文日期, 合集 「Updated Apr 7」 和 PDF 生成时间. 第 3 页那句 「GLM-5.1 will be available on chat.z.ai in the coming days」 是写卡时的预告, 抓取时还留在页面上, 后来有没有上线, 这份材料回答不了.

## 3. 页面元数据: 754B, 张量类型, 许可证和权重

Safetensors 信息栏写着 「Model size 754B params」, 张量类型一栏是 BF16 和 F32. 这是页面平台显示的数, 不在正文里; 正文从头到尾没有参数数字, 没有激活参数, 没有层数. 论文给 GLM-5 的总参数是 744B, 并说明这个数计入 MTP 层, 不计词嵌入和输出层. 754B 和 744B 差 10B, 是统计口径不同还是模型本身不同, 卡片没交代. 所以关于 GLM-5.1 的规模, 能写的只有一句: 页面 Safetensors 信息栏显示 754B, 张量类型 BF16 和 F32.

标签 `glm_moe_dsa` 也属于这一类. 它是一个可点的筛选标签, 第 5 页 Transformers 文档的文件名也叫 `glm_moe_dsa.md`, 但卡片没有解释这个名字代表什么. 这里不按字面去拆这几个字母, 也不从论文补结构; 要写结构, 得等 GLM-5.1 自己的技术文档.

许可证和权重在这一页上是两件事. 「License: mit」 是标题下的一个元数据标签, 正文没有许可证章节, 没写 MIT 覆盖哪些文件, 也没写使用条件. 权重这一侧的证据是 Safetensors 信息栏, Files 标签页和第 5 页的部署框架列表, 而正文一次也没出现 「weights」 这个词. 能照抄的是两条独立的事实: 仓库标注的许可证是 mit; 仓库里有 Safetensors 文件. 「权重以 MIT 许可开放」 这句话, 卡片本身没有写, 需要读仓库里的许可证文件才能确认.

## 4. 简介的三句宣称, 和表上的数

简介第一段有三处可以对数. 「state-of-the-art performance on SWE-Bench Pro」: 表里 GLM-5.1 是 58.4, 是这一行唯一加粗的数, 比 GLM-5 的 55.1 高 3.3, 比可见的 Qwen3.6-Plus 56.6, Minimax M2.7 56.2, Kimi K2.5 53.8 都高. 「leads GLM-5 by a wide margin on NL2Repo」: 42.7 对 35.9, 高 6.8. 「and Terminal-Bench 2.0」: 按统一的 Terminus-2 框架是 63.5 对 56.2, 高 7.3; 按各家自报的最好成绩是 69.0 对 56.2, 都是 Claude Code 框架, 高 12.8.

把 18 行全部和 GLM-5 比一遍, GLM-5.1 有 15 行更高, 3 行更低. 更低的三行都是数学题: AIME 2026 95.3 对 95.4, HMMT Nov. 2025 94.0 对 96.9, HMMT Feb. 2026 82.6 对 82.8. 提升最大的一行不是简介点名的两项, 而是 CyberGym, 68.7 对 48.3, 高 20.4; 其次是 Terminal-Bench 自报一行的 12.8. BrowseComp 高 6.0, 带上下文管理的 BrowseComp 高 3.4, 其余各项在 0.2 到 2.7 之间. Vending Bench 2 是美元金额, $5,634.41 对 $4,432.12, 多 $1,202.29, 约 27.1%.

第二段讲长任务: 此前的模型 「exhaust their repertoire early」, GLM-5.1 能 「sustain optimization over hundreds of rounds and thousands of tool calls」, 「The longer it runs, the better the result」. 这些是定性宣称, 卡片没有配曲线, 没有轮数和得分的对应, 也没说 「Previous models」 在哪类任务上停滞. 页面评测结果栏里有 Long-Horizon-Terminal-Bench 一项, 只印了 「2*」, 正文也没有引用它. 所以 「数百轮」 和 「数千次工具调用」 只能当作宣称照抄.

## 5. 编程评测柱状图: 三项平均, 框架混用

第 3 页的图标题是 「Coding Performance Evaluation」, 副标题 「3 Benchmarks: SWE-Bench Pro, Terminal-Bench 2.0, NL2Repo」, 但每个模型只有一根柱一个数: GPT-5.4 58.0, Claude Opus 4.6 57.5, GLM-5.1 54.9, Gemini 3.1 Pro 52.0, Qwen3.6-Plus 52.0, MiniMax M2.7 51.0, Kimi K2.5 45.5. 图和正文都没说这个数怎么来的. 拿大表反推, 三项取平均对得上: GLM-5.1 (58.4 + 63.5 + 42.7) / 3 = 54.87, Qwen3.6-Plus (56.6 + 61.6 + 37.9) / 3 = 52.03, Kimi K2.5 (53.8 + 50.8 + 32.0) / 3 = 45.53, 四舍五入后和图上一致.

反推也暴露出一处口径问题. MiniMax M2.7 在 Terminus-2 那一行是 「-」, 图上的 51.0 要用它的 Claude Code 自报分 57.0 才算得出: (56.2 + 57.0 + 39.8) / 3 = 51.0. GLM-5.1 用的却是 Terminus-2 的 63.5, 若换成它自报的 69.0, 平均会是 56.7. 同一张图里 Terminal-Bench 2.0 混用了两种框架的分数, 图上没有标注. 这不影响 GLM-5.1 自己的 54.9, 但 GLM-5.1 和 MiniMax M2.7 的 3.9 分差, 口径不完全一致.

图里还有三处核对不了. GPT-5.4 和 Gemini 3.1 Pro 不在大表可见的列里, 58.0 和 52.0 没有底数可查. Claude Opus 4.6 的 57.5, 如果 「C Op」 列就是它, 三格被截断后露出的是 57, 65, 49, 相加 171, 平均 57.0, 差的 0.5 要靠看不见的小数补, 能补上但验证不了. 另外, 简介拿来比的 GLM-5 不在这张图里; 按表算 GLM-5 的三项平均是 49.07, 这是反推的数, 卡片没印.

## 6. 基准表: 截断的一列和粗体

基准表 18 行, 分两页印, 七个可见列: GLM-5.1, GLM-5, Qwen3.6-Plus, Minimax M2.7, DeepSeek-V3.2, Kimi K2.5, 以及只露出 「C / Op」 两个字母的一列. 这一列在页面右边缘被截断, 36, 53, 95, $8 这些数看着像整数, 实际是被切掉了后半截. 第 3 页柱状图里有 Claude Opus 4.6, 按首字母推断 「C Op」 很可能是它, 表头没有写全. 这一列的数不能拿来算差值.

粗体的分布提示右边不止这一列. PDF 里加粗的格子有八个: HLE 带工具的 C Op 53, HMMT Nov. 2025 的 GLM-5 96.9, SWE-Bench Pro 的 GLM-5.1 58.4, NL2Repo 的 C Op 49, CyberGym 的 GLM-5.1 68.7, BrowseComp 的 GLM-5.1 68.0, MCP-Atlas 的 Qwen3.6-Plus 74.1, Vending Bench 2 的 C Op $8. HLE, AIME 2026, GPQA-Diamond, Tool-Decathlon 等十行在可见范围内一个粗体都没有, IMOAnswerBench 可见最高的 83.8 有两格并列, 也没加粗. 如果粗体标的是整行最高, 这些行的最高分就在被截掉的列里, 柱状图里的 GPT-5.4 和 Gemini 3.1 Pro 可能就在那里. 这是推断, 表上看不到. md 抓取时粗体全部丢了, 名称里的空格也丢了, 比如 「SWE-BenchPro」, 「VendingBench2」, 跨行的单元格还被拆成了几行.

GLM-5 这一列要单独说. 和论文比, HLE 30.5, HLE 带工具 50.4, HMMT Nov. 2025 96.9, IMOAnswerBench 82.5, GPQA-Diamond 86.0, BrowseComp 62.0 和 75.9 一致; Terminal-Bench 两行的 56.2, 在论文里写作 「56.2 /」 加一个带 † 的数, 卡片只取了斜杠前面的 56.2, 所以两行同分不是抄错. 不一致的有 CyberGym (卡片 48.3, 论文 43.2), MCP-Atlas (69.2 对 67.8), Tool-Decathlon (38.0 对 39.2); 这三行 DeepSeek-V3.2 和 Kimi K2.5 的数和论文相同, 只有 GLM-5 这一格不同, 卡片没说原因. 还有几行基准名就不同: 卡片 AIME 2026 对论文 AIME 2026 I, 卡片 HMMT Feb. 2026 对论文 HMMT Feb. 2025, 卡片 τ³-Bench 对论文 τ²-Bench. 讲这张卡时, GLM-5 的分数照卡片写.

## 7. 页面自带的评测结果栏和部署信息

第 2 页 「Evaluation results」 是平台的评测结果栏, 不是作者正文. 前三行和正文大表一致: GPQA Diamond 86.2, SWE Bench Pro 58.4, MathArena Aime 2026 95.3. 后面是正文没有的: Long-Horizon-Terminal-Bench 的 「Lhtb Solved」 印 2, Chi Bench 和 Prior Authorization 各印 18.7, 评测框架 「OpenAI Agents」 后面被截断, 另有 2 项折叠. PDF 链接显示前三行各链到仓库里的一个 `.eval_results` 文件, LHTB 链到讨论区第 42 号, Chi Bench 链到第 38 号, 来源论文编号 2605.16679.

这一栏有好几个星号, 页面没有解释. SWE-Bench Pro 带星号, GPQA 和 AIME 不带, 和按链接分出的两类也不重合, 这里不替它下结论. 「2」 没有单位, 只能照抄成 「Lhtb Solved: 2」. 这几行后加的结果, 和正文里 「hundreds of rounds」 那段话之间, 卡片没有建立任何联系.

部署一节列了五个框架和最低版本: SGLang v0.5.10+, vLLM v0.19.0+, xLLM v0.8.0+, Transformers v0.5.3+, KTransformers v0.5.3+. Transformers 和 KTransformers 写着同一个版本号, PDF 文字层也是如此, 两个不同项目的最低版本恰好一样, 卡片没说明, 这里照抄. 五条链接里名字带 GLM-5.1 的只有 SGLang 的 cookbook 和 KTransformers 的教程; vLLM 的文件叫 `GLM5.md`, xLLM 的示例放在 `zai-org/GLM-5` 仓库里. 这一节没写显存和硬件需求. 第 3 页的 GitHub 链接和微信二维码也都指向 `zai-org/GLM-5` 仓库, 页面上没有叫 GLM-5.1 的代码仓库.

## 8. 七张图: 一张评测图, 一条走势线, 五个图标

七张图按页分布是第 1 页 2 张, 第 3 页 3 张, 第 6 页 2 张. 能读出数字的只有 `p03-but-the-most-meaningful-leap-goes-beyond-first-pass.png`, 也就是第 5 节那张柱状图. md 里的图只截了柱子部分, 标题和副标题是从图里识别出来的字, 放在图前面成了两行正文; PDF 里整张图是 5820x3438 的位图, 链到 `zai-org/GLM-5` 仓库的 `bench_51.png`. `p01-search-models-datasets-users.png` 是下载量旁边的紫色走势线, 没有坐标轴和刻度, 读不出数.

其余五张都是界面图标: `p01-image.png` 黄色手形, `p03-image.png` 卡片正文顶部的 Z 字标, `p03-join-our-wechat-...png` 挥手图标, `p06-bib.png` 页脚最下方的 Hugging Face 笑脸, `p06-system-theme.png` 「System theme」 按钮左边的显示器图标. 文件名大多取自相邻文字: 柱状图取自图下那段正文, 走势线取自搜索框占位文字, 笑脸取自它前面的 「bib」 代码块. 七张里文件名和画面相符的一张都没有, 名字泛但不算错的是 `p01-image.png` 和 `p03-image.png`.

md 还有几处和 PDF 对不上的地方, 都和图标有关. 第 2 页合集标题前的 「品」 是图标被识别成了汉字, PDF 文字层没有这个字. 第 3 页社区链接那四行在 PDF 里各有一个图标, md 丢了定位针 📍, 挥手被切成图, 另两个留成字符. 第 1 页 Community 后面的数字 42 和推理服务商旁的两个小图标也没抓到.

## 9. 这张卡能回答什么, 不能回答什么

能照抄引用的: 仓库名 zai-org/GLM-5.1, 标签和 mit 许可证标注; 页面 Safetensors 信息栏显示 754B, 张量类型 BF16 和 F32; 简介的定位是 「flagship model for agentic engineering」; 编程评测图上七个模型的汇总分, GLM-5.1 是 54.9; 18 行基准表里六个可见模型的分数; 评测结果栏的几项分数; 五个部署框架和最低版本; 引用条目是 GLM-5 的技术报告. 这些都能在页面上找到原字原数.

不能回答的: GLM-5.1 的结构, 激活参数, 训练数据和训练方法; 754B 和论文 744B 的差从哪来; 柱状图的汇总分是不是就是三项平均 (反推能对上, 卡片没写); 「C Op」 列的完整名字和完整数字, 以及被截掉的列有哪些模型; GLM-5 那三格为什么和论文不同; 评测结果栏里的星号是什么意思; mit 许可证是否覆盖权重文件; 发布日期和 chat.z.ai 是否已上线. 页面挂的论文是 GLM-5 的, 不能拿来填这些空. `glm-5-1-bi.md` 里记了 19 处疑点, 集中在论文归属, 754B 的来源, 许可证和权重的关系, 柱状图的算法, 表格截断和七张图的性质上.
