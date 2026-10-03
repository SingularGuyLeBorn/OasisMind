源文是 9 页的模型卡, 没有图, 架构, 训练, 硬件和软件都只给一个指向 3.6 Flash 卡的链接, 能核对的是一张二十二行的结果表, 一张五行的安全增量表和一张七行的前沿安全表.

# Gemini 3.7 Flash: 分析

## 1. 一张 9 页的卡, 自己写的部分

源文是 Gemini 3.7 Flash 的模型卡, 2026 年 8 月发布, PDF 共 9 页, 没有图. 第 1 页是封面, 每页底部印着和 PDF 页序相同的页码 1 到 9. 骨架和 Gemini 3 系列其他 Flash 卡一样: 模型信息, 模型数据, 实现与可持续性, 发布渠道, 评测, 用途与局限, 伦理与内容安全, 前沿安全. 本库 gemini-3-6-flash 目录里是上一代的独立模型卡, 2026 年 7 月发布, 7 页; gemini-3-8-flash 目录是下一代. 下文凡提到 3.6 卡, 都指 gemini-3-6-flash 目录里那份文件, 只做对照, 不混用.

本卡有九处只写一句 「见 3.6 Flash 的模型卡」: 架构, 训练数据集, 训练数据处理, 硬件, 软件, 已知局限的后半段, 可接受使用, 安全评测方法, 安全政策. 本卡自己写出来的内容是: 一段描述, 输入输出规格, 七个发布渠道, 一张二十二行的结果表, 用途列表, 一段已知局限, 一张五行的安全增量表, 人工红队结论, 一张七行的前沿安全表, 以及一段防护说明. 和 3.6 卡相比, 结果表从十二行扩到二十二行, 前沿安全从一段从 3.1 Pro 推过来的结论变成直接评估的逐领域表格, 这两处是本卡信息量增加的主要来源.

## 2. 描述里的三个说法

描述只有两句, 放了三个说法: 核心推理基础上的算法改进, 支持智能体式的视频理解, 可自定义的思考配置. 第一个说法没有任何展开, 卡没说改的是训练目标, 数据配比还是推理流程, 架构一节又只写 「based on 3.6 Flash」. 能拿来检验的只有结果表里 3.7 Flash 对 3.6 Flash 的差. 二十行分数里十八行上涨, 两行下降, 下降的是 CharXiv 的两档, 各低 0.7 个百分点. 如果把 「算法改进」 理解成整体能力的提升, 表里的数字支持它; 如果要问具体改了什么, 卡里没有答案.

智能体式视频理解在表里对应的只有 LVBench, 副标题是 「Long video understanding」. 3.7 Flash 85.4%, 3.6 Flash 84.2%, 高 1.2 个百分点, 在以百分比计分的上涨行里是涨幅最小的. 这一行考长视频理解, 和 「agentic」 这个修饰词之间没有直接对应, 表里也没有别的视频行. 用途列表写了 「complex video reasoning」, 这四个英文词和 3.6 卡的用途列表一字不差, 也就是说视频推理在上一代已经列为用途, 本卡新加的是描述里 「agentic video understanding」 这个提法, 表格证据只有一行 1.2 个百分点.

思考配置是第三个说法. 卡的原话是 「customizable thinking configurations to control the mix of quality, cost and latency」, 调的是质量, 成本和延迟三者的配比. 从这个表述看, 档位越高, 推理时花的算力越多, 换来更高的质量和更长的延迟, 本库把这类做法记作 TestingTime. 但结果表每个模型只有一列, 没有按档位拆开的分数, 也没写 3.7 Flash 那一列用的是哪一档. 所以卡里无法回答 「高档和低档差多少分」, 也无法回答 「表里的 3.7 Flash 是不是开到最高档」. 1M 上下文窗口是另一回事, 它是输入长度的上限, 不涉及推理时多花算力.

## 3. 价格行: 单价, 星号, 以及和 3.6 卡对不上的那一格

表的前两行是每百万 token 的价格. 3.7 Flash 输入 $0.75, 输出 $3.75; 3.6 Flash 同样是 $0.75 和 $3.75; Claude Sonnet 5 是 $2.00 和 $10.00; GPT-5.6 Terra 是 $2.00 和 $12.00; Muse Spark 1.2 是 $1.25 和 $4.25. 按输入输出各 100 万 token 算, 两个 Flash 都是 $4.50, Muse Spark $5.50, Sonnet 5 $12.00, Terra $14.00. 两个 Flash 的输出价是输入价的 5 倍, Sonnet 5 也是 5 倍, Terra 是 6 倍, Muse Spark 只有 3.4 倍. 输出占比越高的任务, 两个 Flash 相对 Muse Spark 的价格优势越小: 纯输出时每百万 token 只差 $0.50.

