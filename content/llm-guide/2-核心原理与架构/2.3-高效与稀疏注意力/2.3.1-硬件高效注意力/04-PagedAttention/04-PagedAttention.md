---
title: "04 · PagedAttention 与 vLLM:分块管理 KV Cache"
published: true
tags: ["PagedAttention", "vLLM", "KV Cache", "推理优化", "内存管理", "Continuous Batching"]
excerpt: "自回归推理要为每个请求保存全部历史 token 的 K 和 V.连续预分配让现有系统中只有 20.4% 到 38.2% 的 KV 显存存的是真实 token 状态.PagedAttention 把 KV Cache 切成固定大小的块,用块表映射逻辑位置和物理位置,浪费只剩每个序列最后一块的空位."
---
# 04 · PagedAttention 与 vLLM:分块管理 KV Cache

> 相关:[02 FlashAttention](../02-FlashAttention-IO感知分块/02-FlashAttention-IO感知分块.md) · [05 Attention 实现路径对比](../05-Attention实现路径对比/05-Attention实现路径对比.md) · [6.4.1 PagedAttention 原理](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)

## 1. 问题:KV Cache 的体积和浪费

### 1.1 KV Cache 有多大

解码第 $t$ 个 token 时,模型只计算当前 token 的 $q_t,k_t,v_t$,注意力要用到全部历史的 K 和 V:

$$
o_t=\operatorname{softmax}\!\left(\frac{q_tK_{1:t}^\top}{\sqrt{d_{head}}}\right)V_{1:t}. \tag{1}
$$

历史 token 的 K 和 V 在后续步骤中不变,所以缓存起来复用,这就是 KV Cache.不缓存时每一步都要对整个前缀重新做投影;缓存之后每一步只做当前 token 的投影和一次注意力,代价是显存随序列长度线性增长.

设层数 $N_{layer}$,KV 头数 $N_{kv}$,头维度 $D_{head}$,每个元素 $P$ 字节.一个 token 的 KV 大小为

$$
M_{token}=2\,N_{layer}\,N_{kv}\,D_{head}\,P, \tag{2}
$$

系数 2 对应 K 和 V.batch 中 $B$ 个请求都按最大长度 $S_{max}$ 计算时,总量为

$$
M_{KV}=B\,S_{max}\,M_{token}. \tag{3}
$$

论文给出的例子是 OPT-13B:隐藏维度 5120,40 层,FP16,单个 token 的 KV 为 $2\times5120\times40\times2=819{,}200$ 字节,约 800KB.请求长度到 2048 时,一个请求就要约 1.6GB.在 A100 40GB 上服务 13B 模型时,约 65% 的显存放权重,约 30% 留给 KV Cache.

再看一个使用 GQA 的模型.Llama-3-70B 有 80 层,8 个 KV 头,头维度 128.FP16 下每个 token 的 KV 为

$$
M_{token}=2\times80\times8\times128\times2=327{,}680\ \text{字节}=320\ \text{KiB}. \tag{4}
$$

取 $B=64$,$S_{max}=4096$:

$$
M_{KV}=64\times4096\times327{,}680=85{,}899{,}345{,}920\ \text{字节}=80\ \text{GiB}. \tag{5}
$$

如果 K 和 V 也用 64 个头(即不用 GQA),体积乘 8,为 640 GiB.70B 的 FP16 权重约 140GB,8 张 80GB 的卡放完权重还剩约 500GB,能放下 80 GiB 的 KV,放不下 640 GiB.这些数字是按最大长度预留时的需要量,实际请求的长度参差不齐,预留的大部分并没有被用到.

### 1.2 浪费从哪里来

论文把连续分配下的浪费分成三类:

1. **预留(reserved)**:为请求将来要生成的 token 预留的位置.请求最终会用到,但在它完成之前一直被占着,别的请求也用不了.
2. **内部碎片**:按最大长度分配,而请求实际更短,多出来的位置一直空着.
3. **外部碎片**:分配器在不同大小的分配和释放之后留下的不连续空闲区.总空闲量够,但没有一段连续区域足以放下新请求.

记第 $i$ 个请求分配了 $A_i$,实际用了 $U_i$,内部碎片率为

$$
\eta_{int}=\frac{\sum_i(A_i-U_i)}{\sum_iA_i}=1-\frac{\sum_iU_i}{\sum_iA_i}. \tag{6}
$$

