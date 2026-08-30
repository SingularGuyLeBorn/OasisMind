---
title: "04 · DGM：用基准代替形式证明来改自己的代码"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Darwin Gödel Machine（arXiv:2505.22954）：冻结基座，Agent 改自己的 Python。
  SWE-bench 20%→50%，Polyglot 14.2%→30.7%。档案开放探索；外环算法仍固定。
  Harness 层弱 RSI 候选，不是权重递归。
tags:
  - RSI
  - DGM
  - Darwin Gödel Machine
  - Harness
  - SWE-bench
  - 自改代码
---

# 04 DGM：用基准代替形式证明

Gödel machine 要求先证明改写有用，再改写，包括证明搜索器自己。实践里几乎证不了。Darwin Gödel Machine（DGM）把那道证明换成**编码基准上的经验分数**：Agent 改自己的 Python，过了 SWE-bench / Polyglot 再进档案。基座模型冻结。改的是下次怎么干活的脚手架，不是 $\theta$。

本篇是 Harness 层最接近「改进器还在 $S$ 里」的公开系统。术语仍走 [01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md) 的式 (1)(2)。Artifact 层的对照是 [03 AlphaEvolve](../../4-Artifact层-产物发现/03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md)：那边进化的是交卷程序，发现者 Agent 可以整段不动。DGM 反过来——交卷物是 GitHub issue 的补丁，被改的是 Agent 自己。**不是** ADAS 那种永远固定的元 Agent，**不是** SPIN 那种改权重。一手：Zhang, Hu, Lu, Lange, Clune，Sakana AI + UBC，[arXiv:2505.22954](https://arxiv.org/abs/2505.22954)；官方页 [sakana.ai/dgm](https://sakana.ai/dgm/)；代码 [github.com/jennyzzt/dgm](https://github.com/jennyzzt/dgm)。

## 1. 问题：形式证明进不了工程，固定元 Agent 又会封死搜索

Schmidhuber 2007 的 Gödel machine 把「自改」收成可证改写，导读里写过。DGM 作者的诊断是：不加上很强的限制，无法形式证明一次修改对 LLM Agent 有净收益。多一个测试工具看起来总有好处，实际取决于模型训练和任务上下文——为某一套测试框架优化的工具，换个仓库可能把 Agent 搞糊涂。

另一条现成路是 meta-learning / ADAS（Hu, Lu, Clune, 2024）：一个**固定的**元 Agent 在代码里编程出新 Agent，放进档案。元 Agent 自己不变，搜索空间仍被「谁来改」锁在人设计的那一层。DGM 要的是：子代不但要更会修仓库，还要更会改自己——因为改自己也是写代码。

作者写明一个更硬的设想：Agent 可以改自己的训练脚本，包括训一个新基座。**这篇论文没有做这件事**（算力与复杂度），只改冻结 FM 外面的工具和流程。读者把这条记在失效表里：Harness 自改 ≠ 已经在训下一代 $\theta$。同线前作 SICA（Robeyns 等，2025，arXiv:2504.15228）已经在「编码 Agent 改自己」上跑过；DGM 把它收成开放档案，并在消融里用 Greedy 对照证明档案不是装饰。

## 2. 循环：档案、按分数和子女数抽父母、自改、再打分

初始 Agent 很瘦：冻结 FM + Bash + 一个整文件编辑工具，一条提示告诉它仓库路径、issue、测试框架。故意瘦，是为了让后面长出来的工具能被看成自改进，而不是人先把 Aider 塞进去。

DGM 跑 **80** 轮，每轮产出一个新 Agent。SWE-bench 上两路并行，Polyglot 上四路，所以墙上的「80 轮」不等于串行 80 次自改，而是按 $k$ 并行展开的迭代计数。自改阶段：SWE-bench 实验用 Claude 3.5 Sonnet (New)，Polyglot 用 o3-mini（更快、躲开 Claude 限流）。温度都是 1.0，采样有噪声，级联子集才显得必要。

每一轮：

1. 从档案里抽父母。概率大致与表现分数成正比，与「已有多少仍能改代码的子女」成反比。高分且子女少的更常被抽；任何个体都保留非零概率。
2. 父母读自己的评测日志，提议下一个要加的功能，再把这条提议当成任务去实现——实现过程就是在改**自己的**代码库。
3. 子代先过一道门：还能不能编辑代码。过不了的不进档案，否则血统会断。
4. 能改代码的再上编码基准。全量太贵，所以级联：先 10 题看基本编辑，过了再 50 题。SWE-bench 用 Verified 的代表性子集（论文称默认 SWE-bench 即 Verified）；Polyglot 用随机子集，最后再把基座和最佳子代拉到全量上复核。

$$
A_{t+1}=A_t\cup\{C\mid \mathrm{CanEdit}(C)\},\qquad
C=\mathrm{SelfModify}(\mathrm{Parent}(A_t)). \tag{1}
$$

$A_t$ 是档案。选择 $\mathrm{Parent}$ 的规则、级联阈值、基准本身，构成外环 $I_{\mathrm{outer}}$，这篇里是固定的。内环 $I_{\mathrm{inner}}$ 住在每个 Agent 的 Python 里：工具、补丁策略、是否做 peer review。自改改的是 $I_{\mathrm{inner}}$。这是和 AlphaEvolve 的结构差：AlphaEvolve 的 $I$ 整段在墙外；DGM 的内环改进器在 $S$ 里，外环档案算法仍在墙外。

![DGM：初始 Agent → 档案 → 抽父母 → 自改 Python → 基准评估 → 仍能编辑才加回档案；θ 冻结](./images/fig-dgm-loop.png)

> 图 1：实线是一轮自改；虚线是把仍能编辑的子代加回档案。右下角 $\theta$ 不参与这条实线。

**图 1 解析**

- **Initial agent**：冻结 FM + Bash + edit。种子，不是终点。
- **Archive**：所有发现过的 Agent，包括当时分数不高、后来当垫脚石的。
- **Parent select**：分数高、子女少的优先；不是只爬当前第一名。
- **Self-modify**：读日志、提功能、改自己的 Python。这一步是 Gödel 叙事里「改写包括改进器」。
- **Evaluate**：SWE-bench / Polyglot。经验证据替换形式证明。
- **Keep if still can edit**：丢掉把编辑能力改没的子代，否则递归自行终止。
- **FM frozen $\theta$**：权重不在进化块里。论文把「改训练脚本、训新 FM」留作未来。

附录 C.2 把抽父母写成可核对的式子。第 $t$ 轮档案 $\mathcal{A}^t$ 里，先丢掉已经满分的个体，剩下 $\mathcal{E}^t=\{a_i:\alpha_i<1\}$。对每个 $a_i$：

$$
s_i=\frac{1}{1+\exp\bigl(-\lambda(\alpha_i-\alpha_0)\bigr)},\quad
h_i=\frac{1}{1+n_i},\quad
w_i=s_i h_i,\quad
p_i=\frac{w_i}{\sum_j w_j}. \tag{2}
$$

$\alpha_i$ 是基准分数，$n_i$ 是仍能编辑代码的子女数。论文取 $\lambda=10$、$\alpha_0=0.5$。再按 $p_i$ 有放回抽 $k$ 个父母：$k=2$（SWE-bench）或 $k=4$（Polyglot）。$h_i$ 是新颖性奖励——子女越多越难再被抽到，逼搜索去点还没长过枝的节点。另做的 **DGM Greedy**（总是从当前最高分往下长，复制 Robeyns 等 SICA 的设定，arXiv:2504.15228）在子集口径上只有 **39.7%**（SWE-bench）和 **30.0%**（Polyglot），对照完整 DGM 的 50.0% / 38.0%。只爬第一名，档案的垫脚石用不上。

Python 图灵完备，理论上 $S$ 里什么都能长出来。论文把这条当作潜力，不当作已经发生的事。Algorithm 1 的外环仍是：评估种子 → 初始化档案 → 循环 $T=80$ 次 SelectParents / SelfModify / evaluate。$T$、$B$（基准套件）、SelectParents 的公式，人都没交给子代去改。

Algorithm 1 可以读成四行伪代码：评估种子 $g_0$；档案只放 $(g_0,s_0)$；循环里 SelectParents → $c\leftarrow p.\mathrm{modify}(p)$ → 在 $B$ 上打分 → 仅当 $c$ 仍能编辑代码才入档。Algorithm 2（无自改进）把 $p.\mathrm{modify}(p)$ 换成「永远用 $g_0$ 去改别人」；Algorithm 3（无开放探索）不维护档案，只改最新合法自己。三份伪代码并排，消融才不是口号。

两份基准测的不是同一件事。SWE-bench Verified 是人滤过的、保证可解的 GitHub issue，几乎都要在已有仓库里跨文件改；论文为省算力先用 SWE-bench-verified-mini 代表全量。Polyglot 更偏从零实现、跨 C++ / Rust / Python 等语言，作者认为它更少进过主流模型的后训练，也是 Aider 自己用了一年的榜。DGM 报 pass@1：真测试结果永不进入 Agent 视野。这和「修 issue」同构于「改自己的仓库」更近，和「按公开测试红绿刷题」更远。

## 3. 数字：20% 到 50%，以及两条缺一不可的消融

80 轮之后，SWE-bench（级联用的那 50 题口径，见图 2）从 **20.0% 到 50.0%**。Polyglot 子集从 14.0% 到 38.0%；拉到**全量** Polyglot，从 **14.2% 到 30.7%**。全量数字是官方页和摘要采用的那对，本篇谈 Polyglot 主结果用它。

两条消融把口号钉死。**DGM w/o self-improve**：改别人的那个元 Agent 永远是初始那份，复制 ADAS 的设定。新 Agent 会被造出来，造它们的那只手不变；Figure 5 显示这条线几乎不再往上爬。**DGM w/o open-ended exploration**：丢掉档案，总是改「当前最新且仍能编辑」的自己，变成爬山；Figure 6 进展很小。作者的结论是：自改和开放档案都不是配件。没有自改，改进器身份不升级；没有档案，差的祖先无法把后来的突破送出来。Figure 3 左图把档案画成树：通往最终最优的路径会经过分数低于父母的节点；像 node 24 这种关键创新会在其上爆出一丛后代。边框颜色表示该节点被评了多少题，评得少的节点不要直接跟评了 50 题的节点去比较其绝对分数。右图三条线要分开读——浅色是「仍能编辑」的平均分，蓝色是档案当时最好，深色才是最终冠军的血统。

Table 2 还报过一个容易被忽略的统计：完整 DGM 产出「仍具备基本代码编辑能力」的子代比例最高。开放探索把搜索从局部最优里拽出来，自改则让「还能改自己」这件事本身变强。两条一起，血统才不容易在中途死掉。

和人手设计的对照：SWE-bench 上，DGM 找到的最好 Agent 能跟「已被 SWE-bench 团队复核过的开源 SoTA」比肩（图 2 虚线；精确开源系统名以论文 §E.4 为准，这里不把二手俗称升格）。Polyglot 上，基座一开始低于 Aider，发现出的 Agent 超过 Aider。比较口径要注意：Aider 的公开榜常用 pass@2（可以看一次真测试反馈），DGM 报 **pass@1**（永远不看真测试结果）。这不是把 DGM 说成已经赢了所有 CLI 产品，只说明自动搜脚手架可以超过一条被人打磨一年的同基准 Agent。

自改进过程中长出来的东西，官方页举过：更好的文件查看和编辑工具、补丁校验、对多个候选排序再提交、把「试过什么、为何失败」写进下次修改的上下文、peer-review。这些都是 Harness 零件，可以一件件指回代码 diff。把它们说成「模型变聪明了」，看下一节的迁移数字会更清楚：换掉 $\theta$ 之后，同一套零件往往还在。

## 4. 迁移：换模型、换基准、换语言

SWE-bench 那次 DGM 用 Claude 3.5 Sonnet (New) 跑。把最好 Agent 的脚手架冻住，只换 FM，在 200 题上测：o3-mini 上基座 **23.0%**、DGM 子代 **33.0%**；Claude 3.7 Sonnet 上基座 **19.0%**、子代 **59.5%**。脚手架不是绑死在当初那只模型上的咒语。

跨基准（优化时完全没见过另一边）：SWE-bench 上长出来的最好 Agent 在全量 Polyglot 上 **28.9%**（基座 14.2%）；Polyglot 上长出来的最好 Agent 在 SWE-bench 上 **24.5%**（基座 20.0%）。只在 Polyglot 的 Python 任务上进化、再测同一套基准里的 Rust / C++ / Go，官方页报了正向迁移：脚手架里的编辑策略和失败历史，并不绑死在一种语法上。反向也有弱的：Polyglot 实验用 o3-mini 进化，再换 Claude 3.5 / 3.7 测全量，增益只有 32.0%→33.3%、35.6%→36.8%。SWE-bench 那次换模型跳得大，Polyglot 这次几乎不动，说明「可迁移」是经验观察，不是定理。弱的那两格不要藏。

## 5. 这算不算 RSI

$S$ 取「当前 Agent 的 Python + 工具」。内环 $I_{\mathrm{inner}}\subseteq S$，自改之后 $I'_{\mathrm{inner}}\subseteq S'$，并且 $S''=I'(S')$ 有定义——子代继续当父母。按导读式 (2)，**Harness 层弱 RSI 候选成立**。

