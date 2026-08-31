---
title: "11 · Reflexion：言语记忆不是权重"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Shinn 等把失败轨迹写成第一人称反思，塞进滑动窗口。
  AlfWorld 130/134，HumanEval Python 91.0，MBPP Python 反而 77.1。
  θ 冻着。mem 是 H_t，不是式 (2)。
tags:
  - RSI
  - Reflexion
  - verbal RL
  - episodic memory
  - Harness
---

# 11 Reflexion：反思留下句子，模型不改

Agent 做砸一次，自己写一段「下次别先找杯子再找台灯」，下一轮把这段读进去，成功率涨了。论文把这件事叫做 verbal reinforcement learning，并把策略参数化成「LLM 参数 + 记忆编码」。听成权重在学，就和花园式 (2) 撞车。[Voyager](../10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md) 把它当更浅的邻居：留下的是自然语言，不是可执行函数。[Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) 把它当「弱任务奖励当门」的前史。本篇把尺子摊开。

本篇是 Harness 层里「言语情景记忆」的样板。[Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) 在单次生成里自评自改，没有跨 trial 的持久 `mem`。[ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) 当 Actor，本身不写反思。ACE 的 playbook 是条目化长期上下文；这里的 `mem` 默认只留 1–3 条，滑动窗口。**不是** RSI：Actor / 反思提示 / 窗口长度都不进 $S'$。**不是** 用梯度更新 $\pi_\theta$。一手：Shinn, Cassano, Berman, Gopinath, Narasimhan, Yao，[arXiv:2303.11366](https://arxiv.org/abs/2303.11366)；代码 [noahshinn024/reflexion](https://github.com/noahshinn024/reflexion)。数字以 HTML Table 1–5、§4、附录 B.1 为准。

## 1. 问题：trial-and-error 太贵，上下文又太短

传统 RL 要大量样本和微调。LLM Agent 通常只靠 in-context 例子，失败了就再采样，轨迹里的错不会被蒸馏成「下次可用的句子」。Reflexion 要的是：环境给一个稀疏信号（对/错、启发式、自写单测），Self-Reflection 模型把它放大成一段第一人称经验，追加进 `mem`，Actor 下一 trial 带着 `mem` 再跑。论文原句：not by updating weights, but instead through linguistic feedback。

$S$ 取这一次部署：冻结的 $M_a$（Actor）、$M_e$（Evaluator）、$M_{sr}$（Self-Reflection），外加有上限的 `mem`。$I$ 是那套提示、窗口 $\Omega$、启发式或单测流程。单轮 $S'=I(S)$：`mem` 多了一段 $sr_t$。式 (2) 还要 $I'\subseteq S'$。下一轮出反思的仍是同一份 $M_{sr}$ 提示，判分的仍是同一套 $M_e$。`mem` 是 $H_t$。

论文把策略写成 $\theta=\{M_a,\mathrm{mem}\}$。这是口号上的「参数」，不是反向传播的 $\theta$。$M_a$ 冻着，变的只有窗口里的句子。不要把这句听成混元 L1。

和邻居先划线。Self-Refine 在给定约束下改这一代文本，相关工作表里 Memory 一列打叉。Voyager 提交 JavaScript。ACE 追加 playbook 条目，合并是非 LLM 代码。Argus 要独立审计才入库。Reflexion 的门是 $M_e$：AlfWorld 上是人手写启发式或另一只 LLM 分类器，编程上是自写单测，HotPotQA 上是 exact match。门和生成器可以是同一类模型，只是提示不同。

![Actor 出轨迹，Evaluator 打分，Self-Reflection 写句子，追加进有上限的 mem](./images/fig-reflexion-loop.png)

> 图 1：实线是这一 trial。虚线是下一 trial 读 `mem`。窗口满了就滑掉旧句子。

**图 1 解析**

- **Actor $M_a$**：CoT 或 ReAct，条件是当前观察 + 短时轨迹 + `mem`。
- **Evaluator $M_e$**：标量 $r_t$。环境二元信号、启发式、LLM 分类、自写单测，四选一或组合。
- **Self-Reflection $M_{sr}$**：把 $\{\tau_t,r_t\}$ 写成 $sr_t$。
- **mem**：追加 $sr_t$，容量 $\Omega$ 通常 1–3，为了不超过上下文。

## 2. 机制：三个模型，一条滑动窗口

算法 1 可以收成：用 $\pi_\theta$ 生成 $\tau_0$， $M_e$ 打分， $M_{sr}$ 写出 $sr_0$ 放进 `mem`；然后 while 未过门且未到 max trials：再生成、再打分、再写反思、再追加。返回的是最后一条轨迹，不是新权重。

