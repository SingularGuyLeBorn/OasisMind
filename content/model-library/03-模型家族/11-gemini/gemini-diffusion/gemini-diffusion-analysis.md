> 本目录的源材料是 Google DeepMind 官网 Gemini Diffusion 介绍页的抓取 `gemini-diffusion.md` (9 页, 5 图), 是一张实验性文本扩散模型的产品介绍页, 不是模型卡. 全文正文不到三百个英文词, 没有参数量, 训练数据, 训练方法, 去噪步数和块长度; 能核对的只有十行基准分数和两行速度数字.

# Gemini Diffusion: 实验性文本扩散模型介绍页解读

来源: 同目录 `gemini-diffusion.md` (页标记 `page 1 of 9` 到 `page 9 of 9`) 与 `gemini-diffusion.pdf`. 逐段双语对照和逐条疑问在 `gemini-diffusion-bi.md`, 疑问紧跟在对应段落之后, 本文不重复原句. md 与 PDF 对不上的地方以 PDF 为准, 源文件本身不改.

## 1. 材料性质: 一张产品介绍页

这份材料是 Google DeepMind 官网上 Gemini Diffusion 的介绍页, 抓成 PDF 后共 9 页. 标题是 「Our state-of-the-art, experimental text diffusion model」, 上方一行小字 「Gemini Diffusion」. 页面顶部有三个导航标签: Overview, Capabilities, Performance, 正好对应正文的三段: 开头两段介绍, 三张能力卡片, 一张基准表加一张速度表. 第 7 页是 「Try Gemini Diffusion」 和社交关注区, 第 8, 9 页整页是官网的页脚链接.

它和 Gemini 3 那一类模型卡是两种东西. 模型卡通常会写模型架构, 输入输出模态, 训练数据, 训练硬件, 评测方法, 安全评估和已知局限; 这张页面一样都没有. 全文没有参数量, 没有训练数据说明, 没有训练方法, 没有去噪步数, 没有块长度, 也没有论文或技术报告的链接. 能读的内容加起来不到三百个英文词, 其中硬数字只有两张表: 十行基准分数, 两行速度数字. 本文的重点因此放在三处: 页面对扩散的解释, 基准表的对照口径, 「实验性」 这个定位.

## 2. 页面怎么讲扩散

第 2 页 「What is a diffusion model?」 用两段话把扩散和自回归做了对比. 第一段讲自回归: 传统语言模型一次生成一个词, 或者说一个 token, 这种顺序过程 「can be slow」, 还会 「limit the quality and coherence of the output」. 第二段讲扩散: 不直接预测文本, 而是学会通过逐步修正噪声来生成输出, 因此能很快地对一个解反复迭代, 并在生成过程中纠错, 这让它擅长编辑类任务, 包括数学和代码.

这两段是整张页面唯一讲原理的地方, 写得很概括. 它没有说噪声加在什么上面: 是加在离散的 token 上 (比如先把一部分位置遮住再逐步填回), 还是加在连续的向量表示上. 它也没有说一次生成多长的块, 走几步去噪, 每步改多少位置, 什么条件下停止. 这些都是理解一个文本扩散模型的关键参数, 页面一个都没给. 本文不补这些数字, 下文凡是涉及步数和块长的地方, 都只讨论页面说法之间的关系.

## 3. 扩散的 「步」 和自回归的 「一次一个 token」

页面里有两种 「步」. 自回归那边是 「one word – or token – at a time」, 每走一步多出一个 token, 所以生成 N 个 token 就要走 N 步, 步数跟着输出长度走. 扩散那边是 「refining noise, step-by-step」, 第 4 页又补了一句 「Generates entire blocks of tokens at once」. 两句合起来, 扩散的一步是对一整块输出做一次修正, 块里所有位置在同一步里一起变化, 步数跟着去噪轮数走, 不一定跟着输出长度走.

所以这两种生成不是同一种. 自回归的一步是 「往后写一个」, 写下的 token 之后不再改; 扩散的一步是 「把整块再改一遍」, 前面几轮的结果后面还能改, 这正是页面说的 「error correct during the generation process」 的来源. 两种步数也不能直接拿来比大小: 如果一块有几百个 token, 扩散走几十步, 看起来 「步数少」, 但每一步处理的是整块; 自回归每一步只出一个 token, 可每一步的计算量也不一样. 页面既没给扩散的步数, 也没给每步的开销, 所以 「扩散比自回归少走多少步, 省多少算力」 从这张页面上算不出来.

