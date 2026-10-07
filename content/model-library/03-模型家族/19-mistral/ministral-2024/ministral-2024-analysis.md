---
title: "Ministral 3B / 8B 发布页解读"
category: "模型库"
tags: ["Mistral", "技术解析"]
published: true
excerpt: "打印时每页左下角都叠着 axeptio 的 cookie 弹窗. 正文文字可以从 PDF 文字层找回来, 但图表找不回: 表 1 的模型名列和左侧若干列被盖住, 只露出 HumanEval, GSM8K 和三个 MMLU 共五列;"
---
原文是一篇正文约 500 个英文词的发布博文, 9 页里后 3 页是梗图和页脚, 表和图又被 cookie 弹窗遮去一块.

# Ministral 3B / 8B 发布页解读

- 原文: Mistral AI 官网博文 「Un Ministral, des Ministraux」, 2024 年 10 月 16 日, 署名 Mistral AI team. 网页打印 9 页, 正文占前 6 页; 11 张图里 4 张是表和柱状图的截图, 2 张是梗图, 5 张是 cookie 弹窗里的图标.
- 模型: Ministral 3B 和 Ministral 8B, 合称 les Ministraux, 定位 「on-device computing and at-the-edge use cases」.
- 上下文: 「up to 128k context length (currently 32k on vLLM)」.
- 架构: 只有一句, Ministral 8B 用 「interleaved sliding-window attention pattern」.
- 上线: la Plateforme API 名 ministral-8b-latest 和 ministral-3b-latest; Ministral 8B Instruct 权重开放给研究用途.
- 双语对照见同目录 ministral-2024-bi.md.

| 项 | Ministral 3B | Ministral 8B |
| --- | --- | --- |
| 名字里的尺寸 | 3B | 8B |
| 总参数 | 本页未印 | 本页未印 |
| 激活参数 | 本页未印 | 本页未印 |
| 层数, 隐藏维度, 头数, 词表大小 | 本页未印 | 本页未印 |
| 上下文长度 | up to 128k (vLLM 上 32k) | up to 128k (vLLM 上 32k) |
| 注意力 | 未写 | interleaved sliding-window |
| la Plateforme 价格 | $0.04 / M tokens | $0.1 / M tokens |
| 许可 | Mistral Commercial License | Mistral Commercial License, Mistral Research License |
| 权重 | 未提 | Ministral 8B Instruct, 研究用途 |

## 1. 这是什么材料, 缺了什么

这是一篇产品发布博文, 不是技术报告. 结构很短: 开头两段介绍模型和规格, 「Use cases」 两段讲本地推理和 agent 中间层, 「Benchmarks」 下分 「Pretrained Models」 (表 1, 图 1) 和 「Instruct Models」 (表 2, 图 2, 图 3), 然后是价格表, 自部署和权重说明, 最后 「More to come」 一段. 第 7 页是一张没有配文的梗图, 第 8, 9 页是网站页脚.

打印时每页左下角都叠着 axeptio 的 cookie 弹窗. 正文文字可以从 PDF 文字层找回来, 但图表找不回: 表 1 的模型名列和左侧若干列被盖住, 只露出 HumanEval, GSM8K 和三个 MMLU 共五列; 图 1 左两组的横轴标签和大半图例被盖住; 图 2 只剩右侧两组, 纵轴也没了; 表 2 的表头上半截落在第 3 页底部, 被弹窗挡住, 第 4 页只露出下半截残字. 下文读这些图表时, 行名或列名看不到的一律写 「第 k 行」 或 「C1」 之类的编号.

被遮挡之外, 博文本来就没写的东西更多. 训练数据, 训练 token 数, 训练算力, 架构规格, 词表大小, 位置编码, 128k 怎么训出来, 指令版用了 SFT 还是别的流程, 一概没有. 能核对的只有三块: 表 1 露出的 30 个数, 表 2 的 49 个格子 (其中 4 个 N/A), 以及三张柱状图可以和两张表互相对照的部分.

## 2. 名字里的尺寸, 总参数, 激活参数

