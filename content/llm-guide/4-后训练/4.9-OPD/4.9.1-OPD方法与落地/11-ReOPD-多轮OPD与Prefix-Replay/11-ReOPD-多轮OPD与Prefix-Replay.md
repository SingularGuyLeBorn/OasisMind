---
title: "11 · ReOPD: 多轮 OPD 与 Prefix Replay"
published: true
tags: ["OPD", "ReOPD", "Prefix Replay", "多轮 Agent", "蒸馏", "Qwen3"]
excerpt: "ReOPD 把教师 RL 训练时留下的多轮轨迹当作前缀回放, 学生只在被监督的那一步自己出动作, 教师给逐 token 目标, 训练期不调用任何工具. 前缀按 κ^t 衰减采样, κ=0.6. Qwen3-4B 学生在数学工具环境上平均分高于在线 OPD, 搜索环境上与 OPD 持平."
---
# 11 ReOPD: 多轮 OPD 与 Prefix Replay

材料是 Liao, Dong 等 (Microsoft Research 与阿姆斯特丹大学) 的 *Multi-Turn On-Policy Distillation with Prefix Replay* ([arXiv:2607.04763](https://arxiv.org/abs/2607.04763)), 代码在 [BaohaoLiao/ReOPD](https://github.com/BaohaoLiao/ReOPD). 问题是: Agent 要和环境交互多轮, 在线做 OPD 时每次更新都得让学生重新跑一遍环境, 能不能改成回放教师已经跑过的轨迹, 只在被监督的那一步让学生自己出动作. 论文的回答分两半. 理论上, 前缀越接近学生自己会走到的历史, 训练越相关, 但教师在这些历史上的目标也越不可靠, 两者此消彼长; 工程上, 用一个按步数几何衰减的采样分布 $\kappa^t$ 处理这对矛盾, 学生训练期不发起任何工具调用.

单轮 OPD 的目标函数, reverse KL 与 GKD 的关系见 [01-OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md). 下面从多轮交互带来的新问题讲起.

## 1. 多轮 OPD 的代价

### 1.1. 从单轮 OPD 到多轮交互

RL 是 on-policy 的: 模型在自己采的轨迹上训练, 学的是从自己的错误里恢复. 代价是监督稀疏, 一整段 episode 只回传一个标量奖励, 不管生成了多少 token. 论文引 Thinking Machines Lab 2025 年的博客, 把这一点概括为每个 episode 只传几个 bit, 小模型尤其样本低效. 知识蒸馏的信号密得多, 但标准做法是 off-policy 的: 学生在教师走过的前缀上学, 推理阶段一旦早期犯了教师不会犯的错, 就进入训练没见过的前缀, 错误逐步累积 (Ross 等 2011 的 DAgger 分析, Ranzato 等 2016 的 exposure bias). OPD 在学生自己采样的前缀上查询教师的逐 token 分布, 同时拿到 on-policy 的相关性和蒸馏的监督密度.

这些方法基本是在单轮生成上发展起来的. Agent 任务要和环境交替多轮: 执行代码, 检索, 调搜索引擎, 再读环境的反馈. 记第 $t$ 个交互步的历史为 $H_t=(O_1,A_1,O_2,A_2,\ldots,A_{t-1},O_t)$, $O_t$ 是当前观测, $A_s$ 是第 $s$ 步的动作. 策略按 $A_t\sim\pi(\cdot\mid x,H_t)$ 出动作, 环境按 $O_{t+1}\sim\mathcal{E}(\cdot\mid x,H_t,A_t)$ 返回下一个观测. 这里的一步是「一次动作加一次环境响应」, 一个动作本身可以包含很多 token. 策略和环境一起诱导出第 $t$ 步历史的占用分布 (occupancy), 它可以递归分解:

$$
d^{t+1}_{\pi,\mathcal{E}}(h_{t+1}\mid x)=d^{t}_{\pi,\mathcal{E}}(h_t\mid x)\,\pi(a_t\mid x,h_t)\,\mathcal{E}(o_{t+1}\mid x,h_t,a_t),
\tag{1}
$$

其中 $h_{t+1}=(h_t,a_t,o_{t+1})$. 当前学生 $\pi_{\theta_{\mathrm{old}}}$ 诱导的占用记为 $d^t_{\theta_{\mathrm{old}}}$, 教师 $\pi_T$ 诱导的记为 $d^t_T$. 式 (1) 说明一件事: 每一步的历史分布都由前面所有步的策略选择和环境响应连乘而来, 学生在第 2 步走偏, 第 3 步以后的历史分布就跟着变. 多轮 OPD 因此要同时决定两件事: 蒸馏哪个目标分布, 以及在哪些历史上向教师提问.

### 1.2. 在线多轮 OPD 贵在哪里

在线做多轮 OPD, 每次更新都要把当前学生放进环境重新 rollout, 再在访问到的每个历史上查询教师. 环境交互和教师推理的开销出现在每一个训练步. 论文 Table 1 给出了在线 OPD 需要常驻的资源: 数学环境里工具调用的并发是 32 个进程, 用来并行执行 Python; 搜索环境里检索器要占 80GB 显存, 用来部署 embedding 模型和存储 Wikipedia 向量. 每条样本最多 16 次工具调用 (数学) 或 4 次 (搜索). Figure 6 把这两类资源画在一起; 环境越多, 这部分开销越大.

一个学生要同时学多个异构环境时, 问题更突出. 在线 OPD 要求所有环境在训练期间同时在线 (Figure 3 左); prefix replay 只要求每个环境在采教师轨迹时在线, 各环境的轨迹分别采集, 合并成一个离线池, 学生在合并后的池上训练 (Figure 3 右). 轨迹本身通常也不需要额外成本: 教师如果是用 on-policy RL (例如 GRPO) 训出来的, 它在训练中的 rollout 就是带完整观测的多轮轨迹, 留下来就能当前缀池. 论文据此把问题改写为: 环境换成回放的教师前缀以后, 多轮 OPD 该怎么做.

## 2. 前缀陷阱与双侧分布偏移

### 2.1. 理想目标与加权目标

记 $q^\star_t(\cdot\mid x,h_t)$ 为第 $t$ 步, 历史 $h_t$ 上的理想改进目标. 理想目标在当前学生实际会遇到的历史上评估更新后的学生 $\pi_\theta$:

$$
\mathcal{R}^\star(\theta;\theta_{\mathrm{old}})=\mathbb{E}_{x\sim\mathcal{D}}\Bigl[\sum_{t=1}^{T}\alpha_t\,\mathbb{E}_{H_t\sim d^t_{\theta_{\mathrm{old}}}}\bigl[\ell\bigl(\pi_\theta(\cdot\mid x,H_t),\,q^\star_t(\cdot\mid x,H_t)\bigr)\bigr]\Bigr].
\tag{2}
$$

$\ell$ 是两个分布之间的损失, $\alpha_t\ge0$ 是各步的重要性, 论文取 $\alpha_t\equiv1$, 所有步数相关的调节都放进后面的权重 $w_t$. $q^\star_t$ 拿不到, OPD 用教师分布 $\pi_T(\cdot\mid x,h_t)$ 代替. 离线回放时, 历史来自教师池, 收集分布 $\mathcal{P}_t\approx d^t_T$, 学生占用 $d^t_{\theta_{\mathrm{old}}}$ 根本采不到, 采到它正是在线交互花钱买的东西. 一般的加权 OPD 目标写成

$$
\mathcal{L}_{\mathcal{P},w}=\mathbb{E}_{x}\Bigl[\sum_{t=1}^{T}\alpha_t\,\mathbb{E}_{H_t\sim\mathcal{P}_t}\bigl[w_t(x,H_t)\,\ell\bigl(\pi_\theta(\cdot\mid x,H_t),\,\pi_T(\cdot\mid x,H_t)\bigr)\bigr]\Bigr],
\tag{3}
$$

权重在每个 $(x,t)$ 上归一化, $\mathbb{E}_{\mathcal{P}_t}[w_t]=1$. 于是 $w_t$ 把收集分布改造成一个有效历史分布 $\rho_t=w_t\,\mathcal{P}_t$, 式 (3) 等价于在 $\rho_t$ 下求未加权损失的期望, 论文记作 $\mathcal{L}_\rho$. 论文强调真正的设计对象是 $\rho_t$, 权重只是实现 $\rho_t$ 的手段.

式 (2) 和式 (3) 有两处差别. 第一, 历史分布从 $d^t_{\theta_{\mathrm{old}}}$ 换成了 $\rho_t$. 第二, 目标从 $q^\star_t$ 换成了 $\pi_T$. 第二处差别在历史离教师自己的支撑域很远时最大: 教师没在这类历史上待过, 它给出的动作分布不一定是好的改进信号. 论文定义逐步的教师可靠性误差 $\epsilon^\theta_{T,t}(x,h_t)=\bigl|\ell(\pi_\theta,q^\star_t)-\ell(\pi_\theta,\pi_T)\bigr|$, 也就是在同一个历史上, 对理想目标的损失和对教师目标的损失差多少.

### 2.2. 两项分解

假设 1 要求对理想目标的损失一致有界: $|\ell(\pi_\theta,q^\star_t)|\le B$. 总变差距离天然满足 ($B=1$), JS 散度也满足 ($B=\log2$); 逐 token KL 在目标分布有下界 $q^\star_t(a)\ge p_{\min}>0$ 时满足, $B=\log(1/p_{\min})$, logits 有界的 softmax 就能保证这个下界. 在这个假设下, 命题 1 给出:

$$
\bigl|\mathcal{R}^\star-\mathcal{L}_\rho\bigr|\le\mathbb{E}_{x}\Bigl[\sum_{t=1}^{T}\alpha_t\Bigl\{\underbrace{2B\,\mathrm{TV}\bigl(d^t_{\theta_{\mathrm{old}}},\rho_t\bigr)}_{\text{学生占用偏移}}+\underbrace{\mathbb{E}_{H_t\sim\rho_t}\bigl[\epsilon^\theta_{T,t}(x,H_t)\bigr]}_{\text{教师可靠性偏移}}\Bigr\}\Bigr].
\tag{4}
$$

证明只有两步. 固定 $x,t$, 记 $f_t=\ell(\pi_\theta,q^\star_t)$, $g_t=\ell(\pi_\theta,\pi_T)$, 在 $\mathbb{E}_{d}[f_t]-\mathbb{E}_{\rho}[g_t]$ 中加减 $\mathbb{E}_\rho[f_t]$. 前一半 $\mathbb{E}_d[f_t]-\mathbb{E}_\rho[f_t]$ 的绝对值不超过 $\|f_t\|_\infty\sum_h|d(h)-\rho(h)|\le2B\,\mathrm{TV}$; 后一半 $\mathbb{E}_\rho[f_t-g_t]$ 由 Jensen 不等式不超过 $\mathbb{E}_\rho[\epsilon^\theta_{T,t}]$. 三角不等式合并, 乘 $\alpha_t$ 求和, 再对 $x$ 取期望, 得到式 (4).

式 (4) 的两项指向相反的方向. 完全学生 on-policy ($\rho_t=d^t_{\theta_{\mathrm{old}}}$) 让第一项归零, 第二项却可能变大: 学生的动作会把环境带进教师自己很少访问的历史, 后面的步尤其如此. 完全教师强制 ($\rho_t=d^t_T$) 正好相反, 教师在自己的占用附近可靠, 但学生推理阶段真正会走到的历史并不在这里. 论文把这个两难叫作前缀陷阱 (prefix trap), 并区分两层: 时间层是前缀里的错误跨步累积, 问题仍然是序列性的; 分布层是上面这对双侧偏移. **多轮 OPD 因此不等于「把蒸馏做成 on-policy」, 而是要为每一步选一个介于学生占用和教师占用之间的前缀分布.**

### 2.3. 几何桥与两种 regime

把两项偏移各换成一个可优化的代理, 每一步的有效分布取

$$
\rho^\star_t\in\arg\min_{\rho_t}\Bigl\{\lambda_{\mathrm{stu},t}\,D_{\mathrm{KL}}\bigl(\rho_t\,\Vert\,d^t_{\theta_{\mathrm{old}}}\bigr)+\lambda_{\mathrm{tea},t}\,D_{\mathrm{KL}}\bigl(\rho_t\,\Vert\,d^t_T\bigr)\Bigr\}.
\tag{5}
$$

第一项量化离学生占用多远. 教师可靠性误差本身观测不到, 第二项用离教师支撑多远做代理. 两个支撑重叠时, 式 (5) 的解是几何桥:

$$
\rho^\star_t(h_t\mid x)\propto\bigl[d^t_{\theta_{\mathrm{old}}}(h_t\mid x)\bigr]^{\gamma_t}\bigl[d^t_T(h_t\mid x)\bigr]^{1-\gamma_t},\qquad\gamma_t=\frac{\lambda_{\mathrm{stu},t}}{\lambda_{\mathrm{stu},t}+\lambda_{\mathrm{tea},t}}.
\tag{6}
$$

$\gamma_t=1$ 退回完全学生 on-policy, $\gamma_t=0$ 退回教师强制 roll-in, 中间值选的是在学生占用下概率不低, 离教师可靠区域也不太远的历史. 这一族分布把普通 OPD 和教师强制的 off-policy 蒸馏放在同一条参数轴的两端.

两项偏移哪一项占主导, 决定了合适的 $\gamma_t$. 论文的判断是这个平衡逐步变化: 越往后的步, roll-in 越容易漂到教师很少访问的历史, 教师可靠性项越大, 理想的 $\gamma_t$ 沿轨迹下降. 由此得到两种 regime. 教师在学生诱导的历史上仍然可靠时 (教师能力强且和学生接近, 视野短, 或处在早期步), 占用项主导, $\gamma_t\to1$ 最好, 普通 OPD 已经够强. 教师离开自己支撑域后信号退化时 (师生差距大, 视野长, 或处在后期步), 在这些步降低 $\gamma_t$ 能缩小差距, 即使得到的历史不那么 on-policy. 第 4 节的实验按这个预测解读: 数学环境属于后一种, 搜索环境属于前一种.

## 3. ReOPD 算法

### 3.1. 教师前缀, 学生动作, 教师监督

ReOPD 的输入是教师 $\pi_T$ 和一个教师轨迹池 $\mathcal{D}_T=\{(x,h)\}$, 每条 $h$ 记录完整的交互历史, 包括环境观测. 对被监督的第 $t$ 步, 前缀 $h_t=(O_1,A_1,\ldots,O_t)$ 原样取自教师轨迹, 之前的动作 $A_{<t}$ 和观测 $O_{\le t}$ 都是教师的. 学生只在第 $t$ 步行动, 自回归地生成自己的动作 $A_t=(a^1_t,\ldots,a^{n_t}_t)\sim\pi_{\theta_{\mathrm{old}}}(\cdot\mid x,h_t)$, 逐 token 地接受教师在这条动作上的条件分布 $\pi_T(\cdot\mid x,h_t,a^{<j}_t)$ 的监督. 学生的动作不提交给环境, 也不生成新的观测, 所以训练期不查询环境. roll-in 是教师占用, $\mathcal{P}_t\approx d^t_T$.

每一步的损失是沿学生动作累加的逐 token KL:

$$
\ell(\pi_\theta,\pi_T;x,H_t,A_t)=\sum_{j=1}^{n_t}D_{\mathrm{KL}}\Bigl(\pi_\theta(\cdot\mid x,H_t,a^{<j}_t)\,\Big\Vert\,\pi_T(\cdot\mid x,H_t,a^{<j}_t)\Bigr).
\tag{7}
$$

条件上下文 $a^{<j}_t$ 是学生自己采的, 所以被监督的这一步是真正 on-policy 的, 尽管前缀是教师强制的. 也就是说, ReOPD 的「on-policy」只覆盖一步: 学生不沿教师前缀走, 但在前缀末端由自己出动作. 更新完以后 $\theta_{\mathrm{old}}\leftarrow\theta$, 下一轮在同样的教师前缀上重新采学生动作, 监督跟着学生移动, 前缀始终锚在教师池上. 前缀越深, 回放的教师前缀作为「学生会走到的历史」的替身就越差, 这就是下一节要用权重修正的偏移.

### 3.2. 从几何桥到逐步衰减

把式 (6) 代入 $w_t\propto\rho^\star_t/\mathcal{P}_t$, 权重是学生与教师占用之比的 $\gamma_t$ 次方. 前缀是教师记录的, 学生和教师在同一前缀上比较, 环境转移概率在比值里消掉, 只剩模型部分:

$$
\widehat{r}_t(x,h_t)=\prod_{s<t}\frac{\pi_{\theta_{\mathrm{old}}}(a_s\mid x,h_s)}{\pi_T(a_s\mid x,h_s)},\qquad w_t=\frac{\widehat{r}_t^{\,\gamma_t}}{\mathbb{E}_{\mathcal{P}_t}\bigl[\widehat{r}_t^{\,\gamma_t}\bigr]}.
\tag{8}
$$

式 (8) 是几何桥的精确实现, 能从学生和教师在记录前缀上的对数概率算出来, 代价是逐条历史的密度比方差很大. 每个因子比较的是学生和教师对教师自己选出的动作 $a_s$ 的概率, 教师选了它, 这个比值通常小于 1, 所以前缀越长, 乘积越小. 论文 Figure 4 直接在教师前缀上测了 $\widehat{r}_t$, 它随步数 $t$ 单调衰减, 而且同一步内的离散不大, 步数解释了大部分变化.

由此可以用步数代替逐条密度比. 记前缀上每步的平均师生差距 $\bar c(x)=\mathbb{E}_{a_s\sim\pi_T}\bigl[\log\bigl(\pi_T(a_s)/\pi_{\theta_{\mathrm{old}}}(a_s)\bigr)\bigr]\ge0$, 这是一个平均的逐步 $D_{\mathrm{KL}}(\pi_T\Vert\pi_{\theta_{\mathrm{old}}})$. 于是 $\log\widehat{r}_t\approx-(t-1)\bar c$, 精确权重的深度剖面是几何的:

$$
\widehat{r}_t^{\,\gamma_t}\approx\kappa^{t}\ (\text{差一个常数}),\qquad\kappa=\exp(-\gamma_t\,\bar c)\in(0,1].
\tag{9}
$$

$\kappa$ 由两个量决定: $\gamma_t$ 表示 $\rho_t$ 被推向学生占用多远, $\bar c$ 表示教师池随深度偏离学生多快; 任一个变大, $\kappa$ 变小, 衰减变陡. 把剖面压成一个底数 $\kappa$, 相当于假设每步的差距在各位置近似不变; 差距随深度增长时, $\kappa^t$ 是对真实累积比的一阶 (几何平均) 近似. ReOPD 默认用 $\omega(t;\kappa)=\kappa^t$, 实验里固定 $\kappa=0.6$.

手算一组数 (式 (9) 的算术, 论文没有给). 取 $\gamma_t=1$, $\kappa=0.6$ 对应 $\bar c=-\ln0.6\approx0.51$ nat, 即教师记录的动作在学生下的对数概率平均每步比在教师下低 0.51. 一条 5 步的轨迹, 权重 $0.6,\,0.36,\,0.216,\,0.130,\,0.078$, 和为 $1.383$, 归一化后各步被抽中的概率约 $0.434,\,0.260,\,0.156,\,0.094,\,0.056$; 前两步占 $69\%$, 第 1 步是第 5 步的 $0.6^{-4}\approx7.7$ 倍. $\kappa=1$ 时五步各 $0.2$, 就是普通的均匀加权. 数学环境每条样本最多 16 次工具调用, 若轨迹真的走满 16 步, 第 16 步的权重 $0.6^{16}\approx2.8\times10^{-4}$, 归一化后被抽中的概率约 $0.02\%$, 实际上不再训练.

### 3.3. 采样还是加权

步数衰减权重只依赖位置, 同一步内对所有历史是常数. 它因此在整个视野上按 $\kappa^t$ 归一化, 不能在每个 $(x,t)$ 上归一化, 否则常数权重会变成 $w_t\equiv1$, 衰减消失. 这也是精确权重 (8) 和步数代理的区别: 前者在同一步内重塑历史分布, 后者跨步重新分配监督质量, 把它挪向早期的低偏移位置. 两者方向一致, 因为 $\widehat{r}_t$ 本来就随深度衰减.

把目标落到实现上有两种无偏估计. 第一种是采样: 从池里按 $p_t\propto w_t\,\mathcal{P}_t=\rho^\star_t$ 抽位置, 对抽到的位置算不加权的损失; 衰减只体现在哪些位置被训练, 每步只碰一部分位置, 和离线池流式读取的方式一致. 第二种是加权: 保留池里的全部样本, 损失乘 $w_t$, 由重要性恒等式 $\mathbb{E}_{\mathcal{P}_t}[w_t\ell]=\mathbb{E}_{\rho^\star_t}[\ell]$ 得到同一个期望, 计算量和枚举全部位置成正比. 两者是同一个式 (3) 的两种无偏估计, 采样并非加权的近似. 论文所有实验用采样.

算法 1 的循环如下: 从池里的轨迹组装候选位置 $(x,h_t)$, 前缀由教师动作 $A_{<t}$ 和教师观测 $O_{\le t}$ 组成; 按 $p_t\propto\kappa^t$ 抽位置; 对每个抽到的位置让学生生成动作 $A_t$, 不调用环境; 沿 $A_t$ 累加式 (7) 的逐 token KL; 用累加的损失更新 $\theta$, 再令 $\theta_{\mathrm{old}}\leftarrow\theta$. 论文特别说明 ReOPD 不是 off-policy RL 或奖励加权 RL: 不估计回报或优势, 不对价值函数做重要性采样修正, 也不优化标量奖励; 目标是固定的教师分布, $w_t$ 编码的是回放前缀的可靠性和学生相关性, 不是策略梯度里的比率.

## 4. 实验

### 4.1. 设定

模型全部来自 Qwen3. 为了改变师生差距, 教师取 Qwen3-4B-Instruct-2507, Qwen3-8B, Qwen3-30B-A3B-Instruct-2507 三种规模, 学生是 Qwen3-4B-Instruct-2507; 另外在 30B-A3B 教师下加一个 Qwen3-8B 学生. 所有模型先做 cold start: 在更强模型采的 2K 条轨迹上 SFT, 学会使用工具和输出格式; 论文观察到不做这一步时, 模型在数学任务上经常不调用 Python. 之后教师用 GRPO 训练 200 步, 学生从 cold start 版本出发做蒸馏. 默认的教师前缀池就是教师 GRPO 训练期间产生的轨迹.

两个环境. 数学 (Python 工具) 按 ReTool 的做法, cold start 轨迹取自 ReTool, GRPO 和蒸馏共用 DAPO 训练集里的 6.4K 个 prompt, 评测用 AIME24, AIME25, AMC23, Minerva, OlympiadBench, MATH500 六个基准, 报宏平均. 搜索 (检索) 按 Search-R1 的做法, prompt 来自 NQ 和 HotpotQA 训练集的合并, 2K 个用来让 Qwen3-30B-A3B-Instruct-2507 生成 cold start 轨迹, 另 6.5K 个用于教师 GRPO 和学生蒸馏; 知识源是 2018 年 Wikipedia dump, 检索器 E5, 取 top-3 段落; 评测 NQ, TriviaQA, PopQA, HotpotQA, 2Wiki, MuSiQue, Bamboogle 七个基准, 其中 NQ 和 HotpotQA 是域内, 报微平均. OPD 和 ReOPD 的超参完全相同: batch $256\times1$, 学习率 $10^{-6}$ 常数, 200 步, 温度 1.0, 数学最长生成 8192 token; 唯一差别是前缀分布. 评测中数学最长 16384 token, AIME24/25 和 AMC23 报 avg@8, 其余报 avg@4. 实验在 $8\times$H100 上用 slime 框架跑, ReOPD 训练 3 小时内完成.

### 4.2. 数学与搜索的主结果

Table 4 的数学平均分 (教师一行是教师自己的 GRPO 成绩, 作参考):

| 教师 | 学生 | 教师 GRPO | SFT | OPD | ReOPD |
|---|---|---:|---:|---:|---:|
| Qwen3-4B-Instruct-2507 | Qwen3-4B-Instruct-2507 | 55.5 | 46.1 | 55.1 | 57.2 |
| Qwen3-8B | Qwen3-4B-Instruct-2507 | 49.9 | 45.0 | 51.0 | 53.7 |
| Qwen3-30B-A3B-Instruct-2507 | Qwen3-4B-Instruct-2507 | 62.7 | - | 51.1 | 52.5 |
| Qwen3-30B-A3B-Instruct-2507 | Qwen3-8B | 62.7 | - | 56.5 | 56.8 |

ReOPD 在四组配对里的平均分都高于 OPD, 提升分别是 2.1, 2.7, 1.4, 0.3 分. 单项上差距最大的是 Qwen3-8B 教师下的 AIME24, 从 28.3 到 36.7. SFT 就是在同一批教师轨迹上做 off-policy 蒸馏, 4B 教师一组只比 cold start 的 45.0 高 1.1, 比 ReOPD 低 11.1. 有两处值得对照着看: 前两组的 ReOPD 学生都超过了教师自己的 GRPO 成绩 (57.2 对 55.5, 53.7 对 49.9); 30B-A3B 教师一组, 两种蒸馏都离教师的 62.7 差得远. 论文把数学上的增益归因于师生差距大时教师可靠性项主导; 按平均分看, 增益大小并不随教师规模单调增加, 30B-A3B 那组的提升小于 8B 那组.

搜索上 ReOPD 与 OPD 基本持平. Qwen3-4B 教师下, OPD 平均 40.6, ReOPD 40.5; Qwen3-8B 教师下 39.1 对 39.0. 单项里差距最大的是 Bamboogle, 4B 教师下 OPD 44.0, ReOPD 37.6; Bamboogle 只有 125 题, 6.4 分相当于 8 道题. 论文的解释是这里教师和学生同属 Qwen3-4B 一族, 教师在学生诱导的历史上仍然可靠, 两种占用几乎重合, 学生占用项主导, 回放教师前缀的收益就小. 这与 2.3 节的两种 regime 对得上.

### 4.3. 多环境与效率

Table 6 让一个 Qwen3-4B 学生同时学数学和搜索两个环境, 两个环境的训练数据拼接打乱, SFT 和蒸馏都联合进行. 教师不共享, 每个环境用自己 RL 训练的 Qwen3-4B 教师, 论文把这种设定也叫多教师 OPD (MOPD, 见 [09-MOPD](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md)). 结果: 数学平均 OPD 55.4, ReOPD 55.3; 搜索平均两者都是 41.0; cold start 分别是 47.0 和 32.7. 单项上 ReOPD 在 AIME24 高 2.1 (36.3 对 34.2), 在 AMC23 低 4.2 (75.5 对 79.7), Bamboogle 又是 37.6 对 44.0. 联合学生在两个域都和单环境学生的水平相当.

多环境设定的价值主要在运维上. 在线 OPD 训练期间两个环境都要在线, Python 执行进程和检索器显存同时占着; ReOPD 只要求每个环境在教师采轨迹时在线, 学生训练时一个环境都不需要. 效率上, ReOPD 学生训练期的工具调用次数是 0, 每次 rollout 至少比 OPD 快 4 倍 (Figure 1, 学生 Qwen3-4B-Instruct-2507, 教师 Qwen3-8B). 环境越多, 在线 OPD 需要的资源越多, ReOPD 不受影响.

拿不到教师 RL 轨迹时 (例如教师是现成的开源强模型, 没资源再对它做 RL), 可以让教师对所有 prompt 一次性采一遍轨迹当前缀池. Table 7 说明这种平稳池和 RL 池效果相近 (见 4.4 节). 论文 Figure 8 把教师重采样的时间也算进去, ReOPD 仍比 OPD 快 2 倍以上, 而且环境只在教师采样时在线.

### 4.4. 消融: 衰减, 前缀来源, 池的平稳性

Figure 5 检验步数衰减本身是否有用, 两个面板都用采样实现. 5(a) 按块抽位置: 从早期块抽得越多, 学生越好, 把质量推向后期块会变差. 5(b) 用 $\kappa^t$ 作采样概率: 适度的衰减好于均匀采样 ($\kappa=1$), 趋势与 5(a) 一致. 两种调法结论相同, 论文据此认为增益来自偏向早期低偏移步的前缀选择, 与数据量无关. 论文正文没有列出这两张图的具体数值.

Figure 7 固定蒸馏目标为 Qwen3-8B 教师, 只换前缀的生成者, 学生是 Qwen3-4B-Instruct-2507. 直觉上更大更强的模型犯错更少, 前缀应该更好; 实测相反, 前缀来自教师自己时学生最好, 换成更大或更强的生成者, 学生变差. 这是对教师可靠性偏移的直接检验: 教师记录的条件分布只在它自己可能访问的历史上是可靠信号, 别的模型生成的前缀落在这个支撑之外. 选前缀该看相对教师的可靠性, 生成者自身的能力反而次要.

Table 7 回答 RL 池不平稳的问题. RL 池混合了早期较弱的检查点和最终教师, 不等于从收敛教师里采的池. 固定目标为最终教师, 只换前缀池: 最终教师采的平稳池平均 53.4, RL 训练期的混合池 53.7, 六个基准互有高低 (AIME24 37.9 对 36.7, AMC23 72.2 对 74.4). 论文的结论是 RL 过程中检查点之间的漂移仍在教师的可靠支撑内, 白得的 RL 副产品够用, 不需要专门采集.

## 5. 与相邻方法的关系和局限

### 5.1. 与 OPD, SFT, RL, DAgger 的关系

几种方法放到同一组维度上比较:

| 方法 | 前缀从哪来 | 监督信号 | 学生训练期要环境吗 |
|---|---|---|---|
| 序列级蒸馏 / SFT | 教师轨迹, 整段模仿 | 教师 token | 不要 |
| 在线多轮 OPD | 学生在环境里重新 rollout | 教师逐 token 分布 | 要 |
| ReOPD | 教师轨迹回放, 学生只出当前步 | 教师逐 token 分布, 按 $\kappa^t$ 采样 | 不要 |
| GRPO 等 RL | 学生在环境里 rollout | 标量奖励 | 要 |

和 SFT 比, 两者用的是同一批教师轨迹, 差别在被监督的那一步: SFT 让学生拟合教师的动作 token, ReOPD 让学生自己生成动作, 再在学生的 token 上下文里对齐教师分布, 4.2 节 4B 教师一组两者差 11.1 分. 和在线 OPD 比, ReOPD 用回放换掉了环境交互和多轮学生 rollout, 在式 (6) 的参数轴上, 在线 OPD 是 $\gamma_t=1$, 教师强制蒸馏是 $\gamma_t=0$, ReOPD 用步数衰减在两者之间取值. 和 RL 比, ReOPD 与优化器无关, 它保留蒸馏的稠密目标, 不用奖励; 它还复用 GRPO 训练教师时的 rollout 当前缀池, 所以和 RL 是前后衔接的关系.

论文把前缀陷阱放在序列学习的老问题里看. 行为克隆在专家状态上训练, 学习者一偏离就遇到协变量偏移, DAgger 改为在学习者诱导的状态分布上训练; scheduled sampling 和 Professor Forcing 处理的是自回归生成里教师强制和自由生成的错配. 在线 OPD 相当于 DAgger 那一端. Wang 等 2026 在推理蒸馏里提出的双重 exposure bias 与这里的双侧偏移最接近: 教师强制的轨迹与学生推理不匹配, 完全学生生成的上下文又会让教师介入变得不可靠. ReOPD 的贡献是把这对偏移写成式 (4) 的两项上界, 并给出一个可调的折中. 单轮 OPD 的失败模式见 [07-OPD 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md), 其中学生前缀漂移后教师信号失真的一类, 可以看作式 (4) 第二项在单轮场景里的对应.

### 5.2. 局限

论文自己列了三条. 第一, 方法假设有一个带完整观测的教师轨迹池; 实验里它来自教师的 RL rollout, 不花额外成本, 但池的覆盖和质量限定了学生能学到什么. 第二, 可靠性代理在一阶近似下退化成步数衰减, 它衡量的是前缀有多深, 不直接衡量某条前缀离「学生相关历史与教师可靠支撑的重叠区」有多远; 学出来的或依赖数据的可靠性估计可能更好. 第三, 式 (4) 的教师可靠性项是用教师支撑当代理的, 更紧, 能直接估计的可靠性度量和随之在线调整的权重留给后续工作.

从实验设定还能读出几条边界. 按式 (9), 师生差距越大 $\kappa$ 应当越小, 但实验在所有任务和配对上固定 $\kappa=0.6$, 没有按差距调; 论文把随差距自适应的调度列为扩展方向. 搜索环境的教师和学生同属 Qwen3-4B 一族, 没有测大差距的搜索配对, 「搜索上持平」和「搜索属于可靠教师 regime」是同一组数据给出的, 没有独立验证. ReOPD 在个别基准上明显低于 OPD (Bamboogle 低 6.4, 多环境下 AMC23 低 4.2), 这两个基准题量小 (125 题和 40 题), 论文没有讨论. 最后, 学生只在被监督的一步 on-policy, 推理阶段学生自己走完整条轨迹, 后期步的历史分布和训练时的教师前缀之间的差距, 正是步数衰减选择少训练的部分.

## 参考文献

1. Liao, B., Dong, H., Monz, C., Xu, X., Dong, L., & Wei, F. (2026). [Multi-Turn On-Policy Distillation with Prefix Replay](https://arxiv.org/abs/2607.04763). arXiv:2607.04763. [arXiv HTML](https://arxiv.org/html/2607.04763). 代码: [BaohaoLiao/ReOPD](https://github.com/BaohaoLiao/ReOPD).
2. Agarwal, R., Vieillard, N., Zhou, Y., Stanczyk, P., Ramos, S., Geist, M., & Bachem, O. (2024). [On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes](https://arxiv.org/abs/2306.13649). *ICLR*.
3. Gu, Y., Dong, L., Wei, F., & Huang, M. (2024). [MiniLLM: Knowledge Distillation of Large Language Models](https://arxiv.org/abs/2306.08543). *ICLR*.
4. Thinking Machines Lab. (2025). [On-Policy Distillation](https://thinkingmachines.ai/blog/on-policy-distillation/).
5. Ross, S., Gordon, G. J., & Bagnell, J. A. (2011). A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning. *AISTATS*.
6. Ranzato, M., Chopra, S., Auli, M., & Zaremba, W. (2016). [Sequence Level Training with Recurrent Neural Networks](https://arxiv.org/abs/1511.06732). *ICLR*.
7. Feng, J., et al. (2025). [ReTool: Reinforcement Learning for Strategic Tool Use in LLMs](https://arxiv.org/abs/2504.11536).
8. Jin, B., et al. (2025). [Search-R1: Training LLMs to Reason and Leverage Search Engines with Reinforcement Learning](https://arxiv.org/abs/2503.09516).
9. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).
10. Wang, B., et al. (2026). [Backtracking When It Strays: Mitigating Dual Exposure Biases in LLM Reasoning Distillation](https://arxiv.org/abs/2605.19433).
11. Yang, A., et al. (2025). [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388).
