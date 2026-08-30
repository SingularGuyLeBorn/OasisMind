---
title: "02 · Self-Rewarding 家族：信号从哪来、如何过滤、奖励如何塌缩"
date: 2026-08-30
as_of: 2026-08-30
category: 论文精读
published: true
excerpt: >-
  Self-Rewarding LM、Self-Instruct、STaR 横向：信号来源、过滤、奖励塌缩、冻结裁判。
  每篇一段机制 + 一条数字。SPIN 只链专文。
tags:
  - RSI
  - Self-Rewarding
  - Self-Instruct
  - STaR
  - 自监督
  - 奖励塌缩
---

# 02 Self-Rewarding 家族：没有外部奖励时，反馈从哪来

RLHF 把「谁来给奖励」交给人类偏好和冻结奖励模型。这一族把同一件事自动化：模型自己造数据、自己过滤、自己打分，再拿这些信号更新自己。卡住的瓶颈不是「能不能 SFT」，而是**信号一旦由本人发行，裁判会跟着运动员漂移**。

本篇横向写三条奠基线：Self-Instruct（造指令）、STaR（用对错滤思维链）、Self-Rewarding LM（LLM-as-a-Judge + 迭代 DPO）。SPIN 的分布匹配见 [SPIN 专文](../01-SPIN-自对弈微调/01-SPIN-自对弈微调.md)，这里不重写。**不是** OPD，**不是** RSI 本身：改的是 Model 层权重，靶要么是合成数据质量启发式，要么是自打分，要么是可验证对错，都没有「改进改进器」。

## 1. 一张表：信号、过滤、塌缩点

| 方法 | 信号从哪来 | 如何过滤 | 更新 | 特征失败 |
|------|------------|----------|------|----------|
| Self-Instruct | 模型自己写指令 + 输入 + 输出 | ROUGE-L &lt; 0.7；关键词 / 长度启发式；去重 | 对原模型 SFT | 输出正确率低，噪声被写进权重 |
| STaR | 思维链；对了才留 | 最终答案等于数据集标签；错了则给金答案做 rationalization | 每轮从基座再微调 | 没有标签的任务无法滤；rationalization 可能事后编理由 |
| Self-Rewarding LM | 同一模型 LLM-as-a-Judge 打 1–5 分 | $N$ 个候选里最高 vs 最低，同分丢掉 | 迭代 DPO | 裁判与运动员共进化 → 分通胀、变长、自评漂移 |
| SPIN（链专文） | 人类 $y$ vs 上一轮 $y'$ | 不显式过滤；靶是 $p_{\mathrm{data}}$ | 式 (7) 类 DPO | 天花板 = 人类数据 |

共同结构：生成 → 筛选 → 写入训练集 → 更新 → 用新模型再生成。差别全在「筛选用的是不是独立于当前权重的证据」。

![四条泳道：Self-Instruct / STaR / Self-Rewarding / SPIN](./images/fig-self-rewarding-family.png)

> 图 1：四条泳道。自上而下 Self-Instruct / STaR / Self-Rewarding / SPIN。最右一列是写入训练的东西。（自绘）

**图 1 解析**

- **Self-Instruct**：种子任务 few-shot 催生新指令，ROUGE-L 控多样性，再 SFT。没有正确答案门。
- **STaR**：先采样 rationale；对了留下；错了把金答案当 hint 再写 rationale（rationalization），微调时**不把 hint 写进 prompt**，假装自己想出来的。
- **Self-Rewarding**：同一 $M_t$ 既采样 $N$ 个回答，又当法官打分，抽最好 / 最差做 DPO 得到 $M_{t+1}$。
- **SPIN**：没有法官头。人类数据当赢家。详细公式不在本图展开。

## 2. Self-Instruct：用自己当注释员

Wang et al., ACL 2023, arXiv:2212.10560。问题：指令微调依赖人类写任务，人类任务又偏向常见 NLP 分类，覆盖窄、贵。方法是半自动自举。

