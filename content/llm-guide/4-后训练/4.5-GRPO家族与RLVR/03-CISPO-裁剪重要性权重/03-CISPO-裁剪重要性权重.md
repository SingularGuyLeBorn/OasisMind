---
title: "03 · CISPO: 裁剪重要性权重"
published: true
tags: ["CISPO", "GRPO", "DAPO", "PPO", "MiniMax-M1", "重要性采样"]
excerpt: "CISPO 来自 MiniMax-M1 技术报告. 它把 PPO 和 GRPO 对 token 更新的裁剪, 换成对重要性权重本身的裁剪, 权重做 stop-gradient, 梯度只经过 log 概率, 超出区间的 token 仍然参与更新. 在 Qwen2.5-32B-base 的对照实验中, CISPO 用 DAPO 一半的训练步数达到 DAPO 的 AIME 2024 成绩."
---

# CISPO: 裁剪重要性权重

> 相关阅读: [04 PPO](../../4.4-强化学习基础/04-PPO/04-PPO.md) · [01 GRPO](../01-GRPO/01-GRPO.md) · [04 GSPO](../04-GSPO/04-GSPO.md) · [06 SAPO](../06-SAPO-温度软门/06-SAPO-温度软门.md) · [4.5 GRPO 家族与 RLVR](../4.5-GRPO家族与RLVR.md)

材料是 MiniMax-M1 技术报告 (*MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention*, arXiv:2506.13585) 的 §3.1, CISPO 全称 Clipped IS-weight Policy Optimization. 问题是同一批 rollout 要更新多轮时, PPO/GRPO 的裁剪会让一部分 token 失去梯度.

## 问题: 多轮离策略更新中, 反思 token 被裁掉

### PPO 和 GRPO 的目标

对数据集 $\mathcal{D}$ 中的问题 $q$, 旧策略 $\pi_{\theta_{old}}$ 生成回复 $o_i$. PPO 的目标 (论文式 (1)):

$$
\mathcal{J}_{\mathrm{PPO}}(\theta)=\mathbb{E}_{q\sim\mathcal{D},\ o_i\sim\pi_{\theta_{old}}(\cdot\mid q)}\Biggl[\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}\min\Bigl(r_{i,t}(\theta)\hat A_{i,t},\ \mathrm{clip}\bigl(r_{i,t}(\theta),1-\epsilon,1+\epsilon\bigr)\hat A_{i,t}\Bigr)-\beta D_{\mathrm{KL}}(\pi_\theta\|\pi_{\mathrm{ref}})\Biggr]
\tag{1}
$$

其中

$$
r_{i,t}(\theta)=\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}\mid q,o_{i,<t})}
\tag{2}
$$

是重要性采样 (IS) 权重. 轨迹由 $\pi_{\theta_{old}}$ 收集, 再按 mini-batch 分多步更新策略, 这个权重用来修正采样分布和当前分布的差别. PPO 需要价值模型来算优势; GRPO 去掉价值模型, 用同一问题 $G$ 条回复的相对奖励作优势 (论文式 (2)):

$$
\hat A_{i,t}=\frac{R_i-\mathrm{mean}\bigl(\{R_j\}_{j=1}^{G}\bigr)}{\mathrm{std}\bigl(\{R_j\}_{j=1}^{G}\bigr)}
\tag{3}
$$

$R_i$ 可以来自规则校验器 (例如数学题判对错), 也可以来自奖励模型. 结果监督下, 同一条回复的所有 token 共享一个 $\hat A$.

**论文观察到的现象**

MiniMax 在混合注意力架构 (带 lightning attention 的 MoE 模型) 上做 zero-RL 的早期实验里, GRPO 损害了训练效果, 也没能促成长 CoT 推理行为的出现. 经过一系列受控消融, 作者把主要原因定位到 PPO/GRPO 损失里的裁剪操作.

具体机制是: 与反思行为相关的 token (例如 However, Recheck, Wait, Aha) 常常是推理路径上的分叉点, 它们在基座模型中出现得少, 概率低. 策略更新时, 这些 token 的 $r_{i,t}$ 容易变大. 结果是它们在第一次 on-policy 更新之后就被裁掉, 后面的离策略更新步里不再贡献梯度. 这个问题在混合架构模型上尤其明显. 论文引用 Cui 等 2025 和 Wang 等 2025 指出, 这类低概率 token 对稳定熵和扩展 RL 很重要.

训练设定放大了这个问题: 每生成一批数据, 要做 16 轮离策略更新. 第一轮时 $\pi_\theta=\pi_{\theta_{old}}$, 所有 $r=1$. 某个反思 token 的概率一旦被推高, 分母还是采样时的小概率, 后面每一轮 $r$ 只会更大, 一直落在区间外. DAPO 把裁剪上界调高 (Clip-Higher, Yu 等 2025) 来缓解, 作者发现在 16 轮更新的设定下效果不够.

