---
title: "54 · HuggingGPT：ChatGPT 调度 HF 专家"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  HuggingGPT（arXiv:2303.17580，NeurIPS 2023）：浙大 / 微软亚研用 ChatGPT 当控制器，
  按下载量 top-K 从 Hugging Face 挑专家模型。单任务 Acc 52.62 是 GPT-4 伪标签集，
  人手 46 条上 GPT-3.5 顺序 Acc 只有 18.18。提示和 Hub 在墙外，不是 RSI。
tags:
  - RSI
  - HuggingGPT
  - JARVIS
  - ChatGPT
  - HuggingFace
---

# 54 HuggingGPT：ChatGPT 调度 HF 专家

作者写成 ChatGPT 当大脑、Hugging Face 上的专家当手脚，就能覆盖语言、视觉、语音。打开 NeurIPS 2023 相机稿 Table 3：单任务规划、GPT-4 伪标签集上，GPT-3.5 的 Acc **52.62**、F1 **54.45**。Alpaca-7B 只有 **6.48 / 4.88**，Vicuna-7B **23.86 / 29.44**。禁止把 52.62 听成 [Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md) HuggingFace 列的 AST，也不要和 [Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) 的 T-REx **53.5** 收成一只。Table 8 人手 130 条上 GPT-3.5 最终 Success **63.08**，不要改 [ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md) 教师 DFSDT 标注的 **63.8**，更不要改 [EASYTOOL](../53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md) 的均 success **52.8**。三格小数点碰到一起，分母分别是「请求有没有被解决」、ToolEval pass、GPT-4 判答完。

