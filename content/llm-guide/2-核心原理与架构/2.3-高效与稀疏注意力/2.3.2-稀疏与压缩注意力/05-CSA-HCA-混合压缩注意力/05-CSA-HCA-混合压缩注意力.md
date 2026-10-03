---
title: "05 · CSA 与 HCA: DeepSeek-V4 沿序列压缩 KV"
published: true
tags: ["DeepSeek-V4", "CSA", "HCA", "DSA", "长上下文", "KV Cache"]
excerpt: "DeepSeek-V4 把 KV 沿序列维压缩后再做注意力: CSA 每 4 个 token 压成 1 个条目, 再用 lightning indexer 取 top-k; HCA 每 128 个 token 压成 1 个条目, 对全部条目做稠密注意力. 两种层交错排布, 加 128 token 的未压缩滑动窗口."
---
# CSA 与 HCA: DeepSeek-V4 沿序列压缩 KV

DeepSeek-V3.2 的 DSA 已经让核心注意力每个 query 只算 2048 个 token, 但 KV cache 里仍然存着每一个 token 的条目, indexer 也仍要扫过全部历史. 到 1M 长度, 这两项都随长度线性增长. DeepSeek-V4 ([DeepSeek-AI, 2026](https://arxiv.org/abs/2606.19348)) 换了一个维度: 先沿序列维把 KV 压缩, 让 cache 里的条目数变成原来的 $1/m$, 再在压缩后的条目上做注意力. 它设计了两种层, **CSA** (Compressed Sparse Attention) 和 **HCA** (Heavily Compressed Attention), 交错堆叠. 本篇讲这两种层的公式, 配置和推理系统上的改动; MLA 的低秩 KV 见 [2.2.2 的 MLA 篇](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/2.2.2-多头注意力变体.md), 整份 V4 报告的精读见 [DeepSeek-V4 解析](../../../../../model-library/03-模型家族/01-deepseek/deepseek-v4/deepseek-v4-analysis.md).

## 太长不看版

- CSA: 每 $m=4$ 个 token 压成 1 个 KV 条目. 每个条目由 8 个 token 加权得到 (本块 4 个和上一块 4 个, 相邻条目重叠 4 个), 权重是逐通道的 softmax. 压缩后用 lightning indexer 对压缩条目打分, 每个 query 取 top-k 个条目 (V4-Flash 512, V4-Pro 1024) 做核心注意力.
- HCA: 每 $m'=128$ 个 token 压成 1 个条目, 不重叠, 没有 indexer, 对全部压缩条目做稠密注意力. 1M token 只剩 8192 个条目.
- 两种层都是单个 KV 头的 MQA, 压缩条目同时当 key 和 value, 头维 $c=512$; 都附加一个 128 token 的未压缩滑动窗口分支; 都用可学习的 sink logit 加在 softmax 分母上 (式 (27)).
- 1M 上下文, V4-Pro 相对 V3.2 单 token 推理 FLOPs 是 27%, KV cache 是 10%; V4-Flash 是 10% 和 7% (报告 Figure 1 右). 相对 BF16, GQA8, 头维 128 的基线, KV cache 约 2%.
- CSA 的 top-k 选出的是压缩条目, 核心注意力除滑动窗口外看不到任何未压缩的 token, 这和 NSA 选择分支加载原始 token 不同.
- MRCR 1M 上 V4-Pro-Max 83.5, Claude Opus 4.6 是 92.9, Gemini 3.1 Pro 是 76.3 (报告 Table 6). 报告 Figure 9 显示 128K 以内检索稳定, 超过 128K 后下降.

---

## 1. V3.2 的 DSA 在 1M 上还剩什么

DSA 把注意力拆成两步. 第一步, lightning indexer 给 query $t$ 和每个历史 token $s$ 打分, 用少量 indexer 头, ReLU 激活, 低精度计算:

$$
I_{t,s}=\sum_{h=1}^{n_h^I} w^I_{t,h}\cdot \mathrm{ReLU}\bigl(\mathbf{q}^I_{t,h}\cdot \mathbf{k}^I_s\bigr). \tag{1}
$$

第二步, 取分数最高的 $k$ 个 token (V3.2 是 2048), 只对它们做 MLA 核心注意力. 核心注意力的成本从 $O(L^2)$ 降到 $O(Lk)$; indexer 仍是 $O(L^2)$, 只是常数小.

这个设计在 1M 长度上留下两项随长度线性增长的东西. 一是 KV cache: 每层每个 token 仍存一条 MLA latent 和一条 indexer key, 1M 长度就是每层 1M 条. 二是 indexer 扫描: decode 每一步, indexer 要和 1M 个 indexer key 做点积. DSA 减少的是「对谁做精确注意力」, 没有减少「存多少」和「扫多少」.

V4 报告 §2.3 的出发点是把这两项一起降下来: 沿序列维压缩 KV, cache 条目数和 indexer 扫描长度都变成 $n/m$. CSA 在压缩之后保留 DSA 的 top-k 选择, HCA 压得更狠, 直接放弃选择.

---

## 2. CSA: 4 合 1, 再选 top-k

### 2.1 两路条目与压缩权重

记输入隐状态 $H\in\mathbb{R}^{n\times d}$, $n$ 是序列长度, $d$ 是隐维. CSA 先算两路 KV 条目和对应的压缩权重, 形状都是 $n\times c$, $c$ 是头维:

$$
C^a=H W^{aKV},\quad C^b=H W^{bKV},\qquad Z^a=H W^{aZ},\quad Z^b=H W^{bZ}. \tag{2}
$$

四个矩阵都是 $d\times c$ 的可训参数. $C^a, C^b$ 是每个 token 的候选 KV 内容, $Z^a, Z^b$ 是每个 token 在每个通道上的压缩 logit.

### 2.2 重叠压缩

第 $i$ 个压缩条目由本块的 $a$ 路 ($m$ 个 token) 和上一块的 $b$ 路 ($m$ 个 token) 共同决定. 先把两段 logit 加上可学习的位置偏置 $B^a, B^b\in\mathbb{R}^{m\times c}$, 拼成 $2m$ 行, 沿行 (token) 方向做 softmax:

$$
\bigl[S^a_{mi:m(i+1)-1};\,S^b_{m(i-1):mi-1}\bigr]=\mathrm{Softmax}_{\text{row}}\Bigl(\bigl[Z^a_{mi:m(i+1)-1}+B^a;\;Z^b_{m(i-1):mi-1}+B^b\bigr]\Bigr), \tag{3}
$$

$$
C^{\text{Comp}}_i=\sum_{j=mi}^{m(i+1)-1} S^a_j\odot C^a_j+\sum_{j=m(i-1)}^{mi-1} S^b_j\odot C^b_j. \tag{4}
$$

$\odot$ 是逐元素乘. softmax 对每个通道独立地在 $2m$ 个 token 上归一化, 所以式 (4) 的每个通道都是这 $2m$ 个 token 在该通道上的一个凸组合, 不同通道可以把权重放在不同的 token 上. $i=0$ 时上一块不存在, $Z^b$ 用 $-\infty$ 填充, $C^b$ 用 0 填充.

用 $m=4$ 手算覆盖范围. 条目 $i$ 的 $a$ 路是 token $4i$ 到 $4i+3$, $b$ 路是 token $4i-4$ 到 $4i-1$:

| 条目 | $a$ 路 token | $b$ 路 token | 共 |
|---|---|---|---|
| 0 | 0–3 | 无 (填充) | 4 |
| 1 | 4–7 | 0–3 | 8 |
| 2 | 8–11 | 4–7 | 8 |
| 3 | 12–15 | 8–11 | 8 |

再用一个缩小的例子看式 (3)(4) 的数值. 取 $m=2$, 只看条目 1, 它由 $a$ 路 token 2, 3 和 $b$ 路 token 0, 1 组成, 位置偏置取 0, 头维取 2 个通道 (仅示意, 非训练所得):

| | token 2 ($a$) | token 3 ($a$) | token 0 ($b$) | token 1 ($b$) |
|---|---:|---:|---:|---:|
| 通道 1 的 logit $Z$ | 1 | 0 | 0 | 0 |
| 通道 1 的权重 $S$ | 0.475 | 0.175 | 0.175 | 0.175 |
| 通道 1 的值 $C$ | 2 | 4 | 1 | 3 |
| 通道 2 的 logit $Z$ | 0 | 0 | 0 | 2 |
| 通道 2 的权重 $S$ | 0.096 | 0.096 | 0.096 | 0.711 |
| 通道 2 的值 $C$ | 5 | 5 | 5 | $-1$ |

通道 1 的权重是 $e^1/(e^1+3)=0.475$ 和 $1/(e^1+3)=0.175$, 输出 $0.475\times2+0.175\times(4+1+3)=2.35$; 通道 2 的权重是 $1/(3+e^2)=0.096$ 和 $e^2/(3+e^2)=0.711$, 输出 $0.096\times15+0.711\times(-1)\approx0.73$. 同一个条目的两个通道, 一个主要取 token 2, 另一个主要取 token 1. 均值池化做不到这一点, 它对所有通道都给 4 个 token 相同的权重.

token 4 到 7 同时出现在条目 1 的 $a$ 路和条目 2 的 $b$ 路, 两路用的是不同的投影 ($W^{aKV}$ 与 $W^{bKV}$), 所以同一个 token 在相邻两个条目里贡献的内容不同. 每个条目看 8 个 token, 但条目数是 $n/4$, 序列长度压缩比仍是 $m$. 重叠的作用是块边界附近的 token 不会只被一个条目代表.

和前几篇的块摘要对比: [MoBA](../01-MoBA架构深度解析/01-MoBA架构深度解析.md) 的块摘要是块内 key 的均值, 只用于路由, 不进入注意力计算; [QSA](../06-QSA-Qwen稀疏注意力/06-QSA-Qwen稀疏注意力.md) 的 indexer key 也是均值池化, 同样只用于打分; CSA 的压缩条目是学出来的逐通道加权和, 并且直接作为核心注意力的 key 和 value.

### 2.3 Lightning indexer 在压缩条目上打分

indexer 的 key 用和式 (3)(4) 相同的压缩操作得到 $K^{\text{IComp}}\in\mathbb{R}^{\frac{n}{m}\times c^I}$, $c^I$ 是 indexer 头维. indexer 的 query 走低秩路径, 先降维再升维:

$$
\mathbf{c}^Q_t=\mathbf{h}_t W^{DQ},\qquad \mathbf{q}^I_t=[\mathbf{q}^I_{t,1};\ldots;\mathbf{q}^I_{t,n_h^I}]=\mathbf{c}^Q_t W^{IUQ}. \tag{5}
$$

$\mathbf{h}_t\in\mathbb{R}^d$ 是 token $t$ 的隐状态, $\mathbf{c}^Q_t\in\mathbb{R}^{d_c}$ 是 query 的压缩 latent, $n_h^I$ 是 indexer 头数. 这个 latent 也被核心注意力的 query 共用 (见式 (8)). 每个 indexer 头的权重 $w^I_{t,h}$ 来自 $\mathbf{w}^I_t=\mathbf{h}_t W^w$. query $t$ 对压缩块 $s$ 的分数是

$$
I_{t,s}=\sum_{h=1}^{n_h^I} w^I_{t,h}\cdot \mathrm{ReLU}\bigl(\mathbf{q}^I_{t,h}\cdot K^{\text{IComp}}_s\bigr),\qquad s<\Bigl\lfloor\frac{t}{m}\Bigr\rfloor, \tag{6}
$$

形式和式 (1) 相同, 只是 key 换成了压缩块. 条件 $s<\lfloor t/m\rfloor$ 表示只能给已经闭合的块打分. 序列最开头的几个 query 还没有任何闭合块, indexer 返回空集, 它们只能看滑动窗口分支 (见第 4 节); Hugging Face transformers 的 DeepSeek-V4 实现文档把这种情况写成 indexer 输出哨兵值 $-1$, 对应的掩码列全部为 $-\infty$. 然后取分数最高的 $k$ 个块:

$$
\mathcal{C}^{\text{SprsComp}}_t=\bigl\{C^{\text{Comp}}_s\;\big|\;I_{t,s}\in\mathrm{Top\text{-}k}(I_{t,:})\bigr\}. \tag{7}
$$

indexer 的扫描长度从 $t$ 变成 $t/4$. V4-Flash 和 V4-Pro 都用 $n_h^I=64$ 个 indexer 头, $c^I=128$; top-k 分别是 512 和 1024 (报告 §4.2.1). 每个条目覆盖 4 个 token 的序列长度, 512 个条目对应 2048 个 token 的跨度, 1024 个对应 4096 个. 报告 §2.3.4 说 V4 的 top-k 比 V3.2 小, 用来提高短中文本上的效率.

### 2.4 共享 KV 的 MQA

核心注意力是 MQA: 所有 query 头共享一份 KV, 而且每个压缩条目同时当 key 和 value. query 从同一个 latent $\mathbf{c}^Q_t$ 升维得到:

$$
\mathbf{q}_t=[\mathbf{q}_{t,1};\ldots;\mathbf{q}_{t,n_h}]=\mathbf{c}^Q_t W^{UQ},\qquad \mathbf{o}_{t,i}=\mathrm{CoreAttn}\bigl(\mathbf{q}_{t,i},\;\mathcal{C}^{\text{SprsComp}}_t,\;\mathcal{C}^{\text{SprsComp}}_t\bigr). \tag{8}
$$

$n_h$ 是 query 头数, $\mathbf{o}_{t,i}\in\mathbb{R}^c$ 是第 $i$ 个头的输出. key 和 value 是同一个向量, cache 里每个条目只存一份 $c$ 维向量, 这和 MLA decode 时在 latent 上做 MQA 的形状一致. V4 的头维 $c=512$, 比常见的 128 大四倍, 单个 KV 头的表达容量靠头维补回来.

### 2.5 分组输出投影

$n_h$ 个头的输出拼起来是 $c n_h$ 维. V4-Pro 是 $512\times128=65536$ 维, 直接投影到 $d=7168$ 需要 $65536\times7168\approx 4.70\times10^8$ 个参数, 每层每个 token 也要做这么多次乘加. 报告 §2.3.1 的做法是两级投影: 把 $n_h$ 个头分成 $g$ 组, 每组 $c\,n_h/g$ 维先投到 $d_g$ 维 ($d_g<c\,n_h/g$), 再把 $g$ 个 $d_g$ 维结果拼起来投到 $d$ 维.

按 §4.2.1 的配置算一遍参数量 (偏置忽略):

| | $c\,n_h$ | $g$ | 每组输入 → $d_g$ | 第二级 $g d_g\to d$ | 两级合计 | 直接投影 |
|---|---:|---:|---|---|---:|---:|
| V4-Pro | 65536 | 16 | 4096 → 1024 | 16384 → 7168 | $1.85\times10^8$ | $4.70\times10^8$ |
| V4-Flash | 32768 | 8 | 4096 → 1024 | 8192 → 4096 | $6.7\times10^7$ | $1.34\times10^8$ |

Pro 的输出投影降到直接投影的约 39%, Flash 降到 50%. 代价是第一级投影只在组内混合, 不同组的头要到第二级才交互.

---

## 3. HCA: 128 合 1, 稠密注意力

HCA 的压缩方式和 CSA 相同, 只有两处不同: 压缩率 $m'=128$, 远大于 $m$; 不做重叠. 每个 token 只算一路条目和权重:

$$
C=H W^{KV},\qquad Z=H W^{Z}, \tag{9}
$$

$$
S_{m'i:m'(i+1)-1}=\mathrm{Softmax}_{\text{row}}\bigl(Z_{m'i:m'(i+1)-1}+B\bigr),\qquad C^{\text{Comp}}_i=\sum_{j=m'i}^{m'(i+1)-1}S_j\odot C_j. \tag{10}
$$

$B\in\mathbb{R}^{m'\times c}$ 是位置偏置. 序列长度压到 $n/128$. 压缩之后 HCA 不用 indexer, query 对全部已闭合的压缩条目做 MQA:

$$
\mathbf{o}_{t,i}=\mathrm{CoreAttn}\bigl(\mathbf{q}_{t,i},\;C^{\text{Comp}},\;C^{\text{Comp}}\bigr). \tag{11}
$$

query 的生成 (低秩 latent 升维) 和分组输出投影与 CSA 相同. 1M token 压到 8192 个条目, 每个 query 对 8192 个条目做稠密注意力, 和一个 8K 上下文模型的注意力规模相当.

CSA 和 HCA 的分工可以从两个数字读出来. CSA 的条目粒度细 (4 个 token), 但只看 top-k 个, 剩下的 $n/4-k$ 个条目对该 query 不可见; HCA 的条目粒度粗 (128 个 token), 但每个 query 能看到全部条目. 一个 query 在 CSA 层里漏掉的块, 在 HCA 层里至少还有一个 128 token 粒度的摘要可以看到.

---

## 4. 两种层共用的四个细节

报告 §2.3.3 列了四项 CSA 和 HCA 都有的设计.

**query 和 KV 条目的 RMSNorm.** 在核心注意力之前, 对每个 query 头和唯一的 KV 头各做一次 RMSNorm, 防止注意力 logit 爆炸. 报告 §2.4 把这一点和优化器联系起来: 用 Muon 训练时, 已有工作用 QK-Clip 限制注意力 logit (报告引 Liu et al., 2025); V4 的注意力结构允许直接在 query 和 KV 条目上做 RMSNorm, logit 的尺度已被控制, 所以 V4 的 Muon 不再用 QK-Clip.
**Partial RoPE 和输出反旋转.** query 和 KV 条目只在最后 64 维施加 RoPE. 因为 KV 条目同时当 value, 核心注意力的输出是若干带旋转的条目的加权和, 输出向量的后 64 维会带上各条目的绝对位置. 为此, 报告对每个头输出的后 64 维再按 query 位置的相反数施加一次 RoPE. 记条目 $j$ 的位置为 $p_j$, 旋转矩阵为 $R(\cdot)$, 输出后 64 维是 $\sum_j s_j R(p_j)\,v_j$, 再乘 $R(-t)$ 得到 $\sum_j s_j R(p_j-t)\,v_j$, 每个条目对输出的贡献只依赖它和 query 之间的距离.

**滑动窗口分支.** 式 (6) 只允许 query 看已闭合的压缩块, query 自己所在块里的 token 在压缩分支里不可见. 而语言建模里最近的 token 通常最相关. 两种层都额外给每个 query 准备最近 $n_{\text{win}}$ 个未压缩 token 的 KV, 和压缩条目一起进入同一次核心注意力. V4 两个版本都取 $n_{\text{win}}=128$. HCA 一个块是 128 个 token, query 所在的未闭合块最多有 127 个 token, 窗口正好能覆盖.

**Attention sink.** 每个头有一个可学习的 sink logit $z'_h$, 它的指数加到 softmax 分母上:

$$
s_{h,i,j}=\frac{\exp(z_{h,i,j})}{\sum_k \exp(z_{h,i,k})+\exp(z'_h)}. \tag{12}
$$

$z_{h,i,j}$ 是头 $h$ 中 query $i$ 对第 $j$ 个前序 token 或压缩块的 logit. 分母多一项之后, 每行注意力权重之和可以小于 1, 甚至接近 0, query 找不到相关内容时不必把权重分给某个条目. 报告引的是 StreamingLLM 和 gpt-oss. 和 [07 StreamingLLM](../07-StreamingLLM与Attention-Sink/07-StreamingLLM与Attention-Sink.md) 的做法不同, 这里没有保留任何真实 token 当 sink, 只是一个每头一个的标量.

---

## 5. 层排布与配置

报告 §4.2.1 的配置:

| | V4-Flash | V4-Pro |
|---|---|---|
| 层数 / 隐维 $d$ | 43 / 4096 | 61 / 7168 |
| 前两层 | 纯滑动窗口注意力 | HCA |
| 其余层 | CSA 与 HCA 交错 | CSA 与 HCA 交错 |
| CSA 压缩率 $m$ / top-k | 4 / 512 | 4 / 1024 |
| indexer 头数 / 头维 | 64 / 128 | 64 / 128 |
| HCA 压缩率 $m'$ | 128 | 128 |
| query 头数 $n_h$ / 头维 $c$ | 64 / 512 | 128 / 512 |
| query latent $d_c$ | 1024 | 1536 |
| 输出投影组数 $g$ / $d_g$ | 8 / 1024 | 16 / 1024 |
| 滑动窗口 $n_{\text{win}}$ | 128 | 128 |
| 总参 / 激活 | 284B / 13B | 1.6T / 49B |

其余部分沿用 DeepSeekMoE 和 MTP, 残差换成 mHC, 优化器换成 Muon. 这些和注意力无关, 不在本篇展开.

---

## 6. 1M 上的成本

### 6.1 条目数

按配置手算 1M ($2^{20}=1048576$) token 时每层 cache 的条目数, 不计 indexer key 和数值精度:

| 层类型 | 压缩条目 | 窗口条目 | 每条维度 | 相对每 token 一条 |
|---|---:|---:|---:|---:|
| V3.2 MLA (DSA) | 1048576 | 0 | 576 (512 latent + 64 RoPE) | 1 |
| V4 CSA | 262144 | 128 | 512 | 1/4 |
| V4 HCA | 8192 | 128 | 512 | 1/128 |

CSA 和 HCA 交错时平均每层条目数约为 V3.2 的 $(1/4+1/128)/2\approx 13\%$. CSA 层另有 $n/4$ 条 128 维的 indexer key.

### 6.2 一个 query 实际算了什么

用 V4-Pro 的配置, 跟踪单个 query 在两个位置上的计算. 按式 (6), 位置 $t$ 的 query 在 CSA 层能打分的块数是 $\lfloor t/4\rfloor$; 在 HCA 层能看到的条目是已经闭合的 128 token 块, 个数 $\lfloor (t+1)/128\rfloor$. 两种层都再加最近 128 个未压缩 token.

**$t=1000$.** CSA 层可打分的块是 250 个, 少于 top-k 的 1024, 所以 top-k 把全部 250 个块都选上, indexer 的筛选不起作用, CSA 层退化成对全部压缩条目的稠密注意力, 核心注意力共 $250+128=378$ 个条目. HCA 层闭合块 7 个, 核心注意力 $7+128=135$ 个条目. 再往前, $t<127$ 时 HCA 层一个闭合块都没有, 而窗口本来就覆盖了全部前文, 这时 HCA 层和 CSA 层的输出都等价于一个 128 窗口内的稠密注意力加上 sink. 按同样的算法, V4-Pro 的 CSA 在 $t<4096$ 时, V4-Flash (top-k 512) 在 $t<2048$ 时都不发生实际的稀疏选择. 这时 indexer 的计算是纯开销, 报告选较小的 top-k 是为了让中等长度上的核心注意力条目数少一些.

**$t=2^{20}$ (1M).** CSA 层的 indexer 要给 262144 个块打分, 每个块 64 个头, 每头 128 维点积; 选出 1024 个条目, 加窗口共 1152 个条目进核心注意力, 每个条目对 128 个 query 头做 512 维点积. HCA 层没有 indexer, 核心注意力 $8192+128=8320$ 个条目. 和 V3.2 对比: V3.2 的 indexer 要扫 1048576 个 token, CSA 是它的 $1/4$; V3.2 的核心注意力取 2048 个 token, CSA 取 1024 个条目, HCA 取 8320 个条目. 也就是说, 1M 长度上 HCA 层的核心注意力条目数反而比 V3.2 的 DSA 多, 它省的是 indexer 和 cache, 不是核心注意力的条目数.

### 6.3 prefill

prefill 时所有 query 一起算. CSA 的 indexer 对每个 query 扫 $t/4$ 个块, 总计约 $n^2/8$ 次块打分, 仍是平方量级, 只是常数变成 DSA 的 $1/4$; 核心注意力每个 query 最多 $k+n_{\text{win}}$ 个条目, 总计 $O(n(k+n_{\text{win}}))$, 和长度成线性. HCA 每个 query 看 $t/128$ 个条目, 总计约 $n^2/256$, 也是平方量级但常数很小. 压缩本身是每个 token 一次投影加一次 $2m$ 或 $m'$ 元素的 softmax, 和长度成线性. 在 1M 这个长度上, 两种层剩下的平方项都来自「每个 query 扫一遍压缩后的序列」, 这一项在 QSA 里由微块压缩 indexer 处理, 在 V4 里由序列压缩处理, 两者的思路相近.

### 6.4 精度

报告 §2.3.4 还列了三项降成本的做法. KV 条目的 RoPE 维用 BF16, 其余维用 FP8, cache 大小比纯 BF16 少近一半. indexer 内部的注意力计算用 FP4. 后训练阶段做量化感知训练时, indexer 的 QK 路径整体用 FP4 (MXFP4) 缓存, 加载和相乘, index 分数从 FP32 降到 BF16, 报告 §5 称 top-k 选择器因此加速 2 倍, KV 条目召回率保持 99.7%.

### 6.5 报告给的总数

条目数, 精度和较小的 top-k 合起来, 报告 Figure 1 右图估算: 1M 上下文时, V4-Pro 单 token 推理 FLOPs (按等效 FP8 计) 是 V3.2 的 27%, 累计 KV cache 是 10%; V4-Flash 激活参数更少, 两项分别是 10% 和 7%. 以 BF16, GQA8, 头维 128 为基线, V4 的 KV cache 约为基线的 2%. 这些是报告的估算值, 不是实测吞吐.

Flash 的 7% 和 Pro 的 10% 可以用层数粗略对上. 两者的 CSA, HCA 和窗口配置相同, 每层压缩后的 cache 大小一样; Pro 有 61 个压缩注意力层, Flash 是 43 层减去前两层纯滑动窗口, 共 41 层. $41/61\approx0.67$, 乘以 10% 约等于 6.7%, 与 7% 一致. V3.2 沿用 V3 的 61 层, 和 Pro 层数相同, 所以 Pro 的 10% 基本就是每层 cache 的压缩比. 这一核对假设两个模型的 CSA 与 HCA 比例相同, 报告没有给出逐层的层类型表.

FLOPs 一项不能这样对. 单 token FLOPs 里除了注意力还有 MoE 和投影, Pro 激活 49B, Flash 激活 13B, 1M 长度上 Pro 的 27% 和 Flash 的 10% 差距主要来自激活参数, 不来自注意力结构.

---

## 7. 训练与系统上的改动

### 7.1 先稠密再稀疏

V4-Flash 的训练长度从 4K 逐步扩到 16K, 64K, 1M. 前 1T token 用稠密注意力预热, 长度到 64K 时引入稀疏注意力并保持到训练结束. 引入稀疏时先用一个短阶段只预热 CSA 的 lightning indexer, 然后再用稀疏注意力训练大部分步数 (报告 §4.2.2). V4-Pro 的稠密阶段更长, 引入稀疏的方式相同. 这和 V3.2 DSA 的「稠密预热 indexer, 再稀疏训练」是同一个两阶段骨架.

### 7.2 上下文并行

常规上下文并行 (CP) 按序列维切分, 每个 rank 持有连续 $s$ 个 token. 压缩带来两个问题: 训练样本由多条序列打包, 每条序列单独压缩, 末尾不足 $m$ 个的 token 被丢弃, 所以各 rank 压缩后的长度不同且小于 $s/m$; 一个压缩块需要连续 $m$ 个 token, 可能跨两个 rank. 报告 §3.4.3 用两阶段通信解决: 每个 rank 先把最后 $m$ 个未压缩条目发给下一个 rank, 下一个 rank 连同本地 $s$ 个条目压缩出固定 $s/m+1$ 个条目 (含填充); 再 all-gather 所有 rank 的压缩条目, 用一个融合的选择加填充算子整理成总长 $\text{cp\_size}\cdot s/m$ 的序列, 填充放在末尾.

### 7.3 推理侧 KV cache

混合注意力打破了 PagedAttention 的两个假设 (报告 §3.5.1): 不同层的 cache 长度和淘汰策略不同 (滑动窗口层只留最近 $n_{\text{win}}$ 个), 高性能 kernel 对块对齐有要求. V4 的做法是把 cache 分两部分:

- **经典 KV cache**: 存 CSA 和 HCA 的压缩条目. 每个 cache 块覆盖 $\mathrm{lcm}(m,m')=128$ 个原始 token, 产生 $128/4=32$ 个 CSA 条目和 $128/128=1$ 个 HCA 条目. 块内原始 token 数可以是 128 的任意倍数.
- **状态 cache**: 每个请求分配一个固定大小的块, 存滑动窗口的最近 $n_{\text{win}}$ 个 KV, 以及还没凑满一个压缩块的尾部 token 状态. 报告把它当成只依赖当前位置的序列状态管理, 和状态空间模型的状态同等对待. 尾部 token 必须连同隐状态一起保留, 因为式 (3)(4) 的压缩要等 $m$ 或 $m'$ 个 token 到齐才能执行.

kernel 一侧, 常规注意力 kernel 假设每个 cache 块有固定的 $B$ 个条目, 对应 CSA 的 $B\cdot m$ 个原始 token 和 HCA 的 $B\cdot m'$ 个. V4 用一个支持每层不同块内条目数的稀疏注意力 kernel, 和 cache 布局一起设计, 例如把块填充到对齐 cache line. 这样 CSA 层和 HCA 层可以共用同一套以 128 个原始 token 为单位的分配逻辑.

**磁盘前缀缓存** (§3.5.2): 压缩条目全部落盘, 命中前缀时直接读到最后一个完整压缩块, 尾部不完整块里的 token 需要重算. 滑动窗口 KV 每层都有且不压缩, 体积约为 CSA 和 HCA 压缩条目的 8 倍, 报告给了三种策略: 全部存 (零重算, 但写入量大, 读取只用一小部分); 每隔 $p$ 个 token 存一次最近 $n_{\text{win}}$ 个 (按 $p$ 在存储和重算之间折中); 完全不存, 命中时利用已缓存的压缩条目重算最后 $n_{\text{win}}\cdot L$ 个 token ($L$ 是层数), 因为每层窗口 KV 只依赖上一层最近 $n_{\text{win}}$ 个 token.

---

## 8. 长上下文效果

报告 §5.3 用 OpenAI MRCR 和 CorpusQA 测 1M 上下文 (Table 6, Table 7). MRCR 在一段很长的多轮对话里放入多个相似的请求, 要求模型按指定序号复现其中某一次的回答, 考的是在大量相似干扰里定位并原样取回内容; CorpusQA 是在大语料上的问答. 前一项对「远处 token 只以压缩形式存在」最敏感.

| 模型 | MRCR 1M (MMR) | CorpusQA 1M (ACC) |
|---|---:|---:|
| Claude Opus 4.6 Max | 92.9 | 71.7 |
| Gemini 3.1 Pro High | 76.3 | 53.8 |
| DS-V4-Pro Max | 83.5 | 62.0 |
| DS-V4-Pro High | 83.3 | 56.5 |
| DS-V4-Pro Non-Think | 44.7 | 35.6 |
| DS-V4-Flash Max | 78.7 | 60.5 |

V4-Pro 在两项上都高于 Gemini 3.1 Pro, 低于 Claude Opus 4.6. 报告 Figure 9 给出 MRCR 随长度的曲线: 128K 以内检索很稳定, 超过 128K 后可见下降. 非思考模式在两项上都低很多, 长上下文检索的分数受推理模式影响大, 不能只归到注意力结构上.

---

## 9. 和相邻方法的关系

| 方法 | 压缩了什么 | 选择单位 | 核心注意力看到什么 |
|---|---|---|---|
| MLA | 每个 token 的 KV 压成低维 latent | 不选择 | 全部 token 的 latent |
| DSA (V3.2) | 不压缩序列 | token | top-k 个原始 token |
| [NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) | 压缩分支把块压成摘要 | 块 | 压缩摘要 + top-n 个块的原始 token + 窗口 |
| [MoBA](../01-MoBA架构深度解析/01-MoBA架构深度解析.md) | 块均值只用于路由 | 块 | top-k 个块的原始 token |
| [QSA](../06-QSA-Qwen稀疏注意力/06-QSA-Qwen稀疏注意力.md) | indexer key 均值池化 | 微块 | 选中微块展开后的原始 token + 尾巴 |
| CSA | 序列 4 合 1, KV 本身被压缩 | 压缩条目 | top-k 个压缩条目 + 窗口 |
| HCA | 序列 128 合 1 | 不选择 | 全部压缩条目 + 窗口 |

这张表最后一列把 CSA 和其余块稀疏方法分开. NSA, MoBA, QSA 的块摘要只用来决定加载哪些块, 被选中的块以原始 token 精度参与注意力; CSA 和 HCA 里, 压缩条目本身就是 key 和 value, 原始精度只保留在 128 token 的窗口里. NSA 的压缩分支在这一点上和 HCA 更接近: 都是对全部压缩摘要做稠密注意力, 只是 NSA 用 MLP 压缩, HCA 用逐通道 softmax 加权.

压缩粒度上也能对比. NSA 论文的压缩分支块长 32, 步长 16, 相邻块重叠一半, 和 CSA 的「每个条目看 $2m$ 个 token, 步长 $m$」是同一种重叠方式; HCA 块长 128, 不重叠, 压缩率是 NSA 压缩分支的 8 倍. NSA 的窗口分支是 512 个 token, V4 的窗口只有 128 个, V4 用更短的原始精度窗口换更小的状态 cache. 这些数字来自不同规模和不同训练设置的模型, 只能说明设计取向, 不能直接比较效果.

---

## 10. 边界

1. **远处 token 只以压缩形式存在.** CSA 的条目是 8 个 token 的逐通道加权和, HCA 是 128 个. 需要逐字复现远处一长串内容的任务, 依赖压缩权重能否把该段信息保留在条目里. MRCR 曲线在 128K 以后下降, 和这一点一致, 但报告没有做把下降归因到压缩的消融.
2. **自己所在块不可见, 只靠窗口.** 式 (6) 的因果条件加上窗口 128, 意味着最近 128 个 token 以原始精度可见, 再往前就只剩压缩条目. 窗口大小和压缩率是绑定的.
3. **训练打包会丢尾巴.** 每条序列末尾不足 $m$ 或 $m'$ 的 token 在压缩分支里被丢弃 (§3.4.3), 短序列上 HCA 可能一个条目都没有, 只剩窗口.
4. **推理框架要专门支持.** 压缩条目, 窗口, indexer key 和尾部状态四种 cache 并存, 通用的分页 KV 管理器不能直接用. 报告为此重新设计了 cache 布局和稀疏 kernel.
5. **短上下文上 indexer 不起作用.** 按 6.2 节的计算, V4-Pro 在 4096 个 token 以内, V4-Flash 在 2048 个 token 以内, top-k 会选中全部压缩条目, indexer 的打分和排序只增加计算. 这一段长度上 CSA 的收益来自 4 合 1 压缩, 不来自稀疏选择.
6. **效率数字是估算.** 27% 和 10% 是 Figure 1 的单 token FLOPs 与累计 KV 估算, 不是端到端吞吐或延迟.

## 参考文献

1. DeepSeek-AI. (2026). [DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence](https://arxiv.org/abs/2606.19348). arXiv:2606.19348. §2.3 式 (9)–(27), §2.3.4, §2.4 (QK-Clip), §3.4.3, §3.5.1–3.5.2, §4.2.1–4.2.2, §5 (QAT), Table 6–7, Figure 1, Figure 9. 开源推理实现: [DeepSeek-V4-Pro/inference](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/tree/main/inference).
2. DeepSeek-AI. (2025). [DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models](https://arxiv.org/abs/2512.02556). arXiv:2512.02556. DSA 与 lightning indexer.
3. Yuan, J., et al. (2025). [Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089). arXiv:2502.11089.
4. Xiao, G., et al. (2024). [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453). *ICLR 2024*.
5. Hugging Face. [DeepSeek-V4 model documentation](https://huggingface.co/docs/transformers/model_doc/deepseek_v4). transformers 文档, 压缩块可见性与 indexer 哨兵值.
