---
title: "06 · SCOPE: 按对错分流的双路径 OPD"
published: true
tags: ["OPD", "SCOPE", "On-Policy Distillation", "Dual-Path Adaptive Weighting", "Reasoning"]
excerpt: "SCOPE 先用验证器把学生的在线轨迹分成对错两组: 错的走教师困惑度加权的 OPD, 对的走学生困惑度加权的 MLE, 两组各自在同一提示内做 softmax 归一化. 1.5B 学生上六项数学平均 Avg@32 从 OPD 的 52.3 到 55.2, Pass@32 从 73.1 到 75.0."
---
# SCOPE: 按对错分流的双路径 OPD

> 相关阅读: [01 OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md) · [04 SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) · [05 G-OPD](../05-GOPD-散度光谱/05-GOPD-散度光谱.md) · [07 OPD 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md) · [4.6.3 状态分布视角](../../4.9.3-状态分布视角/4.9.3-状态分布视角.md)

本文的材料是 Zheng, Ma 等 (美团 LongCat 团队) 的 *SCOPE: Signal-Calibrated On-Policy Distillation Enhancement with Dual-Path Adaptive Weighting* (arXiv:2604.10688), 名字 SCOPE 取自标题前半的 Signal-Calibrated On-Policy Distillation Enhancement. 它要回答的问题是: OPD 对学生的每条 rollout 施加同样强度的教师 KL, 做对的轨迹和做错的轨迹是否都该这样对待.

## 1. 问题: 均匀监督忽略了信号质量

论文的出发点是 RLVR 的信用分配. GRPO 这类算法只在长推理轨迹的最后一步给一个标量结果奖励, 中间几千个 token 谁对谁错无从区分, 收敛要很多轮迭代; 论文 §5.1 还指出小模型表示能力有限, 自行传播信用的余地更小. 过程奖励模型 (PRM) 能给逐步反馈, 但要昂贵的人工标注, 跨领域泛化也差. 于是转向从更强的教师那里取 token 级的稠密监督.

OPD 在学生自己采样的轨迹上查询教师, 用逐 token 的 log-ratio 作稠密奖励 (见 [01](../01-OPD基础原理/01-OPD基础原理.md)). 相比离线 KD, 它训练的状态来自学生自己的分布, 避开了 exposure bias. 这里默认教师在每条 rollout 上给出的信号同样可靠. SCOPE 论文 §1 指出这条默认在两类轨迹上各有问题, 并用 §2 的两个预实验给出证据.

### 1.1 正确轨迹: Pass@k 悖论

同一提示下的正确解有两种: 一种走学生已经熟练的主导路径, 采样概率高; 另一种走概率低的少见路径, 也到达了正确答案. 均匀地强化所有正确轨迹, 主导路径因为被采到得多, 累积的梯度也多, 少见路径的份额被进一步压低.

论文引用 Zhu 等 (2025) 的结果: 在 Qwen2.5-7B 上只强化模型自己的正确答案 (Positive Sample Reinforcement, PSR), Pass@1 上升, Pass@32 从 93.7% 降到 84.9%. 论文自己在 DeepSeek-R1-Distill-Qwen-1.5B 上对全部轨迹做 OPD, AIME24 上看到同样的模式: Pass@1 上升, Pass@32 从 76.5% 降到 75.0% (Figure 1a). 对正确轨迹施加教师 KL 还有另一层问题: 学生自己找到的有效路径若与教师分布不同, 会被拉向教师.

结论是, 正确组需要一个权重, 把学习量从已经掌握的解挪到「做对了但学生自己把握不大」的解上.

### 1.2 错误轨迹: 坏前缀陷阱

错误轨迹本身没有监督目标, 只能靠教师纠错. 但在 on-policy 设定下, 教师是条件在学生写出的前缀上打分的. 前缀若已经逻辑错乱, 教师的分布也会被带乱, 给出的 token 级信号接近噪声.

论文 §2.2 的 Error Recovery Experiment (细节在附录 C.1):

1. 从 DeepMath 抽 2,000 题, 学生 (R1-Distill-Qwen-1.5B) 每题采 4 条, 温度 0.6, top-k 20, top-p 0.95, 最长 32,768 token, 只留错误轨迹.
2. 用教师 (Skywork-OR1-7B) 只在 response token 上算每条错误轨迹的困惑度, 按四分位分成 Q1-Q4 四个等大桶.
3. 在 20%, 40%, 60%, 80% 长度处 (就近对齐换行) 截断, 让教师从截断处续写 4 次, 恢复率取 4 次的平均正确率.

各桶的教师困惑度 (Table 6):

| 桶 | PPL 均值 | NLL 均值 |
|----|---------|---------|
| Q1 (最低) | 1.361 | 0.305 |
| Q2 | 1.565 | 0.448 |
| Q3 | 1.710 | 0.536 |
| Q4 (最高) | 2.383 | 0.688 |
| 全体 | 1.755 | 0.494 |

