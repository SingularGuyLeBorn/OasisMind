---
title: "DeepSeek-V3.2: 稀疏注意力, 放大 RL 与合成 Agent 环境"
category: "模型技术报告"
tags: ["DeepSeek", "技术解析"]
published: true
excerpt: "DeepSeek-V3.2 以 DSA 降低长上下文注意力成本, 扩大后训练预算, 并把大规模 Agent RL 接入统一训练流程."
---
# DeepSeek-V3.2: 稀疏注意力, 放大 RL 与合成 Agent 环境

来源: [DeepSeek-V3.2 Technical Report](https://arxiv.org/abs/2512.02556)(arXiv: 2512.02556v1, 2025-12-02). 对照译稿: `deepseek-v3-2-bi.md`. 关键公式、图表和实验数字来自[原报告](https://arxiv.org/abs/2512.02556). V3.2 没有换底座. 报告第 2 节第一句就说, V3.2 与 V3.2-Exp 结构完全相同; 相对 V3.1-Terminus, 唯一的结构改动是通过继续训练加入 DeepSeek Sparse Attention(DSA). 其余参数, 层数, MoE 配置都沿用 V3, 报告没有重列. 这份报告实际做了三件事: 用 DSA 把长上下文的注意力成本从随长度平方增长改成近似线性; 把后训练算力加到预训练成本的 10% 以上, 并为此在 GRPO 上加了四项稳定化改动; 用合成环境做大规模 Agent RL. 三件事之间有依赖: 长上下文成本下降后, 长轨迹 Agent RL 才能容纳更多环境交互; GRPO 的四项改动则用于控制扩大训练预算后的方差与策略漂移.

## 1. DSA 稀疏注意力

**起点: 从 V3.1-Terminus 接着训**

报告把 V3.2 的起点写得很具体: 从 V3.1-Terminus 的 Base 检查点出发, 该检查点的上下文已扩到 128K; 先做两阶段继续预训练, 再做后训练. 两阶段的数据分布都与 V3.1-Terminus 的 128K 长上下文扩展数据「完全对齐」. 这意味着 DSA 的适应阶段没有引入新领域或新语料, 只是在原有长文本分布上让模型习惯稀疏注意力. 这样设计能把「注意力变了」和「数据变了」两个变量分开, 后面的对等性评测才有意义.

报告没有写这批长上下文数据的来源, 语种比例或总量. V3.1 发布页只说 Base 在 V3 上追加了 840B token 的外扩训练; Hugging Face 模型卡另说其中 128K 阶段是 209B token, 这不在本报告里. 若按模型卡数字, V3.2 稀疏阶段的 943.7B token 是那一阶段的约 4.5 倍, 但「分布对齐」不等于「同一批数据」, 报告没有说是否重复使用, 所以不能据此推断训了几个 epoch. 整个继续预训练合计约 946B token, 约为 V3 预训练 14.8T token 的 6.4%.

### 1.1. Lightning indexer: 先用便宜的分数挑 token

DSA 原型分两部分. 第一部分是 **lightning indexer**, 对每个查询 token $\mathbf h_t$ 和它之前的每个 token $\mathbf h_s$ 算一个索引分, 式 (1) 是 $I_{t,s}=\sum_{j=1}^{H^I} w^I_{t,j}\cdot\mathrm{ReLU}(\mathbf q^I_{t,j}\cdot\mathbf k^I_s)$. 查询侧有 $H^I$ 个索引头, 每头一个低维查询向量和一个标量权重; 键侧只有一个共享的 $\mathbf k^I_s$. 结构上它是一个多头查询, 单头键的小注意力, 但不做 softmax, 也不取 value, 只输出一个标量分数. 激活选 ReLU 是出于吞吐考虑, 索引器头数少, 可以用 FP8 实现. 第二部分是**细粒度 token 选择**: 对每个查询, 只取索引分最高的 top-k 个位置, 在这些位置的 KV 条目上做正常注意力, 即式 (2):

$$
\mathbf{u}_t=\mathrm{Attn}\big(\mathbf{h}_t,\{\mathbf{c}_s\mid I_{t,s}\in\mathrm{Top\text{-}k}(I_{t,:})\}\big).
$$

索引分 $I_{t,s}$ 只决定「取哪些 $\mathbf{c}_s$」, 不进入注意力权重; 选中之后, 主注意力照常在这 k 个潜变量上算 $QK^\top$ 和 softmax. 所以同一步里有两套分数: 索引器的 ReLU 加权和负责排序, MLA 的 softmax 负责加权, 两者的一致程度要靠下面两阶段的 KL 去拉. 训练和部署都取 k=2048. 在 128K 上下文末端, 每个查询只看约 1.6% 的位置.

报告没有给 $H^I$ 和 $d^I$; 开源推理代码的配置是 64 个索引头, 每头 128 维, 这是页外信息. 按这组配置, 索引器每对 (t, s) 约 64×128=8192 次乘加, 而 MLA 在 MQA 模式下 128 个头, 每头 576 维的 QK 加 512 维的 V, 约 13.9 万次乘加, 索引器约为它的 1/17, 再加上 FP8 吞吐约为 BF16 的两倍, 实际开销约为 1/34. 这就是报告说索引器仍是 $O(L^2)$ 但「比 MLA 便宜得多」的量级.

**挂在 MLA 的 MQA 模式上**

DSA 要从 V3.1-Terminus 接着训, 只能建在已有的 MLA 上, 见 [MLA: 低秩潜变量与矩阵吸收](../../../llm-guide/2-核心原理与架构/2.2-注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md). 报告给的理由是内核效率: 稀疏注意力要从显存里按索引取不连续的 KV, 每个被取出的条目最好被多个查询头共用, 否则带宽浪费. MLA 有两种算法等价的计算方式, 附录 A 与图 7 说明: MHA 模式先把潜变量解压成每头的 K 和 V, MQA 模式把解压矩阵吸收进查询, 让所有头共享同一个 576 维潜变量. V3.1-Terminus 训练和预填充用 MHA 模式, 解码用 MQA 模式.

![图 7: MLA 的 MHA 与 MQA 两种计算模式, MQA 把解压矩阵吸收进查询, 让所有头共享同一个潜变量](./images/p20-figure-7-illustration-of-the-mha-and-mqa-modes-of-mla.png)

*图 7: MLA 的 MHA 与 MQA 两种计算模式, MQA 把解压矩阵吸收进查询, 让所有头共享同一个潜变量* V3.2 把 DSA 建在 MQA 模式上, 每个被选中的潜变量对该 token 的全部 128 个查询头共享. 这和 NSA 论文强调的「KV 要在多个查询间共享才能跑满硬件」是同一条约束, NSA 的块级设计见 [原生稀疏注意力 NSA](../../../llm-guide/2-核心原理与架构/2.4-稀疏注意力/02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md). 两者的区别在选择粒度: NSA 按块压缩, 按块选择, 再加滑动窗口三路; DSA 按单个 token 选择, 只有一路. 代价是每个 token 的选择都要一个完整的索引分, 好处是选中的位置可以离当前位置很远, 也不受块边界限制. 稀疏注意力各路做法的对比见 [稀疏注意力综述](../../../llm-guide/2-核心原理与架构/2.4-稀疏注意力/2.4-稀疏注意力.md).

**稠密预热: 让索引器模仿主注意力**

新加的索引器一开始是随机的, 直接用它做 top-k 会让模型看错位置. 所以第一阶段保持稠密注意力, 冻结除索引器外的全部参数. 训练目标是让索引器的分布贴近主注意力: 对第 t 个查询, 把所有注意力头的分数加起来, 沿序列维做 L1 归一化, 得到目标分布 $p_{t,:}$, 再用式 (3) 的 KL 散度 $\mathrm{KL}(p_{t,:}\,\|\,\mathrm{Softmax}(I_{t,:}))$ 训练索引器. 这相当于一次蒸馏: 老师是 128 个头的完整注意力, 学生是一个低精度, 单一分数的小网络.

这一阶段的配置是: 学习率 $10^{-3}$, 1000 步, 每步 16 条 128K 序列, 合计 2.1B token. 按 1000×16×131072 复算是 2.097B, 与报告一致. 目标分布把所有头直接相加, 意味着索引器学的是「各头平均认为重要的位置」, 如果某个头专门看很远的少数 token, 它的信号会被其他头稀释. 报告没有给预热后索引器与主注意力的重合率, 也没有说 1000 步是否足够收敛, 这部分只能从后面「不掉点」的结果间接推断.

**稀疏训练: 943.7B token, 梯度分开**

第二阶段打开 top-k 选择, 解冻全部参数, 让模型适应「每个查询只看 2048 个位置」. 索引器仍对齐主注意力, 但 KL 只在选中集合 $\mathcal S_t$ 上算, 即式 (4):

$$
\mathcal{L}^I=\sum_t\mathbb{D}_{\mathrm{KL}}\big(p_{t,\mathcal{S}_t}\,\big\|\,\mathrm{Softmax}(I_{t,\mathcal{S}_t})\big),\qquad \mathcal{S}_t=\{s\mid I_{t,s}\in\mathrm{Top\text{-}k}(I_{t,:})\}.
$$

和式 (3) 比, 变的只是求和范围. 这是被迫的: 稀疏阶段主注意力只在 $\mathcal S_t$ 上算, 集合外的位置根本没有主注意力分数, 目标分布 $p$ 只存在于这 2048 个位置. 结果是这一项只能教索引器「在已选中的 2048 个里怎么排」, 不能告诉它「漏选了哪个集合外的重要位置」; 集合外的信息只剩稠密预热阶段学到的那部分(报告没讨论这个盲区). 关键设计是把索引器的输入从计算图上 **detach**: 索引器只接收自己的 KL 损失, 主模型只接收语言建模损失, 两边梯度不交叉. top-k 本身不可导, 主模型的梯度本来也传不到索引器; detach 进一步保证索引器的训练信号不会反过来改动主干的隐藏状态.

配置是: 学习率 $7.3\times10^{-6}$, 每个查询选 2048 个 KV token, 15000 步, 每步 480 条 128K 序列, 合计 943.7B token. 480×131072 约 6300 万 token 每步, 和 V3 报告里 128K 扩展阶段的 batch 一致. 学习率 7.3e-6 正好是 V3 预训练最终 167B token 所用的学习率, 也是 V3 两个上下文扩展阶段的学习率, 说明这一阶段沿用了已收敛模型的末段设置, 做的是温和适应, 不是重新学习. 报告没有给这两阶段的 GPU 小时, 也没有给稀疏训练中损失曲线相对稠密基线的差距. 这段训练的数据量达到 V3 预训练的约 6.4%, 如果只是适应稀疏模式, 用量偏大; 可能同时也在继续提升长上下文能力, 但报告没有拆开这两种作用.

### 1.2. 不掉点的证据

第 2.2 节给了三类证据. 标准基准: 2025 年 9 月评测 V3.2-Exp, 与 V3.1-Terminus 在短上下文和长上下文任务上表现相近, 没有明显退化. 人类偏好: 两者后训练策略相同, 2025 年 11 月 10 日的 ChatbotArena Elo 接近. 长上下文: 第三方的 AA-LCR 上, V3.2-Exp 在推理模式下比 V3.1-Terminus 高 4 分; Fiction.liveBench 上多项指标持续领先. 这三类证据都没有给具体数字表. 「表现相近」没有列基准名和分数, Arena Elo 没有给数值和置信区间, Fiction.liveBench 没有给分长度的曲线. 长上下文评测用的是 Exp 发布后第三方新出的测试集, 这一点排除了针对性调优, 但 AA-LCR 这类评测主要考检索与汇总, 对「远处少数关键 token」的依赖不一定很强. 如果要确认 top-2048 在极端检索任务上是否漏选, 需要针密度很低的大海捞针测试, 本报告没有.

**推理成本: 读图 3**

第 2.3 节说主模型核心注意力从 $O(L^2)$ 降到 $O(Lk)$, 并在图 3 画出按 token 位置的服务成本, 数据来自 H800 上的实际部署, 按每 GPU 小时 2 美元折算. 预填充图上, V3.1-Terminus 的成本从约 0.05 美元/百万 token 线性涨到 128K 处约 0.67 美元; V3.2 从约 0.06 美元起, 在约 7K 处拐到 0.10 美元, 之后缓慢涨到 128K 处约 0.19 美元, 两者在 8K 左右交叉(读图). 解码图上, V3.1-Terminus 从约 0.07 美元涨到约 2.15 美元, V3.2 在约 2K 处起到 0.15 美元, 128K 处约 0.25 美元(读图).

![图 3a: 预填充的服务成本随 token 位置变化, V3.2 在约 7K 处拐入近似线性段](./images/p06-a-prefilling.png)

*图 3a: 预填充的服务成本随 token 位置变化, V3.2 在约 7K 处拐入近似线性段*

![图 3b: 解码的服务成本, DSA 让长上下文解码近似持平](./images/p06-b-decoding.png)

*图 3b: 解码的服务成本, DSA 让长上下文解码近似持平* 按读图数字, 128K 位置上预填充约便宜 3.6 倍, 解码约便宜 8.6 倍. 解码省得更多, 因为解码是访存受限: 稠密 MLA 每步要读全部 128K 个潜变量, DSA 只读 2048 个潜变量加上所有位置很小的索引键. 预填充是计算受限, 索引器的 $O(L^2)$ 仍在, 所以 V3.2 的预填充曲线仍有明显斜率. 报告还说短序列预填充专门用 masked MHA 模式模拟 DSA, 图上 7K 以下那段较平的线应该就是这条路径. 这组成本不含 MoE 部分的变化, 也没有给吞吐和延迟, 所以只能说明注意力这一项的相对变化.

**后训练: 专家蒸馏与混合 RL**

**专家蒸馏: 六个领域先各自训一个专家**

后训练沿用 V3.2-Exp 的流水线, 全程使用稀疏注意力, 分两步: 专家蒸馏, 然后混合 RL. **专家蒸馏**先为每个领域训一个专用模型, 全部从同一个 V3.2 Base 微调. 除写作和通用问答外, 覆盖六个专门领域: 数学, 编程, 一般逻辑推理, 一般 Agent 任务, Agent 编程, Agent 搜索; 每个领域都同时支持思考和非思考模式. 每个专家都用大规模 RL 训练. 思考模式的长 CoT 数据和非思考模式的直答数据由不同模型生成.

专家训好后, 用来为最终检查点生成各领域的数据. 报告说, 用这些蒸馏数据训出的模型只比各领域专家略低, 后续 RL 能把差距基本消除. 这一步和 V3 的「R1 蒸馏」一脉相承, 只是教师从一个推理模型换成了六个领域专家, 蒸馏的一般做法见 [知识蒸馏](../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.3-知识蒸馏/6.3.3-知识蒸馏.md). 报告没有给蒸馏数据的条数, token 数, 领域比例, 也没有给「略低」具体低多少. 专家本身的 RL 预算有多大, 是否计入「超过预训练成本 10%」那笔预算, 报告同样没有说.

**混合 RL: 一个阶段, 三类奖励**

RL 算法仍是 GRPO, 见 [GRPO](../../../llm-guide/4-后训练/4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md). 和 V3.2-Exp 一样, 推理, Agent, 人类对齐三类训练**合并成一个 RL 阶段**, 报告说这样能平衡各领域表现, 并避开多阶段训练常见的灾难性遗忘. 奖励分两类: 推理和 Agent 任务用规则结果奖励, 长度惩罚, 语言一致性奖励; 通用任务用生成式奖励模型, 每条提示有自己的评分 rubric. 正式版 V3.2 在蒸馏数据上继续训练了「数千步」 RL. 报告的核心预算说法是: RL 训练预算已超过预训练成本的 10%, 近几个月观察到性能随 RL 预算延长持续提升. 如果以 V3 报告里预训练的 266.4 万 H800 GPU 小时为基数, 10% 约为 27 万 GPU 小时, 按报告自己的 2 美元单价约 53 万美元.

但报告没有说「预训练成本」指 V3 的原始预训练, 还是加上 V3.1 与 V3.2 的继续预训练; 也没有给 RL 的步数, batch, 组大小 G, 裁剪 ε 和 KL 系数 β. 长度惩罚的形式和系数也没有给, 只说正式版的分数受「长度约束奖励模型」限制, 去掉后分数会继续上升.

**GRPO 的两处改动: 去掉标准差, 修正 KL**

式 (5)–(6) 是 GRPO 目标, 这里写成逐 token 的形式:

$$
\mathcal{J}_{\mathrm{GRPO}}(\theta)=\mathbb{E}\left[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}\min\big(r_{i,t}(\theta)\hat A_{i,t},\ \mathrm{clip}(r_{i,t}(\theta),1-\varepsilon,1+\varepsilon)\hat A_{i,t}\big)-\beta\,\mathbb{D}_{\mathrm{KL}}\big(\pi_\theta(o_{i,t})\|\pi_{\mathrm{ref}}(o_{i,t})\big)\right],
$$

