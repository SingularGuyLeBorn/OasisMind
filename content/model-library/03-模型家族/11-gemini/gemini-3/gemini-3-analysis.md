[OM-FREEPLAY] 材料不够 5000: 这张模型卡的中文译文约 3100 字, 正文加三张表撑不起 5000 字的分析. 下文只写卡里有的内容, 以及由表里数字直接算出的差值, 不补参数量, 层数或专家数.

# Gemini 3 Pro 模型卡: 分析

## 1. 两个日期, 三层内容

第 2 页并排写着 「Model Release: November 2025」 和 「Last Updated: May 2026」. 这是更新过的版本, 但卡里没有更新记录, 只能从内容反推. 第 5 页的能力表写着 「Results as of November, 2025」, 对手是 Claude Sonnet 4.5 和 GPT-5.1, 这是发布时的数. 第 2 页的家族清单列到 Gemini 3.1 Pro, 3.1 Flash Image, 3.1 Flash-Lite, 3.1 Flash Live 和 Gemini 3.5 Flash, 同一段把它们叫作 「Each subsequent model in the Gemini 3 Pro family」, 这部分是后来补的. 知识截止日期在第 6 页, 是 January 2025, 离发布隔了 10 个月.

读这张卡可以把内容分三层. 第一层是模型本身的规格: 输入输出, 架构, 训练数据, 硬件和软件. 第二层是发布时的评估: 能力表, 内容安全表, 红队结论, 前沿安全表. 第三层是后来补的家族清单. 开头那段说模型卡会 「from time-to-time」 更新, 举的例子是 「to include updated evaluations」, 可就这一版看, 能力表仍停在 2025 年 11 月, 能看出的更新落在家族清单上. 哪些评估换过, 哪些没换, 卡里没有写.

## 2. 规格: 窗口长度和 TestingTime 分开记

第 2 页的规格只有两行. 输入是文本, 图像, 音频和视频, 「token context window of up to 1M」; 输出只有文本, 「64K token output」. 输入和输出的上限之比约 16 比 1. 输出模态只有文本, 图像生成在家族里另有 Gemini 3 Pro Image 和 Gemini 3.1 Flash Image 两张卡. 输入侧的四种模态和第 3 页架构段的 「native multimodal support for text, vision, and audio inputs」 对得上, 视频在架构段里没单列, 归在视觉里.

Deep Think 写在另一处. 第 2 页 Description 最后一句说它是 「an optional setting designed to enhance complex problem-solving performance at time of inference」, 也就是推理阶段的可选开关, 它多花的算力记作 TestingTime. 1M 是窗口长度, 决定一次能读进多少材料, 不是 TestingTime; 64K 决定一次最多写出多少. 三样东西写在三个位置, 性质也不同, 不能合成 「长思考能力」 一个词.

第 5 页 MRCR v2 (8-needle) 说明窗口够长不等于用得好. Gemini 3 Pro 在 128k (average) 是 77.0%, 到 1M (pointwise) 是 26.3%. 两档一个取平均, 一个取单点, 统计方式不同, 50.7 个百分点的差只能当量级看. Claude Sonnet 4.5 和 GPT-5.1 在 1M 那一格写的是 「not supported」, 这一格没有横向比较, 只有 Gemini 3 Pro 对 2.5 Pro 的 26.3% 对 16.4%.

## 3. 架构和数据: 能确定的只有几句

第 3 页说 Gemini 3 Pro 是稀疏 MoE Transformer, 每个输入 token 只激活一部分参数, 总容量和每 token 的计算与服务成本脱钩. 接下来只有一句 「Developments to the model architecture contribute to the significantly improved performance from previous model families」. 没有层数, 专家数, 路由细节, 也没有参数量. 段内九处文献链接都指向 gemini_v2_5_report.pdf 的参考文献页, 引用列表是沿用的. 第 2 页另有一句 「not a modification or a fine-tune of a prior model」, 说明它不是在前代权重上接着训的. 两句拼起来只能得出: 新训练的稀疏 MoE, 架构有改动, 改动内容没公开.

