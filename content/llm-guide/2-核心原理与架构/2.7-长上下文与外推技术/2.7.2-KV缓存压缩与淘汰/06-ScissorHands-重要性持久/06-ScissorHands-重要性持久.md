---
title: "06 · ScissorHands: 重要性持久假设与固定预算 KV cache"
category: "LLM 指南"
published: true
tags: ["ScissorHands", "KV-Cache", "Persistence-of-Importance", "Pivotal-Token", "NeurIPS 2023"]
excerpt: "ScissorHands 观察到不同位置的 token 反复关注同一批 token, 提出重要性持久假设: 只有之前起过重要作用的 pivotal token 才会在以后起重要作用. 据此在固定预算下维护 KV cache, 缓冲区满时按历史窗口内的低分次数批量丢弃 token, KV 显存最多减少 5 倍."
---

# ScissorHands: 重要性持久假设与固定预算 KV cache

## 1. 推理显存与已有压缩做法

### 1.1 KV cache 可以比权重还大

LLM 推理时, 每一步的 key 和 value 都存入 KV cache, 避免以后重复投影. KV cache 包括 prompt 和已生成的 token, 体积可以超过权重. 论文以 OPT-175B 为例: 1750 亿参数约占 325GB, 而 batch 128, 序列 2048 时 KV cache 远大于权重. 8 张 A100-80GB 一共只有 640GB 显存.

论文 Table 1 列出三个模型在 batch 128, 序列 2048 下的显存 (GB):

| 模型 | 层数 | 隐藏维度 | 权重 | KV cache |
|---|---|---|---|---|
| OPT-175B | 96 | 12288 | 325 | 1152 |
| LLaMA-65B | 80 | 8192 | 130 | 640 |
| BLOOM | 70 | 14336 | 352 | 950 |

可以验算: OPT-175B 每个 token 的 KV 是 $2\times96\times12288\times2$ 字节 $\approx4.72$ MB, 乘以 $128\times2048=262144$ 个 token, 约 $1.24\times10^{12}$ 字节, 即 1152 GiB, 和表一致. 引言里写 OPT-175B 的 KV cache「约 950GB」, 和表中 BLOOM 的数值相同, 与 OPT 的表值对不上, 以表为准. 按表算, KV cache 是权重的 $1152/325\approx3.5$ 倍 (OPT-175B), $640/130\approx4.9$ 倍 (LLaMA-65B), $950/352\approx2.7$ 倍 (BLOOM), 在 2.5 到 5 倍之间.

显存由三部分组成: 模型权重, KV cache, 激活缓冲区. 激活缓冲区比前两者小得多. 部署后权重大小固定, 除了少量通信和计算缓冲, 剩下的显存都给 KV cache. KV cache 大小取决于 batch, 序列长度和模型维度, 所以在给定序列长度下, KV cache 压缩几乎线性地转化为 batch 的增加, 而 batch 对高吞吐推理很关键. Table 2 给出了 8 张 A100-80GB 上按最大序列长度部署时的最大 batch: OPT-175B 34, LLaMA-65B 102, BLOOM 36. GPT-3 规模的模型在不卸载的情况下 batch 不能超过 35 左右.

Table 2 的数字可以从 Table 1 推出来. 8 张卡共 640GB. LLaMA-65B 的权重 130GB, 剩下约 510GB 给 KV cache; 每条 2048 长度的序列需要 $640/128=5$ GB, 所以最多约 102 条, 和表一致. OPT-175B 剩下 $640-325=315$ GB, 每条序列需要 $1152/128=9$ GB, 最多 35 条, 表中是 34, 差的一条大概是留给激活缓冲区的. 按同样的算法, 如果 KV cache 压缩 5 倍, LLaMA-65B 每条序列只要 1GB, batch 上限变成约 510, 这就是「KV 压缩近似线性地转化为 batch 增加」的意思. 实际上限还要扣掉激活缓冲区, 并且受计算能力限制.

论文提出了理想压缩算法的三个要求: 不需要训练, 因为在几千亿参数的规模上训练代价太高; 沿序列长度维度压缩, 因为上下文窗口在增长 (当时已超过 32K), KV cache 随长度线性增长; 保持模型质量和上下文学习能力.

### 1.2 已有做法

