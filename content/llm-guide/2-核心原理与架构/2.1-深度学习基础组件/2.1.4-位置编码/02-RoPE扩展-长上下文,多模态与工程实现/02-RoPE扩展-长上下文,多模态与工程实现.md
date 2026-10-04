---
title: "02 · RoPE扩展: 长上下文, 多模态与工程实现"
published: true
tags: ["RoPE", "PI", "NTK", "YaRN", "长上下文", "M-RoPE", "MLA"]
excerpt: "RoPE 直接外推到训练长度之外会失效, 出问题的是训练中没转满一圈的低频平面. 本文按 PI, NTK-aware, NTK-by-parts, YaRN 的顺序讲每一步补上一步的什么缺口, 再讲 Qwen2-VL 的 M-RoPE, DeepSeek-V2 的解耦 RoPE, 以及精度和 KV Cache 上的工程问题."
---
# 02 RoPE扩展: 长上下文, 多模态与工程实现

本文接 [01 RoPE 本体](../01-RoPE本体-旋转位置编码/01-RoPE本体-旋转位置编码.md), 沿用其中的记号: 单头维度 $d$, 第 $i$ 个二维平面的角频率 $\theta_i=b^{-2i/d}$ (base $b$ 默认 10000), 波长 $\lambda_i=2\pi/\theta_i$, 分数 $q_m^\top k_n=(W_qx_m)^\top R_{\Theta,n-m}(W_kx_n)$. 01 证明了这个分数只依赖相对距离; 本文处理 RoPE 落到真实模型上碰到的三件事: 训练长度之外怎么办, 位置不再是一维时怎么办, 以及它在 KV Cache, 低秩压缩和数值精度上的代价.

## 1. 问题: 训练长度之外的 RoPE

### 1.1 直接外推的结果

