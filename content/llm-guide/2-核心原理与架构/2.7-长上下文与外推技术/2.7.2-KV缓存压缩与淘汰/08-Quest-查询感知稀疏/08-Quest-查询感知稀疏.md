---
title: "08 · Quest: 按当前 query 选 KV 页, 不驱逐"
category: "LLM 指南"
published: true
tags: ["Quest", "Query-Aware-Sparsity", "KV-Cache", "Decode", "ICML 2024"]
excerpt: "Quest 把 KV cache 按页管理, 每页记录 Key 各通道的最小值和最大值. 解码时用当前 query 和这两个向量算出每页注意力分数的上界, 只加载上界最高的若干页做注意力. 全部 KV 仍留在 GPU 上, 省的是每步从显存读取的数据量."
---

# Quest: 按当前 query 选 KV 页, 不驱逐

## 1. 解码瓶颈与已有做法

### 1.1 解码阶段的瓶颈是读 KV

LLM 推理分 prefill 和解码两个阶段. prefill 对整个输入算出 Q, K, V, 把 K 和 V 存入 KV cache, 生成第一个输出 token. 解码阶段每步用最新生成的 token 算出 $q,k,v$, 用 $q$ 和之前所有 token 的 $K$ 相乘得到注意力权重 $a_i$, softmax 归一化后输出 $\sum_i a_iV_i$. 一个请求的 prefill 只做一次, 解码每个输出 token 都要做一次, 所以解码占了大部分时间. 论文的例子: prompt 16K token, 回复 512 token, 超过 86% 的时间花在解码上.

长上下文让解码更慢. 每步都要加载已有 token 的 $K$ 和 $V$, Llama-7B 在 32K 上下文下 (FP16):

$$
|\mathrm{KV}|=2\times L_{\mathrm{layer}}\times T\times H\times d_{\mathrm{head}}\times 2=2\times32\times32\mathrm{K}\times32\times128\times2\ \mathrm{B}=16\ \mathrm{GB}. \tag{1}
$$

其中第一个 2 表示 K 和 V, 最终一个 2 是 FP16 的字节数. 论文引言中, 在 RTX 4090 上用 FP16 的 FlashInfer 实现, 读一遍这 16GB 至少需要 11 毫秒, 占推理延迟的 50% 以上; 第 2.1 节写这次加载占解码单步时间的 53%. 优化自注意力的数据搬运, 是长上下文推理效率的关键.

### 1.2 注意力稀疏, 关键 token 随 query 变化

之前的工作 (H2O, FastGen) 已经表明, 少数关键 token 就能积累足够的注意力分数. 论文在 LongChat-7B 上测量每层的稀疏度 (Figure 3): 在保证 PG-19 困惑度增加不超过 0.01 的前提下, 看每层能去掉多少 KV. 前两层的稀疏度低于 10%, 其余各层都高于 90%. 也就是说除前两层外, 不到 10% 的 token 就能达到相近的精度. 如果能估计出哪些 token 关键, 只对它们做注意力, 就能大幅减少数据搬运.

问题在于 token 的关键程度是动态的, 高度依赖当前的 query. 论文的例子 (Figure 2): prompt 是「A is B. C is D. A is」, 在 Llama-2-7b 第 16 层的某个头中, 最终一个「is」要输出答案「B」, 所以「B」对它是关键的, 注意力分数很高. 但在此之前, 「B」对任何 query 都不关键, 注意力很低. 比如 query 是「D」时, 「B」的分数很低.

论文用 Top-10 召回率量化这种现象 (Figure 4): 在 LongChat-7b-v1.5-32k 上做 10K 长度的 passkey 检索, 每个解码步统计各方法选中的 token 覆盖了完整注意力中前 10 名的多少. 完整 cache 的召回率是 100%. H2O 按历史信息剪枝, 关键 token 在之前的步骤中已被剪掉, 召回率很低. Quest 基于当前 query 估计, 召回率接近完整注意力.

