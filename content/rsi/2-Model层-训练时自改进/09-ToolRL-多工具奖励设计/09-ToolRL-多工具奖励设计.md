---
title: "09 · ToolRL：多工具 GRPO，奖励拆到工具名和参数"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  ToolRL（arXiv:2504.13958，NeurIPS 2025）：UIUC 用格式分加拆开的正确性分做 GRPO。
  Qwen2.5-3B BFCL 总体 52.98 对基座 33.04；7B 到 58.38。摘要 17% / 15% 是跨榜汇总，
  不是某一格。金标逐步调用在墙外，不是 RSI。
tags:
  - RSI
  - ToolRL
  - GRPO
  - 工具学习
  - BFCL
  - RLVR
---

# 09 ToolRL：奖励拆开，工具还是人钉的

摘要写相对基座 **17%**、相对 SFT **15%**。打开 NeurIPS 2025 相机稿 Table 1：Qwen2.5-3B-Instruct 的 BFCL 总体是 **52.98** 对 Raw **33.04**、SFT4k **41.97**；7B 是 **58.38** 对 Raw **41.97**、SFT4k **36.53**。17 和 15 是跨工具榜与问答榜的汇总句，正文另写 Qwen 系列相对同体积 SFT 大约 **10** 个绝对百分点。禁止把 17% 听成准确率柱，也不要用它改 [ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 的 AIME **67.0**。API-Bank 上 3B 的 **67.00** 和 ReTool 的 67.0 只是小数点碰巧碰到一起。

本篇落第 2 章。GRPO 改的是 \(\theta\)。留下的是 1.5B / 3B / 7B / Llama-3.2-3B 的 Instruct 权重。格式门、工具名 Jaccard、参数名 Jaccard、参数值逐键相等、正确性尺度 \([-3,3]\)、4K 混合题、逐步金标调用、BFCL V3 协议，全在墙外。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；信号类型见 [04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。**不是** RSI。**不是** 术语式 (2)。**不是** ReTool：那边工具钉死为代码解释器，奖励只看 boxed 等价，骨干是 32B，榜是 AIME。**不是** [ToRL](../10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md)（Li 等，[arXiv:2503.23383](https://arxiv.org/abs/2503.23383)）：那边也是工具 RL，但是数学代码，7B AIME24 greedy 43.3。**不是** Search-R1：那边搜索引擎问答；本表 Table 5 才拿它当 Bamboogle 对照。**不是** ToolLLM / [Gorilla](../11-Gorilla-API调用微调/11-Gorilla-API调用微调.md) 的 API 轨迹 SFT。Gorilla 主表是 APIBench，TorchHub 0-shot 59.13；实验室后来才维护本表用的 BFCL。一手：Qian, Acikgoz, He, Wang, Chen, Hakkani-Tür, Tur, Ji；UIUC；[arXiv:2504.13958](https://arxiv.org/abs/2504.13958)；**NeurIPS 2025**；代码 [qiancheng0/ToolRL](https://github.com/qiancheng0/ToolRL)；权重集合 [emrecanacikgoz/toolrl](https://huggingface.co/collections/emrecanacikgoz/toolrl-680706679204ead5a6d44f58)。数字以会议 PDF Table 1-8、§2-§4、附录 GRPO / PPO 配置表为准。arXiv HTML 的附录编号和会议稿不完全同名，格子以会议稿为准。

## 1. 问题：SFT 会背轨迹，答案匹配又太粗

SFT 把离线造好的工具轨迹拿去模仿。作者的判断是：换未见工具、换复杂组合、换「这题其实不该调」就脆。R1 / o1 把 RL 做成会反思的长链，但数学题通常一个金标答案。工具集成推理（TIR）不是这一档。一步里可以同时调多把工具，每把都有参数名和参数值；多步里还要读观察再改计划。只看最终答对，中间调错工具也可能被蒙对。只看整段轨迹二值对错，梯度又太稀。

相关工作被他们收成两条窄轨。Search-R1 把搜索当工具，做问答。ToRL / ReTool 把代码解释器当工具，做数学。本篇要的是通用选工具、填参数，任务类型不绑死在搜索或竞赛卷。花园要先划线：通用不等于奖励已经递归。逐步金标调用写在训练数据里，奖励形状是人拆的。\(\theta\) 再会选未见语言的 API，也改不了 Jaccard 怎么算。

训练数据是三份拼盘。ToolACE 2K：学何时调、何时直接回。Hammer（Masked）1K：工具名和参数名被随机掉，逼模型读描述而不是背标签。xLAM 1K：一回合里一把或多把，学依赖。合计 **4K**。多步轨迹被拆成单步实例，历史塞进用户提示。主实验的「多步」是提示里的上文，不是环境里未切开的长 episode。SFT 那 400 条和 4K 同分布不同内容；SFT 的思维段是 DeepSeek-R1 蒸馏出来的，GRPO 不算思维金标，只拿工具调用算分。GitHub 写 RL 数据的 thought 是占位符。Hammer 的随机改名是为了挡住「看见旧工具字符串就调」；评测 BFCL 仍用真实工具名。训练分布和验收分布在命名上故意错开一截，这是人设计的 \(I\)，不是模型自己决定改名。xLAM 的组合调用对应奖励里的最优匹配：\(P\) 和 \(G\) 数量可以不等，Jaccard 和逐键相等要先对齐再打分。对齐规则写在式 (3) 前面那句 optimal matching，代码里换匹配算法，分数会漂。

## 2. 机制：格式 0/1，正确性拆三截

轨迹写成 \(s_k=(r_1,T_1,o_1),\ldots,(r_k,T_k,o_k)\)。\(r_i\) 是自然语言推理，\(T_i\subseteq\mathcal{T}\) 是这一步调用集合，\(o_i\) 是执行观察。策略 \(\pi:s_k\mapsto(r_{k+1},T_{k+1})\)。作者强调训练里每步都有金标调用，所以可以逐步给密奖励；问答那种只看最终答案，是后面 Bamboogle 才测的泛化，不是主训练目标。

Rollout 用特殊标签框思维、工具调用、回复。会议稿 Figure 8：必须带思维段，并且至少给出 `<tool_call>` 或回复段，两者可以同屏出现。扫到 `<tool_call>` 就把 JSON 调解析出去执行，观察写回对话。工具调用统一 JSON，图省解析。这些标签是人写的说明书，不是 \(\theta\) 长出来的 schema。

奖励拆两块。格式：

$$
R_{\mathrm{format}}=\begin{cases}1,&\text{必填字段都在且顺序对}\\0,&\text{否则.}\end{cases} \tag{1}
$$

正确性拿预测调用 \(P=\{P_1,\ldots,P_m\}\) 对金标 \(G=\{G_1,\ldots,G_n\}\) 做最优匹配，再拆三截。工具名是集合 Jaccard：

$$
r_{\mathrm{name}}=\frac{|N_G\cap N_P|}{|N_G\cup N_P|}\in[0,1]. \tag{2}
$$

参数名对每个金标调用再做一次键集合 Jaccard，再求和，上界是 \(|G|\)。参数值对金标里出现的每个键做指示相等，上界是金标键总数。三者相加是一次配对的 \(r_{\mathrm{match}}\in[0,S_{\max}]\)，\(S_{\max}=1+|G|+\sum|keys(G_j)|\)。在所有配对里取总分最高的那次。论文把这个最优分也叫做 \(R_{\max}\)，和后面的尺度 3 撞名，花园记成 \(R_{\mathrm{opt}}\)。线性拉到 \([-3,3]\)：

$$
R_{\mathrm{correct}}=6\cdot\frac{R_{\mathrm{opt}}}{S_{\max}}-3\in[-3,3]. \tag{3}
$$

再加格式门：

$$
R_{\mathrm{final}}=R_{\mathrm{format}}+R_{\mathrm{correct}}\in[-3,4]. \tag{4}
$$

完全匹配且格式对，最高是 4；格式错、调用全空，可以落到 \(-3\)。主实验正确性尺度是 3、格式上限是 1。Table 7：尺度 1 / 2 / 3 在 Qwen2.5-3B 的 BFCL 总体是 **40.62 / 51.07 / 52.98**。把尺度改成 1，等于把式 (3) 的 6 和 3 换成 2 和 1。格式和正确性打平，会慢、会低。这不是模型自己选出的权重，是人按 Logic-RL 的经验钉的。

主算法是 GRPO。每个查询 \(Q\) 采 \(n=4\) 条回复，得组 \(G_Q=\{(s_i,r_i)\}\)，\(r_i\) 用式 (4)。组内均值 \(\mu_Q\)、标准差 \(\sigma_Q\)，优势 \(A_i=(r_i-\mu_Q)/(\sigma_Q+\eta)\)，\(\eta\) 防除零。没有 critic。组太小，\(\sigma_Q\) 抖；组太大，同一步算力吃完。4 是人钉的。再走 clip 目标。会议稿附录写明**去掉相对参考模型的 KL**。温度 **1.0**。veRL。batch **512**，prompt 最长 **2048**，回复最长 **1024**，学习率 \(1\times 10^{-6}\)，PPO mini-batch **128**，15 epoch，2×A100 80G。PPO 对照的附录表另印：prompt 1024、回复 512、critic \(1\times 10^{-5}\)、KL 系数 **0.001**。主句写「所有 RL 设定都关 KL」，附录 PPO 表却留着 0.001。花园把主结果钉在 GRPO cold start、KL 关掉；不把 PPO 表的 0.001 填进主实验。Table 8：3B 无 KL **52.98**、有 KL **53.05**；7B 无 KL **58.38**、有 KL **57.21**。3B 几乎不动，7B 关掉还略高。作者另写收敛大约早五步、总训练时间大约少 **1.5** 倍。那是墙外配方，不是 \(\theta\) 搜出来的。

Figure 2 把奖励曲线拆开看。GRPO 从 Instruct 冷启动就能把格式分抬得快，正确性分也高于 PPO。PPO 更吃 SFT 初始化：冷启动弱一截，先 SFT400 再 PPO 往往更好。GRPO 反过来：SFT 过的模型再 GRPO，常常不如直接冷启动。作者的假说是 SFT 把格式背死、探索变窄。花园只取可复核的一句：同一套奖励，算法和初始化不是随便配对。3B BFCL 上 SFT400+GRPO 是 **46.42**，冷启动 GRPO 是 **52.98**；SFT400+PPO 是 **45.80**，PPO 冷启动反而是 **51.15**。7B 更极端：SFT400+GRPO **39.25** 低于 Raw **41.97**，冷启动 GRPO 才到 58.38。同一行无关检测：SFT400+GRPO **14.19**，Raw **62.66**，主设定 **76.68**。先 SFT 再 GRPO 会把拒绝能力先打穿。PPO 冷启动的 7B 多轮只有 **0.38**，主设定才到 18.12：算法换了，薄的那一格仍薄，只是从 0.38 变成 18。

SFT 的 400 条够教格式，作者写成经验观察。再堆到 4K 做纯 SFT，7B 的 BFCL 和 Bamboogle 都会掉。RL 数据的思维段是占位符，SFT 数据才灌 R1 蒸馏思维。两套正例不要收成「都是 4K」。GitHub 的 `rlla_4k_raw` 对得上 2K+1K+1K；训练还要再处理成 `rlla_4k`。奖励变体靠环境变量切换长度奖、动态尺度、粗粒度，实现写在 `reward_score/rlla.py`。那些开关是人改 \(I\) 的旋钮，主表关掉它们。

![查询进策略 rollout，工具调用进执行器，格式加正确性分后 GRPO；虚线下一题、θ 已更新](./images/fig-toolrl-loop.png)

> 图 1：实线是一步带金标的工具调用。虚线是下一查询，策略已经按组相对优势更新。

**图 1 解析**

- **User query**：4K 拼盘里的一步。历史上文在提示里，环境不是未切开的长剧。
- **Policy LLM**：吐思维和 `<tool_call>`。\(\theta\) 是唯一进 \(S'\) 的状态。
- **Tool executor**：JSON 执行，观察回写。测试 BFCL / API-Bank 时这条还在。
- **Format plus correct**：式 (1) 加式 (3)(4)，不是 boxed 对错。
- **虚线回流**：下一题。奖励形状和金标调用不留下可改写的副本。

## 3. 表：总体在涨，多轮那一格仍薄

评测三张榜。BFCL V3：单步、多步、真执行、无关工具拒绝、同时多工具。API-Bank：73 个 API，三档难度的多轮对话。Bamboogle：多跳问答，只看最终答案对不对，训练没显式见过这套搜索设定。全部报准确率。主设定是 **GRPO cold start**。对照：Raw Instruct；SFT400 / SFT4k；SFT400 再 PPO / GRPO；PPO cold start。

Table 1 BFCL 总体（会议稿）：

| 模型 | Raw | SFT4k | PPO cold | GRPO cold（主） |
|------|-----|-------|----------|-----------------|
| Qwen2.5-1.5B | 19.41 | 40.67 | 38.32 | **46.20** |
| Qwen2.5-3B | 33.04 | 41.97 | 51.15 | **52.98** |
| Qwen2.5-7B | 41.97 | 36.53 | 46.68 | **58.38** |
| Llama-3.2-3B | 22.09 | **44.16** | 42.98 | 44.10 |

Llama 这一行要单独钉：SFT4k 总体 **44.16** 略高于 GRPO cold **44.10**。作者写 Llama 对 GRPO 风格泛化更钝。不要用 Qwen 的「cold start 全面赢 SFT」覆盖这一格。7B 的 SFT4k **36.53** 低于 Raw **41.97**：满量模仿会伤总均。GRPO 再从 Instruct 冷启动拉到 58.38。

把 3B / 7B 主设定的分列也摊开，免得总均把失败藏住。3B：非直播 AST **81.58**、非直播执行 **79.43**、直播 **73.78**、多轮 **3.75**、相关 **88.24**、无关 **84.85**。7B：AST **86.17**、执行 **78.25**、直播 **74.9**、多轮 **18.12**、相关 **83.33**、无关 **76.68**。直播列两边都过 70，多轮列差一个数量级。1.5B 主设定相关检测是 **100.00**，无关却只有 **56.44**，还低于 Raw 的 82.49：会喊「该调」之后，拒绝变得更差。PPO 冷启动的 1.5B 无关检测掉到 **18.09**，相关却是 100。两列可以朝反方向走。BFCL 总体不是「工具能力」的单一刻度。

未见语言和未见相关检测目标写在 Figure 3，题来自 BFCL 子集，训练没显式覆盖。作者写 3B 冷启动 GRPO 仍最高。Table 4 给了两条定性：意图含糊时先问清，不该调时直接答。这是行为描述，不是多轮 3.75 已经修好。花园不把「metacognition」升级成改进器进了 \(S'\)。澄清和拒调，用的还是同一套标签和逐步金标训出来的策略。

多轮列更刺眼。3B 主设定 Multi Turn Acc 只有 **3.75**，PPO cold 反而是 **4.88**。7B 主设定到 **18.12**，Raw 只有 4.25，这一跳真，但仍远低于非直播 AST 的 86.17。无关检测：1.5B 主设定 **56.44** 低于 Raw 的 **82.49**；3B 主设定 **84.85** 高于 Raw **56.01**。相关性检测常常被 SFT 拉到 90 以上，总均却不一定最高。花园读成：总体分是加权篮子，拒绝无关工具和多轮对话不是同一技能，禁止用 52.98 说「多轮已经会了」。

Table 2 API-Bank 总体：1.5B 主设定 **63.15** 对 Raw 30.65、SFT4k 47.07；3B **67.00** 对 Raw 51.59、SFT4k 50.92；7B **64.66** 对 Raw 62.48、SFT4k 47.07；Llama **59.13** 对 Raw 40.54、SFT4k 43.89。7B 相对 Raw 只多约两个点，相对 SFT4k 反超一截，因为 SFT 把 7B 训伤了。3B 的 Level 3 是 **47.33**，低于 Level 1 的 **73.43**：难档仍薄。1.5B 主设定 Level 3 **41.22** 甚至低于 SFT400+GRPO 的 **54.20**：总均 63.15 赢了，最难档没有一起赢。7B Level 3 **38.17** 低于 PPO cold 的 **48.85**，也低于 Raw 的 44.27。总体涨、难档不涨，是 API-Bank 的结构，不是四舍五入。不要把 67.00 听成 ReTool 的 67.0。

Table 3 Bamboogle：1.5B **44.0** 对 Raw 20.8；3B **60.0** 对 Raw 52.0；7B **72.0** 对 Raw 69.6；Llama **52.0** 对 Raw 34.4。平均调用次数主设定并不疯狂：3B 1.32，7B 1.63。SFT400 把 7B 答案准确率打到 **28.8**，平均调用 **3.71**。蒸馏思维当正例，调用变多、答案变差。PPO cold 的 7B 是 48.0，仍低于 Raw。Table 5 对照 Search-R1：同骨干 Bamboogle 上 ToolRL GRPO 3B **60.00** / 7B **72.00**，Search-R1 GRPO 是 **23.20** / **40.00**。分母都是 Bamboogle 准确率，协议、搜索栈不必假设逐字节相同；作者用它挡「只是换皮 Search-R1」。不要把 72.00 改 ReTool 的 72.5。

Table 6：3B BFCL，4K **52.98**，同分布扩到 6K **53.02**、10K **53.31**。翻倍数据涨不到半个点。作者读成：这套奖励下，泛化更吃奖励形状，不吃堆同质题。4K 因此留作主设定。

长度奖励会伤 Qwen。Figure 4：1.5B 原 **46.20**，加静态长度奖 **33.23**，动态 **28.51**；3B 从 52.98 掉到 48.89 / 48.24。Llama 几乎不动（44.10 / 44.98 / 43.15）。\(L_{\mathrm{target}}=512\)。R1 那种「想长一点」在工具调用上不是免费涨分。作者写原始 Instruct 很少吐到这个长度的一半，512 是人为把思维段拉长。拉长成功了，BFCL 掉了。动态版把目标写成 \(L_{\mathrm{target}}(1+p)\)，\(p\) 是归一化训练进度，曲线更稳，分数仍低于原设定。

尺度和粒度是另两旋钮。正确性上限和格式打平（equal max）时，1.5B BFCL **39.47**，两阶段尺度 **38.85**，平滑动态尺度 **45.71**，原设定 46.20。3B 动态尺度可以到 **53.81**，略高于 52.98；两阶段是 50.66。Llama 动态 **46.85** 高于原 44.10。两阶段的切换点钉在第 **30** 步：前 30 步正确性缩到原尺度的 \(1/3\)，之后正确性恢复、格式缩到 \([0,0.5]\)。他们观察到格式分通常在前 30 步已经抬起来。动态细版用进度 \(p\in[0,1]\) 插值。主表仍报原设定，不把 53.81 / 46.85 写进 Table 1。粒度：Finegrained 对工具名和参数名不再给部分分；Intermediate 要求整份参数字典完全一致；Coarse 整段工具调用完全一致才给分。更稀的信号让正确性分涨得慢。作者的判断是细拆比「只给终局对错」更稳。这和 ReTool 的选择正好相反：那边故意不奖可执行，把时机交给探索；这边每步都有金标，不拆就学不动槽位。两套 \(I\)，不要收成「工具 RL 都该密奖励」或「都该稀疏」。

摘要 17% / 15% 对不上某一行的口算。3B BFCL 相对 Raw 是 52.98−33.04=19.94 个百分点，相对 SFT4k 是 11.01；7B 相对 Raw 是 16.41，相对 SFT4k 是 21.85（因为 SFT 把基座打下去了）。1.5B 相对 Raw 26.79，相对 SFT4k 只有 5.53。正文「大约 10 个绝对百分点」钉的是 Qwen 系列、同体积 SFT 那一句。跨榜再平均才会接近摘要。花园报格子，不给 17 反推一套权重。

## 4. 这不是 RSI，也不是第二份 ReTool

\(S\) 取当前 \(\theta\)。单轮 \(S'=I(S)\) 成立：15 epoch 之后下次推理用的是新权重。术语式 (2) 还要 \(I'\subseteq S'\)。格式门、三截正确性、尺度 3、4K 配方、逐步金标、JSON schema、BFCL 计分，都不进 \(\theta\)。模型不能把 Jaccard 改成「我自己说匹配就算」，不能把多轮 3.75 的计分改掉来刷总均，不能把 Hammer 的随机改名关了来背标签。混元台阶是 **L1** 的工具 RLVR：可训练状态在动，改进手续在墙外。

和邻居钉死。[ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) 的奖励是最终答案 +1/−1，工具是一只代码沙箱，骨干 32B，榜是 AIME 32 次平均。这边奖励逐步、工具是集合、骨干到 7B，榜是 BFCL / API-Bank / Bamboogle。两篇都关 KL，都走 veRL，配方仍是两份 \(I\)。[Tufa](../03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md) 冻 LLM 裁判给 0/1；这边冻的是规则匹配，更硬，仍不是递归。[LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md) 留下一类题的 Python 函数，不改 \(\theta\)。[ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md) 冻 PaLM，轨迹随题清空。ToolLLM / [Gorilla](../11-Gorilla-API调用微调/11-Gorilla-API调用微调.md) 是 API 轨迹 SFT；Gorilla 实验室还维护 BFCL，本表是用那把尺，不是把 Gorilla 权重训进来。APIBench 的 59.13 不要改本表 52.98。Search-R1 只出现在 Table 5。ToRL 是数学代码 RL，本篇相关工作点名它窄，不搬它的分数。

作者把结论写成 reward is all tool learning needs。花园读成：在他们扫过的类型、尺度、粒度、动态里，奖励形状比再堆 6K 同质题更关键。不是「人可以退出 \(I\)」。未来工作写模型放大、具身、多模态工具，每一条都还是人改循环。多轮 3.75 和 7B SFT 把 Bamboogle 打到 28.8，是失效标本：密奖励能教单步填槽，教不会把 BFCL 多轮那一格抬到能交差；蒸馏思维当 SFT 正例，会把已经会的 7B 问答训坏。局限段还写安全与滥用：会调工具的策略也可以调错工具。本实验的验收是 BFCL / API-Bank / Bamboogle，不是密封的红队。可靠性专文要的墙外监督，这里缺一份。

逐步金标是另一条层错。训练奖励看见 \(G\)，测试 BFCL 也大量按 AST / 执行对照官方调用。Bamboogle 才改成只看最终答案。作者把它写成泛化到 goal-oriented。花园把它读成：密监督在分布内，稀监督在分布外试了一次搜索问答。没有证据表明 \(\theta\) 已经能改「下次用哪种奖励」。换 Jaccard 为执行成功，等于人重写式 (3)。

![左列 θ 经 GRPO 冷启动上涨；中 WALL；右列格式正确性、4K、标签、Rmax=3、BFCL 冻着](./images/fig-toolrl-frozen.png)

> 图 2：实线只更新策略权重。墙右边是下次任务默认还在、且不被 \(\theta\) 改写的 \(I\)。

**图 2 解析**

- **Grows / \(\theta\)**：GRPO cold start。SFT 初始化往往更差，不是免费热身。
- **Train loop**：15 epoch，每查询 4 条 rollout，batch 512。
- **WALL Frozen \(I\)**：改进器身份。没有箭头从右列改回左列的奖励公式。
- **Format plus correct / 4K / tags / \(R_{\max}=3\) / BFCL**：奖励、题库、语法、尺度、验收协议。换其中任一项等于人改 \(I\)。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Model，GRPO 推 \(\theta\)。17% 是哪一格？不是某一格，是摘要汇总。和 ReTool 差在哪？工具集合加逐步拆分奖励，不是一只解释器加 boxed。还缺什么才敢叫 RSI？奖励公式或金标调用进入 \(S'\)，并且下一轮改进器就是升级后的那份。

**读**：式 (1)(2)(3)(4)、\(R_{\mathrm{final}}\in[-3,4]\)、Table 1 的 52.98 / 58.38、Llama 的 44.10 没有赢 SFT4k 44.16、多轮 3.75 / 18.12、API-Bank 67.00 不是 AIME 67.0、Bamboogle 60.0 / 72.0、Search-R1 对照 23.20 / 40.00、长度奖伤 Qwen、4K→10K 几乎不动、不是 RSI。  
**不读**：把 17% 听成准确率柱、把 67.00 收进 ReTool、把 72.0 收进 72.5、把多轮听成已经解决、把 cold start 听成对 Llama 也全面赢、把关 KL 听成 PPO 附录表也是 0。

同层：[08 ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md)、[10 ToRL](../10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md)、[11 Gorilla](../11-Gorilla-API调用微调/11-Gorilla-API调用微调.md)、[03 Tufa](../03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md)、[06 Absolute Zero](../06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md)。信号：[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。Harness 侧工具：[42 LATM](../../3-Harness层-Agent运行时/42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[29 ReAct](../../3-Harness层-Agent运行时/29-ReAct-推理与动作/29-ReAct-推理与动作.md)。评测纪律：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 参考文献

1. Qian, C., Acikgoz, E. C., He, Q., Wang, H., Chen, X., Hakkani-Tür, D., Tur, G., & Ji, H. (2025). [ToolRL: Reward is All Tool Learning Needs](https://arxiv.org/abs/2504.13958). arXiv:2504.13958. NeurIPS 2025. Table 1-8、式奖励与 GRPO 以会议 PDF 为准。
2. 代码：[qiancheng0/ToolRL](https://github.com/qiancheng0/ToolRL)。veRL：[volcengine/verl](https://github.com/volcengine/verl)。权重：[emrecanacikgoz/toolrl](https://huggingface.co/collections/emrecanacikgoz/toolrl-680706679204ead5a6d44f58)。
3. Jin 等 (2025). [Search-R1](https://arxiv.org/abs/2503.09516)。本篇 Table 5 对照，不搬它的主表。
4. Li, X., Zou, H., & Liu, P. (2025). [ToRL](https://arxiv.org/abs/2503.23383)。数学代码工具 RL；本篇不搬分数。
5. 本花园：[08 ReTool](../08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md)；[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)；[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。
