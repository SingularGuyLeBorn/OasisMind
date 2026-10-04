---
title: "03 · Nash-MD:纳什镜像下降"
published: true
tags: ["Nash-MD", "NLHF", "偏好模型", "纳什均衡", "几何混合", "镜像下降", "RLHF"]
excerpt: "NLHF 先学成对偏好模型, 再求正则偏好博弈的 Nash 均衡; Nash-MD 用当前策略与参考策略的几何混合当对手, 让最后一次迭代以 O(1/T) 收敛."
---
# 03 Nash-MD:纳什镜像下降

材料是 Munos 等的 *Nash Learning from Human Feedback* (NLHF, [arXiv:2312.00886](https://arxiv.org/abs/2312.00886)). 问题是: 标准 RLHF 把成对偏好压成标量奖励, 如果改为直接学偏好模型 $\mathcal{P}(y\succ y'|x)$, 再找对任何对手胜率都不低于 $1/2$ 的策略, 这个博弈目标在 LLM 上怎么求解.

## 1. 标量奖励装不下的偏好

### 1.1 Bradley-Terry 的前提

RLHF 的奖励模型通常按 Bradley-Terry (BT) 训练: $\mathcal{P}(y\succ y'|x)=\sigma(r(x,y)-r(x,y'))$. 每条回答对应一个数, 两条回答的胜率只取决于数之差. 这相当于假设偏好可以嵌进一条 Elo 轴. 论文第 3 节列了这条假设出问题的三种情形.

第一种是非传递. 附录 C.1 用三颗骰子: 面值分别是 $\{2,4,9\}$, $\{1,6,8\}$, $\{3,5,7\}$, 每颗均匀掷出. 两两比大小, 第一颗以 $5/9$ 赢第二颗, 第二颗以 $5/9$ 赢第三颗, 第三颗以 $5/9$ 赢第一颗. 任何一组标量都排不出这个环. 附录 C.2 补了群体层面的版本: 每个评分者自己的偏好都是全序, 按人群比例平均后仍可能出现循环, 文中给出一张偏好表, 聚合后循环中每一环的胜率是 $2/3$.

第二种是偏好可以被 BT 完美拟合, 但策略集受约束. 附录 A 取三个动作, Elo 分别是 $R(y_1)=0$, $R(y_2)=\log 9$, $R(y_3)=\log 2$, 偏好表与这组 Elo 完全一致. 在整个单纯形上, 输出 $y_2$ 同时最大化 Elo 和胜率. 把可行集收窄到 $\mathcal{S}=\{\pi:\pi(y_1)=2\pi(y_2)\}$ 后, 两个目标分开了: 最大期望 Elo 的策略是 $\pi^*_R=(2/3,1/3,0)$, 最大胜率的策略是 $\pi^*_{\mathcal{P}}=(0,0,1)$. 按 BT 算 $\mathcal{P}(y_3\succ y_1)=2/3$, $\mathcal{P}(y_3\succ y_2)=2/11$, 于是

$$
\mathcal{P}(\pi^*_{\mathcal{P}}\succ\pi^*_R)
=\frac23\cdot\frac23+\frac13\cdot\frac{2}{11}
=\frac{4}{9}+\frac{2}{33}
=\frac{50}{99}>\frac12.
\tag{1}
$$

Elo 更低的策略对 Elo 更高的策略胜率过半. KL 正则在效果上也是一种约束, 所以 RLHF 加了 KL 之后, 「最大化奖励」与「最大化胜率」一般给出不同的解.

### 1.2 三类评分者: 一个连续, 一个跳变

论文第 3.2 节给出一个数值例子. 三个回答 $y_1,y_2,y_3$, 评分者分三类. 类型 1 认为 $y_2$ 胜 $y_1$, 类型 2 认为 $y_1$ 胜 $y_3$, 类型 3 认为 $y_3$ 胜 $y_2$, 其余比较判平. 类型 1 的人群占比是 $1/3-\varepsilon$, 于是 $\mathcal{P}_\varepsilon(y_2\succ y_1)=(1/3-\varepsilon)+(2/3+\varepsilon)\cdot\frac12=2/3-\varepsilon/2$.

对这份偏好拟合 BT 奖励再做无正则 RLHF, 解是确定性策略: $\varepsilon>0$ 时只输出 $y_1$, $\varepsilon<0$ 时只输出 $y_2$. $\varepsilon$ 从 $+0.01$ 变到 $-0.01$, 人群比例只动了两个百分点, 策略从一个回答整体跳到另一个回答. 同一份偏好的 Nash 均衡在 $|\varepsilon|\le 1/3$ 时是

$$
\pi^*_\varepsilon=\Bigl(\tfrac13+\tfrac{\varepsilon}{2},\ \tfrac13+\tfrac{\varepsilon}{2},\ \tfrac13-\varepsilon\Bigr),
\tag{2}
$$

随 $\varepsilon$ 连续变化. 取 $\varepsilon=0.1$, 均衡是 $(0.383,0.383,0.233)$, 三个回答都保留可观的概率. 论文的说法是 Nash 解对评分人群分布的小扰动更稳定.

### 1.3 奖励模型依赖采样分布

第三种问题出在训练奖励模型的数据上. 成对样本由某个策略 $\pi$ 生成. Theorem 2 (附录 B, 配合 Proposition 2) 说明: 真实偏好不能被 BT 写尽时, 最优奖励 $r^\pi$ 显式依赖 $\pi$. 换一份同支撑的采样策略, 学到的奖励差 $r(y)-r(y')$ 会变. 理想偏好 $\mathcal{P}^*(y\succ y'|x)$ 是「随机抽一个人, 他更喜欢 $y$」的概率, 定义上与 $y,y'$ 从哪个策略采出来无关. 论文同时承认, 偏好模型用有限数据和函数近似拟合后, 也可能随采样分布变化.

迭代式 RLHF 要反复「采样, 建模, 优化, 再采样」. 奖励模型随 $\pi$ 变化而过期, 通常每轮重训. 偏好模型的输入本身就是成对回答, 新旧数据可以放在一起继续训练. 这是论文说偏好模型「对数据分布更不敏感」的实际含义.

## 2. 偏好博弈与正则

### 2.1 从回答对到策略对

偏好模型输入 prompt $x$ 和两条回答, 输出 $[0,1]$ 上的概率, 并满足反对称:

$$
\mathcal{P}(y\succ y'|x)=1-\mathcal{P}(y'\succ y|x).
\tag{3}
$$

于是 $\mathcal{P}(y\succ y|x)=1/2$. 策略之间的偏好对 prompt 和两边采样取期望:

$$
\mathcal{P}(\pi\succ\pi')
=\mathbb{E}_{x\sim\rho}\,
\mathbb{E}_{y\sim\pi(\cdot|x),\,y'\sim\pi'(\cdot|x)}
\bigl[\mathcal{P}(y\succ y'|x)\bigr].
\tag{4}
$$

NLHF 的目标 (论文式 (1)) 是

$$
\pi^*=\arg\max_\pi\min_{\pi'}\mathcal{P}(\pi\succ\pi').
\tag{5}
$$

这是一个二人对称常和博弈. 按 von Neumann 极小极大定理, 双方都采用 $\pi^*$ 构成 Nash 均衡, 且 $\mathcal{P}(\pi^*\succ\pi')\ge 1/2$ 对所有 $\pi'$ 成立. 第 1.1 节的骰子例子里, 均衡是三颗骰子各取 $1/3$; 对这个混合策略, 任何单颗骰子的胜率都正好是 $1/2$.

偏好模型的训练是监督学习: 把 $\mathcal{P}_\theta(y_w\succ y_l|x)$ 用交叉熵回归到人类标注, 不需要 BT 假设. 实验里的初始化方式是把 LLM 提示成比较器: 给出正文和两条摘要, 让模型回答更喜欢 1 还是 2, 取对应 token 的 logit 过 sigmoid 得到概率, 再用人类偏好微调.

### 2.2 KL 正则与唯一均衡

偏好模型在参考策略 $\mu$ 附近的样本上训练, 离 $\mu$ 越远估计越不可靠. 论文式 (2) 在策略级偏好上加减 KL:

$$
\mathcal{P}_\tau(\pi\succ\pi')
=\mathcal{P}(\pi\succ\pi')
-\tau\,\mathrm{KL}_\rho(\pi,\mu)
+\tau\,\mathrm{KL}_\rho(\pi',\mu),
\tag{6}
$$

其中 $\mathrm{KL}_\rho(\pi,\mu)=\mathbb{E}_{x\sim\rho}[\mathrm{KL}(\pi(\cdot|x),\mu(\cdot|x))]$. 两边的 KL 符号相反, 所以 $\mathcal{P}_\tau(\pi\succ\pi)=1/2$ 仍成立, 博弈仍然对称.

Proposition 1: 正则博弈存在唯一 Nash 均衡 $\pi^*_\tau$. 附录 E 的证明分两步, 先用 Sion 极小极大定理得到存在性, 再利用 KL 项带来的严格单调变分不等式 (Rosen 的条件) 得到唯一性. 不加正则时博弈仍有均衡, 但可以有多个. $\tau$ 越大, 均衡越靠近 $\mu$; $\tau\to 0$ 时回到式 (5).

这里的 $\tau$ 是 KL 惩罚的系数. [IPO](../../4.6.1-离线偏好优化/02-IPO-身份偏好优化/02-IPO-身份偏好优化.md) 也用 $\tau$, 出现在离线平方损失的目标值 $\tau^{-1}/2$ 中, 两者作用位置不同, 不能混用数值.

## 3. Nash-MD: 对几何混合做镜像下降

求 Nash 均衡的经典算法是 fictitious play: 每一步对历史策略的均匀混合 $\bar\pi_t=\frac1t\sum_{s\le t}\pi_s$ 做最佳回应. 常和博弈里 $\bar\pi_t$ 收敛, 当前策略 $\pi_t$ 可以一直振荡. 在线镜像下降 (OMD) 也是平均策略收敛, 平均后悔是 $O(1/\sqrt{T})$. 两种算法给出的保证都落在平均策略上, 不落在当前策略上.

对 LLM 而言, 平均策略要求保存所有历史权重, 或者在采样时从历史模型里随机抽一个, 两种做法在显存和工程上都不现实. 需要的是最后一次迭代本身就收敛, Nash-MD 的改动就是冲着这一点设计的.

### 3.1 更新式

Nash-MD 每一步先构造当前策略与 $\mu$ 的几何混合 (论文式 (3), 省略 $x$):

$$
\pi^\mu_t(y)=\frac{\pi_t(y)^{1-\eta_t\tau}\,\mu(y)^{\eta_t\tau}}{\sum_{y'}\pi_t(y')^{1-\eta_t\tau}\,\mu(y')^{\eta_t\tau}},
\tag{7}
$$

再以 $\pi^\mu_t$ 为对手和 KL 中心做一步镜像下降 (论文式 (4)):

$$
\pi_{t+1}=\arg\max_\pi\Bigl[\eta_t\,\mathcal{P}(\pi\succ\pi^\mu_t)-\mathrm{KL}(\pi,\pi^\mu_t)\Bigr].
\tag{8}
$$

式 (8) 有闭式解 $\pi_{t+1}(y)\propto\pi^\mu_t(y)\exp(\eta_t\,\mathcal{P}(y\succ\pi^\mu_t))$. 取对数 (论文式 (5)):

$$
\log\pi_{t+1}(y)=(1-\eta_t\tau)\log\pi_t(y)+\eta_t\tau\log\mu(y)+\eta_t\,\mathcal{P}(y\succ\pi^\mu_t)+c,
\tag{9}
$$

$c$ 是与 $y$ 无关的归一化常数. 每一步做三件事: 把 $\log\pi_t$ 向 $\log\mu$ 拉一小段, 按「对混合对手的胜率」加分, 再归一化.

用一个三动作例子看几何混合与算术混合的差别. 设 $\pi_t=(0.6,0.3,0.1)$, $\mu$ 均匀, 混合指数取 $0.5$. 几何混合的未归一化值是 $\sqrt{0.6/3}=0.447$, $\sqrt{0.3/3}=0.316$, $\sqrt{0.1/3}=0.183$, 归一化后 $\pi^\mu_t\approx(0.473,0.334,0.193)$. 算术混合 $(\pi_t+\mu)/2=(0.467,0.317,0.217)$. 两者接近, 几何混合在低概率动作上更低, 因为它在对数域做插值, 任何一侧概率接近零都会把乘积压下去. 这个性质让式 (9) 成为对数域上的线性递推, Theorem 1 的证明依赖这一点.

接着用第 1.1 节的三颗骰子走完一步. 偏好是 $\mathcal{P}(1\succ2)=\mathcal{P}(2\succ3)=\mathcal{P}(3\succ1)=5/9$, 均衡是均匀分布. 取 $\tau=0.1$, $\eta_t=5$, 使 $\eta_t\tau=0.5$, 对手就是上面算出的 $\pi^\mu_t=(0.473,0.334,0.193)$. 各动作对这个对手的胜率:

- 动作 1: $0.473\times\frac12+0.334\times\frac59+0.193\times\frac49\approx0.508$;
- 动作 2: $0.473\times\frac49+0.334\times\frac12+0.193\times\frac59\approx0.484$;
- 动作 3: $0.473\times\frac59+0.334\times\frac49+0.193\times\frac12\approx0.508$.

按式 (9), $\pi_{t+1}\propto\pi^\mu_t\cdot\exp(5\,(\mathcal{P}(y\succ\pi^\mu_t)-\frac12))$, 三个乘子约为 $1.040$, $0.925$, $1.039$, 归一化后 $\pi_{t+1}\approx(0.491,0.309,0.200)$. 动作 1 从 $0.6$ 降到 $0.49$, 动作 3 从 $0.1$ 升到 $0.2$, 这一步的变化主要来自向 $\mu$ 的几何拉回 (拉回后已是 $0.473$ 和 $0.193$). 偏好项的作用体现在乘子上: 克制动作 1 的动作 3 对当前对手胜率高于 $1/2$, 乘子大于 1; 被动作 1 克制的动作 2 乘子小于 1, 从拉回后的 $0.334$ 降到 $0.309$. 偏好项让分布沿着「谁克制当前多数」的方向调整, 拉回项把整体压向 $\mu$, 两者合起来逼近均匀的均衡.

### 3.2 收敛速率与 OMD 的差别

Theorem 1 (论文式 (6)) 给出单步不等式:

$$
\mathrm{KL}(\pi^*_\tau,\pi_{t+1})\le(1-\eta_t\tau)\,\mathrm{KL}(\pi^*_\tau,\pi_t)+2\eta_t^2.
\tag{10}
$$

每一步 KL 按 $(1-\eta_t\tau)$ 收缩, 再加上 $2\eta_t^2$ 的步长误差. 取 $\eta_t=2/(\tau(t+2))$, 递推得到

$$
\mathrm{KL}(\pi^*_\tau,\pi_T)\le\frac{8}{\tau^2(T+1)}.
\tag{11}
$$

代入数值: $\tau=0.1$, $T=1000$ 时上界是 $8/(0.01\times1001)\approx0.80$ nat; $T=10^4$ 时约 $0.08$ nat. $\tau$ 每缩小一半, 达到同样上界所需的步数变成 4 倍. 实验里 $\tau=0.008$, 按这个上界需要的步数远超实际训练步数, 所以式 (11) 说明的是收敛的形状, 不能用来估算 LLM 训练要跑多少步.

式 (11) 的常数与 $\mu$ 的最小概率 $\mu_{\min}$ 无关. 论文第 6 节对比了 Shani 等 2024 年的 MTPO: 它的更新规则与 OMD 的式 (8) 相同, 收敛速率却依赖 $\mu_{\min}$. LLM 的 $\mu$ 在长序列上的最小概率小到可以忽略, 速率与 $\mu_{\min}$ 无关这一点在这种场景下有实际意义.

式 (10) 的收缩来自对手的选法. OMD (论文式 (7), (8)) 的 KL 中心同样是 $\pi^\mu_t$, 偏好项却是 $\mathcal{P}(\pi\succ\pi_t)$, 对手是当前策略本身. Nash-MD 把偏好项的对手也换成 $\pi^\mu_t$. 只改这一处, 平均后悔 $O(1/\sqrt{T})$ 的保证就变成最后一次迭代的 KL 以 $O(1/T)$ 收敛. 从式 (9) 看, 偏好项和 KL 收缩项都以同一个混合策略为参照, 式 (10) 中 $(1-\eta_t\tau)$ 的收缩因子才能逐步作用在 $\pi_t$ 本身上; OMD 的偏好项以 $\pi_t$ 为参照, 迭代序列可以在均衡附近绕圈.

## 4. Nash-MD-PG: 搬到 LLM 上

### 4.1 策略梯度估计

LLM 的输出空间是 token 序列, 无法逐个回答列表更新. 论文第 7 节和附录 F.2 把式 (6) 对参数 $\theta$ 求正则策略梯度. 采 $x\sim\rho$, $y\sim\pi_\theta(\cdot|x)$, $y'\sim\pi'(\cdot|x)$, 梯度估计 (附录式 (13)) 是

$$
\hat g=\nabla_\theta\log\pi_\theta(y|x)\Bigl(\mathcal{P}(y\succ y'|x)-\frac12-\tau\log\frac{\pi_\theta(y|x)}{\mu(y|x)}\Bigr).
\tag{12}
$$

减去的 $1/2$ 等于 $\mathcal{P}(y\succ y|x)$. 它是常数基线, 不改变梯度期望, 只降低方差, 因此不需要训练价值网络. 偏好项在 $[-1/2,1/2]$ 之间, 赢了得正分, 输了得负分. 附录式 (14) 对 $\pi'$ 停梯度: 即使 $\pi'$ 由 $\pi_\theta$ 构造, 反向传播也只经过 $y$ 那一支.

序列 $y=(y_0,\dots,y_N)$ 上, KL 项按 token 分解. 附录 F.2 的写法是: 第 $n$ 个 token 的 $\nabla\log\pi_\theta$ 只乘下标不小于 $n$ 的 KL 估计. 已经生成的前缀不受后续 token 选择的影响, 所以前面 token 的对数比不进入第 $n$ 步的优势. 附录 F.2 还给出一个不训练偏好模型的变体: 人直接在 $y$ 和 $y'$ 之间选, 用指示函数替代 $\mathcal{P}$. 这要求评分者在采样循环里实时参与, 实验没有走这条路.

### 4.2 对手的两种构造

Nash-MD-PG 的对手是参数化的几何混合 (附录式 (15)):

$$
\log\pi^\beta_\theta(y|x)=(1-\beta)\log\pi_\theta(y|x)+\beta\log\mu(y|x)+c(x).
\tag{13}
$$

$\beta\in[0,1]$ 与 $\tau$ 解耦, 可以单独调. 两个端点对应已知算法. $\beta=0$ 时对手就是当前策略, 算法是 Self-Play (SP); 附录 F.3 指出它即使在表格设定下也没有最后一次迭代收敛的保证, 原因与 OMD 相同. $\beta=1$ 时对手固定为 $\mu$, 算法优化 $\mathcal{P}_\tau(\pi,\mu)$, 是对 SFT 的 Best-Response (BR); 固定对手的最佳回应可以被其他策略针对, 一般不收敛到均衡.

Nash-EMA-PG 换了构造方式: 对手的参数是历史参数的指数滑动平均 $\bar\theta_t$, 附录 F.3 写成 $\bar\theta_t=(1-\beta)\theta_t+\beta\theta_0$. 这里的 $\beta$ 取 $0.999$, $0.9995$ 这类接近 1 的值, 与式 (13) 的 $\beta$ 含义不同. 策略对参数是非线性的, 参数平均不等于策略平均, 论文把它看作 fictitious play 的一阶近似.

### 4.3 与表格 Nash-MD 的差别

附录 F.3 列了两处差别. 第一, Nash-MD-PG 对式 (8) 的内层问题只走一步梯度; 忠实的实现要用双时间尺度, 固定 $\pi_\theta$ 和混合对手, 把内层优化到最优后再更新. 第二, 式 (12) 的 KL 中心是 $\mu$, 表格版的 KL 中心是混合策略. 第二处在单步更新下等价:

$$
\mathrm{KL}(\pi_\theta,\pi^\beta_\theta)=\beta\,\mathrm{KL}(\pi_\theta,\mu)-\mathbb{E}_{x\sim\rho}[c(x)],
\tag{14}
$$

对 $\theta$ 求梯度时 (把混合对手视为固定), $\nabla_\theta\mathrm{KL}(\pi_\theta,\pi^\beta_\theta)=\beta\nabla_\theta\mathrm{KL}(\pi_\theta,\mu)$, 差一个常数倍. 论文认为 Nash-MD 的核心 (对几何混合对手改进当前策略, 同时保持正则) 在 Nash-MD-PG 中保留了下来, 并提到双时间尺度, PPO 式正则和 NeuRD 是更忠实的实现方向.

![NLHF:当前策略与几何混合对手采样,偏好进正则策略梯度](./images/fig-nlhf-preference-nash.png)

> 图 1: prompt $x$ 分给 $\pi_\theta$ 与几何混合对手 $\pi'$, 分别采样 $y$ 与 $y'$; 偏好模型输出 $\mathcal{P}(y\succ y'|x)$, 进入正则策略梯度更新 $\pi_\theta$.

**图 1 解析**

- 最左侧只有 prompt $x$, 两条采样都从这里出发.
- 上支是可训练的 $\pi_\theta$, 生成 $y$; 下支是几何混合对手 $\pi'$, 生成 $y'$. 两支分开画, 对应式 (12) 中 $y$ 带梯度, $y'$ 停梯度.
- 中间的偏好模型同时读入两条回答, 输出 $\mathcal{P}(y\succ y'|x)$.
- 最右侧是式 (12) 的正则策略梯度. 图中没有价值网络, 也没有单独的标量奖励头, 优势就是 $\mathcal{P}-1/2$ 减去 KL 项.

### 4.4 逐 token 混合 logits

式 (13) 的归一化常数 $c(x)$ 要对所有序列求和, 无法计算. 附录 F.1 改用逐步版本 $\tilde\pi^\beta_\theta$: 在每个前缀 $(x,y_{0:n-1})$ 上取 $\pi_\theta$ 和 $\mu$ 的 logits, 按 $1-\beta$ 与 $\beta$ 加权求和, 再 softmax 得到下一个 token 的分布. 这等于在每一步做 token 级几何混合. 逐步混合的乘积一般不等于序列级几何混合, 差别来自每个前缀上各自的归一化. 论文实验采用逐步版本, 没有分析这个近似带来的偏差.

这样做的成本是: 生成 $y'$ 时每个 token 都要同时跑 $\pi_\theta$ 和 $\mu$ 的前向. 训练时本来就要算 $\mu$ 的对数概率来估计 KL, 所以额外开销主要在生成阶段. Hugging Face TRL 实现了 Nash-MD trainer, 用参数 `mixture_coef` 控制混合, 默认值是 $0.5$. 论文主表里表现最好的区间是 $\beta\in\{0.125,0.25,0.375\}$, 使用库的默认值前应先确认它与论文 $\beta$ 的对应关系, 再按任务扫描.

![几何混合对手: 参考策略与当前策略的 logits 凸组合; fictitious play 要存历史, 本算法不走](./images/fig-nash-md-mixture.png)

> 图 2: 左侧 $\mu$ 与 $\pi_t$ 的 logits 凸组合再 softmax, 得到对手 $\pi^\mu_t$; 右侧虚线是 fictitious play 需要的历史均匀混合 $\bar\pi_t$, 打叉表示 Nash-MD 不保存 $\pi_1,\dots,\pi_t$.

**图 2 解析**

- 左列是冻结的 $\mu$ 和当前 $\pi_t$, 两者只提供 logits.
- 中间做 logits 加权求和再 softmax, 对应第 4.4 节的逐步实现: 每生成一个 token 混合一次, 不是先合成一个模型再整段解码.
- 右侧得到的对手 $\pi^\mu_t$ 只用于采样 $y'$.
- 最右的虚线框堆着 $\pi_1,\dots,\pi_t$ 和均匀平均 $\bar\pi_t$, 红叉表示这条存储路径不在 Nash-MD 中出现. 内存里始终只有两份模型.

## 5. TL;DR 摘要实验

### 5.1 设置

附录 G 的任务是 Reddit TL;DR 摘要, 沿用 Stiennon 等的数据. 偏好模型和奖励模型在同一训练集 $D_{\mathrm{Train}}$ 上训练, 共 $92820$ 条. 偏好模型试过 T5X-small (110M), XL (3B), XXL (11B) 三种规模, 3B 到 11B 增益很小, 后续固定用 XL. 偏好模型测试准确率峰值约 $0.78$, 同规模的奖励模型约 $0.76$ (附录 G.1). 奖励模型的输入只有正文加一条摘要, 输出最后位置的 logit 作为标量, 用 BT 交叉熵训练. 偏好模型看到两条摘要, 输入信息更多.

策略模型是 T5X-L, 在 OpenAI TL;DR 数据上做过 SFT, 这个 SFT 模型同时是 $\mu$ 和所有方法的初始化. 所有模型训练 $10000$ 步 (附录 G.5). RLHF 基线对 T5X-XL 奖励模型做正则策略梯度, $\tau$ 在 $\{0.01,0.02,0.05,0.1,0.2\}$ 中扫描, 取 $0.05$ (附录 G.3). NLHF 各方法的 $\tau$ 在 $\{0.02,0.01,0.008,0.005\}$ 中扫描, 取 $0.008$; Nash-MD-PG 的 $\beta$ 扫描 $\{0,0.125,\dots,1.0\}$ 共 9 个值; Nash-EMA-PG 的 $\beta$ 扫描 $\{0,0.999,0.9995,0.9999,1.0\}$ (附录 G.4).

参与对比的模型: SFT, RLHF, SP ($\beta=0$), MD1 到 MD6 ($\beta=0.125,0.25,0.375,0.5,0.625,0.75$), BR ($\beta=1$), EMA1 与 EMA2 (Nash-EMA-PG 最后一次迭代, $\beta=0.999,0.9995$), EMA1* 与 EMA2* (同两组的平均权重策略).

评估有两张两两对战表. 正文 Table 1 (即附录 Table 3) 用 PaLM 2 Large 当裁判 $\mathcal{P}^*$, 每格 $2000$ 次比较, Clopper-Pearson $95\%$ 置信区间半宽不超过 $\pm0.023$. 附录 Table 2 用训练时的正则偏好 $\mathcal{P}_\tau$, 每格 $1000$ 次, 区间半宽不超过 $\pm0.032$. 表中格子的含义是列策略对行策略的胜率, 关于对角线对称的两格相加等于 1, 例如 MD1 对 RLHF 是 $0.598$, RLHF 对 MD1 是 $0.402$.

### 5.2 主表读数

下表从 Table 1 摘出 RLHF 行 (各方法对 RLHF 的胜率) 和 SFT 行 (各方法对 SFT 的胜率):

| 列策略 | 对 SFT | 对 RLHF |
|---|---|---|
| RLHF | $0.990$ | $0.500$ |
| SP ($\beta=0$) | $0.983$ | $0.489$ |
| MD1 ($\beta=0.125$) | $0.982$ | $0.598$ |
| MD2 ($\beta=0.25$) | $0.989$ | $0.519$ |
| MD3 ($\beta=0.375$) | $0.987$ | $0.561$ |
| MD4 ($\beta=0.5$) | $0.985$ | $0.501$ |
| MD5 ($\beta=0.625$) | $0.982$ | $0.436$ |
| MD6 ($\beta=0.75$) | $0.965$ | $0.284$ |
| BR ($\beta=1$) | $0.943$ | $0.148$ |
| EMA1 | $0.970$ | $0.468$ |
| EMA2 | $0.961$ | $0.320$ |
| EMA1* | $0.977$ | $0.477$ |
| EMA2* | $0.980$ | $0.510$ |

对 SFT 的胜率全部在 $0.94$ 以上, 这一列区分度很小. 对 RLHF 这一列随 $\beta$ 呈单峰: $\beta$ 从 0 增加到 $0.125$, 胜率从 $0.489$ 升到 $0.598$; 到 $0.5$ 回落到 $0.501$, 基本打平; 继续增大则输给 RLHF, $\beta=1$ 的 BR 只有 $0.148$. 两端都差, 中间偏小的混合最好, 这与第 4.2 节的分析一致: 只跟自己比没有收敛保证, 只跟固定 SFT 比会被针对.

MD1 那一列对每一行都超过 $0.5$: 对 SP $0.592$, 对 MD2 $0.575$, 对 MD3 $0.530$, 对 MD4 $0.631$, 对 BR $0.837$, 对 EMA2* $0.553$. 在附录的 $\mathcal{P}_\tau$ 表里, MD1 对 RLHF 是 $0.769$, SP 对 RLHF 是 $0.741$. 论文据此称 MD1 在训练偏好与评估偏好下都是最好的模型. BR 在两张表里方向一致: $\mathcal{P}^*$ 下 BR 对 RLHF 只有 $0.148$; $\mathcal{P}_\tau$ 下 RLHF 对 BR 是 $0.833$, MD1 对 BR 是 $0.921$, MD1 对 EMA1* 是 $0.652$. 它的落后在训练用的偏好模型下同样存在, 与换了裁判无关.

### 5.3 论文自己的解读

附录 G.7 的几条结论: RLHF 对 SFT 胜率 $99\%$, 提升明显. BR 对 SFT 只有 $0.943$, 对 RLHF 和其他 Nash 方法都很差, 论文认为它对着固定的 SFT 过度适配了偏好模型, 属于 preference hacking. SP 整体不弱, 但会被 RLHF 和 $\beta\le0.5$ 的 Nash-MD 击败. 所有 EMA 变体都输给 $\beta\le0.5$ 的 Nash-MD 和 RLHF, 论文推测参数平均对混合策略的一阶近似在这个场景下不够好.

论文第 8 节对实验的定位很克制: 这组比较的目的不是宣称 NLHF 胜过 RLHF. 一边用偏好模型, 一边用奖励模型, 两类模型的质量本身无法对齐; 超参数也没有为每种方法单独调优; 结果与 Calandriello 等 2024 年的在线偏好实验存在差异. 论文要证明的是 NLHF, 尤其 Nash-MD-PG, 能在 LLM 摘要任务上跑通.

## 6. 相邻方法与边界

### 6.1 和相邻方法放在一起

把几种方法放在「数据何时采样, 中间学什么模型, 对谁正则, 优化什么」四个维度上比较:

| 方法 | 采样 | 中间模型 | 对手或参考 | 目标 |
|---|---|---|---|---|
| RLHF + PPO | 在线, 采自 $\pi_\theta$ | 标量 $r_\phi$ | KL 到 $\mu$ | 最大期望奖励 |
| DPO | 离线偏好对 | 无 (隐式 BT 奖励) | 冻结 $\pi_{\mathrm{ref}}$ | BT 分类 |
| IPO | 离线偏好对 | 无 | 冻结 $\pi_{\mathrm{ref}}$ | 对数比回归到 $\tau^{-1}/2$ |
| Nash-MD-PG | 在线, $y\sim\pi_\theta$, $y'\sim\pi'$ | 成对 $\mathcal{P}$ | 几何混合 $\pi_\theta^{1-\beta}\mu^\beta$ | 正则 Nash |
| Nash-EMA-PG | 同上 | 成对 $\mathcal{P}$ | 参数 EMA | 正则 Nash 的近似 |
| SPIN | 人工回答对自生成回答 | 无 | 上一轮自己 | 逼近 $p_{\mathrm{data}}$ |

[DPO](../../4.6.1-离线偏好优化/01-DPO/01-DPO.md) 的解是 BT 加 KL 的闭式最优策略, 依赖 BT 假设, 偏好对在训练前就采好. Nash-MD-PG 每一步对新对手现场采样, 偏好模型不需要 BT. [IPO](../../4.6.1-离线偏好优化/02-IPO-身份偏好优化/02-IPO-身份偏好优化.md) 去掉了 BT, 仍是离线的; 它的在线版本在 [08-Online IPO](../02-Online-IPO-在线偏好/02-Online-IPO-在线偏好.md) 中被证明期望梯度与 Self-Play 相同, 驻点是正则 Nash 均衡, 加上几何混合采样后得到 IPO-MD, 那里的混合用来生成两条回答, 作用与本文的对手不同. Calandriello 等的 Proposition 5.1 进一步算出: Nash-MD-PG 的期望梯度是 $-\mathbb{E}_{y\sim\pi}[g(y)]$, IPO-MD 是 $-\frac{2}{\tau}\mathbb{E}_{y\sim\pi'}[g(y)]$, 被积函数相同, 差别只在 $y$ 从当前策略采 (on-policy) 还是从混合策略采 (off-policy).

[PPO](../../../4.4-强化学习基础/04-PPO/04-PPO.md) 优化标量奖励, 通常配价值网络. 式 (12) 用 $\mathcal{P}-1/2$ 当优势, 基线是常数. 附录 G.3 的 RLHF 基线也只是带 KL 的正则策略梯度, 对比的重点是「标量奖励」与「成对偏好」两种信号.

[SPIN](../04-SPIN-自对弈微调/04-SPIN-自对弈微调.md) 把人写的回答当正例, 模型自己的回答当负例, 目标分布是人类数据分布 $p_{\mathrm{data}}$. NLHF 的 Self-Play 是 $\beta=0$ 时的对手选择, 胜负由偏好模型判定, 目标是偏好博弈的均衡. 两者名字相近, 训练信号来源不同. [SLiC](../../4.6.1-离线偏好优化/06-SLiC-序列似然校准/06-SLiC-序列似然校准.md) 用排序 hinge 损失加参考摘要的交叉熵, 没有博弈目标.

### 6.2 失效模式与边界

**偏好模型被针对.** BR 的结果说明: 对固定对手做最佳回应时, 策略会钻进偏好模型在该对手附近的误差. 换用更强的裁判 ($\mathcal{P}^*$) 评估, 收益大幅缩水. $\beta$ 越接近 1 越容易出现. 偏好模型本身的过度优化与奖励模型一样存在, 正则 $\tau$ 和适中的 $\beta$ 只是减轻它.

**对 $\beta$ 敏感.** 主表里 $\beta$ 从 $0.125$ 到 $0.75$, 对 RLHF 的胜率从 $0.598$ 掉到 $0.284$. $\beta$ 与 $\tau$ 需要联合扫描. 论文第 9 节把「训练中让 $\beta$ 逐渐衰减到 0」列为未来工作, 没有给出结果.

**近似链条.** 从 Theorem 1 到实际训练经过了三层近似: 表格策略换成参数化策略, 镜像下降换成单步梯度, 序列级几何混合换成逐 token 混合. 每一层都没有收敛证明. 式 (11) 的 $O(1/T)$ 只对表格版成立.

**成本.** 每个训练样本要生成两条回答, 其中 $y'$ 的每个 token 要同时跑策略和参考模型; 每对回答还要过一次偏好模型 (实验中是 3B 的 T5X-XL), 输入同时包含两条回答. 相比 RLHF 的「一条回答, 一次奖励打分」, 生成和打分的开销都更高.

**换一组实验, 排序会变.** Calandriello 等在摘要任务上用 T5X-L 策略重新比较了这些方法 (见 [08-Online IPO](../02-Online-IPO-在线偏好/02-Online-IPO-在线偏好.md)), 那里的 Table 2 中在线 IPO 对 Nash-MD-PG 的胜率是 $0.621$, DPO 对 Nash-MD-PG 也有 $0.520$. 任务, 超参搜索范围和裁判提示都不同, 两份结果不能互相否定, 但说明 Nash-MD-PG 的优势依赖具体设置.

**实验范围.** 只有一个摘要任务, 策略只有 T5X-L 一种规模, 评估只用 LLM 裁判, 没有人类评测. 偏好模型对奖励模型的准确率优势 ($0.78$ 对 $0.76$) 较小.

## 参考文献

1. Munos, R., Valko, M., Calandriello, D., Gheshlaghi Azar, M., Rowland, M., Guo, Z. D., Tang, Y., Geist, M., Mesnard, T., Fiegel, C., Michi, A., Selvi, M., Girgin, S., Momchev, N., Bachem, O., Mankowitz, D. J., Precup, D., & Piot, B. (2023). [Nash Learning from Human Feedback](https://arxiv.org/abs/2312.00886). arXiv:2312.00886. [arXiv HTML](https://arxiv.org/html/2312.00886).
2. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
3. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
4. Azar, M. G., Rowland, M., Piot, B., Guo, D., Calandriello, D., Valko, M., & Munos, R. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS*.
5. Bradley, R. A., & Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. *Biometrika*, 39(3/4), 324–345.
6. Bertrand, Q., Czarnecki, W. M., & Gidel, G. (2023). On the limitations of the Elo: Real-world games are transitive, not additive. *AISTATS*.
7. Stiennon, N., et al. (2020). [Learning to summarize with human feedback](https://arxiv.org/abs/2009.01325). *NeurIPS*.
8. Anil, R., et al. (2023). [PaLM 2 Technical Report](https://arxiv.org/abs/2305.10403).
9. Calandriello, D., et al. (2024). [Human Alignment of Large Language Models through Online Preference Optimisation](https://arxiv.org/abs/2403.08635). *ICML*.
10. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML*.
11. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
12. Hugging Face. [TRL Nash-MD Trainer](https://huggingface.co/docs/trl/main/en/nash_md_trainer).
