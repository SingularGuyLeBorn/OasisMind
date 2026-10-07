---
title: "06 · ReMax: 贪心解码当基线"
published: true
tags: ["ReMax", "REINFORCE", "PPO", "RLOO", "RLHF", "基线"]
excerpt: "ReMax 用同一条 prompt 上贪心解码的奖励做基线, 随机采样回答的奖励减去它, 再乘整段对数概率. 去掉价值网络后, Llama-2-7B 上显存约为 PPO 的 54%, 开 offload 时一个 epoch 从 2.9 小时降到 1.8 至 2.0 小时."
---
# 06 · ReMax: 贪心解码当基线

> 相关阅读: [4.5 GRPO 家族与 RLVR](../../4.5-GRPO家族与RLVR/4.5-GRPO家族与RLVR.md) · [02-REINFORCE](../02-REINFORCE-序列级策略梯度/02-REINFORCE-序列级策略梯度.md) · [05-RLOO](../05-RLOO-留一法基线/05-RLOO-留一法基线.md) · [04-PPO](../04-PPO/04-PPO.md) · [4.5 GRPO](../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) · [01-DPO](../../4.6-偏好优化/4.6.1-离线偏好优化/01-DPO/01-DPO.md)

材料是 Li 等的 *ReMax: A Simple, Effective, and Efficient Reinforcement Learning Method for Aligning Large Language Models* (arXiv:2310.10505, ICML 2024), 名字取自 REINFORCE 加 argmax. 问题是 RLHF 中 PPO 的价值网络能否去掉, 去掉后用什么做基线.

## 1. 为什么能去掉价值网络

### 1.1 语言模型上的三个性质

InstructGPT 的三阶段流程是 SFT, 训练奖励模型, 再用奖励抬策略, 第三阶段默认用 PPO. PPO 是为一般 MDP 设计的: 转移可以随机, 仿真可以很慢, 奖励可以逐步给出. 论文指出语言模型上这三条都不成立, 并归纳为三个性质.

**快仿真**. 生成一条完整回答再查一次冻结的奖励模型, 对 7B 以下的模型不超过 10 秒. 回报就是这条轨迹的标量 $r(x,y)$, 不需要等很多步再估计折扣和.

**确定转移**. 状态 $s_t=(x,y_{<t})$ 是 prompt 加已生成的 token, 动作是下一个 token. 选定动作后, 下一状态就是把这个 token 拼上去, 转移没有噪声. 随机性只来自策略本身.

**轨迹级奖励**. 中间 token 的奖励为 0, 写完才给 $r(x,y)$. 形式上仍可写成 token 级 MDP, 只是逐步奖励全是 0.

把这三条代进 GAE 看得更直接. GAE 的优势是 $A_t=\sum_{l\ge0}(\gamma\lambda)^l\delta_{t+l}$, 其中 $\delta_t=r_t+\gamma V(s_{t+1})-V(s_t)$, $\gamma$ 是折扣, $\lambda$ 是平滑系数. 取 $\gamma=\lambda=1$, 中间奖励全为 0, 终点奖励为 $r(x,y)$, 求和时相邻的 $V$ 项逐个抵消, 只剩 $A_t=r(x,y)-V(s_t)$. 这时价值网络的作用退化为一个逐 token 的基线, 减掉的是从当前前缀出发的期望奖励. ReMax 用一个按 prompt 计算的基线代替它, 放弃了逐 token 的区分, 换来少训一个网络. 实践中 PPO 常取 $\lambda<1$, 用 $V$ 的偏差换方差, 这一点上 ReMax 没有对应的旋钮.

### 1.2 价值网络的显存与超参代价

价值网络解决的两类问题, 随机环境里复用旧数据和慢仿真里快速估回报, 在 RLHF 里都不迫切. PPO 却要维护一份和策略差不多大的价值网络, 包括它的梯度和 Adam 状态. 附录 E.3 按 Llama-2-7B 估算: 一份可训练模型约 147.02 GB, 一份冻结模型约 12.55 GB. PPO 是两份可训练 (策略, 价值) 加两份冻结 (奖励模型, 参考模型), 合计 319.14 GB; ReMax 是一份可训练加两份冻结, 172.12 GB, 约为 PPO 的 54%. 摘要说省约 46% 显存. 按论文脚注的拆分, 冻结的奖励模型只占约 4%, 价值网络连同激活, 梯度和优化器状态约占 46%. 正文还写到, 价值网络训练时的显存是推理时的 4 倍以上.

PPO 还带一串需要调的超参: 重要性比率的 clip 范围, GAE 的 $\lambda$, 价值网络的学习率, 一批数据上的内层 epoch 数. ReMax 去掉了这四个. 论文 §1.1 还给了实现规模的对比: ReMax 的主体代码约 6 行, PPO 在 30 行以上. 在 7B 规模上, 每扫一组超参都很贵, 少几个超参能直接省算力.

