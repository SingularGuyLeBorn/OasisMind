---
title: "02 · NSA: 原生可训练的稀疏注意力"
category: "LLM 指南"
published: true
tags: ["NSA", "Sparse-Attention", "DeepSeek", "GQA", "Triton"]
excerpt: "NSA 让每个 query 同时走三条注意力分支: 块压缩后的粗粒度 token, 按压缩分数选出的原始 token 块, 最近的滑动窗口, 三路输出用门控加权. 从预训练开始就用稀疏注意力, kernel 按 GQA 组加载共享的 KV 块."
---

# NSA: 原生可训练的稀疏注意力

## 1. 长上下文的注意力开销和已有稀疏方法

### 1.1 训练, prefill 和解码的两种瓶颈

长上下文里, 注意力是时延的主要来源. NSA 论文引用的理论估计是: 解码 64K 上下文时, softmax 注意力约占总时延的 70%–80%.

论文从算术强度出发区分了两种瓶颈. 算术强度是计算量和访存量之比, 每种 GPU 由峰值算力和带宽决定一个临界值, 高于它是计算受限, 低于它是带宽受限. 训练和 prefill 一次处理整段序列, 矩阵乘法规模大, 算术强度高, 是计算受限; 自回归解码每步只生成一个 token, 却要读完整个 KV cache, 算术强度低, 是带宽受限. 所以优化目标也不同: 训练和 prefill 要减计算, 解码要减访存. 一个稀疏注意力方案要在全生命周期都快, 两个目标都要照顾到.

FlashAttention 通过分块和在线 softmax 减少了 HBM 读写, 但计算量没变, 仍是 $O(t^2)$. 想再快, 只能让每个 query 少看一些 key.

### 1.2 已有做法和不足

softmax 注意力本身是稀疏的, 大部分权重集中在少数 key 上. 论文把已有的稀疏方法归为三类: KV cache 驱逐 (H2O, SnapKV 等), 按块选择 KV (Quest, InfLLM, SeerAttention 等), 采样, 聚类或哈希选择 (MagicPIG, ClusterKV, HashAttention). 论文认为它们在实际部署中有两类问题: 前两点让推理加速打折扣, 后四点是对训练支持不足.

**只在一个阶段稀疏.** H2O 在解码时稀疏, 但 prefill 要算完整注意力图来统计累计分数; MInference 只加速 prefill. 至少有一个阶段的成本和全注意力相当. 书籍摘要, 代码补全这类 prefill 为主的负载, 和长推理链这类解码为主的负载, 总有一类加速有限.

**和 GQA, MQA 不兼容.** GQA 让同组多个 query 头共享一份 KV, 解码时只读一次. Quest 这类方法让每个头独立选 KV 子集, 在 MHA 模型上计算和访存都是稀疏的; 但在 GQA 模型里, 一组 KV 要被组内所有头读, 实际访存量是组内各头选择的并集. 举个例子, 一组 16 个头, 每个头各选 1024 个 token, 如果彼此重叠很少, 这组 KV 的读取量最多接近 16384 个 token. 计算量降了, 访存量没降多少, 而解码恰好是访存受限的.

**后处理稀疏会掉点.** 在全注意力预训练好的模型上推理时才稀疏, 等于强行让模型偏离原来的优化轨迹. 论文引用 MagicPIG 的观察: 取注意力分数最高的 20% 只能覆盖总分数的 70%, 检索头这类结构在稀疏推理时容易被剪掉.

**训练成本没降.** 长文档预训练, 长上下文微调, 强化学习都要处理长序列. 推理期方法对这些阶段没有帮助.

**选择过程不可训练.** ClusterKV 用 k-means 聚类, MagicPIG 用 SimHash, 这些离散操作在计算图中不连续, 梯度传不到选择过程, 模型无法学习更好的稀疏模式.

**反向传播效率低.** HashAttention 等方法理论上可训练, 但按单个 token 选择, 注意力计算时要从 KV cache 读取大量不连续的 token. FlashAttention 依赖连续访存和分块计算, 遇到这种访问只能退回低利用率的实现.