若所有请求都按 $S_{max}$ 分配,$A_i$ 为常数,

$$
\eta_{int}^{(static)}=1-\frac{\bar s}{S_{max}}, \tag{7}
$$

其中 $\bar s$ 是平均实际长度.平均长度为 $S_{max}$ 的 30% 时,内部碎片率就是 70%.

外部碎片的一种度量是最大连续空闲块占总空闲量的比例.设空闲区大小为 $f_1,\dots,f_m$:

$$
\eta_{ext}=1-\frac{\max_jf_j}{\sum_jf_j}. \tag{8}
$$

$\eta_{ext}$ 接近 1 时,空闲显存总量可能不少,但切成了很多小段,装不下一个新请求.

论文的 Fig. 2 对现有系统做了测量:KV 显存中真正存放 token 状态的只有 20.4% 到 38.2%.

这些浪费会直接压低吞吐.解码阶段每一步只为每个请求算一个 token,计算量小,需要读的权重和 KV 却很多,受显存带宽限制.多个请求一起解码时,权重只读一次,所以提高吞吐的主要方法是增大 batch.KV 显存被浪费,同时驻留的请求就少,batch 受到限制.论文据此把内存管理作为吞吐的瓶颈来处理.

### 1.3 已有做法

**FasterTransformer** 按请求的最大可能长度静态分配连续的 KV 空间.

**Orca** 提出迭代级调度:每生成一步就重新组 batch,已完成的请求马上退出,新请求马上加入,不再等一整批结束.vLLM 沿用了这种调度方式.但 Orca 的 KV 仍是连续分配.论文没有 Orca 的公开实现,自己实现了 Orca 的调度,并按预留长度给出三种基线:

- **Orca (Oracle)**:假设事先知道每个请求的真实输出长度,只预留这么多.这是现实中做不到的上界.
- **Orca (Pow2)**:为输出多预留最多一倍,例如真实输出长度为 25 时预留 32 个位置.
- **Orca (Max)**:按模型最大长度 2048 预留.

三种 Orca 基线都用 buddy 分配器管理连续空间.即使是 Oracle,也只能消除预留之外的内部碎片,预留部分和外部碎片仍然存在.

这些做法还有一个共同的缺口:同一个请求的多个输出序列(并行采样,beam search)共享相同的 prompt,但连续分配下每个序列都存一份完整的 prompt KV,无法共享.

## 2. 分页,共享与调度

### 2.1 分页:逻辑块和物理块

PagedAttention 借用操作系统的分页机制.显存中的 KV 空间在启动时划分成大小相同的**物理块**,每块存放固定数量 $K$ 个 token 的 K 和 V(vLLM 默认 $K=16$).每个序列看到的是一串连续编号的**逻辑块**,**块表**记录每个逻辑块对应哪个物理块,以及这个块已经填了多少个位置.

序列增长时,只有当最后一个逻辑块写满才分配一个新的物理块.物理块可以位于显存中任何位置,彼此不必相邻.论文的 Fig. 6 给了一个例子:块大小为 4,一个 7 token 的 prompt 占两个逻辑块,逻辑块 0 和 1 分别映射到物理块 7 和 1;解码时逻辑块 1 的空位先被填满,再写下一个 token 时分配物理块 3.

注意力计算按块进行.设第 $j$ 个 KV 块为 $K_j=(k_{(j-1)K+1},\dots,k_{jK})$,$V_j$ 同理,论文式 (4) 把注意力写成

$$
A_{ij}=\frac{\exp\!\left(q_i^\top K_j/\sqrt d\right)}{\sum_{t=1}^{\lceil i/K\rceil}\exp\!\left(q_i^\top K_t\mathbf 1/\sqrt d\right)},\qquad
o_i=\sum_{j=1}^{\lceil i/K\rceil}V_jA_{ij}^\top, \tag{9}
$$

$A_{ij}$ 是第 $i$ 个 query 对第 $j$ 块的注意力分数行向量.kernel 根据块表找到每个 $K_j,V_j$ 所在的物理块,分别读取和计算.

