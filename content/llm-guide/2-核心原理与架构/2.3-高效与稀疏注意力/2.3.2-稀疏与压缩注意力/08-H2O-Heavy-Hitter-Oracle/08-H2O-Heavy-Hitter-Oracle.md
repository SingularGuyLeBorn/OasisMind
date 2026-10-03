---
title: "08 · H2O: 按累计注意力驱逐 KV"
category: "LLM 指南"
published: true
tags: ["H2O", "Heavy-Hitter", "KV-Cache", "Eviction", "NeurIPS 2023"]
excerpt: "H2O 给 KV cache 设一个固定预算, 每生成一个 token 最多驱逐一条 KV. 预算一半留给最近的 token, 一半留给累计注意力分数最高的 heavy hitter. 20% 预算下多数任务和完整 cache 持平, T4 上吞吐最高比 Accelerate 和 DeepSpeed 高 29 倍."
---

# H2O: 按累计注意力驱逐 KV

## 太长不看版

- 稠密训练的模型推理时注意力矩阵很稀疏: OPT 在 WikiText-103 上, 以每行最大值的 1% 为阈值, 几乎所有层的稀疏度都超过 95%. 每一步真正用到的 KV 很少.
- 各 token 的累计注意力分数呈幂律分布, 少数 token 拿走大部分注意力, 论文称为 heavy hitter ($\mathsf{H_2}$). 把它们遮掉, 模型精度大幅下降.
- H2O 的驱逐策略: cache 大小固定为 $k$, 每步加入当前 token 后驱逐一条累计分数最低的 KV, 最近的 token 单独保留. 实验里预算在 $\mathsf{H_2}$ 和最近 token 之间平分.
- 20% 预算 (KV 显存减少 5 倍以上) 下, OPT, LLaMA, GPT-NeoX 在多数任务上和完整 cache 相当. 只留最近 token 的 Local 策略在同样预算下崩溃.
- 实现在 FlexGen 上, T4 上吞吐比 DeepSpeed Zero-Inference 和 HF Accelerate 最高高 29 倍, 比 FlexGen 高 3 倍; A100 上同 batch 时延最多降 1.9 倍.
- 被驱逐的 KV 后面再也读不到. 不微调, 但需要每步拿到注意力权重.

---

## 1. 问题

解码阶段要缓存所有历史 token 的 key 和 value, 避免重复计算. 论文的例子: 30B 参数的模型, batch 128, 序列长 1024, KV cache 是 180 GB. 按 OPT-30B 的结构可以验算: 48 层, 隐藏维度 7168, FP16, 每个 token 的 KV 是 $2\times48\times7168\times2$ 字节, 约 1.38 MB; 乘以 $128\times1024=131072$ 个 token, 约 180 GB. 这比 30B 模型的 FP16 权重 (约 60 GB) 还大好几倍.

自然的想法是像传统软件和硬件 cache 一样给容量设上限. 论文认为一个理想的 KV cache 要同时满足三点: 容量小, 降低显存; 缺失率低, 保持模型质量和长文本生成能力; 驱逐策略开销低, 不拖慢生成. 但有三个难点:

1. 不清楚 KV cache 能不能限制大小. 原则上每一步解码都可能要访问所有历史 KV.
2. 找出保持精度的最优驱逐策略是组合优化问题. 经典 cache 的 Belady 算法 (驱逐未来最晚被访问的条目) 离线最优, 但不适用于 KV cache: 生成是顺序依赖的, 一旦驱逐了重要的 KV, 之后的生成全受影响, 无法挽回.
3. 即使暴力搜出最优策略, 也无法部署.

第二点说的是 KV cache 和传统 cache 的根本差别. 传统 cache 的缺失只影响速度: 数据被换出后再访问, 从下一级存储读回来即可, 结果不变. KV cache 被驱逐的条目通常不再保存在任何地方, 之后的注意力直接少了这一项, 输出改变, 而这个改变又进入后续 token 的生成. 所以 KV cache 的缺失影响的是正确性, 而且误差会沿生成过程传播. 这也是为什么驱逐策略要在不知道未来 query 的情况下, 尽量不丢掉以后还会用到的 token.

## 2. 已有做法

论文讨论了几类相关工作:

- **训练期的稀疏和近似注意力.** Reformer 用局部敏感哈希把复杂度降到超线性, Performer 用正交随机特征近似注意力核, FlashAttention 降低注意力的显存. 论文指出, 这些方法解决的是长序列建模时注意力的平方显存, 仍然需要很大的 cache.
- **减少 cache 的结构.** Sparse Transformer, 低秩 Transformer, multi-query attention 能减少 cache, 但直接用到已经训练好的大模型上, 缺失率高, 精度下降 (论文 Figure 1).
- **学习压缩.** gisting token 能学习压缩文档的 KV, 但驱逐策略开销大, 难以在生成时部署. 另一项工作用可学习的机制在推理时决定需要哪些 token, 但需要额外微调.
- **SpAtten.** 同样用累计注意力分数选择重要 token, 但把分数在注意力头和层之间累加. H2O 让每个头, 每一层独立决定保留哪些 token (附录 C.9).

- **传统 cache 策略.** 论文在相关工作里提到 LRU (最近最少使用) 和 LFU (最不经常使用), 它们分别按访问的时近性和频率决定驱逐. 对照来看, H2O 的两部分预算正好对应这两种思路: 最近窗口按时近性保留, $\mathsf{H_2}$ 按累计注意力保留, 累计注意力可以看作带权重的访问频率.

论文关注的是生成阶段. 推理分两个阶段: prompt 阶段用输入序列生成 KV cache, 和训练时的前向类似; 生成阶段逐个生成新 token, 读取并更新 KV cache. H2O 优化的是后者.

## 3. 观察

### 3.1 注意力很稀疏

对 $\mathrm{Softmax}(QK^\top)$, 论文以每一行最大值的 1% 为阈值, 低于阈值的算作零. 用预训练 OPT 在 WikiText-103 验证集上做零样本推理, 几乎所有层的稀疏度都超过 95% (Figure 2(a)). 论文据此推断, 每一步只需要约 5% 的 KV 就能算出相同的输出, KV cache 有望在不掉精度的情况下缩小到 1/20.

这里的稀疏度是按阈值数出来的条目比例. 低于最大值 1% 的条目单个很小, 但数量多, 加起来未必可以忽略. NSA 论文引用 MagicPIG 的观察: 取分数最高的 20% 只能覆盖总注意力的 70%. 所以「95% 的条目可以忽略」不等于「丢掉它们输出几乎不变」, 还要看被丢条目的总质量.

这个推断还有一个前提: 每一步用到的 5% 是哪 5%, 事先要知道. 不同步用到的 KV 可能不同, 而驱逐是不可逆的, 所以稀疏度只说明了可能性, 具体留哪些还要靠下面的观察.

### 3.2 heavy hitter

把注意力块里每个 token 收到的注意力分数累加起来, 分布呈幂律 (Figure 2(b)): 少数 token 累计分数很高. 论文称这些 token 为 heavy hitter. 两个验证:

- 每个词的累计注意力分数和它在数据中的共现次数高度相关. 常和其他词一起出现的词, 被注意得也多.
- 把 heavy hitter 遮掉, 模型精度急剧下降 (Figure 2(c)).

累计分数和共现次数相关, 可以这样理解: 一个词如果常和各种词一起出现, 后面很多 token 在建模时都会参考它, 它累计到的注意力自然多. 这类词在不同的上下文里都可能被用到, 留下它们比留下只和个别 token 相关的词更划算. 论文没有进一步区分这些词是功能词还是内容词.

基于此, 论文先做了一个实验: cache 里只保留 $\mathsf{H_2}$ 和最近的 KV, 直觉是最近的词通常和当前 token 关系更强. 在 OPT-30B 和六个下游任务上, 这个策略大幅减小 cache 而不掉精度.

### 3.3 局部统计就够

上面的 $\mathsf{H_2}$ 是用整个序列的注意力 (包括未来 token 的) 统计出来的, 部署时拿不到未来的 token. 记 $A_{tj}$ 为位置 $t$ 对位置 $j$ 的注意力, 理想的全局分数是

$$
S_j^{\mathrm{global}}=\sum_{t>j}A_{tj}, \tag{1}
$$

求和要用到还没生成的位置. 论文发现, 每一步只用已经出现过的 query 累加分数 (局部统计) 效果和全局统计一样好 (Figure 2(d), 20% 预算). 这一点使 H2O 可以部署.

## 4. 方法

### 4.1 带驱逐的生成过程

