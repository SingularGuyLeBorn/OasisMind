---
title: "06 · Gödel Agent：改运行时逻辑，不是改权重"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Gödel Agent（arXiv:2410.04444）：用 monkey patch 读改自己的 Python。
  优化器用 gpt-4o-2024-05-13，评测策略用 gpt-3.5-turbo-0125。
  Gödel-base 相对 ADAS：MGSM 53.4%→64.2%。不是 Gödel machine，不是完整 RSI。
tags:
  - RSI
  - Gödel Agent
  - Harness
  - monkey patch
  - ADAS
---

# 06 Gödel Agent：改运行时逻辑

手写 Agent 把 CoT、辩论、角色分工钉死在源码里。ADAS 一类元学习再进一步：外面还有一只固定的元 Agent，按人写的搜索手续去拼模块。两边都有一块**运行时改不了的代码**——要么是任务求解器，要么是改进器自己。Gödel Agent 想拿掉这块：让 Agent 在 Python 进程里读自己的函数，用 monkey patch 写回去，包括「决定怎么改自己」的那段。

本篇是 Harness 层里把 **Agent 循环本身**当成可改写对象的公开实验，晚于 [05 STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md) 一年、早于 [04 DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)。坐标系见 [02 Model–Harness–Artifact](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)。**不是** Schmidhuber 的 Gödel machine：没有证明搜索器，改写不需要先证有用。**不是**完整 RSI：权重 $\theta$ 冻结，效用 $U$ 和目标提示由人写死。**不是** SPIN / SEAL（那些改 $\theta$）。**不是** AlphaEvolve（那边进化交卷程序，发现者可以整段不动）。一手：Yin, Wang, Pan, Lin, Wan, William Yang Wang，[arXiv:2410.04444](https://arxiv.org/abs/2410.04444)；北大 / UCSB / 亚利桑那；代码 [Arvid-pku/Godel_Agent](https://github.com/Arvid-pku/Godel_Agent)。优化环用 **gpt-4o-2024-05-13**，交卷策略和基线评测用 **gpt-3.5-turbo-0125**。

## 1. 问题：手写管道和固定元算法都把搜索空间切掉一块

论文把现有系统收成三档，自由度从低到高。

**手写 Agent。** 模块清单是人定的：提示工程、思维链、反思、工具、检索、多 Agent。部署之后这段图不变。[Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)、LLM Debate、Step-back 都落在这里。它们可以在一次任务里迭代答案，但**不会改自己下次怎么迭代**。机制数字只认 Madaan Table 1，不要用本篇 / ADAS 下游表回写。

**元学习优化的 Agent。** 模块或提示可以被搜，搜的手续本身钉死。ADAS（Hu, Lu, Clune，[arXiv:2408.08435](https://arxiv.org/abs/2408.08435)）的 Meta Agent Search 是这一档的对照：元 Agent 永远是人写的那只，下游 Agent 的设计空间被元算法切开。DSPy、自然语言梯度、从成功轨迹里攒示范，形状同类。改进发生了，改进器 $I$ 仍在墙外。

**自指 Agent。** 论文把 Gödel Agent 放进这一档：策略 $\pi$ 和决策函数 $f$（文中也写成改进器 $I$）都可以在运行时被改，包括改 $f$ 自己的代码。灵感来自 Gödel machine，但立刻丢掉「先证明再切换」——作者承认当前语言模型证不了一次改写对 LLM Agent 有净收益。自指在文里的操作定义很窄：能内省并读写自己的代码和文件，**不暗示意识**。脚注写明这一点，读的时候不要把 self-awareness 听成哲学。

三档对照的用处，是挡住一种常见串台：看见「Agent 会改代码」就宣布 RSI。手写 Agent 改的是**答案**；元学习改的是**下游模块**，元算法不动；Gödel Agent 声称连元算法也可以动。声称能不能站住，看实现和数字，不看标题。

## 2. 循环：四个动作，主函数必须是递归

形式对象先钉死。$\pi$ 是当前任务策略（实验里是 `solver` 这类 Python）。$f$ 是决策函数：看见当前 $\pi$、自身代码 $s$、效用回报 $r$、高层目标 $g$，吐出一串动作。$U(\mathcal{E},\pi)$ 是环境效用，实验里就是验证集准确率。$\texttt{SELF\_INSPECT}$ 从运行时内存读出当前代码，包括算法 1 自己。

算法 1 的骨架：先 `SELF_INSPECT` 拿到 $s$，用 $U$ 打一份初始分，再进入 `SELF_IMPROVE`。`SELF_IMPROVE` 让 $f$ 给出动作序列，逐个 `EXECUTE`。动作集合至少四类：

$$
\begin{aligned}
\texttt{self\_inspect}&:\quad s\leftarrow\texttt{SELF\_INSPECT}()\\
\texttt{interact}&:\quad r\leftarrow U(\mathcal{E},\pi)\\
\texttt{self\_update}&:\quad (\pi,s)\leftarrow a.\texttt{code}\\
\texttt{continue\_improve}&:\quad (\pi,s)\leftarrow\texttt{SELF\_IMPROVE}(\mathcal{E},\pi,s,r,g)
\end{aligned}
\tag{1}
$$

第四个动作把主循环收成**递归**而不是 `while True`。原因很具体：Python 里若主函数已经在跑，普通循环改不了「正在执行的那一帧」；递归进入下一深度时，新逻辑才整段生效。STOP 的递归是 $I_t=I_{t-1}(\hat u,I_{t-1},L)$，对象是改进器源码字符串；这里的递归是**调用栈上的自调用**，对象是进程里的函数对象。两者都叫 recursive，机制不是同一个。

$\pi$ 和 $I$（决策逻辑）以及动作集合 $\mathcal{A}$ 理论上都可以被 `self_update` 扩写。论文写：当前这次执行结束后，代码才更新到 $(\pi_{t+1},I_{t+1})$。这和「边跑边热替换每一行」不是一回事，更接近「这一深度用旧逻辑，下一深度用补丁」。

高层目标 $g$ 是附录 A 那份 **goal prompt**。它不写 DROP / MGSM 题面，只告诉 Agent：你是 `agent_module` 里正在跑的实例，可以改逻辑、跑代码、调用 LLM；先分析再动手；`solver` 的接口不要改。具体任务靠环境反馈进来。这一点和 STOP 的 grey-box 元效用同形：考官不把下游题写进「你是谁」的提示，避免直接背题。

![Gödel Agent：四动作递归；底栏权重与效用冻结](./images/fig-godel-actions.png)

> 图 1：实线按 inspect → interact → update 走；虚线是 `continue_improve` 进入下一深度。底栏权重和 $U$ 不进补丁。

**图 1 解析**

- **self_inspect**：读运行时里的 $\pi$ 和 $I$，不是读仓库里另一份静态文件就算完。实现靠 Python 的全局/局部名字空间。
- **interact**：调用 $U$。没有这一步，后面的改写没有对错信号，只剩模型自己觉得变好了。
- **self_update**：生成新代码，monkey patch 进内存。这是「自改」的全部操作含义。
- **continue_improve**：递归。失败时论文还有错误处理：当前序列停掉，带着报错进下一时间步，避免一次 `SyntaxError` 把整个自改进掐死。
- **底栏冻结**：优化器用的 gpt-4o 权重点不着；$U$ 的定义（哪份验证集、怎么打分）由人固定。

辅助工具不是自指的必要条件，但作者承认当前 LM 撑不住「从零长出全部任务代码」，所以一开始就塞了四件：先想再动手、错误恢复、跑 Python / Bash、调 LLM API。消融见第 5 节：前两件掉分狠，后两件 Agent 自己也能补。

## 3. 实现：monkey patch 是工程，不是理论机器

自指可以有很多实现。这篇选的是 **runtime memory**：动态读类和模块，动态写回去。文献里的说法是 monkey patching（文引 Bimal 2012 的归档页）。任何一次递归优化中的具体 Agent，都可以看成 Gödel Agent 的一个实例——种子 CoT 也算，搜出来的 DFS 也算。

模块结构按论文图 3：传感器和执行器都能读写自己的代码。目标提示赋予「完全自主」的修辞，真正能改的仍是这段 Python 进程允许改的对象。附录 A 把动作收成更细的名字：`action_adjust_logic`、`action_run_code`、`action_evaluate_on_task`、`action_display_analysis`、`action_call_json_format_llm`。约束写得很硬：改之前确认 import；不要改函数接口；`solver` 调试不要 `print`，把信息 return 回去；表现不涨就换方法，并点名可以试 Debate、Step-back、动态角色。这些句子本身就是人写的 $I_0$。读到「无限制搜索 Agent 设计空间」时，要记得 $I_0$ 和工具清单已经把空间切过一轮。

![Gödel Agent：运行时里动的是 π 和 I，冻的是权重和效用](./images/fig-godel-frozen.png)

> 图 2：左栏策略和改进器在内存里互改；右栏 $\theta$ 与 $U$ 不进 monkey patch。

**图 2 解析**

- **Policy $\pi$**：任务求解器。Game of 24 上可以从 LLM 提示换成排列搜索。DROP 上可以变成多角色 CoT 再 Self-Consistency。
- **Improver $I$**：决定何时 inspect / update / 递归。论文声称这一段也可以被改；Limitation 写明：一旦改坏递归模块，后续自优化会停。100 次 MGSM 试验里意外终止约 **4%**，作者把主因归到改递归模块。
- **Weights $\theta$**：gpt-4o 写补丁，gpt-3.5-turbo 跑交卷策略。两边权重都不在补丁范围。
- **Utility $U$**：验证集。GPQA 验证 32 / 测试 166，评五次；其余域验证 128 / 测试 800，评一次。DROP 跟 OpenAI simple-evals 用 one-shot，其余 zero-shot。子集划分跟 ADAS 对齐，为的是对照而不是刷全量榜。

「能改 $I$」和「实验里真的经常改 $I$」不是同一句话。附录 E 的 MGSM 轨迹更常见的是改 $\pi$：第 6 轮长出 parse-deduct-execute-validate，第 14 轮用错例摘要加 checklist，第 20 轮提示词滑向难以核对的修辞（文里那句 rabbit-proof syntax tactline）。把后一种当成「改进器智能在涨」，证据不够；更像提示在验证集上漂移。本花园把可核对的部分留在 $\pi$ 的结构变化和 Table 1，不把第 20 轮文案当机制胜利。

## 4. 数字：公平对照看 Gödel-base，Gödel-free 要单独读

Table 1 把三档放在同一张表。基线数字论文写明 **refer to Hu et al. (2024)**，也就是 ADAS 那套评测脚手架。交卷模型统一是 gpt-3.5-turbo-0125。Gödel-base 是加了约束、用来公平对照的版本（表上写 Closed-book; GPT-3.5）；Gödel-free 是无约束实现，表上用斜体，**不能直接和手写 Agent / ADAS 比绝对分**。

| 系统 | DROP (F1) | MGSM | MMLU | GPQA |
|------|-----------|------|------|------|
| CoT | 64.2 ± 0.9 | 28.0 ± 3.1 | 65.4 ± 3.3 | 29.2 ± 3.1 |
| CoT-SC | 64.4 ± 0.8 | 28.2 ± 3.1 | 65.9 ± 3.2 | 30.5 ± 3.2 |
| Self-Refine | 59.2 ± 0.9 | 27.5 ± 3.1 | 63.5 ± 3.4 | 31.6 ± 3.2 |
| LLM Debate | 60.6 ± 0.9 | 39.0 ± 3.4 | 65.6 ± 3.3 | 31.4 ± 3.2 |
| Meta Agent Search (ADAS) | 79.4 ± 0.8 | 53.4 ± 3.5 | 69.6 ± 3.2 | 34.6 ± 3.2 |
| **Gödel-base** | **80.9 ± 0.8** | **64.2 ± 3.4** | **70.9 ± 3.1** | **34.9 ± 3.3** |
| Gödel-free（斜体，无约束） | 90.5 ± 1.8 | 90.6 ± 2.0 | 87.9 ± 2.2 | 55.7 ± 3.1 |

公平句只允许说到 Gödel-base。相对 ADAS：MGSM **53.4→64.2**（文中写 outperformed it by 11%，指约 11 个百分点），DROP 79.4→80.9，MMLU 69.6→70.9，GPQA 34.6→34.9。数学任务空档最大，科学问答几乎贴着元搜索。作者的解释：推理题给脚手架更多可改结构；ADAS 还要按任务设计不同模块，Gödel Agent 种子可以只是 CoT，其余自己长。GPQA 几乎不动，说明「自指」不是万能放大器——题难、验证集只有 32 道时，改 $\pi$ 也挤不出分。

Gödel-free 的 90.6% MGSM 经常被二手摘要单独截出来。表注已经用斜体标了 no constraints。本篇**不把这条写成打败 ADAS 的主结果**。无约束版本可以引入基线没有的工具、检索或闭卷之外的通道；论文没有在主文把「无约束」展开成一张清单。能钉的只有：作者自己把它从公平对照里拿出去。读到百度百科一类「MGSM 53.4% 提到 90.6%」的句子，先问它有没有写 Gödel-base。

附录 D：完整演化（30 次递归自改进）在四套数据上大约 **15 美元**，ADAS 的 Meta Agent Search 大约 **300 美元**。差在收敛更快、以及历史记忆一直涨——作者认为更好的遗忘还能再压成本。这是美元量级对照，不是「更智能」的证明。优化器是 gpt-4o，基线评测是 gpt-3.5-turbo：15 美元买的是 **gpt-4o 写脚手架、gpt-3.5 去考试**。换一句：分数涨在 Harness，不在交卷模型的权重。

附录 G 挡「其实是 gpt-4o 多采几次」。30 次独立随机采样，提示与 Gödel Agent 的种子策略相同，优化器同样是 GPT-4o，准确率贴在 **30%** 上下——和 Table 1 里 CoT 的 MGSM 28.0% 同一量级。Gödel Agent 会中途掉分，但能靠 $U$ 纠回来。没有效用反馈的多次采样，不是这篇的机制。Figure 6 只证明「有反馈的递归」不同于「同提示重抽」，不证明已经逼近设计空间的全局最优。

附录 C 记录四套任务上搜到的典型 $\pi$。DROP：多角色独立 CoT，再 Self-Consistency。MGSM：逐步自校验加 CoT-SC。MMLU：few-shot 加 CoT-SC。GPQA：基于角色提示的多样化 CoT-SC。结构都落在 2022–2024 已发表的脚手架家族里。新颖性与 STOP 同一句：新的是**自动检索并写进自己的运行时**，不是从零发明 Self-Consistency。Limitation 写得直白：作为第一个自指 Agent，它必须自己长出任务相关代码，所以**不和 OpenDevin 这类砸了几个月人工的系统比**；实验只想证明递归自改进可行。

## 5. 鲁棒性、消融、Game of 24

MGSM 上 100 次优化试验：优化过程中途表现掉下去的占 **92%**；最终比种子策略还差的占 **14%**；意外终止 **4%**。中途掉分是常态，不是事故。作者把能走回来归因于错误处理和「表现跌了就换方向 / 退回先前较好算法」。没有开放档案（那是后来 DGM 的设计），单轨迹仍可能死在一次坏的递归模块改写上。

Table 2 对初始工具做消融，数字相对 Gödel-base 的 MGSM 64.2：

| 去掉 | MGSM | 相对 64.2 |
|------|------|-----------|
| 先想再动手（think） | 50.8 | −13.4 |
| 错误处理（err） | 49.4 | −14.8 |
| 跑代码（run） | 57.1 | −7.1 |
| 调 LLM API | 60.4 | −3.8 |

前两件是撑住递归的工程，不是锦上添花。语言模型写代码会引入语法和接口错误；没有报错回传，下一深度不知道上一刀砍坏了什么。跑代码和调 API 掉得少，因为 Agent 可以自己在 `self_update` 里把这两件补出来——一开始塞进去主要是为了收敛速度。

Game of 24 是机制案例，不是主榜。种子是 LLM 提示求解。六个不成功的优化尝试之后，Agent 把这一段整段重写成分支搜索（排列 + 递归试运算），准确率到 **100%**。这正好展示 Harness 自改允许的跳跃：不必在「更好的提示」里打转，可以直接离开语言模型求解器。图 5b 还扫了不同种子：ToT、CoT、普通指令、故意格式错误的提示。不同起点收敛速度不同，但论文用这张图论证「不被初始方法锁死」。100% 只对这个封闭小游戏成立；不要外推到 SWE-bench。DGM 后来在仓库修补上证明：开放环境里自改要档案和门控，单轨迹重写一次就 100% 不是常态。

Figure 4 统计各任务上动作次数：和环境交互很频繁，改逻辑穿插其中，错误处理占比高。这和「一次补丁改造成功」的想象相反。真实过程更像带报错的试错，效用 $U$ 是唯一的外在尺子。

## 6. 和邻居：同一层自指，对象不一样

按 [01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md) 式 (2)：$S$ 取当前 Agent 源码（含决策函数），$I$ 是这段源码里负责改 $S$ 的部分，$I'\subseteq S'$ 且下一轮 $S''=I'(S')$ 在运行时有定义——**Harness 层弱候选成立**。缺的仍是三件：$\theta$ 冻结；$U$ 和 goal prompt 在墙外；没有「先证明再切换」，14% 的试验会比种子更差。混元口径里改改进器是 L3、改考纲是 L4，本实验的 $U$ 不动，到不了 L4。

| | 改什么 | $\theta$ | 递归对象 | 种群 |
|--|--------|----------|----------|------|
| STOP | 改进器 Python | 冻（gpt-4-0314） | $I$ 对自己 + 元效用 | 单轨迹 |
| Gödel Agent | 运行时 $\pi$ 与 $I$ | 冻（gpt-4o 写、gpt-3.5 考） | 递归 `SELF_IMPROVE` | 单轨迹 |
| DGM | Agent 的 Python | 冻 | 自改 + 档案父母 | 开放档案 |
| ADAS | 下游 Agent 设计 | 冻 | 元 Agent 固定 | 搜索树 |
| AlphaEvolve | 交卷程序 | 冻 | 发现者可不改 | 进化种群 |

STOP 把改进器当成可求值的优化题，元效用 $\hat u$ 是预优化。Gödel Agent 没有这套 grey-box 平均，反馈就是当前任务验证集；$I$ 和 $\pi$ 挤在同一段 monkey patch 里。DGM 承认单轨迹会被一次坏补丁杀死，所以加档案和「还能不能编辑」的门。ADAS 的元 Agent 永不自改，是 DGM 消融 w/o self-improve 的原型，也是 Table 1 里 Gödel-base 要赢的那一行。四篇都是 Harness 自指，深浅不同：STOP 最瘦、Gödel Agent 把循环做成递归函数、DGM 把种群打开。

和 Gödel machine 的名字亲近，理论距离远。Schmidhuber 的对象是可证最优的自指求解器，`switchprog` 被允许改证明搜索器自己，不可证的改进必须忽略。Gödel Agent 用验证集分数代替证明，用 gpt-4o 采样代替证明搜索。导读里那条已经写过：不要用前者的定理给后者的分数背书。本篇标题里的 Gödel 是修辞，判定仍走术语式 (2) 和三层坐标。

产品 harness（Claude Code / Codex / 沙箱）回 [llm-guide 13.5.1](../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md)。那些系统也会改工作区里的文件，默认改的是**用户仓库**，不是 Agent 自己的决策函数。会 `apply_patch` ≠ 本篇的 `self_update`。

## 7. 失效：验证集过拟合、递归模块被改坏、标题夸大

验证集只有 128 道（GPQA 32 道）时，搜索脚手架等于在这 128 道上爬山。论文跟 ADAS 用同一划分，对照内部自洽，**不能**读成全量 MGSM / MMLU 的新 SOTA。Gödel-free 更要把「无约束」当成未展开的自由度，而不是 90% 已经进了教科书。

单轨迹没有证明门。92% 中途掉分说明 $U$ 在抖；14% 最终更差说明递归不是单调算子。STOP 在弱模型上均值往下走，本篇主实验没有换弱优化器做对称消融——优化器固定是 gpt-4o。不能从 Table 1 推出「任意基座套上 monkey patch 都会涨」。

目标提示已经点名 Debate、Step-back、角色分工。搜出来的 $\pi$ 大量落在这份菜单里，并不意外。Game of 24 换成 DFS 是菜单外的跳跃，值得单独记；主榜四任务没有同等戏剧性的算法替换。

安全面论文几乎没做 STOP 那种绕沙箱统计。goal prompt 写了 unrestricted access、可装外部库。本花园不把没测的沙箱绕过补写成 0。工程上这是比 STOP 更「敞」的运行时：STOP 至少还在效用字符串里藏预算和沙箱开关，Gödel Agent 把改全局名字空间当成卖点。

**读**：式 (1) 四个动作；Gödel-base 相对 ADAS 的 MGSM 11 个百分点；15 美元 / 30 轮；100 次试验的 4% / 92% / 14%；think 与 err 消融；Game of 24 换成搜索。  
**不读**：把 Gödel-free 的 90.6% 写成公平对照、把标题 Gödel 听成已实现可证自改、把 monkey patch 听成改了 gpt-4o 的权重、把 100% 的 24 点游戏听成开放编码智能。

同层元学习锚点：[07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)。同层前一篇：[05 STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md) 把改进器当成优化题。同层档案版：[04 DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)。验证门：[01 Argus](../01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。产物层：[03 AlphaEvolve](../../4-Artifact层-产物发现/03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md)。数字只认 arXiv:2410.04444 的 Table 1、Table 2、附录 B/D，不认百科把 Gödel-free 和 ADAS 拼成一条涨幅。LinkedIn / 专栏转写不当事实源。

## 参考文献

1. Yin, X., Wang, X., Pan, L., Lin, L., Wan, X., Wang, W. Y. (2024). [Gödel Agent: A Self-Referential Agent Framework for Recursive Self-Improvement](https://arxiv.org/abs/2410.04444). arXiv:2410.04444. Table 1、Table 2、gpt-4o-2024-05-13 / gpt-3.5-turbo-0125、附录 B 子集与附录 D 成本以该文为准。
2. Hu, S., Lu, C., Clune, J. (2024). [Automated Design of Agentic Systems](https://arxiv.org/abs/2408.08435). arXiv:2408.08435. Meta Agent Search；Table 1 基线来源。
3. Zelikman, E., et al. (2024). [STOP](https://arxiv.org/abs/2310.02304). COLM 2024. 改进器递归，不是运行时 monkey patch。
4. Schmidhuber, J. (2003). [Gödel Machines](https://arxiv.org/abs/cs/0309048). 形式证明版；本篇不实现。
5. 代码：[Arvid-pku/Godel_Agent](https://github.com/Arvid-pku/Godel_Agent)（论文链接）；镜像 [PKU-ONELab/Godel_Agent](https://github.com/PKU-ONELab/Godel_Agent)。
6. 本花园：[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)；[05 STOP](../05-STOP-自教优化器/05-STOP-自教优化器.md)；[04 DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)。