- **高效注意力.** 低秩或稀疏方法近似注意力输出, FlashAttention 通过减少内存读写实现精确且快速的注意力. 这些方法主要针对训练, 关注计算复杂度, 不处理自回归推理中的 KV cache 显存.
- **权重的量化和剪枝.** 主要减少模型权重的大小, 不压缩 KV cache.
- **FlexGen.** 对 KV cache 做量化和稀疏化, 但不沿序列长度减少 KV cache: 它把所有 token 量化后的 KV 存在 CPU 内存, 计算注意力时把所有 key 从 CPU 读过来.

ScissorHands 要做的是在不微调的情况下, 沿序列长度维度把 KV cache 限制在固定预算内.

## 2. 观察与假设

### 2.1 重复注意力模式

论文从 C4 中随机抽一个句子, 用 OPT-6B 在三个随机位置 (178, 228, 278) 画出注意力图 (Figure 1, 只画 5 个头). 位置 $t$ 的注意力分数大于 $1/t$ 就算显著, 因为 $1/t$ 相当于均匀混合时的分数. 三张图中, 位置 27, 63, 98, 121, 152, 177 都是深色, 说明这些 token 在三个位置都获得了高注意力. 不同层, 不同输入上也观察到类似现象.

两个结论: 存在一些持续获得高注意力的特定 token; 注意力图是稀疏的, 只有少数 token 分数高.

阈值 $1/t$ 随位置变化. 位置 $t$ 看到 $t$ 个 token, 如果注意力完全均匀, 每个 token 得到 $1/t$; 超过它就说明这个 token 得到的注意力多于「平均份额」. 这个阈值很低: $t=500$ 时只有 0.002. 在幂律分布下, 大部分 token 的分数远低于平均值, 少数 token 远高于平均值, 所以超过 $1/t$ 的 token 仍是少数. 后面的算法也用同一个阈值来判断「低分」.

### 2.2 重要性持久假设

重复注意力模式说明某些 token 在整个序列中都有影响. 论文提出一个更强的论断:

> 对训练好的自回归语言模型, 只有在之前某一步有显著影响的 pivotal token, 才会在之后的步骤中有显著影响.

如果 pivotal token 包含所有 token, 这个假设就没有意义. 有意义的情形是 pivotal token 只是之前 token 的一个子集, 这样就可以丢掉不重要 token 的 KV.

**验证.** 位置 $t$ 给某个 token 的注意力超过阈值 $\alpha$, 就说这个 token 对 $t$ 是 pivotal 的, 记 $t$ 的 pivotal 集合为 $S_t$, 从位置 $a$ 到 $b$ 的并集为

$$
S_{a\to b}=\bigcup_{t=a}^{b}S_t. \tag{1}
$$

句子长 $l$, 取 $t=l/2$. 前半句的 pivotal 集合是 $S_{0\to t}$; 后半句各位置对前半句 token 的 pivotal 集合是 $S_{t+1\to l}\cap\{x_1,\ldots,x_t\}$. 持久率定义为

$$
\text{PersistenceRatio}=\frac{|S_{t+1\to l}\cap S_{0\to t}|}{|\{x\mid x\in S_{t+1\to l},\ x\in\{x_1,\ldots,x_t\}\}|}. \tag{2}
$$

同时记录 $|S_{0\to t}|/t$, 等于 1 表示每个 token 都至少对一个位置有显著影响, 也就是平凡情形. 实验用 OPT 模型和 OpenBookQA, WikiText 等数据集, $\alpha=1/t$.

**结果** (Figure 2). $|S_{0\to t}|$ 明显小于半句长度, 不是平凡情形; 持久率在大多数层超过 95%, 在靠后的层有所下降. 也就是说, 后半句关注的重要 token 几乎都在前半句的 pivotal 集合里. 引言中的概括是「大多数层超过 90%」.

**手算一例.** 设前半句 $t=500$, 前半句各位置的 pivotal 集合并起来有 60 个 token. 后半句各位置对前 500 个 token 的 pivotal 集合并起来有 50 个, 其中 48 个在那 60 个里. 持久率是 $48/50=96\%$, $|S_{0\to t}|/t=60/500=12\%$. 只保留这 60 个 token, 后半句需要的重要 token 就丢了 2 个. 实际算法的预算要按这种比例来定: 预算比 pivotal 集合大一些, 才能容纳持久率之外的那部分.

