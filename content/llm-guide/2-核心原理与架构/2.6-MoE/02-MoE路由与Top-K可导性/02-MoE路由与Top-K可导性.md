---
title: "02 · MoE 路由: Token-Choice, Expert-Choice 与 Top-K 的反向传播"
published: true
tags: ["MoE", "路由", "Top-K", "Expert-Choice", "ReMoE", "Soft-MoE", "SparseMixer"]
excerpt: "稀疏 MoE 的路由器决定每个 token 调用哪几个专家. Token-Choice 的两种门控顺序, Expert-Choice 与哈希路由, Top-K 在自动微分里的实际反向, 以及 ReMoE, Soft-MoE, SparseMixer 三条改写离散选择的路线."
---
# 02 MoE 路由: Token-Choice, Expert-Choice 与 Top-K 的反向传播

## 1. 离散选择与前向路由

### 1.1 问题: 条件计算需要离散选择

一层 MoE 把稠密 FFN 换成 $N$ 个专家和一个路由器. 记 token 隐状态 $x\in\mathbb{R}^{d}$, 专家 $E_i:\mathbb{R}^d\to\mathbb{R}^d$ (各是一个 FFN), 门控 $g_i(x)\in\mathbb{R}$. 1991 年 Jacobs, Jordan, Nowlan, Hinton 的 Adaptive Mixtures of Local Experts 已经有专家加门控的结构, 输出是全部专家的加权和:

$$
y=\sum_{i=1}^{N} g_i(x)\,E_i(x),\qquad
g(x)=\operatorname{Softmax}(W_g x) \tag{1}
$$

其中 $W_g\in\mathbb{R}^{N\times d}$ 是路由矩阵. 式 (1) 中所有 $g_i(x)>0$, 每个专家都要计算, 总计算量随 $N$ 线性增长. 稀疏门控把大多数 $g_i$ 置为 0, 只保留 Top-$K$ 个:

$$
y=\sum_{i\in\mathcal{S}(x)} g_i(x)\,E_i(x),\qquad |\mathcal{S}(x)|=K\ll N \tag{2}
$$

$\mathcal{S}(x)$ 是选中集合. 未选专家这一步不做前向, 也不存激活, 每 token 的计算量按 $K$ 计, 参数按 $N$ 计. Shazeer 等人 2017 年的 noisy Top-K 门控把这种稀疏性用在 LSTM 语言模型上; GShard (2020) 在 Transformer 中隔层放置 MoE, 每 token 选 2 个专家, 训练了 600B 参数的翻译模型 (2048 个 TPU v3 core, 4 天); Switch (2021) 把 $K$ 降到 1.

稀疏的代价是离散选择. $\mathcal{S}(x)$ 由排序决定, 对输入是分段常值的, 这带来两个问题: 一是 token 与专家怎么匹配 (第 1 节), 二是梯度怎么经过选择回到路由器 (第 2 节). 第 3 节和第 4 节是改写离散选择与估计离散选择项的几条路线.

### 1.2 三种匹配方式

路由从机制看是 token 与专家的匹配, 常见三条路:

1. **Token-Choice**: 每个 token 给全体专家打分, 自己挑 Top-$K$ 个. Mixtral, DeepSeek, Qwen 都用这一路. 每个 token 的专家数固定, 每个专家收到的 token 数不固定.
2. **Expert-Choice** (Zhou et al., 2022): 每个专家给一个路由组内的全体 token 打分, 自己挑固定数量的 token. 每个专家的负载固定, 每个 token 的专家数不固定.
3. **固定映射**: 哈希路由 (Roller et al., 2021) 按 token id 的哈希值分配专家, 零路由参数, 天然均衡, 但分配不随数据学习. Hash Layers 的实验显示, 即使映射不含语义, 增加专家容量也能降低损失.

把匹配写成带容量约束的全局分配问题 (例如运输问题或二分 $b$-matching) 可以同时满足两侧约束, 但每个训练 step 求解代价高. Kimi K3 的 Quantile Balancing 从这个对偶问题出发, 只保留专家侧的阈值, 见 [04](../04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md).

### 1.3 Expert-Choice

记一个路由组有 $n$ 个 token, $e$ 个专家. 先算 token–专家分数矩阵 $S=\operatorname{Softmax}(XW_g)\in\mathbb{R}^{n\times e}$, Softmax 沿专家维, 每行和为 1. 然后对每一列 (每个专家) 沿 token 维取 Top-$k$, Zhou et al. 式 (1) 把每个专家的容量写成

$$
k=\frac{n\cdot c}{e} \tag{3}
$$

$c$ 是每 token 平均使用的专家数. $c=2$ 与 GShard top-2 的计算量对齐, $c=1$ 与 Switch top-1 对齐. 记 $I[j,r]$ 为专家 $j$ 的第 $r$ 个入选 token, $G[j,r]=S[I[j,r],j]$ 为对应分数, 输出按位置回写:

$$
y_t=\sum_{j,r:\,I[j,r]=t}G[j,r]\,E_j(x_t) \tag{4}
$$