价格行不是用量行. 一次调用的花费等于单价乘用量, 表里只给了单价, 没有任何一行记录完成某个任务消耗的 token 数. 两个 Flash 单价相同, 如果 3.7 Flash 做同样的事写得更长, 实际花费会更高; 写得更短, 花费会更低. 这两种情况本卡都无法验证, 描述里也没有出现 「更省 token」 这类说法.

这两行还有一个和上一代卡对不上的地方. 3.6 卡的结果表给 3.6 Flash 印的是输入 $1.50, 输出 $7.50, 本卡同一个模型写的是 $0.75* 和 $3.75*, 正好减半. 两个 Flash 的四格价格都带星号, 另外三家都不带, 但本卡抽取稿里找不到星号对应的脚注. 星号可能表示折扣价, 限时价或某种条件, 卡里没说. 在不知道星号含义的情况下, 能确定的只是: 本卡口径下两代 Flash 单价相同, 这个单价和 3.6 卡发布时印的单价不同.

## 4. 编码: 四行都涨, 两行第一

编码相关的四行是 FrontierCode 1.1 Main, DeepSWE v1.1, Code Arena 和 Terminal-bench 2.1. 3.7 Flash 对 3.6 Flash 的变化依次是: 43.6% 对 34.4%, 高 9.2 个百分点; 65.3% 对 48.6%, 高 16.7 个百分点; Elo 1588 对 1538, 高 50 分; 85.8% 对 78.0%, 高 7.8 个百分点. DeepSWE 标的是长程软件工程, 是四行里涨得最多的, 按百分点算也是全表涨幅最大的一行. 上一代 3.6 卡里这一行 3.6 Flash 对 3.5 Flash 涨了 12 个百分点, 同一个基准两代连续涨了两位数.

放到五列里看, 3.7 Flash 在 FrontierCode 和 Code Arena 上排第一: FrontierCode 比 Sonnet 5 的 42.7% 高 0.9 个百分点, 比 Terra 的 41.3% 高 2.3; Code Arena 比第二名 Sonnet 5 的 1541 高 47 分. DeepSWE 和 Terminal-bench 2.1 上排第二, 都在 GPT-5.6 Terra 之后: DeepSWE 差 4.3 个百分点 (65.3% 对 69.6%), Terminal-bench 差 1.6 (85.8% 对 87.4%). Muse Spark 1.2 在 FrontierCode 上没有数. FrontierCode 这一行的设置栏写 「Score」, Code Arena 写 「Elo」, 两者单位不同, Code Arena 的 Elo 只能在同一张表里比差值.

## 5. 智能体与电脑操作: 涨幅大, 绝对值低

这一类有四行. Terminal-bench 3.0 的副标题是通用智能体能力, 3.7 Flash 14.9%, 3.6 Flash 5.4%, 约 2.76 倍; AutomationBench 标的是企业工作流自动化, 设置栏写 「Private set」, 30.4% 对 17.0%, 高 13.4 个百分点; OSWorld-2.0 是智能体电脑操作, 47.9% 对 33.8%, 高 14.1; Agent's Last Exam 是多模态桌面与操作系统智能体任务, 按通过率计, 26.3% 对 24.2%, 高 2.1. 前三行都是两位数的涨幅或成倍的变化, 最后一行涨得少.

这四行的绝对分数都不高. Terminal-bench 3.0 上最高的 Terra 也只有 20.8%, 3.7 Flash 的 14.9% 排第二, 比 Sonnet 5 的 14.6% 高 0.3 个百分点. OSWorld-2.0 上 Terra 50.2%, 3.7 Flash 47.9%, Sonnet 5 和 Muse Spark 都没有数. Agent's Last Exam 上 3.7 Flash 排第三, Sonnet 5 33.3%, Terra 28.0%. AutomationBench 是 3.7 Flash 领先最多的一行, 比第二名 Terra 的 23.6% 高 6.8 个百分点, 比 Sonnet 5 的 10.7% 高 19.7; 这一行用的是私有集, 外部无法复现, 卡也没说私有集有多少题.

## 6. 知识工作, 法律和文档

