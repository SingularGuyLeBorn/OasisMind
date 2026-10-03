[OM-FREEPLAY] 材料不够 5000. 这是 Mistral AI 官网的 Mistral Medium 3 发布页, 标题 「Medium is the new large.」, 8 页, 10 张图, 不是论文. 下面只用这页印出来的数, 不补结构, 不从 Medium 3.5, Large 3 或同家族其他模型搬参数. 评测表和人评图的每个数都印在 PDF 嵌入的原图上, 不需要读柱高; 凡是自己算的比例, 平均, 差值, 都标了估算.

- 发布: **May 7, 2025**, 署名 Mistral AI, 官网 RESEARCH 栏.
- 名字: Mistral Medium 3. 页面没有给 API 模型名, 也没有版本号.
- 价格: 输入 $0.4, 输出 $2, 单位 per M token.
- 部署: 任何云; 自托管 **four GPUs and above**; 混合, 本地, VPC 内部署.
- 上线: 当天 Mistral La Plateforme, Amazon Sagemaker; 「soon」 IBM WatsonX, NVIDIA NIM, Azure AI Foundry, Google Cloud Vertex.
- 印出来的分数: 一张评测表, 10 行文本基准 x 6 个模型, 4 行多模态 x 4 个模型, 共 76 个百分数; 两张人评胜率图, 共 24 个数.
- 宣称: SOTA 性能, 「8X lower cost」, Claude Sonnet 3.7 的 90% 或以上, 超过 Llama 4 Maverick 和 Cohere Command A.
- 没印的: 参数量, 结构, 上下文窗口长度, 训练数据, 训练 token 数, 许可, 权重是否开放, GPU 型号, 延迟和吞吐.

## 1. 这页的底子

这页能用的材料分三块: 正文五段, 一张评测表, 两张人评图. 正文里和模型本身有关的数只有价格, 「四张 GPU 起」, 「8X」, 「90%」 这几个, 模型大小, 结构, 上下文长度一个都没写. 所以这页能分析的, 基本就是 「它和谁比, 比出了什么」, 以及宣传句和表格之间是否对得上.

材料本身也有损. 每一页都叠着 cookie 横幅, 转出的 Markdown 把评测表转坏了: RULER 128K 被认成 「RULER 428K」, 三个数错成 99.2%, 96.7%, 98.0%, 多模态一块只剩 Claude 一列的三个数. PDF 文本层保住了正文, PDF 里嵌着的表格原图和两张人评原图都完整, 表头, 行名, 被挡住的格子全能读到. 下文所有分数都以嵌入原图为准.

## 2. 价格, 「8X」 和 「一个数量级」

价格是这页唯一给全的商业数字: 输入每百万 token $0.4, 输出 $2, 输出是输入的 5 倍. 如果按输入输出 3:1 混合, 约 $0.8 每百万 token; 按 1:1 混合约 $1.2 (混合比例为假设值). 页面没有给 Claude Sonnet 3.7, DeepSeek v3 或任何对手的价格, 读者没有第二个数可以对照.

三处说法的倍数也不一致. Highlights 写 「8X lower cost」, 下一段写 「an order of magnitude less expensive」, 8 倍不到一个数量级. 两处都没有写比较对象, 只能按上下文猜是 Claude Sonnet 3.7. 「beats cost leaders such as DeepSeek v3, both in API and self-deployed systems」 更难核: 自部署成本取决于卡型, 利用率, 并发, 页面一个都没给.

## 3. 「90% of Claude Sonnet 3.7」 逐行核对

正文原话是 「performs at or above 90% of Claude Sonnet 3.7 on benchmarks across the board」. 把表里 14 行逐行拿 Medium 3 除以 Claude Sonnet 3.7, 12 行在 90% 以上, 两行不到: LiveCodeBench 约 84.2%, GPQA Diamond 约 81.9%. 这两行恰好一个是代码, 一个是 STEM, 正是正文说它 「stands out」 的两类.

反过来看, 有 6 行 Medium 3 比 Claude Sonnet 3.7 高: ArenaHard, Math500, RULER 32K, DocVQA, AI2D, ChartQA; HumanEval 同分 92.1%. 10 行文本基准等权平均, Medium 3 约 80.2, Claude Sonnet 3.7 约 81.9, 比值约 97.9%; 加上 4 行多模态一起平均, Medium 3 约 81.4, 反超 Claude 约 80.7. 所以 「平均接近 Claude」 成立, 「每一项都到 90%」 不成立, 正文用的是后一种说法.

## 4. 代码和 STEM: 「comes close to」

