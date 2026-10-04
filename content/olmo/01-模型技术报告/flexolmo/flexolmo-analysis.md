---
title: "FlexOlmo: 数据拥有者各训各的专家, 推理时按许可拼装"
category: "模型技术报告"
tags: ["OLMo", "技术解析", "MoE", "模型融合", "数据隐私"]
published: true
excerpt: "FlexOlmo 让每个数据拥有者以冻结的公共模型为锚训练一个 FFN 专家, 用域嵌入拼出路由器, 推理时增删专家即可加入或退出数据; 本文按论文, 代码和 HF 配置逐项复算它的训练口径, 基线对比与提取风险."
---

# FlexOlmo: 数据拥有者各训各的专家, 推理时按许可拼装

论文: Weijia Shi, Akshita Bhagia, Kevin Farhat, Sewon Min 等, 「FlexOlmo: Open Language Models for Flexible Data Use」, arXiv 2507.07024v4 (2025-08-23), NeurIPS 2025. 作者来自 Ai2, 华盛顿大学, UC Berkeley, 斯坦福和 MIT. 代码: [github.com/allenai/FlexOlmo](https://github.com/allenai/FlexOlmo); 权重: [allenai/FlexOlmo-7x7B-1T](https://huggingface.co/allenai/FlexOlmo-7x7B-1T) 与 `-RT` 版; 公共模型 `allenai/Flex-public-7B-1T`. 文中的代码行为均以仓库 `main` 分支的训练脚本和 HF `config.json` 为准.

FlexOlmo 要解决的场景是: 若干机构各自持有不能外传的数据, 想合作训练一个语言模型, 而且每份数据在推理时能单独开关. 做法是把 MoE 的专家当作数据的载体, 一份数据只训练一个 FFN 专家和一行路由向量, 其余参数全部来自一个只见过公开数据的 dense 模型. 下面依次讨论架构与参数量, 协调训练和路由初始化, 实验口径和基线, 推理时增删专家, 以及数据提取风险. 公共模型的架构沿用 [OLMo 2](../olmo-2/olmo-2-analysis.md), MoE 的一般训练方式可对照 [OLMoE](../olmoe/olmoe-analysis.md) 和 [MoE 路由与 Top-K 可导性](../../../llm-guide/2-核心原理与架构/2.6-MoE/02-MoE路由与Top-K可导性/02-MoE路由与Top-K可导性.md).

## 1. 问题设定与模型结构

FlexOlmo 的问题设定只有两条约束. 第一条, 训练最终模型 $M_\text{final}$ 时没有任何一方能同时访问全部数据 $\mathcal{D}=\{D_1,\dots,D_n\}$, 每个 $M_i$ 只由 $D_i$ 的拥有者在本地训练. 第二条, 从 $M_\text{final}$ 中删掉 $M_i$, 就等于删掉了 $D_i$ 的全部影响. 第一条决定了训练流程不能有任何跨数据的联合步骤, 第二条决定了 $D_i$ 的信息只能落在可整体摘除的参数里.

这两条约束把联邦学习和 BTX 都排除在外. 联邦学习每一轮都要聚合各方梯度, 共享参数里混着所有数据的信息, 删不掉某一方. BTX 在合并后要用全部数据的并集再训一遍, 违反第一条. 论文选的结构是 MoE: 每份封闭数据对应一个专家, 共享部分 (注意力, 嵌入, 归一化, 输出头) 只用公开数据训练.

![](images/teaser.png)

> 图 1: FlexOlmo 总览, 各数据拥有者以公共模型为锚训练自己的 FFN 与路由嵌入, 推理时拼成 MoE, 原文 Figure 1

**图 1 解析**: 左侧每个数据拥有者手里只有两样东西: 冻结的公共模型和自己的数据. 训练产物是一个 FFN 专家加一行路由嵌入. 右侧推理时, 各方交来的 FFN 并列成专家层, 路由嵌入按行拼成路由矩阵. 图中被模糊处理的 GitHub 专家表示退出: 删掉对应的 FFN 和那一行路由嵌入, 模型其余部分不变, 也不用再训练.

### 1.1. 两条要求如何落到参数上

设公共模型为 $M_\text{pub}$, 在公开数据 $D_\text{pub}$ 上训练. FlexOlmo 每层的 MoE 输出是

$$\mathbf{y}=\sum_{i\in\mathrm{Top}k(r(\mathbf{x}))}\mathrm{softmax}(r(\mathbf{x})_i)\,M_i(\mathbf{x}),\qquad r(\mathbf{x})=\mathbf{W}_r\mathbf{x},\ \mathbf{W}_r\in\mathbb{R}^{(n+1)\times h}.$$

$\mathbf{W}_r$ 的第 0 行是公共专家的 $\mathbf{r}_\text{pub}$, 第 $i$ 行是专家 $M_i$ 的 $\mathbf{r}_i$. 要满足第二条, 与 $D_i$ 有关的参数只能是 $M_i$ 的 FFN 权重, $\mathbf{r}_i$, 以及代码里的偏置 $b_i$. 删掉这三样, 剩下的 $\mathbf{W}_r$ 少一行, softmax 在剩余专家上重新归一化, 前向计算照常进行.

这个性质只在不做可选路由训练 (RT) 时严格成立. RT 会在合并后同时微调 $\mathbf{r}_\text{pub}$ 和所有 $\mathbf{r}_j$, 所用代理集由在 $D_i$ 上训练的分类器挑出; 删掉 $M_i$ 后, 其他路由行仍是 RT 之后的值, 其中留有 $D_i$ 的间接信号. §3.1 第 (2) 条要求「移除 $M_i$ 即完全移除 $D_i$」, 与 §3.3.3 的 RT 并存时, 只有表 1 和表 2 中 no RT 的行满足这条要求. 第 4 节还会回到这一点.

### 1.2. 公共模型与参数量

公共模型 $M_\text{pub}$ 是 OLMo 2 7B 架构: 32 层, $d=4096$, FFN 中间维度 11008, 32 头 MHA, 词表 100352, RoPE $\theta=5\times10^5$. HF 上 `Flex-public-7B-1T` 的 `config.json` 是 `Olmo2ForCausalLM`, 维度与此一致. 它在 public mix 上训练 1T token; 训练脚本 `train_public_model.sh` 把余弦调度的总长设为 5T, 在 1T (step 238419) 处截停, 所以学习率没有衰减到底. 随后另有一段 50B token 的退火 (`OLMoE-2x7B-anneal.py`, 11921 步, 每步约 4.19M token), 数据仍是 public mix. §4.4 没有提到这段退火, 但「全部专家合计 400B token」只有把它算作第 8 份 50B 才对得上: 7 个封闭集各 50B 只有 350B.

按这些维度可以复算参数量. 非 FFN 部分: 嵌入与输出头各 $100352\times4096\approx0.41$B, 注意力 $4\times4096^2\times32\approx2.15$B, 合计约 2.97B. 每个专家的 SwiGLU FFN 是 $3\times4096\times11008\times32\approx4.33$B. 8 个专家总参数 $2.97+8\times4.33\approx37.6$B, 激活 4 个时 $2.97+4\times4.33\approx20.3$B, 与论文的 37B / 20B 一致. 路由矩阵每层只有 $8\times4096$ 个参数, 可以忽略.

HF 发布的 `allenai/FlexOlmo-7x7B-1T` 与论文的最终模型不同. 它的 `config.json` 写 `num_experts`=7, `num_experts_per_tok`=7, `norm_topk_prob`=false, 专家依次是 public, math, news, academic, code, creative, reddit, 没有 Educational Text; `domain_embeddings` 目录也只有这 7 个 `.npy` 文件. 按上面的算法, 7 个专家总参数约 33.3B, 与 README 写的 33B 一致; 7 个全部激活, 每个 token 的计算量相当于 33B 的 dense 模型. 论文 §4.4 的口径是 8 个专家, 激活 4 个, 37B / 20B. README 给出的平均分 52.0 (RT 版 52.2) 与表 2 的 52.4 也来自不同的专家集合, 不能直接比较.

## 2. 协调训练与域嵌入路由

一般的 MoE 让路由器和全部专家在全部数据上联合训练, 路由器学到的是专家之间的相对偏好. FlexOlmo 不允许任何联合步骤, 每个数据拥有者只能看到公共模型和自己的数据, 于是要回答两个问题: 各方独立训练出的 FFN 合在一起为什么还能协作; 路由器的各行分头学出来, 拼在一起为什么还能比较.

论文给出三件工具: 以冻结公共模型为锚的两专家训练, 用域嵌入初始化路由行, 给封闭专家加负偏置. 外加一个可选的 RT 步骤. 下面逐一对照论文和代码.

### 2.1. 以冻结公共模型为锚的两专家训练

最直接的做法是让每个拥有者从 $M_\text{pub}$ 出发, 在 $D_i$ 上继续训练整个 dense 模型, 再想办法合并, 这就是 BTM, model soup 和 BTX 这些基线的起点. 论文指出这样训出来的模型彼此之间, 以及与种子模型之间偏离太大, 合并效果差. 表 1 的消融「no training to coordinate」平均 38.8, 比不做 RT 的 FlexOlmo (46.7) 低 7.9 分, 是所有消融里掉得最多的一项; 文中没有说明这一行合并时用的是哪种路由.

FlexOlmo 的做法是: 对每个 $D_i$ 构造一个只有两个专家的 MoE, 两个专家都复制自 $M_\text{pub}$ 的 FFN, 冻结其中一个 (公共专家) 和全部注意力, 嵌入, 归一化, 输出头, 只训练另一个专家和它的路由行 $\mathbf{r}_i$. 代码 `FreezeTransformerTrainModule` 的实现方式是在每步把专家参数和路由权重前一半的梯度置零, 所以 $\mathbf{r}_\text{pub}$ 也是冻结的. 这样每个封闭专家看到的输入分布, 都是同一套冻结注意力产生的隐藏状态; 它学到的是「在公共专家旁边补充什么」. 合并时所有专家共享同一套注意力, 不需要像 BTX 那样对各模型的注意力取平均.

训练脚本 `train_expert_model.sh` 里的设置是: 学习率 $9\times10^{-4}$, warmup 2000 步, 50B token, 路由 `top_k`=2. 两个专家选两个, 每个 token 都同时经过公共专家和封闭专家, 路由器只决定两者的混合权重. 这也意味着 `olmoe_nx7b` 默认带的负载均衡损失 (系数 0.01) 在这一阶段不起作用: 当 $k$ 等于专家数时每个专家的分配比例 $f_i$ 恒为 1, 损失 $N\sum_i f_iP_i=2\sum_iP_i=2$ 是常数, 梯度为零. `capacity_factor` 1.2 同样不会触发丢 token.

### 2.2. 用域嵌入初始化路由行

路由行分头训练, 拼起来能否互相比较, 取决于它们的起点. FlexOlmo 用现成的文本嵌入模型 GritLM-7B 给每个数据源采样 1000 篇文档, 取嵌入均值作为初值:

$$\mathbf{r}_i=\frac{1}{|S_i|}\sum_{d_k\in S_i}\mathbf{E}(d_k),\qquad S_i\subset D_i,\ |S_i|=1000.$$

代码 `get_domain_embeddings.py` 以 GritLM 的 embedding 模式编码, 丢掉含 NaN 的行后求均值; `dense_to_expert_moe.py` 把拼好的 `concat_embed` 直接复制进每一层的路由权重. GritLM-7B 的嵌入维度恰好是 4096, 与 OLMo 2 7B 的隐藏维度相同, 所以可以原样拷贝.

这个初始化有两点要注意. 一是 32 层用的是同一个向量, 而各层隐藏状态的分布差别很大. 二是 GritLM 的嵌入空间和 FlexOlmo 隐藏状态的空间没有对齐关系, 初值只提供「不同领域的路由行彼此分开」这一点; 训练开始后 $\mathbf{r}_i$ 会在 LM 隐藏状态上重新学习. 表 3 比较了两种初值: 用公共模型自己的隐藏状态均值初始化 (Public) 平均 43.5, 用 GRIT 初始化 46.7, 差距主要来自 Code4 (8.7 对 18.2) 和 AGIEval (40.2 对 44.8). 文中没有给出 Public 初值取的是哪一层的隐藏状态.

§5.1 说随机初始化时最终学到的路由嵌入彼此高度相似, 合并后难以区分专家. 这个现象支持用域嵌入初始化, 但表 1 并没有单独隔离它: 消融行只有「no bias」(45.8) 和「no domain embedding init, no bias」(44.4), 两者相差 1.4 分可以归到初始化上, 前提是偏置与初始化之间没有交互; 「只去掉初始化, 保留偏置」这一行不存在.

### 2.3. 负偏置: 论文写法与代码实现

两专家训练只学到「$M_i$ 对 $M_\text{pub}$」的两两比较, 从没见过 $M_1$ 和 $M_2$ 竞争. 论文给每个封闭专家加负偏置 $b_i$, 并写成选择规则:

$$\mathbf{r}_i\cdot\mathbf{x}+b_i>\mathbf{r}_\text{pub}\cdot\mathbf{x}\quad\forall i\in\{1,\dots,n\},$$

满足时选 $M_i$, 否则默认 $M_\text{pub}$. 附录 D 把路由看成 $n+1$ 类分类, 训练时只学 $n$ 个二分类器 $f_i$, 推理时取 $F(\mathbf{x})=\arg\max_i s_i(\mathbf{x})$. 冻结 $\mathbf{r}_\text{pub}$ 让所有二分类器共用同一个参照, 负偏置把每条决策边界 $h_i$ 推向 $C_i$ 的数据点, 使 $f_i$ 学到的更接近「$C_i$ 对非 $C_i$」.

![](images/negative_bias.png)

> 图 5: 负偏置使 $C_\text{pub}$ 与 $C_1$ 之间的决策边界向 $C_1$ 收缩, 原文 Figure 6

**图 5 解析**: 图中两类点分别是公共数据和封闭数据 $C_1$. 不加偏置时, 任何把两类分开的直线都满足约束, 边界可以离 $C_1$ 很远, 把大片空白区域划给 $C_1$. 加上 $b_1<0$ 后, 只有 $\mathbf{r}_1\cdot\mathbf{x}$ 明显大于 $\mathbf{r}_\text{pub}\cdot\mathbf{x}$ 的点才归 $C_1$, 边界贴近 $C_1$ 的点云. 合并后, 一个既不像 $C_1$ 也不像 $C_2$ 的输入更可能落回公共专家, 而不是被某个封闭专家「顺手」接走.

代码与这段描述有三处差别. 第一, `MoERouterWithExpertBias` 里 $b_i$ 是可学习参数 (`nn.Parameter`, 形状为专家数减一), 前向时取 `torch.minimum(b, 0)` 保证非正, 加到除公共专家外各专家的 logit 上; 论文只说「加负偏置」, 没有说它可学习, 也没有给初值或训练后的数值, 代码里该参数用 `torch.empty` 创建. 第二, 训练时 `top_k`=2, 两个专家都参与计算, 偏置只改变 softmax 权重, 不存在「否则默认 $M_\text{pub}$」的硬选择; 附录 D 的二分类图景只对应 top-1. 第三, 公开脚本构建路由器用的是 `olmoe_nx7b`, 带偏置的 `with_expert_bias` 一行被注释掉, 运行名却写着 `top2_grit_learnbias`; HF 版的 `FlexOlmoTopKRouter` 也没有偏置字段. 表 1 中去掉偏置让不做 RT 的 FlexOlmo 从 46.7 降到 45.8, 但从发布的权重看不出偏置是否以某种形式并入了路由行.

### 2.4. 可选的路由训练

RT 的前提是数据拥有者愿意在公开数据里挑出与自己数据相似的样本. 每个拥有者训练一个区分 $D_i$ 与 $D_\text{pub}$ 的二分类器: 以 $3\times10^{-6}$ 的学习率微调 2200 万参数的 snowflake-arctic-embed-xs, 训练集是两边各 25 万篇的平衡样本, 准确率很快超过 95%. 再从 $D_\text{pub}$ 中选出分类器最认为属于 $D_i$ 的样本作为代理集 $\hat D_i$, 要求 $|\hat D_i|\ll0.01\times|D_i|$. §3.3.3 原文把这里的公开数据集写作 $M_\text{pub}$, 按上下文应为 $D_\text{pub}$.

合并后, 在 $\hat D_1,\dots,\hat D_n$ 与 $D_\text{pub}$ 的均匀混合上共训练 5B token, 只更新路由矩阵. 脚本 `OLMoE-4x7B.py` 冻结全部专家, 路由 `top_k`=4, 学习率在脚本里被覆盖为 $2\times10^{-3}$, warmup 100 步, `lb_loss_weight`=0. 关掉负载均衡说明作者希望路由按领域偏斜, 不追求专家间均匀.

RT 的收益在两张表里不一致. 表 1 的四专家设定里, RT 把平均分从 46.7 提到 47.8. 表 2 的八专家设定里从 51.3 提到 52.4, 但分项有升有降: GEN5 从 53.2 升到 59.8, BBH 从 42.1 升到 46.4; MMLU Pro 从 34.0 降到 30.9, Math2 从 52.1 降到 48.5, Code4 从 18.6 降到 17.2. 代理集只能从 DCLM 网页里挑, 而数学和代码的封闭集 (Dolmino Math, FineMath, StarCoder) 与网页文本差别较大, 文中没有分析这几项下降的原因. 加上 1.1 节所说 RT 削弱了退出保证, RT 更适合当作一个可选的精度旋钮, 而不是默认配置.

## 3. 实验口径与基线对比

FlexOlmo 的实验分三层: 四专家 (public, math, educational text, code) 的小规模消融与基线对比 (表 1), 八专家完整设定 (表 2), 以及在 OLMo 2 7B 的 4T checkpoint 上加两个专家的扩展实验 (表 4). 三层用的样本数不同: 表 1 每个子任务 100 个样本, 表 2 和表 4 每个子任务 1000 个样本, 所以表 1 与表 2 的同名列不能直接相减.

基线都从同一个 $M_\text{pub}$ 出发, 在每个封闭集上不改架构地继续训练出 dense 模型, 再用不同方法合并; 只有 Unrestricted MoE 是在全部数据的并集上训练的参照上界. 这一节先交代数据和评测口径, 再逐个看基线.

### 3.1. FlexMix 数据与评测任务

FlexMix 由一个 Public Mix 和七个封闭集组成, 统计在附录 B 的图 5 (一个以图编号的表格): Public Mix 2.37T token, News 158.0B, Creative Writing 201.9B, Math 20.3B, Code (StarCoder) 83.0B, Academic 58.6B, Educational Text 102.2B, Reddit 9.9B. 七个封闭集合计 633.9B. Public Mix 是 DCLM-Baseline 去掉新闻和创意写作后的部分, News 与 Creative Writing 则是用 WebOrganizer 的分类器从 DCLM-Baseline 里切出来的, 三者来源相同而互不重叠. Reddit 经过了检索筛选子版块和 GPT-4o mini 改写成学术问答两步处理, 附录 B 报告改写让 MC9 从 0.74 升到 0.76, MMLU 从 0.62 升到 0.66.

按每个专家 50B token 计, 各封闭集的训练轮数差别很大: Math 约 $50/20.3\approx2.46$ 轮, Reddit 约 $50/9.9\approx5.1$ 轮, Academic 不到 1 轮, Creative Writing 约 0.25 轮. §5.3 的脚注 4 说数学是最小的模拟封闭集, 数学专家训了三轮; 按图 5 的统计, 最小的封闭集是 Reddit, 数学专家约训 2.5 轮. 附录 B 正文写「Table 5 presents the statistics of our training data」, §4.1 写「Figure 5 in §B」; 统计实际在图 5, 表 5 是评测基准表.

评测按 OLMES 标准. §4.2 说 31 个任务, 10 个类别, 但编号里 BBH 和 Math2 都是 (6), 表 2 实际有 11 列类别: MC9, GEN5, MMLU, MMLU Pro, AGIEval, BBH, Math2, NewsG, PoemG, SciRIFF5, Code4. 把 AGIEval 和 BBH 各算一个任务时, $9+5+1+1+1+1+2+1+1+5+4=31$, 与「31 个任务」一致. 表 5 还列了 NarrativeQA, 它不属于 GEN5, 也不在 31 个任务里. SciRIFF 的指标一栏是「—」, 附录 C 只说报告五个子任务的平均, 没有说明各子任务用什么指标. NewsG 和 PoemG 由 Llama-3.3-70B-Instruct 打 0 到 5 分再换算到 100, 每条提示采 5 个续写取平均.

### 3.2. 四专家消融与基线

表 1 的基线可以分成三类. 权重合并: model soup 等权 39.6, 按测试输入对数似然 softmax 加权 42.2. 输出集成: BTM 43.4, 按各模型在测试输入上的负对数似然做温度 softmax, 可只保留 top-k 再归一化, 逐 token 加权 logit. 选一个模型: 用 OLMo 或 Llama 做提示分类器把整个查询交给一个专家, 分别为 40.8 和 40.0. 另有 BTX 40.0: 专家 FFN 原样搬进 MoE, 注意力等非专家参数取平均, 合并后只在公开数据上训练.

FlexOlmo 47.8, 比最好的 BTM 高 $47.8/43.4-1\approx10.1\%$, 与摘要一致. 差距最大的是 Math2: BTM 21.2, FlexOlmo 50.7. BTM 在 Code4 上反而更高 (22.3 对 17.3). BTM 的权重按整条输入算一次, 生成时所有 token 共用; FlexOlmo 每层每个 token 都可以换专家, 论文把增益归到这种细粒度路由上, 图 2 的分层路由模式支持这个解释. BTX 偏低的原因论文归为「只在公开数据上训练合并后的模型并非最优」, 这正是 FlexOlmo 设定下 BTX 不得不做的妥协: 原始 BTX 的联合训练要求访问全部数据.

摘要, 引言和 §5.1 都说 FlexOlmo 比公共模型平均相对提升 41%. 按表 1 的 Avg. 列复算是 $47.8/36.9-1\approx29.5\%$, 不做 RT 时 $46.7/36.9-1\approx26.6\%$; 按表 2 是 $52.4/42.4-1\approx23.6\%$. 改成逐类别相对提升再平均, 表 1 约 279%, 表 2 约 189%, 都由 Code4 从 1.0 左右涨到 17 左右这一项主导; 几何平均分别约 95% 和 67%. 这些口径都得不到 41%, 文中也没有给出算法. §5.1 还说 FlexOlmo 在完整设定下「追平或超过」BBH, Math2, NewsG, PoemG, SciRIFF5, Code4 上的专门专家; 表 2 里 Math2 是 48.5 对数学专家 53.1, PoemG 是 62.2 对创意写作专家 67.5, Code4 是 17.2 对代码专家 21.0, 这三项都低于对应专家.

### 3.3. 与 Unrestricted MoE 和 OLMo 2 的比较

Unrestricted MoE 从公共 dense 模型 upcycle, 在全部数据上联合训练. 论文说同样数据量下它的 FLOPs 约为 FlexOlmo 的 2 倍, 所以给出两个点: 1× FLOPs, 0.5× 数据时 46.3, 低于 FlexOlmo 的 47.8; 2× FLOPs, 1× 数据时 51.5, 高于 FlexOlmo. 文中没有给出 Unrestricted MoE 的专家数, top-k 和负载均衡设置, 「约 2 倍」也就无法从结构上复算. 能确定的是, 在数据隔离的约束下, FlexOlmo 与看到全部数据的 MoE 相比还差 3.7 分.

表 4 把配方用到 OLMo 2 7B 的 4T token pre-anneal checkpoint 上: 公共专家退火 50B, 再在数学和代码上各训 50B 专家, 三个专家全激活. 对照的 OLMo-2-1124-7B 同样从这个 checkpoint 出发, 用 3 次 50B 退火再做 model soup (见 [OLMo 2 解析](../olmo-2/olmo-2-analysis.md)), token 数同为 150B. FlexOlmo 平均 52.8, OLMo 2 7B 49.8, 差距集中在 BBH (53.1 对 49.8), Math2 (51.0 对 42.6), Code4 (18.9 对 13.3).

表 4 的两个 FLOPs 说法可以复算. 推理侧, 表注写三专家的推理 FLOPs 是 dense 的 2.5 倍. 每 token 的矩阵乘参数量, dense 为注意力 2.15B + FFN 4.33B + 输出头 0.41B $\approx6.89$B; 三个 FFN 时为 $2.15+3\times4.33+0.41\approx15.55$B, 比值约 2.26, 再计入与上下文长度相关的注意力项, 比值还会更低. 训练侧, 表注写「equivalent training FLOPs」, 按 token 数相等成立; 按计算量, 专家阶段是两专家全激活的 MoE, 前向约 $2\times11.2$ GFLOP/token, 反传的激活梯度与前向相当, 权重梯度只算可训的 4.33B, 合计约 $22.4+22.4+8.7\approx53.5$ GFLOP/token, 而 dense 退火约 $6\times6.89\approx41.3$. 公共专家退火加两个专家阶段合计约为 OLMo 2 三次退火的 $(41.3+2\times53.5)/(3\times41.3)\approx1.2$ 倍. 表 4 Pre-anneal 一行的八项均值为 42.99, 表中印 43.1.

## 4. 推理时增删专家

FlexOlmo 的「灵活」落在推理阶段: 一个用户能用哪些数据, 就加载哪些专家. 机制上它与 MoE 推理没有区别, 只是专家集合可以按请求改变. 这一节讨论三件事: 路由在各层怎样分配 token, 激活专家数怎样影响结果, 删掉一个专家时其他能力是否受损.

这些分析都在八专家完整设定上做, 激活 4 个专家. HF 发布版是 7 专家全激活, 下面的结论对应论文口径.

### 4.1. 路由模式

图 2 展示四种输入 (Textbook, Creative, Math, News) 在第 1, 16, 32 层上各专家的路由比例.

![](images/router.png)

> 图 2: 不同领域输入在第 1, 16, 32 层上各专家的路由比例, 灰线为均匀路由, 原文 Figure 2

**图 2 解析**: 每一行是一种输入, 每一列是一层, 柱子是各专家的 Routing probability (%), 灰色横线在 50, 对应 8 选 4 的均匀值 $4/8$. 数学输入在三层上都大量走 math 专家, 新闻输入走 news 专家, 公共专家在各行都很高, 与「封闭专家学的是对公共专家的补充」相符; 同一输入在不同层的专家组合不同. 图中 Layer 1 数学一行 math 专家的柱高约 170, 而 8 选 4 时单个专家按 token 计的选中率上限是 100%, 文中没有说明纵轴是否另做了归一化. 图例的 Textbook 对应正文的 Educational Text.

分层换专家是 FlexOlmo 与提示路由的根本区别. 提示路由一次把整条查询交给一个 dense 模型, 分类器选错就全错, 表 1 里 OLMo 分类器版 Math2 41.5, Llama 分类器版只有 21.5. FlexOlmo 在每层对每个 token 重新挑 4 个专家, 一道数学应用题里的叙述部分可以走公共或教育专家, 公式部分走数学专家.

### 4.2. 激活专家数

图 3 固定八个专家, 改变推理时激活的专家数, 看 MMLU.

![](images/active_expert.png)

> 图 3: 激活专家数对 MMLU 的影响, 原文 Figure 3

**图 3 解析**: 激活 1 个专家时 MMLU 约 50.9, 2 个约 54.5, 4 个约 60.4, 8 个仍约 60.4. 从 4 个往上没有收益, 所以最终模型取 top-4, 每 token 激活约 20B 参数. 只激活 1 个时比 dense 公共模型的 55.9 (表 2) 还低, 合并后的模型依赖多个专家的组合: 训练时每个封闭专家始终与公共专家一起出现, 单独使用某一个专家的情形在训练中从未出现过.

这张图只覆盖 MMLU 一项. 数学, 代码这类依赖单个封闭专家的任务, 激活数从 4 增到 8 是否同样无益, 文中没有给出. HF 发布版取 `num_experts_per_tok`=7, 即全部专家都激活, 与论文的 top-4 不同.

### 4.3. 退出一个专家

退出的操作是删掉 $M_i$ 的 FFN 和 $\mathbf{W}_r$ 的第 $i$ 行, 剩下的专家照常做 softmax 和 top-k, 不需要任何训练. 图 4 删掉 news 专家后比较四项指标.

![](images/opt_out.png)

> 图 4: 删除新闻专家前后 NewsG, MC9, Code4, Math2 的变化, 原文 Figure 4

**图 4 解析**: 完整模型与删掉 news 专家的模型相比, NewsG 从 80.7 降到 71.5, MC9 从 70.8 降到 70.2, Code4 持平于 17.2, Math2 从 48.5 升到 50.2. 领域内任务下降明显, 其他任务基本不受影响. 删掉 news 专家后的 NewsG 71.5 低于公共 dense 模型的 76.0 (表 2): 原本分给 news 专家的权重被重新分到其他封闭专家上, 合并模型在新闻续写上反而不如只见过公开数据的模型. Math2 在删掉 news 专家后上升 1.7 分, 文中没有分析原因.

这个实验验证了退出「不伤及无关能力」, 但没有验证退出「删干净了数据」. 一来图 4 完整模型的四个数与表 2 带 RT 的 FlexOlmo 一行完全相同, 用的是 RT 版, 1.1 节已经说明 RT 后其他路由行带有 news 代理集的信号; 二来 NewsG 只衡量续写质量, 不衡量模型对新闻原文的记忆. 要验证删干净, 需要在删除前后对 news 数据做第 5 节那样的提取或成员推断测试, 文中没有做.

## 5. 数据提取风险

FlexOlmo 让数据拥有者共享权重而不是数据. 权重本身是否会泄露数据, 是这套方案能否被采用的前提. §5.3 用 Carlini 等人的训练数据提取攻击做了一次实测, 并据此建议敏感数据配合差分隐私训练.

这一节先列论文口径和结果, 再对照仓库里的 `extraction_analysis.py` 看实际实现.

### 5.1. 实验口径与结果

论文口径: 从数学数据采样 10,000 篇文档, 每篇取 32 token 前缀, 用 top-k 50, top-p 0.95, 温度 1.0 采样 256 token 续写, 每个前缀采 10 次; 任一续写与原文的归一化 Levenshtein 相似度不低于 0.9 即算提取成功. 实现先在一个对小数据集训了 100 轮的过拟合模型上验证, 提取率 60%. 选数学数据的理由见 3.1 节, 按图 5 的统计它并不是最小的封闭集.

结果是: 没见过数学数据的公共模型 0.1%, 数学专家 (dense) 1.6%, 包含数学专家的 FlexOlmo 0.7%. 10,000 篇文档下, 0.7% 对应约 70 篇, 二项分布标准误约 $\sqrt{0.007\times0.993/10^4}\approx0.08\%$, 三个数之间的差距远大于抽样误差. 公共模型的 0.1% 不为零, 脚注 5 的人工检查把它归为前缀本身决定了续写: 即使从没见过该文档, 模型也会生成与原文吻合的文本. FlexOlmo 比 dense 专家低, 与路由把数学专家的权重稀释在 4 个专家之间一致.

### 5.2. 代码实现与论文口径的差别

`extraction_analysis.py` 与正文有三处不同. 第一, 前缀从文档内随机位置 `idx` 截取, 不是从开头. 第二, 用作比对的「原文」是从 `idx` 开始的 256 token 窗口, 包含那 32 token 前缀; 生成调用 `model.generate(max_length=256)`, `max_length` 包含输入, 实际只新生成 224 token, 解码结果也包含前缀. 两段文本共享 32 token 前缀, 相似度的下限因此被抬高; 按 token 粗算, 前缀约占比对长度的 $32/256=12.5\%$. 第三, `extraction_analysis.sh` 的默认 `NUM_PREFIXES=100`, 后面注释着 `#00`, 改成 10000 才是论文的口径; 源数据按 1% 比例抽样载入.

这些差别不改变「提取率很低」的结论方向, 但影响数字的可比性: 按正文复现得到的提取率与按仓库默认脚本跑出的数字不是同一个口径. 论文没有报告不同阈值或不同采样次数下的曲线, 也没有给出 FlexOlmo 在提取实验中激活了几个专家.

### 5.3. 残余风险与差分隐私

论文的结论是: 只要模型里有在某份数据上训练过的权重, 就可能有一小部分数据可被提取; 能接受这种少量泄露的拥有者可以直接用, 含隐私或敏感信息的拥有者应先用差分隐私训练专家. 差分隐私只作用于 $M_i$ 和 $\mathbf{r}_i$ 的本地训练, 与 FlexOlmo 的合并流程正交, 各方可以各自决定. 文中没有给出 DP 训练的专家在合并后的性能, 这部分代价需要另行评估.

提取攻击之外还有两类风险没有覆盖. 一是成员推断: 判断某篇文档是否在 $D_i$ 中, 所需信号比逐字复现弱得多, 0.7% 的提取率不代表成员推断同样困难. 二是 RT 的代理集分类器: 它在 $D_i$ 上训练, 准确率超过 95%, 本身就编码了 $D_i$ 的分布特征; 若拥有者把分类器或代理集交给协调方, 泄露面会大于单个专家. 这两点加上 4.3 节的退出验证, 是把 FlexOlmo 用在真实封闭数据之前需要补的实验.

## 参考文献

1. Shi et al. FlexOlmo: Open Language Models for Flexible Data Use. arXiv:2507.07024, NeurIPS 2025.
2. Allen Institute for AI. FlexOlmo 代码仓库. https://github.com/allenai/FlexOlmo
3. Allen Institute for AI. FlexOlmo-7x7B-1T 模型卡与 config.json. https://huggingface.co/allenai/FlexOlmo-7x7B-1T
4. Team OLMo. 2 OLMo 2 Furious. arXiv:2501.00656.
5. Sukhbaatar et al. Branch-Train-MiX: Mixing Expert LLMs into a Mixture-of-Experts LLM. arXiv:2403.07816.
6. Li et al. Branch-Train-Merge: Embarrassingly Parallel Training of Expert Language Models. arXiv:2208.03306.
7. Wortsman et al. Model soups. ICML 2022.
8. Muennighoff et al. Generative Representational Instruction Tuning (GritLM). arXiv:2402.09906.
9. Carlini et al. Extracting Training Data from Large Language Models. USENIX Security 2021.
10. Muennighoff et al. OLMoE: Open Mixture-of-Experts Language Models. arXiv:2409.02060.
