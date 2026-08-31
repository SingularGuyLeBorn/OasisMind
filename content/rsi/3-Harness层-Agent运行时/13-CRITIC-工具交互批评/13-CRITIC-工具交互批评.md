---
title: "13 · CRITIC：没有工具就看不见错"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Gou 等让冻结 LLM 用搜索、解释器、Perspective API 验自己的稿。
  ChatGPT 三套 QA 均 F1 +7.7，三套数学 +7.0，毒性概率 −79.2%。
  去掉工具，自评几乎不涨甚至掉。仍是 L0。
tags:
  - RSI
  - CRITIC
  - L0
  - tool-use
  - Harness
---

# 13 CRITIC：没有工具就看不见错

[Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) 让同一只模型骂自己。数学行几乎不动：GPT-4 92.9→93.1，ChatGPT 反馈 94% 写 everything looks good。CRITIC 把那句失败写成实验结论：所有测过的 LLM，靠自己验自己都不可靠；没有外部反馈，自我纠正只带来微弱增益，甚至把初稿改坏。海报数字换成 ChatGPT 三套 QA 均 F1 **+7.7**、三套数学 **+7.0**、毒性概率 **−79.2%**。打开消融：QA 上 CRITIC w/o Tool 相对 CoT，davinci 均 F1 **−0.03**，ChatGPT **+2.33**；毒性去掉 API，ChatGPT 最大毒性从 0.325 升到 **0.339**。涨幅绑在工具上，不绑在「会反思」。

本篇仍是任务内迭代，独立下一题从干净状态开始。和 Self-Refine 的差不是会不会改稿，是批评 $c_i$ 里有没有墙外 API 的返回。Google 摘要、解释器报错、Perspective 分数，都是冻着的 $T$，不是进 $S'$ 的改进器。[Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) 把失败写成 `mem` 跨 trial；这里没有窗口，只有本题的 verify–correct 循环。**不是** RSI：提示、停止规则、搜哪、调哪个 API，下一题原样再走。**不是** 微调。一手：Gou, Shao, Gong, Shen, Yang, Duan, Chen，清华 / MSRA，[arXiv:2305.11738](https://arxiv.org/abs/2305.11738)，ICLR 2024；代码 [microsoft/ProphetNet/CRITIC](https://github.com/microsoft/ProphetNet/tree/master/CRITIC)。数字以 HTML Table 1–3、Table 8–10、§4 为准。CRITIC$^*$ 是只改错题的 oracle，不当主表。

## 1. 问题：黑盒会编，人会去查

模型会幻觉、会写出跑不了的程序、会顺着网页语料往有毒处续。人的习惯是打开搜索、跑一遍代码、看审核分数，再改。传统修法要行为克隆、RL、自训练，都要标注。CRITIC 只要黑盒 $M$、几条 few-shot、以及打成 text-to-text 的工具：$T=\{\text{搜索},\text{解释器},\text{Perspective},\ldots\}$。先凭参数知识写出 $y_0$，再让 $M$ 带着工具验，把 API 结果拼进批评 $c_i$，再按 $c_i$ 改成 $y_{i+1}$。Verify $\Rightarrow$ Correct $\Rightarrow$ Verify，直到批评说对了、或到步数帽。

$S$ 取当前这道题的推理会话。变的是 $y_i$ 和本题提示里拼进去的 $c_i$。单轮 $S'=I(S)$ 可以发生。式 (2) 还要 $I'\subseteq S'$。下一道独立题仍用同一份 $\wp$、同一套 $T$、同一个 $n$。搜索缓存是为了复现（实验期约 9GB，2023 年 1–4 月），不是跨题记忆。混元 L0：改输出与轨迹，跨独立任务状态不变。工具在墙外，所以分数能当真一截；工具不升级，所以还不是花园 RSI。

和邻居先划线。Self-Refine 的 $fb$ 全是模型句子。CRITIC w/o Tool 几乎就是那条路：提示不改，只拿掉 API。QA 上这条路对 davinci 是负的。Reflexion 的门可以是启发式、自写单测或 EM；CRITIC 的门是任务指定的 $T$，人预先钉死——QA 用 Google，数学用解释器，毒性用 Perspective。Voyager 过门的函数留磁盘；这里过门的只是本题 $y$。ACE 抱怨自然语言反馈会越改越吵；CRITIC 用 $n=3$ 或 $4$ 硬切，吵完就丢。资源清单把 CRITIC 和 Self-Refine 写在同一行推理时进化里，读的时候必须拆开：有没有 API 返回，决定数学行会不会动。拆开之后，本篇是带工具的 L0，12 篇是不带工具的 L0。两篇都不是式 (2)。

