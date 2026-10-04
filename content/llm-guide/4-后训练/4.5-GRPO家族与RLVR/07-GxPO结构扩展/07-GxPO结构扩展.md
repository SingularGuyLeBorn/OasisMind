---
title: "07 · GxPO 结构扩展: 轨迹侧与奖励侧"
published: true
tags: ["GxPO", "GRPO", "GSPO", "DAPO", "GMPO", "GHPO", "DrGRPO", "CISPO"]
excerpt: "GRPO 之后的一串缩写都在优化同一个期望回报. 按改动落在轨迹分布还是奖励标量来分: DAPO 拆开 clip 上下界并丢掉全对全错组, GSPO 把重要性比率收成序列级, GMPO 换几何平均, GHPO 给难题补标准解前缀, Dr.GRPO 去掉长度和标准差两个归一."
---
# 07 · GxPO 结构扩展: 轨迹侧与奖励侧

> 相关阅读: [4.5 GRPO 家族与 RLVR](../4.5-GRPO家族与RLVR.md) · [01-GRPO](../01-GRPO/01-GRPO.md) · [04-GSPO](../04-GSPO/04-GSPO.md) · [05-GMPO](../05-GMPO/05-GMPO.md) · [04-PPO](../../4.4-强化学习基础/04-PPO/04-PPO.md) · [03-CISPO](../03-CISPO-裁剪重要性权重/03-CISPO-裁剪重要性权重.md) · [02-Dr.GRPO](../02-DrGRPO-去标准差/02-DrGRPO-去标准差.md) · [OPD 基础原理](../../4.9-OPD/4.9.1-OPD方法与落地/01-OPD基础原理/01-OPD基础原理.md)

材料是 Shen 等 (arXiv:2606.16733) 对策略梯度方法的分类, 以及 GRPO, DAPO, GSPO, GMPO, GHPO 各自的原论文. GxPO 指 GRPO 及其结构扩展这一族, 没有一个叫 GxPO 的算法; 问题是这些方法各自改动了期望回报中的哪一部分.

## 1. 同一个 $J$, 两根轴

### 1.1 从期望回报到替代目标

策略梯度方法的出发点是期望回报:

$$
J(\theta)=\mathbb{E}_{\tau\sim p_{\theta}(\tau)}\bigl[R(\tau)\bigr]. \tag{1}
$$

$\tau$ 是一条完整回答, $p_\theta(\tau)$ 是当前策略生成它的概率, $R(\tau)$ 是给它的标量奖励. 对 $\theta$ 求导, 用 $\nabla p=p\,\nabla\log p$:

$$
\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim p_\theta}\bigl[R(\tau)\,\nabla_\theta\log p_\theta(\tau)\bigr],\qquad
\log p_\theta(\tau)=\sum_{t=1}^{|o|}\log\pi_\theta(o_t\mid q,o_{<t}). \tag{2}
$$

$q$ 是问题, $o$ 是回答的 token 序列, $\pi_\theta$ 是逐 token 的策略. 自回归模型的序列概率是 token 概率之积, 所以序列级的得分函数拆成 token 对数概率梯度之和. 式 (2) 方差很大. 减去一个只依赖问题的基线 $b(q)$ 不改变期望, 因为 $\mathbb{E}_{\tau}[b(q)\nabla_\theta\log p_\theta(\tau)]=b(q)\nabla_\theta\sum_\tau p_\theta(\tau)=b(q)\nabla_\theta 1=0$:

$$
\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim p_\theta}\Bigl[\bigl(R(\tau)-b(q)\bigr)\sum_{t}\nabla_\theta\log\pi_\theta(o_t\mid q,o_{<t})\Bigr]. \tag{3}
$$

式 (3) 要求样本来自当前策略. 为了一批 rollout 能更新多步, PPO 系方法改用旧策略 $\pi_{\theta_{\mathrm{old}}}$ 的样本, 乘上重要性比率 $r_t(\theta)=\pi_\theta(o_t\mid q,o_{<t})/\pi_{\theta_{\mathrm{old}}}(o_t\mid q,o_{<t})$, 优化替代目标:

$$
L(\theta)=\mathbb{E}_{\tau\sim\pi_{\theta_{\mathrm{old}}}}\Bigl[\sum_{t}r_t(\theta)\,A_t\Bigr],\qquad
\nabla_\theta L(\theta)\big|_{\theta=\theta_{\mathrm{old}}}=\nabla_\theta J(\theta)\big|_{\theta=\theta_{\mathrm{old}}}. \tag{4}
$$

$A_t$ 是优势, 即式 (3) 中 $R(\tau)-b(q)$ 的某种估计. 等号只在 $\theta=\theta_{\mathrm{old}}$ 处成立, 策略走远之后替代目标就不准, 于是要 clip 或 KL 把更新限制在附近. 从式 (2) 到式 (4), 每一步都留下一个可选项: 优势怎么估计, 基线取什么, 是否归一; 样本从哪个分布来, 比率按 token 还是按序列算, 越界时怎么处理. 前一组选项落在 $R$ 上, 后一组落在 $p_\theta$ 上, 于是改动可以按落点分两类.

用组均值当基线时, $b(q)$ 里含有样本 $i$ 自己的奖励, 严格说已不独立于 $\tau_i$. RLOO 用其余 $G-1$ 条的均值当基线, 消掉这一项; Dr.GRPO 推导出组均值基线的优势乘以 $G/(G-1)$ 后与 RLOO 相同, 差别只是一个常数缩放.

### 1.2 轨迹侧与奖励侧

