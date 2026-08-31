---
title: "11 · Gorilla：SFT 调 API，检索器在墙外"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Gorilla（arXiv:2305.15334，NeurIPS 2024）：UC Berkeley / MSR 用 GPT-4 Self-Instruct
  造 16450 对，再 SFT LLaMA-7B。TorchHub 0-shot AST 59.13 对 GPT-4 的 38.70，才是摘要那句
  20.43 个百分点。HuggingFace 上 GPT 只对域名。不是 RSI，也不是后来的 BFCL。
tags:
  - RSI
  - Gorilla
  - APIBench
  - RAT
  - 工具学习
  - SFT
---

# 11 Gorilla：SFT 调 API，检索器在墙外

摘要写 Gorilla 写 API 超过 GPT-4，相对 GPT-4 **20.43%**、相对 GPT-3.5 **10.75%**，相对 LLaMA「as big as **83%**」。打开 NeurIPS 2024 相机稿 Table 1 的 0-shot 列：TorchHub 上 Gorilla **59.13**、GPT-4 **38.70**、GPT-3.5 **48.38**。59.13−38.70=20.43，59.13−48.38=10.75。两句都钉在 **TorchHub**，不是三库平均。TensorHub 0-shot Gorilla **83.79**、LLaMA **0**，才对得上那句 83%。禁止把 20.43 听成准确率柱，也不要用它改 [ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) 的 BFCL **52.98**，更不要拿 Oracle 的 TorchHub **67.20** 去碰 [ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 的 AIME2024 **67.0**。HuggingFace 列更不能横加：Gorilla 走完整 AST，除 Gorilla 以外只查域名，等于多选题。71.68 对 GPT-4 的 19.80，尺子已经不是同一把。

本篇落第 2 章。SFT 改的是 \(\theta\)。留下的是 LLaMA-7B 权重。APIBench 的 1645 张卡、GPT-4 造的指令、AST 子树匹配、BM25 / GPT-Index、RAT 那句 `Use this API documentation for reference:`，全在墙外。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；信号类型见 [04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。这边更像模仿：金标 API 写在回复里，没有 boxed、没有 Jaccard、没有 PPO。**不是** RSI。**不是** 术语式 (2)。**不是** [12 ToolLLM](../12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md)（Qin 等，ICLR 2024，RapidAPI **16464**，榜是 ToolBench / ToolEval，均 pass **66.7**）：邻居，本篇不搬它的 pass rate。[Toolformer](../13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md) 学的是何时往已有五只工具里插调用，T-REx 53.5、工具集合很小。本篇相关工作点名它，尺度差一档。实验室后来维护的 Berkeley Function Calling Leaderboard，是 [ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) 的主尺，不是本篇 Table 1。一手：Patil, Zhang, Wang, Gonzalez；UC Berkeley / MSR；[arXiv:2305.15334](https://arxiv.org/abs/2305.15334)；**NeurIPS 2024**；项目 [gorilla.cs.berkeley.edu](https://gorilla.cs.berkeley.edu/)；代码 [ShishirPatil/gorilla](https://github.com/ShishirPatil/gorilla)。数字以会议 PDF Table 1–5、§3–§4、附录 Table 6 为准。arXiv HTML 把 GPT-Index 写成 `text-davinci-003`，相机稿改成 `text-embedding-ada-002-v2`、1536 维；检索器以会议稿为准。

## 1. 问题：提示里塞不下会改版的 API

2023 年前后，计算器、浏览器、一只 Python 解释器，已经能塞进提示。作者的判断是：真要面对 Hub 上成片、功能重叠、文档还在改的 API，单次上下文写不全，评测也不再是「这道题的单元测试过了没」。同一张图分类，Torch Hub 上能调的骨干不止一个家族；DenseNet 自己还有四档。用测试用例判语义等价，分母会炸。他们把范围收成 **ML Hub 的 API 调用**：从 HuggingFace、Torch Hub、TensorFlow Hub 刮模型卡，做成 APIBench。平台当时大约 **203,681** 个 HuggingFace 模型，那是仓库规模，不是评测分母。过滤后 HuggingFace 每域 Top 20，多模态 7、CV 8、NLP 12、音频 5、表格 2、强化学习 2，落到 **925**。7+8+12+5+2+2=36 个域类，附录域名清单写 37 个。36×20=720，对不上 925；925/20 也除不尽。Top 20 是上限，有的域不够 20，有的口径和清单差 1。花园用 925，不把乘法填进分母。TensorFlow Hub v2 先处理 801，卡片太空的丢掉，剩 **626**。Torch Hub 正文写抽出 **95**，图注 Dataset curation 写 **94**。论文自己的合计是 **1,645**。925+626+94=1645，925+626+95=1646。花园用 1645，不把 94/95 填进准确率。JSON 字段是 domain、framework、functionality、api_name、api_call、api_arguments、environment_requirements、example_code、performance、description。作者写成这套字段也能覆盖 REST / SQL；主实验没有出那两张榜。

指令不靠人写满。Self-Instruct 的手续见 [02 家族](../02-Self-Rewarding-家族/02-Self-Rewarding-家族.md) 里 Wang 等那条：种子任务催生新指令，再 SFT。这边教师换成 **GPT-4**。三个 Hub 各手写 6 条 {instruction, API}，一共 **18** 条是人动过的数据。每张 API 卡从对应 6 条里抽 3 条当 in-context，再造 **10** 条指令，并明确要求指令里不准出现 API 名。1645×10=**16450**。社会影响段写 over 11,000，是向下收的口径，不是另一份题库。切分后训练更少：HuggingFace **90/10**，Torch / Tensor **80/20**。holdout 才进 Table 1。不要把 16450 当测试分母，也不要把 18 条人写示范听成主训练集。

相关工作再划一条。[Toolformer](../13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md)、[HuggingGPT](../../3-Harness层-Agent运行时/54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md)、TaskMatrix 多半被写成提示侧把工具用起来；Toolformer 专文钉的是 SFT 改了 GPT-J，只是工具仍是五只专用 API。HuggingGPT 冻 ChatGPT 调度 Hub 专家，单任务 Acc 52.62 是伪标签规划，不要改本篇 AST。DocPrompting 也检索文档再生成代码，作者写成差在三处：Gorilla 的卡带参数、性能、效率，所以能做约束；评测用 AST 子树，不是 NLP 重合率；Gorilla 走指令微调，有用户轮次。附录 Table 7 在同一份 HuggingFace 子集、同一 epoch 和同一学习率上，Gorilla 比 DocPrompting 准确率更高、幻觉更低。花园不把附录表升格成主表。Alpaca / Vicuna 是同一时期的 LLaMA 指令微调邻居，目标是对话，不是选 API。

## 2. 机制：金标在回复里，检索器可以是错的

把 {instruction, API} 收成一轮用户–助手对话，对 **LLaMA-7B** 做标准 instruction SFT。附录样例里助手侧会写域名、`<api_call>`、提供方、一段为什么选它、再附可复制的几行代码。正文把「例程能不能跑」降优先级，主表不验执行；Table 3 的 0.72 才是 100 条人手跑配套代码。动物园检测、Uber 街景分类那种指令是 GPT-4 造出来的使用场景，不是另一张榜。附录 Table 6：学习率 **2e-5**，cosine，batch **64**，**5** epoch，warmup **0.03**，weight decay 0，max seq **2048**，8×A100 40G。实验有两套权重：训练时不拼文档，和训练时拼文档。测试也有两档：zero-shot 只喂自然语言；检索档把 top-1 文档拼到提示末尾。BM25 把每张 API 当一篇文档。GPT-Index 用 `text-embedding-ada-002-v2`。Oracle 永远给对的那张卡，用来估检索上限，也覆盖「人已经知道调哪个、只是不会填参数」。拼法冻着：

\[
\texttt{<user\_prompt> Use this API documentation for reference: <retrieved\_API\_doc\_JSON>}
\]

Retriever-Aware Training（RAT）的要点不是「多给一段 in-context」。检索器召回本来就不完美。方法段写成：训练时把检索到的文档（不必正确）拼进用户轮，**金标 API 仍写在助手回复里**。模型要学会：文档对得上题，就顺着文档填参数；对不上，别被错误上下文带走，退回 SFT 里背过的域知识。作者写成教模型 **judge** 检索器。Table 2 的「with Oracle retriever」训练实际喂的是黄金文档，不是 BM25 噪声。花园把两句分开：judge 检索器是方法假说；主消融的 RAT 权重是 Oracle 文档上训出来的。没有一张表写「训练时喂 BM25、测试时换 Oracle」。测试时文档可以换版本、换仓库名，不必重训。检索永远 top-1，没有 top-k 重排。功能重叠的卡挤在同一倒排里，BM25 把相近模型推上来，无检索器训练的策略就会被带偏。这和 ToolRL 里 Hammer 随机改名是同一类墙外设计：人在决定训练时看见什么字符串。Figure 6 是定性例子：同一句「去掉背景」，文档从 `fcn_resnet50` 改到 `fcn_resnet101`，或仓库从 `pytorch/vision` 改到 `NVIDIA/DeepLearningExamples:torchhub`，RAT 后的模型会跟文档走。没见过的骨干（他们举 ResNet-60）会把置信度压低，退回训练见过的 ResNet-50。这是例子，不是 Table 1 的一格。换文档等于人改 \(I\) 里的检索库，不是 \(\theta\) 自己改卡。

附录把三个 Hub 的域名摊开：Torch Hub 6 个域（分类、语义分割、检测、音频分离、视频分类、TTS），Tensor Hub 57 个，HuggingFace 37 个。功能重叠写在卡与卡之间，不写在域名清单里。评测不用单元测试。生成代码先解析成 AST，再看关心的 API 根节点（Torch Hub 的 `torch.hub.load` 配 `repo_or_dir` 与 `model`；Tensor Hub 的 `hub.load` / `hub.KerasLayer` 配 `handle`；HuggingFace 除 `pipeline` 外要 `pretrained_model_name_or_path`）是不是某张卡的子树。`pipeline` 指定任务就会自选模型，所以不查路径。Python 默认参数不强制匹配，Figure 4 里 `pretrained=True` 可以不查。三种互斥结果，和为 1：

| 判定 | 含义 |
|------|------|
| accuracy | 子树对上参考 API 的必查参数 |
| hallucination | 不是库里任何一张卡的子树；凭空造工具 |
| error | 调了库里的，但调错 |

幻觉和填错参数不是同一格。GPT-4 在 HuggingFace 上会把 GitHub 仓库名塞进 `from_pretrained`，或写成 `your_model_name`。那是幻觉。调了真实存在的另一个模型，算 error。HuggingFace 无法穷尽全站，所以 **除 Gorilla 外只查域名**，Gorilla 仍走完整 AST。Table 1 的 HF 列，Gorilla 的尺子更严。TorchHub / TensorHub 三家模型都走 AST，那两列才能并排减。

执行全量生成不现实：依赖、CUDA、卡型都要配对。他们从评测集抽 **100** 条 Gorilla 输出人手跑。Table 3：AST **0.78**，人评「调对 API」也是 **0.78**，AST 判错的集合与人判错重合。带 `pip install`、环境变量的配套代码真能跑起来是 **0.72**。差的 6 个点在依赖和环境，不是语义。禁止用 78 去改 Table 1 的 59.13，更不要改 ToolRL 的 52.98。100 条是度量校准，不是主榜。

约束是另一张子集。用户会说「参数量少于 10M，ImageNet 至少 70%」。Table 4 只留 Torch Hub 里至少有一个数据集准确率的卡片，占 Table 1 那份 TorchHub 的 **65.26%**。Gorilla 0-shot overall **71.83**，约束准确率 **47.88**。71.83 不是 Table 1 的 59.13：分母已经切过。GPT-3.5 同表 0-shot overall 73.94，约束 43.66。有检索时 Gorilla 贴着 GPT-3.5；zero-shot 约束列 Gorilla 最高。Claude 同表 Oracle 约束 **69.71**，高于 Gorilla Oracle 的 67.60，overall 也到 81.69。约束子集上闭源加 Oracle 可以反过来。不要把 47.88 听成已经会在 REST 里按美元和延迟选 API。主实验的约束是模型卡上的准确率下界。例子里 ResNeXt-101 32x16d 的 ImageNet top-1 是 84.2%，MobileNetV2 是 71.88%；用户要至少 80%，该调前者。这是 Table 4 的题型，不是 Table 1。

![查询可选检索，拼进 RAT 过的 7B，再 AST 判定；虚线下一查询，权重已是 SFT 后的 θ](./images/fig-gorilla-loop.png)

> 图 1：实线是一次推理。虚线是下一查询。SFT 已经结束，这一步不再更新 \(\theta\)。

**图 1 解析**

- **User query**：自然语言要一只 ML API。训练指令由 GPT-4 按 Self-Instruct 手续造；表上的数来自 holdout。
- **Retriever**：BM25 或 GPT-Index 的 top-1，可关。Oracle 只出现在表里当上限。检索库是墙外 \(I\)。
- **Gorilla LLM**：SFT 后的 7B。\(\theta\) 是本篇唯一进 \(S'\) 的状态。RAT 教它判断拼进来的 JSON，不把检索器写进权重。
- **AST match**：准确 / 幻觉 / 填错，和为 1。HuggingFace 上别人只对域名，Gorilla 仍走子树。
- **虚线回流**：下一查询。权重留下。API 卡、匹配器、那句 reference 提示不留下可改写的副本。

## 3. 表：20.43 是 TorchHub，78 是一百条人手

Table 1 主设定。GPT-4 是 `gpt-4-0314`，GPT-3.5 是 `gpt-3.5-turbo-0301`，Claude 是 `claude-v1`。加粗是花园标的、用来钉摘要的格子，不是作者在 PDF 里涂黑的。

| 模型（0-shot） | TorchHub acc / hallu / err | HuggingFace | TensorHub |
|----------------|----------------------------|-------------|-----------|
| LLaMA | 0 / 100 / 0 | 0.00 / 97.57 / 2.43 | 0 / 100 / 0 |
| GPT-3.5 | 48.38 / 18.81 / 32.79 | 16.81 / 35.73 / 47.46 | 41.75 / 47.88 / 10.36 |
| GPT-4 | **38.70** / 36.55 / 24.7 | 19.80 / 37.16 / 43.03 | 18.20 / 78.65 / 3.13 |
| Claude | 18.81 / 65.59 / 15.59 | 6.19 / 77.65 / 16.15 | 9.19 / 88.46 / 2.33 |
| Gorilla | **59.13** / 6.98 / 33.87 | 71.68 / 10.95 / 17.36 | **83.79** / 5.40 / 10.80 |

三列相加：Gorilla 0-shot TorchHub 59.13+6.98+33.87=99.98，HuggingFace 99.99，TensorHub 99.99。四舍五入缺口不到 0.1，不是第四种错误，缺口来自百分数取整。花园按表内打印值加，不另修。作者实现过把调用真跑起来的系统，正文写不是焦点。主表停在 AST。

TorchHub 上 Gorilla 比 GPT-4 高 20.43 个百分点，比 GPT-3.5 高 10.75。GPT-4 的幻觉 36.55 高于 GPT-3.5 的 18.81，三库 0-shot、BM25、GPT-Index、Oracle 都有「3.5 幻觉低于 4」的现象。作者写成或许是 RLHF 让模型更不敢乱编。花园把它留在观察：本表不是 RLHF 消融。Claude 0-shot 三库幻觉都高。LLaMA 几乎只会幻觉。Gorilla 的 error 在 TorchHub 上 33.87，并不比 GPT-3.5 的 32.79 好看：赢的是少幻觉，不是少填错。TensorHub 上 GPT-4 幻觉 78.65、error 只有 3.13，几乎是「敢写、写的却不在库里」。GPT-3.5 同格幻觉 47.88，更大的模型在这张库上更敢凭空造。Gorilla 把幻觉压到 5.40，error 10.80。准确率从 18.20 走到 83.79，主因是少凭空造工具，不是把 error 洗成 0。

检索不是免费加分。无检索器训完的 Gorilla，测试时接 BM25，TorchHub 从 59.13 掉到 **40.32**（Table 1）或 Table 2 的 **37.63**，两格都低于 0-shot。HuggingFace 从 71.68 掉到 17.03。作者的句子：差检索器会 misguide。闭源模型的斜率不一样。Claude 0-shot TorchHub 只有 18.81，接 BM25 收到 39.78，幻觉从 65.59 降到 5.37：提示里塞进一篇文档，至少少凭空造工具。GPT-3.5 接 GPT-Index，TorchHub 60.21，略高于 Gorilla 的 61.82 的邻居格，幻觉 1.61。GPT-4 同一格 59.13，幻觉 1.07，准确率和 Gorilla 0-shot 撞上同一数字，分母已经换成「带检索」。不要把 GPT-4 GPT-Index 的 59.13 听成 0-shot 那一格没动。GPT-Index 在 Gorilla 的 TorchHub 上收到 61.82，幻觉 **0**；HuggingFace 47.46，低于 0-shot 的 71.68。Oracle 才把三库拉到 67.20 / 91.26 / 94.16。GPT-3.5 Oracle 的 TensorHub 95.03 略高于 Gorilla 的 94.16，HuggingFace 89.71 低于 91.26。上限附近闭源模型能贴上来。主叙事仍是 0-shot：不靠测试时喂对的文档。附录 Table 7 在 HuggingFace 上拿同一 epoch、同一学习率的 7B DocPrompting 对照：准确率 61.72 对 Gorilla 的 71.68，幻觉 17.36 对 10.95。17.36 碰巧等于 Table 1 里 Gorilla 的 HF error，不要两格收成一只。附录 Figure 13 把同一套 RAT 铺到 MPT / Falcon，作者写成收敛到相差几个百分点。花园不把图上的点读成 Table 1，也不把「换基座还能训」升级成改进器进了 \(S'\)。

Table 2 把「训练时有没有 Oracle 文档」切开。无检索器训练、测试给 Oracle，TorchHub 只有 **54.83**，低于纯 0-shot 的 59.13。RAT 训练、测试给 Oracle，TorchHub **67.20**。67.20−54.83=**12.37**。这句「12.37% higher … Torch Hub」对得上 Oracle 列。HuggingFace 上作者另写 23.46%，花园不反推成某一格差：同表无检索器训练的 Oracle 是 45.58，RAT+Oracle 是 91.26，相减是 45.68，对不上 23.46。报表内绝对数。RAT 训完再 zero-shot，三库准确率都是 **0**，幻觉 100 / 99.67 / 100：模型在等那句 reference，不给文档就塌。这是失效标本，不是笔误。作者的选择建议也写死了：检索器够好，走 RAT；检索器不可靠，走 0-shot SFT。人在选 \(I\)，不是 \(\theta\) 在选。

「GPT-Index 掉 29.20%、BM25 掉 52.27%」同样不要当三库平均。RAT 训练、测试 Oracle 的 TensorHub 是 94.16；换 GPT-Index 是 64.96，94.16−64.96=29.20；换 BM25 是 41.89，94.16−41.89=52.27。两句都钉在 **TensorHub**。TorchHub 上 RAT+GPT-Index 是 61.82，只比 Oracle 的 67.20 少 5.38 个百分点。三库斜率不同。列比汇总老实。

Table 5 拿 Gorilla 0-shot 对 GPT 的 3-shot。列顺序是 HF Acc / Hall、TH Acc / Hall、TF Acc / Hall。GPT-4 3-shot 的 TorchHub Acc **75.80**，作者写成在这一子集上打平。Gorilla 同行的 TF Acc **83.79** / Hall **5.40** 对得上 Table 1；HF Acc **58.05**、TH Acc **75.80** 对不上 Table 1 的 71.68 / 59.13。GPT-4 0-shot 的 HF / TF 能对上 Table 1，TorchHub 列 54.30 对不上 38.70。花园主表钉 Table 1。Table 5 只读：给 GPT 三条示范能把调用写得更像函数，平均仍低于 Gorilla 0-shot；不要把 75.80 填进 Table 1，也不要把 58.05 听成 HuggingFace 主成绩。

GPT-4 0-shot HuggingFace 幻觉 37.16，准确率 19.80。协议已经放松到域名，仍远低于 Gorilla 的完整 AST 71.68。若有人把 71.68−19.80 写成「HF 上超过 GPT-4 五十个点」，漏了尺子。能并排减的是 TorchHub 与 TensorHub。摘要挑 TorchHub 报 20.43，不是随便选了一列好看的。

## 4. 这不是 RSI，也不是 ToolRL 的分母

\(S\) 取当前 \(\theta\)。单轮 \(S'=I(S)\) 成立：5 epoch 之后下次推理用新权重。术语式 (2) 还要 \(I'\subseteq S'\)。1645 张卡、GPT-4 教师、AST 必查参数、BM25 倒排、ada-002 索引、RAT 提示模板、holdout 切分，都不进 \(\theta\)。模型不能把 HuggingFace 评测从域名改回完整 AST 来刷 71.68，不能把 BM25 换成 Oracle 来报 67.20，不能把 100 条人手里的 72% 可执行听成 Table 1 已经在跑模型。混元台阶上这是 **L1** 的轨迹模仿：可训练状态在动，改进手续在墙外。和 [04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md) 表里的 ReTool / ToolRL / ToRL 不是同一格信号。这边没有 0/1 验证器，金标 API 是 GPT-4 对照模型卡写出来的。

和邻居钉死。[ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 先 SFT 冷启动再 PPO，工具钉死为代码解释器，AIME2024 32 次平均 67.0。Oracle TorchHub 67.20 只是小数点碰到一起。[ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) 主榜是 Gorilla 实验室后来的 BFCL V3，3B 总体 52.98；本篇 2023/2024 的验收是 APIBench，没有多轮 3.75 那一格。[ToRL](../10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md) 从 Math Base 做 GRPO，7B AIME24 greedy 43.3；43.3 不要改 59.13。[LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 留下一类题的 Python，不改 \(\theta\)；Gorilla 调的是 Hub 里已有的模型卡，不缓存新函数。[ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md) 冻 PaLM，轨迹随题清空。Self-Instruct 在本花园已经写进 [02](../02-Self-Rewarding-家族/02-Self-Rewarding-家族.md)：Wang 等用同一只模型自举；这边教师是 GPT-4，被微调的是另一只 7B。[ToolLLM](../12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md) 的 RapidAPI **16464** 不要和 APIBench 的 **1645** 收成一只，也不要用那边均 pass 66.7 改本表任何一格。HuggingGPT 是提示侧调度 HuggingFace，权重不动。

作者把结论写成：微调加检索，让 LLM 更准地选 API、跟上改版文档。花园读成：在 APIBench、AST、GPT-4 造的 10 条指令/卡、LLaMA-7B、5 epoch 这套 \(I\) 里，0-shot TorchHub 可以走到 59.13，幻觉 6.98。不是「人可以退出 \(I\)」。检索器差会伤 0-shot；RAT 又会让测试时不给文档的准确率掉到 0。两头都是人在选循环。局限段写明：为了让题难，他们选了功能相近的 ML API；偏数据会偏预测。释放指令–API 对是为了让社区研究这些卡，不是红队。可靠性专文要的墙外监督，这里缺一份。执行系统他们实现过，正文写不是焦点。评测停在 AST 和 100 条人手，没有 BFCL，没有 AIME。

![左列 θ 经 SFT 从 LLaMA-7B 上涨；中 WALL；右列 APIBench、AST、GPT-4 造指令、检索器、RAT 提示冻着](./images/fig-gorilla-frozen.png)

> 图 2：实线只更新策略权重。墙右边是下次任务默认还在、且不被 \(\theta\) 改写的 \(I\)。

**图 2 解析**

- **Grows / \(\theta\)**：SFT from LLaMA-7B。没有 GRPO，没有 boxed。
- **Train loop**：16450 对再按 Hub 切 holdout；RAT 可选。5 epoch，batch 64。
- **WALL Frozen \(I\)**：改进器身份。没有箭头从右列改回左列的 AST 规则。
- **APIBench / AST / GPT-4 / 检索器 / RAT 提示**：题库、度量、教师、索引、拼法。换其中任一项等于人改 \(I\)。Table 2 里 RAT 后 zero-shot 掉到 0，是旋钮在墙外的活标本。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Model，SFT 推 \(\theta\)。20.43 是哪一格？TorchHub 0-shot 相对 GPT-4 的百分点，不是三库平均。和 ToolRL 差在哪？这边模仿 API 轨迹、榜是 APIBench；那边 GRPO 拆槽位、榜是 BFCL。还缺什么才敢叫 RSI？AST 规则或检索器进入 \(S'\)，并且下一轮改进器就是升级后的那份。HuggingFace 71.68 为什么不能直接减 GPT-4 的 19.80？因为只有 Gorilla 走完整 AST。78 和 72 为什么不能当主榜？因为那是 100 条人手校准。

**读**：Table 1 的 59.13 / 71.68 / 83.79、20.43 与 10.75 钉 TorchHub、83% 钉 TensorHub 对 LLaMA、HuggingFace 协议不对称、BM25 会伤 0-shot、RAT+Oracle 的 67.20 / 91.26 / 94.16、Table 2 的 12.37 钉 Oracle 列、29.20 / 52.27 钉 TensorHub、Table 3 的 0.78 / 0.72、Table 4 的 65.26% 子集与 47.88、1645 不是 203681、16450 不是测试分母、不是 RSI、不是 BFCL。  
**不读**：把 20.43 听成准确率柱、把 67.20 收进 ReTool 67.0、把 71.68 对 19.80 当同一把尺、把 78 改 59.13、把 1645 收成 ToolLLM 的 16464、把本表听成 ToolRL 的 BFCL、把 GPT-Index 听成 davinci-003、把 Table 5 的 58.05 / 75.80 填进 Table 1。

同层：[08 ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md)、[09 ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md)、[10 ToRL](../10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md)、[12 ToolLLM](../12-ToolLLM-RapidAPI轨迹SFT/12-ToolLLM-RapidAPI轨迹SFT.md)、[13 Toolformer](../13-Toolformer-自监督插工具调用/13-Toolformer-自监督插工具调用.md)、[02 Self-Rewarding 家族](../02-Self-Rewarding-家族/02-Self-Rewarding-家族.md)。信号：[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。Harness 侧工具：[42 LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[54 HuggingGPT](../../3-Harness层-Agent运行时/54-HuggingGPT-ChatGPT调度HF专家/54-HuggingGPT-ChatGPT调度HF专家.md)、[29 ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md)。评测纪律：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 参考文献

1. Patil, S. G., Zhang, T., Wang, X., & Gonzalez, J. E. (2024). [Gorilla: Large Language Model Connected with Massive APIs](https://arxiv.org/abs/2305.15334). NeurIPS 2024. Table 1–5、RAT、AST 以会议 PDF 为准。
2. 项目与代码：[gorilla.cs.berkeley.edu](https://gorilla.cs.berkeley.edu/)；[ShishirPatil/gorilla](https://github.com/ShishirPatil/gorilla)。
3. Self-Instruct 手续：Wang et al. (2023). [Self-Instruct](https://arxiv.org/abs/2212.10560). ACL 2023。花园展开见 [02](../02-Self-Rewarding-家族/02-Self-Rewarding-家族.md)。
4. 本花园：[08 ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md)；[09 ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md)；[10 ToRL](../10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md)；[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。
