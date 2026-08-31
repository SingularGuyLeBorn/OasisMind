---
title: RSI 路径迁移清单
as_of: 2026-09-01
category: 内部维护
tags: [migration, manifest, rsi]
published: false
excerpt: HEAD 中 127 篇旧 Markdown 的逐文件迁移 ledger，以及图片目录聚合映射。
---

# RSI 路径迁移清单

本清单以结构迁移前 HEAD 中的 **127 篇 Markdown** 为闭集。每个旧 Markdown 恰好一行；多个旧入口允许指向同一正本。`删除空壳` 表示删除字节重复或纯迁移告示副本，并明确指出存续正本。

## Markdown 逐文件 ledger

| 旧路径 | 新正本或唯一归档路径 | 动作 | 理由 |
|---|---|---|---|
| `_garden.md` | `_garden.md` | 重写 | 总导航从旧 0–6 结构改为 00–10，并加入证据等级、跨库边界与阅读路径。 |
| `0-导读/0-导读.md` | `00-导读与证据规则/00-导读与证据规则.md` | 重写 | 导读扩展为证据规则首页；旧历史与判定内容融合进唯一正本。 |
| `1-坐标系与术语/1-坐标系与术语.md` | `01-研究框架与术语/01-研究框架与术语.md` | 重写 | 旧章首页改写为术语、三层、学习信号、综述与资源五条阅读轴。 |
| `1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md` | `01-研究框架与术语/1.1-RSI-术语辨析/1.1-RSI-术语辨析.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md` | `01-研究框架与术语/1.2-Model-Harness-Artifact/1.2-Model-Harness-Artifact.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `1-坐标系与术语/03-三层框架笔记/03-三层框架笔记.md` | `_archive/superseded-navigation/三层框架笔记-三层框架笔记/三层框架笔记-三层框架笔记.md` | 归档 | 与 1.2 正本高度重复；保留唯一历史归档，不进入公开导航。 |
| `1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md` | `01-研究框架与术语/1.3-模仿学习与RLVR/1.3-模仿学习与RLVR.md` | 重写 | 迁至 1.3，并将标题收紧为能力归因争议；明确 RLVR 不等于 RSI。 |
| `1-坐标系与术语/05-自进化Agent综述/05-自进化Agent综述.md` | `01-研究框架与术语/1.4-自进化Agent综述/1.4-自进化Agent综述.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `1-坐标系与术语/06-资源清单/06-资源清单.md` | `01-研究框架与术语/1.5-资源与阅读路径/1.5-资源与阅读路径.md` | 融合 | 资源清单升格为 1.5 分组首页，吸收课程入口与阅读顺序。 |
| `2-Model层-训练时自改进/2-Model层-训练时自改进.md` | `02-模型自改进与自训练/02-模型自改进与自训练.md` | 重写 | 旧模型章按自生成数据、自奖励和递归解题重写；工具训练移至第 06 章。 |
| `2-Model层-训练时自改进/01-SPIN-自对弈微调/01-SPIN-自对弈微调.md` | `02-模型自改进与自训练/2.1-自生成数据与自奖励/2.1.1-SPIN-自对弈微调/2.1.1-SPIN-自对弈微调.md` | 重写 | 迁至 2.1.1；修正 SPIN 为 arXiv v3（2024-06-14）与 ICML 2024，并规范来源。 |
| `2-Model层-训练时自改进/02-Self-Rewarding-家族/02-Self-Rewarding-家族.md` | `02-模型自改进与自训练/2.1-自生成数据与自奖励/2.1.2-Self-Rewarding-家族/2.1.2-Self-Rewarding-家族.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md` | `02-模型自改进与自训练/2.1-自生成数据与自奖励/2.1.3-Tufa-Labs-自奖励/2.1.3-Tufa-Labs-自奖励.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md` | `02-模型自改进与自训练/2.2-自适应与递归解题/2.2.1-SEAL-自适配语言模型/2.2.1-SEAL-自适配语言模型.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/05-LADDER-递归拆题/05-LADDER-递归拆题.md` | `02-模型自改进与自训练/2.2-自适应与递归解题/2.2.2-LADDER-递归拆题/2.2.2-LADDER-递归拆题.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md` | `02-模型自改进与自训练/2.2-自适应与递归解题/2.2.3-Absolute-Zero-Reasoner/2.2.3-Absolute-Zero-Reasoner.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/07-R-Zero-挑战者解题器/07-R-Zero-挑战者解题器.md` | `02-模型自改进与自训练/2.2-自适应与递归解题/2.2.4-R-Zero-挑战者解题器/2.2.4-R-Zero-挑战者解题器.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md` | `06-工具学习与程序编排/6.1-工具使用训练/6.1.1-ReTool-代码解释器RL/6.1.1-ReTool-代码解释器RL.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md` | `06-工具学习与程序编排/6.1-工具使用训练/6.1.2-ToolRL-多工具奖励设计/6.1.2-ToolRL-多工具奖励设计.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md` | `06-工具学习与程序编排/6.1-工具使用训练/6.1.3-ToRL-从基座做工具RL/6.1.3-ToRL-从基座做工具RL.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md` | `06-工具学习与程序编排/6.1-工具使用训练/6.1.4-Gorilla-API调用微调/6.1.4-Gorilla-API调用微调.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md` | `06-工具学习与程序编排/6.1-工具使用训练/6.1.5-ToolLLM-RapidAPI轨迹SFT/6.1.5-ToolLLM-RapidAPI轨迹SFT.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md` | `06-工具学习与程序编排/6.1-工具使用训练/6.1.6-Toolformer-自监督插工具调用/6.1.6-Toolformer-自监督插工具调用.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/3-Harness层-Agent运行时.md` | `_archive/superseded-navigation/3-Harness层-Agent运行时.md` | 归档 | 58 项平铺旧首页被 04–09 主题首页取代；旧导航仅保留归档。 |
| `3-Harness层-Agent运行时/01-Argus-Verification-Gated/01-Argus-Verification-Gated.md` | `09-自动研究与科学发现/9.1-自改代码与元智能体/9.1.1-Argus-Verification-Gated/9.1.1-Argus-Verification-Gated.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/02-Karpathy-Auto-Research/02-Karpathy-Auto-Research.md` | `09-自动研究与科学发现/9.1-自改代码与元智能体/9.1.2-Karpathy-Auto-Research/9.1.2-Karpathy-Auto-Research.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/03-CS329A-Skill入口/03-CS329A-Skill入口.md` | `01-研究框架与术语/1.5-资源与阅读路径/1.5.1-CS329A-Skill入口/1.5.1-CS329A-Skill入口.md` | 重写 | 迁至 1.5.1；拆清 Stanford 官方课程与第三方非官方 Skill 蒸馏归属。 |
| `3-Harness层-Agent运行时/04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md` | `09-自动研究与科学发现/9.1-自改代码与元智能体/9.1.3-DGM-达尔文哥德尔机/9.1.3-DGM-达尔文哥德尔机.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/05-STOP-自教优化器/05-STOP-自教优化器.md` | `09-自动研究与科学发现/9.1-自改代码与元智能体/9.1.4-STOP-自教优化器/9.1.4-STOP-自教优化器.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md` | `09-自动研究与科学发现/9.1-自改代码与元智能体/9.1.5-Godel-Agent-自指运行时/9.1.5-Godel-Agent-自指运行时.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md` | `09-自动研究与科学发现/9.1-自改代码与元智能体/9.1.6-ADAS-Meta-Agent-Search/9.1.6-ADAS-Meta-Agent-Search.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/08-SkillEvolver-元技能/08-SkillEvolver-元技能.md` | `07-记忆技能与经验/7.1-技能与跨任务经验/7.1.1-SkillEvolver-元技能/7.1.1-SkillEvolver-元技能.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md` | `07-记忆技能与经验/7.1-技能与跨任务经验/7.1.2-ACE-Agentic-Context-Engineering/7.1.2-ACE-Agentic-Context-Engineering.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md` | `07-记忆技能与经验/7.1-技能与跨任务经验/7.1.3-Voyager-Minecraft技能库/7.1.3-Voyager-Minecraft技能库.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md` | `07-记忆技能与经验/7.1-技能与跨任务经验/7.1.4-Reflexion-言语反思记忆/7.1.4-Reflexion-言语反思记忆.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md` | `04-反思批评与反馈优化/4.1-Self-Refine-任务内迭代/4.1-Self-Refine-任务内迭代.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md` | `04-反思批评与反馈优化/4.2-CRITIC-工具交互批评/4.2-CRITIC-工具交互批评.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/14-TextGrad-文本梯度/14-TextGrad-文本梯度.md` | `04-反思批评与反馈优化/4.3-TextGrad-文本梯度/4.3-TextGrad-文本梯度.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/15-GEPA-遗传Pareto提示/15-GEPA-遗传Pareto提示.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.1-GEPA-遗传Pareto提示/5.1.1-GEPA-遗传Pareto提示.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/16-Promptbreeder-自我指涉提示进化/16-Promptbreeder-自我指涉提示进化.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.2-Promptbreeder-自我指涉提示进化/5.1.2-Promptbreeder-自我指涉提示进化.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/17-OPRO-元提示优化/17-OPRO-元提示优化.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.3-OPRO-元提示优化/5.1.3-OPRO-元提示优化.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/18-EvoPrompt-进化算子提示/18-EvoPrompt-进化算子提示.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.4-EvoPrompt-进化算子提示/5.1.4-EvoPrompt-进化算子提示.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/19-APE-自动提示工程师/19-APE-自动提示工程师.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.5-APE-自动提示工程师/5.1.5-APE-自动提示工程师.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/20-MIPROv2-贝叶斯联合优化/20-MIPROv2-贝叶斯联合优化.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.6-MIPROv2-贝叶斯联合优化/5.1.6-MIPROv2-贝叶斯联合优化.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/21-ProTeGi-文本梯度束搜索/21-ProTeGi-文本梯度束搜索.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.7-ProTeGi-文本梯度束搜索/5.1.7-ProTeGi-文本梯度束搜索.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.8-GrIPS-短语级编辑搜索/5.1.8-GrIPS-短语级编辑搜索.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.9-TEMPERA-测试时提示编辑/5.1.9-TEMPERA-测试时提示编辑.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/24-RLPrompt-离散提示强化学习/24-RLPrompt-离散提示强化学习.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.10-RLPrompt-离散提示强化学习/5.1.10-RLPrompt-离散提示强化学习.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/25-AutoPrompt-梯度引导触发词/25-AutoPrompt-梯度引导触发词.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.11-AutoPrompt-梯度引导触发词/5.1.11-AutoPrompt-梯度引导触发词.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/26-PromptAgent-MCTS提示规划/26-PromptAgent-MCTS提示规划.md` | `05-搜索规划与提示优化/5.1-提示与上下文优化/5.1.12-PromptAgent-MCTS提示规划/5.1.12-PromptAgent-MCTS提示规划.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/27-ToT-本题推理树/27-ToT-本题推理树.md` | `05-搜索规划与提示优化/5.2-推理搜索与规划/5.2.1-ToT-本题推理树/5.2.1-ToT-本题推理树.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/28-LATS-Agent树搜/28-LATS-Agent树搜.md` | `05-搜索规划与提示优化/5.2-推理搜索与规划/5.2.2-LATS-Agent树搜/5.2.2-LATS-Agent树搜.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md` | `05-搜索规划与提示优化/5.2-推理搜索与规划/5.2.3-ReAct-推理与动作/5.2.3-ReAct-推理与动作.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/30-RAP-世界模型规划/30-RAP-世界模型规划.md` | `05-搜索规划与提示优化/5.2-推理搜索与规划/5.2.4-RAP-世界模型规划/5.2.4-RAP-世界模型规划.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/31-GoT-思维图聚合/31-GoT-思维图聚合.md` | `05-搜索规划与提示优化/5.2-推理搜索与规划/5.2.5-GoT-思维图聚合/5.2.5-GoT-思维图聚合.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/32-ExpeL-跨题经验洞察/32-ExpeL-跨题经验洞察.md` | `07-记忆技能与经验/7.1-技能与跨任务经验/7.1.5-ExpeL-跨题经验洞察/7.1.5-ExpeL-跨题经验洞察.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/33-Dynamic-Cheatsheet-测试时备忘录/33-Dynamic-Cheatsheet-测试时备忘录.md` | `07-记忆技能与经验/7.1-技能与跨任务经验/7.1.6-Dynamic-Cheatsheet-测试时备忘录/7.1.6-Dynamic-Cheatsheet-测试时备忘录.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/34-BoT-思维模板缓冲/34-BoT-思维模板缓冲.md` | `07-记忆技能与经验/7.1-技能与跨任务经验/7.1.7-BoT-思维模板缓冲/7.1.7-BoT-思维模板缓冲.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/35-AWM-工作流记忆/35-AWM-工作流记忆.md` | `07-记忆技能与经验/7.1-技能与跨任务经验/7.1.8-AWM-工作流记忆/7.1.8-AWM-工作流记忆.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md` | `07-记忆技能与经验/7.2-持久记忆与检索/7.2.1-MemGPT-操作系统式记忆/7.2.1-MemGPT-操作系统式记忆.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md` | `07-记忆技能与经验/7.2-持久记忆与检索/7.2.2-A-Mem-卡片盒记忆/7.2.2-A-Mem-卡片盒记忆.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/38-HippoRAG-海马索引检索/38-HippoRAG-海马索引检索.md` | `07-记忆技能与经验/7.2-持久记忆与检索/7.2.3-HippoRAG-海马索引检索/7.2.3-HippoRAG-海马索引检索.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md` | `07-记忆技能与经验/7.2-持久记忆与检索/7.2.4-ChatDB-符号SQL记忆/7.2.4-ChatDB-符号SQL记忆.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/40-MemoryBank-遗忘曲线记忆/40-MemoryBank-遗忘曲线记忆.md` | `07-记忆技能与经验/7.2-持久记忆与检索/7.2.5-MemoryBank-遗忘曲线记忆/7.2.5-MemoryBank-遗忘曲线记忆.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/41-ReadAgent-gist分页记忆/41-ReadAgent-gist分页记忆.md` | `07-记忆技能与经验/7.2-持久记忆与检索/7.2.6-ReadAgent-gist分页记忆/7.2.6-ReadAgent-gist分页记忆.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md` | `06-工具学习与程序编排/6.2-工具创建与文档优化/6.2.1-LATM-函数缓存造工具/6.2.1-LATM-函数缓存造工具.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md` | `08-多智能体协作与工作流/8.1-工作流搜索与优化/8.1.1-AFlow-工作流MCTS/8.1.1-AFlow-工作流MCTS.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md` | `08-多智能体协作与工作流/8.2-多智能体拓扑与协作/8.2.1-GPTSwarm-通信图边概率/8.2.1-GPTSwarm-通信图边概率.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md` | `08-多智能体协作与工作流/8.1-工作流搜索与优化/8.1.2-ScoreFlow-Score-DPO工作流/8.1.2-ScoreFlow-Score-DPO工作流.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md` | `08-多智能体协作与工作流/8.1-工作流搜索与优化/8.1.3-MASS-提示拓扑分阶段/8.1.3-MASS-提示拓扑分阶段.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md` | `08-多智能体协作与工作流/8.1-工作流搜索与优化/8.1.4-AutoFlow-自然语言工作流RL/8.1.4-AutoFlow-自然语言工作流RL.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/48-MAS-GPT-一次前向吐MAS/48-MAS-GPT-一次前向吐MAS.md` | `08-多智能体协作与工作流/8.2-多智能体拓扑与协作/8.2.2-MAS-GPT-一次前向吐MAS/8.2.2-MAS-GPT-一次前向吐MAS.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/49-G-Designer-任务自适应通信图/49-G-Designer-任务自适应通信图.md` | `08-多智能体协作与工作流/8.2-多智能体拓扑与协作/8.2.3-G-Designer-任务自适应通信图/8.2.3-G-Designer-任务自适应通信图.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/50-AgentPrune-时空图剪边/50-AgentPrune-时空图剪边.md` | `08-多智能体协作与工作流/8.2-多智能体拓扑与协作/8.2.4-AgentPrune-时空图剪边/8.2.4-AgentPrune-时空图剪边.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/51-MaAS-Agent超网/51-MaAS-Agent超网.md` | `08-多智能体协作与工作流/8.2-多智能体拓扑与协作/8.2.5-MaAS-Agent超网/8.2.5-MaAS-Agent超网.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/52-ANN-层状文本反传/52-ANN-层状文本反传.md` | `08-多智能体协作与工作流/8.2-多智能体拓扑与协作/8.2.6-ANN-层状文本反传/8.2.6-ANN-层状文本反传.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md` | `06-工具学习与程序编排/6.2-工具创建与文档优化/6.2.2-EASYTOOL-工具文档改写成指令/6.2.2-EASYTOOL-工具文档改写成指令.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md` | `06-工具学习与程序编排/6.3-模块与程序编排/6.3.1-HuggingGPT-ChatGPT调度HF专家/6.3.1-HuggingGPT-ChatGPT调度HF专家.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md` | `06-工具学习与程序编排/6.3-模块与程序编排/6.3.2-RestGPT-粗到细调REST/6.3.2-RestGPT-粗到细调REST.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md` | `06-工具学习与程序编排/6.3-模块与程序编排/6.3.3-Chameleon-离线组合推理/6.3.3-Chameleon-离线组合推理.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/57-ViperGPT-Python执行视觉推理/57-ViperGPT-Python执行视觉推理.md` | `06-工具学习与程序编排/6.3-模块与程序编排/6.3.4-ViperGPT-Python执行视觉推理/6.3.4-ViperGPT-Python执行视觉推理.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `3-Harness层-Agent运行时/58-VisProg-示范写出模块程序/58-VisProg-示范写出模块程序.md` | `06-工具学习与程序编排/6.3-模块与程序编排/6.3.5-VisProg-示范写出模块程序/6.3.5-VisProg-示范写出模块程序.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `4-Artifact层-产物发现/4-Artifact层-产物发现.md` | `_archive/superseded-navigation/4-Artifact层-产物发现.md` | 归档 | 旧 Artifact 首页被 9.2 自动研究与 9.3 产物搜索分组首页取代。 |
| `4-Artifact层-产物发现/01-Polaris-科研智能体/01-Polaris-科研智能体.md` | `09-自动研究与科学发现/9.2-自动研究系统/9.2.1-Polaris-科研智能体/9.2.1-Polaris-科研智能体.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `4-Artifact层-产物发现/04-FunSearch-函数空间搜索/04-FunSearch-函数空间搜索.md` | `09-自动研究与科学发现/9.3-科学发现与产物搜索/9.3.3-FunSearch-函数空间搜索/9.3.3-FunSearch-函数空间搜索.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `4-Artifact层-产物发现/03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md` | `09-自动研究与科学发现/9.3-科学发现与产物搜索/9.3.2-AlphaEvolve-进化编码智能体/9.3.2-AlphaEvolve-进化编码智能体.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `4-Artifact层-产物发现/02-MirroS-Physical-RSI/02-MirroS-Physical-RSI.md` | `09-自动研究与科学发现/9.3-科学发现与产物搜索/9.3.1-MirroS-Physical-RSI/9.3.1-MirroS-Physical-RSI.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `5-实验室与公司/5-实验室与公司.md` | `_archive/superseded-navigation/5-实验室与公司.md` | 归档 | 公司与动态不再作为公开章节；官方研究材料按主题进入 03/09，旧首页归档。 |
| `5-实验室与公司/01-RSI公司-田渊栋/01-RSI公司-田渊栋.md` | `_archive/industry-claims/01-RSI公司-田渊栋/01-RSI公司-田渊栋.md` | 归档 | 融资、估值与人员材料缺少稳定一手底座，退出公开证据树。 |
| `5-实验室与公司/02-田渊栋访谈/02-田渊栋访谈.md` | `_archive/industry-claims/02-田渊栋访谈/02-田渊栋访谈.md` | 归档 | 访谈转述与机制事实混合，保留唯一归档，不作公开结论。 |
| `5-实验室与公司/05-OpenAI-GPT-Red/05-OpenAI-GPT-Red.md` | `_archive/industry-claims/05-OpenAI-GPT-Red/05-OpenAI-GPT-Red.md` | 归档 | 旧页混入时间线与二手材料；归档后另以 OpenAI 官方论文新写 10.5。 |
| `5-实验室与公司/06-实验室动态/06-实验室动态.md` | `_archive/industry-claims/06-实验室动态/06-实验室动态.md` | 归档 | 跨机构新闻流缺少逐条稳定一手来源，退出公开导航。 |
| `5-实验室与公司/07-全谱系地图/07-全谱系地图.md` | `_archive/industry-claims/07-全谱系地图/07-全谱系地图.md` | 归档 | 与新总导航和主题首页重复，且数字口径已漂移。 |
| `5-实验室与公司/08-2026-08行业速览/08-2026-08行业速览.md` | `_archive/industry-claims/08-2026-08行业速览/08-2026-08行业速览.md` | 归档 | 时间敏感二手速览不作为机制证据，保留归档。 |
| `5-实验室与公司/03-Anthropic-When-AI-Builds-Itself/03-Anthropic-When-AI-Builds-Itself.md` | `09-自动研究与科学发现/9.2-自动研究系统/9.2.2-Anthropic-When-AI-Builds-Itself/9.2.2-Anthropic-When-AI-Builds-Itself.md` | 直接迁移 | 官方研究材料按自动研究主题迁至 9.2.2，并保留事实/推测边界。 |
| `5-实验室与公司/04-Automated-W2S-Researcher/04-Automated-W2S-Researcher.md` | `03-可扩展监督与过程监督/3.2-Automated-W2S-Researcher/3.2-Automated-W2S-Researcher.md` | 重写 | 迁至 3.2；删除社区提示转述与二手兜底，仅保留 Anthropic 官方实验边界。 |
| `6-评测与安全/6-评测与安全.md` | `_archive/superseded-navigation/6-评测与安全.md` | 归档 | 旧首页由第 10 章同名首页重写取代；旧导航只保留历史归档。 |
| `6-评测与安全/01-RSIBench-Data/01-RSIBench-Data.md` | `10-评测与安全边界/10.1-RSIBench-Data/10.1-RSIBench-Data.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md` | `10-评测与安全边界/10.3-可靠性与独立监督/10.3-可靠性与独立监督.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `6-评测与安全/03-SEAGym-Harness评测环境/03-SEAGym-Harness评测环境.md` | `10-评测与安全边界/10.2-SEAGym-Harness评测环境/10.2-SEAGym-Harness评测环境.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `6-评测与安全/04-System-Card-RSI/04-System-Card-RSI.md` | `10-评测与安全边界/10.4-System-Card-RSI/10.4-System-Card-RSI.md` | 直接迁移 | 按主题归位并采用继承编号；正文保留，元数据、标题与站内链接随路径规范化。 |
| `chapter-structure-plan.md` | `_meta/structure-plan.md` | 直接迁移 | 内部结构规则移出公开根，保留为维护文档。 |
| `notes/_migrated.md` | `_meta/migration-log.md` | 融合 | 9 行迁移告示并入持续维护的迁移日志，删除公开 notes 入口。 |
| `.trash/notes/anth-automated-w2s-researcher.md` | `_archive/legacy-notes/anth-automated-w2s-researcher.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/anth-when-ai-builds-itself.md` | `_archive/legacy-notes/anth-when-ai-builds-itself.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/argus-agentic-runtime.md` | `_archive/legacy-notes/argus-agentic-runtime.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/arxiv-survey-self-evolving-agents.md` | `_archive/legacy-notes/arxiv-survey-self-evolving-agents.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/awesome-self-evolving-agents-list.md` | `_archive/legacy-notes/awesome-self-evolving-agents-list.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/imitation-not-rlvr.md` | `_archive/legacy-notes/imitation-not-rlvr.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/karpathy-auto-research.md` | `_archive/legacy-notes/karpathy-auto-research.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/labs-dynamics.md` | `_archive/legacy-notes/labs-dynamics.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/mirros-physical-rsi.md` | `_archive/legacy-notes/mirros-physical-rsi.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/polaris-research-agent.md` | `_archive/legacy-notes/polaris-research-agent.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/recursive-superintelligence-company.md` | `_archive/legacy-notes/recursive-superintelligence-company.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/rsi-landscape.md` | `_archive/legacy-notes/rsi-landscape.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/rsi-safety-reliability.md` | `_archive/legacy-notes/rsi-safety-reliability.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/rsi-terminology-clarified.md` | `_archive/legacy-notes/rsi-terminology-clarified.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/rsibench-data.md` | `_archive/legacy-notes/rsibench-data.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/self-evolving-agents-taxonomy.md` | `_archive/legacy-notes/self-evolving-agents-taxonomy.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/self-rewarding-family.md` | `_archive/legacy-notes/self-rewarding-family.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/spin-self-play.md` | `_archive/legacy-notes/spin-self-play.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/stanford-cs329a-agent-skill.md` | `_archive/legacy-notes/stanford-cs329a-agent-skill.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/tufa-labs-self-rewarding-self-improving.md` | `_archive/legacy-notes/tufa-labs-self-rewarding-self-improving.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/zhouxx-self-evolving.md` | `_archive/legacy-notes/zhouxx-self-evolving.md` | 归档 | 历史工作笔记移出 .trash 与公开树；保留唯一非公开归档。 |
| `.trash/notes/interview-tianyuandong-rsi.md` | `_archive/industry-claims/02-田渊栋访谈/02-田渊栋访谈.md` | 删除空壳 | 与存续归档字节重复；删除重复副本，只保留唯一归档路径。 |
| `.trash/notes/openai-timeline-gpt-red.md` | `_archive/industry-claims/05-OpenAI-GPT-Red/05-OpenAI-GPT-Red.md` | 删除空壳 | 与存续归档字节重复；删除重复副本，只保留唯一归档路径。 |
| `.trash/notes/rsi-industry-roundup-2026-08.md` | `_archive/industry-claims/08-2026-08行业速览/08-2026-08行业速览.md` | 删除空壳 | 与存续归档字节重复；删除重复副本，只保留唯一归档路径。 |

