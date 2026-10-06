---
title: "05 · Attention 实现路径对比:eager,SDPA,flash-attn,xFormers 与 GQA"
published: true
tags: ["Attention", "SDPA", "FlashAttention", "xFormers", "GQA", "MQA", "PyTorch"]
excerpt: "同一条 softmax(QK^T/sqrt(d))V,在 PyTorch eager,SDPA,flash-attn 和 xFormers 里走的是不同的 kernel,显存和访存量差别很大.GQA 在这些路径里的处理方式也不同:有的按头号整除直接索引,有的先把 KV 复制成与 Query 同样多的头."
---
# 05 · Attention 实现路径对比:eager,SDPA,flash-attn,xFormers 与 GQA

> 相关:[02 Memory-Efficient Attention](../02-Memory-Efficient-Attention/02-Memory-Efficient-Attention.md) · [03 FlashAttention](../03-FlashAttention-IO感知分块/03-FlashAttention-IO感知分块.md) · [04 FlashAttention-3/4](../04-FlashAttention-Hopper与Blackwell/04-FlashAttention-Hopper与Blackwell.md) · [01 PagedAttention](../../2.7-长上下文与外推技术/2.7.3-长上下文推理优化/01-PagedAttention/01-PagedAttention.md) · [2.2.2 多头注意力变体](../../2.2-注意力机制/2.2.2-多头注意力变体/2.2.2-多头注意力变体.md)

材料是 PyTorch SDPA 文档,flash-attn 和 xFormers 的 README 与源码.问题是同一条注意力公式在这几条执行路径上各跑什么 kernel,访存差多少,GQA 又是怎么处理的.

## 1. 问题:同一个公式,不同的执行方式

### 1.1 注意力的几种执行方式

注意力的定义是

$$
O=\operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt D}\right)V. \tag{1}
$$

记 batch 为 $B$,头数 $H$,序列长度 $N$,头维度 $D$.按定义逐步计算:

$$
S=\frac{QK^\top}{\sqrt D},\qquad P=\operatorname{softmax}(S),\qquad O=PV. \tag{2}
$$

$S$ 和 $P$ 的形状都是 $B\times H\times N\times N$.PyTorch eager 模式下这三步各是独立的 kernel,每一步都把结果写回 HBM,下一步再读出来.$B=64,H=16,N=4096$,FP16 时单个 $S$ 就有

$$
64\times16\times4096^2\times2=34{,}359{,}738{,}368\ \text{字节}=32\ \text{GiB}, \tag{3}
$$

$P$ 再占同样大小.训练时为了反向还要保存 $P$.序列再长一倍,这两项乘 4.

计算量与执行方式无关.两次矩阵乘的 FLOPs 为

$$
F=2BHN^2D+2BHN^2D=4BHN^2D. \tag{4}
$$

所以不同实现的差别不在算多少,而在读写多少,以及能不能把中间结果留在片上.

注意力出现在三种场合,对实现的要求不同:

1. **训练**:$L=S=N$,前向之后还有反向,要么保存 $P$,要么在反向时重算.显存和访存都按 $N^2$ 增长,融合内核的收益最大,见 2.6 节.
2. **推理的 prefill**:一次处理整个 prompt,$L=S$,只有前向.形式与训练前向相同,同时要把算出的 K,V 写进 KV cache.
3. **推理的 decode**:每步只有一个新 query,$L=1,S$ 为已有长度.计算量很小,时间主要花在读 KV cache 上,见 2.8 节.因果掩码的对齐方式和 GQA 的实现方式在这里影响最大.

同一个模型在这三种场合可能走三条不同的路径,下文分别讨论.

### 1.2 已有做法:四条执行路径

| 路径 | 入口 | 输入布局 | 中间矩阵 | 说明 |
|---|---|---|---|---|
| eager | `q @ k.transpose(-2, -1)`,`softmax`,`@ v` | `[B, H, N, D]` | 写入 HBM | 每步一个 kernel |
| SDPA | `F.scaled_dot_product_attention` | `[B, H, N, D]` | 取决于后端 | 按输入派发到融合内核或参考实现 |
| flash-attn | `flash_attn_func` 等 | `[B, N, H, D]` | 不写入 HBM | FlashAttention 原作者维护的包 |
| xFormers | `memory_efficient_attention` | `[B, N, H, D]` | 不写入 HBM | 在多种内核之间派发 |

**eager** 是 PyTorch 默认的执行方式,写法和式 (2) 一一对应,便于调试和插入任意修改,代价是中间矩阵全部落到显存.研究新的注意力变体时,通常先用这条路径确认结果正确,再考虑换成融合内核.