还有一点要分清. 去噪步数是生成的时候走的, 属于推理过程, 和训练阶段投多少数据, 模型做多大没有关系. 页面只说 「iterate on a solution very quickly」, 没有说多走几步就能换来更好的结果, 也没有说多走几步要多花多少推理算力. 步数和质量之间是什么关系, 这张页面没有交代, 本文也不往这个方向推.

## 4. 三张能力卡片

「Capabilities」 下面有三张卡片, 每张一个图标, 一行标题, 一句说明. 第一张 「Rapid response」, 图标是仪表盘 (文字层叫 speed), 说明是 「Generates content significantly faster than even our fastest model so far」. 第二张 「More coherent text」, 图标文字层叫 stream_control, 说明是一次生成整块 token, 因此比自回归模型回应得更连贯. 第三张 「Iterative refinement」, 图标是循环箭头 (autorenew), 说明是在生成中纠错, 让输出更一致.

三张卡片都是定性说法. 第一张没说 「our fastest model so far」 是哪个模型, 也没给倍数; 第二张没给任何连贯性指标; 第三张没给纠错前后的对比. 能和卡片挂上钩的数字只有第 6 页的速度表, 而那张表只有 Gemini Diffusion 一列, 没有对照. 把卡片和第 1 页的开场白放在一起看, 开场许诺的是 「greater control, creativity, and speed」, 卡片兑现的是速度, 连贯, 纠错; control 和 creativity 在后文没有再出现. 第 2 页 「excel at tasks like editing」 离 control 最近, 但页面没有把编辑能力写成控制力, 也没有编辑任务的例子.

## 5. 基准表: 十行分数

基准表跨了第 5, 6 两页, 三列: Benchmark, Gemini Diffusion, Gemini 2.0 Flash-Lite. 每行上方有一行类别小字. 按 PDF 整理如下 (差值由本文相减得出, 单位是百分点):

| 类别 / 基准 | Gemini Diffusion | Gemini 2.0 Flash-Lite | 差值 |
| --- | --- | --- | --- |
| 代码 / LiveCodeBench (v6) | 30.9% | 28.5% | +2.4 |
| 代码 / BigCodeBench | 45.4% | 45.8% | -0.4 |
| 代码 / LBPP (v2) | 56.8% | 56.0% | +0.8 |
| 代码 / SWE-Bench Verified* | 22.9% | 28.5% | -5.6 |
| 代码 / HumanEval | 89.6% | 90.2% | -0.6 |
| 代码 / MBPP | 76.0% | 75.8% | +0.2 |
| 科学 / GPQA Diamond | 40.4% | 56.5% | -16.1 |
| 数学 / AIME 2025 | 23.3% | 20.0% | +3.3 |
| 推理 / BIG-Bench Extra Hard | 15.0% | 21.0% | -6.0 |
| 多语言 / Global MMLU (Lite) | 69.1% | 79.0% | -9.9 |

十行里 Gemini Diffusion 领先四行, 落后六行. 代码类六行三赢三输, 差距都不大: 最大的领先是 LiveCodeBench 的 2.4 个百分点, 最大的落后是 SWE-Bench Verified 的 5.6 个百分点, 其余四行都在 1 个百分点以内. 六行代码分数的平均值, Gemini Diffusion 是 53.6%, Flash-Lite 约 54.1%, 相差约 0.5 个百分点. 在代码这一类上, 说两者 「相当」 大体站得住.

代码以外的四行就不是这样了. AIME 2025 领先 3.3 个百分点, 这是唯一的一行. 若按 AIME 2025 两套卷共 30 题, 每题作答一次来算, 23.3% 约等于 7 题, 20.0% 等于 6 题, 差的是一道题; 页面没说是否对多次采样取平均, 这个换算只作参考. 其余三行都落后, 而且差得不少: GPQA Diamond 落后 16.1 个百分点, Global MMLU (Lite) 落后 9.9, BIG-Bench Extra Hard 落后 6.0. 页面标题说 「comparable to much larger models」, 放在代码类上说得通, 放在科学, 推理, 多语言上说不通. 页面没有对这几行的落后做任何解释.

## 6. 对照模型是不是同口径

