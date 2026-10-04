---
title: "05 · G-OPD: 散度光谱"
published: true
tags: ["OPD", "G-OPD", "ExOPD", "Reward Extrapolation", "f-Divergence", "Reverse KL", "后训练"]
excerpt: "G-OPD 把 OPD 改写成奖励与 KL 正则权重相等的稠密 KL 约束 RL, 再引入奖励缩放系数 λ 和可选参考模型. λ=1.25 的 ExOPD 在 Qwen3-4B 多教师合并中让学生在全部 7 个基准上超过两个领域教师."
---
# 05 · G-OPD: 散度光谱

## 1. 三种训练目标与 OPD 的 RL 视角

### 1.1 三种训练目标

记输入分布为 $D$, 学生为 $\pi_\theta$, 教师为 $\pi^*$. 知识蒸馏的一般形式是在教师生成的轨迹上最小化前向 KL:

$$
\mathcal{J}_{\mathrm{KD}}(\theta)=\min_\theta\ \mathbb{E}_{x\sim D,\,y\sim\pi^*(\cdot\mid x)}\bigl[\mathrm{KL}(\pi^*(y\mid x)\,\|\,\pi_\theta(y\mid x))\bigr]. \tag{1}
$$

拿到教师完整分布代价高, 实践中常退化为在教师轨迹上做 SFT. 它是 off-policy 的: 学生模仿教师的行为, 而没有从自己动作引出的奖励中学习.

KL 约束的 on-policy RL 目标为

$$
\mathcal{J}_{\mathrm{RL}}(\theta)=\max_\theta\ \mathbb{E}_{x\sim D,\,y\sim\pi_\theta(\cdot\mid x)}\bigl[r(x,y)-\beta\,\mathrm{KL}(\pi_\theta\,\|\,\pi_{\mathrm{ref}})\bigr]. \tag{2}
$$

奖励 $r$ 可以是在偏好数据上训练的奖励模型, 也可以是推理任务中的规则验证器. RL 的奖励通常只在最后一个 token 给出, 其余位置为 0, 优化效率低.

OPD 让学生自己生成轨迹, 在这些轨迹上最小化学生到教师的反向 KL:

$$
\mathcal{J}_{\mathrm{OPD}}(\theta)=\min_\theta\ \mathbb{E}_{x\sim D,\,y\sim\pi_\theta(\cdot\mid x)}\bigl[\mathrm{KL}(\pi_\theta(y\mid x)\,\|\,\pi^*(y\mid x))\bigr]. \tag{3}
$$

附录 A 推出式 (3) 的精确梯度含 $\sum_{t'\ge t}$ 的未来项. 推导分两步. 第一步对 $\sum_y\pi_\theta(\log\pi_\theta-\log\pi^*)$ 求导, 乘积法则多出的一项是 $\sum_y\pi_\theta\nabla_\theta\log\pi_\theta=\nabla_\theta\sum_y\pi_\theta=\nabla_\theta1=0$, 剩下 $\mathbb{E}_{y\sim\pi_\theta}[(\log\pi_\theta-\log\pi^*)\nabla_\theta\log\pi_\theta]$. 第二步把序列对数概率拆成逐 token 之和, 记 $\Delta_{t'}=\log\pi_\theta(y_{t'}\mid x,y_{<t'})-\log\pi^*(y_{t'}\mid x,y_{<t'})$. 对 $t'<t$ 的交叉项, $\Delta_{t'}$ 在给定 $y_{<t}$ 时是常数, 对 $y_t$ 取期望后 $\mathbb{E}_{y_t}[\nabla_\theta\log\pi_\theta(y_t\mid\cdot)]=0$, 这些项全部消失. 精确梯度于是是

$$
\nabla_\theta\mathcal{J}_{\mathrm{OPD}}=\mathbb{E}\Bigl[\sum_{t=1}^{T}\Bigl(\sum_{t'=t}^{T}\Delta_{t'}\Bigr)\nabla_\theta\log\pi_\theta(y_t\mid x,y_{<t})\Bigr],
$$

位置 $t$ 的系数是从 $t$ 到结尾的 $\Delta$ 之和, 与 RL 里不打折扣的回报同形. 折扣取 0 就是只留下 $t'=t$ 这一项: 方差小了很多, 但它已经不是式 (3) 的无偏梯度. 某个 token 本身与教师一致, 却把后续前缀带进教师概率很低的区域, 这种代价在近似梯度里不会记到该 token 上. Thinking Machines 的博客与 MiMo-V2-Flash 技术报告 (Xiao 等) 都把折扣因子取 0, 只优化下一 token, 得到近似梯度

$$
\nabla_\theta\mathcal{J}_{\mathrm{OPD}}\approx\mathbb{E}\Bigl[\sum_{t=1}^{T}\bigl(\log\pi_\theta(y_t\mid x,y_{<t})-\log\pi^*(y_t\mid x,y_{<t})\bigr)\nabla_\theta\log\pi_\theta(y_t\mid x,y_{<t})\Bigr]. \tag{4}
$$