名字里的尺寸是 3B 和 8B. 总参数: 本页未印. 激活参数: 本页未印. 页面对量级只有一句 「in the sub-10B category」, 其余规格 (层数, 隐藏维度, 注意力头数, FFN 宽度, 词表大小) 都没印, 所以没法从本页自己推一个参数量出来. 同目录的 Mistral 7B 解读里有 7B 的规格表, 那是另一个模型的数, 本文不搬, 也不从后来的同名模型搬参数.

这意味着 3B 和 8B 在本页只能当作名字里的量级标签来读. 价格和它们的比例也只能按名字粗比: 8B 的 API 价格是 3B 的 2.5 倍, 名字里的尺寸比是 8 / 3 ≈ 2.67 (只按名字比). 两者接近, 但这不能反推参数量, 定价还掺着市场因素.

「sub-10B category」 这个档位本身也没定义边界. 表 2 把 Gemma 2 9B 放进 8B 那一组比, 表 1 却没有 Gemma 2 9B; 对手里名字最大的是 9B, 最小的是 2B. 3B 组里, Ministral 3B 对上的 Gemma 2 2B 和 Llama 3.2 3B 名字分别是 2B 和 3B; 8B 组里对上的是 7B, 8B 和 9B. 页面说 「set a new frontier ... in the sub-10B category」, 读的时候要记得分组是按名字里的尺寸分的.

## 3. 架构线索: 128k, 32k 和交错滑动窗口

全文和架构有关的只有两句. 第一句是上下文: 「Both models support up to 128k context length (currently 32k on vLLM)」. 128k 是 32k 的 4 倍, 页面没说为什么 vLLM 上只开到 32k, 也没说 mistral-inference 或 la Plateforme 上开到多少. 九页里没有长文检索, 长文问答之类的评测, 训练时见过多长的序列也没写.

第二句是注意力: 「Ministral 8B has a special interleaved sliding-window attention pattern for faster and memory-efficient inference」. 这句只给了 8B. 「interleaved」 字面意思是交错, 常见做法是滑动窗口层和全局注意力层按某种比例交替, 但本页没说窗口多大, 交错比例是多少, 哪些层用哪种. 3B 用什么注意力, 页面一字未提. 滑动窗口能省显存, 是因为 KV cache 只需存窗口内的 token, 这是做法本身的性质; 8B 具体省多少, 本页算不出来.

两句放在一起看, 有一个顺理成章的推测: vLLM 当时的 32k 上限可能和交错滑窗的支持程度有关. 但页面没有这么说, 3B 也同样写着 32k, 这个推测证据不足, 只能记为待查. 长上下文和滑窗的一般背景, 本库 llm-guide 的长上下文章节有讲, 但 Ministral 具体用了其中哪一种, 本页没说.

## 4. 表 1 与图 1: 基座模型

表 1 露出五列: HumanEval pass@1, GSM8K maj@8, French MMLU, German MMLU, Spanish MMLU, 分属 Code, Math, Multilingual 三组. 六行数字, 第 3 行与第 4 行之间有横线, 加粗是组内最高. 行名被遮, 但第 5, 6 行能认出来: 图 1 图例露出 「LLama 3.1 8B」 和 「Ministral 8B」, 两者在 GSM8k 组的柱高约 61.7 和 64.5, 与表 1 第 5, 6 行的 GSM8K 值一致. 前四行按图注和表 2 的排法推断为 Gemma 2 2B, Llama 3.2 3B, Ministral 3B, Mistral 7B, 下文凡用到这四行的身份都带着这个前提.

先看 8B 组. Ministral 8B 对 Llama 3.1 8B 五列差值是 -3.0, +2.8, +6.7, +4.6, +5.0; 对第 4 行 (推断为 Mistral 7B) 是 +8.0, +13.2, +6.9, +7.8, +8.2. HumanEval 这一列加粗的是 Llama 3.1 8B 的 37.8, Ministral 8B 只有 34.8, 「consistently outperform their peers」 在这一格不成立. 五列平均, 第 5 行约 51.5, 第 6 行约 54.8.