所以要解决的问题是: 不微调模型, 不改注意力公式, 在解码时少读 KV, 同时保住「现在还不重要, 以后会重要」的 token.

### 1.3 已有做法

论文把以下方法归为 KV cache 驱逐算法:

- **H2O**: 按历史注意力分数之和保留重要的 KV, 预算有限.
- **FastGen**: 细分 token 类型, 用更复杂的策略选择保留哪些 KV.
- **TOVA**: 只根据当前 query 决定永久丢弃哪些 token.
- **StreamingLLM**: 用 attention sink 加有限的 KV cache 处理无限长文本.

这些方法基于历史信息或当前状态决定丢掉哪些 KV, 但被丢掉的 token 可能对未来的 token 很重要, 造成信息丢失. **SparQ** 通过通道剪枝计算近似注意力分数, 据此选择重要 token, 不丢弃 KV. 论文认为它在长依赖任务上没有充分验证, 而通道级的稀疏也难以转化为实际加速.

用 1.2 节的「A is B. C is D. A is」看三种驱逐方法会怎样. 假设 cache 已满, 处理到「D」时需要丢掉一个 token. H2O 看累计分数, 「B」此前从未得到高注意力, 累计值低, 是候选; TOVA 看当前 query「D」的注意力, 「B」的分数很低, 也是候选; StreamingLLM 只保留开头和最近的 token, 如果这句话前面还有很长的文本, 「B」落在窗口外, 同样被丢. 三种方法的依据不同, 却都可能在最终一个「is」到来之前丢掉「B」. 而且一旦丢了, 最终一步即使 query 需要它, 也没有任何办法拿回来.

Quest 的选择是保留全部 KV cache, 根据当前 query 选择其中一部分参与注意力. 它不减少显存占用, 减少的是每步从显存读入计算单元的数据量.

## 2. 按页估计与选页

### 2.1 按页估计

逐 token 估计关键程度, 需要先读全部 $K$, 就失去了意义. Quest 按页管理 KV cache (粒度沿用 PagedAttention), 以页为单位估计和选择. 每页不存额外的 embedding, 只对 Key 的每个通道维护两个值:

$$
m_i=\min_{t\in\mathrm{page}}k_{t,i},\qquad M_i=\max_{t\in\mathrm{page}}k_{t,i}. \tag{2}
$$

论文的 Algorithm 1 分两部分. 插入新 token 时, 对每个通道 $i=1,\ldots,dim$ 更新

$$
M_i\leftarrow\max(M_i,k_i),\qquad m_i\leftarrow\min(m_i,k_i), \tag{3}
$$

不需要回头读页内的旧 key. 按头管理 KV 时, $dim$ 就是每个头的维度 $d_{\mathrm{head}}$.

### 2.2 点积上界

论文的出发点是: 为了不漏掉关键 token, 应选出包含注意力最高的 token 的页. 页内注意力的最高值可以用上界近似. 给定 $q$, 页内任意 key 的第 $i$ 通道都在 $[m_i,M_i]$ 之内, 该通道对点积贡献的最大可能值是

$$
U_i=\max(q_im_i,\,q_iM_i)=\begin{cases}q_iM_i,& q_i\ge0,\\ q_im_i,& q_i<0.\end{cases} \tag{4}
$$

无论 $q_i$ 的符号如何, $U_i$ 都不小于页内任意 key 的 $q_ik_{t,i}$. 把各通道加起来, 得到页的关键度估计:

$$
s(q,\mathrm{page})=\sum_{i=1}^{d}U_i\ \ge\ \max_{t\in\mathrm{page}}q\cdot k_t. \tag{5}
$$

