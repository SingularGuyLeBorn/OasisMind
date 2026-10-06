---
title: "01 · Song & Zheng 的 OPD 综述"
category: "后训练"
published: true
tags: ["OPD", "On-Policy Distillation", "f-散度", "GKD", "MiniLLM", "DistiLLM", "综述"]
excerpt: "Song 与 Zheng (腾讯) 的 OPD 综述把在线策略蒸馏写成学生轨迹上的 f-散度最小化, 再按优化目标, 信号来源, 训练稳定三条轴给一百多篇论文归类, 并整理了成功条件, 失败模式和与 off-policy 的取舍规则."
---
# Song & Zheng 的 OPD 综述

> 相关阅读: [01 OPD 基础原理](../../4.9.1-OPD方法与落地/01-OPD基础原理/01-OPD基础原理.md) · [07 OPD 失败模式](../../4.9.1-OPD方法与落地/07-OPD-失败模式/07-OPD-失败模式.md) · [10 OPD 在各家技术报告里的落地](../../4.9.1-OPD方法与落地/10-OPD-报告落地对照/10-OPD-报告落地对照.md)

本文读 Song 与 Zheng (腾讯大模型部) 的 *A Survey of On-Policy Distillation for Large Language Models* (arXiv:2604.00626, v3, 覆盖到 2026 年 5 月), 问题是: 这篇综述用什么统一式把 GKD, MiniLLM 以及后来上百篇方法放在一起, 三条分类轴各自收了什么, 它给出的成功条件, 失败模式和取舍规则有哪些可以直接用.

记号沿用综述: 小写 $p_T(\cdot\mid x,y_{<t})$, $p_\theta(\cdot\mid x,y_{<t})$ 是教师与学生的 token 级条件分布, 大写 $P_T(y\mid x)$, $P_\theta(y\mid x)$ 是序列级分布, $|V|$ 是词表大小. 与 [01](../../4.9.1-OPD方法与落地/01-OPD基础原理/01-OPD基础原理.md) 的 $\pi_T,\pi_\theta$ 是同一对象.

## 1. 出发点与统一式

### 1.1. off-policy 蒸馏的暴露偏差

工业流水线里的蒸馏大多是 off-policy 的: 学生在固定语料 (预训练数据或教师事先生成的轨迹) 上匹配教师的下一个 token 分布, 每一步梯度都以无误的教师前缀为条件. 推理时学生从自己的输出续写, 训练时见过的状态和部署时走到的状态不一致. 综述引用交互式模仿学习的 DAgger 定理 (Ross 等, 2011): 若学习者在训练分布上每步误差为 $\epsilon$, 在自己访问的状态分布下, 长度 $T$ 的轨迹总偏差按 $O(\epsilon T^2)$ 增长; 在学习者自己访问的状态上查询专家, 可降到 $O(\epsilon T)$.

综述给了一个数值例子. 一个 10 步的证明, 每步正确率 95%, 即使各步错误独立, 整条正确的概率也只有 $0.95^{10}\approx 60\%$. DAgger 的界比这更差, 因为 off-policy 训练很少让学生见到自己的错误状态, 一步出错后下一步的正确率也会下降.

综述同时写了一个限定条件. DAgger 假定专家在任何状态下都给出最优动作; 白盒 OPD 里, 「专家」给的是以学生前缀为条件的分布 $p_T(y_t\mid\hat y_{<t})$. 学生生成了严重偏离分布的前缀时, 教师很少在这类输入上训练过, 条件分布本身可能校准很差, 让学生去匹配它, $O(\epsilon T)$ 的结论并不成立. 综述引用的直接证据来自 Jeong (2026) 的 TT-OPD: 周期性硬拷贝重置教师时, 在一次重置事件上 KL 从 2.637 骤降到 0.343, 输出随之坍缩.

### 1.2. 什么叫 on-policy