机制分四步。

1. **指令生成**。任务池从 **175** 条人工种子出发（每任务 1 指令 1 实例）。每步抽 8 条 in-context（6 条人类 + 2 条已生成）催生新指令。
2. **是否分类**。另一次 few-shot 判定，因为分类 / 非分类走不同的实例生成顺序。
3. **实例生成**。非分类用 input-first（先输入后输出）；分类用 output-first（先枚举标签再条件生成输入），减轻「语法改错任务几乎全生成正确句子」这种标签偏斜。
4. **过滤**。新指令与池中任一条的 ROUGE-L 相似度须 **&lt; 0.7** 才入库；丢掉含 image / picture / graph 等 LM 处理不了的词；去掉完全重复或同输入不同输出的实例。

然后把「指令 + 输入」当 prompt，监督生成输出，模板随机化以抗格式过拟合。作者对 GPT-3 davinci 跑完后得到 **52,445** 条指令、**82,439** 条实例（Table 1）；分类指令 11,584，非分类 40,861；约 35,878 条实例输入为空。人工抽查 200 条（Table 2）：指令本身合法 **92%**，输入合适 **79%**，输出正确可接受 **58%**，三字段全对 **54%**。多样性：26,559 / 52,445 条能抽出动词–名词结构，高频结构只占全集 14%。

数字（Table 3，SuperNI 未见任务，ROUGE-L）：vanilla GPT-3 **6.8** → GPT3$_{\mathrm{Self-Inst}}$ **39.9**（+33.1），接近 InstructGPT$_{001}$ 的 **40.8**。与 SuperNI 训练集叠用可到 **51.6**。用户向 252 条新指令的人工评测：把 Rating-B 也算可接受时，Self-Instruct 相对 InstructGPT$_{001}$ 只差约 **5%**。数据规模过 16K 指令后增益接近平台；用 InstructGPT$_{003}$ 重写输出再 SFT，相对原合成数据再高约 **10%**（Figure 7）——噪声是真的，蒸馏能补，但那已经借助更强外部模型。

过滤解决的是多样性与格式，不解决正确性。作者自己写：即使实例有错，多数仍「格式对或部分对」，对学「如何跟着指令走」仍有用。这是家族里最早的塌缩雏形——监督信号的精度可以低于任务精度，模型照样能在指令格式上起飞，并在 SuperNI 这种「定义很像训练任务」的基准上接近 InstructGPT$_{001}$。换到 252 条用户向新指令，差距才以人类四级量表显出来。

Self-Instruct **不是** RSI：它造了一份静态合成集，再 SFT 一次（论文主实验不是把改进器换成新模型再去改生成流程）。它证明无人类标注自举可行，是后面所有 self-training 的数据层起点。Self-Rewarding 主实验里生成新 prompt 的模块，明确复用了这条 pipeline。

把 52k 指令听成「已经递归」，漏了两件事。第一，过滤是 ROUGE 和关键词，不是任务对错。第二，输出抽查正确率只有 58%，三字段全对 54%——噪声被写进权重是设计，不是事故。作者认为多数错例仍「格式对或部分对」，够学「怎么跟着指令走」；换到 252 条用户向新指令，和 InstructGPT 的差距才用人类四级量表显出来。覆盖面可以很宽，精度可以很差，这是这一族后面所有「自己当注释员」方法的底色。

## 3. STaR：用对错滤思维链，错了就倒着编

Zelikman et al., arXiv:2203.14465。问题：思维链能抬推理，但要么标注海量 rationale，要么只靠 few-shot、精度不够。STaR 用少量带 rationale 的提示 + 大量只有答案的题，自举出越来越难的推理。

外环（Algorithm 1）在预训练模型 $M$ 上重复：