不等式的证明只需一行: 对页内任意 $t$, 每个通道都有 $q_ik_{t,i}\le U_i$, 相加得 $q\cdot k_t\le s$. 等号要求页内存在同一个 key, 在每个通道上都恰好取到对 $q$ 最有利的那个端点. $m$ 和 $M$ 拼成的是一个轴对齐的盒子, 盒子的角点一般不是任何真实的 key, 所以 $s$ 通常严格大于真实最大值. 这里没有除以 $\sqrt d$, 也没有 softmax: 选页只需要对 $s$ 排序, 缩放和单调变换不改变顺序.

**手算一例.** 两个通道, $q=[1,-2]$, 页内两个 key: $k^{(1)}=[0.5,3]$, $k^{(2)}=[-1,-0.5]$. 则 $m=[-1,-0.5]$, $M=[0.5,3]$. $q_1>0$ 取 $M_1$, $U_1=0.5$; $q_2<0$ 取 $m_2$, $U_2=1$; $s=1.5$. 真实点积是 $q\cdot k^{(1)}=0.5-6=-5.5$, $q\cdot k^{(2)}=-1+1=0$, 页内最大值为 0. 上界 1.5 没有漏掉页内最高值, 但比它大: 它对应的「key」是 $[0.5,-0.5]$, 第一个通道来自 $k^{(1)}$, 第二个通道来自 $k^{(2)}$, 页内并不存在.

**再算一步完整的选页.** 两个通道, 页大小 2, 共 3 页, 预算 $B=2$ 即选 1 页. 各页 key 和元数据:

| 页 | key | $m$ | $M$ |
|---|---|---|---|
| 1 | $[1,1]$, $[2,0]$ | $[1,0]$ | $[2,1]$ |
| 2 | $[-1,3]$, $[0,2]$ | $[-1,2]$ | $[0,3]$ |
| 3 | $[3,-1]$, $[0,0]$ | $[0,-1]$ | $[3,0]$ |

当前 $q=[1,1]$, 两个分量都为正, 每页的上界就是 $M_1+M_2$: 页 1 为 3, 页 2 为 3, 页 3 为 3. 三页并列, 说明上界区分不出来. 真实的页内最大点积分别是 2, 2, 2, 也并列, 这时选哪页都一样. 换成 $q=[2,-1]$: 页 1 的上界是 $2\times2+(-1)\times0=4$, 页 2 是 $2\times0+(-1)\times2=-2$, 页 3 是 $2\times3+(-1)\times(-1)=7$, 选页 3. 真实最大点积: 页 1 是 $\max(1,4)=4$, 页 2 是 $\max(-5,-2)=-2$, 页 3 是 $\max(7,0)=7$. 第二个 query 下上界恰好都是紧的, 因为每页中对 $q$ 最有利的两个端点来自同一个 key. query 换了, 选中的页也跟着换, 这就是「查询感知」.

### 2.3 Top-K 选页

对所有页算出 $s$ 后, 选出分数最高的 $K$ 页, 只在这些页上做普通的自注意力. $K$ 是预设常数 (引言举例 128, 256). 实验中用的是 token 预算 (token budget) $B$, 即选中页中的 token 总数. 页大小为 $S$ 时,

$$
\mathcal{P}=\mathop{\mathrm{TopK}}_{\mathrm{pages}}\ s(q,\mathrm{page}),\qquad B=K\cdot S. \tag{6}
$$

没被选中的页这一步不读, 但仍留在 GPU 上. 下一步 query 变了, 重新按式 (4)(5)(6) 选择. 选中页之内的计算是精确的: 完整的 $qk^\top$, softmax, 对 $v$ 加权. 近似只发生在选哪些页.

为了验证可行性, 论文对真实注意力取每页最高分, 再选 Top-K 页, 和 Quest 的估计对比. Figure 3 显示 Quest 的稀疏度和这个 oracle 基本一致.

前两层的稀疏度很低, Quest 和所有基线都只作用于后面的层, 前两层用完整 cache. 论文指出是否跳过前两层和 KV 选择算法本身是正交的.

### 2.4 数据搬运量