设 $Q,K\in\mathbb{R}^{n\times d}$, $Q_{i,*}$ 是第 $i$ 行, 预算为 $k$. 记 $S_i\subset[n]$ 为预测第 $i$ 个 token 时 cache 里的 token 集合. 驱逐策略 $g:S_{i-1}\to S_i$ 满足两个约束 (Definition 2.1):

$$
|S_i|=k,\qquad |S_i\setminus S_{i-1}|\le1. \tag{2}
$$

第一个约束是 cache 大小不随时间变化, 第二个是每步最多换出一条 KV. 生成第 $i$ 个 token 时能拿到的信息是 cache 内 token 上的归一化注意力 (Definition 2.2):

$$
o_i=D_i^{-1}\cdot\exp\bigl(Q_{i,*}K_{S_i,*}^\top\bigr),\qquad D_i=\bigl(\exp(Q_{i,*}K_{S_i,*}^\top)-\mathbf{1}_{[i]\setminus S_i}\bigr)\cdot\mathbf{1}_i. \tag{3}
$$

$o_i$ 是长 $i$ 的向量, 被驱逐的位置置零, 计算归一化分母 $D_i$ 时要把它们扣掉. 式里减去 $\mathbf{1}_{[i]\setminus S_i}$ 的写法是这个意思: 对不在 cache 里的位置, 先按 $\exp(\cdot)$ 记为 1 再减掉, 不计入分母.

### 4.2 驱逐规则

H2O 的驱逐策略 (Definition 4.3) 在满足式 (2) 的前提下, 先把当前 token $i$ 加进来, 再从 $k+1$ 个候选中去掉一个:

$$
u=\arg\max_{v\in S_{i-1}\cup\{i\}}F_{\mathrm{score}}\bigl((S_{i-1}\cup\{i\})\setminus\{v\}\bigr),\qquad S_i=(S_{i-1}\cup\{i\})\setminus\{u\}. \tag{4}
$$

$F_{\mathrm{score}}$ 取集合上注意力分数之和, $F_{\mathrm{score}}(T)=\sum_{s\in T}o_s$. 去掉 $v$ 后剩余和最大, 等价于去掉分数最小的那一个. 所以每步的操作就是: 加入新 token, 驱逐分数最低的 token. 新 token 本身也在候选里, 理论上可能刚进来就被驱逐. 前 $k$ 步 cache 没满, 只加不删.

Algorithm 1 第 10 行把 $F_{\mathrm{score}}$ 写成当前这一步注意力 $o_i$ 的和; 正文和 Figure 3 描述的是按累计注意力分数驱逐, 即每个 token 的分数是它在各步得到的注意力之和. 两者的区别是分数只看当前一步还是累加历史. 论文的观察 (3.3 节) 是针对累计的局部统计说的.

实验中预算在两部分之间平分 (5.1 节): 一半给 $\mathsf{H_2}$, 一半给最近的 token. 最近的 token 不参与按分数的驱逐, 按时间顺序滑出. 这样新 token 不会因为刚进来累计分数低而马上被驱逐.

单独留最近窗口还有一个原因. 累计分数对早出现的 token 有利: token $j$ 从第 $j+1$ 步开始累加, 到第 $i$ 步已经加了 $i-j$ 次, 而刚出现的 token 只加了一两次. 如果所有 token 都按累计分数竞争, 新 token 几乎总是分数最低的, 一进来就被驱逐, cache 会逐渐只剩很早的 token. 最近窗口让新 token 先有一段不参与竞争的时间, 等它们滑出窗口时, 已经累计了 $k/2$ 步左右的分数, 再和老 token 比较才相对公平. 论文没有讨论按出现时长归一化分数的做法.

### 4.3 手算一例

预算 $k=4$, 两个给最近 token, 两个给 $\mathsf{H_2}$. 设到第 6 步时, cache 里是 token 1, 2, 4, 5, 累计分数分别是 1.6, 0.3, 0.5, 0.4, 其中 4, 5 是最近的两个. 生成第 6 个 token 时:

1. token 6 加入, 成为最近 token 之一; token 4 滑出最近窗口, 进入按分数竞争的部分.
2. 竞争部分现在是 token 1, 2, 4, 分数 1.6, 0.3, 0.5 (加上这一步各自得到的注意力后再比较, 这里为简化省略).
3. 驱逐分数最低的 token 2. cache 变成 1, 4, 5, 6.

token 1 的分数远高于其他 token, 只要它以后还持续收到注意力, 就会一直留在 cache 里. token 2 被驱逐之后, 后面的 query 再也看不到它. 如果第 50 步需要 token 2 的信息, 只能从其他 token 间接获得.

