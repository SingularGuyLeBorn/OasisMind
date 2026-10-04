---
title: "Grok-2: 一篇 Beta 公告里的榜单, 分数和缺口"
category: "模型库"
tags: ["xAI", "技术解析"]
published: true
excerpt: "这篇公告能回答三件事: 早期 Grok-2 在 Chatbot Arena 上排在什么位置; Grok-2 和 Grok-2 mini 在 8 个学术基准上相对 Grok-1.5 和同期 6 家前沿模型落在哪里;"
---
公开材料是 x.ai 在 2024 年 8 月 13 日发的 Grok-2 Beta 产品公告, 不是技术报告. 全文有一张 Chatbot Arena 的 Elo 图, 一张 8 行学术基准表, 两张产品截图和一段 API 介绍. Grok-2 和 Grok-2 mini 的参数量, 结构, 上下文长度, 训练数据和对齐方法页面都没有.

# Grok-2: 一篇 Beta 公告里的榜单, 分数和缺口

来源: 同目录 `grok-2.md` (页标记 `page 1 of 7` 到 `page 7 of 7`), 对照译稿 `grok-2-bi.md`. 配图 4 张: `images/p02-overall-elo-scores-on-chatbot-arena.png` 是 Arena 的 Elo 图; `images/p04-x-app-grok-page-with-grok-mini.png` 是 𝕏 App 的 Grok 页面截图; `images/p04-photo-of-a-meme-and-grok-s-expla.png` 是 Grok 解释梗图的截图; `images/p04-build-with-grok-using-the-enterprise-api.png` 实际是 Black Forest Labs 的 logo. 数字一律回源 md, 图上的 Elo 是目测读数.

这篇公告能回答三件事: 早期 Grok-2 在 Chatbot Arena 上排在什么位置; Grok-2 和 Grok-2 mini 在 8 个学术基准上相对 Grok-1.5 和同期 6 家前沿模型落在哪里; 2024 年 8 月 Grok 在 𝕏 和 API 上是什么产品形态. 它回答不了模型怎么搭, 怎么训, 也回答不了表里各家分数是不是在同一设置下测的.

## 1. 页面构成: 一张榜单图, 一张表, 两段产品介绍

第 1 页给出日期 Aug 13, 2024 和定位: Grok-2 是「a significant step forward from our previous model Grok-1.5」, 能力落在「chat, coding, and reasoning」; 同时推出「a small but capable sibling」Grok-2 mini. 两个模型当天在 𝕏 上 beta, 企业 API「later this month」. 同家族 [xAI 新闻页](../xai/xai-bi.md) 里, 这条前面是 2024 年 4 月 12 日的 [Grok-1.5V](../grok-1-5v/grok-1-5v-bi.md), 后面依次是 11 月 4 日的 API Public Beta, 12 月 9 日的图像生成发布, 再往后是 2025 年 2 月的 [Grok 3](../grok-3/grok-3-bi.md).

正文分五节: Arena 与内部评测 (第 1, 2 页), 学术基准表和脚注 (第 2, 3 页), 𝕏 上的新界面 (第 3, 4 页), 企业 API (第 4, 5 页), 展望 (第 5 页). 第 5 页后半到第 7 页是网站页脚. 配图有 4 张, 但第 2 页 Elo 图下方还有一行截断的「Win Rate of Gr」, 像是第二张图的标题, 这张胜率图没有抓下来. 第 4 页那张以「build-with-grok-using-the-enterprise-api」命名的图, 内容是 Black Forest Labs 的白色 logo, 文件名取自紧随其后的小标题, 和图无关.

## 2. Chatbot Arena: 第 4 名, 措辞比图宽

早期 Grok-2 以化名 sus-column-r 进入 **Chatbot Arena**, 第 1 页有一处写成「sus-columnr」, 图上和第二次提到时都带连字符. 第 2 页的图按总体 Elo 从高到低排了 25 个条目, sus-column-r 在第 4, 目测约 1281, 误差棒约 1275 到 1286. 前三名是 ChatGPT-4o-latest-2024-08-08 (约 1314), Gemini-1.5-Pro-Exp-0801 (约 1297), GPT-4o-2024-05-13 (约 1286); 其后是 GPT-4o-mini-2024-07-18 (约 1274), Claude 3.5 Sonnet (约 1271), GPT-4-Turbo-2024-04-09 在约 1257. 页面没给整数, 也没说误差棒对应多大的置信区间, 以上都是按纵轴 10 分一格读的近似值, 图顶部 1290 以上还盖着一层灰色浮层.