序列级记号沿用 [02-REINFORCE](../02-REINFORCE-序列级策略梯度/02-REINFORCE-序列级策略梯度.md): 整段 $y$ 当一个动作, 终局标量乘整段 $\nabla\log\pi$. ReMax 换的只是减去的基线.

## 2. 估计器: 从 REINFORCE 到减一条贪心回答

### 2.1 裸 REINFORCE 的方差从哪来

固定 prompt $x$, REINFORCE 的策略梯度是

$$
\nabla_{\theta}\mathbb{E}_{y\sim\pi_{\theta}}[r(x,y)]
=\mathbb{E}_{y\sim\pi_{\theta}}\Bigl[\sum_{t=1}^{T}\nabla_{\theta}\log\pi_{\theta}(y_t\mid x,y_{<t})\,r(x,y)\Bigr]. \tag{1}
$$

$T$ 是回答长度. 在 $N$ 条 prompt 上的随机梯度估计为

$$
\widehat g(\theta)=\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}s_{\theta}(x^{i},y_{1:t}^{i})\,r(x^{i},y^{i}), \tag{2}
$$

其中 $s_{\theta}(x,y_{1:t})=\nabla_{\theta}\log\pi_{\theta}(y_t\mid x,y_{<t})$ 是得分函数, $y_t^{i}\sim\pi_{\theta}(\cdot\mid x^{i},y_{<t}^{i})$. 这是奖励加权的对数似然. 和 SFT 的区别在样本来源: SFT 的 $y$ 事先给定, 这里的 $y$ 由当前 $\pi_{\theta}$ 生成.

式 (2) 无偏, 但方差大. 论文用梯度范数做方差的代理指标, 依据是对随机变量 $Z$ 有 $\mathbb{E}[|Z|]\le\sqrt{\mathrm{Var}[Z]+(\mathbb{E}[Z])^{2}}$. Figure 4 显示, OPT-1.3B 上裸 REINFORCE 的梯度范数明显高于 ReMax, 评测奖励也更差. 附录 F.1 换成 Llama-2-7B, 裸 REINFORCE 不再发散, 但评测奖励仍明显低于 ReMax. 增大模型规模消除不了这部分方差.

方差有两个来源. 环境转移的随机性在 RLHF 里不存在. 剩下的是策略本身的随机性, 以及不同 prompt 奖励尺度的差异. Llama-2-7B 的一个 mini-batch 里, 奖励从 $-14.25$ 到 $7.25$; 训练一个 epoch 后仍从 $-8.125$ 到 $7.56$. 开放问题 (写一篇短故事) 和封闭问题 (新西兰首都是哪) 的奖励分布差别很大, SFT 相当于每条样本权重都是 1, 裸 REINFORCE 则把这种差异直接乘进梯度.

### 2.2 贪心基线与 Algorithm 1

减去一个与当前样本独立的基线 $b(x)$, 期望不变, 方差可以下降:

$$
\widetilde g(\theta)=\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\bigl[s_{\theta}(x^{i},y_{1:t}^{i})\times\bigl(r(x^{i},y^{i})-b_{\theta}(x^{i})\bigr)\bigr]. \tag{3}
$$

ReMax 取当前策略贪心解码的奖励:

$$
b_{\theta}(x)=r(x,\bar y),\qquad \bar y_t\in\arg\max_{a}\pi_{\theta}(a\mid x,\bar y_{<t}). \tag{4}
$$

$\bar y$ 是 $\pi_{\theta}$ 逐步取最大概率 token 得到的回答. 给定 $x$ 和 $\theta$, 它与随机样本 $y$ 条件独立, 这是无偏性的前提. 论文 Algorithm 1:

```python
for prompt in datasets:
    seq = lm.sample(prompt, greedy=False)
    seq_max = lm.sample(prompt, greedy=True)
    rew = rm(prompt, seq) - rm(prompt, seq_max)
    logp = lm.inference(prompt, seq)
    loss = -(logp.sum(dim=-1) * rew).mean()
    lm.minimize(loss)
```

`seq_max` 只参与奖励减法, 不进入 `logp`, 梯度只流过随机采样的 $y$. 随机样本按训练温度 (Part I 是 1, top-p 0.9) 采样, 贪心回答相当于温度趋于 0 的极限, 不受采样温度和 top-p 影响, 改训练温度只改变随机样本一侧. 每条 prompt 只有一条带梯度的样本, 方差主要靠 batch 里 prompt 的数量来平均, 这也是 ReMax 能用上更大 batch 的意义所在. RAFT 的做法相反, 它只对奖励最高的样本做交叉熵, 其余丢弃.