**为什么低概率 token 先越界**

同样幅度的参数更新, 低概率 token 的比率变化更大. 看最简单的情形: 只有 token $v$ 的 logit 增加 $\delta$, 其余 logit 不变. 设更新前它的概率是 $p$, 更新后的概率是 $p'=p\,e^{\delta}/(1-p+p\,e^{\delta})$, 比率 $r=p'/p=e^{\delta}/(1-p+p\,e^{\delta})$. $p\to0$ 时 $r\to e^{\delta}$; $p\to1$ 时 $r\to1$. 取 $\delta=0.5$: $p=0.01$ 时 $r\approx1.638$, 已经远超 $1.2$; $p=0.9$ 时 $r\approx1.041$, 还在区间内. 另一方面, $\log\pi_v$ 对自身 logit 的梯度是 $1-p$, 正优势推高 $v$ 时, 低概率 token 的 logit 本来就被推得更多. 两个因素叠加, 区间外的 token 集中在低概率的那一端, 也就是论文说的反思 token 所在的位置.

这个算例还说明另一点: 如果每批 rollout 只做一次梯度更新, 更新时 $\pi_\theta=\pi_{\theta_{old}}$, 所有 $r=1$, PPO, GRPO, CISPO 的梯度完全相同. 三者的差别只出现在同一批数据的第二轮及以后的更新里. 论文的 16 轮设定让这部分更新占了大多数.

**先看 PPO 的梯度**

被裁掉为什么等于没有梯度, 要从式 (1) 的导数看. 比率对参数的导数是

$$
\nabla_\theta r_{i,t}=r_{i,t}\,\nabla_\theta\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})
\tag{4}
$$

所以未裁剪项 $r\hat A$ 的梯度是 $r\hat A\,\nabla\log\pi_\theta$. 裁剪项 $\mathrm{clip}(r,1-\epsilon,1+\epsilon)\hat A$ 在 $r$ 落到区间外时是常数, 梯度为 0. $\min$ 选中哪一项, 这个 token 就得到哪一项的梯度. 按优势符号和比率位置分四种情形 (区间内两项相等, 梯度都是 $r\hat A\nabla\log\pi_\theta$):

| 情形 | $\min$ 选中 | PPO 中该 token 的梯度 |
|---|---|---|
| $\hat A>0$, $r>1+\epsilon$ | 裁剪项 (常数) | $0$ |
| $\hat A>0$, $r<1-\epsilon$ | 未裁剪项 | $r\hat A\,\nabla\log\pi_\theta$ |
| $\hat A<0$, $r<1-\epsilon$ | 裁剪项 (常数) | $0$ |
| $\hat A<0$, $r>1+\epsilon$ | 未裁剪项 | $r\hat A\,\nabla\log\pi_\theta$, $r$ 无上限 |

第一行就是反思 token 的情形: 回复得到正优势, 反思 token 的概率已经被推高, $r>1+\epsilon$, 梯度为 0. 16 轮更新里, 只要它在第一轮之后越过上界, 剩下的轮次都对它没有作用. 第四行是另一个方向的问题: 负优势的回复里, 某个 token 的概率被意外推高, PPO 不限制它的系数. 这一行常被另外处理, 例如 dual-clip PPO (Ye 等 2020) 给它加了一个上界.

**CISPO 的目标**

### 从带重要性权重的 REINFORCE 出发

离线更新时, 修正了分布的 REINFORCE 目标是 (论文式 (3)):

$$
\mathcal{J}_{\mathrm{REINFORCE}}(\theta)=\mathbb{E}_{(q,a)\sim\mathcal{D},\ o_i\sim\pi_{\theta_{old}}(\cdot\mid q)}\Biggl[\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}\mathrm{sg}\bigl(r_{i,t}(\theta)\bigr)\hat A_{i,t}\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})\Biggr]
\tag{5}
$$

$\mathrm{sg}(\cdot)$ 是 stop-gradient, 对应代码里的 `detach`. 权重当作常数, 梯度只经过 $\log\pi_\theta$. 对比式 (4) 可以看到, 式 (5) 中每个 token 的梯度 $r\hat A\nabla\log\pi_\theta$, 与 PPO 未裁剪项 $r\hat A$ 的梯度完全一样. 两者只是写法不同, 在当前参数处的梯度相同.

PPO/GRPO 裁的是 token 的更新, CISPO 改为裁式 (5) 里的权重. 裁剪后的权重 (论文式 (5)):

$$
\hat r_{i,t}(\theta)=\mathrm{clip}\bigl(r_{i,t}(\theta),\ 1-\epsilon^{IS}_{low},\ 1+\epsilon^{IS}_{high}\bigr)
\tag{6}
$$

采用 GRPO 的组内相对优势和 token 级损失 (Yu 等 2025; Liu 等 2025), CISPO 的目标是 (论文式 (4)):

