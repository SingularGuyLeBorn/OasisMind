---
title: "04 · GSPO: 序列级重要性采样与 DCPO 动态裁剪"
published: true
tags: ["GSPO", "DCPO", "GRPO", "PPO", "RLVR", "序列级重要性采样", "动态裁剪"]
excerpt: "GSPO 把重要性比率从 token 提到整条回答, clip 作用在长度归一化的序列比率上; DCPO 留在 token 级, 让裁剪界随旧概率变化, 并用跨步累积统计救回全同奖励组."
---
# 04 GSPO: 序列级重要性采样与 DCPO 动态裁剪

> 相关阅读: [01-GRPO](../01-GRPO/01-GRPO.md) · [05-GMPO](../05-GMPO/05-GMPO.md) · [04-PPO](../../4.4-强化学习基础/04-PPO/04-PPO.md) · [4.5 GRPO 家族与 RLVR](../4.5-GRPO家族与RLVR.md) · [4.4.0 强化学习的数学原理](../../4.4-强化学习基础/01-强化学习的数学原理/01-强化学习的数学原理.md)

## 1. 问题与序列比率

### 1.1 GRPO 的比率放在哪一层

旧策略 $\pi_{\theta_{\mathrm{old}}}$ 对题目 $x$ 采出 $G$ 条回答 $y_1,\ldots,y_G$. 当前策略 $\pi_\theta$ 在第 $i$ 条的第 $t$ 个位置上的重要性比率是

$$
\eta_{i,t}(\theta)=\frac{\pi_\theta(y_{i,t}\mid x,y_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid x,y_{i,<t})}. \tag{1}
$$

GRPO 的代理目标 (省略 KL 项) 对组内 $G$ 条和每条的每个位置取平均:

$$
\mathcal{J}_{\mathrm{GRPO}}(\theta)=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\min\Bigl(\eta_{i,t}\hat{A}_{i},\;\mathrm{clip}(\eta_{i,t},1-\varepsilon,1+\varepsilon)\hat{A}_{i}\Bigr)\Biggr]. \tag{2}
$$

$\hat{A}_i$ 是组内 $z$-score, 一条回答里所有 token 共用. 奖励 $r(x,y_i)$ 由规则校验或奖励模型对整条回答给出一个数. 优势在序列级, 比率和 clip 在 token 级.

### 1.2 这种错位带来的三个问题

1. **单样本的重要性权重起不到校正作用.** 重要性采样用行为分布 $\pi_{\mathrm{beh}}$ 的样本估计目标分布 $\pi_{\mathrm{tar}}$ 下的期望, 要在许多样本上平均 $\frac{\pi_{\mathrm{tar}}(z)}{\pi_{\mathrm{beh}}(z)}f(z)$ 才能把分布差异校正回来. 式 (1) 在每个位置 $t$ 只用了一个采样 token $y_{i,t}$, GSPO 论文据此认为 $\eta_{i,t}$ 校正不了下一个 token 分布的差异, 只是往梯度里加进高方差噪声.
2. **噪声随长度累积, clip 会放大它.** 长 CoT 回答有几千个位置, 每个位置的 $\eta$ 各自抖动, 再各自被 clip 截断. 论文观察到这类崩溃往往不可逆: 退回旧 checkpoint, 调 clip 范围, 加长生成长度, 换训练题, 都不一定能恢复.
3. **多 mini-batch 更新带来 off-policy.** 大规模 RL 会把一大批 rollout 切成几个 mini-batch 依次更新. 论文实验切成 4 份. 从第二个 mini-batch 起, 样本来自 $\pi_{\theta_{\mathrm{old}}}$, 正在更新的是已经动过的 $\pi_\theta$, 比率偏离 1 的情况变多, clip 才真正起作用. clip 作用在哪一层, 决定了被挡掉的是一个 token 还是一整条回答.

用一个位置看第 2 点. 设 $\hat{A}_i=+1$, $\varepsilon=0.2$, 某个 token 的 $\eta_{i,t}=1.8$. 式 (2) 里这一项被锁在 $1.2$, 继续抬高这个 token 的概率不再增加目标, 梯度为 0. 同一条回答里另一个 $\eta=0.95$ 的 token 仍以 $0.95$ 的权重参与梯度. 这条回答整体是「答对了」, 奖励没有按位置区分, 梯度系数却已经按位置拆开.

PPO 当初按 token 写目标, 有两个前提: 对话回答较短, 并且有价值网络 $V_\psi$ 为每个前缀给出优势估计. GRPO 去掉了 $V_\psi$, 优势只剩序列级的一个数, token 级比率就失去了与之配套的 token 级优势.

![GRPO 逐 token 重要性比率与 GSPO 序列几何平均](./images/fig-gspo-seq-vs-token-is.png)

**图 1 解析**

- 上下两栏都从左边的绿框「sequence $y$」出发, 终点都是右边的粉框「loss」.
- 上栏是 GRPO: 回答被拆成四个黄框 $\eta_1,\eta_2,\eta_3,\eta_T$, 每个都是 token 级比率; 随后进入橙框「clip per token」, 每个位置各自裁剪. 栏下注释写明奖励是序列级, 权重是 token 级.
- 下栏是 GSPO: 回答先进入蓝框「$s_i$ geometric mean」, 合成一个数; 随后进入橙框「clip on $s_i$」, 整条回答只裁剪一次. 栏下注释写明整条回答共用一个权重.
- 黄框表示同一条回答里的 token 位置, 与 MoE 专家无关.

### 1.3 序列比率 $s_i$ 的定义

一条回答的似然是逐 token 条件概率的乘积:

$$
\pi_\theta(y_i\mid x)=\prod_{t=1}^{|y_i|}\pi_\theta(y_{i,t}\mid x,y_{i,<t}). \tag{3}
$$

直接取 $\pi_\theta(y_i\mid x)/\pi_{\theta_{\mathrm{old}}}(y_i\mid x)$ 当序列权重, 数值对长度极其敏感. GSPO 在指数上除以长度:

$$
s_i(\theta)=\Bigl(\frac{\pi_\theta(y_i\mid x)}{\pi_{\theta_{\mathrm{old}}}(y_i\mid x)}\Bigr)^{1/|y_i|}=\exp\Bigl(\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\log\eta_{i,t}(\theta)\Bigr). \tag{4}
$$