### 2.3 一个数值例子

随机样本三个 token 的对数概率是 $-0.4$, $-0.8$, $-0.2$, 和为 $-1.4$. 奖励模型给它 $r=2.1$, 给贪心回答 $r=1.4$, 优势 $A=0.7$. 损失为 $-\bigl((\sum_t\log\pi)\cdot A\bigr)=-((-1.4)\times0.7)=0.98$. 最小化这个损失, 等于沿整段 $\nabla\log\pi$ 乘 $+0.7$ 的方向上升, 三个 token 拿到同一个权重. 如果随机样本只得 0.9 分, 优势是 $-0.5$, 整段概率被压低. 贪心回答的 token 对数概率不出现在损失里, 它再流畅也不会被当作正例模仿.

和 [02-REINFORCE](../02-REINFORCE-序列级策略梯度/02-REINFORCE-序列级策略梯度.md) 的滑动平均基线对比: 那里 $b_{\mathrm{MA}}=(1.2+0.8+1.5+0.4)/4=0.975$ 是过去所有 prompt 奖励的平均; ReMax 的基线针对当前这条 $x$ 和当前参数. 跨 prompt 的 $-14$ 到 $+7$ 这种尺度差异, 被同一条 prompt 上的两次打分相减消去一部分.

![随机采样减贪心基线再乘对数概率](./images/fig-remax-greedy-baseline.png)

> 图 1: 同一条 prompt 分出两路. 左路随机采样 $y$, 经冻结奖励模型得 $r(x,y)$; 右路贪心解码得 $\bar y$, 其奖励作为 $b(x)$. 两者相减得到优势 $A$, 只乘随机样本的 $\sum_t\log\pi_{\theta}(y_t)$.

**图 1 解析**

- 顶部黄框是 prompt $x$, 向下分成两路.
- 左列绿框采样 $y$, 橙框查冻结奖励模型; 右列青绿框走 $\arg\max$, 奶油色框写出 $b(x)=r(x,\bar y)$.
- 鲑色框做减法 $A=r-b$. 粉框是损失, 对数概率只来自 $y$.
- 底注写明没有价值网络 $V$. $\bar y$ 与随机 $y$ 独立, 估计器无偏.

随机样本比贪心回答好, 优势为正, 整段概率上调; 比贪心差, 优势为负, 整段下调. PPO 用 $V(s_t)$ 做类似的中心化, 代价是多训一个网络; ReMax 的代价是多一次贪心生成.

### 2.4 KL 怎么并进奖励

主文省略了 KL 正则, 附录 B 补上. 目标是

$$
\max_{\theta}\mathbb{E}[r(x,y)]-\beta\,\mathbb{E}\Bigl[\log\frac{\pi_{\theta}(y\mid x)}{\pi_{\mathrm{REF}}(y\mid x)}\Bigr]. \tag{7}
$$

$\pi_{\mathrm{REF}}$ 是参考模型, $\beta$ 是 KL 系数. KL 可以并进塑形奖励. one-step 形式把当前 token 的对数比加到终点奖励上:

$$
\widetilde r(x,y_{1:t})=r(x,y)-\beta\bigl(\log\pi_{\theta}(y_t\mid x,y_{<t})-\log\pi_{\mathrm{REF}}(y_t\mid x,y_{<t})\bigr). \tag{8}
$$

full-step 形式从 $t$ 累加到 $T$, 即动态规划里的 cost-to-go, PPO 常用这一种:

$$
\widetilde r(x,y_{1:t})=r(x,y)-\beta\sum_{h=t}^{T}\bigl(\log\pi_{\theta}(y_h\mid x,y_{<h})-\log\pi_{\mathrm{REF}}(y_h\mid x,y_{<h})\bigr). \tag{9}
$$

full-step 惩罚更重, KL 估计的噪声也更大. ReMax 把 $r(x,y)$ 换成 $r(x,y)-b(x)$ 后代入式 (8) 或式 (9). 附录 F.2 显示两种都能训练; full-step 效果更强, $\beta$ 要从 0.1 降到 0.01 才和 one-step 的曲线相当. Part I 主实验用 $\beta=0.1$, Part II 用 full-step.