$$
\mathcal{J}_{\mathrm{CISPO}}(\theta)=\mathbb{E}_{(q,a)\sim\mathcal{D},\ \{o_i\}_{i=1}^{G}\sim\pi_{\theta_{old}}(\cdot\mid q)}\Biggl[\frac{1}{\sum_{i=1}^{G}|o_i|}\sum_{i=1}^{G}\sum_{t=1}^{|o_i|}\mathrm{sg}\bigl(\hat r_{i,t}(\theta)\bigr)\hat A_{i,t}\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})\Biggr]
\tag{7}
$$

不裁权重时, 式 (7) 退化为标准的策略梯度目标. 论文实验中把 $\epsilon^{IS}_{low}$ 设得很大, 等于不设下界, 只调 $\epsilon^{IS}_{high}$.

**四种情形下的梯度**

不设下界时, $\hat r=\min(r,1+\epsilon^{IS}_{high})$. 代入式 (7), 每个 token 的梯度是 $\hat r\hat A\nabla\log\pi_\theta$. 和1.4 节的表并排:

| 情形 | PPO | CISPO |
|---|---|---|
| 区间内 | $r\hat A\,\nabla\log\pi_\theta$ | $r\hat A\,\nabla\log\pi_\theta$ |
| $\hat A>0$, $r>1+\epsilon$ | $0$ | $(1+\epsilon^{IS}_{high})\hat A\,\nabla\log\pi_\theta$ |
| $\hat A>0$, $r<1-\epsilon$ | $r\hat A\,\nabla\log\pi_\theta$ | $r\hat A\,\nabla\log\pi_\theta$ |
| $\hat A<0$, $r<1-\epsilon$ | $0$ | $r\hat A\,\nabla\log\pi_\theta$ |
| $\hat A<0$, $r>1+\epsilon$ | $r\hat A\,\nabla\log\pi_\theta$ | $(1+\epsilon^{IS}_{high})\hat A\,\nabla\log\pi_\theta$ |

(为了对齐, 表中把 PPO 的 $\epsilon$ 和 CISPO 的 $\epsilon^{IS}_{high}$ 放在同一位置比较, 实际两者可以取不同的值.)

五行里有两行完全相同. 区别在三行:

- 第二行是论文关心的情形. 正优势的反思 token 比率超过上界后, PPO 不再更新它; CISPO 继续以封顶的系数推高它的概率.
- 第四行, 负优势且比率已经很小. PPO 不再压低这个 token; CISPO 继续压, 力度按 $r$ 缩小. 比率越小, 这个 token 在当前策略下已经越不可能, 系数也越小.
- 第五行, 负优势且比率很大. PPO 的系数随 $r$ 无界增长; CISPO 把它封在 $1+\epsilon^{IS}_{high}$.

所以 CISPO 在 PPO 的基础上做了两件事: 区间外不再丢 token; 所有 token 的系数都不超过 $1+\epsilon^{IS}_{high}$. 论文承认, 因为裁了权重, 式 (7) 的梯度略有偏差; 换来的是所有 token 都保留梯度贡献, 尤其是长回复里的 token. 作者报告这样做降低了方差, 训练更稳.

**一个数值例**

取 $\hat A=+1$, PPO 的 $\epsilon=0.2$, CISPO 的上界也取 $1.2$ (这里只为演示, 论文没有给 $\epsilon^{IS}_{high}$ 的值). 某个反思 token 的 $r=1.8$.

- PPO: 未裁剪项 $1.8$, 裁剪项 $1.2$, $\min$ 选 $1.2$, 是常数, 梯度为 0.
- CISPO: $\hat r=1.2$, 目标项为 $1.2\cdot\log\pi_\theta$, 梯度 $1.2\,\nabla\log\pi_\theta$.

再取 $\hat A=-1$, $r=0.3$.

- PPO: 未裁剪项 $0.3\times(-1)=-0.3$, 裁剪项 $0.8\times(-1)=-0.8$, $\min$ 选 $-0.8$, 是常数, 梯度为 0.
- CISPO (无下界): $\hat r=0.3$, 梯度 $-0.3\,\nabla\log\pi_\theta$.

最终取 $\hat A=-1$, $r=5$.

- PPO: 未裁剪项 $-5$, 裁剪项 $-1.2$, $\min$ 选 $-5$, 梯度 $-5\,\nabla\log\pi_\theta$.
- CISPO: $\hat r=1.2$, 梯度 $-1.2\,\nabla\log\pi_\theta$.

**放弃信任域的代价**

论文引言说 CISPO 放弃了信任域约束, 改为裁剪重要性权重来稳定训练. 这一点可以用 16 轮更新算一遍. 设某个反思 token 在 $\pi_{\theta_{old}}$ 下概率 $p=0.01$, 每轮更新让它的 logit 增加 $0.1$ (只为演示). 按 1.3 节的近似, 第 $k$ 轮之后 $r\approx e^{0.1k}$.

