---
title: "01 · Argus：生成不等于入库，门在权重外面"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Argus（arXiv:2608.05144）：冻结 GPT-5.5，进化的是 H_t。
  SWE-Bench Pro 约 78% 对 Direct Copilot 约 59%，token 1.41×。
  成熟窗口相对启动窗口少 21% 输入 token、少 15% 工时；观测而非因果消融。不是 RSI。
tags:
  - RSI
  - Argus
  - Harness
  - verification-gated
  - 验证门控
---

# 01 Argus：生成不等于入库

会写 skill、会往记忆里塞一段话，看起来像自进化。真正拉开分数的往往是另一件事：**谁有权把这段话变成下次还用的状态**。Argus 把这条收成验证门控：候选记忆、技能、路由、被否决的路线，不能因为某个角色生成了就入库；要有任务原生证据，还要有明确的提交人。模型权重冻结。进化发生在持久运行时状态 $H_t$ 上。

本篇是 Harness 层里「门」的样板，和 [05 STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md)、[06 Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md)、[04 DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 同层不同刀：那三篇改改进器或运行时代码，本篇改的是**准入规则**。坐标系见 [02 Model–Harness–Artifact](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；审计义务见 [可靠性阶梯](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。**不是**完整 RSI：$I$（四角色、门、合约字段）在墙外，$\theta$ 不动。**不是** SPIN / SEAL。**不是** FunSearch / AlphaEvolve（那边进化交卷程序，发现者可以整段不动）。一手：Argus Team，[arXiv:2608.05144](https://arxiv.org/abs/2608.05144)，2026-08 技术报告；代码叙述见 [microsoft/ArgusAgent](https://github.com/microsoft/ArgusAgent)。主实验骨干 **GPT-5.5**；SWE-Bench Pro 用 **GPT-5.5/xhigh + Copilot**，其余六域用 GPT-5.5 + Codex。

## 1. 问题：目标会变，变了和失败长得一样

稠密监督的任务，自改进好做：kernel 变快、单测变绿、排行榜有数，迭代有东西可爬。研究型长程任务不是这样。数学 campaign 很少停在一开始要证的那条定理上：中间界、反例、重表述才是常态。软件需求常常做到一半才暴露缺了什么。形式验证里 spec 和实现可能都错，改哪边本身就是工作。芯片和材料里，能一锤定音的测量经常还在建。共同特征不是「更难」，是**一开始没法把目标写精确到可以当优化靶**。

这时 runtime 的工作不是去爬一个不可信的分，而是把一场 campaign 撑到目标自己变清楚，并把机器判不了的矛盾交给人。论文把这叫 expert–agent co-evolution：用户立场可以稳住，操作目标、约束、验收标准随证据改。麻烦在于：从外面看，改目标与失败后找借口**分不开**。允许随便 pivot，目标会滑向「执行器碰巧能做完的事」。常见反应是把目标钉死，只优化执行——ReAct、SWE-agent、OpenHands、AI Scientist 一类大多默认目标给定。任务地平线一长，成功率往下掉（Kwa et al., 2025），而地平线最长的地方，目标最不容易原样活下来。

Argus 的立场反过来：**允许 pivot，但用验证把它和漂移分开**。一次可准入的转向要有证据（旧路线走不通或目标写错了）、经过角色边界、记下来让后面的 mission 继承改动和理由。验证不是执行完再滤一遍质量，而是让转向可审计的机制。

三件事先得成立，长跑 Agent 里它们经常坏。连续性：transcript 被压缩丢掉，提出修订时证据已经不在。验收：干活的人同时宣布完工。经验：只留下最终产物，被否决的路线以后引用不了。更大的上下文窗口只延长会话；要认证「目标变了」，还需要显式状态、所有权和更新规则。

## 2. 合约与四角色：立场稳住，操作目标可改

报告层把工作合约写成

$$
K_t=(\iota,\,o_t,\,c_t,\,v_t). \tag{1}
$$

$\iota$ 是 campaign 必须保住的用户立场；$o_t$ 是当前操作目标；$c_t$ 是已知约束；$v_t$ 是这一步的验收标准。另用 $X_t$ 装给用户看的澄清、优先级、未决问题，故意不塞进 $K_t$。材料性修订走 **ManagerAdmit**：提议合约 $K'_t$、证据 $e_t$、准入记录 $r_t$、授权操作者 $u_t$ 一起进来，才得到 $(X_{t+1},K_{t+1})$。这把「有证据的合约修订」和「立场悄悄漂了」拆开。作者写明这是分析算子，**不声称存在一个原子实现 API**。

四角色切开权威。Manager 锚定 campaign、生命周期、路由、Stage 转移。Planner 把研究状态拆成有界任务和依赖。Engineer 在单轮里改产物、调工具、跑实验。Reviewer 独立审查，给出 done / continue / blocked，低风险任务允许记下的 Engineer 自审。三平面：控制（调度）、执行（单 mission）、记录（不可变事件带，**不做完工判决**）。Engineer / Reviewer 每轮可以是新的 provider 会话；跨会话靠共享 CHECKPOINT.md（耐用状态、证据引用、未决问题、下一步）。模型上下文不扛长期真相。

![Argus：四角色走完，底栏准入门才让状态进下一 mission](./images/fig-argus-roles.png)

> 图 1：实线是 mission 内分工；虚线是过门的 $H_t$ 进入下一轮。生成停在 Reviewer，入库发生在门后。

**图 1 解析**

- **Manager**：管 $\iota$ 和路由，材料性改合约要它（或用户）授权。
- **Planner**：一次只 claim 一个有界任务。Stage checklist 归它，Reviewer 给反馈不另开第二道提交。
- **Engineer**：出产物和测量。可以自审低风险任务，高风险必须独立 Reviewer。
- **Reviewer**：完工判决。不是文末点评。SWE-Bench Pro 上 43 次要求再做一轮，其中 34 次后来过官方 verifier。
- **Admission gate**：记忆 / 技能由 Engineer 产候选、Reviewer 提交；路由由 Manager 提交；工具与手续多为系统配置。Table 2 把所有权写死，故意不统一。

事件带 $D_{\mathrm{process}}$ 严格大于最终产物 $D_{\mathrm{final}}=\{y^\star\}$。命题 1（process-data dominance）：若 $Y=g(P)$，则对每个下游决策 $q$ 有 $\mathcal{R}_q(P)\le\mathcal{R}_q(Y)$；只要两份过程记录能对应同一产物却指向不同的下一步，不等式对某些 $q$ 严格。这是 Blackwell 信息序用在研究轨迹上。失败分支、测量、审查结论都留着，后面才能引用「这条路走过、不通」。

## 3. 固定模型下的运行时自进化

权重不动。变的是 $H_t$：记忆 $M$、技能 $S$、工具 $A$、验证器 $V$、路由 $R$、任务 $Q$。一次完整更新四步：轨迹产候选；责任角色对照产物和任务原生证据；授权所有者提交 / 改 / 拒；后一 mission 把留下的状态当起始上下文或执行政策。没走完「提交且被再用」的活动，论文不算自进化。

术语要分开。**verification-guided** 是总控：坚持、停下还是转向。**verification-gated** 是窄义：可复用更新的准入条件。**Reviewer-gated** 只指独立 Reviewer 那条路。**external grader** 是角色环外面的任务原生评测（SWE 测试、BPB、SOL 分）。低风险更新不必每次独立 Reviewer。

复用价值写成后续 $L$ 个任务上的风险差：

$$
G_L(\Delta H_t)=\sum_{j=1}^{L}\gamma^{j-1}\bigl[\mathcal{R}_{q_{t+j}}(H_t)-\mathcal{R}_{q_{t+j}}(H_t\oplus\Delta H_t)\bigr]. \tag{2}
$$

$G_L>0$ 表示准入状态在后续任务分布上降低风险。「越用越聪明」要能做反事实检验，不能只看 transcript 变长。论文自己把 SWE 纵向数字标成 **observational**，没有 frozen-state 对照，所以 $G_L$ 在主实验里是代理，不是因果估计。

![Argus：动的是记忆技能和路由，冻的是权重和立场](./images/fig-argus-frozen.png)

> 图 2：左栏 $H_t$ 过门才动；右栏 $\theta$ 与 $\iota$ 不进补丁。

**图 2 解析**

- **Memory / skills**：工作与认证拆开。生成头不是提交头。
- **Routing**：高风险走独立 Reviewer（731 题里 466 题，63.7%），其余 265 题 Engineer 自审。路由本身也是可进化状态，归 Manager。
- **Weights $\theta$**：GPT-5.5 系列。另有进行中的 GLM-5.2 + Claude Code 跑 SWE-Bench Pro 到 70.94%，无配对 Direct 基线，不进 Table 4。
- **Standing intent $\iota$**：可以澄清，不可以沉默漂移。部署侧的定性观察是：系统会在目标写不清时停住，逼约束浮出水面。作者声明这不是公开前瞻用户研究。

CHECKPOINT 是有限上下文下的决策压缩；事件带更全。失败分支进压缩，当且仅当它改变下一步最优动作。这和「把整段对话塞回窗口」不是同一件事。

一轮 mission 的骨架可以写成：Manager 提交 campaign 身份；预算未耗尽且未完成时，Planner 领取有界任务 $q$；Engineer 产出 $(y,\text{evidence},\text{review\_mode})$；Reviewer 或允许的自审给出判决；continue 就把 $q$ 换成 next_action，直到 done / blocked / paused；然后写准入证据。若合约发生材料性变化，走 ManagerAdmit，需要用户权威 $u_t$。最后 $H_{t+1}$ 只吸收过门的状态。调度一次只 claim 一个有界任务，mission 级完工必须标明来源是自审还是独立 Reviewer——否则谱系里会出现「不知道谁宣布成功」的空洞。

## 4. 数字：广度证据，不要合成一张榜

七个 arena 用各自的原生度量，**故意不交叉归一化**。骨干和后端也不统一。Table 4：

| 域 | 骨干 / 后端 | Argus | 对照 |
|----|-------------|-------|------|
| SWE-Bench Pro（731） | GPT-5.5/xhigh · Copilot | 约 **78%** | Direct Copilot 约 **59%**；合计 token **1.41×** |
| SOL-ExecBench（B200，101 kernel） | GPT-5.5 · Codex | 全球 #6；2 个 #1；7 个 top-3 | 对 Recursive 两次头对头赢 |
| nanochat B200（5 min） | GPT-5.5 · Codex | **0.9636** BPB | 人类最好 0.9646（越低越好） |
| nanochat H100 | 同上 | **0.9855** BPB | 人类最好 0.9879 |
| nanoGPT speedrun（8×H100，$N=10$） | GPT-5.5 · Codex | **79.77 s** 到 val loss 3.28 | 同设备人类 80.18 s |
| AARRI-Bench（82） | GPT-5.5 · Codex | **63/82（76.8%）** | 论文最好 68.3% |
| Math-Reasoning Data | GPT-5.5 · Codex | **28.0** gap | Arbor 20.83；Claude 8.33；Codex 6.25 |

验证机械没有把端任务做垮：SWE 上多花 1.41 倍 token，换约 19 个百分点。这是「规划 + 执行 + 审查」整包对 Direct Copilot，不是 Reviewer 一项的消融。Routed 任务平均消耗 2.75× 求解输入 token、1.80× 活跃时间——门不是免费的。

SWE 731 题的审查账。独立 Reviewer 466，自审 265。Reviewer 在 43 题上要求再实现；修订后 34 题过官方 verifier（占这 43 的 **79.1%**），22 题走完严格的 continue→修订→done（**51.2%**）。另有 35 题直接 **blocked**，记下完不成，而不是假装交卷。拒绝过早停下和拒绝谎称成功，是同一扇门的两面。

纵向窗口（任务加权；两个不完整 Wave 不进组均值）：W1–6 启动，W7–12 早期复用，W13–18 组合切换，W19–22 成熟，W23–24 后期难题。成熟相对启动：**少 21% 求解输入 token、少 15% 活跃工时**。曲线不单调：W13–18 token 相对启动可降到 50%，但活跃时间更长；W23–24 两项都反弹。Copilot 的分 Wave 资源账没留，所以这是 Argus 自身操作剖面，不是配对学习消融。作者写明：要拆开持久状态、角色分离、审查各自贡献，需要 frozen-state 重放、随机题序、随机路由。

论文生产个案：六个项目、640 campaign-小时（项目重叠，不是日历时间）、254 个有界 mission、576 轮 Engineer、286 次 Reviewer 修订、89 次会话滚动、16 次 Stage 回滚，六条管道都到投稿完成。有一条用七次 no-go 回滚，把失败的方法搜索收成 4500 行阴性结果研究，再修两处晚期投稿缺陷，**没有重置研究状态**。数学 campaign：保留 1 条被证伪的路线和 6 个有证明支撑的前沿更新。外部合入：TileLang RWKV6 kernel，FLA PR **#1045**，commit `c70f11c`（2026-07-20）；H100 上前向 0.199→0.168 ms（1.18×），前向+反向 0.900→0.747 ms（1.21×），13 个正确性门 + 14 个仓库测试。Moonshot 相关合作者审出长序列数值稳定问题，Argus 改完再测才合入。这是人工审过的上游采用，不是对整套 runtime 的外部科学背书。

MLE-Bench Lite 是进行中的第八域，不进 Table 4：九枚奖牌（金银铜各三），以独立审查通过且 Kaggle 发牌为准。差 0.00009 RMSE 没摸到银、差 0.00018 AUC 擦过铜，都由外部 grader 对着官方榜判，不是内部 Reviewer 自己发牌。

审查被写成纠错信道，不是装饰。设提案正确率 $p$、Reviewer 灵敏度 $\alpha$、误接受率 $\beta$，则接受条件下的正确率为 $\alpha p/(\alpha p+\beta(1-p))$。$\alpha>\beta$ 时，过门状态比原始提案流更准。43 次修订请求里 79.1% 后来过官方 verifier，是这条式子的经验对照，不是「多一个角色看起来更严谨」。路由到独立 Reviewer 的任务更贵：平均 2.75 倍求解输入 token、1.80 倍活跃时间。门的成本付在高风险题上；自审的 265 题是政策允许的低风险捷径，不是漏检。

作者把一类任务叫 dense-intelligence：在连续时间窗口里维持高频推理、工具、验证与迭代，直到产出可测结果，并且同时满足——有可重复执行的任务原生 verifier、解空间大到不能穷举、中间产物（界、反例、半成品实现）本身有价值。SWE-Bench Pro、SOL-ExecBench、nanochat BPB 符合；纯聊天问答不符合。这解释了为什么七域看起来杂：它们共享「可验证的中间物」，不共享一张排行榜。

邻居也要钉死。Reflexion / Voyager 把自然语言反思或技能库直接留下，弱任务奖励当门。[MemGPT](../36-MemGPT-操作系统式记忆/36-MemGPT-操作系统式记忆.md) / [A-Mem](../37-A-Mem-卡片盒记忆/37-A-Mem-卡片盒记忆.md) 分层记忆，没有角色提交。DMR 上 GPT-4 Turbo 35.3→93.4 是换页加慷慨裁判，不是准入进化。LongHorizon-Harness 的 MEA 三角色把环境审计做成只读，不把 skill library 和 routing 收进准入进化。Argus 和它们同族的地方是：都拒绝「单靠变长的上下文自评进度」。多出来的是 campaign 级合约、技能库、路由政策全部过门。OpenForge / Orchard 一类在训练期让策略适应 harness，权重会动；Argus 在部署期让固定策略下的 $H_t$ 累积。完整想象可以是：训练期产出更强 Engineer，部署期把产出过门写成 Skill——那是两篇论文拼起来的故事，本实验没有走。

## 5. 不是 RSI：门在墙外，改进器也在墙外

按 [01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)：单轮 $S'=I(S)$ 里 $S$ 是 $H_t$，$I$ 是四角色加准入规则。RSI 还要 $I'\subseteq S'$ 且下一轮用改进过的 $I$。Argus 把 $I$ 钉在墙外：谁提交记忆、谁改路由、合约有哪些字段，实验里不让循环去改这些规则本身。$\iota$ 也不进进化。混元阶梯上这是标准 **L2**：改脚手架，特征失败是过拟合某一套基准 × 记忆 × 工作流。纵向 token 下降与「刷这一串 SWE Wave」兼容，作者自己拒绝写成因果。L3 要问后继改进器在未见任务上怎么提议；本实验没有把 ManagerAdmit 交给 Agent 去改。

| | 改什么 | $\theta$ | 门 |
|--|--------|----------|----|
| Argus | $H_t$（记忆、技能、路由…） | 冻 | 角色所有权 + 任务原生证据 |
| STOP | 改进器 Python | 冻 | 元效用 $\hat u$ |
| Gödel Agent | 运行时 $\pi$ 与 $I$ | 冻 | 验证集 $U$，无独立 Reviewer |
| DGM | Agent 自己的代码 | 冻 | 编码基准 + 档案 |
| FunSearch / AlphaEvolve | 交卷函数 / 文件 | 冻 | `evaluate` 在发现者外面 |
| SPIN / SEAL | 权重 | 动 | 人类数据或内环任务 |

和产品 CLI 的差别：Claude Code / Codex 也会改工作区文件，默认改的是**用户仓库**。Argus 的门管的是 **Agent 下次还用的 $H_t$**。会 `apply_patch` ≠ 本篇的 Reviewer commit。产品细节回 [llm-guide 13.5.1](../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md)。

混元可靠性阶梯把这类系统放在 L2：改的是提示、技能、记忆、工作流。特征失败是脚手架过拟合。验收必须是匹配预算的新任务对比，加上可测回滚。Argus 的 16 次 Stage 回滚和 35 次 blocked，是「可测回滚 / 拒绝交卷」的经验形状，不是 L3。L3 要改提议、选择、提交、回滚的程序本身；本实验里这些程序由人写死。把成熟窗口少 21% token 读成「改进器变强了」，会把观测到的操作剖面升级成后继 $I$。W13–18 相对启动 token 可降一半、工时却更长，已经说明 token 和墙钟不是同一回事，更不能当成智能单调上升。

资源治理也在墙外。预算在开工前检查、完工后对账，单个角色不能给自己加额度。长期外部作业与模型推理分开跟踪。反复产不出决策或产物变化的工作会被停或改写。这些是防漂移的工程，不是科学正确性的来源——正确性仍归任务评测器和显式选中的自审 / 独立审查路径。记录平面明确不做完工判决：日志再全，也不能代替 Reviewer 或官方 verifier。

失效写进 Limitations。没有 frozen-state 对照，$G_L$ 只是观测代理。Manager / 操作者仍可批准差的权衡；$K_t$ 与 $X_t$ 投影在多个 runtime 表面上，不是单笔原子事务。部署比三角色 MEA harness 重一个数量级。七域不可比，是广度证据不是总榜。公开可复现的完整 codebase 需单独跟踪。goal drift 没有被消灭，只是被记录和授权。随机路由实验没做，所以 2.75× token 是「被路由的题更贵」，不是「审查本身的因果代价」。Direct Copilot 没有分 Wave 的资源账，21% / 15% 只能描述 Argus 自己这条序列。

**读**：式 (1)(2)；生成 ≠ 入库；SWE 78% / 59% / 1.41×；466 对 265 的路由；43→34→22 的审查账；成熟窗口 −21% / −15% 且非单调；$\theta$ 冻着；blocked 35 题不算交卷。  
**不读**：把 21% token 下降听成已证明运行时 RSI、把 78% 听成 Reviewer 一项的消融、把 PR #1045 听成 runtime 被外部科学验证、把会写 skill 听成本篇的门、把 GLM-5.2 的 70.94% 听成 Table 4 主结果。

同层自指改进器：[05 STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md)、[06 Gödel Agent](../06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md)、[04 DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)。产物层：[04 FunSearch](../../4-Artifact层-产物发现/04-FunSearch-函数空间搜索/04-FunSearch-函数空间搜索.md)。评测章把本篇标成 L2 门控样本，机制对照见 [02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)，不要跳过阶梯只看 78%。数字只认 arXiv:2608.05144 的 Table 4、审查表与 Wave 窗口，不认二手「固定模型也能 RSI」的缩写。

## 参考文献

1. Argus Team. (2026). [Argus: A General-Purpose Agentic Reasoning Runtime for Long-Horizon Tasks](https://arxiv.org/abs/2608.05144). arXiv:2608.05144. Table 4、1.41×、21%/15%、466/265/43/34/22、PR #1045 以该文为准。
2. 运行时叙述：[microsoft/ArgusAgent](https://github.com/microsoft/ArgusAgent)。
3. Deng et al. (2025). SWE-Bench Pro. 本篇 731 题协议的评测面。
4. 本花园：[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)；[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)；[05 STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md)。
