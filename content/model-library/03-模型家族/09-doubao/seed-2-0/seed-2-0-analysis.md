# Seed2.0: 不再公开配方的一代, 谱系只能从评测和工具里读

来源: Seed2.0 Model Card (字节跳动 Seed, 2026 年 2 月, 共 78 页). 逐段对照译稿见同目录 `seed-2-0-bi.md`, 数字以源文 `seed-2-0.md` 为准. 表号, 图号都指原文编号; 由表上数字推出的量标 「估算」.

## 1. 家族走到这一步: 从技术报告变成模型卡

Seed2.0 的引言先把家族点了一遍: 通用模型 Seed1.6/1.8, 多模态 Seed1.5-VL, 开源的 Seed-OSS, 代码专用的 Seed-Coder, 扩散语言模型 Seed Diffusion, 形式化证明的 Seed-Prover, 以及生成式媒体系统, 这些模型支撑着日活数亿的产品. Seed2.0 分 Pro, Lite, Mini 三档, 目标写得很直接: 在大规模在线部署中给出最好的用户体验, 同时往 「真实世界复杂性」 推进, 即科研, 复杂软件开发, 自主读文档学习和多步真实工作流.

与 1.5 代相比, 文档的形态变了. Seed1.5-Thinking 和 Seed1.5-VL 是技术报告, 数据怎么洗, 奖励怎么设计, 学习率多少都写了; Seed2.0 是模型卡, 78 页里前 19 页是部署数据, 评测框架和 14 张结果表, 第 19 到 47 页是用例, 其余是参考文献和附录. 三档模型的参数量, 激活量, 架构, 预训练数据规模, 训练算力, 后训练配方都没有, 各表跑的是思考模式还是默认模式也没说. 所以这一篇的谱系只能从三处读: 与 1.5 代同名或同类基准的数字变化, 表中 Seed1.8 那一列, 以及推理时用到的工具和流水线. 引言自己承认两处差距: 编码与 Claude 差距明显 (以 SWE-Evo, NL2Repo 为例), 长尾知识与 Gemini 差距明显 (以 SuperGPQA, SimpleQA-Verified 为例). 后面的表格基本印证了这两句.

## 2. 部署与评测协议

### 2.1. 部署数据取代了训练数据的位置

1.5 代报告里 「数据」 一节讲的是训练数据, Seed2.0 卡里对应位置放的是部署数据. 第 2 节来自豆包协作激励计划, 是授权客户的真实使用分布: 行业上互联网占绝对主导; 场景上非结构化信息处理占比最大, 教育, 内容创作, 搜索推荐是第二梯队; agentic coding 的轨迹里前端开发占主导, Vue.js 的使用量是 React 的三倍以上, 任务以修 bug 为主, 其次是重构和文档. 这些统计全部来自中国大陆客户, 文字没给样本量. 它们解释了评测框架为什么设 Vibe Coding, Context Learning 这些维度, 以及为什么内部集里有大量 ToB 任务, 但不能外推到全球开发者.

价格是这一代的另一个设计目标. Table 1 的每百万 token prefill/decode 单价: Pro $0.47 / $2.37, Lite $0.09 / $0.53, Mini $0.03 / $0.31; Claude-Opus-4.5-thinking 是 $5.00 / $25.00, GPT-5.2 High 是 $1.75 / $14.00. 按 decode 价, Pro 比 Opus 便宜约 10.5 倍, 比 GPT-5.2 High 约 5.9 倍; 按 prefill 价, 比 GPT-5.2 High 只便宜约 3.7 倍. 原文说 「大约低一个数量级」, **只在对最贵的对手时成立**. Seed2.0 用区间计价, 表里只报了一个代表价. 单任务成本还要乘 token 数: Table 15 的 WorldTravel 一格里, Seed2.0 Pro 平均 1486 个 completion token, GPT-5.2 High 9190, reasoning token 1286 对 5597; 同一格的平均分却是 0.233 对 0.327. **用得少和做得好在这里此消彼长**. 这条 「少思考, 低价格」 的取向, 与 Doubao-1.5-pro 产品页的训练-推理一体是同一种思路, 只是这一代没有交代它在模型设计上怎样实现.

