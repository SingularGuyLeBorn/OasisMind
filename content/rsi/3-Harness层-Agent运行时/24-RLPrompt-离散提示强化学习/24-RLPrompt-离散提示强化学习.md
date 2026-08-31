---
title: "24 · RLPrompt：乱码提示交卷，策略网络扔掉"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Deng 等把离散提示当成 RL 动作串，冻任务 LM，只训一只 MLP。RoBERTa-large 少样本 5 token
  SST-2 92.5、Yelp P. 95.1。TEMPERA 表上的 90.1 是邻居复现，不要横加。不是式 (2)。
tags:
  - RSI
  - RLPrompt
  - prompt-optimization
  - Harness
  - discrete-prompt
---

# 24 RLPrompt：乱码提示交卷，策略网络扔掉

[GrIPS](../22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md) 在人写说明书上爬山。[TEMPERA](../23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md) 把同类手术交给按查询的 PPO，还要 RoBERTa 隐状态。RLPrompt 反过来：不给人初稿，从词表一个 token 一个 token **生成**离散提示 \(z\in\mathcal{V}^T\)。任务模型冻着当黑盒环境，可走 API。策略是冻住的 distilGPT-2 上面加一层可训 MLP。训完把 MLP 扔掉，交卷只剩那串字。RoBERTa-large、每类 16 条，5 token 行 SST-2 **92.5 (0.8)**，Yelp P. **95.1 (1.0)**，七套均 **75.8**。TEMPERA Table 2 里的 RLPrompt 列是 SST-2 **90.1**、Yelp **93.9**，贴着本篇 **2 token** 行（90.3 / 94.1），**不是** 5 token 主行。禁止用 90.1 改 92.5。

