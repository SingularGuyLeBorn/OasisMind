---
title: "Agent 课程收口审计台账"
date: 2026-09-01
updated: 2026-09-01
published: false
---

# Agent 课程收口审计台账

本目录记录 2026-09-01 对 `13-Agent/**` 与旧 `7.3-Agent` 的逐页审计、事实修复和未来编号映射。它是隐藏来源台账，不参与公开课程导航。

## 1. 审计范围与结论

完整阅读 25 个 `13-Agent` Markdown 和旧 `7.3-Agent.md`，共 26 页。结论：

- 11 页已经具备证据边界、自然标题和可靠工程结构，仅做整体验证或保留；
- 14 页含 P1 级无来源指标、错误类比、产品推断、二手来源或概念混淆，已经重写；
- 旧 `7.3-Agent.md` 是约 1000 行的公开平行教程，存在重复、低质类比、模拟数字和不安全示例，已缩成兼容入口；
- ReAct、工具契约和失败恢复的独立价值已经合并进 Agent 正本，不保留第二套正文；
- 公开课程不再使用 Mermaid；本轮没有新增视觉。

## 2. 逐页审计记录

| 页面 | 审计结论 | 本轮处理 |
|---|---|---|
| `13-Agent.md` | A：定义清楚，已区分模型提议、宿主执行、MCP、轨迹和验证 | 保留，作为合并后的 7.3 首页正本 |
| `13.1-Agent核心组件.md` | A：七类组件、状态转移和最小循环边界可靠 | 保留 |
| `13.1.1-记忆系统.md` | A：生命周期、来源、遗忘和评测可靠 | 保留 |
| `13.1.2-记忆压缩.md` | A：原始事件/摘要/索引分层和压缩评测可靠 | 保留 |
| `13.1.3-工具使用与MCP.md` | A：明确模型提议/宿主执行/MCP 协议；授权不由 MCP 自动解决 | 保留 |
| `13.1.4-工具调用演进.md` | P1：虚构三代替代关系；错误声称 Function Calling 无状态、MCP 必有会话；重复章节；把 Think Tool 当 Skill 前身与内部推理可见性证明；仅引用知乎 | 全文重写为模型工具调用、MCP、Agent Skills 三层组合；补官方规范 |
| `13.1.5-结构化输出.md` | A：语法、schema、业务、授权、执行五层可靠 | 保留 |
| `13.2-Agent认知架构.md` | P1：未经来源的 12%→89%；o1-like 推断；把 Lyapunov 直接写成 Agent 收敛工具 | 重写为逐步行动、计划执行、候选搜索三类架构与消融评测 |
| `13.2.1-Agent与控制论.md` | P1：把 ReAct 等同 PID、Self-Consistency 等同平均 Lyapunov、ICL 等同自适应控制；误用 Shannon 公式；虚构集体 IQ 相变、成本与 80% 节省 | 全文重写；控制论仅作接口语言，明确无稳定性证明，落地为有界性、幂等、恢复和状态一致性 |
| `13.2.2-推理与规划.md` | P1：“神奇咒语/激活内部推理”“极大提升”等绝对化；公开思维链被当审计要求；过时年龄例；Mermaid；执行器“安全映射”未含授权 | 全文重写；融合 ReAct 独立价值、结构化计划、有限搜索、失败恢复、并行边界与隐私边界 |
| `13.2.3-反思与自我修正.md` | A：Reflexion/Self-Refine/CRITIC/Self-RAG 区分清楚；外部反馈与停止条件可靠 | 保留 |
| `13.3-Agent系统工程.md` | P1：虚构 OpenHands/MetaGPT 指标并跨基准归因；“多 Agent 成为必然选择” | 重写为任务、状态、决策、执行、验证、观测六平面 |
| `13.3.1-设计模式与实现.md` | P1：大量无来源成功率和成本；把 Assistants API 定性为 Plan-and-Execute；推断闭源产品架构；Toolformer 公式不符论文；不安全文本正则执行示例 | 全文重写为工作流到可恢复闭环；加入状态机、重试矩阵、检查点、取消和消融 |
| `13.3.2-上下文管理策略.md` | P1：无有效来源；把缓存、上下文、长期记忆混用；宣称固定收益；产品炒作 | 全文重写为选择、卸载、检索、压缩、隔离、缓存六策略 |
| `13.3.3-多Agent系统.md` | P1：虚构业务指标、成本、吞吐、一次通过率；把语言投票类比 Raft/PBFT；错误的“专业化必然降低成本”；不可运行示例 | 全文重写；强调分工条件、交接契约、共享状态、提交权、故障模型和同预算单 Agent 基线 |
| `13.3.4-运行时环境与沙箱.md` | A：威胁模型、容器/gVisor/MicroVM/WASI 边界和网络/凭据控制可靠 | 保留 |
| `13.4-Agent训练与进化.md` | P1：把 o1、DeepSeek-R1 直接称为 Agentic RL；虚构环境调度占比和固定训练流水线 | 重写训练对象、披露模板和风险地图 |
| `13.4.1-AgenticRL训练.md` | A：推理 RL 与交互 RL、R1/Kimi/DAPO/OSWorld 边界清楚 | 保留 |
| `13.4.2-Tool-integrated-Reasoning-RL.md` | P1：仅引用二手知乎；SimpleTIR 日期写成 2025-07（实际 arXiv 首次提交 2025-09-02）；Memento 名称/论文身份混乱；多项细节无一手来源 | 全文重写为 Search-R1、ToRL、OTC、RAGEN、rStar2、SimpleTIR、Memento 的证据表和训练环境方法 |
| `13.4.3-Off-policyness与Privileged-Information.md` | P1：把 SFT 写成不稳定极端、on-policy RL 写成最稳定；SDFT/SDPO 无来源；用 pass@k 差距诊断 off-policy 无依据 | 全文重写；定义当前/行为/教师策略，补 DAgger、PPO、InstructGPT 与 PI Distillation 一手来源 |
| `13.4.4-基座模型的Agentic能力.md` | P1：以 GLM-5/MiniMax 二手文章推导统一训练配方；未披露数据规模和阶段；把安全、记忆与模型能力混为一谈 | 全文重写为模型、harness、环境和记忆的能力归因框架 |
| `13.5-Agent应用与治理.md` | P1：错误产品时间线、无来源迁移速度和固定 API 成本、不可阻挡等营销断言 | 重写为能力、权限、可靠性、评测和治理入口 |
| `13.5.1-IDE与Coding-Agent.md` | A：按官方文档列功能，拒绝市场/性能排名，权限与评测边界可靠 | 保留 |
| `13.5.2-Benchmark与Eval.md` | A：区分模型、harness、环境、版本和 evaluator；SWE-bench/WebArena/OSWorld/GAIA 事实边界可靠 | 保留 |
| `13.5.3-Agent安全与对齐.md` | P1：风险“指数放大”无依据；攻击树/HITL Mermaid；危险 exfiltration 命令；过度依赖输入清洗；开源护栏产品描述缺版本；对齐训练与硬授权混淆 | 全文重写为信任边界、硬控制、最小权限、沙箱、记忆/供应链、安全评测和事故响应 |
| 旧 `7.3-Agent.md` | P1：约 1000 行平行教程；“LLM 文本囚徒/升维/操作系统”等长类比；错误声称 CoT 不执行算术；把 ReAct 自由思维链当透明审计；模拟 72%/98%；不安全 `eval`、字符哈希记忆、无 schema/授权执行 | 改成稳定兼容入口；所有教学指向唯一正本 |

