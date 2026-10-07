---
title: "05 · FastGen: 按注意力头选择 KV 压缩策略"
category: "LLM 指南"
published: true
tags: ["FastGen", "KV-Cache", "Adaptive-Compression", "Attention-Profiling", "ICLR 2024"]
excerpt: "不同注意力头的模式不同: 有的只看局部, 有的只看特殊 token 和标点, 有的看全部. FastGen 在 prompt 编码时对每个头做一次画像, 选出能以最小 cache 恢复注意力图的策略, 生成阶段按策略管理该头的 KV."
---

# FastGen: 按注意力头选择 KV 压缩策略

## 1. 统一驱逐策略的问题与已有做法

### 1.1 显存与卸载的代价

KV cache 保存之前算过的 key 和 value, 生成时复用, 避免重复计算, 代价是额外的显存. 模型越大, 生成越长, KV cache 增长越快. 显存不够时, 常见做法是把 KV cache 卸载到 CPU 或 NVMe, 但很多设备上 GPU 和 CPU 之间的 PCIe 带宽有限, 卸载会明显拖慢推理. 所以需要在不重新训练, 不微调的前提下减少 KV cache 的显存.

论文的出发点是注意力模块中存在大量结构, 并非所有注意力模块都需要关注所有 token. 如果能识别每个头的结构, 按结构压缩, 就能在保持模型功能的同时节省显存.

### 1.2 已有做法

**非自回归模型的 token 剪枝.** PoWER-BERT 按注意力分数去掉 BERT 中冗余的词, Funnel-Transformer 在编码器中加池化层压缩序列, 还有方法学习选择关键 token 或学习剪枝阈值. 这些方法只能用于非自回归模型, 且通常需要重新训练, 不适合 Llama 这类自回归模型.

**自回归模型的 KV 压缩.** Mu et al. (2023) 学习把 prompt 压缩成少数特殊 token, 需要重新训练. 同期的 H2O, ScissorHands, FlexGen 用累计注意力分数识别重要 token. 它们都是单一的驱逐策略, 所有头用同一套规则.

**注意力头的结构分析.** 对 BERT 的研究发现, 有的头始终关注相邻 token (Voita et al., 2019), 有的头主要关注分隔符或相邻 token (Clark et al., 2019; Kovaleva et al., 2019), 同一层的头对性能的影响不同 (Michel et al., 2019). 这些研究大多针对编码器. FastGen 在仅解码器模型上观察到了类似的稳定模式, 并用它来设计 KV cache.

FastGen 不研究某一种驱逐策略, 而是组合多种策略, 让每个头用最适合自己的那种.

## 2. 观察

### 2.1 不同头的结构不同

论文用 Llama 1 65B 和 GSM8K 的随机样本分析注意力结构.

以恢复率 0.95 做画像, 统计第 1, 10, 20, ..., 80 层的画像结果分布 (Figure 3). 不同层的头结构差别很大:

- 最前面和最终面的层, 有更多的头被分配到完整 cache, 说明这些层的头倾向于关注所有 token.
- 中间层大多数头主要关注特殊 token, 也就是特殊 token 上的累计注意力分数超过 0.95.

中间层大量头集中在特殊 token 上, 和 [StreamingLLM](../01-StreamingLLM与Attention-Sink/01-StreamingLLM与Attention-Sink.md) 中的 attention sink 是相近的现象: 句首 token 往往就是特殊 token, 很多头把多余的注意力放在那里. FastGen 的特殊 token 策略可以看作对这类头的极端压缩, 只留 sink, 不留窗口. 区别在于 StreamingLLM 对所有头都保留 sink 加窗口, FastGen 只对确实只看 sink 的头这样做, 其他头另选策略.

Figure 1 还展示了同一层中三个头的注意力构成, 同一层内的头也各不相同. 论文的结论是: 对所有层用同一种 KV cache 不是最优的, 应该检测每个头的结构, 再选择压缩策略.

### 2.2 结构在一个序列内保持稳定

对同一个 prompt, 在第 1 步 (prompt 编码), 第 10, 20, 30 步解码时分别计算各头的累计注意力分数 (Figure 4). 分数有一些波动, 但模式相对稳定. 例如, 第 33 层第 0 头和第 23 层第 2 头几乎只关注特殊 token; 第 23 层第 0 头中局部性和标点起重要作用; 第 23 层第 3 头有超过 10% 的注意力分配给「其他」部分, 适合用完整 cache. 另外, 所有情况下都有很大一部分注意力落在特殊 token 上.