每一轮迭代的流程是:调度器先选出本轮参与 batch 的序列,为它们新需要的逻辑块分配物理块;然后把本轮所有输入 token 拼成一个序列送入模型,其中处于 prompt 阶段的请求贡献整个 prompt,处于生成阶段的请求只贡献最新的一个 token.prompt 阶段用常规的自注意力(如 FlashAttention)算出 prompt 的 KV 和第一个输出 token,KV 按块写入;生成阶段用 PagedAttention kernel 读取已有的块,新 token 的 KV 写入最后一块的空位.

块大小大于 1 有计算上的理由:一块里有多个 token,kernel 可以并行处理更多位置的 KV,硬件利用率更高.块越大,碎片也越多,块大小的选择见第 4.1 节.

### 2.2 分页下的碎片上界

每块 $K$ 个 token 时,长度为 $s_i$ 的序列需要

$$
n_i=\left\lceil\frac{s_i}{K}\right\rceil \tag{10}
$$

个块,浪费的位置数为

$$
w_i=n_iK-s_i,\qquad 0\le w_i<K. \tag{11}
$$

也就是说,每个序列的浪费小于一块.$N$ 个序列的内部碎片率为

$$
\eta_{int}^{(paged)}=1-\frac{\sum_is_i}{K\sum_i\lceil s_i/K\rceil}. \tag{12}
$$

用 $\lceil x\rceil\le x+1$:

$$
\sum_i\left\lceil\frac{s_i}{K}\right\rceil\le\frac{1}{K}\sum_is_i+N, \tag{13}
$$

代入式 (12) 得到

$$
\eta_{int}^{(paged)}\le1-\frac{\sum_is_i}{\sum_is_i+NK}=\frac{K}{\bar s+K}. \tag{14}
$$

$\bar s\gg K$ 时上界约为 $K/\bar s$.$\bar s=1000$,$K=16$ 时不超过 1.6%;请求很短,比如 $\bar s=50$ 时,上界为 $16/66\approx24.2\%$.对比式 (7):同样平均长度占 $S_{max}$ 的 30% 时,静态分配是 70%.

外部碎片在分页下不存在.所有物理块大小相同,一个序列需要 $m$ 个新块时,只要空闲块数 $F$ 满足

$$
F\ge m, \tag{15}
$$

分配就一定成功,不要求这些块相邻.连续分配要求存在一段足够长的连续空闲区,条件更强.

预留也不存在了,因为块是在写满时才分配,不为将来的 token 提前占位.三类浪费里只剩下最后一块的空位.

### 2.3 共享与写时复制

块表让多个序列可以指向同一个物理块.每个物理块记录引用计数,即有多少个逻辑块映射到它.

**并行采样**:一个 prompt 生成多个输出.prompt 的 KV 只算一次,各输出序列的块表都指向这些物理块,引用计数等于序列数.某个序列要往共享块里写新 token 时,如果该块引用计数大于 1,就分配一个新物理块,把原块内容复制过去,把自己的映射改到新块,原块引用计数减 1,然后再写.这是写时复制(copy-on-write).引用计数为 1 的块直接写.

**Beam search**:不同 beam 之间不只共享 prompt,还共享生成过程中的公共前缀,而且共享关系随着 beam 的保留和淘汰不断变化.块表加引用计数可以表示任意的共享关系,淘汰一个 beam 时把它的块引用计数减 1,降到 0 的块回收.

论文的 Fig. 9 给了一个宽度 $k=4$ 的例子.某轮之前,每个候选都用满了 4 个逻辑块:4 个候选共享块 0(prompt);候选 3 从第二块起分叉;候选 0 到 2 共享前三块,到第四块才分叉.下一轮选出的前 4 个候选全部来自原候选 1 和 2,原候选 0 和 3 被淘汰,它们的逻辑块释放,引用计数降为 0 的物理块 2,4,5,8 被回收.新候选的 KV 写入新分配的物理块 9 到 12.此时 4 个候选共享块 0,1,3,候选 0 和 1 还共享块 6,候选 2 和 3 共享块 7.

连续分配的系统在这种情况下要整段复制 KV:例子中原候选 3 被替换后,要把候选 2 的大部分 KV 复制过来才能继续生成.块共享之后,只有新 token 要写进一个仍被共享的旧块时才触发写时复制,复制量最多一块.

**混合解码**:不同请求可以用不同的解码方式(贪心,并行采样,beam search),共享关系都隐藏在逻辑块到物理块的映射里.模型和 kernel 对每个序列只看到一串物理块编号,不需要知道哪些块被谁共享,所以不同解码方式的请求可以放进同一个 batch.

