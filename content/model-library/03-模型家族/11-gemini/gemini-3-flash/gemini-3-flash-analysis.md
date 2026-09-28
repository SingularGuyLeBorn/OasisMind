[OM-FREEPLAY] 材料不够 5000, 禁止编造架构.

源文是 Google DeepMind 发布的 Gemini 3 Flash 模型卡 PDF, 共 6 页, MinerU 转出的 Markdown 里没有图片引用. PDF 里嵌了 3 张图: 封面的细色条和 Google 字标, 以及第 4 页整张成绩表 (表是图片, 文本层没有字). 卡上没有 Flash 自己的结构, 参数规模和训练数据描述, 这几项都转给了 Gemini 3 Pro 的卡. 下文只按卡上的字和表写, 对照材料只用同目录族里 gemini-3 目录的 3 Pro 卡, 不和 3.5 Flash, 3.6 Flash, 3.1 Flash-Lite 的材料混用.

# Gemini 3 Flash 模型卡: 分析

## 1. 一张以转述为主的卡

这张卡属于 Flash 自己的内容只有五块: 概述里的一句定位和思考档位, 输入输出的两个上限 (1M 上下文, 64K 输出), 第 4 页的成绩表, 第 5 页的安全增减表, 第 6 页的红队结论和前沿安全推定. 硬件和软件两节虽然写了 TPU, JAX, ML Pathways, 但和 3 Pro 卡第 4 页的对应段落逐字相同, 只把型号名换了.

其余小节几乎都是一句 「见 Gemini 3 Pro 的模型卡」. 数一下: 架构, 训练数据集, 训练数据处理, 分发, 已知局限, 可接受用途, 安全评测方法, 安全政策, 风险与缓解, 一共 9 节. 这 9 个链接指向同一个文件 Gemini-3-Pro-Model-Card.pdf. 读者去那边看到的内容, 主语全是 「Gemini 3 Pro」, 能不能原样套到 Flash 上, Flash 卡没有表态.

## 2. 三处 December 2025

卡上有三处日期. 封面是 「Model card published: December, 2025」, 第 2 页正文是 「Published: December 2025」, 第 4 页成绩说明是 「Results as of December, 2025」. 三处都只到月份, 写法有细微差别 (封面和成绩说明带逗号, 正文不带), 措辞也不一样.

所以两个 「December 2025」 是不是同一天, 卡上给不出答案. 和 3 Pro 卡比, 这张卡还少了两行: 3 Pro 卡分开写 「Model Release: November 2025」 和 「Last Updated: May 2026」, Flash 卡只有 「Published」. 它指的是卡的发布还是模型的发布, 发布后有没有更新过, 都没法确认. 能确认的是 3 Pro 卡在 2026 年 5 月那一版的家族名单里已经列出了 Gemini 3 Flash 的卡, 链接文件名是 Gemini-3-Flash-Model-Card.pdf.

## 3. 和 3 Pro 的关系: 能确认到哪一步

Flash 卡在概述, 模型依赖, 架构, 训练数据集四处重复 「based on Gemini 3 Pro」 或 「built off of the Gemini 3 Pro reasoning foundation」. 3 Pro 卡从另一头给了印证: 「Each subsequent model in the Gemini 3 Pro family is based on Gemini 3 Pro」, 家族名单里第一个是 Gemini 3 Pro Image, 第二个就是 Gemini 3 Flash. 这层父子关系两张卡是一致的.

再往细处就没有了. 3 Pro 卡写 3 Pro 是 sparse mixture-of-experts (MoE) 的 transformer, 原生支持文本, 视觉和音频输入. Flash 卡的架构一节把读者送去看 「the model architecture for Gemini 3 Pro」, 没说 Flash 是否同构, 参数量多大, 「based on」 是哪种派生方式. 因此不能从这两张卡推出 Flash 的结构. 输入输出倒是两张卡逐字相同: 文本, 图像, 音频, 视频输入, 上下文最多 1M token, 输出文本最多 64K token.

## 4. 思考档位只出现在列头

概述说 Flash 用 thinking levels 控制质量, 成本和延迟的配比. 这是让使用者决定推理时花多少算力的做法, 属于 TestingTime. 卡上没写档位有几个, 叫什么, 默认用哪个, 也没有一个数字说明高档和低档之间质量, 成本, 延迟各差多少. 整张卡没有价格, 也没有延迟数据, 所以 「控制成本和延迟」 这句话在卡上找不到可以核对的数.

thinking 在成绩表里只作为列头附注出现. Gemini 四列和 Claude Sonnet 4.5 列头都印 「Thinking」, GPT-5.2 印 「Extra high」, Grok 4.1 Fast 印 「Reasoning」. 没有 Flash 不开思考的列, 也没有按档位拆开的行, Flash 那列是哪一档没注明. 七列里只有 GPT-5.2 写出了具体档位名. 这意味着 Flash 的每个分数背后是多大的推理开销, 以及它和 3 Pro 是不是在同一档位下比, 都读不出来.