**轨迹侧**管样本怎么进入更新: 从哪个分布采样, 重要性比率按 token 算还是按序列算, clip 卡在哪一层, 哪些组被保留. **奖励侧**管这条轨迹用什么标量加权: 奖励来自规则还是模型, 怎么归一成优势, 优势广播到哪些 token. PPO 在轨迹侧用 token 级比率加对称 clip, 在奖励侧用 GAE 和价值网络. GRPO 只动了奖励侧, 把价值网络换成组内相对优势, 轨迹侧的比率和对称 clip 原样保留. 后面的变体都是在式 (1) 两侧做局部改动.

![GxPO family on trajectory vs reward axes](./images/fig-gxpo-two-axes.png)

> 图 1: 从 $J(\theta)$ 分出轨迹侧与奖励侧. GRPO 是奖励侧替换. DAPO, GSPO, GMPO, GHPO 相对 GRPO 分别改 clip, 采样, 比率聚合或 prompt. 红框里的 DPO 与散度形式的 OPD 落在 $J$ 之外.

**图 1 解析**

- **顶栏**: 式 (1) 的两个因子. 判断一个缩写改了什么, 先看它动的是 $p_\theta$ 还是 $R$.
- **左列 (轨迹侧)**: GSPO 把比率收成序列级标量再 clip. DAPO 的 Clip-Higher 改信任域上界, Dynamic Sampling 改哪些组进 batch. GHPO 改 prompt 本身, 因而改了轨迹从哪个条件分布采出. GMPO 用几何平均压住 token 级比率的离群值.
- **右列 (奖励侧)**: GRPO 的组内 $z$-score 只在这里出现一次. Dr.GRPO 去掉 $\sigma$ 与 $1/|o|$. DAPO 的软超长惩罚直接加在 $R$ 上.
- **红框**: DPO 用偏好分类代替 rollout, 目标里没有 $J$ 了. 用散度做目标的 On-Policy Distillation (MiniLLM, GKD 一类) 把 $R$ 换成与教师分布的距离, 综述 §9.1 把它标为边界情况. 综述正文研究的是保留 $J$ 的 GRPO-OPD hybrid.

## 2. GRPO 与各变体的落点

### 2.1 GRPO: 组内相对优势

DeepSeekMath (arXiv:2402.03300) 的动机很具体. PPO 的价值网络通常和策略同规模, 显存与算力都翻倍. LLM 的奖励往往只给在最后一个 token 上, 逐 token 训练价值函数 $V_\psi$ 很难. GRPO 对同一问题 $q$ 从旧策略 $\pi_{\theta_{\mathrm{old}}}$ 采 $G$ 条输出 $\{o_i\}_{i=1}^{G}$, 用组内分数做基线.

结果监督下, 组奖励 $\mathbf{r}=\{r_1,\ldots,r_G\}$ 减均值除标准差, 整条回答的每个 token 共享同一个优势:

$$
\hat{A}_{i,t}=\tilde{r}_{i}=\frac{r_i-\mathrm{mean}(\mathbf{r})}{\mathrm{std}(\mathbf{r})}. \tag{5}
$$

这就是组内 $z$-score. 下文的变体只要没动式 (5), 优势就还是这一套, 差别在轨迹侧怎么使用 $\hat{A}_i$.

### 2.2 目标函数与实验

目标函数 (DeepSeekMath 式 (3)) 在 token 上做和 PPO 同构的 clip, KL 不折进奖励, 直接加在损失上:

$$
\begin{aligned}
\mathcal{J}_{\mathrm{GRPO}}(\theta)
&=\mathbb{E}_{q\sim P(Q),\{o_i\}_{i=1}^{G}\sim\pi_{\theta_{\mathrm{old}}}}
\Bigg[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}\\
&\quad\min\Big(
r_{i,t}(\theta)\hat{A}_{i,t},\;
\mathrm{clip}\bigl(r_{i,t}(\theta),1-\varepsilon,1+\varepsilon\bigr)\hat{A}_{i,t}
\Big)
-\beta\,\mathbb{D}_{\mathrm{KL}}[\pi_{\theta}\Vert\pi_{\mathrm{ref}}]\Bigg],
\end{aligned} \tag{6}
$$

其中 $r_{i,t}(\theta)=\pi_{\theta}(o_{i,t}\mid q,o_{i,<t})/\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q,o_{i,<t})$ 是 token 级重要性比率, $\varepsilon$ 是 clip 半宽, $\beta$ 是 KL 系数, $\pi_{\mathrm{ref}}$ 是冻结的参考模型. KL 用无偏估计 $\pi_{\mathrm{ref}}/\pi_{\theta}-\log(\pi_{\mathrm{ref}}/\pi_{\theta})-1$. 综述称之为纯奖励侧替换: 比率, 对称 clip 和 KL 都还在, 变化只有 $A_t^{\mathrm{GAE}}\to\hat{A}_i$.

DeepSeekMath 的 RL 设置: 学习率 $1\times10^{-6}$, KL 系数 0.04, 每题采 64 条, 最长 1024 token, batch 1024, 每轮探索只做一次更新. 结果 (Table 5, CoT 推理, 不用工具): DeepSeekMath-Instruct 7B 做 GRPO 后, GSM8K 82.9% 到 88.2%, MATH 46.8% 到 51.7%, CMATH 84.6% 到 88.8%. Figure 7 在温度 0.7 下比较 Instruct 与 RL 模型, RL 提高了 Maj@K, Pass@K 基本不变 (§5.2.2). 09 篇讨论的 RLVR 边界问题, 在这里已经出现了.