### 4.4 理论

论文把驱逐过程写成动态子模最大化问题 (Definition 4.1): 对任意已固定的集合 $Z$, 假设 $f(\cdot)=F(Z,\cdot)$ 是子模函数, 即边际收益递减:

$$
f(X\cup\{x\})-f(X)\ge f(Y\cup\{x\})-f(Y),\qquad Z\subset X\subset Y,\ x\notin Y. \tag{5}
$$

$X$ 是 cache 里已有的词, $Y$ 是任意超集, $x$ 是新加入或被删除的词. 在这个假设下, Theorem 4.4 (非正式) 给出: 每个 token 按 top-$k$ 贪心计算注意力分数时, 得到的集合 $\widetilde S_i$ 满足

$$
f(\widetilde S_i)\ge(1-\alpha)(1-1/e)\max_{|S|=k}f(S)-\beta, \tag{6}
$$

$\alpha,\beta>0$ 是参数. $(1-1/e)\approx0.632$ 是经典结果: 单调子模函数在基数约束下, 贪心算法的解至少达到最优值的 $1-1/e$. 式 (6) 在此基础上多了两项损失: $(1-\alpha)$ 来自每步只能换一个元素, 不能从头重选; $\beta$ 是加性误差. 论文说明这个定理用来解释为什么贪心算法能给出好解; 注意力是否满足子模性是一个假设, 论文没有验证.

### 4.5 实现

H2O 实现在 FlexGen 上. FlexGen 是 OPT 模型的白盒实现, 论文改了它的 KV cache 处理, 可以插入不同的驱逐算法. 为了 I/O 效率, 驱逐时不移动显存, 新的 KV 直接写进被驱逐的槽位. 这样 cache 是固定大小的连续张量, 槽位顺序和 token 顺序不再一致; 用相对位置编码的模型需要另外记录每个槽位的原始位置, 论文没有展开这一点.

### 4.6 额外开销

按算法推算 H2O 每步额外做的事. 对每一层的每个头: 把这一步的注意力权重加到 cache 内各 token 的累计分数上, 是 $k$ 次加法; 在按分数竞争的那一半里找最小值, 最多 $k$ 次比较, 用堆可以降到 $O(\log k)$; 把新 KV 写进被驱逐的槽位. 这一步注意力本身要做 $k$ 次 $d$ 维内积和 $k$ 次 $d$ 维加权求和, 额外开销相比之下很小.

额外显存是每个缓存 token, 每个头一个累计分数. 以 OPT-30B 为例, 48 层, 56 个头, 每个分数用 FP32 存, 每个 token 是 $48\times56\times4$ 字节, 约 10.5 KiB, 而它的 KV 约 1.38 MB, 分数只占不到 1%.

每个头各自维护分数, 各自决定驱逐谁, 所以同一层不同头的 cache 里可能是不同的 token. 这给了每个头更多灵活性, 也是论文和 SpAtten 的主要区别之一; 代价是不同头的 KV 不能共享同一组索引, 对 GQA 这类多个头共享 KV 的结构, 需要另外决定组内怎么统一.

## 5. 实验

### 5.1 精度

模型有 OPT (6.7B 到 175B), LLaMA, GPT-NeoX-20B; 任务来自 HELM 和 lm-eval-harness: COPA, MathQA, OpenBookQA, PiQA, RTE, Winogrande, XSUM, CNN/Daily Mail, 另有 AlpacaEval 和 MT-bench. 单张 A100 80GB. 对照包括完整 cache, Local (只留最近的 KV), Sparse Transformer 的 strided 和 fixed 两种模式, 以及用更少示例 (0-shot, 1-shot) 的完整 cache. 后者的序列长度和 20% 预算下的 5-shot 相近.

预算从 4% 到 100% 扫描 (Figure 4), 主要结论:

1. 各种预算下 H2O 都明显优于 Local.
2. 预算低于 20% (显存减少 5 倍以上) 时, H2O 和完整 cache 相当.
3. 20% 预算大约相当于每条输入保留 1.2 个示例, H2O 仍然好于 0-shot 和 1-shot 的完整 cache.
4. XSUM, CNN/Daily Mail 这类长生成任务上也有效. LLaMA-13B 的 XSUM 和 LLaMA-7B 的 CNN/Daily Mail 上, Local 在 60% 预算就崩溃, H2O 在 20% 预算仍和完整 cache 持平.