短时记忆是本 trial 的动作–观察历史。长时记忆是 $sr$ 的列表。Actor 同时读两份。这是论文相对「只靠当前轨迹重试」的差：蒸馏过的句子比整段失败日志短，也比温度 0.7 再滚一次更有指向。HotPotQA 消融把「只把最近一条轨迹塞回去」（EPM）和「再加第一人称反思」拆开：反思相对纯情景记忆再绝对 +8%。纯重放轨迹不如写教训。

Evaluator 因任务而变，必须分开记，否则 91.0 和 77.1 会对不上。

AlfWorld 环境只在任务完成时给信号。要全自动，作者做了两套自评价：LLM 自然语言分类，以及一条启发式——同一动作同一回复超过 3 个循环，或本环境动作数超过 30，就触发反思。基线跑里若建议反思，就**跳过反思**、重置环境、开新 trial。Reflexion 跑里才写 $sr$、更新 `mem`、再重置。AlfWorld 的 `mem` 截到最近 3 条。Actor 用和 Yao 等相同的两条 few-shot 轨迹，LLM 是 GPT-3。

HotPotQA 在 trial 之间用 exact match 给二元对错。这是墙外的金答案在给奖励，不是模型自判对错。`mem` 大小 3。失败题允许重试，直到同一题连续 3 次失败。CoT 6-shot，ReAct 与反思 2-shot。CoT (GT) 把数据集里的金上下文 $C_{gt}$ 直接给模型，用来隔离「长文推理」；ReAct 走 Wikipedia API，测检索加推理。

编程把 $M_e$ 换成自写单测。CoT 出带自然语言说明的测试，AST 滤句法合法的，最多采样 $n=6$ 条组成 $T$。隐藏测试仍只在最终 pass@1 时用，所以作者声称这条实现仍有资格报 pass@1。编程的 `mem` 上限是 **1** 条经验。假阴性（单测杀对了的解）作者宁可要：反思还可能保住原实现。假阳性（单测放过错解）会提前交卷，来不及改。

局限按原文。策略优化会停在局部极小。WebShop 100 个购物请求、两-shot ReAct + Reflexion，四 trial 看不出涨，反思写不出有用句子，实验停掉。作者的判断：需要大量多样探索时，Reflexion 解不了；AlfWorld 的可行动作写在观察里，HotPotQA 的维基搜索空间更宽、查询也不必那么精确，电商搜索的歧义更狠。长期记忆只做滑动窗口，未来工作才写向量库或 SQL——那正是后来 Voyager / ACE 走的方向，本实验没有走。

无视觉、无改权重。starchat-beta 在 HumanEval Python 上 Baseline 与 Reflexion 都是 0.26（8 次平均），附录写自我纠正是更强更大模型的涌现。弱基座上，言语 RL 加不成。

一轮可以写成：Actor 带着 few-shot 和 `mem` 在 AlfWorld 里走；同一动作同一回复超过三圈，或步数过 30，启发式喊停。基线把这次失败丢掉、重置房间、再开一局。Reflexion 先让 $M_{sr}$ 把长轨迹收成几句「我以为手里有东西」「应该先找台灯」，推进窗口，再重置房间。房间新、句子还在。这是 $H_t$ 跨 trial 留下，环境状态不留——和 [SEAL](../../2-Model层-训练时自改进/04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md) 答完一道把 LoRA 滚回去正好相反：那边改过的是 $\theta$ 的一小片且会回滚，这边 $\theta$ 没动、句子留下。

相关工作表把 Self-Refine 的 Memory 列打叉，把 Reflexion 的 Memory 列打勾。差别不是「会不会自评」，是自评的句子会不会成为下一 trial 的条件。Beam search、重试固定步数、没有评价的 retry，都停在这一代轨迹里。编程表把 AlphaCode / CodeT / Self-Debugging / CodeRL 和 Reflexion 拆开：前几家要么看隐藏测试（破坏 pass@1），要么有执行反馈但不写自我反思。Reflexion 要自写单测加反思，声称仍报 pass@1。MBPP 的 FP 说明这张资格证绑在单测质量上，不是绑在「写了反思」上。

Brooks 等的 in-context policy iteration 被写成 Actor 加 `mem` 的灵感。传统策略迭代改的是 $\pi$ 的参数；这里改的是提示里多出来的几句话。论文把 $\theta=\{M_a,\mathrm{mem}\}$ 写进公式，是为了让「言语 RL」听起来像策略优化。花园读法：$\mathrm{mem}$ 进 $H_t$，$M_a$ 仍在墙外。信用分配也停在句子里——$M_{sr}$ 要猜 $a_i$ 连累了后面两步——没有形式保证，作者自己写在引言。