**失效**: 组内奖励全相同时式 (5) 是 $0/0$, 实现里加一个小常数或跳过该组, 这道题的梯度为零. DAPO 的动态采样和 GHPO 的 hint 处理的就是这一情况. 过程监督版本里, 逐步奖励归一后从后往前累加成每个 token 的优势; 下文默认对照结果监督.

### 2.3 对照表: 相对 GRPO 改了哪一侧

![Which knob each GxPO variant turns](./images/fig-gxpo-which-knob.png)

> 图 2: 四列旋钮. 相对 GRPO, 各方法分别改 clip, 优势聚合, 采样或 prompt. 示意图, 数字以正文和表格为准.

**图 2 解析**

- **Clip 列**: GRPO 与 PPO 默认对称 $1\pm\varepsilon$. DAPO 把上下界拆开. GSPO 的 $\varepsilon$ 作用在序列似然比上, 数量级从 0.2 降到 $10^{-4}$. GMPO 在对数空间按 token clip, 再做几何平均.
- **优势聚合列**: 组内 $z$-score 只在 GRPO 处出现一次. Dr.GRPO 拆掉 $\sigma$ 与 $1/|o|$. GMPO 改的是重要性加权奖励的平均算子, 组统计本身没变.
- **采样列**: 只有 DAPO 在更新前丢掉准确率为 0 或 1 的组.
- **Prompt 列**: 只有 GHPO 改题目文本.

| 算法 | 相对 GRPO 改哪一侧 | clip | 优势与损失聚合 | 采样 | prompt |
| --- | --- | --- | --- | --- | --- |
| GRPO | 奖励侧: 式 (5) 替换价值网络 | 对称 $1\pm\varepsilon$, token 级 | 组内 $z$-score, 序列内对 token 取均值 | 组全留 | 不动 |
| DAPO | 两侧: clip 与采样在轨迹侧, 长度惩罚在奖励侧 | $\varepsilon_{\mathrm{low}}=0.2$, $\varepsilon_{\mathrm{high}}=0.28$ | 分母改为组内 token 总数, 优势仍是式 (5) | 丢掉全对或全错组 | 不动 |
| GSPO | 轨迹侧: 比率粒度 | 对序列标量 $s_i$ clip, 左右界 $3\times10^{-4}$, $4\times10^{-4}$ | 组内 $z$-score | 组全留 | 不动 |
| GMPO | 轨迹侧: 比率聚合 | token 级, 对数空间, $(e^{-0.4},e^{0.4})$ | 几何平均 | 组全留 | 不动 |
| GHPO | 轨迹侧: 条件分布 | GRPO 式 clip | 组内相对 | 组全留, 难题改写成 $q^*$ | $q$ 或 $q+\omega\cdot h$ |
| Dr.GRPO | 奖励侧: 统计偏差 | 不改 | 去掉 $1/\lvert o_i\rvert$ 与 $\mathrm{std}(\mathbf{r})$ | 组全留 | 不动 |

DAPO 的优势公式与 GRPO 相同. 段级优势属于 SPO 等信用分配方法, 和 DAPO 无关.

## 3. DAPO: 四项改动

### 3.1 起点与 Clip-Higher

**DAPO = Decoupled Clip and Dynamic sAmpling Policy Optimization** (Yu 等, arXiv:2503.14476), 实现基于 verl. 起点是 Qwen2.5-32B base 上的朴素 GRPO, AIME 2024 avg@32 只有 30 分, 而 DeepSeek-R1-Zero-Qwen-32B 是 47. 作者把差距拆成熵崩塌, 零优势组, 长 CoT 的样本级损失, 截断奖励噪声四个问题, 对应四项改动.

第一项针对熵崩塌. 对称 $\varepsilon=0.2$ 时, 旧概率 0.01 的 token 一步最多涨到 0.012, 旧概率 0.9 的 token 上界是 1.08, 实际上不受约束. 上界对低概率 token 卡得最紧, 作者统计被上界裁掉的 token, 平均概率低于 0.2 (Figure 3a). 结果是低概率的探索 token 很难被抬起来, 熵迅速下降. DAPO 把上下界拆开:

$$
\mathrm{clip}\bigl(r_{i,t}(\theta),\,1-\varepsilon_{\mathrm{low}},\,1+\varepsilon_{\mathrm{high}}\bigr),\qquad \varepsilon_{\mathrm{low}}=0.2,\;\varepsilon_{\mathrm{high}}=0.28. \tag{7}
$$

下界保持 0.2. 放大 $\varepsilon_{\mathrm{low}}$ 会把负优势 token 的概率一路压向 0, 采样空间跟着塌. DAPO 同时去掉 KL 项 (§2.3): 长 CoT 训练中策略本来就要离开初始化, 冻结的 $\pi_{\mathrm{ref}}$ 会拖住它.

### 3.2 Dynamic Sampling

组内全对或全错时, 式 (5) 的优势为零, 这道题对梯度没有贡献. 训练越往后, 准确率为 1 的题越多, 有效 batch 越小, 梯度方差越大. DAPO 要求每个进入更新的组满足

$$
0 < \bigl|\{o_i \mid \texttt{is\_equivalent}(a,o_i)\}\bigr| < G, \tag{8}
$$

$a$ 是标准答案. 不满足的组丢掉, 继续采样直到 buffer 装满有对有错的组. 过滤单位是 prompt 组. 采样量会随全对全错组的比例增加, 作者观察到收敛所需步数下降, 墙钟时间不一定变长. 这一点的前提是生成同步且未流水线化, 此时生成时间主要由长尾样本决定, 多采几组短样本的边际成本不高.

### 3.3 Token-level Policy Gradient Loss