这一节给出了 FastGen 两个设计的依据: 结构稳定, 所以只在 prompt 编码时做一次画像就够了; 特殊 token 普遍重要, 所以所有混合策略都包含特殊 token.

## 3. 方法

### 3.1 两个阶段

生成式推理分两步: prompt 编码时, 所有 token 的 KV 一次算出并存入 cache; token 生成时, 每步编码上一步生成的 token, 把它的 KV 追加到 cache. 不压缩的话, KV cache 随生成长度线性增长.

FastGen 在这两步上分别做:

- **prompt 编码** (论文 Algorithm 1): 对每个注意力头 $H_i$, 算出 $\mathbf{K}^i,\mathbf{Q}^i,\mathbf{V}^i$ 和注意力图 $\mathbf{A}^i=\mathrm{softmax}(\mathbf{Q}^i\mathbf{K}^{i\top})$, 用式 (1) 选出最优策略 $\mathbf{C}^i$, 按策略压缩得到 $\hat{\mathbf{K}}^i,\hat{\mathbf{V}}^i$.
- **token 生成** (论文 Algorithm 2): 每一步, 每个头用新 token 和自己的压缩 cache 计算注意力, 再按 $\mathbf{C}^i$ 决定这一步之后 cache 里留下哪些 KV.

### 3.2 画像: 选满足恢复率的最省策略

对压缩策略 $\mathbf{C}$, 记压缩后的 cache 为 $\mathbf{K}_\mathbf{C},\mathbf{V}_\mathbf{C}=f(\mathbf{K},\mathbf{V},\mathbf{C})$. 画像要找能以恢复率 $T$ 恢复注意力图 $\mathbf{A}$, 且显存最小的策略 (论文式 (1)):

$$
\mathbf{C}^*=\mathop{\arg\min}_{\mathbf{C}\in\mathcal{C}}\ \mathrm{CacheMemoryCost}(\mathbf{C})\quad\text{s.t.}\quad\big|\mathbf{A}-\mathrm{softmax}(\mathbf{Q}\mathbf{K}_\mathbf{C}^\top)\big|\le1-T. \tag{1}
$$

$\mathcal{C}$ 是所有可行策略的集合, $\mathrm{CacheMemoryCost}(\mathbf{C})$ 是策略 $\mathbf{C}$ 的目标 cache 预算, $T$ 是预先设定的超参, 表示希望恢复多少注意力图. 论文在 3.4 节和 4.1 节的描述更直观: 一个头被判给「特殊 token」策略, 意思是这个头落在特殊 token 上的累计注意力分数超过 $T$. 也就是说, 约束可以理解为: 策略保留的 token 上的注意力质量之和至少是 $T$.

两种理解之间差一个常数, 可以推一下. 对某一行注意力 $a$, 设策略保留的位置集合为 $S$, 保留位置上的注意力质量是 $m=\sum_{i\in S}a_i$. 只用 $S$ 中的 key 重新做 softmax, 相当于把保留位置的权重除以 $m$, 其余位置变成 0. 两者的 L1 距离是

$$
\sum_{i\notin S}a_i+\sum_{i\in S}a_i\Big(\frac1m-1\Big)=(1-m)+(1-m)=2(1-m). \tag{3}
$$

如果式 (1) 的范数按逐行 L1 理解, 约束就是 $m\ge1-(1-T)/2$. $T=0.95$ 时要求保留质量至少 0.975, 比「质量至少 $T$」更严. 论文没有写明范数和归一化方式, 两种读法都说得通, 但它们说的是同一件事: 策略保留的 token 要覆盖这个头几乎全部的注意力质量. 被丢掉的部分越少, 重新归一化带来的偏差也越小.

画像的规模也值得算一下. Llama 1 65B 有 80 层, 每层 64 个头, 共 5120 个头, 每个头从 5 个候选中选一个. 每个头的选择只需要它自己在 prompt 上的注意力图, 不需要跨头协调, 各头可以并行判断.

