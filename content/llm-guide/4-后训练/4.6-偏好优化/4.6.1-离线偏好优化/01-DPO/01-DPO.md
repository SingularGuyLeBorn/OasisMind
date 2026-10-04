---
title: "01 · DPO: 隐式奖励直接优化"
published: true
tags: ["DPO", "RLHF", "Bradley-Terry", "隐式奖励", "偏好优化"]
excerpt: "DPO (Direct Preference Optimization) 从带 KL 约束的 RLHF 目标推出最优策略的闭式解, 反解出隐式奖励, 再把成对偏好写成一条二元分类损失."
---
# 01 DPO: 隐式奖励直接优化

Rafailov, Sharma, Mitchell, Ermon, Manning, Finn 的 *Direct Preference Optimization: Your Language Model is Secretly a Reward Model* ([arXiv:2305.18290](https://arxiv.org/abs/2305.18290)) 处理的问题是: RLHF 要先训一个独立奖励模型, 再用 PPO 在线优化, 能否跳过这两步, 直接在偏好数据上训练策略. 公式和数字以 [arXiv HTML](https://arxiv.org/html/2305.18290) 为准; 同目录的 [SimPO](../05-SimPO-无参考长度平均/05-SimPO-无参考长度平均.md), [KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md), [ORPO](../04-ORPO/04-ORPO.md) 都从 DPO 改出来, 区别集中在 6.1 节的表里.

## 1. RLHF 的三阶段与那份独立奖励模型

### 1.1 三阶段流程

Ziegler, Stiennon, Ouyang 等人的 RLHF 流程分三段. 第一段在下游任务数据上做 SFT, 得到 $\pi^{\mathrm{SFT}}$. 第二段用 $\pi^{\mathrm{SFT}}$ 对 prompt $x$ 采两条回答, 让人标出哪条更好, 记作 $y_w\succ y_l\mid x$, 再用这些比较拟合一个奖励模型 $r_\phi$. 第三段把 $r_\phi$ 当作环境给出的奖励, 用 PPO 最大化它, 同时用 KL 散度限制策略离参考分布的距离, 参考分布通常就是 $\pi^{\mathrm{SFT}}$.

偏好用 Bradley-Terry 模型描述. 假设存在一个看不见的潜在奖励 $r^*$, 人给出的成对比较服从

$$
p^*(y_1\succ y_2\mid x)
=
\frac{\exp\bigl(r^*(x,y_1)\bigr)}{\exp\bigl(r^*(x,y_1)\bigr)+\exp\bigl(r^*(x,y_2)\bigr)}
=
\sigma\bigl(r^*(x,y_1)-r^*(x,y_2)\bigr).
\tag{1}
$$

这里的 $\sigma$ 是 logistic 函数. 式 (1) 的右边只含奖励差, 给 $r^*$ 加上任何只依赖 $x$ 的函数, 偏好概率都不变. 2.4 节会用到这一点.

### 1.2 奖励模型的训练目标

给定静态比较集 $\mathcal{D}=\{x^{(i)},y_w^{(i)},y_l^{(i)}\}_{i=1}^{N}$, 奖励模型按二元分类的负对数似然训练:

$$
\mathcal{L}_R(r_\phi,\mathcal{D})
=
-\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\bigl[\log\sigma\bigl(r_\phi(x,y_w)-r_\phi(x,y_l)\bigr)\bigr].
\tag{2}
$$

在语言模型上, $r_\phi$ 一般从 $\pi^{\mathrm{SFT}}$ 初始化, 在最后一层 Transformer 上接一个输出标量的线性头. 以往的工作还会把奖励做中心化, 让 $\mathbb{E}_{x,y}[r_\phi(x,y)]=0$, 降低方差.

### 1.3 RL 阶段的目标

第三段优化带 KL 约束的期望奖励:

$$
\max_{\pi_\theta}\;
\mathbb{E}_{x\sim\mathcal{D},\,y\sim\pi_\theta(y\mid x)}
\bigl[r_\phi(x,y)\bigr]
-
\beta\,\mathbb{D}_{\mathrm{KL}}\bigl[\pi_\theta(y\mid x)\,\Vert\,\pi_{\mathrm{ref}}(y\mid x)\bigr].
\tag{3}
$$

$\beta$ 控制策略可以离参考分布多远. KL 项有两个作用: 防止策略跑到奖励模型没见过, 打分不准的区域; 保持生成的多样性, 防止塌缩到少数高分回答上. 语言生成是离散采样, 式 (3) 对 $\theta$ 不可直接求导, 常见做法是把每条样本的奖励改写成 $r_\phi(x,y)-\beta\bigl(\log\pi_\theta(y\mid x)-\log\pi_{\mathrm{ref}}(y\mid x)\bigr)$, 交给 PPO.

这样一来训练期间要同时放四份权重: 可训的策略 $\pi_\theta$, 价值网络 $V$, 奖励模型 $r_\phi$, 冻结的 $\pi_{\mathrm{ref}}$. 每一步还要从当前策略在线采样. 奖励模型有偏差时, 策略会去利用这些偏差拿高分, 这就是奖励黑客. PPO 本身对学习率, clip 范围, KL 系数等超参也比较敏感. 论文要回答的问题是: 对同一个式 (3), 能否不训奖励模型, 不跑 RL, 直接在策略上做一次分类.

![RLHF 四模型与 DPO 无独立 RM](./images/fig-dpo-vs-rlhf-rm.png)

> 图 1: 左列 SFT 之后单独训 $r_\phi$, PPO 再同时加载 Actor, Critic, RM, 参考模型; 右列偏好对 $(x,y_w,y_l)$ 直接进 DPO, 只留可训的 $\pi_\theta$ 与冻结的 $\pi_{\mathrm{ref}}$.

**图 1 解析**

- 两列都从上往下读. 左列多出来的橙色框是独立奖励模型, 粉色框把四份权重放进 PPO.
- 右列顶部是偏好三元组. 绿框 $\pi_\theta$ 和灰框 $\pi_{\mathrm{ref}}$ 并行算对数概率, 合成隐式奖励, 再进 Bradley-Terry.
- 右列没有价值网络, 也没有单独的 $r_\phi$. 页脚两行分别写 four models 和 policy is the reward.

DPO 保留式 (3) 这个目标, 改的是奖励的参数化方式. 奖励改由策略和参考模型的对数概率比表示, 最优策略因此有闭式解, 配分函数在成对相减时消掉, RL 循环就不需要了.

## 2. 最优策略与隐式奖励

### 2.1 推导

先不管奖励从哪来. 对任意奖励 $r(x,y)$ 和参考 $\pi_{\mathrm{ref}}$, 固定一个 $x$, 把式 (3) 的目标改写成最小化问题:

$$
\begin{aligned}
&\max_\pi\;\mathbb{E}_{y\sim\pi}\bigl[r(x,y)\bigr]-\beta\,\mathbb{D}_{\mathrm{KL}}\bigl[\pi\Vert\pi_{\mathrm{ref}}\bigr]\\
=\;&\min_\pi\;\mathbb{E}_{y\sim\pi}\Bigl[\log\frac{\pi(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}-\frac{1}{\beta}r(x,y)\Bigr]\\
=\;&\min_\pi\;\mathbb{E}_{y\sim\pi}\Biggl[\log\frac{\pi(y\mid x)}{\frac{1}{Z(x)}\pi_{\mathrm{ref}}(y\mid x)\exp\bigl(\frac{1}{\beta}r(x,y)\bigr)}-\log Z(x)\Biggr].
\end{aligned}
$$

第二行是把整个式子除以 $-\beta$, 最大化变成最小化. 第三行在分母里乘了 $1/Z(x)$, 再在外面减掉 $\log Z(x)$ 补回来. 只要 $Z(x)$ 选成

$$
Z(x)=\sum_y \pi_{\mathrm{ref}}(y\mid x)\exp\Bigl(\frac{1}{\beta}r(x,y)\Bigr),
$$

分母就是一个合法的概率分布, 记作 $\pi^*$. 这时目标变成 $\mathbb{D}_{\mathrm{KL}}(\pi\Vert\pi^*)-\log Z(x)$. $Z(x)$ 与正在优化的 $\pi$ 无关, KL 散度非负, 且只在两个分布相等时取 0 (Gibbs 不等式). 所以最优解是

$$
\pi_r(y\mid x)
=
\frac{1}{Z(x)}\,
\pi_{\mathrm{ref}}(y\mid x)
\exp\Bigl(\frac{1}{\beta}r(x,y)\Bigr).
\tag{4}
$$

这是论文附录 A.1 的推法. 把 $\pi_r$ 对 $y$ 求和, 得到 $\frac{1}{Z(x)}\sum_y\pi_{\mathrm{ref}}\exp(r/\beta)=Z(x)/Z(x)=1$, 归一化成立.

### 2.2 用三条回答看 $\beta$ 和 $Z(x)$

式 (4) 是对参考分布做指数加权. $\beta$ 越小, 权重 $\exp(r/\beta)$ 在不同回答之间差得越悬殊. $\beta\to0$ 时, 概率全部集中到 $\pi_{\mathrm{ref}}$ 支撑集里奖励最高的那条回答上, 等于只做奖励最大化. $\beta\to\infty$ 时, $\exp(r/\beta)\to1$, $\pi_r\to\pi_{\mathrm{ref}}$, 策略退回参考模型. 中间的 $\beta$ 在两者之间取折中.

两个极限之间的情形, 用一个只有三条候选回答的例子看式 (4) 的效果. 设 $\pi_{\mathrm{ref}}=(0.5,0.3,0.2)$, 奖励 $r=(0,1,2)$.

取 $\beta=1$: 未归一化权重是 $0.5$, $0.3e\approx0.815$, $0.2e^2\approx1.478$, 和 $Z\approx2.793$. 归一化后 $\pi_r\approx(0.179,0.292,0.529)$. 参考模型里概率最小的第三条回答, 因为奖励最高, 变成了最可能的回答.

取 $\beta=0.5$: 权重是 $0.5$, $0.3e^2\approx2.217$, $0.2e^4\approx10.92$, $Z\approx13.64$. 归一化后 $\pi_r\approx(0.037,0.163,0.801)$. $\beta$ 减半, 第三条回答的概率从 0.53 升到 0.80, 分布明显变尖.

这个例子能算出 $Z$, 是因为候选只有三条. 真实场景里 $Z(x)$ 要对所有可能的回答求和. 回答是变长 token 序列, 候选数随长度指数增长, 求不出来, 也很难估准. 即使奖励已经用 $r_\phi$ 的最大似然估计代替, 式 (4) 依然没法直接拿来训练. control as inference, reward-weighted regression 这类方法都要面对这个配分函数. DPO 的处理是: 训练时不去估 $Z(x)$, 把它留在反解出来的奖励表达式里, 让它在成对相减时消掉.

### 2.3 反解隐式奖励

对式 (4) 两边取对数并移项:

$$
r(x,y)
=
\beta\log\frac{\pi_r(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}
+
\beta\log Z(x).
\tag{5}
$$

接着用第 2.2 节 $\beta=1$ 的数验证. $\log(0.179/0.5)\approx-1.027$, $\log(0.292/0.3)\approx-0.027$, $\log(0.529/0.2)\approx0.973$. 三个数分别加上 $\log Z=\log2.793\approx1.027$, 得到 $0,1,2$, 正好是原来的奖励. 三者两两相减, 差是 $1$ 和 $2$, 跟 $\log Z$ 无关.

### 2.4 代入 Bradley-Terry, $Z(x)$ 成对抵消

同一个 $x$ 下, $Z(x)$ 对所有 $y$ 都是同一个数. 把式 (5) 代入式 (1), 两个 $\beta\log Z(x)$ 相减为零:

$$
p^*(y_1\succ y_2\mid x)
=
\sigma\Biggl(
\beta\log\frac{\pi^*(y_1\mid x)}{\pi_{\mathrm{ref}}(y_1\mid x)}
-
\beta\log\frac{\pi^*(y_2\mid x)}{\pi_{\mathrm{ref}}(y_2\mid x)}
\Biggr).
\tag{6}
$$

论文正文把这一步写成 $1/(1+\exp(\cdots))$ 的形式, 和 $\sigma$ 写法等价, 附录 A.2 有逐步代入. 偏好不是成对而是 $K$ 条排序时, 用 Plackett-Luce 模型, 归一化常数同样消掉, 损失变成逐位置的 softmax, 见附录 A.3.

式 (6) 说明, 人类偏好的概率可以完全用最优策略和参考策略表示, 奖励模型这个中间量不再出现.

### 2.5 等价类与可识别性

训练时用可训的 $\pi_\theta$ 代替未知的 $\pi^*$, 隐式奖励定义为

$$
\hat r_\theta(x,y)=\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)},
$$

其中没有 $Z(x)$. 去掉 $Z(x)$ 为什么合法, 论文 §5.1 用等价类说明. 若 $r'(x,y)=r(x,y)+f(x)$, 则两者诱导的 Bradley-Terry 偏好分布相同 (Lemma 1), 在式 (3) 下的最优策略也相同 (Lemma 2). Theorem 1 进一步证明: 在 $\pi_{\mathrm{ref}}(y\mid x)>0$, $\beta>0$ 的条件下, 与 Plackett-Luce (含 Bradley-Terry) 模型相容的每个奖励等价类, 都能用 $r(x,y)=\beta\log\frac{\pi(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}$ 表示, 其中 $\pi$ 是某个合法分布.

证明的构造是投影

$$
f(r;\pi_{\mathrm{ref}},\beta)(x,y)=r(x,y)-\beta\log\sum_{y'}\pi_{\mathrm{ref}}(y'\mid x)\exp\Bigl(\frac{1}{\beta}r(x,y')\Bigr),
$$

也就是把 $\beta\log Z(x)$ 从奖励里减掉. 减掉之后, $\pi_{\mathrm{ref}}\exp(f/\beta)$ 对 $y$ 的和恰好是 1. 论文的 Proposition 1 补充了唯一性: 每个等价类里只有一个奖励能写成这种对数比形式. 所以 DPO 并没有损失表达能力, 它只是在每个等价类里挑出满足「对应策略是合法分布」的那一个代表.

### 2.6 手算: 常数从未进入 $\sigma$

设某条 $x$ 下, $\beta\log(\pi/\pi_{\mathrm{ref}})$ 在 $y_w$ 上是 $1.5$, 在 $y_l$ 上是 $0.4$, $\beta\log Z(x)=0.3$. 完整奖励分别是 $1.8$ 和 $0.7$, 差是 $1.1$. 只用对数比相减, 差还是 $1.1$. $\sigma(1.1)\approx0.75$, 两种算法得到的偏好概率相同.

![隐式奖励差经 BT 进入 DPO 损失](./images/fig-dpo-implicit-reward.png)

> 图 2: 同一 $x$ 下两条回答的隐式奖励做差, $Z(x)$ 抵消, 剩下的对数比进 Bradley-Terry 的 $\sigma$, 再取负对数得到 $\mathcal{L}_{\mathrm{DPO}}$.

**图 2 解析**

- 五个框从左到右排列. 浅蓝框写的是式 (5), 带着 $+\beta\log Z(x)$.
- 黄框把同一条 $x$ 配上 $y_w$ 和 $y_l$. 绿框做差, $Z(x)$ 消掉, 虚线注脚标明它与 $y$ 无关.
- 青绿框是 $\sigma(r_w-r_l)$, 橙框是 $-\log\sigma(\cdots)$, 对应式 (7). 页脚的 offline pairs 指损失计算中没有从当前 $\pi_\theta$ 再采样.

## 3. 损失与梯度

### 3.1 损失: 偏好似然直接写在策略上

式 (6) 已经是「人更喜欢 $y_w$」的概率, 参数只在 $\pi_\theta$ 和冻结的 $\pi_{\mathrm{ref}}$ 上. 对它做最大似然, 取负对数:

$$
\mathcal{L}_{\mathrm{DPO}}(\pi_\theta;\pi_{\mathrm{ref}})
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
\tag{7}
$$

式 (7) 和式 (2) 的形状一样, 区别在于奖励换成了 $\hat r_\theta$. 所以论文标题说语言模型本身就是一个奖励模型: 拟合式 (7) 等于在拟合一个重参数化的 Bradley-Terry 模型, 拟合完, 策略就是对应奖励下式 (3) 的最优解.

训练是离线的二元分类. batch 里每条样本都是标好的三元组, 训练过程中不从当前策略采样. $\sigma$ 的自变量是两条回答的隐式奖励差. 差越大, $\sigma$ 越接近 1, 这条样本的损失越接近 0. 差为负时, 隐式奖励把输赢排反了, 损失接近 $-\log\sigma$(大负数), 梯度也大.

式 (7) 里需要手动设定的只有 $\beta$. 它来自式 (3), 含义和 RLHF 中的 KL 系数相同. 论文附录 B 的默认设置是 $\beta=0.1$, batch size 64, RMSprop 优化器, 学习率 $1\times10^{-6}$, 前 150 步线性 warmup. TL;DR 摘要实验把 $\beta$ 改成 0.5, 其他不变. 论文说明几乎没有调超参, 因此 TL;DR 上的结果可能低估了 DPO. IMDb 实验扫过 $\beta\in\{0.05,0.1,1,5\}$. $\beta$ 增大, 策略更难离开 $\pi_{\mathrm{ref}}$; 减小, 策略更敢拉大偏好差.

### 3.2 参考模型的选择

论文给的流程是两步. 先对每个 $x$ 从 $\pi_{\mathrm{ref}}$ 采样 $y_1,y_2$, 由人标出偏好, 构成离线数据集 $\mathcal{D}$. 再固定 $\pi_{\mathrm{ref}}$ 和 $\beta$, 最小化式 (7).

实际中常用公开偏好数据集, 这些数据往往不是当前 $\pi_{\mathrm{ref}}$ 采出来的, 存在分布偏移. 论文的建议: 有生成数据所用的 SFT 模型时, 令 $\pi_{\mathrm{ref}}=\pi^{\mathrm{SFT}}$; 没有时, 在 chosen 回答上做一次最大似然, 即 $\pi_{\mathrm{ref}}=\arg\max_\pi\mathbb{E}_{x,y_w\sim\mathcal{D}}[\log\pi(y_w\mid x)]$, 缩小参考分布与数据分布的差距. Anthropic-HH 实验就是这样做的: 先让 Pythia-2.8B 在 chosen 回答上做 Preferred-FT, 再在它的基础上训 DPO.

### 3.3 梯度形式与样本权重

对 $\theta$ 求导 (论文 §4):

$$
\nabla_\theta\mathcal{L}_{\mathrm{DPO}}
=
-\beta\,\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\Bigl[
\sigma\bigl(\hat r_\theta(x,y_l)-\hat r_\theta(x,y_w)\bigr)
\bigl(
\nabla_\theta\log\pi_\theta(y_w\mid x)
-
\nabla_\theta\log\pi_\theta(y_l\mid x)
\bigr)
\Bigr].
\tag{8}
$$

括号里是直接的「抬高 $y_w$ 的似然, 压低 $y_l$ 的似然」. 前面的 $\sigma(\hat r_l-\hat r_w)$ 是每条样本的权重: 隐式奖励把 $y_l$ 排得越高, 权重越大; 已经排对且差距大, 权重接近 0, 这条样本几乎不再更新.

权重的大小可以手算. 设 $\beta=0.1$. 若 $\log(\pi_\theta/\pi_{\mathrm{ref}})$ 在 $y_w$ 上是 $2.0$, 在 $y_l$ 上是 $0$, 则 $\hat r_w=0.20$, $\hat r_l=0$, 权重 $\sigma(-0.20)\approx0.45$. 若排反, $\hat r_w=0$, $\hat r_l=0.40$, 权重 $\sigma(0.40)\approx0.60$, 更新更重. 若已经拉开到 $\hat r_w=2$, $\hat r_l=0$, 权重 $\sigma(-2)\approx0.12$, 更新很轻. 三种情况的梯度方向一样, 大小相差五倍.

这个权重不能省. 把 $\sigma$ 权重拿掉, 就是 Unlikelihood 训练: 最大化 $\log\pi(y_w)$, 同时最小化 $\log\pi(y_l)$, 后者可以乘一个系数 $\alpha\in[0,1]$. 论文在 IMDb 情感任务上还保留了它, 在摘要和对话任务上不再报告, 因为它生成的是无意义文本. 附录 Table 3 给了两条温度 1.0 下的 TL;DR 样本, 摘要都退化成 `when when when` 一类的重复. 论文的解释是: 不加约束地压低 $y_l$ 的似然会破坏语言模型. 式 (8) 的权重让已经排对的样本停下来, 防止 $y_l$ 的似然被一直往下压.

### 3.4 用同一套参数化看 PPO 的不稳定

论文 §5.2 把同样的分析用在 PPO 上. 从 control as inference 的角度, RL 阶段相当于最小化 $\mathbb{D}_{\mathrm{KL}}[\pi_\theta\Vert\pi^*]$, 展开后目标里会出现

$$
r_\phi(x,y)-\beta\log\sum_y\pi_{\mathrm{ref}}(y\mid x)\exp\Bigl(\frac{1}{\beta}r_\phi(x,y)\Bigr)-\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}.
$$

中间那一项是参考策略在奖励 $r_\phi$ 下的 soft value. 它不改变最优解, 但去掉它, 策略梯度的方差会变大. 以往的做法是学一个价值函数, 或者用人类回答的奖励当单样本基线, 去近似这一项. DPO 选出的奖励表示已经满足配分函数为 1, 所以不需要额外的基线.

## 4. 实验数字

### 4.1 IMDb 情感: 奖励与 KL 的前沿

论文的实验回答两个问题: 在可控任务上, DPO 在「奖励」和「离参考的 KL」之间的权衡是否优于 PPO; 在更大的模型和更难的任务上 DPO 表现如何. 所有实验的模型都不超过 6B. 摘要和对话任务用 GPT-4 (`gpt-4-0314`) 当裁判算胜率.

第一个问题要求真实奖励可以直接算, 论文选了 IMDb 情感续写. 输入 $x$ 是 IMDb 影评的前缀, 长度 2 到 8 个 token, 目标是生成正面情感的续写. 基座是 GPT-2-large, 先在 IMDb 训练集上 SFT 1 个 epoch. 真实奖励由现成的情感分类器 `siebert/sentiment-roberta-large-english` 给出. 偏好数据这样构造: 对 25000 个前缀各采 4 条续写, 按分类器分数两两组成 6 个偏好对.

对照方法的设置: RLHF 的奖励模型从 GPT-2-large 初始化, 在偏好数据上训 3 个 epoch, 取验证集准确率最高的 checkpoint. 扫参范围是 PPO 的目标 KL $\in\{3,6,9,12\}$, DPO 的 $\beta\in\{0.05,0.1,1,5\}$, Unlikelihood 的 $\alpha\in\{0.05,0.1,0.5,1\}$, Preferred-FT 换随机种子, 共 22 次训练. 训练中每 100 步在测试前缀上算一次真实奖励的均值和相对 $\pi_{\mathrm{ref}}$ 的序列级 KL. PPO-GT 是直接拿真实奖励训的 PPO, 有两个版本: TRL 库的默认超参, 以及作者加了奖励归一化, 把 batch 提到每步 1024 的改进版.

结果 (Figure 2 左): DPO 的奖励-KL 前沿在所有方法之上, 连能直接看到真实奖励的 PPO-GT 也在它下面. 两者优化的是同一个式 (3), 差别在于优化效率.

### 4.2 TL;DR 摘要: 胜率与温度

数据是 Reddit 帖子和 Stiennon 等人标注的摘要偏好. SFT 模型是 CarperAI 基于 GPT-J 训的 `openai_summarize_tldr_sft`, DPO, PPO, Preferred-FT 都从它出发. 偏好数据由另一个训练方式相近的 SFT 模型采样生成, 所以这里的数据并非当前模型的在线样本. 在测试集上, 用 GPT-4 对比模型摘要和人写的参考摘要, 统计胜率, 采样温度从 0.0 扫到 1.0.

结果 (Figure 2 右): 温度 0 时 DPO 胜率约 61%, PPO 在它的最佳温度 0 上是 57%. DPO 的最高点也高于 Best of $N$. Best of $N$ 指从 SFT 模型采 $N$ 条, 用学到的奖励模型挑最高分的一条. PPO 在温度升高时, 胜率可以掉回 GPT-J 基座的水平; DPO 对温度的变化稳定得多. Preferred-FT 相对 SFT 几乎没有提升.

论文附录 Figure 4 扫了 Best of $N$ 的 $N\in\{1,4,16,64,128\}$, 摘要和对话两个任务上胜率在 64 到 128 附近趋平. Best of $N$ 的开销在推理阶段: 每条查询要采 $N$ 次再用奖励模型打分; DPO 训完之后一次前向生成就够.

人工评测里, 温度 0.25 的 DPO 对温度 0 的 PPO, 人类判 DPO 胜的比例是 58%.

### 4.3 分布外: CNN/DailyMail

把 TL;DR 上训好的 DPO 和 PPO 直接用在 CNN/DailyMail 新闻上, 提示词里的 forum post 换成 news article, 用 GPT-4 对比数据集自带的参考摘要. 温度取 TL;DR 上表现最好的 0 和 0.25 (Table 1):

| 算法 | 温度 0 | 温度 0.25 |
|------|------:|---------:|
| DPO | 0.36 | 0.31 |
| PPO | 0.26 | 0.23 |

DPO 在新闻域上仍然领先. PPO 训练时还用了额外的无标注 Reddit 帖子来采样, DPO 没有用到这些 prompt. 论文把这组结果称为 initial evidence, 后续能否用 DPO 策略给无标注 prompt 自己打标签, 列为未来工作.

### 4.4 Anthropic-HH 单轮对话

Anthropic Helpful and Harmless 数据集有 170k 段人机对话, 每段末尾有一对回答和偏好标签, 生成回答所用的模型未公开. 没有现成的 SFT 模型, 所以从 Pythia-2.8B 出发, 先 Preferred-FT 再 DPO. GPT-4 以测试集的 chosen 回答为参照算胜率.

对照包括 Best of 128 (从 Preferred-FT 模型采 128 条, 用奖励模型挑最好的), Pythia-2.8B 的 2-shot 提示, 以及网上公开的一份 PPO 训练的 Pythia-6B. 作者没能找到让这份 PPO 模型超过 Pythia-2.8B 基座的提示或温度, 于是把 Best of 128 当作 PPO 水平的粗略代替, 理由是两者优化的是同一个奖励.

结果 (Figure 3): DPO 是唯一明显高于测试集 chosen 回答的高效方法. Best of 128 的胜率接近, 但每条查询要采 128 次. 训练过程中, DPO 在不同温度下的胜率都较早稳定下来.

### 4.5 GPT-4 判分与人类是否一致

为了验证 GPT-4 胜率的可信度, 论文做了人工评测 (Table 2). 三组对比都以温度 0 的 PPO 为对手: 温度 0.25 的 DPO, 温度 0.25 的 SFT, 温度 1.0 的 PPO. GPT-4 用了两套提示: (S) 只问哪条摘要更好地概括了要点; (C) 额外要求简洁. 评测者是 25 名志愿者, 每人评 25 条, 来自斯坦福 STEM 专业.

| | DPO | SFT | PPO-1 |
|--|----:|----:|------:|
| 评分数 $N$ | 272 | 122 | 199 |
| GPT-4 (S) 胜率 % | 47 | 27 | 13 |
| GPT-4 (C) 胜率 % | 54 | 32 | 12 |
| 人类胜率 % | 58 | 43 | 17 |
| GPT-4 (S) 与人一致 % | 70 | 77 | 86 |
| GPT-4 (C) 与人一致 % | 67 | 79 | 85 |
| 人与人一致 % | 65 | — | 87 |

SFT 那一列每条只有一人评, 所以没有人与人一致率. GPT-4 与人的一致率和人与人的一致率处在同一水平. (C) 的胜率更接近人类胜率, 主文的摘要实验因此用 (C).

GPT-4 也会判错. 附录 Table 10 中, 用户问 `what is 7 plus 2`, DPO 回答 9 但比较啰嗦, 数据集 chosen 回答 11, GPT-4 却判 chosen 更好. 自动胜率只能当代理指标.

## 5. 实现

### 5.1 损失代码

附录 B 把式 (7) 写成几行 PyTorch. 输入是 batch 里每条 completion 在 $\pi_\theta$ 和 $\pi_{\mathrm{ref}}$ 下的序列对数概率:

```python
import torch.nn.functional as F

def compute_dpo_loss(policy_chosen_logps, policy_rejected_logps,
                     reference_chosen_logps, reference_rejected_logps,
                     beta=0.1):
    pi_logratios = policy_chosen_logps - policy_rejected_logps
    ref_logratios = reference_chosen_logps - reference_rejected_logps
    logits = pi_logratios - ref_logratios
    loss = -F.logsigmoid(beta * logits).mean()
    chosen_rewards = beta * (policy_chosen_logps - reference_chosen_logps).detach()
    rejected_rewards = beta * (policy_rejected_logps - reference_rejected_logps).detach()
    return loss, chosen_rewards, rejected_rewards
```

`chosen_rewards` 和 `rejected_rewards` 是 `detach` 后的隐式奖励, 只用于记日志. 常见的两个监控量是 `rewards/accuracies` (满足 $\hat r(y_w)>\hat r(y_l)$ 的比例) 和 `rewards/margins` (二者均值之差). 准确率趋向 1, 间隔变大, 说明隐式奖励在训练集上排对了; 生成质量仍要另外评估.

### 5.2 序列对数概率

序列对数概率是逐 token 的 $\log\pi(y_t\mid x,y_{<t})$ 之和, prompt 部分的 token 要 mask 掉, 只对 completion 求和. 每条样本要算四次前向: chosen 和 rejected 分别过 $\pi_\theta$ 和 $\pi_{\mathrm{ref}}$, 实现上通常把 chosen 和 rejected 拼进同一个 batch. $\pi_{\mathrm{ref}}$ 必须和 $\pi_\theta$ 用同一个分词器和同一套对话模板, 否则对数比比较的是两种不同切分下的概率. 长序列的对数概率在半精度下累加容易损失精度, 求和一般放在 float32 里做.

Hugging Face TRL 的 `DPOTrainer` 实现的就是这套计算, 数据字段是 `prompt`, `chosen`, `rejected`, 参考模型冻结, 训练过程不做 rollout. 库的默认超参和论文附录 B 不完全相同, 复现论文数字应以附录为准.

### 5.3 手算一条样本的损失

设 $\beta=0.1$, $\ell_\theta^{w}=-12$, $\ell_\theta^{l}=-10$, $\ell_{\mathrm{ref}}^{w}=\ell_{\mathrm{ref}}^{l}=-11$. `pi_logratios` $=-2$, `ref_logratios` $=0$, `logits` $=-2$, 乘 $\beta$ 得 $-0.20$. $\sigma(-0.20)\approx0.45$, 损失 $-\log0.45\approx0.80$. 当前策略给输家的概率比赢家高, 这条样本还在学.

把 $\ell_\theta^{w}$ 改成 $-9$: `logits` $=+1$, 乘 $\beta$ 得 $0.10$, $\sigma(0.10)\approx0.525$, 损失约 $0.64$. 损失下降了, 但离 0 还远. 要让损失降到 0.1 以下, $\beta\cdot$`logits` 需要大于 2.25, 也就是在 $\beta=0.1$ 时对数比的差超过 22.5. 这说明小 $\beta$ 下 DPO 会持续推动对数比拉开, 6.2 节的过度优化问题与此有关.

用 LoRA 训练时, 参考模型可以和策略共用主干权重, 关掉 adapter 就得到 $\pi_{\mathrm{ref}}$ 的前向. 这样省的是一份权重的显存, 两套对数概率的前向计算仍然要做.

## 6. 相邻方法与失效模式

### 6.1 与相邻方法的分工

同一条思路衍生出很多变体, 区别在于数据形态, 是否需要参考模型, 奖励怎么定义.

| | 数据 | $\pi_{\mathrm{ref}}$ | 独立 RM | 奖励或目标 |
|--|------|----------------------|---------|-----------|
| PPO | 在线 $y\sim\pi_\theta$ | 要 | 要, 另加价值网络 | 最大化 $r_\phi$, KL 约束 |
| DPO | $(x,y_w,y_l)$ | 要 | 不要 | $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$ 进 BT 的 $\log\sigma$ |
| IPO | 成对 | 要 | 不要 | 同一对数比, 平方损失回归到目标间隔 |
| ORPO | 成对 | 不要 | 不要 | SFT 交叉熵加 odds ratio 项 |
| KTO | 单条加二值标签 | 要 | 不要 | 相对参考点 $z_0$ 的前景理论效用 |
| SimPO | 成对 | 不要 | 不要 | $(\beta/\lvert y\rvert)\log\pi_\theta$, 减间隔 $\gamma$ |

PPO 和组相对的 GRPO 都需要在线采样, 见 [04-PPO](../../../4.4-强化学习基础/04-PPO/04-PPO.md) 和 [02-GRPO](../../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md). IPO (Azar 等, [arXiv:2310.12036](https://arxiv.org/abs/2310.12036)) 针对的是 DPO 在偏好接近确定时会把对数比推向无穷的问题, 用平方损失代替 $\log\sigma$, 见 [03-IPO](../02-IPO-身份偏好优化/02-IPO-身份偏好优化.md). 只有点赞点踩, 没有成对数据时用 KTO. 想去掉参考模型时看 ORPO 和 SimPO. 偏好数据想换成当前策略的在线样本, 看 [06-OAIF](../../4.6.2-在线偏好与自对弈/01-OAIF-在线AI反馈/01-OAIF-在线AI反馈.md).

### 6.2 失效模式

**离线数据与策略的分布偏移.** 式 (7) 只在 $\mathcal{D}$ 上算, 而 $\mathcal{D}$ 一般来自别的模型. 训练推进后, 当前策略生成的回答越来越偏离数据分布, 损失在这部分区域没有约束. 用 chosen 做 SFT 来构造参考模型只能缓解, 不能消除. 在线变体 (OAIF, Self-Rewarding) 针对的就是这个问题.

**小 $\beta$ 下的过度优化.** 第 5.3 节的计算表明, 要把损失压低, 对数比的差需要不断拉大. 偏好数据中输赢接近确定时, 损失的最优解会把 $\pi_\theta(y_l)$ 压向 0, KL 约束的作用变弱. 论文在讨论中提到 Figure 3 右侧训练后期胜率略有下降, 是否属于过度优化留作未来工作.

**标签噪声.** Bradley-Terry 假设偏好由潜在奖励差决定. 标签反了, 式 (7) 照样学, 而且排错的样本权重最大. 两条回答质量相近的偏好对, 标签本身随机性很强, 对训练的贡献主要是噪声.

**生成长度变化.** DPO 的隐式奖励是整条序列对数概率之差, 没有对长度做归一化. 后续工作报告过 DPO 训练后回答变长的现象, SimPO 在 UltraFeedback 上量化了隐式奖励排序和平均对数似然排序之间的错位, 数字见 [04-SimPO](../05-SimPO-无参考长度平均/05-SimPO-无参考长度平均.md).

**评测代理的偏差.** GPT-4 胜率随提示词变化, (S) 和 (C) 两套提示得到的胜率相差 7 个百分点 (DPO 列 47 对 54). 第 4.5 节的 7 加 2 例子说明裁判也会判错事实.

**没有在线探索.** 训练中不采样, 需要试错才能学到的能力 (多步推理, 可验证奖励的任务) 更适合 PPO 或 GRPO 一类在线方法.

**实验规模.** 论文实验最大到 6B (GPT-J 与 Pythia), 作者在结论里把扩展到更大模型列为未来工作.

## 参考文献

1. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS 2023*.
2. Bradley, R. A., & Terry, M. E. (1952). Rank Analysis of Incomplete Block Designs: I. The Method of Paired Comparisons. *Biometrika*, 39(3/4), 324–345.
3. Plackett, R. L. (1975). The Analysis of Permutations. *Journal of the Royal Statistical Society: Series C*, 24(2), 193–202.
4. Ziegler, D. M., et al. (2019). [Fine-Tuning Language Models from Human Preferences](https://arxiv.org/abs/1909.08593).
5. Stiennon, N., et al. (2020). [Learning to summarize from human feedback](https://arxiv.org/abs/2009.01325). *NeurIPS 2020*.
6. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS 2022*.
7. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
8. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).
9. Azar, M. G., et al. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS 2024*.
10. Hugging Face. [TRL DPO Trainer](https://huggingface.co/docs/trl/en/dpo_trainer).