式 (4) 右边是 $\log\eta_{i,t}$ 的均值再取指数, 也就是 $\eta_{i,1},\ldots,\eta_{i,|y_i|}$ 的几何平均. 论文把长度归一化的作用写成两点: 降低方差, 让不同长度回答的 $s_i$ 落在同一数值范围, 从而能共用一个 clip 区间. 用序列似然比定义权重, 论文指向 Zheng et al. 2023 的 CLICK (序列似然对比学习).

### 1.4 手算: 长度归一化和几何平均

**长度.** 设每个 token 的比率都约为 $1.002$. 不做归一化时, 300 个 token 的序列比是 $1.002^{300}=e^{300\ln1.002}\approx e^{0.599}\approx1.82$; 3000 个 token 时是 $e^{5.99}\approx400$. 式 (4) 对两种长度都给出 $1.002$. 同一个 clip 区间可以用于不同长度的回答.

**离群值.** 四个位置 $\eta=(1.05,1.04,1.03,8.0)$. 算术平均是 $(1.05+1.04+1.03+8.0)/4=2.78$. 几何平均: $\ln$ 值为 $0.0488,0.0392,0.0296,2.0794$, 均值 $0.549$, $e^{0.549}\approx1.73$. 离群值仍然把 $s_i$ 拉高, 但幅度从算术平均的 $2.78$ 降到 $1.73$.

**数值稳定.** $\log$ 值的均值是标量运算, 不会因为长序列连乘下溢. 实现时先算 `mean(log_ratio)` 再 `exp`. 顺序反过来 (先对 $\eta$ 求均值) 就成了算术平均, 和式 (4) 不一致, 后面那组 $10^{-4}$ 量级的 clip 宽度也会失去意义.

与 [05-GMPO](../05-GMPO/05-GMPO.md) 的区别: GMPO 也用几何平均, 但它在目标里对 token 级的 $\eta_{i,t}\hat{A}_i$ 取几何平均, clip 仍按 token 作用. GSPO 改的是重要性权重和 clip 的粒度, 两个算法各自成立, 不能互相替换.

## 2. GSPO 的目标与梯度

### 2.1 目标

组内优势沿用 GRPO. 同一题 $x$ 采 $G$ 条, 奖励来自校验器:

$$
\hat{A}_i=\frac{r(x,y_i)-\mathrm{mean}\bigl(\{r(x,y_j)\}_{j=1}^{G}\bigr)}{\mathrm{std}\bigl(\{r(x,y_j)\}_{j=1}^{G}\bigr)}. \tag{5}
$$

GSPO 的代理目标:

$$
\mathcal{J}_{\mathrm{GSPO}}(\theta)=\mathbb{E}_{x\sim\mathcal{D},\,\{y_i\}\sim\pi_{\theta_{\mathrm{old}}}}\Biggl[\frac{1}{G}\sum_{i=1}^{G}\min\Bigl(s_i(\theta)\hat{A}_i,\;\mathrm{clip}\bigl(s_i(\theta),1-\varepsilon,1+\varepsilon\bigr)\hat{A}_i\Bigr)\Biggr]. \tag{6}
$$

和式 (2) 相比, 对 $t$ 的内层求和消失了. $s_i$ 在区间内, 整条回答参与梯度; $s_i$ 出了区间并且处在 clip 生效的一侧, 整条回答的梯度为 0. 论文为简洁省略了 KL 项. 对照实现时, 不要假定 GSPO 默认带 $\beta D_{\mathrm{KL}}$.

### 2.2 梯度推导

先求 $s_i$ 的梯度. 由式 (4),

$$
\nabla_\theta s_i(\theta)=s_i(\theta)\,\nabla_\theta\log s_i(\theta)=s_i(\theta)\cdot\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t}), \tag{7}
$$

其中用到 $\pi_{\theta_{\mathrm{old}}}$ 与 $\theta$ 无关. 不考虑 clip 时, 式 (6) 的梯度是

$$
\nabla_\theta\mathcal{J}_{\mathrm{GSPO}}=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}s_i(\theta)\hat{A}_i\cdot\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t})\Biggr]. \tag{8}
$$

GRPO 在相同条件下:

$$
\nabla_\theta\mathcal{J}_{\mathrm{GRPO}}=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}\hat{A}_i\cdot\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\eta_{i,t}(\theta)\,\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t})\Biggr]. \tag{9}
$$

两式的差别只在 token 的 $\nabla\log\pi$ 前面乘什么. 式 (8) 里一条回答内的所有 token 乘同一个 $s_i$; 式 (9) 里每个 token 乘自己的 $\eta_{i,t}$. 论文进一步指出, 加上 clip 后, GRPO 中参与梯度的 token 权重在 $\hat{A}_i>0$ 时落在 $(0,1+\varepsilon]$, 在 $\hat{A}_i<0$ 时落在 $[1-\varepsilon,+\infty)$. 这些权重不相等, 并且不相等的程度会随训练累积.

### 2.3 clip 宽度, 一次手算与被裁剪比例

几何平均让 $s_i$ 一直贴近 1, clip 区间必须很窄. 论文 §5.1 的设定:

| 算法 | 左 clip | 右 clip | 对应比率区间 |
|------|---------|---------|--------------|
| GSPO | $3\times10^{-4}$ | $4\times10^{-4}$ | $[0.9997,\,1.0004]$ |
| GRPO | $0.2$ | $0.27$ | $[0.8,\,1.27]$ |

论文说明两种算法的比率定义不同, 所以 clip 范围通常差几个数量级. GRPO 的数值是论文作者调过的.

设 $\hat{A}_i>0$. $s_i=1.0005$ 超出右沿 $1.0004$, 式 (6) 取裁剪支, 整条回答这一步不更新. $s_i=1.0002$ 在区间内, 所有 token 以约 $1.0002$ 的权重参与梯度. 同样一条回答放到 GRPO 里, 只要每个 token 的 $\eta_{i,t}$ 都在 $[0.8,1.27]$ 内, 就不会有任何位置被 clip. 两种算法判断「这条样本离旧策略多远」的尺度不同, 照搬参数会出问题: GRPO 的 $0.2$ 用到 GSPO 上几乎永远不触发 clip; GSPO 的 $3\times10^{-4}$ 用到 GRPO 上, 几乎每个 token 都会被截.

