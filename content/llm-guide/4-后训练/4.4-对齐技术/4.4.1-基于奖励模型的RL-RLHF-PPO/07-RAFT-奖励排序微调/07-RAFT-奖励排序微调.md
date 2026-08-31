---
title: "07 · RAFT：奖励排序微调"
date: 2026-08-31
tags: [RAFT, RLHF, SFT, PPO, RLOO, HH-RLHF]
as_of: 2026-08-31
---

# 07 RAFT：奖励排序微调

RAFT（Reward rAnked FineTuning，奖励排序微调）对每条 prompt 采 $K$ 条回复，按奖励排序，只对最高那条做 SFT，其余丢掉。论文写的就是 sample $K$、take highest reward、fine-tune，这一圈可以反复跑。它要拆的瓶颈很具体：PPO 在 RLHF 里同时扛策略、参考模型、奖励模型和 Critic，trial-and-error 又不如交叉熵稳。本篇落在 4.4.1 奖励模型 RL 一条线上，记号沿用策略 $\pi_{\theta}$、奖励 $r$ 与可选 KL 系数 $\beta$，公式和表跟 Dong 等（[arXiv:2304.06767](https://arxiv.org/abs/2304.06767)，HTML：[arxiv.org/html/2304.06767](https://arxiv.org/html/2304.06767)）。不是 RLOO：那边 $k$ 条全进梯度，baseline 是其余 $k-1$ 条均值，见 [06-RLOO-留一法基线](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)。不是 PPO：无 Critic、无 GAE、主路径也不靠 clip。不是 GRPO：没有组内 $z$-score。不是 DPO：奖励模型还在，更新是在线采样之后的交叉熵。

## 1. PPO 四件套太重，离线 SFT 又够不着

InstructGPT 那条三阶段还在：先 SFT，再训奖励模型，再拿奖励去抬策略。第三阶段默认走 PPO。Schulman 等把 PPO 做成「小步、稳更新」的工具，前提是 off-policy 梯度会大到把学习扯散。落到语言模型上，一次迭代常要同时加载四份权重：正在训的生成器、估 KL 的参考模型、奖励模型、以及跟策略差不多大的 Critic。Dong 等在 $8\times$ A40（48G）上用 TRL 复现时，半精度也会在算 attention 中间量时 OOM；跟上 7B 奖励模型更是直接爆显存。PPO 基线因此只好 LoRA，奖励模型也只能停在 3B。

SFT 本身稳、超参少。问题是，拿一份事先定好的「高质量」语料去微调，通常打不过 PPO 对齐过的模型。离线 RL 的覆盖假设在这里几乎不可能满足：要对齐到「每个 prompt 上奖励最高的那条 $y$」，数据集得把最优策略可能走到的回复都罩住。输出空间按 token 指数膨胀，专家手写又贵。模型自己倒是能无限吐样本，缺的是一套不靠人逐条打分的筛选。

奖励模型正好填这个缺口。它已经从偏好对里学过「同一 prompt 下谁更好」。不必把 $r(x,y)$ 的绝对值当成回归标签，排序本身就能当过滤器：同一条 $x$ 上采够 $K$ 条，留下最高的那条，丢掉明显差的。过滤后的集合再拿去交叉熵，训练形态回到 SFT，内存账单变成「一次只加载一个模型」。

目标仍是抬期望奖励。记初始生成器 $G_0=g(w_0,x)$，条件分布 $p_g(y|w,x)$，prompt 来自 $\mathcal{D}$：

$$
\max_{w}\mathbb{E}_{x\sim\mathcal{D},\,y\sim p_g(\cdot|w,x)}\,r(x,y). \tag{1}
$$

若模型强到能在每条 $x$ 上单独取到最大，最优策略是把质量全堆在奖励最高的那条上：

$$
p_g(\cdot|w^{*},x)=\begin{cases}
1 & y=\arg\max_{y'\in\mathcal{Y}}r(x,y')\\
0 & \text{otherwise.}
\end{cases} \tag{2}
$$

搜遍 $\mathcal{Y}$ 做不到。能做的是用当前策略的 $K$ 次独立样本，去逼近这条 best-of-$K$ 策略，再靠 SFT 把质量搬到 $\arg\max$ 上。下一轮生成器更接近式 (2)，best-of-$K$ 的天花板也跟着抬。这就是迭代，不是单次过滤。

## 2. 采 $K$、取最高、只对冠军做 SFT

每个阶段 $t+1$ 三步。论文 §3.2 写得很短，实现上也就是这三步。

**Step 1：采。** 抽一批 prompt $\mathcal{D}_t=\{x_1^t,\ldots,x_b^t\}$。对每条 $x_i^t$，从当前 $G_t$ 采 $K$ 条 $y_1,\ldots,y_K\sim p_{G_t}^{1/\lambda}(\cdot|w_t,x_i^t)$。$\lambda$ 是温度，越大越散。

**Step 2：排。** 用冻结的 $r$ 给这 $K$ 条打分，取

$$
y^{\star}(x)=\arg\max_{y_j\in\{y_1,\ldots,y_K\}}r(x,y_j).
$$

$b$ 条 prompt 走完，得到大小为 $b$ 的过滤集 $\mathcal{B}$。接受率是 $1/K$：同一 prompt 下 $K$ 条里只留 1 条。这是局部排序，不是跨 prompt 比绝对值。HH-RLHF 的奖励模型本来就是同一 prompt 下的成对比较训出来的，跨题比分数没有定义。

**Step 3：微调。** 在 $\mathcal{B}$ 上对当前生成器做交叉熵，得到 $G_{t+1}$。损失就是普通 SFT：

$$
\mathcal{L}_{\mathrm{RAFT}}(w)=-\mathbb{E}_{(x,y^{\star})\sim\mathcal{B}}\log p_g(y^{\star}|w,x).
$$

$K-1$ 条低分样本不进这条损失。没有优势、没有比率、没有 clip。下一阶段从 $G_{t+1}$ 再采。奖励收敛就停。

超参很少。$b$ 是批大小，用来并行。$1/K$ 是接受率，$K$ 越大，留下来的越偏高奖励。$\lambda$ 管采样多样性。$\beta$ 可选，下一节才出场。LLaMA-7B 实验里 $b=2048$，每个 SFT 阶段 2 个 epoch，学习率 $2\times 10^{-5}$，线性衰减。生成最多 128 个新 token。

这句话值得单独钉死：**更新只发生在 $\arg\max$ 上。** 排序用了 $K$ 条，梯度只用 1 条。和「$k$ 条全用」的算法共享采样预算，吃法完全不同。

![同一 prompt 采 K 条：RAFT 只留 top-1，对照路径把 K 条全用](./images/fig-raft-keep-top1-vs-all.png)

> 图 1：同一 prompt 采 $K=4$ 条并打分。上栏 RAFT 只把 $\arg\max$ 送进交叉熵，其余三条虚线丢掉；下栏把四条全部送进更新。

**图 1 解析**

- 左侧 `prompt x` 进策略，一次画出 $y_1$ 到 $y_4$，对应 $r_1$ 到 $r_4$。加粗描边的 $y_1$、$r_1$ 是本例的冠军。
- 上栏实线只从 $r_1$ 进 `rank / keep argmax`，再进 $y^{\star}$，最后进 `SFT CE on y* only`。交叉熵在这里停，没有再画出去的箭头。
- 三条虚线从 $r_2$、$r_3$、$r_4$ 进灰色 `discard K-1`。它们参与了排序，不参与更新。
- 下栏四条奖励都走实线进 `all K enter update`。那是 RLOO 一类「全用」的吃法，不是 RAFT。
- 两栏之间没有箭头。冠军路径和全用路径是两条独立的汇。

手算一组奖励 $(2.0,\,0.5,\,1.5,\,-0.5)$，把两种吃法摊开：

| $i$ | $r_i$ | RAFT 去向 | 若走留一法优势 |
|-----|------:|-----------|----------------:|
| 1 | 2.0 | 唯一进 SFT | $1.500$ |
| 2 | 0.5 | 丢掉 | $-0.500$ |
| 3 | 1.5 | 丢掉 | $0.833$ |
| 4 | $-0.5$ | 丢掉 | $-1.833$ |

RAFT 的交叉熵只看见 $y_1$。第二名 $r=1.5$ 比第四名高很多，对 RAFT 来说和第四名一样：都是「不是第一」。名次一翻，冠军换人，梯度指头就转。这是后面噪声实验里 RAFT 比分差方法更脆的原因，不是实现 bug。

$K$ 越大，best-of-$K$ 的期望奖励越高，边际却按 $\sqrt{\log K}$ 变钝。奖励有界时，论文用浓度不等式写出

$$
\mathbb{E}[r(x,y)]\le\mathbb{E}\bigl[\max_{i\le K}r(x,y_i)\bigr]\le\mathbb{E}[r(x,y)]+\sqrt{\tfrac{B^{2}}{2}\log K}.
$$

所以 $K$ 从 8 加到 32 有用，但不会线性涨。这也是必须迭代的理由：单靠把 $K$ 加到几百，天花板抬得越来越慢；换成「学完再采」，当前策略本身在往式 (2) 挪，best-of-$K$ 的目标也在往上走。

WebGPT 和 Cobbe 等早就把推理期 best-of-$K$ 当成强基线，代价是每次回答都要采 $K$ 次。RAFT 把这套策略蒸馏回模型参数里：训练时付采样，部署时不必再为了对齐去跑 $K$ 次。

![RAFT 迭代三步：采、排、SFT，再把 G_{t+1} 送回下一阶段](./images/fig-raft-iter-loop.png)

> 图 2：从 $G_t$ 出发，Step 1 每条 prompt 采 $K$ 条，Step 2 按 $r$ 取 $\arg\max$ 得到大小为 $b$ 的 $\mathcal{B}$，Step 3 在 $\mathcal{B}$ 上 SFT 得到 $G_{t+1}$。底廊虚线是下一阶段，不是 PPO 的 clip。

**图 2 解析**

- 主方向从左到右：`G_t` → 采 → 排 → 过滤集 $\mathcal{B}$ → SFT。
- Step 1 写明 `sample K per prompt` 和 batch $b$。$K$ 条是采样预算，$\mathcal{B}$ 的大小仍是 $b$，不是 $bK$。
- Step 2 的 $y^{\star}=\arg\max$ 是唯一的选择算子。没有均值，没有标准差。
- 紫色框 $\mathcal{B}$：每个 prompt 一条冠军。这就是下一阶段交叉熵的全部监督。
- 底廊虚线从 Step 3 回到 $G_t$，标签是 `G_{t+1} becomes G_t`。这是图里唯一的回边。
- 图注写「一次只加载一个模型」「不是 PPO clip」。采样、打分、SFT 三步可以卸掉另两份权重再跑。

## 3. 可选 KL：改用来排序的分数，不是 clip

对齐税是老问题：只抬 $r$，流畅性和多样性会掉。一种补法是在目标里减一项质量正则 $Q(w)$：

$$
\max_{w}\Bigl[\mathbb{E}_{x\sim\mathcal{D},\,y\sim p_g(\cdot|w,x)}r(x,y)-\beta Q(w)\Bigr]. \tag{3}
$$

常用的 $Q$ 是到初始模型 $G_0$ 的正向 KL：

$$
Q(w)=\mathbb{E}_{x\sim\mathcal{D}}\,\mathrm{KL}\bigl(p_g(\cdot|w,x)\,\Vert\, p_{G_0}(\cdot|w_0,x)\bigr). \tag{4}
$$

选这个方向而不是对称 JS、也不是反向 KL，是因为它惩罚「初始模型几乎不会说的话」：某条 $y$ 在 $p_{G_0}$ 上接近 0，更新后的模型也不该把质量堆上去。把式 (4) 折进逐条分数，得到论文式 (5)：

$$
\tilde{r}(x,y)=r(x,y)-\beta\log\frac{p_g(y|w,x)}{p_{G_0}(y|w_0,x)}. \tag{5}
$$

$\beta>0$ 时，Step 2 不再按裸 $r$ 排序，改按 $\tilde{r}$ 排序。实现上就是在打分阶段多查两份 logits：当前模型和初始参考模型。排序键变了，后面的 SFT 还是交叉熵。

这不是 PPO 的比率 clip。PPO 把 $\pi_{\theta}/\pi_{\mathrm{old}}$ 夹在 $1\pm\varepsilon$ 里，再乘优势；式 (5) 只改「谁排第一」。没有 $1\pm\varepsilon$，没有 GAE，也没有把 KL 扣进逐步 $r_t$。主实验甚至可以 $\beta=0$：HH-RLHF 上不显式加 KL，困惑度和多样性也没像 PPO 那样跟着奖励一起垮。$\beta$ 扫 $\{0,0.005,0.01,0.1\}$ 时，更大的 $\beta$ 会让模型离 $G_0$ 更近，测试奖励也略降（$2.143$ 降到 $2.029$，$K=8$、$\lambda=1.0$）。PPO 那边 KL 系数主要是在救流畅性；RAFT 这边 KL 主要是在管「走多远」。要不要加，看有没有硬性的 KL 预算。多一次前向是真实成本。

## 4. 一次只加载一个模型

三步在计算图上是断开的。采样不必为反传保留中间激活；打分用冻结的 $r$，不必和生成器同驻；SFT 只看见 $\mathcal{B}$ 里的文本。只要这台机器能对某个尺寸做 SFT，就能用 RAFT 对齐它。PPO 做不到这句：on-policy 更新要同时拿旧策略的 log-prob、参考模型的 KL、Critic 的 $V$ 和奖励模型的 $r$。

LLaMA-7B + HH-RLHF 的对照把这句话写成了硬件事实。实验在 $8\times$ A40（48G）、600G 内存、bf16 上跑。PPO 走 TRL，必须 LoRA；尝试 7B 奖励模型时 OOM。RAFT 的奖励模型用 Open-LLaMA-3B，验证准确率 $75.48\%$，高于公开的 GPT-J-6B RM（$68\%$）。附录里 Open-LLaMA-13B RM 能到 $81.73\%$，PPO 仍然装不下；RAFT 因为三步分开，同一套卡可以换 13B 的 $r$ 来排序。

奖励再中心化也不改 RAFT 的排序。附录给 3B RM 减 $4.82$、给 13B RM 减 $14.4$，是为了让 PPO 的起点奖励靠近 0。线性平移不改变 $\arg\max$。尺度敏感的是 PPO 的 Critic 和优势，不是这套过滤器。

采样和更新还可以不是同一个模型。论文用 LLaMA-7B-SFT 当老师（$K=32$，$\lambda=0.85$），把过滤后的样本拿去微调 GPT-Neo-2.7B。学生从奖励 $-1.23$ 走到 $0.739$，自己采自己排只能到 $0.210$。这是 off-policy 蒸馏，不是 PPO 那种必须 on-policy 的四件套。推测解码之类只加速推理的技术，也可以直接塞进 Step 1；PPO 的反传还要前向那份计算图，吃不上这口。

和 RRHF 的分界在数据从哪来。Yuan 等同期的 RRHF 也是「打分、过滤、再微调」，但样本来源杂，离线收集为主。RAFT 的主路径是当前策略自己吐的在线样本，行为策略跟着 $G_t$ 往前走，和 RL 的设定一致。Self-Instruct 也用模型自己的样本，过滤规则却是启发式（指令太长、复读输入、和已有指令太像）。RLHF 这边已经有偏好奖励，不必再靠这些手工闸门当主筛选。

## 5. 不是 RLOO，不是 PPO，不是 GRPO，不是 DPO

同一笔「每 prompt 采 $K$ 条」的预算，RAFT 和 RLOO 的更新相反。RLOO 把 $k$ 条全用：第 $i$ 条的 baseline 是其余 $k-1$ 条奖励的均值，自己不进这道均值，再拿 $(R_i-b_i)$ 去乘整段 $\nabla\log\pi$。公式、手算和「不是 $z$-score」写在 [06-RLOO-留一法基线](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)。RAFT 不估优势。第二名无论比第四名好多少，梯度里都是 0。Ahmadian 等后来在同一套 HH / TL;DR 设定里把头对头比过：同 $k$ 下 RLOO 的学习曲线全程压着 RAFT，$k=2$ 的 RLOO 用一半在线样本就能对上或超过 RAFT $k=4$。冠军一条交叉熵，对不上 $k$ 条相对位置。那是 RLOO 的论文，不是 Dong 等的主表；拿来只说明「全用」和「只留第一」不是同一算法。

PPO 更远。动作按 token 建，状态是部分序列，优势走 GAE，更新走 clip。Dong 等的 PPO 基线仍是这套：clip $0.2$，GAE $\lambda=0.95$，折扣 $1$，KL 系数在 $\{0.01,0.05,0.1\}$ 里搜，动态 KL（TRL 默认）。RAFT 主路径没有这些旋钮。没有 Critic，也就没有「部分序列上的 $V$」。生成器、参考模型、奖励模型、价值网络不必同驻。

GRPO 拆掉了 Critic，但仍用含自己的组均值和标准差做 $z$-score，目标里还留着 PPO 式 clip。RAFT 连这道归一都没有：不过组均值，不除组标准差，不 clip。组内几乎同分时，GRPO 的分母趋近 0；RAFT 只是「随便留一条冠军」，梯度仍是普通 SFT，不会被 $1/\mathrm{std}$ 放大。

DPO 连第三阶段的在线 RL 都跳过：偏好对直接进分类损失，不训独立奖励模型，也不做 rollout。RAFT 仍走 Ziegler / Ouyang 那条三阶段。$r$ 必须在，采样必须在。没有偏好对、只有奖励模型时，DPO 没有输入；RAFT 还能跑。

| | PPO | GRPO | RLOO | RAFT |
|--|-----|------|------|------|
| 动作 | 逐步 token | 常把整段优势广播到 token | 整段 $y$ | 整段 $y^{\star}$ |
| 谁进更新 | 当前 rollout | 组内 $G$ 条 | $k$ 条全用 | 只有 $\arg\max$ |
| 基线 | $V_{\phi}$ + GAE | 组均值（含自己）/ std | 其余 $k-1$ 条均值 | 无；用名次当过滤器 |
| 信任域 | clip $1\pm\varepsilon$ | 目标里仍有 clip | 主估计器无 clip | 无 clip；可选式 (5) 只改排序 |
| 额外网络 | Critic | 无 | 无 | 无 |
| 同卡常驻 | 四份 | 策略 + RM + 常还要 ref | 三份 | 一次一份 |

## 6. 一手数字：LLaMA-7B + HH-RLHF

基座是 LLaMA-7B，数据是 HH-RLHF（Helpful and Harmless）：112K 训练、12.5K 测试。每条是 prompt $x$ 加 chosen / rejected 一对。先用 112K 的 chosen 做 1 个 epoch SFT，得到 LLaMA-7B-SFT，作为 RAFT 和 PPO 的共同起点。奖励模型跟 Ouyang 的 BT 成对损失，底座是 Open-LLaMA-3B，验证准确率 $75.48\%$，对照 Hugging Face 上 GPT-J-6B RM 的 $68\%$。Prompt 上下文截到 256 token，超长的丢掉，prompt 集从 112K 变成 82147。硬件是 $8\times$ A40，bf16。

评测主表在 4608 条手留测试集上算平均奖励；困惑度另用 6K 手留样本、对着 chosen 文本算。多样性走 GEM-metrics：MSTTR-100、Distinct-1/2、Unique-1/2。解码最多 128 新 token。测试配置对所有方法锁定，PPO 的生成配置跟 TRL，几乎没另调，因为复杂解码会把 KL 估计弄坏。

| 模型 | 奖励 | PPL | MSTTR-100 | Distinct-2 | 长度 |
|------|-----:|----:|----------:|-----------:|-----:|
| HH rejected | $0.156$ | - | $0.623$ | $0.284$ | $144.3$ |
| HH chosen | $1.873$ | - | $0.624$ | $0.282$ | $154.2$ |
| LLaMA-7B | $-0.435$ | $4.781$ | $0.579$ | $0.258$ | $119.9$ |
| LLaMA-7B-SFT | $0.772$ | $3.781$ | $0.597$ | $0.250$ | $145.4$ |
| PPO | $2.077$ | $4.156$ | $0.597$ | $0.262$ | $127.8$ |
| RAFT $K=32$, $\lambda=1.0$ | $2.294$ | $4.031$ | $0.611$ | $0.258$ | $156.2$ |

SFT 已经把奖励从 $-0.435$ 抬到 $0.772$，仍低于语料里的 chosen（$1.873$）。PPO 和 RAFT 都越过了这条人类 preferred 线。RAFT-K32 的测试奖励 $2.294$ 最高，PPL $4.031$，比 PPO 的 $4.156$ 干净；回复也更长（$156.2$ 对 $127.8$）。PPO 的短，多样性指标看起来不差，长度先缩一截，Distinct 容易虚高。这和后来 RLOO 文里 PPO 平均只有十几 token 是同一类病，只是这张表还没那么极端。

GPT-4-0613 和 7 名标注员在 100 条随机测试 prompt 上比过，输入顺序对调以消位置偏差。RAFT-K32 对 PPO $\beta=0.1$：GPT-4 判 65 胜 32 负 3 平，人评 66 / 14 / 20。对 PPO $\beta=0.05$：GPT-4 69 / 28 / 3，人评 44 / 32 / 24。人对「平」更宽，GPT-4 更爱给胜负。和自动指标同向，不是只有 RM 分数在涨。

$K$ 在 $\{8,16,32\}$、$\lambda=0.85$ 时，测试奖励 $2.180$、$2.251$、$2.329$，PPL 都是 $3.953$。多样性不随 $K$ 变差。墙钟（$\lambda=1.0$，三次平均）：$K=8$ 约 5 小时，$K=16$ 约 6.05 小时，$K=32$ 约 7.05 小时。更大的 $K$ 多在推理；$K=16/32$ 大约 10–12 个迭代就振荡收敛，$K=8$ 要 15–18 次，收敛更快能补一部分额外采样。最快的 PPO（KL $0.01$ + LoRA）大约 8.7 小时，仍慢于这组全参 RAFT。

温度 $\lambda\in\{0.7,0.85,1.0\}$、$K=8$：测试奖励 $2.198$、$2.180$、$2.143$。初始 best-of-$8$ 奖励从 $3.41$ 降到 $2.48$，学习目标变矮，终局奖励也略降。$\lambda=1.0$ 的多样性最好（MSTTR-100 $0.605$，Distinct-2 $0.263$）。$\lambda=0.7$ 训练奖励和测试奖励缺口更大，偏过拟合。把 $K$ 加到 32 能补回来：$\lambda=1.0,K=32$ 奖励 $2.294$，初始 best-of-$K$ 又到 $3.43$。温度再高，7B-SFT 会吐乱码符号，过滤集被脏样本污染。调 $\lambda$ 的办法是先看初始 SFT 模型滤出来的 $\mathcal{B}$，生成还不稳就别再加。

奖励黑客在早期实验里出现过：RM 误爱 emoji 和 `#`，策略很快塌成乱插符号，过滤集的多样性指标先掉。因为采样和 SFT 是断开的，可以在 $\mathcal{B}$ 上再洗一次，删掉或清洗这些样本，不必改损失函数。PPO 的 hack 写进优势里，没有这层可检查的「将要学习的数据集」。这是可解释性，不是万能药：代理奖励和金奖励仍会分叉。附录用 GPT-2（124M）和 GPT-Neo-1.3B 当代理 RM，Open-LLaMA-3B 当金 RM，RAFT 和 PPO 都出现 Gao 等说的 over-optimization：代理分还在涨或平台振荡，金奖励已经掉头。代理越弱，掉头越狠。该早停。更准的 $r$ 仍然是主问题，换过滤器换不掉。

扩散那边同一套三步也能跑。Stable Diffusion v1.5 在 $256\times 256$ 上几乎忘了怎么画，用 CLIP 美学分当 $r$，CIFAR-10 类名当 prompt，单卡 A40 上 RAFT 8.4 分钟，DDPO 415 分钟，大约 50 倍。DDPO 把去噪链建成 MDP；RAFT 把整张图当成 contextual bandit 的一个动作。这能说明「不必逐步 MDP」，不是 4.4.1 的主数字。LLM 对齐仍以上面这张 HH 表为准。

## 7. 失效与边界

RAFT 把对照收成「谁排第一」。名次稳、冠军样本干净时，交叉熵又稳又省显存。下面这些情况它帮不上，或会换一种坏法。

| 现象 | 原因 | 说明 |
|------|------|------|
| 排序被噪声翻盘 | 梯度只看 $\arg\max$ | 分差方法要噪声大到改相对幅度才同等受伤；名次一翻，SFT 指错人 |
| 组内近乎同分 | 冠军几乎是随便留的 | 学到的是采样运气，不是偏好 |
| 代理 RM 过优化 | 过滤器再干净也是在拟合 $r$ | 金奖励会掉头。看过滤集、早停，换不掉更准的 $r$ |
| $K=1$ | 没有可排的对象 | 退回普通 SFT，不再是 RAFT |
| 跨 prompt 全局 Top $1/K$ | BT 奖励不可跨题比 | 更省样本，但和 RM 的局部比较训练不一致；主实验用局部 $\arg\max$ |
| 温度过高 | 7B-SFT 会吐乱码 | 先检查初始 $\mathcal{B}$ 再加 $\lambda$ |
| 只优化 $r$、不管 KL | 对齐税仍可能来 | 主实验 $\beta=0$ 还算稳；有硬 KL 预算再用式 (5) |
| 逐步过程奖励 | 整段一个标量 | 过程监督是另一条奖励密度，不是这三步 |

全局排序那一变体是：每条 prompt 只采 1 条，再在整批里取奖励最高的 $1/K$。样本效率更高，但 HH 的 $r$ 不能跨题比，主文没用它。长度敏感也在：SFT 对整段 $y^{\star}$ 做交叉熵，长回复的 token 更多，长度本身可能被 RM 喜欢（主表里 RAFT 比 PPO 长）。没有 $1/|y|$ 那层序列归一，这不是漏实现，是交叉熵的默认行为。

和邻居的分工可以收成一句：要留一法、把 $k$ 条全用，读 [06-RLOO-留一法基线](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)。解码期采 $n$ 取最高、可以不更新，读 [07-Best-of-N](../../4.4.4-其他对齐技术/07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md)。要把 $\pi_{\mathrm{BoN}}$ 用 Jeffreys 蒸馏回权重，读 [09-BOND](../../4.4.4-其他对齐技术/09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md)；那不是本篇的「只对冠军做 SFT」。本篇只负责把「采 $K$、取最高、只对冠军做 SFT」写成可跑的三步，并记住一次只加载一个模型、可选 KL 只改排序键。

## 参考文献

1. Dong, H., Xiong, W., Goyal, D., Zhang, Y., Chow, W., Pan, R., Diao, S., Zhang, J., Shum, K., & Zhang, T. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767). HTML：[arxiv.org/html/2304.06767](https://arxiv.org/html/2304.06767). OpenReview：[m7p5O7zblY](https://openreview.net/forum?id=m7p5O7zblY).
2. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
3. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
4. Ziegler, D. M., et al. (2019). [Fine-tuning language models from human preferences](https://arxiv.org/abs/1909.08593).
5. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).（HH-RLHF）
6. Touvron, H., et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971).
7. Hu, E. J., et al. (2021). [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685).（PPO 基线用 LoRA 是显存限制，不是 RAFT 的必要零件）
8. Nakano, R., et al. (2021). [WebGPT: Browser-assisted question-answering with human feedback](https://arxiv.org/abs/2112.09332).（best-of-$K$ 推理基线）
9. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760).
10. Yuan, Z., et al. (2023). [RRHF: Rank Responses to Align Language Models with Human Feedback without Tears](https://arxiv.org/abs/2304.05302).（同期、离线多源；对照用）
11. Ahmadian, A., et al. (2024). [Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs](https://arxiv.org/abs/2402.14740).（RLOO 与 RAFT 的头对头，留一法见邻居专文）
12. Bradley, R. A., & Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. *Biometrika*, 39(3/4), 324–345.
13. Geng, X., & Liu, H. (2023). [OpenLLaMA: An Open Reproduction of LLaMA](https://github.com/openlm-research/open_llama).（3B 奖励模型底座）
14. Black, K., et al. (2023). [Training Diffusion Models with Reinforcement Learning](https://arxiv.org/abs/2305.13301).（DDPO；扩散对照，不是 LLM 主表）
15. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290).（「不是 DPO」对照）
16. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).（GRPO 组内 $z$-score，对照用，不是 RAFT 原文）