- PPO, $\epsilon=0.2$: 两轮之后 $r\approx e^{0.2}=1.221$, 越过上界. 第 3 轮到第 16 轮, 这个 token 都没有梯度, $r$ 停在 $1.22$ 附近, 概率约 $0.0122$.
- CISPO, 上界也取 $1.2$: 每轮都继续推. 16 轮后 logit 共增加 $1.6$, 按 1.3 节的精确式 $r=e^{1.6}/(0.99+0.01e^{1.6})\approx4.77$, 概率约 $0.048$.

同一批数据上, PPO 把这个 token 的概率变化限制在约 22%, CISPO 让它涨到约 4.8 倍. 前者是信任域在起作用, 后者是论文想要的效果: 反思 token 在一批数据内就能被明显推高. 代价也在这里: 对一个错误的正优势 (例如答案碰巧正确的回复), CISPO 同样会在 16 轮里把相关 token 推得很远. 系数封顶只限制了每一步的幅度, 不限制多步累积的幅度. 4.3 节里, 长度扩展后期要同时调小梯度裁剪阈值和 $\epsilon^{IS}_{high}$, 也和这个性质有关.

![PPO/GRPO 的 min-clip 丢掉梯度, CISPO 对 r 裁剪后 sg, 梯度仍走 log π](./images/fig-cispo-clip-is-weight.png)

**图 1 解析**

- 上栏是 PPO/GRPO: 由 $r_t=\pi_\theta/\pi_{old}$ 进入 $\min(rA,\mathrm{clip}(r)A)$, 超出区间的 token 用虚线连到紫框, 标注 $\nabla=0$, 表示该位置的策略梯度被去掉, 奖励本身还在优势里.
- 下栏是 CISPO: $r_t$ 先裁成 $\hat r$, 再做 $\mathrm{sg}(\hat r)$, 目标是 $\mathrm{sg}(\hat r)\hat A\log\pi_\theta$, 标注所有 token 保留 $\nabla\log\pi$.
- 两栏的起点相同, 差别只在裁剪作用在哪里, 对应 2.2 节表格的第二, 四行.

### 其他配置

- **损失归一化.** 式 (7) 的分母是一组回复的 token 总数 $\sum_i|o_i|$, 每个 token 权重相同. 式 (1) 和式 (5) 先对每条回复除以 $|o_i|$, 短回复的每个 token 权重更大.
- **动态采样和长度惩罚.** 沿用 DAPO 的做法: 动态采样过滤掉组内全对或全错的题 (这时式 (3) 的分子全为 0), 长度惩罚压制超长回复.
- **无 KL.** 与 DAPO 和 Open-Reasoner-Zero (Hu 等 2025) 一样, CISPO 不加 KL 项.

前两项都会改变每个 token 实际拿到的权重, 用一组两条回复就能算出来. 设 $G=2$, 一条回复 100 个 token, 另一条 1000 个 token. 按式 (1) 的写法, 先对每条回复取 token 平均, 再对两条取平均, 短回复的每个 token 权重是 $1/(2\times100)=1/200$, 长回复是 $1/2000$, 差 10 倍; 两条回复各占总权重的一半. 按式 (7), 每个 token 的权重都是 $1/1100$, 长回复占总权重的 $1000/1100\approx91\%$. 长 CoT 训练里, 回复越长, 它的 token 在式 (7) 下分到的总梯度越多, 不会因为长度被稀释. 动态采样处理的是式 (3) 的另一个边界: 组内 $G$ 条全对或全错时, 分子 $R_i-\mathrm{mean}$ 全为 0, 分母 $\mathrm{std}$ 也为 0, 这组题既算不出有意义的优势, 也不贡献梯度, 留在 batch 里只会让有效样本数变少.

## 和其他目标的联系

### 与截断重要性采样的关系

把重要性权重截断来换取更小的方差, 在统计和 RL 文献里早有先例. Ionides 2008 研究了截断重要性采样: 权重的尾部很重时, 截断会引入偏差, 但方差有界. IMPALA (Espeholt 等 2018) 的 V-trace 在策略梯度项里用截断后的权重 $\rho_s=\min\bigl(\bar\rho,\ \pi(a_s\mid x_s)/\mu(a_s\mid x_s)\bigr)$ 乘 $\nabla\log\pi(a_s\mid x_s)$ 和优势估计, $\mu$ 是行为策略. 这个形式和式 (7) 一致: 只截上界, 截断后的权重当作系数, 梯度经过 $\log\pi$.

两者的场景不同. IMPALA 处理的是分布式 actor 和 learner 之间的策略滞后; CISPO 处理的是同一批 rollout 上的 16 轮更新, 以及 PPO 裁剪对低概率 token 的副作用. MiniMax 的论文没有讨论这层联系, 这里列出来是为了说明式 (7) 的偏差性质: 权重被截断的 token, 梯度被低估, 估计偏向「少更新这些 token」; 没有被截断的 token 不受影响.

