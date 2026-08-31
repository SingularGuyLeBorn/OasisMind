---
title: "38 · HippoRAG：图会连，配方冻着"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Gutiérrez 等用 OpenIE 把语料收成无 schema 知识图，再用个性化 PageRank 一次取多跳。
  2Wiki R@5：ColBERT 68.2→89.1，差 20.9 个百分点。HotpotQA 单步更低。
  OpenIE 提示和阻尼冻着。不是术语式 (2)。
tags:
  - RSI
  - HippoRAG
  - Harness
  - RAG
  - L2
---

# 38 HippoRAG：图会连，配方冻着

摘要写相对现成 RAG 最多好 **20%**，在线检索比 IRCoT 便宜 10–20 倍、快 6–13 倍。打开 Table 2：2WikiMultiHopQA 的 R@5，ColBERTv2 **68.2**，HippoRAG **89.1**。差 **20.9** 个百分点。引言写得更老实：MuSiQue 大约 **3** 个点，2Wiki 大约 **20** 个点。正文又写 2Wiki 的 R@2 / R@5 涨 **11** 和 **20%**：59.2→70.7、68.2→89.1，仍是百分点。HotpotQA 单步 HippoRAG R@2 **60.5**，低于 ColBERT **64.7**；问答 F1 **55.0** 低于 **57.7**。人把「海马长期记忆 / 持续更新」听成自我进化，缺的是：会涨的是无 schema 知识图上的节点和边，OpenIE 提示、同义阈值 \(\tau=0.8\)、PageRank 阻尼 **0.5**、ColBERTv2 都冻着。

