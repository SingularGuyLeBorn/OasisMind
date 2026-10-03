# Gemini 3.1 Flash-Lite 模型卡解读

## 1. 这张卡交代了什么

这份材料是 Gemini 3.1 Flash-Lite 的模型卡, 共 7 页, 没有插图. 第 1 页是封面, 只有 Google 字样和标题; 第 2 页起是正文, 标 「Updated: May 2026」. 真正属于这个模型的内容只有五块: 一句定位 (高并发, 对延迟敏感, 例如翻译和分类), 输入输出规格 (上下文最多 1M token, 输出 64K token), 五个分发渠道, 一张含价格和速度的 14 行评测表, 一张 5 行的内容安全差值表, 外加一段人工红队结论和一段前沿安全结论.

其余章节都不是它自己的内容. 架构, 训练数据集, 训练数据处理, 已知局限, 可接受用途, 评估方法, 安全政策, 风险与缓解, 一共 8 节, 每节都只有一句 「see the Gemini 3 Pro model card」; 前沿安全又指向 3.1 Pro 卡. 硬件和软件两段和 3 Flash 卡逐字相同, 只换了模型名. 所以这是一张增量卡, 自己的信息集中在第 4 页和第 6 页. 读它需要把 3 Pro 卡放在旁边, 想做横向比较还要借 3 Flash 卡, 因为这张卡的评测表里没有任何一个 Gemini 3 系列的模型.

## 2. 名字和日期

目录叫 gemini-3-flash-lite, 卡上的模型叫 Gemini 3.1 Flash-Lite, 差了 「.1」. 7 页里找不到 「Gemini 3 Flash-Lite」 这个名字. 封面写 「Gemini 3.1 Flash Lite Model Card」, 中间没有连字符; 正文一律写 「Flash-Lite」; PDF 元数据标题是 「Gemini-3-1-Flash-Lite-Model-Card (May update)」. 三处都带 3.1, 所以本文统一叫 3.1 Flash-Lite. 同级的 gemini-3-flash 目录是 Gemini 3 Flash, 2025 年 12 月发布, 定位是智能体流程, 日常编程和多模态分析, 和这里不是一个模型, 也不是同一张卡的两个版本.

日期有三个, 但没有发布日. 卡头写 「Updated: May 2026」, 评测结果注明 「as of March, 2026」, PDF 标题后缀是 「(May update)」. 能推出的只有两点: 至迟 2026 年 3 月模型已经可以跑评测; 5 月这一版是更新, 不是首发. 首发在哪天, 5 月改了哪些字段, 卡上都没写. 3 Flash 卡用的字段是 「Published」, 这张卡换成了 「Updated」, 字段名一变, 就不能把它当发布日去读. 另外卡上自己说模型卡会不定期更新, 评测表停在 3 月, 表头也没有标出 5 月是否重跑过.

## 3. 和 3 Pro 的关系

卡上三次写 「based on Gemini 3 Pro」: Model dependencies 一次, Architecture 一次, Training Dataset 一次, 措辞一样. 依赖的是 3 Pro, 不是 3.1 Pro. 名字里的 「3.1」 从哪里来, 它和 3.1 Pro 之间有没有共享的训练阶段, 卡上一句解释都没有. 3 Flash 卡也写 「based on Gemini 3 Pro」, 所以从卡面看, 3 Flash 和 3.1 Flash-Lite 挂在同一个底座下面, 编号却差了一格.

「based on」 具体指什么, 这张卡没有展开. 硬件一节说 3.1 Flash-Lite 「was trained using」 TPU, 软件是 JAX 和 ML Pathways, 说明它经历过训练; 但这一段是模板文字, 和 3 Flash 卡只差模型名. 是从零预训练, 从 3 Pro 蒸馏, 还是在 3 Pro 基础上继续训练, 7 页里没有任何线索. 参数量, 层数, 激活量也都没有. 架构一节直接让读者去看 3 Pro 卡, 那张卡讲的是 3 Pro 本身, 不能把 3 Pro 的结构原样套到 Lite 上. 本文对结构不做任何补充.

