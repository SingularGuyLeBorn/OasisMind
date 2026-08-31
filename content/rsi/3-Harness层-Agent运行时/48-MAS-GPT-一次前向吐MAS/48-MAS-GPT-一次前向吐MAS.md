---
title: "48 · MAS-GPT：一次前向吐 MAS 代码，SFT 冻着"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Ye 等把「按题建多 Agent」收成生成任务，SFT 一只 32B 一次前向吐 Python forward。
  Llama-3-70B 执行时八列均分 65.47，比第二名高 3.89 个百分点，不是相对涨幅。
  模板池、SFT 配方和执行骨干冻着。不是术语式 (2)。
tags:
  - RSI
  - MAS-GPT
  - Harness
  - SFT
  - 工作流搜索
  - L2
---

# 48 MAS-GPT：按题吐代码，配方冻着

摘要写 consistently outperforms 10+ baseline，还写 AIME-2024 上给 o1 **13.3%**、给 DeepSeek-R1 **10.0%** gain。打开 Table 2：执行器一律 Llama-3-70B-Instruct，八列均分 MAS-GPT **65.47**，第二名自洽 **61.58**。差 **3.89 个百分点**。正文那句 3.89% 对的就是这个减法，不是相对 61.58 再涨 3.89%。GSM8K 上自洽 **94.99**，MAS-GPT **93.39**，这一列没有赢。GPQA 上 AgentVerse **40.19**，MAS-GPT **37.62**。人把「全面更好」听成每列都高，缺的是：变的是一只 Qwen2.5-Coder-32B 经一次 SFT 之后，按题吐出的 `forward` 函数。执行那些 Agent 的仍是外面那只 70B（或 72B / 4o-mini / o1 / R1）。SFT 配方、四十多种底模板、GPT-4o 精炼提示，都还在墙外。

