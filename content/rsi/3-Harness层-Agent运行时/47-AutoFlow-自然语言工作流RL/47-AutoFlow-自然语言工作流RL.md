---
title: "47 · AutoFlow：自然语言工作流会搜，解释器冻着"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Li 等用 CoRE 自然语言程序当工作流，生成器吃执行分做 REINFORCE 或把分数写进提示。
  Mixtral 解释器上相对人工 CoRE 约 45% 相对涨幅，不是准确率柱。
  解释器、语法和 GPT-4 解析器冻着。不是术语式 (2)。
tags:
  - RSI
  - AutoFlow
  - Harness
  - CoRE
  - 工作流搜索
  - L2
---

# 47 AutoFlow：NL 程序在搜，解释器冻着

正文写 over 40% improvement，还写 over 5%。打开 Table 1：解释器一律 Mixtral-8x7B，三列是 CLIP / BERT / ViT，再取「任务类均分」。人工 [CoRE](https://arxiv.org/abs/2405.06907) **0.2483**，AutoFlow 用 GPT-4 当生成器 **0.3597**。\((0.3597-0.2483)/0.2483\approx 44.9\%\)，对得上那句 over 40%。差的是 **0.1114**，量纲是三种相似度的平均，不是解题率，更不是百分点柱。Table 2 解释器换成 GPT-4-1106-preview：CoRE **0.6104**，AutoFlow（Mixtral 生成器）**0.6501**，相对涨幅约 **6.5%**；GPT-4 生成器是 **0.6415**，约 **5.1%**。over 5% 钉在 GPT-4 解释器这张表上，分母已经是 0.61，不是从零往上爬 5 个百分点。人把 40% 听成准确率，缺的是：变的是一份 CoRE 自然语言工作流，解释器冻着，OpenAGI 的工具表冻着。Mixtral 当生成器时，语法还要 GPT-4 当解析器改一遍。**不是** 花园 [AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)。AFlow 是 Python 算子图加 MCTS，六集均分 80.3；这边是 Rutgers 的自然语言程序加 RL，基准只有 OpenAGI。两个名字差一个字母，表不能横加。

本篇夹在 AFlow、[ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)、[MASS](../46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md) 和 [ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) 旁边。综述把代码级工作流写成 AutoFlow / AFlow / ScoreFlow / MAS-GPT。AFlow 搜类型化算子；ScoreFlow 让 8B 按题吐 Python 再 Score-DPO；MASS 在人给的积木上分阶段调提示和拓扑。这边工作流是 CoRE 四字段自然语言，生成器吃验证集均分，开源走 LoRA+REINFORCE，闭源把分数写进下一轮提示，像 [OPRO](../17-OPRO-元提示优化/17-OPRO-元提示优化.md) 把轨迹塞进元提示。解释器逐步执行，可调工具，本身不更新。**不是** RSI。**不是** 术语式 (2)。一手：Li, Xu, Mei, Hua, Rama, Raheja, Wang, Zhu, Zhang；Rutgers / 独立作者；[arXiv:2407.12821](https://arxiv.org/abs/2407.12821)，2024-07 预印本。代码 [agiresearch/AutoFlow](https://github.com/agiresearch/AutoFlow)。数字以 HTML Table 1–2、§4–§5 为准。CoRE 语言另文 [arXiv:2405.06907](https://arxiv.org/abs/2405.06907)，同一组。禁止用 0.3597 去改 AFlow 的 80.3，禁止用 40% 去改 ScoreFlow 的 8.2 个百分点。贡献里写了 higher valid plan rates，主文没有单独的合法计划率表，花园不编。

## 1. 问题：CoRE 降低了门槛，工作流仍要人写

作者把 Agent 可靠性写成「按工作流走」。假新闻检测那条例子是人写的六步：查 URL、查语言、常识、立场、汇总、分类。每一步可以调模型或工具。手工工作流贵，还要领域知识，难铺开。他们不把工作流写成 Python 或 YAML，而写成自然语言程序，让 LLM 当解释器。依据是同组的 CoRE：自然语言、伪代码、流程图收成同一套语法，解释器逐步跑。门槛低于写代码，仍要人懂领域、懂这四个字段怎么填。AutoFlow 的切口是：用户只给任务类型描述和数据集，生成器吐 CoRE，解释器在验证集上跑出分数，分数当奖励再推生成器。AutoML 的类比写进 §2.2：生成器当 controller，解释器加工作流当 child model。类比只到「控制器采样、子模型执行」，不到 NAS 的可微搜索。工作流仍是离散字符串。

CoRE 一步四个字段，文里用 `:::` 切开。Step Name 唯一。Step Type 三种：Process 跑完去指定下一步；Decision 按条件分支，像 if-else；Terminal 结束。Step Instruction 是这一步要执行的自然语言。Step Connection 指向下一步。OpenAGI 图文工具规划的人手写例子是六步：先认输入类型，再认输出类型，再从工具表里选计划，再检查工具是否都在表里（否就回到选计划），再检查相邻工具的输入输出类型是否接得上（否也回去），最后列出工具名结束。这不是 Python `if`。分支写在 Decision 的 Yes/No 指针上，由解释器读当前步输出再决定下一跳。人改四种字段的定义，等于人改语言。生成器再会写，也得落进这套槽。

解释器逐步执行，每一步内部又是四段，全是 CoRE 系统里写死的。先从记忆里取这一步可能用到的信息；再和指令拼成提示，让 LLM 出初步回应；再看要不要调外部工具，要就选工具名和参数，结果写回记忆；最后根据本步输出决定下一步。工具调用发生在解释器里，不发生在生成器里。生成器只负责吐整份工作流文本。OpenAGI 的观察可以是图，所以他们没把 [ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) 收进基线：ReAct 要文本观察。CoT 基线是用 DSPy 接到 OpenAGI 上跑的，不是另写一套逐步提示。Program-of-Thought 在这个平台上吐不出可执行代码，也没进表。不要用「没比 ReAct」听成已经赢了 ReAct。是任务形态不接。

\(S\) 取这次留下的 CoRE 文本，以及开源生成器上的 LoRA。单轮 \(S'=I(S)\) 可以发生：REINFORCE 推完一次适配器，或 ICL 提示里多塞一行分数。术语式 (2) 还要 \(I'\subseteq S'\)。下一类任务仍用同一份 CoRE 语法、同一只冻住的解释器、同一条 REINFORCE+Adam+LoRA 配方，或同一句「上一份工作流得分是 x，再给一份更好的」。混元台阶上这不是 L0：一份工作流伺候一类 OpenAGI 题。也到不了改改进器。人没退出 \(I\)。

## 2. 机制：生成器会更新，解释器当环境

框架是双 LLM。Workflow Generator 吃 few-shot 示例工作流和任务描述，吐新 CoRE。Workflow Interpreter 冻着，在验证集上执行，均分当奖励。用户给的任务描述在 OpenAGI 上写成：提供若干步工作流，引导 LLM 用给定工具为图文复杂任务做计划。示例工作流用来教语法。开源 Mixtral 即使有 few-shot 也不能稳定吐出合法 CoRE，于是跟 OpenAGI / 工具论文的后处理一样，**用 GPT-4 当解析器**把输出改成合法文本。闭源 GPT-4 生成器按作者的话说能跟着示例走语法，不再过解析器。开源生成器这条管道并没有真正去掉 GPT-4。LoRA 训的是 Mixtral 生成器，门禁仍在墙外。

开源路径。LoRA，rank **8**。奖励是训练集上所有实例的平均指标。算法 REINFORCE，优化器 Adam，学习率 **0.001**。一轮：生成 →（必要时 GPT-4 改语法）→ 解释器跑验证/训练均分 → 用这个标量更新 LoRA。实现写生成器迭代 **30** 次。方法段又写：相邻两轮奖励差小于阈值就停。两套停法都是人写的。正文没有报阈值，也没有学习曲线。30 是超参，不是改进器发现该停。

闭源路径。不改 GPT-4 权重。解释器同样跑出均分，下一轮把这个数写进查询，例如：The execution performance of the previous workflow is 0.6415. Provide a new workflow that can gain a better performance。0.6415 正好是 Table 2 里 AutoFlow（GPT 生成器）的均分。方法段拿终表数字当例句，不表示每一步提示里都写 0.6415。更新发生在上下文，不发生在 \(\theta\)。这和 OPRO 把分数轨迹塞进元提示是同一类切口：改进手续是人写的填空，模型只填下一份工作流。差别也要钉：OPRO 优化的是一条指令，轨迹可以越积越长；这边优化的是整份 CoRE，提示里通常只塞上一轮的一个标量。作者没有把 30 轮分数历史全塞进去。生成器若只看见 0.6415 这一格，不知道 Task 1 的 CLIP 其实在掉。均分当奖励会把三类指标揉成一个数，REINFORCE 无法知道是文生图塌了还是文本涨了。这是奖励设计，不是模型自己学会了权衡。作者说 GPT-4 能利用提示里的奖励把工作流改好。表上 GPT 生成器 + GPT 解释器均分 0.6415，低于 Mixtral 生成器 + GPT 解释器的 0.6501。闭源 ICL 不是稳赢开源 LoRA。

生成的是**一类任务一份**工作流，不是 ScoreFlow 那样按题吐图。OpenAGI 把题按输出类型切成 Task 1/2/3：文生图用 CLIP，标签和输出都是文本用 BERT，图到图用 ViT。BERT / CLIP 在 OpenAGI 原文里做过归一化。AutoFlow 的「Average over tasks」是三个量纲不同的分数再平均。Task 1 的 0.24 和 Task 2 的 0.31 不能当同一把尺子上的准确率。一份工作流要伺候三类输出。自适应发生在生成器迭代里换整份 CoRE，不发生在执行期按题改图。人换工具表，工作流里的「provided tool list」指称变了，等于人改环境。

![查询和示例进生成器，冻住的解释器打分，再更新生成器](./images/fig-autoflow-loop.png)

> 图 1：实线是一轮优化。虚线回到生成器。解释器框不另画更新箭。

**图 1 解析**

- **Query plus example**：人提供任务描述和一份合法 CoRE。
- **Generator LLM**：吐新工作流。Mixtral 还要过 GPT-4 解析器。
- **Frozen interpreter eval**：逐步执行，均分当 \(r\)。
- **Update generator**：LoRA+REINFORCE，或把 \(r\) 写进下一轮提示。

## 3. 数字：40% 是相对 0.2483，不是准确率

基准只有 OpenAGI。数据集文是 Ge 等 NeurIPS 2023：185 种多步任务，117 线性、68 非线性，每类约 100 条样本。AutoFlow 主文没有重报 185，也没有按线性/非线性拆表。Table 2 的 Zero / Few 与 OpenAGI 原文 GPT-4 列对得上：Zero 均分 0.2378，Few 0.5281；CLIP Few 0.3055，BERT 0.6307，ViT 0.6480。CoT、CoRE、AutoFlow 三列才是这篇新跑的。不要把 OpenAGI 里 RLTF 微调规划器的数字，和这边生成器 RL 收成一张表。同组、同平台、改进对象不同。

Table 1，解释器 Mixtral。Zero：CLIP **0.0**，BERT 0.1092，ViT 0.1949，均分 0.1206。CoT：CLIP 仍 **0.0**，BERT 0.1987，ViT 0.1562，均分 0.1736。Few：0.1839 / 0.0687 / 0.5501，均分 0.1887。Few 的 BERT **低于** Zero。CoRE：0.1825 / 0.2593 / 0.2437，均分 **0.2483**。AutoFlow（GPT 生成器）：**0.2441 / 0.3017 / 0.5720**，均分 **0.3597**。AutoFlow（Mixtral 生成器）：0.1831 / **0.3133** / 0.4907，均分 0.3442。Mixtral 解释器上，最好均分是 GPT 生成器。Task 3 上 Few 已经 0.5501，CoRE 掉到 0.2437，人工工作流这一列比 few-shot 差一截；AutoFlow GPT 到 0.5720，只比 Few 高 0.0219。40% 是均分相对 CoRE，不是每一列都相对 Few 涨 40%。CLIP 从 CoRE 的 0.1825 到 0.2441，相对涨幅约 34%，也不是 40。

Table 2，解释器 GPT-4。Zero：0.0 / 0.2076 / 0.5058，均分 0.2378。CoT：0.2732 / 0.2266 / **0.6736**，均分 0.3359。Few：0.3055 / 0.6307 / 0.6480，均分 0.5281。CoRE：0.1368 / 0.6505 / 0.6480，均分 **0.6104**。AutoFlow（GPT）：0.3049 / 0.6628 / **0.6899**，均分 0.6415。AutoFlow（Mixtral）：0.3032 / **0.7014** / 0.6119，均分 **0.6501**。作者写每一类任务 AutoFlow 都最高。对着表：Task 1 上 Few **0.3055**，AutoFlow GPT **0.3049**，AutoFlow Mixtral 0.3032。差在小数第四位，但「每一列最高」不成立。Task 3 上 Mixtral 生成器 0.6119，低于 CoT 的 0.6736，也低于 CoRE / Few 的 0.6480。均分赢家靠 Task 2 的 0.7014 把 BERT 拉开。CoRE 的 CLIP 0.1368 低于 CoT 和 Few，人工工作流在文生图上甚至帮倒忙。5% 是均分相对 CoRE，不是 Task 1 已经超过 few-shot。

交叉生成器是正文特意写的观察。Mixtral 解释器配 GPT 生成器最好（0.3597）；GPT 解释器配 Mixtral 生成器最好（0.6501）。作者写成协同、互补。表能支持的是：同模型既生成又解释，均分不是峰值。不能支持已经找到通用的「生成器该比解释器更强」规则。Mixtral 生成器在 GPT 解释器上 Task 3 掉到 0.6119，互补不是每列都发生。主文没有把搜到的 CoRE 全文印进表里。仓库里文件名写成 `OpenAGI_Flow_manual_gpt4mixtral.txt` 这种：谁生成、谁解释，从文件名读。读花园的人若只看 0.65，看不到工作流到底多了哪一步 Decision。同组还有 Formal-LLM（把形式语言接进可控 Agent）和 AIOS，机制都不是这份 REINFORCE 循环，不要把 Rutgers Agent 栈收成一篇 AutoFlow。

没有标准差，没有多次随机种子。没有把 30 轮画成曲线。停条件阈值没报。合法计划率没有表。可读性是定性句，没有人评分数。这些空缺按空缺写。超参能钉死的是：迭代 30，REINFORCE，Adam 0.001，LoRA rank 8，GPT-4-1106-preview，Mixtral-8x7B。生成器和解释器各两种，一共四格，两张表按解释器拆开，避免把 0.3597 和 0.6501 收成「AutoFlow 得了 0.65」。0.65 是 GPT-4 在解释，Mixtral 在生成；0.36 是 Mixtral 在解释。解释器换了，均分尺度跟着换。

## 4. 这不是术语式 (2)，NL 程序也不是改进器

生成器变了，下一道同类型 OpenAGI 题走新 CoRE。改进器没变。REINFORCE、Adam 0.001、rank 8、30 轮、相邻轮阈值、ICL 那句「上一份得分是 x」、CoRE 四字段、解释器四段执行、GPT-4 解析器，都还在。混元 L0 装不下跨题保持的工作流；L3 要改提议 / 选择程序。本篇停在留下一份 NL 程序，不改程序怎么被搜出来。摘要里的 automatically generate 指少写具体步骤，不是 \(I\) 在改自己。开源路径把 Mixtral 称为可微调，门禁仍是 GPT-4 改语法。闭源路径连 LoRA 都没有，只有提示里的标量。两条路的 \(I\) 都是人写的。

和邻居钉死。AFlow 专文均分 80.3、HumanEval 94.7，执行器 GPT-4o-mini，优化器 Claude；本表没有 HumanEval，没有 GSM8K。ScoreFlow 六集均分 85.3，8.2% 是对八条基线均分约 77.0 的百分点差；连续空间是 8B 的 LoRA，工作流是 Python。AutoFlow 的 LoRA 也在生成器上，字符串却是 CoRE 自然语言，奖励是 OpenAGI 三指标均分，不是 pass@1。MASS 的 78.79 是 Gemini 1.5 Pro 八列；积木是 Aggregate / Debate 那些，不是 `:::` 字段。GPTSwarm 学边概率，GAIA 90.2% 是相对涨幅。ADAS 冻 gpt-4o 元 Agent 写 `forward`。OPRO 把分数轨迹写进元提示，不产出工作流图。LATM 缓存的是一类题的 Python 函数；这边缓存的是一类基准的 CoRE 文本。CoRE 专文是人手写工作流加解释器；这边生成器会迭代，解释器那一套没动。OpenAGI 的 RLTF 微调的是规划 LLM 本身，不是单独的工作流生成器。七套数字禁止横加。

验证集参与爬山。奖励是训练/验证均分，主表没有另开从未进过优化的第四类输出。可靠性专文要的匹配预算新任务，主表没有。GPT-4 解析器看见的是不合法 CoRE，改完再送解释器；解析器本身不进 \(S'\)。人把解析提示写松一点，Mixtral 生成器的「合法率」会动，那是人改 \(I\)。没有墙外检查「这份工作流该不该进下一次示例」。错流程一旦均分还行，REINFORCE 会把它留下。Task 1 上 Mixtral 解释器 Zero/CoT 是 0.0，文生图根本没出图；AutoFlow 把 CLIP 拉到 0.24，仍远不是「已经会画」。BERT 0.70 也不是文本题满分，只是和人工 CoRE 的 0.65 比。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness 里的 CoRE 文本，以及开源生成器上的 LoRA。解释器权重动了没有？没有。40% 是不是准确率涨了四十个百分点？不是，是 0.2483 上的相对涨幅，量纲是 CLIP/BERT/ViT 均分。还缺什么才叫花园 RSI？REINFORCE 配方或 CoRE 语法进入 \(S'\)，并且下一类新基准用的就是升级后的那份搜索手续。现在换学习率、换 30 轮、把解析器从 GPT-4 换成规则，都是人改 \(I\)。附录式的未来工作写成：也许不用 RL，改用基于梯度或 few-shot；也许生成器和解释器改成师生或对抗。正说明这些手续还不在 \(S'\) 里。

![上排生成器 LoRA 与 CoRE 文本；下排语法、解释器、REINFORCE 和解析器冻着](./images/fig-autoflow-frozen.png)

> 图 2：实线只更新生成器和它吐出的工作流。虚线墙右边是冻着的搜索手续。

**图 2 解析**

- **左列**：LoRA 可以多一轮，CoRE 文本可以换。
- **右列**：语法、解释器、REINFORCE、GPT-4 解析器仍是人写的。
- **读法**：生成器在训不等于 \(I\) 在长。AFlow 的 Claude 和这边的奖励公式都在墙外选谁留下。

同一句「自动生成 Agent 工作流」，至少分五截。提示优化把图钉死。ADAS 线性搜代码。AFlow 用 MCTS 加算子。ScoreFlow 用 Score-DPO 训 Python 生成器。AutoFlow 用 CoRE 字符串加 REINFORCE 或分数提示。五截不要收成「都已经是 RSI」。MAS-GPT 一次前向吐可执行 MAS 代码，G-Designer 按任务生成图、AgentPrune 剪边省 token，综述仍裸名，本篇不代打它们的表。FlowMind 也是 LLM 出工作流，相关工作点了名，主表没有它。不要和 AFlow 收成同一张 80.3。

「over 40%」要和 Table 1 的 0.2483 一起读。分子是 0.3597 减 0.2483。相对涨幅约 45%，绝对差 0.11。GPT-4 解释器上相对 CoRE 只有约 5%–6.5%。Task 1 在 GPT-4 解释器上没超过 Few 的 0.3055。Mixtral 解释器上 Task 3 的大头 few-shot 已经有了。交叉生成器是观察，不是第三条学习算法。合法计划率没有表。30 轮没有曲线。无数值奖励的任务，REINFORCE 推不动，ICL 也没有标量可写。主实验能转起来，前提是 OpenAGI 的 CLIP / BERT / ViT 都能打。

CoRE 文本不会因为某次 0.65 就把 Adam 学习率写进 Decision 步。人要允许新的 Step Type、让模型改解释器四段、把解析器从 \(I\) 里拿掉，都是改 \(I\)。这和 Gödel 改自己的决策函数、DGM 改自己的 Python 正好相反。作者把 AutoFlow 写成减少人工设计工作流。花园读成 2024 年这篇 OpenAGI 自然语言工作流搜索的定位，不读成已经闭合的递归，也不读成 AFlow 已经被这份 0.36 / 0.65 作废。名字差一个字母。基准、表示、优化器都不一样。

**读**：Table 1 的 0.3597 对 CoRE 0.2483（约 45% 相对），Table 2 的 0.6501 对 0.6104（约 6.5% 相对），Task 1 上 Few 可以高于 AutoFlow，Mixtral 生成器仍过 GPT-4 解析器，不是式 (2)。  
**不读**：把 40% 听成准确率柱、用 0.65 改 AFlow 80.3、说 CoRE 语法已经进了 \(S'\)、说已经 RSI、把 AutoFlow 和 AFlow 收成一篇。

同层：[43 AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)、[45 ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)、[46 MASS](../46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md)、[07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)、[17 OPRO](../17-OPRO-元提示优化/17-OPRO-元提示优化.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[44 GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)、[06 Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md)、[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Li, Z., Xu, S., Mei, K., Hua, W., Rama, B., Raheja, O., Wang, H., Zhu, H., & Zhang, Y. (2024). [AutoFlow: Automated Workflow Generation for Large Language Model Agents](https://arxiv.org/abs/2407.12821). arXiv:2407.12821. Table 1 的 0.3597 / 0.2483 以 HTML 为准。
2. 代码：[agiresearch/AutoFlow](https://github.com/agiresearch/AutoFlow)。
3. CoRE 语言：Xu, S., Li, Z., Mei, K., & Zhang, Y. (2024). [CoRE](https://arxiv.org/abs/2405.06907). arXiv:2405.06907。
4. 基准：Ge et al. (2023). OpenAGI. NeurIPS 2023。Zero / Few 的 GPT-4 列与 Table 2 对齐。
5. 本花园：[AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)；[ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)。AFlow 原文均分 80.3 以专文为准，不要和本表 0.36 / 0.65 横加。