### 2.3 理论直觉

为解释这个现象, 论文分析单层单头的简化模型 (论文式 (1)(2)):

$$
x_{t+1}=\mathcal{F}(a_t),\quad a_t=\mathrm{softmax}\big(\tfrac1t\,x_tW_QW_K^\top X_{t-1}^\top\big)X_{t-1}W_VW_O,\quad \mathcal{F}(x)=x+W_2\,\mathrm{relu}(W_1x). \tag{3}
$$

关心的是注意力分数 $\alpha_{t,j}$, 它随 $x_tW_QW_K^\top x_j^\top$ 变化. 定理 3.1 设 $A=W_VW_OW_QW_K^\top$, 输入归一化, 并假设 MLP 的输入和输出余弦相似度很高, 即 $a_tx_{t+1}^\top\ge(1-\delta)\|a_t\|_2$, $\delta$ 足够小. 结论是: 对满足 $x_\ell Ax_\ell^\top\ge c$ 且明显大于其他 $x_jAx_\ell^\top$ 的 token $x_\ell$, 有

$$
\frac{x_\ell Ax_\ell^\top}{\|a_t\|_2}(\alpha_{t,\ell}-3\epsilon)\le x_{t+1}W_QW_K^\top x_\ell^\top\le\frac{x_\ell Ax_\ell^\top}{\|a_t\|_2}(\alpha_{t,\ell}+3\epsilon). \tag{4}
$$

(论文式 (3) 中间项的下标写作 $j$, 按上下文应为 $\ell$.) 除了一个因子, $x_{t+1}W_QW_K^\top x_\ell^\top$ 几乎和 $\alpha_{t,\ell}$ 成正比, 而它直接决定 $\alpha_{t+1,\ell}$. 所以这一步 $\alpha_{t,\ell}$ 大, 下一步 $\alpha_{t+1,\ell}$ 也可能大.

MLP 的假设在附录 A 中有经验验证: 跳连主导了输出, $\|x\|_2\gg\|W_2\mathrm{relu}(W_1x)\|_2$, 所以输入和输出的余弦相似度接近 1. 直观地说, 下一步的 query 主要由这一步的注意力输出构成, 这一步关注谁, 输出里就有谁的成分, 下一步的 query 也就更容易对上谁的 key.

定理只对 $x_\ell Ax_\ell^\top$ 足够大的 token 成立. $A$ 是训练出来的注意力权重, 论文据此推测: 每个注意力头学会识别某个子空间, 只有嵌入在这些子空间中的 token 才是这个头的 pivotal token, 这解释了为什么总是某些特定 token 重要. 第 4.1 节的对照实验支持这一点: 在随机初始化的 OPT 上做同样的实验, 没有重复注意力模式 (Figure 5), 说明这是训练的结果, 不是架构自带的偏置.

## 3. 方法与理论分析

### 3.1 问题定义

对一个头, 步 $t$ 的注意力输出是

$$
a_t=\sum_{i=1}^{t}\alpha_{t,i}\mathcal{V}_t[i],\qquad \alpha_{t,i}=\frac{\exp(\langle x_tW_K,\mathcal{K}_t[i]\rangle)}{\sum_{i'=1}^{t}\exp(\langle x_tW_K,\mathcal{K}_t[i']\rangle)}. \tag{5}
$$

(论文此处写作 $x_tW_K$, 按标准注意力应为 query 投影.) 注意力分数服从很强的幂律分布, 如果能在生成之前识别出高分 token, 只存它们就能大幅减少 KV cache. 重要性持久假设提供了这样的预言: 对之前生成的 token 有显著贡献的历史 token, 也会对未来的 token 有显著贡献.

定义 4.1 把问题表述为: 每个头的显存预算是 $B$ 个 token, 给定 token 嵌入流 (包括 prompt 和已生成的 token), 维护 key cache $\bar{\mathcal{K}}_t$ 和 value cache $\bar{\mathcal{V}}_t$, 使它们的行数 $n$ 不超过 $B$. 用压缩后的 cache 计算注意力:

$$
\hat a_t=\sum_{i=1}^{n}\hat\alpha_{t,i}\bar{\mathcal{V}}_t[i],\qquad\hat\alpha_{t,i}=\frac{\exp(\langle x_tW_K,\bar{\mathcal{K}}_t[i]\rangle)}{\sum_{i'=1}^{n}\exp(\langle x_tW_K,\bar{\mathcal{K}}_t[i']\rangle)}. \tag{6}
$$

两个约束: 硬件显存固定, 算法必须严格保持在预算内; LLM 本身计算量已经很大, 算法不能带来太多额外计算.

### 3.2 算法

思路来自蓄水池采样和 LRU 缓存替换: 预留固定大小的缓冲区, 满了就丢掉存着但没有影响的 token, 用注意力分数作为影响的指标.

**Algorithm 1.** 每生成一步, cache 增加一条; 如果条数 $n$ 超过 $B$, 调用 Algorithm 2 压缩, 使 $n\le B$.

**Algorithm 2.** 输入历史窗口大小 $w$, 最近窗口大小 $r$, 丢弃数量 $m$:

1. 初始化重要性记录 $I=\vec0$.
2. 对历史窗口内的每一步 $i\in[t-w,t]$, 若某 token 在第 $i$ 步得到的注意力 $\alpha_i<1/t$, 它的计数加 1. 也就是说, $I$ 记录的是「低分次数」.
3. 最近 $r$ 个 token 的计数置零, 让它们始终保留.
4. 按 $I$ 排序, 丢掉计数最大的 $m$ 个 token, 其余保留.

两个设计和 H2O 不同. 一是打分方式: H2O 累加注意力分数, ScissorHands 统计低于平均值 $1/t$ 的次数, 相当于对分数做了二值化, 一次极高的分数不会掩盖多次被忽略. 二是只看最近 $w$ 步, 而不是从头累计, 论文的说法是在历史窗口上收集影响力以降低方差.

论文伪代码中第 3 步写作 $I[:-r]\leftarrow0$, 按字面是把最近 $r$ 个之外的计数全部置零, 和注释「保留最近窗口内的 cache」相反. 按注释和上下文, 应理解为最近 $r$ 个 token 的计数置零.

和 LRU 对照着看更清楚. LRU 淘汰最久没被访问的条目; ScissorHands 把「被访问」换成「得到高于平均的注意力」, 在最近 $w$ 步里被忽略次数最多的 token 先被淘汰. 区别是 LRU 只看最后一次访问的时间, ScissorHands 看一段时间内被忽略的频率. 最近 $r$ 个 token 置零, 是因为它们刚进来, 被观察的步数少, 低分计数天然偏小, 不置零也不太会被丢; 置零是为了明确保证它们不被丢, 论文的理由是缺乏关于它们重要性的信息.

**超参.** 论文说 $w$ 和 $r$ 相当稳健, 所有实验取 $r=10$, $w=400$. $m$ 控制压缩的频率, 实验取 $m=0.5B$.

**手算一例.** 预算 $B=1000$, $m=500$. cache 填满 1000 条后, 下一步变成 1001 条, 触发压缩, 丢掉 500 条, 剩 501 条. 之后每生成一步加一条, 再生成 499 步又满了, 再压缩一次. 所以每 500 步左右才做一次压缩, cache 大小在 500 到 1000 之间来回. 时间平均下来, 实际占用约为预算的 75%, 而预算 $B$ 是峰值上限. 如果 $m=1$, 每步都要压缩, cache 始终是 $B$ 条, 但每步都要排序.

### 3.3 开销

压缩时要额外计算一次历史窗口上的注意力, 收集重要性指标. 不过不是每步都压缩, $m$ 控制频率; 压缩之后 cache 变小, 后面几步的注意力计算也变少. 也可以用一点显存换掉这部分开销: 在 Algorithm 1 的每一步生成中顺便维护重要性记录, 压缩时直接用.

排序的代价也可以摊开算. 每次压缩要对至多 $B+1$ 个计数排序, 是 $O(B\log B)$; $m=0.5B$ 时每 $0.5B$ 步才压缩一次, 摊到每步约 $O(\log B)$. 如果改用部分选择 (只找出计数最大的 $m$ 个, 不全排序), 单次是 $O(B)$, 摊到每步是常数. 统计低分次数时, 维护计数的版本每步要对 cache 内全部 token 做一次比较, 是 $O(B)$, 和这一步注意力本身 $O(Bd)$ 的计算相比小一个头维度的因子. 这段是按算法推算的, 论文没有给出开销数字.