1. 对每题 $x_i$ 采样 $(\hat r_i,\hat y_i)$。
2. **过滤**：只保留 $\hat y_i=y_i$ 的 rationale。
3. **Rationalization**（蓝字部分）：对答错的题，把正确答案当 hint 再生成 rationale；保留倒推后答案也对的那些。写入训练集时**去掉 hint**。
4. **从原始 $M$ 重新微调**（避免连续训过拟合），得到 $M_n$。

没有 rationalization 时，模型永远得不到答错题的梯度，外环会在「训练集会的题」上停住。Rationalization 把难题塞进数据集，代价是 rationale 可能是事后合理化，不是可迁移的推理。

数字以论文 Table 1 / 2 为准。基座 **GPT-J 6B**。

**CommonsenseQA dev**（Table 1）：

| 设定 | CQA Acc. (%) | 用到的训练数据 (%) |
|------|-------------:|-------------------:|
| GPT-3 Direct Finetuned | 73.0 | 100 |
| Few-shot Direct GPT-J | 20.9 | ~0 |
| Few-shot CoT GPT-J | 36.6 | ~0 |
| GPT-J Direct Finetuned | 60.0 | 100 |
| STaR without rationalization | 68.8 | 69.7 |
| STaR with rationalization | 72.5 | 86.7 |

相对 few-shot CoT +35.9 分、相对直接微调 GPT-J +12.5 分；带 rationalization 的 72.5 接近 30× 大的 GPT-3 直接微调 73.0。最终模型在 rationale 生成阶段用了训练集的 78.2%，rationalization 再贡献 8.5%。

**GSM8K**（Table 2）：Few-shot CoT GPT-J 3.1 → Direct FT 5.8 → STaR w/o rat. **10.1**（用 25.0% 数据）→ STaR w/ rat. **10.7**（28.7%）。这里 rationalization 几乎没帮上忙。算术：16 轮后总体 **89.5%**，对照「1 万条无 scratchpad 训 5000 step」基线 76.3%；2 位数 few-shot 不到 1%，rationalization 一轮可到 32%。

失败案例（论文 §4.4）多数是标准谬误：说了与题相关的话却不是论证；声称「题目蕴含答案」而不解释；早期训练会把共项说成某个具体国王的城堡。Rationalization 把金答案塞进 prompt，模型更容易写出通向该选项的故事，微调时再假装没有 hint——这是有用的数据扩增，也是「事后编理由」的入口。没有程序化验证器时，不要把 STaR 的过滤想象成 Self-Rewarding 那种 5 分量表。

STaR **不是** RSI：过滤锚在数据集标签上，改进器仍是「生成–对错过滤–微调」。没有标签的开放生成，这条路走不通。它是「可验证任务上的自举」，和 Self-Rewarding 的开放打分正好互补。GPT-J 在 GSM8K 上即使 STaR 也只有约 10%，说明自举高度依赖基座 already 会的推理；换更大基座不在这篇的表里，**未找到**作者用 70B 复现 STaR 的一手数字。

外环每次从原始 $M$ 再微调，而不是接着 $M_{n-1}$ 往下训，是为了降低过拟合。代价是每轮都要重跑一遍 SFT，算力上不像 Self-Rewarding 那样只做 DPO 增量。Rationalization 写入时去掉 hint，训练分布里看不到「答案已经告诉你了」——这让模型在测试时不必依赖 hint，也让「事后编理由」更难被训练损失抓住。有程序化验证器的任务（代码、定理）不必走这条倒填，直接用执行结果滤；STaR 面对的是只有最终选项的常识题，才需要这套蓝字手续。

## 4. Self-Rewarding Language Models：裁判不再冻结

Yuan et al. (Meta / NYU), arXiv:2401.10020。问题：RLHF / DPO 被人类偏好规模和**冻结**奖励模型卡住；要超人反馈，奖励模型自己得能在训练中变好。做法：同一个 LLM 既指令遵循，又用 LLM-as-a-Judge prompt 给自己的候选打分。