恢复率 (Table 7, %):

| 截断比例 | Q1 | Q2 | Q3 | Q4 | Q1-Q4 差 |
|---------|----|----|----|----|---------|
| 0.2 | 64.9 | 59.7 | 54.0 | 45.4 | +19.4 |
| 0.4 | 55.8 | 53.2 | 50.1 | 40.2 | +15.6 |
| 0.6 | 44.8 | 43.1 | 41.0 | 34.5 | +10.3 |
| 0.8 | 35.8 | 35.3 | 32.6 | 28.6 | +7.2 |

两个规律. 每一行都是 Q1 到 Q4 单调下降, 教师困惑度低的前缀更容易被救回来. 每一列都随截断比例单调下降, 前缀越长越难救, 最好的 Q1 桶到 80% 截断也只剩 35.8%. Q1-Q4 的差距随截断变长而缩小, 从 19.4 个点降到 7.2 个点, 前缀够长时各桶都难救, 困惑度的区分力也随之变弱.

附录 C.4 (Table 9-12) 列了四个 Q4 桶 ($\mathrm{PPL}\ge1.80$) 的错误样例:

| 题目 | 标准答案 | 学生答案 | 错误类型 |
|------|---------|---------|---------|
| 整数 $a_1,\dots,a_{100}$ 满足 $\sum a_i^2/\sum a_i=100$, 求 $a_1$ 最大值 | 550 | 100 | 展开多项式时打出几千位重复数字, 最后随手写一个答案 |
| Mandelbrot 集的周长有限还是无限 | 无限 | 有限 | 同一段话原样重复四遍, 始终没有下结论 |
| $[a,b]$ 上有界变差且有介值性质的函数是否必然连续 | 是 | 否 | 拿 Cantor 函数作反例, 没有检查它是否满足介值性质 |
| $K=\lfloor\sum_{r=1}^{80}\int_0^1x^{\sqrt r-1}dx\rfloor$ | 16 | 17 | 先算出 $\sum\approx16.888$, 又用错误的积分界改成 17.28 |

前两种是结构性崩坏, 后两种是逻辑错误. 第四题的积分等于 $1/\sqrt r$, 学生其实一度算对了和, 错在后面的自我否定. 论文的解读是这些上下文让教师的预测分布变平, 教师在这样的前缀上打出的是高熵, 没有信息量的信号, 标准 OPD 却要求学生去拟合它.

由此得到错误组的权重方向: 教师困惑度越高, 权重越低. 拿困惑度当可靠性的代理, 论文引了两项校准研究: Kadavath 等 (2022) 发现语言模型对自己答案正确与否的概率估计大体是校准的, Xiong 等 (2024) 系统评测了 LLM 表达置信度的各种方式. 附录 A.1 据此把论证落到单个 token 上: 前缀已经出错时, 教师更可能给采样 token 低概率, 或给出信息量更少的分布, $-\log\pi_T(a_t\mid x,a_{<t})$ 变大, 这一位置的优势主要反映教师没有把握, 不代表有意义的纠错方向.

把 1.1 和 1.2 两处问题放在一起看, 共同点是 OPD 不区分信号质量, 但需要的度量方向相反: 错误轨迹上看教师有多大把握 (教师 PPL), 正确轨迹上看学生有多大把握 (学生 PPL). SCOPE 的设计就是先按结果分流, 再在每条支路里用对应的困惑度重新分配权重.

## 2. 方法

### 2.1 按结果分组

对每个提示 $x$, 学生生成 $N$ 条回答 $Y^x=\{y_1,\dots,y_N\}$, $y_i=(a_{i,1},\dots,a_{i,|y_i|})$. 验证器给每条一个二值奖励 $R_i\in\{0,1\}$, 据此分成两个不相交的子集:

$$
\Omega_c^x=\{y_i\in Y^x\mid R_i=1\},\qquad\Omega_w^x=\{y_i\in Y^x\mid R_i=0\} \tag{1}
$$

### 2.2 两个 surrogate

rollout 由行为策略 $\pi_{\mathrm{old}}$ 生成, 更新的是 $\pi_\theta$. token 级重要性比 (论文式 (1)):

$$
\rho_{i,t}(\theta)=\frac{\pi_\theta(a_{i,t}\mid x,a_{i,<t})}{\pi_{\mathrm{old}}(a_{i,t}\mid x,a_{i,<t})} \tag{2}
$$

分母是 rollout 时的行为策略, 与教师无关.

**正确轨迹, 自强化** (论文式 (2)). 不查教师, 直接提高学生已采样动作的概率:

$$
\mathcal L_{\mathrm{MLE}}(x,y_i;\theta)=-\sum_{t=1}^{|y_i|}\rho_{i,t}(\theta),\qquad i\in\Omega_c^x \tag{3}
$$

