---
title: "46 · MASS：提示和拓扑分阶段搜，配方冻着"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Zhou 等把多 Agent 的提示和拓扑拆成三阶段搜。Gemini 1.5 Pro 八列均分 78.79。
  不要和 AFlow 专文的 80.3 横加。MIPRO、积木种类和拼装顺序冻着。不是术语式 (2)。
tags:
  - RSI
  - MASS
  - Harness
  - 提示优化
  - 拓扑搜索
  - L2
---

# 46 MASS：三阶段在搜，配方冻着

正文写 substantial margin。打开 Table 1：执行器 Gemini-1.5-pro-002，三次平均。MASS 八列 **78.79**。同表 CoT **65.28**，自洽 **68.18**，Self-Refine **66.90**，辩论 **70.26**，ADAS **69.72**。人把 78.79 听成已经超过花园 [AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md) 的 80.3，缺的是分母。80.3 是 Claude 优化、GPT-4o-mini 执行、六集；这张表执行器换成 Gemini，AFlow* 的元提示还得绑回 Claude 3.5 Sonnet，MBPP 和 LiveCodeBench 两列超时打成横杠，作者写明不是完全公平。2WikiMQA 上 AFlow* **76.51**，MASS 只有 **73.34**。会动的是各积木上的指令和示范，以及验证集上抽到的拓扑。MIPRO 的提案手续、五种积木、拼装顺序 `[summarize, reflect, debate, aggregate]`、影响力公式，都还在墙外。