Expert-Choice 的列选择与 Token-Choice 的行选择共用同一张分数矩阵, 区别只在 Top-$k$ 沿哪一维取. 一个 token 若对所有专家的分数都排不进各列前 $k$ 名, 就不会被任何专家选中. 例如 8 个 token, 5 个专家, $c=1.25$, $k=2$: 总派遣数为 $ek=10$, 平均每 token 1.25 个专家, 某些 token 可能被两个专家选中, 某些 token 一个都没被选中, 后者在本层只有残差. Expert-Choice 按构造保证负载均衡, 不需要辅助损失.

Zhou et al. 的实验在 GLUE 与 SuperGLUE 的 11 个任务上微调评估. EC-CF2 ($c=2$) 用不到一半的步数就达到 GShard top-2 的困惑度, GShard 每步还要慢 20%, 论文把这部分归于负载不均. 100M/64E (专家大小 100M, 64 个专家) 上, 11 个任务的平均分 Switch top-1 为 78.4, GShard top-2 为 82.2, EC-CF2 为 84.0. 多数 token 分到 1 到 2 个专家, 23% 分到 3 到 4 个, 约 3% 超过 4 个; 限制每 token 最多 2 个专家 (EC-CAP2) 时平均分降到 83.2, 放宽到 3 个 (EC-CAP3) 回到 84.0. 用 token id 取模的哈希路由同样完全均衡, 平均分只有 81.3, 说明均衡本身不能解释 Expert-Choice 的收益.

代价是因果性. 一个专家在组内挑 token 时会比较同一序列中靠后位置的分数, 前面 token 被不被选中, 携带了后续 token 的信息. Wang et al. ([arXiv:2408.15664](https://arxiv.org/abs/2408.15664)) 附录 D 估算了泄露量的下界. 记稀疏比 $R=K/N$ ($K$ 为每 token 平均激活专家数), 一组 $T$ 个 token, 每个专家选 $RT$ 个, 一层所有可能的分配有 $\binom{T}{RT}^N$ 种, 平均每 token 能携带的信息为

$$
I=\frac{1}{T}\log_2\binom{T}{RT}^{N}>\frac{N}{T}\log_2\Bigl(\frac{(1-R)T}{RT}\Bigr)^{RT}=K\log_2\frac{1-R}{R} \tag{5}
$$

不等号来自 $\binom{T}{m}=\prod_{i=0}^{m-1}\frac{T-i}{m-i}$, 每个因子都不小于 $T/m>(T-m)/m$. 取 16 个专家, 平均每 token 2 个, $R=0.125$, 每层 $2\log_27\approx5.61$ bit, 9 层 MoE 合计约 50 bit, 足以让一个 token 确定后继 token 的身份. 实验上, 把做 Top-$k$ 选择的分块从 8192 个 token 缩到 512 个, 训练损失出现约 10% 的异常下降; 选择前先在 batch 内打乱 token, 下降消失. Zhou et al. 的局限一节同样承认现有实现不能直接用于自回归生成, 自回归解码每步只有一个新 token, 组内竞争也无法按训练时的方式进行.

### 1.4 Token-Choice 的门控顺序

对 $x$, 路由器先算 logits $h(x)=W_g x$. Shazeer 2017 在训练中加可学习噪声, 让落选专家也有机会被选中:

$$
h'(x)_i=h(x)_i+\varepsilon_i\cdot\operatorname{Softplus}\bigl((W_{\mathrm{noise}}x)_i\bigr),\qquad \varepsilon_i\sim\mathcal{N}(0,1) \tag{6}
$$

噪声加在排序之前, 改变的是候选集合, 不改变选择的离散性. 之后有两条实现. **先 Top-$K$ 再 Softmax** (KeepTopK, 落选坐标置 $-\infty$), 选中门控之和为 1, Shazeer 原文, Mixtral 与 Qwen 系常用这一条:

$$
h_{\mathrm{TopK}}(x)_i=\begin{cases}
h'(x)_i & i\in\operatorname{TopK}(h'(x))\\
-\infty & \text{otherwise}
\end{cases},\qquad
g(x)=\operatorname{Softmax}\bigl(h_{\mathrm{TopK}}(x)\bigr) \tag{7}
$$

**先 Softmax 再截断**, 选中门控之和小于 1, 被丢掉的概率质量仍在 Softmax 的分母里, Switch 的 Top-1 与 DeepSeek V1–V2 用这一条:

$$
p(x)=\operatorname{Softmax}(h(x)),\qquad
g_i(x)=p_i(x)\,\mathbb{1}\bigl\{i\in\operatorname{TopK}(p(x))\bigr\} \tag{8}
$$

数值例子: 8 个专家的全局 Softmax 概率 $p=(0.07,0.31,0.06,0.05,0.28,0.08,0.09,0.06)$, Top-2 选中专家 2 与 5. 按式 (8), $g_2=0.31$, $g_5=0.28$, 和为 0.59, $y=0.31E_2(x)+0.28E_5(x)$. 按式 (7), 在选中集合上重新归一化得 $g_2\approx0.525$, $g_5\approx0.475$. 两种写法的选中集合相同, FFN 分支的输出尺度相差约 1.7 倍. 从一种写法迁移到另一种时, 学习率与初始化不能直接沿用.

Switch 取 $K=1$: 每个被接收的 token 只调用一个专家, 门控是被选专家的全局 Softmax 概率. 若 logits 为 $(0.11,0.07,0.12,0.18,0.73,0.09,0.14,0.10)$, 则 $p_5\approx0.2088$ 最大, $y\approx0.2088E_5(x)$. 如果在单个选中专家上再做 Softmax, 门控恒为 1, 路由器就无法通过主损失得到梯度; Switch 保留全局概率, 固定获胜索引时 $\partial p_5/\partial h_j=p_5(\mathbb{1}[j=5]-p_j)$, 主损失可以通过 $p_5$ 调整路由器. DeepSeek V3 走第三条: 逐专家 Sigmoid 打分, Top-$K$ 后在选中集合上归一化, 负载偏置只参与排序, 见 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) 第 3.3 节.