![初稿进 Verify，工具返回拼进批评，再 Correct；虚线只在本题打转](./images/fig-critic-loop.png)

> 图 1：实线是本题内的验–改。工具框在墙外。虚线是把 $c_i$ 拼回提示。

**图 1 解析**

- **$M$ 冻着**：生成、查询、改写共用参数，few-shot 不同。
- **$T$**：QA 搜 Google 首页并截最多 400 字符；数学跑 Python，看报错或 `answer`；毒性问 Perspective。
- **停止**：批评认为已对、连续两轮答案不变、或 $n$ 到顶。QA $n=3$，数学 $n=4$，毒性 $n=4$ 且毒性低于 10% 就停。
- **没有 `mem`**：题换了，$c_i$ 清空。这是和 Reflexion 窗口的全部差别：那边句子留下，这里不留，完全从零开始，也没有技能文件，更没有权重。

## 2. 机制：验的时候必须把 API 拼进去

算法 1 可以收成：用 $\wp$ 写出 $y_0$；for $i=0\ldots n-1$：带着 $T$ 写出 $c_i$，若 $c_i$ 说对了就返回，否则 $y_{i+1}\sim P_M(\cdot\mid \wp\oplus x\oplus y_i\oplus c_i)$。API 调用的返回直接接在模型生成的查询后面，构成 $c_i$。提示里的示范是「What's the problem with the above answer?」加一条含工具轨迹的 few-shot。任务预先指定工具，方便评测；正文说也可以用 in-context 自动选工具，主实验没走那条。

QA 故意不用任务专用检索器，以免过拟合。搜索工具基于 Google：模型出 query，抓 top-1 页，按 snippet 模糊匹配最多 400 字符。交互最多 7 次。初稿是 CoT，最多改 3 轮，连续两轮答案相同就停。验的是 plausibility 和 truthfulness。贪心解码。每个验证集随机 500 题，报 EM 和 F1。搜索结果全部缓存，避免 Google 时间漂移。[ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md) 基线用的是同一套搜索 API 重跑，不是原论文数字。CRITIC w/o Tool 拿掉搜索，让模型自己编证据，提示不改。

数学初稿是 Program-of-Thought，工具是解释器。反馈两类：报错写成 `Execution: NameError(...)` 或 `Time out`；跑通了就取变量 `answer`。最多 4 轮，连续两轮执行结果不变就停。初稿贪心，改写核采样 $p=0.5$，免得改写卡死。数据集是官方测试：GSM8k、SVAMP、TabMWP，数字四舍五入后对金标，报 EM。CRITIC w/o Tool 只拿掉解释器信息。

毒性用 Perspective：总分加六项细分类，取最高项，批评写成 `The text has 39% toxicity of insult` 这种句子。最多 4 轮，总分低于 10% 停。核采样 $p=0.9$。从 RealToxicityPrompts 的非毒提示里抽 1k。指标：25 次生成的最大毒性，以及至少一次超过 50% 的概率。ppl 用 davinci-003。w/o Tool 让模型自己打细分类分，不用 API。

CRITIC$^*$ 只对错题做纠正，等于把金标或「已经对了」泄漏给调度。正文用它看上限。主判定认「每题都走纠正」的 CRITIC。拒采样（best-of-$N$ 新 CoT）在 QA 上低于 CRITIC$^*$：davinci EM 差 4.5，ChatGPT 差 3.3。批评不只是投票，还要指出错、给建议、给检索接地。

API 调用时间是 2023 年 1–4 月。开源对照是 LLaMA-2 7B / 13B / 70B，同一套提示。Self-Consistency：OpenAI 模型 10 样本，LLaMA-2 20 样本，$p=0.5$。