先看对照对象. 标题写的是 「comparable to much larger models」, 复数, 「大得多」; 表里只有 Gemini 2.0 Flash-Lite 一个对照. 页面没有给 Gemini Diffusion 的参数量, 也没有给 Flash-Lite 的参数量, 所以 「Flash-Lite 比 Gemini Diffusion 大得多」 这件事在页面上找不到依据. Flash-Lite 在 Gemini 2.0 家族里是面向低成本, 低延迟的档位, 选它做对照, 比的是同样讲究速度的一档; 至于它是不是标题里说的 「much larger models」, 页面没有说.

再看评测设置. 表下的 Methodology 有两句. 第一句 「All scores are pass @1 (no majority voting)」 管全部分数, 两列都是单次作答, 不投票, 这一点是同口径的. 第二句只讲 Flash-Lite: 通过 AI Studio API 调 gemini-2.0-flash-lite, 用默认采样设置. 也就是说, 对照组是走公开接口跑出来的; Gemini Diffusion 一边用什么接口, 什么采样设置, 走多少步去噪, 一概没写. 扩散模型的分数很可能随去噪步数变化, 这个设置不公开, 两列分数在采样条件上是否对齐, 读者无从核对.

SWE-Bench Verified 还带一个星号: 「Non-agentic evaluation (single turn edit only), max prompt length of 32K」. 意思是这一项不走 agent 式的多轮流程, 只让模型做一次编辑, 提示最长 32K (单位没写, 按上下文是 token). 星号标在基准名上, 按表格习惯两列都按这个条件跑. 这和允许模型多轮调用工具的 agent 式评测条件不同, 所以 22.9% 和 28.5% 只能在这一行内部互相比, 不宜拿去和别处的 SWE-Bench Verified 分数比. 同理, 其余九行也没有交代题目子集, 提示模板和评分脚本, 表里的分数只适合做这两列之间的横向对照.

## 7. 速度数字怎么读

第 6 页 「Gemini Diffusion speed」 只有两行: 「Sampling speed excluding overhead」 是 1479 tokens / sec, 「Overhead」 是 0.84 sec. 表下一句 「Average sampling speed across reported evals」, 说明两个数都是在前面那些评测上取的平均. 页面没有说 overhead 包含什么 (处理提示, 排队, 网络往返都有可能), 没有说在什么硬件上测, 也没有说平均时各项评测的输出长度是多少.

用这两个数可以粗算一次生成的总耗时: 总时间约等于 0.84 秒加上输出 token 数除以 1479. 输出 200 个 token 约 0.14 + 0.84 ≈ 0.98 秒, 折合约 205 tokens / sec; 输出 1000 个 token 约 0.68 + 0.84 ≈ 1.52 秒, 折合约 660 tokens / sec; 输出 2000 个 token 约 1.35 + 0.84 ≈ 2.19 秒, 折合约 910 tokens / sec. 开销和采样时间相等的长度约是 0.84 × 1479 ≈ 1242 个 token. 可见输出越短, 固定开销占比越大, 实际感受到的速度离 1479 越远. 这些都是按两个平均值推算的, 真实分布页面没给.

更要紧的是这张表没有对照. 第 3 页说 「significantly faster than even our fastest model so far」, 第 5 页标题说 「whilst also being faster」, 可速度表里只有 Gemini Diffusion 一列, 没有 Flash-Lite, 也没有别的 Gemini 模型. 「更快」 比的是谁, 快多少, 在什么条件下比, 页面都没有给出能核对的数字. 1479 tokens / sec 本身是一个具体的量, 但它能说明的只是 Gemini Diffusion 在这些评测上的平均采样速度.

## 8. 「实验性」 和 「正式发布」

「experimental」 在页面上出现了两次, 意思并不完全一样. 第 1 页标题 「Our state-of-the-art, experimental text diffusion model」 是给模型定性: 这是一个实验性质的文本扩散模型. 第 7 页 「Gemini Diffusion is currently available as an experimental demo to help develop and refine future models」 说的是开放方式和目的: 眼下以实验性演示的形式开放, 用来帮助开发和完善未来的模型. 前一句讲它是什么, 后一句讲它现在怎么给人用, 为什么给人用.

两句合起来, 能读出的状态很清楚: 它还没有正式发布. 全文没有 Gemini Diffusion 自己的模型 ID, 价格, API 开放状态, 也没有 「generally available」, 「stable」, 「preview」 一类的字样. 第 6 页唯一出现的模型 ID 是对照组的 gemini-2.0-flash-lite. 「Try Gemini Diffusion」 在 PDF 里只是一行标签, 抓下来的页面上没有可点的入口, 也没有申请方式. 「to help develop and refine future models」 这半句值得留意: 演示本身的用途是为后续模型服务, 页面没有承诺 Gemini Diffusion 会以现在的形态转为正式产品.

