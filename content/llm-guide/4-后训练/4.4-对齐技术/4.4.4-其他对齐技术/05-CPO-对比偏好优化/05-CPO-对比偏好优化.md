---
title: "05 · CPO：对比偏好优化"
date: 2026-08-31
as_of: 2026-08-31
tags: [CPO, DPO, ALMA, 机器翻译, 对比偏好, 均匀先验]
math: true
---

# 05 CPO：对比偏好优化

CPO（Contrastive Preference Optimization）在已经 SFT 饱和的翻译模型上再走一步偏好学习：抬更高分的译文，压「够用但不完美」的译文。卡住的不是还要不要成对标签。卡住的是交叉熵把上限钉在参考译文上；FLORES-200 这种人工平行句，用无参考质量估计一打分，经常输给 GPT-4 和 ALMA 自己的输出。

本篇跟 Xu、Sharaf、Chen 等 *Contrastive Preference Optimization: Pushing the Boundaries of LLM Performance in Machine Translation*（[arXiv:2401.08417](https://arxiv.org/abs/2401.08417)，ICML 2024）。公式以 [arXiv HTML](https://arxiv.org/html/2401.08417) 为准。主战场是机器翻译，起点是 ALMA-13B-LoRA，产物叫 ALMA-R。只训 LoRA，12M 参数，约原模型的 0.1%；偏好集约 22K 句、十个方向。**不是**把 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md) 的 $\pi_{\mathrm{ref}}$ 框擦掉再贴同一条损失。CPO 把参考策略改成均匀先验 $U$，再加一项 chosen 的 NLL。同一份偏好数据上，原版 DPO 平均分还往下掉。**不是** [SimPO](../../4.4.2-无奖励模型的对齐DPO-KTO/04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md)：SimPO 的奖励是 $(\beta/|y|)\log\pi_\theta$，再减间隔 $\gamma$，没有 NLL。两家都说「训练不加载参考模型」，槽完全不同。

## 1. 参考不一定是金的

翻译的监督目标几乎总是负对数似然。平行句 $\mathcal{D}=\{x^{(i)},y^{(i)}\}_{i=1}^{N}$，$x$ 是源句，$y$ 是所谓金参考：

$$
\mathcal{L}_{\mathrm{NLL}}
=
-\mathbb{E}_{(x,y)\sim\mathcal{D}}
\bigl[\log\pi_\theta(y\mid x)\bigr].
\tag{1}
$$

式 (1) 把模型往 $y$ 上贴。$y$ 写漏了专名、丢掉半句，最优解也会学漏。BLEU、COMET-22 这类参考型指标同样被差参考拖着走。Xu 等 2023 的 ALMA 已经用单语续预训练加高质量平行句 SFT，把 7B/13B 的 decoder-only 拉到能打 GPT-3.5；还是过不了 GPT-4 和当年 WMT 冠军。再在同一套 FLORES 上做式 (1)，上限还是那份参考。

论文把 FLORES-200 的 dev+test 共 2009 句、五个英枢语言对（de、cs、is、zh、ru，双向）拿出来，让 ALMA-13B-LoRA 和 GPT-4（`gpt-4-1106-preview`）各译一遍。打分不用参考：两个约 10B 的无参考模型，Unbabel/wmt23-cometkiwi-da-xxl（下文 KIWI-XXL）和 Unbabel/XCOMET-XXL（下文 XCOMET），都是 WMT23 Metrics 里跟人判相关最高的那一档。Table 1 是五语平均：

| | KIWI-XXL | 胜参考 % | XCOMET | 胜参考 % |
|--|--------:|--------:|-------:|--------:|
| xx$\to$en 参考 | 85.31 | — | 88.82 | — |
| ALMA-13B-LoRA | 88.33 | 73.24 | 92.68 | 60.17 |
| GPT-4 | 89.21 | 79.43 | 94.66 | 54.25 |
| en$\to$xx 参考 | 87.85 | — | 94.42 | — |
| ALMA-13B-LoRA | 85.62 | 42.15 | 93.07 | 35.46 |
| GPT-4 | 87.30 | 49.13 | 94.21 | 38.09 |

译入英语时，系统输出平均高出参考约 3–4 个 KIWI-XXL、4–6 个 XCOMET；ALMA 有 73.24% 的句子被 KIWI-XXL 判赢参考。译出英语时均值打平，仍有约四成句子赢参考。论文 Figure 2 给过一条 FLORES 例子：参考保留缩写 CEP、不写全称，ALMA 和 GPT-4 把全称补上了。人工参考不是金标准，是镀金。

把更高分的句子当新参考再做一次式 (1)，能抬模仿上限，教不会「拒绝」。强模型仍会漏译、漏细节。CPO 要的是对比：同一条 $x$ 上，高分译文往上走，低分但仍然像人写的译文当难负例往下压。论文把它写成 hard negative 的对比学习，不是另起一套聊天对齐。

## 2. 三元组里只留最高和最低

机器翻译几乎没有现成的成对偏好。CPO 自己造。源句仍来自 FLORES-200 的 2009 句、同一十个方向。对每条 $x$，三条候选组成三元组

$$
\mathbf{y}=(y_{\mathrm{ref}},\,y_{\mathrm{gpt-4}},\,y_{\mathrm{alma}}).
$$

KIWI-XXL 与 XCOMET 各打一遍，平均分成 $\mathbf{s}=(s_{\mathrm{ref}},s_{\mathrm{gpt-4}},s_{\mathrm{alma}})$。最高分当 $y_w$，最低分当 $y_l$，中间那条丢掉：

$$
y_w=\mathbf{y}_{\arg\max_i(\mathbf{s})},\qquad
y_l=\mathbf{y}_{\arg\min_i(\mathbf{s})}.
$$

$y_l$ 往往仍是合格译文。叫 dis-preferred，只表示还有可改的细节。用这种「高质但不完美」的负例，才压得动漏译、漏专名，而不是压一个明显坏掉的句子。

![三元组打分后只留最高分与最低分](./images/fig-cpo-triplet-prefer.png)

> 图 1：一条源句 $x$ 生出 $y_{\mathrm{ref}}$、$y_{\mathrm{gpt-4}}$、$y_{\mathrm{alma}}$，KIWI-XXL 与 XCOMET 平均成 $s$；argmax 进 $y_w$，argmin 进 $y_l$，中间分虚线丢掉。

**图 1 解析**

- 从左到右四列，不是上下两套损失。浅蓝框只有源句。
- 第二列三条候选：奶油色是 FLORES 参考，薄荷绿是 GPT-4，淡紫是 ALMA-13B-LoRA。三条都进黄框打分。
- 黄框写出平均分 $s$。绿框取最高，橙框取最低。灰框是中间分，虚线表示不进损失。
- 不要把灰框读成「再训一个参考模型」。丢掉的是候选，不是 $\pi_{\mathrm{ref}}$。

Table 2 是 $y_w$ 的来源占比（每个语言对、双向合计）。参考当 winner 的比例大约两成，并不是零，也远不是全部：

| | ALMA-13B-LoRA | GPT-4 | Reference |
|--|-------------:|------:|----------:|
| en$\leftrightarrow$de | 46% | 37% | 17% |
| en$\leftrightarrow$cs | 32% | 41% | 27% |
| en$\leftrightarrow$is | 36% | 40% | 24% |
| en$\leftrightarrow$zh | 45% | 35% | 20% |
| en$\leftrightarrow$ru | 31% | 44% | 25% |

十个方向 $\times$ FLORES 约 2K 句得到 20K。FLORES 里有一部分也曾用于 ALMA 的 SFT。CPO 换的不是新平行句，是同一批源句上的目标：从贴参考改成对比高低分。另有内部人标偏好，只覆盖 en$\to$zh 和 en$\to$de。CPO 论文 §4.1 写成 1K；附录 D 写成两方向合计约 2K 句（含平局）。源句从维基滤过时间戳和 URL，候选是 Google 翻译对 GPT-4。Table 11：en$\to$de 上 Google 赢 418、GPT-4 赢 435、平局 203；en$\to$zh 上 362 / 412 / 282。平局丢掉。摘要写 22K parallel，口径是 FLORES 20K 加上这批人标。附录 D 后来说人标几乎没抬分：en$\to$xx 平均几乎不动，xx$\to$en 还略降。主结果仍把人标算进 22K，消融时单独拆开。

## 3. 从 DPO 走到均匀先验

成对数据写成 $\mathcal{D}=\{x^{(i)},y_w^{(i)},y_l^{(i)}\}_{i=1}^{N}$。DPO 的最大似然是

$$
\mathcal{L}(\pi_\theta;\pi_{\mathrm{ref}})
=
-\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\Biggl[
\log\sigma
\Biggl(
\beta\log\frac{\pi_\theta(y_w\mid x)}{\pi_{\mathrm{ref}}(y_w\mid x)}
-
\beta\log\frac{\pi_\theta(y_l\mid x)}{\pi_{\mathrm{ref}}(y_l\mid x)}
\Biggr)
\Biggr].
\tag{2}
$$

推导在 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)，这里不重推。$\pi_{\mathrm{ref}}$ 在 DPO 里通常是冻结的 SFT。前向要跑两份策略，显存和时间都接近翻倍。翻译这边起点已经是 ALMA-LoRA，再驻一份 13B 参考并不便宜。