## 5. 成绩表: 对 2.5 代全面领先, 对 3 Pro 多数落后

成绩表 21 个基准, 其中 HLE, AIME, MRCR 各分两行, 共 24 行分数, 七列是 Gemini 3 Flash, 3 Pro, 2.5 Flash, 2.5 Pro, Claude Sonnet 4.5, GPT-5.2, Grok 4.1 Fast. 和 2.5 Flash 比, 两者都有分的 23 行 Flash 全部更好. 涨得最多的是智能体和屏幕类: ScreenSpot-Pro 从 3.9% 到 69.1%, MCP Atlas 从 3.4% 到 57.4%, Toolathlon 从 3.7% 到 49.4%, SimpleQA 从 28.1% 到 68.7%, LiveCodeBench Pro 从 1143 到 2316 Elo. 涨得最少的是 MRCR 1M (21.0% 到 22.1%) 和 Global PIQA (90.2% 到 92.8%).

卡上的标题句是 「significantly outperforms Gemini 2.5 Pro」. 和 2.5 Pro 比, 共有 22 行, Flash 赢 21 行, 输 1 行: FACTS 61.9% 对 63.4%, 低 1.5 点. 和 3 Pro 比, 24 行里 Flash 低 17 行, 持平 1 行 (MMMLU 91.8%), 高 6 行. 高的 6 行是 Toolathlon (+13.0), MCP Atlas (+3.3), ARC-AGI-2 (+2.5), SWE-bench Verified (+1.8), AIME 不用工具 (+0.2), MMMU-Pro (+0.2), 后两行几乎是平手. 低得多的是 Vending-Bench 2 ($3,635 对 $5,478), LiveCodeBench Pro (低 123 Elo), MRCR 128k (低 9.8 点), FACTS (低 8.6 点), Terminal-bench 2.0 (低 6.6 点).

按每行最高分算 (原图加粗), 3 Pro 独占 12 行, GPT-5.2 占 8 行, Flash 独占 2 行 (MMMU-Pro, Toolathlon), 另有两行并列: MMMLU 是 Flash 和 3 Pro, AIME 用代码执行是 3 Pro 和 Claude Sonnet 4.5 都是 100%. Grok 4.1 Fast 缺 12 格, GPT-5.2 缺 5 格, 算名次时各行参赛人数不同, 这一点要记着.

## 6. 和 3 Pro 卡逐行对照

两张卡的成绩表共有 22 行. Flash 卡独有 Toolathlon 和 MCP Atlas, 3 Pro 卡独有 MathArena Apex. 共有的 22 行里, 3 Pro 的分数 21 行一致, Vending-Bench 2 只差四舍五入 ($5,478 对 $5,478.16). 唯一对不上的是 τ2-bench: 3 Pro 卡写 85.4%, Flash 卡写 90.7%. 同一行 2.5 Pro 从 54.9% 变 77.8%, Claude Sonnet 4.5 从 84.7% 变 87.2%, 三家同时上调, 更像基准本身换了版本或设置. 两张卡都没说明原因.

对手列也有一处不一致: FACTS 的 Claude Sonnet 4.5 在 3 Pro 卡是 50.4%, 在 Flash 卡是 48.9%, 而 50.4% 正好是 Flash 卡里 2.5 Flash 的分数. 口径方面, Flash 卡给 HLE 加了 「full set, text + MM」, 给 ScreenSpot-Pro 和 CharXiv 加了 「No tools」, 把 Terminal-bench 的 「Terminus-2 agent」 改成 「harness」, FACTS 的说明整句重写. GPT 列从 GPT-5.1 换成了 GPT-5.2, 还加了 Grok 4.1 Fast. 所以跨卡能直接比的只有 Gemini 3 Pro 和 2.5 Pro 两列, 以及大部分 Claude Sonnet 4.5 的格子, τ2-bench 整行和 FACTS 的 Claude 格除外.

## 7. 长上下文: 窗口相同, 检索准度不同

Flash 和 3 Pro 的上下文窗口都是 1M token, 表里对应的检验是 MRCR v2 (8-needle), 分 128k 取平均和 1M 逐点两行. 128k 下 Flash 67.2%, 3 Pro 77.0%, GPT-5.2 81.9% 最高; 1M 下 Flash 22.1%, 3 Pro 26.3%, 2.5 Flash 21.0%, 2.5 Pro 16.4%, Grok 4.1 Fast 6.1%, Claude Sonnet 4.5 和 GPT-5.2 标 「not supported」.

