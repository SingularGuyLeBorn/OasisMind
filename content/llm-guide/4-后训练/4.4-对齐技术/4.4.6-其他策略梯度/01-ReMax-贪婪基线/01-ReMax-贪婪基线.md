---
title: "01 · ReMax：贪婪解码当基线"
date: 2026-08-31
as_of: 2026-08-31
tags: [ReMax, REINFORCE, PPO, RLOO, RLHF, 基线]
---

# 01 ReMax：贪婪解码当基线

ReMax 把一条随机采样的回答，减去同一条 prompt 上贪心解码的奖励，当作策略梯度的权重。Critic 整份拿掉。名字就是 REINFORCE 加上 $\arg\max$。Li 等 *ReMax: A Simple, Effective, and Efficient Reinforcement Learning Method for Aligning Large Language Models*（[arXiv:2310.10505](https://arxiv.org/abs/2310.10505)，ICML）把这件事写成 Algorithm 1：`seq` 随机采，`seq_max` 设 `greedy=True`，奖励相减后再乘整段对数概率。邻居 [10-REINFORCE](../../4.4.1-基于奖励模型的RL-RLHF-PPO/10-REINFORCE-序列级策略梯度/10-REINFORCE-序列级策略梯度.md) 用的是跨 prompt 的滑动平均 $b_{\mathrm{MA}}$；[06-RLOO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/06-RLOO-留一法基线/06-RLOO-留一法基线.md) 用其余 $k-1$ 条。本篇钉的是当前策略自己的 greedy 回答。不是 PPO，没有 GAE 和 clip。不是 DPO，训练环里还在 rollout、还在查冻结的奖励模型。

## 1. PPO 在 RLHF 上多出来的那份 Critic

InstructGPT 那条三阶段还在：SFT、奖励模型、再用奖励抬策略。第三阶段默认走 PPO。Schulman 等把 PPO 做成一般 MDP 的工具：转移可以随机，仿真可以很慢，奖励可以逐步给。语言模型这边三条都不成立。论文把它收成三个性质。

快仿真。一条完整回答再过一遍冻结 RM，7B 以下在当时的 GPU 上通常不超过十秒。长期回报不再是要等几千步才看得到的折扣和，它就是这条轨迹的标量 $r(x,y)$。

确定转移。状态 $s_t=(x,y_{<t})$，动作是下一个 token。写下去之后下一状态就是拼上这个 token，转移核是指示函数，没有环境噪声。随机只来自策略自己。

轨迹级奖励。中间 token 的逐步奖励写成 0，只有写完才给 $r(x,y)$。形式上仍可塞进 token 级 MDP，但那是为 GAE 准备的脚手架，不是奖励真正存在的地方。

这三条对上之后，价值网络要解决的那两类麻烦——随机环境里复用旧数据、慢仿真里快速估回报——在 RLHF 里并不急。PPO 仍然带着一份和策略差不多大的 Critic，还要存梯度、存 Adam 状态。附录 E.3 按 Llama-2-7B 算过：可训练一份约 147.02 GB，冻结的 RM 或参考约 12.55 GB。PPO 是两份可训练加两份冻结，合计 319.14 GB；ReMax 只留一份可训练加两份冻结，172.12 GB，大约是 PPO 的 54%。摘要写相对 PPO 省约 46% 显存。脚注拆得更细：冻结 RM 大约只占 4%，价值网络连同激活、梯度、优化器大约占 46%。省掉的是那 46%，不是把奖励模型也卸了。

PPO 还带一串旋钮：重要性采样的 clip、GAE 的 $\lambda$、价值网络自己的学习率、off-policy 内层 epoch。ReMax 把这四只拿掉。实现上 Algorithm 1 的主干大约六行，对照 PPO 三十行以上。少旋钮不是修辞，是 7B 上扫超参本身就很贵。

4.4.1 已经排满 10 篇，不能再发 11。本篇落到新建的 4.4.6。序列 bandit 的记号沿用 [10-REINFORCE](../../4.4.1-基于奖励模型的RL-RLHF-PPO/10-REINFORCE-序列级策略梯度/10-REINFORCE-序列级策略梯度.md)：整段 $y$ 当一个动作，终局标量乘整段 $\nabla\log\pi$。换的是减数。

## 2. 从 REINFORCE 到减一条贪婪回答

固定一条 prompt $x$，REINFORCE 的策略梯度是

$$
\nabla_{\theta}\mathbb{E}_{y\sim\pi_{\theta}}[r(x,y)]
=\mathbb{E}_{y\sim\pi_{\theta}}\Bigl[\sum_{t=1}^{T}\nabla_{\theta}\log\pi_{\theta}(y_t\mid x,y_{<t})\,r(x,y)\Bigr]. \tag{1}
$$

$N$ 条 prompt 上的随机梯度写成

$$
\widehat g(\theta)=\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}s_{\theta}(x^{i},y_{1:t}^{i})\,r(x^{i},y^{i}), \tag{2}
$$