**SDPA** 是 PyTorch 2.0 加入的函数.文档列出它的实现有三种:FlashAttention-2,Memory-Efficient Attention,以及一个与参考公式一致的 C++ 实现;GQA 的说明里还提到了 cuDNN attention.所有实现默认都启用,函数根据输入自动选择.用 `torch.nn.attention.sdpa_kernel()` 上下文管理器可以限定允许使用的后端,也可以用 `torch.backends.cuda.enable_flash_sdp()` 等函数全局开关.CUDA 以外的设备只用 C++ 实现.

**flash-attn** 是 FlashAttention 作者维护的包,接口比 SDPA 多:变长序列,滑动窗口,ALiBi,softcapping,KV cache 原地更新和分页 KV cache 都有专门的参数.

**xFormers** 的 `memory_efficient_attention` 是一个派发入口.源码中列出的前向算子包括 CUTLASS 实现,FlashAttention 实现,FlashAttention-3,AMD 的 CK 实现,Blackwell 的 CUTLASS 实现和 Triton 的 split-K 实现,按输入和硬件选择.目前 fmha 的实现已经迁到 `mslk` 包,`xformers.ops.fmha` 重新导出这些符号.LLaMA 第一代的论文说明,训练时用的因果多头注意力来自 xformers 库,实现受 Rabe 和 Staats 的工作启发,反向用的是 Dao 等人的方法.函数名中的 memory efficient 指的是这一类不物化注意力矩阵的算法,具体跑哪个 kernel 由派发决定.

## 2. 访存,派发与接口细节

### 2.1 访存量和算术强度

只统计 $N\gg D$ 时的主项.eager 路径的 HBM 读写(以元素计):

- 第一步读 $Q,K$,写 $S$:$2BHND+BHN^2$;
- softmax 读 $S$,写 $P$:$2BHN^2$;
- 第三步读 $P,V$,写 $O$:$BHN^2+2BHND$.

合计

$$
M_{eager}=4BHN^2+4BHND\approx4BHN^2. \tag{5}
$$

融合内核在片上完成 softmax,$S$ 和 $P$ 不写回 HBM.只看最低的一次读写:

$$
M_{fused}\approx4BHND. \tag{6}
$$

FlashAttention 实际还要多次读 $K,V$,访存量的确切形式见 [03 FlashAttention](../03-FlashAttention-IO感知分块/03-FlashAttention-IO感知分块.md),这里只比较主项.

每个元素 $P$ 字节,算术强度(每字节访存对应的浮点运算)为

$$
I_{eager}\approx\frac{4BHN^2D}{4BHN^2P}=\frac{D}{P},\qquad
I_{fused}\approx\frac{4BHN^2D}{4BHNDP}=\frac{N}{P}. \tag{7}
$$

两者之比约为 $N/D$.以 H100 SXM 为例,FP16 稠密矩阵乘峰值 989 TFLOPs,HBM 带宽约 3.35 TB/s,两者之比约 295 FLOPs/字节,低于这个强度的计算受带宽限制.FP16 下 $D=64$ 时 $I_{eager}\approx32$,远低于 295;$N=4096$ 时 $I_{fused}\approx2048$,高于 295.这说明 eager 路径即使在 Tensor Core 上算矩阵乘,时间也主要花在搬运 $S$ 和 $P$ 上.

把第 1.1 节的设置代进去算一遍时间下限.$B=64,H=16,N=4096,D=64$,FP16:

- 计算量:式 (4) 为 $4\times64\times16\times4096^2\times64\approx4.40\times10^{12}$ FLOPs,按 989 TFLOPs 算约 4.4 ms.
- eager 访存:式 (5) 主项 $4BHN^2$ 个元素,共 $137{,}438{,}953{,}472$ 字节,按 3.35 TB/s 算约 41 ms.
- 融合内核访存:式 (6) 为 $4BHND$ 个元素,共 $2{,}147{,}483{,}648$ 字节,约 0.64 ms.

eager 的访存时间约为计算时间的 9 倍,受带宽限制;融合内核的访存时间远小于计算时间,瓶颈回到计算上.这是理想峰值下的估算,实际利用率达不到峰值,但两条路径的相对位置不会变.

式 (7) 还没有计入 softmax 本身的指数运算和 kernel 启动开销.$N$ 较小时 $S$ 本身不大,可能留在 L2 缓存中,eager 的实际差距会小于式 (7) 的比值.

### 2.2 SDPA 的语义和派发

