---
title: "Grok-1.5V: xAI 第一个多模态模型的公告怎么读"
category: "模型库"
tags: ["xAI", "技术解析"]
published: true
excerpt: "这篇公告能回答三件事: Grok-1.5V 在 7 个视觉基准上和 GPT-4V, Claude 3 Sonnet, Claude 3 Opus, Gemini Pro 1.5 相比落在什么位置;"
---
公开材料是 x.ai 在 2024 年 4 月 12 日发的一篇产品公告, 不是技术报告. 全文只有一张 7 行基准表, 一个流程图转代码的示例, 四道 RealWorldQA 示例题和数据集发布说明. 视觉编码器, 参数量, 图像分辨率, 训练数据和对齐方法页面都没有.

# Grok-1.5V: xAI 第一个多模态模型的公告怎么读

来源: 同目录 `grok-1-5v.md` (页标记 `page 1 of 10` 到 `page 10 of 10`), 对照译稿 `grok-1-5v-bi.md`. 配图 5 张: `images/p03-can-you-translate-this-into-python-code.png` 是白板手绘流程图; `images/p06-...`, `images/p07-...`, `images/p08-...` 三张本应是 RealWorldQA 示例图, 抓下来的都是模糊占位; `images/p09-2026-spacexai-llc.png` 是页脚的 SPACEX 字标. 数字一律回源 md.

这篇公告能回答三件事: Grok-1.5V 在 7 个视觉基准上和 GPT-4V, Claude 3 Sonnet, Claude 3 Opus, Gemini Pro 1.5 相比落在什么位置; 它读图写代码大概是什么样子; xAI 为什么要另起一个 RealWorldQA 基准. 它回答不了模型怎么把图像接进语言模型, 也回答不了这些分数是在什么提示和打分口径下得到的.

## 1. 页面构成: 一张表, 一个示例, 一个新基准

第 1 页开头是日期 Apr 12, 2024 和一句定位「Connecting the digital and physical worlds with our first multimodal model」. 正文第一段说 Grok-1.5V 是「first-generation multimodal model」, 能处理文档, 示意图, 统计图, 截图和照片, 并且「will be available soon to our early testers and existing Grok users」. 这里的「soon」没有日期, 也没说走 API 还是只在 Grok 应用里开放. 同家族 [xAI 新闻页](../xai/xai-bi.md) 把这条列在 2024-04-12, 前面是 3 月 28 日的 Grok-1.5 (推理提升, 上下文 128,000 token), 后面要到 8 月 13 日才是 Grok-2. 所以从命名看, 1.5V 是在 Grok-1.5 文本模型上加了视觉输入, 但这层关系公告本身没写明.

后面的篇幅分成三块.「Capabilities」一节给基准表, 表格跨第 1, 2 页, MinerU 把每个基准名下方的类别小字 (Multi-discipline, Math, Diagrams 等) 拆成了整行空白, 读表时跳过即可. 接着是「Example Writing code from a diagram」, 这个小标题在 md 里丢了标题层级, 占第 3, 4 页. 再往后是「Real-World Understanding」一节, 介绍 RealWorldQA, 附四道示例题, 占第 4 到第 8 页. 结尾「Into the Future」一段展望, 第 9, 10 页是网站页脚.

## 2. 七项基准逐行看: 数学和真实场景领先, 统计图和文档垫底

把表按行排名, Grok-1.5V 拿第一的有 3 项: Mathvista 52.8%, 比第二名 Gemini Pro 1.5 的 52.1% 高 0.7 个点; TextVQA 78.1%, 比 GPT-4V 的 78.0% 高 0.1, 两家 Claude 这一行是「-」; RealWorldQA 68.7%, 比 Gemini Pro 1.5 的 67.5% 高 1.2. AI2D 88.3% 排第 2, 比 Claude 3 Sonnet 的 88.7% 低 0.4, 但比 GPT-4V 的 78.2% 和 Gemini Pro 1.5 的 80.3% 高出 8 到 10 个点. MMMU 53.6% 排第 4, 只赢 Claude 3 Sonnet 的 53.1%, 离 Claude 3 Opus 的 59.4% 差 5.8 个点. ChartQA 76.1% 和 DocVQA 85.6% 都是五家最低, 分别比最高分 (Gemini Pro 1.5 的 81.3%, Claude 3 Sonnet 的 89.5%) 低 5.2 和 3.9 个点.

