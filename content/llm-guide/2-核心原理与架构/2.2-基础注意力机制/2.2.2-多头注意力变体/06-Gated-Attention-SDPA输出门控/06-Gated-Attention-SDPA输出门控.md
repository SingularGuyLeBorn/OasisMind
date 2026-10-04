---
title: "06 · Gated Attention: SDPA 输出上的逐头 sigmoid 门"
published: true
tags: ["Gated-Attention", "SDPA", "sigmoid", "attention-sink", "Qiu", "NeurIPS-2025"]
excerpt: "Gated Attention 在每个注意力头的 SDPA 输出之后乘一个由当前 token 隐状态算出的 sigmoid 门. 这一步补上 Value 投影和输出投影之间缺的非线性, 让门值变得稀疏且随 query 变化, 并把首 token 的平均注意力占比从 46.7% 压到 4.8%."
---
# 06 Gated Attention: SDPA 输出上的逐头 sigmoid 门

Qiu, Wang, Zheng, Huang 等人在 [Gated Attention for Large Language Models](https://arxiv.org/abs/2505.06708) (NeurIPS 2025 Oral) 里只改了注意力子层的一处: 每个头做完 Scaled Dot-Product Attention (SDPA) 得到输出 $Y$ 之后, 先乘一个 head-specific 的 sigmoid 门, 再拼头进输出投影 $W_O$. 他们在 15B 总参 / 2.54B 激活的 MoE 和 1.7B dense 模型上比较了 30 多种门控变体, 结论是这个位置效果最好, 额外参数和墙钟时间都很小.

## 1. 问题与门的候选位置

### 1.1 $W_V$ 与 $W_O$ 可以合成一个低秩矩阵

标准多头注意力里, 第 $k$ 个头对位置 $i$ 的输出写成

$$
o_i^k=\Bigl(\sum_{j=0}^{i}S_{ij}^k\,X_jW_V^k\Bigr)W_O^k=\sum_{j=0}^{i}S_{ij}^k\,X_j\bigl(W_V^kW_O^k\bigr),
\tag{1}
$$

其中 $S_{ij}^k$ 是 softmax 之后的注意力分数, $W_V^k\in\mathbb R^{d_{model}\times d_k}$, $W_O^k\in\mathbb R^{d_k\times d_{model}}$. softmax 只作用在分数上, 对 $V$ 来说整个求和是线性的, 所以 $W_V^kW_O^k$ 可以合成一个 $d_{model}\times d_{model}$ 的矩阵. 它的秩不超过 $d_k$, 而 $d_k<d_{model}$. FFN 里两次线性投影之间有激活函数, 注意力子层的这两个矩阵之间没有.

### 1.2 attention sink 与 massive activation

第二个问题是 attention sink. 训练好的 LLM 里, 很多头会把大部分注意力分给第一个 token, 不管这个 token 的语义是否相关. Qiu 等人在 15A2B MoE 基线上统计到, 首 token 的平均注意力占比是 46.7%, 第 21 层高达 83%.

和 sink 相伴的是 massive activation: 隐状态里少数维度的数值比中位数大几个数量级. 论文附录 A.3 观察到基线从第 6 层的 FFN 输出开始出现这种值, 之后沿残差流一路传下去. 在 BF16 训练里, 少数极大的值会放大舍入误差, 学习率一高就容易出现 loss spike.

Sun 等人的 [Massive Activations](https://arxiv.org/abs/2402.17762) 在 LLaMA2-7B 上测到最大激活 2622, 中位数约 0.2, 集中在固定的两个维度, 把这些值置零模型会崩, 换成均值几乎无损. 他们把这类值解释为模型内部的固定偏置. Gu 等人的 [When Attention Sink Emerges](https://arxiv.org/abs/2410.10781) 发现 sink 在预训练里普遍出现, 和 softmax 的「权重和必须为 1」有关: 去掉归一化的 sigmoid 注意力在 1B 规模内不出现 sink.

### 1.3 门的统一写法

论文把所有变体写成同一个式子:

$$
Y'=g(Y,X,W_\theta,\sigma)=Y\odot\sigma(XW_\theta).
\tag{2}
$$

$Y$ 是被门控的张量, $X$ 是这一层经过 pre-norm 的隐状态, $W_\theta$ 是门的投影参数, $\sigma$ 默认取 sigmoid. 门分数和 $Q,K,V$ 一样从 $X$ 线性投影得到. 论文沿五个方向扫变体:

1. **位置**: 门放在哪一个张量上.
2. **粒度**: elementwise 每个维度一个门值, headwise 每个头一个标量.
3. **是否分头**: head-specific 每个头一套 $W_\theta$, head-shared 所有头共享.
4. **形式**: 乘性 $Y\odot\sigma(\cdot)$ 或加性 $Y+\sigma(\cdot)$.
5. **激活**: sigmoid, SiLU 或恒等.

### 1.4 五个候选位置与参数量

一个注意力子层从输入到输出依次经过 $X$, $Q/K/V$ 投影, $QK^\top$ logits, softmax 权重, SDPA 输出 $Y$, $W_O$ 输出 $Z$. 论文给其中五个位置编号:

| 编号 | 张量 | 门值随谁变 | 额外参数 | 15A2B PPL | MMLU |
|---|---|---|---:|---:|---:|
| 基线 | 无门 | 无 | 0 | 6.026 | 58.79 |
| $G_1$ | SDPA 输出 $Y$ | 当前 query token | 201M | **5.761** | **60.82** |
| $G_2$ | Value 投影 $V$ | 被读的 key/value token | 25M | 5.820 | 59.17 |
| $G_3$ | Key 投影 $K$ | 被读的 key token | 25M | 6.016 | 59.18 |
| $G_4$ | Query 投影 $Q$ | 当前 query token | 201M | 5.981 | 58.74 |
| $G_5$ | $W_O$ 之后的 $Z$ | 当前 query token | 100M | 6.017 | 59.41 |

表中都是 elementwise, head-specific, 乘性 sigmoid. $G_5$ 和 $G_1$ 一样随 query 变, 但它在 $W_O$ 之后, $W_V$ 和 $W_O$ 仍然能合并, 补不上 1.1 节的那段非线性. $G_4$ 门在 softmax 之前, 改的是 logits 的形状. $G_2$ 和 $G_3$ 的门值由被读的那个 token 决定, 同一个 key 对所有 query 给出同一个缩放.

![五个门控位置: Q, K, V 投影后 (G4, G3, G2), SDPA 之后输出投影之前 (G1), 输出投影之后 (G5)](./images/fig-gated-attn-g1-after-sdpa.png)

> 图 1: 注意力子层里五个门控位置. 绿框的 $G_1$ 在 SDPA 和拼头之间.

**图 1 解析**: 主干从左到右是 $Q,K,V$, SDPA, $G_1$ 门, 拼头, $W_O$ 输出投影. $G_1$ 框里写着门的公式, 门分数来自 pre-norm 隐状态 $X$. 右侧虚线框列出其余四个位置, 虚线箭头指向它们在主干上的挂点: $G_4$ 在 $Q$ 后, $G_3$ 在 $K$ 后, $G_2$ 在 $V$ 后, $G_5$ 在 $W_O$ 后. $G_2$ 的注释和位置表一致, 比 $G_3$ 到 $G_5$ 好, 比 $G_1$ 差. $G_5$ 的注释点出它的问题: 门在 $W_O$ 之后, $W_V$ 和 $W_O$ 之间仍没有非线性.

门的参数量取决于张量形状和粒度. 15A2B 基线有 $q=32$ 个 query 头, $k=4$ 个 KV 头, 头维 $d_k=128$. 对长度 $n$ 的输入, $G_1$ elementwise 门的分数形状是 $n\times q\times d_k$, 多出 201M 参数. $G_2$, $G_3$ 门在 KV 头上, 形状 $n\times k\times d_k$, 只多 25M. headwise 门每个头只出一个标量, $G_1$ headwise 的形状是 $n\times q$, 只多 1.6M. elementwise 和 headwise 在 PPL 上相差不大 (5.761 vs 5.792), 后者参数少两个数量级.

## 2. 为什么 G1 有效: 非线性, 稀疏, 没有 sink

### 2.1 非线性

把门加在 $G_2$ 或 $G_1$ 上, 式 (1) 分别变成

$$
o_i^k=\Bigl(\sum_{j=0}^{i}S_{ij}^k\cdot\sigma\bigl(X_jW_\theta\bigr)\odot X_jW_V^k\Bigr)W_O^k,
\tag{3}
$$

$$
o_i^k=\Bigl[\Bigl(\sum_{j=0}^{i}S_{ij}^k\,X_jW_V^k\Bigr)\odot\sigma\bigl(X_iW_\theta\bigr)\Bigr]W_O^k.
\tag{4}
$$

两式都在 $W_V$ 和 $W_O$ 之间插了一个依赖输入的乘法, 合并 $W_VW_O$ 的条件不再成立. 论文用三组对照说明非线性本身就有用:

| 变体 | PPL |
|---|---:|
| 基线 | 6.026 |
| SDPA 输出后接 RMSNorm (不加门) | 5.847 |
| SDPA 输出后接 SiLU | 5.975 |
| 加性门, 激活取恒等 | 5.882 |
| 乘性 sigmoid 门 $G_1$ | 5.761 |

只加一层 RMSNorm 就从 6.026 降到 5.847, 说明 $W_V$ 和 $W_O$ 之间有任何非线性都能带来一部分增益. 乘性 sigmoid 比这三种都好, 剩下的差距来自稀疏.

### 2.2 稀疏且随 query 变化

式 (3) 和式 (4) 的区别在门的下标. $G_2$ 的门写成 $\sigma(X_jW_\theta)$, 下标是被读的 token $j$, 同一个 value 被所有 query 读到时缩放一样. $G_1$ 的门写成 $\sigma(X_iW_\theta)$, 下标是当前 query $i$, 每个 query 可以决定自己要不要这个头的输出.

论文统计了门分数的分布 (Table 4):

| 变体 | 平均门分数 | 最大激活 | 首 token 占比 | PPL |
|---|---:|---:|---:|---:|
| 基线 | - | 1053 | 0.467 | 6.026 |
| $G_1$ elementwise, head-specific | 0.116 | 94 | 0.048 | 5.761 |
| $G_1$ headwise | 0.172 | 98 | 0.073 | 5.792 |
| $G_1$ elementwise, head-shared | 0.271 | 286 | 0.301 | 5.801 |
| $G_2$ Value 门 | 0.221 | 125 | 0.297 | 5.820 |
| $G_1$ 输入无关的门 | 0.335 | 471 | 0.364 | 5.917 |
| $G_1$ NS-sigmoid | 0.653 | 892 | 0.451 | 5.900 |

「最大激活」是各层输出隐状态的最大值取整, 「首 token 占比」是分给第一个 token 的平均注意力分数. $G_1$ 的平均门分数只有 0.116, 大部分分数小于 0.5, 也就是多数头在多数 token 上输出被压得很小. 其余几行各去掉一个性质:

- **head-shared**: 所有头共用一套门, 均值升到 0.271, 首 token 占比回到 0.301. 不同头需要各自的开关.
- **Value 门**: 门由被读的 token 决定, 均值 0.221, 最大激活降到 125, 首 token 占比仍有 0.297.
- **输入无关**: 把一组 $q\times d_k$ 的可学参数零初始化, 过 sigmoid 后直接乘到 SDPA 输出上, 不依赖 $X$. PPL 5.917, 比基线好一些, 论文认为这部分来自非线性. 门分数偏高, 增益大半消失.
- **NS-sigmoid**: 把 sigmoid 换成值域 $[0.5,1]$ 的非稀疏版本, 保留非线性但不能把输出压到 0 附近. 门均值 0.653, 最大激活 892, 首 token 占比 0.451, 和基线接近.

$$
\text{NS-sigmoid}(x)=0.5+0.5\,\sigma(x).
\tag{5}
$$

NS-sigmoid 那一行最直接: 非线性还在, 门却没法关掉一个头, PPL 增益只剩一半, sink 也基本回来了.

### 2.3 一个手算例子: 「这个头这次不需要输出」

下面用两维向量示意 softmax 头为什么会形成 sink, 以及 $G_1$ 怎么绕开它. 数值是为了演示构造的, 不是训练所得.

设序列有三个 token, value 分别是 $v_1=(0.1,0)$, $v_2=(2,1)$, $v_3=(-1,3)$. 第 3 个 query 在当前语境下不需要这个头提供任何信息, 理想输出接近 0.

**没有门**: softmax 权重和必须为 1, 输出是 $v$ 的凸组合. 要让输出接近 0, 只能把权重集中到一个范数很小的 value 上. 取 $S_3=(0.98,0.01,0.01)$, 输出为

$$
0.98\,(0.1,0)+0.01\,(2,1)+0.01\,(-1,3)=(0.108,\,0.04).
$$

模型要学会让某个 token 的 value 很小, 同时让许多 query 都把分数集中给它. 首 token 在因果注意力里能被所有位置看到, 最容易被选成这个 token. 这就是 sink.

**加 $G_1$**: 权重可以保持均匀 $S_3=(1/3,1/3,1/3)$, 求和得 $(0.367,1.333)$. 第 3 个 token 自己算出门值 $0.05$, 输出变成 $(0.018,0.067)$. 头的「不输出」由门完成, softmax 不必把质量堆到首 token 上.

论文附录 A.2 的统计和这个例子方向一致: 门前后 SDPA 输出的平均绝对值从 0.71 降到 0.05, 门后的隐状态和无门基线的 SDPA 输出很接近. 论文据此推测, 门承担了 sink 原来过滤无关信息的作用. Quantizable Transformers 在 BERT 和 ViT 上也给出同样的解释, 见 4.2 节.

### 2.4 sink 和 massive activation 的消失

Figure 2 的数字: 基线首 token 平均注意力占比 46.7%, 加 $G_1$ 后 4.8%. 第 21 层从 83% 降到 4%. 在最后一层, 加门后的模型更倾向于把注意力分给序列里的个别 token.

逐层看 (附录 A.3), 基线第 6 层 FFN 的输出出现 massive activation, 加进残差流后一直保留到后面各层, sink 也从第 6 层开始变明显. 加 $G_1$ 后前几层输出整体偏小, massive activation 随深度缓慢增长, 任何一层都没有明显的 sink.

Value 门 $G_2$ 和 head-shared 门都能压低 massive activation, sink 却还在. 所以 massive activation 不是 sink 出现的前提. 论文对稳定性的解释是: 输出稀疏了, massive activation 变小, BF16 训练里的数值误差影响也就小了.

论文还试了一种直接的做法: 不加门, 在注意力和 FFN 输出进残差前把值裁剪到 $(-c,c)$. $c$ 取 300 或 100, 学习率 8e-3 下模型照样收敛不了 (附录 A.5). 他们据此认为 pre-norm 训练的不稳定不只来自残差里的大激活, 任何一层输出过大都可能触发. 截断激活代替不了门.

## 3. 实验与整机

### 3.1 设置

主实验在 15A2B MoE 上做: 总参 15B, 激活 2.54B, 128 个细粒度专家, 每 token 用 softmax 路由选 8 个, 配 global-batch 负载均衡损失和 z-loss, 注意力用 GQA, 上下文 4096. 学习率 1k 步 warmup 到 2e-3, 再余弦衰减到 3e-5, batch 1024, 训练 100k 步, 约 400B token. 另一组是 1.7B dense, 分 28 层和 48 层两种深度, 训练量从 400B 到 3.5T token. 数据都取自同一个 3.5T 的多语言, 数学和通用知识语料.

门带来的参数和计算量都很小, 墙钟时间增加不到 2%.

### 3.2 MoE 主表 (Table 1 摘录)

| 方法 | 额外参数 | PPL | MMLU | GSM8k | C-eval |
|---|---:|---:|---:|---:|---:|
| 基线 ($q=32$, $k=4$) | 0 | 6.026 | 58.79 | 52.92 | 60.26 |
| KV 头 $k=8$ | 50M | 5.979 | 59.78 | 52.16 | 62.26 |
| query 头 $q=48$ | 201M | 5.953 | 58.45 | 53.30 | 59.67 |
| 加 4 个专家 | 400M | 5.964 | 58.84 | 52.54 | 63.19 |
| $G_1$ elementwise | 201M | **5.761** | **60.82** | **55.27** | 62.20 |
| $G_1$ headwise | 1.6M | 5.792 | 60.05 | 54.44 | 62.61 |
| $G_1$ head-shared | 201M | 5.801 | 60.06 | 53.15 | 61.01 |
| $G_1$ 加性, SiLU | 201M | 5.821 | 60.06 | 53.30 | 60.98 |
| $G_1$ 乘性, SiLU | 201M | 5.822 | 60.49 | 54.59 | 62.34 |
| $G_2$ elementwise | 25M | 5.820 | 59.17 | 53.97 | 61.00 |
| $G_2$ headwise | 0.2M | 5.808 | 59.32 | 53.53 | 62.61 |

前三行加法是控制参数量的对照: 加 KV 头, 加 query 头, 加专家, 最多多花 400M 参数, PPL 最多降 0.07. $G_1$ 和「加 query 头」都多 201M 参数, PPL 分别是 5.761 和 5.953. headwise 门只花 1.6M 参数, PPL 降 0.23.

表中 $G_2$ headwise 的 5.808 还有一个对照. SwitchHead 用 sigmoid 路由在每个头内部选 value 和 key 的投影专家. 论文附录 A.1 的 Table 6 在 15A2B 上试了几种配置: 在 key 和 value 上各 8 个专家全选, 多 38M 参数, PPL 5.847; 只在 value 上 1 个专家选 1 个, PPL 5.808. 后者和 $G_2$ headwise 门等价. 也就是说, 这类选择结构的增益里, 有一部分来自 sigmoid 路由本身带来的门控.

### 3.3 dense 模型与训练稳定性 (Table 2 摘录)

| 设置 | 学习率 | 训练量 | PPL | MMLU |
|---|---|---:|---:|---:|
| 28 层基线 | 4.0e-3 | 400B | 7.499 | 50.21 |
| 28 层 + $G_1$ | 4.0e-3 | 400B | 7.404 | 51.15 |
| 28 层基线 | 4.5e-3 | 3.5T | 6.180 | 59.10 |
| 28 层 + $G_1$ | 4.5e-3 | 3.5T | 6.130 | 59.61 |
| 48 层基线 | 8.0e-3 | 400B | 9.195 | 44.28 |
| 48 层基线 + sandwich norm | 8.0e-3 | 400B | 7.407 | 52.07 |
| 48 层 + $G_1$ | 8.0e-3 | 400B | 7.325 | 54.47 |
| 48 层基线 | 5.3e-3 | 1T | 7.363 | 54.44 |
| 48 层基线 | 8.0e-3 | 1T | 发散 | 发散 |
| 48 层 + $G_1$ | 8.0e-3 | 1T | 7.078 | 56.47 |

加门的版本为了参数量对齐, FFN 宽度相应调窄. 3.5T 设置下, 门大幅减少了训练中的 loss spike. 学习率提到 8e-3 后, 48 层基线在 400B 上 PPL 掉到 9.195, 在 1T 上直接发散. sandwich norm (注意力和 FFN 输出先归一化再加回残差) 能让 400B 的基线重新收敛, 但收益很小. 加门的版本在 8e-3 下比 5.3e-3 的结果更好, 门让模型能用更大的学习率.

### 3.4 长上下文 (Table 5)

长上下文实验用 3.5T 训练的模型: 先把 RoPE base 从 10k 改到 1M, 在 32k 序列上续训 80B token, 得到 32k 模型; 再用 YaRN 外推到 128k. RULER 结果:

| 长度 | 32k 基线 | 32k + $G_1$ | YaRN 基线 | YaRN + $G_1$ |
|---|---:|---:|---:|---:|
| 4k | 88.89 | 90.56 | 82.90 | 88.13 |
| 8k | 85.88 | 87.11 | 71.52 | 80.01 |
| 16k | 83.15 | 84.61 | 61.23 | 76.74 |
| 32k | 79.50 | 79.77 | 37.94 | 72.88 |
| 64k | - | - | 37.51 | 66.60 |
| 128k | - | - | 31.65 | 58.82 |

训练长度以内, 两者差距很小, sink 没有明显伤害长上下文表现. YaRN 外推后两者在原 32k 范围内都下降, 基线在 32k 处从 79.50 掉到 37.94, 加门的模型从 79.77 掉到 72.88. 64k 和 128k 上差距都在 27 个点以上.

论文的解释是一个假设: 基线模型靠 sink 来调节注意力分数的分布, YaRN 改了 RoPE 之后, 这种分布在不重新训练的情况下难以适应. 加门的模型主要靠输入相关的门分数控制信息流, 对位置编码的改动更不敏感.

### 3.5 放进整机: Qwen3-Next

Qwen3-Next-80B-A3B 的模型卡给出了布局: 48 层, 写成 `12 * (3 * (Gated DeltaNet -> MoE) -> 1 * (Gated Attention -> MoE))`. 每 4 层里 3 层是线性注意力 Gated DeltaNet, 1 层是带输出门的全注意力. Gated Attention 层有 16 个 Q 头, 2 个 KV 头, 头维 256, 其中 64 维做 RoPE.

两种门在这里分工不同. Gated DeltaNet 的门作用在递归状态上, 控制历史信息衰减多快. Gated Attention 的门作用在每个 query 的输出上, 控制这个头这次要不要贡献. 前者改的是「记住什么」, 后者改的是「这次输出多少」.

Qwen3.5 系列 (如 Qwen3.5-397B-A17B) 的说明里写明沿用 Qwen3-Next 的 Gated DeltaNet + Gated Attention 混合注意力. 型号细节见 [Qwen3-Next 模型卡](../../../../../model-library/03-模型家族/03-qwen/qwen3-next/qwen3-next-bi.md) 和 [Qwen3.5](../../../../../model-library/03-模型家族/03-qwen/qwen3-5/qwen3-5-bi.md).

## 4. 相关工作与适用边界

门控和对 softmax 的改动在注意力里已经有很多做法. 它们的区别首先是位置: 作用在 logits 上, 在 softmax 权重上, 还是在 SDPA 输出上. 下表按位置排列:

| 方法 | 改动作用在 | 依赖谁 | 主要目的 |
|---|---|---|---|
| Forgetting Transformer | logits 加 $\log f$ | 每个时间步 | 让旧信息衰减 |
| Quantizable Transformers | softmax 输出或头输出 | 当前 token | 去掉离群值, 便于量化 |
| Differential Transformer | 两张 softmax 相减 | 两组 $Q,K$ | 抵消共模噪声 |
| Softpick | 替换 softmax | logits | 去掉 sink, 允许全零 |
| sigmoid 注意力 | 替换 softmax | logits | 去掉归一化 |
| SwitchHead / NSA / MoSA | 选头或选 token | 路由 | 稀疏计算 |
| Gated Residual / AttnRes | 残差流 | 层间 | 深度维读写 |
| **Gated Attention $G_1$** | **SDPA 输出** | **当前 query** | **非线性与稀疏** |

![G1 与相邻门控的位置对比: Gated Attention 在注意力子层内, Gated Residual 在残差流上, AttnRes 在深度维](./images/fig-g1-not-neighbors.png)

> 图 2: 四类常被一起提起的设计分别作用在什么上.

**图 2 解析**: 四个框分在中间「NOT」的四角. 左上是 $G_1$, 对整个 SDPA 输出 $Y$ 逐元素乘门. 右上是 SwitchHead, NSA, MoSA 这类选择方法, 挑选头, 专家或 token 块参与计算, 不对全部 $Y$ 做调制. 左下是 Gated Residual, $n_r=4$ 条残差分支, 门在读残差的那一步, 去掉了分支混合矩阵 $H_{res}$. 右下是 AttnRes, 对此前各层的输出在深度维上加权, softmax 不沿 token 维做. 四者作用在不同的张量上, 可以同时出现在一个模型里.

### 4.1 Forgetting Transformer: 门加在 logits 上

Lin 等人的 [Forgetting Transformer](https://arxiv.org/abs/2503.02130) (FoT) 给每个时间步算一个遗忘门 $f_t=\sigma(w_f^\top x_t+b_f)$, 再把累积的对数遗忘量加到 logits 上:

$$
o_i=\sum_{j=1}^{i}\frac{\exp\bigl(q_i^\top k_j+d_{ij}\bigr)}{\sum_{l=1}^{i}\exp\bigl(q_i^\top k_l+d_{il}\bigr)}v_j,
\tag{6}
$$

$$
d_{ij}=\sum_{l=j+1}^{i}\log f_l,
\tag{7}
$$

$$
D_{ij}=\begin{cases}d_{ij}, & j\le i\\ -\infty, & j>i\end{cases}.
\tag{8}
$$

$d_{ij}\le 0$, 离 query 越远的 key 累积的衰减越多. 这种衰减是数据相关的: 某个时间步遗忘门接近 1, 跨过它的信息就不衰减. FoT 不需要位置编码, 作用位置和 $G_1$ 不同, 在 softmax 之前.

FoT 的 Pro 版本另外加了输出门, 位置接近 $G_1$. Qiu 等人在相关工作里说 FoT 把门用在 softmax 注意力的输出上, 指的是这一部分. FoT 论文 Table 3 把两者拆开做了消融 (360M 参数, 7.5B token): 完整 Pro 的 PPL 是 6.62, 去掉遗忘门 6.86, 去掉输出门 6.82, 两者都去掉 7.40. 两种门各自有贡献.

FoT 主实验用 760M 模型训 48B token, 训练长度 16384. Table 1 里 FoT 的 Wikitext PPL 23.04, LAMBADA 准确率 50.88. 同等设置的 Transformer 基线是 24.12 和 50.39.

### 4.2 Quantizable Transformers: 让头可以「什么都不做」

Bondarenko 等人的 [Quantizable Transformers](https://arxiv.org/abs/2306.12929) (QT) 是 Qiu 等人认为最接近的工作. QT 研究的是 BERT 和 ViT 里妨碍 INT8 量化的离群值. 他们发现 97% 以上的离群激活落在 [SEP], 句号, 逗号这类分隔 token 上, 并且和特定头对应, 比如 BERT 第 180 维的离群值来自第 3 个头.

QT 的解释和 2.3 节一致: 一个头在某些位置不需要更新残差流, 但 softmax 不允许全零权重, 头只好把注意力集中到信息量低的分隔 token 上, 让它们的 value 变小. 为了把分数推到 softmax 的饱和区, 前面的 FFN 会产生很大的激活, 这就是离群值的来源.

QT 给出两个改法. 第一个是 clipped softmax, 把 softmax 输出拉伸后裁剪, 允许精确的 0 和 1:

$$
\text{clipped\_softmax}(x;\zeta,\gamma)=\text{clip}\bigl((\zeta-\gamma)\,\text{softmax}(x)+\gamma,\;0,\;1\bigr).
\tag{9}
$$

第二个是 gated attention, 在头输出上乘一个由当前 token 算出的 sigmoid 门:

$$
\text{GatedAttention}(x)=\sigma\bigl(G(x)\bigr)\odot\text{softmax}\Bigl(\frac{Q(x)K(x)^\top}{\sqrt{d_{head}}}\Bigr)V(x).
\tag{10}
$$

式 (10) 和 $G_1$ 位置相同. 每个头的门参数量是 $n_{heads}(d_{head}+1)$, 量级和 $d_{model}$ 相当. QT 的 Table 1 里, BERT 取 $\gamma=-0.03$ 时, 最大激活降到 20, INT8 量化后 PPL 4.55, 浮点 PPL 4.41. Table 2 里 ViT 用 clipped softmax 后浮点 top-1 80.89%, 峰度 22.9, INT8 后 79.77%. 门初始化偏置太低会让模型从一开始就关掉头, 效果变差.

Qiu 等人的工作在三处扩展了 QT: 规模从 BERT/ViT 扩到 15B MoE 和 3.5T token 的 LLM; 系统扫描了五个位置和多种粒度; 把增益拆成非线性和稀疏两部分, 并报告了训练稳定性和长上下文外推的收益.

### 4.3 Differential Transformer: 两张注意力图相减

Ye 等人的 [Differential Transformer](https://arxiv.org/abs/2410.05258) 把 $Q,K$ 各拆成两组, 算两张 softmax 图后相减:

$$
\text{DiffAttn}(X)=\Bigl(\text{softmax}\Bigl(\frac{Q_1K_1^\top}{\sqrt d}\Bigr)-\lambda\,\text{softmax}\Bigl(\frac{Q_2K_2^\top}{\sqrt d}\Bigr)\Bigr)V,
\tag{11}
$$

$\lambda$ 是可学标量, 初始化 $\lambda_{init}=0.8-0.6\exp(-0.3(l-1))$, $l$ 是层号. 每个头输出过 GroupNorm 后乘固定系数 $1-\lambda_{init}$. 两张图共有的那部分分数 (包括分给首 token 的部分) 被相减抵消, 剩下的分布更集中在相关 token 上.

Diff 的改动在权重上, 结果仍是 $V$ 的线性组合, 不在 $W_V$ 和 $W_O$ 之间加非线性. 论文报告的规模结果: 6.8B Diff 和 11B Transformer 的 loss 相当, 参数约为 62.2%; 用 160B token 训练的 Diff 和用 251B token 的 Transformer 相当, 约为 63.7%. 3B 模型上, 多针检索任务 Diff 0.85, Transformer 0.55. 消融里 3B 级下游平均分 Diff 60.6, 去掉 GroupNorm 57.5, Transformer 56.8. 激活离群值方面, 最大激活值约降 65%.

### 4.4 Softpick 与 sigmoid 注意力: 替换 softmax

另一条思路是不要 softmax 的归一化. Zuhri 等人的 [Softpick](https://arxiv.org/abs/2504.20966) 把 softmax 换成

$$
\text{softpick}(x)_i=\frac{\text{ReLU}\bigl(e^{x_i}-1\bigr)}{\sum_j\bigl|e^{x_j}-1\bigr|}.
\tag{12}
$$

分子在 $x_i\le 0$ 时为 0, 所以一行权重可以全为 0, 头不必把质量分给 sink. 论文 Table 4 里, 340M 模型的 softmax 基线 sink 率是 68.28%, 换成 softpick 后为 0; 1.8B 模型从 41.73% 降到 0. 隐状态峰度从 33510.81 降到 340.96 (340M), 注意力图稀疏度 99.34%.

规模放大后 softpick 的代价出现了. 340M 上训练 loss 和 softmax 只差 0.004, SciQ 从 74.90 涨到 77.30. 1.8B 上 loss 差到 0.12, ARC-E 从 67.21 降到 62.04. 去掉归一化在小模型上有好处, 在大一点的模型上开始损失质量.

Ramapuram 等人的 [Theory, Analysis, and Best Practices for Sigmoid Self-Attention](https://arxiv.org/abs/2409.04431) 直接用逐元素 sigmoid 替换 softmax:

$$
\text{SigmoidAttn}(X)=\sigma\Bigl(\frac{QK^\top}{\sqrt{d_{qk}}}+b\Bigr)V.
\tag{13}
$$

论文证明 sigmoid 注意力的 Transformer 仍是序列到序列的万能逼近器. 训练稳定的关键是偏置 $b=-\log n$, $n$ 是序列长度, 用来抵消没有归一化时输出随长度增长的问题. 他们写的 FlashSigmoid kernel 在 H100 上比 FlashAttention-2 推理快 17.39%, 训练快 6.53%. 1B 模型 2k 上下文时平均分 49.5 对 49.4, 和 softmax 持平; 4k 上下文需要再加 hybrid norm, 平均分 50.2 对 49.4. 只用 $b=-\log n$ 不加 hybrid norm 时, 4k 训练有轻微不稳定.

这两种方法和 $G_1$ 解决的是同一个问题, 方式是改归一化. $G_1$ 保留 softmax, 在输出上加门, 不需要改 attention kernel.

### 4.5 稀疏选头: SwitchHead, NSA, MoSA

[SwitchHead](https://arxiv.org/abs/2312.07987) 在每个头内部做 MoE: value 和输出投影各有几个专家, 由路由按 token 选. 设第 $i$ 个头有 $E$ 个 value 专家和输出专家, 输出写成

$$
y=\sum_{i=1}^{h}\Bigl(\sum_{e\in\mathcal E_S^i}s_{S,e}^i\,W_O^{i,e}\Bigr)^{\!\top}\text{Attn}\Bigl(Q^i,K^i,\sum_{e\in\mathcal E_D^i}s_{D,e}^i\,W_V^{i,e}x\Bigr).
\tag{14}
$$

路由分数 $s$ 用 sigmoid 算, 只保留 top-k. Qiu 等人附录 A.1 指出, SwitchHead 的增益有一部分来自这个 sigmoid 路由本身: 只做 value 上的 top-1 选择时 PPL 是 5.808, 和直接加一个 headwise 门的结果相同 (见 3.2 节).

[NSA](https://arxiv.org/abs/2502.11089) 把注意力拆成压缩, 选择, 滑窗三条分支, 输出由三个门 $g_t^c=\sigma(\text{MLP}(x_t))$ 加权合并. 门在分支层面, 作用类似 $G_1$ 的 headwise 版本. MoSA 用 expert-choice 路由让每个头只选一部分 token 参与计算. 这一类工作的目的是省计算, 门是路由的副产品.

### 4.6 更早的门: LSTM, GRU, Highway, SwiGLU

逐元素 sigmoid 门最早来自 LSTM 和 GRU, 用在递归状态上控制写入和遗忘. Highway Network 把它用在层间: $y=H(x)\cdot T(x)+x\cdot(1-T(x))$, $T$ 是 sigmoid 门, 决定这一层的变换和恒等通路各占多少. FFN 里的 GLU 家族 (SwiGLU 等) 把门放在两次线性投影之间, 写成 $(\text{Swish}(xW)\odot xV)W_2$, 详见 [GLU 家族: 从 GLU 到 SwiGLU](../../../2.1-深度学习基础组件/2.1.1-激活函数/02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md).

$G_1$ 和 SwiGLU 的形式最像: 都是线性投影之后乘一个由输入算出的门, 再接一次线性投影. 区别在于 SwiGLU 的门和被门控的值来自同一个投影的两半, $G_1$ 的被门控值来自 SDPA, 已经混合了其他 token 的信息, 门只看当前 token.

### 4.7 Gated Residual 和 AttnRes: 门在残差流上

Gated Residual 把门放在残差流上. 它把隐状态扩成 $n_r=4$ 条分支, 读入子层前对四条分支做逐元素 sigmoid 加权, 子层输出按每条分支一个标量写回, 不使用 Hyper-Connections 里的分支混合矩阵 $H_{res}$. 门决定的是「从哪条残差分支读, 写到哪条」, 不改注意力子层内部.

![左: Gated Attention 的门在 SDPA 与输出投影之间; 右: Gated Residual 的门在残差分支的读写上](./images/fig-gated-attn-not-gated-residual.png)

> 图 3: Gated Attention 与 Gated Residual 的门作用在不同的张量上.

**图 3 解析**: 左半自上而下是 pre-norm 隐状态 $X$, $Q,K,V$ 与 SDPA, 逐头 sigmoid 门 $G_1$, $W_O$. 门在注意力子层内部, 子层外的残差仍是普通的 $x+F(x)$. 底部注明它和四分支残差读门, 以及 SwiGLU, PowLU, SiTU 这类 FFN 激活都不是一回事. 右半是 Gated Residual: 四条残差分支 R1 到 R4 先各自做 RMSNorm, 再经逐元素 sigmoid 读门合成子层输入 $x$, 注意力或 MLP 的输出按每条分支一个标量 $s_i$ 写回, 中间没有分支混合矩阵 $H_{res}$. 两种门作用在不同的张量上, 在一个模型里可以同时存在.

Gated Residual 来自 Qwen3.8 技术报告. 报告 Table 6 在 28 层模型上比较了几种残差设计, 都带 GatedNorm 时, Pre-norm 残差 loss 1.787, Full AttnRes 1.758, Gated Residual 1.762. 这张表比较的是残差流的读法, 注意力子层内部的 $G_1$ 不在比较之列. Gated Residual 的推导见 [Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md), 残差分支的来源见 [Hyper-Connections 与 mHC](../../../2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md).

AttnRes 也在深度维上做加权, 但用的是 softmax 注意力: 每一层用一个可学的伪查询, 对此前所有层的输出做一次 softmax 加权求和, 取代 Pre-LN 残差里固定为 1 的系数. 它和 $G_1$ 改的是两根不同的轴, 一个是层间, 一个是注意力子层内部. 详见 [AttnRes: 深度维注意力聚合](../08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md).

### 4.8 attention sink 的其他处理

StreamingLLM 利用 sink 做长序列推理: 保留前几个 token 的 KV 和最近一段窗口, 中间的丢掉, 模型仍能正常生成. 它接受 sink 的存在并加以利用, 和 $G_1$ 的方向相反. 加了 $G_1$ 的模型首 token 占比只有 4.8%, 只保留首 token 的策略对它的意义也会变小. StreamingLLM 的细节见 [StreamingLLM 与 Attention Sink](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/07-StreamingLLM与Attention-Sink/07-StreamingLLM与Attention-Sink.md).

还有一类做法给 softmax 加一个可学的「空」位置 (如在 key 里加一个 bias token), 让头把多余的质量分给它. Gu 等人的实验显示, 这类 key bias 能把 sink 从首 token 移到这个额外位置上, 但 sink 本身仍存在. 只有去掉归一化 (sigmoid 注意力) 时 sink 才在他们测试的规模内消失. $G_1$ 保留归一化, 用输出门让头可以不贡献, 达到了接近的效果.

### 4.9 适用边界

论文在 Limitations 里写了两点: 非线性对注意力动态和整个训练过程的影响还没有充分研究; 去掉 sink 后长上下文外推变好, 但 sink 如何影响模型对更长序列的泛化, 没有严格的理论解释. 3.4 节的解释也只是假设.

还有两点来自实验设置本身. 所有结果来自同一份 3.5T 语料和同一套 MoE / dense 配方, 最大到 15B 总参; 换数据或换更大规模时增益多大, 论文没有给出. 加门模型的注意力分布和基线不同, 首 token 不再集中大量分数, 依赖首 token sink 做 KV 保留的推理方案 (如 StreamingLLM) 用在这类模型上要重新验证.

工程上几种常见失败:

| 现象 | 原因 | 处理 |
|---|---|---|
| 加了门, PPL 几乎不变 | 门放在 $W_O$ 之后 ($G_5$, 6.017) 或 Key 上 ($G_3$, 6.016) | 放回 SDPA 输出和 $W_O$ 之间 |
| 增益只有一半左右 | 门参数不依赖输入 (5.917), 或用了值域 $[0.5,1]$ 的门 (5.900) | 门分数由当前 token 的隐状态投影得到, 激活用普通 sigmoid |
| sink 没有消失 | 所有头共用一套门 (首 token 占比 0.301), 或门在 Value 上 (0.297) | head-specific, 放在 SDPA 输出上 |
| 想用激活裁剪代替门 | 裁剪到 300 或 100, 8e-3 学习率下仍不收敛 | 加门; 不稳定不只来自残差里的大激活 |
| 依赖首 token 的 KV 保留策略效果变差 | 加门后首 token 只占 4.8% 的注意力 | 在加门模型上重新验证 KV 保留策略 |

## 参考文献

1. Qiu Z., Wang Z., Zheng B., Huang Z., et al. [Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free](https://arxiv.org/abs/2505.06708). NeurIPS 2025. 代码: [GitHub 仓库](https://github.com/qiuzh20/gated_attention).
2. Lin Z., Nikishin E., He X., Courville A. [Forgetting Transformer: Softmax Attention with a Forget Gate](https://arxiv.org/abs/2503.02130). ICLR 2025.
3. Bondarenko Y., Nagel M., Blankevoort T. [Quantizable Transformers: Removing Outliers by Helping Attention Heads Do Nothing](https://arxiv.org/abs/2306.12929). NeurIPS 2023.
4. Ye T., Dong L., Xia Y., et al. [Differential Transformer](https://arxiv.org/abs/2410.05258). ICLR 2025.
5. Zuhri Z. M. K., Fuadi E. H., Aji A. F. [Softpick: No Attention Sink, No Massive Activations with Rectified Softmax](https://arxiv.org/abs/2504.20966). 2025.
6. Ramapuram J., Danieli F., Dhekane E., et al. [Theory, Analysis, and Best Practices for Sigmoid Self-Attention](https://arxiv.org/abs/2409.04431). ICLR 2025.
7. Csordás R., Piękos P., Irie K., Schmidhuber J. [SwitchHead: Accelerating Transformers with Mixture-of-Experts Attention](https://arxiv.org/abs/2312.07987). NeurIPS 2024.
8. Yuan J., Gao H., Dai D., et al. [Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089). ACL 2025.
9. Xiao G., Tian Y., Chen B., Han S., Lewis M. [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453). ICLR 2024.
10. Sun M., Chen X., Kolter J. Z., Liu Z. [Massive Activations in Large Language Models](https://arxiv.org/abs/2402.17762). COLM 2024.
11. Gu X., Pang T., Du C., et al. [When Attention Sink Emerges in Language Models: An Empirical View](https://arxiv.org/abs/2410.10781). ICLR 2025.
12. Shazeer N. [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). 2020.
13. Srivastava R. K., Greff K., Schmidhuber J. [Highway Networks](https://arxiv.org/abs/1505.00387). 2015.
14. Kimi Team. [Attention Residuals](https://arxiv.org/abs/2603.15031). 2026.
15. Qwen Team. [Qwen3-Next-80B-A3B 模型卡](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct). 2025.
16. Qwen Team. [Qwen3.8-Flash-Next Technical Report](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf). 2026.