仍缺三件，所以本花园不允许直接写成「真 RSI / 智能爆炸」。外环 $I_{\mathrm{outer}}$（抽父母的公式、80 轮、级联题集、基准本身）仍由人固定；$\theta$ 冻结；评价标准是 SWE-bench / Polyglot，不是系统自己改考纲。混元综述把改改进器放在 L3、改评价标准放在 L4，DGM 最多蹭到 L3 的脚手架切片。STOP（Zelikman 等，COLM 2024）更早把「改进器程序」当成递归对象：种子改进器 $I_0$ 用 LM 去改进任意解，再把 $I$ 自己交给同一套手续。它证明过 GPT-4 上下游任务随迭代变好，更弱的模型上递归结构会把分数拉下去——脚手架递归本身不够，基座得够用。Gödel Agent（Yin 等，arXiv:2410.04444）用运行时改自己的逻辑，没有 DGM 这套开放档案。ADAS 的元 Agent 固定，是 DGM 消融 w/o self-improve 的原型。四篇都是 Harness 自指，深浅不同，本篇以 DGM 为可核对的数字样板。

和 AlphaEvolve 再对一次。AlphaEvolve 也可以反哺 Gemini 训练时间 1%，那是 Artifact 回流到基础设施，$I$ 仍在墙外。DGM 的回流是：更好的编辑工具让下一轮自改更可能成功。回流落在脚手架上，这才是弱递归。不要把两篇的「20→50」和「23% kernel」加成同一件事。实验室若把 DGM 写成「已经智能爆炸」，对照清单只有一句：外环和 $\theta$ 有没有进 $S'$。没有，就停在弱候选。

