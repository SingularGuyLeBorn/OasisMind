---
title: "Step 5 Preview: 600B / 27B 稀疏旗舰的 Preview 产品页"
category: "模型库"
tags: ["StepFun", "技术解析"]
published: true
excerpt: "这篇通告要回答的产品问题很窄: Step 5 Preview 公开了哪几条旗舰规格; Coding 与长程案例讲了哪些可抄数字;"
---
# Step 5 Preview: 600B / 27B 稀疏旗舰的 Preview 产品页

> 公开材料是阶跃星辰官网落地页抓取 `step5-preview.md` (约 20 页, 28 图, 抓取戳 2026/9/25 11:43), 不是带式号的技术报告. 正文给出稀疏 MoE 口号 (600B 总参 / 每 Token 激活 27B / 1M 上下文 / 视觉输入), Coding / 长程 / 专业工作 / 金融案例, Artificial Analysis Intelligence Index 44 与 Pareto 成本主张, 以及末页对照表. 没有层宽, 专家池, 路由公式, 预训练 token 构成, 后训练课表或视觉编码器名. 架构细节页面没有写.
来源: 同目录 `step5-preview.md` (页标记 `page 1 of 20`–`page 20 of 20`). 对照译稿见 `step5-preview-bi.md`. 原文链接 https://www.stepfun.com/step-5-preview. 数字与型号名回源 md; 页 8 / 页 16 含 OCR 噪声, 以可恢复的中文句和英文标签为准, 不把乱码当规格.

这篇通告要回答的产品问题很窄: Step 5 Preview 公开了哪几条旗舰规格; Coding 与长程案例讲了哪些可抄数字; 金融侧自建 FinStepBench 与外评 FrontierFinance 怎么并列; 末表相对 GLM-5.3(Max) 与第三列对照的格内高低如何. 它撑不起稀疏拓扑说明书. MoE 一般讨论见 [MoE 总览](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md); Agent 总览见 [13-Agent](../../../../llm-guide/13-Agent/13-Agent.md); Coding Agent 入口见 [13.5.1-IDE与Coding-Agent](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md); 工具与 MCP 背景见 [13.1.3-工具使用与MCP](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP.md); 视觉输入的一般接口形状见 [8.2-视觉语言模型](../../../../llm-guide/8-多模态/8.2-视觉语言模型/8.2-视觉语言模型.md). 页 8–9 作业对象点名 MLA Kernel 时, 机制背景可对 [04-MLA-低秩潜变量与矩阵吸收](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md), 但通告没有声明 Step 5 自身注意力就是 MLA.

## 1. 定位与规格

### 1.1. 谱系位置: Preview 旗舰通告, 不是架构论文

页 1 标题把产品锚在 「智能效率」 与 「帕累托前沿」. 页 2 第一段完成身份声明: 面向真实世界 Agentic 任务的旗舰基座; 能力面点到 AI 编程, 软件工程, 专业知识工作, 并强调金融尤为突出. 同段给出全文几乎唯一的结构规格句: 稀疏 MoE, 总参数量 600B, 每个 Token 激活 27B, 1M Token 上下文, 视觉输入. URL 固定为 https://www.stepfun.com/step-5-preview.

**读法应落在 「Preview 产品页」.** 它把规格口号, 案例墙与榜单截图摊在同一站点, 不是带消融的技术报告. 同目录更早的 Step-1 / Step-2 通稿回答的是见面与万亿 MoE 正式版叙事; 报告回答的是 2026-09 这一档 Preview 对外怎么卖. 选型时合理动作是: 把 600B / 27B / 1M 记为公开口号, 把评测读表内格, 把案例读演示证据, 三套不要糊成 「已经公开完整训练配方」.

### 1.2. 规格口号: 600B, 27B, 1M, 视觉

**稀疏 MoE** 在通告里只出现一次完整规格句. 600B 是总参数量, 27B 是每个 Token 的激活参数, 1M 是上下文窗口上限, 视觉输入是并列能力标签. 总参决定 checkpoint 的体积和部署时要放下多少权重, 也是部署前 Scaling 的对象; 激活参决定每个 token 前向要算多少, 更接近推理成本. 二者之比约为 4.5% (27 / 600), 和同家族 Step 3.5 Flash 的 11 / 196 ≈ 5.6% 同一量级, 但这只是两个公开数字相除, **不能据此推出专家数或路由方式**. 本通告没有专家数, top-k, 共享专家, 负载均衡损失, 也没有说明 27B 是否含注意力等稠密部分.

1M 上下文与 「支持视觉输入」 同样停在能力菜单. 没有 YaRN / 插值协议, 没有针测分数, 没有视觉编码器或视频帧采样说明. 部署前把总参做到 600B 级, 与推理时再多花 TestingTime 预算, 是两件不同的事; 通告主叙事是产品效率与 Task Cost, 没有给出可复制的推理时算力表. 机制一般读法走上文 MoE 与 VLM 单独成篇, 不要把单独成篇拓扑安到 Step 5 头上.

## 2. 案例与评测

### 2.1. Coding 面: StepCodeBench 与案例墙

页 4–7 把 Coding 写成 「覆盖更广, 也能做得更深」: 软件工程, 前端与视觉开发, 可编程硬件, 以及可持续数小时的反馈迭代. 页 5 Room Planner 案例从卧室照片走到可编辑 3D 与第一人称参观, 工具链点名 Blender 与 Three.js. 页 6–7 给出自建 **StepCodeBench** Coverage: 553 独立代码仓库, 9 任务类别, 20 应用领域, 33 编程语言; 主分是 49.0% avg@4, 正文称 Bug 修复 / Feature 修改 / 重构相对突出, 但未转录分类型精确百分比.