其中 $s_{\theta}(x,y_{1:t})=\nabla_{\theta}\log\pi_{\theta}(y_t\mid x,y_{<t})$，$y_t^{i}\sim\pi_{\theta}(\cdot\mid x^{i},y_{<t}^{i})$。这就是奖励加权的似然。和 SFT 的差别在样本从哪来：SFT 的 $y$ 事先写好，ReMax 的 $y$ 是当前 $\pi_{\theta}$ 自己吐出来的。

式 (2) 无偏，方差大。论文用梯度范数当代理：对随机变量 $Z$，$\mathbb{E}[|Z|]\le\sqrt{\mathrm{Var}[Z]+(\mathbb{E}[Z])^{2}}$，范数小通常方差也小。OPT-1.3B 上 Figure 4：裸 REINFORCE 的范数明显高于 ReMax，评测奖励也更差。附录 F.1 把同一套设定抬到 Llama-2-7B，曲线不至于发散，评测奖励仍明显弱于带 greedy 基线的那条。规模本身填不平这截方差。方差有两处来源。环境转移的外部随机，在确定转移的 RLHF 里已经没了。剩下的是策略自己的内部随机：词表大，不同 prompt 的奖励尺度差一截。Llama-2-7B 一个 mini-batch 里，奖励从 $-14.25$ 到 $7.25$。训完一个 epoch 还从 $-8.125$ 到 $7.56$。开放题「写一篇短故事」和封闭题「新西兰首都是哪」不是同一把尺。SFT 相当于每条都乘 $1$，尺度稳；裸 REINFORCE 把这把尺直接乘进梯度。词表名义上几万维，随机样本和 mode 可以差很远，减数才站得住。

减一个与当前这条样本独立的基线 $b(x)$，期望不变、方差可以降：

$$
\widetilde g(\theta)=\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\bigl[s_{\theta}(x^{i},y_{1:t}^{i})\times\bigl(r(x^{i},y^{i})-b_{\theta}(x^{i})\bigr)\bigr]. \tag{3}
$$

ReMax 的选择是当前策略的贪心解码：

$$
b_{\theta}(x)=r(x,\bar y),\qquad \bar y_t\in\arg\max_{a}\pi_{\theta}(a\mid x,\bar y_{<t}). \tag{4}
$$

$\bar y$ 是 $\pi_{\theta}$ 的 mode，不是另一条随机样本，也不是历史平均。随机样本 $y$ 和这条 greedy 轨迹条件独立（给定 $x$ 和 $\theta$），无偏性才能站住。伪代码就是论文 Algorithm 1：

```python
for prompt in datasets:
    seq = lm.sample(prompt, greedy=False)
    seq_max = lm.sample(prompt, greedy=True)
    rew = rm(prompt, seq) - rm(prompt, seq_max)
    logp = lm.inference(prompt, seq)
    loss = -(logp.sum(dim=-1) * rew).mean()
    lm.minimize(loss)
```

`seq_max` 只进奖励减法，不进 `logp`。梯度只流过随机采样的那条 $y$。贪心回答当对照尺，不当训练目标。RAFT 是只对 $\arg\max$ 做交叉熵，其余丢掉；这里恰好相反：冠军用来当减数，更新打在随机样本上。

