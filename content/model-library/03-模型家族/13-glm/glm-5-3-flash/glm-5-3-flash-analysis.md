---
title: "GLM-5.3-Flash: 线性注意力配稀疏注意力的 320B 多模态 MoE"
category: "模型库"
tags: ["GLM", "技术解析"]
published: true
excerpt: "GLM-5.3-Flash 是 GLM-5 系列第一个原生多模态模型, 320B 总参数里每 token 激活 18B. 45 层里 34 层是线性注意力, 11 层是带 IndexPool 的稀疏注意力, 每层平均的注意力计算和 KV cache 分别约为 GLM-5.3 的 1/3.0 和 1/4.4."
---
# GLM-5.3-Flash: 线性注意力配稀疏注意力的 320B 多模态 MoE

材料是 AutoClaw 博客 2026-09-25 的发布文章 「GLM-5.3-Flash: More Intelligence with Less Compute」, 同期 Z.ai 文档页内容基本相同, 结构细节取自 HuggingFace 上 `zai-org/GLM-5.3-Flash` 的 `config.json`. GLM-5.3 是 750B 档的模型, 1M 窗口下每层都要存 KV, 每层都要扫 indexer; Flash 要回答的是, 能不能在同样的 1M 窗口和接近的智能体能力下, 把推理成本降一个量级.

## 1. 规模与层排布

### 1.1. 规模: 和 GLM-4.5 比

博客拿来比规模的是 GLM-4.5 系列: 「Despite a similar total parameter count (320B vs. 355B), it nearly halves both the activated parameter count (18B vs. 32B) and the number of layers (45 vs. 92)」. GLM-4.5 论文给的是 355B 总参数, 32B 激活, 3 层稠密加 89 层 MoE. 按各自总参数折算, GLM-4.5 每 token 激活约 $32/355\approx9.0\%$, GLM-5.3-Flash 约 $18/320\approx5.6\%$. 这和 GLM-5 的方向一致: GLM-5 报告也是把层数减到 78, 加宽隐藏维, 理由是减少专家并行的通信开销.

`config.json` 补上了博客没写的维度: 隐藏维 4096, 64 个注意力头, 前 3 层是稠密 FFN (中间维 12288), 其余 42 层是 MoE, 每层 288 个路由专家加 1 个共享专家, 每 token 激活 8 个路由专家, 专家中间维 2048. 和 GLM-5 系列 (隐藏维 6144, 256 个路由专家) 比, Flash 隐藏维更窄, 专家数反而多了 32 个, 每个专家的形状不变, 稀疏度更高. 博客说这是从 「a new base model」 开始训的, 语料是 30T token 的多模态语料, 各模态占比没写.

### 1.2. GLM-5 当时为什么没用线性注意力

GLM-5 报告 (arXiv 2602.15763) 专门比过几种降低长上下文成本的方案, 最后选了 DSA. 不训练直接改结构时 (报告表 4), 固定交替的 SWA 在 8K 就跌到 54.02, 128K 只剩 6.51. 持续训练 190B token 后, 128K 上 RULER 相对基线的跌幅是: SWA 固定交替 30.35, GDN (Gated DeltaNet 混合) 11.28, SimpleGDN 8.25, 搜索出的 SWA 模式 5.69; SimpleGDN 在 RepoQA 128K 上跌 7.33. 报告的结论是这些方法在细粒度检索上都有固有损失. 详见 [GLM-5 技术报告解读](../glm-5/glm-5-analysis.md).

GLM-5.3-Flash 没有在线性和稀疏之间二选一, 而是两种都用: 线性层承担大部分层的成本, 少数稀疏层承担细粒度检索. GLM-5 实验里线性混合的问题出在检索, 而 Flash 的检索层是 DSA, 不是稠密的全注意力层. 这套组合在长上下文检索上究竟掉多少, 博客没有给 RULER 或 MRCR 一类的长上下文分数, 现在还看不出来.

### 1.3. 34 层线性, 11 层稀疏