评级含义：A = 可保留；P1 = 会误导关键技术判断、事实身份或安全边界，必须在公开课程修正。

## 3. 从旧 7.3 融合进正本的内容

### 3.1 ReAct

保留并强化的核心不是“公开大声说出思考”，而是：**环境观察进入下一次动作决策**。已写入：

- `13-Agent.md`：闭环总定义和可观察轨迹；
- `13.2.2-推理与规划.md`：ReAct 的生产化改造、隐私与审计边界；
- `13.3.1-设计模式与实现.md`：结构化动作、宿主验证和停止状态机。

### 3.2 工具契约

旧 7.3 的 `name / description / schema / execute` 四元组有教学价值，但原文把模型决定与执行安全混在一起。正本扩展为：

- 工具输入、输出、错误、副作用、幂等、超时、权限和敏感数据；
- 模型只提出调用；宿主负责结构、业务、授权、执行和验证；
- MCP 负责互操作，不负责认证和安全结论。

对应页面：`13.1.3`、`13.1.4`、`13.1.5`。

### 3.3 失败恢复

旧 7.3 的格式/类型/语义分层、最大步数和重复动作检测值得保留，但“常见重试 2–3 次”和模拟延迟没有证据。正本改为按错误类型处理：

- 模式错误有限重新生成；
- 业务错误刷新状态；
- 权限拒绝停止或请求批准；
- 瞬时错误有限退避；
- 副作用未知先查幂等操作状态；
- 无进展回退、换策略或人工升级。

对应页面：`13.2.2`、`13.3.1`。

## 4. 从公开正文移除的内容