Highlights 说模型 「leads in professional use cases such as coding」, 第 3 页说它在代码和 STEM 上 「comes close to its very large and much slower competitors」. 前一句是领先, 后一句是接近, 两句的力度本来就不一样. 表里三行代码: HumanEval 第 2 (与 Claude 同分), MultiPL-E 第 3, LiveCodeBench 第 4, 三行最高都是 DeepSeek 3.1. LiveCodeBench 上 Medium 3 30.3%, DeepSeek 3.1 42.9%, 差 12.6 个点, 很难叫接近.

STEM 这边, Math500 91.0% 排第 2, 离 DeepSeek 3.1 的 93.8% 差 2.8 个点, 算得上接近; GPQA Diamond 57.1% 排第 4, 比 Claude Sonnet 3.7 的 69.7% 低 12.6 个点, 还低于 Llama 4 Maverick 和 DeepSeek 3.1 的 61.1%. MMLU Pro 77.2% 也排第 4. 代码人评倒是另一幅图景: 对 Claude 和 DeepSeek 仍然输, 对 Command-A 和 Llama 4 Maverick 大胜. 能支撑 「代码领先」 的, 只有和后两家的对比.

## 5. 对手逐个看

对 Llama 4 Maverick, 14 行赢 10 行, 输的是 GPQA Diamond, MMLU Pro, MMMU, ChartQA, 最大差距在 ChartQA, 7.8 个点. 文本 10 行平均约 80.2 对 78.4. 正文说 「surpasses」, 整体上成立, 知识类两行和多模态两行不成立. 对 Command-A, 10 行赢 8 行, 输 IfEval (89.4% 对 89.7%) 和 RULER 128K (90.2% 对 91.2%), 平均约 80.2 对 75.1, 差距是几个对手里最大的.

对 GPT-4o, 14 行赢 10 行, 输 LiveCodeBench, MMMU, ChartQA, RULER 32K 同分. 对 DeepSeek 3.1, 10 行只赢 IfEval 和 RULER 32K 两行, 平均约 80.2 对 83.1, DeepSeek 3.1 是表里文本平均最高的一列. 正文提 DeepSeek 只提价格, 不提性能, 这个取舍和表里的数是吻合的: 性能上它比不过, 所以比价格.

## 6. 长上下文: 32K 和 128K

RULER 32K 上六家挤在 94.8% 到 96.0% 之间, Medium 3 和 GPT-4o 并列 96.0% 第一, 差距都在 1.2 个点以内, 区分度不大. 到 128K 拉开了: Claude Sonnet 3.7 93.8%, DeepSeek 3.1 91.9%, Command-A 91.2%, Medium 3 90.2%, GPT-4o 88.9%, Llama 4 Maverick 86.7%. Medium 3 从第一掉到第 4.

从 32K 到 128K 的跌幅, Medium 3 5.8 个点, 在六家里是第三大; Claude Sonnet 3.7 只跌 1.9, DeepSeek 3.1 跌 3.9, Llama 4 Maverick 跌 8.1 最多. 页面没有写 Medium 3 的上下文窗口有多长, 能报 RULER 128K, 只能说明它至少能吃下 128K 的输入 (页面没说单位是 token). 正文也没有一句提长上下文, 这一块只在表里出现.

## 7. 多模态四行

多模态只比了四家, Command-A 和 DeepSeek 3.1 两列合并成 「No multimodal support」. Medium 3 在 DocVQA (95.3%) 和 AI2D (93.7%) 排第一, 在 ChartQA (82.6%) 排第 3, 在 MMMU (66.1%) 垫底. 四行平均约 84.4, Llama 4 Maverick 约 85.2, GPT-4o 约 83.5, Claude Sonnet 3.7 约 77.7, Medium 3 排第二.

DocVQA 和 AI2D 偏文档, 图示理解, MMMU 偏大学学科题, ChartQA 偏图表读数. Medium 3 强在前两类, 弱在后两类, 和 Highlights 里 「leads in ... multimodal understanding」 的全称说法有出入. 人评图里 Multimodal 一行对 Llama 4 Maverick 53.85 比 46.15, 是七个领域里最接近平手的一行, 和表里多模态平均略低于 Llama 4 Maverick 的结果方向一致.

## 8. 人评: 胜率背后的样本量

两张人评图都只给胜率, 不给题数. 用两位小数反推能对上的最小分母: 81.82 是 9/11, 69.23 是 9/13, 37.50 是 3/8, 40.00 是 2/5, 53.85 是 7/13, 64.71 是 11/17, 73.33 是 11/15 (实际题数可以是这些分母的倍数). 如果真是最小分母, 每个对比只有几道到十几道题, 一道题翻转就能让胜率变动约 6 到 20 个点.