![GSPO 在序列权重上做一次 clip](./images/fig-gspo-clip-on-si.png)

**图 2 解析**

- 从左到右第一个框是整条回答 $y_i$ (token $t=1..T$), 第二个蓝框计算 $s_i=\exp(\mathrm{mean}\log\eta)$, 第三个橙框做 $\mathrm{clip}(s_i,1-\epsilon,1+\epsilon)$, 这是唯一的裁剪点.
- 上方实线分支标注 $|s_i-1|$ small, 进入绿框「inside band」: 整条回答保留, 所有 token 共用 $s_i$, 再进入红框代理损失 $\min(s_iA_i,\mathrm{clip}(s_i)A_i)$.
- 下方虚线分支标注 too off-policy, 进入紫框「outside band」: 整条回答丢弃, 没有 token 梯度. 这条虚线没有再连到损失框.
- 底部注释: clip 对 $s_i$ 只做一次, GRPO 对每个 $\eta_t$ 各做一次.

**被裁剪比例.** 论文 Figure 2 比较训练中被 clip 掉的 token 比例: GSPO 比 GRPO 高约两个数量级, 调整 clip 宽度也不改变这个量级差. 用来估计梯度的 token 更少, GSPO 的训练效率仍然更高. 论文的解释是 GRPO 的 token 级梯度本身噪声大, 用得多也利用不好. 后面 DCPO 论文从反方向提出了质疑, 见 §4.1.

## 3. GSPO-token, MoE 与 GSPO 的实验

### 3.1 GSPO-token

多轮对话或分步奖励里, 有时希望优势随位置变化, 记为 $\hat{A}_{i,t}$. GSPO-token 保持序列级比率的数值, 把它广播到每个位置, 梯度用 stop-gradient 分配到各 token:

$$
s_{i,t}(\theta)=\mathrm{sg}\bigl[s_i(\theta)\bigr]\cdot\frac{\pi_\theta(y_{i,t}\mid x,y_{i,<t})}{\mathrm{sg}\bigl[\pi_\theta(y_{i,t}\mid x,y_{i,<t})\bigr]}. \tag{10}
$$

$\mathrm{sg}[\cdot]$ 对应 PyTorch 的 `detach`. 第二个因子的数值恒为 1, 所以 $s_{i,t}$ 的数值等于 $s_i$, clip 看到的也是 $s_i$. 目标写成

$$
\mathcal{J}_{\mathrm{GSPO\text{-}token}}(\theta)=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\min\Bigl(s_{i,t}(\theta)\hat{A}_{i,t},\;\mathrm{clip}\bigl(s_{i,t}(\theta),1-\varepsilon,1+\varepsilon\bigr)\hat{A}_{i,t}\Bigr)\Biggr], \tag{11}
$$

不考虑 clip 时的梯度为

$$
\nabla_\theta\mathcal{J}_{\mathrm{GSPO\text{-}token}}=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}s_i(\theta)\cdot\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}\hat{A}_{i,t}\,\nabla_\theta\log\pi_\theta(y_{i,t}\mid x,y_{i,<t})\Biggr]. \tag{12}
$$

当 $\hat{A}_{i,t}=\hat{A}_i$ 时, 式 (11) 与式 (6) 的数值, clip 条件和梯度都相同, 式 (12) 退化为式 (8). 需要分步优势时只改 $\hat{A}_{i,t}$. clip 判断的仍是整条轨迹离旧策略多远, 某一步的 $\hat{A}$ 变号不会让那个 token 单独换区间.

### 3.2 veRL 的实现

veRL 的 `core_algos.py` 用式 (10) 的对数形式实现 GSPO (注册名 `gspo`), 下面是主体逻辑:

```python
negative_approx_kl = log_prob - old_log_prob                      # [B, T]
seq_lengths = torch.sum(response_mask, dim=-1).clamp(min=1)       # [B]
negative_approx_kl_seq = torch.sum(negative_approx_kl * response_mask, dim=-1) / seq_lengths

# log s_{i,t} = sg[log s_i] + log_prob - sg[log_prob]
log_seq_importance_ratio = log_prob - log_prob.detach() + negative_approx_kl_seq.detach().unsqueeze(-1)
log_seq_importance_ratio = torch.clamp(log_seq_importance_ratio, max=10.0)
seq_importance_ratio = torch.exp(log_seq_importance_ratio)

pg_losses1 = -advantages * seq_importance_ratio
pg_losses2 = -advantages * torch.clamp(seq_importance_ratio, 1 - clip_ratio_low, 1 + clip_ratio_high)
pg_losses = torch.maximum(pg_losses1, pg_losses2)
pg_loss = agg_loss(loss_mat=pg_losses, loss_mask=response_mask, loss_agg_mode=loss_agg_mode)
```

读这段代码要注意四点.

1. `negative_approx_kl_seq` 是 $\log s_i$, 按 mask 后的回答长度平均, prompt token 不进分母.
2. `torch.maximum(pg_losses1, pg_losses2)` 是对负号后的损失取大, 等价于对目标取 $\min$.
3. 对数比率上限 10 是数值保护, 对应 $s_i\le e^{10}$. 论文里没有这一项.
4. 函数文档建议 `loss_agg_mode="seq-mean-token-mean"`: 先在每条回答内对 token 求均值, 再对回答求均值. 这样每个 token 的损失值相同 (优势也相同时), 回答内平均后就是式 (6) 的一项. 源码注释同时说明框架允许其他聚合方式, 默认是 `token-mean`. 用 `token-mean` 时长回答的 token 多, 权重随长度增大, 和式 (6) 的「每条回答等权」不一致. 复现论文时要显式设成 `seq-mean-token-mean`.

`clip_ratio_low` 和 `clip_ratio_high` 要设成 $3\times10^{-4}$ 和 $4\times10^{-4}$ 这一量级. 沿用 GRPO 配置里的 $0.2$, 训练能跑, 但 clip 基本不会触发.