**共享前缀**:很多请求以同样的系统提示或 few-shot 示例开头.服务方可以事先把这段前缀的 KV 算好放在物理块里,新请求的块表直接映射过去,前缀部分不再重新计算.

前缀共享的显存收益可以这样估计.设前缀长度 $L_{prefix}$,序列数 $N_{seq}$,第 $i$ 个序列总长度 $L_i$:

$$
\text{Savings}=1-\frac{L_{prefix}+\sum_i(L_i-L_{prefix})}{N_{seq}L_{prefix}+\sum_i(L_i-L_{prefix})}. \tag{16}
$$

前缀远长于各自的独有部分时,节省比例接近 $1-1/N_{seq}$.

论文 §6.3 的测量:在 OPT-13B 和 Alpaca 数据集上,并行采样节省 6.1% 到 9.8% 的 KV 显存,beam search 节省 37.6% 到 55.2%;ShareGPT 上分别为 16.2% 到 30.5% 和 44.3% 到 66.3%.

在代码层面,上面这些解码方式都由三个操作组合:`fork` 从已有序列创建一个共享块的新序列,`append` 给序列追加一个 token,`free` 删除序列并释放块.并行采样,beam search 和前缀共享都由这三个操作表达.

### 2.4 调度:抢占,换出和重算

请求数增多,KV 块用完时,需要决定先服务谁,以及怎么腾出空间.论文的调度规则是:

- **先来先服务**:最早到达的请求优先服务,需要腾空间时先抢占最晚到达的请求.
- **整序列驱逐**:一个序列的所有块要么都在显存,要么都不在,不只驱逐一部分块.同一请求的多个序列(如一组 beam)作为一个序列组一起调度,一起抢占.

被抢占的序列有两种恢复方式:

- **换出到 CPU(swapping)**:把它的块复制到 CPU 内存,块管理器维护一份 CPU 块表.CPU 交换区的大小不超过 GPU 上 KV 区的大小.有序列被换出时,系统不再接收新请求,直到被换出的序列全部换回并完成.
- **重算(recomputation)**:直接释放它的块,恢复时把原 prompt 和已生成的 token 拼成新的 prompt,做一次 prefill 重新算出 KV.因为是一次并行的 prefill,速度比原来逐 token 解码快很多.

两种方式的取舍与块大小有关.论文 §7.3 的测量:块小时 swap 要通过 PCIe 传很多小块,开销很大;重算不读写 KV 块,开销与块大小无关.块大小在 16 到 64 之间时,两种方式的端到端表现相当.

整序列换出和重算,也是 vLLM 和操作系统分页不同的地方.vLLM 借用了虚拟内存和分页的结构,但利用了 LLM 推理的特点做了几处不同的设计.一是整序列换出:处理一个请求需要它的全部 token 状态都在显存里,所以只换出整个序列,不像操作系统那样按页换出.二是重算:被驱逐的块可以由 prompt 和已生成的 token 重新算出来,操作系统里的页没有这条恢复路径.三是间接寻址的开销通过把访存和注意力融合进同一个 kernel 来降低,做法见 2.5 节.

### 2.5 分布式执行与 kernel 实现

大模型用 Megatron-LM 式的张量并行切到多张卡上,注意力按头切分.vLLM 在集中式调度器中只放一个 KV 块管理器,所有 GPU worker 共享同一套逻辑块到物理块的映射,每张卡在同一个物理块编号下只存自己负责的那部分头的 K 和 V.每一步调度器把块表和输入一起发给各 worker,worker 之间不需要同步内存管理的状态.

单卡上的执行靠专门的 kernel.vLLM 的实现约 8.5K 行 Python 和 2K 行 C++/CUDA.为了应对不连续的访存,论文写了三类融合 kernel:

1. 融合 reshape 和块写入:每层新算出的 K 和 V 被切分,重排成块内布局,按块表写入对应位置,一个 kernel 完成.
2. 融合块读取和注意力:在 FasterTransformer 的注意力 kernel 基础上修改,按块表读取 KV,边读边算注意力.为了合并访存,一个 warp 负责读一个块.
3. 融合块复制:写时复制可能一次要复制很多不连续的块,逐个调用 `cudaMemcpyAsync` 会产生大量小拷贝,所以把它们合并成一个 kernel.