部署数据里有两处作者自己的解读值得留意. 制造, 汽车, 通信这些传统行业各自不到总用量的 1%, 作者说 「可能是上一代 Seed 模型能力不足所致」, 这是卡里少见的对前代的直接评价. 前端请求占主导, 作者给的解释是前端工作的视觉反馈循环让开发者更频繁地和模型交互, 前端任务也更容易交给 AI; 由此推出的研发优先级是 JavaScript/TypeScript 理解, CSS 布局推理和框架知识, 以及读报错, 读栈, 推断程序状态的调试能力. 这是整张卡里离 「训练数据怎样选」 最近的一段: **部署分布决定能力优先级**, 能力优先级大概率又决定了后训练数据的构成, 但后一步卡里没写.

### 2.2. 评测协议: 自建的尺子怎样造

第 3 节是这张卡里写得最细的部分, 也是理解后面各表的前提. 语言侧除了常见基准, 专门为 「长尾专业知识」 造了两套集. 作者认为 SimpleQA, HLE 偏重冷僻知识, 在真实工作里用处有限, 于是仿照 SuperGPQA 的思路: **LPFQA** 从专业论坛和专家社区收集长尾问题, 覆盖编程, 金融, 工程, 医学和应用科学; **Encyclo-K** 从书里抽出原子化的知识陈述, 再动态组合成题, 支持零样本和少样本上下文学习两种测法, 作者明说这样可以 「探查预训练和后训练阶段的知识获取」. 这是全卡唯一提到预训练阶段评测的地方, 用意与 Seed1.5-VL 在预训练里混入少量指令数据, 让预训练评测更可靠是一样的. **HLE-Verified** 则是请领域专家从 HLE 里挑出题面清楚, 答案可确证的子集. Codeforces 的 rating 按 2025 年 6 月到 12 月的题目计算, Graphwalks 用了自研 tokenization, 与官方计数不一致.

视觉侧共 50 个图像基准和 24 个视频基准, 很多项的计分方式与官方不同. DynaMath 报最差情况准确率, 一道题的 10 个变体全对才得分, 这解释了为什么各家在这一行都只有六七十分; MathKangaroo 取 2025 年各期比赛的平均; MMMU-Pro 合并 10 选项的标准集和纯视觉子集; HiPhO 是 13 场物理奥赛的归一化平均; ArcAGI 同时给文本矩阵和渲染图, 作者注意到加上图像后 Seed2.0 的表现明显提升; MTVQA 用 DeepSeek-V3-0324 当裁判, VibeEval 把 1 到 5 分换算到 0 到 100; MMSIBench 用循环评测消除选项位置偏差. 视频侧, 运动与感知类统一用 2 FPS, 强调物理动态的 Morse-500 用 5 FPS, 对比模型用同样设置. 这些约定大多比官方口径更严或更细, 横向比较时要确认对手是不是在同一口径下重跑.

agent 侧的工程改动更多. 作者重构了测试脚本, 去掉任务级入口配置, 把运行环境合并成预构建镜像, 修复参考环境里已经失效或出错的部分, 把外部包仓库换成内部镜像; 然后按质量过滤掉几类用例: 多容器 Docker Compose 场景, 参考解法自己都通不过验证的用例, 多次运行结果不一致的用例, 异常占用磁盘的任务, 依赖网络且结果不稳定的题, 以及下载量大或验证复杂影响复现的场景. Terminal-Bench 2.0 因网络限制和安全考虑去掉了 extract-moves-from-video, mailman, install-windows-3.11 三题. 除非特别说明, 评测都不接外部工具. 这些改动让 Seed 的数更稳, 也意味着 Seed 列跑的是清洗过的题集, 对手取官方数时题集不同, 表里没有区分. 运行环境的一般讨论见 [运行时环境与沙箱](../../../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.4-运行时环境与沙箱.md).