知识工作一行是 GDPVal-AA v2, 单位是 Elo. 3.7 Flash 1525, 3.6 Flash 1422, 高 103 分, 是两代之间差距最大的 Elo 行. 但在五列里 3.7 Flash 只排第四: Muse Spark 1.2 1628, Sonnet 5 1598, Terra 1578. 3.7 Flash 比第一名低 103 分, 正好等于它比 3.6 Flash 高出的分数. 在这一行上, 3.7 Flash 追近了一步, 和另外三家仍有明显差距.

另外两行是本卡新加的. Harvey LAB-AA 考复杂法律工作流, 3.7 Flash 90.7%, 3.6 Flash 85.1%, Sonnet 5 90.1%, Terra 85.2%, 3.7 Flash 第一, 比 Sonnet 5 高 0.6 个百分点. GDP.pdf 考专家级 PDF 文档理解, 3.7 Flash 34.0%, 3.6 Flash 22.0%, Sonnet 5 28.0%, Terra 24.7%, Muse Spark 16.0%, 3.7 Flash 第一, 比第二名高 6 个百分点, 这一行五列都有数. 用途列表里的 「enterprise workflows」 在表里可以对应到 AutomationBench, Harvey LAB-AA 和 GDP.pdf 三行, 3.7 Flash 在这三行都排第一.

## 7. 多模态与长上下文: 唯一下降的两行

CharXiv Reasoning 考从复杂图表里综合信息, 分不用工具和用工具两档. 3.7 Flash 分别是 84.5% 和 88.7%, 3.6 Flash 是 85.2% 和 89.4%, 两档都低 0.7 个百分点. 这是全表二十行分数里仅有的两行下降. 不用工具那一档, 五列排序是 Terra 85.9%, 3.6 Flash 85.2%, 3.7 Flash 84.5%, Sonnet 5 77.0%; 用工具那一档, 3.6 Flash 第一, 3.7 Flash 第二, Sonnet 5 88.3% 第三, Terra 和 Muse Spark 没有数. 卡的描述和正文都没提到图表推理上的这点退步.

长上下文只剩一行: GDM-MRCR v2 (8-needle), 128k 平均档. 3.7 Flash 97.0%, 3.6 Flash 91.8%, 高 5.2 个百分点, Terra 93.5%, Sonnet 5 81.5%, 3.7 Flash 第一. 3.6 卡里这个基准还有 1M 单点一档, 3.6 Flash 在那一档是 54.0%, 本卡把这一档删掉了, 所以 1M 长度上的变化本卡看不到. 两代的窗口都是 1M 输入, 64K 输出, 128k 档的提升不来自窗口变大. 3.6 到 3.7 这一档从 91.8% 到 97.0%, 已经接近满分, 剩下的空间只有 3 个百分点.

## 8. 推理与科研

推理一类在 3.6 卡里没有单列的行, 本卡加了 HLE-Verified, 副标题是多学科专家推理. 3.7 Flash 53.6%, 3.6 Flash 51.2%, 高 2.4 个百分点; Terra 51.1%, Sonnet 5 31.0%. 3.7 Flash 第一, 但和 3.6 Flash, Terra 挤在 2.5 个百分点以内, Sonnet 5 低了二十多个百分点. 综合指数一行是 Artificial Analysis Intelligence Index, 3.7 Flash 56, 3.6 Flash 52, Sonnet 5 55, Terra 和 Muse Spark 都是 57, 3.7 Flash 排第三, 比第一低 1 分.

另外三行是生物方向的科研基准, 这里只列名称和分数. BioMysteryBench 人类可解档: 3.7 Flash 87.1%, 3.6 Flash 80.6%, Sonnet 5 87.5%, Terra 83.8%. BioMysteryBench 人类难解档: 43.5%, 41.2%, 34.1%, 49.4%. LABBench2: 82.1%, 76.1%, 80.1%, 81.2%. 三行里 3.7 Flash 在 LABBench2 排第一, 在 BioMysteryBench 两档都排第二, 分别落后 Sonnet 5 0.4 个百分点和 Terra 5.9 个百分点. 这三行 Muse Spark 都没有数.

## 9. 和 3.6 卡逐格对照

判断 「比 3.6 Flash 更好」 是不是同一口径, 最直接的办法是看本卡里 3.6 Flash 那一列和 3.6 卡自己印的数是否一致. 完全一致的有四格: CharXiv 不用工具 85.2%, 用工具 89.4%, Terminal-bench 2.1 的 78.0%, MRCR v2 128k 的 91.8%. 取整一致的一格: DeepSWE v1.1 本卡 48.6%, 3.6 卡 49%. 差 1 分的一格: GDPVal-AA v2 本卡 1422, 3.6 卡 1421, Elo 随对手池变动, 可看作同一基准的新快照. 基准名不同的一格: 3.6 卡是 OSWorld-Verified 83.0%, 本卡是 OSWorld-2.0 33.8%, 这两个数不能放在一起比. 价格两格对不上, 见第 3 节.

