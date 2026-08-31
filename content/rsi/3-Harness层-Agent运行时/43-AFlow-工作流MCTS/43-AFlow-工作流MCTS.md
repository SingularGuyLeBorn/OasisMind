---
title: "43 · AFlow：工作流会搜，MCTS 优化器冻着"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Zhang 等用 MCTS 在代码表示的工作流上搜算子图。
  六集均分 80.3，摘要 5.7% 不是每列都涨 5.7 个百分点；19.5% 是相对本表 ADAS 67.2 的相对涨幅。
  4.55% 是 HumanEval 美元成本比。Claude 优化器冻着。不是术语式 (2)。
tags:
  - RSI
  - AFlow
  - Harness
  - MCTS
  - 工作流搜索
  - L2
---

# 43 AFlow：工作流会搜，优化器冻着

摘要写 automatically discovers，还写小模型在特定任务上胜过 GPT-4o，成本只要 **4.55%**。人把 automatic 听成改进器在升级，把 4.55% 听成准确率。打开 Table 1：会涨的是某一类题上的工作流代码；搜工作流的 Claude、算子集、混合选择公式都还在。GPT-4o-mini 执行、测三次取平均，六集 **80.3**。人手写最好一列 CoT-SC 均分 **76.0**，差 4.3 个百分点。摘要 5.7% 对得上相对 CoT 均分 74.7 的 5.6 个百分点，不是每一列都涨 5.7。相对本表 ADAS 均分 67.2 的 19.5% 是相对涨幅 \((80.3-67.2)/67.2\)。MATH / MBPP 相对 ADAS 再报 57%，也是相对涨幅：56.2 对 35.4、83.4 对 53.4。4.55% 在附录 D：用 GPT-4o-mini 搜到的工作流交给 DeepSeek 跑 HumanEval 测试切片，美元 **0.0291** 对 GPT-4o 直答 **0.6371**，分数 93.9 对 93.89，是成本比，几乎打平不是远超。变的是工作流代码和本题输出。优化提示、算子接口、\(\alpha=0.4\) / \(\lambda=0.2\)、验证切分冻着。