### 3.4 跨头和跨层的预算分配

模型有 $L$ 层, 每层 $H$ 个头, 总预算要在层和头之间分配. 层内各头平均分; 层间按 Figure 2 分配, 经验规则是给靠后的层更多预算, 以补偿那里较低的持久率.

这一点和 [PyramidKV](../04-PyramidKV-层间漏斗/04-PyramidKV-层间漏斗.md) 方向相反. PyramidKV 观察到深层注意力集中在少数 token 上, 给深层少留; ScissorHands 观察到深层的持久率较低, 也就是深层关注的重要 token 更容易变化, 所以给深层多留. 两者的依据不同: 一个看某一时刻的注意力集中程度, 一个看重要 token 集合随时间的稳定性. 两者用的模型 (OPT 对 Llama-3) 和任务 (短文本对长上下文) 也不同. 一层的注意力可以既集中又不稳定, 这时少数 token 足够, 但具体是哪几个会变.

### 3.5 理论分析

论文用式 (3) 的简化模型, 分析 $m=1$ (每步丢掉一个最低分 token, cache 始终保持 $B$ 个) 时生成的 token $\tilde x_t$ 和原始模型生成的 $x_t$ 相差多少. 如果注意力分数的排序每步不变, Algorithm 2 总是丢掉分数最小的 token.

定理 4.1 假设压缩方法算出的注意力分数 $\beta_{t,j}$ 来自幂律分布 $f(x)=c(x+b)^{-k}$, 权重的奇异值满足 $\lambda_V\lambda_O(1+\lambda_1\lambda_2)(1+\lambda_Q\lambda_K)\le1/2$, 并且每步保留的集合恰好是 $\beta_{t,j}$ 最大的 $B$ 个. 那么对任意 $\epsilon\in(0,1)$, 以高概率对所有 $t\in[T_{\min},T_{\max}]$ 有

$$
\mathbb{E}\big[\|x_t-\tilde x_t\|_2\big]\le\frac{2.1\,(1-B/T_{\max})}{(1-\epsilon)^2}\left(k-(k-1)\left(\frac{1-\epsilon}{B/T_{\max}-\epsilon}\right)^{1/(k-1)}\right). \tag{7}
$$

误差上界随 $1-B/T_{\max}$ 线性变化: $B=T_{\max}$ 时保留所有 token, 误差为 0. 括号里的项取决于注意力分数拟合的分布, 总小于 1; 幂律越强 (分数越集中), 这一项越小, 误差上界越低.

代入几个数看看. 取 $k=3$, 令 $\epsilon\to0$, 记 $\rho=B/T_{\max}$, 括号里的项变成 $3-2\rho^{-1/2}$, 上界是 $2.1(1-\rho)(3-2\rho^{-1/2})$:

| $\rho$ | 括号项 | 上界 |
|---|---|---|
| 0.9 | 0.892 | 0.19 |
| 0.8 | 0.764 | 0.32 |
| 0.5 | 0.172 | 0.18 |
| 0.2 | $-1.47$ | 负值 |

两个现象. 一是上界在 $\rho$ 上不单调, 0.8 时比 0.5 和 0.9 时都大, 所以不能简单读成「预算越大误差越小」. 二是 $\rho$ 较小时括号项为负, 上界变成负数, 失去意义; 在 $k=3$ 时, 这发生在 $\rho<4/9$, 也就是压缩超过约 2.25 倍的时候. 而实验中压缩到 5 倍. 这说明定理对参数范围有论文没有写明的要求, 也说明它不能用来解释 5 倍压缩下的结果. 论文正文说这一项「总小于 1」, 但没有说它可能为负.

这个定理的意义在于定性: 预算占比越高, 注意力越集中, 误差越小. 它的前提比较强: 单层单头模型, 奇异值乘积有界, 分数服从特定的幂律分布, 保留集合恰好是 top-$B$. 实际算法用的是低分计数而不是当前分数, $m$ 也远大于 1, 不直接满足定理条件.

## 4. 实验, 相关方法与边界

### 4.1 实验