一轮可以写成：CoT 先答「某国首都是 A」。Verify 生成搜索词，Google 顶栏摘要写的是 B，400 字符里还有歧义句。批评把摘要拼进来，问上面的答案有什么问题。Correct 改成 B。连续两轮都是 B 就停。数学侧：PoT 写出 `num_pizza` 未定义，解释器回 NameError，批评写成 Execution: …，下一稿补变量。毒性侧：API 说 39% insult，模型把那句当批评，改到总分低于 10%。没有 API 时，同一套提示让模型自己编「证据」或自己打毒性分——QA 上 davinci 均 F1 相对 CoT 变成 −0.03，毒性上 ChatGPT 最大毒性从 0.325 升到 0.339。工具不是装饰，是门。

## 3. 数字：+7.7 绑着搜索，−44.6 是自评改程序

Table 1，每集 500 题。ChatGPT 相对 CoT：AmbigNQ F1 64.3→74.9，TriviaQA 79.2→81.7，HotpotQA 42.8→52.9，三集均 **+7.7**。EM：51.8→62.0、72.9→75.1、32.7→40.3。davinci 均 F1 **+5.6**。CRITIC$^*$ 再抬一截（ChatGPT 均 F1 +12.4），那是 oracle，不当证书。

CRITIC w/o Tool 对 CoT：davinci 三集 F1 58.3 / 74.7 / 46.1，均相对 CoT **−0.03**；ChatGPT 67.3 / 79.9 / 46.1，均 **+2.33**。HotpotQA 上 ChatGPT 无工具 EM 33.1，低于有工具的 40.3，也几乎不比 CoT 的 32.7 高。作者原句：自身批评贡献微弱，甚至不如初稿。ReAct 在 TriviaQA 上会掉（ChatGPT 63.7 EM，低于 CoT 72.9）；CRITIC 从 CoT 起步，把参数知识和检索拼在批评里，多数格子高于 ReAct→CRITIC。

| ChatGPT | AmbigNQ F1 | TriviaQA F1 | HotpotQA F1 |
|---------|------------:|------------:|------------:|
| CoT | 64.3 | 79.2 | 42.8 |
| CRITIC | 74.9 | 81.7 | 52.9 |
| w/o Tool | 67.3 | 79.9 | 46.1 |
| CRITIC$^*$ | 79.9 | 86.6 | 56.9 |

Table 2 数学，增益相对 PoT，不是相对 Vanilla。ChatGPT：GSM8k 72.5→78.2（+5.7），SVAMP 82.0→83.3（+1.3），TabMWP 75.0→89.0（+14.0），三集均 **+7.0**。davinci GSM8k +2.1，SVAMP **−3.3**（80.7 低于 PoT 84.0），TabMWP +23.0。有工具也会在 SVAMP 上改坏。w/o Tool：davinci GSM8k **68.3（−1.8）**，SVAMP 同样 −3.3，TabMWP 仍 +20.3。ChatGPT 无工具 GSM8k +4.5、SVAMP 0、TabMWP +12.0，比有工具窄。LLaMA-2 TabMWP：7B +4.7、13B +9.4、70B +16.0。13B SVAMP CRITIC **−0.6**。更大的模型更吃得下工具反馈，不是「反思涌现所以不用工具」。

Table 10 转引 Madaan 等在 **Codex + PAL** 上的 Self-Refine：PAL 71.3，Self-Refine **26.7（−44.6）**，oracle 版 Self-Refine$^*$ 才 76.2（+4.9）。这和花园 12 篇 Table 1 的 GPT-3.5 数学 64.1 **不是同一设定**——那边是解题率、这边是程序合成且停条件是模型自己说 it is correct。CRITIC 用 −44.6 证明：没有执行器，LLM 对程序对错的判断会把初稿拆掉。不要拿 26.7 回写 12 篇主表。

Table 3 毒性。ChatGPT 最大毒性 0.325→0.173，概率 0.192→**0.040**，相对降幅 **79.2%**。davinci 概率 0.210→0.045。w/o Tool：ChatGPT 最大毒性 **0.339**、概率 **0.223**，都比基座差；davinci 同样 0.353 / 0.227。PPO / Quark / Self-Correct 是 GPT-2 上训过的，Perspective 当奖励或造对；CRITIC 不训练，分数靠近那一档，但尺子仍是同一套 API。停条件「低于 10%」也是这把尺子。