把 $\pi_{\mathrm{ref}}$ 设成均匀分布 $U$。$U(y_w\mid x)$ 与 $U(y_l\mid x)$ 相同，式 (2) 里两处分母抵消，只剩下当前策略的对数概率差：

$$
\mathcal{L}(\pi_\theta;U)
=
-\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\Bigl[
\log\sigma
\bigl(
\beta\log\pi_\theta(y_w\mid x)
-
\beta\log\pi_\theta(y_l\mid x)
\bigr)
\Bigr].
\tag{3}
$$

式 (3) 前向只跑 $\pi_\theta$。这不是把 DPO 的参考框忘了画。抵消成立，当且仅当参考在 $y_w$ 和 $y_l$ 上取同一个值；均匀先验满足，冻结 SFT 一般不满足。$\beta$ 仍沿用 Rafailov 默认 0.1，不是另造温度。

式 (3) 的自变量没有除以 $|y|$，也没有间隔 $\gamma$。那是 SimPO 的做法，不是这篇。序列越长，对数概率越负，要让 $y_w$ 赢，模型会把长译文的逐步概率抬上去。后来 SimPO 在聊天数据上量过，CPO 生成平均比 SimPO 长约 50%。那是 04 的表，不是本篇 WMT 数字。本篇损失按式 (3) 写：未归一的序列对数概率差。