[Chen et al. (2023)](https://arxiv.org/abs/2306.15595) 表 1 给出了直接外推的数字. 预训练窗口 $L=2048$ 的 LLaMA 7B, 在 PG19 上用 2048 的窗口评估, 困惑度 7.20; 评估窗口拉到 4096, 8192, 16384, 32768, 困惑度全部超过 $10^3$. 他们在 §2.2 举了一个例子: 问题放在位置 3000, 证据放在位置 2900, 两者只差 100 个 token, 模型照样答不对. 也就是说, 失效不只是「看不到 2048 之前的内容」, 而是整个注意力都坏了.

直接用更长的序列继续微调也很慢. 同一篇论文的表 4: LLaMA 7B 直接微调到 8192 窗口, 训练 10000 步后, 用 passkey 检索测出的有效窗口只从 2048 涨到 2560.

### 1.2 坏在哪些维度

01 第 5.2 节算过: 第 $i$ 个平面在训练中见过的最大相对角度是 $L\theta_i$. 波长 $\lambda_i>L$ 的平面连一圈都没转满, 位置超过 $L$ 后会出现训练中从未见过的角度. 以 $d=128$, $b=10000$ 为例:

| 训练长度 $L$ | 波长大于 $L$ 的平面 | 个数 | 最低频平面 $i=63$ 在 $L$ 内转过的角度 |
|---|---|---:|---:|
| 2048 (LLaMA) | $i=41,\dots,63$ | 23 | 0.24 rad |
| 4096 (Llama 2) | $i=46,\dots,63$ | 18 | 0.47 rad |

高频平面 ($i$ 小) 在训练中已经转过很多圈, $i=0$ 在 2048 个 token 内转了约 326 圈, 任何角度都见过. 把序列拉长, 这些平面不会遇到新角度. 所以「高频维度在长序列上相位失稳」的说法方向是反的, 真正越界的是低频平面.

### 1.3 为什么越界会让分数爆掉

01 的式 (25) 把分数写成了相对距离 $s=m-n$ 的三角级数. Chen et al. (2023) 式 (3) 用同样的视角:

$$
a(s)=\mathrm{Re}\left[\sum_{j=0}^{d/2-1}h_j\,e^{is\theta_j}\right] \tag{1}
$$

$h_j$ 是 $q,k$ 在第 $j$ 个平面上组成的复系数, 由内容决定. 预训练只要求 $a(s)$ 在 $s\in[0,L]$ 上表现正常. 当 $d$ 足够大时, 三角函数族可以逼近任意函数, 总存在一组 $h_j$ 让 $a(s)$ 在 $[0,L]$ 内很小, 在区间外很大. 他们的图 2 按 LLaMA 7B 的设置 ($d=4096/32=128$) 用最小二乘在 $[0,2048]$ 上拟合随机点, 拟合曲线在区间内大约落在 $[-1,1]$, 区间外可以超过 8000. 这种量级的 logit 会让 softmax 几乎全部压到一个 token 上.

这也说明 01 第 3.4 节的「远程衰减」上界不够用: 那个上界含有 $\max|h_{j+1}-h_j|$, 系数大时上界本身就很大, 起不到约束作用.

## 2. 线性插值与改 base: PI 和 NTK-aware

### 2.1 PI: 把位置压回训练区间

既然外推会碰到没见过的角度, PI (Position Interpolation) 的思路是不外推, 改成内插: 目标窗口为 $L'$ 时, 把位置 $m$ 按比例压到 $[0,L)$:

$$
f'(x,m)=f\left(x,\frac{mL}{L'}\right)=f\left(x,\frac{m}{s}\right),\qquad s=\frac{L'}{L} \tag{2}
$$

$f$ 是原 RoPE, $s$ 是扩展倍数. 位置变成了非整数, 但式 (20) 的旋转对任意实数都有定义. 压缩之后, 任意两个 token 的最大相对距离从 $L'$ 变回 $L$, 所有平面的角度都回到训练中见过的范围. 等价的写法是把每个平面的角频率都除以 $s$: $\theta_i\to\theta_i/s$.

### 2.2 为什么内插比外推稳

Chen et al. (2023) 的定理 2.1 给出了内插误差的上界. 设 $s_1,s_2$ 是两个相邻整数距离 (预训练时在这两个点上 $a(s)$ 表现正常), $a_{\text{linear}}(s)$ 是两点之间的线性插值, $\theta_j=c^{-2j/d}$, 则对 $s\in[s_1,s_2]$:

$$
\left|a(s)-a_{\text{linear}}(s)\right|\le d\left(\max_j|h_j|\right)\frac{(s-s_1)(s_2-s)}{8\ln c} \tag{3}
$$

相邻整数之间 $(s-s_1)(s_2-s)\le 1/4$, 代入 $c=10000$:

$$
\left|a(s)-a_{\text{linear}}(s)\right|\le\frac{d}{32\ln c}\max_j|h_j|\approx\frac{d\,\max_j|h_j|}{294.73} \tag{4}
$$

而 RoFormer 的外推上界 (01 的式 (27)) 至少是 $2\max_j|h_j|$ 乘以一个数值上大于 $d$ 的和式. 两者相比, 内插的上界至少小约 $2\times 294.73\approx 600$ 倍. 式 (4) 说明: 只要预训练让整数点上的分数正常, 整数点之间的分数就不会偏离太远, 这一点由三角函数的光滑性保证.

### 2.3 PI 的效果与代价

PI 不加参数, 不改架构, 只改位置索引. 实验设置: LLaMA 7B, 13B, 33B, 65B, 在 Pile 上微调 1000 步, 扩到最长 32768 (Chen et al., 2023, §3.1).

- **不微调也有一定能力.** 表 3: LLaMA 7B 用 PI 扩到 8192, 第 0 步 (不微调) PG19 困惑度 16.10, 而直接外推超过 $10^3$; 微调 200 步后降到 7.12, 已低于原模型 2048 窗口的 7.20; 1000 步降到 6.95.
- **有效窗口很快到位.** 表 4: PI 扩展的 7B 和 33B 模型, 微调 200 步后 passkey 测出的有效窗口就达到目标 $L'$, 直到 32768.
- **长窗口确实被用上.** 表 1: 7B 扩到 32768 后, PG19 上从 2048 窗口到 32768 窗口困惑度从 7.23 降到 6.77.
- **原窗口内有退化.** 表 5: 7B 扩到 32768 后, BoolQ 从 76.1 降到 64.7, 其他几项降 1–3 个点; 扩到 8192 时退化在 2% 以内. Proof-pile 上 2048 窗口的困惑度升高 0.01–0.05 (§3.2).

退化的原因是 PI 对所有平面一视同仁地除以 $s$. 原来相距 1 个 token, 在最高频平面上差 1 弧度; 压缩后只差 $1/s$ 弧度. 相邻 token 在高频平面上的区分度被压低, 而这些平面本来没有越界, 不需要压. [Peng et al. (2023)](https://arxiv.org/abs/2309.00071) §3.1 用 NTK 理论解释: 低维输入 (位置是一维的) 如果嵌入里缺高频分量, 网络很难学到高频信息. 他们统计已有的 PI 微调工作, 扩展倍数到 $s\approx 8$ 左右输出就开始退化, 即使微调也补不回来.

### 2.4 NTK-aware: 改 base 而不是改位置

YaRN 论文把各种扩展方法统一写成对式 (20) 的两处修改, 一处改位置, 一处改频率:

$$
f'_W(x_m,m,\boldsymbol\theta)=f_W\big(x_m,\,g(m),\,h(\boldsymbol\theta)\big) \tag{5}
$$

PI 是 $g(m)=m/s$, $h(\theta)=\theta$. NTK-aware (bloc97 2023 年在社区提出, YaRN 附录 A.2 给出完整定义) 反过来, 不动位置, $g(m)=m$, 只换 base. 它想要的性质是: 最高频平面 ($i=0$) 不变, 最低频平面 ($i=d/2-1$) 和 PI 一样压 $s$ 倍. 最低频平面的指数是 $(d-2)/d$, 所以要求:

$$
b'^{\frac{d-2}{d}}=s\cdot b^{\frac{d-2}{d}}\quad\Longrightarrow\quad b'=b\cdot s^{\frac{d}{d-2}} \tag{6}
$$

换 base 后, 第 $i$ 个平面的频率变成原来的:

$$
\frac{\theta_i'}{\theta_i}=\left(\frac{b}{b'}\right)^{2i/d}=s^{-\frac{2i}{d-2}} \tag{7}
$$

$i=0$ 时比值为 1, $i=d/2-1$ 时为 $1/s$, 中间按指数平滑过渡. 插值压力从「所有平面都压 $s$ 倍」分摊成「高频几乎不压, 低频压满」.

**手算.** $d=128$, Llama 2 从 4096 扩到 131072, $s=32$. 按式 (6), $b'=10000\times 32^{128/126}\approx 3.38\times 10^5$. 按式 (7): $i=0$ 不变; $i=32$ 的频率变成原来的 $32^{-64/126}\approx 1/5.81$; $i=63$ 变成原来的 $1/32$. 作为对照, PI 会把这三个平面都压成 $1/32$.

### 2.5 NTK-aware 的问题

NTK-aware 的问题在 YaRN 附录 A.2 里写得很直接. 第一, 它不是纯内插: 中间一部分平面压得不够, 角度仍会少量越界, 所以理论上的 $s$ 不等于实际能用的扩展倍数, 实践中要把 $s$ 设得比目标更大. YaRN 表 5 的不微调结果能看出这一点: LLaMA 7B 用 NTK-aware 设 $s=2$ (名义 4096), 2048 窗口困惑度 4.08 接近原模型的 4.05, 但 4096 窗口升到 5.97, 而 PI 同设置是 3.90; 设 $s=4$ (名义 8192) 时, 4096 窗口 3.84, 8192 窗口超过 10. 第二, 因为有越界维度, 用 NTK-aware 做微调的结果反而不如 PI. 第三, 最优 base 通常要靠实验搜.

尽管如此, 改 base 这条路在工业界用得很多. YaRN 的脚注提到, Code Llama 把 base 手动设为 $10^6$, 称为 ABF (adjusted base frequency); Llama 3 预训练时就把 base 设成了 500000. 这类做法是在训练或继续训练阶段直接用大 base, 让模型在长序列上真的见过对应的角度, 和不微调直接换 base 是两种用法.

### 2.6 Dynamic NTK

推理时序列长度是逐步增长的. YaRN §3.4 区分了两种用法: 固定用目标倍数 $s=L'/L$; 或者每次前向按当前长度 $l'$ 重新算:

$$
s=\max\left(1,\frac{l'}{L}\right) \tag{8}
$$

固定 $s$ 的问题是, 短于 $L$ 的输入也被压缩, 性能平白受损, 而超过 $L'$ 时又会突然崩溃. 式 (8) 让短输入完全不变, 超过训练长度后逐渐加大缩放, 性能缓慢下降而不是断崖. 和 NTK-aware 组合就叫 Dynamic NTK, 不微调就能用. YaRN §1 提到 Qwen 7B 用的就是 Dynamic NTK.

这里有一个工程陷阱, 第 5.2 节再展开: $s$ 随长度变化时, 每个 token 的旋转都会变, 所以 KV Cache 不能存旋转后的 Key.

## 3. NTK-by-parts 与 YaRN

### 3.1 按波长分三段

NTK-aware 的式 (7) 是一条平滑曲线, 但没有直接回答「哪些平面需要插值」. YaRN §3.2 换了一个角度: 看每个平面在训练长度内转了几圈. 定义比值

$$
r(i)=\frac{L}{\lambda_i}=\frac{L}{2\pi\, b^{2i/d}} \tag{9}
$$

$r(i)$ 就是第 $i$ 个平面在 $L$ 个 token 内转过的圈数. 按 $r$ 分三种情况:

- $r$ 很大 (波长远小于 $L$): 这些平面只携带相对位置信息, 而且对区分相邻 token 很关键. 不插值.
- $r<1$ (波长大于 $L$): 训练中没转满一圈, 越界就是新角度. 完全按 PI 插值, 不允许任何外推.
- 中间: 两者混合.

用两个阈值 $\alpha<\beta$ 和一个斜坡函数实现:

$$
\gamma(r)=\begin{cases}0, & r<\alpha\\ 1, & r>\beta\\ \dfrac{r-\alpha}{\beta-\alpha}, & \text{其他}\end{cases} \tag{10}
$$

$$
g(m)=m,\qquad h(\theta_i)=\big(1-\gamma(r(i))\big)\frac{\theta_i}{s}+\gamma(r(i))\,\theta_i \tag{11}
$$

$\gamma=0$ 的平面频率除以 $s$ (等同 PI), $\gamma=1$ 的平面保持原频率. 论文对 Llama 系列给出的经验值是 $\alpha=1$, $\beta=32$.

**手算.** $d=128$, $b=10000$, Llama 2 的 $L=4096$. 按式 (9):

- $r(i)>32$ 等价于 $\lambda_i<128$, 即 $10^{4i/64}<20.4$, 得 $i\le 20$: 前 21 个平面不插值.
- $r(i)<1$ 等价于 $\lambda_i>4096$, 得 $i\ge 46$: 最后 18 个平面完全插值, 正好是第 1.2 节表里越界的那 18 个.
- 中间 $i=21,\dots,45$ 共 25 个平面线性过渡.

21+25+18=64, 覆盖全部平面. 取 $s=16$ 时, $i=21$ 的频率是原来的 0.99, $i=30$ 是 0.30, $i=45$ 是 0.063, $i\ge 46$ 是 $1/16=0.0625$.

和 NTK-aware 相比, by-parts 有两点不同. 越界的平面被完全插值, 不再留一点外推; 高频平面严格不动, 而不是近似不动.

### 3.2 加一个温度: YaRN

YaRN §3.3 观察到, 在扩展后的窗口上给 softmax 前的 logits 乘一个温度, 对困惑度的影响在不同样本, 不同位置上几乎一致. 注意力权重改为:

$$
\mathrm{softmax}\left(\frac{q_m^\top k_n}{t\sqrt{d}}\right),\qquad \sqrt{\frac{1}{t}}=0.1\ln s+1 \tag{12}
$$

式 (12) 的系数是在 LLaMA 7B, 13B, 33B, 65B 上不微调, 对不同 $s$ 拟合困惑度最低点得到的, 论文说同一组值对 Llama 2 也适用. 按式 (12), $s=8$ 时 $\sqrt{1/t}\approx 1.208$ (附录 A.3), $s=16$ 时 1.277, $s=32$ 时 1.347. 这些值都大于 1, 也就是 logits 被放大, softmax 变尖. 论文把原因归为窗口变长后注意力熵升高, 温度把它压回来.

实现上不用改注意力代码: 把预先算好的 $\cos,\sin$ 表都乘以 $\sqrt{1/t}$, $q$ 和 $k$ 各被放大 $\sqrt{1/t}$ 倍, 点积就放大了 $1/t$ 倍. 因为 $\cos,\sin$ 表是预计算的, 训练和推理都没有额外开销, 也直接兼容 FlashAttention 2.

**YaRN = NTK-by-parts 插值 + 式 (12) 的温度.** 下面的代码按式 (9)–(11) 算 YaRN 的频率, 按式 (12) 算温度系数.

```python
import math
import torch

def yarn_inv_freq(head_dim: int, base: float, s: float, L: int,
                  alpha: float = 1.0, beta: float = 32.0):
    """返回 YaRN 频率 [d/2] 与 cos/sin 表的乘子 sqrt(1/t)"""
    theta = base ** (-torch.arange(0, head_dim, 2, dtype=torch.float32) / head_dim)  # 01 篇式 (21)
    wavelen = 2 * math.pi / theta                     # lambda_i
    r = L / wavelen                                   # 式 (9): 训练长度内转过的圈数
    gamma = ((r - alpha) / (beta - alpha)).clamp(0.0, 1.0)   # 式 (10)
    inv_freq = (1 - gamma) * theta / s + gamma * theta       # 式 (11)
    mscale = 0.1 * math.log(s) + 1.0                  # 式 (12): sqrt(1/t)
    return inv_freq, mscale

inv_freq, mscale = yarn_inv_freq(128, 10000.0, s=16, L=4096)
ratio = inv_freq / (10000.0 ** (-torch.arange(0, 128, 2) / 128))
# ratio[:21] 全为 1, ratio[46:] 全为 1/16, 中间线性过渡; mscale = 1.277
# 用法: cos = (pos[:, None] * inv_freq).cos() * mscale, sin 同理
```

代码里 `ratio` 的三段对应上面手算的 21 / 25 / 18 个平面; `mscale` 乘在 $\cos,\sin$ 表上, 对应「length scaling」的实现方式.

### 3.3 实验数字

以下数字来自 [Peng et al. (2023)](https://arxiv.org/abs/2309.00071), 评估都是 Proof-pile 上滑动窗口 (步长 256) 的困惑度.

- **128k 模型.** Llama 2 7B 和 13B, PG19 切成 64k 片段微调. $s=16$ 训练 400 步; $s=32$ 从 $s=16$ 的检查点继续训练 200 步, 训练数据仍然只有 64k 长. 表 1: 7B 的 $s=16$ 模型在 65536 窗口困惑度 2.42, 到 131072 超过 10; $s=32$ 模型在 131072 窗口为 2.37. 13B 的对应数字是 2.29 和 2.24. 用 64k 的数据训出了能用 128k 的模型.
- **不微调的对比.** 表 5, LLaMA 7B, $s=16$: 32768 窗口上 YaRN 困惑度 3.45, PI 超过 $10^2$, NTK-aware 和 NTK-by-parts 都超过 10.
- **微调后的对比.** 表 5, 四种方法都微调 400 步到 32k: 32768 窗口上 YaRN 2.77, NTK-by-parts 2.81, PI 3.57, NTK-aware 8.49.
- **原窗口能力.** 表 3, Llama 2 7B 的 MMLU 从 43.8 降到 42.5 ($s=16$) 和 41.7 ($s=32$); HellaSwag 从 77.8 升到 78.8 和 78.4.
- **训练成本.** 表 4: LLaMA 7B 用 YaRN 扩到 32k ($s=16$) 用了 128 A100 小时; Chen et al. (2023) 用 PI 扩到 16k ($s=8$) 用了 640 A100 小时. 摘要的说法是比此前方法少用 10 倍 token, 少用 2.5 倍训练步数.

两点边界. 第一, YaRN 的标准结果是**微调过的**. 不微调的方案是把 YaRN 和式 (8) 的动态缩放组合起来的 Dynamic-YaRN, 论文给出的能力是不微调扩展 2 倍以上. 「YaRN 零重训」的说法混淆了这两者. 第二, 式 (12) 的系数是对 Llama 拟合的. DeepSeek-V2 用 YaRN 从 4K 扩到 128K 时 ($s=40$, $\alpha=1$, $\beta=32$, 目标最大长度 160K), 因为注意力结构不同, 把这个系数改成了 $\sqrt t=0.0707\ln s+1$.

### 3.4 四种方法放在一起

按式 (5) 的统一写法, 四种方法只在 $g$ 和 $h$ 上不同:

| 方法 | 位置 $g(m)$ | 频率 $h(\theta_i)$ | 越界维度 | 高频维度 | 温度 |
|---|---|---|---|---|---|
| PI | $m/s$ | $\theta_i$ | 完全内插 | 被压 $s$ 倍 | 无 |
| NTK-aware | $m$ | $b'^{-2i/d}$, 式 (6) | 大部分内插, 少量外推 | 几乎不动 | 无 |
| NTK-by-parts | $m$ | 式 (11) | 完全内插 | 严格不动 | 无 |
| YaRN | $m$ | 式 (11) | 完全内插 | 严格不动 | 式 (12) |

演进顺序就是每一步补上一步的缺口: PI 解决越界但压坏了高频; NTK-aware 保住高频但留下越界; NTK-by-parts 把两者按波长分开处理; YaRN 再修正长窗口下的注意力熵. 这几种方法都只改 $\cos,\sin$ 表, 推理时没有额外计算.

## 4. 多模态与 MLA 里的 RoPE

### 4.1 M-RoPE: Qwen2-VL 的做法

文本只有一个顺序. 图像 patch 有行和列, 视频还多一条时间轴. 如果把图像 patch 按行展平再用一维 RoPE, 水平相邻的两个 patch 距离为 1, 垂直相邻的两个 patch 距离却等于每行的 patch 数. 视频更糟: 同一位置在相邻两帧之间隔着一整帧的 token. 一维位置让「向右一格」「向下一格」「下一帧」变成了大小悬殊的不同距离, 而且一张大图会消耗大量位置编号, 把后续文本推到很远的位置上.

[Wang et al. (2024)](https://arxiv.org/abs/2409.12191) 的 Qwen2-VL 针对这个问题, 在 §2.1 提出 M-RoPE (Multimodal Rotary Position Embedding): 把旋转拆成时间 (temporal), 高 (height), 宽 (width) 三个分量, 每个 token 有一组三元位置 $(p^t,p^h,p^w)$. 位置编号规则是:

- **文本**: 三个分量用同一个编号, 此时 M-RoPE 和一维 RoPE 完全相同.
- **图像**: 所有视觉 token 的时间编号相同, 高和宽按 token 在图中的行列编号.
- **视频**: 每帧时间编号加一, 帧内高宽编号同图像.
- **模态切换**: 下一个模态的起始编号等于上一个模态的最大编号加一.

写成公式, 把 $d/2$ 个平面分成三组 $\mathcal I_t,\mathcal I_h,\mathcal I_w$, 第 $i$ 个平面用它所属分量的位置来旋转:

$$
\phi_i(m)=p_m^{a(i)}\,\theta_i,\qquad a(i)=\begin{cases}t, & i\in\mathcal I_t\\ h, & i\in\mathcal I_h\\ w, & i\in\mathcal I_w\end{cases} \tag{13}
$$

把式 (13) 代入 01 的式 (25), 每个平面的贡献只依赖它那一个分量的位置差, 分数整体变成:

$$
q_m^\top k_n=\sum_{i\in\mathcal I_t}c_i\big(p_m^t-p_n^t\big)+\sum_{i\in\mathcal I_h}c_i\big(p_m^h-p_n^h\big)+\sum_{i\in\mathcal I_w}c_i\big(p_m^w-p_n^w\big) \tag{14}
$$

$c_i(\Delta)$ 是第 $i$ 个平面的余弦项加正弦项, 系数由内容决定, 形式同 01 式 (25). 式 (14) 说明分数依赖 $(\Delta t,\Delta h,\Delta w)$ 三个相对位移, 每个分量在自己那组平面上保持 01 式 (23) 的平移不变性. 文本 token 三个分量相等, 三组求和合起来就是普通的一维 RoPE, 所以 M-RoPE 可以直接从纯文本的 Qwen2 初始化.

**平面怎么分.** 论文没有写分组比例. Qwen2-VL-7B 的配置里 `head_dim` 为 $3584/28=128$, 即 64 个平面, `mrope_section` 是 $[16,24,24]$. HF transformers 的实现按频率下标顺序切: 时间用最高频的 16 个平面 ($i=0..15$), 高用接下来的 24 个, 宽用最低频的 24 个. 实现用的是前后半配对的 `rotate_half`, 所以 $\cos,\sin$ 表的前半和后半各按 $[16,24,24]$ 切一次.

### 4.2 手算: 一张图消耗多少位置

Qwen2-VL 的视觉编码器 patch 为 14, 之后用一个 MLP 把相邻 $2\times 2$ 个 token 压成一个 (§2.1). 一张 $224\times 224$ 的图: $224/14=16$, 得 $16\times 16=256$ 个 patch, 压缩后 $8\times 8=64$ 个视觉 token, 前后再加 `vision_start` 和 `vision_end` 两个特殊 token, 论文给出的总数是 66.

设图像之前的最大位置编号是 $P-1$. 64 个视觉 token 的时间编号都是 $P$, 高编号取 $P,\dots,P+7$, 宽编号取 $P,\dots,P+7$. 图像之后的文本从 $P+8$ 开始. 一维 RoPE 下这 64 个 token 会占用 64 个编号; M-RoPE 下最大编号只增长了 8. 论文说这种编号方式降低了图像和视频的位置编号值, 让模型在推理阶段能处理更长的序列.

视频按每秒 2 帧采样, 用深度为 2 的 3D 卷积把相邻两帧合成一个时间步 (配置里 `temporal_patch_size` 为 2), 单张图像当作两帧相同的画面处理. 所以视频 token 的时间编号每加 1, 对应原视频的 2 帧, 即 1 秒. 训练时每段视频的 token 数上限是 16384.

### 4.3 M-RoPE 的效果与边界

表 8 的消融用 Qwen2-1.5B 加 ViT-L, 对比一维 RoPE 和 M-RoPE 的预训练模型. 视频基准提升明显: PerceptionTest 46.6→47.4, NextQA 43.9→46.0, STAR 55.5→57.9. 图像基准有升有降: MathVista 39.2→43.4, MMBench 58.6→60.6, 但 RealWorldQA 54.5→53.7, InfoVQA 50.8→50.3. 图 5 测了 Qwen2-VL-72B 在 Video-MME 中等长度视频上的表现: 训练时每段视频不超过 16K token, 推理长度到 80K token 时结果仍然稳定.

边界有两点. 第一, 时间分量的单位是「时间步」, 不是秒. 在固定 2 fps 采样下两者成正比, 采样率一变, 同样的 $\Delta t$ 就对应不同的真实时长. 第二, 时间分量只分到最高频的 16 个平面; 按 01 的频率表, 这些平面的波长从 6.3 到约 54 个时间步 (按 $i=15$ 计算), 长视频的时间间隔主要靠这些平面的高频相位区分. 这个分配是实现选择, 论文里没有讨论.

在视觉编码器内部, Qwen2-VL 去掉了 ViT 原来的绝对位置编码, 换成二维 RoPE, 用来编码 patch 的二维位置, 这样任意分辨率的图都能编码. 这和 LLM 里的 M-RoPE 是两处独立的位置编码.

### 4.4 MLA: 冲突在哪里

多模态之外, RoPE 还和 MLA 有冲突. MLA (Multi-head Latent Attention) 的公式和矩阵吸收在 [2.2.2 多头注意力变体](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/2.2.2-多头注意力变体.md) 里讲. 这里只需要它的一个性质: MLA 只缓存每个 token 的低秩向量 $c_j^{KV}\in\mathbb{R}^{d_c}$, Key 由 $k_j^C=W^{UK}c_j^{KV}$ 恢复. 不带位置时, 内容部分的分数是

$$
\big(q^C_t\big)^\top k^C_j=\big(W^{UQ}c^Q_t\big)^\top W^{UK}c^{KV}_j=\big(c^Q_t\big)^\top\underbrace{\big(W^{UQ}\big)^\top W^{UK}}_{\text{可预先合并}}c^{KV}_j \tag{15}
$$

中间的矩阵和位置无关, 推理时可以把 $W^{UK}$ 吸收进 Query 一侧, 直接拿 $c^{KV}_j$ 算分数, 不用把 Key 还原出来. 如果对 $k^C$ 加 RoPE, 分数变成 $\big(c^Q_t\big)^\top\big(W^{UQ}\big)^\top R_{\Theta,j-t}W^{UK}c^{KV}_j$, 旋转矩阵夹在中间, 而且随 $(t,j)$ 这一对变化. 矩阵乘法不可交换, 没法再预先合并成一个固定矩阵. DeepSeek-V2 §2.1.3 的说法是: 这样推理时必须为所有前缀 token 重算 Key, 会严重拖慢推理.

### 4.5 解耦: 另开一条小通道承载 RoPE

[DeepSeek-AI (2024)](https://arxiv.org/abs/2405.04434) 的解法是让内容部分完全不带 RoPE, 另外用一组多头 Query $q^R_{t,i}$ 和一个所有头共享的 Key $k^R_t$ 专门承载 RoPE (原文式 (14)–(18)):

$$
\begin{aligned}
\big[q^R_{t,1};\dots;q^R_{t,n_h}\big]&=\mathrm{RoPE}\big(W^{QR}c^Q_t\big),\qquad k^R_t=\mathrm{RoPE}\big(W^{KR}h_t\big)\\
q_{t,i}&=\big[q^C_{t,i};\,q^R_{t,i}\big],\qquad k_{t,i}=\big[k^C_{t,i};\,k^R_t\big]\\
o_{t,i}&=\sum_{j=1}^{t}\mathrm{Softmax}_j\left(\frac{q_{t,i}^\top k_{j,i}}{\sqrt{d_h+d_h^R}}\right)v^C_{j,i}
\end{aligned} \tag{16}
$$

$h_t$ 是该层输入的隐状态, $c^Q_t$ 是 Query 的低秩压缩向量, $d_h^R$ 是解耦通道每头的维度, $[\cdot;\cdot]$ 是拼接. 拼接后的点积等于两部分之和: $q_{t,i}^\top k_{j,i}=\big(q^C_{t,i}\big)^\top k^C_{j,i}+\big(q^R_{t,i}\big)^\top k^R_j$. 第一项不带位置, 式 (15) 的吸收照常成立; 第二项带 RoPE, 满足 01 式 (23) 的相对性. 位置信息只走第二项.

推理时 $k^R_t$ 也要缓存. 每个 token 的 KV Cache 是 $(d_c+d_h^R)\,l$ 个元素, $l$ 是层数. DeepSeek-V2 的设置是 $n_h=128$, $d_h=128$, $d_c=512$, $d_h^R=64$ (§3.1.2), 每层每 token 缓存 $512+64=576$ 个元素; 同样头数和头维度的 MHA 要缓存 $2\times 128\times 128=32768$ 个, 是前者的约 57 倍. 论文表 1 的说法是 $d_c=4d_h$, $d_h^R=d_h/2$ 时, KV Cache 相当于只有 2.25 组的 GQA.

缓存省下来的代价落在位置通道上. $k^R_t$ 所有头共享, 位置通道相当于一个 MQA: 每个头有自己的 $q^R$, 但对着同一个 $k^R$. 位置信息的表达能力被压到 64 维的一个共享 Key 上. 另一个连带效应是长上下文扩展只需要处理这条通道: DeepSeek-V2 做 YaRN 扩展时, 只对承载 RoPE 的共享 Key $k^R_t$ 应用 YaRN (§3.1.4), 内容通道不涉及位置, 不用动.

## 5. 工程实现与失效模式

### 5.1 数值精度: 角度必须用 float32 算

RoPE 的角度是 $m\theta_i$. 最高频平面 $\theta_0=1$, 角度就等于位置本身, 长上下文下可以到 $10^5$ 弧度. 这个乘积和后面的 $\cos,\sin$ 对精度很敏感.

- **bf16**: 有效位只有 8 位 (7 位显式尾数). 位置在 $[2^{16},2^{17})=[65536,131072)$ 区间时, 相邻可表示数的间隔是 $2^{16-7}=512$. 位置 100000 会被舍入到 512 的倍数, 在 $\theta_0=1$ 的平面上角度误差最大 256 弧度, 相位完全错乱.
- **fp16**: 最大可表示数是 65504, 位置 100000 直接溢出.
- **fp32**: 有效位 24 位, $2^{24}=16777216$ 以内的整数都能精确表示. 角度 $10^5$ 弧度时, 乘积的相对舍入误差约 $2^{-24}$, 绝对误差约 $10^5\times 2^{-24}\approx 0.006$ 弧度.

所以位置, 频率, 角度和 $\cos,\sin$ 都应该用 float32 计算, 算完再转成模型的计算精度. HF transformers 的 `LlamaRotaryEmbedding` 在 forward 里强制用 float32 计算频率 (注释指向 PR #29285), 就是为了避免混合精度训练时角度在 bf16 下被算坏. 01 第 4.4 节代码里平移不变性的容差要放宽到 `1e-4`, 原因也在这里: 角度越大, float32 下 $\cos,\sin$ 的误差也越大, 只是远没有 bf16 那么严重.

### 5.2 KV Cache 与位置编号

01 第 4.5 节说过, 标准做法是 KV Cache 存旋转之后的 Key, 每个 token 只转一次. 这依赖一个前提: 每个位置的旋转角在整个生成过程中不变. PI, NTK-aware, YaRN 用固定 $s$ 时这个前提成立. 用式 (8) 的动态缩放时不成立: 序列每长一点 $s$ 就变一点, 所有历史 token 的旋转角都要按新的 $s$ 重算. YaRN §3.4 的说法是, 正确的实现要缓存**施加 RoPE 之前**的 Key, 每次前向再按当前的 $s$ 旋转. 如果推理框架缓存的是旋转后的 Key, 又打开了动态缩放, 历史 token 会保留旧 $s$ 下的旋转角, 结果和训练时的计算不一致, 且不会报错.

缓存里每个 Key 旋转时用的是它自己的位置编号. RoPE 的输入是位置编号, 不是张量里的下标. 下面几种情况两者不一致, 要显式传 `position_ids`:

- **批量推理的左填充**: 填充 token 不应占用位置. 常见做法是按 attention mask 累加, 让每条序列第一个真实 token 的位置为 0.
- **解码阶段**: 新 token 的位置等于 cache 里已有的 token 数, 需要随每步解码递增.
- **多个文档拼成一条训练序列**: 位置可以连续编号, 也可以每个文档从 0 重来; 后者通常要配合块对角的注意力掩码.
- **多模态**: 位置是第 4 节的三元组, 由模型的预处理逻辑生成, 不能按下标推出.

### 5.3 计算与融合

RoPE 是逐元素运算, 每个元素两次乘法一次加法, 计算量 $O(Nd)$, 远小于注意力的 $O(N^2d)$. 它的开销主要是访存: 如果单独起一个 kernel, $q,k$ 要从显存读一遍, 写一遍. 常见的优化是把旋转融合进 QKV 投影之后或注意力 kernel 之前的同一个 kernel 里, flash-attn 仓库也提供了单独的 rotary kernel. $\cos,\sin$ 表按位置预先算好并在所有层之间共享, 按 $L_{\max}=131072$, 64 个平面, float32 计算, 两张表一共 $131072\times 64\times 2\times 4$ 字节, 约 67 MB.

两种维度配对 (01 第 4.2 节) 对应不同的 kernel 访存模式: 相邻维配对读取的是连续的两个元素, 前后半配对读取的是相隔 $d/2$ 的两个元素. 这只影响 kernel 写法, 不影响结果, 但权重必须和 kernel 采用的配对方式一致.

### 5.4 失效模式

| 现象 | 根因 | 处理 |
|---|---|---|
| 超出训练长度后困惑度飙到 $10^3$ 以上 | 低频平面出现未见过的角度 | PI / YaRN 并少量微调 |
| PI 扩展后短文本指标下降 | 高频平面也被压了 $s$ 倍 | 换 NTK-by-parts 或 YaRN |
| NTK-aware 到名义长度就崩 | 部分维度仍在外推 | 把 $s$ 设得比目标更大, 或换 YaRN |
| 开动态缩放后长生成逐渐变差 | KV Cache 存的是旧 $s$ 下旋转后的 Key | 缓存旋转前的 Key |
| 长上下文下注意力异常, 短上下文正常 | 角度在 bf16 下计算 | 用 float32 计算角度和 $\cos,\sin$ |
| 批量推理时部分样本输出异常 | 左填充占用了位置编号 | 显式传 `position_ids` |
| 换推理框架后输出乱码 | 维度配对方式与权重不一致 | 置换 $W_q,W_k$ 的行 |
| 对 MLA 加 RoPE 后无法矩阵吸收 | 旋转矩阵夹在 $W^{UQ}$ 和 $W^{UK}$ 之间 | 解耦 RoPE |

表里前三行来自长度扩展本身 (第 1–3 节), 症状是困惑度或下游指标变差, 跑一遍评测就能看到. 后四行出在实现上 (第 5.1–5.3 节), 共同点是程序照常运行, 不报错: 动态缩放配旋转后的缓存, 角度用 bf16 算, 左填充占位, 配对方式不一致, 都只表现为输出质量下降. 排查这几类问题, 最直接的办法是拿同一段输入, 分别用参考实现和待查实现算出某一层的 $q,k$, 逐元素比较; 01 第 4.4 节的平移不变性测试也能查出角度精度问题. 最后一行属于结构设计, 在训练前就要决定.

## 参考文献

1. [Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., & Liu, Y. (2021). RoFormer: Enhanced Transformer with Rotary Position Embedding.](https://arxiv.org/abs/2104.09864) *arXiv:2104.09864*.
2. [Chen, S., Wong, S., Chen, L., & Tian, Y. (2023). Extending Context Window of Large Language Models via Position Interpolation.](https://arxiv.org/abs/2306.15595) *arXiv:2306.15595*. 式 (3)–(7), 定理 2.1, 表 1, 3, 4, 5.
3. [Peng, B., Quesnelle, J., Fan, H., & Shippole, E. (2023). YaRN: Efficient Context Window Extension of Large Language Models.](https://arxiv.org/abs/2309.00071) *arXiv:2309.00071*. 式 (7)–(15), §3.1–3.4, 附录 A.2–A.3, 表 1, 3, 4, 5.
4. [Wang, P., Bai, S., Tan, S., et al. (2024). Qwen2-VL: Enhancing Vision-Language Model's Perception of the World at Any Resolution.](https://arxiv.org/abs/2409.12191) *arXiv:2409.12191*. §2.1, 表 8, 图 5.
5. [Qwen2-VL-7B-Instruct `config.json`.](https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct/blob/main/config.json) `rope_scaling.mrope_section`.
6. [Hugging Face transformers, `modeling_qwen2_vl.py` (v4.45.0).](https://github.com/huggingface/transformers/blob/v4.45.0/src/transformers/models/qwen2_vl/modeling_qwen2_vl.py) `apply_multimodal_rotary_pos_emb`.
7. [DeepSeek-AI (2024). DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model.](https://arxiv.org/abs/2405.04434) *arXiv:2405.04434*. §2.1.3, §3.1.2, §3.1.4, 表 1.
8. [Rozière, B., et al. (2023). Code Llama: Open Foundation Models for Code.](https://arxiv.org/abs/2308.12950) *arXiv:2308.12950*.
9. [Grattafiori, A., et al. (2024). The Llama 3 Herd of Models.](https://arxiv.org/abs/2407.21783) *arXiv:2407.21783*.
10. [Hugging Face transformers, `modeling_llama.py` (v4.45.0).](https://github.com/huggingface/transformers/blob/v4.45.0/src/transformers/models/llama/modeling_llama.py) `LlamaRotaryEmbedding`.