### 3.3 MoE 上的路由漂移

稠密模型已有 token 级噪声. MoE 模型多一层变化: 同一条 $y$, 梯度更新前后激活的专家可能不同. 论文统计: 48 层的 Qwen3-30B-A3B-Base, 每次 RL 梯度更新后, 同一条 rollout 上约 10% 的激活专家与旧策略不同. 这里的 10% 是全部层合起来的比例, 不同层的变化可以差很多. 层数更深的 MoE 更明显.

专家变了, 式 (1) 的分子和分母就来自两套不同的激活子网络, $\eta_{i,t}$ 的波动更大. Qwen 此前的处理办法叫 Routing Replay: 缓存 $\pi_{\theta_{\mathrm{old}}}$ 激活的专家, 计算 $\eta_{i,t}$ 时让 $\pi_\theta$ 也走同一套路由. 论文 Figure 3 显示, GRPO 在 MoE 上不加 Routing Replay 时训练奖励下降, 加上才能正常收敛. 代价是额外的显存和通信开销, 并且更新时模型容量被限制在旧路由上.

GSPO 只用序列似然. 论文的论证是: 模型只要还保持语言建模能力, 整条回答的似然不会像单个 token 那样剧烈波动. 所以 GSPO 不需要 Routing Replay 就能稳定收敛, Figure 1 的 GSPO 曲线就是在不用 Routing Replay 的设置下得到的.

论文还提到一个基础设施上的好处. 训练引擎 (如 Megatron) 和推理引擎 (如 vLLM, SGLang) 算出的似然存在精度差, 常见做法是用训练引擎把旧策略的 token 似然重算一遍. GSPO 只用序列级似然, 对精度差的容忍度更高, 有可能直接使用推理引擎返回的似然, 省掉重算. 这对 partial rollout, 多轮 RL, 训练推理分离的架构更有价值. 论文没有给出节省比例.

### 3.4 GSPO 论文的实验

| 项 | 论文写法 |
|----|----------|
| 起点模型 | 从 Qwen3-30B-A3B-Base 冷启动微调的模型 |
| rollout 切分 | 每批切成 4 个 mini-batch 更新 |
| GSPO clip | 左 $3\times10^{-4}$, 右 $4\times10^{-4}$ |
| GRPO clip | 左 $0.2$, 右 $0.27$, 作者调过 |
| GRPO 在 MoE 上 | 需要 Routing Replay |
| 评估 | AIME'24 (32 次采样平均 Pass@1), LiveCodeBench 202410–202502 (8 次采样平均 Pass@1), CodeForces (Elo) |
| 被 clip 的 token 比例 | GSPO 比 GRPO 高约两个数量级 |

论文以曲线形式报告结果 (Figure 1): 同样的训练计算量和题量下, GSPO 的训练奖励和三项基准曲线都高于 GRPO; 增加计算, 定期更新题集, 加长生成长度, GSPO 仍在提升. 正文没有把曲线终点列成表格数字. 引用时应写「论文 Figure 1 的趋势」, 不要从曲线上读坐标当作精确值. AIME 的 32 次和 LiveCodeBench 的 8 次是评估采样次数, 与训练时每题的组大小 $G$ 是两回事. 论文提到 GSPO 已用于当时最新的 Qwen3 模型训练.

## 4. DCPO: 零梯度与 DAC

### 4.1 DCPO: 零梯度的两个来源

DCPO (Dynamic Clipping Policy Optimization, Yang et al., 百川, arXiv:2509.02333) 处理的是 RLVR 训练里梯度变成 0 的问题. 论文把来源归为两处.

1. **固定裁剪界.** PPO 以来的 clip 都写成 $|r-1|\le\epsilon$, 对所有 token 一样. 旧概率 $q$ 很小的 token, 新概率 $p=rq$ 只能在 $[(1-\epsilon)q,(1+\epsilon)q]$ 内移动, 绝对步长极小. DAPO 把上下界改成不对称 (Clip-Higher), 但界仍是常数. GSPO 换成序列级 clip, 出界时整条回答一起丢.
2. **全同奖励组.** 同一 prompt 在当前步的 $G$ 条奖励全相同时, 标准差为 0, 整组 $\hat{A}=0$. DAPO 的 Dynamic Sampling 把这类组丢掉再补采, 需要额外生成.

DCPO 用三项改动应对: 动态自适应裁剪 (DAC) 改第一处, 平滑优势标准化 (SAS) 改第二处, 只在单条回答内平均的损失 (OTM, Only-Token-Mean) 改不同长度回答之间的加权. 论文附录也对 GSPO 提出了质疑: GSPO 丢掉了超过 10% 的非零优势回答, 浪费数据; 而 GRPO 虽然没有按序列丢弃, 却保留了大量 token 级高熵的回答, 训练不稳.

### 4.2 DAC: 裁剪界随旧概率变化

用 $q$ 的样本估计 $p$ 下的期望, 重要性采样带来的方差增量是

$$
\mathrm{Var}_{x\sim q}\Bigl[f(x)\frac{p(x)}{q(x)}\Bigr]-\mathrm{Var}_{x\sim p}\bigl[f(x)\bigr]=\mathbb{E}_{x\sim p}\bigl[f(x)^2\,(r(x)-1)\bigr],\qquad r=\frac{p}{q}. \tag{13}
$$

方差增量由 $(r-1)$ 在 $p$ 下的加权决定. DCPO 据此把约束从 $|r-1|\le\epsilon$ 改为

$$
\bigl|(r(x)-1)\,p(x)\bigr|\le\epsilon. \tag{14}
$$

代入 $p=rq$. 上界一侧 ($r>1$): $(r-1)rq\le\epsilon_{\mathrm{high}}$, 即 $r^2-r-\epsilon_{\mathrm{high}}/q\le0$, 取正根. 下界一侧 ($r<1$): $(1-r)rq\le\epsilon_{\mathrm{low}}$, 即 $r^2-r+\epsilon_{\mathrm{low}}/q\ge0$, 取较大的根, 根号内为负时截为 0. 合起来是论文式 (4):