参考模型在 ReMax 里只用于 KL, 不参与贪心基线; 基线查的是奖励模型. DPO 的隐式奖励才把参考策略写进减数. 代码在 [liziniu/ReMax](https://github.com/liziniu/ReMax).

## 3. 理论: 无偏, 收敛与方差条件

### 3.1 无偏性与收敛

**命题 1**: 式 (3)(4) 对目标 $\mathbb{E}_{x\sim\rho}\mathbb{E}_{y\sim\pi_{\theta}}[r(x,y)]$ 无偏, 方差上界为 $c\cdot r_{\max}^{2}\cdot T^{2}\cdot S^{2}/N$. $\rho$ 是 prompt 分布, $S$ 是 $\|\nabla_{\theta}\log\pi_{\theta}\|$ 的上界, $r_{\max}$ 是 $|r|$ 的上界, $c$ 是常数. 附录 C.1 的关键一步: 对任何与动作无关的常数 $b$, $\sum_z\nabla_{\theta}p_{\theta}(z)\,b=\nabla_{\theta}(1\cdot b)=0$. 给定 $(x,\theta)$ 时贪心轨迹确定, $r(x,\bar y)$ 对随机 $y$ 是常数, 所以基线项的期望为零. 只要基线和用来乘 $\nabla\log\pi$ 的那条样本统计独立, 无偏性就成立; 若把当前样本自己的奖励放进基线, 独立性就破坏了.

**命题 2** (非形式版, 形式版是附录命题 4): 学习率 $\eta_k=\mathcal{O}(1/\sqrt{k})$ 时, ReMax 在期望意义下收敛到驻点. 目标非凸, 不保证全局最优.

### 3.2 方差何时下降

**命题 3** 说明方差下降需要条件. 设定是 2 臂 bandit, softmax 参数化, 奖励为正, $a_1$ 是最优臂. 当

$$
\pi_{\theta}(a_1\mid x)\le 0.5+0.5\,\frac{r(x,a_1)}{r(x,a_1)-r(x,a_2)} \tag{5}
$$

时 (特别地, $\pi_{\theta}(a_1\mid x)\le0.5$ 时), 有 $\mathrm{Var}[\widetilde g]<\mathrm{Var}[\widehat g]$. 论文的解读是, 最优臂的概率还没占上风时, 减贪心基线有效; 策略已经过度集中到最优臂后, 最坏情况下方差可能反而更大.

按式 (5) 的字面, 奖励为正且 $a_1$ 最优时 $r(x,a_1)/(r(x,a_1)-r(x,a_2))>1$, 右侧大于 1, 条件总是成立; 括号里的 $\pi_\theta(a_1\mid x)\le0.5$ 是论文正文实际使用的充分条件. 下面用一个算例看方差变化. 设 $p=\pi_\theta(a_1\mid x)$, 对 softmax 参数 $\theta_{a_1}$ 求导, $\nabla\log\pi(a_1)=1-p$, $\nabla\log\pi(a_2)=-p$. 取 $r(a_1)=1$, $r(a_2)=0.5$.

- $p=0.3$: 贪心选 $a_2$, $b=0.5$. 不减基线时, 估计量以 0.3 的概率取 $1\times0.7=0.7$, 以 0.7 的概率取 $0.5\times(-0.3)=-0.15$, 均值 0.105, 方差约 0.152. 减基线后, 两个取值变成 $0.5\times0.7=0.35$ 和 0, 均值仍是 0.105, 方差约 0.026, 降到约六分之一.
- $p=0.9$: 贪心选 $a_1$, $b=1$. 不减基线时方差约 0.0272, 减基线后约 0.0182.

两种情形均值都不变, 这就是无偏; 方差的降幅在策略还不确定时最大.

### 3.3 最优常数基线与贪心近似

把基线从常数推广到任意 $b$, 单样本估计量 $(r-b)\nabla\log\pi$ 的方差是 $\mathbb{E}[(r-b)^2\|\nabla\log\pi\|^2]-\|\nabla J\|^2$. 对 $b$ 求导令其为零, 得到方差最小的常数基线

$$
b^{*}(x)=\frac{\mathbb{E}_{y\sim\pi_\theta}\bigl[r(x,y)\,\|\nabla_\theta\log\pi_\theta(y\mid x)\|^2\bigr]}{\mathbb{E}_{y\sim\pi_\theta}\bigl[\|\nabla_\theta\log\pi_\theta(y\mid x)\|^2\bigr]}. \tag{6}
$$

$b^{*}$ 是按得分函数范数平方加权的期望奖励, 精确计算要多次采样. 常用的 $\mathbb{E}_\pi[r]$ 是忽略权重后的近似. 贪心回答的奖励是更粗的近似, 只用一次确定性生成; 策略越集中, $\bar y$ 越接近高概率区域, 它与 $\mathbb{E}_\pi[r]$ 的差距越小. 论文认为这可以接受: RLHF 本来就不应把奖励模型优化到头, Gao 等 2023 的过优化曲线说明了这一点; 最坏情况下方差仍有界, 命题 2 的收敛结论不受影响. Dayan 1991 已经指出, 即使用 $\mathbb{E}_{\pi}[r]$ 做基线, 过优化区也存在同样的理论缺口.

与预先标准化奖励相比, 贪心基线随 prompt 变化, 也随训练进程变化. 论文脚注提到, Zheng 等 2023 那种训练前统计好的归一化, 训练中奖励分布变化后就不准; Zhao 等 2011 那种指数滑动平均把不同 prompt 混在一起, 对单条 prompt 当前的奖励水平反应慢.

## 4. 与 $b_{\mathrm{MA}}$, RLOO, PPO, DPO 的比较

### 4.1 与 RLOO, GRPO: 同样多一次生成

![PPO, 滑动平均, 留一法, 贪心基线四列](./images/fig-remax-vs-ppo-rloo.png)

> 图 2: 同一条 prompt 分四列. PPO 走 Actor, Critic, GAE, clip; 序列 REINFORCE 减历史滑动平均; RLOO 减其余 $k-1$ 条的均值, 不除标准差; ReMax 减贪心回答的奖励, 梯度只作用在随机样本上.

**图 2 解析**

- 顶栏是同一条 prompt $x$, 四列之间没有箭头.
- 橙列脚注 `four models, token MDP`, 只有这一列有价值网络.
- 绿列减的是 $b_{\mathrm{MA}}$, 脚注说明这是历史平均, 不区分 prompt.
- 紫列采 $k$ 条, 每条的基线不含自己, 脚注 `leave-one-out, not greedy`.
- 青绿列同时采随机 $y$ 和贪心 $\bar y$, 脚注 `greedy baseline, no V`.

RLOO 的其他样本也是随机采的, ReMax 的第二条是确定的贪心回答. 两者每条 prompt 都多一次生成, 统计含义不同: 留一法在同分布的 $k$ 条之间互为基线; 贪心基线取的是当前策略概率最大的那条路径. 贪心轨迹不进入策略梯度的期望, 只进入减数.

沿用第 3.2 节的 2 臂算例 ($p=0.3$, $r(a_1)=1$, $r(a_2)=0.5$) 比较 $k=2$ 的留一法. 两条独立样本 $a,a'$, 第一条的估计项是 $(r(a)-r(a'))\nabla\log\pi(a)$: $a=a_1,a'=a_2$ 时取 $0.5\times0.7=0.35$, 概率 0.21; $a=a_2,a'=a_1$ 时取 $(-0.5)\times(-0.3)=0.15$, 概率 0.21; 两条相同时为 0. 均值 0.105, 方差约 0.019, 略低于 ReMax 的 0.026. 差别在于留一法的两条样本都是随机的, 都贡献梯度; ReMax 的第二条只提供基线. 同样是两次生成, 留一法多拿到一条有梯度的样本, ReMax 换来的是基线随策略峰值移动.

