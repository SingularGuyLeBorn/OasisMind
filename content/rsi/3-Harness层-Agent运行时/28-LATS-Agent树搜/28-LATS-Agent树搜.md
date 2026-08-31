---
title: "28 · LATS：本题里的 MCTS，跨题清空"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Zhou 等把 ReAct 扩成 MCTS。GPT-4 HumanEval pass@1 92.7，对 Reflexion 91.0。
  HotPotQA 给了对错真值。树和反思只服务本题。混元 L0。不是术语式 (2)。
tags:
  - RSI
  - LATS
  - L0
  - MCTS
  - Harness
---

# 28 LATS：本题里的 MCTS，跨题清空

[ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md) 在本题的思维树上走 BFS / DFS，估价多半还是模型自己打分，环境反馈进不去。[Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) 能读失败句子，但每条轨迹仍是一条 [ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)，不在逐步岔路上做规划。LATS 把两件事收进同一次搜索：节点是 \(s=[x,a_{1\cdots i},o_{1\cdots i}]\)，边上是想法或动作，走 UCT；失败终点再写一段反思，塞进**本题后续几次**展开。GPT-4 在 HumanEval 上 pass@1 **92.7**，同表 Reflexion **91.0**、裸 GPT-4 **80.1**。GPT-3.5 的 WebShop 均分 **75.9**，比同设定 ReAct **53.8** 高 22.1 分，成功率 **38.0** 仍低于微调那列的 **45.0**。HotPotQA 上 LATS（ReAct）EM **0.63**，作者写成把 ReAct 的 **0.32** 翻倍；同一节写明这是 **oracle**：环境在收到答案时告诉对错。