正文两次描述名次, 口径不一样. 第一次是「outperforming both Claude 3.5 Sonnet and GPT-4-Turbo」, 按图大致成立, 对 Claude 3.5 Sonnet 领先约 10 分, 对 GPT-4-Turbo-2024-04-09 约 24 分. 第二次变成「outperforms both Claude and GPT-4」, 换成家族名以后, 排在它前面的两个 GPT-4o 条目也被罩进去了, 这句按图不成立. sus-column-r 和 GPT-4o-2024-05-13 的误差棒还有重叠, 两者谁高本图分不出. 排第一的 ChatGPT-4o-latest-2024-08-08 日期只比公告早 5 天, Arena 名次随新模型上榜和投票累积随时会变, 原文加「At the time of this blog post」是必要的限定. 用评测结果下结论时要交代的不确定性, 通用讨论见 [评测科学与证据](../../../../llm-guide/5-评测、安全与治理/5.1-评测科学与证据/5.1-评测科学与证据.md).

内部评测只有定性描述. xAI 说用的是「a comparable process」: **AI Tutors** 在反映真实用法的任务上与模型交互, 每次看 Grok 生成的两条回答, 按内部准则选更好的一条, 评判维度是指令遵循和事实准确. 和 Arena 相比, 两条回答都来自 Grok, 评判人是 xAI 自己的标注员, 这套流程比的是 Grok 内部版本, 不是和别家对比. 正文说 Grok-2 在检索内容上的推理和 tool use 有「significant improvements」, 举了识别缺失信息, 理清事件顺序, 丢弃无关帖子三个例子, 没有胜率, 样本数或任务分布, 可能承载数字的那张胜率图又恰好缺失. 成对偏好判断在后训练里也常拿来训练奖励模型 (见 [对齐技术](../../../../llm-guide/4-后训练/4.6-偏好优化/4.6-偏好优化.md)), 本页只说用于评测, 没说是否进了训练.

## 3. 八项基准逐行看: 一个第一, 四个第二

表里 9 列, 去掉 Grok-1.5 和 Grok-2 mini, Grok-2 要和 GPT-4 Turbo, Claude 3 Opus, Gemini Pro 1.5, Llama 3 405B, GPT-4o, Claude 3.5 Sonnet 六家比. 逐行排名: MathVista 69.0% 第 1, 比 Claude 3.5 Sonnet 的 67.7% 高 1.3 个点, 这一行 Llama 3 405B 是「-」. GPQA 56.0%, MMLU-Pro 75.5%, MATH 76.1%, DocVQA 93.6% 都是第 2, 分别落后第一名 3.6, 0.6, 0.5, 1.6 个点, 其中 MATH 的第一是 GPT-4o, 其余三行都是 Claude 3.5 Sonnet. MMMU 66.1% 第 3, 落后 GPT-4o 3.0 个点. MMLU 87.5% 和 HumanEval 88.4% 都是第 4, 落后最高分 1.2 和 3.6 个点. 正文用「competitive to other frontier models」来概括, 和这个分布相符.

正文对视觉的说法比表激进. 原句是 Grok-2 在 MathVista 和 DocVQA 上「delivering state-of-the-art performance」. MathVista 成立. DocVQA 不成立: 同一张表里 Claude 3.5 Sonnet 是 95.2%, 比 Grok-2 高 1.6 个点. 这是正文和自家表格之间的矛盾, 不需要任何外部数据. DocVQA 常用 ANLS 这类按编辑距离给部分分的指标, 和 MathVista 的选择题准确率口径不同, 两行不宜横比, 各基准的定义见 [VLM 的评测与基准](../../../../llm-guide/8-多模态/8.2-视觉语言模型/06-VLM的评测与基准/06-VLM的评测与基准.md).

Grok-2 mini 和 Grok-2 的差距: GPQA 5.0 个点, MMLU 1.3, MMLU-Pro 3.5, MATH 3.1, HumanEval 2.7, MMMU 2.9, MathVista 0.9, DocVQA 0.4. 差距最大在 GPQA, 两项视觉题几乎持平. 相对 Grok-1.5, Grok-2 的提升从 MMLU 的 6.2 个点到 MATH 的 25.5 个点不等, MMLU-Pro 提升 24.5, GPQA 提升 20.1; mini 的提升在 4.9 到 22.4 个点之间. 正文说 mini 在「speed and answer quality」之间取平衡, 但速度, 延迟, 价格和模型大小一个数字都没给, 这组差距只能读成小档在这些基准上比大档低多少, 折算不成性价比.