GRPO 可以看成把留一法扩到 $G$ 条, 再除以组内标准差. 除标准差能消掉不同 prompt 的奖励尺度, 这正是 ReMax 用贪心基线想解决的问题之一; 代价是 $G$ 次生成和 Dr.GRPO 指出的难度偏差.

### 4.2 与 PPO, DPO: 少一个网络, 多一次采样

**相对 PPO**: ReMax 没有重要性比率 $\pi_{\theta}/\pi_{\mathrm{old}}$, 没有 clip, 没有 GAE $\lambda$, 没有价值损失. 时间结构也不同. 论文把单步拆成生成时间和反传时间: PPO 是一次生成加两次反传 (策略与价值), ReMax 是两次生成加一次反传. 生成通常比反传快, 所以总时间可能更短, Table 2 给出了实测.

**相对 DPO**: 论文 Table 1 比较了四项: 是否跨 prompt 适应奖励尺度, 是否随训练适应, 是否在线, 算力开销. DPO 能跨 prompt 适应 (隐式奖励里含 $\log\pi_{\mathrm{ref}}$), 但这个参照不随当前策略变化, 而且是离线方法, 没有 rollout. ReMax 四项都满足, 算力接近 DPO: 4 卡不开 offload 时两者最大 batch 都是 96; DPO 一个 epoch 1.4 小时, ReMax 1.8 小时, 慢约 1.3 倍, 慢在在线采样. DPO 需要成对偏好数据, 依赖 Bradley-Terry 模型和 KL 正则的假设; ReMax 只需要一个标量奖励, prompt 不必带偏好标注, 别人训好的奖励模型可以直接拿来用.