再看 3B 组. 第 3 行 (推断为 Ministral 3B) 对第 1 行是 +14.1, +15.4, +8.1, +8.2, +7.8, 对第 2 行是 +4.3, +13.7, +6.8, +6.1, +6.4, 组内每列都最高. 但它和横线下的第 4 行比: +7.4, -0.4, -1.5, -1.3, -1.9, 只赢 HumanEval 一列. 五列平均第 3 行约 46.4, 第 4 行约 45.9, 靠 HumanEval 的 7.4 分略占上风. 同家族内, 第 6 行比第 3 行高 +0.6, +13.6, +8.4, +9.1, +10.1, HumanEval 几乎持平.

图 1 可以补上表 1 被遮的部分. 按像素读柱高 (读图, 误差约 ±0.5), 四组各六根柱: 第 1 组约 52.3, 56.2, 64.8, 60.9, 62.4, 65.0; 第 2 组约 41.0, 42.5, 52.7, 48.9, 50.6, 64.2; GSM8k 组约 35.5, 37.2, 61.7, 50.9, 51.3, 64.5; Knowledge & Commonsense 组约 49.1, 50.0, 54.5, 62.8, 64.8, 67.9. GSM8k 组的柱序对应表 1 的第 1, 2, 5, 3, 4, 6 行. 第 1 组和 Knowledge 组在表 1 露出的列里找不到, 应属被遮住的左侧列. 这两组里 Ministral 8B 分别只比 Llama 3.1 8B 高约 0.2 和 13.4, 第 1 组几乎打平.

第 2 组标签被遮. 把表 1 三个 MMLU 取平均, 六行是 40.9, 42.5, 49.0, 50.5, 52.7, 58.2; 按同样柱序对过去, 前五根柱和均值的差都在 0.1 左右, 唯独 Ministral 8B 的柱约 64.2, 比均值高约 6 个点. 如果第 2 组画的就是多语言均值, 图 1 在这一根柱上和表 1 对不上; 如果画的是别的指标, 五根柱恰好都等于多语言均值又太巧. 这是全页最值得换一份无遮挡截图去核的一处.

## 5. 表 2 与图 2, 图 3: 指令模型

表 2 七行七列, 行名完整. 列头上半截被切, 能认出的残字是 C2 「...Hard」, C3 「...bench」, C4 和 C5 「pass@1」, C6 「maj@1」 (字形残缺), C7 「...bench」; 分组是 C1 到 C3 「Chat/Arena (gpt-4o judge)」, C4, C5 「Code」, C6 「Math」, C7 「Function calling」. 图 3 的五组柱可以和表 2 一一对上 (读图): 第 1 组对 C6, 第 2 组对 C4, 第 3 组对 C3, 「Arena Hard」 对 C2, 「MT-Bench Dev」 对 C1 乘 10. 所以 C2 是 Arena Hard, C1 在表里是 10 分制, 图里画成百分制; C1 的列头本身在表里看不到.

3B 组里 Ministral 3B 七列全是组内最高. 对 Mistral 7B 的差值是 +1.4, +20.0, +3.2, +17.5, +39.0, +38.5, +21.5, 对 Llama 3.2 3B 是 +0.9, +18.3, +9.1, +3.1, +16.4, +13.3, C7 无从比. 更醒目的是跨组比较: Ministral 3B 对 8B 组的 Llama 3.1 8B, 六个可比的列里赢四列 (C1 +0.6, C2 +1.9, C5 +10.3, C6 +2.4), 输两列 (C3 -0.7, C4 -2.0). 图 2 只露出 Arena Hard 和 MT-Bench Dev 两组, 纵轴被遮, 用 Arena Hard 的两根柱定比例后, 其余柱高和表 2 相差都在 1.5 分以内 (读图), 图表一致.