SDPA 文档给出的参考实现(简写):

```python
def sdpa_reference(query, key, value, attn_mask=None, dropout_p=0.0,
                   is_causal=False, scale=None, enable_gqa=False):
    L, S = query.size(-2), key.size(-2)
    scale_factor = 1 / math.sqrt(query.size(-1)) if scale is None else scale
    attn_bias = torch.zeros(L, S, dtype=query.dtype, device=query.device)
    if is_causal:
        temp_mask = torch.ones(L, S, dtype=torch.bool, device=query.device).tril(diagonal=0)
        attn_bias.masked_fill_(temp_mask.logical_not(), float("-inf"))
    if attn_mask is not None:
        if attn_mask.dtype == torch.bool:
            attn_bias.masked_fill_(attn_mask.logical_not(), float("-inf"))
        else:
            attn_bias = attn_mask + attn_bias
    if enable_gqa:
        key = key.repeat_interleave(query.size(-3) // key.size(-3), -3)
        value = value.repeat_interleave(query.size(-3) // value.size(-3), -3)
    attn_weight = query @ key.transpose(-2, -1) * scale_factor
    attn_weight += attn_bias
    attn_weight = torch.softmax(attn_weight, dim=-1)
    attn_weight = torch.dropout(attn_weight, dropout_p, train=True)
    return attn_weight @ value
```

这段代码定义了所有后端都要满足的语义,有几处容易出错:

- **dropout 总是生效.** 函数按 `dropout_p` 施加 dropout,不看模块是否处于训练模式,推理时要显式传 0.
- **布尔掩码的含义.** SDPA 中 `True` 表示参与注意力;`nn.MultiheadAttention` 的 `key_padding_mask` 中 `True` 表示屏蔽.从后者迁移要取反.
- **`is_causal` 与 `attn_mask` 不能同时设置**,否则报错.
- **非方阵的因果掩码.** `tril(diagonal=0)` 让第 $i$ 行只看前 $i+1$ 列,对齐左上角.

派发方面,文档说明各融合内核有各自的输入限制,不满足时 SDPA 会给出警告并说明原因,然后使用其他实现.想确保跑在某个融合内核上,可以在 `sdpa_kernel` 中只放这一个后端,这样不满足条件时会直接报错,不会悄悄回退到 C++ 实现.

数值上,不同后端的浮点运算顺序不同,结果可能有微小差别.C++ 实现支持 float64;输入为 half 或 bfloat16 时,它的中间结果都用 float32 保存.

### 2.3 因果掩码的两种对齐

设 query 长度 $L$,key 长度 $S$.因果掩码允许第 $i$ 个 query 看到第 $j$ 个 key 的条件有两种写法:

$$
\text{左上角对齐:}\ j\le i,\qquad \text{右下角对齐:}\ j\le i+S-L. \tag{8}
$$

$L=S$ 时两者相同.SDPA 的 `is_causal` 在 $L\ne S$ 时按左上角对齐.flash-attn 从 2.1 起改为右下角对齐,README 给的例子是 $L=2,S=5$:

```text
左上角对齐(SDPA is_causal)     右下角对齐(flash-attn >= 2.1)
1 0 0 0 0                      1 1 1 1 0
1 1 0 0 0                      1 1 1 1 1
```

解码时新 query 位于序列末尾,应该看到全部历史,对应右下角对齐.用 SDPA 做带 KV cache 的增量计算时,不能直接设 `is_causal=True`,要么单 token 解码时不加掩码,要么显式构造掩码,或者使用 `torch.nn.attention.bias.CausalBias` 指定对齐方式.flash-attn 在 $L>S$ 时,掩码全为 0 的行输出为 0.

融合内核处理因果掩码时还能跳过整块被屏蔽的分块,计算量约为不加掩码时的一半;eager 路径要先构造 $L\times S$ 的掩码,再把整个 $S$ 算出来.

### 2.4 flash-attn 的接口

flash-attn 2.x 的主要接口:

- `flash_attn_func(q, k, v, dropout_p, softmax_scale, causal, window_size, alibi_slopes, deterministic)`:`q` 形状为 `(batch, seqlen, nheads, headdim)`,`k,v` 为 `(batch, seqlen, nheads_k, headdim)`.
- `flash_attn_qkvpacked_func`:Q,K,V 打包成 `(batch, seqlen, 3, nheads, headdim)`,反向时省去梯度拼接.
- `flash_attn_varlen_func`:多条变长序列首尾相接放在一起,用累积长度数组 `cu_seqlens` 标出边界,不需要 padding.旧名 `flash_attn_unpadded_func` 已改名.
- `flash_attn_with_kvcache`:解码用.传入新的 `k,v` 时,按 `cache_seqlens` 原地写入 `k_cache,v_cache`,可以同时做旋转位置编码,然后在整段 cache 上算注意力.传入 `block_table` 时,cache 的形状为 `(num_blocks, page_block_size, nheads_k, headdim)`,`page_block_size` 必须是 256 的倍数.

