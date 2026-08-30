---
title: "20 · MIPROv2：指令和示范一起搜，TPE 冻着"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Opsahl-Ong 等把多段 LM 程序的指令和少样本示范收成离散变量，用接地提案加 TPE 联合搜。Llama-3-8B 上七套程序五套赢过对照优化器。
  贝叶斯配方冻着。不是式 (2)。不要和 GEPA 表上的 MIPROv2 横加。
tags:
  - RSI
  - MIPRO
  - MIPROv2
  - DSPy
  - prompt-optimization
  - Harness
---

# 20 MIPROv2：指令和示范一起搜，TPE 冻着

GEPA 把 MIPROv2 写成「每个模块先 bootstrap 指令和示范，先验均匀，再用 TPE 提候选」。打开原论文，算法名是 **MIPRO**（Multi-prompt Instruction PRoposal Optimizer）。DSPy 里的入口叫 `dspy.MIPROv2`，`auto=light/medium/heavy` 是后来的预算预设。花园这篇钉的是 EMNLP 相机就绪那张七任务表，不是 GEPA 用 Qwen3 重跑的那列。Llama-3-8B 当任务模型、GPT-3.5 当提案模型，七套程序里 MIPRO 在五套上赢过对照优化器。摘要写最多约 **13** 个点；表上相对未优化的测试增益可以更大，相对第二名优化器常常更小。权重不动。控制流 $C$ 不动。

