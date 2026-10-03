[OM-FREEPLAY] 材料不够 5000. 这是 Mistral AI 官网的 Devstral 2 发布页, 标题 「Introducing: Devstral 2 and Mistral Vibe CLI.」, 10 页, 10 张图, 不是论文. 下面只用这页印出来的数, 不从 Medium 3.5, Large 3 或同家族其他页面搬分数和参数. 柱状图和人评图的数都印在 PDF 嵌入的原图上; 散点图没印数, 从位置读出的尺寸和分数, 以及所有自己算的比例, 差值, 都标了估算.

- 发布: **December 9, 2025**, 署名 Mistral AI, 官网 RESEARCH 栏.
- 型号: Devstral 2 (123B), Devstral Small 2 (24B).
- 结构: Devstral 2 是 「123B-parameter dense transformer」; Small 2 只写了 24B 参数. 两者上下文窗口都是 256K.
- 许可: Devstral 2 用 modified MIT, Small 2 和 Mistral Vibe CLI 用 Apache 2.0.
- 价格: 当前 API 免费; 之后 Devstral 2 输入 $0.40, 输出 $2.00, Small 2 输入 $0.10, 输出 $0.30, 单位每百万 token.
- 部署: Devstral 2 至少 4 张 H100 级 GPU; Small 2 单卡, 也能纯 CPU. 推荐 temperature 0.2.
- 印出来的分数: SWE-bench Verified 柱状图 14 个数; 人评图 2 行 x 3 段, 共 6 个数; 散点图 9 个点, 无数值.
- 宣称: SOTA 开放代码 agent 模型, 成本效率最高是 Claude Sonnet 的 7 倍, Vibe CLI 能把 PR 周期缩短一半, Kilo Code 头 24 小时 17B token.
- 没印的: 层数, 宽度, 注意力结构, 词表, 训练数据, 训练 token 数, 后训练方法, 除 SWE-bench Verified 以外的任何基准, 推理速度, Small 2 的图像评测.

## 1. 这页的底子

这页能用的材料分三块: 正文十来段, 三张图 (SWE-bench Verified 柱状图, 尺寸对分数的散点图, 人评胜负图), 一张产品卡片. 和模型本身有关的硬信息很少, 参数量, dense, 256K, 许可, 价格, 部署门槛, 再加一个 SWE-bench Verified 分数, 就是全部. 训练怎么做的, 结构细节是什么, 一句都没有.

材料本身也有损. 每一页都叠着 cookie 横幅, 转出的 Markdown 只剩零碎半句, 像 「eration coding model family stral Small 2 (24B)」 这种. PDF 文本层保住了全部正文, PDF 里嵌着的三张图原图也完整, 被站点顶栏挡住的标题, 图例, 人评脚注都能读到. 这篇分析以 PDF 文本层和嵌入原图为准, 转出的 Markdown 只用来对页码和图片文件名.

## 2. 两个型号, 两种许可

Devstral 2 这一代分两档: 123B 的 Devstral 2 和 24B 的 Devstral Small 2, 尺寸比约 5.1 倍. 页面对大的那个写了 「dense transformer」, 对小的那个只写 「24B-parameter model」, 没说它是不是也是 dense. 两者上下文窗口都是 256K, 这是页面明确写的共同点. 除此以外, 结构上再没有别的信息.

许可分成两种, 是这页少有的具体差别. Devstral 2 用 「modified MIT license」, Small 2 用 Apache 2.0, Vibe CLI 也是 Apache 2.0. 页面说两者都 「open-source and permissively licensed」, 可 MIT 改了哪里没交代; 大模型用改过的许可, 小模型用标准许可, 这个分法本身说明大模型带了额外条款, 条款内容要看许可原文. 页面在 「open-source」 和 「open-weight(s)」 之间来回换着用, 正文说开源, 柱状图分组和产品卡片说开放权重, 页面没区分两者.

## 3. SWE-bench Verified: 72.2 排在哪