## 4. 定理 1：均匀先验是理想参考的上界

附录 C 并不声称式 (3) 等于式 (2)。定理 1 的设定是：把 $\pi_{\mathrm{ref}}$ 换成理想策略 $\pi_w$，它精确对齐 preferred 数据的真分布。对 $\mathcal{D}$ 里每条样本，$\pi_w(y_w\mid x)=1$，且 $0\le\pi_w(y_l\mid x)\le 1$。代入式 (2)，$y_w$ 那一项的参考权重是 1，剩下

$$
\mathcal{L}(\pi_\theta;\pi_w)
=
-\mathbb{E}
\Bigl[
\log\sigma
\bigl(
\beta\log\pi_\theta(y_w\mid x)
-
\beta\log\pi_\theta(y_l\mid x)
+
\beta\log\pi_w(y_l\mid x)
\bigr)
\Bigr].
$$

展开 $\sigma$，丢掉不参与梯度的 $\mathbb{E}[\log\pi_w(y_l\mid x)^{\beta}]$（定理里的常数 $C$），得到等价目标 $\mathcal{L}'$。因为 $\pi_w(y_l\mid x)\le 1$，把这一项换成 1 会放大括号里的第二项，从而

$$
\mathcal{L}(\pi_\theta;\pi_w)+C
\le
\mathcal{L}(\pi_\theta;U).
$$

最小化式 (3)，是在压 $\mathcal{L}(\pi_\theta;\pi_w)$ 的一个上界。$\pi_w$ 训练时拿不到，近似之后损失里也不再出现它。和 DPO 常见做法的差别在这里：DPO 的 $\pi_{\mathrm{ref}}$ 是手里的 SFT checkpoint；这条证明把 $\pi_{\mathrm{ref}}$ 设成「尚未到达的理想 preferred 策略」。上界不是等式。同一份数据上，原版 DPO（参考=ALMA-LoRA）平均分下降，式 (3) 加 NLL 上升，已经说明两者不是换皮。

手算一组假对数概率，只看式 (3) 的尺度，不是论文表。设 $\beta=0.1$，$\log\pi_\theta(y_w\mid x)=-12$，$\log\pi_\theta(y_l\mid x)=-10$。差是 $-2$，乘 $\beta$ 得 $-0.20$，$\sigma(-0.20)\approx 0.45$，$-\log 0.45\approx 0.80$。隐式排序把输家排得更高，这条还在学。把 $y_w$ 改成 $-9$，差是 $+1$，乘 $\beta$ 得 $0.10$，$\sigma(0.10)\approx 0.525$，损失约 $0.64$，开始歇。没有 $\pi_{\mathrm{ref}}$ 可减，间隔完全落在 $\pi_\theta$ 自己的对数概率上。

## 5. 行为克隆正则变成 chosen 的 NLL

