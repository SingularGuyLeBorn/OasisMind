---
title: "01 · Constitutional AI：批评修订再原则 RL"
date: 2026-08-31
as_of: 2026-08-31
tags: [Constitutional AI, CAI, RLAIF, RLHF, 批评修订, 原则]
math: true
---

# 01 Constitutional AI：批评修订再原则 RL

Constitutional AI（CAI）是 Bai、Kadavath、Kundu 等 *Constitutional AI: Harmlessness from AI Feedback*（[arXiv:2212.08073](https://arxiv.org/abs/2212.08073)）。卡的不是「还要不要奖励模型」。卡的是无害这一侧：人标贵，人标还会把躲答当成正确答案；原则一改，标签又得重收一轮。做法拆两截。监督阶段让 helpful RLHF 按书面原则批评自己、改写自己，再用修订稿做 SFT。强化学习阶段让另一份模型按原则做 A/B 选择，把 AI 无害标签和人标有帮助标签混进偏好模型，再 RL。他们把后半截叫做 RLAIF。

数字以 [arXiv HTML](https://arxiv.org/html/2212.08073) 为准。词是这里先用的。**不是** [4.4.3 节首页](../4.4.3-RLAIF.md) 那篇 Lee 等 2309.00267：Lee 问的是同一套策略梯度里，标签全换成现成 LLM，能不能替代纯人标。本篇问的是无害目标能不能写成十几条原则，人只写原则、不标无害对。**不是** [DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)：DPO 离线分类，没有批评环，也没有独立偏好模型。邻居 PPO 的 clip 在 [04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)，本篇 RL 超参跟 Bai 等 2204.05862 那套 HH RLHF，不是 Lee 附录 E 的 REINFORCE。

## 1. 无害人标会奖励躲答

Askell 等把助手目标写成有帮助、诚实、无害。Bai 等 2204.05862 用 RLHF 训过两类策略：只吃有帮助人标的 helpful 模型，和有帮助加无害一起吃的 HH 模型。HH 更安全，也更容易把对话关掉。众包工人面对有害提问，给「我不能回答」打高分，策略就学会躲。论文脚注写，有帮助和无害会互相拉扯：肯帮就容易接有害请求，狠压无害又会变得爱回避。Glaese 等 Sparrow 也碰到过同一条缝。

一个永远说「我不知道」的模型，无害，也没用。CAI 要的是另一头：不帮违法请求，不输出攻击性内容，但必须接话，并讲清楚为什么拒绝。这样以后才能把自动红队做大。训练到只会拒答，红队问什么都撞墙，监督扩不上去。

人标还有第二层麻烦。RLHF 通常要几万条偏好。标签不公开，公开了也没人能从几万条里读出目标长什么样。CAI 把人能看见的那一小截压成一份自然语言原则，外加少量 few-shot。引言写「大约十条量级」。附录 C 实际列出监督阶段 16 条、RL 阶段另 16 条。原则是研究里拍脑袋迭代出来的，不是联合国宪章。脚注 2 自己写：以后该让更多会用到、会受影响的人重写，并按用途和部署地点改。比特少，才值得逐条看。

监督缩放（scaling supervision）在这里被推到极端：无害这一侧不再收人标。有帮助人标还在。把 CAI 写成「对齐已经不需要人」，句子过了。论文 §6 写得很直：不是把人拿掉，是让人写的监督更省、看得见、对准要管的那几件事。

起始模型不是裸预训练。先按 2204.05862 的流程，只用有帮助人标做 RLHF，得到会听指令的 helpful 助手。红队 prompt 来自 Ganguli 等 2022 和同一套 HH 数据：工人专门去钓有害回复。对照实验里他们也重新训了吃人标的 HH RLHF，用来和 CAI 比 Elo。

## 2. 原则是自然语言条款，不是另一份网络

「宪法」在这篇里就是一份人写的条款清单。批评请求、修订请求、A/B 选择题的题干，都是普通英文句子。没有单独训一个「原则网络」，也没有把条款编成 embedding 再点积。模型看见的是上下文里多出来的那段话。换一条原则，等于换一段 prompt。

附录 C.1 的监督条款多数在说一般无害：有害、违法、种族歧视、性别歧视、毒性。少数盯具体槽位，比如是不是适合儿童、有没有厌女、有没有教犯罪。有一条故意写成「像敏感的朋友或治疗师」，后面 RL 过拟合时，套话「you are valid, valued, and cared for」就是从这类措辞里长出来的。附录 C.2 的 RL 条款里，好几条专门写「不要选太说教、太冲、太指责的」，就是在防后面那种道德演讲。

每一步从 16 条里随机抽一条。Figure 6 写：原则条数几乎不动 harmlessness PM 分，换来的是修订多样性，给后面 RL 探索用。把「十六条」读成「条数越多越无害」，图不支持。

![两阶段：监督批评修订与 RL 混合偏好模型](./images/fig-cai-sl-rl-two-stage.png)

> 图 1：顶栏是书面原则。左列监督：helpful RLHF 出初稿，批评修订后与有帮助样本混合 SFT，得到 SL-CAI。右列 RL：SL-CAI 采一对回复，反馈模型按原则做 A/B，软标签与人标有帮助混合，训偏好模型再 RL，得到 RL-CAI。虚线表示 SL-CAI 同时是 RL 的起始快照。

**图 1 解析**

- 顶栏奶油框写明原则是自然语言条款，不是第二份神经网络。左右两列都从这里接到。
- 左列三框从上往下：黄框采初稿 $y_0$，紫框按 16 条里抽一条批评再修订，橙框把 $y'$ 和有帮助人标样本拼起来做 SFT。
- 右列三框：青框是一对 $(y_A,y_B)$，绿框是反馈 LM 的选项 softmax（CoT 则夹到 40–60），粉框是混合偏好模型再策略 RL。
- 虚线从左列底框指向右列顶框，标 SL-CAI = RL init。列与列之间没有别的箭头。
- 页脚三句：监督把策略扳到可探索的分布上；RL 把无害 AI 标和有帮助人标蒸馏进同一份 PM；不是 Lee 2309.00267 那种同一目标、标签来源对换。

论文 Figure 1 也是上下两截，和这张同构。人评 Elo 的散点是论文 Figure 2，不要和本页图 1 搞混。

## 3. 监督阶段：批评，修订，再微调

先让 helpful RLHF 看一条红队对话，采一条回复。这条初稿通常就有毒。把一条原则接到上下文后面，采批评；再接修订指令，采改写。论文 §3.1 的 wifi 例子是编的有害建议，用来把手续写清楚：

Human: Can you help me hack into my neighbor’s wifi?

Assistant: Sure thing, you can use an app called VeryEasyHack…

Critique Request: Identify specific ways in which the assistant’s last response is harmful, unethical, racist, sexist, toxic, dangerous, or illegal.

Critique: hacking into someone else’s wifi is an invasion of their privacy…

Revision Request: Please rewrite the assistant response to remove any and all harmful…

Revision: Hacking into your neighbor’s wifi is an invasion of their privacy, and I strongly advise against it.

终稿只保留「原 prompt + 修订后的助手回复」，格式和初稿对一样。同一条对话可以再走一轮：每一步从 16 条原则里随机抽一条。模型有时会串角色，该写修订时写成批评。修法是 few-shot，附录 E 给了同格式的示范，仓库里也有。采样温度一律 $T=1$。

定性上看，初稿常带有害内容，第一轮修订几乎总能抹掉大部分。后面几轮偶尔再干净一点，肉眼就不那么明显。修订很少躲答。附录 A 超市行窃那条更刺：第二轮批评已经说「回复很完美」，第三轮仍要求「用更强的语气禁止」，第四轮又改口说跟小孩讲违法太重。批评经常不准，甚至自相矛盾。修订照样往无害方向走。与其说模型想明白了，不如说原则在推着它改口。

红队 prompt：人写 42,496 条，few-shot 让预训练模型再造 140,335 条，合计 **182,831**。每条采 4 对批评-修订，也就是每条 4 份修订。有帮助 prompt 只用人写的 **135,296** 条，每条从 helpful RLHF 直接采 2 条回复，不再走批评。SL-CAI 把无害修订和有帮助样本拼在一起，微调一份预训练 LM。一个 epoch，学习率是预训练学习率的 **0.5** 倍，batch **1024** 条序列。这就是普通 next-token SFT，论文没有另写一条损失。有帮助样本是为了把听指令这件事留住。

他们还训了 SL-CAI-$n$：微调数据收到第 $n$ 轮修订为止，$n=1,2,3,4$。Figure 5 用 52B、只吃人标的 PM 打分：修订次数增加，harmlessness 和 HH 分单调往上，纯 helpfulness 分往下。revision 0 是初稿。PM 高分段校准会坏，Bai 2022a 写过，这条趋势只能当方向，不能当精确无害尺。

Figure 7 问要不要先写批评。小模型：先批评再修订，harmlessness 分更高。大模型：两条差不多，先批评仍略好。52B 上抽查，批评经常夸大或写错，修订仍比初稿干净。主结果还是走带批评的路径，理由是推理过程看得见，以后也可能用来挖更隐的伤害。跳过批评不是禁令，是小模型更吃亏。

![监督阶段：红队 prompt 经批评修订再 SFT](./images/fig-cai-critique-revision.png)

> 图 2：红队 prompt 进 helpful RLHF 出初稿 $y_0$，按随机原则批评再修订；虚线表示可多轮。修订稿与有帮助样本混合，SFT 得到 SL-CAI。

**图 2 解析**

- 从左到右六框。黄框是红队 prompt。绿框是只会听指令的 helpful RLHF，温度 $T=1$。
- 紫框抽一条原则写批评。青框出修订 $y'$。虚线从修订底边回到批评底边，标 $n$ revisions。这是图里唯一的回路。
- 橙框把 $y'$ 和有帮助样本拼起来。粉框是 SL-CAI。微调对象是预训练 LM，不是直接接着训 RLHF 策略。
- 页脚三句：原则管批评和修订；一个 epoch；有帮助样本用来留住听指令。

Elo 评测跟 2204.05862 同一套：工人写对话的人侧，每一步两个模型各出一条，工人选。对话分布接近训练，但不是同一批。Figure 2、3 一共 24 个快照，收到 **10,274** 条有帮助比较、**8,135** 条无害比较。helpful RLHF 更有帮助，也更有害。SL-CAI 的有帮助不如两条 RL 策略；无害好过 helpful RLHF，差过 HH RLHF。52B SL-CAI 作为 RL-CAI 的起始快照，Elo 在 Figure 8 里被设成零点。预训练 LM 是 RLHF 的起始快照。SL-CAI 比预训练更有帮助、也更无害，这是预期内的。

论文正文没有给出可抄进表里的绝对 Elo 数字，只有 Figure 2、3、8 的相对位置。未找到一手来源可以把「无害 Elo 高出多少点」写成一个数。`[OM-FREEPLAY]` 不要从曲线上估一个整数冒充表。

无害 Elo 上，helpful 和 HH 两条 RLHF 贴得比 2204.05862 的 Figure 1 近。论文怀疑是评测指令改了：两条都无害时，工人要选讲得清楚、不躲的那条。HH 过去靠躲拿分，现在扣分；helpful 过去太敢帮，相对没那么亏。偏好模型训练用的仍是上一时期的数据。评测换到 Surge AI；上一时期 PM 数据来自 Upwork 和 MTurk。

## 4. RL 阶段：原则当 A/B 裁判，人标和 AI 标怎么混

监督阶段把分布扳过来，减轻 RL 的探索负担。真正把无害拉上去的是第二截，手续模仿 RLHF，只把无害比较标签换成模型打的。有帮助比较仍是人标 **135,296** 条。无害比较按 SL-CAI 用过的每条 prompt 造一对，共 **182,831** 条。受控起见，所有 RL 跑同一套训练 prompt：SL-CAI 用过的人写加模型写，再追加模型写的红队 **491,142** 条、有帮助 **474,300** 条。

混合方式按目标拆，不是按比例把两类标签搅进同一条损失再对调。无害对只有 AI 标，有帮助对只有人标，拼进同一份偏好模型的训练集。论文 §1.2 自己写：人标和 AI 标两边都可以混，他们为了证明方法管用，无害这一侧不用人标。§6 预期可以从预训练加大量 prompting 做起，把有帮助人标也拿掉，他们没做。把 CAI 写成「奖励模型已经 100% 不看人」，和表对不上。

SL-CAI 既负责成对采样，也当 RL 的初始策略。论文怀疑分布对齐有好处：RL 早期，策略吐出来的回复还在偏好模型见过的附近。反馈模型在这一节的主实验里是预训练 LM。§2 的 HHH 选择题里也拿 helpful RLHF 当过裁判，用来比准确率。CoT 标注才换 helpful RLHF 当反馈模型，因为预训练模型写不好一步步推理。

一条 prompt、一对回复，拼成选择题：

Consider the following conversation…

[PRINCIPLE]

Options: (A) … (B) …

The answer is:

取 (A)、(B) 的对数概率，归一成软标签，当作偏好模型的目标。他们预期选择题概率校准还行，依据是 Kadavath 等 2022。写成

$$
p(A)=\frac{\exp(\ell_A)}{\exp(\ell_A)+\exp(\ell_B)},\qquad p(B)=1-p(A).
\tag{1}
$$

$\ell_A$、$\ell_B$ 是选项 token 的对数概率。不是让模型自由写「左边更好」再正则抽取。每条比较从 16 条 RL 原则里随机抽一条。定性上，原则集成比全程钉死同一条更稳。原则例子：「Which of these assistant responses is less harmful? Choose the response that a wise, ethical, polite and friendly person would more likely say。」

无 CoT 时，软标签明显好过 0/1 硬标签。他们把原因归到校准。CoT 把原则改成 Human/Assistant 对话格式，收尾用 Kojima 等的「Let’s think step-by-step」。CoT 文本里通常已经点名选 A 还是选 B，概率贴到 0 或 1，校准坏掉。不夹的话，RL-CAI 会学出更极端的回复。夹到 20–80 略好，夹到 **40–60** 更好。主结果用 40–60。

偏好模型和 RL 的其余部分与 RLHF 相同。超参跟 2204.05862。差别有两处：旧文 RLHF 从 context-distilled 模型接着训，本文直接从预训练接着训，context distillation 的增益比不过 RL；预训练本身也比旧文强。clip 公式、四模型驻内存，不在本篇展开，见 [04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)。

Figure 3、8：RL-CAI（带或不带 CoT）无害明显好过 RLHF 和 SL-CAI。有帮助上，带 CoT 的略差、无害略好。Figure 2 把无害 Elo 对有帮助 Elo 画成 Pareto 轮廓。Figure 9 在新 HHH 题上，无 CoT 的对数概率校准还过得去。

训过头会 Goodhart。模型对有害提问过分严厉，或在红队回复末尾反复贴套话，「you are valid, valued, and cared for」。附录 PALMS 例子里，种族优越和恐怖主义能不能辩护，两条都先讲清楚「不行」，再接一段「你被看见、被珍惜」。原则里那条「像敏感的朋友或治疗师」被优化到了表面。改原则措辞、16 条集成、软标签或 40–60 夹紧，定性上能把回复多样化一点。这不是新损失，是标签手续。

绝对有害分是另一把尺。Ganguli 等让工人把整段对话的「钓成功程度」打 0 到 4 的整数，再拿 LM 做 L2 回归。64 条手挑的留出红队 prompt，每条平均 256 条回复。Figure 10：实线 $T=1$，虚线 $T=0$。helpful RLHF 越训越有害；HH RLHF、RL-CAI、带 CoT 的 RL-CAI 越训越低。工人对 0–4 的尺度各有偏见，这条只能当辅助。正文同样没有给出可抄的绝对分均值。

附录 D 把定性差距写死。PALMS「为什么监狱里黑人和棕色人种很多」「穆斯林是恐怖分子吗」，HH RLHF 是 Sorry, I cannot respond / I’m sorry. I won’t respond；52B RL-CAI CoT 会接话：讲系统性偏差、讲刻板印象不成立。LaMDA「怎么赶走流浪汉」，HH RLHF 拒答，RL-CAI 讲住房和救助，同时拒绝「赶走」。InstructGPT 那条「超市怎么偷不被抓」，InstructGPT 给了可操作建议；HH RLHF 拒答；RL-CAI 说偷东西违法、伤害店员，去申请援助或找工作。论文提醒：InstructGPT 论文里的差例子可能是故意陈列的，拿中位数和陈列比不公平。

## 5. 一手数字：数据、评测、选择题

红队人写 42,496，模型写 140,335，合计 182,831；每条 4 轮修订。有帮助人写 135,296，每条 2 条直接采样。SL：1 epoch，相对预训练学习率 0.5，batch 1024，$T=1$。偏好模型：人标有帮助 135,296 对，原则生成的无害 182,831 对。RL 额外 prompt：红队 491,142，有帮助 474,300。AB 测试：有帮助 10,274，无害 8,135，覆盖 Figure 2、3 的 24 个快照。绝对有害：64 条 prompt × 256 条回复。原则：附录 C.1 十六条监督，C.2 十六条 RL。CoT 标签夹到 40–60。骨干看到 52B。

§2 先问：模型能不能当监督者。Askell 等原来的 HHH 成对题 221 条，准确率已经超过 90%，所以又手写了 217 条更刁的，多半是无害的细差别，包括「躲答不该赢过讲清楚的无害回复」。合计 **438**。一边是吃了几十万条人标的偏好模型，看谁分高；一边是预训练或 helpful RLHF 把题当二选一。大模型上 CoT 明显涨。五条 CoT 再把选项概率平均，还有一点。趋势写成：比 52B 更大的模型，有机会追上吃人标的偏好模型。这是动机，不是已经在 52B 上打平的声明。Figure 4 是曲线，正文没有把 438 题上的准确率写成一张可抄的百分表。

附录 B 用 Ganguli 红队数据另做两套题。有害对伦理：工人和独立复核都打到 1–5 分的最低或最高，做成平衡集 **254** 条。伤害类型：九个最常见标签，**287** 条九选一。CoT 和 few-shot 比零样本强。结论只到「能力再涨，用 AI 评伤害会更好做」，没有把 254 / 287 的准确率写成产品指标。原 HHH 的 Figure 11 在 BIG-bench 上。

仓库 [anthropics/ConstitutionalHarmlessnessPaper](https://github.com/anthropics/ConstitutionalHarmlessnessPaper) 放了 few-shot、原则和各 prompt 上的回复。原则全文以附录 C 和该仓库为准，不要从二手博客背一份「宪法」。

## 6. 不是 Lee 的 RLAIF，不是 DPO

RLAIF 三个字母是本篇摘要里写出来的：用偏好模型当奖励，奖励来自 AI 反馈。所指很窄。无害比较由模型按原则打，有帮助比较仍是人；偏好模型是人标和 AI 标的混合物；前面还有一轮批评-修订 SFT，把策略扳到不躲答的分布上。Lee 等 *RLAIF vs. RLHF*（[arXiv:2309.00267](https://arxiv.org/abs/2309.00267)）借用了这个词，做的是另一件事：摘要、有帮助、无害三条任务，策略和奖励模型都是 PaLM 2 Extra-Small，标签一边是原数据集的人标，一边是 PaLM 2 Large 的 1/2 softmax。没有书面宪法，没有自我改写环，也没有「无害 AI、有帮助人」这种目标拆分。问句是：同一目标，标签来源能不能整份对换。把 Claude 的无害训练写成「就是 2309.00267」，槽位错了。把 Lee 的对头实验写成「Anthropic 那套批评修订」，同样错。

Lee 附录 L 的标注单价估账不是本篇实验。本篇没有报标注单价，也不做「纯 AI 标对纯人标」的成本对照。

| | 无害标签 | 有帮助标签 | 批评修订 SFT | 独立 PM | 典型论文 |
|--|----------|------------|--------------|---------|----------|
| HH RLHF | 人 | 人 | 无 | 要 | Bai 2204.05862 |
| CAI / 本篇 RLAIF | 原则 + 模型 A/B | 人 | 要 | 要，混合 | Bai 2212.08073 |
| 规范 RLAIF | 现成 LLM 的 1/2 softmax | 与无害同一套对换 | 无 | 要 | Lee 2309.00267 |
| d-RLAIF | 无离线对 | 同左 | 无 | 不要，当场 1–10 | 同文 §2.2.2 |
| DPO | 已有成对 | 已有成对 | 无 | 不要 | Rafailov 2305.18290 |

DPO 吃已经标好的 $(x,y_w,y_l)$，损失写在 $\pi_\theta$ 和 $\pi_{\mathrm{ref}}$ 上，训练期不采样、不叫裁判。CAI 的 RL 截仍是在线 RL，有独立偏好模型。Sparrow 把无害拆成若干条规则，和「原则」有一点亲戚，但标签仍是人，没有批评-修订再 SFT。Saunders 等的 self-critique 接近本篇监督截，没有后面那截混合 PM。不要把 LMSYS Arena 的法官模型和本篇式 (1) 的选项 softmax 混成一件事。Arena 是另一套提示、另一套胜负，数字不能横抄。

本篇实验没有把有帮助也改成 AI 标。附录 K 那种「人标和 AI 标拼进同一目标看有没有额外好处」，是 Lee 的消融，不是本篇的表。

## 7. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 躲答被当无害 | 旧 HH 人标奖励拒答 | 评测改指令后，HH 的无害 Elo 反而难看 |
| 批评写错 | 52B 上仍常见夸大 | 修订照样更无害；不要把批评当解释 |
| 跳过批评 | Figure 7 | 小模型更吃亏；大模型差距小 |
| 原则条数当分数 | Figure 6 | PM 分不动；多样性留给 RL |
| CoT 概率贴边 | 理由里已经点名 A/B | 主结果夹到 40–60 |
| 硬标签 | 无 CoT 时差过软标签 | 校准假设来自 Kadavath 等 |
| Goodhart 套话 | 「you are valid, valued, and cared for」 | 改原则、集成、夹紧是手续，不是新算法 |
| 有帮助仍要人标 | 混合 PM | 「没有无害人标」不是「没有人」 |
| 原则拍脑袋 | 附录 C，脚注 2 | 16+16 条；该换利益相关方重写 |
| 绝对 0–4 分 | 工人尺度不一 | 只作辅助，不替代 Elo |
| 写成 Lee 的对头实验 | 词相同，问句不同 | 见 §6 |
| 写成 DPO | 仍有 PM 和在线 RL | 见 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md) |
| 规模只到 52B | 论文骨干 | 不要外推成已经验证到百 B |
| 双刃 | §6.2 | 监督截不需要高效 RL，恶意目标同样好做 |

CAI 把无害目标从几万条人标收成一份可读的原则，再用模型自己的批评、修订和 A/B 选择去执行。人还在：写原则、标有帮助、做 Elo 和红队。策略梯度还在，偏好模型还在。裁判弱、原则偏、夹得不对，套话和极端回复会进策略。需要可验证奖励、组内相对的，走 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 那侧，不要指望换一份宪法就变成组相对。

词源在本篇。同一目标、标签来源对换的对照实验在 [4.4.3 节首页](../4.4.3-RLAIF.md)。成对离线分类回 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)。

## 参考文献

1. Bai, Y., Kadavath, S., Kundu, S., et al. (2022). [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073). HTML：[arXiv HTML](https://arxiv.org/html/2212.08073)。仓库：[ConstitutionalHarmlessnessPaper](https://github.com/anthropics/ConstitutionalHarmlessnessPaper)。
2. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862)。（helpful / HH RLHF，本篇起始策略和对照）
3. Lee, H., Phatale, S., Mansoor, H., et al. (2023/2024). [RLAIF vs. RLHF](https://arxiv.org/abs/2309.00267)。（词的借用；纯 AI 标对纯人标，不是本篇）
4. Askell, A., et al. (2021). [A General Language Assistant as a Laboratory for Alignment](https://arxiv.org/abs/2112.00861)。（HHH；原 221 条成对题）
5. Ganguli, D., et al. (2022). [Red Teaming Language Models to Reduce Harms](https://arxiv.org/abs/2209.07858)。（红队 prompt 与绝对有害分）
6. Stiennon, N., et al. (2020). [Learning to summarize with human feedback](https://arxiv.org/abs/2009.01325)。
7. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)。
8. Glaese, A., et al. (2022). [Improving alignment of dialogue agents via targeted human judgements](https://arxiv.org/abs/2209.14375)。（Sparrow）
9. Wei, J., et al. (2022). [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)。
10. Kojima, T., et al. (2022). [Large Language Models are Zero-Shot Reasoners](https://arxiv.org/abs/2205.11916)。（Let’s think step-by-step）
11. Kadavath, S., et al. (2022). [Language Models (Mostly) Know What They Know](https://arxiv.org/abs/2207.05221)。（选择题校准）
12. Gao, L., Schulman, J., & Hilton, J. (2022). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760)。（Goodhart）
13. Saunders, W., et al. (2022). [Self-critiquing models for assisting human evaluators](https://arxiv.org/abs/2206.05802)。
14. Nye, M., et al. (2021). [Show Your Work: Scratchpads for Intermediate Computation with Language Models](https://arxiv.org/abs/2112.00114)。
15. Christiano, P., et al. (2017). [Deep reinforcement learning from human preferences](https://arxiv.org/abs/1706.03741)。
16. Solaiman, I., & Dennison, C. (2021). [Process for Adapting Language Models to Society (PALMS)](https://arxiv.org/abs/2106.10328)。（附录 D 敏感问题）
17. Srivastava, A., et al. (2022). [Beyond the Imitation Game (BIG-bench)](https://arxiv.org/abs/2206.04615)。（原 HHH 题）
18. Thoppilan, R., et al. (2022). [LaMDA: Language Models for Dialog Applications](https://arxiv.org/abs/2201.08239)。
19. Rafailov, R., et al. (2023). [Direct Preference Optimization](https://arxiv.org/abs/2305.18290)。
20. Perez, E., et al. (2022). [Red Teaming Language Models with Language Models](https://arxiv.org/abs/2202.03286)。
