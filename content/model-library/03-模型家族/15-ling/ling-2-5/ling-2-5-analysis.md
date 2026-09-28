[OM-FREEPLAY] 材料不够 5000.

## 1. 这 12 页是什么

这份 md 是 MinerU 从 Hugging Face 上 inclusionAI/Ling-2.5-1T 的页面抓下来的, 共 12 页, 10 张图. 第 1 页是 Hugging Face 的页面外壳: 任务标签, 许可证, 部署按钮, 张量类型, 使用这个模型的 Spaces, 以及一个 「Collection including」 小框. 第 2 页起是模型卡片正文, 依次是发布说明, 评测表, 下载表, 架构说明, 吞吐图, 长上下文图, 部署命令, 局限与计划, 许可证. 第 12 页是一段训练内容文档的说明, 最后一行 「System theme」 是页脚.

它不是技术报告. 页面上没有作者, 没有发布日期, 没有参考文献, 没有消融实验, 也没有训练超参数. 论证方式是发布公告: 先给结论, 比如更高效, 推理更强, 长上下文领先, 再用一张五个模型的评测表和几张图撑住, 每个技术点都只写一两句. 下面各节按同一个顺序看: 页面印了什么, 印的东西之间能不能对上, 还缺什么.

页面对自己的定位很清楚. 合集卡片的简介是 「The newest flagship non-reasoning mode...」, 原文在这里截断, 正文反复用 「instant model」 这个词, 和 「thinking models」 对举. 评测表的对比列也都挑了非思考版本: DeepSeek-V3.2-nothink, Kimi-K2.5-Instant, GPT-5.2-chat. 所以读这页的数字时要记住, 比较是在 instant 模型这一档里做的, 不和同家族或别家的思考模型比.

## 2. 合集里有哪些模型

任务说明把这份材料叫作合集页. 实际抓到的是模型卡片页, 合集只在第 1 页末尾出现一个小框, 写着 「Ling 2.5 Collection」, 「1 item」, 「Updated 24 days ago」, 最后还有一个没有单位的 11. 小框挂在 「Collection including inclusionAI/Ling-2.5-1T」 这个标题下, 所以这 1 个条目就是 Ling-2.5-1T 本身. 第 4 页的下载表也只有 Ling-2.5-1T 一行. 就这 12 页能看到的内容而言, 这个合集里只有一个模型.

页面上还出现了很多别的名字, 但角色都不是合集成员. Ling-2.0-1T 是评测表里的前代列. Ling-1T 出现两次, 一次在评测段正文里当作前代, 一次在部署段的示例命令说明里. Ringflash-linear-2.0 是改造注意力时参照的 「technical roadmap」. Ling-2.5-1T-base 是继续预训练的起点, 下载表里没有它. 对手方面, 第 5 页比吞吐用的是 「KIMI K2 architecture」, 评测表用的是 Kimi-K2.5-Instant, 正文写作 Kimi K2.5; DeepSeek 在正文是 DeepSeek V3.2, 表头是 DeepSeek-V3.2-nothink; GPT 在正文是 GPT 5.2 或 GPT-5.2, 表头是 GPT-5.2-chat; Gemini 3 Pro 只在第 7 页正文出现, 不在表里. 另外 gpt-4.1 和 gemini-2.5-pro 分别是 tau2-bench 的用户模拟模型和 Arena-Hard-V2 的评审模型.

第 12 页还有一个需要单独记的限定. 训练内容文档标的是 「Ling-2.5 model family」, 页面自己提醒, 不能凭家族名就当作文档明确列出了 Ling-2.5-1T, 覆盖范围以文档点名的模型和版本为准. 这句话反过来也说明, 页面作者并不保证 「Ling-2.5 家族」 和 「Ling-2.5-1T」 在所有文件里是同一个范围. 本页没有摘录那份文档, 所以它讲了什么, 这里无从得知.

## 3. 页面自己印了哪些数