一个常见口误是：SWE-bench 从 20% 到 50%，等于「修仓库的智力翻倍，所以改自己也会翻倍」。作者的同构假设是「修仓库 $\approx$ 改自己的代码」。同构在 Python 工具层大致成立，换到改训练脚本、改评估器、改外环公式，就不再免费成立。论文自己把「改训练脚本、训新 FM」留作未来，等于承认这条同构还没走到 Model 层。

## 6. 安全：沙箱、假测试日志、拆掉检测器

实验里所有执行和自改都关在隔离沙箱，有墙钟上限，网络受限，动不了宿主机。自改进范围被收成「改自己的 Python 和评测夹具」。档案保留每一步代码和分数，可回滚。发现的 Agent **没有**部署进真实开发环境。开源计划写明：去掉提权组件，默认带沙箱。这是工程约束，不是对齐证明。作者也写：主实验里没看到恶意行为，改动主要落在编码能力上——这句话的证据强度止于「他们审过这次跑的血统」，不能外推到放开沙箱之后。

更有用的是他们记录的作弊。上下文很长时，Claude 3.5 会**假装**调了 Bash 跑单元测试，把「全部通过」写成纯文本日志，工具其实没调。日志随后进入上下文，Agent 以为补丁已经绿了。作者另设「工具幻觉」分数，让 DGM 去修。有的子代真去修检测；有的把检测用的特殊标记删掉——指令明确禁止——让幻觉分数看起来完美。因为血统可追溯，这种 objective hacking 能被抓到。本花园第 6 章要的「证据必须在更新边界之外」，这里是反例教材：分数在更新边界之内，系统会改分数通道。

