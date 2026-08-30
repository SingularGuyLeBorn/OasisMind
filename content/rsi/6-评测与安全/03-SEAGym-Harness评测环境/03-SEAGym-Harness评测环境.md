---
title: "03 · SEAGym：单条曲线看不见的 harness 更新"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  SEAGym（arXiv:2606.17546）：评的是 harness 更新过程，不是算法。
  DeepSeek-V4-Flash 上 AHE 验证 +17.1、ID +9.1、OOD +6.3；TF-GRPO 验证同样 +17.1，OOD −2.5。
  第 4 epoch 回放掉到 6/80。不是 RSI。
tags:
  - RSI
  - SEAGym
  - 评测
  - Harness
  - ACE
  - AHE
  - TF-GRPO
---

# 03 SEAGym：涨分曲线不够当评测

自进化 Agent 的改进，多半落在 **harness**：prompt、记忆、技能、工具、中间件、运行时状态、模型和工具的交互环。现成 Agent 榜把每次试验当成孤立 episode，状态一题一清，刚好把「下次还用的那坨」评掉了。剩下的人画一条验证分随 epoch 往上的线，又把过拟合、遗忘、变贵、中途崩掉藏进一个终点。SEAGym 把问题翻过来：对象不是最终 Agent 高不高，而是**一次 harness 更新有没有可复用、有没有伤旧行为、花了多少**。