8B 组里 Ministral 8B 七列中五列最高. 输的两格: C3 输给 Gemma 2 9B, 41.3 对 43.8; C5 输给自家的 Ministral 3B, 76.8 对 77.4. 对 Gemma 2 9B 的差值是 +0.7, +2.2, -2.5, +1.5, +9.1, +7.1; 对 Llama 3.1 8B 是 +0.8, +8.5, +4.3, +0.3, +9.7, +5.2. 8B 对 3B 的家族内差值是 +0.2, +6.6, +5.0, +2.3, -0.6, +2.8, +3.2, 名字里的尺寸大了约 2.67 倍, 分数提升却多在 3 分上下, C5 还倒挂.

表 2 的 C6 和表 1 的 GSM8K 不宜直接比. 表 1 写明是 GSM8K maj@8, 表 2 C6 的数据集名被切掉, 指标残字像 maj@1. Llama 3.1 8B 基座 GSM8K 61.7, 指令版 C6 49.3; Ministral 8B 是 64.5 和 54.5; Mistral 7B (推断的第 4 行) 更是从 51.3 掉到 13.2. 若 C6 真是 maj@1, 少了 8 次投票, 分数低是正常的, 但数据集是否相同, 本页读不出来.

## 6. 函数调用与 agent 中间层

页面给 les Ministraux 的定位有两层. 一层是本地推理: 端侧翻译, 不联网的智能助手, 本地分析, 自主机器人, 强调 「compute-efficient and low-latency」. 另一层是和 Mistral Large 这类大模型搭配, 在多步 agent 工作流里做函数调用中间层, 负责输入解析, 任务路由和按用户意图调 API. 函数调用的一般机制见本库 [Function Calling](../../../../LargeLanguageModelGuide/7-LLM应用开发/7.4-FunctionCalling/7.4-FunctionCalling.md).

支撑这一定位的只有表 2 的 C7 一列. Ministral 3B 28.4, Ministral 8B 31.6, Mistral 7B 6.9, 其余四个对手全是 N/A. 3B 是 Mistral 7B 的约 4.1 倍, 8B 约 4.6 倍. 列头只剩 「...bench」, 满分多少, 测的是单轮调用还是多步路由, 页面都没说. 对手全是 N/A, 所以 「set a new frontier in ... function-calling」 在本页只有和自家旧模型的比较作证.

「extremely low latency and cost」 同样缺数字. 价格表给了每百万 token 的价钱, 但没有延迟, 没有吞吐, 也没有和 Mistral Large 的价格对照, 读者没法算出 「大模型加小模型中间层」 的组合到底省多少. 这一段更像使用建议, 不是评测结论.

## 7. 定价, 许可与部署口径

la Plateforme 上两者输入输出同价: 8B 每百万 token 0.1 美元, 3B 0.04 美元. 按这个价格, 处理 10 亿 token, 8B 约 100 美元, 3B 约 40 美元 (输入输出合计). API 名都带 「-latest」 后缀, 页面没给固定版本号; Hugging Face 链接里的仓库名是 Ministral-8B-Instruct-2410, 后缀 2410 和 「October 16, 2024」 的年月对得上.

许可两行不一样. 8B 写了 Mistral Commercial License 和 Mistral Research License 两种, 3B 只写 Mistral Commercial License. 权重方面只说 「Ministral 8B Instruct」 开放给研究用途, 3B 的权重没提, 8B 的基座权重也没提. 自部署要找 Mistral 谈商业许可, Mistral 会按客户场景协助做 「lossless quantization」; 量化到几 bit, 量化前后分数如何, 都没写. 量化的一般做法见本库 [量化](../../../../LargeLanguageModelGuide/6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1-量化.md).

这套安排和 「on-device」 的定位有些张力. 端侧场景通常意味着权重要落到用户设备上, 而本页 3B 只有 API 和商业许可, 8B 也只有指令版权重且限研究用途. 真正上端侧需要先谈许可, 这一点在 「Use cases」 段里没提, 到价格表下面才出现.

## 8. 谱系: 这页自己交代的上下游