架构图画的是一组 「×3 Linear Attention + MoE」 加 「×1 IndexPool Sparse Attention + MoE」, 但 45 不能被 4 整除. 配置里的 `layer_types` 给出了答案: 第 3, 7, 11, ..., 43 层是 `deepseek_sparse_attention`, 共 11 层; 其余 34 层是 `linear_attention`, 包括最后的第 44 层. 也就是 11 组「3 线性加 1 稀疏」, 末尾多一层线性. MTP 单列, `num_nextn_predict_layers: 1`, 不在 45 层里, 和 GLM-5 系列的计法相同.

博客对两种层的分工只有一句: 线性注意力 「captures local dependencies through state modeling」, 稀疏注意力 「retrieves relevant global context through a lightweight indexer」. 线性层把历史压进固定大小的状态, 近处的依赖容易保留, 远处精确的单 token 检索容易丢; 稀疏层保留完整的 KV, 按需挑出相关的块做精确注意力. 两者按 3:1 交替, 让多数层的成本不随上下文增长, 少数层负责长程检索.

### 1.4. 线性层: 状态大小固定

配置里线性层的参数放在 `linear_attn_config` 下: 64 个头, 头维 128, 短卷积核长 4, `gate_lower_bound: -5.0`, 层号列表的字段名是 `kda_layers`. 字段名指向 Kimi Delta Attention (KDA): 在 Gated DeltaNet 的基础上把头级标量遗忘门换成通道级的对角遗忘, 写入前先按 delta 规则擦掉当前键方向上的旧值, $q, k, v$ 先过短卷积. 机制和分块并行算法见 [Kimi Delta Attention](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md).

KDA 的状态递推是 (Kimi Linear 论文式 (1)):

$$
S_t=\left(I-\beta_t k_t k_t^\top\right)\mathrm{Diag}(\alpha_t)\,S_{t-1}+\beta_t k_t v_t^\top,\qquad o_t=S_t^\top q_t
\tag{1}
$$

$S_t\in\mathbb{R}^{d_k\times d_v}$ 是每个头的状态, $\alpha_t\in[0,1]^{d_k}$ 是逐通道的遗忘系数, 先让状态的每一行按自己的速度衰减; $\beta_t$ 是写入强度, $(I-\beta_tk_tk_t^\top)$ 先擦掉状态在 $k_t$ 方向上的旧值, 再写入 $k_tv_t^\top$. $k_t$ 做了 L2 归一化, $\beta_t=1$ 时写入后 $S_t^\top k_t=v_t$, 旧值被完全替换. 读出是 $S_t^\top q_t$, 不需要回看任何历史 token.

这个状态的容量有上限. $d_k=128$ 维空间里最多只有 128 个两两正交的键方向, 写入的键对超过这个数, 读一个键就会混进其它键的值. 上下文有几十万个 token, 状态只有 128 个正交方向, 精确检索某个很早的 token 必然有损失. 这是纯线性结构必须混入全注意力层的原因, 也是 Flash 保留 11 个稀疏层的原因.

对推理成本来说, 线性层的关键是状态大小和上下文长度无关. 每个头的状态是 $d_k\times d_v=128\times128$, 一层 64 个头约 105 万个元素, 34 层合计约 3,600 万个元素 (推导). 普通注意力层的 KV cache 随 token 数线性增长, 1M token 时远大于这个数. 解码每一步读写一次状态, 计算量是常数. 博客服务部分提到的 ReplaySSM 和节点内对线性注意力做张量并行, 都是针对这类层的推理优化.

### 1.5. 稀疏层: 不带 RoPE 的 MLA 加 indexer

11 个稀疏层的主注意力仍是 MLA: `kv_lora_rank: 512`, `q_lora_rank: 1536`, `qk_nope_head_dim: 256`, `v_head_dim: 256`, 而 `qk_rope_head_dim: 0`, `mla_use_nope: true`, 即 MLA 不带 RoPE, 每个 token 每层只缓存 512 维的潜在向量. GLM-5 系列的 MLA 有 64 维 RoPE 部分, 缓存是 576 维.