设每个 K 或 V 向量占 $M$ 字节 (这里的 $M$ 是字节数, 和式 (2) 的最大值无关), KV cache 有 $L$ 个 token, 每页 $S$ 个. 估计阶段读每页的最大和最小向量, 约 $2M\cdot L/S$ 字节; 注意力阶段读选中的 $K$ 页, 约 $2M\cdot K\cdot S$ 字节. 整个 KV cache 是 $2M\cdot L$ 字节, 所以 Quest 读取的比例是

$$
\frac{1}{S}+\frac{K\cdot S}{L}=\frac{1}{\text{页大小}}+\frac{K}{\text{页数}}. \tag{7}
$$

Top-K 算子的显存读取和耗时都可忽略 (5 到 10 微秒), 不计入. 论文的例子: 每页 16 个 KV, 上下文 64K, 选「top 4K pages」, 数据量减少 8 倍. 按式 (7) 验算, 这里的 4K 应理解为 token 预算: $S=16$, $L=65536$, $K=4096/16=256$, 页数 $65536/16=4096$, 比例是 $1/16+256/4096=1/8$. 如果 4K 是页数, 第二项就是 1, 读取量比全量还多.

式 (7) 的第二项 $K\cdot S/L$ 就是 $B/L$. token 预算 $B$ 固定时, 它和页大小无关, 页越大只会让第一项越小. 所以从数据量看, 页越大越好; 页大小的代价全在精度上: 页越大, 每页包含的无关 token 越多, 上界越松, 同样的 $B$ 里真正关键的 token 越少. 如果固定的是页数 $K$ 而不是 token 数, 总量 $1/S+KS/L$ 在 $S=\sqrt{L/K}$ 时最小, 但那样预算会随页大小变化, 不便比较.

用效率实验的配置验算: 32K 上下文, 预算 2048, 页大小 16, 比例是 $1/16+2048/32768=1/8$, 理论上最多加速 8 倍. 实测的自注意力加速是 7.03 倍, 差距来自 Top-K 和估计 kernel 的固定开销.

上下文越长, 第一项越占主导. 按 passkey 实验的 100K, 预算 1024 推算: 第二项是 $1024/100\mathrm{K}\approx1\%$, 第一项仍是 $1/16=6.25\%$, 合计约 7.3%, 理论上限约 13.8 倍, 其中六分之五的读取花在估计上. 这时再省读取, 要靠加大页或量化元数据, 加大页又会让上界变松.

这个比例和模型无关, 也可以和现有的量化方法叠加.

元数据本身也占显存. 每页每个头存 $m$ 和 $M$ 两个向量, 大小和两个 key 相同; 而这一页的 KV 是 $2S$ 个向量. 所以额外显存是 KV 的 $2/(2S)=1/S$, 页大小 16 时是 6.25%. 这部分常驻显存, 和估计时每步读的那 $1/S$ 是同一份数据.

前两层不稀疏化, 也会拉低整个模型的收益. 以 32 层, 32K 上下文, 预算 2048 粗略计算: 前两层每层读全量, 后 30 层每层读 $1/8$, 整个模型读取的 KV 比例是 $(2+30/8)/32\approx0.18$, 约为全量的 1/5.6, 而不是 1/8. 论文 LongBench 无损比例的说明里专门强调「计入前两层的完整 cache 后」, 就是这个原因.

搬运的单位同样是页. Quest 用页做两件事: 作为估计的单位, 每页一个盒子; 作为加载的单位, Top-K 的结果是页下标, 可以直接交给 PagedAttention 风格的 kernel 做稀疏加载, 不需要先把选中的 KV 收集成新的连续张量. vLLM 的 PagedAttention 用页表解决显存碎片问题, 不涉及选择哪些页参与注意力. 两者共用页这个结构, 解决的问题不同.

### 2.5 为什么按最大点积选页