## 3. 数字：91.0 会涨，77.1 会掉，两个 22% 不要混

AlfWorld：134 个环境、六类家务。ReAct + Reflexion 用启发式完成 **130 / 134**，12 个连续 trial 里还能多解几道。ReAct-only 在 trial 6–7 涨势停住。摘要写相对强基线绝对 **+22%**。正文没有把 ReAct 的成功题数写成一张表，本篇不反推 130 减去多少等于 22 个百分点。分析里另一句 22%：ReAct-only 收敛在 **22% 幻觉率**（以为手里有东西其实没有），没有长期恢复。两个 22% 不是同一格。附录例子：任务是 examine the mug with the desklamp，trial 1 先找杯子再找灯，灯就在 desk 1 上却走丢；反思写成应先找灯；trial 2 在 desk 1 拿杯开灯成功。这是 $H_t$ 里多了一段计划，不是 $\theta$ 变了。

HotPotQA：100 题。只重采样（温度 0.7）解不出第一 trial 失败的题。CoT (GT) 仍有 39% 推不出，Reflexion 在**不给金答案**的情况下把准确率再抬 **14%**。附录 Table 5：

| 设定 | Baseline | Reflexion |
|------|---------:|----------:|
| CoT (GT) + text-davinci-003 | 0.60 | 0.77 |
| CoT (GT) + gpt-3.5-turbo | 0.57 | 0.71 |
| CoT (GT) + gpt-4 | 0.68 | 0.80 |
| ReAct + text-davinci-003 | 0.30 | 0.55 |
| ReAct + gpt-3.5-turbo | 0.26 | 0.38 |
| ReAct + gpt-4 | 0.39 | 0.51 |

摘要 +20% 是相对强基线的总述。分格以 Table 5 为准：davinci 的 ReAct 0.30→0.55 最大，gpt-4 的 ReAct 只 +0.12。不要拿 0.80 的 CoT (GT) 去和 AlfWorld 的 130/134 横加。

编程 Table 1（pass@1，基线是单次生成）：

| 基准 | 当时 SOTA | Reflexion |
|------|----------:|----------:|
| HumanEval Python | 80.1 (GPT-4) | **91.0** |
| HumanEval Rust | 60.0 (GPT-4) | **68.0** |
| MBPP Python | 80.1 (GPT-4) | **77.1** |
| MBPP Rust | 70.9 (GPT-4) | **75.4** |
| Leetcode Hard Python | 7.5 (GPT-4) | **15.0** |

HumanEval Python +10.9，和摘要「as much as 11%」对齐。MBPP Python **掉了**。Table 2 把原因钉在假阳性：内部单测全过但隐藏测试不过。HumanEval Python 的 FP 约 **1.4%**（表上 0.01），MBPP Python **16.3%**（表上 0.16）。基线 pass@1 两边都在八成附近，单测质量差就把反思循环提前交卷。Rust HumanEval 是 Python 最难 50 题经 MultiPL-E 翻译；消融 Table 3：去掉单测只留反思 **0.52 < 0.60**，有单测无反思停在 0.60，两样都要才 0.68。没有执行器的「自己想哪错了」会改坏代码。LeetcodeHardGym：40 道 2022-10-08 之后的 Hard，赶在 GPT-4 预训练截止日后面，15.0 仍很低。

![上排 mem 在追加反思；下排 Actor、窗口 Ω、few-shot 与启发式仍在墙外](./images/fig-reflexion-frozen.png)

> 图 2：实线只更新 $H_t$。虚线是冻着的改进器零件。

**图 2 解析**

- **会变**：`mem` 里最近 1–3 条 $sr$。
- **冻 $M_a$**：GPT-3 / GPT-4 / davinci，论文明确不微调。
- **冻 $I$**：$\Omega$、3 次循环启发式、30 步帽、单测 $n\le 6$、few-shot。
- **墙外考官**：HotPotQA 的 EM、HumanEval 隐藏测试。自写单测在墙内，会制造 FP。

## 4. 言语 RL 不是式 (2)