$$
0.5+\frac12\sqrt{\max\Bigl(1-\frac{4\epsilon_{\mathrm{low}}}{q(x)},\,0\Bigr)}\;\le\;r(x)\;\le\;0.5+\frac12\sqrt{1+\frac{4\epsilon_{\mathrm{high}}}{q(x)}}. \tag{15}
$$

此外, 参照 dual clip (Ye et al., 2020), DCPO 把正负优势两侧的比率上限都设为 10, 防止 $q\to0$ 时上界发散. DAPO 只对负优势设了这个上限.

### 4.3 DAC 的参数, 手算与低概率 token

论文附录 A.9 设 $\epsilon_{\mathrm{low}}=0.16$, $\epsilon_{\mathrm{high}}=0.2$. 这两个数的来历是让动态界在两个点上与 GRPO 的固定界 ($\epsilon=0.2$) 重合: $(q,r)=(\frac{1}{1+\epsilon},1+\epsilon)$ 和 $(q,r)=(1,1-\epsilon)$. 验算:

- $q=1/1.2\approx0.833$: $4\times0.2/0.833=0.96$, $\sqrt{1.96}=1.4$, 上界 $0.5+0.7=1.2$, 与 $1+\epsilon$ 一致.
- $q=1$: $4\times0.16=0.64$, $\sqrt{0.36}=0.6$, 下界 $0.5+0.3=0.8$, 与 $1-\epsilon$ 一致.

其他位置的界:

| 旧概率 $q$ | 下界 | 上界 | 新概率 $p=rq$ 的允许范围 | 固定界下 $p$ 的范围 |
|-----------|------|------|--------------------------|--------------------|
| $0.002$ | $0.5$ | $10$ (帽) | $[0.001,\,0.02]$ | $[0.0016,\,0.0024]$ |
| $0.05$ | $0.5$ | $2.56$ | $[0.025,\,0.128]$ | $[0.04,\,0.06]$ |
| $0.5$ | $0.5$ | $1.31$ | $[0.25,\,0.65]$ | $[0.4,\,0.6]$ |
| $0.9$ | $0.77$ | $1.19$ | $[0.69,\,1]$ | $[0.72,\,1]$ |

$q=0.05$ 一行: $4\times0.2/0.05=16$, $\sqrt{17}\approx4.12$, 上界 $0.5+2.06=2.56$. 不受上限 10 约束的条件是 $0.5+\frac12\sqrt{1+0.8/q}\le10$, 解得 $q\ge0.8/360\approx2.2\times10^{-3}$. 下界在 $q\le4\epsilon_{\mathrm{low}}=0.64$ 时恒为 $0.5$, 论文也写明这一点. 向下一侧, 比率最低到 $0.5$, 比固定界的 $0.8$ 宽, 但 $q$ 再小也不会继续放宽; 向上一侧的界随 $q$ 减小一直变宽, 直到碰上限 10. 所以 DAC 放宽的主要是低概率 token 向上的空间. 表中 $p$ 超过 1 时按概率上限 1 计.

**为什么放宽低概率 token.** 论文统计 Qwen2.5-Math-7B 训练中的 token 分布: 约 60 步后, 约 95% 的生成 token 满足 $q>0.9$; 约 100 步后升到约 97%, 之后继续上升. 当 $q\ge\frac{1}{1+\epsilon_{\mathrm{GRPO}}}\approx0.83$ 时, 新概率落在 $[\frac{1}{1+\epsilon},1]$ 内, 无论用哪种 clip 都不会被丢. 所以绝大多数 token 本来不受 clip 影响, 被固定界误伤的是剩下的低概率 token. 论文引用 Wang et al. (2025) 的结论: 高熵 token (也就是低概率 token) 是推理能力出现的主要驱动. DAC 把更新空间留给这部分 token, 高置信 token 的界仍然紧.

### 4.4 Token Clipping Ratio

论文定义 TCR 为一个训练步内各 microbatch 中因 clip 不参与反向的 token 比例的平均:

$$
\mathrm{TCR}=\frac{1}{N}\sum_{m=1}^{N}\frac{\#\{\text{被裁剪的 token}\in\mathrm{micro}_m\}}{\#\{\text{token}\in\mathrm{micro}_m\}}. \tag{16}
$$

论文观察到:

- GRPO 的 TCR 随模型大小分化: 1.5B 和 3B 随训练上升, 7B 和 14B 逐步下降.
- DAPO 在四个模型上 TCR 都持续上升, 越往后越多 token 被切掉, 更新越来越依赖不完整的回答.
- GRPO 和 DAPO 的 TCR 都有明显波动和偶发尖峰.
- GSPO 在 Qwen2.5-Math-7B 上平均 TCR 超过 11%, 14B 上超过 15%, 远高于 token 级 clip 方法.
- DCPO 的 TCR 在各模型和各阶段都比较平稳, 比 GRPO 和 DAPO 低一个数量级.

![固定 clip 与 DAC 下低概率 token 的更新空间](../images/fig-dcpo-dac-vs-fixed-clip.png)

**图 3 解析**

- 左列标题「Fixed clip $|r-1|\le\varepsilon$」, 右列标题「DAC $|(r-1)p|\le\varepsilon$」. 两列从上到下用箭头连接, 列之间没有箭头. 两列用同一个例子 $q(x)=0.05$.
- 左列: 第三个框是对称约束 $|r-1|\le0.2$; 第四个框给出允许的新概率 $p\in[0.04,0.06]$; 最后一个红框写「Want $p=0.15$: clipped, zero grad」, 旁注 out of bound.
- 右列: 第三个框写界由式 (4) 给出并依赖 $q$, 即本文式 (15); 第四个框写低 $q$ 时合法 $r$ 更宽, 旁注 bound $\sim1/\sqrt{q}$; 最后一个框写低 $q$ 的 token 可以上升.
- 底部注释: 高 $q$ 的 token 界仍然紧; 比率上限 $|r|\le10$ 未画出.
- 按 §4.3 的表, $q=0.05$ 时 DAC 允许 $p$ 升到约 $0.128$, 想直接升到 $0.15$ 在 DAC 下同样会被截, 只是截断位置远高于固定界的 $0.06$.

## 5. SAS, OTM 与 DCPO 的实验

### 5.1 SAS: 跨步累积的平滑优势

记训练第 $i$ 步, 同一 prompt 的第 $j$ 条回答奖励为 $R_j^i$. GRPO, DAPO, GSPO 都只用当前步的 $G$ 个奖励标准化:

$$
\hat{A}^{i}_{\mathrm{new},j}=\frac{R^i_j-\mu^i_{\mathrm{new}}}{\sigma^i_{\mathrm{new}}}. \tag{17}
$$

当前步全对或全错时它为 0. 高熵采样下, 当前步的正负计数偏差大, 标准化后的优势可能变号, 和上一步的方向相反. 论文借 Yue et al. (2025) 的观点: RLVR 主要在调整已有正确轨迹的似然, 所以同一 prompt 各步的奖励可以看成来自同一分布. 于是用该 prompt 历史上全部回答 (含当前步) 的均值和标准差:

$$
\hat{A}^{i}_{\mathrm{total},j}=\frac{R^i_j-\mu^i_{\mathrm{total}}}{\sigma^i_{\mathrm{total}}}. \tag{18}
$$

两者做凸组合, 并取绝对值较小的一个:

$$
\begin{aligned}
\widehat{SA}^{i}_{\mathrm{new},j}&=\frac{i-1}{i}\hat{A}^{i}_{\mathrm{new},j}+\frac{1}{i}\hat{A}^{i}_{\mathrm{total},j},\\
\widehat{SA}^{i}_{\mathrm{total},j}&=\frac{1}{i}\hat{A}^{i}_{\mathrm{new},j}+\frac{i-1}{i}\hat{A}^{i}_{\mathrm{total},j},\\
\hat{A}^{i}_{j}&=\begin{cases}\widehat{SA}^{i}_{\mathrm{new},j}, & |\widehat{SA}^{i}_{\mathrm{new},j}|<|\widehat{SA}^{i}_{\mathrm{total},j}|,\\ \widehat{SA}^{i}_{\mathrm{total},j}, & \text{否则}.\end{cases}
\end{aligned} \tag{19}
$$

取较小绝对值, 是为了压住任一套标准化的尖峰. 当前步全同奖励时 $\hat{A}_{\mathrm{new}}=0$, 两个候选分别是 $\frac1i\hat{A}_{\mathrm{total}}$ 和 $\frac{i-1}{i}\hat{A}_{\mathrm{total}}$, 选前者. 只要这道题之前出现过并且历史奖励不全相同, 它就仍有非零梯度.

### 5.2 SAS 手算

某 prompt 每次采 $G=4$ 条. 第 1 次出现奖励 $(1,0,0,0)$, 第 2 次 $(1,1,0,0)$, 第 3 次 ($i=3$) 全错 $(0,0,0,0)$.

- 当前步: 标准差 0, $\hat{A}_{\mathrm{new}}=0$.
- 累积 12 个奖励里 3 个为 1: $\mu_{\mathrm{total}}=0.25$, 按总体标准差 $\sigma_{\mathrm{total}}=\sqrt{0.25\times0.75}\approx0.433$. 奖励为 0 的回答 $\hat{A}_{\mathrm{total}}=-0.25/0.433\approx-0.577$.
- $\widehat{SA}_{\mathrm{new}}=\frac23\times0+\frac13\times(-0.577)\approx-0.192$; $\widehat{SA}_{\mathrm{total}}=\frac13\times0+\frac23\times(-0.577)\approx-0.385$.
- 取绝对值较小者, 最终优势 $-0.192$.

GRPO 在这一步对这道题的梯度为 0. DCPO 给四条错误回答一个较小的负优势, 继续压低这类回答的概率. 反过来, 如果题目第一次出现 ($i=1$) 就全错, 累积统计和当前步相同, 优势仍为 0. SAS 救的是「同一题多次出现, 某一步碰巧全同」的情况.

### 5.3 RUR

论文用 Response Utilization Ratio 衡量数据利用:

$$
\mathrm{RUR}=\frac{\#\{\text{优势非零的回答}\}}{\#\{\text{生成的回答}\}}. \tag{20}
$$

Table 2 是 400 步训练的平均 RUR:

| 模型 | GRPO | GSPO | DCPO |
|------|------|------|------|
| Qwen2.5-Math-1.5B-Instruct | 45.6% | – | 67.1% |
| Qwen2.5-3B | 48.3% | – | 74.3% |
| Qwen2.5-Math-7B | 37.4% | 43.5% | 73.2% |
| Qwen2.5-14B | 43.9% | 47.6% | 72.4% |
| 平均 | 43.8% | 45.6% | 71.8% |

DCPO 相对 GRPO 平均高 28 个百分点, 相对提升约 64% ($71.8/43.8\approx1.64$). GRPO 的 RUR 随训练从 90% 以上降到 50% 以下, Qwen2.5-Math-7B 约 200 步后低至 30% 左右. 论文对两端的解释: 训练初期 RUR 很高, 主要因为模型输出格式不对, 负奖励多, 组内天然有方差; DCPO 稳定在约 70% 而不到 100%, 是因为接近一半的题已经稳定答对, 不需要继续更新, 剩下稳定答错的题里, 有的超出模型能力, 有的是 DAPO-Math-17K 把答案转成整数时标签出错.

DAPO 的 Dynamic Sampling 不保留全同奖励的回答, 无法直接比 RUR. 论文改为比较相同更新步数下的生成量: DAPO 比 DCPO 多生成 3 到 5 倍回答, GPU 小时至少翻倍; 14B 上约 300 步后, DAPO 可用回答的比例低于 30%.

### 5.4 OTM: 只在单条回答内平均

DAPO 用 token-level mean, 分母是整组所有 token 数. 论文举例: 回答 A 优势 1, 长 500; 回答 B 优势 0.5, 长 1500. A 的权重 $500/2000=0.25$, 贡献 $1\times0.25=0.25$; B 的权重 $0.75$, 贡献 $0.5\times0.75=0.375$. 优势更小的长回答反而主导了梯度.

GRPO 的 sequence-level mean 先在回答内平均, 再对 $G$ 条平均. 论文认为对 $G$ 的平均相当于把优势再除以 $G$, 稀释了组内相对关系. OTM 只在单条回答内对长度平均:

$$
\mathcal{T}_{\mathrm{DCPO}}(\theta)=\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}\min\Bigl(r_{i,t}(\theta)\hat{A}_{i,t},\;\mathrm{clip}\bigl(r_{i,t}(\theta),1-\varepsilon_{\mathrm{low}},1+\varepsilon_{\mathrm{high}}\bigr)\hat{A}_{i,t}\Bigr). \tag{21}
$$

这里的裁剪界来自式 (15). 和 DAPO 一样, DCPO 的损失不加 KL 项.

从式 (21) 能算出一个性质: 在同一组内, OTM 与 GRPO 的 sequence-level mean 给每条回答的相对权重相同, 都是每条回答等权, 两者只差整体系数 $G$. 用 Adam 优化时, 整体常数缩放大部分会被二阶矩归一化抵消, 实际差别主要出现在梯度范数裁剪, 以及不同 batch 中组数或回答数不同的情况. 论文的消融显示单独换上 OTM 就比基线稳, 这一效果具体来自哪个环节, 论文没有进一步拆分. 与 DAPO 的 token-level mean 相比, OTM 去掉了按长度加权, 这一点是确定的.

实现时, OTM 的分母是 mask 之后的回答长度, prompt token 不能进分母.

### 5.5 DCPO 的实验设定

| 项 | 设定 |
|----|------|
| 训练数据 | DAPO-Math-17K 与 MATH 3–5 级合并, 约 25k 题, Qwen-Math 模板 |
| 训练 | 400 步, 生成 batch 512, mini-batch 32, 每题 $G=16$, 温度 1 |
| 长度 | prompt 1024, 回答 3072 |
| 硬件与框架 | 32 张 H20, veRL |
| 基线 clip | GRPO $\epsilon=0.2$; DAPO $(0.2,0.28)$ 加 512 token 软惩罚缓冲和负优势比率上限 10; GSPO $(3\times10^{-4},4\times10^{-4})$ |
| DCPO | $\epsilon_{\mathrm{low}}=0.16$, $\epsilon_{\mathrm{high}}=0.2$, 正负优势比率上限都为 10 |
| 评估 | MATH500 报 Avg@1 (贪心); AMC23, AIME24, AIME25 报 Avg@1 和 Avg@32 (温度 1.0, `top_p` 1.0) |

GSPO 只在 Qwen2.5-Math-7B 和 Qwen2.5-14B 上作为基线.

### 5.6 DCPO 的实验结果

Qwen2.5-Math-7B:

| 方法 | MATH500 | AMC23 @1/@32 | AIME24 @1/@32 | AIME25 @1/@32 | 平均 @1/@32 |
|------|---------|--------------|---------------|---------------|-------------|
| base | 50.4 | 40.0 / 19.5 | 13.3 / 6.0 | 3.3 / 1.5 | 28.4 / 9.3 |
| GRPO | 81.6 | 77.5 / 75.9 | 36.7 / 32.1 | 16.7 / 16.7 | 53.1 / 41.6 |
| DAPO | 83.0 | 72.5 / 80.7 | 36.7 / 31.6 | 23.3 / 14.9 | 53.9 / 42.4 |
| GSPO | 84.0 | 80.0 / 78.8 | 40.0 / 34.9 | 16.7 / 16.2 | 55.2 / 43.3 |
| DCPO | 82.5 | 82.6 / 79.8 | 46.7 / 38.8 | 16.7 / 17.2 | 57.1 / 45.2 |

Qwen2.5-14B:

| 方法 | MATH500 | AMC23 @1/@32 | AIME24 @1/@32 | AIME25 @1/@32 | 平均 @1/@32 |
|------|---------|--------------|---------------|---------------|-------------|
| base | 60.8 | 47.5 / 16.4 | 3.3 / 1.3 | 3.3 / 1.1 | 28.7 / 6.3 |
| GRPO | 81.2 | 75.0 / 65.6 | 13.3 / 17.6 | 13.3 / 10.5 | 45.7 / 31.3 |
| DAPO | 83.4 | 87.5 / 85.1 | 16.7 / 16.4 | 20.0 / 15.3 | 51.9 / 38.9 |
| GSPO | 78.6 | 77.5 / 75.0 | 23.3 / 16.0 | 16.7 / 9.9 | 49.0 / 33.5 |
| DCPO | 84.6 | 85.0 / 79.9 | 20.0 / 18.2 | 23.3 / 19.0 | 53.2 / 39.0 |

平均列的口径: Avg@1 对四个基准取平均, 例如 7B DCPO $(82.5+82.6+46.7+16.7)/4=57.1$; Avg@32 只对三个有 @32 的基准平均, $(79.8+38.8+17.2)/3\approx45.3$, 表中记为 45.2.

几点读法:

1. **单项有输有赢.** 7B 上 DCPO 的 MATH500 是 82.5, 低于 GSPO 的 84.0 和 DAPO 的 83.0; 14B 上 AMC23 Avg@32 是 79.9, 低于 DAPO 的 85.1; 14B 上 AIME24 Avg@1 是 20.0, 低于 GSPO 的 23.3. DCPO 的优势体现在平均值上.
2. **小集的贪心结果抖动大.** AIME 每套 30 题, 一题是 3.33 分. 3B 模型上 DCPO 的 AIME24 Avg@1 是 3.3, GRPO 是 10.0, 差两题; 同一格的 Avg@32 两者都是 7.5. 判断优劣应以 Avg@32 为主.
3. **另外两档模型的差距更小.** Qwen2.5-Math-1.5B-Instruct 上 DCPO 平均 47.2/32.8, 比 GRPO 高 1.2/0.8, 比 DAPO 高 0.7/0.4; Qwen2.5-3B 上平均 37.6/22.7, Avg@32 比 DAPO 低 0.4.
4. **Avg@32 与 pass@k 口径不同.** Avg@32 是 32 次采样的平均准确率, 反映采样分布里正确回答的密度; pass@$k$ 是 $k$ 次中至少对一次, 反映覆盖. DCPO 的 Avg@32 提高不能直接读成覆盖变宽, 论文没有做 Yue et al. 那种大 $k$ 的覆盖对比.

### 5.7 消融与熵

消融在 Qwen2.5-Math-7B 上进行, 以 Avg@32 为指标, 每次只把 GRPO 的一个组件换掉, 并统一去掉 KL 项, 训练 20 到 400 步:

- 只换 OTM: 超过基线, 基线的数据利用低, 表现波动.
- 只换 SAS: 明显好于 GRPO, 接近 DAPO.
- 只换 DAC: 超过 GRPO, DAPO, GSPO, 曲线比只换 OTM 更稳.
- 三项全上: 最好也最稳. 训练后期基线进入平台, DCPO 仍在上升.

论文附录还给出训练熵: GRPO 在热身后熵快速下降并停在低位; 在较大的基座模型上, DAPO 熵最高, DCPO 处于中间. 论文据此认为熵与性能呈 U 形关系, 熵过低缺少探索, 过高则不稳定.

## 6. 失效模式与选择

### 6.1 失效模式与边界

| 情况 | 现象 | 原因 | 处理 |
|------|------|------|------|
| GSPO 的 clip 沿用 $0.2$ | clip 几乎不触发, 训练与无 clip 相近 | $s_i$ 贴近 1, 带宽差几个数量级 | 用 $10^{-4}$ 量级的带宽 |
| GSPO 先 `exp` 后平均 | 比率被离群 token 拉偏 | 实现成了算术平均 | 先平均 `log_ratio` 再 `exp` |
| veRL 用 `token-mean` 聚合 | 长回答权重偏大 | 聚合方式与式 (6) 不同 | 设为 `seq-mean-token-mean` |
| 长序列用 fp16 累加 `log_ratio` | 精度损失 | 几千个小量相加 | 用 fp32 累加 |
| GSPO 信用分配粗 | 中间写错但答案对的回答整段被抬高 | 一条回答共用 $s_i$ 和 $\hat{A}_i$ | 用 GSPO-token 配分步优势 |
| GSPO 整段丢样本 | 难题上可用样本少 | 一条出界整条无梯度 | 先检查比率实现, 再考虑带宽 |
| DAC 用当前策略算 $q$ | 界和比率不在同一测度 | $q$ 必须是旧策略概率 | 用 rollout 时记录的旧 logprob |
| SAS 统计被 rank 切开 | 平滑退化成当前步 | 同一 prompt 落在不同 rank | 按 prompt 键全局汇总 (计数, 和, 平方和) |
| 题目只出现一次且全同 | DCPO 仍是零梯度 | 没有历史统计 | 增大 $G$ 或补采 |
| 低概率 token 需要下压 | DAC 下界最低 0.5 | 式 (15) 下界的闭式结果 | 依靠组内正例拉开相对位置 |

两篇论文都没有处理的问题: 组内 $z$-score 的难度偏置和长度偏置 (见 [01-GRPO](../01-GRPO/01-GRPO.md) §4), 奖励投机, 校验器噪声, 题集泄漏. GSPO 去掉了 Routing Replay 的需要, MoE 的负载均衡和专家塌缩等问题仍然存在.

### 6.2 怎么选

| 情况 | 选择 |
|------|------|
| 可验证奖励, 稠密模型, 回答不长 | GRPO 或其去偏变体 |
| MoE 模型, token 级比率波动大, 不想维护 Routing Replay | GSPO |
| 训练与推理引擎似然有精度差 | GSPO, 可尝试直接用推理引擎的序列似然 |
| 需要分步或分轮优势 | GSPO-token |
| 低概率 token 更新不动, 全同奖励组多, 不想多采样 | DCPO |
| 愿意多采样换每个 batch 都有梯度 | DAPO 的 Dynamic Sampling |
| 想压 token 级离群比率, 保留 token 级 clip | [05-GMPO](../05-GMPO/05-GMPO.md) |

GSPO 和 DCPO 对「clip 该放在哪一层」给出了相反的答案. GSPO 把比率收成一个标量, 换来稳定, 代价是整段丢样本和较粗的信用分配; DCPO 留在 token 级, 用依赖概率的界和跨步统计减少零梯度. DCPO 的消融里, 单独的 DAC 已经超过 GSPO, 说明序列级 clip 只是稳定训练的一种做法.

## 参考文献

1. Zheng, C., Liu, S., Li, M., Chen, X.-H., Yu, B., Gao, C., Dang, K., Liu, Y., Men, R., Yang, A., Zhou, J., & Lin, J. (2025). *Group Sequence Policy Optimization*. arXiv:2507.18071. https://arxiv.org/abs/2507.18071
2. Yang, S., et al. (2025). *DCPO: Dynamic Clipping Policy Optimization*. arXiv:2509.02333. https://arxiv.org/abs/2509.02333 . 代码: https://github.com/lime-RL/DCPO
3. Shao, Z., et al. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300. https://arxiv.org/abs/2402.03300
4. Yu, Q., et al. (2025). *DAPO: An Open-Source LLM Reinforcement Learning System at Scale*. arXiv:2503.14476. https://arxiv.org/abs/2503.14476
5. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347. https://arxiv.org/abs/1707.06347
6. Zheng, C., Ke, P., Zhang, Z., & Huang, M. (2023). *CLICK: Controllable Text Generation with Sequence Likelihood Contrastive Learning*. Findings of ACL 2023. https://aclanthology.org/2023.findings-acl.65/
7. Ye, D., et al. (2020). *Mastering Complex Control in MOBA Games with Deep Reinforcement Learning*. AAAI 2020. arXiv:1912.09729. https://arxiv.org/abs/1912.09729
8. Wang, S., et al. (2025). *Beyond the 80/20 Rule: High-Entropy Minority Tokens Drive Effective Reinforcement Learning for LLM Reasoning*. arXiv:2506.01939. https://arxiv.org/abs/2506.01939
9. Yue, Y., et al. (2025). *Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?* arXiv:2504.13837. https://arxiv.org/abs/2504.13837
10. Sheng, G., et al. (2024). *HybridFlow: A Flexible and Efficient RLHF Framework*. arXiv:2409.19256. https://arxiv.org/abs/2409.19256 . veRL `verl/trainer/ppo/core_algos.py`: https://github.com/volcengine/verl