这个方法的前提是一个头的注意力结构在整个生成过程中稳定, 所以用编码后的 prompt 选策略就够了. 论文提到 H2O 和 ScissorHands 为「只用 prompt 捕捉全文注意力结构」给出了理论依据, 第 2.2 节的观察是经验上的验证.

### 3.3 四种基础策略

除了完整 cache, 论文用四种基础策略:

- **特殊 token** $\mathbf{C}_{\mathrm{special}}$: 只保留特殊 token, 例如句首 token, 指令 token [INST] 等.
- **标点** $\mathbf{C}_{\mathrm{punct.}}$: 只保留标点 token, 例如「.」「:」「?」.
- **局部** $\mathbf{C}_{\mathrm{local}}$: 驱逐远距离上下文. 上下文 token 和当前 token 的相对距离超过阈值时, 驱逐它的 KV. 阈值由局部窗口长度占输入长度的比例 $r_l$ 决定.
- **高频** $\mathbf{C}_{\mathrm{frequent}}$: 即 heavy hitter. 记录每个 token 的累计注意力分数, 当作 token 的「频率」, 只保留频率最高的 token, 数量占当前序列长度的比例为 $r_f$.

实验中 $r_l=r_f=0.3$, 只通过 $T$ 控制压缩率.

这组比例也给出了单个头能压到多小. 局部和高频各保留 30% 的位置, 两者不重叠时合起来是 60%, 再加上少量特殊 token 和标点. 所以一个头一旦用上 $\mathbf{C}_{\mathrm{special+punct.+frequent+local}}$, 最多也只省约 40%; 要省得更多, 只能靠落在前三个策略上的头. 这段是按 $r_l,r_f$ 推算的. 反过来说, Table 1 里压缩比例超过一半的配置, 一定有很多头落在了只留特殊 token 和标点的策略上.

### 3.4 混合策略

实际中常需要把几种策略组合起来, 两种策略相加表示取它们保留 token 的并集. 组合数很多, 论文用贪心法构造了一个小集合 (论文式 (2)):

$$
\mathcal{C}=\{\mathbf{C}_{\mathrm{special}},\ \mathbf{C}_{\mathrm{special+punct.}},\ \mathbf{C}_{\mathrm{special+punct.+frequent}},\ \mathbf{C}_{\mathrm{special+punct.+frequent+local}},\ \mathbf{C}_{\mathrm{full}}\}. \tag{2}
$$

所有混合策略都包含特殊 token, 理由有两点: 注意力分数通常大量分配给特殊 token, 它们对恢复注意力图很关键; 一句话里的特殊 token 通常少于 5 个, 几乎不占显存. 标点也是因为数量少, 常被用作组合的一部分.

式 (2) 是一条从便宜到贵的链. 画像时从第一个开始试, 第一个满足恢复率约束的就是最省的, 因为后一个策略保留的 token 是前一个的超集. 例如, 一个头如果只看特殊 token 就能恢复 95% 的注意力, 它的 cache 只有几条; 如果要加上标点和高频 token 才够, cache 是特殊 token, 标点和约 30% 的高频 token; 四种都加上仍不够, 就用完整 cache.

**手算一例.** 设 prompt 长 1000, 其中特殊 token 3 个, 标点 80 个, $T=0.95$. 某个头在特殊 token 上的注意力质量是 0.70, 加上标点是 0.82, 再加上累计分数最高的 300 个 token 是 0.96. 前两个策略不满足约束, 第三个满足, 这个头被分配到 $\mathbf{C}_{\mathrm{special+punct.+frequent}}$, cache 最多约 $3+80+300=383$ 条 (三部分可能重叠). 另一个头只看特殊 token 就有 0.97, 只留 3 条. 第三个头四种都加上也只有 0.90, 留下全部 1000 条. 三个头的 cache 大小相差两个数量级, 这就是按头自适应的好处.

### 3.5 生成阶段

生成时, 每个新 token 的 KV 先算出来, 再按该头的策略决定是否保留. 对特殊 token 策略的头, 新 token 不是特殊 token 就不留; 对局部策略, 超出窗口的旧 token 被驱逐; 对高频策略, 累计分数持续更新, 按比例 $r_f$ 保留分数最高的. 完整 cache 的头照常追加. 由于局部和高频策略的预算按序列长度的比例设定, 这类头的 cache 仍随长度增长, 只是增速降为原来的一部分; 只用特殊 token 和标点的头, cache 几乎不增长.