$r_{i,t}(\theta)=\pi_\theta(o_{i,t}\mid q,o_{i,<t})/\pi_{\mathrm{old}}(o_{i,t}\mid q,o_{i,<t})$. 比率和裁剪都在单个 token 上算, 同一条回答里的 token 共享一个优势. 和 V2, V3, R1 报告里整条序列的概率比写法不同, 这里明确了按 token 裁剪, 再先在序列内平均, 后在组内平均. 优势函数有一处容易漏看的变化: $\hat A_{i,t}=R_i-\mathrm{mean}(\boldsymbol R)$, **只减组均值, 不再除以组标准差**. 原始 GRPO 和 R1 报告都除以标准差. 除以标准差会让奖励差异很小的组(几乎全对或几乎全错)得到被放大的优势, 相当于给太容易或太难的题更大的权重; Dr.GRPO 指出了这个偏差并建议去掉, 见 [Dr.GRPO](../../../llm-guide/4-后训练/4.5-GRPO家族与RLVR/02-DrGRPO-去标准差/02-DrGRPO-去标准差.md). V3.2 去掉了标准差, 但保留了 $1/|o_i|$ 的逐序列长度平均, Dr.GRPO 认为这一项也会带来长度偏差, 报告没有讨论.

第二处改动是 KL 估计. 原 GRPO 用 K3 估计器 $k_3=r-\log r-1$, 其中 $r=\pi_{\mathrm{ref}}/\pi_\theta$. 对 $\theta$ 求导, 梯度系数是 $(1-\pi_{\mathrm{ref}}/\pi_\theta)$, 当采样到的 token 在当前策略下概率远低于参考策略时, 这个系数没有上界, 会强行把这些 token 的概率往上拉(推导). 报告的式 (7) 乘上重要性比 $\pi_\theta/\pi_{\mathrm{old}}$, 因为样本实际来自旧策略. 乘上后再求导, 梯度系数变成 $(\pi_\theta/\pi_{\mathrm{old}})\log(\pi_\theta/\pi_{\mathrm{ref}})$, 只随概率比的对数增长, 并且是 $\mathrm{KL}(\pi_\theta\|\pi_{\mathrm{ref}})$ 的无偏梯度(推导). 报告还说, 不同领域适合不同强度的 KL, 数学等领域用很弱的 KL 甚至不加反而更好, 但没有给各领域的具体系数.

### 1.3. 三项防 off-policy 的改动

为了提高系统效率, RL 通常一次生成一大批 rollout, 再切成多个 mini-batch 做多步更新, 后面的 mini-batch 就变成 off-policy. 推理框架和训练框架的实现细节也不同, 同一个 token 两边算出的概率会有差别. 报告的 **Off-Policy Sequence Masking** 用推理框架返回的采样概率作 $\pi_{\mathrm{old}}$, 在上式的裁剪项后乘一个掩码 $M_{i,t}$(式 8–9):

$$
M_{i,t}=\begin{cases}0, & \hat A_{i,t}<0\ \text{且}\ \dfrac{1}{|o_i|}\displaystyle\sum_{t=1}^{|o_i|}\log\dfrac{\pi_{\mathrm{old}}(o_{i,t}\mid q,o_{i,<t})}{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}>\delta\\[2pt] 1, & \text{otherwise}.\end{cases}
$$

条件里的平均对数比是在采样到的 token 上对 $\mathrm{KL}(\pi_{\mathrm{old}}\|\pi_\theta)$ 的单样本估计, 衡量这条回答对当前策略来说有多「陌生」. 两个条件同时满足才掩掉: 优势为负, 且整条序列偏离超过 $\delta$. 掩码按序列算, 一旦为 0, 这条回答所有 token 的策略梯度项都没了, KL 惩罚项不受掩码影响, 仍然保留. 正优势的序列无论偏离多大都保留. 直觉是: 模型从自己的错误里学得最多, 但偏离太大的负样本已经不是「自己的错误」, 会把优化带偏. 阈值 $\delta$ 取多少, 掩掉了多大比例的序列, 报告没有给.

Keep Routing 针对 MoE. 训练和推理框架的差异叠加策略更新后, 同一输入可能在两边路由到不同专家, 活跃参数子空间随之跳变. 采样时记录推理框架选择的专家路径, 训练时强制复用同一路径, 可以避免路由差异继续放大 off-policy 误差. 这项机制自 V3-0324 起就进入训练流程; MoE 路由本身见 [DeepSeek-MoE](../../../llm-guide/2-核心原理与架构/2.6-MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). Keep Sampling Mask 针对 top-p / top-k 采样: 截断让旧策略的动作空间比当前策略小, 违反了重要性采样的前提. 做法是把采样时的截断掩码也施加到训练时的 $\pi_\theta$ 上. 报告说 top-p 加这条掩码能在 RL 中保持语言一致性. 三项改动都没有给消融数字, 只有定性描述.

**Agent 任务**

**工具调用中的推理保留与冷启动**

R1 的做法是第二轮消息一到就丢掉上一轮的推理内容. 放到工具调用里, 每次工具返回后模型都要重新推理整道题, token 浪费很大. V3.2 的规则见图 4: **只有新的用户消息进来时才丢弃历史推理**; 如果只是追加工具输出, 推理内容一直保留; 推理被丢弃时, 工具调用和结果的历史仍然保留. 报告特别指出, Roo Code, Terminus 这类用用户消息模拟工具交互的框架会触发丢弃规则, 用不上推理保留, 建议这类框架用非思考模式.

![图 4: 工具调用中的推理保留规则, 只有新的用户消息才触发丢弃](./images/p09-figure-4-thinking-retention-mechanism-in-tool-calling.png)

*图 4: 工具调用中的推理保留规则, 只有新的用户消息才触发丢弃* 冷启动要解决的是: 已有的推理数据不带工具, 已有的 Agent 数据不带推理, 怎么得到「推理中调用工具」的轨迹. 报告的办法是写专门的 system prompt. 附录表 6–8 以竞赛编程为例: 表 6 要求在 `<think></think>` 里推理后再给答案; 表 7 是带工具说明的 Agent 提示; 表 8 允许在推理过程中多次调用 Python, 最多 20 次执行, 最终展示的解法里不再调工具, 并要求「能用代码就别用语言推理」. 报告承认这样得到的轨迹不稳定, 只是偶尔能生成目标轨迹, 作用是给后续 RL 提供起点. 冷启动数据有多少条, 成功率多少, 报告没有给.

**合成 Agent 任务: 真实环境与合成环境**

表 1 列了四类 RL 任务: code agent 24,667 个, 真实环境, 提示从网上抽取; search agent 50,275 个, 真实环境, 提示合成; general agent 4,417 个, 环境和提示都合成; code interpreter 5,908 个, 真实环境, 提示抽取. 四类相加 85,267, 与引言说的「85,000 条复杂提示」一致. 搜索任务用多 Agent 流水线生成: 从网页语料采长尾实体, 出题 Agent 按可调的深度和广度搜索并归纳成问答对, 多个配置不同的答题 Agent 各自作答, 带搜索的核查 Agent 多轮验证, 只保留「标准答案正确且所有候选都可证伪」的样本. 另外混入已有 helpful RL 数据里搜索确有帮助的样本, 用 rubric 和生成式奖励模型打分.

代码 Agent 从 GitHub 挖掘数百万个 issue–PR 对, 用规则和 LLM 判断过滤, 要求有合理的问题描述, 对应的修复补丁和测试补丁. 由 V3.2 驱动的环境搭建 Agent 负责装包, 解依赖, 跑测试, 结果统一输出为 JUnit 格式. 成功标准是: 应用标准补丁后, 失败变通过的测试数大于零, 通过变失败的测试数为零. 最终建成数万个可复现环境, 覆盖 Python, Java, JavaScript, TypeScript, C, C++, Go, PHP. 注意表 1 说 code agent 任务是 24,667 个, 正文说「数万个环境」, 两者量级一致. 代码解释器任务用 Jupyter Notebook, 覆盖数学, 逻辑, 数据科学.

**通用 Agent 环境与消融**

通用 Agent 环境由一个环境合成 Agent 自动生成, 原则是「**难解易验**」. 流程: 给定任务类别和带 bash, 搜索工具的沙箱, Agent 先从网上拉数据存进沙箱数据库; 再合成一组任务专用的工具函数; 然后提出一个简单任务, 同时写出 Python 的解函数和验证函数, 解函数只能调用工具函数或做逻辑计算, 不能直接读库, 结果必须通过验证; 之后逐步加难, 工具不够就补. 得到数千个 (环境, 工具, 任务, 验证器) 元组后, 用 V3.2 做 RL, 只保留 pass@100 非零的实例, 最终剩 1,827 个环境, 4,417 个任务. 杭州出发三日游的例子说明了这种任务的特点: 满足全部约束的组合很难搜, 检查一个方案是否满足约束很容易.

第 4.3 节做了两组消融. 第一组看难度: 从合成任务里随机抽 50 个, V3.2-Exp 的 pass@1 只有 12%, 约 6 题; Sonnet-4.5 为 34%, Gemini-3.0 Pro 为 51%, GPT-5-Thinking 为 62%. 第二组看泛化: 从 V3.2 的 SFT 检查点出发, 只在合成通用 Agent 任务上, 用非思考模式做 RL, 排除长 CoT 和其他 RL 数据的影响. 图 5 显示, 约 1900 步后 τ²-bench 总分从 SFT 的约 0.55 升到约 0.83, 其中 Telecom 从约 0.39 升到约 0.98; MCP-Mark Filesystem 从约 0.14 升到约 0.35(读图). 只在代码和搜索环境做 RL 的 V3.2-Exp, 在 τ²-bench 总分上约 0.46, 反而低于 SFT(读图). 这组对比说明, 合成环境带来的提升不来自代码和搜索, 但也要注意第二组只测了三个工具基准, 没有测它对推理基准是否有副作用.

![图 5: 只在合成通用 Agent 任务上做 RL, tau-bench 总分随步数从约 0.55 升到约 0.83](./images/p16-figure-5-rl-training-of-deepseek-v3-2-sft-using.png)

*图 5: 只在合成通用 Agent 任务上做 RL, tau-bench 总分随步数从约 0.55 升到约 0.83*

## 2. 模型版本、架构与强化学习

**主结果与评测协议**

表 2 的评测设定是: 工具类基准用标准 function call 格式, 模型设为思考模式; 温度 1.0, 上下文 128K; 数学题和 HLE 用「逐步推理, 答案放进 \boxed{}」的模板; HLE 另用官方模板测得 23.9, 低于表中的 25.1. V3.2-Thinking 的主要分数: MMLU-Pro 85.0, GPQA Diamond 82.4, HLE 文本子集 25.1, LiveCodeBench 83.3, Codeforces 2386, AIME 2025 93.1, HMMT Feb 2025 92.5, HMMT Nov 2025 90.2, IMOAnswerBench 78.3. Agent 部分: Terminal Bench 2.0 46.4, SWE Verified 73.1, SWE Multilingual 70.2, BrowseComp 51.4 / 67.6(星号为上下文管理), BrowseCompZh 65.0, 带工具 HLE 40.8, τ²-Bench 80.3, MCP-Universe 45.9, MCP-Mark 38.0, Tool-Decathlon 35.2. 几项分数的协议需要单独交代. Terminal Bench 46.4 用的是 Claude Code 框架, 因为思考模式的推理保留规则与 Terminus 不兼容; 用 Terminus 框架加非思考模式是 39.3, 附录表 9 里 Claude Code 加非思考模式是 37.1. SWE Verified 主分来自内部框架, 换 Claude Code, RooCode 或非思考模式在 72–74 之间. BrowseComp 约 20% 以上的用例超出 128K. τ²-bench 用模型自己扮演用户, 三类分数 63.8, 81.1, 96.2 的平均是 80.37, 与表中 80.3 一致. MCP 基准把工具输出放在 `tool` 角色里, 报告承认模型经常冗余自检, 轨迹过长超出 128K, 拖低了 MCP-Mark 的 GitHub 和 Playwright 子项. 报告还说这些基准的环境和工具在 RL 中没见过, 以此作为域外泛化的证据.

**与前代和对手的对照**

和 V3.1-Terminus 发布页对照, MMLU-Pro 同为 85.0, GPQA-Diamond 从 80.7 到 82.4, 不带工具的 HLE 从 21.7 到 25.1, Codeforces 从 2046 到 2386, SWE Verified 从 68.4 到 73.1, SWE Multilingual 从 57.8 到 70.2, BrowseComp 无上下文管理从 38.5 到 51.4, BrowseCompZh 从 45.0 到 65.0. LiveCodeBench 从 74.9 到 83.3, 但 V3.2 用的是 2024.08–2025.04 的题目区间, Terminus 页没有写区间, 这一项可能不同版本. Terminal Bench 2.0 与 Terminus 页的 Terminal-bench 也不是同一版本, 不能直接比. 和 V3.1 发布页的效率图对照, V3.1-Think 在 AIME 2025 上用约 1.59 万 token 得 88.4%, V3.2-Thinking 用约 1.6 万 token 得 93.1%, 长度相近, 多对约 1.4 题.

和闭源对手比, 表 3 同时给了准确率和平均输出 token. AIME 2025 上 GPT-5 High 94.6(13k), Gemini-3.0 Pro 95.0(15k), Kimi-K2 Thinking 94.5(24k), V3.2-Thinking 93.1(16k); GPQA 上 V3.2 82.4(7k), 是表中最短的, 但也比 GPT-5 低 3.3 分; Codeforces 上 V3.2 2386 用了 42k token, GPT-5 High 2537 只用 29k. 总体上 V3.2 的推理分数接近 GPT-5 High, 低于 Gemini-3.0 Pro, 同等分数下比 Kimi-K2 Thinking 用的 token 少. 报告里所有闭源模型的分数是否由 DeepSeek 自己在同一协议下跑出, 表注没有说明; MCP 两项明确说是在内部环境里统一跑的, 其他项没有说.

### 2.1. Speciale 与竞赛协议