结论是: 稀疏模式最好在预训练时就让模型学会, 选择要按块做, 选择过程的打分要能从注意力本身得到, kernel 要和 GQA 对齐. NSA 就按这几条设计.

## 2. 框架, 三条分支与 kernel

### 2.1 总体框架

标准注意力里, query $\mathbf{q}_t$ 对前面所有 key 算分数, 对 value 加权求和 (论文式 (1)(2)):

$$
\mathbf{o}_t=\mathrm{Attn}(\mathbf{q}_t,\mathbf{k}_{:t},\mathbf{v}_{:t})=\sum_{i=1}^{t}\frac{\alpha_{t,i}\mathbf{v}_i}{\sum_{j=1}^{t}\alpha_{t,j}},\qquad \alpha_{t,i}=e^{\mathbf{q}_t^\top\mathbf{k}_i/\sqrt{d_k}}. \tag{1}
$$

NSA 为每个 query 构造一组更紧凑的 KV $\tilde K_t,\tilde V_t$, 由当前 query 和历史 KV 动态决定 (论文式 (3)(4)):

$$
\tilde K_t=f_K(\mathbf{q}_t,\mathbf{k}_{:t},\mathbf{v}_{:t}),\quad \tilde V_t=f_V(\mathbf{q}_t,\mathbf{k}_{:t},\mathbf{v}_{:t}),\quad \mathbf{o}^*_t=\mathrm{Attn}(\mathbf{q}_t,\tilde K_t,\tilde V_t). \tag{2}
$$

映射方式有三种, 记为 $\mathcal{C}=\{\mathrm{cmp},\mathrm{slc},\mathrm{win}\}$, 即压缩, 选择, 滑动窗口. 三路输出用门控合并 (论文式 (5)):

$$
\mathbf{o}^*_t=\sum_{c\in\mathcal{C}}g_t^c\cdot\mathrm{Attn}(\mathbf{q}_t,\tilde K_t^c,\tilde V_t^c), \tag{3}
$$

其中 $g_t^c\in[0,1]$ 由输入特征经 MLP 和 sigmoid 得到. 每一路各自做 softmax, 再按门值加权, 不是把三组 KV 拼起来做一次 softmax. 三个门值互相独立, 不要求和为 1. 记重映射后的 KV 总数为 (论文式 (6))

$$
N_t=\sum_{c\in\mathcal{C}}\mathrm{size}\bigl[\tilde K_t^c\bigr], \tag{4}
$$

NSA 通过保持 $N_t\ll t$ 获得高稀疏度.

### 2.2 token 压缩

把连续的 key 分成块, 每块压成一个压缩 key (论文式 (7)):

$$
\tilde K_t^{\mathrm{cmp}}=f_K^{\mathrm{cmp}}(\mathbf{k}_{:t})=\Bigl\{\varphi\bigl(\mathbf{k}_{id+1:id+l}\bigr)\Bigm|0\le i\le\Bigl\lfloor\frac{t-l}{d}\Bigr\rfloor\Bigr\}, \tag{5}
$$

其中 $l$ 是块长, $d$ 是相邻块的步长, $\varphi$ 是带块内位置编码的可学习 MLP, 把一块 $l$ 个 key 映射成一个 key. value 用同样的方式压缩. 论文通常取 $d<l$, 相邻块有重叠, 用来减少块边界造成的信息割裂.

论文设置是 $l=32$, $d=16$, 相邻块重叠一半. 按式 (5), 长度 $t$ 的前缀有 $\lfloor(t-l)/d\rfloor+1$ 个压缩 token. $t=32768$ 时是 $\lfloor32736/16\rfloor+1=2047$ 个, 约为原长的 $1/16$. 压缩分支的注意力对每个 query 是 $O(t/d)$, 对整段序列是 $O(t^2/d)$, 仍是平方, 只是常数缩小了 $d$ 倍.