按 3.4 节例子的三个头估算. prompt 1000, 再生成 1000 个 token, 假设生成文本中标点约占 8%. 只看特殊 token 的头, 生成期间几乎不产生新的特殊 token, cache 一直是 3 条左右. 特殊 token, 标点加高频的头, 标点增加约 80 条, 高频部分按 $r_f=0.3$ 从 300 条变成约 600 条, cache 约 680 条, 是完整长度 2000 的三分之一左右. 完整 cache 的头是 2000 条. 平均下来的压缩比例取决于各类头的比例, 这就是 Table 1 中不同模型压缩率差别很大的原因.

## 4. 实验与消融

### 4.1 设置

模型是 Llama 1 及其微调版本, 规模 7B 到 65B. 没有用开源的 Llama 2-chat, 因为它用了 GQA, 论文只研究原始的多头注意力, GQA 留作未来工作. 微调版本用 LIMA 和 Open Assistant 的指令数据训练.

任务: Llama 1 上用 HumanEval (代码), GSM8K (数学), NQ (问答), TQA (阅读理解), 都是生成式评测, 答案从生成结果中抽取. 微调模型用 AlpacaEval, 805 个来自不同领域的问题. GSM8K, NQ, TQA 计算 F1, HumanEval 计算 Pass@1. AlpacaEval 用 GPT-4 对 FastGen 和同一模型完整 cache 的生成做两两比较, 计算 FastGen 的胜率, 无损方法的胜率应该在 50% 左右.

基线是把 $\mathbf{C}_{\mathrm{local}}$, $\mathbf{C}_{\mathrm{frequent}}$, $\mathbf{C}_{\mathrm{local+frequent}}$ 不加区分地用于所有头. 论文特别指出, $\mathbf{C}_{\mathrm{local+frequent}}$ 等同于 H2O 和 ScissorHands, 是很强的基线. 生成用 nucleus sampling, 温度 0.6, $p=0.9$, 在 8 张 A100 80GB 上运行.

### 4.2 质量和显存的权衡

Figure 2 和 Figure 5 给出 KV cache 预算从 30% 到 100% 时的模型质量. 30B 模型上, FastGen 压缩 50% 时的质量超过所有非自适应方法压缩 15% 时的质量. 模型越大, FastGen 在同样质量下能压缩得越多. 引言中的概括是: 压缩 35% 的 cache 时, 能恢复 95% 以上的注意力分数.

Table 1 在微调的 Llama 1 上统计 KV 显存, batch 16, 序列长 512, fp16:

| 模型 | 完整 KV | FastGen KV | 压缩比例 | $T$ | 胜率 |
|---|---|---|---|---|---|
| 7B | 4.3GB | 1.9GB | 56.6% | 91% | 30.8% |
| 7B | 4.3GB | 2.6GB | 39.8% | 95% | 37.7% |
| 7B | 4.3GB | 3.6GB | 16.9% | 98% | 47.4% |
| 65B | 21.5GB | 9.4GB | 56.3% | 93% | 40.9% |
| 65B | 21.5GB | 11.8GB | 44.9% | 95% | 44.2% |
| 65B | 21.5GB | 13.8GB | 36.0% | 98% | 49.8% |

读这张表要注意胜率的含义. 胜率是 GPT-4 认为 FastGen 的回答比完整 cache 的回答更好的比例, 两者质量相同时期望值是 50%, 因为采样有随机性, 同一模型两次生成也会有好有坏. 胜率 30.8% 意味着 GPT-4 在约七成的比较中更偏好完整 cache, 这已经是明显的退化. 胜率高于 50% 不代表压缩提升了质量, 只在噪声范围内.

以胜率 45% 作为质量几乎无损的标准, 65B 可以减少约 40% 的显存, 30B 约 30%, 13B 和 7B 约 20%. 65B 在 $T=98\%$ 时压缩 36%, 胜率 49.8%, 和完整 cache 基本无差别; 7B 同样 $T=98\%$ 只能压缩 16.9%, 胜率 47.4%. 同样的恢复率, 大模型能压得更多, 说明大模型有更多头的注意力集中在少数 token 上.