整页唯一的基准就是 SWE-bench Verified. 柱状图里开放权重 10 个, 闭源 4 个. Devstral 2 72.2, 在开放权重一组排第 2, 只比 Deepseek V3.2 的 73.1 低 0.9 个点; Kimi K2 thinking 71.3 第 3. Small 2 68.0, 和 GLM 4.6 并列第 6, 前面还有 Minimax M2 69.4, Qwen 3 coder plus 69.6. 开放权重一组里最低的是 DeepSWE 42.2, 其次 CWM 53.9, GPT-OSS-120B 62.4.

所以页面上两句话的力度不一样. 「one of the best open-weight models」 和图是吻合的; Highlights 的 「SOTA open model for code agents」 和正文的 「sets the open state-of-the-art for code agents」 就和图不吻合, 同一张图里有一个开放权重模型分数更高. 闭源那边, Gemini 3 Pro 76.2, Claude 4.5 Sonnet 77.2, GPT 5.1 Codex Max 77.9, 分别比 Devstral 2 高 4.0, 5.0, 5.7 个点, 只有 Grok Code Fast 1 的 70.8 比它低. 图上那条红色虚线画在 Devstral 2 柱顶的高度, 线上方就是这四个模型: 三个闭源, 一个开放权重.

## 4. 以小博大: 倍数和散点图

这页的核心卖点是 「fraction of the parameters」. 正文给了四个倍数: 比 DeepSeek V3.2 小 5 倍和 28 倍, 比 Kimi K2 小 8 倍和 41 倍. 拿 123B 和 24B 反推, Kimi K2 两个倍数都指向约 984B, 对得上; DeepSeek V3.2 一个指向 615B, 一个指向 672B, 差了 57B. 散点图上 DeepSeek v3.2 落在约 670B, 用这个位置算, 123B 是约 5.4 倍, 24B 是约 27.9 倍, 所以 「5x」 是往下取整, 「28x」 是四舍五入. 页面正文没印这两个对手的参数量.

散点图横轴是参数量, 纵轴是 「SWE-Bench Verified Regular Performance (%)」, 左上角一块浅绿三角, 两个 Devstral 点都在里面, 其他点都在外面. 三角的斜边大致从 (0, 62.7) 到 (320B, 75), 意思是 「同等参数下分数更高」. 这个三角的画法决定了只有 Devstral 能落进去: 离它最近的 MiniMax M2 在约 225B, 69.5, 斜边在那个位置约 71.4, 它就在外面. 三角边界怎么定的, 页面没说; 「Regular」 是什么口径, 页面也没说.

散点图和柱状图有两处接不上. 一是 CWM, 柱状图 53.9, 散点图位置约 52, 而只在散点图出现的 Qwen 3 coder flash 反而落在约 54, 看起来像两个点的位置或标签有一处不准. 二是成员不同: 散点图多了 Qwen 3 coder flash, 少了 DeepSWE, GPT-OSS-120B 和全部闭源模型. 闭源模型不公开参数量, 放不进这张图, 所以散点图只能说明 Devstral 在开放权重里参数效率高, 说明不了它离闭源模型有多远.

## 5. 人评: 胜 DeepSeek, 输 Sonnet

人评只比了两个对手. 对 Deepseek V3.2: 胜 42.8%, 平 28.6%, 负 28.6%, 胜负比约 1.5. 对 Sonnet 4.5: 胜 21.4%, 平 25.5%, 负 53.1%, 负是胜的约 2.5 倍. 正文对第一行说 「clear advantage」, 对第二行说 「significantly preferred」 和 「a gap with closed-source models persists」, 这两个判断和图的方向一致. 这页在自评上算坦白, 输给 Sonnet 4.5 的数照样印了出来.

样本量是这张图的软肋. 正文说 「independent annotation provider」, 图下有一块 「Surge」 标签和一行脚注 「Evaluations judged by humans conducted by a third party.」, 但没有题数, 评审人数, 判定标准. 用一位小数反推能对上的最小分母: Sonnet 4.5 一行是 98 (21 胜 25 平 52 负); Deepseek V3.2 一行按四舍五入最小是 269, 如果 42.8 是 3/7 截断得来, 7 就够. 分母小到个位数时, 一道题翻转就能让胜率变十几个点, 这张图的可信度取决于一个页面没给的数.