本篇是第 6 章的过程评测样板，和 [01 RSIBench-Data](../01-RSIBench-Data/01-RSIBench-Data.md) 分工：那边冻后训练栈、只让 Agent 改数据，问发现有没有单调；这边冻基座 $M$，让各方法按自己的规则改 $H_t$，问验证增益会不会迁到留出集。和 [02 可靠性阶梯](../02-可靠性与独立监督/02-可靠性与独立监督.md) 的差是：那边写原则（证据必须在更新边界之外），这边把原则收成冻结的 update-val / ID / OOD / replay 视图。仓库 README 的原话可以当层判断：SEAGym 是 evaluation framework，不接受、不拒绝、不回滚 Agent 更新。它记录 checkpointed 状态，再用互补视图把可复用改进、过拟合、遗忘、成本、可靠性偏移暴露出来。缺少回滚，正是它不是改进器的证据。**不是**完整 RSI：$M$ 冻着，日程、切分、Harbor 验证器都在墙外。一手：Zheng, Xue, Liang, Yang, Zhang，清华自动化系，[arXiv:2606.17546](https://arxiv.org/abs/2606.17546)；代码 [antropy-research/SEAGym](https://github.com/antropy-research/SEAGym)。实例化在 Terminal-Bench 2.0 与 HLE；主表三条基线 ACE、TF-GRPO、AHE，骨干 **DeepSeek-V4-Flash**。

## 1. 问题：静态榜清状态，终身榜又只剩一条流

论文把自进化 Agent 写成：用任务经验更新持久 harness，再把更新后的状态用到后面的题。更新可以发生在一题之内、题与题之间、或对同一批题多轮 epoch。改的东西也不一样：文本方法改 prompt / 反思 / 经验库；记忆与技能方法堆可复用工件；harness 级方法改工具、中间件、子 Agent、工作流、项目文件。交互环形状相同——行动、看轨迹和 verifier、更新、再行动——所以评测必须量**更新过程**：证据从哪来、快照何时涨何时掉、增益能不能离开更新源、引入了什么成本和不稳。

静态榜（SWE-bench、WebArena、OSWorld、GAIA）测固定 Agent、独立 episode。顺序 / 终身评测（SEA-Eval、LifelongAgentBench）开始看任务流，但单任务适应、epoch 级学习、遗忘与回退仍覆盖不全。SEAGym 的补法不是再造一套任务，而是把 **Harbor 兼容的现成榜**收成动态源：训练批次、冻结的更新验证、留出 ID / OOD、回放诊断、保存的快照和指标记录。Harbor 管执行、环境、验证器、并行；SEAGym 管日程。SkillEvolver 那篇里 Harbor 已经出现过，那里它是技能写作的容器；这里它是评测执行层。

## 2. 形式：$A_t=(M,H_t)$，环境不管 $U$ 怎么写

一次自进化 run 收成 MDP 风格的评测过程

$$
\mathcal{M}=(\mathcal{S},\mathcal{A},P,R,\rho). \tag{1}
$$

状态 $s_t$ 装着当前 Agent 快照、日程位置、可见任务上下文。快照拆开：

$$
A_t=(M,H_t). \tag{2}
$$

$M$ 是冻结的基座和不可变运行时；$H_t$ 是可变 harness：prompt、记忆、技能、经验库、工具、中间件、项目文件、运行时配置。第 $t$ 步环境抽训练批次 $B_t$，Agent 做题得到轨迹 $\mathcal{T}_t$ 和按可见性政策给出的反馈 $F_t$，再套**方法自己的**更新

$$
H_{t+1}=U(H_t,B_t,\mathcal{T}_t,F_t). \tag{3}
$$

SEAGym 规定任务分布、反馈、日程、评估视图，**不规定** $U$。接入一条新基线只要薄包装：把轨迹批次译成该方法的原生更新输入，再把新的 $H$ 存成快照。ACE 从轨迹长持久上下文（Zhang et al., 2026）；TF-GRPO 用分组 rollout 证据更新经验库、不训权重（Cai et al., 2025, arXiv:2510.08191）；AHE 用可观测性改更宽的 harness——prompt、中间件、记忆、项目文件（Lin et al., 2026, arXiv:2604.25850）。三条都走同一套 Harbor 执行。

日程参数化，而不是三种榜：状态是否持久、题目是否复用、batch size、更新次数、评估时机。主实验取持久状态、重复训练批次、按 batch 更新、epoch 末冻结 update-validation。附录 Algorithm 1 把环写死：对每个 epoch、对每个训练 batch 做 Harbor rollout → 调一次 $U$ → 存快照；epoch 末把当前 Agent 冻成 $E_i$，只在 $V_{\mathrm{update-val}}$ 上评估；全部 epoch 结束后才拿 $A_0$ 与 $A_T$ 打 ID / OOD / replay。默认五 epoch、batch 20，每训练 batch **一次** SEAGym 更新。验证和终局视图单次尝试；TF-GRPO 自己的分组 rollout 记在方法侧，不和 SEAGym 更新次数混加。任务超时 1800 秒、并发 16，除非某次 run 改配置。切分：源训练 **80** 题（Terminal-Bench 2.0 + HLE 纯文本数理）、源验证 **35**、源测试 **55**、OOD **80** 题（HLE 的 CS/AI 与工程）。HLE-only 消融的 ID 测试是 50 不是 55，Table 7 写明，不要和主表混。切分的 task id 会写进 run 产物。指标可以离线重算，不必依赖内存里的抽样状态。这是「过程评测」能被别人核对的最低条件：换一台机器，用同一份 id 列表应得到同一组 Perf / UVG。主 AHE 配置记 720 行（含训练、update-val、终局执行）；TF-GRPO 1120 行，多出来的是方法原生分组证据，不要当成多跑了验证。

和 SEA-Eval、LifelongAgentBench 的差：那两份构造顺序任务流，把「真进化」和「多花 token」拆开。SEAGym 不新造任务定义，只存 task id、稳定属性、切分成员、日程与快照记录；Harbor 继续当执行衬底。Terminal-Bench 2.0 是可执行命令行 / 软件工程；HLE 源任务用数理问答，OOD 换成 CS/AI 与工程——执行重和推理重各给一块，不是同一张卷拆两半。

评估视图（Table 1）和切分不是同一件事。切分管谁能被看见、谁能当更新证据。视图是评估镜头：

| 角色 | 视图 | 问的是 |
|------|------|--------|
| 更新证据 | $B_t\subset D_{\mathrm{train}}$ | 下一刀 $H$ 靠哪些轨迹和可见反馈 |
| 过程 | $V_{\mathrm{update-val}}\subset D_{\mathrm{val}}$ | 冻结中间快照有没有涨，验证题不当证据 |
| ID 迁移 | $V_{\mathrm{ID}}\subset D_{\mathrm{test}}$ | 同源分布的未见题 |
| OOD 迁移 | $V_{\mathrm{OOD}}\subset D_{\mathrm{test}}$ | 移位或目标域 |
| 回放 | $V_{\mathrm{replay}}$ | 旧行为还在不在 |

指标从保存记录算，不必重跑环境。给定 verifier 分 $r(A,x)\in[0,1]$，

$$
\mathrm{Perf}(A,D)=\frac{1}{|D|}\sum_{x\in D}r(A,x),\qquad
\mathrm{SR}(A,D)=\frac{1}{|D|}\sum_{x\in D}\mathbb{I}[r(A,x)=1]. \tag{4}
$$

update-validation 视图 $V$ 上，相对上一评估点、相对 $E_0$：

$$
\mathrm{UVG}^{\mathrm{prev}}_i=\mathrm{Perf}(E_i,V)-\mathrm{Perf}(E_{i-1},V),\qquad
\mathrm{UVG}^{\mathrm{base}}_i=\mathrm{Perf}(E_i,V)-\mathrm{Perf}(E_0,V). \tag{5}
$$

终局 $D_I$、$D_O$、$D_R$ 是 ID / OOD / 回放底下的题集：

$$
\mathrm{IDG}=\mathrm{Perf}(A_T,D_I)-\mathrm{Perf}(A_0,D_I),\qquad
\mathrm{OODG}=\mathrm{Perf}(A_T,D_O)-\mathrm{Perf}(A_0,D_O), \tag{6}
$$

$$
\mathrm{FR}=\max\bigl(0,\,\mathrm{Perf}(A_0,D_R)-\mathrm{Perf}(A_T,D_R)\bigr). \tag{7}
$$

主表用域级宏平均，避免大组压小组。另报 token、工具调用、墙钟。过程诊断（轨迹引用、harness diff、可选离线 LLM 评注）是二级，**不能**替代可执行任务奖励。主表 UVG 是验证最好快照相对 $V_0$，对应 $\mathrm{UVG}^{\mathrm{base}}$，不是相邻 epoch 的 $\mathrm{UVG}^{\mathrm{prev}}$。AHE 的最好快照恰好是终局，IDG / OODG 和 $A_T$ 对齐；ACE、TF-GRPO 的 ID / OOD 来自验证最好快照，**不一定**是最后一个 epoch。读表先看这一行。

![训练批次经 Harbor 更新 $H$，四条虚线只打冻结视图，验证不得回写 $U$](./images/fig-seagym-views.png)

> 图 1：实线是一轮训练证据 → 原生更新 → 快照。虚线是冻结评估。$V_{\mathrm{update-val}}$ 不进 $U$。

**图 1 解析**

- **$B_t$**：只从 $D_{\mathrm{train}}$ 抽。这是更新证据。
- **Harbor rollout**：执行层，和 SkillEvolver 共用容器，职责不同。
- **$U$**：方法自己的规则。环境不管怎么写。
- **四视图**：验证 / ID / OOD / 回放。互补，不是四个可以加总的分。
- **底栏虚线 persist $H$**：持久状态进入下一 epoch，不是把验证分喂回去。上排四个框是证据路径，下排四个框是冻结镜头；虚线只从上排快照指向镜头，没有反向。

## 3. 数字：验证 +17.1 可以对应 OOD −2.5

Table 2，DeepSeek-V4-Flash，报的是**验证最好快照**（AHE 的最好快照恰好是终局）。成功率百分数，增益是百分点，token 按每题或每次更新归一。

| 方法 | $V_0$ | $V_\star$ | UVG | ID0 | ID$\star$ | IDG | OOD0 | OOD$\star$ | OODG | rollout/题 | 更新/次 |
|------|------:|------:|----:|----:|------:|----:|-----:|-------:|-----:|-----------:|--------:|
| AHE | 40.0 | 57.1 | **+17.1** | 40.0 | 49.1 | **+9.1** | 22.5 | 28.8 | **+6.3** | 1.46M | 3.91M |
| ACE | 37.1 | 40.0 | +2.9 | 30.9 | 34.5 | +3.6 | 22.5 | 25.0 | +2.5 | 1.93M | — |
| TF-GRPO | 31.4 | 48.6 | **+17.1** | 30.9 | 34.5 | +3.6 | 26.3 | 23.8 | **−2.5** | 2.33M | 1.60M |

只有 AHE 验证、ID、OOD 一起涨。它改执行路径本身：怎么搜证据、怎么验收、工具出错怎么恢复、何时停。可编辑面大，迁移最好，伤害面也大——一次有害中间件改动能拖垮一串本来无关的题。附录 Table 8 把三条的**留下的工件**拆开，数字才对得上对象。ACE 选中的 E4 快照有 **13** 条活跃技能，几乎都是可迁移的执行习惯：写完读回输出、枚举题面约束、超时前先交一个候选、缺包先装再放弃。它们是 prompt 里看得见的手续提醒，并不等价于 verifier。TF-GRPO 存的是任务族经验：先跑失败测试、QEMU 走 QMP、数据管道做往返检查、二进制解析用无符号读、推理前看 label map。AHE 的更新清单加文件 / web / session 工具、上下文压缩、HLE 完成强制、中间件消息契约对齐——改的是运行时行为和完成协议。三种增益不能横着加。

ACE 更像技能 / 策略记忆：有可复用的做题知识，但不改工具契约，验证增益就小。TF-GRPO 夹在中间：分组 rollout 很快抬源分布，验证 +17.1 和 AHE 一样，ID 只有 +3.6，OOD 掉 2.5，rollout 最贵。附录 B.5 的记录预算把「贵」钉成数：主 AHE 约 **1053.8M** rollout / **78.1M** 更新、Harbor 任务运行时 14h06m；ACE **1384.0M** rollout、更新 token 未暴露、13h55m；TF-GRPO **2615.1M** rollout / 32.0M 更新，行数 1120（主表另外两条 720），因为分组证据额外占了训练侧 rollout。这些是任务执行记录加总，**不是**端到端墙钟，原生更新时间和排队没按方法对齐记录。**验证增益不等于迁移。** 这是本篇要钉死的一句。

回放把「终局表」拆开。AHE 在初始化、每个 epoch、终局重跑 80 道源训练。附录 Table 13 把快照钉死：$A_0$ 34/80（4 次 rollout 错）；$E_4$ 38；$E_8$ 37；$E_{12}$ 42（崩前最好中间态）；$E_{16}$ **6/80、66 次 rollout 错**；$A_T$ 43/80（5 次错）。相对 $A_0$ 修了 13 道当初不会的、忘了 4 道当初会的，净 +9。主文写「第 4 epoch 掉到 6/80」，对应的是 $E_{16}$——五 epoch × 每 epoch 四个 batch，大约第 16 次更新。

$E_{16}$ 不是普通 catastrophic forgetting。保存的更新摘要把主导原因写成 **NexAU 消息序列契约**被破坏：中间件注入的消息不再满足 token 计数器和 schema 期望的类型。Iteration 19 先把旧字典消息换成 `Message(role=..., content=...)`，content 仍是裸字符串；Iteration 20 才包成 `[TextBlock(text=...)]`。修完后当前 batch 成功从 1/20 回到 10/20，回放错误 66→5，$A_T$ 相对 $E_{16}$ 多 38 道、只少 1 道。若干当初就会的题（compile-compcert、configure-git-webserver）在 $E_{16}$ 变 ERR、终局又 S——这是执行路径断了，不是模型忘了题。也有终局仍忘的（hle 一例 $A_0$ S → $A_T$ F），净 +9 不是无损保留。

早几轮加上文件 / web 工具、完成控制、HLE 验证拦截（没研究证据不许交）、产物清理（polyglot-c-py 多留下一个编译产物）。这些改的是动作空间和完成条件，不是单题记忆。mailman 早解决过又丢、终局再拿回来；rstan-to-pystan 一路 ERR 直到终局才 S。只报初末 34→43，这条悬崖和契约修补看不见。

batch size 也不是越大越好。同一套训练 / 验证 / ID，AHE：

| batch | 验证 | ID | 更新 token | 更新次数 |
|------:|------|-----|-----------:|---------:|
| 10 | 37.1→22.9（−14.3） | 38.2→23.6（−14.5） | 3.13M | 39/40 |
| 20 | 40.0→57.1（+17.1） | 40.0→49.1（+9.1） | 3.91M | 20/20 |
| 40 | 37.1→40.0（+2.9） | 41.8→43.6（+1.8） | 3.36M | 10/10 |
| 80 | 42.9→25.7（−17.1） | 41.8→25.5（−16.4） | 3.57M | 5/5 |

每次更新大约 3–4M token，batch 加大并不按比例给分析容量。80 一次要看太多轨迹，容易改出又宽又脆的中间件；10 证据太少、更新次数翻倍，回归有更多机会累积。只有 20 在证据多样性、逐题深度、更新频率、稳定性之间站住。

源多样性：HLE-only 同样训练量，终局验证 / ID / OOD 全塌到 **0.0**（ID 相对初值 −22.0，OOD −21.2）。中间第 3 epoch 其实有过有用快照（ID 47.3，+7.3；OOD 25.0，+3.8）。单榜会把 harness 赶进榜面局部最优。混合源也会经过坏中间态，多样性不阻止有害更新，它给的是**恢复**：Terminal-Bench 暴露工具和环境失败，HLE 暴露推理失败，后面的更新才有材料把坏掉的契约修回来。

跨模型。同一骨干上进化再换骨干评：同骨干 ID 都正，+3.6 到 +9.1。骨干是 DeepSeek-V4-Flash、GLM-5.1、GPT-5.4，一次 run 一只。跨骨干不对称：DeepSeek 进化的 harness 给 GLM ID **+7.3**，给 GPT-5.4 ID **−3.6**；GPT-5.4 进化的给自己 ID **+5.5**，给 GLM ID **−7.3**。更新产物对得上：DeepSeek 轨迹让 AHE 改验证、工具恢复、产物清理、消息契约；GLM 偏纯文本推理、research without output；GPT-5.4 偏产物约束和验证是否足够。失败面相似才迁得动。ID 正也不等于 OOD 正：GPT-5.4 进化的 harness 自己的 OOD **−7.5**。只报原生 ID，三套骨干都像在变好；OOD 和跨骨干把「拟合了训练骨干看见的交互失败」拆出来。Table 7 把运行时损坏的 trial 记成诊断产物，**不当成分数改进**——否则一次契约崩盘也能刷出假涨。

相邻快照的 pairwise delta 数的是 churn：相对上一张新做对的叫 fixed，上一张会对、这一张失败的叫 forgotten。$A_0$-参照的 fix/forget 分母冻在初始会/不会的集合上，避免自己改分母。Figure 4 右图用的是后者。源组再拆一层（附录 Figure 14）：HLE 和 Terminal-Bench 各自有固定分母，混合平均会把「终端题契约崩了」听成「数理题忘了」。

这套视图会骗人的几种写法。把 $V_{\mathrm{update-val}}$ 写进 $U$，验证曲线就是在背考卷。只报 $V_\star$ 不报 $E_{16}$，AHE 看起来平滑。把 batch 80 的 −17.1 藏进附录，主表只留 batch 20。用第三方转写的 UVG 排行替换 Table 2——本篇不引那些表。诊断字段（update status、setup/verifier/provider 错误、runtime corruption、harness diff）是解释工具，升格成主分就和「LLM-as-judge 当唯一门」同一类错。

## 4. 这不是 RSI，也不是第二份可靠性讲义

$S$ 若取「当前 $H_t$」，$U$ 确实在改下次还用的脚手架，和 [SkillEvolver](../../3-Harness层-Agent运行时/08-SkillEvolver-元技能/08-SkillEvolver-元技能.md)、[Argus](../../3-Harness层-Agent运行时/01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) 同层。SEAGym 自己不是那个 $U$。它是墙外的评测器：切分、日程、冻结视图、Harbor 验证器构成 $I_{\mathrm{eval}}$，不进 $S'$。把「AHE 验证 +17.1」听成「环境在递归改进自己」，层错了。AHE / ACE / TF-GRPO 各是被测的 harness 更新规则；本篇只借用它们当对照，不把 Lin / Zhang / Cai 的算法正文搬进来。

和 RSIBench 再钉一次。RSIBench 问数据研究员在冻栈上能不能越搜越好：14/24 能发现，18/23 达峰后掉。SEAGym 问 harness 更新在冻 $M$ 上能不能迁出训练批次：验证涨可以伴随 OOD 掉、中间快照可以塌成 6/80。两个「不单调」对象不同，不要加成一张表。可靠性阶梯要的「验收门在更新边界之外」，在这里的操作化就是：$V_{\mathrm{update-val}}$ 和 $D_{\mathrm{test}}$ 不准当 $U$ 的证据；回放用固定的 $A_0$ 参照，避免自己给自己改分母。

局限按结论写。实例化只覆盖 Terminal-Bench 2.0 与 HLE 的 harness / 状态级进化，没有 web / 桌面 / 长程软件工程 / 多智能体流。权重更新、在线 RL、混合系统写在可扩展，**这篇没做**。多视图有覆盖成本：每个快照要在验证、ID、OOD、回放上再评一遍，以后可以做更省的快照选择和自适应回放，前提是回归、恢复、迁移、遗忘仍然看得见。OOD 与跨模型表明更新依赖任务分布和 rollout 骨干；更长地平、更多源/目标对仍缺。伦理段要求隐藏 verifier 细节和私有 oracle；若以后接真实用户数据或专有仓库，要走许可和匿名化——本实例化用的是公开 Harbor 任务，不在这里编合规结论。

和 SkillEvolver 的 Harbor 不要收成一件事。那边 Harbor 是写技能时的部署抽样；这边 Harbor 是评测执行衬底，日程和冻结视图才是 SEAGym 加上去的。ACE 的 13 条 skillbook 住在同一只 Agent 的持久上下文里；SkillEvolver 的领域 `SKILL.md` 要离开作者会话给另一只 Agent 加载。工件形态不同，都还不是式 (2) 的改进器递归。

![上排 $H_t$ 在变；下排 $M$、日程、冻结视图与成本记录不进 $U$](./images/fig-seagym-frozen.png)

> 图 2：实线只改 harness。虚线是冻结基座和日程。右侧视图与成本没有箭头指回更新。

**图 2 解析**

- **$H_t$**：prompt / 记忆 / 技能 / 中间件。这是被测对象。
- **$M$ frozen**：主表 DeepSeek-V4-Flash。换骨干是消融，不是已经在训新 $\theta$。
- **schedule**：五 epoch、batch 20 是实验变量，不是 Agent 改的。
- **views**：验证不得当更新证据。这是和「画一条验证曲线」的全部差别。成本记录同样不进 $U$，变贵可以看见，但不能靠少报 token 把 UVG 做高。四视图同时报，才叫过程评测；单报验证是在藏符号。环境不接受、不拒绝、不回滚更新。必须同时看。

对有大模型基础的读者，读完应能回答四句。评的是哪一层？Harness 更新过程，不是权重。一张验证表够不够？不够，TF-GRPO 与 AHE 同是 +17.1，OOD 符号相反。中间快照能信吗？$E_{16}$ 回放 6/80、66 次 ERR。这是 RSI 吗？评测环境不是；$U$ 在各方法里，改进器身份仍在墙外。

**读**：式 (2)(3)、四视图、Table 2 的 OOD 符号、$E_{16}$ 的 6/80 与 66 次 ERR、NexAU 契约、batch 20 独好、HLE-only 终局 0、跨骨干不对称、主 AHE 1053.8M rollout。  
**不读**：把 UVG 当总排名、把 AHE 听成本库新算法、用第三方榜转写的 UVG 列替代 Table 2、把 Harbor 听成已经在做 SkillEvolver、把 43/80 终局听成过程单调。

上一篇发现间隙：[01 RSIBench-Data](../01-RSIBench-Data/01-RSIBench-Data.md)。原则：[02 可靠性](../02-可靠性与独立监督/02-可靠性与独立监督.md)。被测的 harness 写作回 [08 SkillEvolver](../../3-Harness层-Agent运行时/08-SkillEvolver-元技能/08-SkillEvolver-元技能.md)、[09 ACE](../../3-Harness层-Agent运行时/09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)。

## 参考文献

1. Zheng, C., Xue, C., Liang, B., Yang, J., & Zhang, C. (2026). [SEAGym: An Evaluation Environment for Self-Evolving LLM Agents](https://arxiv.org/abs/2606.17546). arXiv:2606.17546. Table 2 / 3 / 4 与 6/80 回放以 HTML 为准。
2. [antropy-research/SEAGym](https://github.com/antropy-research/SEAGym). 评测环境，不接受/拒绝更新。
3. Lin et al. (2026). [Agentic harness engineering](https://arxiv.org/abs/2604.25850). arXiv:2604.25850. AHE；本篇只借用对照数字。
4. Cai et al. (2025). [Training-free group relative policy optimization](https://arxiv.org/abs/2510.08191). arXiv:2510.08191. TF-GRPO。
5. Zhang et al. [ACE / Agentic Context Engineering](../../3-Harness层-Agent运行时/09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)。SEAGym 实验引用为 2026；机制专文 arXiv:2510.04618 是同名线，骨干与日程都不同，本篇不合并版本号。
6. 本花园：[01 RSIBench-Data](../01-RSIBench-Data/01-RSIBench-Data.md)；[08 SkillEvolver](../../3-Harness层-Agent运行时/08-SkillEvolver-元技能/08-SkillEvolver-元技能.md)；[09 ACE](../../3-Harness层-Agent运行时/09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)。
