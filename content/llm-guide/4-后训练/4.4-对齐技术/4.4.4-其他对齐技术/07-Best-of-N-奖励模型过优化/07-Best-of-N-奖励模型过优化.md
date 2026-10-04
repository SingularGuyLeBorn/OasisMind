---
title: "07 · Best-of-N:奖励模型过优化"
published: true
tags: ["Best-of-N", "BoN", "过优化", "Goodhart", "奖励模型", "RLHF", "PPO"]
excerpt: "Gao 等用 6B 金标奖励模型代替人类, 测量 Best-of-n 与 PPO 两种优化方式下代理奖励被过度优化时金标分如何随 KL 先升后降, 并给出两条随奖励模型规模平滑变化的函数形式."
---
# 07 Best-of-N:奖励模型过优化

材料是 Gao, Schulman, Hilton 的 *Scaling Laws for Reward Model Overoptimization* ([arXiv:2210.10760](https://arxiv.org/abs/2210.10760)). 问题是: 用 Best-of-$n$ (BoN) 或 PPO 对一个学出来的奖励模型 (RM) 优化时, 真实质量随优化程度怎样变化, 这种变化如何随 RM 规模, 数据量和策略规模改变.

## 1. 问题: 对着代理优化, 真目标会掉

RLHF 里人类偏好标注昂贵, 实际优化的是学出来的 RM. RM 只是人类偏好的近似, 对它优化到一定程度后, 真正关心的质量开始下降, 论文把这称为过优化 (overoptimization). 这是 Goodhart 定律在 RLHF 里的形态: 一个度量被当成优化目标后, 它与原本想度量的东西逐渐分离.

现象早就被观察到, 缺的是定量规律: 金标分随优化程度怎样下降, 下降的速度如何随 RM 大小, 数据量, 策略大小变化. 测量这些规律需要大量评估, 每次都请人标注不现实. 论文的办法是合成设定: 固定一个大的 RM 当「人」, 由它生成偏好标签, 训练一批更小的代理 RM; 优化只看代理分, 评估时再用金标 RM 给同一批回答打分. 两条曲线分叉的位置和形状就是要拟合的对象.

优化有两条路. 一条是 BoN, 推理阶段采 $n$ 条取最高分; 另一条是 [PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md), 除第 7 节那组实验外 KL 惩罚设为 0. 两条路都会过优化, 曲线的函数形状不同.

## 2. Best-of-n 与它的 KL

### 2.1 选择规则

对 prompt $x$, 从策略 $\pi$ 独立采 $y_1,\dots,y_n$, 用冻结的代理 RM 打分, 保留

$$
y^\star(x)=\arg\max_{j\le n}\ r_{\mathrm{proxy}}(x,y_j).
\tag{1}
$$

没有梯度, 没有优势, 没有裁剪. 其余 $n-1$ 条只参与比较. 成本在推理: 每回答一次要生成 $n$ 条并打 $n$ 次分. WebGPT 和 Stiennon 等的摘要工作都把 BoN 当强基线. Gao 等关心的是另一面: BoN 的优化强度只由 $n$ 决定, KL 有闭式, 适合拿来做标度实验.

![同一 prompt 采 n 条,代理 RM 打分后取 argmax;解码选择,无反向传播](./images/fig-bon-select-max.png)

> 图 1: 同一 prompt 采 $n$ 条, 代理 RM 给每条打分, 取 $\arg\max$. 虚线框标明这是解码阶段的选择, 没有反向传播.

**图 1 解析**

- 从左到右依次是 prompt $x$, 从 $\pi$ 采样 $n$ 条, 候选 $y_1,\dots,y_n$, 代理 RM 打分, $\arg\max$, 输出 $y^\star$.
- 候选是一次性采出的 $n$ 条, 图里没有「更新后再采」的回边, 策略参数全程不变.
- $\arg\max$ 下方的虚线框写着 decode-time only / no backprop, 计算到这里结束.
- 图中没有价值网络, 也没有交叉熵损失. 把 $y^\star$ 拿去做 SFT 就成了 [RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md), 把 BoN 分布蒸馏进策略就是 [BOND](../09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md).

### 2.2 KL 闭式

BoN 输出分布相对 $\pi$ 的 KL 有解析式 (Stiennon 等附录 G.3):

$$
\mathrm{KL}_{\mathrm{bon}}=\log n-\frac{n-1}{n}.
\tag{2}
$$

几个取值 (单位 nat):

| $n$ | $\mathrm{KL}_{\mathrm{bon}}$ |
|---:|---:|
| 1 | $0$ |
| 4 | $\log4-0.75\approx0.64$ |
| 16 | $\log16-0.9375\approx1.83$ |
| 1000 | $\approx5.91$ |
| 60000 | $\approx10.0$ |

式 (2) 可以直接推出来. 假设奖励没有并列, 记 $F(y)$ 为 $\pi$ 下奖励不超过 $r(y)$ 的概率. $n$ 个样本的最大值落在 $y$ 的概率是 $\pi_{\mathrm{bon}}(y)=n\,F(y)^{n-1}\pi(y)$, 所以

$$
\mathrm{KL}(\pi_{\mathrm{bon}}\Vert\pi)=\mathbb{E}_{y\sim\pi_{\mathrm{bon}}}\bigl[\log n+(n-1)\log F(y)\bigr].
\tag{2a}
$$

在 $\pi_{\mathrm{bon}}$ 下, $U=F(y)$ 是 $n$ 个均匀随机数的最大值, 密度为 $nu^{n-1}$, 于是 $\mathbb{E}[\log U]=\int_0^1 nu^{n-1}\log u\,du=-1/n$. 代回式 (2a) 得到 $\log n-(n-1)/n$. 结果与奖励分布的具体形状无关, 只依赖 $n$, 所以 BoN 的优化强度可以用 $n$ 精确控制.

$n$ 每扩大 $e$ 倍, KL 大约只加 1 nat. 要把 KL 从 6 推到 10, $n$ 要从 1000 涨到 60000. 换成第 4 节使用的 $d=\sqrt{\mathrm{KL}}$, 四个 $n$ 对应 $d\approx0.80, 1.35, 2.43, 3.16$; 从 $n=1000$ 到 $n=60000$, 采样量增加 60 倍, $d$ 只增加约 30%. BoN 是一种 KL 上很节省, 算力上很昂贵的优化方式.

中间各个 $n$ 的平均分怎么估? 朴素做法是采一个大池, 对每个 $n$ 有放回抽 $n$ 条取最大再平均, 方差大且重复计算. 论文用 Nakano 等 (WebGPT) 附录 I 的无偏估计量, 基于池内样本的顺序统计量直接算出所有 $n$ 的期望最大值. BoN 不改策略参数, 换 $n$ 或换代理 RM 都不必重新训练; 同一个样本池先用代理 RM 排序, 再用金标 RM 打分, 就能得到整条曲线. 这让 BoN 的标度实验比 RL 便宜得多, RL 的每个设置都要单独跑一次训练.

RL 没有类似闭式. PPO 每一步在上一步策略的基础上改动, 不加 KL 惩罚时 $\mathrm{KL}_{\mathrm{RL}}$ 随训练步数大致二次增长 (Figure 14, 16).

## 3. 实验设定

### 3.1 环境与金标

环境与 InstructGPT 相同: prompt 是各类自然语言指令, 策略写回答, RM 输出标量分. 初始策略是 GPT-3 系列检查点, 在 InstructGPT 的人工示范上 SFT 2 个 epoch. RM 是 GPT-3 架构加标量头.

金标 RM 是 Ouyang 等 InstructGPT 的 6B 奖励模型. 代理 RM 从 3M 到 3B; 更小的两个接近随机, 偏离趋势, 被剔除. 合成比较数据共 100000 条, 留 10% 做验证, 训练集 90000 条. 标签是确定性的硬阈值: 同一 prompt 下金标分高的一条总是胜出. 作者试过按金标置信度采样标签, 结果噪声更大.

### 3.2 归一化

RM 分数平移不变. 为了跨模型可比, 每个 RM 都重新居中, 使初始策略的平均奖励为 0, 所以所有曲线满足 $R(0)=0$. 金标分还做了单位方差归一化, 作者事后认为这一步不必要. 硬标签不含置信度信息, 代理 RM 因此未校准; 实验结束后, 用软标签验证集重新缩放代理 logits, 使交叉熵最小. 缩放不影响 BoN 的 $\arg\max$; 对 RL, Adam 对损失尺度不敏感, 作者认为大概率也没有影响.

### 3.3 超参

附录 C: RM 训练 batch 64, 学习率乘数 $1.67\times10^{-2}$; RL 的 batch 256, 学习率乘数 $4\times10^{-3}$, PPO clip $0.2$, 每次 rollout 256 个 timestep, 每个 epoch 128 个 minibatch, GAE 参数 $0.95$. 超参大多沿用默认值, 作者提醒换一组超参趋势可能变化.

## 4. 两个函数形式

### 4.1 用 $\sqrt{\mathrm{KL}}$ 做横轴

KL 在小扰动下是二次的 (Bai 等 2022 也用了这个观察). 论文定义

$$
d:=\sqrt{D_{\mathrm{KL}}(\pi\,\Vert\,\pi_{\mathrm{init}})},
\tag{3}
$$

以 $d$ 为自变量写金标分:

$$
R_{\mathrm{bon}}(d)=d\,(\alpha_{\mathrm{bon}}-\beta_{\mathrm{bon}}d),
\tag{4}
$$

$$
R_{\mathrm{RL}}(d)=d\,(\alpha_{\mathrm{RL}}-\beta_{\mathrm{RL}}\log d),
\tag{5}
$$

约定 $R(0)=0$. $\alpha$, $\beta$ 随代理 RM 规模和数据量变化.

### 4.2 峰值在哪里

式 (4) 是开口向下的抛物线. 令 $dR_{\mathrm{bon}}/dd=\alpha-2\beta d=0$, 峰值在

$$
d^\star_{\mathrm{bon}}=\frac{\alpha_{\mathrm{bon}}}{2\beta_{\mathrm{bon}}},\qquad
R^\star_{\mathrm{bon}}=\frac{\alpha_{\mathrm{bon}}^2}{4\beta_{\mathrm{bon}}}.
\tag{6}
$$

论文 Figure 12 用这个闭式预测不同 RM 规模下的金标峰值. 代入一组示意数值: $\alpha=1$, $\beta=0.25$, 则 $d^\star=2$, 即 $\mathrm{KL}^\star=4$ nat; 由式 (2) 解 $\log n-(n-1)/n=4$ 得 $n\approx147$. 也就是说, 用这个代理 RM 做 BoN, 采 150 条左右金标分最高, 再增加 $n$ 只会更差. $\beta$ 减半到 $0.125$, $d^\star$ 翻倍到 4, $\mathrm{KL}^\star=16$ nat, 对应的 $n$ 约为 $2.4\times10^7$. $\beta$ 的小变化在 $n$ 上是指数级的差别.

式 (5) 求导得 $\alpha-\beta\log d-\beta=0$, 峰值在 $d^\star_{\mathrm{RL}}=\exp(\alpha_{\mathrm{RL}}/\beta_{\mathrm{RL}}-1)$, 峰值分 $R^\star_{\mathrm{RL}}=\beta_{\mathrm{RL}}d^\star_{\mathrm{RL}}$. 峰值位置对 $\alpha/\beta$ 是指数敏感的: $\alpha/\beta$ 从 4 降到 3, $d^\star$ 从 $e^3\approx20.1$ 缩到 $e^2\approx7.4$, 对应的 KL 从约 403 nat 缩到约 55 nat. 两个形式在小 $d$ 处的差别也很大. BoN 的斜率在原点是有限的 $\alpha_{\mathrm{bon}}$; RL 的斜率 $\alpha-\beta-\beta\log d$ 在 $d\to0$ 时趋于无穷, 模型预言最初一点点 KL 就能换来很大的金标增益. 附录 B 把这一点列为式 (5) 的缺陷, 所以 RL 曲线最靠近原点的一段不宜用式 (5) 外推.

### 4.3 形式的来历与缺陷

BoN 的形式是看着 $n\le1000$ (KL 约 6) 的数据猜出来的, 猜完才跑 $n=60000$ (KL 约 10) 去验证, 属于事先预测. 式 (5) 在原点斜率无穷大, 附录 B 承认这一点, 试过 $d(\alpha-\beta\log(1+d))$ 和幂律 $d(\alpha-\beta d^\gamma)$: 前者原点斜率有限但外推更差, 后者在 $\gamma$ 很小时又逼近对数形式. 正文因此保留式 (5).

### 4.4 从少量点估计系数

两个形式都可以化成线性回归. 式 (4) 两边除以 $d$ 得 $R_{\mathrm{bon}}/d=\alpha-\beta d$, 以 $d$ 为横轴画 $R/d$, 截距是 $\alpha$, 斜率是 $-\beta$. 式 (5) 除以 $d$ 得 $R_{\mathrm{RL}}/d=\alpha-\beta\log d$, 以 $\log d$ 为横轴同样是直线. 举一组示意数据: BoN 在 $n=4$ 和 $n=16$ 测得金标分 $0.70$ 和 $1.12$. 由表中 KL 得 $d=0.80$ 和 $1.35$, $R/d$ 分别是 $0.878$ 和 $0.827$, 斜率约 $-0.091$, 截距约 $0.95$. 按式 (6) 外推, 峰值在 $d^\star\approx5.2$, 即 KL 约 27 nat, 已远超论文验证过的范围 (KL 到 10), 此时外推不可信. 论文的做法是用 $n\le1000$ 的多组点拟合, 再去预测 $n=60000$, 外推距离比这个例子小得多.

这种拟合要求金标或人工评估, 正是实际系统里拿不到的东西. 论文的价值在于给出了系数随 RM 规模和数据量变化的方向: 在同一套数据和训练流程下, 换更大的 RM, $\beta$ 下降, 最优 $n$ 和最优 KL 都往后移.

代理分没有找到同样好的拟合. BoN 的代理分接近过原点的直线, 但 Figure 20 显示线性拟合并不好. 两种方法的代理分在大 KL 下都被低估, 后期大致随 $\sqrt{\mathrm{KL}}$ 线性增长, 与 Bai 等的观察一致.

## 5. RM 规模的标度

### 5.1 主结果

Figure 1 固定策略为 1.2B, 数据量 90000, 只扫代理 RM 规模. 代理分持续上升时, 金标分先升后降. 代理 RM 越大, 金标峰值越高, 出现得越晚.

§3.2 拟合系数: BoN 的 $\alpha_{\mathrm{bon}}$, $\beta_{\mathrm{bon}}$ 随 RM 参数量平滑变化, 接近对数关系. RL 可以把 $\alpha_{\mathrm{RL}}$ 在所有 RM 规模上取同一个常数, 只让 $\beta_{\mathrm{RL}}$ 变. 按式 (5), 这意味着 RL 早期每单位 $d$ 换来的金标增益与代理 RM 的规模基本无关, RM 规模决定的是增益多快被 $\beta\log d$ 吃掉, 也就是峰值出现得多早. 用同样的函数拟合代理分, $\beta$ 小得多, 说明代理曲线接近单调上升, 弯下来的是金标曲线.

![BoN 与 RL 两条过优化路径:代理单调升,金标先升后降,函数形状不同](./images/fig-bon-vs-rl-overopt.png)

> 图 2: 横轴是 $d=\sqrt{\mathrm{KL}}$. 上栏 BoN, 下栏 RL. 代理分一路上升, 金标分越过峰值后下降. BoN 的形式是 $d(\alpha-\beta d)$, RL 是 $d(\alpha-\beta\log d)$. 示意图, 没有拟合点.

**图 2 解析**

- 两栏都从 $d=0$, $R=0$ 出发, 对应第 3.2 节的重新居中.
- 浅蓝框是代理和金标一起上升的阶段. RL 栏标注「在 KL 上更慢」, 对应第 6 节: 同样的金标涨幅, RL 消耗的 KL 更多.
- 桃色框是金标峰值, 这时代理分还在涨.
- 浅红框里代理继续升, 金标下降, 就是过优化区.
- 右端两个公式框形式不同, 上栏是 $d$ 的二次式, 下栏含 $\log d$. 图中没有具体的 $\alpha,\beta$ 数值.

### 5.2 一个具体样本

附录 Table 2 给出一个 prompt 在不同 $n$ 下被选中的回答 (策略 1.2B, 代理 RM 12M). 问题是「What is full of holes but still holds water?」, 标准答案是海绵.

| $n$ | 选中的回答 | 代理分 | 金标分 |
|---:|---|---:|---:|
| 1 | (初始采样) | $-0.1922$ | $-0.5225$ |
| 10 | A sponge | $0.2336$ | $0.4828$ |
| 100–1000 | 关于龙卷风的回答 | $0.8968$ | $-0.3367$ |
| 3000 | 钻孔 (bore hole) | $0.9003$ | $0.2733$ |
| 30000 | 路面坑洞 (pothole) | $0.9527$ | $0.5490$ |

$n=10$ 时选出了正确答案, 金标分明显上升. $n$ 增加到 100 以上, 代理 RM 偏爱的龙卷风回答胜出, 代理分涨到 $0.90$, 金标分跌回负值. 再往后代理分变化很小, 金标分随选出的回答上下波动. 按行算代理与金标的差: $n=10$ 时金标反而比代理高 $0.25$; $n=100$ 到 $1000$ 时代理比金标高 $1.23$; $n=30000$ 时差缩到 $0.40$. 代理分从 $0.90$ 到 $0.95$ 只动了 $0.06$, 同一区间金标分在 $-0.34$ 到 $0.55$ 之间摆动, 幅度近 $0.9$. 代理 RM 在高分端几乎分不出这些回答的好坏, 选中谁很大程度上由噪声决定. 单个 prompt 的曲线噪声很大, Figure 1 的平滑曲线是在大量 prompt 上平均的结果.

## 6. KL 不能比较两种方法

### 6.1 RL 花掉更多 KL

§3.5 对比两种方法. 以 KL 为预算, RL 无论是推高代理分还是把金标推过峰值, 都比 BoN 消耗更多 KL. BoN 只在初始策略附近挑样本, $d$ 随 $\sqrt{\log n}$ 增长; RL 没有 KL 惩罚时 KL 随步数近似二次增长. 一个解释: 与奖励正交的扰动也会增加 KL, 却不改变代理分或金标分; 而一个小但对准奖励方向的扰动, 可以用很少的 KL 显著改变行为.

§4.1 的结论是, KL 不是比较不同优化方法「优化了多少」的公平尺度. 在同一种方法内部 KL 仍然好用: §3.2 的系数标度干净, §3.4 中不同策略规模的金标峰值落在几乎相同的 KL 上.

从分布的角度也能看出差别. $\pi_{\mathrm{bon}}(y)=nF(y)^{n-1}\pi(y)$ 只是按排名给 $\pi$ 的样本重新加权, 支撑集与 $\pi$ 相同, 每条回答的概率最多放大 $n$ 倍. RL 没有这个限制, 可以把概率质量移到 $\pi$ 几乎不会生成的序列上, 包括对奖励没有贡献的方向. 前者的 KL 每一份都花在「按奖励排序」上, 后者的 KL 有一部分花在与奖励无关的漂移上.

### 6.2 换成代理分做横轴

以代理分为横轴 (Figure 8), BoN 和 RL 的曲线形状接近得多, 都是金标先升后降. RL 开始时代理与金标的差距更大, 但金标峰值可以高过 BoN. 论文把 RL 曲线截断在代理分 $1.6$ 处以便阅读.

## 7. KL 惩罚的作用接近早停

§3.6 在策略 1.2B, RM 1.2B 的设定下扫 PPO 的显式 KL 惩罚系数. 结果: 金标分几乎只由当前的 $\mathrm{KL}_{\mathrm{RL}}$ 决定. 惩罚越大, 训练越早停在较小的 KL 上, 金标对 KL 的前沿没有被抬高, 效果与早停相当. 加惩罚的实验中代理与金标的差距还严格更大, 也就是惩罚提高了给定 KL 下的代理分, 金标没有跟着提高. 因为这个结果, 其余 RL 实验都不加 KL 惩罚. 作者提醒这条结论可能对超参特别敏感.

PPO 的代理目标对上一轮策略 $\pi_{\mathrm{old}}$ 有一项隐式约束 (clip), 对象不是 $\pi_{\mathrm{init}}$. 附录 C 的 clip 取 $0.2$, 即每个 token 的新旧概率比在 $[0.8,1.2]$ 之外不再产生梯度. 它限制每一步的改动幅度, 间接让 $D_{\mathrm{KL}}(\pi\Vert\pi_{\mathrm{init}})$ 增长变慢. 为什么这种间接约束看上去比显式 KL 惩罚的过优化更轻, 论文没有答案.

§4.3 讨论了迭代 RLHF: 每轮用新数据训练新 RM. 假设 $\alpha_{\mathrm{RL}}$, $\beta_{\mathrm{RL}}$ 跨轮不变, 且各轮的 $d$ 可以相加 (RL 的 KL 随步数近似二次增长, 即 $d$ 近似随步数线性增长, 这个假设才合理). 分 $k$ 轮, 每轮走 $d/k$, 最终

$$
R_{\mathrm{RL}}(d)=d\,(\alpha_{\mathrm{RL}}-\beta_{\mathrm{RL}}\log d+\beta_{\mathrm{RL}}\log k).
\tag{7}
$$

与一轮走完同样的 $d$ 相比, 多出 $\beta_{\mathrm{RL}}d\log k$. 取 $k=4$, 增益是 $1.39\,\beta_{\mathrm{RL}}d$. 用示意系数 $\alpha=1$, $\beta=0.25$, $d=2$ 代入: 一轮走完 $R=2\times(1-0.25\times0.693)\approx1.65$; 分 4 轮, 每轮换新 RM, $R\approx1.65+0.25\times2\times1.386\approx2.35$, 多出约 $40\%$. 代价是 4 次重新采集比较数据和重训 RM. 能消掉的只是 $\beta$ 那一项, $\alpha$ 对应的部分不受影响. $k$ 不能无限增大, 每轮的 $d$ 太小时标度也会失效. 这是理论推演, 没有对应的实验.

## 8. 数据量与策略规模

### 8.1 数据门槛

§3.3 把 RM 固定为 12M, 扫训练数据量. 数据越多, 金标越好, 过优化越轻. $\alpha$, $\beta$ 随数据量的变化没有随参数量那么规整.

比较数据大约 2000 条是一个门槛: 少于此数, 代理 RM 的验证损失接近随机水平, 优化后金标几乎不涨. 更大的 RM 并不会更早越过门槛 (脚注说这与作者的内部发现不一致). 重复数据不能代替新数据: 同一份 2000 条跑 4 个 epoch, 金标几乎没变; 4 倍数据只跑 1 个 epoch, 金标明显更好 (Figure 13). 验证损失也是同样的排序: 1 epoch × 2000 条是 $0.686$, 4 epoch × 2000 条是 $0.684$, 1 epoch × 8000 条是 $0.655$. 二元交叉熵的随机水平是 $\log2\approx0.693$, 前两组只比随机好一点. 多跑 3 个 epoch 让损失只降了约 $0.002$, 换成 4 倍不重复数据降了约 $0.031$, 差了十几倍. 在门槛附近, 代理 RM 的质量由见过多少条不同的比较决定, 训练步数几乎不起作用.

论文还给出一点弱证据: 验证损失相同的代理 RM, 过优化程度也接近 (Figure 6), 不论这个损失是靠参数量还是数据量达到的.

### 8.2 策略规模

§3.4 比较 1.2B 和 6B 策略, RM 固定为 12M, 并用 3B RM 复核 (Figure 22). 6B 策略从优化中多得到的金标分更少, 因为它的起点更高, 初始分与峰值分之间的差距更小. 金标峰值出现在几乎相同的 KL 上, 代理与金标的差距也几乎相同 (Figure 24). 同样的 RL 步数下 6B 策略的 KL 反而更低 (Figure 15). 直觉上更大的策略会更快「钻 RM 的空子」, 这批实验没有支持这一点. 只比较了两个规模, 结论的适用范围有限.

## 9. Goodhart 的四种类型

§4.2 借用 Manheim 与 Garrabrant 的分类 (回归型, 极端型, 因果型, 对抗型) 来解读两个系数.

回归型: 代理 = 真值 + 噪声, 按代理选样本会同时选到噪声. 设真值 $X$ 与噪声 $Z$ 独立, 都是零均值高斯, 观察到代理 $X+Z=c$ 时,

$$
\mathbb{E}[X\mid X+Z=c]=\frac{\mathrm{Var}(X)}{\mathrm{Var}(X)+\mathrm{Var}(Z)}\,c.
\tag{8}
$$

真值随代理线性增长, 斜率小于 1. 论文把 $\alpha$ 读成这一类: 金标线性项的斜率低于代理. 若 $\mathrm{Var}(Z)=\mathrm{Var}(X)$, 斜率是 $1/2$, 代理每涨 1, 真值只涨 $0.5$. RM 越大, 拟合人类 (这里是金标) 的误差越小, $\mathrm{Var}(Z)$ 下降, 斜率向 1 靠拢, 这与「更大的 RM 金标峰值更高」的观察方向一致. 数据量少于门槛时 $\mathrm{Var}(Z)$ 远大于 $\mathrm{Var}(X)$, 斜率接近 0, 对应第 8.1 节中优化后金标几乎不动的现象. 纯回归型下真值随代理单调上升, 不会掉头; Figure 8 的曲线是非单调的, 说明还有其他机制.

极端型: 优化把样本推到 RM 训练分布之外, 在分布内成立的相关性不再成立. 论文举的例子是长度: 在训练分布内较长的回答通常更好, 推到极端后不再如此 (脚注说在 InstructGPT 中观察到过). $\beta$ 被读成极端型, 它让金标在大 $d$ 下无界下降. RM 越大 $\beta$ 越小, 可以理解为鲁棒性随规模提升.

对抗型 (策略主动欺骗 RM) 在这批模型上观察不到. 推广到能力更强的策略时, 这里的标度可能首先在这一点上失效.

论文 §4.4 还提到 Korbak 等的观点: KL 正则的 RL 可以看作贝叶斯推断, 把初始策略当先验, 把奖励当似然. 按这个视角, KL 惩罚设定的是先验强度, 本身不能纠正 RM 的错误, 这与第 7 节的实验结果一致.

## 10. 与相邻方法的关系

| | BoN | RAFT | PPO | GRPO | DPO |
|---|---|---|---|---|---|
| RM 的用法 | 代理 RM 打分选样本 | 冻结 RM 排序 | 标量奖励进优势 | 组内奖励标准化 | 没有独立 RM |
| 参数更新 | 可以没有 | 对 top-1 做 SFT | clip + GAE | 组内 $z$-score + clip | 离线分类 |
| 推理成本 | $n$ 次生成与打分 | 1 次 | 1 次 | 1 次 | 1 次 |

[RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md) 使用同样的「采 $n$ 条取最高」预算, 区别在于把冠军写进训练, 推理只采 1 条. 它学到的近似就是 BoN 分布, 所以同样受过优化影响. [GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 对组内奖励减均值除标准差, 再走 PPO 式裁剪; BoN 只看排序中的第一名. [DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md) 没有显式 RM, 但隐式奖励同样是从有限偏好数据学来的, 过优化问题以另一种形式存在.

后续工作的走向是把 BoN 的质量搬进单次推理. [BOND](../09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md) 推导 BoN 分布的解析式并做分布匹配; [WARP](../10-WARP-权重平均策略/10-WARP-权重平均策略.md) 用权重平均改进 KL 与奖励的前沿. 两者都把 KL 对奖励的前沿当评价标准, 第 6 节的结论提醒: 不同方法之间比较 KL 时要谨慎.

## 11. 失效模式与边界

**合成金标不等于人.** 金标 RM 本身就是对人类偏好的近似, 代理 RM 和金标 RM 用相同架构, 误差可能相关. 迁移到真人偏好时, 系数不一定原样成立. 标注员偏爱「看起来对」的回答这类错位, 合成设定测不到.

**只有一个环境.** 主文只有 InstructGPT 设定; 作者提到在 WebGPT 环境里看到外形相似的曲线. 策略只有两个规模.

**函数形式的已知缺陷.** RL 形式在原点斜率无穷; 代理分没有可外推的闭式; BoN 形式只在 KL 到 10 的范围验证过.

**超参敏感.** KL 惩罚的结论, RL 的 KL 增长速度, 都可能随学习率和 PPO 设置变化.

常见误用汇总:

| 做法 | 问题 | 依据 |
|---|---|---|
| 用 KL 比较 BoN 与 RL 谁优化得更多 | 两者消耗 KL 的效率差很多 | §3.5, §4.1 |
| 加大 KL 惩罚来治过优化 | 只提高给定 KL 下的代理分 | §3.6 |
| 数据不够就多跑几个 epoch | 4 epoch 与 1 epoch 几乎无差别 | §3.3, Figure 13 |
| 认为更大策略过优化更早 | 1.2B 与 6B 峰值 KL 几乎相同 | §3.4 |
| 迭代换 RM 期望消除过优化 | 只能削减 $\beta$ 项, $\alpha$ 项不变 | §4.3 |
| 把 $n$ 一直调大 | 越过 $d^\star$ 后金标下降 | 式 (6) |

**实践含义.** 用 BoN 做推理增强时, $n$ 存在最优值, 由代理 RM 的规模和数据量决定. 对同一个代理 RM 不断加大 $n$ 会降低真实质量. 用 RL 时, 显式 KL 惩罚不能替代更好的 RM, 能起作用的是更大的 RM, 更多的不重复比较数据, 以及按金标或人工评估做早停.

## 参考文献

1. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760). *ICML*. [arXiv HTML](https://arxiv.org/html/2210.10760).
2. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
3. Stiennon, N., et al. (2020). [Learning to summarize from human feedback](https://arxiv.org/abs/2009.01325). *NeurIPS*.
4. Nakano, R., et al. (2021). [WebGPT: Browser-assisted question-answering with human feedback](https://arxiv.org/abs/2112.09332).
5. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
6. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).
7. Manheim, D., & Garrabrant, S. (2018). [Categorizing Variants of Goodhart's Law](https://arxiv.org/abs/1803.04585).
8. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767). *TMLR*.
9. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
10. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).
11. Sessa, P. G., et al. (2024). [BOND: Aligning LLMs with Best-of-N Distillation](https://arxiv.org/abs/2407.14622).