种子：Llama 2 70B。IFT = Open Assistant 最高人类秩的英文首轮 **3200** 条。EFT = 把 OA 的排序回答填进 5 分加性量表（相关 / 覆盖 / 有用 / 清晰 / 专业），用 SFT 基线生成 justification + 分数，仅当分数排序与人类排序一致才收入，再按分数重采样，得到 **1630** 训 / **541** 评。EFT 不是「再做一次指令微调」，是专门教模型**按这张量表打分**；没有它，后面 AIFT 几乎凑不出可训练的 DPO 对。

模型序列：

- $M_0$ 预训练；$M_1$ = IFT+EFT 的 SFT。
- $M_2$ = 在 AIFT($M_1$) 上 DPO；$M_3$ = 在 AIFT($M_2$) 上 DPO。

Self-instruction 一步：新 prompt 由**固定**的 Llama 2-Chat 70B 按 Self-Instruct 8-shot 生成（主实验不让 $M_t$ 自己写 prompt；附录 A.5 才试）。$M_t$ 对每个 prompt 采 $N=4$ 个回答（$T=0.7$），再用同一 $M_t$ 打分 3 次取平均（0–5）。最高分 vs 最低分成对，同分丢弃。AIFT($M_1$) = **3,964** 对，AIFT($M_2$) = **6,942** 对。DPO $\beta=0.1$。

**AlpacaEval 2.0**（Table 1，对 GPT-4 Turbo 胜率）：$M_1$ **9.94%** → $M_2$ **15.38%** → $M_3$ **20.44%**。$M_3$ 超过表中 Claude 2（17.19%）、Gemini Pro（16.85%）、GPT-4 0613（15.76%）。作者强调对照模型多用专有对齐数据或更强模型蒸馏，本方法从 OA 种子自举。

**MT-Bench**（Table 2）：SFT 6.85，$M_1$ 6.78，$M_2$ 7.01，$M_3$ **7.25**。Math/Code/Reasoning 从 3.93 只到 4.17，人文类从 8.60 到 9.10——种子偏非推理。

**奖励模型能力**（Table 4，与 OA 人类排序的 pairwise acc.）：SFT 仅 IFT **65.1%** → $M_1$ IFT+EFT **78.7%** → $M_2$ **80.4%** → $M_3$ **81.7%**。Spearman 0.253 → 0.349。EFT 把 pairwise 从 65.1 拉到 78.7，说明「会打分」不是指令遵循的免费附带品。换 Li et al. 2024 的五档选择题 prompt，同一 IFT 模型 pairwise 只有 **26.6%**（Appendix Table 5）——法官 prompt 本身是一阶效应。

Head-to-head（GPT-4 评 256 条）：$M_2$ vs $M_1$ 为 55.5% vs 11.7%；$M_3$ vs SFT 为 62.5% vs 9.8%。人类作者盲评 50 条与自动评同向。终评仍是 GPT-4 或作者本人，不是 $M_t$ 自己——术语篇式 (3) 在这篇里部分成立：训练信号自指，汇报数字不自指。不要把 AlpacaEval 胜率当成「裁判已经可靠」。

**长度**：AlpacaEval 上 $M_1$ 均长 1092，$M_2$ 1552，$M_3$ **2552**。作者承认长度与「看起来更好」相关，这是奖励 hacking 的嫌疑通道。NLP 基准大致持平或略降（Table 3：ARC-Challenge Llama 2 **57.40 → $M_3$ 53.13**），他们称为 alignment tax。只训 IFT、没有 EFT 时，合法 DPO 对极少（541 / 429），后期差距被拉开（Appendix Figure 8）。没有 EFT 的对照说明：会打分不是指令微调的免费附带品，人类排序锚必须先灌进去一次。