## 4. 价格和速度

这张卡的评测表开头三行是价格和速度, 这是 3 Flash 卡没有的. 3.1 Flash-Lite 输入 $0.25 / 1M token (不含缓存), 输出 $1.50 / 1M token, 输出速度 363 token/s. 和上一代 2.5 Flash-Lite 比, 输入贵 2.5 倍 ($0.10), 输出贵 3.75 倍 ($0.40), 速度 366 对 363, 基本不变. 表里 2.5 Flash-Lite 和 2.5 Flash 的价格, 和 gemini-2-5-flash-lite 目录那篇博客给的稳定版价格一致, 可以互相印证.

卡上说它 「cost-efficient」, 参照物更像 2.5 Flash. 对 2.5 Flash, 输入低 17% ($0.30), 输出低 40% ($2.50), 速度快约 46% (249). 对表里其他家: 和 GPT-5 mini 输入同价, 输出低 25% ($2.00), 速度是它的 5 倍多 (71); Claude 4.5 Haiku 的输入是它的 4 倍, 输出是 3.3 倍; Grok 4.1 Fast 更便宜, 输入 $0.20, 输出 $0.50, 只有它的三分之一, 速度 145, 不到它的一半. 如果按分类任务那种输入多输出少的形态, 假设输入 1M token, 输出 0.1M token 算一笔账: 3.1 Flash-Lite 约 $0.40, 2.5 Flash-Lite $0.14, 2.5 Flash $0.55, GPT-5 mini $0.45, Grok 4.1 Fast $0.25, Claude 4.5 Haiku $1.50. 这个比例是本文假设的, 卡上没有.

速度一行要谨慎用. 单位是 「Tokens/s」, 设置栏空着, 提示长度, 输出长度, 是否开思考, 走哪个渠道都没写, 方法一节把细节指向一个 evals-methodology 网页, 不在本目录. 表头 3.1 Flash-Lite 标 「High」, 两个 2.5 模型标 「Dynamic」, 这些标签大概是思考档位, 也就是推理时多花算力的 TestingTime 档, 但卡上没有解释 High 和 Dynamic 各是什么. 档位不同, 速度也就不一定是同一种工作负载下量的.

## 5. 同表比较: 赢了哪些, 输了哪些

评测表的能力部分有 11 行, PDF 原图每行最高分加粗, MinerU 转出来的 md 里粗体丢了. 数下来, 3.1 Flash-Lite 拿了 6 个第一: GPQA Diamond 86.9%, MMMU-Pro 76.8%, Video-MMMU 84.8%, SimpleQA Verified 43.3%, MMMLU 88.9%, MRCR v2 128k 60.1%. 其中 SimpleQA 领先最多, 第二名 2.5 Flash 只有 28.1%, GPT-5 mini 只有 9.5%.

另外 5 行输了. HLE 不用工具 16.0%, 低于 Grok 4.1 Fast 的 17.6% 和 GPT-5 mini 的 16.7%. CharXiv 73.2%, 低于 GPT-5 mini 的 75.5%, 但 GPT-5 mini 那格注了 「+ python」, 用了工具, 而 3.1 Flash-Lite 这行设置栏是空的. LiveCodeBench 72.0%, 低于 GPT-5 mini 的 80.4% 和 Grok 的 76.5%. FACTS 40.6% 和 MRCR 1M 12.3% 两行, 输给的是自家 2.5 Flash (50.4% 和 21.0%). 编程这一项, 在这张表里 3.1 Flash-Lite 排第三.