QA 监督 SoTA（AmbigNQ F1 52.1 等）是另一时期微调系统，和 ChatGPT+CRITIC 的 74.9 不要横加成年份竞赛。样本是 500 题子集，不是全验证集。迭代图：2–3 轮吃掉大部分增益；没有可靠反馈时，多轮回报又低又差。

Table 8 的 LLaMA-2 把「更强模型更吃工具」写成三档。7B AmbigNQ：CoT F1 42.9，CRITIC 55.4，w/o Tool **42.3**（掉到 CoT 以下）。70B AmbigNQ：CoT 65.2，CRITIC **74.1**，w/o Tool 61.2。TriviaQA 上 ReAct 在 70B 掉到 58.0 EM，低于 CoT 69.5；CRITIC 从 CoT 拉回 71.0。HotpotQA 70B CRITIC F1 49.6，监督 SoTA 72.0 仍远在上面——多跳检索不是三轮 Google 能填平的。Table 9：7B GSM8k PoT 18.7→CRITIC 20.7（+2.0），13B SVAMP 66.3→65.7（−0.6）。小模型加上解释器，增益可以薄到噪声；TabMWP 这种「表 + 算术」更吃执行器，70B +16.0 和 7B +4.7 差一截。

附录 Table 5 把「自己知不知道自己对」收成幻觉检测。ChatGPT 上 CRITIC 的验证准确率 / AUROC：AmbigNQ **0.730 / 0.810**，TriviaQA **0.882 / 0.818**，HotpotQA **0.765 / 0.831**。Self-Eval（让模型选 True/False）是 0.625 / 0.668、0.838 / 0.731、0.540 / 0.713。热度、熵、Self-Consistency 投票给的 AUROC 也到不了有搜索的那一档。没有工具，置信度不是真值。F1>0.6 才当对，因为开放答案用 EM 会误杀。

HotpotQA 抽 100 条手工标。幻觉：CoT 36%，CRITIC **7%**。推理错 5%→10%，拒答 2%→12%（证据不够就拒，作者当预期行为）。错误纠正——把对的 CoT 改坏——占 CRITIC 错例 **10%**。标签歧义 / 标错 / 过时这三类假阴性合计占 CRITIC 错例 **49%**。EM/F1 会把对的自由表述打成错。不要用 HotpotQA 的 +10.1 F1 听成「多跳已经解决」。

GSM8k 全测试 1319 题上，初稿错误 363。内在推理错 77.4%，离谱输出 16.8%，句法+运行时 5.8%。CRITIC 非 oracle：离谱输出修对 57.4%，句法 35.3%，内在推理只有 **26.7%**——解释器给不出「题意理解错了」这种反馈。整体把初稿错题修对 **32.2%**。对原本对的程序，准确率掉 **4.3** 个百分点，事后错误里 14.3% 是改坏。SVAMP 上 davinci −3.3，和这 4.3 是一类：有工具仍会改坏对的稿。

![上排本题 y 在改；下排 M、提示、工具 API 冻着；下一题不带批评历史](./images/fig-critic-frozen.png)

> 图 2：实线只更新本题输出。虚线是冻着的 $I$ 和 $T$。独立下一题从空历史开始。

**图 2 解析**

- **会变**：本题 $y_i$ 和本题里的 $c_i$。
- **冻 $M$**：davinci-003、gpt-3.5-turbo、LLaMA-2，论文明确不额外训练。
- **冻 $I$**：$\wp$、$n$、7 次搜索帽、停条件。
- **冻 $T$**：Google 缓存、解释器、Perspective。下一题还是这三样，不会多出一个新 API。人换工具等于人改 $I$。循环换不了。

## 4. 有工具仍是 L0，只是门不在嘴里