加性 5 分量表（论文 Figure 2）把「相关 / 覆盖 / 有用 / 像助手 / 专家级」叠成累计分，而不是五档多选。第一档相关、第二档覆盖是「有没有答到题」；后两档是腔调、篇幅、组织。作者认为分解成可加的子标准，比 Li et al. 的质量桶更容易让模型逐步给分。这解释了 Table 5 的 65.1% vs 26.6%，也解释了塌缩形态：模型可以学会把后两档刷满，前两档仍然含糊。数学与逻辑类在 AlpacaEval 细分类上几乎不涨，作者写：当前训练主要让模型更好地动用已有知识，而不是获得新的推理程序。$N=4$ 候选里只拿最高对最低，中间两条扔掉——同分也扔掉——等于用极端差当偏好，方差大，也更容易把「更长」学成「更好」。

论文 Limitations：只跑了三轮一个设定；长度与 GPT-4 评委可能共谋；安全评估未做。这些不是脚注，是家族的结构风险入口。冻结裁判（§5）是对着这三条写的，不是额外加戏。

## 5. 奖励塌缩如何发生，冻结裁判如何挡

塌缩的机制不是「分数变高」本身，而是**验收证据被更新改写**。

- Self-Rewarding：运动员与裁判共享权重。指令遵循变强时，法官头也变强（Table 4 在涨），这是论文想要的 virtuous circle；同一通道也能学会「写更长、更像 AI 助手腔、更迎合 5 分量表」。$M_3$ 变长三倍，是可观测的共谋迹象，不是证明。
- Self-Instruct：没有法官，塌缩表现为**噪声固化**——58% 正确的输出被当监督。过滤是启发式不是对错。
- STaR：有数据集标签，塌缩被挡住一块；rationalization 仍可能写入「看起来像推理、其实是倒填」的链。
- SPIN：靶钉在 $p_{\mathrm{data}}$，塌缩方向是逼近数据偏差，不是分数通胀。见 SPIN 专文 §6。

缓解，对应到独立监督专文的语言：

1. **锚定真实分布或可验证对错**（SPIN 的 $p_{\mathrm{data}}$，STaR 的标签，代码 / 数学的执行器）。
2. **保留更新边界之外的验收**：开放任务必须留人审或冻结评委；AlpacaEval 用 GPT-4 当终评，已经不是完全自指，但仍是另一个 LM。
3. **冻结黄金裁判做校准**：Self-Rewarding 论文自己对比了「固定外部奖励」的 Iterative DPO（Xu et al. 2023）。冻结裁判会牺牲「奖励模型一起变好」，换来不跟运动员漂移。EFT 种子就是一次性注入的人类排序锚；后续 AIFT 不再加 EFT，法官能力仍涨，作者假设来自通用指令变强——这假设需要独立评委才能证伪。
4. **不要让生成用过的证据再当最终验收**。混元综述称之为 development evidence：指导过提议或内部选择的分数，不应再当唯一门禁。

Tufa Labs 把自裁判冻死再 GRPO，见 [03 Tufa](../03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md)：Countdown 三个提示会被黑，积分自环 43% 超过 GPT-4o 的 42%，裁判权重不进 $S'$。一手是 arXiv:2505.08827，不要和本篇的迭代 DPO 收成同一套更新规则。

## 6. 与 RSI 的关系