**设置.** 在 OPT 上比较 ScissorHands 和原始模型. 语言建模用 C4, 下游任务用 Hellaswag, MathQA, PIQA, Winogrande 的 5-shot 设置, 用 lm-eval-harness 评估. 实验在 4 张 A100 40GB 上进行.

**5 倍压缩以内精度不降** (Figure 3). 语言建模中, 困惑度在一定压缩比内保持不变, 模型越大, 精度曲线越平坦. 正文对各模型的描述是: OPT-13B 的困惑度保持到原 KV cache 的 50%, OPT-66B 保持到 75%; 图注则概括为 OPT-66B 直到 5 倍压缩都没有精度下降. 这两处说法的口径对不上 (保持到 75% 只相当于 1.33 倍压缩), 正文那句的语法也有残缺, 只能确定的是大模型对压缩更不敏感. 下游任务对扰动不那么敏感, 但方差更大. Winogrande 和 MathQA 上, OPT-66B 压缩 5 倍后精度仍然保持. 一般来说, 保留原始 KV cache 的 15% 到 30% 就能保持精度. 和语言建模一样, 模型越大效果越好, 论文据此认为 ScissorHands 能随模型规模扩展.

大模型更耐压缩, 这一点在 [FastGen](../05-FastGen-按头自适应/05-FastGen-按头自适应.md) 的 Llama 1 实验中也出现过: 同样的恢复率下, 65B 能压缩的比例远高于 7B. 两篇论文都没有解释原因. 一种可能的解释是, 大模型的头更多, 分工更细, 每个头关注的 token 更少, 注意力分布更接近幂律; 按定理 4.1 的定性结论, 分布越集中, 驱逐的误差越小.

**和 4-bit 量化叠加** (Table 3). 在 2 倍压缩下, 按 FlexGen 的方式加 4-bit 量化, Hellaswag 准确率:

| 模型 | 原始 | ScissorHands | ScissorHands + 4-bit |
|---|---|---|---|
| OPT-6B | 0.702 | 0.706 | 0.704 |
| OPT-13B | 0.720 | 0.720 | 0.720 |

Hellaswag 是 Figure 3 中对压缩最敏感的任务, 加上量化也没有引入叠加的误差. 量化减少每条 KV 的字节数, ScissorHands 减少条数, 两者作用在不同维度. 2 倍 token 压缩加 4-bit 量化 (相对 fp16 再压 4 倍), 总共约 8 倍. 按 Table 1 推算, OPT-175B 在 batch 128, 序列 2048 下的 1152 GB 会降到约 144 GB, 加上 325 GB 权重, 8 张 A100-80GB 可以放下.

**注意力分数的变化** (Figure 4). 在 OPT-13B, C4, 3 倍压缩下, 计算每个注意力分数的变化率 $(\alpha_s-\alpha_o)/\alpha_o$, $\alpha_s$ 是 ScissorHands 的分数, $\alpha_o$ 是原始分数. 变化率集中在 0 附近, 和定理 4.1 一致. 在 $-1$ 附近也有少量分布, 表示 $\alpha_s$ 远小于原始值, 说明少量重要 token 被丢掉了. 被保留 token 的分数在压缩后会略微变大, 因为 softmax 的分母少了被丢掉的项.

### 4.2 和相关方法的关系

| 方法 | 打分 | 驱逐方式 | 预算分配 |
|---|---|---|---|
| [H2O](../02-H2O-Heavy-Hitter-Oracle/02-H2O-Heavy-Hitter-Oracle.md) | 从头累计的注意力分数 | 每步丢一个 | 层间相同 |
| ScissorHands | 历史窗口内的低分次数 | 满了丢 $m$ 个 | 靠后的层更多 |
| [TOVA](../07-TOVA-注意力省略/07-TOVA-注意力省略.md) | 当前步的注意力分数 | 每步丢一个 | 层间相同 |
| [FastGen](../05-FastGen-按头自适应/05-FastGen-按头自适应.md) | 按头画像 | 按头选策略 | 按头不同 |

