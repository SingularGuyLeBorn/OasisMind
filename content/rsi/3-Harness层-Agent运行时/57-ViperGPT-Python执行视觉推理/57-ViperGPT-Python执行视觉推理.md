---
title: "57 · ViperGPT：Python 执行视觉推理"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  ViperGPT（arXiv:2303.08128，ICCV 2023）：哥伦比亚大学用冻着的 Codex 一次写出 Python，
  再调 GLIP / MiDaS / BLIP-2。RefCOCO testA IoU 72.0，GQA 48.1，OK-VQA 51.9，
  NExT-QA 全量 60.0。程序本题用完即丢，不是 RSI。
tags:
  - RSI
  - ViperGPT
  - GQA
  - RefCOCO
  - Harness
---

# 57 ViperGPT：Python执行视觉推理

打开 ICCV 2023 Table 1：零样本、0 个可训参数，ViperGPT 在 RefCOCO testA 指称理解上 IoU **72.0**，RefCOCO+ 同拆 **67.0**。相对同表零样本 GLIP 的 **55.0** 高 **17.0** 个百分点（72.0−55.0=17.0）；相对 ReCLIP 的 **58.6** 只有 **13.4**。禁止把 17.0 听成相对 ReCLIP，也不要把 72.0 收进 [HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) 伪标签 Acc **52.62**。监督区 OFA **94.0**、MDETR **90.4** 更高，那是另一档。GQA test-dev Table 2：ViperGPT **48.1**，相对零样本 BLIP-2 **44.7** 高 **3.4**，远低于监督 CRF **72.1**。48.1 不要改 [Chameleon](../56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md) ScienceQA **86.54**。OK-VQA Table 3：**51.9**，超过同表所有零样本，相对 Flamingo **50.6** 只高 **1.3**；作者写「公开资源上相对最好模型 +6%」是 51.9−45.9，减数是 BLIP-2，不是 Flamingo。监督 PromptCap **58.8** 仍更高。NExT-QA Table 4 多项选择：hard 时间 **49.8**、hard 因果 **56.4**、全量 **60.0**。hard 两列含监督也是当时最好；全量低于 HiTeA **63.1**，禁止写成整榜 SOTA。