式 (6) 先在序列内对 token 取均值, 再对样本取均值, 每条回答权重相同. 长回答里每个 token 的贡献被稀释: 好的长推理学得慢, 重复和胡写的超长样本也罚得轻. DAPO 把分母改成组内 token 总数:

$$
\mathcal{J}_{\mathrm{DAPO}}(\theta)
=\mathbb{E}\Biggl[
\frac{1}{\sum_{i=1}^{G}|o_i|}
\sum_{i=1}^{G}\sum_{t=1}^{|o_i|}
\min\bigl(r_{i,t}\hat{A}_{i,t},\;
\mathrm{clip}(r_{i,t},1-\varepsilon_{\mathrm{low}},1+\varepsilon_{\mathrm{high}})\hat{A}_{i,t}\bigr)
\Biggr]. \tag{9}
$$

同一种生成模式出现在短句还是长句里, 每个 token 的梯度权重相同.

### 3.4 Overlong Reward Shaping

超出生成上限而被截断的样本, 如果直接给惩罚, 一段推理可能本身正确, 只因为太长就被判错, 奖励噪声变大. DAPO 先做 Overlong Filtering, 截断样本的损失整体 mask 掉; 再给出软超长惩罚 (原文式 (13)):

$$
R_{\mathrm{length}}(y)=\begin{cases}
0, & |y|\le L_{\max}-L_{\mathrm{cache}},\\
\dfrac{(L_{\max}-L_{\mathrm{cache}})-|y|}{L_{\mathrm{cache}}}, & L_{\max}-L_{\mathrm{cache}}<|y|\le L_{\max},\\
-1, & |y|>L_{\max}.
\end{cases} \tag{10}
$$

$L_{\max}$ 是生成上限, $L_{\mathrm{cache}}$ 是惩罚缓冲区长度. 实验里期望最大长度是 16384, 另设 4096 的缓冲, 生成上限 20480, 按式 (10) 的记号即 $L_{\max}=20480$, $L_{\mathrm{cache}}=4096$. 这一项加在规则正确性奖励上, 后者是答案等价得 $+1$, 否则 $-1$ (原文式 (7)).

### 3.5 实验

模型 Qwen2.5-32B base, 评测 AIME 2024 avg@32, 温度 1.0, top-p 0.7. 训练: AdamW, 学习率 $1\times10^{-6}$, 前 20 个 rollout step 线性 warmup; prompt batch 512, 每题 16 条; mini-batch 512, 即每个 rollout step 做 16 次梯度更新.

| 设定 | $\mathrm{AIME24}_{\mathrm{avg@32}}$ |
| --- | ---: |
| DeepSeek-R1-Zero-Qwen-32B | 47 |
| Naive GRPO | 30 |
| + Overlong Filtering | 36 |
| + Clip-Higher | 38 |
| + Soft Overlong Punishment | 41 |
| + Token-level Loss | 42 |
| + Dynamic Sampling (完整 DAPO) | 50 |

完整 DAPO 用 R1-Zero-Qwen-32B 50% 的训练步数达到 50 分. Token-level Loss 在表上只加 1 分, 作者说它的主要作用是稳定长度和熵.

Algorithm 1 的循环顺序是: 对 batch 里每道题采 $G$ 条回答, 用规则奖励加式 (10) 打分, 按式 (8) 过滤后放进 buffer; buffer 不满就回去再采一批; 满了才按式 (5) 计算优势, 用式 (9) 做若干次策略更新. 四项改动作用在不同环节, 互相依赖: Clip-Higher 维持熵, 熵高了组内才更可能有对有错, 动态采样才不至于丢掉太多组; token 级损失让长回答的每个 token 都被计入, 软超长惩罚再从奖励端压住无节制的变长. 表里从 42 到 50 的最后一跳来自动态采样, 也说明零优势组在后期占了相当比例. 数据集 DAPO-Math-17K 有 17K 道题, 答案全部改造成整数, 例如原答案 $(a+\sqrt b)/c$ 改成求 $a+b+c$, 这样规则判分才可靠.

**边界**: 50 分的口径是 Qwen2.5-32B base 加 avg@32, 换骨干或换 $k$ 不能直接比. 动态采样丢掉的是题库里当前最难的一截, 这些题不进入梯度. 没有可解析答案的任务用不了式 (8).

## 4. GSPO 与 GMPO: 改比率的聚合方式

### 4.1 GSPO: 序列级重要性比率

**GSPO = Group Sequence Policy Optimization** (Zheng 等, Qwen Team, arXiv:2507.18071). 主张是奖励给整条序列, 重要性校正也应该给整条序列.

GRPO 在每个 token 位置用单次采样的 $w_{i,t}=\pi_{\theta}/\pi_{\theta_{\mathrm{old}}}$ 做重要性权重. 重要性采样要靠多个样本的平均才能校正分布, 每个位置只有一个样本时, 这个权重起不到校正作用, 只往梯度里加高方差噪声. 序列一长, 噪声沿 token 累积, 再叠加 MoE 的路由变化, clip 会把它放大到训练崩溃.

GSPO 把比率定义为长度归一的序列似然比 (原文式 (7)):

$$
s_i(\theta)
=\Biggl(\frac{\pi_{\theta}(y_i\mid x)}{\pi_{\theta_{\mathrm{old}}}(y_i\mid x)}\Biggr)^{1/|y_i|}
=\exp\Biggl(\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}
\log\frac{\pi_{\theta}(y_{i,t}\mid x,y_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid x,y_{i,<t})}\Biggr). \tag{11}
$$

