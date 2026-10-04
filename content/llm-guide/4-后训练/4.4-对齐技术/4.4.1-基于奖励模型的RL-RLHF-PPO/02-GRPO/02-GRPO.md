---
title: "02 · GRPO: 组内相对优势"
published: true
tags: ["GRPO", "PPO", "RLHF", "DeepSeekMath", "veRL", "HybridFlow", "OpenRLHF"]
excerpt: "GRPO 是 PPO 的变体: 同一道题采 G 条回答, 用组内奖励的均值和标准差做基线, 不再训练与策略同量级的价值网络, KL 从奖励移到损失. DeepSeekMath-Instruct 7B 经 GRPO 后 GSM8K 82.9%→88.2%, MATH 46.8%→51.7%. 后半篇写一轮 GRPO 在 Infer 与 Train 两套引擎之间怎么走."
---
# 02 GRPO: 组内相对优势

> 相关阅读: [04 PPO](../04-PPO/04-PPO.md) · [01 GMPO](../01-GMPO/01-GMPO.md) · [03 GSPO](../03-GSPO/03-GSPO.md) · [06 RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md) · [Dr. GRPO](../../4.4.6-其他策略梯度/03-DrGRPO-去标准差/03-DrGRPO-去标准差.md) · [4.4.5 GxPO 家族](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md) · [4.4.0 强化学习的数学原理](../../4.4.0-强化学习的数学原理/4.4.0-强化学习的数学原理.md)

材料是 Shao 等人的 DeepSeekMath (arXiv:2402.03300): §4.1 提出 GRPO, §5.2 给出统一范式, 附录 A.1 给出各方法的梯度系数, 文中式号对应论文式 (1)-(4) 与 (19)-(21). 后半部分取 HybridFlow (veRL) 与 OpenRLHF 的系统实现. 问题是去掉价值网络之后优势怎样估, 一轮训练又怎样在推理和训练两套引擎之间流转.

## 1. 问题: PPO 的价值网络

### 1.1 PPO 的做法与两个问题

PPO 是 actor-critic 方法. 策略 $\pi_\theta$ 生成 token, 价值网络 $V_\psi$ 估计每个前缀的期望回报, 优势 $A_t$ 用 GAE 从奖励和 $V_\psi$ 算出, 再套 clip. InstructGPT 的做法还要把奖励模型的分数改成逐 token 的奖励, 并在每个 token 上扣 KL (DeepSeekMath 式 (2)):

$$
r_t = r_\varphi(q, o_{\le t}) - \beta \log\frac{\pi_\theta(o_t\mid q,o_{<t})}{\pi_{\mathrm{ref}}(o_t\mid q,o_{<t})} \tag{1}
$$

DeepSeekMath §4.1.1 列了这套做法在 LLM 上的两个问题:

1. 价值函数通常是与策略同量级的另一个模型, 带来可观的显存和计算负担.
2. 价值函数在优势计算里充当降方差的基线. LLM 场景下奖励模型通常只给最后一个 token 打分, 要训练一个在每个 token 上都准确的价值函数并不容易.

第 2 点在长 CoT 上更明显. 一道数学题几百个 token, 中间某步写错, 最后的答案已经注定错误, 但前缀的文字看起来仍在正常推导. $V_\psi$ 若主要拟合「这段前缀像不像好的证明」, 会把文风和正确性混在一起, 优势随之偏.

### 1.2 GRPO 的做法与代价

GRPO 的处理是不估计前缀的价值, 只比较同一道题的几条完整回答. 对一道题 $q$ 当场采 $G$ 条, 用这 $G$ 个奖励的均值近似 $\mathbb{E}[r\mid q]$, 基线由同题对照给出. 论文还指出, 奖励模型本身通常就是在「同一问题的两条回答比较」上训练的, 组内相对的算法与奖励模型的比较性质一致.

代价是采样. 原来每道题采一条加一次 critic 前向, 现在每道题采 $G$ 条. 推理模型的训练本来就需要多采样, 而省下的是一份与策略同量级的模型, 它的梯度和 Adam 状态. $G=1$ 时组内只有自己, 标准化无定义, 算法退化成不带基线的 REINFORCE.

![PPO 四模型与 GRPO 无价值网络](./images/fig-grpo-vs-ppo.png)

> 图 1: 左栏 PPO 用 critic 做 GAE, KL 进奖励; 右栏 GRPO 用组内标准化, KL 进损失. 右栏没有价值网络.

**图 1 解析**

- 两栏自上而下. 绿框是正在更新的策略.
- 左栏: actor 分出两路, 一路到 critic (鲑肉色), 一路到奖励模型 (黄). 两者进橙色的 GAE, $A=r-V$. 紫框 $\pi_{\mathrm{ref}}$ 用虚线连到 GAE, 对应式 (1) 把 KL 写进逐 token 奖励.
- 右栏: actor 先扩成一组 $o_1,\ldots,o_G$, 再打分, 再标准化. 紫框虚线进损失, 不进优势.
- 右栏的 Group 指同一道题的多次采样, 与 MoE 的专家分组无关.

## 2. 组内相对优势: 目标, 手算与代码

### 2.1 结果监督的优势