Claude Sonnet 5 是两张卡唯一共同的外部对手, 它那一列也能对照. Terminal-bench 2.1 两卡都是 80.4%, CharXiv 两档都是 77.0% 和 88.3%, DeepSWE 54% 对 53.8%. GDPVal-AA v2 从 1607 变成 1598, 差 9 分. 差得最多的是 MRCR v2 128k: 3.6 卡写 71.6%, 本卡写 81.5%, 同一基准同一档位高了 9.9 个百分点, 卡里没有说明. 价格上 3.6 卡给 Sonnet 5 分别标了原价 ($3.00 / $15.00) 和临时折扣 ($2.00 / $10.00), 本卡只印折扣价, 不带标注. GPT 那一列从 3.6 卡的 GPT-5.6 Luna 换成了 GPT-5.6 Terra, Grok 4.5 和 Gemini 3.1 Pro 两列没保留, 新加了 Muse Spark 1.2.

行的取舍也变了. 3.6 卡的十行分数里, SWE-Bench Pro (Public), MLE-Bench, OSWorld-Verified 和 MRCR 1M 单点四行在本卡消失. 本卡新增的十四行里, 有综合指数, FrontierCode, Code Arena, Terminal-bench 3.0, AutomationBench, Harvey LAB-AA, GDP.pdf, LVBench, OSWorld-2.0, Agent's Last Exam, HLE-Verified, BioMysteryBench 两档和 LABBench2. 新增行里 3.7 Flash 排第一的有八行. 被删的四行里, 3.6 Flash 在 3.6 卡上 OSWorld-Verified 和 MRCR 1M 排第一, MLE-Bench 排第二, SWE-Bench Pro 排第四, 这几行 3.7 Flash 的表现本卡看不到. 两张卡之间只有六行能直接首尾相接, 其余比较只在本卡内部成立.

## 10. 已知局限与链接

已知局限一段和 3.6 卡几乎逐字相同: 幻觉, 抗越狱持续改进, 最近加强了整个前沿安全范围内的缓解措施, 偶尔变慢或超时, 知识截止 2026 年 3 月, 部分领域只到 2025 年 1 月. 两张卡只有型号不同, 两个日期都没变. 所以 3.7 Flash 的知识截止和 3.6 Flash 相同, 描述里说的算法改进和知识更新无关. 哪些领域更新到了 2026 年 3 月, 用了多少新数据, 两张卡都没写.

这一段结尾写 「见 Gemini 3.6 Flash 的模型卡」, 链接地址却是 Gemini-3-5-Flash-Model-Card.pdf, 和 3.6 卡同一位置的地址完全一样. 同页的安全评测方法一节也写 「见 3.6 Flash 的模型卡」, 地址是 Gemini-3-Flash-Model-Card.pdf. 其余七处 「见 3.6 卡」 都指向 Gemini-3-6-Flash-Model-Card.pdf. 读者如果照着链接去查已知局限和安全评测方法, 会分别落到 3.5 Flash 和 3 Flash 的卡上. 还有一处位置上的小问题: 安全增量表下面那段说 「The performance results reported below」, 可表在这段话的上面.

## 11. 安全增量表: 三退一进一平

第 7 页的表只列 3.7 Flash 相对 3.6 Flash 的百分点差, 不给绝对值. 文本到文本安全 +1.17pp, 越低越好, 是退步; 多语言安全 -0.48pp, 越低越好, 是进步; 图像到文本安全无变化; 语气 -0.47pp, 越高越好, 是退步; 不当拒答 +0.84pp, 越低越好, 也是退步. 正文的概括是 「performs similarly to Gemini 3.6 Flash across both safety and tone, with low unjustified refusals」. 五个数的绝对值都在 1.2 以内, 说 「相近」 可以成立, 但三行方向不利, 正文没有点出来.