本篇夹在 AFlow、[ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)、[GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md) 和 [ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) 旁边。综述把「提示和拓扑互相卡」写成 MASS 分三阶段近似联合优化。AFlow 在算子图上走 MCTS，一份工作流伺候整集；ScoreFlow 让 8B 按题吐 Python 再 Score-DPO；GPTSwarm 学跨 Agent 边概率。这边不写新算子、不训 LoRA、不碰边权，只在人给的积木上先局部调提示，再按影响力剪空间搜拓扑，再把整张工作流当一个对象调一次提示。插件是 [MIPROv2](../20-MIPROv2-贝叶斯联合优化/20-MIPROv2-贝叶斯联合优化.md)，消融还换过 APE 和 DSPy。**不是** RSI。**不是** 术语式 (2)。不要和 MaAS 的超网、也不要和终端产品 MassGen 收成一篇。一手：Zhou, Wan, Sun, Palangi, Iqbal, Vulić, Korhonen, Arık；Google / 剑桥；[arXiv:2502.02533](https://arxiv.org/abs/2502.02533)，2025-02 预印本，[ICLR 2026](https://openreview.net/forum?id=I05H9RUzHB)。论文未附官方仓。数字以 HTML Table 1–9、Alg. 1、§2–§3、附录 B–C 为准。禁止用 78.79 去改 AFlow 的 80.3 或 ScoreFlow 的 85.3。禁止用本表 ADAS 的 69.72 去改 ADAS 专文的 MGSM 53.4。

## 1. 问题：提示和拓扑卡在一块，空间乘起来搜不动

作者把单只 Agent 的提示敏感写进 MAS：一只写歪，级联会放大。拓扑再靠人手试，组合爆炸来自两头：指令几乎没有上界，积木要不要接进来又是离散选择。相关工作被他们收成各管一段。[DSPy](../20-MIPROv2-贝叶斯联合优化/20-MIPROv2-贝叶斯联合优化.md) 自动示范；有人靠多数票把 Agent 数量堆上去；ADAS 让元 Agent 写代码拓扑；AFlow 在预定义算子上走 MCTS。缺的是提示空间和拓扑空间怎么互相卡。MASS 的切口是：先量清楚两块各自的影响力，再把联合优化拆成可管理的三段，后一段吃前一段的结果。

形式目标写成找最好工作流。搜索空间 \(\mathcal{A}=\{a_i\}\) 里每个 \(a_i\) 是一种积木配置。工作流 \(\mathcal{W}(a)\) 是积木按规则排好的逻辑顺序。验证集 \((x,y)\sim\mathcal{D}\) 上

\[
\mathcal{W}^{*}(a)=\arg\max_{a\sim\mathcal{A}}\mathbb{E}_{(x,y)\sim\mathcal{D}}[f(\mathcal{W}(a(x)),y)]. \tag{1}
\]

\(f\) 按任务换：MATH 和 LiveCodeBench 的 test-output-prediction 用准确率，DROP / HotpotQA / MuSiQue / 2WikiMQA 用 F1，MBPP / HumanEval 用 pass@1。式 (1) 看起来是一次联合 \(\arg\max\)。实现里从来没有同时对所有指令和所有拓扑求这个最大。三段是人写的分解，不是从 (1) 推出来的必经之路。

积木五种，全是人收的。Aggregate：\(N_a\in\{1,3,5,7,9\}\) 路并行再汇总，最小块是 3 个预测器加 1 个聚合器，自洽和多数票落在这里。Reflect：\(N_r\in\{0,1,2,3,4\}\) 轮，最小块 1 个预测器加 1 个反射器，[Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) / [Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) 落在这里。Debate：\(N_d\in\{0,1,2,3,4\}\) 轮全连接，最小块 2 个预测器加 1 个辩论器。Summarize：长上下文才开，\(N_s\in\{0,1,2,3,4\}\)。Tool-use：代码题上二进制插不插执行器，\(N_t\in\{0,1\}\)，最小块还带一个反射器。拼装不搜顺序。作者写配置的影响远大于排列，于是顺序写死成 summarize → reflect → debate → aggregate。人改这五个集合或改这条顺序，等于人改 \(\mathcal{A}\)。

§2.1 拿 MATH 上 Gemini 1.5 Pro 做了一张 token–准确率图：先用 MIPRO 给单只 CoT 做 APO，再和自洽、Self-Refine、辩论比总 token。结论写成，把指令和示范喂好，往往比堆默认提示的 Agent 更省 token；APO 之后再叠自洽，标度还更好看。这张图是设计动机，不是 Table 1。不要把它听成「提示优化已经赢过多 Agent」。它只说：局部提示没热身就去扩拓扑，预算会先被烂积木吃掉。

## 2. 机制：1PO 热身，2TO 剪了再抽，3PO 再对齐一次

Alg. 1 按「从局部到全局、从提示到拓扑」排三步。每一步都条件在前一步冻住的结果上。优化器和执行器是同一只骨干。默认插件 MIPRO：每只 Agent 最多 3 条自举示范、10 条指令候选、10 轮。拓扑阶段用拒绝采样抽 **10** 份合法配置，每份在验证集上评 3 次。测试集再跑三次。温度 0.7，最长 4096 token。Softmax 温度 \(t=0.05\)，把选择概率拧尖。推理时 Agent 数封顶 10。这些数全是人写的门。

第一阶段，块级提示优化（1PO）。先给初始预测器做单 Agent APO，\(a_0^{*}\leftarrow\mathcal{O}_{\mathcal{D}}(a_0)\)。再在最小拓扑上，条件于 \(a_0^{*}\) 调每一种积木：\(a_i^{*}\leftarrow\mathcal{O}_{\mathcal{D}}(a_i\mid a_0^{*})\)。辩论的最小块是 2 个预测器加 1 个辩论器，不是一上来就 3 轮 3 人。作者的理由是：联合对 \(n\) 只 Agent 做 APO，中间状态没有金标，奖励还随 \(n\) 变稀，预算内做不动。1PO 把复杂度按积木切开，并且可以并行。切的代价是假装积木之间暂时没有依赖。这一步结束时记下验证成绩，后面当影响力用。

第二阶段，工作流拓扑优化（2TO）。Figure 4 已经显示，不是每种积木都加分。HotpotQA 上只有辩论带来约 **3%**，其余持平或掉；LiveCodeBench 的 test-output-prediction 同样只有一小撮正贡献。把负贡献的维留在空间里，搜索更贵，系统还可能更差。他们把增量影响力写成比值

\[
I_{a_i}=\mathcal{E}(a_i^{*})/\mathcal{E}(a_0^{*}),
\]

再 \(p_a=\operatorname{Softmax}(I_a,t)\)。抽 \(u\sim\mathrm{Uniform}(0,1)\)，若 \(u>p_{a_i}\) 就把这一维拒掉，得到剪过的 \(\mathcal{A}_p\)。然后在 \(\mathcal{N}(a)<B\) 的预算里随机抽合法 \(\mathcal{W}\)，按写死的顺序把积木串起来。10 份评完，留验证最好的 \(\mathcal{W}^{*}\)。剪枝是随机拒绝，不是硬删 \(I<1\) 的维；\(t=0.05\) 很尖，弱维几乎抽不中，但公式上仍可能漏进来。没有剪、或跳过 1PO 直接 2TO，Figure 5 右侧在 HotpotQA 上都明显差一截。作者把这两刀写成有效搜索的前提，不是可选项。

第三阶段，工作流级提示优化（3PO）。把整张 \(\mathcal{W}^{*}\) 当成一个对象，再跑一轮联合 APO：\(\mathcal{W}^{*}=\mathcal{O}_{\mathcal{D}}(\mathcal{W}_c^{*})\)。1PO 调的是最小块里的角色；3PO 要补的是级联之后谁的输出变成谁的输入。Table 6 显示这一步不是每列都涨。HumanEval 从 2TO 的 92.00 回到 91.67，和 1PO 打平；MuSiQue 从 52.61 掉到 51.40。DROP 从 86.75 到 90.52，HotpotQA 从 65.22 到 69.91，这两列才把「再对齐一次」撑起来。正文把段差收成约 6% / 3% / 2%。对着 Table 6 的均分：单 Agent APO **67.44**，1PO **74.56**（+7.12 个百分点），2TO **77.55**（+2.99），3PO 行均分写成 **78.40**。Table 1 的 MASS 均分是 **78.79**，逐列与 3PO 行相同，均分以 Table 1 为准。约 2% 对不上 0.85 个百分点；不要用正文约数覆盖表，也不要把 6% 听成相对涨幅。

基线规格写在附录 B。CoT 零样本「think step by step」。自洽 @9，温度 0.8，规则多数票。Self-Refine 最多 5 轮，最坏 11 次调用。辩论 3 人 3 轮加 1 个裁判，共 10 次。ADAS 30 轮，每轮验证 3 次，优化器和评价器都是 Gemini，提案还条件在 CoT / 自洽 / Self-Refine / 辩论的旧成绩上。AFlow 按原文 20 轮、每轮验证 5 次、\(k=3\)；元提示换 Gemini 会坏，所以优化器留 Claude 3.5 Sonnet，执行器换 Gemini 1.5 Pro。横杠是执行器陷进死循环超时，不是「没跑」。提示模板 CoT 那一组跟 ADAS 对齐，方便对照，不表示两边验证切分相同。

![1PO 调局部提示，按影响力剪空间，2TO 抽拓扑，3PO 再对齐](./images/fig-mass-loop.png)

> 图 1：实线是三段流水。虚线只在 2TO 里回到剪枝，抽满 10 份拓扑。3PO 之后没有箭回到 1PO。

**图 1 解析**

- **1PO**：最小块上调指令和示范。积木之间先假装独立。
- **Influence prune**：\(I_a\) 是验证成绩比值，不是梯度。
- **2TO**：剪过的空间里抽 10 份。顺序写死。
- **3PO**：只对 \(\mathcal{W}^{*}\) 再调一次。改进器还是 MIPRO。

## 3. 数字：78.79 是 Gemini Pro 八列均分，不是 80.3

数据是子集。附录 Table 2：MATH 验证 60、测试 100；DROP 60 / 200；三条多跳各 50 / 100，来自 LongBench 的标准化切；MBPP 60 / 200；HumanEval 50 / 100；LiveCodeBench 的 test-output-prediction 100 / 200。MATH 100 道测试不要和 AFlow / ScoreFlow 那份难度 5 四类型切横加，更不要听成 Hendrycks 全量。多跳在 Gemini 上走 LongBench 长上下文；Claude 3.5 Sonnet 窗口不够，Table 4 改回标准 HotpotQA。LiveCodeBench 只考「预测测试输出」，不是全套编程题。MBPP / HumanEval 的执行器吃公开测例，和 AFlow 同一类外部反馈。省算力的随机子集是这张表能转起来的前提。换种子，78.79 会动。

Table 1 Pro。CoT：MATH 71.67，DROP 70.59，HotpotQA 57.43，MuSiQue 37.81，2WikiMQA 63.39，MBPP 68.33，HumanEval 86.67，LCB 66.33，均分 **65.28**。自洽把 MATH 抬到 77.33，HumanEval 掉到 86.00。Self-Refine MATH 79.67，MBPP 掉到 63.67，均分 66.90，低于自洽。辩论均分 70.26，HotpotQA 64.87，仍低于 MASS 的 69.91。ADAS 均分 **69.72**，LCB 65.17 低于 CoT 的 66.33，作者说元 Agent 爱提复杂拓扑、不调提示。AFlow*：MATH 76.00，DROP 88.92，HotpotQA 68.62，MuSiQue **32.05**（低于 CoT），2WikiMQA **76.51**（高于 MASS），HumanEval 88.00，MBPP / LCB 横杠。MASS：84.67 / 90.52 / 69.91 / 51.40 / 73.34 / 86.50 / 91.67 / 82.33，均分 **78.79**。列不要平均着听。相对本表 ADAS，均分差 9.07 个百分点；相对 CoT 差 13.51。相对花园 AFlow 80.3 没有可比性。HumanEval 91.67 不要改 AFlow 专文的 94.7，也不要改 ScoreFlow 的 95.9，更不要改 LATS 的 92.7。

Flash 表 MASS 均分 **74.30**，CoT 60.87，ADAS 64.75。不是每列都赢：MuSiQue 上 MASS **43.67**，低于辩论 46.27 和 ADAS 48.81。MATH 81.00 对 CoT 66.67，这一列拉开得最大。Table 9 只在 Flash MATH 上换插件：CoT 66.7，APE 73.3，DSPy 78.2，MIPRO **81.0**。81.0 对得上 Table 1 Flash 的 MATH，不表示八列都该换 MIPRO。作者写框架对优化器无关；表上 MIPRO 仍是默认赢家。不要把 81.0 听成 Pro 的 84.67。

Claude 3.5 Sonnet，Table 4，六列。CoT 均分 60.21。辩论均分 **43.36**：MATH 45.00，DROP 26.62，MBPP **0.00**。作者写提示从 Gemini 挪过来，基本拓扑会崩。MASS 均分 **72.43**，HotpotQA 从 CoT 的 23.56 拉到 66.98，HumanEval 93.00。MBPP 只到 68.83，略高于 CoT 的 67.50，没有 Pro 表上 86.50 那种跳。Mistral-Nemo-12B 四列均分 MASS **55.9**，CoT 40.4，辩论 46.9；MATH 从 13.3 到 43.7。开源小模型上三段仍然动，天花板也仍是 12B。

Table 6 把 Base Agent 和 APO 也摊开。Base MATH 62.33，不是 Table 1 CoT 的 71.67，两行起点不同，不要当成同一只 CoT。APO 之后 MATH 79.33，HumanEval 从 89.33 **掉到** 86.33，MBPP 从 68.83 掉到 67.00。单只 APO 在代码列会伤。1PO 把 HumanEval 拉回 91.67，MBPP 到 80.33。所以「先调提示」不是「先调单只 CoT 就够了」，要在最小多 Agent 块里调。MATH 上 Stage 1 的最佳积木是辩论；Stage 2 找到的却是 \(\{9,0,0\}\)，九路聚合、零反射、零辩论。DROP 是 \(\{5,0,0\}\)。多跳三列都留下辩论：HotpotQA \(\{0,5,0,1\}\)，MuSiQue \(\{0,3,0,2\}\)，2WikiMQA \(\{0,3,0,1\}\)。代码三列都留下执行器：MBPP \(\{1,4,0,1\}\)，HumanEval \(\{1,3,0,1\}\)，LCB \(\{3,1,1,1\}\)。同一家族内部仍不一样，这才是自动搜的理由。人若按「数学用辩论」写死，会和 MATH 上最后留下的九路自洽式聚合打架。Figure 7 把这条 MATH 轨迹画成三格：1PO 结束时辩论是最好的最小块，2TO 改成更多并行聚合，3PO 再给聚合器写出适合九路并行的预测提示。同一道基准，Stage 1 的赢家不必等于最终拓扑。人若在 1PO 之后就停，会把辩论留下；主表 MATH 84.67 用的是 \(\{9,0,0\}\)。自洽基线 @9 没有优化过聚合提示，同表 77.33。九路这个数字两边靠近，差的是示范和指令。\(N_a=9\) 只是搜索维上的一个点，不是已经证明「越大越好」。

Table 7 报训练和单条推理账单。训练：AFlow 输入 11M、输出 8M、**3.89** 美元；ADAS 23M / 13M / **5.61**；MASS 24M / 11M / **5.09**。推理：MASS 每条 0.0014 美元，辩论 0.0012，ADAS 0.0016，AFlow **0.0006**。这张表的 Acc 列，自洽 69.3、Self-Refine 71.3、辩论 71.7、MASS 81.0，对得上 Flash 的 MATH；AFlow 写成 64.3、ADAS 72.7，对不上 Table 1 任何一格 MATH。不要用 81.0 去改 78.79，也不要说 MASS 推理比 AFlow 便宜。1PO / 2TO 可并行，ADAS 和 AFlow 必须等上一条轨迹结束才能提案，这是作者写的工程差别，不是分数差别。

Table 8 在 MATH 和 HumanEval 上重跑 GPTSwarm。Pro：GPTSwarm 76.0 / 85.0，均分 80.5；MASS 84.7 / 91.7，均分 88.2。Flash：61.0 / 73.0 对 81.0 / 84.7。正文写相对图优化 MATH 约 8%、HumanEval 约 6%，差的是 8.7 和 6.7 个百分点。花园 GPTSwarm 专文的 HumanEval 0.88 是 `gpt-4-1106-preview` 节点优化、整集评；这边 85.0 是 Gemini 1.5 Pro 重跑。两笔不要横加。作者的判断是：图优化更擅长把全连接剪稀来省推理，任务分数这块提示优化贡献更大。[G-Designer](../49-G-Designer-任务自适应通信图/49-G-Designer-任务自适应通信图.md) 按题出图，MMLU 84.50；[AgentPrune](../50-AgentPrune-时空图剪边/50-AgentPrune-时空图剪边.md) 剪边省 token，均分 89.72。本篇不代打它们的美元散点。

## 4. 这不是术语式 (2)，三段分解也不是改进器

\(S\) 取这次搜索留下的指令、示范和 \(\mathcal{W}^{*}\)。单轮 \(S'=I(S)\) 可以发生：1PO 写出新提示，2TO 换拓扑，3PO 再改一版。术语式 (2) 还要 \(I'\subseteq S'\)。下一集仍用同一只 MIPRO、同一份五种积木、同一条拼装顺序、同一则 \(I_a=\mathcal{E}(a_i^{*})/\mathcal{E}(a_0^{*})\)、同一个 \(t=0.05\)、同一道 10 份拓扑的门。混元台阶上这不是 L0：搜到的 MAS 跨题还在。也到不了改改进器。人没退出 \(I\)。作者把 interleaved 写成克服组合爆炸。花园读成分阶段近似，不是 \(I\) 在改自己的分解手续。搜完即冻。图 1 的虚线只在 2TO 内部打转，没有箭从 3PO 回到 1PO 去改 MIPRO。

和邻居钉死。AFlow 专文均分 80.3、HumanEval 94.7、摘要 5.7% 不是每列都涨 5.7 个百分点；本表 AFlow* 没有八列均分，MATH 76.00、MuSiQue 32.05、2WikiMQA 76.51。优化器 API 冻着，这一点两边一样；搜的对象不同：那边是算子图上的 MCTS 节点，这边是积木配置加提示字符串。ScoreFlow 六集均分 85.3、摘要 8.2% 是对八条基线均分约 77.0 的百分点差，执行器 GPT-4o-mini，生成器会 LoRA。MASS 的 Gemini 78.79 不要和 85.3 比谁更 RSI。GPTSwarm 主表 GAIA 没跑边优化，90.2% 是相对 9.70 的相对涨幅；Table 8 的 85.0 不要改专文的 0.88。ADAS 专文 MGSM 53.4 是另一张表；本表 ADAS 69.72 是 Gemini 八列。Self-Refine 本表均分 66.90，低于自洽 68.18，不要改 Madaan 七任务约 +20%。MIPROv2 专文是 TPE 搜指令和示范；这边把它当 \(\mathcal{O}\) 插入 MAS。换 APE，Flash MATH 从 81.0 掉到 73.3，\(I\) 里换插件等于人改 \(I\)。

验证集参与爬山。影响力、10 份拓扑、3PO，全在 Table 2 那几十到一百条验证题上。MATH 验证只有 60 道。没有另开从未进过验证切的第九集。可靠性专文要的匹配预算新任务，主表没有。3PO 在 MuSiQue / HumanEval 上微掉，说明联合微调会过拟合 \(\mathcal{W}^{*}\) 在验证集上的写法。作者没有墙外检查「这张拓扑该不该进下一次积木名单」。错积木一旦在 1PO 里被调到还不错，\(I_a\) 会把它留在 2TO 里。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness 里的提示字符串和积木连接。骨干权重动了没有？没有，Gemini / Claude / 12B 都当冻住的执行器。78.79 能不能拿去改 AFlow 的 80.3？不能。还缺什么才叫花园 RSI？MIPRO 的提案手续或五种积木进入 \(S'\)，并且下一类新基准用的就是升级后的那份搜索手续。现在升级手续的是人：改 \(t\)、改 10 份、改拼装顺序、把 ProTeGi / TextGrad 换进 \(\mathcal{O}\)。附录把这些写成未来工作，正说明它们还不在 \(S'\) 里。

![上排提示和拓扑在长；下排 MIPRO、积木种类、拼装顺序和 t 冻着](./images/fig-mass-frozen.png)

> 图 2：实线只更新块级提示和抽到的 \(\mathcal{W}\)。虚线墙右边是冻着的搜索手续。

**图 2 解析**

- **左列**：1PO / 3PO 可以改提示，2TO 可以换拓扑。
- **右列**：MIPRO、五种积木、顺序、\(t=0.05\) 仍是人写的。
- **读法**：分阶段搜不等于 \(I\) 在长。AFlow 的 Claude 和这边的 MIPRO 都在墙外选谁留下。

同一句「自动设计多 Agent」，至少分四截。提示优化把图钉死。ADAS 线性搜代码。AFlow 用 MCTS 加算子。MASS 把提示和拓扑拆成 1PO / 2TO / 3PO。四截不要收成「都已经是 RSI」。[AutoFlow](../47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md) 把工作流写成自然语言程序再 RL，[MAS-GPT](../48-MAS-GPT-一次前向吐MAS/48-MAS-GPT-一次前向吐MAS.md) 一次前向吐可执行 MAS 代码，[G-Designer](../49-G-Designer-任务自适应通信图/49-G-Designer-任务自适应通信图.md) 按任务生成图，MMLU 84.50。[AgentPrune](../50-AgentPrune-时空图剪边/50-AgentPrune-时空图剪边.md) 剪边省 token，均分 89.72，表上 27.2% 是保留比。MaAS 把超网当可采样分布，和这篇的离散积木配置不是同一条搜索。学习派那一档也不在 78.79 里。

「约 6% / 3% / 2%」要和 Table 6 一起读。APO→1PO 表上是 7.12 个百分点，2TO→3PO 不到 2。78.79 的分母是 Gemini 1.5 Pro、八个子集、三次平均。相对 AFlow* 没有均分可比，因为横杠。相对花园 80.3 / 85.3 是不同执行器。Claude 表上辩论 MBPP 可以是 0.00，说明「多 Agent」不是免费升级，提示挪骨干就会塌。MASS 把塌掉的拓扑搜回来，搜的预算和积木名单仍是人定的。

提示优化器不会因为某次 78.79 就把 Softmax 温度写进 \(S'\)。人要允许新积木、让模型改拼装顺序、把影响力公式放进搜索，都是改 \(I\)。这和 Gödel 改自己的决策函数、DGM 改自己的 Python 正好相反。作者把 MASS 写成在有影响力的空间里做可扩展的 MAS 优化，并给了三条设计原则：先把单只积木调好再组合；只组合有正贡献的拓扑；最后用工作流级 APO 对一下依赖。三条是人从搜到的系统里归纳出来的，下一次搜索仍由这三条外面的 Alg. 1 执行。花园读成 2025 年这篇八子集分阶段搜索的定位，不读成已经闭合的递归，也不读成 AFlow 原文已经被这张 Gemini 表作废。无数值 \(f\) 的任务，影响力比值造不出来。主实验能转起来，前提是八列都有机器能打的分。

**读**：Table 1 的 78.79 对 CoT 65.28、对 ADAS 69.72，AFlow* 的 76.51 在 2WikiMQA 更高，MATH 测试 100 道，Table 6 的 7.12 / 2.99，不是式 (2)。  
**不读**：把 78.79 听成超过 AFlow 80.3、用 91.67 改 94.7、用 85.0 改 GPTSwarm 的 0.88、说三段分解已经进了 \(S'\)、说已经 RSI。

同层：[43 AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)、[45 ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)、[44 GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)、[07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)、[20 MIPROv2](../20-MIPROv2-贝叶斯联合优化/20-MIPROv2-贝叶斯联合优化.md)、[12 Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)、[19 APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md)、[47 AutoFlow](../47-AutoFlow-自然语言工作流RL/47-AutoFlow-自然语言工作流RL.md)、[48 MAS-GPT](../48-MAS-GPT-一次前向吐MAS/48-MAS-GPT-一次前向吐MAS.md)、[49 G-Designer](../49-G-Designer-任务自适应通信图/49-G-Designer-任务自适应通信图.md)、[50 AgentPrune](../50-AgentPrune-时空图剪边/50-AgentPrune-时空图剪边.md)、[06 Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md)、[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Zhou, H., Wan, X., Sun, R., Palangi, H., Iqbal, S., Vulić, I., Korhonen, A., & Arık, S. Ö. (2025). [Multi-Agent Design: Optimizing Agents with Better Prompts and Topologies](https://arxiv.org/abs/2502.02533). arXiv:2502.02533. ICLR 2026. Table 1 的 78.79 以 HTML 为准。
2. 论文未附官方实现。不要和 [MassGen](https://github.com/massgen/MassGen) 或 MaAS 超网仓混淆。
3. 本花园：[AFlow](../43-AFlow-工作流MCTS/43-AFlow-工作流MCTS.md)；[ScoreFlow](../45-ScoreFlow-Score-DPO工作流/45-ScoreFlow-Score-DPO工作流.md)；[GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)；[MIPROv2](../20-MIPROv2-贝叶斯联合优化/20-MIPROv2-贝叶斯联合优化.md)。AFlow 原文均分 80.3 以专文为准，不要和本表 AFlow* 横加。
