---
title: MInference: 按 head 模式加速长上下文 Prefill
description: 解析 MInference 的离线模式搜索、在线稀疏索引、三类 GPU kernel、数值计算与质量性能边界.
published: true
---

# MInference: 按 head 模式加速长上下文 Prefill

百万 token 上下文会先把 Prefill 推到瓶颈. 输入长度为 $n$ 时, 每层要为整段 prompt 生成 $n$ 个 query, 每个 causal query 最多读取此前全部 key, QK 与 AV 的关系数接近 $n(n+1)/2$. [MInference 1.0](https://arxiv.org/abs/2407.02490)观察到, 长上下文模型的高权重位置随输入变化, 空间形状却常落在少数几类模式中. 方法先离线为每层每个 attention head 选择模式与预算, 在线再从当前 QK 的小规模代理计算中构造索引, 随后调用对应的稀疏 kernel.

这是一种**免训练的 Prefill 加速方法**. 它不修改预训练目标, 不要求继续微调, 也不声称删除 KV Cache. 原论文归纳三类模式: A-shape 保留起始 token 与局部窗口; Vertical-Slash 保留少量竖列和对角斜线; Block-Sparse 选择二维块. 模式类别对同一个 head 固定, 具体列、斜线或块由输入动态决定. 这正是名称里的动态稀疏: 动态的是索引, 不是每次请求重新搜索 kernel 类型.

论文在 A100 上报告最长可达 10 倍的 Prefill 加速, 覆盖 LLaMA-3-1M、GLM4-1M、Yi-200K、Phi-3-128K 与 Qwen2-128K 等模型及 InfiniteBench、RULER、PG-19、Needle In A Haystack 等任务. 这个数字来自特定长序列、模型和实现, 不能外推为所有长度的服务吞吐. 短序列上索引开销占比更高; Decode 每步只有一个新 query, 也不是原方法的主要受益阶段.

## 1. 方法边界与完整数据流

### 1.1. 输入输出和 shape

固定一层, 输入 hidden states 为 $X\in\mathbb{R}^{B\times n\times d}$. 投影并应用位置编码后, query 为 $Q\in\mathbb{R}^{B\times H_q\times n\times d_h}$, key 与 value 为 $K,V\in\mathbb{R}^{B\times H_{kv}\times n\times d_h}$. 对 GQA, $H_{kv}<H_q$, 逻辑上多个 query head 共享一组 KV; 官方实现会在需要时把 KV 映射或重复到对应 query head. MInference 输出 $O\in\mathbb{R}^{B\times H_q\times n\times d_h}$, 后续仍执行原模型的 head 合并与输出投影.

稠密 causal attention 为:

$$
s_{hij}=\frac{q_{hi}^{\top}k_{hj}}{\sqrt{d_h}},\qquad j\le i, \tag{1}
$$

$$
o_{hi}=\sum_{j\le i}\frac{\exp(s_{hij})}{\sum_{t\le i}\exp(s_{hit})}v_{hj}. \tag{2}
$$

MInference 为 head $h$ 和 query $i$ 构造候选集合 $\mathcal N_h(i)\subseteq\{j:j\le i\}$, 将式 (2) 的求和域改为 $j\in\mathcal N_h(i)$. 选择结果可以表示成整数索引、块坐标或隐式的几何参数, 无需物化 $n\times n$ 布尔 mask. kernel 直接从参数生成待访问 tile, 对 tile 内 QK 做精确点积, 使用在线 softmax 合并多个 tile 的统计量.

完整路径分三段. 离线阶段采样长上下文, 观察每个 head 的稠密注意力, 在候选模式与预算中搜索质量较好的配置, 写成按层按 head 的配置表. 在线索引阶段读取当前 Q/K 的一小部分或聚合统计, 估计竖列、斜线和二维块的位置. 稀疏计算阶段按配置调用 A-shape、Vertical-Slash 或 Block-Sparse kernel. **离线选择回答「这个 head 用哪种几何」, 在线索引回答「这次输入具体算哪些位置」.**

官方实现的配置按 layer 和 head 保存 `best_pattern`, 条目包含模式类型以及 vertical、slash 等预算. 前向路径从配置取出 `stream_llm`、`vertical_and_slash` 或 `block_sparse`, 再分派到相应 kernel. 配置与模型结构绑定: 层数、head 数、RoPE 处理或权重版本变化后, 原配置不再自动成立.

为什么只优化 Prefill：Prefill 同时产生 $n$ 个 query, 稠密 attention 的逻辑关系为 $O(n^2)$. 稀疏模式把每行候选限制到远小于 $n$ 的数量, 足以降低主计算. Decode 第 $t$ 步只有一个新 query, 读取 $t$ 个历史 KV, 单步关系数为 $O(t)$; 虽然上下文很长时仍昂贵, 但其并行形态、内存瓶颈和索引摊销完全不同.

MInference 1.0 的主要执行对象是 prompt 内的三角注意力矩阵. Prefill 完成后, 原始 KV 仍按模型要求写入 cache. 稀疏计算没有把未访问的 key 或 value 删除, 因为后续 Decode query 可能需要它们. 这也解释了 MInference 与下一章 KV 选择的区别: 前者本步少算 QK/AV 关系, 后者减少未来可读的 cache 状态.

训练阶段同样不使用这些 kernel. 模型按原方案完成预训练或长上下文适配, MInference 在部署时替换 attention Prefill 路径. 好处是无需承担稀疏训练与稠密部署之间的结构差异; 风险是模型没学过漏边后的 softmax 分母, 所以索引必须覆盖原 head 的主要概率质量.

### 1.3. 复杂度应怎样写

设每个 query 最终访问 $k_h(i)$ 个 key, 则 head $h$ 的精确 attention 关系数为 $E_h=\sum_i k_h(i)$. 三类模式通常通过预算把 $E_h$ 控制在近似线性或低于稠密三角的范围. 主算术约为 $O(E_hd_h)$, 但总时间还包含代理打分、reduce、top-k、索引生成、tile 去重和 kernel 调度.

设索引构造使用 $r$ 个采样 query, 对全部 $n$ 个 key 形成代理分数, 成本约为 $O(rnd_h)$; 当 $r\ll n$ 时低于 $O(n^2d_h)$. 若选出的竖列数为 $v$, 斜线覆盖宽度折算为每行 $s$, 局部窗口为 $w$, 粗略边数为 $O(n(v+s+w))$. 重叠区域要去重, 三角边界也会减少前部行的实际候选.

**复杂度成立的前提是索引在完整 QK 之前生成.** 用稠密 attention 找 top-k 再执行稀疏 attention, 只能作为分析或教师路径, 不能产生端到端加速. MInference 的关键工程贡献包含低成本近似索引和与三类形状匹配的 GPU kernel, 两者缺一不可.

## 2. 三种模式对应三种信息路径

A-shape: 起始位置加局部窗口：A-shape 在 causal 矩阵中保留左侧少量竖列与主对角线附近的局部带. 对位置 $i$, 设起始 token 数为 $g$, 局部窗口为 $w$, 候选集合可写成:

$$
\mathcal N_A(i)=\{0,\ldots,g-1\}\cup\{\max(0,i-w+1),\ldots,i\}. \tag{3}
$$

矩阵左侧竖带和下三角对角带组合后外观近似字母 A 的两部分. 起始 token 常承载 attention sink 或全局汇总作用, 局部窗口保存邻近依赖. 式 (3) 只依赖位置, 因而 A-shape 的在线索引很便宜. MInference 将这类 head 识别出来后, 直接使用规则 kernel, 无需为每个输入做复杂 top-k.

候选数最多为 $g+w$, 但两集合在序列开头有重叠. 精确边数为:

$$
E_A=\sum_{i=0}^{n-1}|\mathcal N_A(i)|. \tag{4}
$$

当 $n\gg g,w$ 时, $E_A\approx n(g+w)$, 相比稠密的 $n(n+1)/2$ 呈线性增长. A-shape 的局限也清楚: 除起始列外, 远距离证据无法一层直达. 它适合本来就集中在 sink 与邻域的 head, 不能拿同一规则覆盖所有 head.

kernel 可按固定 tile 遍历左边界和对角窗口. 地址规则, 不需要排序或 gather 大量随机块, 通常最容易获得稳定性能. 重叠 tile 必须避免重复计入 softmax. 若分别计算两部分, 应使用在线 softmax 的行最大值与分母合并, 不能把两个局部 softmax 输出直接相加.

### 2.2. Vertical-Slash: 列与相对位移

Vertical-Slash 模式包含两种统计. 竖列表示许多 query 都关注同一绝对 key 位置; slash 表示许多配对共享相对位移 $i-j=\delta$. 前者可通过沿 query 轴聚合注意力或代理分数得到列重要性, 后者可沿对角线聚合得到位移重要性. 选出集合 $C_h$ 与 $D_h$ 后:

$$
\mathcal N_{VS,h}(i)=\{j:j\in C_h,\ j\le i\}\cup
\{i-\delta:\delta\in D_h,\ 0\le i-\delta\le i\}. \tag{5}
$$

$C_h$ 和 $D_h$ 针对当前输入动态构造. 同一个 head 在摘要任务中可能选中文档段落开头, 在代码任务中可能选中定义位置. 模式仍是 Vertical-Slash, 具体坐标随 Q/K 改变. 这比固定窗口更能覆盖远程热点, 又比任意 token top-k 更容易形成规则 tile.

在线索引不直接读取全部 $n^2$ 分数. 一种代理路径是取末尾的一小段 query 与全部 key 计算点积, 用这些 query 的列聚合近似全矩阵竖线; 斜线则从局部块乘结果中统计若干相对位移. 采样 query 的数量和位置决定索引质量. 末尾 query 与生成任务当前语义较接近, 但未必代表 prompt 中所有 query. 采样过少会漏掉只在前部出现的模式, 过多则增加索引成本.

官方研究页说明, Vertical-Slash 的竖线使用 $1\times64$ 一类窄块计算, slash 使用 $64\times64$ 块覆盖. 这意味着逻辑上的单列或单条对角线会扩张为物理 tile. 扩张多算附近关系, 却换来连续加载和 tensor core 友好的形状. 报告稀疏率时应区分逻辑索引数与物理 tile 覆盖数.

Block-Sparse: 直接选择二维区域：有些 head 的高权重没有稳定列或对角线, 而是集中在若干二维块. 将 query 轴与 key 轴都按边长 $b$ 分块, 得到约 $N_q=N_k=\lceil n/b\rceil$ 个块. 第 $(u,v)$ 个块包含 query 区间 $Q_u$ 与 key 区间 $K_v$. 路由器为合法的 causal 块计算代理分数 $r_{uv}$, 每个 query 块选择 top-$k_b$ 个 key 块:

$$
J_u=\operatorname{TopK}_{v\le u}(r_{uv},k_b). \tag{6}
$$

精确 attention 随后只计算 $(u,v)$ 满足 $v\in J_u$ 的 tile. 索引可以保存为 $J\in\mathbb{N}^{N_q\times k_b}$; batch 与 head 维加入后为 $B\times H\times N_q\times k_b$. 每个元素是 key block ID, kernel 由它换算 K/V 地址.

若每块为 $b\times b$, 精确关系数上限为 $N_qk_bb^2\approx nk_bb$. 代理分数若先把每块压成摘要, 计算约为 $N_qN_kd_r$, 仍可能随块数平方增长; MInference 使用近似构造降低这项开销. 块越大, 索引越便宜、kernel 越规则, 但会多算块内低权重边. 块越小, 候选更精确, top-k 和随机访存更重.

causal 对角块需要额外三角 mask, 对角线下方块可完整计算, 上三角块必须排除. 不同 query 块的 top-k 结果也可能重复读取同一 key 块. L2 cache 能否复用取决于调度顺序; 若按 query 块独立启动 kernel, 热门 key 块可能被反复从 HBM 加载.

## 3. 离线模式搜索与在线索引

### 3.1. 每个 head 为什么需要独立配置

多头 attention 的 head 会形成不同空间结构. 有的 head 长期关注近邻, 有的集中在少数绝对位置, 还有的根据段落内容形成块. 用单一 mask 覆盖全部 head, 要么让简单 head 支付过多预算, 要么让复杂 head 丢失主要边. MInference 把模式选择粒度设为 layer-head, 配置表因此可以看作 $L\times H$ 个离散决策.

离线搜索需要一个稠密参照. 对校准输入计算原模型 attention, 分别用 A-shape、Vertical-Slash 和 Block-Sparse 在若干预算下近似, 比较输出误差或被覆盖的注意力质量, 再选可接受误差下更快的配置. 模式搜索本身可以昂贵, 因为它不在每次请求的延迟路径中. 搜索结果必须覆盖代表性任务和长度; 若校准集只有检索文本, 选出的模式未必适合代码或多轮对话.

配置固定不代表 attention mask 固定. A-shape 主要由位置确定; VS 与 Block-Sparse 仍根据输入构造坐标. 这种分层设计缩小在线决策空间: 在线阶段不比较三套完整 kernel 的效果, 只在已知模式内部估计少量索引. **把稳定的 head 类型离线化, 把随样本变化的位置在线化, 是 MInference 控制路由开销的核心.**

索引生成不能污染主成本：索引器需要满足三个条件. 第一, 读取的数据明显少于稠密 attention. 第二, 输出直接接近 kernel 需要的块索引, 避免生成巨大 mask. 第三, 索引与主 attention 可以流水或至少不引入频繁 CPU 同步. 如果把 top-k 结果拷回 CPU 排序, 再传回 GPU, 长序列计算节省会被同步时延抵消.

列聚合可对采样 Q 与全部 K 的小矩阵做 reduce. 设采样长度为 $r$, 得到 $P\in\mathbb{R}^{r\times n}$. 每列分数可取最大值或若干 query 上的和. 最大值保留一次强响应, 对偶发噪声敏感; 求和偏向被许多 query 中等关注的位置, 可能压低唯一证据. slash 聚合按相对位移把 $P_{ab}$ reduce 到一维数组, 再取 top-k 位移. Block-Sparse 则把代理矩阵按块 reduce 后选择二维坐标.

top-k 本身也有代价. 对长度 $n$ 的列分数完整排序为 $O(n\log n)$, 但只要前 $k$ 可使用选择算法、分层 reduce 或固定容量堆. GPU 上更关心读写轮数与同步, 不能只看渐近复杂度. 索引规模通常很小, 却要在每层多个 head 上重复, 因而融合 reduce 与选择会显著影响总延迟.

### 3.3. 稀疏 tile 上的在线 softmax

稀疏 kernel 仍需得到与候选集合一致的精确 softmax. 对一行 query, 不同 tile 依次产生分数片段. 维护当前最大值 $m$, 指数和 $\ell$ 与未归一化输出 $p$. 新片段分数为 $x$, 新最大值为 $m'=\max(m,\max x)$. 更新为:

$$
\ell'=e^{m-m'}\ell+\sum_t e^{x_t-m'}, \tag{7}
$$

$$
p'=e^{m-m'}p+\sum_t e^{x_t-m'}v_t. \tag{8}
$$

全部 tile 完成后 $o=p/\ell$. 式 (7)-(8)允许不物化整行分数, 也能把竖列、slash 与局部块逐段合并. 候选 tile 若重叠, 同一 $(i,j)$ 必须只进入一次, 否则对应 key 的指数权重会被重复计算. 去重可由 tile 划分规则保证, 或在 kernel 内用边界条件屏蔽.

数值稳定性沿用 FlashAttention 的行最大值技巧. 稀疏不会消除半精度溢出风险, 也不允许对每个 tile 单独 softmax 后平均. 每个 tile 的局部分母不同, 局部归一化会改变全局候选权重. MInference kernel 的职责不只是跳过零块, 还要正确合并跨 tile 统计量.

## 4. 数值手算: 从模式到输出

八 token 的 Vertical-Slash 索引：取 $n=8$, 单头 $d_h=2$, 省略 RoPE 与 $\sqrt{d_h}$ 缩放, 仅演示索引和 softmax. 假设在线索引选出竖列 $C=\{1\}$, slash 位移 $D=\{0,2\}$, 位置从 0 编号. 对 query $i=6$, 式 (5) 给出:

$$
\mathcal N(6)=\{1\}\cup\{6-0,6-2\}=\{1,4,6\}. \tag{9}
$$

令 $q_6=(1,1)$, 三个 key 为 $k_1=(2,0)$, $k_4=(0,1)$, $k_6=(1,1)$, 分数分别为 $2,1,2$. softmax 分母为:

$$
Z=e^2+e^1+e^2=2e^2+e. \tag{10}
$$

数值权重约为 $(0.422,0.155,0.422)$. 取 $v_1=(1,0)$, $v_4=(0,2)$, $v_6=(2,1)$, 则:

$$
o_6=0.422(1,0)+0.155(0,2)+0.422(2,1)=(1.266,0.732). \tag{11}
$$

若竖列与 slash 都包含位置 6, 实现必须去重, 否则 $e^2$ 会在分母出现两次, $v_6$ 也被加两次. 对位置 $i=1$, 位移 2 产生负索引, 应直接裁掉; 因此前几行的候选少于预算上限.

### 4.2. 代理索引怎样漏掉证据

假设索引器只取末尾两个 query $q_6,q_7$ 计算列分数, 并用列最大值选一个竖列. 四个候选 key 的代理矩阵为:

$$
P=\begin{bmatrix}
2.0&0.5&0.2&0.1\\
1.8&0.4&0.3&0.2
\end{bmatrix}. \tag{12}
$$

列最大值为 $(2.0,0.5,0.3,0.2)$, 所以选择第 1 列. 但若较早 query $q_3$ 对第 4 列分数为 $4.0$, 末尾采样完全看不到这次强关联. 局部窗口或 slash 可能碰巧覆盖第 4 列, 否则该边会丢失. 增加采样 query 能降低风险, 也线性增加代理矩阵行数.

这个例子说明索引质量至少要分 head、分 query 区间检查. 全矩阵覆盖率高, 不代表开头或中部 query 的关键边被覆盖. 长上下文任务通常只在末尾位置读答案, 末尾 query 权重更高有实际理由; 语言模型 Prefill 又会生成所有中间 hidden states, 中间位置的误差可能继续传播到后层.

tile 扩张的计算量：设逻辑上选 $v=2$ 条竖列, 每条列有 $n=1024$ 个位置, 理论关系为 $2048$. 若 kernel 用 $1\times64$ 块覆盖 key 方向, 每个逻辑列扩张到所在的 64 列 tile, 两列若落在不同 tile, 物理关系变成 $2\times1024\times64=131072$. 若两列落在同一 tile, 去重后只需 $65536$. 因而同样的逻辑 top-k, 物理成本会随列坐标聚集程度变化.

扩张并非纯浪费. GPU 加载一段连续 K/V 并做向量化矩阵运算, 常比逐列 gather 更有效; 附近额外边还可能提高质量. 但速度模型必须用物理 tile 数, 不能用逻辑非零数. 预算搜索如果只优化稀疏 mask 的重合度, 没把 tile 合并后成本纳入目标, 会选出准确却慢的坐标组合.

## 5. 质量与性能边界

### 5.1. 哪些误差可以被掩盖

稀疏输出误差来自两部分. 第一是候选外概率质量被删除, softmax 在剩余集合重新归一化. 第二是物理 tile 扩张加入了逻辑模式外的边. 前者通常改变输出, 后者更接近稠密结果却增加计算. 若原 attention 很尖锐, 覆盖少数峰值即可保留大部分输出; 若权重分散, 相同候选数会删除大量小权重, 它们的加权和未必小.

残差连接会缓和单层误差, 后续层也可能重新聚合, 但不能据此保证长链推理. 唯一证据、精确复制、代码括号配对和跨段否定条件都可能依赖单条边. Needle 测试能检查远程召回, 却不能覆盖所有分布式聚合需求. 因而论文同时使用长文本困惑度、检索与下游任务是必要的, 部署仍应在自身 prompt 分布上校准.

模式分配还有域迁移风险. 某个 head 在校准数据上呈 A-shape, 在另一语言、代码或表格输入上可能出现块状远程依赖. 在线只允许在 A-shape 内选位置, 无法切换成 Block-Sparse. 增大固定预算能提高鲁棒性, 但会降低速度. 更稳妥的配置应使用多任务、多长度校准, 并检查最差 head 而非只看平均重合度.

什么时候看不到加速：短序列下, FlashAttention 的稠密 tile 已有很高利用率, MInference 还要读取配置、构造索引和启动多类 kernel. 官方研究页给出的 microbenchmark 显示约 10K token 时多种 kernel 延迟接近且都低于毫秒量级, 长到 1M token 后差距才充分展开. 这表明收益有明显长度门槛, 门槛还会随 GPU、head 维度、batch 和编译版本变化.

预算过大时, 稀疏 tile 接近覆盖整个下三角, 索引成本变成额外负担. 预算过小时, 质量先下降. 多 batch 场景中, 每个样本索引不同, 难以把相同 tile 合并; ragged 长度还会造成空算. GQA 的 KV 共享可能提高 K/V 复用, 但 query head 配置不同又会访问不同 tile, kernel 调度需要处理两种粒度.

内存收益也要限定. MInference 减少 Prefill attention 中间分数与读写, 不减少模型权重, 残差、MLP 激活或最终 KV Cache 容量. 使用 FlashAttention 风格在线 softmax时, 稠密实现本来就不物化 $n^2$ 矩阵; 稀疏主要节省 QK/AV 算术和 K/V tile 访问, 不能把「逻辑矩阵从平方变稀疏」直接等同于同倍显存下降.

### 5.3. 部署检查与失效诊断

部署时先校验配置和模型一一对应: 模型权重、层数、query/KV head 数、head 维度、RoPE 版本、最大长度与 tensor parallel 切分都应匹配. 官方代码按 tensor parallel rank 计算全局 head 偏移, 配置若仍按单卡本地编号读取, 会把模式分配给错误 head. 一个配置能运行不代表分配正确, 应抽样对照层-head 映射.

性能测量应拆出 dense baseline、索引时间、稀疏 kernel 时间和其他层时间, 同时记录真实 token 数、padding、batch、dtype、GPU 与软件版本. TTFT 包含 tokenization、调度、权重前向与 KV 写入, attention kernel 的倍数不会原样变成端到端倍数. 吞吐还受并发与显存容量影响. 只报告单 kernel 延迟无法回答在线服务收益.

质量诊断可以先比较若干层的稀疏输出与稠密输出, 统计相对误差、余弦相似度和稠密概率质量覆盖率, 再跑任务. 若少数 head 误差集中, 增大对应 head 预算比全局加大稀疏率更划算. 若误差只在特定输入类型出现, 应扩充离线校准或为该模型建立多配置选择. 若 kernel 输出从短序列起就偏离, 优先检查 causal 边界、RoPE 位置、GQA head 映射、重复 tile 与在线 softmax合并.

**MInference 的质量边界由索引召回决定, 性能边界由物理 tile 和索引开销决定.** 两条边界必须同时满足. 只看 attention 热图会高估硬件收益, 只看 kernel 吞吐会忽略被漏掉的远程证据.

kernel 实现中的具体约束：**head 分派与 GQA 映射。**

官方前向实现按 head 逐个读取配置, 将 `stream_llm` 映射到 A-shape 类路径, 将 `vertical_and_slash` 和 `block_sparse` 映射到各自 kernel. 输入在不同集成中可能是 $[B,H,n,d_h]$、$[B,n,H,d_h]$ 或展平的 $[N,H,d_h]$, 进入 kernel 前必须统一. shape 转置后若忘记 `contiguous`, 后续自定义 CUDA/Triton kernel 可能按错误 stride 读取.

GQA 中一个 KV head 服务多个 query head. 设 $H_q=32,H_{kv}=8$, 每四个 query head 共享一组 K/V. MInference 的模式仍可按 32 个 query head 独立, 因为各自 Q 不同; 物理 K/V 地址却只有 8 组. 实现可逻辑 repeat KV, 也可在 kernel 内用 $h_{kv}=\lfloor h_q/4\rfloor$ 映射. 前者代码直接但可能产生额外内存, 后者要求索引与 head 映射一致.

tensor parallel 进一步改变 head 编号. 每张卡只持有局部 query heads, 配置表却通常按全局 head 编号. 若 rank $r$ 持有 $H_{local}$ 个 head, 本地 head $h$ 应读取全局编号 $rH_{local}+h$. 官方代码可见类似全局偏移处理. 配错不会触发 shape 错误, 只会让某个 head 使用另一 head 的模式, 属于难以从崩溃日志发现的质量问题.

tile 列表与工作调度：A-shape 的 tile 可由位置公式隐式生成, VS 需要列与位移列表, Block-Sparse 需要每个 query block 的 key block IDs. kernel 可以让每个 program 处理一个 `(batch,head,query_block)`, 从索引表循环读取 key blocks. 循环长度若固定, 编译器容易展开; 每行 top-k 不同时, 需要长度数组和动态循环.

负载由选中 tile 数与 causal 有效面积共同决定. 靠近序列开头的 query block 只有少量历史 key, 靠近末尾的块候选完整. 若一组 thread blocks 同时启动, 后部任务更慢, wave 尾部利用率下降. 可以按候选数排序工作项, 但排序又增加开销并扰乱 K/V cache 局部性. 固定 top-k 与固定块大小正是在准确性之外为调度提供上界.

竖列的物理形状尤其特殊. 一个 key 区间会被大量 query blocks 复用, 理想状态下可留在 L2; 斜线随 query block 移动, 地址连续但 key 区间变化. 将两类 tile放进同一 kernel 可共享 Q 与 softmax 状态, 控制流更复杂; 分成两个 kernel 则要保存中间归一化统计并增加启动. MInference 的专用 kernel是在这种融合取舍上获得收益, 不是普通稀疏矩阵乘的直接替换.

数值精度与边界 mask：Q/K 通常以 FP16 或 BF16 读取, 点积可累积到 FP32, 行最大值和指数和也应保持足够精度. 长候选集合上的 softmax 分母包含很多项, 低精度累计会造成偏差. 稀疏候选较少能减轻累计量, 却可能让极少数大 logits 主导; 减最大值仍是必要步骤.

边界 mask 包含四类: causal 上三角、序列 padding、物理 tile 扩张出的逻辑无效列、不同候选分支的重复区域. 它们都应在最大值 reduce 前置为负无穷. 若在指数计算后乘零, 极大无效 logits 仍会污染最大值或产生 `inf*0`. 末块长度不足 $b$ 时也必须按真实长度屏蔽.

正确性容差要结合 dtype. 与候选一致的高精度参考相比, BF16 输出可允许小幅绝对/相对误差; 大范围偏差通常来自索引、重复或归一化错误, 浮点舍入很少造成这种形态. 分层检查 logits、行最大值、指数和与输出, 比只看最终 hidden state 更容易定位.

## 6. 对照、性能与复现

### 6.1. 与哈希、聚类和固定窗口的差别

[哈希与聚类](./01-哈希与聚类.md)从内容向量建立桶, 通常在模型训练阶段就改变 attention 拓扑. MInference 先观察已训练模型的 attention 空间聚集形状, 再选择少量几何模板. 前者的候选边能是任意同桶关系, 后者把边压进列、对角线与二维块, 因而更容易写专用 kernel.

固定窗口完全省去在线索引, 远程边只能来自全局 token 或多层传播. MInference 的 VS 与块模式保留输入相关远程边, 代价是索引器. 当某个 head 实际就是局部加 sink, 离线搜索会选择 A-shape, 避免不必要的动态选择. 这种按 head 混合比全模型使用同一窗口细致, 配置管理也更重.

所有路线都面临同一预算三角: 候选越规则, kernel 越快; 候选越细粒度, 召回越准; 索引越充分, 路由成本越高. MInference 的取点是用少数空间模式约束动态性. 它不追求任意 top-k 的最小边数, 而是追求长 Prefill 上可执行的 tile 集合.

与 MoBA、NSA 类训练型方法的差别：MoBA 以 block 为单位进行门控, query 先选择相关 KV blocks, 再在选中块上做注意力. NSA 将压缩分支、选择分支和局部分支共同纳入训练. 这些方法让模型在训练中适应稀疏路径, 路由器也可获得专门的学习信号. MInference 面向现有模型, 不能要求重新学习表示, 所以依赖稠密 attention 已有的空间规律.

训练型方法可以让索引器和主 attention 协同演化, 也可能把训练成本保留为稠密教师或额外损失. MInference 的离线模式搜索同样使用稠密观察, 但只做一次配置生成. 在线部署不需要教师. 两类结果不能只按稀疏率横比: MoBA/NSA 的质量包含训练适配, MInference 的价值包含免训练迁移.

Decode 也是明显边界. 原生训练的块路由可以设计增量 KV 索引, MInference 1.0 主要处理完整 Prefill 三角. 把 Prefill 索引直接用于后续 Decode, 可能固定在 prompt 阶段观察到的列和块, 无法反映新 query. 若每步重建, 索引摊销又不同. 因而部署组合常让 MInference 优化 Prefill, Decode 使用原 attention 或另一套 KV 选择机制.

### 6.3. 稀疏与精确的含义

MInference 在候选 tile 内计算原 QK 点积与 softmax, 所以局部算子是精确的; 相对稠密模型的整体输出仍是近似. 「精确 sparse attention」通常只表示给定 mask 后 kernel 与数学定义一致, 不表示 mask 与稠密 top-k 完全一致. 在线索引本身是近似代理, 物理 tile 又可能扩张逻辑 mask.

这种区分对测试很重要. 第一层测试固定索引, 比较 kernel 与朴素 masked attention, 验证实现精确. 第二层比较动态索引与稠密 attention 的 top-k 或概率质量, 验证路由. 第三层跑任务, 验证误差经过多层传播后的影响. 把三层混在一个最终准确率中, 很难知道问题来自算法还是代码.

更完整的性能模型：**算术、带宽与启动开销。**

单个 head 的稠密 Prefill QK 与 AV 各处理约 $n(n+1)/2$ 个关系. 每个关系读取或复用 $d_h$ 个 K/V 元素并完成点积/加权. FlashAttention 通过 tile 在片上复用 Q/K/V, 避免写回分数矩阵, 所以瓶颈可能是算力也可能是 HBM, 取决于形状.

稀疏化将关系数改为 $E_h$, 但 tile 稀疏的实际工作为 $\tilde E_h\ge E_h$, 包含块扩张. 端到端一层时间可以分为:

$$
T=T_{proj}+T_{index}+T_{sparse}+T_{other}. \tag{13}
$$

$T_{proj}$ 是 QKV 投影与 RoPE, $T_{index}$ 是代理分数和选择, $T_{sparse}$ 是稀疏 QK/softmax/AV, $T_{other}$ 包含输出投影、通信等. MInference 只直接降低 $T_{sparse}$ 中相对稠密 attention 的部分, 并新增 $T_{index}$. 当 attention 在总层时间占比为 $f$, 即使稀疏 kernel 无限快, 理论加速也受 $1/(1-f)$ 限制.

例如稠密层时间 10 ms, 其中 attention 8 ms, 其他 2 ms. 稀疏 attention 降到 1 ms, 索引增加 0.5 ms, 新总时间 3.5 ms, 加速为 $2.86$ 倍, 不是 attention 部分的 8 倍. 长度增长后 attention 占比上升, 端到端倍数才接近 kernel 倍数.

内存容量与峰值工作区：在线 FlashAttention 已将分数工作区从 $O(n^2)$ 降为 tile 级, 因而 MInference 不应按完整 attention 矩阵宣称显存节省. 稀疏实现需要配置、代理分数、top-k 索引和临时排序空间. 如果代理矩阵为 $r\times n$, 工作区是 $O(rn)$; Block-Sparse 的块分数可能为 $N_q\times N_k$, 需通过分块或在线选择避免在极长序列上变大.

最终 KV Cache 仍保存全部 $n$ 个 token. Prefill 峰值显存还包含 Q/K/V、MLP 激活与输出. batch 增大时, 稀疏 attention 节省的临时空间可能允许更大并发, 但要实测内存分配器与工作区生命周期. 仅凭边数无法推断可增加多少 batch.

索引 dtype 通常为 32 位整数. 对 $B,H,N_q,k_b$ 较大时, 索引本身也会达到可见规模. 能用隐式公式表达的 A-shape 不应物化索引; slash 可保存位移而非每行绝对坐标; vertical 可保存列列表; 只有任意 block 选择需要完整行索引. 让表示匹配模式, 是减少控制数据的重要部分.

服务指标怎样报告：离线 microbenchmark 使用固定长度和同步计时, 能比较 kernel. 在线服务还要报告 TTFT 分布、请求吞吐、并发下显存、不同长度混批以及编译缓存命中. 动态 shape 可能触发多个编译版本; 首次请求的编译时间不应混入稳态, 但生产预热必须覆盖常见 shape.

长请求常与短请求共享 GPU. 一个百万 token Prefill 即使被加速, 仍可能阻塞短 Decode. 调度器是否支持 chunked prefill、优先级与抢占会影响用户看到的延迟. MInference 降低单次 Prefill 工作量, 不自动解决调度公平性. 在 PD 分离系统中, 收益主要发生在 Prefill 实例, Decode 实例的容量模型基本不变.

质量与性能应按长度分桶报告. 平均长度若由大量短请求主导, 会掩盖长请求收益; 只报告最长请求又会高估整体节省. 推荐至少给出 32K、128K、256K、1M 等适用长度的索引时间、attention 时间、TTFT 和任务质量, 并注明模型是否原生支持相应上下文.

### 6.5. 复现与验收路径

配置搜索的可复现性：模式搜索应记录模型权重标识、校准数据、长度分布、随机种子、候选预算、质量指标与硬件. 同名模型经过长上下文继续训练后, head 模式可能变化. 仅保存一个 JSON 而不保存生成条件, 很难判断它能否用于新权重.

校准集应覆盖部署任务. 对每个 head, 除平均误差外记录最差样本、模式胜出比例和预算敏感性. 如果 A-shape 与 VS 在平均值上接近, 规则更简单的 A-shape 可能更稳; 如果少数样本只有 Block-Sparse 能召回, 选择平均最快模式会损害尾部质量. 搜索目标可以在质量约束下最小化实测 kernel 时间, 而非最小化逻辑非零数.

更新软件或 GPU 后应重跑性能部分. 同一逻辑模式在 A100、H100 或不同 Triton/CUDA 版本上的最优 tile 可能不同. 模式的质量配置与 kernel 调优参数最好分开保存: 前者描述允许哪些边, 后者描述 block size、warp 数与流水级数. 这样硬件迁移不必重新决定 head 的语义模式.

从单层到整模验证：第一步固定小张量与手写索引, 验证三类 kernel. A-shape 检查起始/局部重叠, VS 检查负位移和重复列, Block-Sparse 检查对角块 causal mask. 第二步在真实模型单层上同时运行稠密与 MInference, 对比 shape、有限值、输出误差和索引覆盖.

第三步逐层替换. 只替换一层可定位某层配置或 GQA 映射错误; 一次替换全模型时, 误差会累积, 难以归因. 第四步跑短序列退化测试和目标长序列任务. 短序列即使不加速, 输出也不应出现异常; 长序列才检查性能收益.

单算子验证通过后再接入服务, 分离预热与稳态, 对比同请求同采样设置下的生成结果. 随机采样会放大小 logits 差异, 可先用 greedy 或固定随机种子观察. 对需要完全一致输出的业务, 任何近似 attention 都不满足 bitwise 等价; 验收目标应是任务质量与延迟阈值, 不是逐 token 必然相同.

清晰的适用结论：MInference 适合已有长上下文模型、主要瓶颈位于超长 Prefill、attention head 呈现可归纳空间模式且允许小幅近似的场景. 它的优势是免训练和针对 GPU 的模式化 kernel. 模型短上下文为主、Decode 占主导、业务要求与稠密模型逐位一致, 或 head 模式在输入域间剧烈变化时, 收益会减弱.

部署决策不应从「最高 10 倍」开始, 而应从式 (13) 的时间分解开始. attention 占比与索引、物理 tile 数决定性能上限, 目标任务则验证质量是否落在预算内. 若索引吃掉节省, 应减少采样、复用配置或选择规则模式; 若质量下降, 应按 head 增加预算或重新校准; 若 kernel 慢, 应检查 tile 聚集、head 映射与变长调度.

**MInference 将稠密模型已有的 attention 规律压成可执行几何, 价值同时依赖「规律确实存在」和「几何确实跑得快」.** 前一个条件由校准与任务验证回答, 后一个条件由索引时间、物理 tile 和端到端 Prefill 回答.

端到端复现还应保留稠密回退路径. 回退用于质量对照、异常 shape 和未覆盖模型, 不应用于掩盖 kernel 错误. 系统可以按长度阈值选择稠密或 MInference: 短请求走成熟稠密 kernel, 长请求才支付索引成本. 阈值来自目标硬件实测, 并随 batch 与并发变化, 不宜写成跨设备常数.

监控中可在低比例影子流量运行稠密对照, 比较选定层的输出差异和候选概率质量. 一旦输入域迁移导致误差上升, 重新搜索配置比全局盲目增大预算更有效, 因为异常通常集中在少数 layer-head. 线上主路径不应双算, 否则会抵消节省.

## 7. 三种模式是对二维注意力图的不同压缩

长度为 $n$ 的 causal attention 可以画成下三角矩阵，行是 query 位置，列是 key 位置。MInference 观察到不同 head 的大权重常沿几种几何结构聚集，于是不用保存任意稀疏坐标，而是用少量参数描述列、对角线和块。

A-shape 的集合表达：A-shape 保留开头 $g$ 个 key 和每个 query 最近 $w$ 个 key：

$$
N_A(i)=\{0,\ldots,g-1\}\cup\{\max(0,i-w+1),\ldots,i\}.
$$

矩阵上表现为左侧竖条加主对角线附近的带状区域，形似字母 A 的两条主结构。边数近似 $n(g+w)$，开头与窗口重叠部分要去重。

开头列可能承载 sink、系统提示或全局锚点，局部带保留近期依赖。A-shape 不做输入相关索引，执行最规则，也无法捕获任意中段的固定重要列。它适合校准中长期热点稳定落在开头的 head。

### 7.2. Vertical 表示共享 key 热点

Vertical 模式选择列集合 $V$，所有或大量 query 都读取这些 key：

$$
N_V(i)=\{j\in V:j\le i\}.
$$

若某个 token 是文档标题、分隔符、实体定义或 attention sink，它可能在许多行获得较大概率，列求和能把这种共享热点找出来。Vertical 数量为 $v$ 时，逻辑边约为 $nv$。

列热点与 causal 时间有关。位置 $j$ 之前的 query 不能读取它，竖线从第 $j$ 行向下出现，而非贯穿整矩阵。Kernel 若把整列 tile 发射，列上三角部分仍需 mask。

Slash 表示固定相对位移：Slash 线由位移 $d=i-j$ 描述。选择位移集合 $D$，query $i$ 读取

$$
N_S(i)=\{i-d:d\in D,0\le i-d\le i\}.
$$

局部窗口是连续的小位移集合；slash 可以选离散长位移，例如某种周期结构、段落间隔或固定模板关系。矩阵上是与主对角线平行的斜线。

同一 $d$ 在所有行共享，使表示非常紧凑。输入结构的间距变化时，固定 slash 可能偏离真实关系；动态索引从采样 attention 中选择当前输入的重要位移，能适应部分变化。

### 7.4. Block-Sparse 表示二维局部区域

将矩阵切成 $b_q\times b_k$ tile，选择块坐标集合 $\mathcal B$。逻辑上允许块内合法 token pair，causal 对角块还要加三角 mask。块模式能表示既非整列也非固定斜线的局部团。

块大小决定压缩粒度。块大，索引少、GEMM 利用率高，块内无关 pair 多；块小，模式更精确，元数据和调度增加。Block-Sparse head通常对应较分散、不适合一维结构概括的 attention。

三类模式的表达包含关系：Vertical 列可以用一列块近似，slash 可用沿对角线排列的块近似，A-shape也可展开成左侧块与对角块。Block-Sparse 表达更一般，未必更高效：专用 vertical/slash kernel能利用规则坐标减少索引和多算。

离线搜索在固定质量预算下选择物理执行更合适的模式，数学表达能力只是其中一个条件。所有 head 一律使用通用 block，配置会更简单，也可能失去一维规律带来的效率。

## 8. 在线索引从少量 query 估计整张图

完整 attention 权重需要先算 $n^2$ 个分数，之后再选稀疏边没有加速。MInference 用少量 query 行与全部 key 的点积作为代理，从这些行估计 vertical 列和 slash 位移，再运行稀疏 kernel。

### 8.1. 采样行构成估计器

设采样 query 集合为 $Q_s$，代理权重为

$$
\tilde A_{ij}=\operatorname{softmax}_{j\le i}\left(q_i^\top k_j/\sqrt d\right),\qquad i\in Q_s.
$$

Vertical 分数可按列累加

$$
c_j=\sum_{i\in Q_s}\tilde A_{ij},
$$

Slash 分数按位移累加

$$
r_d=\sum_{i\in Q_s}\tilde A_{i,i-d}.
$$

分别取 top-$v$ 列和 top-$s$ 位移，得到稀疏索引。代理计算量为 $|Q_s|n$，当 $|Q_s|$ 为小常数时随长度线性增长。

末尾 query 的统计偏置：实现常采样末尾若干 query，因为它们拥有最长历史，能观察全局 key。早期 query 可见范围短，列分数天然偏向开头；末尾 query 则更贴近长 prompt结束处的生成需求。

若文档不同阶段的 head模式变化，末尾样本不能代表前部行。例如每章开头关注本章标题，标题列随章节移动；最后 64 行只会突出末章结构。Block-Sparse 或分段采样更适合非平稳图。

采样数增加提高估计稳定，代理成本同步增长。应画采样行数—captured mass—索引时间曲线，选择总时间最小点，而非默认越多越准。

### 8.3. Softmax 后统计与 logit 统计不同

列分数累加概率时，每行总质量为 1，尖锐行和高熵行贡献相同总量。直接累加 logits 会受行尺度影响，也无法跨行直接比较。概率统计更接近某列承担的 attention 质量。

不同采样行的合法历史长度不同，softmax分母规模不同。靠前行概率更集中，可能放大局部 key；只采末尾行可减少这种差异。任何统计口径都带偏置，需要用完整 dense校准集验证 captured mass。

Slash 聚合的边界修正：位移 $d$ 在长度为 $n$ 的矩阵中只有 $n-d$ 个合法 pair。直接求和会偏向短位移，因为样本更多；求平均则可能让只出现少数次的大位移被噪声抬高。

可使用和、均值或带先验的归一化，三者代表不同目标：总概率质量、单 pair平均强度、平滑后的可靠强度。实现与论文配置应固定口径。评测不仅看选中位移，还看展开后捕获的总质量。

### 8.5. 代理误差的两层来源

第一层是采样误差：未采行的热点与采样行不同。第二层是几何压缩误差：即使知道全矩阵，top列和top位移也未必能覆盖散乱热点。Block-Sparse 减少第二类误差，索引更复杂。

用全矩阵离线求最佳同预算模式，得到几何 oracle；再用在线采样索引比较。两者差距衡量采样估计，几何 oracle与dense top-k差距衡量模式族限制。分开后才知道该增加采样还是换模式。

## 9. 离线搜索选择 head 的模式与预算

不同 layer-head 的注意力几何差异大。MInference 在校准集上离线决定每个 head使用哪类模式及参数，部署时配置固定，输入相关索引仍可动态生成。

搜索对象不只是模式名称：一个 head配置至少包含模式类型、vertical 数、slash 数、block数、局部窗口、初始 token数和kernel block size。质量参数与执行参数应分开：前者定义逻辑候选，后者决定如何扩成物理 tile。

模式搜索可以最小化 attention输出误差，或在误差阈值下最小化实测时间。只最小化逻辑边数会偏向碎片模式，GPU 上未必最快。只最小化单层误差，也未必对应最终任务质量。

### 9.2. Head 配置的校准泛化

校准文本若全是长文问答，代码 head或多语 head模式可能估计不足。配置随模型权重固定，却要覆盖部署输入域。按领域留出验证集，观察每个 head模式胜率和误差尾部。

输入域迁移后，可重新搜索配置，无需训练权重；这也是免训练方法的优势。重新配置仍改变近似函数，必须重跑任务验证，不能只看稀疏率。

平均误差会掩盖关键 head：某个 head在多数样本输出很小，少数关键检索样本承担决定性作用。平均 L2误差可能允许它使用过小预算，尾部任务随之失败。搜索目标可加入最大误差、分位数或特定任务约束。

Head重要性也会被后续输出投影缩放。只在 attention概率空间比较，忽略 value和 $W_O$；输出向量误差更接近层函数，最终 logits或任务指标更昂贵。多级校准先用便宜指标筛选，再用端到端验证。

### 9.4. GQA/MQA 的配置映射

多个 query head共享 KV head，不表示它们的 attention模式相同。每个 query head的 Q不同，可选择独立 vertical/slash索引；物理读取同一 K/V 的候选并集可能扩大。

若 kernel按 query head逐个执行，配置简单、K/V重复读取；按 KV group合并可复用tile，需协调各 head候选。搜索时只按单 head逻辑边优化，可能低估组级物理工作。

层间联合预算：逐 head独立满足相同误差阈值，可能在不敏感层浪费预算，在关键层不足。给整模一个总 tile预算，通过逐层敏感度分配，理论上更高效；搜索空间显著增加。

逐层替换实验能估计边际误差：只稀疏某一层，测最终 loss变化。把预算优先给敏感层，再联合微调配置。由于层间误差非线性，边际相加只是近似，最终仍需整模验证。

## 10. Tile 扩张决定物理稀疏率

逻辑 vertical是一列 token pair，GPU kernel往往以 $B_q\times B_k$ tile执行。官方实现与讨论显示 slash可能映射为较大的方块、vertical映射为窄列块。逻辑非零与实际乘法数量存在膨胀。

### 10.1. Vertical 的块覆盖

选中一个 key位置 $j$，若 key tile宽 $B_k$，物理上会读取包含 $j$ 的整块 $[\lfloor j/B_k\rfloor B_k,\ldots]$。同一块内多个 vertical列重叠，只发射一次tile；分散列各自触发块。

因此 vertical数量相同，聚集程度不同，物理tile数可差很多。索引可先把token列映射为block列并去重，真实预算按唯一block计数。为了保持质量，可在同一block中顺便保留其他 key，它们改变softmax候选。

Slash 的阶梯边界：一条斜线穿过多个二维tile。若 tile为 $64\times64$，位移落在块边界附近时可能触发相邻两条tile带；多个接近位移共享大部分tile。逻辑 slash数不能线性换算物理工作。

将位移先量化到 block offset，去重后生成tile带，可以提高规则性；精确位移误差扩大到块内。论文图中的稀疏率与kernel实际发射率应分别报告。

### 10.3. Block-Sparse 的对角块

Causal对角块只有下三角一半合法，普通块全满。专用kernel可以在对角块跳过上三角，朴素GEMM则计算后mask。末尾不足整块也产生padding。

物理候选量可写为

$$
E_{phys}=\sum_{(u,v)\in\mathcal T}\operatorname{work}(u,v),
$$

$\mathcal T$ 是去重后的tile集合。利用率 $\rho=E_{logical}/E_{phys}$ 衡量几何映射损失。性能模型至少包含 $|\mathcal T|$ 与 $\rho$。

统一 softmax 的在线合并：Vertical、slash和局部tile可能重叠。Kernel需要对同一行所有唯一key求共同最大值与指数和。FlashAttention式在线softmax可分tile累积：维护行最大 $m$、归一化和 $l$、加权输出 $o$，新tile到来时按新最大值重缩放旧累积。

若重复tile被执行两次，同一key概率重复进入分母。索引转换阶段应去重，或kernel给tile唯一所有权。分支各自softmax再相加会人为给小分支过高总质量。

### 10.5. 低利用率可能仍有收益

物理tile内多算不等于方法失败。相对完整 $n^2$，即使逻辑稀疏膨胀数倍仍可能节省巨大；规则tile还获得更高吞吐。关键比较是总kernel时间，不追求逻辑利用率单项最大。

过度追求精确1×1稀疏会产生随机gather、索引与小矩阵，实际更慢。MInference模式的价值正是把模型已有规律压成GPU可执行几何。

## 11. 输出误差应按概率质量解释

候选集合 $C_i$ 删除dense权重中的一部分。定义dense attention概率 $p_{ij}$，捕获质量

$$
R_i=\sum_{j\in C_i}p_{ij}.
$$

$R_i$ 接近1时，稀疏softmax的重归一化幅度较小；候选数量相同的两种模式，$R_i$ 更能反映输出风险。

重归一化公式：Sparse 权重对 $j\in C_i$ 为 $\hat p_{ij}=p_{ij}/R_i$。输出差异

$$
\hat o_i-o_i=
\sum_{j\in C_i}\left(\frac1{R_i}-1\right)p_{ij}v_j
-\sum_{j\notin C_i}p_{ij}v_j.
$$

误差来自保留value放大和被删value缺失。被删概率质量小通常有利，value方向抵消时实际误差还可能更小；关键value范数大时同样质量造成更大影响。

### 11.2. Head 平均会掩盖行尾

大多数 query是局部预测，$R_i$很高；少数远距查询漏掉证据，平均仍漂亮。按 query分位数、距离和任务证据位置报告 captured mass，尤其关注末尾query，因为长prompt通常在末尾提出问题。

采样索引本就使用末尾query，可能对末尾质量更好、前部较差。语言模型loss覆盖所有位置，问答只关心末尾，两类指标权重不同。

Oracle pattern 分离模式与估计：给定模式族和预算，用完整dense矩阵离线选择最佳vertical/slash/block，得到oracle captured mass。在线代理索引与oracle差距是估计误差；oracle与dense top-k差距是几何限制。

如果oracle VS已差，应换Block-Sparse或加预算；oracle好、在线差，应增加采样或改统计；captured mass高但任务差，检查value、层间累积或kernel错误。

### 11.4. 多层近似的级联

早层输出误差改变后续Q/K，也改变在线索引。各层captured mass均高，不保证最终误差简单相加。逐层替换和恢复dense实验用于定位敏感位置。

某层换回dense后质量大幅恢复，说明该层模式或预算是瓶颈；所有单层影响小、全稀疏影响大，说明误差累积。可以只给少数敏感层更大预算，保持整体速度。

## 12. MInference 的阶段边界

原始目标是加速长prompt Prefill并生成KV cache。Decode每步只有一个query，完整历史K/V仍保留；Prefill稀疏没有自动压缩后续cache或Decode读取。

Prefill 稀疏计算仍生成完整 KV：每个token每层的K/V由线性投影产生，与attention候选数量无关。MInference跳过部分QK和PV配对，通常仍保存所有位置KV供Decode或其他KV方法使用。显存随prompt长度增长。

将MInference与Quest、SnapKV等KV选择/压缩组合，是第二项机制。质量误差与成本要分开归因：Prefill近似影响hidden state，KV压缩影响Decode可见历史。

### 12.2. Chunked Prefill 改变索引视野

服务可能把长prompt分chunk处理。若每chunk独立从其末尾采样，索引只看当前块或已有历史的接口取决于实现；完整MInference索引基于整段Q/K，语义可能不同。官方README对某些vLLM路径给出chunked prefill配置限制，部署应核对版本。

严格等价的chunked实现需要让当前chunk query访问所有历史候选，并保持全局vertical/slash统计。跨chunk索引状态如何累计，是额外设计。直接套用独立chunk会丢掉跨块模式。

Decode 动态索引的成本结构不同：单query无法用大量采样行估计整张attention图；可以复用Prefill得到的vertical/slash，也可能错过生成阶段新热点。每步全历史打分建索引会抵消稀疏收益。

因此Prefill加速结论不能直接外推TPOT。端到端请求prompt很长、输出短时收益明显；prompt短、输出长时Decode主导。报告TTFT、TPOT和总时延三项。

### 12.4. KV 生命周期保持dense语义

只要未来Decode仍可能读取任意旧KV，就不能因Prefill某层没选中它而删除。当前prompt中低权重不代表未来query低权重。用MInference候选推断KV淘汰会把一次性计算稀疏误当成永久无用。

若另加动态KV压缩，需要明确未来查询近似与恢复路径。两套索引可能采用不同统计，候选交集过小会累积质量损失。

## 13. 六个可复算反例

移动标题破坏固定 vertical：校准文档标题总在位置0，某head配置为A-shape开头64列。部署模板在前面加入100 token系统提示，标题移到位置100。固定开头列只覆盖系统提示，标题不再可见。

动态vertical若从末尾query概率选列，可以找到位置100；静态A-shape无法适应。这个反例区分固定模式参数与输入相关索引。

### 13.2. 章节间距变化破坏 slash

训练文本每章长度1024，query常关注上一章同一相对位置，slash位移1024。部署章节长度在800—1400波动，固定斜线偏离。Block-Sparse或多个邻近slash增加覆盖，成本上升。

动态采样若当前末尾query呈现真实位移，可选新slash；文档各章间距不同，则单组全局位移仍无法覆盖所有行。

稀有关键列被列和淹没：某key只对最后一个query极重要，其他采样行权重为0；另一列对64个query各有中等权重。按列和，后者排名更高，top vertical漏掉单次关键key。

使用列最大值能保留尖峰，容易被噪声异常值干扰。和、最大值与分位数对应不同风险偏好。问答任务可提高最后query权重。

### 13.4. Block均值漏掉块内唯一token

Block索引用块平均Q/K估计相关性。一个key block有63个无关token和1个与query高度相似token，均值稀释该方向，整块未选中。Dense top-k会准确找到唯一token。

减小block、使用max或多个代表向量能改善，索引与tile数增加。这个反例说明块表示是质量瓶颈，不只是kernel粒度。

逻辑slash映射成重复tile：选择位移100与101，在64 tile下两条斜线触发几乎相同tile带。逻辑预算算两条，物理工作没有翻倍，新增覆盖也有限。选择更分散位移可能用同样slash数触发更多tile，却捕获不同关系。

配置搜索若只按slash数约束，无法控制真实时间。用转换后的唯一tile集合评估，才能与kernel一致。

### 13.6. 高 captured mass 仍漏符号复制

候选捕获99%概率质量，遗漏的1%恰好指向包含随机密码的value；其他99%是背景。输出投影和后续层可能需要这条小概率通道完成精确复制。平均向量误差小，任务答案错误。

关键任务需用反事实证据干预和端到端准确率约束。Captured mass是必要诊断，不是质量证明。

## 14. 模式搜索可以写成受约束优化

对每个 head $h$，候选配置集合为 $\mathcal C_h$。配置 $c$ 有质量损失 $e_h(c)$、逻辑边 $E_h(c)$、物理tile $T_h(c)$ 与实测时间 $t_h(c)$。独立搜索可写为

$$
\min_{c\in\mathcal C_h}t_h(c)\quad\text{s.t.}\quad e_h(c)\le\epsilon_h.
$$

这比「选最稀疏模式」多了硬件与质量两条约束。$t_h$ 随batch、长度和GPU变化，$e_h$ 随校准域变化，最终配置绑定二者。

误差阈值的层级分配：所有head使用相同 $\epsilon$ 很简单，敏感度并不相同。某head输出经 $W_O$ 强烈放大，较小attention误差也影响logits；另一个head近似冗余，可承受更稀疏。

可以用单head替换实验估计敏感系数 $s_h$，约束 $s_he_h(c)\le\bar\epsilon_h$。系数只是一阶近似，多head同时误差会相互作用。整层和整模验证仍不可省略。

### 14.2. 全局tile预算的资源分配

给整层物理tile预算 $B$，选择每个head配置：

$$
\min_{c_1,\ldots,c_H}\sum_h e_h(c_h)
\quad\text{s.t.}\quad
\sum_hT_h(c_h)\le B.
$$

这类似离散背包。枚举每head若干Pareto候选，再用动态规划或贪心按边际收益分配。相比统一vertical/slash数，它能把预算给真正需要的head。

GPU执行时间未必等于tile数之和。Head配置不同导致分支与负载不均，最慢head或kernel批次决定时间。搜索目标最好使用真实分组kernel计时，而非纯加法模型。

多长度联合搜索：部署输入长度分布为 $P(n)$，配置在8K快不代表128K快。可最小化期望时间 $\mathbb E_{n\sim P}t(c,n)$，同时对各长度质量设约束。长尾请求若有严格SLO，还要限制高分位。

Vertical和slash数量固定时，稀疏率随 $n$下降；block预算若按比例增长，时间曲线不同。配置文件需明确参数是绝对数量还是长度比例。

### 14.4. 搜索集过拟合

在少量样本上枚举大量配置，最优结果会吸收校准噪声。独立验证集、限制配置复杂度和报告多样本方差，可以降低过拟合。

静态pattern在训练域很好、部署域下降，优先重新校准而非直接否定模式族。若动态索引也下降，注意力几何本身可能变化，需扩大预算或回退dense。

## 15. Kernel 的正确性不等于数值逐位一致

稀疏attention改变候选，结果本就不同于dense；在同一候选集合上，kernel还会因tile顺序、FP32累加和近似指数产生浮点差异。验收要分模型近似与数值实现。

三层参考：第一层参考是显式布尔mask加dense attention，验证候选语义；第二层是普通gather后的稀疏PyTorch实现，验证索引与softmax；第三层是优化kernel。第一与第二应在相同mask下接近，第二与第三在规定容差内接近。

直接拿优化kernel对完整dense，差异同时包含候选删边与数值顺序，无法定位。小尺寸金样应打印每行唯一key集合和物理tile。

### 15.2. Online softmax 的块合并

处理新tile时，旧最大值 $m$、和 $l$、输出累积 $o$ 与新tile最大 $m'$ 合并。总最大 $m_{new}=\max(m,m')$，旧量乘 $e^{m-m_{new}}$，新量乘 $e^{m'-m_{new}}$。遗漏重缩放会在tile分数尺度不同时产生大误差。

测试让第一个tile logits很大、第二个很小，再交换处理顺序；输出应接近一致。只测分数相近的随机输入，错误可能不明显。

全 mask 行与边界行：Causal早期query、padding或错误索引可能产生无合法key行。Softmax全负无穷会NaN。正常模型至少保留self或初始位置，kernel应断言候选非空。

对角block的上三角被mask后，每行有效数不同。行最大与指数和不能让无效元素进入。末块padding同理。

### 15.4. 重复tile与重复token

Vertical与slash可能映射同一tile，两个slash也可能重叠。Tile级去重后，块内token候选是集合；若token级mask在两个路径重复散射，仍要确保只出现一次。

构造同一key通过三条模式命中的样例，输出应与只保留一条相同。概率增加约三倍说明重复进入softmax。

反向并非主要部署路径仍需边界：MInference主要面向推理Prefill，若用于训练或梯度分析，反向需要同一稀疏mask。动态索引通常视为离散常量，梯度不通过top-k选择；只对选中Q/K/V传播。

研究代码若用dense反向近似稀疏前向，会产生不匹配梯度。部署无反向不受影响，微调场景必须说明支持范围。

## 16. 输入域变化会改变几何模式

注意力pattern来自模型、层、head与输入共同作用。模型固定不意味着每个head永远属于同一类型；离线配置只是在目标分布上的有效近似。

### 16.1. 文档、代码与对话的差异

长文档常有标题、段落和问句，vertical热点可能稳定；代码存在定义—使用与缩进块，相关列分散；对话包含系统提示、轮次标记和最近消息，A-shape更自然。统一配置会偏向校准数据占比最高的域。

按域报告模式胜率：同一head在多少样本由A、VS、Block获胜。胜率接近说明head不稳定，可选更通用模式或给更大预算。

Prompt 模板移动固定锚点：系统提示长度变化、加入few-shot、工具schema或多模态token，会移动标题与问题位置。A-shape固定开头仍覆盖系统前缀，真正任务锚点可能移出。

动态vertical能从采样行寻找新列，前提是目标在采样query中已显重要。模板升级后运行校准差异，不应假设权重没变就无需重搜。

### 16.3. 长度变化改变模式可见性

在8K校准中，局部窗口可能覆盖大部分依赖，VS与A差距小；到128K，远端模式才显现。短长度搜索出的A-shape可能只是窗口足够宽，不代表长长度仍合适。

校准长度应覆盖部署范围。无法用dense跑百万token时，可在中等长度测几何，再用任务与低比例dense分层验证；不应凭8K图直接外推1M。

模型微调改变 head 职责：SFT、长上下文继续训练或LoRA会改变Q/K。基础模型pattern配置可能失效。即便LoRA参数少，作用于Q/K投影时足以移动热点。

配置版本应绑定完整权重与adapter。切换adapter后可先运行小校准集，若captured mass保持再复用；否则重新搜索。

### 16.5. 线上漂移检测

线上不能全量dense对照，可用代理指标：采样query上候选captured mass、top候选边界margin、模式索引变化、输出范数异常。低比例影子dense给这些代理校准阈值。

漂移集中少数head时，只提高它们预算或改模式；全局增大预算浪费。配置热更新要带版本，已有请求最好保持同一配置，避免prompt中途函数变化。

## 17. 与其他稀疏路线的接口边界

MInference按已有head几何做免训练Prefill近似，与训练原生NSA、动态block路由MoBA、细粒度indexer和KV压缩解决的问题不同。组合时每阶段职责要清楚。

与训练原生稀疏：训练原生方法让权重从头适应候选，可能学会把信息组织到稀疏路径；MInference不改训练，要求dense模型本就呈现可压缩pattern。免训练部署快，理论质量上限受既有几何。

把MInference用于已训练稀疏模型，要确认dense参考和pattern含义。若模型训练mask已删边，再做第二次近似，候选交集可能过窄。

### 17.2. 与细粒度 indexer

Indexer按query预测重要key，适应内容更强；MInference的vertical/slash在多个query间共享结构，更规则。可以先用MInference选tile，再由indexer在tile内选token，或反过来由粗indexer选区域。

两阶段端到端召回为各阶段条件召回乘积。增加后级精度无法恢复前级漏掉的区域。Kernel布局也要看最终唯一tile，而非分别统计两次稀疏率。

与 KV 压缩：Prefill MInference仍生成完整KV；压缩方法删掉或量化部分KV用于Decode。两者串联时，Prefill hidden近似会改变生成的K/V，压缩评分又基于这些表示。

质量消融包含densePrefill+denseKV、稀疏Prefill+denseKV、densePrefill+压缩KV、两者组合四项。组合下降超过单项和，说明误差相互放大。

### 17.4. 与 FlashAttention

FlashAttention是精确dense IO-aware kernel，MInference是近似稀疏候选加专用kernel。短序列或pattern不稀疏时，成熟dense kernel可能更快。比较应以当前硬件最佳dense实现为基线。

Sparse kernel同样采用分块与online softmax思想。算法节省tile，kernel负责不物化矩阵并高效合并。只替换mask而仍运行dense FlashAttention，不会得到MInference的主要速度收益。

与线性 attention：线性attention把历史压成固定状态，所有query读取摘要；MInference保留选中token的精确K/V softmax，未选pair消失。前者状态可固定，后者Prefill计算稀疏但KV通常完整。

任务需要原token精确值时，MInference候选命中后保持高分辨率；线性状态存在压缩干扰。流式无限生成时，线性state资源更稳定，MInference本身不解决长期KV增长。

## 18. 一套完整配置的手算

取 causal 长度 $n=16384$，head dimension 128。某head选择vertical $v=64$、slash $s=128$，采样最后 $m=64$ 个query，tile为 $64\times64$。

### 18.1. 索引成本

采样QK需要约 $mn=1{,}048{,}576$ 个点积，每个维度128。Dense整头需要约 $n(n+1)/2\approx134.2$M个点积。代理点积约为dense的0.78%，还需列/对角归约与top-k。

这只是单head逻辑量。所有head逐个代理会乘head数；GQA可复用K读取，Q仍不同。索引kernel若无法批量化，启动与归约可能增加占比。

逻辑候选上界：忽略重复与边界，每行 $v+s=192$ 个候选，总逻辑pair约 $3.15$M，是dense causal的约2.34%。实际vertical与slash交点重复，唯一pair略少；靠近序列开头的slash无合法key，也会减少。

若另保留局部窗口256，候选上界变448，重复更多。统一softmax的候选集合必须去重。

### 18.3. Tile 膨胀

64个vertical token最坏分散到64个key block，每个query block发射64个vertical tile；若聚集在16个block，只需16个。128条slash映射到多少tile带取决于offset量化，接近offset大量重叠。

逻辑2.34%不能直接当物理稀疏率。转换索引后统计每个query block的唯一tile，乘4096得到物理pair上界，再算利用率。

质量预算：在dense校准中，若候选平均捕获99.5%概率、最差1% query只捕获80%，平均输出可能接近，尾部远距任务仍风险高。增加vertical/slash前先定位低捕获query属于哪种几何。

若Block-Sparse oracle在这些query达到98%，应将相关head换模式；若所有同预算oracle都低，增加预算或保留dense。全局把192增到256可能浪费在本已99.9%的head。

### 18.5. 端到端上限

假设原Prefill中attention占80%，其余投影与MLP占20%；attention连同索引加速8倍，端到端理想加速

$$
S=\frac1{0.2+0.8/8}\approx3.33.
$$

即使kernel局部达到10倍，完整模型不可能同倍数。通信、框架与索引未计入时，上式仍偏乐观。实测分项应与上限对照。

## 19. 从失败现象反推模式问题

同样的任务下降可能来自模式族、在线估计、tile扩张、数值kernel或输入漂移。按现象建立诊断路径，比反复全局增加稀疏预算更有效。

只有远距随机键值失败：局部语言建模正常、随机needle失败，先检查目标key是否进入候选。Dense attention对目标权重高、几何oracle不含目标，说明当前模式族表达不足；oracle含目标、在线索引未选中，说明采样估计不足。

在线候选含目标而输出仍错，检查统一softmax、value读取和后层误差。将目标key强制加入候选是最快的因果干预。

### 19.2. 所有任务轻微下降

广泛小幅下降可能来自每层低概率质量累计、数值精度或重复候选改变归一化。逐层恢复dense，画loss恢复曲线；若没有单一敏感层，考虑减少稀疏层数或提高全局captured mass。

同一候选的PyTorch参考也下降，属于近似；参考正确、kernel下降，属于实现。不要用端到端微调掩盖kernel偏差。

某些模板突然恶化：Prompt前缀移动、问题位置变化或多模态token加入会改变vertical热点与slash间距。比较新旧模板的采样attention统计，定位哪些head索引变化最大。

A-shape head尤其依赖固定开头语义。改为动态vertical或扩大初始区域能恢复时，问题来自模板锚点；只增加局部窗口无效则进一步支持该判断。

### 19.4. 延迟平均下降但尾部上升

Block-Sparse每请求选块数不同、索引top-k形状变化或某些head回退dense，会制造长尾。按请求记录唯一tile、最大head预算、fallback和编译cache命中。

Batch时间由最慢请求或分支决定。平均逻辑稀疏率不能解释P99。限制动态预算上限、按pattern分组batch或给异常请求独立执行，是系统层选择。

长度越长加速比反而下降：理论上dense平方增长，稀疏应更占优。若实测反向，检查索引是否随长度超线性、tile数是否按比例膨胀、显存不足触发低效路径、chunked prefill是否改变执行。

Vertical/slash绝对数量固定时，逻辑比例下降；但代理采样仍需扫全部key，成本线性。Attention主体足够稀疏后，索引、投影和MLP成为主项，加速比会趋于上限而非无限增长。

### 19.6. 多卡比单卡收益差

Tensor parallel下head配置映射、K/V通信和小kernel启动可能抵消计算节省。确认全局head编号与配置文件一致；映射错位会同时损害质量。

每rank head数少时，逐head kernel难以占满GPU。将同pattern head批量执行、复用索引转换和避免频繁同步更重要。通信字节没有随QK tile同等下降时，多卡瓶颈转移到collective。

短序列输出异常：长度小于vertical/slash预算时，top-k参数要截断到合法范围；负slash、空集合和padding容易越界。短序列可退化dense或A-shape，但必须保持causal函数一致。

官方实现中可见对vertical/slash数量取min并设最小值等具体路径，版本变化时应以代码为准。单元测试覆盖长度1、block边界前后和采样行数大于序列。

### 19.8. Head 配置似乎完全无效

可能是patch未进入目标attention实现、模型类未支持、配置head编号错位或fallback总被触发。Profiler确认调用稀疏kernel，日志打印每层pattern与tile数。

输出与dense bitwise相同不一定是好事：候选恰好全量时合理，长序列仍完全相同且时间不降，可能走dense回退。质量与执行证据必须同时检查。

模式预算增加却质量不升：新增vertical列若落在已有tile，逻辑候选只增加块内token，目标仍不在；新增slash与旧slash高度重叠，也没有新覆盖。比较唯一token集合与唯一tile集合。

Oracle在更大预算也不升，任务可能需要另一模式或多个分散证据；online与oracle差距不变，采样统计是瓶颈。盲目扩大所有head只增加成本。

### 19.10. 模型量化后模式变化

Q/K量化改变小logit差异、列和与top-k边界，原配置的几何类型可能仍适用，动态索引具体列会变化。Value量化则主要改变输出误差，不直接改候选。

量化后重新跑dense校准与pattern搜索，区分权重量化误差和稀疏误差。两项组合可能非线性，四格消融与KV压缩类似。

RoPE 扩展后的 slash 漂移：改变RoPE scaling会改变不同距离的QK相位，重要相对位移分布可能移动。原slash配置来自旧位置方案，不能默认复用。

比较位移分数 $r_d$ 在扩展前后的峰位置与宽度。峰变宽时需要更多slash或block模式；峰整体移动时重搜offset即可。长长度校准必须采用最终位置配置。

### 19.12. 多证据任务的完整覆盖率低

单证据captured mass高，多证据答案仍错，检查每个query所需证据集合是否全部进入候选。平均覆盖率不能替代完整覆盖率，十项各95%独立召回时全部命中只有约60%。

Block-Sparse可能把同段证据一起选中，vertical/slash则对共享几何有利。按证据共现结构选择模式，比单pair top-k更贴近联合推理。

代理采样的置信度：采样行之间选出的vertical/slash一致，索引较稳定；不同子集差异大，说明pattern非平稳。可将采样行分组，计算top集合Jaccard和分数margin。

低置信head可增加采样、使用Block-Sparse或回退更保守配置。动态按置信度调整预算会增加shape变化，需验证尾延迟。

### 19.14. 校准中的 dense 参考也可能错误

百万token dense计算常采用分块或较低精度，参考若发生OOM回退、位置错误或mask错误，pattern搜索会学习错误目标。先在短长度与成熟FlashAttention对齐，再扩到长长度。

Dense参考需要相同权重、RoPE、dtype和causal mask。用另一个模型导出的attention图配置当前模型，只能作为启发，不是严格校准。

离线配置与在线索引的版本配对：配置定义某head使用VS及预算，在线代码定义如何从采样QK生成具体索引。代码更新统计符号、top-k方向或block转换后，即使JSON不变，函数也变了。

发布产物记录配置hash、代码commit和kernel版本。Prefix或编译cache同样绑定它们。跨版本A/B先跑候选金样，避免把实现变化误判为硬件波动。

### 19.16. 可观测性不能重新引入平方成本

线上计算完整dense captured mass会抵消加速。常规监控使用代理采样、tile计数、输出范数与任务指标，dense影子只覆盖极低流量和可承受长度。

调试开关若物化完整attention矩阵，显存和时延完全不同，性能数据应排除。监控本身的时间与显存也作为分项记录。

选择 dense 回退的边界：未支持模型、未知head映射、索引NaN或长度过短时，dense回退优先保证正确性。超长请求若dense会OOM，回退不可用，需要保守稀疏配置或拒绝请求。

回退策略分为请求级、层级和head级。粒度越细，保留更多加速，执行分支越复杂。质量异常通常集中少数head，head级dense可能是有效安全阀。

### 19.18. 一次完整验收的结束条件

候选金样、同mask数值对齐、短长度退化、长任务质量、分项性能、输入域验证、多卡与服务路径全部通过，才能确认部署。任何单项成功都不足以替代其余部分。

最后保存复现包：配置、权重标识、校准样本清单、dense/稀疏指标、tile统计、环境和失败样例。下一次GPU或runtime升级时，先复跑同一包，再决定是否重搜语义配置。

MInference的核心优势来自一种很具体的条件：已有dense模型的head确实呈现低维几何，代理采样能够找出这份几何，kernel又能把几何变成少量高利用率tile。三段链路逐段验证，速度和质量的来源才清楚。

Pattern 的稳定性可以量化：对同一head在不同样本上分别求最佳模式，统计A、VS、Block的频率与预算分布。若某模式占绝大多数且预算方差小，静态配置可靠；模式频繁切换，固定选择会在部分输入上失配。

还可比较每个样本的最优误差与固定配置误差，二者差距称为配置遗憾。平均遗憾小、尾部大时，动态fallback只服务少数异常样本，比全局加预算划算。

### 19.20. 列与位移的联合选择

Vertical和slash分别top-k可能在交点重复大量pair。联合目标应最大化候选并集捕获质量，而非两份独立分数和。选中一列后，该列覆盖的概率应从slash边际收益中扣除。

精确联合选择类似最大覆盖，贪心每次加入边际captured mass最大的列或位移。离线oracle可用这种方法衡量独立top-k损失；在线实现为速度通常采用分开统计。

局部窗口应从slash预算中剔除：若kernel固定保留最近窗口，小位移slash与窗口完全重叠。统计slash top-k前屏蔽已覆盖位移，可把预算用于远端结构。否则高概率局部对会垄断位移榜。

屏蔽后slash分数总量下降，top项置信度也可能低。远端没有稳定斜线时，增加slash只带来噪声，应转给vertical或block。

### 19.22. Attention sink 对 vertical 搜索的影响

开头sink列常获得大量概率，vertical top-k会自然选中。若A-shape已固定保留初始列，动态vertical再次选择这些列会重复。搜索与在线索引都应按集合并集处理。

Sink高权重未必携带语义value，却影响softmax分母。删除它可能让captured mass下降和输出重归一化，因此不能因value范数小就轻易排除。

采样 query 的分层方案：只采末尾64行偏向最终问答；均匀采全序列能看阶段变化；按chunk末尾采样兼顾局部段落。相同采样数下，分层方案覆盖更多时间区域，单一区域统计更噪。

任务输出只依赖末尾时，末尾偏置可能正合适。语言模型Prefill每个位置的hidden都会影响后续KV，则前部误差也可能传递。采样方案应对应使用目标。

### 19.24. Query 长度与 key 长度不等的情况

Cross-attention或chunked场景中，query长度 $n_q$ 与key长度 $n_k$ 不同。Vertical列仍定义在key轴，slash相对位移不再天然对应同一序列坐标，A-shape局部窗口也需重新解释。

MInference针对causal self-attention的几何不能直接迁到任意cross-attention。若应用，需重新观察矩阵模式与因果/对齐关系，不能只复用kernel接口。

Batch 内变长索引：不同样本选中的vertical/slash集合不同，批量kernel需要变长元数据或pad到最大预算。Pad索引必须标记无效，不能指向key 0，否则会重复提升开头列。

按pattern与预算分桶batch提高利用率，调度开销增加。固定每head统一预算最容易批量化，动态置信预算更节省平均工作却扩大shape方差。

### 19.26. Index top-k 的并列规则

分数相同或量化后并列时，top-k返回顺序可能随kernel、设备或版本变化。候选质量相近，复现哈希和逐token输出仍会变化。

确定性模式可用位置作为第二排序键，代价是额外排序逻辑。性能评测可允许非确定并列，质量回归要保存实际索引或设置容差。

稀疏配置与安全提示：系统提示位于开头时A-shape通常保留；模板改变或提示超过初始预算，后半规则可能不可见。安全关键约束不应只依赖经验pattern，应由确定的global/初始区域覆盖。

用冲突用户指令测试不同位置，确认系统段全部进入相关head候选。质量平均不下降，仍不能替代这类最坏输入验证。

### 19.28. Block 选择的代表向量

块均值计算便宜，可能抵消少数强token；最大池化逐维拼出不存在的向量；选中心token依赖位置。多个代表向量提高召回与索引成本。

离线比较代表方式的block oracle recall，再决定是否值得复杂化。若误差主要来自块内唯一needle，小block往往比复杂代表更直接。

Tile 排序影响 cache locality：同一tile集合按key位置排序，可让K/V读取更连续；按pattern来源分组便于分支执行。Online softmax允许任意顺序，但访存与数值舍入不同。

索引转换可以输出排序后的唯一block offset。排序成本若在CPU或产生同步，会抵消收益；GPU radix或规则生成需结合版本实测。

### 19.30. 极端稀疏时元数据占比

每个tile携带offset、count和可能的mask信息。候选很少、head dimension小，元数据读取与kernel启动相对算术占比上升。继续删tile未必继续降时延。

性能曲线出现平台时，检查固定开销而非只怀疑实现。合并head、批量索引和CUDA graph可能比提高稀疏率更有效。

校准预算的计算成本：离线搜索需要dense attention图或多次候选评估，百万长度本身昂贵。可在代表长度搜索模式类型，再在目标长度调预算；这种近似仍需少量长样本验证。

保存完整attention矩阵不可行时，流式统计列和、位移和与block分数，不落盘 $n^2$ 数据。Oracle top-k分析可能只能在较短长度完成，报告该限制。

### 19.32. 模式解释不能替代因果实验

看到vertical对应标题、slash对应段落间距很有启发，但相关性不证明模型使用该语义。遮蔽列、移动标题、打乱段落长度，再观察输出变化，才能验证。

解释用于提出反例和校准集，不应成为质量保证。最终保证来自候选覆盖、数值对齐和任务干预。

一条发布前检查清单：配置与权重绑定；输入模板和长度覆盖；每层head映射正确；候选因果且去重；物理tile统计符合预算；同mask参考通过；dense影子质量在阈值内；TTFT收益覆盖索引开销；Decode与KV行为没有被误宣称改善。

任何一项缺失，都能产生「benchmark很快、真实服务不稳」的结果。清单的价值在于把论文方法、代码路径和服务口径锁到同一版本。

### 19.34. 层归一化位置改变误差传播

Pre-Norm结构中，稀疏attention误差经残差加入主流，下一子层再次归一化；Post-Norm则先相加再归一化。相同attention输出误差在两种结构中的尺度传播不同。

模式配置从一种架构迁移到另一种时，需要重新校准。仅看head attention图相似，不代表后续网络对误差同样敏感。

Value 维度的低秩结构：候选漏掉多个key，如果对应value高度相似，输出误差可能小；概率质量相同但value彼此正交，误差更大。可在校准中计算被删value加权残差，补充captured mass。

这种指标仍是局部近似。后续输出投影和MLP会选择特定方向，端到端任务验证保持最终裁决。

### 19.36. 特殊 token 的固定保护

BOS、系统标记、文档边界和图像占位符可能对少数head重要。把它们加入必选集合，可避免动态统计因样本不足漏掉。必选边计入总预算。

特殊token数量随模板变化时，固定保护成本也变化。列表由token类型生成，比硬编码绝对位置更稳，但仍需保证causal合法。

多模态序列的二维位置：图像patch展平成一维后，slash位移可能对应图像行宽；分辨率改变，行宽位移随之改变。文本vertical与视觉block可能在同一head混合，单一模式失配。

按模态区段分别校准或使用Block-Sparse能表达二维区域。跨模态query又需要连接文本与图像，候选不能被区段隔离规则误删。

### 19.38. Head pruning 与稀疏attention的差别

某head平均贡献小，可直接剪枝；MInference保留head，只稀疏其token pair。剪head减少QKV与输出投影部分计算，稀疏pair主要减少attention矩阵工作。

两者组合时，先确认head确实冗余。把关键但低频head误剪，比给它更保守的稀疏预算更难恢复。

预热与编译时间：首次请求可能触发Triton编译、autotune和配置加载，TTFT远高于稳态。论文吞吐通常报告预热后结果，服务冷启动需要单列。

Pattern种类、head dimension与tile参数越多，编译变体越多。缓存编译产物并限制变体，可降低冷启动；不能把预热时间混进每请求索引成本。

### 19.40. 内存峰值不只来自稀疏输出

代理QK、top-k临时数组、排序索引和tile offset都会占workspace。若先生成大代理矩阵再运行kernel，峰值可能高于预期。采样行较少时代理为 $m\times n$，仍要乘head与batch。

Profiler同时记录常驻KV与临时峰值。长prompt OOM若发生在索引阶段，减少最终tile没有帮助，应分块生成统计或复用buffer。

结论应绑定 Prefill 占比：总请求时间 $T=T_{prefill}+T_{decode}+T_{other}$。MInference主要降低第一项，端到端收益上限由其占比决定。Prompt越长、输出越短，Prefill占比越高；交互生成相反。

产品流量的输入/输出长度分布比单个百万token演示更能决定收益。按请求类型加权报告，才能判断部署覆盖范围，而非用峰值加速代表全部流量。

### 19.42. 配置压缩与可读性

逐层逐head配置很大，可按共享模板加例外项压缩。压缩只影响存储，不应让多个原本不同head被错误合并。加载后展开配置的hash应与搜索产物一致。

人工审查时保留层—head热图，标出模式、预算和误差。异常单点比长JSON更容易发现，例如某层全部head意外回退dense或预算为零。

负位移与整数边界：Slash索引常用负offset表示过去位置，再转换为正距离或block起点。符号约定不一致会把过去斜线映射到未来，causal mask可能将其全部清空，表现为预算存在却没有候选。

测试offset 0、-1、最大历史距离与超界值。整数类型要覆盖百万长度，乘block size时防止32位溢出。

### 19.44. 动态预算与 CUDA Graph

每请求tile数变化会让shape和launch参数变化，CUDA Graph捕获较难复用。固定最大预算并padding元数据便于graph，执行可能计算无效tile；按预算分bucket可在复用与浪费间折中。

端到端评测应采用真实graph策略。Eager模式下稀疏kernel快，不代表服务捕获图后仍保持同样相对收益。

输出投影前的 head 拼接：每head稀疏程度不同，完成时间也不同。输出投影要等待所有head，最慢head决定同步点。平均head时间低但一个Block-Sparse热点head很慢，整层收益有限。

按pattern分组执行可减少分支，组间仍需汇合。搜索时间模型应更关注最大组与关键路径，而非简单平均每head tile。

### 19.46. 最终的可证伪陈述

一份可靠结论会写清：在哪个模型权重、输入域、长度、GPU和runtime下，哪些head采用何种pattern，候选捕获多少dense概率，索引与kernel各耗时多少，任务质量变化多少。

条件改变后，结论需要重新验证。方法提供的是一套从attention几何到GPU tile的压缩流程，不是所有长上下文模型都自动拥有的固定加速倍数。

质量预算应覆盖生成后果：Prefill hidden 的小误差会进入后续 K/V 和首个 Decode logits。Greedy decoding中，一次argmax翻转就让后续文本走向另一条轨迹；随机采样还会放大概率细微变化。逐token文本完全一致并非合理的近似目标，首步logit距离、任务答案和分布统计更稳定。

对结构化输出、代码和工具参数，单个token变化可能使结果不可用，质量阈值应更严格。长文摘要允许措辞变化，内容覆盖更重要。同一captured mass不能代表所有业务风险。

### 19.48. 稀疏收益应包含能耗与占用

时间下降通常伴随QK/PV计算减少，索引、重排和低利用率tile仍消耗能量。GPU占用率低不一定节能，可能只是kernel碎片化。测量单请求能耗、吞吐每瓦和并发下功耗，能补充延迟。

稀疏kernel占用较少SM时，也可能与其他工作重叠，提高集群吞吐。单请求最快与多租户总吞吐不是同一个优化目标，配置搜索可按部署目标选择时间函数。

方法边界落在可寻址历史：MInference仍对选中原始 K/V 做精确softmax，保留了token级可寻址性；它的近似发生在候选集合。只要目标进入候选，value没有先被压成固定摘要。这与线性状态的容量边界不同。

代价是完整历史通常仍需存储，Decode也未自动受益。它最适合长prompt Prefill这一明确阶段。把阶段、状态和近似位置说清楚，才能与其他稀疏路线组合而不重复计算或重复丢信息。

## 参考资料

- [MInference 1.0: Accelerating Pre-filling for Long-Context LLMs via Dynamic Sparse Attention](https://arxiv.org/abs/2407.02490)
- [MInference 官方实现](https://github.com/microsoft/MInference)
- [Microsoft Research: MInference](https://www.microsoft.com/en-us/research/project/minference-million-tokens-prompt-inference-for-long-context-llms/)
- [NeurIPS 2024 OpenReview 论文页](https://openreview.net/forum?id=C5Nh2UFJ9S)