## 4. 表格口径: 借来的一列和没覆盖全的脚注

Grok-1.5 一列的三个视觉分数 MMMU 53.6%, MathVista 52.8%, DocVQA 85.6%, 和 [Grok-1.5V 公告](../grok-1-5v/grok-1-5v-bi.md) 里 Grok-1.5V 的三个数字完全相同. Grok-1.5 是 3 月 28 日发布的文本模型, 这三格填的其实是 Grok-1.5V 的分数, 表头没注明. 两篇的评测设置也不同: 1.5V 那篇写「zero-shot setting without chain-of-thought prompting」, 本表 ‡ 写 Grok-2 的 MMMU 和 MathVista 用 **0-shot CoT**. 因此 MMMU 12.5 个点, MathVista 16.2 个点的代际提升里混着加 CoT 带来的部分, 本页拆不开. Grok-1.5 列的 GPQA 35.9%, MMLU 81.3%, MATH 50.6%, HumanEval 74.1% 应出自 3 月 28 日的 Grok-1.5 公告, 本目录没有那篇原文, 核不了. CoT 提示对分数的影响, 通用讨论见 [Prompt 工程](../../../../llm-guide/7-LLM应用开发/7.1-Prompt工程/7.1-Prompt工程.md).

脚注只覆盖了一部分. ‡ 只管 Grok-2 的 MMLU, MMLU-Pro, MMMU, MathVista 四行, GPQA 和 DocVQA 用几 shot, 加不加 CoT, 都没写. MATH 标 **maj@1**, 也就是只采 1 个样本做多数投票, 等于单次采样准确率, 这个记号只说明没有用多样本投票; HumanEval 标 pass@1, 同样是单次. 两者都没写采样温度, pass@k 怎么依赖采样设置见 [评测科学与证据](../../../../llm-guide/5-评测、安全与治理/5.1-评测科学与证据/5.1-评测科学与证据.md). 对手一侧, * 说 GPT-4 Turbo 和 GPT-4o 的分数取自 2024 年 5 月的发布, † 说两家 Claude 取自 2024 年 6 月的发布; Claude 3 Opus 本身是 3 月的模型, 这里指的应是 6 月那次发布所附的对比表. 这些都是各家自报的分数, 和 Grok-2 的设置未必一致, 协议对齐的问题见 [通用基准](../../../../llm-guide/3-预训练/3.6-预训练评估/3.6.2-通用基准/3.6.2-通用基准.md).

Gemini Pro 1.5 和 Llama 3 405B 两列没有任何来源脚注. Gemini Pro 1.5 在本表的 MMMU 62.2%, MathVista 63.9%, DocVQA 93.1%, 和四个月前 Grok-1.5V 公告里同名模型的 58.5%, 52.1%, 86.5% 相差 3.7 到 11.8 个点, 两篇用的显然不是同一版 Gemini, 本页没写版本. Llama 3 405B 在 MathVista 一行是「-」, 页面没说是没测还是没报. 所以行内横比只能当作各自报告口径下的对比, 1 个点以内的差距 (MMLU-Pro 的 0.6, MATH 的 0.5, MathVista 上 mini 与 Grok-2 的 0.9) 不宜读成高下.

## 5. 产品与 API: 实时信息, FLUX.1 和对不上的时间表

𝕏 上的变化是新界面加两个模型, 面向 Premium 和 Premium+ 用户. Grok-2 被描述为有「text and vision understanding」, 并且「integrating real-time information from the 𝕏 platform」. 实时信息怎么接进来, 是检索后拼进上下文还是走工具调用, 页面没写; 这类做法的通用背景见 [RAG](../../../../llm-guide/7-LLM应用开发/7.2-RAG/7.2-RAG.md) 和 [工具使用与 MCP](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP/13.1.3-工具使用与MCP.md), 那不是 Grok-2 的实现说明. 图像生成来自合作方: xAI 在「experimenting with their **FLUX.1** model」, 截图里示例图也标着「Images are generated with FLUX.1 by Black Forest Labs」. 2024 年 8 月 Grok 在 𝕏 上能画图, 靠的是外部模型, xAI 自己的自回归图像生成模型到 12 月 9 日才发布.