## 3. 数值走查与简化实现

### 3.1 Prefill

设块大小 $K=16$,物理块池有 20 个块,编号 P0 到 P19.三个请求的 prompt 长度为 10,50,100.

- 请求 A:$\lceil10/16\rceil=1$ 块,分配 P0,用了 10 个位置,浪费 6.
- 请求 B:$\lceil50/16\rceil=4$ 块,分配 P1 到 P4.前三块满,P4 用了 $50-48=2$ 个位置,浪费 14.
- 请求 C:$\lceil100/16\rceil=7$ 块,分配 P5 到 P11.P11 用了 $100-96=4$ 个位置,浪费 12.

总浪费为

$$
\text{Frag}_{int}=6+14+12=32\ \text{token}. \tag{17}
$$

分配了 12 块,容量 192 个位置,实际使用 160,碎片率 $32/192\approx16.7\%$.如果每个请求按 $S_{max}=128$ 连续预分配,容量 384,浪费 224,碎片率 $224/384\approx58.3\%$.

### 3.2 Decode

各请求继续生成.A 生成 6 个 token 后长度 16,P0 写满;B 生成 14 个后长度 64,P4 写满;C 生成 12 个后长度 112,P11 写满.此时没有任何浪费.

再生成一个 token 时,三个请求的最后一块都满了,各自分配一个新块:A 得到 P12,B 得到 P13,C 得到 P14,每块只用了 1 个位置.此时容量 $15\times16=240$,实际 $17+65+113=195$,浪费 45,碎片率 18.75%.

浪费在「刚分配新块」时最大,在「最后一块写满」时为 0,每个序列始终小于一块.序列越长,这一块占总长度的比例越小.

### 3.3 并行采样中的写时复制

换一个场景:一个 40 token 的 prompt,并行采样 3 个输出.prompt 占 3 块:P0 和 P1 满,P2 用了 8 个位置.三个序列的块表都是 [P0, P1, P2],三个块的引用计数都是 3.

序列 A 先写第 41 个 token,要写进 P2,但 P2 的引用计数为 3:

1. 分配新块 P3;
2. 把 P2 的 8 个 token 的 KV 复制到 P3;
3. A 的块表改为 [P0, P1, P3];
4. P2 的引用计数减为 2,P3 的引用计数为 1;
5. A 把新 token 写入 P3 的第 9 个位置.

此时 B 和 C 仍是 [P0, P1, P2].B 再写时 P2 的引用计数为 2,同样复制一份;等到只剩 C 一个序列指向 P2,引用计数为 1,C 直接写入 P2,不再复制.

显存方面,不共享时三份 prompt 要 $3\times40=120$ 个 token 的 KV;共享后存一份 40 个,加上复制出来的部分块.只有 A 完成复制时为 $40+8=48$,节省 $(120-48)/120=60\%$.

回收也按引用计数走.A 结束时依次对它的块执行 `free`:P0 和 P1 的引用计数从 3 降到 2,仍被 B,C 使用,不回收;P3 降到 0,回到空闲池.空闲池里的任何块都能分配给任何请求,不受位置限制.

### 3.4 简化实现

下面的代码只模拟块表和引用计数,不存真实的 KV 张量.`append_token` 在最后一块写满时分配新块,在要写入共享块时执行写时复制;`fork` 对应并行采样.