$x$ 是问题, $y_i$ 是第 $i$ 条回答, $1/|y_i|$ 次幂把不同长度的序列拉回同一数值范围. 目标对这个标量 clip, 优势仍是组内 $z$-score (原文式 (5)):

$$
\mathcal{J}_{\mathrm{GSPO}}(\theta)
=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}
\min\bigl(s_i(\theta)\widehat{A}_i,\;
\mathrm{clip}(s_i(\theta),1-\varepsilon,1+\varepsilon)\widehat{A}_i\bigr)\Biggr]. \tag{12}
$$

不考虑 clip 时, 两者的梯度可以并排写出. 对式 (11) 求导, 有 $\nabla_\theta s_i=s_i\cdot\frac{1}{|y_i|}\sum_t\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t})$, 于是

$$
\begin{aligned}
\nabla_\theta\mathcal{J}_{\mathrm{GSPO}}&=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}s_i(\theta)\,\widehat{A}_i\cdot\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t})\Biggr],\\
\nabla_\theta\mathcal{J}_{\mathrm{GRPO}}&=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}\widehat{A}_i\cdot\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}w_{i,t}(\theta)\,\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t})\Biggr].
\end{aligned} \tag{13}
$$

区别在权重的位置. GSPO 中同一条回答的所有 token 共享一个 $s_i$, 各 token 的对数概率梯度等权相加. GRPO 中每个 token 带着自己的 $w_{i,t}$, 某几个位置的比率偏离 1 很远时, 这几个 token 的梯度就被放大或缩小, 而这些偏离大多来自单次采样的噪声.

![GRPO token-level IS versus GSPO sequence-level IS](./images/fig-gspo-seq-is.png)

> 图 3: 左, GRPO 每个 token 的 $r_t$ 各自 clip, 再乘同一个 $\hat{A}_i$. 右, GSPO 先把 token 对数比做成几何平均标量 $s$, clip 一次, 整条序列共用 $\tilde{s}\hat{A}_i$.

**图 3 解析**

- **左**: clip 发生在 token 上. 正优势时各 $w_{i,t}$ 落在 $(0,1+\varepsilon]$, 负优势时落在 $[1-\varepsilon,+\infty)$. 权重各不相同, 沿序列累积.
- **右**: $\pi_{\theta}(y\mid x)=\prod_t\pi_{\theta}(y_t\mid x,y_{<t})$, 取 $1/|y|$ 次幂后得到 $s$. clip 要么整段留下, 要么整段丢掉, 和奖励是整段一个分对齐.

### 4.2 GSPO 的实验与 MoE

**实验** (原文 §5.1): 冷启动模型从 Qwen3-30B-A3B-Base 微调得到. AIME'24 报 32 次采样的平均 Pass@1, LiveCodeBench (202410 至 202502) 报 8 次平均 Pass@1, CodeForces 报 Elo. 每批 rollout 切成 4 个 mini-batch. GSPO 的 clip 左右界是 $3\times10^{-4}$ 与 $4\times10^{-4}$, 对照 GRPO 用 0.2 与 0.27. 数量级差这么多, 是因为 $s_i$ 已经是几何平均后的似然比. 作者还观察到 GSPO 裁掉的 token 比例比 GRPO 高两个数量级, 训练效率却更高, 他们用这一点说明 token 级梯度的噪声大.

**MoE**: 48 层的 Qwen3-30B-A3B 每次梯度更新后, 同一条 rollout 大约有 10% 的激活专家发生变化. GRPO 的 token 级 $w_{i,t}$ 被路由变化打乱, 要靠 Routing Replay (缓存旧策略的路由并在计算比率时重放) 才能收敛, 这会带来额外显存与通信开销, 也限制模型容量. GSPO 只看序列似然, 对单个 token 的路由变化不敏感, 不需要 Routing Replay.

**GSPO-token** (原文式 (13)(14)): 把 $s_i$ 的数值 stop-gradient 后乘到每个 token 的 $\pi_{\theta}/\mathrm{sg}[\pi_{\theta}]$ 上, 数值仍等于 $s_i$, 好处是多轮场景中可以按 token 给不同的 $\widehat{A}_{i,t}$. 当 $\widehat{A}_{i,t}=\widehat{A}_i$ 时, 梯度与 GSPO 相同.

**边界**: 序列级 clip 的粒度粗, 一条回答里只有少数 token 偏离旧策略时, 整条回答要么全部保留, 要么全部丢掉. 奖励本身是逐 token 或逐步给出时 (过程奖励, 多轮工具调用), 需要退回 GSPO-token 这类形式.

### 4.3 GMPO: 几何平均压离群比率

**GMPO = Geometric-Mean Policy Optimization** (Zhao, Liu 等, arXiv:2507.20673).

GRPO 优化的是 token 级重要性加权奖励的算术平均. $\rho_{i,t}\hat{A}_i$ 对离群的 $\rho_{i,t}$ 很敏感, 训练中比率会冲到极端值, 只好用窄 clip 压住, 探索也一起被压住. $\rho_{i,t}$ 即式 (6) 的 $r_{i,t}$. GMPO 换成几何平均 (省略 clip 的核心形式):

$$
\mathcal{J}^{*}_{\mathrm{GMPO}}(\pi_{\theta})
=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}
\Biggl(\prod_{t=1}^{|o_i|}\bigl|\rho_{i,t}(\theta)\hat{A}_i\bigr|\Biggr)^{1/|o_i|}
\cdot\mathrm{sgn}(\hat{A}_i)\Biggr]. \tag{14}
$$

