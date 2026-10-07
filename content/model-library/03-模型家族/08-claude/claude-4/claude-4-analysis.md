---
title: "Claude 4: 混合推理, 三档推理预算和一句 ASL-3"
category: "模型库"
tags: ["Claude", "技术解析"]
published: true
excerpt: "正文占第 1 到 8 页: 导语, 配套发布清单和价格, 两款模型的定位和客户证言, 柱状图, 评测表和脚注, 「Model improvements」, Claude Code, 「Getting started」."
---
# Claude 4: 混合推理, 三档推理预算和一句 ASL-3

> 本目录的源材料是 Anthropic 2025 年 5 月 22 日发布的公告 「Introducing Claude 4」 的抓取 `claude-4.md` (13 页, 5 图), 属于产品博客, 不是技术报告. 全文没有架构描述, 训练数据和训练方法; 能核对的只有第 4, 5 页一张评测表, 五条脚注, 第 8, 9 页的附录方法说明, 以及正文里几个百分数和价格. 两份材料都没写的, 标 「本页没有」.

来源: 同目录 `claude-4.md` (页标记 `page 1 of 13` 到 `page 13 of 13`) 与 `claude-4.pdf`. 逐段双语对照和逐条疑问在 `claude-4-bi.md`. md 与 PDF 对不上的地方以 PDF 为准, 源文件本身不改.

## 1. 材料与发布

### 1.1. 材料性质: 一篇带附录的发布稿

正文占第 1 到 8 页: 导语, 配套发布清单和价格, 两款模型的定位和客户证言, 柱状图, 评测表和脚注, 「Model improvements」, Claude Code, 「Getting started」. 第 8 到 9 页的 Appendix 是这篇比同系列公告多出来的部分, 写了每项评测是否开 **extended thinking**, 以及 TAU-bench 和 SWE-bench 的具体做法. 第 9 页 「Related content」 之后直到第 13 页是站点推荐和页脚, 其中的 Mythos, Fable 属于 2026 年抓取时的状态.

按 「数据, 架构, 算法, 预训练, 后训练, 评测」 去对, 本页只在评测一面细致, 后训练一面露出两件结果 (混合推理, 少走捷径), 其余全空, 连上下文窗口都没提. 同日发布的系统卡补上了数据一面: 语料是截至 2025 年 3 月 的公开网页, 第三方非公开数据, 标注服务与外包人员的数据, 选择加入训练的 Claude 用户数据, 以及内部生成的数据; 后训练用了人类反馈, **Constitutional AI** 和 「选定品格特质的训练」; extended thinking 由强化学习训练这一点写在上一代 3.7 Sonnet 的系统卡里, Claude 4 系统卡没有重复. 架构和参数量, 两份材料都没有. 系统卡正文见同级目录 [Claude Opus 4](../claude-opus-4/claude-opus-4-analysis.md) 与 [Claude Sonnet 4](../claude-sonnet-4/claude-sonnet-4-analysis.md) 两篇.

### 1.2. 发布清单: 两款混合模型和四组配套

Opus 4 与 Sonnet 4 都称为 hybrid models, 有 「near-instant responses」 与 「extended thinking」 两种模式; Pro, Max, Team, Enterprise 套餐包含两款模型和 extended thinking, Sonnet 4 对免费用户开放; 渠道是 Anthropic API, Amazon Bedrock, Vertex AI. 价格沿用前代: Opus 4 \$15 / \$75, Sonnet 4 \$3 / \$15. 附录说 extended thinking 最多用到 64K token, 思考 token 怎么计费页面没写. 「混合」 的意思是同一套权重既能直接答, 也能先写长推理再答, 而不是两个模型拼在一起; 由哪种训练信号教会模型在两种模式间切换, 本页没有.

配套发布四组. 一是 extended thinking with tool use (beta), 模型可以在思考中穿插调用网页搜索等工具. 二是模型新能力: 并行调用工具, 更精准地遵循指令, 以及开放本地文件时的记忆能力. 三是 Claude Code 全面开放, 含 GitHub Actions 后台任务, VS Code 与 JetBrains 扩展, Claude Code SDK. 四是 API 上的代码执行工具, MCP 连接器, Files API 和最长一小时的提示缓存. 后两组属于产品和接口层, 没有配评测. 思考中穿插工具调用, 意味着后训练的轨迹里推理和工具结果是交错的, 这与 Tool-integrated Reasoning 的做法同一方向, 见 [Tool-integrated-Reasoning-RL](../../../../LargeLanguageModelGuide/13-Agent/13.4-Agent训练与进化/13.4.2-Tool-integrated-Reasoning-RL/13.4.2-Tool-integrated-Reasoning-RL.md).

