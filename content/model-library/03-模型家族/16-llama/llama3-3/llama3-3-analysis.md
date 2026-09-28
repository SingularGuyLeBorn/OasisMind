[OM-FREEPLAY] 材料不够 5000. 源文是 5 页的官方模型卡, 没有图, 没有方法章节. 下面只整理卡上印出来的规模, 许可证, 训练数字, 基准表, 以及它和门户表对不上的地方.

## 1. 这是一张模型卡

标题是 Meta Llama 3.3 Official Model Card, 来源是 meta-llama/llama-models 仓库里 llama3_3 目录下的 MODEL_CARD.md. 它不是技术报告. 5 页里没有图, 没有公式, 没有训练流程图, 也没有消融. 内容按模型卡的固定栏目排: 模型信息, 预期用途, 硬件和软件, 训练数据, 基准, 责任与安全, 伦理考虑与局限.

PDF 里有几行 「## 」 后面什么都没有, MinerU 转写时又把 Hardware and Software, Training Data, Responsibility & Safety 等标题拆成 「## ##」 开头. 这些是排版残留, 不是卡上多出来的小节. 对照稿里每个标题只保留一次, 空标题不再造.

## 2. 卡上印的规模只有 70B

70B 在卡上出现了五次: 第 1 页开头一句 「generative model in 70B」, 表格 Params 一格, 发布日期 「70B Instruct」, 第 2 页能耗表的 「Llama 3.3 70B」, 以及基准表的 「Llama-3.3 70B Instruct」 一列. 没有第二个规模. 所以说 Llama 3.3 是 70B, 用的是卡上自己的字, 不需要借门户表.

开头一句说它 「pretrained and instruction tuned」, 用途一节也说预训练模型可以改作各种自然语言生成任务. 可是发布日期下面只有 70B Instruct 一条. 预训练版是不是单独发布, 哪天发布, 卡上没写. 读这张卡时, 能落实的只有指令版的发布日期.

## 3. 架构只写了三样

架构一栏的原话是: 自回归语言模型, 「optimized transformer architecture」. 表格里 GQA 一格写 Yes, 下面一句补充 「All model versions use Grouped-Query Attention (GQA) for improved inference scalability」. 微调方法写了 SFT 和 RLHF. 就这些.

层数, 隐藏维度, 注意力头数, 词表大小, 位置编码, 归一化方式, 卡上一个都没印. 别处资料里关于 Llama 系列结构的说法, 不能算作这张卡的内容. 另外 「All model versions」 是复数, 但卡上只列了一行模型, 「所有版本」 指哪几个, 卡本身没交代.

## 4. 许可证写了名字, 没写条款

许可证一段只有三样东西: 名字 Llama 3.3 Community License Agreement, 性质 「custom commercial license」, 以及 GitHub 上 LICENSE 文件的链接. 条款正文不在这 5 页里. 预期用途一节说这份许可证允许商业和研究用途, 也允许用模型输出去改进其他模型, 包括生成合成数据和蒸馏.

超出范围的三条是: 违法使用, 违反 Acceptable Use Policy 和许可证的使用, 在支持语言之外使用. 第 2 页的注又放宽了一点: 开发者守许可证和使用政策, 可以微调到其他语言, 但责任自负. 许可证有没有用户规模门槛, 有哪些署名要求, 这张卡都读不出来. 第 2 页能耗表里的 700 是单卡功率, 单位是瓦, 和许可证没有关系.

## 5. 和门户表对照

家族门户表里 Llama 3.3 一行写的是: Launch date 12/04/2024, Model sizes 70B, Context Length 128K, Tokenizer TikToken-based, 后三格只剩链接文字 Use Policy, License, Model Card. 规模 70B 和卡一致. 上下文 128K 和卡上的 128k 是同一个数, 只差大小写.

对不上的是日期. 门户表按月/日/年读是 2024 年 12 月 4 日, 卡上写 70B Instruct 的发布日期是 December 6, 2024, 差两天, 两边都没有解释. 分词器这一格在卡上没有出处, 卡从头到尾没提分词器. 反过来, 卡上的 15T+, 知识截止 2023 年 12 月, 8 种支持语言, 门户表都没有. 两份材料各印各的, 引用时要注明出自哪一份.

## 6. 算力和排放: 正文和表格打架

正文写训练累计用了 39.3M GPU 小时, 硬件是 H100-80GB, TDP 700W, 并说 「per the table below」. 下表只有一行 Llama 3.3 70B, 训练时间 7.0M GPU 小时. 39.3 是 7.0 的五倍多, 表里没有别的行能补上差额. 卡上也没说 39.3M 算没算别的模型或别的训练阶段.

