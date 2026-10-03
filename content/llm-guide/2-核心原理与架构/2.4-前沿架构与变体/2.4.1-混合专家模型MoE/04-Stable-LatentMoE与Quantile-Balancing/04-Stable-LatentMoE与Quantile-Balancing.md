---
title: "04 · Stable LatentMoE 与 Quantile Balancing:潜空间路由专家与分位数负载均衡"
published: true
tags: ["LatentMoE", "Quantile-Balancing", "SiTU-GLU", "MoE", "Kimi-K3", "MoonEP"]
excerpt: "Kimi K3 每层 896 个路由专家,每 token 激活 16 个.路由专家在宽度 3584 的潜空间里计算,升维前加 RMSNorm,专家内用有界的 SiTU-GLU,负载由分位数直接求出的 bias 控制,EP 侧再用 MoonEP 让每张卡算同样多的 token."
---
# 04 Stable LatentMoE 与 Quantile Balancing

## 太长不看版

- 常规 MoE 中每个被选中的专家都接收完整的 $d$ 维表示,dispatch 与 combine 的数据量与 $k$ 成正比.LatentMoE(Elango et al.,[arXiv:2601.18089](https://arxiv.org/abs/2601.18089))让路由专家在宽度 $\ell<d$ 的潜空间里计算,共享专家保留满宽.Kimi K3 取 $d=7168$,$\ell=3584$,每层 896 个路由专家,Top-16,2 个共享专家.
- K3 的路由侧每 token 搬运 $k\ell=16\times3584=57344$ 个元素,与 K2 满宽 Top-8 的 $8\times7168$ 相同.专家数和 $k$ 都翻倍以上,路由通信量不变.
- 路由支路近似四次连续矩阵乘,在 2.78T 规模下内部激活会爆炸.K3 在升维前加 RMSNorm,并把专家激活从 SwiGLU 换成有界的 SiTU-GLU($|f|\le\beta_1\beta_2=100$).
- 近 $10^3$ 个专家时,DeepSeek-V3 的定步长符号更新 $b_j\leftarrow b_j+\gamma\operatorname{sign}(\bar\ell-\ell_j)$ 难以调好.Quantile Balancing(QB)用 Top-$(k{+}1)$ 得到每个 token 的截止分数,再取 margin 的 $(1-k/n)$ 分位数作为下一步的 bias,一步对准目标负载 $q=mk/n$.
- QB 是均衡指派问题对偶目标上的精确坐标最小化,符号更新是同一目标上的 SignSGD.推理只需要冻结的 bias.分位数用每专家 $B=1000$ 桶的直方图估计,每步一次整数 all-reduce.
- MoonEP 处理卡间均衡:每个 rank 恰好收到 $S\times K$ 个 token,每 rank 最多 $E/R$ 个冗余专家即可保证可行,这个上界基本是紧的.

---

## 1. 问题:满宽专家的通信与 $k$ 成正比

条件计算让总参数远大于激活参数,代价是每个被选中的专家仍要收到 token 的表示.设隐藏维为 $d$,每 token 选 $k$ 个路由专家.dispatch 把 token 送到 $k$ 个专家所在的 rank,combine 把 $k$ 份输出送回,每 token 每层的路由数据量为

$$
V_{\mathrm{full}}=2kd \tag{1}
$$

个元素(不计跨 rank 与同 rank 的区别).增加专家数 $n$ 并增加 $k$ 可以让每个专家处理更窄的输入分布,专家分工更细(DeepSeekMoE 的细粒度切分思路见 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md)).但 $k$ 每翻一倍,式 (1) 也翻一倍,专家并行的 All-to-All 和 grouped GEMM 的权重读取随之增加.

Kimi K2 是 384 个路由专家,Top-8,1 个共享专家.K3 报告(Moonshot AI,[arXiv:2607.24653](https://arxiv.org/abs/2607.24653))Table 1 给出的 K3 配置是 896 个路由专家,Top-16,2 个共享专家,稀疏度 $896/16=56$.若路由专家仍按满宽 $d=7168$ 接收输入,每 token 每层的单向 dispatch 从 $8\times7168=57344$ 增加到 $16\times7168=114688$ 个元素.

LatentMoE 的做法是把模型宽度与路由专家宽度分开.共享专家仍在 $\mathbb{R}^d$ 上处理所有 token 都需要的变换;路由专家在宽度 $\ell$ 的潜空间里计算,式 (1) 变为 $2k\ell$.K3 取 $\ell=d/2=3584$,单向 dispatch 为 $16\times3584=57344$,与 K2 相同.按 BF16 计,每 token 每层单向 114688 字节.

LatentMoE 原论文从推理代价推出这个设计,以 Qwen3-235B-A22B($N=128$,$K=8$,$d=4096$,专家中间维 $m=1536$)部署在 GB200 上为例,EP=64,每卡 2 个专家.低延迟场景下,每专家 token 数 $t_{\mathrm{exp}}=t_{\mathrm{total}}K/N$ 只有几百,算术强度 $I=2t_{\mathrm{exp}}dm/(dm+t_{\mathrm{exp}}(d+m))$ 低于 FP4 算力 10 PFLOPs 与 HBM 带宽 8 TB/s 之比对应的门槛(论文给出 $t_{\mathrm{exp}}\approx1418$),专家计算受权重读取限制.吞吐场景下专家已经受算力限制,All-to-All 时间与计算时间之比为 $5F/(4m\,\mathrm{BW}_{\mathrm{NVL}})$,代入 $F=10$ PFLOPs,单向 NVLink 900 GB/s,约为 9,通信占主导.通信量正比于 $t_{\mathrm{total}}Kd/\mathrm{EP}$,与 $m$ 无关.

质量方面,论文把每 token 的非线性预算定义为 $K\cdot m$,认为它应保持不变;$d$ 不能低于任务的有效特征秩;专家组合数 $\binom{N}{K}$ 随 $N$,$K$ 同时放大而迅速增长.于是能压的只剩路由宽度:取 $\alpha=d/\ell$,专家数放大 $\alpha$ 倍且 $K$ 不变的版本称为 $\ell$-MoE$_{\mathrm{eff}}$,降低推理代价;专家数与 $K$ 都放大 $\alpha$ 倍的版本称为 $\ell$-MoE$_{\mathrm{acc}}$,通信与带宽代价与标准 MoE 持平,换取精度.论文在 16B 总参(2B 激活)上做消融,在 95B(8B 激活)上做扩展验证,训练量超过 1T token,Nemotron-3 Super 与 Ultra 采用了该结构.K3 相对 K2 的变化接近 $\ell$-MoE$_{\mathrm{acc}}$:$\alpha=2$,$K$ 从 8 到 16;专家数从 384 到 896,超过 2 倍,中间维也从 2048 增加到 3072.原论文的路由器用 Softmax,K3 改为式 (6) 的 Sigmoid 加 bias.

---

## 2. LatentMoE 的层结构

### 2.1 前向公式

K3 报告式 (11) 沿用 DeepSeekMoE 的共享 / 路由分工.对 $\bm{x}\in\mathbb{R}^d$:

$$
\bm{z}=\mathbf{W}^{\downarrow}\bm{x}\in\mathbb{R}^{\ell} \tag{2}
$$

$$
\bm{u}=\sum_{i\in\mathcal{T}_k(\bm{x})}p_i\,E_i^{\mathrm{routed}}(\bm{z}),\qquad E_i^{\mathrm{routed}}:\mathbb{R}^{\ell}\to\mathbb{R}^{\ell} \tag{3}
$$

$$
\bm{y}=\sum_{j=1}^{N_s}E_j^{\mathrm{shared}}(\bm{x})+\mathbf{W}^{\uparrow}\operatorname{RMSNorm}(\bm{u}),\qquad E_j^{\mathrm{shared}}:\mathbb{R}^{d}\to\mathbb{R}^{d} \tag{4}
$$

K3 每层固定 $N_s=2$.$\mathcal{T}_k(\bm{x})$ 是 Top-16 集合,$p_i$ 由第 4 节的门控给出.路由器读的是满宽 $\bm{x}$,不读 $\bm{z}$;dispatch 的对象是 $\bm{z}$.所以通信按 $\ell$ 计,打分仍使用完整信息.K3 的推理 kernel 把 $\mathbf{W}^{\downarrow}$ 与路由器合并成一次 GEMM,两者输入相同,合并后只读一次 $\bm{x}$.

### 2.2 宽度与参数

Table 1 中与专家有关的三个宽度不能互换:

| 量 | K2 | K3 | 含义 |
|----|----|----|------|
| Hidden Dimension | 7168 | 7168 | 残差流宽度 $d$ |
| Latent MoE Dimension | 无 | 3584 | 路由专家的输入输出宽度 $\ell$ |
| MoE Hidden Dimension per Expert | 2048 | 3072 | 专家 FFN 内部的中间维 $H$ |

一个门控 FFN 专家有门,up,down 三个矩阵,参数为 $3\ell H$.K3 每个路由专家为 $3\times3584\times3072\approx3.30\times10^7$,一层 896 个专家约 29.6B.Table 1 列出 93 层,其中 1 层是稠密 FFN;若其余 92 层都是 MoE 层,路由专家共约 2.72T,占总参数 2.78T 的 98% 左右.每 token 每层激活 16 个专家,约 0.53B,92 层约 48.6B,不到激活参数 104.2B 的一半,其余来自共享专家,注意力,$\mathbf{W}^{\downarrow}$ 与 $\mathbf{W}^{\uparrow}$ 等每个 token 都经过的部分.稀疏度 56 只描述路由专家池,整模型的激活比例是 $104.2/2780\approx3.7\%$.

$\ell$ 与 MLA 的 $c^{KV}$ 是两个张量.$c^{KV}$ 在注意力里,是 decode 阶段缓存的低秩 KV 向量(见 [MLA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md));$\ell$ 在 FFN 里,是被派发的 token 表示宽度,不进入 KV cache.K3 的 Gated MLA 层同样接 Stable LatentMoE,同一层里两个潜空间同时存在,各走各的计算路径.

---

## 3. 路由支路的数值稳定

### 3.1 RMSNorm

报告指出,极端稀疏放大了原始 LatentMoE 的两个问题.第一个是路由支路的结构:$\mathbf{W}^{\downarrow}$,带门控的多分支专家 FFN,$\mathbf{W}^{\uparrow}$ 连起来近似四次连续矩阵乘($d\to\ell$;$\ell\to H$ 的门与 up 两支;$H\to\ell$;$\ell\to d$),条件数差,在 2.78T 规模下路由支路内部激活爆炸.共享支路不经过这条链.

原始 LatentMoE 直接计算 $\mathbf{W}^{\uparrow}\bm{u}$.$\bm{u}$ 是 16 个专家输出按 $p_i$ 的加权和,它的尺度随选中的专家集合和权重变化,与共享支路相加时两者尺度不匹配.K3 在聚合与升维之间加 RMSNorm,即式 (4) 中的 $\operatorname{RMSNorm}(\bm{u})$.报告称这一改动除了稳定训练,验证损失和下游评测也一致变好.RMSNorm 只约束进入 $\mathbf{W}^{\uparrow}$ 前的整体尺度,不约束专家内部两个大坐标相乘.

### 3.2 SiTU-GLU

GLU 类 FFN 计算 $g(\mathbf{W}_g\bm{z})\odot v(\mathbf{W}_u\bm{z})$.SwiGLU 的门 $x\sigma(x)$ 与 up 分支 $x$ 都无界,两个大坐标相乘会产生激活离群值,低精度下有溢出风险.K3 的 SiTU-GLU 给两支各加一个光滑上界:

$$
g(x)=\beta_1\tanh\!\Bigl(\frac{x}{\beta_1}\Bigr)\sigma(x),\qquad v(x)=\beta_2\tanh\!\Bigl(\frac{x}{\beta_2}\Bigr),\qquad |g(x)\,v(x')|\le\beta_1\beta_2 \tag{5}
$$

K3 取 $\beta_1=4$,$\beta_2=25$,单坐标输出上界为 100.原点附近 $\beta\tanh(x/\beta)\approx x$,所以 $g(x)\approx x\sigma(x)$,$v(x)\approx x$,与 SwiGLU 一致;输入很大时两支分别趋于 $\beta_1$ 与 $\beta_2$.用 $\tanh$ 而不用截断,是因为截断在阈值外导数为 0,超出范围的坐标不再得到梯度;$\beta\tanh(x/\beta)$ 的导数 $1-\tanh^2(x/\beta)$ 处处为正,只是随 $|x|$ 增大而变小.$\beta_2=25$ 比 $\beta_1=4$ 大,up 分支在更宽的范围内保持近似线性.激活的推导与 hard clamp 的比较见 [SiTU-GLU](../../../2.1-深度学习基础组件/2.1.1-激活函数/01-SiTU-GLU/01-SiTU-GLU.md).Table 1 的激活函数是整模型一列,共享专家同样使用 SiTU-GLU.

两处改动分工明确:RMSNorm 让路由输出与共享输出的尺度可以相加,SiTU-GLU 让专家内部乘积有界.

---

## 4. 门控与定步长 bias 的局限

K3 不用辅助损失,沿用 DeepSeek-V3 的 bias 方案.报告式 (13):

$$
\bm{s}_i=\operatorname{Sigmoid}(\mathbf{W}_r\bm{x}_i),\qquad \mathcal{T}_i=\operatorname{argtop}_k(\bm{s}_i+\bm{b}),\qquad p_{i,j}=\frac{s_{i,j}}{\sum_{r\in\mathcal{T}_i}s_{i,r}}\quad(j\in\mathcal{T}_i) \tag{6}
$$

$\bm{b}$ 只参与选择,不进入 $p_{i,j}$,因此不改变混合权重,也不改变路由器的梯度.$p$ 的定义是在 $s+b$ 上取 Top-$k$,再只用 $s$ 归一化,与 $\operatorname{softmax}(s+b)$ 不同.原方法的 bias 更新为

$$
b_j^{(t+1)}=b_j^{(t)}+\gamma\operatorname{sign}\bigl(\bar{c}-c_j^{(t)}\bigr) \tag{7}
$$

$c_j^{(t)}$ 是专家 $j$ 在第 $t$ 步收到的 token 数,$\bar c$ 是平均值(报告用 $\ell_j$ 记负载,本文改用 $c_j$,避免与宽度 $\ell$ 混淆).$\gamma$ 在两种失败之间取舍:太小,bias 跟不上负载变化;太大,负载在过载与欠载之间振荡.报告的判断是,近 $10^3$ 个专家超出了这类更新表现良好的范围.负载不均会拖慢专家并行,也可能让部分专家几乎收不到 token.DeepSeek 原论文对更新速度的对照见 [03](../03-MoE负载均衡与容量/03-MoE负载均衡与容量.md) 第 8 节.

---

## 5. Quantile Balancing

### 5.1 目标负载与截止分数

一个训练步有 $m$ 个 token,$n$ 个路由专家,每 token 选 $k$ 个.均衡时每个专家应服务

$$
q=\frac{mk}{n} \tag{8}
$$

个 token(假定整除).K3 中 $q/m=16/896=1/56$.

QB 在一次前向里同时完成路由和 bias 估计.选择时改为在 $\bm{s}_i+\bm{b}^{(t)}$ 上取 Top-$(k{+}1)$:前 $k$ 名是实际派发的专家,第 $k{+}1$ 名的分数记为截止 $\alpha_i^{(t)}$.专家 $j$ 要进入 token $i$ 的 Top-$k$,带偏置的分数必须超过 $\alpha_i^{(t)}$.Top-$(k{+}1)$ 比 Top-$k$ 只多取一名,token 侧不需要另外计算分位数.

固定这组截止,若专家 $j$ 的 bias 取候选值 $\widehat b_j$,它收到的 token 数为

$$
\sum_{i=1}^{m}\mathbf{1}\bigl[s_{i,j}+\widehat b_j>\alpha_i^{(t)}\bigr] \tag{9}
$$

计数随阈值 $-\widehat b_j$ 单调下降.无并列时令计数等于 $q$,$-\widehat b_j$ 就是 margin $s_{i,j}-\alpha_i^{(t)}$ 的第 $q{+}1$ 大值,恰好 $q$ 个 margin 在它之上.由 $q/m=k/n$,这是 margin 的 $(1-k/n)$ 分位数.报告式 (14):

$$
\widehat b_j^{(t+1)}=-\operatorname{quantile}_{1-k/n}\bigl(\bm{s}_{:,j}-\bm{\alpha}^{(t)}\bigr) \tag{10}
$$

$$
\bm{b}^{(t+1)}=\widehat{\bm{b}}^{(t+1)}-\operatorname{mean}\bigl(\widehat{\bm{b}}^{(t+1)}\bigr)\mathbf{1} \tag{11}
$$

式 (11) 减去公共均值,所有专家加同一个常数不改变 Top-$k$ 排序,只防止 bias 整体漂移.margin 使用裸分数 $s$ 减截止 $\alpha$,旧 bias 只经由 $\alpha$(来自 $s+b^{(t)}$ 的排序)进入更新.

两条约束:本 batch 算出的 $\bm{b}^{(t+1)}$ 只用于下一步,不用于重新路由本 batch;推理时 bias 冻结,部署形式就是带固定 $\bm{b}$ 的 Top-$k$.

### 5.2 例子

构造一个 $m=8$,$n=4$,$k=1$ 的例子,$q=2$.专家 1 在 8 个 token 上的 margin 降序为 $2.35,1.72,0.85,\ldots$,第 $q{+}1=3$ 大是 0.85,所以 $\widehat b_1=-0.85$,加上它之后只有前两个 margin 仍为正.设四个专家的候选值为 $\widehat{\bm b}=(-0.85,-0.12,0.08,0.55)$,均值 $-0.085$,按式 (11) 得到 $\bm b=(-0.765,-0.035,0.165,0.635)$,和为 0.原来过载的专家 1 被压低,欠载的专家 4 被抬高.

![Quantile Balancing 示意:不均衡的 Top-k,margin 分位数截止,均衡后的路由](./images/fig-quantile-balancing.png)

**图 1 解析**

- 左栏是更新前的 Top-1 路由,负载为 $(2,2,4,0)$,专家 4 无 token.图中 $t_4$ 连出两条边,$t_8$ 没有边,严格的 $k=1$ 应该每个 token 恰好一条边;K3 报告 Fig. 5 的同类例子负载为 $(4,3,1,0)$.
- 中栏每一行是一个专家在各 token 上的 margin,红色虚线是截止位置,线上方的 margin 被接受.图中四行的虚线画在同一横坐标,实际每个专家各有自己的分位数,式 (10) 对每列分别计算;报告 Fig. 5 中每列的虚线位置不同.
- 右栏是减去各列调整量后的 Top-1 路由,每个 token 一条边,负载为 $(2,2,2,2)$,即 $q=mk/n=2$.

---

## 6. 推导:均衡指派的对偶

### 6.1 线性规划与对偶

K3 附录 C 从最大分数均衡指派出发.$x_{i,j}\in\{0,1\}$ 表示 token $i$ 是否派给专家 $j$:

$$
\max_{x}\sum_{i,j}x_{i,j}s_{i,j}\qquad\text{s.t.}\qquad\sum_j x_{i,j}=k,\qquad\sum_i x_{i,j}=\frac{mk}{n} \tag{12}
$$

把 $x_{i,j}$ 松弛到 $[0,1]$ 得到线性规划,二分 $b$-matching 多面体的整数性保证最优解仍是整数,松弛是精确的.对 token 侧约束引入乘子 $\alpha_i$,专家侧引入 $\beta_j$,交换 max 与 min 后,内层对每个 $(i,j)$ 可分:$s_{i,j}-\alpha_i-\beta_j>0$ 时取 $x_{i,j}=1$,否则取 0.代回得到凸的对偶目标:

$$
\mathcal{L}(\bm\alpha,\bm\beta)=\sum_{i,j}\max\bigl(0,\,s_{i,j}-\alpha_i-\beta_j\bigr)+k\sum_i\alpha_i+\frac{mk}{n}\sum_j\beta_j \tag{13}
$$

### 6.2 交替精确坐标最小化

固定 $\bm\beta$,式 (13) 按 token 分解.token $i$ 的子问题 $\min_\alpha k\alpha+\sum_j\max(0,s_{i,j}-\beta_j-\alpha)$ 关于 $\alpha$ 分段线性,斜率是 $k$ 减去超过 $\alpha$ 的 margin 个数,恰有 $k$ 个 margin 在 $\alpha$ 之上时取最小.按惯例取第 $k{+}1$ 大值:

$$
\alpha_i^{*}=\operatorname{quantile}_{1-k/n}\bigl(\bm{s}_i-\bm\beta\bigr) \tag{14}
$$

固定 $\bm\alpha$,专家侧对称,最小点是 $\bm{s}_{:,j}-\bm\alpha$ 的第 $mk/n{+}1$ 大值:

$$
\beta_j^{*}=\operatorname{quantile}_{1-k/n}\bigl(\bm{s}_{:,j}-\bm\alpha\bigr) \tag{15}
$$

两个更新是同一个分位数分别沿 token 轴和专家轴计算,方法因此得名.对照式 (10):训练中的 Top-$(k{+}1)$ 截止就是式 (14),bias 更新就是式 (15) 取 $\bm b=-\bm\beta$.附录 Algorithm 1 把两步交替迭代写成离线求解器;训练中每步只做一轮,用上一步的 $\bm\beta$ 算 $\bm\alpha$.

最优解满足 $x^{*}_{i,j}=1$ 当且仅当 $s_{i,j}-\alpha_i^{*}-\beta_j^{*}>0$,再加上每 token 恰好 $k$ 个,选中的就是 $\bm s_i-\bm\beta^{*}$ 的 Top-$k$.路由只需要专家阈值 $\bm\beta\in\mathbb{R}^n$;token 阈值 $\bm\alpha\in\mathbb{R}^m$ 与具体 batch 绑定,用完即丢.这就是推理不跑分位数也能与训练一致的原因.

一个可以手算的例子:$m=4$,$n=2$,$k=1$,$q=2$.四个 token 对两个专家的分数为 $t_1:(0.9,0.5)$,$t_2:(0.8,0.7)$,$t_3:(0.7,0.2)$,$t_4:(0.6,0.45)$.不加 bias 时四个 token 全选专家 1,负载 $(4,0)$,总分 3.0.从 $\bm\beta=\bm 0$ 开始,式 (14) 的 $\alpha_i$ 是每行第 2 大的分数,即 $(0.5,0.7,0.2,0.45)$.专家 1 的 margin $s_{i,1}-\alpha_i$ 为 $(0.4,0.1,0.5,0.15)$,降序后第 $q{+}1=3$ 大是 0.15,所以 $\beta_1=0.15$;专家 2 的 margin 全为 0,$\beta_2=0$.用 $\bm s_i-\bm\beta$ 重新取 Top-1:$t_1$ 为 $(0.75,0.5)$ 选专家 1,$t_2$ 为 $(0.65,0.7)$ 选专家 2,$t_3$ 为 $(0.55,0.2)$ 选专家 1,$t_4$ 为 $(0.45,0.45)$ 落在边界上.式 (9) 用严格不等号,恰在阈值上的 token 不被专家 1 接受,归专家 2,负载变为 $(2,2)$,总分 $0.9+0.7+0.7+0.45=2.75$.

可以验证这就是最优的均衡指派:要让两个 token 改去专家 2,每改一个损失 $s_{i,1}-s_{i,2}$,四个 token 的损失分别为 $0.4,0.1,0.5,0.15$,最小的两个是 $t_2$ 与 $t_4$,合计 0.25,与 $3.0-2.75$ 一致.一轮交替就到达了最优,也说明了分位数更新与定步长更新的差别:式 (7) 每步只能把 $b_1$ 移动 $\gamma$,两个专家的 bias 每步相向各移动 $\gamma$,差距要超过 0.15 约需 $0.15/(2\gamma)$ 步,而且步长固定,到达后还会在边界附近来回跳.

### 6.3 与其他方法的关系

专家侧子问题对 $\beta_j$ 的次梯度是目标负载减实际负载.对它做 SignSGD,得到的就是式 (7) 的符号更新(差一个 $\bm b=-\bm\beta$ 的符号约定).符号更新只用负载误差的方向,QB 直接跳到同一对偶目标的坐标最小点.报告据此解释了两点:QB 没有类似学习率的超参数,在近 $10^3$ 个专家时也只需几步就达到均衡.

BIP 求解同一个指派问题,但用不等式约束 $\sum_j x_{i,j}\le k$,$\sum_i x_{i,j}\le mk/n$,乘子因此非负,两个更新都多一个 $\max(0,\cdot)$ 截断.截断后只能压低过选的专家,不能抬高欠选的专家,报告实验中均衡明显变慢.Expert Threshold routing(Sun et al.,[arXiv:2603.11535](https://arxiv.org/abs/2603.11535))维护 EMA 阈值,每个 token 选中的专家数可变;QB 保持固定 Top-$k$,变的只是 bias.

---

## 7. 直方图估计分位数

式 (10) 的分位数跨整个 global batch,margin 数量是百万级 token 乘 896 个专家,分布在各数据并行 rank 和梯度累积步上,训练循环里无法把 $O(mn)$ 个 margin 汇总后精确求分位数.

附录 D 改为对每个专家维护直方图,统计的量是 $r_{i,j}=\alpha_i-s_{i,j}$,即把专家 $j$ 恰好放到 token $i$ 截止处所需的 bias.取负使顺序反转,式 (10) 的 $\widehat b_j$ 等于 $r_{:,j}$ 的 $(k/n)$ 分位数.$s_{i,j}\in(0,1)$,$\alpha_i$ 是某个专家的 $s+b$,所以 $r$ 落在 $[b_{\min}-1,\,b_{\max}+1]$.把该区间均分成 $B$ 桶,每步按当前 $b_{\min},b_{\max}$ 重定区间.K3 取 $B=1000$.

前向时每个 rank 把本地 $r_{i,j}$ scatter-add 到计数矩阵 $\mathbf{H}\in\mathbb{N}^{n\times B}$,各 micro-batch 只累加,不通信;步末做一次整数 all-reduce 得到全局直方图.设专家 $j$ 的目标分位落在第 $\beta_j$ 个桶,之前的累计计数为 $c_j$,桶内计数为 $h_j$,桶宽 $w=(b_{\max}-b_{\min}+2)/B$,插值为

$$
\widehat b_j=b_{\min}-1+\Bigl(\beta_j+\operatorname{clip}\Bigl(\frac{q-c_j}{h_j},0,1\Bigr)\Bigr)w \tag{16}
$$

之后按式 (11) 减均值.报告列出三点性质.误差:累计计数在桶边界上精确,真实分位数与估计落在同一桶内,误差不超过 $w$,$B=1000$ 时至多几个 $10^{-3}$,观测不到残余负载不均.代价:通信是每层每步 $nB$ 个整数,与 $m$ 无关,在 K3 的配置下不到「每个 micro-batch 交换原始 margin」的 1%.正确性:计数可加,全局直方图与 token 在 rank 和累积步之间的划分方式无关,得到的是整个 batch 的分位数;各 rank 分位数的平均一般不等于它.报告还提到可以对估计的分位数做跨步 EMA,进一步降低 batch 间的采样噪声.

---

## 8. MoonEP:卡间负载

QB 让各专家被选中的次数接近 $q$,但专家并行看的是每张卡收到的 token 数.专家按固定方式放在 rank 上时,即使专家负载均衡,不同 rank 上专家组合的负载之和仍会不同.K3 §5.2.1 的 MoonEP 要求每个 rank 恰好收到 $S\times K$ 个 token($S$ 为序列长度,$K$ 为每 token 选中的专家数),做法是把过载 rank 上的部分专家复制到欠载 rank(冗余专家),迁移一部分 token 过去计算.

关键问题是每个 rank 需要多少冗余专家槽.设专家总数 $E$,EP 大小 $R$,每个 rank 原有 $E/R$ 个专家.附录 E 的构造:从「每个 rank 只有本地 token」开始,反复选一个欠载 rank 和一个过载 rank,从后者迁移 token 把前者恰好填到 $S\times K$.每次填充让一个欠载 rank 达到均衡且之后不再变化,最多 $R-1$ 次结束;每个 rank 只被填一次,远程 token 只来自一个 rank,而那个 rank 上只有 $E/R$ 个专家.记 $m_r(P)$ 为方案 $P$ 下 rank $r$ 的冗余专家数:

$$
M(I)=\min_P\max_r m_r(P)\le\frac{E}{R} \tag{17}
$$

上界基本是紧的.构造一个路由结果:rank 0 上的专家收不到 token,其余 $R-1$ 个 rank 上的 $E(R-1)/R$ 个专家平分全部 $SKR$ 个 token,每个专家 $SKR^2/(E(R-1))$ 个.rank 0 必须收到 $SK$ 个全是远程的 token,至少涉及

$$
M(I^{*})\ge\Bigl\lceil\frac{E(R-1)}{R^2}\Bigr\rceil \tag{18}
$$

个不同专家,$R$ 较大时约为 $E/R$.代入 K3 的 $E=896$ 做一个算例:若 $R=64$,上界 $E/R=14$,式 (18) 的下界为 $\lceil896\times63/4096\rceil=\lceil13.78\rceil=14$,两者相等.按第 2.2 节每个路由专家约 $3.3\times10^7$ 参数计,每 rank 每层预留 14 个冗余槽约 $4.6\times10^8$ 参数,这是用显存换取严格均衡的代价.每个 rank 预留 $E/R$ 个冗余槽,规划总有可行解,训练不会因为找不到方案而中断.报告对比的 ECHO 与 UltraEP 预设冗余专家数或每 rank token 上限,没有可行方案时训练被迫停止,上限本身也要手调.

逐步求精确最优代价太高.MoonEP 离线用整数线性规划求代表性情形的精确解作参照,在线用 GPU 规划 kernel 求近似最优解,开销可忽略且始终满足 $E/R$ 上界.

完全均衡还简化了数据通路.规划 kernel 预先算出每个 token 的目的地,融合的 permute / unpermute 算子把 token 直接发送到远端 rank 上按专家分组的位置,通信缓冲的视图直接交给计算,中间拷贝被消除.DeepEP 在最坏不均衡下要支持同样的零拷贝通路,需要大小为 $S\times K\times R$ 的通信缓冲;MoonEP 只需固定的 $S\times K$.每个 rank 的 token 数固定后,各层的计算形状在启动前已知,省去每层 MoE 的 host 与 device 同步,也减轻 host 侧的 kernel 启动开销.

rank 内各专家的 token 数仍然偏斜,固定顺序的调度会让各 SM 的完成时间不同.K3 用感知负载的调度器在启动前按当前 token 分布选参数,执行中保持不变;参数由基于硬件指标的解析代价模型选择,关键系数离线 autotune 标定.共享专家的 GEMM 放在单独的 stream 上,与其他 kernel 重叠.

QB 与 MoonEP 作用在不同层面:QB 调专家间被选中的次数,MoonEP 调 rank 间实际计算的 token 数.二者都不改变 $p_{i,j}$ 的定义.

---

## 9. 推理与部署

推理时 bias 冻结,路由就是式 (6) 的 Top-$k$,不计算分位数也不维护直方图.

K3 把 MoE 专家权重量化到 MXFP4,激活用 MXFP8 计算;注意力投影,LatentMoE 的 $\mathbf{W}^{\downarrow}$ 与 $\mathbf{W}^{\uparrow}$,共享专家和路由器保持较高精度.量化范围按参数占比选择:第 2.2 节的估算中路由专家占总参数的绝大部分.后训练全程(SFT 与 RL)做量化感知训练,RL 中 rollout 与训练使用相同的量化方案,消除训练与推理的不一致.EAGLE-3 风格的 draft 模型微调沿用同一配置.

decode 时 batch 小,路由专家的 grouped GEMM 退化为按内存带宽读取权重.K3 的 MoE decode kernel 基于 WarpDecode 的 token-centric 设计:每个 warp 负责一个输出神经元,直接从显存流式读取对应权重;warp 再细分成 lane 组,各组处理不相交的专家子集,最后做 warp 内归约.权重布局离线一次性重排,以减少运行时反量化开销.$\mathbf{W}^{\downarrow}$ 与 $\mathbf{W}^{\uparrow}$ 这类 latent 矩阵在 rank 间切分,输出的 all-gather 用 multimem store 指令融合进 GEMM epilogue,通信与共享专家计算重叠.

量化方法的一般讨论见 [06](../06-MoE硬件与量化/06-MoE硬件与量化.md),专家并行与 All-to-All 的系统实现见 [05](../05-MoE系统-并行通信与部署/05-MoE系统-并行通信与部署.md).

---

## 10. 失效模式

| 现象 | 原因 | 处理 |
|------|------|------|
| 把 $\ell=3584$ 当成 KV 压缩维 | 混淆 LatentMoE 的 $\ell$ 与 MLA 的 $c^{KV}$ | $\ell$ 是路由专家的输入输出宽度,不进 KV cache |
| 把 3072 当成 $\ell$ | Table 1 两行读串 | 3072 是专家内部中间维 $H$ |
| 把稀疏度 56 理解成只有 1/56 参数参与 | 忽略共享专家与非专家参数 | 整模型激活比例约 3.7% |
| 路由器接 $\bm z$ | 误以为降维后再打分 | 路由器读满宽 $\bm x$,只 dispatch $\bm z$ |
| 路由支路激活溢出 | 近四次连乘,SwiGLU 无界 | 升维前 RMSNorm,专家用 SiTU-GLU |
| 把 $p$ 写成 $\operatorname{softmax}(s+b)$ | bias 进了混合权重 | 在 $s+b$ 上选,只用 $s$ 归一化 |
| 定步长 bias 振荡或跟不上 | $\gamma$ 难以兼顾近 $10^3$ 个专家 | 改用式 (10) 的分位数更新 |
| 用本 batch 的 bias 重路由本 batch | 违反因果 | $\bm b^{(t+1)}$ 只用于下一步 |
| 各 rank 分别求分位数再平均 | 分位数不可加 | 汇总直方图计数后再求分位数 |
| 推理时继续估计分位数 | 训练机制带进部署 | 冻结 $\bm b$ |
| 专家已均衡但 EP 步时仍不齐 | 专家均衡不等于 rank 均衡 | 冗余专家迁移(MoonEP),每 rank 预留 $E/R$ 槽 |
| 用 BIP 式的非负乘子做均衡,收敛慢 | 截断后只能压低过选专家 | 用等式约束,乘子可正可负 |
| 部署量化范围选择不当 | 参数主要在路由专家,其余模块占比小 | K3 只把专家权重量化到 MXFP4,路由器,共享专家与投影保持较高精度,后训练全程 QAT |
| 冗余专家数设固定上限后训练中断 | 上限内无可行方案 | 按式 (17) 预留,上界有保证 |

---

## 参考文献

1. Moonshot AI. (2026). [Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653). §2.3 式 (11)–(14),Fig. 2,Fig. 4,Fig. 5,Table 1,§4.1.4 MXFP4 QAT,§5.2.1 MoonEP,推理 kernel 一节,附录 C–E.
2. Elango, V., et al. (2026). [LatentMoE: Toward Optimal Accuracy per FLOP and Parameter in Mixture of Experts](https://arxiv.org/abs/2601.18089).
3. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). auxiliary-loss-free 负载均衡.
4. Wang, L., Gao, H., Zhao, C., Sun, X., & Dai, D. (2024). [Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts](https://arxiv.org/abs/2408.15664).
5. Sun, H., Liu, Y., Wu, Y., & Sun, L. (2026). [Expert Threshold Routing for Autoregressive Language Modeling with Dynamic Computation Allocation and Load Balancing](https://arxiv.org/abs/2603.11535).
6. Dai, D., et al. (2024). [DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models](https://arxiv.org/abs/2401.06066).
