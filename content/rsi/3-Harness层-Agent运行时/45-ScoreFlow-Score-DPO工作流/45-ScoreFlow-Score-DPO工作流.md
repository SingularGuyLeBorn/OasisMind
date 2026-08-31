---
title: "45 · ScoreFlow：生成器会 LoRA，Score-DPO 冻着"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Wang 等把工作流生成器收到连续空间，用 Score-DPO 做 LoRA。
  六集均分 85.3，摘要 8.2% 是对八条基线均分约 77.0 的百分点差，不是相对 AFlow 重跑 80.6。
  算子集和损失函数冻着。不是术语式 (2)。
tags:
  - RSI
  - ScoreFlow
  - Harness
  - Score-DPO
  - 工作流搜索
  - L2
---

# 45 ScoreFlow：生成器会训，配方冻着

摘要写 8.2% improvement，还写 smaller models outperform larger ones。人把 8.2 听成每一列都涨 8.2 个百分点，或听成相对 [AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md) 涨了 8.2%。打开 Table 1：执行器全是 GPT-4o-mini，测三次取平均。ScoreFlow 六列 **85.3**。同表 AFlow 重跑 **80.6**，差 4.7 个百分点。八条基线均分约 77.0，85.3−77.0≈8.3，对得上摘要那句 8.2，是对**这张表基线均值**的百分点差，不是相对涨幅，也不是对 AFlow 专文那张 80.3 的表。GSM8K 只从 AFlow 重跑的 90.8 到 94.6。MATH 从 55.8 到 64.4，仍远不是满分。「小模型胜过大模型」钉在 Table 3 的 HumanEval：GPT-4o-mini 当执行器的 ScoreFlow **95.7**，对 GPT-4o 的 CoT **93.4**。优化阶段 GPT-4o 太贵，用 4o-mini 训完再换 4o 测试。变的是 Llama-3.1-8B 生成器上的 LoRA，以及它吐出的 Python 工作流。Score-DPO 的 \(f\) 和 \(d\)、算子名单、执行器、\(k=8\) / \(M=3\)，都还在墙外。