压缩 token 代表一整块的粗粒度信息, 适合扫描全局, 但单个 token 的细节会被平均掉. 只用压缩分支, 大海捞针一类任务会丢信息, 所以需要选择分支补上.

### 2.3 token 选择

**为什么按块选.** 论文给了两条理由. 硬件上, GPU 读连续块比按索引随机读快得多, 分块计算也能用上 Tensor Core, FlashAttention 本身就是按块设计的. 数据上, 注意力分数有空间连续性, 相邻 key 的重要性往往接近. 论文对 27B 全注意力模型的注意力图做了可视化 (Figure 8), 高分区域呈块状聚集.

**块分数从压缩分支来.** 给每个块单独算重要性会带来额外开销. NSA 直接复用压缩分支的注意力分数 (论文式 (8)):

$$
\mathbf{p}_t^{\mathrm{cmp}}=\mathrm{Softmax}\bigl(\mathbf{q}_t^\top\tilde K_t^{\mathrm{cmp}}\bigr). \tag{6}
$$

设选择块大小为 $l'$. 如果压缩块和选择块的划分完全相同, 即 $l'=l=d$, 直接取 $\mathbf{p}_t^{\mathrm{slc}}=\mathbf{p}_t^{\mathrm{cmp}}$. 划分不同时, 在 $l\le l'$, $d\mid l$, $d\mid l'$ 的条件下, 按空间重叠关系把压缩分数累加到选择块上 (论文式 (9)):

$$
\mathbf{p}_t^{\mathrm{slc}}[j]=\sum_{m=0}^{l'/d-1}\sum_{n=0}^{l/d-1}\mathbf{p}_t^{\mathrm{cmp}}\Bigl[\frac{l'}{d}j-m-n\Bigr]. \tag{7}
$$

用论文的参数算一遍: $l=32$, $d=16$, $l'=64$, 于是 $l'/d=4$, $l/d=2$, $m\in\{0,1,2,3\}$, $n\in\{0,1\}$. 下标 $4j-m-n$ 取遍 $4j-4$ 到 $4j$ 共 5 个压缩块, 次数依次是 1, 2, 2, 2, 1. 换个角度看: 一个 64 token 的选择块完整包含 3 个长 32 的压缩块, 另外两头各和一个压缩块重叠 16 个 token. 完整包含的压缩块重叠 32 个 token, 计 2 次; 只重叠一半的计 1 次. 权重和重叠长度成正比. 具体下标偏移取决于块编号从哪里算起, 结构就是这样.

**GQA 组内共享.** GQA 或 MQA 模型里, 同组各头共享 KV cache. 为了让解码时只读一份 KV, 组内各头必须选同一批块. 做法是把组内 $H$ 个头的分数求和 (论文式 (10)):

$$
{\mathbf{p}_t^{\mathrm{slc}}}'=\sum_{h=1}^{H}\mathbf{p}_t^{\mathrm{slc},(h)}. \tag{8}
$$

这样就避开了第 1.2 节说的并集问题: 组内只有一份选择, 访存量就是这份选择的大小.

**top-$n$ 选块.** 按共享分数取排名前 $n$ 的块, 拼接块内原始 key (论文式 (11)(12)):