手算一条。设随机样本三个 token 的对数概率是 $-0.4$、$-0.8$、$-0.2$，和为 $-1.4$。冻结 RM 给这条 $r=2.1$，给 greedy 那条 $r=1.4$。优势 $A=0.7$。Algorithm 1 的损失是 $-\bigl((\sum_t\log\pi)\cdot A\bigr)=-((-1.4)\times 0.7)=0.98$。最小化这份损失，等于把整段 $\nabla\log\pi$ 乘 $+0.7$ 做上升。三个 token 拿到同一个权重，没有逐步 TD。若随机样本掉到 $0.9$，优势 $-0.5$，整段往下压。greedy 那条的 token 对数概率不出现在损失里：它再流畅，也不当正例克隆。评测 AlpacaEval 时生成改温度 $0.7$、top-p $0.9$、最长 512，裁判用 alpaca_eval_gpt4 那套配置，和训练环温度 $1$ 不是同一档。

和 [10-REINFORCE](../../4.4.1-基于奖励模型的RL-RLHF-PPO/10-REINFORCE-序列级策略梯度/10-REINFORCE-序列级策略梯度.md) 那道 $b_{\mathrm{MA}}=(1.2+0.8+1.5+0.4)/4=0.975$ 的题对一下。滑动平均问的是「过去所有 prompt 的奖励大概在哪」；这里问的是「当前这条 $x$、当前这套权重，mode 值多少」。同一条 $x$ 上两把尺共用一个 RM，跨题的 $-14$ 到 $+7$ 被减掉一截。把当前这条 $r(x,y)$ 自己加进基线再减，独立性和 Bartlett 那步对不上，无偏性要另证。

![随机采样减贪心基线再乘对数概率](./images/fig-remax-greedy-baseline.png)

> 图 1：同一条 prompt 分出两路。左路随机采样 $y$，过冻结 RM 得 $r(x,y)$；右路贪心得到 $\bar y$，奖励当作 $b(x)$。两者相减得到优势 $A$，只乘随机样本的 $\sum_t\log\pi_{\theta}(y_t)$。

**图 1 解析**

- 顶上黄框是 prompt $x$，向下分叉，没有从空白处出线。
- 左列绿框采 $y$，橙框查冻结 RM；右列青绿框走 $\arg\max$，奶油框写出 $b(x)=r(x,\bar y)$。
- 鲑肉色框做减法 $A=r-b$。粉框是损失，对数概率只写在 $y$ 上。
- 底注写明没有 Critic $V$。$\bar y$ 不依赖这条随机 $y$，估计器无偏。

直觉上，这是在拿「当前策略自己最自信的那条」当零点。随机样本比 greedy 更好，优势为正，整段往上抬；更差则为负，往下压。同一条 prompt 上两把尺用的是同一个 RM，跨 prompt 的绝对尺度被减掉一截。PPO 用 $V(s_t)$ 做类似的归一，账单是再训一份网络。ReMax 多一次 greedy 前向，不训第二份权重。

## 3. 为什么无偏，方差什么时候真降

命题 1：式 (3)(4) 对目标 $\mathbb{E}_{x\sim\rho}\mathbb{E}_{y\sim\pi_{\theta}}[r(x,y)]$ 无偏。方差有界 $c\cdot r_{\max}^{2}\cdot T^{2}\cdot S^{2}/N$，其中 $S$ 是 $\|\nabla_{\theta}\log\pi_{\theta}\|$ 的上界，$r_{\max}$ 是 $|r|$ 的上界。附录 C.1 的关键步是 Bartlett 恒等式：对任意与动作无关的常数 $b$，$\sum_z\nabla_{\theta}p_{\theta}(z)\,b=\nabla_{\theta}(1\cdot b)=0$。greedy 轨迹在给定 $(x,\theta)$ 时是确定的，于是 $r(x,\bar y)$ 对随机 $y$ 是常数，第二项期望为零。基线只要统计独立于用来乘 $\nabla\log\pi$ 的那条样本，无偏就在。把当前这条 $y$ 自己加进基线再减，独立性破了，那是另一条估计器。

命题 2（非形式；形式版是附录命题 4）：学习率 $\eta_k=\mathcal{O}(1/\sqrt{k})$ 时，ReMax 在期望意义下收到驻点。目标非凸，不承诺全局最优。

方差降低不是无条件的。命题 3 限制在 2-臂 bandit、softmax 参数化、奖励为正、最优臂为 $a_1$。当

$$
\pi_{\theta}(a_1\mid x)\le 0.5+0.5\frac{r(x,a_1)}{r(x,a_1)-r(x,a_2)}
$$

