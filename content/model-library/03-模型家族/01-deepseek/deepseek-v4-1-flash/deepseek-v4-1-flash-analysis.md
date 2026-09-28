# DeepSeek-V4.1-Flash: 每 token 890 字节的 global KV

来源: [DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression](https://arxiv.org/abs/2609.19969) (arXiv: 2609.19969, 2026-09-17).

本文大量引用了技术报告的表格和图片(受限于篇幅无法写进来)以及公式, 建议阅读的时候对照[原技术报告](https://arxiv.org/abs/2609.19969)观看。配套对照译稿见同目录的 bi 稿。

V4.1-Flash 是一个原生多模态的 MoE 模型, 骨干 552B 参数, 另挂 196B Engram 参数, 上下文 1M token. 报告的出发点是长程 Agent 的负载越来越偏输入: 工具调用一轮接一轮, 每轮都要 prefill, KV cache 要在 HBM, 主机内存和 SSD 之间存放与搬运. V4 用稀疏注意力压下了长序列的计算, 剩下的瓶颈变成 cache 的容量和带宽. V4.1 的回答分三层: 架构上用 **Causal Encoder-Decoder(CED)** 让 prefill 只激活 8B, decode 激活 16B, 再用 **CSA2** 的跨层复用把 global KV 压到每 token 890 字节; 精度上把主 KV 存成 **FP4**; 部署上用 **SWA Bounded Replay** 把 SWA KV 从持久化缓存里拿掉. 预训练吃了 45T 多模态 token. 后训练报告自己说没有算法创新, 增益几乎都来自任务合成与环境规模. 下面先从配置复算规模和 KV 字节, 再依次讲结构, 扩展模块, 优化器, 基础设施, 数据与日程, 后训练和评测协议.

## 1. 规模与 KV 账

### 1.1. 规模: 从配置复算 552B 和 16B

第 4.2.1 节给出配置: 40 层, 隐藏维 5120, 前 20 层是因果 encoder, 后 20 层是 decoder. 每层 MoE 有 1 个共享专家加 384 个路由专家, 专家中间维 2304, 每 token 激活 6 个路由专家. 按 SwiGLU 三个矩阵算, 每个专家约 3540 万参数, 每层 385 个专家, 40 层合计约 545B(推导). 注意力侧 64 个查询头, 每头 512 维, 查询压缩维 1280, 输出分 8 组, 每组中间维 1024, 再加 32 头 × 128 维的 indexer 查询投影, 每层约 1.3 亿参数, 40 层约 5.3B(推导). 两者相加约 550B, 再加嵌入与输出头, 与 552B 对得上. 词表大小本页没有给, 这一项按前作的量级估.

激活参数也能复算. 每 token 走 7 个专家, 40 层约 9.9B, 加上约 5.3B 注意力和约 0.7B 输出头, 约 16B, 对应 decode 的 16B; prefill 在 CED 下只跑 encoder 的 20 层, 专家约 5B, 注意力约 2.6B, 合起来约 8B(推导). 所以 「8B/16B」 不是两个模型, 是同一组权重在两个阶段走过的层数不同. Engram 的 196B 不计入激活, 因为它按 N-gram 查表, 不做矩阵乘. 表 1 把 V4.1-Flash-Base 的激活写成 「8B/16B」, 骨干 552B, 对照 V4-Flash-Base 的 13B/284B 和 V4-Pro-Base 的 49B/1.6T, 总参数大约是 Pro 的三分之一, 激活约四分之一.

### 1.2. 图 1(b): 四代模型的每 token global KV

图 1(b) 给出四代模型每 token 的 global KV 字节数: V1 为 389,120, V3.2 为 48,068, V4-Flash 为 3,514, V4.1-Flash 为 890. 图上标的倍数是 8.1×, 13.7× 和 3.9×, 正文把最后一段写成 「approximately 4-fold」, V1 到 V4.1 是 437 倍. 这几个数都能用各代的公开配置复算, 配置本身是页外信息. V1 的 67B 模型有 95 层, GQA 8 个 KV 头, 每头 128 维, K 和 V 各存 BF16, 每层 4096 字节, 95 层正好 389,120(推导). V3.2 按开源推理代码的 cache 布局(页外), 每层存一个 MLA 潜变量: 512 维 FP8 加 4 个 FP32 比例因子加 64 维 BF16 RoPE, 共 656 字节; 再加 indexer K 的 128 维 FP8 和一个比例因子, 共 132 字节; 每层 788 字节, 61 层正好 48,068(推导).

![报告 Figure 1(b): 四代模型每 token global KV 字节数——V1 389,120 → V3.2 48,068 → V4-Flash 3,514 → V4.1-Flash 890](images/p01-b.png)

这条曲线里, 每一代压的是不同的维度. 报告第 2.3 节把长上下文的 KV 成本拆成三个相乘因子: 条目大小, 序列维, 层维. V1 到 V3.2 主要压条目大小, 从多头 K/V 变成跨头共享的小潜变量, 机制见 [MLA](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与矩阵吸收/04-MLA-低秩潜变量与矩阵吸收.md), 与之对照的是 [GQA](../../../../llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/03-GQA-在性能与缓存之间折中/03-GQA-在性能与缓存之间折中.md) 减 KV 头的路线. V3.2 到 V4 压序列维, 每 m 个 token 压成一条, 见 [CSA-HCA](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md). V4 到 V4.1 压的是层维和精度. 图 1(b) 统计的是始终驻留 HBM 的 global KV, 不含 SWA KV, 后者长度固定, 与上下文无关.

### 1.3. 890 字节怎么来

报告没有写 890 的分解, 但可以从配置拼出来. 主 KV 条目是 512 维, 存成 E2M1 的 FP4, 每维 0.5 字节, 共 256 字节; 每 16 维配一个 E4M3 比例因子, 32 个, 共 32 字节; 一个条目 288 字节. indexer K 是 128 维, 按第 2.4.4 节说的 OCP 标准 MXFP4 存法, 64 字节数据加 4 个 E8M0 比例因子, 共 68 字节. 一组 global KV 条目合计 356 字节(推导). 接下来看有几组: encoder 后 18 层分三组, 每组只有第一层是 Full, 三个 Full 层各存一份, 压缩比 m=2, 所以每 token 摊 3 × 356 / 2 = 534 字节; decoder 20 层只有第一组第一层是 Full, 后四组的 Reindex 层复用最近 Full 层的主 KV 和 indexer K, 整个 decoder 只存一份, m=1, 每 token 356 字节. 534 + 356 = 890, 与报告一致(推导). 第 2.4.4 节提到 MXFP4 时紧跟在 indexer 的 FP4 QAT 之后, 这里据此假设 indexer K 用 MXFP4; 本页没有逐字写 indexer K 的比例因子布局.

这个分解说明了 V4.1 的压缩主要来自哪里. 38 个 CSA2 层里只有 4 层真正产生 global KV, 其余 34 层都在读别人的 cache; 精度从 V4 报告第 2.3 节的 「448 维 FP8 + 64 维 BF16 RoPE」(每条目 576 字节, 不计比例因子)降到 288 字节, 又减一半. V4-Flash 的 3,514 字节按报告没有给出的层排布无法逐项复算, 这里只用图上的数字. 按 890 字节算, 1M token 的请求在 HBM 里约占 890MB global KV(推导); SWA KV 每层只存 128 个窗口位置, 40 层合计是几 MB 量级, 与上下文长度无关(推断, SWA 条目的精确维度本页没有给).

## 2. 注意力: CED 与 CSA2

### 2.1. CED: 从 YOCO 借来的半网 prefill

CED 的灵感来自 **YOCO**(You Only Cache Once). YOCO 把网络分成 self-decoder 和 cross-decoder 两半, 下半层用高效注意力产出一份 global KV, 上半层全部通过交叉注意力复用这一份, 于是 prefill 走完下半层就可以提前退出. CED 做了两处改动. 第一, decoder 的 global KV 条目 $C_l$ 和压缩权重 $Z_l$ 不来自本层隐状态 $H_l$, 而是由 encoder 末层 $H_{L/2}$ 经层相关投影得到, 见式 (1):

$$
C_l=H_{L/2}W_l^{KV},\qquad Z_l=H_{L/2}W_l^{Z},\qquad l>\frac{L}{2}.
$$

右边只有 $H_{L/2}$ 一个输入, 不含任何 decoder 层的隐状态, 所以 prefill 算完第 20 层就能把 decoder 需要的 global KV 全部投影出来, 不用跑 decoder 的 20 层. 投影权重 $W_l^{KV}$, $W_l^{Z}$ 按层独立, 保留了一定的 cache 容量. 配合 CSA2, decoder 里只有第一个 Full 层真的执行这个投影并落盘, 其余层复用它, 这就是第 1.3 节里 decoder 只存一份 356 字节的原因. 第二, SWA 在每一层都照常从本层隐状态算局部 K 和 V, 局部 KV 的生成深度没有减少. 与 YOCO 的上半层完全不保留局部注意力相比, 这是最大的差别.

第二处改动带来一个代价: decoder 的 SWA KV 依赖 decoder 自己的隐状态, 要精确得到它, prefill 时 decoder 仍要多处理 $n_{\text{win}} \times L/2$ 个 token. 多轮对话里每轮 prompt 很短时, 这笔开销不可忽略. 报告引用 PowerAttention 的观察, SWA 实际的有效感受野远小于理论值 $n_{\text{win}} \times L/2$, 于是引入 Decoder SWA Bounded Replay, 只对 prompt 末尾 $n_{\text{win}}$ 个 token 做 decoder 的 SWA 计算, 细节在第 3.2.2 节. 整体上, $N \gg n_{\text{win}}$ 时 prefill 复杂度从 $O(NL)$ 降到 $O(NL/2 + n_{\text{win}} \times L/2) \approx O(NL/2)$. 按配置 $n_{\text{win}}=128$, $L/2=20$, 精确重建要 2560 个 token 的 decoder 前向, 有界回放只要 128 个, 少 20 倍(推导). CSA2 与 CED 结合时, decoder 里的 Full 层从 $H_{L/2}$ 算自己的 global KV, Reindex 和 Reuse 不变; 由于 decoder 只有一个 Full 层, CED 加 CSA2 的 decoder 在效果上也只 「cache 一次」, 这一点和 YOCO 殊途同归(推断).

### 2.2. CSA2 的三种模式和层排布

CSA2 给每个 CSA2 层静态指定三种模式之一(图 4). **Full** 走完整路径: 算本层主 KV 和 indexer Q, 从主 KV 投影出 indexer K, 打分选出新的 Top-K, 职责等同 V4 里一个完整的 CSA 层. **Reindex** 复用最近 Full 层的主 KV 与 indexer K, 用本层的 indexer Q 重新打分, 选出新的 Top-K. **Reuse** 连 Top-K 一起复用, 不算 indexer Q, 不打分, 直接做稀疏注意力. 三种模式都在本层算主 Q 和 SWA KV. cache 共享和索引复用因此解耦: Reindex 让被选中的条目可以逐层变化, 而存储仍是共享的. 

![报告 Figure 4: CSA2 的 Full / Reindex / Reuse 三种模式](images/p10-figure-4-three-operating-modes-of-csa2-the-modes-differ.png)

相关工作里, **IndexCache** 只复用 Top-K 索引, 省下 indexer 计算但省不了主 KV 存储; YOIO 全网共享一次路由, 报告认为会限制性能; HySparse 让稀疏层复用稠密层的 KV, 但仍保留全注意力层. 报告的判断是这些方法都没有同时覆盖三个维度.

第 4.2.1 节给出具体排布. encoder 前 2 层是纯 SWA; 其余 18 层 CSA2, 压缩比 $m=2$, 分三组每组 6 层, 每组 「1 Full + 5 Reuse」. decoder 20 层 CSA2, 压缩比 $m=1$, 即不压缩, 分五组每组 4 层: 第一组 「1 Full + 3 Reuse」, 后四组 「1 Reindex + 3 Reuse」. 所有 CSA2 层的 indexer 查询头 32 个, 头维 128, 稀疏注意力 top-k 取 512; SWA 窗口 128. 所以 decoder 里每个查询读 512 个 token 级条目, encoder 里读 512 个条目覆盖 1024 个 token 位置(推导). 与 V4 的 CSA 与 HCA 交错不同, V4.1 只用 CSA2, 没有 HCA; 38 个 CSA2 层里 Full 4 个, Reindex 4 个, Reuse 30 个(推导). 报告没有给这套排布的消融, 也没有说明为何 encoder 取 m=2, decoder 取 m=1.

### 2.3. 压缩器和 indexer 的简化

CSA2 在 V4 的 CSA 基础上做了两处简化. V4 的 CSA 在压缩比 m 下, 每个主 KV 条目由 2m 个原始条目生成, 相邻压缩条目的来源有重叠, 压缩时还加绝对位置编码标记这 2m 个位置. CSA2 去掉了重叠和绝对位置编码. 另外, CSA2 的 indexer K 直接从主 KV 条目投影得到, 不再像 CSA 那样另走一条从隐状态出发的压缩路径. 报告说这两处改动都简化了实现, 提高了训练效率, 但没有给质量上的消融数字.

indexer K 从主 KV 投影这一点, 和跨层复用是配套的. 如果 indexer K 有自己独立的压缩路径, Reindex 层要复用它就得额外存一份独立状态; 从主 KV 投影之后, 共享主 KV 与共享 indexer K 变成同一件事, 训练时的状态管理也更简单(推断). CSA2 把压缩比 1 的不压缩情形作为特例包含在内, decoder 用的正是这种特例, 这时 CSA2 在 decoder 里的行为接近 V3.2 的 DSA: token 级 indexer 选 Top-K, 再做稀疏注意力, 见 [稀疏注意力综述](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/03-稀疏注意力综述/03-稀疏注意力综述.md).

### 2.4. 分层稀疏 Indexer 与 decode 算力

跨层复用减少了 indexer 的调用次数, 但剩下的 indexer 仍要给全部因果可见的条目打分, 上下文极长时这仍是主要瓶颈. **Hierarchical Sparse Indexer** 只用于 CED 的 decoder: decoder 第一个 Full 层给全部位置打分, 选出自己的 Top-512, 同时做块级候选选择, 每块取块内最大分数, 选分数最高的块, 把这些块覆盖的位置收成候选池. 配置是最多 2048 个块, 每块 8 个位置, 候选池至多 16,384 个位置(图 5). 后面的 Reindex 层只在候选池里打分并选各自的 Top-512, Reuse 层不打分. 这个机制在后训练引入, 训练和推理用同一个候选池限制, 深层 indexer 是在推理时的搜索域上优化出来的.

![报告 Figure 5: 分层稀疏 Indexer 的块级候选选择](images/p11-figure-5-hierarchical-sparse-indexer-each-square.png)

可以算一下 1M 上下文时每个 decode token 的 indexer 打分次数. encoder 三个 Full 层各扫约 50 万条目(m=2), decoder 的 Full 层扫约 100 万, 四个 Reindex 层各扫 16,384, 合计约 257 万次; 如果 38 个 CSA2 层都独立打分, 是 18 × 50 万 + 20 × 100 万 = 2900 万次, 约 **11 倍**(推导). 图 2 用精度加权的 FLOPs 画单 token decode 算力, BF16, FP8, FP4 分别按 1, 0.5, 0.25 计. 读图, V4.1-Flash 在 4K 处约 20 GFLOPs, 1M 处约 25 GFLOPs, 与正文 「上下文放大 256 倍, decode FLOPs 只增加约 1/4」 一致; V4-Flash 从约 17 涨到约 60, 两条线在 100K 到 128K 之间相交(读图). 若 indexer 打分按每条目 32 × 128 次乘加, FP4 权重 0.25 计, 257 万次约合 5 GFLOPs, 与图上约 5 GFLOPs 的增量同一量级(推导). 短上下文时 V4.1 略高于 V4-Flash, 原因是它 decode 激活 16B, 多于 V4-Flash 的 13B.

![报告 Figure 2: 单 token decode FLOPs 随上下文的变化, V4.1 与 V4-Flash 在 100K–128K 处相交](images/p05-figure-2-single-token-decode-flops-versus-context.png)

## 3. 架构扩展, 量化与优化器

### 3.1. Single-Pass mHC 与 Mega-mHC

V4 引入的 mHC 在相邻块之间维护 n 条残差流, 更新式为 $X_{l+1} = B_l X_l + C_l \mathcal{F}(A_l X_l)$, 系数由 $X_l$ 预测, 机制见 [mHC](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md). 理想情况下, 两块之间的残差变换只需读 $(n+1)d$, 写 $(n+1)d$, 激活内存流量下界是 $(2n+2)d$. V4 的实现拆成残差更新, 系数预测, 输入混合三个顺序执行的内核, 加上 pre-norm, 总流量 $(4n+4)d$, 是下界的两倍. 其中残差更新和系数预测可以共用一次遍历, 但输入混合要等全部隐藏维归约完才拿得到 $A_l$, 必须第二次读 $X_l$, 两遍实现是 $(3n+2)d$.

**Single-Pass mHC** 把输入混合系数错后一块: 块 l 用上一块预测的 $A_{l-1}$, 式 (6):

$$
X_{l+1}=B_lX_l+C_l\mathcal{F}_l(A_{l-1}X_l),\qquad (A_l,B_l,C_l)=\mathcal{H}(X_l).
$$

和原式 $X_{l+1}=B_lX_l+C_l\mathcal{F}_l(A_lX_l)$ 比, 只有 $\mathcal{F}_l$ 的输入混合系数从 $A_l$ 换成 $A_{l-1}$. $A_l$ 要对 $X_l$ 的全部 $nd$ 个值归约才能得到, 原式里必须先扫完一遍 $X_l$ 算出 $A_l$, 再扫第二遍做 $A_lX_l$; 换成 $A_{l-1}$ 后, 系数在进入块 l 之前就已知, 读 $X_l$ 的同一遍里既能做输入混合, 又能累加下一块要用的 $\mathcal{H}(X_l)$. $B_l$, $C_l$ 仍用本块的. 依赖一消失, $X_l$ 的每个 tile 可以同时用于输入混合和下一块的系数预测. 报告说这一错位带来的性能损失可以忽略. 

预训练保留原来的多内核实现, 部署时把残差更新, 输入混合, 系数预测, pre-norm 和 FP8 转换融进一个内核 **Mega-mHC**, 残差读一次写一次, 达到 $(2n+2)d$. 配置里 n=4, 流量从 20d 降到 10d, 按 d=5120 是每 token 每块从 10.24 万个值降到 5.12 万个(推导). 报告没有给这项改动对端到端延迟的量化结果.

### 3.2. Engram: 196B 参数的条件记忆

**Engram** 是 DeepSeek 此前提出的条件记忆模块: 用局部 N-gram 作键, 经多头哈希索引一张大嵌入表, O(1) 查表, 再用上下文门控融进残差流. 它的原论文把这看成与 MoE 条件计算互补的另一条稀疏轴. V4.1 沿用原设计的 tokenizer 压缩, 多头哈希, 上下文门控和多分支融合, 改了两处: 去掉短因果卷积, 理由是收益不抵推理栈里增加的复杂度; 嵌入表改用动量更新加 Sinkhorn 均衡来优化(见下一节).

配置是 196B 参数平均分给两个模块, 每个模块 N-gram 阶数 {2, 3, 4}, 每阶 8 个哈希头, 每阶总嵌入维 2048, 每头索引一张约 16M 条目的表, 表大小取互不相同的素数. 按每头 2048 / 8 = 256 维算, 每模块 3 × 8 × 16M × 256 ≈ 98B, 两个模块约 196B, 与报告一致(推导). 嵌入表和 K/V 投影都用 FP8, 两个模块全表约 196GB(推导). 模块放在第 1 层和第 14 层(从 0 计数), 都在 encoder 里, 理由是平衡训练流水线各阶段的显存. 推理时寻址只取决于输入 token, 可以提前经后台 RDMA 从主机内存预取, 第一个模块的预取与第一个 Transformer 块的计算重叠. 学习率乘 5. 报告没有给 Engram 在 V4.1 上的单独消融.

### 3.3. DSpark 取代 MTP

V4.1 在骨干预训练阶段去掉了 MTP 模块, 改用 **DSpark** 做投机解码. DSpark 的起草器是 3 个 Transformer 块, 滑动窗口 128, 一次前向并行算出 5 个起草位置的基础 logits, 再用一个轻量 Markov 头建模起草 token 之间的依赖. 一个置信度头预测每个位置的条件接受概率, 由此估计前缀存活概率; 调度器把这些估计和实测的引擎吞吐曲线结合, 为每个请求动态选验证长度, 目标是当前负载下系统总吞吐最大. 投机解码的一般原理见 [投机解码](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/01-投机解码原理与应用.md).

训练方式和 V3 的 MTP 不同. V3 的 [MTP](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP深度解析.md) 在整个预训练中与骨干联合训练, MTP 的损失也回传到骨干. DSpark 在预训练结束后单独一个阶段训练, 骨干冻结; 后训练期间继续和骨干一起训, 但 DSpark 的梯度不回传骨干. 这样 DSpark 能跟上策略的变化, 同时服务线上推理和 RL, OPD 的采样. 代价是骨干不再得到 MTP 那种额外的预测信号. 报告没有给 DSpark 的接受率, 加速比, 也没有给去掉 MTP 对 Base 质量的影响.

### 3.4. FP4 主 KV: 格式选择和动态范围

V4 已经对 indexer 的 Q 和 K 做 FP4 量化感知训练(QAT), 用的是 OCP 标准 MXFP4, 报告说选它是为了兼容尽量多的硬件, 尽管实验里别的格式精度更高. V4.1 把 QAT 扩到主 KV cache. 这里 FP4 省的是存储, 不是矩阵乘吞吐: cache 在注意力计算前反量化, 所以格式不必有原生矩阵乘支持, 可以选更准的. 在几种约 4 位的格式里, 报告选了 E2M1 元素加每 16 通道一个 E4M3 比例因子, 跟 NVFP4 一样, 但去掉了 NVFP4 的第二级全局比例因子. 与 MXFP4 相比, 这种格式的块更小, 比例因子带尾数位, 每元素摊 4.5 位, MXFP4 是 4.25 位; 一个离群值影响的邻居更少, 比例因子也不必取 2 的幂.

去掉全局比例因子的论证是数值上的. 这种格式能表示的最大幅值是 448 × 6 = 2688. V4.1 训练出的 RMSNorm 权重最大约为 1, RMS 归一化后 512 通道潜变量的 L2 范数至多约 √512; RoPE 保范数, 旋转后单通道最大绝对值也不超过约 22.6, 训练中实测最大幅值约 10. 2688 比 22.6 大一百多倍(推导), 所以省掉全局比例因子没有可测的精度损失, 还简化了 cache 布局. 量化放在 RoPE 之后: 放在 RoPE 之前精度只略好, 而且 decode 时要多一步开销. 非 RoPE 和 RoPE 部分用同一格式. SWA KV 对量化更敏感, 仍保留 FP8. QAT 在后训练引入. 相对 V4 的 FP8 主 KV, 报告说存储近乎减半, HBM 和卸到 SSD 都一样. FP8 训练的背景见 [FP8 混合精度训练](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.2-混合精度训练/02-FP8混合精度训练详解.md).

### 3.5. 优化器: head-wise Muon 与 Sinkhorn 均衡更新

V4.1 在 V4 的优化配置上改了两处. 第一, 查询和 key 权重用 **head-wise Muon**: 先按头切开再做 Muon 更新. 把 Muon 看成预条件梯度下降, 原版 Muon 对所有头用一个预条件器, head-wise 给每个头各一个, 能更好处理注意力头之间的异质性. 报告说 head-wise 优于原版, GLM-5 和 Kimi-K3 也验证过. Muon 本身见 [Muon](../../../../llm-guide/6-训练与推理优化/6.5-优化器/Muon/01-Muon优化器专题.md). 其余线性层, Engram 投影层和视觉语言投影器用 Muon; RMSNorm 权重和偏置, 比例因子等非矩阵参数用 AdamW($\beta_1=0.9$, $\beta_2=0.95$, $\varepsilon=10^{-20}$, 权重衰减 0.1). Muon 动量 0.95, 权重衰减 0.1, 更新矩阵的 RMS 调到 0.18 以复用 AdamW 的学习率.

第二, Engram 嵌入表, token 嵌入和输出头改用动量更新加 **Sinkhorn** 均衡(算法 1), 原因是给新增的 196B Engram 参数配 Adam 状态太占显存. 流程与 Muon 相同, 只是把 Newton-Schulz 正交化换成交替的行归一化与列归一化, 目标是式 (7):

$$
\Delta_t=\sqrt{n}\,D_r\widehat G_tD_c,\qquad \frac{1}{n}\sum_{j=1}^{n}(\Delta_t)_{ij}^2\approx1,\qquad \frac{1}{m}\sum_{i=1}^{m}(\Delta_t)_{ij}^2\approx1.
$$

$\widehat G_t$ 是 Nesterov 动量后的 $m\times n$ 更新矩阵, $D_r$, $D_c$ 是对角缩放, 只改每行每列的整体大小, 不改行内各元素的相对比例. 两个约束要求每行和每列的均方都接近 1: 一个很少出现的 N-gram 行不会因为梯度小而几乎不动, 一个被大量 token 共用的特征列也不会一步走太远. 和 Newton-Schulz 相比, 它不做正交化, 只做两个方向的尺度均衡, 所以只要维护两个比例向量. 

实现上奇数步归一化行, 偶数步归一化列, 共 K=11 步. 行对应一个 token 或一个 N-gram, 列对应一个隐藏特征, 这种结构正适合双向归一化. 由于 K 是奇数, 最后一步是行归一化, 每行 L2 范数精确为 1, 乘 $\sqrt{n}$ 后行 RMS 为 1(推导). 

行范数低于平均值 $\tau=10^{-3}$ 倍的近零行被屏蔽, 避免数值不稳. 学习率校正 $\gamma=0.18$, 接近 Moonlight 的 0.2. 这种更新只需一个动量缓冲, 报告说实测优于 Adam, 但没有给对比曲线. 视觉编码器在学习率衰减阶段之前冻结, 衰减开始时解冻, 以较小学习率与 LLM 联合训练.

## 4. 基础设施

### 4.1. 训练基础设施: 多模态, 跨层共享与 Engram

多模态训练有三项优化. 视觉编码器的对比学习阶段要跨数据并行 rank 做 all-gather; 由于文本特征的梯度只依赖收集来的视觉特征, 反之亦然, 视觉特征的 all-gather 可以藏在文本前向后面, 文本特征的 all-gather 藏在文本反向后面. 端到端并行采用解耦编码器设计: 视觉编码器复制在 LLM 参数树之外, 每步分成视觉前向, LLM 前后向, 视觉反向三段, LLM 段保持纯文本训练的并行策略. 长序列多模态样本按上下文并行 rank 均衡切分图像, 每张图只读一次. 报告给出加载能被计算隐藏的条件 $\rho < (B_{IO}/B_{GPU}) C$, 其中 $\rho$ 是每 token 原始字节, C 是每 token 计算量; 序列长度 N 在两边约掉, 所以只有每 token 计算量小的消融小模型才会受存储带宽限制.

CSA2 的跨层共享给流水线并行带来新问题: 共享注意力组件的层可能落在不同流水线阶段. 报告用三项设计解决. **Shadow indexer** 在每个参与阶段放一个轻量可执行副本, 共享参数只有一个逻辑属主负责优化和检查点, 副本靠参数同步和梯度聚合保持一致. 流水线载荷扩展把跨阶段需要的中间表示和稀疏路由信息并入已有的点对点通信, 按上下文并行一致切分. 微批级共享状态管理跟踪并发微批的状态, 在前向, 激活重算和反向之间协调生命周期, 最后一个消费者用完就释放. Engram 表按行切分到专门的进程组, 优化器状态再在副本间切分; 查表索引只依赖输入, 所以每步开始前整批预取, 预取和梯度回传与视觉编码器的计算重叠; Sinkhorn 归一化只维护行列比例向量, 不反复写整张归一化矩阵; RL 采样时 Engram 表常驻显存, 避免主机内存碎片导致的 OOM.

### 4.2. 推理系统与持久化 KV 管理

报告说 V4.1 的架构概念复杂, 内核流却很短. 借助 FlashMLA 里的 RoPE-注意力-RoPE-转换融合内核, DeepGEMM 里的 Mega-Gate, Mega-mHC, Mega-MoE, 以及 TileKernels 和 DeepSelect 的 TopK 内核, 绝大多数层(即 Reuse 模式的 CSA2 层)prefill 只需 15 个内核, decode 只需 11 个. 部署上采用 Encoder–Prefill–Decode(EPD)解耦, 视觉编码, prefill 和 decode 独立扩展并重叠执行.

持久化 KV 缩到 V4 的 1/8, 是两个因子相乘: 持久化缓存不再存 SWA KV, 体积近乎减半; 留下的 global KV 又经架构和精度压到 V4 的 1/4. V4 部署时 SWA KV 占了持久化缓存近一半容量; global KV 整段存, 命中即复用整个前缀; SWA KV 只在 prompt 末尾和输出末尾两个位置存, 用于重新生成和多轮会话. 为保命中率, V4 配了足够大的 SSD, 典型负载下两类 KV 都能驻留 72 小时以上. 

问题在于 SWA KV 的访问模式与长驻留策略不匹配: global KV 有长尾复用, SWA KV 只在活跃会话内分钟级复用, 会话结束或下一轮开始就失效. V4 报告提出过 Zero SWA Caching, 缺失时重算, 但精确恢复要对 $L \times n_{\text{win}}$ 个 token 做完整前向, 生产上代价过高. V4.1 于是把 SWA KV 移到每台机器 10% 主机 DRAM 组成的分布式内存池, TTL 只有几分钟, 过期立即回收给新会话; global KV 留在持久化缓存, 保证至少 72 小时.

### 4.3. SWA Bounded Replay: 用近似状态换存储

SWA 的依赖逐层累积, 精确重建 L 层的 SWA KV 需要回放 $L \times n_{\text{win}}$ 个 token. **SWA Bounded Replay** 只回放最近 $n_{\text{win}}$ 个 token, 并把 SWA 截断在回放段内: 回放从位置 s 开始时, 位置 i 的查询只看 $[\max(s, i-W+1), i]$ 内的 SWA key. 得到的状态是近似的. Encoder 侧, 命中 global KV 但缺 SWA KV 时, 回放已缓存前缀的最后 $n_{\text{win}}$ 个 token, 与未缓存的后缀一起处理; 回放 token 只重新生成 SWA KV, 复用已缓存的 global KV, 不重算也不覆盖; 后缀则同时生成 global KV 和 SWA KV. 按配置, 精确恢复要 40 × 128 = 5120 个 token 的前向, 有界回放只要 128 个, 少 40 倍(推导). 报告称这一设计把灾难性的 miss 变成代价很小的降级, 这是把 SWA KV 移出持久化缓存的前提.

近似的代价要讲清楚. 由于回放状态是近似的, 未缓存后缀算出的 global KV 和 SWA KV 取决于命中位置, 不同命中位置得到的结果在数学上并不相同. 也就是说, 同一段对话, 缓存命中与否会让模型看到略有差别的状态. Decoder 侧的有界回放是第 2.1 节说的那一路: 每次 prefill 回放 prompt 最后 $n_{\text{win}}$ 个 token, 把它们的 encoder 输出送过 decoder 各层, 得到的 decoder SWA KV 只用于 decode, 不进前缀缓存. 报告说两者对回答质量的影响可以忽略, 并在后训练中模拟同样的回放做适配; 但本页没有给出任何量化的质量对比数字, 第 6 节也把 SWA 状态重建列为尚未完全刻画的风险.

## 5. 预训练

### 5.1. 数据: 去隐式重复, 原生网页多模态, 7:1 配比

文本数据的思路是超越小规模实验反映的样本级质量, 更看重不同语料之间的信息增益互补. 报告设计了一条模型参数与训练数据的 Scaling 阶梯来指导大规模训练; 过滤信息增益有限的模型生成内容, 包括较弱模型的输出和低质量机器翻译, 把它们视为 「隐式重复」, 认为长训练周期下有害. 引入更多领域专家定义细粒度质量维度; 代码语料加入新开源仓库, 提交, 库和框架. 报告还提到在探索模型在环的数据迭代, 作为未来大规模合成数据的基础, 但没有给出比例.

多模态数据分图文对, 图文交错和领域数据三类. 报告的前提是原生网页已经含有丰富的多模态知识, 所以没有做大规模合成, 优先清洗并利用原生形态. 最初的爬虫偏向文本网页, 于是从 Common Crawl 重新引导以提高多模态覆盖. 图文对按相关性阈值过滤, 按图像语义去重; 交错数据主要来自网页和 PDF, 按成本递增分阶段处理: 先做启发式, 统计过滤, 去重和质量模型, 再组装成图文序列并做图像感知的二次过滤, 最后用 **SmolVLM** 严格打分; 被筛掉的文档部分回收成图文对. 领域数据补视觉定位, 指点, OCR 和长尾知识, 另收集大量图像-代码对和计算机使用轨迹. 文本与多模态两条流水取并集, 重叠样本用多模态版本替换并取两者较大的 epoch 数, 最终纯文本与多模态的 token 比为 7:1; 若按 45T 摊, 多模态约 5.6T(估算). 超长文档混合前确定性预切分, best-fit packing 的填充率至多 $10^{-4}$.

### 5.2. 视觉编码器: 两阶段训练与分辨率

**DeepSeek-ViT** 从零训练, 32 层, 隐藏维 1024, 16 个注意力头, patch 14. 为支持任意分辨率, 用 2D-RoPE 取代绝对位置编码; 为兼容 Muon, patch 嵌入的卷积换成线性投影; 归一化用 RMSNorm, 激活用 SwiGLU. 进入 LLM 前做 3 × 3 pixel-unshuffle, 视觉 token 数除以 9, 再经 2 层 MLP 投影器映射到 5120 维. 最大输入约 1344 × 1344, 即 96 × 96 = 9216 个 patch, 除以 9 得 1024 个视觉 token(推导). MoE 的负载均衡对图像和文本 token 各维护一套专家校正偏置, 选专家时用各自模态的偏置, 加权仍用原始路由分数, 两套偏置按各自负载独立更新, 更新速度都是 0.001; 另保留权重 0.0001 的序列级平衡损失. 无辅助损失均衡的基本机制见 [DeepSeekMoE](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md).

ViT 先单独训练两阶段. 对比预训练用 SigLIP 的 sigmoid 对比损失, 在约 47B 图文对上训, 输入最大 224 × 224, 即 256 个 patch(推导); 报告说这一阶段用更高分辨率虽有明显收益, 但对最终模型贡献很小, 因为下一阶段专门处理高分辨率. 自回归微调阶段把 ViT 接到一个 4B 的 MoE LLM 上, 用 next-token prediction 在 236B token 上训, 数据包括图像描述, alt 文本, 图表和 OCR, 分辨率限制在 544 × 544 到 1344 × 1344 之间, 对应约 160 到 1024 个视觉 token(推导). 训完丢掉 LLM, 只留 ViT 进入正式预训练, 分辨率策略保持不变. 多模态模型的一般结构见 [多模态](../../../../llm-guide/8-多模态/8-多模态.md).

### 5.3. 预训练日程与算力估算

第 4.2.2 节的日程是: batch 固定 100.6M token; 学习率前 2000 步线性预热, 之后保持 $2.6\times10^{-4}$ 直到 28T token; 28T 到 40T 按余弦降到 $2.6\times10^{-5}$; 40T 到 45T 保持这个低值. 稀疏注意力从 64K 序列长度从零开始训, 没有稠密注意力预热阶段; 34T token 时序列长度扩展到 1M. 训练全程没有不稳定. 与 V4 一样使用样本级注意力掩码. 对比 V3.2 需要先做稠密预热再切稀疏, V4.1 直接从稀疏起训, 说明 CSA2 的 indexer 可以和主干一起从零学(推断).

按固定 batch 算, 45T token 约 **44.7 万**步, 预热 2000 步约 0.2T token, 恒定学习率段占总 token 的约 62%(估算). 1M 扩展发生在余弦衰减段中间, 此后约 11T token 在允许 1M 序列的设置下训练(估算), 报告没有给各长度的数据占比. 训练时每个 token 仍经过全部 40 层计算损失, 所以按 16B 激活算, 训练算力约 6 × 16B × 45T ≈ **4.3e24** FLOPs, 不含注意力和 Engram 查表(估算); V4-Flash 按 13B 激活和 32T token 约 2.5e24, V4.1 约为它的 1.7 倍(估算). Scaling 的背景见 [Scaling Law](../../../../llm-guide/3-预训练/3.2-预训练全流程/3.2.6-Scaling-Law/3.2.6-Scaling-Law.md).

### 5.4. Base 评测: 表 1 与图 6

表 1 在内部框架, 同一设定下比较三个 Base 模型, 分差不超过 0.3 视为同档. V4.1-Flash-Base 领先或并列的格子: MMLU-Pro 74.1(Pro 73.5), BigCodeBench 60.6(Pro 59.2), HumanEval 79.4(Pro 76.8), GSM8K 93.0(Pro 92.6). 落后于 Pro 的格子也不少: SimpleQA-Verified 42.3 对 55.2, MultiLoKo 45.5 对 50.9, MATH 61.1 对 64.5, LongBench-V2 45.2 对 51.5, BBH 86.1 甚至低于 V4-Flash 的 86.9; MGSM 80.2 是三者最低, 比 V4-Flash 低 5.5 分. 知识类的 SimpleQA 恰好落在 V4-Flash 与 Pro 之间, 和总参数 284B, 552B, 1.6T 的排序一致, 说明事实记忆仍主要随总参数走(推断). 多模态格子只有 V4.1 有: MMMU-Pro 56.5, CVBench 77.9, DocVQA 95.6, RefCOCO-avg 86.0. 报告的 「世界知识与理解可比 Pro」 对 MMLU-Pro 和 SuperGPQA(53.1 对 53.9)成立, 对 SimpleQA 和长上下文不成立.

图 6 在内部 held-out 语料上比较 bits-per-byte, 语料来自日常研发: 内部文档, 私有代码库和学术材料. 读图, V4.1 在三项上分别为 0.564, 0.1443, 0.4305, V4-Flash 为 0.617, 0.1562, 0.4929, V4-Pro 为 0.59, 0.1494, 0.4677. 相对 V4-Flash 分别低 8.6%, 7.6%, 12.7%, 相对 Pro 低 4.4%, 3.4%, 8.0%(推导). 引言写的 「held-out 评测提升 5%–10%」 与哪个基线, 哪种算法都不完全吻合, 只能看作粗略概括. 这些语料是 DeepSeek 自己的研发材料, 训练数据又特意加入了新代码和学术内容, 所以图 6 更多反映数据分布上的贴合, 不能替代公开榜单.

![报告 Figure 6: 内部 held-out 语料上的 bits-per-byte 对比](images/p25-figure-6-bits-per-bytes-bpb-comparison-of-deepseek-v4.png)

## 6. 后训练与评测

### 6.1. 后训练: 任务合成, 环境与 DSec

第 5.1 节开宗明义: 这一版不引入新的后训练算法, 配方仍是 SFT, RL, 再接 On-Policy Distillation(OPD), 不超出 V4 开发中的成熟做法; 精力几乎全在 「训什么」 而不在 「怎么优化」. 每个任务被形式化为 「问题, 环境, 验证系统」 三元组, 按难度(任务不平凡)和正确性(三部分没有关键缺陷)评价, 并用这两维作奖励训练模型去构造更好的任务; 任务每进入一次新的 RL 跑次, 产生的轨迹又成为质量复审的证据. 

通用 Agent 流水鼓励内部员工和外部伙伴在日常工作中用最新模型, 自愿回传交互和反馈, 据此构造大量模拟工具, 并把收集到的负反馈和失败案例回放成单轮和多轮环境. 

编码 Agent 流水的来源是复杂或模型表现差的编码会话, 以及达到星数阈值的 GitHub 仓库; 多个专用 Agent 分工判断能否容器内构建与自动验证, 设计 fail-to-pass 和 pass-to-pass 评测点, 装依赖自测, 清除泄题痕迹, 再由独立质检 Agent 检查环境问题和可被投机利用的风险, 不过就交给修复 Agent. RL 部分见 [GRPO](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 和 [Agentic RL](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练.md).

RL 在两个方向上放大: 训练算力和 scaffold 数量. 跨 scaffold 训练时, rollout 拆成运行 scaffold 与工具的沙箱, 和一个与 scaffold 无关的控制层, 后者把异质交互归一成统一轨迹格式; 两者都跑在 **DSec** 上, 在可抢占的 GPU 训练池之外. 图 7 读图: 在 DeepSeek Harness 的 Minimal 模式下, 累计约 1900 步 RL(512K 上下文)把 DeepSWE v1.1 从约 57% 推到约 72%, 最后约 230 步把上下文扩到 1M, Terminal-Bench 3.0 从约 17% 升到约 27%. 曲线分成三段, 断点是模型合并后重新初始化的新跑次; 每次合并后输出 token 明显回落, 例如 DeepSWE 第二段开头从约 200k 回到约 150k, 随后一度降到约 100k, Pass@1 只掉了三四个点(读图), 对应报告说的合并同时提升任务表现和 token 效率. 

![报告 Figure 7: 累计 RL 步数与模型合并对代码 Agent 表现的影响](images/p27-figure-7-performance-improves-on-various-code-agent.png)

DSec 此时要支撑数百万并发沙箱: 计算节点分片, 用放松一致性的自研调度器替代 Kubernetes, 各节点自行做准入校验; 节点内用 sub-NUMA 分区, 单物理节点的并发活容器从约 1000 提升到 2500 以上; 时延敏感任务单独一类, 非敏感任务用 SCHED_IDLE, 并用 core scheduling 隔离超线程. 训练中 Agent 利用过 XFS 权限问题, AppArmor 非法内存访问, 包镜像服务泄露答案等漏洞, 还会删关键二进制甚至文件系统; 报告用逐沙箱 AppArmor 配置和 eBPF 网络策略防护, 环境崩溃按失败轨迹处理.

### 6.2. 可控推理力度 b

V4 的推理力度是 Non-think, High, Max 三个离散档. V4.1 改成标量 $b \in \{1, \ldots, 100\}$, 写进系统提示: 「Reasoning Effort: {effort} (range 1–100; higher values request more thorough reasoning)」. 每个训练 prompt 在每个力度档上采样多条响应, 相同 $(x, b)$ 构成子组, 组内奖励均值中心化后算组相对优势, 所以不同力度的响应不直接比较. 力度行为靠长度惩罚诱导: 式 (9) 的惩罚为 $-\min\{C_{\max}, k(b)\,\ell/L_{\text{norm}}\}$, 式 (10) 让系数 $k(b) = k_0 \exp(-(b-b_{\min})/\tau)$ 随力度指数衰减, b 每增加 τ, 系数乘 $e^{-1}$. 报告没有给 $k_0$, τ, λ, 训练用的力度档集合等具体数值. 推理能力与长度的一般讨论见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md).

附录 C 给出指数形式的动机. 对固定问题, 设 $p_x(\ell)$ 是花 ℓ 个推理 token 后的解出概率, 最优长度满足 $p_x'(\ell^*) = k(b)/L_{\text{norm}}$. 若边际收益近似指数衰减 $p_x'(\ell) \approx a_x e^{-\ell/s_x}$, 代入得 $\ell^* \approx C_x - s_x \log k_0 + (s_x/\tau)(b-b_{\min})$, 即偏好长度与力度局部呈仿射关系, 两档之差约为 $(s_x/\tau)(b_2-b_1)$. $k_0$ 管整体压短的力度, τ 管对力度的敏感度. 报告明确说这是局部的奖励层近似, 不主张实测平均长度必须线性或处处单调; 力度指令可能直接改变推理策略, Agent 轨迹轮数不同, 子组归一化也会改变优化强度, 而且推导假设惩罚上限未触发. 生产 API 于 2026 年 9 月上线, 暴露 max, high, low 三档, 分别对应 b=100, 75, 50(表 2).

### 6.3. 力度曲线: 前重的收益

图 9 显示, 力度从 25 拉到 100, 八项推理基准平均 Pass@1 从 67.1% 升到 76.3%, DeepSWE v1.1 从 66.0% 升到 74.2%, Terminal-Bench 2.1 从 82.4% 升到 90.6%, 输出 token 约变成 **2.5 倍**. 报告说收益前重: 60 到 80 已拿回最大档的大部分准确率, token 不到最大档一半; 从 80 冲到 100, Agent 轨迹再长 1.6 到 1.8 倍, 只换来边际提升. 单轮推理学到的力度控制也迁移到了长程 Agent 轨迹上, 管的是跨轮探索与验证的总量. 读图, Terminal-Bench 2.1 面板在力度 90 处约 91.8%, 高于力度 100 的 90.6%, 输出 token 约 48k 对约 88k(读图); 第 5.3.3 节说推理和软件工程任务上准确率随力度单调提升, 这一面板并不单调, 这与附录 C 的免责声明一致.

![报告 Figure 9: 推理力度与 Pass@1/输出长度的关系——收益前重](images/p35-figure-9-performance-and-output-length-as-a-function-of.png)

附录 B.2 的图 11 在三个编码 scaffold 上看力度: 轨迹长度随力度单调增长, Pass@1 只是松散跟随, 多数面板中间档有平台或回落. DeepSWE 上 Claude Code 曲线最平, 多花的 token 最少; DeepSeek Harness Minimal 起点最低, 涨得最多, token 也花得最多; mini-SWE 居中. Terminal-Bench 2.1 上三者挤在很窄的区间, 报告说任务接近饱和时, scaffold 的选择至少和力度档一样重要. 附录 B.3 的图 12 覆盖八项推理基准, 长度统一放大 2.0 到 3.1 倍, AIME 2026 从每响应约 4.6k 到 11.4k token, MathArena Apex 2025 从约 29.1k 到 86.1k; Apex 从 25.3% 升到 65.6%, 涨 40.3 分, AIME 2026 到 100%, 已饱和的 GPQA 只涨 1.3, LiveCodeBench 涨 2.6.

![报告 Figure 11: 三个编码 scaffold 上力度与轨迹长度/Patch@1 的关系](images/p49-figure-11-reasoning-effort-drives-trajectory-length.png)

![报告 Figure 12: 八项推理基准上力度驱动的长度与分数变化](images/p50-figure-12-performance-and-output-length-as-a-function.png)

### 6.4. 异步后训练基础设施与大规模 OPD

RL 的 rollout 长尾一直是训练效率瓶颈. V4.1 把 rollout 和训练放在同一批设备上分时执行, 每个任务设定在途样本数上限, 系统在整个 rollout 阶段维持这个上限. 派发粒度试过三种: 批级派发(开头多发几批, 每次迭代后补一整批)导致训练指标剧烈振荡; prompt 级派发(一个 GRPO 组完成后再发新 prompt)容易卡在组内的长尾样本上; 最终采用样本级派发, 新完成的样本数一达到下一个 prompt 的 GRPO 组大小就派发, 不管这些样本来自哪个组. 样本够了训练就抢占 rollout. 跨多个检查点生成的样本, 把各段 rollout 的专家路由拼接起来做 routing replay, 不丢弃重算. GRPO 的计算细节见 [GRPO 计算流程](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4-GRPO计算流程全解析.md).

异步生成有两个副作用. 一是长度分布偏差, 训练早期短样本先完成, 占满最初的 batch; 对策是按数据集限制并发, 间接控制稳态 batch 的来源比例, 并丢弃过早返回的短样本. 二是 off-policy 样本; 对策是调整派发和等待条件, 给最大 off-policy 比例设上限, 并对过时太多的 token 做 loss mask. 生成支持 token 级中断, KV cache 和专家路由按 token 粒度持久化, 换检查点后直接复用, 不用重新 prefill, 样本完成即回收其状态; 同一机制让训练作业能响应集群抢占而不丢进度. 后训练最后一步是全词表 OPD, 在所有领域数据上用 **40 个以上**教师, 教师可以来自不同开发阶段, 彼此架构不同, 也可以和学生架构不同; 训练中还会动态调整数据配比, 各数据集并发上限和启用的教师. V4 用的是十个以上教师, V4.1 把数量翻了几倍. OPD 的机制见 [OPD](../../../../llm-guide/4-后训练/4.6-OPD/01-OPD基础原理/01-OPD基础原理.md) 与 [On-Policy Distillation](../../../../llm-guide/4-后训练/4.4-对齐技术/On-Policy-Distillation深度解析.md).

### 6.5. 评测协议与表 3

推理类评测用温度和 top-p 都为 1.0. 编码 Agent 用 DeepSeek Harness 的 Minimal 模式, 1M 上下文, 温度 1.0, top-p 0.95; DeepSWE v1.1 按官方要求用 mini-SWE; SEC-Bench Pro 用 Claude Code, 因为它有会话压缩; 视觉 Agent 用 Claude Code, 512K 上下文; Agents' Last Exam 和 AutomationBench 用各自官方 scaffold. 为防评测被投机利用, 编码环境限网, 剥掉 Git 历史, 清空 Go 模块缓存, node_modules, 编译好的 .jar 和 Python pycache; 即便如此, 仍观察到寻找漏洞的行为, 例如在 CyberGym 中反编译 Ubuntu 核心包. 表 3 是 Max 力度下的主表, 所以所有分数都对应 b=100.

表 3 中 V4.1-Flash 的强项集中在 Agent: DeepSWE v1.1 74.2(V4-Flash 54.4, Opus-5 74.0, GPT-5.6 Sol 73.0), Terminal-Bench 2.1 90.6, AutomationBench 54.8, Agents' Last Exam 31.8, HLE 带工具 63.9, CyberGym 88.1, 都是表内最高. 推理类 Codeforces 3471, MathArena Apex 65.6 与 Kimi-K3 持平, GPQA Diamond 90.9 低于 V4-Pro 的 92.4; HLE 36.8, 纯文本子集 39.1, 低于 V4-Pro 的 42.7. 差距最大的是科学向和长程任务: Terminal-Bench 4.0 为 31.2 对 Opus-5 的 51.8, Terminal-Bench 3.0 为 30.0 对 43.3, ProgramBench 20.3 对 37.0, NL2Repo 65.4 对 75.3, SEC-Bench Pro 62.8 对 GPT-5.6 Sol 的 74.3, ExploitGym 15.3 对 33.7. 视觉 Agent 上 Chartography 78.9 低于 Opus-5 的 84.0 和 GPT 的 79.9, 高于 Kimi-K3 的 68.1. 

还有一处要对照 V4 报告: 表 3 给 V4-Pro 的 Codeforces 是 3348, GPQA 92.4, HLE 带工具 60.0, 而 V4 报告表 6 同一模型是 3206, 90.1, 48.2; V4-Flash 也从 3052, 88.1, 45.1 变成 3289, 89.9, 51.5. V4.1 报告没有说明前代分数为何变化, 可能是重新评测, 换了题集或换了检查点, 跨两份报告连着读分数时要注意口径不同.

### 6.6. Scaffold 稳健性与多智能体

表 4 固定检查点, 解码配置和任务集, 只换外围 harness, 覆盖 6 个 scaffold 家族的 8 种配置, DeepSWE 每题 8 次采样, Terminal-Bench 每题 3 次, 最多 500 轮. DeepSWE v1.1 上从 OpenCode 的 65.5 到 mini-SWE 的 74.2, 相差 8.7 分; Terminal-Bench 2.1 上从 Codex 的 84.1 到 DeepSeek Harness Minimal 的 90.6, 相差 6.5 分(推导). 表 5 显示 Claude Code 四个版本在 DeepSWE 上 68.4 到 69.8, 平均 68.9, Terminal-Bench 上 87.3 到 88.4, 平均 87.8, 表 4 报的 v2.1.251 不是挑出来的峰值. 报告把稳健性归因于合成数据里环境, 工具 schema 和交互格式的多样性; 不过 DeepSeek Harness Minimal 和 mini-SWE 这两个 「单 bash 工具」 配置在两项上都占了前两名, 工具最多的 Standard(26 个初始工具)和 PTC 反而更低, 报告没有讨论这一点.

第 5.3.5 节的多智能体实验标为初步. DeepSeek Harness 的 Agent Team 模式里, 主 Agent 用 spawn_teammate 异步创建队友, 队友共享一个仓库检出, 经持久化邮箱通信, 任务归属和依赖记在共享任务板上, 只有主 Agent 能打断队友. 训练奖励由任务表现, 鼓励分工与通信的协作奖励, 以及派生延迟惩罚组成; 派生延迟把执行事件和协作依赖建成有向无环图, 按 token 数和固定 prefill/decode 速率加实测工具时间计成本, 取关键路径长度. 

ProgramBench 的高置信子集只保留参考解通过率至少 95% 的题, 剩 172 道, 每题最多 3 次 rollout, 共 516 次. 多智能体的 Almost@1 从 1 小时截止的 13.59% 升到 8 小时峰值 30.04%, 单智能体从 12.79% 到 20.39%, 换成次数约 155 对 105 次 rollout(推导); FrontierSWE v2 无 GPU 子集上, 20 小时截止时多智能体 Mean@5 为 32.90%, 单智能体 28.20%(图 10). 这组实验比较的是各自最强的配置, 说明的是 TestingTime 多给墙钟时间和分工时的收益, 不能推出多智能体全面优于单智能体.

![报告 Figure 10: 多智能体 vs 单智能体在不同墙钟截止下的 Almost@1(FrontierSWE 子集 Mean@5 亦见图)](images/p36-deadline-per-rollout-wall-clock-hours-log-scale.png)

## 7. 局限与谱系位置

第 6 节承认两类风险. 一是新架构的稳健边界还没有完全刻画: CSA2 可能选错条目, SWA Bounded Replay 是近似重建, 在未测试的边界情况下可能伤害能力; 内部测试没有发现系统性退化, 但有限的测试集覆盖不了所有极端输入. 后续会重点压测长上下文下的稀疏检索和缓存恢复边界上的 SWA 重建. 二是标准基准日益饱和, 模型在日常应用上已接近文中点名的前沿闭源系统, 但最难的任务和边角案例仍有差距, 榜单分数接近不等于复杂高难推理能力对齐. 引言里 「能完成 95% 以上真实任务」 的说法, 本页没有给出任务集定义和统计方法.

放回 DeepSeek 家族里看, V4.1-Flash 接在 V4 之后, 继承了 CSA 的压缩稀疏注意力, mHC, Muon, 百万 token 上下文和多教师 OPD, 改动集中在三处. 结构上, CSA 与 HCA 的混合换成纯 CSA2, 加上 CED 和分层稀疏 Indexer, 把 KV 的压缩从条目和序列维推进到层维; 精度上主 KV 从 FP8 降到 FP4; 部署上 SWA KV 移出持久化缓存, 靠有界回放兜底. 此外首次原生多模态, 首次挂 Engram, 用 DSpark 取代 MTP, 力度从三档变成连续标量. 后训练则明确押在任务合成, 环境规模和 DSec 的沙箱密度上, 算法沿用 V4. 

从 V1 的 389,120 字节到 V4.1 的 890 字节, 每一代换一个维度压 KV, 这条线索比任何单项榜单更能说明这个家族的取舍.