高阶任务的四个维度各有自建集. Science Discovery 用 AInstein Bench 考科学编程, 看模型能否实现和操作科研流程里的计算程序, 用 BABE 考生物领域图文交织的科研推理; Vibe Coding 用 NL2Repo-Bench, 要求从自然语言规格一次性端到端生成整个仓库, 考跨文件一致性和依赖管理; Context Learning 除 CL-Bench, KOR-Bench 外加入 DeR², 考从嘈杂的长技术文档里提取信息再推理, 另有客服问答和复杂工作流两个内部场景, 前者专门处理召回信息噪声很大的情况; Real-World Tasks 里 GDPVal-Verified 是 GDPVal 中可用 rubric 自动评分的可靠子集, WorldTravel 考目标分解和可执行的多步规划. 每个维度都说 「锚定实践中观察到的具体失败模式」, 这与 Seed2.1 后来用用户坏例扩充基准是同一条路.

## 3. 语言与尺寸

### 3.1. 与 1.5 代能对上的几条数

卡里没有 1.5 代的列, 但有几项基准与 1.5 代报告同名, 可以拼出一条粗略的走向. 数学上, Seed1.5-Thinking 在团队自建的 BeyondAIME 上是 48.0%, Seed2.0 Pro 在 Table 3 里是 86.5, 为全表最高. 视频上, Seed1.5-VL 的 VideoMME (无字幕) 是 77.9, 当时与 Gemini 2.5 Pro 的 87.0 差距最大, Seed2.0 Pro 是 89.5; MMVU 从 Seed1.5-VL 的 70.1 到 Seed1.8 的 73.1 再到 Seed2.0 Pro 的 78.2; VideoMMMU 从 Seed1.5-VL thinking 的 81.4 到 Seed1.8 的 82.7 再到 86.9. 感知上, DA-2K 从 Seed1.5-VL 的 91.7 (thinking) 到 92.3, CountBench 从 93.7 到 95.5, 这类任务在 1.5 代已经接近饱和.

这种跨文档对照有几层保留. 评测设置不一定相同, 视频题的帧率, 解码方式, 思考模式都可能变了; 有的基准名字相近, 版本不同, 比如 Seed1.5-Thinking 报的是 SimpleQA (12.9%), Seed2.0 报的是 SimpleQA Verified (36.0), 不能直接相减. Codeforces 在 Seed1.5-Thinking 里是内部题集的 pass@8 百分比, 在 Seed2.0 里是 rating (3020), 指标都换了. 能确定的是方向: **1.5 代最弱的长视频和高难数学, 在 2.0 代成了强项; 1.5 代就承认的事实性短板, 在 2.0 代仍是短板**.

### 3.2. 语言能力: 推理强, 事实弱

Table 3 里 Seed2.0 Pro 的强项在数学和推理. IMOAnswerBench 89.3, BeyondAIME 86.5, MathArenaApex (shortlist) 82.1, ProcBench 96.6 都是全表最高; ARC-AGI-2 37.5 排第二, GPT-5.2 High 的 57.5 遥遥领先; Codeforces 3020 次于 GPT-5.2 High 的 3148. AIME 和 HMMT 各家挤在 93 到 100 之间, 每届只有 30 题, 一题约 3.33 分, 这些行上一两分的差距读不出排名.

短板集中在事实性和长上下文. SimpleQA Verified 上 Seed2.0 Pro 36.0, Gemini-3-Pro High 72.1; FactScore 71.2, 四个对手都在 90 以上; LongFact 两行 92.9 和 92.8, 对手都在 98 以上. 第 4.1 节说幻觉稳健性 「保持有竞争力」, 与这三行对不上. MRCR v2 (8-needle) 上 54.0 对 GPT-5.2 High 的 89.4, 原文说 「对真实用户体验影响有限」, 后半句没有证据. 文字与表格还有两处矛盾: 正文说 Seed2.0 Pro 「在 HealthBench 上领先」, 表上 GPT-5.2 High 是 63.3, Seed2.0 Pro 是 57.7, Hard 子集 42.0 对 29.1; 正文说 Frames 「排第一」, 表上 Claude-Opus-4.5 84.7 高于 Seed2.0 Pro 的 84.5. **冲突时以表为准**.

### 3.3. 三档尺寸: 部署前的 Scaling 只露出结果