和两个 2.5 模型对减, 能看出这一代改了什么. 对 2.5 Flash-Lite, 11 行全部上涨: HLE +9.1, GPQA +20.2, MMMU-Pro +25.8, CharXiv +17.7, Video-MMMU +24.1, SimpleQA +31.8, FACTS +22.7, MMMLU +4.4, LiveCodeBench +37.7, MRCR 128k +29.5, MRCR 1M +6.9. 对 2.5 Flash, 9 行上涨, 2 行下跌: FACTS -9.8, MRCR 1M -8.7. 也就是说, 3.1 Flash-Lite 在多数能力上已经超过上一代的 Flash, 但在综合事实性和百万级长上下文检索两项上还不如它. 方法一节明确把事实性和长上下文列进评测范围, 结果一节对这两处退步没有任何说明.

## 6. 借 3 Flash 卡, 和 3 Pro, 3 Flash 并排

这张表没有 3 Pro 和 3 Flash 列, 要比只能借 3 Flash 卡 (2025 年 12 月发布) 的评测表. 先查两张表能不能对接. 两张表共有 2.5 Flash 和 Grok 4.1 Fast 两列. 2.5 Flash 在 10 个共有行上的数字全部相同: HLE 11.0%, GPQA 82.8%, MMMU-Pro 66.7%, CharXiv 63.7%, Video-MMMU 79.2%, SimpleQA 28.1%, FACTS 50.4%, MMMLU 86.6%, MRCR 54.3% 和 21.0%. Grok 除了 CharXiv 和 Video-MMMU (3 Flash 卡是破折号, 这里补了 31.6% 和 74.6%) 外也全部相同. 基线一致, 说明这些行大概率用的是同一套评测流程, 可以并排.

| 基准 | 3.1 Flash-Lite | 3 Flash | 3 Pro | 对 3 Flash | 对 3 Pro |
| --- | --- | --- | --- | --- | --- |
| HLE (不用工具) | 16.0% | 33.7% | 37.5% | -17.7 | -21.5 |
| GPQA Diamond | 86.9% | 90.4% | 91.9% | -3.5 | -5.0 |
| MMMU-Pro | 76.8% | 81.2% | 81.0% | -4.4 | -4.2 |
| CharXiv Reasoning | 73.2% | 80.3% | 81.4% | -7.1 | -8.2 |
| Video-MMMU | 84.8% | 86.9% | 87.6% | -2.1 | -2.8 |
| SimpleQA Verified | 43.3% | 68.7% | 72.1% | -25.4 | -28.8 |
| FACTS Benchmark Suite | 40.6% | 61.9% | 70.5% | -21.3 | -29.9 |
| MMMLU | 88.9% | 91.8% | 91.8% | -2.9 | -2.9 |
| MRCR v2 128k | 60.1% | 67.2% | 77.0% | -7.1 | -16.9 |
| MRCR v2 1M | 12.3% | 22.1% | 26.3% | -9.8 | -14.0 |

差距分成两档. 多模态和多语言几行差得少: Video-MMMU 只差 2.1, MMMLU 差 2.9, GPQA 差 3.5, MMMU-Pro 差 4.4. 知识和长上下文几行差得多: SimpleQA 差 25.4, FACTS 差 21.3, HLE 差 17.7, 长上下文两行差 7 到 10 个点. SimpleQA 测的是参数化知识, 也就是模型记住了多少事实, 这一行差距最大, 和 「Lite」 的定位对得上: 翻译和分类不太依赖冷门事实, 问答和检索就吃亏. 需要事实性的场景, 这张表给出的信号很明确.

这张并排表有三处边界. 第一, 档位标签不同: 这张卡是 High, 3 Flash 卡是 Thinking, 是否同一种思考设置, 两张卡都没说. 第二, 日期不同: 3 Flash 卡是 2025 年 12 月的结果, 这张是 2026 年 3 月. 第三, LiveCodeBench 不能比: 这里是 LiveCodeBench 百分比, 时间窗 2025/1/1 到 2025/5/1, 3 Flash 卡上是 LiveCodeBench Pro 的 Elo 分, 是两个基准. 价格和速度 3 Flash 卡没给, 也没法并排. 3 Pro 的数是经 3 Flash 卡转引的, 3 Pro 自己的卡在 gemini-3 目录, 本文没有逐格回查.