在 $\theta=\theta_{\mathrm{old}}$ 处 $\nabla_\theta\rho_{i,t}=\nabla_\theta\log\pi_\theta(a_{i,t}\mid\cdot)$, 所以式 (3) 的梯度就是负的对数似然梯度之和, 与在这条轨迹上做 teacher-forcing 的 NLL 一阶等价; 离开 $\theta_{\mathrm{old}}$ 后多了重要性比的修正. 正确支路不用教师, 论文给的理由是: 学生自己找到的解已经通过了验证, 本身就是可用的监督目标, 再加教师 KL 只会把与教师写法不同的有效解拉回教师分布 (§1 引 Agarwal 等 2024).

**错误轨迹, 蒸馏** (论文式 (3)). 把 token 级 log-ratio 当作负优势, 最小化 reverse KL:

$$
\mathcal L_{\mathrm{OPD}}(x,y_i;\theta)=\sum_{t=1}^{|y_i|}\rho_{i,t}(\theta)\Bigl(\log\pi_{\bar\theta}(a_{i,t}\mid x,a_{i,<t})-\log\pi_T(a_{i,t}\mid x,a_{i,<t})\Bigr),\qquad i\in\Omega_w^x \tag{4}
$$

$\bar\theta$ 表示从计算图上分离的参数, 括号里的量对学生不传梯度. 这是采样 token 上的单点估计, 每个位置只用学生实际采到的那个 token 的教师 log-prob, 不展开全词表.

### 2.3 双路径自适应权重 (DPAW)

记序列对数概率 $\log\pi(y_i\mid x)=\sum_t\log\pi(a_{i,t}\mid x,a_{i,<t})$, 序列困惑度 $\mathrm{PPL}(y_i\mid x)=\exp\bigl(-\tfrac{1}{|y_i|}\log\pi(y_i\mid x)\bigr)$. 两路权重都只在同一提示的同一子组里做 softmax.

**学生权重** (论文式 (4)), 对长度归一化的负对数概率做组内 softmax:

$$
w_i^{\mathrm{stu}}=\frac{\exp\bigl(-\tfrac{1}{\tau|y_i|}\log\pi_S(y_i\mid x)\bigr)}{\sum_{j\in\Omega_c^x}\exp\bigl(-\tfrac{1}{\tau|y_j|}\log\pi_S(y_j\mid x)\bigr)}=\frac{\mathrm{PPL}_S(y_i\mid x)^{1/\tau}}{\sum_{j\in\Omega_c^x}\mathrm{PPL}_S(y_j\mid x)^{1/\tau}} \tag{5}
$$

学生困惑度越高的正确轨迹权重越大.

**教师权重** (论文式 (5)), 对教师的长度归一化对数概率做组内 softmax:

$$
w_i^{\mathrm{tea}}=\frac{\exp\bigl(\tfrac{1}{\tau|y_i|}\log\pi_T(y_i\mid x)\bigr)}{\sum_{j\in\Omega_w^x}\exp\bigl(\tfrac{1}{\tau|y_j|}\log\pi_T(y_j\mid x)\bigr)}=\frac{\mathrm{PPL}_T(y_i\mid x)^{-1/\tau}}{\sum_{j\in\Omega_w^x}\mathrm{PPL}_T(y_j\mid x)^{-1/\tau}} \tag{6}
$$

教师困惑度越高的错误轨迹权重越小. 这是连续加权, 没有阈值, 也不丢弃样本.

### 2.4 总目标

论文式 (6):

$$
\mathcal J_{\mathrm{SCOPE}}=\mathbb E_{x\sim\mathcal D}\Bigl[\sum_{i\in\Omega_c^x}w_i^{\mathrm{stu}}\,\mathcal L_{\mathrm{MLE}}(x,y_i)+\sum_{i\in\Omega_w^x}w_i^{\mathrm{tea}}\,\mathcal L_{\mathrm{OPD}}(x,y_i)\Bigr] \tag{7}
$$

两组的权重各自求和为 1. 一个提示的轨迹全对时只有 MLE 支路有梯度, 全错时只有 OPD 支路; 某组只有一条时, 它的权重就是 1. 式 (7) 里没有其他项: 没有额外的 SFT 损失, 没有 KL 正则, 也没有 GRPO 的裁剪.

### 2.5 每个提示的总权重

式 (7) 有一个直接的推论: 不论一个提示有几条正确, 几条错误, 只要两组都非空, 每条支路分到的总权重都是 1. 这与 GRPO 的分配方式不同.

以 $N=8$ 为例. 二值奖励下 GRPO 的组相对优势是 $(R_i-\bar R)/\sigma_R$. 若 8 条中对 2 条, $\bar R=0.25$, $\sigma_R=\sqrt{0.25\times0.75}=0.433$, 正确轨迹的优势 $0.75/0.433=1.73$, 错误轨迹 $-0.25/0.433=-0.58$; 两条正确轨迹的优势合计 3.46, 六条错误合计 $-3.46$. 若对 6 条, 数字对调: 正确每条 0.58, 错误每条 $-1.73$. GRPO 的每条优势随正确率变化, 正确率越低, 每条正确轨迹的份额越大.

