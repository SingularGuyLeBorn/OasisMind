---
title: "01 · GxPO 结构扩展：轨迹侧与奖励侧"
date: 2026-08-30
tags: [GxPO, GRPO, GSPO, DAPO, GMPO, GHPO, DrGRPO, CISPO]
as_of: 2026-08-30
---

# 01 · GxPO 结构扩展：轨迹侧与奖励侧

GxPO 不是一个算法，是 **GRPO 及其结构扩展** 的坐标系：大家都还在优化 $J(\theta)=\mathbb{E}_{\tau\sim p_{\theta}}[R(\tau)]$，差别只在干预落在 **轨迹侧** $p_{\theta}(\tau)$ 还是 **奖励侧** $R(\tau)$。卡住的瓶颈是：PPO 要养一个和策略同级的 Critic，GRPO 用组内相对奖励拆掉它之后，clip 粒度、采样、优势归一、prompt 又各自裂出新失效。本篇是 [4.4.5](../4.4.5-GxPO家族.md) 的机制专文；PPO 公式见 [04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)，组内 $z$-score 的展开见 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md)，这里只写一次、变体只写相对 GRPO 改了哪一侧。**不是** DPO。**不是** 把 OPD 写成 GRPO 变体——综述把散度最小化的 On-Policy Distillation 标成 $J$ 的边界。