先把页面上直接印出的数列全. 规模: 总参数 1T, 激活参数 63B, 改造前激活参数 51B. 数据: 上一代预训练语料 20T token, 这一代 29T token, 架构升级后继续预训练 9T token. 上下文: 训练窗口 256K, 用 YaRN 外推到 1M, 下载表写作 「256K->1M(YaRN)」. 结构: MLA 与 Lightning Linear 的比例 1:7. 对照: Kimi K2 架构激活参数 32B. 测试条件: 单机 8 张 H20-3e 或 8 张 H200, batch size 64. 部署示例: 四个节点, 每节点 tp-size 8. 张量类型: BF16 和 F32.

几组数之间能互相对上. 29 减 20 等于 9, 正好是第 6 页继续预训练的量, 再加上第 4 页说是 「incremental training」, 可以读成 Ling 2.5 在上一代 20T 的基础上又训了 9T, 没有从头来. 不过页面没有一句话写 「29T 等于 20T 加 9T」, 这是按数字推的. 63B 在第 2 页和第 5 页各出现一次, 一致. 256K 和 1M 在第 2 页, 第 4 页下载表, 第 7 页正文三处出现, 也一致.

页面没有印的数同样要列出来, 因为这些空位最容易被别处的材料填上. 层数, 隐藏维, 注意力头数, 词表大小都没有. 全文也没有 expert, routing 之类的词, 1T 和 63B 之间差了一个数量级以上, 但页面没说是什么结构让每次只激活一小部分参数. 51B 到 63B 多出的 12B 来自哪里, 页面只说是 「After modification」, 没有拆分. 这些位置在本文里一律空着, 不拿 Ling 2.0 技术报告的配置来补. Ling 2.0 那份报告讲的是上一代的模型, 就算 Ling 2.5 是在它上面增量训练的, 注意力层已经换过, 激活参数也变了, 旧配置不能原样搬过来.

总参数和激活参数在这页各自出现, 要分开读. 1T 是总量, 页面只在模型名和 「trillion-scale」 里用它, 没有更精确的值; 63B 是每次前向实际参与计算的量, 页面拿它和 Kimi K2 的 32B 比. 第 5 页的吞吐论证只比激活参数, 没有给 Kimi K2 的总参数, 所以 「激活更多, 吞吐仍更高」 这句话的比较基础只有激活量这一项.

## 4. 注意力层怎么改的

第 4 页那一段是全文唯一讲结构的地方. 起点是 Ling 2.0 的 GQA, 终点是 MLA 加 Lightning Linear 的 1:7 结构. 做法分两步: 先按 Ringflash-linear-2.0 的路线, 把 「a subset of GQA layers」 改成 Lightning Linear Attention, 目的是提升长程推理场景的吞吐; 再把 「the remaining GQA layers」 近似转换成 MLA, 目的是进一步压缩 KV Cache, 同时针对 QK Norm 和 Partial RoPE 做适配. 按词序, 1:7 里 MLA 占 1 份, 线性层占 7 份. 这和 「一部分改线性, 剩下的改 MLA」 不冲突, 只是 「subset」 在这里其实是多数.

三个缩写的展开和常见写法不同. 页面写 MLA 是 Multi-head Linear Attention, QK Norm 是 Query-Kernel Normalization, RoPE 是 Rotational Positional Encoding. 常见文献里它们分别是 Multi-head Latent Attention, Query-Key Normalization, Rotary Position Embedding. 页面给 MLA 的任务是 「further compress the KV Cache」, 这和 latent 的读法相符. 如果 MLA 真是一种线性注意力, 它和 Lightning Linear 就成了同一类, 1:7 的划分也讲不通. 页面没有公式, 只能把这当作一个悬着的问题, 翻译时照原文保留.

结构段缺的东西比写出来的多. 没有总层数, 所以不知道两种层各几层; 没有排布方式, 不知道是每 8 层一个周期, 还是别的方式; 没说 「approximately convert」 怎么近似, 也没说适配 QK Norm 和 Partial RoPE 具体改了什么. 增量训练用了多少 token 才把 GQA 换过来, 页面也没单列, 可能包含在 9T 里, 也可能不在. 第 5 页有一张题为 「Architecture of Ling-2.5 1T」 的结构图, 这些问题也许在图里有答案, 但本目录没有图文件, 读不到.

