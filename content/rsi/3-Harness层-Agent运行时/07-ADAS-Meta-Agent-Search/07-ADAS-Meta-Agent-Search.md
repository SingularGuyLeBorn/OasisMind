---
title: "07 · ADAS：元 Agent 会写代码，但自己不改自己"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  ADAS / Meta Agent Search（arXiv:2408.08435）：GPT-4 当冻结元 Agent，用代码搜下游 Agent。
  MGSM 53.4%、DROP F1 79.4；转 GSM8K +25.9%。不是 RSI。Gödel-base 公平对照的那一行。
tags:
  - RSI
  - ADAS
  - Meta Agent Search
  - Harness
  - 元学习
---

# 07 ADAS：元 Agent 会写代码，但自己不改自己

手写 Agent 把 CoT、辩论、角色分工钉在源码里。每换一个域，人再调一版。机器学习史反复出现同一句：手搓特征会被学会的特征替换。ADAS 把这句话搬到 Agent 设计上——搜索空间、搜索算法、评价函数三件套，让一只元 Agent 用 Python 写出下一只下游 Agent。

本篇是 Harness 层「元学习」这一档的样板，夹在手写脚手架和自指运行时之间。读 [Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md) 时 Table 1 那行 Meta Agent Search **53.4%** MGSM，数字就来自这里。读 [DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 的消融 w/o self-improve，复制的也是「元 Agent 永远是初始那份」。**不是** RSI：写下游的那只元 Agent 权重不动、提示不动、搜索手续不动。作者自己把「让元 Agent 也被 ADAS 改」写成未来工作（higher-order ADAS），等于承认本实验没做这件事。一手：Hu, Lu, Clune，[arXiv:2408.08435](https://arxiv.org/abs/2408.08435)；项目页 [shengranhu.com/ADAS](https://www.shengranhu.com/ADAS/)；代码 [ShengranHu/ADAS](https://github.com/ShengranHu/ADAS)。附录写明元 Agent **gpt-4o-2024-05-13**，交卷 **gpt-3.5-turbo-0125**。ARC 搜 25 轮，其余域各 30 轮。除 GPQA 外验证 128 / 测试 800；GPQA Diamond 验证 32 / 测试 166。DROP 跟 OpenAI simple-evals 用 one-shot，其余 zero-shot。GPQA 评五次，其余评一次。

## 1. 三件套：空间、算法、评价，缺一不可

论文把 ADAS 收成优化问题，不是一句「让 AI 设计 AI」。

**搜索空间**决定哪些 Agent 能被表示。只搜提示（PromptBreeder、OPRO）时，工作流形状被锁死，换控制流的设计进不了空间。图、网络当空间时，工具调用等组件常常仍钉死。GPT-Swarm 一类用强化学习改节点连边，DyLAN 改网络连接，DSPy / Trace 在给定节点集合的笛卡尔积上优化——工作流能动，工具等仍常冻。ADAS 主张用**代码**当空间：Python 图灵完备，提示、工具、工作流理论上都能写出来。可读代码还有一层：设计模式能给人看，便于调试，也便于安全审计。作者还说代码空间更容易站在人类已有框架（LangChain 一类）上继续搜，不必把人类积木先翻译成图节点。

实践折扣立刻出现。理论空间包含任意程序，实现只让元 Agent 写 `forward`。查询 API、评测夹具、容器，都是人先写好的。这和 FunSearch 只搜短函数、外围采样器/评价器冻着，是同一类「空间宣传 vs 实现切口」。读 ADAS 不要停在「图灵完备所以什么都能搜到」。

Sutton 那篇 Bitter Lesson 被引言转成 Agent 版：算力和数据上来之后，手搓的 HOG、手搓的网络结构，都会让位给搜索和学。作者把 Agent 积木（CoT、记忆、工具、反思、角色）看成还处在「手搓特征」阶段，ADAS 想当 CNN 替换 HOG 的那一步。替换的是**设计手续**，不是基础模型权重。读者若已接受预训练缩放，这里要分清：缩放的是 $\theta$，ADAS 缩放的是 $\pi$ 的代码。两件事可以同时真，不是一件。

**搜索算法**决定怎么走这个空间。本篇的算法叫 **Meta Agent Search**：基础模型当元 Agent，根据不断变长的档案，迭代编程「有意思的新 Agent」。有意思（interestingness）借的是开放式算法那套词，鼓励新颖或值得做的设计，不是纯贪心刷验证分。作者承认搜索算法本身很简单，未来可加 Quality-Diversity、探索–利用平衡。主实验没有这些。因此档案增长不等于 QD 地图；它更像「带着历史的迭代编程」。若新 Agent 只是微调提示、控制流不变，空间优势就被浪费——OPRO 那一行已经演示了只动提示时数学甚至会输给手写 Debate。

**评价函数**决定什么叫好。本实验几乎只用验证集准确率。附录：除 GPQA 外验证 128 / 测试 800；GPQA Diamond 32 / 166；GPQA 评五次、其余评一次，让总调用次数大致齐。ARC 另划 20 / 60，每套五次。报 95% bootstrap。代价、延迟、安全写在菜单里，主文没拿来优化。搜看验证集，交卷看留出测试。验证集不大，搜索等于在这几百道上爬山。内部对照自洽，不是全量 MGSM / MMLU 新 SOTA。DROP one-shot，其余 zero-shot，跟 OpenAI simple-evals 的 DROP 惯例。

实现切口：不到 **100 行**框架提供查询 API 和提示格式化，元 Agent 写 `forward(task) → answer`，对照 [FunSearch](../../4-Artifact层-产物发现/04-FunSearch-函数空间搜索/04-FunSearch-函数空间搜索.md) 的短函数接口。框架是墙外 $I$。图灵完备只说明空间上限，不说明 30 轮 gpt-4o 能走到任意点。元模型与交卷模型的具体编号是 **gpt-4o-2024-05-13** 与 **gpt-3.5-turbo-0125**，Gödel Agent 后来沿用同一对，为的是对照而不是换更强考生。

## 2. Meta Agent Search：档案会涨，元 Agent 不会

每一轮：元 Agent 读档案（已发现的 Agent 名、思想、代码、验证分）→ 写 thought / name / code 三件套 → 新 `forward` 在验证集上跑 → 通过则入档 → 档案变长，下一轮继续。档案初始可以塞进手写基线（CoT、Self-Refine、Debate 等）；附录 I 也试过空初始化。

系统提示把元 Agent 说成「机器学习研究员」，目标是最大化指定指标，并明确要求观察档案里的垫脚石、从文献找灵感、提出 interestingly new 的设计。输出必须是完整可运行的 `forward`，不是伪代码。名字也由元 Agent 起（Table 3 有一处作者觉得名字含糊，人工改过，表上标了 dagger）。这套提示是 $I$ 的一部分，下游 Agent 再强，也改不了这张提示。

Refine until novel and error-free：生成之后会改到能跑、看起来新，再评。这是工程环，不是自改元 Agent。虚线从档案回到元 Agent，带的是**文本上下文**，不是梯度，也不是对元 Agent 源码的 monkey patch。Gödel Agent 附录 D 写：同一套划分上，ADAS 的 Meta Agent Search 大约 **300 美元**，Gödel 完整演化约 15 美元。300 美元买的是 GPT-4 写 30 轮脚手架、GPT-3.5 去考试。分数涨在 Harness，不在交卷模型权重。本篇不把美元差写成「更智能」，只写成搜索手续更贵、更外置。

![Meta Agent Search：GPT-4 冻在左边，档案在右边变长](./images/fig-adas-meta-archive.png)

> 图 1：实线是一轮发现。虚线是档案回注元 Agent 的提示。底栏元 Agent、评价协议、搜索配方都不更新。

**图 1 解析**

- **Frozen meta GPT-4**：改进器 $I$。提示模板在附录，域描述会换，元模型不变。
- **programs forward()**：搜索空间的可写部分。只能写前向，框架 API 是给定的。
- **Eval on validation**：墙外尺子。ARC 验证 20 题、测试 60 题；Gödel 后来跟它对齐划分。
- **Agent archive**：开放档案的雏形。DGM 把「档案 + 自改」做成消融里必须同时开的两件事；这里档案在，自改不在。
- **Frozen wall**：Gödel Agent 要拆的就是这堵墙。拆之前，本篇已经证明：冻住 $I$，只搜 $S$，问答脚手架也能大幅超过手写。RSI 要的是下一句；本篇停在这一句。墙外还有容器和人工检查，生成代码不直接碰跑实验的机器。这是执行隔离，不是评价函数里写进去的安全目标。

related work 把 ADAS 放进 Clune 的 AI-Generating Algorithms 三支柱：元学习结构、元学习学习算法、生成环境和数据。作者说本工作同时踩前两根——既搜 Agent 结构，又在 ARC 上用 in-context「学会学习」。第三根（自动出题、出环境）他们点了 OMNI-EPIC、POET，本实验没做。FunSearch、EoH、DiscoPOP、Eureka 都是「FM 写代码当发现物」；ADAS 发现物是 Agent。PromptBreeder 被明确放到「只搜提示」的第一类，空间不够。这张地图的用处：看见「自动设计」四个字，先问搜的是提示、图边、还是 `forward`。

GPT-4 写、GPT-3.5 考，后来被 Gödel Agent 原样继承。理由也一样：省评测钱，并把涨分归因到脚手架而不是换更强交卷模型。读 Table 1 时若默默假设交卷是 GPT-4，53.4% MGSM 的意义会漂。基线也必须是 GPT-3.5 上的 CoT / Debate，不能拿 GPT-4 的 CoT 来比。

## 3. ARC：垫脚石会留下来，即使当时分不高

ARC（Chollet, 2019）要模型从几张格子例子里学会变换规则，再预测测试格。作者跟 Greenblatt (2024) 等常见做法走：让 Agent **写变换代码**，框架提供评代码的工具，不直接猜格子。直接输出格子对当前模型太难；写成程序再跑，等于把验证器嵌进框架，生成–验证缺口被工具拉大——注意工具在框架里，不在被搜的 `forward` 必须从零实现的那一部分。题仍太难，他们只从 Public Training Set（Easy）里抽格子边长 $\le 5\times 5$ 的题：验证 20、测试 60，每套评五次降方差。元 Agent gpt-4o，发现的 Agent 和基线都用 gpt-3.5-turbo 考。25 轮。

基线：CoT、COT-SC、Self-Refine、LLM-Debate、Quality-Diversity（简化的 Intelligent Go-Explore）。这些基线也是档案种子，并且用同一套框架实现，避免「手写基线享受另一套运行时」。附录 I 的空档案是对照：没有人类积木当垫脚石，搜索会不会还涨。主文数字以有种子的档案为准；读论文时不要把附录空初始化的曲线和 Table 1 混在一张嘴说。

Figure 3 的叙事比单点分数重要。第 3 轮出现一种模式：多路 CoT 出候选，再精炼，再集成。后来的设计反复用它。最终最好的 Agent 有一套复杂反馈，但不是一次写出来的：多样反馈、按效率/简洁等特质请「专家」评、模拟人类式反馈，分别出现在第 5、11、12 轮。当时这些垫脚石分数不必高；后来的设计把它们交叉起来，作者拿这比喻进化里的 crossover。开放档案的意义在这儿：留下「当时不优、后来有用」的节点。DGM 论文 Figure 3 后来把这件事画成树；源头的讲法在 ADAS。

Table 3 给出 GPT-3.5 考 ARC 时搜到的前三名，以及迁到别的模型上的分。GPT-3.5 上 Structured Feedback and Ensemble **13.7 ± 3.9**，手写 CoT 只有 **6.0 ± 2.7**，COT-SC **8.0 ± 3.2**。迁到 Claude-Sonnet（claude-3-5-sonnet-20240620）时，Dynamic Memory and Refinement 到 **48.3 ± 5.7**，作者写 nearly 50%。迁到 GPT-4（gpt-4o-2024-05-13）同一套 Agent 是 **37.0 ± 5.3**。注意：搜的时候交卷模型是 GPT-3.5，迁模型是零样本转移工作流，不是在 Claude 上重新搜。GPT-3.5 上最好的那套复杂反馈，换到更强模型上不一定仍是第一——更强模型吃更简单的反馈、更多轮精炼。作者把这当成对基础模型的诊断：GPT-3.5 更不会自评，所以要复杂反馈机构。

ARC 这张子集不是公开排行榜全量。边长 $\le 5$、Easy 训练公集，20/60 划分。数字用来证明「搜工作流比手写 CoT 强」，不要写成 ARC-AGI 新 SOTA。

## 4. 四域：数学和阅读空档大，科学几乎贴着天花板

四个域独立搜，各 30 轮，仍是 GPT-4 写、GPT-3.5 考。DROP 阅读（F1）、MGSM 多语数学、MMLU、GPQA。基线加上 Step-back、Role Assignment，以及提示优化 OPRO。

Table 1（留出测试集，95% bootstrap）：

| | DROP F1 | MGSM | MMLU | GPQA |
|--|---------|------|------|------|
| 手写最强附近 | Role 65.8 / Debate 数学 39.0 | Debate 39.0 | COT-SC 65.9 | Self-Refine 31.6 |
| OPRO | 69.1 ± 0.9 | 30.6 ± 3.2 | 67.6 ± 3.2 | 32.9 ± 3.2 |
| **Meta Agent Search** | **79.4 ± 0.8** | **53.4 ± 3.5** | **69.6 ± 3.2** | **34.6 ± 3.2** |

作者强调两处大空档：阅读 F1 相对手写 **+13.6 / 100**（79.4 − 65.8），数学相对 Debate **+14.4** 个百分点（53.4 − 39.0）。MMLU、GPQA 也赢，缝小。解释是：科学和多任务上模型可能根本没知识，改脚手架补不了；阅读和数学上知识够，错主要是幻觉和计算，脚手架能补。这和 Gödel 后来 GPQA 几乎不动（34.6→34.9）是同一张表上的同一列——自指也挤不动缺知识的题。

OPRO 这一行的用处：只搜提示，数学 30.6，甚至低于 Debate 的 39.0。代码空间搜工作流，不是「提示优化换了皮」。手写 Debate 已经是多模型对话，OPRO 改的是话术，改不动「要不要辩论」这件事。ADAS 能把辩论、角色、集成写进 `forward`，所以数学空档来自控制流，不只来自更会说话。Gödel Table 1 的 ADAS 行直接抄这里的 79.4 / 53.4 / 69.6 / 34.6。公平对照时不要把 OPRO 和 ADAS 混成一个「自动设计」桶。

DROP 上 Role Assignment 手写 65.8，OPRO 69.1，ADAS 79.4。提示优化已经赢过多数手写，代码搜索又把 F1 再抬一截。阅读理解是「知识够、流程能补幻觉」的典型。GPQA 上 Self-Refine 31.6、OPRO 32.9、ADAS 34.6，缝在误差附近。作者的知识瓶颈假说和这列数字一致：脚手架救不了不会的研究生题。后面 Gödel-base 在同一列从 34.6 到 34.9，几乎重复了这条假说。

独立搜的含义：四只冠军 Agent 不必共享结构。转移实验才问「数学冠军能不能去考阅读」。读者不要把 Table 1 四列听成同一套 `forward` 的四个分数。

## 5. 转移：数学上搜到的 Agent，能带到 GSM8K，也能蹭阅读

把 MGSM 上最好的三只迁到 GSM8K、GSM-Hard（同类数学），以及 MMLU、DROP（非数学）。Table 2：

| 从 MGSM 迁出 | MGSM | GSM8K | GSM-Hard | MMLU | DROP F1 |
|--|------|-------|----------|------|---------|
| Dynamic Role-Playing | 53.4 ± 3.5 | 69.5 ± 3.2 | 31.2 ± 3.2 | 62.4 ± 3.4 | 70.4 ± 0.9 |
| Structured Multimodal Feedback | 50.2 ± 3.5 | 64.5 ± 3.4 | 30.1 ± 3.2 | 67.0 ± 3.2 | 70.4 ± 0.9 |
| Interactive Multimodal Feedback | 47.4 ± 3.5 | 64.9 ± 3.3 | 27.6 ± 3.2 | 64.8 ± 3.3 | 71.9 ± 0.8 |
| 手写 Debate（对照） | 39.0 | 43.6 | 17.4 | 65.6 | 60.6 |

相对手写，作者报 GSM8K **+25.9**、GSM-Hard **+13.2**（69.5 − 43.6，31.2 − 18.0；18.0 是 Role Assignment 在 GSM-Hard 上的手写分）。非数学转移：分不如在目标域上专门搜的那只（DROP 专搜 79.4，数学迁过去最好 Interactive 71.9），但仍高于手写 CoT 的 64.2。作者的判断：发明的是可迁移的设计模式，不是过拟合 MGSM 的咒语。代价是搜的时候每个域独立，并没有一只「通才 Agent」在多域目标上被直接优化——那是讨论里的未来工作。

名字里的 Multimodal 是元 Agent 起的，主实验仍是文本 QA，不要听成视觉多模态系统。Table 3 作者已经示范过：名字含糊就人工改。读档案时把营销式命名和真正前向逻辑分开。

## 6. 不是 RSI：higher-order 写在未来工作里

Gödel-base 相对本篇 MGSM 53.4→64.2，那 11 个百分点比的是**同一套划分、同一只 gpt-3.5-turbo-0125 考生、同一只 gpt-4o 写手**。差别是：ADAS 的写手不能改自己，Gödel 的写手在运行时改 $\pi$ 和 $I$。不要拿 Gödel-free 的 90.6% 来「打败」本篇 53.4——无约束实现被 Gödel 论文自己用斜体拿出公平表。STOP 没有第二只元 Agent；DGM 关掉自改就回到本篇设定。三篇后出的论文都把 ADAS 当「冻元」锚点，本篇专文的职责就是把锚点上的数字和切口写全，免得对照时各说各话。

按 [01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)：$S$ 是下游 `forward`，$I$ 是元 Agent + 框架 + 评价协议。$S'=I(S)$ 每轮都发生。RSI 要 $I'\subseteq S'$。本实验 $I$ 冻死。作者 §6 第一条未来工作就是 Higher-order ADAS：元 Agent 自己也是 Agent，理论上可以被 ADAS 改，甚至改到元元 Agent。句子是虚拟语气。Gödel Agent、STOP、DGM 做的是这条清单上的下一步，不是 ADAS 主实验已经交付的东西。混元阶梯上这是 **L2**：改脚手架，证据是留出测试；元 Agent 没进 $S'$，到不了 L3。特征失败是验证集过拟合和工作流过拟合某一 FM——Table 3 已经显示 GPT-3.5 上的最优结构迁到更强模型会换人。

![三档：手写 → 冻元搜索 → 自指改 $I$](./images/fig-adas-three-tiers.png)

> 图 2：左档人写死脚手架；中档 ADAS 搜下游、元 Agent 冻；右档 Gödel / DGM 让 $I$ 改 $I$。ADAS 论文把右档标成未来。

**图 2 解析**

- **手写**：CoT / Debate。$I$ 是人。
- **ADAS**：档案 + 代码空间。$I$ 是 GPT-4 元 Agent，不变。
- **自指**：Gödel monkey patch、DGM 改自己的 Python。$\theta$ 仍然冻。
- 中→右那支实线是研究史，不是本实验的数据流。

| | 改什么 | 元 / 改进器 | 算不算 RSI |
|--|--------|-------------|------------|
| [OPRO](../17-OPRO-元提示优化/17-OPRO-元提示优化.md) / [Promptbreeder](../16-Promptbreeder-自我指涉提示进化/16-Promptbreeder-自我指涉提示进化.md) | 提示文本 | 冻 | 否 |
| ADAS | 下游 `forward` | 元 Agent 冻 | 否；Harness 元学习 |
| STOP | 改进器程序 | $I$ 对自己递归 | 弱候选 |
| Gödel Agent | 运行时 $\pi$ 与 $I$ | 可自改 | 弱候选；公平对照打的是本篇 53.4 |
| DGM | Agent 代码 + 档案 | 自改；无自改则复制 ADAS | 弱候选 |

安全：生成代码在容器里跑，另加人工检查和仓库警告，对齐 SWE-bench / Voyager 那类受控执行。作者认为公开算法是净收益——API 就能写 ADAS，不必自有 GPU，社区应当知道可及性。他们也写 ADAS 可能加速 AGI、应用 Constitutional AI 一类约束，以及「可解释工作流比黑盒更可审计」。本花园只记：主实验的安全措施是沙箱和人工，**没有**把安全目标写进评价函数。单步 QA，不是多步环境。评价贵、丢日志信息——元 Agent 看不见详细失败轨迹，只能看见一个验证分。多目标（成本、延迟、稳健）写在菜单里没做。在线部署后用环境反馈继续改 Agent，也是未来工作，不是本实验。

这些「没做」不是攻击论文，是帮读者把 ADAS 从 RSI 通稿里拆出来。能做的已经很多：代码空间、档案垫脚石、跨域跨模型转移、明确赢过 OPRO。缺的是那一句 $I'\subseteq S'$。作者把缺写成未来工作，比二手摘要诚实。

**读**：三件套；`forward`；GPT-4 写 / GPT-3.5 考；DROP 79.4、MGSM 53.4、+13.6 F1、+14.4 MGSM；GSM8K 转移 +25.9；ARC 子集 13.7→Sonnet 48.3；higher-order 是未来工作。  
**不读**：把 53.4% 听成 RSI、把 ARC 子集听成 ARC-AGI 榜、把「nearly 50%」听成在 GPT-3.5 上搜出来的、把 Gödel-free 90.6% 和本篇 53.4 拼成一条涨幅。

同层自指：[06 Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md)（公平对照打本篇 Table 1）；[04 DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)（无自改 ≈ 本篇）；[05 STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md)。同层工作流 MCTS：[43 AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)（本表 ADAS 的 MBPP 53.4 不要改本篇 MGSM 53.4）。产物层代码搜索：[FunSearch](../../4-Artifact层-产物发现/04-FunSearch-函数空间搜索/04-FunSearch-函数空间搜索.md)。数字只认 arXiv:2408.08435 的 Table 1–3 与 §4.3，不认二手「自动设计 Agent 已经自我进化」。

## 参考文献

1. Hu, S., Lu, C., Clune, J. (2024). [Automated Design of Agentic Systems](https://arxiv.org/abs/2408.08435). arXiv:2408.08435. Table 1–3、ARC 20/60、GPT-4 / GPT-3.5、higher-order 未来工作以该文为准。
2. 项目页：[shengranhu.com/ADAS](https://www.shengranhu.com/ADAS/)。代码：[ShengranHu/ADAS](https://github.com/ShengranHu/ADAS)。
3. Yin et al. (2024). [Gödel Agent](https://arxiv.org/abs/2410.04444). Table 1 基线引用本篇。
4. Zhang et al. (2025). [DGM](https://arxiv.org/abs/2505.22954). w/o self-improve 复制固定元 Agent。
5. 本花园：[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。
