---
title: "08 · ReTool：代码解释器进 PPO rollout，奖励仍只看最终答案"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  ReTool（arXiv:2504.11536）：ByteDance Seed 用 PPO 在代码沙箱里交错 rollout。
  Qwen2.5-32B-Instruct 上 AIME2024 67.0 / 400 步，文本 RL 40.0 / 1080 步。
  换 R1-Distill-32B 才到 72.5。解释器与 +1/−1 在墙外，不是 RSI。
tags:
  - RSI
  - ReTool
  - PPO
  - 代码解释器
  - RLVR
  - AIME
---

# 08 ReTool：解释器进 rollout，奖励仍看最终答案

摘要写 32B 在 AIME 上 **67%**、400 步，文本 RL 基线 **40%**、1080 步；extended settings 再写 **72.5%**，相对 o1-preview **+27.9%**。打开 Table 1：67.0 / 49.3 钉在 **Qwen2.5-32B-Instruct**；72.5 / 54.3 钉在另一只骨干 **DeepSeek-R1-Distill-Qwen-32B**。27.9 是 72.5−44.6，不是 67.0 那只再训久一点。评测把 AIME2024&2025 各重复 **32** 次取平均，用来估 pass@1，温度 **1.0**、top-p **0.7**。不要听成 greedy 单次。