注意力输出是 $\sum_t a_tv_t$, 其中 $a_t\propto\exp(q\cdot k_t/\sqrt d)$. 两个 token 的点积相差 $\Delta$, 权重就相差 $e^{\Delta/\sqrt d}$ 倍. 例如 $d=128$, $\sqrt d\approx11.3$, 点积相差 30 时权重相差 $e^{2.65}\approx14$ 倍. 少数点积最大的 token 占据了大部分权重, 这就是注意力稀疏的来源. 所以选页的目标是: 不要漏掉包含点积最大的 token 的页.

用页内平均点积打分做不到这一点: 一页 16 个 token 中只有一个高分时, 平均值会被其余 15 个拉低. 用上界打分, 包含真实最大值的那页, 分数一定不低于这个最大值. 它被漏选, 只能是因为有 $K$ 个页的上界比它更高. 上界越紧, 这种情况越少. 所以 Quest 宁可高估, 不可低估: 高估的代价是选进几个不重要的页, 浪费一些预算; 低估的代价是漏掉真正的答案.

## 3. 实验

### 3.1 设置与 PG-19

模型是 LongChat-v1.5-7b-32k 和 Yarn-Llama-2-7b-128k, 基线是 H2O, TOVA, StreamingLLM. 所有方法都不作用于前两层.

任务包括 PG-19 语言建模, passkey 检索, 以及 LongBench 的六个数据集: NarrativeQA, HotpotQA, Qasper, TriviaQA, GovReport, MultifieldQA. 对 passkey 和 LongBench, 输入分成材料和问题 (或指令) 两部分. 材料用 FlashAttention 和完整 KV cache 做 prefill; 问题逐 token 喂入, 模拟解码. 这样做是为了模拟实际场景: 答案在前, 问题在后, 驱逐类方法可能在问题到来之前就丢掉答案.

H2O 需要历史注意力分数, 要计算完整的 $O(n^2)$ 注意力矩阵, 无法用 FlashAttention 做长上下文推理. 为了能在 100K 上运行, 论文让 H2O 在 prefill 阶段用 FlashAttention, 从解码阶段才开始累计历史分数. TOVA 和 StreamingLLM 在 10K 和 100K 上都正常评测.

PG-19 语言建模用 LongChat-7b-v1.5-32k, 输入 0 到 32K token, 测输出 token 的困惑度. H2O, TOVA, Quest 的预算都是 4096, 约为总长度的 1/8. Figure 6 显示 Quest 的困惑度和完整 cache 基本重合. 图中 H2O* 和 TOVA* 表示前两层不剪枝. 论文指出语言建模只涉及局部依赖, 模型关注最近 token 就能表现很好, 所以这个任务区分不出长依赖能力.

### 3.2 passkey 检索

Table 1, 准确率:

10K, LongChat-7b-v1.5-32k:

| 方法 / 预算 | 32 | 64 | 128 | 256 | 512 |
|---|---|---|---|---|---|
| H2O | 0% | 1% | 1% | 1% | 3% |
| TOVA | 0% | 1% | 1% | 3% | 8% |
| StreamingLLM | 1% | 1% | 1% | 3% | 5% |
| Quest | 65% | 99% | 99% | 99% | 100% |

100K, Yarn-Llama-2-7b-128k:

| 方法 / 预算 | 256 | 512 | 1024 | 2048 | 4096 |
|---|---|---|---|---|---|
| H2O | 2% | 2% | 2% | 2% | 4% |
| TOVA | 2% | 2% | 2% | 2% | 10% |
| StreamingLLM | 1% | 1% | 1% | 2% | 4% |
| Quest | 88% | 92% | 96% | 100% | 100% |

Quest 在 10K 和 100K 上分别用 64 和 1024 的预算接近满分, 约为总长度的 1%. H2O 和 TOVA 在问题到来之前就丢掉了 passkey 的 KV; StreamingLLM 只关注最近的窗口, passkey 在窗口外就答不出来. 驱逐类方法的预算从 32 加到 512 (或从 256 加到 4096), 准确率几乎不变, 因为答案在问题出现之前就已经不在 cache 里了.