三档同框的表只有 Table 8 和 Table 9. Table 3, 11, 13 的大模型组只放 Pro; Table 4 放 Lite 和 Mini, 对手换成 GPT-5-mini High 和 Gemini-3-Flash High; Table 12, 14 只放 Lite. 所以 「Lite 在多数场景接近 Pro」 这类说法只能在两张表里直接验证. 同一张表里尺寸与分数也不单调: Table 8 中 Lite 高于 Pro 的有 DynaMath 70.5 对 68.9, ViVerBench 80.0 对 75.9, CountBench 97.1 对 95.5; Mini 高于 Lite 的有 SimpleVQA 68.7 对 67.2, PhyX 65.0 对 62.8; Table 9 的 EgoTempo 上 Mini 67.2 高于 Lite 61.8. 可能是单项基准的噪声, 也可能三档的后训练配方本就不同, 卡里没有能区分两者的信息.

语言类基准上尺寸差距清楚得多. Table 4 里 Mini 对 Lite: MMLU-Pro 83.6 对 87.7, HLE 13.3 对 28.2, SuperGPQA 61.6 对 67.5, FactScore 50.4 对 62.4. **知识密集和长尾事实类任务随尺寸下降最快**, 视觉感知类任务尺寸差距小. 这与 「知识装在参数里」 的常识一致, 也和上一节 Pro 的事实性短板连在一起: 如果事实性主要由参数规模决定, 这一代三档都没有公开规模, 事实性差距从哪里来就无从判断. Seed1.5-Thinking 当时把 SimpleQA 的低分归给 「与预训练模型规模强相关」, Seed2.0 没有再做解释.

Table 4 里自建的长尾集和公开事实集给出了相反的图景, 正好检验第 3 节那套论证. SimpleQA Verified 上 Mini 18.9, Lite 24.0, Gemini-3-Flash High 65.4, 差距比 Pro 对 Gemini-3-Pro 还大; 自建的 Encyclo-K 上 Lite 64.5 反而高于 Gemini-3-Flash 的 60.0, LPFQA 上 Lite 50.9 与 Flash 的 51.6 基本持平. 作者的说法是 SimpleQA 偏重冷僻知识, 专业长尾知识才是工作中需要的; 另一种解释是自建集的出题来源更贴近 Seed 的训练分布. 两种解释都能说通, 卡里没有给出能区分它们的实验. 三档的定位写在第 2.3 节: Pro 面向能力优先的复杂推理和长上下文, Lite 是通用场景的折中, Mini 的 decode 价低于每百万 token 0.5 美元, 面向高吞吐, 对延迟敏感, 单次成本必须压到很低的场景.

### 3.4. 指令遵循: 只和 Seed1.8 比

Table 3 的指令遵循组里, MultiChallenge 68.3 与 Gemini-3-Pro High 的 68.7 基本持平, 明显高于 GPT-5.2 High 的 59.5; Inverse IFEval 78.9 仅次于 Gemini 的 79.6. 随后原文用面向中文生产场景的内部集细分, 共 912 个样例, 17 个加权维度, Table 6 列出其中 9 个测试集: 格式, 条件规则, 指定内容, 指定措辞, 语气, emoji, few-shot, 以及中英文长度约束.

Table 7 只拿 Seed2.0 Pro 与 Seed1.8 比. Overall 从 72.89 升到 75.26, 涨 2.37; 涨幅最大的是 Tone +15.16, Phrasing +10.31, Few-shot +9.53. 把表上 9 列简单平均, Seed1.8 约 71.22, Seed2.0 Pro 约 76.67, 差 5.45, 比 Overall 的涨幅大一倍多, 说明表上没露出的 8 个维度整体涨得少, 甚至可能退步. 表上能看到的退步是 Content, 从 90.48 降到 87.76; Format 只从 45.33 到 46.00, 是全表最低的一列. **风格可控性涨得多, 硬约束几乎没动**, 而第 2 节部署数据里企业最需要的恰恰是结构化输出. 结构化输出的一般讨论见 [结构化输出](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.5-结构化输出.md).

## 4. 视觉与 Agent