方差这一侧也可以直接写出来. 每个 token 的梯度贡献是 $\hat r\hat A\nabla\log\pi_\theta$, 不设下界时 $0\le\hat r\le1+\epsilon^{IS}_{high}$, 所以每个 token 的梯度范数不超过 $(1+\epsilon^{IS}_{high})\,|\hat A_{i,t}|\,\|\nabla_\theta\log\pi_\theta(o_{i,t}\mid\cdot)\|$. 不裁剪时 $r$ 没有上界, 16 轮更新后少数 token 的 $r$ 可以很大, 单个 token 就可能主导整批梯度. 裁剪把每个 token 的影响限制在未加权梯度的 $1+\epsilon^{IS}_{high}$ 倍以内. PPO 的裁剪也限制了正优势一侧的影响, 方式是把系数直接置零; 负优势, 大比率的那一侧它不限制 (1.4 节表格第四行).

### 统一形式: 用掩码控制是否丢弃 token

论文还给出一个带 token 掩码的统一目标, 用超参控制在哪些条件下丢弃哪些 token 的梯度 (论文式 (6)):

$$
\mathcal{J}_{\mathrm{unify}}(\theta)=\mathbb{E}\Biggl[\frac{1}{\sum_{i=1}^{G}|o_i|}\sum_{i=1}^{G}\sum_{t=1}^{|o_i|}\mathrm{sg}\bigl(\hat r_{i,t}(\theta)\bigr)\hat A_{i,t}\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})\,M_{i,t}\Biggr]
\tag{8}
$$

掩码与 PPO 信任域里隐含的掩码等价 (论文式 (7)):

$$
M_{i,t}=\begin{cases}
0, & \hat A_{i,t}>0\ \text{且}\ r_{i,t}(\theta)>1+\epsilon_{high}\\
0, & \hat A_{i,t}<0\ \text{且}\ r_{i,t}(\theta)<1-\epsilon_{low}\\
1, & \text{其他}
\end{cases}
\tag{9}
$$

两种特例可以从式 (8) 读出来:

- 所有 $M_{i,t}=1$, 就是 CISPO.
- $M$ 取式 (9), 并且不裁权重 ($\hat r=r$). 这时每个 token 的梯度是 $M\cdot r\hat A\nabla\log\pi_\theta$, 和1.4 节 PPO 表格的四行逐一相同. 也就是说, 在 token 级归一化下, 式 (8) 可以还原 PPO 的梯度.

在两者之间还可以有其他组合, 例如保留式 (9) 的掩码, 同时用 $\hat r$ 给第五种情形封顶. 论文只说统一形式可以表示不同的裁剪策略, 实验用的是 CISPO.

**stop-gradient 不能省.** 如果不对 $\hat r$ 做 stop-gradient, 在区间内, 目标项 $r\hat A\log\pi_\theta$ 对 $\theta$ 的导数会多出一项 $r\hat A\log\pi_\theta\cdot\nabla\log\pi_\theta$ (由式 (4) 得到), 这一项的大小取决于 $\log\pi_\theta$ 的数值, 没有意义; 在区间外, $\hat r$ 是常数, 又和 stop-gradient 一样. 只有加了 stop-gradient, 梯度才是式 (5) 那种重要性加权的策略梯度.

## 实验

### 受控对比

论文在 zero-RL 设定下 (不经 SFT, 直接对基座模型做 RL) 比较 CISPO, DAPO 和 GRPO: 用 Yu 等 2025 (DAPO) 的数学推理数据训练 Qwen2.5-32B-base, 在 AIME 2024 上报告成绩 (Figure 2). 相同训练步数下 CISPO 明显高于 DAPO 和 GRPO; CISPO 用 50% 的训练步数达到 DAPO 的成绩. 论文引言把这个结果写成相对 DAPO 2 倍的加速. 论文正文没有用表格给出 Figure 2 曲线的具体数值.

这组对比里, 数据和基座相同, 三种方法的差别集中在目标函数上. 按 1.3 节的算例, 每批 rollout 的第一轮更新里所有 $r=1$, 三者梯度相同, Figure 2 的差距只能来自同一批数据后面几轮如何处理越界的 token. GRPO 用对称区间; DAPO 把上界调高 (Clip-Higher), 并加上动态采样和 token 级损失; CISPO 沿用 DAPO 的后两项 (2.5 节), 只把裁剪换成式 (6). 所以 CISPO 和 DAPO 的那一段差距, 主要可以归到「越界 token 还有没有梯度」这一处, 也就是 2.2 节表格的第二, 四行. 「2 倍加速」是按训练步数算的, 论文没有给这组对比的墙钟时间.

**在 MiniMax-M1 训练中的使用**

