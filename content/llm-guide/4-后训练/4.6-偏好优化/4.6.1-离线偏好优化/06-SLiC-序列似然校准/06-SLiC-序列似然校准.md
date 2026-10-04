---
title: "06 · SLiC: 序列似然校准"
published: true
tags: ["SLiC", "SLiC-HF", "hinge", "序列似然", "RLHF", "TL;DR", "T5"]
excerpt: "SLiC-HF 用一条带间隔的 rank hinge 让人更喜欢的摘要在模型里拿到更高的序列对数似然, 再加一条对目标序列的交叉熵. 770M 的 T5 在 TL;DR 人评上对 Stiennon 6B PPO 胜率 66% 对 34%, 训练期只驻一份策略权重."
---
# 06 SLiC: 序列似然校准

> 相关阅读: [4.6.2 在线偏好与自对弈](../../4.6.2-在线偏好与自对弈/4.6.2-在线偏好与自对弈.md) · [07 RRHF](../07-RRHF-排序响应对齐/07-RRHF-排序响应对齐.md) · [02 IPO](../02-IPO-身份偏好优化/02-IPO-身份偏好优化.md) · [01 DPO](../01-DPO/01-DPO.md) · [4.4 PPO](../../../4.4-强化学习基础/04-PPO/04-PPO.md) · [4.7.2 RAFT](../../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md)