V3.2-Speciale 是实验变体: 只用推理数据训练, RL 中减轻长度惩罚, 另外加入 DeepSeekMath-V2 的数据和奖励方法以增强数学证明. 表 3 里 Speciale 的分数与长度: AIME 96.0(23k), HMMT Feb 99.2(27k), HMMT Nov 94.4(25k), IMOAnswerBench 84.5(45k), LiveCodeBench 88.7(27k), Codeforces 2701(77k), GPQA 85.7(16k), HLE 30.6(35k). 相对正式版, Codeforces 涨 315 分, token 从 42k 涨到 77k; GPQA 涨 3.3 分, token 从 7k 翻到 16k. 报告自己承认 Speciale 的 token 效率明显不如 Gemini-3.0 Pro, 正式版加严长度约束就是为了控制部署成本和延迟. 表 4 的竞赛成绩: IMO 2025 为 35/42, 前五题满分, 第六题 0 分; CMO 2025 为 102/126; IOI 2025 为 492/600, 排第 10; ICPC WF 2025 解出 10/12 题, 排第 2, 均达金牌线.

附录 D 的协议: 最大生成长度 128K, 不用工具不联网, 遵守比赛的时间和提交次数限制. IOI 每题先采 500 个候选, 过滤掉没过样例或超长的, 再用 V3.2-Exp 剔除自称做不出的, 最终选推理最长的 50 个提交, IOI 规则允许每题 50 次提交并取子任务最高分. ICPC 每题采 32 个候选. IMO 和 CMO 用生成, 验证, 修改的循环, 直到自评满分或到达修改上限. 「选推理最长的」是一条启发式规则, 报告没有和随机选 50 个做对比, 所以这部分成绩里有多少来自采样与筛选, 无法分离.

**搜索上下文管理: 串行扩展 TestingTime**

第 4.4 节处理的是搜索任务常见的上下文溢出. 当 token 用量超过窗口的 80%(约 10.5 万 token)时触发三种策略之一: Summary 把溢出的轨迹总结后重新开始; Discard-75% 丢掉前 75% 的工具调用历史; Discard-all 丢掉全部历史工具调用. 对照组是 Parallel-fewest-step: 独立采 N 条轨迹, 选步数最少的一条. 这样 TestingTime 的算力可以串行扩展(同一条轨迹走更多步), 也可以并行扩展(多条轨迹选一条).

图 6 以「实际步数」为横轴. Summary 平均步数到 364, 分数 60.2, 效率最低; Discard-75% 在约 160 步内到约 57.6 就停了(读图); Discard-all 约 410 步到 67.6; 并行基线约 610 步到约 67.2, 约 875 步到约 68.5(读图). 所以 Discard-all 用约三分之二的步数达到与并行相当的分数. 把所有历史工具调用都丢掉反而最好, 说明搜索轨迹里旧的工具结果大多是噪声, 模型当前的推理状态比历史证据更重要.

![图 6: BrowseComp 上四种上下文管理策略的准确率随实际步数变化, Discard-all 用约三分之二的步数追平并行](./images/p17-figure-6-accuracy-of-browsecomp-with-different-test.png)

*图 6: BrowseComp 上四种上下文管理策略的准确率随实际步数变化, Discard-all 用约三分之二的步数追平并行* 报告的结论是, 比较模型时必须计入实际算力, 否则 67.6 和 51.4 这类分数不可比.

**局限与谱系**

报告第 5 节列了三项局限. 总训练 FLOPs 比前沿闭源模型少, 世界知识的广度仍落后, 计划靠扩大预训练算力补; token 效率差, 同等质量通常要更长的轨迹; 复杂任务求解仍不如前沿模型. 除此之外, 从正文还能看出几处没讲清的地方: DSA 对极端检索任务的影响没有测; 四项 RL 稳定化改动都没有消融; RL 预算的基数不明; 竞赛成绩依赖大规模采样与筛选; 闭源对手分数的评测协议没有统一说明.

从谱系上看, V3.2 是 V3 发布之后第一次改网络结构: V3.1 和 V3.1-Terminus 都只改训练与数值格式, 这次把 MLA 的稠密注意力换成 DSA, 报告说这是唯一的结构改动, MoE 等其余部分沿用. 后训练的变化更大: R1 的规则奖励 RL 扩展成专家蒸馏加单阶段混合 RL, 预算提到预训练的 10% 以上, 环境从数学和代码扩展到 1,827 个合成 Agent 环境, 相关方法背景见 [Agentic RL 训练](../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练/13.4.1-AgenticRL训练.md). V4 在这条线上继续改注意力与后训练, 基线比较时应以 V3.2 为准.

**索引器训练、版本关系与证据边界**

V3.2 的结构变化集中在 DSA，但最终能力还叠加了更大后训练预算和 Agent 数据。下面先按原报告核对架构、训练与评测，再把索引器的召回、复杂度和失效模式展开。 推出 DeepSeek-V3.2: 要在算力效率, 推理能力与 Agent 表现之间对齐. 三条技术突破:**(1) DeepSeek Sparse Attention(DSA)**-- 稀疏注意力, 长上下文下大幅降复杂度, 尽量保住效果; **(2) 可扩展强化学习框架**-- 稳健 RL 协议 + 放大后训练算力, 主模型与 GPT-5 相当; 高算力变体 DeepSeek-V3.2-Speciale 超过 GPT-5, 推理逼近 Gemini-3.0-Pro, 并在 2025 年 IMO 与 IOI 达到金牌水准; **(3) 大规模 Agent 任务合成流水**-- 把推理嵌进工具调用, 系统生成海量训练数据, 抬高复杂交互场景里的泛化与跟指令稳定性. 图注: DeepSeek-V3.2、V3.2-Speciale 与同期模型的能力对比：上半部分汇总数学与知识推理基准，下半部分汇总工具调用和 Agent 基准，展示主模型与高算力变体的定位差异。

图 1｜DeepSeek-V3.2 与对照模型的基准表现. HMMT 2025 取二月场, 与基线一致; HLE 报纯文本子集. 推理模型(DeepSeek-AI, 2025; OpenAI, 2024a)显著提高了可验证领域的整体能力. 此后开源与闭源模型都在进步, 但近几个月的速度出现分化: 闭源模型提升更快, 在复杂任务上进一步扩大了对开源模型的领先幅度. 我们归纳开源在复杂任务上的三处短板. 架构上: 多数仍靠 vanilla attention(Vaswani et al., 2017), 长序列效率差, 既拖部署扩展, 也拖后训练. 资源上: 后训练算力投入不够, 难题吃不透. Agent 上: 泛化与跟指令明显落后闭源(EvalSys, 2025; Li et al., 2025; Luo et al., 2025), 真实部署吃亏.

对策分三层. 先上 DSA, 把复杂度压下来, 长上下文尽量不掉点. 再做可扩展, 可稳住的 RL 协议, 后训练算力可显著放大-- 本框架后训练预算超过预训练成本的 10%, 用来解锁更强能力. 第三, 工具场景里做可泛化推理: 冷启动沿用 DeepSeek-V3(DeepSeek-AI, 2024)思路, 把推理与工具调用收进同一轨迹; 再大规模合成 Agent 任务, 生成超过 1, 800 个不同环境与 85, 000 条复杂提示, 用这些数据喂 RL, 抬 Agent 侧泛化与跟指令. 多条推理基准上, DeepSeek-V3.2 与 Kimi-k2-thinking, GPT-5 接近. Agent 能力相对开源明显抬升, 在 EvalSys (2025), Li et al. (2025), Luo et al. (2025) 的长尾 Agent 任务上表现突出; 成本更低, 却显著收窄与前沿闭源的差距. 为冲开源推理上限, 我们放松长度约束得到 DeepSeek-V3.2-Speciale, 与 Gemini-3.0-Pro(DeepMind, 2025b)持平, 并在 IOI 2025, ICPC World Final 2025, IMO 2025, CMO 2025 达到金牌水准.

### 2.2. DeepSeek-V3.2 Architecture DeepSeek-V3.2 架构

架构与 DeepSeek-V3.2-Exp 完全一致. 相对 DeepSeek-V3.1 末版 Terminus, 唯一架构改动是经继续训练引入 DSA. **DSA 原型.** 两块: lightning indexer(闪电索引器), 以及细粒度 token 选择. **Lightning indexer** 算查询 token $\mathbf{h}_t \in \mathbb{R}^{d}$ 与前序 token $\mathbf{h}_s \in \mathbb{R}^{d}$ 之间的索引分 $I_{t, s}$, 决定该查询选哪些 token:

$$
I _ {t, s} = \sum_ {j = 1} ^ {H ^ {I}} w _ {t, j} ^ {I} \cdot \operatorname{ReLU} \left(\mathbf {q} _ {t, j} ^ {I} \cdot \mathbf {k} _ {s} ^ {I}\right), \tag{1}
$$

$H^{I}$ 是索引头数; $\mathbf{q}_{t, j}^{I}$, $w_{t, j}^{I}$ 由查询 token 得到, $\mathbf{k}_{s}^{I}$ 由前序 token 得到. 激活用 ReLU, 主要为吞吐; 头数少且可走 FP8, 算起来很轻. 对每个查询, **细粒度选择**只取 top-k 索引分对应的 KV 条目 $\{\mathbf{c}_s\}$, 再在查询与这些稀疏 KV 上做注意力, 得到 $\mathbf{u}_t$:

$$
\mathbf {u} _ {t} = \operatorname{Attn} \big (\mathbf {h} _ {t}, \left\{\mathbf {c} _ {s} \mid I _ {t, s} \in \operatorname{Top-k} (I _ {t,: }) \right\} \big). \tag{2}
$$

**在 MLA 下实例化 DSA.** 要从 V3.1-Terminus 继续训, DSA 挂在 MLA(DeepSeek-AI, 2024)上. 内核层要求同一 KV 条目被多个查询共享才划算(Yuan et al., 2025), 因此走 MLA 的 MQA 模式¹: 每个潜变量(MLA 的 KV 条目)在该查询 token 的所有 query 头之间共享. 架构见图 2; 开源实现²把细节写在代码里.

**Continued Pre-Training 继续预训练**

从已扩到 128K 的 V3.1-Terminus base 检查点出发, 先继续预训练, 再后训练, 得到 V3.2. 继续预训练分两阶段; 两阶段数据分布都与 V3.1-Terminus 的 128K 长上下文扩展数据完全对齐.

<small><span class=「docvortex-page-footnote」 data-block-type=「page_footnote」 style=「color: #6b7280」><sup>1</sup>MLA 的 MQA / MHA 差异见附录 A. </span></small>

图 2｜DeepSeek-V3.2 注意力架构: DSA 挂在 MLA 下. 绿色部分示意按 indexer 选 top-k KV. **稠密预热.** 短阶段只初始化 lightning indexer: 保持稠密注意力, 除 indexer 外全部冻结. 为对齐主注意力分布: 对第 $t$ 个查询, 先把各注意力头的分数求和, 再沿序列维做 L1 归一化, 得到目标分布 $p_{t,: }\in\mathbb{R}^{t}$; indexer 用 KL 散度对齐:

$$
\mathcal {L} ^ {I} = \sum_ {t} \mathbb {D} _ {\mathrm{KL}} \big (p _ {t,: } \big \| \operatorname{Softmax} \big (I _ {t,: } \big) \big). \tag{3}
$$

预热学习率 $10^{-3}$; 只训 1000 step, 每 step 16 条 × 128K token, 合计 2.1B token. **稀疏训练.** 预热后打开细粒度选择, 放开全体参数去适应 DSA 稀疏模式. Indexer 仍对齐主注意力, 但只在已选集合 $\mathcal{S}_t=\{s\mid I_{t, s}\in\operatorname{Top-k}(I_{t,: })\}$ 上算:

$$
\mathcal {L} ^ {I} = \sum_ {t} \mathbb {D} _ {\mathrm{KL}} \big (p _ {t, \mathcal {S} _ {t}} \big \| \operatorname{Softmax} \big (I _ {t, \mathcal {S} _ {t}} \big) \big). \tag{4}
$$

注意: indexer 输入从计算图 detach, 分开优化--indexer 只吃 $\mathcal{L}^{I}$, 主模型只吃语言建模损失. 稀疏阶段学习率 $7.3\times10^{-6}$, 每个查询选 2048 个 KV token; 主模型与 indexer 共训 15000 step, 每 step 480 条 × 128K, 合计 943.7B token.

**Parity Evaluation 对等性评测**

**标准基准.** 2025 年 9 月在多能力基准上评 DeepSeek-V3.2-Exp, 对照 V3.1-Terminus, 表现接近. 长序列算力效率明显改善, 短/长上下文任务未见实质掉点. **人类偏好.** 直接偏好评估易偏, 故用 ChatbotArena 间接估用户偏好. 两边后训练策略相同; 2025-11-10 的 Elo 接近, 说明即使上了稀疏注意力, 新 base 仍与上一代持平. **长上下文.** 发布后多方用未见过测试集做长上下文评测. 代表如 AA-LCR³: 推理模式下 V3.2-Exp 比 Terminus 高 4 分; Fiction. liveBench⁴ 上多项持续领先. 说明 base 检查点在长上下文上没有回退.

**Inference Costs 推理成本**

DSA 把主模型核心注意力从 $O(L^{2})$ 降到 $O(Lk)$, $k\ll L$ 为选中 token 数. Lightning indexer 仍是 $O(L^{2})$, 但相对 V3.1-Terminus 的 MLA 轻很多; 再加实现优化, 长上下文端到端明显加速. 图 3 给出按序列位置变化的 token 成本, 来自 H800 实服务基准, 租价 2 USD / GPU. 小时. 短序列 prefilling 另实现 masked MHA 模拟 DSA, 短上下文更划算.

**Post-Training 后训练**

继续预训练后做后训练得到最终 V3.2; 后训练同样用稀疏注意力, 流水与 V3.2-Exp 一致: 专家蒸馏 + 混合 RL. **专家蒸馏.** 每类任务先训专域专家, 所有专家都从同一个 图 3｜V3.1-Terminus 与 V3.2 在 H800 集群上的推理成本. (a)Prefilling; (b)Decoding. 预训练 V3.2 base 检查点出发. 除写作与通用问答外, 还有六域: 数学, 编程, 一般逻辑推理, 一般 Agent, Agent 编程, Agent 搜索; 各域都支持 thinking / non-thinking. 每个专家吃大规模 RL 算力; 长 CoT(thinking)与直答(non-thinking)用不同模型产数据. 专家就绪后产域数据喂最终检查点. 实验: 蒸馏数据训出的模型只略低于专域专家, 后续 RL 可把差距基本抹平. **混合 RL.** 仍用 GRPO(DeepSeek-AI, 2025; Shao et al., 2024). 与 Exp 一样, 把推理, Agent, 人类对齐并进同一 RL 阶段, 多域平衡的同时避开多阶段常见的灾难性遗忘. 推理与 Agent: 规则结果奖励 + 长度惩罚 + 语言一致性奖励; 通用任务: 生成式奖励模型, 每条 prompt 自带评分 rubric.

**V3.2 与 Speciale.** 主模型揉进专家蒸馏的推理 / Agent / 对齐数据, 再经数千 step 继续 RL. 为探「更长思考」上限, 另做实验变体 Speciale: RL 只吃推理数据, 减轻长度惩罚, 并接入 DeepSeekMath-V2(Shao et al., 2025)的数据与奖励, 加强数学证明. 下文重点: §3.1 如何把 RL 算力稳定放大; §3.2 如何把 thinking 嵌进 Agent 任务.