Quest 自己的预算需求也随长度增长. 10K 上 64 个 token 就够, 占 0.64%; 100K 上需要 1024 个, 约占 1%, 绝对数量多了 16 倍. 按页数算, 64 个 token 是 4 页, 1024 个是 64 页; 10K 共约 625 页, 100K 共约 6250 页. 一个可能的解释 (推测, 论文没有分析): 页数随长度线性增长, 页大小 16 时 100K 有 6000 多页, 上界虚高的无关页也更多, 要多选一些页才能保证答案所在的页进入 Top-K. 预算 32 时 10K 上只有 65%, 也说明预算极小时, 上界的误差足以把答案页挤出去.

### 3.3 LongBench

Figure 7: 在六个数据集和各种预算下, Quest 都优于所有基线; 多数数据集上 1K 的预算就和完整 cache 相当, 其他基线即使用更大的预算仍有明显差距. 计入前两层的完整 cache 后, Quest 在各数据集上无损所需的 KV 比例:

| 数据集 | Qasper | HotpotQA | GovReport | TriviaQA | NarrativeQA | MultifieldQA |
|---|---|---|---|---|---|---|
| 比例 | 1/6 | 1/6 | 1/5 | 1/10 | 1/5 | 1/6 |

### 3.4 效率

论文基于 FlashInfer 用 CUDA 实现了整个框架. kernel 级评测在 RTX 4090 (CUDA 12.2) 上按 Llama2-7B 配置进行, 用 NVBench 测量; 端到端评测为了支持更长上下文, 用 Ada 6000. 基线是 FlashInfer 的普通注意力.

**关键度估计.** 序列短时, 估计的数据量不足以占满显存带宽, 相对 FlashInfer 的效率不高. 序列变长后, 相对耗时趋近 $1/S$, 因为每页只读一个 token 量级的元数据. 量化或更大的页可以进一步减少这部分开销.

**Top-K 过滤.** 用 RAFT 库的批量 Top-K CUDA 算子. 估计把每页压成一个分数, 数据量很小, 128K 以内耗时 5 到 10 微秒.

**近似注意力.** 把 Top-K 页下标作为稀疏加载的索引, 页大小 16. 给定预算 $B$, 近似注意力的耗时和序列长度无关, 接近序列长度为 $B$ 时 FlashInfer 的耗时.

**自注意力整体.** 三部分合起来, 用 PyTorch profiler 测量 (Figure 9). 32K 上下文, 预算 2048, 自注意力耗时相对 FlashInfer 减少 7.03 倍.

**端到端.** 单 batch, 测解码阶段生成一个 token 的平均延迟, 不含采样. 序列变长时 Quest 的延迟增长比 FlashInfer 慢得多, 因为预算基本不变. 32K 上下文, 预算 2048, FP16 权重下加速 1.74 倍, 4-bit 量化权重下加速 2.23 倍 (Figure 10). 量化权重后, 读权重的时间变短, 注意力在单步中的占比更高, Quest 的收益也就更大. 权重量化方法引自 Atom, 和 KV 选择无关.

可以用 Amdahl 定律粗略检查这两个数是否自洽 (下面是估算, 不是论文的分析). 设自注意力占解码单步时间的比例为 $f$, 自注意力加速 $r$ 倍, 端到端加速为

$$
\frac{1}{(1-f)+f/r}. \tag{8}
$$

