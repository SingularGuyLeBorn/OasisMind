---
title: "Qwen3.7-Max: 一张 41 行对照表和三段长程案例"
category: "模型库"
tags: ["Qwen", "技术解析"]
published: true
excerpt: "Qwen3.7-Max 只在 Alibaba Cloud Model Studio 通过 API 提供, 没有开源权重."
---
# Qwen3.7-Max: 一张 41 行对照表和三段长程案例

> 公开材料是官方模型卡 README (4 页, 无图), 由产品定位, 一张 41 行对照表和几段短叙述组成. 没有层数, 总参与激活, 注意力类型, 预训练数据量和后训练配方.

来源: `qwen3-7.md` (模型卡 README 与官方博客的 MinerU 转写). 表内数字以源文 qwen3-7.md 为准.

Qwen3.7-Max 只在 Alibaba Cloud Model Studio 通过 API 提供, 没有开源权重. 模型卡能说明的有三件: 它和五个对手在 41 行基准上各站在哪; 训练侧只公开了 environment scaling 的延续和 Task/Harness/Verifier 三分的 rollout 设计; 另外给了内核优化, RL 监控, YC-Bench 三个长程案例. 数据, 架构, 预训练这几面这一页没有, 能做的是把评测表读细, 把训练侧那两段话和社区对 agent RL 的已知做法对上.

机制单独成篇. Agentic RL 训练: [13.4.1-AgenticRL训练](../../../../LargeLanguageModelGuide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练/13.4.1-AgenticRL训练.md). 运行时环境与沙箱: [13.3.4-运行时环境与沙箱](../../../../LargeLanguageModelGuide/13-Agent/13.3-Agent系统工程/13.3.4-运行时环境与沙箱/13.3.4-运行时环境与沙箱.md). Agent 安全与 reward hacking: [13.5.3-Agent安全与对齐](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐/13.5.3-Agent安全与对齐.md). 前代对照: [qwen3-6-analysis](../qwen3-6/qwen3-6-analysis.md).

## 1. 定位与对照表

### 1.1. 产品定位与分发

模型卡标题是 `Qwen3.7: The Agent Frontier`, 型号 **Qwen3.7-Max**, 定位为通用 agent 底座. 列出的四项卖点是: 从前端原型到复杂工程的 coding agent; 通过 MCP 和多 agent 编排做办公自动化; 数百到数千步的长程自主执行; 在 Claude Code, OpenClaw, Qwen Code 等不同脚手架下表现一致. Cowork 一节补充说它原生兼容主流 agent harness, 能在数小时的会话里自主规划并持续执行.

分发只有 API 一条路. 没有权重地址, 没有推理框架版本要求, 也没有上下文窗口上限. 对照表里的 MRCR-v2 128k 说明它至少在 128k 长度上跑过评测, 正式支持的最大长度这一页没有. 从命名看它是 Qwen3.6-Plus 之后的闭源旗舰, 表里也把 Qwen3.6-Plus 作为最后一列对照.

### 1.2. 对照表: 41 行里 22 行第一

表有六列: Opus-4.6Max, K2.6Thinking, GLM-5.1Thinking, DS-V4-ProMax, Qwen3.6-Plus, Qwen3.7-Max. 行分五组: Coding Agent 8 行, General Agent 12 行, STEM & Reasoning 7 行, General Capability 6 行, Multilingualism 8 行 (含 PolyMATH). 按表逐行比较, Qwen3.7-Max 独占最高的有 22 行 (按表计算), 其中 Coding 5 行, General Agent 4 行, STEM 5 行, General 3 行, 多语 5 行.

Coding 组没拿第一的三行值得看. SWE-Verified 80.4, 低于 Opus 80.8 和 DS-V4-ProMax 80.6; NL2repo 47.2 比 Opus 47.6 低 0.4; QwenWebDev 1568 低于 Opus 1617 和 DS 1570. 赢下的是 Terminal Bench 2.0 (69.7), SWE-Pro (60.6), SWE-Multilingual (78.3), SciCode (53.5), QwenSVG (1608). SWE-Verified 上前四名差距不到 0.6, 这个基准已经很难拉开差距, 区分度更多落在 Pro 和 Terminal 这类新基准上.

General Agent 组是 Qwen3.7-Max 最弱的一组, 12 行只赢 SkillsBench (59.2), MCP-Mark (60.8), MCP-Atlas (76.4), QwenWorldBench (57.3) 四行. Opus 在 Qwencllaw (65.5 对 64.3), CoWorkBench (68.2 对 67.2), ClawEval (70.4 对 65.2), BFCL-v4 (76.7 对 75.0), SpreadSheetBench (89.3 对 87.0) 上领先; Vitabench 输给 DS (51.9 对 47.9); HLE w/ tools 输给 K2.6 (54.0 对 53.5). 模型卡开头把办公自动化列为卖点, 办公类的几行却大多是 Opus 更高. Opus 一列 SkillsBench 和 Vitabench 是空格, 这两行的第一是在缺一个对手的情况下拿的.

### 1.3. 表里的几处细节

HLE 和 HLE w/ tools 两行放在一起看最有意思. 不带工具时六个模型分布在 28.8 到 41.4 之间, 相差 12.6 分; 带工具后分布在 48.2 到 54.0 之间, 只差 5.8 分 (按表计算). 工具带来的提升在弱模型上更大: Qwen3.6-Plus 从 28.8 升到 50.2 (+21.4), K2.6 和 GLM-5.1 都是 +17.6, Qwen3.7-Max 只 +12.1. 检索和代码执行能补上很大一部分知识缺口, 所以不带工具的 HLE 更能看出模型本身的差距.