### 4.1. 视觉和视频: VideoCut 接过了 Seed1.5-VL 的 token 预算

Seed1.5-VL 处理长视频的办法是固定预算: 每个视频最多 81,920 token, 每帧从六档分辨率里选, 超预算就均匀抽帧; 它的结论一节把 「代码和外部工具接进 VLM」 列为下一步. Seed2.0 的 **VideoCut** 正是这个方向: 模型在推理时调用工具回放指定片段, 看不清的地方回头再看, 而不是一次把整段视频压进上下文. 第 4.3 节说整个家族 「默认具备 VideoCut」, 但 Table 10 的 「Seed2.0」 一列 (CGBench 65.0, LVBench 76.4) 与 Table 9 中 Pro 的数字完全一致, 「w/ VideoCut」 另给 66.8 和 80.0, 可见 Table 9 的长视频分数是关着工具跑的. 视频理解的一般做法见 [视频理解模型](../../../../llm-guide/8-多模态/8.4-视频理解模型/8.4-视频理解模型.md).

Table 10 还给了 Seed1.8 开关工具的两列, 这让 「换代」 和 「加工具」 可以放在一起比. LVBench 上 Seed1.8 从 73.0 加工具到 78.9, 高于不带工具的 Seed2.0 (76.4); ZeroVideo 上 Seed1.8 从 6.9 到 18.8, 也高于不带工具的 Seed2.0 (14.5), Seed2.0 Pro 加工具到 27.9. 在要从长视频里找极少量关键帧的任务上, 推理时回放的收益大于一次换代. 反过来, CGBench 上换代 (62.4 到 65.0) 和加工具 (62.4 到 65.9) 差不多. 用尺寸来比也有同样的形状: LVBench 上 Mini 66.6 到 Pro 76.4 是 +9.8, Pro 再加工具是 +3.6. **任务瓶颈在 「看到」 时, TestingTime 的工具划算; 瓶颈在 「理解」 时, 部署前的 Scaling 更划算**.

运动理解一侧有另一种推理时的做法. TOMATO 上作者试了 **Thinking with Tracking**: 提示模型在推理中逐帧输出运动目标的框, 再按轨迹判断运动类型, 对 Gemini 和 Seed 都有效. 这是把 Seed1.5-VL 训练过的 grounding 能力拿来当推理的中间步骤, 也接近 Seed1.5-VL 局限一节提到的视觉 CoT. 感知类的其他亮点, 如 DA-2K 92.3, RefSpatialBench 72.6, BLINK 79.5, FSC-147 平均绝对误差 11.3, 都在 1.5 代已有的强项上继续推进. 视频表里带星号的对手数取自技术报告, 不在 Seed 统一的 2 FPS 或 5 FPS 设置内, 同条件比较要看没有星号的行, 例如 Morse-500 的 37.4 对 33.0.

与直接前代 Seed1.8 相比, 推理类视觉任务涨得最多. 正文点名的是 HiPhO 涨 15.8, MMMU-Pro 涨 5.0; 视觉谜题上 LogicVista 81.4, ZeroBench 主题 12.0, 子题 47.6, VisuLogic 47.4, ArcAGI 图像版 ArcAGI1 88.8, ArcAGI2 43.3, 后者仍在 GPT-5.2 之后. 感知与偏差类的 VLMsAreBlind 已到 98.6, 接近满分, BabyVision 60.6. 视频表 9 带了一列人类成绩, 能看到两种不同的位置: VideoReasonBench 上 Seed2.0 Pro 77.8 高于人类的 73.8, 正文说视觉状态跟踪尤其强; Morse-500 上 37.4 虽是最高, 离人类的 55.4 仍远. 多视频理解的 CrossVid 60.3, 流式一组覆盖在线推理, 体育直播和自动驾驶场景. 1.5 代的强项 (grounding, 计数, 深度) 已近饱和, 这一代的增量主要落在需要多步推理的视觉任务上, 这与语言侧数学推理的大涨方向一致.

### 4.2. Agent: 搜索强, 长时程编码弱

