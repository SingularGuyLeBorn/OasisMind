---
title: "29 · ReAct：想一步做一步，跨题清空"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Yao 等让冻结的 PaLM 交错生成想法和动作。AlfWorld 最好 71% 对 BUTLER 37%。
  HotpotQA 上 ReAct 27.4 低于 CoT 29.4。轨迹随题清空。混元 L0。不是术语式 (2)。
tags:
  - RSI
  - ReAct
  - L0
  - test-time
  - Harness
---

# 29 ReAct：想一步做一步，跨题清空

摘要写 AlfWorld 上比模仿 / 强化学习绝对高 **34%**，WebShop 高 **10%**，提示只要一两条。打开 Table 3：PaLM-540B 的 ReAct 最好一档 **71%**，Act-only **45%**，BUTLER **37%**，71−37=34。Table 4 成功率 **40.0** 对 IL+RL **28.7**，大约十个点。同一张 Table 1，HotpotQA 的 ReAct **27.4** 还低于 CoT 的 **29.4**，只高于 Act 的 **25.7**。会检索不等于这题答对。人把「边想边做」听成自我进化，缺的是：想法不改环境，权重冻着，题换了轨迹清空。

本篇是 Harness 里最浅的那一格 Agent 循环：[ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md) 在本题思维上长树，不接环境；[LATS](../28-LATS-Agent树搜/28-LATS-Agent树搜.md) 把这条循环扩成 MCTS；[Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) 把失败写成下一 trial 还能读的句子。这边只有一条交错的想–做–看，没有树，没有跨 trial 的 `mem`。[CRITIC](../13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md) 后来把工具检查接进批评；本篇的维基 API 只服务本题检索。**不是** RSI。**不是** 改 \(\theta\)。**不是** 术语式 (2)。一手：Yao, Zhao, Yu, Du, Shafran, Narasimhan, Cao，Princeton / Google Research Brain，[arXiv:2210.03629](https://arxiv.org/abs/2210.03629)，ICLR 2023。项目页 [react-lm.github.io](https://react-lm.github.io/)。数字以 HTML Table 1–5、Figure 3、§3–4、附录 A.1 为准。主实验是冻结的 PaLM-540B。附录 GPT-3（text-davinci-002）HotpotQA 500 题子集 **30.8**、AlfWorld **78.4**，不要拿去改 Table 1 的 27.4 和 Table 3 的 71。

## 1. 问题：只想会编，只做会盲

CoT 在模型内部把中间步骤写成独白，事实对不对没有墙外检查，错了就顺着编。只预测动作的策略（WebGPT 一类、Inner Monologue 的稠密状态反馈）能摸环境，却缺少「现在该拆哪一步、东西大概在哪」的高层句子。作者用厨房作比方：切完菜要想该烧水，没有盐要想用酱油，不会做面团要去搜。ReAct 把动作空间扩成 \(\hat{\mathcal{A}}=\mathcal{A}\cup\mathcal{L}\)。\(\mathcal{L}\) 里的想法不改环境、没有观察返回，只改上下文 \(c_{t+1}=(c_t,\hat{a}_t)\)，给以后的想或做当工作记忆。真正进环境的是 \(\mathcal{A}\)：HotpotQA / FEVER 上是 search / lookup / finish，AlfWorld 是 go to / take / use，WebShop 是 search / click / buy。

\(S\) 取「当前这道题的交错轨迹」。单轮 \(S'=I(S)\) 可以发生：多一步 thought-action-observation。术语式 (2) 还要 \(I'\subseteq S'\)。下一道独立题仍用同一份 few-shot 人手轨迹、同一只冻结 PaLM、同一套 API。混元 L0：改 \((\text{输出},\text{轨迹})\)，保留的 Agent 状态跨独立任务不变。可靠性专文把工具循环仍不跨题保持的方法放在 L0，本篇是那一格的底座。

和邻居先划线。CoT 去掉动作和观察。Act-only 去掉想法，作者写成松散像 WebGPT，但任务和动作空间都不同，也不是 RL。Inner Monologue 的独白主要是环境状态和还缺哪步，AlfWorld 消融 ReAct-IM 最好 **53%**，低于 ReAct 的 **71%**。Reflexion 用本方法当 Actor，另外写 `mem`。LATS 用本方法当底座，另外走 UCT。ToT 不接维基。PromptAgent 搜的是跨题提示。不要把后来的树、窗口、playbook 写回 2022 年这篇。[ReTool](../../2-Model层-训练时自改进/08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 的交错也是想、写代码、看解释器，但权重会被 PPO 推过，AIME2024 67.0 不要改 Table 3 的 71%。[ToolRL](../../2-Model层-训练时自改进/09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) 是多 API 的 GRPO，3B BFCL 52.98 不要改这边的 71。

![想法 L、动作 A、环境观察、本题输出；实线只在本题内转](./images/fig-react-loop.png)

> 图 1：实线是本题内的想、做、看。回到 thought 的是还没交卷的上下文。题换了，环断开。

**图 1 解析**

- **thought L**：不碰环境。拆目标、抽观察、常识、改计划、处理例外。问答任务想得密，决策任务想得稀，由模型自己决定何时插入。
- **action A**：search[entity]、lookup[string]、finish[answer]，或家务 / 购物命令。
- **env observe**：维基前五句或 Ctrl+F 下一句；AlfWorld 房间描述；商品页。
- **this-task output y**：finish 的答案，或买成 / 做完家务。没有跨题缓冲。

QA 用 6 条（HotpotQA）或 3 条（FEVER）人手轨迹当 few-shot，作者写再加例子分数不动。AlfWorld 每类任务三条，再把其中两条做 6 种排列测稳健。WebShop 一-shot。示范格式固定成 Thought: / Action: 两行交替，观察由环境塞回。模型不会自己发明第三种标签；人写提示时就把这两行钉死。HotpotQA 的 6 条示范覆盖多跳拆问和改查询，FEVER 的 3 条覆盖 SUPPORTS / REFUTES / NOT ENOUGH INFO。再加同类例子作者写分数不动，所以缺的不是「少写了两条」，是这条配方到此为止。

## 2. 机制：交错生成，配方冻着

主设定：冻结 PaLM-540B，贪心解码，few-shot。策略 \(\pi(a_t\mid c_t)\)，\(c_t\) 是观察到目前的交错历史。学习这个映射很难，所以作者不训策略，只提示。想法的空间无限，要靠大模型的语言先验。决策任务步数可以超过 50，专家也要 50 多步，所以想法必须能拆子目标、追踪进度、用常识猜物品在哪。

HotpotQA / FEVER 是 question-only：不给支持段落，模型要么用内部知识，要么经 API 去翻。API 故意弱：search 只回条目页前五句，找不到就建议五个相近实体；lookup 模拟浏览器查找。作者写这是为了像人翻维基，也逼模型用句子决定下一查什么，不是上神经检索器。finish 交卷。步数帽 HotpotQA **7**、FEVER **5**，再长几乎不涨：正确轨迹里达到帽的只占 0.84% / 1.33%。想法在问答里用来拆「先搜 x 再找 y」、从观察里抽「x 始于 1844」、做常识或算术、改写查询、合成答案。决策任务里想法更稀：拆目标、标记子目标完成、决定下一个子目标、用常识猜灯在桌上。两种密度都是人在示范里写出来的，模型只是接着生成。

组合内部和外部知识有两套启发式。ReAct \(\to\) CoT-SC：ReAct 在步数内交不出答案，退回对 CoT 采 21 次再多数票。CoT-SC \(\to\) ReAct：21 票里多数派不到半数，认为内部知识不稳，改走 ReAct。温度 0.7。这是人钉的切换规则，下一题原样再走。Figure 2 扫 CoT-SC 的样本数：组合方法用 3–5 个样本就能摸到 CoT-SC 用 21 个样本的分。花园不手抄柱高，只取方向——内部投票加外部检索，不是把 21 改成「模型学会了何时搜」。

微调是另一条实验，不是主方法。用 ReAct（以及其他对照）生成的 **3000** 条答对轨迹，bootstrap 微调 PaLM-8B / 62B，条件是题目，解码整条轨迹。像 STaR 那样只留对的。附录 B.1：batch 64；8B 上 ReAct / Act 训 4000 步，Standard / CoT 训 2000 步；62B 上 ReAct / Act 4000 步，Standard / CoT 1000 步。作者写 ReAct / Act 更吃步数和数据，Standard / CoT 微调很快就掉。Figure 3：提示设定下 8B / 62B 的 ReAct 在四法里最差，因为少样本要同时学会想和做；3000 条微调之后 ReAct 变成最好，8B 微调超过所有 62B 提示，62B 微调超过所有 540B 提示。Standard / CoT 微调显著更差：前者在背可能幻觉的事实，后者在教怎么（想着）去维基拿信息。花园读成：主文的 L0 是冻结提示；这条微调实验改了 \(\theta\)，改进器仍是人设的 bootstrap 流程，3000 条滤对的规则不进 \(S'\)。不要用 Figure 3 的微调柱去改 Table 1 的提示格，也不要把 8B 微调听成已经 RSI。滤对的规则是人钉的，下一轮收集轨迹仍用同一套「只留答对的」。

![上排本题交错轨迹交 y；下排 PaLM、few-shot 轨迹、维基 API、环境动作冻着](./images/fig-react-frozen.png)

> 图 2：实线只更新本题上下文。虚线是冻着的 \(p_{\theta}\) 和人写示范。

**图 2 解析**

- **会变**：本题的 thought / action / observation 串和最后的 \(y\)。
- **冻 \(\theta\)**：PaLM-540B；附录 GPT-3 也不在主表里训。
- **冻 \(I\)**：few-shot 人手轨迹、API 三个动作、步数帽、何时切 CoT-SC。
- **门**：HotpotQA 是 EM，FEVER 是三分类准确率，AlfWorld / WebShop 是环境成功。维基 API 不是金标段落。
- **下一题**：轨迹不携带。这是 L0 的定义，不是漏写。

相关工作把 CoT、least-to-most、零样本 CoT、自洽、Selection-Inference、Scratchpad 写成「只在内部推理」；把 WebGPT、BlenderBot、Sparrow、SayCan、Inner Monologue 写成「会做决定但不显式建模想」。WebGPT 用真人反馈做 RL，本篇 few-shot 便宜得多。SayCan 用可及性模型给动作打分，本篇没有视觉控制器。作者自称是把推理和动作接到同一只冻结大模型、同一条闭环里的早期演示。花园读成 2022 年的定位，不读成工具调用的发明权。并发或更早的 Inner Monologue 已经闭环，差在独白是不是灵活、稀、能注入常识。

FEVER 三分类里 NOT ENOUGH INFO 和只差一个修饰语的 SUPPORTS / REFUTES 最吃现查。Table 1 上 CoT 56.3 低于 Standard 57.1，内部独白在事实验证上可以帮倒忙；ReAct 60.9，再接 CoT-SC 切到 64.6。HotpotQA 方向反过来：结构推理 CoT 更顺，检索约束反而添推理错。两套任务不要收成「接工具一定涨 EM」。标签含糊两边都约三成失败，EM 会误杀表述不同的对答案，这和 CRITIC 后来用 F1 不是同一把尺，不要把 27.4 听成「只能答对四分之一的多跳题」那么惨，也不要把它听成已经接近 67.5 的专用系统。

人在 AlfWorld 上改两处想法就能把失败轨迹扳回来（附录 Figure 5）：删掉一句幻觉、补一句提示，后面的动作跟着变。作者写成人对齐比改动作序列省力。那是人改本题上下文，不是系统改了 \(I\)。改参数或只改几个动作，后面的策略不会跟着转；改想法可以改内部信念和推理风格。这是可控性案例，不是评测表。

## 3. 数字：71% 是 AlfWorld 最好一档；27.4 低于 CoT

Table 1，PaLM-540B。HotpotQA EM：Standard **28.7**，CoT **29.4**，CoT-SC **33.4**，Act **25.7**，ReAct **27.4**，CoT-SC\(\to\)ReAct **34.2**，ReAct\(\to\)CoT-SC **35.1**。监督 SOTA **67.5**。FEVER 准确率：57.1 / 56.3 / 60.4 / 58.9 / **60.9** / **64.6** / 62.0，SOTA 89.5。HotpotQA 上单用 ReAct 没有赢过 CoT；FEVER 上赢了，作者写 SUPPORTS / REFUTES 往往只差一点点，要现查。最好的提示组合两套任务各吃一头。脚注把 Wang 等 CoT-SC 原文的 HotpotQA 27.1 / 28.9 / 33.8 并列，和本表 Standard / CoT / CoT-SC 不是同一实现，不要横加。

Table 2，人工看 200 条（ReAct / CoT × 对 / 错各 50）。成功里假阳性：ReAct **6%**，CoT **14%**。失败里 CoT 幻觉 **56%**，ReAct 幻觉 **0%**；ReAct 推理错 **47%**（含原地打转），检索空或没用 **23%**，标签含糊两边都约 29%。作者读成：交错提高接地，结构约束降低灵活性。检索失败会让推理脱轨，所以才要和 CoT-SC 组合。有的 HotpotQA 标签过时，附录 Figure 4 旅馆扩容，只有 ReAct 查到新数字——这是案例，不是主表涨分。

Table 3，AlfWorld，134 局未见评测，task-specific。ReAct 最好一档 **71**（Pick 92 / Clean 58 / Heat 96 / Cool 86 / Look 78 / Pick2 41），均档 **57**。Act 最好 **45**。ReAct-IM 最好 **53**、均 **48**。BUTLERg 最好 **22**，BUTLER 最好 **37**。BUTLER 每类用 \(10^5\) 条专家轨迹模仿。ReAct 每类两条示范的 6 种排列，相对 Act 的增益 33% 到 90%、均 62%。最差一档 ReAct **48** 已经高于 Act 和 BUTLER 的最好。Pick2 上 ReAct 最好和 Act 一样是 41，不是六类全赢。Cool 上 BUTLER 100、ReAct 86，模仿在这一类更高。摘要 34 个点是 71 对 37，不是对 Act 的 45。实例可以超过 50 个地点。没有想法时 Act 不会拆子目标，也会丢失当前状态。ReAct-IM 把想法收成 Inner Monologue 那种稠密外部反馈，常搞错子目标是否完成、下一目标是什么、物品大概在哪；缺的是高层分解和常识，作者说这两样正是稀疏想法要补的。贪心解码；BUTLER 用束搜索，对比不对称，花园照表写。

Table 4，WebShop，**500** 条测试指令。Act 62.3 / 30.1，ReAct **66.6 / 40.0**，IL 59.9 / 29.1，IL+RL 62.4 / 28.7，人 82.1 / 59.6。一-shot Act 已经贴着 IL。稀疏想法再抬成功率约十个点。专家人还在 59.6，探索和改写查询仍是提示方法够不着的。IL 用 1012 条人轨迹，IL+RL 再加 10587 条训练指令。环境有 1.18M 商品、12k 人指令，文本又吵又长。作者看例子：ReAct 更会用一句话把嘈杂观察和选项对上用户需求。这仍是本题内的桥，下一单从空上下文开始。

附录 Table 5：HotpotQA 随机 500 题验证，ReAct 的 PaLM **29.4**、GPT-3 **30.8**；AlfWorld 134 局用 PaLM 上最好的那套提示，PaLM **70.9**、GPT-3 **78.4**。500 题子集的 29.4 不是 Table 1 全表的 27.4。作者猜 GPT-3 更高是因为跟了指令微调。代码在项目页。项目页把交错轨迹做成可点演示，主表仍以论文 HTML 为准。禁止用 78.4 改 Reflexion 的 130/134，也禁止用 30.8 改 LATS 的 0.32。

[LATS](../28-LATS-Agent树搜/28-LATS-Agent树搜.md) 的 WebShop ReAct 是 GPT-3.5、50 条、53.8 / 28.0；本篇是 PaLM-540B、500 条、66.6 / 40.0。HotpotQA 上 LATS 的 ReAct 0.32 带 **oracle 对错**；本篇 27.4 只有弱维基 API，没有「答完告诉你对不对」。两套协议，禁止横加。[Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) AlfWorld 130/134 是多 trial 加窗口，基座和门都不同；本篇 71% 是单次提示、六套示范里最好的一档。

## 4. 这不是术语式 (2)，循环也不是改进器

\(y\) 变好了，改进器没变。下一题的 few-shot 还是那几条人手轨迹。混元 L0：好处和危害都随本题丢掉。不要用 71% 给 [SEAL](../../2-Model层-训练时自改进/04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md) 的 LoRA 或 [DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 的自改 Python 背书，也不要用 27.4 去改 LATS 的 0.63。局限节自己写：提示设定下能示范的想和做种类有限；微调只是初步。未来写扩任务、接 RL，那是议程，不是表。监督 SOTA 67.5 / 89.5 还在，few-shot 没有打穿专用系统。

和 [ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md) 钉死。那边节点是中间式，Game of 24 GPT-4 74% 对 CoT 4%；这边节点是本题动作前缀，不长树。和 [LATS](../28-LATS-Agent树搜/28-LATS-Agent树搜.md) 钉死。那边 UCT、失败反思、HumanEval 92.7；这边一条链、没有 \(k\) 次轨迹预算。和 [Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) 钉死。差不在会不会 think，在 think 的寿命：本篇活在当前轨迹，trial 重置就没了；那边搬进窗口。和 [CRITIC](../13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md) 钉死：那边工具用来验稿再改；这边工具用来查下一跳。和 [ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md) 钉死：AppWorld 上的 ReAct 42.4 是后来 DeepSeek-V3.1 骨架，不要写进 Table 3。和 [Voyager](../10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md) 钉死：开放探索上本方法几乎走不动，家务游戏的可行动作写在观察里。

[可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md) 的 L0 原句可以当本篇判定。71% 是 L0 在「动作写在观察里」的家务游戏上的诚实结果；27.4 是 L0 在弱检索 API 上的诚实结果。两套都要会读。把「会调用工具」听成自我进化，缺的是 \(I\) 有没有进 \(S'\)。人把 6-shot 改成 12-shot，作者已经写了不加分；人改 API、改步数帽，只是人改了 \(I\)。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？本题交错轨迹，L0。权重动了没有？主方法没有。71% 能不能当 Agent 自进化？不能，示范和 API 冻着，题换了清空。还缺什么才叫花园 RSI？few-shot 轨迹或动作空间进入 \(S'\)，并且下一题的改进器用的就是升级后的那份。微调 8B 超过 62B 提示，说明「怎么查维基」可以变成权重里的技能，那一格是训练式自改进的材料，改进器仍在墙外。

## 5. 想法的寿命，短过句子、函数和权重

同一句话「模型在行动」，至少有五段寿命。ReAct 的 thought 活过本题若干步，题换了清空。Reflexion 的 \(sr\) 活过同一任务的若干 trial。ToT / LATS 的节点活过本题的树。Voyager 的函数默认留在磁盘。SPIN 的寿命在 checkpoint。五段不要收成「都在自我进化」。

Gödel Agent 把手写脚手架放进「部署之后模块图不变」。ReAct 正是那种模块图：三个维基动作、few-shot、步数帽都是人预先写好的。STOP 和 DGM 动的是改进器源码。本篇连源码都不动，只动本题字符串。浅不是没用。CoT 幻觉占失败的 56%，接上弱 API 之后成功里的假阳性从 14% 降到 6%。AlfWorld 上没有想法的 Act 会丢失目标和状态，71 对 45。读新闻时先问留下的是本题轨迹、跨 trial 句子、函数还是权重，再问检索器是弱 API 还是金标段落。

few-shot 里的人手轨迹不会因为某题做对就多一条示范进仓库。人要加例子，得亲手改提示。那是改 \(I\)，不是 \(I\) 进了 \(S'\)。这和 ACE 的 Merge、Voyager 的技能入库正好相反。WebShop 500 条不是 LATS 的 50 条，也不是 12k 全库。AlfWorld 134 局是未见评测切分。海报上的 34% / 10% 都要带着分母：对 BUTLER 37%，对 IL+RL 28.7%，对人 59.6 还差一截。Micheli 等把 GPT-2 在 3553 条上微调、所有任务类型一起训，作者故意不拿来当对照，因为协议更宽。花园也不拿那条未列表的分来压 BUTLER。

原地打转被归进推理错：模型反复吐上一轮的想法和动作，跳不出循环。作者猜贪心解码是原因之一，束搜索可能有用，主实验没做。检索空结果占失败 23%，弱 API 是设计选择，换成稠密检索会改分数，也改「像人翻维基」这个故事。换 API 是人改 \(I\)。

**读**：Table 1 的 27.4 低于 CoT 29.4、组合 35.1 / 64.6、Table 2 幻觉 0% 对 56%、AlfWorld 最好 71 对 Act 45 对 BUTLER 37、WebShop 66.6 / 40.0 对 500 条、附录 GPT-3 的 30.8 / 78.4 是另一张表、微调 3000 条是另一条实验、L0。  
**不读**：用 71% 改 Reflexion 的 130/134、用 40.0 改 LATS 的 38.0、用 27.4 改 LATS 的 0.32、用附录 29.4 替换 Table 1、说 ReAct 在 HotpotQA 上全面超过 CoT、把 34% 听成相对涨幅、把微调 8B 写成主方法已经 RSI、把 ACE 的 42.4 写进本表。

同层：[28 LATS](../28-LATS-Agent树搜/28-LATS-Agent树搜.md)、[27 ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md)、[30 RAP](../30-RAP-世界模型规划/30-RAP-世界模型规划.md)、[31 GoT](../31-GoT-思维图聚合/31-GoT-思维图聚合.md)、[11 Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md)、[32 ExpeL](../32-ExpeL-跨题经验洞察/32-ExpeL-跨题经验洞察.md)、[35 AWM](../35-AWM-工作流记忆/35-AWM-工作流记忆.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[44 GPTSwarm](../44-GPTSwarm-通信图边概率/44-GPTSwarm-通信图边概率.md)、[13 CRITIC](../13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md)、[10 Voyager](../10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md)、[12 Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)、[55 RestGPT](../55-RestGPT-粗到细调REST/55-RestGPT-粗到细调REST.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629). ICLR 2023. arXiv:2210.03629. Table 1–5 以 HTML 为准。
2. 项目与代码：[react-lm.github.io](https://react-lm.github.io/)。
3. 本花园：[LATS](../28-LATS-Agent树搜/28-LATS-Agent树搜.md)；[Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md)；[ToT](../27-ToT-本题推理树/27-ToT-本题推理树.md)。