这一段也没有交代 Lightning Linear Attention 本身是什么. 页面只给了名字, 以及它来自 Ringflash-linear-2.0 的路线. 它的计算方式, 状态大小, 和 GQA 相比省在哪里, 都要去看 Ringflash-linear-2.0 的材料, 这页没有转述. 所以 「线性注意力让长生成吞吐更高」 在本页是一个前提, 不是一个被论证过的结论.

## 5. 吞吐图和长上下文图

第 6 页两张图比的是 decode 吞吐, 条件是单机 8 卡, batch size 64, 横轴是不同的生成长度. 两张图的区别只在硬件, 一张 H20-3e, 一张 H200. 第 5 页正文给出的结论有三层: 相比 Ling 2.0 效率明显提升; 相比 32B 激活的 Kimi K2 架构, 长程任务吞吐仍有明显优势; 生成越长, 优势越明显. 图注没写参与比较的是哪几个模型, 按正文推测是这两家, 但图注本身没有确认.

长上下文部分有三张图的图注. 第 7 页是 1M 窗口内的 NIAH; 第 8 页是 RULER 和 MRCR 在 16K 到 1M 各档窗口上的表现; 第 9 页是 RULER 和 MRCR 在 16K 到 256K 窗口上的平均对比, 页面上另有 Ruler, LongBenchv2, MRCR 三个小标题. 评测表 MRCR 一行自带 「(16K-256K)」, 和第 9 页的平均口径一致, 所以表里 66.80 这个数不包括 256K 以上的窗口. 256K 以上完全靠 YaRN 外推, 这一段的表现只在第 8 页的图里.

还有一处配置上的差异页面没解释. 吞吐测试是单机 8 卡跑 1T 总参数的模型, 部署示例却是四个节点, 每个节点 tp-size 8. 部署示例的说明文字写的是 「run Ling-1T」, 这组命令是不是专门为 Ling-2.5-1T 写的, 页面没交代, 两种配置为什么不同也没说. 所有图文件都不在目录里, 本文对这些图只能复述图注, 读不出任何曲线上的数.

## 6. 评测表逐组看

评测表有 6 个能力组, 21 行, 5 个模型. Knowledge 5 行, Reasoning 6 行, Agentic 3 行, Instruction Following 3 行, LongText 2 行, Alignment 2 行. 每行给出评测配置, 比如 Acc, Mean@4, Mean@64-COT, Acc@Turn_3. AIME26 后面标着 「(32K)」, 页面没解释这个 32K 指什么. SimpleQA_Verified 一行前代写成 19.3, 只有一位小数, 其余格子都是两位.

按每行五个模型排名, Ling-2.5-1T 第一 8 行, 第二 8 行, 第三 3 行, 第四 2 行, 没有垫底的行. 第一的 8 行是 C-SimpleQA, SimpleQA_Verified, AIME26, HMMT-Nov25, IMO-AnswerBench, ARCPrize, bbeh, BFCL-v4. 其他模型拿到的第一: Kimi-K2.5-Instant 8 行 (GPQA Diamond, SuperGPQA, Humanities_Last_Exam, livecodebench, terminal-bench 2.0, Multi-IF, LongBenchV2, Arena-Hard-V2), GPT-5.2-chat 3 行 (LIFEBench, IFBench, MRCR), DeepSeek-V3.2-nothink 1 行 (tau2-bench), Ling-2.0-1T 1 行 (MultiChallenge). 加起来正好 21.

两两对比更能看出位置. Ling-2.5-1T 对 DeepSeek-V3.2-nothink 是 17 胜 4 负, 输在 GPQA Diamond, SuperGPQA, tau2-bench, IFBench. 对 GPT-5.2-chat 是 16 胜 5 负, 输在 GPQA Diamond, SuperGPQA, LIFEBench, IFBench, MRCR. 对 Kimi-K2.5-Instant 是 11 胜 10 负, 几乎打平: Ling-2.5-1T 赢在两个 SimpleQA, 五个数学和推理题, BFCL-v4, LIFEBench, IFBench, MRCR; Kimi 赢在 GPQA Diamond, SuperGPQA, Humanities_Last_Exam, livecodebench, tau2-bench, terminal-bench 2.0, Multi-IF, LongBenchV2, Arena-Hard-V2, MultiChallenge.