对每个问题 $q$, 从旧策略 $\pi_{\theta_{\mathrm{old}}}$ 采 $\{o_1,\ldots,o_G\}$, 奖励给出 $\mathbf r=\{r_1,\ldots,r_G\}$. 结果监督 (论文 §4.1.2) 下, 整条回答的所有 token 共用一个归一化分数:

$$
\hat{A}_{i,t}=\widetilde{r}_i=\frac{r_i-\mathrm{mean}(\mathbf{r})}{\mathrm{std}(\mathbf{r})} \tag{2}
$$

实现中分母通常加一个小量 $\epsilon$, 防止全对或全错时除零. 第 4.2 节会说明, 这个 $\mathrm{std}$ 本身会引入难度上的偏差.

![组内采样, 打分, 标准化, 广播到 token](./images/fig-grpo-group-advantage.png)

> 图 2: 一道题 $q$ 采 $G$ 条 (图里画 4 条), 打分后算组均值和标准差, 得到 $A_i$, 再整段广播到 token.

**图 2 解析**

- 自上而下: 蓝框 $q$, 四条绿色 $o_i$, 四个黄色 $r_i$, 橙框算 mean/std, 粉框 $A_i$, 底栏「一条回答里的 token 共用 $A_i$」.
- 左侧标注 sample $G$ / score / z-score / broadcast, 对应四个计算阶段.
- 底栏是结果监督的定义. 过程监督在步骤边界给不同的 $A_{i,t}$, 见 3.1 节.

### 2.2 KL 的估计器

PPO 把 KL 扣进 $r_t$, 它会随 GAE 进入优势. GRPO 把 KL 直接加进目标, 优势只由组内相对奖励决定. 估计器取 Schulman (2020) 的形式 (论文式 (4)):

$$
\mathbb{D}_{\mathrm{KL}}[\pi_\theta\Vert\pi_{\mathrm{ref}}]=\frac{\pi_{\mathrm{ref}}(o_{i,t}\mid q,o_{i,<t})}{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}-\log\frac{\pi_{\mathrm{ref}}(o_{i,t}\mid q,o_{i,<t})}{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}-1 \tag{3}
$$

令 $x=\pi_{\mathrm{ref}}/\pi_\theta>0$, 式 (3) 是 $f(x)=x-\log x-1$. $f(1)=0$, $f''(x)=1/x^2>0$, 所以 $f$ 是凸函数, 最小值 0 在 $x=1$ 处取到, 处处非负. 在 $o_{i,t}\sim\pi_\theta$ 下, $\mathbb E[x]=\sum_o\pi_{\mathrm{ref}}(o)=1$, 于是 $\mathbb E[f(x)]=\mathbb E[-\log x]=\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$, 这是它「无偏」的含义. 对比单样本的 $\log(\pi_\theta/\pi_{\mathrm{ref}})$: 它的期望也是 KL, 但单个样本可正可负.

数值例: 某 token 上 $\pi_\theta=0.5$, $\pi_{\mathrm{ref}}=0.4$, $x=0.8$, 式 (3) 给 $0.8-\log0.8-1\approx0.0231$; 单样本的 $\log(0.5/0.4)\approx0.223$. 换成 $\pi_\theta=0.4$, $\pi_{\mathrm{ref}}=0.5$, $x=1.25$, 式 (3) 给 $\approx0.0269$, 单样本 $\log$ 给 $-0.223$. 后者在这个 token 上会把策略推离参考模型.

### 2.3 完整目标

论文式 (3) 先在每条回答内对 token 平均, 再对组平均, 减去 $\beta$ 倍 KL:

$$
\mathcal{J}_{\mathrm{GRPO}}(\theta)
=\mathbb{E}_{q,\{o_i\}\sim\pi_{\theta_{\mathrm{old}}}}
\Bigg[
\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}
\Big(
\min\big(\eta_{i,t}\hat{A}_{i,t},\;
\mathrm{clip}(\eta_{i,t},1-\varepsilon,1+\varepsilon)\hat{A}_{i,t}\big)
-\beta\,\mathbb{D}_{\mathrm{KL}}[\pi_\theta\Vert\pi_{\mathrm{ref}}]
\Big)
\Bigg] \tag{4}
$$

其中 token 级重要性比率

$$
\eta_{i,t}=\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q,o_{i,<t})} \tag{5}
$$

式 (4) 里有三样东西, 各管一件事:

1. **clip 代理**. $\hat A_{i,t}>0$ 时要抬 $\eta_{i,t}$, 抬过 $1+\varepsilon$ 后不再加分; $\hat A_{i,t}<0$ 时要压 $\eta_{i,t}$, 压过 $1-\varepsilon$ 后不再加罚. 这是 PPO 用一阶 clip 代替 TRPO 的 KL 约束的做法, 见 [05 TRPO](../05-TRPO/05-TRPO.md) 与 [04 PPO](../04-PPO/04-PPO.md).
2. **$1/|o_i|$**. 每条回答先在自己的长度上平均, 再对组平均. 短回答的每个 token 分到的权重更大, 这是第 4.1 节长度偏差的来源.
3. **KL 项**. DeepSeekMath 取 $\beta=0.04$. 它不进入 $\hat A$, 所以「组内谁好」与「别离参考模型太远」由两个独立的项负责.

附录 A.1.6 在 $\pi_{\theta_{\mathrm{old}}}=\pi_\theta$ 时去掉 min 和 clip, 对式 (4) 求导 (论文式 (20)(21)):