本篇夹在 [ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)、[Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md) 和 [LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 旁边。综述把代码级工作流写成 [AutoFlow](../47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md) / AFlow / [ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)。ADAS 用线性档案让元 Agent 写 `forward`；这边用 MCTS，树节点是**整份工作流**。ScoreFlow 训 8B 生成器，本表 80.3 不要和那边重跑的 80.6 横加。Gödel 改自己的运行时函数；这边优化器 Claude 不进被搜对象。LATM 缓存的是一类题的 Python 函数；这边缓存的是一类基准的工作流图。四套数字禁止横加。**不是** RSI。**不是** 术语式 (2)。本表 ADAS 的 MBPP **53.4** 不要改花园 ADAS 专文的 MGSM **53.4**：分母、优化器、执行模型都不一样。一手：Zhang, Xiang, Yu, Teng, Chen, Chen, Zhuge, Cheng, Hong, Wang, Zheng, Liu, Luo, Wu；DeepWisdom / 港科广 / 人大 / 南大 / 复旦 / KAUST / 蒙特利尔；[arXiv:2410.10762](https://arxiv.org/abs/2410.10762)，**ICLR 2025 Oral**。代码 [FoundationAgents/AFlow](https://github.com/FoundationAgents/AFlow)。数字以 HTML Table 1–2、附录 D 成本表、§3–§5、式 (1)–(3) 为准。禁止用手抄 Figure 5 的 GSM8K 代码去改 80.3。禁止和 ADAS 专文的 MGSM 53.4%、Gödel-base 的 64.2% 横加。

## 1. 问题：人手写工作流贵，线性搜代码又慢

作者把 LLM 应用收成两档。Agentic workflow 按预先写好的多步调用走；autonomous agent 在环境里当场决定。工作流能把人的领域手续写进去，也因此每换一个域就要人再调一版。自动化想少用人。提示优化（DSPy / OPRO 一类）把拓扑钉死，只改话。超参优化改已有旋钮。工作流优化才动结构。GPTSwarm 用图加强化学习，条件分支不好写。花园专文见 [GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)。ADAS 用代码表示，档案却是线性列表，有限轮次里难摸到有效结构。AFlow 仍用代码当边，但节点写成带模型、提示、温度、输出格式的调用；再把 Ensemble、Review & Revise 一类常见组合收成**算子**，用 MCTS 在这份空间里走。

\(S\) 取这次部署里搜到的工作流代码：节点调用顺序、提示、用了哪些算子。单轮 \(S'=I(S)\) 可以发生：第 \(t\) 轮扩出一份新工作流。术语式 (2) 还要 \(I'\subseteq S'\)。下一轮仍用同一只 Claude-3.5-sonnet 当优化器，同一套算子接口，同一条混合选择式 (3)，同一份「只改提示和边、模型温度格式冻着」的切口。混元台阶上这不是 L0：工作流跨题还在。也到不了改改进器。和 ADAS 同一档：留下脚手架，出脚手架的程序冻着。作者写 minimal human intervention。算子集仍是人从文献里抽的。没有算子时 GSM8K 还能到 93.1%，说明 Custom 节点能自己拼出类似集成的结构；有算子时搜得更快。人没退出 \(I\)。

和邻居先划线。ADAS 专文的 53.4% 是 MGSM，元 Agent `gpt-4o-2024-05-13`，交卷 `gpt-3.5-turbo-0125`，多数域 30 轮。本表 ADAS 一行是作者用 Claude 优化、GPT-4o-mini 执行、30 轮重跑：HotpotQA 64.5，DROP 76.6，HumanEval 82.4，MBPP **53.4**，GSM8K 90.8，MATH 35.4，均分 67.2，**低于**同表 IO 的 72.8。这是他们的重实现，不是 Hu 等原文那张 MGSM 表。Gödel-base 相对 ADAS 的 MGSM 11 个百分点，分母仍是那张 MGSM，不要用本表 80.3 去改。Self-Refine 本表均分 70.7、HotpotQA 60.8，是 GPT-4o-mini、最多 3 轮；不要改 Madaan 七任务约 +20%。[GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md) 是通信图；这边是代码边。PromptAgent 的 MCTS 搜的是一条提示；这边树节点是整份工作流。

## 2. 机制：冻模型温度格式，只搜提示、边和算子

形式目标：任务 \(T\)、评价 \(G\)，在空间 \(\mathcal{S}\) 里找 \(W^*=\arg\max G(W,T)\)。完整节点可以动模型 \(M\)、温度 \(\tau\)、提示 \(P\)、格式 \(F\)。实现立刻切一刀：\(M\)、\(\tau\)、\(F\) 钉死，只搜代码边和提示，外加算子集 \(\mathcal{O}\)。式 (1) 写成

\[
\mathcal{S}_{\mathrm{AFlow}}=\{(P_1,\ldots,P_n,E,O_1,\ldots,O_n)\}.
\]

图灵完备只说明代码边的上限。主实验的搜索空间不是任意程序。算子包括 Generate、Format、Review and Revise、Ensemble、Test、Programmer，以及默认的 Custom。没有预定义算子时只用 Custom。评价必须是数值函数。主实验只覆盖有对错 / F1 / pass@1 的推理题，不是开放环境。

算子是人从文献里抽的积木，不是搜索过程长出来的。Ensemble 对应自洽投票；Review and Revise 对应 Self-Refine 那一类批评–修改；Test 对应代码测例；Programmer 把计算交给解释器。Custom 是空白调用。搜的时候允许把这些积木接进图，也允许只用 Custom 从零拼。消融说无算子仍能自己拼出类似集成的结构，分数 93.1%。有算子不是能力上限，是先验。人加一种新算子，等于人改 \(\mathcal{O}\)，也就是改 \(I\)。把「引入算子」听成系统已经会发明新积木，缺的是 \(\mathcal{O}\) 的名单写在实验设定里，不写在被搜的工作流里。

边用代码而不是 DAG，是为了写条件、循环、并行。图要 Petri 网一类扩展才能自然表达这些；神经网络边缺精确控制。作者因此站 ADAS 一边用代码。差别在搜索算法和经验结构：线性列表对树。树节点保存「从父节点改了什么、涨没涨」，再访问时可以避开失败修改。这仍是人写的 MCTS 变体，不是工作流在改 MCTS。

MCTS 的树节点是一份完整工作流，不是一次 LLM 调用。循环四步：软混合选择、LLM 扩展、执行评价、经验回传。选择把均匀分布和按分加权的 softmax 混在一起，并且始终把初始空白模板留在候选里，避免局部最优。式 (3)：

\[
P_{\mathrm{mixed}}(i)=\lambda\cdot\frac{1}{n}+(1-\lambda)\cdot\frac{\exp\bigl(\alpha(s_i-s_{\max})\bigr)}{\sum_j\exp\bigl(\alpha(s_j-s_{\max})\bigr)}.
\]

正文 \(\alpha=0.4\)、\(\lambda=0.2\)。附录伪代码把两个字母对调，花园以正文为准。扩展用优化器 LLM 看选中节点的经验：改过什么、相对父节点涨没涨、预测和期望输出的日志，再写出新提示或改连接。评价在验证集上跑 **5** 次，记均值和标准差。回传三件事：这份工作流的分、相对父节点的修改、这次优化算不算成功。终止：top-k 均分连续 \(n\) 轮不涨，或总轮次到 \(N\)。主实验 \(N=20\)。ADAS 对照 30 轮。数据先按 20% / 80% 切开，种子 42。空白模板先在验证集跑五次，留下分数方差大的题当真正用来搜的验证子集。测的是测试切片，三次平均。

初始化模板只提供调用节点和算子的空架子，优化器靠补全调用写成图。这和 FunSearch 只搜短函数、外围评价器冻着是同一类切口：空间宣传是代码，实现是填空。每次扩展「单步修改」写在案例里：加一个算子，或改一处提示，不一次重写整图。步长是人设的。经验按树走，不按线性列表把全部历史塞进越来越长的提示。作者把 ADAS 的失败写成线性启发式加经验表示太简。本表 ADAS 均分低于 IO，和这句诊断一致，但是他们的重实现，不是 Hu 等 MGSM 原文作废。

验证子集的构造要单独钉。先随机切 20%，空白工作流跑五次，再留下高方差题。搜的时候爬山的不是完整验证切，是「空白模板已经表现不稳」的那一截。分数方差大，同样的修改更容易被看见。这也让 \(G\) 更像搜索探针，不是随机抽到的持出集。测试 80% 仍要从这个协议里读：验证探针和报道分共享同一份随机切。可靠性专文要的匹配预算新任务，本实验没有另开。

![选择一份工作流，扩展出子代，验证集打分，经验回到树上](./images/fig-aflow-loop.png)

> 图 1：实线是本题搜索。回到 Select 的是下一轮。经验画在树上，不另画第五框。

**图 1 解析**

- **Select**：按式 (3) 从 top-k 加空白模板里抽。空白模板随时可以再被抽到。
- **Expand**：Claude 改提示或边，一次只走一小步。
- **Evaluate**：验证集跑五次。\(G\) 在墙外。
- **Backprop**：分和修改写回父节点经验。

优化器是 Claude-3.5-sonnet。执行可以是 GPT-4o-mini-0718、DeepSeek-V2.5、Claude-3.5-sonnet-0620、GPT-4o-0513。DeepSeek 温度 1，其余 0。人换优化器，等于人改 \(I\)。算子接口也是人写的。作者把算子写成提高搜效率的先验；消融承认这是 human-designed effort。

## 3. 数字：80.3 是六列均分，53.4 不是 MGSM

配置：GSM8K / HumanEval / MBPP 用全量再切 1:4。HotpotQA、DROP 各随机 1000 条。MATH 不是全集：617 题，四个类型（组合概率、数论、pre-algebra、pre-calculus），难度 5，记成 MATH\(_{\mathrm{lv5}^*}\)。指标：GSM8K / MATH 解题率，代码 pass@1，QA 的 F1。全部 GPT-4o-mini 执行，测试三次平均。

Table 1。IO：68.1 / 68.3 / 87.0 / 71.8 / 92.7 / 48.6，均分 72.8。CoT：67.9 / 78.5 / 88.6 / 71.8 / 92.4 / 48.8，74.7。CoT-SC（5-shot）：68.9 / 78.8 / 91.6 / 73.6 / 92.7 / 50.4，**76.0**。MedPrompt：68.3 / 78.0 / 91.6 / 73.6 / 90.0 / 50.0，75.3。MultiPersona：69.2 / 74.4 / 89.3 / 73.6 / 92.8 / 50.8，75.1。Self-Refine：60.8 / 70.2 / 87.8 / 69.8 / 89.6 / 46.1，70.7。ADAS：64.5 / 76.6 / 82.4 / **53.4** / 90.8 / 35.4，**67.2**。AFlow：73.5 / 80.6 / 94.7 / 83.4 / 93.5 / 56.2，**80.3**。

列不要平均着听。GSM8K 人手写已经 92.8，AFlow 93.5，只多 0.7 个百分点。HotpotQA 从最好人手写 69.2 到 73.5。MBPP 从 73.6 到 83.4。MATH 从 50.8 到 56.2，仍远不是满分。ADAS 这一行均分低于 IO：他们的线性搜在这套协议里没搜到比直答更好的工作流。19.5% 的分母是 67.2，不是 76.0。57% 的分母是 ADAS 的 MATH 35.4 和 MBPP 53.4，不是人手写最好列。禁止把 57 听成百分点。

Table 2 只在 HumanEval 测试切片上换执行模型。Ours 是 GPT-4o-mini 搜到的工作流，Ours* 是 DeepSeek-V2.5 搜到的。GPT-4o-mini 执行：IO 87.0，Ours 94.7，Ours* 90.8。DeepSeek 执行：IO 88.6，Ours 93.9，Ours* 94.7。GPT-4o 执行：IO 93.9，Ours **96.2**，Ours* 95.4。Claude 执行：IO 90.8，Ours 95.4，Ours* 94.7。DeepSeek 搜到的工作流拿到 GPT-4o-mini 上只有 90.8，低于 4o-mini 自己搜的 94.7。作者写成不同骨干要不同工作流。花园再钉一句：工作流不是与模型无关的通用程序。搜的时候用哪只执行器，测试时换骨干会裂。

附录 D 把 HumanEval 测试切片的美元账钉死。GPT-4o IO：分数 0.9389，成本 **0.6371**。DeepSeek 跑 AFlow（GPT-4o-mini 搜到的）：0.9390 / **0.0291**，\(0.0291/0.6371\approx 4.55\%\)，分数几乎打平。DeepSeek 跑自己搜到的：0.9466 / 0.0377，约 **5.92%** 成本且略高于 GPT-4o IO。GPT-4o-mini 跑自己搜到的：0.9470 / 0.0513，约 **8.05%** 成本。GPT-4o 自己跑 AFlow（4o-mini 搜到的）分数到 0.9620，成本 1.0111，比直答更贵。4.55% 只属于「DeepSeek 执行、4o-mini 搜到的那条工作流、对 GPT-4o 直答」。不要写成小模型全面战胜 GPT-4o。Pareto 图画的是这一张 HumanEval 切片，不要外推到 MATH。

GSM8K 消融：无算子仍 **93.1%**，超过人手写。有算子更快摸到更好结构。Figure 6 最优路径：空白 → 加 ScEnsemble（0.8872）→ 加 Programmer 复查（0.9160）→ 改格式提示（0.9333）→ 改逐步检查提示（0.9352）。失败轮次包括：自定义 review 直接改答案（第 5 轮）、改写题目时过分盯折扣（第 14 轮）。一次只改一个算子或一处提示。这是人设的步长，不是系统自己决定步长。MBPP 搜到类似 AlphaCodium 的测例生成加修复。MATH 上拿掉 Programmer 会掉分。这些是案例，不改 Table 1。

附录 F 的写小说不要进主表。八轮之后产出约 2.7 万词，作者写成质量和效率都比基线好。没有和 Table 1 同级的解题率，也没有墙外文学金标。开放域没有 \(G\) 时，AFlow 的「直接执行拿反馈」这一条断掉。主实验能搜，是因为六集都有数值器。缺金标的医学、法律，综述自己列为 Excel 的障碍，本篇不把附录故事当成已测 RSI。

Self-Refine 在这张执行器表上均分 70.7，低于 IO 的 72.8。最多 3 轮、GPT-4o-mini、这六集切分。不是 Madaan 那篇作废，是「自评自改」换骨干和题集以后可以掉到直答以下。MedPrompt 均分 75.3，HumanEval 上 91.6 和 CoT-SC 并列，GSM8K 90.0 低于 IO 的 92.7。人手写方法换列就会裂。AFlow 的 80.3 是六列一起报；单看 GSM8K 几乎贴着天花板，单看 MATH 仍只有 56.2。不要用均分掩盖列。

## 4. 这不是术语式 (2)，算子集也不是改进器

工作流变了，下一道同基准的题走新图。改进器没变。Claude 优化提示、算子 Python 接口、式 (3)、20 轮、验证 5 次、种子 42、只搜 \(P\) 和 \(E\) 的切口都还在。混元 L0 装不下跨题保持的工作流；L3 要改提议 / 选择程序。本篇停在留下状态、不改程序。摘要里的 automatically 指少写具体工作流，不是 \(I\) 在改自己。

验证集参与爬山。空白模板先筛高方差题。\(G\) 既当搜索信号也当报道分。可靠性专文要的墙外验收，主表没有另备一套从未进过验证切分的题。MATH 只有难度 5 的四个类型。HotpotQA / DROP 各 1000 条随机。换切分，80.3 会动。ADAS 对照轮次更多（30 对 20），均分反而低，说明他们的线性搜在这套执行器上没帮上忙，不能反过来说「MCTS 已经等于 RSI」。

和 ADAS 钉死。MGSM 53.4 是原文；本表 53.4 是 MBPP。元模型：那边 gpt-4o，这边 Claude。交卷：那边 3.5-turbo，这边 4o-mini。和 Gödel 钉死。那边 monkey patch 自己的 `solver`；这边 Claude 不读自己的优化提示。和 LATM 钉死。79.7 是逻辑演绎；这边 80.3 是六列均分。LATM 的函数按类留；这边工作流按基准留。和 PromptAgent 钉死。BBH 0.802 是提示；这边是算子图。和 Self-Refine 钉死。本表 70.7 低于 IO，说明 4o-mini 上最多 3 轮自评自改不是免费涨分。和 LATS 钉死。HumanEval 92.7 是本题 MCTS；这边 94.7 是工作流搜完再交卷，树在搜索阶段，测试时图已经冻住。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness 里的工作流代码。权重动了没有？没有。80.3 是不是每列都比人手写高 5.7 个百分点？不是，GSM8K 只高 0.7。还缺什么才叫花园 RSI？优化提示或算子集进入 \(S'\)，并且下一类新基准用的就是升级后的那份搜索手续。作者把应用场景写在附录 F，包括写小说 2.7 万词、八轮。那是案例，不进 Table 1。没有墙外检查「这张工作流该不该进下一次搜索的先验」。错工作流一旦当父节点，经验回传会把歪修改也留下。种子 42 的切分一换，验证探针那批高方差题也会换。80.3 绑在这一次随机切上。

![上排工作流代码与本题输出 y；下排 Claude 优化器、算子、选择公式冻着](./images/fig-aflow-frozen.png)

> 图 2：实线只更新工作流和本题答案。虚线是冻着的模型和配方。

**图 2 解析**

- **左列**：工作流可以多一轮修改，本题 \(y\) 可以变。
- **右列**：优化器、算子、式 (3)、切分种子仍是人写的。
- **读法**：图在长不等于 \(I\) 在长。ADAS 的线性档案和这边的树都在墙外选父节点。

同一句「自动生成 Agent 工作流」，至少分三截。提示优化把图钉死。ADAS 线性搜代码。AFlow 用 MCTS 加算子。三截不要收成「都已经是 RSI」。相关工作还点了 [GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)、DSPy。GPTSwarm 边概率是另一张表，GAIA 90.2% 不要和本表 80.3 横加。DSPy 先要人搭图。

「4.55%」要和附录 D 的分子分母一起读。分子是 DeepSeek 执行、4o-mini 搜到的工作流，0.0291 美元。分母是 GPT-4o 直答 0.6371。分数 93.9 对 93.89。换成 4o-mini 自己执行自己的工作流，成本比变成 8.05%，分数 94.7。Pareto 上「弱模型胜过强模型」成立的条件是：强模型走直答，弱模型走搜过的工作流。两边都走 AFlow 时，GPT-4o 仍是 96.2，高于 DeepSeek 的 94.7。不要用 4.55% 改 80.3。

生成提示不会因为某次 80.3 就把式 (3) 的 \(\lambda\) 写进工作流。人要加新算子、把优化器也放进搜索、让模型改 \(\alpha\)，都是改 \(I\)。这和 Gödel 改自己的决策函数、DGM 改自己的 Python 正好相反。作者把 AFlow 写成在代码工作流上走 MCTS、用算子摊先验。花园读成 2025 年这篇六基准工作流搜索的定位，不读成已经闭合的递归，也不读成 ADAS 原文已经被这张表作废。无数值 \(G\) 的任务，执行评价这一步没有分数可回传，搜索停在人写的启发式。主实验能转起来，前提是六集都有机器能打的分。附录小说没有这种分。把 2.7 万词听成 Table 1 的第七列，缺的是没有解题率可以核对。

**读**：Table 1 的 80.3 对 CoT-SC 76.0、对 ADAS 67.2，19.5% 和 57% 是相对涨幅，本表 ADAS 的 53.4 是 MBPP 不是 MGSM，4.55% 是 0.0291/0.6371，GSM8K 无算子 93.1，不是式 (2)。  
**不读**：把 5.7 / 19.5 / 4.55 听成同一把尺、用 MGSM 53.4 改本表、说 Claude 已经在改自己的优化提示、说算子是模型发明的、说已经 RSI。

同层：[07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)、[06 Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md)、[04 DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)、[26 PromptAgent](../26-PromptAgent-MCTS提示规划/26-PromptAgent-MCTS提示规划.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[12 Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)、[28 LATS](../28-LATS-Agent树搜/28-LATS-Agent树搜.md)、[44 GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)、[45 ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)、[47 AutoFlow](../47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md)、[46 MASS](../46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md)、[48 MAS-GPT](../48-MAS-GPT-一次前向吐MAS/48-MAS-GPT-一次前向吐MAS.md)、[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Zhang, J., Xiang, J., Yu, Z., Teng, F., Chen, X.-H., Chen, J., Zhuge, M., Cheng, X., Hong, S., Wang, J., Zheng, B., Liu, B., Luo, Y., & Wu, C. (2025). [AFlow: Automating Agentic Workflow Generation](https://arxiv.org/abs/2410.10762). ICLR 2025. arXiv:2410.10762. Table 1 的 80.3 / 67.2 / 53.4 以 HTML 为准。
2. 代码：[FoundationAgents/AFlow](https://github.com/FoundationAgents/AFlow)。
3. 本花园：[ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)；[Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md)。ADAS 原文 MGSM 53.4% 以专文为准，不要和本表 MBPP 53.4 横加。