Table 11 分 Coding Agent, Search Agent, Tool Use, Deep Research, Vision Agent 五组. 搜索和深度研究是 Seed2.0 Pro 最强的部分: BrowseComp-zh 82.4, HLE-Verified 73.6, DeepSearchQA 77.4, DeepResearchBench 53.3 都是全表最高. 这里的口径要看清: 对竞品取官方报告与 Seed 实测中的较高者, Seed 自己用单一实测, **这条规则系统性抬高对手**. 括号里的数字是对齐设置下的分数, BrowseComp 一行 GPT-5.2 High 写作 77.9 (65.3), Seed2.0 Pro 77.3 按括号外排第二, 按对齐口径领先十二分; DeepSearchQA 上 Claude-Opus-4.5 的两个数 76.1 (41.6) 相差 34.5, agent 框架本身就是变量. Agent 评测的一般问题见 [Benchmark 与 Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md).

编码 agent 是另一幅景象. SWE-Evo 上 Seed2.0 Pro 8.5, Claude-Opus-4.5 27.1; SWE-Bench Pro 46.9 对 GPT-5.2 High 55.6; Terminal Bench 2.0 55.8 对 62.4, 而且这一项去掉了 3 道题并做了质量过滤. 能拿第一的只有 SpreadsheetBench Verified 79.1. 工具调用组里 τ²-Bench retail 90.4 全表最高, telecom 却是 94.2, 五家最低, telecom 场景要引导用户自己排查设备, 对话轮数多, 状态复杂. **短时程的调用做得好, 持续改动一个有状态系统做得差**, 这是 agent 部分最清楚的分界. Table 12 里 Lite 对 Gemini-3-Flash High 也是同样的形状: Terminal Bench 45.0 对 60.0, SWE Bench Verified 73.5 对 78.0, Multi-SWE-Bench 41.1 对 59.0, 编码差距并不随尺寸缩小而消失.

Vision Agent 一组是 Seed1.5-VL 那条 GUI 与游戏 agent 线的延续. Seed1.5-VL 当时用 UI-TARS 的数据训 GUI, 在 14 个网页小游戏上看交互轮数增加时的分数; Seed2.0 的 Minedojo-Verified 49.0, MM-BrowseComp 48.8 大幅领先, 但两个 Claude 在这一组都是 「-」, 实际只有三家在比. 这组分数说明视觉 agent 在 2.0 代已是强项, 下一代 Seed2.1 把它扩成了统一的通用 CUA. 编码 agent 的一般讨论见 [IDE 与 Coding Agent](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md).

### 4.3. 高阶任务表: 同名基准, 不同数字

Table 13 按 Science Discovery, Vibe Coding, Context Learning, Real World Tasks 组织, 是 「真实世界复杂性」 的落点. Seed2.0 Pro 在 AInstein Bench 47.7, XPert Bench 64.5, ToB-Reference Q&A 72.4 上领先. 但它与 Table 3, 11 里同名基准的 Seed2.0 Pro 分数有六处对不上, 例如 Scicode 48.5 对 52.1, Superchem 51.6 对 53.0; Table 3 的 「BABE」 与 Table 13 的 「BIObench」 对手三列完全相同 (58.1, 44.7, 49.3), 只有 Seed 从 50.0 变成 53.5. 对手不变而 Seed 变, 最可能是两张表的 Seed 列来自不同检查点, 引用时要注明表号.

Vibe Coding 组的两个分母说明了长时程编码的真实难度. NL2Repo-Bench 一行 Seed2.0 Pro 27.9, GPT-5.2 High 49.3, 像按测试用例计的部分通过率; NL2Repo (Pass@1) 一行是 3.0 对 8.0, 是整个仓库一次全部通过的比例, 五家都在 3.0 到 8.0 之间. World Travel 的分数都是 1/150 的整数倍 (32.67 = 49/150), 与 Table 15 的 「Cases per Model: 150」 吻合, 一例约 0.67 分, Seed2.0 Pro 与 GPT-5.2 High 相差约 14 例. ToB 开头的都是内部集, GPT-5.2 High 在 ToB-Complex Workflows 上只有 45.0, 与它在公开集上的位置很不相称, 内部集的题目分布显然偏向 Seed 熟悉的中文企业场景.