SCOPE 中, 对 2 条时两条正确轨迹平分 1 (按学生 PPL 倾斜), 六条错误轨迹平分 1 (按教师 PPL 倾斜); 对 6 条时比例倒过来, 但两条支路的总量仍各为 1. 正确率只决定每条支路内部有几个样本来分这 1 份权重, 不改变两条支路之间的比重. 一个提示里只对了一条时, 这条拿到正确支路的全部权重.

另一点是式 (3)(4) 对 token 求和, 不取平均. 组内权重决定轨迹之间的份额, 一条轨迹内部的梯度量仍与它的长度成正比. 实现中若改用 token-mean 或 sequence-mean 的 reduction, 长短轨迹之间的相对贡献会变, 与论文的目标不再相同.

### 2.6 一个数值例子

取 $\tau=1$, 某提示的错误组有三条, 教师困惑度恰好取 Table 6 中 Q1, 全体, Q4 的均值 1.361, 1.755, 2.383. 由式 (6), 权重正比于 $\mathrm{PPL}_T^{-1}$:

$$
\tfrac{1}{1.361}=0.735,\quad\tfrac{1}{1.755}=0.570,\quad\tfrac{1}{2.383}=0.420,\qquad\text{和}=1.724
$$

归一化后 $w^{\mathrm{tea}}=(0.426,\,0.330,\,0.243)$. 均匀 OPD 下三条都是 $1/3$, 这里 Q4 那条的份额降了约 27%, Q1 那条升了约 28%.

换温度看锐度. $\tau=0.5$ 时权重正比于 $\mathrm{PPL}_T^{-2}$, 得 $(0.519,\,0.312,\,0.169)$; $\tau=2$ 时正比于 $\mathrm{PPL}_T^{-1/2}$, 得 $(0.379,\,0.334,\,0.287)$, 已接近均匀. 用有效样本量 $\mathrm{ESS}=1/\sum_iw_i^2$ 衡量集中度, $\tau=1$ 时 $\mathrm{ESS}=2.86$, 三条样本的信息还基本都在用.

正确组同理, 方向相反. 设三条正确轨迹的学生困惑度为 1.2, 1.5, 2.0, $\tau=1$ 时权重正比于 PPL 本身, 和为 4.7, 得 $(0.255,\,0.319,\,0.426)$: 学生最没把握的那条拿到最大份额.

这个例子也说明了长度归一化的作用. 一条 4,000 token 的回答, 序列对数概率可能在 $-1000$ 量级, 直接对它做 softmax, 权重会全部压到一条上. 除以 $|y_i|$ 后比较的是每 token 平均 NLL, 1.2 和 2.0 的困惑度对应平均 NLL 0.18 和 0.69, 差距落在 softmax 能平滑处理的范围里.

## 3. 理论动机 (附录 A)

### 3.1 坏前缀放大更新尺度 (A.1)

记分离后的蒸馏信号 $A_t=\log\pi_{\bar\theta}(a_t\mid\cdot)-\log\pi_T(a_t\mid\cdot)$. 在 $\theta\approx\theta_{\mathrm{old}}$ 处, 单条轨迹的随机梯度是

$$
g_{\mathrm{OPD}}(x,y)=\sum_{t=1}^{|y|}\nabla_\theta\log\pi_\theta(a_t\mid x,a_{<t})\cdot A_t \tag{8}
$$

由 Cauchy 不等式, 若得分函数有界 $\|\nabla_\theta\log\pi_\theta\|\le G$,

$$
\mathbb E\bigl[\|g_{\mathrm{OPD}}\|^2\bigr]\le|y|\,G^2\sum_{t=1}^{|y|}\mathbb E\bigl[A_t^2\bigr] \tag{9}
$$

更新的二阶矩由 $A_t^2$ 控制. 前缀坏掉时教师对采样 token 给出更低的概率, $-\log\pi_T$ 变大, $A_t$ 随之变大, 噪声更新的尺度也变大. 序列级的 $\mathrm{PPL}_T$ 正是 $-\log\pi_T$ 的长度平均取指数, 用它降权就是压低 $A_t$ 偏大的那些轨迹的份额.

### 3.2 学生权重部分抵消采样频率 (A.2)

不看组内归一化常数, 由式 (5),

$$
w_i^{\mathrm{stu}}\propto\pi_S(y_i\mid x)^{-\frac{1}{\tau|y_i|}} \tag{10}
$$

代回期望梯度 (为简洁略去长度归一化的影响):

$$
\mathbb E_{y\sim\pi_S}\bigl[w^{\mathrm{stu}}(y)\nabla_\theta\log\pi_\theta(y\mid x)\bigr]\propto\sum_{y\in\Omega_c^x}\pi_S(y\mid x)^{1-\frac{1}{\tau|y|}}\,\nabla_\theta\log\pi_\theta(y\mid x) \tag{11}
$$