$$
\nabla_\theta\mathcal J_{\mathrm{GRPO}}=\mathbb E\Bigg[\frac1G\sum_{i=1}^G\frac1{|o_i|}\sum_{t=1}^{|o_i|}\underbrace{\Big[\hat A_{i,t}+\beta\Big(\frac{\pi_{\mathrm{ref}}(o_{i,t}\mid o_{i,<t})}{\pi_\theta(o_{i,t}\mid o_{i,<t})}-1\Big)\Big]}_{GC_{\mathrm{GRPO}}}\nabla_\theta\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})\Bigg] \tag{6}
$$

KL 项的梯度系数是 $\beta(\pi_{\mathrm{ref}}/\pi_\theta-1)$: 当前策略把某个 token 的概率抬得比参考模型高时, 这一项为负, 往回压; 压得比参考模型低时为正, 往回抬. 式 (6) 是第 3.3 节统一范式的出发点.

### 2.4 手算: 一组四个分数

取 $G=4$, 规则奖励, $\mathbf r=(1,0,1,0)$. 均值 0.5.

- 总体标准差 $\sqrt{0.25}=0.5$, 得 $\widetilde r=(1,-1,1,-1)$.
- 样本标准差 (Bessel 修正) $\sqrt{1/3}\approx0.577$, 得 $\widetilde r\approx(0.866,-0.866,0.866,-0.866)$.

两种实现差一个常数因子, 等价于把学习率缩放 0.866 倍. DeepSeekMath 正文只写 $\mathrm{std}(\mathbf r)$, 没有说明是否做 Bessel 修正, PyTorch 的 `Tensor.std` 默认做. 对照不同训练器的结果时, 这一项要先对齐.

再看 $G=8$, 三条正确: 均值 0.375, 总体标准差 $\sqrt{0.375\times0.625}\approx0.484$. 正确的三条各得 $0.625/0.484\approx1.29$, 错误的五条各得 $-0.375/0.484\approx-0.77$. 组内正确率越低, 正确回答的优势越大, 一道 8 条里只对 1 条的题, 那条正确回答的优势约为 $0.875/0.331\approx2.65$.

把比率也放进来, $\varepsilon=0.2$. 某条正优势回答上, 一个 token 的 $\eta=1.5$, 超出 1.2, clip 分支生效, 代理目标锁在 $1.2\times\hat A$, 这个 token 的梯度为 0. 负优势回答上 $\eta=0.5$, 低于 0.8, 同样被锁. 正优势回答上 $\eta=0.5$ 的 token 则不受 clip 约束, 梯度照常按 $0.5\times\hat A$ 计.

### 2.5 过程监督的一组数

过程监督用同一套标准化, 粒度换成步骤 (第 3.1 节). 设 $G=2$, 每条三步, 六个步骤奖励为

$$
(0.2,\;0.8,\;1.0),\qquad (0.1,\;0.1,\;0.0)
$$

六个数的均值约 0.367, 总体标准差约 0.386. 归一化后第一条约为 $(-0.43,\;1.12,\;1.64)$, 第二条约为 $(-0.69,\;-0.69,\;-0.95)$. 按式 (9), 第一条第一步内的 token 拿到三步之和 $-0.43+1.12+1.64\approx2.33$, 第二步内的 token 拿到 $1.12+1.64=2.76$, 第三步只有 $1.64$. 第二条三步依次是 $-2.33$, $-1.64$, $-0.95$. 同一条回答内, 越靠前的 token 累加的步骤越多, 绝对值通常越大; 第一条第一步因为本步奖励为负, 反而小于第二步.

### 2.6 PyTorch 对照

下面按式 (2) 和式 (4) 写出组内标准化与损失. 形状约定: `token_level_rewards` 为 $(B,T)$, 结果监督时只有最后一个有效 token 非零; $B$ 能被组大小整除, 同一题的 $G$ 条在 batch 里相邻.

```python
import torch

def group_zscore_advantage(token_level_rewards, response_mask, group_size, eps=1e-6):
    """结果监督: 每条回答一个标量奖励, 组内标准化, 再广播到 token."""
    B, T = token_level_rewards.shape
    assert B % group_size == 0
    r = (token_level_rewards * response_mask).sum(dim=-1).view(-1, group_size)
    mean = r.mean(dim=-1, keepdim=True)
    std = r.std(dim=-1, keepdim=True)          # 默认 Bessel 修正
    adv = (r - mean) / (std + eps)
    return adv.reshape(B, 1).expand(-1, T) * response_mask


def grpo_loss(log_prob, old_log_prob, ref_log_prob, advantages, response_mask,
              clip_eps=0.2, beta=0.04):
    """式 (4): 每条回答先在自己长度上平均, 再对 batch 平均."""
    eta = torch.exp(log_prob - old_log_prob)
    surr = torch.minimum(eta * advantages,
                         torch.clamp(eta, 1 - clip_eps, 1 + clip_eps) * advantages)
    x = torch.exp(ref_log_prob - log_prob)     # 式 (3) 中的 pi_ref / pi_theta
    kl = x - (ref_log_prob - log_prob) - 1.0
    per_token = surr - beta * kl
    per_seq = (per_token * response_mask).sum(-1) / response_mask.sum(-1).clamp_min(1)
    return -per_seq.mean()
```