分组看, Reasoning 是 Ling-2.5-1T 最强的一组, 六行里五行第一. AIME26 的 87.08 比表里第二高的 Ling-2.0-1T 高 11.92 分, 比三个外部模型中最高的 Kimi 66.98 高二十分出头; ARCPrize 的 47.25 是 DeepSeek 20.06 的两倍多. Knowledge 组两极分化: 两个 SimpleQA 第一, SimpleQA_Verified 的 37.40 比第二名 GPT 的 29.90 高 7.5 分, 但 GPQA Diamond 和 SuperGPQA 都排第四, 只在前代前面. Agentic 组 BFCL-v4 第一, tau2-bench 第三, terminal-bench 2.0 第二, 其中 terminal-bench 的 31.46 离 Kimi 的 48.30 差了近 17 分.

对前代的比较是全表最整齐的部分. 21 行里 20 行上涨, 唯一下降的是 MultiChallenge, 从 54.95 降到 52.01. 涨幅最大的三行都在 Agentic 组: tau2-bench 加 25.20, BFCL-v4 加 23.88, terminal-bench 2.0 加 22.47. 其次是 SimpleQA_Verified 加 18.10, LIFEBench 加 15.60, MRCR 加 14.45, C-SimpleQA 加 14.37, HMMT-Nov25 加 13.75. 涨幅最小的是 GPQA Diamond 加 2.09, Arena-Hard-V2 加 3.07, SuperGPQA 加 3.12. 这和页面强调 Agentic RL 的叙述方向一致, agent 类基准是涨得最多的.

把正文的结论放回表里, 有两句不完全成立. 第 3 页说和主流模型相比, 在 「complex reasoning and instruction-following」 上有明显优势. 推理这一半成立; 指令遵循三行没有一行第一, IFBench 还排第三, 比 GPT-5.2-chat 低了 24.8 分. 同一页说对前代是 「holistic upgrade」, MultiChallenge 是例外. 第 7 页说长上下文优于 Kimi K2.5 和 DeepSeek V3.2, MRCR 成立, LongBenchV2 不成立, 那一行 Kimi 高出 5.96 分.

## 7. 奖励, 对齐和 agent 训练的说法

第 2 到 3 页讲后训练, 全是定性描述. 复合奖励由 「Correctness」 和 「Process Redundancy」 两部分组成, 目标是在 instant 模型里兼顾效率和性能. 对齐策略举了两个例子: 双向 RL 反馈, 基于 Agent 的指令约束校验. agent 能力来自在大规模, 高保真交互环境里做的 Agentic RL, 并声称兼容 Claude Code, OpenCode, OpenClaw. 这些名词页面都没展开: 奖励怎么加权, 冗余怎么度量, 「双向」 指哪两个方向, 校验用的 Agent 是哪个模型, 交互环境有多少个, 页面一个都没回答.

「约 4 倍输出 token」 这句也没有出处. 页面说 Ling-2.5-1T 的推理能力接近前沿 thinking models, 而后者通常要消耗约 4 倍的输出 token. 页面没有点名这些 thinking models, 没有给 Ling-2.5-1T 的平均输出长度, 评测表也没有输出长度这一列. 所以 「token 效率」 这个卖点在本页只有文字, 没有可核对的数字. 读者能确认的只是: 评测表里 Ling-2.5-1T 的推理分数在 instant 模型这一档里最高.

第 11 页的局限段和表里的弱项是对得上的. 页面承认在复杂 agent 交互和长程任务上仍落后于前沿模型, 表里 terminal-bench 2.0 落后 Kimi 近 17 分, tau2-bench 排第三, 都在这个范围里. 下一版的方向是长程执行, 任务完成和 token 效率. 这段是全页少有的主动承认短板的地方, 可以和第 7 页 「和闭源 API 仍有差距」 那句放在一起看.