表中还能看出 $T$ 对质量的影响是非线性的. 7B 从 $T=98\%$ 降到 95%, 压缩比例从 16.9% 增加到 39.8%, 胜率从 47.4% 降到 37.7%; 再降到 91%, 压缩到 56.6%, 胜率只剩 30.8%. 65B 从 98% 降到 93%, 胜率从 49.8% 降到 40.9%, 下降幅度小得多. 小模型的注意力更分散, 稍微放松恢复率就会有很多头从完整 cache 切换到压缩策略, 而这些头的注意力并没有那么集中.

完整 KV 的数值可以验算: Llama 1 7B 有 32 层, 隐藏维度 4096, fp16 下每个 token 的 KV 是 $2\times32\times4096\times2$ 字节 $=512$ KiB; batch 16, 序列 512, 共 8192 个 token, 合计 4 GiB, 约 4.3GB, 和表中一致. 65B 有 80 层, 隐藏维度 8192, 每个 token 的 KV 是 $2\times80\times8192\times2$ 字节 $=2.5$ MiB, 8192 个 token 合计 20 GiB, 约 21.5GB, 也和表中一致. 按这个基数, 「65B 减少约 40%」对应的 KV 约 12.9GB, 落在表中 $T=95\%$ (11.8GB, 胜率 44.2%) 和 $T=98\%$ (13.8GB, 胜率 49.8%) 两行之间, 45% 的胜率线也在这两行之间, 这个 40% 是在两个测点之间读出来的.

### 4.3 端到端时延

论文为 FastGen 实现了专用 kernel: 在 DeepSpeed 的 kernel 上加入 KV cache 稀疏操作. 时延从 prompt 编码开始计到生成结束, 对比 HuggingFace Accelerate (HF, 完整 cache) 和 DeepSpeed (DS), 模型是 Llama 1 7B, 都在 V100 上运行. Table 2 部分结果 (秒):

| batch | [prompt, 生成] | HF | DS | FastGen | 相对 HF |
|---|---|---|---|---|---|
| 1 | [32, 512] | 13.35 | 11.58 | 11.21 | 16.03% |
| 1 | [32, 2048] | 57.37 | 47.12 | 44.6 | 22.30% |
| 1 | [32, 8192] | 299 | 201.23 | 179.43 | 40.00% |
| 1 | [32, 16384] | 799.14 | 435.74 | 359.83 | 55.00% |
| 2 | [4096, 4096] | 167.64 | 91.04 | 76.93 | 54.10% |
| 8 | [512, 512] | 23.44 | 12.93 | 10.57 | 54.90% |
| 8 | [4096, 4096] | OOM | 127.94 | 82.16 | |

batch 2, [512, 32] 这种 prompt 长, 生成短的设置下, FastGen 相对 HF 降低 34.80%, 但相对 DS 只降低 7.59%, 大部分加速来自 DeepSpeed. 这和 FastGen 主要压缩生成阶段 KV 的定位一致: 生成只有 32 步时, KV 压缩能省的不多. batch 16, [512, 512] 时三种实现都显存溢出.

生成越长, 加速越多: batch 1 时, 生成长度从 512 增加到 16K, 相对 HF 的时延降低从 16% 增加到 55%. 相对 DeepSpeed 的加速也随 batch 和生成长度增大, batch 8, [4096, 4096] 时为 35.78%. 论文指出 DeepSpeed 是全栈优化的推理系统, 不只优化了注意力, 所以相对 HF 的加速里有一部分来自 DeepSpeed 本身; 只看相对 DS 的部分, 才是 KV 压缩带来的. 稀疏 kernel 还有改进空间.

### 4.4 画像开销

Table 3 在 Llama 1 65B 上测画像时间: 生成长度 128 到 1024 时, 画像时间都是 0.11 秒, 每 token 解码时间 0.10 秒, 画像占总生成时间的比例从 0.35% 降到 0.07%. 画像只做一次, 相当于多解码一个 token. 生成越长, 这一次性开销所占的比例就越小.

额外显存主要来自高频策略, 它要为每个头存储累计注意力分数. 每层 KV cache 的形状是 (batch, 头数, 序列长度, 头维度), 累计分数的形状是 (batch, 头数, 序列长度). 头维度在所有规模的模型中都是 128, 所以额外显存是 KV cache 的 $1/128=0.78\%$. 严格说 KV cache 有 K 和 V 两份, 相对完整 KV 的比例还要再减半; 而且被压缩后 KV 变小, 累计分数若按完整序列长度存, 相对比例会变大.