H2O 和 ScissorHands 是同期工作, 都用历史注意力识别重要 token, 都保留最近 token. FastGen 论文把「局部 + 高频」策略统一用于所有头, 并指出它等同于 H2O 和 ScissorHands. 区别在细节: H2O 的累计分数从序列开始一直累加, 早出现的 token 积累时间长; ScissorHands 只看最近 400 步, 用二值化的低分计数, 对早期 token 的偏向较弱. 后来的 TOVA 走得更远: 不累计历史, 只用当前这一步的注意力分数决定丢谁, 也不单独保留最近窗口. TOVA 论文报告它在语言建模上优于 H2O 和「窗口加开头 4 个 token」等基线, 但没有和 ScissorHands 直接比较. 如果只用当前分数就够了, ScissorHands 的历史窗口和 H2O 的累计就不是必需的. TOVA 的消融还发现, 把同一层各头的分数取平均再决定丢谁, 比每个头各自决定效果更好, 这和 ScissorHands 每个头独立打分的做法不同. 从这个角度看, 重要性持久假设成立时, 当前步的高分 token 和历史上的高分 token 大部分重合, 用哪一种打分差别不大.

两者都只在生成阶段管理 KV, prompt 的 KV 在开始时全部存入, 超出预算后才开始驱逐, [SnapKV](../03-SnapKV-生成前观测窗/03-SnapKV-生成前观测窗.md) 认为这类方法忽略了长 prompt 中的详细信息.

### 4.3 边界

**假设可能不成立.** 重要性持久是经验假设. 持久率在靠后的层会下降; 生成过程中话题转换, 或者问题需要的信息在前文中一直没被关注, 被丢掉的 token 就找不回来. 论文用随机初始化的模型说明这个模式来自训练, 但也承认不了解模型是怎样被训练出这种行为的.

**模型和任务较窄.** 受学术服务器限制, 最大只测到 OPT-66B. 评测是 C4 困惑度和 5-shot 选择类任务, 序列都较短, 没有长文档问答, 长生成或检索类任务. 这些任务正是驱逐类方法最容易出问题的地方.

**预算按层分配依赖离线统计.** 层间预算按 Figure 2 的持久率曲线分配, 这条曲线是在特定模型和数据上测出来的, 换模型需要重新测.

**伪代码和定理有不一致.** 最近窗口置零的写法和注释相反; 定理分析的是 $m=1$ 且按当前分数保留 top-$B$, 实际算法用 $m=0.5B$ 和历史窗口内的低分计数. 实现时要以注释和文字描述为准.

**压缩时的计算.** 每次压缩都要在历史窗口上重新计算注意力或维护计数. 和不输出注意力矩阵的融合 kernel 一起使用时, 需要额外的实现.

**层内各头预算相同.** 预算在层内平均分给各头. 但 [FastGen](../05-FastGen-按头自适应/05-FastGen-按头自适应.md) 显示同一层的头差别很大, 有的只需要几个特殊 token, 有的需要完整 cache. 平均分配会在前者上浪费, 在后者上不够. 论文也没有讨论 GQA 下多个 query 头共享 KV 时如何打分.

**重复生成的问题.** 论文在讨论中提出一个开放问题: 重复注意力模式是否和语言生成中的重复等已知问题有关. 如果有关, 按持久性保留 token 可能会强化这种倾向, 论文没有研究.

## 参考文献

1. Liu, Z., Desai, A., Liao, F., Wang, W., Xie, V., Xu, Z., Kyrillidis, A., Shrivastava, A. (2023). [Scissorhands: Exploiting the Persistence of Importance Hypothesis for LLM KV Cache Compression at Test Time](https://arxiv.org/abs/2305.17118). NeurIPS 2023. arXiv:2305.17118. 第 2–6 节, Table 1–3, Figure 1–5, Algorithm 1–2, 定理 3.1, 4.1.
2. Zhang, Z., Sheng, Y., Zhou, T., et al. (2023). [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048). NeurIPS 2023.
3. Sheng, Y., Zheng, L., Yuan, B., et al. (2023). [FlexGen: High-Throughput Generative Inference of Large Language Models with a Single GPU](https://arxiv.org/abs/2303.06865). ICML 2023.
4. Zhang, S., Roller, S., Goyal, N., et al. (2022). [OPT: Open Pre-trained Transformer Language Models](https://arxiv.org/abs/2205.01068). arXiv:2205.01068.
5. Dao, T., Fu, D. Y., Ermon, S., Rudra, A., Ré, C. (2022). [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135). NeurIPS 2022.