本篇夹在 [AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)、[ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)、[AutoFlow](../47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md) 和 [MASS](../46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md) 旁边。综述把代码级工作流写成 AutoFlow / AFlow / ScoreFlow / MAS-GPT。AFlow 在验证集上走 MCTS，一份工作流伺候整集；ScoreFlow 让 8B 按题吐 Python 再 Score-DPO；AutoFlow 用 CoRE 自然语言加 REINFORCE；MASS 分三阶段调提示和拓扑。这边把建 MAS 收成「题进、代码出」的生成任务，训练是监督微调，推理是**一次前向**。不要和 MASS 收成一篇：MASS 不训 32B，搜的是积木配置。不要和 AFlow 专文的 80.3 横加：那边执行器 GPT-4o-mini、六集；这边 Table 2 执行器 Llama-3-70B，MATH 测试 500 道。**不是** RSI。**不是** 术语式 (2)。一手：Ye, Tang, Ge, Du, Yin, Chen, Shao；上海交大 / 上海 AI Lab / 牛津 / 悉尼；[arXiv:2503.03686](https://arxiv.org/abs/2503.03686)，**ICML 2025**，PMLR 267。代码 [MASWorks/MAS-GPT](https://github.com/MASWorks/MAS-GPT)。数字以 HTML Table 1–4、Table 8–9、§3–§4 为准。禁止用 65.47 去改 ScoreFlow 的 85.3，禁止用 HumanEval 80.25 去改 AFlow 专文的 94.7，禁止用本表 GPTSwarm 的 MATH 55.41 去改花园 GPTSwarm 专文。

## 1. 问题：固定团队贵，按题搜又要多次调用

作者把单只 LLM 写成交不了难度和领域都在变的题。MetaGPT / ChatDev / AgentVerse 用固定角色流水线，换任务就要人改。DyLAN / [GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md) 用模型改结构和提示，[ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) / AFlow 用 Claude 或 GPT-4 迭代出任务向 MAS。他们把后一类写成：每道题（或每个任务）要多次、带长上下文的 API，例如超过 10 次。代价从人的设计费挪到推理费。花园 AFlow 专文钉的是验证集上走 MCTS，一份工作流伺候整集。两边对 query 的用法不同。MAS-GPT 要打的是「建系统的次数」：他们假设对照方法每来一道新题都要重新搜。AFlow 原文不是这个协议。Figure 4(b) 能说明「一份 MATH 工作流换域会脆」，不能说明专文的 80.3 已经被 3.53% 作废。MAS-GPT 的切口是：把「给这道题建一个可执行 MAS」收成生成任务。输入用户题，输出一份 MAS。训练时教开源中等模型做这件事；推理时一次前向，再拿生成的系统去跑这道题。

表示必须能直接跑。他们观察到现有 MAS 落地都是代码：提示、LLM 调用、Agent 之间的交互。于是统一写成一个 Python `forward`：题进去，答案出来。Agent 提示是变量，推理是函数调用，协作是字符串拼接。Figure 2 用颜色区分 Agent。这和 AFlow / ScoreFlow / ADAS 把工作流当代码是同一类切口，差别在谁在什么时候出这份代码。AFlow 验证集上搜一份管全集；ScoreFlow 训练时按题吐再 LoRA；这边训练时用成对数据 SFT，推理时每道题再吐一次，**生成器不再更新**。

\(S\) 取这次部署里的 32B 权重，以及它为各题吐出的 `forward`。单轮 \(S'=I(S)\) 可以发生：SFT 三轮推完 \(\theta\)，或推理时多一份代码。术语式 (2) 还要 \(I'\subseteq S'\)。下一类题仍用同一份四十多种底模板、同一条「簇内选累计分最高的 MAS」、同一份 GPT-4o 精炼提示、同一套 SFT（16×A100、batch 32、3 epoch、\(1\times10^{-5}\)）。混元台阶上这不是 L0：32B 和按题代码跨题还在。也到不了改改进器。人没退出 \(I\)。作者特意写训练是一次性成本，推理可以无限次。无限次的是冻住的生成器，不是改进器在长。

## 2. 机制：先造一致的题–MAS 对，再 SFT

数据四步：造池、评价、跨题一致选择、题内一致精炼。训练切 MATH 6000、GSM8K 1000、GSM-Hard 319、AQUA-RAT 1000、MBPP 374、SciQ 2000、MMLU 1529。测试 MATH 只有 500。6000 对 500 不是同一份全量。AQUA-RAT 进了训练，主表没有 AQUA 测试列。SciQ 进了训练，测试改 SciBench 当域外。造数据用 Llama-3-70B 跑 \(N\times M\) 对，\(M>40\)，即使查询按 1.1 万计，评价次数也是几十万量级。账单发生在造数据，不发生在推理时的 32B 前向。作者把训练写成一次性。一次性的前提是底池和聚类规则不再改。改一次 \(\mathbf{M}\)，这几十万次评价要重做。这是人改 \(I\) 的成本，不是 32B 自己决定要不要重训。MAS 池先把辩论、自洽、[Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) 等收成统一代码，再人手补一批，底库 **40 余种**（Figure 7）。40 不是训练集里独特 MAS 的个数。精炼之后独特 MAS 是 **7580**。底模板会演化。人改这 40 种，等于人改 \(\mathbf{M}\)。

评价：每个查询和每个底 MAS 配对，用 Llama-3-70B 跑 MAS，\(f_{\text{eval}}\) 打 0/1。形式是 \(N\times M\) 对。只留答对的对。若相似题配上完全不同的高分 MAS，模型没有稳定目标。跨题一致（inter-consistency）把题按元数据或嵌入聚类。簇里把各 MAS 的得分累加，取累计最高的那一份，赋给簇内所有题。\(MAS^{\text{base}}_{*}=\arg\max \sum_i \mathbf{s}_i\)。比如「要发散」的题会稳定配上先并行再讨论的结构。这是人写的选择规则，不是模型自己发现该聚类。

题内一致（intra-consistency）处理单对不对齐：物理题配上带生物学家的团队会干扰学习。用 GPT-4o-2024-11-20，按 Table 10 的提示改 Agent 定义，并写一段推理，解释题和 MAS 为什么配在一起。提示要求尽量别改架构，只改指令；难才加专家；推理段不许提「原来的系统」。精炼后的 MAS 再跑一遍，分数不降才替换：

\[
MAS_i=\begin{cases}MAS_i^{\text{refine}}, & s^{\text{refine}}\ge s^{\text{base}}\\ MAS_i^{\text{base}}, & \text{otherwise.}\end{cases}
\]

精炼失败则另用 Table 11 只补推理段。闸门仍是 \(f_{\text{eval}}\) 和金标。GPT-4o 可以写出跑不动的代码，所以要再验。每条样本最终是 \((Q_i,R_i,MAS_i)\)。Table 1：指令均长约 75，回应约 1062（推理约 263 + MAS 约 785）。SFT 的 response 是推理段拼上代码。系统提示只说明「按题生成 MAS」。骨干 Qwen2.5-Coder-32B-Instruct。16 张 A100，有效 batch 32，3 个 epoch，学习率 \(1\times10^{-5}\)。推理：\(MAS^{\text{gen}}_i=\text{MAS-GPT}(Q_i)\)，\(A_i=MAS^{\text{gen}}_i(Q_i)\)。执行期的 `call_llm` 走外面那只驱动模型，不是 32B 自己答。代码靠字符串匹配从回应里抽出。抽失败就算这次 MAS 没建起来，Figure 5 的 extractability 盯的是这件事。和 ScoreFlow 的差别要落到更新规则：那边每轮 \(k=8\) 份图，执行打分，Score-DPO 再推 LoRA；这边造数时 70B 已经把 0/1 打完，SFT 只模仿留下来的对，推理时 32B 不再看分。按题吐代码这一点两边像。一边生成器还在训，一边生成器训完即冻。不要收成「都是 \(G(q)\) 所以已经是同一档 RSI」。AutoFlow 的生成器走 REINFORCE，解释器冻着，工作流是 CoRE 不是 `forward`。三家生成器都在 Harness，改进器都不在 \(S'\)。

零样本底模吐得出「要写 Python」的意识，但不知道该写哪种 MAS，Figure 5 把 \(N=0\) 画成失败。数据从 0 加到 11k，可抽取率和可执行率大体上升；7B / 14B / 32B 也随尺寸上升。这些是缩放观察，不是改进器在改自己。消融 Table 4，同一只 Llama-3-70B 执行。去掉跨题选择：MATH **60.26**（相对满配 68.65，差 8.39 个百分点）。去掉改 MAS：66.23。去掉推理段：64.90。满配 68.65 / MMLU 78.38 / GPQA 37.62。8.39% 正文写成 absolute improvement，是百分点。GPQA 三列消融都在 36–38，这一列几乎不涨。

![题进 32B，吐出 forward，冻住的驱动模型执行；下一题虚线回去](./images/fig-masgpt-loop.png)

> 图 1：实线是一道题的推理。虚线是下一题。32B 在推理时不再更新。

**图 1 解析**

- **User query**：测试题。不经过 MCTS。
- **MAS-GPT 32B SFT**：一次前向吐推理段加代码。
- **Python forward MAS**：提示是变量，调用是函数。
- **Frozen driver LLM**：70B / 72B / 4o-mini / o1 / R1 跑 Agent。

## 3. 数字：65.47 是八列均分，3.89 是百分点

测试切 Table 9：MATH / GSM8K / GSM-Hard / SciBench / MMLU 各 500，HumanEval 和 HumanEval+ 各 164，GPQA 448，AIME-2024 **30**。MATH 500 不要和 AFlow / ScoreFlow 那份难度 5 四类型切横加，也不要听成 Hendrycks 全量。GSM8K 500 不是 1319。HumanEval 标了 ∗，训练用的是 MBPP，代码测试集算域外。GPQA、SciBench 也是 ∗。九个基准是 Table 2 的八列加 AIME。

Table 2，Llama-3-70B 驱动。Single：MATH 50.55，GSM8K 92.38，GSM-H 45.80，H-Eval 79.01，H-Eval+ 75.78，MMLU 77.37，GPQA 36.68，SciBench 21.05，均分 **59.83**。CoT 均分 59.36，低于单模型。自洽 **61.58**，MATH 61.59，GSM8K **94.99**。辩论 59.84。Self-Refine **56.35**，低于单模型，GSM-H 掉到 37.80，H-Eval+ 62.73；不要改 Madaan 七任务约 +20%。GPTSwarm 均分 **57.57**，SciBench 14.11 最低。DyLAN 60.54。MAS-GPT：68.65 / 93.39 / **62.40** / 80.25 / 78.88 / 78.38 / 37.62 / 24.21，均分 **65.47**。拉开最大的是 MATH（相对自洽 +7.06 个百分点）和 GSM-Hard（+15.20）。GSM8K 低 1.60。GPQA 低于 AgentVerse 2.57。SciBench 24.21 仍低。3.89 是均分相对自洽，不是「每一列都高 3.89」。HumanEval 80.25 不要改 AFlow 专文 94.7、LATS 92.7、ScoreFlow 95.9。本表 GPTSwarm MATH 55.41 不要改花园专文填字 0.800。独特 MAS 7580 不要听成底模板已经有七千种：底库四十余种，精炼和组合之后才涨到这个数。Table 1 回应均长 1062，里面大约 785 是代码。SFT 学的是「先写一段为什么配这个结构，再写能跑的 `forward`」，不是只背模板名。不要和 [MASS](../46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md) 的八列 78.79 横加：那边不训 32B，执行器是 Gemini 1.5 Pro。也不要和 MaAS 超网收成一篇。仓库叫 MASWorks，论文叫 MAS-GPT，和 MASS 差一个字母。

Table 3 换驱动。Qwen2.5-72B：MAS-GPT 均分 **74.46**，DyLAN **74.33**。差 0.13 个百分点。MATH 上 DyLAN **87.73**，MAS-GPT 87.53。GPT-4o-mini：MAS-GPT 均分 **70.50**，自洽 69.29。MATH 上 DyLAN 和 MAS-GPT 都是 **81.21**。作者写 consistently the best across MAS-driving LLMs。Qwen 表上均分只高 0.13，MATH 没有赢 DyLAN。AgentVerse 与 GPTSwarm 在 4o-mini 五行数字几乎逐格相同（GPQA 36.24 / 36.32），花园按表抄，不解释成两种方法已经等价。数据构造期驱动是 Llama-3-70B；测 72B / 4o-mini 是在问「生成的 `forward` 换骨干还能不能跑」。能跑，不等于 32B 已经会改 SFT 配方。

AIME-2024 只有 30 题。摘要 13.3% / 10.0%，正文写相对单只 o1-preview **13.34%**。主文没有把 o1 / R1 的绝对解题率印成表。30 题上 13.34 个百分点大约是多对 4 题。不要听成准确率柱从 0 涨到 13，也不要和 Dynamic Cheatsheet 专文 Sonnet AIME 23.3→50.0 横加：骨干、协议、是否写备忘录都不同。Figure 4(b) 把 AFlow 写成在 MATH 上优化过的任务向方法，MAS-GPT 在 MATH 上高 **3.53%**；AFlow 那份工作流迁到 MMLU / HumanEval+ 掉到单模型以下。3.53 是他们这张 Llama-3-70B 重跑，**不是**花园 AFlow 专文均分 80.3，也不是 ScoreFlow 表上 AFlow 重跑 80.6。AFlow 优化器仍是 Claude 一类 API、每题约 10 次；MAS-GPT 建系统只需一次 32B 前向。比较的是「建 MAS 的次数」，不是执行期 Agent 互相调用的次数。执行期 `forward` 里仍有多次 `call_llm`。

代价 Figure 4(c) 把 MAS-GPT 的一次生成计成 **0.5 次**推理，理由是 32B 大约是 70B 的一半。这是人定的折算，不是 FLOPs 表。自洽、辩论、DyLAN 的多次调用按次数画。MAS-GPT 画在「分数高、次数少」那一侧，前提是接受 0.5 这笔账，并且不把执行期的 Agent 调用算进「建系统」的次数。附录 Table 8 另比 ChatDev：HumanEval 91.18 对 83.33，MATH 77.59 对 62.07。驱动模型与 Table 2 的 80.25 对不上，两张表不要收成一行。ChatDev 是固定角色流水线，MAS-GPT 按题吐代码，比的是「人写死团队」对「SFT 生成器」，不是比两套都已经会改自己。不要和 MassGen 开源仓混：那边是运行时编排产品，这边是 ICML 论文加 MASWorks 仓。仓库 README 把生成器写成一次调用，执行仍走用户自己配的驱动 API。主实验能转起来，前提是驱动 LLM 愿意被 `call_llm` 反复叫，并且抽取器能从长解里抄出答案。换驱动、换抽取提示、换 0.5 这笔折算，图 4(c) 的位置会动。这三件事都还在人手里。不要把一次前向听成执行期也只调一次模型：建系统一次，跑系统仍可以很多次。

## 4. 这不是术语式 (2)，一次前向也不是改进器

32B 会按题吐新 `forward`。改进器没变。SFT 超参、40 种底模板、聚类选 MAS、GPT-4o 精炼提示、\(s^{\text{refine}}\ge s^{\text{base}}\) 闸门、评价用的 Llama-3-70B、抽取答案的提示（Table 12 写明不许自己算、不许自己跑代码），都还在。混元 L0 装不下跨题保持的 32B；L3 要改提议 / 选择程序。本篇停在留下生成器和本题代码，不改怎么造训练对。摘要里的 single inference 指少付「建系统」的 API，不是 \(I\) 在改自己。造数据时 Llama-3-70B 和 GPT-4o 都在墙外。SFT 结束，这两只不再进推理环，配方仍在。

和邻居钉死。AFlow 专文 80.3 / HumanEval 94.7 / 摘要 5.7% 不是每列都涨 5.7 个百分点；本表没有 ADAS，AFlow 只出现在 Figure 4(b) 的 3.53%。ScoreFlow 85.3、8.2% 是对八条基线均分约 77.0 的百分点差，执行器 4o-mini，生成器会 LoRA。MAS-GPT 的 32B 只 SFT 一次，推理不再 LoRA。AutoFlow 的 40% 是 OpenAGI 上相对人工 CoRE 的相对涨幅，量纲 CLIP/BERT/ViT。MASS 78.79 是 Gemini 八列。GPTSwarm 本表均分 57.57 低于单模型 59.83；花园专文 GAIA 90.2% 是相对涨幅。Self-Refine 本表 56.35 低于单模型。LATM 缓存一类题的函数；这边每题可以吐不同 `forward`，32B 冻着。七套数字禁止横加。

验证集参与的是造数据时的 0/1，不是推理时的爬山。推理不再看金标。HumanEval 没进训练集，80.25 仍略高于单模型 79.01，涨得少。GPQA 没进训练集，均分故事不能靠这一列。没有墙外检查「这份 `forward` 该不该进下一次底池」。错结构一旦在某簇累计分最高，就会写进 11k 对，SFT 把它记住。附录案例写：有的题会吐出底池里没有的五路并行，每路先答再精炼，最后一只决策。作者把它叫做 novel MAS。案例证明 32B 会组合，不证明组合规则已经进了 \(S'\)。可执行率随数据上升，说明没训时 Python 会坏；训完仍可能抽不出代码，Figure 5 没有把失败率收到零。Table 12 的抽取器写死：不许自己算、不许自己跑代码，只把解里已经出现的答案抄出来。核对器允许小数误差。编码题另用 Table 13 抽函数。评价协议和造数据时的 0/1 是同一类闸门。换抽取提示，65.47 会动。这是人改 \(f_{\text{eval}}\)。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness 里那只 32B 生成器，以及它吐出的 `forward`。执行 Agent 的 70B 权重动了没有？没有。3.89% 是不是相对涨幅？不是，是 65.47 减 61.58。还缺什么才叫花园 RSI？SFT 配方或 40 种底模板进入 \(S'\)，并且下一类新基准用的就是升级后的那份造数手续。现在换学习率、换 GPT-4o 精炼提示、把 AFlow 的算子收进底池，都是人改 \(I\)。结论写成可继续加数据和加尺寸。正说明缩放旋钮还在人手里。

![上排按题 forward 与一次 SFT；下排模板、精炼提示、SFT 配方和驱动模型冻着](./images/fig-masgpt-frozen.png)

> 图 2：实线只更新 32B（训练时一次）和本题代码。虚线墙右边是冻着的造数与执行手续。

**图 2 解析**

- **左列**：训练时可 SFT 三轮；推理时每题一份 `forward`。
- **右列**：40 种底模板、GPT-4o 提示、SFT 超参、驱动 LLM 仍是人写的。
- **读法**：按题吐代码不等于 \(I\) 在长。AFlow 的 Claude 和这边的造数管道都在墙外选谁留下。

同一句「自动生成多 Agent」，至少分五截。提示优化把图钉死。ADAS 线性搜代码。AFlow 用 MCTS 加算子。ScoreFlow 用 Score-DPO 训生成器。MAS-GPT 用一次 SFT 把生成收成一次前向。五截不要收成「都已经是 RSI」。G-Designer 按任务生成图、AgentPrune 剪边省 token，综述仍裸名，本篇不代打它们的表。MAS-GPT 的连续更新发生在 SFT 那三轮，不是 AutoFlow 那条 REINFORCE 循环，也不要收成「都在训工作流所以已经是 RSI」。

「3.89%」要和 Table 2 的 65.47 减 61.58 一起读。GSM8K 没有赢自洽。Qwen 表上均分只高 0.13。AIME 13.34% 没有绝对表，分母是 30 题。3.53% 是他们重跑的 AFlow MATH，不是花园 80.3。0.5 次推理是 32B 对 70B 的折算。无金标的开放题，造数时的 0/1 打不出来，SFT 对就造不成。主实验能转起来，前提是八列都能用 Table 12 那种抽取–核对。

`forward` 不会因为某次 65.47 就把学习率写进 Agent 提示。人要允许新底模板、让 32B 改聚类规则、把 GPT-4o 精炼提示放进 \(S'\)，都是改 \(I\)。这和 Gödel 改自己的决策函数、DGM 改自己的 Python 正好相反。作者把 MAS-GPT 写成让建 MAS 像问 ChatGPT 一样一次完成。花园读成 2025 年这篇按题代码生成器 SFT 的定位，不读成已经闭合的递归，也不读成 AFlow 已经被 Figure 4(b) 的 3.53% 作废。执行器、切分、优化器都不一样。

**读**：Table 2 的 65.47 对自洽 61.58（3.89 个百分点），GSM8K 93.39 低于 94.99，HumanEval 80.25 是 Llama-3-70B，AIME 13.34% 没有绝对表，不是式 (2)。  
**不读**：把 3.89 听成相对涨幅、用 80.25 改 94.7、用 3.53 改花园 80.3、说 SFT 配方已经进了 \(S'\)、说已经 RSI、把 MAS-GPT 和 MASS 收成一篇。

同层：[43 AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)、[45 ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)、[47 AutoFlow](../47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md)、[46 MASS](../46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md)、[07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)、[44 GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)、[12 Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[06 Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md)、[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Ye, R., Tang, S., Ge, R., Du, Y., Yin, Z., Chen, S., & Shao, J. (2025). [MAS-GPT: Training LLMs to Build LLM-based Multi-Agent Systems](https://arxiv.org/abs/2503.03686). ICML 2025, PMLR 267. Table 2 的 65.47 / 3.89 以 HTML 为准。
2. 代码：[MASWorks/MAS-GPT](https://github.com/MASWorks/MAS-GPT)。
3. 本花园：[AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)；[ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)；[AutoFlow](../47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md)。AFlow 原文均分 80.3 以专文为准，不要和 Figure 4(b) 的 3.53% 横加。
