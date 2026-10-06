---
title: "FlashMLA: MLA 解码为什么受计算限制, 以及 seesaw、FP8 KV 与稀疏化怎么落到 kernel"
category: "开源仓库"
tags: ["DeepSeek", "技术解析", "开源仓库", "MLA", "FlashMLA"]
published: true
excerpt: "以代码为准讲清 FlashMLA: 矩阵吸收后 MLA 退化成 head dim 576/512 的 MQA, 解码阶段因此落入计算受限区间; seesaw 双 warpgroup 调度绕开寄存器约束, FP8/FP4 KV 把访存与显存压下去, DSA top-k 把注意力复杂度从平方降到近线性."
---

# FlashMLA: MLA 解码为什么受计算限制, 以及 seesaw、FP8 KV 与稀疏化怎么落到 kernel

[FlashMLA](https://github.com/deepseek-ai/FlashMLA) 于 2025-02-24 在 DeepSeek 开源周第一天公开, 作者包括 Jiashi Li、Shengyu Liu、Yuanhang Sun, 采用 MIT 许可证. 2026-09-30 的 main 版本加入昇腾 kernel, 同时移除了 Hopper 与 V3/V3.2/V4.0 支持并修改 KV cache 格式. 早期 Hopper 解码 kernel 对应提交 [ba89a34](https://github.com/deepseek-ai/FlashMLA/tree/ba89a3466e9470ad08ab39738d4e7bb66989e1e7), 当前 SM100 稀疏 kernel 则对应 main 分支; 两代实现需要按提交区分, 不能混用接口和缓存布局.

FlashMLA 对外只做一件事: 注意力核那一截 $\mathrm{softmax}(QK^\top)V$ 的高性能实现, 不含前后的线性投影. 它支撑的模型从 2025 年的 DeepSeek-V3, 到 V3.2 的稀疏注意力, 再到 2026 年的 V4.1. 这条演进线上, kernel 的形态换过三轮: 先是 bfloat16 稠密 MLA 解码, 再是配 FP8 KV 的稀疏解码, 最后是把 norm、RoPE、cast 融进来的 fused kernel. 底层硬件也从 Hopper (SM90) 换到 Blackwell (SM100), 随后增加华为昇腾实现. 每次变化都同时改动数据布局、调度方式和可支持的模型版本.

## 1. 它解决的瓶颈: 解码阶段 MLA 为什么受计算限制

把 FlashMLA 和普通的 FlashAttention 分开看, 关键在一个反直觉的事实: 自回归解码阶段, 注意力一般受访存带宽限制, 而 MLA 的解码 kernel 却落在计算受限区间. 这个差别决定了整套优化的方向, 也决定了 kernel 的形状. 要讲明白, 得先看矩阵吸收把 MLA 变成了什么.

两类瓶颈需要不同的优化手段. 受访存限制的 kernel 要减少读写并提高带宽利用率, 例如加快 KV 搬运、提高缓存命中; 受计算限制的 kernel 卡在 Tensor Core 的矩阵乘吞吐, 要让标量运算与矩阵乘重叠, 尽量缩短 Tensor Core 的空闲时间. MLA 解码属于后者, 当时主流解码注意力 kernel 则主要围绕省带宽调优, 因此 FlashMLA 采用了独立实现.

### 1.1. 矩阵吸收后 MLA 退化成 MQA, 以及 576/512 的形状从哪来

MLA 的低秩潜变量与解耦 RoPE 推导见 llm-guide 的 03-MLA-低秩潜变量与解耦RoPE, 矩阵吸收的工程实现见 04-MLA-矩阵吸收与工程实现. FlashMLA 接收的形状由这两项设计直接决定: MLA 把每个 token 的 KV 压成一个低秩潜变量 $\mathbf c^{KV}_t$ (维度 $d_c=512$), 再加一段解耦 RoPE 的 key $\mathbf k^R_t$ (维度 $d^R_h=64$). 推理时, 原本要为每个 head 还原出 $\mathbf k, \mathbf v$ 的上投影 $W_{UK}, W_{UV}$ 可以被「吸收」进 query 侧和输出侧的矩阵: $W_{UK}$ 并进 $W_{UQ}$, $W_{UV}$ 并进 $W_O$. 吸收后, 注意力分数可以由 query 直接与潜变量做内积, 无须先展开成每个 head 的 key.

吸收的结果是形状塌缩. 社区里 [杨文博的分析](https://yangwenbo.com/articles/understand-flashmla-in-deepseek-mla-formulas.html) 把这步讲得很直接: q 的形状从 $128\times192$ 变成 $128\times576$, k 从每 head 一份变成一份共享的 $576$ 维, v 变成 $512$ 维, 而且 v 就是 k 的前 $512$ 维, 第二份 KV 不再单独存在. 这里的 $576 = 512 + 64$ 是潜变量 $d_c$ 加 RoPE 的 $d^R_h$, $512$ 是潜变量本身. 一旦所有 query head 共享同一份 $576$ 维的 key、同一份 $512$ 维的 value, 这就退化成了 Multi-Query Attention. FlashMLA 的接口如实反映了这点: `flash_mla_with_kvcache` 的 docstring 写明 `head_dim` 必须 512、`num_heads_k` 必须 1 (只支持 MQA), 见 [`flash_mla_interface.py`](https://github.com/deepseek-ai/FlashMLA/blob/main/flash_mla/flash_mla_interface.py).

需要划清一条边界: 矩阵吸收这步发生在模型建模代码里, 不在 FlashMLA 里. 开源推理框架约定的 attention 算子只负责 $\mathrm{softmax}(QK^\top)V$ 那一行, 前后的 $W_{UQ}, W_{UK}, W_{UV}, W_O$ 投影由框架的 MLA 模块 (如 SGLang 的 `DeepseekV2AttentionMLA`) 实现. 所以 FlashMLA 收到的 q 已经是吸收后的 $576$ 维 latent query, kv 已经是 $576$ 维的 latent. 这条边界解释了一个容易误解的点: 库名叫 FlashMLA, 但它导出的 `flash_mla_with_kvcache` 本质是个输入形状特殊的 MQA 算子, MLA 的灵魂 (低秩压缩) 在它上游已经做完了.

这条边界同时解释了 KV cache 为什么能小到可以放进显存. 吸收前, 每个 token 要为 128 个 head 各存一份 key 和 value, 若按 MHA 的 $d_h=128$ 算, 一个 token 的 KV 是 $128\times128\times2 = 32768$ 个元素; 吸收后只存一份 $576$ 维的 latent, 一个 token 是 $576$ 个元素, 两者差约 57 倍. 正是这个压缩比让 128K 上下文的单请求 KV 从不可接受降到 GiB 量级, 也正是它让后面 FP8 量化的收益 (再省一半字节) 变得有意义: 先靠低秩把量级压下来, 再靠量化抠细节, 两步叠在一起才撑得起长上下文的大 batch 推理.

### 1.2. 计算访存比约 $2 h_q s_q$ 与 128 这个阈值

把形状代进 roofline 分析, 就能看出为什么解码阶段也会计算受限. 官方 [20250422 deep-dive](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20250422-new-kernel-deep-dive.md) 给了完整推导: 设 q 头数 $h_q$, 每请求 q token 数 $s_q$, kv token 数 $s_k \gg h_q s_q$, K 与 V 的头维 $d_k, d_v$. 浮点运算量约 $2 h_q s_q s_k (d_k + d_v)$, 访存量 (字节) 约 $2 s_k d_k$ (因为 $s_k$ 份 kv 占大头, 每份 $d_k$ 个 bfloat16). 两者相除, 计算访存比约 $h_q s_q \cdot \frac{d_k + d_v}{d_k} \approx 2 h_q s_q$.

这个比值是普通 MHA 解码的几十倍. 普通 MHA 每个 query head 自带一份 KV, 读一份 KV 只喂一个 head 算, 计算访存比接近 1, 所以解码受带宽限制. MLA 退化成 MQA 后, 一份 $576$ 维的 latent 要喂 $h_q = 128$ 个 query head 一起算, 访存被这 128 个头摊薄, 算力这边却实打实地算了 128 遍. 代进 H800 的数字: 峰值带宽 $3.35$ TB/s, 降频后实际峰值算力约 $865$ TFlops, 临界点在 $h_q s_q \ge \frac{1}{2}\cdot\frac{865}{3.35} = 128$. DeepSeek 的线上推理系统在解码实例上不开张量并行, 所以 $h_q$ 就是满的 $128$, 正好压在计算受限这一侧.

这解释了为什么整套 kernel 的优化目标是「让 Tensor Core 一直忙」, 而不是「省带宽」. 一个受计算限制的 kernel, 瓶颈在 Tensor Core 的 GEMM 吞吐; 要提速, 就得让 CUDA Core 上的 softmax、缩放这些标量运算与 Tensor Core 的矩阵乘重叠起来, 别让 Tensor Core 停下来等 softmax. 下面的 seesaw 调度就是冲这个目标设计的. 这里也埋了一个伏笔: 一旦 KV 用 FP8 存, 反量化又要占 CUDA Core, 计算受限的瓶颈会从「softmax 挡路」变成「反量化挡路」, 这是第 4 节 Hopper crossover 要解决的问题.

## 2. 解码 kernel 的数据流: paged KV、split-KV、tile 调度与 combine

受计算限制的 kernel 要跑满, 前提是把活均匀铺到所有 SM 上, 并且让每个 SM 的输入数据按需、按时到位. FlashMLA 解码路径的数据流由三件事拼成: 分页的 KV 缓存与 indices 寻址、把长 KV 序列切成多段的 split-KV、以及负责分配与合并的 tile scheduler 加 combine kernel. 这三件事从 2025-02 的首发版一直延续到现在, 接口细节随版本改过, 但骨架没变.

这三件事各管一段. 分页 KV 管「数据在显存里怎么放、怎么按下标取」, 解决的是长序列、变长 batch 下的显存碎片问题; split-KV 管「一条长请求怎么拆给多个 SM 并行」, 解决的是单 SM 串行扫 128K token 太慢、又喂不满 SM 的问题; tile scheduler 加 combine 管「谁算哪一段、算完怎么拼回去」, 解决的是负载均衡和部分结果的正确合并. 三者配合才让计算受限的 kernel 既不空闲也不算错. 下面分两块讲: 先是 KV 的组织与寻址, 再是调度与合并.

### 2.1. paged KV 块与 indices 寻址

首发版 (2025-02) 的 README 写明 KV 缓存采用 BF16 分页 (paged) 布局, 块大小为 64. KV 被切成每块 64 个 token 的固定 block, `block_table` 记录每条序列对应的物理 block. 这套布局来自 vLLM 的 PagedAttention, 不同长度的序列可以共享物理显存, 无须按最长序列预留连续空间. 历史 kernel 代码中的断言 `FLASH_ASSERT(params.page_block_size == Kernel_traits::kBlockN)` 要求页大小等于 kernel 的 N 维 tile, 见 [`flash_fwd_mla_kernel.h` (b31bfe7)](https://github.com/deepseek-ai/FlashMLA/blob/b31bfe72a83ea205467b3271a5845440a03ed7cb/csrc/flash_fwd_mla_kernel.h).

到了稀疏版 (2025-09 之后), 寻址方式变了. 稀疏 kernel 不再用 `block_table` 做间接寻址, 而是让调用方把 page block 下标直接编进 `indices`. 当前接口的契约写得很细: `indices_in_kvcache[i][j][k] = (token t 所在 page block 的下标) * page_block_size + (token t 在该 block 内的偏移)`, 其中 $t$ 是第 $i$ 个 batch、第 $j$ 条 query 序列的第 $k$ 个 token. 因为物理地址已经算进 `indices`, kernel 内部不再需要 `block_table`, 但为兼容旧签名仍要求传 (传 `None` 即可). 仓库提供了 `abs_indices2indices_in_kvcache` 做这步转换, 把逻辑下标 (0 到 $s_k-1$) 映射成带 page block 的物理下标, 见 [tests/quant.py](https://github.com/deepseek-ai/FlashMLA/blob/main/tests/quant.py).

无效项的处理是个容易踩的坑. 解码 kernel 只把恰好等于 $-1$ 的下标当无效, 不做任何上界检查; 任何其他越界正值都会产生越界的 TMA 地址, 直接非法访存. 这条在 `flash_mla_with_kvcache` 的 docstring 里专门标了出来. prefill kernel 宽松一些, 无效项可以是 $-1$ 或任意 $\ge s_{kv}$ 的数. 这个差异来自两条路径的实现: decode 为了省掉边界判断的分支把检查外包给了调用方, prefill 则在 gather 前做了 mask. 对接模型时, 调用方必须保证 decode 的无效位严格填 $-1$.

页大小选 64 不是随手定的. 块越大, `block_table` 越短、寻址间接层越薄, 但显存碎片越多 (一条序列的尾部不满一块也要占整块); 块越小碎片越少, 但寻址表变长、每次 gather 的随机访存更碎. 64 是在这两端之间的折中, 也和 kernel 里 N 维 tile 的粒度对齐, 让一块 KV 正好是一次 TMA 搬运的单位. 稀疏化之后这层的意义又变了: 因为 top-k 下标本来就是随机分布的, 稀疏 kernel 每次只按 `indices` 取少量 token, 页大小更多是影响 `indices` 编码时 block 下标乘以多少, 而不再决定连续扫描的粒度.

### 2.2. tile scheduler、split-KV 与 combine

单条请求的 KV 可能很长 (128K token), 一个 SM 串行扫完太慢, 也喂不满所有 SM. split-KV 的做法是把一条请求的 KV 序列沿 token 维切成若干段, 每段分给一个 SM 算出部分的注意力输出和对应的 log-sum-exp, 最后再合并. FlashMLA 用一个 tile scheduler 来决定怎么切、怎么分. 首发接口里 `get_mla_metadata(cache_seqlens, num_heads_per_head_k, num_heads_k)` 在解码循环前跑一次, 根据各请求的序列长算出 `tile_scheduler_metadata` (形状 `(num_sm_parts, TileSchedulerMetaDataSize)`) 和 `num_splits` (形状 `(batch_size + 1)`), 目标是让各 SM 的负载尽量均衡.

当前接口把这步做成了惰性的. `get_mla_metadata()` 不再带参数, 只返回一个空的 `FlashMLASchedMeta` 占位对象, 真正的调度元数据在第一次调用 `flash_mla_with_kvcache` 时由 C++ 侧 `sparse_decode_fwd` 生成并写回. 元数据对象里带了一份 `Config` (记录 `b`、`s_q`、`h_q`、`page_block_size`、`topk` 等), 后续调用会断言形状一致, 复用同一份元数据能省掉重算. 文档特别提醒: `topk_length` 和 `extra_topk_length` 的值不在校验范围内, 复用带不同 `topk_length` 的元数据会静默沿用过时的 split-KV 调度. 还有一个 `enable_batch_invariant` 开关, 置 True 会关掉 split-KV 路径, 让结果不依赖 batch 怎么切分, 代价是放弃 split 带来的并行度, 见 [`flash_mla_interface.py`](https://github.com/deepseek-ai/FlashMLA/blob/main/flash_mla/flash_mla_interface.py).

合并由一个独立的 combine kernel 完成. 历史代码里 `flash_fwd_splitkv_mla_combine_kernel` 以 `dim3(params.b * params.h * params.seqlen_q)` 的网格启动, 每个线程块负责一个 (batch, head, q token) 的输出, 把各 split 的部分结果按 log-sum-exp 重新归一后相加, 见 [`flash_fwd_mla_kernel.h` (b31bfe7)](https://github.com/deepseek-ai/FlashMLA/blob/b31bfe72a83ea205467b3271a5845440a03ed7cb/csrc/flash_fwd_mla_kernel.h). split 产出的 kernel 和 combine kernel 之间用 programmatic dependent launch 重叠: combine 不必等 split 全部结束, 可以在 split 快写完时提前启动, 省掉一次 kernel 启动的串行等待. `num_splits` 的分桶上限也随版本调过, 2026-07 的提交把 decode-combine 的 `num_splits` 桶扩到了 256, 对应极长序列下更细的切分.

合并的正确性靠 log-sum-exp 的可组合性撑着. 每个 split 独立算自己那段 KV 的在线 softmax, 产出一个部分输出和一个部分 lse; 合并时, 两段的 lse 决定各自的权重, 按 $\exp(lse_i - lse_{\max})$ 重新归一后相加, 等价于把两段当成一段从头算. 这就是为什么 kernel 既返回 `out` 也返回 `lse`: lse 不只是给上层看的调试量, 它是 split-KV 合并的必要中间态. `enable_batch_invariant` 开关关掉 split 路径, 换来的是结果不依赖 batch 怎么切, 用在需要逐位复现的场景 (比如对拍、调试数值问题); 代价是放弃了 split 的并行度, 长序列下会变慢. 这是一个明确的正确性与速度的取舍, 放在接口上让调用方按场景选.

## 3. seesaw 双 warpgroup 流水

seesaw 是 2025-04-22 性能更新的核心, 把 H800 计算受限场景从 580 TFlops 推到 660 TFlops. 它要解决的问题很具体: 在寄存器放不下两份输出矩阵的约束下, 怎么让 CUDA Core 的标量运算 (softmax、缩放) 和 Tensor Core 的矩阵乘重叠起来. 这一节先讲约束为什么卡死了常规做法, 再把 12 步调度拆开看它怎么绕过去.

重叠这件事为什么难, 得回到注意力的两类运算. QK 内积和 score-V 乘积是矩阵乘, 跑在 Tensor Core 上; 求行最大、减最大、取指数、归一化、按新最大缩放旧累加器, 这些是逐元素的标量运算, 跑在 CUDA Core 上. 一个 KV 块的处理里, 这两类运算有先后依赖: 要先算完 QK 才能做 softmax, 做完 softmax 才能算 score-V. 如果串行走, Tensor Core 在做 softmax 时就闲着, CUDA Core 在做 GEMM 时也闲着. 要让两种单元都忙, 就得同时处理两个 KV 块, 让一个块的 softmax 和另一个块的 GEMM 错开进行, 而这正好撞上寄存器放不下两份累加器的墙.

### 3.1. 寄存器约束: 为什么不能照搬 FlashAttention-3 的 ping-pong

FlashAttention-3 的提速靠两招: warpgroup 间的 ping-pong 调度, 和 warpgroup 内的 GEMM-softmax 流水. ping-pong 的前提是手上有两份独立的输出累加器, 让两个 warpgroup 一个做 GEMM、一个做 softmax, 轮流占用 Tensor Core 和 CUDA Core. 但 MLA 这里有个硬约束: WGMMA 指令要求输出矩阵必须在寄存器里. 一个 $64\times512$ 的输出矩阵占 32768 个 32 位寄存器, 而每个 SM 只有 65536 个. 换句话说, 一个 SM 的寄存器只够放一份输出矩阵, 放不下两份. 没有第二份累加器, 经典 ping-pong 就没法直接搬过来.

官方 deep-dive 在这里留了一句「你可以先停下来想想有没有比我们更好的方案」. DeepSeek 的解法是在 FlashAttention 的在线 softmax 之上再加一步数学变换: 既然放不下两份完整的输出矩阵, 就把一份 $64\times512$ 的输出竖切成两半 $O_L$ 和 $O_R$ (各 $64\times256$), 分别交给两个 warpgroup 维护; 对应地, 每一步取两个 KV 块 $K_0, K_1$ (在 MLA 里 $K$ 和 $V$ 是同一份 latent, 名字不同), 把 $V_0, V_1$ 也各切成左右两半. 这样两个 warpgroup 各自只扛半份输出, 寄存器压力减半, 又能互相错开占用 Tensor Core 和 CUDA Core.

### 3.2. 12 步 seesaw 与细粒度 TMA 流水

seesaw 的 12 步 (编号 0 到 11) 可以这样读: warpgroup 0 维护 $\vec o_L$, warpgroup 1 维护 $\vec o_R$, 两者共享一个运行最大值 $m$. 步骤 1、2 两个 warpgroup 并行算各自的注意力分数 $\vec p_0 = \vec q K_0^\top / qk\_scale$ 和 $\vec p_1 = \vec q K_1^\top / qk\_scale$ (Tensor Core 上的 GEMM). 步骤 3 到 5, warpgroup 0 算 $\vec p_0$ 的行最大、更新 $m$ 和缩放因子 $scale_0 = \exp(m\_new_0 - m)$、做 softmax、再把 $\vec o_L$ 缩放后累加 $\vec p_0 V_{0L}$. 步骤 6 到 8, warpgroup 1 对 $\vec p_1$ 做同样的事, 并把 $\vec o_R$ 按 $scale_0 \cdot scale_1$ 缩放后累加 $\vec p_1 V_{1R}$. 步骤 9 到 11 是交叉补账: $\vec p_0$ 再乘 $scale_1$, warpgroup 1 把 $\vec p_0 V_{0R}$ 补进 $\vec o_R$, warpgroup 0 把 $\vec o_L$ 缩放后累加 $\vec p_1 V_{1L}$.

这套调度数学上和 FlashAttention 的在线 softmax 完全等价, 省了什么也看得出来: 当一个 warpgroup 在 CUDA Core 上做 softmax 和缩放时, 另一个 warpgroup 的 Tensor Core 正在做下一块的 GEMM, 两种单元交错占用, Tensor Core 不空转. 跨 warpgroup 的同步量是两个: 共享的运行最大值 $m$, 和交叉传递的缩放因子 $scale_0, scale_1$. 社区的 [源码走读](https://blog.gitcode.com/250939d29a456621b1025f60e4be53fb.html) 把它定位到历史文件 `splitkv_mla.cuh` 的 `flash_fwd_splitkv_mla_kernel`, 两个分支 `wg0_subroutine` / `wg1_subroutine` 分别对应两个 warpgroup, 共享内存里的 `sScale0`/`sScale1` 存缩放因子、`sM` 存运行最大值, 用 `NamedBarrier` (如 `sScale0Ready`、`sP0Ready`) 和 `cute::warpgroup_wait` 精确编排依赖. 这些细节是社区转述, 核心的 12 步算法以官方 deep-dive 为准.

交叉补账的那三步 (9 到 11) 是整套调度最容易看错的地方, 值得单独讲明白它为什么必须存在. $\vec o_L$ 本该收 $\vec p_0 V_{0L}$ 和 $\vec p_1 V_{1L}$, $\vec o_R$ 本该收 $\vec p_0 V_{0R}$ 和 $\vec p_1 V_{1R}$. 按 warpgroup 的分工, warpgroup 0 先把本块的 $\vec p_0 V_{0L}$ 加进 $\vec o_L$、warpgroup 1 先把 $\vec p_1 V_{1R}$ 加进 $\vec o_R$, 这是两个 warpgroup 各自手里的数据, 不用等对方. 但 $\vec p_0 V_{0R}$ 和 $\vec p_1 V_{1L}$ 是交叉项: $\vec o_R$ 要用到 warpgroup 0 算出的 $\vec p_0$, $\vec o_L$ 要用到 warpgroup 1 算出的 $\vec p_1$. 这两项只能等对方的 softmax 结果就绪后再补, 补的时候还要带上这期间 $m$ 更新引入的 $scale_1$ 修正. 这就是步骤 9 到 11 的来历, 也是 seesaw 比直白的双缓冲多出来的那点数学代价 — 换来的是只用一份输出矩阵的寄存器就能跑两路流水.

seesaw 调度仍要处理访存延迟, 数据没有就绪时 Tensor Core 只能等待. 实现采用两项优化. 第一项是细粒度 TMA 拷贝与 GEMM 流水: 一个 $64\times576$ 的 K 块拆成 9 次 TMA 拷贝, 每次搬运 $64\times64$; 第一块到达后立即启动 GEMM, 后续搬运与计算并行. 第二项是缓存提示: TMA 拷贝使用 `cute::TMA::CacheHintSm90::EVICT_FIRST`, 实验显示可以提高 L2 命中率. 两项优化配合 seesaw, 在 H800 SXM5 上达到最高 80% 的 Tensor Core 利用率(相对降频后的理论峰值)和 3 TB/s 带宽. 访存受限场景比旧的 ping-pong 缓冲版慢约 2%, 官方认为线上解码主要受计算限制, 因而接受这项取舍.

## 4. FP8 / FP4 KV 量化与反量化瓶颈

V3.2 把上下文从 64K 翻到 128K, 显存压力立刻顶上来: 单个 128K token 的请求, MLA KVCache 约 $576\times2\times62\times128\times1024 = 8.72$ GiB (出自 [20250929 Hopper FP8 deep-dive](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20250929-hopper-fp8-sparse-deep-dive.md)). 这会直接 OOM, 或者逼小 batch 导致 GPU 吃不满. FP8 KV 缓存是应对这个的直接手段, 但它带来一个新瓶颈: 反量化要占 CUDA Core, 把本来计算受限的 kernel 变成反量化受限. 这一节讲量化格式怎么演进、反量化瓶颈怎么绕过去.

KV 量化同时影响存储格式和计算路径. 显存中的量化格式决定每个 token 占多少字节; kernel 内的反量化则决定要消耗多少 CUDA Core 周期, 以及 Tensor Core 能否持续获得输入. FlashMLA 的三代格式变化与 Hopper 上的 crossover 优化都围绕这两个约束展开.

### 4.1. 量化格式: 从 656 到 528 / 288 字节

Hopper FP8 版 (2025-09) 的格式是每 token 656 字节. 做法是细粒度量化: 对每 token KV 的前 512 维 (NoPE 部分) 做 tile 级量化, tile 大小 $1\times128$, 得到 512 个 `float8_e4m3` 值和 4 个 `float32` scale (每 128 个值共用一个). 剩下 64 维 (RoPE 部分) 对精度敏感, 不量化, 保留 bfloat16. 合计 $512 + 4\times4 + 64\times2 = 512 + 16 + 128 = 656$ 字节. 反量化在 kernel 内做: 512 个 `float8_e4m3` 先转成 512 个 bfloat16, 再和 RoPE 的 64 个原始 bfloat16 拼接, 最后用 bfloat16 精度的 MMA 做 MQA (QK gemm 与 score-V gemm 的输入都是 bfloat16, 输出 float32).

V4.1 版 (2026-09) 改了格式, 也是 2026-09-30 那次不兼容变更的一部分. 当前 README 和 `quant.py` 给了两种: V4.1 每 token 528 字节, V4.1 fp4 每 token 288 字节. 528 字节版把全部 512 维 (含 RoPE 的 64 维) 都量化成 `float8_e4m3`, scale 改用 16 个 `float8_e8m0` (每 32 个连续值一个), 合计 $512 + 16 = 528$, 不再有 bfloat16 部分. 288 字节版更激进: 512 个值用 `e2m1` (fp4) 编码, 每字节装 2 个 (偶数下标在低半字节), 占 256 字节; scale 用 32 个 `float8_e4m3` (每 16 个连续值一个), 合计 $256 + 32 = 288$. fp4 格式只在主 cache 是 V4.1 fp8 格式时用于 `extra_k_cache`. 这些口径和量化步骤见 [tests/quant.py](https://github.com/deepseek-ai/FlashMLA/blob/main/tests/quant.py) 的 `quantize_k_cache`, 里面 NoPE 的 scale 按 amax/448 取、fp4 的 scale 按 amax/6 取 (6 是 e2m1 的最大幅值), 并处理了 NaN tile 的边界.

格式从 656 到 528 的变化不只是省了 128 字节的 RoPE. `quant.py` 的 `KVCacheLayout` 把 V4.1 fp8 描述成「14 个 NoPE tile 加 2 个 RoPE tile」, tile 大小 32、共 16 个 tile; fp4 则是「28 个 NoPE tile 加 4 个 RoPE tile」, tile 大小 16、共 32 个. 把 scale 从 `float32` 换成 `float8_e8m0` (一个字节表示 2 的幂次) 是关键: 它把 scale 的开销从每 128 值 4 字节压到每 32 值 1 字节, 又因为 e8m0 只存指数, 配合 CUDA 13.2 的原生 `cvt.rn.bf16x2` 能更快地还原. 这也是 README 为什么推荐 CUDA 13.2 以上: 13.1 上这个转换要退回经 FP32 的较慢加宽路径.

fp4 版把精度推到了更极端的一端. e2m1 只有 2 位指数、1 位尾数, 能表示的幅值只有 $\{0, 0.5, 1, 1.5, 2, 3, 4, 6\}$ 这 8 个 (含符号位共 16 个码), `quant.py` 的 `_E2M1_MAGNITUDES` 把它们列了出来, scale 取 amax 除以 6 (6 是 e2m1 的最大幅值). 这么粗的量化只敢用在 `extra_k_cache` 上, 即主 KV 用 fp8、额外一段 KV 用 fp4, 而不是整个 cache 都 fp4. 代码里还处理了一个边界: 某个 tile 里只要有一个 NaN, 整个 tile 的 scale 就被标成 NaN (fp4 本身没有 NaN 编码, NaN 只能藏在 scale 里), 反量化时这个 tile 整体失效. 从 656 到 528 再到 288, 每一步都是拿精度换字节, 换来的是同样显存能放下更大 batch 或更长上下文.

### 4.2. 反量化受限与 Hopper 的 crossover

反量化为什么会成为瓶颈, Hopper FP8 deep-dive 算了一笔周期账. 每个 SM 每周期能做 4096 次 MMA Flops (H800 上按 $989\ \text{TFlops} / 1830\ \text{MHz} / 132\ \text{SMs}$ 算). 若每个 CTA 处理 64 个 query head, 每个 K/V token 的 MMA 只要约 $64\times(576+512)\times2 / 4096 \approx 34$ 周期. 但 H800 不能直接把 `float8_e4m3` 转 bfloat16, 要走四步: e4m3 转 half、half 转 float32、float32 转 bfloat16、再乘 float32 scale. 按 NVIDIA 文档的吞吐, 每 token 反量化至少 $(\frac{1}{64}+\frac{1}{64}+\frac{1}{16}+\frac{1}{256})\times512 \approx 50$ 周期. 50 比 34 大, 意味着 Tensor Core 要停下来等 CUDA Core 反量化, kernel 落到反量化受限.

crossover 利用了 MQA 的一个事实: 同一个 query token 内的每个 query head 都看同一批 key. V3.2 有 128 个 query head, 而每个 CTA 只处理 64 个. 如果两个处理不同 query head 子集的 CTA 能共享反量化后的 K/V, 每个 CTA 就只需反量化一半. 实现靠 Hopper 的分布式共享内存 (DSM): 以 cluster 大小 2 启动 CTA, 每个 CTA 加载一半量化 K/V、在 CUDA Core 上反量化自己那一半、存进自己的共享内存, 同时用 `st.async` 把结果写进另一个 CTA 的共享内存, 用 cluster transaction barrier 同步. 交换完成后两个 CTA 的共享内存里都有完整的反量化 K 与 V. 这个名字来自减数分裂里的染色体交叉.

效果是把反量化的 50 周期砍半, Tensor Core 不再空等. H800 SXM5 的计算受限配置 (`batch_size=128, num_heads=128, s_q=2, topk=2048`) 下拿到 410 TFLOPS, 相比没有 crossover 的上一版 250 TFLOPS 是明显提升. 这个 410 仍低于 bfloat16 稠密解码的 640 TFLOPS 峰值, 一个原因是它是稀疏 kernel 且 topk 只有 2048, topk 越小前导收尾的相对开销越大; 把 topk 设到 32768, 该 kernel 最高能到 460 TFLOPS. 换个口径看: 上述配置下它的执行时间与序列长约 3000 时的稠密解码相当, 超过 3000, 稀疏的优势越来越明显. crossover 依赖 Hopper 的 DSM 和 CTA cluster. 2026-09-30 后主分支移除了 Hopper 支持; 转到 SM100 后, 反量化改走 Blackwell 原生的 fp8 转换路径, 原先的 crossover 调度也就不再适用.

## 5. 稀疏化: DSA 的 top-k 怎么配进 kernel

FlashMLA 的稀疏 kernel 支撑 DeepSeek Sparse Attention (DSA). 要讲清它和 DSA 怎么配合, 得先分清职责: 挑哪些 token (打分、取 top-k) 不在 FlashMLA 里, FlashMLA 只吃已经挑好的 `indices`. 这条边界决定了 kernel 的接口形状, 也决定了它能把复杂度从平方降到近线性的原因.

模型侧的 lightning indexer 负责算分并取 top-k, 产出一张下标表; FlashMLA 根据这张表, 只在指定位置上计算完整注意力. token 选择不进入注意力 kernel, 所以接口只接收 `indices`, 没有 indexer 参数. `indices` 的共享约束以及 prefill、decode、fused 三条路径, 共同决定不同 query 如何访问各自选中的 token.

### 5.1. indices 契约与 MQA 共享

DSA 的机制在 llm-guide 和 V3.2 解析里有完整推导, 见 deepseek-v3-2-analysis, 这里只讲和 kernel 对接的部分. DSA 分两步: lightning indexer 给每个 query token 和它之前的每个 token 算一个索引分 $I_{t,s}=\sum_{j=1}^{H^I} w^I_{t,j}\cdot\mathrm{ReLU}(\mathbf q^I_{t,j}\cdot\mathbf k^I_s)$, 这是个多头查询、单头键的小注意力, 头少 (V3.2 里 $H^I=64$)、可用 FP8、不做 softmax 也不取 value; 第二步按索引分取 top-k ($k=2048$) 个位置, 只在这些位置上做完整 MLA 注意力. 主注意力复杂度从 $O(L^2)$ 降到 $O(L\cdot k)$, 其中 $k=2048 \ll L=128\text{K}$.

indexer 这步 (打分加取 top-k) 在 V3.2 的模型代码里 (如 `fp8_index_kernel`), 不在 FlashMLA 里. FlashMLA 收到的是 indexer 输出的 top-k 下标, 装进 `indices` 张量. 解码路径的 `indices` 形状是 $(\text{batch\_size}, \text{seq\_len\_q}, \text{topk})$, prefill 路径是 $[s_q, h_{kv}, \text{topk}]$. 注意 prefill 的 $h_{kv}$ 维: DSA 基于 MLA 的 MQA 模式实例化, 每个 latent (KV 条目) 被该 query token 的所有 query head 共享, 所以 $h_{kv}$ 必须是 1, kernel 里会 squeeze 掉这一维. 这正好对上第 1 节的结论: 吸收后所有 head 共享一份 latent, 稀疏选择也就只需为每个 query token 选一套 KV, 不必为每个 head 各选一套. 这是 DSA 能做 kernel 级加速的前提, V3.2 论文里把它写成每个 KV 条目必须被多个 query 复用.

训练侧有一个容易忽略的细节, 和 kernel 的职责边界呼应: indexer 的输入从主模型的计算图里 detach 出来单独优化, 它的训练信号只来自 indexer 自己的损失, 主模型按语言建模损失优化 (据 V3.2 技术报告, 稀疏训练阶段学习率 7.3e-6, 每 query 选 2048 个 KV token, 主模型与 indexer 训 15000 步, 每步 480 条 128K 序列, 合计 943.7B token). 把挑选逻辑从主注意力里拆出来、又在计算图上断开, 正好让 FlashMLA 这种只吃下标的算子能独立优化: kernel 不关心下标怎么来的, 只保证在给定下标上把注意力算快算对.

### 5.2. prefill / decode / fused 三条路径与可选项

prefill 路径 `flash_mla_sparse_fwd` 最直白, README 给了等价 PyTorch: 按 `indices` 从 kv 里 gather 出 `focused_kv` ($[s_q, \text{topk}, d_{qk}]$), 算 $P = Q\,\text{focused\_kv}^\top \cdot sm\_scale$, 对无效位填 $-\infty$, softmax 后 $S\,\text{focused\_kv}$ 得输出. 它不支持 batch 维, 多 batch 要 reshape 输入并调整 `indices` 来模拟. 一个边界被单列出来: 完全没有有效下标的 query token, kernel 返回 $max\_logits = -\infty$、$lse = +\infty$ 和全零输出, 而朴素伪代码会产出 NaN. decode 路径 `flash_mla_with_kvcache` 吃分页的量化 KV cache, 要求 $head\_dim$ 为 512、$num\_heads\_q$ 为 64 或 128、KV cache 连续可访问 (不能是分散的内存块), 其余契约见第 2 节.

两条路径都有两个可选项值得点出. `attn_sink` ($[h_q]$, float32) 给定后, 输出再乘 $\exp(lse) / (\exp(lse) + \exp(attn\_sink))$, 相当于给 softmax 分母加一个固定的 sink 项, 对 lse 和 `max_logits` 没影响; $+\infty$ 会让对应输出变零, $-\infty$ 无效果. `topk_length` ($[s_q]$, int32) 给定后, 第 $i$ 个 query token 只看前 $\text{topk\_length}[i]$ 个下标, 用来处理不同 query 的实际 topk 不等的情况, 比起用 mask 填充能省掉后面的计算. 这两个可选项把不同 query 看不同数量的 token 这件事做进了 kernel, 省掉上层的对齐开销.

fused kernel (2026-09, V4.1) 是第三条路径, 把 Q-norm (只在 V4 用, V4.1 不用)、Q-RoPE、核心注意力、O-RoPE (共轭) 与 cast-to-FP8 融进一个 kernel, 去掉这些小 kernel 的启动与往返开销, 代价是要事先置换 `Q_b` 和 `Wv` 权重 (README 给了 `permute_q_b_proj` / `permute_wv_proj` 的用法). 它的输出直接是 FP8, 由下游的 Wv 投影用 DeepGEMM 的 `fp8_einsum` 消费, 省掉一次 cast. 官方建议优先用这条路径: B200 加 CUDA 13.3 上 prefill 最高 1460 TFlops、decoding 最高 950 TFlops, 其中 prefill 的数字甚至高于纯稀疏 prefill 的 1350. 它目前只支持 CUDA, 不支持昇腾. 此外仓库还保留一条稠密 MHA prefill 与反向路径 (`flash_attn_varlen_func` 一族), 用于 V4 系列里仍需稠密注意力的部分, 反向目前不支持 GQA, 只实例化了 (192, 128) 和 (128, 128) 两对 head dim.

## 6. 版本演进、性能数字口径与局限

FlashMLA 从 2025-02 首发到 2026-09 换了几轮形态, 性能数字也跟着跳. 把这些数字放一起看, 要先对齐口径: 哪张硬件、什么形状、对谁作基线、出自哪个版本. 不对齐口径, 660、640、410、1024、1460 这些 TFlops 会互相打架. 这一节按时间线把演进和数字理一遍, 再讲清适用边界.

性能数字必须同时标明硬件、形状、基线和版本. 「稀疏解码」在 Hopper 上为 410、在 B200 上为 1024, 差异首先来自硬件代际; 同一张 B200 上, 稀疏 prefill 为 1350、fused prefill 为 1460, 后者还计入了额外融合算子. 缺少这些条件时, 数字之间没有可比性.

### 6.1. 从 2025-02 到 2026-09 的演进与性能表

演进的主线是三轮. 第一轮 (2025-02 到 2025-04) 是 bfloat16 稠密 MLA 解码: 首发版块大小 64 的分页 BF16 KV, 访存受限约 3000 GB/s、计算受限约 580 TFlops; 2025-04 的 seesaw 更新把计算受限推到 660 TFlops, 接口向后兼容. 第二轮 (2025-09) 随 V3.2 加稀疏: token 级稀疏 prefill 与配 FP8 KV 的稀疏解码, Hopper 上 prefill 640、decode 410 TFlops, crossover 是关键. 第三轮 (2026-09) 随 V4.1 换到 Blackwell: 新的 528/288 字节 KV 格式、fused norm-RoPE-attn-RoPE-cast kernel, 并在 2026-09-30 移除 Hopper 与 V3/V3.2/V4.0 支持、加上华为昇腾 kernel.

下面这张表把 README 里散落的数字按口径归拢. 同一行才可比, 跨行不可直接比大小.

| 数字 | 版本 / 日期 | 硬件 | 形状 / 配置 | 对比基线 | 出处 |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 3000 GB/s · 580 TFlops | 首发, 2025-02 | H800 SXM5, CUDA 12.6 | BF16 稠密解码, 访存受限 / 计算受限 | — | 首发 README |
| 660 TFlops | seesaw, 2025-04 | H800 SXM5 | BF16 稠密解码, 计算受限 | 旧版 580 | 20250422 deep-dive |
| 410 TFlops | 稀疏, 2025-09 | H800 SXM5 | FP8 稀疏解码, batch=128, heads=128, $s_q=2$, topk=2048 | 无 crossover 版 250 | 20250929 deep-dive |
| 640 TFlops | 稀疏, 2025-09 | H800 SXM5 | 稀疏 prefill | — | 2025-09 README |
| 1024 TFlops | V4.1, 2026-09 | B200, CUDA 13.3 | 稀疏解码单测 | — | 当前 README |
| 1350 · 1460 TFlops | V4.1, 2026-09 | B200, CUDA 13.3 | 稀疏 prefill / fused prefill | — | 当前 README |
| 410 · 360 TFlops | 昇腾, 2026-09 | Ascend 950 NPU | 稀疏 prefill / decode (硬件峰值 95% / 83%) | — | 2026-09 README |

读这张表要抓两个口径陷阱. 一是「访存受限」和「计算受限」是两种配置下的两个数, 3000 GB/s 是带宽、580/660 是算力, 不能换算. 二是稀疏解码的 410 (Hopper) 和 1024 (B200) 不同代硬件不同版本, B200 的峰值本就高得多, 1024 不是「crossover 又快了一倍」的意思. fused kernel 的 950 (decode) 低于稀疏解码单测的 1024, 是因为 fused 把 norm、RoPE、cast 一起算进端到端, 分母里多了这些融合项, 这个在第 2 节对照译稿的疑惑块里也点过.

### 6.2. 局限与适用条件

适用条件很硬. 当前 main 分支只跑 NVIDIA SM100 / SM103 (Blackwell) 或华为昇腾 950, CUDA 要 13.1 以上 (推荐 13.2 以上, 否则 fp8 转 bf16 退回慢路径). 解码只支持 FP8 / FP4 KV、只支持稀疏 (`is_fp8_kvcache` 必须 True、`causal` 必须 False、必须传 `indices`), 不再支持未量化的 bfloat16 KV, 也不再支持稠密因果解码. 形状被钉在 MLA 的 MQA 模式: `head_dim` 512、`head_dim_v` 512、`num_heads_q` 为 64 或 128、`num_heads_k` 为 1. 稠密 MHA prefill 只实例化了 (`head_dim_qk`, `head_dim_vo`) 为 (192, 128) 和 (128, 128) 两对, 反向还不支持 GQA. 要跑 Hopper 或前代模型, 只能回退到 2026-09-15 的那个提交.

还有几条使用上的坑. 复用 `tile_scheduler_metadata` 时, `topk_length` / `extra_topk_length` 的值不被校验, 换了值而复用会静默用过时的 split-KV 调度, 结果错而不报错. 解码路径对 `indices` 不做上界检查, 只认 $-1$ 为无效, 其他越界正值直接非法访存, 这把边界检查的责任完全推给了调用方. fused kernel 要求事先置换 $W_{Q_b}$ 和 $W_V$ 权重, 接入成本不低, 且只支持 CUDA. 服务重启后这些都是无状态的纯算子, 没有续跑问题, 但上游的 KV cache 和 indices 需要调用方自己维护一致性.

把这些放到更大的图景里看: FlashMLA 是 DeepSeek 推理栈里专门啃「注意力核那一截」的件, 它的每一次形态变化都对着一个具体的模型需求 — 580 到 660 对着 V3 解码要吃满算力, FP8 稀疏对着 V3.2 的 128K 长上下文要压显存, fused kernel 对着 V4.1 要省小算子开销. MLA 的压缩思路见 deepseek-v2-analysis, DSA 的稀疏思路见 deepseek-v3-2-analysis. FlashMLA 的角色始终是把这些模型侧的设计翻译成能喂满硬件的 kernel, 它的局限也正来自这种专一: 形状、精度、硬件卡得越死, 单点性能越高, 通用性越弱.

### 参考文献

- [FlashMLA 仓库](https://github.com/deepseek-ai/FlashMLA) (deepseek-ai/FlashMLA, MIT, 2025-02 首发)
- [A Deep-Dive Into the New Flash MLA Kernel](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20250422-new-kernel-deep-dive.md) (seesaw 调度, 2025-04-22)
- [A Deep Dive Into The Flash MLA FP8 Decoding Kernel on Hopper](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20250929-hopper-fp8-sparse-deep-dive.md) (FP8 KV 与 crossover, 2025-09-29)
- [A Deep Dive Into the Ascend Sparse Attention Forward Kernel](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20260930-ascend-prefill-deep-dive.md) (昇腾实现, 2026-09-30)
- 杨文博, [理解 FlashMLA 在 DeepSeek MLA 计算过程中的位置和作用](https://yangwenbo.com/articles/understand-flashmla-in-deepseek-mla-formulas.html)
- AtomGit / GitCode, [FlashMLA 新内核深度解析: Seesaw 调度、细粒度 TMA 流水线与 H800 上的 660 TFlops MLA 解码](https://blog.gitcode.com/250939d29a456621b1025f60e4be53fb.html)


### 6.5. 从低秩表示推到矩阵吸收

FlashMLA 的 kernel 形状由 MLA 的代数重排直接决定。下面先从低秩 KV 和解耦 RoPE 推导缓存内容，再证明吸收只改变乘法顺序，不改变注意力输出。



MLA (Multi-head Latent Attention) 是 [DeepSeek-V2](https://arxiv.org/abs/2405.04434) 提出的注意力结构, DeepSeek-V3 沿用. 它要解决的问题和 02 MQA 与 GQA 相同: Decode 每步都要从显存读整份 KV Cache. MQA 和 GQA 减少的是缓存的份数, 每份仍是完整的 $d_h$ 维; MLA 保留每个头各自的 Key 和 Value, 但它们都由同一个低维潜变量线性生成, 缓存只存这个潜变量.

低秩压缩和 RoPE 之间有冲突: 如果 Key 的内容部分带位置旋转, 推理时上投影矩阵就无法合并进 Query 一侧, 只能为全部历史 token 重新算 Key. MLA 的解法是把位置信息放到一段单独的维度里. 本篇讲压缩和解耦 RoPE 两部分, 以及它们带来的缓存量; 上投影矩阵怎样被吸收, 吸收和不吸收两种算法的计算量对比, 以及推理框架里的实现, 见 04 MLA 矩阵吸收与工程实现.

---

### 1. 问题与记号

#### 1.1 在 GQA 之后还差什么

02 篇第 4.3 节引用的 DeepSeek-V2 附录 D.1 (Table 8) 给出了从头训练的对比. 7B 稠密模型, 1.33T token, 通过调层数把参数量对齐到约 7B:

| 基准 | MQA | GQA (8 组) | MHA |
|---|---|---|---|
| BBH (3-shot) | 33.2 | 35.6 | 37.0 |
| MMLU (5-shot) | 37.9 | 41.2 | 45.2 |
| C-Eval (5-shot) | 30.0 | 37.7 | 42.9 |
| CMMLU (5-shot) | 34.6 | 38.4 | 43.5 |

GQA-8 在 MMLU 上比 MHA 低 4 个点, C-Eval 低 5.2 个点. 这组结果说明, 在从头训练的 decoder-only 模型上, 减少 K/V 份数的代价不小. DeepSeek-V2 想要的是缓存比 GQA 更小, 质量不低于 MHA.

减少份数的方案里, 每份 K/V 都是一个完整的 $d_h$ 维向量, 份数少了, 不同头能用的 Key 子空间就少了 (02 篇第 1.5 节). 另一种思路是保留 $n_h$ 份, 但让它们由一个更低维的向量生成. MHA 每个 token 的 $2n_hd_h$ 个 Key/Value 元素都由同一个 $d$ 维的 $h_t$ 线性算出, 本来就有冗余: DeepSeek-V2 中 $2n_hd_h=32768$, 而 $d=5120$. 如果再引入一个 $d_c\ll d$ 的瓶颈, 让 Key 和 Value 都从瓶颈后的向量算出, 只缓存这个向量, 每 token 的缓存就从 $2n_hd_h$ 降到 $d_c$.

---

#### 1.2 记号

本篇沿用 01, 02 篇的行向量写法 $xW$. DeepSeek-V2 论文用列向量 $Wx$, 两者的矩阵互为转置, 维度对应关系不变. 头数用论文的 $n_h$ (01, 02 篇里的 $H$), $h_t\in\mathbb{R}^d$ 是第 $t$ 个 token 进入注意力层的隐藏状态, $l$ 是层数.

| 符号 | 含义 | DeepSeek-V2 取值 |
|---|---|---|
| $d$ | 隐藏维 | 5120 |
| $n_h$ | 头数 | 128 |
| $d_h$ | 每头内容维 | 128 |
| $d_c$ | KV 压缩维 | 512 |
| $d_c'$ | Query 压缩维 | 1536 |
| $d_h^R$ | 解耦 RoPE 的每头维度 | 64 |
| $l$ | 层数 | 60 |

需要注意 $d_h$ 指的是内容部分的维度, 不含 RoPE 部分. 每个头参与打分的 Query 和 Key 是 $d_h+d_h^R=192$ 维, Value 是 $d_h=128$ 维.

MHA 的基线 (论文式 (1)–(8)) 写成行向量形式是

$$
q_t=h_tW^Q,\quad k_t=h_tW^K,\quad v_t=h_tW^V,\qquad W^Q,W^K,W^V\in\mathbb{R}^{d\times n_hd_h} \tag{1}
$$

每个头取其中第 $i$ 段 $d_h$ 维, 每 token 每层要缓存 $k_t, v_t$ 共 $2n_hd_h$ 个元素.

---

### 2. 低秩压缩

#### 2.1 Key 和 Value 的联合低秩压缩

$$
c_t^{KV}=h_tW^{DKV},\qquad W^{DKV}\in\mathbb{R}^{d\times d_c} \tag{2}
$$

$$
k_t^C=c_t^{KV}W^{UK},\qquad v_t^C=c_t^{KV}W^{UV},\qquad W^{UK},W^{UV}\in\mathbb{R}^{d_c\times n_hd_h} \tag{3}
$$

$c_t^{KV}$ 是压缩后的潜变量, 上标 $D$ 表示下投影 (down), $U$ 表示上投影 (up), $C$ 表示内容 (content). 第 $i$ 个头的 Key 和 Value 是

$$
k_{t,i}^C=c_t^{KV}W_i^{UK},\qquad v_{t,i}^C=c_t^{KV}W_i^{UV},\qquad W_i^{UK},W_i^{UV}\in\mathbb{R}^{d_c\times d_h} \tag{4}
$$

$W_i^{UK}$ 是 $W^{UK}$ 的第 $i$ 段列. 「联合」指 Key 和 Value 共用同一个 $c_t^{KV}$. 如果分开压缩, Key 压到 $d_k'$ 维, Value 压到 $d_v'$ 维, 缓存就是 $d_k'+d_v'$; 联合压缩时一个 $d_c$ 维向量同时服务两边. DeepSeek-V2 里 512 维的 $c_t^{KV}$ 要生成 16384 维的 Key 和 16384 维的 Value. MHA 里 Key 和 Value 本来也都是同一个 $h_t$ 的线性函数, 联合压缩只是在 $h_t$ 和它们之间多加了一个共同的瓶颈.

推理时只要有 $c_j^{KV}$, 任何头的 $k_{j,i}^C$ 和 $v_{j,i}^C$ 都能用式 (4) 算出来, 所以缓存只存 $c_j^{KV}$, 每 token 每层 $d_c$ 个元素. 写缓存的开销也小: 每个新 token 只做一次 $5120\times512$ 的下投影, MHA 要做 $5120\times32768$ 的 K/V 投影才能写入. 论文还指出, 推理时 $W^{UK}$ 可以吸收进 Query 一侧, $W^{UV}$ 可以吸收进输出投影, 连 $k^C$ 和 $v^C$ 都不必显式算出. 这一点是 04 篇的主题, 这里只需要知道: 吸收能成立的前提是 $q$ 和 $k^C$ 之间只隔着与位置无关的固定矩阵.

#### 2.2 秩的约束

式 (4) 意味着同一个 token 在所有头上的 Key 都是 $c_t^{KV}$ 的线性像. 把 $n_h$ 个头的 Key 拼起来, 得到的 $n_hd_h$ 维向量落在 $W^{UK}$ 的行空间里, 维度最多 $d_c$. 对比几种结构里「一个 token 所有头的 Key 拼起来」能张成的最大维度:

| 结构 | 所有头 Key 的最大维度 | 每 token 每层缓存 (元素) |
|---|---|---|
| MHA | $\min(d, n_hd_h)=5120$ | $2n_hd_h=32768$ |
| GQA, $G$ 组 | $Gd_h$ | $2Gd_h$ |
| MLA | $d_c=512$ | $d_c+d_h^R=576$ |

按这张表, MLA 的 Key 空间与 $G=4$ 的 GQA 同为 512 维, 但两者结构不同. GQA-4 里 32 个头读完全相同的 Key; MLA 里 128 个头各用自己的 $W_i^{UK}$ 从同一个 512 维空间里取出不同的 128 维投影, 每个头的 Key 都不同. 缓存上 GQA-4 每 token 每层要 $2\times4\times128=1024$ 个元素, MLA 是 576 个. 这张表只比较线性维度, 不能直接推出质量高低, 质量要看第 4.5–4.7 节的实验.

---

#### 2.3 Query 的低秩压缩

$$
c_t^Q=h_tW^{DQ},\qquad q_t^C=c_t^QW^{UQ},\qquad W^{DQ}\in\mathbb{R}^{d\times d_c'},\ W^{UQ}\in\mathbb{R}^{d_c'\times n_hd_h} \tag{5}
$$

Query 不进缓存, 压缩它不会减少 KV Cache. 论文给出的理由是减少训练时的激活显存: $c_t^Q$ 只有 1536 维, 反向传播需要保存的中间量比 $n_hd_h=16384$ 维的 $q_t$ 小得多. DeepSeek-V2-Lite (27 层, 16 头, $d_c=512$, $d_h^R=64$) 没有压缩 Query, 说明这一步对 MLA 不是必需的.

参数量也随之变化. 按 DeepSeek-V2 的配置, 一层注意力的投影矩阵:

| 矩阵 | 形状 | 参数量 |
|---|---|---|
| $W^{DKV}$ | $5120\times512$ | 2.62M |
| $W^{UK}$ | $512\times16384$ | 8.39M |
| $W^{UV}$ | $512\times16384$ | 8.39M |
| $W^{DQ}$ | $5120\times1536$ | 7.86M |
| $W^{UQ}$ | $1536\times16384$ | 25.17M |
| $W^{QR}$ | $1536\times8192$ | 12.58M |
| $W^{KR}$ | $5120\times64$ | 0.33M |
| $W^{O}$ | $16384\times5120$ | 83.89M |
| 合计 | | 149.2M |

同样 128 头, 每头 128 维的 MHA, 四个投影矩阵合计 $4\times5120\times16384=335.5$M. 表中的数是按形状乘出来的, 论文只给了全模型的 236B 总参数和 21B 激活参数. 注意力参数里输出投影 $W^O$ 占一半以上, 它的大小只取决于 $n_hd_h$ 和 $d$, MLA 没有改动它. 去掉 $W^O$ 后, MLA 其余投影约 65.3M, MHA 的三个 Q/K/V 投影约 251.7M, MLA 只有它的四分之一左右.

---

### 3. RoPE 冲突与解耦 RoPE

#### 3.1 RoPE 为什么和低秩压缩冲突

DeepSeek-V2 沿用了 DeepSeek 67B 的 RoPE, 所以必须让低秩压缩和 RoPE 共存. RoPE 在第 $t$ 个位置把 Query 或 Key 乘上一个正交旋转矩阵 $R_t$, 满足 $R_tR_j^\top=R_{t-j}$, 打分只依赖相对位置 $t-j$ (见 2.1.4 位置编码). 假设直接对内容 Query 和内容 Key 施加 RoPE:

$$
q_{t,i}=c_t^QW_i^{UQ}R_t,\qquad k_{j,i}=c_j^{KV}W_i^{UK}R_j \tag{6}
$$

第 $i$ 个头对第 $j$ 个位置的打分是

$$
q_{t,i}k_{j,i}^\top=c_t^Q\,W_i^{UQ}\,R_tR_j^\top\,(W_i^{UK})^\top\,(c_j^{KV})^\top=c_t^Q\,\underbrace{W_i^{UQ}R_{t-j}(W_i^{UK})^\top}_{\text{随 }t-j\text{ 变化}}\,(c_j^{KV})^\top \tag{7}
$$

没有 RoPE 时, 中间那段是固定的 $W_i^{UQ}(W_i^{UK})^\top$, 可以预先乘好, 推理时 Query 乘上它就能直接和缓存里的 $c_j^{KV}$ 做点积. 有了 RoPE, 中间夹着 $R_{t-j}$. 矩阵乘法不满足交换律, $R_{t-j}$ 不能移到两边, 而 $t-j$ 对每个历史位置都不同, 无法用一个固定矩阵代替.

#### 3.2 冲突的后果

剩下的办法只有一个: 每步对每个历史位置 $j$ 用式 (6) 重新算出 $k_{j,i}$, 也就是把全部前缀的 Key 重新上投影一遍再旋转. 论文的原话是这样会「significantly hinder the inference efficiency」. 缓存仍然只存 $c^{KV}$, 但每步的计算量随序列长度线性增长, 而且要显式生成 $n_h$ 个头的 Key, Decode 的访存优势也没了.

另一个办法是缓存旋转后的 $k_{j,i}$, 那就退回了 MHA 的缓存量.

第三个办法是为每个相对距离预先算一个矩阵 $W_i^{UQ}R_{\delta}(W_i^{UK})^\top$. 按 DeepSeek-V2 的形状, 每个头每个距离是 $1536\times512\approx78.6$ 万个元素, 128 个头就是约 1 亿个, 128K 个距离合计约 $1.3\times10^{13}$ 个, 远超模型本身的参数量. 三条路都不可接受.

---

#### 3.3 解耦 RoPE 的公式

解耦的做法是让内容部分完全不带位置信息, 另外开一小段维度专门承载 RoPE (论文式 (14)–(19)):

$$
q_t^R=\mathrm{RoPE}\!\left(c_t^QW^{QR}\right),\qquad W^{QR}\in\mathbb{R}^{d_c'\times n_hd_h^R} \tag{8}
$$

$$
k_t^R=\mathrm{RoPE}\!\left(h_tW^{KR}\right),\qquad W^{KR}\in\mathbb{R}^{d\times d_h^R} \tag{9}
$$

$$
q_{t,i}=\left[q_{t,i}^C;\,q_{t,i}^R\right],\qquad k_{j,i}=\left[k_{j,i}^C;\,k_j^R\right] \tag{10}
$$

$$
o_{t,i}=\sum_{j=1}^{t}\mathrm{softmax}_j\!\left(\frac{q_{t,i}k_{j,i}^\top}{\sqrt{d_h+d_h^R}}\right)v_{j,i}^C,\qquad u_t=\left[o_{t,1};\dots;o_{t,n_h}\right]W^O \tag{11}
$$

几个细节:

- $q^R$ 每个头各有一段 $d_h^R$ 维, 从 Query 潜变量 $c_t^Q$ 算出; $k^R$ 只有一份, 所有头共享, 直接从 $h_t$ 算出, 不经过 $c_t^{KV}$.
- 缩放因子用拼接后的维度 $d_h+d_h^R$, 不是 $d_h$.
- Value 只有内容部分, 不带 RoPE.

#### 3.4 打分拆成两项

把式 (10) 代入点积:

$$
q_{t,i}k_{j,i}^\top=\underbrace{q_{t,i}^C(k_{j,i}^C)^\top}_{\text{内容项}}+\underbrace{q_{t,i}^R(k_j^R)^\top}_{\text{位置项}} \tag{12}
$$

内容项里没有旋转矩阵, 可以按 3.1 节的方式把 $W_i^{UQ}(W_i^{UK})^\top$ 预先合并, 直接与缓存的 $c_j^{KV}$ 做点积. 位置项里 $k_j^R$ 已经旋转过, 推理时直接缓存旋转后的结果; 每个历史 token 只有一份 $d_h^R$ 维, 128 个头共用, 读取方式与 MQA 相同.

位置项本身满足 RoPE 的相对位置性质. 设旋转前的向量为 $\tilde q_{t,i}^R$ 和 $\tilde k_j^R$, 则

$$
q_{t,i}^R(k_j^R)^\top=\tilde q_{t,i}^R\,R_tR_j^\top\,(\tilde k_j^R)^\top=\tilde q_{t,i}^R\,R_{t-j}\,(\tilde k_j^R)^\top \tag{13}
$$

只依赖 $t-j$. 这里不存在吸收问题, 因为 $k_j^R$ 本身就在缓存里, 不需要从潜变量还原.

Decode 每步读缓存时, 两项分别读两块: 内容项读 $t$ 个 512 维的 $c_j^{KV}$, 位置项读 $t$ 个 64 维的 $k_j^R$. 位置部分占缓存的 $64/576\approx11\%$. 两块在实现里通常拼成一个 576 维的向量连续存放, 一次读出, 打分时 Query 一侧也拼成 576 维, 一次点积同时算出两项之和.

#### 3.5 缓存总量

每 token 每层缓存 $c_t^{KV}$ 和 $k_t^R$:

$$
\text{MLA 每 token 缓存}=(d_c+d_h^R)\,l \tag{14}
$$

DeepSeek-V2 取 $d_c=4d_h$, $d_h^R=d_h/2$, 所以 $(d_c+d_h^R)l=\frac{9}{2}d_hl$. GQA 每 token 缓存 $2n_gd_hl$, 令两者相等得 $n_g=2.25$. 这就是论文「等于 2.25 组 GQA」的来源. 代回去验算, $2\times2.25\times128=576$, 正好是每层的缓存元素数.

#### 3.6 $k^R$ 为什么只有一份

如果 $k^R$ 也像 $q^R$ 一样每个头一份, 每 token 每层的缓存就是 $d_c+n_hd_h^R=512+128\times64=8704$ 个元素, 是共享版本 576 的 15 倍, 压缩的大部分效果就没了. 共享一份 $k^R$, 位置项的缓存与头数无关. 各头之间的差异仍然可以通过各自的 $q_{t,i}^R$ 体现: 不同头用不同的 Query 去读同一份位置 Key, 这与 MQA 的做法相同, 只是 MQA 对整个 Key 这样做, MLA 只对位置这 64 维这样做.

承载位置信息的维度也变少了. RoPE 把向量两两配对, 每对用一个频率旋转. 标准做法里 128 维的头有 64 个频率, MLA 的位置部分只有 64 维, 即 32 个频率, 而且所有头共用同一份 $k^R$. 内容部分的 128 维完全不感知位置, 模型对位置的区分全部依靠这 32 个频率和各头的 $q^R$.

---

### 4. 手算与实验

#### 4.1 手算的设置

取一个头, $d=3$, $d_c=2$, $d_h=2$, $d_h^R=2$. 三个 token 的隐藏状态取单位向量 $h_1=[1,0,0]$, $h_2=[0,1,0]$, $h_3=[0,0,1]$.

$$
W^{DKV}=\begin{bmatrix}1&0\\0&1\\1&1\end{bmatrix},\quad W^{UK}=\begin{bmatrix}1&1\\0&1\end{bmatrix},\quad W^{UV}=\begin{bmatrix}1&0\\1&1\end{bmatrix}
$$

由式 (2), $c_1=[1,0]$, $c_2=[0,1]$, $c_3=[1,1]$. 由式 (3):

| $j$ | $c_j^{KV}$ | $k_j^C$ | $v_j^C$ |
|---|---|---|---|
| 1 | [1, 0] | [1, 1] | [1, 0] |
| 2 | [0, 1] | [0, 1] | [1, 1] |
| 3 | [1, 1] | [1, 2] | [2, 1] |

缓存里只有 $c_j^{KV}$ 这一列; $k^C$ 和 $v^C$ 用到时才从它算出.

#### 4.2 位置项

RoPE 部分取二维, 旋转角 $\theta=\pi/2$ 每个位置. 设旋转前 $\tilde k_j^R=[1,0]$ 对所有 $j$ 相同, 当前位置 $t=3$ 的 $\tilde q_3^R=[1,0]$. 旋转 $j\theta$ 后 $k_1^R=[0,1]$, $k_2^R=[-1,0]$, $k_3^R=[0,-1]$, $q_3^R=[0,-1]$. 位置项为 $q_3^R(k_j^R)^\top=\cos((3-j)\theta)$:

| $j$ | $t-j$ | 位置项 |
|---|---|---|
| 1 | 2 | $\cos\pi=-1$ |
| 2 | 1 | $\cos(\pi/2)=0$ |
| 3 | 0 | $\cos 0=1$ |

位置项只由 $t-j$ 决定, 这就是式 (13).

#### 4.3 合并打分

取 $q_3^C=[1,0]$, 内容项为 $q_3^C(k_j^C)^\top=[1,0,1]$. 两项相加得 $[0,0,2]$, 除以 $\sqrt{d_h+d_h^R}=2$ 得 $[0,0,1]$. softmax:

$$
\alpha=\frac{[e^0,e^0,e^1]}{2+e}=[0.212,\ 0.212,\ 0.576]
$$

输出 $o_3=0.212\,[1,0]+0.212\,[1,1]+0.576\,[2,1]=[1.576,\ 0.788]$.

如果去掉位置项, 只用内容项, 打分 $[1,0,1]/2$, 权重为 $[0.384,0.233,0.384]$, 输出 $[1.384, 0.616]$. 位置项在这个例子里把权重推向距离为 0 的位置 3, 压低了距离为 2 的位置 1.

#### 4.4 内容项可以不还原 Key

内容项也可以不算出 $k_j^C$. 由式 (3), $q_3^C(k_j^C)^\top=q_3^C(W^{UK})^\top(c_j^{KV})^\top$. 先算 $q_3^C(W^{UK})^\top=[1,0]\begin{bmatrix}1&0\\1&1\end{bmatrix}=[1,0]$, 再与缓存里的 $c_1, c_2, c_3$ 点积, 得 $[1,0,1]$, 和上面用 $k^C$ 算的结果相同. 这个 $[1,0]$ 是把 Query 映射到潜变量空间的结果, 维度是 $d_c$ 而不是 $d_h$. 这就是吸收的最小形式: Query 一侧多乘一个矩阵, 换来 Key 一侧不必上投影. 04 篇把它推广到多头和 Value 一侧.

位置项不能这样处理, 但也不需要: $k_j^R$ 本来就以旋转后的形式在缓存里.

这个例子里每 token 缓存 $c_j$ 和 $k_j^R$ 共 4 个元素, 与单头 MHA 的 $k, v$ 一样多, 因为头数是 1. MLA 的缓存节省来自头数: $n_h$ 个头的 Key 和 Value 都从同一个 $c_j$ 生成, 缓存不随 $n_h$ 增长.

---

#### 4.5 缓存的元素数和字节数

DeepSeek-V2 每 token 每层缓存 576 个元素. 同为 128 头, 每头 128 维的 MHA 要 32768 个, 是 MLA 的 56.9 倍; 反过来说, MLA 的缓存约为它的 1.76%. 按 60 层, BF16 存储, 一条 128K ($131072$) token 的序列:

| 结构 | 每 token (60 层) | 128K 序列 |
|---|---|---|
| MLA | $60\times576\times2=69{,}120$ B | 9.06 GB (8.44 GiB) |
| 同头数 MHA | $60\times32768\times2=3{,}932{,}160$ B | 515 GB (480 GiB) |

这里比的是「如果 V2 用同样的头数做 MHA」, 实际不存在这样一个模型. 下面是论文里真实对比过的数字.

换成 Decode 每步的读取量更直观. 序列已有 32K ($32768$) 个 token 时, MLA 每层每步要读 $576\times32768\approx1888$ 万个元素, BF16 下约 37.7 MB, 60 层合计约 2.26 GB; 同头数 MHA 每步要读约 129 GB. 按每秒 3 TB 量级的显存带宽, 前者读一遍不到 1 毫秒; 后者超过单张 80 GB 显卡的容量.

DeepSeek-V3 的 MLA 维度与 V2 相同 ($n_h=128$, $d_h=128$, $d_c=512$, $d_c'=1536$, $d_h^R=64$), 隐藏维加大到 7168, 层数为 61. 每 token 缓存 $61\times576=35{,}136$ 个元素, BF16 下一条 128K 序列约 9.21 GB. 隐藏维变大没有影响缓存, 因为缓存量只取决于 $d_c$, $d_h^R$ 和层数.

#### 4.6 相对 DeepSeek 67B 减少 93.3%

论文摘要说 DeepSeek-V2 相对 DeepSeek 67B 的 KV Cache 减少 93.3%, 正文没有给出计算式. 部署时 DeepSeek-V2 的权重转成 FP8, KV Cache 平均量化到 6 bit. 按下面的口径可以得到同样的数:

- DeepSeek 67B: 95 层, GQA 8 个 KV 头, $d_h=128$, 每 token $2\times8\times128\times95=194{,}560$ 个元素, 按 2 字节存是 389,120 B.
- DeepSeek-V2: 每 token $60\times576=34{,}560$ 个元素, 按 6 bit (0.75 字节) 是 25,920 B.
- $25920/389120=6.66\%$, 即减少 93.3%.

如果 V2 也按 2 字节算, 比值是 $69120/389120=17.8\%$, 减少约 82%. 所以 93.3% 里包含了 KV 量化的贡献, 其中 MLA 结构本身的贡献对应元素数之比 $34560/194560=17.8\%$. 同理, 论文报告的生成吞吐 5.76 倍 (单节点 8 卡 H800, 超过 50K token/s) 是 MLA, MoE, FP8 权重和 KV 量化共同作用的结果, 论文没有拆分各自的贡献. 论文对吞吐提升的解释是: 部署后的 DeepSeek-V2 所需 KV Cache 远小于 DeepSeek 67B, 因此能用大得多的 batch. 吞吐测试按 DeepSeek 67B 线上服务的真实输入输出长度分布进行, 同一节点上的 prompt 输入吞吐超过 100K token/s. 训练成本降低 42.5% (每 T token 172.8K 对 300.6K GPU 小时) 主要来自 MoE 激活参数少, 与 MLA 的缓存无关.

#### 4.7 Table 9: MLA 与 MHA 的直接对比

附录 D.2 在 MoE 模型上把注意力换成 MHA 和 MLA, 其余架构相同:

| | 小 MoE, MHA | 小 MoE, MLA | 大 MoE, MHA | 大 MoE, MLA |
|---|---|---|---|---|
| 激活参数 | 2.5B | 2.4B | 25.0B | 21.5B |
| 总参数 | 15.8B | 15.7B | 250.8B | 247.4B |
| 每 token KV 元素 | 110.6K | 15.6K | 860.2K | 34.6K |
| BBH (3-shot) | 37.9 | 39.0 | 46.6 | 50.7 |
| MMLU (5-shot) | 48.7 | 50.0 | 57.5 | 59.0 |
| C-Eval (5-shot) | 51.6 | 50.9 | 57.9 | 59.2 |
| CMMLU (5-shot) | 52.3 | 53.4 | 60.7 | 62.5 |

小模型训练 1.33T token, 大模型训练 420B token. MLA 的缓存是 MHA 的 14% 和 4%. 34.6K 正好是 $60\times576$, 15.6K 是 $27\times576$, 与 V2 和 V2-Lite 的层数对应. 用同样的层数反推 MHA 一侧: 小模型 $110592/27=4096=2\times16\times128$, 与 16 头, 每头 128 维一致; 大模型 $860160/60=14336$, 即 $n_hd_h=7168$, 比 V2 的 MLA 的 $n_hd_h=16384$ 小. 论文没有列出 MHA 基线的头数配置, 这两个数是按表中缓存量和层数推出来的.

读这张表要注意三点. 第一, MLA 一侧的激活参数更少 (大模型 21.5B 对 25.0B), 质量更好不是靠多用参数. 第二, 两个规模乘四个基准共八项, MLA 七项更高, 小模型 C-Eval 上低 0.7 个点. 第三, 每个规模只训练了一组模型, 论文没有报告多次运行的方差, 一两个点的差距要谨慎看待. 与 Table 8 放在一起看, GQA-8 在 7B 稠密模型上比 MHA 低 4 个点 MMLU, 而 MLA 在 MoE 模型上比 MHA 高 1.3 到 1.5 个点; 两张表的模型类型和规模不同, 不能直接相减, 但方向是一致的.

---

### 5. 训练, 实现与边界

#### 5.1 RMSNorm, 缩放与 YaRN

论文说低秩压缩和细粒度专家切分会改变一层输出的尺度, 因此在压缩后的潜变量之后加 RMSNorm, 并在宽度瓶颈处 (压缩后的潜变量, 以及路由专家的中间隐藏状态) 乘以额外的缩放因子, 以保证训练稳定. 归一化放在潜变量上, 推理时缓存的是归一化后的 $c^{KV}$. 缓存之后的计算 (式 (3) 的上投影, 打分, 加权求和) 仍然全是线性的, 吸收不受影响.

DeepSeek-V2 预训练长度 4K, 之后用 YaRN 把上下文扩到 128K. 位置信息只在 $q^R, k^R$ 这一段里, 论文写的是 YaRN 专门作用于解耦的共享 Key $k_t^R$, 因为它负责承载 RoPE; 内容部分不需要任何改动. 参数: 缩放 $s=40$, $\alpha=1$, $\beta=32$, 目标最大长度 160K. 长度缩放因子按 $\sqrt{t}=0.0707\ln s+1$ 计算, 用于调节注意力熵, 系数以最小化困惑度为目标选取. $s=40$ 时 $\sqrt{t}=0.0707\times3.689+1\approx1.261$. 原始 YaRN 论文的系数是 0.1, 同样的 $s$ 下得 1.369. 论文的解释是 MLA 的注意力结构与标准 MHA 不同, 所以调整了这个因子. 扩展阶段额外训练 1000 步, 序列长 32K, batch 576 条序列, 在 128K 的大海捞针测试中表现良好.

把 RoPE 限制在 64 维的一段里, 好处之一就在这里: 长度外推只需处理这一段, 不必关心内容部分的 128 维.

#### 5.2 训练时不需要张量并行

DeepSeek-V2 训练用 16 路流水线并行, 8 路专家并行和 ZeRO-1 数据并行, 没有用张量并行. 论文给的原因是激活参数较少, 加上部分算子重计算节省激活显存. 02 篇第 2.4 节提到 MQA 在张量并行下要复制 K/V; MLA 只有一份 $c^{KV}$ 和一份 $k^R$, 如果按头切分张量并行, 同样要每卡复制这份缓存. 训练时不用张量并行, 这个问题也就不存在.

---

#### 5.3 实现: 不吸收的前向

下面是不做吸收时的单层前向, 对应训练和 Prefill 的写法. 缓存只保存 `c_kv` 和 `k_rope`, 每个头的 Key 和 Value 用到时才上投影出来. 吸收版本的 Decode 写法见 04 篇.

```python
import math
import torch
import torch.nn.functional as F

def rope(x, pos, base=10000.0):
    # x: [..., T, r], r 为偶数; pos: [T]
    r = x.shape[-1]
    inv = base ** (-torch.arange(0, r, 2, device=x.device).float() / r)
    ang = pos[:, None].float() * inv[None, :]              # [T, r/2]
    cos, sin = ang.cos(), ang.sin()
    x1, x2 = x[..., 0::2], x[..., 1::2]
    out = torch.stack([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1)
    return out.flatten(-2)

def mla_forward(h, W, n_h, d_h, d_r, pos):
    # h: [B, T, d]; W: 字典, 形状见第 2.3 节的表 (行向量写法)
    B, T, _ = h.shape
    c_q = F.rms_norm(h @ W["DQ"], (W["DQ"].shape[1],))      # [B, T, d_c'], 式 (5) 与 5.1 节
    q_c = (c_q @ W["UQ"]).view(B, T, n_h, d_h)
    q_r = rope((c_q @ W["QR"]).view(B, T, n_h, d_r).transpose(1, 2), pos)  # [B, n_h, T, d_r], 式 (8)

    c_kv = F.rms_norm(h @ W["DKV"], (W["DKV"].shape[1],))   # [B, T, d_c], 式 (2), 进缓存
    k_r = rope((h @ W["KR"]).unsqueeze(1), pos)             # [B, 1, T, d_r], 式 (9), 进缓存
    k_c = (c_kv @ W["UK"]).view(B, T, n_h, d_h).transpose(1, 2)   # 式 (4), 用完即弃
    v_c = (c_kv @ W["UV"]).view(B, T, n_h, d_h).transpose(1, 2)

    q = torch.cat([q_c.transpose(1, 2), q_r], dim=-1)       # [B, n_h, T, d_h + d_r], 式 (10)
    k = torch.cat([k_c, k_r.expand(B, n_h, T, d_r)], dim=-1)
    scores = q @ k.transpose(-2, -1) / math.sqrt(d_h + d_r)  # 式 (11) 的缩放
    mask = torch.ones(T, T, dtype=torch.bool, device=h.device).triu(1)
    attn = F.softmax(scores.masked_fill(mask, float("-inf")).float(), dim=-1).to(h.dtype)
    o = (attn @ v_c).transpose(1, 2).reshape(B, T, n_h * d_h)
    return o @ W["O"], (c_kv, k_r)
```

代码里 `k_r.expand` 只是视图, 不复制数据; `k_c`, `v_c` 是临时张量, 形状 $[B, n_h, T, d_h]$, 长序列 Prefill 时它们的显存开销与 MHA 的 K/V 相同. 这块临时显存怎么控制, 是 04 篇第 4.1 节讨论的问题. RMSNorm 的位置按 5.1 节, 论文没有给出缩放因子的具体值, 代码里省略.

Decode 时同一个函数的用法不同. 每步只来 1 个新 token, 先算它的 $c_t^{KV}$ 和 $k_t^R$ 追加进缓存, 缓存长度从 $t-1$ 变成 $t$. 接着如果照搬上面的写法, 要把缓存里全部 $t$ 个 $c_j^{KV}$ 乘上 $W^{UK}$ 和 $W^{UV}$, 每步重新生成 $[n_h, t, d_h]$ 的 Key 和 Value, 计算量和临时显存都随 $t$ 线性增长, 而这些上投影结果在上一步已经算过一次又扔掉了. 这就是为什么 Decode 要换成吸收版本: Query 先乘 $W^{UK}$ 的转置映射到 $d_c$ 维, 直接和缓存的 $c_j^{KV}$ 点积, 加权求和的结果也留在 $d_c$ 维, 最后再乘 $W^{UV}$ 和 $W^O$. 4.4 节的手算就是这个过程的单头版本.

---

#### 5.4 与 MQA, GQA 放在一起

| | MHA | GQA | MQA | MLA |
|---|---|---|---|---|
| 每 token 每层缓存 (元素) | $2n_hd_h$ | $2n_gd_h$ | $2d_h$ | $d_c+d_h^R$ |
| V2 配置下 | 32768 | $256n_g$ | 256 | 576 |
| 每头的 Key 是否不同 | 是 | 组内相同 | 全部相同 | 是 |
| RoPE 加在哪 | 整个 Key | 整个 Key | 整个 Key | 单独的 $d_h^R$ 维 |
| 论文 Table 1 的能力评价 | Strong | Moderate | Weak | Stronger |

MLA 的缓存比 GQA-2 多一点 (576 对 512), 比 MQA 多一倍多. 它换来的是每个头仍有自己的 Key 和 Value. 吸收之后, MLA 在 Decode 时的计算形态与 MQA 一致: 所有头读同一个 576 维的「Key」和同一个 512 维的「Value」, 每读一个缓存元素做的乘加次数比 MQA 还多, 这部分分析在 04 篇第 3.5–3.7 节.

MLA 的代价有四处. 第一是注意力本身的计算: 吸收之后每个头的打分维度从 192 变成 576, 加权求和的维度从 128 变成 512, 对长序列 Prefill 不划算, 所以推理框架在 Prefill 阶段改用不吸收的算法 (04 篇第 3, 4 节). 第二是迁移成本: GQA 论文给了 mean pool 加 5% uptrain 的转换配方, DeepSeek-V2 的 MLA 是从头训练的, 论文没有给出从 MHA/GQA checkpoint 转换的方法. 第三是张量并行: 潜变量被所有头共享, 按头切分时每张卡都要一份完整缓存. 第四是位置信息只有 64 维, 32 个频率, 所有头共用一份位置 Key; 论文的长上下文测试说明 128K 内够用, 更长的范围没有报告.

迁移成本这一条, 2025 年有两项工作给出了转换方法. [Ji et al. (2025)](https://arxiv.org/abs/2502.14837) 的 MHA2MLA 先只保留部分频率的 RoPE, 其余维度当作内容部分, 再对 Key 和 Value 的投影做联合 SVD, 得到 $W^{DKV}$ 和上投影的初始化, 之后只用原预训练数据的 0.3% 到 0.6% 微调; 在 Llama-2-7B 上, KV Cache 减少 92.19% 时 LongBench 只下降 0.5%. [Meng et al. (2025)](https://arxiv.org/abs/2502.07864) 的 TransMLA 证明, 缓存量相同时任意 GQA 都能写成一个 MLA, 反过来不成立, 并据此把 GQA 模型转换成 MLA 再微调.

---

#### 5.5 失效模式与边界

| 现象 | 原因 | 处理方向 |
|---|---|---|
| 把 RoPE 直接加在内容 Key 上 | 中间夹 $R_{t-j}$, 无法吸收, 每步要重算全部前缀的 Key | 用解耦 RoPE, 位置只走 $q^R, k^R$ |
| 缩放因子写成 $\sqrt{d_h}$ | 打分维度是 $d_h+d_h^R$ | 按式 (11) 用 $\sqrt{192}$ |
| 缓存存了上投影后的 $k^C, v^C$ | 又回到 MHA 的缓存量 | 只缓存 $c^{KV}$ 和旋转后的 $k^R$ |
| $k^R$ 按头存了 $n_h$ 份 | 式 (9) 的 $k^R$ 是所有头共享的一份 | 缓存一份, 计算时广播 |
| 长上下文扩展后效果下降 | YaRN 用到了内容部分, 或缩放因子没按 MLA 调 | 只对 $k^R$ 用 YaRN, 按 5.1 节设置 |
| 按头做张量并行时缓存没减少 | 潜变量是所有头共享的, 每卡都要一份 | 推理时考虑数据并行切 batch, 或接受复制 |
| 用 93.3% 估计 MLA 本身的压缩率 | 这个数含 6 bit KV 量化 | 按元素数比, 相对 DeepSeek 67B 是 17.8% |

MLA 压缩的是 Key/Value 的维度, 与减少位置数的方法 (滑动窗口, 稀疏注意力) 和减少每个元素位数的方法 (KV 量化) 都正交, DeepSeek-V2 的部署就同时用了 MLA 和 KV 量化. 但已有的 MHA/GQA checkpoint 不能直接替换成 MLA, 结构变了就需要训练. 吸收的推导, 两种算法的计算量交叉点, 以及推理框架按 Prefill 和 Decode 切换算法的做法, 接着看 04 MLA 矩阵吸收与工程实现.

---

### 参考文献

1. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434). arXiv. §2.1, §3.1.2–3.1.4, §3.2.3, Appendix B, C, D, Table 1, 8, 9.
2. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). arXiv. §2.1.1.
3. Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., & Liu, Y. (2024). [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864). Neurocomputing.
4. Peng, B., Quesnelle, J., Fan, H., & Shippole, E. (2023). [YaRN: Efficient Context Window Extension of Large Language Models](https://arxiv.org/abs/2309.00071). arXiv.
5. Ainslie, J., et al. (2023). [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245). EMNLP.
6. DeepSeek-AI. (2024). [DeepSeek LLM: Scaling Open-Source Language Models with Longtermism](https://arxiv.org/abs/2401.02954). arXiv. Table 2.
7. Shazeer, N. (2019). [Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150). arXiv.
8. Ji, T., et al. (2025). [Towards Economical Inference: Enabling DeepSeek's Multi-Head Latent Attention in Any Transformer-based LLMs](https://arxiv.org/abs/2502.14837). arXiv.
9. Meng, F., Yao, Z., & Zhang, M. (2025). [TransMLA: Multi-Head Latent Attention Is All You Need](https://arxiv.org/abs/2502.07864). arXiv.




03 MLA 讲了 MLA 缓存什么: 每 token 每层一个 512 维的潜变量 $c^{KV}$ 和一个 64 维的共享 RoPE Key $k^R$. 缓存小了, 但注意力计算需要的是每个头的 Key 和 Value. 从潜变量到注意力输出, 有两种算法.

第一种是不吸收: 用 $W^{UK}, W^{UV}$ 把全部历史 token 的潜变量上投影成 128 个头的 Key 和 Value, 然后做普通的 MHA. 第二种是吸收: 利用矩阵乘法的结合律, 把 $W^{UK}$ 挪到 Query 一侧, 把 $W^{UV}$ 挪到输出一侧, 注意力直接在潜变量上算, 每个头读同一份 576 维的「Key」和 512 维的「Value」, 形态与 MQA 相同. 两种算法结果在数学上相同, 计算量和访存量差别很大, 哪个更快取决于这一步有多少新 token, 已有多少历史 token. 本篇沿用 03 篇的记号和行向量写法.

---

### 1. 问题与吸收的推导

#### 1.1 缓存是潜变量, 注意力要的是每头的 Key/Value

03 篇式 (10)–(12) 给出了 MLA 第 $i$ 个头的打分和输出:

$$
s_{t,j,i}=\frac{q_{t,i}^C(k_{j,i}^C)^\top+q_{t,i}^R(k_j^R)^\top}{\sqrt{d_h+d_h^R}},\qquad o_{t,i}=\sum_{j}\alpha_{t,j,i}\,v_{j,i}^C \tag{1}
$$

其中 $k_{j,i}^C=c_j^{KV}W_i^{UK}$, $v_{j,i}^C=c_j^{KV}W_i^{UV}$, $\alpha_{t,j,i}=\mathrm{softmax}_j(s_{t,j,i})$. 输出投影把各头拼起来乘 $W^O$, 也可以写成按头求和:

$$
u_t=\sum_{i=1}^{n_h}o_{t,i}W_i^O,\qquad W_i^O\in\mathbb{R}^{d_h\times d} \tag{2}
$$

$W_i^O$ 是 $W^O$ 中对应第 $i$ 个头的 $d_h$ 行. 缓存里只有 $c_j^{KV}$ 和 $k_j^R$. 直接按式 (1) 算, 每一步都要把全部历史 token 的 $c_j^{KV}$ 乘上 128 个头的 $W_i^{UK}$ 和 $W_i^{UV}$, 生成 $[n_h, T, d_h]$ 的 Key 和 Value. Decode 每步只来 1 个 token, 却要为几千上万个历史 token 重做上投影, 而且上一步算过的结果没有保留. 吸收要解决的就是这个问题.

DeepSeek-V2 在 §2.1.2 介绍低秩压缩时就提到了这一点: 推理时 $W^{UK}$ 可以吸收进 $W^Q$, $W^{UV}$ 可以吸收进 $W^O$, 因此注意力计算甚至不需要把 Key 和 Value 算出来. 附录 C 给出完整公式时, 把吸收的依据写作结合律. 论文没有讨论 Prefill 时是否吸收, 也没有给出两种算法的计算量对比, 这部分由推理框架的实现和下面的分析补上.

---

#### 1.2 Key 一侧

把 $k_{j,i}^C=c_j^{KV}W_i^{UK}$ 代入内容项:

$$
q_{t,i}^C(k_{j,i}^C)^\top=q_{t,i}^C(W_i^{UK})^\top(c_j^{KV})^\top=\tilde q_{t,i}\,(c_j^{KV})^\top,\qquad \tilde q_{t,i}=q_{t,i}^C(W_i^{UK})^\top\in\mathbb{R}^{d_c} \tag{3}
$$

$\tilde q_{t,i}$ 是把第 $i$ 个头的内容 Query 映射到潜变量空间的结果, 512 维. 每步只需要为当前 token 算一次 $\tilde q_{t,i}$, 然后直接和缓存里的 $c_j^{KV}$ 点积, 不必生成任何 $k_{j,i}^C$.

再把 $q_{t,i}^C=c_t^QW_i^{UQ}$ 代入, 得到

$$
\tilde q_{t,i}=c_t^Q\,W_i^{UQ}(W_i^{UK})^\top,\qquad W_i^{UQ}(W_i^{UK})^\top\in\mathbb{R}^{d_c'\times d_c} \tag{4}
$$

这就是论文说的「$W^{UK}$ 吸收进 $W^{UQ}$」: 两个矩阵之间没有任何与位置有关的量, 可以看成一个 $1536\times512$ 的矩阵. 03 篇第 3.1 节说明了为什么内容部分不能带 RoPE: 一旦带了, 这里就会夹着 $R_{t-j}$.

#### 1.3 Value 一侧

把 $v_{j,i}^C=c_j^{KV}W_i^{UV}$ 代入输出, $\alpha_{t,j,i}$ 是标量, 可以提到矩阵乘法外面:

$$
o_{t,i}=\sum_j\alpha_{t,j,i}\,c_j^{KV}W_i^{UV}=\Big(\sum_j\alpha_{t,j,i}\,c_j^{KV}\Big)W_i^{UV}=\tilde o_{t,i}\,W_i^{UV} \tag{5}
$$

$\tilde o_{t,i}\in\mathbb{R}^{d_c}$ 是第 $i$ 个头对潜变量的加权平均. 代回式 (2):

$$
u_t=\sum_{i=1}^{n_h}\tilde o_{t,i}\,W_i^{UV}W_i^O,\qquad W_i^{UV}W_i^O\in\mathbb{R}^{d_c\times d} \tag{6}
$$

这就是「$W^{UV}$ 吸收进 $W^O$」. 注意 $\tilde o_{t,i}$ 每个头不同, 因为权重 $\alpha_{t,j,i}$ 每个头不同; 被所有头共享的是加权求和的对象 $c_j^{KV}$.

Value 一侧能这样做, 依赖 Value 不带位置旋转. 如果 $v_{j,i}=c_j^{KV}W_i^{UV}R_j$, 式 (5) 里每一项右边都乘着不同的 $R_j$, $W_i^{UV}R_j$ 不能作为公共因子提到求和号外面, 加权求和就必须在展开后的 $d_h$ 维空间里做. MLA 的 Value 只有内容部分, 这一条自然满足.

#### 1.4 带 RoPE 的完整形式

把位置项加回来. 03 篇式 (12) 的打分写成两个拼接向量的点积:

$$
s_{t,j,i}=\frac{\left[\tilde q_{t,i};\,q_{t,i}^R\right]\left[c_j^{KV};\,k_j^R\right]^\top}{\sqrt{d_h+d_h^R}} \tag{7}
$$

左边是每个头的 576 维 Query, 右边是每个 token 的 576 维缓存, 所有头共用. 加权求和的对象是 $c_j^{KV}$ 本身 (512 维), 不含 $k_j^R$. 缩放因子不变, 仍是 $\sqrt{d_h+d_h^R}=\sqrt{192}$, 因为打分的数值与吸收前完全相同, 只是计算顺序变了.

#### 1.5 MQA 形态

式 (7) 和式 (5) 合起来就是一个 MQA:

| | 吸收前 (MHA 形态) | 吸收后 (MQA 形态) |
|---|---|---|
| Query 头数 | 128 | 128 |
| KV 头数 | 128 | 1 |
| Query/Key 维度 | $128+64=192$ | $512+64=576$ |
| Value 维度 | 128 | 512 |
| 注意力输出 | $[n_h, 128]$, 直接乘 $W^O$ | $[n_h, 512]$, 先乘 $W_i^{UV}$ 再乘 $W^O$ |

vLLM 的文档字符串对这一点的概括是: Decode 时注意力「模拟」的是多头注意力, 计算方式却与多查询注意力相近. 从模型的角度看, 每个头仍有自己的 Key 和 Value, 只是它们从未被显式算出; 从内核的角度看, 只有一个 KV 头. 文档字符串在 Decode 路径的注释里写得更具体: Decode 路径是「MQA with QK headdim = Lkv + R, V headdim = Lkv」, 并注明这样计算上不如 MHA 友好 (因为 $L_{kv}=512>P=128$), 但数据搬运上更友好, 因为它是 MQA. FlashMLA 的分析里, 访存量按 $2s_kd_k$ 字节估计, 只读一次 576 维的 Key; Value 就是 Key 的前 512 维, 不另读一份.

---

### 2. 吸收的本质与手算

#### 2.1 吸收是改变乘法顺序

式 (4) 和式 (6) 看起来是要预先算出 $W_i^{UQ}(W_i^{UK})^\top$ 和 $W_i^{UV}W_i^O$. 按 DeepSeek-V2 的形状算一下, 预乘反而更贵. 每 token 每层的乘加次数:

| 计算 | 预先合并 | 分两步 |
|---|---|---|
| Query 一侧 | $c^Q$ 乘 128 个 $1536\times512$: 1.007 亿 | $c^Q W^{UQ}$ ($1536\times16384$) 再每头乘 $128\times512$: 3355 万 |
| 输出一侧 | 128 个 $\tilde o$ 乘 $512\times5120$: 3.355 亿 | 每头乘 $512\times128$ 再乘 $W^O$ ($16384\times5120$): 9227 万 |

预乘在 Query 一侧是分两步的 3.0 倍, 在输出一侧是 3.6 倍. 原因是两个矩阵都是低秩分解的一半: $W_i^{UQ}$ 是 $1536\times128$, $W_i^{UK}$ 是 $512\times128$, 乘出来的 $1536\times512$ 矩阵秩只有 128, 却按满矩阵存储和计算. 分两步时中间结果只有 128 维, 计算量更小. 预乘还会多出权重: 每层 128 个 $1536\times512$ 矩阵约 1 亿个参数, 128 个 $512\times5120$ 矩阵约 3.4 亿个参数, 而原来的 $W^{UQ}$, $W^{UK}$, $W^{UV}$, $W^O$ 合计约 1.26 亿.

vLLM 的 Decode 路径就是分两步: 先算 `q_nope = (q_c @ W_UQ)`, 再算 `ql_nope = einsum("snh,lnh->snl", q, W_UK)`; 输出端先 `einsum("snl,lnv->snv", spda_o, W_UV)`, 再乘 $W^O$. 所以「吸收」在实现上的含义是: 注意力内核看到的是潜变量空间里的 Query 和 Value, 上投影矩阵在内核外面, 作用在每步只有 $x$ 个的新 token 上, 而不是作用在 $y$ 个历史 token 上. 下文的计算量模型按分两步计算.

---

#### 2.2 手算: 两个头的等价性

沿用 03 篇第 4.1 节的缓存: $c_1=[1,0]$, $c_2=[0,1]$, $c_3=[1,1]$, 旋转后的 $k_1^R=[0,1]$, $k_2^R=[-1,0]$, $k_3^R=[0,-1]$, $d_c=d_h=d_h^R=2$, 缩放因子 $\sqrt{4}=2$. 加一个头:

| | 头 1 | 头 2 |
|---|---|---|
| $W_i^{UK}$ | $\begin{bmatrix}1&1\\0&1\end{bmatrix}$ | $\begin{bmatrix}0&1\\1&0\end{bmatrix}$ |
| $W_i^{UV}$ | $\begin{bmatrix}1&0\\1&1\end{bmatrix}$ | $\begin{bmatrix}1&1\\0&1\end{bmatrix}$ |
| $W_i^{O}$ | $\begin{bmatrix}1&0\\0&1\end{bmatrix}$ | $\begin{bmatrix}0&1\\1&0\end{bmatrix}$ |
| $q_{3,i}^C$ | [1, 0] | [0, 1] |
| $q_{3,i}^R$ | [0, −1] | [1, 0] |

**不吸收.** 头 2 的 Key 为 $c_jW_2^{UK}$: $[0,1], [1,0], [1,1]$; Value 为 $c_jW_2^{UV}$: $[1,1], [0,1], [1,2]$. 内容项 $[1,0,1]$, 位置项 $q_{3,2}^R(k_j^R)^\top=[0,-1,0]$, 相加除以 2 得 $[0.5,-0.5,0.5]$, softmax 为 $[0.422, 0.155, 0.422]$, 输出 $o_{3,2}=[0.845, 1.422]$. 头 1 与 03 篇相同, $o_{3,1}=[1.576, 0.788]$. 按式 (2), $u_3=o_{3,1}W_1^O+o_{3,2}W_2^O=[1.576,0.788]+[1.422,0.845]=[2.998, 1.633]$.

**吸收.** 头 2 的 $\tilde q_{3,2}=q_{3,2}^C(W_2^{UK})^\top=[0,1]\begin{bmatrix}0&1\\1&0\end{bmatrix}=[1,0]$, 与 $c_j$ 点积得 $[1,0,1]$, 与上面的内容项相同, 所以 softmax 权重也相同. 按式 (5), $\tilde o_{3,2}=0.422\,[1,0]+0.155\,[0,1]+0.422\,[1,1]=[0.845, 0.578]$, 再乘 $W_2^{UV}$ 得 $[0.845, 1.422]$, 与 $o_{3,2}$ 一致. 头 1 的 $\tilde o_{3,1}=[0.788,0.788]$, 乘 $W_1^{UV}$ 得 $[1.576,0.788]$. 最终 $u_3=[2.998, 1.633]$, 两种算法结果相同, 保留三位小数时每个分量都对得上.

吸收版本的注意力内核里只出现了 $c_j$ (2 维) 和 $k_j^R$, 没有出现任何一个头的 $k_{j,i}^C$ 或 $v_{j,i}^C$. 在真实配置里, 这意味着内核只读 576 维的缓存, 不读也不生成 $128\times(128+128)$ 维的展开结果. 两个头的 $\tilde q$ 碰巧都是 $[1,0]$, 但 $\tilde o$ 不同 ($[0.788,0.788]$ 和 $[0.845,0.578]$), 因为位置项不同, softmax 权重不同. 头之间的差异通过 $q^R$ 和各自的 $W_i^{UV}$, $W_i^O$ 保留了下来.

---

### 3. 计算量与访存

#### 3.1 计算量模型

考虑一层里的一个头. 本步有 $x$ 个新 token (Decode 时 $x=1$, Prefill 时 $x$ 是这一段的长度), 缓存里已有 $y$ 个历史 token, 新 token 要看全部 $x+y$ 个位置. 两种算法共有的部分 ($c^Q$, $c_t^QW^{UQ}$, $q^R$, $k^R$ 的计算, 新 token 的 $c^{KV}$, 最后的 $W^O$) 不计入. 只数乘加次数, 按 DeepSeek-V2 的维度 $d_c=512$, $d_h=128$, $d_h^R=64$:

**不吸收.** 全部 $x+y$ 个 token 的潜变量都要上投影成这个头的 Key 和 Value, 每个 token $512\times(128+128)=131072$ 次; 注意力打分每对位置 192 次, 加权求和 128 次:

$$
F_{\text{non}}=131072\,(x+y)+320\,x(x+y) \tag{8}
$$

**吸收.** 只有 $x$ 个新 token 的 Query 乘 $W_i^{UK}$ 的转置 ($128\times512=65536$ 次), 输出乘 $W_i^{UV}$ ($512\times128=65536$ 次); 注意力打分每对位置 576 次, 加权求和 512 次:

$$
F_{\text{abs}}=131072\,x+1088\,x(x+y) \tag{9}
$$

两者之差:

$$
z=F_{\text{non}}-F_{\text{abs}}=131072\,y-768\,x^2-768\,xy \tag{10}
$$

$z>0$ 表示吸收更省. 第一项是不吸收要为 $y$ 个历史 token 重做的上投影, 第二, 三项是吸收后注意力维度从 192/128 变成 576/512 多出来的乘加. 模型没有计入因果掩码 (实际的 Prefill 只算一半的位置对), 也没有计入 softmax 本身.

#### 3.2 几个切面

**Decode, $x=1$.** $z=131072y-768-768y=130304y-768$, $y\ge1$ 时恒为正. 以 $y=4096$ 为例, $F_{\text{non}}=4097\times131392\approx5.38\times10^8$, $F_{\text{abs}}=131072+1088\times4097\approx4.59\times10^6$, 不吸收是吸收的 117 倍. Decode 必须吸收.

**无历史的 Prefill, $y=0$.** $z=-768x^2<0$. 没有历史 token 时, 不吸收的上投影只作用在新 token 上, 和吸收在 Query/输出一侧的开销相同, 剩下的就是注意力维度的差. 以 $x=4096$ 为例, $F_{\text{non}}\approx5.91\times10^9$, $F_{\text{abs}}\approx1.88\times10^{10}$, 吸收是不吸收的 3.2 倍, $z\approx-1.29\times10^{10}$.

**固定历史长度.** 令 $z=0$, 解出交叉点. 例如 $y=20$ 时, $768x^2+15360x-2621440=0$, 得 $x^*\approx49.27$: 新 token 少于 49 个时吸收更省, 多于 50 个时不吸收更省.

#### 3.3 交界线

一般地, 由 $z=0$ 解出给定 $x$ 时的临界历史长度:

$$
y^*(x)=\frac{768\,x^2}{131072-768\,x}=\frac{x^2}{170.67-x} \tag{11}
$$

$y>y^*(x)$ 时吸收更省. 分母在 $x\ge171$ 时非正, 这时不论历史多长, 不吸收都更省.

| 新 token 数 $x$ | 临界历史长度 $y^*$ |
|---|---|
| 1 | 0.006 |
| 16 | 1.7 |
| 64 | 38.4 |
| 128 | 384 |
| 160 | 2400 |
| 170 | 43350 |
| $\ge171$ | 不存在 |

这张表对应几种实际场景. 普通 Decode 和投机解码 (每步验证几个草稿 token) 的 $x$ 都很小, 落在吸收一侧. 分块 Prefill 每块通常有几百到几千个 token, $x$ 超过 171, 落在不吸收一侧. 中间的区域 (几十个新 token 配上较长历史) 要看具体的 $x$ 和 $y$.

多轮对话是中间区域的典型例子. 前几轮的 8000 个 token 已在前缀缓存里, 用户新发来 100 个 token. 调度器会把它当作 Prefill, 但 $y^*(100)=100^2/70.67\approx141$, 而 $y=8000$ 远大于它. 代入式 (10), $z=131072\times8000-768\times100^2-768\times100\times8000\approx4.26\times10^8>0$, 按乘加次数吸收更省: 不吸收要为 8000 个历史 token 重做上投影, 这部分开销超过了吸收后注意力维度变大的代价. 第 4.2 节引用的 vLLM 注释说「以后应该调优」, 指的就是这类情形.

#### 3.4 计入因果掩码

式 (8), (9) 假设每个新 token 都看全部 $x+y$ 个位置. 实际 Prefill 带因果掩码, 第 $k$ 个新 token 只看 $y+k$ 个位置, 总的位置对数是 $xy+x(x+1)/2\approx xy+x^2/2$. 注意力部分的差值相应变成 $768(xy+x^2/2)$, 上投影部分不变:

$$
z_{\text{causal}}\approx131072\,y-384\,x^2-768\,xy,\qquad y^*_{\text{causal}}(x)=\frac{x^2}{2\,(170.67-x)} \tag{13}
$$

临界历史长度减半, 吸收的区域略微扩大; 但分母不变, $x\ge171$ 时不吸收总是更省这一条不受影响. Decode 只有 1 个新 token, 有无掩码没有区别.

训练和无前缀的 Prefill 一样是 $y=0$ 的情形, 不吸收总是更省, 所以训练时按 03 篇第 5.3 节的写法直接上投影, 吸收只在推理时使用.

这个结论只看乘加次数. 实际速度还取决于访存和内核效率, 下一节讨论.

---

#### 3.5 每读一个缓存元素做多少次乘加

Decode 时每步只有 1 个新 token, 计算量小, 速度往往由读缓存的速度决定. 衡量的指标是每读一个缓存元素做多少次乘加:

| 结构 | 每 token 读的元素 | 每 token 所有头的乘加 | 比值 |
|---|---|---|---|
| MHA ($n_h$ 头, $d_h=128$) | $2n_hd_h$ | $2n_hd_h$ | 1 |
| GQA ($G$ 组) | $2Gd_h$ | $2n_hd_h$ | $n_h/G$ |
| MQA | $2d_h$ | $2n_hd_h$ | $n_h$ |
| MLA 吸收 | 576 | $1088\,n_h$ | $1088n_h/576$ |

$n_h=128$ 时 MLA 吸收版的比值约 242, 比 MQA 的 128 还高, 因为每个缓存元素既参与打分 (576 维) 又参与加权求和 (前 512 维), 被所有 128 个头各用一次.

#### 3.6 FlashMLA 的分析

DeepSeek 开源的 FlashMLA 在 2025 年 4 月的技术博客里做了同样的分析. 设 Query 头数 $h_q$, 每个请求的 Query token 数 $s_q$ (不开 MTP 或投机解码时为 1), KV token 数 $s_k$, Key 和 Value 维度 $d_k, d_v$. 计算量约为 $2h_qs_qs_k(d_k+d_v)$ FLOPs, 访存约为 $2s_kd_k$ 字节 (BF16), 比值

$$
\frac{\text{FLOPs}}{\text{字节}}\approx h_qs_q\cdot\frac{d_k+d_v}{d_k}\approx2h_qs_q \tag{12}
$$

代入 $h_q=128$, $s_q=1$, $d_k=576$, $d_v=512$, 得 241.8, 与上表一致 (BF16 下每个元素 2 字节, 每次乘加 2 FLOPs, 两个 2 相消).

博客给出的 H800 SXM5 参数是显存带宽 3.35 TB/s, 峰值 990 TFLOPS, 降频后实际约 865 TFLOPS. 按近似 $2h_qs_q$, 当 $h_qs_q\ge\frac{1}{2}\cdot\frac{865}{3.35}\approx128$ 时内核是计算受限. DeepSeek 的线上 Decode 实例不用张量并行, $h_q=128$, 博客据此把 MLA 的 Decode 内核按计算受限来优化, 目标是让 Tensor Core 持续满载.

按精确比值 241.8 算, 它与硬件的 $865/3.35\approx258$ 很接近, 处在两种瓶颈的交界上. 代入一个例子: 一条序列已有 32768 个 token, 一层的缓存 BF16 下约 37.7 MB, 按 3.35 TB/s 读一遍约 11.3 μs; 计算量 $2\times128\times32768\times1088\approx9.13$ GFLOP, 按 865 TFLOPS 约 10.6 μs. 两者几乎相等, 内核必须同时做好访存和计算的重叠, 任何一边掉速都会成为瓶颈.

$s_q>1$ 时比值按 $s_q$ 成倍增加. 用 MTP 或投机解码每步验证 2 个 token 时, $h_qs_q=256$, 内核明确进入计算受限. 这与 MHA 的 Decode 完全相反: MHA 每个元素只做 1 次乘加, 永远是访存受限.

FlashMLA 旧版本的数字是访存受限场景 3000 GB/s, 计算受限场景 580 TFLOPS; 2025 年 4 月的新版本在计算受限场景达到 660 TFLOPS, 比旧版本高约 14%, 约为降频后峰值 865 TFLOPS 的 76%.

#### 3.7 张量并行会降低算术强度

按头切分的张量并行会把 $h_q$ 分到多张卡上. 并行度为 $P$ 时, 每张卡上 $h_q=128/P$, 式 (12) 的比值也除以 $P$; 而潜变量缓存被所有头共享, 每张卡都要读完整的一份. $P=8$ 时每卡 16 个头, 比值降到约 30, 内核回到访存受限, 而且 8 张卡各存一份相同的缓存. 这与 3.6 节提到的 DeepSeek 线上 Decode 不用张量并行的做法一致, 也说明 MLA 的部署方式和 MHA 不同: MHA 按头切分缓存, 张量并行同时切分了缓存; MLA 按头切分只切分了计算.

DeepSeek-V3 技术报告 §3.4.2 描述的 Decode 部署还带张量并行: 最小部署单元 40 个节点 320 张卡, 注意力部分用 TP4 加序列并行, 再配 80 路数据并行, MoE 部分用 320 路专家并行. TP4 时每卡 32 个 Query 头, 比值约 $1088\times32/576\approx60.4$, 远低于 H800 的约 258, 内核是访存受限. FlashMLA 博客写的「线上不用张量并行」是之后的部署, 每卡 128 个头, 比值回到 242.

---

### 4. 显存与 Prefill/Decode 分流

#### 4.1 三类显存

推理时与 MLA 有关的显存分三类.

**常驻缓存.** 每 token 每层 576 个元素, BF16 下 1152 字节, 随序列长度线性增长, 生命周期与请求相同. 03 篇第 4.5 节算过, DeepSeek-V2 一条 128K 序列约 9.06 GB. DeepSeek-V3 有 61 层, 每 token 全模型缓存 $576\times61\times2=70272$ 字节, 约 68.6 KiB; 一条 128K 序列是 $70272\times131072\approx9.21\times10^9$ 字节, 与 V2 的量级相同.

**展开工作区.** 不吸收的算法要把潜变量上投影成每头的 Key 和 Value. 按 vLLM 文档字符串里的写法, 拼接后的 Key 是 $[S_{kv}, N, P+R]$, Value 是 $[S_{kv}, N, V]$, 每 token 每层 $128\times192+128\times128=40960$ 个元素, 是常驻缓存的 71 倍. 一次展开 128K 个 token, BF16 下约 10.7 GB (10 GiB), 而这只是一层的临时张量. 这块显存不随层数累积 (算完一层就释放), 但峰值很高.

**权重.** $W^{UK}$ 和 $W^{UV}$ 每层各 $512\times16384\approx839$ 万个参数, 两种算法都要读. 不吸收时它们作用在 $x+y$ 个 token 上, 吸收时只作用在 $x$ 个 token 上. BF16 下两者每层合计约 33.6 MB, 每步读一次, 与 batch 大小无关; 一条 32K token 序列在一层的缓存约 37.7 MB. batch 里都是短序列时, 读这两个矩阵的时间不能忽略; batch 大, 序列长时, 读缓存的时间占主导.

吸收的算法完全没有展开工作区, 内核里的中间量只有每头 512 维的 $\tilde q$ 和 $\tilde o$. 这是 Decode 选它的另一个原因.

---

#### 4.2 vLLM 的划分

vLLM v0.8.0 的 `vllm/attention/backends/mla/common.py` 把两种算法分别实现为 `_forward_prefill` (计算友好) 和 `_forward_decode` (数据搬运友好). 文档字符串的说法是: $S_q/S_{kv}$ 接近 1 时 (Prefill) 用计算友好的算法, $S_q/S_{kv}$ 很小时 (Decode) 用数据搬运友好的算法; 目前按调度器给出的 Prefill/Decode 标签选择, 并注明这个划分以后应该调优. 这与第 3.3 节的交界线一致: Prefill 的 $x$ 大, 落在不吸收一侧; Decode 的 $x=1$, 落在吸收一侧.

两条路径共用一份缓存, 都只存 `kv_c` 和 `k_pe`. 切换算法不需要改缓存格式, 这是 MLA 能按阶段选算法的前提.

#### 4.3 分块 Prefill

带前缀缓存或多轮对话时, Prefill 的新 token 要看很长的历史 ($y$ 很大). 按第 3.3 节, 只要每块 $x\ge171$, 不吸收仍然更省. 但不吸收要展开全部历史, 第 4.1 节的工作区可能放不下. vLLM 文档字符串直接指出了这一点: 计算友好的算法在 $S_{kv}$ 很大时可能因为 `k_nope = (kv_c @ W_UK).view(Skv, N, P)` 而显存不足.

它的做法是对历史上下文分块:

1. 新 token 之间先做一次带因果掩码的 MHA, 得到输出 `curr_o` 和每行的 log-sum-exp `curr_lse`.
2. 历史上下文按最大块长 MCC 切块, MCC 动态计算以限制显存. 每块只把这一块的 `cache_kv_c` 上投影成 Key 和 Value, 与新 token 的 Query 做不带掩码的注意力, 得到 `chunk_o` 和 `chunk_lse`.
3. 用 `merge_attn_states` 按 log-sum-exp 合并各块的结果.

合并的依据是 softmax 可以分块计算: 每块记下自己的最大值和指数和, 合并时按 log-sum-exp 重新加权, 结果与一次算全部位置相同, 这与 FlashAttention 的在线 softmax 是同一个原理. 写成公式, 对同一个 Query 行, 两块结果 $(o_1, l_1)$ 和 $(o_2, l_2)$ 的合并是

$$
l=\log\!\left(e^{l_1}+e^{l_2}\right),\qquad o=e^{l_1-l}\,o_1+e^{l_2-l}\,o_2
$$

其中 $l_1$ 是第一块分数的 log-sum-exp, $o_1$ 是第一块内部 softmax 加权得到的输出. $e^{l_1-l}$ 正好是第一块位置在全局 softmax 里所占的总权重, 两个系数之和为 1. 实现时先减去 $\max(l_1,l_2)$ 再取指数, 避免溢出. 多块时逐块两两合并即可. 工作区大小由 MCC 决定, 不再随历史长度增长.

文档字符串还提到, 如果分块的 $S_q$ 很小, 以后可能改用数据搬运友好的算法. 这正是第 3.3 节表中间那片区域.

#### 4.4 从访存看中间区域

第 3.1–3.4 节只数乘加. 从访存看, 两种算法对历史 token 的处理差别更大. 吸收版本对每个历史 token 只读一次 576 维缓存, 本步的 $x$ 个新 token 共用这次读取. 不吸收版本先读同样的 576 维缓存, 再把上投影结果写入工作区, 注意力内核再从工作区读出, 每个历史 token 多出约 40960 个元素的写和读, 是缓存本身的 71 倍. 所以在第 3.3 节表中间那片区域, 即使乘加次数接近, 吸收版本的访存量也小得多. 第 4.3 节的分块只限制了工作区的峰值, 没有减少这部分读写的总量.

---

### 5. 实现与边界

#### 5.1 吸收版 Decode

```python
import math
import torch
import torch.nn.functional as F

def mla_decode_absorbed(c_q, q_r, kv_cache, W_UQ, W_UK, W_UV, W_O, d_h, d_r):
    # c_q: [B, d_c']          当前 token 的 Query 潜变量
    # q_r: [B, n_h, d_r]      已旋转的 RoPE Query
    # kv_cache: [B, T, d_c + d_r]  每 token 的 [c_kv; k_r], 连续存放
    # W_UQ: [d_c', n_h, d_h]; W_UK, W_UV: [d_c, n_h, d_h]; W_O: [n_h * d_h, d]
    B, T, _ = kv_cache.shape
    d_c = W_UK.shape[0]
    q_c = torch.einsum("bq,qnh->bnh", c_q, W_UQ)            # [B, n_h, d_h], 内容 Query
    q_lat = torch.einsum("bnh,lnh->bnl", q_c, W_UK)         # [B, n_h, d_c], 式 (3), 分两步
    q = torch.cat([q_lat, q_r], dim=-1)                      # [B, n_h, 576]
    scores = q @ kv_cache.transpose(1, 2) / math.sqrt(d_h + d_r)   # [B, n_h, T], 式 (7), 缩放仍是 sqrt(192)
    attn = F.softmax(scores.float(), dim=-1).to(q.dtype)
    o_lat = attn @ kv_cache[..., :d_c]                       # [B, n_h, d_c], 式 (5), Value 是缓存的前 512 维
    o = torch.einsum("bnl,lnh->bnh", o_lat, W_UV)            # [B, n_h, d_h]
    return o.reshape(B, -1) @ W_O                            # 式 (2)
```

这段代码里 `kv_cache` 只被读了两次 (打分和加权求和), 两次读的是同一块内存, 实际内核会合并成一次. 上投影矩阵 `W_UK`, `W_UV` 只作用在当前 token 上. 所有 128 个头对同一份 `kv_cache` 做矩阵乘, 这就是 MQA 形态.

---

#### 5.2 实现细节

**缩放因子.** 吸收后 Query 是 576 维, 但缩放因子必须仍是 $\sqrt{192}$. 用通用的注意力接口时, 如果它按输入维度自动算缩放, 会得到 $\sqrt{576}$, 打分整体偏小, softmax 变平. vLLM v0.8.0 的 MLA 后端在构造时接收 `scale`, 调用注意力内核时以 `softmax_scale=self.scale` 显式传入.

**缓存布局.** $c^{KV}$ 和 $k^R$ 拼成一个 576 维向量连续存放, 打分时一次读出. 前 512 维同时用作 Value, 不需要第二份.

**数值.** 两种算法的数学结果相同, 但浮点运算顺序不同, BF16 下输出会有小的差异. 测试两条路径的一致性时要用合适的容差, 不能要求逐位相同. 一个可行的测试方法: 随机初始化一层的权重, 先用 03 篇第 5.3 节的不吸收写法跑一段 Prefill 得到缓存, 再对同一个新 token 分别用不吸收写法和第 5.1 节的吸收写法算输出, 在 float32 下比较, 差异应在舍入误差量级; 再换 BF16 观察差异的大小, 作为线上回归测试的容差依据.

**权重格式.** vLLM 的注释说明, 实际权重里 `kv_b_proj` 是每个头的 $[W^{UK}; W^{UV}]$ 拼接, `q_b_proj` 是每个头的 $[W^{UQ}; W^{QR}]$ 拼接. 吸收版本需要把它们按头拆开, 加载时一次性重排即可.

**Query 一侧的预计算.** 第 2.1 节说明了分两步比预乘省. 但如果 $d_c'$ 比 $d_c$ 小很多, 或者没有 Query 压缩 (如 DeepSeek-V2-Lite 直接从 $h_t$ 算 Query), 两者的比较会变, 需要按实际形状重算.

---

#### 5.3 失效模式与边界

| 现象 | 原因 | 处理方向 |
|---|---|---|
| Decode 很慢, 显存占用随长度剧增 | 用了不吸收的算法, 每步展开全部历史 | Decode 用吸收版本 |
| 长 Prompt 的 Prefill 比预期慢 | 用了吸收版本, 注意力维度 576/512 | Prefill 用不吸收版本 |
| 长上下文分块 Prefill 显存不足 | 一次展开全部历史 Key/Value | 按历史分块, 用 log-sum-exp 合并 |
| 吸收后输出偏离 | 缩放因子按 576 维自动计算 | 显式传入 $1/\sqrt{192}$ |
| 预乘 $W^{UQ}(W^{UK})^\top$ 后变慢 | 秩 128 的矩阵按满矩阵 $1536\times512$ 计算 | 分两步乘 |
| 张量并行后 Decode 吞吐下降 | 每卡头数变少, 算术强度降低, 缓存每卡复制 | Decode 用数据并行, 不按头切分 |
| 吸收版本里 Value 带了 $k^R$ | 加权求和只应作用于 $c^{KV}$ | 只取缓存前 $d_c$ 维 |

第 3.1 节的计算量模型只适用于 DeepSeek-V2/V3 的维度. 换一组 $d_c$, $d_h$, $d_h^R$, 式 (10) 的系数会变: 一般形式是 $z=2d_cd_h\,y-2(d_c-d_h)\,x(x+y)$, 其中 $d_h^R$ 在两种算法里相同, 互相抵消; 代入 $d_c=512$, $d_h=128$ 得到 $131072y-768x(x+y)$. 交界线 $x\approx171$ 来自 $d_cd_h/(d_c-d_h)=65536/384$, 维度变了这个数也会变.

MLA 本身压缩的是 Key/Value 的维度, 后续的 DeepSeek 模型在它上面加入了按 token 选择的稀疏注意力, FlashMLA 仓库现在的内核主要服务于稀疏版本, 这部分属于 2.3 高效与稀疏注意力 的内容.

---

### 参考文献

1. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434). arXiv. §2.1.2, Appendix C.
2. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). arXiv. §2.1.1, §3.4.2.
3. vLLM Project. (2025). [vllm/attention/backends/mla/common.py](https://github.com/vllm-project/vllm/blob/v0.8.0/vllm/attention/backends/mla/common.py). vLLM v0.8.0. 模块文档字符串.
4. DeepSeek-AI. (2025). [A Deep-Dive Into the New Flash MLA Kernel](https://github.com/deepseek-ai/FlashMLA/blob/ba89a3466e9470ad08ab39738d4e7bb66989e1e7/docs/20250422-new-kernel-deep-dive.md). FlashMLA.
5. DeepSeek-AI. (2025). [FlashMLA: Efficient Multi-head Latent Attention Kernels](https://github.com/deepseek-ai/FlashMLA). GitHub.
6. Dao, T. (2023). [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691). arXiv.
7. Shazeer, N. (2019). [Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150). arXiv.


### 6.25. 回到 V2 的原始 MLA 定义

V2 首次给出 MLA 的完整定义和缓存节省口径。以下推导用于核对 FlashMLA 的 576/512 维接口及其适用前提。

### 6. 从普通注意力推到 MLA

#### 6.1. 缓存究竟保存了什么

先把自回归解码写成最朴素的形式. 第 $t$ 步生成新 token 时, 第 $i$ 个注意力头拿到查询 $q_{t,i}$, 与此前 $1$ 到 $t$ 位的键做内积, 再用得到的权重加权值向量:

$$
a_{t,s,i}=\operatorname{softmax}_s\left(\frac{q_{t,i}^{\mathsf T}k_{s,i}}{\sqrt{d_h}}\right),\qquad
o_{t,i}=\sum_{s=1}^{t}a_{t,s,i}v_{s,i}.
$$

过去位置的隐藏状态已经不会改变, 每步重新计算它们的键和值纯属浪费, 于是部署系统保存全部 $k_{s,i}$ 与 $v_{s,i}$. 这就是 KV cache. 若层数为 $L$, KV 头数为 $n_{kv}$, 单头宽度为 $d_h$, 上下文长度为 $S$, 每个数占 $b$ 字节, 单条序列需要

$$
M_{KV}=2L S n_{kv}d_hb.
$$

这里的 2 分别对应 K 与 V. 它解释了一个容易混淆的现象: 模型权重只随 batch 装载一次, KV cache 却随「并发数乘上下文长度」增长. 236B 权重很大, 但它可以切到多张卡并被整个 batch 共用; 某位用户多塞进一段历史, 新增的缓存只服务于这位用户. 长上下文在线服务最终经常先撞到缓存容量, 而非权重容量.

MHA 令 $n_{kv}=n_h$, MQA 令 $n_{kv}=1$, GQA 则取介于两者之间的组数. 这三种结构都直接缓存投影完成的 K 和 V. MLA 改的是「缓存对象」: 保存能够重建二者的公共潜向量. 设当前层输入为 $h_t\in\mathbb R^d$, 联合下投影为

$$
c_t^{KV}=W^{DKV}h_t,\qquad W^{DKV}\in\mathbb R^{d_c\times d},\quad c_t^{KV}\in\mathbb R^{d_c}.
$$

然后分别上投影:

$$
k_t^C=W^{UK}c_t^{KV},\qquad v_t^C=W^{UV}c_t^{KV}.
$$

$W^{UK}$ 的输出可以按头切成 $k_{t,i}^C$, $W^{UV}$ 同理. 「联合」非常重要. 若 K 与 V 各存一份 512 维潜向量, 缓存是 1024 维; V2 只存一份 512 维向量, 两种重建共享同一组坐标. 共享会施加结构约束: 所有头的键和值都必须由同一个低维状态线性生成. 这也说明 $d_c$ 并非越小越好. 当它小到无法容纳各头共同需要的信息时, 上投影只能把已经丢掉的信息编造为不同形状, 表面上仍有 128 个头, 实际可用的自由度却受 $d_c$ 限制.

#### 6.2. 矩阵吸收为什么成立

忽略 RoPE, 第 $i$ 个头的内容查询可写为 $q_{t,i}^C=W_i^{Q}h_t$. 它与历史位置 $s$ 的内容键内积:

$$
(q_{t,i}^C)^{\mathsf T}k_{s,i}^C
=(W_i^Qh_t)^{\mathsf T}W_i^{UK}c_s^{KV}
=h_t^{\mathsf T}(W_i^Q)^{\mathsf T}W_i^{UK}c_s^{KV}.
$$

模型参数在一次推理期间固定, 因而可预先构造 $\widetilde W_i^Q=(W_i^{UK})^{\mathsf T}W_i^Q$, 运行时直接得到 $\widetilde q_{t,i}=\widetilde W_i^Qh_t\in\mathbb R^{d_c}$. 分数变成 $\widetilde q_{t,i}^{\mathsf T}c_s^{KV}$. 历史位置无需恢复完整键. 值路径也可把上投影和注意力输出投影合并. 若拼接各头结果后乘 $W^O$, 则

$$
W^O\operatorname{Concat}_i\left(\sum_s a_{t,s,i}W_i^{UV}c_s^{KV}\right)
=\sum_i\sum_s a_{t,s,i}\widetilde W_i^{OV}c_s^{KV},
$$

其中 $\widetilde W_i^{OV}$ 是 $W^O$ 对应分块与 $W_i^{UV}$ 的乘积. 因而缓存中始终只需 $c_s^{KV}$. 这里并不存在无条件的免费午餐: 点积从 $d_h$ 维变成 $d_c$ 维, V2 中是从 128 维增至 512 维. 每读一个历史 token, 每个查询头做的乘加更多了. 解码阶段通常受显存带宽限制, 少读几十倍数据换来四倍点积宽度依然划算; 预填充会一次处理许多 query, 更容易受计算量限制, 此时显式重建 K/V 并调用高效注意力核可能更好.

拿 60 层、128 头、头宽 128 做一次手算. MHA 每层每 token 保存 $2\times128\times128=32768$ 个数. MLA 保存 512 维潜向量与 64 维位置键, 共 576 个数, 元素数之比为 $576/32768=1.758\%$. 若二者都是 BF16, 仅缓存结构便缩小约 56.9 倍. 对 128K 序列, MLA 的 BF16 缓存是

$$
60\times131072\times576\times2\approx 9.06\times10^9\ \text{bytes},
$$

也就是约 8.44 GiB. MHA 则约 480 GiB. 前文拿 67B 的 8 个 KV 头作基线得到约 47 GiB, 属于另一种比较口径. 一个是「V2 若使用同头数 MHA」, 一个是「V2 对上一代 GQA 模型」. 两者都能回答问题, 却不能混成同一个缩减比例.

#### 6.3. RoPE 为何必须拆开

RoPE 对位置 $t$ 施加旋转矩阵 $R_t$. 标准形式的分数含有

$$
(R_tW_i^Qh_t)^{\mathsf T}(R_sW_i^Kh_s)
=h_t^{\mathsf T}(W_i^Q)^{\mathsf T}R_{s-t}W_i^Kh_s.
$$

相对位置来自 $R_t^{\mathsf T}R_s=R_{s-t}$. 若令 $W_i^K=W_i^{UK}W^{DKV}$, 旋转夹在 query 投影和键上投影之间. $R_sW_i^{UK}$ 随历史位置变化, 无法提前吸收到固定查询矩阵. 强行吸收会要求每个位置使用不同的参数矩阵, 也就失去了只缓存潜向量的意义.

V2 把查询和键各拆成内容路与位置路:

$$
q_{t,i}=[q_{t,i}^C;R_tq_{t,i}^R],\qquad
k_{s,i}=[k_{s,i}^C;R_sk_s^R].
$$

于是总分数为

$$
q_{t,i}^{\mathsf T}k_{s,i}
=(q_{t,i}^C)^{\mathsf T}k_{s,i}^C
+(q_{t,i}^R)^{\mathsf T}R_{s-t}k_s^R.
$$

第一项不带旋转, 可以走矩阵吸收; 第二项保留相对位置信息, 只缓存共享的 64 维 $R_sk_s^R$. 这是一种明确的容量分工: 512 维潜状态承担「这里写了什么」, 64 维位置键帮助判断「它离当前 token 多远」. 位置路在所有头之间共享键, 各头仍有自己的位置查询, 因而不同头可以用不同方式读取同一套位置坐标.

一个反例能说明为何不能把位置路删掉. 假设序列里出现两次完全相同的短语, 两处内容表示接近. 当前 token 需要引用最近一次. 只有内容点积时, 两处键可能给出近似分数; 相对旋转提供距离与次序线索, 才能系统地区分两次出现. 反过来, 若任务是一袋词分类, 位置本来无关, 64 维位置路的收益可能很小. 所以解耦 RoPE 的价值应在顺序、复制、指代与长距离检索任务上更明显, 这是可以单独做消融验证的预期.

#### 6.4. 查询压缩省的是训练激活

V2 还先把查询下投影到 1536 维潜表示, 经过 RMSNorm 后再生成各头查询. 查询只属于当前计算步骤, 不会为历史位置长期留在 KV cache 中, 因而它不参与前面的 576 维缓存公式. 它主要减少训练反向传播需要保留的中间激活, 并给 128 个查询头施加共享低秩约束.

可以用秩来理解: 若完整查询投影直接从 $d=5120$ 映到 $128\times128=16384$ 维, 其线性变换秩上限为 5120; 插入 1536 维瓶颈后, 合成矩阵秩上限降为 1536. 约束很强, 但每头仍能通过上投影选择潜空间的不同组合. 若把 $d_c'$ 继续降到几十维, 所有头会被迫围绕少数方向工作, 多头分工可能坍缩. 论文给出最终设置, 没有公布一条完整的 $d_c'$ 扫描曲线, 因而 1536 更适合看作在该规模上验证过的设计点, 还谈不上跨规模定律.

### 7. MoE 的容量、计算与路由

### 6.31. V3 的缓存预算与 FP8 误差

V3 延续 MLA，同时把更多矩阵乘放进 FP8 路径。FlashMLA 的 KV 量化因此需要同时满足缓存带宽与注意力误差约束。下面把两项放在同一数值链中分析。

### 7. MLA 与 V2 的继承账

V3 保留 $d_c=512$ 的 KV 潜向量和 64 维解耦 RoPE 键, 每层每 token 缓存 576 个元素. 61 层中首层是 Dense FFN, 注意力层数仍按 61 计算, 则每 token 缓存 35136 个元素. BF16 下约 68.6 KiB; 128K 单序列约 8.58 GiB. 若部署把缓存量化, 实占取决于位宽、尺度和对齐. 这条路线与 V2 几乎相同, V3 的主要结构创新落在路由与 MTP, 并未重新设计长上下文状态.

V3 的隐藏宽 7168, 128 个注意力头, 每头内容维 128, 位置维 64. 普通 MHA 若为每头缓存 128 维 K 与 128 维 V, 每层每 token 是 32768 个元素; MLA 的 576 是其 1.76%. 61 层、128K、BF16 的 MHA 缓存约 488 GiB, MLA 约 8.58 GiB. 这是假想同配置 MHA 对照, 不是论文实测部署差值.

MLA 的矩阵吸收仍要求内容 K/V 上投影为固定线性映射. 解耦位置键独立缓存, 避免 RoPE 旋转夹在可吸收矩阵之间. V3 使用更大隐藏宽度, 512 维公共潜变量相对隐藏状态的压缩比例从 V2 的 $512/5120=10\%$ 降到 $512/7168\approx7.14\%$. 若模型规模扩大需要保存更多独立历史特征, 固定 512 可能成为更强瓶颈; 正式结果说明它至少在 V3 数据和任务上仍可用, 报告未扫描 512、768、1024 的质量与缓存曲线.

MLA 与路由存在潜在交互. 注意力输出的微小变化可能让 token 跨过 Top-K 专家边界, 离散路由会放大表示差异. 可做四格实验: MHA 配 V2 路由、MLA 配 V2 路由、MHA 配无辅助损失路由、MLA 配无辅助损失路由. 若 MLA 在两套路由下的分数差相近, 两项改动近似独立; 若只在新路由下稳定, 说明偏置控制补偿了低秩表示对路由的扰动. 公开消融没有覆盖四格, 正式模型的总增益不能拆成简单加法.

### 8. FP8 混合精度到底混在哪里

#### 8.1. 动态范围与量化误差

FP8 用 8 个比特表示符号、指数和尾数. E4M3 提供更多尾数精度、较小动态范围, 常用于前向激活与权重; E5M2 指数更多、范围更大, 常用于梯度. V3 不是把全部状态粗暴改成 8 bit. 参数主副本、优化器状态、部分累加与敏感算子保留更高精度, 大矩阵乘的输入使用 FP8, 输出和归约按指定精度处理.

将张量 $x$ 量化前选尺度 $a$, 得到 $Q(x/a)$, 计算后再乘回尺度. 若整张矩阵共享尺度, 一个离群值会把 $a$ 拉大, 大部分普通元素挤在很少的离散档位上. V3 对激活采用 $1\times128$ tile-wise 量化, 对权重采用 $128\times128$ block-wise 量化. 每个小块拥有自己的尺度, 离群值只污染所在块.

举个简化例子. 一组 128 个激活中 127 个绝对值约 0.1, 一个值为 100. 若整层共享最大值尺度, 0.1 可能量化为零或极粗档位; tile 分组至少把影响限制在这 128 个值. 如果离群值分散到每个 tile, 局部量化也无能为力. 因而 FP8 成功依赖激活统计, 分组只能缩小离群影响范围, 无法消除所有误差.

#### 8.2. 累加精度与分块求和

两个长度为 $K$ 的向量做点积, 每项乘积有量化误差, 累加又会产生舍入误差. 若一直在低精度累加, 小项可能被大部分和吞掉. V3 在 Tensor Core 上以有限精度累加, 每隔 128 个乘积把部分和提升到 CUDA Core 的 FP32 寄存器, 再继续下一块. 可写为

$$
y=\sum_{j=1}^{K/128}\operatorname{FP32}\left(\sum_{k=128(j-1)+1}^{128j}\widehat x_k\widehat w_k\right).
$$

块内仍有低精度累加误差, 块间使用 FP32 避免误差随完整 $K$ 长度持续堆积. 代价是把部分和搬出 Tensor Core, 引入额外指令与数据移动. 报告的硬件建议希望未来 Tensor Core 原生支持更高精度累加, 正是为了去掉这段软件补偿.

#### 8.3. 哪些部件保持高精度

嵌入、输出头、MoE 门控、归一化和注意力相关的敏感操作并非全部采用同一种 FP8 路径. 优化器状态需要累积很小的更新, 仍保留 FP32; 权重主副本承担长期参数记忆, 不能只剩每步量化后的 8 bit 值. 通信中的部分张量也根据数值风险选 BF16 或 FP8. 所以「FP8 训练」描述的是主要 GEMM 数据路径, 不是模型文件和每个中间量都只有八位.

附录 B 用两个 16B 级模型训练 2T token 对比 BF16 与 FP8, 验证损失曲线高度接近, 下游分数也接近. 该证据支持方案在这一路径和规模上的数值稳定性. 正式 671B 模型没有一份从头到尾的 BF16 平行训练作对照, 成本太高. 若 FP8 误差只在训练很后期或更大规模累积, 小模型实验可能看不见; 正式训练无不可恢复尖峰则提供另一种稳定性证据, 但不等价于质量零损失.

#### 8.4. 可证伪的数值检查

最直接的检查是同一 checkpoint、同一 batch 同时跑 BF16 参考路径与 FP8 路径, 比较每层输出余弦相似度、最大绝对误差、梯度方向与最终 loss. 再按层深、专家、token 类型分桶. 若误差只在少数专家放大, 可能是那些专家权重存在离群块; 若随层数单调积累, 残差路径没有完全吸收量化噪声; 若训练开始稳定、学习率下降后反而恶化, 小更新可能低于量化分辨率.

另一个实验是固定训练 token, 分别采用全 BF16、仅权重 FP8、权重加激活 FP8、再加入 FP8 通信. 每步记录吞吐、显存和最终质量. 这样才能分清速度来自矩阵乘、通信带宽还是更大 batch. 报告给了整体方案与局部对照, 尚未公开这条完整阶梯.

### 9. Multi-Token Prediction 的目标函数
### 17. 路由负载的进一步手算

V3 每个 token 选择 8 个路由专家. 假设一个全局 batch 含 $T$ 个 token, 总分派次数为 $8T$, 256 个专家的平均负载为 $T/32$. 当 $T=16384$ 时, 平均每专家得到 512 次分派. 某专家收到 640 次, 过载率为 25%; 若容量严格按平均值配置, 多出的 128 次必须等待、转移或丢弃. 无辅助损失偏置的目标是让这种差距在容量约束生效前收敛.

随机均匀路由本身也不会让每个专家恰好收到 512 次. 若把每次选择近似看成独立伯努利事件, 单专家负载方差约为 $8T\cdot(1/256)(255/256)$, 标准差约 22.6. 640 次比均值高出约 5.7 个标准差, 很难由随机波动解释; 540 次却可能只是正常起伏. 控制器若对每一点微小偏差都用同样步长修正, 会追逐采样噪声, 因而实际负载统计通常需要在较大 token 集合或滑动窗口上观察.

节点层面也可复算. 若 256 个专家均匀放在 32 个节点, 每节点 8 个专家. 每 token 最多访问 4 个节点, 跨节点发送副本上限为 4, 节点内再分给若干专家. 若 Top-8 恰好在四个节点中各有两个, 没有替换; 若分散在八个节点, 至少四个全局高分专家会失去资格. 受限路由的真实代价取决于专家分数在节点上的聚集程度, 只报节点上限不足以推导质量损失.

共享专家始终激活, 不参与路由均衡. 它的流量等于整个 batch, 比任一路由专家的平均流量高约 32 倍. 训练系统可以专门放置或复制共享专家, 否则它会成为固定热点. decode 部署把共享专家视作必选路由专家并放到冗余卡上, 正是因为训练中的「逻辑共享」最终要落实为物理数据流.

### 18. FP8 误差怎样穿过残差网络

设某层理想输出为 $F(h)$, FP8 路径多出误差 $e$, 残差更新为 $h'=h+F(h)+e$. 下一层归一化会削弱整体尺度误差, 却不会自动消除方向误差. 若误差在各层近似独立、均值为零, 累积范数可能按层数平方根增长; 若量化偏差在某些通道方向一致, 则可能近似线性累积. 这也是逐层余弦相似度比只看最终 loss 更敏感的原因.

MoE 让误差传播多了一道离散门槛. FP8 扰动路由 logit 后, 排名第八与第九的专家可能交换. 专家函数差异较大时, 很小的 logit 误差会变成较大的输出变化. V3 将门控相关计算保留较高精度, 可以避免量化直接作用于这道边界; 专家内部 GEMM 使用 FP8, 其误差仍会进入残差. 一套针对性测试应分别量化门控、专家和注意力, 比较专家选择重合率.

缩放因子的估计也有时间维度. 当前 batch 的最大值若直接决定尺度, 偶发离群会让尺度剧烈跳动; 使用历史窗口或延迟缩放更平滑, 又可能跟不上分布突变. V3 的细粒度分组减少每个尺度覆盖的元素数, 让局部统计更贴近当前块. 若数据突然切换领域, 各专家激活分布变化, 缩放策略仍需及时响应.

训练稳定还要区分「不溢出」与「精度足够」. 一个 FP8 run 可以全程没有 NaN, 最终损失却稳定地比 BF16 高一点. 附录对照用于测后一种差异, 溢出日志用于测前一种故障. 二者缺一不可. 正式训练顺利完成证明数值范围受到控制, 小模型 BF16 对照则说明质量差在报告精度内很小.

### 19. MTP 的信息量视角

标准下一 token 损失估计条件熵 $H(X_{t+1}\mid X_{\le t})$. MTP 模块在拿到真实 $X_{t+1}$ 后估计 $H(X_{t+2}\mid X_{\le t+1})$. 从数据标签看, 每个位置多提供一个监督项; 从条件信息看, 第二项与把序列平移一位后的标准目标相似. 它的特殊之处在于额外目标通过独立模块回传到同一个较早的主干表示 $h_t$, 迫使 $h_t$ 对更远预测仍有用.

如果 MTP 模块容量过大, 它可能主要依靠真实 $x_{t+1}$ 的嵌入和自己的 Transformer block 完成预测, 回到主干的有效信号很弱. 模块太小又无法利用额外条件, MTP loss 居高不下. 消融不仅要比较最终基准, 还应测冻结主干后 MTP 头能学到多少, 以及切断 MTP 到主干的梯度后收益是否消失. 后者若仍有同样收益, 说明提升可能来自更多参数或训练扰动, 而非多 token 表示学习.

推测解码的接受概率还受采样设置影响. 贪心解码时, MTP 候选只要与主模型验证分布的最大概率 token 一致即可; 温度采样需要保持目标分布, 验收规则更复杂. 报告的 85% 到 90% 应连同任务分布、温度和验收算法理解. 长代码中局部语法强, 接受率可能较高; 开放写作的下一句分支多, 接受率可能下降.

若每轮验证两个位置的计算成本为普通一步的 $c$ 倍, 平均前进 $1+p$ 个 token, 理想加速是 $(1+p)/c$. 取 $p=0.85$, 若批量验证使 $c=1.2$, 上限约 1.54 倍; 若实现开销令 $c=1.6$, 只剩约 1.16 倍. 接受率是必要指标, 验证成本才决定最终速度.

### 20. 成本表还能推出什么