训练数据段信息多一些, 但都是类别, 没有规模. 预训练数据有网页文档, 文本, 代码, 图像, 音频和视频; 后训练数据是指令微调数据, 强化学习数据和人类偏好数据; 强化学习 「can leverage multi-step reasoning, problem-solving and theorem-proving data」. 数据来源列了六类: 可下载的公开数据集, 爬虫数据, 商业授权数据, 用户数据, Google 业务运营中获取或生成的数据 (含员工提供的), AI 生成的合成数据. 用户数据一项带了条件: 遵守服务条款和隐私政策, 「pursuant to user controls, where appropriate」. 过滤手段是去重, 遵守 robots.txt, 安全过滤和质量过滤.

第 4 页的硬件段落讲的是 TPU 的一般优点: 高带宽内存, 大 batch, TPU Pod 可扩展, 训练可分布到多台设备. 没有芯片型号, 集群规模, 训练时长或能耗. 软件只有 JAX 和 ML Pathways 两个名字. 分发渠道列了六个: Gemini App, Google Cloud / Vertex AI, Google AI Studio, Gemini API, Google AI Mode, Google Antigravity, 家族里的其他模型还可能出现在 Notebook LM.

## 4. 能力表: 对 2.5 Pro 全胜, 横着看不是

第 5 页的结果段只说 Gemini 3 Pro 「significantly outperforms Gemini 2.5 Pro」. 表里 23 行, 2.5 Pro 有数的 21 行 Gemini 3 Pro 全赢, 包括越低越好的 OmniDocBench 1.5 (0.115 对 0.145). 差距最大的几行在推理和智能体: ARC-AGI-2 从 4.9% 到 31.1%, 约 6.3 倍; MathArena Apex 从 0.5% 到 23.4%; ScreenSpot-Pro 从 11.4% 到 72.7%, 高 61.3 个百分点; τ2-bench 从 54.9% 到 85.4%, 高 30.5 个百分点; Vending-Bench 2 的净资产均值从 $573.64 到 $5,478.16, 约 9.55 倍. 差距小的在知识和多语言: MMMLU 高 2.3 个百分点, Global PIQA 高 1.9 个百分点, Video-MMMU 高 4.0 个百分点.

横着看四列, 结论要收窄. SWE-Bench Verified 单次尝试一行, Gemini 3 Pro 的 76.2% 排第三, Claude Sonnet 4.5 是 77.2%, GPT-5.1 是 76.3%. AIME 2025 用代码执行一行, Gemini 3 Pro 和 Claude Sonnet 4.5 并列 100%. 贴得很近的还有 τ2-bench (85.4% 对 Claude Sonnet 4.5 的 84.7%), MMMLU (91.8% 对 GPT-5.1 的 91.0%), AIME 2025 不用工具 (95.0% 对 GPT-5.1 的 94.0%). 拉开距离的是 ScreenSpot-Pro (72.7% 对次高的 36.2%), SimpleQA Verified (72.1%, 其余三列最高是 2.5 Pro 的 54.5%, 另两家分别是 29.3% 和 34.9%), MathArena Apex (23.4% 对次高的 1.6%) 和 ARC-AGI-2 (31.1% 对次高的 17.6%).

编程三行分化明显. 竞赛题 LiveCodeBench Pro 的 Elo 2,439 比 GPT-5.1 的 2,243 高 196 分; Terminal-Bench 2.0 在 Terminus-2 agent 设置下是 54.2%, 比 GPT-5.1 的 47.6% 高 6.6 个百分点; 描述为 Agentic coding 的 SWE-Bench Verified 却没有领先. 第 6 页把 「advanced coding」 列为特别适合的用途之一, 表里支撑这句话的主要是前两行.

## 5. 表里的单位和设置