图的构成也值得看. 代码图五个对手里, Medium 3 对 Claude Sonnet 3.7 和 DeepSeek 3.1 输, 对 GPT-4o 平, 只对 Command-A 和 Llama 4 Maverick 赢. 分领域图只放了 Llama 4 Maverick 一个对手, 这正是它在代码图里赢得最多的那家. 正文用 「some of its much larger competitors」 收窄了范围, 措辞是准确的, 但图的挑选本身就偏向有利的对比. 另外每根柱两段加起来都是 100, 平局去了哪里, 页面没说.

## 9. 评测口径

第 3 页连着两句话: 先说 「有别家报过的数就用别家的, 没有才用自己的评测框架」, 再说 「所有基准的准确率都出自同一条内部流程」. 前一句意味着表里混着两种来源, 后一句意味着只有一种. 第 4 页表下的星号注只重复了后一句. 表里没有任何格子标来源, 读者分不出哪些是抄的, 哪些是自测的.

这个问题会直接影响小差距的判读. 比如 ArenaHard 上 Medium 3 97.1% 对 DeepSeek 3.1 97.3%, IfEval 上 89.4% 对 Command-A 89.7%, 差距都只有零点几个点. 如果两边一个是厂商自报, 一个是 Mistral 自测, 这点差距落在流程差异里. 另外 ArenaHard 本身依赖模型当裁判, 页面没说用的哪个裁判模型.

## 10. 部署和企业定制

这页的重心有一半在企业. Highlights 第 4 条列了混合或本地 / VPC 部署, 定制后训练, 接入企业系统三项; 第 6 页说借助 applied AI solutions, 模型可以继续预训练, 全量微调, 融进企业知识库; Beta 客户来自金融, 能源, 医疗. 这些都是能力清单, 没有一个定制前后的分数, 没有客户名, 没有周期或成本.

部署数字只有 「four GPUs and above」. 没有卡型, 精度, 参数量, 这句既不能推出模型多大, 也不能推出单机吞吐. 上线渠道全是 API, 自部署要 「contact us」. 页面从头到尾没说 Medium 3 开放权重, 许可也没提. 结合开头把 Mistral 的模型分成 「open models」 和 「enterprise models」 两栏, Medium 3 的发行方式更像后一栏, 虽然页面没有明说它归哪一栏.

## 11. 谱系: 这页能说什么

这页给出的谱系线索是一条按尺寸排的产品线. 开头把 Mistral 7B 当起点, 说从那时起就一直 「以小博大」; 结尾说三月发了 Mistral Small, 今天发 Medium, 接下来几周做 'large'. 页面第 1 页 「Mistral Small」 的链接指向 mistral-small-3-1 那篇公告, 所以这里的 Small 指的是三月那一版. Small, Medium, Large 是尺寸档位, 页面没给任何一档的参数量, 档位之间差多少, 这页说不出来.

标题 「Medium is the new large.」 是这页的定位: 中档模型拿来对标大档的对手 (Claude Sonnet 3.7, GPT-4o, DeepSeek 3.1), 卖点是价格. 值得注意的是, 评测表里没有一列是 Mistral 自家的旧模型, 没有 Mistral Large, 也没有 Mistral Small. 所以这页没法回答 「Medium 3 比自家上一代强多少」, 更没法回答 Medium 和 Large 两档谁强. 结尾对 'large' 和 'open' 都加了引号, 只是预告, 不是这页的内容; 这一档后来的参数和分数, 不该倒灌进这篇的解读里.

## 12. 本页对不上的数字

正文和表格之间: 「at or above 90% of Claude Sonnet 3.7 ... across the board」 有两行不成立, LiveCodeBench 约 84.2%, GPQA Diamond 约 81.9%; 「8X lower cost」 和 「an order of magnitude less expensive」 倍数不同, 都没有比较对象; 「leads in ... coding」 对应的三行代码没有一行第一; 「surpasses ... Llama 4 Maverick」 有 4 行不成立; 正文比价格写 「DeepSeek v3」, 表和人评图写 「DeepSeek 3.1」, 页面没解释.

页面自身: Highlights 编号是 1, 3, 4, 没有第 2 条; 第 3 页两句评测口径互相矛盾; 页脚 「Mistral AI © 2026」 和正文日期 May 7, 2025 差一年多, 页脚是抓页时的外壳. 转换稿和 PDF 之间: 转出的 Markdown 把 「RULER 128K」 写成 「RULER 428K」, 三个数写成 99.2%, 96.7%, 98.0%, 原图是 90.2%, 86.7%, 88.9%; 多模态一块丢了行名和大部分数字. 表格原图本身的数字没有自相矛盾的地方.