本篇夹在 [A-Mem](../37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md)、[MemGPT](../36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md) 和 [ExpeL](../32-ExpeL-跨题经验洞察/32-ExpeL-跨题经验洞察.md) 旁边。A-Mem 连的是对话卡片；这边连的是语料三元组。MemGPT 换页；这边离线建图、在线走个性化 PageRank。ExpeL 专文 HotpotQA **39.0** 是 gpt-3.5-turbo-0613 的解题准确率；本表是每集切 **1,000** 道验证题、自建检索库上的召回和短答。两套数字禁止横加。**不是** RSI。**不是** 改 \(\theta\)。**不是** 术语式 (2)。一手：Jiménez Gutiérrez, Shu, Gu, Yasunaga, Su，Ohio State / Stanford，[arXiv:2405.14831](https://arxiv.org/abs/2405.14831)，NeurIPS 2024。代码 [OSU-NLP-Group/HippoRAG](https://github.com/OSU-NLP-Group/HippoRAG)。仓库后来叠了 HippoRAG 2，本篇只读 2024 年这篇实验。数字以 HTML Table 1–6、Table 17–18、§2–§5、§7、附录 G/H 为准。禁止用手抄 Figure 3–5 柱高去改表。禁止和 A-Mem 的 LoCoMo 27.02、ExpeL 的 39.0、MemGPT 的 93.4 横加。

## 1. 问题：段落各自编码，多跳只能多查几轮

作者写现成 RAG 把每篇新段落单独编码。要找「斯坦福做阿尔茨海默神经科学的教授」，库里可能有上千名斯坦福教授、上千名阿尔茨海默研究者，两边很少写在同一段。人记得 Thomas Südhof，是因为海马索引把两路联想接上了。标准多跳问答也要跨段拼。现成办法是多轮取、多轮生成，像 IRCoT。即便多轮走对，路径寻找题仍然难：不是顺着「出生地只有一个」那种单链，而是在很多条可能的路上找交点。HippoRAG 要离线用语言模型把语料收成无 schema 知识图，在线用查询实体当种子跑个性化 PageRank，一次检索里走多跳。

\(S\) 取这次部署里的开放知识图：节点 \(N\)、关系边 \(E\)、同义边 \(E'\)，以及段落到节点的映射。单轮索引 \(S'=I(S)\) 可以发生：多一批三元组。术语式 (2) 还要 \(I'\subseteq S'\)。下一轮仍用附录 I 的 OpenIE / NER 提示，\(\tau\) 仍是 0.8，阻尼仍是 0.5，编码器仍是 Contriever 或 ColBERTv2。混元台阶上这不是 L0：语料进了图，后面的查询还用这张图。也到不了改改进器。更像 A-Mem / MemGPT：留下脚手架状态，出状态的程序冻着。作者把持续更新写成只改海马索引、不改新皮层表征。花园读成只改图、不改配方。

和邻居先划线。密集检索 BM25 / Contriever / GTR / ColBERTv2 一次取相似段。Propositionizer 把段落改写成命题再检索。RAPTOR 造摘要节点。IRCoT 多轮交错推理和检索。HippoRAG 单步可以和 IRCoT 拼，Table 3 才是「IRCoT + HippoRAG」。GraphRAG 一类微软后来的图摘要，本篇相关工作点了 Edge 等 2024，主表没有拿来对照。A-Mem 的卡片盒是对话记忆；这边图是文档语料。不要用 LoCoMo 的 27.02 垫 89.1。

评测从 MuSiQue（可答题）、2WikiMultiHopQA、HotpotQA 的验证集各抽 **1,000** 题。按 IRCoT 的办法把支持段和干扰段收成检索库。Table 1：MuSiQue 11,656 段、91,729 节点、21,714 关系边、107,448 三元组；2Wiki 6,119 / 42,694 / 7,867 / 50,671；HotpotQA 9,221 / 82,157 / 17,523 / 98,709。ColBERT 同义边分别 191,636 / 82,526 / 171,856。这不是全量 MuSiQue / HotpotQA。HotpotQA 作者写成多跳更弱、有虚假信号，附录 B 再拆；主结论不要听成三套全胜。

## 2. 机制：离线抽三元组，在线种子上跑 PageRank

海马索引理论把新皮层、海马、海马旁区分开：编码时把知觉收成可操作的特征再索引，提取时用部分线索把完整记忆补回来。HippoRAG 把指令微调 LLM 写成人工新皮层，把开放知识图写成人工海马索引，把检索编码器写成人工海马旁回。借喻停在这一层。PPR 不是 CA3 的生物实现，阻尼 0.5 是 MuSiQue 训练集 100 例上调出来的。脚注提过人类词回忆和 PageRank 有相关，花园当趣闻，不当主表。模式分离靠把段落收成离散名词短语而不是一段向量；模式补全靠同义边和从查询节点出发的游走。新信息进系统时，作者写成只改索引、不改新皮层表征。对应到实现：语料变了就重抽或增量抽三元组，GPT-3.5 和 ColBERT 的权重不动。增量怎么做、旧节点怎么删，主实验没有单独一张「持续写入」表。评测库是一次性建完的。持续写入、删除过时三元组，主实验都没有单独报。

离线索引。对每段先抽命名实体，再把实体塞进 OpenIE 提示抽三元组。两步都是 1-shot。节点是名词短语，边是关系。再用 \(M\) 给余弦超过 \(\tau\) 的实体对加同义边 \(E'\)。默认 \(\tau=0.8\)。图无预置 schema，schema 其实在提示里：先 NER 再 OpenIE，字段冻着。索引还留下一张 \(|N|\times|P|\) 的矩阵 \(\mathbf{P}\)，记每个名词短语在每段出现几次。默认 \(L\) 是 `gpt-3.5-turbo-1106`，温度 0。\(M\) 是 Contriever 或 ColBERTv2。PPR 走 python-igraph。ColBERT 同义边在 MuSiQue 上 191,636，比关系边 21,714 多一个数量级；2Wiki 上同义边 82,526，关系边只有 7,867。图的连通很多时候靠同义边，不靠人预写的关系类型。

在线检索。查询同样 1-shot NER，得到 \(C_q\)。编码器把每个 \(c_i\) 链到图上余弦最高的节点，得到查询节点 \(R_q\)。个性化向量只在这些节点上均匀给概率，其余为 0。跑 PPR 之前先把查询节点概率乘节点特异度 \(s_i=|P_i|^{-1}\)：出现在越少段落里的节点越重，作者写成局部版 IDF，不必每次检索扫全集。阻尼 0.5：随机游走有一半机会从查询节点重开，一半继续沿边走。游走得到 \(\mathbf{n}'\)，再乘 \(\mathbf{P}\) 得到段落分数。一次取 top-\(k\)。多跳发生在图上，不发生在多轮生成里。作者把它写成单步多跳。查询只抽实体，上下文词丢了就会走歪。附录 F 在 MuSiQue 上抽 100 个错例：NER 限制 **48%**，OpenIE 错或缺 **28%**，PPR **24%**。「Windows 8 浏览器何时可访问」只抽出 Windows 8，浏览器和可访问进不了种子。这是配方，不是模型自己学会了少抽。

问答读者另算。附录 H：上下文用 top-5，1-shot CoT，和 IRCoT 同一套提示策略。Table 4 的 EM / F1 是这只读者，不是 R@2。IRCoT 每步取 top-10，HotpotQA / 2Wiki 最多 2 步，MuSiQue 最多 4 步。和 HippoRAG 拼的时候，用 beam 记下历史最高分。不要把 Table 3 的召回听成 Table 4 的短答。读者也冻着：检索变了，解题提示不变。ExpeL 专文的 HotpotQA 39.0 是另一只 gpt-3.5、另一套解题循环，禁止拿来对 41.8。A-Mem 的多跳 27.02 是对话 F1，禁止拿来对 40.9。

![离线抽三元组入库，在线查询实体上跑 PageRank 再取段落](./images/fig-hipporag-loop.png)

> 图 1：实线是写入和查询。回到 OpenIE 的是下一批段落。同义边在索引里加，不另画第五框。

**图 1 解析**

- **OpenIE**：两步提示写出三元组。错实体会进图，后面 PPR 一起用歪。
- **KG**：节点、关系边、同义边。无 schema 指关系名不预先枚举。
- **Query**：查询 NER 加编码器链接。种子选错，游走从错的地方开始。
- **PPR**：阻尼 0.5，查询节点先乘 \(s_i\)。只取查询节点的邻居而不跑 PPR，Table 5 上更差。

附录 F.2 写过一档不确定集成：查询实体和图节点的余弦有一个低于阈值 \(\theta\)，就把 HippoRAG 分数和密集检索分数先归一再平均。正文把 HotpotQA 的亏部分归到概念–上下文折中，集成用来缓解。花园不把附录集成行写进 Table 2 主表。人设 \(\theta\) 就是改 \(I\)。集成只在链接不确定时才平均两路分数，不是默认主路径，也不是改进器。主实验不收这一档。

## 3. 数字：20.9 是百分点，HotpotQA 单步没有赢

Table 2 单步召回。MuSiQue 上 BM25 32.3 / 41.2，Contriever 34.8 / 46.6，GTR 37.4 / 49.1，ColBERT **37.9 / 49.2**。HippoRAG（ColBERT）**40.9 / 51.9**，大约 3 个点。Contriever 骨干 **41.0 / 52.1**，这一格略高。2Wiki BM25 51.8 / 61.9，ColBERT **59.2 / 68.2**，HippoRAG **70.7 / 89.1**，+11.5 / +20.9。Contriever 骨干 **71.5 / 89.5** 还略高。HotpotQA ColBERT **64.7 / 79.3** 最高，HippoRAG **60.5 / 77.7**。正文把 HotpotQA 写成 competitive，表上单步没有赢。RAPTOR（ColBERT）36.9 / 46.5、57.3 / 64.7、63.1 / 75.6。Proposition（ColBERT）37.8 / 50.1、55.9 / 64.9、63.9 / 78.1。叠了 ColBERT 的摘要树和命题改写，2Wiki 都到不了 89。平均 R@5 HippoRAG ColBERT **72.9**，靠 2Wiki 把 HotpotQA 的亏补回来。禁止用平均 72.9 去改 64.7。

Table 3 多步。IRCoT + BM25：34.2 / 44.7、61.2 / 75.6、65.6 / 79.0。IRCoT + Contriever 在 2Wiki 掉到 51.6 / 63.8，比单步 HippoRAG 的 Contriever 骨干还低。IRCoT + ColBERT：MuSiQue 41.7 / 53.7，2Wiki 64.1 / 74.4，HotpotQA **67.9 / 82.0**。IRCoT + HippoRAG（ColBERT）：**45.3 / 57.6**、**75.8 / 93.9**、**67.0 / 83.0**。HotpotQA 的 R@2 仍低于 IRCoT + ColBERT 的 67.9，R@5 才到 83.0。正文「R@5 大约 4% / 18% / 1%」钉在 53.7→57.6、74.4→93.9、82.0→83.0，仍是百分点。2Wiki 的 18 不要听成相对涨幅。多轮生成补得了路径跟随，补不齐 2Wiki 那种实体交点；单步图检索也补不了 HotpotQA 那种上下文题。两套拼起来才是 Table 3 的最高行。

Table 4 短答。无检索：MuSiQue EM/F1 12.5 / 24.1。ColBERT 15.5 / 26.4。HippoRAG 19.2 / 29.8。2Wiki：33.4 / 43.3 对 **46.6 / 59.5**。HotpotQA：43.4 / 57.7 对 **41.8 / 55.0**，单步问答也更低。IRCoT + HippoRAG 才把三套都拉到最高：21.9 / 33.3、47.7 / 62.7、45.7 / 59.2。正文「最多 3% / 17% / 1% F1」钉在 26.4→29.8、43.3→59.5、57.7→59.2（最后一格是拼了 IRCoT 以后）。同一只读者，不要把 59.5 听成检索 R@5 的 89.1。

Table 6 全召回：top-5 里是否拿到全部支持段。MuSiQue ColBERT AR@5 16.1，HippoRAG 22.4，差 6.3 个点。2Wiki 37.1 对 **75.7**，差 38.6。HotpotQA 59.0 对 57.9，又是略低。正文「从 3% 扩到 6%、从 20% 扩到 38%」说的是全召回把差距放大，不是另做一张相对涨幅。路径跟随例：Alhandra 出生在哪个区，HippoRAG 能直接走到 Vila de Xira；IRCoT 也能走对，只是更贵。路径寻找例：斯坦福加阿尔茨海默，ColBERT 和 IRCoT 取到 Knutson / Knudsen / Giocomo，HippoRAG 取到 Südhof。这是个案，不是 Table 2 的均值。

Table 5 拆零件。换成 REBEL 抽三元组，平均 R@5 掉到 58.4。Llama-3.1-8B 在 2Wiki 掉到 77.5，MuSiQue 仍 51.9。70B 平均 72.5，贴着 GPT-3.5 的 72.9。只看查询节点、不跑 PPR：平均 R@5 56.2。再把邻居也摊一点概率：59.2，仍远低于 72.9。去掉节点特异度：MuSiQue 50.2、HotpotQA 73.7。去掉同义边：2Wiki R@5 85.6。同义边在实体题上更值钱，特异度在 MuSiQue / HotpotQA 上更值钱。两道开关都还在墙外。

费用 Table 17，1,000 查询、GPT-3.5 Turbo：ColBERT API 0 美元、1 分钟；IRCoT 1–3 美元、20–40 分钟；HippoRAG **0.1** 美元、**3** 分钟。10–30 倍、6–13 倍钉在这一行。单线程打 OpenAI，IRCoT 必须串行 2–4 轮，所以比的是在线取，不是离线建图。离线 Table 18，10,000 段：GPT-3.5-1106 索引 **15** 美元、**60** 分钟；ColBERT / IRCoT 只要 7 分钟、0 美元。正文另写每 10,000 段大约贵 15 美元、慢 10 倍。Llama-3.1-8B 本地 120 分钟；70B 4×H100 大约 250 分钟、API 0。另一处写成 10,000 文档大约 4 小时，和 250 分钟对齐。在线便宜、离线贵。不要用 0.1 去改 15。CaRB 上 20 例、239 条金三元组只说明 LLM 抽图比 REBEL 全，不改 Table 2。

## 4. 这不是术语式 (2)，PageRank 也不是改进器

图变了，下一问可能从斯坦福和阿尔茨海默走到 Südhof。改进器没变。OpenIE 提示、NER 提示、\(\tau\)、阻尼、编码器、PPR 实现都还在。混元 L0 装不下跨查询保持的图；L3 要改提议 / 选择程序。本篇停在留下状态、不改程序。摘要里的 continually updating 指新段落进图，不是提示在改自己。

和 A-Mem 钉死。卡片改的是 \(K,G,X,L\)，评的是 LoCoMo 对话 QA；这边改的是文档三元组，评的是多跳召回。和 MemGPT 钉死。93.4 是 MSC 话题级裁判；89.1 是 2Wiki R@5。和 ExpeL 钉死。39.0 是解题准确率，抽取洞察的配方冻着；这边冻着的是抽图和游走。和 IRCoT 钉死。多轮生成可以走路径跟随，走不了路径寻找；单步 HippoRAG 在 2Wiki 上更强，在 HotpotQA 上要拼了 IRCoT 才略超。和 ColBERT 钉死。HotpotQA 单步密集检索可以更高，图方法不是免费午餐。和 RAPTOR / Propositionizer 钉死。摘要树和命题改写仍是段落级编码，没有开放三元组上的 PPR。和 AWM 钉死。网页子程序是手续记忆；知识图是文档联想。WebArena 35.5 不要来改 89.1。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness 里的开放知识图和检索。权重动了没有？没有，OpenIE 和编码器都是现成的。20% 是相对涨幅吗？2Wiki R@5 是 20.9 个百分点。还缺什么才叫花园 RSI？OpenIE 提示或阻尼进入 \(S'\)，并且下一轮建图、游走用的就是升级后的那份。局限节承认：零件都还没为这张任务微调，错多半出在 NER / OpenIE，图搜索也还可以让关系指导游走，长文档抽三元组更不稳，图规模远超当前基准时还没实证。没有墙外检查「这条三元组该不该进图」。错实体一旦写进 \(N\)，同义边会把它接到更多邻居上，后面的查询会一起走歪。

![上排知识图与本题段落；下排 OpenIE 提示、阈值、阻尼、编码器冻着](./images/fig-hipporag-frozen.png)

> 图 2：实线只更新图和本题取回的段落。虚线是冻着的模型和配方。

**图 2 解析**

- **会变**：\(N,E,E'\)，本题 top-\(k\) 段落。
- **冻 \(\theta\)**：GPT-3.5-1106 和 Llama 消融只当抽图器；ColBERT / Contriever 冻着。
- **冻 \(I\)**：两步 OpenIE、\(\tau=0.8\)、阻尼 0.5、PPR、1-shot NER。
- **门**：R@2 / R@5 对支持段；EM / F1 对短答。没有 Argus 那种准入。100 个错例里 NER 占 48。
- **下一轮**：图携带。提示不携带「上次该怎么抽三元组」的升级。

## 5. 海马借喻能建图，建出来的不是改进器

同一句「长期记忆」，至少分四截。改权重是参数记忆。MemGPT 是窗口加外存。A-Mem 是对话卡片。HippoRAG 是语料知识图加 PageRank。四截都还在 Harness 或 Model，本篇只在 Harness。相关工作还点了用维基超链接训练走图的重排序。HippoRAG 从零抽图、无监督多跳。主表仍然只有三套 1,000 题的检索库。

「无 schema」要拆开。不预定关系名单；预定的是两步提示和 \(\tau\)。人改阻尼、换抽图模型、把 PPR 换成带关系的游走，都是改 \(I\)。Table 5 已经显示换 REBEL 或关掉 PPR 会掉。这是 L2 脚手架在索引阶段变厚的证据，也是配方冻着的证据：每段新语料仍走同一份 OpenIE。训练走图重排序的旧工作要维基超链接和监督；这边无监督、从零抽。适应性写在相关工作里，主表没有「换一个没有维基链接的新域再涨 20 个点」那种外推实验。1,000 题设置本身就是为了省钱。

计算资源附录写 ColBERT / Contriever 索引用 4 张 48GB RTX A6000，PPR 用两颗 EPYC 7513。OpenAI 侧的算力作者写无法披露。这些是实验账单，不是改进器。索引并行 10 线程打 `gpt-3.5-turbo-1106`；当时 API 报价百万输入 1 美元、百万输出 2 美元，用来解释那 15 美元，不要换汇重算。

HotpotQA 是这张表的诚实格。单步召回和单步问答都低于 ColBERT。附录 B 用 Contriever 看问题和候选段的匹配分：HotpotQA 干扰段更靠近支持段分数的下沿，不像另两套那样容易混。作者另写知识整合需求更弱，以及概念–上下文折中。花园不把附录集成行写进 Table 2 主列。2Wiki 实体中心，最吃同义边和命名实体。把三套平均听成「全面更好」，缺的是 HotpotQA。路径寻找是动机个案，没有另报一张 path-finding 主表。

错误结构也说明改进器没动。100 个 MuSiQue 错例里将近一半是查询 NER 抽少了。人要是改 NER 提示、让查询也抽「浏览器 / 可访问」这类非实体，那是人改 \(I\)。系统不会因为错了 48 次就把 NER 提示写进图里。OpenIE 在长文档上更不稳，局限节点了附录 F.4，主表没有另列长文档子集。

代码仓库后来的 HippoRAG 2 不是 Table 2。花园只认 2024 年这篇 1,000 题设置。GraphRAG 的 2404.16130 出现在参考文献，没有对照数字。不要用手抄图上的斯坦福例去改 89.1。

生成提示不会因为某次 PPR 走到 Südhof 就多一条规则进仓库。人要改 OpenIE、换阻尼、把游走交给可训练模块，都是改 \(I\)。这和 DGM 改自己的 Python、STOP 改改进器源码正好相反。作者把 HippoRAG 写成 RAG 与参数记忆之间的中间框架，花园读成 2024 年这篇的定位，不读成已经闭合的递归。参数记忆更新难，所以才把 RAG 当默认长期记忆；这篇证明跨段联想可以进图，没有证明改进器进了 \(S'\)。

**读**：Table 2 的 40.9 / 70.7 / 60.5、2Wiki R@5 68.2→89.1 是百分点、HotpotQA 单步更低、Table 4 的 19.2 / 46.6 / 41.8、IRCoT 拼上才三套都最高、Table 17 的 0.1 美元对 1–3、离线 15 美元 / 60 分钟、NER 错例约一半、\(\tau\) 和阻尼冻着、不是 39.0、不是式 (2)。  
**不读**：把 20% 听成相对涨幅、用平均 72.9 盖掉 HotpotQA、用 93.4 或 27.02 改 89.1、说 OpenIE 已经在优化自己、说已经 RSI、把 HippoRAG 2 写进本表、把附录集成行当成主表。

同层：[37 A-Mem](../37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md)、[36 MemGPT](../36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md)、[39 ChatDB](../39-ChatDB-符号SQL记忆/39-ChatDB-符号SQL记忆.md)、[40 MemoryBank](../40-MemoryBank-遗忘曲线记忆/40-MemoryBank-遗忘曲线记忆.md)、[41 ReadAgent](../41-ReadAgent-gist分页记忆/41-ReadAgent-gist分页记忆.md)、[32 ExpeL](../32-ExpeL-跨题经验洞察/32-ExpeL-跨题经验洞察.md)、[35 AWM](../35-AWM-工作流记忆/35-AWM-工作流记忆.md)、[33 Dynamic Cheatsheet](../33-Dynamic-Cheatsheet-测试时备忘录/33-Dynamic-Cheatsheet-测试时备忘录.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Jiménez Gutiérrez, B., Shu, Y., Gu, Y., Yasunaga, M., & Su, Y. (2024). [HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models](https://arxiv.org/abs/2405.14831). NeurIPS 2024. arXiv:2405.14831. Table 2 的 89.1 / 68.2 以会议 HTML 为准。
2. 代码：[OSU-NLP-Group/HippoRAG](https://github.com/OSU-NLP-Group/HippoRAG)。本篇不收后来的 HippoRAG 2 主表。
3. 本花园：[A-Mem](../37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md)；[MemGPT](../36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md)；[ExpeL](../32-ExpeL-跨题经验洞察/32-ExpeL-跨题经验洞察.md)。