这张表有四种单位. 大部分是百分比; OmniDocBench 1.5 是 「Overall Edit Distance, lower is better」; LiveCodeBench Pro 是 Elo; Vending-Bench 2 是美元计的 「Net worth (mean)」. 各行的提升不能平均成一个数, Vending-Bench 2 的 9.55 倍和 ARC-AGI-2 的 6.3 倍也不能比谁涨得多. OmniDocBench 1.5 上编辑距离从 0.145 降到 0.115, 少了 0.030, 按比例约少 20.7%; Claude Sonnet 4.5 和 Gemini 2.5 Pro 同为 0.145, GPT-5.1 是 0.147.

设置列要逐格读. Humanity's Last Exam 和 AIME 2025 各分 「No tools」 和带工具两档, 带工具那档大多是 「—」: HLE 用搜索和代码执行的 45.8% 只有 Gemini 3 Pro 一列有数, AIME 2025 用代码执行只有 Gemini 3 Pro 和 Claude Sonnet 4.5 有数. ARC-AGI-2 标 「ARC Prize Verified」, Terminal-Bench 2.0 标 「Terminus-2 agent」, SWE-Bench Verified 标 「Single attempt」. 最重要的一个设置反而没标: Gemini 3 Pro 这一列有没有开 Deep Think. 方法细节被指到 deepmind.com/models/evals-methodology/gemini-3-pro, 卡内没有复述.

还有一行要看来源. FACTS Benchmark Suite 的说明是 「Held out internal grounding, parametric, MM, and search retrieval benchmarks」, 是 Google 内部留出的基准, Gemini 3 Pro 70.5%, Claude Sonnet 4.5 50.4%, GPT-5.1 50.8%. 对手在内部基准上的分数只能来自 Google 自己的运行. 其他行的对手分数是自跑还是引用, 表里同样没有注明.

## 6. 内容安全表: 正负号对着颜色读

第 8 页的表只有五行, 全是自动评测, 比较对象是 Gemini 2.5 Pro, 分数是 「absolute percentage increase or decrease」. 转成 Markdown 后颜色没了, 而正负号在不同行含义相反. 卡里能用来判断的文字有两句: 「We mark improvements in green and regressions in red」, 以及人工复核确认 「losses were overwhelmingly either a) false positives or b) not egregious」. 标了 「(non-egregious)」 的三格, 多语言安全 +0.2%, 图像到文本安全 +3.1%, 无理拒答 +3.7%, 就是这里说的 losses. 剩下两格是改进: 文本到文本安全 -10.4%, 语气 +7.9%. PDF 原件的配色和这个读法一致.

照这个读法, 第 8 页开头那句 「Overall, Gemini 3 Pro outperforms Gemini 2.5 Pro across both safety and tone, while keeping unjustified refusals low」 要打个折扣. 三行安全评测里一行改进, 两行退步; 语气改进; 无理拒答比 2.5 Pro 多了 3.7%, 「low」 说的是水平, 不是方向. 卡给的解释是退步大多是误报或不严重, 又说评测改过, 「not directly comparable with performance results found in previous Gemini model cards」.

表下两个脚注对不上这张表. 脚注 1 提到的是 「2.5 Flash-Lite model card」, 脚注 2 说的是 「tone and instruction following」, 表里没有指令遵循这一行. 正文还说 「The performance results reported below」, 表却在这句话上面. 这几处看上去是从别的卡沿用的文字, 不影响五个数字本身, 但说明这一页的说明文字不能逐句当成对这张表的注释.

## 7. 红队, 儿童安全阈值和风险

第 9 页的人工红队结论都是定性的. 儿童安全评估只给了阈值结论: 「Gemini 3 Pro satisfied required launch thresholds」, 阈值由专家团队制定, 没有分数. 一般内容安全政策 (含儿童安全) 上, 表现与 2.5 Pro 「similar or improved」. 红队范围比 2.5 Pro 扩大到严格政策以外的问题, 「found no egregious concerns」. 第 7 页列了四类评估: 训练/开发评测, 人工红队, 自动红队, 伦理与安全审查, 只有第一类在第 8 页给了数字.