排放是同样的情况. 正文写基于地点的排放 11,390 吨 CO2eq, 表里同一列是 12.9 公吨 CO2eq, 相差约 883 倍, 吨和公吨的区别解释不了. 能对上的只有两格: 基于市场的排放两边都是 0, 功率两边都是 700W. 这一节还写 「Since Meta is openly releasing these models」, 用的是复数. 引用 Llama 3.3 的训练算力时, 只能把 39.3M 和 7.0M 都列出来, 注明两者在卡内矛盾.

## 7. 训练数据和语言

预训练数据在第 1 页表格里写 15T+, 第 2 页写 「~15 trillion tokens」, 一个是 「超过」, 一个是 「大约」, 量级相同. 两处都说只指预训练数据. 训练数据的描述是 「A new mix of publicly available online data」, 没有给来源比例. 微调数据包括公开的指令数据集和超过 25M 条合成样本. 知识截止在表格和数据时效一栏都写 2023 年 12 月.

语言方面, 第 1 页列了 8 种支持语言, 第 4 页换了个顺序再列一次 (英语加 7 种), 集合相同. 第 2 页的注说训练时用到的语言比这 8 种多. 第 4 页说模型也许能输出其他语言, 但那些语言没有达到安全和有用性的门槛, 强烈不建议不做微调和系统控制就用. 卡上没有列出 「更多语言」 具体是哪些.

## 8. 基准表只和自家模型比

基准表在第 2 页和第 3 页各占一段, 列是 Llama 3.1 8B, 70B, 405B 和 Llama-3.3 70B 四个指令版. 第 1 页开头说它胜过许多开源和闭源聊天模型, 但表里没有一列外部模型, 小节开头也只写 「relative to our previous models」. 那句说法在这张卡里找不到数字支撑.

和同规模的 3.1 70B 比, 3.3 70B 多数行更高: MMLU Pro (CoT) 68.9 对 66.4, IFEval 92.1 对 87.5, GPQA Diamond (CoT) 50.5 对 48.0, HumanEval 88.4 对 80.5, MBPP EvalPlus (base) 87.6 对 86.0, MATH (CoT) 77.0 对 68.0, MGSM 91.1 对 86.9. MMLU (CoT) 两者都是 86.0. BFCL v2 是 77.3 对 77.5, 低 0.2. 和 405B 比, IFEval, GPQA Diamond, MATH 三行 3.3 70B 更高, 其余更低.

表里还有几处要留意. IFEval 一行的 Shots 和 Metric 是空格. 小节标题是 「Benchmarks - English Text」, 却放了一行 Multilingual 类别的 MGSM. 指标名很长, 例如 BFCL v2 的 overall_ast_summary/macro_avg/valid, MATH 的 sympy_intersection_score, 卡上没解释怎么算. 第 3 页的三行没有重印表头, 对照稿沿用了第 2 页的表头.

## 9. 安全部分大多指向 Llama 3

责任与安全一节占了第 3 页到第 5 页的大半. 结构是: 三方面策略, 负责任的部署, 指令版的安全微调, 系统级防护 (Llama Guard 3, Prompt Guard, Code Shield), 工具使用和多语言的注意事项, 评估, 红队, 三个关键风险领域 (CBRNE, 儿童安全, 网络攻击), 社区. 这一节没有一个数字, 没有拒答率, 没有违规率.

很多句子的主语是 Llama 3. 安全缓解的细节让读者去看 Llama 3 论文, 拒答一段写在 Llama 3 工作的基础上, CBRNE 和网络攻击两段写 「Llama 3 family」, 儿童安全一段写 「For Llama 3」. 卡上没说这些评估在 3.3 上重做过. 转引这部分时, 应当写成卡上对 Llama 3 系列的描述, 不写成 3.3 的评估结果.

## 10. 原文里的错字

指令版一段有 「reduce the develoderationsper workload」, PDF 和 md 都这样印, 按上下文应是 developer workload. 伦理一节 「without insertion unnecessary judgment」 少了一个 of. 超出范围一句末尾多出一对转义的星号, 红队一段末尾印成 「. .」. 这些都是原文的问题, 对照稿英文照录或只去掉转义符, 中文按意思译.

还有几处小的不一致. 反馈用的 README 链接指向 meta-llama/llama3 仓库, 不是 llama3_3 目录. 基准表只有 3.3 那一列写成 「Llama-3.3」, 带连字符. 这些不影响数字, 但引用链接和列名时要按原样抄, 不要顺手统一.