MiniMax-M1 基于 MiniMax-Text-01, 是混合 MoE 架构, 总参数 456B, 每个 token 激活 45.9B, 使用 lightning attention. 摘要称, 混合注意力和 CISPO 结合, 让 M1 的完整 RL 训练在 512 张 H800 上三周完成, 租用成本 534,700 美元 (引言写约 0.53M 美元). 这是整套训练的成本, 包含架构带来的推理效率, 不能全部归到 CISPO 上.

同一节 (§3.2) 还记录了几个与 CISPO 无关, 但影响 RL 能否收敛的工程问题:

- **训练和推理的精度不一致.** rollout 时 token 的概率在训练模式和推理模式下差别明显, 奖励涨不上去. 逐层分析定位到输出层 LM head 的大幅激活. 把 LM head 改成 FP32 后, 两种模式下概率的相关系数从约 0.9x 提到 0.99x. 小的稠密 softmax attention 模型没有出现这个问题.
- **优化器超参.** AdamW 用 VeRL 默认的 betas $(0.9,0.999)$, eps $10^{-8}$ 会不收敛. M1 训练中梯度幅度从 $10^{-18}$ 到 $10^{-5}$, 大部分小于 $10^{-14}$, 相邻迭代的梯度相关性弱. 最终取 $\beta_1=0.9$, $\beta_2=0.95$, eps $10^{-15}$.
- **重复检测提前截断.** 复杂 prompt 会引出很长的重复回复, 梯度很大, 威胁稳定性. 规则是: 连续 3000 个 token 的概率都高于 0.99 时停止生成.

**数据和课程 (§4).** M1 的 RL 数据分两类. 规则可校验的: 数学约 50K 条 (用强推理模型算 pass@10, 只留通过率严格介于 0 和 0.9 之间的题), 逻辑推理约 53K 条 (41 类任务, 用 SynLogic 框架合成), 竞赛编程 30K 条, 软件工程几千条 (在容器沙箱里跑测试用例给奖励). 需要奖励模型的通用任务共 25K 条, 由生成式奖励模型打分; 没有标准答案的任务和参考回答两两比较, 得分取 $-1$, $0$, $1$. 用 CISPO 训练时先只用规则奖励的推理任务, 再逐步混入通用任务. 所以 CISPO 面对的奖励既有规则校验的对错, 也有奖励模型的分级打分.

奖励模型一侧有长度偏差 (§4.2.2): 生成式奖励模型偏好更长的回复, 不管推理质量如何. 离线手段 (训练数据覆盖更多长度和来源, 加对抗样本, 改模型结构) 没能阻止 RL 训练中出现长度投机. 最终做法是训练中在线监控: 回复长度上涨而任务成功率和推理深度没有提升时, 立即重新校准奖励模型; RL 一侧再配合奖励整形和归一化, 降低奖励对长度这类表面特征的敏感度.

**扩展生成长度时的调整**

M1 的第一次 RL 输出长度上限是 40K, 之后分阶段扩到 48K, 56K, 64K, 72K, 80K (§5). 是否进入下一阶段, 看生成序列的困惑度是否收敛, 以及输出长度的 99 分位是否接近当前窗口上限.

扩展过程中, 每个长度窗口的训练后期都出现模式坍塌: 生成序列的后半段变成不连贯或乱码的文本, 同时困惑度上升. 作者给出的原因是: 扩展长度时, 负样本变长的速度比正样本快得多, 更早碰到窗口上限, 序列后段累积了不成比例的负梯度. 这种不平衡来自 GRPO 优势归一化和 token 级损失. 处理办法有三条:

1. 检测重复模式 (连续高概率 token) 并提前停止, 避免重复回复占满窗口.
2. 把样本级损失和 token 级归一化结合, 缓解正负样本的不平衡.
3. 同时降低梯度裁剪阈值和 $\epsilon^{IS}_{high}$.

第 3 条说明 $\epsilon^{IS}_{high}$ 并非越大越好. 上界太宽时, 被保留的 token 系数也可以很大, 长序列上的累积更新仍然会过猛.

### 实现与相邻方法

**实现**

`log_prob`, `old_log_prob`, `advantages`, `response_mask` 形状都是 $[B,T]$, 结果监督下 `advantages` 是式 (3) 的值广播到每个 token. 下面把式 (6) 和式 (7) 写成 PyTorch:

```python
import torch

def cispo_loss(log_prob, old_log_prob, advantages, response_mask, eps_high):
    ratio = torch.exp(log_prob - old_log_prob.detach())
    hat_r = torch.clamp(ratio, max=1.0 + eps_high)  # 不设下界
    per_token = hat_r.detach() * advantages * log_prob
    denom = response_mask.sum().clamp_min(1.0)
    return -(per_token * response_mask).sum() / denom

# 同一 token 上与 PPO 未裁剪项的梯度对照
lp = torch.tensor([-2.0], requires_grad=True)
old = torch.tensor([-2.5])
adv = torch.tensor([1.0])
ppo_term = torch.exp(lp - old) * adv
ppo_term.backward()
g_ppo = lp.grad.clone(); lp.grad = None
(torch.exp(lp - old).detach() * adv * lp).backward()
assert torch.allclose(g_ppo, lp.grad)
```