本篇落在 Model 层。PPO 改的是 \(\theta\)，留下的是更新后的 32B 权重。代码沙箱、`<code>` / `<interpreter>` 标签、+1/−1、16384 长度帽、KL 系数 0.0、DAPO-Math-17k 题库，全在墙外。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；信号类型见 [04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。**不是** RSI。**不是** 术语式 (2)。**不是** [LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)（那边造可复用函数，提示冻着）。**不是** [ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md)（那边冻权重，轨迹跨题清空）。**不是** [Absolute Zero](../06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md)（那边自造 \((p,i,o)\)，解释器当环境；这边题是人出的 DAPO-17k，解释器当 rollout 工具）。不要和 SaaS 产品 Retool.com 收成一篇。一手：Feng, Huang, Qu, Zhang, Qin, Zhong, Jiang, Chi, Zhong；ByteDance Seed；[arXiv:2504.11536](https://arxiv.org/abs/2504.11536)（2025-04-15）；**ICLR 2026 poster**；项目页 [retool-rl.github.io](https://retool-rl.github.io/)；代码 [ReTool-RL/ReTool](https://github.com/ReTool-RL/ReTool)；训练走 [volcengine/verl](https://github.com/volcengine/verl)，配方 [verl-project/verl-recipe/retool](https://github.com/verl-project/verl-recipe/tree/main/retool)。数字以 HTML Table 1、§2.3、§3.1–3.3、Figure 3 为准。DAPO-Math-17k 与 HF dump 条数不在主表，来源写项目页 / GitHub。

## 1. 问题：长思维链算不准，模仿轨迹又学不会何时调

R1、o1 一类把文本长链训成会自我纠正的推理模型，几何、精确计算、解方程仍容易在中间算术上漂。代码解释器（CI）能枚举、能验中间值、能把搜索空间写成程序。PoT / PAL / MathCoder 已经把「算」从「想」里拆出去。作者的判断是：提示和 SFT 只模仿人写好的调用分布，换题型就脆，模型不知道何时该停下来写代码、写错了怎么靠报错改。

RL 的赌注是：让策略在交错执行里自己摸「何时调、调什么、调完怎么接」。奖励只看最终答案等不等价，不另加「代码能跑」分。这样设计是为了少给 hacking 口子，也把可执行性、调用时机、代码复杂度都交给探索。代价立刻可见：沙箱、标签、等价判定、题库金标，全部是人钉的 \(I\)。\(\theta\) 再强，也改不了「怎样才算 equivalent」。

相关工作把 Tool-Integrated Reasoning 收成一条线：Chen 等 2025 的 R1 风格 SFT 仍绑在那份代码 CoT 分布上；并发的 ToRL（Li 等，[arXiv:2503.23383](https://arxiv.org/abs/2503.23383)）在 Qwen2.5-Math 的 1.5B / 7B 上做工具 RL，作者写成规模不够、分数不理想。ReTool 把骨干拉到 32B，工具钉死为代码解释器，不做多 API 选择。不要和 ToolLLM / Gorilla 的 API 轨迹 SFT 收成一张表，也不要和 Search-R1 的搜索引擎 RL 收成一篇。PoT / PAL 是提示侧把计算交给 Python，权重不动；本篇的差是：同样接解释器，但 \(\theta\) 会被 +1/−1 推过。差在训练，不在「会不会 print」。

## 2. 机制：冷启动改格式，PPO 只认 boxed

两段。先冷启动 SFT，再带沙箱的 PPO。

冷启动从现成文本推理集下手，Open Thoughts 是点名的来源之一，记成 \(\mathcal{D}_{\mathrm{init}}\)。人审加 DeepSeek-R1 过滤坏样本。再用 Figure 8 的模板，把「手算更适合代码」的步骤换成代码片段和解释器结果。两道核验：格式核验，保证后续 RL 能稳定扫到调用触发；答案核验，最终输出对不上金标的丢掉。得到 \(\mathcal{D}_{\mathrm{CI}}\)。SFT 两轮 epoch，学的是何时写代码、如何读执行结果。格式核验服务的是后续 RL 的触发器扫描：标签不统一，PPO 的暂停点就会抖。答案核验服务的是别把「写得像代码、答案却错」的轨迹当正例。两道门都过了，才进 SFT。Hugging Face 公开 dump [JoeYing/ReTool-SFT](https://huggingface.co/datasets/JoeYing/ReTool-SFT) 文件名是 `train_2000.parquet`，页面约 **2000** 行。论文主表没印这个数。写「HF 公开 dump」，不要假装 Table 1 有 2000。dump 里的用户提示已经写明：可以选写可执行 Python，输出包进解释器标签。那是部署时的说明书，不是模型自己长出来的工具文档。

RL 用 PPO。条件里显式带着 CI：策略在交错执行下生成 \(o_t\)。论文式 (1) 把比率写成 \(\pi_\theta(o_t\mid q,o_{<t};\mathcal{CI})/\pi_{\theta_{\mathrm{old}}}(\cdots)\)，再和 clip 后的优势取 min：

$$
\mathcal{J}_{\mathrm{PPO}}(\theta)=\mathbb{E}_{(q,a)\sim\mathcal{D},\,o_{\le t}\sim\pi_{\theta_{\mathrm{old}}}(\cdot\mid q)}\Biggl[\min\Biggl(\frac{\pi_\theta(o_t\mid q,o_{<t};\mathcal{CI})}{\pi_{\theta_{\mathrm{old}}}(o_t\mid q,o_{<t};\mathcal{CI})}\hat A_t,\;\mathrm{clip}\Bigl(\frac{\pi_\theta(o_t\mid q,o_{<t};\mathcal{CI})}{\pi_{\theta_{\mathrm{old}}}(o_t\mid q,o_{<t};\mathcal{CI})},1-\varepsilon,1+\varepsilon\Bigr)\hat A_t\Biggr)\Biggr]. \tag{1}
$$

奖励只看最终答案。模型被要求把答案放进 `\boxed{}`，再用规则判定是否等价：

$$
R(a,\hat a)=\begin{cases}+1,&\texttt{is\_equivalent}(a,\hat a)\\-1,&\text{otherwise.}\end{cases} \tag{2}
$$

没有代码可执行性奖励。作者写明：简化是为了减轻 hacking，把「怎么用代码」留给结果反馈。错代码只要最后 boxed 碰巧对，一样 +1；对代码只要最后不等价，一样 −1。项目页补一句：验证器和 DAPO 同一套，字符串规范化再匹配。那是墙外的 \(V\)，不是 \(\theta\) 学出来的裁判。开源评测脚本另装 symeval 做符号等价；论文正文只写 `is_equivalent`。boxed 解析失败按不等价给 −1，这是评测门，不是策略自己发明的输出格式。

Rollout 和纯文本 RL 的差在 Figure 2。文本 RL 只吐思维链。ReTool 让策略和沙箱合作，轨迹是文本、代码、解释器反馈的拼接 \([t_1\oplus c_1\oplus f_1\oplus\cdots\oplus o]\)。Figure 7 的模板用 `<code></code>` 框代码；扫到 `</code>` 就暂停，把 \(c_1\) 送进沙箱；成功输出或报错填进 `<interpreter></interpreter>`，再让模型接着想。代码要写成完整脚本，含 import，输出必须 `print`，沙箱才能抓到。错误也回传。这是后文「aha moment」能改 `greedy()` 未定义的通道：报错进上下文，梯度仍然只看式 (2)。

解释器 token **不进 loss**。作者写成 Interpreter Feedback Mask：外部 token 不搅策略自己的连贯推理。KV-Cache 在每次触发处缓存代码执行前的状态，只给反馈段补计算。沙箱是异步 worker 池，各 pod 按容量拉任务。这些是训练工程，不进 \(S'\)。换一套沙箱超时、换 worker 调度、换 mask 范围，都会改 rollout 分布；梯度不会去搜它们。

超参：AdamW，学习率 \(1\times 10^{-6}\)，最大序列 **16384**，mini-batch **512**，KL 系数 **0.0**。主骨干 Qwen2.5-32B-Instruct。实现写 VeRL。KL 关掉，等于不把策略钉在冷启动 SFT 附近。R1 一类常用 GRPO 加小 KL；这边明确写 PPO、KL=0。花园不把「没用 GRPO」听成方法失败，只记：更新规则是人钉的 \(I\)，和 [Tufa](../03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md) 的 GRPO、Absolute Zero 的 TRR++ 不是同一配方。RL 题库项目页钉成 [DAPO-Math-17k](https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k)（Yu 等，[arXiv:2503.14476](https://arxiv.org/abs/2503.14476)），验证用 AIME 2024 / 2025。论文 HTML 方法段没把 17k 印进 Table 1。花园把题库记成项目页事实，不当成主表格子。DAPO 自己的论文在讲解耦 clip、动态采样那一套；ReTool 借用的是题和规则验证器，不是把 DAPO 算法整份搬进式 (1)。

![题进策略 rollout，关代码标签进沙箱，+1/−1 后 PPO；虚线下一题、θ 已更新](./images/fig-retool-loop.png)

> 图 1：实线是一道训练题上的交错执行。虚线是下一题，策略已经按式 (1) 更新。

**图 1 解析**

- **Math query**：AIME 风格竞赛题。训练时来自 DAPO-Math-17k；表上的 67.0 是 AIME2024 的 32 次平均。
- **Policy LLM**：吐思维链和 `<code>`。\(\theta\) 是本篇唯一进 \(S'\) 的状态。
- **Code sandbox**：墙外执行器。结果或报错填进 `<interpreter>`。测试时这条还在，PPO 不在。
- **Outcome reward**：式 (2) 的 +1/−1，再 PPO。没有「代码能跑」分。
- **虚线回流**：下一题。权重留下，沙箱和奖励形状不留下可改写的副本。

## 3. 表：两只骨干，两把尺

§3.1：AIME2024&2025 各重复 32 次，报总体平均准确率来估 pass@1。推理温度 1.0、top-p 0.7。AIME 一年 30 题，32 次平均是 \(30\times 32\) 次交卷再除，用来压温度 1.0 带来的抖。不要听成「采 32 条取最好」的 pass@32，也不要听成 greedy 的单次 pass@1。[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md) 里 Yue 等问的是大 \(k\) 时基座会不会反超；本表没有 pass@128 / pass@1024 曲线，67.0 回答不了「边界有没有变宽」。基线的 avg@k 从文献抄成 pass@1，协议不一定是这套 32 次、1.0 / 0.7。Table 1 脚注：文本 RL 也做了文本冷启动 SFT（♠），为了和 ReTool 的两段对齐；只冷启动的那一行，推理同样接 CI（♢）。缺 CI 的文本 RL，推理时没有沙箱；只冷启动的那行，推理有沙箱、没有 PPO。三行消融不要收成「加了工具就等于加了 RL」。

| 模型 | AIME2024 | AIME2025 |
|------|----------|----------|
| Qwen2.5-Math-72B-Instruct | 30.0 | 未报 |
| Qwen2.5-Math-72B-Instruct-TIR | 40.0 | 未报 |
| Sky-T1 | 43.3 | 未报 |
| OpenAI o1-preview | 44.6 | 37.9 |
| DeepSeek-R1-Zero-Qwen-32B | 47.0 | 未报 |
| QwQ-32B-Preview | 50.0 | 33.5 |
| s1-32B | 56.7 | 未报 |
| ReTool（Qwen2.5-32B-Instruct） | **67.0** | **49.3** |
| ReTool（DeepSeek-R1-Distill-Qwen-32B） | **72.5** | **54.3** |
| 无训练（同 Instruct 基座） | 26.7 | 未报 |
| 无 CI（文本 RL♠） | 40.0 | 36.7 |
| 无 RL（只冷启动♢） | 40.9 | 34.5 |

摘要 67% / 400 步钉第一只 ReTool。文本 RL 同骨干 40.0 / 1080 步。AIME2025 是 49.3 对 36.7。相对 s1-32B 的 **10.3** 是 67.0−56.7，只在 AIME2024。相对 o1-preview 的 **11.4** 是 49.3−37.9，只在 AIME2025。两把尺不要收成一行。

72.5 / 54.3 是换骨干。摘要「extended settings」就是这行，不是同一 run 加步数。相对 o1-preview 的 27.9 钉 72.5−44.6。GitHub README 把第二只写成 AIME24 上 72%，主表仍用 **72.5**。

两个 40.0 不要收成同一格。Qwen2.5-Math-72B-Instruct-TIR 是 72B 的工具集成推理，AIME2024 也是 40.0；文本 RL 是 32B、1080 步、同样 40.0。分母、骨干、是否 PPO 都不同。冷启动 40.9 已经贴着满训文本 RL 40.0，基座 26.7。作者用这格说明：\(\mathcal{D}_{\mathrm{CI}}\) 本身已经把可执行轨迹教进去；后面 PPO 再把 40.9 推到 67.0。AIME2025 上只冷启动 34.5，还低于文本 RL 的 36.7，PPO 才拉到 49.3。一年卷上冷启动够用，下一年卷上不够。不要把 40.9 写成已经赢了文本 RL。400 步对 1080 步，GitHub 写成不到一半的训练步。步数不是 wall-clock，也不是 token 预算：CI rollout 每次暂停都要等沙箱，单步可能更贵。作者强调的是「更少 PPO 步走到更高 AIME」，不是「更便宜」。QwQ-32B-Preview 的 50.0 / 33.5 是另一条后训练线，不要听成 ReTool 的消融。s1-32B 的 56.7 是 test-time scaling 那一支，本表只借 AIME2024 一格当对照，没有复现 s1 的预算协议。

权重：[JoeYing/ReTool-Qwen-32B](https://huggingface.co/JoeYing/ReTool-Qwen-32B)、[JoeYing/ReTool-DeepSeek-R1-Distill-Qwen-32B](https://huggingface.co/JoeYing/ReTool-DeepSeek-R1-Distill-Qwen-32B)。推理开源时借用 STILL3 的评测框架。花园不把第三方 vLLM 版本号升格成论文超参。

不要用 67.0 改 [Dynamic Cheatsheet](../../3-Harness层-Agent运行时/33-Dynamic-Cheatsheet-测试时备忘录/33-Dynamic-Cheatsheet-测试时备忘录.md) 的 AIME 50.0：那边是 Claude 3.5 Sonnet 在测试流上改备忘录，权重冻着，30 题、协议另一套。不要改 [ANN](../../3-Harness层-Agent运行时/52-ANN-层状文本反传/52-ANN-层状文本反传.md) Figure 4 的 MATH→AIME 迁移，那边没有 AIME 格子。不要改 MaAS 的 MATH 51.82。AIME 年份、采样次数、温度、是否接 CI，任何一项不同就禁止横加。

## 4. 行为：回复变短，代码变早变长

Figure 3 用 RL 过程中保存的 checkpoint，在 AIME2024 和 AIME2025 上算 CI 相关指标。横轴是训练步，纵轴是各行为量。不是 Table 1，不能把 98% 听成准确率。

回复长度（Figure 3(a)）先陡降再缓升，终值仍比 RL 前短约 **40%**，文中写成约 **10k→6k**。作者归因：先把繁计算换成短代码，后来代码行为变复杂，长度又抬一点。短不等于更会推理；它说的是 token 账单。代码占比（3(b)）总体向上，训完覆盖约 **98%** 的题：几乎每道 AIME 都会写代码，不是「偶尔当计算器」。代码行数（3(c)）持续向上，终值大约是训前的 **5 倍**：调用变早的同时，单次脚本变长。测试集上正确代码次数（3(d)）约 **1k→5k**。调用时机（3(f)）用「代码起点除以总长」度量，训练中往前移。花园读成：策略从「先写很长的纯文本、末尾再试代码」转到「更早把不确定的计算交给沙箱」。这是行为描述，没有单独的「何时调用」奖励。

代码通过率（3(e)）拆成两档。答对的轨迹里，最后一段代码通过率接近 **100%**。答错的轨迹里，最后一段代码通过率往下掉。作者读成：可执行性在影响推理，错答并不都是「代码跑通但数学错」；也有越来越不会把代码跑通的失败模式。式 (2) 不奖可执行，这条曲线不会被直接优化。若以后有人给「能跑」加分，hacking 口子会换形状：刷 print、刷空脚本、刷超时边界。作者选择不设这道分，等于把可执行性当成涌现而不是目标。

Figure 4 的 aha：模型先写了未定义的 `greedy()`，解释器报错，回复里出现 “Oops, the functions need to be defined in the same scope. Let’s correct that.”，再补全函数后跑通。冷启动数据没有专门的「改自己代码」监督。花园把它读成：报错回传 + 结果奖励，足够在若干轨迹上长出修补；不要听成元认知模块进了 \(S'\)。修补手续仍是同一套标签和沙箱。

Figure 5 用 Doubao-1.5-pro 给代码片段的主要用途分类，再画词云。计算和验证占主导；RL 之后用途更散。这是作者的定性分析工具，不是花园的评分模型。Figure 6 的个案：同一题，文本推理靠手算中间值，容易算错；CI 推理把计算换成短代码。个案不是主表。

公开配方后来写在 Notion / verl-recipe。第三方 slime 示例会把同一套 SFT→RL 接到别的小骨干上，那些分数不进本表。

## 5. 这不是 RSI，也不是第二份 Absolute Zero

\(S\) 取当前 \(\theta\)。式 (1) 的梯度确实在改下次还用的权重。单轮 \(S'=I(S)\) 成立。术语式 (2) 还要 \(I'\subseteq S'\)，并且 \(S''=I'(S')\) 有定义。沙箱、式 (2)、标签、16384、KL=0、DAPO-17k、AIME 金标、32 次平均的评测协议，都不进 \(\theta\)。模型不能把 +1/−1 改成「代码能跑也给分」，不能把 DAPO 换成自己出的题，不能把 16384 改成更长，不能把 32 次平均改成 greedy 来刷表。混元台阶上这是 **L1** 的工具增强 RLVR：可训练状态在动，改进手续在墙外。

和邻居钉死。[Absolute Zero](../06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md) 的解释器验 \((p,i,o)\)，题可以从恒等函数长出来；这边题是人出的 17k，解释器只服务解题 rollout。两边 Python 都不可被 \(\theta\) 改写。[R-Zero](../07-R-Zero-挑战者解题器/07-R-Zero-挑战者解题器.md) 连执行器也不要，金标是多数票；这边金标是 AIME / DAPO 的规则等价。[LADDER](../05-LADDER-递归拆题/05-LADDER-递归拆题.md) 从人给的积分根往下拆变体，验证器是数值积分，TTRL 答完还回滚；这边权重留下，课程不是变体树。[Tufa](../03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md) 冻 LLM 裁判给 0/1；这边冻的是解释器加字符串匹配，裁判更硬，仍不是递归。[SEAL](../04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md) 内环 LoRA 改 \(\theta\)，外环用下游 \(\tau\) 筛 self-edit，测试题可以回滚；这边 PPO 留下的权重跨题还在，筛的却是 DAPO 金标而不是模型自己写的编辑。[SPIN](../01-SPIN-自对弈微调/01-SPIN-自对弈微调.md) 的赢家分布是人类 SFT，没有沙箱。[LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 留下一类题的 Python 函数，造工具提示冻着，不改 \(\theta\)。[ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md) 冻 PaLM，想、做、看随题清空。[CRITIC](../../3-Harness层-Agent运行时/13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md) 也接解释器，但是 L0 任务内批评。[Dynamic Cheatsheet](../../3-Harness层-Agent运行时/33-Dynamic-Cheatsheet-测试时备忘录/33-Dynamic-Cheatsheet-测试时备忘录.md) 的 50.0 是备忘录，不是 PPO。ToolLLM / Gorilla 是 API 轨迹 SFT，没有这张 AIME 表。

作者把「autonomous discovery of optimal tool invocation patterns without human priors」写在摘要里。花园读成：先验指「人写何时调工具的规则」，不是「人退出了 \(I\)」。冷启动模板、boxed 格式、沙箱、等价器，都是人先验。aha 能改未定义函数，改不了奖励形状。推理时若仍接同一沙箱，用户看见的是「会写代码的 32B」；关掉沙箱，Figure 3 那种几乎 98% 带代码的策略会缺半截环境。论文主表没有「训完拔掉 CI」的格子。邻居论文（code-integrated reasoning 那一支）报过拔掉执行器会掉点，那是另一篇，不要填进 Table 1。

![左列 θ 经 SFT 再 PPO 上涨；中 WALL；右列沙箱、+1/−1、标签、DAPO-17k、16384 冻着](./images/fig-retool-frozen.png)

> 图 2：实线只更新策略权重。墙右边是下次任务默认还在、且不被 \(\theta\) 改写的 \(I\)。

**图 2 解析**

- **Grows / \(\theta\)**：SFT 两 epoch，再 PPO。留下的是 32B 权重。
- **Train loop**：摘要 400 步钉 Qwen2.5-32B-Instruct 那只；文本对照 1080 步。停训步数是人钉的 \(I\)，权重不会写出「下次改成 800 步」。
- **WALL Frozen \(I\)**：改进器身份。没有箭头从右列改回左列的配方。
- **Code sandbox / +1/−1 / code tags / DAPO-Math-17k / 16384**：执行、奖励、语法、题库、长度帽。换其中任一项等于人改 \(I\)。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Model，PPO 推 \(\theta\)。解释器进不进 \(S'\)？不进，只进 rollout。67.0 和 72.5 是不是同一只模型训久了？不是，换了 R1-Distill 骨干。还缺什么才敢叫 RSI？沙箱或奖励或题库进入 \(S'\)，并且下一轮改进器就是升级后的那份。

**读**：式 (1)(2)、Table 1 的 67.0 / 49.3 与 72.5 / 54.3、400 对 1080、冷启动 40.9 贴着文本 RL 40.0、10.3 与 11.4 两把尺、10k→6k、代码约 98%、行数约 5 倍、1k→5k、HF dump 2000 不进主表、不是 50.0、不是 AZR 的自造题。  
**不读**：把 72.5 听成 67.0 的加步、把两个 40.0 收成一格、把 32 次平均听成 greedy、把 aha 听成改进器进了 \(S'\)、把 ReTool 听成 Retool.com、把解释器听成已经递归。

同层：[06 Absolute Zero](../06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md)、[07 R-Zero](../07-R-Zero-挑战者解题器/07-R-Zero-挑战者解题器.md)、[05 LADDER](../05-LADDER-递归拆题/05-LADDER-递归拆题.md)、[04 SEAL](../04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md)。信号：[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。Harness 侧工具：[42 LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[29 ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md)、[13 CRITIC](../../3-Harness层-Agent运行时/13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md)。评测纪律：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 参考文献

1. Feng, J., Huang, S., Qu, X., Zhang, G., Qin, Y., Zhong, B., Jiang, C., Chi, J., & Zhong, W. (2025). [ReTool: Reinforcement Learning for Strategic Tool Use in LLMs](https://arxiv.org/abs/2504.11536). arXiv:2504.11536. ICLR 2026 poster. Table 1、式 (1)(2)、§3.1–3.3、Figure 3 以 HTML 为准。
2. 项目页：[retool-rl.github.io](https://retool-rl.github.io/)。代码：[ReTool-RL/ReTool](https://github.com/ReTool-RL/ReTool)。verl：[volcengine/verl](https://github.com/volcengine/verl)。配方：[verl-project/verl-recipe/retool](https://github.com/verl-project/verl-recipe/tree/main/retool)。
3. 冷启动 dump：[JoeYing/ReTool-SFT](https://huggingface.co/datasets/JoeYing/ReTool-SFT)（约 2000 行，非主表）。RL 题库：[BytedTsinghua-SIA/DAPO-Math-17k](https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k)；DAPO：Yu 等，[arXiv:2503.14476](https://arxiv.org/abs/2503.14476)。
4. 权重：[JoeYing/ReTool-Qwen-32B](https://huggingface.co/JoeYing/ReTool-Qwen-32B)；[JoeYing/ReTool-DeepSeek-R1-Distill-Qwen-32B](https://huggingface.co/JoeYing/ReTool-DeepSeek-R1-Distill-Qwen-32B)。
5. Li, X., Zou, H., & Liu, P. (2025). [ToRL: Scaling Tool-Integrated RL](https://arxiv.org/abs/2503.23383). 并发 1.5B / 7B；本篇不搬它的分数。
6. 本花园：[06 Absolute Zero](../06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md)；[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)；[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。