均匀 MLE 下每条正确路径的贡献与 $\pi_S(y\mid x)^1$ 成正比, 高频路径占主导. 加权后指数从 1 降到 $1-\frac{1}{\tau|y|}$, 部分抵消了采样频率的偏置; $\tau$ 越小抵消越强. 论文明确说这不保证罕见路径一定被保留, 只是降低高频模式的支配程度.

### 3.3 组内归一化控制更新尺度 (A.3)

两路权重都可写成 $w_i=\exp(S_i/\tau)/\sum_j\exp(S_j/\tau)$, 满足 $\sum_iw_i=1$, $0<w_i<1$. 每条支路的梯度因此是各轨迹梯度的凸组合:

$$
\Bigl\|\sum_{i\in\Omega}w_ig_i\Bigr\|\le\sum_{i\in\Omega}w_i\|g_i\|\le\max_{i\in\Omega}\|g_i\| \tag{12}
$$

若直接用原始 PPL 作权重, 不同提示因难度, 长度, 推理结构不同, PPL 的量级不同, 更新尺度会随提示漂移. 组内 softmax 去掉了这层依赖. 论文也说明这一步让估计有偏: 它刻意偏向可靠的纠错和欠探索的有效路径, 作者称之为 signal-calibrated bias.

## 4. 实验

### 4.1 设置

两组师生, 训练集都是 DeepMath:

- SkyWork-OR1-7B 教 DeepSeek-R1-Distill-Qwen-1.5B;
- Qwen3-8B-Instruct 教 Qwen3-1.7B-Base.

基线是 GRPO, 离线 KD (在教师生成的静态序列上做监督学习), 标准 OPD. 评测六个数学基准: AIME24, AIME25, AMC23, MATH500, Minerva, OlympiadBench, 指标 Avg@32 (32 次采样的平均正确率) 与 Pass@32 (32 次中至少对一次).

训练超参 (Table 3, 三种方法相同处合并):

| 参数 | GRPO | OPD | SCOPE |
|------|------|-----|-------|
| 学习率 / 调度 | $5\times10^{-5}$ 常数 | 同左 | 同左 |
| weight decay | 0.01 | 0.01 | 0.01 |
| prompt batch / mini batch | 256 / 256 | 256 / 256 | 256 / 256 |
| 最大 prompt / completion | 4,096 / 12,288 | 同左 | 同左 |
| 每题生成数 $G$ | 8 | 1 | 8 |
| rollout 温度 | 0.6 | 0.6 | 0.6 |
| KL 系数 $\beta$ / 裁剪 $\epsilon$ | 0.0001 / 0.2 | – | – |
| 每批更新轮数 | 1 | 1 | 1 |

SCOPE 的权重温度 $\tau=1.0$. 评测 (Table 4): 每题 32 个样本, 温度 0.6, top-p 0.95, top-k 20, 最长 32,768 token; Qwen3-1.7B 在评测中重复严重, 重复惩罚设为 1.08, Distill-1.5B 为 1.0. 硬件是 20 张 A100 80GB, 16 张训练学生, 4 张部署教师.

### 4.2 数学主结果 (Table 1)

第一组, SkyWork-OR1-7B 教 R1-Distill-Qwen-1.5B:

| 方法 | AIME24 A/P | AIME25 A/P | AMC23 A/P | MATH500 A/P | Minerva A/P | Olympiad A/P | 平均 A/P |
|------|-----------|-----------|----------|------------|------------|-------------|---------|
| 学生原模型 | 29.4 / 76.5 | 23.9 / 46.9 | 72.7 / 94.7 | 84.6 / 97.3 | 32.3 / 55.9 | 44.2 / 67.5 | 47.9 / 73.1 |
| GRPO | 35.5 / 68.3 | 24.5 / 45.1 | 75.1 / 95.0 | 87.0 / 96.7 | 35.1 / 53.5 | 40.5 / 67.7 | 49.6 / 71.1 |
| KD | 26.6 / 71.4 | 22.2 / 45.6 | 69.1 / 96.3 | 84.1 / 97.4 | 30.7 / 54.1 | 39.7 / 66.9 | 45.4 / 72.0 |
| OPD | 40.2 / 75.0 | 28.9 / 48.5 | 75.9 / 95.0 | 89.0 / 97.7 | 34.9 / 53.0 | 44.9 / 69.3 | 52.3 / 73.1 |
| **SCOPE** | 42.7 / 77.9 | 30.4 / 50.9 | 80.9 / 97.2 | 89.8 / 97.9 | 37.8 / 55.1 | 49.7 / 70.9 | **55.2 / 75.0** |

相对 OPD, Avg@32 平均 +5.54%, Olympiad 上最大, +10.69%, AMC23 +6.59%; Pass@32 平均 +2.60%. GRPO 的 Avg@32 比原模型高 1.7, Pass@32 却从 73.1 降到 71.1, AIME24 的 Pass@32 从 76.5 降到 68.3, 这是 1.1 节说的悖论. OPD 的平均 Pass@32 与原模型持平, 四种训练方法里只有 SCOPE 让平均 Pass@32 上升.