用 `flash_attn_with_kvcache` 做一步解码的流程是:`q` 形状为 `(batch, 1, nheads, headdim)`,新 token 的 `k,v` 形状为 `(batch, 1, nheads_k, headdim)`;`cache_seqlens` 给出每个序列当前已有的长度,内核把新的 `k,v` 写到 cache 中这个位置;如果传入了 `rotary_cos` 和 `rotary_sin`,新的 key 在位置 `cache_seqlens` 处旋转,query 在因果模式下也在同样的位置旋转;然后在「已有 cache 加新 token」上算注意力.调用方在这一步之后把 `cache_seqlens` 加 1.写 cache,旋转位置编码,注意力三步合在一次调用里完成,省掉了单独的拼接和旋转 kernel.batch 里各序列的长度可以不同,内核按各自的 `cache_seqlens` 截断.

其他参数和加入的版本:`window_size=(left, right)` 实现滑动窗口,第 $i$ 个 query 只看 $[i+S-L-\text{left},\,i+S-L+\text{right}]$ 内的 key(2.3);`alibi_slopes` 加上 $-\text{slope}\cdot|i+S-L-j|$ 的偏置,`deterministic=True` 让反向确定(2.4),确定性反向稍慢且多用显存,前向总是确定的;softcapping 用于 Gemma-2 和 Grok 一类模型(2.6).

运行条件:FlashAttention-2 需要 CUDA 12.0 以上,Ampere,Ada 或 Hopper 架构(Turing 由另一个仓库支持部分功能),fp16 或 bf16,头维度最大 256.FlashAttention-3 需要 H100 或 H800,CUDA 12.3 以上,推荐 12.8.FlashAttention-4 用 CuTe-DSL 编写,面向 Hopper 和 Blackwell,从 `flash_attn.cute` 导入 `flash_attn_func`.AMD 的 CDNA 和 RDNA 显卡由 Triton 实现支持,包括 fp32.

### 2.5 GQA 在各路径中的处理

GQA 有 $H_q$ 个 Query 头和 $H_{kv}$ 个 KV 头,组大小 $g=H_q/H_{kv}$ 必须是整数.MQA 是 $H_{kv}=1$ 的特例,MHA 是 $H_{kv}=H_q$.数学定义与模型质量的讨论见 [2.2.2 多头注意力变体](../../2.2-注意力机制/2.2.2-多头注意力变体/2.2.2-多头注意力变体.md).

| 张量 | MHA | GQA | MQA |
|---|---|---|---|
| query | `[B, H_q, N, D]` | `[B, H_q, N, D]` | `[B, H_q, N, D]` |
| key / value | `[B, H_q, N, D]` | `[B, H_kv, N, D]` | `[B, 1, N, D]` |

各实现约定的映射都是连续的 $g$ 个 Query 头共用一个 KV 头:

$$
\operatorname{kv}(h)=\left\lfloor\frac{h}{g}\right\rfloor,\qquad h=0,1,\dots,H_q-1. \tag{9}
$$

flash-attn README 的例子:Q 有 6 个头,K,V 有 2 个头时,Q 的 0,1,2 号头看 KV 的 0 号头,3,4,5 号头看 1 号头.

实现方式有两种.

**先复制再算.** HuggingFace 的 Llama 实现中有一个 `repeat_kv` 函数:

```python
def repeat_kv(hidden_states: torch.Tensor, n_rep: int) -> torch.Tensor:
    # hidden_states: [B, H_kv, N, D]
    if n_rep == 1:
        return hidden_states
    b, h, s, d = hidden_states.shape
    hidden_states = hidden_states[:, :, None, :, :].expand(b, h, n_rep, s, d)
    return hidden_states.reshape(b, h * n_rep, s, d)
```

展开后第 $h\cdot g+r$ 个头是原来第 $h$ 个 KV 头的副本($r=0,\dots,g-1$),与式 (9) 一致,也与 SDPA 参考实现中的 `repeat_interleave(g, dim=-3)` 结果相同.`expand` 本身只改 stride,不分配内存;但随后的 `reshape` 要把步长为 0 的维度和头维度合并,无法用视图表示,会复制一份 $g$ 倍大小的张量.所以这条路径在计算时会临时占用与 MHA 相同的 KV 显存,也按 MHA 的量读取 KV.

