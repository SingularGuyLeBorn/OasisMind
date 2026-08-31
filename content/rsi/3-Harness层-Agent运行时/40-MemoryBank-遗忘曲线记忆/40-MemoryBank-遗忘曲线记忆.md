---
title: "40 · MemoryBank：库会忘，曲线冻着"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Zhong 等给对话外挂记忆库，按艾宾浩斯曲线改强度。
  15 个虚拟用户、10 天、194 道探测题。英文正确率 ChatGPT 0.716，检索 0.763 反而低于 ChatGLM。
  表上三条都带着 MemoryBank。提示和 R=e^{-t/S} 冻着。不是术语式 (2)。
tags:
  - RSI
  - MemoryBank
  - Harness
  - 遗忘曲线
  - L2
---

# 40 MemoryBank：库会忘，曲线冻着

摘要写 continually evolve，还写按艾宾浩斯曲线遗忘和加强。人把 evolve 听成改进器在升级。打开 Table 2：三条都是带着 MemoryBank 的 SiliconFriend，没有「同一只模型、不挂库」的对照。英文 97 题，ChatGPT 检索 **0.763**、正确 **0.716**、连贯 **0.912**；ChatGLM 检索 **0.809** 更高，正确只有 **0.438**。中文 97 题，BELLE 检索 **0.856** 最高，ChatGPT 正确 **0.655**。评的是人在 0 / 0.5 / 1 上打的分，不是 LoCoMo，不是水果店 41/50。会变的是对话条、日摘要、用户画像、每条记忆的 \(S\) 和 \(t\)。摘要提示、\(R=e^{-t/S}\)、双塔检索器冻着。