KD 是表中唯一的 off-policy 基线, 在教师生成的固定轨迹上训练. 它的平均 Avg@32 (45.4) 低于未训练的学生 (47.9), 代码上也一样, 26.5 低于原模型的 33.1 (4.5 节). 论文 §5.2 把 off-policy KD 的问题归结为 exposure bias 和训练与推理分布不一致: 学生学的是教师写出的前缀, 推理时却要在自己写的前缀上续写. OPD 和 SCOPE 都在学生自己的 rollout 上训练, 这一组对照里两者都明显高于 KD.

第二组, Qwen3-8B-Instruct 教 Qwen3-1.7B-Base:

| 方法 | 平均 Avg@32 | 平均 Pass@32 |
|------|------------|-------------|
| 学生原模型 | 19.0 | 49.2 |
| GRPO | 26.5 | 50.4 |
| KD | 20.1 | 46.8 |
| OPD | 30.6 | 55.9 |
| **SCOPE** | **32.5** | **58.6** |

相对 OPD 平均 Avg@32 +6.21%, Pass@32 +4.83%. 单项里 AIME25 的 Pass@32 涨得最多, 29.7 到 35.6 (+19.87%). 这一组也有一项回退: OlympiadBench 的 Avg@32 从 OPD 的 25.3 降到 24.6 (−2.77%). KD 在这个 base 模型上把平均 Pass@32 从 49.2 拉低到 46.8, 论文把它和 GRPO 一起归为探索能力退化.

读这张表要记住 Table 3 的一处设置差异: OPD 基线每题只采 1 条 rollout, SCOPE 采 8 条, 两者每步看到的样本数差 8 倍, 每步耗时也差约 2.8 倍 (4.6 节). SCOPE 相对 OPD 的增益因此同时包含了更多 rollout 和双路径加权两部分; 能单独隔离加权作用的是 4.4 节的消融, 那里去掉 DPAW 后 AIME25 Pass@32 从 50.9 降到 45.7.

摘要中「Avg@32 平均相对提升 11.42%, Pass@32 提升 7.30%」的比较对象是论文所说的 competitive baselines, 数值高于对 OPD 的 5.54% 与 2.60%.

### 4.3 训练动态与 Pass@k

Figure 3 对比三种方法的熵损失和 AIME24/25 的 Avg@32 曲线. GRPO 的策略熵持续下降, 论文认为这是过早利用, 正是 Pass@k 悖论的成因; OPD 和 SCOPE 的熵都保持在较高水平, 但 OPD 较早进入平台, SCOPE 的曲线一直在 OPD 上方.

Figure 4 画 AIME24, AIME25, AMC23 上 $k$ 从 1 到 32 的 Pass@k. GRPO 和 OPD 在大 $k$ 处增长放缓或持平, AIME24 上最明显; SCOPE 到 $k=32$ 仍在上升.

### 4.4 消融与权重温度 (Figure 5, 附录 C.2)

- 整个 DPAW 去掉 (两路都均匀): AIME25 Pass@32 从 50.9 降到 45.7.
- 去掉学生权重: AIME24 Pass@32 从 77.9 降到 74.1; 把学生权重方向反过来 (偏向低 PPL) 也变差.
- 去掉或反转教师权重都降低精度; 反转时 AIME24 Avg@32 从 42.7 降到 38.6.

反转实验比去掉更有信息量. 反转学生权重等于加倍强化主导路径, 反转教师权重等于偏向教师最没把握的轨迹, 两者都变差, 说明权重方向本身有作用, 与「加一个额外的重加权就有收益」区分开了.

权重的锐度由温度控制. 附录 C.2 让 $\tau$ 取 0.5, 1.0, 2.0, AIME24, AIME25, AMC23 三项上都是 1.0 最好 (Figure 6). $\tau$ 小时权重集中到困惑度极端的轨迹上, 放大离群噪声, 训练不稳; $\tau$ 大时退回均匀加权, 又回到标准 OPD 的问题. 只比较了这三个值, 其他模型上的最优 $\tau$ 需要重新扫.

### 4.5 代码 (Table 2)

训练集是 TACO 的 25,202 道编程题 (来自 Codeforces, AtCoder, Aizu Online Judge, GeeksforGeeks). 评测用 HumanEval (164 题), LiveCodeBench 2024.08-2025.02 (279 题), 以及从 TACO 抽出的 500 道 Codeforces 题, 这 500 题已从训练集中剔除. 1.5B 学生配置:

| 方法 | HumanEval A/P | Codeforces A/P | LiveCodeBench A/P | 平均 A/P |
|------|--------------|---------------|------------------|---------|
| 学生原模型 | 57.8 / 74.1 | 20.3 / 39.4 | 21.2 / 35.2 | 33.1 / 49.6 |
| GRPO | 61.5 / 75.2 | 32.4 / 45.3 | 34.5 / 45.7 | 42.8 / 55.4 |
| KD | 49.5 / 73.2 | 12.9 / 22.9 | 17.1 / 25.1 | 26.5 / 40.4 |
| OPD | 64.3 / 78.2 | 33.3 / 52.3 | 30.2 / 47.0 | 42.6 / 59.2 |
| **SCOPE** | 67.2 / 80.2 | 34.4 / 53.7 | 32.3 / 47.0 | **44.6 / 60.3** |

相对 OPD 平均 Avg@32 +4.69%. LiveCodeBench 上 GRPO 的 Avg@32 (34.5) 高于 SCOPE (32.3), Pass@32 则 SCOPE 与 OPD 持平 (47.0).

### 4.6 计算成本 (附录 C.3, Table 8)

每步墙钟时间 (秒), 稳定训练段的均值, GRPO 与 SCOPE 每题 8 条 rollout, OPD 1 条:

| 组成 | GRPO | OPD | SCOPE |
|------|------|-----|-------|
| 生成 | 264.5 | 164.5 | 247.7 |
| old logprob | 34.0 | 5.2 | 31.4 |
| 奖励计算 | 4.8 | 0.7 | 4.6 |
| actor 更新 | 151.8 | 22.9 | 154.1 |
| 教师打分 | – | 31.2 | 200.0 |
| 合计 | 459.0 | 227.5 | 641.9 |

SCOPE 比 GRPO 多 182.9 秒, 与教师打分的 200.0 秒相当, 权重计算本身的开销可忽略. 与 OPD 的 414.4 秒差额则不只来自教师: rollout 从 1 条变成 8 条, 生成, old logprob, actor 更新都跟着涨. 论文用的是同步架构, rollout 与教师打分不重叠; 作者预计改成异步后效率可接近 GRPO, 但没有给出异步实验.

## 5. 实现, 相邻方法与局限

### 5.1 实现要点

一次迭代的数据流:

```text
for prompts in loader:
    rollouts = sample(policy_old, prompts, n=G)          # 每题 G 条
    R = verifier(prompts, rollouts)                      # 0/1
    old_logp = score(policy_old, rollouts)               # 逐 token
    cur_logp = score(policy, rollouts)
    ratio = exp(cur_logp - old_logp)

    for each prompt group:
        C = rollouts with R == 1
        W = rollouts with R == 0
        if C:
            s = -seq_mean(cur_logp[C])                   # = log PPL_S
            w_stu = softmax(s / tau)
            loss += sum(w_stu * (-token_sum(ratio[C])))
        if W:
            t_logp = score(teacher, W)                   # 教师只打分, 不生成
            s = seq_mean(t_logp)                         # = -log PPL_T
            w_tea = softmax(s / tau)
            adv = stopgrad(cur_logp[W]) - t_logp
            loss += sum(w_tea * token_sum(ratio[W] * adv))
    optimize(loss)
```

几处容易写错的地方:

- **在 log 空间算权重**. 式 (5)(6) 的 softmax logits 就是 $\pm$ 平均 NLL 除以 $\tau$, 不必先取指数得到 PPL; 减去组内最大值再 softmax.
- **归一化范围**. 分母只包含同一提示, 同一正确性的轨迹. 分布式训练时同一提示的 $G$ 条 rollout 若被切到不同设备, 要先聚合再归一化, 否则就退化成了按设备归一化.
- **PPL 只算 response token**. 预实验 (附录 C.1) 明确排除了 prompt; 训练中的 mask 也要与之一致, padding 和特殊 token 不进入长度 $|y_i|$.
- **三套 log-prob 对齐**. $\pi_{\mathrm{old}}$, $\pi_\theta$, $\pi_T$ 必须在同一 token 序列上打分, 论文两组师生都同属一个 tokenizer 家族, 跨 tokenizer 的教师需要另做对齐.
- **梯度路径**. 式 (4) 括号里的学生 log-prob 停梯度. 附录 A 的推导把 $w_i$ 当作给定的系数, 实现里权重也应分离, 否则学生权重的梯度会反过来推动学生改变自己的 PPL.

训练时还要监控. 记录每批全对, 全错, 混合提示的比例; 全对或全错的提示只走一条支路. 再记录两路权重的最大值和 ESS, 权重集中时先查是否有异常长或打分失败的轨迹.

### 5.2 与相邻方法的关系

| 方法 | rollout | 监督来源 | 与 SCOPE 的区别 |
|------|---------|---------|----------------|
| 离线 KD | 教师生成的静态序列 | 教师文本 | 不在学生分布上训练, 论文中两组师生上平均 Pass@32 都下降 |
| 标准 OPD | 学生在线 | 外部教师 token 分布 | 所有轨迹同等蒸馏, 不分对错, 不加权 |
| GRPO | 学生在线 | 可验证标量奖励 | 没有教师的稠密信号; 正确轨迹的组相对优势相同 |
| [OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md) | 学生在线 | 同一模型看到参考解后的分布 | 教师与学生共享参数, 差别在上下文 |
| [SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) | 学生在线 | 带环境反馈的自身 | 不需要外部强教师 |
| [MOPD](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) | 学生在线 | 多个领域教师 | 解决教师选择; SCOPE 只验证了单教师 |
| KDRL, RLAD, REOPOLD | 学生在线 | 奖励加教师 | 论文 §5.2 列为 RL-KD 混合方法, 同样假设教师信号在各 rollout 上同等可靠 |