**按头号索引.** 融合内核在计算 Query 头 $h$ 时直接按式 (9) 计算 KV 头的地址,不复制.flash-attn 的 `flash_attn_func` 和 `flash_attn_with_kvcache` 接收头数少于 Q 的 K,V,就是这种方式.SDPA 中设置 `enable_gqa=True` 后,文档说明 FlashAttention,cuDNN attention 和 C++ 实现在 CUDA 张量上支持 GQA,Memory-Efficient Attention 在 NVIDIA CUDA 上也支持;该功能标为实验性,不支持 nested tensor,要求 Query 头数能被 KV 头数整除,且 K 和 V 的头数相同.

解码时 GQA 的收益来自少读 KV.每一步读取的 KV 字节数为

$$
M_{read}=2\,N\,H_{kv}\,D\,P\quad(\text{每层每个序列}), \tag{10}
$$

按头号索引的内核按 $H_{kv}$ 计算;先复制的路径按 $H_q$ 计算,而且多了一次复制,带宽上的收益基本没有了.

以 Llama-3-70B 的配置为例:$H_q=64,H_{kv}=8,D=128$,FP16,上下文 $N=8192$.按式 (10),每层每个序列每步读取 $2\times8192\times8\times128\times2=33{,}554{,}432$ 字节,即 32 MiB;先复制成 64 个头,则是 256 MiB.80 层合计分别为 2.5 GiB 和 20 GiB,这是生成一个 token 时一个序列要读的 KV 量.复制路径还要先把 32 MiB 写成 256 MiB,写入的量也按 $g$ 倍增加.

SDPA 文档中给 Llama 3 的 GQA 示例是 32 个 Query 头,8 个 KV 头,并且放在 `SDPBackend.MATH` 下运行.C++ 实现与参考公式一致,按参考实现的写法要先用 `repeat_interleave` 展开 KV,属于先复制再算;要按头号索引,需要让 SDPA 派发到支持 GQA 的融合后端.

判断一份模型代码走的是哪一种,最直接的办法是看传进注意力函数的 K 张量形状:头数那一维是 $H_{kv}$,说明复制交给了内核或者根本没有复制;是 $H_q$,说明调用之前已经展开过.再配合性能分析工具看实际启动的 kernel 名称,就能确认 SDPA 最终派发到了哪个后端.

### 2.6 训练时保存的中间结果

训练时反向要用到 softmax 的输出.eager 路径保存整个 $P$,每层的额外显存为

$$
M_P=B\,H\,N^2\,P. \tag{11}
$$

取 $B=8,H=32,N=4096$,FP16,单层 $M_P=8\times32\times4096^2\times2=8$ GiB,32 层就是 256 GiB,一张卡放不下,只能减 batch 或开激活重算.如果还保存 $S$ 或 dropout 掩码,还要更多.

融合内核只保存每行的 logsumexp,反向时由 $Q,K$ 重算分数块:

$$
M_{lse}=B\,H\,N\times4\ \text{字节}. \tag{12}
$$

同样的设置下每层只有 $8\times32\times4096\times4=4$ MiB.代价是反向要多做一次 $QK^\top$,FLOPs 增加,但省掉了 $P$ 的读写,在长序列上总体更快.重算的细节见 [03 FlashAttention](../03-FlashAttention-IO感知分块/03-FlashAttention-IO感知分块.md).

### 2.7 变长序列:padding 和打包

一个 batch 里的序列长度不同,$n_1,\dots,n_B$.按最长序列 padding 成 $[B,N_{max}]$ 时,注意力的计算量和访存都按 $N_{max}$ 计算,padding 位置再用掩码屏蔽:

$$
F_{pad}=4\,B\,H\,N_{max}^2\,D. \tag{13}
$$

打包方式把所有序列首尾相接成一条长度为 $\sum_in_i$ 的序列,用累积长度数组

$$
\text{cu\_seqlens}=\left(0,\ n_1,\ n_1+n_2,\ \dots,\ \textstyle\sum_{i=1}^Bn_i\right) \tag{14}
$$

标出每条序列的边界,内核只在同一条序列内部算注意力:

$$
F_{packed}=4\,H\,D\sum_{i=1}^Bn_i^2. \tag{15}
$$