最后两行是论文的聚合方式. 很多开源实现改成 `(per_token * mask).sum() / mask.sum()`, 即 batch 内所有有效 token 一起平均, 这是 DAPO 的 token 级损失. 两种分母在长短不一的回答上给出不同的梯度分配, 复现论文时要选对.

## 3. 统一范式与 DeepSeekMath 的结果

### 3.1 过程监督

结果监督只在输出末尾给奖励, 信用分配粗: 中间写错, 最后碰巧对了, 整段拿正优势; 中间全对, 最后抄错, 整段挨罚. 论文 §4.1.3 按 Wang et al. (2023b) 的做法试了过程监督: 过程奖励模型在每个推理步骤结束处打分. 第 $i$ 条有 $K_i$ 步, 第 $j$ 步结束的 token 下标记作 $\mathrm{index}(j)$, 全部步骤奖励为

$$
\mathbf{R}=\big\{\{r_i^{\mathrm{index}(1)},\ldots,r_i^{\mathrm{index}(K_i)}\}\big\}_{i=1}^{G} \tag{7}
$$

用全体步骤奖励的均值和标准差归一化:

$$
\widetilde{r}_i^{\mathrm{index}(j)}=\frac{r_i^{\mathrm{index}(j)}-\mathrm{mean}(\mathbf{R})}{\mathrm{std}(\mathbf{R})} \tag{8}
$$

token $t$ 的优势是它之后所有步骤的归一化奖励之和:

$$
\hat{A}_{i,t}=\sum_{\mathrm{index}(j)\ge t}\widetilde{r}_i^{\mathrm{index}(j)} \tag{9}
$$

目标仍是式 (4), 只换 $\hat A_{i,t}$. 论文 Figure 5 在 DeepSeekMath-Instruct 1.3B 上比较, GRPO+PS 优于 GRPO+OS, 作者的解释是按步骤区分的梯度系数更细. 式 (9) 也意味着过程奖励模型的错误会沿 token 往前累加: 某一步被错标为高分, 它之前所有 token 都会分到这份分数.

### 3.2 迭代 RL

奖励模型固定, 策略在变, 训练一段时间后奖励模型对新分布的打分就不再可靠. 论文 Algorithm 1 的迭代版本:

1. $\pi_\theta\leftarrow\pi_{\mathrm{init}}$.
2. 外层第 $1,\ldots,I$ 轮: 令参考模型 $\pi_{\mathrm{ref}}\leftarrow\pi_\theta$.
3. 内层第 $1,\ldots,M$ 步: 抽一个 batch; $\pi_{\theta_{\mathrm{old}}}\leftarrow\pi_\theta$; 每题采 $G$ 条; 用 $r_\varphi$ 打分; 按组相对方式算 $\hat A_{i,t}$; 在这批数据上做 $\mu$ 次 GRPO 更新.
4. 内层结束后, 用策略的新采样构造奖励模型训练集, 以 10% 的历史数据做 replay 续训 $r_\varphi$.

论文做了两轮迭代, Figure 6 显示迭代 RL 带来明显提升, 第一轮最大. 每轮外层把参考模型重置为当前策略, KL 约束的锚点随之前移.

DeepSeekMath 的主实验里策略每次探索之后只更新一次, $\pi_{\theta_{\mathrm{old}}}$ 与 $\pi_\theta$ 在计算比率时几乎相同, clip 很少触发. 后来的长 CoT 训练普遍在同一批 rollout 上做多次 mini-batch 更新, 比率逐渐离开 1, clip 才成为主要约束, GMPO 和 GSPO 讨论的都是这种设定.

### 3.3 统一范式

论文 §5.2.1 把 SFT, RFT, DPO, Online RFT, PPO, GRPO 写成同一个梯度形式 (论文式 (5)):

$$
\nabla_{\theta}\mathcal{J}_{\mathcal A}(\theta)=\mathbb{E}_{(q,o)\sim\mathcal{D}}\left[\frac{1}{|o|}\sum_{t=1}^{|o|}GC_{\mathcal A}(q,o,t,\pi_{rf})\,\nabla_{\theta}\log\pi_{\theta}(o_{t}\mid q,o_{<t})\right] \tag{10}
$$

三个组成: 数据源 $\mathcal D$, 奖励函数 $\pi_{rf}$, 以及把奖励变成梯度系数 $GC$ 的算法 $\mathcal A$. Table 10 与附录 A.1:

| 方法 | 数据源 | 奖励 | 梯度系数 |
|---|---|---|---|
| SFT | SFT 数据集的 $(q,o)$ | 无 (人工挑选) | 恒为 1 |
| RFT | SFT 题目, SFT 模型采样 | 规则 | 答对为 1, 答错为 0 |
| DPO | SFT 题目, SFT 模型采样成对 | 规则 | 成对 logistic 权重 |
| Online RFT | SFT 题目, 当前策略采样 | 规则 | 答对为 1, 答错为 0 |
| PPO | SFT 题目, 当前策略采样 | 模型 | GAE 的 $A_t$ |
| GRPO | SFT 题目, 当前策略采样一组 | 模型 | 式 (6) 的 $GC_{\mathrm{GRPO}}$ |

两条观察:

- **数据源**. Figure 5 (1.3B) 中, Online RFT 前期与 RFT 接近, 后期明显超过. 策略离开 SFT 模型越远, 用当前策略采样的数据越有优势.
- **梯度系数**. GRPO 超过 Online RFT. 两者的区别在于 Online RFT 不惩罚错误回答, 对所有正确回答一样强度地强化; GRPO 按奖励的相对大小区分强化和惩罚的幅度.

这张表说明 GRPO 仍是策略梯度, 与其他方法的差别都落在 $\mathcal D$ 和 $GC$ 上. DPO 在表里是离线成对数据, 不做 rollout; 通用偏好对齐常用 DPO, 数学和代码这类可验证奖励更适合组相对的在线 RL, 两者常在同一条后训练流水线里先后使用.

### 3.4 DeepSeekMath 的训练设定

| 项 | 取值 (论文 §4.2) |
|---|---|
| 起点 | DeepSeekMath-Instruct 7B |
| RL 数据 | SFT 数据中 GSM8K 与 MATH 相关的 CoT 题, 约 144K 道 |
| 奖励模型 | 从 DeepSeekMath-Base 7B 训练, 学习率 $2\times10^{-5}$, 训练集构造按 Wang et al. (2023b) |
| 策略学习率 | $10^{-6}$ |
| KL 系数 $\beta$ | 0.04 |
| 每题采样 $G$ | 64 |
| 最大长度 | 1024 |
| 训练 batch | 1024 |
| 每次探索后的更新次数 | 1 |

RL 数据只取 GSM8K 和 MATH 的题, 其他 SFT 题目刻意排除, 用来观察 RL 对没见过的基准有没有作用. 论文把 CoT 下的 GSM8K 和 MATH 算作领域内, 其余都算领域外.

### 3.5 Table 5 的数字

| 设定 | 模型 | GSM8K | MATH | MGSM-zh | CMATH |
|---|---|---|---|---|---|
| CoT | DeepSeekMath-Instruct 7B | 82.9% | 46.8% | 73.2% | 84.6% |
| CoT | DeepSeekMath-RL 7B | 88.2% | 51.7% | 79.6% | 88.8% |
| 工具集成 | DeepSeekMath-Instruct 7B | 83.7% | 57.4% | 72.0% | 84.3% |
| 工具集成 | DeepSeekMath-RL 7B | 86.7% | 58.8% | 78.4% | 87.6% |

CoT 下四项分别涨 5.3, 4.9, 6.4, 4.2 个点. 两个中文基准不在 RL 数据里, 涨幅与领域内相当. 工具集成推理同样不在 RL 训练格式里, 四项也都上升. 摘要里另一个数, 7B 模型在 MATH 上 64 次采样自一致性达到 60.9%, 是解码时的多数投票, 与 GRPO 的组大小 $G=64$ 是两件事.

### 3.6 RL 提升的是什么

Figure 7 在温度 0.7 下画了 Instruct 和 RL 两个 7B 模型在 GSM8K, MATH 上的 Maj@K 和 Pass@K. RL 提升了 Maj@K, Pass@K 基本不变. 论文的解释是 RL 让输出分布更稳, 正确答案从 Top-K 里被提到更常被采到的位置, 基础能力没有明显提升. 后来针对 RLVR 的研究报告了同一类现象, 见 [4.4.7 RLVR 的局限性与探索边界](../../4.4.7-RLVR的局限性与探索边界/4.4.7-RLVR的局限性与探索边界.md).

§5.2.3 按统一范式的三个组成列了后续方向: 数据源上, 用领域外题目, 树搜索类的采样方法, 更快的推理引擎; 算法上, 奖励信号不总可靠, 算法不应完全相信它; 奖励上, 提升奖励模型的泛化, 反映不确定性, 构建高质量的过程奖励模型.

## 4. 长度偏差和难度偏差

### 4.1 长度偏差

Liu et al. (2025, Dr. GRPO) 分析了式 (2) 和式 (4) 里的两个归一化项. 完整讨论见 [Dr. GRPO](../../4.4.6-其他策略梯度/03-DrGRPO-去标准差/03-DrGRPO-去标准差.md), 家族对照见 [4.4.5 GxPO 家族](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md).

$1/|o_i|$ 让同样大小的 $\hat A_i$ 摊在不同长度上. 设两条回答优势相同, 长度分别为 100 和 400:

| | 长度 100 | 长度 400 |
|---|---|---|
| 每个 token 的权重 $\hat A/|o_i|$ ($\hat A=+1$) | 0.01 | 0.0025 |
| 每个 token 的权重 ($\hat A=-1$) | $-0.01$ | $-0.0025$ |

正优势时短回答每个 token 被抬得更多, 策略更偏向短的正确写法; 负优势时长回答每个 token 被压得更少, 长的错误回答压得不够. 优势按整条回答算, 更新按 token 均摊, 两个粒度不一致, 结果是错误回答越来越长. Dr. GRPO 论文还指出, 很多 PPO 实现也按回答长度做 masked mean, 同样有这个偏差.

### 4.2 难度偏差

$\mathrm{std}(\mathbf r)$ 在组内近乎全对或全错时很小. 第 2.4 节已经算过: 8 条里对 1 条, 那条的优势约 2.65; 对 4 条, 每条正确回答的优势是 1. 很容易和很难的题被放大了权重. 全对或全错时分子为 0, 这组题不产生任何梯度, 只占了采样算力.

