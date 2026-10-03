---
title: "DeepSeek-V3.1-Terminus: 同一权重线上的修订版"
category: "模型库"
tags: ["DeepSeek", "技术解析"]
published: true
excerpt: "Terminus 发布于 V3.1 之后一个月左右, 标题写的是 DeepSeek-V3.1 → DeepSeek-V3.1-Terminus, 开头一句说它「建立在 V3.1 的长处上, 同时处理用户反馈的关键问题」."
---
# DeepSeek-V3.1-Terminus: 同一权重线上的修订版

> 公开材料是两页英文发布说明, 只有三条改进要点, 一张 V3.1 对 Terminus 的 12 行对照表, 以及 App / Web / API 与 Hugging Face 权重地址. 没有架构, 数据, 训练日程, 后训练算法, 评测协议.

来源: 同目录 `deepseek-v3-1-terminus.md`(`page 1 of 2`–`page 2 of 2`). 对照译稿: `deepseek-v3-1-terminus-bi.md`. 表内数字回源文 `deepseek-v3-1-terminus.md`.

Terminus 发布于 V3.1 之后一个月左右, 标题写的是 `DeepSeek-V3.1 → DeepSeek-V3.1-Terminus`, 开头一句说它「建立在 V3.1 的长处上, 同时处理用户反馈的关键问题」. 两页说明里没有参数, 上下文长度, 分词器或数值格式的变化声明, 所以只能把它当成同一权重线上的一次后训练修订. 能从页上读出来的有三件事: 修了什么输出问题, Agent 分数变了多少, 不带工具的推理分数有涨有跌.

## 1. 定位: 没有新底座的证据

页上没有一句话提到网络结构. V3.1 发布页里写过的 UE8M0 FP8, 128K 上下文, 新 chat template, 在 Terminus 页上都没有重复, 也没有说改了. 权重直接放在 Hugging Face 的 `deepseek-ai/DeepSeek-V3.1-Terminus` 仓库, 名字仍挂在 V3.1 下. 按常规读法, 部署层面应沿用 V3.1 的全部假设, 包括模板和 FP8 格式, 但页上没有明写「兼容 V3.1」.

对照表的 V3.1 一栏也能说明两页是同一套评测. V3.1 发布页里的 Browsecomp 30.0, Browsecomp_zh 49.2, SimpleQA 93.4, SWE-bench Verified 66.0, SWE-bench Multilingual 54.5, Terminal-Bench 31.3, 在 Terminus 表里原样出现; V3.1 效率图里 V3.1-Think 的 GPQA Diamond 80.1 和 LiveCodeBench 74.8 也和本表一致. 所以 Terminus 一栏可以直接和 V3.1 发布页比较, 不用担心换了口径.

## 2. 语言一致性: 修的是输出质量问题

三条改进里第一条是 「fewer CN/EN mix-ups & no more random chars」, 即中英文混杂更少, 随机字符不再出现. 这是用户反馈里的问题, 不是评测分数. V3.1 上线后, 用户报告过模型在代码和英文回答里随机插入「极」, 「極」或 「extreme」 这类字样, 写代码时会直接导致编译失败; 这是页外背景, 页上只写了 「random chars」, 没有说是哪个字符, 出现频率多少, 原因是什么.

中英混杂在 R1 报告里已经出现过. R1 在推理 RL 阶段加了语言一致性奖励, 按 CoT 中目标语言词的比例给分, 用少量推理分数换可读性. Terminus 页没有说用了同样的奖励, 也没有说是改数据, 改解码还是改模板. 页上用的是 「fewer」 和 「no more」, 没有给混杂率或异常字符率的测量方法, 所以引用时只能写「官方称混杂减少, 随机字符消失」, 不能写成比例.

## 3. Agent 分数: 大多数上涨, 中文浏览回落

第二条改进是 「stronger Code Agent & Search Agent performance」. 表的下半块 `agentic tool use` 给了六行: BrowseComp **30.0 → 38.5**, BrowseComp-zh 49.2 → 45.0, SimpleQA 93.4 → 96.8, SWE Verified 66.0 → 68.4, SWE-bench Multilingual 54.5 → 57.8, Terminal-bench 31.3 → 36.7. 按 SWE-bench Verified 的 500 题折算, 2.4 分约多解决 12 题; BrowseComp 涨了 8.5 分, 相对涨幅约 28%, 是这一块最大的变化.

BrowseComp 英文涨了 8.5 分, 中文却跌了 4.2 分, 两者方向相反. 一种可能是修语言混杂时, 训练更偏向保持提问语言, 改变了中文检索的搜索词或读页习惯, 但这只是推测, 页上没有解释. 页上也没有说 Agent 框架, 检索工具和最大轮数是否与 V3.1 一致; 前面已经核对 V3.1 一栏与发布页相同, 至少说明旧分数没有重跑, 新分数是否同一框架仍是未知.

## 4. 不带工具的推理: 一项大涨, 两项回落

表的上半块是 `reasoning mode w/o tool use`: MMLU-Pro 84.8 → 85.0, GPQA-Diamond 80.1 → 80.7, Humanity's Last Exam **15.9 → 21.7**, LiveCodeBench 74.8 → 74.9, Codeforces 2091 → 2046, Aider-Polyglot 76.3 → 76.1. HLE 涨了 5.8 分, 相对涨幅约 36%, 是全表最大的变化. GPQA Diamond 只有 198 题, 一题约 0.5 分, 0.6 分的变化约等于多对 1 题, 如果只采样一次, 这个差距在波动范围内.

Codeforces 跌了 45 分, Aider-Polyglot 跌了 0.2 分, 页上第三条却写 「more stable & reliable outputs across benchmarks」. 「稳定」在这里更像是指输出行为, 不是每项分数单调上升. 这张表的 HLE 是不带工具的成绩, V3.1 发布页的 HLE 29.8 是带搜索工具的成绩, 两者差了近一倍, 引用 Terminus 的 21.7 时要写明协议. 页上没有给采样次数, 温度, 最大生成长度, 所以 0.1 到 0.6 分级别的变化不能当成确定的提升.

## 5. 交付入口

页末写 Terminus 已在 App, Web, API 上线, 并给出 Hugging Face 权重地址, 最后感谢用户反馈. 页上没有写价格, 没有写 API 路由名是否变化, 也没有写思考和非思考两种模式在 Terminus 上的分工. 这些都要回到 V3.1 发布页或 API 文档核对, 这里不能提供.

从谱系上看, Terminus 在 V3.1 和 V3.2-Exp 之间. 它不改网络结构, 只在后训练上修语言一致性并提高 Agent 分数; 下一步的 V3.2-Exp 才在这条权重线上换成稀疏注意力. 所以对比 V3.2-Exp 的效果时, 基线应是 Terminus 而不是 V3.1, 否则会把 Terminus 的后训练改进算到稀疏注意力头上.

## 6. 这两页没有的东西

材料缺的部分: 没有参数和结构说明; 没有语言一致性问题的成因和修法; 没有 Agent 训练数据, 轨迹来源, 奖励设计; 没有评测协议; 没有异常字符率这类直接对应第一条改进的指标. 页上唯一的定量证据是 12 行对照表, 而这张表测的是能力, 不测语言混杂.

读这份说明能得到的结论只有三条: 同一权重线的后训练修订; 官方宣称修了混杂和随机字符; Agent 分数五涨一跌, 推理分数一大涨两小跌. 需要更多信息时, 底座看 V3 报告, 长推理训练看 R1 报告, 模板和精度看 V3.1 发布页.
