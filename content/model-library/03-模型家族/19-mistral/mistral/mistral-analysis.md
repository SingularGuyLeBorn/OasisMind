---
title: "Mistral 官网新闻列表页分析: 87 篇里露出的 8 篇"
category: "模型库"
tags: ["Mistral", "技术解析"]
published: true
excerpt: "7 页的分布是这样的. 第 1 页是博客页头: 栏目名 BLOG, 标题 「Latest updates from Mistral.」, 分类筛选, 文章总数 87, 搜索框, 以及头条卡片的标题."
---
源文是 7 页的 Mistral 官网新闻列表页打印件, 没有模型结构, 训练, 评测和价格.

# Mistral 官网新闻列表页分析: 87 篇里露出的 8 篇

- 源文: mistral.ai/news 列表页的浏览器打印件, 7 页, 12 张图, 由 MinerU 转成 Markdown. PDF 标题 「Latest news | Mistral」.
- 性质: 博客索引页, 不是论文, 也不是模型卡. 全页没有一个模型参数和评测分数.
- 页面数字: 87 篇文章, 5 个分类, 分页 1 到 10, 第一屏 8 张卡片.
- 最大的数: D 轮融资 30 亿欧元, 投后估值超过 210 亿欧元.
- 唯一和技术工作量有关的数: 40,000 行 Fortran.
- 日期跨度: 2026 年 8 月 4 日到 9 月 16 日.
- 模型名: 只有 Shieldstral, 没有摘要, 没有分数.
- md 缺损: 5 个日期, 融资摘要, 40,000 这个数, 页脚产品栏和大半公司栏, 都按 PDF 文字层补回.

下文页码指 PDF 页码. 逐条疑问写在同目录的 mistral-bi.md 里, 这里不重复翻译正文.

## 1 这 7 页是什么, 能回答什么

7 页的分布是这样的. 第 1 页是博客页头: 栏目名 BLOG, 标题 「Latest updates from Mistral.」, 分类筛选, 文章总数 87, 搜索框, 以及头条卡片的标题. 第 2 到 5 页上半是文章卡片, 一共 8 张. 第 5 页下半到第 7 页是分页条和整站页脚. 每一页左下都盖着同一个 Cookie 弹窗, 占掉大约三分之一的版面.

所以这份材料能回答的是: 打印那一刻, Mistral 官网博客最新的 8 篇文章是什么, 各归哪个分类, 谁署名, 哪天发的, 官网页脚把业务分成哪几栏. 它回答不了任何模型本身的问题. 页面上唯一以 -stral 结尾的名字 Shieldstral 只有一个标题和一张盾形配图, 页脚的 「Our models」 也只是一个链接. 想了解任何一个 Mistral 模型, 都得去同家族的其他目录, 那不是本页的内容.

MinerU 在这份材料上的损失比一般网页重. 弹窗和卡片重叠的地方, 它把两边的文字按行拼接, 于是出现了 「Mistral and Mozilla are bringing open, private and multilingual CERTIFIED BY AI to y」 这种标题, 以及 「Smart Window.Here are our cookies!」 这种把摘要尾巴和弹窗标题粘在一起的小节名. 被顶栏遮住的文字 (8 月 11 日那一行, Mistral for finance, Speech) 在画面上看不到, 但 PDF 文字层里都在. 本稿的数字全部以 PDF 文字层为准, 和截图对得上的地方都核过, 没有发现两者冲突.

## 2 第一屏 8 张卡片

按页面顺序整理如下. 分类取自卡片上方的标签, 日期和作者取自卡片底部的一行.

| 序 | 日期 (2026) | 分类 | 标题要点 | 署名 |
| --- | --- | --- | --- | --- |
| 1 | 9 月 8 日 | COMPANY | 融资 €3B, 主权, 开放权重 | Mistral |
| 2 | 9 月 16 日 | COMPANY | 与 Mozilla 合作, Firefox Smart Window | Mistral and Mozilla |
| 3 | 9 月 10 日 | COMPANY | 与 Cloudera 合作, 企业数据 | Mistral |
| 4 | 9 月 9 日 | SOLUTIONS | AI Agent 改造遗留代码, 40,000 行 Fortran | Carlo Antonio Patti & Rasul Alakbarli |
| 5 | 8 月 24 日 | COMPANY | Mistral x HUMAIN | Mistral |
| 6 | 8 月 20 日 | PRODUCT | Agentic Search, 检索层 | Mistral |
| 7 | 8 月 11 日 | COMPANY | 区域内推理, 开放模型, 欧洲基础设施 | Mistral AI |
| 8 | 8 月 4 日 | SOLUTIONS | Introducing Shieldstral | Mistral |