这个排法和 Kimi Linear 一致: 每 3 层 KDA 接 1 层 MLA, MLA 层不用位置编码, 位置信息全部交给 KDA 层的衰减和擦写. Kimi Linear 论文的消融里, MLA 层改用 RoPE 后长文本平均分从 54.5 降到 51.8, 解释是全局层再叠一层显式的相对位置信号, 会让它过于看重短程顺序; 去掉 RoPE 还有两个工程上的好处, 推理时 NoPE 的 MLA 可以转成 MQA, 扩上下文时也不用调 RoPE 的频率底数. GLM-5.3-Flash 在这个骨架上多了一步: MLA 层不做稠密注意力, 而是先由 indexer 挑块再做稀疏注意力. Z.ai 文档称它是 「the first open-source frontier model to combine sparse and linear attention」.

3:1 这个比例在 Kimi Linear 论文里是消融选出来的. 消融用的是 16 层, 16 头的小模型, 同样的 FLOPs 预算:

| KDA:MLA | 训练 PPL | 验证 PPL |
|---|---|---|
| 0:1 (全 MLA) | 9.45 | 5.77 |
| 1:1 | 9.29 | 5.66 |
| 3:1 | 9.23 | 5.65 |
| 7:1 | 9.23 | 5.70 |
| 15:1 | 9.34 | 5.82 |

7:1 训练 PPL 和 3:1 一样, 验证 PPL 变差; 1:1 验证 PPL 接近 3:1, 但全注意力层多一倍. 按这个比例训出的 Kimi Linear (48B 总参数, 3B 激活, 1.4T token) 在 MMLU-Pro 上 51.0 对 MLA 基线 47.2, 128K 长文本平均 54.5 对 52.2, KV cache 最多减少 75%. 这组数是 Kimi 在自己的模型上测的, 3:1 搬到 GLM-5.3-Flash 的规模和数据上是否仍然最优, Z.ai 没给消融. Kimi K3 (69 层 KDA 加 24 层 MLA) 也沿用了 3:1, 末尾同样多出一层, 只是多出的是 MLA, Flash 多出的是线性层.

### 1.6. IndexPool: 把 indexer 的键压到 1/4

DSA 出自 DeepSeek-V3.2. 它在 MLA 前面加一个 lightning indexer, 先给历史位置打分, 再让主注意力只在分数最高的 $k=2048$ 个位置上算. indexer 查询侧多头, 键侧单头共享, 不做 softmax, 也不取 value, 用 ReLU 代替 softmax 是为了吞吐, 可以用 FP8 算. V3.2 的 indexer 是两阶段训出来的: 先冻结主干做稠密预热, 用所有头注意力分数之和归一化成目标分布, 以 KL 散度让 indexer 的分布贴近它 (1000 步, 2.1B token); 再打开 top-k, 解冻全部参数, KL 只在选中集合上算, indexer 输入从计算图上 detach, 和语言建模损失互不传梯度 (943.7B token). GLM-5 系列沿用了这套结构, 见 [DeepSeek-V3.2 解析](../../01-deepseek/deepseek-v3-2/deepseek-v3-2-analysis.md).

indexer 给查询 $t$ 和每个前面的 token $s$ 打分:

$$
I_{t,s}=\sum_{j=1}^{H^I} w^I_{t,j}\,\mathrm{ReLU}\left(q^I_{t,j}\cdot k^I_s\right)
\tag{2}
$$

每个查询要和所有前面的键算一遍, 每层 $O(L^2)$, 是 1M 上下文下 indexer 延迟和显存的来源. 推导见 [QSA 一文的 DSA 与 IndexPool 部分](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/06-QSA-Qwen稀疏注意力/06-QSA-Qwen稀疏注意力.md). IndexPool 的做法是把相邻 4 个位置的 indexer 键加权池化成 1 个:

$$
\tilde k^I_b=\sum_{i=0}^{3}\omega_{b,i}\,k^I_{4b+i}
\tag{3}
$$