这个分布和正文「competitive with existing frontier multimodal models in a number of domains」的措辞是吻合的: 它没有说全面领先, 只说有竞争力, 真正用了「outperforms」的只有 RealWorldQA 一处. 领先的三项里, TextVQA 的 0.1 个点在没有方差的情况下**只能算持平**, Mathvista 的 0.7 个点也不大. 落后的两项都是文字密集, 版面细碎的图像: 文档要读小字和表格, 统计图要读坐标和图例. 这类任务通常对输入分辨率和视觉 token 数量敏感, 通用讨论见 [高分辨率 VLM 的技术挑战](../../../../llm-guide/8-多模态/8.2-视觉语言模型/05-高分辨率VLM的技术挑战/05-高分辨率VLM的技术挑战.md). 但公告没说 Grok-1.5V 接收多大的图, 切不切块, 所以**不能把 ChartQA, DocVQA 的落后直接归因到分辨率上**.

## 3. 评测设置: zero-shot, 不用 CoT, 对手分数来源不明

正文只有一句交代设置:「For all datasets below, we evaluate Grok in a zero-shot setting without chain-of-thought prompting.」**主语是 Grok**. 表里另外四列从哪来, 是 xAI 用同样设置重跑的, 还是抄自各家的发布材料, 页面没说. 如果是后者, 各家报告的提示方式, 是否用 CoT, 用的是 val 还是 test 切分, 都可能不同. zero-shot 不加 CoT 对多步推理类的 MMMU, Mathvista 通常是偏保守的设置, 对手若用了 CoT, 表里的差距会被放大; 反之则缩小. 本页无法判断是哪种情况. CoT 提示对分数的影响, 通用讨论见 [Prompt 工程](../../../../llm-guide/7-LLM应用开发/7.1-Prompt工程/7.1-Prompt工程.md).

打分口径也没写. 表格统一用百分号, 但这几个基准的官方指标并不一样: DocVQA 通常用 **ANLS**, 按编辑距离给部分分; ChartQA 常用 **relaxed accuracy**, 数值答案允许 5% 误差; MMMU, AI2D 和 RealWorldQA 是选择题准确率. 各基准的指标定义可以对照 [VLM 的评测与基准](../../../../llm-guide/8-多模态/8.2-视觉语言模型/06-VLM的评测与基准/06-VLM的评测与基准.md). 一张表里混着几种口径, 行内横比还说得过去, 前提是五家用的是同一种; 跨行比较 (比如拿 DocVQA 85.6% 和 ChartQA 76.1% 说哪个更强) 就没有意义. 本页连行内是否同口径都没保证.

## 4. 流程图转代码: 读对了图, 也补了图上没有的东西

示例用的是一块白板照片 (`images/p03-...`), 手绘六个图形: 淡化的 start, 矩形 `target = random()`, 平行四边形 `Read guess`, 菱形 `target == guess`, True 分支打印「you won!」, False 分支打印「Wrong guess, try again」并连回 `Read guess`. 用户只问了一句「Can you translate this into Python code?」. 模型的回答先用一句话复述流程图 (电脑生成随机数, 用户去猜), 再给出一段用 `while True` 循环, `random.randint(1, 10)` 生成目标, `int(input(...))` 读输入, 猜中 `break` 的代码.

对照白板, 结构是一一对上的: 循环回边对应 False 分支连回读输入, 判断框对应 `if guess == target`, 两个打印框对应两条 `print`. 不过**有两处是模型补的**. 一是范围 1 到 10, 白板上 `random()` 括号是空的; 二是 True 分支后的 `break`, 白板上没画结束框. 这两处都是写出可运行程序所必需的合理补全, 但公告把它描述成「as described in the flowchart」, 读者不应把「1 到 10」当作模型从图里识别出来的信息. 源 md 里第一行 `def guess_number(): # Generate a random number between 1 and 10` 把注释和函数头挤在一行, 是抽取时丢了换行. 另外代码对非数字输入会抛 `ValueError`, 示例没处理. 这个例子展示的是手写图形识别加上代码生成的组合能力, 它只有一个样本, 没有成功率之类的统计.

## 5. RealWorldQA: 自建基准的用途和局限

RealWorldQA 是这篇公告里分量最重的部分. 按第 8 页的说明, 首版「consists of over 700 images, with a question and easily verifiable answer for each image」, 图片来自「anonymized images taken from vehicles, in addition to other real-world images」, 以 CC BY-ND 4.0 发布, 压缩包 677MB. 四道示例题覆盖了四种空间判断: 相对大小 (披萨刀和剪刀), 车道可行方向, 前车能否绕行, 物体朝向的方位. 其中两道明确是驾驶场景 (「current lane」,「front camera view from our sedan」). xAI 说这些题「relatively easy for humans」却「often pose a challenge for frontier models」, 用来衡量「basic real-world spatial understanding」.

这组示例在本目录里核不了. 披萨刀那题 (第 5 页) 根本没有图片, 另外三张 (第 6, 7, 8 页) 抓下来都是模糊的渐变色块, 看得出是网页懒加载时的占位图. 四道题都没给答案. 所以关于 RealWorldQA 的题目长什么样, 能依据的只有题干文字.