（特别地，$\pi_{\theta}(a_1\mid x)\le 0.5$）时，$\mathrm{Var}[\widetilde g]<\mathrm{Var}[\widehat g]$。最优臂还没占上风，减 greedy 有用；已经过优化、mode 压过一切之后，方差可能反而更大。论文把这当成可接受的副作用：RLHF 本来就不该把奖励模型过拟合到头，Gao 等 2023 的过优化曲线就在旁边。最坏情况方差仍有界，命题 2 的收敛叙述不受影响。Dayan 1991 已经指出，即使用 $\mathbb{E}_{\pi}[r]$ 当基线，过优化区也会有同样的理论缺口。不是单样本估计特有的病。

和「事先把奖励标准化」比，greedy 基线跟着 prompt 走，也跟着训练走。Zheng 等 2023 那种预先归一，训到中途分布变了就失效。Zhao 等 2011 那种指数滑动平均，跨 prompt 混在一起，对「这一条 $x$ 现在值多少」反应慢。那正是 [10-REINFORCE](../../4.4.1-基于奖励模型的RL-RLHF-PPO/10-REINFORCE-序列级策略梯度/10-REINFORCE-序列级策略梯度.md) 的 $b_{\mathrm{MA}}$。ReMax 不混历史，只问当前 $\pi_{\theta}$ 的 mode 值多少。

## 4. 和 $b_{\mathrm{MA}}$、RLOO、PPO、DPO 差在哪

四条路径可以共用同一条 prompt，减数完全不同。

![PPO、滑动平均、留一法、贪婪基线四列](./images/fig-remax-vs-ppo-rloo.png)

> 图 2：同一条 prompt 分四列。PPO 走 Actor、Critic、GAE、clip；序列 REINFORCE 减历史滑动平均；RLOO 减其余 $k-1$ 条均值且不除 std；ReMax 减 greedy 回答的奖励，梯度只打在随机样本上。

**图 2 解析**

- 顶栏是同一条 prompt $x$。四列之间没有箭头。
- 橙列脚注 `four models, token MDP`。价值网络在这一列，不在右边三列。
- 绿列减的是 $b_{\mathrm{MA}}$，脚注写明历史平均、不是按 prompt。
- 紫列采 $k$ 条，基线不含自己，脚注 `leave-one-out, not greedy`。
- 青绿列同时采随机 $y$ 和 greedy $\bar y$，脚注 `greedy baseline, no V`。不要把这一列读成 RLOO 的 $k=2$。

RLOO 的第二条样本也是随机的。ReMax 的第二条是确定的 mode。预算都是「每条 prompt 多走一次生成」，统计意义不一样：留一法在同分布的 $k$ 条里互相当尺子；greedy 是在当前策略的峰值上钉一根。不要把 $\bar y$ 写成「再采一条温度 0 的样本就等于 RLOO」。温度 0 的轨迹不进策略梯度的期望，只进减数。

相对 PPO。ReMax 没有重要性比率 $\psi=\pi_{\theta}/\pi_{\mathrm{old}}$，没有 clip $\delta$，没有 GAE $\lambda$，没有价值损失。时间账也不一样。论文把单步拆成生成时间 $t_{\mathrm{gene}}$ 和反传时间 $t_{\mathrm{back}}$：PPO 是一次生成加两次反传（策略 + 价值），ReMax 是两次生成加一次反传。生成通常比反传快，所以净时间仍可能更短。这是 Table 2 的来源，不是口头「少一个模型所以一定快」。

相对 DPO。论文 Table 1 把适应奖励（跨 prompt / 训练中）、是否在线、算力四格摊开。DPO 跨 prompt 能适应（隐式奖励里有 $\log\pi_{\mathrm{ref}}$），训练过程中那根尺子不跟着当前 $\pi_{\theta}$ 的 mode 走，而且离线、没有 rollout。ReMax 四格都打勾，算力接近 DPO：4 卡、不开 offload 时两者最大 batch 都是 96；DPO 一个 epoch 1.4 小时，ReMax 大约慢 1.3 倍，慢在在线采样。DPO 吃的是成对偏好，绑死 Bradley-Terry 和 KL 正则那套假设。ReMax 只假设有一个标量奖励，prompt 不必带偏好标注。别人训好的 UltraRM 可以直接拿来打分，DPO 做不到这件事。