最终几行验证 2.1 节的结论: 不裁剪时, $\mathrm{sg}(r)\hat A\log\pi$ 和 $r\hat A$ 对 log 概率的梯度相同.

**分母.** 设一组只有两条回复: 一条 100 个 token, $\hat A=+1$; 一条 400 个 token, $\hat A=-1$; 暂设 $\hat r=1$. 先按条平均再对组平均时, 短回复每个 token 的权重是 $1/200$, 长回复每个 token 是 $1/800$, 正样本的每个 token 分量是负样本的 4 倍. token 级分母是 500, 每个 token 的权重都是 $1/500$. 4.3 节的模式坍塌说明, token 级归一化也有自己的问题: 负样本更长时, 负梯度的总量更大.

**训练中要记录的量.** 至少记三个: 每轮更新中 $r>1+\epsilon^{IS}_{high}$ 的 token 比例, 按优势正负分开统计; 被截断 token 的平均 $r$; 策略熵. 第一个量随更新轮数上升是正常的, 如果在第一两轮就很高, 说明学习率或上界不合适. 第二个量反映截断丢掉了多少重要性修正, 它越大, 式 (7) 的偏差越大. 熵持续下降而奖励不涨时, 先检查第一个量里正优势那部分是否接近 0: 接近 0 说明大部分 token 都在区间内, 问题不在裁剪.

**数值精度.** 比率在指数域计算, 长序列上 `log_prob - old_log_prob` 的误差会被放大, 4.2 节的 LM head 精度问题就是一个例子. 至少在算比率时用 FP32. `response_mask` 和 EOS 位置不一致时, $|o_i|$ 和分母都会算错.

### 与相邻方法的对照

![GRPO, DAPO, CISPO 三列: 裁剪对象, 是否丢 token, 优势来源](./images/fig-cispo-vs-grpo-dapo.png)

**图 2 解析**

- 三列分别是 GRPO, DAPO, CISPO, 按裁剪对象, 区间外是否丢 token, 优势来源三项比较, 不是训练曲线.
- GRPO 和 DAPO 都在 $\min$ 里裁 token 比率, DAPO 只是抬高了上界, 区间外的 token 仍会被丢掉.
- CISPO 裁的是权重 $r$, 再做 stop-gradient, 不丢 token; 三者都用组内相对优势.

| | GRPO | DAPO | CISPO | GSPO | SAPO |
|---|---|---|---|---|---|
| 比率粒度 | token | token | token | 序列 (几何平均) | 序列或 token |
| 限制方式 | $\min$ 硬裁剪 | $\min$ 硬裁剪, 上界抬高 | 裁权重 + stop-gradient | 对序列比率硬裁剪 | 温度控制的 sigmoid 软门 |
| 区间外 | 梯度为 0 | 梯度为 0 | 系数封顶, 梯度保留 | 整条回复梯度为 0 | 权重平滑衰减 |

损失归一化和 KL 只在前三列之间比: GRPO 先对每条回复按长度平均, DeepSeekMath 把 KL 直接加在损失里; DAPO 和 CISPO 都用 token 级归一化, 都不加 KL.

**DAPO** (Decoupled Clip and Dynamic sAmpling Policy Optimization, Yu 等 2025) 有四项改动: Clip-Higher, 动态采样, token 级损失, 超长回复的奖励整形. CISPO 采用了后三项中的动态采样, token 级损失和长度惩罚, 把 Clip-Higher 换成了对权重的裁剪.

**GSPO** (Zheng 等 2025) 把重要性比率从 token 提到整条回复, 用长度归一化的几何平均 $s_i$, 裁剪也作用在 $s_i$ 上. 一条回复的 $s_i$ 出界, 整条回复都不更新. CISPO 的比率仍在 token 级, 每个 token 都更新, 过大的权重被封顶.

**SAPO** (Gao 等 2025) 用温度控制的 sigmoid 软门代替硬裁剪, 正负优势用不同温度. 它的权重随比率偏离 1 平滑衰减, 远离 1 时梯度趋近 0; CISPO 的系数在上界处截断, 之后保持常数, 不衰减到 0. 取正优势, 比较三种方法乘在 $\hat A\nabla\log\pi_\theta$ 前的系数 (PPO 取 $\epsilon=0.2$, CISPO 上界取 $1.2$, SAPO 取 $\tau=1$, 其系数是 $4\sigma(r-1)(1-\sigma(r-1))\cdot r$, 推导见 [06 SAPO](../06-SAPO-温度软门/06-SAPO-温度软门.md)):