综述用训练数据的来源定义 on-policy: 学生的训练数据在训练时从学生当前策略 $p_\theta$ 采样, 而不是来自固定语料 $\mathcal D$ 或教师的生成分布 $p_T$:

$$
\min_\theta\ \mathbb E_{x\sim\mathcal D}\,\mathbb E_{y\sim p_\theta(\cdot\mid x)}\bigl[\mathcal L(y,x;\theta,T)\bigr] \tag{1}
$$

$\mathcal L$ 可以是散度, 奖励或两者混合. 外层期望在学生自己的生成上, 所以 $\theta$ 一更新数据分布就变, 每步都要重新 rollout. 按这个定义, 用哪种 KL 与是否 on-policy 无关.

综述的第 2.1 节先回顾了经典蒸馏. Hinton 等用温度 $\tau$ 软化教师分布 $p_T^{(\tau)}(y)=\exp(z_y/\tau)/\sum_j\exp(z_j/\tau)$, 蒸馏损失对学生 logit 的梯度是 $\frac1\tau(p_i^{S}-p_i^{T})$. 高温极限下用 $\exp(z_i/\tau)\approx1+z_i/\tau$ 展开, 并假设两边 logit 均值为 0, 梯度化为 $\frac{1}{|V|\tau^2}(z_i^{S}-z_i^{T})$, 即经典蒸馏在这个区间等价于对原始 logit 做均方误差. $1/\tau^2$ 这个因子也解释了为什么组合损失里软目标项通常乘以 $\tau^2$. 综述指出 LLM 蒸馏一般用 $\tau=1$ 或较低温度: 词表超过三万, 非峰值概率本身已有丰富结构, 升温反而会放大教师校准差的尾部噪声.

作为对照, off-policy 的 token 级蒸馏是

$$
\mathcal L_{\text{Token-KD}}=\mathbb E_{x,y\sim\mathcal D}\Bigl[\sum_{t=1}^{|y|}D_{\mathrm{KL}}\bigl(p_T(\cdot\mid x,y_{<t})\,\Vert\,p_\theta(\cdot\mid x,y_{<t})\bigr)\Bigr] \tag{2}
$$

Kim 与 Rush 的序列级蒸馏 (Seq-KD) 本应最小化 $D_{\mathrm{KL}}(P_T\Vert P_\theta)$, 但序列空间大小是 $|V|^T$, 实际用教师 beam search 的输出 $\hat y$ 当作点估计, 退化成 $-\log P_\theta(\hat y\mid x)$, 即在教师生成序列上做 SFT. 这样既丢了教师分布的不确定性信息, 数据也仍是静态的.

### 1.3. f-散度框架

综述的统一目标把采样轨迹和局部度量拆开 (综述式 (8)):

$$
\mathcal L_{\mathrm{OPD}}(\theta)=\mathbb E_{y\sim\pi_{\mathrm{mix}}}\Bigl[\sum_{t=1}^{|y|}\mathcal D_f\bigl(p_T(\cdot\mid x,y_{<t}),\,p_\theta(\cdot\mid x,y_{<t})\bigr)\Bigr] \tag{3}
$$

$\pi_{\mathrm{mix}}$ 决定有多 on-policy, $\mathcal D_f$ 是 f-散度族里的某一个:

$$
D_f(P\,\Vert\,Q)=\mathbb E_{y\sim Q}\Bigl[f\Bigl(\frac{P(y)}{Q(y)}\Bigr)\Bigr] \tag{4}
$$

其中 $f$ 凸且 $f(1)=0$. 生成元 $f$ 决定对似然比 $p_T/p_\theta$ 的加权方式.

| $f(u)$ | 名称 | 行为 | 综述给的适用任务 |
|-------|-----|-----|---------------|
| $u\log u$ | Forward KL | mode-covering: 学生在教师有质量的地方都放质量, 可能落到两个模态之间 | 答案多样的任务, 如创意写作, 开放问答 |
| $-\log u$ | Reverse KL | mode-seeking: 学生集中到教师的一个峰 | 唯一正确答案的任务, 如数学证明, 代码 |
| $u\log u-(u+1)\log\frac{u+1}{2}$ | JSD | 对称, 有界, 介于两者之间 | 输出多样性居中的任务, 如翻译 |
| $\alpha$-散度 | 参数族 | $\alpha\to1$ 趋于 Forward KL, $\alpha\to0$ 趋于 Reverse KL | 连续调节两种行为 |