SCOPE 的正确支路与 GRPO 也有一处对应. GRPO 在一个提示内给所有正确轨迹相同的正优势, SCOPE 的正确支路则给学生困惑度更高的那条更大的系数. 两者都只用到二值结果, 区别在组内怎样分配.

与 [07 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md) 的关系: SCOPE 引用的 Fu 等 (2026) *Revisiting On-Policy Distillation* 讨论的就是 OPD 在学生坏前缀上的失效, SCOPE 的教师权重是针对这一现象的一种轨迹级处理.

### 5.3 局限

论文 Limitation 节自己列了两条:

1. **依赖可自动验证的结果**. 分流要靠可靠的对错判定, 实验只做了数学和代码. 开放对话, 创意写作等主观或偏好型反馈的任务, 需要额外的奖励模型或更复杂的验证机制.
2. **规模受算力限制**. 学生只有 1.5B 和 1.7B, 教师 7B 和 8B, 没有更大的基座, 没有 MoE, 没有更多可验证领域.

从方法本身还能推出几条:

- **验证器的错误直接改变路由**. 假阴性会把有效解送进 OPD 支路被拉向教师, 假阳性会把错误解送进 MLE 支路被自强化. 答案解析, 浮点容差, 多解等价, 代码沙箱的超时设置都会影响结果.
- **困惑度是代理量**. 预实验只建立了「教师 PPL 低的错误前缀更容易被教师救回」这一统计相关, 在 Q1 桶里恢复率也只有 35.8%-64.9%. 教师对某类错误可能很有把握却是错的, 高 PPL 也可能来自少见符号或合理的多种写法.
- **组太小时权重不起作用**. $G=8$ 时一个提示的正确组或错误组常常只有一两条, 此时权重接近 1 或在两条之间分配, DPAW 的效果主要来自混合提示.
- **采样 token 估计**. 式 (4) 只用采到的 token 上的教师 log-prob, 与全词表或 top-k 的 KL 相比方差更大, 也不利用教师分布的其他部分.
- **救不回的轨迹仍然救不回**. 教师权重只是降低坏前缀的份额, 不会为全错且教师也无法续对的提示提供新的信号.

## 参考文献

1. Zheng, B., Ma, X., et al. (2026). [SCOPE: Signal-Calibrated On-Policy Distillation Enhancement with Dual-Path Adaptive Weighting.](https://arxiv.org/abs/2604.10688) *arXiv:2604.10688*. §2 预实验, §3 式 (1)-(6), Table 1-2, Figure 1-6, 附录 A 推导, 附录 B Table 3-5, 附录 C Table 6-12. 代码: [machine981/SCOPE](https://github.com/machine981/SCOPE).
2. Zhu, X., Xia, M., Wei, Z., et al. (2025). [The Surprising Effectiveness of Negative Reinforcement in LLM Reasoning.](https://arxiv.org/abs/2506.01347) *arXiv:2506.01347*.
3. Fu, Y., Huang, H., Jiang, K., Liu, J., Jiang, Z., Zhu, Y., & Zhao, D. (2026). [Revisiting On-Policy Distillation: Empirical Failure Modes and Simple Fixes.](https://arxiv.org/abs/2603.25562) *arXiv:2603.25562*.
4. Lu, K., & Thinking Machines Lab. (2025). [On-Policy Distillation.](https://thinkingmachines.ai/blog/on-policy-distillation) *Thinking Machines Lab: Connectionism*.
5. Agarwal, R., et al. (2024). On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes. *ICLR*.
6. He, Z., et al. (2025). [DeepMath-103K: A Large-Scale, Challenging, Decontaminated, and Verifiable Mathematical Dataset for Advancing Reasoning.](https://arxiv.org/abs/2504.11456) *arXiv:2504.11456*.
7. Li, R., et al. (2023). [TACO: Topics in Algorithmic COde generation dataset.](https://arxiv.org/abs/2312.14852) *arXiv:2312.14852*.
8. Kadavath, S., Conerly, T., Askell, A., et al. (2022). [Language Models (Mostly) Know What They Know.](https://arxiv.org/abs/2207.05221) *arXiv:2207.05221*.
9. Xiong, M., Hu, Z., Lu, X., Li, Y., Fu, J., He, J., & Hooi, B. (2024). [Can LLMs Express Their Uncertainty? An Empirical Evaluation of Confidence Elicitation in LLMs.](https://arxiv.org/abs/2306.13063) *ICLR*.