材料是两篇论文: 原 SLiC (Zhao 等 2022, [arXiv:2210.00045](https://arxiv.org/abs/2210.00045), ICLR 2023) 按候选与参考摘要的相似度排正负例; SLiC-HF (Zhao, Joshi, Liu 等 2023, [arXiv:2305.10425](https://arxiv.org/abs/2305.10425)) 把排序依据换成人类偏好. 问题是能否不用 PPO, 只靠一条序列级排序损失让模型学会人更喜欢的摘要.

## 1. 序列似然为什么要校准

### 1.1. 最大似然留下的错位

条件语言模型用最大似然训练. 每条输入 $x$ 通常只有一条目标 $y$, 模型学会给像样的序列较高的概率, 但从没被要求比较两条像样的序列谁更好. 原 SLiC 把这种现象叫作序列似然没有校准: 模型给出的 $\log P_\theta(y|x)$ 排不准生成质量.

原 SLiC 摘要列了这种错位的几个表现. beam 开大以后输出质量下降; 解码要依赖长度归一和禁止重复这类启发式, 因为模型低估长序列的似然, 又高估重复片段的似然. 这些启发式在 Transformer 库里几乎是默认开关, 它们修补的是同一个根源: 训练只见过一条目标.

摘要任务上还有第二层问题. 参考摘要多半是从网页挖出来的, 质量和口吻都不一定是人最想要的. Stiennon 等 2020 已经观察到, 经过 RLHF 的摘要常常比数据集参考更受人喜欢. 只做最大似然, 上限就是参考摘要; ROUGE 只量和参考有多像, 量不出超过参考的那一部分.

RLHF 用奖励模型和 PPO 越过这层上限, 代价是训练复杂. SLiC-HF 引言给出三点: 价值网络和奖励网络可以和策略一样大, 为了速度常驻内存, 同一内存预算下能训的模型变小; 训练环里要从当前策略采样解码, 每一步都慢; 超参和 PPO 各部件的配合需要专门经验. SLiC-HF 的回应是把人类偏好直接放进一条序列级排序损失, 训练期只留一份策略权重; 它的损失形状, 正则选择和解码候选的做法都继承自原 SLiC, 所以先看原 SLiC.

### 1.2. 原 SLiC: 先解码, 再按相似度校准

原 SLiC 在预训练, 微调之后加第三个阶段. 算法 1 先用微调好的模型 $P_{\theta_{ft}}$ 在它自己的训练集上解出 $m$ 条候选 $\{\hat y\}_m$, 再从 $\theta_{ft}$ 出发继续训练, 损失是校准项加正则项:

$$
\mathcal{L}(\theta)=\sum_b L^{\mathrm{cal}}(\theta,s;x,\bar y,\{\hat y\}_m)+\lambda L^{\mathrm{reg}}(\theta,\theta_{ft};x,\bar y) \tag{1}
$$

$\bar y$ 是数据集目标, $s=s(\hat y,\bar y;x)$ 衡量候选和目标有多像. 原文的 $s$ 取模型自己解码器输出的隐状态, 在长度为 $n=1,2,4,8$ 的片段上算余弦相似度, 再按 BERTScore 的方式汇成 F 值. 和直接用 ROUGE 比, 这个相似度几乎不增加计算, 也避免直接优化报告时要用的同一个指标. Table 1 的消融里, 解码器表示和 ROUGE 当相似度, 四个摘要数据集的平均相对增益分别是 3.20% 和 3.26%, 换成不带上下文的 token embedding 只有 1.64%.

校准损失原文试了四种 (原文式 (1)): rank, margin, list rank, expected reward. rank 损失是

$$
L^{\mathrm{cal}}_{\mathrm{rank}}=\max\bigl(0,\beta-\log P_\theta(\hat y_+|x)+\log P_\theta(\hat y_-|x)\bigr) \tag{2}
$$

$\hat y_+$, $\hat y_-$ 是从候选里均匀抽的一对, 满足 $s(\hat y_+)>s(\hat y_-)$. margin 损失把固定间隔 $\beta$ 换成 $\beta$ 乘两者的相似度差; list rank 对排好序的候选两两求和, 间隔按名次差 $\beta|i-j|$ 放大, 也就是 BRIO 的对比损失; reward 损失最大化候选相似度在模型概率下的期望. 消融结果是 rank 4.27%, margin 3.63%, list rank 3.49%, reward 3.47%. 原文由此判断: 候选之间的相对顺序比它们离目标的绝对距离更重要.

正则试了交叉熵和逐 token 的 KL. 前者是普通微调目标, 后者在目标序列上逐 token 拉近 $P_\theta$ 和 $P_{\theta_{ft}}$. 两者平均增益 4.06% 和 4.09%, 去掉正则也有 3.48%, 约保留 85% 的校准收益. 候选解码方式 (beam, diverse beam, nucleus) 之间差别小, 最差的一种也拿到最好一种 90% 的收益, beam search 平均最好.

校准以后, 解码启发式变得可有可无. 原文 Table 2: 只微调的模型去掉长度惩罚 $\alpha$, 平均掉 5.15%; 校准过的模型去掉 $\alpha$ 仍有 3.31%, 加上是 3.42%. 重复率也降了, RedditTIFU-long 上只微调加 $\alpha$ 的重复率 0.90%, 校准后不加 $\alpha$ 是 0.03%. 只微调的模型有一个最优 beam 大小, 超过就变差; 校准过的模型质量随候选数单调上升, 模型规模从 50M 到 2B 都看不到收益递减.

原文推荐的配方是: 按验证集困惑度选微调检查点, 用 beam search 解候选, rank 损失加 KL 正则. SLiC-HF 沿用 rank 损失, 正则改用交叉熵, 理由在 2.1 节.

## 2. SLiC-HF 的损失

### 2.1. 式 (4): 间隔改名 $\delta$, 正则取交叉熵

SLiC-HF 先在 $D_{SFT}$ 上得到 SFT 模型 $P_{\theta_{ft}}$, 再校准. 论文式 (3) 与上面的式 (1) 同形, 选定 rank 校准和交叉熵正则以后, 落到成对人类反馈 $(x,y^+,y^-)\sim D_{HF}$ 上就是论文式 (4):

$$
\mathcal{L}(\theta)=\max\bigl(0,\,\delta-\log P_\theta(y^+|x)+\log P_\theta(y^-|x)\bigr)-\lambda\log P_\theta(y_{\mathrm{ref}}|x) \tag{3}
$$

$\log P_\theta(y|x)=\sum_t\log P_\theta(y_t|x,y_{<t})$ 是整条序列的条件对数似然, 没有除以长度. $\delta$ 是排序间隔, 与式 (2) 的 $\beta$ 是同一个量; 论文第 3.2 节的超参写作 ranking margin $\beta=1.0$. $y_{\mathrm{ref}}$ 是正则目标, $\lambda$ 是正则权重. 第二项带负号, 最小化它就是抬高 $y_{\mathrm{ref}}$ 的似然, 即交叉熵.

论文给交叉熵正则的理由是: 它的作用与 Stiennon 用的 KL 项相近, 都让模型留在 SFT 附近, 但不需要额外加载一份 SFT 权重. 原 SLiC 的消融已经表明 KL 与交叉熵效果相近 (4.09% 对 4.06%), SLiC-HF 选了省内存的一边. 校准期内存里只有正在训练的 $P_\theta$.

### 2.2. hinge 什么时候有梯度

记 $\Delta=\log P_\theta(y^+|x)-\log P_\theta(y^-|x)$. 第一项写成 $\max(0,\delta-\Delta)$ 更直观: 括号里是离间隔还差多少. 对式 (3) 求梯度:

$$
\nabla_\theta\mathcal{L}=\mathbf{1}[\Delta<\delta]\bigl(\nabla_\theta\log P_\theta(y^-|x)-\nabla_\theta\log P_\theta(y^+|x)\bigr)-\lambda\nabla_\theta\log P_\theta(y_{\mathrm{ref}}|x) \tag{4}
$$

$\mathbf{1}[\cdot]$ 是指示函数. 式 (4) 说明两件事. 第一, 间隔已经够大的对, hinge 部分梯度是 0, 只剩正则在动; 不够大的对, 正例和负例的权重都是常数 1, 与差多少无关. 第二, $\nabla\log P_\theta(y|x)$ 是逐 token 梯度之和, 长序列的梯度项多, 一对长摘要在更新里的分量也更大.

手算一组数, 设 $\delta=1$. 当前 $\log P_\theta(y^+|x)=-10$, $\log P_\theta(y^-|x)=-9$, 于是 $\Delta=-1$, hinge 是 $\max(0,1-(-1))=2$, 这对在训练. 若训练后变成 $-8$ 和 $-10$, $\Delta=2$, hinge 是 $\max(0,1-2)=0$, 这对停止更新. 模型不会为了继续拉大差距而把负例的概率往零压.

[DPO](../01-DPO/01-DPO.md) 的梯度权重是 $\sigma(\hat r_l-\hat r_w)$, 随间隔增大平滑变小但始终为正; hinge 在间隔处截断. 两者的另一处差别是自变量: DPO 用相对冻结参考的对数比 $\log(\pi_\theta/\pi_{\mathrm{ref}})$, 式 (3) 直接用 $\log P_\theta$.

### 2.3. 正则目标的两种取法

$y_{\mathrm{ref}}$ 有两种取法 (论文 §2.4). 一种是 $D_{SFT}$ 里的参考摘要; 另一种是 $m$ 条候选里排序器或奖励模型排第一的那条. 第二种在没有人工参考时也能用. Table 1 显示两种取法在 sample-rank 上差别很小 (排序器打序时 86.21% 对 85.51%, 奖励模型打序时 82.42% 对 83.52%), 校准不依赖人写的那条摘要.

![当前策略对三条序列算对数似然, hinge 与 CE 合成总损失](./images/fig-slic-hinge-ce-loss.png)

**图 1 解析**

- 节点从左到右: 输入 $x$, 正在校准的 T5 模型 $P_\theta$, 三个对数似然框 $\log P(y_+|x)$, $\log P(y_-|x)$, $\log P(y_{\mathrm{ref}}|x)$, 校准项 $\mathcal{L}^{\mathrm{cal}}$, 交叉熵框, 总损失 $\mathcal{L}$. 三个对数似然都由同一个 $P_\theta$ 算出.
- 上面两个对数似然汇入 $\mathcal{L}^{\mathrm{cal}}=\max(0,\delta-\log P_++\log P_-)$, 对应式 (3) 第一项; 第三个进交叉熵 $-\lambda\log P(y_{\mathrm{ref}}|x)$, 对应第二项. 交叉熵到总损失的虚线表示辅助正则.
- 图中只有一个模型, 没有冻结的 $\pi_{\mathrm{ref}}$, 底部写明没有 KL 项. 图里也没画正负对从哪来, 那是 3.1 节.

## 3. 正负对从哪来

### 3.1. sample-rank 与 direct

式 (3) 假定已有 $(y^+,y^-)$. 论文给了两条路, 工程量差别很大.

**SLiC-HF-sample-rank** (§2.2). 在 $D_{SFT}$ 训练集上, 从 SFT 模型采 $m$ 条候选, 主实验 $m=8$, 温度 0.7, top-$k$ 为 40. 再用一个在 $D_{HF}$ 上训好的打分模型给候选排序, 抽出正负对. 候选来自正在校准的模型的初始状态, 和训练分布接近; 打分模型学的是 Stiennon 那批模型输出上的人类偏好. 论文摘要称这类数据为 off-policy, 类似离线 RL 数据. 打分在训练环外一次跑完, 校准循环里不再调用打分模型.

**SLiC-HF-direct** (§2.3). 直接把 $D_{HF}$ 里的人标对放进式 (3), 不训打分模型, 也不从自己的模型解码. 工程上和再做一次微调差不多. 代价是 $D_{HF}$ 的摘要来自别的模型, 分布可能与当前 T5 的解码差得远. §3.4.2 的观察是: direct 的校准损失按预期下降, 序列长度却持续上涨, 不收敛到稳定值; sample-rank 稳定收敛. 论文的猜测是 direct 容易受其他模型生成的分布外样本影响. 用排序器挑检查点, direct 仍有 82.92% 的胜率, 接近 sample-rank, 论文把它推荐为快速试验的选项.

direct 没有自己的候选, 正则目标只能用 SFT 参考; sample-rank 两种正则目标都可以用.

![sample-rank 从 SFT 采样再打序, direct 直接用离线人标对](./images/fig-slic-sample-rank-vs-direct.png)

**图 2 解析**

- 两列各自独立, 列间没有连线. 左列 L0 到 L3 是 sample-rank: SFT 解出 $m$ 条候选, 点式奖励模型 (Good/Bad) 或成对排序器打序, 选出 $y^+$, $y^-$, 最后在 $P_\theta$ 上算 hinge 加 CE.
- 右列 R0 到 R2 是 direct: 从 $D_{HF}$ 取离线对, 正负已经标好, 直接算 hinge 加 CE, 训练时没有排序器.
- 两列底部的损失是同一个式 (3), 区别只在数据入口. 图里没有标 $m$, 温度这些超参, 数值见本节正文.

### 3.2. 点式奖励模型和成对排序器

sample-rank 的打分模型也是 text-to-text 的 T5. 消融里生成器用 T5-Large (770M), 排序器和奖励模型用 T5-XXL (11B); 脚注写道, 更小的 T5 排序器或奖励模型在他们的设置里收敛不可靠. 生成模型 batch 32, 打分模型 batch 128, 学习率都是 $10^{-3}$. SFT 按 $D_{SFT}$ 验证集困惑度最低选检查点, 打分模型按 $D_{HF}$ 验证集准确率最高选.

**点式奖励模型**. 参照 Askell 等 2021, 每条人标对拆成一个正例和一个负例. 输入格式是 `[CONTEXT] 文档 [SUMMARY] 摘要`, 目标是 `Good` 或 `Bad`. 推断时取解码端 `Good` 这个 token 的概率给 $m$ 条候选打分, 再从中抽 $m$ 个正负对.

**成对排序器**. 输入是 `[CONTEXT] 文档 [SUMMARY A] 摘要 [SUMMARY B] 摘要`, 目标是 `A` 或 `B`. 推断用淘汰赛: 4 条候选 $c_1,\dots,c_4$ 先比 $c_1$ 与 $c_2$, $c_3$ 与 $c_4$, 再比两个胜者. $m$ 条候选调用 $m-1$ 次, 产出 $m-1$ 个正负对. 全部两两比较要 $\binom{m}{2}$ 次, $m=8$ 时是 28 次, 淘汰赛是 7 次.

$D_{HF}$ 验证集上, 排序器准确率 73.23%, 点式奖励模型 71.34%, 低约 2 个点; 脚注说两者与 Stiennon 的 6B 奖励模型准确率相近. 论文 §4.2 的解释是: 人标本来就是并排比较两条, 成对排序器和标注方式同构; 点式奖励模型要把成对判断压成单点分数, 中间引入噪声, 两种模型的准确率差可以当作这份噪声的估计. Table 1 里 sample-rank 用排序器比用奖励模型高约 3 个胜率点, 方向与准确率差一致.

## 4. TL;DR 实验与人评

### 4.1. 数据与超参

数据来自 Stiennon 等的 Reddit TL;DR. $D_{SFT}$ 是过滤过的 TL;DR, 训练, 验证, 测试分别 117k, 6k, 6k; $D_{HF}$ 是 64k 条人类偏好, 摘要来自多个模型. 全部实验在 T5x 框架里跑. 校准学习率 $10^{-5}$, 比 SFT 和打分模型的 $10^{-3}$ 低两个数量级; 间隔 1.0. 评测解码用 beam 4. 自动指标是 T5-XXL 排序器判定模型摘要优于人类参考的比例, 参考自己记 50%.

ROUGE 只作参考, 不用来选模型. 学人类偏好以后, 模型不再被激励去贴近参考, ROUGE 下降在预期之内; 平均长度上涨, 和 Stiennon 的 RLHF 观察一致, 所以人评另做了按长度分桶的比较.

### 4.2. Table 1: 几种用人类反馈的方式

Table 1 比较了几种用人类反馈的方式, 生成器都是 770M:

| 方法 | 反馈形式 | 正则目标 | 词数 | R1 / R2 / RL | 排序器胜率 |
|------|----------|----------|-----:|--------------|-----------:|
| 参考摘要 | - | - | 27.11 | - | 50% |
| SFT | - | - | 23.57 | 35.1 / 12.87 / 26.81 | 44.96% |
| 继续 SFT | 人标正例 | - | 31.22 | 33.02 / 11.27 / 24.57 | 51.65% |
| 继续 SFT | 8 选 1, 奖励模型 | - | 27.69 | 35.31 / 12.41 / 26.21 | 63.24% |
| 继续 SFT | 8 选 1, 排序器 | - | 28.26 | 35.39 / 12.69 / 26.56 | 65.43% |
| SLiC-HF-direct | 离线人标对 | SFT 参考 | 41.03 | 33.76 / 11.58 / 24.72 | 82.92% |
| sample-rank, 奖励模型 | 自己的候选 | SFT 参考 | 38.44 | 33.87 / 11.48 / 24.81 | 82.42% |
| sample-rank, 奖励模型 | 自己的候选 | 最优候选 | 38.58 | 34.07 / 11.59 / 24.92 | 83.52% |
| sample-rank, 排序器 | 自己的候选 | SFT 参考 | 37.96 | 34.49 / 11.92 / 25.35 | 86.21% |
| sample-rank, 排序器 | 自己的候选 | 最优候选 | 37.50 | 34.69 / 12.03 / 25.54 | 85.51% |

逐行看:

- **只用人标正例继续 SFT**: 44.96% 到 51.65%. 论文特意没有过滤人标质量, 模拟手里有一批质量未知的反馈的情况. 负例扔掉, 增益很有限.
- **8 选 1 再 SFT**: 用排序器或奖励模型从 8 条候选里挑最好的再微调, 到 63.24% 和 65.43%. 这一步和 [RAFT](../../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md) 的做法相同, 只克隆第一名.
- **SLiC-HF**: 全部在 82% 以上. 同样的 8 条候选, 负例进入 hinge 以后多出约 20 个点. 论文 §3.4.3 还写道, 在最优候选上继续 SFT 的增益不能和 SLiC-HF 叠加.
- **direct**: 41.03 词, 全表最长, 与 3.1 节长度不收敛的观察一致.

### 4.3. 人评: 四路并排

人评走众包 (Amazon Mechanical Turk). 每个任务给一篇文档和 2 到 4 条摘要, 标注者给每条打整体质量分, 判断是否符合事实, 再选最好的一条. 每个任务 3 人, 模型匿名, 顺序打乱; 质量分取三人平均, 最佳选择取多数票.

四路比较从验证集抽 100 条, 系统是参考摘要, SFT, 继续 SFT (排序器挑最优候选), SLiC-HF (sample-rank, 排序器, 正则目标为最优候选). Table 2:

| | 参考 | SFT | 继续 SFT | SLiC-HF | 相同 |
|--|-----:|----:|---------:|--------:|-----:|
| 被选为最好 | 13% | 5% | 5% | 73% | 4% |
| 平均质量 | 3.17 | 3.10 | 3.32 | 3.82 | - |
| 符合事实 | 94.16% | 94.85% | 94.85% | 96.56% | - |

SLiC-HF 被选为最好的比例是 73%, 质量分和事实性也最高, 平均质量的顺序与 Table 1 的排序器胜率一致. 继续 SFT 把质量从 3.10 抬到 3.32, 被选为最好的比例仍是 5%. 论文 Figure 2 按摘要相对参考的长度分桶算平均质量, 每个长度桶里 SLiC-HF 都高于另外两个模型, 增益不能全归到写得更长.

### 4.4. 人评: 对 Stiennon 的 6B PPO

正确实现并调好 Stiennon 的 PPO 不容易, 论文没有在自己的框架里重做, 而是直接和 Stiennon 公开的模型输出比较. 两两并排, Table 3, 带 * 的结果统计显著:

| 系统 A (本文) | 词数 | 系统 B (Stiennon) | 词数 | A 胜 | B 胜 | A 质量 | B 质量 |
|---------------|-----:|-------------------|-----:|-----:|-----:|-------:|-------:|
| SFT (770M) | 23.7 | SFT (6B) | 24.6 | 56% | 44% | 3.59 | 3.48 |
| SLiC-HF (11B 排序器) | 36.9 | RLHF-PPO (6B) | 33.0 | 66%* | 34%* | 3.85* | 3.61* |
| SLiC-HF (11B 奖励模型) | 38.4 | RLHF-PPO (6B) | 33.0 | 56% | 44% | 3.78 | 3.70 |

Table 3 把本文生成器写作 700M, 正文和其他各表是 T5-Large 770M, 指同一个模型.

第一行是比较的前提: 770M 的 T5 SFT 和 6B 仅解码器的 SFT 质量相近, 本文略高但不显著. T5-Large 是编码器-解码器结构, 与 6B 的结构不同, 这一行表明后两行的差距来自校准, 起点基本持平.

第二行, 用 11B 排序器造对, 对 6B PPO 胜率 66% 对 34%, 质量 3.85 对 3.61, 都显著. SLiC-HF 的摘要更长 (36.9 对 33.0 词), 论文 Figure 3 按长度控制以后, 胜率与 PPO 相近. 所以显著的是不控长度的总体偏好.

第三行, 换成 11B 点式奖励模型, 56% 对 44%, 不显著, 与 PPO 打平. 论文摘要说 SLiC-HF 至少和 6B PPO 一样好, 依据是第二, 三行合起来. 还要注意 11B 用在打分模型上: 生成器是 770M, 造对时借了一个更大的排序器. 这个排序器只在训练环外跑, 校准时可以不在内存里.

## 5. 放大与成本

### 5.1. 放大哪个维度

Table 4 仍是 sample-rank:

| 方法 | 参数量 | $m$ | 词数 | R1 / R2 / RL | 排序器胜率 |
|------|------:|----:|-----:|--------------|-----------:|
| SFT | 770M | 8 | 23.57 | 35.1 / 12.87 / 26.81 | 44.96% |
| SFT | 11B | 8 | 24.07 | 36.45 / 14.11 / 28.38 | 62.34% |
| SLiC-HF | 770M | 8 | 37.96 | 34.49 / 11.92 / 25.35 | 86.21% |
| SLiC-HF | 770M | 64 | 40.53 | 34.14 / 11.70 / 25.11 | 86.41% |
| SLiC-HF | 11B | 8 | 36.90 | 35.83 / 12.87 / 26.63 | 96.10% |

生成器从 770M 加到 11B, SFT 从 44.96% 到 62.34%, SLiC-HF 从 86.21% 到 96.10%. 候选数从 8 加到 64, 胜率只多 0.2 个点, 词数从 37.96 涨到 40.53. 11B SLiC-HF 的摘要 (36.90 词) 比 770M 的 (37.96 词) 还短, 胜率却高出约 10 个点, 这一步长度解释不了. 同样的算力, 加在生成器参数上比加在候选数上有效.

### 5.2. 训练期成本

Table 5 对比训练期开销, $p$ 是策略网络参数量:

| | RLHF-PPO (Stiennon) | SLiC-HF sample-rank | SLiC-HF direct |
|--|---------------------|---------------------|----------------|
| 辅助模型 | 奖励, 价值, SFT | 排序器 | 无 |
| 训练时参数内存 | $4p$ | $p$ | $p$ |
| 每步更新参数 | $2p$ | $p$ | $p$ |
| 解码并行 | 只在 batch 内 | 整个训练集 | - |
| 奖励并行 | 只在 batch 内 | 整个训练集 | - |
| 输入编码缓存 | 无 | 有 | - |

PPO 一侧, 策略, 价值, 奖励, SFT 四个模型在 Stiennon 的设置里一样大, 都在训练环里用, 通常全部驻留硬件内存; 每步要更新策略和价值两份参数. Stiennon 发现策略和价值网络分开效果明显更好, 这就多出一个与奖励模型同样大的辅助模型. SLiC-HF 的打分在训练环外并行算完, 训练期模型权重只占约四分之一的内存, 省下的内存可以用来训更大的生成器, Table 4 的 11B 一行就是这种用法.

解码也省时间. Stiennon 报告 RLHF 训练用了约 1M 个 episode, SLiC-HF 每条训练样本解 8 条, 总解码量在同一量级. PPO 每个 batch 都更新策略, 后续解码要等更新完成, 并行度被限制在一个 batch 内 (Stiennon 用 512); 解码还发生在训练环里, 每一步时间很长. SLiC-HF 的候选都来自同一个冻结的 SFT 模型, 可以对整个训练集并行解码, 校准步的耗时和普通微调相当. 同一输入的 $m$ 条候选共享编码器状态, 可以缓存. 摘要任务的输入往往比输出长得多, 这部分节省很可观.

### 5.3. 论文对增益来源的两点猜测

§4.2 和 §4.3 给了两点猜测, 都没有单独的实验. 第一, 强化学习默认奖励是单点的, 人标却是成对收集的, 转换中引入噪声; SLiC-HF 只关心两条摘要的相对名次, 绕开了这一步. 第三行点式路径对 PPO 不显著, 第二行成对路径显著, 方向与这个猜测一致. 第二, 在语言上做强化学习时, 状态是当前前缀, 动作是下一个 token, 价值函数要从前缀估计整段摘要的好坏, 这对人来说也很难判断, 价值估计带有噪声. SLiC-HF 不用价值网络, 只用两条完整序列的偏好驱动更新.

相关工作里, BRIO (Liu 等 2022) 也按奖励给候选排序, 用长度归一的序列概率和 listwise 损失, 排序依据是与参考的 ROUGE. SLiC-HF 的排序依据换成预测人类偏好的模型. 论文还指出, 把人类偏好换成 AI 反馈 (Bai 等 2022 的 Constitutional AI) 可以直接代入同一个式 (3), 但没有做 AI 反馈的实验.

## 6. 与邻近方法的关系和边界

### 6.1. 与邻近方法对照

2023 年前后几种方法都用成对或多路排序代替 PPO, 区别落在三个维度上: 分数怎么定义, 损失是什么形状, 要不要冻结参考.

| 方法 | 分数 | 损失 | 冻结参考 | 额外项 |
|------|------|------|----------|--------|
| PPO | 奖励模型 $r_\phi$ | clip 代理目标 | 要, 另有价值网络 | KL 进奖励 |
| [DPO](../01-DPO/01-DPO.md) | $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$ | $-\log\sigma$ | 要 | 无 |
| [IPO](../02-IPO-身份偏好优化/02-IPO-身份偏好优化.md) | 同 DPO 的对数比 | 平方, 目标 $\tau^{-1}/2$ | 要 | 无 |
| [RRHF](../07-RRHF-排序响应对齐/07-RRHF-排序响应对齐.md) | 长度归一 $\log\pi$ | 无间隔 hinge | 不要 | 奖励最高者的 SFT |
| [RAFT](../../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md) | 奖励模型排序 | 只对第一名 CE | 不要 | 无 |
| SLiC-HF | 未归一 $\log P_\theta$ | 有间隔 hinge | 不要 | 对 $y_{\mathrm{ref}}$ 的 CE |

和 DPO 比, 两篇都是 2023 年 5 月的 arXiv (SLiC-HF 2305.10425, DPO 2305.18290). DPO 从带 KL 约束的 RLHF 目标反解出隐式奖励, 配分函数 $Z(x)$ 在成对差里消去, 损失是 Bradley-Terry 的交叉熵, 训练要一份冻结参考出对数比. 式 (3) 里只有 $\log P_\theta(y^\pm)$ 本身, 没有参考, 没有 $\sigma$, 正则是交叉熵.

和 RRHF 比, Yuan 等 2023 的分数是除以长度的平均对数概率, hinge 间隔为 0, 另对奖励最高的回答做 SFT. 式 (3) 的序列对数似然不除长度, 间隔是 $\delta$, 交叉熵的目标是 SFT 参考或最优候选.

和 IPO 比, IPO 仍用成对数据和冻结参考, 把对数比之差回归到 $\tau^{-1}/2$. 间隔超过目标时平方损失会往回拉; hinge 在间隔之外梯度为 0.

和 RAFT 比, RAFT 采 $K$ 条只对奖励最高者做交叉熵, 其余丢弃; SLiC-HF 的负例进入 hinge. Table 1 的 8 选 1 再 SFT 就是 RAFT 式的做法, 比 SLiC-HF 低约 20 个点.

### 6.2. 失效与边界

最常见的误读是把式 (3) 当成某种 DPO. 两者的差别在 6.1 节的表里, 实现时搞混, 会凭空多加载一份参考模型, 或者把 hinge 写成 $\log\sigma$.

数据方面:

- **direct 的长度失控**. 离线人标的摘要来自别的模型, 校准损失降, 长度不收敛. 用排序器选检查点可以缓解, 但收敛性不如 sample-rank.
- **打分模型规模**. 小于 11B 的 T5 排序器或奖励模型在论文设置里收敛不可靠, sample-rank 的造对成本里要算上一个 11B 模型的训练和推断.
- **点式和成对的差距**. 点式奖励模型准确率低 2 个点, 对 PPO 的人评不显著.
- **增加候选数几乎无效**. $m$ 从 8 到 64, 胜率多 0.2 个点.

超参方面, 间隔 $\delta$ 在 SLiC-HF 里只报了 1.0, 没有扫描. 原 SLiC 的 $\beta$ 是按损失类型凭经验选的. 若 $\delta$ 太小, 大部分对很快越过间隔, 只剩正则在训练; 若太大, 几乎每对都留在 hinge 的线性段, 正负例被持续推开, 这一段推理是从式 (4) 读出来的, 论文没有对应实验.

评测方面, 自动指标是一个 T5-XXL 排序器, 和造对用的排序器同一类型, 论文用人评核对了选定的设置. 摘要变长以后 ROUGE 下降, 用 ROUGE 选检查点会选到校准不足的模型.

适用范围方面, 实验只有 Reddit TL;DR 摘要, 生成器最大 11B, 没有对话或指令跟随的主表. hinge 对标注噪声没有特别的鲁棒性: 一对标反了的样本, 只要还在间隔内, 就会按错误方向训练. 方法前提是手里有成对偏好, 只有单条好坏标签时式 (3) 没有输入; 需要在线探索或可验证的多步奖励时, 仍要用 [PPO](../../../4.4-强化学习基础/04-PPO/04-PPO.md) 一类在线方法.

## 参考文献

1. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425). arXiv:2305.10425.
2. Zhao, Y., Khalman, M., Joshi, R., Narayan, S., Saleh, M., & Liu, P. J. (2023). [Calibrating Sequence Likelihood Improves Conditional Language Generation](https://arxiv.org/abs/2210.00045). *ICLR 2023*.
3. Stiennon, N., et al. (2020). [Learning to summarize with human feedback](https://arxiv.org/abs/2009.01325). *NeurIPS*.
4. Raffel, C., et al. (2020). [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://arxiv.org/abs/1910.10683). *JMLR*.
5. Roberts, A., et al. (2022). [Scaling Up Models and Data with t5x and seqio](https://arxiv.org/abs/2203.17189).
6. Askell, A., et al. (2021). [A General Language Assistant as a Laboratory for Alignment](https://arxiv.org/abs/2112.00861).
7. Liu, Y., Liu, P., Radev, D., & Neubig, G. (2022). [BRIO: Bringing Order to Abstractive Summarization](https://aclanthology.org/2022.acl-long.207/). *ACL*.
8. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
9. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
10. Yuan, Z., et al. (2023). [RRHF: Rank Responses to Align Language Models with Human Feedback without tears](https://arxiv.org/abs/2304.05302). *NeurIPS*.
11. Azar, M. G., et al. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS*.
12. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767).
13. Völske, M., Potthast, M., Syed, S., & Stein, B. (2017). TL;DR: Mining Reddit to Learn Automatic Summarization. *Workshop on New Frontiers in Summarization*.