两张截图各有问题. 𝕏 App 截图底部的新闻卡片是「ChatGPT Unveils GPT-4o Model · 2 hours ago」, 按本表脚注 GPT-4o 是 2024 年 5 月发布的, 截图要么是 5 月拍的界面, 要么是摆好的演示数据; 模型选择器上写的是「Grok 2 mini (beta)」, 和正文「Grok-2 mini」的写法不同. 梗图截图展示视觉理解: 用户上传一张博物馆里机器人指着人脑说「And that is the original processor!」的黑白插画, 让 Grok「Explain this meme」, 回答的右半边被裁掉, 只能读到零散片段. 这是单个样本, 没有成功率之类的统计.

企业 API 的承诺是「later this month」, 功能是多区域推理部署, 强制多因素认证, 流量统计, 账单分析和管理 API, 没有延迟, 区域数量, 限流或价格. 时间上, [xAI 新闻页](../xai/xai-bi.md) 在 8 月 13 日之后的下一条 API 新闻是 11 月 4 日的「API Public Beta」, 和「本月晚些时候」差了近三个月, 企业 API 是否在 8 月先小范围上线, 列表里查不到. 结尾「Soon, we will release a preview of multimodal understanding」也和前文有出入: 基准表已有三项视觉分数, 第 4 页也说 Grok-2 具备视觉理解, 较合理的读法是模型已有这项能力, 产品侧的正式开放还在后面. 多区域部署背后的服务框架, 通用背景见 [推理服务框架](../../../../llm-guide/9-AI工程化与基础设施/9.4-推理服务框架/9.4-推理服务框架.md).

## 6. 架构, 训练和算力: 本页没有

模型内部本页一个字都没有. Grok-2 和 Grok-2 mini 的参数量, 是稠密结构还是 MoE, 层数, 上下文长度, 视觉部分怎么接入, 训练数据和 token 数, 后训练方法, 全都没写. 同家族里 [Grok-1](../grok-1/grok-1-bi.md) 公开过 314B 参数的 MoE 结构, 新闻页记录 Grok-1.5 的上下文是 128,000 token, 这些都不能挪到 Grok-2 上, 公告没说 Grok-2 沿用了哪一代的设计. mini 的「small」也没有给尺寸, 从基准差距反推大小没有依据.

算力只有一句「advancing core reasoning capabilities with our new compute cluster」, 集群没有名字, 规模和上线时间. 页脚的 Colossus 链接属于 2026 年抓取时的网站模板, 不能倒推成这里说的集群; 后续 [Grok 3](../grok-3/grok-3-bi.md) 的材料也不应倒灌进这篇. 安全评测, 红队测试和使用限制页面同样没提, 唯一与「安全」沾边的是 API 的多因素认证, 那是账户安全, 不是模型安全.

## 7. 本页对不上的数字

第一类是正文和自家图表之间的出入. 正文说 Grok-2 在 DocVQA 上「state-of-the-art」, 表里 Claude 3.5 Sonnet 的 95.2% 高于 Grok-2 的 93.6%. 第 2 节「outperforms both Claude and GPT-4」按 Elo 图对两个 GPT-4o 条目不成立, 而且和 GPT-4o-2024-05-13 误差棒重叠. 「sus-columnr」和「sus-column-r」两种拼写并存. Grok-1.5 列的 MMMU, MathVista, DocVQA 三格实为 Grok-1.5V 的分数, 评测设置也从不用 CoT 换成了 0-shot CoT. 脚注没交代 Grok-2 在 GPQA, DocVQA 上的设置, 也没给 Gemini Pro 1.5, Llama 3 405B 的来源, 而 Gemini Pro 1.5 的三项视觉分数比 Grok-1.5V 公告里同名模型高 3.7 到 11.8 个点.

第二类是时间线和抓取带来的错位. 企业 API「later this month」对应的新闻页条目是 11 月 4 日; 「Soon」要发的多模态理解预览, 和当天已公布的视觉分数并存; 𝕏 截图里的 GPT-4o 新闻卡片指向 2024 年 5 月; 「Win Rate of Gr」对应的胜率图缺失, 内部评测没有任何数字; Black Forest Labs 的 logo 图顶着 API 小标题的文件名; 页脚「© 2026 SpaceXAI LLC」和 Build, Bot, Colossus 等入口都是 2026 年的站点模板. 表内数字彼此之间没有算术矛盾, Elo 分数全部是目测, 不作为精确值引用.
