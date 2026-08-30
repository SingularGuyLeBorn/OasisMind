---
title: Stanford CS329A Agent Skill：自我改进 Agent 课程实录
category: Agent Skill
published: true
excerpt: >-
  yusenthebot 将 Stanford CS329A《Self-Improving AI Agents》蒸馏为单一可安装 Agent
  Skill：一个入口路由 7 个 RIA++ 模块，覆盖闭环、测试时预算、Judge 审计、长程可逆性、轨迹回写、Deep Research
  与生产就绪评测。
tags:
  - Agent Skill
  - Stanford
  - CS329A
  - 自改进 Agent
  - 课程蒸馏
---
# Stanford CS329A Agent Skill：自改进 Agent 课程蒸馏

> **仓库**：[yusenthebot/stanford-ai-agent-skill](https://github.com/yusenthebot/stanford-ai-agent-skill)
> **已安装**：`config/skills/stanford-ai-agent-skill/`（触发 `/stanford-ai-agent-skill`；标签：**非常有用 / 必装**）
> **README**：[stanford-ai-agent-skill.md](../../uploads/github-readme/stanford-ai-agent-skill.md)
> **课程**：[Stanford CS329A](https://cs329a.stanford.edu/)（非官方社区资料，无学校背书）
> **蒸馏工具**：[kangarooking/cangjie-skill](https://github.com/kangarooking/cangjie-skill)

## 原文精读

### 产品形态

仓库**只有一个安装入口**：`skill/SKILL.md` 作为 Codex/Claude 兼容 Skill，用户用 `$stanford-ai-agent-skill` 或自然语言触发，Skill **按决策类型路由**到 7 个内部模块之一——用户无需记忆模块名。

目标用户：正在**设计、调试或评估 AI Agent** 的开发者。Skill 帮助回答：

- Agent 闭环缺什么？
- 推理预算该花在哪里？
- Verifier / LLM judge 是否可信？
- 长程任务如何回滚？
- 轨迹能否进 SFT/RL？
- Deep Research 如何补证据链？
- 系统能否上线？

### 两种用法（README 明示）

**1. 从零开发 Agent**

在空目录描述任务、技术栈、安全边界 → Skill 先定义最小 loop（goal/state/action/observation/verifier/stop condition）→ 再生成代码与 pytest。示例场景：Deep Research Agent（搜索→证据→带 cite 报告），约束轮次/token/成本，**关键主张无证据则 blocked 而非 completed**。

**2. 接手半成品 Agent**

先只读诊断：基于实际代码引用文件行号，定位 goal/state/action/observation/verifier/stop 缺口；**只选一个主模块**给最小改造方案；用户确认后再实现 + pytest + ruff。

分工：Skill 提供课程决策方法与边界；Codex 负责读写代码。

### 课程知识库结构

| 路径 | 内容 |
|---|---|
| `course/DIGEST.zh-CN.md` | 9 讲串成完整自改进逻辑 |
| `course/LECTURE_GUIDE.zh-CN.md` | 逐讲主题、时间点、学习顺序 |
| `skill/INDEX.md` | 模块关系与推荐阅读顺序 |
| `course/GLOSSARY.zh-CN.md` | pass@k、PRM、meta-verification 等术语 |
| `methodology/HOW_IT_WAS_BUILT.zh-CN.md` | 蒸馏方法论 |
| `methodology/EVIDENCE_AND_LIMITS.zh-CN.md` | 证据边界与局限 |

### 七个 RIA++ 内部模块

1. **可验证停止的 Agent 最小闭环**
2. **验证约束下的测试时预算分配**
3. **验证信号分层与 Judge 审计**
4. **依赖与可逆性驱动的长程执行控制**
5. **可验证轨迹的训练回写门**
6. **证据缺口驱动的检索与主张审计**（Deep Research）
7. **Agent 生产就绪度的多轴评测**

编号与 CS329A 讲座主题对齐，但打包成**按需加载**的执行模块而非线性 MOOC。

## 方法/架构解析

### 为何做成「单 Skill + 路由」

课程原始材料是 9 讲视频/阅读顺序；直接塞给 LLM 会 context 爆炸且缺执行契约。蒸馏策略：

- **SKILL.md = 路由层**：识别用户处于「新建 / 审计 / 训练回写 / 上线评测」哪类决策。
- **子模块 = 叶子 playbook**：每模块含检查清单、反模式、通过/阻断条件。
- **证据边界单独成文**：防止 Skill 把社区解读说成官方 syllabus。

这与 KnowPilot `config/skills/` 里「guidance + rubric + workflow 分包」思路同构；Polaris Skill marketplace 是产品级放大版。

### 与 CS329A 主题轴的映射（抽象）

```text
Agent 闭环 (Mod 1)
    → 测试时 compute / pass@k (Mod 2)
    → 谁来做 verifier、judge 可信吗 (Mod 3)
    → 长程状态与 rollback (Mod 4)
    → 轨迹能不能进训练 (Mod 5)
    → 检索与 claim 审计 (Mod 6)
    → 生产多轴 eval (Mod 7)
```

对应 RSI 文献里的 **bounded self-refinement vs open-ended RSI**：模块 1–4 偏部署期自改进；模块 5 接 post-training；模块 6–7 接 research agent / 上线闸门。

### 安装与调用

```bash
git clone https://github.com/yusenthebot/stanford-ai-agent-skill.git
cp -R stanford-ai-agent-skill/skill ~/.codex/skills/stanford-ai-agent-skill
```

MIT 许可；第三方归属见 `THIRD_PARTY_NOTICES.md`。

### 使用建议

- **审计现有 Agent（如见微 Chat）**：优先 Mod 1+3+4——stop condition 是否可验证、judge 是否 self-confirming、长程是否可逆。
- **准备 RSI 实验**：Mod 5+7 与 RSIBench-Data 的「数据研究是否可靠 progressive」问题直接相关。
- **Deep Research 功能**：Mod 6 提供 evidence gap 驱动的检索/checklist，可与 `video_transcript` / 文献工具链组合。

### 模块级速查（实施向）

| 模块 | 核心问题 | 典型交付 |
|---|---|---|
| 1 闭环 | stop 可验证吗？ | goal/state/action/observation/verifier 表 |
| 2 预算 | pass@k 预算花哪？ | 采样/分支/early-exit 策略 |
| 3 Judge | 谁评谁、元验证？ | verifier 分层、judge 审计清单 |
| 4 长程 | 依赖可逆吗？ | rollback 点、补偿事务 |
| 5 回写 | 轨迹能进训练吗？ | SFT/RL 门控、污染过滤 |
| 6 检索 | 主张有证据吗？ | cite 审计、gap-driven search |
| 7 上线 | 生产就绪？ | 多轴 eval、安全与成本 |

### 蒸馏方法论要点（EVIDENCE_AND_LIMITS）

仓库明示：Skill 内容来自公开课程材料与社区解读，**非官方 syllabus**；视频时间点与 reading 以 `LECTURE_GUIDE` 为准。对 AI 助手而言，这降低「把传闻当铁律」风险——与 KnowPilot `design-decisions.md` 的「产品默认须显式回答」纪律同频。

作为知识库条目，本 Skill 的价值在于把 CS329A 散落的「Verifier 分层、pass@k 预算、轨迹能否回写」收成**可执行 checklist**，而不是替代完整听课。建议与 RSIBench-Data（数据研究是否可靠 progressive）、ReOPD（蒸馏 prefix 设计）、LongHorizon-Harness（审计报告作唯一跨轮记忆）交叉阅读，形成「自改进 Agent 课程轴 + 2026 论文轴」的对照学习路径。

安装后可在 Codex 项目根用 `$stanford-ai-agent-skill` 触发；模块路由由 Skill 自行判断，无需手动指定 Mod 编号。非官方资料使用时请注明出处，避免在对外文档中引用为 Stanford 官方立场。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