两类改法:

- Dr. GRPO 两项都删: 优势只减均值, 不除标准差; 损失用固定常数 (如最大生成长度) 做分母.
- DAPO 保留标准差, 用动态采样丢掉准确率为 0 或 1 的组, 并把损失分母换成 batch 内有效 token 总数.

### 4.3 代码里的分母

```python
def masked_mean(tensor, mask, dim):
    return (tensor * mask).sum(dim) / mask.sum(dim)          # 按真实长度, 式 (4)

def constant_normalized_sum(tensor, mask, max_tokens):
    return (tensor * mask).sum(-1) / max_tokens               # Dr. GRPO 的做法
```

改分母前先确认要复现的是 DeepSeekMath, Dr. GRPO 还是 DAPO.

## 5. 一轮 GRPO 在机器上怎么走

### 5.1 采样和更新为什么分开

前几节是数学目标, 这一节写一轮更新在集群上的数据流: 谁采样, 谁打分, 谁重算 logprob, 权重怎么回到推理引擎. 主要依据 HybridFlow (veRL 的论文, arXiv:2409.19256) 和 OpenRLHF (arXiv:2405.11143).

自回归生成受显存带宽限制, PagedAttention, continuous batching, CUDA Graph 这些优化住在 vLLM, SGLang 这类推理运行时里. 反向传播受算力限制, 需要 Megatron 的 TP+PP, FSDP 或 DeepSpeed ZeRO 的分片. HybridFlow §2 指出两者的并行偏好不同: actor 训练是计算密集的, 通常需要更大的模型并行度; 生成更适合较小的模型并行度加更多的数据并行副本. 同一套并行配置很难兼顾两边.

开销上, HybridFlow 写道 actor 的训练和生成两个节点常占每轮 RLHF 的大部分时间, 以 HybridFlow 自身为例约 58.9%. OpenRLHF 初版 (2405.11143v1) 的 profiling 显示, PPO 的样本生成阶段占总训练时间约 80%. 两个百分比口径不同, 一个是训练加生成, 一个只算生成, 都说明生成侧是主要开销.

所以一轮 GRPO 至少有两套引擎:

| 角色 | 做什么 | 常见实现 |
|---|---|---|
| Infer / Rollout | 自回归采样 $G$ 条, 记下旧策略下被选中 token 的 logprob | vLLM, SGLang |
| Train / Actor | 在当前 $\theta$ 上 teacher-forcing 重算 logprob, 算 clip 目标, 反向, 更新 | Megatron, FSDP, DeepSpeed ZeRO |
| Verifier | 给出 $r_i$ | 规则 (抽取答案, 跑单元测试) 或奖励模型前向 |

推理引擎算出的 logprob 与训练图的数值常常对不齐 (算子, 精度, 采样实现都不同), 所以训练引擎往往再做一次 teacher-forcing 前向, 用训练图重算旧策略的 logprob. 这次前向仍在训练引擎上执行.

### 5.2 一轮循环

$$
\text{rollout}(\pi_{\theta_{\mathrm{old}}}) \rightarrow \{y_i,\log\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid x,y_{i,<t})\}_{i=1}^{G} \rightarrow \{r_i\} \rightarrow \hat A_i \rightarrow \nabla_\theta\mathcal J_{\mathrm{GRPO}} \rightarrow \theta_{\mathrm{old}}\leftarrow\theta \tag{11}
$$

![Infer 引擎采样与 Train 引擎更新](../../images/fig-grpo-infer-train-flow.png)

> 图 3: 从左到右依次是 prompt, Infer Engine 采样, Verifier 打分, Train Engine 重算并反向; 虚线是旧 logprob 和权重回灌.

**图 3 解析**

- 最左是数据. prompt 进 Infer Engine 时, 训练图可以先让出显存. Infer Engine 框写 vLLM / SGLang, 对应 veRL 和 OpenRLHF 的主要生成后端.
- $y_1\ldots y_G$ 走实线到 Verifier. 规则校验器只看最终答案或单元测试结果, 不需要 hidden state.
- 底部虚线 `old log p` 从 Infer 连到 Train. 有的实现直接用推理引擎给出的 logprob, 有的在训练引擎上用 $\theta_{\mathrm{old}}$ 再前向一次.
- Train Engine 框写 Megatron / FSDP / DeepSpeed, 对应 veRL 与 OpenRLHF 的训练后端.
- 最右 `Updated θ` 的虚线回到 Infer: NCCL 广播或重分片. 不回灌, 下一轮仍在用旧权重采样.

式 (5) 的 $\eta_{i,t}$ 在实现中是 `exp(new_logp - old_logp)`, 所以采样阶段记下的 `old_logp` 是必需的. 少了这一列, 训练时只能用当前 $\theta$ 冒充 $\theta_{\mathrm{old}}$, 比率恒为 1, clip 失效. 在同一批 rollout 上做多次更新时, 每次都要用记下的 `old_logp`, 不能把上一次更新后的 $\theta$ 当成 $\theta_{\mathrm{old}}$.

### 5.3 HybridFlow: 节点间单控制器, 节点内多控制器

