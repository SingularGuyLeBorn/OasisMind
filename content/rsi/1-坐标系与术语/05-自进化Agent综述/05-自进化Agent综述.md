---
title: "05 · 自进化综述：四件套闭环还不是 RSI"
date: 2026-08-31
as_of: 2026-08-31
category: 综述
published: true
excerpt: >-
  Fang et al. arXiv:2508.07407：自进化 Agent 是输入–系统–环境–优化器闭环。
  搜索空间可以是权重、提示、记忆、工具、工作流；优化器默认在墙外。
  三条律 Endure > Excel > Evolve。不是花园式 (2) 的 RSI。
tags:
  - RSI
  - 综述
  - 自进化
  - Agent
  - MASE
---

# 05 自进化综述：四件套闭环还不是 RSI

部署后的 Agent 多半是人写死的提示、工具表和工作流。环境一变，人再改一版。Fang、Peng、Zhang 等人的综述把这件事收成搜索：系统输入、Agent 系统、环境、优化器四件套转一圈，用交互数据和环境反馈改系统内部组件。标题里的「自进化」是这个闭环，不是花园式 (2) 的递归。

本篇是第 1 章的文献入口，坐标系仍以 [02 三层](../02-Model-Harness-Artifact/02-Model-Harness-Artifact.md) 为准。综述按「反馈回路哪一格在动」切；花园按「留下的状态是权重、脚手架还是产物」切。两套叠着读，比再背一份论文目录有用。**不是** RSI：优化器 \(P=(S,H)\) 默认写在被优化对象 \(A\) 外面。**不是** 混元 L0–L4 可靠性专文（证据墙在 [第 6 章](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)）。**不是** 社区专栏的三层讲法（线索在 [03](../03-三层框架笔记/03-三层框架笔记.md)，定义不从那里取）。一手：Fang et al.，[arXiv:2508.07407](https://arxiv.org/abs/2508.07407)，2025-08-10；配套清单 [EvoAgentX/Awesome-Self-Evolving-Agents](https://github.com/EvoAgentX/Awesome-Self-Evolving-Agents)。作者单位写在 PDF 首页：Glasgow、Sheffield、MBZUAI、NUS、Cambridge、UCL、Aberdeen、Leiden。并列综述 Gao et al. [arXiv:2507.21046](https://arxiv.org/abs/2507.21046) 按 what / when / how 切，本篇不展开。

## 1. 定义、三条律、四段范式

综述自己的定义：自进化 AI Agent 是一类自主系统，通过与环境交互，持续、系统地优化内部组件，目标是适应变化的任务、上下文和资源，同时保住安全并提升表现。关键词是 **internal components** 和 **interaction with environments**。改的可以是基座、提示、记忆、工具、工作流、多智能体通信，不限定必须改 \(\theta\)。

三条律按阿西莫夫的层级写：后一条不得压过前一条。

1. **Endure**（安全适应）：任何修改过程中保持安全与稳定。
2. **Excel**（表现保持）：在第一条之下，保住或提高已有任务表现。
3. **Evolve**（自主进化）：在前两条之下，才能按任务、环境、资源的变化去优化内部组件。

花园读这三条，不要听成已经实现的产品规格。作者把它们写成设计约束，并明说当前系统离安全、稳健、开放式的自进化还远；眼下走的是「用进化/优化技术，按交互数据迭代改组件」。第三条没有自动取消墙外的优化器。

四段范式（综述 Figure 1 / Table 1）：

| 段 | 名字 | 交互 | 典型手段 |
|----|------|------|----------|
| MOP | Model Offline Pretraining | 模型 \(\Leftrightarrow\) 静态语料 | 因果/掩码预训练、分词、MoE 与流水线并行 |
| MOA | Model Online Adaptation | 模型 \(\Leftrightarrow\) 标签/分数/奖励 | SFT、LoRA、RLHF / DPO / PPO |
| MAO | Multi-Agent Orchestration | Agent \(\Leftrightarrow\) Agent | 消息、辩论、工具调用；**不改**底层参数 |
| MASE | Multi-Agent Self-Evolving | Agent 种群 \(\Leftrightarrow\) 环境信号 | 改提示、记忆、工具策略、交互拓扑；元奖励 |

MOP→MOA 是花园 Model 层常见的单轮训练。MAO 把多个冻权重的 LLM 编排起来，改的是 Harness。MASE 才把编排本身放进搜索。作者举 AlphaEvolve（Novikov et al., 2025）和 Darwin 一类工作当 MASE 方向的例子——花园里对应 [AlphaEvolve](../../4-Artifact层-产物发现/03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md) 和 [DGM](../../3-Harness层-Agent运行时/04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)：产物或脚手架在搜，改进器配方仍在墙外。不要把 Table 1 最后一行听成已经交差。

单 Agent 的积木，综述 §2.1 写成：基座负责解释目标、做计划、出动作；外围是感知、规划、记忆、工具。规划从线性 CoT，到 [ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md) 那种「想一步做一步」，再到 [ToT](../../3-Harness层-Agent运行时/27-ToT-本题推理树/27-ToT-本题推理树.md) / [RAP](../../3-Harness层-Agent运行时/30-RAP-世界模型规划/30-RAP-世界模型规划.md) / [GoT](../../3-Harness层-Agent运行时/31-GoT-思维图聚合/31-GoT-思维图聚合.md) 的分支。记忆分短时（任务结束丢掉）和长时（跨任务，常接 RAG）。工具把网络搜索、代码执行、浏览器自动化接到推理环里。多智能体 §2.2 把拓扑分成层次（MetaGPT SOP）、中心（经理–下属，单点故障）和去中心（仿真友好、同步贵）。通信从 JSON/XML/代码，到自然语言，再到 A2A / ANP / MCP / Agora 这类协议草案。这些是闭环里 \(A\) 的内部零件清单，不是另一套 RSI 定义。

## 2. 四件套：把静态部署写成搜索

综述 Figure 3 把自进化收成迭代优化。任务说明书、训练数据或一条 \((x,y)\) 构成系统输入 \(I\)。Agent 系统 \(A\)（单或多）在环境里执行。环境按预定指标回馈：准确率、F1、成功率，或没有标签时的 LLM 代理分。优化器拿反馈更新 \(A\)——改 LLM 参数、改提示、改结构；有时还合成训练例，扩下一轮的 \(I\)。达到阈值或收敛就停。EvoAgentX（Wang et al., 2025i，[arXiv:2507.03616](https://arxiv.org/abs/2507.03616)）被写成把这套过程做成开源框架的一次落地：生成、执行、评价、优化工作流。落地不等于优化器已经进了 \(S'\)：框架代码仍是人维护的 \(H\)，工作流被搜到之后，下一轮还是同一套框架去搜。

![系统输入进 Agent，环境出分数，优化器在墙外改配置](./images/fig-se-four-loop.png)

> 图 1：四件套闭环。实线是执行与分数；虚线是优化器改 \(A\)。优化器画在虚线墙外。

**图 1 解析**

- **System Inputs \(I\)**：任务级 \(\{T, D_{\mathrm{train}}\}\)，另备 \(D_{\mathrm{test}}\)；或实例级 \(\{x,y,C\}\)。没标注时用 LLM 造代理训练集（Huang et al., 2025；Zhao et al., 2025a；Liu et al., 2025b 一类）。
- **Agent System \(A\)**：可拆成 LLM、提示、记忆、工具、拓扑。多数工作一次只动一格；也有把 LLM 和提示一起动，或把提示和多智能体拓扑一起动。
- **Environment**：代码任务里是编译器、解释器、测试；科研里是文献库、仿真、实验室设备。分数从这里来。
- **Optimiser \(P=(S,H)\)**：\(S\) 是可搜配置，\(H\) 是启发式、梯度、贝叶斯、MCTS、RL、进化或可学习策略。墙外。

形式目标写在 §3.5：

$$
A^{*}=\arg\max_{A\in S}\,O(A;I). \tag{1}
$$

\(O(A;I)\) 把 \(A\) 在输入 \(I\) 上的表现映成标量。花园的式 (2) 要的是改进器自己进 \(S'\)。式 (1) 只要求在给定 \(S\) 里找到更好的 \(A\)。谁定义 \(S\)、谁跑 \(H\)、谁算 \(O\)，论文默认是人写的优化器。把式 (1) 听成 RSI，是把「搜到更好的 Agent」听成「搜的手续也被搜到了」。

输入还分两档。任务级优化盯整项任务的平均分，花园里 [LADDER](../../2-Model层-训练时自改进/05-LADDER-递归拆题/05-LADDER-递归拆题.md) 的 \(V_{\mathrm{LADDER}}\) 走这一档。实例级优化盯**这一条**样本（Sun et al., 2024a；Novikov et al., 2025）：LADDER 的 TTRL 和 AlphaEvolve 对单个目标的进化，更靠近这一档。TTRL 答完还把 \(\theta\) 滚回去，优化器身份没有升级。

![MOP 到 MASE 四段，右侧对上 Model / Harness / Artifact](./images/fig-se-mop-mase.png)

> 图 2：左列四段范式，右列花园三层。MASE 跨 Harness 与 Artifact，不自动等于 RSI。

**图 2 解析**

- **MOP / MOA**：动 \(\theta\)，对 Model。SPIN、Self-Rewarding、Tufa、LADDER、SEAL 都落在这一列的后半。
- **MAO**：冻权重、改编排，对 Harness。Argus 的验证门、手写多 Agent 辩论都在这里。
- **MASE**：搜提示 / 记忆 / 工具 / 拓扑，对 Harness；若留下的是 kernel、论文，对 Artifact。
- **墙外 \(P\)**：四段都可以成立。RSI 要问 \(P\) 是否进了下一轮的 \(S'\)。

## 3. 单 Agent：动 \(A\) 的哪一格

综述 §4 按被优化组件切，不按公司切。Figure 4 / Figure 5 是论文目录树，本篇只取和花园接头的几条。

**LLM 行为。** 训练侧：SFT 模仿带推理轨迹的数据，轨迹来自自己的成功 rollout 或更强教师。STaR（Zelikman et al., 2022）只在做对的题上微调，做错的再改写；NExT 用单测过滤自生成轨迹做程序修复；DeepSeek-Prover 用已验证证明迭代训策略。RL 侧：用测试、最终对错或过程奖励模型造偏好，走 DPO；Self-Rewarding 让策略用自己的判断迭代；Tülu 3 在可验证奖励上 RL、不另训奖励模型；DeepSeek-R1 在能做对错检查时用纯 RL + GRPO。Absolute Zero 让同一只模型轮流出题和答题，机制见 [06](../../2-Model层-训练时自改进/06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md)；[R-Zero](../../2-Model层-训练时自改进/07-R-Zero-挑战者解题器/07-R-Zero-挑战者解题器.md) 用挑战者按解题器当前能力出题——和 LADDER「自己造更简单的题」同属出题器，验证器仍在墙外。[ReTool](../../2-Model层-训练时自改进/08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 把代码解释器编进 PPO rollout，题仍是人出的 DAPO-17k。[ToolRL](../../2-Model层-训练时自改进/09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) 用 GRPO 拆格式和槽位，3B BFCL 52.98，摘要 17% 不是某一格。[ToRL](../../2-Model层-训练时自改进/10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md) 从 Math 基座接解释器，7B AIME24 greedy 43.3。测试时侧：编译器当 outcome 反馈（CodeT、LEVER），证明助手报错（Baldur），或训练过程奖励看每一步（Math-Shepherd）。搜索侧：自洽投票、[ToT](../../3-Harness层-Agent运行时/27-ToT-本题推理树/27-ToT-本题推理树.md)、[RAP](../../3-Harness层-Agent运行时/30-RAP-世界模型规划/30-RAP-世界模型规划.md)、[GoT](../../3-Harness层-Agent运行时/31-GoT-思维图聚合/31-GoT-思维图聚合.md)。[BoT](../../3-Harness层-Agent运行时/34-BoT-思维模板缓冲/34-BoT-思维模板缓冲.md) 把高阶模板留下，题换了库还在，蒸馏配方冻着，不要和 ToT 的本题树收成一档。测试时加长思考不改 \(\theta\)，花园把它放在 L0 / 任务内，见可靠性专文。

**提示。** LLM 对措辞、格式、词序敏感，所以提示被写成可搜空间。编辑派在人写的句子上做删、换、释义（[GrIPS](../../3-Harness层-Agent运行时/22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md) 贪心短语手术；[TEMPERA](../../3-Harness层-Agent运行时/23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md) 把同类动作当成按查询的 RL）。梯度离散派用输入嵌入的一阶近似换 token（[AutoPrompt](../../3-Harness层-Agent运行时/25-AutoPrompt-梯度引导触发词/25-AutoPrompt-梯度引导触发词.md) 共用触发词，RoBERTa 全量 SST-2 测试 91.4，要白盒；邻居少样本表上的 56.7 不要横加）。生成派让模型写出全新提示（[RLPrompt](../../3-Harness层-Agent运行时/24-RLPrompt-离散提示强化学习/24-RLPrompt-离散提示强化学习.md) 用 RL 逐步出离散 token，SST-2 5 token 92.5；[APE](../../3-Harness层-Agent运行时/19-APE-自动提示工程师/19-APE-自动提示工程师.md) 先提案再按执行准确率挑、默认不迭代；[OPRO](../../3-Harness层-Agent运行时/17-OPRO-元提示优化/17-OPRO-元提示优化.md)、[PromptAgent](../../3-Harness层-Agent运行时/26-PromptAgent-MCTS提示规划/26-PromptAgent-MCTS提示规划.md) 的 MCTS（BBH 均 0.802 对同表 APE 0.690，摘要 11.2% 是百分点）、[MIPRO](../../3-Harness层-Agent运行时/20-MIPROv2-贝叶斯联合优化/20-MIPROv2-贝叶斯联合优化.md) 的贝叶斯联合搜）。文本梯度派用自然语言批评当「梯度」，再反向改提示（[ProTeGi](../../3-Harness层-Agent运行时/21-ProTeGi-文本梯度束搜索/21-ProTeGi-文本梯度束搜索.md)、[TextGrad](../../3-Harness层-Agent运行时/14-TextGrad-文本梯度/14-TextGrad-文本梯度.md)）。进化派维护提示种群，突变和交叉（[EvoPrompt](../../3-Harness层-Agent运行时/18-EvoPrompt-进化算子提示/18-EvoPrompt-进化算子提示.md)、[Promptbreeder](../../3-Harness层-Agent运行时/16-Promptbreeder-自我指涉提示进化/16-Promptbreeder-自我指涉提示进化.md)、[GEPA](../../3-Harness层-Agent运行时/15-GEPA-遗传Pareto提示/15-GEPA-遗传Pareto提示.md)）。改的是 Harness 里的指令，不是改进器。实例优化（这道题的解、这段代码）跨题不留，和提示优化不要收成一张榜。GEPA 自己的表上短指令赢过 GRPO 的 LoRA；ACE 在 AppWorld 上测到同一优化器几乎贴着 ICL。

**记忆。** 综述把训练时改权重的知识编辑划出去，只谈推理时调度：短时压缩、摘要、选择性保留（[ReadAgent](../../3-Harness层-Agent运行时/41-ReadAgent-gist分页记忆/41-ReadAgent-gist分页记忆.md)、[MemoryBank](../../3-Harness层-Agent运行时/40-MemoryBank-遗忘曲线记忆/40-MemoryBank-遗忘曲线记忆.md) 按遗忘曲线更新）；长时 RAG、图索引、SQL（[MemGPT](../../3-Harness层-Agent运行时/36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md)、[HippoRAG](../../3-Harness层-Agent运行时/38-HippoRAG-海马索引检索/38-HippoRAG-海马索引检索.md)、[ChatDB](../../3-Harness层-Agent运行时/39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md)）。MemGPT 专文钉死：窗口当 RAM，DMR 上 GPT-4 Turbo 35.3→93.4，裁判慷慨，换页政策冻着，不是术语式 (2)。[A-Mem](../../3-Harness层-Agent运行时/37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md) 把原子笔记连边并改旧卡片：LoCoMo 上 GPT-4o-mini 多跳 27.02 对对照 MemGPT 26.65，不是两倍；对抗题全上下文 69.23 更高；三份提示冻着。[HippoRAG](../../3-Harness层-Agent运行时/38-HippoRAG-海马索引检索/38-HippoRAG-海马索引检索.md) 把语料收成开放知识图再 PPR：2Wiki R@5 68.2→89.1 是百分点，HotpotQA 单步召回低于 ColBERT，OpenIE 提示冻着。[ChatDB](../../3-Harness层-Agent运行时/39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md) 把账本交给 MySQL：合成水果店 50 题 41/50 对 11/50，70 条约 3.3k 故意塞进 4096，生成 SQL 的提示冻着。[MemoryBank](../../3-Harness层-Agent运行时/40-MemoryBank-遗忘曲线记忆/40-MemoryBank-遗忘曲线记忆.md) 按 \(R=e^{-t/S}\) 改强度：英文正确 0.716 是 97 题人打分，表上三条都带着库，摘要提示冻着。[ReadAgent](../../3-Harness层-Agent运行时/41-ReadAgent-gist分页记忆/41-ReadAgent-gist分页记忆.md) 切页压 gist 再按题回看：QuALITY 并行 1–2 页 86.16% 对全文 85.83%，摘要 20× 是终查询压缩率，分页提示冻着。Reflexion 把任务反馈写成可存的句子再读回来——留下的是文本记忆，不是 \(\theta\)。[ExpeL](../../3-Harness层-Agent运行时/32-ExpeL-跨题经验洞察/32-ExpeL-跨题经验洞察.md) 再把训练轨迹抽成跨题洞察，评测可以一次交卷。[Dynamic Cheatsheet](../../3-Harness层-Agent运行时/33-Dynamic-Cheatsheet-测试时备忘录/33-Dynamic-Cheatsheet-测试时备忘录.md) 没有训练 / 评测切分，测试流上题题改 \(M\)，策展没有金标。[AWM](../../3-Harness层-Agent运行时/35-AWM-工作流记忆/35-AWM-工作流记忆.md) 把网页轨迹收成可再执行的工作流，WebArena 23.5→35.5，摘要 51.1% / 24.6% 是相对涨幅，不要听成准确率柱；在线入库走语言模型裁判，诱导提示冻着。控制「存什么、何时取、丢什么」的策略若被优化器改写，属于 Harness。

**工具。** 训练侧用轨迹 SFT（[Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) 的 GPT-J 6.7B 按未来 token 损失差过滤调用再 SFT，LAMA T-REx **53.5**、ASDiv **40.4**，不要改 ToolRL 的 52.98，开放问答三列仍低于 GPT-3 davinci；[ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md) 的 LLaMA-2-7B 调 RapidAPI **16464**，ToolLLaMA+DFSDT 均 pass **66.7**，不要改 Gorilla Oracle 67.20、也不要改 ReTool 67.0；[Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md) 的 LLaMA-7B 调 APIBench，TorchHub 0-shot **59.13**，摘要 20.43 钉相对 GPT-4 的 TorchHub 百分点，HuggingFace 上 GPT 只对域名）或 RL（[ReTool](../../2-Model层-训练时自改进/08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 的 PPO 交错代码解释器，Qwen2.5-32B AIME2024 **67.0** / 400 步，换 R1-Distill 才到 **72.5**，不要和 67.0 收成一只；[ToolRL](../../2-Model层-训练时自改进/09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) 的 GRPO 拆格式与槽位，3B BFCL **52.98**，摘要 17% / 15% 是跨榜汇总不是某一格；[ToRL](../../2-Model层-训练时自改进/10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md) 从 Math 基座做工具 RL，7B AIME24 greedy **43.3**，不要和 ReTool 67.0、也不要和 Sky-T1 的 43.3 收成一只）。推理侧改工具文档写法（[EASYTOOL](../../3-Harness层-Agent运行时/53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md) 冻 \(\theta\)，ChatGPT 两段把文档收成说明书，I2+I3 共 300 条上 ChatGPT+DFSDT 均 pass **69.8**，不要改 ToolLLM 六列 **66.7**）或用控制器调度现成专家（[HuggingGPT](../../3-Harness层-Agent运行时/54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) 冻 ChatGPT，按下载量 top-K 调 Hugging Face，单任务规划 Acc **52.62** 是 GPT-4 伪标签，人手 46 条顺序 Acc 只有 **18.18**，Success 63.08 不要改 ToolLLM 的 63.8）或冻骨干在线调真 REST（[RestGPT](../../3-Harness层-Agent运行时/55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md) 冻 `text-davinci-003` 粗到细规划，TMDB Success **75.0** / CP **79.0**，RestBench 过滤 **54 / 40** 只 API，不要改 EASYTOOL 子集的 55）或一次写出模块名再顺序执行、执行中不重规划（[Chameleon](../../3-Harness层-Agent运行时/56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md) 冻 GPT-4，ScienceQA **86.54** 低于人手 88.40，不要改 HuggingGPT 的 52.62，也不要改 RestGPT Offline 的 29.0）或用树搜索选工具。再往前是造工具：[LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 按类写出可复用 Python 并摊销，GPT-4 造、GPT-3.5 调，中国剩余 CoT 两边 0.0、LATM 100.0，造工具提示冻着；CREATOR 按题写文档和代码，ChatGPT 上 MATH 59.7%，不要和 LATM 的 79.7 横加。AgentOptimiser 把工具当可学习权重。造出来的可执行代码若只服务当前任务、不进入保留的 Agent 状态，偏 Artifact；若下次任务默认带上这套工具表，偏 Harness。LATM 的函数缓存跨实例还在，属于后一档，改进器仍在墙外。

## 4. 多 Agent 与领域：拓扑也是搜索空间

综述 §5 的判断：手写工作流把协作模式钉死，工程贵、换目标就脆。并行投票能让小模型追上单只大模型的若干报告；层次流水线适合有依赖的子任务，固定拓扑不适应动态目标；辩论能纠错，也有工作显示「只在低置信时才开辩论」能省推理。Pan et al. (2025a) 被引来说明：提示写得好的单只大模型，在多个推理基准上能打平复杂的多 Agent 讨论——MAO 不是免费的能力升级。

自进化多智能体把工作流写成搜索，空间有三块：结构（谁连谁）、语义（角色和指令）、能力（用哪只骨干）。提示优化在固定拓扑上改角色说明（DSPy Assertions、AutoAgents）。拓扑优化分两家：代码级工作流（[AutoFlow](../../3-Harness层-Agent运行时/47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md) 的自然语言程序 + RL，OpenAGI 上相对人工 CoRE 约 45% 相对涨幅不是准确率柱；[AFlow](../../3-Harness层-Agent运行时/43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md) 的类型化算子图 + MCTS，六集均分 80.3，摘要 5.7% 不是每列都涨 5.7 个百分点，19.5% 是相对本表 ADAS 67.2 的相对涨幅，Claude 优化器冻着；[ScoreFlow](../../3-Harness层-Agent运行时/45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md) 把代码表示抬到生成器 LoRA 上做 Score-DPO，六集均分 85.3，摘要 8.2% 是对八条基线均分约 77.0 的百分点差，不是相对 AFlow 重跑 80.6；[MAS-GPT](../../3-Harness层-Agent运行时/48-MAS-GPT-一次前向吐MAS/48-MAS-GPT-一次前向吐MAS.md) 一次前向吐出可执行 MAS 代码，Llama-3-70B 八列均分 65.47，3.89% 是对自洽的百分点差），以及通信图（[GPTSwarm](../../3-Harness层-Agent运行时/44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md) 学边概率，GAIA 90.2% 是相对 9.70 的相对涨幅且主表未跑边优化；[G-Designer](../../3-Harness层-Agent运行时/49-G-Designer-任务自适应通信图/49-G-Designer-任务自适应通信图.md) 生成任务自适应图，MMLU 84.50、HumanEval 89.90，0.3 是百分点；[AgentPrune](../../3-Harness层-Agent运行时/50-AgentPrune-时空图剪边/50-AgentPrune-时空图剪边.md) 剪边省 token，表上 27.2% 是保留比）。统一优化承认提示和拓扑互相卡：ADAS 把提示、工作流、工具写成 Python，元 Agent 迭代生成再评价——花园 [ADAS 专文](../../3-Harness层-Agent运行时/07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) 钉死的是「元 Agent 自己不被搜」。AFlow 的 ADAS 对照行 MBPP 53.4 不要改 ADAS 专文的 MGSM 53.4。[MASS](../../3-Harness层-Agent运行时/46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md) 分三阶段近似联合优化：先局部调各 Agent 提示，再在剪过的空间搜拓扑，再全局调提示；Gemini 1.5 Pro 八列均分 78.79，不要和 AFlow 专文 80.3 横加。学习派把超网或层状 Agent 队当成可采样对象（[MaAS](../../3-Harness层-Agent运行时/51-MaAS-Agent超网/51-MaAS-Agent超网.md) 五列均分 83.59，6%～45% 是 MATH 推理美元比，不是准确率柱；[ANN](../../3-Harness层-Agent运行时/52-ANN-层状文本反传/52-ANN-层状文本反传.md) HumanEval 4o-mini 90.9，创作 9.0 是约 10 分制）。

骨干优化：用多 Agent 辩论轨迹做 SFT 或 DPO（Sirius、MALT）；MaPoRL 用任务相关奖励逼通信。协作取向的 OPTIMA（Chen et al., 2025h）被综述写成：在信息交换密集的任务上，报告 **2.8×** 表现增益、token 成本不到原来的 **10%**。数字以该论文为准，本篇不另做复现。它说明「协作能力可以当训练目标」，不说明改进器已经递归。

领域章（§6）把同一套闭环接到有约束的环境。医学：MedAgentSim 用经验回放和语义记忆做诊断仿真；MDAgents 用主持 Agent 汇总；工具要接专科检查。分子：CACTUS 接 RDKit，没有化学工具的 Agent 会写出不合法结构。编程：[Self-Refine](../../3-Harness层-Agent运行时/12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) 自我批评；AgentCoder 分写代码 / 评审 / 测试；Self-Debugging 把运行轨迹喂回去。金融与法律：FinCon、LawLuo、AgentCourt 用角色和规则约束。领域差异主要在环境给的 \(O\)：临床缺金标准、代码有测试、法庭有成文法。优化器设计跟着 \(O\) 走，不是另立 RSI。

## 5. 评价：分数既当门禁又当训练信号

§7 把评价写成动态反馈：细粒度分数拿去优化 Agent、改提示、扩数据。基准按场景切：工具（ToolBench、API-Bank、AppWorld），网页（WebArena、AgentBench），多 Agent（MultiAgentBench），GUI（OSWorld），领域（SWE-bench、AgentClinic）。工具 Agent 早期会过拟合特定 schema，泛化到未见 API 差。网页基准难复现，因为站点在变。

LLM-as-a-Judge 用点式打分或成对比较当廉价人评替代，和人的相关有时能摸到标注者间一致；对提示敏感，单看最终输出会漏多步推理。Agent-as-a-Judge 用带工具的 Agent 评整条轨迹，DevAI 代码生成上被写成更贴专家、比人审便宜，换域仍难。花园的可靠性专文要求：**指导过候选生成的分数，不应再当同一更新的唯一验收**。综述把 LLM 裁判写进环境反馈，正是那条原则要盯的口子——Tufa 把裁判冻死，是同一风险的工程对策。

安全段把 Endure 写成终身要求。AgentHarm 测多步恶意请求；RedCode 测代码安全；MACHIAVELLI 看奖励优化会不会长出不择手段的策略。现有评测多为快照。作者把「随进化过程纵向盯安全」写成未做完的题。这和混元「证据在更新边界外」同方向，本篇不把 L0–L4 表再抄一遍。

开放问题按三条律归类。Endure：优化管道偏任务分、忽视隐私和目标漂移；欧盟 AI Act / GDPR 假定模型静态。Excel：生物医学和法律缺少无争议的金标准；大规模 MAS 贵且不稳；优化过的提示和拓扑换骨干就脆。Evolve：算法多半是纯文本，工具集默认冻着。未来工作写模拟器里的闭环、工具共进化、真实世界纵向基准、效果–成本权衡、领域约束。都还是研究议程。

## 6. 对上花园：目录树不是新坐标系

| 综述格子 | 花园落点 | 样板 |
|----------|----------|------|
| 训 LLM 行为 | Model | SPIN / Self-Rewarding / Tufa / LADDER / SEAL / Absolute Zero / R-Zero / [ReTool](../../2-Model层-训练时自改进/08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) / [ToolRL](../../2-Model层-训练时自改进/09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) / [ToRL](../../2-Model层-训练时自改进/10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md) / [Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md) / [ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md) / [Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) |
| 测时搜索、Self-Refine / CRITIC / TextGrad 实例优化 | 多为 L0，不留 \(\theta\) | [12 Self-Refine](../../3-Harness层-Agent运行时/12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)；[13 CRITIC](../../3-Harness层-Agent运行时/13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md)；[14 TextGrad](../../3-Harness层-Agent运行时/14-TextGrad-文本梯度/14-TextGrad-文本梯度.md)；[29 ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md)；[27 ToT](../../3-Harness层-Agent运行时/27-ToT-本题推理树/27-ToT-本题推理树.md)；[30 RAP](../../3-Harness层-Agent运行时/30-RAP-世界模型规划/30-RAP-世界模型规划.md)；[28 LATS](../../3-Harness层-Agent运行时/28-LATS-Agent树搜/28-LATS-Agent树搜.md)；[31 GoT](../../3-Harness层-Agent运行时/31-GoT-思维图聚合/31-GoT-思维图聚合.md)；可靠性专文 |
| 提示 / 记忆 / 工具表 / 拓扑 | Harness | Argus / ACE / SkillEvolver / ExpeL / Dynamic Cheatsheet / BoT / AWM / MemGPT / A-Mem / HippoRAG / ChatDB / MemoryBank / ReadAgent / LATM / [EASYTOOL](../../3-Harness层-Agent运行时/53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md) / [HuggingGPT](../../3-Harness层-Agent运行时/54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) / [RestGPT](../../3-Harness层-Agent运行时/55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md) / [Chameleon](../../3-Harness层-Agent运行时/56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md) / ADAS / STOP / DGM / Auto-Research |
| 代码级工作流当空间 | Harness（元 Agent 常冻） | ADAS；[AFlow](../../3-Harness层-Agent运行时/43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)；[ScoreFlow](../../3-Harness层-Agent运行时/45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)；[MaAS](../../3-Harness层-Agent运行时/51-MaAS-Agent超网/51-MaAS-Agent超网.md) 五列均分 83.59；[ANN](../../3-Harness层-Agent运行时/52-ANN-层状文本反传/52-ANN-层状文本反传.md) 层状选队 90.9；Gödel 才把运行时打开 |
| 通信图边概率 | Harness（REINFORCE / VGAE / 剪边冻） | [GPTSwarm](../../3-Harness层-Agent运行时/44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)；[G-Designer](../../3-Harness层-Agent运行时/49-G-Designer-任务自适应通信图/49-G-Designer-任务自适应通信图.md) MMLU 84.50；[AgentPrune](../../3-Harness层-Agent运行时/50-AgentPrune-时空图剪边/50-AgentPrune-时空图剪边.md) 均分 89.72，表上 27.2% 是保留比 |
| 实例级搜产物 | Artifact | FunSearch / AlphaEvolve / Polaris |
| 式 (1) 的 \(P\) | 默认墙外 | 几乎全部上表 |

Auto-Research 改的是 `train.py`，考官是 val_bpb，说明书 `program.md` 由人改——优化器在墙外，搜索空间是训练脚本，不是积分变体。FunSearch 冻代码模型、搜函数、组合数学分数当 \(O\)。Polaris 把航行阶段写进 Voyage，人闸和伪造引文规则在墙外。这些都能放进四件套，不必为它们再开第四套分类。

并发的 Gao et al. (2025b) 按「进化什么、何时进化、怎么进化」组织。what 接近花园的层，when / how 接近本综述的 \(H\) 与触发条件。两篇都覆盖「自进化 Agent」文献，都没有把优化器递归写进主实验。清单不要混：[06 资源清单](../06-资源清单/06-资源清单.md) 里 XMU 那份 awesome 和本篇的 EvoAgentX 清单不是同一仓库。

## 7. 何时失效

把「内部组件被优化」听成 RSI，会把 PromptBreeder、ADAS、LADDER 和尚未存在的自改改进器堆进同一句话。检查手续：下一轮的 \(P\) 是否来自这一轮的 \(A\)。不是，就停在式 (1)。提示被搜到、拓扑被剪过、\(\theta\) 被 GRPO 推过，都可以成立，改进器身份仍是墙外那份 \(H\)。式 (1) 允许 \(A\) 变好，不允许把 \(P\) 偷偷算进 \(A\)。

用 LLM 裁判当 \(O\)，优化器会改「看起来更好」。综述把无标签时的代理分写进环境，没有把代理分和 held-out 执行检查拆开。可靠性专文的匹配审计在这里直接能用。

MASE 愿景段写科学发现、软件工程、人机协作、机器人与 IoT。没有准确率表。领域章的医学、法律同样缺统一金标准——§8 自己把这件事列为 Excel 的障碍。本篇不把愿景段的应用清单当成已测结果。

三条律的层级在工程上意味着：先能回滚和停机，再谈涨分，最后才谈自动改内部。现在公开系统多半在 Excel 上堆指标，Endure 用快照基准，Evolve 的搜索空间由人划。这是综述的诚实处，也是花园坚持式 (2) 的理由。

**读**：定义与三条律；式 (1) 和 \(P=(S,H)\) 在墙外；任务级 vs 实例级输入；单 Agent 四格与多 Agent 代码/图拓扑；OPTIMA 的 2.8× / <10% 是引用不是本园复现；评价既当门禁又当训练信号。  
**不读**：把 MASE 听成已实现 RSI、把四件套听成替代三层、把 LLM 裁判听成墙外证据、把 Table 1 最后一行听成 AlphaEvolve 已经在改改进器、把 EvoAgentX 听成优化器进了 \(S'\)。

同层：[01 术语](../01-RSI-术语辨析/01-RSI-术语辨析.md)、[02 三层](../02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)、[04 RLVR](../04-模仿学习与RLVR/04-模仿学习与RLVR.md)。评测：[RSIBench](../../6-评测与安全/01-RSIBench-Data/01-RSIBench-Data.md)、[可靠性阶梯](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)、[SEAGym](../../6-评测与安全/03-SEAGym-Harness评测环境/03-SEAGym-Harness评测环境.md)。Harness 样板：[ADAS](../../3-Harness层-Agent运行时/07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)、[ACE](../../3-Harness层-Agent运行时/09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)、[Auto-Research](../../3-Harness层-Agent运行时/02-Karpathy-Auto-Research/02-Karpathy-Auto-Research.md)。

## 参考文献

1. Fang, J., Peng, Y., Zhang, X., et al. (2025). [A Comprehensive Survey of Self-Evolving AI Agents](https://arxiv.org/abs/2508.07407). arXiv:2508.07407. 定义、三条律、四段范式、式 (1)、§4–§7 分类以该 PDF 为准。
2. 配套清单：[EvoAgentX/Awesome-Self-Evolving-Agents](https://github.com/EvoAgentX/Awesome-Self-Evolving-Agents)。框架：[EvoAgentX](https://arxiv.org/abs/2507.03616)。
3. Gao, H. et al. (2025). [A Survey of Self-Evolving Agents](https://arxiv.org/abs/2507.21046). arXiv:2507.21046。综述正文称为并发、按 what / when / how 组织。
4. 本花园：[02 三层](../02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；[ADAS](../../3-Harness层-Agent运行时/07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)；[可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。
