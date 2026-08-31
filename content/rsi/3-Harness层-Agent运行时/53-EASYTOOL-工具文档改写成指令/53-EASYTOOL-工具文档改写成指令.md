---
title: "53 · EASYTOOL：改工具文档，不改权重"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  EASYTOOL（arXiv:2401.06201，NAACL 2025）：复旦 / 微软亚研 / 浙大把冗长工具文档
  收成「功能描述 + 带参数示范的指南」。ChatGPT 两段改写，骨干 θ 冻着。ToolBench
  上 ChatGPT+DFSDT 均 pass 从 62.3 走到 69.8，不要改 ToolLLM 六列均 pass 66.7。
  改的是 Harness 里的说明书，不是 RSI。
tags:
  - RSI
  - EASYTOOL
  - ToolBench
  - 工具文档
  - Harness
---

# 53 EASYTOOL：改工具文档，不改权重

作者把结论写成：把文档收成统一的 tool instruction，LLM 更能跟指令、更能调工具，token 还更少。打开 NAACL 2025 相机稿 Table 4：只测 ToolBench 的 I2-Category 和 I3-Instruction，一共 **300** 条。ChatGPT+DFSDT 均 pass **62.3**、均 win **66.5**、均 success **15.0**；加上 EASYTOOL 走到 **69.8 / 82.3 / 52.8**。禁止把 69.8 听成 [12 ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md) 六列均 pass **66.7**。那边六列、oracle 相关集合、没有 Success 这第三把尺；这边两列、300 条、Success 是另请 GPT-4 判「答得像不像人话」。GPT-4o+DFSDT 均 pass **66.3** 小数点碰到 66.7，分母仍是这两列加 Success，不要两格收成一只。Token 那句钉 Table 3：ToolBench 文档均 **2530** token 收到指令均 **748**，少 **70.43%**；RestBench **3881** 收到 **103**，少 **97.35%**。tiktoken 是 `cl100k_base`。