### 4.5 消融

**每种策略的作用** (附录 A.1, Table 4). 微调的 Llama 1 65B, AlpacaEval, 恢复率固定为 0.98. 每次从式 (2) 的所有组合中去掉一种策略:

| 策略集合 | 压缩比例 | 胜率 |
|---|---|---|
| 完整集合 $\mathcal{C}$ | 36.04% | 49.75% |
| 去掉特殊 token | 31.16% | 47.64% |
| 去掉标点 | 34.23% | 49.56% |
| 去掉局部 | 30.18% | 49.06% |
| 去掉高频 | 21.26% | 46.08% |

高频和特殊 token 最重要, 去掉后胜率分别下降 3.67 和 2.11 个百分点. 从压缩比例看, 高频和局部策略减少的 KV 最多, 去掉高频后压缩比例从 36% 降到 21%. 但第 4 节的实验显示, 把它们单独, 不加区分地用于所有头, 效果不如 FastGen, 论文认为这进一步说明了按头适配的重要性.

几种策略的角色不同. 去掉局部策略, 压缩比例降了约 6 个百分点, 胜率只降 0.69: 局部策略主要贡献压缩, 对质量影响小. 去掉特殊 token, 压缩比例降约 5 个百分点, 胜率降 2.11: 很多头离开特殊 token 就达不到恢复率, 只能退到更大的策略, 质量也受影响. 去掉高频, 两方面都损失最大. 标点的影响最小, 去掉后两项指标都只略降.

**策略顺序** (Table 5). 都先放特殊 token. 论文的顺序 (特殊 token, 标点, 高频, 局部) 压缩 36.04%, 胜率 49.75%; 换成 (特殊 token, 高频, 局部, 标点) 压缩 36.40%, 胜率 47.64%. 后者压得略多, 但质量下降. 论文的顺序胜率最高.

**超参敏感性** (附录 A.2, Figure 6). 改变 $r_l$, $r_f$ 对生成质量影响不明显, 所有设置下胜率都在 45% 以上, 但对压缩比例影响较大. 论文举的例子是把高频策略的比例从 0.3 改为 0.1, 会导致更多的 KV cache. 比例变小, 高频策略本身保留的 token 变少, 但更多的头达不到恢复率, 只能退到完整 cache, 总的 cache 反而变多. 这是从结果推出的解释, 论文没有展开.

## 5. 策略粒度对照与边界

### 5.1 和相关方法的关系

| 方法 | 策略粒度 | 选择依据 |
|---|---|---|
| [H2O](../02-H2O-Heavy-Hitter-Oracle/02-H2O-Heavy-Hitter-Oracle.md) | 所有头相同 | 累计注意力 + 最近窗口 |
| [ScissorHands](../06-ScissorHands-重要性持久/06-ScissorHands-重要性持久.md) | 所有头相同 | 窗口内注意力分数 + 最近窗口 |
| FastGen | 每个头单独选 | prompt 编码时画像, 5 个候选策略 |
| [SnapKV](../03-SnapKV-生成前观测窗/03-SnapKV-生成前观测窗.md) | 每个头单独选位置, 预算相同 | prompt 末尾观测窗投票 |
| [PyramidKV](../04-PyramidKV-层间漏斗/04-PyramidKV-层间漏斗.md) | 每层预算不同 | 同 SnapKV |

FastGen 的基线 $\mathbf{C}_{\mathrm{local+frequent}}$ 就是 H2O 和 ScissorHands 的做法, 所以 FastGen 可以看作「在 H2O 之上, 允许每个头选择更省的策略或者退到完整 cache」. 它和 H2O 一样主要管理生成阶段追加的 KV; SnapKV 在论文中对 FastGen 的评价是, 它在 prompt 编码时做画像, 但驱逐发生在生成阶段, 没有压缩长 prompt 的 KV. PyramidKV 在层间分配预算, FastGen 的 Figure 3 也显示各层的头结构不同, 首尾层需要完整 cache 的头更多, 这和 PyramidKV 观察到的浅层注意力分散有部分重合.