## 5. 推理时流程与用例

### 5.1. TestingTime: 验证器从奖励侧走到了推理侧

Seed1.5-Thinking 把 「会思考的验证器」 用在奖励侧: 训练时判断答案对不对. Seed2.0 把验证搬到了推理侧. Table 2 的 IMO 35/42 和 CMO 114/126 来自附录 E.1 的 **solve-verify-refine 流水线**: 生成候选解, 自查漏洞, 改写, 反复迭代. IMO 正好压在金牌线 35 上, P6 得 0 分; CMO 比金牌线 87 高 27 分. 表里没有迭代轮数, 也没有评分人和细则, 衡量的是 「模型加流水线」. 自我修正的一般讨论见 [反思与自我修正](../../../../llm-guide/13-Agent/13.2-Agent认知架构/13.2.3-反思与自我修正.md), 推理时多花算力的讨论见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md).

另两处成绩用的是多次采样. Table 5 的 Putnam-200 是 Pass@8, agent 可多轮调用 Lean, Python 和 Lean 搜索, Lean 编译器本身就是判定器, Seed2.0 Pro 35.5, Lite 30.5, 专门的 Seed-1.5 Prover 与通用的 Gemini-3-Pro 都是 26.5, Gemini 是否在同一框架和预算下运行没说. Figure 7 的 ICPC 同样是 Pass@8, Seed2.0 Pro 73.02%, 原文说 「五场全金」; 人类队伍错误提交要计罚时, 模型的八次提交不计罚时, 这样折算奖牌等于把采样预算换成了排名. Table 15 的 IMO-Bench 一格补上关键信息: Seed2.0 Pro 的 bon 0.87 接近 Gemini-3-Pro 的 0.92, won 0.66 却明显低于 GPT-5.2 High 的 0.81. **上限高, 下限低**, 多次采样加挑选对 Seed2.0 Pro 收益特别大, 这与 Seed1.5-Thinking 的 Codeforces pass@8 高出 avg@8 近二十分是同一种形状.

这三种设置里验证器的可靠程度不同, 决定了 TestingTime 能换来多少. Putnam-200 用 Lean 编译器判定, 没有假阳性, 八次里只要有一次通过就是真的通过, 多采样的收益最干净; ICPC 靠判题系统, 同样可靠, 但比赛时的罚时规则被去掉了; solve-verify-refine 的自查由模型自己完成, 错误可能与生成器相关, 自查通过不等于证明正确, IMO 和 CMO 的分数最终取决于谁按什么细则评分, 卡里没有交代. Seed1.5-Thinking 在训练侧遇到的正是这个问题, 它的对策是专门训练一个会推导的验证器; 到 Seed2.0, 能交给形式化工具的就交给 Lean, 交不出去的仍然依赖模型自查, 卡里没有给出自查环节的准确率.

### 5.2. 用例和自动诊断

用例部分近三十页, 包括仓库构建, 迭代调试, FreeCAD 与 CapCut 操作, 量子计算和广义相对论的科研编码, 以及 Erdős 问题. 每个案例只有一次成功轨迹, 没有失败率. FreeCAD 案例用 96 步完成圆柱加凸台建模, Figure 19 的体积 231061.93 mm³ 和表面积 23306.19 mm² 能手算对上. 仓库构建案例首轮通过率 77% (17/22), 最终 100% (22/22), 但 22 个测试是模型自己写的, 与 NL2Repo 用基准自带测试计分不是一回事. 数学案例的证据等级最高: Erdős 652 和 Erdős 1051 的证明经人类专家核验, 1051 还用 Seed-Prover 1.5 做了形式化, 由 Lean 编译器判定. 这两份证明同样出自迭代修订流水线, 尝试过多少道 Erdős 问题, 卡里没有.