页 4 另有两条评测脚注: GDPval-AA v2.1 采用 Artificial Analysis 截至 2026-09-20 的结果; DeepSWE v1.1 用 SWE-agent harness, temperature=1.0 and top_p=0.95. 同页 Intelligence Index 44, 并称相近智能水平下 Task Cost 更低, 配图标题 Advancing the Pareto Frontier. Task Cost 没有美元数进正文; DeepSWE 的采样设置也没有声明适用于全表. Coding Agent 的一般问题意识见 [13.5.1-IDE与Coding-Agent](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md); 这里只借用案例与自建榜分数.

### 2.2. 长程执行: Kernel, 后训练流水线, Pokémon

页 8–9 把长任务难点写成: 不只跑得久, 还要记住前结果, 理解新反馈, 决定下一步. 量化场景两个. 其一是 24 小时内在单张 NVIDIA H100 上从零优化 MLA GPU Kernel, 配置 Head Dimension 512, Batch Size 1, 64 Heads, 8,192 Tokens; 每模型独立跑 4 次取最佳, 约 22 小时后前向+反向合计 508 TFLOPS, 称本次对比最高. **MLA 在句中是 Kernel 作业对象, 不是 Step 5 自报骨干.**

其二是同给 24 小时, 通过自动化后训练提升 Qwen3-30B-A3B 在 AIME24 上的表现, 可调用接入生产数据的 API annotator. 结果模型官方测试集 60%, 相对后训练前 53.3% 提升, 称与 Claude Opus 5 持平但 annotator tokens 更少. 页 10–11 Bonus Case 转 Pokémon Red: 人类主线约 26 小时; 无专项优化下 Step 5 超过 3,000 Turns, 累计交互接近 600 万 Tokens, 第 3,082 步获第三枚道馆徽章, 主线约三分之一. **这是演示型长程叙事, 不进末页总表.** 长程 Agent 的记忆与工具问题见 [13.1.1-记忆系统](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.1-记忆系统.md) 与 [13.1.3-工具使用与MCP](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP.md); 通告只提供案例数字.

### 2.3. 专业工作与金融: 案例, FinStepBench, FrontierFinance

页 11–15 用工程 / 创意 / 制造 / 视频等工件墙展示 「专业工作」, 多数图注是 Click to view full artifact. 可抄的研究吞吐在气候案例: 1,000 地点, 25 年跨度, 一次 Agent Action 内 950 次 Web Fetch, 11 变量, 30 万条月度记录; 并称欧 / 大洋洲峰值月份落在一年中相反时段. 页 14–15 强调数据–计算–结论可追溯, 以及交互式报告把文字, 图, 表, 方法与支撑材料收成一页. 「一次 Agent Action」 没有运行时边界定义.

页 16–18 把金融写成重点专业场景. 可靠金融分析被拆成找可信信息, 正确用会计 / 估值 / 分析法, 让结论可复核; 并强调事实与假设分离, 计算可复现, 证据不足与敏感性要保留. 内评点名 **FinStepBench** - CorporateValuation, DeepResearch, 图题 LiveSearch; 外评 [FrontierFinance](https://samaya.ai/blog/frontier-finance) 写 6 类投资场景, 220 题, 11,543 项评估标准. 正文汇总 「这 4 项金融评测」 较强, 但未给出 A+B+C+D 的显式清单. 页 16 源文 OCR 缺字严重, 以金融上下文与页 17 的专名为准.

## 3. 材料边界: 末表能对什么, 不能对什么

页 18–20 给出更完整对照, 列 Step 5 Preview (High), GLM-5.3(Max), 以及表头 OCR 截断的第三列 (`Kim (Ma`). 推理与知识可抄: GPQA Diamond 93.5%, HLE 46.5%, AA-LCR v1.1 88.3%, CritPt 20.9%. Coding 可抄: DeepSWE v1.1 67.7%, Terminal-Bench v2.1 85.0%, Terminal-Bench v4 33.3% (同格 GLM 41.9%), ProgramBench 80.5%, StepCodeBench† 49.0% 等. Agent 表可抄: GDPval-AA v2.1 1566, τ³-Banking 42.5%, AutomationBench-AA 51.0%, AutomationBench (public) 44.0%, AA-Briefcase v1.1 1433, Toolathlon-Verified 74.1%, MCP-Atlas 85.6%, PresentBench 76.8%. **多格并非全胜 GLM**; Index 44 与分项表的合成关系页内未写.

它能稳定回答的很少: Preview 身份与 URL; 600B / 27B / 1M + 视觉的稀疏 MoE 口号; Index 44 与更低 Task Cost 主张; StepCodeBench 49.0% avg@4 与覆盖维; 长程三类案例的关键数字; 金融评测专名与 FrontierFinance 规模; 末表格内分数. 页数 20, 图数 28, 都在源 md 页标记与 `images/` 引用里可核对. 它不能回答的同样清楚: 专家拓扑与路由; 27B 具体包含哪些部分; 视觉栈; Index 权重; DeepSWE 采样是否全局; Pokémon / Room Planner 的对照协议; Claude Opus 5 配置; 第三列完整型号. 把 20 页产品通告读成完整架构论文, 会把案例墙和 Pareto 截图误当成可部署的稀疏规格书.