### 5.2 边界

**只验证了多头注意力.** 论文明确没有用 Llama 2-chat, 因为它用 GQA. GQA 下一组 query 头共享一个 KV 头, 组内各 query 头的结构可能不同, 一个 KV 头该用哪种策略需要另行设计. 论文把和 GQA 结合列为未来工作.

**评测以短 prompt 为主.** 显存实验的序列长 512, 时延实验的 prompt 最长 4096, 主要压缩的是生成阶段的 KV. 长 prompt 场景 (长文档问答, RAG) 中 prompt KV 才是瓶颈, 论文没有覆盖.

**结构稳定是假设.** 画像只在 prompt 编码时做一次, 依赖每个头的结构在整个生成过程中不变. Figure 4 只看到第 30 步; 生成上万 token 后, 或者生成内容和 prompt 差别很大时, 头的结构是否仍不变, 论文没有验证. 被判为特殊 token 策略的头, 如果后来需要看内容 token, 那些 token 已经被丢掉了.

**策略集合是手工设计的.** 特殊 token 和标点依赖分词器和文本类型. 对代码, 表格或其他语言, 标点的分布和作用不同. 论文说框架可以方便地加入其他策略, 但只测试了这四种.

**加速依赖专用 kernel.** 每个头的 cache 长度不同, 标准的注意力实现要求同一层各头长度一致. 论文为此在 DeepSpeed 的 kernel 中加了稀疏操作. 换到其他推理框架需要重新实现; 和分页式 KV 管理的配合, 论文没有讨论. 同一 batch 中不同序列的画像结果也不同, 同一个头在一条序列上用完整 cache, 在另一条上只留特殊 token, 显存布局比统一预算的方法复杂.

**质量评测依赖 GPT-4 胜率.** 微调模型的主要指标是 GPT-4 两两比较的胜率, 胜率 45% 被当作「几乎无损」. 这个阈值是论文的选择, 不同阈值下的压缩比例差别很大 (65B 从 36% 到 56%).

**和其他压缩手段的组合未验证.** 论文结论把 FastGen 和量化, 蒸馏等模型压缩技术, 以及 GQA 等高效注意力结构的结合列为未来方向. KV 量化减少每条 KV 的字节数, FastGen 减少条数, 两者原理上可以叠加, 但量化误差是否会改变画像结果, 没有实验.

**压缩比例和恢复率之间没有闭式关系.** 用户只能通过 $T$ 间接控制显存. 同样的 $T$ 在不同模型, 不同输入上压缩比例不同, 不能预先保证显存上限, 这和按固定预算压缩的方法 (SnapKV, PyramidKV) 不同.

**参考文献**

1. Ge, S., Zhang, Y., Liu, L., Zhang, M., Han, J., Gao, J. (2024). [Model Tells You What to Discard: Adaptive KV Cache Compression for LLMs](https://arxiv.org/abs/2310.01801). ICLR 2024. arXiv:2310.01801. 式 (1)(2), Algorithm 1–2, Figure 1–6, Table 1–5, 附录 A. 代码: [machilusZ/FastGen](https://github.com/machilusZ/FastGen).
2. Zhang, Z., Sheng, Y., Zhou, T., et al. (2023). [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048). NeurIPS 2023.
3. Liu, Z., Desai, A., Liao, F., et al. (2023). [Scissorhands: Exploiting the Persistence of Importance Hypothesis for LLM KV Cache Compression at Test Time](https://arxiv.org/abs/2305.17118). NeurIPS 2023.
4. Clark, K., Khandelwal, U., Levy, O., Manning, C. D. (2019). [What Does BERT Look At? An Analysis of BERT's Attention](https://aclanthology.org/W19-4828). BlackboxNLP 2019.
5. Voita, E., Talbot, D., Moiseev, F., Sennrich, R., Titov, I. (2019). [Analyzing Multi-Head Self-Attention: Specialized Heads Do the Heavy Lifting, the Rest Can Be Pruned](https://arxiv.org/abs/1905.09418). ACL 2019.
6. Aminabadi, R. Y., Rajbhandari, S., Zhang, M., et al. (2022). [DeepSpeed-Inference: Enabling Efficient Inference of Transformer Models at Unprecedented Scale](https://arxiv.org/abs/2207.00032). SC22.