这些都是 **Model 层、训练式、自监督（或弱监督）** 的自我进化，是 RSI 叙事里最朴素的形态：改权重，目标由自己或固定数据定。RSI 的进阶是把「设定目标 / 选择研究方向」（混元 L4）也交出去——那时奖励塌缩从「分通胀」变成「准则漂移」，必须配合 [独立监督](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

不要把本家族任何一篇标成 RSI。Self-Rewarding 的迭代让奖励模型不再冻结，**最像**「改进器在变」，但改进器仍是同一套 LLM-as-a-Judge + DPO，没有改提议程序，也没有改「什么叫 5 分」的人类量表（EFT 种子固定）。那是 L1 加重的自训练，不是 L3。

主实验里新 prompt **不由** $M_t$ 写，而由固定的 Llama 2-Chat 70B 按 Self-Instruct 8-shot 生成。这是常被漏掉的墙：指令分布冻在一只聊天模型上，变的是「怎么答、怎么打分」。附录 A.5 才试过让 $M_t$ 自己写 prompt。读论文时若把 AIFT 听成「模型自己决定练什么题」，口径偏了。

同层对照再钉一次。SEAL 的 $r$ 来自带标签 $\tau$ 上适应后变没变好，裁判不在权重里；Self-Rewarding 的 $r$ 就是同一 $\theta$ 打的 1–5 分，裁判在权重里。SPIN 的赢家钉死在人类 $y$，没有分数。STaR 的门是数据集标签。四条路的「谁来验收」不一样，塌缩形态才不一样。

对有大模型基础的读者，读完应能回答四句。信号从哪来？自己造、自己滤、自己打，或人类 $y$。过滤独立于当前权重吗？STaR / SPIN 相对独立，Self-Rewarding 不独立。奖励会不会通胀？Self-Rewarding 的长度从 1092 到 2552 是可观测通道。是不是 RSI？不是，Judge prompt 和 5 分量表都没进 $S'$ 去改。

**读**：$N=4$、3964 / 6942 对、AlpacaEval 9.94→20.44、EFT 1630 条锚、prompt 由冻结 Chat 生成。  
**不读**：把 20.44% 听成已经超人、把「裁判一起变好」听成改了考纲、把 Self-Instruct 的 52k 指令听成递归改进器。AlpacaEval 2.0 的对手是 GPT-4 Turbo，胜率口径随评委版本会漂；本篇数字钉死在论文 Table 1 那一列，不跟后来排行榜混比。MT-Bench 的 Math/Code/Reasoning 几乎不动（3.93→4.17），和 AlpacaEval 总分上涨要分开读：开放聊天可以靠篇幅和腔调涨胜率，推理格不跟涨。种子 IFT 来自 Open Assistant 的闲聊向首轮，本就不是 GSM8K 那种可验证集；别指望同一套自打分把数学变强。若任务有程序化验证器，应走 STaR / RLVR 那一支，不要把 1–5 分量表硬套上去。可验证奖励那一支见 [04 模仿学习与 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)，本篇不重推。模仿与可验证奖励的对照只在坐标系里点名，公式不在本家族展开。

同层还有 [SEAL](../04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md)：不靠自打分，靠「适应之后在带标签 $\tau$ 上变没变好」来筛自己写的微调数据。坐标系回 [01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。下一篇同层可继续 [Tufa Labs](../03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md)。

## 本篇来源

1. Yuan, W., Pang, R. Y., Cho, K., Li, X., Sukhbaatar, S., Xu, J., & Weston, J. (2024). [Self-Rewarding Language Models](https://arxiv.org/abs/2401.10020). arXiv:2401.10020. Table 1 / 2 / 4 与 $N=4$、3964 / 6942 对以 HTML 为准。
2. Wang, Y., et al. (2023). [Self-Instruct: Aligning Language Models with Self-Generated Instructions](https://arxiv.org/abs/2212.10560). ACL 2023. 175 种子、52k 指令、Table 3 的 +33.1 ROUGE-L。
3. Zelikman, E., Wu, Y., Mu, J., & Goodman, N. (2022). [STaR: Bootstrapping Reasoning With Reasoning](https://arxiv.org/abs/2203.14465). Table 1 CQA 72.5 vs 73.0；Table 2 GSM8K 10.7。
4. Chen et al. (2024). SPIN. arXiv:2401.01335。机制见 [SPIN 专文](../01-SPIN-自对弈微调/01-SPIN-自对弈微调.md)。
5. Zweiger et al. (2025). [SEAL](https://arxiv.org/abs/2506.10943). 测试时写微调数据；筛选用带标签 $\tau$，裁判不在权重里。