```python
from typing import Dict, List, Optional


class BlockAllocator:
    """物理块池:空闲栈 + 引用计数."""

    def __init__(self, num_blocks: int, block_size: int):
        self.block_size = block_size
        self.free_blocks: List[int] = list(range(num_blocks - 1, -1, -1))
        self.ref_count: Dict[int, int] = {}

    def allocate(self) -> Optional[int]:
        if not self.free_blocks:
            return None
        block_id = self.free_blocks.pop()
        self.ref_count[block_id] = 1
        return block_id

    def incr_ref(self, block_id: int) -> None:
        self.ref_count[block_id] += 1

    def free(self, block_id: int) -> None:
        self.ref_count[block_id] -= 1
        if self.ref_count[block_id] == 0:
            del self.ref_count[block_id]
            self.free_blocks.append(block_id)


class BlockTable:
    """单个序列的逻辑块 -> 物理块映射."""

    def __init__(self, allocator: BlockAllocator):
        self.allocator = allocator
        self.block_size = allocator.block_size
        self.mapping: List[int] = []
        self.num_tokens = 0

    def fork(self) -> "BlockTable":
        child = BlockTable(self.allocator)
        child.mapping = list(self.mapping)
        child.num_tokens = self.num_tokens
        for block_id in child.mapping:
            self.allocator.incr_ref(block_id)
        return child

    def append_token(self) -> bool:
        slot = self.num_tokens % self.block_size
        if slot == 0:
            new_block = self.allocator.allocate()
            if new_block is None:
                return False
            self.mapping.append(new_block)
        else:
            last = self.mapping[-1]
            if self.allocator.ref_count[last] > 1:
                new_block = self.allocator.allocate()
                if new_block is None:
                    return False
                # 真实系统在这里把 last 中前 slot 个 token 的 KV 复制到 new_block
                self.allocator.free(last)
                self.mapping[-1] = new_block
        self.num_tokens += 1
        return True

    def free_all(self) -> None:
        for block_id in self.mapping:
            self.allocator.free(block_id)
        self.mapping = []
        self.num_tokens = 0

    def waste(self) -> int:
        return len(self.mapping) * self.block_size - self.num_tokens


if __name__ == "__main__":
    allocator = BlockAllocator(num_blocks=20, block_size=16)

    seq_a = BlockTable(allocator)
    for _ in range(10):
        seq_a.append_token()
    print("A", seq_a.mapping, seq_a.waste())          # A [0] 6

    seq_b = BlockTable(allocator)
    for _ in range(50):
        seq_b.append_token()
    print("B", seq_b.mapping, seq_b.waste())          # B [1, 2, 3, 4] 14

    seq_c = seq_a.fork()
    print("ref(0) after fork", allocator.ref_count[0])  # 2

    seq_c.append_token()                               # 写共享块,触发复制
    print("C", seq_c.mapping, seq_c.num_tokens, "ref(0)", allocator.ref_count[0])
    # C [5] 11 ref(0) 1

    seq_a.append_token()                               # P0 已独占,原地写
    print("A", seq_a.mapping, seq_a.num_tokens)        # A [0] 11

    seq_a.free_all()
    print("free", len(allocator.free_blocks))          # free 15
```

代码与前文的对应:

- `allocate` 从空闲池任取一块,对应式 (15) 的分配条件;
- `append_token` 中 `slot == 0` 的分支对应式 (10),写满才分配;
- `ref_count[last] > 1` 的分支是写时复制;
- `waste` 计算式 (11) 的 $w_i$.

## 4. 实验结果与边界

### 4.1 实验结果

论文用 OPT-13B,66B,175B 和 LLaMA-13B,在 A100 上评测.表 1 给出了几种配置的 KV 容量:

| 模型 | GPU | 参数显存 | KV 显存 | 最多可存 token 数 |
|---|---|---|---|---|
| 13B | A100 40GB | 26GB | 12GB | 15.7K |
| 66B | 4×A100 | 132GB | 21GB | 9.7K |
| 175B | 8×A100-80GB | 346GB | 264GB | 60.1K |

表中的 token 数可以用式 (2) 验算.13B 的 12GB 按 12 GiB 算,除以每 token 800KB(819,200 字节)得 15.7K.OPT-175B 有 96 层,隐藏维度 12288,每 token 的 KV 是 $2\times12288\times96\times2=4{,}718{,}592$ 字节,即 4.5 MiB,264 GiB 除以它得 60.1K.

工作负载由 ShareGPT 和 Alpaca 数据集合成,请求按泊松过程到达.ShareGPT 的输入平均比 Alpaca 长 8.4 倍,输出长 5.8 倍,长度方差也更大.

论文摘要的概括是:延迟相同时,vLLM 的吞吐是 FasterTransformer 和 Orca 的 2 到 4 倍.

**基本采样**:ShareGPT 上 vLLM 能承受的请求率是 Orca (Oracle) 的 1.7 到 2.7 倍,Orca (Max) 的 2.7 到 8 倍,同时保持相近的延迟;相对 FasterTransformer 最高 22 倍.以 OPT-13B 为例,同一时刻 vLLM 处理的请求数是 Orca (Oracle) 的 2.2 倍,Orca (Max) 的 4.3 倍.

