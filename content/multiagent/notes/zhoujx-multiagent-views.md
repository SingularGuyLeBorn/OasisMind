---
title: "周星星《Agent 元年复盘》：架构之争已结束，Deep Agent 四件套与复杂度转移"
category: "架构观点"
published: true
excerpt: "一线开发者周星星 2025 年终复盘：Agent 架构之争已结束，收敛到以 Claude Agent SDK 与 LangGraph Deep Agent 为代表的「通用型 Agent」（超强 main-agent + 按需 sub-agent + 自主规划 + 文件系统）；复杂度没有消失，只是从流程编排转移到 Prompt 设计。全文拆解 Deep Agent 的定义（够垂 + Long-running）、四件套机制、Agent Skills 渐进式披露、分层工具调用与垂类化三招。"
tags: ["多Agent", "supervisor", "架构", "复杂度转移", "Agent Skills", "Deep Agent", "上下文工程"]
---
# 周星星《Agent 元年复盘》：架构之争已结束，Deep Agent 四件套与复杂度转移

> 整理自原文《Agent 元年复盘：从 Claude Code 到 Deep Agent，Agent 的架构之争已经结束》（周星星，知乎专栏，2025-12-14，已读完整全文）。
> 作者主页 [zhihu.com/people/zhoujx4](https://www.zhihu.com/people/zhoujx4)，专栏「AI 煎饼摊」；微信镜像见[同题文章](https://mp.weixin.qq.com/s/RB7uBO-QQtELCNfL_k8hIA)。

## 概述

周星星（星仔）以一线 Agent 开发者的视角，对「Agent 元年」2025 年的技术形态做了一次收敛性复盘。核心结论是：**Agent 的架构之争已经结束**——技术形态在 2025 年 10 月后收敛到以 Claude Agent SDK 与 LangGraph Deep Agent 为代表的「通用型 Agent」：超强 main-agent + 按需调用的 sub-agent，配自主规划、文件系统、上下文自动压缩与分层工具调用。文章同时给出「Deep Agent」的可操作定义（够垂 + Long-running）、Workflow 与 Agent 的本质区别（复杂度转移论）、Agent Skills 的渐进式披露机制，以及把通用 Agent 适配到垂直业务的「三招」。本文按原文结构完整拆解，并对关键概念补充横向对比。

## 一、2025 年的行业认知：技术已就绪，爆发在局部

- **验证过的成功**：Deep Research 与 Claude Code 已经完全融入日常工作流，是稳定可靠的生产力工具。
- **看不见的繁荣**：招聘、市场营销、医疗等垂直领域已出现大量百万美元营收的 Agent 产品，但因业务集中在出海方向，国内体感不强。
- **核心瓶颈的变化**：年中还在纠结技术架构，年末架构已趋统一，真正的挑战变成「业务重塑」——需要懂技术的一线从业者把传统 SOP 解构、把行业知识提炼出来，以 Agent 友好的方式沉淀为新工作流。

一个标志性案例：Claude Code 2025 年 3 月以「智能终端编程助手」推出，社区迅速把它用在整理知识库、辅助博客创作、项目管理上。「全球薅羊毛第一人」刘小排（200 美元套餐消耗 5 万美元 Token）断言「只要有 SOP，就没有 Claude Code 执行不了的任务」。Anthropic 2025 年 9 月把「Claude Code SDK」改名「Claude Agent SDK」，正是承认其 Plan 能力、上下文自动压缩、文件系统访问等机制不限于编程——**通用型 Agent 不是计划出来的，是社区演化出来的**。

## 二、什么是 Deep Agent

### 2.1 够「Deep」的两个特征

**特征一：够垂（行业性）**。Agent 的知识和能力必须源于该行业的深度实践与共识：业务定义的理想态（高级招聘专家定义的标准流程、评分标准）、过往案例积累（成功/失败的关键案例）、行业潜规则（猎头圈的价格默契、资源倾向）。

- 招聘 Agent 示例：输入一位 AI 芯片架构师的姓名，产出专业背景报告；衡量标准是逻辑严谨、信息全面、无重要遗漏与事实错误，达到高级招聘经理水准，让老板分不清人还是 AI。
- 市场营销 Agent 示例：输入产品信息与市场定位，筛选符合品牌调性的 KOL/KOC 并报价；衡量标准是名单与人工筛选高度重合（如 70%+），报价落在人工合理区间。
- 反例：如果输出和通用型工具（如 Manus）一样，就是不合格的。

**特征二：Long-running（稳定性）**。两个维度：长时间持续运行不崩溃（Claude 3.7 Sonnet 的「Claude Plays Pokemon」直播连续玩数小时）；连续保质保量执行多步骤任务、大量调用 Tools 和 APIs（「找一款 500 元大牌秋冬大衣，跨京东淘宝拼多多比价，综合评论推荐 3 件发到邮箱」可能涉及 50 次 tool/API 调用）。2025 年 11 月 Gemini 3 的「Plan anything」、12 月豆包手机的 GUI 点击操作，都是同一方向的佐证。

### 2.2 它是「Agent」：复杂度转移论

对 Agent 的定义：An LLM agent runs tools in a loop to achieve a goal。

Workflow 与 Agent 的本质区别是**复杂度的转移**：

| 维度 | Workflow | Agent |
|---|---|---|
| 业务逻辑形态 | 显式构建为「有向图」 | 抽象为自然语言 |
| 复杂度去向 | 流程编排 | Prompt 设计 |
| 确定性 | 高（稳定达标） | 低但上限高 |
| 业界调侃 | 做业务踏实用 | 拉投资讲故事 |

跳出形态之争，二者的核心逻辑一致：**都在实践 Test-Time Scaling Law**——通过良好的上下文工程让模型「合理」消耗更多 Token，换取解决更难题目的能力或更高准确率。原文设想一场算法比赛：给定复杂业务场景、5 个模型厂商 API、单次 20 万 Token 上限比拼准确率，100 个开发者会给出 100 种方案，路径本身充满多样性。

## 三、如何构建 Deep Agent

### 3.1 维度一：业务知识融入——Agent Skills（渐进式披露）

常见做法（融入 Prompt、企业知识库 RAG）都不够「丝滑」：前者僵化死板，后者要定义 Index、向量化、切分文档，笨重。Anthropic 2025 年 10 月提出的 **Agent Skills** 是优雅解法（参考官方 Blog《Equipping agents for the real world with Agent Skills》）。

Skill 本质是**多层级的文件系统**：一个目录 + SKILL.md（YAML Frontmatter 必填 name 和 description）+ 可选附属文件。核心设计原则是**渐进式披露（progressive disclosure）**的三级加载：

1. 技能元数据（name + description）→ 启动时预加载进 System Prompt，只给「刚好足够」的信息；
2. SKILL.md 全文 → 仅在模型判断相关时读入上下文；
3. 附属文件（如 forms.md、脚本）→ 仅在需要时发现并加载。

PDF 技能是官方例子：Claude 读 PDF 很强但直接填表受限，Skill 内捆绑 reference.md 与 forms.md，作者把填表指令单独放 forms.md，Claude 只在填表时才读取它。Skills 还可以打包 Python 脚本——代码确定性高，且不占用上下文；甚至能取代定义不佳的外部 MCP：把外部不可控变成自己掌控。

为什么好：分级加载带来更好的 Context 管理（告别一次性塞 Prompt 的暴力做法）；迫使工程师梳理业务逻辑（高内聚、低耦合抽象，人做高层抽象、AI 做具体事）；文件夹即复用单位（直接 Copy 给同事）；按需加载优于 50 个 tools 全塞 system prompt。

**落地「祛魅」**：Claude 模型能以约 98% 概率稳定触发 Skills；非 Claude 模型（豆包、DeepSeek 等）触发成功率可能只有 80% 甚至更低。但作者仍评价「Claude Skill 是 2025 年 AI 应用我认为的最佳工作」。

### 3.2 维度二：Long-Running——Deep Agent 四件套

LangGraph 的 Deep Agent 提出四种方法，四大支柱由**上下文工程**串联：

1. **Planning（规划）**：内置 write_todos 等工具，把复杂任务分解为离散步骤、跟踪进度、根据新信息调整计划；待办消息让模型保持焦点。
2. **Sub-Agents（子代理）**：任务拆分 + 上下文隔离。四大价值：子任务执行不污染主上下文、可并行、可配置专属工具与指令、只把高度综合的结果返回主代理（压缩上下文）。
3. **File System（文件系统）**：ls / read_file / write_file 等工具把大量上下文卸载到文件，防止窗口溢出；文件系统兼作所有代理协作的共享工作区；还能存储笔记充当「记忆」、存放可执行脚本或技能。
4. **System Prompt（系统提示）**：最优秀的 code CLI / deep research 拥有极复杂详细的提示，包含工具使用说明、few-shot 示例、数百上千行指令；通过细致提示把应用复杂性转移到提示本身。

### 3.3 Sub-Agents 已收敛到 supervisor 架构

关键收敛结论：**Sub-Agents 的架构已收敛到「超强 main-agent + 必要时按需调用 sub-agent」**（supervisor 模式）。这个架构还有个额外好处：**KV cache 能很好地复用，省钱 + 跑得快**。

### 3.4 Agent 技术形态的收敛证据

- 10 月前未收敛：Manus 从 3 月推出到 10 月**重构了五次架构**；LangChain 2025 年 10 月才上线 v1.0 并推出 DeepAgent。
- 10 月后已收敛：收敛到 Claude Agent SDK / Deep Agent 为代表的主从架构，具备自主规划、独立文件系统，以及两项未提及的关键机制：
  - **上下文自动压缩（Context Compression）**：Token 用量达到上限（如 200k）的 80% 时，自动调用总结模型对前文摘要压缩，释放空间。
  - **分层的工具调用**：一次性灌输超过 100 个工具会导致**上下文混淆（Context Confusion）**、引发幻觉或参数错误。Manus 等先进架构用三层分层设计缓解：

| 层级 | 核心思想 | 内容 | 目的 |
|---|---|---|---|
| 第 1 层 原子层 | 保留约 20 个核心、高频、正交的工具 | read file、edit file、browser_navigate、bash、ls、task 等 | 保证基础交互稳定可靠 |
| 第 2 层 沙箱工具层 | 去工具化：不逐个封装 Function Call，直接用 bash 调预装程序 | ffmpeg 等程序 + /help 探测命令 | 工具定义排除在 Context 之外，省 Token 降混淆 |
| 第 3 层 代码/包层 | 逻辑封装（Huggingface Smolagents 理念） | 提供 Python 库让 Agent 写动态脚本一次执行 | 复杂串行逻辑不用多次 LLM 往返 |

第 2 层用 FFmpeg 案例说明：传统模式要预定义 convert_video 等大量专用工具及其参数；Manus 模式只给 bash + 提示「没有合适工具时用 /help 探测」，LLM 自行执行 ffmpeg -i video.mov 完成。底层仍是**渐进式披露**思想。第 3 层案例：「查看每个国家换算成美元后的手机价格、找最便宜的国家」用 tool 可能要上百次调用，用代码循环只需十几行。

## 四、如何把通用 Agent 适配到垂直业务

1. **业务知识技能化（Skills via File System）**：把业务文档、SOP 抽象为 Skills 存进 Agent 文件系统，模型按需动态加载，而非一次性塞入。
2. **业务接口 MCP 化**：把企业业务 API 封装为 MCP Server，Agent 像连接外设一样按需调用。
3. **提示词精细化（Fine-grained System Prompts）**：分别针对 Main Agent（调度）与 Sub Agent（执行）编写极度详细的 System Prompt，约束行为边界。

**Workflow 升级为 Agent 的具体做法**：模仿 Claude Deep Research 的 prompt 架构——它只有三个 prompt：main agent（lead agent）、一个 subagent、一个处理引用信息的 agent。最重要就是 main/sub 结构；把复杂业务流程与决策逻辑通过详尽 System Prompt 沉淀进 Main Agent 认知体系。很多人不信这套，往往是因为没用到最 SOTA 的模型（claude4.5、gemini3、gpt5.2）；拿不到就用降级策略：在没那么复杂的业务上先尝试。

**对比传统微调**：SFT 动辄两周周期（数据清洗、人工标注、反复训练），Agent 模式跳过了最耗时的数据准备，把迭代周期从「周级」压缩到「天级」——本质是用 token 消耗换取效果快速迭代。作者判断 2026 年要多尝试这种开发姿势。

## 五、作者 2025 年探索脉络（备查）

2 月《25 年什么样的 Agent 会脱颖而出：简单胜于复杂》→ 4 月「端到端复现 Deep Research」三部曲 → 8 月《为什么我们需要 Context Engineering？》→ 期间紧跟 Anthropic 最佳实践（高效工具、有效上下文、通义 Deep Research 进化史、Skills、Sub Agent As Tool）。这条路径本身就是「简单胜于复杂 + 上下文工程 + 一线实践」的方法论样本。

## 来源

- [《Agent 元年复盘：从 Claude Code 到 Deep Agent，Agent 的架构之争已经结束》](https://zhuanlan.zhihu.com/p/1983512173549483912)（知乎原文，本文主体）— 2025-12-14
- [微信镜像：Agent 元年复盘](https://mp.weixin.qq.com/s/RB7uBO-QQtELCNfL_k8hIA) — 同题文章
- [Anthropic Blog: Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — Skills 渐进式披露机制出处
- [anthropics/skills 开源仓库](https://github.com/anthropics/skills) — 大量开源 skill 参考

## 相关

- [LongHorizon-Harness：把长任务执行重构成任务状态管理](../../longhorizon/notes/longhorizon-harness)（longhorizon 库）— supervisor 模式的学术化实现：manager 维护状态 + 子执行器 + 审计者