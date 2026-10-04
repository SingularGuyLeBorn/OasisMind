---
title: "03 · WARP: 权重平均策略"
published: true
tags: ["WARP", "WARM", "EMA", "SLERP", "LITI", "RLHF", "Gemma", "权重平均"]
excerpt: "WARP 在 RLHF 的三个阶段做权重平均: EMA 当动态 KL 锚点, SLERP 合并多次独立 RL, LITI 往初始化插值, 再迭代."
---
# 03 WARP: 权重平均策略

材料是 Ramé 等的 *WARP: On the Benefits of Weight Averaged Rewarded Policies* ([arXiv:2406.16768](https://arxiv.org/abs/2406.16768)). 问题是: KL 正则的 RLHF 要在奖励和离 SFT 的距离之间取舍, 能否在权重空间做平均, 把 KL–奖励的 Pareto 前沿整体往上推, 推理时仍只用一份权重.

## 1. 问题与算法

### 1.1 KL 锚点的两难

KL 正则的 RLHF 目标是

$$
\operatorname*{argmax}_{\theta}\ \mathbb{E}_{x\in\mathcal{X}}\Bigl[\mathbb{E}_{y\sim\pi_\theta(\cdot|x)}r(x,y)-\beta\,\mathrm{KL}\bigl(\pi_\theta(\cdot|x)\Vert\pi_{\theta_{\mathrm{anchor}}}(\cdot|x)\bigr)\Bigr].
\tag{1}
$$

通常 $\theta_{\mathrm{anchor}}=\theta_{\mathrm{sft}}$. 用策略梯度优化时, 等价于把奖励改成

$$
r_\beta(x,y)=r(x,y)-\beta\log\frac{\pi_\theta(y|x)}{\pi_{\theta_{\mathrm{anchor}}}(y|x)}.
\tag{2}
$$

两者的等价来自 $\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{anchor}})=\mathbb{E}_{y\sim\pi_\theta}[\log\pi_\theta(y)-\log\pi_{\mathrm{anchor}}(y)]$: 对 $\theta$ 求梯度时, $\log\pi_\theta$ 自身求导的那一项期望为零, 剩下的部分与把 $-\beta\log(\pi_\theta/\pi_{\mathrm{anchor}})$ 加进奖励后求的策略梯度相同. 所以换锚点只需要换式 (2) 里的分母, 优化器不用改.

论文第 2 节列出 RLHF 的三类代价: 遗忘预训练知识 (对齐税), 对不完美奖励模型的黑客, 以及生成多样性下降. $\beta$ 大, KL 小, 这些代价小, 奖励也低; $\beta$ 小, 奖励涨得快, 代价也来得快. 评价一种对齐策略, 要看它在 KL–奖励平面上的整条前沿, 单看终点奖励会混淆不同的 KL 预算.

锚点固定在 SFT 上时, Figure 3 显示奖励会饱和. 设定是每 100 步评估一次, KL 到 200 就停止训练 ($\beta=0$ 时约 1k 步就到了). $\beta=0.1$ 时奖励停在约 $-0.62$, $\beta=0.01$ 时停在约 $-0.46$. 每个 $\beta$ 对应一个固定的正则最优解, 训练走到那里就不再前进. 降低 $\beta$ 能把饱和点抬高, 但 KL 也增长得更快, 极端的 $\beta=0$ 约 1k 步就到了 200 的上限. 在这种设定下, 想要更高的奖励只能接受更大的 KL.

WARP 的回答是在三个位置做权重平均, 各自解决一个问题. EMA 锚点处理锚点固定带来的饱和, 让单条 RL 能持续提高奖励; SLERP 合并几条独立 RL, 在 KL 基本不变的情况下提高奖励; LITI 把合并结果往回拉, 用较小的奖励损失换较大的 KL 下降. 三步串起来, 每一步的输出都是下一步的输入. 优化器保持 REINFORCE (见 [10-REINFORCE](../../../4.4-强化学习基础/02-REINFORCE-序列级策略梯度/02-REINFORCE-序列级策略梯度.md)), 改动全在锚点和合并方式上.

### 1.2 算法总览

Algorithm 1 有 $I$ 轮迭代, 每轮并行跑 $M$ 次 RL, 每次 $T$ 步. 一轮的步骤是:

1. 从共享初始化 $\theta_{\mathrm{init}}$ 出发 (第一轮是 $\theta_{\mathrm{sft}}$), 并行跑 $M$ 条 RL. 每条维护自己的 EMA 权重 $\theta^m_{\mathrm{ema}}$, 奖励按式 (2) 计算, 锚点取 $\theta^m_{\mathrm{ema}}$. 每步做一次策略梯度更新和一次 EMA 更新.
2. $T$ 步后得到 $\{\theta^m\}_{m=1}^M$, 用 SLERP 合并它们相对 $\theta_{\mathrm{init}}$ 的任务向量, 系数 $\lambda=1/M$, 得到 $\theta_{\mathrm{slerp}}$.
3. 做 LITI (linear interpolation towards initialization):

$$
\theta_{\mathrm{init}}\leftarrow(1-\eta)\cdot\theta_{\mathrm{init}}+\eta\cdot\theta_{\mathrm{slerp}}.
\tag{3}
$$

结果作为下一轮的初始化. $I$ 轮结束后, 再对 $\theta_{\mathrm{sft}}$ 插值一次, 得到一族权重:

$$
\bigl\{(1-\eta)\cdot\theta_{\mathrm{sft}}+\eta\cdot\theta^I_{\mathrm{slerp}}\ \big|\ 0\le\eta\le1\bigr\}.
\tag{4}
$$

式 (3) 和式 (4) 用同一个字母 $\eta$, 用途不同. 循环里的 $\eta$ 是固定值 (实验取 $0.3$), 用来产生下一轮初始化; 交付时 $\eta$ 从 $0$ 扫到 $1$, 每个值对应前沿上的一个点, 按 KL 预算挑一个部署. 这一步只做权重插值和评估, 不需要再训练, 换一个 KL 预算的成本很低.

![一次迭代: EMA 锚住两条独立 REINFORCE, SLERP 合并任务向量, LITI 插回初始化](./images/fig-warp-three-stages.png)

> 图 1: 一次 WARP 迭代. $\theta_{\mathrm{init}}$ 分出两条 REINFORCE, 每条下方是自己的 EMA ($\mu=0.01$), 虚线是权重复制. 两条策略进入 SLERP ($\lambda=1/M$). LITI 接收 $\theta_{\mathrm{slerp}}$, 虚线从初始化引入, 按 $\eta=0.3$ 交出下一轮的 $\theta'_{\mathrm{init}}$.

**图 1 解析**

- 左栏是第一阶段. 策略框里的 KL 对着 $\pi_{\mathrm{ema}}$ 计算. 虚线单向, 表示策略权重混入 EMA, 两者之间没有梯度往来.
- 中栏是第二阶段. 进入 SLERP 的是 $\theta^1,\theta^2$, EMA 权重只当锚点用, 不参与合并.
- 右栏是第三阶段. 实线是合并结果, 虚线是初始化. 出口标的 $\eta=0.3$ 是循环内的固定值, 对应式 (3).

训练成本是 $M$ 份并行 RL 乘以迭代轮数. 推理时只加载一份合并后的权重, 每条请求采样一次. 论文第 6 节把多出的训练成本称为「a feature rather than a bug」: 用对齐阶段的算力换能力, 推理没有额外开销.

## 2. 第一阶段: EMA 锚点

### 2.1 更新规则

锚点换成策略自己的指数滑动平均, 每步更新:

$$
\theta_{\mathrm{ema}}\leftarrow(1-\mu)\cdot\theta_{\mathrm{ema}}+\mu\cdot\theta.
\tag{5}
$$

实验取 $\mu=0.01$ (实验设定与附录 D.2 一致). 展开式 (5), $k$ 步前的策略权重系数是 $\mu(1-\mu)^k$, 平均滞后 $(1-\mu)/\mu=99$ 步. 锚点大约落后策略 100 步, 远小于 $T=9\mathrm{k}$, 所以 KL 只约束「最近这一段走了多远」.

设策略在权重空间里每步走一个固定的位移 $v$. 稳态时 EMA 落后约 $99v$, 策略与锚点的距离大致恒定; 策略与 SFT 的距离则是 $tv$, 随步数线性增长. 式 (2) 的惩罚只看前者, 所以 $\beta$ 不变时, 对「离 SFT 多远」的约束随训练自动放松. 这就是论文说的自动退火. 训练开始时 EMA 等于 SFT, 两种锚点完全相同; 区别要过几百步后才显现.

### 2.2 三个好处与实验

论文列了三点. 第一, KL 正则自动退火: 训练初期锚点贴近 SFT, 约束强; 锚点随训练移动, 允许策略走得更远. 第二, EMA 是一个 mean teacher, 它在权重空间平滑了策略的轨迹, 用它当锚点等于从一个更稳的老师那里蒸馏. 第三, EMA 本身的表现可以超过最终策略.