| | PPO | 序列 REINFORCE | RLOO | ReMax | DPO |
|--|-----|----------------|------|-------|-----|
| 动作 | token | 整段 $y$ | 整段 | 整段 | 离线成对 |
| 基线 | $V$ 加 GAE | $b_{\mathrm{MA}}$ | 其余 $k-1$ 条 | 贪心 $r(x,\bar y)$ | $\log\pi_{\mathrm{ref}}$ (隐式) |
| 额外网络 | 价值网络 | 无 | 无 | 无 | 无, 需要 $\pi_{\mathrm{ref}}$ |
| 在线 rollout | 要 | 要 | 要 | 要, 多一次贪心 | 不要 |

## 5. 实验与边界

### 5.1 Part I: Llama-2-7B, full-hh-rlhf

数据: full-hh-rlhf 训练集 112k 条, 评测集 12.5k 条, 按 InstructGPT 的做法切成 20% 给 SFT, 40% 给奖励模型, 40% 给 RL. SFT 每卡 batch 30, 学习率 $10^{-5}$, 2 个 epoch. 奖励模型每卡 batch 36, 学习率 $10^{-5}$, weight decay 0.1, 2 个 epoch, 评测准确率 63%. RL 学习率 $10^{-6}$, cosine 衰减, 1 个 epoch; PPO 与 ReMax 的 KL 系数都是 0.1; 生成温度 1, top-p 0.9. DPO 的 $\beta$ 在 $\{0.01,0.05,0.1\}$ 中搜索, 取 0.05.

**梯度范数**: Figure 5 中 ReMax 的评测奖励与 PPO 相当, Figure 6 中训练稳定, 没有 RL 常见的梯度剧烈波动. PPO 和 ReMax 的梯度范数都低于 DPO. 论文给了两个原因: DPO 的梯度估计要算两个得分函数 (优选回答和劣选回答各一个), ReMax 只算一个; DPO 不能按 token 数对对数似然做归一化, 否则论文式 (10) 中 DPO 目标的建模不成立, ReMax 则在 Algorithm 1 第 7 行做了这一归一化.

**胜率**: AlpacaEval 805 条指令, GPT-4 判与 SFT 模型的胜率, 生成用温度 0.7, top-p 0.9, 最长 512, 裁判用 `alpaca_eval_gpt4` 配置. 同一初始化下, ReMax 相对 SFT 提高 31.4 个点, 在 SFT, DPO, PPO, ReMax 四者中最高. 以 DPO 模型为初始化, 在只有 prompt 的数据上接着跑 ReMax, 胜率到 84.7%. 论文的解读是 DPO 提供了好的起点, 在线学习补上它在分布外 prompt 上的不足.

**算力** (Table 2): 33k 条数据, 长度 512, Offload 指把 AdamW 优化器状态放到 CPU. $T_{\mathrm{G}}$ 是单步生成时间, $T_{\mathrm{B}}$ 是单步反传时间.

| GPU | Offload | 方法 | 最大 batch | $T_{\mathrm{G}}$ | $T_{\mathrm{B}}$ | 一 epoch |
|-----|---------|------|-----------:|-----------------:|-----------------:|---------:|
| 4 | 否 | PPO | 显存不足 | | | |
| 4 | 否 | ReMax | 96 | 9.2s | 4.0s | 1.8h |
| 4 | 是 | PPO | 112 | 4.7s | 24.6s | 2.9h |
| 4 | 是 | ReMax | 152 | 10.4s | 14.0s | 2.0h |
| 1 | 是 | PPO | 30 | 5.2s | 30.4s | 12.8h |
| 1 | 是 | ReMax | 38 | 11.0s | 16.7s | 9.1h |

4 卡不开 offload 时 PPO 跑不起来, ReMax 可以. 开 offload 后, ReMax 的最大 batch 约是 PPO 的 $152/112\approx1.4$ 倍. 论文报的 1.6 倍加速对应 PPO 开 offload 的 2.9 小时与 ReMax 不开 offload 的 1.8 小时. 单卡两者都必须开 offload, ReMax 9.1 小时, PPO 12.8 小时. ReMax 的 $T_{\mathrm{G}}$ 更长, 因为多一次贪心生成; PPO 的 $T_{\mathrm{B}}$ 更长, 因为多一个价值网络; 合计仍是 ReMax 快.

记单次生成时间为 $t_{\mathrm{gene}}$, 单个网络的反传时间为 $t_{\mathrm{back}}$, 则每步大致有 $T_{\mathrm{PPO}}\approx t_{\mathrm{gene}}+2t_{\mathrm{back}}$, $T_{\mathrm{ReMax}}\approx 2t_{\mathrm{gene}}+t_{\mathrm{back}}$, 当 $t_{\mathrm{gene}}<t_{\mathrm{back}}$ 时 ReMax 每步更快. 用 4 卡开 offload 的一行验算: PPO 每步 $4.7+24.6=29.3$ 秒, batch 112, 每条样本约 0.26 秒; ReMax 每步 $10.4+14.0=24.4$ 秒, batch 152, 每条约 0.16 秒. 每条样本的时间比约 1.6, 一个 epoch 的时间比是 $2.9/2.0\approx1.45$. offload 让反传变慢, 也就放大了少一个网络的好处.