分数层面有三点需要打折. 第一, 题量只有「700 多」. 按 700 题估算, Grok 68.7% 对应的二项分布标准误约为 sqrt(0.687 x 0.313 / 700), 约 1.75 个点, 它对 Gemini Pro 1.5 的 **1.2 个点**领先落在一个标准误以内, 相当于大约 8 道题的差别. 对 GPT-4V 的 7.3 个点, 对 Claude 3 Sonnet 的 16.8 个点, 对 Claude 3 Opus 的 18.9 个点才是明显差距. 第二, 基准和发布同一天出来, 对手四家的分数只能是 xAI 自己跑的, 用了什么提示, 什么 API 版本, 选项顺序是否打乱, 都没写. 第三, 自建基准的图片来源 (车载摄像头) 和出题口味由发布方决定, 天然更贴近发布方关心的场景. 这不代表分数有问题, 但比起 MMMU, DocVQA 这类第三方基准, RealWorldQA 这一行的**说服力要弱一档**.

另外, 公告没有给人类基线.「easy for humans」只是定性说法, 表里模型最高 68.7%, 最低 49.8%, 人类能到多少不知道, 模型和人之间差多远也就无从谈起. 许可证选了 CC BY-ND 4.0, 允许署名再分发, 不允许发布改编版本, 别人想在它的基础上扩题或重标注, 只能另起炉灶. 公告说「we intend to expand it as our multimodal models improve」, 扩充的节奏和版本号没提.

## 6. 架构, 训练和生成能力: 本页没有

模型内部本页一个字都没写. 视觉部分用什么编码器, 图像怎么变成语言模型能读的 token, 是先训好文本模型再接视觉适配层, 还是图文一起预训练, 图像输入的分辨率和数量上限, 这些都没有. 同家族材料里, [Grok-1](../grok-1/grok-1-bi.md) 公开过 314B 参数的 MoE 结构, [xAI 新闻页](../xai/xai-bi.md) 记录了 Grok-1.5 的上下文是 128,000 token, 但两者都不能直接套到 1.5V 上: 公告没说 1.5V 的语言部分是不是 Grok-1.5, 也没说视觉输入占多少上下文. 多模态模型常见的几种接法, 以及视觉编码器的一般做法, 可以看 [多模态核心概念与架构](../../../../llm-guide/8-多模态/8.1-核心概念与架构/8.1-核心概念与架构.md) 和 [CLIP 与视觉编码器](../../../../llm-guide/8-多模态/8.8-CLIP与视觉编码器/8.8-CLIP与视觉编码器.md), 那是通用背景, **不是 Grok-1.5V 的做法**.

训练数据, SFT 或偏好对齐, 安全评测, 本页都没有. 结尾「Into the Future」提到要同时推进「multimodal understanding and generation」, 模态包括「images, audio, and video」, 时间是「In the coming months」. 但 Grok-1.5V 本身在全文里只展示了理解能力, 没有生成图像的例子. 按新闻页的时间线, Grok 的图像生成到 2024 年 12 月 9 日才发布, 用的是「a new autoregressive image generation model」, 和这篇公告隔了 8 个月. 同期其他商业 VLM 的横向情况可以对照 [商业级 VLM 对比](../../../../llm-guide/8-多模态/8.2-视觉语言模型/07-商业级VLM对比/07-商业级VLM对比.md).

## 7. 本页对不上的数字

第一类是表格本身的问题. TextVQA 行两家 Claude 是「-」, 本页没说是没报还是没测, 这一行只有三家可比; 表里所有分数都写成百分数, DocVQA 和 ChartQA 的实际指标 (ANLS, relaxed accuracy) 没注明; 对手四列的来源和评测设置没交代, 只有 Grok 一列明确是 zero-shot, 不用 CoT. 由此, MMMU 第 4 名, ChartQA 与 DocVQA 垫底, 以及 Mathvista 0.7 个点和 TextVQA 0.1 个点的领先, 都只能当作「在各自报告口径下」的对比.

第二类是 RealWorldQA 的说法和数据量.「outperforms its peers」对 Gemini Pro 1.5 只有 1.2 个点, 约 8 道题, 在按 700 题估的一个标准误 (约 1.75 个点) 以内;「over 700 images」没给精确题数;「easy for humans」没有人类分数; 四道示例题一张缺图, 三张是占位, 全部没有答案. 第三类是页面抓取带来的错位: 示例代码里的范围 1 到 10 是模型补的, 流程图上没有; 页脚「© 2026 SpaceXAI LLC」和页脚里的 Build, Bot 都是 2026 年抓取时的网站模板, 与 2024 年 4 月 12 日的发布日期无关. 除此之外, 表内数字彼此之间没有矛盾.