本篇落第 3 章。改的是提示里那份工具说明书 \(H\)。骨干 \(\theta\) 冻着。ChatGPT 两段改写提示、DFSDT、ToolEval、GPT-4 Success 提示、300 条子集、FuncQA 的 13 个算术工具，全在墙外。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)。**不是** RSI。**不是** 术语式 (2)。**不是** ToolLLM：那边 SFT 推 \(\theta\)，留下 LLaMA-2-7B；这边说明书换了，权重不动。作者明确不把 EASYTOOL 接到 ToolLLaMA 上，理由是指令跟随太差。**不是** [Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md)：那边 AST、1645 张卡。**不是** [LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)：那边造新 Python；这边改已有 REST 的说明书。一手：Yuan, Song, Chen, Tan, Shen, Ren, Li, Yang；复旦 / 微软亚洲研究院 / 浙大；[arXiv:2401.06201](https://arxiv.org/abs/2401.06201)；**NAACL 2025** 长文，页 951–972；代码 [microsoft/JARVIS/easytool](https://github.com/microsoft/JARVIS/tree/main/easytool)。数字以会议 PDF Table 1–6、§4–§5、局限段为准。arXiv 预印本骨干还是 Vicuna / Mistral，会议稿换成 Llama-3.1 与 GPT-4o，主表钉会议稿。

## 1. 问题：文档又乱又长，LLM 跟不住

工具 Agent 的一条老路：不微调，把文档塞进提示，让模型自己选、自己填参。作者的判断是文档本身在挡路。来源不一，格式、口气、字段对不齐，这是 inconsistency。社区文档常夹 URL、ID、和调用无关的段落，这是 redundancy。缺示范、参数说不清，这是 incompleteness。Table 1 用均长把冗余钉死（描述含参数 TokenDesc.，全文 TokenDoc.）：RestBench 58 / **3881**，Gorilla 88 / 284，ToolAlpaca 567 / 7661，ToolBench 744 / **2530**，HuggingFace 模型卡 777 / 1196。只有最后一列带使用场景示范。RestBench 描述 58、全文 3881，差两个数量级，塞进提示等于把说明书当小说读。他们不把 RapidAPI 16464 全测一遍：接口要单独订、要付费，所以跟前人一样只切难子集。I2 / I3 才是「多类多工具」；其余子集常是同一类单工具。花园把它留在评测 \(I\)：300 条已经不是 ToolLLM 的六列泛化。Table 1 里 Gorilla 文档均长只有 284，因为 ML Hub 卡片本身短；ToolAlpaca 7661 是模拟文档灌水。本篇主战场是 ToolBench 2530 和 RestBench 3881 这种真 REST 说明书。HFmodels 1196 且带示范，作者写成少数有例子的例外，不是本表主设定。TokenDesc. 是带参数的短描述，TokenDoc. 是整页。RestBench 58 对 3881，说明「功能一句话」和「网页说明书」不是同一份 \(H\)。EASYTOOL 要做的，就是把后者收成前者那种跟得住的接口，再补上参数和场景。补完之后 Agent 读的是 \(H'\)，改写器 ChatGPT 仍在墙外。

开篇那张「List Movies」是形态，不是主表一格。原文档会把「带 Rotten Tomatoes 评分的列表」和一堆 URL、ID 堆在一起；改写后先给一句这把工具干什么，再给每只 API 的名字、描述、参数 JSON。作者把高质量说明书收成两句：容易看懂功能所以能选，容易预测参数所以能调。缺任一截，零样本插拔都会在名字或槽位上翻。相关工作里 [HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) / [RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md) / Auto-GPT 把文档直接塞进控制器；HuggingGPT 专文钉的是规划 Acc 52.62，RestGPT 专文钉 TMDB Success 75.0，都不是本表 69.8。Hsieh 等证明「有文档就能零样本」，但真实文档的三病还在。通用压缩只管把散文变短，不管槽位还在不在。本篇两段都还是人写死的改写提示，换提示等于人改 \(I\)。

## 2. 机制：两段 ChatGPT，留下说明书，不留下改写器

第一段要「好选」。把原文档喂给 ChatGPT，按人写的提示抽出这把工具干什么、内置几只 API、各干什么。提示里带示范，逼它按统一骨架吐。输出是一段短描述，给检索和选择用。第二段要「好填」。再要 ChatGPT 从文档里抽参数，收成结构化字段，并造场景：什么请求、参数名、参数值。作者用真调用核过：把生成的参数打进接口，看能不能跑、返回像不像。核不过的示范不会当指南留下。Table 2 是这两段提示的例子，绿字是 ChatGPT 填的，不是人写的金标文档。两段都离线做一次，推理时 Agent 只读成品。不是每问都让 ChatGPT 再改一遍配方。

改写质量抽 ToolBench **100** 条描述、**100** 条指南，三名标注者多数票。正确率写成 **100%**，Fleiss \(\kappa=0.97\)。这是说明书像不像人认的功能，不是 Table 4 的 69.8。附录还让 ChatGPT 把任务提示改写三遍再生成，两人评四份产出（一份原提示、三份改写提示），作者写成意思不变则质量不动。换提示的鲁棒性停在这 100 条，不要升格成主表。图 3 另切 I1-Instruction **100** 条单工具题：先拿到金标工具，再按请求和描述的余弦相似度掺进别的候选，让模型从 5 / 10 / 20 / 50 个候选里挑。作者写成说明书让 ChatGPT 和 GPT-4 在更大候选池里仍能选对。图上的点不要口算进 Table 4，也不要和 ToolLLM Table 2 的 NDCG 横加。那是选对工具，不是走完路径。闭源骨干走官方 function call；开源骨干把同一份 function call 字段拼进输入。缺格式训练的模型，原文档下 ReAct / DFSDT 可以全是 0，说明书才把槽位写成它跟得住的句子。这和 ToolLLM 把 Vicuna / Alpaca 写成六列 0.0 是同一类观察：不会跟指令，工具域就是空的。差别是本篇不推 \(\theta\)，只换 \(H\)。

Table 3 只报均 token，不报准确率。ToolBench 2530→748，RestBench 3881→103。97.35% 看起来比 70.43% 狠，因为 RestBench 原文更水分。少 token 不等于更会调：主表是 Table 4。评测子集：I2-Category **200** 条、I3-Instruction **100** 条。作者写成 I2 平均要 **6.76** 把工具，I3 **8.24** 把。每条带着一份 ground-truth 工具集，主设定让模型从这份集合里选，不是从 RapidAPI 16464 里检索。最后一行 +Re. 才改喂检索器。作者还写：用 EASYTOOL 描述检索 top-10，再让模型选和调，有时能超过 ground-truth 集合，因为替代接口更好使。这和 ToolLLM Retriever 行均 pass 67.3 对 oracle 66.7 是同一类观察，分母仍是两套题。Success 是第三把尺：GPT-4 看最终回复像不像把请求答完。Pass 仍是 ToolEval 那套有限预算是否完成。Win 仍对 ChatGPT-ReAct。ChatGPT DFSDT 的 Success 只有 15.0，接说明书才到 52.8：会走完预算和答得像人话，中间隔着一把更严的尺。三把尺不要收成一格。

FuncQA 反过来：文档几乎只有函数名和调用形式，13 个算术工具，68 道一跳、60 道多跳（平均 2.78 次调用）。一跳对错带 0.1% 误差容忍。EASYTOOL 只凭名字和调用式补出描述和场景。ReAct 对照带四条示范、五只工具例子；EASYTOOL 不靠那四条金标轨迹，靠补出来的说明书。RestBench 子集钉 TMDB：**55** 只官方 REST，尺子是正确路径率 CP%，生成路径要包含金标路径作为子序列。Vicuna-13B 对照 ToolDec（解码约束，闭源用不了），ChatGPT 对照 ReAct。对照提示来自 RestGPT 原文：原描述加四条示范。图 5 只读「两条骨干接说明书之后 CP% 都涨」，不要把图上的柱口算进 Table 4，也不要和 ToolLLM 的 66.7 横加。[RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md) Table 2 过滤后是 **54** 只，本篇 55 是 EASYTOOL 自己切的子集，两格不要互改。

![请求读改写过的说明书，冻着的 Agent 走 DFSDT，裁判打 pass / win / success；虚线下一问，θ 仍冻](./images/fig-easytool-loop.png)

> 图 1：实线是一次推理。虚线是下一查询。改写已经离线做完，这一步不再改说明书，也不改 \(\theta\)。

**图 1 解析**

- **User request**：会议稿主表是 I2 200 + I3 100。不是 ToolLLM 六列。
- **Tool instruction**：描述加指南。这是本篇进 \(S'\) 的 \(H\)。
- **Agent LLM**：DFSDT 可开，\(\theta\) 冻。作者不把这套接到 ToolLLaMA。
- **Judge**：Pass / Win 仍是 ChatGPT；Success 另请 GPT-4。
- **虚线回流**：下一问。说明书留下。改写提示不留下可改写的副本。

## 3. 表：69.8 是两列均 pass，66.3 不要改 66.7

加粗是花园标的 ChatGPT+EASYTOOL 均 pass，用来钉摘要。横杠是 ReAct 的 win：对照自己。

| 模型 | 方法 | I2 Pass / Win / Succ. | I3 Pass / Win / Succ. | 均 Pass / Win / Succ. |
|------|------|----------------------|----------------------|------------------------|
| ChatGPT | ReAct | 39.0 / - / 18.0 | 23.0 / - / 1.0 | 31.0 / - / 9.5 |
| ChatGPT | DFSDT | 64.5 / 63.0 / 24.0 | 60.0 / 70.0 / 6.0 | 62.3 / 66.5 / 15.0 |
| ChatGPT | +EASYTOOL | 74.5 / 76.5 / 68.5 | 65.0 / 88.0 / 37.0 | **69.8 / 82.3 / 52.8** |
| ChatGPT | +EASYTOOL +Re. | 69.0 / 71.0 / 60.5 | 66.0 / 89.0 / 42.0 | 67.5 / 80.0 / 51.3 |
| ToolLLaMA-7B | ReAct | 30.0 / 45.5 / 9.5 | 22.0 / 49.0 / 3.0 | 26.0 / 47.3 / 6.3 |
| ToolLLaMA-7B | DFSDT | 66.0 / 55.0 / 24.0 | 56.0 / 56.0 / 6.0 | 61.0 / 55.5 / 15.0 |
| Llama-3.1-8B | ReAct | 3.0 / 0.0 / 0.0 | 0.0 / 0.0 / 0.0 | 1.5 / 0.0 / 0.0 |
| Llama-3.1-8B | DFSDT | 12.0 / 32.0 / 10.0 | 8.0 / 3.0 / 1.0 | 10.0 / 17.5 / 5.5 |
| Llama-3.1-8B | +EASYTOOL | 75.0 / 75.0 / 60.0 | 69.0 / 88.0 / 37.0 | 72.0 / 81.5 / 48.5 |
| GPT-4 | ReAct | 67.5 / 53.5 / 27.0 | 40.0 / 71.0 / 4.0 | 53.8 / 62.3 / 15.5 |
| GPT-4 | DFSDT | 69.5 / 57.0 / 42.0 | 59.0 / 73.0 / 50.0 | 64.3 / 65.0 / 46.0 |
| GPT-4 | +EASYTOOL | 76.5 / 78.5 / 76.0 | 69.0 / 89.0 / 64.0 | 72.8 / 83.8 / 70.0 |
| GPT-4o | ReAct | 66.0 / 56.5 / 30.0 | 42.0 / 71.0 / 5.0 | 54.0 / 63.8 / 17.5 |
| GPT-4o | DFSDT | 72.5 / 63.5 / 54.5 | 60.0 / 80.0 / 63.0 | 66.3 / 71.8 / 63.8 |
| GPT-4o | +EASYTOOL | 80.5 / 81.5 / 83.0 | 73.0 / 90.0 / 71.0 | 76.8 / 85.8 / 77.0 |

ChatGPT+EASYTOOL 均 success **52.8** 高于 GPT-4+DFSDT 的 **46.0**。作者写成说明书比更强骨干上的原文档更能把请求答完。花园按列报：差在 Success，Pass 上也是 69.8 对 64.3。I3 上更刺眼：ChatGPT DFSDT 的 Success 只有 **6.0**，接说明书走到 **37.0**；Pass 只从 60.0 到 65.0。会放弃、会走完，和 GPT-4 觉得答完了，不是同一件事。I2 的 Success 从 24.0 到 68.5，涨幅比 Pass 的 64.5 到 74.5 更大。不要用 69.8 改 ToolLLM 教师 ChatGPT+DFSDT 的 **64.8**：那边六列，I1 也在。这边 ChatGPT DFSDT 只有 62.3，因为只留了难的两列。ToolLLaMA DFSDT 均 pass **61.0**，I2 已经 **66.0**，I3 掉到 56.0；不要改 ToolLLM 主表 66.7。子集和协议都换过，作者也不给它接 EASYTOOL。Llama-3.1-8B 原文档 DFSDT 只有 **10.0**，接说明书走到 **72.0**，I2 pass 75.0 甚至略高于 ChatGPT+EASYTOOL 的 74.5。作者写成小模型跟得住统一指令，就能超过专门微调过工具的 7B。8B 的 Success 48.5 仍低于 GPT-4 EASYTOOL 的 70.0：会走完和答得像不是同一格。GPT-4 自己接说明书，I2 Success 从 42.0 走到 76.0，I3 从 50.0 走到 64.0。骨干越强，Success 的天花板越高；8B 把 Pass 抬上去之后，Success 仍差一截。

GPT-4o DFSDT 均 pass **66.3**、均 success **63.8**。66.3 不要改 66.7。63.8 不要改 ToolLLM Table 3 教师 DFSDT 标注均 pass **63.8**：那边是造数据时 ChatGPT 自己解题，这边是 GPT-4o 在 300 条上的 Success。GPT-4o 原文档 DFSDT 的 I3 Success 已经 **63.0**，接说明书走到 **71.0**；Pass 从 60.0 到 73.0。最强骨干也吃说明书，不是「只有小模型缺文档」。GPT-4o+EASYTOOL 均 pass **76.8** 是这张表最高，均 Success **77.0** 也是最高。会议稿还加了 Llama-3.1-70B，正文钉得上作者句子的是 8B：原文档近乎不会调，说明书把它抬过 ToolLLaMA。70B 各格以 PDF Table 4 为准，不在这里口算。+Re. 行 I2 常常低于 oracle：ChatGPT 74.5 掉到 69.0，8B 75.0 掉到 69.0，GPT-4 76.5 掉到 72.5，GPT-4o 80.5 掉到 76.5。I3 有时持平或略高：ChatGPT pass 从 65.0 到 66.0，win 88.0 到 89.0；8B pass 69.0 到 68.0，win 88.0 到 89.0。作者写成检索器能换到更好使的替代接口。主叙事仍是 oracle 工具集上的说明书，67.5 的 ChatGPT+Re. 均 pass 不要当主格。Table 5：Ada 换 EASYTOOL 描述之后 I2 NDCG@1 **73.4** 对 BERT 的 68.2；I3 @1 **80.1** 低于 BERT 的 **81.7**，@5 88.5 高于 87.1。不是两列都赢。均 @1 76.7 对 75.0。BERT 行的 68.2 / 81.7 对得上 ToolLLM Table 2 的 \(I_2/I_3\)，分母仍是检索，不是 69.8。Ada 原描述 I2 @1 只有 36.8，换说明书才到 73.4：检索器吃的也是同一份 \(H\)，不是另一套 \(\theta\)。

图 4 人手 100 条、三人、\(\kappa=0.91\)。图上打印：名字错 ChatGPT 8%→0%、GPT-4 5%→0%；参数错 ChatGPT 25%→6%、GPT-4 17%→1%。这是调用出错占比，不是 Pass。名字错是调了工具表里没有的函数；参数错是调对了函数、槽填歪。说明书把两头都压下去，GPT-4 原来参数错就比 ChatGPT 少，接说明书之后两边都接近 0。不要用 0% 名字错去改 Table 4 的 69.8：100 条人手，不是 300 条主表。FuncQA Table 6：Vicuna-30B+EASYTOOL 一跳 **65.00**、多跳 **11.76**、工具错 **10.15**，对 ReAct 的 45.00 / 7.35 / 20.31。ChatGPT+EASYTOOL 一跳 **91.66**、多跳 **48.53**、工具错 **2.34**，对 ReAct 的 85.00 / 41.17 / 9.38。CoT 一跳会掉（Vicuna 13.33、ChatGPT 48.33），不要和 EASYTOOL 收成「提示都涨」。多跳仍低：ChatGPT 接说明书也只有 48.53，离一跳的 91.66 很远。13 个算术工具、平均 2.78 次调用，缺的是多步编排，不是单步填槽。91.66 不要改任何 ToolBench 格。Vicuna-30B 的多跳 11.76 更说明：说明书救得了「这把工具干什么」，救不了「下一步该不该换工具」。

作者把结论写成开源小模型也能掌握工具。花园读成：在 ChatGPT 两段改写、300 条难子集、DFSDT、三把 LLM 裁判这套 \(I\) 里，ChatGPT 均 pass 可以走到 69.8，8B 可以走到 72.0。不是「人可以退出改写器」。关掉说明书，8B 只剩 10.0，ToolLLaMA 也只有 61.0。检索器换描述，I3 @1 还会低于 BERT。安全性几乎没有：说明书写错，策略就按错的槽去打接口。标注者按常识判说明书对不对，常识因人而异，伦理段自己写了。可靠性专文要的墙外监督，这里的改写质量和主表分数都还经过 LLM 裁判。局限三句都还是人退出 \(I\) 的反例：超窗文档预处理、工具间依赖、只会跟指令的模型。未来工作写成用这些说明书再训专用模型。真训了，落点才挪到第 2 章；本实验停在 Harness。

## 4. 这不是 RSI，也不是第二份 ToolLLM

\(S\) 取当前提示里的工具说明书。单轮 \(S'=I(S)\) 成立：ChatGPT 两段改写之后，下次推理读新说明书。术语式 (2) 还要 \(I'\subseteq S'\)。两段改写提示、ChatGPT 改写器、DFSDT、ToolEval、GPT-4 Success、300 条切法、FuncQA 13 器，都不进说明书。模型不能把改写提示改成「再让我扩一段依赖工具」。局限段自己写了：只处理单份不超过 ChatGPT 窗口的文档，不管工具之间的依赖；超窗的文档要另做预处理；只对会跟指令的模型有效。混元台阶上这是 **Harness 里一次离线改 \(H\)**。下次任务默认带着新说明书，所以不是 L0 的本题改写；改写器本身冻着，所以也到不了递归。

和邻居钉死。[ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md) 留下 7B 权重，均 pass 66.7 是六列 ToolEval；本篇留下说明书，69.8 是两列加 Success。同一份 RapidAPI 生态，一边改 \(\theta\)，一边改 \(H\)，两格不能减。ToolLLM 的 Retriever 行均 67.3 也不要和这边 Ada+EASYTOOL 的 NDCG 73.4 横加：一个是解题 pass，一个是排序分。[Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md) 改 \(\theta\)，榜是 AST，文档均长 284，本来就短。[Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) 也改 \(\theta\)，但是五只小工具加损失差过滤，T-REx 53.5 不要改 69.8。[ReTool](../../2-Model层-训练时自改进/08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) / [ToolRL](../../2-Model层-训练时自改进/09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) / [ToRL](../../2-Model层-训练时自改进/10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md) 都推 \(\theta\)，67.0 / 52.98 / 43.3 不要改 69.8。[LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 造新函数；这边不造接口，只改说明书。[HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) 同仓库 JARVIS，冻 ChatGPT 调度模型卡，规划 Acc 52.62 不要改 69.8。[RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md) 冻 davinci 调真 REST，TMDB Success 75.0 不要改 69.8，CP 79.0 也不要改本篇图 5。[ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) 是本表关掉说明书时的那条单路；AlfWorld 71% 不要改本表。[ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md) 搜本题树，不改文档。APE / OPRO 搜的是任务提示；这边搜的是工具卡。作者点名 Tool documentation enables zero-shot（Hsieh 等）和若干压缩工作：邻居改文档或压提示，本篇把「可执行的槽 + 场景」写成必须留下的格式。CREATOR 按题造工具，MATH 59.7 不要改 69.8，也不要改 LATM 的 79.7。

![左列说明书经两段 ChatGPT 改写留下；中 WALL；右列改写提示、骨干 θ、DFSDT、裁判冻着](./images/fig-easytool-frozen.png)

> 图 2：实线只更新工具说明书。墙右边是下次任务默认还在、且不被说明书改写的 \(I\)。

**图 2 解析**

- **Grows / \(H\)**：改写后的 instruction store。没有 GRPO，没有 SFT。
- **Rewrite**：ChatGPT 两段，离线一次。不是每问都改配方。
- **WALL Frozen \(I\)**：改进器身份。没有箭头从右列改回左列的改写提示。
- **rewrite prompts / \(\theta\) / DFSDT / ToolEval / 300 / FuncQA 13**：换其中任一项等于人改 \(I\)。Table 4 里 8B 的 10.0 对 72.0，是说明书旋钮在墙外的活标本。ChatGPT 的 Success 15.0 对 52.8 是同一旋钮在「答得像」这把尺上的活标本。改写器若被 \(\theta\) 或说明书改写，才谈得上改进器进了 \(S'\)。本实验没有这一步。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness，离线改工具说明书。69.8 是哪一格？I2+I3 共 300 条、ChatGPT+DFSDT+EASYTOOL 的均 pass。和 ToolLLM 差在哪？那边改 \(\theta\)、六列 66.7；这边改 \(H\)、两列 69.8，Success 还是另一把尺。还缺什么才敢叫 RSI？改写提示或改写器进入 \(S'\)，并且下一轮改进器就是升级后的那份。为什么 66.3 不能改 66.7？因为 GPT-4o DFSDT 的均 pass 和 ToolLLM 六列均 pass 不是同一张表。为什么 8B 的 72.0 不能当「已经超过 ChatGPT」？因为 ChatGPT+EASYTOOL 均 pass 是 69.8，但 Success 52.8 对 8B 的 48.5，GPT-4 的 70.0 才是答完这把尺的上限附近。Token 少了 70.43%，省的是提示长度，不是准确率柱。

**读**：Table 4 的 69.8 / 62.3 / 66.3 / 72.0 / 52.8 对 46.0、I3 Success 6.0 对 37.0、Table 3 的 70.43% / 97.35%、Table 5 I3 @1 80.1 低于 BERT 81.7、Table 6 的 91.66 / 48.53、图 4 名字错 8%→0%、100% 是 100 条说明书人评、300 条不是六列、I2 平均 6.76 把工具、不接到 ToolLLaMA、不是 RSI。  
**不读**：把 69.8 收进 66.7、把 66.3 收进 66.7、把 63.8 收进 ToolLLM Table 3、把 61.0 改 ToolLLM 的 66.7、把 70.43% 听成准确率柱、把 100% 听成主表、把 72.0 听成已经打平 GPT-4 的 Success、把改写器听成已经进了 \(S'\)。

同层工具：[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[54 HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md)、[55 RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[27 ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md)。Model 侧：[12 ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md)、[11 Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md)、[13 Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md)、[08 ReTool](../../2-Model层-训练时自改进/08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md)。信号：[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。评测纪律：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 参考文献

1. Yuan, S., Song, K., Chen, J., Tan, X., Shen, Y., Ren, K., Li, D., & Yang, D. (2025). [EASYTOOL: Enhancing LLM-based Agents with Concise Tool Instruction](https://aclanthology.org/2025.naacl-long.44/). NAACL 2025. Table 1–6、两段改写以会议 PDF 为准。
2. 预印本：[arXiv:2401.06201](https://arxiv.org/abs/2401.06201)。骨干以会议稿的 Llama-3.1 / GPT-4o 为准。
3. 代码：[microsoft/JARVIS/easytool](https://github.com/microsoft/JARVIS/tree/main/easytool)。
NSF 重大研究计划 92270121 只出现在致谢，不当成方法超参。会议在 Albuquerque，页码 951–972，引用钉 NAACL 2025 而不是 2024 预印本年份。预印本骨干还是 Vicuna-7B / Mistral-Instruct-7B，会议稿换成 Llama-3.1 与 GPT-4o。花园主表钉会议稿；预印本只用来核对 ChatGPT / GPT-4 / ToolLLaMA 那几行没有被改掉。DOI 是 10.18653/v1/2025.naacl-long.44。Anthology ID 写成 `2025.naacl-long.44`。代码仍挂在 JARVIS 仓库的 easytool 目录下，不是独立组织。致谢还写用 ChatGPT 改过语法，那是论文文本，不是改写器进了 \(S'\)。引用缩写写成 yuan-etal-2025-easytool，和 2024 预印本的 yuan2024easytool 不要收成一条。页码从 951 到 972，一共二十二页长文，不是短文海报。