本篇是 Harness 里「生成派接到 RL、默认查询无关」的样板。APE 从示范整段提案，默认不迭代；这边用奖励逐步出 token，训练采样、推理贪心，得到确定字符串。分类共用一条提示；风格迁移才把策略写成 \(\pi(z\mid x)\)。**不是** RSI。**不是** 软提示。**不是** PPO。一手：Deng, Wang, Hsieh, Wang, Guo, Shu, Song, Xing, Hu，CMU / UC San Diego / MIT，[arXiv:2205.12548](https://arxiv.org/abs/2205.12548)，EMNLP 2022（ACL Anthology `2022.emnlp-main.222`，pp. 3369–3391）；代码 [mingkaid/rl-prompt](https://github.com/mingkaid/rl-prompt)。Wang 与 Hsieh 并列一作。数字以 HTML Table 2–6、附录 Table 8、Figure 4、§2.3–2.4、§6 为准。主分类骨干 RoBERTa-large。策略网络一律 distilGPT-2（82M）加一层 2048 隐状态的 MLP，多 3.1M 参数，约 3.8%。RL 算法是 Guo 等 2021 的 soft Q-learning，**只用 on-policy 那一半**。仓库 README 另一套超参不要写进正文。

## 1. 问题：离散提示搜不动，软提示又对不回词表

少样本分类和可控生成都想冻住大模型，只换前面那截字。软提示好训：向量能梯度。坏处也硬：人读不懂、换一只 LM 对不上隐空间、API 不给梯度。离散提示是词表里的 token，能给人看、能跨模型粘贴。搜索空间却是 \(\mathcal{O}(|\mathcal{V}|^T)\)。前人两条路：释义或枚举再挑（Jiang、Gao、GrIPS），或者用梯度近似改 token（AutoPrompt）。前者不系统，后者仍要内部状态，训练还不稳。

作者把找 \(z\) 写成奖励最大化：

$$
\max_{z\in\mathcal{V}^{T}} R\bigl(y_{\mathrm{LM}}(z,x)\bigr)
\tag{1}
$$

\(y_{\mathrm{LM}}\) 是冻着的任务模型在提示 \(z\) 下的输出。分类时 \(y\) 是掩码位置上的 verbalizer；生成时 \(y\) 是续写。式 (1) 对 \(z\) 没有梯度。补丁是把 \(z\) 收成策略逐步吐出的动作：

$$
\hat{z}\sim\prod_{t=1}^{T}\pi_{\theta}(z_{t}\mid z_{<t}),\qquad \max_{\theta} R\bigl(y_{\mathrm{LM}}(\hat{z},x)\bigr)
\tag{2}
$$

训练从 \(\pi\) 采样探空间。训完推理贪心，得到一条确定提示。任务 LM 只当环境，不回传梯度。作者把 GPT-3 一类只暴露推理接口的模型写进适用面。局限节老实写：主实验没有跑 GPT-3。花园把「可 API」读成接口形状，不读成本篇已经在 davinci 上拿到 92.5。

\(S\) 取当前那条离散提示，外加训练期那只 MLP。单轮 \(S'=I(S)\) 可以发生：SQL 更新 MLP，采样出新的 \(z\)。术语式 (2) 还要 \(I'\subseteq S'\)。SQL 配方、分段奖励、\(z\)-score、占位词 `classification`、\(T\in\{2,5\}\)，下一场 SST-2 原样再走。混元台阶上，跨题留下的是搜完的字符串，不是改进器。MLP 训完即丢，连薄 \(H_t\) 里那块可训模块都不交卷。

![策略吐 token，冻任务 LM 打分，SQL 只更新 MLP](./images/fig-rlprompt-loop.png)

> 图 1：实线是提示被生成、打分、用来更新 MLP。虚线在冻结图。任务模型权重不动。

**图 1 解析**

- **policy MLP**：插在冻住的 distilGPT-2 上。策略 LM 不必等于任务 LM。分类时网络输入只是占位词 `classification`，所以提示跟查询无关。
- **discrete \(z\)**：长度 \(T\) 的离散串。训练采样，测试贪心。
- **frozen task LM**：分类用 RoBERTa-large 填掩码；风格迁移用 GPT-2 系列续写。只出奖励，不更新。
- **SQL reward**：奖励先做 \(z\)-score 或分段，再走 on-policy SQL 更新 MLP。

## 2. 机制：小 MLP 探词表，奖励要先削尖再分段

策略网络不另训一只生成器。冻 compact LM 抽 \(\hat{z}_{<t}\) 的上下文向量，MLP 改一改，再送回原 LM head 出下一个 token 的分布。梯度穿过策略 LM 回到 MLP。附录 A.1：隐层 2048，相对 distilGPT-2 的 768 维只加 3.1M。作者写「generous」，意思是 MLP 够宽，不是说策略 LM 也在训。训完丢 MLP，推理只拿离散串，不再经过那只网络。

RL 算法可以换。作者试过常见策略梯度，初步实验里 SQL 更稳，正文只用 Guo 等实现的 on-policy 半边，off-policy 那半丢掉。这是 \(I\) 的算法选型，不是任务模型在改自己的优化器。训练探空间用 top-256 采样；推理贪心，得到确定串。

奖励不稳定。任务 LM 是黑盒，中间还要拼输入、推断输出，尺度随样本变。风格迁移尤其明显：有的句子改几个词就换情感，有的句子怎么改都难，同一套 \(R\) 会把训练拧偏。作者用两条工程补丁。分类附录也把奖励乘 5，再按提示做 \(z\)-score，不是只有风格迁移才标准化。

按输入做 \(z\)-score。每个 \(x\) 先采一批提示 \(Z(x)\)，在这批内部减均值除标准差：

$$
z\text{-score}(z,x)=\frac{R_{x}(z)-\mathrm{mean}_{z'\in Z(x)}R_{x}(z')}{\mathrm{stdev}_{z'\in Z(x)}R_{x}(z')}
\tag{3}
$$

风格迁移还要把 \(\pi\) 写成 \(\pi_{\theta}(z\mid x)\)，否则同一 batch 里不同句子的标准化分数对不上。消融 Figure 3 / 6：去掉 \(z\)-score，原超参下训练容易塌；他们后来把奖励从 \([50,100]\) 搬到 \([-50,50]\) 才稳住，仍不如带 \(z\)-score 的主设定。分类附录的 \(z\)-score 是**跨提示**，不是按句：占位词固定，一条 \(z\) 伺候整场少样本，标准化发生在同一输入下的提示批里。两处都叫 \(z\)-score，分母不是同一批数。

分段奖励挡对抗提示。只用金标类概率当 \(R\)，策略可能找到 Wallace 那种触发串：任意输入都把某一类推到极高。作者改成间隔：

$$
\mathrm{Gap}_{z}(c)=P_{z}(c)-\max_{c'\neq c}P_{z}(c'),\qquad \mathrm{Correct}=\mathbb{1}[\mathrm{Gap}_{z}(c)>0]
$$

$$
R(x,c)=\lambda_{1}^{1-\mathrm{Correct}}\lambda_{2}^{\mathrm{Correct}}\mathrm{Gap}_{z}(c)
\tag{4}
$$

判对时乘大系数，判错时乘小系数。附录 \(\lambda_{1}=180\)，\(\lambda_{2}=200\)，在验证集上调。奖励在训练例子上平均。另把所有奖励乘 5，拉开好提示和差提示的差距。这套 \(\lambda\) 和乘子是 \(I\) 的旋钮，不是模型自己改的。TEMPERA 的逐步奖励是相邻两步分数差，\(\lambda_{1}=2.0\)、\(\lambda_{2}=1.8\)，家族像、刻度不是一回事，禁止把 180 写进那篇。分段本身有消融：附录 Figure 5 用 distilRoBERTa-base、5 token，在 SST-2 和 AG’s News 上拿掉分段，换种子更容易训出弱提示，均线更散。花园只把这条读成「间隔奖励让少样本 RL 少塌」，不把它加成 Table 2 的 92.5。

分类模板跟人手写提示对齐：`[Input] [Prompt] [MASK]`，verbalizer 默认 terrible / great 这一对。提示插在人手模板的同一位置。作者知道加长、多位置插入往往更好，主表只跑 \(T\in\{2,5\}\)，其余留给未来。风格迁移 \(T=5\) 钉死。输出侧所有对照都采 32 个候选，再按奖励挑一条。32 是解码预算，不是提示长度。

训练细节钉在附录，不要听成读者可调的产品旋钮。分类：Adam \(5\times 10^{-5}\)，每步 16 条提示，2 token 训 6k step，5 token 训 12k step，每 10 step 看一次验证。评估把验证准确率最高的 **3** 条提示平均。少样本不稳，所以抽 **5** 套训练/验证划分，每套再跑 **3** 个种子，报均分和标准差。一块 RTX 3090 上，distilRoBERTa-base 大约 1.5 小时，RoBERTa-large 大约 4 小时。Fine-Tuning 对照是整只 RoBERTa 训 100 epoch，学习率 \(1\times 10^{-5}\)，动的是 \(\theta\)，和主方法不是同一层。Black-Box Tuning 的 mixed 设定跟论文默认：50 个软 token、预算 8000。AutoPrompt 用 5 个提示 token，在少样本训练例子上搜。GrIPS 被放进 Discrete Prompt Enumeration 那一行，骨干换成 RoBERTa-large 少样本，**不是** Prasad 那篇 InstructGPT、Natural-Instructions、Table 1 的 +4.29。

![上排离散 z 被搜出并保留；下排任务 LM、策略 LM、SQL 和奖励公式冻着](./images/fig-rlprompt-frozen.png)

> 图 2：实线更新训练期的 MLP 和搜出来的 \(z\)。虚线是冻着的 \(\theta\)、distilGPT-2、SQL 和分段公式。测试只留贪心得到的字符串。

**图 2 解析**

- **会变（训练期）**：MLP 参数；采样得到的 \(z\)。
- **会变（交卷）**：一条（分类）或每题一条（风格迁移）离散提示。MLP 不交卷。
- **冻任务 \(\theta\)**：RoBERTa-large / GPT-2 不微调。对照里的 Fine-Tuning、DiRR 才动全模型。
- **冻策略 LM**：distilGPT-2 的权重不动，只当特征器。
- **冻 \(I\)**：SQL on-policy、式 (3)(4)、\(\lambda\)、占位词、\(T\)、验证集挑 3 条的协议。

## 3. 数字：92.5 是本篇 5 token，90.1 是邻居表上的 RLPrompt

Table 2 是主表。少样本分类，RoBERTa-large，每类 16 训练、16 验证。RLPrompt 5 token：SST-2 **92.5 (0.8)**，Yelp P. **95.1 (1.0)**，MR **87.1 (0.4)**，CR **89.5 (0.6)**，SST-5 **41.4 (3.2)**，Yelp **44.8 (4.3)**，AG’s News **80.2 (0.7)**，均 **75.8**。2 token：90.3 / 94.1 / 86.5 / 87.4 / 40.1 / 45.6 / 76.8，均 **74.4**。作者写：相对 Manual 和 Instructions，5 token 行七套全赢；相对 In-Context Demonstration 只输 1 套；相对 Fine-Tuning 输 2 套。输的是 AG’s News（微调 84.9 对 80.2）和五类 Yelp（51.0 对 44.8）。SST-5 上 41.4 对微调 40.7，只高 0.7，括号 3.2，不要读成稳赢。Yelp P. 95.1 对微调 88.7，这才是拉开的列。

软提示和黑盒对照。Prompt Tuning 均 69.2，SST-2 标准差 10.9，MR 14.6，散。BB Tuning 2 / 5 软 token 均 69.2 / 67.1。mixed、50 软 token 均 **74.7**，略低于 5 token 的 75.8，高于 2 token 的 74.4。作者写成「substantially outperforms BB Tuning with soft prompts, and is slightly better even after mixed」。花园把 75.8 对 74.7 读成略好，不读成碾压。GrIPS 同表均 **69.4**，SST-2 87.1，AG’s News 65.4 (9.8)。AutoPrompt 均 56.7，CR 57.5 (5.8)。人手 Instructions 均 58.5，AG’s News 掉到 54.8；Manual 均 68.6。In-Context 均 72.2，Yelp P. 已到 89.6。主方法的卖点不是「示范无效」，是冻 \(\theta\) 的离散串在多数二分类上高于微调。

附录 Table 8 把「多数赢微调」收住。Subj / TREC / Yahoo / DBPedia，5 token：81.2 / 57.6 / 48.6 / 84.6，均 68.0。Fine-Tuning：89.0 / 83.9 / **65.6** / **97.7**，均 **84.1**。Yahoo 10 类、DBPedia 14 类，训练条数是 \(16\times|C|\)，256 和 224，不是 SST-2 那种 32。作者自己写：多类、训练例子变多时，更新全部参数的微调平均更高；本方法仍高于提示对照。GrIPS 在 TREC 上 9.5，Yahoo 22.5，DBPedia 22.1，这张 RoBERTa 少样本复现里短语枚举塌了。不要拿 9.5 去改 Prasad 主表。2 token 在 Subj 上 81.9，略高于 5 token 的 81.2；DBPedia 反过来，5 token 84.6 对 2 token 76.0。长度不是单调的旋钮。

Verbalizer Table 6，SST-2，3 个种子。terrible/great：RLPrompt **92.8** 对 Manual 82.8。bad/good：91.2 对 79.7。negative/positive：92.2 对 76.8。人手模板换标签词会掉一截，本方法三条都在 91–93。主表 92.5 用的是默认 terrible/great，和 92.8 不是同一格：一个 5 套划分 × 3 种子，一个只为 verbalizer 另跑 3 种子。花园并列写，不手工对齐。AG’s News 的标签词消融在附录 Table 11，2 token。World / Sports / Business / Tech：RLPrompt **77.6 (1.5)** 对 Manual 76.9。换成 Global / Athletics / Finance / Technology：65.3 对 63.5，两边一起掉十几个点。标签词换了，生成派仍略高于人手，但 65.3 说明 verbalizer 不是无关旋钮。77.6 是 2 token，主表 5 token 的 80.2 不要收成同一格。附录还列了「强词」：情感侧常出现 Absolutely / Totally / downright，新闻侧出现 News / Reports / Staff。RoBERTa-large 上乱码 *imentariesariesaryary* 也能到约 80%。把强词随便拼回去，分数对词序和大小写敏感，AbsolutelyAbsolutely 在 GPT-2-large 上会掉。离散可打印，不等于组合语义稳定。

[TEMPERA](../23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md) Table 2 的 RLPrompt 列：SST-2 90.1、Yelp P. 93.9、MR 86.7、CR 87.2、AG News 77.2。和本篇 2 token 行（90.3 / 94.1 / 86.5 / 87.4 / 76.8）一张纸上能对上，和 5 token 主行对不上。Zhang 等用 4 个种子，本篇 5×3。骨干都是 RoBERTa-large、每类 16，仍是两场复现。TEMPERA 在 SST-2 上 91.9 对邻居的 90.1（+1.8）；对本篇 5 token 的 92.5，编辑派并没有赢。Yelp P. 上邻居表 93.9 对 TEMPERA 92.6，本篇 5 token 更是 95.1。情感短句这条，生成派的查询无关提示够用，不一定要按题编辑。CR、AG News 上 TEMPERA 更高（91.1 / 85.5 对邻居 87.2 / 77.2，对本篇 5 token 89.5 / 80.2 也高）。两篇各赢各的列，禁止收成「RL 编辑全面超过 RL 生成」。

## 4. 风格迁移：乱码更好，小模型的串还能贴到大模型上

Yelp 情感迁移，无配对数据。奖励是内容保持加目标风格强度，论文式 (5)，没有流畅项。流畅另用分类器在评估里乘进 \(J\)。主指标 \(J\) 是句级 Content × Style × Fluency 的测试集均值，协议跟 Krishna 等 2020。Table 3，GPT-2-xl：RLPrompt Content 72.1、Style 94.2、Fluency 89.5，**\(J=61.4\)**，GM **84.7**。DiRR 微调 GPT-2，\(J=59.6\)，GM 83.5。Style Transformer \(J=46.1\)。人手模板 \(J=53.4\) (7.9)，方差大。Null / Random 掉到 33.6 / 34.7。从 distilGPT-2 到 xl，\(J\) 单调：46.0 → 50.7 → 56.1 → 56.5 → 61.4。人评 Table 4，100 条、5 个标注员、5 点量表：DiRR GM **4.72**，本方法 **4.63**，Manual **4.49**。自动指标上本方法略高，人评上 DiRR 更高。作者写成 competitive。不要用 61.4 去改 4.63。评测集是 Li 等收集的每边 500 条，不是 Yelp 全量测试。人评 Fleiss \(\kappa=0.35\)，作者写成 fair，和 Mir 等前人一个量级。附录 Table 10 另报 BLEU / BERTScore / PPL：GPT-2-xl BLEU **24.2**，DiRR 30.0，内容对齐自动指标上微调仍高一截；PPL 34.3 对 DiRR 40.6，流畅那边提示派更好。\(J\) 把三项乘在句级，才会出现「内容略低、流畅补回来、联合分略高」。

莎士比亚作者迁移在附录 Table 9，每边 **100** 条，GPT-2-xl。RLPrompt \(J=\) **26.7 (1.3)**，GM 66.0。全文训练的 STRAP \(J=30.3\)，Deep Latent 17.8，人手模板 22.2。作者写「胜过或接近全数据训练基线」：胜过 Deep Latent，接近 STRAP，没有超过 30.3。STRAP 还受风格种类限制；本方法声称奖励可换风格。少样本方差低于人手模板。对照里的 STRAP / DiRR 动 GPT-2 权重，和冻 \(\theta\) 只搜 \(z\) 不是同一层。风格迁移训练另有一套：每输入采 4 条提示、logit 偏置 \(-10\)、奖励从 \([0,1]\) 搬到 \([-20,80]\)，3090 上 distilGPT-2 约 10 小时、xl 约 1 天。这些是 \(I\) 的算力账，不要写进分类 4 小时那一行。

乱码是机制，不是事故。情感迁移学到的一条是 *Parameters Comparison )=( Compare either*。Table 5 给策略加流畅约束：提示在 GPT-2 下的 PPL 从 **254K (238K)** 降到 **82.1 (2.4)**，流畅例子变成 *I love my life (*。\(J\) 从 61.4 **掉到 46.7**。人读得通的串，任务更差。Table 1 仍给本方法的 Interpretability 打勾，依据是「离散 token、能给人看」，不是「人看得懂在说什么」。GrIPS 也出现过人读不通、分数仍涨。两边都不要把可读性写成 RSI 证书。Webson 和 Pavlick 的观察在这里被当成解释：模型用提示的方式和人读说明书不是同一套语法。

跨模型迁移 Figure 4，2 token 情感分类热图。列是学提示的模型，行是拿去分类的模型。乱码串仍能保住可观准确率。小模型上学的提示贴到大模型上，常常持平或更好，例如 RoBERTa-base 到 large。大模型上学的提示贴到小模型上，掉得狠：大模型激活的结构，小模型里不一定有。RoBERTa（掩码）和 GPT-2（从左到右）之间也能迁，作者读成两族预训练摸到了共享的提示结构。风格迁移附录 Figure 7 同一形状。设想是：小模型上便宜搜一条，大模型上直接用。主实验没有把这条串接到 GPT-3，局限节把这件事和「没看秘密语言的规律」一起写成未来工作。

## 5. 生成派 RL 不是术语式 (2)

听成「模型用强化学习改自己怎么说话」差在主语。改提示的是外面那只 MLP 策略。谁规定长度 \(T\)？人。谁规定分段 \(\lambda\) 和 \(z\)-score？人。谁规定 SQL 而不是 PPO？人。谁规定分类用占位词、风格迁移才条件于 \(x\)？人。训完 MLP 丢掉，下一场任务不会因为这条乱码好用就升级搜索器。留下的是 \(H_t\) 里一条（或每题一条）离散串。SQL 配方原样再走。

和 [TEMPERA](../23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md) 钉死。那边编辑人写初稿、PPO、要隐状态、测试时按查询改 \(T=8\) 步、题做完扔 \(p_T\)。这边从词表生成、SQL、任务 LM 可黑盒、分类查询无关、交卷留字符串。邻居表上的 90.1 对 91.9，不要改本篇 92.5。和 [GrIPS](../22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md) 钉死。那边人写说明书、四种短语手术、贪心、InstructGPT 上 +4.29；这边无初稿、常是乱码、RoBERTa 少样本均 75.8 对同表 GrIPS 69.4。同表 GrIPS 不能回写 Prasad。和 [APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md) 钉死：APE 用大模型整段提案，默认不迭代，骨干 InstructGPT，GSM8K 43.0 和本篇 RoBERTa 分类不是一列。和 [OPRO](../17-OPRO-元提示优化/17-OPRO-元提示优化.md)、[EvoPrompt](../18-EvoPrompt-进化算子提示/18-EvoPrompt-进化算子提示.md) 钉死：历史分数进元提示、GA/DE 说明书冻着，都不是逐步 RL 出 token。和 [ProTeGi](../21-ProTeGi-文本梯度束搜索/21-ProTeGi-文本梯度束搜索.md) 钉死：那边错题进批评模板；这边没有「哪里错了」的句子，只有间隔和 SQL。和 [Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) 钉死：那边改本题答案 \(y\)，跨题清空；这边改 \(z\)，分类测试集共用。AutoPrompt 要梯度改离散 token，本篇故意绕开。Black-Box Tuning 混软硬提示，主表 74.7 是最近的连续侧对手，仍略低于 5 token 行。Figure 2 把测试准确率对训练步画在一起：本方法收敛步数和 BB Tuning 相近，收敛后最差的那些提示，均分仍贴着 BB Tuning。作者拿来挡「RL 更慢」。梯度免费、步数相当，赢在终点略高，不赢在更少的黑盒查询。查询预算两篇没有钉成同一列。

风格迁移的 32 候选是测试解码，不是测试时还在更新 \(\pi\)。分类验证集每 10 step 看一次、最后平均 3 条，是早停和集成协议，配方仍冻着。奖励乘 5、top-256 采样，附录写成训练技巧。没有超参搜索贯穿主表：\(\lambda\) 在验证集调过一次，之后沿用。作者把 inverse RL 写成以后可以少用手调奖励，主实验没做。Ethics 节只提醒预训练模型可被用来写有害内容，希望提示技术也能反向控住；没有安全评测表，花园不把它读成对齐结果。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？离散提示字符串，外加一只训完即丢的 MLP。RoBERTa / GPT-2 动了没有？主方法没有。92.5 能不能当 RSI？不能。还缺什么？策略网络或 SQL 配方进入 \(S'\)，并且下一轮生成器就是升级后的那份。乱码能跨模型用，只说明离散串比软向量好搬，不说明改进器进了系统。主实验没有 GPT-3，把「API 也能搜」听成已经在 175B 上复现，是把引言适用面当成了表。Table 1 的 Interpretability 勾和 Table 5 的 254K PPL 同时成立：能打印成词，不必能当人话。

**读**：生成离散 \(z\)、冻任务 LM、MLP 3.1M 训完即丢、SQL on-policy、式 (3)(4)、\(\lambda_1=180\)、每类 16、5×3 种子、Table 2 的 92.5/95.1/75.8、2 token 90.3、微调在 AG’s News 和多类上更高、\(J=61.4\) 对 DiRR 59.6、人评 DiRR 更高、流畅约束 \(J\) 掉到 46.7、乱码可迁移、无 GPT-3 表、不是术语式 (2)。  
**不读**：用 TEMPERA 的 90.1 替换 92.5、用 95.1 改 Zhang 等的 93.9、用 75.8 改 Prasad 的 +4.29、说七套全赢微调、把 254K PPL 的串读成可解释指令、把跨模型迁移听成改进器升级、把「可 API」听成已经跑过 GPT-3。

同层：[23 TEMPERA](../23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md)、[22 GrIPS](../22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md)、[19 APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md)、[21 ProTeGi](../21-ProTeGi-文本梯度束搜索/21-ProTeGi-文本梯度束搜索.md)、[17 OPRO](../17-OPRO-元提示优化/17-OPRO-元提示优化.md)、[18 EvoPrompt](../18-EvoPrompt-进化算子提示/18-EvoPrompt-进化算子提示.md)、[12 Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)。综述里的生成派：[05](../../1-坐标系与术语/05-自进化Agent综述/05-自进化Agent综述.md)。

## 参考文献

1. Deng, M., Wang, J., Hsieh, C.-P., Wang, Y., Guo, H., Shu, T., Song, M., Xing, E. P., & Hu, Z. (2022). [RLPrompt: Optimizing Discrete Text Prompts with Reinforcement Learning](https://arxiv.org/abs/2205.12548). EMNLP 2022. arXiv:2205.12548.
2. 代码：[mingkaid/rl-prompt](https://github.com/mingkaid/rl-prompt)。
3. Guo et al. (2021). Text generation with efficient (soft) Q-learning. SQL 的 on-policy 组件。
4. 本花园：[TEMPERA](../23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md)；[GrIPS](../22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md)；[APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md)。