$\omega_{b,i}$ 是池化权重, 博客只说 「weighted pooling」, 权重怎么算没写; 式中按架构图的 「4x Pooling」 把相邻 4 个位置并成一组. 打分改成对池化后的键 $\tilde k^I_b$ 进行, 每个查询要扫的键从 $L$ 个降到 $L/4$ 个, indexer 键缓存也只剩 1/4. 架构图里 TopK 的输出叫 「KV Block Selection」, 选的是 KV 块, 主注意力再在选中块内的原始 KV 上算; 配置里 `index_kpool: 4`, `index_topk: 2048`, `index_kpool_always_select_tail: true`, 最后一项按字面是总把最近的尾部块选进来.

有两处细节博客和配置都没交代. 一是 `index_topk: 2048` 的单位: 如果按块计, 每个查询覆盖 $2048\times4=8192$ 个 token 位置; 如果按 token 计, 就是 512 个块 (推导). 二是 indexer 怎么训: V3.2 的 KL 目标定义在逐 token 的位置上, 池化后打分单位变成块, 目标分布要先在块内求和才能对上, 博客没说 IndexPool 用的是不是这个做法, 也没说 Flash 的 indexer 是从头和主干一起训, 还是像 V3.2 那样后加.

和 GLM-5.2 的 IndexShare 比, 两者从不同方向压 indexer. IndexShare 减少有 indexer 的层数 (78 层里 21 层), 每个 indexer 仍扫全部 $L$ 个键; IndexPool 不减层数, Flash 的 11 个稀疏层在配置里都是 `full`, 每层各有 indexer, 但每个只扫 $L/4$ 个键. 两种 indexer 的头数和头维都是 32 和 128, 按每个 token 一次前向的 indexer 点积次数算, GLM-5.3 是 $21L$, Flash 是 $11\times L/4=2.75L$, 约为前者的 1/7.6 (推导, 只算 indexer 打分, 不含主注意力).

### 1.7. 和 DeepSeek-V4 的 CSA 对照

DeepSeek-V4 的 CSA 也是 「每 4 个 token 并成 1 个」, 但并的对象不同. CSA 把主 KV 沿序列维压缩: 每 4 个 token 的 KV 用逐维 softmax 加权合成一个 512 维条目, 相邻条目的窗口有重叠, indexer 的键也按同样方式压缩, 再从压缩后的条目里挑 top-k (Pro 1024, Flash 512); 主注意力算在压缩条目上, 每个被选中的条目代表 4 个 token. 和 CSA 交错的 HCA 每 128 个 token 压成一条, 做稠密注意力. 两种层都没有固定大小的状态, 每层的 KV 都随长度增长, 只是增长得慢.

IndexPool 只压 indexer 的键, 被选中的块里主注意力仍在原始的逐 token KV 上算. 所以在 Flash 的稀疏层里, 「选哪里」 是粗粒度的, 「怎么算」 是逐 token 的; CSA 两步都是粗粒度的. 换来的代价是 Flash 稀疏层的主 KV 没有沿序列压缩, 每层每 token 仍存 512 维. 两家省 KV 的主要手段也不同: DeepSeek-V4 让每一层的 KV 都变少, Flash 让四分之三的层不存 KV. 第 2.2 节的 KV 图上 Flash 仍高于 DeepSeek-V4-Flash, 和这个差别一致. DeepSeek-V4 的结构见 [DeepSeek-V4 解析](../../01-deepseek/deepseek-v4/deepseek-v4-analysis.md).

## 2. mHC 残差与对 GLM-5.3 的效率

### 2.1. mHC: 4 路残差流

博客对 mHC 只有一句: 「adopts Manifold-Constrained Hyper-Connections (mHC) to further improve scaling efficiency」. 架构图上每个子层旁都有一个 mHC 框. 配置给了参数: `mhc: true`, `hc_mult: 4`, `hc_sinkhorn_iters: 20`, `hc_eps: 1e-06`.

mHC 出自 DeepSeek (arXiv 2512.24880). Hyper-Connections 把残差从一条 $C$ 维向量扩成 $n$ 条, 每层用小矩阵完成读, 写和流间混合; 问题是流间混合矩阵沿深度连乘, DeepSeek 在 27B MoE 上测到复合映射的最大增益峰值约 3000, 训练出现 loss 突刺. mHC 用 Sinkhorn-Knopp 迭代把混合矩阵投到双随机矩阵 (非负, 行和与列和都为 1) 上, 双随机矩阵的乘积仍是双随机矩阵, 迭代 20 次后复合增益最大约 1.6; $n=4$ 时额外训练时间 6.7%. GLM-5.3-Flash 的 $n=4$ 和 20 次迭代与 mHC 论文的默认设置相同. 推导见 [Hyper-Connections 与 mHC](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md). 

