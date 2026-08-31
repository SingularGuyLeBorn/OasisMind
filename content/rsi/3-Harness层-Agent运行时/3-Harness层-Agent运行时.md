---
title: 3 · Harness 层 · Agent 运行时
date: 2026-08-30
as_of: 2026-08-30
tags: [RSI, harness, 地图]
published: true
excerpt: 改循环、工具、记忆、验证门控。产品级 coding agent 细节在 llm-guide 第 13 章。
category: RSI
---

# 3 Harness 层：Agent 运行时

改的是 **模型外面那圈**。基座可以冻结。把「会写 skill」说成 RSI，先过第 1 章术语。

| 序号 | 专文 | 职责 |
|------|------|------|
| 01 | [Argus Verification-Gated](./01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) | 生成 ≠ 入库；SWE-Bench Pro 约 78% 对 59%；成熟窗口 −21% token（观测） |
| 02 | [Karpathy Auto-Research](./02-Karpathy-Auto-Research/02-Karpathy-Auto-Research.md) | 只改 train.py；5 分钟 val_bpb；不是 RSI |
| 03 | [CS329A Skill 入口](./03-CS329A-Skill入口/03-CS329A-Skill入口.md) | 课程 skill 指针；不搬讲义 |
| 04 | [DGM 达尔文哥德尔机](./04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) | 改自己的 Python；SWE-bench 20%→50%；弱 RSI 候选 |
| 05 | [STOP 自教优化器](./05-STOP-自教优化器/05-STOP-自教优化器.md) | 改进器对自己递归；基座冻结；弱模型上会掉分 |
| 06 | [Gödel Agent 自指运行时](./06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md) | monkey patch；公平对照只认相对 ADAS |
| 07 | [ADAS Meta Agent Search](./07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) | 冻元搜下游；MGSM 53.4%；Gödel 公平对照锚点 |
| 08 | [SkillEvolver 元技能](./08-SkillEvolver-元技能/08-SkillEvolver-元技能.md) | 冻 CLI，写领域 SKILL.md；83 题 56.8%；元技能不自改 |
| 09 | [ACE Agentic Context Engineering](./09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md) | 冻 θ 写 playbook；AppWorld 42.4→59.4；合并非 LLM；不是 RSI |
| 10 | [Voyager Minecraft 技能库](./10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md) | 冻 GPT-4 写 JS 技能；63 种物品 / 钻石 1/3；不是式 (2) |
| 11 | [Reflexion 言语反思记忆](./11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) | 冻 Actor 写句子进窗口；AlfWorld 130/134；HumanEval 91.0 / MBPP 77.1 |
| 12 | [Self-Refine 任务内迭代](./12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) | 同一只 M 自评自改；均分约 +20%，数学 GPT-4 92.9→93.1；L0，不是式 (2) |
| 13 | [CRITIC 工具交互批评](./13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md) | 搜索/解释器/Perspective 验稿；ChatGPT QA F1 +7.7、数学 +7.0；无工具几乎不涨；L0 |
| 14 | [TextGrad 文本梯度](./14-TextGrad-文本梯度/14-TextGrad-文本梯度.md) | 批评当反传；GPQA 51→55，LeetCode-Hard 0.26→0.36；实例 L0，提示是薄 $H_t$；不改 $\theta$ |
| 15 | [GEPA 遗传 Pareto 提示](./15-GEPA-遗传Pareto提示/15-GEPA-遗传Pareto提示.md) | 反思+Pareto 搜 $\pi$；Qwen3 均 +12.44，相对 GRPO HotpotQA +19；AppWorld 上 ACE 测到 46.4 |
| 16 | [Promptbreeder 自我指涉提示进化](./16-Promptbreeder-自我指涉提示进化/16-Promptbreeder-自我指涉提示进化.md) | $M$ 进种群，$H$ 冻着；PaLM 2-L 零样本 GSM8K 83.9 对 OPRO 80.2；拓扑不改 |
| 17 | [OPRO 元提示优化](./17-OPRO-元提示优化/17-OPRO-元提示优化.md) | 轨迹进元提示，配方冻着；PaLM 2-L 评分 GSM8K 80.2 对 Kojima 71.8；不是 ADAS 的 30.6 |
| 18 | [EvoPrompt 进化算子提示](./18-EvoPrompt-进化算子提示/18-EvoPrompt-进化算子提示.md) | GA/DE 说明书冻着；Alpaca 理解 DE 均 77.05；BBH DE 均 +3.5 最多 +25；不是式 (2) |
| 19 | [APE 自动提示工程师](./19-APE-自动提示工程师/19-APE-自动提示工程师.md) | 指令当程序黑盒搜；24/24 不低于人手写，IQM 0.810；迭代三轮平，默认关掉；不是式 (2) |
| 20 | [MIPROv2 贝叶斯联合优化](./20-MIPROv2-贝叶斯联合优化/20-MIPROv2-贝叶斯联合优化.md) | 指令和示范联合搜，TPE 冻着；Llama-3-8B 七套五套赢对照；不要和 GEPA 的 MIPROv2 列横加 |
| 21 | [ProTeGi 文本梯度束搜索](./21-ProTeGi-文本梯度束搜索/21-ProTeGi-文本梯度束搜索.md) | 错题出批评再改提示；相对 p0 均 +15.3%；∇ 和束宽冻着；摘要 31% 不进表 |
| 22 | [GrIPS 短语级编辑搜索](./22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md) | 人写指令上删换释义加回；Table 1 babbage +4.29；手术菜单冻着；不是式 (2) |
| 23 | [TEMPERA 测试时提示编辑](./23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md) | 按查询 PPO 编辑；SST-2 91.9 对 RLPrompt 90.1；策略训完冻着；Yelp 上 RLPrompt 更高 |
| 24 | [RLPrompt 离散提示强化学习](./24-RLPrompt-离散提示强化学习/24-RLPrompt-离散提示强化学习.md) | 生成离散 \(z\)，MLP 训完即丢；5 token SST-2 92.5；乱码可迁移；不是式 (2) |
| 25 | [AutoPrompt 梯度引导触发词](./25-AutoPrompt-梯度引导触发词/25-AutoPrompt-梯度引导触发词.md) | HotFlip 换共用触发词；RoBERTa 全量 SST-2 91.4；要梯度；不是术语式 (2) |
| 26 | [PromptAgent MCTS 提示规划](./26-PromptAgent-MCTS提示规划/26-PromptAgent-MCTS提示规划.md) | MCTS 搜专家提示；BBH 均 0.802 对 APE 0.690；11.2 是百分点；不是术语式 (2) |
| 27 | [ToT 本题推理树](./27-ToT-本题推理树/27-ToT-本题推理树.md) | 树搜本题中间思维；Game of 24 GPT-4 74% 对 CoT 4%；L0，不是术语式 (2) |
| 28 | [LATS Agent 树搜](./28-LATS-Agent树搜/28-LATS-Agent树搜.md) | ReAct 上走 MCTS；HumanEval 92.7 对 Reflexion 91.0；HotPotQA 有 oracle；L0 |
| 29 | [ReAct 推理与动作](./29-ReAct-推理与动作/29-ReAct-推理与动作.md) | 交错想–做–看；AlfWorld 最好 71% 对 BUTLER 37%；HotpotQA 27.4 低于 CoT；L0 |
| 30 | [RAP 世界模型规划](./30-RAP-世界模型规划/30-RAP-世界模型规划.md) | LM 当世界模型走 MCTS；积木加权 64% 对 CoT 近 0；无真环境；L0 |
| 31 | [GoT 思维图聚合](./31-GoT-思维图聚合/31-GoT-思维图聚合.md) | 本题思维收成可并的有向图；GoO 人写死；排序对 ToT 中位误差约少 62%；L0 |
| 32 | [ExpeL 跨题经验洞察](./32-ExpeL-跨题经验洞察/32-ExpeL-跨题经验洞察.md) | 训练题抽洞察再评新题；HotpotQA 39.0 对 ReAct 28.0；评测一次；不是式 (2) |
| 33 | [Dynamic Cheatsheet 测试时备忘录](./33-Dynamic-Cheatsheet-测试时备忘录/33-Dynamic-Cheatsheet-测试时备忘录.md) | 测试流自改文本 \(M\)；Sonnet AIME 2024 23.3→50.0；GPT-4o 24 点 10→99；策展冻着 |
| 34 | [BoT 思维模板缓冲](./34-BoT-思维模板缓冲/34-BoT-思维模板缓冲.md) | meta-buffer 存高阶模板；GPT-4 24 点 82.4 对 ToT 74.0；摘要 11% 是相对涨幅；不是式 (2) |
| 35 | [AWM 工作流记忆](./35-AWM-工作流记忆/35-AWM-工作流记忆.md) | 网页子程序进记忆；WebArena 23.5→35.5；摘要 51.1/24.6 是相对涨幅；不是式 (2) |
| 36 | [MemGPT 操作系统式记忆](./36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md) | 窗口当 RAM、外存当磁盘；DMR Turbo 35.3→93.4；裁判慷慨；不是式 (2) |
| 37 | [A-Mem 卡片盒记忆](./37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md) | 原子笔记连边并改旧卡片；4o-mini 多跳 27.02 不是两倍；提示冻着 |
| 38 | [HippoRAG 海马索引检索](./38-HippoRAG-海马索引检索/38-HippoRAG-海马索引检索.md) | OpenIE 建图再 PPR；2Wiki R@5 68.2→89.1 是百分点；HotpotQA 单步更低 |
| 39 | [ChatDB 符号 SQL 记忆](./39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md) | GPT-3.5 写 SQL 改 MySQL；合成店账 41/50 对 11/50；语料故意塞进 4096 |
| 40 | [MemoryBank 遗忘曲线记忆](./40-MemoryBank-遗忘曲线记忆/40-MemoryBank-遗忘曲线记忆.md) | 艾宾浩斯改强度；英文正确 0.716 是 97 题人打分；表上没有无记忆列 |
| 41 | [ReadAgent gist 分页记忆](./41-ReadAgent-gist分页记忆/41-ReadAgent-gist分页记忆.md) | 切页压 gist 再回看；QuALITY 86.16 对全文 85.83；20× 是终查询压缩率 |
| 42 | [LATM 函数缓存造工具](./42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) | GPT-4 造 Python，3.5 调用；中国剩余 CoT 0.0、LATM 100.0；提示冻着 |
| 43 | [AFlow 工作流 MCTS](./43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md) | 算子图上走 MCTS；六集均分 80.3；4.55% 是成本比；Claude 冻着 |
| 44 | [GPTSwarm 通信图边概率](./44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md) | REINFORCE 学跨 Agent 边；GAIA 90.2% 是相对涨幅且未跑边优化；不是式 (2) |
| 45 | [ScoreFlow Score-DPO 工作流](./45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md) | LoRA 训生成器；六集均分 85.3；8.2% 是对基线均分的百分点差；配方冻着 |
| 46 | [MASS 提示拓扑分阶段](./46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md) | 1PO/2TO/3PO；Gemini Pro 八列均分 78.79；不要和 AFlow 80.3 横加；配方冻着 |
| 47 | [AutoFlow 自然语言工作流 RL](./47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md) | CoRE 字符串加 REINFORCE；40% 是相对 0.2483；不要和 AFlow 80.3 横加 |
| 48 | [MAS-GPT 一次前向吐 MAS](./48-MAS-GPT-一次前向吐MAS/48-MAS-GPT-一次前向吐MAS.md) | 32B SFT 按题吐 forward；八列均分 65.47；3.89 是百分点；配方冻着 |
| 49 | [G-Designer 任务自适应通信图](./49-G-Designer-任务自适应通信图/49-G-Designer-任务自适应通信图.md) | VGAE 按题出图；MMLU 84.50 / HumanEval 89.90；0.3 是百分点；配方冻着 |
| 50 | [AgentPrune 时空图剪边](./50-AgentPrune-时空图剪边/50-AgentPrune-时空图剪边.md) | 掩码加 TopK；均分 89.72；表上 27.2% 是保留比；配方冻着 |
| 51 | [MaAS Agent 超网](./51-MaAS-Agent超网/51-MaAS-Agent超网.md) | 超网按题采样；五列均分 83.59；6%～45% 是 MATH 推理美元比；配方冻着 |
| 52 | [ANN 层状文本反传](./52-ANN-层状文本反传/52-ANN-层状文本反传.md) | 层状选队加文本反传；HumanEval 90.9；创作 9.0 是约 10 分制；配方冻着 |
| 53 | [EASYTOOL 工具文档改写](./53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md) | 冻 θ，ChatGPT 两段改说明书；两列均 pass 69.8，不要改 ToolLLM 66.7 |
| 54 | [HuggingGPT 调度 HF 专家](./54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) | 冻 ChatGPT，按下载量 top-K 调 Hub；单任务 Acc 52.62 是伪标签，人手顺序 18.18 |
| 55 | [RestGPT 粗到细调 REST](./55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md) | 冻 davinci-003，在线粗到细调真 REST；TMDB Success 75.0 / CP 79.0，54≠EASYTOOL 的 55 |

产品 harness（Claude Code / Codex / 沙箱 / MCP）→ [llm-guide 13.5.1](../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md)、[13.3.4](../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.4-运行时环境与沙箱.md)。