本篇是 Harness 里「多段程序联合搜指令和示范」的样板。APE / OPRO / EvoPrompt 默认对着**一条**任务指令。这边 $\Phi$ 有 $m$ 个模块，每个模块一张提示模板，模板上有指令槽和 $K$ 个示范槽。优化器看不见中间模块的金标，也没有梯度，只拿程序级度量 $\mu$。改的是槽里的字符串。写出候选的接地模板、TPE 先验、小批量 $B$、每 $S$ 步全量评估、试验帽，下一场实验原样再走。**不是** RSI。**不是** 微调。一手：Opsahl-Ong, Ryan, Purtell, Broman, Potts, Zaharia, Khattab，Stanford / Basis / KTH / Berkeley，[arXiv:2406.11695](https://arxiv.org/abs/2406.11695)，EMNLP 2024（ACL Anthology `2024.emnlp-main.525`，pp. 9340–9366）；实现 [dspy.ai MIPROv2](https://dspy.ai/api/optimizers/MIPROv2/)。数字以 HTML v2 Table 1–2、§4.3、§6 为准。投稿稿曾写六任务，以七任务为准。GEPA Table 1 的 MIPROv2（Qwen3-8B 均 55.11、4.1 mini 均约 59.7）是另一套任务、另一只骨干、`auto=heavy`；禁止和本篇 ScoNe 测试 **79.4** 或 HotPotQA 测试 **46.4** 横加。

## 1. 问题：多段程序没有模块级标签

单段提示搜索已经难。多段更难两处。提案：每个模块一张提示，笛卡尔积爆炸，必须先提出少量能用的指令。归功：只有程序级分数，不知道是查询写坏了还是最后一跳答错了。APE 的筛选、OPRO 的轨迹，默认都还在**一条**指令上。作者把问题收成：给程序 $\Phi$、度量 $\mu$、训练对 $\mathcal{D}$，找变量到字符串的赋值 $\mathbf{V}\mapsto S$，最大化训练上的均分。假设没有权重、没有 logprob、没有中间标签。

$$
\Phi^{\star}=\arg\max_{\mathbf{V}\mapsto S}\frac{1}{|\mathcal{D}|}\sum_{(x,x')\in\mathcal{D}}\mu\bigl(\Phi_{\mathbf{V}\mapsto S}(x),x'\bigr)
$$

$S$ 取各模块的指令和示范。单轮 $S'=I(S)$ 可以发生：bootstrap 出新示范集，接地提案写出新指令，TPE 抽一组组合，小批量打分，更新代理模型。式 (2) 还要 $I'\subseteq S'$。接地用哪些摘要、TPE 怎么抽、小批量多大、全量评估间隔、提案模型是 GPT-3.5，下一场 Iris 还是同一份。混元台阶上这是薄 $H_t$：留下的是填好的提示，改进器在墙外。MIPRO++ 会调「要不要数据集摘要、温度多少、用哪条 tip」，那是另一层冻着的贝叶斯，不是 $I$ 进了 $S'$。

变量故意只开指令和示范。模板其余槽冻死。这和 ADAS 搜 `forward` 对调：这边 $C$ 冻着，搜 $\Pi$ 和示范；那边提示常常冻着，搜控制流。论文图 1 画的是多跳检索：给问答对和度量，优化器给每一跳提新指令、bootstrap 新示范。示范在图里故意没画满，正文才补上。读者如果只看那张图，会以为只在搜指令；主表的赢家经常是示范。这是本篇最容易误读的一页。主实验交卷是填好的程序，不是一只新的提案模型。

![先 bootstrap 示范，再接地写出指令，TPE 抽组合，小批量打分后更新代理](./images/fig-mipro-loop.png)

> 图 1：实线是候选组合被评分。虚线是冻着的接地模板和 TPE 抽样规则。更新的是槽里的字符串，不是搜索配方。

**图 1 解析**

- **Bootstrap**：训练输入跑过 $\Phi$，度量过阈值的轨迹拆成各模块的输入输出对，当少样本候选。
- **接地提案**：给提案 LM 数据集摘要、程序摘要、成功示范、一条随机 tip（*be concise* 一类）。
- **TPE**：每个模块的指令编号和示范集编号是离散变量，先验均匀，Optuna 的多元 TPE 建代理。
- **小批量**：每步在大小 $B$ 的训练子集上估分，省全量。
- **全量**：每 $S$ 步把目前均分最高的组合放到完整训练上看一眼。交卷是全量最高的那份赋值。

## 2. 机制：提案和归功拆开

算法 1 是总架子：初始化、提案、抽小批量、打分、更新，循环 $I$ 次，最后抽出最好赋值。APE / OPRO 能嵌进去。MIPRO 的拆法是：提案只负责写出候选池，归功交给代理模型，不要让同一只 LM 同时编故事又当裁判。

Bootstrap 来自 DSPy 那条拒绝采样。过门的轨迹变成示范。剩下的问题是选哪几条、跨模块怎么搭配。Bootstrap Random Search 随机抽组合、全量评估，是强基线。作者说示范往往比指令更抬分，因为轨迹里带着**成功怎么想**，不只是教格式。

接地针对指令。零样本小程序分别：描写数据集规律、摘要控制流、拿出成功示范、收集历史上评过的指令和训练分。数据集摘要不是人写的：按批扫训练，让提案 LM 往观察清单里加条目，连续五次输出 COMPLETE 才停，再压成两三句。tip 是离散菜单：creative、simple、description、high_stakes、persona 五条，用来把指令特征空间撑开，不是让模型自己发明新 tip。消融证明：HotPotQA / HoVer 离了接地几乎不涨；ScoNe 加上去反而伤。所以没有「永远要摘要」这回事。MIPRO++ 把「用不用摘要、用不用程序摘要、提案温度、哪条 tip、给提案看哪组示范」收成超参，再用同一套小批量贝叶斯去搜。附录重要性：跨任务最稳的是元提示里那组示范，以及 tip。HoVer 上提案温度也会被标成重要。别的超参随任务跳。这是 $I$ 的旋钮被搜了一次，搜旋钮的手续仍冻着。Heart Disease 附录里搜到的指令会写成急诊室、多个实习医生意见再拍板——那是示范加指令 jointly 之后留下的句子，下次分类任务不会自动带上这套急诊人设，除非你再跑一遍同一份 $I$。

归功三条。贪心：一次只改一个模块（CA-OPRO），初实验又慢又没有明显好处，主表不用。历史：把分数史塞给提案 LM，等于模块级 OPRO，默认「程序分能代表每一条指令」。代理：TPE 吃离散组合和带噪的小批量分，显式建「谁和谁一起好」。实现走 Optuna 里 Bergstra / Falkner 那支多元 TPE，用来对跨模块变量建模联合贡献，不是独立抽每个槽。作者写代理的短板：候选池是固定的，过去的分不能拿去**写出更好的新指令**，只能在已有编号里挑。GEPA 后来用轨迹反思写新指令，正是补这块。本篇没做那步。小批量让同预算能看更多组合，噪声交给贝叶斯的不确定度去吞。每 $S$ 步才上全训练，交卷只认全量评估过的赋值，避免小批量冠军直接进测试。

0-Shot MIPRO 只搜指令。Bayesian Bootstrap 只搜示范。主方法 MIPRO 两者一起搜。全量训练评估的预算按任务不同：HotPotQA / ScoNe **50** 次（小批量大约 300 步），Iris / Heart / HotPotQA Conditional **30** 次，HoVer 最贵只 **20** 次。作者写后三套实验重点是「指令对示范」，不一定给够让各方法分化的步数。每种方法每任务 5 个种子。任务模型默认 Llama-3-8B，温度 0.7、top-p 1.0，**不用 chat template**，作者说 DSPy 的续写壳在无模板时更顺。ScoNe 最长 200 token，HoVer 600，其余 150。教师示范默认也是 Llama-3-8B，ScoNe / HoVer 改 GPT-4o。提案默认 GPT-3.5；ScoNe、HoVer、Iris 可以用 GPT-4，同样温度 0.7。候选数 $N$ 按 $N<T/v$ 拍脑袋，附录 Table 4：联合 MIPRO 在 HotPotQA / Conditional / Iris 上每模块 30，Heart 15，ScoNe 70，HoVer 10。没有做大扫。这不是 `auto=heavy` 的 18。

## 3. 数字：13 不是任何一列的标签

七套程序，训练 500、开发 500、测试 2000 或全集。Table 1：HotPotQA 两模块三调用、精确匹配，fullwiki 设定。检索器对着 5M 篇 Wikipedia 摘要。检索模型不在被搜的 $\mathbf{V}$ 里，是墙外工具 $T$。优化器只能改「生成什么查询、最后怎么答题」，不能改倒排或嵌入。HoVer 同样。花园把 Recall@21 的涨读成查询指令和示范变好，不读成检索器自己进化。这和 CRITIC 把搜索 API 放在墙外是同一几何，只是这里的度量在程序尽头。HotPotQA Conditional 按答案是人、日期还是地点换格式，用来测「规则写在指令里、示范说不清」。Iris 给六个实数特征做花分类，规则简单但**不交给模型**，看优化器会不会自己逼出 CoT；Iris-Typo 把 versicolor 写成 versicolour。Heart Disease 十三个特征做是否有病，程序先出三个带 CoT 的临床意见再汇总，四次调用。ScoNe 是嵌套否定的蕴含。HoVer 三跳检索未核实声称，用金文档算三跳 top-10 并起来的 Recall@21。正文有一处写成「四段加两段」，表是七行，以表为准。Wilcoxon 签秩对着测试集上每次 run 的逐条均分，p < .05 才单独加粗；不显著就并列加粗。五种子，不是一次运气。

Table 2 测试列（五次平均）。未优化 N/A 和 MIPRO：

| 任务 | N/A 测试 | Bootstrap RS | 0-Shot MIPRO | MIPRO |
|------|--------:|-------------:|-------------:|------:|
| ScoNe | 69.1 | 75.4 | 71.5 | **79.4** |
| HotPotQA | 36.1 | 45.8 | 36.8 | 46.4 |
| HoVer | 25.3 | 37.2 | 33.1 | **39.0** |
| HotPotQA Cond. | 6 | 10.4 | 14.6 | **23.3** |
| Iris | 40.9 | **94.1** | 36.4 | 88.6 |
| Iris-Typo | 32 | 58.7 | 56.7 | **68.7** |
| Heart Disease | 26.8 | **79.2** | 25.8 | 74.2 |

五套赢对照，不是七套都赢联合搜索。Iris 无错字、Heart Disease、HotPotQA 是 Lesson 2 点名的例外：联合指令并不总比只搜示范高。Iris 测试上 Bootstrap RS 94.1 高于 MIPRO 88.6，训练上却是 MIPRO 98.4 对 RS 95.2——联合搜可以在训练上更亮、测试上翻车。HotPotQA Conditional 才是指令真正值钱的地方：示范说不清「人/日期/地点用不同格式」，0-Shot 14.6 已经超过只搜示范的 10.4，联合到 23.3。相对未优化的 6，涨幅远大于摘要的 13。HoVer 25.3→39.0 大约 +13.7，最像那句「最多约 13 个点」的来源，但作者没把 13 钉在这一格。花园只认表，不认海报里的 13 去改任何一列。

模块级 OPRO 带接地：HotPotQA 测试 39.0，HoVer 32.5，ScoNe 73.5。去掉接地（$-$G）：HotPotQA 掉回 36.0，HoVer 25.7，ScoNe 反而 76.1。接地不是免费增益。0-Shot MIPRO++ 在 ScoNe 测试 75.7，把接地伤到的那截找回来；HoVer 上和 0-Shot MIPRO 打平。Bayesian Bootstrap 相对 RS：ScoNe 有优势（77.4 对 75.4），HotPotQA / HoVer 统计上不明显。程序级 OPRO 把整段多跳轨迹史塞给提案 LM，作者嫌历史一长信息就丢，初实验没有额外好处，主表只用模块级。CA-OPRO 一次改一个模块，时间复杂度差，同样没进主表。

GEPA 的 MIPROv2 列不要搬过来。那边 Qwen3 HotpotQA 55.33、均 +6.26，任务切分、骨干、是否只改指令都不同。ACE 的 MIPROv2 是金融 / AppWorld 上的另一场。本篇 HotPotQA 测试 46.4 是 Llama-3-8B、精确匹配、500/500/2k。三套 MIPROv2 字面相同，分母不同。Llama 用 SGLang 跑在 A100 上，八卡并行只是他们的工程，复现声称一张能跑 8B 的卡或云 API 就够。不要把八卡听成方法的一部分。

![上排各模块的指令和示范被换成新赋值；下排接地模板、TPE、小批量、GPT-3.5 提案冻着](./images/fig-mipro-frozen.png)

> 图 2：实线更新 $\mathbf{V}\mapsto S$。虚线是冻着的 $I$ 和 $\theta$。TPE 自己不进 $S'$。

**图 2 解析**

- **会变**：每个模块的指令字符串、少样本示范集、当次小批量分数。
- **冻 $\theta$**：任务模型 Llama-3-8B（主表）不微调；提案 GPT-3.5 也不微调。
- **冻 $I$**：bootstrap 阈值、接地四件套、TPE、小批量 $B$、全量间隔 $S$、试验帽 20–50、候选数 $N$。
- **门**：训练（小批量 / 间歇全量）上的 $\mu$。测试集不当学习信号。开发集在表里另报，不要和测试收成一列。

## 4. 贝叶斯优化器不是式 (2)

TPE 会「学习」哪种指令编号配哪种示范集更好，听成改进器在进化几乎又是设计好的误会。学到的是当次实验里那只代理的后验。下一场 Heart Disease，先验重新均匀，接地模板还是同一份。代理的短板作者自己写了：候选编号集合固定，过去的分不能催生更好的新指令。这和 APE「三轮质量就稳住」是同一家族的天花板，只是 MIPRO 用贝叶斯在固定池里走得更久。MIPRO++ 连提案超参都搜，搜完留下的是一场任务上的提案策略，不是一份会改自己贝叶斯核的新 $I$。作者 Lesson 5 写得很白：0-Shot 三家谁赢还混着，低预算或许 MIPRO 小批量更合适，高预算或许 MIPRO++ 才分化，**留给未来工作**。Khattab 等 2024 的 DSPy 论文已经能搜示范和权重；本篇补的是多段程序上的**自由指令**。不要把「DSPy 会 compile」听成本篇在改编译器。

和 [APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md) 钉死。APE 一次提案加筛选，默认不迭代，对象是一条指令。这边候选池先固定，再在组合上走几十步带噪评估。和 [OPRO](../17-OPRO-元提示优化/17-OPRO-元提示优化.md) 钉死。模块级 OPRO 把历史分塞回提案 LM，等于让 LM 同时提案和归功；MIPRO 把归功交给 TPE。本篇的 OPRO 对照不是 Yang 等的 PaLM GSM8K 80.2。和 [EvoPrompt](../18-EvoPrompt-进化算子提示/18-EvoPrompt-进化算子提示.md) 钉死：那边冻着交叉说明书换种群；这边冻着 TPE 换离散编号。和 [Promptbreeder](../16-Promptbreeder-自我指涉提示进化/16-Promptbreeder-自我指涉提示进化.md) 钉死：那边 $M$ 进种群；这边提案模板不进种群。和 [GEPA](../15-GEPA-遗传Pareto提示/15-GEPA-遗传Pareto提示.md) 钉死：GEPA 用轨迹反思写**新**指令，对齐的是 DSPy MIPROv2 的 rollout 帽，不是本篇 Llama 表。和 [TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md) 钉死：那边反向传句子，GSM8k 上还跟 DSPy 示范拼到 82.1；这边正向离散搜，主表没有 GSM8K。和 [ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) 钉死：搜的不是 `forward`。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？各模块的指令和示范。TPE 动了没有？当次后验会变，配方冻着。13 能不能当 SoTA？不能，连哪一列都没有钉死。还缺什么？接地模板或 TPE 核进入 $S'$，并且下一轮优化器就是升级后的那份。作者把预算与 MIPRO++ 的分化写成还没做。检索器和 Wikipedia 索引从头到尾都在墙外，多跳分数涨了也不要把倒排听成被优化的变量。

## 5. 示范、13、GEPA 的 heavy 不要收成一个故事

Lesson 1：多数任务只搜示范就碾压只搜指令。例外是有条件规则、示范说不清的题。所以「提示优化」四个字在本篇里经常是**少样本组合优化**。作者还看过不同示范集之间的方差：附录 G 说组合之间分差很大，强示范教的是成功怎么想，不只是输出格式。GEPA 后来在更听话的模型上说「只改指令可以超过指令加示范」，那是另一只骨干、另一套任务，用来解释 ACE 的 brevity，不能回写本篇 Lesson 1。Heart Disease 的种子指令故意不写分类标准，指令优化器推断能力有限，这是联合搜索在测试上输给只搜示范的原因之一，不是 TPE 坏了。Iris 无错字已经能被示范几乎解掉（RS 测试 94.1），再加指令搜索主要在训练上发光，测试掉到 88.6，是过拟合的样子。有错字时指令搜索才能改种子里的词，联合到 68.7 才有意义。

13 是摘要修辞。表上相对 N/A，Heart 从 26.8 到 74.2，Iris 从 40.9 到 88.6，HotPotQA Cond 从 6 到 23.3。相对第二名优化器，联合搜索的边际常常只有一两个点，有时还是负的。读「五套赢」时先看赢的是谁：赢的是对照优化器，不是赢过未优化 13 个点那么整齐。

`auto=heavy` 是 DSPy 文档的预算：约 18 条指令候选、18 组示范。GEPA 拿它来对齐 rollout。本篇实验写 20–50 次全量训练评估，候选数 $N$ 按 $N<T/v$ 拍脑袋，附录 Table 4，没有 heavy 这个词。三套预算禁止横加。仓库后来的优化器对比博文、别的 teleprompter 研究，不是本表。HoVer 的 Recall@21 把三跳 top-10 并在一起算，不要和 HotPotQA 的精确匹配收成「检索都 40 多」。ScoNe 未优化测试已经 69.1，优化空间和 Iris 从 40.9 起跳不是同一量级；均分或「最多 13」会把这两列洗在一起。

**读**：七任务、Table 2 测试列、ScoNe 79.4、HoVer 39.0、HotPotQA Cond 23.3、Iris 测试 RS 94.1 高于 MIPRO 88.6、50/30/20 全量预算、Table 4 的 $N$、接地随任务、五条 tip、无 chat template、TPE 冻着、5M 摘要检索在墙外、论文 MIPRO / 库 MIPROv2、提案 GPT-3.5（部分 GPT-4）任务 Llama-3-8B。  
**不读**：把 13 标到某一格、用 GEPA 的 55.11 改 46.4、把 MIPRO++ 听成式 (2)、说七套都是联合最好、用 v1 的六任务、把 `auto=heavy` 写进本篇主实验、把八卡 A100 听成方法。

同层：[19 APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md)、[18 EvoPrompt](../18-EvoPrompt-进化算子提示/18-EvoPrompt-进化算子提示.md)、[17 OPRO](../17-OPRO-元提示优化/17-OPRO-元提示优化.md)、[15 GEPA](../15-GEPA-遗传Pareto提示/15-GEPA-遗传Pareto提示.md)、[14 TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md)、[07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)。综述：[05](../../1-坐标系与术语/05-自进化Agent综述/05-自进化Agent综述.md)。

## 参考文献

1. Opsahl-Ong, K., Ryan, M. J., Purtell, J., Broman, D., Potts, C., Zaharia, M., & Khattab, O. (2024). [Optimizing Instructions and Demonstrations for Multi-Stage Language Model Programs](https://arxiv.org/abs/2406.11695). EMNLP 2024. arXiv:2406.11695.
2. DSPy：[MIPROv2](https://dspy.ai/api/optimizers/MIPROv2/)。
3. 本花园：[GEPA](../15-GEPA-遗传Pareto提示/15-GEPA-遗传Pareto提示.md)；[APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md)；[OPRO](../17-OPRO-元提示优化/17-OPRO-元提示优化.md)。