例如 4 条序列,长度 512,1024,1024,4096:padding 后 $B\cdot N_{max}^2=4\times4096^2\approx6.7\times10^7$;打包后 $\sum n_i^2=512^2+2\times1024^2+4096^2\approx1.9\times10^7$,约为前者的 28%.flash-attn 的 `flash_attn_varlen_func` 用的就是这种格式;xFormers 用 `BlockDiagonalMask` 一类的偏置表示同样的分段结构;SDPA 对 nested tensor 有一定支持,但 GQA 不支持 nested tensor.

### 2.8 解码时的算术强度

增量解码时每个序列只有 1 个新 query,$L=1$.每层每个序列的计算量为 $4H_qND$,读取的 KV 字节数为式 (10),算术强度为

$$
I_{decode}=\frac{4H_qND}{2NH_{kv}DP}=\frac{2g}{P}. \tag{16}
$$

FP16 时 MHA($g=1$)为 1 FLOPs/字节,$g=8$ 的 GQA 为 8 FLOPs/字节,都远低于前面算出的约 295 的平衡点.解码注意力的时间几乎全由读 KV 决定,所以优化方向是少读:用 GQA,MQA,MLA 减少 KV 体积,用量化减少每个元素的字节数.

$L=1$ 时 FlashAttention 原来的并行方式(按 batch,头和 query 分块切分)在小 batch 下切不出足够多的线程块,GPU 占不满.flash-attn 2.2 起加入的 Flash-Decoding 沿 KV 长度再切分,各段分别算局部 softmax 结果,最终用 logsumexp 合并,原理见 [6.6.3 Flash-Decoding](../../../6-训练与推理优化/6.6-推理框架与高级优化/6.6.3-Flash-Decoding原理与实现/6.6.3-Flash-Decoding原理与实现.md).这也是先复制再算的 GQA 实现在解码时代价最大的原因:式 (16) 中的 $g$ 被复制抵消,读 KV 的量退回到 MHA 的水平.

### 2.9 全屏蔽行和数值比较

某一行的掩码全为屏蔽时,eager 路径的 softmax 会出问题.这一行的分数全是 $-\infty$,减去行最大值得到 $-\infty-(-\infty)$,结果是 NaN,再经过 $PV$ 传给后面的层.padding 的 query 行,或者 $L>S$ 时右下角对齐掩码的前几行,都会出现这种情况.flash-attn 的文档写明,掩码全为 0 的行输出为 0.不同实现对这种行的处理不一样,模型代码最好在掩码层面避免出现全屏蔽行,或者在注意力之后把这些位置的输出显式置零.

比较几条路径是否一致时,参照值的选择会影响结论.fp16 的 eager 结果本身也有舍入误差,拿它当标准,可能把融合内核更准的结果判成「有误差」.FlashAttention-3 论文测数值误差的做法是,用 FP64 计算参考结果,再比较各实现相对于它的均方根误差.论文的输入取自含离群值的分布,FP16 下标准实现的 RMSE 为 3.2e-4,FlashAttention-2 和 FlashAttention-3 都是 1.9e-4,约低 1.7 倍.论文给出的原因是融合内核把 softmax 的中间结果保存为 FP32,而标准实现的中间结果是 FP16.在本地验证时可以照此处理:先把输入转成 float64,用式 (2) 算出参考输出,再分别计算 eager fp16 和融合内核的误差,看两者是否在同一量级.

误差的另一个来源是 softmax 的分母.融合内核按块累加分母和输出,每遇到更大的行最大值就把已有的累加量乘一个缩放因子,运算顺序与一次性求和不同.这在数学上是精确的,在浮点上只造成舍入差异,累加器为 FP32 时量级与上面的 RMSE 相当.反向的情况类似,但 flash-attn 默认的反向对 $dQ$ 用原子加累加,多个线程块的加法顺序不固定,两次运行的梯度可能有极小差别,需要逐位复现时要开 `deterministic=True`.

### 2.10 掩码和偏置的表示

三套接口表达掩码的方式不同,这直接决定了一种注意力变体能不能走融合内核.

- **SDPA** 接受任意 `attn_mask`,形状只要能广播到 $(N,\dots,H_q,L,S)$.布尔掩码中 `True` 表示参与,浮点掩码直接加到分数上.
- **flash-attn** 的 `flash_attn_func` 没有通用掩码参数,只能用 `causal`,`window_size`,`alibi_slopes`,`softcap` 这几种结构化的形式,以及 varlen 接口的分段.这些都能在内核里按位置 $(i,j)$ 现场算出,不需要从显存读.
- **xFormers** 用 `attn_bias` 对象,`LowerTriangularMask` 表示因果,`BlockDiagonalMask` 表示打包后的分段,也可以传入普通张量.