$\mathrm{sgn}(\hat{A}_i)$ 把符号放回去, 因为几何平均只能对非负数取. 由算术几何平均不等式, $|\mathcal{J}^{*}_{\mathrm{GMPO}}|\le|\mathcal{J}^{*}_{\mathrm{GRPO}}|$, 目标值域更窄. 举一个数值情形: 一条回答有 100 个 token, 其中 99 个比率是 1, 1 个比率是 5. 算术平均是 $1.04$, 几何平均是 $5^{1/100}\approx1.016$; 比率冲到 50 时, 算术平均变成 1.49, 几何平均只到约 1.04. 离群 token 对整句的影响被对数压缩. 梯度上, GRPO 每个 token 的权重只含自己的 $\rho_{i,t}$; GMPO 每个 token 共享整句的几何平均 $\bigl(\prod_k\rho_{i,k}\bigr)^{1/|o_i|}$, 单个极端比率拉不动整句.

### 4.4 GMPO 的 clip 与结果

实现上 GMPO 在 token 级, 对数空间 clip, 再做几何平均. 如果对 $\prod_t\rho_{i,t}$ 做序列级 clip, 一旦触发, 整句梯度全为零; Figure 3 还显示序列级 clip 下比率的范围比 token 级 clip 更宽, 更容易产生极端梯度. 推荐范围 $(e^{-0.4},e^{0.4})$, 比 GRPO 的 $(0.8,1.2)$ 和 DAPO 的 $(0.8,1.28)$ 都宽. Figure 1 中把 GMPO 的 clip 从 $(e^{-0.2},e^{0.2})$ 一直放到不 clip, 比率范围随之变宽, 更新变得不稳, $(e^{-0.4},e^{0.4})$ 是两者之间的折中. 训练过程中, GMPO 相对初始模型的 KL 比 GRPO 小, token 熵比 GRPO 高. 目标里沿用 Dr.GRPO 的做法, 不加 KL 项. 消融中去掉 $1/|o|$ 归一, 7B 均分从 52.7 降到 52.0.

**设置**: 训练数据 MATH Level 3 至 5, 共 8523 题; 每题 8 条 rollout, 最长 3000 token; 每轮 1024 条 rollout, 更新 8 次, batch 128, 8 张 A800. 评测协议沿用 Dr.GRPO: 语言任务温度 0.0, 每题一条, 报 Pass@1; 多模态任务温度 0.5, 每题 16 条.

Table 1 (Oly. 为 OlympiadBench):

| 模型 | AIME24 | AMC | MATH500 | Minerva | Oly. | 平均 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GRPO-7B (R1-Distill) | 43.3 | 67.5 | 89.0 | 39.7 | 56.7 | 59.3 |
| GMPO-7B (R1-Distill) | 46.6 | 78.3 | 91.4 | 37.9 | 62.5 | 63.4 |
| GRPO-7B | 40.0 | 59.0 | 83.4 | 32.4 | 41.3 | 51.2 |
| GMPO-7B | 43.3 | 61.4 | 82.0 | 33.5 | 43.6 | 52.7 |
| GRPO-1.5B | 23.3 | 49.4 | 75.2 | 25.7 | 39.0 | 42.5 |
| GMPO-1.5B | 20.0 | 53.0 | 77.6 | 30.1 | 38.7 | 43.9 |

R1-Distill-Qwen-7B 上均分 59.3 到 63.4, 但 Minerva 从 39.7 降到 37.9; 1.5B 上 AIME24 从 23.3 降到 20.0. 平均分涨, 单科有跌. Table 2: Qwen2.5-VL-Instruct-7B 在 Geometry3K 上 53.3 到 54.7; Qwen3-32B MoE 在 MATH500 上 94.6 到 96.7. MoE 实验的训练数据换成了 DeepScaleR 和 CountDown, 多模态实验沿用 EasyR1 的设置, 在 Geometry3K 上训练.

GMPO 与 GSPO 都用了几何平均, 作用对象不同. GMPO 平均的是 $|\rho\hat{A}|$, clip 仍在 token 上; GSPO 平均的是序列似然比本身, clip 在序列上.

## 5. GHPO: 难题补标准解前缀

### 5.1 问题与公式

**GHPO** (Liu, Gong 等, *GHPO: Adaptive Guidance for Stable and Efficient LLM Reinforcement Learning*, arXiv:2507.10628v2) 不改 clip 公式, 改的是轨迹从哪个条件分布采出.

**问题**: RLVR 的奖励只在轨迹终点给出. 当前策略对某题 $G$ 次全错, 奖励全 0, 式 (5) 优势全 0, 这道题的算力白费. 作者在 NuminaMath-1.5 (约 90 万道竞赛题) 上测 Qwen2.5-7B-Instruct, 有 52% 的题做不出. DAPO 的处理是丢掉这些组; GHPO 留下它们, 但改 prompt.

**公式**: 组内 $G$ 条奖励全为 0 则判为难题, 否则照常走 on-policy GRPO. 难题把标准解的前缀接到题目后:

$$
q^*=\begin{cases}
q, & \sum_{i}f(a,o_i)>0,\\
q+\omega\cdot h_{f,q}, & \text{otherwise.}
\end{cases} \tag{15}
$$

$f(a,o_i)$ 是规则判分, $h_{f,q}$ 是题 $q$ 的完整标准解, $\omega\cdot h_{f,q}$ 表示取它的前 $\omega$ 比例. $\omega$ 按阶段加长, 取值 $\{0.25,0.5,0.75\}$: 先给四分之一, 还是全错就给一半, 再给四分之三. 提示模板是一句固定引导语加 hint 正文 (原文 Figure 3). 前 $N=20$ 步可选冷启动, 关掉检测先跑原版 GRPO, 避免模型连格式都还不会时几乎每题都被判难.