还有一层口径问题. 任务 「scaffolded through Cline」, 也就是说比的是 「模型 + Cline」 这一套, 而第 5 页引的第一段伙伴评价就来自 Cline. 评测搭在合作伙伴的工具上, 本身不算问题, 但 Cline 对三家模型的提示词和工具定义是否一样, 页面没说.

## 6. 价格和 「7x」

价格是这页唯一给全的商业数字. Devstral 2 输入 $0.40, 输出 $2.00, 输出是输入的 5 倍; Small 2 输入 $0.10, 输出 $0.30, 输出是输入的 3 倍. 两档之间输入差 4 倍, 输出差约 6.7 倍. 按输入输出 3:1 混合, Devstral 2 约 $0.80, Small 2 约 $0.15 每百万 token (混合比例为假设值). 第 8 页产品卡片写 $0.4 和 $2, 和正文一致. 免费期多长, 页面没写.

Highlights 第 2 条 「Up to 7x more cost-efficient than Claude Sonnet at real-world tasks」 核不了. 页面没印任何一版 Claude Sonnet 的价格, 没说是 Sonnet 4.5 还是别的版本, 也没说 「cost-efficient」 是按单价算, 按完成任务的总花费算, 还是按分数除以花费算. 「Up to」 又说明 7 倍是最好的情况. 把这一条和人评放在一起看更微妙: 人评里 Sonnet 4.5 负率 53.1%, 如果成本效率是按 「完成的任务数 / 花费」 算, 质量差距会吃掉一部分价格优势, 页面没给算法.

## 7. 部署门槛

Devstral 2 「requires a minimum of 4 H100-class GPUs」. 按 BF16 算 123B 权重约 246 GB, 4 张 80 GB 卡共 320 GB, 剩约 74 GB 给 KV cache 和激活. 256K 满长上下文时 KV cache 要多少, 取决于层数, 头数, 是否用 GQA 这类结构, 这些页面全没写, 所以 「4 张够不够跑满 256K」 这页回答不了. 如果按 FP8 部署, 权重约 123 GB, 余量就宽得多, 页面也没说推荐精度.

Small 2 的门槛写得更宽: 「built for single-GPU operation」, 能在 DGX Spark 和 GeForce RTX 上跑, 还能 「CPU-only configurations with no dedicated GPU required」. 按 BF16 算 24B 权重约 48 GB, 超过常见消费级显卡的显存, 能放进单张 RTX 大概率靠量化. 页面没给量化格式, 没给量化后的 SWE-bench 分数, 也没给纯 CPU 的速度. 第 7 页第三段还写成了 「Devstral Small」, 少了 「2」, 从上下文看指的是同一个模型.

## 8. Devstral Small 2: 本地和图像

Small 2 的定位是本地. 第 5 页说它 「fast inference, tight feedback loops, and easy customization—with fully private, on-device runtime」, 第 2 页说它 「places firmly among models up to five times its size」. 五倍是 120B. 柱状图里名字带尺寸的 GPT-OSS-120B 是 62.4, Small 2 高 5.6 个点; Devstral 2 是 123B, 比 Small 2 高 4.2 个点. 和 Small 2 同分 68.0 的 GLM 4.6, 散点图里在约 450B, 已经远超五倍.

这页里 Small 2 有一项 Devstral 2 没有写的能力: 「It also supports image inputs, and can power multimodal agents.」 第 8 页 Devstral 2 的产品卡片标 「TEXT-TO-TEXT」. 页面没解释为什么小的那个支持图像, 大的那个没写; 也没有任何图像相关的分数, 图像输入走什么编码器, 图像能力对 SWE-bench 这类任务有没有用, 都没说.

## 9. Mistral Vibe CLI

这篇公告有一半篇幅在讲 Vibe CLI. 它是 Apache 2.0 的开源命令行编程助手, 由 Devstral 驱动, 可以在终端里用, 也能通过 Agent Communication Protocol 接进 IDE, 已作为 Zed 扩展上线. 功能列表是四条: 扫描文件结构和 Git 状态做上下文, 用 @ 引用文件, 用 ! 执行 shell, 用斜杠命令改配置, 多文件理解, 以及持久化历史和主题. 另外能以程序方式调用, 能开关工具执行的自动批准, 用 config.toml 配本地模型和服务商, 控制工具权限.