HybridFlow 的判断是: 单控制器能把数据依赖写清楚, 但每个分布式算子都由中心进程下发, 控制开销在 LLM 级并行下扛不住; 多控制器通信快, 算法逻辑却嵌在点对点通信里, 换一种 RLHF 算法要改很多通信代码. 它把单控制器用在节点之间 (prompt, 序列, 奖励去哪), 多控制器用在节点内部 (TP/PP/DP 自己通信). 论文 Figure 6 用这套 API 写 PPO 只需 8 行, 调用 `generate_sequences`, `compute_values` 这类原语.

一轮 GRPO 在控制器里依次调用: 生成序列, 计算奖励, 计算 logprob, 更新 actor. GRPO 没有 critic, 少了 `compute_values` 和 critic 更新两步. veRL 里每个 prompt 采几条由 `actor_rollout_ref.rollout.n` 控制, 大于 1 才有组统计.

actor 的训练和生成可以放在同一组 GPU 上 (veRL 的 `ActorRolloutRefWorker` 允许 actor, rollout, reference 三个角色共址), 目的是用 NCCL 把训练分片的权重直接灌进推理引擎.

**3D-HybridEngine.** HybridFlow §5 允许训练和生成使用不同的 $(P,T,D)$ 并行配置, 并在两个阶段之间做零冗余的权重重分片. 论文 Figure 8 的例子是两台机器, 每台 4 卡:

- 训练用 1-4-2 (PP-TP-DP): TP 组为 $[G1,G2,G3,G4]$ 与 $[G5,G6,G7,G8]$, DP 组按间隔取.
- 生成若沿用同样的分组方法改成更小的 TP, 过渡时要在模型并行组里 all-gather 出完整权重再切, 部分卡上会同时存一份训练分片和一份完整权重.
- 3D-HybridEngine 改了生成侧的分组方法: 生成 TP/PP 组按 $t/t_g$, $p/p_g$ 的间隔取 rank, micro DP 组沿生成 TP 维顺序排. 这样每张卡上生成所需的权重与训练分片重叠, 不必保留第三份拷贝.

实现约 2.4k 行, 叠在 Megatron-LM 和 vLLM 之上: 训练权重和生成权重放在两个 buffer, 训练时把生成权重卸到 CPU, 过渡时搬回, 用 NCCL 在 micro DP 组内拼接参数.

HybridFlow Table 1 比较了几种系统在 actor 权重上的处理:

| 系统 | 训练与生成之间的 actor 权重 |
|---|---|
| DeepSpeed-Chat | 从 ZeRO 重分片到 TP |
| OpenRLHF (当时版本) | 两个阶段各存一份 actor 权重 |
| NeMo-Aligner | 两个阶段使用相同的模型划分, 共享权重 |
| HybridFlow | 零冗余重分片 |

吞吐方面, HybridFlow 报告在 PPO, ReMax, Safe-RLHF 上相对这些基线有 1.53 倍到 20.57 倍的提升. 以 PPO 为例 (Figure 9), 平均比 DeepSpeed-Chat 快 3.67 倍 (最多 7.84 倍), 比 OpenRLHF 快 3.25 倍 (最多 5.93 倍), 比 NeMo-Aligner 快 12.52 倍 (最多 20.57 倍). 这些实验里 actor, critic, reference, reward 四个模型同尺寸, 是系统吞吐的比较, 与 GRPO 的分数无关.

### 5.4 OpenRLHF: Ray 分角色, DeepSpeed 训练

OpenRLHF 用 Ray 把 RLHF 的各个角色分配到不同的 GPU 上, vLLM 负责生成, DeepSpeed ZeRO 负责训练, 权重从训练引擎同步到 vLLM. 它直接加载 HuggingFace 格式的权重, 不需要转换到 Megatron 格式. 选 veRL 还是 OpenRLHF, 主要看训练后端和集群规模, GRPO 的目标在两边相同.

Megatron-LM 本身不是 RL 框架, 它提供 3D 并行下的前向, 反向和优化器. 在 veRL 里它是训练引擎的一种实现.

### 5.5 显存和通信

**采样阶段**. 主要占用是 KV Cache. $G$ 条并行相当于把 batch 放大 $G$ 倍. DeepSeekMath 的 $G=64$, 最长 1024, 是 7B 模型短 CoT 的配置; 长 CoT 下 KV Cache 随长度线性增长, 组大小常常要降.

**损失阶段**. 需要旧 logprob, 新 logprob, 以及可选的参考 logprob, 形状都是 $[B,T]$, 相对权重很小. 真正占显存的是新 logits: 词表 15 万量级时, $[B,T,V]$ 的 fp32 张量远大于模型本身. 做法是边算边 gather 出被选中 token 的 logprob, 不保留整张词表的 logits.

**更新阶段**. 权重, 梯度, Adam 一阶和二阶矩. ZeRO-3 / FSDP 把这三份切到各卡; Megatron 按 TP/PP 切.

**跨阶段**. 最贵的是权重同步: 7B 模型 bf16 约 14GB, 70B 约 140GB. 3D-HybridEngine 就是为了让这一步不产生冗余拷贝.

通信按阶段分三类: 采样时推理引擎内部的 TP all-reduce; 训练时 DP 组的梯度 all-reduce (或 ZeRO 的 reduce-scatter / all-gather); 两阶段之间的参数广播或重分片. 诊断变慢时按这三类分开看: 采样慢多半是 KV Cache 或调度, 训练慢多半是流水线气泡或 ZeRO 的 all-gather, 同步慢才和共址方式有关.