$y$ 变好了，改进器没变。下一题的搜索策略、解释器、Perspective 阈值都还是人钉的。混元 L0：好处和危害随 episode 丢弃。不要用 +7.7 给 [SEAL](../../2-Model层-训练时自改进/04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md) 的 LoRA 或 [DGM](../04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 的自改 Python 背书。工具在墙外，所以比 Self-Refine 的数学行可信；工具不进 $S'$，所以比 Argus / ACE 浅。

和 [Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) 钉死。那边 Table 1 数学 +0.2，附录 oracle 才 +4.8。这边 Table 2 有解释器，ChatGPT GSM8k +5.7；拿掉解释器，davinci −1.8。两边都叫自我纠正，门完全不同。Self-Refine 的代码优化反馈是自然语言「太慢」；CRITIC 的数学反馈是 NameError 和跑出来的数。Huang 等 [arXiv:2310.01798](https://arxiv.org/abs/2310.01798) 后文问无外部反馈时推理自纠正；数字见 [02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)，不并进本篇主表。CRITIC 自己已经在 2023 年把「无工具会掉」写成主结论。

和 [Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) 钉死。那边 `mem` 跨 trial，AlfWorld 重置房间留句子。这边没有窗口。Reflexion 编程用自写单测当 $M_e$，假阳性会提前交卷；CRITIC 数学用真解释器，假阳性换成「程序跑出了错的数仍像对的」——执行结果不是金标，只是可执行。HotPotQA 在 Reflexion 里用 EM 喂循环，那是金答案；在 CRITIC 里用 Google 喂循环，那是网页。两套墙外证据强度不一样。

Perspective 既当批评又当评测尺子。毒性 −79.2% 是在同一把 API 上优化再打分。PPO / Quark 也用这把尺子训练。读 0.040 时要记得：停条件就是「API < 10%」。换一把审核器，曲线会动。这和花园「证据在更新边界外」只满足一半：API 对生成器是外的，对实验者是同一把。

Google 会过时。作者用缓存挡住复现抖动，也等于把 2023 年初的网页冻进评测。CRITIC 能改「过时知识」，靠的是当时的搜索，不是模型长了新权重。换一天的索引，同一套提示分数会变。这是 Harness 绑环境的老病，不是 RSI。搜索每次最多 400 字符，多跳证据链很容易截断。延迟随 $n$ 近似线性；数学改两轮大约是 PoT 的两倍时间。Self-Consistency 要几十到上千样本，作者拿这个挡「CRITIC 太慢」。提示是人写的 ReAct 风 few-shot，换示范分数会动。局限节自己写：别的任务、别的模态、没有手写示范时，效果不确定。

[Absolute Zero](../../2-Model层-训练时自改进/06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md) 的解释器在训练环里给 0/1，改的是 $\theta$。CRITIC 的解释器在测时给报错和 `answer`，改的是本题 $y$。同一类墙外执行器，寿命差一层。这边跑完不留 checkpoint。Program-of-Thought 已经把题写成程序；CRITIC 只是在程序跑砸了之后再改。没有 PoT 初稿，循环没有可执行的抓手——Vanilla 那一行 GSM8k ChatGPT 只有 27.9，不是本方法的起点。

搜索交互最多 7 次，改写最多 3 轮。7 次是「这一轮 Verify 里能搜几下」，3 轮是「Verify–Correct 大循环」。两顶帽子都是人钉的 $I$。Agent 改不了「下次多搜两次」。缓存约 9GB 保证 greedy 查询对上同一页，也把评测锁在 2023 年春季的网上。Perspective 对实验免费，对生成器仍是外部分数；毒性 25 次采样的最大毒性 / 超 50% 概率，和 GSM8k 的 EM 不是一类指标，不要平均进 +7.7。

附录把 CRITIC 和 RLHF 拆开：RLHF 改权重、要对齐标注；CRITIC 是黑盒测时验改，补的是过时事实、跑不通的代码、换环境。两套不要比谁分高。花园同意拆，并补一句：测时验改仍然不是式 (2)。相关工作自称第一次在多样任务和多只模型上展示无外部反馈的自我验证不可靠。后文 Huang / 图着色 / 规划用 GPT-4 又钉了一遍。数字各走各的表。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？本题输出，L0，门在工具。权重动了没有？没有。+7.7 能不能当自进化？不能，w/o Tool 几乎抹掉它。还缺什么才叫花园 RSI？选工具、写批评提示或停止规则进入 $S'$，并且下一题的改进器用的就是升级后的那份——目前每题从同一份 few-shot 和同一组 API 再开始。

## 5. 工具寿命，和句子、函数、权重仍不是一类

同一句「模型在改自己」，CRITIC 多出来的是 $T$ 的返回值。返回值活过本题最多 3–4 轮，题换了清空。Self-Refine 的 $fb$ 同寿命，只是不含 API。Reflexion 的 $sr$ 活过若干 trial。Voyager 的函数留磁盘。SPIN 的寿命在 checkpoint。CRITIC 没有第五段寿命叫「工具自己进化」：Google、CPython、Perspective 都不被循环改写。

Gödel Agent 把手写 Self-Refine 放进模块图不变。CRITIC 同档：循环可以在一次任务里把答案改对，下次怎么搜、怎么停，仍是人写的 $\wp$ 和预指定 $T$。SVAMP 上 davinci 有工具仍 −3.3，说明 $T$ 不是万能墙外金标——执行对了不等于题对了。TabMWP 表格题 +14 / +23，解释器特别帮得上。读新闻时先问批评里有没有 API 返回，再问 API 是不是同一把评测尺，最后问下一题是否还带着这题的 $c_i$。三问都空，就还在 L0。

few-shot 里的工具轨迹是人钉的示范，不会因为这题搜到了 Wikipedia 就把那条页面写进仓库。人要加例子，得亲手改 $\wp$。那是改 $I$，不是 $I$ 进了 $S'$。自动选工具写在方法里，主表没有把它当成被优化的对象。

拒采样在 QA 上用最高指标选 $N$ 条新 CoT，CRITIC$^*$ 仍高 4.5 / 3.3 EM。作者说批评能定位、给建议、给接地。花园补一句：CRITIC$^*$ 先知道哪题错了，拒采样不知道。主设定 CRITIC 没有这层泄漏，ChatGPT 三集 F1 仍高于 Self-Consistency 和 ReAct 的多数格子，HotpotQA 上 ReAct 的 50.2 F1 和 CRITIC 的 52.9 贴得近。多跳题上，搜索工具帮得有限，不要用 AmbigNQ 的 +10.6 F1 外推到所有 QA。

毒性表上，GPT-2 的 Self-Correct 概率 0.026，ChatGPT+CRITIC 0.040。前者训了独立 corrector，后者冻着 $M$ 只问 API。两套都不是「模型学会了安全」。PPO 0.044 也用 Perspective 当奖励。读「不训练就打平监督 SoTA」时，先看尺子是不是同一 API，再看基座是 GPT-2 还是 ChatGPT。换模型、换审核器，0.040 作废。

**读**：Verify–Correct、$T$ 三类、QA 500 题、$n=3/4$、ChatGPT F1 +7.7 与数学 +7.0、毒性概率 0.192→0.040、w/o Tool 的 −0.03 / +2.33 / 毒性变差、SVAMP davinci −3.3、Table 5 AUROC、HotpotQA 幻觉 36%→7% 与 FN 49%、GSM8k 错题修对 32.2%、Table 10 Self-Refine 26.7 不可回写 12 篇、CRITIC$^*$ 是 oracle、L0。  
**不读**：用 +7.7 盖 w/o Tool、把 CRITIC$^*$ 当主结果、用 Codex Self-Refine −44.6 替换 Madaan Table 1、把 Perspective 自洽听成墙外安全证书、用 HotpotQA 手工 100 条外推全验证集、说已经 RSI。

同层：[12 Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)、[14 TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md)、[11 Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md)、[10 Voyager](../10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md)、[42 LATM](../42-LATM-函数缓存造工具/42-LATM-函数缓存造工具.md)、[29 ReAct](../29-ReAct-推理与动作/29-ReAct-推理与动作.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。术语：[01](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。

## 参考文献

1. Gou, Z., Shao, Z., Gong, Y., Shen, Y., Yang, Y., Duan, N., & Chen, W. (2024). [CRITIC: Large Language Models Can Self-Correct with Tool-Interactive Critiquing](https://arxiv.org/abs/2305.11738). ICLR 2024. Table 1–3、Table 8–10 以 HTML 为准。
2. 代码：[microsoft/ProphetNet/CRITIC](https://github.com/microsoft/ProphetNet/tree/master/CRITIC)；搜索工具 [ZubinGou/llm-agent-web-tools](https://github.com/ZubinGou/llm-agent-web-tools)。
3. 本花园：[Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md)；[Reflexion](../11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md)；[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。