$$
\mathcal{I}_t=\bigl\{i\bigm|\mathrm{rank}\bigl({\mathbf{p}_t^{\mathrm{slc}}}'[i]\bigr)\le n\bigr\},\qquad \tilde K_t^{\mathrm{slc}}=\mathrm{Cat}\bigl[\{\mathbf{k}_{il'+1:(i+1)l'}\mid i\in\mathcal{I}_t\}\bigr]. \tag{9}
$$

$\mathrm{rank}$ 按降序排名, 最高分为 1. value 同理. 选择分支每个 query 看 $nl'$ 个原始 token. 论文取 $l'=64$, $n=16$, 共 1024 个, 其中固定包含 1 个开头块和 2 个本地块, 真正按分数选的是 13 块. 开头块就是序列最前面的 64 个 token, StreamingLLM 观察到这些位置常吸收大量注意力 (attention sink); 2 个本地块是 query 所在位置附近的 128 个 token. 论文没有解释为什么在已有窗口分支的情况下还要固定选本地块, 一种可能是保证选择分支自己也能看到最近的原始 token, 不完全依赖窗口分支.

选择操作本身不可导, 梯度不经过 top-$n$. 但块分数来自压缩分支的注意力, 压缩分支是可导的, 它的参数由语言模型损失训练. 模型为了让压缩分支本身有用, 会学到有意义的块分数, 选择分支顺带受益. 这和 MoBA 用块均值打分思路相近, 区别在于 NSA 的打分器是一个带参数的压缩 MLP 加一次 softmax 注意力, 而且分数在 GQA 组内共享.

### 2.4 滑动窗口

论文观察到, 局部模式学得更快, 容易主导训练, 让模型来不及从压缩 token 和选择 token 里学东西. 所以 NSA 单设一条窗口分支专门处理局部上下文: $\tilde K_t^{\mathrm{win}}=\mathbf{k}_{t-w:t}$, $\tilde V_t^{\mathrm{win}}=\mathbf{v}_{t-w:t}$, 论文取 $w=512$. 三种信息源放在不同的分支里分别算注意力, 再由门控合并.

为了进一步防止分支之间的捷径学习, NSA 给三条分支各自独立的 key 和 value. 论文认为这样可以避免局部和长程模式识别之间的梯度干扰, 而额外开销很小.

### 2.5 每个 query 看多少 token

把三条分支加起来, 解码时每步读取的 KV 量 (按等效 token 数, 一个压缩 token 记为一个) 是

$$
N_t\approx\Bigl\lfloor\frac{t-l}{d}\Bigr\rfloor+1+nl'+w. \tag{10}
$$

代入 $l=32$, $d=16$, $nl'=1024$, $w=512$:

| 上下文长度 $t$ | 压缩 | 选择 | 窗口 | 合计 | 论文 Table 4 | 全注意力 / NSA |
|---|---|---|---|---|---|---|
| 8192 | 511 | 1024 | 512 | 2047 | 2048 | 4× |
| 16384 | 1023 | 1024 | 512 | 2559 | 2560 | 6.4× |
| 32768 | 2047 | 1024 | 512 | 3583 | 3584 | 9.1× |
| 65536 | 4095 | 1024 | 512 | 5631 | 5632 | 11.6× |

算出的合计和论文表 4 只差 1, 可能是取整方式不同. 选择和窗口两项是常数, 序列越长, 压缩分支的占比越大: 8K 时压缩约占四分之一, 64K 时超过七成. 窗口和选择块可能重叠 (固定选中的 2 个本地块就在窗口内), 表里是按论文的口径直接相加.

### 2.6 kernel 设计

压缩分支和窗口分支的注意力可以直接用 FlashAttention-2 的 kernel. 难点是选择分支. FlashAttention 的做法是把时间上连续的一块 query 读进 SRAM, 再遍历 KV 块. 但在选择分支里, 同一个 query 块里的不同 query 选的 KV 块各不相同, 照搬会造成大量无效访存.

NSA 换了 query 的分组方式: 对 query 序列的每个位置, 把同一 GQA 组内的所有 query 头一起读进 SRAM, 因为它们共享同一组选中的 KV 块. 论文针对 GQA 和 MQA 设计, 不考虑 MHA, 理由是 MHA 解码时访存量大, 效率低. kernel 有三个要点:

1. **按组加载 query.** 每次内循环读入位置 $t$ 处组内所有头的 query $Q\in\mathbb{R}^{[h,d_k]}$, 以及它们共享的块索引 $\mathcal{I}_t$.
2. **共享 KV 读取.** 内循环按 $\mathcal{I}_t$ 依次把连续的 KV 块读进 SRAM, 块大小 $B_k$ 满足 $B_k\mid l'$, 形状为 $K\in\mathbb{R}^{[B_k,d_k]}$, $V\in\mathbb{R}^{[B_k,d_v]}$.
3. **外层循环交给 grid.** 内循环长度和选中块数 $n$ 成正比, 不同 query 块之间几乎一样, 所以把 query 和输出的循环放进 Triton 的 grid 调度器.

这样做一方面消掉了组内的重复 KV 读取, 另一方面让各 SM 的负载均衡. 可以粗算一下算术强度的变化: 效率实验里每组有 $h=16$ 个头, 读进 SRAM 的每个 KV 块要被 16 个 query 头使用, 相当于把一个 $[16,192]\times[192,B_k]$ 的矩阵乘法喂给 Tensor Core; 如果每个头单独处理, 就是 16 次向量和矩阵的乘法, 每次都要重新读 KV.

## 3. 实验与试过但没用的方案

### 3.1 设置

骨干是 GQA 加 MoE: 总参数 27B, 激活 3B, 30 层, 隐藏维度 2560. GQA 共 4 组, 64 个注意力头, 每头 $d_q=d_k=192$, $d_v=128$. MoE 用 DeepSeekMoE 结构, 72 个路由专家加 2 个共享专家, 每个 token 选 6 个; 为了训练稳定, 第一层的 MoE 换成 SwiGLU 形式的 MLP. NSA 参数为 $l=32$, $d=16$, $l'=64$, $n=16$, $w=512$.

全注意力和 NSA 模型都先在 8K 文本上预训练 270B token, 再用 YaRN 在 32K 文本上续训和监督微调, 都训到收敛. 论文引言里写的是 260B token, 实验节写的是 270B, 这里按实验节. 预训练损失曲线 (Figure 4) 两者都平稳下降, NSA 一直略低. 预训练长度是 8K, 按 2.5 节的表, 这时每个 query 最多看约 2048 个 token, 稀疏度约 75%, 所以预训练阶段的计算节省有限, 主要收益在后面的 32K 续训和长序列推理.

### 3.2 通用基准

Table 1 覆盖知识, 推理, 代码三类共 9 项:

| 模型 | MMLU | MMLU-PRO | CMMLU | BBH | GSM8K | MATH | DROP | MBPP | HumanEval | 平均 |
|---|---|---|---|---|---|---|---|---|---|---|
| 全注意力 | 0.567 | 0.279 | 0.576 | 0.497 | 0.486 | 0.263 | 0.503 | 0.482 | 0.335 | 0.443 |
| NSA | 0.565 | 0.286 | 0.587 | 0.521 | 0.520 | 0.264 | 0.545 | 0.466 | 0.348 | 0.456 |

NSA 在 9 项中的 7 项更高, MMLU 和 MBPP 略低. 提升最大的是 DROP (+0.042) 和 GSM8K (+0.034). 论文的解释是稀疏注意力迫使模型聚焦最重要的信息, 过滤了无关注意力路径的噪声; 这是论文的推测, 没有专门的消融支撑. 这些基准的样本大多短于稀疏窗口, 推理期稀疏方法在这里等价于全注意力, 所以这一节只和全注意力比.

### 3.3 长上下文

64K 大海捞针 (Figure 5) 所有深度全部检索正确. 论文把它归因于分层设计: 压缩 token 低成本扫描全局, 找出相关块; 选择 token 在这些块上保留细粒度信息.

LongBench (Table 2) 和 H2O, InfLLM, Quest, Exact-Top 比较. Exact-Top 先算完整注意力分数, 再为每个 query 取分数最高的 $n$ 个 key 做注意力, 可以看作按 token 选择的上界. 为了稀疏度一致, 所有稀疏基线每个 query 激活 2560 个 token, 这是 NSA 处理 32K 序列时的平均激活量; 按 StreamingLLM 的做法, 其中包含开头 128 个和最近 512 个 token. 2560 这个数可以用式 (10) 验证: 32K 序列里位置 $t$ 的压缩 token 数约为 $t/16$, 在 0 到 32768 上平均是 1024, 再加上选择分支的 1024 和窗口的 512, 正好 2560. 论文去掉了所有模型得分都很低的几个子集.

| 方法 | 平均 |
|---|---|
| H2O | 0.303 |
| InfLLM | 0.383 |
| Quest | 0.392 |
| Exact-Top | 0.423 |
| 全注意力 | 0.437 |
| NSA | 0.469 |

NSA 比全注意力高 0.032, 比 Exact-Top 高 0.046. 提升集中在多跳问答 (HotpotQA +0.087, 2Wiki +0.051), 代码理解 (LCC +0.069) 和段落检索 (PassR-en +0.075). 也有几项低于全注意力: GovReport 0.307 对 0.324, MFQA-en 0.503 对 0.512, PassR-zh 0.550 对 0.560.

要注意比较条件: 基线都是推理期方法, 套在全注意力预训练的模型上; NSA 是同样数据从头按稀疏训练的模型. NSA 超过全注意力这一点, 只能说明在这个 27B 模型和这批数据上, 原生稀疏没有损失长上下文能力.

### 3.4 长推理

论文从 DeepSeek-R1 蒸馏, 用 10B token 的 32K 长数学推理轨迹做监督微调, 得到 Full Attention-R 和 NSA-R. 在 AIME 24 上, 温度 0.7, top-$p$ 0.95, 每题采样 16 次取平均, 生成上限分别设 8K 和 16K (Table 3):

| 生成上限 | 8192 | 16384 |
|---|---|---|
| Full Attention-R | 0.046 | 0.092 |
| NSA-R | 0.121 | 0.146 |

NSA-R 在两个上限下都更高, 分别高 0.075 和 0.054. AIME 24 只有 30 题, 0.046 约相当于 16 次采样平均下来答对 1.4 题, 绝对值都很低, 方差不小. 推理期稀疏方法不支持训练, 所以这一项没有和它们比.

### 3.5 效率

效率实验在 8 卡 A100 上进行, 配置为 GQA $g=4$ 组, 每组 $h=16$ 头, $d_k=192$, $d_v=128$, NSA 参数同上. 为了同一后端下公平比较, 对照是 Triton 实现的 FlashAttention-2.

训练 (Figure 6): 上下文越长加速越大, 64K 时前向 9.0×, 反向 6.0×. 论文归因于两点: 按块访存让合并读取能用满 Tensor Core; kernel 的循环调度消掉了冗余 KV 传输.

解码 (Table 4): 解码受访存限制, 时延和 KV 读取量近似成正比. 每步最多读 $\lfloor(s-l)/d\rfloor$ 个压缩 token, $nl'$ 个选中 token 和 $w$ 个邻近 token, $s$ 是缓存长度. 表 4 的 4×, 6.4×, 9.1×, 11.6× 是按读取量之比算出的 "Expected Speedup", 也就是 2.5 节表格最后一列. 论文没有给出解码的实际时延曲线.

### 3.6 试过但没用的方案

论文第 6 节记录了设计 NSA 之前试过的几种做法.

**按 key 聚类.** ClusterKV 一类方法把同一簇的 KV 存在连续内存里, 理论上训练和推理都可行, 但有三个问题: 动态聚类本身开销不小; 簇大小不均衡, 在 MoE 系统里会让专家并行各组的执行时间不一致, 造成持续的负载不均; 需要定期重新聚类, 训练只能按块顺序进行.

**其他按块选择的策略.** 论文在一个结构相似的 3B 模型上比较了两种方案, 损失曲线见 Figure 7:

- **辅助损失打分.** 每个 token 额外引入一组 query, 每块引入代表性 key, 用来估计块重要性; 监督信号是块内注意力分数的均值池化, 用 KL 散度训练. 为了高效解码, query 保持单 token 粒度, 不对 query 做块平均. 这和 SeerAttention 思路相近.
- **无参数启发式打分.** 按 Quest 的做法, 用 query 和每块 key 的逐维 min, max 的乘积直接选块. 还试了冷启动: 前 1000 步用全注意力, 再切到这种选块方式.

两种方案的损失都比 NSA 和全注意力差. 论文总结: 选择不可导, 用神经网络打分就要靠辅助损失, 增加算子开销且常常掉点; 无参数启发式召回率低. NSA 的做法是让打分来自一条本身就参与主损失的分支.

## 4. 训练期稀疏方案对照与边界

### 4.1 和相关方法的对照

| 方法 | 选择粒度 | 打分方式 | 训练期使用 | 驱逐 KV |
|---|---|---|---|---|
| NSA | 块 ($l'=64$) | 压缩分支的 softmax 分数, GQA 组内求和 | 是, 从预训练开始 | 否 |
| [MoBA](../01-MoBA架构深度解析/01-MoBA架构深度解析.md) | 块 | query 和块内 key 均值的内积 | 是, 可续训打开 | 否 |
| [Quest](../14-Quest-查询感知稀疏/14-Quest-查询感知稀疏.md) | 页 | query 和页内逐维 min, max 的上界估计 | 否 | 否 |
| [H2O](../08-H2O-Heavy-Hitter-Oracle/08-H2O-Heavy-Hitter-Oracle.md) | token | 累计注意力分数 | 否 | 是 |
| [StreamingLLM](../07-StreamingLLM与Attention-Sink/07-StreamingLLM与Attention-Sink.md) | 固定位置 | 开头 sink 加最近窗口 | 否 | 是 |
| DSA (DeepSeek-V3.2) | token (top-2048) | 带 ReLU 的多头 lightning indexer | 是, 在已有模型上续训 | 否 |

和 MoBA 相比, NSA 多了压缩分支和窗口分支, 三路分开算 softmax 再门控; MoBA 只有一路, 当前块强制选中, 起到类似窗口的作用. NSA 的打分器有参数 (压缩 MLP), MoBA 没有. 和 Quest 相比, 两者都按块选, Quest 是推理期启发式, 每个头独立选; NSA 训练期就用, 组内共享选择. DSA 是 DeepSeek 后来在 V3.2 上用的方案, 在 MLA 之上加一个轻量 indexer 给每个历史 token 打分, 打分是各 indexer 头的 ReLU 内积按权重求和, 每个 query 选 2048 个 token. 训练分两步: 先冻结主模型, 保持稠密注意力, 用 KL 散度让 indexer 输出对齐主注意力分布 (1000 步, 2.1B token); 再打开 top-2048 选择, 主模型和 indexer 一起训练 943.7B token. indexer 的输入从计算图中分离, 只受 KL 损失训练, 主模型只受语言模型损失训练. 这和 NSA 正好相反: NSA 的块分数来自参与主损失的压缩分支, 没有单独的对齐损失. DSA 的机制和 NSA 的三分支不同, 见 [QSA 篇](../06-QSA-Qwen稀疏注意力/06-QSA-Qwen稀疏注意力.md) 的对照.

### 4.2 边界

**解码加速是预期值.** 11.6× 来自访存量之比, 前提是解码完全受带宽限制, 且选块, 门控等开销可以忽略. 实际服务里还有 FFN, 调度, 采样等开销, 端到端加速会小于这个数.

**压缩分支仍是平方.** 每个 query 对 $\lfloor(t-l)/d\rfloor+1$ 个压缩 token 做注意力, 整段 prefill 是 $O(t^2/d)$. 64K 时它已占每个 query 读取量的七成以上, 序列再长, 它会成为主要开销. CSA, QSA 等后续方案继续压缩或给打分器降维, 处理的就是这一项.

**短序列收益小.** 8K 时每个 query 仍看约 2048 个 token, 稀疏度只有 75%; 再短时三条分支的固定开销 (选择和窗口共 1536 个 token) 接近全注意力. 论文的通用基准大多是短样本, NSA 在那里的作用主要是不掉点.

**依赖 GQA.** kernel 的效率来自组内共享选择. MHA 模型每个头一份 KV, 论文没有为它设计 kernel.

**KV cache 不减少.** NSA 不驱逐 token, 选择分支要能访问任意历史块, 完整 KV 仍要保留. 三条分支各有独立的 key 和 value, 按论文描述推算, 除了选择分支的完整 KV, 还要存压缩 KV (约原长的 $1/d$) 和窗口分支最近 $w$ 个 token 的 KV. 论文没有报告显存占用. 按 3.1 节的配置可以粗算: 每个 token 每层的 KV 是 4 组 × $(192+128)$ = 1280 个数, 30 层共 38400 个, 按 BF16 存约 75KB; 64K 上下文的选择分支 KV 约 4.7GiB, 压缩分支再加约 $1/16$, 约 0.3GiB, 窗口分支 512 个 token 约 39MB. 这几个数是按配置推算的, 报告里没写. 同样的配置如果改成 MHA, 64 个头各存一份 KV, 是 4 组的 16 倍, 64K 时选择分支约 75GiB, 已经接近单卡显存. 所以 kernel 只按 GQA 设计, 显存上也有理由. 三条分支里, 压缩分支和窗口分支加起来不到选择分支的一成, 显存的大头始终是完整 KV; 要减少它, 只能靠减少组数或者量化, NSA 本身不处理这一点.

**超参固定.** $n=16$, $w=512$, $l'=64$ 对所有层, 所有 token 一样. 论文没有给出这些参数的消融, 也没有按层或按头调整.

**规模和对照有限.** 质量结果来自一个 27B 激活 3B 的 MoE 模型, 加一个 3B 模型的选块策略对比. 长上下文对照的稀疏基线都是推理期方法, 没有和 MoBA 等同样可训练的方案在相同条件下比较. 效率数据只来自 A100 上的 Triton 实现.

**两路分支有先后依赖.** 选择分支的块索引来自压缩分支的 softmax 分数, 必须先算完压缩注意力才能选块. 按论文描述推算, 这两条分支在一层内不能完全并行, kernel 调度要把这段依赖算进去. 论文没有单独报告选块步骤的耗时.

## 参考文献

1. Yuan, J., Gao, H., Dai, D., et al. (2025). [Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089). arXiv:2502.11089. 式 (1)–(12), Table 1–4, Figure 4–8.
2. Lu, E., Jiang, Z., Liu, J., et al. (2025). [MoBA: Mixture of Block Attention for Long-Context LLMs](https://arxiv.org/abs/2502.13189). arXiv:2502.13189.
3. Tang, J., Zhao, Y., Zhu, K., et al. (2024). [Quest: Query-Aware Sparsity for Efficient Long-Context LLM Inference](https://arxiv.org/abs/2406.10774). arXiv:2406.10774.
4. Zhang, Z., Sheng, Y., Zhou, T., et al. (2023). [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048). NeurIPS 2023.
5. Chen, Z., Sadhukhan, R., Ye, Z., et al. (2024). [MagicPIG: LSH Sampling for Efficient LLM Generation](https://arxiv.org/abs/2410.16179). arXiv:2410.16179.
6. Liu, G., Li, C., Zhao, J., et al. (2024). [ClusterKV: Manipulating LLM KV Cache in Semantic Space for Recallable Compression](https://arxiv.org/abs/2412.03213). arXiv:2412.03213.
7. Gao, Y., Zeng, Z., Du, D., et al. (2024). [SeerAttention: Learning Intrinsic Sparse Attention in Your LLMs](https://arxiv.org/abs/2410.13276). arXiv:2410.13276.
8. Jiang, H., Li, Y., Zhang, C., et al. (2024). [MInference 1.0: Accelerating Pre-filling for Long-Context LLMs via Dynamic Sparse Attention](https://arxiv.org/abs/2407.02490). arXiv:2407.02490.
9. DeepSeek-AI. (2025). [DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models](https://arxiv.org/abs/2512.02556). arXiv:2512.02556. 式 (1)(3)(4).
10. Peng, B., Quesnelle, J., Fan, H., Shippole, E. (2024). [YaRN: Efficient Context Window Extension of Large Language Models](https://arxiv.org/abs/2309.00071). ICLR 2024.