目标函数仍是 GRPO 的 token clip 加组相对优势, 比率在 $q^*$ 上计算 (原文式 (4) 至 (6)). 这里掺入的是数据集里已有的标准解文本, 没有外挂教师模型; OPD 则要教师在学生前缀上给出分布.

### 5.2 设置与结果

**设置**: 奖励由规则正确性 ($+1/0$) 和格式 ($+1/0$) 组成, 权重 2:1. 训练学习率 $1\times10^{-6}$, cosine 调度, 10% warmup; batch 112, 每题 8 条, 8 步梯度累积; 温度 1.0, 最长 2048; 无 KL. 评测用 Lighteval, 温度 0.0 或 1.0 (随基准), 最长 4096, 不加 hint; 多数基准报 pass@1, AIME2024 报 avg@32.

Table 1, 训练数据 Math3to5 (MATH Level 3 至 5, 8890 题), AVG 是六项算术平均:

| 模型 | AIME24 | MATH-500 | OlympiadBench | AMC23 | Minerva | GPQA-D | AVG |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen2.5-Base-7B | 0.098 | 0.694 | 0.340 | 0.400 | 0.195 | 0.217 | 0.324 |
| Qwen2.5-7B-GRPO | 0.131 | 0.752 | 0.408 | 0.475 | 0.312 | 0.308 | 0.398 |
| Qwen2.5-7B-GHPO | 0.133 | 0.786 | 0.415 | 0.575 | 0.346 | 0.394 | 0.442 |

均分 0.398 到 0.442, 涨 4.4 个百分点, 摘要里的「约 5%」是这个数的约数. AMC23 0.475 到 0.575, GPQA-Diamond 0.308 到 0.394, AIME24 几乎不动.

Table 2 换成更难的混合数据 NuminaMath-S (18300 题, 由 Math3to5, OlympiadBench, AMC 组成):

| 模型 | AIME24 | MATH-500 | OlympiadBench | AMC23 | Minerva | GPQA-D | AVG |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen2.5-7B-GRPO | 0.122 | 0.774 | 0.396 | 0.525 | 0.283 | 0.353 | 0.409 |
| Qwen2.5-7B-GRPO-CL | 0.112 | 0.774 | 0.395 | 0.550 | 0.335 | 0.323 | 0.415 |
| Qwen2.5-7B-GRPO-CL-H(0.5) | 0.152 | 0.774 | 0.389 | 0.550 | 0.331 | 0.338 | 0.422 |
| Qwen2.5-7B-GHPO | 0.163 | 0.776 | 0.389 | 0.575 | 0.342 | 0.404 | 0.442 |
| Qwen2.5-Math-7B-GRPO | 0.2698 | 0.81 | 0.4481 | 0.625 | 0.3456 | 0.3384 | 0.4728 |
| Qwen2.5-Math-7B-GHPO | 0.3198 | 0.822 | 0.4525 | 0.7 | 0.3824 | 0.3687 | 0.5076 |

AIME24 从 0.122 到 0.163. 课程学习 GRPO-CL 均分 0.415, 固定一半 hint 的 CL-H 是 0.422, 都低于自适应 $\omega$ 的 0.442. Math-7B 骨干上 0.4728 到 0.5076. OlympiadBench 上 GHPO 的 0.389 略低于 GRPO 的 0.396.

### 5.3 训练动态与 DAPO 的分工

**训练动态**: Figure 5 显示, 相当长一段训练里, 每个 mini-batch 仍有约 60% 的题被判难, 需要 hint. Figure 6 显示 GHPO 的准确率奖励全程高于 GRPO, 梯度范数更小, 后期平均回复更长.

**和 DAPO 动态采样的分工**: 面对全错组, DAPO 丢掉 prompt, 保证 batch 里每条样本都有非零 $\hat{A}$, 代价是最难的那部分题永远进不了梯度. GHPO 留下 prompt, 补标准解前缀, 让至少一条 rollout 有机会得分, 代价是训练分布里掺了标准解前缀, 和推理时无 hint 的输入不一致. 所以评测必须关 hint, $\omega$ 也要按需逐步加长; 固定 0.5 的 CL-H 比自适应版低 2 个百分点.

**失效**: $\omega$ 过大时, 难题上的训练接近对标准解做 SFT. 数据集没有完整标准解时, 式 (15) 无从实施.

## 6. Dr.GRPO, CISPO 与失效对照

### 6.1 Dr.GRPO: 去掉两个归一

**Dr.GRPO** (Liu 等, *Understanding R1-Zero-Like Training: A Critical Perspective*, arXiv:2503.20783) 在奖励侧拆掉式 (6) 和式 (5) 中的两个归一. 除以 $|o_i|$ 带来长度偏差: 正优势时短回答的每个 token 更新更大, 负优势时长回答的每个 token 罚得更轻, 错误回答于是越写越长. 除以组内 $\mathrm{std}$ 带来难度偏差: 几乎全对或几乎全错的题, 标准差小, 权重反而被放大. 去掉两项后用常数归一, 梯度与 RLOO 同形.

论文给出的最小配方是 Oat-Zero-7B: Qwen2.5-Math-7B, MATH Level 3 至 5, Qwen-Math 模板, 8 张 A100 约 27 小时; Table 4 五科均分 51.4 (AIME24 43.3, AMC 62.7, MATH500 80.0, Minerva 30.1, OlympiadBench 41.0), 生成上限 3000. 推导和实验细节见 [02 DrGRPO](../02-DrGRPO-去标准差/02-DrGRPO-去标准差.md). 这组数字和 GMPO Table 1 的 52.7 来自不同论文的不同设置.