附录的实现细节解释了 offload 只加在哪里: 奖励模型和参考模型不训练, 用 ZeRO-3 加参数 offload; 可训练的模型不用 ZeRO-3 和参数 offload, 因为生成和训练会慢到无法接受, 生成用 hybrid engine. 表中的「Offload」指的是把 AdamW 的优化器状态卸到 CPU.

**ReMax-fast** (附录 F.3): 作者观察到, 一条回答截掉后半段, 奖励模型给的分数往往仍接近全文. 于是随机样本的长度不变, 只把贪心回答的长度上限减半, 取 128, 评测奖励与完整贪心基线相近; 再降到 64, 评测奖励明显下降. 自注意力计算量随长度二次增长, 论文据此估算贪心生成时间理论上能降到约 0.75 倍. Table 5 实测: 4 卡不开 offload, $T_{\mathrm{G}}$ 9.2s 降到 6.8s, $T_{\mathrm{B}}$ 3.8s, 一个 epoch 1.4 小时; 4 卡开 offload, batch 152, 8.0s 与 13.7s, 1.6 小时; 单卡开 offload, batch 38, 8.0s 与 13.1s, 6.4 小时. 相对 PPO 的 2.9 小时, 加速从 1.6 倍变为 2.1 倍. 截短不破坏命题 1 的无偏性, 因为基线仍与随机 $y$ 独立, 只可能使方差变大.

**小模型** (附录 F.4): GPT-2 (137M) 在 IMDB 情感任务上, 输入 64 个 token, 生成 48 个 token. PPO 内层 epoch 取 4 时, ReMax 加速 2.2 倍; 显存 15 GB 对 37 GB, 约省 60%.

### 5.2 Part II: Mistral-7B, UltraRM-13B

Part II 换成 Mistral-7B-Instruct-v0.2, 奖励模型用开源的 UltraRM-13B. 选 Mistral-7B 的理由是它在当时是最强的预训练模型之一, 其 SFT 版本在各基准上表现已经很好. UltraRM-13B 的训练数据包括 Stanford SHP, OpenAI summarization, Anthropic 的 full-hh-rlhf 和 UltraFeedback. 作者自己训的 Llama-2-13B 奖励模型在 full-hh-rlhf 上准确率约 65%, UltraRM 是 71%. 这里的数据只有 prompt, 没有人工偏好对, DPO 用不上. 设置: prompt 超过 384 token 的丢弃, 回答上限 384, 合计最长 784; 学习率 $5\times10^{-7}$, 奖励截断到 1.0, 温度 0.7, top-p 0.9, KL 用附录 B 的 full-step 形式; 论文写明这些超参没有搜索过. 每卡 batch 32, 40k 条 prompt 跑 1 个 epoch 用 9.5 小时.

prompt 来源试了三种: ultrafeedback (与奖励模型训练数据同分布), lmsys-chat-1m (真实用户提问), sharegpt-en (指令微调数据). AlpacaEval 这里报对 text-davinci-003 的胜率, MT-bench 是 80 道题的 GPT-4 打分, 满分 10.

| 数据 | 规模 | AlpacaEval | MT-bench |
|------|------|----------:|---------:|
| 未再训练 | 0k | 92.78% | 7.516 |
| ultrafeedback | 10k / 20k / 40k | 94.29 / 93.41 / 93.11 | 7.578 / 7.569 / 7.538 |
| lmsys-chat-1m | 10k / 20k / 40k | 94.40 / 93.91 / 92.86 | 7.584 / 7.659 / 7.638 |
| sharegpt-en | 10k / 20k / 40k | 94.28 / 94.78 / 92.80 | 7.606 / 7.739 / 7.534 |

三种来源都是先升后降, 40k 不如 20k, 论文把这归为过优化, 需要更强的正则. 最好的一格是 sharegpt-en 20k: AlpacaEval 94.78%, MT-bench 7.739. Table 4 列出的同期模型: Llama-2-7B-Chat 71.37% 与 6.269, Zephyr-7B-beta 90.60% 与 7.356, Llama-2-70B-Chat 92.66% 与 6.856, GPT-3.5-turbo 93.42% 与 7.944, GPT-4-turbo 95.28% 与 8.991. 这些是 AlpacaEval 对 text-davinci-003 的旧版口径, 后来换了裁判和参考模型的排行榜不能直接比.

### 5.3 RLVR 下的第三方对比