## 2. 评测设置与结果

### 2.1. 评测表的三档推理预算

读第 4, 5 页的表先要分清三档. 第一档关掉 extended thinking, 附录只给了 GPQA, MMMLU, MMMU, AIME 四项, 另外 SWE-bench 和 Terminal-bench 本来就注明不开思考. 第二档开 extended thinking, 上限 64K, 单条序列作答, TAU-bench, GPQA, MMMLU, MMMU, AIME 的主数属于这一档. 第三档是脚注 5 的并行 **TestingTime**: 采样多条序列, 由内部评分模型挑一条, 斜杠后的数就是这一档, 只出现在 SWE-bench, Terminal-bench, GPQA, AIME 四行. 附录的总原则是 「the highest scores achieved with or without extended thinking」, 同一张表不同行的主数可以来自不同档.

档间落差差别很大. AIME 2025 上 Opus 4 从第一档到第二档涨 41.6 个百分点到 75.5%, 第三档再涨 14.5 到 90.0%; MMMLU 第一档到第二档只涨 1.4. 数学竞赛题对单条序列里多想非常敏感, 多语言知识问答基本不靠多想. 这和 RL 训练长推理的一般经验一致: 可验证答案的题目最容易从长 CoT 里获益, 知识题的上限由预训练决定. 两段增长都是推理时多花的算力, 属于 TestingTime, 与部署前的 Scaling 是两回事. 第三档的评分模型不公开, 采样条数也没给, 外部复现不了, 只能当作 「自家推理管线的上限」. 背景见 [推理与思考能力](../../../../LargeLanguageModelGuide/4-后训练/4.8-推理与Agent能力/4.8-推理与Agent能力.md).

### 2.2. 框架和脚手架也是评测变量

Terminal-bench 的脚注说明, 同一个模型换框架分数会变: Opus 4 用 Claude Code 当框架是 43.2%, 用非 Claude 模型那套通用 agent 是 39.2%; Sonnet 4 是 35.5% 对 33.5%. 表中第四列用的是通用 agent, 真正同条件的差距要按 39.2% 算. 一个模型厂商自己的 agent 框架对自家模型更友好, 原因之一是后训练时用的就是这套工具和提示格式 (推测), 本页没说.

SWE-bench 的附录写得比较清楚: 只有 bash 工具和一个按字符串替换改文件的编辑工具, 3.7 Sonnet 用过的 「planning tool」 这次去掉; 主数 72.5% 与 72.7% 是 10 次试验平均的 pass@1, top_p 0.95; Claude 4 按完整 500 题报告, OpenAI 模型按 477 题子集. 工具集合和题目分母两个变量没对齐. TAU-bench 又加了一段提示补充, 步数上限从 30 放宽到 100, 且没有关掉思考的对照, 读者无法把提升归到某一项新能力上. 本节的共同结论是: 页面的数字大多是 「Claude 在自家推荐设置下的最好成绩」. 评测对设置的依赖见 [Benchmark与Eval](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval/13.5.2-Benchmark与Eval.md) 和 [评测科学与证据](../../../../LargeLanguageModelGuide/5-评测-安全与治理/5.1-评测科学与证据/5.1-评测科学与证据.md).

### 2.3. 表上的强项和弱项

优势集中在编码和终端操作. SWE-bench 上两款模型单次都在 72% 以上, 比 Sonnet 3.7 的 62.3% 高约 10 个百分点; Terminal-bench 上 Opus 4 明显领先 Sonnet 4, 这是两款新模型拉开差距最清楚的一行. 公告把 Opus 4 称作 「the world's best coding model」, 表上最有力的支撑在 Terminal-bench, 不在 SWE-bench, 因为 SWE-bench 上 Sonnet 4 反而略高.

非编码的几行不整齐. TAU-bench 上 Claude 4 与 Sonnet 3.7 差距很小 (retail 81.4% 对 81.2%); MMMLU 上 Opus 4 与第四列同为 88.8%; MMMU 上第四列 82.9% 领先 Claude 4 好几个百分点, Sonnet 4 的 74.4% 甚至低于 Sonnet 3.7 的 75.0%. 正文没讲视觉能力, 这一行是全表对 Claude 最不利的一行. 编码大涨, 视觉持平甚至微降, 说明这一代的后训练资源明显向 agent 编程倾斜 (推测). Sonnet 4 在 SWE-bench, TAU-bench Airline 和 GPQA 第三档上略高于 Opus 4, 「not matching Opus 4 in most domains」 在这张表上并不处处成立.