## 图片目录聚合映射

图片不计入上面的 127 篇 Markdown。每张图片跟随所属文章迁移；公开 167 张图的逐图来源声明位于各自正文图注。

| 旧图片范围 | 新位置 | 处理 |
|---|---|---|
| `0-导读/**/images/*` | `00-导读与证据规则/**/images/*` | 跟随导读正本 |
| `1-坐标系与术语/**/images/*` | `01-研究框架与术语/**/images/*`；重复三层页随归档 | 跟随逐文件 ledger |
| `2-Model层-训练时自改进/**/images/*` | `02-模型自改进与自训练/**/images/*`、`06-工具学习与程序编排/6.1-*/**/images/*` | 模型与工具训练拆章 |
| `3-Harness层-Agent运行时/**/images/*` | `01`、`04`、`05`、`06`、`07`、`08`、`09` 对应专题目录 | 按更新对象拆章 |
| `4-Artifact层-产物发现/**/images/*` | `09-自动研究与科学发现/**/images/*` | 自动研究与产物搜索归并 |
| `5-实验室与公司/**/images/*` | `03`、`09` 对应公开专文；其余随 `_archive/industry-claims/` | 官方研究与产业叙事分流 |
| `6-评测与安全/**/images/*` | `10-评测与安全边界/**/images/*` | 跟随评测专文 |

## 覆盖断言

- 旧 Markdown：**127**。
- 唯一旧路径：**127**。
- 重复旧路径：**0**。
- 缺失目标路径：**0**。
- 动作词仅使用：`直接迁移`、`重写`、`融合`、`归档`、`删除空壳`。
- 跨库 `llm-guide` 路径不在本批改动范围；待其新结构稳定后再按独立 redirect manifest 更新。