本篇夹在 [ChatDB](../39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md)、[MemGPT](../36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md) 和 [A-Mem](../37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md) 旁边。综述把短时压缩写成 ReadAgent、MemoryBank 按遗忘曲线更新。ChatDB 把账交给 SQL；这边把对话条交给 FAISS，再按曲线改强度。MemGPT 换页；这边不分页，召回相关记忆、全局画像、全局事件摘要拼进提示。A-Mem 连卡片改旧笔记；这边日摘要和画像是另两层。四套数字禁止横加。**不是** RSI。**不是** 术语式 (2)。开源骨干上的 LoRA 是一次心理对话微调，不是改进器进 \(S'\)。一手：Zhong, Guo, Gao, Ye, Wang，中山大学 / 哈工大 / KTH，[arXiv:2305.10250](https://arxiv.org/abs/2305.10250)，AAAI 2024，*Proceedings of the AAAI Conference on Artificial Intelligence* 38(17):19724–19731。代码 [zhongwanjun/MemoryBank-SiliconFriend](https://github.com/zhongwanjun/MemoryBank-SiliconFriend)。数字以 HTML Table 2、§2–§4、公式 \(R=e^{-t/S}\) 为准。禁止用手抄 Figure 2–4 对话去改 0.716。禁止和 ChatDB 的 82%、MemGPT 的 93.4、A-Mem 的 27.02、HippoRAG 的 89.1 横加。

## 1. 问题：窗口装不下长期陪伴，向量库不会忘

作者写陪伴、心理咨询、秘书都要跨很多天记得事。当时的 LLM 没有长期记忆。Neural Turing Machine 那种外存矩阵要训练，接不上现成 ChatGPT。多会话闲聊数据往往只有几轮，画像和遗忘都不在。MemoryBank 要三件套：仓库、检索、更新。仓库里不只是原始对话，还有日事件摘要、全局事件摘要、日画像、全局画像。检索是双塔稠密检索，对话轮和事件摘要都当记忆条 \(m\)，编码器 \(E(\cdot)\) 预编码，FAISS 索引，当前上下文 \(c\) 编码成 \(h_c\) 去搜。更新借艾宾浩斯：记得快掉、隔一阵再看会记得更久。

\(S\) 取这次部署里的记忆库：带时间戳的对话、摘要、画像，以及每条的强度 \(S\) 和经过时间 \(t\)。单轮 \(S'=I(S)\) 可以发生：多一条对话、改一条 \(S\)。术语式 (2) 还要 \(I'\subseteq S'\)。下一轮仍用同一句摘要提示、同一句画像提示、同一条 \(R=e^{-t/S}\)、同一只 MiniLM 或 Text2vec。混元台阶上这不是 L0：库跨天还在。也到不了改改进器。更像 MemGPT / ChatDB：留下脚手架状态，出状态的程序冻着。作者把 evolve 写成对用户个性的理解在变。花园读成画像文本在变，配方不在变。

和邻居先划线。ChatDB 的 82% 是 50 道合成店账；这边 0.716 是 97 道英文探测题上的正确分。MemGPT 的 93.4 是 MSC 话题级裁判。A-Mem 的 27.02 是 LoCoMo 多跳。HippoRAG 的 89.1 是 2Wiki R@5。ReadAgent 是 gist 分页，综述和 MemoryBank 并列短时调度，本篇主表没有 ReadAgent。Xu 等 2021 的多会话闲聊被作者写成轮数不够陪伴；本实验是 10 天、每天至少两个话题、ChatGPT 扮演 15 个虚拟用户。贡献第三条写「有遗忘和没有遗忘都能用」。Table 2 没有把这两档拆开。不要把曲线听成已经消融过的主列。

## 2. 机制：存三层，搜一条，按 \(R=e^{-t/S}\) 改强度

任务定义：用户一句话，加上已有库，生成回复，并改库。仓库三层。细粒度：多轮对话按时间戳记下。层次摘要：先把一天的对话收成日事件，再把多天的日事件收成全局事件。提示冻着：「Summarize the events and key information in the content [dialog/events]」。画像：先按当天对话写日画像，再把多天画像收成全局画像。两句提示也冻着。一句是「Based on the following dialogue, please summarize the user's personality traits and emotions.[dialog]」。一句是「The following are the user's exhibited personality traits and emotions throughout multiple days. Please provide a highly concise and general summary of the user's personality[daily Personalities]」。人改这两句，等于人改 \(I\)。

检索按 DPR 双塔。每轮对话和每条事件摘要是 \(m\)，\(h_m=E(m)\)，库 \(M=\{h_m^0,\ldots,h_m^{|M|}\}\)。当前 \(c\) 编成 \(h_c\) 去搜。开源英文用 MiniLM，中文用 Text2vec，索引走 FAISS，编排走 LangChain。编码器可以换。换编码器是人改 \(I\)。实时对话时，用户这句话当查询，拼进提示的是相关记忆、全局画像、全局事件摘要。不是把 10 天全文塞进窗口。三件套要钉死：相关记忆不是整天日志，全局画像不是当天情绪，全局事件不是某一轮。窗口里装的是检索命中加两份摘要。这和 ChatDB 问答阶段不贴 `{records}` 同类，都是外存，格式不同。ChatDB 外存是表；这边外存是向量条加两层自然语言摘要。

更新是可选的拟人模块。作者只模拟艾宾浩斯三条：遗忘速率、时间衰减、间隔效应。公式 \(R=e^{-t/S}\)。\(R\) 是保留比例，\(t\) 是学过之后经过的时间，\(S\) 是强度。实现上把 \(S\) 写成离散值，第一次出现记为 1。某条被召回，\(S\) 加 1，\(t\) 归零，以后更不容易忘。正文写这是探索性的简化，真人记忆更复杂，不同人和不同材料曲线不一样。过学习和有意义材料效应点了但不做。Table 2 没有报「关掉遗忘掉多少分」。删一条的概率阈值正文没写成主表数字。花园只认：强度按这条规则改；规则本身冻着。

![用户话进检索，拼画像和摘要出回复，库按曲线改强度；下一轮再进](./images/fig-memorybank-loop.png)

> 图 1：实线是本题数据。回到 Query 的是下一句用户话。遗忘更新画在库上，不另画第五框。

**图 1 解析**

- **Query**：当前话当 \(h_c\)。示范和系统人设在这一步就进提示。
- **Retrieve**：FAISS 取相关 \(m\)。取错了，后面正确分会一起掉。
- **Reply**：相关记忆、全局画像、全局事件摘要拼进提示，模型写回复。
- **Store**：记下这轮对话，必要时改日摘要、画像、\(S\)。

产品名叫 SiliconFriend。开源骨干 ChatGLM 6.2B、BELLE（LLaMA 7B 再指令微调）先走 LoRA：38k 条网上扒的心理对话，秩 16，3 个 epoch，一张 A100。闭源 ChatGPT 不做这一步。然后三只都接 MemoryBank。心理微调和记忆库不要收成一件事。Table 2 的 ChatGPT 行没有 LoRA，正确分反而是英文最高。那一行说明：挂库这件事本身不要求改 \(\theta\)。开源两行有 LoRA，检索可以更高，正确分仍低于 ChatGPT。骨干能力在正确和连贯上压过检索命中。不要把 38k 听成 MemoryBank 的主表。LoRA 只改开源线性层的低秩旁路，原权重冻着。这是一次领域适配，不是记忆回写再训。

## 3. 数字：0.716 是 97 题上的正确分，表上没有无记忆列

配置：15 个虚拟用户，ChatGPT 按人设扮演，10 天，每天至少两个话题，中英各建一套库。人写 194 道探测题，中英各 97。人给检索、正确、连贯打分。检索是 0 / 1：有没有取到相关记忆。正确是 0 / 0.5 / 1：回复里有没有题要的答案。连贯是 0 / 0.5 / 1：回得像不像接上了上下文和取回的记忆。排序分 \(s=1/r\)，\(r=1,2,3\) 是三只 SiliconFriend 对同一题的相对名次。没有第四只「不挂 MemoryBank 的 ChatGPT」。没有 LoCoMo。没有 Fruit Shop。没有 WebArena。

Table 2 英文。ChatGLM：检索 0.809，正确 0.438，连贯 0.68，排序 0.498。BELLE：0.814 / 0.479 / 0.582 / 0.517。ChatGPT：0.763 / 0.716 / 0.912 / 0.818。ChatGPT 检索不是最高，正确、连贯、排序是最高。作者把这写成框架有效，开源检索也高，正确不如 ChatGPT 是因为基座弱。花园再钉一句：检索高不等于答对。ChatGLM 英文检索 0.809 对 ChatGPT 0.763，正确却 0.438 对 0.716。取到了，写不出来，分仍低。

Table 2 中文。ChatGLM：0.84 / 0.418 / 0.428 / 0.51。BELLE：0.856 / 0.603 / 0.562 / 0.565。ChatGPT：0.711 / 0.655 / 0.675 / 0.758。BELLE 中文检索最高，作者写成 BELLE 中文更好、另两只英文更好。不要三套平均。不要把 0.856 听成中文记忆系统接近满分。那是 97 题上「取没取到」的均值。

排序分的分母是三只变体，不是无记忆对照。第一名 \(s=1\)，第二 \(0.5\)，第三约 \(0.33\)。ChatGPT 英文 0.818 说明多数题排第一，不说明相对裸 ChatGPT 赢多少。人打分没有公开逐题表。0.5 是部分正确 / 部分连贯，均值会被半对拉低。ChatGLM 英文正确 0.438，检索却 0.809：取到了，写不对。不要把检索列听成「八成能用」。中英各 97 题、各一套库，不是一道题翻译两次再平均。ChatGLM 为中文对话优化，BELLE 用 ChatGPT 合成中文指令，所以中文检索可以更高。这是骨干预训练的形状，不是遗忘曲线在中文上更灵。英文 ChatGPT 连贯 0.912，中文只有 0.675。同一套 MemoryBank，骨干换了分数裂开。配方冻着的证据又一条。

Table 1 是机制说明，不当另一张表。用户 Gary，5 月 3 日问减压，模型建议运动、音乐、阅读、找朋友、加娱乐。5 月 10 日问「你当时建议了哪些」。三只都能答上。不要用手抄这段对话去改 0.716。定性例子还有：ChatGLM 安慰分手（Figure 2）、BELLE 想起 Python 书和快排、否认没写过堆排（Figure 3）、ChatGPT 按 Linda / Emily 的画像推荐周末（Figure 4）。定性没有另报一张共情分。心理陪伴的对照是同一只 ChatGLM 不接 SiliconFriend 配方，正文用例子对比，不进 Table 2。

探测题是人写的，对话是 ChatGPT 演的。用户元信息（名字、爱好、性格）也是 ChatGPT 生成的。这是合成陪伴日志，不是 MSC，不是 LoCoMo 的真实长对话。194 这个分母要一直带着。英文正确 0.716 是约 97 题上 0/0.5/1 的均值，听成「七成通用记忆准确率」就过了。排序 0.818 只说明三只里面 ChatGPT 常排第一，不说明相对无记忆基线赢多少。无记忆基线本表没有。每天至少两个话题，所以库里一天不止一条事件摘要。探测题问的是跨天细节，例如 5 月 3 日的建议在 5 月 10 日再问。这是召回，不是改进器学会了减压。

## 4. 这不是术语式 (2)，曲线也不是改进器

库变了，下一句可能直接取到 5 月 3 日的减压建议。改进器没变。摘要提示、画像提示、\(R=e^{-t/S}\)、\(S\) 的加一规则、MiniLM / Text2vec、FAISS、LangChain 拼提示的手续都还在。混元 L0 装不下跨天保持的库；L3 要改提议 / 选择程序。本篇停在留下状态、不改程序。摘要里的 continually evolve 指画像和记忆条在改，不是 \(I\) 在改自己。

LoRA 要单独钉。开源 SiliconFriend 改了 ChatGLM / BELLE 的低秩适配，秩 16，3 个 epoch。那是 Model 层一次领域微调，数据是 38k 心理对话，不是记忆库回写出来的。ChatGPT 行没有 LoRA。英文正确最高的那只，权重按作者写法没为这篇再训。把 LoRA 收进「MemoryBank 已经 RSI」，缺的是 Table 2 最好的正确列根本没走 LoRA，而且 LoRA 也不是 \(I\) 进了 \(S'\)：下一轮摘要提示仍是那两句。

和 ChatDB 钉死。82% 是 41/50 合成店账，SQL 执行精确；这边向量检索会取错，ChatGPT 英文检索只有 0.763。和 MemGPT 钉死。93.4 是 MSC 话题级裁判；0.716 是探测题正确分。MemGPT 函数换页；这边 FAISS 加曲线。和 A-Mem 钉死。LoCoMo 多跳 27.02 不是 97 题 0.716。A-Mem 改旧卡片的链接；这边改 \(S\) 和摘要文本。和 HippoRAG 钉死。89.1 是 2Wiki R@5；这边没有开放知识图。和 ReadAgent 钉死。分页 gist 是另一套短时调度，主表没有。和 NTM 钉死。NTM 训外存控制器；这边编码器可换、ChatGPT 行不训。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness 里的记忆库、摘要和遗忘规则。权重动了没有？ChatGPT 行没有；开源行有一次 LoRA，不是递归。0.716 是不是无记忆对照的涨幅？不是，表上三条都挂着库。还缺什么才叫花园 RSI？摘要提示或 \(R=e^{-t/S}\) 进入 \(S'\)，并且下一句陪伴用的就是升级后的那份。作者承认更新模型是简化。没有报遗忘开和关的对照。没有无 MemoryBank 的 ChatGPT 列。没有墙外检查「这条日摘要该不该进全局」。错画像一旦写进全局，后面的周末建议会一起用歪。定性 Figure 2 把 SiliconFriend ChatGLM 和基线 ChatGLM 对比共情，那是例子，不进 Table 2。心理 38k 只训开源。把共情例子和 0.716 收成一张「陪伴已经赢了」的榜，缺的是分母和列名都不一样。

![上排记忆条与本题回复 y；下排摘要提示、遗忘公式、编码器冻着](./images/fig-memorybank-frozen.png)

> 图 2：实线只更新库内容和本题回复。虚线是冻着的模型和配方。

**图 2 解析**

- **会变**：对话条、日 / 全局摘要、画像、每条的 \(S,t\)，本题回复。
- **冻 \(\theta\)**：ChatGPT 行整只冻着。开源行基座冻着，LoRA 一次训完也冻着。
- **冻 \(I\)**：两句摘要 / 画像提示、\(R=e^{-t/S}\)、召回则 \(S{+}1,t{=}0\)、MiniLM / Text2vec、FAISS。
- **门**：人打检索 / 正确 / 连贯。没有 Argus 那种准入。
- **下一轮**：库携带。提示不携带「上次该怎么写日摘要」的升级。

## 5. 拟人遗忘能改强度，改的不是改进器

贡献第三条写三档通用：开源闭源都能接、中英都能评、遗忘开着关着都能跑。前两档在 Table 2 里看得到。第三档只有声明。关掉遗忘等于 \(S\) 不再加一、\(t\) 不再用来抽条，库只会变厚、不会按曲线变稀。那一档的分数正文没给。人要复现「更拟人」，得自己实现抽条；人要复现主表，可以把更新模块摘掉。两种实现都还是同一套摘要提示和同一只编码器。通用不是已经证明 \(I\) 会自己改。

同一句「给模型记忆」，至少分六截。加长窗口是改模型。ChatDB 是 SQL 状态。MemGPT 是分页外存。HippoRAG 是语料图。A-Mem 是对话卡片。MemoryBank 是带遗忘强度的检索库加画像。六截不要收成「都在推理时自我进化」。相关工作还点了 MANN / NTM、Xu 等的多会话闲聊。本篇主表只有 15 用户 × 10 天的合成日志和 194 道人写探测题。

「有遗忘和没有遗忘都能用」要和 Table 2 一起读。第三条贡献承认两档都适用。主表没有把两档拆开报。曲线在机制节，不在分数节。人要是改 \(S\) 的初值、改召回加几、换编码器、把摘要提示写进库里当可进化规则，都是人改 \(I\)。系统不会因为某次 0.716 就把提示改掉。人打分的三列（检索、正确、连贯）也不进 \(S'\)：下一句陪伴不会因为这道探测题得了 1 就把摘要提示改写。分数是墙外的人，不是改进器。

检索和正确裂开，是 L2 脚手架的证据，也是配方冻着的证据。同一套 FAISS，ChatGLM 取得多、写得差，ChatGPT 取得少、写得好。改进器没有因为取错了就换检索器。开源 LoRA 解决的是心理共情那一截，Table 2 仍用探测记忆，不是另报一张共情榜。定性 Figure 2 不能改 0.438。

代码仓库不是 Table 2。花园只认 2024 年这篇 194 题设置。后来别人把 MemoryBank 接进产品控制台，不改 0.716。Gary 减压、Linda 学 Python、Emily 周末，只说明例子上能召回，不外推到任意陪伴场景。合成用户由 ChatGPT 扮演，探测题由人写，分数由人打。三个人为环节都要带着读，不要听成标准记忆基准已经闭合。

生成提示不会因为某次召回对了就多一条规则进仓库。人要改摘要句、换 \(E(\cdot)\)、把遗忘阈值写成可学习模块，都是改 \(I\)。这和 DGM 改自己的 Python、STOP 改改进器源码正好相反。作者把 MemoryBank 写成给 LLM 的长期记忆机制，花园读成 2024 年这篇合成陪伴探测的定位，不读成已经闭合的递归，也不读成艾宾浩斯理论的实现证明。

**读**：Table 2 英文 0.763 / 0.716 / 0.912 对 GLM 的 0.809 / 0.438，中文 BELLE 检索 0.856、ChatGPT 正确 0.655，194=97+97，15 用户 10 天，表上没有无记忆列，没有遗忘开关消融，ChatGPT 行无 LoRA，不是 82%，不是 93.4，不是式 (2)。  
**不读**：把 evolve 听成改进器升级、把 0.716 当通用准确率、用 41/50 或 27.02 改 0.716、说摘要提示已经在优化自己、说已经 RSI、把 38k LoRA 写成 MemoryBank 主表、把定性共情例写进 Table 2。

同层：[39 ChatDB](../39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md)、[36 MemGPT](../36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md)、[37 A-Mem](../37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md)、[38 HippoRAG](../38-HippoRAG-海马索引检索/38-HippoRAG-海马索引检索.md)、[33 Dynamic Cheatsheet](../33-Dynamic-Cheatsheet-测试时备忘录/33-Dynamic-Cheatsheet-测试时备忘录.md)、[35 AWM](../35-AWM-工作流记忆/35-AWM-工作流记忆.md)、[11 Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md)、[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Zhong, W., Guo, L., Gao, Q., Ye, H., & Wang, Y. (2024). [MemoryBank: Enhancing Large Language Models with Long-Term Memory](https://arxiv.org/abs/2305.10250). *Proceedings of the AAAI Conference on Artificial Intelligence*, 38(17), 19724–19731. arXiv:2305.10250. Table 2 的 0.716 / 0.763 以 HTML 为准。
2. 代码：[zhongwanjun/MemoryBank-SiliconFriend](https://github.com/zhongwanjun/MemoryBank-SiliconFriend)。
3. 本花园：[ChatDB](../39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md)；[MemGPT](../36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md)；[A-Mem](../37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md)。
