---
title: "17 · OPRO：元提示冻着，深呼吸是搜出来的"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Yang 等把优化任务写成自然语言，让 LLM 对着历史分数出新指令。PaLM 2-L 评分、PaLM 2-L-IT 优化，GSM8K 零样本 80.2，对手写 Let’s think step by step 的 71.8。
  元提示冻着。不是式 (2)。不要和 ADAS 表的 30.6 横加。
tags:
  - RSI
  - OPRO
  - prompt-optimization
  - Harness
  - EvoPrompt
---

# 17 OPRO：元提示冻着，深呼吸是搜出来的

*Take a deep breath and work on this problem step-by-step.* 这句话不是人拍脑袋写的。Yang 等把它从一小份 GSM8K 训练子集里搜出来：优化器是指令微调的 PaLM 2-L-IT，评分器是预训练 PaLM 2-L，测试集零样本 **80.2**。同一只评分器上，Kojima 的 *Let’s think step by step* 是 **71.8**，空指令 **34.0**。摘要写相对人手写最多约 8 个点，对着这列。BBH 上相对人手写可以到「某一任务超过 50%」，那是 23 任务柱状图的高点，不是均分。

本篇是 Harness 里「LLM 当黑盒优化器」的样板。被搜的是任务指令 $P$。写出新 $P$ 的那份元提示——任务说明、格式约束、「请生成更高分的新指令」、最多保留 20 条历史、每步 8 个候选、3 条示范——人写完就冻着。优化器和评分器的权重也不动。跑完留下一条（或几条）指令，下次实验还是同一份元提示。**不是** RSI。**不是** 微调。一手：Yang, Wang, Lu, Liu, Le, Zhou, Chen，Google DeepMind，[arXiv:2309.03409](https://arxiv.org/abs/2309.03409)，ICLR 2024；代码 [google-deepmind/opro](https://github.com/google-deepmind/opro)。数字以 HTML Table 1 / Table 4 / Table 6、§5 为准。GPT 行是 `gpt-3.5-turbo-0613` / `gpt-4-0613`，不要拿后来的别名顶替主表。ADAS 表上 OPRO 数学 **30.6** 是 GPT-4 写、GPT-3.5 考、MGSM 协议，禁止和 80.2 收成一个数。

## 1. 问题：没有梯度，提示空间还 discrete

数值优化靠导数。提示是离散字符串，闭源 API 没有 $\partial L/\partial\theta$，软提示调参也走不通。APE 用模型生成候选再变异，三轮质量就稳住。APO 让模型对着旧指令写文字反馈再改。OPRO 换了一种调用：不要「改这一句」，把**整段优化轨迹**塞进元提示，让模型对着「谁几分」直接写新指令。作者先在线性回归和 TSP 上演示「只看历史分数也能走几步」，再把同一套架子接到提示搜索。主判定只认提示实验。回归和 TSP 证明模型能从轨迹里读出方向，不证明花园式递归。

$S$ 取当前被优化的任务指令 $P$。单轮 $S'=I(S)$ 可以发生：优化器写出新 $P$，评分器在训练子集上打分，高分的进轨迹。式 (2) 还要 $I'\subseteq S'$。元指令、每步 8 条、保留最好 20 条、3 条示范、3.5% 训练子集、优化器/评分器配对，下一场实验原样再走。混元台阶上这是薄 $H_t$：指令可以留下，改进器在墙外。轨迹在**这一次**优化里会变长，像 GEPA 的种群只活在当次预算里。交卷是最好的那条 $P$，不是一份会自己改元提示的新 $I$。

指令插在哪也是超参。预训练 PaLM 2-L 当评分器时，搜的是 $A_{\mathrm{begin}}$：指令接到「A:」开头，因为模型吃的是问答续写。指令微调的 text-bison 当评分器时，搜 $Q_{\mathrm{begin}}$ 或 $Q_{\mathrm{end}}$：指令接到问题前或问题后。同一句 *Let’s think step by step*，PaLM 2-L 上 71.8，text-bison 上 64.4。换位置、换骨干，基线自己先跳。海报 80.2 钉在 PaLM 2-L 评分器这一列。

![元提示里是历史分数加任务说明；优化器出 8 条新指令，评分器在训练子集上打分，再写回轨迹](./images/fig-opro-loop.png)

> 图 1：实线是新指令被评分、被写进轨迹。虚线是冻着的元指令在调用优化器。更新的是 $P$，不是元提示配方。

**图 1 解析**

- **元提示**：最好 20 条历史指令（升序）+ 3 条随机训练示范 + 人写的元指令。
- **优化器**：温度 1.0，每步调用 8 次，最多 8 条新指令。
- **评分器**：温度 0，贪心解码。GSM8K 用固定 3.5% 训练子集估分，测完整测试集。
- **停**：提不出更高分，或步数帽（提示优化默认 200）。
- **交卷**：测试集上最好的那条指令，不是最后一步的平均。

## 2. 机制：轨迹进上下文，配方不进种群

元提示两块。一块是优化问题的自然语言描述：目标是更高准确率，还可以加「指令要短、要通用」这种软约束。一块是轨迹：过去的指令和训练准确率，按分数**从低到高**排。作者赌近因：模型更吃提示尾部，把高分放最后，续写会往高分靠。消融把顺序改成降序或随机，终分和收敛都差一截。分数怎么写也有讲究。默认把准确率收成整数（100 桶）；改成 20 桶，或只按顺序贴指令不给分，优化器更认不清谁好。示范默认 3 条。改成 10 条不一定更好：元提示被题目正文占满，轨迹被挤到边上。去掉示范，模型甚至搞不清这是一道什么题。EvoPrompt 对照把这件事写得很白：不给示范、只给两条亲本做交叉变异，GSM8K 上从泛化起始句出发会掉，因为它缺少「这道题长什么样」。

每步出多条，是为了稳。轨迹里早期会有低分指令，上下文学习会被带偏。一次出 8 条，等于同时探几个方向。消融比 1 / 2 / 4 / 8 / 16：8 最好。再多，总预算固定时步数变少，历史信息变瘦。优化器温度 1.0，评分器 0。EvoPrompt 对照用他们论文的默认 0.5。温度不是同一套审美，曲线不要横加成「谁更会进化」。

和 APE、APO 的差写在相关工作里。APE 先生成一窝初始指令，再挑最高分的各自做语义相近变异——新句被要求还像旧句。APO 每步让模型写「旧指令该怎么改」的文字反馈，再编辑。OPRO 不要求模仿上一句，只要求更高分；输入不是一条旧指令，是带分数的一串。这就是「优化轨迹」这四个字的全部几何。它看起来像在线学习，配方仍是离线写死的。作者把「显式自然语言反馈写进下一步」列成未来工作，和 TextGrad 把「用 TextGrad 优化 TextGrad」写成未来工作是同一类诚实：他们知道 $I$ 可以更厚，主实验没做。

起始点。PaLM 2-L 当评分器、GSM8K 上默认从 *Let’s solve the problem* 出发，训练估分 60.5。text-bison 默认从空指令出发。消融换几个泛化起始句，终分差不大，风格还会收敛到「solve this problem」一类。BBH 默认空串。预训练 PaLM 2-L 自己当优化器时，作者给它 few-shot 格式，起点是空指令（训练 32.2）和 *The answer is*（33.3）；生出来的也是句子前缀，*Here you go:*、*Let’s do it:*。指令微调模型和基座预训练模型，搜到的字符串长得不像一类东西。GPT 优化器偏长说明文，PaLM 2-L-IT 偏短口号。80.2 那句短，74.5 那句长——更大的优化器不自动给出更高测试分。正文还写：零样本搜到的最好指令，接到 PaLM 2-L 上，可以摸到少样本思维链的量级。那是「指令搜到了触发方式」，不是优化器变成了会做数学的新模型。少样本 CoT 的示范仍在墙外，本篇主表是零样本。

线性回归和 TSP 不要写进判定，但要知道作者拿它们证明什么。回归：$w,b$ 一维，50 个点，解析式不写进元提示，只给最好 20 对历史和目标值，每步最多 8 个新点。真值离起始区域 $[10,20]^2$ 越远，步数和探索点数都涨。TSP：$n=10$ 五个实例，text-bison / gpt-3.5-turbo / gpt-4 都能摸到最优；$n=50$ 三个模型成功次数都是 0。黑盒优化器在小问题上能走，大组合问题上塌。提示空间不是 TSP。这些实验只说明「轨迹里的标量，模型有时读得懂」。

## 3. 数字：80.2 对的是同一只 PaLM 2-L 评分器

Table 4，GSM8K 测试集，零样本。先读评分器，再读优化器。

| 评分器 | 来源 / 优化器 | 位置 | 指令（缩） | 测试 |
|------|--------------|------|-----------|-----:|
| PaLM 2-L | Kojima 2022 | $A_{\mathrm{begin}}$ | *Let’s think step by step.* | 71.8 |
| PaLM 2-L | Zhou 2022b | $A_{\mathrm{begin}}$ | *Let’s work this out in a step by step way…* | 58.8 |
| PaLM 2-L | 手写 | $A_{\mathrm{begin}}$ | *Let’s solve the problem.* | 60.8 |
| PaLM 2-L | 空 | $A_{\mathrm{begin}}$ | （空） | 34.0 |
| PaLM 2-L | PaLM 2-L-IT | $A_{\mathrm{begin}}$ | *Take a deep breath and work on this problem step-by-step.* | **80.2** |
| PaLM 2-L | PaLM 2-L | $A_{\mathrm{begin}}$ | *Break this down.* | 79.9 |
| PaLM 2-L | gpt-3.5-turbo | $A_{\mathrm{begin}}$ | *A little bit of arithmetic and a logical approach…* | 78.5 |
| PaLM 2-L | gpt-4 | $A_{\mathrm{begin}}$ | *Let’s combine our numerical command and clear thinking…* | 74.5 |
| text-bison | Kojima | $Q_{\mathrm{begin}}$ | *Let’s think step by step.* | 64.4 |
| text-bison | Zhou | $Q_{\mathrm{begin}}$ | *Let’s work this out…* | 65.6 |
| text-bison | 空 | $Q_{\mathrm{begin}}$ | （空） | 56.8 |
| text-bison | PaLM 2-L-IT | $Q_{\mathrm{begin}}$ | *Let’s work together to solve math word problems!…* | 66.5 |
| text-bison | text-bison | $Q_{\mathrm{end}}$ | *Let’s work through this problem step-by-step:* | 68.5 |
| text-bison | gpt-3.5-turbo | $Q_{\mathrm{end}}$ | *Analyze the given information, break down the problem…* | 62.7 |

80.2 − 71.8 = 8.4。摘要「最多约 8%」对着人手写，不是对着空指令的 46 个点。text-bison 列上 PaLM 2-L-IT 只到 66.5，相对 Kojima 64.4 只有 2.1；text-bison 自己当优化器、指令放 $Q_{\mathrm{end}}$，68.5，相对 Zhou 的 65.6 也只高一点。海报句是 PaLM 2-L 评分器上的短指令。gpt-4 当优化器、PaLM 2-L 当评分器，74.5，低于 80.2。不要读成「更强优化器一定搜出更好指令」。GPT 句式长，PaLM 2-L-IT 句式短，风格跟家族走，分跟评分器走。

训练子集：GSM8K 7473 条训练里随机 **3.5%**，优化全程用同一份，中间步的「训练准确率」是这份子集上的近似。测的是全部 1319 条测试。默认 200 步。图 1(a) 从 *Let’s solve the problem*（训练估分 60.5）往上走：第 2 步 *Let’s think carefully…* 63.2，第 4 步 *Let’s break it down!* 71.3，第 5 步 *Let’s calculate our way to the solution!* 73.9，第 6 步 *Let’s do the math!* **78.2**。第 107 步才碰到 *Take a deep breath…*，训练估分 80.2。作者写：曲线往上跳，不一定是这一步发现了更好的单句，也可能是 8 条候选整体变好——往往发生在「已经发现过一句很好的、元提示逐渐丢掉差句」之后。要的如果只是一句能用的，第 6 步的 78.2 已经接近终表。200 步是上限，不是「必须跑满才算 OPRO」。

BBH：23 任务，每任务最多 250 例，**20%** 做优化、其余测试。PaLM 2-L 评分器上，相对 Kojima 超过 5 个点的有 **19/23**；相对空指令超过 5 个点的有 **20/23**。text-bison 评分器上两档都是 **15/23**。摘要「最多 50%」对着单任务柱，不是 23 任务均分。movie_recommendation 上 PaLM 2-L-IT 可以搜到一段按类型/剧情/评分往下写的长指令，测试 90.8；ruin_names 上可以搜到 *Which is the funniest pun on the artist or movie name?*，88.0。temporal_sequences 上预训练 PaLM 2-L 空指令训练已经 100，作者不在这列报它当评分器。语义相近、分数可以差一截：GSM8K 上 *Let’s think step by step* 71.8，*Let’s solve the problem together* 60.5，把两句拼成 *Let’s work together to solve this problem step by step* 掉到 **49.4**。这就是为什么每步要出 8 条，而不是编辑一句。

迁移。GSM8K 上搜到的指令拿到 MultiArith / AQuA 再测，不重新搜。PaLM 2-L 评分器、*Take a deep breath…*：MultiArith **95.3**、AQuA **54.3**；Kojima 是 85.7 / 44.9。text-bison 评分器、那条长的 *Let’s work together…*：MultiArith **96.8**、AQuA **37.8**；Kojima 是 92.5 / 31.9。域内迁移成立，不是换一套全新 $I$。过拟合：默认不另留验证集。作者后来切 1/3 训练、1/3 验证、1/3 测试，验证曲线跟着训练曲线上下。附录表上训练分常常比测试高 **5%–20%**。早停、加大训练子集，正文写成可能减轻，主实验没当默认。

![上排任务指令在换代；下排元指令、8/20/3、3.5% 子集、两只模型的权重冻着](./images/fig-opro-frozen.png)

> 图 2：实线更新 $P$。虚线是冻着的 $I$ 和 $\theta$。轨迹只活在当次优化里。

**图 2 解析**

- **会变**：任务指令 $P$；当次优化的分数轨迹。
- **冻 $\theta$**：优化器、评分器都不微调。
- **冻 $I$**：元指令、升序、整数分、3 条示范、每步 8 条、保留 20、子集比例、步数帽、插槽位置。指令插在 $A_{\mathrm{begin}}$ 还是 $Q_{\mathrm{begin}}$，下一场实验也不改。
- **门**：训练子集准确率。测试集不当学习信号。

## 4. 自我优化不是式 (2)

轨迹进元提示，看起来像优化器在用自己的历史。花园还要问零阶。谁规定怎么写新指令？人写的元指令。谁规定每步几条、留几条、示范围几条？超参。谁当评分器？另一只（或同一只）冻着的模型。这些下一场实验原样再走。作者自己把「用错误样本推断该往哪改」写成局限：试过把错题塞进元提示，结果差不多，说明聚合准确率不够当因果解释。那正是 GEPA 后来用轨迹文本当 $\mu_f$ 要补的那一层——OPRO 主实验没有补。结论还列了初始点敏感、探索与利用难平衡。这些句子把「已经通用优化器」挡在门外。

优化器和评分器可以是同一家族，也可以拆开。图 4(b) 预训练 PaLM 2-L 自己优化自己，分数能涨。不要听成权重在改。评分器贪心解码，优化器温度 1.0 采样，两套解码，同一份冻着的 $\theta$。拆开时常见的是更强或指令微调的模型当优化器、另一只当评分器，和 TextGrad 用 gpt-4o 改 3.5-turbo 提示是同一类账单：付一笔搜索成本，以后用评分器那只模型推理。留下的仍是指令，不是新优化器。

和 [Promptbreeder](../16-Promptbreeder-自我指涉提示进化/16-Promptbreeder-自我指涉提示进化.md) 钉死。那边变异提示 $M$ 进种群，超变异 $H$ 仍冻着；这边连 $M$ 都没有，只有一条冻着的复杂元提示。GSM8K 上 Promptbreeder 报 OPRO **80.2**、自己 **83.9**，同一只 PaLM 2-L 零样本。OPRO 用固定 3.5% 子集；Promptbreeder 每场从训练集随机抽 100 题。适应度通道不同，83.9 对 80.2 可以并排写，不要收成「遗传一定打赢轨迹」。Promptbreeder 预实验说模型读不懂适应度数字，所以 EDA 不给分；OPRO 消融说**给分更好**。两套审美，骨干和元提示都不同，禁止用一家打另一家的脸。和 [GEPA](../15-GEPA-遗传Pareto提示/15-GEPA-遗传Pareto提示.md) 钉死：GEPA 用反思轨迹改模块 $\pi$，元提示冻着；OPRO 用标量分改一条指令，元提示也冻着。GEPA 有 minibatch 门和 Pareto；OPRO 把新指令都记进轨迹，靠「只保留最好 20」做筛选。和 [TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md) 钉死：那边反向传的是句子梯度，这边正向看的是历史分。和 [ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md) 钉死：OPRO 交一句短指令，ACE 交一本带编号的书。深呼吸够用的地方，是算术词题；AppWorld 的工具坑不是这场适应度。和 [ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) 钉死：ADAS Table 1 的 OPRO 是 GPT-4 写、GPT-3.5 考，MGSM **30.6 ± 3.2**，低于手写 Debate **39.0**。那一行证明「只搜提示、控制流锁死」在他们的数学协议上不够；不能拿去改 ICLR 主表的 80.2。和 EvoPrompt 钉死：EvoPrompt 冻交叉/变异提示，还要人手写任务相关的初始句。OPRO 用轨迹加示范，泛化起始句也能涨。图 12 在 GSM8K 上 EvoPrompt 两变体从 *Let’s solve the problem.* / *Here is the answer.* 出发会掉。BBH sports_understanding 换上任务相关起始句，DE 变体能涨，曲线仍不如 OPRO 稳。和 Self-Refine 钉死：那边本题内改 $y$，跨题清空；这边在子集上搜 $P$，测试时留下。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？任务指令。权重动了没有？没有。80.2 能不能当 RSI？不能。还缺什么？元指令或评分协议进入 $S'$，并且下一轮优化器就是升级后的那份。作者把更富的错题反馈、更小的训练集写成还没做。

## 5. 深呼吸和 ADAS 的 30.6 不要收成一件事

深呼吸赢，是 PaLM 2-L 评分器对短指令敏感。同一优化器在 text-bison 上交出长协作句，测试只有 66.5。Promptbreeder 可以找到 *SOLUTION*。三句话都说明措辞敏感，不说明优化器理解了数学。适应度是训练子集上的对错。短指令赢，和 GEPA Observation 4、ACE 的 brevity bias 仍是同一根针：词题够用，工具坑不够。text-bison 列上 gpt-3.5-turbo 优化器 62.7，已经低于 Kojima 的 64.4：搜完可以比人手写差。主表不是单调涨。

消融里「分数怎么呈现」和 Promptbreeder 的 EDA 对照着读。OPRO 默认把准确率收成整数再给优化器，去掉分数会伤；Promptbreeder 预实验说模型读不懂这些分，所以 EDA 列表不写数字。两篇都是 2023 年前后的 DeepMind 提示进化，审美相反。读花园的人如果只记「LLM 当优化器」，会以为大家都把标量塞进上下文。本篇塞了，邻居故意不塞。差别写在元提示，不写在口号。

ADAS 的 30.6 不是 OPRO 论文的数。那边下游是 GPT-3.5，任务是 MGSM，搜索空间被作者拿来当「只动提示」的反例。本篇评分器是 PaLM 2-L 或 text-bison，任务是 GSM8K / BBH。两套协议、两只模型、两个分母。花园两处都留着，禁止用一处覆盖另一处。Promptbreeder 主表转引 80.2 时，用的是本篇 PaLM 行，不是 ADAS 行。

回归和 TSP 容易被通稿写成「LLM 已经是通用优化器」。正文写的是小规模：回归真值一远就慢，TSP $n=50$ 摸不到最优。提示优化的成功，绑在「评分器已经会做这道题、指令只是触发方式」上。GPQA 那种知识瓶颈，ADAS 已经用 OPRO 32.9 对 Self-Refine 31.6 演示过：话术救不了不会的题。本篇主表没有 GPQA。不要把 80.2 外推到研究生科学问答。代码在 github.com/google-deepmind/opro，复现声明写明 text-bison 走 Vertex，GPT 用 0613 快照。花园判定停在 HTML 主表，不跟仓库后来的 notebook 数字走。

**读**：元提示两块、每步 8 / 留 20 / 示范 3、GSM8K 3.5% 子集、BBH 20%、Table 4 的 80.2 对 71.8、text-bison 列的 68.5 / 66.5、gpt-4 优化器 74.5、第 6 步训练 78.2 对第 107 步、BBH 19/23 与 15/23、迁移 95.3 / 54.3、过拟合训练比测试高 5%–20%、拼句掉到 49.4、ADAS 30.6 另一张表、元提示冻着。  
**不读**：把 80.2 听成式 (2)、用空指令 34.0 给 80.2 造 46 个点的海报、用 ADAS 的 30.6 替换 80.2、用训练估分 78.2 冒充测试 80.2、用 BBH 单任务 50% 当 23 任务均分、说 gpt-4 优化器一定高于 PaLM 2-L-IT、说已经在改优化算法。

同层：[20 MIPROv2](../20-MIPROv2-贝叶斯联合优化/20-MIPROv2-贝叶斯联合优化.md)、[19 APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md)、[16 Promptbreeder](../16-Promptbreeder-自我指涉提示进化/16-Promptbreeder-自我指涉提示进化.md)、[15 GEPA](../15-GEPA-遗传Pareto提示/15-GEPA-遗传Pareto提示.md)、[14 TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md)、[18 EvoPrompt](../18-EvoPrompt-进化算子提示/18-EvoPrompt-进化算子提示.md)、[07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)、[09 ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)、[44 GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)。综述：[05](../../1-坐标系与术语/05-自进化Agent综述/05-自进化Agent综述.md)。

## 参考文献

1. Yang, C., Wang, X., Lu, Y., Liu, H., Le, Q. V., Zhou, D., & Chen, X. (2024). [Large Language Models as Optimizers](https://arxiv.org/abs/2309.03409). ICLR 2024. arXiv:2309.03409.
2. Fernando et al. (2024). [Promptbreeder](https://arxiv.org/abs/2309.16797). GSM8K 上转引本篇 80.2。
3. 本花园：[Promptbreeder](../16-Promptbreeder-自我指涉提示进化/16-Promptbreeder-自我指涉提示进化.md)；[ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)。