结构化掩码和稠密掩码的访存差别可以直接算出来.稠密的浮点偏置有 $B\cdot H\cdot L\cdot S$ 个元素,内核必须把它从 HBM 读进来:

$$
M_{bias}=B\,H\,L\,S\,P. \tag{17}
$$

$L=S=N$ 时它与式 (5) 中单个 $S$ 矩阵的读写同阶,融合内核省下的 $O(N^2)$ 访存又回来了一部分.广播维度($B$ 或 $H$ 为 1)能减少这一项,但只要掩码依赖 $(i,j)$ 且无法用公式现场算出,$N^2$ 这一项就去不掉.因果,滑动窗口,ALiBi 都只依赖 $i-j$ 或 $i,j$ 的简单关系,所以能做成零额外访存的内核参数.

### 2.11 选择路径

| 情况 | 可选路径 | 依据 |
|---|---|---|
| 一般训练和推理,标准注意力 | SDPA | 无额外依赖,自动选融合内核 |
| 需要确认跑在融合内核上 | SDPA + `sdpa_kernel` 只放目标后端 | 不满足条件时报错而不是回退 |
| 变长序列打包,滑动窗口,ALiBi,softcapping | flash-attn | 有对应的专门参数 |
| 带分页 KV cache 的解码 | flash-attn 的 `flash_attn_with_kvcache` 或推理框架自带内核 | 支持 `block_table` |
| 需要 float64,或调试注意力内部 | eager 或 SDPA 的 C++ 实现 | 可以检查 $S,P$ |
| 头维度超过 256 | SDPA 的其他后端或 eager | FlashAttention-2 最大支持 256 |

表的读法是默认用 SDPA,只有它表达不了的需求才换路径.第二行对应 2.2 节的派发规则:输入不满足某个融合内核的限制时,SDPA 只给警告并换用其他实现,在 `sdpa_kernel` 里只放目标后端,这种回退就变成报错.第三,四行是 flash-attn 独有的结构化参数和分页接口,参数含义见 2.4 节,打包见 2.7 节,掩码的表示见 2.10 节.最终两行落在融合内核的数据类型和头维度限制之外,只能回到非融合实现,代价是 2.1 节算过的 $O(N^2)$ 访存.

## 3. 代码与边界

### 3.1 代码

下面四个函数的输出在数值误差范围内应该一致.注意输入布局:eager 和 SDPA 用 `[B, H, N, D]`,flash-attn 和 xFormers 用 `[B, N, H, D]`.

```python
import math
import torch
import torch.nn.functional as F
from torch.nn.attention import sdpa_kernel, SDPBackend


def attention_eager(q, k, v, causal=False):
    # q: [B, H_q, N, D];k, v: [B, H_kv, N, D]
    g = q.size(1) // k.size(1)
    k = k.repeat_interleave(g, dim=1)
    v = v.repeat_interleave(g, dim=1)
    scores = q @ k.transpose(-2, -1) / math.sqrt(q.size(-1))   # [B, H_q, N, N]
    if causal:
        n = scores.size(-1)
        mask = torch.ones(n, n, dtype=torch.bool, device=q.device).tril()
        scores = scores.masked_fill(~mask, float("-inf"))
    return torch.softmax(scores, dim=-1) @ v


def attention_sdpa(q, k, v, causal=False):
    return F.scaled_dot_product_attention(
        q, k, v, is_causal=causal, enable_gqa=q.size(1) != k.size(1)
    )


def attention_sdpa_flash_only(q, k, v, causal=False):
    with sdpa_kernel(backends=[SDPBackend.FLASH_ATTENTION]):
        return attention_sdpa(q, k, v, causal)


def attention_flash(q, k, v, causal=False):
    from flash_attn import flash_attn_func
    out = flash_attn_func(
        q.transpose(1, 2), k.transpose(1, 2), v.transpose(1, 2), causal=causal
    )
    return out.transpose(1, 2)


def attention_xformers(q, k, v, causal=False):
    from xformers.ops import memory_efficient_attention, LowerTriangularMask
    bias = LowerTriangularMask() if causal else None
    out = memory_efficient_attention(
        q.transpose(1, 2), k.transpose(1, 2), v.transpose(1, 2), attn_bias=bias
    )
    return out.transpose(1, 2)
```

`attention_xformers` 这里只演示 K,V 头数与 Q 相同的情形.

几个容易出错的地方:

- `transpose` 之后张量不连续.flash-attn 要求最终一维连续,`transpose(1, 2)` 只交换了前面的维度,一般满足;其他改变最终一维 stride 的操作需要先 `.contiguous()`.
- flash-attn 的 CUDA 实现支持 fp16 和 bf16,不支持 fp32 输入.
- `attention_eager` 的因果掩码假定 $L=S$.增量解码时 $L<S$,要按式 (8) 的右下角对齐构造.
- 比较几条路径的输出时,容差要按 dtype 设置.fp16 和 bf16 下融合内核与 eager 的差异来自累加顺序,不说明哪一条有错.

### 3.2 边界

**语义差异.** 各后端在因果掩码对齐,掩码取值约定,dropout 行为上不完全一致,从一个后端换到另一个时要逐项核对,尤其是 $L\ne S$ 的因果掩码.输入布局也不同,SDPA 是头在序列之前,flash-attn 和 xFormers 是序列在头之前,换后端时漏掉一次转置,形状仍可能对得上,结果却是错的.

**派发的不透明.** SDPA 和 xFormers 都根据输入自动选择内核,同一段代码在不同 GPU,不同 dtype,不同头维度下可能走不同的内核,速度和数值都会变.性能测试要固定后端,或者记录实际使用的后端.

**GQA 的复制开销.** 模型代码里如果先调用 `repeat_kv` 再交给 SDPA,即使 SDPA 派发到了 FlashAttention,KV 也已经被复制了 $g$ 倍,GQA 在显存和带宽上的收益在这一层没有了.应该把头数不等的 K,V 直接交给支持 GQA 的内核.

**硬件覆盖.** SDPA 文档说明,融合内核只在 CUDA 后端可用,其他设备一律走 C++ 实现.flash-attn 的 CUDA 实现覆盖 Ampere,Ada,Hopper,FlashAttention-3 只支持 H100 和 H800;AMD 显卡要用它的 Triton 实现.同一份模型代码换到别的硬件上,原来的融合路径可能不存在.

**测量数字依赖环境.** eager 和融合内核的速度比随 GPU,序列长度,头维度和软件版本变化.式 (7) 只说明趋势;具体倍数要在目标环境上测量.

**融合内核覆盖不到的变体.** 自定义的注意力打分函数,任意稠密偏置,需要输出注意力矩阵的分析工作,往往只能走 eager 或 C++ 实现,或者改用支持自定义打分的编译方案.PyTorch 2.5 加入的 FlexAttention(`torch.nn.attention.flex_attention`)是这类方案之一:用户用 Python 写一个 `score_mod` 函数改分数,或写一个 `mask_mod` 函数描述哪些 $(i,j)$ 可见,`torch.compile` 把它们融合进一个 Triton 内核;`mask_mod` 先被转成块级的 `BlockMask`,整块被屏蔽的分块直接跳过.PyTorch 官方博客报告的速度是前向约为 FlashAttention-2 的 90%,反向约 85%.`create_block_mask` 默认的块大小是 128.以因果掩码,序列 8192 为例,共 $64\times64$ 个块,对角线以上的 2016 个块整块跳过,只有对角线上的 64 个块要逐元素算掩码.块越大,能整块跳过的判断越粗;对角线块里约一半元素被屏蔽,仍然要按元素处理.这种写法覆盖式 (17) 里能用公式现场算出的偏置,任意稠密偏置仍要从显存读.

**分页 KV cache 的块大小要求不同.** 上游 flash-attn 的分页接口要求块大小是 256 的倍数,PagedAttention 论文中 vLLM 的默认块大小是 16.接入时要核对所用内核对块大小的要求.

**参考文献**

1. Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Ré. (2022). [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135). NeurIPS 2022.
2. Tri Dao. (2023). [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691). ICLR 2024.
3. Markus N. Rabe, Charles Staats. (2021). [Self-attention Does Not Need $O(n^2)$ Memory](https://arxiv.org/abs/2112.05682). arXiv:2112.05682.
4. Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebrón, Sumit Sanghai. (2023). [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245). EMNLP 2023.
5. Noam Shazeer. (2019). [Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150). arXiv:1911.02150.
6. Hugo Touvron et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971). arXiv:2302.13971.
7. PyTorch. [`torch.nn.functional.scaled_dot_product_attention`](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html).
8. Dao-AILab. [flash-attention README](https://github.com/Dao-AILab/flash-attention).
9. Meta. [xFormers](https://github.com/facebookresearch/xformers).
10. NVIDIA. [H100 Tensor Core GPU Datasheet](https://www.nvidia.com/en-us/data-center/h100/).