| | PPO | 序列 REINFORCE | RLOO | ReMax | DPO |
|--|-----|----------------|------|-------|-----|
| 动作 | token | 整段 $y$ | 整段 | 整段 | 离线成对 |
| 基线 | $V$ + GAE | $b_{\mathrm{MA}}$ | 其余 $k-1$ | greedy $r(x,\bar y)$ | $\log\pi_{\mathrm{ref}}$（隐式） |
| 额外网络 | Critic | 无 | 无 | 无 | 无，但要 $\pi_{\mathrm{ref}}$ |
| 在线 rollout | 要 | 要 | 要 | 要（多一次 greedy） | 不要 |

不要把 ReMax 写成「PPO 去掉 clip」。不要把 greedy 基线写成 Ahmadian 的 $b_{\mathrm{MA}}$。不要把两条生成写成 RLOO 的 $k=2$。

## 5. Llama-2-7B 和 Mistral-7B 上的数字

Part I 用 Llama-2-7B 和 full-hh-rlhf。训练集 112k、评测 12.5k，按 InstructGPT 切成 20% SFT、40% 奖励模型、40% RL。4×A800-80GB，bf16。SFT 与 RM 学习率 $10^{-5}$，各两 epoch，总长 512。RM 评测准确率 63%。RL 学习率 $10^{-6}$，余弦衰减、无 warmup，一 epoch。PPO 和 ReMax 的 KL 系数都是 $0.1$，生成温度 $1$、top-p $0.9$。DPO 的 $\beta$ 在 $\{0.01,0.05,0.1\}$ 里扫过，取 $0.05$。AdamW 的 $\beta_1=0.9$、$\beta_2=0.95$。可训练模型走 ZeRO-2，不走 ZeRO-3；冻结的 RM 和参考走 ZeRO-3 加重参数 offload。混合引擎来自 DeepSpeed-Chat 那条线。

训练曲线上 ReMax 的评测奖励和 PPO 相当，梯度范数没有裸 REINFORCE 那种鼓包。DPO 的范数反而更高：一条损失要算两条样本的 score function，对数似然也不能按 token 平均，否则式 (10) 的 BT 推导对不上。ReMax 的 `logp.sum` 可以按长度收一收，论文把这写成稳定训练的原因之一。

AlpacaEval 805 条，GPT-4 打与 SFT 的胜率。同一套初始化，ReMax 相对 SFT 提高 31.4 个点，在 SFT / DPO / PPO / ReMax 里最高。再用 DPO 当初始化、拿 prompt-only 数据接 ReMax，胜率到 84.7%。论文把这读成：DPO 是好的起点，在线学习补它的分布外缺口。不要把 84.7% 写成单次 ReMax 对 SFT 的数字。

算力看 Table 2。数据是 33k 条、长度 512。Offload 指 AdamW 优化器放到 CPU。

| GPU | Offload | 方法 | 最大 batch | $T_{\mathrm{G}}$ | $T_{\mathrm{B}}$ | 一 epoch |
|-----|---------|------|-----------:|-----------------:|-----------------:|---------:|
| 4 | 否 | PPO | 训不动 | — | — | — |
| 4 | 否 | ReMax | 96 | 9.2s | 4.0s | 1.8h |
| 4 | 是 | PPO | 112 | 4.7s | 24.6s | 2.9h |
| 4 | 是 | ReMax | 152 | 10.4s | 14.0s | 2.0h |
| 1 | 是 | PPO | 30 | 5.2s | 30.4s | 12.8h |
| 1 | 是 | ReMax | 38 | 11.0s | 16.7s | 9.1h |

4 卡不开 offload，PPO 训不动，ReMax 可以。开了 offload，ReMax 的 batch 大约是 PPO 的 $152/112\approx 1.4$ 倍。墙钟按 2.9h / 1.8h 约 1.6 倍。单卡同样只有开 offload 才转得动，ReMax 9.1h 对 PPO 12.8h。$T_{\mathrm{G}}$ 上 ReMax 更长，因为多一次 greedy；$T_{\mathrm{B}}$ 上 PPO 更长，因为多一份价值网络。净时间仍是 ReMax 短。内存读得慢的机器上，少 offload 的那一截会更明显。