和 3.6 卡的同类表相比, 本卡有两处写法变化. 一是单位: 3.6 卡表头写 percentage point, 格子里却带 % 号; 本卡格子里直接写 pp, 表头不再注单位. 二是颜色说明: 3.6 卡说改进用加粗绿色, 退步用红色; 本卡脚注说绿色和红色, 抽取后颜色都丢了. 脚注本身还有两处和表不符: 它说正值表示 「compared to Gemini 3 Flash」 的改进, 而表头的比较对象是 3.6 Flash; 它提到 「tone and instruction following」, 可表里没有指令遵循这一行. 本卡还写了一句, 这些结果用改进后的评测算出, 不能和以前模型卡的结果直接比较, 所以本卡的 -0.47 和 3.6 卡的 -3.31 不能相加.

## 12. 红队与前沿安全

人工红队由模型开发团队以外的专门团队执行. 3.6 卡在这里写明团队属于 Google Trust & Safety 组织, 本卡把组织名删了. 儿童安全: 达到发布所需阈值. 整体内容安全政策 (含儿童安全) 上, 表现和 3.6 Flash 相近或更好. 红队范围覆盖了严格政策之外的问题, 并和 Gemini 3.1 Pro 对比, 没有发现严重问题. 这一段的比较对象从 3.6 卡的 3.5 Flash 换成了 3.6 Flash, 和 3.1 Pro 对比那句原样保留.

前沿安全是本卡和 3.6 卡差别最大的一节. 3.6 卡没有在 3.6 Flash 上跑全套评估, 结论从 3.1 Pro 推过来, 只对网络做了补充测试. 本卡按 2026 年 4 月版的前沿安全框架直接评估 3.7 Flash, 给出一张七行的表. CBRN 两行: Uplift TCL 未达到; Uplift Level 1 CCL 已达到预警阈值, 评估为低于 CCL. 网络安全一行: Uplift Level 1 CCL 已达到预警阈值, 未达到 CCL. 有害操纵一行: Level 1 CCL 未达到, 低于预警阈值. 机器学习研发与失准三行: Stealth and Situational Awareness TCL 未达到, 隐蔽性评测和 3.1 Pro 相近, 情境感知强于 3.1 Pro, 模型能判断自己处在测试环境, 但无法绕过测试限制; Acceleration Level 1 CCL 和 Automation Level 1 CCL 都未达到, 低于预警阈值, 原因是能完成单个编码任务, 但不能在没有人工干预时串成端到端的研究流程.

读这张表要分清三道线: TCL, CCL, 以及 CCL 之前的预警阈值. 开头说 3.7 Flash 「没有达到任何跟踪或关键能力等级」, 最后一列七格全是 not reached, 两者一致. 过了预警阈值的是 CBRN 和网络两个 Uplift Level 1 CCL, 其余在预警阈值以下. 防护方面, 3.7 Flash 发布时带了 CBRN 和网络攻击两个领域的更新防护. 框架版本写的是 2026 年 4 月, 链接文件名是 frontier-safety-framework_3-1.pdf, 和 3.6 卡引用的地址相同; 单独的前沿安全框架报告另有链接, 文件名是 gemini_3-7_flash_fsf_report.pdf, 本目录没有这份报告.

## 13. 卡里没有的东西

没有参数量, 没有层数, 没有任何结构描述. 架构一节只有 「based on 3.6 Flash」 加链接, 3.6 卡又指向 3.5 卡, 3.5 卡再指向 3 Flash, 三代卡都没写改了什么. 训练数据, 数据处理, 硬件, 软件四节也是同样的写法. 描述里的 「算法改进」 是本卡唯一一句涉及训练或结构变化的话, 没有展开. 思考配置有了名字, 但没有档位列表, 没有各档分数, 也没说表里用的是哪一档.

发布渠道列了七个: Gemini App, Gemini Enterprise App, Gemini Enterprise Agent Platform, Google AI Studio, Gemini API, Google AI Mode, Google Antigravity. 比 3.6 卡多了 Google AI Mode, Gemini App 的链接也从 gemini.google.com 换成了 gemini.google/about. 按本卡能核对的部分, 结论可以这样收: 3.7 Flash 在本卡二十行分数里十八行高于 3.6 Flash, 涨幅最大的是 DeepSWE, OSWorld-2.0 和 AutomationBench, 唯一下降的是 CharXiv 两档; 在五列对比里有九行排第一, 多集中在企业工作流, 编码质量, 长上下文和生物科研; 价格与 3.6 Flash 相同, 但和 3.6 卡发布时的价格对不上, 星号含义卡里没给; 知识截止没有变化; 安全增量表三行方向不利, 幅度都在 1.2 个百分点以内; 前沿安全在 CBRN 和网络两处过了预警阈值, 都没到 CCL.