排序规律很清楚. 从第 2 张起严格按日期从新到旧, 只有第 1 张的 9 月 8 日早于第 2 张的 9 月 16 日. 第 1 张是版面最大的头条卡片, 标题单独占了第 1 页底部, 摘要又占了第 2 页顶部, 看起来是被人工置顶. 页面上没有 「置顶」 或 「Featured」 字样, 这个判断来自排版.

时间密度也能算一下. 8 篇跨 43 天 (8 月 4 日到 8 月 31 日 27 天, 加 9 月 16 天), 7 个间隔平均约 6.1 天一篇 (43 / 7). 分布并不均匀: 9 月前半个月就有 4 篇 (8 日, 9 日, 10 日, 16 日), 其中 8 日到 10 日连续三天各发一篇; 8 月整月也是 4 篇. 融资头条之后的一周是这一屏里发文最密的时段.

## 3 分类分布: 公司新闻占多数

分类筛选列了 5 个: COMPANY, SOLUTIONS, ENGINEERING, RESEARCH, PRODUCT. 第一屏 8 张卡片里, COMPANY 5 篇, SOLUTIONS 2 篇, PRODUCT 1 篇, ENGINEERING 和 RESEARCH 都是 0 篇. 公司类占 62.5% (5 / 8).

5 篇公司类里, 1 篇是融资, 3 篇是合作 (Mozilla, Cloudera, HUMAIN), 1 篇是欧洲基础设施和区域内推理. 也就是说, 打印那一刻博客门口摆的主要是 「和谁合作, 拿了多少钱, 在哪里建设施」, 讲技术的只有 Fortran 那一篇和 Agentic Search 那一篇. RESEARCH 分类在筛选栏里存在, 但第一屏没有露面, 剩下 79 篇里有多少研究类文章, 本页查不到.

这里要防一个误读: 第一屏只是按时间截的一段, 不代表 87 篇的整体构成. 如果研究类文章集中在更早的时间段, 第一屏自然看不到. 本页能支持的说法只有 「8 月 4 日到 9 月 16 日之间露出的这 8 篇里, 没有 RESEARCH 和 ENGINEERING 标签」.

## 4 融资头条的数字

头条是全页唯一的财务数字: D 轮, 30 亿欧元, 投后估值超过 210 亿欧元. 由此可以推出投前估值超过 180 亿欧元 (21 - 3), 本轮金额不到投后估值的 14.3% (3 / 21). 因为原文用的是 「more than €21 billion」, 两个推算结果都只是界限, 精确的投前估值和稀释比例本页算不出来.

页面没有写投资方, 没有写资金用途, 也没有写此前各轮的金额. 标题给了方向: 「make sovereign, open-weight AI the technology frontier」, 即让主权可控, 开放权重的 AI 站上技术前沿. 这句话表达的是目标, 不是已达成的事实, 本稿引用时照原文保留这种语气.

还要注意日期. 融资文章是 9 月 8 日, 但在列表里排在第一位, 比它晚 8 天的 Mozilla 文章反而排第二. 如果只看 md, 会以为 「September 8, 2026」 是 Mozilla 文章的日期, 因为 md 把它放在了 Mozilla 标题之前. 对照截图可以确认这一行属于融资卡片, Mozilla 那篇是 9 月 16 日.

## 5 反复出现的词: sovereign, open, Europe

8 张卡片的标题和摘要里, 「sovereign」 出现在 3 篇: 融资头条 (sovereign, open-weight AI), Cloudera 合作 (Specialized, Sovereign Intelligence), 欧洲基础设施 (for sovereign AI). 「open」 也出现在 3 篇: 融资头条 (open-weight), Mozilla 合作 (open, private and multilingual, 标题和摘要各一次), 欧洲基础设施 (open models, 标题和摘要各一次). 5 篇公司类文章里, 只有 HUMAIN 那篇两个词都没有, 它本来就只有标题.

「Europe」 和 「European」 只出现在第 7 篇, 但那一篇把话说得最满: 欧洲要掌控自己的 AI 未来, 需要推理基础设施, 开放模型和长期承诺, Mistral 要把这三样整合起来, 还要 「为全世界定一份路线图」. 配图是蓝底上一圈黄色十字, 前面一块方块写着 「Third-party models」. 标题说 open models, 配图说 third-party models, 两者是什么关系页面没交代, 本稿不合并.

把这些词放在一起看, 第一屏的叙事重心是 「开放」 加 「主权」: 开放权重, 开放模型, 私密, 多语言, 区域内推理, 企业数据. 这是对标题用词的统计和归纳, 页面本身没有写这样的总结句. Mozilla 那篇的 「private」 和 「multilingual」 只出现一次, 数量太少, 不足以单独成线.

## 6 页脚: 产品线和行业线

