---
title: "GLM-5-Turbo 模型页: 一张规格栏和一张没有刻度的雷达图"
category: "模型库"
tags: ["GLM", "技术解析"]
published: true
excerpt: "页面上能看到的控件都属于文档站: 顶部的 「Copy page」 按钮, 末尾的 「Was this page helpful? Yes No」, 页眉页脚各有一个站点标志 Z 和一个搜索框残片 「Q :」."
---
源材料是 Z.ai 文档站的一张模型页, 共 7 页, 不是技术报告.

# GLM-5-Turbo 模型页: 一张规格栏和一张没有刻度的雷达图

来源是同目录 `glm-5-turbo.md`, 由 MinerU 从 `glm-5-turbo.pdf` 抽出, 第 1 页到第 7 页, 引用了 7 张图. 逐段对照和疑惑在 `glm-5-turbo-bi.md`. 几处 md 丢字或认错的地方, 按 PDF 文字层核对过, 源文件没有改动.

## 1. 这是一张文档站页面

页面上能看到的控件都属于文档站: 顶部的 「Copy page」 按钮, 末尾的 「Was this page helpful? Yes No」, 页眉页脚各有一个站点标志 Z 和一个搜索框残片 「Q :」. Resources 里的两个链接都指向 `docs.z.ai`. 整页的结构是概览, 规格栏, 能力图标, 一段介绍, 一个基准说明, 资源链接, 快速开始代码, 这是产品文档的写法.

它没有作者, 没有日期, 没有版权年, 没有参考文献, 也没有方法节. 发布日期引用时只能写 「未印」. 页面里所有关于训练的说法都是一句话的描述, 例如 「since the training phase」, 「From training data construction to the design of optimization objectives」, 后面没有跟任何配置或数据量.

## 2. 和 GLM-5 的关系只印了一句比较

GLM-5 在全文只出现一次, 在第 3 页: 「GLM-5-Turbo delivers substantial improvements over GLM-5 in OpenClaw scenarios」. 这句话把 GLM-5 放在被比较的一侧, 说明页面把两者当成两个可以分别评测的模型. 页面没有说 Turbo 是否由 GLM-5 继续训练而来, 也没有说两者共用结构.

所以 GLM-5-Turbo 的层数, 总参数, 激活参数, 注意力形式, 训练步数, 本页全都没有. 同家族目录里另有 GLM-5 的材料, 那是另一份来源, 讲的是另一个名字的模型, 不能拿来给 Turbo 填空. 名字里的 「5」 能说明它归在 GLM-5 这一代的产品线下, 能说的也就这么多.

## 3. 规格栏: 200K 上下文和 128K 输出, 没有价格

第 1 页规格栏印了六项: 定位 「ClawBench Enhanced Model」, 输入模态 Text, 输出模态 Text, 上下文长度 200K, 最大输出 128K token, 能力 Thinking Mode, Streaming Output, Function Call. 第 2 页又列了三项能力: Context Caching, Structured Output, MCP. 输出模态那一栏源文拼成 「Modalitie」, 少一个 s.

价格不在这一页. 7 页里没有任何计价单位, 两个资源链接也只是 API 文档和接入指南. 200K 和 128K 的 K 按 1000 还是 1024 算, 页面没注明. 另外, 定位栏写的是 ClawBench, 第 3 页推出的基准叫 ZClawBench, 差一个 Z, 页面没有说明两者是否同一个东西.

## 4. 四项能力, md 丢了一项

概览列了四项加强的能力: tool invocation, command following, timed and persistent tasks, long-chain execution. 正文在 「Introducing GLM-5-Turbo」 下也按这个顺序展开, 每项一个小标题: Tool Calling, Instruction Following, Scheduled and Persistent Tasks, High-Throughput Long Chains. 概览里的 「timed」 和正文里的 「Scheduled」 措辞不同, 指的是同一项.

MinerU 的 md 在第 2 页和第 3 页交界处把第三项整段丢了, 只剩句尾 「complex, long-running tasks.」. PDF 文字层保留了这一段: 针对定时触发, 持续执行和长时任务优化, 更好地理解和时间有关的要求. 四项的描述都没有分数, 「No Failures」 这样的小标题是宣传措辞, 页面没有给失败率. 第四项里出现的 「Lobster tasks」 全文只有这一处, 页面没有定义.

## 5. ZClawBench 的文字部分