---

## 2. Top-K 的反向与梯度

### 2.1 Top-K 的前向与默认反向

把散射回原坐标的稀疏向量写成逐坐标阈值, 阈值是第 $K$ 大的分数 $s_{[K]}$:

$$
\operatorname{TopK}(s,K)_e=s_e\cdot\mathbb{1}\{s_e\ge s_{[K]}\} \tag{9}
$$

指示函数在相等点不连续, $s_{[K]}$ 又依赖整个向量: 一个分数跨过截断线, 就会挤出另一个坐标. ReMoE 论文给过两专家 Top-1 的边界例子: Softmax 从 $(0.51,0.49)$ 变成 $(0.49,0.51)$, 稀疏门控从 $(0.51,0)$ 跳到 $(0,0.51)$.

PyTorch 的 [`torch.topk`](https://pytorch.org/docs/stable/generated/torch.topk.html) 返回最大 $K$ 个 values 与整数 indices, 文档提示并列元素的 indices 不保证稳定.

```python
import torch
x = torch.tensor([1.0, 3.0, 2.0, 4.0], requires_grad=True)
values, indices = torch.topk(x, 2)
values.sum().backward()
# x.grad -> tensor([0., 1., 0., 1.])
```

`indices` 是整数张量, 没有 `.grad`. 框架保存它, 用于在反向时定位梯度. 设无并列时保存的 indices 为 $I$, 对应的选择矩阵为 $P_I\in\{0,1\}^{K\times N}$, 每一行选取一个输入坐标. 在选中集合不变的邻域内:

$$
v=P_I s,\qquad
\frac{\partial L}{\partial s}=P_I^{\top}\frac{\partial L}{\partial v} \tag{10}
$$

若再按 $I$ scatter 回原坐标, 得到 $\tilde s=P_I^{\top}P_I s=M_I s$, 固定集合下的 Jacobian 是对角掩码 $M_I$. 式 (10) 是分段线性映射在几乎处处的普通导数; 缺的是 indices 随 $s$ 换位的导数, 这个离散映射在边界上没有唯一的经典导数.

![Top-K 前向输出稀疏向量, 反向按选中位置回传梯度](./images/fig-moe-topk-ste.png)

**图 1 解析**

- **前向**: 输入分数 $(1.0,3.0,2.0,4.0)$, $K=2$, 输出 $(0,3.0,0,4.0)$, 对应 $I=[3,1]$ (从 0 计数). 图中红字「Forward Top-K is not continuous」指的是选中集合在并列与换位处跳变, 选中集合内部的 values 仍随分数连续变化.
- **反向**: 上游梯度全为 1 时, 按式 (10) 得到 $(0,1,0,1)$, 与上面的代码一致. 若上游梯度为 $\partial L/\partial v=(2,-1)$ (按 values 的顺序, 先 4.0 后 3.0), scatter 后得 $(0,-1,0,2)$, 每个梯度回到它来源的坐标.
- **图中标签的口径**: 图里把这一步写成「Masked Identity (STE)」. `torch.topk` 的默认反向是式 (10) 的 gather/scatter Jacobian, 不需要借用 STE 的定义; STE 指第 2.3 节那种由实现者显式指定的替代梯度. 两者在这个例子上数值相同, 含义不同.
- **边界**: 当前第 2, 3 名之差为 $3-2=1$, 小扰动不改变 $P_I$. 到 $(1,3,3,4)$ 这样的并列点, 第二个坐标可能取 1 或 2, 坐标 Jacobian 不唯一.

### 2.2 从 indices 到派遣: 排序, 计数与回写

路由器输出的 indices 还要变成专家能批量计算的输入. 一个 batch 有 $T$ 个 token, 每个 token 选 $K$ 个专家, 共 $TK$ 条 (token, 专家) 记录. 常见实现分四步:

1. 把 indices 展平成长度 $TK$ 的专家编号数组, 按专家编号做稳定排序, 得到置换 $\pi$;
2. 对专家编号做直方图, 得到每个专家收到的 token 数 $c_1,\ldots,c_N$, 前缀和给出每个专家在连续缓冲区中的起止位置;
3. 按 $\pi$ 把对应 token 的隐状态 gather 到连续缓冲区, 每个专家对自己那一段做 FFN, 这一步可以用一次 grouped GEMM 完成;
4. 把专家输出乘对应门控, 按 $\pi^{-1}$ scatter-add 回原 token 位置, 同一 token 的 $K$ 份结果在这一步相加.

反向沿同一置换倒着走: scatter-add 的反向是 gather, gather 的反向是 scatter-add. 排序与直方图只产生整数, 不在梯度路径上; 梯度经过的是隐状态的搬运与门控的乘法. 固定容量的实现在第 2 步对 $c_j$ 截断, 超出容量的记录不进入缓冲区; dropless 实现保留全部记录, 只把每段长度补齐到 kernel 的块大小. 容量与丢弃的细节见 [03](../03-MoE负载均衡与容量/03-MoE负载均衡与容量.md), 多卡上的派遣与 All-to-All 见 [6.1.8 MoE 系统与并行](../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/6.1.8-MoE系统与并行.md).

这套流程也说明了为什么各专家收到的 token 数会直接影响速度. $c_j$ 由路由结果决定, 每个 step 都不同; grouped GEMM 的各段长度不同, 最长的一段决定这一层专家计算的完成时间. 专家并行时 $c_j$ 还决定每台设备要接收多少 token. 路由器的输出分布因此同时是模型问题和系统问题.

### 2.3 STE 的定义与适用范围

Bengio, Léonard, Courville (2013) 讨论的 straight-through estimator 是一种显式替代梯度: 硬阈值前向仍输出离散值, 反向由实现者指定一个便于优化的替代. 恒等版把损失对硬输出 $h_i$ 的梯度直接当作对阈值前激活 $a_i$ 的估计:

$$
\widehat{\frac{\partial L}{\partial a_i}}=\frac{\partial L}{\partial h_i} \tag{11}
$$

带 sigmoid 导数的变体为

$$
\widehat{\frac{\partial L}{\partial a_i}}=\frac{\partial L}{\partial h_i}\cdot\sigma'(a_i) \tag{12}
$$

两种实现应分开命名. 默认 Top-K 对 values 用 gather/scatter Jacobian; 自定义 STE 则为硬 mask 或离散选择另外指定替代, 例如把某个软门控的梯度接到硬前向上, 这是有偏估计. Bengio 文中还对照了 REINFORCE 族估计器. Transformer MoE 常规训练中的 `topk.values` 反向既不是 REINFORCE, 也不会自动构造选择替代.

### 2.4 固定选中集合时的门控梯度

真实 MoE 把路由 logits 变成门控, 再乘专家输出. 固定同一个离散集合 $\mathcal{S}$, 三种门控构造在落选 logits 上的梯度不同. 下面用一组四专家的例子: $K=2$, 选中专家 1 与 2, 损失只读取 $g_1,g_2$.

**全局 Softmax 后截断** (式 (8)). 设 $p=\operatorname{Softmax}(h)$, $\tilde g=m\odot p$, $m$ 是选中掩码. Softmax 的 Jacobian 为 $J_{ij}=p_i(\delta_{ij}-p_j)$, 固定 $m$ 时

$$
\frac{\partial L}{\partial h}=J^{\top}\bigl(m\odot \tfrac{\partial L}{\partial \tilde g}\bigr) \tag{13}
$$

取 $p=(0.515109,0.209428,0.171465,0.103999)$, 保留前两项后 $\sum g=0.724536$. 损失只直接读取 $g_1,g_2$, 但全局 Softmax 分母含 $h_3,h_4$, 按式 (13) 两项落选 logits 的梯度分别为 $-0.140737$ 与 $-0.085361$. 专家 3, 4 没有执行 FFN, 也没有 FFN 参数梯度, 这两个非零量只来自路由 logits 的归一化耦合.

**子集 Softmax** (式 (7)). 只在 $(h_1,h_2)$ 上归一化, $g=(0.710950,0.289050,0,0)$, 梯度为 $(0.616501,-0.616501,0,0)$, 落选 logits 不在这条计算图上. 若把全局 $p$ 在选中集合上再归一化:

$$
\frac{p_i}{\sum_{j\in \mathcal{S}}p_j}
=\frac{e^{h_i}}{\sum_{j\in \mathcal{S}}e^{h_j}},\qquad i\in\mathcal{S} \tag{14}
$$

全局分母在式 (14) 中抵消, 结果等价于子集 Softmax. 八专家的例子可以核对: 子集 Softmax 得 $g_A=(0.238071,0,0,0.585561,0,0,0.176368,0)$; 全局 Softmax 后截断得 $g_B=(0.195632,0,0,0.481177,0,0,0.144928,0)$, 选中项和为 0.821736; $g_B$ 除以 0.821736 后与 $g_A$ 一致, 数值误差约 $10^{-16}$.

**逐专家 Sigmoid** (DeepSeek V3). 对打分 $a_{i,t}=u_t^{\top}e_i$,

$$
\frac{\partial s_{i,t}}{\partial a_{j,t}}=\delta_{ij}\,s_{i,t}(1-s_{i,t}) \tag{15}
$$

不同专家不出现在彼此的导数中. 直接截断时上例梯度为 $(0.355789,-0.244458,0,0)$. 再在选中集合上归一化, 对 $i,j\in\mathcal{S}$ 有 $\partial g_i/\partial s_j=(\delta_{ij}-g_i)/\sum_{r\in\mathcal{S}}s_r$, 梯度仍只出现在 $\mathcal{S}$ 内. 全局 Softmax 后截断时, 落选专家的 logits 通过分母收到梯度; 子集 Softmax 与 Sigmoid 加子集归一化时, 落选 logits 不在门控路径上, 它们若要收到梯度, 只能来自负载损失这类使用完整概率的项. 离散的 Top-K 边界在三种构造中都存在.

### 2.5 对 MoE 训练的影响

式 (2) 对专家参数的梯度只经过 $g_i\neq0$ 的专家. 路由器的梯度有两部分: 固定选中集合时的门控梯度 (第 2.4 节), 以及选择另一位专家会怎样改变损失的离散项. SparseMixer 论文把路由参数 $W_r$ 的梯度写成

$$
\frac{\partial\mathcal{L}}{\partial W_r}=\nabla_0+\nabla_1 \tag{16}
$$

$\nabla_1$ 是已选门控与后续网络能由普通反向得到的项, $\nabla_0$ 是离散选择带来的项. 常规确定性 Top-K 训练把掩码当常数, 保留 $\nabla_1$, 令 $\nabla_0=0$.

这带来三个直接后果. 第一, 长期没有 token 的专家缺少任务梯度. 辅助损失 $f_iP_i$, 噪声门控或 aux-loss-free 偏置可以改变选择频率, 见 [03](../03-MoE负载均衡与容量/03-MoE负载均衡与容量.md); 这些机制改变专家的使用率, 不改变 Top-K 的离散边界. 第二, 路由器只能沿门控数值的局部 Jacobian 调整分数, 分数逐渐越过第 $K$ 名时选中集合才切换. 第三, Expert-Choice, 设备受限 Top-$M$ 与容量截断也包含离散门槛, 改变选择轴或取 $K=1$ 都不会消除边界.

式 (6) 的噪声可以看成对 $\nabla_0=0$ 的一种补偿: 分数接近第 $K$ 名的专家会被随机选中, 从而得到 FFN 梯度和门控梯度, 路由器也就能观察到选择这些专家后的损失. 噪声只在训练中使用, 推理阶段去掉, 选中集合由确定的 logits 决定. 噪声的尺度由 $W_{\mathrm{noise}}$ 按 token 学习, 不是固定超参.

---

## 3. 改写离散选择

### 3.1 ReMoE: 用 ReLU 替换离散 Top-K

ReMoE (Wang, Chen, Zhu, [arXiv:2412.14711](https://arxiv.org/abs/2412.14711), ICLR 2025) 的出发点是式 (9) 的跳跃: 阈值 $s_{[K]}$ 随输入变化. 把阈值固定在 0, 就得到 ReLU:

$$
\operatorname{ReLU}(s)_e=s_e\cdot\mathbb{1}\{s_e\ge 0\} \tag{17}
$$

ReLU 处处连续, 只在 0 点不可微 (用次梯度约定). 专家在开与关之间经过 0, 不再出现 $(0.51,0)$ 跳到 $(0,0.51)$ 的间断. 路由定义为去掉 Softmax, 直接 ReLU:

$$
R(x^l_t)=\operatorname{ReLU}(x^l_t W_l) \tag{18}
$$

目标稀疏度与 Top-K 对齐: 平均 $(1-K/E)$ 的门控为 0, $E$ 是专家数. 直接训练 ReLU 路由器往往变得更密 (激活更多专家等于增加计算量). ReMoE 在语言模型损失上加自适应 $L_1$ 正则, 系数按当前稀疏度 $S_i$ 乘除一个 $\alpha>1$:

$$
\mathcal{L}=\mathcal{L}_{\mathrm{lm}}+\lambda_i\mathcal{L}_{\mathrm{reg}},
\qquad
\lambda_{i+1}=\lambda_i\cdot\alpha^{\operatorname{sign}((1-K/E)-S_i)} \tag{19}
$$

$$
S_i=1-\frac{1}{LTE}\sum_{l,t,e}\mathbb{1}\{R(x^l_t)_e>0\},
\qquad
\mathcal{L}_{\mathrm{reg}}=\frac{1}{LT}\sum_{l,t}\lVert R(x^l_t)\rVert_1 \tag{20}
$$

$L$ 是层数, $T$ 是 token 数, $i$ 是训练步. 论文取 $\lambda_0=10^{-8}$, $\alpha=1.2$. ReLU 输出非负, $\lVert R\rVert_1$ 就是门控之和, $\lambda_i\mathcal{L}_{\mathrm{reg}}$ 对每个非零门控加一个把它推向 0 的梯度. 把专家激活频率 $f_{l,e}$ 乘进去, 得到兼顾负载的正则:

$$
\mathcal{L}_{\mathrm{reg,lb}}=\frac{1}{LT}\sum_{l,t,e}f_{l,e}R(x^l_t)_e,
\qquad
f_{l,e}=\frac{E}{KT}\sum_{t}\mathbb{1}\{R(x^l_t)_e>0\} \tag{21}
$$

式 (21) 与 Switch 的负载损失形式相同, 但系数不能固定. Top-K 路由的 Softmax 输出和为 1, 负载损失有下界 1; ReLU 的输出可以任意小, $\mathcal{L}_{\mathrm{reg,lb}}$ 的下界是 0, 而且 0 可以由全部门控关掉达到. 固定 $\lambda$ 时, 正则会把路由一路压向 0. 式 (19) 让 $\lambda_i$ 跟着稀疏度上下调整, 稀疏度够了就减小, 这样同一个正则项既控制稀疏度又控制负载. $f_{l,e}$ 按每层被路由的 token 绝对数计算, 激活更密的层受到更强的惩罚, 论文观察到加入负载项后各层的稀疏度分布更平滑.

ReMoE 与 Hard Top-K 的差别有四点. Top-K 的开关由相对排名决定, 跳跃在第 $K$ 名处; ReLU 的开关由绝对正负决定, 连续点在 0. Top-K 每个 token 恰好 $K$ 个专家; ReLU 每个 token 的激活数可变, 只在平均意义下接近 $K$, 论文观察到稀有 token 分到更多专家, 高频 token 分到更少, 类似 Huffman 编码给高频符号短码. 反向上 ReLU 用普通自动微分; Hard Top-K 固定选集内有门控梯度, 但常规训练不估计 $\nabla_0$. ReMoE 改的是前向路由函数, STE 与 SparseMixer 改的是反向估计.

实验设定是 LLaMA 结构, The Pile, 30B token, 激活参数 182M, $E=8$, $K=1$. Table 2 的零样本平均准确率: Dense 38.20, Lory 37.70, Hash 38.79, SparseMixer-v2 38.39, Expert-Choice 38.53, dMoE (dropless Top-K) 39.67, ReMoE 40.03. 训练分三段: 开始约 100 步接近稠密 (此时 $\lambda_i$ 还小, 多数专家都开), 随后稀疏化到目标稀疏度, 前两段约占总步数的 0.17%, 之后稳定在目标稀疏度. 前两段比 Top-K 多算, 扩展实验中给 Top-K 基线补足训练步数, 让两者总计算量相同.

扩展实验在激活参数 182M 到 978M, 专家数 4 到 128, 细粒度 $G$ 从 1 到 64 的范围内进行, ReMoE 的验证损失都低于对应的 Top-K MoE. 细粒度实验以 Dense$\times8$ 为上界, 它把 FFN 中间维放大 8 倍, 等价于全部专家都激活的 MoE. $G=32$ 与 $G=64$ 的细粒度 ReMoE 达到了这个上界, 训练和推理的 FLOPs 都少得多; 细粒度 Top-K MoE 在所有设置下都没有达到. 去掉负载项只用式 (20) 的 $L_1$ 正则时, ReMoE 的结果与调好的带负载损失的 Top-K MoE 相当, 但部分专家始终不被激活, 加上式 (21) 后所有专家都被使用, 最终损失也下降. 官方实现 [thu-ml/ReMoE](https://github.com/thu-ml/ReMoE) 在 Megatron-LM 中以 `--moe-relu-routing` 替换原路由器.

### 3.2 Soft-MoE: 连续的 token–slot 混合

Soft-MoE (Puigcerver et al., [arXiv:2308.00951](https://arxiv.org/abs/2308.00951)) 不做离散派遣. 设一段序列 $X\in\mathbb{R}^{m\times d}$, $n$ 个专家, 每专家 $p$ 个 slot, slot 参数 $\Phi\in\mathbb{R}^{d\times(np)}$. 一个 slot 是交给某个专家处理的 $d$ 维向量, 由全部 token 加权混合得到. Dispatch 权重沿 token 维做 Softmax (每列和为 1), Combine 权重沿 slot 维做 Softmax (每行和为 1):

$$
D_{ij}=\frac{\exp((X\Phi)_{ij})}{\sum_{i'=1}^{m}\exp((X\Phi)_{i'j})},\qquad
\tilde X=D^{\top} X \tag{22}
$$

$$
C_{ij}=\frac{\exp((X\Phi)_{ij})}{\sum_{j'=1}^{np}\exp((X\Phi)_{ij'})},\qquad
Y=C\tilde Y,\quad \tilde Y_{s}=f_{e(s)}(\tilde X_{s}) \tag{23}
$$

$e(s)$ 是 slot $s$ 所属的专家, 按专家优先编号时 $e(s)=1+\lfloor(s-1)/p\rfloor$. 专家处理 slot, 不直接处理原始 token; 专家调用次数等于 slot 总数 $np$, 与 token 数无关. 若 $X\Phi=0$, 三个 token 四个 slot 时 $D$ 每个元素为 $1/3$, $C$ 每个元素为 $1/4$, 可以用来核对归一化轴. 论文实现还对 $X$ 的行与 $\Phi$ 的列做 L2 归一化并加可学习缩放.

Soft-MoE 的每个输出 token 依赖全部 slot, 每个 slot 依赖全部 token, 所以原始形式跨 token 聚合, 直接用于自回归解码会读到未来位置, 论文把因果化列为未解决的问题. 视觉任务没有这一限制, 论文摘要报告 Soft MoE Huge/14 的参数量是 ViT Huge/14 的 40 倍以上, 推理时间只增加约 2%.

### 3.3 V-MoE: 按优先级派遣

V-MoE (Riquelme et al., [arXiv:2106.05974](https://arxiv.org/abs/2106.05974)) 在 ViT 的部分 Encoder block 中把 FFN 换成 Token-Choice MoE, 门控为 $g_t=\operatorname{Softmax}(Wx_t+\epsilon)$. 容量按专家分别检查:

$$
B_e=\operatorname{round}\!\left(\frac{kTC}{E}\right) \tag{24}
$$

$T$ 是路由组内 token 数, $C$ 是容量比. 默认派遣顺序按 token 位置, 容量满时位置靠后的 token 被丢. Batch Prioritized Routing (BPR) 改成按优先级派遣: 先完成所有 token 的第 1 选择, 再处理第 2 选择, 同一轮内按优先级 $s_t=\max_e g_{t,e}$ 从高到低. BPR 不替 token 改选专家, 只改变既定 Top-$k$ 派遣的尝试顺序.

例子: 16 个 token, 4 个专家, $k=2$, $C=0.75$, 由式 (24) 得 $B_e=\operatorname{round}(2\times16\times0.75/4)=6$. 第一轮 16 条 Top-1 派遣全部接收, 每个专家占 4 个槽; 第二轮按优先级处理, 前 8 个 token 的第 2 选择填满剩余 8 个槽, 后 8 个 token 的第 2 选择被跳过. 总尝试 32 次, 接收 24 次, 跳过 8 次. 论文第 4.1 节说明, 路由权重主要编码 token 与专家的匹配程度, 它被用作重要性的代理, 并非现成的前景与背景标注.

### 3.4 三种前向路由的计算预算

Hard Top-K, ReMoE 与 Soft-MoE 可以使用形状相同的专家 FFN, 但计算预算的计量方式不同, 对比实验时要分别报告. Hard Top-K 每 token 恰好 $K$ 次专家调用, 一层的专家调用总数是 $TK$, 若有容量截断还要减去被丢弃的记录. ReMoE 每 token 的调用次数可变, 只有层与 token 上的平均值被自适应 $L_1$ 拉向 $K$, 单个 batch 的实际调用数会围绕 $TK$ 波动, kernel 需要支持变长分段. Soft-MoE 的调用总数固定为 slot 数 $np$, 与 token 数解耦; 当 $np$ 远小于 $TK$ 时它更省计算, 但每个 slot 的构造与输出的重组都要与全部 token 做一次矩阵乘, 开销为 $O(m\cdot d\cdot np)$.

三者对负载均衡的需求也不同. Hard Top-K 需要辅助损失或偏置; ReMoE 把负载项并入式 (21) 的正则; Soft-MoE 的每个专家固定处理 $p$ 个 slot, 不存在专家过载.

---

## 4. 估计离散选择项与失效模式

### 4.1 SparseMixer 与 GRIN: 估计离散选择项

[SparseMixer](https://arxiv.org/abs/2310.00811) (Liu, Gao, Chen, 2023) 针对式 (16) 的 $\nabla_0$ 构造估计器. 在简化的 Top-1 设定中, 令 $D\sim\pi$ 为按路由概率采样的专家, 只计算被采样专家, 记 $h=\pi_D E_D(x)$. 一阶估计与中点二阶估计分别为

$$
\widehat\nabla_{\mathrm{1st}}=\frac{\partial\ell(h)}{\partial W_r},
\qquad
\widehat\nabla_{\mathrm{2nd}}=2\frac{\partial\ell(h/2)}{\partial W_r} \tag{25}
$$

论文用 $\delta_D=\mathbb{1}[D=\arg\max\pi]$ 在两者间选择: 采样到最大概率专家时用一阶式, 否则用中点式, 再与普通 $\nabla_1$ 合并. 估计 $\nabla_0$ 只需要当前被采样专家的输出, 不需要把所有专家变成稠密前向. 论文在 Switch Transformer 的预训练与机器翻译上报告收敛最多加快约 2 倍, 实现见 [microsoft/SparseMixer](https://github.com/microsoft/SparseMixer).

[GRIN](https://arxiv.org/abs/2409.12136) (Liu et al., 2024) 用 SparseMixer-v2: 训练时由 MaskedSoftmax 产生采样分布, 用无放回采样扩展到 Top-$K$, 以 Heun 三阶方法构造反向. 其 Top-1 算法计算 $h=p_D E_D(x)$, 采样 $B\sim\operatorname{Bernoulli}(1/4)$, 并用

$$
a=\max\!\left(\delta_D,\frac{1+2B}{3}\right),\qquad
y=h+\operatorname{detach}(ah-h) \tag{26}
$$

改变反向路径: 前向值仍是 $h$, 反向梯度按 $a$ 缩放. Top-$K$ 版本逐次采样并把已选专家的分数置为 $-\infty$, 最终求和. GRIN 另用流水线并行与张量并行避免训练中丢 token, 这属于系统配置, 与梯度估计是两项设计. 论文的 top-2 $16\times3.8$B 模型激活 6.6B 参数, 摘要报告 MMLU 79.4, HellaSwag 83.7, HumanEval 74.4, MATH 58.9.

还有一条常被当作可导 Top-K 的路线: Gumbel-Softmax (Jang, Gu, Poole, [arXiv:1611.01144](https://arxiv.org/abs/1611.01144)) 用温度把离散样本松弛成单纯形上的连续向量, 温度趋于 0 才接近 one-hot. 稀疏 MoE 需要精确的 0 才能跳过整块 GEMM, 训练时门控若是软的, 省下的 FLOPs 就没有了, 所以它没有成为 LLM 主流路由器.

### 4.2 失效模式

下表只列正文之外的排查要点.

| 现象 | 原因 | 处理 |
|------|------|------|
| 并列分数时选中专家来回变 | `torch.topk` 对并列不保证 indices 稳定 | 记录第 $K$ 与 $K+1$ 名的分差, 对并列策略做确定性测试 |
| 把 Switch 单专家门控在选中集合上归一化 | 门控恒为 1, 主损失无法训练路由器 | 保留全局 Softmax 概率 |
| 固定 ReMoE 的 $\lambda$ 后专家全部关闭 | $\mathcal{L}_{\mathrm{reg,lb}}$ 的下界 0 可由全关达到 | 用式 (19) 的自适应系数 |
| Expert-Choice 训练损失异常偏低 | 组内 Top-$k$ 泄露后续 token 信息 | 增大分块或打乱 token, 自回归模型改用 Token-Choice |

第二行和第三行是同一类问题的两面: 门控和恒为常数时, 主损失对路由器没有梯度; 正则的下界可以由平凡解达到时, 正则会把路由推向平凡解. 换一种门控或正则之前, 先检查它在全关, 全开和单专家三种极端下的取值, 能提前发现这类退化.

---

**参考文献**

1. Jacobs, R. A., Jordan, M. I., Nowlan, S. J., & Hinton, G. E. (1991). [Adaptive Mixtures of Local Experts](https://doi.org/10.1162/neco.1991.3.1.79). *Neural Computation*, 3(1).
2. Shazeer, N., et al. (2017). [Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer](https://arxiv.org/abs/1701.06538).
3. Lepikhin, D., et al. (2020). [GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding](https://arxiv.org/abs/2006.16668).
4. Fedus, W., Zoph, B., & Shazeer, N. (2021). [Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity](https://arxiv.org/abs/2101.03961).
5. Roller, S., Sukhbaatar, S., Szlam, A., & Weston, J. (2021). [Hash Layers For Large Sparse Models](https://arxiv.org/abs/2106.04426).
6. Zhou, Y., et al. (2022). [Mixture-of-Experts with Expert Choice Routing](https://arxiv.org/abs/2202.09368).
7. Wang, L., Gao, H., Zhao, C., Sun, X., & Dai, D. (2024). [Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts](https://arxiv.org/abs/2408.15664). 附录 D Expert-Choice 的信息泄露.
8. Riquelme, C., et al. (2021). [Scaling Vision with Sparse Mixture of Experts](https://arxiv.org/abs/2106.05974).
9. Puigcerver, J., et al. (2023). [From Sparse to Soft Mixtures of Experts](https://arxiv.org/abs/2308.00951).
10. Jiang, A. Q., et al. (2024). [Mixtral of Experts](https://arxiv.org/abs/2401.04088).
11. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437).
12. Bengio, Y., Léonard, N., & Courville, A. (2013). [Estimating or Propagating Gradients Through Stochastic Neurons for Conditional Computation](https://arxiv.org/abs/1308.3432).
13. PyTorch. [torch.topk](https://pytorch.org/docs/stable/generated/torch.topk.html).
14. Wang, Z., Chen, J., & Zhu, J. (2025). [ReMoE: Fully Differentiable Mixture-of-Experts with ReLU Routing](https://arxiv.org/abs/2412.14711). ICLR 2025.
15. Liu, L., Gao, J., & Chen, W. (2023). [Sparse Backpropagation for MoE Training](https://arxiv.org/abs/2310.00811).
16. Liu, L., et al. (2024). [GRIN: GRadient-INformed MoE](https://arxiv.org/abs/2409.12136).
17. Jang, E., Gu, S., & Poole, B. (2016). [Categorical Reparameterization with Gumbel-Softmax](https://arxiv.org/abs/1611.01144).