一层 mHC 写成 (mHC 论文式 (3)):

$$
\mathbf{x}_{l+1}=\mathcal{H}_{l}^{\mathrm{res}}\mathbf{x}_{l}+\mathcal{H}_{l}^{\mathrm{post}\,\top}\mathcal{F}\left(\mathcal{H}_{l}^{\mathrm{pre}}\mathbf{x}_{l},\mathcal{W}_{l}\right)
\tag{5}
$$

$\mathbf{x}_l\in\mathbb{R}^{n\times C}$ 是 $n$ 条残差流. $\mathcal{H}^{\mathrm{pre}}\in\mathbb{R}^{1\times n}$ 把 $n$ 条流读成子层的一个输入, 子层 $\mathcal{F}$ (注意力或 MoE) 仍只算一次; $\mathcal{H}^{\mathrm{post}}$ 把输出写回各条流; $\mathcal{H}^{\mathrm{res}}\in\mathbb{R}^{n\times n}$ 在流之间混合. 三个系数都由当前输入动态生成, 读写系数经 $\sigma$ 和 $2\sigma$ 保持非负, 混合矩阵经 Sinkhorn-Knopp 投到

$$
\mathcal{M}^{\mathrm{res}}=\left\{\mathcal{H}\in\mathbb{R}^{n\times n}\mid\mathcal{H}\mathbf{1}_{n}=\mathbf{1}_{n},\ \mathbf{1}_{n}^{\top}\mathcal{H}=\mathbf{1}_{n}^{\top},\ \mathcal{H}\geqslant 0\right\}
\tag{6}
$$

做法是先取 $\exp$ 得到正矩阵, 再交替做行归一和列归一. $n=1$ 时集合里只有标量 1, 式 (5) 退回普通残差. 对 Flash 来说, $n=4$, $C=4096$, 每个 token 在层间传递的残差状态是 $4\times4096=16384$ 维 (推导), 子层本身的宽度不变. mHC 论文给的代价是 $n=4$ 时每层残差维护的读约 $21C$, 写约 $13C$, 标准残差是 $2C$ 和 $C$, 靠融核和选择性重计算把训练额外时间压到 6.7%. 这部分访存在显存带宽受限的芯片上会更显眼, 但博客服务部分没有提到 mHC 的推理开销.

博客说的 「scaling efficiency」 指训练扩规模时的效率, 和第 2.2 到 2.4 节的推理成本是两件事, 博客没给 mHC 的单独数字. 同期的 DeepSeek-V4 也用了 mHC.

### 2.2. 和 GLM-5.3 比效率: 口径与数字

文档页交代了口径: 为了让不同规模的模型可比, 注意力计算按每头每层算, KV cache 按每层平均算 (BF16). 在这个口径下, GLM-5.3-Flash 相对 GLM-5.3 的注意力计算和 KV cache 分别降到约 1/3.0 和 1/4.4, 文档概述里写作 3.01× 和 4.44×. 两张折线图在 1M 处标的是 3.40× 和 3.80×, 和正文不一致, 取值方法博客没说明.

对比图里还有 DeepSeek-V4-Flash 和 Kimi-K3. 注意力计算一图里 GLM-5.3-Flash 全程最低, 1M 处目测约 5, GLM-5.3 约 17, Kimi-K3 的 Decode 和 Prefill 两条约 147 和 48. KV cache 一图里 1M 处目测 GLM-5.3 约 600, GLM-5.3-Flash 约 150, Kimi-K3 约 135, DeepSeek-V4-Flash 约 80. 纵轴没有单位, 这些读数只能比倍数. 博客承认 KV cache 「still slightly larger than Kimi-K3 and DeepSeek-V4-Flash」; 对 DeepSeek-V4-Flash 差了将近一倍, DeepSeek-V4 的 KV 是沿序列维压缩的.