| $r$ | PPO | CISPO | SAPO ($\tau=1$) |
|---|---|---|---|
| $1.0$ | $1.0$ | $1.0$ | $1.0$ |
| $1.5$ | $0$ | $1.2$ | $1.41$ |
| $2.0$ | $0$ | $1.2$ | $1.57$ |
| $5.0$ | $0$ | $1.2$ | $0.35$ |

比率稍大时 SAPO 的系数比 CISPO 还大, 比率很大时降到接近 0; CISPO 在上界之后始终保持 $1.2$. 两种方法都在 $r$ 略超出 PPO 区间时保留梯度, 对极端比率的处理方向相反.

## 失效模式与适用边界

### 常见失效与偏差来源

| 现象 | 原因 | 处理 |
|---|---|---|
| 大量 token 的权重顶在上界 | 多轮更新后策略离 $\pi_{\theta_{old}}$ 很远 | 减少每批的更新轮数, 或收紧 $\epsilon^{IS}_{high}$; 这时重要性修正已经很弱 |
| 长度扩展后期后半段乱码 | 负样本更长, 负梯度在后段累积 | 论文的三条处理 (4.3 节) |
| 组内全对或全错 | 式 (3) 分子为 0, 分母趋近 0 | 动态采样过滤 |
| 照搬 GRPO 的 $\epsilon=0.2$ 作上界 | 论文没有给 $\epsilon^{IS}_{high}$ 的值 | 按自己的验证曲线调 |
| 中间推理错误, 最终答案碰巧正确 | 结果监督下整条回复共享一个 $\hat A$ | CISPO 不改信用分配, 需要过程奖励 |
| MoE 上 token 比率波动大 | 更新前后路由的专家不同 | CISPO 不处理这个问题, 参考 GSPO |

偏差的来源要分清. 权重被截断的 token, 梯度被系统性低估. 每批只更新一两轮时, 大多数 $r$ 都在 1 附近, 截断很少触发, 偏差很小; 论文的 16 轮设定下, 截断触发得更多, 这正是 CISPO 相对 PPO 的收益所在, 也是偏差最大的地方. 论文的判断是, 保留这些 token 的梯度比无偏更重要.

### 什么时候换成 CISPO

判断依据是每批 rollout 上做几轮更新. 只做一轮时 (完全 on-policy), 1.3 节已经说明各方法梯度相同, 换 CISPO 没有收益. 做多轮时, 先统计每轮被 PPO 裁剪的 token 比例, 以及这些 token 的类型: 如果被裁的主要是正优势回复里的低概率 token, 而这些 token 恰好是希望模型学会的行为, CISPO 的改动正好对准这个问题. 如果被裁的比例本来就很低 (RLOO 一文在 RLHF 设定下测到不到 5%), 两者的差别也会很小.

熵方面, 论文说 CISPO 避免丢弃 token, 同时让熵保持在合理范围, 保证探索稳定, 但没有单独给出熵曲线的对比. 它能做到的是让刚冒头的低概率 token 不因裁剪失去梯度; 如果熵在训练早期已经坍塌, 换成 CISPO 不能把它恢复.

**参考文献**

1. MiniMax. *MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention*. arXiv:2506.13585, 2025. §3.1, §3.2, §5, Figure 2.
2. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., Klimov, O. *Proximal Policy Optimization Algorithms*. arXiv:1707.06347, 2017.
3. Shao, Z. 等. *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300, 2024.
4. Yu, Q. 等. *DAPO: An Open-Source LLM Reinforcement Learning System at Scale*. arXiv:2503.14476, 2025.
5. Liu, Z. 等. *Understanding R1-Zero-Like Training: A Critical Perspective*. arXiv:2503.20783, 2025.
6. Hu, J. 等. *Open-Reasoner-Zero: An Open Source Approach to Scaling Up Reinforcement Learning on the Base Model*. arXiv:2503.24290, 2025.
7. Cui, G. 等. *The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models*. arXiv:2505.22617, 2025.
8. Wang, S. 等. *Beyond the 80/20 Rule: High-Entropy Minority Tokens Drive Effective Reinforcement Learning for LLM Reasoning*. arXiv:2506.01939, 2025.
9. Zheng, C. 等. *Group Sequence Policy Optimization*. arXiv:2507.18071, 2025.
10. Gao, C. 等. *Soft Adaptive Policy Optimization*. arXiv:2511.20347, 2025.
11. Ionides, E. L. *Truncated Importance Sampling*. Journal of Computational and Graphical Statistics, 17(2), 295–311, 2008.
12. Espeholt, L. 等. *IMPALA: Scalable Distributed Deep-RL with Importance Weighted Actor-Learner Architectures*. ICML 2018. arXiv:1802.01561.
13. Ye, D. 等. *Mastering Complex Control in MOBA Games with Deep Reinforcement Learning*. AAAI 2020. arXiv:1912.09729.