第二点可以用方差估算. 若每步更新里的随机噪声独立, 方差为 $\sigma^2$, EMA 稳态时对这部分噪声的方差是 $\frac{\mu}{2-\mu}\sigma^2$, $\mu=0.01$ 时约 $0.005\sigma^2$. 策略权重本身带着每一步的噪声, 锚点则把最近约 100 步的噪声平均掉了. 用平滑后的锚点算 KL, 惩罚项的抖动也随之变小.

这几点好处在 Figure 3 里得到了检验, 它对比 SFT 锚点与 EMA 锚点. SFT 锚点的结果见第 1.1 节, 奖励在 $-0.62$ 或 $-0.46$ 处饱和. 换成 EMA 锚点, 奖励不再饱和, KL–奖励前沿也比 SFT 锚点的各个 $\beta$ 更好. 代价是 KL 会持续增长, 训练要设停止条件, 这也是后两个阶段要处理的问题.

## 3. 第二阶段: SLERP 合并

### 3.1 公式

$M$ 次 RL 共享初始化 $\theta_{\mathrm{init}}$, 区别只在 prompt 的顺序. 记任务向量 $\delta_m=\theta^m-\theta_{\mathrm{init}}$, 两条的夹角为 $\Omega$. 球面线性插值是

$$
\mathrm{slerp}(\theta_{\mathrm{init}},\theta^1,\theta^2,\lambda)=\theta_{\mathrm{init}}+\frac{\sin((1-\lambda)\Omega)}{\sin\Omega}\,\delta_1+\frac{\sin(\lambda\Omega)}{\sin\Omega}\,\delta_2.
\tag{6}
$$

SLERP 按层做. Gemma "7B" 有 28 层, 每层算自己的 $\Omega$, 即 $\cos\Omega=\frac{\delta_1\cdot\delta_2}{\|\delta_1\|\|\delta_2\|}$, 其中 $\delta_m$ 只取该层的参数. 不同层的任务向量夹角可以不同, 按层计算让每层用自己的系数.

### 3.2 夹角接近 90 度

观察 4: 任务向量之间 $\Omega\approx90^\circ$, 几乎正交; 而完整权重之间夹角 $\omega\approx0^\circ$, 几乎共线. 两件事同时成立, 是因为 RL 只把权重改动了很小一部分. 设 $\|\delta_m\|=\epsilon\|\theta_{\mathrm{init}}\|$, 两条任务向量正交, 那么 $\theta^1,\theta^2$ 的夹角约为 $\sqrt2\,\epsilon$ 弧度; $\epsilon$ 很小时 $\omega$ 接近 $0$. 所以合并必须在任务向量上做, 在完整权重上做 SLERP 只会得到 LERP (见第 3.3 节). 论文相关工作部分提到, 监督微调得到的任务向量夹角通常在 $40^\circ$ 到 $80^\circ$, RL 得到的更接近正交.

代入 $\Omega=90^\circ$, $\lambda=0.5$: 两个系数都是 $\sin45^\circ/\sin90^\circ\approx0.707$, SLERP 结果是 $\theta_{\mathrm{init}}+0.707(\delta_1+\delta_2)$. 线性插值 LERP 是 $\theta_{\mathrm{init}}+0.5(\delta_1+\delta_2)$. 两者方向相同, SLERP 的长度是 LERP 的 $\sqrt2$ 倍. 一般地, $\lambda=0.5$ 时 SLERP 两个系数之和是 $2\sin(\Omega/2)/\sin\Omega=1/\cos(\Omega/2)$, $\Omega>0$ 时大于 $1$. 相对 LERP, SLERP 等于沿合并方向做了外推, $\Omega=90^\circ$ 时外推到 $1.414$ 倍.

附录 B 用两条引理说明这一点. 假设 1 设两条任务向量长度都是 $l$. 引理 1: SLERP 结果的任务向量长度保持为 $l$ (附录式 (4)). 引理 2: LERP 结果的长度是

$$
\|\delta_{\mathrm{lerp}}\|=l\sqrt{1-2(1-\cos\Omega)(\lambda-\lambda^2)}.
\tag{7}
$$

$\Omega=90^\circ$, $\lambda=0.5$ 时是 $l\sqrt{1-2\times0.25}=l/\sqrt2\approx0.707\,l$. 两条近似正交的任务向量取平均, 长度缩到约七成; SLERP 把长度补回来.