Yue 等 (arXiv:2504.13837) 在 VeRL 里重新实现了 PPO, GRPO, Reinforce++, RLOO, ReMax, DAPO, 用同一套设置比较: Qwen2.5-7B 基座, 去掉 KL, AdamW 恒定学习率 $10^{-6}$, prompt batch 256, 每题 8 条, 最长 8192 token, 温度 1.0, PPO mini-batch 256. 训练集是 Omni-MATH-Rule 的 2000 题, 域内测试 821 题, 域外用 MATH500. 规则奖励下 ReMax 的基线是「贪心解码是否答对」.

| 方法 | Omni 训练 pass@1 | 训练 pass@256 | Omni 测试 pass@1 | 测试 pass@256 | MATH500 pass@1 | pass@256 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen2.5-7B | 9.9 | 67.2 | 10.2 | 69.1 | 34.5 | 96.2 |
| GRPO | 26.1 | 66.3 | 25.1 | 68.3 | 74.4 | 97.2 |
| RLOO | 28.6 | 66.4 | 28.1 | 69.2 | 75.0 | 97.4 |
| ReMax | 24.4 | 65.5 | 23.8 | 67.5 | 73.5 | 96.6 |
| DAPO | 31.4 | 66.1 | 26.5 | 67.0 | 75.6 | 96.4 |

这一设置下 ReMax 的 pass@1 在六种方法里最低, pass@256 与表中其他方法相差不到 2 个点, 各方法的 pass@256 都没有明显超过基座. 0/1 奖励下贪心基线只有两个取值, 对方差的压缩不如组内多条样本的均值. 这组结果的详细讨论见 [4.5 RLVR 的局限性](../../4.5-GRPO家族与RLVR/09-RLVR的局限性与探索边界/09-RLVR的局限性与探索边界.md).

### 5.4 边界与失效

**过优化**: Part II 里 40k prompt 已经让 AlpacaEval 和 MT-bench 回落. 奖励模型有偏时, 在线方法会沿着偏差优化, ReMax 只是用更低的成本走到同一个结果. 论文把「如何从偏好推断奖励」「如何缓解奖励偏差」列为未解决的问题. 奖励模型的质量直接决定上限: Part I 自训奖励模型在评测集上的准确率只有 63%, 意味着约三分之一的偏好对排反; 贪心基线和随机样本由同一个奖励模型打分, 两者之差同样带着这部分噪声. Part II 换成准确率 71% 的 UltraRM 后, 只用 prompt 就能在已经很强的指令模型上继续提分.

**生成成本**: ReMax 每步多一次贪心生成, 每条 prompt 也要查两次奖励模型. 奖励模型比策略大时 (Part II 是 13B 奖励模型配 7B 策略), 第二次打分的开销不能忽略. 回答短时这点时间可以忽略; 长 CoT 场景下生成时间会占主导, Table 2 的结论 (512 token, 7B) 不能直接外推. ReMax-fast 的截短能缓解一部分.

**前提**: 快仿真, 确定转移, 轨迹级奖励三条少一条, ReMax 的动机就变弱. 随机环境, 逐步稠密奖励, 仿真很慢的控制任务里, 价值网络仍然有用.

**其他基线**: 裸 REINFORCE 在 OPT-1.3B 上梯度范数大, 奖励差; Llama-2-7B 上不发散, 但评测奖励仍明显低于 ReMax. 滑动平均 $b_{\mathrm{MA}}$ 能处理随时间变化的尺度, 处理不了单条 prompt 自身的奖励水平. RLOO 要 $k$ 条同分布样本, 显存和采样预算随 $k$ 增长.

**规则验证器**: 数学和代码用规则判分时, 贪心基线仍然合法, 因为规则判分也是轨迹级标量. 此时基线的含义变成「贪心解码能否通过验证」, 取值只有 0 和 1. 组内 $z$-score, 过程监督, 序列级 clip 这些做法分别见 [4.5 GRPO](../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) 与 [4.5 GSPO](../../4.5-GRPO家族与RLVR/04-GSPO/04-GSPO.md); ReMax 没有组, 没有标准差, 没有 clip.

**参考文献**

1. Li, Z., Xu, T., Zhang, Y., Lin, Z., Yu, Y., Sun, R., & Luo, Z.-Q. (2024). [ReMax: A Simple, Effective, and Efficient Reinforcement Learning Method for Aligning Large Language Models](https://arxiv.org/abs/2310.10505). *ICML*.
2. Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine Learning*.
3. Ahmadian, A., et al. (2024). [Back to Basics: Revisiting REINFORCE Style Optimization for Learning from Human Feedback in LLMs](https://arxiv.org/abs/2402.14740).
4. Schulman, J., et al. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
5. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290).
6. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760).