本篇落第 3 章。冻的是 `code-davinci-002`、`text-davinci-003`、GLIP-L、MiDaS DPT_Large、BLIP-2 Flan-T5 XXL、X-VLM（MSCOCO 检索微调）和标准 Python 解释器。改的是 API 提示 \(H\)：`ImagePatch` / `VideoSegment` 的签名、docstring、若干 query-code 对。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)。**不是** RSI。**不是** 术语式 (2)。**不是** Chameleon：那边一次写出自然语言模块名，主表是 ScienceQA / TabMWP；这边一次写出可执行 Python，主表是视觉基准 IoU / Acc。**不是** HuggingGPT：那边按下载量从 Hub 挑卡，规划是任务 JSON；这边 Codex 只看 API 规格，不看实现。**不是** [RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md)：RestGPT 每步看 REST 返回再规划，TMDB Success 75.0；本篇程序一步生成完，执行中不重写。RestGPT Table 1 给 ViperGPT 写的 **11** 只工具，是他们相关工作表上的格子，不是本篇库存数，禁止收成「本篇有 11 只模块」。**不是** [LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)：那边按类缓存可复用函数；这边 \(z\) 本题用完即丢。一手：Surís*, Menon*, Vondrick；哥伦比亚大学；[arXiv:2303.08128](https://arxiv.org/abs/2303.08128)；**ICCV 2023**。数字以会议 Open Access PDF Table 1–4、§3–§5、附录 A/B 为准。项目 [viper.cs.columbia.edu](https://viper.cs.columbia.edu/)。主表钉 ICCV 稿，不钉项目页宣传句，也不钉预印本分页。检索可以用 arXiv 号，对表必须翻会议稿。正文有一处把 GQA 写成 Table 4，会议稿主表编号里 GQA 是 **Table 2**，NExT-QA 才是 Table 4。

## 1. 问题：端到端一次前向装不下组合题

作者把缺口写成：人看见图会拆步，先找小孩和松饼，再数，再按「公平」做除法；主流视觉模型却要把识别、深度、算术全压进一次前向。单任务模型已经能检物体、估深度，复杂题用不上这些现成块，计算机本来就会做除法，也不该再让网络去学。Neural Module Networks 试过把题拆成模块再重排，程序生成要么靠人手调解析器，要么从零强化学习，域一换就垮；感知模块还和执行引擎一起训，推广差，中间结果也不忠实。作者要的是：新任务不必再训 \(\pi\)，把已有感知模型按题重组成程序。

记号沿 Johnson 等人视觉程序那一套。查询 \(q\)（文本，可带图像或视频 \(x\)）进程序生成器 \(\pi\)，得到程序 \(z\)；执行器 \(\phi\) 在输入上跑 \(z\)，得到结果 \(r\)：

\[
z=\pi(q),\qquad r=\phi(x,z).
\tag{1}
\]

\(\pi\) 不是训出来的程序网络，是冻着的 Codex。\(\phi\) 不是 NMN 那种一起训的 execution engine，是标准 Python 解释器，外加冻着的感知模块。\(x\) 可以是图或视频，\(r\) 可以是文本、选项、也可以是图像裁块。先前工作常把程序收成语法树或依赖图；本篇把 \(z\) 直接写成 Python，才能用 `for` / `if`、`sort`、`datetime`、`math`。

Codex 的输入是 API 规格加上本题 \(q\)，期望输出是一个 Python 函数定义字符串，再编译执行。提示里有两类全局类：`ImagePatch` 表示一块图，`VideoSegment` 表示一段视频。每个模块是类方法，内部调预训练模型。`compute_depth` 返回块内像素的中位相对深度，后端 MiDaS。API 写清输入输出类型和 docstring；示范是 query-code 对，不是把实现贴进窗口。Codex **只看签名和说明，不看实现**。作者写了两条理由：窗口装不下整份实现；换模块实现不必改规划提示。换 GLIP 的 CUDA 补丁，只要签名不变，\(H\) 可以不动。这和 HuggingGPT 把模型卡描述塞进选择题相反：那边控制器要读卡，这边规划器故意不读实现。

附录 A 钉死骨干。检测 `find` / `exists`：GLIP-L，官方仓库，作者改过若干 CUDA，适配新版 PyTorch。深度：PyTorch Hub 的 MiDaS **DPT_Large**。简单视觉问答 `simple_query`：BLIP-2 **Flan-T5 XXL**，试过 LAVIS 官方和 Hugging Face 两套，前者略准、后者更快。属性与图文匹配 `verify_property` / `best_image_match` / `best_text_match`：X-VLM，**MSCOCO 检索微调**那一版，作者写成属性检测上强过 CLIP。外部知识 `llm_query`：`text-davinci-003`。程序生成：`code-davinci-002`。NExT-QA 另加 `select_answer`，仍是 GPT-3，给定场景文本和选项挑一个。这些卡全部在墙外。任务切清单：RefCOCO 不用 `simple_query` 和 `best_text_match`（后者留给出文本的题）；GQA **不用** `llm_query`；OK-VQA 几乎只用 `simple_query` 加 `llm_query`；NExT-QA 加上 `VideoSegment`，图像方法收成 `find` / `exists` / `best_text_match` / `simple_query`。换任务等于人换 \(H\) 的子集，不是模型自己扩 API。

相关工作把 VisProg 写成：把题收成「视觉程序」，靠上下文示范。本篇写成直接吐不受限的 Python，才能露出控制流和算术；而且不像 CodeVQA，**可以不给 in-context 例子仍能跑**。Visual ChatGPT 把 BLIP / ControlNet 接到对话里；Socratic Models 用语言模型串多模态。作者的贡献句钉三件事：代码生成模型加 API 加解释器；零样本视觉基准上当时最好；开一份 Python 库方便后继。贡献句不是主表。RestGPT 后来把本篇收成离线程序、11 只工具，那是他们的定性表。

`ImagePatch` 还暴露几何属性：水平中心、裁块数组。木头书柜那道题比的是 `horizontal_center`，没有另训一个「左右」模块。`distance` 只用内置算术算两块像素距离。几何运算走解释器，检测走 GLIP，分工按构造钉死。

执行期程序吃图或视频，吐出与 \(q\) 对应的 \(r\)。NMN 把 `find` 这种感知和 `compare` 这种逻辑都做成神经网络，一起端到端训，系统推广差，模块也不忠实于名字。本篇把逻辑交给解释器，感知交给预训练模型，忠实性按构造保证：跑的就是那段 Python。实现上一批程序用多进程一起跑，生产者–消费者设计做 GPU 批处理。这是工程，不是改进器。论文里的示例图去掉了注释和错误处理，逻辑不变，不要把美容过的函数当成仓库原样。

## 2. 机制：System 2 拆步，System 1 认图

作者借用双系统说法：生成的程序是分析式 System 2，端到端感知模块是模式识别 System 1。复杂题拆成一步步，每步把最擅长识别的模块用上。中间变量直接构成最终答案，解释是忠实的，不是事后 Grad-CAM。GQA 那道「木头书柜右边有没有水瓶」：`find("bookcase")`，`verify_property(..., "wood")`，再比 `horizontal_center`。OK-VQA 那道冬天玩具：`simple_query` 先认出熊，再 `llm_query` 问冬眠；端到端 BLIP-2 会猜「ski」，图上冬天活动更抢眼。NExT-QA 把视频当有序帧列表，先扫哪一帧在撒亮片，再问下一帧男孩在干什么。感知模块全是图像模块，作者写成没看过视频数据。

![查询进冻着的 Codex，一次写出 Python，绑定 API 后解释器执行；虚线下一问，权重仍冻](./images/fig-vipergpt-loop.png)

> 图 1：实线是一次推理。虚线是下一查询。程序在执行前就写完，中间变量只服务本题。

**图 1 解析**

- **User query**：图或视频加文本。72.0 是 RefCOCO IoU，48.1 是 GQA Acc，不是规划重合。
- **Codex planner**：式 (1) 的 \(\pi\)。`code-davinci-002`。没有 Continue，没有按执行结果改后面的行。
- **API spec**：`ImagePatch` / `VideoSegment` 签名。实现不进窗口。
- **Sequential execute**：式 (1) 的 \(\phi\)。解释器加冻着的 GLIP / MiDaS / BLIP-2 / GPT-3。
- **虚线回流**：下一查询。\(H\) 和卡留下。本题 \(z\) 和局部变量不留下。

四套题共用框架，清单不同。指称理解先当桥：很多后续题都要先定位复杂短语，而不只是找物体。提供的方法：`find`（短名词短语 → 块列表）、`exists`（布尔）、`verify_property`（物体加属性）、`best_image_match`（若干块里挑最贴短语的）、`compute_depth`、纯 Python 的 `distance`（两块像素距离）。RefCOCO 允许空间关系，RefCOCO+ 不允许，两列分开报。组合问答加上 `simple_query` 和 `best_text_match`。外部知识问答加上 `llm_query`。视频因果 / 时间再加 `VideoSegment` 的帧迭代和 `select_answer`。作者把四套写成大致递进：先定位，再组合问答，再外知识，再时间。递进是叙事，不是必须按这个顺序训。

干预实验（Figure 7）不进主表。做法：把某只模块换成无信息默认，例如 `find` 总返回整图，看同一段代码在用到该模块的样本上 mIoU 掉多少。柱上感知模块和 Python 运算（`sort`、比较、四则）都要紧，作者写成两边绑在一起。禁止口算柱高去改 72.0。上下文程序（Figure 8）把「正确车道」按拍摄地是美国还是英国改比较方向，上下文当注释写在生成之前。换一句注释等于人改 \(q\) 的前缀，不是模型自己改 API。

§5 还展示基准外的查询：不另加 API，只用四套题已经暴露的方法。需要新能力时，人可以往 API 里加 `ocr`、法向、分割。加模块是改 \(H\)，下次默认是否带上，仍是人决定。

## 3. 表：72.0 是零样本 IoU，48.1 远低于监督

RefCOCO / RefCOCO+，REC，testA，IoU：

| 方法 | 协议 | RefCOCO | RefCOCO+ |
|------|------|---------|----------|
| MDETR | 监督 | 90.4 | 85.5 |
| OFA | 监督 | 94.0 | 91.7 |
| OWL-ViT | 零样本 | 30.3 | 29.4 |
| GLIP | 零样本 | 55.0 | 52.2 |
| ReCLIP | 零样本 | 58.6 | 60.5 |
| ViperGPT | 零样本 | **72.0** | **67.0** |

72.0 相对 GLIP +17.0，相对 ReCLIP +13.4，相对 OWL-ViT +41.7。RefCOCO+ 上 ReCLIP **60.5** 已经高于 GLIP **52.2**，ViperGPT 相对 ReCLIP 只剩 **6.5**（67.0−60.5）。禁止四列共用一个「+17」。监督 OFA 94.0 仍高出一截，作者的 SOTA 句限定在零样本。IoU 不是 Acc，不要和 GQA 的 48.1 减。

GQA test-dev，Accuracy：

| 方法 | 协议 | Acc |
|------|------|-----|
| LGCN | 监督 | 55.8 |
| LXMERT | 监督 | 60.0 |
| NSM | 监督 | 63.0 |
| CRF | 监督 | **72.1** |
| BLIP-2 | 零样本 | **44.7** |
| ViperGPT | 零样本 | **48.1** |

+3.4 对 BLIP-2。作者写成零样本最好。72.1 是监督区天花板，48.1 没有摸到。LXMERT 的 60.0 不要和 NExT-QA 全量 60.0 收成一只：一个是 GQA 监督基线，一个是视频多项选择。HuggingGPT Acc 52.62 是伪标签任务名重合，分母 3497；这边是 GQA 答题。Chameleon 86.54 是科学选择题。三格不能减。

OK-VQA，Accuracy：

| 方法 | 协议 | Acc |
|------|------|-----|
| TRiG | 监督 | 50.5 |
| KAT | 监督 | 54.4 |
| RA-VQA | 监督 | 54.5 |
| REVIVE | 监督 | 58.0 |
| PromptCap | 监督 | **58.8** |
| PNP-VQA | 零样本 | 35.9 |
| PICa | 零样本 | 43.3 |
| BLIP-2 | 零样本 | **45.9** |
| Flamingo | 零样本 | **50.6** |
| ViperGPT | 零样本 | **51.9** |

「超过所有零样本」= 51.9 > 50.6，+**1.3**。「公开资源上相对最好 +6%」= 51.9−45.9=**6.0**，减数是 BLIP-2。Flamingo 当时不是完全公开权重那一档，作者把 +6 钉在公开资源上。监督 PromptCap 58.8 仍高于 51.9。TRiG 50.5 是监督，不要拿去和 51.9 比「已经超过监督」。熊 / ski 那条是定性，禁止填进 51.9。

NExT-QA 多项选择：

| 方法 | 协议 | Hard T | Hard C | Full |
|------|------|--------|--------|------|
| ATP | 监督 | 45.3 | 43.3 | 54.3 |
| VGT | 监督 | — | — | 56.9 |
| HiTeA | 监督 | 48.6 | 47.8 | **63.1** |
| ViperGPT | 零样本 | **49.8** | **56.4** | **60.0** |

表注写 hard split 上含监督的总体最好。Hard T：49.8−48.6=**1.2**；Hard C：56.4−47.8=**8.6**。全量 60.0 低于 HiTeA 63.1，差 **3.1**。禁止用 hard 两列的「含监督 SOTA」覆盖全量。VGT 硬拆没报，不要把 56.9 填进 Hard T。作者还写：框架允许再接视频模型，预期会再涨。预期不是表上的数。视频装不进整段 GPU，本篇按帧挑相关再算，是工程动机，不是 RSI。

失效按构造读。Codex 写错控制流，解释器会忠实跑错。GLIP 找不到「sparkles」，时间题的帧索引会漂。`simple_query` 在 GQA 上是不可再拆的原子问，拆错了就变成端到端猜。OK-VQA 几乎把视觉压成一句配文再问 GPT-3，感知一错，知识模块跟着错。NExT-QA 的 `select_answer` 是另一只 GPT-3，既读自己生成的 caption 又挑选项，身份重叠。干预图说明：Python 运算关掉，定位也会掉，不是「只换更好的检测器就够」。附录 B 的 API 很长，任务还要再切子集；清单变长会撞 Codex 窗口，和 Chameleon 附录 B 同一类瓶颈。后一条 RestGPT 用粗到细拆文档来打，本篇主表仍然是离线 Python。

## 4. 这不是 RSI，也不是 Chameleon 的 Python 版主表

\(S\) 取当前 \(\theta\)（Codex、davinci-003、GLIP-L 等）加冻着的解释器。单轮连 \(S'=I(S)\) 都不成立：推理结束权重还是原样。程序 \(z\) 和中间变量随题清空。术语式 (2) 要的 \(I'\subseteq S'\) 更谈不上。API 提示、任务切清单、GLIP-L、温度与骨干，下次请求默认还在。模型不能把自己的规划器从 Codex 换成 GPT-4 去追 Chameleon 的 86.54，不能把 `find` 的默认干预收成训练信号写回 GLIP，不能把 NExT-QA 的图像模块换成视频骨干来补全量那 3.1。混元台阶上这是 **L0**：任务内组合，跨请求 \(H\) 冻着。要跨到术语式 (2)，至少得看见下一题的 \(\pi\) 读的是上一题改过的 API 或模块实现：比如 GQA 把 `llm_query` 加进清单、RefCOCO 允许 `simple_query`、硬拆 SOTA 的帧选择策略被留下，并且这些改动已经接任。本篇没有这一列。下一查询仍用同一份附录 B Listing 1，按任务再人手切。

和邻居钉死。[Chameleon](../56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md) 同是 2023、同是离线一次写完。那边模块名加字符串绑定，ScienceQA 86.54 / TabMWP 98.78；这边 Python 加解释器，RefCOCO 72.0 / GQA 48.1。Chameleon 作者写成领域程序更容易写错，所以用自然语言模块名；本篇作者写成 Python 才能用上 Codex 在网上学到的控制流。两句都是相关工作判断，不要拿 86.54 改 48.1。[HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md) 离线自然语言规划，伪标签 Acc 52.62、人手顺序 18.18；52.62 不要改 48.1，也不要改 72.0。[RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md) 在线粗到细，TMDB 75.0；Offline 29.0 不要改 51.9；他们表上的 ViperGPT **11** 不要改成本篇模块计数。[LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 造可复用函数，中国剩余 100.0；本篇 \(z\) 不进缓存。CREATOR TabMWP 94.7 不要改 67.0。[ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) 交错想–做–看，AlfWorld 71% 不要改 60.0。[VisProg](../58-VisProg-示范写出模块程序/58-VisProg-示范写出模块程序.md) / Visual ChatGPT / CodeVQA 是邻居句。VisProg 专文钉 GQA 子集投票 **50.5**，不要和本篇全量 testdev **48.1** 减；本篇主表没有他们的答题格，禁止从邻居论文借一列填进来。[Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) 五只工具加 SFT，T-REx 53.5 不要改 OK-VQA 的 51.9。

Codex、GLIP、Bing 都不在本篇；搜索根本没进 API。GQA / OK-VQA / NExT-QA 有公开金标，指称理解用 IoU，这把尺比 RestGPT 的人评 Success 硬，也比 HuggingGPT 的规划重合硬。零样本最好的句子只覆盖各表 ZS 区，盖不住 OFA 94.0、CRF 72.1、PromptCap 58.8、HiTeA 全量 63.1。可靠性专文要的墙外监督，这里至少有公开选项和框；缺的是「这段 Python 该不该留下」的独立门：干预实验能告诉你哪只模块关掉会掉分，没有第二套程序生成器对照 Codex 写错没有。GPT-3 既当 `llm_query` 又当 `select_answer`，和 HuggingGPT 里 GPT-4 既造伪标签又当裁判是同一类身份重叠，只是本篇主表是答题不是规划重合。

和 Chameleon 的规划器再拆一次。那边一段规划吐完模块名，绑定靠字符串匹配，非法计划退回 CoT 或 PoT。这边一段规划吐完函数，绑定靠 Python 属性，语法错了就运行失败，没有写成退回 BLIP-2 单步。那边 ScienceQA 最后两步必须是 Solution Generator 和 Answer Generator；这边任务切清单是附录里人手写的子集。两边都是离线，都冻 \(\theta\)，主表却不是同一把尺：86.54 是科学题选对，72.0 是框的 IoU。RestGPT 的 75.0 是人评办完 REST 请求。三格不能减。

![左列权重不涨，API 提示冻着；中 WALL；右列 Codex、GLIP-L、BLIP-2、解释器冻着](./images/fig-vipergpt-frozen.png)

> 图 2：没有箭头更新 \(\theta\)。墙右边是下次任务默认还在、且不被本题程序改写的 \(I\)。

**图 2 解析**

- **Grows**：\(\theta\) 不动。程序只在本查询。
- **API prompt \(H\)**：签名、docstring、示范对。实现不进窗口。
- **WALL Frozen \(I\)**：改进器身份。
- **Codex / GLIP-L / BLIP-2 / davinci-003 / 解释器 / 四套题**：换其中任一项等于人改 \(I\)。GQA 关掉 `llm_query`、OK-VQA 几乎只用两只方法，是旋钮在墙外的活标本。换骨干能改 48.1，换不了「一步生成」这条规则。

对有大模型基础的读者，读完应能回答这几句。改的是哪一层？Harness，一次写出冻着的 Python。72.0 是哪一格？RefCOCO testA、零样本 IoU。48.1 为什么不是总 SOTA？监督 CRF 72.1。和 Chameleon 差在哪？这边吐程序，那边吐模块名。和 RestGPT 差在哪？这边执行中不重规划。还缺什么才敢叫 RSI？API 或模块实现进入 \(S'\)，并且下一轮 \(\pi\) 就是升级后的那份。为什么 17.0 不能写成相对 ReCLIP？因为减数是 GLIP 的 55.0，相对 ReCLIP 只有 13.4。为什么 +6% 不能写成相对 Flamingo？因为减数是 BLIP-2 的 45.9，相对 Flamingo 只有 1.3。为什么 60.0 不能写成 NExT-QA SOTA？因为那是全量，SOTA 句钉在 hard split。为什么 48.1 不能改 52.62？因为 GQA 答题和伪标签规划不是一张表。

**读**：Table 1 的 72.0 / 67.0 / 55.0 / 58.6、17.0≠13.4、OFA 94.0 是监督、Table 2 的 48.1 / 44.7 / 72.1、GQA 不是 Table 4、Table 3 的 51.9 / 50.6 / 45.9 / 6.0≠1.3、PromptCap 58.8 是监督、Table 4 的 49.8 / 56.4 / 60.0、全量低于 63.1、没看过视频数据、Codex 不看实现、可以不给示范、RestGPT 的 11 不是本篇库存、不是 RSI。  
**不读**：把 72.0 收进 52.62 / 86.54、把 17.0 听成相对 ReCLIP、把 48.1 收进 52.62、把 51.9 听成超过 PromptCap、把 +6% 听成相对 Flamingo、把 60.0 听成全量 SOTA、把 60.0 收进 LXMERT、把 11 改成本篇模块数、把 Figure 7 柱口算进主表、把美容过的示例代码当成仓库原样。

同层工具：[58 VisProg](../58-VisProg-示范写出模块程序/58-VisProg-示范写出模块程序.md)、[56 Chameleon](../56-Chameleon-离线组合推理/56-Chameleon-离线组合推理.md)、[55 RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md)、[54 HuggingGPT](../54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[53 EASYTOOL](../53-EASYTOOL-工具文档改写成指令/53-EASYTOOL-工具文档改写成指令.md)。Model 侧：[13 Toolformer](../../2-Model层-训练时自改进/13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md)。评测纪律：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 参考文献

1. Surís, D., Menon, S., & Vondrick, C. (2023). [ViperGPT: Visual Inference via Python Execution for Reasoning](https://openaccess.thecvf.com/content/ICCV2023/papers/Suris_ViperGPT_Visual_Inference_via_Python_Execution_for_Reasoning_ICCV_2023_paper.pdf). ICCV 2023. Table 1–4、§3–§5、附录 A/B 以会议 Open Access PDF 为准；预印本 [arXiv:2303.08128](https://arxiv.org/abs/2303.08128)。项目 [viper.cs.columbia.edu](https://viper.cs.columbia.edu/)。