$\lambda=0.5$ 时, 式 (7) 化为 $l\sqrt{(1+\cos\Omega)/2}$, 式 (6) 的单个系数是 $\sin(\Omega/2)/\sin\Omega$. 几个夹角下:

| $\Omega$ | SLERP 系数 | LERP 长度 / $l$ |
|---|---|---|
| $0^\circ$ (极限) | $0.5$ | $1$ |
| $40^\circ$ | $0.532$ | $0.940$ |
| $60^\circ$ | $0.577$ | $0.866$ |
| $90^\circ$ | $0.707$ | $0.707$ |

夹角越小, SLERP 和 LERP 越接近; 监督微调常见的 $40^\circ$ 下 LERP 只缩短 $6\%$, 两者差别不大. RL 任务向量接近正交, 正好落在两者差别最大的区域.

$M$ 份时差别更大. $M$ 条两两正交, 等长 $l$ 的向量取平均, 长度是 $l/\sqrt M$; $M=5$ 时约 $0.447\,l$, 不到单条的一半. 按引理 1 的思路, SLERP 让合并结果保持长度 $l$. 这可以对照 Figure 4(b) 中 $M$ 增大时前沿持续改善的结果.

另一个现象是夹角接近 90 度的来源. $M$ 次 RL 从同一个初始化出发, 超参相同, 只是 prompt 的顺序不同, 任务向量却几乎正交. 不同的数据顺序足以让 RL 在高维权重空间里走向不同的方向, 而这些方向合并后奖励更高.

### 3.3 观察 2 与观察 3

观察 2: SLERP 提高奖励, KL 只略有增加. 观察 3: LERP 降低 KL, 对奖励影响较小. 结合上一小节, LERP 的结果离初始化更近, 所以 KL 小; SLERP 保持了单条 RL 的步长, 又合并了两条的方向.

Figure 3(c) 在 $T=9\mathrm{k}$ 时扫 $\lambda$: SLERP 的奖励随 $\lambda$ 呈凸形 (两端是单条 RL, 中间更高), 在 $\lambda=0.5$ 处最高, 并且全程高于 LERP. 附录 C 补充: SLERP 奖励和 KL 都更高, LERP KL 更低; 把 SLERP 用在完整权重上 (夹角 $\omega\approx0$), $\sin((1-\lambda)\omega)/\sin\omega\to1-\lambda$, 它退化成 LERP.

### 3.4 多于两份与插值系数

$M>2$ 时, slerp 按递归定义 (附录 B.3 式 (26)): 先合并前 $M-1$ 份, 再与第 $M$ 份按 $\lambda=1/M$ 合并. 这个操作不满足结合律, 合并顺序会影响结果, 但论文测得的标准差很小.

三条两两正交, 等长 $l$ 的任务向量可以算出顺序的影响. 先合并 $\delta_1,\delta_2$, 得 $0.707(\delta_1+\delta_2)$, 长度 $l$, 与 $\delta_3$ 仍正交. 再以 $\lambda=1/3$ 与 $\delta_3$ 合并, 系数是 $\sin60^\circ=0.866$ 和 $\sin30^\circ=0.5$, 结果为 $0.612(\delta_1+\delta_2)+0.5\,\delta_3$, 长度 $\sqrt{2\times0.612^2+0.5^2}\,l\approx l$. 先进入合并的两条各占 $0.612$, 最后一条只占 $0.5$, 三条的权重不对称. 换一个顺序, 吃亏的就换成另一条. 实际的任务向量只是近似正交, 而且三条 RL 的质量相近, 所以论文测到的顺序影响很小. Figure 4(b) 合并最多 $M=5$ 份, 给出 5 次实验的标准差: $M$ 越大, 前沿越好.

合并系数能不能从夹角直接算出来? 文献 [58] 有一条从夹角算插值系数的规则 $\eta\to2\cos\Omega/(1+\cos\Omega)$. 论文报告它在这里失效: $\Omega\approx90^\circ$ 时 $\cos\Omega\approx0$, 规则给出 $\eta\approx0$, 等于完全丢掉 RL 的结果. 监督微调的夹角在 $40^\circ$ 到 $80^\circ$ 时, 比如 $\Omega=60^\circ$, 规则给出 $2\times0.5/1.5\approx0.67$, 还在可用范围. 这说明 RL 任务向量的几何与监督微调不同, 从后者总结的经验规则要重新检验.

## 4. 第三阶段 LITI 与迭代

### 4.1 动机