本篇是 Harness / 推理时「会看环境、会在本题里长 MCTS」的样板。[PromptAgent](../26-PromptAgent-MCTS提示规划/26-PromptAgent-MCTS提示规划.md) 的节点是跨题提示版本，测试时不再长树。这边节点是本题的动作–观察前缀，下一道独立题从空根开始。ToT 专文已经把「搜自己的想法」钉在 L0；本篇把「搜自己的动作并写失败句子」也钉在同一层，只是节点里多了观察。**不是** RSI。**不是** 改 \(\theta\)。**不是** 术语式 (2)。一手：Zhou, Yan, Shlapentokh-Rothman, Wang, Wang，UIUC / Lapis Labs，[arXiv:2310.04406](https://arxiv.org/abs/2310.04406)，ICLR 2024。通信作者写在 UIUC。代码 [lapisrocks/LanguageAgentTreeSearch](https://github.com/lapisrocks/LanguageAgentTreeSearch)。数字以 HTML Table 1–10、§4–5、附录 A 的 \(n,w,\lambda,k\) 为准。仓库 README 不要写进正文。实验里的 GPT-3.5 和 GPT-4 都不微调，价值函数也不另训，全靠上下文。\(w\)、\(\lambda\)、\(k\) 写在附录，换任务由人改，不由上一题的树改。配方不动，题换了树就空。

## 1. 问题：一条 ReAct 不能回头，一棵 ToT 看不见墙外

CoT 把中间步骤写成独白，错了只能把错写完整。ReAct 把动作空间扩成 \(\hat{A}=A\cup Z\)，观察能进上下文，采样仍是一条链。ToT / RAP 会搜多条思维，但不接环境；作者在 HotPotQA 上把 ToT、RAP 直接套上 ReAct 提示，Table 3 里 ToT（ReAct）**0.39**、RAP（ReAct）**0.54**，还低于 Table 2 里纯推理 ToT **0.55**、RAP **0.60**。有搜索、有工具，简单拼起来可以比不用工具更差。LATS 要解决的就是这道缝：搜索算法必须把观察写进节点，价值函数必须在观察之后再打分，失败还要留下能读的句子，而不是只回传一个标量。

\(S\) 取「当前这道题的搜索树加本题反思缓冲」。单轮 \(S'=I(S)\) 可以发生：多展开 \(n\) 个孩子，或写进一条失败反思。术语式 (2) 还要 \(I'\subseteq S'\)。下一道独立题仍用同一套 UCT 权重 \(w\)、同一套 \(n\) 和轨迹上限 \(k\)、同一份反思提示，没有把这棵树或这批反思写进跨题磁盘。混元 L0：改 \((\text{输出},\text{轨迹})\)，保留的 Agent 状态跨独立任务不变。Table 1 给 ToT / RAP / Reflexion / LATS 都打了 External Memory 勾，花园读成本题树或本题 trial 缓冲，不读成 ACE 那种 playbook。

和邻居先划线。ToT 的状态是 \([x,z_{1\cdots i}]\)，没有 \(o\)；LATS 多了观察。Reflexion 的 `mem` 跨同一任务的若干整条 trial；LATS 的反思挂在 MCTS 的失败叶子上，服务的是本题剩下的 \(k\) 次轨迹，不是下一道 HotPotQA。Self-Refine 不接环境、不长树。PromptAgent 的 UCT 在提示空间里，奖励来自训练切出来的保留集；这边 UCT 在本题动作树上，编程任务的回传甚至是合成测试通过率。RAP 也用 MCTS，但靠语言模型当世界模型去模拟；见 [30 RAP](../30-RAP-世界模型规划/30-RAP-世界模型规划.md)。LATS 用真环境交互，作者写不必另训动力学。Gödel Agent 后来能把 24 点求解器整段换掉，那是改运行时，不要拿本篇 GPT-3.5 的 0.44 去盖，也不要用 ToT 专文 GPT-4 的 74% 来替换 Table 7。

![UCT 选节点，展开 n 个动作，环境返回观察，失败则写本题反思](./images/fig-lats-loop.png)

> 图 1：实线是本题内的选、扩、看、反思。回到 UCT 的是更新过 \(V\) 的树，不是已经交卷的 \(y\)。题换了，环断开。

**图 1 解析**

- **UCT select**：从根走到叶子。论文式 (1)：\(UCT(s)=V(s)+w\sqrt{\ln N(p)/N(s)}\)。默认 \(w=1\)。
- **expand n actions**：从 \(p_{\theta}\) 采 \(n\) 个动作（含想法），默认 \(n=5\)。每个动作送进环境，得到观察，长出 \(n\) 个孩子。
- **env observe**：编程是合成 assert 的通过情况；HotPotQA 是维基 API 加 oracle 对错；WebShop 是页面反馈。
- **this-task reflect**：失败终点才写。轨迹和最终奖励进反思提示，失败轨迹与句子存进本题记忆，后续展开当额外上下文。成功或用尽 \(k\) 就停。

价值函数论文式 (2)：\(V(s)=\lambda\cdot\mathrm{LM}(s)+(1-\lambda)\cdot\mathrm{SC}(s)\)。LM 分是观察之后让模型给轨迹打的标量；SC 是同一状态下被重复采样的动作加分。HotPotQA 和 24 点 \(\lambda=0.5\)，编程和 WebShop \(\lambda=0.8\)。编程跳过模拟步，直接把测试通过比例当回传奖励，因为一步已经是完整解。展开时温度来自普通采样，不是贪心一条。\(n\) 越大，同一层候选越密，账单近似按 \(kn\) 涨：HotPotQA 上 \(n=3\) 到 **0.58**，默认 \(n=5\) 到 0.63，\(n=10\) 到 **0.65**，边际已经平。人把 \(n\) 拧大，只是人改了 \(I\)。

回传公式写在 §3.2：叶子得到奖励 \(r\) 之后，路径上每个 \(V(s)\) 更新成旧值按访问次数的加权平均，\(N\) 加一。下一轮 UCT 用的就是这套更新过的数。编程没有「模拟到终止」这一步，一个孩子已经是完整程序，\(r\) 直接是合成测试通过比例。HotPotQA 和 WebShop 才真正模拟到买成或答完。成功就停搜，所以高分任务上平均节点会少于「总是跑满 \(k\)」的对照——Table 10 的 66.65 已经把早停算进去了。把早停读成「模型学会了更快结束」，是把本题启发式当成了跨题技能。Table 3 的 LATS（ReAct）是 **0.63**，Table 10 在 \(k=50\) 那一行写成 **0.61**，差 0.02，花园两格都留，不拿 0.63 去改节点表，也不拿 0.61 去改主表。

## 2. 机制：六步 MCTS，记忆不出题

附录 Algorithm 1 把选、扩、估、模拟、回传、反思串起来，直到成功或采满 \(k\) 条轨迹。树显式存在外部结构里，作者写成 long-term memory；对花园来说它的寿命仍是本题。许多语言模型任务能靠重放历史文本回到任意前缀，所以不必像 AlphaGo 那样另训可逆环境模型。这是方法能跑的前提，也是局限：不能回退的环境，这套树建不起来。

HotPotQA 用 100 题子集、三条 few-shot。动作空间跟 ReAct：想法加搜索 / 检索 API。凡采样方法一律 \(k=50\)。ToT 用 DFS。作者另做「先 CoT，失败再切 ReAct」的 LATS（CoT+ReAct），接近人：自己会就答，不会再去翻工具。这是提示调度，不是改进器进了 \(S'\)。

编程评 HumanEval 全 **164** 题和 MBPP。部分对照只用了 161 题，作者写分数差很小，对照两套设定都报。动作是一条完整程序。观察来自模型自己写的合成测试（CodeT 那路，每题 4 条合法 assert）和编译器，**不是**隐藏金标测试。搜完取价值最高的解，再拿到真测试集上算 pass@1。\(k=8\)，展开 \(n=5\)。把搜索时的合成测试听成真测试，会把 92.7 读成已经看过标答。

WebShop：50 条指令，\(n=5\)，LATS / ReAct best-of-\(k\) / Reflexion 都是 \(k=30\)。动作是站点自带的 search / click。指标两个：均分（满足用户属性的比例）和成功率（全满足才算）。Game of 24 用 GPT-3.5、CoT 作底座，\(n=5\)，\(k=30\)，只为证明纯推理也能套这套价值函数，**不是**去复现 ToT 专文那 100 局 GPT-4。

![上排本题动作树被打分并交 y；下排基座、UCT 的 w、n 与 k、反思提示冻着](./images/fig-lats-frozen.png)

> 图 2：实线只更新本题树上的 \(N,V\) 和本题反思缓冲。虚线是冻着的 \(p_{\theta}\) 和搜索配方。

**图 2 解析**

- **会变**：本题节点、访问计数、\(V\)、失败反思、最后的 \(y\)。
- **冻 \(\theta\)**：GPT-3.5 或 GPT-4，论文不微调。
- **冻 \(I\)**：\(w=1\)、默认 \(n=5\)、各任务的 \(k\) 和 \(\lambda\)、UCT / 价值 / 反思提示。
- **门**：编程最后一跳是真测试；HotPotQA 搜的过程里就能看见对错真值；WebShop 看属性是否齐。
- **下一题**：树和反思不携带。这是 L0，不是漏写。

消融 Table 8，HotPotQA，ReAct 底座，\(n=5\)，\(k=50\)。去掉 LM 启发式只剩 **0.37**；改成带剪枝的 DFS **0.42**；去掉反思 **0.58**；完整 LATS（ReAct）**0.63**。反思只抬 0.05，小于 Reflexion 相对 ReAct 的 0.19，作者写成「能靠反思救的题和能靠搜索救的题有重叠」。没有 LM 分，外部反馈用不上。Table 9 在成功轨迹上数 token：ToT（ReAct）210,215，RAP 176,500，LATS **173,290**，样本复杂度都写成 \(O(kn)\)。Table 10 按 \(k=10/30/50\) 扫节点：LATS 在 \(k=50\) 时 EM **0.61**、成功平均 **66.65** 个节点；RAP 0.54 / 70.60；ToT 0.49 / 84.05。\(k=10\) 时 LATS 和 RAP 都是 0.44，节点 28.42 对 31.53。作者读成「成功得更早，更少撞到预算上限」。那是同一次任务里的效率，不是跨题学会了更省的搜法。ReAct best-of \(k=250\) 也只有 0.42，CoT-SC \(k=250\) 是 0.40，LATS 即便 \(n=1,k=50\) 也到 0.48——同一条链采样再多，补不回逐步岔路。

Table 1 把 CoT、ReAct、ToT、RAP、Self-Refine、束搜索、Reflexion、LATS 按推理 / 动作 / 规划 / 反思 / 外部记忆打勾。作者写 LATS 是第一份三块都接上的框架。花园读成 2024 年这篇的定位，不读成规划算法的首次应用：ToT 和 RAP 已经在搜，只是不接环境。ToT 那一行的反思勾，对应的是估价启发式，不是 Reflexion 那种失败句子。并发的 Liu 等（Reason for Future, Act for Now）也把搜索接到 Agent，作者写他们用的是现成搜索器，未必对语言模型最优。Huang 等「还不会自我纠正推理」被引来强调：没有墙外观察，价值函数容易在内部幻觉上打转。本篇的估价故意放在观察之后，就是冲着这句话。

## 3. 数字：92.7 贴着 Reflexion 91.0；24 点是另一只 GPT-3.5 表

Table 4，HumanEval pass@1。GPT-3.5：CoT 46.9，ReAct 56.9，Reflexion **68.1**，ToT 54.4，RAP 63.1，LATS **83.8**。GPT-4：裸模型 **80.1**，Reflexion **91.0**，LATS **92.7**。91.0 和 Reflexion 专文主表对齐，不要用 92.7 去改那篇，也不要把 1.7 个百分点写成「规划已经替代言语反思」。Table 5，GPT-3.5、MBPP：CoT 54.9，ReAct 67.0，Reflexion **70.0**，ToT 65.8，RAP 71.4，LATS **81.1**。Reflexion 专文 MBPP Python 会掉到 77.1 是另一套协议，禁止和 81.1 横加。

Table 2–3，GPT-3.5，HotPotQA EM，100 题。推理线：裸 0.32，CoT 0.34，CoT-SC 0.38，ToT 0.55，RAP 0.60（\(n=10\) 仍 0.60），LATS（CoT）**0.62**。动作线：ReAct 0.32，ReAct best-of-\(k\) 0.38，Reflexion **0.51**，ToT（ReAct）0.39，RAP（ReAct）0.54，LATS（ReAct）**0.63**，\(n=3\) 时 0.58，\(n=10\) 时 **0.65**，CoT+ReAct **0.71**。翻倍指的是 0.32 到 0.63 附近，不是 0.71。oracle 写在 §5.1：收到答案就给对错。这是「反馈质量很高」的对照，不是部署时的维基问答。ToT / RAP 套上 ReAct 反而掉到推理线以下，作者用来挡「搜法加工具等于免费涨分」。

Table 6，WebShop。ReAct 53.8 / 28.0，best-of-\(k\) 59.1 / 32.0，Reflexion 64.2 / 35.0，LATS **75.9 / 38.0**。IL 59.9 / 29.1，IL+RL 62.4 / 28.7，微调 67.5 / **45.0**，专家 82.1 / 59.6。摘要「均分 75.9，和基于梯度的微调相当」对的是分，不是成功率：成功率仍低于微调的 45.0。作者写 Reflexion 在这环境里的反思常太泛，容易卡在局部；同样 \(k=30\)，LATS 靠展开岔路抬均分。22.1 是 75.9−53.8，是**分**，不是相对涨幅。

Table 7，GPT-3.5，Game of 24 成功率。CoT **0.08**，Reflexion 0.12，ToT **0.20**，RAP 0.40，LATS（CoT）**0.44**。ToT 专文主表是 GPT-4、偏难 100 局、**74% 对 CoT 4%**。两套基座、两套实现，禁止用 0.44 改 74%，也禁止用 74% 来否定 0.20。作者把这边的优势写成价值函数里多了自洽项，不是「已经复现了 Yao 等的 74」。GPT-3.5 上 CoT 只有 0.08，ToT 专文 GPT-4 的 CoT 是 4.0%——连对照都不是一列。24 点在 LATS 里是「纯推理也能跑 MCTS」的存在性实验，样本量设定 \(k=30\)，不要当成新的 24 点榜。

编程搜索用的 4 条 assert 是模型写的，句法要求合法，对错仍可能和隐藏套件不一致。作者跟 CodeT：用这些合成测试当观察和回传，交卷后再走真测试。GPT-4 从 80.1 到 92.7，中间 Reflexion 已经 91.0，LATS 再吃的是树，不是另一套金标泄漏。GPT-3.5 上 83.8 对 Reflexion 68.1 缝更大，说明弱基座更吃逐步岔路；强基座上 1.7 个百分点就是边际。HumanEval 164 对部分对照 161，作者写几乎不动，花园不把 92.7 改写成 161 题协议。MBPP 81.1 对 RAP 71.4、Reflexion 70.0，ToT 65.8 甚至低于 ReAct 67.0——纯思维树在写代码上可以帮倒忙，观察进节点才是这条线的差。

## 4. 这不是术语式 (2)，反思也不是跨题 playbook

\(y\) 变好了，改进器没变。下一题的 \(w\)、\(n\)、\(k\)、反思提示还是人写的。混元 L0：好处和危害都随本题丢掉。不要用 92.7 给 [SEAL](../../2-Model层-训练时自改进/04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md) 的 LoRA 或 [DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 的自改 Python 背书，也不要用 0.71 去改 ToT 的 74%。局限节自己写：比 ReAct / Reflexion 贵；假定能回到更早的状态；节点数是性能和账单的旋钮。能回退在许多文本任务成立，不是普适物理世界。

和 [ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md) 钉死。那边 BFS / DFS，节点是思维，Game of 24 主表是 GPT-4 的 74%。这边 MCTS，节点带观察，24 点只作为 GPT-3.5 附录式对照 0.44。和 [Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) 钉死。两边都写失败句子。那边句子跨同一任务的若干整条 trial，AlfWorld 130/134，HumanEval 91.0。这边句子服务本题 MCTS 的后续展开，HumanEval 再抬到 92.7。91.0 仍是 Reflexion 专文的锚，92.7 是「同一 GPT-4 再加树」。Reflexion 专文的编程还有自写单测当 \(M_e\)；LATS 的合成 assert 也是模型写的，搜索信号同样可能和隐藏套件错位，最后一跳才用真测试。和 [PromptAgent](../26-PromptAgent-MCTS提示规划/26-PromptAgent-MCTS提示规划.md) 钉死。两边都叫 UCT。那边交卷是一条跨题指令，BBH 均 0.802；这边交卷是本题程序或购买，没有留下 \(H_t\)。公式编号不要撞：PromptAgent 的论文式 (1) 是提示空间 UCT，本篇论文式 (1) 是动作树 UCT，常数默认还不一样（\(c=2.5\) 对 \(w=1\)）。和 [CRITIC](../13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md) 钉死：那边工具检查当前稿，不长树；这边工具观察写进节点再 UCT。和 [Voyager](../10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md) 钉死：过门的 JavaScript 默认留在磁盘；本题反思默认不留。

现代骨干已经把不少 HotPotQA 事实装进权重，Table 2 裸模型 0.32 不是从零检索。作者写内部知识和外部检索两条线都能做，LATS（CoT+ReAct）把「会就答、不会再翻」叠起来才到 0.71。这叠的是两份人写提示的切换规则，下一题切换规则不变。WebShop 的 1.18M 商品、12k 指令是环境规模，本实验只评 50 条。专家 59.6% 成功率还在，38.0 没有摸到人。微调列成功率更高、均分更低，两套指标不要收成一句「已经超过训练」。

[可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md) 的 L0 原句仍然够用。HotPotQA 的 oracle 说明：墙外对错一旦在搜索中可见，EM 可以到 0.71；这不证明改进器升级了，只证明本题里的门很松。WebShop 成功率 38.0 对微调 45.0，说明均分 75.9 不能单独当「已经超过训练」。对有大模型基础的读者，读完应能回答四句。改的是哪一层？本题动作树和本题反思缓冲，L0。权重动了没有？没有。92.7 能不能当 Agent 自进化？不能，树和句子随题清空。还缺什么才叫花园 RSI？\(n\)、\(w\) 或反思提示进入 \(S'\)，并且下一题的改进器用的就是升级后的那份。

## 5. 树加句子的寿命，仍短过函数和权重

同一句话「Agent 在规划」，至少有五段寿命。LATS 的节点和反思活过本题的 \(k\) 次轨迹。ToT 的思维活过本题的 \(T\) 步。Reflexion 的 \(sr\) 活过同一任务的若干 trial。PromptAgent 的 \(\mathcal{P}\) 活过一类测试题。Voyager 的函数默认留在磁盘。把五段收成「都在自我进化」，HotPotQA 的 oracle 和 WebShop 的成功率会对不上。

人把 \(n\) 从 5 改到 10，HotPotQA 从 0.63 到 0.65，只是人改了 \(I\)。模型改不了 UCT 公式，也改不了「失败才反思」。合成测试由模型生成，搜索信号可以和真测试错位——pass@1 仍以隐藏套件为准，这是诚实处。不能回退就不能建树，作者写在局限里；花园不把「文本任务能重放前缀」听成已经覆盖机器人。未来方向写更复杂环境、多智能体、降成本，没有一张表证明 \(w\) 或反思提示被下一题接着改。安全段写：更会做决定也可能更好使坏；高层语言轨迹比纯自回归更好读，也更好对齐。这是影响陈述，不是评测。

WebShop 反思太泛、卡在局部，是 Reflexion 专文已经见过的病：句子看起来像教训，环境状态却几乎没变。LATS 不靠把句子写得更狠，靠的是同一层采 \(n\) 个 click / search 再按 UCT 走。均分 75.9 说明属性对上得更多；成功率 38.0 说明「全对才买成」仍难。50 条指令不是 12k 全库。和 Voyager 的 63 种物品一样，样本切片决定海报数字，不要外推到整站购物。

**读**：HumanEval 92.7 / 91.0 / 80.1、GPT-3.5 的 83.8、MBPP 81.1、HotPotQA oracle 与 0.63 / 0.71、ToT（ReAct）0.39 低于纯推理 ToT 0.55、WebShop 75.9 分对成功率 38.0、22.1 是分差、Table 7 的 GPT-3.5 0.44 对 ToT 专文 74%、\(\lambda\) 两档、\(w=1\)、L0。  
**不读**：用 92.7 改 Reflexion 专文的 91.0、用 0.44 改 ToT 的 74%、用 0.71 当非 oracle 维基问答、用 75.9 盖成功率 38.0、把 22.1 当分点相对涨幅、说记忆已经跨题、把 PromptAgent 的 \(c=2.5\) 写进本篇、说已经 RSI。

同层：[27 ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md)、[11 Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md)、[12 Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)、[26 PromptAgent](../26-PromptAgent-MCTS提示规划/26-PromptAgent-MCTS提示规划.md)、[10 Voyager](../10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[30 RAP](../30-RAP-世界模型规划/30-RAP-世界模型规划.md)、[31 GoT](../31-GoT-思维图聚合/31-GoT-思维图聚合.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Zhou, A., Yan, K., Shlapentokh-Rothman, M., Wang, H., & Wang, Y.-X. (2024). [Language Agent Tree Search Unifies Reasoning, Acting, and Planning in Language Models](https://arxiv.org/abs/2310.04406). ICLR 2024. arXiv:2310.04406. Table 2–10、§5.1 oracle 以 HTML 为准。
2. 代码：[lapisrocks/LanguageAgentTreeSearch](https://github.com/lapisrocks/LanguageAgentTreeSearch)。
3. 本花园：[ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md)；[Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md)；[PromptAgent](../26-PromptAgent-MCTS提示规划/26-PromptAgent-MCTS提示规划.md)。