附录 F.3 还试过把 greedy 轨迹截短，名叫 ReMax-fast。他们观察到：同一条回答截掉后半段，RM 分数往往仍接近全文。实验里随机样本的长度不动，只把 greedy 上限收到 128（原文生成长度 512 的一半量级），评测奖励和完整 greedy 差不多；收到 64 就明显掉。自注意力按长度二次，论文按这个粗算，greedy 生成时间理论上能缩到约 $0.75$。Table 5：4 卡不开 offload，ReMax-fast 的 $T_{\mathrm{G}}$ 从 9.2s 降到 6.8s，一 epoch 从 1.8h 到 1.4h；相对 PPO 的 2.9h，大约 $2.9/1.4\approx 2.1$ 倍，不再是主文的 1.6 倍。截短不破坏命题 1 的无偏——基线仍然独立于随机 $y$——只可能抬方差。不要把 64 token 的 greedy 当成默认可用。

Part II 换 Mistral-7B-Instruct-v0.2，奖励模型是开源 UltraRM-13B。这是弱监督：prompt 不必带人标对，DPO 吃不到这份数据。超参和 Part I 不同：prompt 长于 384 的丢掉，回复上限 384，prompt+回复最长 784。学习率 $5\times 10^{-7}$，奖励截断 $1.0$，温度 $0.7$，top-p $0.9$，走附录 B 的 full-step KL。这些数论文写明没扫过，贵。prompt 来源试了三条：ultrafeedback（和 RM 同分布）、lmsys-chat-1m（真实用户）、sharegpt-en（指令微调集）。AlpacaEval 是对 text-davinci-003 的胜率，上限 100%；MT-bench 80 题 GPT-4 打分，上限 10。

| 数据 | 规模 | AlpacaEval | MT-bench |
|------|------|----------:|---------:|
| 未再训 | 0k | 92.78% | 7.516 |
| ultrafeedback | 10k / 20k / 40k | 94.29 / 93.41 / 93.11 | 7.578 / 7.569 / 7.538 |
| lmsys-chat-1m | 10k / 20k / 40k | 94.40 / 93.91 / 92.86 | 7.584 / 7.659 / 7.638 |
| sharegpt-en | 10k / 20k / 40k | 94.28 / 94.78 / 92.80 | 7.606 / 7.739 / 7.534 |

三条线都先升后掉。40k 比 20k 差，论文直接写成过优化，要正则。prompt 怎么选，当时没有结论。最好的一格是 sharegpt-en 20k：AlpacaEval **94.78%**，MT-bench **7.739**。Table 4 把邻居摆在旁边：Llama-2-7B-Chat 71.37% / 6.269，Zephyr-7B-beta 90.60% / 7.356，Llama-2-70B-Chat 92.66% / 6.856，GPT-3.5-turbo 93.42% / 7.944，GPT-4-turbo 95.28% / 8.991。这是 2023–2024 年那一版 AlpacaEval（对 davinci-003）和 MT-bench 的口径，不要外推到后来换裁判、换参考的排行榜。摘要写「当时开源 7B 的 SOTA」，指的就是这一格，不是 2026 年的全场。

## 6. KL 怎么扣进奖励

主文把 KL 正则省略，附录 B 补上。目标是

$$
\max_{\theta}\mathbb{E}[r(x,y)]-\beta\mathbb{E}\Bigl[\log\frac{\pi_{\theta}(y\mid x)}{\pi_{\mathrm{REF}}(y\mid x)}\Bigr]. \tag{5}
$$

可以折进塑形奖励。one-step 把逐步 KL 加在终点奖励上：

$$
\widetilde r(x,y_{1:t})=r(x,y)-\beta\bigl(\log\pi_{\theta}(y_t\mid x,y_{<t})-\log\pi_{\mathrm{REF}}(y_t\mid x,y_{<t})\bigr). \tag{6}
$$

full-step 从 $t$ 加到 $T$，是动态规划里的 cost-to-go，PPO 常用这一支：

$$
\widetilde r(x,y_{1:t})=r(x,y)-\beta\sum_{h=t}^{T}\bigl(\log\pi_{\theta}(y_h\mid x,y_{<h})-\log\pi_{\mathrm{REF}}(y_h\mid x,y_{<h})\bigr). \tag{7}
$$