部分任务上 H2O 甚至超过完整 cache, 例如 OPT-66B 的 RTE, OPT-30B 的 MathQA. 论文认为这是一种正则化效果.

Table 1 (论文未注明模型, 5-shot):

| 方法 | PiQA | COPA | OpenbookQA | Winogrande |
|---|---|---|---|---|
| 完整 cache | 80.09 | 81.00 | 44.80 | 71.51 |
| 0-shot 完整 | 78.89 | 76.00 | 41.40 | 70.00 |
| 1-shot 完整 | 79.11 | 76.00 | 43.60 | 70.24 |
| Local | 57.94 | 56.00 | 28.40 | 51.30 |
| H2O | 79.22 | 85.00 | 43.80 | 71.67 |

H2O 的 COPA 是 85.00, 比完整 cache 的 81.00 还高 4 分; COPA 题目不多, 4 分的差距可能部分来自随机波动, 论文没有报告多次运行的方差. 0-shot 和 1-shot 的完整 cache 都低于 H2O, 说明在相近的 KV 长度下, 保留 5 个示例中被注意得多的部分, 比完整保留一两个示例更有用.

**$\mathsf{H_2}$ 也能帮其他稀疏模式.** Sparse Transformer 的 strided 模式让每个位置看最近一段加上固定步长间隔的位置, fixed 模式把序列分成固定块, 看块内和各块末尾的汇总位置; 两者保留哪些位置都和内容无关. Table 2 在 OPT-30B, 20% 预算下, 给 Local 和两种 Sparse Transformer 模式各加上 $\mathsf{H_2}$. 不加时 COPA 只有 48 到 61, 加上后回到 76 到 84 (完整 cache 85). strided 模式加 $\mathsf{H_2}$ 后, PiQA 从 56.20 到 78.24, Winogrande 从 47.59 到 69.61.

**两部分缺一不可.** Table 9 分别只留 $\mathsf{H_2}$, 只留最近 token, 以及两者都留:

| 任务 | 模型 | 完整 | 只留最近 | 只留 $\mathsf{H_2}$ | 两者都留 |
|---|---|---|---|---|---|
| PiQA | OPT-13B | 77.37 | 54.62 | 76.12 | 77.26 |
| PiQA | OPT-30B | 78.51 | 55.82 | 67.25 | 78.45 |
| OpenBookQA | OPT-30B | 43.20 | 25.20 | 26.60 | 43.00 |
| MathQA | OPT-30B | 26.23 | 20.87 | 21.98 | 26.87 |
| Winogrande | OPT-30B | 70.24 | 49.17 | 47.36 | 69.06 |

只留一部分时, 相对完整 cache 下降 2.85% 到 22.75%; 两者都留就能保持. 论文说只留 $\mathsf{H_2}$ 一致好于只留最近 token, 但表中 OPT-30B 的 Winogrande 是 47.36 对 49.17, 是个例外.

**与 SpAtten 对比** (Table 11, OPT-30B): COPA 82.00 对 84.00, OpenBookQA 41.90 对 43.00, PiQA 77.06 对 78.45, H2O 都更高.

**示例数** (Q2): 0-shot 到 10-shot, H2O 和完整 cache 的差距都小于 1%, Local 最多下降 37%.

**量化** (Table 6, OPT-30B): H2O 和 4-bit 量化叠加, COPA 84.00, OpenBookQA 43.20, PiQA 78.80, 几乎总是不差于单独使用任一种. 论文原本预期稀疏和量化叠加会放大误差, 结果相反.

### 5.2 吞吐和时延

所有速度结果是端到端的, 包括 prefill 和生成, 也包括构造 H2O cache 的时间. 指标是生成 token 数除以 (prompt 时间 + 解码时间). T4 (16GB) 上按 FlexGen 论文的设置, 合成数据把 prompt 填充到等长, 模型和 KV 放不下单卡时开启 CPU offload.

T4, 合成数据, 512+512 (prompt 512, 生成 512), token/s, 括号里是 batch 大小和是否 offload:

| 系统 | OPT-6.7B | OPT-30B |
|---|---|---|
| Accelerate | 15.5 (1, GPU) | 0.6 (8, CPU) |
| DeepSpeed | 9.6 (16, CPU) | 0.6 (4, CPU) |
| FlexGen | 16.8 (1, GPU) | 8.5 (80, CPU) |
| H2O (20%) | 51.7 (4, GPU) | 18.83 (416, CPU) |