两行算法不同, 一个平均一个逐点, 不能用 67.2% 减 22.1% 说 「从 128k 到 1M 掉了多少」. 能说的是: Flash 在 1M 这一行只比 2.5 Flash 高 1.1 点, 是全表对上一代涨幅最小的一行; 在 128k 这一行比 3 Pro 低 9.8 点, 是对 3 Pro 差距最大的百分比行之一. 窗口开到 1M 是容量上的数字, 多针检索的准度在这张卡里没有跟上 3 Pro.

## 8. 安全评测表: 靠颜色表达, 颜色丢了

第 5 页的表是 Flash 对 2.5 Flash 的绝对百分点增减: 文本到文本安全 -3.1%, 多语言安全 +0.1% (non-egregious), 图像到文本安全 -2.3%, 语气 +3.8%, 无理拒答 -10.4%. MinerU 把行名和说明两栏逐字母交织, 「non-egregious」 掉到下一行, 分数也错位了, 以上顺序按 PDF 文本层重排.

卡上说改进标绿, 退步标红, 但抓取里没有颜色, 只能反推. 正文说 Flash 在安全和语气上都好于 2.5 Flash, 且把无理拒答保持在低位. 由此看, 两行安全的负数是违规减少, 语气正数是改进, 多语言 +0.1% 挂着 「non-egregious」 (3 Pro 卡只给退步行挂这个词), 是不严重的小退步. 无理拒答的说明写的是 「回应边界提示的能力」, 字面上降了像变差, 但结合正文和 3 Pro 卡同一行 +3.7% 被当作退步, 这一行量的应是无理拒答的比例, -10.4% 是改进. 另外, Flash 的基线是 2.5 Flash, 3 Pro 的基线是 2.5 Pro, 两张卡又都声明评测改进过, 不能和以前的卡直接比, 所以 Flash 的 -3.1% 和 3 Pro 的 -10.4% 不能放在一起排.

## 9. 红队和前沿安全: 结论借自 3 Pro

人工红队由模型开发团队之外的专家做. 儿童安全: 达到发布门槛. 一般内容安全政策 (含儿童安全): 与 2.5 Flash 相近或更好. 红队范围和 3 Pro 一样覆盖严格政策以外的问题, 没有发现严重问题. 这一段没有数字.

前沿安全没有单独评 Flash. 卡上的推理是: 3 Pro Preview 没有达到任何 CCL, Flash 能力低于 3 Pro, 所以沿用 3 Pro 的结果, 认定可以部署. 这里有两处要留意. 一是 「less capable」 和成绩表并不逐行一致, Flash 有 6 行高于 3 Pro, 集中在智能体和编程. 二是对象写的是 「Gemini 3 Pro Preview」, 3 Pro 卡写的是 「Gemini 3 Pro」, 报告链接也不同, 两者是否同一检查点没有交代. 3 Pro 卡前沿安全表的相关两行: CBRN, CCL 为 Uplift Level 1, 未达到; Cybersecurity, v1 hard 11/12, v2 0/13, 达到预警阈值, CCL 为 Uplift Level 1, 未达到. Flash 卡没有任何一项自己的前沿安全分数.

## 10. 抓取和版面问题

第 4 页成绩表在 PDF 里是图片, MinerU 靠识别得出 HTML, 数字全对, 但有三处要修: 「t2-bench」 应为 「τ2-bench」; MRCR 两行合并格被挤成 「47.1%notsupported」, 「81.9%notsupported」, 「54.6%6.1%」; 原图底部一行 「For details on our evaluation methodology please see deepmind.google/models/evals-methodology/gemini-3-flash」 漏了. 这行用的是 deepmind.google 域名, 同页方法段写的是 deepmind.com.

原文本身也有两处疑似套模板没改干净. 第 3 页训练数据集一句写 「the training dataset for Gemini 3 Pro Image」, PDF 文本层同样如此, 型号名对不上 Flash. 第 6 页 「The performance results reported below」 出现在安全表之后, 下方已无表格, 这段和 3 Pro 卡第 8 页那段逐字相同. 封面的 「Google」 来自字标图片的识别, 文本层没有; 页脚页码从第 2 页起印 1, 到第 6 页印 5.

## 11. 引用这张卡的边界

能从这张卡引用的有: 发布于 2025 年 12 月 (只到月); 基于 Gemini 3 Pro; 以思考档位调节质量, 成本, 延迟的说法; 输入模态, 1M token 上下文, 64K token 输出; 24 行成绩连同口径和七列对手; 5 项安全增减; 儿童安全达到发布门槛; 前沿安全由 3 Pro 推定可部署. 引名次时要写明是这七列之间的名次.

不能从这张卡引用的有: Flash 的结构, 参数规模, 训练数据和它相对 3 Pro 的差别; 思考档位的数目和表里用的档位; 价格和延迟; 知识截止日期 (3 Pro 卡写的 2025 年 1 月主语是 3 Pro); 两处 December 2025 是否同一天. τ2-bench 的 3 Pro 分数两张卡不一致, 引用时要注明出自哪张卡.