标题里 「state-of-the-art」 和 「experimental」 挨在一起, 也需要单独看一眼. 「state-of-the-art」 没有写比较范围. 放在全文里看, 它唯一的对照是 Gemini 2.0 Flash-Lite, 而在十行分数里 Gemini Diffusion 落后六行. 所以这个 「最先进」 更可能是指在 Google 自家的文本扩散模型这条线上最先进, 而不是在所有语言模型里最先进; 页面没有写明这个范围, 读的时候不能把它当成对全体模型的排名.

## 9. md 与 PDF 的出入

md 是 MinerU 从 PDF 抽出来的, 有几处和 PDF 对不上, 读 md 时需要知道. 第 1 页开头的 「三 Google DeepMind」, 那个 「三」 是菜单按钮 ≡ 被识别成了汉字. 第 3 页和第 5 页, 卡片标题和说明句的顺序或分行有变动: 「Rapid response」 和说明句被并成一行, 「Iterative refinement」 被放到了说明句后面. 第 4 页卡片上的 stream_control 图标没有被抽成图片, 所以这一页 md 里没有图片块. 第 8 页的 「Get the latest updates」 只识别出 「the latest update」 加一个落在链接外的 「s」; Lyria 前面的图标名 audio_spark 被识别成了公式 「$1 1 ^ { \spadesuit }$」; Gemini 前面的 spark 被截成了 「spar」.

影响阅读最大的是基准表. 第 5 页的两行里, 类别小字 「Code」 和基准名粘成了 「CodeLiveCodeBench」, 「CodeBigCodeBench」. 第 6 页的八行被拆成了 「类别, 分数, 基准名」 的三行一组, 表头也把 「Benchmark」 和 「Gemini Diffusion」 并进了一格, 乍看容易把分数挂到上一组去. 对照 PDF 截图, 每个分数应挂在紧跟其后的基准名上; PDF 文字层按同样顺序列出八个基准名和十六个分数, 配对结果一致. SWE-Bench Verified 的 Flash-Lite 分数和 LiveCodeBench 的 Flash-Lite 分数都是 28.5%, PDF 两处都这样印, 不是抽取出错.

图片方面, md 一共引用 5 张图. 第 2 页 p02-capabilities.png 是一块纯深色面板, 原网页这里应是演示动画或视频, 抓成 PDF 后只剩底色; 第 3 页 p03-rapid-response-...png 是仪表盘图标. 第 7 页三张都是社交图标, 文件名和内容对不上: p07-google-deepmind.png 是 GitHub 图标, p07-image.png 是 X 标志, p07-follow-us.png 是 Instagram 图标. PDF 里 「Follow us」 一行共五个图标 (X, Instagram, YouTube, LinkedIn, GitHub), md 只抽出了三个. 这五张图都不承载技术信息, 没有一张是扩散过程的示意图.

## 10. 这张页面能支撑哪些结论

能从页面直接读出的事实有这几条. Gemini Diffusion 是 Google DeepMind 的实验性文本扩散模型, 目前以实验性演示开放, 目的是帮助开发和完善未来的模型. 它的生成方式是从噪声出发逐步修正, 一次处理整块 token, 可以在生成过程中纠错, 这和自回归模型一次一个 token 往后写不是同一种生成. 在十项外部基准上, 它和 Gemini 2.0 Flash-Lite 对比四项领先, 六项落后; 代码类六项互有胜负, 平均差距约 0.5 个百分点, 科学, 推理, 多语言三项明显落后. 在已报告的评测上, 它的平均采样速度是 1479 tokens / sec, 另有平均 0.84 秒的开销.

页面没有支撑的说法也要分开放. 「much larger models」 没有参数量支撑, 表里也只有一个对照模型. 「faster」 和 「significantly faster than even our fastest model so far」 没有对照数字. 「more coherent」 和 「more consistent」 没有指标. 开场许诺的 control 和 creativity 在后文没有下文. 两列分数在 pass@1 上同口径, 但 Gemini Diffusion 一边的采样设置和去噪步数没有公开. 读这张页面, 适合把它当作一个研究方向的公开亮相, 以及一组代码类基准上的初步对照; 模型规模, 训练方法, 步数和块长, 都要等技术报告或正式的模型卡.