取 $r=7.03$. 若 $f=0.53$ (论文第 3.1 节给出的读 KV 占比, 测于 RTX 4090), 端到端约 1.83 倍, 和 FP16 下实测的 1.74 倍接近. 反推 2.23 倍对应的 $f$: $(1-f)+f/7.03=1/2.23$, 解得 $f\approx0.64$, 即 4-bit 权重下注意力约占单步的 64%. 这个估算假设两块 GPU 上的自注意力加速相同, 只能说明数字在合理范围内. PMLR 会议页面上的摘要把这两个数写反了 (「2.23x self-attention speedup, which reduces inference latency by 7.03x」), arXiv 版摘要, 正文和 Figure 9, 10 一致, 以后者为准.

**同精度下和基线比较.** 目标是在 LongBench 六个任务上无损 (Figure 11). 以 NarrativeQA 为例, 平均上下文 24K, TOVA 需要 14K 的预算才能无损, Quest 只需 5K. 基线都没有自己的 kernel 实现, 论文用 FlashInfer 的延迟定性估计它们的自注意力耗时, 不计入其他运行时开销; Quest 计入了所有算子. 在 GovReport 和 TriviaQA 上, Quest 的自注意力分别比基线快 3.82 倍和 4.54 倍.

## 4. 选择依据对照与边界

### 4.1 和其他方法的关系

| 方法 | 选择依据 | 被跳过的 KV |
|---|---|---|
| [StreamingLLM](../01-StreamingLLM与Attention-Sink/01-StreamingLLM与Attention-Sink.md) | 位置: 开头 + 最近窗口 | 永久删除 |
| [H2O](../02-H2O-Heavy-Hitter-Oracle/02-H2O-Heavy-Hitter-Oracle.md) | 累计注意力 + 最近窗口 | 永久删除 |
| [SnapKV](../03-SnapKV-生成前观测窗/03-SnapKV-生成前观测窗.md) | prompt 末尾观测窗的注意力 | 永久删除 |
| [TOVA](../07-TOVA-注意力省略/07-TOVA-注意力省略.md) | 当前步注意力 | 永久删除 |
| Quest | 当前 query 与页内 key 的点积上界 | 本步不读, 下步可能再选中 |

驱逐类方法同时减少显存和读取量, 代价是丢掉的 KV 不能恢复. Quest 只减少读取量, 显存不变, 换来的是每步都能重新选择. 这和训练期的块稀疏注意力也不同: [MoBA](../../../2.4-稀疏注意力/01-MoBA架构深度解析/01-MoBA架构深度解析.md) 和 [NSA](../../../2.4-稀疏注意力/02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) 也按块打分再选 Top-K, 但打分方式 (块内 key 的均值或压缩表示) 是训练时就使用的, 模型参数适应了这种稀疏. Quest 用的是不需要训练的上界, 作用于现成模型.

两者的打分也有区别. MoBA 用块内 key 的均值和 query 做点积, 等于块内平均点积, 一个块里只有一个高分 token 时会被拉低 (见 2.5 节). 训练时模型可以学着让 key 的分布适应这种打分; 推理期直接拿来用, 就可能漏选. Quest 用上界, 不会低估, 代价是可能虚高.

SparQ 和 Quest 同样不驱逐, 同样按当前 query 选择, 区别在近似的方向. SparQ 在通道上做减法: 只用 query 中部分通道算出每个 token 的近似分数, 再按 token 选择, 粒度细但要读每个 token 的部分 key. Quest 在 token 上做减法: 用全部通道, 但每页只读两个向量, 再按页选择. 后者的读取是连续的整页, 更容易在 GPU 上转化为实际加速, 这也是论文对通道级稀疏的主要顾虑.

### 4.2 边界

**显存不减少.** 全部 KV 仍留在 GPU 上, 32K 上下文的 Llama-7B 仍需 16GB 存 KV. 加上约 13.5GB 的 FP16 权重, 已经超过 RTX 4090 的 24GB, 这和论文端到端评测改用 48GB 的 Ada 6000 是一致的. 显存只够放下 KV 时, Quest 省下的是带宽, 不能让更长的上下文放进来. 显存不够时, Quest 帮不上忙, 需要量化, GQA 等减少 KV 的结构, 或驱逐. Quest 解决的是带宽, 不是容量.