### 2.3. KV cache 降在哪里

按配置可以粗估 KV 的来源. GLM-5.3 每层每 token 存 576 维的 MLA 潜在 KV, 21 个带 indexer 的层另存 128 维 indexer 键; Flash 只有 11 个稀疏层随 token 增长, 每层存 512 维潜在 KV 和池化后折合每 token 32 维的 indexer 键, 34 个线性层的状态大小固定. 1M 上下文下线性层状态可以忽略, 每层平均:

$$
\frac{(78\times576+21\times128)/78}{11\times(512+128/4)/45}=\frac{610.5}{133.0}\approx4.6
\tag{4}
$$

(推导, 假设 indexer 键和 KV 同为 BF16, 不计线性层状态和短卷积缓存.) 和文档的 4.4 同一量级. 拆开看, 「只有 11/45 的层有 KV」 贡献约 4.1 倍, MLA 去掉 RoPE 部分和 indexer 键池化再贡献约 1.1 倍. KV 的大头省在线性层上, IndexPool 主要省的是 indexer 的计算和延迟.

注意力计算的 3.0 倍没法用同样的方式粗估, 因为它包含稀疏层在 2048 个选中 token 上的主注意力, 线性层的状态更新, 和 indexer 打分三部分, 文档没给每头每层计算量的具体定义. 能确定的是, 随着上下文变长, GLM-5.3 里唯一随位置增长的是 indexer 打分, Flash 把这一项的点积次数压到约 1/7.6, 曲线的斜率因此低得多.

### 2.4. 省下的 KV 怎么变成吞吐

KV 比值不能直接当成解码加速倍数. Kimi Linear 论文给过同类结构的实测: 1M 上下文, batch 为 1 时, 解码只比 MLA 基线快约 2.3 倍, 来源是每步少读 KV; 省下的显存用来放更大的 batch 后, 每 token 输出时间是 1.84ms 对 11.48ms, 相差 6.3 倍, 摘要里写作 「最高约 6 倍」; 4K 到 16K 的 prefill 两者相当. 也就是说, 线性混合结构的收益集中在长上下文和高并发, 短上下文下不明显.

GLM-5.3-Flash 的博客没有给单请求延迟或不同上下文长度下的吞吐, 只给了 FlashX 标称 200 tokens/s 和服务栈相对自家基线 3 倍. 按 Kimi Linear 的实测类推, 在显存容量和带宽受限的国产芯片上, KV 降到 1/4.4 换来的主要是同一张卡能放下更大的 batch 和更长的上下文 (推导); 文档没有给这方面的数字, 这一类推无法核对.

## 3. 多模态, 评测与部署

### 3.1. 原生多模态

博客说 GLM-5.3-Flash 是 GLM-5 系列第一个原生多模态模型, 「原生」 指从预训练起就同时学文本和视觉, 博客说这样训出来的模型能读文档结构, 图表, 界面状态, 版面关系和操作反馈, 再用到后续的推理和执行里. 输入支持视频, 图像, 文本和文件, 输出是文本, 最大输出 128K token. 配置里的视觉编码器是 24 层 ViT, 隐藏维 1024, 16 头, patch 14, 图像边长 448, `spatial_merge_size: 2`, `temporal_patch_size: 2`, 输出投到 4096 维, 和语言模型隐藏维对齐. 视频按时间维每 2 帧合成一个 patch, 文件怎么处理配置里看不出来.