坐标系来自 Shen 等 *A First-Principles Derivation of LLM Policy Optimization*（[arXiv:2606.16733](https://arxiv.org/abs/2606.16733)）。综述只当地图：数字和公式冲突时弃综述，跟原论文。

## 1. 同一个 $J$，两根轴

所有政策梯度都从期望回报出发：

$$
J(\theta)=\mathbb{E}_{\tau\sim p_{\theta}(\tau)}\bigl[R(\tau)\bigr]. \tag{1}
$$

轨迹侧管样本怎么进更新：从哪采、重要性比率怎么定义、clip 卡在哪一层。奖励侧管这条轨迹拿什么标量加权：奖励从哪来、怎么归一成优势、优势广播到哪些 token。PPO 在轨迹侧用 token 级比率加对称 clip，在奖励侧用 GAE + Critic。GRPO 把奖励侧的 Critic 换成组内相对优势，**轨迹侧的比率与对称 clip 原样留下**。后面的 GxPO 不是另起一套目标，是对式 (1) 两侧的局部手术。

![GxPO family on trajectory vs reward axes](./images/fig-gxpo-two-axes.png)

> 图 1：从 $J(\theta)$ 分出轨迹侧与奖励侧。GRPO 是奖励侧替换（组内 $z$-score 替代 Critic）。DAPO / GSPO / GMPO / GHPO 相对 GRPO 改 clip、采样、比率聚合或 prompt。红框：DPO 退出 $J$；OPD 散度目标是边界，不是 GRPO 变体。

**图 1 解析**

- **顶栏**：式 (1) 只有两个因子。问「这个缩写改了什么」时，先回答改的是 $p_{\theta}$ 还是 $R$。
- **左列（轨迹侧）**：GSPO 把重要性比率收成序列级标量再 clip；DAPO 的 Clip-Higher 与 Dynamic Sampling 改信任域和进 batch 的组；GHPO 改的是 prompt 本身；GMPO 用几何平均压 token 级比率的离群值。
- **右列（奖励侧）**：GRPO 的组内 $z$-score 只在这里写一次。Dr. GRPO 去掉 $\sigma$ 与 $1/|o|$。DAPO 的超长塑造加在 $R$ 上，不是另发明一套优势。
- **红框**：DPO 用偏好分类换掉 rollout；$J$ 不在了。MiniLLM / GKD 那条 OPD 把 $R$ 换成散度，综述 §9.1 标成边界。GRPO-OPD hybrid 仍留 $J$，那是另一篇的事。

## 2. GRPO：奖励侧替换，组内 $z$-score 只写一次

DeepSeekMath（[arXiv:2402.03300](https://arxiv.org/abs/2402.03300)）的动机写得很具体：PPO 的价值网络通常与策略同规模；LLM 又往往只在最后一个 token 给奖励，逐 token 的 $V_{\psi}$ 难训。GRPO 对同一问题 $q$ 从旧策略采 $G$ 条输出 $\{o_i\}$，用组内分数当基线，不再养 Critic。

结果监督下，组奖励 $\mathbf{r}=\{r_1,\ldots,r_G\}$ 先减均值再除标准差，**整条回答共享同一个优势**：

$$
\hat{A}_{i,t}=\tilde{r}_{i}=\frac{r_i-\mathrm{mean}(\mathbf{r})}{\mathrm{std}(\mathbf{r})}. \tag{2}
$$

这就是组内 $z$-score。后面所有变体，只要没改式 (2)，就还在用这套相对好坏；差别在轨迹侧怎么吃这个 $\hat{A}_i$。

目标函数（DeepSeekMath 式 (3)）在 token 上做与 PPO 同构的 clip，KL 不进奖励、直接加在损失上：

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
\end{aligned} \tag{3}
$$

其中 $r_{i,t}(\theta)=\pi_{\theta}(o_{i,t}\mid q,o_{i,<t})/\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q,o_{i,<t})$。综述把这叫做 **纯奖励侧替换**：重要性比率、对称 clip、对 $\pi_{\mathrm{ref}}$ 的 KL 都还在；变的是 $A_t^{\mathrm{GAE}}\to\hat{A}_i$。

DeepSeekMath 在 DeepSeekMath-Instruct 上、只用英语指令子集做 RL 的分母：GSM8K **82.9% → 88.2%**，MATH **46.8% → 51.7%**（文中 Table 5 相邻段；CoT、无工具）。这是 GRPO 这篇的数字，不是 R1-Zero 的 47 分 AIME。

组内方差为零时式 (2) 是 $0/0$。实现里加 $\epsilon$ 或跳过该组，梯度空掉——这是 DAPO 动态采样和 GHPO 改 prompt 要对付的同一件事，不是两套病。

DeepSeekMath 还写了过程监督版：逐步奖励归一化后，从后向前累加得到每个 token 的 $\hat{A}_{i,t}$，而不是把同一个 $\tilde{r}_i$ 广播到整句。本篇变体默认对照的是 **结果监督** 那条（可验证对错、一个标量）。过程奖励是奖励密度问题，综述放在 reward density，不在 GxPO 缩写里重开一套。

KL 估计器用 Schulman 的无偏形式 $\pi_{\mathrm{ref}}/\pi_{\theta}-\log(\pi_{\mathrm{ref}}/\pi_{\theta})-1$，插在损失上而不是折进每步奖励，免得和式 (2) 的组统计搅在一起。DAPO / 多数 Zero-RL 复现后来把这项拿掉，那是轨迹侧「要不要锚住初始化」的选择，不是否定 GRPO 曾经把它写进式 (3)。

## 3. 对照表：相对 GRPO 改了哪一侧

![Which knob each GxPO variant turns](./images/fig-gxpo-which-knob.png)

> 图 2：四列旋钮。相对 GRPO：谁改 clip、谁改优势聚合、谁改采样、谁改 prompt。示意，不是论文表。完整对照见下表。

**图 2 解析**

- **Clip 列**：对称 $1\pm\varepsilon$ 是 GRPO/PPO 默认。DAPO 把上下界拆开。GSPO 的 $\varepsilon$ 作用在序列似然比上，数量级从 $0.2$ 掉到 $10^{-4}$。GMPO 在对数空间按 token clip，再用几何平均。
- **优势聚合列**：GRPO 的 $z$-score 只出现一次。Dr. GRPO 拆的是 $\sigma$ 与 $1/|o|$。GMPO 改的是「重要性加权奖励」的平均算子，不是另写一个组统计。
- **采样列**：只有 DAPO 在进更新前丢掉准确率为 0 或 1 的组。
- **Prompt 列**：只有 GHPO 改 $q$。其余算法问题文本不动。

| 算法 | 相对 GRPO 改哪一侧 | clip | 优势 / 损失聚合 | 采样 | prompt |
| --- | --- | --- | --- | --- | --- |
| GRPO | 奖励侧：式 (2) 替换 Critic | 对称 $1\pm\varepsilon$，token 级 | 组内 $z$-score；序列内再对 token 取均值 | 组全留 | $q$ 不动 |
| DAPO | **两侧**：clip/采样（轨迹）+ token 损失与超长塑造（奖励） | $\varepsilon_{\mathrm{low}}=0.2$，$\varepsilon_{\mathrm{high}}=0.28$ | 分母改成组内 token 总数；优势公式仍是式 (2) | 丢掉全对/全错组 | 不动 |
| GSPO | **轨迹侧**：比率粒度 | 对序列标量 $s_i$ clip（文中左右界 $3\times10^{-4}$ / $4\times10^{-4}$） | 优势仍是组内 $z$-score | 组全留 | 不动 |
| GMPO | **轨迹侧**：比率聚合 | token 级、对数空间，推荐 $(e^{-0.4},e^{0.4})$ | 几何平均 $\bigl(\prod_t\|\rho_{i,t}\hat{A}_i\|\bigr)^{1/\|o_i\|}$ | 组全留 | 不动 |
| GHPO | **轨迹侧**：采什么样的前缀 | 仍用 GRPO 式 clip | 优势仍是组内相对 | 组全留，难样本改写成 $q^*$ | $q^*=q$ 或 $q+\omega\cdot h$ |
| Dr. GRPO | **奖励侧**：统计偏差 | 不改 clip 形态 | 去掉 $1/\|o_i\|$ 与 $\mathrm{std}(\mathbf{r})$ | 组全留 | 不动 |

DAPO 不是「段级优势」。段级优势是综述里 SPO 等信用分配线，和 DAPO 四件套不是一回事。

## 4. DAPO：全称钉死，四件套跟原文

**DAPO = Decoupled Clip and Dynamic sAmpling Policy Optimization**（Yu 等，[arXiv:2503.14476](https://arxiv.org/abs/2503.14476)）。不是 Alignment，不是 Advantage Policy Optimization。4.4 节首页写过 Decoupled Alignment——那是错的，本篇不跟，也不去改首页。

起点：同一套 Qwen2.5-32B **base** 上朴素 GRPO，AIME 2024 只有 **30** 分（后文 Table 1 的 $\mathrm{avg@32}$），对 DeepSeek-R1-Zero-Qwen-32B 的 **47** 分差一截。他们把失败拆成熵崩、零优势组、长 CoT 的样本级损失、截断奖励噪声，对应四项。

### 4.1 Clip-Higher

对称 $\varepsilon=0.2$ 时，旧概率 $0.01$ 的探索 token 最多被抬到 $0.012$；旧概率 $0.9$ 的利用 token 几乎不被上界挡住。低概率探索 token 的均值被上 clip 卡在 $\pi_{\theta}<0.2$。DAPO 把上下界拆开：

$$
\mathrm{clip}\bigl(r_{i,t}(\theta),\,1-\varepsilon_{\mathrm{low}},\,1+\varepsilon_{\mathrm{high}}\bigr),\qquad \varepsilon_{\mathrm{low}}=0.2,\;\varepsilon_{\mathrm{high}}=0.28. \tag{4}
$$

下界不动：再放大 $\varepsilon_{\mathrm{low}}$ 会把负优势 token 的概率压向 0，采样空间塌掉。长 CoT 里他们去掉 KL：策略本就该离开初始化，冻住的 $\pi_{\mathrm{ref}}$ 会卡住探索。

### 4.2 Dynamic Sampling

组内全对或全错时式 (2) 的优势为零，该 prompt 的梯度为零。随着训练，准确率 $=1$ 的 prompt 比例上升，有效 batch 变瘦、方差变大。DAPO 的约束是

$$
0 < \bigl|\{o_i \mid \texttt{is\_equivalent}(a,o_i)\}\bigr| < G. \tag{5}
$$

不够就继续采，直到 buffer 装满「既有对又有错」的组。过滤的是 **prompt 组**，不是把 DAPO 定义成段级优势。

### 4.3 Token-level Policy Gradient Loss

GRPO 先在序列内对 token 取均值、再对样本取均值，每条回答权重相同。长回答里每个 token 的贡献被稀释：高质量长推理学不进去，胡写、复读的超长样本也罚不狠。DAPO 把分母改成组内 token 总数：

$$
\mathcal{J}_{\mathrm{DAPO}}(\theta)
=\mathbb{E}\Biggl[
\frac{1}{\sum_{i=1}^{G}|o_i|}
\sum_{i=1}^{G}\sum_{t=1}^{|o_i|}
\min\bigl(r_{i,t}\hat{A}_{i,t},\;
\mathrm{clip}(r_{i,t},1-\varepsilon_{\mathrm{low}},1+\varepsilon_{\mathrm{high}})\hat{A}_{i,t}\bigr)
\Biggr]. \tag{6}
$$

同一生成模式无论出现在短句还是长句，梯度权重按 token 计，不按「一条回答一票」。

### 4.4 Overlong Reward Shaping

截断样本若直接给惩罚，一段本来对的推理只因为超长被打成错，奖励噪声大。他们先做 Overlong Filtering：截断样本的损失 mask 掉。再给出 Soft Overlong Punishment（原文式 (13)）：

$$
R_{\mathrm{length}}(y)=\begin{cases}
0, & |y|\le L_{\max}-L_{\mathrm{cache}},\\
\dfrac{(L_{\max}-L_{\mathrm{cache}})-|y|}{L_{\mathrm{cache}}}, & L_{\max}-L_{\mathrm{cache}}<|y|\le L_{\max},\\
-1, & |y|>L_{\max}.
\end{cases} \tag{7}
$$

实验里 $L_{\max}=16384$，$L_{\mathrm{cache}}=4096$，生成上限 20480。这是加在规则正确性奖励上的长度项，不是「超长奖励改成 0」那种简化。规则奖励本身是等价则 $+1$、否则 $-1$。

### 4.5 数字：Table 1，分母写全

模型 **Qwen2.5-32B base**；评测 AIME 2024 **avg@32**（测试集重复 32 次）；温度 1.0，top-p 0.7。对比行 DeepSeek-R1-Zero-Qwen-32B = **47**。超参：prompt batch 512，每题 16 条，AdamW $1\times 10^{-6}$。

| 设定 | $\mathrm{AIME24}_{\mathrm{avg@32}}$ |
| --- | ---: |
| DeepSeek-R1-Zero-Qwen-32B | 47 |
| Naive GRPO | 30 |
| + Overlong Filtering | 36 |
| + Clip-Higher | 38 |
| + Soft Overlong Punishment | 41 |
| + Token-level Loss | 42 |
| + Dynamic Sampling（完整 DAPO） | 50 |

50 分用大约 R1-Zero-Qwen-32B **一半的训练步数** 超过 47。Token-level loss 在表上只 +1 分，正文写它主要稳长度和熵。不要把「50 分」说成任意 32B 或任意基准。

综述把 DAPO 同时放进轨迹侧 clip–ratio 表和双侧「clip–方差耦合」：非对称 clip 管熵，动态采样管零优势组，超长塑造管 $R$ 的噪声，token 级分母管长句权重。四项缺一，表上的 50 就不是那一行。Algorithm 1 的循环是：采 $G$ 条 → 打分 → 按式 (5) 滤进 buffer → buffer 不够就 `continue` 再采 → 够了才算 $\hat{A}$ 并做 $\mu$ 次策略更新。采样成本随「全对/全错」比例涨，但他们观察到收敛步数下降，墙钟不一定更慢——前提是同步、未流水线化的生成被长尾样本主导。

数据集 DAPO-Math-17K：网上竞赛题改造成 **整数答案**（例如原答案 $(a+\sqrt{b})/c$ 改成求 $a+b+c$），共 17K prompt。规则奖励能用，是因为分母被他们改成可解析整数，不是「任意数学文字都能规则打分」。

## 5. GSPO：序列级重要性比率，不是滑窗优势

**GSPO = Group Sequence Policy Optimization**（Zheng 等，Qwen Team，[arXiv:2507.18071](https://arxiv.org/abs/2507.18071)）。4.4 节首页把它写成「时间维滑动窗口局部优势」——原文没有这个机制。GSPO 的主张是：**奖励给整条序列，重要性校正也应该给整条序列。**

GRPO 在每个 token 位置用单次采样的 $w_{i,t}=\pi_{\theta}/\pi_{\theta_{\mathrm{old}}}$ 当重要性权重。重要性采样要靠 $N\gg 1$ 的平均才能纠分布；一个位置一个样本，这个权重纠不了分布，只是往梯度里灌高方差噪声。序列一长、再叠 MoE 路由抖动，clip 会把噪声放大到崩。

GSPO 把比率定义成长度归一的序列似然比（几何平均）：

$$
s_i(\theta)
=\Biggl(\frac{\pi_{\theta}(y_i\mid x)}{\pi_{\theta_{\mathrm{old}}}(y_i\mid x)}\Biggr)^{1/|y_i|}
=\exp\Biggl(\frac{1}{|y_i|}\sum_{t=1}^{|y_i|}
\log\frac{\pi_{\theta}(y_{i,t}\mid x,y_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid x,y_{i,<t})}\Biggr). \tag{8}
$$

目标对 **这个标量** clip，优势仍用组内 $z$-score（原文式 (6)，与式 (2) 同构）：

$$
\mathcal{J}_{\mathrm{GSPO}}(\theta)
=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}
\min\bigl(s_i(\theta)\widehat{A}_i,\;
\mathrm{clip}(s_i(\theta),1-\varepsilon,1+\varepsilon)\widehat{A}_i\bigr)\Biggr]. \tag{9}
$$

![GRPO token-level IS versus GSPO sequence-level IS](./images/fig-gspo-seq-is.png)

> 图 3：左，GRPO 每个 token 自己的 $r_t$ 各自 clip，再乘同一条 $\hat{A}_i$。右：先把 token 对数比做成几何平均标量 $s$，再 clip 一次，整条序列共用 $\tilde{s}\hat{A}_i$。红框：不是滑窗局部优势，也不是段级 $A$。

**图 3 解析**

- **左**：clip 发生在 token。正优势时各 $w_{i,t}$ 可落在 $(0,1+\varepsilon]$，负优势时可落到 $[1-\varepsilon,+\infty)$。权重不相等，会沿序列累积。
- **右**：$\pi_{\theta}(y\mid x)=\prod_t\pi_{\theta}(y_t\mid\ldots)$，$(1/|y|)$ 次幂把不同长度拉回同一数值范围。clip 整段丢掉或整段留下，和「奖励是整段一个分」对齐。
- **红框**：局部窗口优势、段级优势，都不是这篇的定义。邻居 [03-GSPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/03-GSPO/03-GSPO.md) 公式方向与原文一致；若旧叙述把 GSPO 写成 token 算术平均，以本篇式 (8) 为准。

实验设定（原文 §5.1）：冷启动模型从 **Qwen3-30B-A3B-Base** 微调；AIME'24 为 32 次采样的平均 Pass@1；LiveCodeBench（202410–202502）8 次平均 Pass@1；CodeForces 报 Elo。每批 rollout 切成 4 个 mini-batch。GSPO clip 左右界 **$3\times10^{-4}$** 与 **$4\times10^{-4}$**；对照 GRPO 调到 **0.2** 与 **0.27**。数量级不同，是因为 $s_i$ 已经是几何平均后的似然比，不是单个 token 的 $\pi$ 比。

MoE：Qwen3-30B-A3B 约 48 层，一次梯度更新后同一条 rollout 大约 **10%** 的专家与 $\pi_{\theta_{\mathrm{old}}}$ 不同。GRPO 的 token 级 $w_{i,t}$ 被路由抖动打散，要靠 Routing Replay（缓存并重放旧路由）才能收敛。GSPO 只看序列似然，不依赖 Routing Replay。文中还观察到 GSPO clip 掉的 token 比例比 GRPO **高两个数量级**，但训练效率更高——他们用来论证 token 级梯度噪声大，不是画一张假坐标曲线。

GSPO-token（式 (13)(14)）把 $s_i$ 的数值 stop-gradient 后乘到每个 token 的 $\pi_{\theta}/\mathrm{sg}[\pi_{\theta}]$ 上，数值上等于 $s_i$，方便多轮里按 token 改 $\widehat{A}_{i,t}$。$\widehat{A}_{i,t}=\widehat{A}_i$ 时与 GSPO 梯度相同。

## 6. GMPO：几何平均压离群比率

**GMPO = Geometric-Mean Policy Optimization**（Zhao、Liu 等，[arXiv:2507.20673](https://arxiv.org/abs/2507.20673)）。邻居 [01-GMPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/01-GMPO/01-GMPO.md) 有年薪类比；本篇数字只跟原表，不跟营销类比。

GRPO 优化 token 级重要性加权奖励的 **算术平均**。$\rho_t\hat{A}$ 对离群 $\rho_t$ 敏感，训练中 $\rho_t$ 会冲到极端值，再靠窄 clip 压住，探索跟着死。GMPO 换成几何平均（省略 clip 的核心式）：

$$
\mathcal{J}^{*}_{\mathrm{GMPO}}(\pi_{\theta})
=\mathbb{E}\Biggl[\frac{1}{G}\sum_{i=1}^{G}
\Biggl(\prod_{t=1}^{|o_i|}\bigl|\rho_{i,t}(\theta)\hat{A}_i\bigr|\Biggr)^{1/|o_i|}
\cdot\mathrm{sgn}(\hat{A}_i)\Biggr]. \tag{10}
$$

由 AM-GM，$|\mathcal{J}^{*}_{\mathrm{GMPO}}|\le|\mathcal{J}^{*}_{\mathrm{GRPO}}|$，目标值域更窄。梯度上，GRPO 每个 token 的权重含自己的 $\rho_{i,t}$；GMPO 每个 token 共享整句的几何平均 $\bigl(\prod_k\rho_{i,k}\bigr)^{1/|o_i|}$，单个极端 $\rho$ 拉不动整句。

实现上在 **token 级、对数空间** clip，再做几何平均，而不是像某些 R1 实现那样对 $\prod_t\rho_{t}$ 做序列级 clip。序列级 clip 一触发，整句梯度全零。推荐范围 $(e^{-0.4},e^{0.4})$，比 GRPO 的 $(0.8,1.2)$ 和 DAPO 的 $(0.8,1.28)$ 都宽。消融去掉 $1/|o|$ 归一，7B 均分 52.7→52.0。

评测协议跟 Dr. GRPO 文：语言任务温度 **0.0**、每题一条，报 **Pass@1**。训练：MATH Level 3–5，**8523** 题；每题 8 条 rollout，最长 3000 token。

Table 1（五科均分；Oly. = OlympiadBench）：

| 模型 | AIME24 | AMC | MATH500 | Minerva | Oly. | Avg. |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GRPO-7B（R1-Distill） | 43.3 | 67.5 | 89.0 | 39.7 | 56.7 | **59.3** |
| GMPO-7B（R1-Distill） | 46.6 | 78.3 | 91.4 | 37.9 | 62.5 | **63.4** |
| GRPO-7B | 40.0 | 59.0 | 83.4 | 32.4 | 41.3 | 51.2 |
| GMPO-7B | 43.3 | 61.4 | 82.0 | 33.5 | 43.6 | 52.7 |
| GRPO-1.5B | 23.3 | 49.4 | 75.2 | 25.7 | 39.0 | 42.5 |
| GMPO-1.5B | 20.0 | 53.0 | 77.6 | 30.1 | 38.7 | 43.9 |

R1-Distill-Qwen-7B 上均分 **59.3 → 63.4**（+4.1 百分点）。Minerva **39.7 → 37.9**，不是五科都涨。Table 2：Qwen2.5-VL-Instruct-7B 在 Geometry3K 上 **53.3 → 54.7**（+1.4）；Qwen3-32B MoE 在 MATH500 上 **94.6 → 96.7**（+2.1）。几何平均和 GSPO 的 $s_i$ 长得像，但 GMPO 的几何平均作用在 $|\rho\hat{A}|$ 上、clip 仍在 token；GSPO 的几何平均是序列似然比本身。不要把两篇合成一句「都是几何平均所以一样」。

## 7. GHPO：难样本改 prompt，在模仿与 on-policy 之间切

**GHPO = Guided Hybrid Policy Optimization**（Liu、Gong 等，[arXiv:2507.10628](https://arxiv.org/abs/2507.10628) v2 HTML）。它不改 clip 公式，改的是 **轨迹从哪条条件分布采出来**。

病根：RLVR 的奖励在轨迹终点才给。当前策略对某题 $G$ 次全错，奖励全 0，式 (2) 优势全 0，这题的算力白烧。他们在 NuminaMath-1.5（约 90 万竞赛题）上测 Qwen2.5-7B-Instruct，**52%** 的题做不出——对 Qwen2.5-7B-Base 更谈不上。DAPO 的办法是丢掉这些组；GHPO 的办法是 **留下，但改 prompt**。

难度检测：组内 $G$ 条奖励全 0，则判难。否则 $q^*=q$，走普通 on-policy GRPO。难则把标准答案的前缀切一段接到问题上：

$$
q^*=\begin{cases}
q, & \sum_{i}f(a,o_i)>0,\\
q+\omega\cdot h_{f,q}, & \text{otherwise.}
\end{cases} \tag{11}
$$

$\omega$ 按阶段线性加长：**$\{0.25,0.5,0.75\}$**。提示模板是一句固定引导语加上 hint 正文（原文 Figure 3）。前 **$N=20$** 步可选冷启动：关掉检测，先跑原版 GRPO，避免格式还不会时几乎每题都判难。

目标函数形态仍是 GRPO 的 token clip + 组相对优势，但比率在 $q^*$ 上算（原文式 (4)–(6)）。这是轨迹侧的「修前缀」，不是奖励侧另训一个教师 logits。和 OPD 的分界：OPD 要教师在学生前缀上给分布；GHPO 掺的是 **数据集里已有的标准解答文本**，没有外挂教师模型。

评测（原文 §4.4）：多数基准报 **pass@1**；AIME2024 题少且难，报 **avg@32**。温度 0.0 或 1.0（随基准难度），最长 4096。评测 **不用** hint。奖励：规则正确性 $+1/0$，格式 $+1/0$，两者权重 **2:1**。训练 batch 112，每题 8 条，最长 2048。

Table 1：训练数据 **Math3to5**（MATH Level 3–5，**8890** 题）。AIME24 列为 avg@32，其余 pass@1，AVG 是六项算术平均。

| 模型 | AIME24 | MATH-500 | OlympiadBench | AMC23 | Minerva | GPQA-D | AVG |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen2.5-Base-7B | 0.098 | 0.694 | 0.340 | 0.400 | 0.195 | 0.217 | 0.324 |
| Qwen2.5-7B-GRPO | 0.131 | 0.752 | 0.408 | 0.475 | 0.312 | 0.308 | **0.398** |
| Qwen2.5-7B-GHPO | 0.133 | 0.786 | 0.415 | 0.575 | 0.346 | 0.394 | **0.442** |

Table 1 上 GRPO→GHPO 均分 **0.398 → 0.442**（+4.4 百分点）。摘要写「约 5%」是约数；核对用表。AMC23 **0.475 → 0.575**，GPQA-Diamond **0.308 → 0.394**；AIME24 几乎不动（0.131 → 0.133）。

Table 2：更难的 **NuminaMath-S**（18300 题，math3to5 + OlympiadBench + AMC）。同一套六科、同一套分母。

| 模型 | AIME24 | MATH-500 | OlympiadBench | AMC23 | Minerva | GPQA-D | AVG |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen2.5-7B-GRPO | 0.122 | 0.774 | 0.396 | 0.525 | 0.283 | 0.353 | 0.409 |
| Qwen2.5-7B-GRPO-CL | 0.112 | 0.774 | 0.395 | 0.550 | 0.335 | 0.323 | 0.415 |
| Qwen2.5-7B-GRPO-CL-H(0.5) | 0.152 | 0.774 | 0.389 | 0.550 | 0.331 | 0.338 | 0.422 |
| Qwen2.5-7B-GHPO | 0.163 | 0.776 | 0.389 | 0.575 | 0.342 | 0.404 | **0.442** |
| Qwen2.5-Math-7B-GRPO | 0.2698 | 0.81 | 0.4481 | 0.625 | 0.3456 | 0.3384 | 0.4728 |
| Qwen2.5-Math-7B-GHPO | 0.3198 | 0.822 | 0.4525 | 0.7 | 0.3824 | 0.3687 | **0.5076** |

Mixed 上 Base 的 AIME24 avg@32 **0.122 → 0.163**；课程学习 GRPO-CL 均分只有 0.415，固定 50% hint 的 CL-H 到 0.422，都低于自适应 $\omega$ 的 GHPO **0.442**。Math-7B 骨干上均分 **0.4728 → 0.5076**。OlympiadBench 在 Base Mixed 上 GHPO **0.389** 略低于 GRPO 的 **0.396**，不是六科单调涨。

训练动态（原文 Figure 5）：相当长时间里，一个 mini-batch 里仍有约 **60%** 的题被判难、需要 hint。GHPO 的准确率奖励全程高于 GRPO，梯度范数更小；后期平均回复更长。这是「改 prompt 换有效梯度」，不是把 GHPO 写成另一种 clip。

和 DAPO 动态采样的分工：同样面对全错组，DAPO **扔掉 prompt**，保证 batch 里每条都有非零 $\hat{A}$；GHPO **留下 prompt**，把标准解前缀补进 $q$，让至少一条 rollout 有机会得非零奖励。前者省的是无效更新，代价是题库里最难的那截永远不进梯度；后者吃掉这截，代价是训练分布掺了教师前缀，和推理时的无 hint 前缀再次错位。这就是为什么评测必须关 hint，以及 $\omega$ 要按阶段加长而不是固定 0.5。固定 hint 的 GRPO-CL-H(0.5) 均分 0.422，低于自适应 GHPO 的 0.442，分母同是 Table 2 的六科平均。

## 8. 可选对照：Dr. GRPO 与 CISPO

Dr. GRPO 正本在 [4.4.6/03](../../4.4.6-其他策略梯度/03-DrGRPO-去标准差/03-DrGRPO-去标准差.md)，本夹只留对照，公式以专文为准。**Dr. GRPO**（Liu 等，*Understanding R1-Zero-like Training*，[arXiv:2503.20783](https://arxiv.org/abs/2503.20783)）在奖励侧拆 GRPO 目标里的两个归一。**长度偏差**：除以 $|o_i|$ 让正优势短句每个 token 更新更猛、负优势长句罚得更稀。**难度偏差**：除以组内 $\mathrm{std}$ 让几乎全对或全错的题权重反而更大。拆掉这两项、用生成预算常数做 masked mean，得到无偏估计。他们的最小配方：Qwen2.5-Math-7B，MATH Level 3–5，Qwen-Math 模板，**8×A100、约 27 小时**。Table 4 里 Oat-Zero-7B（即这条配方）五科均分 **51.4**（AIME24 43.3，AMC 62.7，MATH500 80.0，Minerva 30.1，OlympiadBench 41.0）；生成预算 3k。这是 Dr. GRPO 文的表，不要和 GMPO Table 1 的 52.7 直接并成「同一实验」。

**CISPO** 一手在 MiniMax-M1（[arXiv:2506.13585](https://arxiv.org/abs/2506.13585)）：**Clipped IS-weight Policy Optimization**。他们的设定是每代 rollout 做 16 轮 off-policy 更新；这时 GRPO/DAPO 那种「越出 clip 带就丢掉 token」会把对长 CoT 关键的高比率 token 整段抹掉，熵也稳不住。CISPO 把 clip 加在重要性权重上，并对该权重 **stop-gradient**，梯度仍从 $\log\pi_{\theta}$ 走：

$$
\hat{r}_{i,t}(\theta)=\mathrm{clip}\bigl(r_{i,t}(\theta),\,1-\varepsilon_{\mathrm{low}}^{\mathrm{IS}},\,1+\varepsilon_{\mathrm{high}}^{\mathrm{IS}}\bigr),\qquad
\mathcal{J}_{\mathrm{CISPO}}\propto \mathrm{sg}(\hat{r}_{i,t})\,\hat{A}_{i,t}\,\log\pi_{\theta}(o_{i,t}\mid\cdot). \tag{12}
$$

无权重 clip 时退回普通政策梯度。实验里他们把下界 $\varepsilon_{\mathrm{low}}^{\mathrm{IS}}$ 放很大（等于不卡下界），只调上界；优势用 GRPO 组相对，损失用 token 级分母，并沿用 DAPO 的动态采样与长度惩罚，无 KL。对照设定：Qwen2.5-32B-base、DAPO 数学数据、AIME 2024。文称同等步数优于 GRPO/DAPO，并称约一半步数追上 DAPO（Figure 2；本篇不临摹该曲线）。ScaleRL 也采用 CISPO；本篇符号以 MiniMax-M1 HTML 为准，不另编 ScaleRL 专有公式。

## 9. 勘误（4.4 首页与 13.4.1 不要抄）

| 错的说法 | 本篇以谁为准 |
| --- | --- |
| DAPO = Decoupled Alignment Policy Optimization | 原文标题：**Decoupled Clip and Dynamic sAmpling Policy Optimization** |
| GSPO = 时间维滑动窗口局部优势 | 序列似然比 $s_i$（几何平均）再 clip；优势仍是组内 $z$-score |
| DAPO = 段级优势 | DAPO 优势公式与 GRPO 相同；段级优势是 SPO 等另一条线 |
| DAPO 超长奖励改成 0 | 先 Filtering mask 损失，再式 (7) 的软惩罚区间 |
| OPD 是 GRPO 变体 | 综述：散度 OPD 换 $J$；hybrid 才留 $J$。蒸馏见 4.6 |
| GMPO 的几何平均 = GSPO 的 $s_i$ | 一个平均 $\|\rho\hat{A}\|$，一个平均序列似然比 |

## 10. 失效

| 现象 | 落在哪一侧 | 说明 |
| --- | --- | --- |
| 组内全对/全错 | 奖励侧式 (2) 退化；轨迹侧采到无信息组 | DAPO 丢掉；GHPO 改 prompt；什么都不做则梯度为零 |
| 熵崩、过早确定 | 轨迹侧对称上 clip | Clip-Higher 放宽上界；过放下界会塌采样空间 |
| 长 CoT 胡写、复读 | 样本级 $1/G\sum 1/\|o_i\|$ | DAPO token 级分母；Dr. GRPO 去长度归一，动机不同 |
| MoE 一次更新换约 10% 专家 | 轨迹侧 token 级 IS | GSPO 看序列似然；GRPO 需 Routing Replay |
| $\rho_t$ 离群把更新拉飞 | 轨迹侧算术平均 | GMPO 几何平均；仍可能牺牲 Minerva 这种单科 |
| 标准答案泄漏进评测 | GHPO 的 $q^*$ | 评测必须关 hint；训练 $\omega$ 过大则变成变相 SFT |
| 没有可解析的整数答案 | DAPO-Math-17K 的前提 | 他们把答案改造成整数才用规则奖励 |
| 拿 50 分 AIME 当「所有 DAPO」 | 分母是 Qwen2.5-32B base、avg@32 | 换骨干、换 $k$ 不能直接比 |

下一篇读邻居展开：[02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 的组统计，[03-GSPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/03-GSPO/03-GSPO.md) 的序列似然，[01-GMPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/01-GMPO/01-GMPO.md) 的几何平均实现。OPD：[01-OPD-学生前缀蒸馏](../../../4.6-OPD/01-OPD-学生前缀蒸馏/01-OPD-学生前缀蒸馏.md)。

## 参考文献

1. Shen, Luo, Li, et al. *A First-Principles Derivation of LLM Policy Optimization: From Expected Reward to GRPO and Its Structural Extensions*（[arXiv:2606.16733](https://arxiv.org/abs/2606.16733) / [HTML](https://arxiv.org/html/2606.16733)）。式 (3) 的 $J(\theta)$；GRPO 为奖励侧替换；DAPO/GSPO 在 clip–ratio；§9.1 OPD/DPO 边界。
2. Shao et al. *DeepSeekMath*（[arXiv:2402.03300](https://arxiv.org/abs/2402.03300) / [HTML](https://arxiv.org/html/2402.03300)）。GRPO 式 (3)；结果监督 $\hat{A}_{i,t}=(r_i-\mathrm{mean})/\mathrm{std}$；GSM8K 82.9→88.2、MATH 46.8→51.7。
3. Yu et al. *DAPO: An Open-Source LLM Reinforcement Learning System at Scale*（[arXiv:2503.14476](https://arxiv.org/abs/2503.14476) / [HTML](https://arxiv.org/html/2503.14476)）。全称；式 (8)(10)(12)(13)；Table 1 的 30/36/38/41/42/50。
4. Zheng et al. *Group Sequence Policy Optimization*（[arXiv:2507.18071](https://arxiv.org/abs/2507.18071) / [HTML](https://arxiv.org/html/2507.18071)）。式 (5)(7)；clip $3\times10^{-4}$/$4\times10^{-4}$；MoE 约 10% 专家变化。
5. Zhao, Liu, et al. *Geometric-Mean Policy Optimization*（[arXiv:2507.20673](https://arxiv.org/abs/2507.20673) / [HTML](https://arxiv.org/html/2507.20673)）。式 (3)(4)；Table 1–2。
6. Liu, Gong, et al. *GHPO: Adaptive Guidance for Stable and Efficient LLM Reinforcement Learning*（[arXiv:2507.10628](https://arxiv.org/abs/2507.10628) / [HTML](https://arxiv.org/html/2507.10628v2)）。式 (4)(5)；Table 1–2；$\omega\in\{0.25,0.5,0.75\}$。
7. Liu et al. *Understanding R1-Zero-like Training*（Dr. GRPO；[arXiv:2503.20783](https://arxiv.org/abs/2503.20783) / [HTML](https://arxiv.org/html/2503.20783)）。去 $1/|o|$ 与 $\mathrm{std}$；Table 4 Oat-Zero-7B。
8. MiniMax. *MiniMax-M1*（[arXiv:2506.13585](https://arxiv.org/abs/2506.13585)）。CISPO：clip IS 权重 + stop-gradient。

DAPO Figure 1、GSPO Figure 1 等训练曲线不临摹。