### 2.3. Scaling GRPO 放大 GRPO

先回顾 GRPO 目标. 对问题 $q$, 从旧策略 $\pi_{\mathrm{old}}$ 采样一组回复 $\{o_1, \cdots, o_G\}$, 最大化:

$$
\begin{array}{r l} \mathcal {J} _ {\mathrm{GRPO}} (\theta) = & \mathbb {E} _ {q \sim P (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\mathrm{old}} (\cdot | q)} \left[ \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{| o _ {i} |} \sum_ {t = 1} ^ {| o _ {i} |} \right. \\ & \left. \min \left(r _ {i, t} (\theta) \hat {A} _ {i, t}, \mathrm{clip} \left(r _ {i, t} (\theta), 1 - \varepsilon , 1 + \varepsilon\right) \hat {A} _ {i, t}\right) - \beta \mathbb {D} _ {\mathrm{KL}} \big (\pi_ {\theta} (o _ {i, t}) \left\| \pi_ {\mathrm{ref}} (o _ {i, t})\right) \right], \end{array}\tag{5}
$$

其中

$$
r _ {i, t} (\theta) = \frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\mathrm{old}} (o _ {i , t} | q , o _ {i , <   t})}\tag{6}
$$

$r_{i, t}$ 是当前与旧策略的重要性采样比; $\varepsilon$, $\beta$ 分别控裁剪与 KL 强度. $\hat{A}_{i, t}$ 由组内结果奖励归一化得到: 对组内各输出打分得 $\{R_1, \cdots, R_G\}$, 优势为 $\hat{A}_{i, t}=R_i-\mathrm{mean}(R)$. 下面几条都是在 GRPO 上直接叠的稳定化手段, 用来把 RL 规模做大. **无偏 KL 估计.** 样本来自 $\pi_{\mathrm{old}}$, 对 K3 估计器(Schulman, 2020)用 $\pi_\theta/\pi_{\mathrm{old}}$ 重要性比修正, 得到无偏 KL:

$$
\mathbb {D} _ {\mathrm{KL}} \big (\pi_ {\theta} (o _ {i, t}) \left\| \pi_ {\mathrm{ref}} (o _ {i, t})\right) = \frac {\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\mathrm{old}} (o _ {i , t} | q , o _ {i , <   t})} \left(\frac {\pi_ {\mathrm{ref}} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})} - \log \frac {\pi_ {\mathrm{ref}} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})} - 1\right). \tag{7}
$$

修正后 KL 梯度无偏, 系统性误差少, 收敛更稳. 原 K3 在 $\pi_\theta\ll\pi_{\mathrm{ref}}$ 时会给这些 token 过大, 无界的似然最大化权重, 噪声梯度累积伤样本质量, 训练晃. 实践中各域适合的 KL 强度不同: 数学等域弱 KL 甚至不加, 反而更好. **Off-policy 序列掩码.** 为提效, 常大批量 rollout 再切成多个 mini-batch 多步更新, 天然 off-policy; 推理框架与训练框架实现细节也可能不一致, 训练–推理不一致 会加重 off-policy. 稳定做法: 用 $\pi_{\mathrm{old}}$ 与 $\pi_\theta$ 的 KL 衡量策略偏离, 对偏离大的负优势序列打掩码. 在 GRPO 损失里加二值掩码 $M$:

$$
\begin{array}{r l} \mathcal {J} _ {\mathrm{GRPO}} (\theta) = & \mathbb {E} _ {q \sim P (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\mathrm{old}} (\cdot | q)} \left[ \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{| o _ {i} |} \sum_ {t = 1} ^ {| o _ {i} |} \right. \\ & \left. \min \left(r _ {i, t} (\theta) \hat {A} _ {i, t}, \mathrm{clip} \left(r _ {i, t} (\theta), 1 - \varepsilon , 1 + \varepsilon\right) \hat {A} _ {i, t}\right) M _ {i, t} - \beta \mathbb {D} _ {\mathrm{KL}} \big (\pi_ {\theta} (o _ {i, t}) \left\| \pi_ {\mathrm{ref}} (o _ {i, t})\right) \right], \end{array}\tag{8}
$$

其中