SLERP 后的权重奖励高, KL 也高. LITI 借鉴 WiSE-FT. WiSE-FT 在微调权重和零样本权重之间线性插值, 用来在分布偏移下保留预训练模型的鲁棒性. LITI 把同样的操作用在 RL 上, 把 SLERP 结果往初始化拉回一部分:

$$
\theta_\eta=(1-\eta)\cdot\theta_{\mathrm{init}}+\eta\cdot\theta_{\mathrm{slerp}}.
\tag{8}
$$

观察 5: 沿 $\eta$ 往回插值时, KL 下降的比例大于奖励下降的比例, 所以插值得到的点落在单条 RL 曲线的上方.

### 4.2 理论

附录 B 在线性区假设下 (假设 2) 给出两条引理. 引理 3: LERP 合并后的 KL 不超过各自 KL 的插值 (附录式 (17)). 引理 4: LITI 的 KL 满足

$$
\mathrm{KL}(\pi_{\theta_\eta}\Vert\pi_{\theta_{\mathrm{init}}})\le\eta\cdot\mathrm{KL}(\pi_{\theta_{\mathrm{slerp}}}\Vert\pi_{\theta_{\mathrm{init}}}).
\tag{9}
$$

假设 3 设 LITI 的奖励对 $\eta$ 是凹函数. 引理 5 由此推出 LITI 前沿在两端点连线 (对角线) 之上 (附录式 (24), (25), Figure 7). 凹性意味着

$$
r(\theta_\eta)\ge(1-\eta)\,r(\theta_{\mathrm{init}})+\eta\,r(\theta_{\mathrm{slerp}}).
\tag{10}
$$

取 $\eta=0.3$: KL 至多是 SLERP 端点的 $30\%$, 奖励至少恢复两端奖励差的 $30\%$. 两者合起来, 前沿上的点不劣于端点连线. 附录 C 的实测与此一致: KL 对 $\eta$ 是凸的, 几乎线性; 奖励对 $\eta$ 是凹的.

把 KL 在 $\theta_{\mathrm{init}}$ 处做二阶展开, $\mathrm{KL}\approx\frac12\delta^\top F\delta$, $F$ 是 Fisher 信息矩阵. 任务向量缩成 $\eta\delta$ 时 KL 按 $\eta^2$ 缩小, $\eta=0.3$ 时只剩 $9\%$. 实测 KL 对 $\eta$ 几乎线性, 高于二次展开的预测. 一种解释是 RL 后的权重已经离开了二次近似成立的邻域. 式 (9) 给出的线性上界 $30\%$ 与实测更接近.

把三个阶段放进一个二维例子. 设 $\delta_1=(1,0)$, $\delta_2=(0,1)$, 夹角 $90^\circ$, 长度都是 $1$. SLERP 得 $(0.707,0.707)$, 长度 $1$; LERP 得 $(0.5,0.5)$, 长度 $0.707$; 对 SLERP 结果做 $\eta=0.3$ 的 LITI, 得 $(0.212,0.212)$, 长度 $0.3$. 如果 KL 按二次近似与长度平方成正比, 以单条 RL 的 KL 为 $1$, 这三者分别是 $1$, $0.5$, $0.09$. SLERP 在 KL 不变的前提下合并了两个方向; LERP 用一半 KL 换来同样的方向; LITI 再沿这个方向退回. 实际 KL 偏离二次近似, 上一段已经说明, 这里只看相对大小.

附录 C 还试了外推, $0\le\eta\le2$: $\eta>1$ 时沿任务向量方向继续走, SLERP 在高 KL 区更好.

### 4.3 实验

Figure 4(a) 扫 $\eta\in\{0,0.1,0.3,0.5,0.8,1.0\}$, 所有 LITI 前沿都高于 RL 本身的前沿. $\eta=0$ 就是初始化, KL 和奖励增益都为零; $\eta=1$ 就是 SLERP 结果. 中间的四个值在两端之间描出一条曲线, 按式 (10) 它落在两端连线之上. RL 本身的前沿则是单条训练轨迹上各检查点连成的线.

附录 D 的消融 (Figure 13): $M=1$ 时 (不做 SLERP, 只对单条 RL 做 LITI), 增益小得多. 对单条 RL 的检查点 $\{6\mathrm{k},7\mathrm{k},8\mathrm{k},9\mathrm{k}\}$ 做滑动平均也没有帮助. 增益主要来自合并独立训练的多份策略. 同一条轨迹上相邻的检查点方向接近, 平均后与终点差别不大; 独立的两条 RL 任务向量接近正交 (观察 4), 合并才带来新的信息. Figure 17 比较往本轮初始化插值和往 SFT 插值, 两种前沿差不多.

