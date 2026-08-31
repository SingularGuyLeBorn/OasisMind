---
title: "56 · Chameleon：离线组合推理"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Chameleon（arXiv:2304.09842，NeurIPS 2023）：UCLA / 微软用冻着的 GPT-4 一次写出模块序列，
  再按名字绑定执行。ScienceQA 86.54 是少样本 SOTA，仍低于人手 88.40，也低于微调 MM-CoT-Large 91.68。
  TabMWP 98.78 对人手 90.22。计划不重写，不是 RSI。
tags:
  - RSI
  - Chameleon
  - ScienceQA
  - TabMWP
  - Harness
---

# 56 Chameleon：离线组合推理

打开 NeurIPS 2023 Table 3：少样本、0 个可训参数，Chameleon 接 GPT-4 在 ScienceQA 测试集总体 **86.54**。作者写成相对当时已发表的少样本最好结果高 **11.37** 个百分点，那一格是 GPT-3 CoT 的 **75.17**（86.54−75.17=11.37）。同一段还写相对 GPT-4 CoT 的 **83.99** 只高 **2.55**。禁止把 11.37 听成相对 GPT-4 CoT，也不要把 86.54 收进 [HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) 伪标签 Acc **52.62**。人手 **88.40**，Chameleon 还没摸到；微调 MM-CoT-Large **91.68**（738M）更高，那是另一档。TabMWP Table 4：Chameleon（GPT-4）总体 **98.78**，相对 GPT-4 CoT **90.81** 高 **7.97**，相对带星号的 Codex PoT-SC **81.8** 高 **17.0**，相对人手 **90.22** 高 **8.56**。81.8 是子集，表上打了 `*`。98.78 不要改 [LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 邻居 CREATOR 的 TabMWP **94.7**。

本篇落第 3 章。冻的是 `gpt-4` / `gpt-3.5-turbo` 和 Table 2 那份模块清单。改的是规划提示 \(I\)、模块说明、约束 \(G\)、示范 \(D\)。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)。**不是** RSI。**不是** 术语式 (2)。**不是** HuggingGPT：那边按下载量从 Hub 挑卡，主表是规划重合；这边一次写出模块名序列，主表是 ScienceQA / TabMWP 答题准确率。**不是** [RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md)：RestGPT 每步看执行结果再规划，TMDB Success 75.0；本篇附录写明程序**一步生成完，执行中不重规划**。RestGPT Table 4 的 Offline **29.0** 是把「HuggingGPT / Chameleon 那种一次写完」接到 REST Executor 之后的人评，不是 86.54。**不是** [Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md)：那边 SFT 改 GPT-J。一手：Lu, Peng, Cheng, Galley, Chang, Wu, Zhu, Gao；UCLA / 微软研究院；[arXiv:2304.09842](https://arxiv.org/abs/2304.09842)；**NeurIPS 2023**。数字以会议 PDF Table 1–7、§3–§5、附录 A.2–B 为准。项目 [chameleon-llm.github.io](https://chameleon-llm.github.io)。仓库与会议稿同名，不要拿第三方复现改 86.54。主表钉 NeurIPS PDF，不钉项目页宣传句，也不钉预印本分页。检索可以用 arXiv 号，对表必须翻会议稿。

## 1. 问题：LLM 不会搜、不会算、读不了图

作者把缺口写成三句：网上的新消息进不去，外部工具用不上，精确数学和逻辑靠不住。ScienceQA 要配文、读图里的字、检索、偶尔上网；TabMWP 要读课表、税表、茎叶图，还要算得准。当时一档工具增强只接搜索或计算器，覆盖面跟人列的清单走；另一档 Visual ChatGPT / ViperGPT / VisProg / HuggingGPT 把视觉模型接到对话或 Python 里。Table 1 把邻居按工具种类摊开：HuggingGPT 可接 Hugging Face，规划是自然语言；ViperGPT / VisProg 吐程序；本篇写成工具种类更多（图像、知识、网页、数学、表格），规划仍是自然语言模块名。作者的判断是：领域程序更容易写错，模块名更容易让规划器遵守人写的顺序约束。Table 1 的「>10」不要改 HuggingGPT 专文的 **24** 项任务，也不要改 RestGPT 相关工作里给 Chameleon 写的 **15**。清单以本篇 Table 2 为准。WebGPT 在表上是 10 只搜索向工具、规划写成 program；ART 是 4 只。这些格子是相关工作定性表，不是本篇主结果。

规划器 \(P\) 是冻着的 LLM，few-shot 吐模块名序列。提示里有任务指令 \(I\)、模块说明、顺序约束 \(G\)、示范 \(D\)。计划

\[
p \leftarrow P(x_0; I, \mathcal{M}, G, D),\qquad p=M_1,\ldots,M_T,\ M_t\in\mathcal{M}.
\tag{1}
\]

字符串匹配绑定模块，再按顺序执行。第 \(t\) 步

\[
y_t \leftarrow M_t(x_{t-1}; c_{t-1}),
\tag{2}
\]

\(c_{t-1}\) 是此前缓存（配文、检索、生成的 Python）。输入和缓存各更新一次：

\[
x_t \leftarrow \mathrm{update\_input}(x_{t-1}, y_t),
\tag{3}
\]

\[
c_t \leftarrow \mathrm{update\_cache}(c_{t-1}, y_t).
\tag{4}
\]

两个更新函数**人手写死**，按模块类型分。最后一只模块给出回答 \(r=y_T\)（论文式 (5)）。执行会读缓存，规划器不会根据 \(y_t\) 改后面的 \(M_{t+1}\)。附录 B 把「一步生成、没有 re-planning」写成局限。这就是 RestGPT 说的离线内省：计划一次写完。缓存更新是执行期数据流，不是改进器进了 \(S'\)。

Table 2 模块按后端分。OpenAI：Knowledge Retrieval、Query Generator、Row Lookup、Column Lookup、Table Verbalizer、Program Generator、Solution Generator。Hugging Face：Image Captioner，卡是 `nlpconnect/vit-gpt2-image-captioning`，配文最长 **16** token、beam **4**。Github：Text Detector，后端 EasyOCR。Web：Bing Search，返回 **top-3**。Python：Program Verifier、Program Executor。规则：Answer Generator。附录 Table 6 两套任务各切一份子集，可复用的标绿。ScienceQA 要求最后两步必须是 Solution Generator 和 Answer Generator，否则整条作废，退回这两步，等于 CoT。TabMWP 还要求 Program Generator 排在 Verifier / Executor 前面；不合约束就退回 Program Generator → Verifier → Executor → Answer Generator，等于带校验的 PoT。默认路径是 \(I\)，换默认等于人改退回策略。

规划器引擎：ChatGPT 用 `gpt-3.5-turbo`，GPT-4 用 `gpt-4`。程序最长 **128**，温度 **0**。LLM 模块默认 **4** 条示范、温度 0、补全最多 512。Knowledge Retrieval 在 ScienceQA 用 3 条示范，TabMWP 用 5 条。Solution Generator：ScienceQA 2 条，TabMWP **16** 条。Row Lookup 只在行数大于 3 且单元格不少于 18 时启用；Column Lookup 要至少两列且单元格不少于 18。这些阈值加速推理，也是人钉的门。Query Generator 补全帽 64。换 16 条示范，TabMWP 的 98.78 会漂。

附录 Table 8 把规划器写成 policy model：给定题目和模块集合，吐出能顺序执行的模块名。模块说明写进人话，不是 JSON schema。Query Generator 在题目需要领域知识时生成搜索词；Bing Search 再去网上找。Image Captioner 只在元数据 `has_image` 为真、且题目要理解图像语义时用。Text Detector 针对图里的字：示意图、图表、地图。Knowledge Retrieval 给背景提示。Solution Generator 要把前面那些模块的缓存拼进解答。Answer Generator 规定放在最后。示范把题映射到模块列表，例如气体粒子温度那道：`["Text_Detector","Knowledge_Retrieval","Solution_Generator","Answer_Generator"]`。换示范等于换 \(D\)。

各模块干什么，按论文 §3 钉死。Knowledge Retrieval 用 LLM 从内部知识吐提示，不是向量库。Query Generator 专门写搜索词，作者写成多数时候应该排在 Bing 前面。Image Captioner 把图翻成句子，方便后面的语言模型读。Text Detector 抽图上的字和坐标。Bing 返回三条。Row Lookup / Column Lookup 把大表收成跟题有关的子表；表太小就原样退回。Table Verbalizer 把茎叶图、函数表这类领域表翻成话，给后面的程序或解答用。Program Generator 写 Python；Verifier 查语法和逻辑；Executor 真跑。Solution Generator 走 CoT 风格写详细解答，规划器也可以跳过功能模块直接走它。Answer Generator 是规则：ScienceQA 从解答里抽片段再按相似度挑选项；TabMWP 数值题收到两位小数，选择题同样按相似度挑。

`update_input` 只在会改题目本身的模块上触发，论文点名 Row Lookup：子表替换原表。`update_cache` 承接新造出来的东西：配文、检测出的字、检索、搜索、生成的程序。后一步读的是缓存，不是规划器新写的计划。这和 [ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) 的交错想–做–看相反：那边每步观察能改下一句 Thought；这边观察进缓存，模块名序列已经锁死。

ScienceQA 的搜索空间收成：配文、识字、检索、搜索、解答。TabMWP 收成：查行、查列、表转写、检索、程序生成 / 校验 / 执行、解答。两套清单可复用的只有 Knowledge Retrieval、Solution Generator、Answer Generator 这一类，附录 Table 6 标绿。题目换域，人先换清单，不是模型自己扩 \(\mathcal{M}\)。

## 2. 机制：CoT 和 PoT 都是合法子程序

作者把 Chameleon 写成 CoT 的一般形式：若计划只剩 Solution Generator 和 Answer Generator，就是 CoT。PoT 是另一端子程序：Program Generator 加 Executor，本篇再塞进 Verifier。丰富工具集的涨分，要和「只换骨干」拆开。ChatGPT 上 ScienceQA：CoT **78.31**，Chameleon **79.93**，+**1.62**。多出来的主要在 NAT 78.82→81.62、IMG 67.92→70.80、G7-12 74.03→76.53；SOC 反而 70.98→70.64。工具在这套骨干上几乎是薄利。78.31 不要和 Table 3 里 LLaMA-Adapter\(^T\) 的 **78.31** 收成一只：一个是 1.2M 微调，一个是 0M 少样本。GPT-4 上 CoT 83.99 → 86.54，多出来的主要在 IMG **71.49→77.64**、NAT **85.48→89.83**、TXT 82.65→88.27。LAN 上 GPT-4 CoT **90.27**、Chameleon **89.82**，NO 上下文 **92.89** 对 **92.13**：总体涨了，这两列略掉。ChatGPT 版 SOC 也略掉。禁止用 86.54 覆盖所有列。Table 3 用横线把已发表区和本篇 few-shot 区切开：11.37 的减数停在横线上面的 GPT-3 CoT，横线下面的 GPT-4 CoT 不进那句「best published」。

TabMWP 上工具更值钱。ChatGPT CoT **82.03**、PoT **89.49**、Chameleon **93.28**，相对 CoT +**11.25**，相对 PoT +**3.79**。GPT-4 CoT 90.81、PoT 96.93、Chameleon 98.78；从 ChatGPT 版 Chameleon 再到 GPT-4 版，作者写成再加 **5.50**。翻车在 **OTH**（其它文本答案），不是 BOOL：ChatGPT PoT **55.24** 对 CoT **87.62**，Chameleon 拉回 **78.85**，仍低于 CoT。GPT-4 PoT OTH **68.57** 对 CoT **89.52**，Chameleon **93.33**。BOOL 另一套：ChatGPT PoT **85.89** 低于 CoT **92.89**，Chameleon 拉到 **98.11**；GPT-4 CoT BOOL **99.11** 略高于 Chameleon **98.56**，和 ScienceQA 的 LAN / NO 一样，工具不是免费涨。总体 98.78 盖不住 OTH 曾经比纯 CoT 差的那截。Codex 三行打星：59.4 / 73.2 / 81.8，是子集，不要拿 81.8 去减未打星的 98.78 再当另一张表。

![查询进冻着的规划器，一次写出模块名，按名字绑定后顺序执行；虚线下一问，权重仍冻](./images/fig-chameleon-loop.png)

> 图 1：实线是一次推理。虚线是下一查询。计划在执行前就写完，缓存只服务本题后面的模块。

**图 1 解析**

- **User query**：ScienceQA 或 TabMWP。86.54 / 98.78 是答题准确率，不是规划 Acc。
- **Planner**：式 (1)。温度 0，最长 128。没有 Continue。
- **Module inventory**：Table 2。配文卡和 EasyOCR 在墙外。
- **Sequential execute**：式 (2)–(5)。Answer Generator 是规则，不是 LLM。
- **虚线回流**：下一查询。\(I,G,D\) 和清单留下。本题缓存不留下。

## 3. 表：86.54 是少样本，98.78 过了人手

ScienceQA 主列只报总体和题型。few-shot 段钉这四行：

| 模型 | ALL | NAT | SOC | LAN | TXT | IMG | NO | G1-6 | G7-12 |
|------|-----|-----|-----|-----|-----|-----|----|------|-------|
| ChatGPT CoT | 78.31 | 78.82 | 70.98 | 83.18 | 77.37 | 67.92 | 86.13 | 80.72 | 74.03 |
| Chameleon (ChatGPT) | **79.93** | 81.62 | 70.64 | 84.00 | 79.77 | 70.80 | 86.62 | 81.86 | 76.53 |
| GPT-4 CoT | 83.99 | 85.48 | 72.44 | 90.27 | 82.65 | 71.49 | 92.89 | 86.66 | 79.04 |
| Chameleon (GPT-4) | **86.54** | 89.83 | 74.13 | 89.82 | 88.27 | 77.64 | 92.13 | 88.03 | 83.72 |

**79.93** 还出现在 GPT-3 CoT 的 NO 列。一个是 ChatGPT 版 Chameleon 的总体，一个是 GPT-3 CoT 无上下文。分母不同，禁止横加。人手 88.40，G1-6 的 91.59 高于 G7-12 的 82.42。Chameleon GPT-4 的 G7-12 是 83.72，刚过人手高年级，总体仍低于 88.40。已发表区 GPT-3 CoT 75.17 是 11.37 的减数；GPT-3 无 CoT 74.04 不要拿去减。GPT-3 CoT 分列：NAT 75.44、SOC 70.87、LAN 78.09、TXT 74.68、IMG 67.43、NO 79.93、G1-6 78.23、G7-12 69.68。微调区 LLaMA-Adapter 85.19（1.8M）贴近 86.54，协议是训适配器，不是 0M 少样本。MM-CoT-Large 91.68 用了 738M，NAT 95.91、IMG 88.80，比 Chameleon 的少样本协议高一档，作者自己把 SOTA 限定在 few-shot settings。

TabMWP 总体四行：

| 模型 | ALL | FREE | MC | INT | DEC |
|------|-----|------|----|-----|-----|
| ChatGPT CoT | 82.03 | 78.43 | 92.32 | 75.38 | 90.30 |
| ChatGPT PoT | 89.49 | 90.24 | 87.35 | 89.31 | 93.82 |
| Chameleon (ChatGPT) | **93.28** | 93.13 | 93.72 | 92.71 | 94.76 |
| GPT-4 CoT | 90.81 | 88.48 | 97.49 | 86.16 | 97.51 |
| GPT-4 PoT | 96.93 | 97.40 | 95.58 | 98.48 | 93.22 |
| Chameleon (GPT-4) | **98.78** | 98.95 | 98.29 | 99.34 | 97.42 |

人手总体 90.22。分列：FREE **84.61**、MC **93.32**、INT **84.95**、DEC **83.29**、EXTR **97.18**、BOOL **88.69**、OTH **96.20**、G1-6 **94.27**、G7-8 **81.28**。Chameleon GPT-4 的 G1-6 **98.95**、G7-8 **98.54**。**98.95** 还出现在同一行的 FREE 列：一个是 1–6 年级，一个是自由文本题，分母不同，禁止收成一只。EXTR / BOOL / OTH 没进上面那张缩表：ChatGPT CoT 是 **92.30 / 92.89 / 87.62**，PoT 是 **92.10 / 85.89 / 55.24**，Chameleon ChatGPT 是 **91.29 / 98.11 / 78.85**；GPT-4 CoT **96.86 / 99.11 / 89.52**，PoT **96.25 / 98.00 / 68.57**，Chameleon GPT-4 **98.58 / 98.56 / 93.33**。ChatGPT 版 EXTR **91.29** 低于 CoT 的 92.30，又是一列工具没涨。

Table 7 看规划多样性。ScienceQA：CoT 只有 **1** 种程序、均长 **2**；Chameleon ChatGPT **14** 种、均长 **3.03**；GPT-4 **11** 种、均长 **3.40**。TabMWP：CoT 1/2，PoT 1/3；ChatGPT **28** 种、均长 **4.17**；GPT-4 **19** 种、均长 **4.09**。GPT-4 程序种类更少，作者写成更一致。ScienceQA 上 GPT-4 均长反而比 ChatGPT 长（3.40 对 3.03），一致不等于更短。同一份规划提示，换骨干就换程序分布，说明 \(D\) 和引擎绑在一起，不是模型自己改了规划政策。Figure 4/5 的调用比例：ScienceQA 上 ChatGPT 调 Knowledge Retrieval **72%**、Bing 只有 **3%**；GPT-4 是 **81%** 和 **11%**，而且会把 Query Generator 和 Bing 绑在一起用，作者写成 ChatGPT 做不到。TabMWP 上 ChatGPT 偏 Row Lookup **47%**、Column Lookup 只有 **4%**。作者还写 ChatGPT 用不用某只工具，深受上下文示范牵着走。比例是图上读的，不要口算进 86.54。

Table 5 消融：ChatGPT 骨干、**500** 条测试，关掉模块看掉多少。ScienceQA：Knowledge Retrieval **−7.8%**，Bing **−7.4%**，Text Detector **−8.4%**，Image Captioner **−6.0%**。TabMWP：Knowledge Retrieval **−2.2%**，Program Generator **−7.4%**，Table Verbalizer **−0.2%**。500 不是全测试集，−8.4 不是主表一格。视觉和检索在科学题上更贵，程序生成在表格题上更贵，和两套清单同方向。

错误分析另采 ChatGPT 基线的 **50** 道错题。图像类错：ChatGPT **32**，Chameleon ChatGPT **10**，Chameleon GPT-4 **19**。知识类：37 → 6 和 3。GPT-4 在这 50 道上图像错比 ChatGPT 版 Chameleon 多，不要写成「换 GPT-4 每类都降」。这 50 道是从 ChatGPT 错题里抽的，不是随机 50。规划类作者写成 GPT-4 明显强过 ChatGPT，图上的柱不要口算进 Table 3。

失败案例附录 Table 19–24 分两档。一档是模块本身不准：Table 19 里 Query Generator 写得太泛，Bing 返回的死亡谷介绍没落到「有哪些生物」；配文最长 16，剪刀那条会配成「A pair of scissors next to a pair of scissors」。二档是规划漏工具：Table 20 的食物网题，规划器没调 Text Detector 和 Knowledge Retrieval，只靠配文，语义和背景都缺。Table 23 的表格题，Row Lookup 把结构关系剪掉，后面的解答器读不懂领域表。卡、cap、规划示范都在墙外。局限按附录 B 读：任务域就两套基准；规划质量绑死总分；一步生成没有重规划；模块说明还得塞进上下文，清单变长就会撞窗口。后两条正是 RestGPT 动刀的方向，本篇主表仍然是离线程序。项目页还写 GPT-4 在 ScienceQA 上常常二选一：要么知识检索，要么 Bing，很少两只一起用。这和正文「Query Generator 与 Bing 成对出现」不是同一句话，不要收成「GPT-4 会把所有检索工具叠满」。

## 4. 这不是 RSI，也不是 RestGPT 的离线版主表

\(S\) 取当前 \(\theta\)（gpt-4 或 gpt-3.5-turbo）加冻着的视觉卡。单轮连 \(S'=I(S)\) 都不成立：推理结束权重还是原样。缓存 \(c_t\) 随题清空。术语式 (2) 要的 \(I'\subseteq S'\) 更谈不上。规划提示、4-shot、温度 0、清单 \(\mathcal{M}\)、非法程序的默认回退、Row Lookup 的 3 行 / 18 格门，下次请求默认还在。模型不能把自己的规划器从 ChatGPT 换成 GPT-4 来追 86.54，不能把配文 cap 从 16 放到能讲清广告，不能把 500 条消融换成全测试集来报 −8.4。混元台阶上这是 **L0**：任务内组合，跨请求 \(H\) 冻着。要跨到术语式 (2)，至少得看见下一题的规划器读的是上一题改过的 \(I\) 或 \(\mathcal{M}\)：比如非法回退从 CoT 换成带校验的 PoT、Row Lookup 的 18 格门被改掉、配文 cap 从 16 放开、清单自己加了一只模块，并且这些改动已经接任。本篇没有这一列。下一查询仍用同一份 Table 8 / Table 9 提示。

和邻居钉死。[HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) 同是 NeurIPS 2023、同是离线自然语言规划。那边 24 项 Hub 任务、伪标签 Acc 52.62、人手顺序 18.18；这边 ScienceQA 86.54。52.62 不要改 86.54。[RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md) 把本篇收成 Offline 基线的出处之一，RestBench TMDB 29.0 不要改 86.54；RestGPT 自己的 75.0 是在线粗到细加人评。[ViperGPT](../57-ViperGPT-Python执行视觉推理/57-ViperGPT-Python执行视觉推理.md) / VisProg 吐程序调视觉 API；作者写成领域程序更易错，本篇用自然语言模块名。ViperGPT 专文钉 RefCOCO **72.0**、GQA **48.1**，不要改 86.54。主表没有 ViperGPT 的答题格，禁止从邻居论文借一列填进来。[LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 相关工作把本篇写成接解释器解子步骤，不造可复用工具。LATM 中国剩余 100.0、均分 79.7 不要改 98.78。CREATOR TabMWP 94.7 低于 98.78，协议是按题造工具，不是本篇清单。[ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) 交错想–做–看，AlfWorld 71% 不要改 86.54。[Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) 五只工具加 SFT，T-REx 53.5 不要改 ChatGPT 的 1.62 涨幅。[EASYTOOL](../53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md) 改说明书；这边模块描述人写死在规划提示里。

Bing、gpt-4、配文卡都在墙外。ScienceQA 的金标是选择题，Answer Generator 按相似度挑选项，这把尺比 RestGPT 的人评 Success 硬，也比 HuggingGPT 的规划重合硬。少样本 SOTA 的句子只覆盖 Table 3 已发表区上面那截，盖不住 MM-CoT-Large 的 91.68，也盖不住人手 88.40。可靠性专文要的墙外监督，这里至少有公开选项金标，缺的是「这只模块该不该进清单」的独立门：配文错了没有第二套 captioner 对照，Bing 三条没有人标相关性。GPT-4 既当规划器又当若干 LLM 模块，和 HuggingGPT 里 GPT-4 既造伪标签又当裁判是同一类身份重叠，只是本篇主表是答题不是规划重合。

和 HuggingGPT 的规划器再拆一次。那边四段：任务规划、模型选择、执行、响应；模型选择按下载量 top-K，执行完还要把结果收成自然语言。这边一段规划吐完模块名，绑定靠字符串匹配，没有下载量排序。那边 3497 条是伪标签规划数据；这边没有另造规划训练集，few-shot 示范直接写在 Table 8 / 9。两边都是离线，都冻 \(\theta\)，主表却不是同一把尺：52.62 是任务名重合，86.54 是科学题选对。RestGPT 的 75.0 是人评办完 REST 请求。三格不能减。

![左列权重不涨，规划提示冻着；中 WALL；右列清单、gpt-4、温度 0、4-shot、约束冻着](./images/fig-chameleon-frozen.png)

> 图 2：没有箭头更新 \(\theta\)。墙右边是下次任务默认还在、且不被本题缓存改写的 \(I\)。

**图 2 解析**

- **Grows**：\(\theta\) 不动。缓存只在本查询。
- **Planner prompt \(H\)**：\(I\)、\(G\)、\(D\) 和模块说明。没有提示搜索。
- **WALL Frozen \(I\)**：改进器身份。
- **inventory / gpt-4 / temp 0 / four-shot / \(G\) / 两套题**：换其中任一项等于人改 \(I\)。非法计划退回 CoT 或 PoT，是旋钮在墙外的活标本。换骨干能改程序种类，换不了「一步生成」这条规则。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness，一次写出冻着的模块序列。86.54 是哪一格？GPT-4、ScienceQA 测试总体、少样本。和 RestGPT 差在哪？这边执行中不重规划；那边每步看 REST 返回。还缺什么才敢叫 RSI？规划提示或清单进入 \(S'\)，并且下一轮规划器就是升级后的那份。为什么 11.37 不能写成相对 GPT-4 CoT？因为减数是 GPT-3 CoT 的 75.17，相对 GPT-4 CoT 只有 2.55。为什么 79.93 不能只出现一次？因为它同时是 ChatGPT 版总体和 GPT-3 CoT 的 NO 列。为什么 ChatGPT 在 ScienceQA 上只涨 1.62？因为工具在那套骨干上几乎吃不动，SOC 还略掉；同一套清单接到 GPT-4 才把 IMG 从 71.49 拉到 77.64。为什么 TabMWP 的 98.78 不能拿去改 CREATOR 的 94.7？因为那边按题造工具，这边用冻着的模块表。

**读**：Table 3 的 86.54 / 79.93 / 83.99 / 75.17、人手 88.40、MM-CoT-Large 91.68 不是少样本、Table 4 的 98.78 / 93.28 / 90.22 / 81.8*、11.37≠2.55、LAN 和 NO 上 GPT-4 CoT 略高、SOC 上 ChatGPT 版略掉、OTH 55.24 不是 BOOL、FREE 与 G1-6 共用 98.95、GPT-4 CoT BOOL 99.11 高于 Chameleon 98.56、Table 5 的 500 条、Table 7 的 14/11 与 28/19、72% / 3% 对 81% / 11%、一步生成无重规划、不是 RSI。  
**不读**：把 86.54 收进 52.62 / 75.0 / 91.68、把 79.93 两格收成一只、把 78.31 收进 LLaMA-Adapter\(^T\)、把 98.78 收进 CREATOR 94.7、把 29.0 改 86.54、把 11.37 听成相对 GPT-4、把 55.24 听成 BOOL、把两只 98.95 收成一只、把 50 道错题听成全测试集、把配文 16 token 听成已经能读复杂图。

同层工具：[57 ViperGPT](../57-ViperGPT-Python执行视觉推理/57-ViperGPT-Python执行视觉推理.md)、[55 RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md)、[54 HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[53 EASYTOOL](../53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md)。Model 侧：[13 Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md)。评测纪律：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 参考文献

1. Lu, P., Peng, B., Cheng, H., Galley, M., Chang, K.-W., Wu, Y. N., Zhu, S.-C., & Gao, J. (2023). [Chameleon: Plug-and-Play Compositional Reasoning with Large Language Models](https://proceedings.neurips.cc/paper_files/paper/2023/file/871ed095b734818cfba48db6aeb25a62-Paper-Conference.pdf). NeurIPS 2023. Table 1–7、§3–§5 以会议 PDF 为准；预印本 [arXiv:2304.09842](https://arxiv.org/abs/2304.09842)。项目 [chameleon-llm.github.io](https://chameleon-llm.github.io)。代码 [lupantech/chameleon-llm](https://github.com/lupantech/chameleon-llm)。