- “Function Calling → MCP → Skill”相互替代的三代神话；
- OpenClaw、Devin、Claude、DeepResearch 等未公开内部架构推断；
- 所有无方法说明的准确率、成本、延迟、吞吐和提升百分比；
- Agent 与 PID、Lyapunov、Shannon、负熵、集体 IQ 相变的伪数学等同；
- 把多模型投票写成 Raft/PBFT 共识；
- 把自由文本思维链写成必须公开的审计证据；
- `eval(expression)`、字符串正则解析动作和无授权执行等不安全教学代码；
- Mermaid 攻击树、流程图和重复装饰图。

这些内容不保留为公开历史教程；本台账只记录其问题类别，避免未来回迁。

## 5. 一手来源账本

| 主题 | 一手来源 |
|---|---|
| ReAct | https://arxiv.org/abs/2210.03629 |
| Tree of Thoughts | https://arxiv.org/abs/2305.10601 |
| Reflexion | https://arxiv.org/abs/2303.11366 |
| Toolformer | https://arxiv.org/abs/2302.04761 |
| Agent Skills | https://agentskills.io/specification |
| MCP | https://modelcontextprotocol.io/specification/2026-07-28/ |
| AutoGen | https://arxiv.org/abs/2308.08155 |
| MetaGPT | https://arxiv.org/abs/2308.00352 |
| SWE-agent | https://arxiv.org/abs/2405.15793 |
| Search-R1 | https://arxiv.org/abs/2503.09516 |
| ToRL | https://arxiv.org/abs/2503.23383 |
| OTC | https://arxiv.org/abs/2504.14870 |
| RAGEN | https://arxiv.org/abs/2504.20073 |
| rStar2-Agent | https://arxiv.org/abs/2508.20722 |
| SimpleTIR | https://arxiv.org/abs/2509.02479 |
| Memento | https://arxiv.org/abs/2508.16153 |
| PI Distillation / OPSD | https://arxiv.org/abs/2602.04942 |
| NIST AI RMF | https://www.nist.gov/itl/ai-risk-management-framework |
| NIST AML taxonomy | https://csrc.nist.gov/pubs/ai/100/2/e2025/final |
| ToolEmu | https://arxiv.org/abs/2309.15817 |

## 6. 建议的继承编号映射

目录合并目标建议为：`7-LLM应用开发/7.3-Agent系统/`。目录与同名首页可以共享 `7.3`，其余最多到第四教学层级。

| 当前 | 合并后 |
|---|---|
| `13-Agent/13-Agent.md` | `7.3-Agent系统/7.3-Agent系统.md` |
| `13.1-Agent核心组件/13.1-Agent核心组件.md` | `7.3-Agent系统/7.3.1-Agent核心组件/7.3.1-Agent核心组件.md` |
| `13.1.1`–`13.1.5` | `7.3.1.1`–`7.3.1.5` |
| `13.2-Agent认知架构/13.2-Agent认知架构.md` | `7.3-Agent系统/7.3.2-Agent决策架构/7.3.2-Agent决策架构.md` |
| `13.2.1`–`13.2.3` | `7.3.2.1`–`7.3.2.3` |
| `13.3-Agent系统工程/13.3-Agent系统工程.md` | `7.3-Agent系统/7.3.3-Agent系统工程/7.3.3-Agent系统工程.md` |
| `13.3.1`–`13.3.4` | `7.3.3.1`–`7.3.3.4` |
| `13.4-Agent训练与进化/13.4-Agent训练与进化.md` | `7.3-Agent系统/7.3.4-Agent训练/7.3.4-Agent训练.md` |
| `13.4.1`–`13.4.4` | `7.3.4.1`–`7.3.4.4` |
| `13.5-Agent应用与治理/13.5-Agent应用与治理.md` | `7.3-Agent系统/7.3.5-Agent应用与治理/7.3.5-Agent应用与治理.md` |
| `13.5.1`–`13.5.3` | `7.3.5.1`–`7.3.5.3` |

旧 `7.3-Agent/7.3-Agent.md` 不应与正本并存。执行目录移动时，以 `13-Agent.md` 的内容成为 `7.3-Agent系统.md`；旧兼容入口可移入隐藏归档或只在旧 URL 机制需要时保留轻量重定向，不能继续作为公开第二份正文。

## 7. 合并后验收

- 公共导航只有一个 Agent 课程入口；
- 不再出现 `13-Agent` 作为公开章节编号；
- 所有内部相对链接跟随新路径更新；
- H1 和 frontmatter 标题保持自然语言，不把文件编号写进标题；
- 目录层级不深于 `7.3.1.1` 类型的四层编号；
- 课程正文无 Mermaid、控制字符、无效本地链接和 `published:false` 公共占位页；
- 隐藏 `_sources/agent-curriculum/` 保留事实审计与迁移台账。