### 4.4 迭代: 观察 6

LITI 的结果当作下一轮初始化, 整个流程重跑 (观察 6, 附录 D.3, $\eta=0.3$). Figure 4(c) 跑了 $I=5$ 轮: 第 1 轮 $T=9\mathrm{k}$, 第 2, 3 轮 $T=7\mathrm{k}$, 之后 $T=5\mathrm{k}$. 每轮前沿都往上移, 增益逐轮递减. 后几轮的 $T$ 更短, 起点已经是上一轮 LITI 的结果, 离 SFT 有一段距离, 每轮只需要再往前走一小段.

每轮只把初始化往 $\theta_{\mathrm{slerp}}$ 推 $30\%$. 下一轮的 RL 从这个更好的起点出发, 再走出新的任务向量, 再合并和插值. 新一轮的锚点 EMA 也从新的初始化开始, 所以 KL 约束跟着起点移动. 这样每轮都能保留大部分 KL 预算, 用来探索新的方向.

按这个步数表, 一条 RL 五轮共 $9+7+7+5+5=33\mathrm{k}$ 步, $M=2$ 时 RL 总步数是 $66\mathrm{k}$, 约为单条 $9\mathrm{k}$ 步训练的 $7.3$ 倍.

### 4.5 第 2 轮的 $\eta$

附录 D 的 Figure 16: 第 2 轮中, $\eta=0.5$ 在高 KL 区更好, $\eta=0.3$ 在 KL 低于 65 时更好. 把 4 份 ($M=4$) 全部合并效果更好, 但计算量翻倍. $\eta$ 越大, 保留的 RL 进展越多, 下一轮起点的 KL 也越高, 所以在高 KL 区占优; $\eta$ 小则起点更保守, 在低 KL 区占优. 循环内 $\eta$ 的选择因此也是在选这条路径偏向前沿的哪一段.

![左栏 WARP 迭代策略并推理采 1, 右栏 WARM 平均的是奖励模型](./images/fig-warp-iterate-not-warm.png)

> 图 2: 左栏是 WARP 迭代: SFT 进入「$M$ 份 REINFORCE + EMA」, SLERP 得到 $\theta_{\mathrm{slerp}}$, LITI ($\eta=0.3$) 交出下一轮初始化. 虚线 recycle 从 next iteration init 回到迭代框, 方向单一. 底框是推理采样 1 次. 右栏是 WARM: 共享奖励模型初始化, 两路奖励模型微调, 线性平均权重, 得到的仍是一个奖励函数 $r$.

**图 2 解析**

- 左栏各步都在改策略权重, 底部推理框只采 1 条.
- 右栏没有策略更新, 平均的对象是奖励模型的权重.
- recycle 虚线只有一个箭头, 指向迭代框, 表示 LITI 的输出成为下一轮输入.
- 两栏并列, 对应论文把 WARP 写成 WARM 的策略侧对应物.

## 5. 实验

### 5.1 设定

策略是 Gemma "7B", 优化器是 REINFORCE, 采样温度 0.9, batch 128, Adam, 学习率 $10^{-6}$, warmup 100 步. 默认超参: $T=9\mathrm{k}$, $\beta=0.1$, $\mu=0.01$, $M=2$, $\lambda=0.5$, $\eta=0.3$. 奖励模型用的是规模最大的那个, 所以没有更大的模型可当金标去检验过优化.

附录 D 的 Figure 15: $\mu=0.005$ 或 $\beta=0.2$ 能略微改善前沿, 但训练更慢. 这些超参在项目开始时选定, 之后没有改. 方向与第 2 节一致: $\mu$ 更小, 锚点更慢, 约束更紧; $\beta$ 更大, 惩罚更重. 两者都让策略走得更稳, 也更慢.

按默认设定估算第 1 轮的采样量: $M=2$ 条 RL, 每条 $9\mathrm{k}$ 步, 每步 batch 128, 共生成约 $2\times9000\times128\approx2.3$ 百万条回答.

### 5.2 Table 1: 逐对比较

把各策略与 Mistral 和 Mixtral 做一对一比较, 每条比较打分为 $\pm1.5$, $\pm1$, $\pm0.5$ 等档, 表中是平均分:

| 策略 | Mistral v1 | Mistral v2 | Mixtral 8x7B |
|---|---|---|---|
| Gemma 1.0 | $0.24$ | $-0.01$ | $-0.08$ |
| Gemma 1.1 | $0.37$ | $0.16$ | $0.08$ |
| REINFORCE (EMA 锚点) | $0.37$ | $0.16$ | $0.07$ |
| WARP 第 1 轮 | $0.42$ | $0.23$ | $0.13$ |
| WARP 第 2 轮 | $0.45$ | $0.25$ | $0.16$ |
| WARP 第 3 轮 | $0.45$ | $0.26$ | $0.18$ |
| WARP 第 4 轮 | $0.45$ | $0.25$ | $0.16$ |
| WARP 第 5 轮 | $0.45$ | $0.24$ | $0.17$ |

正值表示 Gemma 一方更受偏好. 在 Mixtral 8x7B 这一列, Gemma 1.0 是 $-0.08$, WARP 第 3 轮是 $0.18$, 从略逊变为略优. 只用 EMA 锚点的 REINFORCE 与 Gemma 1.1 基本持平. WARP 第 1 轮相对 Gemma 1.1 在三列上分别高 $0.05$, $0.07$, $0.05$; 到第 3 轮是 $0.08$, $0.10$, $0.10$. 第 3 轮之后不再提高, 对 Mistral v2 和 Mixtral 还略有回落. 以 Mistral v1 一列为例, 前三轮的逐轮增量是 $0.05$, $0.03$, $0$, 与 Figure 4(c) 的递减趋势一致.

### 5.3 Table 2: 基准测评

零样本结果:

| 策略 | MBPP | MMLU | GSM8K | MATH | HumanEval | BBH |
|---|---|---|---|---|---|---|
| Gemma 1.1 | $39.0$ | $56.4$ | $55.6$ | $25.6$ | $46.9$ | $53.1$ |
| WARP 第 3 轮 | $45.4$ | $57.6$ | $66.8$ | $31.0$ | $50.0$ | $58.8$ |

差值依次是 $+6.4$, $+1.2$, $+11.2$, $+5.4$, $+3.1$, $+5.7$. 六项都上升, GSM8K 涨得最多, MMLU 最少. 按相对幅度, GSM8K 约 $+20\%$, MATH 约 $+21\%$, MBPP 约 $+16\%$, BBH 约 $+11\%$, HumanEval 约 $+7\%$, MMLU 约 $+2\%$. 数学和代码类涨幅大, 知识类的 MMLU 几乎不变. 对齐税的担忧是 RLHF 会损害这类能力, 这张表在这六项上没有看到这种损害.

### 5.4 长度与多样性

附录 E: 回答长度随 KL 增长; 在同样的 KL 下, 第 3 轮的回答比第 1 轮更长. 加入长度惩罚 $-0.0005\times\mathrm{len}(y)$ 可以抑制, 例如长度 1000 时惩罚是 $-0.5$. 把一份带长度惩罚的策略和一份不带的策略做 SLERP 合并, 既缓解了长度增长, 又改善了前沿 (Figure 18). 这里 SLERP 的用法与第 3 节相同, 只是两条 RL 的奖励不同: 一条带长度惩罚, 一条不带. 合并后的权重同时带有两条任务向量的方向, 也就兼顾了两种目标.

附录 F 用 BLEURT 相似度衡量生成多样性: 相似度与 KL 正相关, 说明 KL 越大, 多样性损失越大. 这与第 1.1 节列出的第三类代价一致, WARP 通过控制 KL 间接控制它.

## 6. 相邻方法与边界

### 6.1 与相邻方法的关系

| 方法 | 平均对象 | 时机 | 推理成本 |
|---|---|---|---|
| WARM | 多个奖励模型的权重 | 奖励建模阶段 | 一个奖励模型 |
| WARP | 多个策略的权重 | RL 阶段内和阶段间 | 一份策略 |
| [J-BOND](../02-BOND-Best-of-N蒸馏/02-BOND-Best-of-N蒸馏.md) | 策略的 EMA 锚点 | RL 阶段内 | 一份策略 |
| WiSE-FT | 微调权重与初始化 | 微调之后 | 一份模型 |