**并行采样和 beam search**:共享带来的收益随共享程度增大.OPT-13B 在 Alpaca 上,vLLM 相对 Orca (Oracle) 的优势从基本采样的 1.3 倍增加到宽度为 6 的 beam search 的 2.3 倍.

**共享前缀**:在 LLaMA-13B 的翻译任务上,共享一个 80 token 的 one-shot 示例前缀时,吞吐是 Orca (Oracle) 的 1.67 倍;共享 341 token 的 five-shot 前缀时为 3.58 倍.

**聊天**:把对话历史和最后一条用户输入拼成 prompt,截到最后 1024 个 token,最多生成 1024 个 token.vLLM 能承受的请求率是三种 Orca 基线的 2 倍.ShareGPT 的对话大多很长,多数请求的 prompt 都有 1024 个 token,buddy 分配器因此不论怎样预测输出长度都会为输出预留 1024 个位置,三种 Orca 基线的表现几乎一样.

**kernel 开销**:由于要查块表,做额外的分支,并处理变长序列,PagedAttention 的注意力 kernel 延迟比 FasterTransformer 的高 20% 到 26%.这部分只影响注意力算子,其他算子不受影响,端到端仍然因为 batch 更大而更快.

**块大小**:块太小,kernel 读取和处理 KV 时用不满 GPU 的并行度;块太大,内部碎片增加,共享的粒度变粗.在 ShareGPT 上块大小 16 到 128 表现最好;Alpaca 的序列较短,16 和 32 较好,更大的块会让很多序列的长度小于一块,性能明显下降.vLLM 默认取 16.

### 4.2 边界

**注意力 kernel 变慢.** 间接寻址和变长处理的代价是注意力 kernel 本身慢 20% 到 26%.收益来自 batch 变大.如果 batch 本来就受计算或别的因素限制,比如单请求低延迟场景,分页带来的收益会小很多.

**只减少浪费,不减少体积.** 式 (2) 给出的每 token KV 大小不变.长上下文下 KV 的总量仍随长度线性增长,这需要靠 GQA,MLA,KV 量化或稀疏化来降低.分页与这些方法可以同时使用.

**块表本身的开销.** 块表条目数为 $\lceil s/K\rceil$.$K=16$,$s=1{,}000{,}000$ 时为 62,500 条,每条按 4 字节计约 250KB,对显存不算大,但 kernel 每读一块都要先查表,这次间接访问是第 4.1 节 kernel 开销的来源之一.

**固定块大小的假设.** 分页要求所有 token 的 KV 大小相同.不同层的 KV 形状不同,或者一个模型里混合了 KV 体积不同的注意力层时,同一个块池需要额外的设计.

**换出受 PCIe 带宽限制.** 换出和换回走 PCIe,速度远低于 HBM.块小时 swap 的开销尤其大,重算往往更好.

**前缀共享的粒度.** 共享以块为单位.前缀长度不是块大小的整数倍时,最后一个不满的块在第一次写入时要复制.前缀短于一块时,可共享的部分有限.识别哪些请求有相同前缀,需要另外的机制,论文中的共享前缀场景是由服务方事先指定的.

**适用的负载.** 论文在讨论部分指出,分页之所以对 LLM 推理有效,是因为输出长度事先未知,需要动态分配,而且性能受显存容量限制.训练时张量形状大多是静态的,可以提前规划内存;非 LLM 的模型推理常常受计算限制,提高内存利用率不一定换来性能.在这些场景里,间接寻址和不连续的块反而可能拖慢速度.

**调度策略简单.** 先来先服务加整序列驱逐保证了公平,也避免了饥饿,但不区分请求的优先级或服务等级目标.

## 参考文献

1. Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph E. Gonzalez, Hao Zhang, Ion Stoica. (2023). [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180). SOSP 2023.
2. Gyeong-In Yu, Joo Seong Jeong, Geon-Woo Kim, Soojeong Kim, Byung-Gon Chun. (2022). [Orca: A Distributed Serving System for Transformer-Based Generative Models](https://www.usenix.org/conference/osdi22/presentation/yu). OSDI 2022.
3. Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, Bryan Catanzaro. (2019). [Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism](https://arxiv.org/abs/1909.08053). arXiv:1909.08053.
4. vLLM Project. [vLLM](https://github.com/vllm-project/vllm). 官方仓库.