本篇夹在 AFlow、[GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md) 和 [ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) 旁边。综述把代码级工作流写成 AutoFlow / AFlow / ScoreFlow。AFlow 用冻结的 Claude 在算子图上走 MCTS，一份工作流伺候整集；这边生成器按题吐图，再用偏好对 LoRA。GPTSwarm 学的是给定节点之间的边概率，复合图还是 DAG；这边工作流是可执行 Python，提示里写了允许 if/for。ADAS 冻 gpt-4o 元 Agent 写 `forward`；这边元模型是开源 8B，但更新规则是人写的 Score-DPO。三套 AFlow 数字禁止横加：花园 AFlow 专文均分 80.3、HumanEval 94.7；本表 AFlow 重跑 80.6 / 92.9；两边 ADAS 更对不上。**不是** RSI。**不是** 术语式 (2)。一手：Wang, Yang, Li, Wang, Aragam；芝加哥大学 / 普林斯顿 / 牛津；[arXiv:2502.04306](https://arxiv.org/abs/2502.04306)，2025-02 预印本。代码 [Gen-Verse/ScoreFlow](https://github.com/Gen-Verse/ScoreFlow)。数字以 HTML Table 1–6、§3–§4、附录 A.2–A.3 为准。禁止用本表 80.6 去改 AFlow 专文的 80.3。禁止用本表 ADAS 的 MBPP 68.7 去改 AFlow 专文的 MBPP 53.4，更不要改花园 ADAS 专文的 MGSM 53.4。

## 1. 问题：一份工作流伺候整集，离散搜又早停

作者把手工多 Agent 写成贵、换域就脆。自动化想动提示、超参、结构。图结构那一支（他们点名的是通信图 / 辩论网）不好写条件分支。代码表示能写循环和分支，ADAS 把经验堆成线性列表，搜得慢；AFlow 用 MCTS，作者批评它结构上收敛太快，离散反馈只随机抽失败样本喂给优化器 LLM，大而杂的题集上难自适应。ScoreFlow 的切口是：工作流仍用代码，但**生成器 \(G\) 按题生成**，再用执行分数构造偏好对，在连续参数上做梯度。他们把这叫 loss-gradient optimization in a continuous space。连续的是 8B 生成器的 LoRA，不是把 Python 工作流本身变成可微程序。

\(S\) 取这次部署里更新过的生成器（LoRA）以及它为各题吐出的工作流代码。单轮 \(S'=I(S)\) 可以发生：第 \(t\) 轮 Score-DPO 推完 \(\theta\)。术语式 (2) 还要 \(I'\subseteq S'\)。下一轮仍用同一条 Score-DPO、同一份 \(f(x)=x\)、\(d(x,y)=(x-y)^3\)、同一套算子接口、同一个「禁止发明新算子」的生成提示。混元台阶上这不是 L0：LoRA 和工作流跨题还在。也到不了改改进器。作者特意写：评价不走生成器自己打分，以免 self-referential；分数来自验证集和第三方执行器。人没退出 \(I\)。

和邻居先划线。AFlow 专文的 80.3 是 Claude 优化、GPT-4o-mini 执行、作者切分种子 42；本表 AFlow 一行是这篇的重跑：HotpotQA 77.9，DROP 83.5，HumanEval 92.9，MBPP 82.9，GSM8K 90.8，MATH 55.8，均分 80.6。HumanEval 92.9 不要改专文的 94.7。ADAS 专文 MGSM 53.4 是另一张表；AFlow 专文里 ADAS 的 MBPP 53.4 又是第三张；本表 ADAS 均分 76.6、MBPP **68.7**，HumanEval 88.8 甚至低于 IO 的 90.1。GPTSwarm 的 GAIA 18.45 和 90.2% 相对涨幅是通信图，这边六列没有 GAIA。Self-Refine 本表均分 75.8，低于 IO 的 76.0；不要改 Madaan 七任务约 +20%。

## 2. 机制：按题吐 Python，分数进 DPO

形式目标。题 \(q\) 进生成器 \(G\)，得到工作流 \(G(q)=(V,W_f)\)。\(V\) 是算子集合（系统提示、温度），\(W_f\) 是可执行映射。搜索空间 \(\mathcal{W}\) 还要满足条件 \(C\)：对这组算子可执行。最优生成器

\[
G^{\star}=\arg\max_{G:\operatorname{Im}(G)\subset\mathcal{W}}\mathbb{E}_{q\in D}[S(q,G(q))].
\]

\(S\) 是第三方评价：解题率、F1、赢率。算子从 AFlow 那套来：Custom、Programmer、Ensemble、Reviewer、AnswerGenerate、CustomCodeGenerate、Test。生成提示写死 these are all you can use, do not create new operators。系统提示可以由 \(G\) 改，算子种类不能长。人加一种新算子，等于人改 \(\mathcal{V}\)。附录还要求输出图里**不能写进这道题的具体信息**，题面只在执行时作为算子输入。自适应指的是结构随题变，不是把答案写进图。

每轮对每道题生成 \(k=8\) 份工作流。执行器跑完给 \(s_i\in[0,1]\)。优化阶段不用裁判模型，以省钱：DROP / HotpotQA 用 F1，其余用解题率（三次平均）。测试时 MATH / DROP / HotpotQA 才用 GPT-4o-mini 当裁判，处理 0.1 和 10% 这类格式。优化阶段故意不用裁判，作者写成省钱；于是训练用的 \(s_i\) 和报道用的裁判分不是同一套手续。偏好对 \(D_q=\{(g_i,g_j)\mid s_i>s_j\}\)。普通 DPO 只看谁赢。作者说分数有噪声，收敛慢。Score-DPO 做两件事。采样按分数差加权：\(P^\star(w,l)\propto d(s_w,s_l)P(w,l)\)，默认 \(d(x,y)=(x-y)^3\)。排序目标把分数乘进隐式奖励：\(r_w^\star=f(s_w)r_w\)，\(r_l^\star=(1-f(s_l))r_l\)，默认 \(f(x)=x\)。损失

\[
\mathcal{L}_{\mathrm{Score\text{-}DPO}}=-\mathbb{E}_{(w,l)\sim P^\star}[\log\sigma(r_w^\star-r_l^\star)].
\]

定理 3.2 说，在 \(|r_z|\le 1\) 一类条件下，单条样本对目标的影响随 \(s_z\) 单调升。附录测到优化未收敛前这条大约成立 **91.1%**（MATH 99.8，DROP 82.2，MBPP 91.2）。不是保证每一步都成立。消融 Table 4：\(\alpha=0\) 退化成普通 DPO（忽略 \(f\)）；\(\alpha=2,3\) 涨；\(\alpha=100\) 只盯最极端的对，MBPP 掉到 80.1，低于 DPO 的 82.9。\(d\) 和 \(f\) 是人选的。换 \(\alpha\) 等于人改 \(I\)。

Alg. 1：\(M=3\) 轮或收敛；每题 \(k=8\)；每轮偏好更新步数 \(S=2000\)，HumanEval 最小，改成 600。硬件是两张 A6000，LoRA。生成器默认 Llama-3.1-8B-Instruct，推理走 vLLM；执行 GPT-4o-mini，温度 0。消融把生成器换成 Qwen2.5-7B-Instruct。生成提示还有几条容易听漏的禁令。图必须基于模板且能跑，不许 `import` 已经自动导入的 `operator` / `create`，不许加载名单外的算子，必须和模板不一样，输出里不能出现这道题的具体信息。后一条是为了让同一张图还能喂给别的执行器，也挡住把答案写进源码。\(C^\star\) 在 Alg. 1 里是内层 repeat：生成失败就再采样，直到无运行时错误、不超时。搜空间看起来是「任意 Python」，实现是「填算子槽 + 语法要过」。这和 FunSearch 只搜短函数、外围评价器冻着是同一类切口：空间宣传是代码，落地是带门禁的填空。人改模板或改超时，等于人改 \(C\)。

Figure 5 说测试解题率往上走，最快第二轮就收敛。\(M=3\) 是上限。第二轮已经平，不等于改进器发现自己该停；停的条件仍是人写的最大轮次或「看起来收敛」。没有单独的墙外早停集。\(S=2000\)（HumanEval 600）是每轮拿多少偏好样本去 LoRA，不是工作流条数。每题仍是 \(k=8\)。题多的集，8 份图乘执行器，账单主要在这里。模板按题型给空架子：问答直接 `answer_generate`，数学一条 Custom 指令，代码一条 `code_generate`。提示要求必须改模板，不许原样交。执行末尾还有 Answer Extractor，把冗长输出收成可打分的短答案。这也是人写的后处理。

算子按域切开，全是人从 AFlow 收的积木。数学：Custom 改指令、Programmer 写 Python 并执行、Ensemble 从候选里挑、Reviewer 看旧解再写。问答：Custom、直接作答的 AnswerGenerate、Ensemble、Reviewer。代码：CustomCodeGenerate、Ensemble、用公开测例改解的 Test。生成提示把调用格式写成 `custom(instruction)`、`programmer(analysis)`、`sc_ensemble(solutions)` 这种签名，模型只能填槽。附录样例里，简单问答可以先答再审再三轮 Custom 再集成；复杂数学常先拆步、再 Programmer、再 Review；代码常先多份 `code_generate`，集成后再 `test`。Figure 2 用两道 GSM8K 说明自适应：计算重的题要程序加评审，套太简的图会算错；计算轻的题套太深的图会 overthinking。自适应发生在 \(G(q)\)，不是发生在算子名单。人把 Programmer 从名单里拿掉，数学那一支立刻变。

![生成 k 份工作流，执行打分，构造偏好对，Score-DPO 更新生成器](./images/fig-scoreflow-loop.png)

> 图 1：实线是本题优化。回到 Generate 的是下一轮 \(G\)。算子名单不另画第五框。

**图 1 解析**

- **Generate \(k\)**：8B 按题吐 Python。禁止新算子。
- **Execute**：4o-mini 跑工作流拿 \(s\)。\(S\) 在墙外。
- **Pref pairs**：只保留 \(s_w>s_l\) 的对，再按 \(d\) 重采样。
- **Score-DPO**：LoRA 推 \(G\)。损失公式是人写的。

## 3. 数字：85.3 是六列均分，8.2 不是对 80.6

数据协议刻意对齐 AFlow / ADAS 那一套。HumanEval、MBPP 用全量。GSM8K 用测试集 1319 条。MATH 不是全集：难度 5，四个类型（组合概率、数论、pre-algebra、pre-calculus），跟 Hong 等 / AFlow 相同。DROP、HotpotQA 各随机 1000。再按 **1:4** 切验证 / 测试。指标：代码与 GSM8K / MATH 解题率，QA 用 F1。全部 GPT-4o-mini 执行，测试三次平均。

Table 1。IO：73.6 / 81.6 / 90.1 / 69.5 / 89.1 / 52.2，均分 76.0。CoT：73.4 / 83.2 / 91.6 / 70.4 / 88.3 / 53.4，76.7。CoT-SC：74.0 / 83.2 / 92.9 / 71.3 / 88.6 / 53.8，**77.3**。MedPrompt：74.4 / 83.0 / 92.1 / 69.2 / 88.1 / 53.7，76.8。MultiPersona：73.1 / 81.3 / 92.9 / 70.4 / 89.8 / 51.9，76.5。Self-Refine：73.6 / 82.5 / 91.1 / 70.0 / 87.5 / 50.0，75.8。ADAS：78.5 / 81.3 / 88.8 / **68.7** / 90.5 / 51.7，**76.6**。AFlow：77.9 / 83.5 / 92.9 / 82.9 / 90.8 / 55.8，**80.6**。ScoreFlow：86.0 / 86.2 / 95.9 / 84.7 / 94.6 / 64.4，**85.3**。

列不要平均着听。相对本表 AFlow，HotpotQA +8.1 个百分点，MATH +8.6，GSM8K 只 +3.8，MBPP +1.8，HumanEval +3.0。摘要 8.2 对的是八条基线均分，不是「每一列都比 AFlow 高 8.2」。相对 AFlow 均分的相对涨幅是 \((85.3-80.6)/80.6\approx 5.8\%\)，不要把 8.2 听成这个。MATH 64.4 仍低于常见「已解决竞赛数学」的口气。本表 ADAS 均分低于 CoT-SC，HumanEval 88.8 低于 IO，说明他们这套线性搜在这张执行器表上没有全面赢直答。

Table 2 把同一套 ScoreFlow 管道换成别的微调。左验证、右测试。SFT：HotpotQA 88.1 / 84.0，DROP 85.5 / 82.3，HumanEval 85.9 / 93.4，MBPP 83.5 / 82.0，GSM8K 88.5 / 89.8，MATH 49.6 / 54.8。PPO：87.9 / 84.2，86.0 / 83.8，84.8 / 92.7，83.7 / 82.9，87.7 / 89.2，50.0 / 55.2。DPO：88.3 / 84.1，85.3 / 84.2，86.9 / **95.9**，84.1 / 82.9，90.2 / 91.7，53.6 / 60.4。Score-DPO：89.2 / 86.0，88.5 / 86.2，87.9 / 95.9，86.0 / 84.7，93.7 / 94.6，56.5 / **64.4**。HumanEval 上普通 DPO 已经 95.9，和 Score-DPO 打平；拉开的是 MATH（60.4→64.4）和 GSM8K（91.7→94.6）。验证集普遍高于测试集，MATH 上 SFT 验证 49.6 低于测试 54.8，这一列不要当成「验证一定更松」。PPO 在长 token 工作流上稀释梯度，作者写成不稳定。SFT 只看赢家。不要用 95.9 证明 Score-DPO 在每一列都必要。

Table 3 只报 HumanEval。Llama 生成器 + 各执行器：4o-mini **95.7**（主表 95.9，消融差 0.2），GPT-4o **97.7**，DeepSeek-V3 97.2，DeepSeek-coder 97.7。Qwen2.5-7B 生成器略低一截：95.1 / 97.4 / 96.9 / 96.7。AFlow 同行：92.9 / 94.7 / 94.7 / 93.4。GPT-4o 的 CoT 是 93.4。95.7 对 93.4 才是「4o-mini 工作流胜过 4o 直答 CoT」。两边都走工作流时，GPT-4o 执行仍是 97.7，高于 4o-mini 的 95.7。DeepSeek-V3 单 Agent 低于 4o，优化后 97.2 贴近 4o 的 97.7。GPT-4o 行的优化仍用 4o-mini，测试才换。

拼集实验把 AFlow 差距最小的三列合在一起：GSM8K、MBPP、DROP。ScoreFlow 拼集 **88.1%**。这不是 Table 1 的 85.3，也不要当成六列均分。作者用它说明「一份工作流伺候三类题」时离散搜更吃亏。Figure 5：测试解题率升，最快第二轮就收敛。\(M=3\) 是上限，不是每集都跑满三轮才开始有效。

附录 Table 5–6 把 HumanEval 的美元钉死。优化（测试切片协议下）：ScoreFlow 对 4o-mini / DeepSeek-V3 / DeepSeek-coder 为 **2.2570 / 1.4124 / 1.3966**；AFlow 为 **4.6081 / 2.9160 / 2.8664**。大约一半。推理：ScoreFlow 4o-mini **0.2281**，AFlow **0.2021**，IO **0.0483**，CoT **0.0536**，CoT-SC **0.3155**，MedPrompt **0.3497**，MultiPersona **0.3789**，Self-Refine **0.1243**；换 GPT-4o 执行，ScoreFlow **5.1549**、AFlow 3.9549、CoT **1.9688**、CoT-SC 7.3738。4o-mini 推理上 ScoreFlow 并不比 AFlow 更便宜（0.228 对 0.202），只是比 4o 的 CoT 和一堆投票基线便宜。DeepSeek-V3 推理 ScoreFlow 0.1336，对 CoT 0.0300，工作流比直答贵，换来的是 Table 3 的 97.2 对 90.1。不要把 2.257/4.608 听成 AFlow 专文附录 D 的 **4.55%**：那边是 DeepSeek 执行、4o-mini 搜到的工作流对 GPT-4o 直答的成本比，分数几乎打平。两笔账分母不同。生成器用开源 8B，工作流生成本身不走付费 API，贵的是执行器反复跑 \(k=8\) 份图。AFlow 的优化器是 Claude / 4o-mini API，所以优化账单更长。这解释了「开源生成器省钱」，不解释成「已经不用执行器」。

## 4. 这不是术语式 (2)，LoRA 也不是改进器

生成器变了，下一道同基准的题走新图。改进器没变。Score-DPO、\(f\) 和 \(d\)、算子 Python 接口、生成提示里「不许新算子」、\(k\) / \(M\) / \(S\)、1:4 切分、执行器温度 0，都还在。混元 L0 装不下跨题保持的 LoRA；L3 要改提议 / 选择程序。本篇停在留下状态、不改程序。摘要里的 automated 指少写具体工作流，不是 \(I\) 在改自己。作者把评价从生成器手里拿开，恰恰是为了不做那类自指打分。

作者把「连续空间」写进摘要，读的时候要落到参数。被梯度碰到的是生成器 LoRA，不是工作流图上的边权。工作流仍是离散的 Python 字符串，执行仍是黑盒。和 GPTSwarm 的差别在这里：那边 \(\theta_i\) 直接是边概率，采样一张 DAG 再 REINFORCE；这边 \(\theta\) 在 8B 里，采样的是整份代码。和 AFlow 的差别是搜索算法：MCTS 在工作流树上走离散扩展，Score-DPO 在生成器参数上走偏好梯度。三家都要数值 \(S\)。没有金标的开放题，偏好对造不出来，连续空间也推不动。

验证集参与爬山。偏好对在 \(D\) 上采，再按 1:4 报道测试。MATH / DROP / HotpotQA 测试用裁判模型，优化阶段不用，训练信号和报道分不是同一套打分器。换切分，85.3 会动。8.2 的分母是这张表八条基线的均分，不是 80.6，不是花园 80.3。拼集 88.1 用的是「AFlow 已经最接近」的三列，故意放大自适应的好处；若改拼 MATH 那种差距大的列，故事会换。作者没有另开从未进过验证切的第七集。可靠性专文要的匹配预算新任务，主表没有。

和 AFlow 钉死。那边优化器 API 冻着，树节点是整份工作流；这边 8B 会 LoRA，按题吐图。80.6 是重跑，80.3 是原文。和 GPTSwarm 钉死。那边 \(\theta\) 是边概率，GAIA 主表没跑边优化；这边 \(\theta\) 是生成器权重。ScoreFlow 相关工作把图结构那一支写成缺条件分支，花园 GPTSwarm 专文的潜在边确实只连跨 Agent 节点、复合图限制 DAG。两篇不要收成同一张表。和 ADAS 钉死。MGSM 53.4、AFlow 表 MBPP 53.4、本表 MBPP 68.7 是三笔账。和 Self-Refine 钉死。本表 75.8 低于 IO。和 LATM 钉死。79.7 是逻辑演绎上的函数缓存；这边 85.3 是六列工作流均分。和 STOP 钉死。STOP 把改进器程序对自己递归；这边改进器是 Score-DPO，生成器再强也不改 \(d\) 和 \(f\)。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness 里的工作流生成器（LoRA）和它吐出的代码。执行器权重动了没有？没有。8.2% 是不是每列都比 AFlow 高 8.2 个百分点？不是，GSM8K 只高 3.8。还缺什么才叫花园 RSI？Score-DPO 的 \(d,f\) 或算子集进入 \(S'\)，并且下一类新基准用的就是升级后的那份训练手续。没有墙外检查「这张工作流该不该进下一次算子名单」。错工作流一旦当赢家，偏好对会把歪结构也留下。生成提示禁止把题面写进图，能挡住一部分背题，挡不住结构过拟合某一类题的写法。拼集 88.1 说明三类混在一起时自适应有用，不说明已经会改自己的损失函数。

![上排生成器 LoRA 与本题工作流；下排 Score-DPO、算子、执行器、k 与 M 冻着](./images/fig-scoreflow-frozen.png)

> 图 2：实线只更新 LoRA 和本题工作流。虚线墙右边是冻着的配方。

**图 2 解析**

- **左列**：生成器可以多一轮 LoRA，本题工作流可以变。
- **右列**：损失、算子、执行器、\(k=8\) / \(M=3\) 仍是人写的。
- **读法**：生成器在训不等于 \(I\) 在长。AFlow 的 Claude 和这边的 Score-DPO 都在墙外选谁留下。

同一句「自动生成 Agent 工作流」，至少分四截。提示优化把图钉死。ADAS 线性搜代码。AFlow 用 MCTS 加算子。ScoreFlow 用分数加权的 DPO 训生成器。四截不要收成「都已经是 RSI」。[AutoFlow](../47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md) 把工作流写成自然语言程序再 RL，[MAS-GPT](../48-MAS-GPT-一次前向吐MAS/48-MAS-GPT-一次前向吐MAS.md) 一次前向吐可执行 MAS 代码，Llama-3-70B 八列均分 65.47，不要和本表 85.3 横加。综述仍裸名的是 G-Designer / AgentPrune，本篇不代打它们的表。ScoreFlow 的连续空间是生成器 LoRA，不是 AutoFlow 那条 NL 程序上的策略梯度，也不要收成「都在训工作流所以已经是 RSI」。[MASS](../46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md) 分三阶段调提示再调拓扑，Gemini Pro 八列均分 78.79，不要和本表 85.3 横加。本篇只负责把 Score-DPO 这条代码工作流钉死。

「8.2%」要和八条基线的均分一起读。分子是 85.3 减约 77.0。相对 AFlow 重跑是 4.7 个百分点或 5.8% 相对涨幅。HumanEval 上普通 DPO 已经 95.9。不要用 8.2 改 85.3，也不要用 95.9 改 MATH 的 64.4。4.55% 那笔成本比在 AFlow 专文附录 D，不要和本篇 Table 5 的 2.257 对 4.608 横加。

生成提示不会因为某次 85.3 就把 \((x-y)^3\) 写进工作流。人要允许新算子、把 Score-DPO 本身放进搜索、让模型改 \(\alpha\)，都是改 \(I\)。这和 Gödel 改自己的决策函数、DGM 改自己的 Python 正好相反。作者把 ScoreFlow 写成在代码工作流上做可自适应的梯度优化。花园读成 2025 年这篇六基准工作流生成器微调的定位，不读成已经闭合的递归，也不读成 AFlow 原文已经被这张 80.6 的重跑作废。无数值 \(S\) 的任务，偏好对造不出来。主实验能转起来，前提是六集都有机器能打的分。

**读**：Table 1 的 85.3 对 AFlow 重跑 80.6、对基线均分约 77.0 的 8.2 个百分点，MATH 64.4，拼集 88.1 不是六列均分，优化成本 2.257 对 4.608，不是式 (2)。  
**不读**：把 8.2 听成相对 AFlow、用 80.6 改花园 80.3、用 68.7 改 53.4、说 Score-DPO 已经进了 \(S'\)、说已经 RSI。

同层：[43 AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)、[44 GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)、[46 MASS](../46-MASS-提示拓扑分阶段/46-MASS-提示拓扑分阶段.md)、[47 AutoFlow](../47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md)、[48 MAS-GPT](../48-MAS-GPT-一次前向吐MAS/48-MAS-GPT-一次前向吐MAS.md)、[07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)、[06 Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md)、[12 Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[05 STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md)、[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Wang, Y., Yang, L., Li, G., Wang, M., & Aragam, B. (2025). [ScoreFlow: Mastering LLM Agent Workflows via Score-based Preference Optimization](https://arxiv.org/abs/2502.04306). arXiv:2502.04306. Table 1 的 85.3 / 80.6 / 8.2 以 HTML 为准。
2. 代码：[Gen-Verse/ScoreFlow](https://github.com/Gen-Verse/ScoreFlow)。
3. 本花园：[AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)；[GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)。AFlow 原文均分 80.3 以专文为准，不要和本表重跑 80.6 横加。
