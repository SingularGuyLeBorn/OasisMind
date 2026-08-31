---
title: "25 · AutoPrompt：触发词靠梯度搜，模型冻着"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Shin 等用 HotFlip 式梯度搜一组共用触发词。RoBERTa-large 全量 SST-2 测试 91.4，LAMA P@1 43.3 对 LPAQA 34.1。
  要白盒梯度。不是少样本那张邻居表上的 57.5。不是术语式 (2)。
tags:
  - RSI
  - AutoPrompt
  - prompt-optimization
  - Harness
  - discrete-prompt
---

# 25 AutoPrompt：触发词靠梯度搜，模型冻着

[RLPrompt](../24-RLPrompt-离散提示强化学习/24-RLPrompt-离散提示强化学习.md) 从词表生成离散串，任务模型当黑盒。[GrIPS](../22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md) 在人写说明书上爬山，也不要梯度。AutoPrompt 更早、更白盒：模板槽位里塞一组**所有输入共用**的触发词，用输入嵌入对对数似然的梯度近似换 token。RoBERTa-large 冻着，SST-2 测试集 **91.4**（人手模板 85.2）。LAMA 事实上 BERT 7 个触发词 P@1 **43.34**，对 LPAQA 单提示 **34.10**。摘要写成 91% 和 43.3%，花园钉表。**不是** 16 条/类少样本：本篇用 SST-2 标准全量划分。TEMPERA / RLPrompt 表上 AutoPrompt 那列（CR 57.5、均 56.7）是邻居在少样本上的复现，禁止用 91.4 去改，也禁止用 57.5 来否定 Table 1。