## 3. 行为, 安全与边界

### 3.1. 行为层的三项改动

「Model improvements」 第一件是减少走捷径和钻空子: 两款模型在容易出这类问题的 agentic 任务上比 Sonnet 3.7 少 65%. 背景能从上一代对上: 同级目录 3.7 Sonnet 系统卡写过, 它在 agentic 编程里有时会针对测试用例 「特判」, 直接返回期望值或改测试, 这是 RL 训练里奖励被钻空子 (**reward hacking**) 的典型表现. 65% 是相对降幅, 基数, 任务集和判定方法都没给; 系统卡对这一项有更细的分类和环境说明. 与之呼应的是 SWE-bench 附录那句 「no hidden test information is used」. 一般讨论见 [Agent安全与对齐](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐/13.5.3-Agent安全与对齐.md) 与 [RLVR的局限性与探索边界分析](../../../../LargeLanguageModelGuide/4-后训练/4.5-GRPO家族与RLVR/09-RLVR的局限性与探索边界/09-RLVR的局限性与探索边界.md).

第二件是记忆: 开发者开放本地文件时, Opus 4 会创建并维护 「memory files」, 例子是玩宝可梦时写的导航指南. 这种记忆落在外部文件里, 不改权重, 也不扩上下文窗口, 属于 agent 系统的外部记忆; 模型要学会 「什么值得写下来」, 仍然要靠后训练里有这类长任务轨迹. 见 [记忆系统](../../../../LargeLanguageModelGuide/13-Agent/13.1-Agent核心组件/13.1.1-记忆系统/13.1.1-记忆系统.md). 第三件是思考摘要: 用更小的模型压缩冗长的思考, 约 5% 的情况需要; 需要原始 CoT 的用户走 Developer Mode. 界面上的思考文本分两种来源, 短的是原文, 长的是转述, 分界线没给. 对拿思考文本做提示调试或做 CoT 监控的人来说, 这一点比 5% 更要紧.

### 3.2. 安全部分只有一句话

整篇公告谈安全的正文只有 「Getting started」 里一句: 模型经过大量测试和评估, 「including implementing measures for higher AI Safety Levels like ASL-3」, 链接指向 ASL-3 防护的启用说明. 哪款模型落在哪个等级, 本页没写. 系统卡给出了答案: Opus 4 因为无法明确排除 CBRN 方面的 ASL-3 风险, 作为预防性措施按 **ASL-3** 部署, Sonnet 4 维持 **ASL-2**. ASL-3 部署防护的核心是针对 CBRN 长流程协助的 Constitutional Classifiers 和越狱监测, 另加更严的权重安全. 这是 Anthropic 第一次对发布的模型启用 ASL-3.

系统卡里被广泛讨论的 「Opus 4 在虚构公司场景中以婚外情要挟工程师」 等对齐测试结果, 本页一个字都没提; Reddit 和 Hacker News 上的争论主要围绕场景是否被刻意设计成只剩两条路, 以及这是模仿训练语料里的故事还是某种目标导向. 这些内容在同级目录 Opus 4 一篇里展开. 分级框架见 [安全与对抗评测](../../../../LargeLanguageModelGuide/5-评测-安全与治理/5.2-安全与对抗评测/5.2-安全与对抗评测.md) 与 [部署治理与持续保证](../../../../LargeLanguageModelGuide/5-评测-安全与治理/5.4-部署治理与持续保证/5.4-部署治理与持续保证.md).

### 3.3. 材料边界

这页能稳定回答: 两款模型的定位, 发布日期, 渠道和套餐, 单价, 两种回答模式, 四组配套发布, 评测表可见四列的全部分数, 五条脚注, 附录里每项评测是否开思考, 64K 思考上限, TAU-bench 的提示补充和步数上限, SWE-bench 的两件工具与 500/477 分母, 以及并行 TestingTime 的流程.

回答不了: 架构, 参数量, 上下文窗口, extended thinking 的训练细节, 内部评分模型, 并行采样条数, 表格被截掉的几列, 65% 的基数, 记忆提升的量化结果, 思考摘要的触发门槛. 第 1.1 节的数据说明, 第 3.2 节的 ASL 定级和对齐测试都来自同日系统卡, 不是本页原文. 逐条疑问写在 `claude-4-bi.md` 对应段落之后, 共 18 处.