能核的数字只有一个 「can halve your PR cycle time」, 而这个数没有任何支撑: 多少个 PR, 什么项目, 缩短前后各多久, 页面都没给. 视频 「Mistral Vibe CLI – tool-fetch with MCP」 在抓页时是空白播放器. Vibe CLI 和模型的关系也值得注意: 人评用的是 Cline 而不是 Vibe CLI, 所以页面上所有模型分数都和 Vibe CLI 无关. 第 7 页推荐 「following the best practices defined for Mistral Vibe CLI」, 这些最佳实践是什么, 页面没列.

## 10. 伙伴评价和 17B token

两段伙伴引语各有一个可以拆的说法. Cline 说 「tool-calling success rate on par with the best closed models」, 没给成功率, 没说和哪个闭源模型比. 这句和同一页人评里 Sonnet 4.5 负率 53.1% 并不冲突, 工具调用成功只是能不能跑通, 人评比的是结果好不好, 但读者容易把两者混在一起.

Kilo Code 说 「surpassing 17B tokens in the first 24 hours」, 摊下来平均约 19.7 万 token 每秒. 这是用量, 不是质量; 何况是 「stealth launch」, 也就是先以别的名字匿名上线. 页面没说匿名期间模型叫什么, 也没说这 17B 是输入输出合计, 还是只算其中一边. 当时 API 又是免费的, 免费期的用量能说明多少真实需求, 页面没法回答.

## 11. 谱系: 这页能说什么

这页给的谱系线索只有名字和定位. 「Devstral 2」 和 「next-generation coding model family」 说明前面有过一代 Devstral, 可图里没有一根柱是上一代 Devstral, 正文也没给上一代的任何分数. 所以 「这一代比上一代强多少」 这页回答不了. Vibe CLI 是 「built for Devstral」, 名字上是这一代新加的配套工具, 不是模型本身的变化.

页面能说的是尺寸策略. 两档同时发, 大档 123B dense 走数据中心, 小档 24B 走单卡和本机, 许可一松一更松, 价格差 4 到 6.7 倍. 页面把 123B 称作 「compact」, 这是相对 DeepSeek V3.2 和 Kimi K2 这类数百 B 到约 1000B 的对手说的 (对手尺寸按散点图位置估算). 页面没提同家族的其他 Mistral 模型, 也没拿任何一个 Mistral 旧模型做对照, 家族内部的位置, 不该用别的页面的数去补.

## 12. 本页对不上的数字

正文和图之间: 「SOTA open model」 和 「sets the open state-of-the-art」 与柱状图不符, Deepseek V3.2 73.1 高于 Devstral 2 的 72.2; 「5x smaller than DeepSeek V3.2」 和 「28x」 反推出来的对手尺寸差 57B (615B 对 672B), 按散点图位置 5 倍是向下取整; CWM 柱状图 53.9, 散点图位置约 52, 只出现在散点图里的 Qwen 3 coder flash 反而约 54. 正文写 「Kimi K2」, 两张图都写 「Kimi K2 thinking」; 正文写 「DeepSeek V3.2」, 柱状图和人评图写 「Deepseek V3.2」, 散点图写 「DeepSeek v3.2」.

页面自身: 「Up to 7x more cost-efficient than Claude Sonnet」 和 「halve your PR cycle time」 两个倍数没有一个能用页面上的数复算; Small 2 支持图像输入, Devstral 2 卡片标 「TEXT-TO-TEXT」, 没有解释; 第 7 页 「Devstral Small」 少了 「2」; 第 3 页正文句尾多出一个 「hardware.」, PDF 文本层和截屏里都有; 页脚 「Mistral AI © 2026」 和正文日期 December 9, 2025 差一年, 页脚是抓页时的外壳. 转换稿和 PDF 之间: 转出的 Markdown 丢了大半正文, 但留下来的数字 (72.2%, 68.0%, $0.40/$2.00, $0.10/$0.30) 和 PDF 一致.
