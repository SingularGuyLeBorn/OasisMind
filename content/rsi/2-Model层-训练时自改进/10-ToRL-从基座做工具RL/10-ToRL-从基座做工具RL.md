---
title: "10 · ToRL：从数学基座做工具 RL，评测是 greedy"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  ToRL（arXiv:2503.23383）：SJTU / SII / GAIR 从 Qwen2.5-Math 基座做 GRPO，
  解释器进 rollout。7B AIME24 greedy 43.3，不要和 ReTool 32B 的 67.0 横加，
  也不要和 Sky-T1 的 43.3 收成一只。沙箱和 +1/−1 在墙外，不是 RSI。
tags:
  - RSI
  - ToRL
  - GRPO
  - 工具集成推理
  - AIME
  - RLVR
---

# 10 ToRL：从基座摸解释器，评测是 greedy

摘要写 ToRL-7B 在 AIME24 上 **43.3%**，相对「不用工具的 RL」高 **14%**，相对当时最好的 TIR 高 **17%**。打开 Table 3：43.3 钉在 **Qwen2.5-Math-7B-Base** 训出来的 ToRL-7B，评测是 **greedy、温度 0**，训练和公平对照都把单次回复的工具调用上限 \(C\) 钉成 **1**。同表 Qwen2.5-Math-7B-Instruct 无工具 10.0，带 TIR 环境 26.7，SimpleRL-Zero 无工具 **33.3**。43.3−26.7=16.6，靠近摘要的 17；43.3−33.3=10，对不上 14。14% 更像 Figure 1 训练曲线上的「大约高多少」，不要反推成某一格。禁止用 43.3 改 [ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 的 AIME2024 **67.0**（32B、温度 1.0、32 次平均）。ReTool 表上 Sky-T1 也是 43.3，那是另一只 32B 后训练，不是本篇 7B。

本篇落第 2 章。GRPO 改的是 \(\theta\)。留下的是 1.5B / 7B 的 Math 基座权重。Sandbox Fusion、调用上限 \(C\)、boxed +1/−1、LIMR 筛过的 28740 题、greedy 评测，全在墙外。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；信号类型见 [04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。**不是** RSI。**不是** 术语式 (2)。**不是** [ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md)：那边多 API、拆槽位、榜是 BFCL，3B 总体 52.98。**不是** ReTool：那边 PPO、32B Instruct、交错 CI、AIME 32 次平均。**不是** 视觉里那篇同名 ToRL（拓扑保持表示学习）。一手：Li, Zou, Liu；SJTU / SII / GAIR；[arXiv:2503.23383](https://arxiv.org/abs/2503.23383)；代码 [GAIR-NLP/ToRL](https://github.com/GAIR-NLP/ToRL)。数字以 HTML Table 3-4、§2.3、§3.1–3.3、Figure 5–6 为准。会议录用未找到，按预印本报，不要写成 NeurIPS / ICLR。也不要和视觉顶会里那篇拓扑 ToRL 收成一条引用。GitHub 开源实现、数据和权重。花园不把第三方 checkpoint 版本号升格成论文超参。issue #11 只用来钉 Table 3 有没有 −0.5，不当成第二份主表。

## 1. 问题：TIR 轨迹被 SFT 钉死，基座上的 RL 还没接解释器

CoT 把算术留在自然语言里，方程、枚举、精确计算容易漂。TIR（ToRA、MathCoder、Qwen2.5-Math-Instruct-TIR）让模型写代码、跑解释器、再接着想。作者的判断是：现成 TIR 多半从更强模型蒸馏轨迹再 SFT，工具怎么用被那份示范钉死；Qwen-Math 一类虽在 SFT 之后做 RL，实现不透明，看不清解释器是怎么编进 rollout 的。ToRL 的赌注是：从 **没有后训练的 Math 基座** 直接 GRPO，让策略自己摸何时写代码、写错了怎么看报错。

相关工作不要收错名。Search-R1 是搜索引擎问答。[ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) 是多工具槽位，主榜 BFCL。[ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 也是数学代码 RL，但骨干 32B、先冷启动 SFT 再 PPO，评测 32 次平均。本篇骨干 1.5B / 7B，从 Base 起，评测 greedy。PoT / PAL 是提示侧把计算交给 Python，权重不动。差在训练：同样接解释器，\(\theta\) 会被 +1/−1 推过。Qwen2.5-Math 技术报告里的 Instruct-TIR 是「已经会调代码的 Instruct，测试时接解释器」；ToRL 的对照把它放进同一 TIR 环境、同样 \(C=1\)，为的是挡住「只是测试时多接了一个沙箱」。Table 3 的 Instruct-TIR 因此不是「没训过工具」，是官方 Instruct 在 TIR 协议下的分数。ToRL 从 Base 训完再测，才是本方法。

题库先从 NuminaMATH、MATH、DeepScaleR 里收奥赛风格题，去掉证明题和不好自动核对的题，得到 **75149** 道可验证题。再用他们自己的 LIMR（[arXiv:2502.11886](https://arxiv.org/abs/2502.11886)）做难度均衡的蒸馏，落到 **28740**。LIMR 那篇主实验是 MATH 3–5 档 **8523** 里挑 **1389**，AIME24 可以走到和全量差不多。本篇 28740 是同一套筛选手续铺到更大的可验证池，不是把 1389 那只子集拿来训 Table 3。两篇作者重叠，题库不要收成一盘。LIMR 是另一份 \(I\)：哪些题配进 RL，人用另一篇论文的手续决定。主表没有 75149 / 28740 / 1389 这三格，花园把条数记成方法段事实，不当成 AIME 分母。

## 2. 机制：扫到代码围栏就暂停，默认只奖 boxed

轨迹写成 \(s_k=(r_1,c_1,o_1),\ldots,(r_k,c_k,o_k)\)。\(r_i\) 是自然语言，\(c_i\) 是代码，\(o_i\) 是解释器输出：

$$
(r_k,c_k)=M(Q\oplus s_{k-1}),\qquad o_k=I(c_k),\qquad s_k=s_{k-1}\oplus r_k\oplus c_k\oplus o_k. \tag{1}
$$

循环接到最终答案才停。论文 Figure 2 用 \(\frac{1}{(6\cdot 10)^{10}}\) 小数点后紧跟几个 0 当例子。CoT 只盯 \(10^{-10}\)，答 **9**。TIR 用 Python 算倒数再扫小数点后的字符，答 **17**。\(60^{10}=6^{10}\cdot 10^{10}\)，数量级大约 \(1.65\times 10^{-18}\)，17 个 0 再跟 1，17 对。CoT 把移位数错了。同一段代码如果写成 `f"{reciprocal}"`，依赖解释器默认浮点字符串，换精度会漂。解释器能纠心算，也能被打印格式坑。TIR 不是自动正确。

Rollout 用 Figure 3 的说明书：把自然语言和程序拼起来，最终答案放进 `\boxed{}`。扫到代码结束标识（论文写成 output 围栏）就暂停，抽出最近一块代码执行，把结果按 output 围栏填回去，再让模型接着想。执行失败也回传。作者故意把报错留给模型，假说是诊断能教它下一轮少写坏代码。Sandbox Fusion 的 traceback 太长，他们只留最后一行，例如 `NameError: name 'a' is not defined`。解释器输出在算 loss 时 **mask 掉**，避免策略背具体 OBSERVATION。这些标签、截断、mask，都是人钉的 \(I\)。

工具一接进 rollout，GPU 就容易空转。调用越勤，一步越慢。他们加超参 \(C\)：单次生成最多调几次工具。超过就忽略后续执行请求，强迫改回纯文本。默认实验 \(C=1\)。Table 4 在 8×A800 上测单步平均时间：\(C=0\) **118** 秒，\(C=1\) **237** 秒，\(C=2\) **288** 秒。\(C=0\) 等于不跑解释器，仍要 118 秒，说明一步墙钟不全是沙箱；接到 \(C=1\) 大约翻倍到 237，再加到 \(C=2\) 只再多 51 秒。翻一倍调用，墙钟不是翻一倍，但已经从两分钟变成近五分钟。执行器他们试过 qwen-agent 自带的 Python，延迟低，但和训练进程不隔离，段错误能把整次训练打穿。最后用 Sandbox Fusion，隔离换稳定，延迟略高。换沙箱、换 \(C\)、换 mask 范围，梯度不会去搜。

奖励默认只看答案。对了 +1，错了 −1。解释器另外能提供「代码能不能跑」。他们写过可执行性惩罚：这段回复里有跑失败的代码，再减 **0.5**。GitHub issue 作者钉死：Table 3 **没有** 加这条惩罚，那是 §3.3 的消融。Figure 6 显示加上去不涨分。假说是惩罚会逼模型写特别简单、不容易报错的代码，题反而解不出。这和 ReTool 同一方向：那边故意不奖可执行。两边都把「代码能跑」留给探索，但 ReTool 是 32B PPO、没有 \(C=1\) 这种显式次数帽。

主算法 GRPO。rollout batch **128**，每题 **16** 条，温度 **1.0**，**去掉 KL**。veRL。基座是 Qwen2.5-Math 的 **Base**，不是 Instruct。没有 ReTool 那种先造 \(\mathcal{D}_{\mathrm{CI}}\) 再 PPO 的两段。作者写成从基座放大，让策略自己摸工具，不被 SFT 轨迹卡住。代价是：Base 不会的格式、不会的围栏，都要靠 Figure 3 那句说明书和 +1/−1 教。评测改 greedy、温度 0，五张榜：AIME24、AIME25、MATH500、OlympiadBench、AMC23。训练温度 1.0、评测温度 0，两套采样不要收成一句「都是 greedy」。ReTool 评测温度 1.0、top-p 0.7、32 次平均，分母更不是这套。每题 16 条是组相对优势的组大小，和评测 greedy 无关；不要听成 test-time 采 16 条取最好。

![题进策略 rollout，代码围栏进 Sandbox Fusion，+1/−1 后 GRPO；虚线下一题、θ 已更新](./images/fig-torl-loop.png)

> 图 1：实线是一道训练题上的交错执行。虚线是下一题，策略已经按组相对优势更新。

**图 1 解析**

- **Math query**：奥赛风格可验证题。训练来自 28740；表上的 43.3 是 AIME24 greedy。
- **Policy LLM**：吐思维和 Python。\(\theta\) 是本篇唯一进 \(S'\) 的状态。从 Base 起，没有冷启动 SFT。
- **Sandbox Fusion**：墙外执行器。成功输出或最后一行报错填回。测试时这条还在，GRPO 不在。
- **Outcome reward**：boxed 对错 +1/−1，再 GRPO。默认没有 −0.5。
- **虚线回流**：下一题。权重留下，沙箱、\(C\)、题库不留下可改写的副本。

## 3. 表：7B greedy 43.3，不要去改 32B 的 67.0

Table 3 公平对照把最大工具调用也钉成 1。加粗是作者标的最好。上标是相对某一行的百分点，**不是**同一条基线：AIME24 的 +10.0 对得上 SimpleRL-Zero 的 33.3，均分 +14.7 对得上 Instruct-TIR 的 47.4。花园报表内绝对数。

| 模型 | 工具 | AIME24 | AIME25 | MATH500 | Olympiad | AMC23 | 均分 |
|------|------|--------|--------|---------|----------|-------|------|
| 1.5B-Instruct | 否 | 10.0 | 10.0 | 66.0 | 31.0 | 62.5 | 35.9 |
| 1.5B-Instruct-TIR | 是 | 13.3 | 13.3 | 73.8 | 41.3 | 55.0 | 41.3 |
| ToRL-1.5B | 是 | **26.7** | **26.7** | **77.8** | **44.0** | **67.5** | **48.5** |
| 7B-Instruct | 否 | 10.0 | 16.7 | 74.8 | 32.4 | 65.0 | 39.8 |
| 7B-Instruct-TIR | 是 | 26.7 | 16.7 | 78.8 | 45.0 | 70.0 | 47.4 |
| SimpleRL-Zero | 否 | 33.3 | 6.7 | 77.2 | 37.6 | 62.5 | 43.5 |
| rStar-Math-7B | 否（SFT） | 26.7 | 未报 | 78.4 | 47.1 | 47.5 | 未报 |
| Eurus-2-7B-PRIME | 否 | 26.7 | 13.3 | 79.2 | 42.1 | 57.4 | 43.1 |
| ToRL-7B | 是 | **43.3** | **30.0** | **82.2** | **49.9** | **75.0** | **62.1** |

1.5B：ToRL 均分 48.5，对 Instruct 35.9、Instruct-TIR 41.3。AIME 两年都是 26.7，对 TIR 的 13.3 刚好翻倍。7B：均分 62.1，对 Instruct-TIR 47.4 是 14.7 个百分点。AIME24 43.3 对 TIR 26.7，对无工具 SimpleRL 33.3。作者另写 43.3 能跟当时一些 32B RL 模型比，点名 Open-Reasoner-Zero 一类；那是体量对照，不是协议对照。ReTool 的 67.0 是 32B Instruct、32 次平均；本表 43.3 是 7B Base、greedy。两格不能减。Figure 1 的曲线还做了 16 步滑动平均，看起来更顺，不是某一 checkpoint 的瞬时 greedy。训练图和 Table 3 的单点 greedy 不要收成同一张表。MATH500 上 7B 只从 Instruct-TIR 的 78.8 走到 82.2，三个点；AIME24 从 26.7 走到 43.3，十六个点。均分 62.1 主要是难卷在拉。不要用 MATH500 的小涨幅说工具 RL 已经全面翻盘，也不要用 AIME24 的大涨幅说 MATH500 已经饱和。Olympiad 49.9 对 TIR 45.0，四个点，夹在中间。五列不是同一斜率。AMC23 的 75.0 对 TIR 70.0，五个点，更靠近 MATH500 这一档。难卷敏感、中档卷钝，是这张表的结构，不是四舍五入。花园按列报，不把均分 62.1 听成五张榜一起翻了。列比均分老实。

评测纪律再钉一遍。本表温度 0、贪心解码。AIME 一年 30 题，greedy 就是 30 次交卷。ReTool 把 AIME2024 和 2025 各重复 32 次再平均，温度 1.0、top-p 0.7，用来估 pass@1。同一道 43.3，Sky-T1 在 ReTool 表上也是 43.3，那是另一只模型、另一套后训练，分母不是 greedy 7B。禁止三格相减。rStar-Math-7B 的 AIME25 未报，均分空着，不要用 26.7 去填那年。Eurus-2-7B-PRIME 均分 43.1 贴着 SimpleRL 的 43.5，AIME24 都是 26.7，低于 ToRL 的 43.3；它们都没有工具列。

AMC23 上 1.5B-Instruct-TIR **55.0** 低于无工具 Instruct 的 62.5：接上解释器、调用次数帽为 1，不一定每张榜都涨。ToRL-1.5B 把这一格拉回 67.5。7B-Instruct 无工具 AIME25 是 16.7，SimpleRL-Zero 掉到 6.7，ToRL 到 30.0。无工具 RL 在五年份之间可以朝反方向走，不要用均分 43.5 说 SimpleRL 已经覆盖 AIME25。SimpleRL-Zero 是同作者圈子里「从 Base 做无工具 RL」最近的对照，AIME24 33.3 已经高于 Instruct-TIR 的 26.7；ToRL 再接解释器走到 43.3。差的是工具进 rollout，不是「换了一只 Instruct」。1.5B 两年 AIME 都是 26.7，不是抄错，是两年各 30 题 greedy 碰巧打平。不要把两个 26.7 收成「已经稳住」。

Figure 5 看训练前 100 步。带代码的回复从约 **40%** 到 **80%**。能跑通的比例也往上。对的回复里代码通过率高于错的回复。有效代码还拆两截：真正被执行的（没被 \(C\) 帽掉）、写在最终答案之前的（不是交卷后再验算）。两截都随步数涨。Takeaway-I：步数增加，用代码解题的比例和能跑的比例一起涨，无效代码会被自己压下去。花园读成行为描述，不升级成改进器进了 \(S'\)。代码比例是人设的围栏和 \(C\) 约束下的统计，换围栏会漂。前 100 步从 40% 到 80%，说明 Base 一开始并不会主动写代码，是奖励把「写了能跑的代码」选出来。这不是说明书里的 few-shot 示范长进了权重当改进器，是 +1/−1 在 \(C=1\) 的通道里筛轨迹。80% 也不是上限：\(C\) 帽掉的调用不算进「已执行」，交卷后验算的代码会被「答案前」那一截丢掉。两把尺会把「看起来会写代码」切薄。

\(C=2\) 在 Figure 6 上把 1.5B 均分大约再抬 **2** 个百分点，Table 4 单步从 237 秒到 288 秒。默认仍报 \(C=1\) 的 Table 3。可执行性惩罚不进主表，加上去不涨。Takeaway-II：\(C\) 能换分，也换墙钟；−0.5 不是免费的形状。\(C=2\) 的曲线没有被升格进 Table 3，和 ToolRL 动态尺度 53.81 不进 Table 1 是同一类纪律：消融可以更高，主表钉默认 \(I\)。

后训练阶段会出现「先写坏代码、看 TypeError、再改」「先自然语言算错、代码一对就改 boxed」。Table 5 是 Horner 法算多项式，第一次 `results[1]` 把整数当下标，Sandbox 回 `TypeError: 'int' object is not subscriptable`，改完才吐出 \(v_1=-7\)。Table 6 是 12 个球分组，心算先写出不合法的 \(2,10,13\)，代码给出 \([3,10,12]\)，boxed 跟着改。Table 5 / 6 是例子，不是主表。作者写成 metacognition、self-regulation。花园不把例子升级成术语式 (2)：报错通道是人接的，改的仍是 \(\theta\)，下次任务还是同一份 \(C\) 和同一份 +1/−1。Figure 1 下半张把「先交叉验证、发现不一致、再调用」画成涌现行为。涌现的是轨迹形态，不是改进器身份。

## 4. 这不是 RSI，也不是缩小版 ReTool

\(S\) 取当前 \(\theta\)。单轮 \(S'=I(S)\) 成立：训完下次推理用新权重。术语式 (2) 还要 \(I'\subseteq S'\)。Sandbox Fusion、\(C\)、boxed 判定、28740、LIMR、greedy、mask 范围，都不进 \(\theta\)。模型不能把 \(C\) 改成 8 来刷训练曲线，不能把评测从 greedy 改成 32 次平均来追 ReTool 的 67.0，不能把 LIMR 的筛选关了把 75149 全塞进去。混元台阶是 **L1** 的工具 RLVR：可训练状态在动，改进手续在墙外。

和邻居钉死。[ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 先 SFT 冷启动再 PPO，骨干 32B Instruct，AIME 32 次平均 67.0 / 72.5 是两只骨干。这边从 Base 起 GRPO，7B greedy 43.3，\(C=1\)。两篇都关 KL，都走 veRL，都把解释器编进 rollout，配方仍是两份 \(I\)。ReTool 相关工作把本篇写成「1.5B / 7B、规模不够、分数不理想」。那是站在 32B、32 次平均上看；本表 43.3 在自己的 greedy 尺上已经高于同骨干 Instruct-TIR 的 26.7。不要用 ReTool 的评价覆盖 Table 3。[ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) 拆的是工具名和参数，3B BFCL 52.98，Bamboogle 7B 72.0；72.0 不要改 ReTool 72.5，更不要改本篇任何一格。[LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 留下一类题的 Python，不改 \(\theta\)。[ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md) 冻 PaLM，轨迹随题清空。ToRA / MathCoder 是 TIR 的 SFT 前辈，本表拿 Instruct-TIR 当对照，不搬它们的主表。[Absolute Zero](../06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md) 的 Python 解释器当环境，题是模型自己出的 \((p,i,o)\)，Coder-7B 总均 50.4；这边题是人筛的 28740，解释器只服务 rollout，不负责出题。都改 \(\theta\)，都不是递归。[Tufa](../03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md) 冻 LLM 裁判给 0/1；这边冻的是 boxed 规则，更硬。ReTool 用 `<code>` / `<interpreter>` 当暂停符；这边用 markdown 代码围栏加 output 围栏。扫错结束符，暂停点就抖。Figure 3 说明书大意：User 出题，Assistant 把自然语言和程序拼起来，答案放进 boxed。这句不会进 \(\theta\) 当可改写的工具文档。

作者把结论写成从基座放大工具 RL，能摸出何时调用、何时改代码。花园读成：在 \(C=1\)、greedy、28740、+1/−1 这套 \(I\) 里，7B 可以走到 AIME24 43.3。不是「人可以退出 \(I\)」。\(C=2\) 换大约两个点均分、换 50 秒墙钟，是人改循环。可执行性惩罚伤分，说明密一点的代码奖不一定更像 ReTool 的稀疏奖，也不一定更像 ToolRL 的槽位奖。三套 \(I\)，不要收成「工具 RL 都该奖可执行」或「都该不奖」。

局限是明写的。默认一次只许调一次工具，复杂题的交错被帽住。评测 greedy，没有 AIME 的 32 次平均，也没有 pass@k。基座是 Math，不是通用 Instruct。没有 BFCL，没有多 API。安全段几乎没有：会写代码的策略也可以写危险代码，本实验的验收是竞赛卷。可靠性专文要的墙外监督，这里缺一份。Figure 1 的 16 步滑动平均会把抖抹平，看起来「稳定超过 Instruct-TIR」，不回答大 \(k\) 时基座会不会反超。[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md) 里 Yue 等问的就是这件事；本表没有 pass@128。Open-Reasoner-Zero 被点名当 32B 对照，花园不搬它的主表，只记：作者用它挡「7B 工具 RL 没有意义」，不是宣称已经持平 32B 的 ReTool。

![左列 θ 经 GRPO 从基座上涨；中 WALL；右列沙箱、+1/−1、C 帽、28740、greedy 冻着](./images/fig-torl-frozen.png)

> 图 2：实线只更新策略权重。墙右边是下次任务默认还在、且不被 \(\theta\) 改写的 \(I\)。

**图 2 解析**

- **Grows / \(\theta\)**：GRPO from base。没有 ReTool 那种冷启动 SFT。
- **Train loop**：每题 16 条，batch 128，默认 \(C=1\)。
- **WALL Frozen \(I\)**：改进器身份。没有箭头从右列改回左列的奖励公式。
- **Sandbox / boxed / \(C\) / 28740 / greedy**：执行器、答案奖、次数帽、题库、验收协议。换其中任一项等于人改 \(I\)。\(C=2\) 的大约两个点均分不进主表，和可执行性 −0.5 伤分是同一类：旋钮在墙外。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Model，GRPO 推 \(\theta\)。43.3 是哪一把尺？7B、AIME24、greedy、\(C=1\)。和 ReTool 差在哪？Base 起训、7B、一次调用帽，不是 32B Instruct 加 32 次平均。还缺什么才敢叫 RSI？\(C\)、沙箱或奖励公式进入 \(S'\)，并且下一轮改进器就是升级后的那份。和 ToolRL 差在哪？一只解释器加 boxed，不是工具集合加 Jaccard。摘要 14% / 17% 为什么不能当柱？因为 Table 3 的上标不是同一条基线，14 更像训练曲线。

**读**：Table 3 的 26.7 / 43.3 / 62.1、评测 greedy、默认 \(C=1\) 且 Table 3 不加 −0.5、14% / 17% 不是某一格、43.3 不是 ReTool 67.0 也不是 Sky-T1、28740 不是 LIMR 的 1389、不是 RSI。  
**不读**：把 ToRL 听成 ToolRL、把 greedy 听成 32 次平均、把 +10.0 上标听成相对 TIR、把可执行性惩罚听成主设定、把 43.3 听成已经追上 32B、把 1389 填进本篇题库。

同层：[08 ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md)、[09 ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md)、[06 Absolute Zero](../06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md)。信号：[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。Harness 侧工具：[42 LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[29 ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md)。评测纪律：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 参考文献

1. Li, X., Zou, H., & Liu, P. (2025). [ToRL: Scaling Tool-Integrated RL](https://arxiv.org/abs/2503.23383). arXiv:2503.23383. Table 3-4、式轨迹与 \(C\) 以 HTML 为准。
2. 代码：[GAIR-NLP/ToRL](https://github.com/GAIR-NLP/ToRL)。veRL：[volcengine/verl](https://github.com/volcengine/verl)。Sandbox Fusion：[bytedance.github.io/SandboxFusion](https://bytedance.github.io/SandboxFusion/)。
3. 题库筛选：Li, Zou, Liu. [LIMR](https://arxiv.org/abs/2502.11886). arXiv:2502.11886。
4. 本花园：[08 ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md)；[09 ToolRL](../09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md)；[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。