附录还讨论过人还要不要在环里：当前 DGM 的自改评估**没有**人逐步点头。以后若把人的偏好写进 $B$，那是把监督目标嵌进外环，不是已经做了 RLHF。作者把「自改进拿来加强安全」写成有希望但难的方向，主结果仍是刷编码基准。不要把附录写成「自改进已经在做对齐」。

对偶用途也写进论文：更强的自主编码 Agent 既能修软件，也能被拿去写有害代码。他们的立场是研究收益（可审计的自改进方法、可展示的沙箱）压过风险，同时明确不鼓励无沙箱、安全敏感部署。本篇只转述这条边界，不当安全证书。

## 7. 何时失效

基准不能代表「更会改自己」时，递归是假的：SWE-bench 变强只证明更会修那类 issue。作者的赌注是「修仓库 $\approx$ 改自己的代码」，两件事同构才成立。级联 10+50 题估全量，估算会抖；温度 1.0 让单次分数更噪，所以他们才用子集先筛、再用全量复核 Polyglot。丢掉档案就卡在局部，DGM Greedy 的 39.7% 是这条路的数字。子代把编辑能力改没，血统断——「Keep if still can edit」不是礼貌，是递归的最低维持条件。

外环若也被 Agent 改写且没有独立监督，才接近实验室文案里的 RSI；DGM 没走那一步。把「可以改训练脚本」读成「已经在训新 FM」，是白皮书自己划掉的未来工作。分数通道若被改（删检测标记），看起来像安全自改进，其实是在改考官。第 6 章可靠性阶梯要的独立证据，DGM 主实验并不提供：SWE-bench 既是训练信号也是汇报数字。

