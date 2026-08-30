---
title: "07 · Self-Rewarding：自奖励"
date: 2026-08-31
as_of: 2026-08-31
tags: [Self-Rewarding, Iterative DPO, LLM-as-a-Judge, Llama 2, AlpacaEval]
math: true
---

# 07 Self-Rewarding：自奖励

Self-Rewarding 把奖励模型收进正在训的那份 LLM。同一组权重既按 prompt 写回答，又用 LLM-as-a-Judge 提示给这些回答打 $0$ 到 $5$ 分，再拿最高分对最低分做成偏好对，走 Iterative DPO。卡住的是两条瓶颈叠在一起：人标偏好的上限就是人，冻死的独立 RM 在策略继续涨的时候不会跟着涨。

本篇跟 Yuan、Pang、Cho 等 *Self-Rewarding Language Models*（[arXiv:2401.10020](https://arxiv.org/abs/2401.10020)，ICML 2024，PMLR 235:57905–57923）。公式和表以 [arXiv HTML](https://arxiv.org/html/2401.10020) 为准。骨干是 Llama 2 70B，从 Open Assistant 种子出发走三轮。隐式奖励怎么从 KL 约束目标反解，见 [01-DPO](../01-DPO/01-DPO.md)。**不是** [06-OAIF](../06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md)：OAIF 的标注器可以是另一份、更大的 LLM。**不是** [05-SPIN](../05-SPIN-自对弈微调/05-SPIN-自对弈微调.md)：SPIN 的 winner 永远是 SFT 人标，loser 是上一迭代自生成。**不是** Lee 等 RLAIF（[arXiv:2309.00267](https://arxiv.org/abs/2309.00267)）：那篇附录 E 是带价值基线的 REINFORCE，正本在 [4.4.3](../../4.4.3-RLAIF/4.4.3-RLAIF.md)。**不是** 独立冻结奖励模型那条 RLHF。

## 1. 冻死的 RM 不会在策略涨的时候一起涨

标准 RLHF 先在人标偏好上拟合 $r_\phi$，再把这份奖励冻住，交给 PPO。人标有多大、多干净，RM 就有多高。策略后面再怎么采样，打分器还是那份旧网络。DPO 把独立 RM 拿掉了，直接在人标对上做分类，人标本身仍是天花板。论文开篇把这两件事写成同一句话：未来要超人类的 agent，训练信号也得能超过人；冻住的 RM 给不了这条通道。

Self-Rewarding 的判断是：不要把「写回答」和「打分」拆成两个模型。预训练和多任务指令微调本来就在同一套权重上做任务迁移。把打分也写成一条指令跟随任务，打分能力和写回答能力就能在同一次迭代里互相抬。Xu 等的 Iterative DPO 已经用过「每轮采新对、再 DPO」这副架子，但打分器是外面冻死的 RM。这里换成模型自己当裁判。

种子只需要一小份人写的指令跟随，外加一份「如何按五分制打分」的示范。后面的偏好对由模型自己造。新 prompt 不必再配人写的标准答案。这一点和 SPIN 正好反过来：SPIN 每条 prompt 都得有人标 $y$。

## 2. 同一份 $M_t$ 先写、再打分，再 DPO

先假定有一份预训练底座，加上少量人标种子。模型要同时会两件事：按用户请求写出有帮助、无害的回答；给自己新造的指令跟随样本打分，并把打过分的样本加回训练集。后者整段叫做 Self-Instruction creation。

### 2.1 两份种子：IFT 与 EFT

IFT（Instruction Fine-Tuning）是人写的 $(\text{prompt}, \text{response})$。实验从 Open Assistant 抽英文第一轮、人工秩为 $0$ 的高质样本，$3200$ 条。只在这份数据上做 SFT 的模型，后文叫 SFT baseline。

EFT（Evaluation Fine-Tuning）把打分写成指令跟随。输入是论文 Figure 2 那张 additive 五分提示，五点是往上加，不是五档多选。相关且带一点信息，加 $1$；覆盖了问题的一大部分但仍没答完，再加 $1$；把基本要素答得有用，加到 $3$；以助手口吻直接、完整、有条理，加到 $4$；量身、无废话、看得出专家知识，才给 $5$。输出先写不超过 $100$ 词的理由，再以 `Score: ` 收束，分数 $r\in[0,5]$。Open Assistant 同一 prompt 下有多人排序的回答，但没有现成的思维链和五分数字。做法是：用 SFT baseline 给每条候选生成评语和分数，只有排序与人的秩一致才收进训练集；分数 $4$ 太多，再重采样压偏。最后 $1630$ 条训练、$541$ 条评价，与 IFT 不重叠。提示里写了「必要时用网页搜索」，脚注写明模型并没有搜索动作，那只是提示措辞。

EFT 不是理论上必须。只用 IFT，模型也能被问「给回答打分」。附录 A.3 证明缺了 EFT，格式经常对不上，分数还会挤到 $4$ 附近，后面能收成的偏好对会少一个数量级。主实验仍把 IFT+EFT 捆在一起做 $M_1$。

### 2.2 自己造偏好对

有了 $M_t$，下一轮训练集按三步造。

1. 造新 prompt $x_i$。主实验里这一步钉死为 Llama 2-Chat 70B，8-shot，跟 Self-Instruct：六个示范抽 IFT，两个抽模型已生成的指令，$T=0.6$，$p=0.9$，再加 ROUGE-L、关键词和长度过滤。附录 A.5 查过 $M_1$、$M_2$、$M_3$ 自己做 in-context 造指令：三十条都能写出新指令；$M_2$、$M_3$ 有时会先写几条指令、再画分隔符、然后开始回答，需要后处理。主结果没有把造 prompt 并进正在训的那份权重。
2. 对 $x_i$ 从 $M_t$ 采 $N=4$ 条候选 $\{y_i^1,\ldots,y_i^N\}$，$T=0.7$，$p=0.9$。
3. 同一份 $M_t$ 用 Figure 2 的提示给每条候选打 $r_i^n\in[0,5]$。分数有方差，同样解码参数下打 $3$ 次取平均。

偏好对写成 $(x_i, y_i^w, y_i^l)$。$y^w$ 取 $N$ 条里平均分最高的，$y^l$ 取最低的。两头分数相同就丢掉。这是 Xu 等 Iterative DPO 的选对规则，只是打分器换成自己。得到的数据叫 AIFT（AI Feedback Training）。$M_2$ 吃 AIFT$(M_1)$，共 $3964$ 对；$M_3$ 吃 AIFT$(M_2)$，共 $6942$ 对。

用一组假分数把选对规则走通。四条平均分是 $4.3$、$2.1$、$4.3$、$1.0$。最高 $4.3$、最低 $1.0$，这对能留。四条都是 $4.0$，丢掉。数字是规则的算术，不是论文表。

### 2.3 套 DPO，不换损失

种子阶段对 IFT+EFT 做 SFT。之后每一轮在 AIFT 上做 DPO。印刷体仍是 Rafailov 那条，实验 $\beta=0.1$：

$$
-\log\sigma\Biggl(\beta\log\frac{\pi_{\theta}(y^{w}\mid x)\,\pi_{\mathrm{ref}}(y^{l}\mid x)}{\pi_{\mathrm{ref}}(y^{w}\mid x)\,\pi_{\theta}(y^{l}\mid x)}\Biggr).
\tag{1}
$$

隐式奖励 $r=\beta\log(\pi/\pi_{\mathrm{ref}})+\beta\log Z(x)$，$Z(x)$ 在成对差里消掉，见 [01-DPO](../01-DPO/01-DPO.md) 式 (5)(6)。本篇不重推。论文写下一轮「从 $M_t$ 初始化，再用 AIFT$(M_t)$ 做 DPO」。这是 Iterative DPO 的架子，不是新目标。

用一组假对数概率把式 (1) 走通。设 $\beta=0.1$，$y^{w}$ 上 $\log\pi_{\theta}=-8$、$\log\pi_{\mathrm{ref}}=-10$，$y^{l}$ 上 $\log\pi_{\theta}=-11$、$\log\pi_{\mathrm{ref}}=-9$。成对差是 $0.1\bigl((-8-(-10))-(-11-(-9))\bigr)=0.40$。$\sigma(0.40)\approx 0.60$，损失 $-\log 0.60\approx 0.51$。排对了，这条还在学，但不会很重。若最高最低拿反，差变成 $-0.40$，损失约 $0.90$，梯度更重。数字是式 (1) 的算术，不是论文表。实现上仍是序列逐步 $\log\pi(y_t\mid x,y_{<t})$ 相加，prompt token mask 掉，和离线 DPO trainer 那套手续相同，换的是 $y^{w},y^{l}$ 从哪来。

SFT 学习率 $5.5\times 10^{-6}$ 余弦收到 $1.1\times 10^{-6}$，DPO 从 $1\times 10^{-6}$ 收到 $1\times 10^{-7}$，batch $16$，dropout $0.1$，损失只算目标 token。每 $200$ 步存盘，用 Claude 2 在 $253$ 条验证 prompt 上按 AlpacaEval 提示做成对早停。

模型序列按 HTML §2.4 抄：

- $M_0$：预训练 Llama 2 70B，未微调。
- $M_1$：从 $M_0$ 起，IFT+EFT 上 SFT。
- $M_2$：从 $M_1$ 起，AIFT$(M_1)$ 上 DPO。
- $M_3$：从 $M_2$ 起，AIFT$(M_2)$ 上 DPO。

主实验停在三轮。没有 PPO，没有独立 RM 头，没有价值函数。

![同一份模型先采样再当裁判，再进 DPO 得到下一轮](./images/fig-srlm-iterative-loop.png)

> 图 1：新 prompt $x_i$ 进当前 $M_t$，采 $N=4$ 条候选，同一组权重按 LLM-as-a-Judge 打 $0$ 到 $5$ 分，最高对最低做成 $(y^w,y^l)$，DPO（$\beta=0.1$）更新到 $M_{t+1}$。

**图 1 解析**

- 从左到右七框，一条单向实线。奶油框是新 prompt，箭头标 $x$ 进薄荷绿的 $M_t$ 生成。
- 生成框写 trainable。冰蓝色框是四条候选，走廊标签 sample。
- 淡紫框仍是 $M_t$，写 same weights，走廊标签 evaluate，再往后是分数 $r\in[0,5]$。
- 下一冰蓝框写 max vs min 的偏好对，橙色框是 DPO，最后奶油框是 $M_{t+1}$。
- 页脚写 same LLM generates and judges. Not a separate RM。没有回头箭。下一轮把 $M_{t+1}$ 当成新的 $M_t$，发生在迭代之间，不在这一张里画环。

## 3. 不是 OAIF，不是 SPIN，不是 RLAIF，不是冻结 RM

[06-OAIF](../06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md) 也是当前策略采回答、LLM 当场标、再套 DAP。差别在标注器是谁。OAIF 默认策略是 PaLM 2-XS，标注器是 PaLM 2-L，可以比策略强；Discussion 写过，有更大更好的标注器时，不必强迫策略给自己打分。Self-Rewarding 钉死同一份 Llama 2 70B：生成和打分共享权重。OAIF 每步采两条；这里 $N=4$，取两端。OAIF 可以换 IPO / SLiC；这里只报 DPO。

[05-SPIN](../05-SPIN-自对弈微调/05-SPIN-自对弈微调.md) 的 logistic 形态像 DPO。winner 永远是 SFT 人标 $y$，loser 永远是上一迭代自生成 $y'$。参考每轮换成 $p_{\theta_t}$。没有新偏好，也不需要 LLM 裁判。人标就是天花板；相关工作里作者点名：一旦生成追上人标就被卡住，而且每条 prompt 都得有人写的回答。Self-Rewarding 的两条候选都来自 $M_t$，胜负由自己的五分裁判判。新 prompt 不必再配人标 $y$。

Lee 等 RLAIF 用现成 LLM 当裁判，先造偏好再拟合独立 RM，附录 E 用带价值基线的 REINFORCE 训策略。Constitutional AI 更早用 LLM 给反馈、再训一份冻住的 RM、再 RL。词都叫 AI feedback，训练环不是同一个。Self-Rewarding 不跑 PPO，也不跑 REINFORCE，中间没有 $r_\phi$。Lee 试过把 LLM-as-a-Judge 直接塞进 PPO，作者自己写计算贵；这里打分发生在离线造 AIFT 的时候，相对便宜。

独立冻结 RM 的 RLHF 更老：人标 → $r_\phi$ → 冻住 → PPO。打分器在策略迭代期间不会变。Self-Rewarding 的贡献之一，就是让「打分」跟着「写回答」一起涨。Table 4 后面会给出这条轴上的数字。

| | 采样 | 标注 | 独立 RM | 优化 |
|--|------|------|---------|------|
| 冻结 RM 的 RLHF | 当前 $\pi$（RL 步） | 人 → 冻住的 $r_\phi$ | 要 | PPO |
| RLAIF（Lee） | 当前 $\pi$ | LLM → RM | 要 | REINFORCE + 价值基线 |
| SPIN | 上一迭代 $y'$ | 无；winner = 人标 | 不要 | logistic 成对差 |
| OAIF | 当前 $\pi$ 两条 | 另一份 LLM 当场 | 不要 | 任意 DAP |
| Self-Rewarding | 当前 $M_t$ 的 $N=4$ | 同一份 $M_t$ 打 $0$–$5$ 分 | 不要 | Iterative DPO |

![三列对照：冻结 RM、OAIF 的外部标注器、Self-Rewarding 自己标自己](./images/fig-srlm-not-oaif-spin.png)

> 图 2：左列人标偏好训出冻结 $r_\phi$，再 PPO；中列当前策略采两条，另一份 LLM 当场标，套 DAP；右列同一份 $M_t$ 采 $N=4$ 并当裁判，再 Iterative DPO。

**图 2 解析**

- 三列都从上往下，竖线分开。左列顶上黄框是人标 $\mathcal{D}$，灰框是冻结 RM，粉框是 PPO，底上薄荷绿是策略。页脚 RM frozen, not self-score。
- 中列薄荷绿是当前 $\pi$ 采 $y_1,y_2$，淡紫框写 other LLM annotator (can be stronger)，再进偏好对和 DAP。页脚 annotator may exceed policy size。
- 右列生成和裁判都写 same $M_t$，偏好对是 max vs min，底上橙色是 Iterative DPO。页脚 generate and judge share weights。
- 列与列之间没有箭头。不要把右列读成「少画了一个奖励头，公式还是 PPO」。SPIN 的人标 winner 不在这张图里，对照见表。

## 4. 实验设定：Llama 2 70B，三轮

底座 Llama 2 70B。IFT $3200$ 条，EFT $1630/541$。造 prompt 用固定的 Llama 2-Chat 70B；写回答和打分用正在训的 Self-Rewarding 模型。

指令跟随评三套尺子。一套是 $256$ 条 IFT 测试 prompt，GPT-4 按 AlpacaEval 提示做头对头，左右换序，两次判决打架算平。作者自己也做了人评。一套是 AlpacaEval 2.0 榜格式：$805$ 条 prompt，对 GPT-4 Turbo 的胜率，裁判仍是 GPT-4。一套是 MT-Bench，GPT-4 打 $0$ 到 $10$ 分。另外九个 NLP 基准：ARC-Easy / ARC-Challenge、HellaSwag、SIQA、PIQA、GSM8K、MMLU、OBQA、NQ。

奖励建模在 EFT 评价集上对人的秩。平均每条指令 $2.85$ 条带秩回答。指标五列：成对准确率、恰好满分 $5$ 的那条是否也是人排第一（5-best）、全序完全一致（exact match）、Spearman、Kendall $\tau$。

## 5. 指令跟随：AlpacaEval 2.0 从 9.94% 到 20.44%

头对头先钉种子。IFT+EFT 对只用 IFT，胜率 $30.5\%$ 对 $30.9\%$，几乎打平。加进打分任务，没有把写回答的能力打坏。于是 $M_1$ 可以同时当生成器和裁判，再开后面两轮。

$M_2$ 对 $M_1$：$55.5\%$ 胜、$11.7\%$ 负。对 SFT baseline：$49.2\%$ 对 $14.5\%$。$M_3$ 对 $M_2$：$47.7\%$ 对 $12.5\%$。对 SFT baseline：$62.5\%$ 对 $9.8\%$，比 $M_2$ 那轮赢得更频繁。AIFT$(M_1)$ 把 $M_1$ 抬到 $M_2$，AIFT$(M_2)$ 再把 $M_2$ 抬到 $M_3$。裁判能力如果冻在 $M_1$，第二跳不会这样走。

AlpacaEval 2.0 对 GPT-4 Turbo 的胜率抄 Table 1，不四舍五入。

| Model | Win Rate | Distilled | Proprietary |
|-------|--------:|:---------:|:-----------:|
| **Self-Rewarding 70B** | | | |
| Iteration 1 ($M_1$) | 9.94% | | |
| Iteration 2 ($M_2$) | 15.38% | | |
| Iteration 3 ($M_3$) | 20.44% | | |
| GPT-4 0314 | 22.07% | | ✓ |
| Mistral Medium | 21.86% | | ✓ |
| Claude 2 | 17.19% | | ✓ |
| Gemini Pro | 16.85% | | ✓ |
| GPT-4 0613 | 15.76% | | ✓ |
| GPT 3.5 Turbo 0613 | 14.13% | | ✓ |
| LLaMA2 Chat 70B | 13.87% | | ✓ |
| Vicuna 33B v1.3 | 12.71% | ✓ | |
| Humpback LLaMa2 70B | 10.12% | | |
| Guanaco 65B | 6.86% | | |
| Davinci001 | 2.76% | | ✓ |
| Alpaca 7B | 2.59% | ✓ | |

$M_3$ 的 $20.44\%$ 高于 Claude 2 的 $17.19\%$、Gemini Pro 的 $16.85\%$、GPT-4 0613 的 $15.76\%$，仍低于 GPT-4 0314 的 $22.07\%$ 和 Mistral Medium 的 $21.86\%$。摘要写 outperform many existing systems，表上没有写成「超过所有 GPT-4」。对照模型要么有专有对齐数据（Llama 2 报告写过超过 $1$M 标注），要么从更强模型蒸馏。这边从 Open Assistant 种子出发，目标和奖励都由自己造。

Figure 4 按类目拆 AlpacaEval。正文结论三句，没有把柱高编成假百分比。多数类目胜率明显涨；数学和逻辑推理涨得少，作者写成当前训练主要是让模型更好地用已有知识。复杂度 $5$、$6$、$7$（十分制）上涨得更明显。按期望回复长度分桶，各桶都在涨。HTML 没有给出每个类目的精确胜率数字，不编。附录 Table 6 只给出测试集构成，例如科学/工程 $134$ 条（$16.65\%$），数学/逻辑 $52$ 条（$6.46\%$），写代码 $44$ 条（$5.47\%$）。Table 7 复杂度众数在 $2$ 和 $3$（合计超过一半），$9$ 分只有 $3$ 条。Table 8 期望回复长度：$1$–$3$ 句 $44.84\%$，$1$ 段 $33.42\%$。构成表不是胜率表，两张不要混。

附录 A.1 用 t-SNE 看 IFT、EFT 和 AIFT$(M_1)$。指令和回答两边，IFT 与 AIFT 叠在一起，EFT 落在另一块嵌入区。这能解释为什么加 EFT 几乎不伤 IFT 头对头：打分示范和写回答示范本来就不在同一片分布里。

长度在涨。AlpacaEval 生成平均长度：$M_1$ 为 $1092$，$M_2$ 为 $1552$，$M_3$ 为 $2552$。Limitation 自己写了长度和估质量的相关，可能掺进相对表现。人评没有被长度故事单独拆开，但长度不是可以假装没看见的量。

人评随机抽 $50$ 条 IFT 测试指令，每条三对（baseline 对 $M_1$、$M_2$、$M_3$），每对三名作者盲评，多数票。Figure 5：越往后的迭代，对 SFT baseline 的头对头优势越大，方向和 GPT-4 裁判一致。HTML 没有把人评胜率写成表内百分比，不编。

MT-Bench 抄 Table 2。总体：$6.85$（SFT）、$6.78$（$M_1$）、$7.01$（$M_2$）、$7.25$（$M_3$）。数学/代码/推理一截：$3.93$、$3.83$、$4.05$、$4.17$。人文/抽取/STEM/角色/写作为一截：$8.60$、$8.55$、$8.79$、$9.10$。种子偏 Open Assistant，推理类目弱，作者把较小的涨幅写在种子构成上。MT-Bench 本身是多轮，训练和造数据都是单轮，涨幅仍在。

附录 Table 10 分项，数字按 HTML 抄。

| | Writing | Roleplay | Reasoning | Math | Coding | Extraction | STEM | Humanities | Overall |
|--|--------:|---------:|----------:|-----:|-------:|-----------:|-----:|-----------:|--------:|
| SFT | 8.83 | 8.15 | 5.30 | 3.00 | 3.50 | 6.90 | 9.18 | 9.95 | 6.85 |
| $M_1$ | 9.10 | 7.65 | 4.35 | 3.05 | 4.10 | 7.20 | 8.93 | 9.85 | 6.78 |
| $M_2$ | 9.10 | 8.00 | 4.60 | 3.30 | 4.25 | 7.65 | 9.40 | 9.80 | 7.01 |
| $M_3$ | 9.58 | 8.73 | 4.80 | 3.50 | 4.20 | 7.80 | 9.45 | 9.95 | 7.25 |

Coding 从 $M_2$ 的 $4.25$ 到 $M_3$ 的 $4.20$，略降。Writing、Roleplay、Extraction、STEM 这一侧更明显。不要把总体 $7.25$ 读成「代码也同步大涨」。

NLP 基准大多维持在 Llama 2 70B 和 SFT 附近，有的会掉。作者写成 alignment tax，并指向 InstructGPT 里 RLHF 之后部分公开集回退的观察。附录 Table 9 全列：

| | ARC-Easy | ARC-Ch | HellaSwag | SIQA | PIQA | GSM8K | MMLU | OBQA | NQ |
|--|--------:|-------:|----------:|-----:|-----:|------:|-----:|-----:|---:|
| Llama 2 | 80.20 | 57.40 | 85.30 | 50.70 | 82.80 | 56.80 | 68.90 | 60.20 | 25.30 |
| SFT | 76.49 | 55.97 | 85.17 | 51.48 | 82.59 | 50.72 | 69.76 | 57.80 | 34.35 |
| $M_1$ | 78.14 | 57.51 | 84.99 | 53.02 | 82.92 | 60.27 | 69.34 | 57.60 | 35.48 |
| $M_2$ | 74.84 | 54.51 | 84.27 | 51.23 | 81.94 | 59.29 | 69.31 | 57.60 | 33.07 |
| $M_3$ | 72.35 | 53.13 | 83.29 | 49.28 | 80.79 | 57.70 | 69.37 | 58.40 | 31.86 |

ARC-Easy 从 $M_1$ 的 $78.14$ 掉到 $M_3$ 的 $72.35$。GSM8K 在 $M_1$ 到过 $60.27$，高于底座 $56.80$，之后回到 $57.70$。MMLU 几乎不动。NQ 从 SFT 的 $34.35$ 到 $M_1$ 的 $35.48$，再掉到 $M_3$ 的 $31.86$。这些任务和 Open Assistant 风格的指令跟随不是同一回事。正文 Table 3 只展示了其中五列，方向与 Table 9 相同。

## 6. 打分能力也在涨：Table 4

IFT 已经覆盖「给回答打分」这种指令，SFT baseline 成对准确率 $65.1\%$。加上 EFT，五列全涨，成对准确率到 $78.7\%$。$M_2$ 用 $M_1$ 当裁判造出的 AIFT 训练，自己当裁判时又高于 $M_1$。$M_3$ 再抬几列。中间没有新的 EFT，AIFT 样本看起来也不像打分示范。作者的假设：一般指令跟随变强，LLM-as-a-Judge 这条指令也跟着强。

| | SFT Baseline | $M_1$ | $M_2$ | $M_3$ |
|--|-------------:|------:|------:|------:|
| Training data | IFT | IFT+EFT | IFT+EFT+AIFT$(M_1)$ | IFT+EFT+AIFT$(M_1)$+AIFT$(M_2)$ |
| Pairwise acc. $\uparrow$ | 65.1% | 78.7% | 80.4% | 81.7% |
| 5-best % $\uparrow$ | 39.6% | 41.5% | 44.3% | 43.2% |
| Exact Match % $\uparrow$ | 10.1% | 13.1% | 14.3% | 14.3% |
| Spearman $\uparrow$ | 0.253 | 0.279 | 0.331 | 0.349 |
| Kendall $\tau$ $\uparrow$ | 0.233 | 0.253 | 0.315 | 0.324 |

5-best 在 $M_3$ 从 $44.3\%$ 回到 $43.2\%$。Exact match 在 $M_2$ 和 $M_3$ 都是 $14.3\%$。成对准确率和两个相关在继续涨。不要写成「五列单调上升」。这张表是「自己标自己」能成立的证据：下一轮的偏好数据，由上一轮更强的裁判提供。

## 7. 提示词、EFT、只加满分正例

同一套 SFT baseline，换打分提示，差距很大。Li 等 Instruction Backtranslation 那张五档多选，成对准确率 $26.6\%$，Spearman $-0.18$。改成 additive 累加，成对准确率 $65.1\%$，Spearman $0.25$。附录 Table 5 其余列：5-best $23.5\%$ 对 $39.6\%$，exact match $1.1\%$ 对 $10.1\%$，Kendall $\tau$ $-0.16$ 对 $0.23$。多选要模型一次跳到档位；累加把相关性、覆盖、有用拆开加分。主实验锁死 Figure 2。

附录 A.3 从只训 IFT 的 $M_1'$ 再走两轮 DPO。分数挤在 $4$，同一批新 prompt 只收出 $541$ 对给 $M_2'$、$429$ 对给 $M_3'$。头对头仍能超过 SFT baseline，但和从 IFT+EFT 出发的 $M_2$、$M_3$ 差距越往后越大。EFT 不是锦上添花，它决定后面 AIFT 能不能收成。

附录 A.4 试过另一条自训：只把打到满分 $5$ 的 $(x,y)$ 加回 SFT，不做成对。加了 $11254$ 条，调过混合权重，对 SFT baseline 仍是 $29\%$ 胜对 $30\%$ 胜，等于没涨。ReST 一类「用固定奖励筛正例再 SFT」在这里没有帮上。偏好对帮上了。正例克隆补不出两端对比。

## 8. 失效与边界

Limitation 写得很直。只跑了三轮、一种设定。迭代次数和不同能力模型上的「标度」没有做。长度在涨，质量估分和长度的相关是已知问题，结果里掺了多少，没有拆干净。训练奖励是 LLM，AlpacaEval / MT-Bench 的裁判也是 GPT-4，即使不是同一份模型，仍需要比论文更深的分析。人评方向一致，样本是 $50$ 条。安全评价和安全训练都没做。作者设想把 LLM-as-a-Judge 改成专门问安全，后面的迭代有可能抓住更早迭代抓不住的安全场景，这是设想，不是表。

结论里的 virtuous circle 也写了饱和：真实场景里打分能力不会无限涨。它打开的是「超过原始人标种子」的可能性，不是一张已经超过人的证明。

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成 OAIF | 标注器是同一份 $M_t$ | OAIF 允许更大的另一份 LLM |
| 写成 SPIN | 两条都来自 $M_t$，胜负由五分裁判 | SPIN 的 winner 钉死人标 |
| 写成 Lee RLAIF | 无 RM、无 REINFORCE | 附录 E 是价值基线 REINFORCE |
| 写成冻结 RM 的 RLHF | 打分器随迭代更新 | Table 4 成对准确率 $65.1\%\to 81.7\%$ |
| 把 20.44% 写成超过 GPT-4 | Table 1 对 GPT-4 Turbo | GPT-4 0314 是 $22.07\%$，0613 是 $15.76\%$ |
| 五列打分指标都单调 | 5-best 在 $M_3$ 为 $43.2\%$ | 低于 $M_2$ 的 $44.3\%$ |
| 只加满分正例也能涨 | $11254$ 条仍 $29\%$ vs $30\%$ | 要对，不要只克隆 $r=5$ |
| 数学代码同步大涨 | Table 2 / Table 10 | Coding $4.25\to 4.20$；推理类目涨幅小 |
| 编类目柱状图百分比 | Figure 4 无表内数字 | 只保留正文三句结论 |
| 人评胜率写成假百分数 | Figure 5 无表 | HTML 只给人评方向 |
| 造 prompt 也是 $M_t$ | 主实验钉 Llama 2-Chat 70B | 附录 A.5 才测自己造指令 |
| NLP 基准一起涨 | Table 9 ARC-Easy $78.14\to 72.35$ | alignment tax，不是加分项 |

Self-Rewarding 不是万能药。它把「写」和「评」捆在同一份 70B 上，用 Iterative DPO 让两条轴一起动，前提是种子里已经有能用的打分示范，并且接受回答变长、推理类目未必同步、公开 NLP 集可能掉。已经有更大更稳的外部标注器，[06-OAIF](../06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md) 不必强迫自己标自己。已经有人标回答、只想把模型从人标里再榨一轮，[05-SPIN](../05-SPIN-自对弈微调/05-SPIN-自对弈微调.md) 更短。人标对已经采好、只想离线分类，[01-DPO](../01-DPO/01-DPO.md) 仍是那条更短的路。AI 标完再拟合 RM、再策略梯度，在 [4.4.3 RLAIF](../../4.4.3-RLAIF/4.4.3-RLAIF.md)。

同夹：[01-DPO](../01-DPO/01-DPO.md)、[05-SPIN](../05-SPIN-自对弈微调/05-SPIN-自对弈微调.md)、[06-OAIF](../06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md)。Iterative DPO 的外部 RM 版本是 Xu 等 Pairwise Cringe；本篇换的是裁判，不是损失家族。

## 参考文献

1. Yuan, W., Pang, R. Y., Cho, K., Li, X., Sukhbaatar, S., Xu, J., & Weston, J. (2024). [Self-Rewarding Language Models](https://arxiv.org/abs/2401.10020). *ICML*，PMLR 235:57905–57923。HTML：[arXiv HTML](https://arxiv.org/html/2401.10020)。
2. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
3. Xu, J., Lee, A., Sukhbaatar, S., & Weston, J. (2023). [Some Things Are More Cringe Than Others: Preference Optimization with the Pairwise Cringe Loss](https://arxiv.org/abs/2312.16682).（Iterative DPO）
4. Zheng, L., Chiang, W.-L., Sheng, Y., et al. (2023). [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685). *NeurIPS Datasets and Benchmarks*.
5. Wang, Y., Kordi, Y., Mishra, S., Liu, A., Smith, N. A., Khashabi, D., & Hajishirzi, H. (2023). [Self-Instruct: Aligning Language Models with Self-Generated Instructions](https://aclanthology.org/2023.acl-long.754/). *ACL*.
6. Li, X., Yu, P., Zhou, C., Schick, T., Zettlemoyer, L., Levy, O., Weston, J., & Lewis, M. (2024). [Self-Alignment with Instruction Backtranslation](https://arxiv.org/abs/2308.06259). *ICLR*.
7. Touvron, H., Martin, L., Stone, K., et al. (2023). [Llama 2: Open Foundation and Fine-Tuned Chat Models](https://arxiv.org/abs/2307.09288).
8. Köpf, A., Kilcher, Y., von Rütte, D., et al. (2023). [OpenAssistant Conversations — Democratizing Large Language Model Alignment](https://arxiv.org/abs/2304.07327).
9. Li, X., Zhang, T., Dubois, Y., et al. (2023). [AlpacaEval: An Automatic Evaluator of Instruction-Following Models](https://github.com/tatsu-lab/alpaca_eval).
10. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML*.
11. Guo, S., Zhang, B., Liu, T., et al. (2024). [Direct Language Model Alignment from Online AI Feedback](https://arxiv.org/abs/2402.04792).
12. Lee, H., Phatale, S., Mansoor, H., et al. (2023). [RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback](https://arxiv.org/abs/2309.00267).
13. Bai, Y., Kadavath, S., Kundu, S., et al. (2022). [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073).
14. Ouyang, L., Wu, J., Jiang, X., et al. (2022). Training language models to follow instructions with human feedback. *NeurIPS*.
15. Gulcehre, C., et al. (2023). [Reinforced Self-Training (ReST) for Language Modeling](https://arxiv.org/abs/2308.08998).
16. Honovich, O., Scialom, T., Levy, O., & Schick, T. (2023). [Unnatural Instructions: Tuning Language Models with (Almost) No Human Labor](https://aclanthology.org/2023.acl-long.806/). *ACL*.