### 5.6 Verifier 和分组

规则奖励一般在控制器或独立的 CPU 进程上跑: 抽取 `\boxed{}` 里的答案, 运行单元测试, 比较数值. 它读的是文本, 不需要模型的中间状态. 奖励模型则是又一次 LLM 前向, 布局与参考模型相近.

组统计必须在同一 prompt 的 $G$ 条回答上做. 控制器要按 prompt id 聚组, 再把结果分发回各数据并行 rank. 聚错组, 简单题和难题的奖励进了同一个 mean/std, 优势的尺度就乱了.

## 6. 失效模式与变体

### 6.1 失效模式

| 现象 | 常见位置 | 先查什么 |
|---|---|---|
| 被 clip 的 token 比例突然升到十几个百分点 | Train | 新旧 logprob 是否错位; 采样模板与训练模板是否一致 |
| 整组优势为 0 | Verifier 之后 | $G$ 条全对或全错; 这类组的占比 |
| 回答越来越长, 错误回答尤其长 | 损失分母 | 第 4.1 节的长度偏差 |
| 单机与分布式数值不一致 | Infer logprob | 是否跳过训练引擎的重算, 直接用了推理引擎的 logprob |
| 采样很慢, 损失收敛很快 | 权重同步 | 推理引擎是否还在用上一轮的 $\theta$ |
| 被 clip 的比例高, 但策略没怎么变 | 模板与温度 | 采样温度与计算 logprob 的温度是否一致 |

最后一行展开说. 推理引擎在温度 $T$ 下采样, 存下的 logprob 若是 $T$ 缩放后的分布, 而训练引擎在 $T=1$ 的 logits 上算新 logprob, 比率会系统性偏离 1, clip 比例虚高. 采样模板与训练模板差一个 system prompt 也一样: 两边算的是不同条件分布下的概率, 比率失去重要性采样的含义.

### 6.2 变体与选用

| 算法 | 相对 GRPO 改什么 | 文章 |
|---|---|---|
| Dr. GRPO (arXiv:2503.20783) | 删去 $1/|o_i|$ 和组 $\mathrm{std}$ | [Dr. GRPO](../../4.4.6-其他策略梯度/03-DrGRPO-去标准差/03-DrGRPO-去标准差.md) |
| DAPO (arXiv:2503.14476) | Clip-Higher, 动态采样, token 级损失, 超长惩罚 | [4.4.5 GxPO 家族](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md) |
| GMPO (arXiv:2507.20673) | token 级加权奖励改用几何平均, 窗口放宽 | [01 GMPO](../01-GMPO/01-GMPO.md) |
| GSPO (arXiv:2507.18071) | 序列级重要性比率与序列级 clip | [03 GSPO](../03-GSPO/03-GSPO.md) |
| RLOO | 基线用其余 $K-1$ 条的均值, 不含自己, 通常不除标准差 | [06 RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md) |

选用:

- 需要 GAE 和逐 token 价值, 奖励来自通用偏好模型: [04 PPO](../04-PPO/04-PPO.md), 显存按四个模型估.
- 可验证奖励或组内可比较的打分, 愿意用采样换 critic 的显存: GRPO. 组太小 ($G=2$) 时均值不稳, DeepSeekMath 用 64, 长 CoT 训练常用 8 或 16.
- MoE 上 token 级比率随专家路由剧烈波动: [03 GSPO](../03-GSPO/03-GSPO.md).
- 静态偏好对, 不做在线 rollout: DPO, 见 [01 DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md).

## 参考文献

1. Shao, Z., Wang, P., Zhu, Q., Xu, R., Song, J., Bi, X., Zhang, H., Zhang, M., Li, Y. K., Wu, Y., & Guo, D. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300. https://arxiv.org/abs/2402.03300
2. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347. https://arxiv.org/abs/1707.06347
3. Schulman, J. (2020). *Approximating KL Divergence*. http://joschu.net/blog/kl-approx.html
4. Ouyang, L., et al. (2022). *Training language models to follow instructions with human feedback*. NeurIPS 35. arXiv:2203.02155.
5. Wang, P., et al. (2023). *Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations*. arXiv:2312.08935.
6. Liu, Z., et al. (2025). *Understanding R1-Zero-Like Training: A Critical Perspective*. arXiv:2503.20783. https://arxiv.org/abs/2503.20783
7. Yu, Q., et al. (2025). *DAPO: An Open-Source LLM Reinforcement Learning System at Scale*. arXiv:2503.14476. https://arxiv.org/abs/2503.14476
8. Sheng, G., Zhang, C., Ye, Z., Wu, X., Zhang, W., Zhang, R., Peng, Y., Lin, H., & Wu, C. (2024). *HybridFlow: A Flexible and Efficient RLHF Framework*. arXiv:2409.19256. https://arxiv.org/abs/2409.19256
9. Hu, J., et al. (2024). *OpenRLHF: An Easy-to-use, Scalable and High-performance RLHF Framework*. arXiv:2405.11143. https://arxiv.org/abs/2405.11143
10. Shoeybi, M., Patwary, M., Puri, R., LeGresley, P., Casper, J., & Catanzaro, B. (2019). *Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism*. arXiv:1909.08053.
11. Guo, D., et al. (2025). *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*. arXiv:2501.12948.