与 RL 的策略梯度对比, $-(\log\pi_\theta-\log\pi^*)$ 相当于 token 级优势, 每个位置都有信用分配. 这些基本形式在 [01 OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md) 中有更完整的推导.

### 1.2 OPD 是 KL 约束 RL 的特例

在式 (3) 中插入一个第三方模型 $\pi_{\mathrm{ref}}$, 加一项再减一项:

$$
\begin{aligned}
\mathcal{J}_{\mathrm{OPD}}
&=\max_\theta\ \mathbb{E}\bigl[\log\pi^*(y\mid x)-\log\pi_\theta(y\mid x)\bigr]\\
&=\max_\theta\ \mathbb{E}\Bigl[\bigl(\log\pi^*-\log\pi_{\mathrm{ref}}\bigr)-\bigl(\log\pi_\theta-\log\pi_{\mathrm{ref}}\bigr)\Bigr]\\
&=\max_\theta\ \mathbb{E}\Bigl[\log\frac{\pi^*(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}-\mathrm{KL}\bigl(\pi_\theta(y\mid x)\,\|\,\pi_{\mathrm{ref}}(y\mid x)\bigr)\Bigr].
\end{aligned} \tag{5}
$$

最后一行与式 (2) 同形: 奖励为 $r=\log(\pi^*/\pi_{\mathrm{ref}})$, KL 正则加在学生与 $\pi_{\mathrm{ref}}$ 之间, 且 $\beta=1$. 这一改写沿用了 Xiao 等 (ICLR 2025) 关于模仿学习与 RLHF 联系的做法. 推导中 $\log\pi_{\mathrm{ref}}$ 一加一减互相抵消, 所以改写对任意 $\pi_{\mathrm{ref}}$ 都成立, 式 (5) 与式 (3) 的最优解和梯度完全相同.

### 1.3 与普通 RL 的三处区别

**稠密奖励**. 普通 RL 中 $r_t$ 只在 $t=T$ 非零. OPD 的每个 token 都有奖励

$$
r_t^{\mathrm{OPD}}=\log\frac{\pi^*(y_t\mid x,y_{<t})}{\pi_{\mathrm{ref}}(y_t\mid x,y_{<t})},\qquad t=1,\dots,T. \tag{6}
$$

它与 DPO 的隐式奖励同形. 式 (2) 的闭式解给出 $r(x,y)=\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}+\beta\log Z(x)$, $\log Z(x)$ 只依赖 $x$, 所以对数概率比可以当作真实奖励的代理, PRIME 等工作就用它给 RL 提供稠密监督. 区别在于, OPD 的隐式奖励并没有要求 $\pi^*$ 由 $\pi_{\mathrm{ref}}$ 经过 RL 得到, 两者甚至可以是不同尺寸的模型. 它仍然刻画了从参考分布到教师分布的对数概率偏移, 所以仍能作为有效的训练信号.

**权重固定**. 奖励与 KL 正则的权重恒为 1:1, 没有旋钮调节两者的相对强度.

**参考模型任意**. RL 中 $\pi_{\mathrm{ref}}$ 通常取策略的初始 checkpoint. 在式 (5) 中, $\pi_{\mathrm{ref}}$ 无论取什么, 化简后都回到式 (3), 所以它可以是任何模型. 默认取学生的初始策略.

于是 OPD 相对 RL 有两个长处 (稠密奖励, 参考模型自由), 但把奖励与正则的比例锁死在 1:1. G-OPD 就从这一点放开.

## 2. G-OPD 目标

### 2.1 定义

G-OPD 在奖励项前加一个奖励缩放系数 $\lambda$:

$$
\mathcal{J}_{\mathrm{G\text{-}OPD}}(\theta)=\max_\theta\ \mathbb{E}_{x\sim D,\,y\sim\pi_\theta(\cdot\mid x)}\Bigl[\lambda\log\frac{\pi^*(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}-\mathrm{KL}\bigl(\pi_\theta(y\mid x)\,\|\,\pi_{\mathrm{ref}}(y\mid x)\bigr)\Bigr]. \tag{7}
$$

$\lambda$ 相当于式 (2) 中的 $1/\beta$. 相对 RL, G-OPD 保留稠密信用分配与参考模型的自由; 相对 OPD, 它多了奖励权重这一维. $\lambda=1$ 时回到 OPD, $\lambda=0$ 时最优解就是参考模型本身.

### 2.2 最优解: 内插与外推

式 (7) 的最优解满足

$$
\log\pi_\theta(y\mid x)=\lambda\log\pi^*(y\mid x)+(1-\lambda)\log\pi_{\mathrm{ref}}(y\mid x)=\log\pi^*(y\mid x)+(\lambda-1)\bigl(\log\pi^*(y\mid x)-\log\pi_{\mathrm{ref}}(y\mid x)\bigr), \tag{8}
$$

两边相差一个只依赖 $x$ 的归一化常数, 论文省略未写. 式 (8) 是序列级的结论, 由式 (7) 套用 KL 约束 RL 的闭式解得到, 此时 $\beta=1/\lambda$, 最优策略 $\propto\pi_{\mathrm{ref}}\exp(\lambda\log(\pi^*/\pi_{\mathrm{ref}}))=(\pi^*)^\lambda\pi_{\mathrm{ref}}^{1-\lambda}$. 实际训练用的是式 (9) 那种只看下一 token 的近似梯度, 学生最终是否收敛到式 (8) 的序列级目标, 论文没有分析.

**$0<\lambda<1$, 奖励内插**. 学生的对数概率匹配教师与参考模型的线性内插, 等价于把式 (5) 中的奖励 $r$ 换成 $\lambda r+(1-\lambda)\cdot0$. 作者的预期是学生的成绩, 回答长度等行为都落在参考模型与标准 OPD 之间.

**$\lambda>1$, 奖励外推**. 学生除了匹配教师的对数概率, 还要额外拟合一项偏移 $(\lambda-1)(\log\pi^*-\log\pi_{\mathrm{ref}})$: 参考模型到教师的变化方向上再往前走一段. 这一设置称为 ExOPD. 作者提出的问题是: 外推能否胜过标准 OPD; 当多个教师都是同一学生在不同领域做 RL 得到的专家时, 外推能否蒸出一个超过所有领域教师的统一学生.

### 2.3 梯度

沿用折扣因子为 0 的近似, G-OPD 的梯度为

$$
\nabla_\theta\mathcal{J}_{\mathrm{G\text{-}OPD}}\approx\mathbb{E}\Bigl[\sum_{t=1}^{T}A_t^{\mathrm{G\text{-}OPD}}\,\nabla_\theta\log\pi_\theta(y_t\mid x,y_{<t})\Bigr], \tag{9}
$$

$$
A_t^{\mathrm{G\text{-}OPD}}=\bigl(\log\pi_\theta(y_t\mid\cdot)-\log\pi^*(y_t\mid\cdot)\bigr)+(\lambda-1)\bigl(\log\pi_{\mathrm{ref}}(y_t\mid\cdot)-\log\pi^*(y_t\mid\cdot)\bigr). \tag{10}
$$

第一项是 OPD 原有的优势 (按式 (4) 的符号约定), 第二项是外推带来的修正, $\lambda=1$ 时为 0. 实现上只需在 OPD 的基础上多算一次参考模型在采样 token 上的对数概率. 这也是 $\lambda\neq1$ 的额外开销.

### 2.4 参考模型的选择与奖励校正

$\lambda=1$ 时参考模型不影响目标; $\lambda\neq1$ 时, 不同的 $\pi_{\mathrm{ref}}$ 给出不同的目标. 论文分两种场景讨论.

**多教师合并**. 多个领域专家都是从同一个基座出发做领域 RL 得到的, 要把它们的能力合并回原基座, 这是 MiMo-V2-Flash 技术报告采用的多任务后训练方式. 此时 $\pi_{\mathrm{ref}}$ 自然取原基座, G-OPD 的奖励正好是式 (6) 那种由 RL 后训练诱导的隐式奖励.

**强到弱蒸馏**. 把大教师蒸馏到小学生. $\pi_{\mathrm{ref}}$ 有两种选择: 学生的基座 $\pi_{\mathrm{base}}^{\mathrm{student}}$, 这是只拥有教师与学生基座时的默认设置; 或者教师 RL 之前的基座 $\pi_{\mathrm{base}}^{\mathrm{teacher}}$, 前提是它可得. 把式 (7) 改写成等价形式:

$$
\mathcal{J}_{\mathrm{G\text{-}OPD}}=\max_\theta\ \mathbb{E}\Bigl[(\lambda-1)\log\frac{\pi^*(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}-\mathrm{KL}\bigl(\pi_\theta(y\mid x)\,\|\,\pi^*(y\mid x)\bigr)\Bigr]. \tag{11}
$$

KL 正则强度相同的前提下, 取 $\pi_{\mathrm{ref}}=\pi_{\mathrm{base}}^{\mathrm{teacher}}$ 更合理: $\log(\pi^*/\pi_{\mathrm{base}}^{\mathrm{teacher}})$ 对应教师自身 RL 后训练诱导的隐式奖励, 按式 (6) 前后的讨论是良定义的. $\log(\pi^*/\pi_{\mathrm{base}}^{\mathrm{student}})$ 则混入了大小两个基座在知识和容量上的差距, 噪声更大. 在默认奖励上加一项 $\log(\pi_{\mathrm{base}}^{\mathrm{student}}/\pi_{\mathrm{base}}^{\mathrm{teacher}})$ 即可得到前者, 论文称之为奖励校正.

奖励校正有两个代价: 需要额外拿到教师 RL 之前的模型; 参考模型从小模型换成大模型, 计算对数概率的开销更高.

### 2.5 三词表算例

下面用一个构造的三词表例子看式 (8) 在单个位置上的效果. 设某一位置教师分布 $\pi^*=[0.5,0.3,0.2]$, 参考模型 $\pi_{\mathrm{ref}}=[0.2,0.3,0.5]$. 隐式奖励 $\log(\pi^*/\pi_{\mathrm{ref}})$ 依次为 $0.916,\ 0,\ -0.916$: 教师相对参考模型加强了第一个 token, 削弱了第三个. 按 $q_\lambda\propto(\pi^*)^\lambda(\pi_{\mathrm{ref}})^{1-\lambda}$ 归一化:

| $\lambda$ | $q_\lambda$ | 熵 (nats) |
| --- | --- | --- |
| 0 | [0.200, 0.300, 0.500] | 1.030 |
| 0.5 | [0.339, 0.322, 0.339] | 1.098 |
| 1 | [0.500, 0.300, 0.200] | 1.030 |
| 1.25 | [0.578, 0.276, 0.146] | 0.953 |
| 1.5 | [0.650, 0.246, 0.104] | 0.861 |
| 2 | [0.767, 0.184, 0.049] | 0.663 |

$\lambda$ 从 0 到 1, 目标从参考模型移到教师; 中点 $\lambda=0.5$ 是两者的几何平均, 这里几乎均匀. $\lambda>1$ 时, 目标沿 「参考模型到教师」 的方向继续走: 被 RL 加强的 token 更强, 被削弱的更弱, 分布变尖. 隐式奖励为 0 的 token (第二个) 不受外推直接作用, 只因归一化而变化.

这个例子也能看出外推的风险. $\lambda=2$ 时第三个 token 只剩 0.049. 如果某些位置的对数概率比因为偏差而异常大, 外推会把这种偏差一起放大, 这正是第 3.2 节作者对 $\lambda=1.5$ 不稳定的解释.

## 3. 实验设置与同尺寸单教师

### 3.1 实验设置

**同尺寸设置 (第 4.1 节)**. 学生与基座都是 Qwen3-4B-Non-Thinking. 数学 RL 数据取 DeepMath 中难度不低于 6 的 57K 条, 代码 RL 数据为 Eurus-RL-Code 的 25K 条, 分别做 GRPO 得到 Qwen3-4B-Non-Thinking-RL-Math 与 Qwen3-4B-Non-Thinking-RL-Code 两个领域教师; 蒸馏数据与 RL 数据相同. RL 奖励为二元: 数学答案正确或代码通过全部单元测试得 1.0, 否则 0.0. G-OPD 的 $\lambda$ 取 $\{0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5\}$, 参考模型固定为 Qwen3-4B-Non-Thinking. GRPO 与 G-OPD 都做 token 级 rollout 修正, 缓解训练与推理不一致, 实现基于 verl.

**评测**. 数学: AIME24, AIME25, HMMT25 (2 月), HMMT25 (11 月), 每题采 32 个解, 用 Math-Verify 判对错. 代码: HumanEval+, MBPP+, LiveCodeBench v6 (2025 年 2 月至 5 月), 每题采 4 个解. 温度 1.0, top-p 1.0, 最长生成 16384 token, 报平均准确率.

**超参 (附录 B)**:

| | 数学 GRPO | 代码 GRPO | G-OPD | SFT |
| --- | --- | --- | --- | --- |
| batch | 128 | 128 | 1024 | 1024 |
| 每题回答数 | 8 | 8 | 1 | 与 OPD 轨迹数一致 |
| 最长回答 | 16384 | 8192 | 16384 | 序列 32768 |
| 学习率 | 1e-6 | 1e-6 | 1e-5 | 1e-5 |
| 步数 | 500 | 300 | 50 / 100 | 与 G-OPD 一致 |
| KL 系数 | 0 | 0 | | |

GRPO 与 G-OPD 的最大 prompt 长度都是 2048, 采样温度和 top-p 都是 1.0; SFT 按整条序列 32768 截断, 另有 5% 的 warmup. G-OPD 在同尺寸实验中训练 50 步, 强到弱实验中 100 步. 作者发现在 「prompt 数 × 每题回答数」 固定时, prompt 数更大收敛更平滑; 继续增加蒸馏步数会因过拟合损害泛化. SFT 基线使用的教师轨迹数与 OPD 中学生生成的轨迹数相同.

### 3.2 同尺寸单教师: $\lambda$ 的影响

把数学或代码教师各自蒸馏回 Qwen3-4B-Non-Thinking, 结果见论文图 2 至图 4, 结论有三条.

1. 标准 OPD 能完整恢复后训练的效果, 学生的准确率与回答长度都与领域教师接近.
2. 奖励内插 ($0<\lambda<1$) 得到的学生, 成绩与回答长度都介于基座与教师之间, 并随 $\lambda$ 单调增长. 作者指出这一性质可用于控制推理预算.
3. 奖励外推 ($\lambda>1$) 优于标准 OPD. $\lambda=1.25$ 在所有设置下都超过 OPD 和领域教师; $\lambda=1.5$ 可能不稳定, 成绩下降. 作者的解释是, $\lambda$ 继续增大时, 学生有 hack 式 (6) 隐式奖励的风险: 它会激进地拟合对数概率比的峰值, 哪怕某些 token 的比值因偏差而过大. ExOPD 学生的回答长度持续增加, 作者认为可能来自隐式奖励的长度偏差, 这一偏差在他们此前的 LaSeR 工作中讨论过.

第 2 条结论给了 $\lambda$ 一个实用的用途: 在 $[0,1]$ 内调 $\lambda$, 可以得到一系列能力与回答长度都单调变化的学生, 作者引用 ORBIT 等多预算推理工作, 认为可以借此做推理预算控制. 论文没有给出内插区间各点的具体数值, 只有图 2 至图 4 的曲线.

### 3.3 与继续 RL 的教师比较

为排除 「教师训练不足」 的解释, 论文把数学教师再做 100 步 RL, 与只训练 50 步的 ExOPD 比较 (Table 1):

| | AIME24 | AIME25 | HMMT25 (2 月) | HMMT25 (11 月) | 平均 |
| --- | --- | --- | --- | --- | --- |
| 教师 | 58.0 | 54.6 | 32.5 | 38.9 | 46.0 |
| 教师 + 继续 RL 100 步 | 60.9 | 55.6 | 32.8 | 38.4 | 46.9 |
| ExOPD (50 步) | 62.7 | 56.1 | 33.9 | 39.3 | 48.0 |

继续 RL 平均只涨 0.9, ExOPD 涨 2.0, 并且 ExOPD 的训练步数更少.

## 4. 多教师合并与强到弱蒸馏

### 4.1 多教师合并: 设置与结果

把数学与代码两个 RL 教师合并回 Qwen3-4B-Non-Thinking. 根据第 3.2 节的结果, 后续所有实验固定 $\lambda=1.25$, 不再单独调参. 为了公平, OPD 与 ExOPD 中把数学数据下采样到与代码数据同量. 基线除 OPD 外还有两种: 在教师轨迹上做交叉熵的 SFT; 权重外推方法 ExPO, 先平均所有领域教师的权重, 再相对学生做外推, 外推系数在 $\{0.25, 0.5\}$ 中选.

Table 2 (教师行为对应领域的教师, 学生行为初始 Qwen3-4B-Non-Thinking):

| 方法 | AIME24 | AIME25 | HMMT 2 月 | HMMT 11 月 | 数学平均 | HumanEval+ | MBPP+ | LCB | 代码平均 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 教师 | 58.0 | 54.6 | 32.5 | 38.9 | 46.0 | 86.0 | 70.2 | 27.3 | 61.2 |
| 学生 | 21.5 | 21.9 | 10.0 | 8.0 | 15.4 | 74.7 | 64.7 | 17.9 | 52.4 |
| 单教师 ExPO | 58.7 | 55.2 | 32.4 | 37.0 | 45.8 | 84.8 | 70.2 | 28.0 | 61.0 |
| 单教师 OPD | 60.7 | 55.0 | 32.4 | 37.9 | 46.5 | 85.2 | 69.9 | 27.3 | 60.8 |
| 单教师 ExOPD | 62.7 | 56.1 | 33.9 | 39.3 | 48.0 | 86.9 | 70.7 | 28.6 | 62.1 |
| 多教师 SFT | 58.5 | 53.3 | 30.7 | 34.8 | 44.3 | 86.4 | 69.6 | 26.4 | 60.8 |
| 多教师 ExPO | 57.5 | 54.5 | 31.7 | 36.3 | 45.0 | 86.7 | 72.0 | 29.0 | 62.6 |
| 多教师 OPD | 60.6 | 54.1 | 32.5 | 38.3 | 46.4 | 84.6 | 69.5 | 27.6 | 60.6 |
| 多教师 ExOPD | 61.0 | 56.0 | 34.4 | 39.2 | 47.7 | 86.3 | 70.6 | 29.0 | 62.0 |

SFT 得到的学生次优; OPD 的上限基本被教师框住, 多教师 OPD 在 AIME25, HMMT 11 月, HumanEval+ 和 MBPP+ 上低于教师. ExPO 不需训练, 代码平均最高 (62.6), 但数学四项全部低于教师, 可控性差. 多教师 ExOPD 是唯一在全部 7 个基准上都超过对应领域教师的方法.

单教师与多教师 ExOPD 相比, 合并两个领域只损失很少: 数学平均 48.0 对 47.7, 代码平均 62.1 对 62.0, 其中 HMMT 2 月 (34.4 对 33.9) 和 LCB (29.0 对 28.6) 多教师反而更高. 多教师 OPD 与单教师 OPD 也接近 (数学 46.4 对 46.5, 代码 60.6 对 60.8). 这说明在同一基座派生的教师之间, 合并本身代价不大, ExOPD 的增益主要来自外推.

**训练动态.** 论文图 5 比较多教师设置下 OPD 与 ExOPD 的训练曲线 (系数 0.5 的 EMA 平滑): ExOPD 的训练奖励更高, 回答更长, 与图 4 的评测趋势一致; ExOPD 学生的回答熵也更高, 作者归因于回答更长带来更多样的输出.

### 4.2 强到弱蒸馏: 默认设置与奖励校正

教师为 Qwen3-30B-A3B-Instruct-2507, 学生分别为 Qwen3-1.7B-Non-Thinking 与 Qwen3-4B-Non-Thinking, 只做数学, 训练与评测数据同第 3.1 节. 默认只假设拥有教师和学生基座, 参考模型取学生基座. Table 3:

| | AIME24 | AIME25 | HMMT 2 月 | HMMT 11 月 | 平均 |
| --- | --- | --- | --- | --- | --- |
| 教师 | 74.7 | 62.8 | 44.2 | 57.2 | 59.7 |
| 1.7B 基座 | 12.3 | 11.4 | 6.8 | 4.5 | 8.8 |
| 1.7B SFT | 18.1 | 20.5 | 9.2 | 6.3 | 13.5 |
| 1.7B OPD | 33.0 | 28.7 | 15.7 | 14.9 | 23.1 |
| 1.7B ExOPD | 37.3 | 31.5 | 16.2 | 16.5 | 25.4 |
| 4B 基座 | 21.5 | 21.9 | 10.0 | 8.0 | 15.4 |
| 4B SFT | 45.4 | 40.9 | 22.4 | 31.6 | 35.1 |
| 4B OPD | 55.0 | 48.0 | 29.8 | 37.7 | 42.6 |
| 4B ExOPD | 58.7 | 50.8 | 33.0 | 38.8 | 45.3 |

ExOPD 相对 OPD 平均提升 2.3 (1.7B) 与 2.7 (4B), 八个单项全部提升. 尽管 $\log(\pi^*/\pi_{\mathrm{base}}^{\mathrm{student}})$ 因大小模型的知识差距与分布偏差带有噪声, 外推仍然有效. 两个规模上 OPD 都远好于 SFT, 1.7B 上 OPD 的平均成绩是 SFT 的 1.7 倍.

论文标题里的 「超越教师」 只在同尺寸设置中出现. 强到弱设置中, 4B ExOPD 的平均 45.3 离教师的 59.7 还差 14.4, 1.7B 差得更多; 外推缩小了师生差距, 没有让小学生追上大教师. 这与式 (8) 的含义一致: 外推方向由 $\log(\pi^*/\pi_{\mathrm{ref}})$ 决定, 学生容量不足时, 沿这个方向能走多远受学生自身限制.

**奖励校正.** Qwen3-30B-A3B-Instruct-2507 的 RL 前版本拿不到, 论文改用自己训练的 Qwen3-4B-Non-Thinking-RL-Math/Code 作教师, 以 Qwen3-4B-Non-Thinking 作为教师 RL 前的版本, 学生为 Qwen3-1.7B-Non-Thinking. 图 6 显示, 在数学 (四项平均) 与代码 (三项平均) 上, 奖励校正都进一步提升了 ExOPD. 论文正文只给出图, 没有对应的数值表.

### 4.3 训练更充分的教师

附录 C 把领域教师的 RL 训练加到 1200 步, 其余设置同第 3.1 节 (Table 8). 教师更强之后, ExOPD 的领先幅度变小:

| | 数学平均 | 代码平均 |
| --- | --- | --- |
| 教师 | 51.9 | 63.1 |
| 单教师 OPD | 51.7 | 62.9 |
| 单教师 ExOPD | 52.2 | 64.3 |
| 多教师 OPD | 51.9 | 62.0 |
| 多教师 ExOPD | 52.5 | 64.4 |

平均分上 ExOPD 仍然超过教师与 OPD. 单项上并非全部超过: 单教师 ExOPD 的 AIME25 为 59.2, HMMT 11 月为 42.8, 都略低于教师的 59.3 与 42.9; 多教师 ExOPD 的 HMMT 11 月为 42.7, 也略低于教师. 对比第 4.1 节 「全部 7 项超过教师」 的结论, 在教师训练充分时, 这一结论只在平均分上成立. 代码侧的优势保持得更好: 两种 ExOPD 的三个代码单项全部高于教师, 多教师 OPD 的代码平均反而比教师低 1.1. 教师训练 1200 步后, 数学平均从 46.0 升到 51.9, 外推可挖的余量也随之减少.

## 5. 散度光谱与复现

### 5.1 散度光谱: 与 f-散度蒸馏的关系

G-OPD 只改了奖励与正则的权重和参考模型, 散度始终是反向 KL. 蒸馏损失本身选哪种散度, 是另一条轴, 由前人工作展开.

给定凸函数 $f$ 且 $f(1)=0$, f-散度定义为

$$
D_f(P\,\|\,Q)=\sum_x Q(x)\,f\Bigl(\frac{P(x)}{Q(x)}\Bigr). \tag{12}
$$

由 Jensen 不等式 $D_f\ge0$, 等号当且仅当 $P=Q$. 取 $f(u)=u\log u$ 得 $\mathrm{KL}(P\|Q)$; 取 $f(u)=-\log u$ 得 $\mathrm{KL}(Q\|P)$. 设 $P$ 为教师, $Q$ 为学生, 前者是前向 KL, 倾向覆盖教师的全部概率质量; 后者是反向 KL, 倾向集中到教师的高概率模式上, OPD 与 G-OPD 用的是它. 取 $f(u)=\tfrac12|u-1|$ 得总变差 $\tfrac12\sum_x|P(x)-Q(x)|$, 取值在 $[0,1]$. Jensen-Shannon 散度 $\tfrac12\mathrm{KL}(P\|M)+\tfrac12\mathrm{KL}(Q\|M)$, $M=\tfrac12(P+Q)$, 也是 f-散度, 上界为 $\log2$. α-散度族 $f(u)=\frac{u^\alpha-\alpha(u-1)-1}{\alpha(\alpha-1)}$ 在 $\alpha\to1$ 时趋于前向 KL, $\alpha\to0$ 时趋于反向 KL, $\alpha=0.5$ 时与 Hellinger 距离的平方成正比.

在序列级蒸馏中系统使用 f-散度的是 Wen, Li, Du, Mou 的 f-distill (ACL 2023). 他们把序列级蒸馏写成最小化 f-散度, 给出 KL, 反向 KL, JS 与总变差四种变体, 指出已有的 SeqKD 与 ENGINE 分别是 KL 与反向 KL 蒸馏的近似, 并把序列级散度逐步分解为可计算的词级损失. 在四个文本生成数据集上, 对师生对称的 JS 与总变差损失优于非对称的两种, 作者认为对称损失缓解了模式平均与模式坍缩. GKD (Agarwal 等, ICLR 2024) 把散度作为超参, 既可用前向 KL, 反向 KL, 也可用以 $\beta$ 插值的广义 JSD, 并结合学生生成的数据. [04 SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) 在不同实验中分别用 JSD 与反向 KL, [02 OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md) 的消融里全词表前向 KL 优于反向 KL 与 JSD.

两条轴的作用对象不同. 散度轴决定每个位置上学生如何逼近一个给定目标; $\lambda$ 轴决定这个目标本身是什么, 由式 (8), 目标在对数空间里沿参考模型到教师的直线移动, $\lambda>1$ 时越过教师. G-OPD 论文只研究了后一条轴, 两条轴的组合 (例如外推后的目标配合 JSD 或前向 KL) 论文没有实验.

### 5.2 复现要点

按论文的设置, 在现有 OPD 实现上改成 ExOPD 只需几处:

1. 准备三个模型: 学生 $\pi_\theta$, 教师 $\pi^*$, 参考模型 $\pi_{\mathrm{ref}}$. 同基座多教师合并时参考模型就是学生的初始 checkpoint, 可以和学生共用一份冻结权重; 强到弱蒸馏默认也用学生基座, 能拿到教师 RL 前版本时换成它做奖励校正.
2. 学生对每个 prompt 采 1 条回答 (batch 1024, 温度 1.0, top-p 1.0, 最长 16384 token), 采样引擎与训练引擎的数值差异用 token 级 rollout 修正.
3. 在采样到的 token 上分别取学生, 教师, 参考模型的对数概率, 按式 (10) 算优势, $\lambda$ 取 1.25.
4. 以学习率 1e-5 做策略梯度更新; 同尺寸实验训练 50 步, 强到弱实验 100 步, 再多可能过拟合.
5. 监控训练奖励, 回答长度和熵. 论文中 ExOPD 这三项都高于 OPD; 若长度失控或成绩下降, 首先怀疑 $\lambda$ 偏大.

多教师时, 蒸馏数据就是各领域的 RL 数据, 数学 prompt 对应数学教师, 代码 prompt 对应代码教师, 两个领域的样本量要先对齐. 训练与评测使用同一提示模板: 数学题后接 `Please reason step by step, and put your final answer within \boxed{}.`, 代码题要求先思考再在末尾给出 Python 代码块.

## 6. 局限与相关方法

### 6.1 局限与开放问题

论文自身给出的限制:

1. **外推过度不稳定**. $\lambda=1.5$ 时成绩下降, 原因可能是学生 hack 隐式奖励. 论文只扫描了到 1.5 的若干点, 后续实验固定 1.25; 不同任务, 模型的合适 $\lambda$ 是否相同, 没有研究.
2. **回答变长**. ExOPD 的回答长度高于 OPD 与教师, 推理成本随之增加. 作者把它归因于隐式奖励的长度偏差, 但没有给出长度控制的办法.
3. **额外计算**. $\lambda\neq1$ 要计算 $\log\pi_{\mathrm{ref}}$; 奖励校正还要求参考模型是更大的教师基座.
4. **奖励校正的前提**. 需要拿到教师 RL 之前的版本. 对外部发布的教师 (如本文所用的 Qwen3-30B-A3B-Instruct-2507) 往往做不到, 论文自己也只能在 4B 教师上验证.

作者列出的后续工作: 在更大规模的模型上验证 ExOPD; 在更多, 更多样的领域教师上检验多教师合并的稳健性; 研究跨模型家族的 OPD 中 ExOPD 的效果.

从实验设计看还有两点. 一是多教师实验只有数学与代码两个教师, 且两者都由同一学生 RL 得到; 第 4.3 节显示教师训练充分后, 超过教师的幅度缩小到平均分的 0.3 到 1.3 分. 二是全部实验都在 Qwen3 家族内完成, 教师与学生共用同一套分词器.

### 6.2 与其他 OPD 方法的关系

G-OPD 给 OPD 提供了一个 RL 视角: 教师相对参考模型的对数概率偏移是 token 级奖励, 蒸馏强度是这个奖励的权重. 这一视角对本章其他方法也适用.

- [01 OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md) 是 $\lambda=1$ 的特例. OPD 方法的整体梳理见 [4.6-OPD](../../4.9-OPD.md) 与 [OPD 综述](../../4.9.2-OPD综述/01-Song-Zheng综述/01-Song-Zheng综述.md), 状态分布视角见 [4.6.3](../../4.9.3-状态分布视角/4.9.3-状态分布视角.md).
- 多教师蒸馏见 [09 MOPD](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md). 第 4.1 节沿用 MiMo-V2-Flash 的设置, 把同一基座的多个领域 RL 专家合并回基座, G-OPD 在其上加了奖励外推.
- [04 SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) 与 [03 SDFT](../03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md) 中, 教师是带额外上下文的同一模型. SDFT 把示范条件化教师与当前策略的对数比解释为隐式奖励, 与式 (6) 的形式相同, 只是参考模型换成了不带示范的自己.
- [06 SCOPE](../06-SCOPE-选择性反馈/06-SCOPE-选择性反馈.md) 讨论哪些 token 的教师信号可以采用, [07 OPD 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md) 讨论 OPD 在哪些条件下失效, 都与第 6.1 节的奖励 hack 和长度偏差相关.
- 论文相关工作一节还列了两条与 G-OPD 正交的方向: 跨模型家族的 OPD (Patiño 等 2025), 师生通常不共用分词器; 黑盒 OPD (Ye 等 2025), 拿不到教师 logits, 只能用教师生成的文本. 式 (10) 要求在同一个 token 上读出三个模型的对数概率, 这两种设定下都不能直接套用.

## 参考文献

1. Yang, W., Liu, W., Xie, R., Yang, K., Yang, S., Lin, Y. *Learning beyond Teacher: Generalized On-Policy Distillation with Reward Extrapolation*. arXiv:2602.12125, 2026. 代码: https://github.com/RUCBM/G-OPD
2. Agarwal, R., Vieillard, N., Zhou, Y., Stanczyk, P., Garea, S. R., Geist, M., Bachem, O. *On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes*. ICLR 2024. arXiv:2306.13649.
3. Gu, Y., Dong, L., Wei, F., Huang, M. *MiniLLM: Knowledge Distillation of Large Language Models*. ICLR 2024. arXiv:2306.08543.
4. Wen, Y., Li, Z., Du, W., Mou, L. *f-Divergence Minimization for Sequence-Level Knowledge Distillation*. ACL 2023. arXiv:2307.15190.
5. Lu, K., Thinking Machines Lab. *On-Policy Distillation*. Thinking Machines Lab: Connectionism, 2025. https://thinkingmachines.ai/blog/on-policy-distillation
6. Rafailov, R. et al. *Direct Preference Optimization: Your Language Model is Secretly a Reward Model*. NeurIPS 2023.
7. Cui, G. et al. *Process Reinforcement through Implicit Rewards*. arXiv:2502.01456, 2025.
8. Zheng, C., Wang, Z., Ji, H., Huang, M., Peng, N. *Model Extrapolation Expedites Alignment* (ExPO). ACL 2025.
9. Xiao, B. et al. *MiMo-V2-Flash Technical Report*. arXiv:2601.02780, 2026.
10. Yang, W. et al. *LaSeR: Reinforcement Learning with Last-Token Self-Rewarding*. arXiv:2510.14943, 2025.
11. Csiszár, I. *Information-type measures of difference of probability distributions and indirect observations*. Studia Scientiarum Mathematicarum Hungarica, 2: 299–318, 1967.