缓解措施列了六项: 数据集过滤, 条件预训练, 监督微调, 基于人类和评审反馈的强化学习, 安全政策和期望行为, 产品层安全过滤. 主要风险只写了两条: 越狱漏洞 「improved compared to Gemini 2.5 Pro but still an open research problem」, 以及多轮对话中可能退化. 第 6 页的已知局限另有幻觉, 偶尔变慢或超时, 知识截止 2025 年 1 月三条. 越狱改善了多少, 多轮退化从第几轮开始, 卡里都没有量.

## 8. 前沿安全: 预警阈值和 CCL 是两层

第 9 页说按 「Frontier Safety Framework (September-2025)」 评估, 第 10 页表里五个领域都是 「CCL not reached」. 各领域对应的 CCL 不同: CBRN 和网络安全是 Uplift Level 1, 有害操纵是 Level 1 (exploratory), 机器学习研发是 Acceleration level 1 和 Automation level 1, 未对齐 (探索性) 是 Instrumental Reasoning Levels 1 + 2.

表里还有一条比 CCL 低的线, 叫 alert threshold, 五行对它的说法不一样. 网络安全写 「Alert threshold met」, 分数是关键技能基准 v1 困难挑战 11/12, v2 挑战端到端 0/13; 有害操纵写 「does not reach alert thresholds」; 机器学习研发写总分 「substantially below the alert threshold」; CBRN 和未对齐两行没提预警阈值, 未对齐给了分数 3/11 和 1/4. 网络安全是五个领域里唯一踩到预警线的, 结论仍是 CCL 未达到. 预警线设在哪, 卡里没写, 指向另一份 Gemini 3 Pro Frontier Safety Framework Report.

机器学习研发一行点名 RE-Bench (Wijk et al., 2024) 里 Scaling Law Experiment 和 Optimize LLM Foundry 两项任务进步明显, 但没给分数, 只说比 Gemini 2.5 模型好. 有害操纵一行给的是两个比较方向: 高于非生成式 AI 基线, 相对以往模型没有显著提升. 五行里有分数的只有网络安全和未对齐两行, 其余三行是定性描述.

## 9. Deep Think 在全卡只出现三次

Deep Think 第一次出现在第 2 页, 介绍为推理阶段的可选设置; 第 8 页说用 Deep Think 模式做的安全评估 「yielded results consistent with the original Gemini 3 Pro safety assessment」; 第 10 页对前沿安全评估说了同样的话. 第 5 页的能力表没有 Deep Think 列, 四列是 Gemini 3 Pro, Gemini 2.5 Pro, Claude Sonnet 4.5, GPT-5.1, 表注也没说 Gemini 3 Pro 那一列用哪档设置.

所以 Deep Think 多花 TestingTime 能换来多少分, 这张卡给不出答案. 安全一侧只有 「consistent」, 没有和第 8 页五行对应的数字, 也没有和第 10 页五个领域对应的分数. 反过来, 能力表里 Gemini 3 Pro 的数也不能当成 Deep Think 的上限或下限引用.

## 10. 三张表是不是同一个快照

能力表, 内容安全表和前沿安全表各有各的时间标注. 第 5 页是 「Results as of November, 2025」; 第 8 页是 「during the development phase」, 没有日期; 第 9 页的 September-2025 是框架版本的日期, 不是模型的. 全卡没有检查点编号, 也没说三张表用的是同一份权重. Deep Think 的两句结论拿来比的是 「the original Gemini 3 Pro」, original 指哪个版本也没交代.

把三张表连起来推理时要留余地. 网络安全一行的 「Alert threshold met」 和能力表 Terminal-Bench 2.0 的 54.2% 都和智能体操作有关, 看起来可以互相印证, 但卡里没有证据说它们来自同一个模型快照. 家族清单又说后续模型都 「based on Gemini 3 Pro」, 那些模型的分数和安全结论要去各自的卡里找. 这张卡能直接引用的, 是 2025 年 11 月那一版 Gemini 3 Pro 对 2.5 Pro 的逐行差距, 内容安全五行相对 2.5 Pro 的升降, 以及五个前沿领域都未达 CCL 这一结论.