full-step 惩罚得更重，估计 KL 时噪声也更大。ReMax 把 $r(x,y)$ 换成 $r(x,y)-b(x)$ 再套进 (6) 或 (7)。附录 F.2：两条都能训。full-step 效力更大，要把 $\beta$ 从 $0.1$ 降到 $0.01$ 才和 one-step 的曲线可比。Part I 的主实验 $\beta=0.1$；Part II 走 full-step。不要把 DPO 扫出来的 $\beta=0.05$ 焊到 ReMax 上。

参考模型在 ReMax 里只为 KL 服务，不参与 greedy 基线。基线问的是奖励模型，不是 $\log\pi_{\mathrm{REF}}$。DPO 的隐式奖励才把参考策略写进减数。实现上冻结 RM 和参考可以 ZeRO-3 加重参数 offload；正在训的语言模型不行，论文写 ZeRO-3 会让生成加反传慢到不能用，这也是 Zheng 等 2023 那篇 PPO 实现细节里提过的。代码在 https://github.com/liziniu/ReMax。

## 7. 失效与边界

40k prompt 已经把 AlpacaEval 和 MT-bench 拉回去。奖励模型有偏时，在线方法会顺着偏走，只是 ReMax 比 PPO 更便宜地走到那条弯路。论文自己把「如何从偏好推断奖励、如何缓解奖励偏差」列为本文没做的事。

greedy 多一次生成。短回复上这点墙钟可忽略；长思维链上 $t_{\mathrm{gene}}$ 会重新占上风。附录还试过「快 greedy」（截断采样一类），稳定起见仍配 full-step KL。不要默认两次生成永远比训 Critic 便宜，Table 2 的口径是 512 token、7B、A800。

确定转移、轨迹级奖励、快仿真这三条少一条，ReMax 的动机就弱。随机环境、逐步稠密奖励、仿真很慢的控制任务，价值网络仍有用。不要把本篇写成「PPO 过时了」。

裸 REINFORCE 在 OPT-1.3B 上范数大、奖励差；Llama-2-7B 上不至于发散，评测奖励仍明显弱于 ReMax。滑动平均 $b_{\mathrm{MA}}$ 能压一部分跨时间的尺度，压不住「这一条 $x$ 的 mode 值多少」。RLOO 要 $k$ 条同分布样本，显存和采样预算跟 $k$ 走。ReMax 的第二条是确定的，方差分析走的是另一套。

DPO 仍然更省：不用 RM、不用在线采样。Part I 里它的 AlpacaEval 低于 ReMax，Part II 那种「只有 RM、没有偏好对」的数据它吃不到。选用哪条，看手里有没有现成 RM、有没有成对数据、卡能不能装下 Critic。

组内 $z$-score 也不在本篇。[02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 同一道题采 $G$ 条，均值含自己，再除组内标准差，后面仍接 PPO 式 clip。ReMax 没有组、没有 std、没有 clip。过程监督按步骤给分、优势向后累加，那是 GRPO §4.1 的事。clip 打在序列几何平均 $s_i$ 上走 [03-GSPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/03-GSPO/03-GSPO.md)。数学 / 代码用规则验证器时，greedy 基线仍然合法——规则打分也是轨迹级标量——只是「mode 好不好」变成「贪心解码过不过测试」，和 RM 打分不是同一把尺。

## 参考文献

1. Li, Z., Xu, T., Zhang, Y., Lin, Z., Yu, Y., Sun, R., & Luo, Z.-Q. (2024). [ReMax: A Simple, Effective, and Efficient Reinforcement Learning Method for Aligning Large Language Models](https://arxiv.org/abs/2310.10505). *ICML*。（HTML：[arXiv HTML](https://arxiv.org/html/2310.10505)）
2. Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine Learning*.
3. Ahmadian, A., et al. (2024). [Back to Basics: Revisiting REINFORCE Style Optimization for Learning from Human Feedback in LLMs](https://arxiv.org/abs/2402.14740).（序列级 $b_{\mathrm{MA}}$，正本在 4.4.1/10）
4. Schulman, J., et al. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
5. Rafailov, R., et al. (2023). [Direct Preference Optimization](https://arxiv.org/abs/2305.18290).
6. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760).