## 7. 内容安全表和红队

自动安全评估比的是 2.5 Flash-Lite, 五项: 文本到文本安全 -1.18%, 多语言安全 -1.84%, 图像到文本安全 -21.7%, 语气 +14.59%, 不当拒答 -14.41%. 卡上说改进标绿, 退步标红, md 里颜色丢了. PDF 文字层里这五个数都是同一种深绿 (#38761d), 所以五项全是改进: 安全三项的负号是违规率下降, 不当拒答的负号是拒答变少, 语气的正号是变好. 变化最大的是图像到文本安全, 降了 21.7 个点, 其次是语气和不当拒答, 各 14 个点多. 源 md 里这张表的描述列被 MinerU 交错成乱码, 行名也粘在一起, bi 文件已按 PDF 文字层恢复.

这一页的对比对象不统一. 表比 2.5 Flash-Lite; 人工红队一段说一般内容安全表现和 2.5 Flash 相近或更好; 脚注 2 说语气的正号是 「compared to Gemini 2.5 Pro」; 脚注 1 讲的是 「previous iterations of the 2.5 Flash-Lite model card」 的排序变化. 3.1 Pro 卡上也有同样两条脚注, 字句同源, 应是模板带过来的; 以表头为准. 正文还写 「reported below」, 表其实在上方. 卡上说评估方法改进过, 结果不能和之前的模型卡直接比, 所以这组差值不能和 2.5 Flash-Lite 卡上的旧差值相加. 红队部分, 儿童安全: 达到发布所需阈值. 和 3 Pro 一样, 红队也覆盖了严格政策以外的问题, 没有发现严重问题.

## 8. 前沿安全: 借 3.1 Pro 的结论

前沿安全一节没有对 3.1 Flash-Lite 单独出分数. 卡上的推理是: 发布时综合能力最强的是开启 Deep Think 的 3.1 Pro, 它没有达到前沿安全框架里的任何关键能力等级 (CCL); 评估显示 3.1 Flash-Lite 能力低于 3.1 Pro; 因此 3.1 Flash-Lite 也不太可能达到任何 CCL. 结论依赖 「能力更弱的模型风险不会更高」 这个前提, 而 「less capable」 这一步用了哪些评估, 卡上没给.

参照模型和底座不是同一个. 底座是 3 Pro, 前沿安全看 3.1 Pro, 风险与缓解又指回 3 Pro 卡. 3 Flash 卡当时依据的是 3 Pro Preview 的前沿安全报告, 这张卡换成了 3.1 Pro 的 Deep Think. 两张卡的写法说明, 同一家族里的小模型不单独做前沿安全评估, 而是挂靠发布时最强的那个. 想看具体领域的数字, 得去 3.1 Pro 卡, 这张卡里一个都没有.

## 9. 怎么用这张卡

能直接用的是第 4 页和第 6 页. 价格和速度三行可以拿来和 2.5 系列, GPT-5 mini, Claude 4.5 Haiku, Grok 4.1 Fast 对比, 注意速度的量法没写. 11 个能力行可以在表内比, 其中 10 行借 3 Flash 卡还能和 3 Flash, 3 Pro 并排; LiveCodeBench 这一行不行. 安全表以表头的 2.5 Flash-Lite 为基线, 五项都是改进.

不能从这张卡拿到的是结构和训练. 除了 「based on Gemini 3 Pro」 和 TPU, JAX, ML Pathways, 卡上没有任何结构或训练信息, 局限和知识截止也全部指向 3 Pro 卡. 目录名写成 gemini-3-flash-lite, 引用时要按卡上的名字写 Gemini 3.1 Flash-Lite, 日期按 「2026 年 5 月更新, 评测截至 2026 年 3 月」 写, 不要写成 5 月发布.