OPT-30B 上 H2O 的 18.83 对 Accelerate 和 DeepSpeed 的 0.6, 约 31 倍, 摘要写作最高 29 倍; 对 FlexGen 约 2.2 倍. 真实数据 XSUM 上 (Table 4), OPT-6.7B 的 FlexGen 为 10.80, H2O 为 30.40, 约 2.8 倍, 对应摘要的 3 倍. 提速来自两点: 省下的显存让 batch 可以开得更大; 有些设置从需要 offload 变成不需要.

为什么 batch 大了吞吐就高? 解码每步都要把全部权重从显存读一遍, 一个 batch 里的所有序列共享这次读取. batch 越大, 每个生成 token 分摊的权重读取越少. 限制 batch 的往往是 KV cache. 粗略估一下 OPT-6.7B 在 T4 上的情况: FP16 权重约 13.4 GB, 16 GB 显存里剩下约 2.6 GB, 还要放激活等. 32 层, 隐藏维度 4096, 每个 token 的 KV 是 512 KiB, 512+512 的一条序列最多 1024 个 token, 完整 cache 约 512 MiB; 20% 预算约 100 MiB. 表里 FlexGen 在这个设置下 batch 是 1, H2O 是 4, 和这个量级吻合. OPT-30B 的权重本身就放不下 T4, 两者都要 offload, 此时 H2O 的 KV 小, 能开到 batch 416, 而 FlexGen 只有 80.

A100 上测了 4K 到 10K 的长度 (Table 5). 同 batch 下 H2O 时延降低 1.1 到 1.9 倍: 2048+2048, OPT-6.7B, batch 24 时从 99.5 s 降到 53.5 s; 7000+1024, OPT-30B, batch 1 时从 57.0 s 降到 50.4 s. 显存省下来后 batch 可以从 24 开到 64 (FlexGen 在 64 时显存溢出), OPT-6.7B 吞吐从 494.1 提到 1161.0 token/s, 约 2.3 倍. OPT 只在 2K 长度上训练过, 论文说明这些长度只用来测吞吐和时延, 不代表模型在这些长度上的质量.

### 5.3 其他发现

**无限长输入** (Q1): 参照 StreamingLLM 保留开头若干 token 并在 cache 内滚动位置的做法, 论文把 H2O 用于无限长输入, 在 PG-19 第一个样本上处理到 400 万 token, 各种 cache 大小下困惑度都低于原版 StreamingLLM (Figure 5). 论文的解释是 StreamingLLM 固定保留开头和最近 token, 不管内容, 难免丢掉关键信息.

**生成多样性** (Q5): 同样的 prompt 下, H2O 生成的句子重复词更少 (附录 C.1). 论文只给了生成样例的对比, 没有给出多样性的量化指标.

**MLP 里也有 heavy hitter** (附录 C.10): OPT-6.7B 的 MLP 隐层神经元激活频率也呈幂律, 少数神经元几乎被所有 token 激活. 在 WikiText-103 上训练的 GPT-2 中, 剪掉激活频率超过 20% 的神经元, 困惑度从 19.32 升到 31.78, 用 1% 的训练数据微调 500 步就恢复到 19.86; 而只用 1% 数据从头训练, 困惑度是 554.12. 论文据此认为 $\mathsf{H_2}$ 里编码的知识很容易恢复. 另外两个观察: 用 OPT-1.3B 在 WikiText-103, Penn Treebank, Amazon Review 三种数据上统计, MLP 中 $\mathsf{H_2}$ 的位置高度重合; $\mathsf{H_2}$ 在训练早期就出现, 之后位置逐渐变化. 这部分和 KV cache 驱逐没有直接关系, 论文用它说明 heavy hitter 是大模型里普遍存在的现象.

## 6. 和相关方法的关系