$$
M _ {i, t} = \left\{ \begin{array}{l l} 0 & \hat {A} _ {i, t} <   0, \frac {1}{| o _ {i} |} \sum_ {t = 1} ^ {| o _ {i} |} \log \frac {\pi_ {\text {old}} (o _ {i , t} | q , o _ {i , <   t})}{\pi_ {\theta} (o _ {i , t} | q , o _ {i , <   t})} > \delta \\ 1 & \text {otherwise, } \end{array} \right. \tag{9}
$$

$\delta$ 是策略偏离阈值. 此处 $\pi_{\mathrm{old}}$ 取推理框架直接返回的采样概率, 因而同时覆盖上面两类 off-policy 来源. 只掩负优势序列. 直觉上: 从「自己的错」学最有用; 高度 off-policy 的负样本反而误导, 晃训练. 经验上, 这条掩码在若干本会不稳的场景里改善了稳定性. **Keep Routing(保持路由).** MoE 推理只激活部分专家; 推理/训练框架差异再叠加策略更新, 同一输入也可能路由不一致, 活跃参数子空间突然跳变, 优化不稳, off-policy 加重. 做法是采样时记录推理框架的专家路由, 训练时强制复用同一路径, 保证两端优化同一批专家参数. 该机制自 DeepSeek-V3-0324 起进入流水线, 用于稳定 MoE 的 RL 训练.

**Keep Sampling Mask(保持采样掩码).** Top-p / top-k 常用来抬回复质量; RL 里也能避免把极低概率 token 当优化目标. 截断保住质量, 却让 $\pi_{\mathrm{old}}$ 与 $\pi_\theta$ 动作空间不一致, 破坏重要性采样假设, 晃训练. 做法: 采样时保留截断掩码, 训练时套到 $\pi_\theta$, 两边动作子空间一致. 经验上: top-p + Keep Sampling Mask 能保住 RL 中的语言一致性.

**Thinking in Tool-Use 工具调用里的 Thinking**

**Thinking Context Management Thinking 上下文管理**

DeepSeek-R1 已表明: 加入 thinking 过程能显著抬复杂题求解能力. 沿此思路, 要把 thinking 嵌进工具调用场景. 若照搬 R1「第二轮消息一到就丢掉推理内容」, token 浪费很大: 每次后续工具调用都得整题重想. 为此做了专为工具调用定制的上下文管理(图 4): • 只有新的**用户消息**进会话时才丢历史推理; 若只追加工具相关消息(如工具输出), 推理内容全程**保留**. • 推理轨迹被清掉时, **工具调用及其结果**的历史仍留在上下文里. 注意: Roo Code, Terminus 等框架用用户消息模拟工具交互, 按上述规则吃不到「推理持久化」的红利; 这类架构建议用 non-thinking 模型以求最佳表现. 图 4｜工具调用场景下的 thinking 保留机制.

**Cold-Start 冷启动**

手头已有非 Agent 推理数据与非推理 Agent 数据, 最直接的整合是精设计 prompt. 我们假设模型已能准确跟显式指令, 因而可把工具执行嵌进推理过程. 冷启动示意见附录表 6–8. 不同任务 prompt 配不同 system prompt. 表 6–8 以竞赛编程题为例: 表 6 是推理数据, system 要求先推理再给最终答案, 并用 &lt; think&gt; &lt; /think&gt; 标推理路径; 表 7 是非推理 Agent 数据, system 含 toolcall 指引; 表 8 是让模型在推理过程中多次调工具的 system prompt. 这样得到的「推理中调工具」模式未必稳健, 但偶尔能产出目标轨迹, 给后续 RL 提供起点.

## 3. Agent 评测、上下文管理与手算

RL 任务要多样才稳. 搜索, 代码工程, 代码解释用真实工具(真实网页搜索 API, 编程工具, Jupyter). 环境真实, 但 prompt 来自互联网抽取或合成, 不是真实用户交互. 其余任务环境与 prompt 都合成. 所用 Agent 任务见表 1. 表 1｜各类 Agent 任务说明: 任务数, 环境类型(真实/合成), prompt 来源(抽取/合成).

**搜索 Agent.** 用基于 V3.2 的多智能体流水产多样高质量数据. 先从大规模网页语料抽各域信息量大的长尾实体; 出题 Agent 用可配置深广度的搜索工具探索实体, 收成问答对; 多个异构配置的答疑 Agent(不同检查点, system prompt 等)为每对产多样候选; 带搜索的核查 Agent 多轮校验, 只留「金标正确且候选均可证伪」的样本. 数据跨语言, 域, 难度. 再混入已有 helpful RL 里「搜索工具有可测收益」的过滤样本, 贴近真实用法. 最终定多维质量 rubric, 用生成式奖励模型打分. 混合策略同时优化事实可靠性与实用帮助性.

**代码 Agent.** 从 GitHub 挖数百万 issue–PR 对, 建大规模可执行「修 issue」环境. 启发式 + LLM 判断严筛: 每条要有合理 issue 描述, 对应金牌补丁, 用于验证的测试补丁. 用 V3.2 驱动的自动环境搭建 Agent 装包, 解依赖, 跑测; 测试结果走标准 JUnit 格式, 跨语言与测试框架解析一致. 成功标准: 打上金牌补丁后 F2P(false-to-positive, 失败变通过)非零且 P2F(pass-to-fail, 通过变失败)为零. 流水建成数万可复现环境, 覆盖 Python, Java, JavaScript, TypeScript, C, C++, Go, PHP 等. **代码解释器 Agent.** 用 Jupyter Notebook 当解释器解复杂推理题; 精选数学, 逻辑, 数据科学等题, 每题都需要靠执行代码才能到解. **通用 Agent.** 为放大 RL 里的环境与任务, 用自动环境合成 Agent 合成 1, 827 个面向任务的环境-- 难解, 易验. 流程含: 环境与工具集构造, 任务合成, 解生成, 步骤如下.

1. 给定任务类别(如规划行程)与带 bash, 搜索工具的沙箱, Agent 先用这些工具生成或从网上取相关数据, 写入沙箱数据库.

2. 再合成一组任务专用工具, 每个是一个函数.

3. 为做到「难且可自动验」: 先基于当前库提简单任务, 并写 Python 解函数与验函数. 解函数只能调工具函数或做逻辑运算, 不能调其他函数或直访数据库, 保证只能经工具接口求解; 解的输出必须过验函数, 不过就改解或验, 直到通过. 再迭代加难并更新解/验; 工具不够就扩充工具集.

按此得到数千组 &lt; 环境, 工具, 任务, 验证器&gt;. 用 V3.2 在其上做 RL, 只留 pass@100 非零的实例, 最终 1, 827 个环境, 对应任务共 4, 417. 下方是合成行程规划例: 在大组合空间里搜满足约束的行程很难, 但检查候选是否满足约束相对容易.

### 3.1. 合成任务示例：行程规划

计划从杭州出发的三天行程(2025-10-01 至 2025-10-03). 全程城市, 酒店, 景点, 餐厅不重复; 每天推荐的酒店/餐厅/景点必须落在当日所在城市. 第二天预算规则: 若豪华酒店 ≥800 CNY/晚, 则午晚两餐合计 &lt; 350 CNY, 两家餐厅评分均 ≥4.0, 下午景点票 &lt; 120 CNY; 若酒店 500–800 CNY, 则至少一家餐厅 ≥4.0, 景点票 &lt; 180 CNY; 若酒店 200–500 CNY, 则至少一家餐厅 ≥3.2. 请帮忙拼出行程.

**提交结果格式**

**行程规划工具集**

**Evaluation 评测**

**Main Results 主结果**

评测覆盖 MMLU-Pro, GPQA Diamond, HLE 纯文本, LiveCodeBench(2024.08–2025.04), Code- forces, Aider-Polyglot, AIME 2025, HMMT Feb/Nov 2025, IMOAnswerBench, Terminal Bench 2.0, SWE-Verified, SWE Multilingual, BrowseComp, BrowseCompZh, 𝜏²-bench, MCP-Universe, MCP-Mark, Tool-Decathlon. 工具基准走标准 function call, 模型开 thinking. MCP-Universe / MCP-Mark 用内部环境(搜索与 playwright 可能与官方略有差别). 温度 1.0, 上下文 128K. 数学类(AIME, HMMT, IMOAnswerBench, HLE)模板:「{question}\nPlease reason step by step, and put your final answer within \boxed{}.」 HLE 另用官方模板测 Thinking, 得 23.9. 表 2｜V3.2 与开/闭源对照. 开源侧只比「工具调用支持 thinking」的模型. 粗体为各类内最优. 𝜏²-Bench 取各类平均; BrowseComp 带上下文管理的分数标 *. 推理任务上与 GPT-5-high 接近, 略逊 Gemini-3.0-Pro. 相对 K2-Thinking, 分数相当但输出 token 明显更少(表 3). 增益归因于 RL 算力加大: 近数月表现随 RL 预算延长持续抬升, 预算已超过预训练成本的 10%; 我们猜测再加预算还能抬推理. 文中 V3.2 成绩受长度约束奖励模型限制; 去掉限制后还能再抬, 见 代码 Agent: SWE-bench Verified 与 Terminal Bench 2.0 上显著强于开源 LLM, 显示真实编码工作流潜力. Terminal Bench 2.0: thinking 上下文管理与 Terminus 不兼容, 故报分 46.4 来自 Claude Code 框架; Terminus + non-thinking 为 39.3. SWE Verified 主分来自内部框架; Claude Code, RooCode, non-thinking 等稳健性测试结果落在 72–74, 一致.

搜索 Agent: 用标准商业搜索 API. V3.2 最大上下文仅 128K, 约 20%+ 用例超限, 故用上下文管理得最终分; 无管理时为 51.4. 细节见 §4.4. 工具基准: 显著收窄开闭源差距, 但仍低于前沿. 𝜏²-bench 用模型自身当 user agent, 分类分 63.8(Airline), 81.1(Retail), 96.2(Telecom). MCP 走 function calling, 工具输出放 `tool` 角色而非 `user`. 测试中常冗余自检, 轨迹过长, 易超 128K(尤其 MCP-Mark GitHub, Playwright), 拖最终分; 加上下文管理还能再抬, 留作未来与用户实操注意. 即便如此仍显著强于既有开源. 这些基准的环境与工具集 RL 时未见, 说明推理策略能泛化到域外 Agent 场景. non-thinking 的 Agent 评测见附录表 9.

**Results of DeepSeek-V3.2-Speciale DeepSeek-V3.2-Speciale 结果**

表 3: Speciale 靠更多推理 token 取得更优表现, 多基准超过 Gemini-3.0-Pro. 表 4: 通用模型, 无专项训练, 在 IOI 2025 与 ICPC WF 达金牌级; 接入 Shao et al. (2025) 后, 复杂证明达 IMO 2025, CMO 2025 金牌线⁵. 协议见附录 D. 但 Speciale 的 token 效率仍明显逊于 Gemini-3.0-Pro. 为控部署成本与延迟, 正式版 V3.2 训练时加了更严的 token 约束, 优化性能–成本权衡.

<small><span class=「docvortex-page-footnote」 data-block-type=「page_footnote」 style=「color: #6b7280」><sup>5</sup>CMO 2025 评的是英文版. IMO / CMO 2025 题目与推理代码见: https://github. com/deepseek-ai/DeepSeek-Math-V2. </span></small>

我们认为 token 效率仍是未来关键课题. 表 3｜推理模型的表现与效率. 每格为准确率 + 输出 token 数(千). 各基准最高粗体, 次高下划线. 表 4｜Speciale 在顶级数学与编程竞赛表现. ICPC WF 2025 报各题成功提交次数. Speciale 在 ICPC WF 2025 排第 2, IOI 2025 排第 10.

**Synthesis Agentic Tasks 合成 Agent 任务**

本节消融合成 Agent 任务. 两个问题: 合成任务是否够难, 值得 RL? 以及泛化如何-- 能否迁到其他下游或真实环境? 第一问: 从通用合成任务随机抽 50 例, 评合成用模型与前沿闭源. 表 5: V3.2-Exp 仅 12%, 闭源最高 62%. 说明合成数据里确有对双方都难的 Agent 题. 第二问: 对 V3.2 的 SFT 检查点(记 DeepSeek-V3.2-SFT)做 RL; 为排除长 CoT 与其他 RL 数据, 只在合成 Agent 任务, non-thinking 上训. 对照: SFT 本身, 以及只在搜索与代码环境 RL 的 V3.2-Exp. 图 5: 大规模合成数据 RL 带来显著提升 表 5｜通用合成任务在不同模型上的准确率. 图 5｜仅用合成通用 Agent 数据对 DeepSeek-V3.2-SFT 做 RL 训练. 相对 SFT, 在 Tau2Bench, MCP-Mark, MCP-Universe 上明显抬升; 若 RL 只限代码与搜索, 这些基准不涨, 更凸出合成数据的价值.

### 3.2. Context Management of Search Agent 搜索 Agent 的上下文管理

即便有 128k 级窗口, Agent 工作流(尤其搜索)仍常顶满长度, 推理被提前截断, TestingTime 算力潜力吃不满. 对策: token 用量超窗口 80% 时做上下文管理, 简单策略延展 TestingTime 预算: (1) **Summary**-- 摘要溢出轨迹后重新 rollout; (2) **Discard-75%**-- 丢掉轨迹前 75% 工具调用历史腾空间; (3) **Discard-all**-- 清空全部工具调用历史重置上下文(类似 Anthropic 2025a 的 new context 工具). 对照还有并行扩展基线 **Parallel-fewest-step**: 采样 N 条独立轨迹, 图 6｜不同 TestingTime 算力扩展策略下 BrowseComp 准确率. 并选步数最少的那条. 在 BrowseComp(Wei et al., 2025)上评这些策略. 图 6: 不同算力预算下, 上下文管理让模型能放大 TestingTime 算力, 多走执行步, 收益明显. 例: Summary 把平均步数拉到 364, 分数可到 60.2, 但整体效率偏低. Discard-all 虽简单, 效率与可扩展性都不错, 得 67.6, 与并行扩展相当但步数少得多.

小结: TestingTime 算力可串行(上下文管理)或并行扩展, 都能延展解题能力; 但策略效率与可扩展性不同, 基准对比必须计入真实算力成本. 串并行如何最优组合, 仍是未来重点.

**Conclusion, Limitation, and Future Work 结论, 局限与未来工作**

本文推出 DeepSeek-V3.2: 在算力效率与高阶推理之间搭桥. DSA 压住复杂度且长上下文不掉点; 加大算力预算后, 推理基准与 GPT-5 相当; 大规模 Agent 任务合成流水显著抬工具能力, 为开源 LLM 上的稳健, 可泛化 Agent 打开空间. 高算力变体 Speciale 以 IMO, IOI 金牌验证, 为开源 LLM 立下一座里程碑. 相对 Gemini-3.0-Pro 等前沿闭源, 局限仍在. 其一: 总训练 FLOPs 更少, 世界知识广度仍落后于头部专有 模型; 计划在后续迭代放大预训练算力补知识缺口. 其二: token 效率仍是挑战-- 要达到 Gemini-3.0-Pro 级输出质量, 通常需要更长生成轨迹; 未来要优化推理链的「智能密度」提效. 其三: 复杂任务求解仍逊于前沿, 需继续打磨底座与后训练配方.

**DSA 选择器的完整机制**

Lightning indexer 负责从长上下文中选出候选 token，Sparse MLA 才在候选集合上计算原注意力分数。索引阶段的漏选无法由后续精排恢复，因此需要单独分析训练目标、召回率与计算成本。 token 级 Sparse Attention 要完成一次有约束的检索: 对每个 query, 从全部历史 token 中召回少量候选, 再用主 attention 的完整表示精确计算. 候选太少会漏证据, 候选太多又失去稀疏收益. 更棘手的是, 一个为每对 query-key 打分的 selector 自己也会形成 $n\times n$ 分数矩阵. 主 attention 从平方降到 $O(nk)$ 以后, indexer 可能接替它成为最长的 kernel.

[DeepSeek-V3.2](https://arxiv.org/abs/2512.02556)中的 DeepSeek Sparse Attention(DSA)给出一条完整路径: **Lightning Indexer** 用低维、多头 query 与共享 key 产生标量索引分数, top-k selector 为每个 query 选出 2048 个历史位置, Sparse MLA 只读取这些位置. DSA 由 DeepSeek-V3.1-Terminus 继续训练而来, 先用稠密 attention 预热 indexer, 再让主模型适应稀疏拓扑. 选择器、训练目标、MLA 表示和 kernel 都属于模型设计的一部分, 临时给任意稠密模型添加 top-k mask 无法得到同一条计算路径.

DSA 之后的优化大多没有否定 token 级选择, 而是追问「索引阶段能否更便宜」. [HISA](https://arxiv.org/abs/2603.28458)先筛块再在候选块内运行原 indexer; [MISA](https://arxiv.org/abs/2605.07363)把 indexer heads 当成专家池, 每个 query 只激活少量 heads; [LISA](https://arxiv.org/abs/2607.19358)把线性 attention 的长程状态与 indexer 引导的 sparse self-attention 并联. 四者提供了三种不同的降本轴: 缩小 token 搜索范围、缩小参与打分的 head 数、用线性状态承接未进入 top-k 的全局信息.

**Lightning Indexer 的输入、输出与目标**

**低维打分怎样连接 Sparse MLA**

固定 batch 中一个样本. hidden state 为 $h_t\in\mathbb{R}^{d}$, indexer 为 query token $t$ 产生 $H^I$ 个低维 query $q^I_{t,j}\in\mathbb{R}^{d^I}$ 和 $H^I$ 个权重 $w^I_{t,j}\in\mathbb{R}$. 历史 token $s$ 只产生一个共享 key $k^I_s\in\mathbb{R}^{d^I}$. DeepSeek-V3.2 报告给出的分数是:

$$
I_{t,s}=\sum_{j=1}^{H^I}w^I_{t,j}\operatorname{ReLU}\left((q^I_{t,j})^Tk^I_s\right). \tag{1}
$$

对整段 Prefill, $Q^I\in\mathbb{R}^{B\times n\times H^I\times d^I}$, $K^I\in\mathbb{R}^{B\times n\times d^I}$, 权重 $W^I\in\mathbb{R}^{B\times n\times H^I}$. indexer 输出 $I\in\mathbb{R}^{B\times n\times n}$, 加 causal mask 后沿历史位置维取 top-k, 得到位置张量 $S\in\mathbb{N}^{B\times n\times k}$. Sparse MLA 的主 attention 根据 $S_{t,:}$ gather 对应 latent KV, 输出 shape 仍与原 MLA 一致. 式 (1)的共享 key 很重要. selector 最终为一个 query 的全部主 attention heads 选择同一组 token, 才能让选中的 latent KV 被多个 query heads 复用. 如果每个主 head 各选一套位置, token 数可能成倍增长, K/V gather 也更碎. 多个 indexer heads 的作用是给相关性提供多种子空间, 加权求和后仍输出一个共享标量 $I_{t,s}$. ReLU 让每个 indexer head 只贡献非负匹配, $w^I_{t,j}$ 再控制该 head 对当前 query 的重要性. 官方报告明确将 ReLU 的选择归因于吞吐, 并指出 indexer head 数较少且可用 FP8 实现. 低维和低精度降低每次配对成本, 没有改变配对数量: Prefill 仍为 $O(n^2H^Id^I)$, Decode 每步仍扫描长度为 $t$ 的全部 $K^I$.

**selector 选择什么, 又没有选择什么**

候选集合定义为:

$$
\mathcal S_t=\operatorname{TopK}\left(I_{t,0:t},k\right). \tag{2}
$$

主 attention 随后计算:

$$
u_t=\operatorname{Attn}\left(h_t,\{c_s:s\in\mathcal S_t\}\right), \tag{3}
$$

其中 $c_s$ 是 MLA 的 latent KV entry. selector 只决定读取哪些位置, 不复用式 (1)的分数作为主 softmax 权重. 命中候选后, Sparse MLA 仍使用自己的 QK 分数、RoPE、causal 约束和 softmax. 因而 indexer 要逼近的是主 attention 的排序偏好, 不必精确重构每个 head 的 logits. top-k 的 $k$ 是每个 query 的关系预算, 不是 KV Cache 容量. DeepSeek-V3.2 稀疏训练阶段取 $k=2048$. 全部历史 latent KV 仍然存在, 因为不同 query 的候选不同, 后续 query 也可能重新选择此前未命中的位置. 若把 DSA 与 KV 驱逐组合, 被驱逐位置将无法参与式 (2)之后的精排; 那属于另一项不可逆近似. 同一候选集合跨主 attention heads 共享, 也意味着 selector 目标来自多头偏好的聚合. 某个只对单个 head 关键的 token, 在求和后可能被其他 heads 稀释. 增大 $k$ 能缓解, 代价是 Sparse MLA 读取更多 KV. MISA 反过来处理 indexer 内部的多头冗余, 不改变最终共享候选集合的大小.

### 3.3. 一个五 token 手算

仅示意式 (1)-(3), 取 $H^I=2,d^I=2$, 省略缩放、位置编码与 batch. 当前 query 的两个 index query 为 $q^I_{t,1}=(1,0)$、$q^I_{t,2}=(0,1)$, 权重为 $w^I_t=(0.75,0.25)$. 三个历史 key 为:

$$
k^I_1=(2,-1),\qquad k^I_2=(1,3),\qquad k^I_3=(-1,4). \tag{4}
$$

逐 head 内积和 ReLU 分别为 $(2,0)$、$(1,3)$、$(0,4)$. 按式 (1)加权:

$$
I_{t,1}=0.75\times2+0.25\times0=1.5, \tag{5}
$$

$$
I_{t,2}=0.75\times1+0.25\times3=1.5,\qquad
I_{t,3}=0.75\times0+0.25\times4=1.0. \tag{6}
$$

取 $k=2$, selector 返回位置 1 与 2. 假设主 attention 用完整表示算出的 logits 是 $a_{t,1}=0.2,a_{t,2}=1.2$, 对应 Value 为 $v_1=(2,0),v_2=(0,3)$. 主 softmax 权重约为 $(0.269,0.731)$, 输出为 $(0.538,2.193)$. indexer 分数 1.5 和 1.5 没进入主 softmax; 它们只完成召回. 如果位置 3 的完整主 logit 实际为 2.0, indexer 就漏掉了主 attention 第一名. sparse softmax 会在位置 1、2 上重新归一化, 任何后续高精度 kernel 都无法补回位置 3. 这正是 indexer 训练和 recall@k 评测的对象.

**DSA 为什么需要两阶段继续训练**

**稠密预热把选择器对齐到教师分布**

DeepSeek-V3.2 从已扩展到 128K 上下文的 DeepSeek-V3.1-Terminus 继续训练. 第一阶段保持稠密 attention, 冻结除 Lightning Indexer 外的全部模型参数. 对 query $t$, 将主 attention 分数跨所有 attention heads 求和, 再沿序列维做 L1 归一化, 得到教师分布 $p_{t,:}\in\mathbb{R}^{t}$. indexer 的学生分布是 $\operatorname{Softmax}(I_{t,:})$. 预热损失为:

$$
\mathcal L^I=\sum_tD_{KL}\left(p_{t,:}\;\|\;\operatorname{Softmax}(I_{t,:})\right). \tag{7}
$$

报告给出的预热学习率为 $10^{-3}$, 训练 1000 步; 每步 16 条 128K 序列, 总计 2.1B token. 这一阶段不省 attention 训练成本, 因为教师分布来自稠密主 attention. 它的职责是让随机初始化的 indexer 在切换稀疏路径前学会主模型已有的注意力偏好. KL 目标比直接监督 top-k 多提供了排序信息. 教师高概率位置受到更强约束, 长尾位置仍参与分布. 但教师先跨 head 聚合, 学到的是共享候选偏好. 如果各 head 的峰值位置互不相同, 学生需要用有限 $k$ 覆盖它们的并集. 训练损失低并不自动等于每个 head 的 top-k recall 高, 两者应分别测量.

**稀疏训练让主模型适应漏边**

第二阶段启用式 (2)的 fine-grained token selection, 所有主模型参数都参与语言模型训练. indexer 的 KL 只在已选集合 $\mathcal S_t$ 上计算:

$$
\mathcal L^I=\sum_tD_{KL}\left(p_{t,\mathcal S_t}\;\|\;
\operatorname{Softmax}(I_{t,\mathcal S_t})\right). \tag{8}
$$

报告说明 indexer 输入从计算图中 detach. indexer 只由 $\mathcal L^I$ 优化, 主模型只由语言模型 loss 优化. 这种分离避免主任务梯度通过离散 top-k 迫使 indexer走不稳定的近似路径, 同时让主模型在固定选择机制下重新组织信息. 稀疏阶段学习率为 $7.3\times10^{-6}$, 训练 15000 步, 每步 480 条 128K 序列, 总计 943.7B token. 从训练成本看, 稀疏阶段仍需产生对齐目标. 报告的式 (8)只在选中集合计算 indexer 分布, 但教师 $p$ 的产生和具体重计算路径必须由实现配合. NVIDIA cuDNN 的 DSA 文档将训练 kernel拆成稀疏/稠密 indexer 与 attention score recompute、top-k、backward 等操作, 说明训练不会只靠一次前向 mask 完成.

**DSA 的训练对齐包含两件事: selector 学会复现稠密偏好, 主模型学会在 selector 给定的缺边图上工作.** 只有第一件事而没有稀疏适配, 漏选误差会直接冲击已有表示; 只有第二件事而没有可靠初始化, 训练早期的随机候选又会破坏长程信息.

**recall@k 应怎样定义**

设主 attention 聚合后教师 top-$m$ 集合为 $G_t^{(m)}$, indexer 候选为 $\mathcal S_t^{(k)}$. token recall 为:

$$
\operatorname{Recall@k}_t=\frac{|G_t^{(m)}\cap\mathcal S_t^{(k)}|}{|G_t^{(m)}|}. \tag{9}
$$

$m$ 与 $k$ 必须分别报告. 若把教师集合也取成 $k$, recall 衡量同预算排序重合; 若 $m<k$, 它衡量较大候选能否覆盖最重要的少量 token. 还可计算教师概率质量覆盖 $\sum_{s\in\mathcal S_t}p_{t,s}$, 让第一名比边缘项贡献更大. 平均 recall 容易被大量局部 query 稀释. 应按层、query 位置、相对距离和任务类型给出分位数. 唯一证据检索关注最差位置, 多证据聚合关注被覆盖证据数量, 语言模型 loss 则偏向常见局部 token. MISA 报告每层选中 token 与 DSA 的重合超过 92%, HISA 报告与原 DSA 选择集合的平均 IoU 超过 99%; 这些数字的参照是 DSA selector, 不等同于对稠密 attention 的绝对召回.

**索引器何时吃掉稀疏收益**

**Prefill 和 Decode 的复杂度不同**

对长度 $n$ 的 Prefill, Lightning Indexer 计算全部 causal 对, 复杂度仍是 $O(n^2H^Id^I)$. Sparse MLA 只计算 $k$ 个候选, 约为 $O(nkd_{main})$. 因为 $d^I$、$H^I$ 与精度都小于主 MLA 的对应工作, DSA 仍可加速; 随 $n$ 增长, indexer 的平方项最终会占比上升. DeepSeek-V3.2 报告也明确说明 indexer 仍为 $O(L^2)$, 只是计算远少于原 MLA. Decode 第 $t$ 步只有一个新 query. indexer 扫描 $t$ 个缓存的 $K^I$, 成本为 $O(tH^Id^I)$; selector 取 top-k, Sparse MLA 读取 $k$ 个 latent KV. 对生成 $n$ 个 token 的整段过程求和, indexer 仍是平方累计, 但单步可以用 GEMV/小矩阵核执行. Decode 常受 HBM 带宽限制, indexer key cache 的字节数与读取方式比 FLOPS 更重要. 短 Prefill 上, top-k、索引 materialize 和不规则 gather 的固定成本可能超过少算的主 attention. DeepSeek 报告为短序列 Prefill 特别实现 masked MHA 模式模拟 DSA, 正说明稀疏 kernel并非所有长度都占优. 服务端应根据长度与 batch 选择路径, 不能强制所有请求走 token-sparse kernel.

## 4. Indexer 的后续改进与训练开销

对每个 query 从长度 $t$ 的分数中取 2048 项, 完整排序需要 $O(t\log t)$ 比较, 实现通常使用分块选择、radix top-k 或多级归并. NVIDIA cuDNN 的 DSA 模块同时提供 indexer forward、融合 indexer+top-k 和独立 radix top-k, 并允许按 `seq_lens` 处理变长行. 融合能避免把完整分数矩阵写回 HBM, 对极长上下文尤其关键. 如果 indexer 先物化 $B\times n\times n$ FP32 分数, 内存已经不可接受. 更合理的 kernel边算分块分数边维护局部 top-k, 再归并为每行最终候选. 训练需要 KL 或 backward 时可能重算选中分数, 而不是永久保存全部稠密分数. 这与 FlashAttention 的思想相似: 数学对象是大矩阵, 执行不必物化它. top-k 输出为整数位置, 后续 Sparse MLA 根据位置 gather latent KV. 每个 query 的位置不同, 内存访问近似随机. 对同一 batch, 可按 key 位置重排工作、让邻近 query 共享加载, 或把候选整理成 tile; 整理本身又会产生排序与索引成本. element-wise 选择比 block-wise 更贴近注意力峰值, kernel 更难达到 tensor core 的规则吞吐.

**KV cache、量化与两套状态**

DSA 推理至少维护主 MLA latent KV cache 与 indexer K cache. 前者供式 (3)的精确 attention, 后者供式 (1)的全历史扫描. indexer 不需要 V, 但 $K^I$ 必须覆盖所有仍可选的历史 token. 如果主 KV 保留完整而 indexer K 被驱逐, selector 看不到仍存在的主 KV; 如果反过来, selector 会返回已经无法读取的位置. 官方模型实现包含 indexer K 的量化缓存与尺度. FP8 使全历史扫描的字节和算力下降, 也会改变边界附近分数排序. 量化验证不能只比较平均分数误差, 要比较 top-k 集合重合、稠密概率质量覆盖和任务结果. 可以用更大候选做粗召回, 再用高精度 indexer 或主 QK 精排, 但会增加读取. Prefill 可以一次生成整段 $K^I$ 并执行大矩阵 kernel; Decode 每步追加一条 $K^I_t$ 到 cache. 主 MLA 在 Decode 下可使用权重吸收等 MQA 形式, 让 latent KV 被所有 query heads 共享. indexer 的共享 $K^I$ 与主 MLA 的共享 latent 是两套不同表示, 不能把 indexer key 当作主 attention key 使用.

### 4.1. HISA、MISA 与 LISA 改了哪一段

**HISA: 先筛块, 再按原式精排 token**

HISA 将 DSA 的平坦全量扫描改为两阶段层次搜索. 历史 $K^I$ 先按块聚合成代表, query 对块代表打分并保留少量候选块; 随后只在这些块内部计算原 DSA indexer 式 (1), 最终仍输出 token 级 top-k. Sparse MLA 接口和候选数不变, 因而 HISA 是 indexer 的免训练替换. 设块大小为 $b$, 块数 $N=\lceil n/b\rceil$, 粗选保留 $r$ 个块. 平坦 DSA 每个 query 打分 $n$ 个 token; HISA 粗筛约比较 $N$ 个代表, 精排约比较 $rb$ 个 token. 忽略 head 维, 成本从 $O(n)$ 变成 $O(n/b+rb)$. $b$ 太小会让粗筛接近全量, 太大则每个候选块带入更多无关 token. $r$ 决定 coarse recall, 最终 top-k 无法找回被整块剪掉的 token. HISA 的关键评测是对原 DSA 候选的集合保真. 论文报告直接替换 DeepSeek-V3.2 和 GLM-5 的 indexer, 无需微调; 摘要给出 kernel 在 32K 达到 2 倍、128K 达到 4 倍的结果, 并报告选择集合平均 IoU 超过 99%. 这证明层次筛选能高度复现 DSA selector, 并不证明 DSA 自身与稠密教师完全一致.

**MISA: 少算 indexer heads**

MISA 观察到 DSA 的多个 indexer heads 最终共同产生一套候选, 对每个 query 全部激活可能冗余. 它把 $H^I$ 个 heads 视为专家池, 轻量 router 根据块池化的 indexer keys 为当前 query 选择 $h\ll H^I$ 个 active heads, 只有这些 heads 扫描 token 并贡献式 (1). 路由器的输入规模由少量块代表控制, 避免自己成为另一套 token 级扫描. 若原 indexer 有 $H^I=64$, 每个 query 只激活 $h=8$, token 打分主体减少到八分之一, 再加 router. MISA 官方摘要报告, 只激活 8 个 heads 时, 在 DeepSeek-V3.2 与 GLM-5 上分别以 8 倍和 4 倍更少的 indexer heads 匹配原 DSA 的 LongBench 质量, H200 上 TileLang kernel约有 3.82 倍加速. 实际加速低于 head 数缩减, 因为 router、内存和 top-k 没有同比消失. MISA 还给出 hierarchical variant: routed pass 先保留放大的候选集, 再用原 DSA 全 indexer 对候选精排. 这相当于「稀疏 heads 粗召回 + 完整 heads 局部精排」. 它与 HISA 都采用两阶段搜索, 第一阶段削减的对象不同: MISA减少参与扫描的heads, HISA先缩小token区域.

**LISA: 线性状态与稀疏检索并联**

LISA 的目标不只是让 DSA indexer 更快. 它在原模型中并联线性 attention 与 indexer 引导的 sparse self-attention, 再由 gate 融合. 线性分支以 $O(n)$ 状态提供全局长程记忆, sparse 分支从全上下文选 top-$M$ token 做精确 softmax attention. 若 selector 漏掉广泛分布的小权重信息, 线性分支仍可能保留聚合信号. 训练分两阶段. 第一阶段引入线性 attention, 配合滑动窗口 sparse attention, 通过冻结教师的知识蒸馏逼近 full self-attention. 第二阶段用 indexer 替换固定窗口, 以 per-head KL 对齐教师 attention pattern. 与 DSA 先预热共享 selector 再全模稀疏适配相比, LISA 明确保留两条并行信息通道, 并把对齐细化到 head. 论文在 DeepSeek distilled Qwen 系列上报告 16K 上下文约 50% 推理加速, 推理类评测平均提升 5.6%. 这里的质量变化包含架构迁移与训练, 不能归因于 indexer 单独更准. LISA 的线性状态、sparse KV、indexer K 和 gate 都有运行状态, cache构成也比纯 DSA 更复杂.

**内核、共享与失效边界**

**跨头与跨层共享是两件事**

DSA 在一个 layer 内用多个 indexer heads 产生共享 token 集合, 这是跨头聚合. MISA 让每个 query 只激活其中少量 heads, 仍在同层完成. 跨层共享则让相邻 layers 复用 $S_t$ 或某种 indexer 表示, 省去重复扫描. 前者减少式 (1)求和中的 head 数, 后者减少执行式 (1)的 layer 数. 复用跨层 top-k 的风险是 attention 偏好随深度变化. 浅层可能偏局部词法, 深层偏语义实体; 同一候选集合不能保证覆盖两者. 可用教师测量相邻层候选 IoU, 按相似区间设共享组, 并在组首完整重建. 若只共享 $K^I$ 而每层保留独立 $Q^I$ 和 top-k, 省的是 key 投影/cache, 不是全扫描. 跨头和跨层共享都要写清共享对象: 参数、indexer K、query heads、分数还是整数 top-k. 共享分数仍需每层 top-k; 共享 top-k 直接跳过 selector; 共享 KV 只省存储或投影. 把这些统称「共享索引」会无法核算质量和性能.

**kernel 边界从 selector 延伸到 Sparse MLA**

高效链路应尽量融合 indexer score、causal mask 与 top-k, 避免写回 $n^2$ 分数. top-k 输出随后进入 Sparse MLA kernel, 按不连续地址加载 latent KV. selector 和 attention 若完全分离, 整数索引要写回 HBM 再读入; 若融合, kernel 又要同时处理低维检索与高维 attention, 寄存器和调度更复杂. 训练路径比推理多 backward 和 score recompute. cuDNN DSA 文档列出 sparse attention backward、indexer forward/top-k、稀疏与稠密 score recompute、indexer backward 等独立操作. 这反映一个现实: 前向选择少量 token 不等于反向也自然稀疏. 对齐损失需要哪些未选分数、梯度怎样回到 $Q^I,K^I,W^I$, 都必须由训练 kernel定义. element-wise gather 的 HBM 合并程度取决于候选排序. 按分数 top-k 返回的索引是无序或按分数排列, 按位置重排后读取更连续, 但主 softmax 不关心位置顺序. kernel 可将候选按物理页和 offset 排序, 同时保留去重与 causal 有效长度. 索引整理时间应计入 selector, 不能只计 QK 打分.

### 4.2. 数值、量化和失效诊断

FP8 indexer 的误差主要表现为排序变化. 对相差很大的分数, 量化不影响 top-k; 对 cutoff 附近密集分数, 微小误差会替换候选. 因此应测 top-k cutoff margin: 第 $k$ 名与第 $k+1$ 名的差越小, 选择越不稳定. MISA 的少 head 路由和 HISA 的粗筛又会叠加离散边界, 可以通过扩大第一阶段候选后精排缓解. 最危险的失败是稳定漏掉罕见关键 token. 平均 recall 和 LongBench 均分可能保持良好, 唯一约束、代码定义或多跳中间证据却持续缺席. 测试应控制证据距离、出现次数、相似干扰和所需证据数, 并记录最差 query 的概率质量覆盖. Needle 热图检查单证据位置, 不能替代多证据聚合. 性能失效则常见于短序列、top-k 过大、候选地址太散和 indexer K 带宽过高. 诊断应拆分 indexer GEMM、top-k、索引整理、Sparse MLA gather/attention 和其他层时间. 若 indexer 已成为主耗时, HISA/MISA 类改造有意义; 若 Sparse MLA gather 更慢, 再压 indexer不会改变瓶颈.

**一套可复算的评测表**

算法层记录教师 top-$m$ recall、概率质量覆盖、与基线 DSA 的 IoU、cutoff margin、每 query 候选数. 执行层记录 indexer 读取字节、top-k 时间、物理 KV gather 字节、kernel 时间与峰值工作区. 任务层记录困惑度、远程检索、多证据推理、代码与目标业务. 三层必须使用相同模型权重和上下文长度. Prefill 与 Decode 分开: Prefill 报每层整段 indexer 和 Sparse MLA 时间; Decode 报不同 cache 长度的单 token 延迟以及 batch 扩展. 量化实验同时给出 indexer K dtype、scale 粒度与 top-k 重合. 跨层共享实验注明每几层刷新、共享哪种状态, 不能只写一个总体加速. **selector 要在固定候选预算内召回主 attention 需要的位置, 同时让后续 kernel以更少字节完成精确计算.** DSA 建立可训练基线, HISA 缩小 token 搜索域, MISA 缩小 head 搜索域, LISA 增加一条线性全局通道. 它们最终都要通过同一张质量—索引—访存表接受检验.

**selector 的预算怎样分配**

固定 $k=2048$ 便于 kernel 预分配和批处理, 却隐含每个 query 需要相同预算. 实际 attention 熵随层、head 与位置变化. 一些 query 的教师分布集中在几十个 token, 另一些需要汇总许多段落. 自适应 $k_t$ 可以按教师熵、indexer cutoff margin 或累计分数质量决定, 但变长候选会让工作调度和内存规划更难. 设 indexer softmax 为 $r_{t,s}$, 可以选最小集合满足累计质量阈值 $\tau$:

$$
k_t=\min\left\{m:\sum_{s\in\operatorname{TopM}(r_{t,:},m)}r_{t,s}\ge\tau\right\}. \tag{10}
$$

式 (10)在 indexer 分布校准良好时有意义. 若分布过尖, 很小 $k_t$ 也会满足阈值, 但主 attention 未必同样集中. 若分布过平, $k_t$ 会逼近上下文长度. 训练时可以校准温度, 部署时仍要限制 $k_{min}\le k_t\le k_{max}$. 固定容量 kernel通常将 $k_t$ padding 到少数档位, 而不是支持每行任意长度. 预算也可按 layer 分配. 浅层局部性强时用较小 $k$, 中层实体聚合增大, 深层再根据实测收紧. 总关系预算 $K_{total}=\sum_lk_l$ 固定时, 可以用每层增量质量决定分配. 逐层独立最大化 recall 不是全局最优, 因为前层漏掉的信息会改变后层 hidden state, 教师分布也随之变化.

HISA 的两级预算包含候选块数 $r$ 与最终 token 数 $k$. 粗筛必须让 $rb\ge k$, 通常还要明显大于 $k$ 才给精排留余量. MISA 的预算包含 active heads $h$、粗候选 $k'$ 与最终 $k$. 减少 $h$ 后若直接取最终 top-k, 速度高而召回受限; 先取 $k'>k$ 再用全 heads 精排, 会在候选读取与重算之间取得中间点.

**从公式到 FP8 缓存的数值路径**

式 (1)省略了实现中的缩放. 低精度点积需要控制 $q^I$、$k^I$ 与 head 权重的尺度, 否则 ReLU 前的大量值溢出或全部落在零侧. 常见路径是对 indexer key 分块量化, 保存 FP8 数据和每块 scale; query 在寄存器中转换到计算类型, 点积使用更高精度累积, 再乘 $w^I$ 并沿 head 维求和.

**召回、量化与部署边界**

设真实 key 为 $k$, 量化值为 $\hat k=\operatorname{round}(k/a)$, scale 为 $a$. 重构误差 $e=a\hat k-k$ 使单 head 分数变化为 $q^Te$. 若 $\|q\|_2\|e\|_2$ 小于 top-k cutoff 的 margin, 排序保持; margin 更小时可能翻转. 因而 scale 粒度不只决定均方误差, 还决定 selector 的离散稳定性. 分块越细, 误差越小, scale 元数据和反量化操作越多. ReLU 会放大量化对符号的影响. 一个真实小负值被量化成小正值后开始贡献, 小正值变成负值后贡献直接归零. 对接近零的点积, 相对误差很大, 但这类项若远离 top-k cutoff 未必影响选择. 数值测试应重点采样 cutoff 附近候选, 而非对全部 $n^2$ 分数平均.

权重 $w^I_{t,j}$ 可以为正或按实现经过缩放. 如果允许负权, 多 head 求和后 indexer 分数不再是简单的非负相似度累加; top-k kernel仍只比较最终标量. 融合 kernel必须保持 head reduce 的累积顺序和精度. 参考实现与优化实现输出集合不一致时, 先比较 cutoff margin, 再判断是容许的数值替换还是缩放错误.

**分布式执行和通信**

在 tensor parallel 下, 主 attention heads 分散在设备, 但 DSA 的 token 集合应为 query token 共享. 若每张卡只用本地 head 的教师或 indexer部分独立 top-k, 各卡会得到不同 $\mathcal S_t$, 失去 latent KV 跨 heads 共享的优势. 一种路径是跨卡 reduce indexer head贡献, 再统一 top-k; 另一种是复制完整轻量 indexer, 让每卡独立得到相同结果. reduce 的对象若是长度 $n$ 的分数行, Decode 每步需要一次跨卡通信, Prefill 则是大规模分数张量. 复制 indexer 增加参数和 $K^I$ cache, 但避免分数通信. 因为 indexer本身相对主模型小, 复制常更直接; 具体取决于 $H^I,d^I$、并行规模和显存. 配置必须保证随机性、量化 scale 与 causal 长度一致, 否则各卡 top-k 会分叉.

序列并行把历史 token 分到不同设备. 每张卡先计算本地 top-k 及分数, 再做全局 merge-top-k, 通信量约为每卡传 $k$ 个 `(score,index)` 而非传全部分数. 这是可扩展的分层选择, 但最终 Sparse MLA 可能要远程读取被选 latent KV. 将候选 KV all-to-all 到 query 所在设备, 或把 query发送到 KV 所在设备计算局部部分, 都会引入不规则通信. 候选热点还会造成链路不均衡. 很多 query 选择同一远端页时, 广播或复制可能划算; 候选分散时按需 gather 更省容量. 性能报告应包含本地/远程候选比例、每设备发送字节和最长链路, 只给单卡 indexer kernel不足以说明集群服务收益.

### 4.3. 训练梯度为什么需要重计算

top-k 对未选位置的离散集合没有常规梯度. DSA 通过独立 KL 教师训练 indexer, 不依赖语言模型 loss 穿过 selector. 但式 (7)的稠密预热需要全行学生分布, 式 (8)的稀疏阶段至少需要选中位置的 indexer logits. 为节省激活, 前向可只保存整数位置和必要统计, 反向时重算对应 $q^I,k^I,w^I$ 分数. 对式 (1), 令 $z_{t,s,j}=(q^I_{t,j})^Tk^I_s$, 活跃指示为 $m_{t,s,j}=1[z_{t,s,j}>0]$. 若上游对 $I_{t,s}$ 的梯度为 $g_{t,s}$, 则:

$$
\frac{\partial\mathcal L}{\partial q^I_{t,j}}
=\sum_sg_{t,s}w^I_{t,j}m_{t,s,j}k^I_s, \tag{11}
$$

$$
\frac{\partial\mathcal L}{\partial k^I_s}
=\sum_{t,j}g_{t,s}w^I_{t,j}m_{t,s,j}q^I_{t,j}. \tag{12}
$$

式 (11)-(12)说明 backward 包含按稀疏分数位置聚合的两组矩阵运算. 如果预热使用全行 KL, 求和范围是全部 causal $s$; 稀疏阶段只在 $\mathcal S_t$ 重算时, 梯度范围相应缩小. ReLU mask也要由重算点积恢复. cuDNN 文档中的 score-grad、三个 GEMM 与 dtype cast 正对应这种拆分. 主模型的语言模型梯度只经过 Sparse MLA 的选中边. 未选 token 不从当前 query 获得直接 attention 梯度, 但仍可通过别的 query、局部关系、残差和 MLP 更新. 继续训练 943.7B token 的作用之一, 就是让模型在长期稀疏梯度图上重新分配信息路径. 用短暂微调替代大规模适配时, 质量边界应单独验证.

**DSA 与 NSA 的选择粒度**

Native Sparse Attention(NSA)将压缩、选择与局部分支组合为原生训练架构, selection 以块为主要单位. DSA 的 selector输出 element-wise token位置, 再让 Sparse MLA读取精确 token. token 级候选更容易逼近稠密 attention 的离散峰值, 也会产生更随机的地址. block 级候选读取连续, 但一个命中 token会带入整块. 比较两者不能停在「token 更准」或「block 更快」. 需要固定物理 KV 字节: DSA 的 $k$ 个 token 可能分布在 $k$ 个 cache line或 page, NSA 的若干块虽然逻辑 token 更多, 实际事务更少. 还要固定训练条件: NSA 从结构内原生训练, DSA 从 V3.1-Terminus 继续训练并用教师对齐. 两者的质量来自不同适配过程. 从 indexer 角度, NSA 的压缩分支可以直接提供块级选择信号, DSA 另建 Lightning Indexer. DSA 的 indexer key cache是额外状态, 换来与主 MLA 解耦的低维 token打分. HISA 又把 block coarse filter加回 DSA selector前端, 说明 token 与 block 并非互斥路线: block适合缩小搜索域, token适合最终精排.

**端到端验收顺序**

第一步验证数学正确性. 在 $n\le32$ 的小张量上显式计算式 (1), 加 causal mask, 用稳定排序得到 top-k, 再与融合 kernel比较分数和索引. 测例覆盖并列分数、序列开头 $t<k$、padding、FP8 cutoff 和多个 batch. top-k 并列时索引顺序可能不同, 应先确认候选值等价. 第二步验证 Sparse MLA 对固定候选的输出. 用同一 $S$ 分别运行朴素 gather attention 与优化 kernel, 检查 logits、行最大值、softmax 分母和输出. 这一步不把 selector近似混入 kernel误差. 第三步才比较 DSA 与稠密 MLA, 记录 recall、概率质量和 hidden state差异. 第四步评测 HISA/MISA 替换. 以原 DSA top-k 为教师, 分别画 recall—索引时间曲线. HISA改变 token搜索域, MISA改变 active heads, 两者预算轴不同, 应换算为实际 indexer MACs与读字节. 层次精排变体还要把第二遍读取算入成本.

算子测试通过后运行端到端任务和服务. 任务覆盖短上下文、长检索、多证据、代码与长推理; 服务覆盖 Prefill/Decode、batch、PD 分离和多卡. 只有 selector质量、Sparse MLA正确性和系统延迟同时通过, 才能把理论 $O(nk)$ 视为落地收益.

**一次 Decode 的逐项成本**

取上下文长度 $t=131072$, indexer heads $H^I=64$, head 维 $d^I=32$, 最终 $k=2048$. 忽略 ReLU 和 reduce, 原 DSA indexer点积数量约为 $tH^Id^I=268435456$ 次乘加. Sparse MLA 主计算只访问上下文的 $2048/131072=1.5625\%$. 这个比例描述主 attention 候选, 不代表整层只剩 1.5625% 时间, 因为 indexer仍扫描全部历史. 若 MISA 每个 query激活 8 个 indexer heads, token打分主体变为约 $33554432$ 次乘加, 理论减少八分之七. router还要读取块池化 key 并选择 heads, top-k 与 Sparse MLA保持不变. 官方 H200 kernel约 3.82 倍而非 8 倍, 正符合 Amdahl 限制: 没缩减的 top-k、访存和固定开销决定上限. 若 HISA 使用块大小 $b=64$, 粗筛需要比较 $2048$ 个块代表. 假设保留 $r=128$ 块, 精排 token数为 $8192$, 是全历史的 $6.25\%$. 若这 8192 个候选覆盖原 DSA top-k 的 99%以上, selector点积显著减少. 但粗筛代表的构造、读取和块 top-k仍要计入. $r$ 降到 32 时精排恰好只有 2048 token, 几乎没有容错空间, 任一错误块都会直接损害最终 recall.

再看 cache 字节. 若 $K^I$ 以 FP8 保存, 每 token 的 indexer key主体约 $d^I=32$ 字节, 131072 token约 4 MiB, 未含 scale和对齐. 单步全扫描可进入较高 cache层级, batch增加后仍会争夺带宽. 主 latent KV若每 token更宽, 只读取 2048 项可显著省带宽. 因此 DSA 的收益来自「便宜表示全扫 + 昂贵表示少读」, HISA/MISA继续压缩前半段.

**LISA 的并联状态怎样核算**

LISA 线性分支通常维护可递推状态, sparse分支维护历史 KV与 indexer K. 对生成位置 $t$, 线性分支输出 $o_t^{lin}$, sparse分支输出 $o_t^{sp}$, gate $g_t$ 融合:

$$
o_t=g_t\odot o_t^{sp}+(1-g_t)\odot o_t^{lin}. \tag{13}
$$

$g_t$ 可以是标量、通道向量或按 head门控, 具体 shape 影响参数和融合成本. 式 (13)说明 sparse漏选并不等于信息完全消失, 线性状态仍对全部历史作压缩聚合. 同时, 线性状态无法保留任意 token的精确内容, 唯一字符串复制仍更依赖 sparse候选. Stage 1先让线性分支与滑动窗口配合逼近教师, 使模型在没有动态 selector时建立稳定长程通道. Stage 2再把固定窗口换成 indexer选择, per-head KL让不同 attention heads分别对齐. 这种顺序减少同时引入线性状态和离散路由的优化难度, 代价是两阶段迁移与更多状态. KV Cache对比必须把线性状态和 sparse cache一起算. 如果 LISA仍保留全历史 sparse KV供 indexer选择, 它降低计算而未必降低容量; 若再做 cache压缩, 需要说明被删除 token是否仍被线性状态概括. 论文报告的 16K推理加速来自完整系统, 不能用式 (13)单独推导显存比例.

量化时两分支敏感性不同. 线性状态误差会递推积累, indexer K误差影响离散 top-k, sparse KV误差影响被选 token的精排和值. 三种误差应分开做消融. 用同一 bit宽统一量化虽然实现简单, 未必是最佳分配.

## 5. Indexer 到底在逼近什么

KL 教师来自当前主 attention, 其分布随模型更新. 预热阶段主模型冻结, 教师稳定; 稀疏阶段主模型变化, selector追逐移动目标. indexer输入 detach 避免语言模型梯度直接改变 selector, 却没有消除教师非平稳. 较小 indexer学习率更新慢, 较大又可能追逐 mini-batch噪声. 跨 head求和降低单 head噪声, 也引入聚合偏差. 假设两个主 heads分别只关注位置 $a$ 与 $b$, 聚合教师给二者各一半质量. $k=1$ 时 selector必然只能满足一个, KL的最优解也无法同时召回. 增大 $k$、按 head分组候选或 per-head监督可以降低偏差, 会增加主 attention读取或 selector输出复杂度.

top-k训练还有暴露偏差. 式 (8)只在当前 selector已选集合内对齐, 未选但教师高分的位置无法直接进入学生 softmax集合. 稠密预热先把 selector带到合理区域, 是避免这一问题的关键. 后续可偶尔扩大候选、加入探索位置或使用层次粗召回, 但这些做法会改变训练成本, 需要明确实验支持. batch中的长序列提供大量 query, 梯度样本数大, 相邻 query又高度相关. 统计有效样本量小于 token数量. 数据应覆盖不同文体、语言、代码和证据结构, 否则 selector会对训练域形成稳定偏好. 部署域迁移时, 先看 recall与 cutoff margin, 再判断是否需要继续对齐.

### 5.1. 负载、尾延迟与可观测性

固定 $k$ 让每个 query 的逻辑候选数相同, 物理工作量仍会变化. 候选可能集中在少数连续 cache pages, 也可能散布到 $k$ 个不同页面. 前者能合并事务和复用 L2, 后者需要大量 gather. profiler应记录唯一 page数、连续段数和每页命中次数, 单看 $k$ 无法解释 Sparse MLA时延. batch内不同请求的上下文长度也影响 top-k. 较短行只需在 `min(k,t)` 个位置中选择, 较长行完整扫描. 若 kernel按最长行对齐, padding分数和无效比较会拖慢整批. cuDNN 接口中的 `seq_lens` 允许逐行限制, 调度器仍要避免把极长请求与大量短请求放进同一低效形状.

线上监控不宜保存用户的完整索引分数, 可以聚合每层 top-k距离分布、cutoff margin、候选页数、indexer时间与 Sparse MLA时间. 质量影子流量可在极低比例运行稠密教师, 计算概率质量覆盖; 正常流量只记录不含内容的统计量. 一旦某类请求的 margin下降或候选更分散, 可以判断问题来自选择不稳定还是访存退化. 尾延迟还受 top-k算法的数据分布影响. 大量相同分数、NaN 或异常 scale 会触发不稳定排序或额外处理. kernel入口应检查有效长度和 scale有限性, 训练阶段监控 indexer logits范围、ReLU零比例与 head权重分布. 一个 head长期零贡献可能是可裁剪冗余, 也可能是训练坍缩, 需要结合教师 recall判断.

**哪些结论不能从 DSA 推出**

DSA 在 DeepSeek-V3.2 的质量结果不能直接证明任意模型都能通过短微调迁移到 token-sparse attention. 官方路径使用特定 MLA表示、128K数据、2.1B token预热和943.7B token稀疏训练. 基座、数据与训练预算改变后, selector对齐和主模型适应程度也会改变. 同样, 2048 是该模型稀疏训练的明确预算, 不是跨模型常数. head维度、上下文长度、任务中的证据密度和 kernel tile变化后, 合理预算都可能变化. 复现应从质量—时延曲线选点, 不能只复制配置数字. 对更短序列, `min(k,t)` 会使早期 query接近稠密; 对更长序列, 固定 $k$ 的保留比例持续下降. 因此长度外推既考验 indexer排序, 也考验固定候选容量能否承载更多潜在证据.

indexer为 $O(n^2)$ 也不表示 DSA 没有价值. 低维、共享 key、FP8 和融合 top-k 让平方项常数远小于主 MLA, 在报告硬件与长度上仍有端到端收益. 同样, 主 attention成为 $O(nk)$ 也不表示整体线性, 因为 indexer、MLP、通信和cache管理仍在. HISA 的高 IoU与 MISA 的高重合说明它们接近 DSA selector, 不能代替对稠密教师和任务的验证. LISA 的任务提升包含线性分支与蒸馏, 不能证明任何 Lightning Indexer都会提高推理能力. 每个数字都要保留模型、长度、硬件和训练口径. 复现报告还应保存 selector 配置与模型权重的绑定关系. Indexer 参数、主模型继续训练步数、候选预算和 kernel版本中任一项改变, 原有 recall与延迟曲线都可能失效. 只保存最终权重而缺少稀疏训练阶段和候选配置, 无法判断另一个实现是否走了相同计算图.

**Indexer 到底在逼近什么**

**排序目标与注意力目标并不相同**

把稠密注意力记为 $a_{tj}$, indexer 分数记为 $s_{tj}$. 最直观的训练方法是让 $s_{tj}$ 拟合 attention logit, 但 DSA 真正关心预算为 $k$ 的候选集合能覆盖多少重要位置. 只要前 $k$ 的次序正确, 分数整体平移、缩放甚至在头部区间内发生小幅形变, 都不会改变后续 Sparse MLA 读到的 token. 反过来, 均方误差很小也不保证 cutoff 两侧的顺序正确. 设教师前 $k$ 集合为 $T_k$, 学生集合为 $S_k$. 集合召回率是

$$
R_k=\frac{|T_k\cap S_k|}{k}. \tag{14}
$$

它直接衡量索引结果是否相同, 却把所有教师位置视为等价. 若漏掉的是教师第 $k$ 名且概率极低的位置, 影响通常小于漏掉第 1 名. 因此还要计算教师概率质量覆盖

$$
M_k=\sum_{j\in S_k}a_{tj}. \tag{15}
$$

当注意力分布尖锐时, $R_k$ 可以一般而 $M_k$ 很高; 当分布平坦时, 很高的 $R_k$ 也可能只覆盖有限质量. 两项指标回答不同问题, 不应互相替代.

**多头教师为何需要压成一个候选集合**

MLA 的不同 query heads 可以关注不同历史位置. 若每个 head独立选 $k$ 个 token, 最坏要读取 $Hk$ 个 KV, 稀疏收益很快被候选并集吃掉. Lightning Indexer 用若干轻量 indexer heads产生分数, 再把它们聚合成共享候选, 本质上是在有限 I/O 预算下求多头注意力的联合覆盖. 可把第 $h$ 个教师头的重要性写成 $a^{(h)}_{tj}$, 聚合目标写成

$$
p_{tj}=\sum_h w_{th}a^{(h)}_{tj},\qquad \sum_h w_{th}=1. \tag{16}
$$

$w_{th}$ 决定哪些头在共享集合中更有发言权. 均匀权重简单, 但一个分布很平的头可能贡献大量低价值位置; 只看最大值会偏向极尖锐头. 可学习聚合能适应任务, 也可能让弱势头长期拿不到候选. 所以检查共享候选时, 除总体概率质量外还要看 per-head 最低覆盖, 否则平均数会掩盖少数头的系统性失配.

一个三头例子能看出冲突. 三个头分别把 $0.9$ 概率放在位置 10、20、30, 预算 $k=2$. 任何共享集合都至少牺牲一个头. 此时 indexer 即使准确找到了三个峰值, 容量约束仍让共享集合无解. 增加 indexer 参数不能突破集合大小, 只能通过增大 $k$、按头分组候选或让主模型在稀疏训练中重新组织注意力来缓解.

### 5.2. ReLU 分解为何适合轻量索引

Lightning Indexer 将多组低维 query-key 点积经过 ReLU 后加权汇总. 若写成

$$
s_{tj}=\sum_{r=1}^{H^I}\alpha_{tr}\operatorname{ReLU}\!\left(\langle q^I_{tr},k^I_j\rangle\right), \tag{17}
$$

每个 indexer head 都像一个简单的匹配专家. ReLU 把负相关直接截为零, 聚合时不会让一个 head 的强负值抵消另一个 head 的正证据. 对 top-k 检索而言, 这种非负证据累加比追求完整的正负相似度更容易解释: 某个位置只要得到若干匹配头支持, 就能进入候选. 它也带来死区. 当某个 head 对绝大多数 token 都输出负点积时, ReLU 后梯度与贡献同时消失. 监控零比例不能只看全局平均, 应分层、分 head、分数据域统计. 若一个 head 在普通文本中沉默、在代码中活跃, 它可能是有用专家; 若所有数据上都沉默, 才更像训练坍缩. $\alpha_{tr}$ 若随 query 变化, 相当于先判断当前问题需要哪类匹配, 再组合 token 分数. 这为 MISA 的 head 路由提供了自然入口: 与其每次计算所有 $H^I$ 个匹配头, 不如先用更便宜的 router 找出少数可能贡献最大的头.

**top-k 边界决定了真正的稳定性**

把排序后的 indexer 分数写为 $s_{(1)}\ge\cdots\ge s_{(n)}$, cutoff margin 定义为

$$
\Delta_k=s_{(k)}-s_{(k+1)}. \tag{18}
$$

当 $\Delta_k$ 很大时, 量化、舍入和 kernel 实现的小误差通常不改变集合; 当 $\Delta_k$ 接近零时, 极小扰动就会交换边界 token. 因此验证 FP8 indexer 时, 只比较分数均方误差意义有限. 更有用的是按 margin 分桶观察集合重合与概率质量损失. 并列分数还牵涉稳定排序. 两个实现都返回合法 top-k, 索引却可能不同. 如果并列位置的教师质量相近, 这不构成数值错误; 若后续测试强制逐索引相等, 反而会制造假失败. 可靠测试应先比较 cutoff 值, 再比较严格高于 cutoff 的必选集合, 最终检查并列集合中返回数量与输出误差. 训练损失连续, top-k 决策离散, 两者之间始终存在缝隙. 稠密蒸馏能把总体分布推近, 但最终部署质量仍由 cutoff 附近的排序决定. 这正是稠密预热、扩大探索候选和稀疏适应阶段缺一不可的原因.

**两阶段训练的因果链**

**先固定教师, 再让模型适应缺失连接**

第一阶段冻结原模型, 让 indexer 观察稠密注意力产生的教师分布. 此时监督目标稳定, 主模型也不会为了迎合一个尚未学会检索的 selector 改变表示. 这一步解决的是「怎样用便宜特征预测原模型会看哪里」. 第二阶段真正启用稀疏 attention, 主模型只能访问候选集合. 即使 indexer 对原教师有很高 recall, 遗漏仍不可避免; 原来依赖多个低概率位置累积的信息也会改变. 继续训练让 query、key、value 与 MLP 共同适应新的连接图, 解决的是「模型怎样在受限图上重新分配信息」. 两阶段看似都在对齐 attention, 优化对象其实不同.

若从第一步就同时更新全部参数, selector 可能追逐不断移动的教师, 主模型又会迁就早期的错误候选. 二者形成反馈: 某位置没被选中, 主模型逐渐不再向它写入有用信息; 教师信号随之变弱, selector 更没有机会把它找回来. 稠密预热先建立较可靠的召回面, 能显著缩小这种自我强化的错误区.

**稀疏集合内归一化会放大遗漏**

稠密 attention 的输出为

$$
o_t=\sum_{j\le t}a_{tj}v_j,
$$

稀疏版本只在 $S_k$ 内重新做 softmax:

$$
\tilde o_t=\sum_{j\in S_k}\frac{a_{tj}}{M_k}v_j. \tag{19}
$$

即使假设候选内 logit 完全相同, 缺失质量 $1-M_k$ 也会让保留位置整体乘上 $1/M_k$. 当 $M_k=0.98$ 时重标定很小; 当 $M_k=0.6$ 时, 保留证据被放大约 1.67 倍. 因而漏选影响不只来自被丢掉的 value, 还来自剩余分布重新归一化. 由三角不等式可给出一个粗界. 若 $\|v_j\|\le V$, 则在上述理想化条件下

$$
\|o_t-\tilde o_t\|\le 2(1-M_k)V. \tag{20}
$$

这个界较松, 但说明概率质量比纯集合 recall 更接近输出误差. 实际系统还有候选内 logit 重算、位置编码与数值误差, 应把式 (20)当作诊断直觉, 不能当作任务性能保证.

**预算课程比固定预算更容易定位问题**

训练早期可以用较大候选预算 $k_0$, 随 indexer 稳定逐步降到目标 $k$. 大预算降低主模型突然失去连接的冲击, 也让边界附近位置仍有梯度通路. 但课程策略会增加训练计算, 并可能让模型迟迟不适应最终预算. 具体退火曲线需要由每个预算下的质量、质量恢复速度与 selector margin共同确定.

另一种做法是固定最终 $k$, 额外采样少量探索 token. 探索集合不必进入正式推理, 只用于估计当前 selector 漏掉的教师质量并提供纠偏信号. 均匀随机对长上下文效率很低, 可按块、距离或教师粗分数分层抽样. 这里的核心是让未选位置仍有被观察的机会, 不是把随机稀疏本身当成检索器.

**动态教师下怎样判断已经收敛**

稀疏训练阶段的教师随主模型更新, 单看训练损失下降可能误判. 需要固定一批长上下文探针, 定期用稠密 MLA 离线重算教师, 同时保存任务输出. 若 indexer KL 下降而固定探针的概率质量覆盖恶化, 说明学生只是追上了已经发生漂移的教师或分布变平, 并没有改善选择.

收敛至少包含三层: indexer 对当前教师的选择稳定; 稀疏模型与稠密参照的 hidden state 差异不再扩大; 长上下文任务在目标预算上恢复. 三者时间尺度不同. selector 很早稳定不代表主模型已经学会在稀疏图上传递信息, 任务恢复也可能来自模型绕过长程依赖. 因此还需要受控检索样本确认远距证据确实被使用.

### 5.3. 从平方索引到层级检索

**DSA 的总复杂度要拆成两项**

对长度 $n$, indexer 维度 $d_I$, 主注意力每个候选的有效计算宽度 $d_A$, 候选数 $k$, 忽略 head 常数后可写成

$$
C_{DSA}\approx c_I n^2d_I+c_A nkd_A. \tag{21}
$$

第二项是人们常说的 $O(nk)$, 第一项仍是低维全序列两两打分. 当 $n$ 继续增长, 第一项最终占主导. DSA 的工程价值来自 $d_I\ll d_A$、低精度缓存与融合算子降低 $c_I$, 不是从数学上消除了平方项. 交叉长度可由两项相等粗略估计:

$$
n_*\approx \frac{c_Akd_A}{c_Id_I}. \tag{22}
$$

若优化后的 indexer 每次乘加更便宜, $c_I$ 较小, $n_*$ 会向更长上下文移动; 若 Sparse MLA 的 gather 很低效, $c_A$ 变大, 主分支反而更久占主导. 因此「瓶颈在哪个长度出现」是硬件与 kernel 共同决定的, 不能只从大 O 符号回答.

**Decode 的线性扫描仍会随历史增长**

自回归 Decode 每一步只有一个新 query, 原始 DSA 仍需与全部 $t$ 个 indexer keys 点积. 单步成本约

$$
C_t\approx c_Itd_I+c_Akd_A. \tag{23}
$$

生成 $m$ 个 token 时, 索引部分累计为 $c_Id_I(mn+m(m-1)/2)$, 主稀疏 attention 约为 $c_Amkd_A$. 当输入很长而输出也长, indexer 扫描会反复读取几乎相同的历史 key. 这正是 HISA 与 MISA 关注 selector 自身的原因: 主 attention 已经稀疏以后, 下一块肥肉就是找候选的过程. Decode 与 Prefill不能共用一句「复杂度降低」概括. Prefill 有大量 query, 可把点积做成高吞吐矩阵运算; Decode 的单 query扫描更容易受内存带宽限制. 相同 MAC 数在两个阶段对应不同时间. 评测必须分别给出首 token 延迟、每 token 延迟与长输出累计时间.

**HISA 的两级召回可以分解**

把历史 token 划为块, 粗筛选中的块集合记为 $B_r$, 其中包含的 token 集合为 $U(B_r)$. HISA 先在块级缩小搜索域, 再在候选块内精确计算 token indexer 分数. 相对原 DSA top-k 的最终召回可分成

$$
R_{final}=R_{block}\cdot R_{token\mid block}, \tag{24}
$$

其中 $R_{block}$ 表示教师 token 落入候选块的比例, $R_{token\mid block}$ 表示进入候选块后精排保留下来的比例. 若第二级直接使用原 DSA 分数并给足 $k$, 后一项通常接近 1, 主要误差来自块粗筛. 这个分解给出明确的调参方向. $R_{block}$ 低时应改块表示、增加候选块或减小块长; 候选域已覆盖教师而最终召回低, 问题才在 token 精排预算、数值或实现. 把两级只报成一个 IoU, 很难知道损失发生在哪.

**块代表为何会漏掉稀有尖峰**

若一个 64-token 块用均值 key 表示, 其中 63 个普通 token 可能淹没唯一关键 token. 假设 query 与关键 key点积为 10, 与其余 key均为 $-0.2$, 块均值分数约为 $(10-12.6)/64=-0.0406$. 这个块可能在粗筛阶段被淘汰, 即使关键 token 按原 DSA 分数本应排第一. 最大池化能保留尖峰, 却难以对向量各维独立取最大后仍保持一个真实 key 的几何意义. 多代表原型、分块最大上界或学习型摘要能改善召回, 都会增加粗筛存储和计算. HISA 的关键不只是「先选块再选 token」, 而是设计一个便宜且对重要 token 有保守覆盖能力的块表示.

边界跨块也是常见问题. 一段语义证据被切在两个块之间时, 每块摘要都可能不突出. 重叠块可提高覆盖, 代价是重复索引; 多尺度块能同时看局部尖峰与长段主题, 代价是层级更复杂. 这些取舍应通过受控的单点证据、多点证据与跨边界样本分别测量.

**层级方法何时反而更慢**

设总块数 $n/b$, 保留 $r$ 块, 粗筛宽度 $d_B$. 单步成本可粗写为

$$
C_{HISA}\approx c_B\frac{n}{b}d_B+c_Irbd_I+c_T, \tag{25}
$$

$c_T$ 包含两次 top-k、索引展开和调度. 当上下文不长、$r b$ 接近 $n$ 或块表示没有驻留缓存时, 新增粗筛层只会增加固定成本. 层级索引应在长上下文、较小候选域和可复用块摘要下启用, 而非无条件替换原 DSA. 动态阈值可以根据粗筛 margin 决定 $r$. 主题明确、头部块分数陡峭时少保留; 分布平坦时扩大候选块. 这样能把算力用在不确定 query 上, 但 batch 内变长工作量会增加 kernel 调度难度. 实际实现可把 $r$ 限制在少数离散档位, 兼顾自适应与规则形状.

**MISA：把索引头也看成专家**

**冗余来自哪里**

式 (17)每次计算全部 indexer heads, 但某个 query 的聚合权重往往集中在少数头. 若 64 个头中只有 8 个产生主要正贡献, 其余 56 个点积对最终 token 排名影响很小. MISA 将这些头视为专家池, 先预测当前 query 需要哪些专家, 再只执行 active heads. 这与 token top-k 是两条正交的稀疏轴. head 路由减少「用多少种匹配规则扫描历史」, token 路由减少「主 attention 读取多少历史位置」. 前者做错会改变所有 token 的 indexer 分数, 后者做错只遗漏具体候选; 因此 head router 虽小, 错误传播范围反而更广.

**活跃头恢复率不能代替 token 恢复率**

假设完整 indexer 中贡献最大的 8 个 heads 为教师活跃集, router 准确找回 7 个, head recall 达 87.5%. 如果漏掉的那个 head 专门检索唯一答案 token, 最终 token top-k 仍可能失败; 反过来, 漏掉一个与其他头高度冗余的专家几乎没有影响. 所以 MISA 既要报告 active-head 重合, 也要报告最终 token 集合与概率质量. 更直接的训练目标是最小化裁剪 heads 后的聚合分数误差或 token 排名损失. 但精确教师需要先算全部 heads, 会削弱训练加速. 实践中可离线生成教师、周期性全算校准, 或让便宜 router 学习完整 indexer 的 top-head 分布. 推理时无需教师, 训练口径却必须说明清楚.