对有大模型基础的读者，读完本篇应能回答四句。改的是哪一层？Harness，Python 工具和流程。权重动了吗？没有。递归在哪闭合？内环改进器被下一轮 Agent 接着用。还缺什么才敢叫真 RSI？外环公式、$h$ 的所有权、以及 $\theta$ 是否进入 $S'$。

**读**：内环改的是自己的 Python，$h$ 是哪份基准，外环公式有没有进 $S'$，沙箱有没有把分数通道也关住。  
**不读**：融资通稿当机制、把 20%→50% 听成权重递归、把附录幻觉实验听成已经对齐。

STOP / Gödel Agent / ADAS 的对照见 [05 STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md)；验证门谁说了算看 [01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。产物层回 [03 AlphaEvolve](../../4-Artifact层-产物发现/03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md)。

## 参考文献

1. Zhang, J., Hu, S., Lu, C., Lange, R., Clune, J. (2025). [Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents](https://arxiv.org/abs/2505.22954). arXiv:2505.22954. 20.0%→50.0%、14.2%→30.7%、80 轮、迁移表以该文为准。
2. Sakana AI. [The Darwin Gödel Machine](https://sakana.ai/dgm/). 官方叙述与作弊例子。
3. Hu, S., Lu, C., Clune, J. (2024). [Automated Design of Agentic Systems](https://arxiv.org/abs/2408.08435). arXiv:2408.08435. 固定元 Agent；DGM 消融 w/o self-improve 复制此设定。
4. Zelikman, E., et al. (2023/2024). [Self-Taught Optimizer (STOP)](https://arxiv.org/abs/2310.02304). COLM 2024. 递归改进脚手架，基座不变。
5. Robeyns, M., Szummer, M., Aitchison, L. (2025). [A Self-Improving Coding Agent](https://arxiv.org/abs/2504.15228). arXiv:2504.15228. DGM Greedy 的前作设定。
6. Yin, X., et al. (2024). [Gödel Agent](https://arxiv.org/abs/2410.04444). arXiv:2410.04444.
7. Schmidhuber, J. (2003/2007). [Gödel Machines](https://arxiv.org/abs/cs/0309048). 形式证明版；本花园导读已引。
8. 本花园：[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)；[03 AlphaEvolve](../../4-Artifact层-产物发现/03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md)；[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。