## 8. 部署和页面外壳

部署段的信息比看上去少. 环境准备要克隆 antgroup/sglang 的 ling_2_5 分支, 以可编辑模式安装, 页面说之后才会提交到 SGLang 官方版本. 推理段说 SGLang 同时支持 BF16 和 FP8, 取决于模型文件的数据类型, 但下载表只列了一个模型, 第 1 页的张量类型也只有 BF16 和 F32, 这里没有发布 FP8 权重. 示例说明写的是 「run Ling-1T」, 模型名是前代的. 四个节点的启动命令每行都在 「--tp-size 8 --」 后被页面边界截断, client 的 curl 命令在 「What」 后被截断. API Usage 和 Quickstart 都写着 Coming Soon, 其中一处拼成 「Comming」. Ling studio 和 ZenMux 的体验页, API 也写着近期上线.

第 1 页的外壳里有几条可以当作事实记下. 任务标签含 bailing_hybrid 和 custom_code, 前者是页面上唯一出现的代码层架构名, 后者说明加载时要用仓库自带的代码; 页面没有解释 bailing_hybrid 具体对应哪些模块. 许可证在第 1 页写作 mit, 第 11 页链到 inclusionAI/Ling-V2.5 仓库的 MIT License. 页面显示没有推理服务商部署这个模型, 有 3 个 Spaces 在用它. 这些都是抓取时的状态, 页面上的 「24 days ago」 也说明它会随时间变化.

## 9. 十张图的清单

源文里的 10 张图: p01-bf16-f32.png (Image block, 在 Tensor type 下面), p02-ling-2-5-1t-inclusive-intelligence-instant-impact.png (Chart block, 正文开头), p05-after-modification-the-trillion-scale-version-of-ling-2.png (Image block, 图题是 Architecture of Ling-2.5 1T), 第 6 页两张吞吐图 (H20-3e 和 H200), 第 7 页 NIAH 图, 第 8 页 16K 到 1M 的 RULER/MRCR 图, 第 9 页 p09-ruler.png, p09-quickstart.png, p09-txt.png. 本目录只有 ling-2-5.md, 没有 images 文件夹, 10 张图一张都打不开. 双语稿保留了全部 10 个图片引用, 集合和源文相同.

哪些是界面元素, 只能从位置和命名推断. p01 最像界面: 它在侧栏的张量类型区, 标签是 Image block, 旁边就是 「BF16 · F32」. p02 在正文最前面, 文件名取自发布标语, 更像头图. p09-quickstart 和 p09-txt 名字像按钮和代码框, 但抽取工具是按图后紧跟的文字命名的: p09-quickstart 后面恰好是 Quickstart 标题, p09-txt 后面恰好是下一页的 txt 代码块. 第 9 页有 Ruler, LongBenchv2, MRCR 三个小标题和一个长上下文对比的图注, 这三张 p09 图更像同一组对比图的三个分图. 这些判断都没法对着图确认.

## 10. 读完仍然空着的地方

结构上空着的: 总层数, 隐藏维, 头数, 词表; 1T 和 63B 之间靠什么结构拉开; 51B 到 63B 多出的 12B 在哪; 1:7 的排布; MLA 等三个缩写到底按哪种意思理解; Lightning Linear Attention 的具体形式. 这些在本页都没有答案, 结构图又读不到. 训练上空着的: 9T 的成分, 256K 窗口训练了多少 token, 复合奖励的公式, Agentic RL 的环境规模, 输出长度的实际数字.

评测上能确认的, 是一张 21 行的表和几句与表部分不符的结论. 表本身说明: 在 instant 这一档里, Ling-2.5-1T 数学和推理最强, 事实类问答领先, 工具调用 BFCL-v4 领先; GPQA 类知识题, 终端 agent 任务, 严格的指令遵循落后于 Kimi-K2.5-Instant 或 GPT-5.2-chat; 对前代除 MultiChallenge 外全部上涨, agent 类涨幅最大. 至于吞吐优势有多大, 1M 窗口里表现如何, 都在打不开的图里, 本页的文字只给了方向, 没给数字.