本页明说的关系有这几条. 第一, 纵向上接 Mistral 7B: 发布时间点定在 「the first anniversary of the release of Mistral 7B」, 结尾又说 Ministral 3B 「already outperforms it on most benchmarks」, Mistral 7B 同时出现在表 1, 表 2 和三张图里当比较基线, 图例写明是 「Mistral 7B Instruct v0.3」. 第二, 横向搭配 Mistral Large: 小模型做函数调用中间层, 大模型做主力, 但页面没说是哪一版 Mistral Large. 第三, 对标 Gemma 2 2B, Gemma 2 9B, Llama 3.2 3B, Llama 3.1 8B 四个外家模型.

第 7 页的梗图补了一层家族关系, 虽然没配文字. 上半是一年前的 Mistral 7B 牵着四个小家伙, 下半 「2024」 里它们长成一排大乌龟, 露出的两只标着 Pixtral 和 Mistral Small, 另外两只被弹窗盖住. 梗图的意思是把 2024 年的一批模型都算作 Mistral 7B 之后的 「下一代」, 但被盖住的两只标的是谁, 本页读不出来, 也不能凭它断定哪些模型之间有权重继承.

页面没说 Ministral 是从零训练还是从别的模型蒸馏, 剪枝或继续训练而来, 没提和 Mixtral 这类 MoE 模型的关系, 也没说 tokenizer 用的是哪一套. 相关模型见同目录 [Mistral 7B 解读](../mistral-7b/mistral-7b-analysis.md), [Pixtral 12B 解读](../pixtral-12b/pixtral-12b-analysis.md), 以及 large-2402, large-2407 两篇 Mistral Large 的解读. 读的时候注意口径: Mistral 7B 那篇是 arXiv 技术报告, 有规格表; 本页是发布博文, 没有规格, 图表还被遮了一块, 数字不能混在一起算.

## 9. 本页对不上的数字

按页面顺序汇总, 前提写在各条里:

1. 图 1 第 2 组 (标签被遮): 前五根柱与表 1 三个 MMLU 的均值相差约 0.1, Ministral 8B 的柱约 64.2, 均值却是 58.2, 差约 6 个点.
2. 「consistently outperform their peers」: 表 1 HumanEval 中 Llama 3.1 8B 37.8 高于 Ministral 8B 34.8; 表 2 C3 中 Gemma 2 9B 43.8 高于 Ministral 8B 41.3.
3. 「Ministral 3B already outperforms [Mistral 7B] on most benchmarks」: 指令版七列全胜; 基座按推断行序只赢表 1 五列中的 HumanEval 一列, 图 1 可读四组也都落后, 页面没说这句指哪一版.
4. 表 2 C5: Ministral 3B 77.4 高于 Ministral 8B 76.8, 家族内倒挂 0.6.
5. MT-Bench Dev: 表 2 C1 是 10 分制 (最高 8.3), 图 2, 图 3 画成百分制 (最高约 83); C1 的列头在表里看不到.
6. 图 2 图注前半句列三个模型, 图例有四项, Mistral 7B 到后半句才出现; 表 2 图注写 「Mistral 7B」, 图例写 「Mistral 7B Instruct v0.3」.
7. 上下文: 「up to 128k」, 同一句又说 vLLM 上 「currently 32k」, 相差 4 倍, 九页里没有长上下文评测.
8. 许可与权重: 8B 两种许可, 3B 只有商业许可; 只提到 Ministral 8B Instruct 的权重, 3B 与 8B 基座的权重未提.
9. 名字里的尺寸 3B, 8B; 总参数本页未印; 激活参数本页未印.
10. 页脚 「Mistral AI © 2026」 与发布日期 2024 年 10 月 16 日不同, 是打印时间.

这些问题里, 1, 3 两条的根子是 cookie 弹窗遮住了图例, 行名和横轴标签, 换一份无遮挡的截图, 可能就对上了或者坐实了. 2, 4, 5, 6 是图表本身能读出来的, 和遮挡无关: 博文正文用了 「consistently」 这样的全称说法, 表格里却有反例.

第 9 条单独说一句. 这页能给的只是名字里的尺寸; 总参数和激活参数要到模型卡或权重文件里去读, 本文不从别的模型推算.