博客对视觉的定位是放进编码循环: 前端, 游戏, 3D 场景这类任务, 很多错误只有渲染, 交互或试玩后才暴露, 模型要能自己决定什么时候看, 看完怎么改. 训练上, 他们为视觉编程搭了数据合成流水线, 侧重视觉自评和推理阶段的迭代改进, 轨迹要求模型和环境交互, 检查自己的输出, 反复修改; 前端编程还试了带环境反馈的 RL, 用基于真实用户流程的智能体验证来加强界面判断. 博客把视觉反馈的用法分成几类: 文档和演示文稿上, 检查渲染后的页面, 看信息层级, 图表是否清楚, 图片裁切, 对齐和样式是否一致, 能发现文字溢出, 元素重叠这类问题; 数据分析上, 同时读数据和图, 检查图表是否传达了想要的结论, 数据口径是否前后一致; 产品和界面上, 观察网页或应用的当前状态, 把看到的问题转成体验分析和后续任务; 多步工作流里, 靠截图判断上一步操作是否成功, 再选下一步. 研究分析类任务还要求区分已知事实和假设. 文档列了 PPTX, PDF, DOCX, XLSX 交付物, 视频剪辑, Blender, Godot, CAD (build123d), Computer Use 等用法, 都没有配评测.

### 3.2. 评测

智能体基准只和 GLM-5.2 比:

| 基准 | GLM-5.3-Flash | GLM-5.2 |
|---|---|---|
| Terminal Bench 2.1 | 84.3 | 81.0 |
| DeepSWE v1.1 | 63.4 | 46.2 |
| NL2Repo | 56.3 | 48.9 |
| Toolathlon Verified | 78.4 | 59.9 |
| AutomationBench v1.0.6 | 48.8 | 26.2 |
| Agents' Last Exam | 26.3 | 20.4 |
| HLE with Tools | 55.3 | 54.7 |
| GDPval-AA v2 | 1773 | 1504 |

博客说这 8 项考的是规划, 工具调用, 利用环境反馈和多步执行, 并注明实际表现会随推理设置, 工具, 执行框架和评测环境变化; 每项用什么智能体框架, 最大轮数, 采样几次, 都没写. 8 项全部高于 GLM-5.2. 涨幅最大的是 AutomationBench (高 22.6), Toolathlon (高 18.5), DeepSWE (高 17.2); Terminal Bench 高 3.3 (相对 4.1%), HLE with Tools 只高 0.6. 和 GLM-5.3 博客对照, GLM-5.2 这一列有两格不同: ALE 这里是 20.4, GLM-5.3 博客是 23.8; GDPval-AA v2 这里是 1504, 那边是 1508. 两篇都没给 GLM-5.2 这两格的评测来源. 拿 Flash 和 GLM-5.3 的同名基准对照 (各自博客), Flash 的 Toolathlon 78.4 和 GDPval 1773 甚至高于 GLM-5.3 的 73.0 和 1769, DeepSWE 63.4 和 Terminal Bench 84.3 则低于 GLM-5.3 的 66.9 和 88.2; 两篇的评测设置是否一致, 博客没交代, 这组对照只作参考.

多模态表只有 Flash 自己一列: OfficeQA Pro 62.4, CharXiv Reasoning with Tools 89.4, Chartography with Tools 78.0, BabyVision 53.4, MVBench 77.8, MMVU 80.5, 没有对照模型. 文档另给了两个数: Artificial Analysis Intelligence Index v4.1.1 上得 57 分, 每任务 0.045 美元 (折扣价), 称这个水平以前要约 10 倍成本; 内部 Z.ai Code Bench v1.0 (Claude Code 2.1.207) 的 max 档, Flash 29.0, Claude Opus 4.8 29.5, GLM-5.3 在同一基准的 max 档是 34.5%. 基座模型的评测文档只给了结论: GLM-5.3-Flash-Base 整体超过 GLM-4.5-Base, 大部分基准上和 GLM-5-Base 相当.

### 3.3. 在国产 AI 芯片上服务

发布前, GLM-5.3-Flash 以 ox-alpha 的匿名身份在 OpenCode 和 OpenRouter 上收集反馈, 流量全部跑在国产 AI 芯片上. 文档说这些芯片主要受显存容量和带宽限制, 支持百万 token 上下文时更明显, 所以需要激进的显存优化, 包括用计算换带宽, 用通信换带宽. 推理引擎在 SGLang 上为这套结构专门开发, 文档还说开发中用了 GLM-5.3 驱动的基础设施智能体辅助写和调内核.