### 6.2 CISPO: 只 clip 权重

**CISPO** (Clipped IS-weight Policy Optimization) 出自 MiniMax-M1 (arXiv:2506.13585). 他们的设定是每批 rollout 做 16 轮 off-policy 更新. 此时 GRPO 和 DAPO 的做法, 即比率越出 clip 带就丢掉该 token 的梯度, 会把一些对长 CoT 关键的低概率 token (比如表示反思转折的词) 整批抹掉, 熵也稳不住. CISPO 把 clip 加在重要性权重上, 并对权重做 stop-gradient, 梯度仍从 $\log\pi_{\theta}$ 走:

$$
\hat{r}_{i,t}(\theta)=\mathrm{clip}\bigl(r_{i,t}(\theta),\,1-\varepsilon_{\mathrm{low}}^{\mathrm{IS}},\,1+\varepsilon_{\mathrm{high}}^{\mathrm{IS}}\bigr),\qquad
\mathcal{J}_{\mathrm{CISPO}}\propto \mathrm{sg}(\hat{r}_{i,t})\,\hat{A}_{i,t}\,\log\pi_{\theta}(o_{i,t}\mid q,o_{i,<t}). \tag{16}
$$

$\mathrm{sg}(\cdot)$ 是 stop-gradient. 不做权重 clip 时退回普通的重要性加权策略梯度. 实验中他们把 $\varepsilon_{\mathrm{low}}^{\mathrm{IS}}$ 设得很大, 相当于不设下界, 只调上界; 优势用 GRPO 组相对, 损失用 token 级分母, 沿用 DAPO 的动态采样与长度惩罚, 不加 KL. 在 Qwen2.5-32B-base 的受控对比中, CISPO 用 DAPO 50% 的步数达到 DAPO 的 AIME 2024 成绩, 相当于 2 倍加速 (Figure 2). 单篇见 [03-CISPO](../03-CISPO-裁剪重要性权重/03-CISPO-裁剪重要性权重.md).

### 6.3 失效对照

下表把前面各节提到的失效情形按落点汇总. 同一个现象常有不止一种处理, 比如全错组, DAPO 丢掉, GHPO 改 prompt, 选哪种要看数据集里有没有完整标准解. 处理一栏里的代价也要一起看: 放宽 clip 换来探索, 也换来更大的更新方差.

| 现象 | 落在哪一侧 | 处理 |
| --- | --- | --- |
| 组内全对或全错 | 奖励侧式 (5) 退化 | DAPO 丢组; GHPO 补前缀; 不处理则梯度为零 |
| 熵崩塌, 过早确定 | 轨迹侧对称上界 | Clip-Higher 放宽上界; 放宽下界会塌掉采样空间 |
| 长 CoT 重复, 胡写 | 样本级 $\frac1G\sum_i\frac{1}{\lvert o_i\rvert}$ | DAPO 用 token 级分母; Dr.GRPO 去掉长度归一, 动机是无偏 |
| MoE 一次更新换约 10% 专家 | 轨迹侧 token 级比率 | GSPO 用序列似然; GRPO 要 Routing Replay |
| 比率离群把更新拉飞 | 轨迹侧算术平均 | GMPO 几何平均, 单科仍可能下降 |
| 标准解泄漏进评测 | GHPO 的 $q^*$ | 评测关 hint; $\omega$ 过大近似 SFT |
| 多轮 off-policy 更新抹掉关键 token | 轨迹侧丢梯度式 clip | CISPO 只 clip 权重, 保留梯度 |
| 没有可解析答案 | DAPO 规则奖励的前提 | DAPO-Math-17K 把答案改成整数 |

## 参考文献

1. Shen, Luo, Li, et al. *A First-Principles Derivation of LLM Policy Optimization: From Expected Reward to GRPO and Its Structural Extensions*. [arXiv:2606.16733](https://arxiv.org/abs/2606.16733). 期望回报 $J(\theta)$ 的两侧分解, §9.1 OPD 与 DPO 边界.
2. Shao, Wang, Zhu, et al. *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. [arXiv:2402.03300](https://arxiv.org/abs/2402.03300). GRPO 式 (3), Table 5, Figure 7.
3. Yu, Zhang, Zhu, et al. *DAPO: An Open-Source LLM Reinforcement Learning System at Scale*. [arXiv:2503.14476](https://arxiv.org/abs/2503.14476). 式 (10) 至 (13), Table 1.
4. Zheng, Liu, Li, et al. *Group Sequence Policy Optimization*. [arXiv:2507.18071](https://arxiv.org/abs/2507.18071). 式 (5)(7)(13)(14), §5.
5. Zhao, Liu, et al. *Geometric-Mean Policy Optimization*. [arXiv:2507.20673](https://arxiv.org/abs/2507.20673). Table 1, Table 2.
6. Liu, Gong, et al. *GHPO: Adaptive Guidance for Stable and Efficient LLM Reinforcement Learning*. [arXiv:2507.10628](https://arxiv.org/abs/2507.10628). 式 (4) 至 (6), Table 1, Table 2, Figure 5, Figure 6.
7. Liu, Chen, Li, et al. *Understanding R1-Zero-Like Training: A Critical Perspective*. [arXiv:2503.20783](https://arxiv.org/abs/2503.20783). Dr.GRPO, Table 4.
8. MiniMax. *MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention*. [arXiv:2506.13585](https://arxiv.org/abs/2506.13585). CISPO, Figure 2.