| 方法 | 保留哪些 KV | 依据 | 驱逐后能否找回 |
|---|---|---|---|
| H2O | 最近 token + 累计分数高的 token | 历史注意力 | 否 |
| [StreamingLLM](../07-StreamingLLM与Attention-Sink/07-StreamingLLM与Attention-Sink.md) | 开头 4 个 + 最近窗口 | 固定位置 | 否 |
| [ScissorHands](../12-ScissorHands-重要性持久/12-ScissorHands-重要性持久.md) | 历史窗口内重要的 token | 重要性持续假设 | 否 |
| [TOVA](../13-TOVA-注意力省略/13-TOVA-注意力省略.md) | 当前一步注意力高的 token | 只看当前步 | 否 |
| [SnapKV](../09-SnapKV-生成前观测窗/09-SnapKV-生成前观测窗.md) | prompt 末尾观测窗选出的 prompt KV | 生成前一次性选 | 否 |
| [Quest](../14-Quest-查询感知稀疏/14-Quest-查询感知稀疏.md) | 全部保留, 每步选页 | 当前 query | 不驱逐 |

Local 在低预算下崩溃, 可以用 StreamingLLM 的发现解释: 只留最近 token 时, 序列开头的 token 被移出, 而它们正是吸收大量注意力的 attention sink, softmax 分母失去一大块, 输出分布偏离训练时的形状. H2O 按累计分数保留, 开头 token 收到的注意力多, 累计分数高, 一般会被留在 cache 里, 等于自动保住了 sink. H2O 论文发表时 attention sink 的概念还没有提出, 论文没有这样解释, 这是事后的对照.

H2O 和 StreamingLLM 都保留最近的 token, 区别在另一部分: StreamingLLM 固定留开头, H2O 按分数留, 开头 token 如果累计分数高也会被留下. 论文的 Q1 实验是把两者结合: 保留 sink, 按 H2O 选其余 token.

## 7. 边界

1. **驱逐不可逆.** 被驱逐的 KV 后面再也读不到 (论文 Figure 3 的说明). 生成到后半段才需要前半段某处细节的任务, 风险最大. H2O 依赖的假设是「过去被注意得多的 token, 以后还会被注意」, 这在论文的任务上成立, 但没有保证.
2. **需要拿到注意力权重.** 每步要知道每个缓存 token 得到的注意力分数才能累加. 按算法推算, 这和不输出完整注意力矩阵的融合 kernel (如 FlashAttention) 不直接兼容, 需要额外输出或重算分数. 论文的实现基于 FlexGen, 没有讨论这个问题.
3. **prompt 阶段不加速.** 论文只优化生成阶段. prompt 阶段仍算完整注意力, 而且要在这一阶段统计分数, 决定哪些 prompt KV 留下. NSA 论文据此把 H2O 归为只在一个阶段稀疏的方法.
4. **任务长度有限.** 精度实验多为 5-shot 分类和摘要, 序列在 OPT 的 2K 窗口以内. 长于 2K 的 A100 实验只报告速度.
5. **预算分配是固定的.** 两部分各占一半, 所有层, 所有头都用同样的预算. 按层或按头分配不同预算的做法见 [PyramidKV](../10-PyramidKV-层间漏斗/10-PyramidKV-层间漏斗.md) 和 [FastGen](../11-FastGen-按头自适应/11-FastGen-按头自适应.md).
6. **理论依赖未验证的假设.** 式 (6) 的保证建立在注意力满足子模性的假设上, 论文没有验证这个假设在实际模型中是否成立.
7. **对位置编码的影响没有讨论.** 驱逐后 cache 里的 token 在原文中不连续. 对 OPT 这样的绝对位置编码, 位置在写入 KV 前就加好了, 不受影响; 对 RoPE 模型, 是按原文位置还是重新编号, 论文没有说明.

## 参考文献

1. Zhang, Z., Sheng, Y., Zhou, T., et al. (2023). [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048). NeurIPS 2023. arXiv:2306.14048. Definition 2.1, 2.2, 4.1, 4.3, Algorithm 1, Theorem 4.4, Table 1–6, 9, 11, Figure 2–5, 附录 C. 代码: [FMInference/H2O](https://github.com/FMInference/H2O).
2. Sheng, Y., Zheng, L., Yuan, B., et al. (2023). [FlexGen: High-Throughput Generative Inference of Large Language Models with a Single GPU](https://arxiv.org/abs/2303.06865). ICML 2023.
3. Wang, H., Zhang, Z., Han, S. (2021). [SpAtten: Efficient Sparse Attention Architecture with Cascade Token and Head Pruning](https://arxiv.org/abs/2012.09852). HPCA 2021.
4. Xiao, G., Tian, Y., Chen, B., Han, S., Lewis, M. (2024). [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453). ICLR 2024.
5. Yuan, J., Gao, H., Dai, D., et al. (2025). [Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089). arXiv:2502.11089.
