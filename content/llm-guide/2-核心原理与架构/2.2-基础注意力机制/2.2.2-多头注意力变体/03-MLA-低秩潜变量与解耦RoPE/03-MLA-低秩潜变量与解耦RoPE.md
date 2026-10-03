---
title: "03 · MLA: 低秩潜变量与解耦 RoPE"
published: true
tags: ["MLA", "Multi-head Latent Attention", "DeepSeek-V2", "KV-Cache", "RoPE", "低秩压缩"]
excerpt: "MLA 把每个 token 的 Key 和 Value 联合压缩成一个 $d_c$ 维潜变量, 缓存只存潜变量和一个 $d_h^R$ 维的共享 RoPE Key. DeepSeek-V2 配置下每 token 每层缓存 576 个元素, MHA 同头数要 32768 个. 位置编码通过解耦出的一小段维度携带, 内容部分保持与位置无关, 这样上投影矩阵才能在推理时被吸收."
---
# 03 MLA: 低秩潜变量与解耦 RoPE

MLA (Multi-head Latent Attention) 是 [DeepSeek-V2](https://arxiv.org/abs/2405.04434) 提出的注意力结构, DeepSeek-V3 沿用. 它要解决的问题和 [02 MQA 与 GQA](../02-MQA与GQA-共享KeyValue头/02-MQA与GQA-共享KeyValue头.md) 相同: Decode 每步都要从显存读整份 KV Cache. MQA 和 GQA 减少的是缓存的份数, 每份仍是完整的 $d_h$ 维; MLA 保留每个头各自的 Key 和 Value, 但它们都由同一个低维潜变量线性生成, 缓存只存这个潜变量.

低秩压缩和 RoPE 之间有冲突: 如果 Key 的内容部分带位置旋转, 推理时上投影矩阵就无法合并进 Query 一侧, 只能为全部历史 token 重新算 Key. MLA 的解法是把位置信息放到一段单独的维度里. 本篇讲压缩和解耦 RoPE 两部分, 以及它们带来的缓存量; 上投影矩阵怎样被吸收, 吸收和不吸收两种算法的计算量对比, 以及推理框架里的实现, 见 [04 MLA 矩阵吸收与工程实现](../04-MLA-矩阵吸收与工程实现/04-MLA-矩阵吸收与工程实现.md).

## 太长不看版

- 每个 token 先下投影成 $d_c$ 维潜变量 $c_t^{KV}$, 每个头的 Key 和 Value 由它上投影得到. 推理时只缓存 $c_t^{KV}$ 和一个各头共享的 $d_h^R$ 维 RoPE Key $k_t^R$.
- DeepSeek-V2: 60 层, $d=5120$, $n_h=128$, $d_h=128$, $d_c=512$, $d_c'=1536$, $d_h^R=64$. 每 token 每层缓存 $512+64=576$ 个元素, 同头数的 MHA 要 $2\times128\times128=32768$ 个, 约为 1.76%.
- 论文 Table 1 的口径: MLA 每 token 缓存 $(d_c+d_h^R)l\approx\frac{9}{2}d_hl$ 个元素, 等于 2.25 组的 GQA.
- RoPE 的冲突: 内容 Key 带旋转后, Query 与 Key 的上投影之间夹着一个随相对位置变化的旋转矩阵, 无法预先合并. 解耦 RoPE 让位置只走 $q^R$ 和 $k^R$ 这一小段.
- 论文 Table 9: 同架构 MoE 模型上 MLA 对 MHA, 缓存为 14% (约 16B 模型) 和 4% (约 250B 模型), 四个基准里七项更好, 一项 (小模型 C-Eval) 略低.

---

## 1. 问题: 在 GQA 之后还差什么

02 篇第 9 节引用的 DeepSeek-V2 附录 D.1 (Table 8) 给出了从头训练的对比. 7B 稠密模型, 1.33T token, 通过调层数把参数量对齐到约 7B:

| 基准 | MQA | GQA (8 组) | MHA |
|---|---|---|---|
| BBH (3-shot) | 33.2 | 35.6 | 37.0 |
| MMLU (5-shot) | 37.9 | 41.2 | 45.2 |
| C-Eval (5-shot) | 30.0 | 37.7 | 42.9 |
| CMMLU (5-shot) | 34.6 | 38.4 | 43.5 |

GQA-8 在 MMLU 上比 MHA 低 4 个点, C-Eval 低 5.2 个点. 这组结果说明, 在从头训练的 decoder-only 模型上, 减少 K/V 份数的代价不小. DeepSeek-V2 想要的是缓存比 GQA 更小, 质量不低于 MHA.

减少份数的方案里, 每份 K/V 都是一个完整的 $d_h$ 维向量, 份数少了, 不同头能用的 Key 子空间就少了 (02 篇第 2.4 节). 另一种思路是保留 $n_h$ 份, 但让它们由一个更低维的向量生成. MHA 每个 token 的 $2n_hd_h$ 个 Key/Value 元素都由同一个 $d$ 维的 $h_t$ 线性算出, 本来就有冗余: DeepSeek-V2 中 $2n_hd_h=32768$, 而 $d=5120$. 如果再引入一个 $d_c\ll d$ 的瓶颈, 让 Key 和 Value 都从瓶颈后的向量算出, 只缓存这个向量, 每 token 的缓存就从 $2n_hd_h$ 降到 $d_c$.

---

## 2. 记号

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

## 3. Key 和 Value 的联合低秩压缩

### 3.1 公式

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

### 3.2 缓存什么

推理时只要有 $c_j^{KV}$, 任何头的 $k_{j,i}^C$ 和 $v_{j,i}^C$ 都能用式 (4) 算出来, 所以缓存只存 $c_j^{KV}$, 每 token 每层 $d_c$ 个元素. 写缓存的开销也小: 每个新 token 只做一次 $5120\times512$ 的下投影, MHA 要做 $5120\times32768$ 的 K/V 投影才能写入. 论文还指出, 推理时 $W^{UK}$ 可以吸收进 Query 一侧, $W^{UV}$ 可以吸收进输出投影, 连 $k^C$ 和 $v^C$ 都不必显式算出. 这一点是 04 篇的主题, 这里只需要知道: 吸收能成立的前提是 $q$ 和 $k^C$ 之间只隔着与位置无关的固定矩阵.

### 3.3 秩的约束

式 (4) 意味着同一个 token 在所有头上的 Key 都是 $c_t^{KV}$ 的线性像. 把 $n_h$ 个头的 Key 拼起来, 得到的 $n_hd_h$ 维向量落在 $W^{UK}$ 的行空间里, 维度最多 $d_c$. 对比几种结构里「一个 token 所有头的 Key 拼起来」能张成的最大维度:

| 结构 | 所有头 Key 的最大维度 | 每 token 每层缓存 (元素) |
|---|---|---|
| MHA | $\min(d, n_hd_h)=5120$ | $2n_hd_h=32768$ |
| GQA, $G$ 组 | $Gd_h$ | $2Gd_h$ |
| MLA | $d_c=512$ | $d_c+d_h^R=576$ |

按这张表, MLA 的 Key 空间与 $G=4$ 的 GQA 同为 512 维, 但两者结构不同. GQA-4 里 32 个头读完全相同的 Key; MLA 里 128 个头各用自己的 $W_i^{UK}$ 从同一个 512 维空间里取出不同的 128 维投影, 每个头的 Key 都不同. 缓存上 GQA-4 每 token 每层要 $2\times4\times128=1024$ 个元素, MLA 是 576 个. 这张表只比较线性维度, 不能直接推出质量高低, 质量要看第 8 节的实验.

---

## 4. Query 的低秩压缩

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

## 5. RoPE 为什么和低秩压缩冲突

### 5.1 推导

DeepSeek-V2 沿用了 DeepSeek 67B 的 RoPE, 所以必须让低秩压缩和 RoPE 共存. RoPE 在第 $t$ 个位置把 Query 或 Key 乘上一个正交旋转矩阵 $R_t$, 满足 $R_tR_j^\top=R_{t-j}$, 打分只依赖相对位置 $t-j$ (见 [2.1.4 位置编码](../../../2.1-深度学习基础组件/2.1.4-位置编码/2.1.4-位置编码.md)). 假设直接对内容 Query 和内容 Key 施加 RoPE:

$$
q_{t,i}=c_t^QW_i^{UQ}R_t,\qquad k_{j,i}=c_j^{KV}W_i^{UK}R_j \tag{6}
$$

第 $i$ 个头对第 $j$ 个位置的打分是

$$
q_{t,i}k_{j,i}^\top=c_t^Q\,W_i^{UQ}\,R_tR_j^\top\,(W_i^{UK})^\top\,(c_j^{KV})^\top=c_t^Q\,\underbrace{W_i^{UQ}R_{t-j}(W_i^{UK})^\top}_{\text{随 }t-j\text{ 变化}}\,(c_j^{KV})^\top \tag{7}
$$

没有 RoPE 时, 中间那段是固定的 $W_i^{UQ}(W_i^{UK})^\top$, 可以预先乘好, 推理时 Query 乘上它就能直接和缓存里的 $c_j^{KV}$ 做点积. 有了 RoPE, 中间夹着 $R_{t-j}$. 矩阵乘法不满足交换律, $R_{t-j}$ 不能移到两边, 而 $t-j$ 对每个历史位置都不同, 无法用一个固定矩阵代替.

### 5.2 后果

剩下的办法只有一个: 每步对每个历史位置 $j$ 用式 (6) 重新算出 $k_{j,i}$, 也就是把全部前缀的 Key 重新上投影一遍再旋转. 论文的原话是这样会「significantly hinder the inference efficiency」. 缓存仍然只存 $c^{KV}$, 但每步的计算量随序列长度线性增长, 而且要显式生成 $n_h$ 个头的 Key, Decode 的访存优势也没了.

另一个办法是缓存旋转后的 $k_{j,i}$, 那就退回了 MHA 的缓存量.

第三个办法是为每个相对距离预先算一个矩阵 $W_i^{UQ}R_{\delta}(W_i^{UK})^\top$. 按 DeepSeek-V2 的形状, 每个头每个距离是 $1536\times512\approx78.6$ 万个元素, 128 个头就是约 1 亿个, 128K 个距离合计约 $1.3\times10^{13}$ 个, 远超模型本身的参数量. 三条路都不可接受.

---

## 6. 解耦 RoPE

### 6.1 公式

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

### 6.2 打分拆成两项

把式 (10) 代入点积:

$$
q_{t,i}k_{j,i}^\top=\underbrace{q_{t,i}^C(k_{j,i}^C)^\top}_{\text{内容项}}+\underbrace{q_{t,i}^R(k_j^R)^\top}_{\text{位置项}} \tag{12}
$$

内容项里没有旋转矩阵, 可以按 5.1 节的方式把 $W_i^{UQ}(W_i^{UK})^\top$ 预先合并, 直接与缓存的 $c_j^{KV}$ 做点积. 位置项里 $k_j^R$ 已经旋转过, 推理时直接缓存旋转后的结果; 每个历史 token 只有一份 $d_h^R$ 维, 128 个头共用, 读取方式与 MQA 相同.

位置项本身满足 RoPE 的相对位置性质. 设旋转前的向量为 $\tilde q_{t,i}^R$ 和 $\tilde k_j^R$, 则

$$
q_{t,i}^R(k_j^R)^\top=\tilde q_{t,i}^R\,R_tR_j^\top\,(\tilde k_j^R)^\top=\tilde q_{t,i}^R\,R_{t-j}\,(\tilde k_j^R)^\top \tag{13}
$$

只依赖 $t-j$. 这里不存在吸收问题, 因为 $k_j^R$ 本身就在缓存里, 不需要从潜变量还原.

Decode 每步读缓存时, 两项分别读两块: 内容项读 $t$ 个 512 维的 $c_j^{KV}$, 位置项读 $t$ 个 64 维的 $k_j^R$. 位置部分占缓存的 $64/576\approx11\%$. 两块在实现里通常拼成一个 576 维的向量连续存放, 一次读出, 打分时 Query 一侧也拼成 576 维, 一次点积同时算出两项之和.

### 6.3 缓存总量

每 token 每层缓存 $c_t^{KV}$ 和 $k_t^R$:

$$
\text{MLA 每 token 缓存}=(d_c+d_h^R)\,l \tag{14}
$$

DeepSeek-V2 取 $d_c=4d_h$, $d_h^R=d_h/2$, 所以 $(d_c+d_h^R)l=\frac{9}{2}d_hl$. GQA 每 token 缓存 $2n_gd_hl$, 令两者相等得 $n_g=2.25$. 这就是论文「等于 2.25 组 GQA」的来源.

### 6.4 $k^R$ 为什么只有一份

如果 $k^R$ 也像 $q^R$ 一样每个头一份, 每 token 每层的缓存就是 $d_c+n_hd_h^R=512+128\times64=8704$ 个元素, 是共享版本 576 的 15 倍, 压缩的大部分效果就没了. 共享一份 $k^R$, 位置项的缓存与头数无关. 各头之间的差异仍然可以通过各自的 $q_{t,i}^R$ 体现: 不同头用不同的 Query 去读同一份位置 Key, 这与 MQA 的做法相同, 只是 MQA 对整个 Key 这样做, MLA 只对位置这 64 维这样做.

承载位置信息的维度也变少了. RoPE 把向量两两配对, 每对用一个频率旋转. 标准做法里 128 维的头有 64 个频率, MLA 的位置部分只有 64 维, 即 32 个频率, 而且所有头共用同一份 $k^R$. 内容部分的 128 维完全不感知位置, 模型对位置的区分全部依靠这 32 个频率和各头的 $q^R$.

---

## 7. 手算

### 7.1 设置

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

### 7.2 位置项

RoPE 部分取二维, 旋转角 $\theta=\pi/2$ 每个位置. 设旋转前 $\tilde k_j^R=[1,0]$ 对所有 $j$ 相同, 当前位置 $t=3$ 的 $\tilde q_3^R=[1,0]$. 旋转 $j\theta$ 后 $k_1^R=[0,1]$, $k_2^R=[-1,0]$, $k_3^R=[0,-1]$, $q_3^R=[0,-1]$. 位置项为 $q_3^R(k_j^R)^\top=\cos((3-j)\theta)$:

| $j$ | $t-j$ | 位置项 |
|---|---|---|
| 1 | 2 | $\cos\pi=-1$ |
| 2 | 1 | $\cos(\pi/2)=0$ |
| 3 | 0 | $\cos 0=1$ |

位置项只由 $t-j$ 决定, 这就是式 (13).

### 7.3 合并打分

取 $q_3^C=[1,0]$, 内容项为 $q_3^C(k_j^C)^\top=[1,0,1]$. 两项相加得 $[0,0,2]$, 除以 $\sqrt{d_h+d_h^R}=2$ 得 $[0,0,1]$. softmax:

$$
\alpha=\frac{[e^0,e^0,e^1]}{2+e}=[0.212,\ 0.212,\ 0.576]
$$

输出 $o_3=0.212\,[1,0]+0.212\,[1,1]+0.576\,[2,1]=[1.576,\ 0.788]$.

如果去掉位置项, 只用内容项, 打分 $[1,0,1]/2$, 权重为 $[0.384,0.233,0.384]$, 输出 $[1.384, 0.616]$. 位置项在这个例子里把权重推向距离为 0 的位置 3, 压低了距离为 2 的位置 1.

### 7.4 内容项可以不还原 Key

内容项也可以不算出 $k_j^C$. 由式 (3), $q_3^C(k_j^C)^\top=q_3^C(W^{UK})^\top(c_j^{KV})^\top$. 先算 $q_3^C(W^{UK})^\top=[1,0]\begin{bmatrix}1&0\\1&1\end{bmatrix}=[1,0]$, 再与缓存里的 $c_1, c_2, c_3$ 点积, 得 $[1,0,1]$, 和上面用 $k^C$ 算的结果相同. 这个 $[1,0]$ 是把 Query 映射到潜变量空间的结果, 维度是 $d_c$ 而不是 $d_h$. 这就是吸收的最小形式: Query 一侧多乘一个矩阵, 换来 Key 一侧不必上投影. 04 篇把它推广到多头和 Value 一侧.

位置项不能这样处理, 但也不需要: $k_j^R$ 本来就以旋转后的形式在缓存里.

这个例子里每 token 缓存 $c_j$ 和 $k_j^R$ 共 4 个元素, 与单头 MHA 的 $k, v$ 一样多, 因为头数是 1. MLA 的缓存节省来自头数: $n_h$ 个头的 Key 和 Value 都从同一个 $c_j$ 生成, 缓存不随 $n_h$ 增长.

---

## 8. 缓存量和实验结果

### 8.1 元素数和字节数

DeepSeek-V2 每 token 每层缓存 576 个元素. 同为 128 头, 每头 128 维的 MHA 要 32768 个, 是 MLA 的 56.9 倍. 按 60 层, BF16 存储, 一条 128K ($131072$) token 的序列:

| 结构 | 每 token (60 层) | 128K 序列 |
|---|---|---|
| MLA | $60\times576\times2=69{,}120$ B | 9.06 GB (8.44 GiB) |
| 同头数 MHA | $60\times32768\times2=3{,}932{,}160$ B | 515 GB (480 GiB) |

这里比的是「如果 V2 用同样的头数做 MHA」, 实际不存在这样一个模型. 下面是论文里真实对比过的数字.

换成 Decode 每步的读取量更直观. 序列已有 32K ($32768$) 个 token 时, MLA 每层每步要读 $576\times32768\approx1888$ 万个元素, BF16 下约 37.7 MB, 60 层合计约 2.26 GB; 同头数 MHA 每步要读约 129 GB. 按每秒 3 TB 量级的显存带宽, 前者读一遍不到 1 毫秒; 后者超过单张 80 GB 显卡的容量.

DeepSeek-V3 的 MLA 维度与 V2 相同 ($n_h=128$, $d_h=128$, $d_c=512$, $d_c'=1536$, $d_h^R=64$), 隐藏维加大到 7168, 层数为 61. 每 token 缓存 $61\times576=35{,}136$ 个元素, BF16 下一条 128K 序列约 9.21 GB. 隐藏维变大没有影响缓存, 因为缓存量只取决于 $d_c$, $d_h^R$ 和层数.

### 8.2 相对 DeepSeek 67B 减少 93.3%

论文摘要说 DeepSeek-V2 相对 DeepSeek 67B 的 KV Cache 减少 93.3%, 正文没有给出计算式. 部署时 DeepSeek-V2 的权重转成 FP8, KV Cache 平均量化到 6 bit. 按下面的口径可以得到同样的数:

- DeepSeek 67B: 95 层, GQA 8 个 KV 头, $d_h=128$, 每 token $2\times8\times128\times95=194{,}560$ 个元素, 按 2 字节存是 389,120 B.
- DeepSeek-V2: 每 token $60\times576=34{,}560$ 个元素, 按 6 bit (0.75 字节) 是 25,920 B.
- $25920/389120=6.66\%$, 即减少 93.3%.

如果 V2 也按 2 字节算, 比值是 $69120/389120=17.8\%$, 减少约 82%. 所以 93.3% 里包含了 KV 量化的贡献, 其中 MLA 结构本身的贡献对应元素数之比 $34560/194560=17.8\%$. 同理, 论文报告的生成吞吐 5.76 倍 (单节点 8 卡 H800, 超过 50K token/s) 是 MLA, MoE, FP8 权重和 KV 量化共同作用的结果, 论文没有拆分各自的贡献. 论文对吞吐提升的解释是: 部署后的 DeepSeek-V2 所需 KV Cache 远小于 DeepSeek 67B, 因此能用大得多的 batch. 吞吐测试按 DeepSeek 67B 线上服务的真实输入输出长度分布进行, 同一节点上的 prompt 输入吞吐超过 100K token/s. 训练成本降低 42.5% (每 T token 172.8K 对 300.6K GPU 小时) 主要来自 MoE 激活参数少, 与 MLA 的缓存无关.

### 8.3 Table 9: MLA 与 MHA 的直接对比

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

读这张表要注意三点. 第一, MLA 一侧的激活参数更少 (大模型 21.5B 对 25.0B), 质量更好不是靠多用参数. 第二, 小模型 C-Eval 上 MLA 低 0.7 个点, 不是每一项都更好. 第三, 每个规模只训练了一组模型, 论文没有报告多次运行的方差, 一两个点的差距要谨慎看待. 与 Table 8 放在一起看, GQA-8 在 7B 稠密模型上比 MHA 低 4 个点 MMLU, 而 MLA 在 MoE 模型上比 MHA 高 1.3 到 1.5 个点; 两张表的模型类型和规模不同, 不能直接相减, 但方向是一致的.

---

## 9. 训练中的额外处理

### 9.1 RMSNorm 和缩放

论文说低秩压缩和细粒度专家切分会改变一层输出的尺度, 因此在压缩后的潜变量之后加 RMSNorm, 并在宽度瓶颈处 (压缩后的潜变量, 以及路由专家的中间隐藏状态) 乘以额外的缩放因子, 以保证训练稳定. 归一化放在潜变量上, 推理时缓存的是归一化后的 $c^{KV}$. 缓存之后的计算 (式 (3) 的上投影, 打分, 加权求和) 仍然全是线性的, 吸收不受影响.

### 9.2 YaRN 只作用于 $k^R$

DeepSeek-V2 预训练长度 4K, 之后用 YaRN 把上下文扩到 128K. 位置信息只在 $q^R, k^R$ 这一段里, 论文写的是 YaRN 专门作用于解耦的共享 Key $k_t^R$, 因为它负责承载 RoPE; 内容部分不需要任何改动. 参数: 缩放 $s=40$, $\alpha=1$, $\beta=32$, 目标最大长度 160K. 长度缩放因子按 $\sqrt{t}=0.0707\ln s+1$ 计算, 用于调节注意力熵, 系数以最小化困惑度为目标选取. $s=40$ 时 $\sqrt{t}=0.0707\times3.689+1\approx1.261$. 原始 YaRN 论文的系数是 0.1, 同样的 $s$ 下得 1.369. 论文的解释是 MLA 的注意力结构与标准 MHA 不同, 所以调整了这个因子. 扩展阶段额外训练 1000 步, 序列长 32K, batch 576 条序列, 在 128K 的大海捞针测试中表现良好.

把 RoPE 限制在 64 维的一段里, 好处之一就在这里: 长度外推只需处理这一段, 不必关心内容部分的 128 维.

### 9.3 训练时不需要张量并行

DeepSeek-V2 训练用 16 路流水线并行, 8 路专家并行和 ZeRO-1 数据并行, 没有用张量并行. 论文给的原因是激活参数较少, 加上部分算子重计算节省激活显存. 02 篇第 4 节提到 MQA 在张量并行下要复制 K/V; MLA 只有一份 $c^{KV}$ 和一份 $k^R$, 如果按头切分张量并行, 同样要每卡复制这份缓存. 训练时不用张量并行, 这个问题也就不存在.

---

## 10. 实现: 不吸收的前向

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
    # h: [B, T, d]; W: 字典, 形状见第 4 节的表 (行向量写法)
    B, T, _ = h.shape
    c_q = F.rms_norm(h @ W["DQ"], (W["DQ"].shape[1],))      # [B, T, d_c'], 式 (5) 与 9.1 节
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

代码里 `k_r.expand` 只是视图, 不复制数据; `k_c`, `v_c` 是临时张量, 形状 $[B, n_h, T, d_h]$, 长序列 Prefill 时它们的显存开销与 MHA 的 K/V 相同. 这块临时显存怎么控制, 是 04 篇第 7 节讨论的问题. RMSNorm 的位置按 9.1 节, 论文没有给出缩放因子的具体值, 代码里省略.

Decode 时同一个函数的用法不同. 每步只来 1 个新 token, 先算它的 $c_t^{KV}$ 和 $k_t^R$ 追加进缓存, 缓存长度从 $t-1$ 变成 $t$. 接着如果照搬上面的写法, 要把缓存里全部 $t$ 个 $c_j^{KV}$ 乘上 $W^{UK}$ 和 $W^{UV}$, 每步重新生成 $[n_h, t, d_h]$ 的 Key 和 Value, 计算量和临时显存都随 $t$ 线性增长, 而这些上投影结果在上一步已经算过一次又扔掉了. 这就是为什么 Decode 要换成吸收版本: Query 先乘 $W^{UK}$ 的转置映射到 $d_c$ 维, 直接和缓存的 $c_j^{KV}$ 点积, 加权求和的结果也留在 $d_c$ 维, 最后再乘 $W^{UV}$ 和 $W^O$. 7.4 节的手算就是这个过程的单头版本.

---

## 11. 与 MQA, GQA 放在一起

| | MHA | GQA | MQA | MLA |
|---|---|---|---|---|
| 每 token 每层缓存 (元素) | $2n_hd_h$ | $2n_gd_h$ | $2d_h$ | $d_c+d_h^R$ |
| V2 配置下 | 32768 | $256n_g$ | 256 | 576 |
| 每头的 Key 是否不同 | 是 | 组内相同 | 全部相同 | 是 |
| RoPE 加在哪 | 整个 Key | 整个 Key | 整个 Key | 单独的 $d_h^R$ 维 |
| 论文 Table 1 的能力评价 | Strong | Moderate | Weak | Stronger |

MLA 的缓存比 GQA-2 多一点 (576 对 512), 比 MQA 多一倍多. 它换来的是每个头仍有自己的 Key 和 Value. 吸收之后, MLA 在 Decode 时的计算形态与 MQA 一致: 所有头读同一个 576 维的「Key」和同一个 512 维的「Value」, 每读一个缓存元素做的乘加次数比 MQA 还多, 这部分分析在 04 篇第 6 节.

MLA 的代价有四处. 第一是注意力本身的计算: 吸收之后每个头的打分维度从 192 变成 576, 加权求和的维度从 128 变成 512, 对长序列 Prefill 不划算, 所以推理框架在 Prefill 阶段改用不吸收的算法 (04 篇第 5, 8 节). 第二是迁移成本: GQA 论文给了 mean pool 加 5% uptrain 的转换配方, DeepSeek-V2 的 MLA 是从头训练的, 论文没有给出从 MHA/GQA checkpoint 转换的方法. 第三是张量并行: 潜变量被所有头共享, 按头切分时每张卡都要一份完整缓存. 第四是位置信息只有 64 维, 32 个频率, 所有头共用一份位置 Key; 论文的长上下文测试说明 128K 内够用, 更长的范围没有报告.

---

## 12. 失效模式与边界

| 现象 | 原因 | 处理方向 |
|---|---|---|
| 把 RoPE 直接加在内容 Key 上 | 中间夹 $R_{t-j}$, 无法吸收, 每步要重算全部前缀的 Key | 用解耦 RoPE, 位置只走 $q^R, k^R$ |
| 缩放因子写成 $\sqrt{d_h}$ | 打分维度是 $d_h+d_h^R$ | 按式 (11) 用 $\sqrt{192}$ |
| 缓存存了上投影后的 $k^C, v^C$ | 又回到 MHA 的缓存量 | 只缓存 $c^{KV}$ 和旋转后的 $k^R$ |
| $k^R$ 按头存了 $n_h$ 份 | 式 (9) 的 $k^R$ 是所有头共享的一份 | 缓存一份, 计算时广播 |
| 长上下文扩展后效果下降 | YaRN 用到了内容部分, 或缩放因子没按 MLA 调 | 只对 $k^R$ 用 YaRN, 按 9.2 节设置 |
| 按头做张量并行时缓存没减少 | 潜变量是所有头共享的, 每卡都要一份 | 推理时考虑数据并行切 batch, 或接受复制 |
| 用 93.3% 估计 MLA 本身的压缩率 | 这个数含 6 bit KV 量化 | 按元素数比, 相对 DeepSeek 67B 是 17.8% |

MLA 压缩的是 Key/Value 的维度, 与减少位置数的方法 (滑动窗口, 稀疏注意力) 和减少每个元素位数的方法 (KV 量化) 都正交, DeepSeek-V2 的部署就同时用了 MLA 和 KV 量化. 但已有的 MHA/GQA checkpoint 不能直接替换成 MLA, 结构变了就需要训练. 吸收的推导, 两种算法的计算量交叉点, 以及推理框架按 Prefill 和 Decode 切换算法的做法, 接着看 [04 MLA 矩阵吸收与工程实现](../04-MLA-矩阵吸收与工程实现/04-MLA-矩阵吸收与工程实现.md).

---

## 参考文献

1. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434). arXiv. §2.1, §3.1.2–3.1.4, §3.2.3, Appendix B, C, D, Table 1, 8, 9.
2. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). arXiv. §2.1.1.
3. Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., & Liu, Y. (2024). [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864). Neurocomputing.
4. Peng, B., Quesnelle, J., Fan, H., & Shippole, E. (2023). [YaRN: Efficient Context Window Extension of Large Language Models](https://arxiv.org/abs/2309.00071). arXiv.
5. Ainslie, J., et al. (2023). [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245). EMNLP.
6. DeepSeek-AI. (2024). [DeepSeek LLM: Scaling Open-Source Language Models with Longtermism](https://arxiv.org/abs/2401.02954). arXiv. Table 2.
7. Shazeer, N. (2019). [Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150). arXiv.