本篇落第 3 章。冻的是 ChatGPT（以及对照用的 Alpaca / Vicuna / GPT-4）和 Hub 上的专家权重。改的是四段提示 \(H\)：规划、选模型、执行、汇总。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)。**不是** RSI。**不是** 术语式 (2)。**不是** Gorilla：那边 SFT 改 LLaMA-7B，榜是 AST。**不是** Toolformer：那边 SFT 改 GPT-J，往五只小工具里插括号。**不是** EASYTOOL：同一座 [microsoft/JARVIS](https://github.com/microsoft/JARVIS) 仓库，那边改工具说明书、冻 \(\theta\) 调 REST；这边用模型卡描述调度 CV / NLP / 语音专家。一手：Shen, Song, Tan, Li, Lu, Zhuang；浙江大学 / 微软亚洲研究院；[arXiv:2303.17580](https://arxiv.org/abs/2303.17580)；**NeurIPS 2023**，页 38154–38180。数字以会议 PDF Table 1–8、11、§3–§5、附录 A.1–A.2 为准。

## 1. 问题：ChatGPT 读不了图，专家模型不会排程

作者把当时 LLM 的缺口写成三句。输入输出绑在文本上，视觉和语音进不去。真实请求常常是好几段子任务，要排执行顺序、还要在子任务之间递资源。零样本再强，细粒度专家（他们举微调过的检测器）仍然更稳。两条现成路他们也不满意：做一只统一多模态大模型（Flamingo、BLIP-2、Kosmos-1），或只把搜索、计算器塞进提示。前者覆盖面跟着预训练走；后者工具集合是人列的。他们的判断是：语言模型适合当控制器，专家模型适合当执行器，中间件用「模型功能的自然语言描述」。Hugging Face 上每张卡已经带着描述，不必再手写几千份说明书。

控制器用公开 API：`gpt-3.5-turbo`、`text-davinci-003`、`gpt-4`。解码温度 **0**，为了逼 JSON，对 `{` `}` 一类格式 token 设 `logit_bias=0.2`。换温度或 bias，规划 JSON 的合格率会漂。主表 Table 3–5 只报 Alpaca-7B、Vicuna-7B、GPT-3.5；Table 6 / 7 才把 GPT-4 当规划器放进来。davinci-003 写在设置里，没有单独成行，不要把它听成 52.62。专家来自 Hugging Face Hub。上下文塞不下全部卡片，所以先按任务类型过滤，再按下载量排序，取 **top-K** 当候选，做成单选题喂给 LLM。K 是人钉的 \(I\)。下载量被他们写成流行度和质量的代理，脚注自己也只说到某种程度。24 项任务对 Gorilla 的 1645 张卡、ToolLLM 的 16464 个 REST，是另一档动作空间：这边按任务类型路由到专家，不是选具体 `api_name`。同一张检测题，Hub 上可以有 YOLO 和 DETR 好几档，进选择题的是下载量前 K。执行可以走云端推理端点，也可以走本地；附录 A.1.3 写成混合端点，为的是有的卡没有托管、有的太慢、有的网络不通。端点策略也在墙外。

任务被收成四个槽：`task`、`id`、`dep`、`args`。附录 Table 9：`task` 必须落在支持列表；`id` 给依赖和资源引用；`dep` 是先决任务，全部完成才启动；`args` 按类型填 text / image / audio，来自用户或上一步产物。资源依赖用占位符，执行时再替换。没有依赖的任务可以并行。附录 A.1.4 写死：当时支持 **24** 项 AI 任务，清单在 Table 13。换这 24 项等于人改 \(H\) 的动作空间。多轮对话把聊天记录拼进规划提示，指令是「聊天记录里出现过的资源可以拿来规划」。日志只在本会话里长，下次请求四段提示还是 Table 1 那份。

混合端点写在附录 A.1.3。理想状态只用 Hugging Face 云端推理。本地要上场的三种情况：这张卡没有托管端点、推理太慢、网络不通。本地覆盖少但快，云端相反。**本地优先**：匹配上的模型若已在本地部署就走本地，否则才打云端。端点优先级是部署 \(I\)，不是 \(\theta\) 长出来的调度。Table 1 选模型那段把候选写成 `#1 … #K`，K 就是塞进提示的卡片数；正文只说 top-K，没把默认整数钉进主表，花园也不口算。

## 2. 机制：四段提示，专家权重不动

Table 1 规划提示还写了几条示范。数 e1.jpg 里有多少物体：只规划一步 object-detection。问 e2.jpg 里是什么动物在干什么：配文、分类、检测、视觉问答四步并行（dep 都是 -1）。先对 e3.jpg 做 HED / 姿态，再按「一个女孩在读书」生成新图：第二步 dep 指向第一步，args 里的图像是占位符。解析不了就吐空 JSON。这三条示范决定了模型什么时候拆、什么时候串。换示范，3497 上的 52.62 会漂。选模型提示要求「只输出最合适的 model id」，格式锁成 JSON。汇总提示要求先直答，再第一人称讲过程；结果是空的必须说做不到。三段提示都是 \(I\)，主实验没有搜过它们。

评测几乎全部落在**规划**，不是检测 mAP、不是配文 CIDEr。他们把请求分成三类，Table 2。单任务：只要任务名和伪标签完全一致就算对，报 Accuracy / Precision / Recall / F1。顺序任务：任务链，额外报编辑距离。图任务：有向无环，可能有多种合法拓扑，F1 不够，于是跟 Vicuna 论文一样请 **GPT-4 当裁判**，报 GPT-4 Score。裁判提示在附录 Table 10：只许答 Yes / No，再给理由；任务必须落在支持列表里；只看规划对不对，不看参数。用 GPT-4 标测试、再用 GPT-4 打规划分，亲缘写进了手续。花园把 Table 3–5 读成「相对 GPT-4 伪标签的规划重合」，不是「用户请求被正确执行」。

数据两套。附录 A.2 / Table 11：一共收集 **3497** 条请求，GPT-4 自动标规划。切成单任务 **1450**、顺序 **1917**、图 **130**。1450+1917+130=3497。请求最长 52 token、均 13.26；每条最多 13 个任务、均 **1.82**。另请专家标复杂请求 **46** 条：顺序 24、图 22，没有单任务列。人手这套最长 95、均 10.20，任务均 **2.00**。46 才是他们承认更可靠的那截。图任务的 130 和后文人手评的 130 条请求不是同一份：前者是 3497 里的图规划子集，后者是另采的端到端主观集。禁止两份 130 收成一只。

选模型不做主表。手续是：任务类型过滤 → 下载量排序 → top-K → LLM 单选。主实验不报「选对了哪张卡」的准确率。Table 8 才在人手 130 条上给选模型的通过率和合理性，而且只给了 GPT-3.5，Alpaca-13B / Vicuna-13B 的选模型列是横杠。作者写成开源模型规划已经不稳，后面的选择没有测。

执行阶段不改专家 \(\theta\)。检测器吐框和分数，问答吐答案分布，配文吐句子，全部当结构化结果塞回汇总提示。汇总不是简单拼接：LLM 被要求对用户请求做一次「有把握的」回答。案例里长颈鹿 / 斑马检测分数 99.9% 是专家模型的置信度，不是规划 Acc。

![用户请求进冻着的 ChatGPT，按下载量挑 HF 专家执行，再汇总成回复；虚线下一查询，权重仍冻](./images/fig-hugginggpt-loop.png)

> 图 1：实线是一次推理。虚线是下一查询。ChatGPT 和专家权重这一步都不更新。

**图 1 解析**

- **User request**：可以跨模态。训练没有 SFT 分母；表上的 52.62 是规划 Acc。
- **ChatGPT controller**：规划、挑选、汇总。API 在墙外。
- **Frozen HF experts**：top-K 候选里选出的卡。下载量排序是 \(I\)。
- **Response**：第一人称摘要。Success 63.08 在另一张人手表。
- **虚线回流**：下一查询。四段提示留下。Hub、K、GPT-4 伪标签不留下可改写的副本。

## 3. 表：52.62 是伪标签单任务，人手顺序只有 18.18

Table 3 单任务，规划器对 GPT-4 伪标签。GPT-3.5 Acc 52.62、Precision 62.12、Recall 52.62、F1 54.45。Vicuna-7B Acc 23.86、F1 29.44。Alpaca-7B Acc 6.48、F1 4.88。作者写成 GPT-3.5 当控制器明显强过当时的开源 7B。52.62 不是「一半请求做对了」：任务名对上伪标签即可，参数对不对、专家跑得对不对都不进这张表。Recall 和 Acc 都是 52.62，这张单任务设定下两条尺贴在一起，不要推广到 Table 4。

Table 4 顺序任务。编辑距离越低越好：GPT-3.5 **0.54**，Vicuna 0.80，Alpaca 0.83。参考文献点了 Marzal 与 Vidal 的归一化编辑距离，0.54 落在 0–1。F1：GPT-3.5 **51.92**，两只 7B 都在 22 附近。Precision 上 GPT-3.5 **61.09** 远高于 Recall **45.15**：规划容易少报后续步骤。Table 7 把同一类尺写成 ED (%)：示范种数 2 时 GPT-3.5 是 **71.27**，种数 10 时 **56.52**。0.54 和 56.52 不是同一刻度，禁止横加。种数变多，顺序编辑距离下降、F1 从 32.15 走到 47.03，作者写成示范更杂，规划中等变好。

Table 5 图任务。GPT-4 Score：GPT-3.5 **50.48**，Vicuna 19.17，Alpaca 13.14。F1：51.91 / 18.66 / 20.59。Vicuna 的 F1 略低于 Alpaca，GPT-4 Score 却更高：裁判和 token 重合不是同一把尺。50.48 是 GPT-4 说「这张规划对不对」的比例，规划器仍是 GPT-3.5。不要听成 GPT-4 自己规划得了 50 分。

| 模型 | 单任务 Acc / F1 | 顺序 ED / F1 | 图 GPT-4 Score / F1 |
|------|-----------------|--------------|---------------------|
| Alpaca-7B | 6.48 / 4.88 | 0.83 / 22.80 | 13.14 / 20.59 |
| Vicuna-7B | 23.86 / 29.44 | 0.80 / 22.89 | 19.17 / 18.66 |
| GPT-3.5 | **52.62 / 54.45** | **0.54 / 51.92** | **50.48 / 51.91** |

Table 6 才是 46 条人手金标，而且只测顺序和图，不测单任务。

| 模型 | 顺序 Acc | 顺序 ED | 图 Acc | 图 F1 |
|------|----------|---------|--------|-------|
| Alpaca-7B | 0 | 0.96 | 4.17 | 4.17 |
| Vicuna-7B | 7.45 | 0.89 | 10.12 | 7.84 |
| GPT-3.5 | **18.18** | 0.76 | 20.83 | 16.45 |
| GPT-4 | **41.36** | **0.61** | **58.33** | **49.28** |

作者写成即便 GPT-4 也和人手差一截。花园按列报：伪标签集上 GPT-3.5 单任务 52.62，人手顺序只剩 18.18。换金标，控制器看起来会「掉两档」。46 条是复杂题，不是 3497 的随机子集；不要用 18.18 去改 52.62，也不要把 41.36 听成已经接近人。Alpaca 顺序 Acc **0**：24 条人手顺序题上，任务名对不上。开源 7B 在 GPT-4 伪标签集上还能报个 6.48，换人写的链就归零。附录 A.1.5 自己写：GPT-4 Score 相关性看起来高，**并不总是对**。用 GPT-4 判 GPT-3.5 的图规划，等于请同一家族的模型给控制器打分。

Table 7 消融示范的任务类型种数。种数从 2 到 6 到 10。GPT-3.5 单任务 Acc 43.31 → 51.31 → **52.83**；GPT-4 65.59 → 66.83 → **67.52**。图任务 F1：GPT-3.5 43.42 → 58.51 → 64.24；GPT-4 53.96 → 64.34 → 66.90。顺序 F1：GPT-3.5 32.15 → 43.19 → 47.03。作者写成种类变多，规划中等变好。Figure 3 把 shot 数从 0 拉到 5：加示范有帮助，超过大约 **4** 条就饱和。种数和条数都是提示 \(I\)。Table 7 的 GPT-3.5 单任务 52.83 靠近 Table 3 的 52.62，可以当成主设定附近；不要把 67.52 填进 Table 3，那是 GPT-4 当规划器。

Table 8 三人评 130 条。构造手续：从任务列表抽 **3–5** 项，人手写请求；写不出新请求的丢掉；换种子随机采到 130。指标三把：Passing Rate 规划或选模能否执行；Rationality 是否合理对齐请求；Success Rate 最终有没有解决请求。三人打分再平均，附录没有 \(\kappa\)。GPT-3.5：规划 91.22 / 78.47，选模 **93.89 / 84.29**，Success **63.08**。Vicuna-13B 规划 79.41 / 58.41，Success 15.64，选模未测。Alpaca-13B 规划 51.04 / 32.17，Success **6.92**。开源 13B 规划过了，请求仍大多没解决。63.08 是「人觉得办完了」，不是规划 Acc，不是 ToolEval pass。选模两列只出现在 GPT-3.5：93.89 的通过率说明格式和端点多数能跑，84.29 的合理性仍低于规划的 91.22，挑卡比拆任务更难对齐人。规划 91.22 对 Success 63.08，中间掉了将近三十个点：图能跑，不等于用户的事办完。这和 EASYTOOL 里 Pass 对 Success 的缺口是同一类观察，分母仍是两套题。

案例不进主表。Figure 7 把「尽可能详细描述这张图」拆成配文、分类、检测、分割、视觉问答五步，再让 LLM 拼成一段话。检测案例里的 99.9% 是专家框置信度。Figure 9 才展示资源依赖：姿态检测和配文的输出，注入姿态条件生成。定性图用来理解四段流水线，禁止把案例置信度填进 52.62。

局限四条按机制读。规划完全绑在 LLM 能力上，可行性和最优不保证。整条流水线要和 LLM 多轮交互，时延叠上去。上下文长度不够接「众多」模型描述，所以才有 top-K；作者把「怎么把模型卡写短」写成未做完的题，正是后来 EASYTOOL 动刀的那一层。LLM 不听指令、JSON 不合格，工作流会直接异常。温度 0 和 logit_bias 是在压这份不稳，不是把它从 \(I\) 里拿掉。作者把「怎么把模型卡写短」写成未做完的题，后来同仓库的 EASYTOOL 才去动说明书；本篇主表仍然只报规划准确率，不是文档压缩率。

## 4. 这不是 RSI，也不是 Gorilla 的提示版

\(S\) 取当前 \(\theta\)（ChatGPT 或开源对照）。单轮连 \(S'=I(S)\) 都不成立：推理结束权重还是原样。术语式 (2) 要的 \(I'\subseteq S'\) 更谈不上。Table 1 提示、top-K、下载量排序、Hub 卡片、GPT-4 伪标签、GPT-4 Score 提示、温度 0、logit_bias、混合端点，下次请求默认还在。模型不能把自己的规划器从 GPT-3.5 换成 GPT-4 来追 Table 6 的 41.36，不能把 K 放大去接更多卡片，不能把伪标签改成 46 条人手来报 18.18。混元台阶上这是 **L0**：任务内排程，跨请求 \(H\) 冻着。聊天记录只在本会话里被读，不是可进化的 playbook。

和邻居钉死。[Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md) 相关工作把本篇收成提示侧用工具。两边都碰 HuggingFace，尺子不是同一把：Gorilla 要 AST 对上 `from_pretrained` 路径，本篇要任务名对上伪标签。TorchHub 0-shot 59.13 不要改 52.62。[Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) 被本篇相关工作写成往文本里插 API 标签的先驱；那边改 GPT-J，五只专用 API，T-REx 53.5；本篇不改 \(\theta\)，专家是 Hub 上现成的卡。Visual ChatGPT 把 BLIP / ControlNet 接到对话里；[ViperGPT](../57-ViperGPT-Python执行视觉推理/57-ViperGPT-Python执行视觉推理.md) / Visual Programming 把视觉题译成 Python。ViperGPT 专文钉 RefCOCO 72.0、GQA 48.1，不要改 52.62。作者写成差在三处：LLM 当路由器、靠规划覆盖任意模态、只凭描述就能继续接新卡而不改结构。TaskMatrix 接「数百万 API」是另一张愿景表，没有本篇这套 3497。禁止用邻居的演示图改 52.62。[ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md) 调 REST，均 pass 66.7；本篇 Success 63.08 不要改那格。[EASYTOOL](../53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md) 和本篇同仓库 JARVIS：EASYTOOL 把长文档收成说明书，主表是 ToolBench 两列；本篇调度的是模型卡，主表是规划。局限里那句「模型描述太长、32K 也不够」正是说明书那条线。69.8 不要改 52.62。[RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md) 把本篇 Offline 规划接到真 REST 上复现，TMDB Success 29.0 不要改本篇 Acc 52.62；RestGPT 自己的 75.0 是另一把人评尺。[Chameleon](../56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md) 同是 NeurIPS 2023、同是离线自然语言规划，主表是 ScienceQA 86.54，不要改 52.62。[LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 造新 Python；这边不造卡，只从 Hub 里挑。[ChatDB](../39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md) 把库当带状态外存；这边专家调用默认无状态。[ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) 交错想–做–看，AlfWorld 71% 不要改本表。附录 Table 12 把 AutoGPT / AgentGPT / BabyAGI 写成日常请求、迭代规划；本篇写成 AI 域、全局规划、工具是 HF 模型。不要用那张定性表去改 52.62。

GPT-4 既造 3497 的标签，又当图任务裁判，还作为 Table 6 / Table 7 里更强的规划器。三件事不要收成一句「GPT-4 已经会调度」。伪标签集把规划器往 GPT-4 的写法上推，开源 7B 看起来更差，可能有一部分是格式亲缘。46 条人手是用来揭这个盖的：GPT-4 规划顺序 Acc 也只有 41.36。可靠性专文要的墙外监督，这里缺一份不参与标注的执行金标。

![左列权重不涨，四段提示冻着；中 WALL；右列 ChatGPT API、HF Hub、top-K、GPT-4 伪标签冻着](./images/fig-hugginggpt-frozen.png)

> 图 2：没有箭头更新 \(\theta\)。墙右边是下次任务默认还在、且不被会话改写的 \(I\)。

**图 2 解析**

- **Grows**：\(\theta\) 不动。聊天记录只在本会话。
- **Four-stage \(H\)**：Table 1。没有提示搜索。
- **WALL Frozen \(I\)**：改进器身份。
- **ChatGPT / Hub / top-K / GPT-4 伪标签 / temp 0**：换其中任一项等于人改 \(I\)。Table 6 的 18.18 对 Table 3 的 52.62，是金标在墙外的活标本。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness，四段提示调度冻着的专家。52.62 是哪一格？GPT-4 伪标签、单任务规划 Acc。和 Gorilla 差在哪？那边改 \(\theta\)、AST；这边不改 \(\theta\)、任务名重合。还缺什么才敢叫 RSI？Table 1 或 top-K 进入 \(S'\)，并且下一轮控制器就是升级后的那份。为什么 63.08 不能改 63.8？因为人手 Success 和 ToolEval 教师 pass 不是一张表。为什么 130 不能加？图任务子集 130 条和主观评 130 条请求是两份采样。

**读**：Table 3 的 52.62、Table 6 人手顺序 18.18 / GPT-4 的 41.36、Table 8 Success 63.08、3497=1450+1917+130、46≠130、GPT-4 既当标签又当裁判、top-K 按下载量、不是 RSI、和 EASYTOOL 同仓库不同尺子。  
**不读**：把 52.62 收进 53.5 / Gorilla AST、把 63.08 收进 63.8 / 52.8、把两份 130 收成一只、把 GPT-4 Score 50.48 听成 GPT-4 规划、把案例里的 99.9% 检测分听成规划准确率、把 JARVIS 演示听成主表。

同层工具：[53 EASYTOOL](../53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md)、[55 RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md)、[56 Chameleon](../56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md)、[57 ViperGPT](../57-ViperGPT-Python执行视觉推理/57-ViperGPT-Python执行视觉推理.md)、[58 VisProg](../58-VisProg-示范写出模块程序/58-VisProg-示范写出模块程序.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[39 ChatDB](../39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md)。Model 侧：[13 Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md)、[11 Gorilla](../../2-Model层-训练时自改进/11-Gorilla-API调用微调/11-Gorilla-API调用微调.md)、[12 ToolLLM](../../2-Model层-训练时自改进/12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md)。评测纪律：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 参考文献

1. Shen, Y., Song, K., Tan, X., Li, D., Lu, W., & Zhuang, Y. (2023). [HuggingGPT: Solving AI Tasks with ChatGPT and its Friends in Hugging Face](https://proceedings.neurips.cc/paper_files/paper/2023/file/77c33e6a367922d003ff102ffb92b658-Paper-Conference.pdf). NeurIPS 2023, pp. 38154–38180. Table 1–8、11 以会议 PDF 为准；预印本 [arXiv:2303.17580](https://arxiv.org/abs/2303.17580)。代码 [microsoft/JARVIS](https://github.com/microsoft/JARVIS)。