$H_t$ 变了，下一 trial 的 Actor 读得到「先找台灯」。单轮成立。改进器——反思提示、$M_e$ 的规则、窗口长度——下一轮还是同一份。换一道 WebShop 题，旧反思帮不上，四 trial 还是停。这和 [SPIN](../../2-Model层-训练时自改进/01-SPIN-自对弈微调/01-SPIN-自对弈微调.md) 改 $\theta$ 不是一层；和 [DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 改自己的 Python 也不是一层。混元台阶上最多蹭 L2 的「留下状态」，门还在自评或启发式里，比 Argus 浅。

和同层钉死。[Voyager](../10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md) 的值是函数，检索走嵌入；Reflexion 的值是句子，检索走「窗口里最新几条」。Voyager 对照里 ReAct / Reflexion 在开放探索上几乎走不动——那边目标太抽象，这边 AlfWorld 的可行动作写在观察里。[ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md) 诊断过 Reflexion 一类自然语言反馈：上下文会越改越长、越吵。Reflexion 用 $\Omega$ 硬切，吵得少，也记不久。[SkillEvolver](../08-SkillEvolver-元技能/08-SkillEvolver-元技能.md) 要把教训写成另一只 Agent 读得懂的文件；这里教训留在当前会话的 `mem`，换一次 reset 就只剩窗口里那几句。[Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) 连窗口都可以没有，只改这一代文本。

[SEAGym](../../6-评测与安全/03-SEAGym-Harness评测环境/03-SEAGym-Harness评测环境.md) 冻 $M$ 测 $H_t$ 的 OOD。Reflexion 的 WebShop 是作者自己做的「换任务就不涨」；不是 Harbor 协议，数字不能和 AHE 横加。[System Card](../../6-评测与安全/04-System-Card-RSI/04-System-Card-RSI.md) 的 RSI Index 更不是 91.0 能证明的。HotPotQA 用金答案 EM 给重试信号：这是墙外 oracle 在喂循环，不是模型发明了自我监督。编程用自写单测喂循环：oracle 弱了，MBPP 就会掉。

代码必须隔离执行，论文自己写 generated code is not validated before execution。这是安全句，不是机制句。

AlfWorld 的 Fig. 3 还画了启发式和 GPT 分类两条自评价曲线。主文强调启发式那条走到 130/134。GPT 分类器是另一只 LLM 当 $M_e$，幻觉检测不再是「三圈重复」，而是模型自己说这步像不像完成。两条门都还在人设的脚手架里：换一条启发式、换一个分类提示，学习曲线会跟着变。基线故意在建议反思时跳过反思，是为了把「多 trial 重采样」和「多 trial 加句子」拆开。ReAct-only 在 6–7 trial 停住，说明再滚温度不够；Reflexion 能爬到近满分，靠的是窗口里的计划，不是 GPT-3 突然会了新权重。

Fig. 3(b) 把失败分成幻觉和低效规划。反思要干的就是把这两类收成短句。附录那盏台灯是低效规划：计划顺序错了，灯其实早就看见。幻觉是以为背包里有钥匙去开门。作者说 Reflexion 几乎消掉后一类。消掉的方式是下一 trial 读到「我没有那件东西」，不是环境改了物理。WebShop 需要的探索更野：可行动作不写在观察里，搜索词要准。四 trial 写不出有用句子，作者直接停。这比「再训 12 步」更说明 $I$ 没升级——同一套反思提示，换搜索空间就失效。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Harness，滑动窗口里的反思。权重动了没有？没有。HumanEval 91.0 能不能当 RSI 证书？不能，而且 MBPP Python 会掉。还缺什么才叫花园 RSI？写反思的提示或判分规则进入 $S'$，并且下一轮改进器就是升级后的那份——目前是人在设 $\Omega$ 和启发式。

## 5. 留下句子，还是留下程序，还是留下权重

ReAct 的 think 也是自然语言，但那句话活在当前轨迹里，trial 结束就随重置丢掉。Reflexion 把同类句子搬进 `mem`，让下一 trial 的 ReAct 还能读到。差不在「会不会 think」，在 think 的寿命。Voyager 再往前一步：寿命更长的是函数，换世界还能检索。ACE 的寿命在 playbook 文件。SPIN / STaR 的寿命在 checkpoint。四条寿命不要收成「都在自我进化」。

Table 2 的 TP / FN / FP / TN 是读 91.0 和 77.1 的钥匙。HumanEval Python：内部单测过且真过的条件概率 0.99，FP 0.01，所以提前交卷几乎安全。MBPP Python：FP 0.16，TN 0.41，单测经常同时放过错解、杀掉正解。反思循环看见的是「测试失败，去改代码」，有时改的是对的实现。Rust 消融把执行器拿掉，准确率掉到基线以下，说明 $M_{sr}$ 没有独立看见对错的能力，它放大的是 $M_e$ 送来的那根信号。信号脏，句子也脏。HotPotQA 的 EM 很干净，所以 Table 5 能涨；干净来自金答案，不是来自反思文笔。

LeetcodeHardGym 40 题卡在 GPT-4 截止日之后，15.0 对 7.5 是翻倍，绝对值仍低。作者要的是「没见过的题上，反思还能不能帮」；帮一点，远不到 HumanEval 那种 91。不要用 91.0 外推竞赛题。starchat-beta 的 0.26=0.26 是另一端：基座写不出可执行的自我纠正，窗口加句子等于没加。附录原句：specify self-corrections is an emergent quality of stronger, larger models。花园对应的判断：Harness 技巧绑在 $M$ 的能力上，冻着的 $M$ 太弱，$H_t$ 涨了也没用。

[STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md) / [Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md) 动的是改进器源码或策略对象。Reflexion 的 Python 仓库人写完就冻着，Agent 只往 `mem` 里追加字符串。同层里它是最浅的那一格：不改文件、不改权重、不改提示模板。浅不是没用。AlfWorld 130/134 说明浅脚手架在可行动作可见时非常强。WebShop 说明同一套浅脚手架在搜索空间一换就停。读新闻时先问留下的是句子、函数还是权重，再问门是启发式、自写单测还是隐藏测试。

局限节把局部极小写进正文：策略优化仍可能停在非最优。滑动窗口是为了上下文长度，不是为了检索。作者鼓励换成向量库或 SQL，那正是 Voyager 后来做的索引，本实验的 `mem` 没有相似度查询，只有「最新几条」。换任务时旧句子可能变成误导——台灯那条只在同一房间结构里有用。这是情景记忆的代价，也是它不是改进器的证据：改进器若升级了，应能改「怎么写反思、留哪几条」；这里留下的永远是内容，规则是人钉的 $\Omega$。

可复现性附录要求隔离执行环境。自写单测要跑模型刚生成的代码，没有先验校验。这和花园第 6 章「证据在更新边界外」是同一方向的弱形式：隐藏测试仍在墙外，内部 $T$ 在墙内。HumanEval 的隐藏测试救了 91.0；MBPP 的内部 $T$ 把 80.1 拉到 77.1。读 pass@1 先问交卷时看的是哪套测试。

**读**：三个模型、$\Omega$ 1–3、AlfWorld 130/134 与 12 trial、两个 22% 要拆开、Table 5 分格、HumanEval 91.0 / MBPP 77.1 / FP 16.3%、Rust 消融 0.52、starchat-beta 0.26=0.26、WebShop 四 trial 停、think 的寿命、Table 2 的 FP。  
**不读**：把 verbal RL 听成改权重、用 91.0 盖掉 77.1、把摘要 +22% 和幻觉率 22% 收成一个数、把 Self-Refine 和 Reflexion 当成同一篇、用 Voyager 的 0/3 给本篇 AlfWorld 背书、把 $\theta=\{M_a,\mathrm{mem}\}$ 写成已经 L3、用 15.0 说已经会做竞赛 Hard。

同层：[10 Voyager](../10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md)、[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)、[09 ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)、[32 ExpeL](../32-ExpeL-跨题经验洞察/32-ExpeL-跨题经验洞察.md)、[33 Dynamic Cheatsheet](../33-Dynamic-Cheatsheet-测试时备忘录/33-Dynamic-Cheatsheet-测试时备忘录.md)、[35 AWM](../35-AWM-工作流记忆/35-AWM-工作流记忆.md)、[36 MemGPT](../36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md)、[37 A-Mem](../37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md)、[28 LATS](../28-LATS-Agent树搜/28-LATS-Agent树搜.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[44 GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)、[55 RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md)。判定：[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。读完应能把「verbal RL」翻译成：冻结的 Actor，加上窗口里几句失败总结，门是启发式或自写单测，金答案和隐藏测试仍在墙外。句子会涨，改进器不会。窗口一滑，最早那句台灯计划也会丢，这和权重里的技能不是同一类寿命。Voyager 的函数默认留在磁盘上；Reflexion 的句子默认活不过三次追加。三次是 $\Omega$ 的常取值，不是模型学出来的遗忘曲线。人改窗口大小，等于人改记忆政策。Agent 改不了这条政策，也改不了 few-shot 里那两条 AlfWorld 示范轨迹。示范轨迹来自 Yao 等的 ReAct 原文，本篇不重抄。

## 参考文献

1. Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S. (2023). [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366). arXiv:2303.11366. Table 1–5 与附录 B.1 以 HTML 为准。
2. 代码：[noahshinn024/reflexion](https://github.com/noahshinn024/reflexion)。
3. 本花园：[Voyager](../10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md)；[Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)；[ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)。