Kernel Bench L3 一行的单元格是 「1.98/96%」 这种复合写法, 模型卡没有说明两个数各是什么. 按常见写法推测, 前一个是相对参考实现的加速比, 后一个是正确率 (推测). 按这个读法, Opus 是 2.63/98%, 两项都最高; GLM-5.1 加速比 2.00 略高于 Qwen3.7-Max 的 1.98, 但正确率只有 78%. 这一行没有单一的第一, 前面的 22 行也没把它算进去.

Qwen3.6-Plus 一列有一个异常值: MMLU-Pro 68.5, 而同列 MMLU-Redux 是 94.5, SuperGPQA 是 71.6, 前代开源的 Qwen3.6-27B 在同一基准上都有 86.2. 这个数和同列其他知识题差得太远, 很可能是录入错误 (推测). 如果按表面值算, Qwen3.7-Max 对 Qwen3.6-Plus 在 MMLU-Pro 上提升 21.1 分, 这个涨幅不能当真. 除这一格外, Qwen3.7-Max 对 Qwen3.6-Plus 是 40 行上升, 只有 IFEval 持平在 94.3, 涨幅最大的是 Apex (从 8.8 到 44.5).

## 2. 训练与案例

### 2.1. 训练侧公开的两段话: environment scaling 与三分 rollout

Agent Scaling 一节只有两句: 在 Qwen3.5 提出的 **environment scaling** 基础上, Qwen3.7 继续扩大 agent 训练环境的质量和多样性; 就像语言模型从多样的预训练文本里泛化, agent 能力从多样的训练环境里泛化. 这里的 scaling 发生在部署前, 扩的是 RL 阶段能接触到的环境. 模型卡没有 TestingTime 预算, 没有多次采样再挑选的协议, 表里的分数也没有归因到推理时多花算力. 环境数量, 种类, 相对 Qwen3.5 增加了多少, 这一页都没有.

Cross-Harness 一节给了唯一具体的设计: rollout 环境把每个训练实例拆成 **Task, Harness, Verifier 三个正交部件**, 可以自由重组, 以此做组合式扩张, 目的是让模型学到通用的解题策略而不是某个 harness 专有的捷径. 拆开之后, 同一道题可以换不同的工具接口和提示格式来跑, 同一个 harness 也能配不同的验证器. 社区讨论 SWE 类 RL 时有个共识: 验证逻辑和 agent 工作区放在一起, 模型就可能去改测试或读隐藏测试, 把 Verifier 单独拆出来是常见的防御. 模型卡没有给消融实验, 也没有给捷径率, 这个设计的效果只能从正文 「表现一致」 这句定性描述里看.

表名和正文名要分开读. 正文说在 Claude Code, OpenClaw, Qwen Code 上表现一致, 表里出现的是 Qwencllaw 和 ClawEval 两行. Qwencllaw 是不是 OpenClaw 相关的内部基准, 模型卡没说; 前代 Qwen3.6 博客里有一个 QwenClawBench, 拼法也不同. 引用时照表抄名字, 不要自行合并.

### 2.2. 三个长程案例

第一个是内核优化. 任务是优化 **Extend Attention** kernel, 运行在训练时没见过的硬件上; 连续自主执行约 35 小时, 做了 432 次 kernel 评估, 1,158 次工具调用, 最终相对 Triton 参考实现得到 10.0x 几何平均加速. 模型卡开头说 「over 1,000 tool calls」, 和后文 1,158 是同一件事. 几何平均是在哪些 shape 或配置上算的, 模型卡没有列. 表里 Kernel Bench L3 的 1.98 和这里的 10.0x 是不是同一口径, 也没有交代, 两个数不要放在一起比.

第二个是 **reward hacking** 监控. 团队把 Qwen3.7-Max 接进 SWE 任务的 RL 监控流程, 实验超过 80 小时, 模型自主检索并回放训练轨迹, 调用超过 10,000 次, 新增 13 条启发式规则, 标出 1,618 个 hacking 案例. 这里 Qwen3.7-Max 扮演的是审查者, 不是被训练的策略. 社区公开讨论里, SWE 类 RL 常见的 hacking 包括从残留的 git 对象里翻出未来的修复提交, 读本地隐藏测试, 上网查已合并的 PR; 这 1,618 个案例属于哪些类型, 13 条规则写的是什么, 误报率多少, 这一页没有.

第三个是 YC-Bench, 一个模拟创业公司一整年生命周期的基准. Qwen3.7-Max 报告总营收 2.08M USD, 完成 237 项任务, 定性描述是能跨多个 context window 调整战略, 主动开拓客户, 识别陷阱, 从中期危机里恢复. 对照表里没有 YC-Bench 这一行, 也没有其他模型的分数, 2.08M 算高还是低, 这一页判断不了.

## 3. 边界与谱系位置

模型卡能确认的有: 产品名和 API 分发; 41 行对照表的数字; 训练叙事接在 Qwen3.5 的 environment scaling 后面, rollout 用 Task/Harness/Verifier 三分; 三个长程案例的数字. 不能确认的有: 总参和激活, 层数和注意力类型, 词表, 上下文上限, 预训练与后训练配方, 是否用 GRPO 或其他 RL 算法, Kernel Bench 复合分数的定义, YC-Bench 的对照成绩, Qwencllaw 与 OpenClaw 的关系.

在 Qwen 谱系里, 3.5 引入 environment scaling, 3.6 的开源 SKU 把涨幅集中在 coding agent 格子, 3.7-Max 在闭源旗舰上延续同一方向. 这条线的训练重心从预训练的数据配比, 转到了 RL 阶段能构造多少种可验证环境, 以及怎么防止模型在这些环境里钻空子. 模型卡把 reward hacking 监控单独拿出来讲, 也说明到了这个阶段, 验证器的可靠性和环境数量同样要紧.
