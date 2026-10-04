---
title: "08 · PRO: 偏好排序优化"
published: true
tags: ["PRO", "Plackett-Luce", "listwise", "DPO", "RRHF", "SLiC", "SFT", "RLHF"]
excerpt: "PRO (Preference Ranking Optimization) 把一条 n 长的偏好排序写成当前策略上的 n-1 次递归 softmax, 再对第一名加一条 SFT 交叉熵."
---
# 08 PRO: 偏好排序优化

> 相关阅读: [4.6.2 其他对齐技术](../../4.6.2-在线偏好与自对弈/4.6.2-在线偏好与自对弈.md) · [01 SLiC](../06-SLiC-序列似然校准/06-SLiC-序列似然校准.md) · [02 RRHF](../07-RRHF-排序响应对齐/07-RRHF-排序响应对齐.md) · [03 IPO](../02-IPO-身份偏好优化/02-IPO-身份偏好优化.md) · [01 DPO](../01-DPO/01-DPO.md) · [04 PPO](../../../4.4-强化学习基础/04-PPO/04-PPO.md) · [07 RAFT](../../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md)

材料是 Song, Yu, Li 等 (北京大学与阿里巴巴) 的 *Preference Ranking Optimization for Human Alignment* ([arXiv:2306.17492](https://arxiv.org/abs/2306.17492), AAAI 2024). 问题是手里有一条长度为 $n$ 的人类偏好排序时, 怎样在一次监督微调里用上整条排序, 而不把它切成若干成对比较. 下面回答几个问题:

1. PRO 想解决 RLHF 和已有 SFT 类方法的哪两个缺点?
2. 损失怎样从 Bradley-Terry 的成对对比扩展到任意长度的排序, 它和 Plackett-Luce 模型是什么关系?
3. 分数为什么要除以长度, SFT 项的权重怎么定?
4. 有奖励模型时, 动态温度和自举采样分别做什么?
5. HH-RLHF 上的主结果, 加长排序和消融说明了什么?

## 1. 要解决的问题

RLHF 按 InstructGPT 的做法分三步. 第一步 SFT: 标注者为提示 $x$ 写出期望回答, 策略在这些数据上做最大似然, 得到 $\pi_{\mathrm{SFT}}$. 第二步训练奖励模型: 用 $\pi_{\mathrm{SFT}}$ 为提示生成成对回答, 标注者给出 $y^1\succ y^2\mid x$, 奖励模型 $r_\phi$ 用 Bradley-Terry 损失拟合这个偏好:

$$
\mathcal{L}_{\mathrm{RM}}
=-\log\frac{\exp\bigl(r_{\phi}(x,y^{1})\bigr)}
{\exp\bigl(r_{\phi}(x,y^{1})\bigr)+\exp\bigl(r_{\phi}(x,y^{2})\bigr)}.
\tag{1}
$$

第三步强化学习: $\pi_{\mathrm{SFT}}$ 在反复采样中同时接收奖励模型和参考策略的反馈.

PRO 的引言和摘要指出两个缺点. 第一, 和监督学习相比, RLHF 更复杂, 优化不稳定, 对超参敏感, 还要额外训练奖励模型和价值网络. 论文把原因归结为让 LLM 通过反复试错去学习, 而不是直接对齐到人类偏好. 第二, RLHF 训练中做了大量采样, 落到损失上仍是成对对比, 缺少宏观视角下多个候选之间的对比. 已有的改进 SFT 的方法 (DPO, RRHF, RAFT, Wu 等的细粒度反馈) 也大多受限于给定排序的长度, 只关注语义或标量上的成对对比; 即使有更长的排序, 也倾向于切成成对比较.

论文的判断是: RLHF 效果好的根本原因在于训练时从广阔的语言空间里多次采样并打分. PRO 想保留这一点, 方法是把多条带偏好标签的回答组装成长排序, 在 SFT 的设定里一次学完, 不再让模型试错.

## 2. 从成对对比到 one-to-N 对比

式 (1) 让奖励模型通过分数对比理解 $y^1\succ y^2$. 要直接优化策略, 可以把同样的成对对比搬到 LLM 上, 让 LLM 同时充当奖励模型和策略网络, 分数记作 $r_\pi$:

$$
\mathcal{L}=-\log\frac{\exp\bigl(r_{\pi}(x,y^{1})\bigr)}
{\exp\bigl(r_{\pi}(x,y^{1})\bigr)+\exp\bigl(r_{\pi}(x,y^{2})\bigr)}.
\tag{2}
$$

扩大候选集, $r_\pi$ 能接触更多样本, 这在 PRO 里替代了 RLHF 的试错经验. 设有 $n$ 条候选, 人标顺序 $y^{1,\cdots,n}$ 为 $y^1\succ y^2\succ\cdots\succ y^n$. 先定义 $y^1$ 与它后面所有回答之间的偏序 $y^{1,2:n}=y^1\succ\{y^2,\cdots,y^n\}$. 参照 InfoNCE 损失 (He 等 2020 的 MoCo), 式 (2) 推广为 one-to-N 对比:

$$
\mathcal{L}=-\log\frac{\exp\bigl(r_{\pi}(x,y^{1})\bigr)}
{\sum_{i=1}^{n}\exp\bigl(r_{\pi}(x,y^{i})\bigr)}.
\tag{3}
$$

式 (3) 只刻画了 $y^{1,2:n}$, 忽略了 $y^{2,3:n}$ 到 $y^{n-1,n}$ 这 $n-2$ 个排序关系. 论文把式 (3) 称为 multi-dimensional 对比 (一个正例同时对多个负例), 还缺 multi-positional (每个位置都参与对比).

## 3. 递归对比, Plackett-Luce 与 SFT 项

补上其余位置的办法是递归: 从第一名开始, 把剩下的回答都当负例; 然后丢掉当前第一名, 把下一名当正例, 对剩余集合再做一次; 重复到没有候选为止. 式 (3) 因此扩展为

$$
\mathcal{L}=-\log\prod_{k=1}^{n-1}
\frac{\exp\bigl(r_{\pi}(x,y^{k})\bigr)}
{\sum_{i=k}^{n}\exp\bigl(r_{\pi}(x,y^{i})\bigr)}.
\tag{4}
$$

除了符合人类偏好, 模型还要生成流畅的回答, 所以论文把要求模型拟合最佳回答的原始监督损失也加进来. 合起来就是 PRO 的目标:

$$
\mathcal{L}_{\mathrm{PRO}}(y^{1,\cdots,n}\mid x)=\mathcal{L}+\beta\mathcal{L}_{\mathrm{SFT}},
\tag{5}
$$

$\mathcal{L}_{\mathrm{SFT}}$ 是第一名候选的 NLL 损失, $\beta$ 在文本质量和人类偏好之间做平衡. 策略同时也是奖励模型, 它的分数是长度归一的条件对数概率:

$$
r_{\pi_{\mathrm{PRO}}}(x,y^{k})
=\frac{1}{\lvert y^{k}\rvert}\sum_{t=1}^{\lvert y^{k}\rvert}
\log P\bigl(y_{t}^{k}\mid x,y^{k}_{<t}\bigr).
\tag{6}
$$

**为什么除以长度.** 整段回答的对数概率是逐 token 对数概率之和, 每一项都是负数, 回答越长和越小. 不除长度时, 式 (4) 的 softmax 会系统性地偏向短回答, 排序学到的是长度而非质量. 除以 $\lvert y^k\rvert$ 之后, 分数是平均每个 token 的对数概率. [02-RRHF](../07-RRHF-排序响应对齐/07-RRHF-排序响应对齐.md) 的分数 $p_i$ 用的是同一个定义. 这一段解释是按式 (6) 的构造写的, 论文没有单独做「不除长度」的消融.

**和 Plackett-Luce 的关系.** 论文注意到式 (4) 与 Plackett-Luce 模型 (Plackett 1975, Luce 2012) 形式相同. PL 模型把一个完整排列的概率写成「先从全集按 softmax 选第一名, 再从剩余集合选第二名, 依此类推」的乘积, 最小化式 (4) 就是最大化这个排列概率. 两者目标也相近: PL 模型用于排序聚合, 把多条排序合成固定候选集上的全局排序, 参数对应这些候选; PRO 学的是一般的人类偏好, 每条排序的 $n$ 个候选都不同. 论文的设想是, LLM 建模的是整个语言空间, 它的参数理论上对应每条排序的无穷多个候选 ($n=\infty$). 实际 $n$ 有限, $n$ 越大模型应当越好, 第 7 节的加长实验检验的就是这一点. $n=2$ 时式 (4) 只剩 $k=1$ 一项, 退回式 (2) 的成对对比.

**对比次数.** 附录 A 比较了数据效率. SFT 只用排序里被认为好的回答, 完全丢掉负例; 论文认为负例在对齐中很关键, 模型既要学什么是好的, 也要分辨什么是不好的. 奖励模型按成对对比训练, 长度为 $n$ 的排序需要 $\binom{n}{2}$ 次比较; PRO 只要 $n-1$ 次, 每次包含的负例也更多. $n=5$ 时是 10 对和 4 次 softmax.

**单阶段训练.** 附录 A 还指出, PRO 的对齐目标可微, 可以和 SFT 目标相加做单阶段多任务训练. RL 处理的是离散优化问题, 只能先训 SFT 模型, 再约束 RL 模型别离 SFT 太远, 所以 RLHF 需要两阶段训练, 成本更高.

**$\beta$ 的取值.** 实现里 $\beta=0.05(l-1)^2$, $l$ 是排序长度. $l=2$ 时 $\beta=0.05$, $l=3$ 时 $0.20$, $l=5$ 时 $0.80$. 排序从 2 加长到 5, 式 (4) 的项数从 1 变成 4, SFT 权重变成原来的 16 倍. 论文给出这个公式, 没有讨论它的推导.

## 4. 手算: 递归 softmax 与梯度

设 $n=3$, 当前分数 $r=(0.0,\,-0.4,\,-1.2)$, 与人标顺序一致.

| $k$ | 分母集合 | 正例的 softmax 概率 |
|---|---|---|
| 1 | $\{y^1,y^2,y^3\}$ | $1/(1+e^{-0.4}+e^{-1.2})\approx0.507$ |
| 2 | $\{y^2,y^3\}$ | $e^{-0.4}/(e^{-0.4}+e^{-1.2})\approx0.690$ |

$\mathcal{L}=-\log(0.507\times0.690)\approx1.05$. 把分数完全倒过来, $r=(-1.2,\,-0.4,\,0.0)$: $k=1$ 的概率约 $0.153$, $k=2$ 约 $0.401$, $\mathcal{L}\approx2.79$. 排反时损失更大.

**梯度.** 记第 $k$ 档在剩余集合上的 softmax 概率为 $p^{(k)}_i$. 第 $k$ 项对正例分数的偏导是 $-(1-p^{(k)}_k)$, 对剩余集合里每个负例的偏导是 $p^{(k)}_i$. 用上面排对的那组数:

- $k=1$: $\partial/\partial r_1=-(1-0.507)=-0.493$; $\partial/\partial r_2=0.340$; $\partial/\partial r_3=0.153$.
- $k=2$: $\partial/\partial r_2=-(1-0.690)=-0.310$; $\partial/\partial r_3=0.310$.
- 合计: $r_1$ 得 $-0.493$, $r_2$ 得 $0.340-0.310=0.030$, $r_3$ 得 $0.153+0.310=0.463$.

读数: 梯度下降让 $r_1$ 上升, $r_3$ 下降; 中间的 $y^2$ 在第一档被当负例往下推, 在第二档被当正例往上拉, 两者几乎抵消. 排序已经正确时梯度仍然非零, 只是随间隔增大而变小. [02-RRHF](../07-RRHF-排序响应对齐/07-RRHF-排序响应对齐.md) 的无间隔 hinge 在排对的对上梯度为 0, 这是两者的主要区别. 由式 (6), 对 $r_k$ 的梯度会平均分给 $y^k$ 的每个 token, 每个 token 拿到 $1/\lvert y^k\rvert$; 而 $\mathcal{L}_{\mathrm{SFT}}$ 只作用在 $y^1$ 上, 不除长度. 这组数字是式 (4)(6) 的算术, 论文没有给.

![长度归一分数进 listwise softmax, 第一名另做 SFT](./images/fig-pro-listwise-pl.png)

> 图 1: 同一提示下 $n=3$ 条已排序回答分两路. 上路按式 (6) 算长度归一分数, 再按式 (4) 做 $n-1$ 次 softmax; 下路只对 $y^1$ 做 NLL, 乘 $\beta$ 后并入式 (5).

**图 1 解析**

- 第一行从左到右: 黄框 Prompt $x$; 蓝框是排好序的回答 $y_1>y_2>y_3$, 标注 $n=3$ 的例子; 绿框是式 (6) 的 $r_\pi$, 注明长度归一的 $\log P$, 分母是 $\lvert y\rvert$; 橙框是 $k=1$ 的 softmax, 范围 $\{y_1,y_2,y_3\}$.
- 橙框向下到第二个橙框: $k=2$ 的 softmax, 范围是丢掉 $y_1$ 之后的 $\{y_2,y_3\}$. 它向左进入中间黄框, 即式 (4) 的 $-\log\prod_{k=1}^{n-1}(\mathrm{term}_k)$.
- 蓝框向下分出一路到紫框 $L_{\mathrm{SFT}}$, 注明只对 $y_1$ 做 NLL, 不做长度归一.
- 右下红框是式 (5) $L_{\mathrm{PRO}}=L+\beta L_{\mathrm{SFT}}$. 黄框用实线接入, 紫框用标着 $\beta$ 的虚线接入.
- 底部一行写的是「丢掉当前第一名, 再和剩下的对比」.

## 5. 嫁接 RLHF: 扩排序, 动态温度, 自举

PRO 只需要人标的排序, 不需要奖励模型. 论文列了三种把 RLHF 的部件接到 PRO 上的方式.

**低成本扩排序.** 排序的来源不受限制. 可以请标注者构想多条质量不同的回答; 更省的办法是用现有 LLM (ChatGPT, Alpaca 等) 生成多条回答, 再用额外的奖励模型 $r_\phi$ 打分排序.

**区分对比 (动态温度).** 式 (4) 把所有 $y^i\prec y^k$ 都当成 $y^k$ 的负例, 罚得一样重. 偏好分接近时这不合理: $y^{k+1}$ 只比 $y^k$ 差一点, $y^n$ 差很多时, 应该轻罚 $y^{k+1}$, 重罚 $y^n$. 论文用奖励模型的分数 $r_\phi(x,y^i)$ 表示数值偏好, 把式 (4) 改成

$$
\mathcal{L}=-\sum_{k=1}^{n-1}\log
\frac{\exp\bigl(r_{\pi_{\mathrm{PRO}}}(x,y^{k})/\mathcal{T}^{k}_{k}\bigr)}
{\sum_{i=k}^{n}\exp\bigl(r_{\pi_{\mathrm{PRO}}}(x,y^{i})/\mathcal{T}^{i}_{k}\bigr)},
\tag{7}
$$

$$
\mathcal{T}^{i>k}_{k}=\frac{1}{r_{\phi}(x,y^{k})-r_{\phi}(x,y^{i})},
\tag{8}
$$

$$
\mathcal{T}^{k}_{k}=\min_{i>k}\mathcal{T}^{i}_{k}.
\tag{9}
$$

奖励差越大, 两条回答的偏好差距越明显, 温度 $\mathcal{T}^i_k$ 越低, 正例 $y^k$ 对 $y^i$ 的惩罚被放大; 奖励差小时温度高, 惩罚减弱. $\mathcal{T}^k_k$ 取所有负例温度的最小值, 用来平衡分子和分母. 论文称, 只优化排序项, 去掉 $\mathcal{L}_{\mathrm{SFT}}$ 时, 动态温度显著提升效果; 和 $\mathcal{L}_{\mathrm{SFT}}$ 一起优化时也有一些提升.

**手算温度.** 设 $r_\phi=(2.0,\,1.8,\,0.2)$, 当前 $r_\pi=(-1.0,\,-1.1,\,-1.5)$, 看 $k=1$ 这一档. 由式 (8), $\mathcal{T}^2_1=1/0.2=5$, $\mathcal{T}^3_1=1/1.8\approx0.556$; 由式 (9), $\mathcal{T}^1_1=0.556$. softmax 的输入变成 $(-1.80,\,-0.22,\,-2.70)$, 概率约 $(0.160,\,0.775,\,0.065)$. 对负例分数的偏导是 $p_i/\mathcal{T}^i_1$: $y^2$ 为 $0.155$, $y^3$ 为 $0.117$, 比值 $1.33$. 不用温度时概率约 $(0.398,\,0.360,\,0.242)$, 两条负例的偏导比值是 $1.49$. 这组数下, 温度让近邻负例 $y^2$ 相对 $y^3$ 被罚得轻了一些, 方向与论文的设计意图一致. 同时可以看到, $r_\pi$ 为负时, 大温度会把 $y^2$ 的 logit 从 $-1.1$ 抬到 $-0.22$, 让它在分母里的占比变大, 所以实际效果和 $r_\pi$ 的取值有关. 这组数字是式 (7)(8)(9) 的算术, 论文没有给.

**自举 (附录 D).** 既然加回答能提升效果, 论文进一步试了把 LLM 自己的回答加进候选. 给定提示 $x$ 和当前模型, 采一条 $\hat y$ 加入已有集合 $\{y^i\}$, 用奖励模型重排得到 $\hat y^{1,\cdots,n+1}$, 再按式 (5) 优化:

$$
\mathcal{L}_{\mathrm{PRO}}(y^{1,\cdots,n}\mid x)\Rightarrow\mathcal{L}_{\mathrm{PRO}}(\hat{y}^{1,\cdots,n+1}\mid x).
\tag{10}
$$

算法 1 把数据集 $D$ 切成 $K$ 块 $D_0,\dots,D_{K-1}$. 处理第 $i$ 块时, 对每条样本取前缀 $x$ 和候选集, 用当前模型 $\pi^i_{\mathrm{LM}}$ 采一条 $\hat y$ 加入候选, 用 $r_\phi$ 打分重排; 然后在 $D_i$ 上跑 PRO 得到 $\pi^{i+1}_{\mathrm{LM}}$. 最终输出 $\pi^K_{\mathrm{LM}}$. 脚注说明, 朴素自举容易让 LLM 过拟合 $\mathrm{RM}_{\mathrm{train}}$, 所以加了两条限制: 增强的候选不能占据原来第一名的位置; 所有奖励重排后保证降序.

## 6. 实验设定

**数据.** HH-RLHF (Bai 等 2022a) 的四个子集: Harmless$_{\mathrm{base}}$, Helpful$_{\mathrm{base}}$, Helpful$_{\mathrm{online}}$, Helpful$_{\mathrm{rejection}}$. 每条样本有一条被选中和一条被拒绝的对话, 构成长度为 2 的排序, 记作 HH-RLHF$_{\mathrm{raw}}$. 训练时把四个子集合并, 在各自测试集上分别评估; 验证集从全部测试数据里随机抽 280 条. 过滤参照 Open-Assistant 的代码, 保证同一样本里所有候选上下文相同, 只有回答不同. 附录 Table 4 的规模 (过滤前 / 过滤后):

| 子集 | 训练 | 测试 |
|---|---|---|
| Harmless$_{\mathrm{base}}$ | 42537 / 42536 | 2312 / 2312 |
| Helpful$_{\mathrm{base}}$ | 43835 / 43835 | 2354 / 2354 |
| Helpful$_{\mathrm{online}}$ | 22007 / 22002 | 1137 / 1137 |
| Helpful$_{\mathrm{rejection}}$ | 52421 / 52420 | 2749 / 2749 |

为了评估更长排序, 每条样本用不同 LLM 生成的新候选扩充, 记作 HH-RLHF$_{\mathrm{LLM},i}$, LLM 是生成候选的模型, $i$ 是排序长度.

**指标.** BLEU 衡量文本质量, 奖励模型衡量偏好. 为了公平, 训练和评估用两个不同的奖励模型 $\mathrm{RM}_{\mathrm{train}}$ 和 $\mathrm{RM}_{\mathrm{eval}}$, 都是开源 checkpoint. $\mathrm{RM}_{\mathrm{eval}}$ 的输出过 sigmoid 归一化, 防止偶尔的极端值过度影响总分. 扩充后的排序在训练预处理阶段用 $\mathrm{RM}_{\mathrm{train}}$ 打分重排, 省掉大量人工排序. 人工评估是金标准; 另用 GPT-4 从两条回答里选更好的一条. 为了减轻位置偏差, 每个候选在两个位置各评一次, 取平均.

**实现.** 骨干 LLaMA-7B, 用 Transformers 和 Accelerate 实现. 序列长度 512, 2 个 epoch, 学习率 $5\times10^{-6}$, 推理最多生成 128 个新 token, 总 batch size 112. 代码在 [DAMO-ConvAI/PRO](https://github.com/AlibabaResearch/DAMO-ConvAI/tree/main/PRO).

**基线 (附录 C).** 零样本: LLaMA-7B; Curie (GPT-3 的 6.7B 版本, API 名 `text-curie-001`); Alpaca-7B (在 52K 指令数据上微调的 LLaMA); ChatGLM (6.2B 双语对话模型, 做过 SFT 和 RLHF); ChatGPT. 微调基线都以 LLaMA-7B 为骨干: SFT (只用排序第一名微调; 排序由奖励模型给出时就是 BoN); RLHF; CoH (用相反关键词的提示模板把好坏回答放在一起, 依赖 LLM 的语义理解); DPO; RRHF. 附录 C 说明 DPO 和 PRO 动机相近, 但彼此独立完成.

## 7. 实验结果

### 7.1 主结果 (Table 1)

总分 (Total) 的 BLEU / Reward:

| 训练集 | SFT 或 BoN | RLHF | CoH | DPO | RRHF | PRO |
|---|---|---|---|---|---|---|
| HH-RLHF$_{\mathrm{raw}}$ | 21.80 / 48.83 | 21.19 / 48.93 | 24.06 / 45.00 | 22.62 / 52.75 | 20.91 / 52.25 | 21.54 / **55.35** |
| HH-RLHF$_{\mathrm{Alpaca},3}$ | 23.7 / 57.66 | 23.82 / 57.28 | 23.54 / 47.15 | 22.98 / **59.27** | 21.02 / 55.39 | 22.11 / 58.72 |
| HH-RLHF$_{\mathrm{ChatGPT},3}$ | 22.45 / 63.83 | 20.99 / 58.65 | 23.26 / 55.58 | 22.35 / 64.10 | 20.86 / 63.12 | 23.07 / **67.97** |

raw 一行的第一列是 SFT, 两个扩充行是 BoN. 零样本总分: LLaMA 13.13 / 38.94, Curie 16.99 / 48.71, Alpaca 19.12 / 52.72, ChatGLM 21.99 / 61.27, ChatGPT 22.56 / 68.48.

读表:

- 所有微调后的 LLaMA-7B 在 BLEU 和 Reward 上都比未对齐的 LLaMA 高. 做过 RLHF 的 ChatGLM 和 ChatGPT 零样本也胜过 LLaMA, Curie, Alpaca.
- raw 上 PRO 比 SFT 高 6.52 Reward, 比 DPO 高 2.6. PRO 的 BLEU 21.54 低于 DPO 的 22.62 和 SFT 的 21.80. CoH 的 BLEU 最高 (24.06), Reward 最低 (45.00).
- Alpaca-3 上 DPO 总分 59.27 略高于 PRO 的 58.72, 这一行 PRO 没有拿到第一.
- ChatGPT-3 上 PRO 67.97, 接近 ChatGPT 零样本的 68.48. RRHF 63.12 与 BoN 63.83 接近.
- 扩充排序后所有方法都有提升. BoN 在扩充数据上成为有竞争力的基线, 论文指出这与 Rafailov 等观察到的「RLHF 的调参效率不如 BoN」一致.

分子集看 PRO 的 Reward. raw 上 Harmless$_{\mathrm{base}}$ 62.96 (DPO 54.43), Helpful$_{\mathrm{base}}$ 48.51 (DPO 50.13). ChatGPT-3 上 Harmless$_{\mathrm{base}}$ 73.08, 高于 ChatGPT 零样本的 71.44; 三个 Helpful 子集 64.78 / 66.66 / 66.95, 低于 ChatGPT 的 65.94 / 67.94 / 68.39. 论文的解释是: 无害主要靠调整表达风格, 保持礼貌这类显著特征, 对 PRO 较容易; 有帮助通常要给出具体建议, 受限于语言模型的世界知识, 更难.

论文对 RRHF 的分析是: RRHF 依赖给定排序里候选之间的成对对比, 在长排序上抓不到对应人类偏好的全局差异, 式 (4) 可以做到. 用来扩充排序的 LLM 越强, PRO 的提升越明显.

### 7.2 加长排序 (Figure 3)

论文模拟了四种扩充策略, 每种加入 3 条回答把排序从 2 扩到 5, 再用奖励模型重排:

- Alpaca: 用 Alpaca-7B 生成 3 条, 依次加 1, 2, 3 条, 得到长度 3, 4, 5.
- ChatGPT: 同上, 换成 ChatGPT.
- Ascending: 按 Table 1 零样本结果, 质量 ChatGPT $\succ$ Alpaca-7B $\succ$ Curie, 按质量升序加入: 长度 3 加 Curie, 长度 4 再加 Alpaca-7B, 长度 5 再加 ChatGPT.
- Random: 加入顺序与质量无关, 随机.

论文的观察:

- 排序越长, 大多数策略效果越好. 有一个表现不错的奖励模型 (相对容易获得) 时, 扩排序比构思新提示简单.
- 加入的回答越好, 效果越好. 单个模型生成时, 质量一般的 Alpaca 加 1 条就够了, 再加收益有限; 质量高的 ChatGPT 持续加入, 效果持续提升.
- 加入的回答越多样, 效果越好. 长度为 4 时, Ascending (Curie + Alpaca) 超过 Alpaca (Alpaca + Alpaca), 尽管 Curie 质量不如 Alpaca. 论文的解释是多样的回答即使是负例, 也能让模型更清楚该避免哪些行为. Curie, Alpaca, ChatGPT 三者组合的效果接近三条 ChatGPT.

论文正文没有列出 Figure 3 的具体数值.

### 7.3 GPT-4 与人工评估 (Table 2)

比较的是在 HH-RLHF$_{\mathrm{raw}}$ (排序长度 2, 没有发挥 PRO 的全部能力) 上训练的 PRO 与数据集自带的第一名 (Golden). GPT-4 评估用 Zheng 等 (2023) 的提示模板改写版, 并参照 Wang 等 (2023) 让两条候选各在两个方向出现一次. 人工评估由 3 位标注者评同一批样本, 两条回答顺序打乱.

| 评估者 | 子集 | 胜 | 平 | 负 |
|---|---|---|---|---|
| GPT-4 | Harmless$_{\mathrm{base}}$ | 60.00 | 5.00 | 35.00 |
| GPT-4 | Helpful$_{\mathrm{base}}$ | 77.50 | 0.00 | 22.50 |
| GPT-4 | Helpful$_{\mathrm{online}}$ | 27.50 | 12.50 | 60.00 |
| GPT-4 | Helpful$_{\mathrm{rejection}}$ | 55.00 | 0.00 | 45.00 |
| GPT-4 | 平均 | 55.00 | 4.37 | 40.63 |
| 人工 | Harmless$_{\mathrm{base}}$ | 20.00 | 55.00 | 25.00 |
| 人工 | Helpful$_{\mathrm{base}}$ | 20.00 | 60.00 | 20.00 |
| 人工 | Helpful$_{\mathrm{online}}$ | 20.00 | 50.00 | 30.00 |
| 人工 | Helpful$_{\mathrm{rejection}}$ | 30.00 | 60.00 | 10.00 |
| 人工 | 平均 | 22.50 | 56.25 | 21.25 |

读表:

- GPT-4 平均 55.00 胜对 40.63 负, 倾向 PRO; Helpful$_{\mathrm{online}}$ 是例外, 27.50 胜对 60.00 负.
- 人工评估平局占 56.25%, 胜负是 22.50 对 21.25, 差距很小. Harmless$_{\mathrm{base}}$ 和 Helpful$_{\mathrm{online}}$ 上人工判负多于判胜.
- 论文据此认为 PRO 能捕捉标注数据反映的人类偏好, 并认为评估用的奖励模型与人和 GPT-4 的判断方向一致. 从人工评估的胜负差看, PRO 与数据集第一名大致持平.

### 7.4 消融 (Table 3)

$-\mathcal{L}_{\mathrm{SFT}}$ 去掉式 (5) 的 SFT 项; $-\mathcal{T}$ 去掉式 (7) 的动态温度; $-\mathcal{L}^{k>1}$ 只保留式 (4) 的第一项 (相当于式 (3)). 总分的 BLEU / Reward:

| 方法 | HH-RLHF$_{\mathrm{raw}}$ | HH-RLHF$_{\mathrm{Alpaca},3}$ | HH-RLHF$_{\mathrm{ChatGPT},3}$ |
|---|---|---|---|
| PRO | 21.54 / 55.35 | 22.11 / 58.72 | 23.07 / 67.97 |
| $-\mathcal{L}^{k>1}$ | - | 21.10 / 58.11 | 22.80 / 67.75 |
| $-\mathcal{L}_{\mathrm{SFT}}$ | 9.85 / 53.25 | 18.29 / 59.71 | 21.84 / 67.84 |
| $-\mathcal{T}$ | 21.41 / 55.04 | 21.34 / 58.40 | 22.98 / 68.40 |
| $-\mathcal{L}_{\mathrm{SFT}}-\mathcal{T}$ | 5.14 / 46.17 | 2.05 / 32.33 | 6.25 / 43.16 |

raw 排序长度为 2, 式 (4) 只有一项, 所以没有 $-\mathcal{L}^{k>1}$ 这一行.

读表:

- **SFT 项.** 加 $\mathcal{L}_{\mathrm{SFT}}$ 是为了防止模型只迎合奖励模型而牺牲文本质量. 去掉后 BLEU 在三个训练集上都下降, raw 上从 21.54 降到 9.85. Alpaca-3 上 Reward 反而从 58.72 升到 59.71; 分子集看, raw 的 Harmless$_{\mathrm{base}}$ Reward 从 62.96 升到 67.20, 同时该子集 BLEU 从 12.05 降到 6.94. 这和论文说的「迎合奖励模型」一致.
- **递归项.** 只留第一项后, Alpaca-3 和 ChatGPT-3 的 BLEU 和 Reward 都下降 (58.72 到 58.11, 67.97 到 67.75), 论文据此确认式 (4) 的有效性. ChatGPT-3 上的下降幅度很小.
- **排序项本身.** 论文指出 Table 1 已经说明了排序项的作用: 完全去掉排序项就是 SFT (或 BoN), Reward 更低.
- **温度.** 单独去掉温度, raw 和 Alpaca-3 的 Reward 小幅下降; ChatGPT-3 上反而从 67.97 升到 68.40. 论文的总结是温度略微提升整体效果.
- **两项同时去掉.** 三个训练集的 Reward 都大幅下降, Alpaca-3 降到 32.33, BLEU 降到 2.05; 单独去掉任一项都没有这么大的影响. 论文的解释是: 温度让模型知道有些负例是中性的 (奖励分和正例接近), 不该过度惩罚, 以免训练混乱; $\mathcal{L}_{\mathrm{SFT}}$ 通过提高最佳回答的权重起类似作用.

### 7.5 自举结果 (Table 5)

| 训练集 | PRO | PRO$_{\mathrm{s}}$ (自举) |
|---|---|---|
| HH-RLHF$_{\mathrm{raw}}$ | 21.54 / 55.35 | 23.77 / 54.20 |
| HH-RLHF$_{\mathrm{Alpaca},3}$ | 22.11 / 58.72 | 20.68 / 57.44 |
| HH-RLHF$_{\mathrm{ChatGPT},3}$ | 23.07 / 67.97 | 22.96 / 68.36 |

读表:

- raw 上 BLEU 上升, Reward 小幅下降; Alpaca-3 上两项都下降; ChatGPT-3 上 Reward 上升, BLEU 基本不变.
- 论文推测自举只在底层语言模型足够强时有效. ChatGPT-3 上的提升也只相当于把排序扩到 4, 可能不如再加一条 ChatGPT 生成的高质量回答.
- 论文承认, 这些偏负面的结果可能来自用 1.4B 的奖励模型训练 7B 的策略. 扩大模型规模也许会像 RLHF 的规模规律 (Ouyang 等 2022, Gao 等 2022) 那样带来提升, 留作未来工作.

## 8. 与相邻方法对比

| | DPO | RRHF | SLiC-HF | PRO |
|---|---|---|---|---|
| 分数 | $\beta\log(\pi/\pi_{\mathrm{ref}})$ | 长度归一 $p_i$ | 未归一的序列 $\log P$ | 式 (6) 长度归一 $r_\pi$ |
| 排序损失 | 成对 Bradley-Terry $-\log\sigma$ | 无间隔 hinge | 带间隔 $\delta$ 的 hinge | 式 (4) 的 $n-1$ 次 softmax |
| 质量项 | 无 | 第一名交叉熵, 不加权 | 对参考摘要的交叉熵 | 第一名 NLL, 乘 $\beta=0.05(l-1)^2$ |
| 需要 $\pi_{\mathrm{ref}}$ | 是 | 否 | 否 | 否 |
| 排对后的梯度 | 变小, 不为 0 | 0 | 超过间隔后为 0 | 变小, 不为 0 |

读表:

- PRO 和 RRHF 的分数定义相同, 差别在损失: RRHF 对所有乱序对做 hinge, PRO 做递归 softmax, 每档的负例集合是该档之后的全部回答.
- $n=2$ 时 PRO 的式 (4) 与 DPO 一样是成对的 sigmoid 形式, 但比较的量是长度归一对数概率, 没有参考模型, 也没有 $\beta\log(\pi/\pi_{\mathrm{ref}})$ 那种隐式奖励.
- 和 [07-RAFT](../../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md) / BoN 相比, PRO 让负例进入 softmax 的分母; BoN 只用排序挑出第一名做 SFT, 负例丢掉.
- 和 [04-PPO](../../../4.4-强化学习基础/04-PPO/04-PPO.md) 相比, PRO 没有价值网络, 也不在训练中采样 (自举版本除外), 候选可以来自任何模型.
- [03-IPO](../02-IPO-身份偏好优化/02-IPO-身份偏好优化.md) 仍需要 $\pi_{\mathrm{ref}}$, 损失是平方回归, 只处理成对数据.

![三列对照: DPO 成对 BT, RRHF hinge, PRO listwise PL](./images/fig-pro-vs-dpo-rrhf.png)

> 图 2: 三列从上到下分别是 DPO, RRHF, PRO 的流程, 列之间没有箭头.

**图 2 解析**

- 左列 (橙色虚线框) 标题 DPO pairwise BT: 离线成对 $(y_w,y_l)$; 隐式奖励 $\hat r=\beta\log\frac{\pi}{\pi_{\mathrm{ref}}}$; BT 损失 $-\log\sigma(r_w-r_l)$; 底框注明冻结的 $\pi_{\mathrm{ref}}$, 没有长度归一 $\lvert y\rvert$.
- 中列 (绿色虚线框) 标题 RRHF hinge: 来自任意 $\rho$ 的 $k$ 条回答; 长度归一的 $\log\pi$ 分数 $p_i$; hinge $\max(0,p_{\mathrm{worse}}-p_{\mathrm{better}})$, 条件是 $r_{\mathrm{worse}}<r_{\mathrm{better}}$, 没有间隔; 底框是对奖励最高者加 $L_{\mathrm{ft}}$, 两项直接相加.
- 右列 (蓝色虚线框) 标题 PRO listwise PL: $n$ 条排序 $y_1>y_2>\dots>y_n$; 式 (6) 的长度归一 $r_\pi$; Plackett-Luce, $n-1$ 次 softmax, 式 (4); 底框是式 (5) $L+\beta L_{\mathrm{SFT}}$, 并注明 $n=2$ 时仍有别于 DPO.
- 底部一行: PRO 的分数与 RRHF 的长度归一一致; PRO 的损失是 listwise softmax, 区别于 hinge; DPO 的分数是对数比.

## 9. 失效与边界

| 现象 | 原因 | 出处 |
|---|---|---|
| 去掉 SFT 项后 BLEU 大跌, 部分子集 Reward 反升 | 排序项单独优化会迎合奖励模型 | Table 3 |
| 温度和 SFT 项同时去掉, 训练崩坏 | 分差很小的负例被过度惩罚 | Table 3, 消融讨论 |
| 自举在 raw 和 Alpaca-3 上变差 | 朴素自举容易过拟合 $\mathrm{RM}_{\mathrm{train}}$; 策略 7B, 奖励模型 1.4B | 附录 D |
| 多轮对话被上下文带偏 | 对齐的是整段回答的排序, 没有逐轮监督 | 附录 E |
| Helpful$_{\mathrm{online}}$ 上 GPT-4 判负多 | 排序长度为 2, 未发挥长排序优势 | Table 2 |
| 有用性提升小于无害性 | 具体建议依赖世界知识 | Table 1 讨论 |

逐行补充:

- 附录 E 给了一个错误案例: 多轮对话里用户想偷车, 前一轮助手已经顺着话头列出工具, 微调后的模型继续给出操作步骤. 论文认为更细粒度的算法设计, 例如逐轮 (turn-level) 监督, 可能有助于这个问题.
- 式 (8) 的温度要求 $r_\phi(y^k)>r_\phi(y^i)$. 排序由 $\mathrm{RM}_{\mathrm{train}}$ 打分重排时这个条件成立; 两条回答奖励相同时温度无定义. 论文没有讨论这种情况, 这一条是按式 (8) 推出来的.
- 排序和打分来自代理奖励模型时, PRO 学到的偏好上限就是这个奖励模型. 论文用不同的 $\mathrm{RM}_{\mathrm{eval}}$ 评估, 并补了 GPT-4 和人工评估, 但人工评估只针对 raw 上的 PRO.
- $n=1$ 时式 (4) 没有项, 只剩 SFT. 需要在线探索或逐步过程奖励的任务, 这套离线排序损失帮不上.
- Ethics 声明数据里有敏感和冒犯性内容, 只用于研究. 有害偏好排成序, 算法同样能拟合.

## 参考文献

1. Song, F., Yu, B., Li, M., Yu, H., Huang, F., Li, Y., & Wang, H. (2024). [Preference Ranking Optimization for Human Alignment](https://arxiv.org/abs/2306.17492). *AAAI*. [arXiv HTML](https://arxiv.org/html/2306.17492). 代码: [DAMO-ConvAI/PRO](https://github.com/AlibabaResearch/DAMO-ConvAI/tree/main/PRO).
2. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
3. Yuan, Z., Yuan, H., Tan, C., Wang, W., Huang, S., & Huang, F. (2023). [RRHF: Rank Responses to Align Language Models with Human Feedback without tears](https://arxiv.org/abs/2304.05302). *NeurIPS*.
4. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
5. Dong, H., Xiong, W., Goyal, D., Pan, R., Diao, S., Zhang, J., Shum, K., & Zhang, T. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767).
6. Liu, H., Sferrazza, C., & Abbeel, P. (2023). [Chain of Hindsight Aligns Language Models with Feedback](https://arxiv.org/abs/2302.02676).
7. Bradley, R. A., & Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. *Biometrika*, 39(3/4), 324-345.
8. Plackett, R. L. (1975). The analysis of permutations. *Journal of the Royal Statistical Society Series C: Applied Statistics*, 24(2), 193-202.
9. Luce, R. D. (2012). *Individual Choice Behavior: A Theoretical Analysis*. Courier Corporation.
10. He, K., Fan, H., Wu, Y., Xie, S., & Girshick, R. (2020). [Momentum Contrast for Unsupervised Visual Representation Learning](https://arxiv.org/abs/1911.05722). *CVPR*.
11. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
12. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).
13. Touvron, H., et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971).
14. Zheng, L., et al. (2023). [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685).
15. Wang, P., et al. (2023). [Large Language Models are not Fair Evaluators](https://arxiv.org/abs/2305.17926).
16. Gao, L., Schulman, J., & Hilton, J. (2022). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760).
17. Azar, M. G., et al. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS*.