服务栈的组成有六项: 对线性注意力和 LM head 做节点内张量并行, ReplaySSM, W8A8 量化, INT8/FP8/BF16 混合缓存量化, Layer Split, 以及集群层的 Encode-Prefill-Decode (EPD) 分离. EPD 把多模态编码, 提示 prefill 和逐 token 解码拆成三个可以独立调度和扩缩的工作池, 文档说跑在数万张国产加速器上. 相对同一硬件上的初始基线, 端到端服务性能提升到 3 倍, 每 token 成本和硬件效率与主流 NVIDIA GPU 相当. 这个 3 倍是服务系统相对自家基线的提升, 和第 2.2 到 2.4 节的结构比值是两个层面的数, 不能相乘. ReplaySSM 和 Layer Split 文档没有解释, 芯片的厂商和型号也没写. 博客把效率归到架构, 多模态语料, 推理栈和底层硬件四者的联合设计, 不归到某一项技术.

权重以 MIT 许可证放在 HuggingFace, 配置里的 `quantization_config` 是 FP8 (E4M3, 动态激活量化, 按块缩放), 推理框架支持 SGLang, vLLM 和 TokenSpeed. API 名是 `glm-5.3-flash` 和 `glm-5.3-flashx`, FlashX 标称 200 tokens/s; 思考不能关, 推荐 temperature 1, top-p 0.95, `reasoning_effort` 设为 max. GLM Coding Plan 上 Flash 的可用额度是 GLM-5.3 的 3 倍. 发布当天模型已在 AutoClaw 里上线.

### 3.4. 结论与边界

GLM-5.3-Flash 把 GLM-5 系列的稀疏注意力和 Kimi Linear 式的 3:1 线性混合结构合到了一起: 34 层 KDA 式线性层负责让成本不随上下文增长, 11 层不带 RoPE 的 MLA 用带 IndexPool 的 indexer 挑块做精确的长程检索, 残差换成 mHC. 结果是每层平均 KV cache 和注意力计算约为 GLM-5.3 的 1/4.4 和 1/3.0, 智能体基准全面超过 GLM-5.2.

边界也比较清楚. 结构比值的取值口径只给了文字说明, 图和正文的数不一致; 智能体表只和 GLM-5.2 比, 和 GLM-5.3 的对照要跨博客拼; mHC 和 IndexPool 都没有消融, 3:1 的混合比直接沿用 Kimi Linear 的选择, 也没有在自己的规模上重新验证; GLM-5 当年否掉线性混合的理由是细粒度检索有损失, 这次却没有给 RULER 一类的长上下文检索分数; indexer 的训练方式和 `index_topk` 的单位都没写; 训练数据只有 30T 一个总数. 文档说正在把这套配方用到更大的模型上.

## 参考文献

1. AutoClaw Team. 「GLM-5.3-Flash: More Intelligence with Less Compute」. AutoClaw 博客, 2026-09-25, https://autoclaw.z.ai/blog/. 中英对照见 [glm-5-3-flash-bi](./glm-5-3-flash-bi.md).
2. Z.ai. 「GLM-5.3-Flash/FlashX」. Z.ai 开发者文档, https://docs.z.ai/guides/vlm/glm-5.3-flash.
3. Z.ai. `zai-org/GLM-5.3-Flash` 模型配置 `config.json`. HuggingFace, https://huggingface.co/zai-org/GLM-5.3-Flash.
4. GLM-4.5 Team. 「GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models」. arXiv:2508.06471, 2025.
5. DeepSeek-AI. 「mHC: Manifold-Constrained Hyper-Connections」. arXiv:2512.24880, 2025.
6. Kimi Team. 「Kimi Linear: An Expressive, Efficient Attention Architecture」. arXiv:2510.26692, 2025.
7. Aixin Liu, et al. 「DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models」. arXiv:2512.02556, 2025.
8. Yushi Bai, Qian Dong, Ting Jiang, et al. 「IndexCache: Accelerating Sparse Attention via Cross-Layer Index Reuse」. arXiv:2603.12201, 2026.
9. Aohan Zeng, Xin Lv, et al. 「GLM-5: from Vibe Coding to Agentic Engineering」. arXiv:2602.15763, 2026.
10. DeepSeek-AI. 「DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence」. arXiv:2606.19348, 2026.