其余案例展示的是 「状态」 和 「抽象」 两类难点. CapCut 案例考时间线对齐和多轨剪辑, FreeCAD 案例考建模上下文和约束逻辑, 第 5.2 节开头点出生产力软件的 GUI 交互依赖状态: 工具链随工作区和模式变化, 参数跨编辑轮次联动, 对话框, 焦点, 双击, 拖拽对齐这类细节会引发连锁失败, 两个案例都记录了模型在界面出错后自我纠正的过程. 科研编码案例的难点在抽象: 量子编译器调试要先理解李群覆盖这层数学结构, 再把它映射到软件架构, 找出理论保证应在代码哪里强制; 广义相对论案例要把黎曼几何和测地线积分翻成插值与求积, 再落进混有 F77/F90 语法和预处理宏的老代码库. 这类任务单靠模式匹配或局部修改做不成, 正对应 AInstein Bench 要测的能力. 这两类难点在 Seed2.1 里分别长成了通用 CUA 和 Deep Think.

第 5.5 节介绍了一条用 LLM 读同行模型评测结果, 生成结构化诊断报告的流水线. Table 15 的三个样例里, XBench 100 例耗时 2435 秒, WorldTravel 150 例 1571 秒, IMO-Bench 400 例 1741 秒, 半小时量级就能出一份多模型对比. 复算也发现问题: WorldTravel 的失败原因占比加起来 116%, 是多标签计数, 分母写的是 「60 head-model comparisons」 而不是 150; IMO-Bench 一格把 bon 与 won 的绝对差 0.211 写成 「21% sampling instability」. 能对上的也有: 「77% fewer reasoning tokens」 按 1 − 1286/5597 算是 0.770. 这条流水线在谱系上接的是 Seed1.5-VL 的内部基准和 LLM 裁判, 用模型评模型, 适合当线索.

## 6. 这一代在谱系里的位置

把可见的部分合起来看, Seed2.0 的能力分布很清楚: 数学推理, 搜索 agent, 深度研究和视觉感知达到或超过同期前沿; 事实性 (SimpleQA Verified 36.0), 长上下文检索 (MRCR 54.0) 和长时程编码 (SWE-Evo 8.5, NL2Repo Pass@1 3.0) 明显落后. 最亮眼的几项成绩, IMO, CMO, Putnam, ICPC, 长视频, 都叠加了推理时的流水线, 多次采样或工具; 单次作答的基础能力要看 Table 3 的大多数行.

从 1.5 代读过来, 这一代延续的是三件事: 用验证器判断对错 (从奖励侧扩展到推理侧), 视觉的原生分辨率与 grounding (变成 Thinking with Tracking 的中间步骤), 以及对价格和 token 用量的控制. **断开的是配方**: 预训练, 架构和后训练不再公开, 读者无法知道 BeyondAIME 从 48.0 到 86.5 的提升来自规模, 数据还是 RL. 下一代 Seed2.1 的模型卡在这一点上略有松动, 在 「Seed for Seed」 一节里透露了一些训练环节的做法.

拿这一代的数字去和 Seed2.1 相减之前, 有几行要先对口径. NL2Repo-Bench 在这张卡里由 Seed 自建, 定义是从空工作区仅凭需求文档一次性建出整个仓库, 附录 C 的 Python-Decouple 案例就是这种形态; Seed2.1 卡对同名基准的描述变成在已有仓库上做多文件修改, 对手 GPT 从 GPT-5.2 High 的 49.3 换成 GPT-5.5 后反而降到 45.1. Terminal Bench 这里是 2.0 版, 下一代换成 2.1 版; HLE-Verified 这里的 73.6 在搜索 agent 表里, 下一代同名行注明不带工具. IMO 这里按 7 分制报 35/42, 下一代的表没有单位. 这几行不先对齐, **两代之间的 「进步」 或 「退步」 大多是口径差**.

这一代还留下一个持续到下一代的做法: 自建基准从 「实践中观察到的失败模式」 出发. 本卡四个高阶维度各有自建集, 并有一条用 LLM 读评测结果, 写诊断报告的流水线; Seed2.1 把它发展成从线上坏例取题的 Doubao Multi-Turn Bench, 和由 agent 审计评测本身的 ProEval. 评测越来越由自家定义, 读者能独立核对的部分就越来越少, 这是模型卡形态带来的代价, 从这一代开始已经很明显.