综述还提到 Wu 等 (AKL) 对离散分布的细化: 在实际的训练轮数内, Forward KL 主要学教师分布的头部, Reverse KL 更看重尾部, 用「头尾」描述比「覆盖与寻峰」更贴切.

### 1.4. 三个基础方法的坐标

**GKD** (Agarwal 等): $\pi_{\mathrm{mix}}=\lambda p_\theta+(1-\lambda)p_{\mathrm{data}}$, $\lambda=0$ 退回 off-policy 蒸馏, $\lambda=1$ 完全 on-policy; 散度可选 Forward KL, Reverse KL 或 JSD. 实验里 $\lambda=1$ 在所试的散度上都优于 off-policy; JSD 在 WMT 翻译上最好; 摘要和指令跟随上三种散度结果相近. 综述据此认为, 任务几何不明显偏向一端时, 采样方式比散度选择更重要.

**MiniLLM** (Gu 等): 选 Reverse KL $D_{\mathrm{KL}}(p_\theta\Vert p_T)$, 用 $\pi_{\mathrm{mix}}=(1-\alpha)p_\theta+\alpha p_T$, $\alpha=0.2$ 稳定采样. 学生既在期望里又在对数比里, 用策略梯度定理得到

$$
\nabla_\theta\mathcal L_{\text{MiniLLM}}=-\mathbb E_{y\sim p_\theta}\Bigl[\sum_{t=1}^{|y|}(R_t-1)\,\nabla_\theta\log p_\theta(y_t\mid y_{<t})\Bigr],\qquad R_t=\sum_{t'=t}^{|y|}\log\frac{p_T(y_{t'}\mid y_{<t'})}{p_\theta(y_{t'}\mid y_{<t'})} \tag{5}
$$

$-1$ 来自 Reverse KL 中 $-\log p_\theta$ 的熵项. 这等价于以 $r_t=\log(p_T/p_\theta)$ 为逐步奖励的策略梯度. MiniLLM 再把 $R_t$ 拆成单步项和未来回报, 单步项在词表上闭式求期望, 降低方差.

**DistiLLM** (Ko 等): 在学生生成的前缀上算 token 级损失, 但用验证损失调度学生数据的使用比例, 并维护 replay buffer. 核心是 skew KL, 把目标换成混合分布:

$$
\mathcal L_{\text{SKL}}=\mathbb E_{(x,y)\sim\mathcal D_{\text{mix}}}\Bigl[\sum_{t}D_{\mathrm{KL}}\bigl(p_T\,\Vert\,\alpha p_T+(1-\alpha)p_\theta\bigr)\Bigr] \tag{6}
$$

混合后的目标密度有下界 $(1-\alpha)p_\theta$, 在 $p_\theta\approx0$ 或 $p_T\approx0$ 时不会除零, 也不需要策略梯度. 后续 DistiLLM-2 对教师生成数据用 Forward SKL, 对学生生成数据用 Reverse SRKL.

综述把三者的取舍概括为: GKD 通用简单, 但对散度选择给不出理论指导; MiniLLM 换来 mode-seeking 的精度, 代价是 REINFORCE 的高方差, 需要基线, 长度惩罚和调 $\alpha$; DistiLLM 用构造出的混合目标同时绕开两个问题, 代价是 replay buffer 和调度器带来的超参. 设计空间由三项选择决定: 轨迹采样 $\pi_{\mathrm{mix}}$, 生成元 $f$, 散度里两个参数的先后顺序.

综述还把从 Hinton 蒸馏到 OPD 的演变写成对四个经典假设的逐步放松: 共享词表, 独立同分布数据, 静态教师, off-policy 数据. GKD 放松第 4 条, DSKD 放松第 1 条. 同家族蒸馏一般不需要处理词表问题, 短序列上暴露偏差也不明显, 不需要的放松只会增加复杂度.

## 2. 三条分类轴

![左: off-policy 蒸馏, 学生在教师或数据集前缀上训练; 右: OPD, 学生自己生成前缀, 教师在这些前缀上给出逐 token 的分布监督](./images/fig-opd-survey-off-vs-on.png)

> 图 1: off-policy 蒸馏与 OPD 的采样来源. 左侧前缀来自教师或数据集, 右侧前缀由学生生成, 教师在学生实际访问的状态上给出 logits 或 KL. 底栏是 DAgger 的两个误差量级.

综述把方法按流水线里三个先后的决策归类, 每篇论文只归入其核心贡献所在的一类: 优化什么 (2.1 节), 信号从哪来 (2.2 节), 训练怎么稳定和省算力 (2.3 节). 三条轴相互约束: 精确的 token 级 Forward KL 需要教师的完整输出分布, 只能拿到 API 文本时不可行; RL 增强的目标天然要配验证器或奖励模型. 按时间看, 2023-2024 年的工作集中在目标轴, 争论散度方向; 2025 年中转向信号轴, 尤其是去掉外部教师的自蒸馏; 2025 年末到 2026 年转向训练动态, 处理 on-policy 采样带来的不稳定.

### 2.1. 目标轴

**固定散度**: GKD, MiniLLM, DistiLLM 及其后继. 综述指出固定散度对整条序列用同一个度量, 而同一序列内教师分布差异很大: 在数学运算符位置教师集中在一两个符号上, 适合 mode-seeking; 在连词或填充词位置几十个 token 概率相近, 适合 mode-covering.

**逐 token 自适应**: ToDi 对每个位置的每个词表项用 $\omega_{t,i}=\sigma(\mathrm{sg}[\log(p_T(v_i)/p_\theta(v_i))])$ 混合 Forward KL 与 Reverse KL, 教师概率高于学生时偏向 Forward KL 去抬高被低估的 token, 反之偏向 Reverse KL 去压低被高估的 token. EOPD 以 Reverse KL 为底, 在教师熵超过阈值 $\tau_H$ 的位置再加一项 Forward KL:

$$
\mathcal L_{\text{EA}}=\mathbb E_{y\sim p_\theta}\Bigl[\sum_{t}D_{\mathrm{KL}}(p_\theta\Vert p_T)+\mathbb I[H_t>\tau_H]\,D_{\mathrm{KL}}(p_T\Vert p_\theta)\Bigr] \tag{7}
$$

AKL 按头部与尾部的累计概率差给两种 KL 加权. AOPD 在优势非正的 token 上把策略梯度换成教师 top-$K$ 支撑上的局部 Forward KL, 报告在 AIME 2024/2025 与 HMMT 上相对标准 on-policy 基线平均提高 4.09 (强初始化) 和 8.34 (弱初始化).

**RL 增强**: 前两类都在优化到教师的距离, 完美优化的结果是追平教师. G-OPD 把 OPD 写成稠密的 KL 约束 RL:

$$
\max_\theta\ \mathbb E_{y\sim p_\theta}\Bigl[\sum_{t}\alpha\log\frac{p_T(y_t\mid y_{<t})}{p_{\mathrm{ref}}(y_t\mid y_{<t})}-D_{\mathrm{KL}}\bigl(p_\theta(\cdot\mid y_{<t})\,\Vert\,p_{\mathrm{ref}}(\cdot\mid y_{<t})\bigr)\Bigr] \tag{8}
$$

$\alpha=1$ 退回标准的 Reverse KL 蒸馏, $\alpha>1$ 让学生外推到教师概率质量之外 (reward extrapolation). 在多个同源领域 RL 专家共享基座的设定下, 外推版 ExOPD 得到的统一学生超过了所有同尺寸领域教师. 这一族还包括 KDRL (RL 训练中加 on-policy KL 正则), RLAD (用 PPO 式比率只在教师信号有益时跟随教师), REOPOLD 等. 综述的看法是 MiniLLM 本身已经是以教师对数概率为奖励的策略梯度, 序列级蒸馏与 RL 增强蒸馏是同一条连续谱的两端, 参数是奖励来源.

目标轴里还有两个与实现直接相关的分叉. 第一是 token 级与序列级: token 级方法每个位置有 $|V|$ 维信号, 方差低, 但教师在该位置校准差时有偏; 序列级方法经策略梯度定理无偏, 但单样本 REINFORCE 方差高. 第二是全词表与采样 token: 许多基于 RL 的实现只在采样的 $y_t$ 上算 $\log p_\theta(y_t)-\log p_T(y_t)$ 当作逐 token 优势, 每个位置只要一次教师对数概率, 但方差高, 丢掉了未采样 token 的信息; DeepSeek-V4 改用全词表 Reverse KL, 靠缓存教师 hidden state 并在训练时经预测头重建 logits 实现. 介于两者之间的是 vOPD: 把单样本 OPD 写成 REINFORCE, 减去基线 $b_t=V(c_t)=-D_{\mathrm{KL}}(p_\theta(\cdot\mid c_t)\Vert p_T(\cdot\mid c_t))$. 基线只依赖上下文, 不依赖采样 token, 梯度仍无偏. 在 Qwen3-1.7B 与 4B 的六个推理基准上, vOPD 比单样本 OPD 平均高约 3 个点 (MATH500 上 6.2), 与全词表 OPD 精度相当, 墙钟时间最多少 57.7%.

### 2.2. 信号轴

信号密度从白盒到黑盒再到无外部教师依次下降, 对外部模型的依赖也依次减少.

**白盒**: 每个位置拿到教师完整的 $|V|$ 维分布. 同家族共享分词器时可以直接算逐 token KL; 跨家族需要对齐词表, 综述收了 DSKD (双空间投影), ULD (概率空间的 Wasserstein 距离), SimCT 等. 综述在开放问题里指出, 这些跨架构方法主要在较小的规模差上验证过.

**黑盒**: 只能拿到教师的文本输出, 至多 top-$k$ 对数概率, token 级散度无法计算, 只能在序列级工作. 方法按信号丰富程度排开: GAD 训练判别器区分学生 rollout 与教师 API 输出, 用判别器分数当 GRPO 奖励; Lion 让教师找出学生仍做不好的指令并生成更难的指令; OVD 用教师给出的 0-9 口头分做轨迹匹配; ORPO-Distill 让教师对学生回答两两排序再做偏好优化; ROPD 让教师对比师生 rollout 归纳出逐题评分细则, 再按细则给学生打分, 报告在 AIME 2025 思考模式下 Qwen3-4B 学生 68.75% 超过 GPT-5.2 教师的 67.08%. 偏好接口是在拿不到 logits 时的替代, 定义仍是式 (1) 的 $y\sim p_\theta$.

**自蒸馏**: 用同一模型在不同条件下的差异构造教师. 综述分三类: 特权信息 (训练时额外给参考答案, 文档, 示范等, 如 OPSD, SDFT), 纯自蒸馏 (靠采样温度, 冻结副本等), 外部反馈 (验证器或环境反馈锚定自生成信号). 本节对应 [02 OPSD](../../4.9.1-OPD方法与落地/02-OPSD-自蒸馏/02-OPSD-自蒸馏.md), [03 SDFT](../../4.9.1-OPD方法与落地/03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md), [04 SDPO](../../4.9.1-OPD方法与落地/04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md).

### 2.3. 训练动态轴

这一轴分三层: token 加权减少无信息 token 浪费的梯度, 课程设计减少无信息的 rollout, 算力优化降低每条 rollout 的生产和打分成本. 综述把一步白盒 OPD 拆成三部分: 学生自回归生成 $B\times K$ 条回答 (受 KV cache 限制, 通常占墙钟时间大头), 教师在学生序列上前向得到 logits (教师远大于学生时可与学生反传相当甚至更高), 学生反传.

各部分有对应的优化. FOPD 观察到逐 token reverse KL 损失集中在序列前缀, 只对长度 $k$ 的前缀做 on-policy, 其余回到 off-policy, 训练 FLOP 降低 2 到 47 倍. Lightning-OPD 在 SFT rollout 上预先算好教师对数概率, 训练时不需要在线教师, 条件是 SFT 数据与 OPD 用同一个教师, 效率提高 4.0 倍. NPD 把学生生成, 教师打分, 学生训练拆成异步流水线, 吞吐提高 8.1 倍. Prune-OPD 逐位置监测师生 top-$k$ 重叠, 漂移超过预算就截断 rollout, 训练时间减少 37.6% 到 68.0%.

综述用两个式子比较 $N$ 个 token 的成本:

$$
C_{\text{off}}\approx N\,(F_{\text{teacher}}+F_{\text{student}}+B_{\text{student}}),\qquad C_{\text{on}}\approx N\,(G_{\text{student}}+\rho F_{\text{teacher}}+F_{\text{student}}+B_{\text{student}}) \tag{9}
$$

$F,B$ 是前向与反向 FLOP, $G$ 是自回归生成成本, $\rho\in(0,1]$ 是需要重新跑教师前向的步数比例. 因为 $G_{\text{student}}\gg F_{\text{student}}$, on-policy 有明显的乘数. 综述给的估算 (标明是按已报告基准外推的代表性数字) 是: 8 张 H100 上 70B 教师蒸 7B 学生, 1B token, off-policy 约 300 GPU 小时 (教师离线生成约 200, 学生训练约 100), on-policy 约 1,200 到 1,500 GPU 小时, 约 4 到 5 倍.

## 3. 成功条件与失败模式

### 3.1. 成功条件

综述采用 Li 等 (*Rethinking OPD*) 的两个必要条件: 师生思维模式兼容 (以 top-$k$ token 分布的重叠度衡量), 教师能提供学生还没有的能力. 同样数据和配方训出的不同尺寸模型分布相近, 教师几乎没有可迁移的信号. 综述的概括是 OPD 的收益取决于师生之间可利用的差距: 太小 (同配方) 没有新信息, 太大 (思维模式不匹配) 学生吸收不了. 两个条件的实验细节见 [07](../../4.9.1-OPD方法与落地/07-OPD-失败模式/07-OPD-失败模式.md) 第 4 节.

据此综述列出训练前的四项诊断:

1. 在留出集上算师生 top-$k$ 重叠, 太低就先做 off-policy 冷启动.
2. 看学生在目标提示上的通过率, 一题都做不对时 OPD 梯度会消失, 换课程或更容易的热身任务.
3. 在学生生成的前缀上检查教师置信度与正确性是否相关.
4. 训练早期监测输出长度, 长度突然膨胀说明进入了 Luo 等描述的自我强化重复循环.

自蒸馏的成功条件另有一条. Kim 与 Lee (2026) 把 OPSD 分别只用在正确 rollout 组和只用在错误 rollout 组上: 只用正确组时准确率不变, 推理轨迹明显变短; 只用错误组时准确率下降. 他们排除了教师上下文更丰富, 中途重新注入反馈, 训练更久三种解释, 结论是事后看到答案的自教师能找出长推理轨迹里的冗余, 但不能可靠地给出更好的推理步骤. 综述据此给出的顺序是 SFT 建立格式, RLVR 扩大可达的正确轨迹, OPSD 最终压缩; 在 Qwen3-8B 与 AceReason-Nemotron-7B 上, RLVR 之后只对正确组做 OPSD 在准确率与长度的平面上位置最好.

### 3.2. 失败模式

综述按根因而非症状归类:

| 失败模式 | 根因 | 综述引用的证据或修复 |
|---------|-----|------------------|
| 错误前缀陷阱 | 学生前缀出错后教师条件分布不可靠 | Fu 等归纳为单 token 信号失衡, 偏离分布前缀上的教师指导不可靠, 分词器不一致三类 |
| 局部可教性坍缩 | 教师仍校准良好, 但在后段对学生 top-$K$ 候选的区分度变小 | Liu 等按段汇总教师区分度, 在突变点截断监督 |
| 自博弈饱和 | 自蒸馏中目标与学生共享偏差, 自信的错误路径被强化 | 需外部验证或特权信息锚定 |
| 多样性坍缩 | Reverse KL 让学生每题集中到单一策略, Pass@1 高而 Pass@$k$ 低 | 提高采样温度可在精度与覆盖之间调节 |
| 校准与能力脱节 | 教师监督在训练时的特权上下文下形成, 部署时没有这些上下文 | CaOPD 报告 OPD 后模型严重过度自信 |
| 多轮 agent 坍缩 | 教师动态, 轨迹结构, 奖励提示三方面 | TT-OPD: 周期重置下每回合轮数 7.65 → 5.52, 用 EMA 教师仍 7.82 → 6.23; 无长度控制的提示让准确率 54.5% → 49.0% |
| 顽固高损失 token | 训练饱和后仍有至多 18% 的 token 损失居高 | 因果干预显示它们对推理性能贡献可忽略, 多为连接词和格式 |

长度膨胀和 Stable-OPD 的分析见 [07](../../4.9.1-OPD方法与落地/07-OPD-失败模式/07-OPD-失败模式.md) 第 3 节.

## 4. 取舍, 部署与开放问题

### 4.1. 什么时候用 on-policy

综述先讨论了一个反例: DeepSeek-R1 用约 80 万条 CoT 轨迹做纯 off-policy SFT, 蒸出 1.5B 到 70B 的学生. AIME 2024 pass@1 上 R1-Distill-Qwen-7B 为 55.5%, 32B 为 72.6%, 而在 Qwen2.5-32B-Base 上直接做 GRPO 只有 47.0%. 综述给出的解释是: 671B MoE 教师足够强, 轨迹覆盖面广且包含回溯和验证, 学生相对小. 结论是教师很强, 轨迹足够多样, 学生相对小时, off-policy 往往够用; 学生容量变大并开始偏离静态训练分布时, on-policy 的价值上升.

综述的决策规则:

- 师生容量比超过 10 倍, 且任务推理深度有限 (事实问答, 翻译, 摘要) 时, 只用 off-policy SFT.
- 以下任一条件成立时改用 on-policy: 学生超过约 7B 并开始探索静态教师轨迹没有覆盖的区域; 任务是中间错误会累积的多步推理; off-policy 损失已平台化, 而 on-policy rollout 下留出集奖励仍在上升.
- 其余情况用混合流程: off-policy 热身, 再 on-policy 精修.

在 on-policy 内部, 综述的建议是小于 7B 的学生更受益于稠密 logit 监督 (GKD, DistiLLM), 7B 以上且有可靠验证器的学生更适合奖励引导的 OPD (KDRL, G-OPD). 关于蒸馏与直接 RL 的取舍, 综述列出三个因素: 教师质量相对奖励信号的高低, 学生规模 (不超过 7B 的学生更依赖稠密监督, 32B 以上有能力做 RL 探索), 目标是追平还是超过教师.

### 4.2. 工业部署模式

综述第 8.1 节把工业用法归为几类: 两段式流程 (off-policy 冷启动加 on-policy 精修, 例子是 Qwen3 的 Strong-to-Weak 蒸馏), 用 OPD 合并多个领域专家 (DeepSeek-V4 用全词表 Reverse KL 把十余个领域专家并成一个模型, 取代 V3 的混合 RL 阶段; KAT-Coder-V2 把 agent 编程拆成五个专家域再蒸馏合并, SWE-bench Verified 79.6%), 按推理预算合并专家 (ORBIT 在逐次减半的上下文预算下训出各级专家, 再用带模式提示的 Reverse KL 融合), 多轮 agent 蒸馏, 以及安全进化流水线 (Safactory). 其中 CoPD 指出先训完专家再蒸馏时, 独立训练的专家推理风格互不兼容, 改为在专家 RLVR 训练过程中交替做双向 OPD.

各家技术报告原文的对照见 [10](../../4.9.1-OPD方法与落地/10-OPD-报告落地对照/10-OPD-报告落地对照.md), 多教师合并的公式与消融见 [09](../../4.9.1-OPD方法与落地/09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md).

### 4.3. 开放问题与局限

综述第 9 节列出的开放问题里, 与工程最相关的有四个. 一是蒸馏的规模规律: Busbridge 等在 off-policy 设定下发现, 随算力增加最优教师规模先增长到略大于学生, 然后持平, 最终因教师推理成本占比过高而下降; on-policy 多了 rollout 预算这条轴, 还没有对应的规模规律. 二是教师不确定性: 教师给的是点估计概率, 学生对教师猜测的位置和确定的位置一视同仁. 三是 agent 级蒸馏, 包括环境随动作变化, 工具调用组合, 不可逆动作的安全探索. 四是 OPD 与 RLVR 的调度, 何时模仿教师, 何时越过教师探索, 目前多靠经验.

综述自己写明了几项局限: 只收训练时学生自己生成数据的方法, 不含特征蒸馏, 剪枝量化和推理时方法; 文献截至 2026 年 5 月, 当时每月新增十篇以上; 各表格报告的是原论文的数字而非受控复现, 不同方法的基座模型, 算力, 基准版本, 每题 rollout 数都不同, 跨行比较需要谨慎.

**参考文献**

1. Song, M., & Zheng, M. (2026). [A Survey of On-Policy Distillation for Large Language Models.](https://arxiv.org/abs/2604.00626) *arXiv:2604.00626* (v3). 方法列表: [Awesome-LLM-On-Policy-Distillation](https://github.com/nick7nlp/Awesome-LLM-On-Policy-Distillation).
2. Agarwal, R., Vieillard, N., Zhou, Y., et al. (2024). [On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes.](https://arxiv.org/abs/2306.13649) *ICLR 2024*.
3. Gu, Y., Dong, L., Wei, F., & Huang, M. (2024). [MiniLLM: Knowledge Distillation of Large Language Models.](https://arxiv.org/abs/2306.08543) *ICLR 2024*.
4. Ko, J., Kim, S., Chen, T., & Yun, S.-Y. (2024). [DistiLLM: Towards Streamlined Distillation for Large Language Models.](https://arxiv.org/abs/2402.03898) *ICML 2024*.
5. Ross, S., Gordon, G., & Bagnell, D. (2011). [A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning.](https://arxiv.org/abs/1011.0686) *AISTATS 2011*.
6. Kim, Y., & Rush, A. M. (2016). [Sequence-Level Knowledge Distillation.](https://arxiv.org/abs/1606.07947) *EMNLP 2016*.
7. Hinton, G., Vinyals, O., & Dean, J. (2015). [Distilling the Knowledge in a Neural Network.](https://arxiv.org/abs/1503.02531) *arXiv:1503.02531*.
8. Qwen Team. (2025). [Qwen3 Technical Report.](https://arxiv.org/abs/2505.09388) *arXiv:2505.09388*.
9. DeepSeek-AI. (2025). [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning.](https://arxiv.org/abs/2501.12948) *arXiv:2501.12948*.
10. Li, Y., Zuo, Y., He, B., et al. (2026). [Rethinking On-Policy Distillation of Large Language Models: Phenomenology, Mechanism, and Recipe.](https://arxiv.org/abs/2604.13016) *arXiv:2604.13016*.