只最小化式 (3)，策略可以离开 preferred 数据的分布。论文加一条行为克隆约束（Hejna 等 *Contrastive Preference Learning*，[arXiv:2310.13639](https://arxiv.org/abs/2310.13639)，名字是 CPL，不要和 CPO 混）：

$$
\min_\theta
\mathcal{L}(\pi_\theta,U)
\quad
\text{s.t.}
\quad
\mathbb{E}_{(x,y_w)\sim\mathcal{D}}
\bigl[
\mathrm{KL}\bigl(\pi_w(y_w\mid x)\Vert\pi_\theta(y_w\mid x)\bigr)
\bigr]
<\epsilon.
\tag{4}
$$

拉格朗日系数论文设成 $\lambda=1$。$\pi_w(y_w\mid x)=1$，KL 展开后第一项是 $1\cdot\log 1=0$，第二项是 $- \log\pi_\theta(y_w\mid x)$。约束因此退化成 preferred 句上的负对数似然。CPO 的完整目标是两项相加：

$$
\min_\theta
\underbrace{\mathcal{L}(\pi_\theta,U)}_{\mathcal{L}_{\mathrm{prefer}}}
\;+\;
\underbrace{
-\mathbb{E}_{(x,y_w)\sim\mathcal{D}}
\bigl[\log\pi_\theta(y_w\mid x)\bigr]
}_{\mathcal{L}_{\mathrm{NLL}}}.
\tag{5}
$$

$\mathcal{L}_{\mathrm{prefer}}$ 是式 (3)，$\mathcal{L}_{\mathrm{NLL}}$ 只打 $y_w$，不打 $y_l$。和式 (1) 的差别：监督目标不再是数据集参考，而是三元组里 QE 最高的那条；同时还在用 $y_l$ 做对比。附录 C.2 逐步展开 KL，没有额外超参。实现里序列对数概率仍是 completion 逐步 $\log\pi(y_t\mid x,y_{<t})$ 相加，prompt 不算损失，和 DPO 同一套手续。两项 $\lambda=1$ 直接加。

Hugging Face TRL 把 CPO 放在 `trl.experimental.cpo`。默认 `loss_type="sigmoid"` 才对应式 (3) 的 logistic；NLL 乘在 `cpo_alpha` 上，默认 1，对齐论文的 $\lambda$。日志里的 `rewards/chosen` 是 $\beta\log\pi_\theta(y_w)$，没有参考模型可减，`nll_loss` 单独一项。同一 Trainer 还接了 `loss_type="simpo"`：长度平均加 $\gamma$，并且要把 `cpo_alpha=0` 才关掉 BC。那是 04 的损失，不是式 (5)。Quick start 用 UltraFeedback 聊天对，和本篇 FLORES 三元组不是同一份数据。复现 ALMA-R 跟论文附录和 [fe1ixxu/ALMA](https://github.com/fe1ixxu/ALMA)，不要跟库的示例超参。TRL 文档不是公式源。

![CPO 损失：均匀先验的偏好项加 chosen 的 NLL](./images/fig-cpo-prefer-nll.png)

> 图 2：三元组只进可训的 $\pi_\theta$。上支 $\mathcal{L}_{\mathrm{prefer}}$ 是均匀先验下的 $\log\sigma$ 差，下支 $\mathcal{L}_{\mathrm{NLL}}$ 只打 $y_w$，相加得到 $\mathcal{L}_{\mathrm{CPO}}$。

**图 2 解析**

- 从左到右。浅蓝框是已经造好的 $(x,y_w,y_l)$，不是训练环里再采样。
- 绿框只有 $\pi_\theta$。没有灰色冻结参考，也没有 Critic。页脚写 $\pi_{\mathrm{ref}}:=U$。
- 黄框是式 (3)。青绿框是式 (5) 的 NLL。橙框把两项相加。
- 不要把绿框读成 SimPO：这里没有 $|y|$，没有 $\gamma$。不要把黄框读成「少画了 $\pi_{\mathrm{ref}}$ 的 DPO」，分母已经换成均匀先验，证明是上界不是等式。

附录 I 把同一项 NLL 加回原版 DPO，记成 $\mathcal{L}_{\mathrm{DPO}}+\mathcal{L}_{\mathrm{NLL}}$。Table 18 的平均分：

| 目标 | xx$\to$en KIWI-22 / XXL / XCOMET | en$\to$xx 同上 | 显存 | FLOPs/tok |
|--|--|--|--|--|
| $\mathcal{L}_{\mathrm{DPO}}$ | 80.51 / 81.36 / 86.58 | 82.27 / 82.07 / 92.25 | $2\times$ | $2\times$ |
| $\mathcal{L}_{\mathrm{DPO}}+\mathcal{L}_{\mathrm{NLL}}$ | 81.28 / 82.42 / 89.05 | 83.13 / 84.74 / 93.53 | $2\times$ | $2\times$ |
| $\mathcal{L}_{\mathrm{prefer}}+\mathcal{L}_{\mathrm{NLL}}$（CPO） | 81.33 / 82.43 / 89.11 | 83.34 / 85.74 / 94.05 | $1\times$ | $1\times$ |

原版 DPO 在这份 MT 偏好上几乎没动、部分指标还降。加上 NLL 之后分数跳到 CPO 附近，显存仍是两份。CPO 用均匀先验换掉参考前向，分数持平或略高，成本回到一份。论文据此说：这份数据上缺的是行为克隆，不只是「把 DPO 的参考删掉」。$\mathcal{L}_{\mathrm{prefer}}$ 是 DPO 的可用近似，不是同一条损失换了名字。

## 6. 不是 SimPO，不是 DPO，不是 ORPO，不是 SLiC

几条邻居都自称能省参考模型或省 RM。数据槽和奖励定义不要混。

SimPO 把隐式奖励换成 $(\beta/|y|)\log\pi_\theta$，Bradley-Terry 里再减 $\gamma$，训练不加载 $\pi_{\mathrm{ref}}$，也没有 chosen 的 NLL。CPO 的对数差未除长度，有 NLL，均匀先验是 DPO 分母的特例，不是另定义一把长度平均尺。SimPO 常用 $\beta=2.0$–$2.5$，量纲已经不是 Rafailov 的 0.1。聊天榜上的对照见 04，不要写进下面的 WMT 表。

DPO 必须驻 $\pi_{\mathrm{ref}}$，损失是式 (2)，没有 $\mathcal{L}_{\mathrm{NLL}}$。本篇 Table 3、Table 4 里「+ DPO」就是这条，平均分低于起点 ALMA-LoRA。CPO 不是「DPO 把参考设成 1」。参考设成均匀之后还要式 (5) 的第二项，证明走的是上界。

ORPO 把 chosen 的交叉熵和 chosen/rejected 的几率比捆在一起，可以不加载 $\pi_{\mathrm{ref}}$，奖励不是 $\beta\log\pi_\theta$ 差。ORPO 允许从裸基座单阶段训；CPO 默认从已经 SFT 饱和的 ALMA-LoRA 再往上推。正本在 [02-ORPO](../../4.4.2-无奖励模型的对齐DPO-KTO/02-ORPO/02-ORPO.md)。

SLiC-HF 是 rank hinge 加一条对 $y_{\mathrm{ref}}$ 的交叉熵，间隔在校准损失里叫 $\beta$，没有 $\sigma$。CPO 的 $\mathcal{L}_{\mathrm{prefer}}$ 是 logistic，不是合页；$y_w$ 来自 QE 三元组，不是 SFT 采样再让 RM 排序。正本在 [01-SLiC](../01-SLiC-序列似然校准/01-SLiC-序列似然校准.md)。[02-RRHF](../02-RRHF-排序响应对齐/02-RRHF-排序响应对齐.md) 的 $p_i$ 做了长度归一，hinge 无间隔，SFT 项只打奖励最高的一条。CPO 的 NLL 打的是 QE 最高，对比项是 $\log\sigma$ 不是合页。

[03-IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md) 仍要 $\pi_{\mathrm{ref}}$，把 $\log\sigma$ 换成平方，靶心 $\tau^{-1}/2$。CPO 没有 MSE，也没有 $\tau$。KTO 不成对。PPO / GRPO 要在线采样和奖励模型，本篇训练期不对 LM 做 rollout。

| | 数据 | 冻结 $\pi_{\mathrm{ref}}$ | 偏好项 | 额外项 |
|--|------|---------------------------|--------|--------|
| DPO | 成对 | 要 | $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$ 的 $\log\sigma$ | 无 |
| CPO | 成对（MT 三元组取两端） | 不要（均匀 $U$） | $\beta\log\pi_\theta$ 差的 $\log\sigma$ | chosen 的 NLL |
| SimPO | 成对 | 不要 | $(\beta/\|y\|)\log\pi_\theta$，减 $\gamma$ | 无 |
| ORPO | 成对 | 不要 | 几率比 | chosen 的 NLL |
| SLiC-HF | 成对 | 不要 | rank hinge | 对 $y_{\mathrm{ref}}$ 的 CE |
| IPO | 成对 | 要 | 同一对数比的 MSE | 无 |

## 7. 训练设定与 WMT 数字

ALMA-13B-LoRA 自己已经走完两段：LLaMA-2 先在非英单语上满参微调，再在高质量人工平行句上 LoRA。CPO 是第三段，数据更少，只动那 12M。many-to-many，十个方向一起训。起点就是这份 LoRA，rank 16。$\beta=0.1$，batch 128，warmup 比例 0.01，一个 epoch，最长 512 token，DeepSpeed。prompt 与 ALMA 原文相同，GPT-4 造偏好时用 Hendy 等 2023 的翻译提示，细节在附录 B；prompt token 不算损失。测试主集：冰岛语走 WMT'21，其余走 WMT'22；辅助六方向走 WMT'23（de/zh/ru 双向）。主指标是无参考的 KIWI-XXL、XCOMET，以及更小的 Unbabel/wmt22-cometkiwi-da（KIWI-22）。参考型 sacreBLEU 和 COMET-22 放附录 A。表里深蓝色块表示相对原 ALMA 的提升达到 Kocmi 等 2024 估计的 80% 人判一致阈值：KIWI-XXL 与 XCOMET 至少 $+1.24$，KIWI-22 至少 $+0.53$。

对照包括：原 ALMA-13B-LoRA、在同一份 $y_w$ 上继续 SFT、原版 DPO、GPT-4、各方向 WMT 冠军、以及 WMT'23 上的 TowerInstruct（WMT'22 测集被它训过，主表不用）。7B 同样走 CPO，附录里叫 ALMA-7B-R。

**en$\to$xx，Table 3。** 四行都从 ALMA-13B-LoRA 出发：在同一份 $y_w$ 上继续 SFT、原版 DPO、CPO（产物 ALMA-13B-R）。de / cs / is 三组如下。

| 方向 | 指标 | ALMA-13B-LoRA | +SFT on preferred | +DPO | +CPO (ALMA-13B-R) |
|--|--|--:|--:|--:|--:|
| de | KIWI-XXL | 81.64 | 81.85 | 81.20 | **84.25** |
| de | KIWI-22 | 82.62 | 82.75 | 82.40 | 83.28 |
| de | XCOMET | 96.49 | 96.67 | 96.40 | 97.48 |
| cs | KIWI-XXL | 84.24 | 83.46 | 83.45 | **87.06** |
| cs | KIWI-22 | 84.14 | 84.14 | 83.86 | 84.99 |
| cs | XCOMET | 92.38 | 91.99 | 91.68 | 93.61 |
| is | KIWI-XXL | 83.31 | 82.11 | 82.66 | **85.68** |
| is | KIWI-22 | 81.71 | 81.48 | 81.43 | 82.18 |
| is | XCOMET | 91.20 | 90.30 | 90.33 | 91.93 |

de 的 KIWI-XXL：DPO 81.20，CPO 84.25。cs 的 KIWI-XXL：DPO 83.45，CPO 87.06。is 的 KIWI-XXL：DPO 82.66，CPO 85.68。SFT 在 cs / is 的 KIWI-XXL 上还往下掉。同一张表的 zh：DPO 的 KIWI-XXL 79.64，CPO 84.32；ru：DPO 83.40，CPO 87.37。五语平均（KIWI-22 / XXL / XCOMET）：ALMA 82.48 / 82.66 / 92.76；SFT 82.57 / 82.42 / 92.54；DPO 82.27 / 82.07 / 92.25；CPO 83.34 / **85.74** / **94.05**。GPT-4 平均 82.94 / 83.83 / 93.23，WMT 冠军 83.41 / 84.81 / 93.78。KIWI-XXL 与 XCOMET 上 CPO 超过 GPT-4 和冠军平均。SFT 和 DPO 在多数格子上是黄块（下降）。同一份偏好、同一起点，原版 DPO 平均还降，已经说明 CPO 不是把 DPO 换个名字。

**xx$\to$en，Table 4 平均。** ALMA：80.53 / 81.50 / 86.74。SFT：80.96 / 81.99 / 88.40，译入英语有用。DPO：80.51 / 81.36 / 86.58，几乎回到起点。CPO：81.33 / 82.43 / 89.11。GPT-4 是 81.28 / 82.60 / 89.41，WMT 冠军是 80.92 / 81.19 / 87.13。译入英语上 CPO 贴近 GPT-4，XCOMET 平均 89.11 对冠军的 87.13。分方向里抬得清楚的格子：cs 的 KIWI-XXL，DPO 82.69、CPO 83.75；is 的 XCOMET：DPO 76.09，CPO 80.49。zh$\to$en 的 KIWI-XXL 从 74.41 到 77.17，仍略低于 GPT-4 的 77.65。

**WMT'23，Table 5，六方向平均。** CPO：80.55 / 78.97 / 89.74。WMT 冠军 80.57 / 77.72 / 88.24。TowerInstruct 80.31 / 77.18 / 88.11。原 ALMA 79.48 / 76.00 / 87.16。KIWI-22 与冠军打平，另外两格高于冠军和 TowerInstruct。附录 Table 16 分方向：en$\to$zh 的 KIWI-XXL 从 72.95 到 78.17，en$\to$ru 从 76.02 到 81.52，这两格抬得最狠。

附录 A 写「别再用 BLEU」。en$\to$xx 平均 BLEU：ALMA 31.87，CPO 27.03，GPT-4 33.23，WMT 冠军 38.98。神经无参考指标往上走，词面重合往下走。cs$\to$en 上 WMT 冠军 BLEU 64.14，比别家高约 20 个点，KIWI-XXL 只有 82.53，低于 CPO 的 83.75 和 GPT-4 的 83.55。论文判断是赛训域和测试域词面贴得太近，语义上并没有那么强。COMET-22 跟无参考更同向：en$\to$xx 上 CPO 87.74、GPT-4 87.68；xx$\to$en 上 CPO 85.21、冠军 85.60，和 XCOMET 的排序仍会拧。评价口径以无参考为主，不是作者偷换尺子之后才赢。

ALMA-7B-R 同一套偏好。en$\to$xx 平均 KIWI-XXL：7B-LoRA 80.80，CPO 83.34；13B-R 是 85.74。xx$\to$en 上 7B-R 的 KIWI-22 / XXL / XCOMET 是 80.87 / 81.39 / 87.92，相对 7B-LoRA 的 80.05 / 80.50 / 84.23。7B 也能吃到同一条损失，到不了 13B-R。冰岛语算低资源，en$\to$is 上 13B-R 的 KIWI-XXL 从 83.31 到 85.68，is$\to$en 的 XCOMET 从 76.68 到 80.49，方向和其他高资源语一致，不是只在德中俄上有效。BLEU 在 7B 上同样往下走：en$\to$xx 平均从 29.78 掉到 25.41，和 13B 的 31.87$\to$27.03 同一方向。神经无参考指标升、词面重合降，不是 13B 独有的现象。

## 8. 是译文更好，还是在讨好打分模型

偏好用 KIWI-XXL 和 XCOMET 造，测试也用它们。需要回答有没有「作弊」。

造偏好时只开其中一个打分器，再重新 CPO。Table 6：xx$\to$en 上，只用 KIWI-XXL 造对，测试 KIWI-XXL 82.59、XCOMET 88.82；只用 XCOMET 造对，测试 82.33 / 89.17；两者集成（原文）82.43 / 89.11。en$\to$xx 同样，三行彼此差在小数。没有出现「用谁造对、谁的测试分就独高」的尖峰。COMET 系可能正相关，附录 H 另加 BLEURT-20（非 COMET、有参考）。xx$\to$en 平均 73.96$\to$74.79，en$\to$xx 75.02$\to$76.04，方向与无参考一致。

方法层：同一份 metric-preferred 数据，SFT 和 DPO 并没有把这些指标刷上去，Table 3、4 里它们平均还降。若「讨好打分器」那么容易，这两条目标不该失败。CPO 在同一数据上上升，论文据此不把增益写成纯 metric hacking。

人评是直接证据。zh$\to$en，WMT'22 测试 1875 句里抽 400，每条一对：ALMA-13B-LoRA 对 ALMA-13B-R。四名中英双语标注员，量表 0–6（Kocmi 等 WMT'22 的口径）：0 不知所云，2 部分保留、大量错漏，4 大体对、小语法问题，6 完美。每人 100 条，顺序随机。Table 7：

| | 均分 $\uparrow$ | 均秩 $\downarrow$ | 胜率 % | 平局 % |
|--|----:|------:|-------:|------:|
| ALMA-13B-LoRA | 4.86 | 1.60 | 62.50 | 40.30 |
| ALMA-13B-R | 5.16 | 1.40 | 77.80 | 40.30 |

平局四成，符合「两边都已经能译」的设定。均分、均秩、胜率仍是 R 更好。胜率含平局双方都算赢，所以两行胜率之和超过 100%。

损失两项的消融写在 Figure 4 左：只留 $\mathcal{L}_{\mathrm{prefer}}$ 或只留 $\mathcal{L}_{\mathrm{NLL}}$（后者等于在 $y_w$ 上 SFT）都不如两项一起。数据来源消融在 Figure 4 右：三元组里拿掉 ALMA 候选，en$\to$xx 掉得明显；拿掉 GPT-4，xx$\to$en 掉得明显。难负例质量单独做了 Table 8。$y_w$ 仍取三元组最高；$y_l$ 改成对 $y_w$ 做人工噪声：词删除概率 0.15，窗口 1 的词交换概率 0.3（Zeng 等 2023 的做法）。xx$\to$en：噪声负例 81.01 / 82.18 / 88.23，自然低分译文 81.33 / 82.43 / 89.11。en$\to$xx 差距更大：82.71 / 83.13 / 92.80 对 83.34 / 85.74 / 94.05。负例太假，对比项学不到「拒绝近乎正确的漏译」。

## 9. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成无参考的 DPO | 式 (3) 是上界，式 (5) 还有 NLL | 同一数据上原版 DPO 降分；缺的是 BC，不是把 $\pi_{\mathrm{ref}}$ 框擦掉 |
| 写成 SimPO | 无 $\|y\|$，无 $\gamma$，有 NLL | SimPO 的 $\beta$ 常见 2.0–2.5；本篇 $\beta=0.1$ |
| 参考当真金 | Table 1，xx$\to$en 七成系统输出赢参考 | 再 SFT 到参考上，上限被钉死 |
| 负例用乱码、随机删词 | Table 8 | 自然高质负例才压得动细节 |
| 只用 SFT 打 $y_w$ | 没有拒绝 | Table 3 译出英语平均还降 |
| 驻一份 SFT 做 DPO | 式 (2)，无 NLL | Table 3/4 下降；附录 I 加上 NLL 才回来，仍 $2\times$ 显存 |
| BLEU 掉了就判失败 | 词面重合与无参考拧 | en$\to$xx BLEU 31.87$\to$27.03，KIWI-XXL 82.66$\to$85.74 |
| 人标一定更准 | 附录 D，平局多 | 22K 里那 2K 人标几乎没抬分 |
| 造对和测试共用 COMET 系 | 指标相关 | Table 6 换打分器、附录 H 的 BLEURT、Table 7 人评 |
| 当成通用聊天对齐 | 实验是 WMT 十方向 | 偏好来自 QE 三元组，不是 Anthropic-HH；聊天榜数字见 SimPO 表，不是本篇 |
| 从裸基座直接 CPO | 论文从 ALMA-LoRA 出发 | 先单语续预训练再平行句 SFT，CPO 是第三段 |
| TRL 一键切 `simpo` | 同一 Trainer 的另一条损失 | 长度平均加 $\gamma$，还要 `cpo_alpha=0`；不是式 (5) |
| 在线探索、可验证奖励 | 训练不采样 | 多步推理走 PPO / GRPO |

CPO 不是万能药。它把「参考不够金、SFT 不会拒绝」收成均匀先验下的 logistic 差，再加上 chosen 的 NLL，省掉冻结参考的那份前向。前提是手里能造出高质难负例，并且评测肯离开参考型 BLEU。成对贵、负例只能造噪声、任务不是翻译，就不要硬套式 (5)。

同夹：[01-SLiC](../01-SLiC-序列似然校准/01-SLiC-序列似然校准.md) 的 hinge，[02-RRHF](../02-RRHF-排序响应对齐/02-RRHF-排序响应对齐.md) 的长度归一排序，[03-IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md) 的恒等平方。无参考的另一条槽在 [04-SimPO](../../4.4.2-无奖励模型的对齐DPO-KTO/04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md)。DPO 本体在 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)。

## 参考文献

1. Xu, H., Sharaf, A., Chen, Y., Tan, W., Shen, L., Van Durme, B., Murray, K., & Kim, Y. J. (2024). [Contrastive Preference Optimization: Pushing the Boundaries of LLM Performance in Machine Translation](https://arxiv.org/abs/2401.08417). *ICML*. HTML：[arXiv HTML](https://arxiv.org/html/2401.08417)。代码与模型：[fe1ixxu/ALMA](https://github.com/fe1ixxu/ALMA)。
2. Xu, H., Kim, Y. J., Sharaf, A., & Awadalla, H. H. (2023). [A Paradigm Shift in Machine Translation: Boosting Translation Performance of Large Language Models](https://arxiv.org/abs/2309.11674).（ALMA）
3. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
4. Hejna, J., Rafailov, R., Sikchi, H., Finn, C., Niekum, S., Knox, W. B., & Sadigh, D. (2023). [Contrastive Preference Learning: Learning from Human Feedback without RL](https://arxiv.org/abs/2310.13639).（BC 正则的引用，CPL，不是 CPO）
5. Rei, R., et al. (2023). [Scaling up CometKiwi: Unbabel-IST 2023 Submission for the Quality Estimation Shared Task](https://arxiv.org/abs/2309.11925).（KIWI-XXL）
6. Guerreiro, N. M., et al. (2023). [xCOMET: Transparent Machine Translation Evaluation through Fine-grained Error Detection](https://arxiv.org/abs/2310.10482).
7. Freitag, M., et al. (2023). [Results of WMT23 Metrics Shared Task: Metrics Might Be Guilty but References Are Not Innocent](https://aclanthology.org/2023.wmt-1.51/).
8. Kocmi, T., Zouhar, V., Federmann, C., & Post, M. (2024). [Navigating the Metrics Maze: Reconciling Score Magnitudes and Accuracies](https://arxiv.org/abs/2401.06760).（80% 人判阈值）
9. NLLB Team. (2022). [No Language Left Behind: Scaling Human-Centered Machine Translation](https://arxiv.org/abs/2207.04672).（FLORES-200）
10. Meng, Y., Xia, M., & Chen, D. (2024). [SimPO: Simple Preference Optimization with a Reference-Free Reward](https://arxiv.org/abs/2405.14734).（「不是」对照）
11. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691).
12. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
13. Hugging Face. [TRL CPO Trainer](https://huggingface.co/docs/trl/en/cpo_trainer).（实现旁注，非公式源）