WARM ([arXiv:2401.12187](https://arxiv.org/abs/2401.12187)) 平均的是奖励模型, 用来提高奖励的可靠性. 论文把 WARP 写成它在策略侧的对应: WARM 让奖励更可靠, WARP 让策略在给定奖励下的 KL–奖励权衡更好.

[09 BOND](../02-BOND-Best-of-N蒸馏/02-BOND-Best-of-N蒸馏.md) 的 J-BOND 也用 EMA 锚点, 并引用 WARP 说明 EMA 能降低方差; 它只用了第一阶段, 没有 SLERP 和 LITI. 两者的 EMA 速率也不同: J-BOND 主实验取 $\eta=0.02$, 平均滞后约 49 步; WARP 取 $\mu=0.01$, 约 99 步. 在 J-BOND 里锚点还决定蒸馏目标 $\mathrm{Best\text{-}of\text{-}2}(\pi_{\mathrm{anchor}})$, 在 WARP 里锚点只出现在 KL 惩罚中.

论文相关工作部分还提到: 已有工作把 EMA 当作新的初始化, 也有工作把 EMA 当作 DPO 的参考模型. WARP 的迭代可以对照 DiLoCo: 每轮 $M$ 份并行训练是内循环, LITI 的 $\eta$ 起外层学习率的作用. 写成更新式, 式 (3) 是 $\theta_{\mathrm{init}}\leftarrow\theta_{\mathrm{init}}+\eta\,(\theta_{\mathrm{slerp}}-\theta_{\mathrm{init}})$, 括号里的合并任务向量相当于外层的「伪梯度」, $\eta=0.3$ 是外层步长. 与 DiLoCo 的区别是合并用 SLERP, 内循环是 RL, 外层没有动量.

与 [07 Best-of-N](../01-Best-of-N-奖励模型过优化/01-Best-of-N-奖励模型过优化.md) 和 [RAFT](../04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md) 相比, WARP 在样本层面不做挑选, 改进来自权重空间的操作. 与 [PPO](../../../4.4-强化学习基础/04-PPO/04-PPO.md) 相比, 它用更简单的 REINFORCE, 没有价值网络.

### 6.2 失效模式与边界

**奖励模型无法外部检验.** 实验用的是最大的奖励模型, 没有金标模型去检验过优化. 前沿在代理奖励上更好, 不保证在真实偏好上也更好. Table 1 的逐对比较和 Table 2 的基准提供了一部分外部证据.

**只有一个规模.** 全部实验都在 Gemma "7B" 上, 一个奖励模型, 一套超参. 观察 4 的正交性, 默认 $\eta$ 和迭代步数表在其他规模上是否成立, 论文没有数据.

**迭代收益递减.** Table 1 第 3 轮之后不再提高, Figure 4(c) 的增益逐轮变小. 每轮的计算量不变, 继续迭代性价比下降.

**训练成本.** 默认设定下五轮共 $66\mathrm{k}$ 步 RL. 每一步都要采样, 打分和反传, 成本主要随步数线性增加; 合并和插值只是权重运算, 相比之下可以忽略. Figure 16 显示合并更多份能更好, 但计算量成倍增加.

**长度漂移.** 迭代会让同 KL 下的回答更长 (附录 E). 需要长度惩罚或与带惩罚的策略合并.

**理论假设.** 附录 B 的引理依赖等长任务向量 (假设 1), 线性区 (假设 2) 和奖励对 $\eta$ 凹 (假设 3). 大步长或远离初始化时, 线性区假设可能不成立; 附录 C 的外推结果只覆盖 $\eta\le2$.

**部署点要另外选.** 式 (4) 给出的是一族权重, 部署哪一个取决于 KL 预算和外部评估. 论文的 Table 1, Table 2 只报告了迭代各轮的结果, 前沿上其他点的外部评估要使用者自己做.

**多份合并的顺序.** $M>2$ 的递归 slerp 不满足结合律, 结果依赖顺序, 论文测得影响很小.

## 参考文献

1. Ramé, A., Ferret, J., Vieillard, N., et al. (2024). [WARP: On the Benefits of Weight Averaged Rewarded Policies](https://arxiv.org/abs/2406.16768). arXiv:2406.16768.
2. Ramé, A., et al. (2024). [WARM: On the Benefits of Weight Averaged Reward Models](https://arxiv.org/abs/2401.12187).
3. Sessa, P. G., et al. (2024). [BOND: Aligning LLMs with Best-of-N Distillation](https://arxiv.org/abs/2407.14622).
4. Wortsman, M., et al. (2022). Robust fine-tuning of zero-shot models. *CVPR*.
5. Jang, D.-H., et al. (2024). Model Stock: All we need is just a few fine-tuned models.
6. Douillard, A., et al. (2023). DiLoCo: Distributed Low-Communication Training of Language Models.
7. Shoemake, K. (1985). Animating rotation with quaternion curves. *SIGGRAPH*.
8. Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine Learning*.
9. Gemma Team. (2024). [Gemma: Open Models Based on Gemini Research and Technology](https://arxiv.org/abs/2403.08295).