页脚分成五栏. Products 6 项: Vibe, Vibe Code, Studio, Forge, Compute, Pricing. Solutions 5 项: Delivery methodology, Model customization, Coding, Document intelligence, Speech. 行业 4 项: 金融, 公共机构, 制造业, 能源与公用事业. Why Mistral 6 项: About us, Careers, Partners, Our customers, Our models, Brand. Company 6 项: 服务条款, 隐私政策, 隐私选择, 数据处理协议, Trust Center, 法律声明. 最下面还有 「Get Mistral Vibe」 应用下载入口和一个 Google Play 徽章.

几个链接地址和显示名不一样, 值得记下. Compute 链接到 products/aicloud, Model customization 链接到 solutions/custom-model-training, Get Mistral Vibe 那一处 md 里只留下一个 App Store 上 Le Chat 应用的链接. 显示名和地址之间的差别说明官网改过栏目名, 但本页看不出先后, 这里只记录页面怎么写.

页脚和文章卡片之间能对上的有两处. 第 4 篇讲用 AI Agent 改造遗留代码, 对应 Solutions 栏的 Coding; 第 6 篇 Agentic Search 讲文档检索, 对应 Document intelligence. 这是按主题的对应, 卡片本身没有链接到这两个栏目. 行业栏的 「公共机构」 和第 7 篇的主权基础设施话题接近, 但同样没有直接链接.

## 7 谱系: 这一页在 19-mistral 目录里的位置

本库 19-mistral 目录下一共 21 个子目录. 除了这份 mistral 以外, 还有 codestral, mistral-7b, mixtral-8x22b, mixtral-8x7b, nemo-12b, pixtral-12b, pixtral-large, large-2402, large-2407, large-3, medium-3, medium-3-5, ministral-2024, ministral-3, small-3, small-3-1, small-4, devstral, devstral-2, magistral. 按名字看, 这 20 个目录收的是各个模型的发布页或论文, mistral 这一个是家族的总入口.

但这个总入口抓到的是一张新闻列表, 不是模型总览. 20 个模型目录的名字, 没有一个出现在本页的 8 张卡片或页脚里. 页面上唯一带 -stral 后缀的 Shieldstral, 在本库也没有对应目录. 所以这一页和其他 20 个目录之间, 在内容上没有可以直接对照的交集.

读谱系时, 这一页能提供的是背景, 而非某一代模型的数据: 打印时 Mistral 刚完成 D 轮融资, 在博客门口主推合作, 主权和开放, 产品线以 Vibe, Studio, Forge, Compute 命名. 模型的参数, 结构和分数, 都要去对应目录看, 本稿不从那些目录转述任何数字.

## 8 本页对不上或缺的数字

逐条列出, 每条都只用本页内容核对.

1. 9 月 8 日: md 把它放在 Mozilla 标题前, 实际属于融资头条. Mozilla 那篇是 9 月 16 日.
2. md 漏掉的日期: 9 月 16 日 (Mozilla), 9 月 10 日 (Cloudera), 8 月 24 日 (HUMAIN), 8 月 20 日 (Agentic Search), 8 月 11 日 (欧洲基础设施), 按 PDF 文字层补.
3. 融资数字: €3B, €3 billion, 「more than €21 billion」 在 md 里全部缺失, 按 PDF 补.
4. 40,000 行 Fortran: md 只剩 「Lesson」, 数字丢失, 按 PDF 补.
5. 分页条: md 写成 「1 2 3」, PDF 是 1 到 10, 截图只露出 8, 9, 10 和一个 「下一页」 箭头.
6. 87 篇和 10 页: 第一屏 8 张卡片, 每页 8 篇的话 10 页只装 80 篇, 87 篇需要 11 页. 页面没说后续页每页几篇.
7. 分类: 筛选栏 5 个分类, 第一屏只露出 3 个, ENGINEERING 和 RESEARCH 为 0 篇.
8. 署名: 8 月 11 日那篇写 「By Mistral AI」, 其余 Mistral 单独署名的都是 「By Mistral」.
9. 图名错位: p06-spe 画的是 Google Play 徽章, p06-image, p06-image-2, p06-close 都是弹窗里的复选框和开关, p01-close 主体是 Cookie 弹窗, p03-solutions 只是一张无字色块横幅.
10. 快照日期: 页面最新文章是 9 月 16 日, PDF 元数据的创建时间是 2026-09-25 (未印在页面上). 若元数据可信, 打印前约 9 天没有新文章 (25 - 16).

第 1 条最容易引起误读. 引用 Mozilla 合作的日期时, 要用 9 月 16 日, 不能照 md 写成 9 月 8 日. 第 6 条则说明, 用这一页去估算 Mistral 博客的发文总量或发文节奏时, 只能用 「87 篇」 这个总数, 页数本身并不可靠.

另外, 第 3 条的融资数字是全页最容易被转述走样的一处. 原文是 「raised €3 billion」 和 「post-money valuation of more than €21 billion」, 引用时要保留 「投后」 和 「超过」 两个限定, 不能简写成 「估值 210 亿欧元」.