本篇是 Harness 里「梯度改离散 token、交卷是触发词」的样板。Wallace 等 2019 的 Universal Adversarial Triggers 用同一套一阶近似去攻击；这边目标换成抬标签似然。后来 GCG 一类越狱串是这条搜索的后代，主实验没有越狱表。**不是** RSI。**不是** 软提示。**不是** 微调。**不是** API 黑盒。一手：Shin, Razeghi, Logan IV, Wallace, Singh，UC Irvine / UC Berkeley，[arXiv:2010.15980](https://arxiv.org/abs/2010.15980)，EMNLP 2020（ACL Anthology `2020.emnlp-main.346`，pp. 4222–4235）；前三作者并列。代码 [ucinlp/autoprompt](https://github.com/ucinlp/autoprompt)，项目页 [ucinlp.github.io/autoprompt](http://ucinlp.github.io/autoprompt)。数字以 HTML Table 1–5、附录 Table 6–8、§2.2–2.3、§7 为准。骨干 BERT-base（110M）和 RoBERTa-large（355M）。仓库 README 不要写进正文。

## 1. 问题：人手填空测知识，句子差一点分数就塌

预训练到底装了什么，微调会搅进去。探针分类器另训一层，高分可能来自探针而不是模型。注意力可视化也不构成因果。更干净的下界是 prompting：任务收成填空，不另加参数。Petroni 等把知识库补全写成 “Obama was born in [MASK]”。Radford 等在文末加 `TL;DR:` 做摘要。坏处是句子要人写。Jiang 等已经证明：同一事实，换一句模板，召回能拧到另一头。NLI 这种抽象标签更难写成「像人话的填空」。

AutoPrompt 的补丁：模板 \(\lambda\) 只规定输入放哪、`[MASK]` 放哪、触发词 `[T]` 占几格。触发词所有样本共用，初始化成 `[MASK]`，再用训练标签把格子一个一个换成更抬似然的词。分类时掩码位置上的词不一定等于类名，要对一组标签词 \(\mathcal{V}_y\) 边缘化：

$$
p(y\mid x_{\mathrm{prompt}})=\sum_{w\in\mathcal{V}_y}p(\texttt{[MASK]}=w\mid x_{\mathrm{prompt}})
\tag{1}
$$

事实检索的宾语本身就是词表里的实体，跳过这步，直接看宾语的秩。

\(S\) 取当前那组触发词。单轮 \(S'=I(S)\) 可以发生：HotFlip 换掉第 \(j\) 个槽。术语式 (2) 还要 \(I'\subseteq S'\)。模板、\(k\)、标签词集合、用哪一批训练数据做候选、用哪一批做保留，下一场 SST-2 原样再走。混元台阶上这是薄 \(H_t\)。交卷是搜完的触发串，可以贴到冻着的 BERT / RoBERTa 前面。搜索器不交卷。

![触发词走梯度出候选，k 次前向留下最好的那一换](./images/fig-autoprompt-loop.png)

> 图 1：实线是触发词被换。虚线在冻结图。更新的是 \([T]\)，不是 MLM 权重。

**图 1 解析**

- **trigger tokens**：所有输入共用。SST-2 网格搜长度 3 到 6；LAMA 主表 5 或 7。
- **HotFlip top-k**：对当前槽的输入嵌入求 \(\nabla\log p(y\mid x_{\mathrm{prompt}})\)，和词表嵌入点积，取估计涨幅最大的 \(k\) 个词。
- **k forwards**：每个候选真的前向一次，留下似然最高的那一换。不是只信线性近似。
- **frozen MLM**：只出掩码分布。分类再按式 (1) 把 \(\mathcal{V}_y\) 加起来。

## 2. 机制：一阶近似出菜单，真前向才拍板

换第 \(j\) 个触发词 \(x_{\mathrm{trig}}^{(j)}\) 为词表里的 \(w\)，对数似然的一阶估计是嵌入点积。候选集：

$$
\mathcal{V}_{\mathrm{cand}}=\underset{w\in\mathcal{V}}{\mathrm{top}\text{-}k}\bigl[w_{\mathrm{in}}^{\top}\nabla\log p(y\mid x_{\mathrm{prompt}})\bigr]
\tag{2}
$$

作者写：算候选的代价大约等于一次前向加一次反向；点积和 LM 输出投影同一量级。然后对每个候选再前向，在**另一批**数据上比式 (1)，留下最好的那个槽位替换。每轮结束在开发集上看似然，整场搜索返回开发集最好的那条。测试集另留。这是 \(I\) 的早停，不是模型改自己的验证协议。

标签词怎么来。事实和关系抽取：宾语就是标签。情感和 NLI：先把带 `[MASK]` 的提示送进 Transformer，取出掩码位隐状态 \(h^{(i)}\)，训一只逻辑回归 \(p(y\mid h^{(i)})\propto\exp(h^{(i)}\cdot y+\beta_y)\)。再把 MLM 的输出词嵌入 \(w_{\mathrm{out}}\) 代进去得 \(s(y,w)\)，取最高的 \(k\) 个词构成 \(\mathcal{V}_y\)。直觉是：和某类经常共现的词，输出嵌入会和该类权重方向接近。附录 Figure 3 把 \(|\mathcal{V}_{\mathrm{cand}}|\) 钉在 100：标签词从 1 个加到 3 个，BERT 大约 +5，RoBERTa 大约 +10；触发词长度几乎不动分。\(k=10\) 时趋势一样。RoBERTa 正面例子里会出现 marvelous、philanthrop，负面出现 worse、incompetence。可解释的是标签词，不是触发词。SST-2 上 RoBERTa 最好的串是 `{sentence} atmosphere alot dialogue Clone totally [MASK].` 人读不通。NLI 的矛盾侧会出现 Nobody / nobody / nor，蕴含和中性是子词碎片（##found、##ponents），和精确率那一列对得上。

搜索要白盒。梯度对的是触发词的**输入嵌入**，任务模型冻着不当微调对象，但仍必须能反向。GrIPS / RLPrompt 那种只问补全概率的 API 路径，本篇主实验没走。作者写方法「可平凡接到自回归 LM，预测位置移到末尾」，主表只有 BERT 和 RoBERTa。局限节把 GPT-3 写成以后可能有用，没有实验。

训练协议。情感和 NLI 用 §2.3 自动选标签词。每步：一批训练数据出 \(\mathcal{V}_{\mathrm{cand}}\)，另一批比似然，开发集记账，测试集只评一次。SST-2 网格：\(|\mathcal{V}_{\mathrm{cand}}|\in\{10,100\}\)，\(|\mathcal{V}_y|\in\{1,3,5\}\)，触发长度 3 到 6。脚注：8 张 2080Ti 跑两天。人手对照先写好，避免看见自动提示再编：`{sentence} this movie was [P].`，标签 terrible / fantastic。NLI 用 SICK-E，标准集中性类占 56.7%；另做均衡 3 类和只要矛盾/蕴含的 2 类。网格换成 \(|\mathcal{V}_{\mathrm{cand}}|\in\{10,50\}\)，\(|\mathcal{V}_y|\in\{1,3,5,10\}\)，触发长度 1 到 5，按开发集准确率留最好的那条。LAMA 覆盖 41 个关系，每个关系最多 1000 条 T-REx 训练，不够的补 Wikidata，保证测试三元组不进训练，80/20 切训练和开发。因为 T-REx 和 LAMA 测试分布不完全一样，作者另做 60/20/20 同分布切分。禁止专有名词和训练金标宾语进触发词，挡「把答案写进提示」。关系抽取把上下文句子拼在主体前面。权重来自 HuggingFace transformers。搜索要跑多轮：每轮只换一个槽，贪心留下开发集最好的那条，测试集只评这一条。测试时不再反向，也不换槽，避免把测试集当搜索预算。

Table 3 给了可读对照。情感例子：`unflinchingly bleak and desperate Writing academicswhere overseas will appear [MASK].` 标签词正面 partnership / extraordinary，负面 worse / unconstitutional。NLI 模板把前提、掩码、触发词、假设排成一行；矛盾侧是 Nobody，蕴含和中性是子词碎片。事实检索：`Hall Overton fireplacemade antique son alto [MASK].` 关系抽取把维基句贴在主体前面，触发词仍是乱码。交卷给人看的是这些串，不是搜索器。

![上排触发词被换并保留；下排 MLM、模板、k 和标签词冻着](./images/fig-autoprompt-frozen.png)

> 图 2：实线更新训练期的 \([T]\)。虚线是冻着的 \(\theta\)、\(\lambda\)、HotFlip 配方和 \(\mathcal{V}_y\)。

**图 2 解析**

- **会变（训练期）**：触发词各个槽；开发集记下的当前最优串。
- **会变（交卷）**：一条任务级离散触发串。测试时所有输入共用。
- **冻 \(\theta\)**：BERT / RoBERTa 不微调。对照里的 finetuned 行才动全模型。
- **冻 \(I\)**：模板、式 (2) 的 \(k\)、标签词启发式、批大小、开发集挑选协议。
- **门**：训练和开发有金标。测试不再换触发词。

## 3. 数字：91.4 是全量 SST-2，不是 16-shot 的 92.5

Table 1，SST-2 测试。RoBERTa AutoPrompt **91.4**（开发 91.2），人手 85.2。BERT AutoPrompt 82.3（开发 80.9），人手 63.2。微调 RoBERTa 96.7、BERT 93.5（GLUE 榜 \(\dagger\)）。线性探针：RoBERTa 88.8，BERT 83.4。BiLSTM 82.8，BiLSTM+ELMo 89.3。作者写：不微调的 RoBERTa 提示已经贴着微调过的 BERT 和 ELMo。贴的是 91.4 对 93.5 / 89.3，不是赢过 96.7。BERT 这一列更窄：AutoPrompt 82.3 贴着 BiLSTM 82.8，还略低于线性探针 83.4。RoBERTa 才是提示高于探针（91.4 对 88.8）。人手模板 RoBERTa 已经 85.2，自动提示再抬 6.2；BERT 人手只有 63.2，自动提示抬到 82.3，差更大。不要把「自动一定碾压人手」写成机制，RoBERTa 人手已经不差。探针用的是 token 表示的逐元平均再接线性层，不是掩码位那只逻辑回归。

少数据 Figure 2，开发集，触发长度 10，\(|\mathcal{V}_y|=3\)，\(|\mathcal{V}_{\mathrm{cand}}|=10\)，10 / 100 / 1000 条，10 次随机子集。微调按 Mosbach 等：20 epoch，AdamW 带 bias correction，最大学习率 \(2\times 10^{-5}\)，前 10% 线性升、之后线性降到 0。情感上微调仍更高。NLI 均衡 3 类上，10 条时 AutoPrompt 的均分高于 BERT 和 RoBERTa 的微调；RoBERTa 微调会出现失败 run，和 Dodge 等「小数据微调不稳」同一观察。作者读成：收成填空时，模型不必再过一道「变成分类器」的坎。EMNLP 相机稿这张图有 bug，HTML 写 revised since EMNLP。花园只取修订后的方向，不手抄误差条高度。1000 条已经不是「探针只需几条」的广告，和本篇 Table 1 的全量训练集更不是同一格。

Table 2，SICK-E 测试。RoBERTa AutoPrompt：标准 65.0，3 类均衡 **69.3**，2 类 87.3。BERT：62.3 / 55.4 / 85.7。多数类 56.7。微调 BERT 86.7 / 84.0 / 95.6。2 类上 87.3 对微调 95.6，作者写成 comparable，花园读成同量级仍低一截。线性探针 3 类掉到 49 左右，AutoPrompt 的 RoBERTa 69.3 更高；探针有假阳性风险，作者拿来挡「提示只是另一只探针」。3 类均衡上按标签的精确率：BERT 矛盾 74.9、蕴含 54.4、中性 36.8；RoBERTa 84.9 / 65.1 / 57.3。矛盾好写成人话标签（Nobody、nor），中性难。标签词可解释，不代表三类一样稳。

Table 4，BERT、LAMA Original。MRR / P@10 / P@1：人手 LAMA 40.27 / 59.49 / **31.10**，LPAQA Top1 43.57 / 62.03 / **34.10**，AutoPrompt 5 token 53.06 / 72.17 / **42.94**，7 token 53.89 / 73.93 / **43.34**。摘要 43.3 对 34.1，分母是单提示 LPAQA，不是 30 条集成。作者另写：即便 LPAQA 集成最多 30 条，本方法一条提示仍大约高 4 个点。T-REx 同分布切分上人手 LAMA 只有 26.38，5 / 7 token 分别到 45.40 / **45.57**，MRR 54.42 / 54.89。触发 5 和 7 的 P@1 在 Original 上只差 0.40，作者写成对长度不敏感。BERT 对 RoBERTa 的可比子集（宾语对两套词表都是单 token）：5 token P@1 BERT **45.23**（MRR 55.22），RoBERTa **40.01**（MRR 49.90）。事实检索上更大的 RoBERTa 没有赢。RoBERTa 搜出的串更爱掺无关词：演奏乐器里出现 Trump，场上位置出现标点 `," ()`。作者强调 prompting 是下界，低分不等于知道得少。附录 Table 6 按关系拆开。人手好写的关系上自动提示会输：P1376「首都」人手 73.93、AutoPrompt 40.17；P19「出生地」人手 21.08、自动 19.92；P36「首都是」人手 62.16、自动 60.6。难写的关系上拉开：P136「演奏何种音乐」人手 0.75、自动 **55.42**；P413 场上位置人手 0.53、自动 41.7；P140 宗教人手 0.63、LPAQA 已到 59.83、自动 75.26；P27 国籍人手 0.0、LPAQA 41.51、自动 46.69；P30 所在洲人手 25.44、自动 70.36。P106 职业人手 0.63、自动也只有 14.72。P361「是……的一部分」自动 17.7 低于人手 23.61；P463 成员关系自动 54.22 低于人手 67.11。不是处处神迹。乱码里仍能看见 striker、defensive、orchestra、sax。可读不是目标。Table 7 的 P@1 和 Table 6 不是同一列口径（有的行换了子集），主判定回 Table 4 的均分。

Table 5，关系抽取 P@1。BERT AutoPrompt **90.73**，LPAQA 76.55，LAMA 69.06，2017 年 LSTM 监督 **57.95**。作者写相对监督最多约 33 个点（90.73 减 57.95）。RoBERTa AutoPrompt 只有 60.33，仍略高于 LSTM，低于 BERT。把测试句里的宾语改成随机另一实体：LSTM 58.81 几乎不动，BERT AutoPrompt 掉到 **56.43**，LAMA 掉到 28.02，LPAQA 掉到 30.79，RoBERTa 掉到 28.95。作者读成：高分很大一块来自模型已经知道的事实，不是从这句里抽。即便如此，扰动后 BERT AutoPrompt 仍高于 LAMA / LPAQA 的扰动列。评价改过：只要没预测成别的关系就算，NER 失败的句子丢掉，两个 T-REx 关系监督模型没训过的也丢掉。扰动例子写在正文：把「Ryo Kase ... born in Yokohama」里的宾语改成 Yorkshire，提示也跟着改，再重新搜触发词。监督 LSTM 几乎不动（57.95 → 58.81），说明它在抽关系；MLM 大掉，说明它在背。评价还允许规范名 USA 和表层 American 都算对，只要这句上下文里出现过。这比标准 RE 松。附录 Table 8 里 RoBERTa 的制造商关系会搜出 defy trademarks of namesake manufacturer 这种还沾边的短语，不代表每条关系都可读。SICK-E 大约一万对人工标注句。标准集中性占 56.7%，多数类基线就是这一格；均衡 3 类把多数类压到 33.3%。作者拿线性探针挡假阳性：3 类上探针 BERT 49.5、RoBERTa 49.4，AutoPrompt 的 RoBERTa 69.3。2 类上探针反而到 91.9 / 91.1，提示 85.7 / 87.3，探针更高。提示不是处处赢探针，只在假阳性风险更大的 3 类上更像样。

## 4. 梯度触发词不是术语式 (2)

听成「模型用梯度改自己怎么说话」差在主语。改的是槽位里那几个触发 token。谁规定模板？人。谁规定 \(k\) 和标签词个数？人网格搜。谁规定用 Wallace 的一阶近似而不是 RL？人。下一场任务不会因为这条 `Clone totally` 好用就升级搜索器。留下的是 \(H_t\) 里一组共用离散串。\(\theta\) 原样。配方原样。

和 [RLPrompt](../24-RLPrompt-离散提示强化学习/24-RLPrompt-离散提示强化学习.md) 钉死。那边 SQL 生成、可黑盒、少样本 16/类、5 token SST-2 92.5；这边 HotFlip 替换、要梯度、全量 SST-2、测试 91.4。两格都叫 RoBERTa、都叫 SST-2，训练条数不是一回事。邻居少样本表上的 AutoPrompt 均 56.7，是 Deng 等的复现，不要写回 Table 1。和 [TEMPERA](../23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md) 钉死：那边 PPO 编辑人写初稿、按查询、隐状态当状态；这边触发词查询无关、梯度在嵌入上。TEMPERA 表 SST-2 91.9 对的是邻居 RLPrompt 90.1，不是本篇 91.4。和 [GrIPS](../22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md) 钉死：短语手术无梯度，InstructGPT 上 +4.29；本篇有梯度，骨干是 BERT/RoBERTa。GrIPS 写「Prefix 上界住 AutoPrompt」是传递不等式，不是已经跑过 Shin 等的表。和 [APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md) 钉死：APE 用大模型整段写人话指令；这边触发词常不通。和 [ProTeGi](../21-ProTeGi-文本梯度束搜索/21-ProTeGi-文本梯度束搜索.md)、[TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md) 钉死：文本梯度是自然语言批评句；这边梯度是嵌入点积，没有「哪里错了」的句子。和 [Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) 钉死：那边改本题答案，跨题清空；这边改共用触发词。

QQP 和 RTE 上，人手和自动都几乎摸到随机。作者写不能据此断言 BERT 不懂释义或蕴含。探测工具有各自的盲区。类别极不均衡时，提示会抬多数类似然；LAMA / SICK 里他们靠重平衡缓解。贪心搜离散词表会脆，未来工作写成更好的构造法。需要带标签的训练数据，和线性探针同一前提，和「只靠语言直觉写模板」不同。触发词缺可解释性，作者承认和探针一样。这些是 \(I\) 的失效模式，不是 \(\theta\) 在进化。

Wallace 等的攻击版把同一套一阶近似用来抬错误类。本篇把目标换成正确类的边缘似然，菜单形状没变。后来 Zou 等的 GCG 把逐步坐标上升接到对齐绕过，花园不把越狱表写进本篇，只点名：离散触发词搜索可以服务完全相反的奖励。服务哪种奖励，由墙外的人定。主实验的情感、NLI、LAMA、T-REx 都不是越狱。讨论节把「多任务只存提示、共用一只预训练模型」写成工程便宜，对标的是各任务各存一份微调 checkpoint。花园读成部署论点，不是已经接到 GPT-3 API 的表。少数据上提示有时更稳，全量 SST-2 上微调仍更高：96.7 对 91.4。作者把 prompting 写成参数为零的探针替代，有时也能当微调的廉价替代；主判定仍是探针。附录 Table 6 还有几处拉开：P264 厂牌人手 9.56、自动 43.82；P279 子类人手 30.74、LPAQA 掉到 14.75、自动 54.93。P190 双子城三家都在 2 附近，搜触发词也救不了。8 张 2080Ti 两天是 SST-2 网格的账单，不是测试时还在搜。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？共用触发词字符串。BERT / RoBERTa 动了没有？主方法没有。91.4 能不能当 RSI？不能。还缺什么？搜索步骤或 \(k\) 进入 \(S'\)，并且下一轮换词器就是升级后的那份。LAMA 的 43.3 说明人手模板低估了 BERT 装的事实，不说明改进器进了系统。关系抽取扰动实验说明：填空高分可以是在背事实。把 AutoPrompt 听成「已经替代微调」，Table 1 的 96.7 还在。把「可接到 GPT-3」听成已经跑过 175B，是把引言适用面当成了表。

**读**：共用触发词、HotFlip 式 (2)、式 (1) 边缘化、要输入嵌入梯度、RoBERTa SST-2 测试 91.4、人手 85.2、微调 96.7、SICK-E 3 类 69.3、LAMA 7 token P@1 43.34 对 LPAQA 34.10、事实检索 BERT 高于 RoBERTa、RE 90.73 扰动后 56.43、QQP/RTE 近随机、全量不是 16-shot、不是术语式 (2)。  
**不读**：用 91.4 替换 RLPrompt 的 92.5、用邻居表 57.5 否定 Table 1、用 43.3 改 Jiang 等集成、说已经全面替代微调、把扰动前的 90.73 读成会抽关系、把 GPT-3 听成主实验、说搜索配方也在进化。

同层：[26 PromptAgent](../26-PromptAgent-MCTS提示规划/26-PromptAgent-MCTS提示规划.md)、[24 RLPrompt](../24-RLPrompt-离散提示强化学习/24-RLPrompt-离散提示强化学习.md)、[23 TEMPERA](../23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md)、[22 GrIPS](../22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md)、[19 APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md)、[21 ProTeGi](../21-ProTeGi-文本梯度束搜索/21-ProTeGi-文本梯度束搜索.md)、[14 TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md)。综述里的离散梯度搜：[05](../../1-坐标系与术语/05-自进化Agent综述/05-自进化Agent综述.md)。

## 参考文献

1. Shin, T., Razeghi, Y., Logan IV, R. L., Wallace, E., & Singh, S. (2020). [AutoPrompt: Eliciting Knowledge from Language Models with Automatically Generated Prompts](https://arxiv.org/abs/2010.15980). EMNLP 2020. arXiv:2010.15980.
2. 代码：[ucinlp/autoprompt](https://github.com/ucinlp/autoprompt)。
3. Wallace et al. (2019). Universal adversarial triggers。搜索的攻击版前身。
4. 本花园：[RLPrompt](../24-RLPrompt-离散提示强化学习/24-RLPrompt-离散提示强化学习.md)；[GrIPS](../22-GrIPS-短语级编辑搜索/22-GrIPS-短语级编辑搜索.md)；[TEMPERA](../23-TEMPERA-测试时提示编辑/23-TEMPERA-测试时提示编辑.md)。