**上界可能很松.** 式 (5) 是逐通道的上界, 通道之间的最优端点来自不同 token 时就会虚高. 页越大, 盒子里的 token 越多, 越可能虚高, 选中的页里无关 token 越多. 论文的 kernel 实验固定页大小为 16, 没有给出页大小和精度的系统关系.

**前两层不能用.** 前两层稀疏度低于 10%, Quest 直接跳过它们. 对其他模型, 哪些层不能稀疏化需要重新测量.

**每步都要估计.** 估计阶段读的元数据约是 KV 的 $1/S$. 短序列时这部分开销占比高, 带宽利用率也低, 收益有限.

**预算过小时会丢信息.** 近似只在选页上, 选中的页内是精确计算. 但如果任务需要聚合全文大量位置的信息, 小预算会漏掉一部分, 这是预算问题.

**速度数字绑定实现和硬件.** 7.03 倍是 32K, 预算 2048, RTX 4090 上的自注意力; 2.23 倍是 32K, 预算 2048, 4-bit 权重, Ada 6000, 单 batch 的解码端到端. 加速依赖按页下标直接稀疏加载的 kernel; 如果先 Top-K 再把 KV 收集成新张量, 多出的拷贝会抵消一部分收益.

**只加速解码.** prefill 仍用完整注意力 (实验中用 FlashAttention), Quest 不改变首 token 延迟. 对输入很长, 输出很短的请求, 收益有限.

**GQA 下的选页方式没有讨论.** 论文的效率实验按 Llama2-7B 配置, 每个 query 头有自己的 KV 头. 在 GQA 模型中, 多个 query 头共享一个 KV 头, 各自算出的 Top-K 页可能不同: 要么取并集, 多读一些页; 要么合并分数后共用一组页, 可能对某些头不准. 论文没有讨论这个选择, 这一条是推断.

**和基线的效率比较是定性的.** 基线没有 kernel 实现, 论文用 FlashInfer 的延迟估计它们, 忽略了它们自身的运行时开销.

**参考文献**

1. Tang, J., Zhao, Y., Zhu, K., Xiao, G., Kasikci, B., Han, S. (2024). [Quest: Query-Aware Sparsity for Efficient Long-Context LLM Inference](https://arxiv.org/abs/2406.10774). ICML 2024, PMLR 235:47901–47911. arXiv:2406.10774. 第 3–4 节, Algorithm 1, Table 1, Figure 2–11. 代码: [mit-han-lab/Quest](https://github.com/mit-han-lab/Quest).
2. Zhang, Z., Sheng, Y., Zhou, T., et al. (2023). [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048). NeurIPS 2023.
3. Oren, M., Hassid, M., Yarden, N., Adi, Y., Schwartz, R. (2024). [Transformers are Multi-State RNNs](https://arxiv.org/abs/2401.06104). EMNLP 2024.
4. Xiao, G., Tian, Y., Chen, B., Han, S., Lewis, M. (2024). [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453). ICLR 2024.
5. Ge, S., Zhang, Y., Liu, L., et al. (2024). [Model Tells You What to Discard: Adaptive KV Cache Compression for LLMs](https://arxiv.org/abs/2310.01801). ICLR 2024.
6. Ribar, L., Chelombiev, I., Hudlass-Galley, L., et al. (2023). [SparQ Attention: Bandwidth-Efficient LLM Inference](https://arxiv.org/abs/2312.04985). arXiv:2312.04985.
7. Kwon, W., Li, Z., Zhuang, S., et al. (2023). [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180). SOSP 2023.
8. Ye, Z., Lai, R., Lu, R., et al. (2024). [Cascade Inference: Memory Bandwidth Efficient Shared Prefix Batch Decoding](https://flashinfer.ai/2024/01/08/cascade-inference.html). FlashInfer blog.