第 3 页介绍 ZClawBench, 说它是基于大量真实 OpenClaw 用例构建的端到端基准, 专门针对 OpenClaw 生态里的智能体任务. 页面列出当前工作负载的五类: environment setup, software development, information retrieval, data analysis, content creation, 以及五类用户: 效率型用户, 金融从业者, 运维工程师, 内容创作者, 研究分析师.

这一节唯一的数字是 Skills 使用率 「from 26% to 45% in a short period of time」. 分母, 时间跨度和数据来源都没写, 它描述的是生态趋势, 不是模型得分. 第 4 页说数据集和完整评测轨迹 「now publicly available」, 但 Resources 里没有数据集链接, 页面上找不到下载地址.

## 6. 雷达图读得出什么, 读不出什么

`p04-office-daily-tasks.png` 是全文唯一的数据图. 它有五条轴, 能读出标签的四条是 Automation, Office & Daily Tasks, Development & Operations, Data Analysis, 顶部那条轴的标签被裁掉了. 图里有六条折线: 一条加粗蓝线, 加上橙, 绿, 浅灰, 粉, 深灰五条细线. 图例文字只识别出 Gemini 3.1 Pro, MiniMax M2.5, Kimi K2.5 三个名字, 截图左上角只露出 「Pro」 和 「2.5」.

GLM-5-Turbo 和 GLM-5 两个名字在第 4 页都没有出现, 六条线里哪条是谁, 页面没标全. 轴上没有刻度, 也没有数值. 就算按惯例把加粗蓝线当作 Turbo, 橙线在四个方向都在它外侧, 只有 Data Analysis 一轴两线几乎重合, Development & Operations 一轴绿线也在它外侧. 这和正文 「outperforming several leading models」 的措辞一致, 页面没说超过全部对照. 雷达图的四个轴名和正文的五类工作负载只有 data analysis 同名, 两套分类不是一回事.

## 7. 七张图里六张是界面图标

第 1 页四张: `p01-overview.png` 是向下的折叠箭头, `p01-positioning.png` 是地图定位针, `p01-input-modalities-text.png` 和 `p01-output-modalitie-text.png` 是指向右下和左下的箭头. 第 2 页两张: `p02-t.png` 是纸箱形状的线条图标, `p02-context-caching-intelligent-caching-mechanism-to.png` 是数据库圆柱图标. 这六个文件都在 329 到 2021 字节之间.

它们的文件名是 MinerU 按紧邻文字取的, 不是图题. `p02-t.png` 的 「t」 来自一个被误识的字符, 同一位置 PDF 文字层原本有三段图标说明, 分别讲多种思考模式, 实时流式响应, 工具调用能力, md 里都没抽出来. 唯一的数据图 `p04-office-daily-tasks.png` 有 241881 字节, 名字同样取自旁边的轴标签 「Office & Daily Tasks」.

## 8. 示例代码和一处 OCR 错字

快速开始有四个标签页: cURL, Official Python SDK, Official Java SDK, OpenAI Python SDK, PDF 里只截到 cURL. 两段请求体分别是 Basic Call 和 Streaming Call, 消息都是同一组三轮对话, 参数是 thinking enabled, max_tokens 4096, temperature 1.0, 流式那段多一行 「stream」: true. 两条 content 在截图边缘被截断, 引号没闭合.

md 里基本调用的模型名写成 「glm-b-turbo」, PDF 文字层是 「glm-5-turbo」, 是 MinerU 把 5 认成了 b. md 还丢了请求头, PDF 里印着 `https://api.z.ai/api/paas/v4/chat/completions` 以及 Content-Type 和 Authorization 两个头. 示例里的 max_tokens 4096 是示例值, 和规格栏的 128K 上限不冲突. 思考模式下思考内容是否计入 max_tokens, 页面没有说明.

## 9. 这张页面能支撑的说法

能直接引用的有: GLM-5-Turbo 面向 OpenClaw 场景; 输入输出模态都是文本; 上下文长度 200K, 最大输出 128K token; 支持思考模式, 流式输出, 函数调用, 上下文缓存, 结构化输出, MCP; API 模型名是 glm-5-turbo; 页面声称它在 ZClawBench 上比 GLM-5 提升明显, 并在多个任务类别上超过几个领先模型.

不能从这张页面得出的有: 参数量, 结构, 训练数据规模, 价格, 发布日期, 与 GLM-5 是否同一套权重, ZClawBench 上的具体分数, 以及雷达图上每条线对应的模型. 这些要么没有印, 要么只露出一半. 需要这些信息时要另找来源, 并注明来源不是这张模型页.
